/**
 * OBELISK Backtest Engine
 * Système de backtesting pour stratégies de trading
 *
 * Features:
 * - Données historiques simulées réalistes (legacy)
 * - Real Binance OHLCV data provider (NEW)
 * - Realistic execution: next-open entry, dynamic slippage, volume check, spread, funding
 * - Multiple stratégies prédéfinies
 * - Stratégies personnalisées
 * - Métriques de performance complètes
 * - Comparaison multi-stratégies
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================
// VENUE FEES (mirrors trading-router.js)
// ============================================
const VENUE_FEES = {
    lighter:     { maker: 0.0000, taker: 0.0004 },
    morpher:     { maker: 0.0000, taker: 0.0000 },
    hyperliquid: { maker: 0.0001, taker: 0.00035 },
    asterdex:    { maker: 0.0001, taker: 0.00035 },
    gmx:         { maker: 0.0005, taker: 0.0005 },
    mux:         { maker: 0.0006, taker: 0.0006 },
    gains:       { maker: 0.0008, taker: 0.0008 },
    obelisk:     { maker: 0.0010, taker: 0.0010 }
};

// ============================================
// BINANCE DATA PROVIDER (replaces HistoricalDataGenerator)
// ============================================
const CACHE_DIR = path.join(__dirname, 'data', 'candle_cache');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

class BinanceDataProvider {
    constructor() {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
    }

    /**
     * Convert pair like 'BTC/USDC' to Binance symbol 'BTCUSDT'
     */
    _toSymbol(pair) {
        return pair.replace('/', '').replace('USDC', 'USDT');
    }

    /**
     * HTTP GET with promise
     */
    _fetch(url) {
        return new Promise((resolve, reject) => {
            https.get(url, { timeout: 15000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`JSON parse error: ${e.message}`));
                    }
                });
            }).on('error', reject);
        });
    }

    /**
     * Sleep helper
     */
    _sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    /**
     * Get cache file path for a query
     */
    _cacheKey(pair, interval, days) {
        const sym = this._toSymbol(pair);
        return path.join(CACHE_DIR, `${sym}_${interval}_${days}d.json`);
    }

    /**
     * Check if cache is valid
     */
    _cacheValid(filePath) {
        try {
            if (!fs.existsSync(filePath)) return false;
            const stat = fs.statSync(filePath);
            return (Date.now() - stat.mtimeMs) < CACHE_TTL;
        } catch {
            return false;
        }
    }

    /**
     * Fetch real OHLCV candles from Binance
     * @param {string} pair - e.g. 'BTC/USDC'
     * @param {string} interval - e.g. '1h', '15m', '4h'
     * @param {number} days - number of days of history
     * @returns {Array} candles with {timestamp, date, open, high, low, close, volume, quoteVolume, trades}
     */
    async fetchCandles(pair, interval = '1h', days = 30) {
        const cacheFile = this._cacheKey(pair, interval, days);

        // Return from cache if valid
        if (this._cacheValid(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                console.log(`[BACKTEST] Cache hit: ${pair} ${interval} ${days}d (${cached.length} candles)`);
                return cached;
            } catch { /* fall through */ }
        }

        const symbol = this._toSymbol(pair);
        const msPerCandle = this._intervalToMs(interval);
        const totalCandles = Math.ceil((days * 24 * 60 * 60 * 1000) / msPerCandle);
        const endTime = Date.now();
        const startTime = endTime - (days * 24 * 60 * 60 * 1000);

        let allCandles = [];
        let currentStart = startTime;

        console.log(`[BACKTEST] Fetching ${pair} ${interval} candles for ${days} days (~${totalCandles} candles)...`);

        while (currentStart < endTime) {
            const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${currentStart}&limit=1000`;

            try {
                const raw = await this._fetch(url);
                if (!Array.isArray(raw) || raw.length === 0) break;

                for (const c of raw) {
                    allCandles.push({
                        timestamp: c[0],
                        date: new Date(c[0]).toISOString(),
                        open: parseFloat(c[1]),
                        high: parseFloat(c[2]),
                        low: parseFloat(c[3]),
                        close: parseFloat(c[4]),
                        volume: parseFloat(c[5]),
                        quoteVolume: parseFloat(c[7]),
                        trades: parseInt(c[8])
                    });
                }

                // Move past last candle
                currentStart = raw[raw.length - 1][0] + msPerCandle;

                // Rate limit: 100ms between pages
                if (currentStart < endTime) {
                    await this._sleep(100);
                }
            } catch (err) {
                console.error(`[BACKTEST] Fetch error for ${symbol}: ${err.message}`);
                break;
            }
        }

        // Deduplicate by timestamp
        const seen = new Set();
        allCandles = allCandles.filter(c => {
            if (seen.has(c.timestamp)) return false;
            seen.add(c.timestamp);
            return true;
        });

        // Sort by time
        allCandles.sort((a, b) => a.timestamp - b.timestamp);

        console.log(`[BACKTEST] Fetched ${allCandles.length} candles for ${pair}`);

        // Write to cache
        try {
            fs.writeFileSync(cacheFile, JSON.stringify(allCandles));
        } catch (err) {
            console.error(`[BACKTEST] Cache write error: ${err.message}`);
        }

        return allCandles;
    }

    /**
     * Fetch funding rates from Binance Futures
     * @param {string} pair - e.g. 'BTC/USDC'
     * @param {number} days - number of days
     * @returns {Array} funding rates with {timestamp, rate}
     */
    async fetchFundingRates(pair, days = 30) {
        const symbol = this._toSymbol(pair);
        const endTime = Date.now();
        const startTime = endTime - (days * 24 * 60 * 60 * 1000);

        let allRates = [];
        let currentStart = startTime;

        console.log(`[BACKTEST] Fetching funding rates for ${pair} (${days} days)...`);

        while (currentStart < endTime) {
            const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&startTime=${currentStart}&limit=1000`;

            try {
                const raw = await this._fetch(url);
                if (!Array.isArray(raw) || raw.length === 0) break;

                for (const r of raw) {
                    allRates.push({
                        timestamp: r.fundingTime,
                        rate: parseFloat(r.fundingRate)
                    });
                }

                currentStart = raw[raw.length - 1].fundingTime + 1;
                if (currentStart < endTime) {
                    await this._sleep(100);
                }
            } catch (err) {
                console.error(`[BACKTEST] Funding rate fetch error: ${err.message}`);
                break;
            }
        }

        allRates.sort((a, b) => a.timestamp - b.timestamp);
        console.log(`[BACKTEST] Fetched ${allRates.length} funding rate entries for ${pair}`);
        return allRates;
    }

    /**
     * Convert interval string to milliseconds
     */
    _intervalToMs(interval) {
        const unit = interval.slice(-1);
        const val = parseInt(interval.slice(0, -1));
        switch (unit) {
            case 'm': return val * 60 * 1000;
            case 'h': return val * 60 * 60 * 1000;
            case 'd': return val * 24 * 60 * 60 * 1000;
            case 'w': return val * 7 * 24 * 60 * 60 * 1000;
            default: return 60 * 60 * 1000;
        }
    }
}

