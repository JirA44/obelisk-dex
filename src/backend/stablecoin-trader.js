/**
 * OBELISK STABLECOIN TRADER V3.0
 * Capital Tier Ladder: $1→$2→$3→$4→$5 paper → $10→$15→$20→$30→$50→$100 live
 * Chaque asset a ses propres critères de progression (particularités).
 *
 * USDE  (Ethena USDe)      — dépeg synthétique, vol modérée  → progression standard
 * FDUSD (First Digital USD) — très stable, Binance-native     → progression rapide
 * FRAX  (Frax Finance)      — algo-stable, dépeg fréquent     → progression lente, WR strict
 * PAXG  (Paxos Gold 1oz)    — RWA or, vol élevée, spread large → WR strict, DD serré
 * XAUT  (Tether Gold 1oz)   — or privé Suisse, liquidity faible → plus strict que PAXG
 */

const path = require('path');
const http  = require('http');
const fs    = require('fs');
const os    = require('os');

const MIXBOT_DIR = path.join(os.homedir(), 'mixbot');
const STATE_FILE = path.join(__dirname, 'data', 'stablecoin_trader_state.json');

// ─── IMPORT HFTMODULE ────────────────────────────────────────────────────────
let HFTModule;
try {
    ({ HFTModule } = require(path.join(MIXBOT_DIR, 'hft_module.js')));
    console.log('[STABLE-TRADER] HFTModule loaded ✓');
} catch (e) {
    console.error('[STABLE-TRADER] FATAL:', e.message);
    process.exit(1);
}

// ─── CAPITAL TIER LADDER ─────────────────────────────────────────────────────
// Tiers globaux (size en $) — mode PAPER ou LIVE
const TIER_SIZES = [1, 2, 3, 4, 5, 10, 15, 20, 30, 50, 100];
const TIER_MODES = ['PAPER','PAPER','PAPER','PAPER','PAPER','LIVE','LIVE','LIVE','LIVE','LIVE','LIVE'];

// ─── PAIRS CONFIG + PARTICULARITÉS ───────────────────────────────────────────
// minTrades  : trades minimum avant promotion (par tier)
// minWR      : win rate minimum % (par tier)
// maxDD      : drawdown max autorisé %
// maxConsecL : pertes consécutives max
// leverage   : levier par défaut
const PAIRS_CONFIG = {
    USDE: {
        strategies: ['STABLE_DEPEG'],
        leverage: 1,
        particularite: 'Ethena USDe — dépeg synthétique modéré',
        // Standard — progression normale
        tiers: {
            paper: { minTrades: [10,12,15,18,20], minWR: [30,32,34,36,38], maxDD: 25, maxConsecL: 6 },
            live:  { minTrades: [25,25,30,30,30], minWR: [38,40,42,44,46], maxDD: 20, maxConsecL: 5 },
        }
    },
    FDUSD: {
        strategies: ['STABLE_DEPEG'],
        leverage: 1,
        particularite: 'First Digital USD — très stable, Binance-native',
        // Progression RAPIDE — très stable donc moins de trades requis
        tiers: {
            paper: { minTrades: [8,10,12,15,18],  minWR: [28,30,32,34,36], maxDD: 30, maxConsecL: 7 },
            live:  { minTrades: [20,22,25,25,28], minWR: [36,38,40,42,44], maxDD: 25, maxConsecL: 6 },
        }
    },
    FRAX: {
        strategies: ['STABLE_DEPEG'],
        leverage: 2,
        particularite: 'Frax Finance — algo-stable, dépeg fréquent et imprévisible',
        // Progression LENTE — algo-stable plus risqué
        tiers: {
            paper: { minTrades: [15,18,22,25,30], minWR: [35,37,39,41,43], maxDD: 20, maxConsecL: 4 },
            live:  { minTrades: [30,30,35,40,40], minWR: [43,45,47,49,51], maxDD: 15, maxConsecL: 4 },
        }
    },
    PAXG: {
        strategies: ['SPREAD', 'RSI_EXTREME'],
        leverage: 3,
        particularite: 'Paxos Gold 1oz — RWA or LBMA, volatilité élevée, spread large',
        // WR STRICT — or physique = drawdowns profonds possibles
        tiers: {
            paper: { minTrades: [15,18,22,25,30], minWR: [38,40,42,44,46], maxDD: 18, maxConsecL: 4 },
            live:  { minTrades: [30,30,35,35,40], minWR: [46,48,50,52,54], maxDD: 15, maxConsecL: 3 },
        }
    },
    XAUT: {
        strategies: ['SPREAD', 'RSI_EXTREME'],
        leverage: 3,
        particularite: 'Tether Gold 1oz — or privé Suisse, liquidité faible vs PAXG',
        // PLUS STRICT que PAXG — liquidité inférieure
        tiers: {
            paper: { minTrades: [18,20,25,28,30], minWR: [40,42,44,46,48], maxDD: 15, maxConsecL: 3 },
            live:  { minTrades: [30,35,35,40,40], minWR: [48,50,52,54,56], maxDD: 12, maxConsecL: 3 },
        }
    },
};
const ALL_PAIRS = Object.keys(PAIRS_CONFIG);

