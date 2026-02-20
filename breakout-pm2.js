#!/usr/bin/env node
/**
 * BREAKOUT BOT — PM2 Persistent Launcher
 * Multi-timeframe S/R breakout trading bot
 *
 * Usage:
 *   pm2 start breakout-pm2.js --name breakout-bot
 *   pm2 logs breakout-bot
 *   pm2 stop breakout-bot
 *
 * Stats API: http://localhost:3003
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const BreakoutEngine = require('./src/backend/hft/breakout-engine');

const STATS_PORT = 3003;

const engine = new BreakoutEngine({
    executor:  process.env.BREAKOUT_EXECUTOR || 'obelisk',
    sizeUsd:   parseFloat(process.env.BREAKOUT_SIZE   || '5'),
    minTouches: parseInt(process.env.BREAKOUT_TOUCHES || '3'),
});

console.log('══════════════════════════════════════════════════════════════');
console.log('   BREAKOUT BOT — PM2 PERSISTENT MODE');
console.log('══════════════════════════════════════════════════════════════');
console.log('');

// ── Stats HTTP server (port 3003) ──────────────────────────────────────────
const statsServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/health') {
        res.writeHead(200); res.end('"ok"'); return;
    }

    const s = engine.getStats();
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, engine: 'breakout-bot', version: '1.0', ...s }, null, 2));
});

statsServer.listen(STATS_PORT, () => {
    console.log(`  Stats API: http://localhost:${STATS_PORT}`);
});

// ── Stats log every 60s ─────────────────────────────────────────────────────
const reportInterval = setInterval(() => {
    const s = engine.getStats();
    const elapsed = Math.floor(s.elapsedSec / 60) + 'm' + (s.elapsedSec % 60) + 's';
    console.log(`[${elapsed}] breakouts:${s.breakoutsDetected} trades:${s.tradesClosed} win:${s.winRate} pnl:${s.totalPnl} open:${s.openPositions}`);
    console.log(`  candles: ${Object.entries(s.candles).map(([p,v]) => `${p.split('/')[0]}:${v}`).join(' | ')}`);
    engine._saveSession();
}, 60000);

// ── Graceful shutdown ──────────────────────────────────────────────────────
const shutdown = () => {
    console.log('\n[BREAKOUT] Shutdown signal — stopping...');
    clearInterval(reportInterval);
    statsServer.close();
    engine.stop();
    setTimeout(() => {
        const s = engine.getStats();
        console.log(`[BREAKOUT] Final: ${s.tradesClosed} trades | PnL: ${s.totalPnl} | WR: ${s.winRate}`);
        process.exit(0);
    }, 500);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);

engine.start();
