/**
 * OBELISK HFT DRY RUN TRACKER
 * Simule TOUTES les stratégies HFT en parallèle pour accumulation long terme
 *
 * Capital: ~$36 USDC
 * Risk Level: 4/10 (Modéré)
 * Objectif: Tracker 1 an de trades simulés pour valider les stratégies
 */

const fs = require('fs');
const path = require('path');

// Configuration globale
const CONFIG = {
    capital: 36,                    // Capital initial
    riskLevel: 4,                   // 1-10 (4 = modéré)
    maxRiskPerTrade: 0.04,          // 4% max par trade
    maxConcurrentPositions: 4,      // Max positions simultanées
    dataFile: path.join(__dirname, 'data', 'hft_dryrun_stats.json'),

    // Position sizing basé sur le risque
    getPositionSize: function(strategy) {
        const baseSize = this.capital * 0.15; // 15% du capital
        const riskMultiplier = this.riskLevel / 10;
        return Math.min(baseSize * riskMultiplier, this.capital * this.maxRiskPerTrade * 10);
    }
};

// Toutes les stratégies HFT disponibles dans Obelisk
const HFT_STRATEGIES = {
    // === BOT TEMPLATES (automation-engine.js) ===
    SCALPER: {
        name: 'Micro Scalper',
        type: 'bot_template',
        description: 'Quick trades on small price movements',
        params: {
            targetProfit: 0.2,      // 0.2% target
            maxLoss: 0.3,           // 0.3% stop loss
            cooldownSeconds: 30,
            minPositionSize: 5      // $5 minimum
        },
        riskRating: 3,              // 1-10
        capitalRequired: 10,        // $10 minimum recommandé
        frequency: 'high',          // trades/hour potential
        accessible: true
    },

    MOMENTUM: {
        name: 'Momentum Bot',
        type: 'bot_template',
        description: 'Buys on strong upward momentum, sells on reversal',
        params: {
            momentumThreshold: 2,   // 2% change to trigger
            lookbackPeriod: 15,     // minutes
            stopLoss: 3,            // 3%
            takeProfit: 5           // 5%
        },
        riskRating: 5,
        capitalRequired: 20,
        frequency: 'medium',
        accessible: true
    },

    MEAN_REVERSION: {
        name: 'Mean Reversion Bot',
        type: 'bot_template',
        description: 'Buys oversold, sells overbought based on RSI',
        params: {
            oversoldRSI: 30,
            overboughtRSI: 70,
            rsiPeriod: 14,
            stopLoss: 5
        },
        riskRating: 4,
        capitalRequired: 15,
        frequency: 'low',
        accessible: true
    },

    BREAKOUT: {
        name: 'Breakout Bot',
        type: 'bot_template',
        description: 'Trades breakouts from consolidation ranges',
        params: {
            consolidationPeriod: 60,
            breakoutThreshold: 1.5,
            stopLoss: 2,
            takeProfit: 4
        },
        riskRating: 5,
        capitalRequired: 20,
        frequency: 'low',
        accessible: true
    },

    // === INSTITUTIONAL STRATEGIES (institutional-simulator.js) ===
    GRID_TRADING: {
        name: 'Grid Trading',
        type: 'institutional',
        description: 'Place orders at grid levels, profit from oscillations',
        params: {
            gridSpacing: 1,         // 1% entre niveaux
            gridLevels: 5,
            positionPerGrid: 5      // $5 par niveau
        },
        riskRating: 3,
        capitalRequired: 25,        // 5 niveaux x $5
        frequency: 'medium',
        accessible: true
    },

    TWAP: {
        name: 'TWAP Execution',
        type: 'institutional',
        description: 'Time Weighted Average Price - split orders over time',
        params: {
            slices: 10,
            intervalMinutes: 5
        },
        riskRating: 2,
        capitalRequired: 30,
        frequency: 'low',
        accessible: true
    },

    VWAP: {
        name: 'VWAP Execution',
        type: 'institutional',
        description: 'Volume Weighted Average Price - execute based on volume',
        params: {
            volumeWeight: true
        },
        riskRating: 2,
        capitalRequired: 30,
        frequency: 'low',
        accessible: true
    },

    SPREAD_CAPTURE: {
        name: 'Spread Capture (MM)',
        type: 'institutional',
        description: 'Market making - capture bid-ask spread',
        params: {
            spreadTarget: 0.02,     // 0.02% spread
            twoSidedQuotes: true
        },
        riskRating: 4,
        capitalRequired: 50,        // Besoin de plus de capital
        frequency: 'very_high',
        accessible: false           // Trop de capital requis
    },

    // === UNIQUE TOOLS (unique-tools.js) ===
    AI_SIGNALS: {
        name: 'AI Trade Signals',
        type: 'unique_tools',
        description: 'RSI + MACD + BB based signals with confidence scoring',
        params: {
            minConfidence: 60,      // 60% min pour trade
            indicators: ['RSI', 'MACD', 'BB', 'Volume']
        },
        riskRating: 4,
        capitalRequired: 10,
        frequency: 'medium',
        accessible: true
    },

    ARBITRAGE: {
        name: 'Cross-DEX Arbitrage',
        type: 'unique_tools',
        description: 'Find price differences between exchanges',
        params: {
            minSpread: 0.1,         // 0.1% min spread
            sources: ['binance', 'coinbase', 'kraken', 'hyperliquid', 'dydx']
        },
        riskRating: 2,
        capitalRequired: 100,       // Besoin de capital sur plusieurs exchanges
        frequency: 'low',
        accessible: false           // Trop de capital dispersé requis
    },

    FUNDING_ARB: {
        name: 'Funding Rate Arbitrage',
        type: 'unique_tools',
        description: 'Exploit funding rate differences between perp exchanges',
        params: {
            minDiff: 0.5,           // 0.5% min difference
            annualizedTarget: 50    // 50%+ annualisé
        },
        riskRating: 3,
        capitalRequired: 100,       // Besoin de positions longues
        frequency: 'low',
        accessible: false
    },

    LIQUIDATION_SNIPER: {
        name: 'Liquidation Sniper',
        type: 'unique_tools',
        description: 'Profit from liquidation cascades',
        params: {
            minLiquidationSize: 10000,
            maxSlippage: 1
        },
        riskRating: 6,
        capitalRequired: 500,
        frequency: 'rare',
        accessible: false
    },

    // === MICRO STRATEGIES (adaptées pour petit capital) ===
    MICRO_SCALP: {
        name: 'Micro Scalper $5',
        type: 'micro',
        description: 'Ultra-petit scalping avec $5 positions',
        params: {
            positionSize: 5,
            targetProfit: 0.3,      // 0.3% = $0.015
            maxLoss: 0.2,           // 0.2% = $0.01
            cooldown: 60
        },
        riskRating: 3,
        capitalRequired: 5,
        frequency: 'high',
        accessible: true
    },

    MICRO_DCA: {
        name: 'Micro DCA Bot',
        type: 'micro',
        description: 'Dollar Cost Averaging avec petits montants',
        params: {
            buyAmount: 2,           // $2 par achat
            interval: 'daily',
            dropTrigger: -3         // Achat supplémentaire si -3%
        },
        riskRating: 2,
        capitalRequired: 10,
        frequency: 'low',
        accessible: true
    },

    RSI_EXTREME: {
        name: 'RSI Extreme Hunter',
        type: 'micro',
        description: 'Trade uniquement sur RSI extrêmes (<25 ou >75)',
        params: {
            oversoldRSI: 25,
            overboughtRSI: 75,
            positionSize: 8,
            stopLoss: 2,
            takeProfit: 3
        },
        riskRating: 4,
        capitalRequired: 10,
        frequency: 'low',
        accessible: true
    },

    BB_SQUEEZE: {
        name: 'Bollinger Squeeze',
        type: 'micro',
        description: 'Trade sur squeeze des Bollinger Bands',
        params: {
            squeezeThreshold: 0.02, // BB width < 2%
            breakoutConfirm: true,
            positionSize: 10
        },
        riskRating: 5,
        capitalRequired: 15,
        frequency: 'low',
        accessible: true
    }
};

