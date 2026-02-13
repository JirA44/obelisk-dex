/**
 * OBELISK Authentication Module
 * Sign-In With Ethereum (SIWE) style authentication
 * With multi-wallet support and security monitoring
 */

const crypto = require('crypto');
const { ethers } = require('ethers');
const db = require('./database');
const { securityMonitor, EVENT_TYPES, SEVERITY } = require('./security-monitor');
const { twoFactorAuth } = require('./twofa');

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
    async verifySignature(walletAddress, signature, nonce, ip = null) {
        const address = walletAddress.toLowerCase();

        // Check pending auth exists
        const pending = this.pendingAuth.get(nonce);
        if (!pending) {
            securityMonitor.logEvent(EVENT_TYPES.INVALID_NONCE, {
                ip, wallet: address, severity: SEVERITY.MEDIUM,
                details: { reason: 'Nonce expired or not found' }
            });
            throw new Error('Nonce expired or invalid');
        }

        // SECURITY: Immediately consume nonce to prevent replay attacks
        this.pendingAuth.delete(nonce);

        if (pending.walletAddress !== address) {
            securityMonitor.logEvent(EVENT_TYPES.INVALID_SIGNATURE, {
                ip, wallet: address, severity: SEVERITY.HIGH,
                details: { reason: 'Wallet address mismatch', expected: pending.walletAddress }
            });
            throw new Error('Wallet address mismatch');
        }

        // Check nonce not too old (5 min max)
        if (Date.now() - pending.timestamp > 5 * 60 * 1000) {
            securityMonitor.logEvent(EVENT_TYPES.INVALID_NONCE, {
                ip, wallet: address, severity: SEVERITY.LOW,
                details: { reason: 'Nonce expired', age: Date.now() - pending.timestamp }
            });
            throw new Error('Nonce expired');
        }

        // Get user and verify nonce matches
        const user = db.getUserByWallet(address);
        if (!user || user.nonce !== nonce) {
            securityMonitor.logEvent(EVENT_TYPES.INVALID_NONCE, {
                ip, wallet: address, severity: SEVERITY.MEDIUM,
                details: { reason: 'Nonce mismatch in DB' }
            });
            throw new Error('Invalid nonce');
        }

        // SECURITY: Invalidate DB nonce immediately (one-time use)
        db.updateNonce(user.id);

        // Verify signature using the stored original message
        const message = pending.message;

        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);

            if (recoveredAddress.toLowerCase() !== address) {
                securityMonitor.logEvent(EVENT_TYPES.INVALID_SIGNATURE, {
                    ip, wallet: address, userId: user.id, severity: SEVERITY.HIGH,
                    details: { reason: 'Recovered address mismatch', recovered: recoveredAddress.toLowerCase() }
                });
                throw new Error('Signature verification failed');
            }
        } catch (e) {
            securityMonitor.logEvent(EVENT_TYPES.INVALID_SIGNATURE, {
                ip, wallet: address, severity: SEVERITY.HIGH,
                details: { reason: 'Signature verification error', error: e.message }
            });
            throw new Error('Invalid signature: ' + e.message);
        }

        // Update login time
        db.updateUserLogin(user.id);

        // Create session token
        const sessionToken = db.createSession(user.id);

        // Check if 2FA is enabled
        const has2FA = twoFactorAuth.isEnabled(user.id);

        return {
            success: true,
            token: sessionToken,
            requires2FA: has2FA,
            user: {
                id: user.id,
                wallet: user.wallet_address,
                creditScore: user.credit_score,
                isVerified: user.is_verified === 1,
                has2FA
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

    // ==================== MULTI-WALLET SUPPORT ====================

    /**
     * Link a new wallet to user account (requires SIWE verification)
     */
    async linkWallet(userId, walletAddress, signature, nonce, ip = null, label = null) {
        const address = walletAddress.toLowerCase();

        // Verify the signature for the new wallet
        const pending = this.pendingAuth.get(nonce);
        if (!pending || pending.walletAddress !== address) {
            securityMonitor.logEvent(EVENT_TYPES.INVALID_SIGNATURE, {
                ip, wallet: address, userId, severity: SEVERITY.HIGH,
                details: { action: 'link_wallet', reason: 'Invalid nonce' }
            });
            throw new Error('Invalid nonce or wallet mismatch');
        }

        this.pendingAuth.delete(nonce);

        // Verify signature
        try {
            const recoveredAddress = ethers.verifyMessage(pending.message, signature);
            if (recoveredAddress.toLowerCase() !== address) {
                securityMonitor.logEvent(EVENT_TYPES.INVALID_SIGNATURE, {
                    ip, wallet: address, userId, severity: SEVERITY.HIGH,
                    details: { action: 'link_wallet', reason: 'Signature mismatch' }
                });
                throw new Error('Signature verification failed');
            }
        } catch (e) {
            throw new Error('Invalid signature: ' + e.message);
        }

        // Check if wallet is already linked to another user
        const existingUser = db.getUserByWallet(address);
        if (existingUser && existingUser.id !== userId) {
            throw new Error('Wallet already linked to another account');
        }

        // Link the wallet
        const success = db.linkWallet(userId, address, label, false);
        if (!success) {
            throw new Error('Wallet already linked to this account');
        }

        // Audit log
        db.logWalletAudit(userId, address, 'linked', ip);

        return { success: true, wallet: address, label };
    }

    /**
     * Add a watch-only wallet (no signature required - just reading blockchain)
     */
    addWatchOnlyWallet(userId, walletAddress, label = null, ip = null) {
        const address = walletAddress.toLowerCase();

        if (!ethers.isAddress(address)) {
            throw new Error('Invalid wallet address');
        }

        const success = db.linkWallet(userId, address, label || 'Watch Only', true);
        if (!success) {
            throw new Error('Wallet already linked');
        }

        // Audit log
        db.logWalletAudit(userId, address, 'added_watch_only', ip);

        return { success: true, wallet: address, isWatchOnly: true };
    }

    /**
     * Unlink a wallet from user account
     */
    unlinkWallet(userId, walletAddress, ip = null) {
        const address = walletAddress.toLowerCase();

        // Check it's not the primary user wallet
        const user = db.getUserById(userId);
        if (user && user.wallet_address === address) {
            throw new Error('Cannot unlink primary account wallet');
        }

        const success = db.unlinkWallet(userId, address);
        if (!success) {
            throw new Error('Wallet not found or already unlinked');
        }

        // Audit log
        db.logWalletAudit(userId, address, 'unlinked', ip);

        return { success: true, wallet: address };
    }

    /**
     * Get all wallets linked to a user
     */
    getLinkedWallets(userId) {
        const wallets = db.getLinkedWallets(userId);
        const user = db.getUserById(userId);

        // Add the main user wallet if not in linked_wallets
        const mainWallet = user?.wallet_address;
        const hasMain = wallets.some(w => w.wallet_address === mainWallet);

        if (mainWallet && !hasMain) {
            wallets.unshift({
                wallet_address: mainWallet,
                label: 'Primary',
                is_primary: 1,
                is_watch_only: 0,
                linked_at: user.created_at
            });
        }

        return wallets.map(w => ({
            address: w.wallet_address,
            label: w.label,
            isPrimary: w.is_primary === 1,
            isWatchOnly: w.is_watch_only === 1,
            balanceSnapshot: w.balance_snapshot ? JSON.parse(w.balance_snapshot) : null,
            lastActivity: w.last_activity,
            linkedAt: w.linked_at
        }));
    }

    /**
     * Set primary wallet for trading
     */
    setPrimaryWallet(userId, walletAddress, ip = null) {
        const address = walletAddress.toLowerCase();

        // Check wallet is linked and not watch-only
        const wallets = db.getLinkedWallets(userId);
        const wallet = wallets.find(w => w.wallet_address === address);

        if (!wallet) {
            // Check if it's the main user wallet
            const user = db.getUserById(userId);
            if (user?.wallet_address !== address) {
                throw new Error('Wallet not linked to this account');
            }
        } else if (wallet.is_watch_only) {
            throw new Error('Cannot set watch-only wallet as primary');
        }

        db.setPrimaryWallet(userId, address);
        db.logWalletAudit(userId, address, 'set_primary', ip);

        return { success: true, primaryWallet: address };
    }

    /**
     * Update wallet balance snapshot (for watch-only wallets)
     */
    updateWalletSnapshot(userId, walletAddress, balanceSnapshot) {
        db.updateWalletSnapshot(userId, walletAddress, balanceSnapshot);
    }

    /**
     * Get wallet audit log
     */
    getWalletAuditLog(userId, limit = 50) {
        return db.getWalletAuditLog(userId, limit);
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
    RateLimiter,
    securityMonitor,
    twoFactorAuth,
    EVENT_TYPES,
    SEVERITY
};
