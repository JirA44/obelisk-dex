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
    priceInterval:  2000,
    sizeUsd:        SIZE_USD,
    slPct:          0.001,    // SL 0.1%
    tpPct:          0.0015,   // TP 0.15% (1.5:1 RR, break-even 40% — était 0.2% trop loin, 3% hit rate)
    maxHoldMs:      180000,   // 180s hold (était 120s — timeout avg +$0.0035, plus de temps = +profit)
    maxPositions:   5,
    batchSize:      2,
    minNetProfitUsd: 0.005,   // marge min au-dessus du break-even avant settlement ($0.005)
    executor:       EXECUTOR,
    // Filtres assouplis pour +signal rate (live: 12/h → cible 60/h)
    rsiOverbought:  70,       // était 72 (trop rare)
    rsiOversold:    30,       // était 28 (trop rare)
    vwapPct:        0.0003,   // était 0.0005 (0.03% vs 0.05%)
    cooldownMs:     20000,    // était 45s → 20s par pair/side
});

console.log('══════════════════════════════════════════════════════════════');
console.log('   SONIC HFT ENGINE — PM2 PERSISTENT MODE');
console.log('══════════════════════════════════════════════════════════════');
console.log(`  Price feed: Obelisk /api/markets (BTC/ETH/SOL)`);
console.log(`  Capital: $${CAPITAL_USDC} | Size: $${SIZE_USD}/trade | SL: 0.1% | TP: 0.15% | Hold: 180s | MaxPos: 5 | Executor: ${EXECUTOR}`);
console.log(`  Filters: RSI(72/28) + EMA(5/20) + VWAP(0.05%) + Cooldown(45s)`);
console.log(`  Profit guard: ON (batch 5, Sonic gas $0.00021)`);
console.log('');

// ── Startup cleanup : ferme les positions fantômes des sessions précédentes ──
async function cleanupOldPositions() {
    const coins = ['BTC', 'ETH', 'SOL'];
    for (const coin of coins) {
        try {
            const r = await new Promise((res, rej) => {
                const body = JSON.stringify({ coin, userId: 'sonic-hft' });
                const req = http.request({
                    hostname: 'localhost', port: 3001, path: '/api/perps/close',
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
                }, (resp) => { let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>res(JSON.parse(d))); });
                req.on('error', rej); req.write(body); req.end();
            });
            if (r.success) console.log(`  [CLEANUP] Closed ghost ${coin} position (pnl $${r.result?.pnl?.toFixed(4)||'?'})`);
        } catch(e) { /* no position = ok */ }
    }
    console.log('  [CLEANUP] Startup cleanup done — slots libérés');
    console.log('');
}
cleanupOldPositions();

// ── Stats HTTP server (port 3002) ──────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const SESSIONS_FILE = path.join(__dirname, 'data/tracking/sonic_hft_sessions.json');
const TRADES_FILE   = path.join(__dirname, 'data/tracking/sonic_hft_trades.jsonl');
const HOURS_FILE    = path.join(__dirname, 'data/tracking/sonic_hft_hours.jsonl');

// ── Hourly tracking ─────────────────────────────────────────────────────────
// Each hour gets a unique hid: H20260220_13 (= Feb 20 2026, 13:00-14:00)
function getHourId() {
    const n  = new Date();
    const y  = n.getFullYear();
    const mo = String(n.getMonth() + 1).padStart(2, '0');
    const d  = String(n.getDate()).padStart(2, '0');
    const h  = String(n.getHours()).padStart(2, '0');
    return `H${y}${mo}${d}_${h}`;
}

function snapStats(s) {
    return {
        tradesClosed:     s.tradesClosed,
        wins:             s.wins,
        losses:           s.losses,
        timeouts:         s.timeouts,
        signalsGenerated: s.signalsGenerated,
        totalPnl:         parseFloat((s.totalPnl || '$0').replace('$', '')),
    };
}

function saveHour(hid, snap0, snap1, startTs) {
    const trades  = snap1.tradesClosed     - snap0.tradesClosed;
    const wins    = snap1.wins             - snap0.wins;
    const losses  = snap1.losses           - snap0.losses;
    const timeouts= snap1.timeouts         - snap0.timeouts;
    const signals = snap1.signalsGenerated - snap0.signalsGenerated;
    const pnl     = snap1.totalPnl        - snap0.totalPnl;
    const winRate = trades > 0 ? (wins / trades * 100).toFixed(1) + '%' : '0%';
    const rec = {
        hid,
        startTime: startTs,
        endTime:   Date.now(),
        label:     new Date(startTs).toISOString().slice(0, 16).replace('T', ' '),
        trades, wins, losses, timeouts, signals,
        winRate,
        pnl: '$' + pnl.toFixed(4),
    };
    fs.appendFileSync(HOURS_FILE, JSON.stringify(rec) + '\n');
    return rec;
}

