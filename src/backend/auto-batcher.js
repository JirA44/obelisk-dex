/**
 * AUTO-BATCHING SYSTEM
 * Automatically groups trades and executes batch settlements
 *
 * Modes:
 * - TIME: Batch every X seconds
 * - COUNT: Batch when N trades accumulated
 * - HYBRID: Whichever comes first
 *
 * Version: 1.0
 * Date: 2026-02-17
 */

const EventEmitter = require('events');

class AutoBatcher extends EventEmitter {
    constructor(smartAccountExecutor, config = {}) {
        super();

        this.executor = smartAccountExecutor;

        // Configuration
        this.config = {
            mode: config.mode || 'HYBRID',           // TIME, COUNT, HYBRID
            batchInterval: config.batchInterval || 10000,  // 10 seconds
            batchSize: config.batchSize || 10,       // 10 trades per batch
            minBatchSize: config.minBatchSize || 1,  // Min 1 trade to batch
            maxBatchSize: config.maxBatchSize || 50, // Max 50 trades per batch
            enabled: config.enabled !== false
        };

        // Pending trades queue
        this.pendingTrades = [];
        this.batchTimer = null;

        // Statistics
        this.stats = {
            tradesQueued: 0,
            batchesExecuted: 0,
            tradesSettled: 0,
            totalGasSaved: 0,
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
     * Execute batch settlement
     */
    async executeBatch() {
        if (this.pendingTrades.length < this.config.minBatchSize) {
            console.log(`[AUTO-BATCH] Not enough trades to batch (${this.pendingTrades.length}/${this.config.minBatchSize})`);
            return;
        }

        // Take up to maxBatchSize trades
        const tradesToSettle = this.pendingTrades.splice(0, this.config.maxBatchSize);

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

        return {
            ...this.stats,
            avgSavingsPerBatch: avgSavingsPerBatch.toFixed(6),
            avgTradesPerBatch: avgTradesPerBatch.toFixed(1),
            efficiency: this.stats.batchesExecuted > 0
                ? `${((this.stats.totalGasSaved / this.stats.batchesExecuted) * 100).toFixed(1)}% per batch`
                : 'N/A'
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