class HFTDryRunTracker {
    constructor() {
        this.strategies = {};
        this.globalStats = {
            startDate: null,
            totalTrades: 0,
            totalPnL: 0,
            bestStrategy: null,
            worstStrategy: null
        };

        this.load();
        this.initStrategies();
    }

    initStrategies() {
        Object.entries(HFT_STRATEGIES).forEach(([id, strategy]) => {
            if (!this.strategies[id]) {
                this.strategies[id] = {
                    ...strategy,
                    id,
                    stats: {
                        trades: 0,
                        wins: 0,
                        losses: 0,
                        totalPnL: 0,
                        maxDrawdown: 0,
                        currentDrawdown: 0,
                        peakPnL: 0,
                        avgWin: 0,
                        avgLoss: 0,
                        profitFactor: 0,
                        winRate: 0,
                        sharpeRatio: 0,
                        lastTrade: null,
                        tradeHistory: []
                    },
                    tier: 'TIER0',
                    enabled: strategy.accessible && strategy.capitalRequired <= CONFIG.capital
                };
            }
        });

        if (!this.globalStats.startDate) {
            this.globalStats.startDate = Date.now();
        }

        this.save();
    }

    // Simuler un trade pour une stratégie
    simulateTrade(strategyId, trade) {
        const strategy = this.strategies[strategyId];
        if (!strategy) return null;

        const { side, pair, entryPrice, exitPrice, size, reason } = trade;

        // Calcul PnL
        let pnl;
        if (side === 'long') {
            pnl = ((exitPrice - entryPrice) / entryPrice) * size;
        } else {
            pnl = ((entryPrice - exitPrice) / entryPrice) * size;
        }

        // Frais simulés (0.1% round trip)
        const fees = size * 0.001;
        const netPnL = pnl - fees;

        // Update stats
        strategy.stats.trades++;
        strategy.stats.totalPnL += netPnL;

        if (netPnL > 0) {
            strategy.stats.wins++;
            strategy.stats.avgWin = (strategy.stats.avgWin * (strategy.stats.wins - 1) + netPnL) / strategy.stats.wins;
        } else {
            strategy.stats.losses++;
            strategy.stats.avgLoss = (strategy.stats.avgLoss * (strategy.stats.losses - 1) + Math.abs(netPnL)) / strategy.stats.losses;
        }

        // Win rate
        strategy.stats.winRate = (strategy.stats.wins / strategy.stats.trades) * 100;

        // Profit factor
        const totalWins = strategy.stats.avgWin * strategy.stats.wins;
        const totalLosses = strategy.stats.avgLoss * strategy.stats.losses;
        strategy.stats.profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

        // Drawdown
        if (strategy.stats.totalPnL > strategy.stats.peakPnL) {
            strategy.stats.peakPnL = strategy.stats.totalPnL;
        }
        strategy.stats.currentDrawdown = strategy.stats.peakPnL - strategy.stats.totalPnL;
        if (strategy.stats.currentDrawdown > strategy.stats.maxDrawdown) {
            strategy.stats.maxDrawdown = strategy.stats.currentDrawdown;
        }

        // Trade history (garder les 100 derniers)
        const tradeRecord = {
            timestamp: Date.now(),
            side,
            pair,
            entryPrice,
            exitPrice,
            size,
            pnl: netPnL,
            reason
        };
        strategy.stats.tradeHistory.push(tradeRecord);
        if (strategy.stats.tradeHistory.length > 100) {
            strategy.stats.tradeHistory.shift();
        }
        strategy.stats.lastTrade = tradeRecord;

        // Update tier based on performance
        this.updateTier(strategyId);

        // Global stats
        this.globalStats.totalTrades++;
        this.globalStats.totalPnL += netPnL;

        this.save();

        return {
            strategyId,
            trade: tradeRecord,
            newStats: strategy.stats
        };
    }

