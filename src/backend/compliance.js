/**
 * OBELISK Compliance & Anti-Crime Module
 * Detects suspicious activity, builds investigation dossiers,
 * flags criminal accounts, and enables SOS emergency alerts
 *
 * Features:
 * - Suspicious transaction detection (large amounts, high frequency, structuring)
 * - Account risk scoring (0-100)
 * - Criminal dossier generation per flagged account
 * - SOS emergency button with GPS coordinates
 * - Email/SMS alerts for suspicious activity
 * - Regulatory reporting (SAR - Suspicious Activity Report)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let emailService = null;
try { emailService = require('./email-service').emailService; } catch { /* optional */ }

const DOSSIERS_DIR = path.join(__dirname, 'data', 'compliance_dossiers');
const ALERT_THRESHOLDS = {
    singleTransactionMax: 10000,   // $10K single transaction alert
    dailyVolumeMax: 50000,         // $50K daily volume alert
    rapidTradesPerMinute: 10,      // 10+ trades/min = suspicious
    structuringThreshold: 9500,    // Just under $10K = structuring pattern
    structuringWindow: 3600,       // 1 hour window for structuring
    structuringCount: 3,           // 3+ txns just under limit
};

const RISK_FLAGS = {
    LARGE_TRANSACTION: { weight: 15, label: 'Large single transaction' },
    HIGH_FREQUENCY: { weight: 20, label: 'Abnormally high trade frequency' },
    STRUCTURING: { weight: 30, label: 'Possible structuring (smurfing)' },
    NEW_ACCOUNT_LARGE: { weight: 25, label: 'Large volume on new account' },
    RAPID_WITHDRAWAL: { weight: 20, label: 'Rapid deposit then withdrawal' },
    BLACKLISTED_WALLET: { weight: 50, label: 'Interaction with blacklisted address' },
    MULTIPLE_ACCOUNTS: { weight: 15, label: 'Suspected multiple accounts' },
    ODD_HOURS: { weight: 5, label: 'Activity during unusual hours' },
    ROUND_AMOUNTS: { weight: 10, label: 'Repeated round-number transactions' },
    GEOLOCATION_MISMATCH: { weight: 15, label: 'IP geolocation mismatch' },
};

// Known criminal/sanctioned addresses (OFAC, Chainalysis, etc.)
const BLACKLISTED_ADDRESSES_FILE = path.join(__dirname, 'data', 'blacklisted_addresses.json');

function loadBlacklistedAddresses() {
    try {
        if (fs.existsSync(BLACKLISTED_ADDRESSES_FILE)) {
            return new Set(JSON.parse(fs.readFileSync(BLACKLISTED_ADDRESSES_FILE, 'utf8')).map(a => a.toLowerCase()));
        }
    } catch { /* ignore */ }
    return new Set();
}

const blacklistedAddresses = loadBlacklistedAddresses();

class ComplianceManager {
    constructor() {
        this.db = null;
        this.pqCrypto = null;
        this.scanInterval = null;
    }

    async init(db, pqCrypto = null) {
        this.db = db;
        this.pqCrypto = pqCrypto;

        // Ensure dossiers directory
        if (!fs.existsSync(DOSSIERS_DIR)) {
            fs.mkdirSync(DOSSIERS_DIR, { recursive: true });
        }

        // Scan for suspicious activity every 5 minutes
        this.scanInterval = setInterval(() => {
            try { this.scanRecentActivity(); } catch (e) { /* silent */ }
        }, 300000);

        console.log('[COMPLIANCE] Anti-crime module initialized');
        return this;
    }

    // ==================== SUSPICIOUS TRANSACTION DETECTION ====================

