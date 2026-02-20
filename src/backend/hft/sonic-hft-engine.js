/**
 * SONIC HFT ENGINE v2.0 — Multi-Pair
 * High-frequency trading with real volatile prices (BTC/ETH/SOL/ARB...)
 *
 * Architecture:
 *   Price feed : Obelisk /api/markets (real Binance/Coinbase prices)
 *   Signals    : RSI14 + VWAP deviation per pair
 *   Execution  : Obelisk perps paper pool ($5 trades)
 *   Settlement : Sonic chain auto-batcher (batch 10, profit guard ON)
 *
 * Params (from CLAUDE.md HFT paper test results):
 *   SL: 0.5% | TP: 1.5% | Ratio: 3:1
 *   Size: $5/trade | Max positions: 5
 *   Expected: 247 trades/day, 63.2% win rate, 5.66% daily ROI
 *
 * Version: 2.1 | Date: 2026-02-19
 */

const AutoBatcher = require('../auto-batcher');
const http = require('http');
const fs   = require('fs');
const path = require('path');

// ─── Track Record paths ───────────────────────────────────────────────────────
const TRACKING_DIR  = path.join(__dirname, '../../../data/tracking');
const TRADES_FILE   = path.join(TRACKING_DIR, 'sonic_hft_trades.jsonl');
const SESSIONS_FILE = path.join(TRACKING_DIR, 'sonic_hft_sessions.json');

// Ensure tracking dir exists
if (!fs.existsSync(TRACKING_DIR)) fs.mkdirSync(TRACKING_DIR, { recursive: true });

// ─── Config ───────────────────────────────────────────────────────────────────

const CFG = {
    // Pairs to trade (Obelisk markets)
    pairs:         ['BTC/USDC', 'ETH/USDC', 'SOL/USDC'],  // ARB removed: too volatile for 2s checks (slippage)

    // Trade params
    sizeUsd:       5.00,    // $5 per trade
    slPct:         0.001,   // SL -0.1%
    tpPct:         0.005,   // TP +0.5% (5:1 RR, break-even 16.7% — was 0.3%)
    maxHoldMs:     120000,  // Force close after 120s (was 60s — more time for TP)
    maxPositions:  5,       // max concurrent across all pairs

    // Executor: 'paper' (default) or 'apex'
    executor:      'paper',

    // Signal
    rsiWindow:     14,
    rsiOverbought: 72,      // Tighter: was 65 (too many false SHORT signals)
    rsiOversold:   28,      // Tighter: was 35
    vwapPct:       0.0005,  // Deviation threshold: 0.05% (was 0.03%, stronger signal)
    signalWindow:  30,      // price history per pair
    emaFast:       5,       // EMA cross fast period
    emaSlow:       20,      // EMA cross slow period
    cooldownMs:    45000,   // 45s cooldown per pair per side after signal

    // Timing
    priceInterval: 2000,    // fetch all markets every 2s

    // Batch / Profit Guard
    batchSize:     5,       // was 10 — batches plus fréquents, moins de skips
    chain:         'SONIC',

    // Obelisk API
    obeliskUrl:    'http://localhost:3001',
};

// ─── Engine ───────────────────────────────────────────────────────────────────

