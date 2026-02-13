/**
 * OBELISK Portfolio Manager
 * Multi-wallet Tracking, Auto-Rebalancing, Tax Reports
 */

class PortfolioManager {
    constructor() {
        // Multi-wallet tracking
        this.portfolios = new Map();
        this.walletConnections = new Map();

        // Rebalancing
        this.rebalanceConfigs = new Map();
        this.rebalanceHistory = new Map();

        // Tax reporting
        this.taxEvents = new Map();
        this.costBasis = new Map();

        // Supported chains for tracking
        this.supportedChains = {
            ethereum: { name: 'Ethereum', symbol: 'ETH', explorer: 'etherscan.io' },
            arbitrum: { name: 'Arbitrum', symbol: 'ARB', explorer: 'arbiscan.io' },
            polygon: { name: 'Polygon', symbol: 'MATIC', explorer: 'polygonscan.com' },
            solana: { name: 'Solana', symbol: 'SOL', explorer: 'solscan.io' },
            base: { name: 'Base', symbol: 'ETH', explorer: 'basescan.org' }
        };

        // Statistics
        this.stats = {
            portfoliosTracked: 0,
            walletsConnected: 0,
            rebalancesExecuted: 0,
            taxReportsGenerated: 0
        };

        console.log('[PORTFOLIO] Manager initialized');
    }

    // ==========================================
    // MULTI-WALLET TRACKING
    // ==========================================

    createPortfolio(userId, name = 'Main Portfolio') {
        const portfolioId = `PF_${userId}_${Date.now()}`;

        const portfolio = {
            id: portfolioId,
            userId,
            name,
            wallets: [],
            totalValue: 0,
            totalPnL: 0,
            holdings: {},
            allocation: {},
            snapshots: [],
            createdAt: Date.now(),
            lastUpdate: Date.now()
        };

        this.portfolios.set(portfolioId, portfolio);
        this.stats.portfoliosTracked++;

        return {
            success: true,
            portfolio: {
                id: portfolioId,
                name,
                status: 'created'
            }
        };
    }

    addWallet(portfolioId, walletConfig) {
        const {
            address,
            chain,
            label = null,
            trackNFTs = false
        } = walletConfig;

        const portfolio = this.portfolios.get(portfolioId);
        if (!portfolio) return { success: false, error: 'Portfolio not found' };

        if (!this.supportedChains[chain]) {
            return { success: false, error: 'Chain not supported', supported: Object.keys(this.supportedChains) };
        }

        const walletId = `W_${address.slice(0, 8)}_${chain}`;

        const wallet = {
            id: walletId,
            address,
            chain,
            label: label || `${chain} wallet`,
            trackNFTs,
            balances: {},
            nfts: [],
            lastSync: null,
            addedAt: Date.now()
        };

        portfolio.wallets.push(wallet);
        this.walletConnections.set(walletId, {
            portfolioId,
            ...wallet
        });

        this.stats.walletsConnected++;

        return {
            success: true,
            wallet: {
                id: walletId,
                address: `${address.slice(0, 6)}...${address.slice(-4)}`,
                chain,
                label: wallet.label
            }
        };
    }

    updateWalletBalances(walletId, balances) {
        const connection = this.walletConnections.get(walletId);
        if (!connection) return { success: false, error: 'Wallet not found' };

        const portfolio = this.portfolios.get(connection.portfolioId);
        if (!portfolio) return { success: false, error: 'Portfolio not found' };

        // Find and update wallet
        const wallet = portfolio.wallets.find(w => w.id === walletId);
        if (wallet) {
            wallet.balances = balances;
            wallet.lastSync = Date.now();
        }

        // Recalculate portfolio holdings
        this.recalculatePortfolio(connection.portfolioId);

        return { success: true, lastSync: wallet.lastSync };
    }

    recalculatePortfolio(portfolioId, currentPrices = {}) {
        const portfolio = this.portfolios.get(portfolioId);
        if (!portfolio) return;

        // Aggregate all wallet balances
        const holdings = {};
        let totalValue = 0;

        portfolio.wallets.forEach(wallet => {
            Object.entries(wallet.balances || {}).forEach(([token, amount]) => {
                if (!holdings[token]) holdings[token] = 0;
                holdings[token] += amount;

                const price = currentPrices[token] || 0;
                totalValue += amount * price;
            });
        });

        // Calculate allocation percentages
        const allocation = {};
        Object.entries(holdings).forEach(([token, amount]) => {
            const price = currentPrices[token] || 0;
            const value = amount * price;
            allocation[token] = totalValue > 0 ? (value / totalValue) * 100 : 0;
        });

        portfolio.holdings = holdings;
        portfolio.allocation = allocation;
        portfolio.totalValue = totalValue;
        portfolio.lastUpdate = Date.now();
    }