    updateTier(strategyId) {
        const strategy = this.strategies[strategyId];
        const s = strategy.stats;

        // Tier requirements
        if (s.trades >= 75 && s.winRate >= 55 && s.profitFactor >= 1.3 && s.totalPnL >= 5) {
            strategy.tier = 'TIER3';
        } else if (s.trades >= 35 && s.winRate >= 52 && s.profitFactor >= 1.2 && s.totalPnL >= 2) {
            strategy.tier = 'TIER2';
        } else if (s.trades >= 10 && s.winRate >= 50 && s.profitFactor >= 1.1 && s.totalPnL >= 0.5) {
            strategy.tier = 'TIER1';
        } else {
            strategy.tier = 'TIER0';
        }
    }

    // Obtenir les stratégies accessibles avec le capital actuel
    getAccessibleStrategies() {
        return Object.values(this.strategies)
            .filter(s => s.accessible && s.capitalRequired <= CONFIG.capital)
            .sort((a, b) => a.riskRating - b.riskRating);
    }

    // Obtenir les stratégies recommandées (risk 4/10)
    getRecommendedStrategies() {
        return this.getAccessibleStrategies()
            .filter(s => s.riskRating <= CONFIG.riskLevel + 1)
            .sort((a, b) => {
                // Trier par: tier > profitFactor > winRate
                if (a.tier !== b.tier) {
                    return b.tier.localeCompare(a.tier);
                }
                if (a.stats.profitFactor !== b.stats.profitFactor) {
                    return b.stats.profitFactor - a.stats.profitFactor;
                }
                return b.stats.winRate - a.stats.winRate;
            });
    }

