#!/usr/bin/env node
/**
 * SONIC HFT ENGINE — PM2 Persistent Launcher
 * Runs indefinitely with stats reporting every 60s
 * Handles SIGTERM gracefully for PM2 stop/restart
 *
 * Usage:
 *   pm2 start sonic-hft-pm2.js --name sonic-hft
 *   pm2 logs sonic-hft
 *   pm2 stop sonic-hft
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const SonicHFTEngine = require('./src/backend/hft/sonic-hft-engine');

const STATS_PORT = 3002;

const EXECUTOR = process.env.HFT_EXECUTOR || 'obelisk'; // 'paper' | 'apex' | 'obelisk'

// Capital config — adapt sizeUsd to bridged amount:
//   $20 USDC → sizeUsd: 2  (5 pos × $2 = $10 max exposure, 50% capital safe)
//   $50 USDC → sizeUsd: 5  (5 pos × $5 = $25 max exposure, 50% capital safe)
//  $100 USDC → sizeUsd: 10 (5 pos × $10 = $50 max exposure, 50% capital safe)
const CAPITAL_USDC = parseFloat(process.env.HFT_CAPITAL_USDC || '20');
const SIZE_USD = parseFloat(process.env.HFT_SIZE_USD || (CAPITAL_USDC / 10).toFixed(2));

const engine = new SonicHFTEngine({
    priceInterval: 2000,
    sizeUsd:       SIZE_USD,
    slPct:         0.001,   // SL 0.1%
    tpPct:         0.005,   // TP 0.5% (RR 5:1, break-even 16.7%)
    maxHoldMs:     120000,  // 120s hold
    maxPositions:  5,
    batchSize:     5,
    executor:      EXECUTOR,
});

console.log('══════════════════════════════════════════════════════════════');
console.log('   SONIC HFT ENGINE — PM2 PERSISTENT MODE');
console.log('══════════════════════════════════════════════════════════════');
console.log(`  Price feed: Obelisk /api/markets (BTC/ETH/SOL)`);
console.log(`  Capital: $${CAPITAL_USDC} | Size: $${SIZE_USD}/trade | SL: 0.1% | TP: 0.5% | Hold: 120s | MaxPos: 5 | Executor: ${EXECUTOR}`);
console.log(`  Filters: RSI(72/28) + EMA(5/20) + VWAP(0.05%) + Cooldown(45s)`);
console.log(`  Profit guard: ON (batch 5, Sonic gas $0.00021)`);
console.log('');

// ── Stats HTTP server (port 3002) ──────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const SESSIONS_FILE = path.join(__dirname, 'data/tracking/sonic_hft_sessions.json');
const TRADES_FILE   = path.join(__dirname, 'data/tracking/sonic_hft_trades.jsonl');

const statsServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/health') {
        res.writeHead(200); res.end('"ok"'); return;
    }

    // Track record: all sessions + cumulative
    if (req.url === '/record') {
        try {
            const sessions = fs.existsSync(SESSIONS_FILE)
                ? JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8')) : [];
            const trades = fs.existsSync(TRADES_FILE)
                ? fs.readFileSync(TRADES_FILE, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
            const allPnl    = trades.reduce((s, t) => s + t.pnl, 0);
            const allWins   = trades.filter(t => t.pnl > 0).length;
            const allTrades = trades.length;
            res.writeHead(200);
            res.end(JSON.stringify({
                sessions: sessions.length,
                totalTrades: allTrades,
                totalWins:   allWins,
                totalLosses: allTrades - allWins,
                winRate:     allTrades ? (allWins / allTrades * 100).toFixed(1) + '%' : '0%',
                totalPnl:    '$' + allPnl.toFixed(4),
                sessionHistory: sessions.slice(-20),
                recentTrades:   trades.slice(-20),
            }, null, 2));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    const s = engine.getStats();
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, engine: 'sonic-hft', version: '2.1', ...s }, null, 2));
});
statsServer.listen(STATS_PORT, () => {
    console.log(`  Stats API: http://localhost:${STATS_PORT}/stats`);
});

// ── Stats log every 60s + persist session ──────────────────────────────────
const reportInterval = setInterval(() => {
    const s = engine.getStats();
    const elapsed = Math.floor(s.elapsedSec / 60) + 'm' + (s.elapsedSec % 60) + 's';
    const rate = s.batcher?.profitGuard?.totalNetPnl || '$0';
    console.log(`[${elapsed}] trades:${s.tradesClosed} win:${s.winRate} pnl:${s.totalPnl} batch:${s.batchesExecuted}exec/${s.batchesSkipped}skip netPnl:${rate}`);
    engine._saveSession();
}, 60000);

// Graceful shutdown for PM2
const shutdown = () => {
    console.log('\n[HFT] Shutdown signal — stopping engine...');
    clearInterval(reportInterval);
    statsServer.close();
    engine.stop();

    setTimeout(() => {
        const s = engine.getStats();
        console.log(`[HFT] Final: ${s.tradesClosed} trades | PnL: ${s.totalPnl} | Win: ${s.winRate}`);
        engine._saveSession();
        process.exit(0);
    }, 500);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);

engine.start();