    getPortfolioOverview(portfolioId, currentPrices = {}) {
        const portfolio = this.portfolios.get(portfolioId);
        if (!portfolio) return null;

        this.recalculatePortfolio(portfolioId, currentPrices);

        // Get latest snapshot for PnL calculation
        const latestSnapshot = portfolio.snapshots[portfolio.snapshots.length - 1];
        const pnl24h = latestSnapshot
            ? portfolio.totalValue - latestSnapshot.totalValue
            : 0;

        return {
            id: portfolio.id,
            name: portfolio.name,
            totalValue: portfolio.totalValue.toFixed(2),
            pnl24h: pnl24h.toFixed(2),
            pnl24hPercent: latestSnapshot && latestSnapshot.totalValue > 0
                ? ((pnl24h / latestSnapshot.totalValue) * 100).toFixed(2) + '%'
                : '0%',
            wallets: portfolio.wallets.map(w => ({
                id: w.id,
                label: w.label,
                chain: w.chain,
                address: `${w.address.slice(0, 6)}...${w.address.slice(-4)}`,
                lastSync: w.lastSync ? this.formatAge(Date.now() - w.lastSync) : 'never'
            })),
            holdings: Object.entries(portfolio.holdings)
                .filter(([_, amount]) => amount > 0)
                .map(([token, amount]) => ({
                    token,
                    amount: amount.toFixed(6),
                    value: ((currentPrices[token] || 0) * amount).toFixed(2),
                    allocation: portfolio.allocation[token]?.toFixed(2) + '%'
                }))
                .sort((a, b) => parseFloat(b.value) - parseFloat(a.value)),
            lastUpdate: new Date(portfolio.lastUpdate).toISOString()
        };
    }

    takeSnapshot(portfolioId, currentPrices = {}) {
        const portfolio = this.portfolios.get(portfolioId);
        if (!portfolio) return null;

        this.recalculatePortfolio(portfolioId, currentPrices);

        const snapshot = {
            timestamp: Date.now(),
            totalValue: portfolio.totalValue,
            holdings: { ...portfolio.holdings },
            allocation: { ...portfolio.allocation }
        };

        portfolio.snapshots.push(snapshot);

        // Keep last 365 snapshots (1 year of daily)
        if (portfolio.snapshots.length > 365) {
            portfolio.snapshots.shift();
        }

        return snapshot;
    }

    getPerformanceHistory(portfolioId, period = '30d') {
        const portfolio = this.portfolios.get(portfolioId);
        if (!portfolio) return null;

        const periodMs = this.parsePeriod(period);
        const cutoff = Date.now() - periodMs;

        const history = portfolio.snapshots
            .filter(s => s.timestamp >= cutoff)
            .map(s => ({
                date: new Date(s.timestamp).toISOString().split('T')[0],
                value: s.totalValue.toFixed(2)
            }));

        // Calculate performance metrics
        const firstValue = history[0]?.value || 0;
        const lastValue = history[history.length - 1]?.value || 0;
        const change = parseFloat(lastValue) - parseFloat(firstValue);
        const changePercent = firstValue > 0 ? (change / parseFloat(firstValue)) * 100 : 0;

        return {
            period,
            history,
            performance: {
                startValue: firstValue,
                endValue: lastValue,
                change: change.toFixed(2),
                changePercent: changePercent.toFixed(2) + '%'
            }
        };
    }

    // ==========================================
    // AUTO-REBALANCING
    // ==========================================

    setRebalanceConfig(portfolioId, config) {
        const {
            targetAllocation, // { BTC: 40, ETH: 30, SOL: 20, USDC: 10 }
            threshold = 5,     // Rebalance when drift exceeds 5%
            frequency = 'weekly', // 'daily', 'weekly', 'monthly', 'manual'
            enabled = true
        } = config;

        // Validate allocation totals to 100%
        const total = Object.values(targetAllocation).reduce((a, b) => a + b, 0);
        if (Math.abs(total - 100) > 0.01) {
            return { success: false, error: `Allocation must total 100%, got ${total}%` };
        }

        const rebalanceConfig = {
            portfolioId,
            targetAllocation,
            threshold,
            frequency,
            enabled,
            lastRebalance: null,
            nextRebalance: this.calculateNextRebalance(frequency),
            createdAt: Date.now()
        };

        this.rebalanceConfigs.set(portfolioId, rebalanceConfig);

        return {
            success: true,
            config: {
                targetAllocation,
                threshold: threshold + '%',
                frequency,
                nextRebalance: new Date(rebalanceConfig.nextRebalance).toISOString()
            }
        };
    }