    // Rapport complet
    getReport() {
        const accessible = this.getAccessibleStrategies();
        const recommended = this.getRecommendedStrategies();

        const allStats = Object.values(this.strategies).map(s => ({
            id: s.id,
            name: s.name,
            tier: s.tier,
            accessible: s.accessible,
            enabled: s.enabled,
            riskRating: s.riskRating,
            capitalRequired: s.capitalRequired,
            trades: s.stats.trades,
            winRate: s.stats.winRate.toFixed(1) + '%',
            profitFactor: s.stats.profitFactor.toFixed(2),
            totalPnL: '$' + s.stats.totalPnL.toFixed(2),
            maxDrawdown: '$' + s.stats.maxDrawdown.toFixed(2)
        }));

        // Trier par PnL
        const byPnL = [...allStats].sort((a, b) =>
            parseFloat(b.totalPnL.slice(1)) - parseFloat(a.totalPnL.slice(1))
        );

        return {
            config: {
                capital: CONFIG.capital,
                riskLevel: CONFIG.riskLevel,
                maxRiskPerTrade: (CONFIG.maxRiskPerTrade * 100) + '%'
            },
            globalStats: {
                ...this.globalStats,
                daysRunning: Math.floor((Date.now() - this.globalStats.startDate) / 86400000),
                totalPnL: '$' + this.globalStats.totalPnL.toFixed(2)
            },
            summary: {
                totalStrategies: Object.keys(this.strategies).length,
                accessibleStrategies: accessible.length,
                recommendedStrategies: recommended.length,
                tier3Count: allStats.filter(s => s.tier === 'TIER3').length,
                tier2Count: allStats.filter(s => s.tier === 'TIER2').length,
                tier1Count: allStats.filter(s => s.tier === 'TIER1').length
            },
            recommended: recommended.slice(0, 5).map(s => ({
                id: s.id,
                name: s.name,
                risk: s.riskRating + '/10',
                tier: s.tier,
                winRate: s.stats.winRate.toFixed(1) + '%',
                pnL: '$' + s.stats.totalPnL.toFixed(2)
            })),
            allStrategies: allStats,
            topPerformers: byPnL.slice(0, 5),
            worstPerformers: byPnL.slice(-3).reverse()
        };
    }

