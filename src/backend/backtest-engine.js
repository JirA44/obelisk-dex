/**
 * OBELISK Backtest Engine
 * Système de backtesting pour stratégies de trading
 *
 * Features:
 * - Données historiques simulées réalistes
 * - Multiple stratégies prédéfinies
 * - Stratégies personnalisées
 * - Métriques de performance complètes
 * - Comparaison multi-stratégies
 */

// Génération de données historiques réalistes
class HistoricalDataGenerator {
    constructor(pair, days = 365) {
        this.pair = pair;
        this.days = days;
        this.data = [];

        // Prix de base par paire
        this.basePrices = {
            'BTC/USDC': 45000,
            'ETH/USDC': 2500,
            'SOL/USDC': 100,
            'ARB/USDC': 1.20,
            'XRP/USDC': 0.60,
            'ADA/USDC': 0.45,
            'AVAX/USDC': 35,
            'LINK/USDC': 15,
            'UNI/USDC': 8,
            'OP/USDC': 2,
            'INJ/USDC': 20,
            'SUI/USDC': 1.50
        };

        // Volatilité par paire
        this.volatility = {
            'BTC/USDC': 0.03,
            'ETH/USDC': 0.04,
            'SOL/USDC': 0.06,
            'ARB/USDC': 0.08,
            'XRP/USDC': 0.05,
            'ADA/USDC': 0.05,
            'AVAX/USDC': 0.06,
            'LINK/USDC': 0.05,
            'UNI/USDC': 0.06,
            'OP/USDC': 0.07,
            'INJ/USDC': 0.08,
            'SUI/USDC': 0.09
        };
    }

    generate() {
        const basePrice = this.basePrices[this.pair] || 100;
        const vol = this.volatility[this.pair] || 0.05;

        let price = basePrice;
        const now = Date.now();
        const msPerDay = 24 * 60 * 60 * 1000;
        const msPerCandle = 60 * 60 * 1000; // 1h candles

        // Trend général (bull/bear/sideways)
        const trendPhases = this.generateTrendPhases();

        for (let d = this.days; d >= 0; d--) {
            for (let h = 0; h < 24; h++) {
                const timestamp = now - (d * msPerDay) - ((23 - h) * msPerCandle);
                const dayIndex = this.days - d;

                // Trouver la phase de tendance actuelle
                const trend = this.getTrendAtDay(trendPhases, dayIndex);

                // Mouvement de prix avec tendance
                const randomWalk = (Math.random() - 0.5) * 2 * vol;
                const trendEffect = trend * 0.001;
                const change = randomWalk + trendEffect;

                const open = price;
                price *= (1 + change);

                // Génération OHLCV réaliste
                const high = Math.max(open, price) * (1 + Math.random() * vol * 0.5);
                const low = Math.min(open, price) * (1 - Math.random() * vol * 0.5);
                const close = price;
                const volume = basePrice * 1000000 * (0.5 + Math.random());

                this.data.push({
                    timestamp,
                    date: new Date(timestamp).toISOString(),
                    open: Number(open.toFixed(6)),
                    high: Number(high.toFixed(6)),
                    low: Number(low.toFixed(6)),
                    close: Number(close.toFixed(6)),
                    volume: Number(volume.toFixed(2))
                });
            }
        }

        return this.data;
    }

    generateTrendPhases() {
        const phases = [];
        let currentDay = 0;

        while (currentDay < this.days) {
            const duration = 20 + Math.floor(Math.random() * 60); // 20-80 jours
            const trend = (Math.random() - 0.5) * 2; // -1 to 1
            phases.push({ start: currentDay, end: currentDay + duration, trend });
            currentDay += duration;
        }

        return phases;
    }

    getTrendAtDay(phases, day) {
        for (const phase of phases) {
            if (day >= phase.start && day < phase.end) {
                return phase.trend;
            }
        }
        return 0;
    }
}