// ============================================
// REALISTIC BACKTEST ENGINE
// ============================================
class RealisticBacktestEngine {
    /**
     * @param {Object} config
     * @param {number} config.initialCapital - Starting capital in USD
     * @param {string} config.venue - Venue name for fee lookup (default 'gmx')
     * @param {number} [config.maxPositionPct] - Max % of candle volume per order (default 2%)
     */
    constructor(config = {}) {
        this.initialCapital = config.initialCapital || 10000;
        this.venue = (config.venue || 'gmx').toLowerCase();
        this.maxPositionPct = config.maxPositionPct || 0.02; // 2% of candle volume

        const fees = VENUE_FEES[this.venue] || VENUE_FEES.gmx;
        this.takerFee = fees.taker;
    }

    /**
     * Calculate dynamic slippage based on order size vs candle volume
     * slippage = 0.0005 * sqrt(orderSize / candleVolume / 0.001)
     */
    _calcSlippage(orderSizeUsd, candleQuoteVolume) {
        if (!candleQuoteVolume || candleQuoteVolume <= 0) return 0.005; // 0.5% fallback
        const ratio = orderSizeUsd / candleQuoteVolume / 0.001;
        return 0.0005 * Math.sqrt(Math.max(ratio, 0));
    }

    /**
     * Calculate spread from candle volatility
     * spread = clamp(avgCandleRange * 0.05, 0.0001, 0.0020)
     */
    _calcSpread(candles, idx, lookback = 20) {
        const start = Math.max(0, idx - lookback);
        let totalRange = 0;
        let count = 0;
        for (let i = start; i <= idx; i++) {
            const c = candles[i];
            if (c.high > 0 && c.low > 0) {
                totalRange += (c.high - c.low) / ((c.high + c.low) / 2);
                count++;
            }
        }
        if (count === 0) return 0.0005;
        const avgRange = totalRange / count;
        const spread = avgRange * 0.05;
        return Math.max(0.0001, Math.min(0.0020, spread));
    }

    /**
     * Sum funding rates between two timestamps
     */
    _sumFunding(fundingRates, entryTime, exitTime) {
        if (!fundingRates || fundingRates.length === 0) return 0;
        let total = 0;
        for (const fr of fundingRates) {
            if (fr.timestamp >= entryTime && fr.timestamp <= exitTime) {
                total += fr.rate;
            }
        }
        return total;
    }

