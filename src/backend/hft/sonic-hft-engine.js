/**
 * SONIC HFT ENGINE
 * High-frequency trading on Sonic chain via DEX quotes
 *
 * Loop:
 *   1. Fetch real wS/USDC price from Sonic DEX (Odos best route)
 *   2. Apply RSI Micro Scalp signal (best from paper tests: 5.66% daily ROI)
 *   3. Open position via Obelisk perps (paper pool, $5 max)
 *   4. Close at SL -0.5% / TP +1.5%
 *   5. Feed closed trade to AutoBatcher → profit guard (10 trades/batch)
 *
 * Params (from CLAUDE.md HFT results):
 *   - SL: 0.5% | TP: 1.5% | Ratio: 3:1
 *   - Size: $3-5 per trade | Max concurrent: 5
 *   - Expected: 247 trades/day, 63.2% win rate, 5.66% daily ROI
 *
 * Version: 1.0 | Date: 2026-02-19
 */

const { SonicDexRouter, ADDRESSES } = require('../executors/sonic-dex-router');
const AutoBatcher = require('../auto-batcher');
const { ethers } = require('ethers');

// ─── Config ──────────────────────────────────────────────────────────────────

const CFG = {
    // Trade params
    sizeUsd:        5.00,   // $5 per trade
    slPct:          0.005,  // SL -0.5%
    tpPct:          0.015,  // TP +1.5%
    maxHoldMs:      30000,  // Force close after 30s (faster cycling)
    maxPositions:   5,      // max concurrent

    // Signal (RSI + VWAP deviation)
    rsiWindow:      14,
    rsiOverbought:  65,     // Slightly more sensitive
    rsiOversold:    35,
    vwapPct:        0.0002, // Signal if price deviates >0.02% from VWAP
    priceInterval:  2000,   // ms between price fetches (2s for more data)
    signalWindow:   30,     // price history for RSI/VWAP calc

    // Batch
    batchSize:      10,
    chain:          'SONIC',
};

// ─── Engine ──────────────────────────────────────────────────────────────────

class SonicHFTEngine {
    constructor(config = {}) {
        this.cfg = { ...CFG, ...config };
        this.router = new SonicDexRouter();

        // Price history for RSI calculation
        this.prices = [];       // { price, ts }
        this.positions = [];    // open positions
        this.closedTrades = []; // for batch submission

        // Auto-batcher (profit guard ON)
        this.batcher = new AutoBatcher(
            { batchSettle: (trades) => this._onBatchSettle(trades) },
            {
                enabled: false,
                profitGuard: true,
                batchSize: this.cfg.batchSize,
                minBatchSize: this.cfg.batchSize,
                chain: this.cfg.chain,
            }
        );

        // Stats
        this.stats = {
            pricesFetched: 0,
            signalsGenerated: 0,
            tradesOpened: 0,
            tradesClosed: 0,
            batchesExecuted: 0,
            batchesSkipped: 0,
            wins: 0,
            losses: 0,
            totalPnl: 0,
            startTime: null,
        };

        this._running = false;
        this._priceTimer = null;
        this._checkTimer = null;

        // Listen for batch events
        this.batcher.on('batch-skipped', (info) => {
            this.stats.batchesSkipped++;
            console.log(`[HFT] Batch skipped — net $${info.netPnl.toFixed(4)} (not profitable)`);
        });
        this.batcher.on('batch-executed', () => {
            this.stats.batchesExecuted++;
        });
    }

    // ── Price feed ─────────────────────────────────────────────────────────

    async _fetchPrice() {
        try {
            // wS/USDC: how many USDC for 1 wS
            const q = await this.router.quoteHuman('wS', 'USDC', 1);
            if (!q.success || !q.human) return null;
            return parseFloat(q.human.amountOut);
        } catch { return null; }
    }