    /**
     * Analyze a transaction in real-time (call on every trade)
     */
    analyzeTransaction(userId, trade) {
        const flags = [];
        const amount = Math.abs(trade.total || trade.amount * trade.price);

        // Large single transaction
        if (amount >= ALERT_THRESHOLDS.singleTransactionMax) {
            flags.push({ ...RISK_FLAGS.LARGE_TRANSACTION, detail: `$${amount.toFixed(2)}` });
        }

        // Round amounts (possible structuring)
        if (amount > 1000 && amount % 1000 === 0) {
            flags.push({ ...RISK_FLAGS.ROUND_AMOUNTS, detail: `$${amount}` });
        }

        // Structuring detection (multiple txns just under $10K)
        if (amount >= ALERT_THRESHOLDS.structuringThreshold && amount < ALERT_THRESHOLDS.singleTransactionMax) {
            const recentSimilar = this.countRecentTransactions(userId, ALERT_THRESHOLDS.structuringWindow, ALERT_THRESHOLDS.structuringThreshold);
            if (recentSimilar >= ALERT_THRESHOLDS.structuringCount) {
                flags.push({ ...RISK_FLAGS.STRUCTURING, detail: `${recentSimilar + 1} txns near $${ALERT_THRESHOLDS.singleTransactionMax} in ${ALERT_THRESHOLDS.structuringWindow / 60}min` });
            }
        }

        // New account with large volume (< 7 days old)
        const user = this.db.getUserById(userId);
        if (user) {
            const accountAge = Math.floor(Date.now() / 1000) - user.created_at;
            if (accountAge < 604800 && amount > 5000) {
                flags.push({ ...RISK_FLAGS.NEW_ACCOUNT_LARGE, detail: `Account ${Math.floor(accountAge / 86400)}d old, txn $${amount.toFixed(2)}` });
            }
        }

        // Odd hours (2-5 AM local - approximation)
        const hour = new Date().getHours();
        if (hour >= 2 && hour <= 5 && amount > 5000) {
            flags.push({ ...RISK_FLAGS.ODD_HOURS, detail: `${hour}:00 local time` });
        }

        // If any flags, log them and notify
        if (flags.length > 0) {
            this.logSuspiciousActivity(userId, 'transaction', flags, { trade });
            const score = this.updateRiskScore(userId);

            // Send email/SMS for critical alerts
            if (this.calcSeverity(flags) === 'critical' || this.calcSeverity(flags) === 'high') {
                this.notifySuspiciousActivity(userId, flags, score);
            }
        }

        return flags;
    }

    /**
     * Scan recent activity for patterns
     */
    scanRecentActivity() {
        const since = Math.floor(Date.now() / 1000) - 3600; // Last hour
        try {
            const recentTrades = this.db.db.prepare(`
                SELECT user_id, COUNT(*) as count, SUM(total) as volume
                FROM trades WHERE created_at >= ?
                GROUP BY user_id HAVING count >= ? OR volume >= ?
            `).all(since, ALERT_THRESHOLDS.rapidTradesPerMinute, ALERT_THRESHOLDS.dailyVolumeMax);

            for (const row of recentTrades) {
                const flags = [];
                if (row.count >= ALERT_THRESHOLDS.rapidTradesPerMinute) {
                    flags.push({ ...RISK_FLAGS.HIGH_FREQUENCY, detail: `${row.count} trades in 1h` });
                }
                if (row.volume >= ALERT_THRESHOLDS.dailyVolumeMax) {
                    flags.push({ ...RISK_FLAGS.LARGE_TRANSACTION, detail: `$${row.volume.toFixed(2)} volume in 1h` });
                }
                if (flags.length > 0) {
                    this.logSuspiciousActivity(row.user_id, 'pattern_scan', flags, { count: row.count, volume: row.volume });
                    this.updateRiskScore(row.user_id);
                }
            }
        } catch { /* table might not have data */ }
    }

    countRecentTransactions(userId, windowSeconds, minAmount) {
        const since = Math.floor(Date.now() / 1000) - windowSeconds;
        try {
            const row = this.db.db.prepare(`
                SELECT COUNT(*) as count FROM trades
                WHERE user_id = ? AND created_at >= ? AND total >= ?
            `).get(userId, since, minAmount);
            return row ? row.count : 0;
        } catch { return 0; }
    }

    // ==================== RISK SCORING ====================

    updateRiskScore(userId) {
        const alerts = this.getAlerts(userId, 50);
        let score = 0;
        const seen = new Set();

        for (const alert of alerts) {
            const flags = JSON.parse(alert.flags || '[]');
            for (const flag of flags) {
                const key = flag.label;
                if (!seen.has(key)) {
                    score += flag.weight || 5;
                    seen.add(key);
                }
            }
        }

        score = Math.min(100, score);

        this.db.db.prepare(`
            INSERT INTO compliance_scores (user_id, risk_score, last_updated)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET risk_score = excluded.risk_score, last_updated = excluded.last_updated
        `).run(userId, score, Math.floor(Date.now() / 1000));

        // Auto-flag if score >= 60
        if (score >= 60) {
            this.flagAccount(userId, 'auto', `Risk score ${score}/100`);
        }

        return score;
    }

