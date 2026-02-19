/**
 * AUTO-BATCHING SYSTEM
 * Automatically groups trades and executes batch settlements
 *
 * Modes:
 * - TIME: Batch every X seconds
 * - COUNT: Batch when N trades accumulated
 * - HYBRID: Whichever comes first
 *
 * HFT Profit Guard (Sonic):
 * - Before executing a batch of 10 trades, verifies net PnL > 0
 * - Net PnL = sum(trade.pnl) - gasCost - dexFees
 * - Sonic batch gas: $0.00021 flat (Multicall3, any batch size)
 * - DEX fees deducted per trade based on exchange
 *
 * Version: 1.1 | Date: 2026-02-19
 */

const EventEmitter = require('events');

// ─── Sonic HFT costs ──────────────────────────────────────────────────────────
const SONIC_BATCH_GAS_USD = 0.00021;   // Multicall3 batch (any size, flat)
const DEX_FEE_RATES = {                 // Taker fee rates
    odos:       0.000,  // 0%    — Odos aggregator
    equalizer:  0.0003, // 0.03% — Solidly AMM avg
    metropolis: 0.002,  // 0.2%  — Trader Joe LB
    shadow_v2:  0.0003, // 0.03%
    shadow_cl:  0.0005, // 0.05%
    swapx:      0.0003, // dynamic, use 0.03% avg
    default:    0.001,  // 0.1%  — fallback
};

class AutoBatcher extends EventEmitter {
    constructor(smartAccountExecutor, config = {}) {
        super();

        this.executor = smartAccountExecutor;

        // Configuration
        this.config = {
            mode: config.mode || 'HYBRID',                 // TIME, COUNT, HYBRID
            batchInterval: config.batchInterval || 10000,  // 10 seconds
            batchSize: config.batchSize || 10,             // 10 trades per batch
            minBatchSize: config.minBatchSize || 10,       // Min 10 for profit guard
            maxBatchSize: config.maxBatchSize || 50,       // Max 50 trades per batch
            enabled: config.enabled !== false,
            // HFT Profit Guard
            profitGuard: config.profitGuard !== false,     // ON by default
            minNetProfitUsd: config.minNetProfitUsd || 0,  // Must be > 0 net (strict)
            chain: config.chain || 'SONIC',                // For gas cost lookup
        };

        // Pending trades queue
        this.pendingTrades = [];
        this.batchTimer = null;

        // Statistics
        this.stats = {
            tradesQueued: 0,
            batchesExecuted: 0,
            batchesSkipped: 0,       // batches rejected by profit guard
            tradesSettled: 0,
            tradesDiscarded: 0,      // trades dropped (never profitable after 3x accumulation)
            totalGasSaved: 0,
            totalNetPnl: 0,          // cumulative net PnL after costs
            lastBatchTime: null
        };

        console.log(`✅ Auto-Batcher initialized (${this.config.mode} mode)`);
        console.log(`   Interval: ${this.config.batchInterval}ms | Size: ${this.config.batchSize} trades`);

        if (this.config.enabled) {
            this.start();
        }
    }

    /**
     * Start auto-batching
     */
    start() {
        if (this.batchTimer) {
            console.warn('Auto-batcher already running');
            return;
        }

        if (this.config.mode === 'TIME' || this.config.mode === 'HYBRID') {
            this.batchTimer = setInterval(() => {
                this.executeBatch();
            }, this.config.batchInterval);
        }

        this.config.enabled = true;
        console.log('🔄 Auto-batcher started');
        this.emit('started');
    }

    /**
     * Stop auto-batching
     */
    stop() {
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
            this.batchTimer = null;
        }

