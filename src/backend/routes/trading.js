/**
 * OBELISK Trading Router API Routes
 * Central trading hub for MixBot and other bots
 */

const express = require('express');
const router = express.Router();

// Will be initialized in server-ultra.js
let tradingRouter = null;

/**
 * Initialize with trading router instance
 */
function initTradingRoutes(routerInstance) {
    tradingRouter = routerInstance;
}

/**
 * POST /api/trade/order - Place an order
 * Routes to Hyperliquid or DEX based on config
 */
router.post('/order', async (req, res) => {
    try {
        if (!tradingRouter) {
            return res.status(503).json({ error: 'Trading router not initialized' });
        }

        const { symbol, side, size, price, type, leverage, slippage, source,
                tier, strategy, realExecution, rejectPaper, priority } = req.body;

        // Validate required fields
        if (!symbol || !side || !size) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['symbol', 'side', 'size']
            });
        }

        // Validate side
        if (!['buy', 'sell'].includes(side.toLowerCase())) {
            return res.status(400).json({ error: 'Side must be buy or sell' });
        }

        // V63.99: Log TIER1+ orders
        const tierNum = tier ? parseInt(tier.replace('TIER', '')) : 0;
        if (tierNum >= 1) {
            console.log(`[TRADE API] 🔥 TIER${tierNum} REAL ORDER: ${side} ${symbol} size=${size} from ${source}`);
        }

        const result = await tradingRouter.placeOrder({
            symbol: symbol.toUpperCase(),
            side: side.toLowerCase(),
            size: parseFloat(size),
            price: price ? parseFloat(price) : null,
            type: type || 'market',
            leverage: leverage ? parseInt(leverage) : 1,
            slippage: slippage ? parseFloat(slippage) : 0.5,
            source: source || 'api',
            // V63.99: TIER1+ flags for real execution
            tier: tier || 'TIER0',
            strategy: strategy || 'unknown',
            realExecution: realExecution === true,
            rejectPaper: rejectPaper === true,
            priority: priority || 'normal'
        });

        res.json(result);
    } catch (err) {
        console.error('[TRADE API] Order error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/trade/order/:id - Cancel an order
 */
router.delete('/order/:id', async (req, res) => {
    try {
        if (!tradingRouter) {
            return res.status(503).json({ error: 'Trading router not initialized' });
        }

        const result = await tradingRouter.cancelOrder(req.params.id);
        res.json(result);
    } catch (err) {
        console.error('[TRADE API] Cancel error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/trade/positions - Get open positions
 */
router.get('/positions', (req, res) => {
    try {
        if (!tradingRouter) {
            return res.status(503).json({ error: 'Trading router not initialized' });
        }

        const positions = tradingRouter.getPositions();
        res.json({
            success: true,
            count: positions.length,
            positions
        });
    } catch (err) {
        console.error('[TRADE API] Positions error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/trade/history - Get trade history
 */
router.get('/history', (req, res) => {
    try {
        if (!tradingRouter) {
            return res.status(503).json({ error: 'Trading router not initialized' });
        }

        const { symbol, exchange, from, to, limit } = req.query;

        const history = tradingRouter.getHistory({
            symbol,
            exchange,
            from: from ? parseInt(from) : undefined,
            to: to ? parseInt(to) : undefined,
            limit: limit ? parseInt(limit) : 100
        });

        res.json({
            success: true,
            count: history.length,
            history
        });
    } catch (err) {
        console.error('[TRADE API] History error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/trade/stats - Get router statistics
 */
router.get('/stats', (req, res) => {
    try {
        if (!tradingRouter) {
            return res.status(503).json({ error: 'Trading router not initialized' });
        }

        res.json({
            success: true,
            ...tradingRouter.getStats()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/trade/config - Update router config
 */
router.post('/config', (req, res) => {
    try {
        if (!tradingRouter) {
            return res.status(503).json({ error: 'Trading router not initialized' });
        }

        const { dexPriorityMode, preferredExchange, dexFallback } = req.body;

        if (dexPriorityMode !== undefined) {
            tradingRouter.setDexPriorityMode(dexPriorityMode);
        }

        if (preferredExchange) {
            tradingRouter.config.preferredExchange = preferredExchange;
        }

        if (dexFallback !== undefined) {
            tradingRouter.config.dexFallback = dexFallback;
        }

        tradingRouter.saveState();

        res.json({
            success: true,
            config: tradingRouter.config
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/trade/dex-priority - Toggle DEX priority mode
 */
router.post('/dex-priority', (req, res) => {
    try {
        if (!tradingRouter) {
            return res.status(503).json({ error: 'Trading router not initialized' });
        }

        const { enabled } = req.body;
        tradingRouter.setDexPriorityMode(enabled === true);

        res.json({
            success: true,
            dexPriorityMode: tradingRouter.config.dexPriorityMode
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/trade/rate-limit - Report rate limit status
 */
router.post('/rate-limit', (req, res) => {
    try {
        if (!tradingRouter) {
            return res.status(503).json({ error: 'Trading router not initialized' });
        }

        const { exchange, limited } = req.body;

        if (exchange === 'hyperliquid') {
            tradingRouter.setHyperliquidRateLimited(limited === true);
        }

        res.json({
            success: true,
            hyperliquidRateLimited: tradingRouter.config.hyperliquidRateLimited
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// V1.5: GMX Perpetuals endpoints

/**
 * GET /api/trade/perp/positions - Get GMX perpetual positions
 */
router.get('/perp/positions', async (req, res) => {
    try {
        if (!tradingRouter || !tradingRouter.executors?.dex) {
            return res.status(503).json({ error: 'DEX executor not initialized' });
        }

        const dexExecutor = tradingRouter.executors.dex;
        const { address } = req.query;

        const result = await dexExecutor.getGmxPositions(address);
        res.json(result);
    } catch (err) {
        console.error('[TRADE API] GMX positions error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/trade/perp/markets - Get supported GMX markets
 */
router.get('/perp/markets', (req, res) => {
    try {
        if (!tradingRouter || !tradingRouter.executors?.dex) {
            return res.status(503).json({ error: 'DEX executor not initialized' });
        }

        const dexExecutor = tradingRouter.executors.dex;
        const result = dexExecutor.getSupportedMarkets();
        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { router, initTradingRoutes };