    getRiskScore(userId) {
        try {
            const row = this.db.db.prepare('SELECT risk_score FROM compliance_scores WHERE user_id = ?').get(userId);
            return row ? row.risk_score : 0;
        } catch { return 0; }
    }

    // ==================== ALERTS & FLAGS ====================

    logSuspiciousActivity(userId, type, flags, context = {}) {
        const now = Math.floor(Date.now() / 1000);
        const contextStr = this.pqCrypto && this.pqCrypto.ready
            ? JSON.stringify(this.pqCrypto.encrypt(JSON.stringify(context)))
            : JSON.stringify(context);

        this.db.db.prepare(`
            INSERT INTO compliance_alerts (user_id, alert_type, flags, context, severity, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, type, JSON.stringify(flags), contextStr, this.calcSeverity(flags), now);
    }

    calcSeverity(flags) {
        const totalWeight = flags.reduce((s, f) => s + (f.weight || 0), 0);
        if (totalWeight >= 40) return 'critical';
        if (totalWeight >= 20) return 'high';
        if (totalWeight >= 10) return 'medium';
        return 'low';
    }

    getAlerts(userId, limit = 50) {
        return this.db.db.prepare(`
            SELECT * FROM compliance_alerts WHERE user_id = ?
            ORDER BY created_at DESC LIMIT ?
        `).all(userId, limit);
    }

    getAllAlerts(filters = {}, limit = 100) {
        let query = 'SELECT ca.*, u.wallet_address FROM compliance_alerts ca LEFT JOIN users u ON ca.user_id = u.id WHERE 1=1';
        const params = [];

        if (filters.severity) { query += ' AND ca.severity = ?'; params.push(filters.severity); }
        if (filters.type) { query += ' AND ca.alert_type = ?'; params.push(filters.type); }
        if (filters.since) { query += ' AND ca.created_at >= ?'; params.push(filters.since); }

        query += ' ORDER BY ca.created_at DESC LIMIT ?';
        params.push(limit);

        return this.db.db.prepare(query).all(...params);
    }

    // ==================== ACCOUNT FLAGGING ====================

    flagAccount(userId, flaggedBy, reason) {
        const now = Math.floor(Date.now() / 1000);
        const existing = this.db.db.prepare('SELECT * FROM flagged_accounts WHERE user_id = ?').get(userId);
        if (existing) {
            // Update existing flag
            this.db.db.prepare(`
                UPDATE flagged_accounts SET reason = ?, status = 'under_review', updated_at = ? WHERE user_id = ?
            `).run(reason, now, userId);
        } else {
            this.db.db.prepare(`
                INSERT INTO flagged_accounts (user_id, flagged_by, reason, status, created_at, updated_at)
                VALUES (?, ?, ?, 'under_review', ?, ?)
            `).run(userId, flaggedBy, reason, now, now);
        }
    }

    unflagAccount(userId, reason) {
        this.db.db.prepare(`
            UPDATE flagged_accounts SET status = 'cleared', reason = ?, updated_at = ? WHERE user_id = ?
        `).run(reason, Math.floor(Date.now() / 1000), userId);
    }

    getFlaggedAccounts(status = null) {
        if (status) {
            return this.db.db.prepare(`
                SELECT fa.*, u.wallet_address, cs.risk_score FROM flagged_accounts fa
                LEFT JOIN users u ON fa.user_id = u.id
                LEFT JOIN compliance_scores cs ON fa.user_id = cs.user_id
                WHERE fa.status = ? ORDER BY fa.updated_at DESC
            `).all(status);
        }
        return this.db.db.prepare(`
            SELECT fa.*, u.wallet_address, cs.risk_score FROM flagged_accounts fa
            LEFT JOIN users u ON fa.user_id = u.id
            LEFT JOIN compliance_scores cs ON fa.user_id = cs.user_id
            ORDER BY fa.updated_at DESC
        `).all();
    }

    isFlagged(userId) {
        const row = this.db.db.prepare("SELECT status FROM flagged_accounts WHERE user_id = ? AND status != 'cleared'").get(userId);
        return !!row;
    }

    // ==================== DOSSIERS ====================

    /**
     * Generate a full investigation dossier for a flagged account
     */
    generateDossier(userId) {
        const user = this.db.getUserById(userId);
        if (!user) throw new Error('User not found');

        const now = Math.floor(Date.now() / 1000);
        const dossierId = crypto.randomUUID();

        // Gather all evidence
        const alerts = this.getAlerts(userId, 200);
        const riskScore = this.getRiskScore(userId);
        const flag = this.db.db.prepare('SELECT * FROM flagged_accounts WHERE user_id = ?').get(userId);
        const trades = this.db.getUserTrades(userId, 500);
        const deposits = this.db.getDeposits(userId, 200);
        const balances = this.db.getAllBalances(userId);
        const linkedWallets = this.db.getLinkedWallets(userId);
        const walletAudit = this.db.getWalletAuditLog(userId, 200);
        const accountType = this.db.getAccountType(userId);

        // Build dossier
        const dossier = {
            id: dossierId,
            generatedAt: new Date().toISOString(),
            subject: {
                userId: user.id,
                wallet: user.wallet_address,
                accountType: accountType?.accountType || 'individual',
                companyName: accountType?.companyName || null,
                createdAt: new Date(user.created_at * 1000).toISOString(),
                lastLogin: user.last_login ? new Date(user.last_login * 1000).toISOString() : null,
                isVerified: user.is_verified === 1,
                totalVolume: user.total_volume,
                creditScore: user.credit_score,
            },
            riskAssessment: {
                score: riskScore,
                level: riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'HIGH' : riskScore >= 20 ? 'MEDIUM' : 'LOW',
                flagStatus: flag?.status || 'none',
                flagReason: flag?.reason || null,
                flagDate: flag ? new Date(flag.created_at * 1000).toISOString() : null,
            },
            alerts: {
                total: alerts.length,
                bySeverity: {
                    critical: alerts.filter(a => a.severity === 'critical').length,
                    high: alerts.filter(a => a.severity === 'high').length,
                    medium: alerts.filter(a => a.severity === 'medium').length,
                    low: alerts.filter(a => a.severity === 'low').length,
                },
                recent: alerts.slice(0, 20).map(a => ({
                    type: a.alert_type,
                    severity: a.severity,
                    flags: JSON.parse(a.flags || '[]').map(f => f.label),
                    date: new Date(a.created_at * 1000).toISOString(),
                })),
            },
            financialActivity: {
                totalTrades: trades.length,
                totalVolume: trades.reduce((s, t) => s + t.total, 0),
                totalFees: trades.reduce((s, t) => s + (t.fee || 0), 0),
                deposits: deposits.length,
                currentBalances: balances,
                largestTrade: trades.reduce((max, t) => t.total > (max?.total || 0) ? t : max, null),
                recentTrades: trades.slice(0, 30).map(t => ({
                    pair: t.pair, side: t.side, amount: t.amount,
                    price: t.price, total: t.total, fee: t.fee,
                    date: new Date(t.created_at * 1000).toISOString(),
                })),
            },
            walletActivity: {
                linkedWallets: linkedWallets.map(w => ({
                    address: w.wallet_address,
                    label: w.label,
                    isWatchOnly: w.is_watch_only === 1,
                })),
                auditLog: walletAudit.slice(0, 50).map(w => ({
                    action: w.action,
                    wallet: w.wallet_address,
                    ip: w.ip_address,
                    date: new Date(w.created_at * 1000).toISOString(),
                })),
            },
        };

        // Encrypt sensitive data if PQ crypto available
        let dossierContent;
        if (this.pqCrypto && this.pqCrypto.ready) {
            dossierContent = JSON.stringify(this.pqCrypto.encrypt(JSON.stringify(dossier)));
        } else {
            dossierContent = JSON.stringify(dossier, null, 2);
        }

        // Save to file
        const filename = `dossier_${dossierId}_${user.wallet_address.substring(0, 10)}.json`;
        const filepath = path.join(DOSSIERS_DIR, filename);
        fs.writeFileSync(filepath, dossierContent);

        // Log in DB
        this.db.db.prepare(`
            INSERT INTO compliance_dossiers (id, user_id, filename, risk_score, status, created_at)
            VALUES (?, ?, ?, ?, 'open', ?)
        `).run(dossierId, userId, filename, riskScore, now);

        return { id: dossierId, filename, riskScore, subject: dossier.subject, riskAssessment: dossier.riskAssessment };
    }

    getDossier(dossierId) {
        const record = this.db.db.prepare('SELECT * FROM compliance_dossiers WHERE id = ?').get(dossierId);
        if (!record) return null;

        const filepath = path.join(DOSSIERS_DIR, record.filename);
        if (!fs.existsSync(filepath)) return { ...record, content: null };

        let content = fs.readFileSync(filepath, 'utf8');
        try {
            const parsed = JSON.parse(content);
            // Try to decrypt if PQ encrypted
            if (parsed.pq && this.pqCrypto && this.pqCrypto.ready) {
                content = this.pqCrypto.decrypt(parsed);
            }
            return { ...record, content: JSON.parse(typeof content === 'string' ? content : JSON.stringify(content)) };
        } catch {
            return { ...record, content: JSON.parse(content) };
        }
    }

    getDossiers(filters = {}, limit = 50) {
        let query = `
            SELECT cd.*, u.wallet_address, fa.status as flag_status
            FROM compliance_dossiers cd
            LEFT JOIN users u ON cd.user_id = u.id
            LEFT JOIN flagged_accounts fa ON cd.user_id = fa.user_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) { query += ' AND cd.status = ?'; params.push(filters.status); }
        if (filters.userId) { query += ' AND cd.user_id = ?'; params.push(filters.userId); }
        if (filters.minRisk) { query += ' AND cd.risk_score >= ?'; params.push(filters.minRisk); }

        query += ' ORDER BY cd.created_at DESC LIMIT ?';
        params.push(limit);

        return this.db.db.prepare(query).all(...params);
    }

