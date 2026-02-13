/**
 * OBELISK Unique Tools
 * Fonctionnalités exclusives et innovantes
 */

class UniqueTools {
    constructor() {
        // Liquidation Sniper
        this.liquidationQueue = [];
        this.sniperConfigs = new Map();

        // Smart Money Tracker
        this.trackedWallets = new Map();
        this.smartMoneyAlerts = [];
        this.knownWhales = new Map();

        // Arbitrage Scanner
        this.arbOpportunities = [];
        this.arbHistory = [];

        // Rug Pull Detector
        this.scannedTokens = new Map();
        this.rugAlerts = [];

        // Funding Rate Arbitrage
        this.fundingRates = new Map();
        this.fundingArbOpps = [];

        // Social Sentiment (Twitter/Discord)
        this.socialMentions = new Map();
        this.trendingTokens = [];

        // Airdrop Hunter
        this.airdropTargets = new Map();
        this.eligibleAirdrops = [];

        // Gas Optimizer
        this.gasHistory = [];
        this.optimalWindows = [];

        // Portfolio Stress Test
        this.stressResults = new Map();

        // Token Sniffer (new launches)
        this.newTokens = [];
        this.tokenAlerts = new Map();

        // AI Signals
        this.aiSignals = [];
        this.signalAccuracy = { wins: 0, losses: 0 };

        // Insider Activity Detector
        this.insiderAlerts = [];

        console.log('[UNIQUE-TOOLS] Advanced tools initialized');
    }

    // ==========================================
    // LIQUIDATION SNIPER
    // Détecte et profite des liquidations
    // ==========================================

    setupLiquidationSniper(userId, config) {
        const {
            pairs = ['BTC/USDC', 'ETH/USDC'],
            minLiquidationSize = 10000,
            maxSlippage = 1,
            autoExecute = false,
            budget = 1000
        } = config;

        const sniperId = `SNIPER_${userId}_${Date.now()}`;

        this.sniperConfigs.set(sniperId, {
            id: sniperId,
            userId,
            pairs,
            minLiquidationSize,
            maxSlippage,
            autoExecute,
            budget,
            remainingBudget: budget,
            catches: [],
            profit: 0,
            active: true,
            createdAt: Date.now()
        });

        return {
            success: true,
            sniperId,
            message: 'Liquidation sniper armed',
            watching: pairs,
            minSize: `$${minLiquidationSize}`
        };
    }

    detectLiquidation(pair, data) {
        const { price, previousPrice, volume, openInterest } = data;

        // Détection basée sur le mouvement de prix et volume
        const priceMove = Math.abs((price - previousPrice) / previousPrice) * 100;
        const isLiquidation = priceMove > 2 && volume > 1000000;

        if (isLiquidation) {
            const liquidation = {
                id: `LIQ_${Date.now()}`,
                pair,
                direction: price < previousPrice ? 'LONG_LIQUIDATED' : 'SHORT_LIQUIDATED',
                priceMove: priceMove.toFixed(2) + '%',
                estimatedSize: (volume * 0.3).toFixed(0),
                price,
                timestamp: Date.now(),
                opportunity: price < previousPrice ? 'BUY_DIP' : 'SHORT_TOP'
            };

            this.liquidationQueue.push(liquidation);
            this.notifySnipers(liquidation);

            return liquidation;
        }
        return null;
    }

    notifySnipers(liquidation) {
        this.sniperConfigs.forEach((config, sniperId) => {
            if (!config.active) return;
            if (!config.pairs.includes(liquidation.pair)) return;
            if (parseFloat(liquidation.estimatedSize) < config.minLiquidationSize) return;

            config.catches.push({
                ...liquidation,
                action: config.autoExecute ? 'EXECUTED' : 'NOTIFIED'
            });
        });
    }

    getLiquidationFeed(limit = 50) {
        return {
            recent: this.liquidationQueue.slice(-limit).reverse(),
            stats: {
                total24h: this.liquidationQueue.filter(l =>
                    Date.now() - l.timestamp < 86400000
                ).length,
                totalVolume: this.liquidationQueue
                    .filter(l => Date.now() - l.timestamp < 86400000)
                    .reduce((sum, l) => sum + parseFloat(l.estimatedSize), 0)
            }
        };
    }

