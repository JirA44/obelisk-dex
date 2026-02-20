#!/usr/bin/env node
/**
 * PRICE TRACKER — Indicateurs +/- par $0.01
 * Affiche les prix en temps réel avec flèches de mouvement
 *
 * Usage:
 *   node price-tracker.js           # Tous les assets
 *   node price-tracker.js btc eth sol  # Assets spécifiques
 *   node price-tracker.js --interval 1 # Refresh toutes les 1s (défaut: 2s)
 */

const http = require('http');

// ── Config ──────────────────────────────────────────────────────────────────
const API_URL      = 'http://localhost:3001/api/markets';
const DEFAULT_INTV = 2000;     // ms entre chaque fetch

// Tick size par défaut selon style de trading
const TICK_PRESETS = {
    hft:     { BTC: 0.01,  ETH: 0.01,  SOL: 0.001, DEFAULT: 0.01  },
    scalp:   { BTC: 1,     ETH: 0.10,  SOL: 0.01,  DEFAULT: 0.01  },
    swing:   { BTC: 100,   ETH: 5,     SOL: 0.50,  DEFAULT: 1     },
};

// Parse args
const args    = process.argv.slice(2);
let interval  = DEFAULT_INTV;
let filterPairs = [];
let tickOverride = null;   // valeur unique forcée (--tick 0.5)
let tickPreset  = 'hft';   // preset (--style scalp|swing|hft)

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--interval' || args[i] === '-i') {
        interval = parseFloat(args[++i]) * 1000;
    } else if (args[i] === '--tick' || args[i] === '-t') {
        tickOverride = parseFloat(args[++i]);
    } else if (args[i] === '--style' || args[i] === '-s') {
        tickPreset = args[++i].toLowerCase();
    } else {
        filterPairs.push(args[i].toUpperCase());
    }
}

// Résout le tick pour un pair donné
function TICK(pair) {
    if (tickOverride !== null) return tickOverride;
    const preset = TICK_PRESETS[tickPreset] || TICK_PRESETS.hft;
    const base   = (pair || '').split('/')[0];
    return preset[base] ?? preset.DEFAULT;
}

// ── State ────────────────────────────────────────────────────────────────────
const prev    = {};   // { pair: lastPrice }
const deltas  = {};   // { pair: [ ...last20 ] } pour mini sparkline
const ticks   = {};   // { pair: { up: N, down: N, rem: remainder } }
const MAX_HIST = 20;

// ── Candles 1 minute ─────────────────────────────────────────────────────────
const candle  = {};   // { pair: { open, high, low, close, tickUp, tickDown, rem, startMin } }
const candleHist = {}; // { pair: [ ...last5 candles fermées ] }

function candleMinute() { return Math.floor(Date.now() / 60000); }

function updateCandle(pair, price, delta) {
    const min = candleMinute();
    if (!candle[pair] || candle[pair].startMin !== min) {
        // Ferme la candle précédente
        if (candle[pair]) {
            if (!candleHist[pair]) candleHist[pair] = [];
            candleHist[pair].push({ ...candle[pair], close: price });
            if (candleHist[pair].length > 5) candleHist[pair].shift();
        }
        // Nouvelle candle
        candle[pair] = { open: price, high: price, low: price, close: price,
                         tickUp: 0, tickDown: 0, rem: 0, startMin: min };
    }
    const c  = candle[pair];
    c.close  = price;
    if (price > c.high) c.high = price;
    if (price < c.low)  c.low  = price;
    // Ticks par minute
    const tk    = TICK(pair);
    const total = c.rem + delta;
    const n     = Math.floor(Math.abs(total) / tk + 1e-9);
    if (n > 0) {
        if (total > 0) c.tickUp   += n;
        else           c.tickDown += n;
        c.rem = total - Math.sign(total) * n * tk;
    } else { c.rem = total; }
}

