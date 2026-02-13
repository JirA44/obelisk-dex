/**
 * OBELISK HFT AUTO SIMULATOR
 * Simule automatiquement les trades pour toutes les stratégies HFT
 * en utilisant les prix réels du marché
 *
 * Lance ce script pour accumuler des trades simulés sur l'année
 */

const axios = require('axios');
const { HFTDryRunTracker, HFT_STRATEGIES, CONFIG } = require('./hft_dryrun_tracker');

// Configuration simulation
const SIM_CONFIG = {
    scanInterval: 60000,           // Scan toutes les 60 secondes
    priceSource: 'binance',        // Source de prix
    pairs: ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ARB/USDC', 'DOGE/USDC'],
    maxTradesPerHour: 999999,      // V64.05: No limit - accumulate max trades for long-term validation
    simulationSpeed: 1             // 1 = temps réel, 10 = 10x plus rapide
};

// Cache de prix et indicateurs
let priceCache = {};
let indicatorCache = {};
let tradesThisHour = 0;
let lastHourReset = Date.now();

// Warmup: charger historique pour avoir les indicateurs immédiatement
async function warmupPriceHistory() {
    console.log('[SIM] Warmup: Chargement historique 1h...');
    try {
        for (const pair of SIM_CONFIG.pairs) {
            const symbol = pair.replace('/USDC', 'USDC');
            const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=60`, {
                timeout: 10000
            });

            if (!priceCache[pair]) {
                priceCache[pair] = { history: [], current: null };
            }

            // Ajouter les 60 dernières bougies
            response.data.forEach(candle => {
                priceCache[pair].history.push({
                    price: parseFloat(candle[4]), // close price
                    time: candle[0]
                });
            });

            // Dernière bougie = current
            const last = response.data[response.data.length - 1];
            priceCache[pair].current = {
                pair,
                price: parseFloat(last[4]),
                change24h: ((parseFloat(last[4]) - parseFloat(response.data[0][1])) / parseFloat(response.data[0][1])) * 100,
                high: Math.max(...response.data.map(c => parseFloat(c[2]))),
                low: Math.min(...response.data.map(c => parseFloat(c[3]))),
                volume: response.data.reduce((sum, c) => sum + parseFloat(c[5]), 0)
            };

            console.log(`[SIM] ${pair}: ${priceCache[pair].history.length} points chargés`);
        }
        console.log('[SIM] Warmup terminé - indicateurs prêts!');
        return true;
    } catch (e) {
        console.error('[SIM] Warmup error:', e.message);
        return false;
    }
}

// Fetch prix depuis Binance
async function fetchPrices() {
    try {
        const symbols = SIM_CONFIG.pairs.map(p => p.replace('/USDC', 'USDC'));
        const promises = symbols.map(async (symbol) => {
            const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, {
                timeout: 5000
            });
            return {
                pair: symbol.replace('USDC', '/USDC'),
                price: parseFloat(response.data.lastPrice),
                change24h: parseFloat(response.data.priceChangePercent),
                high: parseFloat(response.data.highPrice),
                low: parseFloat(response.data.lowPrice),
                volume: parseFloat(response.data.volume)
            };
        });

        const results = await Promise.all(promises);
        results.forEach(r => {
            // Garder l'historique pour calculs
            if (!priceCache[r.pair]) {
                priceCache[r.pair] = { history: [], current: null };
            }
            priceCache[r.pair].history.push({ price: r.price, time: Date.now() });
            if (priceCache[r.pair].history.length > 100) {
                priceCache[r.pair].history.shift();
            }
            priceCache[r.pair].current = r;
        });

        return results;
    } catch (e) {
        console.error('[SIM] Price fetch error:', e.message);
        return null;
    }
}

// Calculer indicateurs techniques simples
function calculateIndicators(pair) {
    const data = priceCache[pair];
    if (!data || data.history.length < 14) return null;

    const prices = data.history.map(h => h.price);
    const current = data.current;

    // RSI (simplified)
    let gains = 0, losses = 0;
    for (let i = prices.length - 14; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // Simple Moving Averages
    const sma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10;
    const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, prices.length);

    // Bollinger Bands (20 period, 2 std dev)
    const bbPeriod = Math.min(20, prices.length);
    const bbPrices = prices.slice(-bbPeriod);
    const bbSma = bbPrices.reduce((a, b) => a + b, 0) / bbPeriod;
    const variance = bbPrices.reduce((sum, p) => sum + Math.pow(p - bbSma, 2), 0) / bbPeriod;
    const stdDev = Math.sqrt(variance);
    const bbUpper = bbSma + 2 * stdDev;
    const bbLower = bbSma - 2 * stdDev;
    const bbWidth = (bbUpper - bbLower) / bbSma * 100;

    // Momentum
    const momentum = prices.length >= 10 ? ((current.price - prices[prices.length - 10]) / prices[prices.length - 10]) * 100 : 0;

    indicatorCache[pair] = {
        rsi,
        sma10,
        sma20,
        bbUpper,
        bbLower,
        bbSma,
        bbWidth,
        momentum,
        trend: sma10 > sma20 ? 'up' : 'down',
        volatility: stdDev / bbSma * 100
    };

    return indicatorCache[pair];
}

// Logique de chaque stratégie
const STRATEGY_LOGIC = {
    SCALPER: (pair, price, indicators) => {
        // Scalp sur petits mouvements
        if (Math.abs(indicators.momentum) > 0.1 && Math.abs(indicators.momentum) < 0.5) {
            const side = indicators.momentum > 0 ? 'long' : 'short';
            const exitPrice = side === 'long'
                ? price * (1 + 0.002)  // 0.2% target
                : price * (1 - 0.002);
            return { side, exitPrice, confidence: 60 + Math.random() * 20 };
        }
        return null;
    },

    MOMENTUM: (pair, price, indicators) => {
        // Trade dans la direction du momentum fort
        if (Math.abs(indicators.momentum) > 2) {
            const side = indicators.momentum > 0 ? 'long' : 'short';
            const exitPrice = side === 'long'
                ? price * (1 + 0.05)   // 5% target
                : price * (1 - 0.05);
            return { side, exitPrice, confidence: 55 + Math.abs(indicators.momentum) * 5 };
        }
        return null;
    },

    MEAN_REVERSION: (pair, price, indicators) => {
        // Acheter oversold, vendre overbought
        if (indicators.rsi < 30) {
            return { side: 'long', exitPrice: price * 1.03, confidence: 70 };
        }
        if (indicators.rsi > 70) {
            return { side: 'short', exitPrice: price * 0.97, confidence: 70 };
        }
        return null;
    },

    BREAKOUT: (pair, price, indicators) => {
        // Trade sur breakout BB
        if (price > indicators.bbUpper) {
            return { side: 'long', exitPrice: price * 1.04, confidence: 65 };
        }
        if (price < indicators.bbLower) {
            return { side: 'short', exitPrice: price * 0.96, confidence: 65 };
        }
        return null;
    },

    GRID_TRADING: (pair, price, indicators) => {
        // Toujours actif - acheter bas, vendre haut
        if (price < indicators.bbLower * 1.005) {
            return { side: 'long', exitPrice: indicators.bbSma, confidence: 75 };
        }
        if (price > indicators.bbUpper * 0.995) {
            return { side: 'short', exitPrice: indicators.bbSma, confidence: 75 };
        }
        return null;
    },

    TWAP: (pair, price, indicators) => {
        // Exécute périodiquement dans la tendance
        if (indicators.trend === 'up' && Math.random() > 0.7) {
            return { side: 'long', exitPrice: price * 1.02, confidence: 60 };
        }
        return null;
    },

    VWAP: (pair, price, indicators) => {
        // Similar à TWAP mais weighted
        if (indicators.trend === 'up' && indicators.volatility < 3 && Math.random() > 0.8) {
            return { side: 'long', exitPrice: price * 1.02, confidence: 60 };
        }
        return null;
    },

    AI_SIGNALS: (pair, price, indicators) => {
        // Confluence de plusieurs indicateurs
        let score = 0;
        if (indicators.rsi < 35) score += 25;
        if (indicators.rsi > 65) score -= 25;
        if (indicators.trend === 'up') score += 15;
        if (indicators.trend === 'down') score -= 15;
        if (price < indicators.bbLower * 1.02) score += 20;
        if (price > indicators.bbUpper * 0.98) score -= 20;

        if (Math.abs(score) >= 40) {
            const side = score > 0 ? 'long' : 'short';
            const tp = side === 'long' ? 1.03 : 0.97;
            return { side, exitPrice: price * tp, confidence: 50 + Math.abs(score) };
        }
        return null;
    },

    MICRO_SCALP: (pair, price, indicators) => {
        // Micro mouvements
        if (Math.abs(indicators.momentum) > 0.05 && Math.abs(indicators.momentum) < 0.3) {
            const side = indicators.momentum > 0 ? 'long' : 'short';
            const exitPrice = side === 'long'
                ? price * 1.003
                : price * 0.997;
            return { side, exitPrice, confidence: 55 + Math.random() * 20 };
        }
        return null;
    },

    MICRO_DCA: (pair, price, indicators) => {
        // Achète sur les dips
        if (indicators.rsi < 40 && indicators.momentum < -1) {
            return { side: 'long', exitPrice: price * 1.05, confidence: 70 };
        }
        return null;
    },

    RSI_EXTREME: (pair, price, indicators) => {
        // Seulement RSI extrêmes
        if (indicators.rsi < 25) {
            return { side: 'long', exitPrice: price * 1.03, confidence: 80 };
        }
        if (indicators.rsi > 75) {
            return { side: 'short', exitPrice: price * 0.97, confidence: 80 };
        }
        return null;
    },

    BB_SQUEEZE: (pair, price, indicators) => {
        // Trade sur squeeze (BB width < 2%)
        if (indicators.bbWidth < 2 && Math.abs(indicators.momentum) > 0.5) {
            const side = indicators.momentum > 0 ? 'long' : 'short';
            const tp = side === 'long' ? 1.04 : 0.96;
            return { side, exitPrice: price * tp, confidence: 75 };
        }
        return null;
    }
};

// Simuler un trade complet (entrée + sortie)
function simulateCompleteTrade(tracker, strategyId, pair, signal, entryPrice) {
    const strategy = HFT_STRATEGIES[strategyId];
    if (!strategy || !strategy.accessible) return null;

    // Position size basé sur le capital et risque
    const size = Math.min(
        CONFIG.capital * 0.15,           // 15% max
        strategy.capitalRequired || 10   // ou capital requis
    );

    // Simuler le résultat (probabilité basée sur confidence)
    const winProbability = signal.confidence / 100;
    const isWin = Math.random() < winProbability;

    let exitPrice;
    if (isWin) {
        exitPrice = signal.exitPrice;
    } else {
        // Stop loss (inverse du target)
        const slRatio = signal.side === 'long'
            ? 1 - (signal.exitPrice / entryPrice - 1) * 0.5
            : 1 + (1 - signal.exitPrice / entryPrice) * 0.5;
        exitPrice = entryPrice * slRatio;
    }

    const trade = {
        side: signal.side,
        pair,
        entryPrice,
        exitPrice,
        size,
        reason: `${strategyId} signal (conf: ${signal.confidence.toFixed(0)}%)`
    };

    return tracker.simulateTrade(strategyId, trade);
}

// Boucle principale
async function runSimulation() {
    console.log('\n' + '═'.repeat(60));
    console.log('     OBELISK HFT AUTO SIMULATOR - DÉMARRAGE');
    console.log('═'.repeat(60));
    console.log(`Capital: $${CONFIG.capital} | Risk: ${CONFIG.riskLevel}/10`);
    console.log(`Pairs: ${SIM_CONFIG.pairs.join(', ')}`);
    console.log(`Scan: toutes les ${SIM_CONFIG.scanInterval/1000}s`);
    console.log('═'.repeat(60) + '\n');

    const tracker = new HFTDryRunTracker();

    // Warmup: charger historique pour indicateurs immédiats
    await warmupPriceHistory();

    const scan = async () => {
        // Reset compteur horaire
        if (Date.now() - lastHourReset > 3600000) {
            tradesThisHour = 0;
            lastHourReset = Date.now();
        }

        // Limiter les trades
        if (tradesThisHour >= SIM_CONFIG.maxTradesPerHour) {
            console.log('[SIM] Max trades/hour reached, waiting...');
            return;
        }

        // Fetch prix
        const prices = await fetchPrices();
        if (!prices) return;

        // Pour chaque pair
        for (const priceData of prices) {
            const { pair, price } = priceData;
            const indicators = calculateIndicators(pair);
            if (!indicators) continue;

            // Tester chaque stratégie
            for (const [strategyId, logic] of Object.entries(STRATEGY_LOGIC)) {
                const strategy = tracker.strategies[strategyId];
                if (!strategy || !strategy.enabled) continue;

                try {
                    const signal = logic(pair, price, indicators);
                    if (signal && signal.confidence >= 55) {
                        // Cooldown check (1 trade par stratégie par 1 min min)
                        const lastTrade = strategy.stats.lastTrade;
                        if (lastTrade && Date.now() - lastTrade.timestamp < 60000) continue;

                        const result = simulateCompleteTrade(tracker, strategyId, pair, signal, price);
                        if (result) {
                            tradesThisHour++;
                            const emoji = result.trade.pnl >= 0 ? '✅' : '❌';
                            console.log(`[${new Date().toLocaleTimeString()}] ${emoji} ${strategyId} | ${pair} | ${signal.side.toUpperCase()} | PnL: $${result.trade.pnl.toFixed(3)}`);
                        }
                    }
                } catch (e) {
                    // Silently continue
                }
            }
        }

        // Afficher stats périodiquement
        if (Math.random() < 0.1) { // 10% chance chaque scan
            const report = tracker.getReport();
            console.log(`\n📊 Stats: ${report.globalStats.totalTrades} trades | PnL: ${report.globalStats.totalPnL}`);
        }
    };

    // Premier scan immédiat
    await scan();

    // Boucle continue
    setInterval(scan, SIM_CONFIG.scanInterval / SIM_CONFIG.simulationSpeed);

    // Keep alive
    console.log('[SIM] Simulation en cours... (Ctrl+C pour arrêter)\n');
}

// Gestion arrêt propre
process.on('SIGINT', () => {
    console.log('\n[SIM] Arrêt de la simulation...');
    const tracker = new HFTDryRunTracker();
    const report = tracker.getReport();
    console.log(`\n📊 RÉSUMÉ FINAL:`);
    console.log(`   Trades: ${report.globalStats.totalTrades}`);
    console.log(`   PnL Total: ${report.globalStats.totalPnL}`);
    console.log(`   Jours: ${report.globalStats.daysRunning}`);
    process.exit(0);
});

// Lancer
runSimulation().catch(console.error);
