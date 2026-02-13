/**
 * OBELISK Micro Strats - Starter Investment Strategies
 * 10 micro-strategies backtested on real Binance data
 * Users can invest $1-5 on validated strategies
 */

const {
    BinanceDataProvider,
    RealisticBacktestEngine,
    STRATEGIES,
    VENUE_FEES
} = require('./backtest-engine');

// ============================================
// STRAT CATALOG
// ============================================
const STRAT_CATALOG = {
    'btc-sma': {
        id: 'btc-sma',
        name: 'BTC SMA Cross',
        description: 'Croisement SMA 10/30 sur Bitcoin. Signal classique et eprouve.',
        strategy: 'SMA_CROSSOVER',
        pair: 'BTC/USDC',
        tp: 4,
        sl: 2,
        venue: 'lighter',
        risk: 'Moyen',
        minCapital: 1,
        icon: 'B'
    },
    'sol-rsi': {
        id: 'sol-rsi',
        name: 'SOL RSI Swing',
        description: 'RSI elargi 35/65 sur Solana. Capture les swings plus tot.',
        strategy: 'RSI_REVERSAL',
        strategyParams: { oversold: 35, overbought: 65 },
        pair: 'SOL/USDC',
        tp: 3,
        sl: 1.5,
        venue: 'morpher',
        risk: 'Moyen',
        minCapital: 1,
        icon: 'S'
    },
    'eth-macd': {
        id: 'eth-macd',
        name: 'ETH MACD',
        description: 'MACD crossover sur Ethereum. Suit le momentum.',
        strategy: 'MACD_CROSSOVER',
        pair: 'ETH/USDC',
        tp: 3,
        sl: 1.5,
        venue: 'lighter',
        risk: 'Moyen',
        minCapital: 1,
        icon: 'E'
    },
    'btc-bb': {
        id: 'btc-bb',
        name: 'BTC Bollinger',
        description: 'Rebond sur bande inferieure Bollinger. Strategie defensive.',
        strategy: 'BOLLINGER_BOUNCE',
        pair: 'BTC/USDC',
        tp: 3,
        sl: 1.5,
        venue: 'morpher',
        risk: 'Bas',
        minCapital: 1,
        icon: 'B'
    },
    'sol-momentum': {
        id: 'sol-momentum',
        name: 'SOL Momentum',
        description: 'Momentum 20 periodes sur Solana. Suit les mouvements forts.',
        strategy: 'MOMENTUM',
        pair: 'SOL/USDC',
        tp: 4,
        sl: 2,
        venue: 'lighter',
        risk: 'Haut',
        minCapital: 1,
        icon: 'S'
    },
    'btc-dca': {
        id: 'btc-dca',
        name: 'BTC DCA Hebdo',
        description: 'Achat regulier de Bitcoin chaque semaine. Zero timing.',
        strategy: 'DCA',
        pair: 'BTC/USDC',
        tp: null,
        sl: null,
        venue: null,
        risk: 'Tres Bas',
        minCapital: 1,
        icon: 'B',
        isDCA: true
    },
    'eth-sma': {
        id: 'eth-sma',
        name: 'ETH SMA Cross',
        description: 'Croisement SMA 10/30 sur Ethereum.',
        strategy: 'SMA_CROSSOVER',
        pair: 'ETH/USDC',
        tp: 3,
        sl: 1.5,
        venue: 'lighter',
        risk: 'Moyen',
        minCapital: 1,
        icon: 'E'
    },
    'sol-bb': {
        id: 'sol-bb',
        name: 'SOL Bollinger',
        description: 'Rebond Bollinger sur Solana. Plus volatile, plus de gains.',
        strategy: 'BOLLINGER_BOUNCE',
        pair: 'SOL/USDC',
        tp: 4,
        sl: 2,
        venue: 'morpher',
        risk: 'Moyen',
        minCapital: 1,
        icon: 'S'
    },
    'arb-rsi': {
        id: 'arb-rsi',
        name: 'ARB RSI',
        description: 'RSI reversal sur Arbitrum. Altcoin a forte volatilite.',
        strategy: 'RSI_REVERSAL',
        pair: 'ARB/USDC',
        tp: 3,
        sl: 1.5,
        venue: 'lighter',
        risk: 'Haut',
        minCapital: 1,
        icon: 'A'
    },
    'multi-dca': {
        id: 'multi-dca',
        name: 'Multi DCA',
        description: 'DCA hebdo diversifie sur BTC + ETH + SOL.',
        strategy: 'DCA',
        pair: 'BTC/USDC',
        multiPairs: ['BTC/USDC', 'ETH/USDC', 'SOL/USDC'],
        tp: null,
        sl: null,
        venue: null,
        risk: 'Tres Bas',
        minCapital: 1,
        icon: 'M',
        isDCA: true,
        isMulti: true
    }
};

// ============================================
// MICRO STRATS CLASS
// ============================================
class MicroStrats {
    constructor() {
        this.catalog = STRAT_CATALOG;
        this.backtestResults = {};
        this.dataProvider = new BinanceDataProvider();
    }

