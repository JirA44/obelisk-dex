/**
 * OBELISK Authentication Module
 * Sign-In With Ethereum (SIWE) style authentication
 */

const crypto = require('crypto');
const { ethers } = require('ethers');
const db = require('./database');

class AuthSystem {
    constructor() {
        this.pendingAuth = new Map(); // nonce -> { walletAddress, timestamp }
    }

    /**
     * Step 1: Get nonce for wallet
     * Client calls this first to get a message to sign
     */
    getNonce(walletAddress) {
        if (!ethers.isAddress(walletAddress)) {
            throw new Error('Invalid wallet address');
        }

        const address = walletAddress.toLowerCase();

        // Get or create user
        let user = db.getUserByWallet(address);
        if (!user) {
            user = db.createUser(address);
        } else {
            // Generate new nonce
            user.nonce = db.updateNonce(user.id);
        }

        const message = this.createSignMessage(address, user.nonce);

        // Store pending auth with the original message
        this.pendingAuth.set(user.nonce, {
            walletAddress: address,
            timestamp: Date.now(),
            message: message  // Store original message for verification
        });

        // Clean old pending auths (> 5 min)
        this.cleanPendingAuths();

        return {
            message,
            nonce: user.nonce
        };
    }

    /**
     * Create the message to be signed
     */
    createSignMessage(walletAddress, nonce) {
        const domain = 'obelisk.exchange';
        const timestamp = new Date().toISOString();

        return `Welcome to Obelisk DEX!

Sign this message to authenticate.

Wallet: ${walletAddress}
Nonce: ${nonce}
Domain: ${domain}
Timestamp: ${timestamp}

This signature does not trigger any blockchain transaction or cost any gas fees.`;
    }

    /**
     * Step 2: Verify signature and create session
     * Client signs the message and sends signature back
     */
    async verifySignature(walletAddress, signature, nonce) {
        const address = walletAddress.toLowerCase();

        // Check pending auth exists
        const pending = this.pendingAuth.get(nonce);
        if (!pending) {
            throw new Error('Nonce expired or invalid');
        }

        // SECURITY: Immediately consume nonce to prevent replay attacks
        this.pendingAuth.delete(nonce);

        if (pending.walletAddress !== address) {
            throw new Error('Wallet address mismatch');
        }

        // Check nonce not too old (5 min max)
        if (Date.now() - pending.timestamp > 5 * 60 * 1000) {
            throw new Error('Nonce expired');
        }

        // Get user and verify nonce matches
        const user = db.getUserByWallet(address);
        if (!user || user.nonce !== nonce) {
            throw new Error('Invalid nonce');
        }

        // SECURITY: Invalidate DB nonce immediately (one-time use)
        db.updateNonce(user.id);

        // Verify signature using the stored original message
        const message = pending.message;

        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);

            if (recoveredAddress.toLowerCase() !== address) {
                throw new Error('Signature verification failed');
            }
        } catch (e) {
            throw new Error('Invalid signature: ' + e.message);
        }

        // Update login time
        db.updateUserLogin(user.id);

        // Create session token
        const sessionToken = db.createSession(user.id);

        return {
            success: true,
            token: sessionToken,
            user: {
                id: user.id,
                wallet: user.wallet_address,
                creditScore: user.credit_score,
                isVerified: user.is_verified === 1
            }
        };
    }

    /**
     * Middleware to validate session token
     */
    validateToken(token) {
        if (!token) {
            return null;
        }

        const session = db.validateSession(token);
        if (!session) {
            return null;
        }

        return {
            userId: session.user_id,
            wallet: session.wallet_address
        };
    }

    /**
     * Logout - invalidate session
     */
    logout(token) {
        db.deleteSession(token);
    }

    /**
     * Clean expired pending authentications
     */
    cleanPendingAuths() {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minutes

        for (const [nonce, data] of this.pendingAuth.entries()) {
            if (now - data.timestamp > maxAge) {
                this.pendingAuth.delete(nonce);
            }
        }
    }

    /**
     * Express middleware for protected routes
     */
    requireAuth(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authentication token' });
        }

        const token = authHeader.substring(7);
        const session = this.validateToken(token);

        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = session;
        next();
    }
}

// Rate limiter simple
class RateLimiter {
    constructor(windowMs = 60000, maxRequests = 100) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.requests = new Map();
    }

    isAllowed(key) {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        // Get or create request array for key
        let reqs = this.requests.get(key) || [];

        // Filter out old requests
        reqs = reqs.filter(t => t > windowStart);

        if (reqs.length >= this.maxRequests) {
            this.requests.set(key, reqs);
            return false;
        }

        reqs.push(now);
        this.requests.set(key, reqs);
        return true;
    }

    middleware(keyFn = (req) => req.ip) {
        return (req, res, next) => {
            const key = keyFn(req);

            if (!this.isAllowed(key)) {
                return res.status(429).json({
                    error: 'Too many requests',
                    retryAfter: Math.ceil(this.windowMs / 1000)
                });
            }

            next();
        };
    }

    // Clean old entries periodically
    cleanup() {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        for (const [key, reqs] of this.requests.entries()) {
            const filtered = reqs.filter(t => t > windowStart);
            if (filtered.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, filtered);
            }
        }
    }
}

const auth = new AuthSystem();

// Rate limiters for different endpoints
const rateLimiters = {
    general: new RateLimiter(60000, 100),      // 100 req/min
    auth: new RateLimiter(60000, 10),           // 10 req/min for auth
    trade: new RateLimiter(1000, 10),           // 10 req/sec for trades
    withdraw: new RateLimiter(60000, 5)         // 5 req/min for withdrawals
};

// Cleanup every minute
setInterval(() => {
    Object.values(rateLimiters).forEach(rl => rl.cleanup());
}, 60000);

module.exports = {
    auth,
    rateLimiters,
    RateLimiter
};