    /**
     * Run a realistic backtest
     * @param {Array} data - OHLCV candles from BinanceDataProvider
     * @param {string|Object} strategy - Strategy name or object
     * @param {Object} params - Strategy parameter overrides
     * @param {Object} options - { fundingRates: [] }
     * @returns {Object} backtest result
     */
    async run(data, strategy, params = {}, options = {}) {
        const strategyConfig = typeof strategy === 'string' ? STRATEGIES[strategy] : strategy;
        if (!strategyConfig) {
            throw new Error(`Strategy not found: ${strategy}`);
        }

        const mergedParams = { ...strategyConfig.params, ...params };
        const signals = strategyConfig.execute(data, mergedParams);
        const fundingRates = options.fundingRates || [];

        let capital = this.initialCapital;
        let position = null; // { direction, entryPrice, size, entryTime }
        const trades = [];
        const equityCurve = [{ timestamp: data[0].timestamp, equity: capital }];

        for (const signal of signals) {
            const sigIdx = signal.index;

            // ENTRY: signal on candle[i] -> enter at OPEN of candle[i+1]
            if ((signal.type === 'BUY' || signal.type === 'SELL') && position === null) {
                const nextIdx = sigIdx + 1;
                if (nextIdx >= data.length) continue;

                const entryCandle = data[nextIdx];
                const midPrice = entryCandle.open;
                const spread = this._calcSpread(data, sigIdx);
                const orderSizeUsd = capital;

                // Volume check: reject if order > maxPositionPct of candle volume
                const candleVol = entryCandle.quoteVolume || (entryCandle.volume * midPrice);
                if (orderSizeUsd > candleVol * this.maxPositionPct) {
                    // Order too large relative to volume, skip
                    continue;
                }

                // Dynamic slippage
                const slippage = this._calcSlippage(orderSizeUsd, candleVol);

                // Execution price: BUY pays ask, SELL receives bid
                let execPrice;
                if (signal.type === 'BUY') {
                    execPrice = midPrice * (1 + spread / 2 + slippage);
                } else {
                    execPrice = midPrice * (1 - spread / 2 - slippage);
                }

                // Fee on entry
                const fee = orderSizeUsd * this.takerFee;
                const positionSize = (capital - fee) / execPrice;

                position = {
                    direction: signal.type === 'BUY' ? 'LONG' : 'SHORT',
                    entryPrice: execPrice,
                    size: positionSize,
                    entryTime: entryCandle.timestamp,
                    entryIdx: nextIdx
                };
                capital = 0;

                trades.push({
                    type: signal.type,
                    timestamp: entryCandle.timestamp,
                    date: entryCandle.date,
                    price: execPrice,
                    quantity: positionSize,
                    fee,
                    slippage: slippage * 100,
                    spread: spread * 100,
                    reason: signal.reason
                });

                continue;
            }

            // EXIT: signal on candle[i] -> exit at OPEN of candle[i+1]
            if (position !== null) {
                const isExitSignal = (position.direction === 'LONG' && signal.type === 'SELL') ||
                                     (position.direction === 'SHORT' && signal.type === 'BUY');
                if (!isExitSignal) continue;

                const nextIdx = sigIdx + 1;
                if (nextIdx >= data.length) continue;

                const exitCandle = data[nextIdx];
                const midPrice = exitCandle.open;
                const spread = this._calcSpread(data, sigIdx);
                const orderSizeUsd = position.size * midPrice;
                const candleVol = exitCandle.quoteVolume || (exitCandle.volume * midPrice);
                const slippage = this._calcSlippage(orderSizeUsd, candleVol);

                let execPrice;
                if (position.direction === 'LONG') {
                    // Selling: receive bid
                    execPrice = midPrice * (1 - spread / 2 - slippage);
                } else {
                    // Covering short: pay ask
                    execPrice = midPrice * (1 + spread / 2 + slippage);
                }

                const fee = position.size * execPrice * this.takerFee;
                const grossProceeds = position.size * execPrice;

                let pnl;
                if (position.direction === 'LONG') {
                    pnl = grossProceeds - (position.size * position.entryPrice);
                } else {
                    pnl = (position.size * position.entryPrice) - grossProceeds;
                }

                // Deduct funding
                const fundingSum = this._sumFunding(fundingRates, position.entryTime, exitCandle.timestamp);
                const fundingCost = Math.abs(fundingSum) * position.size * position.entryPrice;
                pnl -= fundingCost;

                // Deduct exit fee
                pnl -= fee;

                const pnlPercent = (pnl / (position.size * position.entryPrice)) * 100;

                trades.push({
                    type: position.direction === 'LONG' ? 'SELL' : 'BUY',
                    timestamp: exitCandle.timestamp,
                    date: exitCandle.date,
                    price: execPrice,
                    quantity: position.size,
                    fee,
                    pnl,
                    pnlPercent,
                    fundingCost,
                    slippage: slippage * 100,
                    spread: spread * 100,
                    reason: signal.reason
                });

                capital = (position.size * position.entryPrice) + pnl;
                position = null;
            }

            // Equity curve
            const equity = position
                ? position.size * data[Math.min(sigIdx + 1, data.length - 1)].close
                : capital;
            equityCurve.push({ timestamp: data[sigIdx].timestamp, equity });
        }

        // --- TP/SL simulation for open positions between signals ---
        // Walk candles and check TP/SL with worst-case rule
        // (This is a second pass for strategies that set TP/SL via params)

        // Final equity
        const finalPrice = data[data.length - 1].close;
        const finalEquity = position ? position.size * finalPrice : capital;

        const metrics = this._calculateMetrics(trades, equityCurve, data, finalEquity);

        return {
            strategy: strategyConfig.name,
            params: mergedParams,
            initialCapital: this.initialCapital,
            finalEquity,
            venue: this.venue,
            takerFee: this.takerFee,
            trades,
            metrics,
            equityCurve,
            dataSource: 'binance',
            candleCount: data.length
        };
    }

