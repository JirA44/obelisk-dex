/**
 * OBELISK Advanced Trading Module
 * Grid Trading, DCA, Copy Trading, Trailing Orders
 */

class AdvancedTrading {
    constructor() {
        // Grid Trading
        this.gridBots = new Map();

        // DCA (Dollar Cost Averaging)
        this.dcaPlans = new Map();
        this.dcaExecutions = new Map();

        // Copy Trading
        this.masterTraders = new Map();
        this.copyRelations = new Map();
        this.copyHistory = new Map();

        // Trailing Orders
        this.trailingOrders = new Map();

        // Statistics
        this.stats = {
            gridBotsActive: 0,
            dcaPlansActive: 0,
            copyTradersActive: 0,
            trailingOrdersActive: 0,
            totalProfit: 0
        };

        console.log('[ADVANCED-TRADING] Module initialized');
    }

    // ==========================================
    // GRID TRADING
    // ==========================================

    createGridBot(userId, config) {
        const {
            pair,
            lowerPrice,
            upperPrice,
            gridLevels = 10,
            investmentAmount,
            type = 'arithmetic' // arithmetic or geometric
        } = config;

        if (!pair || !lowerPrice || !upperPrice || !investmentAmount) {
            return { success: false, error: 'Missing required parameters' };
        }

        if (lowerPrice >= upperPrice) {
            return { success: false, error: 'lowerPrice must be less than upperPrice' };
        }

        const botId = `GRID_${userId}_${Date.now()}`;
        const grids = this.calculateGridLevels(lowerPrice, upperPrice, gridLevels, type);
        const amountPerGrid = investmentAmount / gridLevels;

        const bot = {
            id: botId,
            userId,
            pair,
            lowerPrice,
            upperPrice,
            gridLevels,
            type,
            investmentAmount,
            amountPerGrid,
            grids,
            orders: [],
            status: 'active',
            profit: 0,
            trades: 0,
            createdAt: Date.now(),
            lastUpdate: Date.now()
        };

        // Create initial orders
        grids.forEach((gridPrice, index) => {
            bot.orders.push({
                gridIndex: index,
                price: gridPrice,
                side: 'buy', // Initial orders are buy
                amount: amountPerGrid / gridPrice,
                status: 'pending',
                filledAt: null
            });
        });

        this.gridBots.set(botId, bot);
        this.stats.gridBotsActive++;

        return {
            success: true,
            bot: {
                id: botId,
                pair,
                grids: grids.length,
                priceRange: `${lowerPrice} - ${upperPrice}`,
                amountPerGrid: amountPerGrid.toFixed(2),
                totalInvestment: investmentAmount,
                status: 'active'
            }
        };
    }

    calculateGridLevels(lower, upper, levels, type) {
        const grids = [];

        if (type === 'geometric') {
            const ratio = Math.pow(upper / lower, 1 / (levels - 1));
            for (let i = 0; i < levels; i++) {
                grids.push(Number((lower * Math.pow(ratio, i)).toPrecision(8)));
            }
        } else {
            // Arithmetic
            const step = (upper - lower) / (levels - 1);
            for (let i = 0; i < levels; i++) {
                grids.push(Number((lower + step * i).toPrecision(8)));
            }
        }

        return grids;
    }

