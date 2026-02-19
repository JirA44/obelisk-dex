/**
 * OBELISK Liquidity Indicators API
 * Exposes global liquidity metrics for trading decisions
 */
const express = require('express');
const router = express.Router();
const path = require('path');

// Import LiquidityTracker from MixBot
const mixbotPath = path.join(__dirname, '../../../../mixbot');
const { LiquidityTracker } = require(path.join(mixbotPath, 'trackers', 'liquidity_tracker.js'));

let tracker = null;
let lastUpdate = null;
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Initialize tracker
function initTracker() {
    if (!tracker) {
        tracker = new LiquidityTracker();
        console.log('[OBELISK-LIQUIDITY] Tracker initialized');
    }
    return tracker;
}

/**
 * GET /api/liquidity - Get current liquidity indicators
 */
router.get('/', async (req, res) => {
    try {
        initTracker();

        const data = await tracker.update();

        if (!data) {
            return res.status(503).json({ error: 'Unable to fetch liquidity data' });
        }

        res.json({
            success: true,
            timestamp: data.timestamp,
            date: data.date,

            // Main indicators
            indicators: {
                netLiquidity: data.netLiquidity,
                globalLiquidity: data.globalLiquidity,
                usdtUsdcTotal: data.indicators.usdtUsdcTotal,
                totalStableSupply: data.indicators.totalStableSupply
            },

            // Stablecoin breakdown
            stablecoins: {
                usdt: {
                    marketCap: data.stablecoins.usdt.marketCap,
                    volume24h: data.stablecoins.usdt.volume24h,
                    change24h: data.stablecoins.usdt.change24h
                },
                usdc: {
                    marketCap: data.stablecoins.usdc.marketCap,
                    volume24h: data.stablecoins.usdc.volume24h,
                    change24h: data.stablecoins.usdc.change24h
                },
                dai: {
                    marketCap: data.stablecoins.dai.marketCap,
                    volume24h: data.stablecoins.dai.volume24h,
                    change24h: data.stablecoins.dai.change24h
                }
            },

            // Global crypto metrics
            crypto: {
                totalMarketCap: data.globalData.totalMarketCap,
                totalVolume24h: data.globalData.totalVolume24h,
                marketCapChange24h: data.globalData.marketCapChange24h,
                btcDominance: data.globalData.btcDominance,
                ethDominance: data.globalData.ethDominance
            },

            // Daily metrics (if available)
            daily: data.dailyMetrics ? {
                trend: data.dailyMetrics.stablecoinDelta.trend,
                delta: data.dailyMetrics.stablecoinDelta.delta,
                deltaPercent: data.dailyMetrics.stablecoinDelta.deltaPercent,
                usdtDelta: data.dailyMetrics.stablecoinDelta.usdtDelta,
                usdcDelta: data.dailyMetrics.stablecoinDelta.usdcDelta,
                netLiquidityChange: data.dailyMetrics.netLiquidityChange,
                globalLiquidityChange: data.dailyMetrics.globalLiquidityChange,
                marketCapChange: data.dailyMetrics.marketCapChange
            } : null,

            // Trading signal
            signal: generateTradingSignal(data),

            version: data.version
        });
    } catch (err) {
        console.error('[LIQUIDITY API] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/liquidity/history - Get historical data
 */
router.get('/history', (req, res) => {
    try {
        initTracker();

        const { days = 7 } = req.query;
        const cutoff = Date.now() - (parseInt(days) * 24 * 60 * 60 * 1000);

        const history = tracker.history.snapshots
            .filter(s => s.timestamp >= cutoff)
            .map(s => ({
                timestamp: s.timestamp,
                date: s.date,
                netLiquidity: s.netLiquidity,
                globalLiquidity: s.globalLiquidity,
                usdtUsdcTotal: s.indicators.usdtUsdcTotal,
                cryptoMarketCap: s.globalData.totalMarketCap
            }));

        res.json({
            success: true,
            days: parseInt(days),
            count: history.length,
            history
        });
    } catch (err) {
        console.error('[LIQUIDITY API] History error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/liquidity/signal - Get trading signal based on liquidity
 */
router.get('/signal', async (req, res) => {
    try {
        initTracker();

        const data = await tracker.update();

        if (!data) {
            return res.status(503).json({ error: 'Unable to fetch liquidity data' });
        }

        const signal = generateTradingSignal(data);

        res.json({
            success: true,
            signal,
            timestamp: data.timestamp
        });
    } catch (err) {
        console.error('[LIQUIDITY API] Signal error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Generate trading signal from liquidity data
 */
function generateTradingSignal(data) {
    const signals = [];
    let score = 0; // -100 to +100

    // Check daily trend
    if (data.dailyMetrics) {
        const dm = data.dailyMetrics;

        // Stablecoin flow
        if (dm.stablecoinDelta.trend === 'inflow') {
            signals.push('📈 Money flowing INTO market (bullish)');
            score += 30;
        } else if (dm.stablecoinDelta.trend === 'outflow') {
            signals.push('📉 Money flowing OUT of market (bearish)');
            score -= 30;
        }

        // Delta magnitude
        const deltaPct = Math.abs(dm.stablecoinDelta.deltaPercent);
        if (deltaPct > 1) {
            signals.push(`🔥 Large flow detected: ${deltaPct.toFixed(2)}%`);
            score += dm.stablecoinDelta.delta > 0 ? 20 : -20;
        }

        // Net liquidity change
        if (dm.netLiquidityChange > 1e9) {
            signals.push('💧 Net liquidity increasing (bullish)');
            score += 15;
        } else if (dm.netLiquidityChange < -1e9) {
            signals.push('⚠️ Net liquidity decreasing (bearish)');
            score -= 15;
        }
    }

    // Check global liquidity vs crypto market cap ratio
    const ratio = data.globalLiquidity / data.globalData.totalMarketCap;
    if (ratio > 1.15) {
        signals.push('💰 High liquidity available (potential for growth)');
        score += 10;
    } else if (ratio < 1.05) {
        signals.push('⚠️ Low liquidity (risk of correction)');
        score -= 10;
    }

    // USDT dominance (USDT increasing = risk-off)
    const usdtDominance = data.stablecoins.usdt.marketCap / data.indicators.usdtUsdcTotal;
    if (usdtDominance > 0.75) {
        signals.push('🛡️ USDT dominance high (risk-off sentiment)');
        score -= 5;
    }

    // Overall sentiment
    let sentiment = 'NEUTRAL';
    if (score > 30) sentiment = 'BULLISH';
    else if (score > 50) sentiment = 'VERY BULLISH';
    else if (score < -30) sentiment = 'BEARISH';
    else if (score < -50) sentiment = 'VERY BEARISH';

    return {
        sentiment,
        score,
        signals,
        recommendation: getRecommendation(sentiment, score)
    };
}

function getRecommendation(sentiment, score) {
    if (score > 50) return 'STRONG BUY - High liquidity inflow';
    if (score > 30) return 'BUY - Positive money flow';
    if (score > 10) return 'SLIGHT BUY - Minor bullish signals';
    if (score < -50) return 'STRONG SELL - Major liquidity outflow';
    if (score < -30) return 'SELL - Negative money flow';
    if (score < -10) return 'SLIGHT SELL - Minor bearish signals';
    return 'HOLD - Neutral liquidity conditions';
}

module.exports = router;