// ─── STATE ───────────────────────────────────────────────────────────────────
let pairTier  = {};  // { USDE: 0, FDUSD: 2, ... }  — index dans TIER_SIZES
let tierStats = {};  // { 'USDE:0:STABLE_DEPEG': { trades, wins, ... } }

function statKey(pair, tierIdx, strat) { return `${pair}:${tierIdx}:${strat}`; }

function getTierCfg(pair, tierIdx) {
    const pcfg = PAIRS_CONFIG[pair];
    const mode = TIER_MODES[tierIdx] || 'PAPER';
    const cfg  = mode === 'PAPER' ? pcfg.tiers.paper : pcfg.tiers.live;
    const slot = mode === 'PAPER' ? tierIdx : (tierIdx - 5); // 0-4 paper, 0-5 live
    return {
        size:       TIER_SIZES[tierIdx],
        mode,
        label:      `$${TIER_SIZES[tierIdx]} ${mode.toLowerCase()}`,
        minTrades:  cfg.minTrades[Math.min(slot, cfg.minTrades.length - 1)],
        minWR:      cfg.minWR[Math.min(slot, cfg.minWR.length - 1)],
        maxDD:      cfg.maxDD,
        maxConsecL: cfg.maxConsecL,
    };
}

function initState() {
    for (const pair of ALL_PAIRS) {
        if (pairTier[pair] === undefined) pairTier[pair] = 0;
        for (let i = 0; i < TIER_SIZES.length; i++) {
            for (const strat of PAIRS_CONFIG[pair].strategies) {
                const k = statKey(pair, i, strat);
                if (!tierStats[k]) tierStats[k] = {
                    trades: 0, wins: 0, losses: 0, pnl: 0,
                    peakPnl: 0, maxDD: 0, consecL: 0,
                    startTime: null, promotedAt: null,
                };
            }
        }
    }
}

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const d = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            if (d.pairTier)  Object.assign(pairTier,  d.pairTier);
            if (d.tierStats) Object.assign(tierStats, d.tierStats);
        }
    } catch (e) { /* fresh */ }
}

