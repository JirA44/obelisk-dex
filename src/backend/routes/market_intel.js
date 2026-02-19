/**
 * OBELISK Market Intelligence API
 * Exposes aggregated market indicators for trading decisions
 */
const express = require('express');
const router = express.Router();
const path = require('path');

// Import Market Intel Aggregator from MixBot
const mixbotPath = path.join(__dirname, '../../../../mixbot');
const { MarketIntelAggregator } = require(path.join(mixbotPath, 'market_intel_aggregator.js'));

let aggregator = null;
let lastUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function initAggregator() {
    if (!aggregator) {
        aggregator = new MarketIntelAggregator();
        console.log('[OBELISK-INTEL] Market Intelligence aggregator initialized');
    }
    return aggregator;
}

/**
 * GET /api/market-intel - Get all market indicators + composite signal
 */
router.get('/', async (req, res) => {
    try {
        initAggregator();

        // Check cache
        if (aggregator.cache && (Date.now() - aggregator.lastUpdate < CACHE_DURATION)) {
            console.log('[MARKET-INTEL] Using cached data');
            return res.json({
                success: true,
                cached: true,
                ...formatResponse(aggregator.cache)
            });
        }

        const data = await aggregator.updateAll();

        if (!data) {
            return res.status(503).json({ error: 'Unable to fetch market intelligence' });
        }

        res.json({
            success: true,
            cached: false,
            ...formatResponse(data)
        });
    } catch (err) {
        console.error('[MARKET-INTEL API] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/market-intel/signal - Get just the composite signal
 */
router.get('/signal', async (req, res) => {
    try {
        initAggregator();

        const data = aggregator.cache || await aggregator.updateAll();

        if (!data) {
            return res.status(503).json({ error: 'No data available' });
        }

        res.json({
            success: true,
            timestamp: data.timestamp,
            composite: data.composite,
            recommendation: generateTradeRecommendation(data.composite)
        });
    } catch (err) {
        console.error('[MARKET-INTEL API] Signal error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/market-intel/liquidity - Get just liquidity indicators
 */
router.get('/liquidity', async (req, res) => {
    try {
        initAggregator();

        const data = aggregator.cache || await aggregator.updateAll();

        if (!data || !data.indicators.liquidity) {
            return res.status(503).json({ error: 'No liquidity data' });
        }

        res.json({
            success: true,
            timestamp: data.timestamp,
            liquidity: data.indicators.liquidity
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/market-intel/funding - Get funding rates
 */
router.get('/funding', async (req, res) => {
    try {
        initAggregator();

        const data = aggregator.cache || await aggregator.updateAll();

        if (!data || !data.indicators.funding) {
            return res.status(503).json({ error: 'No funding data' });
        }

        res.json({
            success: true,
            timestamp: data.timestamp,
            funding: data.indicators.funding
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/market-intel/sentiment - Get market sentiment
 */
router.get('/sentiment', async (req, res) => {
    try {
        initAggregator();

        const data = aggregator.cache || await aggregator.updateAll();

        if (!data || !data.indicators.sentiment) {
            return res.status(503).json({ error: 'No sentiment data' });
        }

        res.json({
            success: true,
            timestamp: data.timestamp,
            sentiment: data.indicators.sentiment
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/market-intel/cvd - Get cumulative volume delta
 */
router.get('/cvd', async (req, res) => {
    try {
        initAggregator();

        const data = aggregator.cache || await aggregator.updateAll();

        if (!data || !data.indicators.cvd) {
            return res.status(503).json({ error: 'No CVD data' });
        }

        res.json({
            success: true,
            timestamp: data.timestamp,
            cvd: data.indicators.cvd
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Format response for API
 */
function formatResponse(data) {
    return {
        timestamp: data.timestamp,
        date: data.date,
        composite: {
            score: data.composite.score,
            action: data.composite.action,
            sentiment: data.composite.sentiment,
            confidence: data.composite.confidence,
            breakdown: data.composite.breakdown
        },
        indicators: {
            liquidity: data.indicators.liquidity,
            funding: data.indicators.funding,
            sentiment: data.indicators.sentiment,
            cvd: data.indicators.cvd,
            liquidations: data.indicators.liquidations,
            defiTVL: data.indicators.defiTVL
        },
        recommendation: generateTradeRecommendation(data.composite)
    };
}

/**
 * Generate actionable trading recommendation
 */
function generateTradeRecommendation(composite) {
    const score = composite.score;
    const breakdown = composite.breakdown;

    // Find strongest signals
    const strongSignals = breakdown
        .filter(b => Math.abs(b.score) > 50)
        .sort((a, b) => Math.abs(b.weightedScore) - Math.abs(a.weightedScore));

    let recommendation = {
        action: composite.action,
        confidence: composite.confidence,
        positionSize: 'NORMAL',
        leverage: 1,
        timeframe: 'MEDIUM',
        keyFactors: strongSignals.map(s => s.reason)
    };

    // Adjust position size based on score strength
    if (Math.abs(score) > 60) {
        recommendation.positionSize = 'LARGE';
        recommendation.leverage = 2;
        recommendation.timeframe = 'LONG';
    } else if (Math.abs(score) > 40) {
        recommendation.positionSize = 'NORMAL';
        recommendation.leverage = 1.5;
        recommendation.timeframe = 'MEDIUM';
    } else if (Math.abs(score) > 20) {
        recommendation.positionSize = 'SMALL';
        recommendation.leverage = 1;
        recommendation.timeframe = 'SHORT';
    } else {
        recommendation.positionSize = 'MINIMAL';
        recommendation.leverage = 1;
        recommendation.timeframe = 'SCALP';
    }

    // Direction
    if (score > 0) {
        recommendation.direction = 'LONG';
        recommendation.entry = 'DCA on dips';
    } else if (score < 0) {
        recommendation.direction = 'SHORT';
        recommendation.entry = 'DCA on pumps';
    } else {
        recommendation.direction = 'NEUTRAL';
        recommendation.entry = 'Wait for clearer signal';
    }

    return recommendation;
}

module.exports = router;