    /**
     * Run backtest with TP/SL on each candle (walk-forward, no look-ahead)
     * Used by strategies that rely on TP/SL rather than signal-based exits
     * @param {Array} data - candles
     * @param {string|Object} strategy - strategy
     * @param {Object} params - strategy params
     * @param {Object} options - { fundingRates, tpPercent, slPercent }
     */
    async runWithTPSL(data, strategy, params = {}, options = {}) {
        const strategyConfig = typeof strategy === 'string' ? STRATEGIES[strategy] : strategy;
        if (!strategyConfig) throw new Error(`Strategy not found: ${strategy}`);

        const mergedParams = { ...strategyConfig.params, ...params };
        const signals = strategyConfig.execute(data, mergedParams);
        const fundingRates = options.fundingRates || [];
        const tpPct = options.tpPercent || 4;
        const slPct = options.slPercent || 2;

        let capital = this.initialCapital;
        let position = null;
        const trades = [];
        const equityCurve = [{ timestamp: data[0].timestamp, equity: capital }];

        // Build a set of signal indices for fast lookup
        const signalMap = new Map();
        for (const sig of signals) {
            if (!signalMap.has(sig.index)) {
                signalMap.set(sig.index, sig);
            }
        }

        for (let i = 0; i < data.length - 1; i++) {
            const candle = data[i];
            const nextCandle = data[i + 1];

            // If we have a position, check TP/SL on this candle
            if (position) {
                let hitTP = false;
                let hitSL = false;

                if (position.direction === 'LONG') {
                    hitTP = candle.high >= position.tp;
                    hitSL = candle.low <= position.sl;
                } else {
                    hitTP = candle.low <= position.tp;
                    hitSL = candle.high >= position.sl;
                }

                // Worst-case: if both TP and SL hit in same candle, assume SL
                if (hitSL) {
                    const exitPrice = position.direction === 'LONG' ? position.sl : position.sl;
                    const fee = position.size * exitPrice * this.takerFee;
                    let pnl;
                    if (position.direction === 'LONG') {
                        pnl = position.size * (exitPrice - position.entryPrice);
                    } else {
                        pnl = position.size * (position.entryPrice - exitPrice);
                    }
                    const fundingCost = Math.abs(this._sumFunding(fundingRates, position.entryTime, candle.timestamp)) * position.size * position.entryPrice;
                    pnl -= fundingCost + fee;

                    trades.push({
                        type: position.direction === 'LONG' ? 'SELL' : 'BUY',
                        timestamp: candle.timestamp, date: candle.date,
                        price: exitPrice, quantity: position.size, fee,
                        pnl, pnlPercent: (pnl / (position.size * position.entryPrice)) * 100,
                        fundingCost, reason: 'SL hit (worst-case)'
                    });
                    capital = (position.size * position.entryPrice) + pnl;
                    position = null;
                } else if (hitTP) {
                    const exitPrice = position.tp;
                    const fee = position.size * exitPrice * this.takerFee;
                    let pnl;
                    if (position.direction === 'LONG') {
                        pnl = position.size * (exitPrice - position.entryPrice);
                    } else {
                        pnl = position.size * (position.entryPrice - exitPrice);
                    }
                    const fundingCost = Math.abs(this._sumFunding(fundingRates, position.entryTime, candle.timestamp)) * position.size * position.entryPrice;
                    pnl -= fundingCost + fee;

                    trades.push({
                        type: position.direction === 'LONG' ? 'SELL' : 'BUY',
                        timestamp: candle.timestamp, date: candle.date,
                        price: exitPrice, quantity: position.size, fee,
                        pnl, pnlPercent: (pnl / (position.size * position.entryPrice)) * 100,
                        fundingCost, reason: 'TP hit'
                    });
                    capital = (position.size * position.entryPrice) + pnl;
                    position = null;
                }

                // Update equity
                if (position) {
                    const mark = candle.close;
                    const unrealized = position.direction === 'LONG'
                        ? position.size * (mark - position.entryPrice)
                        : position.size * (position.entryPrice - mark);
                    equityCurve.push({ timestamp: candle.timestamp, equity: (position.size * position.entryPrice) + unrealized });
                } else {
                    equityCurve.push({ timestamp: candle.timestamp, equity: capital });
                }

                continue;
            }

            // Check for entry signal on this candle
            const sig = signalMap.get(i);
            if (sig && (sig.type === 'BUY' || sig.type === 'SELL')) {
                // Enter at OPEN of next candle
                const midPrice = nextCandle.open;
                const spread = this._calcSpread(data, i);
                const orderSizeUsd = capital;
                const candleVol = nextCandle.quoteVolume || (nextCandle.volume * midPrice);

                // Volume rejection
                if (orderSizeUsd > candleVol * this.maxPositionPct) continue;

                const slippage = this._calcSlippage(orderSizeUsd, candleVol);
                const direction = sig.type === 'BUY' ? 'LONG' : 'SHORT';

                let execPrice;
                if (direction === 'LONG') {
                    execPrice = midPrice * (1 + spread / 2 + slippage);
                } else {
                    execPrice = midPrice * (1 - spread / 2 - slippage);
                }

                const fee = orderSizeUsd * this.takerFee;
                const posSize = (capital - fee) / execPrice;

                let tp, sl;
                if (direction === 'LONG') {
                    tp = execPrice * (1 + tpPct / 100);
                    sl = execPrice * (1 - slPct / 100);
                } else {
                    tp = execPrice * (1 - tpPct / 100);
                    sl = execPrice * (1 + slPct / 100);
                }

                position = {
                    direction,
                    entryPrice: execPrice,
                    size: posSize,
                    entryTime: nextCandle.timestamp,
                    tp, sl
                };
                capital = 0;

                trades.push({
                    type: sig.type,
                    timestamp: nextCandle.timestamp, date: nextCandle.date,
                    price: execPrice, quantity: posSize, fee,
                    slippage: slippage * 100, spread: spread * 100,
                    reason: sig.reason
                });
            }

            equityCurve.push({ timestamp: candle.timestamp, equity: position ? position.size * candle.close : capital });
        }

        const finalPrice = data[data.length - 1].close;
        const finalEquity = position ? position.size * finalPrice : capital;
        const metrics = this._calculateMetrics(trades, equityCurve, data, finalEquity);

        return {
            strategy: strategyConfig.name,
            params: mergedParams,
            initialCapital: this.initialCapital,
            finalEquity,
            venue: this.venue,
            takerFee: this.takerFee,
            tpPercent: tpPct,
            slPercent: slPct,
            trades,
            metrics,
            equityCurve,
            dataSource: 'binance',
            candleCount: data.length
        };
    }

