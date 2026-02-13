/**
 * OBELISK Trading Academy API Routes
 * Simulated traders for education
 */

const express = require('express');
const router = express.Router();

// Will be initialized in server-ultra.js
let academy = null;

/**
 * Initialize with academy instance
 */
function initAcademyRoutes(academyInstance) {
    academy = academyInstance;
}

/**
 * GET /api/academy/traders - Get all traders
 */
router.get('/traders', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const traders = academy.getTraders();
        res.json({
            success: true,
            count: traders.length,
            traders
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/academy/traders/:id - Get specific trader
 */
router.get('/traders/:id', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const trader = academy.getTrader(req.params.id);
        if (!trader) {
            return res.status(404).json({ error: 'Trader not found' });
        }

        res.json({
            success: true,
            trader
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/academy/feed - Get live trade feed
 */
router.get('/feed', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const feed = academy.getLiveFeed(limit);

        res.json({
            success: true,
            count: feed.length,
            feed
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/academy/leaderboard - Get trader leaderboard
 */
router.get('/leaderboard', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const leaderboard = academy.getLeaderboard();
        res.json({
            success: true,
            leaderboard
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/academy/quiz - Get a quiz question
 */
router.get('/quiz', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const quiz = academy.generateQuiz();
        res.json({
            success: true,
            quiz
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/academy/quiz/answer - Answer a quiz
 */
router.post('/quiz/answer', (req, res) => {
    try {
        const { quizId, answer, correctAnswer } = req.body;

        const isCorrect = answer === correctAnswer;
        res.json({
            success: true,
            correct: isCorrect,
            message: isCorrect ? 'Bonne reponse!' : 'Mauvaise reponse. Essaie encore!'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/academy/follow/:traderId - Follow a trader
 */
router.post('/follow/:traderId', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        // Use API key or default user
        const userId = req.headers['x-api-key'] || req.body.userId || 'default';
        const result = academy.followTrader(userId, req.params.traderId);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/academy/follow/:traderId - Unfollow a trader
 */
router.delete('/follow/:traderId', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const userId = req.headers['x-api-key'] || req.body.userId || 'default';
        const result = academy.unfollowTrader(userId, req.params.traderId);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/academy/following - Get followed traders
 */
router.get('/following', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const userId = req.headers['x-api-key'] || req.query.userId || 'default';
        const following = academy.getFollowing(userId);

        res.json({
            success: true,
            following
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/academy/trader/:id/trades - Get trader's trade history
 */
router.get('/trader/:id/trades', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const trader = academy.getTrader(req.params.id);
        if (!trader) {
            return res.status(404).json({ error: 'Trader not found' });
        }

        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        res.json({
            success: true,
            traderId: req.params.id,
            trades: trader.recentTrades.slice(-limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// V63.95: BACKTEST TRAINING ENDPOINTS
// ============================================

/**
 * POST /api/academy/train - Train all traders on historical data
 */
router.post('/train', async (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const days = req.body.days || 30;
        console.log(`[ACADEMY API] Starting training on ${days} days of data...`);

        const results = await academy.trainAllTraders(days);

        res.json({
            success: true,
            message: `Trained ${results.length} traders on ${days} days of data`,
            results
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/academy/best-performers - Get best performing traders (for copy trading)
 */
router.get('/best-performers', (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const minWinRate = req.query.minWinRate ? parseFloat(req.query.minWinRate) : 50;
        const minPF = req.query.minPF ? parseFloat(req.query.minPF) : 1.1;
        const maxTraders = req.query.max ? parseInt(req.query.max) : 3;

        const performers = academy.getBestPerformers(minWinRate, minPF, maxTraders);

        res.json({
            success: true,
            count: performers.length,
            traders: performers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/academy/signals - Get current trading signals from trained traders
 */
router.get('/signals', async (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const signals = await academy.getCurrentSignals();

        res.json({
            success: true,
            count: signals.length,
            signals,
            timestamp: Date.now()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/academy/backtest/:traderId - Backtest specific trader
 */
router.post('/backtest/:traderId', async (req, res) => {
    try {
        if (!academy) {
            return res.status(503).json({ error: 'Academy not initialized' });
        }

        const symbols = req.body.symbols || ['BTC', 'ETH', 'SOL', 'ARB'];
        const days = req.body.days || 30;

        const result = await academy.backtestTrader(req.params.traderId, symbols, days);

        if (!result) {
            return res.status(404).json({ error: 'Trader not found' });
        }

        res.json({
            success: true,
            result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { router, initAcademyRoutes };