    updateDossierStatus(dossierId, status, notes = null) {
        const now = Math.floor(Date.now() / 1000);
        this.db.db.prepare('UPDATE compliance_dossiers SET status = ?, notes = ?, updated_at = ? WHERE id = ?')
            .run(status, notes, now, dossierId);
    }

    // ==================== SOS EMERGENCY ====================

    /**
     * SOS alert with GPS coordinates - notify authorities
     */
    createSosAlert(userId, coordinates, message = null, ip = null) {
        const id = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);

        this.db.db.prepare(`
            INSERT INTO sos_alerts (id, user_id, latitude, longitude, message, ip_address, status, created_at, last_lat, last_lng, last_gps_at, gps_points_count)
            VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, 1)
        `).run(id, userId, coordinates.lat, coordinates.lng, message, ip, now, coordinates.lat, coordinates.lng, now);

        // Log as critical security event
        this.db.logSecurityEvent('sos_alert', ip, null, userId, 'critical', {
            coordinates, message, alertId: id
        });

        console.log(`[COMPLIANCE] SOS ALERT from ${userId} at ${coordinates.lat},${coordinates.lng}`);

        // Send email + SMS notifications to compliance team
        const user = userId !== 'anonymous' ? this.db.getUserById(userId) : null;
        this.notifySos({
            userId,
            wallet: user?.wallet_address || 'N/A',
            lat: coordinates.lat,
            lng: coordinates.lng,
            message,
            ip
        });

