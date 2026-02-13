/**
 * OBELISK SECURITY MODULE
 * Anti-hacking protections for platform and users
 */

const crypto = require('crypto');

class SecurityModule {
    constructor() {
        // Rate limiting storage
        this.rateLimits = new Map();
        this.blockedIPs = new Set();
        this.suspiciousActivity = new Map();
        this.auditLog = [];

        // Configuration
        this.config = {
            // Rate limiting
            maxRequestsPerMinute: 60,
            maxLoginAttempts: 5,
            maxAPICallsPerMinute: 100,
            blockDuration: 15 * 60 * 1000, // 15 minutes

            // Suspicious thresholds
            suspiciousThreshold: 10,
            bruteforceThreshold: 3,

            // Session
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            maxConcurrentSessions: 5
        };

        // Cleanup interval
        setInterval(() => this.cleanup(), 60000);

        console.log('[SECURITY] Module initialized');
    }

    // ===============================
    // RATE LIMITING
    // ===============================

    checkRateLimit(ip, endpoint = 'global') {
        const key = `${ip}:${endpoint}`;
        const now = Date.now();

        if (this.blockedIPs.has(ip)) {
            this.logAudit('BLOCKED_REQUEST', ip, { endpoint, reason: 'IP blocked' });
            return { allowed: false, reason: 'IP temporarily blocked' };
        }

        if (!this.rateLimits.has(key)) {
            this.rateLimits.set(key, { count: 1, windowStart: now });
            return { allowed: true };
        }

        const limit = this.rateLimits.get(key);

        // Reset window if expired
        if (now - limit.windowStart > 60000) {
            this.rateLimits.set(key, { count: 1, windowStart: now });
            return { allowed: true };
        }

        limit.count++;

        if (limit.count > this.config.maxRequestsPerMinute) {
            this.flagSuspicious(ip, 'rate_limit_exceeded');
            this.logAudit('RATE_LIMIT_EXCEEDED', ip, { endpoint, count: limit.count });
            return { allowed: false, reason: 'Too many requests', retryAfter: 60 };
        }

        return { allowed: true, remaining: this.config.maxRequestsPerMinute - limit.count };
    }

    // ===============================
    // BRUTE FORCE PROTECTION
    // ===============================

    trackLoginAttempt(ip, wallet, success) {
        const key = `login:${ip}:${wallet}`;

        if (!this.rateLimits.has(key)) {
            this.rateLimits.set(key, { attempts: [], lastSuccess: null });
        }

        const tracker = this.rateLimits.get(key);
        const now = Date.now();

        // Remove attempts older than 15 minutes
        tracker.attempts = tracker.attempts.filter(t => now - t < this.config.blockDuration);

        if (success) {
            tracker.lastSuccess = now;
            tracker.attempts = [];
            this.logAudit('LOGIN_SUCCESS', ip, { wallet: this.maskWallet(wallet) });
            return { allowed: true };
        }

        tracker.attempts.push(now);
        this.logAudit('LOGIN_FAILED', ip, { wallet: this.maskWallet(wallet), attempts: tracker.attempts.length });

        if (tracker.attempts.length >= this.config.maxLoginAttempts) {
            this.blockIP(ip, 'brute_force');
            return {
                allowed: false,
                reason: 'Too many failed attempts. Please try again in 15 minutes.',
                blocked: true
            };
        }

        return {
            allowed: true,
            remainingAttempts: this.config.maxLoginAttempts - tracker.attempts.length
        };
    }

    // ===============================
    // INPUT VALIDATION & SANITIZATION
    // ===============================

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        // Remove potential XSS
        let sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/eval\s*\(/gi, '')
            .replace(/expression\s*\(/gi, '');

        // Escape special chars
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');

        return sanitized;
    }



    // Recursively sanitize all string values in an object (XSS protection)
    sanitizeObject(obj) {
        if (typeof obj === 'string') {
            return this.sanitizeInput(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = this.sanitizeObject(value);
            }
            return sanitized;
        }
        return obj;
    }