    updateGridBot(botId, currentPrice) {
        const bot = this.gridBots.get(botId);
        if (!bot || bot.status !== 'active') return null;

        const executedOrders = [];

        bot.orders.forEach((order, index) => {
            if (order.status !== 'pending') return;

            // Check if order should be filled
            if (order.side === 'buy' && currentPrice <= order.price) {
                order.status = 'filled';
                order.filledAt = Date.now();
                order.fillPrice = currentPrice;

                // Create sell order at next grid level
                const nextGridIndex = index + 1;
                if (nextGridIndex < bot.grids.length) {
                    bot.orders.push({
                        gridIndex: nextGridIndex,
                        price: bot.grids[nextGridIndex],
                        side: 'sell',
                        amount: order.amount,
                        status: 'pending',
                        linkedTo: index
                    });
                }

                executedOrders.push({ ...order, action: 'BUY' });
                bot.trades++;
            }
            else if (order.side === 'sell' && currentPrice >= order.price) {
                order.status = 'filled';
                order.filledAt = Date.now();
                order.fillPrice = currentPrice;

                // Calculate profit
                const buyOrder = bot.orders[order.linkedTo];
                if (buyOrder) {
                    const profit = (order.fillPrice - buyOrder.fillPrice) * order.amount;
                    bot.profit += profit;
                    this.stats.totalProfit += profit;
                }

                // Create new buy order at original grid
                bot.orders.push({
                    gridIndex: order.linkedTo,
                    price: bot.grids[order.linkedTo],
                    side: 'buy',
                    amount: order.amount,
                    status: 'pending'
                });

                executedOrders.push({ ...order, action: 'SELL' });
                bot.trades++;
            }
        });

        bot.lastUpdate = Date.now();
        return executedOrders.length > 0 ? executedOrders : null;
    }

    getGridBotStatus(botId) {
        const bot = this.gridBots.get(botId);
        if (!bot) return null;

        const pendingBuys = bot.orders.filter(o => o.status === 'pending' && o.side === 'buy').length;
        const pendingSells = bot.orders.filter(o => o.status === 'pending' && o.side === 'sell').length;
        const filledOrders = bot.orders.filter(o => o.status === 'filled').length;

        return {
            id: bot.id,
            pair: bot.pair,
            status: bot.status,
            priceRange: `${bot.lowerPrice} - ${bot.upperPrice}`,
            gridLevels: bot.gridLevels,
            pendingBuys,
            pendingSells,
            filledOrders,
            totalTrades: bot.trades,
            profit: bot.profit.toFixed(4),
            roi: ((bot.profit / bot.investmentAmount) * 100).toFixed(2) + '%',
            uptime: this.formatDuration(Date.now() - bot.createdAt)
        };
    }

    stopGridBot(botId) {
        const bot = this.gridBots.get(botId);
        if (!bot) return { success: false, error: 'Bot not found' };

        bot.status = 'stopped';
        bot.stoppedAt = Date.now();
        this.stats.gridBotsActive--;

        return {
            success: true,
            finalProfit: bot.profit.toFixed(4),
            totalTrades: bot.trades,
            duration: this.formatDuration(Date.now() - bot.createdAt)
        };
    }

    // ==========================================
    // DCA (Dollar Cost Averaging)
    // ==========================================

    createDCAPlan(userId, config) {
        const {
            pair,
            amount,
            frequency = 'daily', // hourly, daily, weekly, monthly
            totalPurchases = 0, // 0 = unlimited
            startDate = Date.now()
        } = config;

        if (!pair || !amount) {
            return { success: false, error: 'pair and amount required' };
        }

        const planId = `DCA_${userId}_${Date.now()}`;
        const intervalMs = this.getIntervalMs(frequency);

        const plan = {
            id: planId,
            userId,
            pair,
            amount,
            frequency,
            intervalMs,
            totalPurchases,
            purchasesMade: 0,
            totalInvested: 0,
            totalReceived: 0,
            averagePrice: 0,
            status: 'active',
            nextExecution: startDate,
            history: [],
            createdAt: Date.now()
        };

        this.dcaPlans.set(planId, plan);
        this.stats.dcaPlansActive++;

        return {
            success: true,
            plan: {
                id: planId,
                pair,
                amount,
                frequency,
                nextExecution: new Date(startDate).toISOString(),
                status: 'active'
            }
        };
    }

    getIntervalMs(frequency) {
        const intervals = {
            'hourly': 60 * 60 * 1000,
            'daily': 24 * 60 * 60 * 1000,
            'weekly': 7 * 24 * 60 * 60 * 1000,
            'monthly': 30 * 24 * 60 * 60 * 1000
        };
        return intervals[frequency] || intervals.daily;
    }

