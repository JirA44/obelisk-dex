/**
 * OBELISK Analytics Engine
 * PnL Tracker, Heatmaps, Whale Alerts, Sentiment Analysis
 */

class AnalyticsEngine {
    constructor() {
        // PnL Tracking
        this.userPnL = new Map();
        this.portfolioSnapshots = new Map();

        // Heatmaps
        this.priceHeatmap = new Map();
        this.volumeHeatmap = new Map();
        this.correlationMatrix = {};

        // Whale Tracking
        this.whaleAlerts = [];
        this.whaleThresholds = {
            BTC: 10,      // 10 BTC
            ETH: 100,     // 100 ETH
            SOL: 1000,    // 1000 SOL
            USDC: 100000, // 100k USDC
            DEFAULT: 50000 // $50k
        };
        this.whaleWatchers = new Map();

        // Sentiment Analysis
        this.sentimentData = new Map();
        this.fearGreedIndex = 50;
        this.marketMood = 'neutral';

        // Statistics
        this.stats = {
            pnlUpdates: 0,
            whaleAlerts: 0,
            sentimentUpdates: 0
        };

        console.log('[ANALYTICS] Engine initialized');
    }

    // ==========================================
    // PNL TRACKING
    // ==========================================

    initUserPnL(userId) {
        if (!this.userPnL.has(userId)) {
            this.userPnL.set(userId, {
                userId,
                deposits: [],
                withdrawals: [],
                trades: [],
                positions: {},
                realizedPnL: 0,
                unrealizedPnL: 0,
                fees: 0,
                startDate: Date.now(),
                lastUpdate: Date.now()
            });
        }
        return this.userPnL.get(userId);
    }

    recordDeposit(userId, token, amount, txHash = null) {
        const pnl = this.initUserPnL(userId);
        pnl.deposits.push({
            token,
            amount,
            txHash,
            timestamp: Date.now()
        });
        pnl.lastUpdate = Date.now();
        this.stats.pnlUpdates++;
        return { success: true };
    }

    recordWithdrawal(userId, token, amount, txHash = null) {
        const pnl = this.initUserPnL(userId);
        pnl.withdrawals.push({
            token,
            amount,
            txHash,
            timestamp: Date.now()
        });
        pnl.lastUpdate = Date.now();
        this.stats.pnlUpdates++;
        return { success: true };
    }

    recordTrade(userId, trade) {
        const pnl = this.initUserPnL(userId);
        const { pair, side, price, quantity, fee = 0 } = trade;

        const tradeRecord = {
            id: `T${Date.now()}`,
            pair,
            side,
            price,
            quantity,
            value: price * quantity,
            fee,
            timestamp: Date.now()
        };

        pnl.trades.push(tradeRecord);
        pnl.fees += fee;

        // Update positions
        const [base, quote] = pair.split('/');
        if (!pnl.positions[base]) {
            pnl.positions[base] = { amount: 0, avgCost: 0, totalCost: 0 };
        }

        const pos = pnl.positions[base];
        if (side === 'buy') {
            pos.totalCost += price * quantity;
            pos.amount += quantity;
            pos.avgCost = pos.totalCost / pos.amount;
        } else {
            // Realize PnL on sell
            const costBasis = pos.avgCost * quantity;
            const saleValue = price * quantity;
            const realizedPnL = saleValue - costBasis - fee;

            pnl.realizedPnL += realizedPnL;
            pos.amount -= quantity;
            pos.totalCost = pos.avgCost * pos.amount;
        }

        pnl.lastUpdate = Date.now();
        this.stats.pnlUpdates++;

        return { success: true, trade: tradeRecord };
    }

    calculateUnrealizedPnL(userId, currentPrices) {
        const pnl = this.userPnL.get(userId);
        if (!pnl) return 0;

        let unrealized = 0;
        Object.entries(pnl.positions).forEach(([token, pos]) => {
            if (pos.amount > 0 && currentPrices[token]) {
                const currentValue = pos.amount * currentPrices[token];
                unrealized += currentValue - pos.totalCost;
            }
        });

        pnl.unrealizedPnL = unrealized;
        return unrealized;
    }

