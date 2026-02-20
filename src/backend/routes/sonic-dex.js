/**
 * SONIC DEX ROUTES - /api/sonic-dex/*
 * Multi-DEX liquidity routing on Sonic chain
 *
 * Endpoints:
 *   GET  /api/sonic-dex/quote?tokenIn=USDC&tokenOut=wS&amount=10
 *   POST /api/sonic-dex/swap
 *   GET  /api/sonic-dex/dexes
 *   GET  /api/sonic-dex/stats
 */

const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { SonicDexRouter, ADDRESSES } = require('../executors/sonic-dex-router');

// Singleton router instance
let dexRouter = null;

function getDexRouter() {
    if (!dexRouter) {
        dexRouter = new SonicDexRouter();
    }
    return dexRouter;
}

// ─── GET /api/sonic-dex/dexes ─────────────────────────────────────────────
// List all supported DEXes and token aliases
router.get('/dexes', (req, res) => {
    res.json({
        dexes: [
            { id: 'odos',       name: 'Odos',           type: 'Aggregator (all DEXes)', fees: '0%',         status: 'live' },
            { id: 'equalizer',  name: 'Equalizer',      type: 'Solidly AMM',            fees: '0.02-0.05%', status: 'live' },
            { id: 'metropolis', name: 'Metropolis',     type: 'Trader Joe V2 AMM',      fees: '0.15-0.3%',  status: 'live' },
            { id: 'shadow_v2',  name: 'ShadowDEX V2',  type: 'Solidly AMM',            fees: '0.02-0.05%', status: 'live' },
            { id: 'shadow_cl',  name: 'ShadowDEX CL',  type: 'UniV3 CLAMM',            fees: '0.01-1%',    status: 'no-pool' },
            { id: 'swapx',      name: 'SwapX',          type: 'Algebra V4 CLAMM',       fees: 'dynamic',    status: 'no-pool' },
        ],
        tokens: Object.entries(ADDRESSES)
            .filter(([k]) => !k.includes('_'))
            .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {}),
        chain: { id: 146, name: 'Sonic', rpc: 'https://rpc.soniclabs.com' },
    });
});

// ─── GET /api/sonic-dex/quote ─────────────────────────────────────────────
// Get best quote across all DEXes
//
// Query params:
//   tokenIn  - token symbol (USDC, wS, WETH) or address
//   tokenOut - token symbol or address
//   amount   - human-readable amount (e.g. "10" for 10 USDC)
router.get('/quote', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amount } = req.query;
        if (!tokenIn || !tokenOut || !amount) {
            return res.status(400).json({ error: 'Required: tokenIn, tokenOut, amount' });
        }

        const dr = getDexRouter();
        const result = await dr.quoteHuman(tokenIn, tokenOut, parseFloat(amount));

        if (!result.success) {
            return res.status(404).json({ error: result.error });
        }

        res.json({
            success: true,
            quote: result.human,
            raw: {
                bestDex: result.best.dex,
                amountOut: result.best.amountOut.toString(),
                allQuotes: result.allQuotes.map(q => ({
                    dex: q.dex,
                    amountOut: q.amountOut.toString(),
                })),
            },
        });

    } catch (err) {
        console.error('[SonicDEX] quote error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/sonic-dex/swap ─────────────────────────────────────────────
// Execute a swap on best DEX
//
// Body:
//   tokenIn   - address
//   tokenOut  - address
//   amountIn  - BigInt string (token units, e.g. "10000000" for 10 USDC)
//   slippage  - optional, e.g. 0.005 (0.5%)
//   dex       - optional, force a specific DEX
router.post('/swap', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn, slippage, dex: forceDex } = req.body;

        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({ error: 'Required: tokenIn, tokenOut, amountIn' });
        }

        const dr = getDexRouter();
        if (!dr.wallet) {
            return res.status(503).json({
                error: 'Sonic wallet not configured — set SONIC_MAINNET_PRIVATE_KEY in .env',
            });
        }

        const amountInBig = BigInt(amountIn);
        const result = await dr.executeSwap(tokenIn, tokenOut, amountInBig, slippage);

        res.json(result);

    } catch (err) {
        console.error('[SonicDEX] swap error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/sonic-dex/stats ─────────────────────────────────────────────
router.get('/stats', (req, res) => {
    try {
        const dr = getDexRouter();
        res.json(dr.getStats());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/sonic-dex/ready ─────────────────────────────────────────────
// Check if wallet is ready for HFT (balance + gas)
router.get('/ready', async (req, res) => {
    try {
        const SonicDexExecutor = require('../hft/sonic-dex-executor');
        const exec = new SonicDexExecutor();
        const status = await exec.checkReady();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