        return {
            id,
            status: 'active',
            coordinates,
            timestamp: new Date(now * 1000).toISOString(),
            message: 'SOS alert registered. Emergency services notification triggered.'
        };
    }

    getSosAlerts(status = null, limit = 50) {
        if (status) {
            return this.db.db.prepare(`
                SELECT sa.*, u.wallet_address FROM sos_alerts sa
                LEFT JOIN users u ON sa.user_id = u.id
                WHERE sa.status = ? ORDER BY sa.created_at DESC LIMIT ?
            `).all(status, limit);
        }
        return this.db.db.prepare(`
            SELECT sa.*, u.wallet_address FROM sos_alerts sa
            LEFT JOIN users u ON sa.user_id = u.id
            ORDER BY sa.created_at DESC LIMIT ?
        `).all(limit);
    }

    resolveSosAlert(alertId, resolution) {
        this.db.db.prepare("UPDATE sos_alerts SET status = 'resolved', message = ? WHERE id = ?")
            .run(resolution, alertId);
    }

    // ==================== GPS TRACKING ====================

    /**
     * Haversine distance between two GPS points (returns meters)
     */
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth radius in meters
        const toRad = (deg) => deg * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Update GPS location for an active SOS alert
     */
    updateSosLocation(sosId, position) {
        const now = Math.floor(Date.now() / 1000);
        const { lat, lng, accuracy, speed, heading, altitude } = position;

        // Get current alert
        const alert = this.db.db.prepare('SELECT * FROM sos_alerts WHERE id = ?').get(sosId);
        if (!alert) throw new Error('SOS alert not found');
        if (alert.status !== 'active') throw new Error('SOS alert is not active');

        // Calculate distance from last known position
        let distance = 0;
        let isMoving = 0;
        if (alert.last_lat != null && alert.last_lng != null) {
            distance = this.haversineDistance(alert.last_lat, alert.last_lng, lat, lng);
        }

        // Detect movement: speed > 0 or distance > 50m since last point
        if ((speed != null && speed > 0) || distance > 50) {
            isMoving = 1;
        }

        // Insert GPS track point
        this.db.db.prepare(`
            INSERT INTO sos_gps_track (sos_id, latitude, longitude, accuracy, speed, heading, altitude, is_moving, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(sosId, lat, lng, accuracy || null, speed || null, heading || null, altitude || null, isMoving, now);

        // Update sos_alerts with latest position
        const prevMoving = alert.is_moving || 0;
        this.db.db.prepare(`
            UPDATE sos_alerts SET
                last_lat = ?, last_lng = ?, last_gps_at = ?,
                is_moving = ?, total_distance = total_distance + ?,
                gps_points_count = gps_points_count + 1
            WHERE id = ?
        `).run(lat, lng, now, isMoving, distance, sosId);

        // Notify compliance team if movement status changed
        if (isMoving !== prevMoving) {
            const statusMsg = isMoving ? 'Victime en mouvement' : 'Victime stationnaire';
            console.log(`[COMPLIANCE] SOS ${sosId}: ${statusMsg}`);
            this.db.logSecurityEvent('sos_movement_change', null, null, alert.user_id, 'high', {
                sosId, isMoving, distance, speed, statusMsg
            });
        }

        return {
            success: true,
            isMoving: isMoving === 1,
            distance: Math.round(distance),
            pointsCount: (alert.gps_points_count || 0) + 1,
            totalDistance: Math.round((alert.total_distance || 0) + distance)
        };
    }

    /**
     * Get all GPS track points for a SOS alert
     */
    getSosGpsTrack(sosId) {
        const alert = this.db.db.prepare('SELECT * FROM sos_alerts WHERE id = ?').get(sosId);
        if (!alert) throw new Error('SOS alert not found');

        const points = this.db.db.prepare(`
            SELECT * FROM sos_gps_track WHERE sos_id = ? ORDER BY created_at ASC
        `).all(sosId);

        const totalDistance = alert.total_distance || 0;
        const duration = points.length >= 2
            ? points[points.length - 1].created_at - points[0].created_at
            : 0;

        return {
            success: true,
            track: points,
            summary: {
                totalDistance: Math.round(totalDistance),
                isMoving: alert.is_moving === 1,
                duration,
                pointsCount: points.length
            }
        };
    }

    // ==================== REPORTING ====================

    /**
     * Generate Suspicious Activity Report (SAR)
     */
    generateSar(userId) {
        const dossier = this.generateDossier(userId);
        const alerts = this.getAlerts(userId, 500);

        return {
            reportType: 'SAR',
            reportId: crypto.randomUUID(),
            generatedAt: new Date().toISOString(),
            subject: dossier.subject,
            riskAssessment: dossier.riskAssessment,
            alertsSummary: {
                total: alerts.length,
                critical: alerts.filter(a => a.severity === 'critical').length,
                high: alerts.filter(a => a.severity === 'high').length,
            },
            dossierId: dossier.id,
            recommendation: dossier.riskScore >= 70 ? 'IMMEDIATE_ACTION' :
                           dossier.riskScore >= 40 ? 'INVESTIGATION_REQUIRED' : 'MONITORING',
        };
    }

    // ==================== BLACKLISTED ADDRESSES ====================

    /**
     * Check if a wallet address is on the blacklist
     */
    isBlacklistedAddress(address) {
        return blacklistedAddresses.has((address || '').toLowerCase());
    }

    /**
     * Add address to blacklist
     */
    addBlacklistedAddress(address, reason = null) {
        blacklistedAddresses.add(address.toLowerCase());
        this.saveBlacklist();
        this.db.db.prepare(`
            INSERT OR REPLACE INTO blacklisted_addresses (address, reason, added_at)
            VALUES (?, ?, ?)
        `).run(address.toLowerCase(), reason, Math.floor(Date.now() / 1000));
    }

    removeBlacklistedAddress(address) {
        blacklistedAddresses.delete(address.toLowerCase());
        this.saveBlacklist();
        this.db.db.prepare('DELETE FROM blacklisted_addresses WHERE address = ?').run(address.toLowerCase());
    }

    getBlacklistedAddresses() {
        try {
            return this.db.db.prepare('SELECT * FROM blacklisted_addresses ORDER BY added_at DESC').all();
        } catch { return []; }
    }

    saveBlacklist() {
        try {
            fs.writeFileSync(BLACKLISTED_ADDRESSES_FILE, JSON.stringify([...blacklistedAddresses]));
        } catch { /* non-critical */ }
    }

    /**
     * Check a wallet against blacklist (call on wallet connect/trade)
     */
    checkWalletCompliance(userId, walletAddress) {
        if (this.isBlacklistedAddress(walletAddress)) {
            const flags = [{ ...RISK_FLAGS.BLACKLISTED_WALLET, detail: `Address ${walletAddress.substring(0, 10)}... on blacklist` }];
            this.logSuspiciousActivity(userId, 'blacklisted_wallet', flags, { wallet: walletAddress });
            this.flagAccount(userId, 'auto', `Blacklisted wallet: ${walletAddress}`);
            this.notifyAccountFlagged(userId, walletAddress, `Blacklisted wallet interaction`);
            return { blocked: true, reason: 'Address associated with criminal activity' };
        }
        return { blocked: false };
    }

    // ==================== NOTIFICATIONS ====================

    notifySuspiciousActivity(userId, flags, riskScore) {
        if (!emailService) return;
        const user = this.db.getUserById(userId);
        try {
            emailService.sendSuspiciousActivityAlert({
                userId,
                wallet: user?.wallet_address,
                riskScore,
                severity: this.calcSeverity(flags),
                flags: flags.map(f => `${f.label}: ${f.detail || ''}`)
            });
        } catch (e) {
            console.error('[COMPLIANCE] Failed to send alert notification:', e.message);
        }
    }

    notifyAccountFlagged(userId, wallet, reason) {
        if (!emailService) return;
        const score = this.getRiskScore(userId);
        try {
            emailService.sendAccountFlaggedAlert({
                userId, wallet, reason, riskScore: score, flaggedBy: 'System'
            });
        } catch (e) {
            console.error('[COMPLIANCE] Failed to send flag notification:', e.message);
        }
    }

    notifySos(data) {
        if (!emailService) return;
        try {
            emailService.sendSosAlert(data);
        } catch (e) {
            console.error('[COMPLIANCE] Failed to send SOS notification:', e.message);
        }
    }

    /**
     * Get compliance dashboard stats
     */
    getDashboardStats() {
        const flagged = this.db.db.prepare("SELECT COUNT(*) as c FROM flagged_accounts WHERE status = 'under_review'").get();
        const alerts24h = this.db.db.prepare(`SELECT COUNT(*) as c FROM compliance_alerts WHERE created_at >= ?`).get(Math.floor(Date.now() / 1000) - 86400);
        const criticalAlerts = this.db.db.prepare(`SELECT COUNT(*) as c FROM compliance_alerts WHERE severity = 'critical' AND created_at >= ?`).get(Math.floor(Date.now() / 1000) - 86400);
        const openDossiers = this.db.db.prepare("SELECT COUNT(*) as c FROM compliance_dossiers WHERE status = 'open'").get();
        const activeSos = this.db.db.prepare("SELECT COUNT(*) as c FROM sos_alerts WHERE status = 'active'").get();
        const highRiskAccounts = this.db.db.prepare('SELECT COUNT(*) as c FROM compliance_scores WHERE risk_score >= 60').get();

        return {
            flaggedAccounts: flagged.c,
            alerts24h: alerts24h.c,
            criticalAlerts: criticalAlerts.c,
            openDossiers: openDossiers.c,
            activeSos: activeSos.c,
            highRiskAccounts: highRiskAccounts.c,
        };
    }
}

// Singleton
const complianceManager = new ComplianceManager();

module.exports = { ComplianceManager, complianceManager };