    validateWalletAddress(address) {
        if (!address || typeof address !== 'string') {
            return { valid: false, reason: 'Invalid address format' };
        }

        // Ethereum address validation
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return { valid: false, reason: 'Invalid Ethereum address' };
        }

        return { valid: true };
    }

    validateAmount(amount) {
        const num = parseFloat(amount);

        if (isNaN(num) || num < 0) {
            return { valid: false, reason: 'Invalid amount' };
        }

        if (num > 1000000000) {
            return { valid: false, reason: 'Amount too large' };
        }

        return { valid: true, amount: num };
    }

    validateAPIRequest(req) {
        const issues = [];

        // Check for SQL injection patterns
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
            /(--|\*|;)/,
            /(\bOR\b\s+\d+\s*=\s*\d+)/i,
            /(\bAND\b\s+\d+\s*=\s*\d+)/i
        ];

        const checkValue = (val, path) => {
            if (typeof val === 'string') {
                for (const pattern of sqlPatterns) {
                    if (pattern.test(val)) {
                        issues.push({ path, issue: 'Potential SQL injection' });
                        return false;
                    }
                }
            }
            return true;
        };

        // Check body
        if (req.body) {
            Object.entries(req.body).forEach(([key, val]) => {
                checkValue(val, `body.${key}`);
            });
        }

        // Check query params
        if (req.query) {
            Object.entries(req.query).forEach(([key, val]) => {
                checkValue(val, `query.${key}`);
            });
        }

        if (issues.length > 0) {
            this.flagSuspicious(req.ip, 'sql_injection_attempt');
            this.logAudit('SECURITY_THREAT', req.ip, { type: 'sql_injection', issues });
        }

        return { valid: issues.length === 0, issues };
    }

    // ===============================
    // CSRF PROTECTION
    // ===============================

    generateCSRFToken(sessionId) {
        const token = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(sessionId + token).digest('hex');
        return { token, hash };
    }

    validateCSRFToken(sessionId, token, hash) {
        const expectedHash = crypto.createHash('sha256').update(sessionId + token).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
    }

    // ===============================
    // SIGNATURE VERIFICATION
    // ===============================

    generateNonce() {
        return crypto.randomBytes(32).toString('hex');
    }

    createSignatureMessage(wallet, nonce) {
        return `Sign this message to authenticate with Obelisk DEX.\n\nWallet: ${wallet}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
    }

    // ===============================
    // SUSPICIOUS ACTIVITY TRACKING
    // ===============================

    flagSuspicious(ip, reason) {
        if (!this.suspiciousActivity.has(ip)) {
            this.suspiciousActivity.set(ip, { flags: [], score: 0 });
        }

        const activity = this.suspiciousActivity.get(ip);
        activity.flags.push({ reason, timestamp: Date.now() });

        // Score based on severity
        const scores = {
            'rate_limit_exceeded': 2,
            'sql_injection_attempt': 10,
            'brute_force': 8,
            'invalid_signature': 5,
            'suspicious_pattern': 3
        };

        activity.score += scores[reason] || 1;

        if (activity.score >= this.config.suspiciousThreshold) {
            this.blockIP(ip, 'suspicious_activity');
        }

        this.logAudit('SUSPICIOUS_ACTIVITY', ip, { reason, totalScore: activity.score });
    }

    blockIP(ip, reason) {
        this.blockedIPs.add(ip);
        this.logAudit('IP_BLOCKED', ip, { reason });

        // Auto-unblock after duration
        setTimeout(() => {
            this.blockedIPs.delete(ip);
            this.logAudit('IP_UNBLOCKED', ip, { after: this.config.blockDuration });
        }, this.config.blockDuration);
    }

    // ===============================
    // AUDIT LOGGING
    // ===============================

    logAudit(event, ip, details = {}) {
        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            event,
            ip: ip ? this.maskIP(ip) : 'unknown',
            details,
        };

        this.auditLog.push(entry);

        // Keep last 10000 entries
        if (this.auditLog.length > 10000) {
            this.auditLog = this.auditLog.slice(-10000);
        }

        // Log critical events
        const criticalEvents = ['IP_BLOCKED', 'SECURITY_THREAT', 'BRUTE_FORCE'];
        if (criticalEvents.some(e => event.includes(e))) {
            console.log(`[SECURITY ALERT] ${event}:`, JSON.stringify(details));
        }

        return entry;
    }

    getAuditLog(filter = {}) {
        let logs = [...this.auditLog];

        if (filter.event) {
            logs = logs.filter(l => l.event.includes(filter.event));
        }

        if (filter.since) {
            logs = logs.filter(l => new Date(l.timestamp) > new Date(filter.since));
        }

        if (filter.limit) {
            logs = logs.slice(-filter.limit);
        }

        return logs;
    }

    // ===============================
    // HELPERS
    // ===============================

    maskIP(ip) {
        if (!ip) return 'unknown';
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.xxx.xxx`;
        }
        return ip.substring(0, ip.length / 2) + '...';
    }

    maskWallet(wallet) {
        if (!wallet) return 'unknown';
        return wallet.substring(0, 6) + '...' + wallet.substring(wallet.length - 4);
    }

    cleanup() {
        const now = Date.now();

        // Clean old rate limits
        for (const [key, val] of this.rateLimits.entries()) {
            if (val.windowStart && now - val.windowStart > 120000) {
                this.rateLimits.delete(key);
            }
        }

        // Clean old suspicious activity
        for (const [ip, activity] of this.suspiciousActivity.entries()) {
            activity.flags = activity.flags.filter(f => now - f.timestamp < 3600000);
            if (activity.flags.length === 0) {
                this.suspiciousActivity.delete(ip);
            }
        }
    }

    // ===============================
    // EXPRESS MIDDLEWARE
    // ===============================

    middleware() {
        return (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';

            // Check if IP is blocked
            if (this.blockedIPs.has(ip)) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'Your IP has been temporarily blocked due to suspicious activity'
                });
            }

            // Rate limiting
            const rateCheck = this.checkRateLimit(ip, req.path);
            if (!rateCheck.allowed) {
                res.set('Retry-After', rateCheck.retryAfter || 60);
                return res.status(429).json({
                    error: 'Too many requests',
                    message: rateCheck.reason,
                    retryAfter: rateCheck.retryAfter
                });
            }

            // Validate request
            const validation = this.validateAPIRequest(req);
            if (!validation.valid) {
                return res.status(400).json({
                    error: 'Invalid request',
                    issues: validation.issues
                });
            }

            // AUTO-SANITIZE all request body inputs (XSS protection)
            if (req.body && typeof req.body === 'object') {
                req.body = this.sanitizeObject(req.body);
            }
            if (req.query && typeof req.query === 'object') {
                req.query = this.sanitizeObject(req.query);
            }

            // Add security headers
            res.set({
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
                'Referrer-Policy': 'strict-origin-when-cross-origin'
            });

            // Attach security methods to request
            req.security = {
                ip,
                sanitize: (input) => this.sanitizeInput(input),
                validateWallet: (addr) => this.validateWalletAddress(addr),
                validateAmount: (amt) => this.validateAmount(amt)
            };

            next();
        };
    }

    // Login middleware
    loginMiddleware() {
        return (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress;
            const wallet = req.body?.wallet_address;

            // Check login rate limit
            const key = `login:${ip}`;
            const check = this.checkRateLimit(ip, 'login');

            if (!check.allowed) {
                return res.status(429).json({
                    error: 'Too many login attempts',
                    message: 'Please wait before trying again'
                });
            }

            req.trackLogin = (success) => this.trackLoginAttempt(ip, wallet, success);
            next();
        };
    }

    // ===============================
    // STATS & MONITORING
    // ===============================

    getStats() {
        return {
            blockedIPs: this.blockedIPs.size,
            activeRateLimits: this.rateLimits.size,
            suspiciousIPs: this.suspiciousActivity.size,
            auditLogSize: this.auditLog.length,
            recentThreats: this.auditLog
                .filter(l => l.event.includes('THREAT') || l.event.includes('BLOCKED'))
                .slice(-10)
        };
    }
}

// Singleton export
const security = new SecurityModule();

module.exports = { SecurityModule, security };
