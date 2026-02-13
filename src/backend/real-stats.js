/**
 * OBELISK Real Statistics Module
 * Tracks real users, visitors, and platform metrics using Cloudflare KV
 */

class RealStats {
    constructor(env) {
        this.users = env.OBELISK_USERS;
        this.stats = env.OBELISK_STATS;
    }

    // Keys
    static KEYS = {
        TOTAL_VISITORS: 'stats:visitors:total',
        DAILY_VISITORS: (date) => `stats:visitors:daily:${date}`,
        TOTAL_USERS: 'stats:users:total',
        ACTIVE_USERS: 'stats:users:active',
        TOTAL_VOLUME: 'stats:volume:total',
        DAILY_VOLUME: (date) => `stats:volume:daily:${date}`,
        USER_PREFIX: 'user:',
        SESSION_PREFIX: 'session:',
        VISIT_PREFIX: 'visit:'
    };

    // Track a page visit (anonymous)
    async trackVisit(request) {
        const today = new Date().toISOString().split('T')[0];
        const visitorId = this.getVisitorId(request);

        // Increment total visitors (unique by day)
        const visitKey = RealStats.KEYS.VISIT_PREFIX + today + ':' + visitorId;
        const existingVisit = await this.stats.get(visitKey);

        if (!existingVisit) {
            // New visitor today
            await this.stats.put(visitKey, '1', { expirationTtl: 86400 * 7 }); // 7 days

            // Increment daily count
            const dailyKey = RealStats.KEYS.DAILY_VISITORS(today);
            const dailyCount = parseInt(await this.stats.get(dailyKey) || '0');
            await this.stats.put(dailyKey, String(dailyCount + 1), { expirationTtl: 86400 * 90 });

            // Increment total
            const totalKey = RealStats.KEYS.TOTAL_VISITORS;
            const totalCount = parseInt(await this.stats.get(totalKey) || '0');
            await this.stats.put(totalKey, String(totalCount + 1));
        }

        return { tracked: true, isNewVisitor: !existingVisit };
    }

    // Get visitor ID from request (fingerprint-free, privacy-respecting)
    getVisitorId(request) {
        const ip = request.headers.get('cf-connecting-ip') || 'unknown';
        const ua = request.headers.get('user-agent') || 'unknown';
        // Simple hash without storing PII
        return this.simpleHash(ip + ua.substring(0, 20));
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // Register a new user (wallet connected)
    async registerUser(walletAddress, metadata = {}) {
        const wallet = walletAddress.toLowerCase();
        const userKey = RealStats.KEYS.USER_PREFIX + wallet;
        const existingUser = await this.users.get(userKey);

        if (existingUser) {
            // Update last seen
            const user = JSON.parse(existingUser);
            user.lastSeen = Date.now();
            user.visits = (user.visits || 0) + 1;
            await this.users.put(userKey, JSON.stringify(user));
            return { isNew: false, user };
        }

        // New user
        const user = {
            wallet: wallet,
            createdAt: Date.now(),
            lastSeen: Date.now(),
            visits: 1,
            type: metadata.type || 'retail', // retail, institutional, bot
            country: metadata.country || 'unknown',
            referrer: metadata.referrer || 'direct'
        };

        await this.users.put(userKey, JSON.stringify(user));

        // Increment total users
        const totalUsers = parseInt(await this.stats.get(RealStats.KEYS.TOTAL_USERS) || '0');
        await this.stats.put(RealStats.KEYS.TOTAL_USERS, String(totalUsers + 1));

        return { isNew: true, user };
    }

    // Track user activity (for active user count)
    async trackUserActivity(walletAddress) {
        const today = new Date().toISOString().split('T')[0];
        const wallet = walletAddress.toLowerCase();
        const activeKey = 'stats:active:' + today + ':' + wallet;

        const wasActive = await this.stats.get(activeKey);
        if (!wasActive) {
            await this.stats.put(activeKey, '1', { expirationTtl: 86400 });

            // Increment daily active users
            const dauKey = 'stats:dau:' + today;
            const dau = parseInt(await this.stats.get(dauKey) || '0');
            await this.stats.put(dauKey, String(dau + 1), { expirationTtl: 86400 * 30 });
        }
    }

    // Track trading volume
    async trackVolume(amount, pair) {
        const today = new Date().toISOString().split('T')[0];

        // Daily volume
        const dailyKey = RealStats.KEYS.DAILY_VOLUME(today);
        const dailyVolume = parseFloat(await this.stats.get(dailyKey) || '0');
        await this.stats.put(dailyKey, String(dailyVolume + amount), { expirationTtl: 86400 * 90 });

        // Total volume
        const totalVolume = parseFloat(await this.stats.get(RealStats.KEYS.TOTAL_VOLUME) || '0');
        await this.stats.put(RealStats.KEYS.TOTAL_VOLUME, String(totalVolume + amount));

        // Per-pair volume
        const pairKey = 'stats:volume:pair:' + today + ':' + pair;
        const pairVolume = parseFloat(await this.stats.get(pairKey) || '0');
        await this.stats.put(pairKey, String(pairVolume + amount), { expirationTtl: 86400 * 30 });
    }

    // Get all real stats
    async getStats() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const [
            totalVisitors,
            todayVisitors,
            yesterdayVisitors,
            totalUsers,
            todayActiveUsers,
            totalVolume,
            todayVolume
        ] = await Promise.all([
            this.stats.get(RealStats.KEYS.TOTAL_VISITORS),
            this.stats.get(RealStats.KEYS.DAILY_VISITORS(today)),
            this.stats.get(RealStats.KEYS.DAILY_VISITORS(yesterday)),
            this.stats.get(RealStats.KEYS.TOTAL_USERS),
            this.stats.get('stats:dau:' + today),
            this.stats.get(RealStats.KEYS.TOTAL_VOLUME),
            this.stats.get(RealStats.KEYS.DAILY_VOLUME(today))
        ]);

        return {
            visitors: {
                total: parseInt(totalVisitors || '0'),
                today: parseInt(todayVisitors || '0'),
                yesterday: parseInt(yesterdayVisitors || '0')
            },
            users: {
                total: parseInt(totalUsers || '0'),
                activeToday: parseInt(todayActiveUsers || '0')
            },
            volume: {
                total: parseFloat(totalVolume || '0'),
                today: parseFloat(todayVolume || '0')
            },
            timestamp: Date.now(),
            isReal: true // Flag to indicate these are real stats
        };
    }

    // Get user details
    async getUser(walletAddress) {
        const wallet = walletAddress.toLowerCase();
        const userKey = RealStats.KEYS.USER_PREFIX + wallet;
        const userData = await this.users.get(userKey);
        return userData ? JSON.parse(userData) : null;
    }

    // List recent users (for admin)
    async listRecentUsers(limit = 50) {
        const users = [];
        const list = await this.users.list({ prefix: RealStats.KEYS.USER_PREFIX, limit });

        for (const key of list.keys) {
            const userData = await this.users.get(key.name);
            if (userData) {
                users.push(JSON.parse(userData));
            }
        }

        return users.sort((a, b) => b.lastSeen - a.lastSeen);
    }
}

module.exports = { RealStats };