    /**
     * Backtest a single strategy
     * @param {string} stratId
     * @param {number} days
     * @returns {Object} result with signal, score, metrics
     */
    async backtestStrat(stratId, days = 90) {
        const strat = this.catalog[stratId];
        if (!strat) throw new Error(`Strat not found: ${stratId}`);

        // Multi-DCA: backtest 3 pairs, weighted average
        if (strat.isMulti) {
            return await this._backtestMultiDCA(strat, days);
        }

        const data = await this.dataProvider.fetchCandles(strat.pair, '1h', days);
        if (data.length < 50) {
            return this._emptyResult(stratId, strat, 'Pas assez de donnees Binance');
        }

        const venue = strat.venue || 'gmx';
        const engine = new RealisticBacktestEngine({
            initialCapital: 1000,
            venue
        });

        let result;
        if (strat.isDCA) {
            // DCA: use .run() without TP/SL
            result = await engine.run(data, strat.strategy, strat.strategyParams || {});
        } else {
            // Standard: use .runWithTPSL()
            result = await engine.runWithTPSL(data, strat.strategy, strat.strategyParams || {}, {
                tpPercent: strat.tp,
                slPercent: strat.sl
            });
        }

        const metrics = result.metrics;
        const score = this._calcScore(metrics, strat);
        const signal = this._calcSignal(score, metrics);

        const output = {
            stratId,
            name: strat.name,
            description: strat.description,
            pair: strat.pair,
            venue: strat.venue,
            risk: strat.risk,
            tp: strat.tp,
            sl: strat.sl,
            signal: signal.level,
            score,
            pnl: metrics.totalReturn,
            winRate: metrics.winRate,
            profitFactor: metrics.profitFactor,
            maxDrawdown: metrics.maxDrawdown,
            trades: metrics.closedTrades,
            totalFees: metrics.totalFees,
            sharpe: metrics.sharpeRatio,
            alpha: metrics.alpha,
            checks: signal.checks,
            days,
            backtestDate: Date.now()
        };

        this.backtestResults[stratId] = output;
        return output;
    }

    /**
     * Multi-DCA: backtest on 3 pairs, weighted average
     */
    async _backtestMultiDCA(strat, days) {
        const pairs = strat.multiPairs;
        const results = [];

        for (const pair of pairs) {
            const data = await this.dataProvider.fetchCandles(pair, '1h', days);
            if (data.length < 50) continue;

            const engine = new RealisticBacktestEngine({ initialCapital: 1000, venue: 'gmx' });
            const result = await engine.run(data, 'DCA', {});
            results.push(result.metrics);
        }

        if (results.length === 0) {
            return this._emptyResult(strat.id, strat, 'Pas assez de donnees');
        }

        // Weighted average
        const avg = (key) => results.reduce((a, r) => a + (r[key] || 0), 0) / results.length;

        const metrics = {
            totalReturn: avg('totalReturn'),
            winRate: avg('winRate'),
            profitFactor: avg('profitFactor'),
            maxDrawdown: Math.max(...results.map(r => r.maxDrawdown || 0)),
            closedTrades: Math.round(avg('closedTrades')),
            totalFees: avg('totalFees'),
            sharpeRatio: avg('sharpeRatio'),
            alpha: avg('alpha')
        };

        const score = this._calcScore(metrics, strat);
        const signal = this._calcSignal(score, metrics);

        const output = {
            stratId: strat.id,
            name: strat.name,
            description: strat.description,
            pair: pairs.join('+'),
            venue: strat.venue,
            risk: strat.risk,
            tp: null,
            sl: null,
            signal: signal.level,
            score,
            pnl: metrics.totalReturn,
            winRate: metrics.winRate,
            profitFactor: metrics.profitFactor,
            maxDrawdown: metrics.maxDrawdown,
            trades: metrics.closedTrades,
            totalFees: metrics.totalFees,
            sharpe: metrics.sharpeRatio,
            alpha: metrics.alpha,
            checks: signal.checks,
            days,
            backtestDate: Date.now()
        };

        this.backtestResults[strat.id] = output;
        return output;
    }

    /**
     * Backtest all strategies
     * @param {number} days
     * @returns {Array} sorted by score
     */
    async backtestAll(days = 90) {
        const results = [];
        for (const stratId of Object.keys(this.catalog)) {
            try {
                const result = await this.backtestStrat(stratId, days);
                results.push(result);
                console.log(`[MICRO-STRATS] ${result.stratId.padEnd(16)} ${result.signal.padEnd(14)} Score:${result.score} PnL:${result.pnl.toFixed(1)}% PF:${result.profitFactor.toFixed(2)}`);
            } catch (err) {
                console.error(`[MICRO-STRATS] Error backtesting ${stratId}:`, err.message);
            }
        }
        results.sort((a, b) => b.score - a.score);
        return results;
    }

