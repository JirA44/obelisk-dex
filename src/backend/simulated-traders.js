/**
 * OBELISK Trading Academy V1.0
 * Simulated traders for education and learning
 *
 * Features:
 * - 5 virtual traders with unique styles
 * - Real-time trade generation with explanations
 * - Performance tracking and leaderboard
 * - Quiz mode to test your skills
 * - Copy trading in simulation
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const ACADEMY_FILE = path.join(DATA_DIR, 'academy_state.json');

// ============================================
// TRADER PROFILES
// ============================================
const TRADER_PROFILES = {
    marcus: {
        id: 'marcus',
        name: 'Marcus',
        avatar: 'M',
        style: 'Scalper Agressif',
        description: 'Trades rapides sur timeframes courts. Vise des gains petits mais frequents.',
        timeframes: ['1m', '5m'],
        riskPerTrade: 2, // % of capital
        targetRR: 2.5, // Risk:Reward
        winRate: 0.45, // Historical
        avgHoldTime: '2-10 min',
        personality: 'Rapide, confiant, parfois impulsif',
        indicators: ['RSI', 'Bollinger Bands', 'Volume'],
        strategies: ['RSI_Oversold_Bounce', 'BB_Squeeze_Breakout', 'Volume_Spike'],
        quotes: [
            "Le marche ne dort jamais, moi non plus.",
            "Petit profit vaut mieux que grosse perte.",
            "Je coupe vite mes pertes, toujours."
        ],
        tradingHours: { start: 8, end: 22 }, // Active hours
        avgTradesPerDay: 15
    },

    elena: {
        id: 'elena',
        name: 'Elena',
        avatar: 'E',
        style: 'Swing Trader Patiente',
        description: 'Attend les setups parfaits. Trades sur plusieurs jours.',
        timeframes: ['4h', '1d'],
        riskPerTrade: 1.5,
        targetRR: 1.5,
        winRate: 0.62,
        avgHoldTime: '2-7 jours',
        personality: 'Methodique, patiente, disciplinee',
        indicators: ['Ichimoku', 'Support/Resistance', 'MACD'],
        strategies: ['Ichimoku_Cloud_Break', 'SR_Bounce', 'MACD_Divergence'],
        quotes: [
            "La patience est la cle du succes en trading.",
            "Je ne chasse pas le marche, je l'attends.",
            "Un bon setup par semaine suffit."
        ],
        tradingHours: { start: 9, end: 18 },
        avgTradesPerDay: 0.5 // ~3-4 per week
    },

    yuki: {
        id: 'yuki',
        name: 'Yuki',
        avatar: 'Y',
        style: 'Trend Follower',
        description: 'Suit les tendances etablies. Ne trade jamais contre le trend.',
        timeframes: ['1h', '4h'],
        riskPerTrade: 1,
        targetRR: 2,
        winRate: 0.55,
        avgHoldTime: '4h - 2 jours',
        personality: 'Disciplinee, analytique, calme',
        indicators: ['EMA 20/50/200', 'ADX', 'MACD'],
        strategies: ['EMA_Cross', 'ADX_Trend_Strength', 'MACD_Momentum'],
        quotes: [
            "The trend is your friend.",
            "Je n'ai pas d'opinion, je suis le marche.",
            "ADX > 25, je suis en mode chasse."
        ],
        tradingHours: { start: 6, end: 20 },
        avgTradesPerDay: 3
    },

    alex: {
        id: 'alex',
        name: 'Alex',
        avatar: 'A',
        style: 'Contre-Tendance',
        description: 'Cherche les retournements. Trade contre le consensus.',
        timeframes: ['15m', '1h'],
        riskPerTrade: 0.5, // Lower risk due to style
        targetRR: 4, // High reward to compensate low WR
        winRate: 0.38,
        avgHoldTime: '30min - 4h',
        personality: 'Contrarian, audacieux, analytique',
        indicators: ['RSI Divergence', 'Fibonacci', 'Volume Profile'],
        strategies: ['RSI_Divergence', 'Fib_Retracement', 'Exhaustion_Volume'],
        quotes: [
            "Quand tout le monde achete, je vends.",
            "Les extremes sont mes amis.",
            "La divergence ne ment jamais."
        ],
        tradingHours: { start: 10, end: 22 },
        avgTradesPerDay: 5
    },

    sofia: {
        id: 'sofia',
        name: 'Sofia',
        avatar: 'S',
        style: 'News & Events',
        description: 'Trade les evenements majeurs et les news crypto.',
        timeframes: ['5m', '15m'],
        riskPerTrade: 1.5,
        targetRR: 2,
        winRate: 0.52,
        avgHoldTime: '10min - 2h',
        personality: 'Reactive, informee, opportuniste',
        indicators: ['Volume', 'Sentiment', 'Order Flow'],
        strategies: ['News_Breakout', 'Sentiment_Shift', 'Whale_Follow'],
        quotes: [
            "L'info, c'est le pouvoir.",
            "Les whales laissent toujours des traces.",
            "Avant la news: prepare. Apres: execute."
        ],
        tradingHours: { start: 0, end: 24 }, // Always watching
        avgTradesPerDay: 4
    }
};

// ============================================
// MARKET CONDITIONS FOR SIGNAL GENERATION
// ============================================
const MARKET_CONDITIONS = ['trending_up', 'trending_down', 'ranging', 'volatile', 'quiet'];

// ============================================
// SIGNAL EXPLANATIONS TEMPLATES
// ============================================
const EXPLANATIONS = {
    marcus: {
        entry: [
            "RSI vient de toucher {rsi} - zone de survente. Volume en hausse de {vol}%.",
            "BB squeeze detecte, breakout imminent. Je rentre avec SL serre.",
            "Spike de volume {vol}% sur {symbol}. Scalp rapide en vue."
        ],
        exit: [
            "Target atteint +{pnl}%. Je prends mes profits.",
            "SL touche a -{sl}%. Next trade.",
            "Momentum faiblit, je sors en profit partiel."
        ]
    },
    elena: {
        entry: [
            "Prix au-dessus du cloud Ichimoku, Tenkan/Kijun bullish. Setup valide.",
            "Support majeur {price} teste 3 fois. Probabilite de rebond elevee.",
            "Divergence MACD sur H4 + volume croissant. J'entre."
        ],
        exit: [
            "Target atteint apres {days} jours. +{pnl}% comme prevu.",
            "Le setup s'est invalide. Je coupe ma position.",
            "Profit protege avec trailing stop."
        ]
    },
    yuki: {
        entry: [
            "EMA 20 croise EMA 50 a la hausse. ADX a {adx}. Trend confirme.",
            "Prix rebondit sur EMA 200. Continuation haussiere.",
            "MACD cross bullish avec histogramme croissant. Long."
        ],
        exit: [
            "EMA 20 casse a la baisse. Je sors.",
            "ADX redescend sous 20. Plus de trend.",
            "Target {rr}R atteint. Discipline."
        ]
    },
    alex: {
        entry: [
            "RSI divergence baissiere sur {symbol} alors que prix fait nouveau high.",
            "Retracement Fibo 61.8% + reaction. Short contre-tendance.",
            "Volume d'epuisement detecte. Le mouvement est termine."
        ],
        exit: [
            "Retournement confirme. +{pnl}% sur ce contre-trade.",
            "Faux signal, SL touche. Ca arrive.",
            "Profit pris au 38.2% Fibo."
        ]
    },
    sofia: {
        entry: [
            "Annonce {news} imminente. Position pre-news avec SL serre.",
            "Sentiment Twitter vire bullish. Volume on-chain en hausse.",
            "Whale vient d'accumuler {amount} {symbol}. Je suis."
        ],
        exit: [
            "News passee, volatilite absorbee. Exit.",
            "Objectif atteint avant annonce. Parfait timing.",
            "Sentiment retourne. Je coupe."
        ]
    }
};

// ============================================
// SIMULATED TRADERS CLASS
// ============================================
class SimulatedTraders {
    constructor() {
        this.traders = { ...TRADER_PROFILES };
        this.trades = {}; // Trades by trader
        this.openPositions = {}; // Current positions
        this.leaderboard = [];
        this.quizzes = [];
        this.followers = {}; // Copy traders
        this.priceCache = {}; // Current prices

        // Initialize each trader's stats
        Object.keys(this.traders).forEach(id => {
            this.trades[id] = [];
            this.openPositions[id] = null;
            this.traders[id].stats = {
                totalTrades: 0,
                wins: 0,
                losses: 0,
                totalPnl: 0,
                bestTrade: 0,
                worstTrade: 0,
                currentStreak: 0,
                maxStreak: 0
            };
        });
    }

    /**
     * Initialize and load state
     */
    async init(priceProvider) {
        this.priceProvider = priceProvider;
        await this.loadState();
        this.startTrading();
        console.log('[ACADEMY] Simulated Traders initialized');
        return this;
    }

    /**
     * Load persisted state
     */
    async loadState() {
        try {
            if (fs.existsSync(ACADEMY_FILE)) {
                const data = JSON.parse(fs.readFileSync(ACADEMY_FILE, 'utf8'));
                if (data.trades) this.trades = data.trades;
                if (data.traders) {
                    Object.keys(data.traders).forEach(id => {
                        if (this.traders[id]) {
                            this.traders[id].stats = data.traders[id].stats || this.traders[id].stats;
                            // V63.95: Load backtest results
                            if (data.traders[id].backtestResults) {
                                this.traders[id].backtestResults = data.traders[id].backtestResults;
                            }
                        }
                    });
                }
                if (data.leaderboard) this.leaderboard = data.leaderboard;
                if (data.backtestResults) this.backtestResults = data.backtestResults;
                console.log('[ACADEMY] State loaded from disk');
            }
        } catch (err) {
            console.error('[ACADEMY] Load state error:', err.message);
        }
    }

    /**
     * Save state
     */
    saveState() {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }

            const data = {
                traders: {},
                trades: this.trades,
                leaderboard: this.leaderboard,
                backtestResults: this.backtestResults,
                timestamp: Date.now()
            };

            Object.keys(this.traders).forEach(id => {
                data.traders[id] = {
                    stats: this.traders[id].stats,
                    // V63.95: Persist backtest results
                    backtestResults: this.traders[id].backtestResults
                };
            });

            fs.writeFileSync(ACADEMY_FILE, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error('[ACADEMY] Save state error:', err.message);
        }
    }

    /**
     * Start automated trading simulation
     */
    startTrading() {
        // Check for trades every minute
        this.tradingInterval = setInterval(() => {
            this.checkForTrades();
        }, 60000);

        // Update leaderboard every 5 minutes
        this.leaderboardInterval = setInterval(() => {
            this.updateLeaderboard();
        }, 300000);

        // Initial check
        setTimeout(() => this.checkForTrades(), 5000);
    }

    /**
     * Check if traders should make moves
     */
    async checkForTrades() {
        const hour = new Date().getHours();

        for (const traderId of Object.keys(this.traders)) {
            const trader = this.traders[traderId];

            // Check if trader is active at this hour
            if (hour < trader.tradingHours.start || hour > trader.tradingHours.end) {
                continue;
            }

            // Check open positions first
            if (this.openPositions[traderId]) {
                await this.checkExitConditions(traderId);
                continue;
            }

            // Probability of new trade based on avg trades per day
            const tradeProb = trader.avgTradesPerDay / (24 * 60); // Per minute
            if (Math.random() < tradeProb) {
                await this.generateTrade(traderId);
            }
        }
    }

    /**
     * Generate a new trade for a trader
     */
    async generateTrade(traderId) {
        const trader = this.traders[traderId];
        const symbols = ['BTC', 'ETH', 'SOL', 'ARB', 'OP', 'SUI', 'AVAX', 'LINK'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];

        // Get current price
        const price = await this.getPrice(symbol);
        if (!price) return;

        // Determine direction based on trader style and market
        const direction = this.determineDirection(traderId, symbol);

        // Calculate position size and targets
        const riskAmount = 1000 * (trader.riskPerTrade / 100); // Assume $1000 capital
        const slPercent = direction === 'LONG' ? 0.8 : 0.8;
        const tpPercent = slPercent * trader.targetRR;

        const trade = {
            id: `${traderId}-${Date.now()}`,
            traderId,
            symbol,
            direction,
            entryPrice: price,
            size: riskAmount / (price * slPercent / 100),
            sl: direction === 'LONG' ? price * (1 - slPercent / 100) : price * (1 + slPercent / 100),
            tp: direction === 'LONG' ? price * (1 + tpPercent / 100) : price * (1 - tpPercent / 100),
            status: 'open',
            openedAt: Date.now(),
            explanation: this.generateExplanation(traderId, 'entry', { symbol, price, rsi: Math.floor(Math.random() * 30 + 20), vol: Math.floor(Math.random() * 50 + 10) })
        };

        this.openPositions[traderId] = trade;
        this.trades[traderId].push(trade);

        // Emit event for WebSocket
        this.emitTrade(trade);
        this.saveState();
    }

    /**
     * Determine trade direction based on trader style
     */
    determineDirection(traderId, symbol) {
        const trader = this.traders[traderId];

        // Simplified direction logic based on style
        if (traderId === 'alex') {
            // Contrarian - random opposite
            return Math.random() > 0.5 ? 'SHORT' : 'LONG';
        } else {
            // Others - trend following with bias
            return Math.random() > 0.4 ? 'LONG' : 'SHORT';
        }
    }

    /**
     * Check if open position should be closed
     */
    async checkExitConditions(traderId) {
        const position = this.openPositions[traderId];
        if (!position) return;

        const currentPrice = await this.getPrice(position.symbol);
        if (!currentPrice) return;

        const trader = this.traders[traderId];
        let shouldClose = false;
        let closeReason = '';
        let pnlPercent = 0;

        if (position.direction === 'LONG') {
            pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

            if (currentPrice >= position.tp) {
                shouldClose = true;
                closeReason = 'TP hit';
            } else if (currentPrice <= position.sl) {
                shouldClose = true;
                closeReason = 'SL hit';
            }
        } else {
            pnlPercent = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;

            if (currentPrice <= position.tp) {
                shouldClose = true;
                closeReason = 'TP hit';
            } else if (currentPrice >= position.sl) {
                shouldClose = true;
                closeReason = 'SL hit';
            }
        }

        // Time-based exit (avg hold time exceeded)
        const holdTime = Date.now() - position.openedAt;
        const maxHoldMs = this.parseHoldTime(trader.avgHoldTime) * 2;
        if (holdTime > maxHoldMs && Math.random() > 0.7) {
            shouldClose = true;
            closeReason = 'Time exit';
        }

        // Random early exit with profit
        if (pnlPercent > 0.3 && Math.random() < 0.1) {
            shouldClose = true;
            closeReason = 'Early profit';
        }

        if (shouldClose) {
            await this.closeTrade(traderId, currentPrice, closeReason, pnlPercent);
        }
    }

    /**
     * Close a trade
     */
    async closeTrade(traderId, exitPrice, reason, pnlPercent) {
        const position = this.openPositions[traderId];
        if (!position) return;

        const trader = this.traders[traderId];
        const isWin = pnlPercent > 0;

        // Update position
        position.status = 'closed';
        position.exitPrice = exitPrice;
        position.closedAt = Date.now();
        position.pnlPercent = pnlPercent;
        position.pnlUsd = position.size * exitPrice * pnlPercent / 100;
        position.closeReason = reason;
        position.exitExplanation = this.generateExplanation(traderId, 'exit', {
            pnl: Math.abs(pnlPercent).toFixed(2),
            sl: '0.8',
            days: Math.floor((position.closedAt - position.openedAt) / 86400000) || 1,
            rr: trader.targetRR
        });

        // Update stats
        trader.stats.totalTrades++;
        if (isWin) {
            trader.stats.wins++;
            trader.stats.currentStreak = Math.max(0, trader.stats.currentStreak) + 1;
        } else {
            trader.stats.losses++;
            trader.stats.currentStreak = Math.min(0, trader.stats.currentStreak) - 1;
        }
        trader.stats.totalPnl += position.pnlUsd;
        trader.stats.bestTrade = Math.max(trader.stats.bestTrade, position.pnlUsd);
        trader.stats.worstTrade = Math.min(trader.stats.worstTrade, position.pnlUsd);
        trader.stats.maxStreak = Math.max(trader.stats.maxStreak, Math.abs(trader.stats.currentStreak));

        // Clear position
        this.openPositions[traderId] = null;

        // Emit event
        this.emitTrade({ ...position, type: 'close' });
        this.saveState();
    }

    /**
     * Generate human-like explanation
     */
    generateExplanation(traderId, type, params) {
        const templates = EXPLANATIONS[traderId]?.[type] || [];
        if (templates.length === 0) return 'Trade execute.';

        let explanation = templates[Math.floor(Math.random() * templates.length)];

        // Replace placeholders
        Object.entries(params).forEach(([key, value]) => {
            explanation = explanation.replace(`{${key}}`, value);
        });

        return explanation;
    }

    /**
     * Get current price
     */
    async getPrice(symbol) {
        if (this.priceProvider) {
            try {
                const price = await this.priceProvider(symbol);
                if (price) {
                    this.priceCache[symbol] = { price, time: Date.now() };
                    return price;
                }
            } catch (e) {}
        }

        // Fallback to cached or simulated
        if (this.priceCache[symbol] && Date.now() - this.priceCache[symbol].time < 60000) {
            return this.priceCache[symbol].price;
        }

        // Simulated prices
        const basePrices = {
            BTC: 105000, ETH: 3400, SOL: 185, ARB: 0.85,
            OP: 2.1, SUI: 4.5, AVAX: 35, LINK: 22
        };
        return basePrices[symbol] || 100;
    }

    /**
     * Parse hold time string to milliseconds
     */
    parseHoldTime(holdTime) {
        if (holdTime.includes('jour')) {
            const days = parseInt(holdTime) || 1;
            return days * 24 * 60 * 60 * 1000;
        } else if (holdTime.includes('h')) {
            const hours = parseInt(holdTime) || 1;
            return hours * 60 * 60 * 1000;
        } else if (holdTime.includes('min')) {
            const mins = parseInt(holdTime) || 10;
            return mins * 60 * 1000;
        }
        return 60 * 60 * 1000; // Default 1h
    }

    /**
     * Emit trade event (for WebSocket)
     */
    emitTrade(trade) {
        if (this.onTrade) {
            this.onTrade(trade);
        }
    }

    /**
     * Update leaderboard
     */
    updateLeaderboard() {
        this.leaderboard = Object.keys(this.traders)
            .map(id => ({
                id,
                name: this.traders[id].name,
                style: this.traders[id].style,
                totalPnl: this.traders[id].stats.totalPnl,
                winRate: this.traders[id].stats.totalTrades > 0
                    ? (this.traders[id].stats.wins / this.traders[id].stats.totalTrades * 100).toFixed(1)
                    : 0,
                totalTrades: this.traders[id].stats.totalTrades,
                streak: this.traders[id].stats.currentStreak
            }))
            .sort((a, b) => b.totalPnl - a.totalPnl);

        this.saveState();
    }

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Get all traders
     */
    getTraders() {
        return Object.values(this.traders).map(t => ({
            id: t.id,
            name: t.name,
            avatar: t.avatar,
            style: t.style,
            description: t.description,
            indicators: t.indicators,
            winRate: t.winRate,
            targetRR: t.targetRR,
            avgHoldTime: t.avgHoldTime,
            personality: t.personality,
            stats: t.stats,
            hasOpenPosition: !!this.openPositions[t.id]
        }));
    }

    /**
     * Get specific trader details
     */
    getTrader(traderId) {
        const trader = this.traders[traderId];
        if (!trader) return null;

        return {
            ...trader,
            recentTrades: this.trades[traderId]?.slice(-20) || [],
            openPosition: this.openPositions[traderId]
        };
    }

    /**
     * Get live feed of recent trades
     */
    getLiveFeed(limit = 20) {
        const allTrades = [];
        Object.entries(this.trades).forEach(([traderId, trades]) => {
            trades.forEach(t => {
                allTrades.push({
                    ...t,
                    traderName: this.traders[traderId]?.name
                });
            });
        });

        return allTrades
            .sort((a, b) => (b.closedAt || b.openedAt) - (a.closedAt || a.openedAt))
            .slice(0, limit);
    }

    /**
     * Get leaderboard
     */
    getLeaderboard() {
        this.updateLeaderboard();
        return this.leaderboard;
    }

    /**
     * Generate a quiz question
     */
    generateQuiz() {
        const traders = Object.values(this.traders);
        const trader = traders[Math.floor(Math.random() * traders.length)];
        const symbols = ['BTC', 'ETH', 'SOL'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];

        // Generate market scenario
        const scenarios = [
            { condition: 'RSI a 25, prix sur support majeur', correctFor: ['marcus', 'elena'] },
            { condition: 'EMA 20 croise EMA 50 a la hausse, ADX a 35', correctFor: ['yuki'] },
            { condition: 'Nouveau high avec RSI en divergence', correctFor: ['alex'] },
            { condition: 'Annonce Fed dans 1h, volatilite implicite en hausse', correctFor: ['sofia'] },
            { condition: 'Prix en range depuis 3 jours, BB squeeze', correctFor: ['marcus'] }
        ];

        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        return {
            id: `quiz-${Date.now()}`,
            question: `${symbol}/USDC - ${scenario.condition}. Que ferait ${trader.name} (${trader.style})?`,
            options: [
                { id: 'long', text: 'LONG - Acheter' },
                { id: 'short', text: 'SHORT - Vendre' },
                { id: 'wait', text: 'ATTENDRE - Pas de setup' }
            ],
            correctAnswer: scenario.correctFor.includes(trader.id) ? 'long' : 'wait',
            explanation: `${trader.name} utilise ${trader.indicators.join(', ')}. ${scenario.correctFor.includes(trader.id) ? 'Ce setup correspond a son style.' : 'Ce setup ne correspond pas a ses criteres.'}`,
            trader: trader.id
        };
    }

    /**
     * Follow a trader (copy trading simulation)
     */
    followTrader(userId, traderId) {
        if (!this.traders[traderId]) {
            return { success: false, error: 'Trader not found' };
        }

        if (!this.followers[userId]) {
            this.followers[userId] = [];
        }

        if (!this.followers[userId].includes(traderId)) {
            this.followers[userId].push(traderId);
        }

        return {
            success: true,
            message: `Now following ${this.traders[traderId].name}`,
            following: this.followers[userId]
        };
    }

    /**
     * Unfollow a trader
     */
    unfollowTrader(userId, traderId) {
        if (this.followers[userId]) {
            this.followers[userId] = this.followers[userId].filter(id => id !== traderId);
        }

        return {
            success: true,
            following: this.followers[userId] || []
        };
    }

    /**
     * Get user's followed traders
     */
    getFollowing(userId) {
        return this.followers[userId] || [];
    }

    /**
     * Stop trading simulation
     */
    stop() {
        if (this.tradingInterval) clearInterval(this.tradingInterval);
        if (this.leaderboardInterval) clearInterval(this.leaderboardInterval);
        this.saveState();
    }

    // ============================================
    // V63.95: BACKTEST TRAINING SYSTEM
    // Train traders on historical data
    // ============================================

    /**
     * Fetch historical candles from Binance
     */
    async fetchHistoricalCandles(symbol, interval = '1h', limit = 720) {
        const https = require('https');
        return new Promise((resolve) => {
            const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`;
            https.get(url, { timeout: 10000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const candles = JSON.parse(data).map(c => ({
                            time: c[0],
                            open: parseFloat(c[1]),
                            high: parseFloat(c[2]),
                            low: parseFloat(c[3]),
                            close: parseFloat(c[4]),
                            volume: parseFloat(c[5])
                        }));
                        resolve(candles);
                    } catch (e) { resolve([]); }
                });
            }).on('error', () => resolve([]));
        });
    }

    /**
     * Calculate RSI
     */
    calculateRSI(closes, period = 14) {
        if (closes.length < period + 1) return 50;
        let gains = 0, losses = 0;
        for (let i = closes.length - period; i < closes.length; i++) {
            const diff = closes[i] - closes[i - 1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }
        const rs = gains / (losses || 0.0001);
        return 100 - (100 / (1 + rs));
    }

    /**
     * Calculate EMA
     */
    calculateEMA(data, period) {
        if (data.length < period) return data[data.length - 1] || 0;
        const k = 2 / (period + 1);
        let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < data.length; i++) {
            ema = data[i] * k + ema * (1 - k);
        }
        return ema;
    }

    /**
     * Generate signal for a specific trader style on candles
     */
    generateTraderSignal(traderId, candles, idx) {
        const trader = this.traders[traderId];
        if (!trader || idx < 50) return null;

        const closes = candles.slice(0, idx + 1).map(c => c.close);
        const currentPrice = closes[closes.length - 1];
        const rsi = this.calculateRSI(closes);
        const ema9 = this.calculateEMA(closes.slice(-20), 9);
        const ema21 = this.calculateEMA(closes.slice(-30), 21);

        let signal = null;

        switch (traderId) {
            case 'marcus': // Scalper - RSI oversold/overbought
                if (rsi < 30) signal = { direction: 'LONG', reason: 'RSI oversold' };
                else if (rsi > 70) signal = { direction: 'SHORT', reason: 'RSI overbought' };
                break;

            case 'elena': // Swing - EMA cross + support
                if (ema9 > ema21 && closes[closes.length - 2] && closes[closes.length - 2] < ema21) {
                    signal = { direction: 'LONG', reason: 'EMA cross up' };
                } else if (ema9 < ema21 && closes[closes.length - 2] && closes[closes.length - 2] > ema21) {
                    signal = { direction: 'SHORT', reason: 'EMA cross down' };
                }
                break;

            case 'yuki': // Trend follower - EMA alignment + ADX
                if (ema9 > ema21 && currentPrice > ema9) {
                    signal = { direction: 'LONG', reason: 'Strong uptrend' };
                } else if (ema9 < ema21 && currentPrice < ema9) {
                    signal = { direction: 'SHORT', reason: 'Strong downtrend' };
                }
                break;

            case 'alex': // Contrarian - RSI divergence
                if (rsi < 25) signal = { direction: 'LONG', reason: 'Extreme oversold' };
                else if (rsi > 75) signal = { direction: 'SHORT', reason: 'Extreme overbought' };
                break;

            case 'sofia': // Momentum - Volume spike + direction
                const avgVolume = candles.slice(idx - 20, idx).reduce((a, c) => a + c.volume, 0) / 20;
                const currentVolume = candles[idx].volume;
                if (currentVolume > avgVolume * 2) {
                    if (candles[idx].close > candles[idx].open) {
                        signal = { direction: 'LONG', reason: 'Volume spike bullish' };
                    } else {
                        signal = { direction: 'SHORT', reason: 'Volume spike bearish' };
                    }
                }
                break;
        }

        return signal;
    }

    /**
     * Backtest a trader on historical data
     */
    async backtestTrader(traderId, symbols = ['BTC', 'ETH', 'SOL', 'ARB'], days = 30) {
        const trader = this.traders[traderId];
        if (!trader) return null;

        const results = {
            traderId,
            name: trader.name,
            style: trader.style,
            trades: 0,
            wins: 0,
            pnl: 0,
            winRate: 0,
            profitFactor: 0,
            avgWin: 0,
            avgLoss: 0
        };

        let totalWinPnl = 0, totalLossPnl = 0;
        const candleLimit = days * 24; // 1h candles

        for (const symbol of symbols) {
            const candles = await this.fetchHistoricalCandles(symbol, '1h', candleLimit);
            if (candles.length < 100) continue;

            let position = null;
            const slPercent = 0.8;
            const tpPercent = slPercent * trader.targetRR;

            for (let i = 50; i < candles.length - 1; i++) {
                // Check exit first
                if (position) {
                    const currentPrice = candles[i].high; // Use high for longs, low for shorts
                    const lowPrice = candles[i].low;

                    if (position.direction === 'LONG') {
                        if (currentPrice >= position.tp) {
                            // TP hit
                            results.trades++;
                            results.wins++;
                            const pnlPercent = tpPercent;
                            results.pnl += pnlPercent;
                            totalWinPnl += pnlPercent;
                            position = null;
                        } else if (lowPrice <= position.sl) {
                            // SL hit
                            results.trades++;
                            const pnlPercent = -slPercent;
                            results.pnl += pnlPercent;
                            totalLossPnl += slPercent;
                            position = null;
                        }
                    } else {
                        if (lowPrice <= position.tp) {
                            // TP hit
                            results.trades++;
                            results.wins++;
                            const pnlPercent = tpPercent;
                            results.pnl += pnlPercent;
                            totalWinPnl += pnlPercent;
                            position = null;
                        } else if (currentPrice >= position.sl) {
                            // SL hit
                            results.trades++;
                            const pnlPercent = -slPercent;
                            results.pnl += pnlPercent;
                            totalLossPnl += slPercent;
                            position = null;
                        }
                    }
                    continue; // Don't enter new position while in one
                }

                // Check for new signal
                const signal = this.generateTraderSignal(traderId, candles, i);
                if (signal) {
                    const entryPrice = candles[i].close;
                    position = {
                        direction: signal.direction,
                        entry: entryPrice,
                        sl: signal.direction === 'LONG'
                            ? entryPrice * (1 - slPercent / 100)
                            : entryPrice * (1 + slPercent / 100),
                        tp: signal.direction === 'LONG'
                            ? entryPrice * (1 + tpPercent / 100)
                            : entryPrice * (1 - tpPercent / 100),
                        time: candles[i].time
                    };
                }
            }
        }

        // Calculate stats
        results.winRate = results.trades > 0 ? (results.wins / results.trades * 100) : 0;
        results.profitFactor = totalLossPnl > 0 ? (totalWinPnl / totalLossPnl) : (totalWinPnl > 0 ? 999 : 0);
        results.avgWin = results.wins > 0 ? (totalWinPnl / results.wins) : 0;
        results.avgLoss = (results.trades - results.wins) > 0 ? (totalLossPnl / (results.trades - results.wins)) : 0;

        // Update trader stats
        trader.backtestResults = results;

        return results;
    }

    /**
     * Train all traders on historical data
     */
    async trainAllTraders(days = 30) {
        console.log(`[ACADEMY] 🎓 Training all traders on ${days} days of data...`);
        const results = [];

        for (const traderId of Object.keys(this.traders)) {
            const result = await this.backtestTrader(traderId, ['BTC', 'ETH', 'SOL', 'ARB', 'OP'], days);
            if (result) {
                results.push(result);
                console.log(`   ${result.name}: ${result.trades} trades, WR ${result.winRate.toFixed(1)}%, PF ${result.profitFactor.toFixed(2)}`);
            }
        }

        // Sort by PnL
        results.sort((a, b) => b.pnl - a.pnl);
        this.backtestResults = results;
        this.saveState();

        return results;
    }

    /**
     * Get best performers based on backtest (for copy trading)
     */
    getBestPerformers(minWinRate = 50, minPF = 1.1, maxTraders = 3) {
        return Object.values(this.traders)
            .filter(t => t.backtestResults &&
                         t.backtestResults.winRate >= minWinRate &&
                         t.backtestResults.profitFactor >= minPF)
            .sort((a, b) => b.backtestResults.pnl - a.backtestResults.pnl)
            .slice(0, maxTraders)
            .map(t => ({
                id: t.id,
                name: t.name,
                style: t.style,
                winRate: t.backtestResults.winRate,
                profitFactor: t.backtestResults.profitFactor,
                pnl: t.backtestResults.pnl,
                trades: t.backtestResults.trades,
                source: 'OBE-BACKTEST'
            }));
    }

    /**
     * Get current signals from trained traders (for copy trading)
     */
    async getCurrentSignals() {
        const signals = [];
        const symbols = ['BTC', 'ETH', 'SOL', 'ARB'];

        for (const symbol of symbols) {
            const candles = await this.fetchHistoricalCandles(symbol, '1h', 100);
            if (candles.length < 60) continue;

            for (const traderId of Object.keys(this.traders)) {
                const trader = this.traders[traderId];

                // Only consider traders with good backtest (PF >= 1.1, WR >= 35%)
                if (!trader.backtestResults ||
                    trader.backtestResults.profitFactor < 1.1 ||
                    trader.backtestResults.winRate < 35) continue;

                const signal = this.generateTraderSignal(traderId, candles, candles.length - 1);
                if (signal) {
                    signals.push({
                        traderId,
                        traderName: trader.name,
                        style: trader.style,
                        symbol,
                        direction: signal.direction,
                        reason: signal.reason,
                        currentPrice: candles[candles.length - 1].close,
                        confidence: trader.backtestResults.winRate,
                        profitFactor: trader.backtestResults.profitFactor,
                        timestamp: Date.now()
                    });
                }
            }
        }

        return signals;
    }
}

// Singleton
const simulatedTraders = new SimulatedTraders();

module.exports = { SimulatedTraders, simulatedTraders, TRADER_PROFILES };
