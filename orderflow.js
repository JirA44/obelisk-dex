#!/usr/bin/env node
/**
 * ORDERFLOW — Pression achat/vente par asset
 * Affiche: imbalance bid/ask, delta cumulatif, tape, gros trades
 *
 * Usage:
 *   node orderflow.js              # BTC ETH SOL par défaut
 *   node orderflow.js btc eth sol arb
 *   node orderflow.js --interval 1
 */

const http = require('http');

// ── Config ───────────────────────────────────────────────────────────────────
const API      = 'http://localhost:3001';
const DEFAULT_PAIRS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC'];
const TICK     = 0.01;

// Seuils "gros trade" par asset ($)
const BIG_TRADE = { BTC: 50000, ETH: 15000, SOL: 3000, DEFAULT: 5000 };

// Parse args
const args = process.argv.slice(2);
let interval = 2000;
let pairs = [];

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--interval' || args[i] === '-i') {
        interval = parseFloat(args[++i]) * 1000;
    } else {
        const b = args[i].toUpperCase();
        pairs.push(b.includes('/') ? b : `${b}/USDC`);
    }
}
if (!pairs.length) pairs = DEFAULT_PAIRS;

// ── State ─────────────────────────────────────────────────────────────────────
const prevPrice  = {};
const cumDelta   = {};   // cumul depuis démarrage
const seenTrades = {};   // Set d'IDs pour ne pas recompter
const ticks      = {};   // { pair: { up, down, rem } }
const volAtPrice = {};   // { pair: { 'price_key': { buy, sell } } }
const candle     = {};   // { pair: { open, high, low, close, buyVol, sellVol, startMin } }
const candleHist = {};   // { pair: [ last 3 closed candles ] }

function candleMin() { return Math.floor(Date.now() / 60000); }

function updateCandle(pair, price, trades) {
    const min = candleMin();
    if (!candle[pair] || candle[pair].startMin !== min) {
        if (candle[pair]) {
            if (!candleHist[pair]) candleHist[pair] = [];
            candleHist[pair].push({ ...candle[pair], close: price });
            if (candleHist[pair].length > 3) candleHist[pair].shift();
        }
        candle[pair] = { open: price, high: price, low: price, close: price,
                         buyVol: 0, sellVol: 0, startMin: min, seenIds: new Set() };
    }
    const c = candle[pair];
    c.close = price;
    if (price > c.high) c.high = price;
    if (price < c.low)  c.low  = price;
    // Volume intra-candle (nouveaux trades seulement)
    for (const t of trades) {
        if (c.seenIds.has(t.id)) continue;
        c.seenIds.add(t.id);
        if (t.side === 'buy') c.buyVol  += t.total;
        else                   c.sellVol += t.total;
    }
}

// Tick size par asset (granularité du ladder)
function tickSize(pair) {
    const base = pair.split('/')[0];
    if (base === 'BTC')  return 1.00;
    if (base === 'ETH')  return 0.10;
    if (base === 'SOL')  return 0.01;
    return 0.01;
}

// ── HTTP ──────────────────────────────────────────────────────────────────────
function get(path) {
    return new Promise((resolve, reject) => {
        http.get(`${API}${path}`, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
        }).on('error', reject);
    });
}

async function fetchAll(pair) {
    const enc = encodeURIComponent(pair);
    const [ticker, book, trades] = await Promise.all([
        get(`/api/ticker/${enc}`),
        get(`/api/orderbook/${enc}`),
        get(`/api/trades/${enc}`),
    ]);
    return { ticker, book, trades: trades.trades || [] };
}

// ── Metrics ───────────────────────────────────────────────────────────────────
function calcImbalance(bids, asks, depth = 10) {
    const bidVol = bids.slice(0, depth).reduce((s, b) => s + b.total, 0);
    const askVol = asks.slice(0, depth).reduce((s, a) => s + a.total, 0);
    const total  = bidVol + askVol;
    const bidPct = total ? bidVol / total : 0.5;
    return { bidVol, askVol, bidPct };
}