function saveState() {
    try {
        const dir = path.dirname(STATE_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(STATE_FILE, JSON.stringify({ pairTier, tierStats }, null, 2));
    } catch (e) {}
}

// ─── CHECKPOINT EVALUATOR ────────────────────────────────────────────────────
function evalCP(pair, tierIdx, strat) {
    const cfg = getTierCfg(pair, tierIdx);
    const s   = tierStats[statKey(pair, tierIdx, strat)];
    if (!cfg || !s) return { pass: false };
    const wr = s.trades > 0 ? s.wins / s.trades * 100 : 0;
    const checks = [
        { name: `t≥${cfg.minTrades}`,   pass: s.trades  >= cfg.minTrades,  val: s.trades },
        { name: `WR≥${cfg.minWR}%`,     pass: wr        >= cfg.minWR,      val: wr.toFixed(1)+'%' },
        { name: 'PnL>0',                pass: s.pnl     >  0,              val: '$'+s.pnl.toFixed(4) },
        { name: `DD<${cfg.maxDD}%`,     pass: s.maxDD   <  cfg.maxDD,      val: s.maxDD.toFixed(1)+'%' },
        { name: `CL<${cfg.maxConsecL}`, pass: s.consecL <  cfg.maxConsecL, val: s.consecL },
    ];
    return { pass: checks.every(c => c.pass), checks, wr, pnl: s.pnl, trades: s.trades };
}

// ─── RECORD TRADE RESULT ─────────────────────────────────────────────────────
function recordResult(pair, strat, isWin, pnl) {
    const tid = pairTier[pair] || 0;
    const k   = statKey(pair, tid, strat);
    const s   = tierStats[k];
    if (!s) return;

    if (!s.startTime) s.startTime = Date.now();
    s.trades++;
    if (isWin) { s.wins++;   s.consecL = 0; }
    else        { s.losses++; s.consecL++; }
    s.pnl += pnl;
    if (s.pnl > s.peakPnl) s.peakPnl = s.pnl;
    const dd = s.peakPnl > 0 ? (s.peakPnl - s.pnl) / s.peakPnl * 100 : 0;
    if (dd > s.maxDD) s.maxDD = dd;

    const cfg  = getTierCfg(pair, tid);
    const wr   = (s.wins / s.trades * 100).toFixed(1);
    const icon = isWin ? '✅' : '❌';
    console.log(`[${cfg.label}] ${icon} ${pair}:${strat} | WR:${wr}% | PnL:${s.pnl>=0?'+':''}$${s.pnl.toFixed(4)} | t:${s.trades}`);

    // Régression si DD ou consecL dépassés en LIVE
    if (cfg.mode === 'LIVE') {
        if (s.maxDD >= cfg.maxDD || s.consecL >= cfg.maxConsecL) {
            pairTier[pair] = Math.max(0, tid - 1);
            const prevCfg = getTierCfg(pair, pairTier[pair]);
            console.log(`[REGRESS] ⚠️  ${pair} ${cfg.label} → ${prevCfg.label} (DD:${s.maxDD.toFixed(1)}% CL:${s.consecL})`);
        }
    }

    saveState();
    tryPromote(pair);
}

// ─── PROMOTION LOGIC ─────────────────────────────────────────────────────────
function tryPromote(pair) {
    const tid    = pairTier[pair] || 0;
    if (tid >= TIER_SIZES.length - 1) return;

    const strats  = PAIRS_CONFIG[pair]?.strategies || [];
    const allPass = strats.every(strat => evalCP(pair, tid, strat).pass);
    if (!allPass) return;

    pairTier[pair] = tid + 1;
    const cfg     = getTierCfg(pair, tid);
    const nextCfg = getTierCfg(pair, tid + 1);

    // Init stats tier suivant si vide
    for (const strat of strats) {
        const nk = statKey(pair, tid + 1, strat);
        if (!tierStats[nk]) tierStats[nk] = {
            trades: 0, wins: 0, losses: 0, pnl: 0,
            peakPnl: 0, maxDD: 0, consecL: 0,
            startTime: Date.now(), promotedAt: Date.now(),
        };
    }

    const arrow = nextCfg.mode === 'LIVE' ? '🟢 LIVE!' : '📝 paper+';
    console.log(`\n[PROMOTE] ${arrow}  ${pair}: ${cfg.label} → ${nextCfg.label}`);
    const ev = evalCP(pair, tid, strats[0]);
    if (ev.checks) ev.checks.forEach(c => console.log(`   ${c.pass?'✓':'✗'} ${c.name} = ${c.val}`));
    saveState();
}

// ─── OBELISK LIVE EXECUTION ──────────────────────────────────────────────────
function apiPost(endpoint, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const req  = http.request({
            hostname: 'localhost', port: 3001, path: endpoint, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        }, res => {
            let raw = '';
            res.on('data', c => raw += c);
            res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({}); } });
        });
        req.on('error', reject);
        req.write(data); req.end();
    });
}

