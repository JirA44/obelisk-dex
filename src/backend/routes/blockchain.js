/**
 * OBELISK Blockchain Settlement API Routes
 * Multi-chain settlement with Smart Account batch support
 *
 * Version: 3.0 TURBO
 * Date: 2026-02-17
 */

const express = require('express');
const router = express.Router();
const BlockchainDashboard = require('../blockchain-dashboard');
const AutoBatcher = require('../auto-batcher');

// Settlement engines (will be initialized in server-ultra.js)
let settlementEngine = null;
let smartAccountExecutor = null;
let dashboard = null;
let autoBatcher = null;

/**
 * Initialize with settlement engines
 */
function initBlockchainRoutes(engines) {
    settlementEngine = engines.settlement;
    smartAccountExecutor = engines.smartAccount;

    // Initialize dashboard
    dashboard = new BlockchainDashboard(engines);

    // Initialize auto-batcher (disabled by default)
    if (engines.smartAccount) {
        autoBatcher = new AutoBatcher(engines.smartAccount, {
            mode: 'HYBRID',
            batchInterval: 10000,  // 10 seconds
            batchSize: 10,
            enabled: false  // Disabled by default, enable via API
        });
    }
}

/**
 * POST /api/blockchain/settle - Single settlement
 * Settles a single trade on blockchain
 */
