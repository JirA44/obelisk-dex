/**
 * OBELISK STABLECOIN TRADER V2.1
 * Paper → Shadow → Auto-Live avec checkpoints de promotion
 *
 * Hook: monkey-patch hft.executeTrade() → capture résultats par pair+strat
 *
 * Phases par pair:
 *   PAPER  → paper sim HFTModule, tracking métriques réelles
 *   SHADOW → checkpoints passés, validation 24h sans régression
 *   LIVE   → exécution réelle via Obelisk Perps API
 *
 * Checkpoints de promotion:
 *   ✓ trades ≥ 30
 *   ✓ WR > break_even + 5%  (STABLE_DEPEG→38%, SPREAD→37%, RSI_EXTREME→45%)
 *   ✓ PnL > 0
 *   ✓ MaxDrawdown < 20%
 *   ✓ ConsecLosses < 5
 *   ✓ Shadow stable 24h sans régression
 */

const path = require('path');
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const os    = require('os');

const MIXBOT_DIR  = path.join(os.homedir(), 'mixbot');
const STATE_FILE  = path.join(__dirname, 'data', 'stablecoin_trader_state.json');

// ─── IMPORT HFTMODULE ────────────────────────────────────────────────────────
let HFTModule;
try {
    ({ HFTModule } = require(path.join(MIXBOT_DIR, 'hft_module.js')));
    console.log('[STABLE-TRADER] HFTModule loaded ✓');
} catch (e) {
    console.error('[STABLE-TRADER] FATAL: HFTModule:', e.message);
    process.exit(1);
}

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PAIRS_CONFIG = {
    USDE:  { strategies: ['STABLE_DEPEG'],            tradeSize: 5, leverage: 1 },
    FDUSD: { strategies: ['STABLE_DEPEG'],            tradeSize: 5, leverage: 1 },
    FRAX:  { strategies: ['STABLE_DEPEG'],            tradeSize: 5, leverage: 2 },
    PAXG:  { strategies: ['SPREAD', 'RSI_EXTREME'],   tradeSize: 5, leverage: 3 },
    XAUT:  { strategies: ['SPREAD', 'RSI_EXTREME'],   tradeSize: 5, leverage: 3 },
};
const ALL_PAIRS = Object.keys(PAIRS_CONFIG);

// Break-even WR + seuil promotion par stratégie
const STRAT_CFG = {
    STABLE_DEPEG: { be: 33.3, promote: 38, label: 'RR 2.0' },
    SPREAD:       { be: 32.5, promote: 37, label: 'RR 2.08' },
    RSI_EXTREME:  { be: 40.0, promote: 45, label: 'RR 1.5' },
};

const CP = {               // Checkpoints
    minTrades:    30,      // trades paper minimum
    maxDD:        20,      // % max drawdown
    maxConsecL:    5,      // pertes consécutives max
    shadowHours:  24,      // heures en SHADOW avant LIVE
    minConf:      70,      // confidence HFT minimum
};

const PHASE = { PAPER: 'PAPER', SHADOW: 'SHADOW', LIVE: 'LIVE' };

// ─── STATE ───────────────────────────────────────────────────────────────────
let pairPhase = {};  // { USDE: 'PAPER', ... }
let pStats    = {};  // { 'USDE:STABLE_DEPEG': { trades, wins, pnl, maxDD, peakPnl, consecL, shadowSince, promotedAt } }

function statKey(pair, strat) { return `${pair}:${strat}`; }

function initState() {
    for (const [pair, cfg] of Object.entries(PAIRS_CONFIG)) {
        if (!pairPhase[pair]) pairPhase[pair] = PHASE.PAPER;
        for (const strat of cfg.strategies) {
            const k = statKey(pair, strat);
            if (!pStats[k]) pStats[k] = { trades: 0, wins: 0, losses: 0, pnl: 0, peakPnl: 0, maxDD: 0, consecL: 0, shadowSince: null, promotedAt: null };
        }
    }
}

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const d = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            if (d.pairPhase) Object.assign(pairPhase, d.pairPhase);
            if (d.pStats)    Object.assign(pStats,    d.pStats);
        }
    } catch (e) { /* fresh */ }
}

