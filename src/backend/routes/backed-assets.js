/**
 * ROUTES — Backed Assets + Collateral Manager
 * GET  /api/assets/backed/catalog          — Catalogue tous les OBK tokens
 * POST /api/assets/backed/mint             — Mint un OBK token
 * POST /api/assets/backed/redeem          — Redeem → récupérer collatéral
 * GET  /api/assets/backed/balance/:userId  — Balance user
 * GET  /api/assets/backed/stats           — Stats globales TVL
 *
 * GET  /api/assets/cdp/catalog            — Collatéraux acceptés
 * POST /api/assets/cdp/open               — Ouvrir CDP
 * POST /api/assets/cdp/add-collateral     — Ajouter collatéral
 * POST /api/assets/cdp/repay              — Repayer dette
 * GET  /api/assets/cdp/positions/:userId  — Positions user
 * GET  /api/assets/cdp/stats             — Stats globales
 * POST /api/assets/cdp/liquidate-check    — Vérifier liquidations
 *
 * GET  /api/revenue/dashboard             — Dashboard complet P&L
 * GET  /api/revenue/report/:period        — Rapport période (today/week/month/lifetime)
 * POST /api/revenue/record                — Enregistrer rev/expense manuellement
 */

'use strict';

const { Router }            = require('express');
const { BackedAssetsManager }  = require('../backed-assets');
const { CollateralManager }    = require('../collateral-manager');
const revenueTracker           = require('../revenue-expense-tracker');

// Instances
const backedMgr = new BackedAssetsManager();
const cdpMgr    = new CollateralManager();

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// BACKED ASSETS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/assets/backed/catalog
router.get('/backed/catalog', (req, res) => {
    res.json({ success: true, assets: backedMgr.getCatalog() });
});

// GET /api/assets/backed/stats
router.get('/backed/stats', (req, res) => {
    res.json({ success: true, stats: backedMgr.getStats() });
});

// GET /api/assets/backed/balance/:userId
router.get('/backed/balance/:userId', (req, res) => {
    const balance = backedMgr.getBalance(req.params.userId);
    res.json({ success: true, userId: req.params.userId, ...balance });
});

// POST /api/assets/backed/mint
router.post('/backed/mint', (req, res) => {
    const { userId, symbol, backingAmount, backingAsset } = req.body;
    if (!userId || !symbol || !backingAmount || !backingAsset) {
        return res.status(400).json({ success: false, error: 'Missing: userId, symbol, backingAmount, backingAsset' });
    }
    const result = backedMgr.mint(userId, symbol, parseFloat(backingAmount), backingAsset);
    if (result.success) {
        revenueTracker.recordBackedAssetFee(
            parseFloat(backingAmount) * 0.0005,   // ~0.05% fee en USD
            symbol
        );
    }
    res.json(result);
});

// POST /api/assets/backed/redeem
router.post('/backed/redeem', (req, res) => {
    const { userId, symbol, tokenAmount } = req.body;
    if (!userId || !symbol || !tokenAmount) {
        return res.status(400).json({ success: false, error: 'Missing: userId, symbol, tokenAmount' });
    }
    const result = backedMgr.redeem(userId, symbol, parseFloat(tokenAmount));
    if (result.success) {
        revenueTracker.recordBackedAssetFee(result.usdValue * 0.0005, symbol);
    }
    res.json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// COLLATERAL MANAGER (CDP)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/assets/cdp/catalog
router.get('/cdp/catalog', (req, res) => {
    res.json({ success: true, collaterals: cdpMgr.getCollateralCatalog() });
});

// GET /api/assets/cdp/stats
router.get('/cdp/stats', (req, res) => {
    res.json({ success: true, stats: cdpMgr.getStats() });
});

// GET /api/assets/cdp/positions/:userId
router.get('/cdp/positions/:userId', (req, res) => {
    const positions = cdpMgr.getUserPositions(req.params.userId);
    res.json({ success: true, userId: req.params.userId, positions });
});

// POST /api/assets/cdp/open
router.post('/cdp/open', (req, res) => {
    const { userId, collateralAsset, collateralAmount, borrowAsset, borrowAmount } = req.body;
    if (!userId || !collateralAsset || !collateralAmount || !borrowAsset || !borrowAmount) {
        return res.status(400).json({ success: false, error: 'Missing fields: userId, collateralAsset, collateralAmount, borrowAsset, borrowAmount' });
    }
    const result = cdpMgr.openPosition(userId, collateralAsset, parseFloat(collateralAmount), borrowAsset, parseFloat(borrowAmount));
    res.json(result);
});

// POST /api/assets/cdp/add-collateral
router.post('/cdp/add-collateral', (req, res) => {
    const { userId, positionId, amount } = req.body;
    if (!userId || !positionId || !amount) {
        return res.status(400).json({ success: false, error: 'Missing: userId, positionId, amount' });
    }
    const result = cdpMgr.addCollateral(userId, positionId, parseFloat(amount));
    res.json(result);
});

// POST /api/assets/cdp/repay
router.post('/cdp/repay', (req, res) => {
    const { userId, positionId, repayAmount } = req.body;
    if (!userId || !positionId || !repayAmount) {
        return res.status(400).json({ success: false, error: 'Missing: userId, positionId, repayAmount' });
    }
    const result = cdpMgr.repay(userId, positionId, parseFloat(repayAmount));
    if (result.success) {
        revenueTracker.recordCDPInterest(result.repaid * 0.05 / 365, positionId);
    }
    res.json(result);
});

// POST /api/assets/cdp/liquidate-check
router.post('/cdp/liquidate-check', (req, res) => {
    const liquidated = cdpMgr.checkLiquidations();
    liquidated.forEach(l => {
        revenueTracker.recordLiquidationFee(l.penalty, l.positionId);
    });
    res.json({ success: true, liquidated, count: liquidated.length });
});

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE & EXPENSE
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/revenue/dashboard
router.get('/revenue/dashboard', (req, res) => {
    res.json({ success: true, dashboard: revenueTracker.getDashboard() });
});

// GET /api/revenue/report/:period
router.get('/revenue/report/:period', (req, res) => {
    const report = revenueTracker.getReport(req.params.period);
    res.json({ success: true, report });
});

// POST /api/revenue/record
router.post('/revenue/record', (req, res) => {
    const { type, category, amountUSD, meta } = req.body;
    if (!type || !category || !amountUSD) {
        return res.status(400).json({ success: false, error: 'Missing: type (revenue|expense), category, amountUSD' });
    }
    if (type === 'revenue') revenueTracker.addRevenue(category, parseFloat(amountUSD), meta);
    else if (type === 'expense') revenueTracker.addExpense(category, parseFloat(amountUSD), meta);
    else return res.status(400).json({ success: false, error: 'type must be revenue or expense' });
    res.json({ success: true, recorded: { type, category, amountUSD } });
});

module.exports = { router, backedMgr, cdpMgr };