    /**
     * Get signal for a strategy (from cached backtest results)
     */
    getSignal(stratId) {
        const cached = this.backtestResults[stratId];
        if (!cached) {
            const strat = this.catalog[stratId];
            if (!strat) return null;
            return {
                stratId,
                name: strat.name,
                signal: 'NO_DATA',
                score: 0,
                reason: 'Backtest requis'
            };
        }
        return cached;
    }

    /**
     * Get all signals sorted by score
     */
    getAllSignals() {
        return Object.keys(this.catalog)
            .map(id => this.getSignal(id))
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Get only INVEST_READY strategies
     */
    getInvestReady() {
        return this.getAllSignals().filter(s => s.signal === 'INVEST_READY');
    }

    // ============================================
    // SCORING
    // ============================================

    /**
     * Calculate score on 100
     */
    _calcScore(metrics, strat) {
        let score = 0;

        const trades = metrics.closedTrades || 0;
        const pf = metrics.profitFactor || 0;
        const wr = metrics.winRate || 0;
        const dd = metrics.maxDrawdown || 0;
        const pnl = metrics.totalReturn || 0;

        // 1. Trades (20 pts)
        if (trades >= 30) score += 20;
        else if (trades >= 15) score += 10;

        // 2. Profit Factor (25 pts)
        if (pf >= 1.3) score += 25;
        else if (pf >= 1.1) score += 15;
        else if (pf >= 1.0) score += 5;

        // 3. Win Rate adjusted to TP/SL ratio (25 pts)
        const tpSl = (strat.tp && strat.sl) ? strat.tp / strat.sl : 1;
        const minWR = tpSl >= 2 ? 35 : 45;
        if (wr >= minWR + 10) score += 25;
        else if (wr >= minWR) score += 15;

        // 4. Max Drawdown (15 pts)
        if (dd < 5) score += 15;
        else if (dd < 10) score += 10;

        // 5. PnL (15 pts)
        if (pnl > 5) score += 15;
        else if (pnl > 0) score += 8;

        return score;
    }

    /**
     * Determine signal level and checks
     */
    _calcSignal(score, metrics) {
        const checks = [];
        const trades = metrics.closedTrades || 0;
        const pf = metrics.profitFactor || 0;
        const wr = metrics.winRate || 0;
        const dd = metrics.maxDrawdown || 0;
        const pnl = metrics.totalReturn || 0;

        // Build checks
        if (trades >= 30) checks.push(`${trades} trades (ok)`);
        else if (trades >= 15) checks.push(`${trades} trades (minimum)`);
        else checks.push(`${trades} trades (trop peu)`);

        if (pf >= 1.3) checks.push(`PF ${pf.toFixed(2)} (bon)`);
        else if (pf >= 1.1) checks.push(`PF ${pf.toFixed(2)} (acceptable)`);
        else if (pf >= 1.0) checks.push(`PF ${pf.toFixed(2)} (faible)`);
        else checks.push(`PF ${pf.toFixed(2)} (perdant)`);

        if (wr >= 50) checks.push(`WR ${wr.toFixed(1)}%`);
        else if (wr >= 40) checks.push(`WR ${wr.toFixed(1)}% (ok)`);
        else checks.push(`WR ${wr.toFixed(1)}% (bas)`);

        if (dd < 5) checks.push(`DD ${dd.toFixed(1)}% (faible)`);
        else if (dd < 10) checks.push(`DD ${dd.toFixed(1)}% (acceptable)`);
        else checks.push(`DD ${dd.toFixed(1)}% (eleve)`);

        if (pnl > 5) checks.push(`PnL +${pnl.toFixed(1)}%`);
        else if (pnl > 0) checks.push(`PnL +${pnl.toFixed(1)}% (faible)`);
        else checks.push(`PnL ${pnl.toFixed(1)}% (negatif)`);

        // Determine level
        let level;
        if (score >= 65 && trades >= 30 && pf >= 1.2 && pnl > 0) {
            level = 'INVEST_READY';
        } else if (score >= 35 && trades >= 15 && pf >= 1.0) {
            level = 'WATCH';
        } else {
            level = 'AVOID';
        }

        return { level, checks };
    }

    /**
     * Empty result for when data is insufficient
     */
    _emptyResult(stratId, strat, reason) {
        return {
            stratId,
            name: strat.name,
            description: strat.description,
            pair: strat.isMulti ? strat.multiPairs.join('+') : strat.pair,
            venue: strat.venue,
            risk: strat.risk,
            tp: strat.tp,
            sl: strat.sl,
            signal: 'AVOID',
            score: 0,
            pnl: 0,
            winRate: 0,
            profitFactor: 0,
            maxDrawdown: 0,
            trades: 0,
            totalFees: 0,
            sharpe: 0,
            alpha: 0,
            checks: [reason],
            days: 0,
            backtestDate: Date.now()
        };
    }
}

// Singleton
const microStrats = new MicroStrats();

module.exports = { MicroStrats, microStrats };