    executeDCA(planId, currentPrice) {
        const plan = this.dcaPlans.get(planId);
        if (!plan || plan.status !== 'active') return null;
        if (Date.now() < plan.nextExecution) return null;

        // Check if max purchases reached
        if (plan.totalPurchases > 0 && plan.purchasesMade >= plan.totalPurchases) {
            plan.status = 'completed';
            this.stats.dcaPlansActive--;
            return { status: 'completed', message: 'DCA plan completed' };
        }

        // Execute purchase
        const tokenAmount = plan.amount / currentPrice;

        plan.purchasesMade++;
        plan.totalInvested += plan.amount;
        plan.totalReceived += tokenAmount;
        plan.averagePrice = plan.totalInvested / plan.totalReceived;
        plan.nextExecution = Date.now() + plan.intervalMs;

        const execution = {
            purchaseNumber: plan.purchasesMade,
            amount: plan.amount,
            price: currentPrice,
            received: tokenAmount,
            timestamp: Date.now()
        };

        plan.history.push(execution);

        return {
            success: true,
            execution,
            stats: {
                totalInvested: plan.totalInvested.toFixed(2),
                totalReceived: plan.totalReceived.toFixed(6),
                averagePrice: plan.averagePrice.toFixed(4),
                currentPrice: currentPrice.toFixed(4),
                pnlPercent: (((currentPrice - plan.averagePrice) / plan.averagePrice) * 100).toFixed(2)
            }
        };
    }

    getDCAPlanStatus(planId) {
        const plan = this.dcaPlans.get(planId);
        if (!plan) return null;

        return {
            id: plan.id,
            pair: plan.pair,
            status: plan.status,
            frequency: plan.frequency,
            amountPerPurchase: plan.amount,
            purchasesMade: plan.purchasesMade,
            totalPurchases: plan.totalPurchases || 'unlimited',
            totalInvested: plan.totalInvested.toFixed(2),
            totalReceived: plan.totalReceived.toFixed(6),
            averagePrice: plan.averagePrice.toFixed(4),
            nextExecution: plan.status === 'active' ? new Date(plan.nextExecution).toISOString() : null,
            history: plan.history.slice(-10)
        };
    }

    pauseDCAPlan(planId) {
        const plan = this.dcaPlans.get(planId);
        if (!plan) return { success: false, error: 'Plan not found' };

        plan.status = plan.status === 'active' ? 'paused' : 'active';
        return { success: true, status: plan.status };
    }

    // ==========================================
    // COPY TRADING
    // ==========================================

    registerMasterTrader(userId, config) {
        const { name, description, minCopyAmount = 10 } = config;

        const masterId = `MASTER_${userId}`;

        const master = {
            id: masterId,
            userId,
            name: name || `Trader_${userId.slice(0, 8)}`,
            description,
            minCopyAmount,
            followers: [],
            trades: [],
            stats: {
                totalTrades: 0,
                winRate: 0,
                avgProfit: 0,
                totalProfit: 0,
                pnl7d: 0,
                pnl30d: 0
            },
            isPublic: true,
            createdAt: Date.now()
        };

        this.masterTraders.set(masterId, master);

        return {
            success: true,
            masterId,
            shareLink: `/copy/${masterId}`
        };
    }

    startCopying(followerId, masterId, config) {
        const { copyAmount, copyPercentage = 100, maxLoss = 0 } = config;

        const master = this.masterTraders.get(masterId);
        if (!master) return { success: false, error: 'Master trader not found' };

        if (copyAmount < master.minCopyAmount) {
            return { success: false, error: `Minimum copy amount: ${master.minCopyAmount}` };
        }

        const relationId = `COPY_${followerId}_${masterId}`;

        const relation = {
            id: relationId,
            followerId,
            masterId,
            copyAmount,
            copyPercentage,
            maxLoss,
            currentLoss: 0,
            copiedTrades: [],
            profit: 0,
            status: 'active',
            startedAt: Date.now()
        };

        this.copyRelations.set(relationId, relation);
        master.followers.push(followerId);

        return {
            success: true,
            relationId,
            message: `Now copying ${master.name}`,
            copyAmount,
            copyPercentage: copyPercentage + '%'
        };
    }