// ── Fetch ────────────────────────────────────────────────────────────────────
function fetchMarkets() {
    return new Promise((resolve, reject) => {
        http.get(API_URL, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch(e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// ── Formatting ───────────────────────────────────────────────────────────────
const C = {
    reset:  '\x1b[0m',
    bold:   '\x1b[1m',
    dim:    '\x1b[2m',
    green:  '\x1b[32m',
    red:    '\x1b[31m',
    yellow: '\x1b[33m',
    cyan:   '\x1b[36m',
    white:  '\x1b[37m',
    gray:   '\x1b[90m',
    bgGreen:'\x1b[42m',
    bgRed:  '\x1b[41m',
};

function fmtPrice(price, pair) {
    if (price >= 1000)  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1)     return `$${price.toFixed(4)}`;
    if (price >= 0.001) return `$${price.toFixed(6)}`;
    return `$${price.toExponential(4)}`;
}

function fmtDelta(delta, price, pair) {
    const tk = TICK(pair);
    if (Math.abs(delta) < tk - tk * 0.01) return `${C.gray}  →  $0.00    ${C.reset}`;
    const sign  = delta > 0 ? '+' : '-';
    const arrow = delta > 0 ? '▲' : '▼';
    const color = delta > 0 ? C.green : C.red;
    const abs   = Math.abs(delta);
    let   str;
    if (abs >= 1000)  str = `$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    else if (abs >= 1) str = `$${abs.toFixed(4)}`;
    else               str = `$${abs.toFixed(6)}`;
    const pct = Math.abs(delta / price * 100);
    const pctStr = pct >= 0.01 ? `${pct.toFixed(3)}%` : `<0.001%`;
    return `${color}${arrow} ${sign}${str} (${sign}${pctStr})${C.reset}`;
}

function sparkline(hist) {
    if (!hist || hist.length < 2) return '';
    const bars  = ['▁','▂','▃','▄','▅','▆','▇','█'];
    const min   = Math.min(...hist);
    const max   = Math.max(...hist);
    const range = max - min || 1;
    return hist.map(v => {
        const idx = Math.floor((v - min) / range * (bars.length - 1));
        return bars[idx];
    }).join('');
}

function padEnd(str, len) {
    // pad without counting ANSI codes
    const visible = str.replace(/\x1b\[[0-9;]*m/g, '');
    const pad = Math.max(0, len - visible.length);
    return str + ' '.repeat(pad);
}

// ── Render ───────────────────────────────────────────────────────────────────
function render(markets) {
    const now = new Date().toLocaleTimeString('fr-FR');

    // Filter — préférer USDC, dédupliquer par base asset
    let list = markets;
    // Déduplique : garde USDC en priorité, skip USDT si USDC existe déjà
    const seen = new Set();
    list = markets.filter(m => {
        const [base] = m.pair.split('/');
        if (seen.has(base)) return false;
        seen.add(base);
        return true;
    });
    if (filterPairs.length) {
        list = list.filter(m => {
            const base = m.pair.split('/')[0];
            return filterPairs.includes(base) || filterPairs.includes(m.pair.replace('/', ''));
        });
    }

    // Compute deltas + ticks
    for (const m of list) {
        const p     = m.pair;
        const delta = (prev[p] !== undefined) ? m.price - prev[p] : 0;
        prev[p] = m.price;

        if (!deltas[p]) deltas[p] = [];
        deltas[p].push(m.price);
        if (deltas[p].length > MAX_HIST) deltas[p].shift();

        // Candle 1 min
        updateCandle(p, m.price, delta);

        // Tick counting — accumule les moves par tick
        if (!ticks[p]) ticks[p] = { up: 0, down: 0, rem: 0 };
        const t  = ticks[p];
        const tk = TICK(p);
        const total = t.rem + delta;
        const n = Math.floor(Math.abs(total) / tk + 1e-9);
        if (n > 0) {
            if (total > 0) t.up   += n;
            else           t.down += n;
            t.rem = total - Math.sign(total) * n * tk;
        } else {
            t.rem = total;
        }
    }

    // Clear + draw
    process.stdout.write('\x1b[2J\x1b[H');

    const w = Math.min(process.stdout.columns || 80, 100);
    const sep = '═'.repeat(w);

    console.log(`${C.bold}${C.cyan}${sep}${C.reset}`);
    console.log(`${C.bold}  PRICE TRACKER  ${C.gray}${now}  ${C.dim}interval=${interval/1000}s  style=${tickPreset}${tickOverride !== null ? '  tick=$'+tickOverride : ''}${C.reset}`);
    console.log(`${C.bold}${C.cyan}${sep}${C.reset}`);
    console.log();

    for (const m of list) {
        const p      = m.pair;
        const delta  = (prev[p] !== undefined && deltas[p]?.length >= 2)
            ? m.price - deltas[p][deltas[p].length - 2]
            : 0;
        const dStr   = fmtDelta(delta, m.price, p);
        const pStr   = fmtPrice(m.price, p);
        const spark  = sparkline(deltas[p]);

        // Pair label (14 chars)
        const pairLabel = `${C.bold}${C.white}${p.padEnd(10)}${C.reset}`;

        // Price (18 chars)
        const priceStr = `${C.bold}${pStr.padStart(14)}${C.reset}`;

        // Delta (32 chars)
        const deltaStr = padEnd(dStr, 32);

        // Spark (20 chars)
        const sparkStr = `${C.gray}${spark}${C.reset}`;

        // Tick counter
        const tk  = ticks[p] || { up: 0, down: 0 };
        const tkSz = TICK(p);
        const net = tk.up - tk.down;
        const netSign = net > 0 ? '+' : '';
        const netCol  = net > 0 ? C.green : net < 0 ? C.red : C.gray;
        const tickStr = `${C.gray}${C.dim}↑${C.reset}${C.green}${tk.up}${C.reset} ${C.gray}${C.dim}↓${C.reset}${C.red}${tk.down}${C.reset} ${C.gray}(${netCol}${netSign}${net}${C.gray}) $${tkSz}${C.reset}`;

        console.log(`  ${pairLabel}  ${priceStr}   ${deltaStr}  ${sparkStr}  ${tickStr}`);

        // ── Candle 1 min ──
        const cv = candle[p];
        if (cv) {
            const ocStr = cv.close >= cv.open
                ? `${C.green}▲${C.reset}` : `${C.red}▼${C.reset}`;
            const chg   = cv.close - cv.open;
            const chgS  = chg >= 0 ? `${C.green}+` : `${C.red}`;
            const chgFmt = Math.abs(chg) >= 1 ? Math.abs(chg).toFixed(2) : Math.abs(chg).toFixed(4);
            const elapsed = Math.floor((Date.now() - cv.startMin * 60000) / 1000);
            const netT  = cv.tickUp - cv.tickDown;
            const netTC = netT > 0 ? C.green : netT < 0 ? C.red : C.gray;
            const prev5 = (candleHist[p] || []).slice(-3).map(h => {
                const d = h.close - h.open;
                return d >= 0 ? `${C.green}▲${C.reset}` : `${C.red}▼${C.reset}`;
            }).join('');
            console.log(`  ${C.dim}           1min [${elapsed}s]${C.reset}  O:${fmtPrice(cv.open,p)}  H:${C.green}${fmtPrice(cv.high,p)}${C.reset}  L:${C.red}${fmtPrice(cv.low,p)}${C.reset}  C:${fmtPrice(cv.close,p)}  ${ocStr}${chgS}$${chgFmt}${C.reset}  ${C.dim}ticks/min${C.reset} ${C.green}↑${cv.tickUp}${C.reset} ${C.red}↓${cv.tickDown}${C.reset} ${netTC}(${netT>0?'+':''}${netT})${C.reset}  ${C.gray}hist:${prev5}${C.reset}`);
        }
    }

    console.log();
    console.log(`${C.gray}  ${list.length} assets | style=${tickPreset} | BTC=$${TICK('BTC/USDC')} ETH=$${TICK('ETH/USDC')} SOL=$${TICK('SOL/USDC')} | ${C.dim}Ctrl+C quitte${C.reset}`);
    console.log(`${C.cyan}${sep}${C.reset}`);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
async function loop() {
    try {
        const data    = await fetchMarkets();
        const markets = data.markets || data;
        render(Array.isArray(markets) ? markets : []);
    } catch(e) {
        process.stdout.write('\x1b[2J\x1b[H');
        console.error(`${C.red}Erreur fetch: ${e.message}${C.reset}`);
        console.log(`${C.gray}API: ${API_URL}${C.reset}`);
    }
    setTimeout(loop, interval);
}

// ── Start ─────────────────────────────────────────────────────────────────────
process.stdout.write('\x1b[?25l'); // hide cursor
process.on('SIGINT', () => {
    process.stdout.write('\x1b[?25h\x1b[2J\x1b[H'); // restore cursor
    process.exit(0);
});

console.log('Chargement...');
loop();