    // Sauvegarder
    save() {
        const dir = path.dirname(CONFIG.dataFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const data = {
            strategies: this.strategies,
            globalStats: this.globalStats,
            lastUpdated: Date.now()
        };

        fs.writeFileSync(CONFIG.dataFile, JSON.stringify(data, null, 2));
    }

    // Charger
    load() {
        try {
            if (fs.existsSync(CONFIG.dataFile)) {
                const data = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
                this.strategies = data.strategies || {};
                this.globalStats = data.globalStats || this.globalStats;
                console.log(`[HFT-DRYRUN] Loaded ${Object.keys(this.strategies).length} strategies`);
            }
        } catch (e) {
            console.error('[HFT-DRYRUN] Error loading data:', e.message);
        }
    }
}

// Export
module.exports = { HFTDryRunTracker, HFT_STRATEGIES, CONFIG };

// CLI si lancé directement
if (require.main === module) {
    const tracker = new HFTDryRunTracker();
    const report = tracker.getReport();

    console.log('\n' + '═'.repeat(70));
    console.log('           OBELISK HFT DRY RUN TRACKER - RAPPORT');
    console.log('═'.repeat(70));

    console.log(`\n📊 CONFIGURATION`);
    console.log(`   Capital: $${report.config.capital}`);
    console.log(`   Risk Level: ${report.config.riskLevel}/10`);
    console.log(`   Max Risk/Trade: ${report.config.maxRiskPerTrade}`);

    console.log(`\n📈 STATS GLOBALES`);
    console.log(`   Jours actifs: ${report.globalStats.daysRunning}`);
    console.log(`   Total trades: ${report.globalStats.totalTrades}`);
    console.log(`   PnL Total: ${report.globalStats.totalPnL}`);

    console.log(`\n🎯 RÉSUMÉ STRATÉGIES`);
    console.log(`   Total: ${report.summary.totalStrategies}`);
    console.log(`   Accessibles ($${CONFIG.capital}): ${report.summary.accessibleStrategies}`);
    console.log(`   Recommandées (Risk ≤${CONFIG.riskLevel+1}): ${report.summary.recommendedStrategies}`);
    console.log(`   TIER3: ${report.summary.tier3Count} | TIER2: ${report.summary.tier2Count} | TIER1: ${report.summary.tier1Count}`);

    console.log(`\n✅ STRATÉGIES RECOMMANDÉES (Risk 4/10, Capital $36)`);
    console.log('─'.repeat(70));
    report.recommended.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.name.padEnd(25)} | Risk: ${s.risk} | ${s.tier} | WR: ${s.winRate} | PnL: ${s.pnL}`);
    });

    console.log(`\n📊 TOUTES LES STRATÉGIES`);
    console.log('─'.repeat(70));
    console.log('   ID'.padEnd(20) + 'Accessible'.padEnd(12) + 'Risk'.padEnd(8) + 'Tier'.padEnd(8) + 'Trades'.padEnd(10) + 'WR'.padEnd(10) + 'PnL');
    console.log('─'.repeat(70));
    report.allStrategies.forEach(s => {
        const access = s.accessible ? '✅' : '❌';
        console.log(`   ${s.id.padEnd(18)} ${access.padEnd(10)} ${(s.riskRating+'/10').padEnd(6)} ${s.tier.padEnd(6)} ${String(s.trades).padEnd(8)} ${s.winRate.padEnd(8)} ${s.totalPnL}`);
    });

    console.log('\n' + '═'.repeat(70));
}