    recordMasterTrade(masterId, trade) {
        const master = this.masterTraders.get(masterId);
        if (!master) return;

        const tradeRecord = {
            ...trade,
            timestamp: Date.now(),
            id: `TRADE_${Date.now()}`
        };

        master.trades.push(tradeRecord);
        master.stats.totalTrades++;

        // Update stats
        if (trade.profit !== undefined) {
            master.stats.totalProfit += trade.profit;
            const wins = master.trades.filter(t => t.profit > 0).length;
            master.stats.winRate = (wins / master.stats.totalTrades) * 100;
            master.stats.avgProfit = master.stats.totalProfit / master.stats.totalTrades;
        }

        // Notify followers and execute copy trades
        const copiedTrades = [];
        this.copyRelations.forEach((relation, relationId) => {
            if (relation.masterId === masterId && relation.status === 'active') {
                const copyTrade = this.executeCopyTrade(relation, tradeRecord);
                if (copyTrade) copiedTrades.push(copyTrade);
            }
        });

        return { masterTrade: tradeRecord, copiedTrades };
    }

    executeCopyTrade(relation, masterTrade) {
        // Calculate copy amount based on percentage
        const copyRatio = relation.copyPercentage / 100;
        const copySize = masterTrade.size * copyRatio * (relation.copyAmount / 1000); // Normalize

        const copyTrade = {
            originalTradeId: masterTrade.id,
            pair: masterTrade.pair,
            side: masterTrade.side,
            size: copySize,
            price: masterTrade.price,
            timestamp: Date.now()
        };

        relation.copiedTrades.push(copyTrade);

        return copyTrade;
    }

    getCopyStats(followerId) {
        const relations = [];
        this.copyRelations.forEach((relation, id) => {
            if (relation.followerId === followerId) {
                const master = this.masterTraders.get(relation.masterId);
                relations.push({
                    masterId: relation.masterId,
                    masterName: master?.name,
                    status: relation.status,
                    copyAmount: relation.copyAmount,
                    copiedTrades: relation.copiedTrades.length,
                    profit: relation.profit.toFixed(2),
                    since: new Date(relation.startedAt).toISOString()
                });
            }
        });
        return relations;
    }

    getMasterLeaderboard(limit = 10) {
        const masters = Array.from(this.masterTraders.values())
            .filter(m => m.isPublic)
            .sort((a, b) => b.stats.totalProfit - a.stats.totalProfit)
            .slice(0, limit);

        return masters.map((m, index) => ({
            rank: index + 1,
            id: m.id,
            name: m.name,
            followers: m.followers.length,
            winRate: m.stats.winRate.toFixed(1) + '%',
            totalProfit: m.stats.totalProfit.toFixed(2),
            avgProfit: m.stats.avgProfit.toFixed(2),
            totalTrades: m.stats.totalTrades
        }));
    }

    // ==========================================
    // TRAILING ORDERS
    // ==========================================

    createTrailingStop(userId, config) {
        const {
            pair,
            side, // 'sell' for trailing stop loss, 'buy' for trailing stop buy
            quantity,
            trailingPercent = 2, // Trail by 2%
            activationPrice = null // Optional: only activate after reaching this price
        } = config;

        if (!pair || !side || !quantity) {
            return { success: false, error: 'pair, side, and quantity required' };
        }

        const orderId = `TRAIL_${userId}_${Date.now()}`;

        const order = {
            id: orderId,
            userId,
            pair,
            side,
            quantity,
            trailingPercent,
            activationPrice,
            isActivated: !activationPrice,
            highestPrice: null,
            lowestPrice: null,
            triggerPrice: null,
            status: 'active',
            createdAt: Date.now()
        };

        this.trailingOrders.set(orderId, order);
        this.stats.trailingOrdersActive++;

        return {
            success: true,
            order: {
                id: orderId,
                pair,
                side,
                quantity,
                trailingPercent: trailingPercent + '%',
                activationPrice,
                status: 'active'
            }
        };
    }