    // ── RSI Calculation ────────────────────────────────────────────────────

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
        // Flat price (both 0): RSI = 50 (neutral, no signal)
        if (avgGain === 0 && avgLoss === 0) return 50;
        if (avgLoss === 0) return 100;
        if (avgGain === 0) return 0;
        const rs = avgGain / avgLoss;
        return 100 - 100 / (1 + rs);
    }

    // ── Signal generation ──────────────────────────────────────────────────

    _calcVWAP(priceObjs) {
        if (priceObjs.length === 0) return null;
        // Simple mean (no volume data from DEX quotes — use equal weight)
        return priceObjs.reduce((s, p) => s + p.price, 0) / priceObjs.length;
    }

    _getSignal() {
        const ps = this.prices.map(p => p.price);
        const rsi = this._calcRSI(ps, this.cfg.rsiWindow);
        if (rsi === null) return null;

        const vwap = this._calcVWAP(this.prices.slice(-this.cfg.signalWindow));
        const currentPrice = ps[ps.length - 1];
        const vwapDev = vwap ? (currentPrice - vwap) / vwap : 0; // + = above VWAP

        // RSI Oversold + price below VWAP → LONG
        if (rsi < this.cfg.rsiOversold && vwapDev < -this.cfg.vwapPct) {
            return { side: 'long',  rsi, vwapDev: +vwapDev.toFixed(6), strength: (this.cfg.rsiOversold - rsi) / this.cfg.rsiOversold };
        }
        // RSI Overbought + price above VWAP → SHORT
        if (rsi > this.cfg.rsiOverbought && vwapDev > this.cfg.vwapPct) {
            return { side: 'short', rsi, vwapDev: +vwapDev.toFixed(6), strength: (rsi - this.cfg.rsiOverbought) / (100 - this.cfg.rsiOverbought) };
        }
        return null;
    }

    // ── Position management ────────────────────────────────────────────────

    _openPosition(signal, entryPrice) {
        if (this.positions.length >= this.cfg.maxPositions) return null;

        const pos = {
            id:         `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            side:       signal.side,
            entryPrice,
            size:       this.cfg.sizeUsd,
            sl:         signal.side === 'long'
                            ? entryPrice * (1 - this.cfg.slPct)
                            : entryPrice * (1 + this.cfg.slPct),
            tp:         signal.side === 'long'
                            ? entryPrice * (1 + this.cfg.tpPct)
                            : entryPrice * (1 - this.cfg.tpPct),
            openTs:     Date.now(),
        };

        this.positions.push(pos);
        this.stats.tradesOpened++;
        return pos;
    }

    _closePosition(pos, exitPrice, reason) {
        const priceDiff = pos.side === 'long'
            ? exitPrice - pos.entryPrice
            : pos.entryPrice - exitPrice;
        const pnl = (priceDiff / pos.entryPrice) * pos.size;

        const trade = {
            id:         pos.id,
            symbol:     'wS-USDC',
            side:       pos.side,
            size:       pos.size,
            entryPrice: pos.entryPrice,
            exitPrice,
            pnl:        +pnl.toFixed(6),
            reason,
            holdMs:     Date.now() - pos.openTs,
            dex:        'odos',
            exchange:   'sonic',
            timestamp:  Date.now(),
        };

        // Remove from positions
        this.positions = this.positions.filter(p => p.id !== pos.id);
        this.closedTrades.push(trade);
        this.stats.tradesClosed++;
        this.stats.totalPnl += pnl;
        if (pnl > 0) this.stats.wins++;
        else this.stats.losses++;

        // Feed to batcher
        try { this.batcher.addTrade(trade); } catch {}

        return trade;
    }

    _checkPositions(currentPrice) {
        const now = Date.now();
        for (const pos of [...this.positions]) {
            // Force close if max hold time exceeded
            if (now - pos.openTs >= this.cfg.maxHoldMs) {
                this._closePosition(pos, currentPrice, 'TIMEOUT');
                continue;
            }
            if (pos.side === 'long') {
                if (currentPrice <= pos.sl) this._closePosition(pos, currentPrice, 'SL');
                else if (currentPrice >= pos.tp) this._closePosition(pos, currentPrice, 'TP');
            } else {
                if (currentPrice >= pos.sl) this._closePosition(pos, currentPrice, 'SL');
                else if (currentPrice <= pos.tp) this._closePosition(pos, currentPrice, 'TP');
            }
        }
    }

    // ── Batch handler ──────────────────────────────────────────────────────

    async _onBatchSettle(trades) {
        // Paper mode: just acknowledge
        return trades.map(t => ({ success: true, txHash: null, gasSaved: 0.00019, gasCost: 0.00021 / trades.length }));
    }

    // ── Main loop ──────────────────────────────────────────────────────────

    async start() {
        if (this._running) return;
        this._running = true;
        this.stats.startTime = Date.now();
        this.batcher.start();

        console.log('═'.repeat(60));
        console.log('  SONIC HFT ENGINE — STARTED');
        console.log('═'.repeat(60));
        console.log(`  Size: $${this.cfg.sizeUsd} | SL: ${this.cfg.slPct*100}% | TP: ${this.cfg.tpPct*100}%`);
        console.log(`  Max positions: ${this.cfg.maxPositions} | Batch: ${this.cfg.batchSize} trades`);
        console.log(`  Price interval: ${this.cfg.priceInterval}ms`);
        console.log('');

        // Price fetching loop
        const tick = async () => {
            if (!this._running) return;

            const price = await this._fetchPrice();
            if (price) {
                this.prices.push({ price, ts: Date.now() });
                if (this.prices.length > this.cfg.signalWindow * 2) {
                    this.prices.shift();
                }
                this.stats.pricesFetched++;

                // Check existing positions
                this._checkPositions(price);

                // Generate signal & maybe open position
                const signal = this._getSignal();
                if (signal) {
                    this.stats.signalsGenerated++;
                    const pos = this._openPosition(signal, price);
                    if (pos) {
                        console.log(`[HFT] ${pos.side.toUpperCase()} @ $${price.toFixed(6)} | RSI: ${signal.rsi.toFixed(1)} | SL: $${pos.sl.toFixed(6)} TP: $${pos.tp.toFixed(6)}`);
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
        console.log('[HFT] Engine stopped');
    }

    getStats() {
        const elapsed = this.stats.startTime ? (Date.now() - this.stats.startTime) / 1000 : 0;
        const winRate = this.stats.tradesClosed > 0
            ? (this.stats.wins / this.stats.tradesClosed * 100).toFixed(1)
            : '0';
        const tradesPerHour = elapsed > 0
            ? (this.stats.tradesClosed / elapsed * 3600).toFixed(0)
            : '0';

        return {
            ...this.stats,
            elapsedSec:     +elapsed.toFixed(0),
            winRate:        `${winRate}%`,
            tradesPerHour,
            totalPnl:       `$${this.stats.totalPnl.toFixed(4)}`,
            openPositions:  this.positions.length,
            pendingInBatch: this.batcher.pendingTrades.length,
            batcher:        this.batcher.getStats(),
            currentPrice:   this.prices.length > 0 ? this.prices[this.prices.length-1].price : null,
        };
    }
}

module.exports = SonicHFTEngine;