function calcDelta(pair, trades) {
    if (!cumDelta[pair])    cumDelta[pair]    = 0;
    if (!seenTrades[pair])  seenTrades[pair]  = new Set();
    if (!volAtPrice[pair])  volAtPrice[pair]  = {};

    const ts = tickSize(pair);
    let newBuy = 0, newSell = 0;
    for (const t of trades) {
        if (seenTrades[pair].has(t.id)) continue;
        seenTrades[pair].add(t.id);
        if (t.side === 'buy')  newBuy  += t.total;
        else                   newSell += t.total;

        // Accumule volume au niveau de prix arrondi au tick
        const lvl = (Math.round(t.price / ts) * ts).toFixed(
            ts < 1 ? String(ts).split('.')[1].length : 0
        );
        if (!volAtPrice[pair][lvl]) volAtPrice[pair][lvl] = { buy: 0, sell: 0 };
        if (t.side === 'buy') volAtPrice[pair][lvl].buy  += t.total;
        else                   volAtPrice[pair][lvl].sell += t.total;
    }
    cumDelta[pair] += newBuy - newSell;

    if (seenTrades[pair].size > 500) {
        const arr = [...seenTrades[pair]];
        seenTrades[pair] = new Set(arr.slice(-200));
    }
    return cumDelta[pair];
}

function updateTicks(pair, delta) {
    if (!ticks[pair]) ticks[pair] = { up: 0, down: 0, rem: 0 };
    const t = ticks[pair];
    const ts = tickSize(pair);
    const total = t.rem + delta;
    const n = Math.floor(Math.abs(total) / ts + 1e-9);  // epsilon anti floating point
    if (n > 0) {
        if (total > 0) t.up   += n;
        else           t.down += n;
        t.rem = total - Math.sign(total) * n * ts;
    } else {
        t.rem = total;
    }
}

function tickLadder(pair, price, levels = 5) {
    const ts  = tickSize(pair);
    const dec = ts < 1 ? String(ts).split('.')[1].length : 0;
    const vap = volAtPrice[pair] || {};
    const center = Math.round(price / ts) * ts;
    const rows = [];
    const maxVol = Math.max(1, ...Object.values(vap).map(v => v.buy + v.sell));
    const BAR_W = 12;

    for (let i = levels; i >= -levels; i--) {
        const lvlRaw = center + i * ts;
        const lvl    = lvlRaw.toFixed(dec);
        const v      = vap[lvl] || { buy: 0, sell: 0 };
        const total  = v.buy + v.sell;
        const isCenter = i === 0;

        // Mini bar: buy left, sell right, width=BAR_W
        const bLen = total ? Math.round(v.buy  / maxVol * BAR_W) : 0;
        const sLen = total ? Math.round(v.sell / maxVol * BAR_W) : 0;
        const buyBar  = C.g + '▪'.repeat(bLen)  + C.r;
        const sellBar = C.rd + '▪'.repeat(sLen) + C.r;
        const emptyL  = C.gr + ' '.repeat(BAR_W - bLen) + C.r;
        const emptyR  = C.gr + ' '.repeat(BAR_W - sLen) + C.r;

        const priceLabel = isCenter
            ? `${C.b}${C.cy}>${lvl.padStart(10)}<${C.r}`
            : `${C.gr} ${lvl.padStart(10)} ${C.r}`;

        const volStr = total > 0
            ? `${C.g}${fmtUSD(v.buy).padStart(7)}${C.r} ${C.rd}${fmtUSD(v.sell).padStart(7)}${C.r}`
            : `${C.gr}$0      $0     ${C.r}`;

        rows.push(`    ${emptyL}${buyBar}${priceLabel}${sellBar}${emptyR}  ${volStr}`);
    }
    return rows;
}

function recentDelta(trades, n = 20) {
    const recent = trades.slice(0, n);
    const buy  = recent.filter(t => t.side === 'buy').reduce((s, t) => s + t.total, 0);
    const sell = recent.filter(t => t.side === 'sell').reduce((s, t) => s + t.total, 0);
    return { buy, sell, delta: buy - sell };
}

// ── Formatting ────────────────────────────────────────────────────────────────
const C = {
    r: '\x1b[0m', b: '\x1b[1m', d: '\x1b[2m',
    g: '\x1b[32m', rd: '\x1b[31m', y: '\x1b[33m',
    cy: '\x1b[36m', w: '\x1b[37m', gr: '\x1b[90m',
    bg: '\x1b[42m', br: '\x1b[41m', by: '\x1b[43m',
};