    getPnLSummary(userId, currentPrices = {}) {
        const pnl = this.userPnL.get(userId);
        if (!pnl) return null;

        this.calculateUnrealizedPnL(userId, currentPrices);

        // Calculate totals
        const totalDeposits = pnl.deposits.reduce((sum, d) => sum + d.amount, 0);
        const totalWithdrawals = pnl.withdrawals.reduce((sum, w) => sum + w.amount, 0);

        // Calculate current portfolio value
        let portfolioValue = 0;
        Object.entries(pnl.positions).forEach(([token, pos]) => {
            if (pos.amount > 0) {
                const price = currentPrices[token] || 0;
                portfolioValue += pos.amount * price;
            }
        });

        const totalPnL = pnl.realizedPnL + pnl.unrealizedPnL;
        const roi = totalDeposits > 0 ? (totalPnL / totalDeposits) * 100 : 0;

        return {
            userId,
            deposits: totalDeposits.toFixed(2),
            withdrawals: totalWithdrawals.toFixed(2),
            portfolioValue: portfolioValue.toFixed(2),
            realizedPnL: pnl.realizedPnL.toFixed(2),
            unrealizedPnL: pnl.unrealizedPnL.toFixed(2),
            totalPnL: totalPnL.toFixed(2),
            fees: pnl.fees.toFixed(2),
            roi: roi.toFixed(2) + '%',
            totalTrades: pnl.trades.length,
            positions: Object.entries(pnl.positions)
                .filter(([_, p]) => p.amount > 0)
                .map(([token, p]) => ({
                    token,
                    amount: p.amount.toFixed(6),
                    avgCost: p.avgCost.toFixed(4),
                    currentPrice: currentPrices[token]?.toFixed(4) || 'N/A'
                })),
            since: new Date(pnl.startDate).toISOString()
        };
    }

