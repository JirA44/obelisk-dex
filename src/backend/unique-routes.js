/**
 * OBELISK Unique Tools API Routes
 */

function setupUniqueRoutes(app, uniqueTools, markets, pricesBySource) {

    // ==========================================
    // OVERVIEW
    // ==========================================

    app.get('/api/unique', (req, res) => {
        res.json({
            tools: {
                liquidationSniper: 'Real-time liquidation detection & sniping',
                smartMoney: 'Track whale & institution wallets',
                arbitrage: 'Cross-DEX arbitrage scanner',
                rugDetector: 'Scam & rug pull detection',
                fundingArb: 'Funding rate arbitrage finder',
                socialSentiment: 'Twitter/Discord sentiment analysis',
                airdropHunter: 'Airdrop opportunity tracker',
                gasOptimizer: 'Best time to trade',
                stressTest: 'Portfolio crash simulation',
                aiSignals: 'AI-generated trade signals',
                insiderDetector: 'Insider activity alerts'
            },
            stats: uniqueTools.getStats()
        });
    });

    // ==========================================
    // LIQUIDATION SNIPER
    // ==========================================

    app.post('/api/unique/sniper/setup', (req, res) => {
        const { userId, pairs, minLiquidationSize, maxSlippage, autoExecute, budget } = req.body;
        res.json(uniqueTools.setupLiquidationSniper(userId, {
            pairs, minLiquidationSize, maxSlippage, autoExecute, budget
        }));
    });

    app.get('/api/unique/sniper/feed', (req, res) => {
        const limit = parseInt(req.query.limit) || 50;
        res.json(uniqueTools.getLiquidationFeed(limit));
    });

    app.get('/api/unique/sniper/:sniperId', (req, res) => {
        const config = uniqueTools.sniperConfigs.get(req.params.sniperId);
        if (!config) return res.status(404).json({ error: 'Sniper not found' });
        res.json(config);
    });

    // ==========================================
    // SMART MONEY TRACKER
    // ==========================================

    app.post('/api/unique/smartmoney/track', (req, res) => {
        const { userId, address, label, chain, alertOnTrade, alertOnTransfer, minTransactionSize } = req.body;
        res.json(uniqueTools.addTrackedWallet(userId, {
            address, label, chain, alertOnTrade, alertOnTransfer, minTransactionSize
        }));
    });

    app.get('/api/unique/smartmoney/feed', (req, res) => {
        const userId = req.query.userId || null;
        res.json(uniqueTools.getSmartMoneyFeed(userId));
    });

    app.get('/api/unique/smartmoney/trending', (req, res) => {
        res.json({ trending: uniqueTools.getSmartMoneyTrending() });
    });

    app.get('/api/unique/smartmoney/wallets/:userId', (req, res) => {
        const wallets = Array.from(uniqueTools.trackedWallets.values())
            .filter(w => w.userId === req.params.userId);
        res.json({ wallets });
    });

    // ==========================================
    // ARBITRAGE SCANNER
    // ==========================================

    app.get('/api/unique/arbitrage', (req, res) => {
        const minSpread = parseFloat(req.query.minSpread) || 0.1;
        // Scan avec les prix actuels
        uniqueTools.scanArbitrage(pricesBySource);
        res.json(uniqueTools.getArbOpportunities(minSpread));
    });

    app.get('/api/unique/arbitrage/best', (req, res) => {
        uniqueTools.scanArbitrage(pricesBySource);
        const opps = uniqueTools.getArbOpportunities(0.05);
        res.json({
            best: opps.opportunities.slice(0, 5),
            message: opps.opportunities.length > 0
                ? `Found ${opps.opportunities.length} opportunities`
                : 'No arbitrage opportunities at the moment'
        });
    });

    // ==========================================
    // RUG PULL DETECTOR
    // ==========================================

    app.post('/api/unique/rug/analyze', (req, res) => {
        const { tokenAddress, tokenData } = req.body;
        if (!tokenAddress || !tokenData) {
            return res.status(400).json({ error: 'tokenAddress and tokenData required' });
        }
        res.json(uniqueTools.analyzeToken(tokenAddress, tokenData));
    });

    app.get('/api/unique/rug/alerts', (req, res) => {
        const limit = parseInt(req.query.limit) || 50;
        res.json(uniqueTools.getRugAlerts(limit));
    });

    app.get('/api/unique/rug/check/:address', (req, res) => {
        const analysis = uniqueTools.scannedTokens.get(req.params.address);
        if (!analysis) {
            return res.status(404).json({ error: 'Token not analyzed yet' });
        }
        res.json(analysis);
    });

    // ==========================================
    // FUNDING RATE ARBITRAGE
    // ==========================================

    app.get('/api/unique/funding', (req, res) => {
        res.json(uniqueTools.getFundingOpportunities());
    });

    app.post('/api/unique/funding/update', (req, res) => {
        const { rates } = req.body;
        uniqueTools.updateFundingRates(rates);
        res.json({ success: true, opportunities: uniqueTools.fundingArbOpps.length });
    });

    // ==========================================
    // SOCIAL SENTIMENT
    // ==========================================

    app.get('/api/unique/social/trending', (req, res) => {
        res.json(uniqueTools.getSocialTrending());
    });

    app.get('/api/unique/social/:token', (req, res) => {
        const data = uniqueTools.socialMentions.get(req.params.token.toUpperCase());
        if (!data) {
            return res.json({ token: req.params.token, mentions: 0, score: 50, trend: 'unknown' });
        }
        res.json({
            token: req.params.token.toUpperCase(),
            score: data.score,
            trend: data.trend,
            mentions24h: data.volume24h,
            recentMentions: data.mentions.slice(-20)
        });
    });

    app.post('/api/unique/social/record', (req, res) => {
        const { token, source, text, author, followers, sentiment, engagement } = req.body;
        uniqueTools.recordSocialMention(token.toUpperCase(), {
            source, text, author, followers, sentiment, engagement
        });
        res.json({ success: true });
    });

    // ==========================================
    // AIRDROP HUNTER
    // ==========================================

    app.get('/api/unique/airdrops', (req, res) => {
        res.json(uniqueTools.getAirdropOpportunities());
    });

    app.post('/api/unique/airdrops/track', (req, res) => {
        const { userId, protocol, chain, criteria, estimatedValue, deadline } = req.body;
        res.json(uniqueTools.addAirdropTarget(userId, {
            protocol, chain, criteria, estimatedValue, deadline
        }));
    });

    app.post('/api/unique/airdrops/:targetId/complete', (req, res) => {
        const { task } = req.body;
        const result = uniqueTools.updateAirdropProgress(req.params.targetId, task);
        if (!result) return res.status(404).json({ error: 'Target not found' });
        res.json(result);
    });

    // ==========================================
    // GAS OPTIMIZER
    // ==========================================

    app.get('/api/unique/gas', (req, res) => {
        const chain = req.query.chain || 'ethereum';
        res.json(uniqueTools.getGasOptimization(chain));
    });

    app.get('/api/unique/gas/optimal', (req, res) => {
        res.json({
            ethereum: uniqueTools.getGasOptimization('ethereum'),
            arbitrum: uniqueTools.getGasOptimization('arbitrum'),
            polygon: uniqueTools.getGasOptimization('polygon')
        });
    });

    // ==========================================
    // PORTFOLIO STRESS TEST
    // ==========================================

    app.post('/api/unique/stress-test', (req, res) => {
        const { portfolio, scenarios } = req.body;
        if (!portfolio) {
            return res.status(400).json({ error: 'portfolio required' });
        }
        res.json(uniqueTools.runStressTest(portfolio, scenarios));
    });

    app.get('/api/unique/stress-test/:testId', (req, res) => {
        const result = uniqueTools.stressResults.get(req.params.testId);
        if (!result) return res.status(404).json({ error: 'Test not found' });
        res.json(result);
    });

    // ==========================================
    // AI SIGNALS
    // ==========================================

    app.get('/api/unique/signals', (req, res) => {
        const limit = parseInt(req.query.limit) || 20;
        res.json(uniqueTools.getAISignals(limit));
    });

    app.get('/api/unique/signals/:pair', (req, res) => {
        const pair = req.params.pair.replace('-', '/').toUpperCase();
        const marketData = markets[pair];

        if (!marketData) {
            return res.status(404).json({ error: 'Pair not found' });
        }

        // Simuler des indicateurs basiques
        const indicators = {
            price: marketData.price,
            volume: marketData.volume,
            change24h: marketData.change24h,
            rsi: 50 + marketData.change24h * 2, // Simplified
            macd: {
                macd: marketData.change24h > 0 ? 1 : -1,
                signal: 0,
                histogram: marketData.change24h > 0 ? 0.5 : -0.5
            },
            bb: {
                upper: marketData.high,
                lower: marketData.low,
                middle: (marketData.high + marketData.low) / 2
            }
        };

        res.json(uniqueTools.generateSignal(pair, { avgVolume: marketData.volume * 0.8 }, indicators));
    });

    // ==========================================
    // INSIDER DETECTOR
    // ==========================================

    app.get('/api/unique/insider/alerts', (req, res) => {
        const limit = parseInt(req.query.limit) || 30;
        res.json(uniqueTools.getInsiderAlerts(limit));
    });

    app.post('/api/unique/insider/analyze', (req, res) => {
        const { token, priceChange, volumeSpike, largeTransfers, exchangeInflows, socialSilence, upcomingEvent } = req.body;
        const alert = uniqueTools.detectInsiderActivity(token, {
            priceChange, volumeSpike, largeTransfers, exchangeInflows, socialSilence, upcomingEvent
        });
        res.json(alert || { message: 'No suspicious activity detected' });
    });

    console.log('[UNIQUE-ROUTES] All unique tool routes registered');
}

module.exports = { setupUniqueRoutes };