    // ==========================================
    // SMART MONEY TRACKER
    // Suit les wallets des whales/institutions
    // ==========================================

    addTrackedWallet(userId, walletConfig) {
        const {
            address,
            label,
            chain = 'ethereum',
            alertOnTrade = true,
            alertOnTransfer = true,
            minTransactionSize = 10000
        } = walletConfig;

        const trackerId = `TRACK_${address.slice(0, 8)}`;

        this.trackedWallets.set(trackerId, {
            id: trackerId,
            userId,
            address,
            label: label || 'Unknown Whale',
            chain,
            alertOnTrade,
            alertOnTransfer,
            minTransactionSize,
            transactions: [],
            pnl: 0,
            winRate: 0,
            addedAt: Date.now()
        });

        return {
            success: true,
            trackerId,
            message: `Now tracking ${label || address.slice(0, 10)}...`
        };
    }

    recordWalletActivity(address, activity) {
        const { type, token, amount, price, txHash } = activity;

        // Trouver tous les trackers pour cette adresse
        this.trackedWallets.forEach((tracker, id) => {
            if (tracker.address.toLowerCase() !== address.toLowerCase()) return;

            const tx = {
                id: `TX_${Date.now()}`,
                type,
                token,
                amount,
                value: amount * price,
                price,
                txHash,
                timestamp: Date.now()
            };

            if (tx.value < tracker.minTransactionSize) return;

            tracker.transactions.push(tx);

            const alert = {
                trackerId: id,
                wallet: tracker.label,
                ...tx,
                message: `${tracker.label} ${type} ${amount} ${token} ($${tx.value.toFixed(0)})`
            };

            this.smartMoneyAlerts.unshift(alert);
        });
    }

    getSmartMoneyFeed(userId = null) {
        let alerts = this.smartMoneyAlerts;
        if (userId) {
            const userTrackers = Array.from(this.trackedWallets.values())
                .filter(t => t.userId === userId)
                .map(t => t.id);
            alerts = alerts.filter(a => userTrackers.includes(a.trackerId));
        }

        return {
            alerts: alerts.slice(0, 100),
            trending: this.getSmartMoneyTrending()
        };
    }

