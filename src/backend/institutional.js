/**
 * OBELISK Institutional Manager V1.0
 * Multi-account teams, scoped API keys, webhooks, compliance reports, treasury management
 *
 * Pattern: Same as venue-capital.js - class with constructor + init(db)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'institutional_state.json');
const ROLE_HIERARCHY = { owner: 4, admin: 3, trader: 2, viewer: 1 };
const TIER_LIMITS = {
    starter: { maxMembers: 5, totalCapitalLimit: 50000 },
    professional: { maxMembers: 25, totalCapitalLimit: 500000 },
    enterprise: { maxMembers: 100, totalCapitalLimit: 5000000 }
};

class InstitutionalManager {
    constructor() {
        this.db = null;
        this.dcaInterval = null;
        this.budgetInterval = null;
    }

    /**
     * Initialize with DB singleton, launch schedulers
     */
    init(db) {
        this.db = db;

        // Start DCA scheduler (every 60s)
        this.dcaInterval = setInterval(() => {
            try { this.executePendingDcas(); } catch (e) { /* silent */ }
        }, 60000);

        // Start budget reset scheduler (every hour)
        this.budgetInterval = setInterval(() => {
            try { this.resetDailyBudgets(); } catch (e) { /* silent */ }
        }, 3600000);

        console.log('[INSTITUTIONAL] Manager initialized');
        return this;
    }

    // ==================== ORGANIZATIONS ====================

    createOrg(ownerId, name, tier = 'starter') {
        const id = crypto.randomUUID();
        const limits = TIER_LIMITS[tier] || TIER_LIMITS.starter;
        const now = Math.floor(Date.now() / 1000);

        this.db.db.prepare(`
            INSERT INTO organizations (id, name, owner_id, tier, max_members, total_capital_limit, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, name, ownerId, tier, limits.maxMembers, limits.totalCapitalLimit, now);

        // Add owner as first member
        this.db.db.prepare(`
            INSERT INTO org_members (org_id, user_id, role, position_limit, capital_allocation, daily_loss_limit, joined_at)
            VALUES (?, ?, 'owner', 100, 0, 0, ?)
        `).run(id, ownerId, now);

        this.logAudit(ownerId, id, 'org.created', 'organization', id, { name, tier });
        return { id, name, owner_id: ownerId, tier, max_members: limits.maxMembers, total_capital_limit: limits.totalCapitalLimit, created_at: now };
    }

    getOrg(orgId) {
        return this.db.db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId);
    }

    getOrgByUser(userId) {
        const membership = this.db.db.prepare(`
            SELECT om.*, o.* FROM org_members om
            JOIN organizations o ON om.org_id = o.id
            WHERE om.user_id = ?
        `).get(userId);
        return membership || null;
    }

    updateOrg(orgId, updates) {
        const fields = [];
        const values = [];
        if (updates.name) { fields.push('name = ?'); values.push(updates.name); }
        if (updates.tier) {
            const limits = TIER_LIMITS[updates.tier];
            if (limits) {
                fields.push('tier = ?', 'max_members = ?', 'total_capital_limit = ?');
                values.push(updates.tier, limits.maxMembers, limits.totalCapitalLimit);
            }
        }
        if (fields.length === 0) return null;
        values.push(orgId);
        this.db.db.prepare(`UPDATE organizations SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        return this.getOrg(orgId);
    }

    // ==================== MEMBERS ====================

    addMember(orgId, userId, role = 'trader', limits = {}) {
        const now = Math.floor(Date.now() / 1000);
        this.db.db.prepare(`
            INSERT INTO org_members (org_id, user_id, role, position_limit, capital_allocation, daily_loss_limit, joined_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(orgId, userId, role, limits.positionLimit || 10, limits.capitalAllocation || 0, limits.dailyLossLimit || 0, now);

        this.logAudit(userId, orgId, 'member.added', 'member', userId, { role });
    }

    removeMember(orgId, userId) {
        const member = this.db.db.prepare('SELECT role FROM org_members WHERE org_id = ? AND user_id = ?').get(orgId, userId);
        if (member && member.role === 'owner') throw new Error('Cannot remove org owner');

        this.db.db.prepare('DELETE FROM org_members WHERE org_id = ? AND user_id = ?').run(orgId, userId);
        this.logAudit(userId, orgId, 'member.removed', 'member', userId, {});
    }

    updateMemberRole(orgId, userId, role) {
        if (!ROLE_HIERARCHY[role]) throw new Error('Invalid role');
        this.db.db.prepare('UPDATE org_members SET role = ? WHERE org_id = ? AND user_id = ?').run(role, orgId, userId);
        this.logAudit(userId, orgId, 'member.role_changed', 'member', userId, { role });
    }

    updateMemberLimits(orgId, userId, limits) {
        const fields = [];
        const values = [];
        if (limits.positionLimit !== undefined) { fields.push('position_limit = ?'); values.push(limits.positionLimit); }
        if (limits.capitalAllocation !== undefined) { fields.push('capital_allocation = ?'); values.push(limits.capitalAllocation); }
        if (limits.dailyLossLimit !== undefined) { fields.push('daily_loss_limit = ?'); values.push(limits.dailyLossLimit); }
        if (fields.length === 0) return;
        values.push(orgId, userId);
        this.db.db.prepare(`UPDATE org_members SET ${fields.join(', ')} WHERE org_id = ? AND user_id = ?`).run(...values);
    }

    getMembers(orgId) {
        return this.db.db.prepare(`
            SELECT om.*, u.wallet_address FROM org_members om
            LEFT JOIN users u ON om.user_id = u.id
            WHERE om.org_id = ?
            ORDER BY CASE om.role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 WHEN 'trader' THEN 3 ELSE 4 END
        `).all(orgId);
    }

    getUserOrg(userId) {
        const row = this.db.db.prepare(`
            SELECT om.role, o.* FROM org_members om
            JOIN organizations o ON om.org_id = o.id
            WHERE om.user_id = ?
        `).get(userId);
        if (!row) return null;
        return { org: { id: row.id, name: row.name, tier: row.tier, max_members: row.max_members, total_capital_limit: row.total_capital_limit }, role: row.role };
    }

    getMember(orgId, userId) {
        return this.db.db.prepare('SELECT * FROM org_members WHERE org_id = ? AND user_id = ?').get(orgId, userId);
    }

    // ==================== INVITES ====================

    createInvite(orgId, walletAddress, role, invitedBy) {
        const id = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = now + 7 * 24 * 3600; // 7 days

        this.db.db.prepare(`
            INSERT INTO org_invites (id, org_id, wallet_address, role, invited_by, status, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
        `).run(id, orgId, walletAddress.toLowerCase(), role, invitedBy, expiresAt, now);

        this.logAudit(invitedBy, orgId, 'invite.created', 'invite', id, { wallet: walletAddress, role });
        return { id, org_id: orgId, wallet_address: walletAddress.toLowerCase(), role, status: 'pending', expires_at: expiresAt };
    }

    acceptInvite(inviteId, userId) {
        const invite = this.db.db.prepare('SELECT * FROM org_invites WHERE id = ? AND status = ?').get(inviteId, 'pending');
        if (!invite) throw new Error('Invite not found or already used');

        const now = Math.floor(Date.now() / 1000);
        if (invite.expires_at < now) throw new Error('Invite expired');

        // Check user wallet matches invite
        const user = this.db.getUserById(userId);
        if (!user || user.wallet_address !== invite.wallet_address) {
            throw new Error('Wallet address does not match invite');
        }

        // Add member
        this.addMember(invite.org_id, userId, invite.role);

        // Mark invite as accepted
        this.db.db.prepare("UPDATE org_invites SET status = 'accepted' WHERE id = ?").run(inviteId);
        this.logAudit(userId, invite.org_id, 'invite.accepted', 'invite', inviteId, {});
    }

    cancelInvite(inviteId) {
        this.db.db.prepare("UPDATE org_invites SET status = 'cancelled' WHERE id = ?").run(inviteId);
    }

    getPendingInvites(orgId) {
        const now = Math.floor(Date.now() / 1000);
        return this.db.db.prepare(`
            SELECT * FROM org_invites WHERE org_id = ? AND status = 'pending' AND expires_at > ?
            ORDER BY created_at DESC
        `).all(orgId, now);
    }

    // ==================== SCOPED API KEYS ====================

    createScopedKey(userId, orgId, name, scopes = [], tier = 'basic', ipWhitelist = null, expiresIn = null) {
        const apiKey = 'obl_' + crypto.randomBytes(32).toString('hex');
        const prefix = apiKey.substring(0, 12);
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = expiresIn ? now + expiresIn : null;

        // Use the auth.js api_keys table
        this.db.db.prepare(`
            INSERT INTO api_keys (api_key, bot_id, bot_name, permissions, created_at, is_active, org_id, scopes, rate_limit_tier, ip_whitelist, expires_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
        `).run(apiKey, `org_${orgId}_${crypto.randomBytes(4).toString('hex')}`, name, JSON.stringify(scopes), now, orgId, JSON.stringify(scopes), tier, ipWhitelist, expiresAt);

        this.logAudit(userId, orgId, 'apikey.created', 'api_key', prefix, { name, scopes, tier });
        return { key: apiKey, prefix, name, scopes, tier, expires_at: expiresAt };
    }

    getOrgKeys(orgId) {
        return this.db.db.prepare(`
            SELECT api_key, bot_id, bot_name, permissions, created_at, last_used, requests, is_active, org_id, scopes, rate_limit_tier, ip_whitelist, expires_at
            FROM api_keys WHERE org_id = ? AND is_active = 1
        `).all(orgId).map(k => ({
            ...k,
            preview: k.api_key.substring(0, 12) + '...',
            scopes: k.scopes ? JSON.parse(k.scopes) : [],
            api_key: undefined // Don't expose full key
        }));
    }

    revokeKey(keyId, orgId) {
        this.db.db.prepare("UPDATE api_keys SET is_active = 0 WHERE bot_id = ? AND org_id = ?").run(keyId, orgId);
    }

    getKeyUsageStats(keyPrefix, days = 7) {
        const since = Math.floor(Date.now() / 1000) - days * 86400;
        const rows = this.db.db.prepare(`
            SELECT endpoint, method, COUNT(*) as count, AVG(response_time_ms) as avg_time
            FROM api_usage_log WHERE api_key_prefix = ? AND created_at >= ?
            GROUP BY endpoint, method ORDER BY count DESC
        `).all(keyPrefix, since);

        const total = this.db.db.prepare(`
            SELECT COUNT(*) as requests FROM api_usage_log WHERE api_key_prefix = ? AND created_at >= ?
        `).get(keyPrefix, since);

        return { requests: total.requests, endpoints: rows };
    }

    // ==================== WEBHOOKS ====================

    registerWebhook(userId, orgId, url, events = [], pnlThreshold = null) {
        const id = crypto.randomUUID();
        const secret = crypto.randomBytes(32).toString('hex');
        const now = Math.floor(Date.now() / 1000);

        this.db.db.prepare(`
            INSERT INTO webhooks (id, user_id, org_id, url, secret, events, pnl_threshold, is_active, fail_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
        `).run(id, userId, orgId, url, secret, JSON.stringify(events), pnlThreshold, now);

        this.logAudit(userId, orgId, 'webhook.created', 'webhook', id, { url, events });
        return { id, url, secret, events, pnl_threshold: pnlThreshold, is_active: 1 };
    }

    getWebhooks(orgId) {
        return this.db.db.prepare('SELECT * FROM webhooks WHERE org_id = ? ORDER BY created_at DESC').all(orgId).map(w => ({
            ...w,
            events: JSON.parse(w.events || '[]'),
            secret: w.secret.substring(0, 8) + '...'
        }));
    }

    updateWebhook(webhookId, updates) {
        const fields = [];
        const values = [];
        if (updates.url) { fields.push('url = ?'); values.push(updates.url); }
        if (updates.events) { fields.push('events = ?'); values.push(JSON.stringify(updates.events)); }
        if (updates.pnlThreshold !== undefined) { fields.push('pnl_threshold = ?'); values.push(updates.pnlThreshold); }
        if (updates.isActive !== undefined) { fields.push('is_active = ?'); values.push(updates.isActive ? 1 : 0); }
        if (fields.length === 0) return;
        values.push(webhookId);
        this.db.db.prepare(`UPDATE webhooks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    deleteWebhook(webhookId) {
        this.db.db.prepare('DELETE FROM webhooks WHERE id = ?').run(webhookId);
    }

    async triggerWebhook(event, payload) {
        const webhooks = this.db.db.prepare("SELECT * FROM webhooks WHERE is_active = 1 AND fail_count < 10").all();
        for (const wh of webhooks) {
            const events = JSON.parse(wh.events || '[]');
            if (events.length > 0 && !events.includes(event)) continue;

            // Fire-and-forget with HMAC signature
            const body = JSON.stringify({ event, data: payload, timestamp: Date.now() });
            const signature = crypto.createHmac('sha256', wh.secret).update(body).digest('hex');

            try {
                const response = await fetch(wh.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Obelisk-Signature': signature },
                    body,
                    signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) {
                    this.db.db.prepare('UPDATE webhooks SET fail_count = fail_count + 1 WHERE id = ?').run(wh.id);
                } else {
                    this.db.db.prepare('UPDATE webhooks SET fail_count = 0 WHERE id = ?').run(wh.id);
                }
            } catch {
                this.db.db.prepare('UPDATE webhooks SET fail_count = fail_count + 1 WHERE id = ?').run(wh.id);
            }
        }
    }

    async testWebhook(webhookId) {
        const wh = this.db.db.prepare('SELECT * FROM webhooks WHERE id = ?').get(webhookId);
        if (!wh) throw new Error('Webhook not found');

        const body = JSON.stringify({ event: 'test', data: { message: 'Obelisk webhook test' }, timestamp: Date.now() });
        const signature = crypto.createHmac('sha256', wh.secret).update(body).digest('hex');

        try {
            const response = await fetch(wh.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Obelisk-Signature': signature },
                body,
                signal: AbortSignal.timeout(5000)
            });
            return { success: response.ok, status: response.status };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // ==================== REPORTS ====================

    getPnlReport(orgId, period = 'daily', from = null, to = null) {
        const members = this.getMembers(orgId);
        const userIds = members.map(m => m.user_id);
        if (userIds.length === 0) return { totalPnl: 0, trades: 0, fees: 0, winRate: 0 };

        const now = Math.floor(Date.now() / 1000);
        if (!from) {
            const periods = { daily: 86400, weekly: 604800, monthly: 2592000 };
            from = now - (periods[period] || 86400);
        }
        if (!to) to = now;

        const placeholders = userIds.map(() => '?').join(',');
        const trades = this.db.db.prepare(`
            SELECT * FROM trades WHERE user_id IN (${placeholders}) AND created_at >= ? AND created_at <= ?
            ORDER BY created_at DESC
        `).all(...userIds, from, to);

        let totalPnl = 0, totalFees = 0, wins = 0;
        for (const t of trades) {
            const pnl = t.side === 'buy' ? -t.total : t.total;
            totalPnl += pnl;
            totalFees += t.fee || 0;
            if (pnl > 0) wins++;
        }

        return {
            totalPnl: Math.round(totalPnl * 100) / 100,
            trades: trades.length,
            fees: Math.round(totalFees * 100) / 100,
            winRate: trades.length > 0 ? Math.round(wins / trades.length * 100) : 0,
            period, from, to
        };
    }

    getTradesCsv(orgId, from = null, to = null, pair = null) {
        const members = this.getMembers(orgId);
        const userIds = members.map(m => m.user_id);
        if (userIds.length === 0) return 'id,user,pair,side,amount,price,total,fee,date\n';

        const now = Math.floor(Date.now() / 1000);
        if (!from) from = now - 2592000;
        if (!to) to = now;

        const placeholders = userIds.map(() => '?').join(',');
        let query = `SELECT t.*, u.wallet_address FROM trades t LEFT JOIN users u ON t.user_id = u.id WHERE t.user_id IN (${placeholders}) AND t.created_at >= ? AND t.created_at <= ?`;
        const params = [...userIds, from, to];

        if (pair) {
            query += ' AND t.pair = ?';
            params.push(pair);
        }
        query += ' ORDER BY t.created_at DESC';

        const trades = this.db.db.prepare(query).all(...params);

        let csv = 'id,wallet,pair,side,amount,price,total,fee,date\n';
        for (const t of trades) {
            const date = new Date(t.created_at * 1000).toISOString();
            const wallet = t.wallet_address ? t.wallet_address.substring(0, 10) + '...' : '';
            csv += `${t.id},${wallet},${t.pair},${t.side},${t.amount},${t.price},${t.total},${t.fee},${date}\n`;
        }
        return csv;
    }

    getTaxReport(orgId, year) {
        const from = Math.floor(new Date(`${year}-01-01`).getTime() / 1000);
        const to = Math.floor(new Date(`${year}-12-31T23:59:59`).getTime() / 1000);

        const members = this.getMembers(orgId);
        const userIds = members.map(m => m.user_id);
        if (userIds.length === 0) return { realizedGains: 0, realizedLosses: 0, net: 0, year, tradeCount: 0 };

        const placeholders = userIds.map(() => '?').join(',');
        const trades = this.db.db.prepare(`
            SELECT * FROM trades WHERE user_id IN (${placeholders}) AND created_at >= ? AND created_at <= ?
        `).all(...userIds, from, to);

        let gains = 0, losses = 0;
        for (const t of trades) {
            const pnl = t.side === 'sell' ? t.total - t.fee : -(t.total + t.fee);
            if (pnl > 0) gains += pnl;
            else losses += Math.abs(pnl);
        }

        return {
            realizedGains: Math.round(gains * 100) / 100,
            realizedLosses: Math.round(losses * 100) / 100,
            net: Math.round((gains - losses) * 100) / 100,
            year,
            tradeCount: trades.length
        };
    }

    // ==================== AUDIT ====================

    logAudit(userId, orgId, action, resourceType, resourceId, details, ip = null) {
        try {
            this.db.db.prepare(`
                INSERT INTO audit_trail (user_id, org_id, action, resource_type, resource_id, details, ip_address, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(userId, orgId, action, resourceType, resourceId, JSON.stringify(details || {}), ip, Math.floor(Date.now() / 1000));
        } catch { /* non-critical */ }
    }

    getAuditTrail(orgId, filters = {}, limit = 50) {
        let query = 'SELECT * FROM audit_trail WHERE org_id = ?';
        const params = [orgId];

        if (filters.action) { query += ' AND action = ?'; params.push(filters.action); }
        if (filters.userId) { query += ' AND user_id = ?'; params.push(filters.userId); }
        if (filters.resourceType) { query += ' AND resource_type = ?'; params.push(filters.resourceType); }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        return this.db.db.prepare(query).all(...params).map(row => ({
            ...row,
            details: JSON.parse(row.details || '{}')
        }));
    }

    // ==================== TREASURY ====================

    getAllocations(orgId) {
        return this.db.db.prepare('SELECT * FROM capital_allocations WHERE org_id = ? ORDER BY allocated_amount DESC').all(orgId);
    }

    allocateCapital(orgId, strategy, amount) {
        const id = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);
        this.db.db.prepare(`
            INSERT INTO capital_allocations (id, org_id, strategy, allocated_amount, current_value, pnl, last_updated)
            VALUES (?, ?, ?, ?, ?, 0, ?)
        `).run(id, orgId, strategy, amount, amount, now);

        this.logAudit(null, orgId, 'treasury.allocated', 'allocation', id, { strategy, amount });
        return { id, org_id: orgId, strategy, allocated_amount: amount, current_value: amount, pnl: 0 };
    }

    updateAllocation(id, currentValue) {
        const alloc = this.db.db.prepare('SELECT * FROM capital_allocations WHERE id = ?').get(id);
        if (!alloc) throw new Error('Allocation not found');
        const pnl = currentValue - alloc.allocated_amount;
        const now = Math.floor(Date.now() / 1000);
        this.db.db.prepare('UPDATE capital_allocations SET current_value = ?, pnl = ?, last_updated = ? WHERE id = ?').run(currentValue, pnl, now, id);
    }

    deleteAllocation(id) {
        this.db.db.prepare('DELETE FROM capital_allocations WHERE id = ?').run(id);
    }

    getTreasuryOverview(orgId) {
        const allocations = this.getAllocations(orgId);
        let totalAum = 0, totalPnl = 0;
        for (const a of allocations) {
            totalAum += a.current_value;
            totalPnl += a.pnl;
        }
        return {
            totalAum: Math.round(totalAum * 100) / 100,
            totalPnl: Math.round(totalPnl * 100) / 100,
            allocations
        };
    }

    // ==================== DCA ====================

    createDca(orgId, userId, token, amountPerInterval, intervalSeconds) {
        const id = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);
        const nextExecution = now + intervalSeconds;

        this.db.db.prepare(`
            INSERT INTO dca_schedules (id, org_id, user_id, token, amount_per_interval, interval_seconds, next_execution, total_invested, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?)
        `).run(id, orgId, userId, token, amountPerInterval, intervalSeconds, nextExecution, now);

        this.logAudit(userId, orgId, 'dca.created', 'dca', id, { token, amountPerInterval, intervalSeconds });
        return { id, token, amount_per_interval: amountPerInterval, interval_seconds: intervalSeconds, next_execution: nextExecution, is_active: 1, total_invested: 0 };
    }

    getDcaSchedules(orgId) {
        return this.db.db.prepare('SELECT * FROM dca_schedules WHERE org_id = ? ORDER BY created_at DESC').all(orgId);
    }

    toggleDca(scheduleId, active) {
        this.db.db.prepare('UPDATE dca_schedules SET is_active = ? WHERE id = ?').run(active ? 1 : 0, scheduleId);
    }

    deleteDca(scheduleId) {
        this.db.db.prepare('DELETE FROM dca_schedules WHERE id = ?').run(scheduleId);
    }

    executePendingDcas() {
        const now = Math.floor(Date.now() / 1000);
        const pending = this.db.db.prepare('SELECT * FROM dca_schedules WHERE is_active = 1 AND next_execution <= ?').all(now);

        for (const dca of pending) {
            // Update total invested & next execution
            const nextExecution = now + dca.interval_seconds;
            this.db.db.prepare(`
                UPDATE dca_schedules SET total_invested = total_invested + ?, next_execution = ? WHERE id = ?
            `).run(dca.amount_per_interval, nextExecution, dca.id);

            this.logAudit(dca.user_id, dca.org_id, 'dca.executed', 'dca', dca.id, {
                token: dca.token,
                amount: dca.amount_per_interval
            });
        }
        return pending.length;
    }

    // ==================== BUDGET ====================

    setBudgetLimits(orgId, userId, limits) {
        this.db.db.prepare(`
            INSERT INTO budget_limits (org_id, user_id, daily_limit, weekly_limit, monthly_limit, spent_today, spent_week, spent_month)
            VALUES (?, ?, ?, ?, ?, 0, 0, 0)
            ON CONFLICT(org_id, user_id) DO UPDATE SET
                daily_limit = excluded.daily_limit,
                weekly_limit = excluded.weekly_limit,
                monthly_limit = excluded.monthly_limit
        `).run(orgId, userId, limits.daily || 0, limits.weekly || 0, limits.monthly || 0);
    }

    checkBudget(orgId, userId, amount) {
        const budget = this.db.db.prepare('SELECT * FROM budget_limits WHERE org_id = ? AND user_id = ?').get(orgId, userId);
        if (!budget) return { allowed: true, remaining: { daily: Infinity, weekly: Infinity, monthly: Infinity } };

        const dailyRemaining = budget.daily_limit > 0 ? budget.daily_limit - budget.spent_today : Infinity;
        const weeklyRemaining = budget.weekly_limit > 0 ? budget.weekly_limit - budget.spent_week : Infinity;
        const monthlyRemaining = budget.monthly_limit > 0 ? budget.monthly_limit - budget.spent_month : Infinity;

        const allowed = amount <= dailyRemaining && amount <= weeklyRemaining && amount <= monthlyRemaining;
        return { allowed, remaining: { daily: dailyRemaining, weekly: weeklyRemaining, monthly: monthlyRemaining } };
    }

    recordSpending(orgId, userId, amount) {
        this.db.db.prepare(`
            UPDATE budget_limits SET spent_today = spent_today + ?, spent_week = spent_week + ?, spent_month = spent_month + ?
            WHERE org_id = ? AND user_id = ?
        `).run(amount, amount, amount, orgId, userId);
    }

    getBudgets(orgId) {
        return this.db.db.prepare(`
            SELECT bl.*, u.wallet_address FROM budget_limits bl
            LEFT JOIN users u ON bl.user_id = u.id
            WHERE bl.org_id = ?
        `).all(orgId);
    }

    resetDailyBudgets() {
        const now = new Date();
        // Reset daily at midnight
        if (now.getHours() === 0) {
            this.db.db.prepare('UPDATE budget_limits SET spent_today = 0').run();
        }
        // Reset weekly on Monday
        if (now.getDay() === 1 && now.getHours() === 0) {
            this.db.db.prepare('UPDATE budget_limits SET spent_week = 0').run();
        }
        // Reset monthly on 1st
        if (now.getDate() === 1 && now.getHours() === 0) {
            this.db.db.prepare('UPDATE budget_limits SET spent_month = 0').run();
        }
    }
}

// Singleton
const institutionalManager = new InstitutionalManager();

module.exports = { InstitutionalManager, institutionalManager };