    calculateNextRebalance(frequency) {
        const intervals = {
            daily: 86400000,
            weekly: 604800000,
            monthly: 2592000000
        };
        return Date.now() + (intervals[frequency] || intervals.weekly);
    }

    checkRebalanceNeeded(portfolioId, currentPrices = {}) {
        const config = this.rebalanceConfigs.get(portfolioId);
        if (!config || !config.enabled) return { needed: false };

        const portfolio = this.portfolios.get(portfolioId);
        if (!portfolio) return { needed: false };

        this.recalculatePortfolio(portfolioId, currentPrices);

        const drifts = {};
        let maxDrift = 0;

        Object.entries(config.targetAllocation).forEach(([token, target]) => {
            const current = portfolio.allocation[token] || 0;
            const drift = Math.abs(current - target);
            drifts[token] = {
                current: current.toFixed(2) + '%',
                target: target + '%',
                drift: drift.toFixed(2) + '%'
            };
            maxDrift = Math.max(maxDrift, drift);
        });

        const needed = maxDrift >= config.threshold;

        return {
            needed,
            maxDrift: maxDrift.toFixed(2) + '%',
            threshold: config.threshold + '%',
            drifts,
            recommendation: needed ? 'Rebalance recommended' : 'Portfolio within target'
        };
    }

    calculateRebalanceTrades(portfolioId, currentPrices = {}) {
        const config = this.rebalanceConfigs.get(portfolioId);
        const portfolio = this.portfolios.get(portfolioId);
        if (!config || !portfolio) return null;

        this.recalculatePortfolio(portfolioId, currentPrices);

        const trades = [];
        const totalValue = portfolio.totalValue;

        Object.entries(config.targetAllocation).forEach(([token, targetPercent]) => {
            const targetValue = (targetPercent / 100) * totalValue;
            const currentAmount = portfolio.holdings[token] || 0;
            const currentValue = currentAmount * (currentPrices[token] || 0);
            const diffValue = targetValue - currentValue;

            if (Math.abs(diffValue) > 1) { // Ignore tiny differences
                const price = currentPrices[token] || 0;
                const diffAmount = price > 0 ? diffValue / price : 0;

                trades.push({
                    token,
                    action: diffValue > 0 ? 'BUY' : 'SELL',
                    amount: Math.abs(diffAmount).toFixed(6),
                    valueUSD: Math.abs(diffValue).toFixed(2),
                    currentAllocation: (portfolio.allocation[token] || 0).toFixed(2) + '%',
                    targetAllocation: targetPercent + '%'
                });
            }
        });

        // Sort: sells first, then buys (to free up capital)
        trades.sort((a, b) => {
            if (a.action === 'SELL' && b.action === 'BUY') return -1;
            if (a.action === 'BUY' && b.action === 'SELL') return 1;
            return parseFloat(b.valueUSD) - parseFloat(a.valueUSD);
        });

        return {
            portfolioId,
            currentValue: totalValue.toFixed(2),
            trades,
            estimatedGas: (trades.length * 0.5).toFixed(2) + ' USD',
            timestamp: Date.now()
        };
    }

    executeRebalance(portfolioId, trades, currentPrices = {}) {
        const config = this.rebalanceConfigs.get(portfolioId);
        const portfolio = this.portfolios.get(portfolioId);
        if (!config || !portfolio) return { success: false, error: 'Not found' };

        const execution = {
            id: `RB_${portfolioId}_${Date.now()}`,
            portfolioId,
            trades: [],
            beforeAllocation: { ...portfolio.allocation },
            afterAllocation: {},
            totalTraded: 0,
            timestamp: Date.now()
        };

        // Simulate trade execution
        trades.forEach(trade => {
            const { token, action, amount } = trade;
            const amountNum = parseFloat(amount);
            const price = currentPrices[token] || 0;

            if (action === 'BUY') {
                portfolio.holdings[token] = (portfolio.holdings[token] || 0) + amountNum;
            } else {
                portfolio.holdings[token] = (portfolio.holdings[token] || 0) - amountNum;
            }

            execution.trades.push({
                ...trade,
                executedAt: Date.now(),
                executedPrice: price
            });

            execution.totalTraded += amountNum * price;
        });

        // Recalculate after rebalance
        this.recalculatePortfolio(portfolioId, currentPrices);
        execution.afterAllocation = { ...portfolio.allocation };

        // Update config
        config.lastRebalance = Date.now();
        config.nextRebalance = this.calculateNextRebalance(config.frequency);

        // Store history
        if (!this.rebalanceHistory.has(portfolioId)) {
            this.rebalanceHistory.set(portfolioId, []);
        }
        this.rebalanceHistory.get(portfolioId).push(execution);

        this.stats.rebalancesExecuted++;

        return {
            success: true,
            execution: {
                id: execution.id,
                tradesExecuted: execution.trades.length,
                totalTraded: execution.totalTraded.toFixed(2),
                newAllocation: Object.entries(execution.afterAllocation)
                    .map(([t, a]) => `${t}: ${a.toFixed(1)}%`)
                    .join(', ')
            }
        };
    }