    _calculateMetrics(trades, equityCurve, data, finalEquity) {
        const totalReturn = ((finalEquity - this.initialCapital) / this.initialCapital) * 100;

        const sellTrades = trades.filter(t => t.pnl !== undefined);
        const winningTrades = sellTrades.filter(t => t.pnl > 0);
        const losingTrades = sellTrades.filter(t => t.pnl <= 0);

        const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;

        const avgWin = winningTrades.length > 0
            ? winningTrades.reduce((a, t) => a + t.pnlPercent, 0) / winningTrades.length
            : 0;
        const avgLoss = losingTrades.length > 0
            ? losingTrades.reduce((a, t) => a + t.pnlPercent, 0) / losingTrades.length
            : 0;

        const grossProfit = winningTrades.reduce((a, t) => a + t.pnl, 0);
        const grossLoss = Math.abs(losingTrades.reduce((a, t) => a + t.pnl, 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

        // Max Drawdown
        let peak = this.initialCapital;
        let maxDrawdown = 0;
        for (const point of equityCurve) {
            if (point.equity > peak) peak = point.equity;
            const drawdown = ((peak - point.equity) / peak) * 100;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }

        // Sharpe Ratio
        const returns = [];
        for (let i = 1; i < equityCurve.length; i++) {
            if (equityCurve[i - 1].equity > 0) {
                returns.push((equityCurve[i].equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity);
            }
        }
        const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
        const stdReturn = returns.length > 1
            ? Math.sqrt(returns.reduce((a, r) => a + Math.pow(r - avgReturn, 2), 0) / returns.length)
            : 0;
        const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(365 * 24) : 0;

        // Buy & Hold comparison
        const buyHoldReturn = data.length > 1
            ? ((data[data.length - 1].close - data[0].close) / data[0].close) * 100
            : 0;
        const alpha = totalReturn - buyHoldReturn;

        // Total fees & funding
        const totalFees = trades.reduce((a, t) => a + (t.fee || 0), 0);
        const totalFunding = trades.reduce((a, t) => a + (t.fundingCost || 0), 0);

        return {
            totalReturn: Number(totalReturn.toFixed(2)),
            buyHoldReturn: Number(buyHoldReturn.toFixed(2)),
            alpha: Number(alpha.toFixed(2)),
            totalTrades: trades.length,
            closedTrades: sellTrades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate: Number(winRate.toFixed(2)),
            avgWin: Number(avgWin.toFixed(2)),
            avgLoss: Number(avgLoss.toFixed(2)),
            profitFactor: profitFactor === Infinity ? 999 : Number(profitFactor.toFixed(2)),
            maxDrawdown: Number(maxDrawdown.toFixed(2)),
            sharpeRatio: Number(sharpeRatio.toFixed(2)),
            totalFees: Number(totalFees.toFixed(2)),
            totalFunding: Number(totalFunding.toFixed(4)),
            venue: this.venue,
            dataSource: 'binance'
        };
    }

    /**
     * Compare multiple strategies on the same data
     */
    async compareStrategies(data, strategies, options = {}) {
        const results = [];
        for (const [name, params] of Object.entries(strategies)) {
            try {
                const result = await this.run(data, name, params, options);
                results.push(result);
            } catch (e) {
                console.error(`Error running ${name}:`, e.message);
            }
        }
        results.sort((a, b) => b.metrics.totalReturn - a.metrics.totalReturn);
        return results;
    }
}


// ============================================
// LEGACY: Génération de données historiques (fallback)
// ============================================
class HistoricalDataGenerator {
    constructor(pair, days = 365) {
        this.pair = pair;
        this.days = days;
        this.data = [];

        this.basePrices = {
            'BTC/USDC': 45000, 'ETH/USDC': 2500, 'SOL/USDC': 100,
            'ARB/USDC': 1.20, 'XRP/USDC': 0.60, 'ADA/USDC': 0.45,
            'AVAX/USDC': 35, 'LINK/USDC': 15, 'UNI/USDC': 8,
            'OP/USDC': 2, 'INJ/USDC': 20, 'SUI/USDC': 1.50
        };

        this.volatility = {
            'BTC/USDC': 0.03, 'ETH/USDC': 0.04, 'SOL/USDC': 0.06,
            'ARB/USDC': 0.08, 'XRP/USDC': 0.05, 'ADA/USDC': 0.05,
            'AVAX/USDC': 0.06, 'LINK/USDC': 0.05, 'UNI/USDC': 0.06,
            'OP/USDC': 0.07, 'INJ/USDC': 0.08, 'SUI/USDC': 0.09
        };
    }

    generate() {
        const basePrice = this.basePrices[this.pair] || 100;
        const vol = this.volatility[this.pair] || 0.05;

        let price = basePrice;
        const now = Date.now();
        const msPerDay = 24 * 60 * 60 * 1000;
        const msPerCandle = 60 * 60 * 1000;

        const trendPhases = this.generateTrendPhases();

        for (let d = this.days; d >= 0; d--) {
            for (let h = 0; h < 24; h++) {
                const timestamp = now - (d * msPerDay) - ((23 - h) * msPerCandle);
                const dayIndex = this.days - d;
                const trend = this.getTrendAtDay(trendPhases, dayIndex);
                const randomWalk = (Math.random() - 0.5) * 2 * vol;
                const trendEffect = trend * 0.001;
                const change = randomWalk + trendEffect;
                const open = price;
                price *= (1 + change);
                const high = Math.max(open, price) * (1 + Math.random() * vol * 0.5);
                const low = Math.min(open, price) * (1 - Math.random() * vol * 0.5);
                const close = price;
                const volume = basePrice * 1000000 * (0.5 + Math.random());

                this.data.push({
                    timestamp, date: new Date(timestamp).toISOString(),
                    open: Number(open.toFixed(6)), high: Number(high.toFixed(6)),
                    low: Number(low.toFixed(6)), close: Number(close.toFixed(6)),
                    volume: Number(volume.toFixed(2)),
                    quoteVolume: Number(volume.toFixed(2)),
                    trades: Math.floor(Math.random() * 5000 + 1000)
                });
            }
        }
        return this.data;
    }

    generateTrendPhases() {
        const phases = [];
        let currentDay = 0;
        while (currentDay < this.days) {
            const duration = 20 + Math.floor(Math.random() * 60);
            const trend = (Math.random() - 0.5) * 2;
            phases.push({ start: currentDay, end: currentDay + duration, trend });
            currentDay += duration;
        }
        return phases;
    }

    getTrendAtDay(phases, day) {
        for (const phase of phases) {
            if (day >= phase.start && day < phase.end) return phase.trend;
        }
        return 0;
    }
}

// ============================================
// Indicateurs techniques (unchanged)
// ============================================
class TechnicalIndicators {
    static SMA(data, period) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b.close, 0);
                result.push(sum / period);
            }
        }
        return result;
    }

    static EMA(data, period) {
        const result = [];
        const multiplier = 2 / (period + 1);
        for (let i = 0; i < data.length; i++) {
            if (i === 0) {
                result.push(data[i].close);
            } else {
                const ema = (data[i].close - result[i - 1]) * multiplier + result[i - 1];
                result.push(ema);
            }
        }
        return result;
    }

    static RSI(data, period = 14) {
        const result = [];
        const gains = [];
        const losses = [];
        for (let i = 0; i < data.length; i++) {
            if (i === 0) { result.push(50); continue; }
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
            if (i < period) {
                result.push(50);
            } else {
                const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
                const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                result.push(100 - (100 / (1 + rs)));
            }
        }
        return result;
    }

    static MACD(data, fast = 12, slow = 26, signal = 9) {
        const emaFast = this.EMA(data, fast);
        const emaSlow = this.EMA(data, slow);
        const macdLine = emaFast.map((f, i) => f - emaSlow[i]);
        const signalLine = [];
        const multiplier = 2 / (signal + 1);
        for (let i = 0; i < macdLine.length; i++) {
            if (i === 0) { signalLine.push(macdLine[i]); }
            else { signalLine.push((macdLine[i] - signalLine[i - 1]) * multiplier + signalLine[i - 1]); }
        }
        const histogram = macdLine.map((m, i) => m - signalLine[i]);
        return { macdLine, signalLine, histogram };
    }

    static BollingerBands(data, period = 20, stdDev = 2) {
        const sma = this.SMA(data, period);
        const upper = [], lower = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) { upper.push(null); lower.push(null); }
            else {
                const slice = data.slice(i - period + 1, i + 1).map(d => d.close);
                const mean = sma[i];
                const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
                const std = Math.sqrt(variance);
                upper.push(mean + stdDev * std);
                lower.push(mean - stdDev * std);
            }
        }
        return { upper, middle: sma, lower };
    }
}