router.post('/settle', async (req, res) => {
    try {
        if (!settlementEngine) {
            return res.status(503).json({ error: 'Settlement engine not initialized' });
        }

        const { trade, chain, network } = req.body;

        if (!trade) {
            return res.status(400).json({
                error: 'Missing required field: trade'
            });
        }

        // Select chain if specified
        let selectedChain = null;
        if (chain) {
            const chainKey = chain.toUpperCase();
            selectedChain = settlementEngine.chains[chainKey];

            if (!selectedChain) {
                return res.status(400).json({
                    error: `Unsupported chain: ${chain}`,
                    supported: Object.keys(settlementEngine.chains)
                });
            }

            selectedChain = { key: chainKey, ...selectedChain };
        }

        const result = await settlementEngine.settleTrade(trade, {
            chain: selectedChain
        });

        res.json({
            success: result.success,
            ...result
        });

    } catch (err) {
        console.error('[BLOCKCHAIN API] Settlement error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/blockchain/batch - Batch settlement (SMART ACCOUNT)
 * Settles multiple trades in a single transaction
 * Requires Smart Account for maximum gas savings
 */
router.post('/batch', async (req, res) => {
    try {
        if (!smartAccountExecutor) {
            return res.status(503).json({ error: 'Smart Account executor not initialized' });
        }

        const { trades, network } = req.body;

        if (!trades || !Array.isArray(trades) || trades.length === 0) {
            return res.status(400).json({
                error: 'Invalid trades array',
                required: 'Array of trade objects'
            });
        }

        console.log(`[BLOCKCHAIN API] 🔄 Batch settlement: ${trades.length} trades`);

        const results = await smartAccountExecutor.batchSettle(trades);

        // Calculate total cost and savings
        const totalCost = results.reduce((sum, r) => sum + (r.gasCost || 0), 0);
        const totalSaved = results.reduce((sum, r) => sum + (r.gasSaved || 0), 0);

        res.json({
            success: results.every(r => r.success),
            batchSize: trades.length,
            results,
            summary: {
                totalCost: totalCost.toFixed(6),
                totalSaved: totalSaved.toFixed(6),
                avgCostPerTrade: (totalCost / trades.length).toFixed(6),
                savingsPercent: totalSaved > 0
                    ? ((totalSaved / (totalCost + totalSaved)) * 100).toFixed(1) + '%'
                    : '0%'
            }
        });

    } catch (err) {
        console.error('[BLOCKCHAIN API] Batch settlement error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/blockchain/chains - List supported chains
 */
router.get('/chains', (req, res) => {
    try {
        if (!settlementEngine) {
            return res.status(503).json({ error: 'Settlement engine not initialized' });
        }

        const chains = Object.entries(settlementEngine.chains)
            .filter(([_, chain]) => chain.enabled)
            .map(([key, chain]) => ({
                key,
                name: chain.name,
                chainId: chain.chainId,
                maxTPS: chain.maxTPS,
                avgBlockTime: chain.avgBlockTime + 's',
                avgGasCost: '$' + chain.avgGasCost.toFixed(5),
                finality: chain.finality,
                priority: chain.priority
            }));

        res.json({
            success: true,
            count: chains.length,
            chains
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/blockchain/stats - Settlement statistics
 */
router.get('/stats', (req, res) => {
    try {
        if (!settlementEngine) {
            return res.status(503).json({ error: 'Settlement engine not initialized' });
        }

        const stats = settlementEngine.getStats();

        res.json({
            success: true,
            ...stats
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/blockchain/balance/:chain - Get wallet balance on specific chain
 */
router.get('/balance/:chain', async (req, res) => {
    try {
        if (!settlementEngine) {
            return res.status(503).json({ error: 'Settlement engine not initialized' });
        }

        const chain = req.params.chain.toUpperCase();
        let balance = null;

        switch (chain) {
            case 'SOLANA':
                balance = await settlementEngine.getSolanaBalance();
                break;
            case 'COSMOS':
                balance = await settlementEngine.getCosmosBalance();
                break;
            case 'ARBITRUM':
                balance = await settlementEngine.getArbitrumBalance();
                break;
            default:
                return res.status(400).json({
                    error: `Unsupported chain: ${chain}`,
                    supported: ['SOLANA', 'COSMOS', 'ARBITRUM']
                });
        }

        if (balance === null) {
            return res.status(503).json({ error: `${chain} executor not available` });
        }

        res.json({
            success: true,
            chain,
            balance,
            unit: chain === 'SOLANA' ? 'SOL' : (chain === 'COSMOS' ? 'ATOM' : 'ETH')
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/blockchain/smart-account/status - Check Smart Account status
 */
router.get('/smart-account/status', async (req, res) => {
    try {
        if (!smartAccountExecutor) {
            return res.status(503).json({ error: 'Smart Account executor not initialized' });
        }

        const stats = smartAccountExecutor.getStats();

        res.json({
            success: true,
            enabled: stats.isSmartAccount,
            network: stats.networkName,
            wallet: stats.wallet,
            stats: {
                totalSettlements: stats.settlements,
                batchSettlements: stats.batchSettlements,
                totalGasSaved: stats.totalGasSaved,
                efficiency: stats.efficiency
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/blockchain/smart-account/upgrade-guide - Get Smart Account upgrade instructions
 */
router.get('/smart-account/upgrade-guide', (req, res) => {
    res.json({
        success: true,
        guide: {
            title: 'Upgrade to Smart Account',
            description: 'Enable batch transactions and gas abstraction',
            steps: [
                'Open MetaMask (v12.17.0+)',
                'Go to a supported dApp on Base/Arbitrum/Optimism',
                'When prompted, click "Upgrade to Smart Account"',
                'Confirm the one-time upgrade transaction',
                'Your account will now have Smart Account features!'
            ],
            supportedChains: ['Base', 'Arbitrum', 'Optimism'],
            benefits: [
                'Batch transactions (80% gas savings)',
                'Pay gas in USDC instead of ETH',
                'Sponsored transactions (gasless)',
                'Social recovery',
                'Multi-sig support'
            ],
            moreInfo: 'https://support.metamask.io/smart-accounts'
        }
    });
});

/**
 * GET /api/blockchain/dashboard - Get dashboard data (JSON)
 */
router.get('/dashboard', (req, res) => {
    try {
        if (!dashboard) {
            return res.status(503).json({ error: 'Dashboard not initialized' });
        }

        res.json({
            success: true,
            ...dashboard.getDashboard()
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/blockchain/dashboard/html - Get dashboard as HTML
 */
router.get('/dashboard/html', (req, res) => {
    try {
        if (!dashboard) {
            return res.status(503).send('<h1>Dashboard not initialized</h1>');
        }

        res.set('Content-Type', 'text/html');
        res.send(dashboard.generateHTML());

    } catch (err) {
        res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
    }
});

/**
 * POST /api/blockchain/auto-batch/queue - Add trade to auto-batch queue
 */
router.post('/auto-batch/queue', async (req, res) => {
    try {
        if (!autoBatcher) {
            return res.status(503).json({ error: 'Auto-batcher not initialized' });
        }

        if (!autoBatcher.config.enabled) {
            return res.status(400).json({ error: 'Auto-batcher is not enabled. Enable it first.' });
        }

        const { trade } = req.body;

        if (!trade) {
            return res.status(400).json({ error: 'Missing trade data' });
        }

        autoBatcher.addTrade(trade);

        res.json({
            success: true,
            queued: true,
            queueStatus: autoBatcher.getQueueStatus()
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/blockchain/auto-batch/start - Start auto-batcher
 */
router.post('/auto-batch/start', (req, res) => {
    try {
        if (!autoBatcher) {
            return res.status(503).json({ error: 'Auto-batcher not initialized' });
        }

        autoBatcher.start();

        res.json({
            success: true,
            message: 'Auto-batcher started',
            config: autoBatcher.config
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/blockchain/auto-batch/stop - Stop auto-batcher
 */
router.post('/auto-batch/stop', (req, res) => {
    try {
        if (!autoBatcher) {
            return res.status(503).json({ error: 'Auto-batcher not initialized' });
        }

        autoBatcher.stop();

        res.json({
            success: true,
            message: 'Auto-batcher stopped'
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/blockchain/auto-batch/flush - Force execute batch now
 */
router.post('/auto-batch/flush', async (req, res) => {
    try {
        if (!autoBatcher) {
            return res.status(503).json({ error: 'Auto-batcher not initialized' });
        }

        const results = await autoBatcher.flushBatch();

        res.json({
            success: true,
            batchExecuted: true,
            results
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/blockchain/auto-batch/status - Get auto-batcher status
 */
router.get('/auto-batch/status', (req, res) => {
    try {
        if (!autoBatcher) {
            return res.status(503).json({ error: 'Auto-batcher not initialized' });
        }

        res.json({
            success: true,
            enabled: autoBatcher.config.enabled,
            config: autoBatcher.config,
            queue: autoBatcher.getQueueStatus(),
            stats: autoBatcher.getStats()
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/blockchain/auto-batch/config - Update auto-batcher config
 */
router.post('/auto-batch/config', (req, res) => {
    try {
        if (!autoBatcher) {
            return res.status(503).json({ error: 'Auto-batcher not initialized' });
        }

        const { mode, batchInterval, batchSize, minBatchSize, maxBatchSize, enabled } = req.body;

        autoBatcher.updateConfig({
            ...(mode && { mode }),
            ...(batchInterval && { batchInterval }),
            ...(batchSize && { batchSize }),
            ...(minBatchSize && { minBatchSize }),
            ...(maxBatchSize && { maxBatchSize }),
            ...(enabled !== undefined && { enabled })
        });

        res.json({
            success: true,
            message: 'Config updated',
            config: autoBatcher.config
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { router, initBlockchainRoutes };