class SonicHFTEngine {
    constructor(config = {}) {
        this.cfg = { ...CFG, ...config };

        // Executor: 'paper' | 'apex' | 'obelisk'
        this._executor = null;
        if (this.cfg.executor === 'apex') {
            const ApexHFTBridge = require('./apex-hft-bridge');
            this._executor = new ApexHFTBridge();
            console.log('[HFT] Executor: APEX (live orders)');
        } else if (this.cfg.executor === 'obelisk') {
            const ObeliskExecutor = require('./obelisk-executor');
            this._executor = new ObeliskExecutor();
            console.log('[HFT] Executor: OBELISK (perps → Sonic settlement)');
        } else if (this.cfg.executor === 'sonic-dex') {
            const SonicDexExecutor = require('./sonic-dex-executor');
            this._executor = new SonicDexExecutor();
            console.log('[HFT] Executor: SONIC-DEX (real on-chain swaps via Odos/SwapX/Beets)');
        } else {
            console.log('[HFT] Executor: PAPER (no real orders)');
        }

        // Per-pair price history: { 'BTC/USDC': [{price, ts}, ...] }
        this.priceHistory = {};

        // Previous RSI per pair for crossover detection: { 'BTC/USDC': rsiValue }
        this.prevRSI = {};

        // Cooldown tracker: { 'BTC/USDC_long': lastSignalTs, ... }
        this.cooldowns = {};
        this.cfg.pairs.forEach(p => { this.priceHistory[p] = []; });

        // Open positions: { posId: { pair, side, entry, size, sl, tp, openTs } }
        this.positions = {};

        // Auto-batcher (profit guard ON, Sonic gas)
        this.batcher = new AutoBatcher(
            { batchSettle: (trades) => this._onBatchSettle(trades) },
            {
                enabled:      false,
                profitGuard:  true,
                batchSize:    this.cfg.batchSize,
                minBatchSize: this.cfg.batchSize,
                chain:        this.cfg.chain,
            }
        );

        // Stats
        this.stats = {
            pricesFetched:   0,
            signalsGenerated:0,
            tradesOpened:    0,
            tradesClosed:    0,
            batchesExecuted: 0,
            batchesSkipped:  0,
            wins:            0,
            losses:          0,
            timeouts:        0,
            totalPnl:        0,
            startTime:       null,
            byPair:          {},
        };
        this.cfg.pairs.forEach(p => {
            this.stats.byPair[p] = { trades: 0, pnl: 0, wins: 0 };
        });

        this._running   = false;
        this._priceTimer = null;

        this.batcher.on('batch-skipped', (info) => {
            this.stats.batchesSkipped++;
            console.log(`[GUARD] ❌ Skip — net $${info.netPnl.toFixed(4)} | gross $${info.grossPnl.toFixed(4)} | gas $${info.gasCost.toFixed(6)}`);
        });
        this.batcher.on('batch-executed', () => {
            this.stats.batchesExecuted++;
        });
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

    // ── RSI ────────────────────────────────────────────────────────────────────

    _calcRSI(prices, window = 14) {
        if (prices.length < window + 1) return null;
        const recent = prices.slice(-window - 1);
        let gains = 0, losses = 0;
        for (let i = 1; i < recent.length; i++) {
            const diff = recent[i] - recent[i - 1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }
        const avgGain = gains / window;
        const avgLoss = losses / window;
        if (avgGain === 0 && avgLoss === 0) return 50; // flat → neutral
        if (avgLoss === 0) return 100;
        if (avgGain === 0) return 0;
        return 100 - 100 / (1 + avgGain / avgLoss);
    }

    // ── VWAP ───────────────────────────────────────────────────────────────────

    _calcVWAP(priceObjs) {
        if (!priceObjs.length) return null;
        return priceObjs.reduce((s, p) => s + p.price, 0) / priceObjs.length;
    }

    // ── EMA ────────────────────────────────────────────────────────────────────

    _calcEMA(prices, period) {
        if (prices.length < period) return null;
        const k = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
        }
        return ema;
    }

    // ── Drift Detector (ms-level momentum) ────────────────────────────────────
    // Returns avg drift % over last windowMs milliseconds
    // Positive = upward momentum, Negative = downward momentum

    _calcDrift(pair, windowMs = 10000) {
        const hist = this.priceHistory[pair];
        if (hist.length < 3) return 0;

        const now = Date.now();
        const cutoff = now - windowMs;

        // Points dans la fenêtre temporelle
        const window = hist.filter(h => h.ts >= cutoff);
        if (window.length < 2) return 0;

        const oldest = window[0].price;
        const newest = window[window.length - 1].price;
        return (newest - oldest) / oldest; // ratio (ex: -0.01 = -1%)
    }

    // ── Price Gap Detector ─────────────────────────────────────────────────────
    // Returns gap % between last 2 ticks — spike = danger, skip trade

    _calcPriceGap(pair) {
        const hist = this.priceHistory[pair];
        if (hist.length < 2) return 0;
        const prev = hist[hist.length - 2].price;
        const cur  = hist[hist.length - 1].price;
        return Math.abs((cur - prev) / prev); // toujours positif
    }

    // ── Signal per pair ────────────────────────────────────────────────────────

    _getSignal(pair) {
        const hist = this.priceHistory[pair];
        const minLen = Math.max(this.cfg.rsiWindow + 2, this.cfg.emaSlow + 1);
        if (hist.length < minLen) return null;

        // ── Price Gap Filter: skip si spike > 0.3% entre 2 ticks (2s)
        // Spike = slippage garanti, spread excessif
        const gap = this._calcPriceGap(pair);
        if (gap > 0.003) {
            console.log(`[HFT-DRIFT] ⚡ ${pair} GAP ${(gap*100).toFixed(3)}% > 0.3% — skip tick`);
            return null;
        }

        const ps  = hist.map(h => h.price);
        const rsi = this._calcRSI(ps, this.cfg.rsiWindow);
        if (rsi === null) return null;

        const vwap    = this._calcVWAP(hist.slice(-this.cfg.signalWindow));
        const cur     = ps[ps.length - 1];
        const dev     = vwap ? (cur - vwap) / vwap : 0;

        // EMA cross filter — only trade when short-term trend confirms reversal
        const emaFast = this._calcEMA(ps, this.cfg.emaFast);
        const emaSlow = this._calcEMA(ps, this.cfg.emaSlow);
        if (emaFast === null || emaSlow === null) return null;

        const now     = Date.now();
        const prevRsi = this.prevRSI[pair] ?? 50; // neutral default
        this.prevRSI[pair] = rsi;

        // Filter degenerate RSI values (all gains / all losses — unreliable)
        if (rsi >= 99 || rsi <= 1) return null;

        // ── Drift Detector (10s window)
        // drift < -0.001 (-0.1%/10s) = momentum baissier fort
        // drift > +0.001 (+0.1%/10s) = momentum haussier fort
        const drift10s  = this._calcDrift(pair, 10000);
        const drift1s   = this._calcDrift(pair, 2000); // 1 tick = 2s

        // Long: fresh RSI crossover below oversold + below VWAP + EMA confirms
        // + drift filter: pas de long si momentum baissier fort
        const longCross = prevRsi >= this.cfg.rsiOversold && rsi < this.cfg.rsiOversold;
        if (longCross && dev < -this.cfg.vwapPct && emaFast < emaSlow) {
            // Drift filter: si momentum baissier sur 10s → skip long (marché continue de baisser)
            if (drift10s < -0.002) {
                console.log(`[HFT-DRIFT] ↓ ${pair} skip LONG — drift10s ${(drift10s*100).toFixed(3)}% (bearish momentum)`);
                return null;
            }
            const key = `${pair}_long`;
            if ((this.cooldowns[key] || 0) + this.cfg.cooldownMs > now) return null;
            this.cooldowns[key] = now;
            return { side: 'long',  pair, rsi: +rsi.toFixed(1), dev: +dev.toFixed(5), price: cur, drift10s: +drift10s.toFixed(6), drift1s: +drift1s.toFixed(6) };
        }

        // Short: fresh RSI crossover above overbought + above VWAP + EMA confirms
        // + drift boost: si momentum baissier → signal renforcé
        const shortCross = prevRsi <= this.cfg.rsiOverbought && rsi > this.cfg.rsiOverbought;
        if (shortCross && dev > this.cfg.vwapPct && emaFast > emaSlow) {
            // Drift filter: si momentum haussier fort sur 10s → skip short (rebond en cours)
            if (drift10s > 0.002) {
                console.log(`[HFT-DRIFT] ↑ ${pair} skip SHORT — drift10s ${(drift10s*100).toFixed(3)}% (bullish momentum)`);
                return null;
            }
            const key = `${pair}_short`;
            if ((this.cooldowns[key] || 0) + this.cfg.cooldownMs > now) return null;
            this.cooldowns[key] = now;
            // Drift boost: si drift baissier confirmé → log comme signal fort
            const driftBoost = drift10s < -0.001;
            if (driftBoost) console.log(`[HFT-DRIFT] ⚡ ${pair} SHORT BOOST — drift10s ${(drift10s*100).toFixed(3)}% confirms signal`);
            return { side: 'short', pair, rsi: +rsi.toFixed(1), dev: +dev.toFixed(5), price: cur, drift10s: +drift10s.toFixed(6), drift1s: +drift1s.toFixed(6), driftBoost };
        }
        return null;
    }

    // ── Position management ────────────────────────────────────────────────────

    _openPos(signal) {
        const openCount = Object.keys(this.positions).length;
        if (openCount >= this.cfg.maxPositions) return null;

        const id    = `${signal.pair}_${Date.now()}`;
        const entry = signal.price;
        const pos   = {
            id, pair: signal.pair, side: signal.side,
            entry, size: this.cfg.sizeUsd,
            sl: signal.side === 'long'
                ? entry * (1 - this.cfg.slPct)
                : entry * (1 + this.cfg.slPct),
            tp: signal.side === 'long'
                ? entry * (1 + this.cfg.tpPct)
                : entry * (1 - this.cfg.tpPct),
            openTs: Date.now(),
        };

        this.positions[id] = pos;
        this.stats.tradesOpened++;

        // Fire real order if executor configured
        if (this._executor) {
            this._executor.open(signal.pair, signal.side, this.cfg.sizeUsd)
                .catch(e => console.warn(`[HFT] Executor open error: ${e.message}`));
        }

        return pos;
    }

    _closePos(pos, exitPrice, reason) {
        const diff = pos.side === 'long'
            ? exitPrice - pos.entry
            : pos.entry - exitPrice;
        const pnl = (diff / pos.entry) * pos.size;

        const trade = {
            id:         pos.id,
            symbol:     pos.pair,
            side:       pos.side,
            size:       pos.size,
            entryPrice: pos.entry,
            exitPrice,
            pnl:        +pnl.toFixed(6),
            reason,
            holdMs:     Date.now() - pos.openTs,
            dex:        'odos',
            exchange:   'sonic',
            timestamp:  Date.now(),
        };

        delete this.positions[pos.id];
        this.stats.tradesClosed++;
        this.stats.totalPnl += pnl;

        if (pnl > 0) this.stats.wins++;
        else          this.stats.losses++;
        if (reason === 'TIMEOUT') this.stats.timeouts++;

        const ps = this.stats.byPair[pos.pair];
        if (ps) { ps.trades++; ps.pnl += pnl; if (pnl > 0) ps.wins++; }

        try { this.batcher.addTrade(trade); } catch {}
        this._logTrade(trade);

        // Close real position if executor configured
        if (this._executor) {
            this._executor.close(pos.pair)
                .catch(e => console.warn(`[HFT] Executor close error: ${e.message}`));
        }

        return trade;
    }

    _checkPositions(marketMap) {
        const now = Date.now();
        for (const pos of Object.values(this.positions)) {
            // Get current price for this pair
            const mkt = marketMap[pos.pair];
            if (!mkt) continue;
            const cur = mkt.price;

            if (now - pos.openTs >= this.cfg.maxHoldMs) {
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

    // ── Track Record ───────────────────────────────────────────────────────────

    _logTrade(trade) {
        try {
            fs.appendFileSync(TRADES_FILE, JSON.stringify(trade) + '\n');
        } catch {}
    }

    _saveSession() {
        try {
            const s = this.getStats();
            let sessions = [];
            if (fs.existsSync(SESSIONS_FILE)) {
                sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
            }
            const idx = sessions.findIndex(x => x.startTime === this.stats.startTime);
            const entry = {
                startTime:   this.stats.startTime,
                date:        new Date(this.stats.startTime).toISOString().slice(0, 19).replace('T', ' '),
                elapsedMin:  +(s.elapsedSec / 60).toFixed(1),
                trades:      this.stats.tradesClosed,
                wins:        this.stats.wins,
                losses:      this.stats.losses,
                timeouts:    this.stats.timeouts,
                winRate:     s.winRate,
                pnl:         s.totalPnl,
                tradesPerHour: +s.tradesPerHour,
                batchesExec: this.stats.batchesExecuted,
                batchesSkip: this.stats.batchesSkipped,
                byPair:      this.stats.byPair,
            };
            if (idx >= 0) sessions[idx] = entry;
            else sessions.push(entry);
            fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
        } catch {}
    }

    // ── Batch handler ──────────────────────────────────────────────────────────

    async _onBatchSettle(trades) {
        // Paper mode: acknowledge settlement
        return trades.map(t => ({
            success: true,
            txHash:  null,
            gasSaved: 0.00019,
            gasCost:  0.00021 / trades.length,
        }));
    }

    // ── Main loop ──────────────────────────────────────────────────────────────

    async start() {
        if (this._running) return;
        this._running  = true;
        this.stats.startTime = Date.now();
        this.batcher.start();

        console.log('═'.repeat(64));
        console.log('  SONIC HFT ENGINE v2.1 — MULTI-PAIR + EMA FILTER');
        console.log('═'.repeat(64));
        console.log(`  Pairs : ${this.cfg.pairs.join(', ')}`);
        console.log(`  Size  : $${this.cfg.sizeUsd} | SL: ${this.cfg.slPct*100}% | TP: ${this.cfg.tpPct*100}%`);
        console.log(`  MaxPos: ${this.cfg.maxPositions} | MaxHold: ${this.cfg.maxHoldMs/1000}s`);
        console.log(`  Batch : ${this.cfg.batchSize} trades | ProfitGuard: ON`);
        console.log('');

        const tick = async () => {
            if (!this._running) return;

            const markets = await this._fetchMarkets();
            if (markets.length) {
                this.stats.pricesFetched++;

                // Build quick lookup map
                const mktMap = {};
                for (const m of markets) mktMap[m.pair] = m;

                // Update price history per pair
                for (const pair of this.cfg.pairs) {
                    const m = mktMap[pair];
                    if (!m) continue;
                    this.priceHistory[pair].push({ price: m.price, ts: Date.now() });
                    if (this.priceHistory[pair].length > this.cfg.signalWindow * 3) {
                        this.priceHistory[pair].shift();
                    }
                }

                // Check exits on open positions
                this._checkPositions(mktMap);

                // Generate signals per pair
                for (const pair of this.cfg.pairs) {
                    const sig = this._getSignal(pair);
                    if (sig) {
                        this.stats.signalsGenerated++;
                        const pos = this._openPos(sig);
                        if (pos) {
                            console.log(`[HFT] ${sig.side.toUpperCase().padEnd(5)} ${pair.padEnd(10)} @ $${sig.price.toFixed(4)} | RSI:${sig.rsi} dev:${(sig.dev*100).toFixed(3)}%`);
                        }
                    }
                }
            }

            this._priceTimer = setTimeout(tick, this.cfg.priceInterval);
        };

        tick();
    }

    stop() {
        this._running = false;
        clearTimeout(this._priceTimer);
        this.batcher.stop();
    }

    getStats() {
        const elapsed  = this.stats.startTime ? (Date.now() - this.stats.startTime) / 1000 : 0;
        const winRate  = this.stats.tradesClosed > 0
            ? (this.stats.wins / this.stats.tradesClosed * 100).toFixed(1)
            : '0';
        const tradesPerHour = elapsed > 0
            ? (this.stats.tradesClosed / elapsed * 3600).toFixed(0)
            : '0';
        const openList = Object.values(this.positions).map(p =>
            `${p.pair} ${p.side} @ $${p.entry.toFixed(4)}`
        );

        return {
            ...this.stats,
            elapsedSec:     +elapsed.toFixed(0),
            winRate:        `${winRate}%`,
            tradesPerHour,
            totalPnl:       `$${this.stats.totalPnl.toFixed(4)}`,
            openPositions:  Object.keys(this.positions).length,
            openList,
            pendingInBatch: this.batcher.pendingTrades.length,
            batcher:        this.batcher.getStats(),
        };
    }
}

module.exports = SonicHFTEngine;