        this.config.enabled = false;
        console.log('⏸️  Auto-batcher stopped');
        this.emit('stopped');
    }

    /**
     * Add trade to queue
     */
    addTrade(trade) {
        if (!this.config.enabled) {
            throw new Error('Auto-batcher is not enabled');
        }

        this.pendingTrades.push({
            ...trade,
            queuedAt: Date.now()
        });

        this.stats.tradesQueued++;

        console.log(`[AUTO-BATCH] Trade queued (${this.pendingTrades.length}/${this.config.batchSize})`);

        // Check if we should execute immediately (COUNT or HYBRID mode)
        if (this.config.mode === 'COUNT' || this.config.mode === 'HYBRID') {
            if (this.pendingTrades.length >= this.config.batchSize) {
                console.log(`[AUTO-BATCH] Batch size reached, executing now...`);
                this.executeBatch();
            }
        }

        this.emit('trade-queued', trade);
    }

    /**
     * Calculate net PnL for a batch of trades after gas + DEX fees
     * @param {Array} trades - batch of trades (each must have .pnl and .size)
     * @returns {object} { grossPnl, gasCost, dexFees, netPnl, profitable }
     */
    _calcBatchNetPnl(trades) {
        // Gas cost: flat Sonic Multicall3 rate regardless of batch size
        const gasCost = this.config.chain === 'SONIC' ? SONIC_BATCH_GAS_USD : SONIC_BATCH_GAS_USD * 2;

        // Sum gross PnL + DEX fees per trade
        let grossPnl = 0;
        let dexFees = 0;

        for (const trade of trades) {
            // PnL: use realizedPnl, pnl, or estimate from signal
            const pnl = trade.realizedPnl ?? trade.pnl ?? trade.estimatedPnl ?? 0;
            grossPnl += pnl;

            // DEX fee = size × fee_rate (for the opening + closing swap)
            const size = trade.size || trade.sizeUsd || 0;
            const feeRate = DEX_FEE_RATES[trade.dex] ?? DEX_FEE_RATES[trade.exchange] ?? DEX_FEE_RATES.default;
            dexFees += size * feeRate * 2; // ×2 for open + close
        }

        const netPnl = grossPnl - gasCost - dexFees;
        return {
            grossPnl: +grossPnl.toFixed(6),
            gasCost:  +gasCost.toFixed(6),
            dexFees:  +dexFees.toFixed(6),
            netPnl:   +netPnl.toFixed(6),
            profitable: netPnl > this.config.minNetProfitUsd,
        };
    }

    /**
     * Execute batch settlement
     */
    async executeBatch() {
        if (this.pendingTrades.length < this.config.minBatchSize) {
            return; // Not enough trades yet — wait silently
        }

        // Sort by PnL descending so profitable trades settle first
        this.pendingTrades.sort((a, b) => {
            const pnlA = a.realizedPnl ?? a.pnl ?? a.estimatedPnl ?? 0;
            const pnlB = b.realizedPnl ?? b.pnl ?? b.estimatedPnl ?? 0;
            return pnlB - pnlA;
        });

        // Take exactly batchSize trades (10)
        const tradesToSettle = this.pendingTrades.splice(0, this.config.batchSize);

        // ── HFT Profit Guard ──────────────────────────────────────────────────
        if (this.config.profitGuard) {
            const { grossPnl, gasCost, dexFees, netPnl, profitable } = this._calcBatchNetPnl(tradesToSettle);

            console.log(`[PROFIT-GUARD] Batch ${tradesToSettle.length} trades:`);
            console.log(`   Gross PnL : $${grossPnl.toFixed(4)}`);
            console.log(`   Gas cost  : $${gasCost.toFixed(6)} (Sonic Multicall3)`);
            console.log(`   DEX fees  : $${dexFees.toFixed(6)}`);
            console.log(`   Net PnL   : $${netPnl.toFixed(4)} ${profitable ? '✅ EXECUTE' : '❌ SKIP'}`);

            if (!profitable) {
                this.stats.batchesSkipped++;
                // Put trades back — they'll accumulate more until profitable
                this.pendingTrades.unshift(...tradesToSettle);
                this.emit('batch-skipped', { netPnl, grossPnl, gasCost, dexFees, trades: tradesToSettle.length });
                return;
            }

            this.stats.totalNetPnl += netPnl;
        }

        console.log(`\n${'═'.repeat(60)}`);
        console.log(`[AUTO-BATCH] Executing batch of ${tradesToSettle.length} trades...`);
        console.log('═'.repeat(60));

        try {
            const results = await this.executor.batchSettle(tradesToSettle);

            // Calculate savings
            const totalSaved = results.reduce((sum, r) => sum + (r.gasSaved || 0), 0);
            const successCount = results.filter(r => r.success).length;

            this.stats.batchesExecuted++;
            this.stats.tradesSettled += successCount;
            this.stats.totalGasSaved += totalSaved;
            this.stats.lastBatchTime = Date.now();

            console.log(`\n✅ Batch executed successfully!`);
            console.log(`   Trades: ${successCount}/${tradesToSettle.length}`);
            console.log(`   Gas saved: $${totalSaved.toFixed(6)}`);
            console.log(`   TX: ${results[0]?.txHash || 'N/A'}`);

            // Emit batch-settled with TX info for logging
            const txHash = results.find(r => r.txHash)?.txHash;
            const gasCost = results.reduce((sum, r) => sum + (r.gasCost || 0), 0);
            const explorer = results.find(r => r.explorer)?.explorer;
            this.emit('batch-settled', { count: successCount, txHash, gasCost, explorer });
            this.emit('batch-executed', {
                trades: tradesToSettle,
                results,
                totalSaved,
                successCount
            });

            return results;

        } catch (error) {
            console.error(`❌ Batch execution failed:`, error.message);

            // Re-queue trades on failure
            this.pendingTrades.unshift(...tradesToSettle);

            this.emit('batch-failed', {
                trades: tradesToSettle,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Force execute batch immediately
     */
    async flushBatch() {
        console.log(`[AUTO-BATCH] Force flushing ${this.pendingTrades.length} trades...`);
        return await this.executeBatch();
    }

    /**
     * Get current queue status
     */
    getQueueStatus() {
        return {
            pending: this.pendingTrades.length,
            minBatchSize: this.config.minBatchSize,
            maxBatchSize: this.config.maxBatchSize,
            nextBatchIn: this.batchTimer
                ? this.config.batchInterval - (Date.now() % this.config.batchInterval)
                : null,
            canBatch: this.pendingTrades.length >= this.config.minBatchSize
        };
    }

    /**
     * Get statistics
     */
    getStats() {
        const avgSavingsPerBatch = this.stats.batchesExecuted > 0
            ? (this.stats.totalGasSaved / this.stats.batchesExecuted)
            : 0;

        const avgTradesPerBatch = this.stats.batchesExecuted > 0
            ? (this.stats.tradesSettled / this.stats.batchesExecuted)
            : 0;

        const skipRate = (this.stats.batchesExecuted + this.stats.batchesSkipped) > 0
            ? (this.stats.batchesSkipped / (this.stats.batchesExecuted + this.stats.batchesSkipped) * 100).toFixed(1)
            : '0';

        return {
            ...this.stats,
            avgSavingsPerBatch: avgSavingsPerBatch.toFixed(6),
            avgTradesPerBatch: avgTradesPerBatch.toFixed(1),
            efficiency: this.stats.batchesExecuted > 0
                ? `${((this.stats.totalGasSaved / this.stats.batchesExecuted) * 100).toFixed(1)}% per batch`
                : 'N/A',
            profitGuard: {
                enabled: this.config.profitGuard,
                batchesSkipped: this.stats.batchesSkipped,
                skipRate: `${skipRate}%`,
                totalNetPnl: `$${this.stats.totalNetPnl.toFixed(4)}`,
            },
        };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        const wasRunning = this.config.enabled;

        if (wasRunning) {
            this.stop();
        }

        this.config = {
            ...this.config,
            ...newConfig
        };

        console.log(`✅ Auto-batcher config updated:`, this.config);

        if (wasRunning && this.config.enabled) {
            this.start();
        }

        this.emit('config-updated', this.config);
    }
}

module.exports = AutoBatcher;