async function executeLive(pair, signal, size, leverage) {
    try {
        const r = await apiPost('/api/trade/order', {
            source: 'stablecoin-trader',
            symbol: `${pair}USDT`,
            side:   signal.side,
            size, leverage,
            tp: signal.tp, sl: signal.sl,
            strategy: signal.strategy,
            confidence: signal.confidence,
        });
        if (r.success || r.orderId) {
            console.log(`[LIVE] ✅ ${pair} ${signal.side} $${size} | ${signal.strategy}`);
        } else {
            console.log(`[LIVE] ⚠️  ${pair} rejected:`, r.error || '?');
        }
    } catch (e) {
        console.log(`[LIVE] ❌ ${pair}:`, e.message);
    }
}

// ─── STATUS REPORT ───────────────────────────────────────────────────────────
function printStatus() {
    console.log('\n═══════════════ STABLECOIN TRADER V3.0 ═══════════════');
    for (const [pair, pcfg] of Object.entries(PAIRS_CONFIG)) {
        const tid  = pairTier[pair] || 0;
        const cfg  = getTierCfg(pair, tid);
        const icon = cfg.mode === 'LIVE' ? '🟢' : '📝';
        console.log(`${icon} ${pair} [${cfg.label}]  — ${pcfg.particularite}`);
        for (const strat of pcfg.strategies) {
            const s  = tierStats[statKey(pair, tid, strat)];
            if (!s || s.trades === 0) { console.log(`     ${strat}: 0 trades`); continue; }
            const wr = (s.wins / s.trades * 100).toFixed(1);
            const ev = evalCP(pair, tid, strat);
            const bar = (ev.checks || []).map(c => c.pass ? '✓' : '✗').join('');
            console.log(`     ${strat}: t:${s.trades} WR:${wr}% PnL:$${s.pnl.toFixed(4)} DD:${s.maxDD.toFixed(1)}% [${bar}]`);
        }
        // Ladder visuel
        const ldr = TIER_SIZES.map((sz, i) =>
            i < tid ? `✓${sz}` : i === tid ? `[${sz}]` : `${sz}`
        ).join('→');
        console.log(`     ${ldr}`);
    }
    console.log('═══════════════════════════════════════════════════════\n');
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🏦 OBELISK STABLECOIN TRADER V3.0 — Tier Ladder');
    console.log('   $1→$2→$3→$4→$5 paper → $10→$15→$20→$30→$50→$100 live');
    console.log('═══════════════════════════════════════════════════════');

    initState(); loadState();

    console.log('Pairs:', Object.entries(pairTier).map(([p,t]) =>
        `${p}:${getTierCfg(p, t).label}`).join(' | '), '\n');

    // Vérif Obelisk (non-bloquant si down)
    await new Promise(res =>
        http.get('http://localhost:3001/api/health', r => { r.resume(); res(); }).on('error', res)
    ).then(() => console.log('[STABLE-TRADER] Obelisk ✓'))
     .catch(() => console.warn('[STABLE-TRADER] Obelisk offline — paper only'));

    const hft = new HFTModule({
        enabled: true, paperMode: true,
        scanInterval: 15000,
        pairs: ALL_PAIRS,
        minConfidence: 70,
        liveStrategies: ['STABLE_DEPEG', 'SPREAD', 'RSI_EXTREME'],
        trendFilterMode: 'LIVE',
    });

    // Hook executeTrade
    const origExec = hft.executeTrade.bind(hft);
    hft.executeTrade = async function(signal, pair, price) {
        const result = await origExec(signal, pair, price);
        if (!result) return result;

        const strat = result.strategy;
        const pcfg  = PAIRS_CONFIG[pair];
        if (!pcfg || !pcfg.strategies.includes(strat)) return result;

        recordResult(pair, strat, result.isWin, result.pnlAmount || 0);

        const cfg = getTierCfg(pair, pairTier[pair] || 0);
        if (cfg.mode === 'LIVE' && result.isWin !== undefined) {
            await executeLive(pair, { ...signal, price }, cfg.size, pcfg.leverage);
        }
        return result;
    };

    hft.start();
    console.log('[STABLE-TRADER] ✓ started\n');

    printStatus();
    setInterval(printStatus, 600_000);
    setInterval(() => ALL_PAIRS.forEach(tryPromote), 300_000);
}

main().catch(e => { console.error('[STABLE-TRADER] Fatal:', e); process.exit(1); });
