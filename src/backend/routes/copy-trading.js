/**
 * OBELISK Copy-Trading Routes V1.0
 * GET /api/copy-trading/leaderboard
 * GET /api/copy-trading/managers/:id
 * GET /api/copy-trading/featured
 * GET /api/copy-trading/stats
 * POST /api/copy-trading/copy
 * DELETE /api/copy-trading/copy/:managerId
 * GET /api/copy-trading/my-copies
 */

const express = require('express');
const router = express.Router();
const { getCopyTradingService } = require('../copy-trading');

let service = null;

function initCopyTradingRoutes() {
    service = getCopyTradingService();
    console.log('[CopyTrading] Routes initialized, managers:', Object.keys(service.managers).length);
}

// Middleware: ensure service ready
router.use((req, res, next) => {
    if (!service) service = getCopyTradingService();
    next();
});

/**
 * GET /api/copy-trading/leaderboard
 * Query params: sort, order, riskLevel, minROI, minFollowers, verified, tags, limit, offset
 */
router.get('/leaderboard', (req, res) => {
    try {
        const opts = {
            sort: req.query.sort || 'totalROI',
            order: req.query.order || 'desc',
            riskLevel: req.query.riskLevel || null,
            minROI: parseFloat(req.query.minROI || 0),
            minFollowers: parseInt(req.query.minFollowers || 0),
            verified: req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : null,
            tags: req.query.tags ? req.query.tags.split(',') : [],
            limit: Math.min(50, parseInt(req.query.limit || 20)),
            offset: parseInt(req.query.offset || 0)
        };

        const result = service.getLeaderboard(opts);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('[CopyTrading] leaderboard error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/copy-trading/managers/:id
 */
router.get('/managers/:id', (req, res) => {
    try {
        const manager = service.getManager(req.params.id);
        if (!manager) return res.status(404).json({ error: 'Manager not found' });
        res.json({ success: true, manager });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/copy-trading/featured
 */
router.get('/featured', (req, res) => {
    try {
        const featured = service.getFeatured();
        res.json({ success: true, featured });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/copy-trading/stats
 */
router.get('/stats', (req, res) => {
    try {
        const stats = service.getStats();
        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/copy-trading/copy
 * Body: { managerId, amount, userId }
 */
router.post('/copy', (req, res) => {
    try {
        const { managerId, amount, userId = 'default' } = req.body;
        if (!managerId || !amount) {
            return res.status(400).json({ error: 'managerId and amount required' });
        }
        const result = service.startCopy(userId, managerId, parseFloat(amount));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/copy-trading/copy/:managerId
 * Query: userId
 */
router.delete('/copy/:managerId', (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const result = service.stopCopy(userId, req.params.managerId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/copy-trading/my-copies
 * Query: userId
 */
router.get('/my-copies', (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const copies = service.getMyCopies(userId);
        res.json({ success: true, copies, count: copies.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { router, initCopyTradingRoutes };