    getRebalanceHistory(portfolioId, limit = 10) {
        const history = this.rebalanceHistory.get(portfolioId) || [];
        return history.slice(-limit).reverse().map(r => ({
            id: r.id,
            trades: r.trades.length,
            totalTraded: r.totalTraded.toFixed(2),
            date: new Date(r.timestamp).toISOString()
        }));
    }

    // ==========================================
    // TAX REPORTING
    // ==========================================

    recordTaxEvent(userId, event) {
        const {
            type, // 'trade', 'airdrop', 'stake_reward', 'nft_sale', 'transfer'
            token,
            amount,
            costBasis = 0,
            proceeds = 0,
            timestamp = Date.now(),
            txHash = null
        } = event;

        if (!this.taxEvents.has(userId)) {
            this.taxEvents.set(userId, []);
        }

        const taxEvent = {
            id: `TAX_${Date.now()}`,
            type,
            token,
            amount,
            costBasis,
            proceeds,
            gain: proceeds - costBasis,
            timestamp,
            txHash,
            year: new Date(timestamp).getFullYear()
        };

        this.taxEvents.get(userId).push(taxEvent);

        // Update cost basis tracking
        this.updateCostBasis(userId, token, amount, costBasis, type);

        return { success: true, event: taxEvent };
    }

    updateCostBasis(userId, token, amount, cost, type) {
        const key = `${userId}_${token}`;

        if (!this.costBasis.has(key)) {
            this.costBasis.set(key, {
                userId,
                token,
                totalAmount: 0,
                totalCost: 0,
                avgCost: 0,
                lots: []
            });
        }

        const basis = this.costBasis.get(key);

        if (type === 'trade' || type === 'airdrop' || type === 'stake_reward') {
            // Add new lot (FIFO tracking)
            basis.lots.push({
                amount,
                cost,
                costPerUnit: cost / amount,
                acquiredAt: Date.now()
            });

            basis.totalAmount += amount;
            basis.totalCost += cost;
            basis.avgCost = basis.totalAmount > 0 ? basis.totalCost / basis.totalAmount : 0;
        }
    }

    calculateCapitalGains(userId, year, method = 'FIFO') {
        const events = this.taxEvents.get(userId) || [];
        const yearEvents = events.filter(e => e.year === year);

        let shortTermGains = 0;
        let longTermGains = 0;
        let totalProceeds = 0;
        let totalCost = 0;

        const dispositions = yearEvents.filter(e =>
            e.type === 'trade' && e.proceeds > 0
        );

        dispositions.forEach(event => {
            const holdingPeriod = this.estimateHoldingPeriod(userId, event.token);
            const gain = event.gain;

            totalProceeds += event.proceeds;
            totalCost += event.costBasis;

            // Long-term: held > 1 year (365 days)
            if (holdingPeriod > 365) {
                longTermGains += gain;
            } else {
                shortTermGains += gain;
            }
        });

        return {
            year,
            method,
            shortTermGains: shortTermGains.toFixed(2),
            longTermGains: longTermGains.toFixed(2),
            totalGains: (shortTermGains + longTermGains).toFixed(2),
            totalProceeds: totalProceeds.toFixed(2),
            totalCostBasis: totalCost.toFixed(2),
            transactions: dispositions.length,
            note: 'Short-term gains taxed as ordinary income. Long-term gains may have preferential rates.'
        };
    }

    estimateHoldingPeriod(userId, token) {
        const key = `${userId}_${token}`;
        const basis = this.costBasis.get(key);

        if (!basis || basis.lots.length === 0) return 0;

        // Use oldest lot (FIFO)
        const oldestLot = basis.lots[0];
        return Math.floor((Date.now() - oldestLot.acquiredAt) / 86400000);
    }