let _hourId   = getHourId();
let _hourTs   = Date.now();
// _hourSnap initialisé dès le premier tick (évite null check)
let _hourSnap = { tradesClosed: 0, wins: 0, losses: 0, timeouts: 0, signalsGenerated: 0, totalPnl: 0 };

const statsServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/health') {
        res.writeHead(200); res.end('"ok"'); return;
    }

    // Track record: all sessions + hours + cumulative
    if (req.url === '/record') {
        try {
            const sessions = fs.existsSync(SESSIONS_FILE)
                ? JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8')) : [];
            const trades = fs.existsSync(TRADES_FILE)
                ? fs.readFileSync(TRADES_FILE, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];

            const allPnl    = trades.reduce((s, t) => s + t.pnl, 0);
            const allWins   = trades.filter(t => t.pnl > 0).length;
            const allTrades = trades.length;

            // ── Hourly breakdown computed directly from trades (robust against restarts) ──
            // Group trades by hour hid (H20260220_22) using their timestamp
            const hourMap = {};
            for (const t of trades) {
                const ts = t.timestamp || t.closedAt || t.time;
                if (!ts) continue;
                const d  = new Date(ts);
                const hid = `H${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}`;
                if (!hourMap[hid]) hourMap[hid] = { hid, startTs: ts, trades:0, wins:0, losses:0, pnl:0 };
                hourMap[hid].trades++;
                hourMap[hid].pnl += t.pnl;
                if (t.pnl > 0) hourMap[hid].wins++;
                else hourMap[hid].losses++;
                if (ts < hourMap[hid].startTs) hourMap[hid].startTs = ts;
            }
            const hourHistory = Object.values(hourMap)
                .sort((a, b) => a.startTs - b.startTs)
                .slice(-24)
                .map(h => ({
                    hid:     h.hid,
                    label:   new Date(h.startTs).toISOString().slice(0,16).replace('T',' '),
                    trades:  h.trades,
                    wins:    h.wins,
                    losses:  h.losses,
                    winRate: h.trades > 0 ? (h.wins/h.trades*100).toFixed(1)+'%' : '0%',
                    pnl:     '$' + h.pnl.toFixed(4),
                }));

            res.writeHead(200);
            res.end(JSON.stringify({
                sessions:    sessions.length,
                totalTrades: allTrades,
                totalWins:   allWins,
                totalLosses: allTrades - allWins,
                winRate:     allTrades ? (allWins / allTrades * 100).toFixed(1) + '%' : '0%',
                totalPnl:    '$' + allPnl.toFixed(4),
                currentHour: _hourId,
                hourCount:   hourHistory.length,
                hourHistory,
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

// ── Stats log every 60s + persist session + hourly rollup ──────────────────
const reportInterval = setInterval(() => {
    const s = engine.getStats();
    const elapsed = Math.floor(s.elapsedSec / 60) + 'm' + (s.elapsedSec % 60) + 's';
    const rate = s.batcher?.profitGuard?.totalNetPnl || '$0';
    console.log(`[${elapsed}] trades:${s.tradesClosed} win:${s.winRate} pnl:${s.totalPnl} batch:${s.batchesExecuted}exec/${s.batchesSkipped}skip netPnl:${rate}`);
    engine._saveSession();

    // Hourly rollup — save previous hour when clock rolls over
    const hid = getHourId();
    if (hid !== _hourId) {
        const rec = saveHour(_hourId, _hourSnap, snapStats(s), _hourTs);
        console.log(`[HOUR] ${rec.hid} → ${rec.trades}t ${rec.winRate} PnL:${rec.pnl} signals:${rec.signals}`);
        _hourId   = hid;
        _hourSnap = snapStats(s);
        _hourTs   = Date.now();
    }
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
        // Save partial current hour on shutdown
        if (_hourSnap) {
            const rec = saveHour(_hourId, _hourSnap, snapStats(s), _hourTs);
            console.log(`[HOUR] ${rec.hid} (partial) → ${rec.trades}t ${rec.winRate} PnL:${rec.pnl}`);
        }
        process.exit(0);
    }, 500);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);

engine.start();