// ============================================
// Stratégies de trading prédéfinies (unchanged)
// ============================================
const STRATEGIES = {
    SMA_CROSSOVER: {
        name: 'SMA Crossover',
        description: 'Buy when fast SMA crosses above slow SMA, sell when crosses below',
        params: { fastPeriod: 10, slowPeriod: 30 },
        execute: (data, params) => {
            const signals = [];
            const fastSMA = TechnicalIndicators.SMA(data, params.fastPeriod);
            const slowSMA = TechnicalIndicators.SMA(data, params.slowPeriod);
            for (let i = 1; i < data.length; i++) {
                if (fastSMA[i] && slowSMA[i] && fastSMA[i - 1] && slowSMA[i - 1]) {
                    if (fastSMA[i] > slowSMA[i] && fastSMA[i - 1] <= slowSMA[i - 1]) {
                        signals.push({ index: i, type: 'BUY', price: data[i].close, reason: 'SMA Golden Cross' });
                    } else if (fastSMA[i] < slowSMA[i] && fastSMA[i - 1] >= slowSMA[i - 1]) {
                        signals.push({ index: i, type: 'SELL', price: data[i].close, reason: 'SMA Death Cross' });
                    }
                }
            }
            return signals;
        }
    },

    RSI_REVERSAL: {
        name: 'RSI Reversal',
        description: 'Buy when RSI < 30 (oversold), sell when RSI > 70 (overbought)',
        params: { period: 14, oversold: 30, overbought: 70 },
        execute: (data, params) => {
            const signals = [];
            const rsi = TechnicalIndicators.RSI(data, params.period);
            for (let i = 1; i < data.length; i++) {
                if (rsi[i] < params.oversold && rsi[i - 1] >= params.oversold) {
                    signals.push({ index: i, type: 'BUY', price: data[i].close, reason: `RSI Oversold (${rsi[i].toFixed(1)})` });
                } else if (rsi[i] > params.overbought && rsi[i - 1] <= params.overbought) {
                    signals.push({ index: i, type: 'SELL', price: data[i].close, reason: `RSI Overbought (${rsi[i].toFixed(1)})` });
                }
            }
            return signals;
        }
    },

    MACD_CROSSOVER: {
        name: 'MACD Crossover',
        description: 'Buy on MACD bullish crossover, sell on bearish crossover',
        params: { fast: 12, slow: 26, signal: 9 },
        execute: (data, params) => {
            const signals = [];
            const { macdLine, signalLine } = TechnicalIndicators.MACD(data, params.fast, params.slow, params.signal);
            for (let i = 1; i < data.length; i++) {
                if (macdLine[i] > signalLine[i] && macdLine[i - 1] <= signalLine[i - 1]) {
                    signals.push({ index: i, type: 'BUY', price: data[i].close, reason: 'MACD Bullish Cross' });
                } else if (macdLine[i] < signalLine[i] && macdLine[i - 1] >= signalLine[i - 1]) {
                    signals.push({ index: i, type: 'SELL', price: data[i].close, reason: 'MACD Bearish Cross' });
                }
            }
            return signals;
        }
    },

    BOLLINGER_BOUNCE: {
        name: 'Bollinger Bounce',
        description: 'Buy at lower band, sell at upper band',
        params: { period: 20, stdDev: 2 },
        execute: (data, params) => {
            const signals = [];
            const bb = TechnicalIndicators.BollingerBands(data, params.period, params.stdDev);
            for (let i = 1; i < data.length; i++) {
                if (bb.lower[i] && bb.upper[i]) {
                    if (data[i].close <= bb.lower[i] && data[i - 1].close > bb.lower[i - 1]) {
                        signals.push({ index: i, type: 'BUY', price: data[i].close, reason: 'Bollinger Lower Touch' });
                    } else if (data[i].close >= bb.upper[i] && data[i - 1].close < bb.upper[i - 1]) {
                        signals.push({ index: i, type: 'SELL', price: data[i].close, reason: 'Bollinger Upper Touch' });
                    }
                }
            }
            return signals;
        }
    },

    MOMENTUM: {
        name: 'Momentum',
        description: 'Buy when price increases X% in Y periods, sell on reversal',
        params: { lookback: 20, threshold: 0.05 },
        execute: (data, params) => {
            const signals = [];
            for (let i = params.lookback; i < data.length; i++) {
                const momentum = (data[i].close - data[i - params.lookback].close) / data[i - params.lookback].close;
                const prevMomentum = (data[i - 1].close - data[i - params.lookback - 1].close) / data[i - params.lookback - 1].close;
                if (momentum > params.threshold && prevMomentum <= params.threshold) {
                    signals.push({ index: i, type: 'BUY', price: data[i].close, reason: `Momentum ${(momentum * 100).toFixed(1)}%` });
                } else if (momentum < -params.threshold && prevMomentum >= -params.threshold) {
                    signals.push({ index: i, type: 'SELL', price: data[i].close, reason: `Negative Momentum ${(momentum * 100).toFixed(1)}%` });
                }
            }
            return signals;
        }
    },

    DCA: {
        name: 'Dollar Cost Averaging',
        description: 'Buy fixed amount at regular intervals',
        params: { intervalHours: 24 * 7 },
        execute: (data, params) => {
            const signals = [];
            let lastBuy = 0;
            for (let i = 0; i < data.length; i++) {
                if (i - lastBuy >= params.intervalHours) {
                    signals.push({ index: i, type: 'BUY', price: data[i].close, reason: 'DCA Schedule' });
                    lastBuy = i;
                }
            }
            return signals;
        }
    },

    BUY_AND_HOLD: {
        name: 'Buy and Hold',
        description: 'Buy at start, hold until end',
        params: {},
        execute: (data) => {
            return [{ index: 0, type: 'BUY', price: data[0].close, reason: 'Initial Buy' }];
        }
    }
};