function saveState() {
    try {
        const dir = path.dirname(STATE_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(STATE_FILE, JSON.stringify({ pairPhase, pStats }, null, 2));
    } catch (e) {}
}

// ─── CHECKPOINT EVALUATOR ────────────────────────────────────────────────────
function evalCP(pair, strat) {
    const s   = pStats[statKey(pair, strat)];
    const cfg = STRAT_CFG[strat];
    if (!s || !cfg) return { pass: false };
    const wr = s.trades > 0 ? s.wins / s.trades * 100 : 0;
    const checks = [
        { name: `trades≥${CP.minTrades}`,  pass: s.trades  >= CP.minTrades,  val: s.trades },
        { name: `WR>${cfg.promote}%`,       pass: wr        >= cfg.promote,   val: wr.toFixed(1)+'%' },
        { name: 'PnL>0',                    pass: s.pnl     >  0,             val: '$'+s.pnl.toFixed(4) },
        { name: `DD<${CP.maxDD}%`,          pass: s.maxDD   <  CP.maxDD,      val: s.maxDD.toFixed(1)+'%' },
        { name: `CL<${CP.maxConsecL}`,      pass: s.consecL <  CP.maxConsecL, val: s.consecL },
    ];
    return { pass: checks.every(c => c.pass), checks, wr, pnl: s.pnl, trades: s.trades };
}

// ─── RECORD TRADE RESULT ─────────────────────────────────────────────────────
function recordResult(pair, strat, isWin, pnl) {
    const k = statKey(pair, strat);
    const s = pStats[k];
    if (!s) return;

    s.trades++;
    if (isWin) { s.wins++; s.consecL = 0; }
    else        { s.losses++; s.consecL++; }
    s.pnl += pnl;
    if (s.pnl > s.peakPnl) s.peakPnl = s.pnl;
    const dd = s.peakPnl > 0 ? (s.peakPnl - s.pnl) / s.peakPnl * 100 : 0;
    if (dd > s.maxDD) s.maxDD = dd;

    const wr   = (s.wins / s.trades * 100).toFixed(1);
    const icon = isWin ? '✅' : '❌';
    console.log(`[${pairPhase[pair]}] ${icon} ${pair}:${strat} | WR:${wr}% | PnL:${s.pnl>=0?'+':''}$${s.pnl.toFixed(4)} | t:${s.trades}`);

    // Régression en SHADOW → rollback PAPER
    if (pairPhase[pair] === PHASE.SHADOW) {
        const ev = evalCP(pair, strat);
        if (!ev.pass) {
            s.shadowSince = null;
            pairPhase[pair] = PHASE.PAPER;
            console.log(`[REGRESS] ⚠️  ${pair}:${strat} régression → retour PAPER`);
        }
    }

    saveState();
    tryPromote(pair);
}

// ─── PROMOTION LOGIC ─────────────────────────────────────────────────────────
function tryPromote(pair) {
    const phase = pairPhase[pair];
    if (phase === PHASE.LIVE) return;

    const strats = PAIRS_CONFIG[pair]?.strategies || [];
    const allPass = strats.every(strat => {
        const ev = evalCP(pair, strat);
        if (!ev.pass) return false;

        const s = pStats[statKey(pair, strat)];
        if (phase === PHASE.PAPER && !s.shadowSince) {
            s.shadowSince = Date.now();
            console.log(`\n[PROMOTE] 🟡 ${pair}:${strat} checkpoints OK → SHADOW (24h validation...)`);
            ev.checks.forEach(c => console.log(`   ${c.pass?'✓':'✗'} ${c.name} = ${c.val}`));
        }

        if (phase === PHASE.SHADOW) {
            const hrs = (Date.now() - (s.shadowSince || 0)) / 3600000;
            return hrs >= CP.shadowHours;
        }
        return phase === PHASE.PAPER && !!s.shadowSince;
    });

    if (!allPass) return;

    if (phase === PHASE.PAPER) {
        pairPhase[pair] = PHASE.SHADOW;
        console.log(`\n[PROMOTE] 🟡 ${pair} → SHADOW`);
    } else if (phase === PHASE.SHADOW) {
        pairPhase[pair] = PHASE.LIVE;
        strats.forEach(strat => { pStats[statKey(pair, strat)].promotedAt = Date.now(); });
        console.log(`\n[PROMOTE] 🟢 ${pair} → LIVE ✅  Paper validé — trading réel activé!`);
    }
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

async function executeLive(pair, signal) {
    const cfg = PAIRS_CONFIG[pair];
    try {
        const r = await apiPost('/api/trade/order', {
            source: 'stablecoin-trader',
            symbol: `${pair}USDT`,
            side:   signal.side,
            size:   cfg.tradeSize,
            leverage: cfg.leverage,
            tp: signal.tp, sl: signal.sl,
            strategy: signal.strategy,
            confidence: signal.confidence,
        });
        if (r.success || r.orderId) {
            console.log(`[LIVE] ✅ OPEN ${pair} ${signal.side} | ${signal.strategy} | $${cfg.tradeSize}`);
        } else {
            console.log(`[LIVE] ⚠️  ${pair} rejected:`, r.error || '?');
        }
    } catch (e) {
        console.log(`[LIVE] ❌ ${pair}:`, e.message);
    }
}

// ─── STATUS REPORT ───────────────────────────────────────────────────────────
function printStatus() {
    console.log('\n══════════════════ STABLECOIN TRADER STATUS ══════════════════');
    for (const [pair, cfg] of Object.entries(PAIRS_CONFIG)) {
        const ph   = pairPhase[pair];
        const icon = ph === PHASE.LIVE ? '🟢' : ph === PHASE.SHADOW ? '🟡' : '📝';
        console.log(`${icon} ${pair} [${ph}]`);
        for (const strat of cfg.strategies) {
            const s   = pStats[statKey(pair, strat)];
            if (!s || s.trades === 0) { console.log(`     ${strat}: 0 trades`); continue; }
            const wr  = (s.wins / s.trades * 100).toFixed(1);
            const thr = STRAT_CFG[strat];
            const ev  = evalCP(pair, strat);
            const bar = (ev.checks || []).map(c => c.pass ? '✓' : '✗').join('');
            const shd = s.shadowSince ? ` shadow:${((Date.now()-s.shadowSince)/3600000).toFixed(1)}h/24h` : '';
            console.log(`     ${strat}: t:${s.trades} WR:${wr}% (need:${thr?.promote}%) PnL:$${s.pnl.toFixed(4)} DD:${s.maxDD.toFixed(1)}% [${bar}]${shd}`);
        }
    }
    console.log('═══════════════════════════════════════════════════════════════\n');
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🏦 OBELISK STABLECOIN TRADER V2.1 — Paper→Shadow→Live');
    console.log('═══════════════════════════════════════════════════════════════');

    initState(); loadState();

    console.log('Pairs     :', ALL_PAIRS.join(', '));
    console.log('Strats    : STABLE_DEPEG (depeg) | SPREAD + RSI_EXTREME (gold RWA)');
    console.log('Checkpoints: trades≥30 | WR>seuil | PnL>0 | DD<20% | CL<5 | shadow 24h');
    console.log('Phases cur:', Object.entries(pairPhase).map(([p,ph])=>`${p}:${ph}`).join(' | '), '\n');

    // Vérif Obelisk
    await new Promise((res, rej) => http.get('http://localhost:3001/api/health', r=>{ let d=''; r.on('data',c=>d+=c); r.on('end',res); }).on('error', rej))
        .then(() => console.log('[STABLE-TRADER] Obelisk reachable ✓'))
        .catch(e => { console.error('Obelisk not reachable:', e.message); process.exit(1); });

    // Init HFTModule en paper mode
    const hft = new HFTModule({
        enabled: true, paperMode: true,
        scanInterval: 15000,
        pairs: ALL_PAIRS,
        minConfidence: CP.minConf,
        liveStrategies: ['STABLE_DEPEG', 'SPREAD', 'RSI_EXTREME'],
        trendFilterMode: 'LIVE',
    });

    // ── HOOK: monkey-patch executeTrade ──────────────────────────────────────
    // executeTrade(signal, pair, price) → { strategy, pair, side, isWin, pnlAmount }
    const origExec = hft.executeTrade.bind(hft);
    hft.executeTrade = async function(signal, pair, price) {
        const result = await origExec(signal, pair, price);
        if (!result) return result;

        const strat = result.strategy;
        const cfg   = PAIRS_CONFIG[pair];

        // Filtre: seulement nos pairs + stratégies autorisées
        if (!cfg || !cfg.strategies.includes(strat)) return result;

        // Record résultat paper
        recordResult(pair, strat, result.isWin, result.pnlAmount || 0);

        // Si LIVE: exécuter en plus via Obelisk (paper HFTModule reste actif pour stats)
        if (pairPhase[pair] === PHASE.LIVE && result.isWin !== undefined) {
            await executeLive(pair, { ...signal, price });
        }

        return result;
    };
    // ─────────────────────────────────────────────────────────────────────────

    hft.start();
    console.log('[STABLE-TRADER] HFTModule started — hook executeTrade actif\n');

    printStatus();
    setInterval(printStatus,   600_000);   // status toutes les 10 min
    setInterval(() => ALL_PAIRS.forEach(tryPromote), 300_000);  // check promotion 5 min
}

main().catch(e => { console.error('[STABLE-TRADER] Fatal:', e); process.exit(1); });
