/**
 * Obelisk DEX - AI Portfolio Advisor
 *
 * Intelligent on-chain analysis and personalized recommendations.
 *
 * Features:
 * - Portfolio risk analysis
 * - Impermanent loss calculator
 * - Yield optimization suggestions
 * - Whale/smart money tracking
 * - Market sentiment analysis
 * - Tax-loss harvesting opportunities
 * - Rebalancing suggestions
 */

const AIAdvisor = {
    // Risk profiles
    RISK_PROFILES: {
        CONSERVATIVE: { maxVolatility: 15, stableRatio: 0.5, maxSingleAsset: 0.3 },
        MODERATE: { maxVolatility: 30, stableRatio: 0.3, maxSingleAsset: 0.4 },
        AGGRESSIVE: { maxVolatility: 60, stableRatio: 0.1, maxSingleAsset: 0.5 },
        DEGEN: { maxVolatility: 100, stableRatio: 0, maxSingleAsset: 1 }
    },

    // Asset categories
    CATEGORIES: {
        STABLE: ['USDC', 'USDT', 'DAI', 'FRAX', 'LUSD'],
        BLUE_CHIP: ['ETH', 'BTC', 'WBTC'],
        LARGE_CAP: ['SOL', 'AVAX', 'MATIC', 'ARB', 'OP'],
        DEFI: ['UNI', 'AAVE', 'LDO', 'MKR', 'CRV'],
        MEME: ['DOGE', 'SHIB', 'PEPE', 'WIF']
    },

    /**
     * Analyze portfolio and generate comprehensive report
     */
    async analyzePortfolio(wallet) {
        const holdings = await this.getHoldings(wallet);
        const prices = await this.getPrices(holdings);
        const totalValue = this.calculateTotalValue(holdings, prices);

        const analysis = {
            timestamp: Date.now(),
            walletAddress: wallet.address,
            totalValue: totalValue,

            // Risk metrics
            riskScore: this.calculateRiskScore(holdings, prices),
            volatility: this.calculateVolatility(holdings, prices),
            diversificationScore: this.calculateDiversification(holdings),
            concentrationRisk: this.getConcentrationRisk(holdings, totalValue),

            // Allocation breakdown
            allocation: this.getAllocationBreakdown(holdings, prices, totalValue),

            // Performance
            performance: await this.getPerformanceMetrics(wallet, holdings),

            // Health indicators
            healthIndicators: this.getHealthIndicators(holdings, prices),

            // Recommendations
            recommendations: await this.generateRecommendations(holdings, prices, totalValue),

            // Opportunities
            opportunities: await this.findOpportunities(holdings, prices),

            // Risks
            risks: this.identifyRisks(holdings, prices)
        };

        return analysis;
    },

    /**
     * Get wallet holdings (simulated - connect to real APIs in production)
     */
    async getHoldings(wallet) {
        // In production, query blockchain/APIs for actual holdings
        // Demo holdings
        return [
            { token: 'ETH', amount: 2.5, category: 'BLUE_CHIP' },
            { token: 'USDC', amount: 5000, category: 'STABLE' },
            { token: 'WBTC', amount: 0.1, category: 'BLUE_CHIP' },
            { token: 'ARB', amount: 1000, category: 'LARGE_CAP' },
            { token: 'UNI', amount: 50, category: 'DEFI' }
        ];
    },

    /**
     * Get current prices
     */
    async getPrices(holdings) {
        const prices = {};
        for (const holding of holdings) {
            prices[holding.token] = PriceService?.prices[holding.token]?.price ||
                this.getDefaultPrice(holding.token);
        }
        return prices;
    },

    /**
     * Default prices fallback
     */
    getDefaultPrice(token) {
        const defaults = {
            ETH: 3500, WBTC: 100000, BTC: 100000, USDC: 1, USDT: 1, DAI: 1,
            ARB: 1.2, OP: 2.5, MATIC: 0.5, SOL: 200, UNI: 12, AAVE: 300
        };
        return defaults[token] || 1;
    },

    /**
     * Calculate total portfolio value
     */
    calculateTotalValue(holdings, prices) {
        return holdings.reduce((total, h) => total + (h.amount * prices[h.token]), 0);
    },

    /**
     * Calculate portfolio risk score (1-100)
     */
    calculateRiskScore(holdings, prices) {
        let riskScore = 50; // Base score

        const volatilities = {
            STABLE: 0.1, BLUE_CHIP: 0.4, LARGE_CAP: 0.6, DEFI: 0.7, MEME: 1
        };

        // Weight by allocation
        const total = this.calculateTotalValue(holdings, prices);
        for (const holding of holdings) {
            const weight = (holding.amount * prices[holding.token]) / total;
            const volatility = volatilities[holding.category] || 0.5;
            riskScore += (volatility - 0.5) * weight * 50;
        }

        return Math.max(1, Math.min(100, Math.round(riskScore)));
    },

    /**
     * Calculate portfolio volatility
     */
    calculateVolatility(holdings, prices) {
        // Simplified - use historical data in production
        const categoryVolatility = {
            STABLE: 2, BLUE_CHIP: 45, LARGE_CAP: 65, DEFI: 75, MEME: 150
        };

        const total = this.calculateTotalValue(holdings, prices);
        let weightedVol = 0;

        for (const holding of holdings) {
            const weight = (holding.amount * prices[holding.token]) / total;
            weightedVol += weight * (categoryVolatility[holding.category] || 50);
        }

        return Math.round(weightedVol);
    },

    /**
     * Calculate diversification score
     */
    calculateDiversification(holdings) {
        const uniqueCategories = new Set(holdings.map(h => h.category));
        const categoryScore = (uniqueCategories.size / 5) * 50; // Max 5 categories

        const assetScore = Math.min(holdings.length / 10, 1) * 50; // Up to 10 assets

        return Math.round(categoryScore + assetScore);
    },

    /**
     * Get concentration risk
     */
    getConcentrationRisk(holdings, totalValue) {
        const risks = [];

        for (const holding of holdings) {
            const value = holding.amount * (PriceService?.prices[holding.token]?.price || 1);
            const percentage = (value / totalValue) * 100;

            if (percentage > 50) {
                risks.push({
                    token: holding.token,
                    percentage: percentage,
                    severity: 'high',
                    message: `${holding.token} represents ${percentage.toFixed(1)}% of portfolio - extreme concentration risk`
                });
            } else if (percentage > 30) {
                risks.push({
                    token: holding.token,
                    percentage: percentage,
                    severity: 'medium',
                    message: `${holding.token} represents ${percentage.toFixed(1)}% - consider diversifying`
                });
            }
        }

        return risks;
    },

    /**
     * Get allocation breakdown
     */
    getAllocationBreakdown(holdings, prices, totalValue) {
        const byCategory = {};
        const byAsset = {};

        for (const holding of holdings) {
            const value = holding.amount * prices[holding.token];
            const percentage = (value / totalValue) * 100;

            byAsset[holding.token] = {
                amount: holding.amount,
                value: value,
                percentage: percentage
            };

            if (!byCategory[holding.category]) {
                byCategory[holding.category] = { value: 0, percentage: 0, assets: [] };
            }
            byCategory[holding.category].value += value;
            byCategory[holding.category].percentage += percentage;
            byCategory[holding.category].assets.push(holding.token);
        }

        return { byCategory, byAsset };
    },

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(wallet, holdings) {
        // In production, calculate from historical transactions
        return {
            day: { change: 2.5, changePercent: 0.8 },
            week: { change: -150, changePercent: -1.2 },
            month: { change: 800, changePercent: 6.5 },
            year: { change: 5000, changePercent: 45 },
            allTime: { change: 8000, changePercent: 120 }
        };
    },

    /**
     * Get health indicators
     */
    getHealthIndicators(holdings, prices) {
        const indicators = [];

        // Check stablecoin ratio
        const total = this.calculateTotalValue(holdings, prices);
        const stableValue = holdings
            .filter(h => this.CATEGORIES.STABLE.includes(h.token))
            .reduce((sum, h) => sum + h.amount * prices[h.token], 0);
        const stableRatio = stableValue / total;

        if (stableRatio < 0.1) {
            indicators.push({
                type: 'warning',
                message: 'Low stablecoin reserves',
                detail: `Only ${(stableRatio * 100).toFixed(1)}% in stables - consider holding some for opportunities`
            });
        } else if (stableRatio > 0.5) {
            indicators.push({
                type: 'info',
                message: 'High cash position',
                detail: `${(stableRatio * 100).toFixed(1)}% in stables - look for deployment opportunities`
            });
        }

        // Check for depeg risks (stables)
        for (const holding of holdings) {
            if (this.CATEGORIES.STABLE.includes(holding.token)) {
                const price = prices[holding.token];
                if (Math.abs(price - 1) > 0.01) {
                    indicators.push({
                        type: 'alert',
                        message: `${holding.token} depeg detected`,
                        detail: `Trading at $${price.toFixed(4)} - monitor closely`
                    });
                }
            }
        }

        return indicators;
    },

    /**
     * Generate AI recommendations
     */
    async generateRecommendations(holdings, prices, totalValue) {
        const recommendations = [];
        const allocation = this.getAllocationBreakdown(holdings, prices, totalValue);

        // Diversification recommendations
        if (!allocation.byCategory.STABLE || allocation.byCategory.STABLE.percentage < 10) {
            recommendations.push({
                priority: 'high',
                type: 'diversify',
                title: 'Add Stablecoin Reserve',
                description: 'Consider allocating 10-20% to stablecoins for safety and opportunity',
                action: {
                    type: 'swap',
                    suggestion: `Swap 10% of holdings to USDC`
                }
            });
        }

        // Yield opportunities
        const stableHoldings = holdings.filter(h => this.CATEGORIES.STABLE.includes(h.token));
        if (stableHoldings.length > 0) {
            const totalStable = stableHoldings.reduce((s, h) => s + h.amount, 0);
            if (totalStable > 1000) {
                recommendations.push({
                    priority: 'medium',
                    type: 'yield',
                    title: 'Earn Yield on Stables',
                    description: `Your $${totalStable.toFixed(0)} in stables could earn 5-8% APY`,
                    action: {
                        type: 'deposit',
                        protocol: 'Aave',
                        expectedApy: '5.2%'
                    }
                });
            }
        }

        // Rebalancing
        const blueChipPercentage = allocation.byCategory.BLUE_CHIP?.percentage || 0;
        if (blueChipPercentage < 30) {
            recommendations.push({
                priority: 'medium',
                type: 'rebalance',
                title: 'Increase Blue-Chip Allocation',
                description: 'Consider increasing ETH/BTC allocation to 40-60% for stability',
                action: {
                    type: 'swap',
                    suggestion: 'Increase ETH position'
                }
            });
        }

        // Tax-loss harvesting (if negative positions)
        // Would need cost basis tracking in production
        recommendations.push({
            priority: 'low',
            type: 'tax',
            title: 'Review Tax Strategy',
            description: 'Consider tax-loss harvesting if you have losing positions',
            action: {
                type: 'info',
                suggestion: 'Connect tax tracking service'
            }
        });

        // DCA suggestion
        recommendations.push({
            priority: 'medium',
            type: 'strategy',
            title: 'Setup DCA Strategy',
            description: 'Dollar-cost averaging reduces timing risk',
            action: {
                type: 'dca',
                suggestion: 'Setup weekly DCA into ETH'
            }
        });

        return recommendations.sort((a, b) => {
            const priority = { high: 0, medium: 1, low: 2 };
            return priority[a.priority] - priority[b.priority];
        });
    },

    /**
     * Find opportunities
     */
    async findOpportunities(holdings, prices) {
        const opportunities = [];

        // Arbitrage opportunities from scanner
        if (window.ArbitrageScanner?.opportunities?.length > 0) {
            const bestArb = ArbitrageScanner.opportunities[0];
            if (bestArb.profitPercent > 0.5) {
                opportunities.push({
                    type: 'arbitrage',
                    title: `${bestArb.tokenA}/${bestArb.tokenB} Arbitrage`,
                    description: `${bestArb.profitPercent.toFixed(2)}% profit opportunity`,
                    expectedProfit: `$${bestArb.profitUSD.toFixed(2)}`,
                    risk: bestArb.risk,
                    action: 'View in Arbitrage Scanner'
                });
            }
        }

        // Yield opportunities
        opportunities.push({
            type: 'yield',
            title: 'Aave USDC Lending',
            description: 'Supply USDC to Aave for passive yield',
            expectedProfit: '5.2% APY',
            risk: 'low',
            action: 'Deposit'
        });

        opportunities.push({
            type: 'yield',
            title: 'ETH Staking via Lido',
            description: 'Stake ETH and receive stETH',
            expectedProfit: '3.8% APY',
            risk: 'low',
            action: 'Stake'
        });

        // Liquidity provision
        opportunities.push({
            type: 'lp',
            title: 'ETH/USDC LP on Uniswap',
            description: 'Provide liquidity and earn fees',
            expectedProfit: '15-25% APY (variable)',
            risk: 'medium',
            action: 'Add Liquidity',
            warning: 'Impermanent loss risk'
        });

        return opportunities;
    },

    /**
     * Identify portfolio risks
     */
    identifyRisks(holdings, prices) {
        const risks = [];

        // Smart contract risk
        const defiExposure = holdings
            .filter(h => this.CATEGORIES.DEFI.includes(h.token))
            .reduce((s, h) => s + h.amount * prices[h.token], 0);

        if (defiExposure > 0) {
            risks.push({
                type: 'smart_contract',
                severity: 'medium',
                title: 'Smart Contract Risk',
                description: `$${defiExposure.toFixed(0)} exposed to DeFi protocol risks`,
                mitigation: 'Diversify across protocols, use audited contracts only'
            });
        }

        // Market risk
        risks.push({
            type: 'market',
            severity: 'high',
            title: 'Market Volatility',
            description: 'Crypto markets are highly volatile',
            mitigation: 'Only invest what you can afford to lose'
        });

        // Concentration risk
        const total = this.calculateTotalValue(holdings, prices);
        for (const holding of holdings) {
            const percentage = (holding.amount * prices[holding.token] / total) * 100;
            if (percentage > 40) {
                risks.push({
                    type: 'concentration',
                    severity: 'high',
                    title: `${holding.token} Concentration`,
                    description: `${percentage.toFixed(1)}% in single asset`,
                    mitigation: 'Consider diversifying to reduce single-asset risk'
                });
            }
        }

        // Regulatory risk
        risks.push({
            type: 'regulatory',
            severity: 'medium',
            title: 'Regulatory Uncertainty',
            description: 'Crypto regulations are evolving globally',
            mitigation: 'Stay informed on local regulations'
        });

        return risks;
    },

    /**
     * Calculate impermanent loss for LP position
     */
    calculateImpermanentLoss(initialPriceRatio, currentPriceRatio) {
        const priceChange = currentPriceRatio / initialPriceRatio;
        const lpValue = 2 * Math.sqrt(priceChange) / (1 + priceChange);
        const holdValue = 1; // Normalized
        const impermanentLoss = (lpValue - holdValue) / holdValue * 100;
        return impermanentLoss;
    },

    /**
     * Simulate impermanent loss scenarios
     */
    simulateIL(token1, token2, priceChanges = [-50, -30, -10, 10, 30, 50, 100, 200]) {
        return priceChanges.map(change => {
            const priceRatio = 1 + change / 100;
            const il = this.calculateImpermanentLoss(1, priceRatio);
            return {
                priceChange: `${change > 0 ? '+' : ''}${change}%`,
                impermanentLoss: `${il.toFixed(2)}%`
            };
        });
    },

    /**
     * Get whale activity for token
     */
    async getWhaleActivity(token) {
        // In production, query blockchain for large transactions
        // Demo data
        return {
            token: token,
            last24h: {
                largeBuys: 5,
                largeSells: 2,
                netFlow: '+$2.5M',
                sentiment: 'bullish'
            },
            topHolders: [
                { address: '0x1234...', balance: '500K ETH', percentage: '4.2%' },
                { address: '0x5678...', balance: '350K ETH', percentage: '2.9%' }
            ],
            recentMoves: [
                { type: 'accumulation', amount: '10,000 ETH', time: '2 hours ago' },
                { type: 'transfer', amount: '5,000 ETH', time: '5 hours ago' }
            ]
        };
    },

    /**
     * Get market sentiment
     */
    async getMarketSentiment() {
        // Aggregate from multiple sources
        return {
            overall: 'neutral',
            fearGreedIndex: 52,
            socialSentiment: {
                twitter: 'bullish',
                reddit: 'neutral',
                telegram: 'bullish'
            },
            technicalSignals: {
                shortTerm: 'buy',
                mediumTerm: 'neutral',
                longTerm: 'buy'
            },
            fundingRates: {
                btc: 0.01,
                eth: 0.008,
                bias: 'slightly long'
            }
        };
    },

    /**
     * Quick portfolio health check
     */
    quickHealthCheck(holdings, prices) {
        const total = this.calculateTotalValue(holdings, prices);
        const risk = this.calculateRiskScore(holdings, prices);
        const diversification = this.calculateDiversification(holdings);

        let status = 'healthy';
        let message = 'Portfolio is well-balanced';

        if (risk > 70) {
            status = 'risky';
            message = 'High risk exposure - consider rebalancing';
        } else if (diversification < 30) {
            status = 'concentrated';
            message = 'Low diversification - consider adding more assets';
        } else if (risk < 30 && diversification > 60) {
            status = 'conservative';
            message = 'Conservative allocation - good for stability';
        }

        return {
            status,
            message,
            totalValue: total,
            riskScore: risk,
            diversificationScore: diversification
        };
    }
};

// Export
window.AIAdvisor = AIAdvisor;