// Indicateurs techniques
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
            if (i === 0) {
                result.push(50);
                continue;
            }

            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);

            if (i < period) {
                result.push(50);
            } else {
                const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
                const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                result.push(rsi);
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
            if (i === 0) {
                signalLine.push(macdLine[i]);
            } else {
                signalLine.push((macdLine[i] - signalLine[i - 1]) * multiplier + signalLine[i - 1]);
            }
        }

        const histogram = macdLine.map((m, i) => m - signalLine[i]);

        return { macdLine, signalLine, histogram };
    }

    static BollingerBands(data, period = 20, stdDev = 2) {
        const sma = this.SMA(data, period);
        const upper = [];
        const lower = [];

        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                upper.push(null);
                lower.push(null);
            } else {
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

// Stratégies de trading prédéfinies
const STRATEGIES = {
    // Croisement de moyennes mobiles
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

    // RSI Overbought/Oversold
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

    // MACD Crossover
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

    // Bollinger Bands Bounce
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

    // Momentum Strategy
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

    // DCA (Dollar Cost Averaging)
    DCA: {
        name: 'Dollar Cost Averaging',
        description: 'Buy fixed amount at regular intervals',
        params: { intervalHours: 24 * 7 }, // Weekly
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

    // Buy and Hold
    BUY_AND_HOLD: {
        name: 'Buy and Hold',
        description: 'Buy at start, hold until end',
        params: {},
        execute: (data, params) => {
            return [
                { index: 0, type: 'BUY', price: data[0].close, reason: 'Initial Buy' }
            ];
        }
    }
};

// Moteur de backtest
class BacktestEngine {
    constructor(config = {}) {
        this.initialCapital = config.initialCapital || 10000;
        this.tradingFee = config.tradingFee || 0.001; // 0.1%
        this.slippage = config.slippage || 0.0005; // 0.05%
    }

    run(data, strategy, params = {}) {
        const strategyConfig = typeof strategy === 'string' ? STRATEGIES[strategy] : strategy;
        if (!strategyConfig) {
            throw new Error(`Strategy not found: ${strategy}`);
        }

        const mergedParams = { ...strategyConfig.params, ...params };
        const signals = strategyConfig.execute(data, mergedParams);

        // Simulation du trading
        let capital = this.initialCapital;
        let position = 0;
        let entryPrice = 0;
        const trades = [];
        const equityCurve = [{ timestamp: data[0].timestamp, equity: capital }];

        for (const signal of signals) {
            const price = signal.price * (1 + (signal.type === 'BUY' ? this.slippage : -this.slippage));
            const fee = price * this.tradingFee;

            if (signal.type === 'BUY' && position === 0) {
                // Acheter avec tout le capital
                position = (capital - fee) / price;
                entryPrice = price;
                capital = 0;

                trades.push({
                    type: 'BUY',
                    timestamp: data[signal.index].timestamp,
                    date: data[signal.index].date,
                    price,
                    quantity: position,
                    fee,
                    reason: signal.reason
                });
            } else if (signal.type === 'SELL' && position > 0) {
                // Vendre toute la position
                const proceeds = position * price - fee;
                const pnl = proceeds - (position * entryPrice);
                const pnlPercent = (pnl / (position * entryPrice)) * 100;

                trades.push({
                    type: 'SELL',
                    timestamp: data[signal.index].timestamp,
                    date: data[signal.index].date,
                    price,
                    quantity: position,
                    fee,
                    pnl,
                    pnlPercent,
                    reason: signal.reason
                });

                capital = proceeds;
                position = 0;
            }

            // Equity curve
            const equity = position > 0 ? position * data[signal.index].close : capital;
            equityCurve.push({ timestamp: data[signal.index].timestamp, equity });
        }

        // Valeur finale
        const finalPrice = data[data.length - 1].close;
        const finalEquity = position > 0 ? position * finalPrice : capital;

        // Calcul des métriques
        const metrics = this.calculateMetrics(trades, equityCurve, data, finalEquity);

        return {
            strategy: strategyConfig.name,
            params: mergedParams,
            initialCapital: this.initialCapital,
            finalEquity,
            trades,
            metrics,
            equityCurve
        };
    }

    calculateMetrics(trades, equityCurve, data, finalEquity) {
        const totalReturn = ((finalEquity - this.initialCapital) / this.initialCapital) * 100;

        // Trades gagnants/perdants
        const sellTrades = trades.filter(t => t.type === 'SELL');
        const winningTrades = sellTrades.filter(t => t.pnl > 0);
        const losingTrades = sellTrades.filter(t => t.pnl <= 0);

        const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;

        const avgWin = winningTrades.length > 0
            ? winningTrades.reduce((a, t) => a + t.pnlPercent, 0) / winningTrades.length
            : 0;
        const avgLoss = losingTrades.length > 0
            ? losingTrades.reduce((a, t) => a + t.pnlPercent, 0) / losingTrades.length
            : 0;

        // Profit Factor
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

        // Sharpe Ratio (simplifié)
        const returns = [];
        for (let i = 1; i < equityCurve.length; i++) {
            returns.push((equityCurve[i].equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity);
        }
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const stdReturn = Math.sqrt(returns.reduce((a, r) => a + Math.pow(r - avgReturn, 2), 0) / returns.length);
        const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(365 * 24) : 0;

        // Buy & Hold comparison
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

    // Comparer plusieurs stratégies
    compareStrategies(data, strategies) {
        const results = [];

        for (const [name, params] of Object.entries(strategies)) {
            try {
                const result = this.run(data, name, params);
                results.push(result);
            } catch (e) {
                console.error(`Error running ${name}:`, e.message);
            }
        }

        // Trier par return total
        results.sort((a, b) => b.metrics.totalReturn - a.metrics.totalReturn);

        return results;
    }
}

// Gestionnaire de backtests par utilisateur
class UserBacktestManager {
    constructor() {
        this.userBacktests = new Map();
    }

    createBacktest(userId, config) {
        const backtestId = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        const { pair, days, strategy, params, initialCapital } = config;

        // Générer les données historiques
        const generator = new HistoricalDataGenerator(pair, days);
        const data = generator.generate();

        // Exécuter le backtest
        const engine = new BacktestEngine({ initialCapital });
        const result = engine.run(data, strategy, params);

        // Sauvegarder
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

    compareUserStrategies(userId, pair, days, initialCapital) {
        const generator = new HistoricalDataGenerator(pair, days);
        const data = generator.generate();

        const engine = new BacktestEngine({ initialCapital });
        const results = engine.compareStrategies(data, {
            SMA_CROSSOVER: {},
            RSI_REVERSAL: {},
            MACD_CROSSOVER: {},
            BOLLINGER_BOUNCE: {},
            MOMENTUM: {},
            DCA: {},
            BUY_AND_HOLD: {}
        });

        return {
            pair,
            days,
            initialCapital,
            comparison: results.map(r => ({
                strategy: r.strategy,
                totalReturn: r.metrics.totalReturn,
                winRate: r.metrics.winRate,
                maxDrawdown: r.metrics.maxDrawdown,
                sharpeRatio: r.metrics.sharpeRatio,
                trades: r.metrics.totalTrades,
                alpha: r.metrics.alpha
            }))
        };
    }
}

module.exports = {
    HistoricalDataGenerator,
    TechnicalIndicators,
    BacktestEngine,
    UserBacktestManager,
    STRATEGIES
};
