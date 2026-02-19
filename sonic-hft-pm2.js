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

const engine = new SonicHFTEngine({
    priceInterval: 2000,   // 2s intervals (stable for long runs)
    sizeUsd:       5.00,
    slPct:         0.005,
    tpPct:         0.015,
    maxPositions:  5,
    batchSize:     10,
});

console.log('══════════════════════════════════════════════════════════════');
console.log('   SONIC HFT ENGINE — PM2 PERSISTENT MODE');
console.log('══════════════════════════════════════════════════════════════');
console.log(`  Price feed: Obelisk /api/markets (BTC/ETH/SOL/ARB)`);
console.log(`  Size: $5 | SL: 0.5% | TP: 1.5% | MaxPos: 5`);
console.log(`  Filters: RSI(72/28) + EMA(5/20) + VWAP(0.05%) + Cooldown(45s)`);
console.log(`  Profit guard: ON (batch 10, Sonic gas $0.00021)`);
console.log('');

// ── Stats HTTP server (port 3002) ──────────────────────────────────────────
const statsServer = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
        return;
    }
    const s = engine.getStats();
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ ok: true, engine: 'sonic-hft', version: '2.1', ...s }, null, 2));
});
statsServer.listen(STATS_PORT, () => {
    console.log(`  Stats API: http://localhost:${STATS_PORT}/stats`);
});

// ── Stats log every 60s ────────────────────────────────────────────────────
const reportInterval = setInterval(() => {
    const s = engine.getStats();
    const elapsed = Math.floor(s.elapsedSec / 60) + 'm' + (s.elapsedSec % 60) + 's';
    const rate = s.batcher?.profitGuard?.totalNetPnl || '$0';
    console.log(`[${elapsed}] trades:${s.tradesClosed} win:${s.winRate} pnl:${s.totalPnl} batch:${s.batchesExecuted}exec/${s.batchesSkipped}skip netPnl:${rate}`);
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
        process.exit(0);
    }, 500);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);

engine.start();