    generateTaxReport(userId, year, format = 'summary') {
        const events = this.taxEvents.get(userId) || [];
        const yearEvents = events.filter(e => e.year === year);

        const capitalGains = this.calculateCapitalGains(userId, year);

        // Categorize income
        const incomeEvents = yearEvents.filter(e =>
            ['airdrop', 'stake_reward'].includes(e.type)
        );

        const totalIncome = incomeEvents.reduce((sum, e) => sum + e.proceeds, 0);

        const report = {
            userId,
            year,
            generatedAt: new Date().toISOString(),
            summary: {
                totalTransactions: yearEvents.length,
                ...capitalGains,
                ordinaryIncome: totalIncome.toFixed(2),
                incomeEvents: incomeEvents.length
            }
        };

        if (format === 'detailed') {
            report.transactions = yearEvents.map(e => ({
                date: new Date(e.timestamp).toISOString().split('T')[0],
                type: e.type,
                token: e.token,
                amount: e.amount,
                costBasis: e.costBasis.toFixed(2),
                proceeds: e.proceeds.toFixed(2),
                gain: e.gain.toFixed(2),
                txHash: e.txHash
            }));

            report.byToken = this.groupByToken(yearEvents);
        }

        this.stats.taxReportsGenerated++;

        return report;
    }

    groupByToken(events) {
        const byToken = {};

        events.forEach(e => {
            if (!byToken[e.token]) {
                byToken[e.token] = {
                    transactions: 0,
                    totalProceeds: 0,
                    totalCost: 0,
                    totalGain: 0
                };
            }
            byToken[e.token].transactions++;
            byToken[e.token].totalProceeds += e.proceeds;
            byToken[e.token].totalCost += e.costBasis;
            byToken[e.token].totalGain += e.gain;
        });

        return Object.entries(byToken).map(([token, data]) => ({
            token,
            ...data,
            totalProceeds: data.totalProceeds.toFixed(2),
            totalCost: data.totalCost.toFixed(2),
            totalGain: data.totalGain.toFixed(2)
        }));
    }

    exportTaxData(userId, year, format = 'csv') {
        const events = this.taxEvents.get(userId) || [];
        const yearEvents = events.filter(e => e.year === year);

        if (format === 'csv') {
            const headers = 'Date,Type,Token,Amount,Cost Basis,Proceeds,Gain/Loss,TX Hash\n';
            const rows = yearEvents.map(e =>
                [
                    new Date(e.timestamp).toISOString().split('T')[0],
                    e.type,
                    e.token,
                    e.amount,
                    e.costBasis.toFixed(2),
                    e.proceeds.toFixed(2),
                    e.gain.toFixed(2),
                    e.txHash || ''
                ].join(',')
            ).join('\n');

            return {
                format: 'csv',
                filename: `tax_report_${year}.csv`,
                content: headers + rows
            };
        }

        return {
            format: 'json',
            filename: `tax_report_${year}.json`,
            content: JSON.stringify(yearEvents, null, 2)
        };
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    parsePeriod(period) {
        const units = { 'd': 86400000, 'w': 604800000, 'm': 2592000000, 'y': 31536000000 };
        const value = parseInt(period);
        const unit = period.slice(-1);
        return value * (units[unit] || units['d']);
    }

    formatAge(ms) {
        if (ms < 60000) return 'just now';
        if (ms < 3600000) return Math.floor(ms / 60000) + 'm ago';
        if (ms < 86400000) return Math.floor(ms / 3600000) + 'h ago';
        return Math.floor(ms / 86400000) + 'd ago';
    }

    getStats() {
        return {
            ...this.stats,
            totalPortfolios: this.portfolios.size,
            totalWallets: this.walletConnections.size,
            rebalanceConfigs: this.rebalanceConfigs.size
        };
    }

    getUserPortfolios(userId) {
        const userPortfolios = [];
        this.portfolios.forEach((portfolio) => {
            if (portfolio.userId === userId) {
                userPortfolios.push({
                    id: portfolio.id,
                    name: portfolio.name,
                    walletsCount: portfolio.wallets.length,
                    totalValue: portfolio.totalValue.toFixed(2),
                    lastUpdate: this.formatAge(Date.now() - portfolio.lastUpdate)
                });
            }
        });
        return userPortfolios;
    }
}

module.exports = { PortfolioManager };