// ============================================
// LEGACY: Moteur de backtest (fallback)
// ============================================
class BacktestEngine {
    constructor(config = {}) {
        this.initialCapital = config.initialCapital || 10000;
        this.tradingFee = config.tradingFee || 0.001;
        this.slippage = config.slippage || 0.0005;
    }

    run(data, strategy, params = {}) {
        const strategyConfig = typeof strategy === 'string' ? STRATEGIES[strategy] : strategy;
        if (!strategyConfig) throw new Error(`Strategy not found: ${strategy}`);

        const mergedParams = { ...strategyConfig.params, ...params };
        const signals = strategyConfig.execute(data, mergedParams);

        let capital = this.initialCapital;
        let position = 0;
        let entryPrice = 0;
        const trades = [];
        const equityCurve = [{ timestamp: data[0].timestamp, equity: capital }];

        for (const signal of signals) {
            const price = signal.price * (1 + (signal.type === 'BUY' ? this.slippage : -this.slippage));
            const fee = price * this.tradingFee;

            if (signal.type === 'BUY' && position === 0) {
                position = (capital - fee) / price;
                entryPrice = price;
                capital = 0;
                trades.push({ type: 'BUY', timestamp: data[signal.index].timestamp, date: data[signal.index].date, price, quantity: position, fee, reason: signal.reason });
            } else if (signal.type === 'SELL' && position > 0) {
                const proceeds = position * price - fee;
                const pnl = proceeds - (position * entryPrice);
                const pnlPercent = (pnl / (position * entryPrice)) * 100;
                trades.push({ type: 'SELL', timestamp: data[signal.index].timestamp, date: data[signal.index].date, price, quantity: position, fee, pnl, pnlPercent, reason: signal.reason });
                capital = proceeds;
                position = 0;
            }

            const equity = position > 0 ? position * data[signal.index].close : capital;
            equityCurve.push({ timestamp: data[signal.index].timestamp, equity });
        }

        const finalPrice = data[data.length - 1].close;
        const finalEquity = position > 0 ? position * finalPrice : capital;
        const metrics = this.calculateMetrics(trades, equityCurve, data, finalEquity);

        return { strategy: strategyConfig.name, params: mergedParams, initialCapital: this.initialCapital, finalEquity, trades, metrics, equityCurve };
    }