    getSmartMoneyTrending() {
        // Agrège les mouvements des smart money par token
        const tokenMoves = {};

        this.smartMoneyAlerts
            .filter(a => Date.now() - a.timestamp < 3600000) // Dernière heure
            .forEach(a => {
                if (!tokenMoves[a.token]) {
                    tokenMoves[a.token] = { buys: 0, sells: 0, netFlow: 0 };
                }
                if (a.type === 'BUY') {
                    tokenMoves[a.token].buys += a.value;
                    tokenMoves[a.token].netFlow += a.value;
                } else {
                    tokenMoves[a.token].sells += a.value;
                    tokenMoves[a.token].netFlow -= a.value;
                }
            });

        return Object.entries(tokenMoves)
            .map(([token, data]) => ({
                token,
                ...data,
                signal: data.netFlow > 0 ? 'ACCUMULATING' : 'DISTRIBUTING'
            }))
            .sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow))
            .slice(0, 10);
    }

    // ==========================================
    // ARBITRAGE SCANNER
    // Trouve les opportunités cross-DEX
    // ==========================================

    scanArbitrage(pricesBySource) {
        const opportunities = [];

        Object.keys(pricesBySource.binance || {}).forEach(pair => {
            const prices = {};

            ['binance', 'coinbase', 'kraken', 'hyperliquid', 'dydx'].forEach(source => {
                if (pricesBySource[source]?.[pair]?.price) {
                    prices[source] = pricesBySource[source][pair].price;
                }
            });

            if (Object.keys(prices).length < 2) return;

            const priceList = Object.entries(prices);
            const minEntry = priceList.reduce((a, b) => a[1] < b[1] ? a : b);
            const maxEntry = priceList.reduce((a, b) => a[1] > b[1] ? a : b);

            const spread = ((maxEntry[1] - minEntry[1]) / minEntry[1]) * 100;

            if (spread > 0.1) { // Min 0.1% spread
                opportunities.push({
                    pair,
                    buyAt: minEntry[0],
                    buyPrice: minEntry[1],
                    sellAt: maxEntry[0],
                    sellPrice: maxEntry[1],
                    spread: spread.toFixed(3) + '%',
                    profitPer1000: ((spread / 100) * 1000).toFixed(2),
                    timestamp: Date.now()
                });
            }
        });

        this.arbOpportunities = opportunities
            .sort((a, b) => parseFloat(b.spread) - parseFloat(a.spread));

        return this.arbOpportunities;
    }

    getArbOpportunities(minSpread = 0.1) {
        return {
            opportunities: this.arbOpportunities.filter(o =>
                parseFloat(o.spread) >= minSpread
            ),
            lastScan: Date.now(),
            totalFound: this.arbOpportunities.length
        };
    }

    // ==========================================
    // RUG PULL DETECTOR
    // Analyse les tokens pour détecter les scams
    // ==========================================

    analyzeToken(tokenAddress, tokenData) {
        const {
            name,
            symbol,
            totalSupply,
            holders,
            liquidity,
            creatorBalance,
            isVerified,
            hasRenounced,
            buyTax,
            sellTax,
            maxWallet,
            honeypotCheck
        } = tokenData;

        let riskScore = 0;
        const redFlags = [];
        const warnings = [];

        // Vérifications critiques
        if (!isVerified) {
            riskScore += 30;
            redFlags.push('Contract not verified');
        }

        if (!hasRenounced) {
            riskScore += 20;
            warnings.push('Ownership not renounced');
        }

        if (creatorBalance > totalSupply * 0.1) {
            riskScore += 25;
            redFlags.push(`Creator holds ${(creatorBalance/totalSupply*100).toFixed(1)}% of supply`);
        }

        if (holders < 100) {
            riskScore += 15;
            warnings.push(`Only ${holders} holders`);
        }

        if (liquidity < 10000) {
            riskScore += 20;
            redFlags.push(`Low liquidity: $${liquidity}`);
        }

        if (sellTax > 10) {
            riskScore += 30;
            redFlags.push(`High sell tax: ${sellTax}%`);
        }

        if (honeypotCheck === false) {
            riskScore += 50;
            redFlags.push('HONEYPOT DETECTED');
        }

        if (maxWallet && maxWallet < 1) {
            riskScore += 10;
            warnings.push(`Max wallet: ${maxWallet}%`);
        }

        const analysis = {
            token: { address: tokenAddress, name, symbol },
            riskScore: Math.min(100, riskScore),
            riskLevel: riskScore >= 70 ? 'EXTREME' :
                       riskScore >= 50 ? 'HIGH' :
                       riskScore >= 30 ? 'MEDIUM' : 'LOW',
            redFlags,
            warnings,
            recommendation: riskScore >= 50 ? 'AVOID' :
                           riskScore >= 30 ? 'CAUTION' : 'OK',
            analyzedAt: Date.now()
        };

        this.scannedTokens.set(tokenAddress, analysis);

        if (riskScore >= 50) {
            this.rugAlerts.unshift(analysis);
        }

        return analysis;
    }

    getRugAlerts(limit = 50) {
        return {
            recentScams: this.rugAlerts.slice(0, limit),
            totalDetected: this.rugAlerts.length
        };
    }

    // ==========================================
    // FUNDING RATE ARBITRAGE
    // Exploite les différences de funding
    // ==========================================

    updateFundingRates(rates) {
        // rates = { 'BTC': { binance: 0.01, bybit: -0.005, dydx: 0.008 }, ... }
        Object.entries(rates).forEach(([symbol, exchangeRates]) => {
            this.fundingRates.set(symbol, {
                rates: exchangeRates,
                updatedAt: Date.now()
            });
        });

        this.findFundingArbOpps();
    }

    findFundingArbOpps() {
        this.fundingArbOpps = [];

        this.fundingRates.forEach((data, symbol) => {
            const rates = Object.entries(data.rates);
            if (rates.length < 2) return;

            const sorted = rates.sort((a, b) => a[1] - b[1]);
            const lowest = sorted[0];
            const highest = sorted[sorted.length - 1];
            const diff = highest[1] - lowest[1];

            if (Math.abs(diff) > 0.005) { // Min 0.5% difference
                this.fundingArbOpps.push({
                    symbol,
                    longAt: highest[1] > 0 ? lowest[0] : highest[0],
                    shortAt: highest[1] > 0 ? highest[0] : lowest[0],
                    fundingDiff: (diff * 100).toFixed(3) + '%',
                    annualizedReturn: (diff * 3 * 365 * 100).toFixed(1) + '%', // 3x daily
                    strategy: `Long ${symbol} on ${lowest[0]}, Short on ${highest[0]}`,
                    timestamp: Date.now()
                });
            }
        });

        this.fundingArbOpps.sort((a, b) =>
            parseFloat(b.annualizedReturn) - parseFloat(a.annualizedReturn)
        );
    }

    getFundingOpportunities() {
        return {
            opportunities: this.fundingArbOpps,
            rates: Object.fromEntries(this.fundingRates),
            nextFunding: this.getNextFundingTime()
        };
    }

    getNextFundingTime() {
        const now = new Date();
        const hours = now.getUTCHours();
        const nextFunding = [0, 8, 16].find(h => h > hours) || 24;
        const diff = nextFunding - hours;
        return `${diff}h ${60 - now.getUTCMinutes()}m`;
    }

    // ==========================================
    // SOCIAL SENTIMENT SCANNER
    // Analyse Twitter/Discord en temps réel
    // ==========================================

    recordSocialMention(token, data) {
        const { source, text, author, followers, sentiment, engagement } = data;

        if (!this.socialMentions.has(token)) {
            this.socialMentions.set(token, {
                mentions: [],
                score: 50,
                trend: 'stable',
                volume24h: 0
            });
        }

        const tokenData = this.socialMentions.get(token);
        tokenData.mentions.push({
            source,
            text: text.slice(0, 200),
            author,
            followers,
            sentiment, // -1 to 1
            engagement,
            timestamp: Date.now()
        });

        // Garder 24h de données
        tokenData.mentions = tokenData.mentions.filter(m =>
            Date.now() - m.timestamp < 86400000
        );

        // Calculer le score
        const recentMentions = tokenData.mentions.filter(m =>
            Date.now() - m.timestamp < 3600000
        );

        const avgSentiment = recentMentions.length > 0
            ? recentMentions.reduce((sum, m) => sum + m.sentiment, 0) / recentMentions.length
            : 0;

        tokenData.score = Math.round(50 + avgSentiment * 50);
        tokenData.volume24h = tokenData.mentions.length;
        tokenData.trend = this.calculateTrend(tokenData.mentions);

        this.updateTrendingTokens();
    }

    calculateTrend(mentions) {
        const hourAgo = mentions.filter(m => Date.now() - m.timestamp < 3600000).length;
        const twoHoursAgo = mentions.filter(m =>
            Date.now() - m.timestamp >= 3600000 &&
            Date.now() - m.timestamp < 7200000
        ).length;

        if (hourAgo > twoHoursAgo * 1.5) return 'exploding';
        if (hourAgo > twoHoursAgo) return 'rising';
        if (hourAgo < twoHoursAgo * 0.5) return 'falling';
        return 'stable';
    }

    updateTrendingTokens() {
        this.trendingTokens = Array.from(this.socialMentions.entries())
            .map(([token, data]) => ({
                token,
                score: data.score,
                mentions24h: data.volume24h,
                trend: data.trend,
                sentiment: data.score > 60 ? 'bullish' : data.score < 40 ? 'bearish' : 'neutral'
            }))
            .sort((a, b) => b.mentions24h - a.mentions24h)
            .slice(0, 20);
    }

    getSocialTrending() {
        return {
            trending: this.trendingTokens,
            exploding: this.trendingTokens.filter(t => t.trend === 'exploding'),
            timestamp: Date.now()
        };
    }

    // ==========================================
    // AIRDROP HUNTER
    // Trouve et track les airdrops potentiels
    // ==========================================

    addAirdropTarget(userId, config) {
        const {
            protocol,
            chain,
            criteria = [],
            estimatedValue,
            deadline
        } = config;

        const targetId = `AIRDROP_${protocol}_${Date.now()}`;

        this.airdropTargets.set(targetId, {
            id: targetId,
            userId,
            protocol,
            chain,
            criteria,
            estimatedValue,
            deadline,
            status: 'hunting',
            progress: 0,
            tasksCompleted: [],
            addedAt: Date.now()
        });

        return {
            success: true,
            targetId,
            protocol,
            criteria
        };
    }

    updateAirdropProgress(targetId, completedTask) {
        const target = this.airdropTargets.get(targetId);
        if (!target) return null;

        target.tasksCompleted.push({
            task: completedTask,
            completedAt: Date.now()
        });

        target.progress = (target.tasksCompleted.length / target.criteria.length) * 100;

        if (target.progress >= 100) {
            target.status = 'eligible';
            this.eligibleAirdrops.push(target);
        }

        return target;
    }

    getAirdropOpportunities() {
        // Airdrops populaires connus
        const knownAirdrops = [
            {
                protocol: 'LayerZero',
                chain: 'multi',
                criteria: ['Bridge 10+ times', 'Use 5+ chains', 'Hold NFT'],
                estimatedValue: '$500-5000',
                deadline: 'TBA',
                difficulty: 'Medium'
            },
            {
                protocol: 'zkSync',
                chain: 'zkSync Era',
                criteria: ['50+ transactions', '10+ unique contracts', 'Bridge ETH'],
                estimatedValue: '$1000-10000',
                deadline: 'TBA',
                difficulty: 'Easy'
            },
            {
                protocol: 'Scroll',
                chain: 'Scroll',
                criteria: ['Bridge assets', 'Use DEX', 'Provide liquidity'],
                estimatedValue: '$200-2000',
                deadline: 'TBA',
                difficulty: 'Easy'
            },
            {
                protocol: 'Berachain',
                chain: 'Berachain',
                criteria: ['Testnet participation', 'Social engagement'],
                estimatedValue: '$500-5000',
                deadline: 'Q1 2025',
                difficulty: 'Medium'
            }
        ];

        return {
            opportunities: knownAirdrops,
            userTargets: Array.from(this.airdropTargets.values()),
            eligible: this.eligibleAirdrops
        };
    }

    // ==========================================
    // GAS OPTIMIZER
    // Trouve le meilleur moment pour trader
    // ==========================================

    recordGasPrice(chain, gasPrice) {
        this.gasHistory.push({
            chain,
            gasPrice,
            timestamp: Date.now(),
            hour: new Date().getUTCHours(),
            dayOfWeek: new Date().getUTCDay()
        });

        // Garder 7 jours
        this.gasHistory = this.gasHistory.filter(g =>
            Date.now() - g.timestamp < 604800000
        );

        this.calculateOptimalWindows(chain);
    }

    calculateOptimalWindows(chain) {
        const chainData = this.gasHistory.filter(g => g.chain === chain);
        if (chainData.length < 100) return;

        // Moyenne par heure
        const hourlyAvg = {};
        for (let h = 0; h < 24; h++) {
            const hourData = chainData.filter(g => g.hour === h);
            if (hourData.length > 0) {
                hourlyAvg[h] = hourData.reduce((sum, g) => sum + g.gasPrice, 0) / hourData.length;
            }
        }

        // Trouver les 3 meilleures heures
        const sortedHours = Object.entries(hourlyAvg)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 3);

        this.optimalWindows = sortedHours.map(([hour, avgGas]) => ({
            chain,
            hour: parseInt(hour),
            hourUTC: `${hour}:00 UTC`,
            avgGas: avgGas.toFixed(2),
            savings: ((1 - avgGas / Math.max(...Object.values(hourlyAvg))) * 100).toFixed(1) + '%'
        }));
    }

    getGasOptimization(chain = 'ethereum') {
        const currentGas = this.gasHistory
            .filter(g => g.chain === chain)
            .slice(-1)[0]?.gasPrice || 0;

        const avgGas = this.gasHistory
            .filter(g => g.chain === chain && Date.now() - g.timestamp < 86400000)
            .reduce((sum, g, _, arr) => sum + g.gasPrice / arr.length, 0);

        return {
            chain,
            currentGas,
            avg24h: avgGas.toFixed(2),
            status: currentGas < avgGas * 0.8 ? 'LOW - Good time!' :
                    currentGas > avgGas * 1.2 ? 'HIGH - Wait' : 'NORMAL',
            optimalWindows: this.optimalWindows.filter(w => w.chain === chain),
            recommendation: currentGas < avgGas ? 'Execute now' : 'Wait for lower gas'
        };
    }

    // ==========================================
    // PORTFOLIO STRESS TEST
    // Simule des crashs de marché
    // ==========================================

    runStressTest(portfolio, scenarios = null) {
        const defaultScenarios = [
            { name: 'Market Crash -20%', btcDrop: -20, altMultiplier: 1.5 },
            { name: 'Black Swan -40%', btcDrop: -40, altMultiplier: 2 },
            { name: 'Flash Crash -60%', btcDrop: -60, altMultiplier: 2.5 },
            { name: 'Altcoin Winter', btcDrop: -30, altMultiplier: 3 },
            { name: 'Stablecoin Depeg', btcDrop: -10, stableDrop: -5 }
        ];

        const testScenarios = scenarios || defaultScenarios;
        const results = [];

        testScenarios.forEach(scenario => {
            let portfolioValue = 0;
            let scenarioValue = 0;
            const impacts = [];

            Object.entries(portfolio.holdings || {}).forEach(([token, data]) => {
                const value = data.value || data.amount * (data.price || 0);
                portfolioValue += value;

                let drop;
                if (['USDC', 'USDT', 'DAI'].includes(token)) {
                    drop = scenario.stableDrop || 0;
                } else if (token === 'BTC') {
                    drop = scenario.btcDrop;
                } else {
                    drop = scenario.btcDrop * scenario.altMultiplier;
                }

                const newValue = value * (1 + drop / 100);
                scenarioValue += newValue;

                impacts.push({
                    token,
                    originalValue: value.toFixed(2),
                    newValue: newValue.toFixed(2),
                    loss: (value - newValue).toFixed(2),
                    lossPercent: drop.toFixed(1) + '%'
                });
            });

            results.push({
                scenario: scenario.name,
                originalValue: portfolioValue.toFixed(2),
                stressedValue: scenarioValue.toFixed(2),
                totalLoss: (portfolioValue - scenarioValue).toFixed(2),
                lossPercent: ((1 - scenarioValue / portfolioValue) * 100).toFixed(1) + '%',
                impacts: impacts.sort((a, b) => parseFloat(b.loss) - parseFloat(a.loss)),
                survivability: scenarioValue > portfolioValue * 0.5 ? 'OK' : 'CRITICAL'
            });
        });

        const testId = `STRESS_${Date.now()}`;
        this.stressResults.set(testId, {
            id: testId,
            results,
            testedAt: Date.now()
        });

        return {
            testId,
            results,
            recommendation: this.getStressRecommendation(results)
        };
    }

    getStressRecommendation(results) {
        const avgLoss = results.reduce((sum, r) =>
            sum + parseFloat(r.lossPercent), 0) / results.length;

        if (avgLoss > 50) {
            return 'HIGH RISK: Consider adding stablecoins or reducing leverage';
        } else if (avgLoss > 30) {
            return 'MEDIUM RISK: Portfolio is volatile, consider hedging';
        }
        return 'LOW RISK: Portfolio is well-balanced';
    }

    // ==========================================
    // AI TRADE SIGNALS
    // Signaux générés par analyse
    // ==========================================

    generateSignal(pair, marketData, indicators) {
        const { price, volume, change24h, rsi, macd, bb } = indicators;

        let bullishScore = 0;
        let bearishScore = 0;
        const reasons = [];

        // RSI
        if (rsi < 30) { bullishScore += 25; reasons.push('RSI oversold'); }
        if (rsi > 70) { bearishScore += 25; reasons.push('RSI overbought'); }

        // MACD
        if (macd?.histogram > 0 && macd?.signal < macd?.macd) {
            bullishScore += 20;
            reasons.push('MACD bullish cross');
        }
        if (macd?.histogram < 0 && macd?.signal > macd?.macd) {
            bearishScore += 20;
            reasons.push('MACD bearish cross');
        }

        // Bollinger Bands
        if (bb && price < bb.lower) {
            bullishScore += 20;
            reasons.push('Below lower BB');
        }
        if (bb && price > bb.upper) {
            bearishScore += 20;
            reasons.push('Above upper BB');
        }

        // Volume
        if (volume > marketData.avgVolume * 2) {
            const bonus = change24h > 0 ? 15 : -15;
            if (bonus > 0) bullishScore += bonus;
            else bearishScore += Math.abs(bonus);
            reasons.push('High volume');
        }

        // Trend
        if (change24h > 5) { bullishScore += 10; reasons.push('Strong uptrend'); }
        if (change24h < -5) { bearishScore += 10; reasons.push('Strong downtrend'); }

        const totalScore = bullishScore - bearishScore;
        const confidence = Math.min(Math.abs(totalScore), 100);

        const signal = {
            id: `SIG_${Date.now()}`,
            pair,
            type: totalScore > 20 ? 'BUY' : totalScore < -20 ? 'SELL' : 'HOLD',
            strength: totalScore > 40 || totalScore < -40 ? 'STRONG' : 'MODERATE',
            confidence: confidence + '%',
            bullishScore,
            bearishScore,
            reasons,
            price,
            targets: totalScore > 20 ? {
                entry: price,
                takeProfit: price * 1.05,
                stopLoss: price * 0.97
            } : totalScore < -20 ? {
                entry: price,
                takeProfit: price * 0.95,
                stopLoss: price * 1.03
            } : null,
            timestamp: Date.now()
        };

        if (signal.type !== 'HOLD') {
            this.aiSignals.unshift(signal);
            if (this.aiSignals.length > 100) this.aiSignals.pop();
        }

        return signal;
    }

    getAISignals(limit = 20) {
        return {
            signals: this.aiSignals.slice(0, limit),
            accuracy: {
                ...this.signalAccuracy,
                winRate: this.signalAccuracy.wins + this.signalAccuracy.losses > 0
                    ? ((this.signalAccuracy.wins / (this.signalAccuracy.wins + this.signalAccuracy.losses)) * 100).toFixed(1) + '%'
                    : 'N/A'
            }
        };
    }

    // ==========================================
    // INSIDER ACTIVITY DETECTOR
    // Détecte les mouvements suspects
    // ==========================================

    detectInsiderActivity(token, data) {
        const {
            priceChange,
            volumeSpike,
            largeTransfers,
            exchangeInflows,
            socialSilence,
            upcomingEvent
        } = data;

        let suspicionScore = 0;
        const indicators = [];

        // Volume anormal sans news
        if (volumeSpike > 500 && socialSilence) {
            suspicionScore += 30;
            indicators.push('Unusual volume with no social activity');
        }

        // Gros transferts vers exchanges avant annonce
        if (largeTransfers > 1000000 && upcomingEvent) {
            suspicionScore += 40;
            indicators.push('Large transfers before scheduled event');
        }

        // Inflows massifs sur exchanges
        if (exchangeInflows > 5000000) {
            suspicionScore += 25;
            indicators.push('Massive exchange inflows');
        }

        // Prix monte sans raison
        if (priceChange > 20 && socialSilence) {
            suspicionScore += 35;
            indicators.push('Price surge with no catalyst');
        }

        if (suspicionScore > 30) {
            const alert = {
                id: `INSIDER_${Date.now()}`,
                token,
                suspicionScore,
                level: suspicionScore > 60 ? 'HIGH' : 'MODERATE',
                indicators,
                recommendation: suspicionScore > 60
                    ? 'Potential insider activity - be cautious'
                    : 'Monitor closely',
                timestamp: Date.now()
            };

            this.insiderAlerts.unshift(alert);
            return alert;
        }

        return null;
    }

    getInsiderAlerts(limit = 30) {
        return {
            alerts: this.insiderAlerts.slice(0, limit),
            total: this.insiderAlerts.length
        };
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    getStats() {
        return {
            liquidationSniper: {
                activeSnipers: this.sniperConfigs.size,
                recentLiquidations: this.liquidationQueue.length
            },
            smartMoney: {
                trackedWallets: this.trackedWallets.size,
                recentAlerts: this.smartMoneyAlerts.length
            },
            arbitrage: {
                opportunities: this.arbOpportunities.length
            },
            rugDetector: {
                scanned: this.scannedTokens.size,
                rugsDetected: this.rugAlerts.length
            },
            social: {
                tokensTracked: this.socialMentions.size,
                trending: this.trendingTokens.length
            },
            airdrops: {
                targets: this.airdropTargets.size,
                eligible: this.eligibleAirdrops.length
            },
            aiSignals: {
                generated: this.aiSignals.length,
                accuracy: this.signalAccuracy
            }
        };
    }
}

module.exports = { UniqueTools };