function fmtUSD(n, decimals = 0) {
    if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n/1e3).toFixed(1)}K`;
    return `$${n.toFixed(decimals)}`;
}

function fmtPrice(p) {
    if (p >= 1000) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (p >= 1)    return `$${p.toFixed(4)}`;
    return `$${p.toFixed(6)}`;
}

function fmtDelta(delta, price) {
    if (Math.abs(delta) < TICK - 0.0001) return `${C.gr}→ $0.00${C.r}`;
    const sign  = delta > 0 ? '+' : '-';
    const arrow = delta > 0 ? '▲' : '▼';
    const color = delta > 0 ? C.g : C.rd;
    const abs   = Math.abs(delta);
    const str   = abs >= 1000 ? `$${abs.toLocaleString('en-US', {maximumFractionDigits:2})}` : abs >= 1 ? `$${abs.toFixed(4)}` : `$${abs.toFixed(6)}`;
    const pct   = (Math.abs(delta) / price * 100).toFixed(3);
    return `${color}${arrow} ${sign}${str} (${sign}${pct}%)${C.r}`;
}

function imbalanceBar(bidPct, width = 30) {
    const bidLen = Math.round(bidPct * width);
    const askLen = width - bidLen;
    const bidBar = C.g + '█'.repeat(bidLen) + C.r;
    const askBar = C.rd + '█'.repeat(askLen) + C.r;
    return bidBar + askBar;
}

function pressureLabel(bidPct) {
    if (bidPct > 0.65) return `${C.g}${C.b}▲▲ FORT ACHAT${C.r}`;
    if (bidPct > 0.55) return `${C.g}▲ Achat${C.r}`;
    if (bidPct < 0.35) return `${C.rd}${C.b}▼▼ FORTE VENTE${C.r}`;
    if (bidPct < 0.45) return `${C.rd}▼ Vente${C.r}`;
    return `${C.y}◆ Neutre${C.r}`;
}

function tape(trades, pair, n = 6) {
    const threshold = BIG_TRADE[pair.split('/')[0]] || BIG_TRADE.DEFAULT;
    return trades.slice(0, n).map(t => {
        const isBig = t.total >= threshold;
        const color = t.side === 'buy' ? C.g : C.rd;
        const sym   = t.side === 'buy' ? 'B' : 'S';
        const size  = fmtUSD(t.total);
        const flag  = isBig ? `${C.y}★${C.r}` : '';
        return `${color}${sym}${C.r}${size}${flag}`;
    }).join('  ');
}

function deltaBar(buy, sell, width = 24) {
    const total = buy + sell || 1;
    const buyLen = Math.round(buy / total * width);
    const sellLen = width - buyLen;
    return C.g + '▓'.repeat(buyLen) + C.r + C.rd + '▓'.repeat(sellLen) + C.r;
}

// ── Render ────────────────────────────────────────────────────────────────────
function render(results) {
    const now = new Date().toLocaleTimeString('fr-FR');
    const w   = Math.min(process.stdout.columns || 80, 100);
    const sep = '═'.repeat(w);
    const sep2 = '─'.repeat(w);

    process.stdout.write('\x1b[2J\x1b[H');

    console.log(`${C.b}${C.cy}${sep}${C.r}`);
    console.log(`${C.b}  ORDERFLOW  ${C.gr}${now}  ${C.d}interval=${interval/1000}s${C.r}`);
    console.log(`${C.b}${C.cy}${sep}${C.r}`);

    for (const { pair, data, error } of results) {
        console.log();
        if (error) {
            console.log(`  ${C.b}${pair}${C.r}  ${C.rd}Erreur: ${error}${C.r}`);
            console.log(`  ${C.gr}${sep2}${C.r}`);
            continue;
        }

        const { ticker, book, trades } = data;
        const price   = ticker.price;
        const delta   = price - (prevPrice[pair] || price);
        prevPrice[pair] = price;
        updateTicks(pair, delta);
        updateCandle(pair, price, trades);

        const { bidVol, askVol, bidPct } = calcImbalance(book.bids, book.asks);
        const cumD    = calcDelta(pair, trades);
        const { buy: rBuy, sell: rSell, delta: rDelta } = recentDelta(trades, 20);
        const spread  = book.spread || (book.asks[0]?.price - book.bids[0]?.price);

        // ── Header ligne ──
        const priceStr = `${C.b}${fmtPrice(price)}${C.r}`;
        const deltaStr = fmtDelta(delta, price);
        const pressStr = pressureLabel(bidPct);
        console.log(`  ${C.b}${C.w}${pair}${C.r}  ${priceStr}  ${deltaStr}   ${pressStr}`);

        // ── Spread ──
        console.log(`  ${C.gr}Spread: ${fmtUSD(spread, 4)}${C.r}`);

        // ── Imbalance ──
        const bar = imbalanceBar(bidPct);
        const bidPctStr  = `${(bidPct*100).toFixed(1)}%`;
        const askPctStr  = `${((1-bidPct)*100).toFixed(1)}%`;
        console.log(`  ${C.g}Bid${C.r} [${bar}] ${C.rd}Ask${C.r}  ${C.g}${fmtUSD(bidVol)} ${bidPctStr}${C.r} vs ${C.rd}${fmtUSD(askVol)} ${askPctStr}${C.r}`);

        // ── Delta récent (20 derniers trades) ──
        const dBar  = deltaBar(rBuy, rSell);
        const dSign = rDelta >= 0 ? '+' : '';
        const dCol  = rDelta >= 0 ? C.g : C.rd;
        console.log(`  ${C.d}Delta(20t)${C.r} [${dBar}]  ${dCol}${dSign}${fmtUSD(rDelta)}${C.r}  ${C.gr}B:${fmtUSD(rBuy)} S:${fmtUSD(rSell)}${C.r}`);

        // ── Delta cumulatif session ──
        const cdSign = cumD >= 0 ? '+' : '';
        const cdCol  = cumD >= 0 ? C.g : C.rd;
        console.log(`  ${C.d}Delta cumulatif session${C.r}  ${cdCol}${cdSign}${fmtUSD(cumD)}${C.r}`);

        // ── Tape ──
        console.log(`  ${C.d}Tape${C.r}  ${tape(trades, pair, 7)}`);

        // ── Candle 1 min ──
        const cv = candle[pair];
        if (cv) {
            const elapsed = Math.floor((Date.now() - cv.startMin * 60000) / 1000);
            const chg     = cv.close - cv.open;
            const dir     = chg >= 0 ? C.g : C.rd;
            const dirSym  = chg >= 0 ? '▲' : '▼';
            const chgFmt  = Math.abs(chg) >= 1 ? `$${Math.abs(chg).toFixed(2)}` : `$${Math.abs(chg).toFixed(4)}`;
            const bvRatio = cv.buyVol + cv.sellVol > 0
                ? (cv.buyVol / (cv.buyVol + cv.sellVol) * 100).toFixed(0) : 50;
            const hist    = (candleHist[pair] || []).map(h =>
                h.close >= h.open ? `${C.g}▲${C.r}` : `${C.rd}▼${C.r}`).join('');
            console.log(`  ${C.d}1min[${elapsed}s]${C.r}  O:${fmtPrice(cv.open)} ${C.g}H:${fmtPrice(cv.high)}${C.r} ${C.rd}L:${fmtPrice(cv.low)}${C.r} C:${fmtPrice(cv.close)}  ${dir}${dirSym}${chgFmt}${C.r}  ${C.d}vol/min${C.r} ${C.g}B${fmtUSD(cv.buyVol)}${C.r} ${C.rd}S${fmtUSD(cv.sellVol)}${C.r} ${bvRatio}%buy  ${C.gr}hist:${hist}${C.r}`);
        }

        // ── Tick counter ──
        const tk    = ticks[pair] || { up: 0, down: 0 };
        const ts    = tickSize(pair);
        const net   = tk.up - tk.down;
        const nSign = net > 0 ? '+' : '';
        const nCol  = net > 0 ? C.g : net < 0 ? C.rd : C.gr;
        const bias  = Math.abs(net) >= 5
            ? (net > 0 ? `${C.g}${C.b}HAUSSIER${C.r}` : `${C.rd}${C.b}BAISSIER${C.r}`)
            : `${C.y}Neutre${C.r}`;
        console.log(`  ${C.d}Ticks(±$${ts})${C.r}  ${C.g}↑${tk.up}${C.r}  ${C.rd}↓${tk.down}${C.r}  net ${nCol}${nSign}${net}${C.r}  ${bias}`);

        // ── Price ladder ──
        console.log(`  ${C.d}Ladder ±5 niveaux  ${C.g}Buy${C.r}${''.padStart(10)} ${C.rd}Sell${C.r}`);
        for (const row of tickLadder(pair, price, 5)) console.log(row);

        console.log(`  ${C.gr}${sep2}${C.r}`);
    }

    // Legend
    console.log();
    console.log(`${C.gr}  ${C.g}█${C.r}${C.gr}=Bid  ${C.rd}█${C.r}${C.gr}=Ask  ${C.g}B${C.r}${C.gr}=Buy  ${C.rd}S${C.r}${C.gr}=Sell  ${C.y}★${C.r}${C.gr}=Gros trade  Tick: ±$${TICK}  Ctrl+C quitte${C.r}`);
    console.log(`${C.cy}${sep}${C.r}`);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
async function loop() {
    const results = await Promise.all(pairs.map(async pair => {
        try {
            const data = await fetchAll(pair);
            return { pair, data };
        } catch(e) {
            return { pair, error: e.message };
        }
    }));
    render(results);
    setTimeout(loop, interval);
}

process.stdout.write('\x1b[?25l');
process.on('SIGINT', () => { process.stdout.write('\x1b[?25h\x1b[2J\x1b[H'); process.exit(0); });

console.log('Chargement orderflow...');
loop();
