/**
 * OBELISK Alerts Routes V1.0
 * GET  /api/alerts/feed          - Get alert feed (paginated)
 * GET  /api/alerts/stats         - Stats + thresholds
 * POST /api/alerts/read          - Mark as read
 * POST /api/alerts/threshold     - Update threshold (e.g. +1%/-1%)
 * POST /api/alerts/test          - Fire a test alert
 * DELETE /api/alerts             - Clear all
 */

const express = require('express');
const router = express.Router();
const { getAlertService, TYPES } = require('../alerts');

function svc() { return getAlertService(); }

/**
 * GET /api/alerts/feed
 * Query: limit, unreadOnly, type, since
 */
router.get('/feed', (req, res) => {
    try {
        const opts = {
            limit: Math.min(200, parseInt(req.query.limit || 50)),
            unreadOnly: req.query.unreadOnly === 'true',
            type: req.query.type || null,
            since: parseInt(req.query.since || 0)
        };
        res.json({ success: true, ...svc().getFeed(opts) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/alerts/stats
 */
router.get('/stats', (req, res) => {
    try {
        res.json({ success: true, stats: svc().getStats() });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * POST /api/alerts/read
 * Body: { ids: ['a1','a2'] } or { ids: 'all' }
 */
router.post('/read', (req, res) => {
    try {
        const count = svc().markRead(req.body.ids || 'all');
        res.json({ success: true, marked: count });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * POST /api/alerts/threshold
 * Body: { key: 'price_up', value: 1.5 }
 */
router.post('/threshold', (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) return res.status(400).json({ error: 'key and value required' });
        const ok = svc().setThreshold(key, parseFloat(value));
        if (!ok) return res.status(400).json({ error: `Unknown threshold key: ${key}` });
        res.json({ success: true, key, value: parseFloat(value) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * POST /api/alerts/test
 * Body: { type?, symbol?, pnlPct? }
 * Fires a test alert to verify the system
 */
router.post('/test', (req, res) => {
    try {
        const { type = 'price_spike', symbol = 'BTC/USDT', pnlPct = 1.2 } = req.body;

        let alert;
        if (type === 'pnl') {
            alert = svc().push(TYPES.PNL_POSITIVE, {
                id: 'test',
                name: 'Test Position',
                pnlPct,
                pnlUSD: (1 * pnlPct / 100).toFixed(4),
                capital: 1,
                message: `TEST: Position +${pnlPct}% PnL`,
                severity: 'low',
                color: 'green'
            });
        } else if (type === 'price_drop') {
            alert = svc().push(TYPES.PRICE_DROP, {
                symbol,
                pct: -1.3,
                price: 95000,
                prevPrice: 96300,
                message: `TEST: ${symbol} -1.3% drop`,
                severity: 'medium',
                color: 'red'
            });
        } else {
            alert = svc().push(TYPES.PRICE_SPIKE, {
                symbol,
                pct: 1.5,
                price: 97440,
                prevPrice: 96000,
                message: `TEST: ${symbol} +1.5% spike`,
                severity: 'medium',
                color: 'green'
            });
        }

        res.json({ success: true, alert: alert || { note: 'Debounced (fired too recently)' } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * DELETE /api/alerts
 */
router.delete('/', (req, res) => {
    try {
        svc().clearAll();
        res.json({ success: true, message: 'All alerts cleared' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