    getPnLHistory(userId, period = '7d') {
        const pnl = this.userPnL.get(userId);
        if (!pnl) return [];

        const periodMs = this.parsePeriod(period);
        const cutoff = Date.now() - periodMs;

        // Group trades by day
        const dailyPnL = {};
        pnl.trades
            .filter(t => t.timestamp >= cutoff)
            .forEach(trade => {
                const day = new Date(trade.timestamp).toISOString().split('T')[0];
                if (!dailyPnL[day]) {
                    dailyPnL[day] = { trades: 0, volume: 0, fees: 0 };
                }
                dailyPnL[day].trades++;
                dailyPnL[day].volume += trade.value;
                dailyPnL[day].fees += trade.fee;
            });

        return Object.entries(dailyPnL)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    // ==========================================
    // HEATMAPS
    // ==========================================

    updatePriceHeatmap(pair, price, change24h) {
        if (!this.priceHeatmap.has(pair)) {
            this.priceHeatmap.set(pair, {
                hourly: [],
                daily: []
            });
        }

        const data = this.priceHeatmap.get(pair);
        const now = Date.now();
        const hour = Math.floor(now / 3600000);

        // Add hourly data point
        data.hourly.push({
            hour,
            price,
            change: change24h,
            timestamp: now
        });

        // Keep last 168 hours (7 days)
        if (data.hourly.length > 168) {
            data.hourly.shift();
        }
    }

    getPriceHeatmap(period = '24h') {
        const heatmap = {};
        const periodMs = this.parsePeriod(period);
        const cutoff = Date.now() - periodMs;

        this.priceHeatmap.forEach((data, pair) => {
            const recentData = data.hourly.filter(d => d.timestamp >= cutoff);

            if (recentData.length > 0) {
                const changes = recentData.map(d => d.change);
                const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
                const maxChange = Math.max(...changes);
                const minChange = Math.min(...changes);

                heatmap[pair] = {
                    avgChange: avgChange.toFixed(2),
                    maxChange: maxChange.toFixed(2),
                    minChange: minChange.toFixed(2),
                    volatility: (maxChange - minChange).toFixed(2),
                    dataPoints: recentData.length,
                    color: this.getHeatmapColor(avgChange)
                };
            }
        });

        return heatmap;
    }

    getHeatmapColor(change) {
        if (change >= 5) return '#00ff00';      // Bright green
        if (change >= 2) return '#66ff66';      // Light green
        if (change >= 0) return '#99ff99';      // Pale green
        if (change >= -2) return '#ff9999';     // Pale red
        if (change >= -5) return '#ff6666';     // Light red
        return '#ff0000';                        // Bright red
    }

    updateVolumeHeatmap(pair, volume, trades) {
        if (!this.volumeHeatmap.has(pair)) {
            this.volumeHeatmap.set(pair, []);
        }

        const data = this.volumeHeatmap.get(pair);
        const now = Date.now();
        const hour = new Date(now).getUTCHours();
        const dayOfWeek = new Date(now).getUTCDay();

        data.push({
            hour,
            dayOfWeek,
            volume,
            trades,
            timestamp: now
        });

        // Keep last 7 days of data
        const cutoff = now - 7 * 24 * 3600000;
        while (data.length > 0 && data[0].timestamp < cutoff) {
            data.shift();
        }
    }

    getVolumeHeatmap(pair) {
        const data = this.volumeHeatmap.get(pair);
        if (!data) return null;

        // Create 7x24 matrix (days x hours)
        const matrix = Array(7).fill(null).map(() => Array(24).fill(0));
        const counts = Array(7).fill(null).map(() => Array(24).fill(0));

        data.forEach(d => {
            matrix[d.dayOfWeek][d.hour] += d.volume;
            counts[d.dayOfWeek][d.hour]++;
        });

        // Calculate averages
        for (let d = 0; d < 7; d++) {
            for (let h = 0; h < 24; h++) {
                if (counts[d][h] > 0) {
                    matrix[d][h] = matrix[d][h] / counts[d][h];
                }
            }
        }

        return {
            pair,
            matrix,
            days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            hours: Array.from({ length: 24 }, (_, i) => i),
            unit: 'USD'
        };
    }

    calculateCorrelations(priceHistory) {
        const pairs = Object.keys(priceHistory);
        const correlations = {};

        pairs.forEach(pair1 => {
            correlations[pair1] = {};
            pairs.forEach(pair2 => {
                if (pair1 === pair2) {
                    correlations[pair1][pair2] = 1;
                } else {
                    correlations[pair1][pair2] = this.pearsonCorrelation(
                        priceHistory[pair1],
                        priceHistory[pair2]
                    );
                }
            });
        });

        this.correlationMatrix = correlations;
        return correlations;
    }

    pearsonCorrelation(arr1, arr2) {
        const n = Math.min(arr1.length, arr2.length);
        if (n < 2) return 0;

        let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

        for (let i = 0; i < n; i++) {
            sum1 += arr1[i];
            sum2 += arr2[i];
            sum1Sq += arr1[i] ** 2;
            sum2Sq += arr2[i] ** 2;
            pSum += arr1[i] * arr2[i];
        }

        const num = pSum - (sum1 * sum2 / n);
        const den = Math.sqrt((sum1Sq - sum1 ** 2 / n) * (sum2Sq - sum2 ** 2 / n));

        return den === 0 ? 0 : Number((num / den).toFixed(4));
    }

    // ==========================================
    // WHALE ALERTS
    // ==========================================

    checkForWhale(trade) {
        const { pair, side, quantity, price, source } = trade;
        const [base] = pair.split('/');
        const value = quantity * price;

        const threshold = this.whaleThresholds[base] || this.whaleThresholds.DEFAULT;
        const isWhale = base === 'USDC' || base === 'USDT'
            ? quantity >= threshold
            : value >= threshold;

        if (isWhale) {
            const alert = {
                id: `WHALE_${Date.now()}`,
                pair,
                side,
                quantity,
                price,
                value,
                source,
                timestamp: Date.now(),
                message: `${side.toUpperCase()} ${quantity.toFixed(2)} ${base} ($${value.toFixed(0)})`
            };

            this.whaleAlerts.unshift(alert);
            if (this.whaleAlerts.length > 1000) {
                this.whaleAlerts.pop();
            }

            this.stats.whaleAlerts++;
            this.notifyWhaleWatchers(alert);

            return alert;
        }

        return null;
    }

    subscribeToWhaleAlerts(userId, config = {}) {
        const { minValue = 50000, pairs = [], callback = null } = config;

        this.whaleWatchers.set(userId, {
            userId,
            minValue,
            pairs,
            callback,
            subscribedAt: Date.now()
        });

        return {
            success: true,
            message: 'Subscribed to whale alerts',
            minValue,
            pairs: pairs.length > 0 ? pairs : 'all'
        };
    }

    notifyWhaleWatchers(alert) {
        this.whaleWatchers.forEach((watcher, userId) => {
            // Check if alert matches watcher criteria
            if (alert.value < watcher.minValue) return;
            if (watcher.pairs.length > 0 && !watcher.pairs.includes(alert.pair)) return;

            // Call callback if provided
            if (typeof watcher.callback === 'function') {
                watcher.callback(alert);
            }
        });
    }

    getWhaleAlerts(options = {}) {
        const { limit = 50, pair = null, minValue = 0, since = 0 } = options;

        let alerts = this.whaleAlerts;

        if (pair) {
            alerts = alerts.filter(a => a.pair === pair);
        }
        if (minValue > 0) {
            alerts = alerts.filter(a => a.value >= minValue);
        }
        if (since > 0) {
            alerts = alerts.filter(a => a.timestamp >= since);
        }

        return alerts.slice(0, limit).map(a => ({
            ...a,
            age: this.formatAge(Date.now() - a.timestamp)
        }));
    }

    getWhaleStats(period = '24h') {
        const periodMs = this.parsePeriod(period);
        const cutoff = Date.now() - periodMs;
        const recentAlerts = this.whaleAlerts.filter(a => a.timestamp >= cutoff);

        const buyVolume = recentAlerts
            .filter(a => a.side === 'buy')
            .reduce((sum, a) => sum + a.value, 0);

        const sellVolume = recentAlerts
            .filter(a => a.side === 'sell')
            .reduce((sum, a) => sum + a.value, 0);

        const byPair = {};
        recentAlerts.forEach(a => {
            if (!byPair[a.pair]) byPair[a.pair] = { buys: 0, sells: 0 };
            if (a.side === 'buy') byPair[a.pair].buys += a.value;
            else byPair[a.pair].sells += a.value;
        });

        return {
            period,
            totalAlerts: recentAlerts.length,
            buyVolume: buyVolume.toFixed(0),
            sellVolume: sellVolume.toFixed(0),
            netFlow: (buyVolume - sellVolume).toFixed(0),
            sentiment: buyVolume > sellVolume ? 'BULLISH' : 'BEARISH',
            byPair: Object.entries(byPair)
                .map(([pair, data]) => ({
                    pair,
                    buys: data.buys.toFixed(0),
                    sells: data.sells.toFixed(0),
                    net: (data.buys - data.sells).toFixed(0)
                }))
                .sort((a, b) => Math.abs(parseFloat(b.net)) - Math.abs(parseFloat(a.net)))
        };
    }

    // ==========================================
    // SENTIMENT ANALYSIS
    // ==========================================

    updateSentiment(pair, data) {
        const { socialScore = 50, newsScore = 50, technicalScore = 50 } = data;

        const sentiment = {
            social: socialScore,
            news: newsScore,
            technical: technicalScore,
            combined: (socialScore + newsScore + technicalScore) / 3,
            timestamp: Date.now()
        };

        if (!this.sentimentData.has(pair)) {
            this.sentimentData.set(pair, []);
        }

        const history = this.sentimentData.get(pair);
        history.push(sentiment);

        // Keep last 24 hours
        const cutoff = Date.now() - 24 * 3600000;
        while (history.length > 0 && history[0].timestamp < cutoff) {
            history.shift();
        }

        this.stats.sentimentUpdates++;
    }

    getSentiment(pair) {
        const history = this.sentimentData.get(pair);
        if (!history || history.length === 0) {
            return { pair, sentiment: 'neutral', score: 50, trend: 'stable' };
        }

        const latest = history[history.length - 1];
        const oldest = history[0];

        let sentiment = 'neutral';
        if (latest.combined >= 70) sentiment = 'very_bullish';
        else if (latest.combined >= 55) sentiment = 'bullish';
        else if (latest.combined <= 30) sentiment = 'very_bearish';
        else if (latest.combined <= 45) sentiment = 'bearish';

        const trend = latest.combined > oldest.combined ? 'improving' :
                      latest.combined < oldest.combined ? 'declining' : 'stable';

        return {
            pair,
            sentiment,
            score: latest.combined.toFixed(1),
            social: latest.social.toFixed(1),
            news: latest.news.toFixed(1),
            technical: latest.technical.toFixed(1),
            trend,
            dataPoints: history.length
        };
    }

    updateFearGreedIndex(value) {
        this.fearGreedIndex = Math.max(0, Math.min(100, value));

        if (this.fearGreedIndex >= 75) this.marketMood = 'extreme_greed';
        else if (this.fearGreedIndex >= 55) this.marketMood = 'greed';
        else if (this.fearGreedIndex >= 45) this.marketMood = 'neutral';
        else if (this.fearGreedIndex >= 25) this.marketMood = 'fear';
        else this.marketMood = 'extreme_fear';
    }

    getFearGreedIndex() {
        return {
            value: this.fearGreedIndex,
            mood: this.marketMood,
            emoji: this.getMoodEmoji(),
            recommendation: this.getRecommendation(),
            timestamp: Date.now()
        };
    }

    getMoodEmoji() {
        const emojis = {
            extreme_greed: '🤑',
            greed: '😊',
            neutral: '😐',
            fear: '😰',
            extreme_fear: '😱'
        };
        return emojis[this.marketMood];
    }

    getRecommendation() {
        const recs = {
            extreme_greed: 'Consider taking profits - market may be overheated',
            greed: 'Be cautious with new positions',
            neutral: 'Market is balanced - follow your strategy',
            fear: 'Potential buying opportunity',
            extreme_fear: 'Strong buy signal - be greedy when others are fearful'
        };
        return recs[this.marketMood];
    }

    getMarketOverview(pairs, currentPrices) {
        const overview = {
            fearGreed: this.getFearGreedIndex(),
            whaleActivity: this.getWhaleStats('24h'),
            sentiments: {},
            heatmap: this.getPriceHeatmap('24h')
        };

        pairs.forEach(pair => {
            const [base] = pair.split('/');
            overview.sentiments[pair] = this.getSentiment(pair);
        });

        // Calculate market-wide sentiment
        const scores = Object.values(overview.sentiments)
            .filter(s => s.score)
            .map(s => parseFloat(s.score));

        overview.marketSentiment = scores.length > 0
            ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
            : 50;

        return overview;
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    parsePeriod(period) {
        const units = {
            'h': 3600000,
            'd': 86400000,
            'w': 604800000,
            'm': 2592000000
        };
        const value = parseInt(period);
        const unit = period.slice(-1);
        return value * (units[unit] || units['d']);
    }

    formatAge(ms) {
        if (ms < 60000) return Math.floor(ms / 1000) + 's ago';
        if (ms < 3600000) return Math.floor(ms / 60000) + 'm ago';
        if (ms < 86400000) return Math.floor(ms / 3600000) + 'h ago';
        return Math.floor(ms / 86400000) + 'd ago';
    }

    getStats() {
        return {
            ...this.stats,
            usersTracked: this.userPnL.size,
            pairsMonitored: this.priceHeatmap.size,
            whaleWatchers: this.whaleWatchers.size,
            recentWhales: this.whaleAlerts.slice(0, 5).map(a => a.message)
        };
    }
}

module.exports = { AnalyticsEngine };