    calculateMetrics(trades, equityCurve, data, finalEquity) {
        const totalReturn = ((finalEquity - this.initialCapital) / this.initialCapital) * 100;
        const sellTrades = trades.filter(t => t.type === 'SELL');
        const winningTrades = sellTrades.filter(t => t.pnl > 0);
        const losingTrades = sellTrades.filter(t => t.pnl <= 0);
        const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;
        const avgWin = winningTrades.length > 0 ? winningTrades.reduce((a, t) => a + t.pnlPercent, 0) / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((a, t) => a + t.pnlPercent, 0) / losingTrades.length : 0;
        const grossProfit = winningTrades.reduce((a, t) => a + t.pnl, 0);
        const grossLoss = Math.abs(losingTrades.reduce((a, t) => a + t.pnl, 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

        let peak = this.initialCapital;
        let maxDrawdown = 0;
        for (const point of equityCurve) {
            if (point.equity > peak) peak = point.equity;
            const drawdown = ((peak - point.equity) / peak) * 100;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }

        const returns = [];
        for (let i = 1; i < equityCurve.length; i++) {
            returns.push((equityCurve[i].equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity);
        }
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const stdReturn = Math.sqrt(returns.reduce((a, r) => a + Math.pow(r - avgReturn, 2), 0) / returns.length);
        const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(365 * 24) : 0;
        const buyHoldReturn = ((data[data.length - 1].close - data[0].close) / data[0].close) * 100;
        const alpha = totalReturn - buyHoldReturn;

        return {
            totalReturn: Number(totalReturn.toFixed(2)),
            buyHoldReturn: Number(buyHoldReturn.toFixed(2)),
            alpha: Number(alpha.toFixed(2)),
            totalTrades: trades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate: Number(winRate.toFixed(2)),
            avgWin: Number(avgWin.toFixed(2)),
            avgLoss: Number(avgLoss.toFixed(2)),
            profitFactor: Number(profitFactor.toFixed(2)),
            maxDrawdown: Number(maxDrawdown.toFixed(2)),
            sharpeRatio: Number(sharpeRatio.toFixed(2)),
            totalFees: Number(trades.reduce((a, t) => a + t.fee, 0).toFixed(2))
        };
    }

    compareStrategies(data, strategies) {
        const results = [];
        for (const [name, params] of Object.entries(strategies)) {
            try { results.push(this.run(data, name, params)); }
            catch (e) { console.error(`Error running ${name}:`, e.message); }
        }
        results.sort((a, b) => b.metrics.totalReturn - a.metrics.totalReturn);
        return results;
    }
}

// ============================================
// Gestionnaire de backtests par utilisateur (updated for async)
// ============================================
class UserBacktestManager {
    constructor() {
        this.userBacktests = new Map();
    }

    async createBacktest(userId, config) {
        const backtestId = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const { pair, days, strategy, params, initialCapital, venue, useRealData } = config;

        let data, fundingRates, result;

        if (useRealData !== false) {
            // Default: use real Binance data
            const dp = new BinanceDataProvider();
            data = await dp.fetchCandles(pair, '1h', days);

            if (data.length < 50) {
                // Fallback to synthetic if Binance returns too little data
                console.log('[BACKTEST] Not enough Binance data, falling back to synthetic');
                const generator = new HistoricalDataGenerator(pair, days);
                data = generator.generate();
                const engine = new BacktestEngine({ initialCapital });
                result = engine.run(data, strategy, params);
            } else {
                fundingRates = await dp.fetchFundingRates(pair, days);
                const engine = new RealisticBacktestEngine({ initialCapital, venue: venue || 'gmx' });
                result = await engine.run(data, strategy, params, { fundingRates });
            }
        } else {
            // Explicit synthetic mode
            const generator = new HistoricalDataGenerator(pair, days);
            data = generator.generate();
            const engine = new BacktestEngine({ initialCapital });
            result = engine.run(data, strategy, params);
        }

        const backtest = {
            id: backtestId,
            userId,
            config,
            result,
            createdAt: Date.now()
        };

        if (!this.userBacktests.has(userId)) {
            this.userBacktests.set(userId, []);
        }
        this.userBacktests.get(userId).push(backtest);
        return backtest;
    }

    getUserBacktests(userId) {
        return this.userBacktests.get(userId) || [];
    }

    getBacktest(userId, backtestId) {
        const backtests = this.userBacktests.get(userId) || [];
        return backtests.find(b => b.id === backtestId);
    }

    async compareUserStrategies(userId, pair, days, initialCapital, venue) {
        const dp = new BinanceDataProvider();
        let data = await dp.fetchCandles(pair, '1h', days);

        if (data.length < 50) {
            // Fallback
            const generator = new HistoricalDataGenerator(pair, days);
            data = generator.generate();
            const engine = new BacktestEngine({ initialCapital });
            return {
                pair, days, initialCapital, dataSource: 'synthetic',
                comparison: engine.compareStrategies(data, {
                    SMA_CROSSOVER: {}, RSI_REVERSAL: {}, MACD_CROSSOVER: {},
                    BOLLINGER_BOUNCE: {}, MOMENTUM: {}, DCA: {}, BUY_AND_HOLD: {}
                }).map(r => ({
                    strategy: r.strategy, totalReturn: r.metrics.totalReturn,
                    winRate: r.metrics.winRate, maxDrawdown: r.metrics.maxDrawdown,
                    sharpeRatio: r.metrics.sharpeRatio, trades: r.metrics.totalTrades, alpha: r.metrics.alpha
                }))
            };
        }

        const fundingRates = await dp.fetchFundingRates(pair, days);
        const engine = new RealisticBacktestEngine({ initialCapital, venue: venue || 'gmx' });
        const results = await engine.compareStrategies(data, {
            SMA_CROSSOVER: {}, RSI_REVERSAL: {}, MACD_CROSSOVER: {},
            BOLLINGER_BOUNCE: {}, MOMENTUM: {}, DCA: {}, BUY_AND_HOLD: {}
        }, { fundingRates });

        return {
            pair, days, initialCapital, dataSource: 'binance', venue: venue || 'gmx',
            comparison: results.map(r => ({
                strategy: r.strategy, totalReturn: r.metrics.totalReturn,
                winRate: r.metrics.winRate, maxDrawdown: r.metrics.maxDrawdown,
                sharpeRatio: r.metrics.sharpeRatio, trades: r.metrics.totalTrades,
                alpha: r.metrics.alpha, totalFees: r.metrics.totalFees,
                totalFunding: r.metrics.totalFunding
            }))
        };
    }
}

module.exports = {
    // New (realistic)
    BinanceDataProvider,
    RealisticBacktestEngine,
    VENUE_FEES,
    // Legacy (fallback)
    HistoricalDataGenerator,
    BacktestEngine,
    // Shared
    TechnicalIndicators,
    UserBacktestManager,
    STRATEGIES
};
