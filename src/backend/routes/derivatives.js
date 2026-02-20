/**
 * OBELISK DERIVATIVES API ROUTES V1.0
 *
 * GET  /api/derivatives/catalog          — liste tous les assets disponibles
 * GET  /api/derivatives/insurance        — état du fonds d'assurance
 * POST /api/derivatives/issue            — émettre un dérivé
 * POST /api/derivatives/redeem           — racheter un dérivé
 * GET  /api/derivatives/holdings/:userId — positions actives d'un user
 * GET  /api/derivatives/mtm/:id          — mark-to-market d'un dérivé
 */

const express = require('express');
const router  = express.Router();
const { StructuredDerivatives } = require('../structured-derivatives');

let engine = null;

function getEngine(req) {
    if (!engine) {
        // Lazy init — use price oracle from perps if available
        const oracle = req.app.locals.perps
            ? (sym) => req.app.locals.perps.prices[sym] || req.app.locals.perps.prices[sym + 'USDT']
            : null;
        engine = new StructuredDerivatives(oracle);
    }
    return engine;
}

// GET /api/derivatives/catalog
router.get('/catalog', (req, res) => {
    try {
        const catalog = getEngine(req).getCatalog();
        res.json({ success: true, count: catalog.length, assets: catalog });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/derivatives/insurance
router.get('/insurance', (req, res) => {
    res.json({ success: true, ...getEngine(req).getInsuranceFund() });
});

// POST /api/derivatives/issue
// Body: { userId, asset, quantity, product }
// product: "STANDARD" | "PROTECTED" | "YIELD"
router.post('/issue', (req, res) => {
    const { userId = 'demo', asset, quantity = 1, product = 'STANDARD' } = req.body;
    if (!asset) return res.status(400).json({ error: 'asset required' });

    const result = getEngine(req).issue(userId, asset.toUpperCase(), parseFloat(quantity), product.toUpperCase());
    if (result.error) return res.status(400).json(result);
    res.json(result);
});

// POST /api/derivatives/redeem
// Body: { derivativeId }
router.post('/redeem', (req, res) => {
    const { derivativeId } = req.body;
    if (!derivativeId) return res.status(400).json({ error: 'derivativeId required' });

    const result = getEngine(req).redeem(derivativeId);
    if (result.error) return res.status(400).json(result);
    res.json(result);
});

// GET /api/derivatives/holdings/:userId
router.get('/holdings/:userId', (req, res) => {
    const holdings = getEngine(req).getUserHoldings(req.params.userId);
    res.json({ success: true, count: holdings.length, holdings });
});

// GET /api/derivatives/mtm/:id
router.get('/mtm/:id', (req, res) => {
    const mtm = getEngine(req).markToMarket(req.params.id);
    if (!mtm) return res.status(404).json({ error: 'Derivative not found or not active' });
    res.json({ success: true, ...mtm });
});

module.exports = router;
