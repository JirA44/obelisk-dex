/**
 * OBELISK Strategy Routes V1.0
 * GET /api/strategies/list         - Browse 10K strategies
 * GET /api/strategies/stats        - Summary stats
 * GET /api/strategies/top          - Top by grade S/A/B
 * GET /api/strategies/:id          - Single strategy detail
 * GET /api/strategies/filters      - Available filters
 */

const express = require('express');
const router = express.Router();
const { getStrategyGenerator, INDICATORS, TIMEFRAMES, VENUES, RISK_CONFIGS } = require('../strategy-generator');

let gen = null;
function getGen() {
    if (!gen) gen = getStrategyGenerator();
    return gen;
}

/**
 * GET /api/strategies/stats
 */
router.get('/stats', (req, res) => {
    try {
        const stats = getGen().getStats();
        res.json({ success: true, stats });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/strategies/top
 */
router.get('/top', (req, res) => {
    try {
        const top = getGen().getTopByGrade();
        res.json({ success: true, ...top });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/strategies/filters
 */
router.get('/filters', (req, res) => {
    res.json({
        success: true,
        indicators: INDICATORS.map(i => ({ id: i.id, name: i.name })),
        timeframes: TIMEFRAMES,
        venues: VENUES.map(v => ({ id: v.id, name: v.name, makerFee: v.makerFee, takerFee: v.takerFee })),
        riskConfigs: RISK_CONFIGS.map(r => ({ label: r.label, sl: r.sl, tp: r.tp, rr: r.rr })),
        grades: ['S', 'A', 'B', 'C', 'F'],
        sortOptions: ['monthlyROI', 'dailyROI', 'winRate', 'sharpe', 'trades', 'ev', 'maxDD', 'rr']
    });
});

/**
 * GET /api/strategies/list
 * Query: sort, order, grade, indicator, timeframe, venue, direction,
 *        minWR, minROI, maxDD, minCapital, limit, offset, search, profitable
 */
router.get('/list', (req, res) => {
    try {
        const opts = {
            sort: req.query.sort || 'monthlyROI',
            order: req.query.order || 'desc',
            grade: req.query.grade || null,
            profitable: req.query.profitable === 'true' ? true : req.query.profitable === 'false' ? false : null,
            indicator: req.query.indicator || null,
            timeframe: req.query.timeframe || null,
            venue: req.query.venue || null,
            direction: req.query.direction || null,
            minWR: parseFloat(req.query.minWR || 0),
            minROI: parseFloat(req.query.minROI || 0),
            maxDD: parseFloat(req.query.maxDD || 100),
            minCapital: parseFloat(req.query.minCapital || 0),
            limit: Math.min(200, parseInt(req.query.limit || 50)),
            offset: parseInt(req.query.offset || 0),
            search: req.query.search || ''
        };

        const result = getGen().query(opts);
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/strategies/:id
 */
router.get('/:id', (req, res) => {
    try {
        const strat = getGen().getById(req.params.id);
        if (!strat) return res.status(404).json({ error: 'Strategy not found' });
        res.json({ success: true, strategy: strat });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
