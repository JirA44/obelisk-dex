/**
 * OBELISK Advanced Tools API Routes
 * Grid Trading, DCA, Copy Trading, Analytics, Automation, Portfolio
 */

function setupToolsRoutes(app, modules, markets) {
    const { advancedTrading, analytics, automation, portfolio } = modules;

    // Helper to get current prices
    const getCurrentPrices = () => {
        const prices = { USDC: 1, USDT: 1 };
        Object.entries(markets).forEach(([pair, data]) => {
            const [base] = pair.split('/');
            prices[base] = data.price;
        });
        return prices;
    };

    // ==========================================
    // ADVANCED TRADING ROUTES
    // ==========================================

    // Get all trading tools info
    app.get('/api/tools', (req, res) => {
        res.json({
            modules: {
                advancedTrading: advancedTrading.getStats(),
                analytics: analytics.getStats(),
                automation: automation.getStats(),
                portfolio: portfolio.getStats()
            },
            endpoints: {
                gridTrading: '/api/grid/*',
                dca: '/api/dca/*',
                copyTrading: '/api/copy/*',
                trailing: '/api/trailing/*',
                analytics: '/api/analytics/*',
                automation: '/api/automation/*',
                portfolio: '/api/portfolio/*'
            }
        });
    });

    // --- GRID TRADING ---

    app.post('/api/grid/create', (req, res) => {
        const { userId, pair, lowerPrice, upperPrice, gridLevels, investmentAmount, type } = req.body;
        const result = advancedTrading.createGridBot(userId, {
            pair, lowerPrice, upperPrice, gridLevels, investmentAmount, type
        });
        res.json(result);
    });

    app.get('/api/grid/:botId', (req, res) => {
        const status = advancedTrading.getGridBotStatus(req.params.botId);
        if (!status) return res.status(404).json({ error: 'Bot not found' });
        res.json(status);
    });

    app.post('/api/grid/:botId/stop', (req, res) => {
        res.json(advancedTrading.stopGridBot(req.params.botId));
    });

    app.get('/api/grid/user/:userId', (req, res) => {
        const bots = [];
        advancedTrading.gridBots.forEach((bot, id) => {
            if (bot.userId === req.params.userId) {
                bots.push(advancedTrading.getGridBotStatus(id));
            }
        });
        res.json({ bots });
    });

    // --- DCA ---

    app.post('/api/dca/create', (req, res) => {
        const { userId, pair, amount, frequency, totalPurchases } = req.body;
        const result = advancedTrading.createDCAPlan(userId, {
            pair, amount, frequency, totalPurchases
        });
        res.json(result);
    });

    app.get('/api/dca/:planId', (req, res) => {
        const status = advancedTrading.getDCAPlanStatus(req.params.planId);
        if (!status) return res.status(404).json({ error: 'Plan not found' });
        res.json(status);
    });

    app.post('/api/dca/:planId/toggle', (req, res) => {
        res.json(advancedTrading.pauseDCAPlan(req.params.planId));
    });

    app.get('/api/dca/user/:userId', (req, res) => {
        const plans = [];
        advancedTrading.dcaPlans.forEach((plan, id) => {
            if (plan.userId === req.params.userId) {
                plans.push(advancedTrading.getDCAPlanStatus(id));
            }
        });
        res.json({ plans });
    });

    // --- COPY TRADING ---

    app.post('/api/copy/register', (req, res) => {
        const { userId, name, description, minCopyAmount } = req.body;
        res.json(advancedTrading.registerMasterTrader(userId, { name, description, minCopyAmount }));
    });

    app.post('/api/copy/follow', (req, res) => {
        const { followerId, masterId, copyAmount, copyPercentage, maxLoss } = req.body;
        res.json(advancedTrading.startCopying(followerId, masterId, { copyAmount, copyPercentage, maxLoss }));
    });

    app.get('/api/copy/leaderboard', (req, res) => {
        const limit = parseInt(req.query.limit) || 10;
        res.json({ leaderboard: advancedTrading.getMasterLeaderboard(limit) });
    });

    app.get('/api/copy/stats/:userId', (req, res) => {
        res.json({ relations: advancedTrading.getCopyStats(req.params.userId) });
    });

    // --- TRAILING ORDERS ---

    app.post('/api/trailing/create', (req, res) => {
        const { userId, pair, side, quantity, trailingPercent, activationPrice } = req.body;
        res.json(advancedTrading.createTrailingStop(userId, {
            pair, side, quantity, trailingPercent, activationPrice
        }));
    });

    app.get('/api/trailing/:orderId', (req, res) => {
        const status = advancedTrading.getTrailingOrderStatus(req.params.orderId);
        if (!status) return res.status(404).json({ error: 'Order not found' });
        res.json(status);
    });

    app.delete('/api/trailing/:orderId', (req, res) => {
        res.json(advancedTrading.cancelTrailingOrder(req.params.orderId));
    });

    // ==========================================
    // ANALYTICS ROUTES
    // ==========================================

    // --- PNL ---

    app.post('/api/analytics/pnl/trade', (req, res) => {
        const { userId, pair, side, price, quantity, fee } = req.body;
        res.json(analytics.recordTrade(userId, { pair, side, price, quantity, fee }));
    });

    app.get('/api/analytics/pnl/:userId', (req, res) => {
        const prices = getCurrentPrices();
        res.json(analytics.getPnLSummary(req.params.userId, prices));
    });

    app.get('/api/analytics/pnl/:userId/history', (req, res) => {
        const period = req.query.period || '7d';
        res.json(analytics.getPnLHistory(req.params.userId, period));
    });

    // --- HEATMAPS ---

    app.get('/api/analytics/heatmap/price', (req, res) => {
        const period = req.query.period || '24h';
        res.json(analytics.getPriceHeatmap(period));
    });

    app.get('/api/analytics/heatmap/volume/:pair', (req, res) => {
        const pair = req.params.pair.replace('-', '/').toUpperCase();
        const heatmap = analytics.getVolumeHeatmap(pair);
        if (!heatmap) return res.status(404).json({ error: 'No data' });
        res.json(heatmap);
    });

    app.get('/api/analytics/correlations', (req, res) => {
        res.json({ matrix: analytics.correlationMatrix });
    });

    // --- WHALE ALERTS ---

    app.get('/api/analytics/whales', (req, res) => {
        const { limit, pair, minValue, since } = req.query;
        res.json(analytics.getWhaleAlerts({
            limit: parseInt(limit) || 50,
            pair,
            minValue: parseFloat(minValue) || 0,
            since: parseInt(since) || 0
        }));
    });

    app.get('/api/analytics/whales/stats', (req, res) => {
        const period = req.query.period || '24h';
        res.json(analytics.getWhaleStats(period));
    });

    app.post('/api/analytics/whales/subscribe', (req, res) => {
        const { userId, minValue, pairs } = req.body;
        res.json(analytics.subscribeToWhaleAlerts(userId, { minValue, pairs }));
    });

    // --- SENTIMENT ---

    app.get('/api/analytics/sentiment/:pair', (req, res) => {
        const pair = req.params.pair.replace('-', '/').toUpperCase();
        res.json(analytics.getSentiment(pair));
    });

    app.get('/api/analytics/fear-greed', (req, res) => {
        res.json(analytics.getFearGreedIndex());
    });

    app.get('/api/analytics/overview', (req, res) => {
        const prices = getCurrentPrices();
        res.json(analytics.getMarketOverview(Object.keys(markets), prices));
    });

    // ==========================================
    // AUTOMATION ROUTES
    // ==========================================

    // --- BOTS ---

    app.get('/api/automation/templates', (req, res) => {
        res.json({ templates: automation.getBotTemplates() });
    });

    app.post('/api/automation/bot/create', (req, res) => {
        const { userId, name, template, pair, parameters } = req.body;
        res.json(automation.createBot(userId, { name, template, pair, parameters }));
    });

    app.get('/api/automation/bot/:botId', (req, res) => {
        const status = automation.getBotStatus(req.params.botId);
        if (!status) return res.status(404).json({ error: 'Bot not found' });
        res.json(status);
    });

    app.post('/api/automation/bot/:botId/toggle', (req, res) => {
        const { enabled } = req.body;
        res.json(automation.toggleBot(req.params.botId, enabled));
    });

    app.get('/api/automation/bots/:userId', (req, res) => {
        const bots = [];
        automation.bots.forEach((bot, id) => {
            if (bot.userId === req.params.userId) {
                bots.push(automation.getBotStatus(id));
            }
        });
        res.json({ bots });
    });

    // --- ALERTS ---

    app.post('/api/automation/alert/create', (req, res) => {
        const { userId, pair, condition, price, repeat, webhook, message } = req.body;
        res.json(automation.createAlert(userId, { pair, condition, price, repeat, webhook, message }));
    });

    app.get('/api/automation/alerts/:userId', (req, res) => {
        res.json({ alerts: automation.getAlerts(req.params.userId) });
    });

    app.delete('/api/automation/alert/:alertId', (req, res) => {
        res.json(automation.deleteAlert(req.params.alertId));
    });

    // --- WEBHOOKS ---

    app.post('/api/automation/webhook/register', (req, res) => {
        const { userId, name, url, events, secret } = req.body;
        res.json(automation.registerWebhook(userId, { name, url, events, secret }));
    });

    app.get('/api/automation/webhooks/:userId', (req, res) => {
        res.json({ webhooks: automation.getWebhooks(req.params.userId) });
    });

    app.post('/api/automation/webhook/:webhookId/toggle', (req, res) => {
        const { enabled } = req.body;
        res.json(automation.toggleWebhook(req.params.webhookId, enabled));
    });

    // --- SCHEDULED TASKS ---

    app.post('/api/automation/task/schedule', (req, res) => {
        const { userId, name, action, schedule, parameters } = req.body;
        res.json(automation.scheduleTask(userId, { name, action, schedule, parameters }));
    });

    app.get('/api/automation/tasks/:userId', (req, res) => {
        res.json({ tasks: automation.getTasks(req.params.userId) });
    });

    // ==========================================
    // PORTFOLIO ROUTES
    // ==========================================

    // --- PORTFOLIO MANAGEMENT ---

    app.post('/api/portfolio/create', (req, res) => {
        const { userId, name } = req.body;
        res.json(portfolio.createPortfolio(userId, name));
    });

    app.get('/api/portfolio/:portfolioId', (req, res) => {
        const prices = getCurrentPrices();
        const overview = portfolio.getPortfolioOverview(req.params.portfolioId, prices);
        if (!overview) return res.status(404).json({ error: 'Portfolio not found' });
        res.json(overview);
    });

    app.get('/api/portfolio/user/:userId', (req, res) => {
        res.json({ portfolios: portfolio.getUserPortfolios(req.params.userId) });
    });

    // --- WALLETS ---

    app.post('/api/portfolio/:portfolioId/wallet', (req, res) => {
        const { address, chain, label, trackNFTs } = req.body;
        res.json(portfolio.addWallet(req.params.portfolioId, { address, chain, label, trackNFTs }));
    });

    app.post('/api/portfolio/wallet/:walletId/sync', (req, res) => {
        const { balances } = req.body;
        res.json(portfolio.updateWalletBalances(req.params.walletId, balances));
    });

    // --- PERFORMANCE ---

    app.get('/api/portfolio/:portfolioId/performance', (req, res) => {
        const period = req.query.period || '30d';
        res.json(portfolio.getPerformanceHistory(req.params.portfolioId, period));
    });

    app.post('/api/portfolio/:portfolioId/snapshot', (req, res) => {
        const prices = getCurrentPrices();
        const snapshot = portfolio.takeSnapshot(req.params.portfolioId, prices);
        if (!snapshot) return res.status(404).json({ error: 'Portfolio not found' });
        res.json({ success: true, snapshot });
    });

    // --- REBALANCING ---

    app.post('/api/portfolio/:portfolioId/rebalance/config', (req, res) => {
        const { targetAllocation, threshold, frequency } = req.body;
        res.json(portfolio.setRebalanceConfig(req.params.portfolioId, {
            targetAllocation, threshold, frequency
        }));
    });

    app.get('/api/portfolio/:portfolioId/rebalance/check', (req, res) => {
        const prices = getCurrentPrices();
        res.json(portfolio.checkRebalanceNeeded(req.params.portfolioId, prices));
    });

    app.get('/api/portfolio/:portfolioId/rebalance/calculate', (req, res) => {
        const prices = getCurrentPrices();
        const trades = portfolio.calculateRebalanceTrades(req.params.portfolioId, prices);
        if (!trades) return res.status(404).json({ error: 'Not found' });
        res.json(trades);
    });

    app.post('/api/portfolio/:portfolioId/rebalance/execute', (req, res) => {
        const { trades } = req.body;
        const prices = getCurrentPrices();
        res.json(portfolio.executeRebalance(req.params.portfolioId, trades, prices));
    });

    app.get('/api/portfolio/:portfolioId/rebalance/history', (req, res) => {
        const limit = parseInt(req.query.limit) || 10;
        res.json({ history: portfolio.getRebalanceHistory(req.params.portfolioId, limit) });
    });

    // --- TAX REPORTING ---

    app.post('/api/portfolio/tax/event', (req, res) => {
        const { userId, type, token, amount, costBasis, proceeds, timestamp, txHash } = req.body;
        res.json(portfolio.recordTaxEvent(userId, {
            type, token, amount, costBasis, proceeds, timestamp, txHash
        }));
    });

    app.get('/api/portfolio/tax/:userId/:year', (req, res) => {
        const year = parseInt(req.params.year);
        const format = req.query.format || 'summary';
        res.json(portfolio.generateTaxReport(req.params.userId, year, format));
    });

    app.get('/api/portfolio/tax/:userId/:year/export', (req, res) => {
        const year = parseInt(req.params.year);
        const format = req.query.format || 'csv';
        const data = portfolio.exportTaxData(req.params.userId, year, format);

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${data.filename}`);
            res.send(data.content);
        } else {
            res.json(data);
        }
    });

    app.get('/api/portfolio/tax/:userId/gains', (req, res) => {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const method = req.query.method || 'FIFO';
        res.json(portfolio.calculateCapitalGains(req.params.userId, year, method));
    });

    console.log('[TOOLS] All advanced trading routes registered');
}

module.exports = { setupToolsRoutes };