    updateTrailingOrder(orderId, currentPrice) {
        const order = this.trailingOrders.get(orderId);
        if (!order || order.status !== 'active') return null;

        // Check activation
        if (!order.isActivated && order.activationPrice) {
            if (order.side === 'sell' && currentPrice >= order.activationPrice) {
                order.isActivated = true;
            } else if (order.side === 'buy' && currentPrice <= order.activationPrice) {
                order.isActivated = true;
            }
        }

        if (!order.isActivated) return null;

        // Update trailing for sell (stop loss)
        if (order.side === 'sell') {
            if (!order.highestPrice || currentPrice > order.highestPrice) {
                order.highestPrice = currentPrice;
                order.triggerPrice = currentPrice * (1 - order.trailingPercent / 100);
            }

            // Check if triggered
            if (currentPrice <= order.triggerPrice) {
                order.status = 'triggered';
                order.triggeredAt = Date.now();
                order.executionPrice = currentPrice;
                this.stats.trailingOrdersActive--;

                return {
                    triggered: true,
                    order: {
                        id: order.id,
                        pair: order.pair,
                        side: 'sell',
                        quantity: order.quantity,
                        price: currentPrice,
                        highestPrice: order.highestPrice,
                        savedPercent: ((order.highestPrice - currentPrice) / order.highestPrice * 100).toFixed(2)
                    }
                };
            }
        }

        // Update trailing for buy
        if (order.side === 'buy') {
            if (!order.lowestPrice || currentPrice < order.lowestPrice) {
                order.lowestPrice = currentPrice;
                order.triggerPrice = currentPrice * (1 + order.trailingPercent / 100);
            }

            // Check if triggered
            if (currentPrice >= order.triggerPrice) {
                order.status = 'triggered';
                order.triggeredAt = Date.now();
                order.executionPrice = currentPrice;
                this.stats.trailingOrdersActive--;

                return {
                    triggered: true,
                    order: {
                        id: order.id,
                        pair: order.pair,
                        side: 'buy',
                        quantity: order.quantity,
                        price: currentPrice,
                        lowestPrice: order.lowestPrice
                    }
                };
            }
        }

        return { triggered: false, triggerPrice: order.triggerPrice };
    }

    getTrailingOrderStatus(orderId) {
        const order = this.trailingOrders.get(orderId);
        if (!order) return null;

        return {
            id: order.id,
            pair: order.pair,
            side: order.side,
            quantity: order.quantity,
            trailingPercent: order.trailingPercent + '%',
            status: order.status,
            isActivated: order.isActivated,
            highestPrice: order.highestPrice,
            lowestPrice: order.lowestPrice,
            triggerPrice: order.triggerPrice,
            createdAt: new Date(order.createdAt).toISOString()
        };
    }

    cancelTrailingOrder(orderId) {
        const order = this.trailingOrders.get(orderId);
        if (!order) return { success: false, error: 'Order not found' };

        order.status = 'cancelled';
        this.stats.trailingOrdersActive--;

        return { success: true, message: 'Trailing order cancelled' };
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    formatDuration(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    getStats() {
        return {
            ...this.stats,
            gridBots: this.gridBots.size,
            dcaPlans: this.dcaPlans.size,
            masterTraders: this.masterTraders.size,
            copyRelations: this.copyRelations.size,
            trailingOrders: this.trailingOrders.size
        };
    }

    // Process all active orders/bots with current prices
    processAll(markets) {
        const results = {
            gridExecutions: [],
            dcaExecutions: [],
            trailingTriggers: []
        };

        // Process grid bots
        this.gridBots.forEach((bot, botId) => {
            if (bot.status === 'active' && markets[bot.pair]) {
                const executions = this.updateGridBot(botId, markets[bot.pair].price);
                if (executions) results.gridExecutions.push(...executions);
            }
        });

        // Process DCA plans
        this.dcaPlans.forEach((plan, planId) => {
            if (plan.status === 'active' && markets[plan.pair]) {
                const execution = this.executeDCA(planId, markets[plan.pair].price);
                if (execution?.success) results.dcaExecutions.push(execution);
            }
        });

        // Process trailing orders
        this.trailingOrders.forEach((order, orderId) => {
            if (order.status === 'active' && markets[order.pair]) {
                const result = this.updateTrailingOrder(orderId, markets[order.pair].price);
                if (result?.triggered) results.trailingTriggers.push(result.order);
            }
        });

        return results;
    }
}

module.exports = { AdvancedTrading };
