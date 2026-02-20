/**
 * Flash Loans & Lending Strategies — API Routes
 *
 * GET  /api/flash-loans/opportunities       — Scan all open arb/liquidation opportunities
 * GET  /api/flash-loans/arb                 — DEX arb opportunities only
 * GET  /api/flash-loans/liquidations        — Liquidation opportunities only
 * POST /api/flash-loans/execute             — Execute a flash loan
 * GET  /api/flash-loans/stats               — Engine stats
 *
 * GET  /api/flash-loans/strategies/spreads  — Best carry trade spreads
 * GET  /api/flash-loans/strategies/simulate — Project a lending strategy
 * GET  /api/flash-loans/strategies/optimize — Portfolio optimizer
 * GET  /api/flash-loans/strategies/micro    — Micro-lending rates + projection
 * GET  /api/flash-loans/strategies/collateral-swap — Collateral swap calculator
 */

'use strict';

const express = require('express');
const router = express.Router();

const { getFlashLoanEngine } = require('../flash-loan-engine');
const {
    scanSpreadArbs,
    projectSpreadArb,
    calculateRecursiveLoop,
    getMicroLendingRates,
    projectMicroLend,
    optimizePortfolio
} = require('../lending-strategies');

// Engine lazily resolved (populated after server-ultra registers it)
function engine() {
    return getFlashLoanEngine();
}

