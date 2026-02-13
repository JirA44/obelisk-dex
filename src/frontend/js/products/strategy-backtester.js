/**
 * STRATEGY BACKTESTER
 * Tests trading strategies against real historical data
 * Validates which strategies have actual edge
 */

const StrategyBacktester = {
    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    config: {
        initialCapital: 10000,
        maxPositionSize: 0.1,      // 10% of capital per trade
        fees: {
            maker: 0.0002,
            taker: 0.0005,
            slippage: 0.0003
        },
        riskFreeRate: 0.05,        // 5% annual for Sharpe
    },

    // Historical data cache
    priceData: {},
    backtestResults: {},

    // ═══════════════════════════════════════════════════════════════════════════════
    // DATA FETCHING
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Fetch historical klines from Binance
     */
    async fetchHistoricalData(symbol, interval = '1h', days = 90) {
        const cacheKey = `${symbol}-${interval}-${days}`;
        if (this.priceData[cacheKey]) {
            return this.priceData[cacheKey];
        }

        try {
            const endTime = Date.now();
            const startTime = endTime - (days * 24 * 60 * 60 * 1000);
            const limit = Math.min(1000, days * 24); // Max 1000 candles

            const response = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`
            );

            if (!response.ok) throw new Error('Failed to fetch data');

            const data = await response.json();

            const candles = data.map(k => ({
                timestamp: k[0],
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5])
            }));

            this.priceData[cacheKey] = candles;
            console.log(`[Backtest] Loaded ${candles.length} candles for ${symbol}`);
            return candles;

        } catch (error) {
            console.error(`[Backtest] Failed to fetch ${symbol}:`, error.message);
            return [];
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // INDICATOR CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    calculateSMA(data, period) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                const slice = data.slice(i - period + 1, i + 1);
                result.push(slice.reduce((a, b) => a + b, 0) / period);
            }
        }
        return result;
    },

    calculateEMA(data, period) {
        const result = [];
        const k = 2 / (period + 1);

        for (let i = 0; i < data.length; i++) {
            if (i === 0) {
                result.push(data[0]);
            } else {
                result.push(data[i] * k + result[i - 1] * (1 - k));
            }
        }
        return result;
    },

    calculateRSI(closes, period = 14) {
        const result = [];
        const gains = [];
        const losses = [];

        for (let i = 0; i < closes.length; i++) {
            if (i === 0) {
                result.push(50);
                continue;
            }

            const change = closes[i] - closes[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);

            if (i < period) {
                result.push(50);
                continue;
            }

            const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
            const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

            if (avgLoss === 0) {
                result.push(100);
            } else {
                const rs = avgGain / avgLoss;
                result.push(100 - (100 / (1 + rs)));
            }
        }
        return result;
    },

    calculateMACD(closes) {
        const ema12 = this.calculateEMA(closes, 12);
        const ema26 = this.calculateEMA(closes, 26);

        const macdLine = ema12.map((v, i) => v - ema26[i]);
        const signalLine = this.calculateEMA(macdLine, 9);
        const histogram = macdLine.map((v, i) => v - signalLine[i]);

        return { macdLine, signalLine, histogram };
    },

    calculateBollingerBands(closes, period = 20, stdDev = 2) {
        const sma = this.calculateSMA(closes, period);
        const upper = [];
        const lower = [];

        for (let i = 0; i < closes.length; i++) {
            if (i < period - 1) {
                upper.push(null);
                lower.push(null);
            } else {
                const slice = closes.slice(i - period + 1, i + 1);
                const mean = sma[i];
                const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
                const std = Math.sqrt(variance);
                upper.push(mean + std * stdDev);
                lower.push(mean - std * stdDev);
            }
        }
        return { upper, middle: sma, lower };
    },

    calculateATR(candles, period = 14) {
        const result = [];

        for (let i = 0; i < candles.length; i++) {
            if (i === 0) {
                result.push(candles[0].high - candles[0].low);
                continue;
            }

            const tr = Math.max(
                candles[i].high - candles[i].low,
                Math.abs(candles[i].high - candles[i - 1].close),
                Math.abs(candles[i].low - candles[i - 1].close)
            );

            if (i < period) {
                result.push(tr);
            } else {
                const atr = result.slice(-period).reduce((a, b) => a + b, 0) / period;
                result.push(atr);
            }
        }
        return result;
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRADING STRATEGIES
    // ═══════════════════════════════════════════════════════════════════════════════

    strategies: {
        // Trend Following - SMA Crossover
        'trend-sma': {
            name: 'Trend SMA Crossover',
            description: 'Buy when SMA20 crosses above SMA50, sell when crosses below',
            params: { fast: 20, slow: 50 },
            generate: (candles, params) => {
                const closes = candles.map(c => c.close);
                const smaFast = StrategyBacktester.calculateSMA(closes, params.fast);
                const smaSlow = StrategyBacktester.calculateSMA(closes, params.slow);

                const signals = [];
                for (let i = 1; i < candles.length; i++) {
                    if (smaFast[i] > smaSlow[i] && smaFast[i - 1] <= smaSlow[i - 1]) {
                        signals.push({ index: i, side: 'long', price: candles[i].close });
                    } else if (smaFast[i] < smaSlow[i] && smaFast[i - 1] >= smaSlow[i - 1]) {
                        signals.push({ index: i, side: 'short', price: candles[i].close });
                    }
                }
                return signals;
            }
        },

        // Mean Reversion - RSI
        'mean-revert-rsi': {
            name: 'Mean Reversion RSI',
            description: 'Buy when RSI < 30 (oversold), sell when RSI > 70 (overbought)',
            params: { period: 14, oversold: 30, overbought: 70 },
            generate: (candles, params) => {
                const closes = candles.map(c => c.close);
                const rsi = StrategyBacktester.calculateRSI(closes, params.period);

                const signals = [];
                let inPosition = false;
                let positionSide = null;

                for (let i = 1; i < candles.length; i++) {
                    if (!inPosition && rsi[i] < params.oversold && rsi[i - 1] >= params.oversold) {
                        signals.push({ index: i, side: 'long', price: candles[i].close });
                        inPosition = true;
                        positionSide = 'long';
                    } else if (!inPosition && rsi[i] > params.overbought && rsi[i - 1] <= params.overbought) {
                        signals.push({ index: i, side: 'short', price: candles[i].close });
                        inPosition = true;
                        positionSide = 'short';
                    } else if (inPosition) {
                        // Exit on RSI normalization
                        if (positionSide === 'long' && rsi[i] > 50) {
                            signals.push({ index: i, side: 'close', price: candles[i].close });
                            inPosition = false;
                        } else if (positionSide === 'short' && rsi[i] < 50) {
                            signals.push({ index: i, side: 'close', price: candles[i].close });
                            inPosition = false;
                        }
                    }
                }
                return signals;
            }
        },

        // Momentum - MACD
        'momentum-macd': {
            name: 'Momentum MACD',
            description: 'Buy on MACD bullish crossover, sell on bearish crossover',
            params: {},
            generate: (candles, params) => {
                const closes = candles.map(c => c.close);
                const { macdLine, signalLine, histogram } = StrategyBacktester.calculateMACD(closes);

                const signals = [];
                for (let i = 1; i < candles.length; i++) {
                    if (histogram[i] > 0 && histogram[i - 1] <= 0) {
                        signals.push({ index: i, side: 'long', price: candles[i].close });
                    } else if (histogram[i] < 0 && histogram[i - 1] >= 0) {
                        signals.push({ index: i, side: 'short', price: candles[i].close });
                    }
                }
                return signals;
            }
        },

        // Breakout - Bollinger Bands
        'breakout-bb': {
            name: 'Breakout Bollinger',
            description: 'Buy on upper band breakout, sell on lower band breakdown',
            params: { period: 20, stdDev: 2 },
            generate: (candles, params) => {
                const closes = candles.map(c => c.close);
                const bb = StrategyBacktester.calculateBollingerBands(closes, params.period, params.stdDev);

                const signals = [];
                for (let i = 1; i < candles.length; i++) {
                    if (bb.upper[i] && closes[i] > bb.upper[i] && closes[i - 1] <= bb.upper[i - 1]) {
                        signals.push({ index: i, side: 'long', price: candles[i].close });
                    } else if (bb.lower[i] && closes[i] < bb.lower[i] && closes[i - 1] >= bb.lower[i - 1]) {
                        signals.push({ index: i, side: 'short', price: candles[i].close });
                    }
                }
                return signals;
            }
        },

        // Range Trading - BB Mean Reversion
        'range-bb': {
            name: 'Range BB Reversion',
            description: 'Buy at lower band, sell at upper band (range bound)',
            params: { period: 20, stdDev: 2 },
            generate: (candles, params) => {
                const closes = candles.map(c => c.close);
                const bb = StrategyBacktester.calculateBollingerBands(closes, params.period, params.stdDev);

                const signals = [];
                let inPosition = false;
                let positionSide = null;

                for (let i = 1; i < candles.length; i++) {
                    if (!bb.lower[i]) continue;

                    if (!inPosition && closes[i] <= bb.lower[i]) {
                        signals.push({ index: i, side: 'long', price: candles[i].close });
                        inPosition = true;
                        positionSide = 'long';
                    } else if (!inPosition && closes[i] >= bb.upper[i]) {
                        signals.push({ index: i, side: 'short', price: candles[i].close });
                        inPosition = true;
                        positionSide = 'short';
                    } else if (inPosition) {
                        if (positionSide === 'long' && closes[i] >= bb.middle[i]) {
                            signals.push({ index: i, side: 'close', price: candles[i].close });
                            inPosition = false;
                        } else if (positionSide === 'short' && closes[i] <= bb.middle[i]) {
                            signals.push({ index: i, side: 'close', price: candles[i].close });
                            inPosition = false;
                        }
                    }
                }
                return signals;
            }
        },

        // DCA - Dollar Cost Average on dips
        'dca-dip': {
            name: 'DCA on Dips',
            description: 'Buy when price drops 3%+ from recent high',
            params: { dipThreshold: 0.03, lookback: 24 },
            generate: (candles, params) => {
                const signals = [];

                for (let i = params.lookback; i < candles.length; i++) {
                    const recentHigh = Math.max(...candles.slice(i - params.lookback, i).map(c => c.high));
                    const currentPrice = candles[i].close;
                    const dip = (recentHigh - currentPrice) / recentHigh;

                    if (dip >= params.dipThreshold) {
                        // Only signal once per dip
                        const lastSignal = signals[signals.length - 1];
                        if (!lastSignal || i - lastSignal.index > params.lookback / 2) {
                            signals.push({ index: i, side: 'long', price: currentPrice });
                        }
                    }
                }
                return signals;
            }
        },

        // Swing - EMA + RSI combo
        'swing-ema-rsi': {
            name: 'Swing EMA+RSI',
            description: 'Buy when price > EMA21 and RSI < 45, sell when price < EMA21 and RSI > 55',
            params: { emaPeriod: 21, rsiPeriod: 14 },
            generate: (candles, params) => {
                const closes = candles.map(c => c.close);
                const ema = StrategyBacktester.calculateEMA(closes, params.emaPeriod);
                const rsi = StrategyBacktester.calculateRSI(closes, params.rsiPeriod);

                const signals = [];
                let inPosition = false;
                let positionSide = null;

                for (let i = params.emaPeriod; i < candles.length; i++) {
                    const price = closes[i];

                    if (!inPosition) {
                        if (price > ema[i] && rsi[i] < 45 && rsi[i] > 30) {
                            signals.push({ index: i, side: 'long', price });
                            inPosition = true;
                            positionSide = 'long';
                        } else if (price < ema[i] && rsi[i] > 55 && rsi[i] < 70) {
                            signals.push({ index: i, side: 'short', price });
                            inPosition = true;
                            positionSide = 'short';
                        }
                    } else {
                        // Exit conditions
                        if (positionSide === 'long' && (price < ema[i] || rsi[i] > 70)) {
                            signals.push({ index: i, side: 'close', price });
                            inPosition = false;
                        } else if (positionSide === 'short' && (price > ema[i] || rsi[i] < 30)) {
                            signals.push({ index: i, side: 'close', price });
                            inPosition = false;
                        }
                    }
                }
                return signals;
            }
        },

        // Volatility Breakout
        'volatility-atr': {
            name: 'Volatility ATR Breakout',
            description: 'Buy when price breaks above previous close + 1.5 ATR',
            params: { atrPeriod: 14, multiplier: 1.5 },
            generate: (candles, params) => {
                const atr = StrategyBacktester.calculateATR(candles, params.atrPeriod);

                const signals = [];
                let inPosition = false;

                for (let i = params.atrPeriod + 1; i < candles.length; i++) {
                    const prevClose = candles[i - 1].close;
                    const currentClose = candles[i].close;
                    const threshold = atr[i - 1] * params.multiplier;

                    if (!inPosition) {
                        if (currentClose > prevClose + threshold) {
                            signals.push({ index: i, side: 'long', price: currentClose });
                            inPosition = true;
                        } else if (currentClose < prevClose - threshold) {
                            signals.push({ index: i, side: 'short', price: currentClose });
                            inPosition = true;
                        }
                    } else {
                        // Exit after 6 candles or on reversal
                        const entryIndex = signals[signals.length - 1].index;
                        if (i - entryIndex >= 6) {
                            signals.push({ index: i, side: 'close', price: currentClose });
                            inPosition = false;
                        }
                    }
                }
                return signals;
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // BACKTEST ENGINE
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Run backtest for a strategy on an asset
     */
    async runBacktest(strategyId, symbol, options = {}) {
        const strategy = this.strategies[strategyId];
        if (!strategy) {
            console.error(`[Backtest] Strategy not found: ${strategyId}`);
            return null;
        }

        const days = options.days || 90;
        const leverage = options.leverage || 1;
        const slPercent = options.slPercent || 0.02;  // 2% stop loss
        const tpPercent = options.tpPercent || 0.04;  // 4% take profit

        console.log(`[Backtest] Running ${strategy.name} on ${symbol} (${days}d, ${leverage}x)...`);

        // Fetch data
        const candles = await this.fetchHistoricalData(symbol, '1h', days);
        if (candles.length < 100) {
            console.error(`[Backtest] Insufficient data for ${symbol}`);
            return null;
        }

        // Generate signals
        const signals = strategy.generate(candles, strategy.params);
        console.log(`[Backtest] Generated ${signals.length} signals`);

        // Simulate trades
        const trades = [];
        let capital = this.config.initialCapital;
        let position = null;
        let maxCapital = capital;
        let maxDrawdown = 0;

        for (let i = 0; i < signals.length; i++) {
            const signal = signals[i];
            const candle = candles[signal.index];

            if (signal.side === 'long' || signal.side === 'short') {
                // Open position
                if (position) continue; // Already in position

                const positionSize = capital * this.config.maxPositionSize;
                const entryPrice = signal.price * (1 + this.config.fees.slippage);
                const fees = positionSize * (this.config.fees.taker * 2); // Entry + exit

                position = {
                    side: signal.side,
                    entryPrice,
                    entryIndex: signal.index,
                    size: positionSize,
                    leverage,
                    fees,
                    sl: signal.side === 'long'
                        ? entryPrice * (1 - slPercent)
                        : entryPrice * (1 + slPercent),
                    tp: signal.side === 'long'
                        ? entryPrice * (1 + tpPercent)
                        : entryPrice * (1 - tpPercent)
                };
            } else if (signal.side === 'close' && position) {
                // Close position
                const exitPrice = signal.price * (1 - this.config.fees.slippage);
                const pnlPercent = position.side === 'long'
                    ? (exitPrice - position.entryPrice) / position.entryPrice
                    : (position.entryPrice - exitPrice) / position.entryPrice;

                const grossPnl = position.size * pnlPercent * leverage;
                const netPnl = grossPnl - position.fees;

                trades.push({
                    side: position.side,
                    entryPrice: position.entryPrice,
                    exitPrice,
                    entryIndex: position.entryIndex,
                    exitIndex: signal.index,
                    size: position.size,
                    leverage,
                    grossPnl,
                    fees: position.fees,
                    netPnl,
                    pnlPercent: pnlPercent * 100,
                    duration: signal.index - position.entryIndex
                });

                capital += netPnl;

                if (capital > maxCapital) maxCapital = capital;
                const dd = (maxCapital - capital) / maxCapital;
                if (dd > maxDrawdown) maxDrawdown = dd;

                position = null;
            }

            // Check SL/TP for open positions
            if (position) {
                for (let j = position.entryIndex + 1; j <= Math.min(signal.index, candles.length - 1); j++) {
                    const c = candles[j];

                    let exitPrice = null;
                    let exitReason = null;

                    if (position.side === 'long') {
                        if (c.low <= position.sl) {
                            exitPrice = position.sl;
                            exitReason = 'sl';
                        } else if (c.high >= position.tp) {
                            exitPrice = position.tp;
                            exitReason = 'tp';
                        }
                    } else {
                        if (c.high >= position.sl) {
                            exitPrice = position.sl;
                            exitReason = 'sl';
                        } else if (c.low <= position.tp) {
                            exitPrice = position.tp;
                            exitReason = 'tp';
                        }
                    }

                    if (exitPrice) {
                        const pnlPercent = position.side === 'long'
                            ? (exitPrice - position.entryPrice) / position.entryPrice
                            : (position.entryPrice - exitPrice) / position.entryPrice;

                        const grossPnl = position.size * pnlPercent * leverage;
                        const netPnl = grossPnl - position.fees;

                        trades.push({
                            side: position.side,
                            entryPrice: position.entryPrice,
                            exitPrice,
                            exitReason,
                            entryIndex: position.entryIndex,
                            exitIndex: j,
                            size: position.size,
                            leverage,
                            grossPnl,
                            fees: position.fees,
                            netPnl,
                            pnlPercent: pnlPercent * 100,
                            duration: j - position.entryIndex
                        });

                        capital += netPnl;

                        if (capital > maxCapital) maxCapital = capital;
                        const dd = (maxCapital - capital) / maxCapital;
                        if (dd > maxDrawdown) maxDrawdown = dd;

                        position = null;
                        break;
                    }
                }
            }
        }

        // Calculate statistics
        return this.calculateStats(trades, capital, maxDrawdown, candles, strategyId, symbol, leverage);
    },

    /**
     * Calculate backtest statistics
     */
    calculateStats(trades, finalCapital, maxDrawdown, candles, strategyId, symbol, leverage) {
        if (trades.length === 0) {
            return {
                strategyId,
                symbol,
                leverage,
                valid: false,
                reason: 'No trades'
            };
        }

        const wins = trades.filter(t => t.netPnl > 0);
        const losses = trades.filter(t => t.netPnl <= 0);

        const totalPnl = trades.reduce((s, t) => s + t.netPnl, 0);
        const totalFees = trades.reduce((s, t) => s + t.fees, 0);
        const grossProfit = wins.reduce((s, t) => s + t.netPnl, 0);
        const grossLoss = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));

        const winRate = wins.length / trades.length;
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
        const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
        const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
        const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);

        // Sharpe Ratio
        const returns = trades.map(t => t.pnlPercent);
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        const annualizedReturn = avgReturn * (365 * 24 / trades.length);
        const annualizedStd = stdDev * Math.sqrt(365 * 24 / trades.length);
        const sharpeRatio = annualizedStd > 0 ? (annualizedReturn - this.config.riskFreeRate) / annualizedStd : 0;

        // Sortino Ratio (only downside deviation)
        const negReturns = returns.filter(r => r < 0);
        const downsideVariance = negReturns.length > 0
            ? negReturns.reduce((s, r) => s + Math.pow(r, 2), 0) / negReturns.length
            : 0;
        const downsideStd = Math.sqrt(downsideVariance);
        const sortinoRatio = downsideStd > 0 ? avgReturn / downsideStd : avgReturn > 0 ? 999 : 0;

        // Return on Max Drawdown
        const romad = maxDrawdown > 0 ? (totalPnl / this.config.initialCapital) / maxDrawdown : 0;

        // Calculate trading period
        const firstTrade = candles[trades[0].entryIndex];
        const lastTrade = candles[trades[trades.length - 1].exitIndex];
        const tradingDays = (lastTrade.timestamp - firstTrade.timestamp) / (24 * 60 * 60 * 1000);

        const result = {
            strategyId,
            strategyName: this.strategies[strategyId].name,
            symbol,
            leverage,
            valid: true,

            // Performance
            totalTrades: trades.length,
            winningTrades: wins.length,
            losingTrades: losses.length,
            winRate: winRate * 100,

            // Returns
            initialCapital: this.config.initialCapital,
            finalCapital,
            totalPnl,
            totalFees,
            returnPercent: (totalPnl / this.config.initialCapital) * 100,
            annualizedReturn: (totalPnl / this.config.initialCapital) * (365 / tradingDays) * 100,

            // Risk metrics
            maxDrawdown: maxDrawdown * 100,
            profitFactor,
            sharpeRatio,
            sortinoRatio,
            romad,
            expectancy,

            // Trade stats
            avgWin,
            avgLoss,
            avgTrade: totalPnl / trades.length,
            largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.netPnl)) : 0,
            largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.netPnl)) : 0,
            avgDuration: trades.reduce((s, t) => s + t.duration, 0) / trades.length,

            // Period
            tradingDays,
            tradesPerDay: trades.length / tradingDays,

            // Raw trades for analysis
            trades
        };

        // Validation criteria
        result.isValidStrategy = this.validateStrategy(result);

        return result;
    },

    /**
     * Validate if strategy has edge
     */
    validateStrategy(stats) {
        const criteria = {
            minTrades: stats.totalTrades >= 20,
            minWinRate: stats.winRate >= 40,
            positivePnl: stats.totalPnl > 0,
            profitFactor: stats.profitFactor >= 1.2,
            sharpe: stats.sharpeRatio >= 0.5,
            maxDrawdown: stats.maxDrawdown <= 25,
            expectancy: stats.expectancy > 0
        };

        const passed = Object.values(criteria).filter(v => v).length;
        const total = Object.keys(criteria).length;

        return {
            passed,
            total,
            isValid: passed >= 5, // Pass at least 5/7 criteria
            criteria
        };
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // BATCH TESTING
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Test all strategies on multiple assets
     */
    async runFullBacktest(options = {}) {
        const assets = options.assets || ['BTC', 'ETH', 'SOL', 'ARB'];
        const days = options.days || 90;
        const leverages = options.leverages || [1, 2, 3];

        console.log(`[Backtest] Starting full backtest: ${Object.keys(this.strategies).length} strategies × ${assets.length} assets × ${leverages.length} leverages`);

        const results = [];

        for (const strategyId of Object.keys(this.strategies)) {
            for (const symbol of assets) {
                for (const leverage of leverages) {
                    const result = await this.runBacktest(strategyId, symbol, { days, leverage });
                    if (result && result.valid) {
                        results.push(result);
                    }

                    // Small delay to avoid rate limits
                    await new Promise(r => setTimeout(r, 100));
                }
            }
        }

        // Sort by Sharpe ratio
        results.sort((a, b) => b.sharpeRatio - a.sharpeRatio);

        // Filter valid strategies
        const validStrategies = results.filter(r => r.isValidStrategy?.isValid);

        console.log(`[Backtest] Completed. ${validStrategies.length}/${results.length} strategies are valid`);

        this.backtestResults = {
            timestamp: Date.now(),
            totalTests: results.length,
            validStrategies: validStrategies.length,
            results,
            validResults: validStrategies
        };

        // Save to localStorage
        this.saveResults();

        return this.backtestResults;
    },

    saveResults() {
        try {
            // Only save summary to avoid storage limits
            const summary = {
                timestamp: this.backtestResults.timestamp,
                validStrategies: this.backtestResults.validResults.map(r => ({
                    strategyId: r.strategyId,
                    strategyName: r.strategyName,
                    symbol: r.symbol,
                    leverage: r.leverage,
                    winRate: r.winRate,
                    returnPercent: r.returnPercent,
                    sharpeRatio: r.sharpeRatio,
                    profitFactor: r.profitFactor,
                    maxDrawdown: r.maxDrawdown,
                    totalTrades: r.totalTrades
                }))
            };
            localStorage.setItem('obelisk_backtest_results', JSON.stringify(summary));
        } catch (e) {
            console.error('[Backtest] Failed to save results:', e.message);
        }
    },

    loadResults() {
        try {
            const saved = localStorage.getItem('obelisk_backtest_results');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('[Backtest] Failed to load results:', e.message);
        }
        return null;
    },

    /**
     * Get validated strategies for trader creation
     */
    getValidatedStrategies() {
        const saved = this.loadResults();
        if (!saved) return [];

        return saved.validStrategies
            .filter(s => s.sharpeRatio >= 1 && s.profitFactor >= 1.5)
            .sort((a, b) => b.sharpeRatio - a.sharpeRatio);
    }
};

// Export
window.StrategyBacktester = StrategyBacktester;
console.log('[StrategyBacktester] Loaded - Run StrategyBacktester.runFullBacktest() to validate strategies');
