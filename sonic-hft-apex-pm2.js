/**
 * SONIC HFT ENGINE — APEX Executor Launcher
 * Same engine as sonic-hft-pm2.js but routes trades to APEX (0% maker fees)
 *
 * Requirements:
 *   - APEX equity > $5 minimum ($2.81 currently → $1/trade mode)
 *   - Deposit USDC on APEX Omni to scale up
 *
 * Usage:
 *   pm2 start sonic-hft-apex-pm2.js --name sonic-hft-apex
 *   pm2 logs sonic-hft-apex
 *
 * To scale: deposit $50+ on APEX → set HFT_APEX_SIZE=5
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const SonicHFTEngine = require('./src/backend/hft/sonic-hft-engine');

const STATS_PORT = 3003; // Different port from main sonic-hft (3002)

// APEX-specific capital config
// Default: $1/trade (safe with $2.81 equity), scale when depositing more
const APEX_EQUITY  = 2.81; // current
const SIZE_USD     = parseFloat(process.env.HFT_APEX_SIZE || '1');
const MAX_POS      = Math.floor(APEX_EQUITY / SIZE_USD / 2); // conservative: 50% exposure

const engine = new SonicHFTEngine({
    priceInterval: 2000,
    sizeUsd:       SIZE_USD,
    slPct:         0.001,   // SL 0.1%
    tpPct:         0.005,   // TP 0.5% (RR 5:1)
    maxHoldMs:     120000,
    maxPositions:  Math.max(1, Math.min(MAX_POS, 5)),
    batchSize:     5,
    executor:      'apex',  // Routes to APEX 0% maker
});

console.log('══════════════════════════════════════════════════════════════');
console.log('   SONIC HFT ENGINE — APEX EXECUTOR (0% maker fees)');
console.log('══════════════════════════════════════════════════════════════');
console.log(`  Executor: APEX Omni (omni.apex.exchange)`);
console.log(`  Equity  : $${APEX_EQUITY} | Size: $${SIZE_USD}/trade | MaxPos: ${Math.max(1, Math.min(MAX_POS, 5))}`);
console.log(`  Deposit more USDC on APEX to scale up (target: $50+)`);
console.log(`  Stats API: http://localhost:${STATS_PORT}/stats`);
console.log('');

// Stats HTTP server
const statsServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/health') { res.writeHead(200); res.end('"ok"'); return; }
    const s = engine.getStats();
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, engine: 'sonic-hft-apex', executor: 'apex', ...s }, null, 2));
});
statsServer.listen(STATS_PORT);

// Stats log every 60s
const reportInterval = setInterval(() => {
    const s = engine.getStats();
    const elapsed = Math.floor(s.elapsedSec / 60) + 'm' + (s.elapsedSec % 60) + 's';
    console.log(`[${elapsed}] trades:${s.tradesClosed} win:${s.winRate} pnl:${s.totalPnl}`);
}, 60000);

// Graceful shutdown
const shutdown = () => {
    console.log('\n[APEX-HFT] Shutdown...');
    clearInterval(reportInterval);
    statsServer.close();
    engine.stop();
    setTimeout(() => {
        const s = engine.getStats();
        console.log(`[APEX-HFT] Final: ${s.tradesClosed} trades | PnL: ${s.totalPnl} | Win: ${s.winRate}`);
        process.exit(0);
    }, 500);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);

engine.start();
