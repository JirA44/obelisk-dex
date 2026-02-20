/**
 * BREAKOUT ENGINE v1.0 — Multi-Timeframe S/R Breakout
 *
 * Strategy:
 *   1. Build 1m candles from 2s tick prices
 *   2. Detect support/resistance levels: zones tested 3+ times (configurable)
 *   3. Signal: price breaks through a tested level on 4th+ touch
 *   4. MTF filter: 5m EMA trend confirms direction
 *      - Bull MTF → only LONG breakouts
 *      - Bear MTF → only SHORT breakouts
 *      - Neutral  → both directions allowed (range MTF)
 *   5. Execute via ObeliskExecutor (0% fee, $5/trade)
 *
 * RR: SL 0.3% / TP 0.9% → 3:1 → break-even 25% WR
 *
 * Version: 1.0 | Date: 2026-02-19
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const TRACKING_DIR  = path.join(__dirname, '../../../data/tracking');
const TRADES_FILE   = path.join(TRACKING_DIR, 'breakout_trades.jsonl');
const SESSIONS_FILE = path.join(TRACKING_DIR, 'breakout_sessions.json');
if (!fs.existsSync(TRACKING_DIR)) fs.mkdirSync(TRACKING_DIR, { recursive: true });

// ─── Config ───────────────────────────────────────────────────────────────────

const CFG = {
    pairs:        ['BTC/USDC', 'ETH/USDC', 'SOL/USDC'],

    // Trade params
    sizeUsd:      5.00,
    slPct:        0.003,    // SL 0.3% (just inside broken level)
    tpPct:        0.009,    // TP 0.9% → 3:1 RR → break-even 25%
    maxHoldMs:    300000,   // 5 min max hold
    maxPositions: 3,

    // Candle building (from 2s ticks)
    tickInterval: 2000,     // fetch every 2s
    candleSec:    60,       // 1m candles

    // Level detection
    levelLookback:  50,     // look at last 50 candles (~50 min)
    minTouches:     3,      // min times price must test a level to be valid
    touchTolerance: 0.003,  // ±0.3% band around level counts as a "touch"
    breakoutPct:    0.001,  // 0.1% beyond level = confirmed breakout

    // Pre-breakout consolidation: last N candles must be inside the level
    consolidationCandles: 3,

    // MTF bias (1m EMA on 1m closes → simulates 5m trend)
    emaFast: 5,             // EMA5 on 1m closes  (5 min trend)
    emaSlow: 20,            // EMA20 on 1m closes (20 min trend)
    emaBand: 0.0003,        // 0.03% band → below = confirmed bull/bear

    // Cooldown
    cooldownMs: 120000,     // 2 min cooldown per pair/side after signal

    obeliskUrl: 'http://localhost:3001',
    executor:   'obelisk',
};

// ─── Engine ───────────────────────────────────────────────────────────────────

class BreakoutEngine {
    constructor(config = {}) {
        this.cfg = { ...CFG, ...config };

        // Per-pair candle state
        this.candles1m      = {};  // completed 1m candles
        this.currentCandle  = {};  // candle being built
        this.cfg.pairs.forEach(p => {
            this.candles1m[p]     = [];
            this.currentCandle[p] = null;
        });

        // Positions & cooldowns
        this.positions = {};
        this.cooldowns = {};

        // Executor
        this._executor = null;
        if (this.cfg.executor === 'obelisk') {
            const ObeliskExecutor = require('./obelisk-executor');
            this._executor = new ObeliskExecutor();
            console.log('[BREAKOUT] Executor: OBELISK');
        } else {
            console.log('[BREAKOUT] Executor: PAPER');
        }

        // Stats
        this.stats = {
            startTime: null,
            tradesOpened: 0, tradesClosed: 0,
            wins: 0, losses: 0, timeouts: 0,
            totalPnl: 0,
            breakoutsDetected: 0,
            byPair: {},
        };
        this.cfg.pairs.forEach(p => {
            this.stats.byPair[p] = { trades: 0, pnl: 0, wins: 0, breakouts: 0 };
        });

        this._running = false;
        this._timer   = null;
    }

    // ── Candle building ────────────────────────────────────────────────────────

    _addTick(pair, price, ts) {
        const candleMs  = this.cfg.candleSec * 1000;
        const candleTs  = Math.floor(ts / candleMs) * candleMs;

        if (!this.currentCandle[pair]) {
            this.currentCandle[pair] = { open: price, high: price, low: price, close: price, ts: candleTs, ticks: 1 };
            return false;
        }

        const c = this.currentCandle[pair];

        if (candleTs > c.ts) {
            // New period → push completed candle
            this.candles1m[pair].push({ ...c });
            const maxCandles = this.cfg.levelLookback + 20;
            if (this.candles1m[pair].length > maxCandles) this.candles1m[pair].shift();

            this.currentCandle[pair] = { open: price, high: price, low: price, close: price, ts: candleTs, ticks: 1 };
            return true; // new candle completed
        }

        if (price > c.high) c.high = price;
        if (price < c.low)  c.low  = price;
        c.close = price;
        c.ticks++;
        return false;
    }

    // ── Level detection ────────────────────────────────────────────────────────

    /**
     * Detect S/R levels using swing high/low detection.
     *
     * A swing high = local high: candle whose high > N candles on both sides.
     * A swing low  = local low:  candle whose low  < N candles on both sides.
     *
     * Multiple swing highs/lows within touchTolerance% → S/R level.
     * This prevents false clusters from random candle highs/lows.
     *
     * Returns [{level, touches, type: 'resistance'|'support'}] sorted by strength.
     */
    _detectLevels(pair) {
        const candles = this.candles1m[pair];
        const N       = 3; // candles on each side to confirm swing
        if (candles.length < N * 2 + this.cfg.minTouches) return [];

        const lookback = candles.slice(-this.cfg.levelLookback);
        const tol      = this.cfg.touchTolerance;

        // Step 1: find swing highs + lows
        const swings = [];
        for (let i = N; i < lookback.length - N; i++) {
            const c = lookback[i];

            const isSwingHigh = lookback.slice(i - N, i).every(x => c.high >= x.high) &&
                                lookback.slice(i + 1, i + N + 1).every(x => c.high >= x.high);
            const isSwingLow  = lookback.slice(i - N, i).every(x => c.low  <= x.low) &&
                                lookback.slice(i + 1, i + N + 1).every(x => c.low  <= x.low);

            if (isSwingHigh) swings.push({ price: c.high, type: 'high' });
            if (isSwingLow)  swings.push({ price: c.low,  type: 'low'  });
        }

        // Step 2: cluster nearby swings → levels (anchor-based, no drift)
        const clusters = [];
        for (const s of swings) {
            let found = false;
            for (const cl of clusters) {
                if (Math.abs(s.price - cl.anchor) / cl.anchor <= tol) {
                    cl.prices.push(s.price);
                    cl.level = cl.prices.reduce((a, b) => a + b) / cl.prices.length;
                    cl.touches++;
                    if (s.type === 'high') cl.highTouches++;
                    else                   cl.lowTouches++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                clusters.push({
                    anchor: s.price, level: s.price, prices: [s.price], touches: 1,
                    highTouches: s.type === 'high' ? 1 : 0,
                    lowTouches:  s.type === 'low'  ? 1 : 0,
                });
            }
        }

        return clusters
            .filter(cl => cl.touches >= this.cfg.minTouches)
            .map(cl => ({
                level:   cl.level,
                touches: cl.touches,
                type:    cl.highTouches >= cl.lowTouches ? 'resistance' : 'support',
            }))
            .sort((a, b) => b.touches - a.touches);
    }

    // ── EMA helper ─────────────────────────────────────────────────────────────

    _ema(prices, period) {
        if (prices.length < period) return null;
        const k = 2 / (period + 1);
        let e = prices.slice(0, period).reduce((a, b) => a + b) / period;
        for (let i = period; i < prices.length; i++) e = prices[i] * k + e * (1 - k);
        return e;
    }

    // ── MTF bias ───────────────────────────────────────────────────────────────

    /**
     * Trend filter from 1m candle closes.
     * EMA5 vs EMA20 → 'bull' | 'bear' | 'neutral'
     * Neutral = range / no clear trend → both breakout directions allowed.
     */
    _getMTFBias(pair) {
        const candles = this.candles1m[pair];
        if (candles.length < this.cfg.emaSlow) return 'neutral';

        const closes = candles.map(c => c.close);
        const fast   = this._ema(closes, this.cfg.emaFast);
        const slow   = this._ema(closes, this.cfg.emaSlow);
        if (fast === null || slow === null) return 'neutral';

        const band = this.cfg.emaBand;
        if (fast > slow * (1 + band)) return 'bull';
        if (fast < slow * (1 - band)) return 'bear';
        return 'neutral';
    }

    // ── Breakout signal ────────────────────────────────────────────────────────

    _getSignal(pair) {
        const candles = this.candles1m[pair];
        if (candles.length < 15) return null;

        const curCandle = this.currentCandle[pair];
        if (!curCandle) return null;

        const curPrice  = curCandle.close;
        const levels    = this._detectLevels(pair);
        if (!levels.length) return null;

        const mtfBias   = this._getMTFBias(pair);
        const N         = this.cfg.consolidationCandles;
        const recent    = candles.slice(-N); // last N completed candles
        const now       = Date.now();
        const boPct     = this.cfg.breakoutPct;

        for (const lvl of levels) {
            // ── BULL BREAKOUT: resistance level ───────────────────────────────
            // Condition: last N candles consolidated BELOW level (closes < level),
            // current price breaks ABOVE level by breakoutPct
            if (lvl.type === 'resistance' && mtfBias !== 'bear') {
                const consolidated = recent.every(c => c.close < lvl.level);
                const breakout     = curPrice > lvl.level * (1 + boPct);

                if (consolidated && breakout) {
                    const key = `${pair}_long`;
                    if ((this.cooldowns[key] || 0) + this.cfg.cooldownMs > now) continue;
                    this.cooldowns[key] = now;

                    return {
                        side: 'long', pair, price: curPrice,
                        level: lvl.level, touches: lvl.touches, mtf: mtfBias,
                        reason: `Bull breakout above $${lvl.level.toFixed(4)} (${lvl.touches}x tested) | MTF: ${mtfBias}`,
                    };
                }
            }

            // ── BEAR BREAKOUT: support level ──────────────────────────────────
            // Condition: last N candles consolidated ABOVE level (closes > level),
            // current price breaks BELOW level by breakoutPct
            if (lvl.type === 'support' && mtfBias !== 'bull') {
                const consolidated = recent.every(c => c.close > lvl.level);
                const breakout     = curPrice < lvl.level * (1 - boPct);

                if (consolidated && breakout) {
                    const key = `${pair}_short`;
                    if ((this.cooldowns[key] || 0) + this.cfg.cooldownMs > now) continue;
                    this.cooldowns[key] = now;

                    return {
                        side: 'short', pair, price: curPrice,
                        level: lvl.level, touches: lvl.touches, mtf: mtfBias,
                        reason: `Bear breakout below $${lvl.level.toFixed(4)} (${lvl.touches}x tested) | MTF: ${mtfBias}`,
                    };
                }
            }
        }

        return null;
    }

    // ── Position management ────────────────────────────────────────────────────

    _openPos(signal) {
        if (Object.keys(this.positions).length >= this.cfg.maxPositions) return null;

        const id  = `bo_${signal.pair.replace('/', '_')}_${signal.side}_${Date.now()}`;
        const pos = {
            id, pair: signal.pair, side: signal.side,
            entry: signal.price, size: this.cfg.sizeUsd,
            sl: signal.side === 'long'
                ? signal.price * (1 - this.cfg.slPct)
                : signal.price * (1 + this.cfg.slPct),
            tp: signal.side === 'long'
                ? signal.price * (1 + this.cfg.tpPct)
                : signal.price * (1 - this.cfg.tpPct),
            level: signal.level, touches: signal.touches,
            openTs: Date.now(),
        };

        this.positions[id] = pos;
        this.stats.tradesOpened++;
        this.stats.breakoutsDetected++;
        if (this.stats.byPair[signal.pair]) this.stats.byPair[signal.pair].breakouts++;

        const dir = signal.side === 'long' ? '🟢 BULL' : '🔴 BEAR';
        console.log(`[BREAKOUT] ${dir} ${signal.pair} @ $${signal.price.toFixed(4)}`);
        console.log(`[BREAKOUT]   Level: $${signal.level.toFixed(4)} × ${signal.touches}x | MTF: ${signal.mtf}`);
        console.log(`[BREAKOUT]   SL: $${pos.sl.toFixed(4)} | TP: $${pos.tp.toFixed(4)} | ${signal.reason}`);

        if (this._executor) {
            this._executor.open(signal.pair, signal.side, this.cfg.sizeUsd)
                .catch(e => console.warn(`[BREAKOUT] Executor open error: ${e.message}`));
        }

        return pos;
    }

    _closePos(pos, exitPrice, reason) {
        const diff = pos.side === 'long' ? exitPrice - pos.entry : pos.entry - exitPrice;
        const pnl  = (diff / pos.entry) * pos.size;
        const icon = pnl > 0 ? '✅' : '❌';

        console.log(`[BREAKOUT] ${icon} CLOSE ${pos.side.toUpperCase()} ${pos.pair} @ $${exitPrice.toFixed(4)} | pnl=$${pnl.toFixed(4)} | ${reason}`);

        const trade = {
            id: pos.id, symbol: pos.pair, side: pos.side, size: pos.size,
            entryPrice: pos.entry, exitPrice,
            pnl: +pnl.toFixed(6), reason,
            holdMs: Date.now() - pos.openTs,
            level: pos.level, touches: pos.touches,
            timestamp: Date.now(),
        };

        delete this.positions[pos.id];
        this.stats.tradesClosed++;
        this.stats.totalPnl += pnl;
        if (pnl > 0) this.stats.wins++;
        else         this.stats.losses++;
        if (reason === 'TIMEOUT') this.stats.timeouts++;

        const ps = this.stats.byPair[pos.pair];
        if (ps) { ps.trades++; ps.pnl += pnl; if (pnl > 0) ps.wins++; }

        this._logTrade(trade);

        if (this._executor) {
            this._executor.close(pos.pair).catch(() => {});
        }

        return trade;
    }

    _checkPositions(mktMap) {
        for (const pos of Object.values(this.positions)) {
            const mkt = mktMap[pos.pair];
            if (!mkt) continue;
            const cur = mkt.price;
            const age = Date.now() - pos.openTs;

            if (age >= this.cfg.maxHoldMs) {
                this._closePos(pos, cur, 'TIMEOUT');
            } else if (pos.side === 'long') {
                if (cur <= pos.sl) this._closePos(pos, cur, 'SL');
                else if (cur >= pos.tp) this._closePos(pos, cur, 'TP');
            } else {
                if (cur >= pos.sl) this._closePos(pos, cur, 'SL');
                else if (cur <= pos.tp) this._closePos(pos, cur, 'TP');
            }
        }
    }

    // ── Price feed ─────────────────────────────────────────────────────────────

    async _fetchMarkets() {
        return new Promise((resolve) => {
            const req = http.get(`${this.cfg.obeliskUrl}/api/markets`, (res) => {
                let data = '';
                res.on('data', d => data += d);
                res.on('end', () => {
                    try { resolve(JSON.parse(data).markets || []); }
                    catch { resolve([]); }
                });
            });
            req.on('error', () => resolve([]));
            req.setTimeout(3000, () => { req.destroy(); resolve([]); });
        });
    }

    // ── Track record ───────────────────────────────────────────────────────────

    _logTrade(trade) {
        try { fs.appendFileSync(TRADES_FILE, JSON.stringify(trade) + '\n'); } catch {}
    }

    _saveSession() {
        try {
            const s = this.getStats();
            let sessions = [];
            if (fs.existsSync(SESSIONS_FILE)) {
                sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
            }
            const entry = {
                startTime:  this.stats.startTime,
                date:       new Date(this.stats.startTime).toISOString().slice(0, 19).replace('T', ' '),
                elapsedMin: +(s.elapsedSec / 60).toFixed(1),
                trades:     this.stats.tradesClosed,
                wins:       this.stats.wins,
                losses:     this.stats.losses,
                timeouts:   this.stats.timeouts,
                winRate:    s.winRate,
                pnl:        s.totalPnl,
                breakouts:  this.stats.breakoutsDetected,
                byPair:     this.stats.byPair,
            };
            const idx = sessions.findIndex(x => x.startTime === this.stats.startTime);
            if (idx >= 0) sessions[idx] = entry; else sessions.push(entry);
            fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
        } catch {}
    }

    // ── Main loop ──────────────────────────────────────────────────────────────

    async start() {
        if (this._running) return;
        this._running     = true;
        this.stats.startTime = Date.now();

        console.log('═'.repeat(64));
        console.log('  BREAKOUT ENGINE v1.0 — Multi-Timeframe S/R Breakout');
        console.log('═'.repeat(64));
        console.log(`  Pairs     : ${this.cfg.pairs.join(', ')}`);
        console.log(`  Trade     : $${this.cfg.sizeUsd} | SL ${(this.cfg.slPct*100).toFixed(2)}% | TP ${(this.cfg.tpPct*100).toFixed(2)}% (3:1 RR, BE 25%)`);
        console.log(`  Levels    : ${this.cfg.minTouches}+ touches | tol ±${(this.cfg.touchTolerance*100).toFixed(1)}% | BO ${(this.cfg.breakoutPct*100).toFixed(1)}%`);
        console.log(`  MTF       : EMA(${this.cfg.emaFast}/${this.cfg.emaSlow}) on 1m closes → bull/bear/neutral`);
        console.log(`  MaxHold   : ${this.cfg.maxHoldMs/1000}s | MaxPos: ${this.cfg.maxPositions} | Cooldown: ${this.cfg.cooldownMs/1000}s`);
        console.log(`  Warm-up   : ~20 min before first levels detected`);
        console.log('');

        const tick = async () => {
            if (!this._running) return;

            const markets = await this._fetchMarkets();
            if (markets.length) {
                const mktMap = {};
                for (const m of markets) mktMap[m.pair] = m;

                const now = Date.now();

                // Update candles + check for signals
                for (const pair of this.cfg.pairs) {
                    const m = mktMap[pair];
                    if (!m) continue;

                    this._addTick(pair, m.price, now);
                }

                // Check exits
                this._checkPositions(mktMap);

                // Check breakout signals on all pairs
                for (const pair of this.cfg.pairs) {
                    if (this.candles1m[pair].length < 15) continue;
                    const sig = this._getSignal(pair);
                    if (sig) this._openPos(sig);
                }
            }

            this._timer = setTimeout(tick, this.cfg.tickInterval);
        };

        tick();
    }

    stop() {
        this._running = false;
        clearTimeout(this._timer);
        this._saveSession();
    }

    getStats() {
        const elapsed = this.stats.startTime ? (Date.now() - this.stats.startTime) / 1000 : 0;
        const winRate = this.stats.tradesClosed > 0
            ? (this.stats.wins / this.stats.tradesClosed * 100).toFixed(1) + '%'
            : '0%';
        const candleStatus = Object.fromEntries(
            this.cfg.pairs.map(p => [p, `${this.candles1m[p].length}m candles`])
        );

        return {
            ...this.stats,
            elapsedSec:    +elapsed.toFixed(0),
            winRate,
            totalPnl:      `$${this.stats.totalPnl.toFixed(4)}`,
            openPositions: Object.keys(this.positions).length,
            openList: Object.values(this.positions).map(p =>
                `${p.pair} ${p.side} @ $${p.entry.toFixed(4)} | lvl:$${p.level.toFixed(4)} (${p.touches}x)`
            ),
            candles: candleStatus,
        };
    }
}

module.exports = BreakoutEngine;
