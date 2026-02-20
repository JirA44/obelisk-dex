/**
 * OBELISK — Global Markets API
 * Stocks, ETFs, Commodities from global exchanges
 * Price feed: Yahoo Finance (no key needed)
 *
 * GET /api/markets/global              → all categories with prices
 * GET /api/markets/global/:category    → specific category (KR, US_TECH, ETF, ...)
 * GET /api/markets/global/price/:sym   → single symbol quote
 * GET /api/markets/global/categories   → list of available categories
 */

const express = require('express');
const router  = express.Router();
const gm      = require('../services/global-markets');

// ── GET /api/markets/global/categories ───────────────────────────────────────
router.get('/categories', (req, res) => {
    const cats = Object.entries(gm.ASSETS).map(([key, v]) => ({
        key,
        name:   v.name,
        flag:   v.flag,
        count:  v.assets.length,
        examples: v.assets.slice(0, 3).map(a => a.name),
    }));
    res.json({ success: true, categories: cats });
});

// ── GET /api/markets/global/:category ────────────────────────────────────────
router.get('/:category', async (req, res) => {
    const { category } = req.params;

    if (category === 'all') {
        try {
            const force = req.query.refresh === 'true';
            const data  = await gm.getAll(force);
            return res.json({ success: true, data });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    if (category === 'price') {
        // handled by /price/:sym below, but catch if called without sym
        return res.status(400).json({ success: false, error: 'Use /price/:symbol' });
    }

    try {
        const force  = req.query.refresh === 'true';
        const data   = await gm.getCategory(category.toUpperCase(), force);
        if (!data) return res.status(404).json({ success: false, error: `Category '${category}' not found. Use: ${Object.keys(gm.ASSETS).join(', ')}` });
        res.json({ success: true, category, ...data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GET /api/markets/global/price/:symbol ────────────────────────────────────
router.get('/price/:symbol', async (req, res) => {
    const symbol = decodeURIComponent(req.params.symbol).toUpperCase();
    try {
        const price = await gm.getPrice(symbol);
        if (!price || !price.price) return res.status(404).json({ success: false, error: `Symbol ${symbol} not found or no price` });
        res.json({ success: true, symbol, ...price });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