// ─────────────────────────────────────────────────────────────────────────────
// FLASH LOAN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/flash-loans/opportunities — all open opportunities */
router.get('/opportunities', async (req, res) => {
    try {
        const eng = engine();
        if (!eng) return res.status(503).json({ error: 'Flash loan engine not initialized' });
        const result = await eng.scanOpportunities();
        res.json({ ok: true, ...result });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/** GET /api/flash-loans/arb — DEX arbitrage only */
router.get('/arb', async (req, res) => {
    try {
        const eng = engine();
        if (!eng) return res.status(503).json({ error: 'Flash loan engine not initialized' });
        const opportunities = await eng.scanDEXArb();
        res.json({ ok: true, count: opportunities.length, opportunities });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/** GET /api/flash-loans/liquidations — liquidation opportunities */
router.get('/liquidations', async (req, res) => {
    try {
        const eng = engine();
        if (!eng) return res.status(503).json({ error: 'Flash loan engine not initialized' });
        const opportunities = await eng.scanLiquidations();
        res.json({ ok: true, count: opportunities.length, opportunities });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/** POST /api/flash-loans/execute
 *  Body: { strategy: 'DEX_ARB'|'LIQUIDATION', params: {...}, userId? }
 */
router.post('/execute', async (req, res) => {
    try {
        const { strategy, params, userId = 'api_user' } = req.body;

        if (!strategy) return res.status(400).json({ error: 'strategy is required' });
        if (!params) return res.status(400).json({ error: 'params is required' });
        if (!params.loanAmount || params.loanAmount <= 0) {
            return res.status(400).json({ error: 'params.loanAmount must be > 0' });
        }

        const eng = engine();
        if (!eng) return res.status(503).json({ error: 'Flash loan engine not initialized' });

        const result = await eng.execute(strategy, params, userId);
        res.json({ ok: true, ...result });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
});

/** GET /api/flash-loans/stats */
router.get('/stats', (req, res) => {
    try {
        const eng = engine();
        if (!eng) return res.status(503).json({ error: 'Flash loan engine not initialized' });
        res.json({ ok: true, stats: eng.getStats() });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/** POST /api/flash-loans/scanner/start */
router.post('/scanner/start', (req, res) => {
    try {
        const intervalMs = parseInt(req.body?.intervalMs) || 30000;
        engine()?.startScanner(intervalMs);
        res.json({ ok: true, message: `Scanner started (every ${intervalMs / 1000}s)` });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/** POST /api/flash-loans/scanner/stop */
router.post('/scanner/stop', (req, res) => {
    engine()?.stopScanner();
    res.json({ ok: true, message: 'Scanner stopped' });
});

// ─────────────────────────────────────────────────────────────────────────────
// LENDING STRATEGY ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/flash-loans/strategies/spreads?minCarry=0.5
 *  Returns all positive carry trade pairs ranked by net spread
 */
router.get('/strategies/spreads', (req, res) => {
    try {
        const minCarry = parseFloat(req.query.minCarry) || 0.5;
        const arbs = scanSpreadArbs(minCarry);
        res.json({ ok: true, count: arbs.length, spreads: arbs });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/** GET /api/flash-loans/strategies/simulate?strategy=SPREAD_ARB&capital=1000&...
 *
 *  strategy=SPREAD_ARB    → ?capital=1000&borrowToken=BTC&earnToken=SOL&days=365
 *  strategy=RECURSIVE     → ?capital=1000&loops=3&ltv=0.75
 *  strategy=MICRO         → ?capital=0.01&token=USDC&days=30&utilization=0.7
 */
router.get('/strategies/simulate', (req, res) => {
    try {
        const { strategy = 'SPREAD_ARB' } = req.query;
        const capital = parseFloat(req.query.capital) || 1000;

        let result;

        if (strategy === 'SPREAD_ARB') {
            const borrowToken = (req.query.borrowToken || 'BTC').toUpperCase();
            const earnToken = (req.query.earnToken || 'SOL').toUpperCase();
            const days = parseInt(req.query.days) || 365;
            result = projectSpreadArb(capital, borrowToken, earnToken, days);

        } else if (strategy === 'RECURSIVE' || strategy === 'RECURSIVE_LOOP') {
            const loops = Math.min(parseInt(req.query.loops) || 3, 5); // cap at 5
            const ltv = Math.min(parseFloat(req.query.ltv) || 0.75, 0.90);
            result = calculateRecursiveLoop({ initialCapital: capital, loops, ltv });

        } else if (strategy === 'MICRO' || strategy === 'MICRO_LEND') {
            const token = (req.query.token || 'USDC').toUpperCase();
            const days = parseInt(req.query.days) || 30;
            const utilization = parseFloat(req.query.utilization) || 0.70;
            result = projectMicroLend({ depositUSD: capital, token, durationDays: days, utilizationRatio: utilization });

        } else {
            return res.status(400).json({ error: `Unknown strategy: ${strategy}. Use SPREAD_ARB, RECURSIVE, or MICRO` });
        }

        res.json({ ok: true, ...result });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
});

/** GET /api/flash-loans/strategies/optimize?capital=1000&risk=MODERATE
 *  risk: CONSERVATIVE | MODERATE | AGGRESSIVE
 */
router.get('/strategies/optimize', (req, res) => {
    try {
        const capital = parseFloat(req.query.capital) || 1000;
        const risk = (req.query.risk || 'MODERATE').toUpperCase();

        if (!['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'].includes(risk)) {
            return res.status(400).json({ error: 'risk must be CONSERVATIVE, MODERATE, or AGGRESSIVE' });
        }

        const result = optimizePortfolio(capital, risk);
        res.json({ ok: true, ...result });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
});

/** GET /api/flash-loans/strategies/micro?capital=0.01&token=USDC&days=30 */
router.get('/strategies/micro', (req, res) => {
    try {
        const capital = parseFloat(req.query.capital) || 1.0;
        const token = (req.query.token || 'USDC').toUpperCase();
        const days = parseInt(req.query.days) || 30;
        const utilization = parseFloat(req.query.utilization) || 0.70;

        const rates = getMicroLendingRates();
        const projection = projectMicroLend({
            depositUSD: capital,
            token,
            durationDays: days,
            utilizationRatio: utilization
        });

        res.json({ ok: true, rates, projection });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
});

/** GET /api/flash-loans/strategies/collateral-swap?userId=u1&from=ETH&to=BTC&amount=1 */
router.get('/strategies/collateral-swap', (req, res) => {
    try {
        const { userId = 'demo', from, to } = req.query;
        const amount = parseFloat(req.query.amount) || 1;

        if (!from || !to) {
            return res.status(400).json({ error: 'from and to tokens required' });
        }

        const eng = engine();
        if (!eng) return res.status(503).json({ error: 'Flash loan engine not initialized' });

        const result = eng.calculateCollateralSwap(
            userId,
            from.toUpperCase(),
            to.toUpperCase(),
            amount
        );
        res.json({ ok: true, ...result });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
});

// ─── Summary ──────────────────────────────────────────────────────────────────

/** GET /api/flash-loans — overview of all features */
router.get('/', (req, res) => {
    res.json({
        ok: true,
        module: 'Flash Loans & Lending Strategies',
        version: '1.0',
        endpoints: {
            flashLoans: [
                'GET  /api/flash-loans/opportunities',
                'GET  /api/flash-loans/arb',
                'GET  /api/flash-loans/liquidations',
                'POST /api/flash-loans/execute',
                'GET  /api/flash-loans/stats',
                'POST /api/flash-loans/scanner/start',
                'POST /api/flash-loans/scanner/stop'
            ],
            strategies: [
                'GET  /api/flash-loans/strategies/spreads?minCarry=0.5',
                'GET  /api/flash-loans/strategies/simulate?strategy=SPREAD_ARB&capital=1000',
                'GET  /api/flash-loans/strategies/simulate?strategy=RECURSIVE&loops=3',
                'GET  /api/flash-loans/strategies/simulate?strategy=MICRO&capital=0.01',
                'GET  /api/flash-loans/strategies/optimize?capital=1000&risk=MODERATE',
                'GET  /api/flash-loans/strategies/micro',
                'GET  /api/flash-loans/strategies/collateral-swap?from=ETH&to=BTC&amount=1'
            ]
        },
        fee: '0.09% flash loan fee',
        minProfit: '$1.00 per opportunity'
    });
});

module.exports = router;
