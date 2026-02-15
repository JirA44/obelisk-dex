/**
 * PARALLEL TRADE PROCESSOR - HIGH PERFORMANCE
 * Executes multiple trades concurrently for maximum TPS
 *
 * Features:
 * - Parallel execution with Promise.all
 * - Configurable concurrency limit
 * - Load balancing across chains
 * - Real-time TPS monitoring
 */

class ParallelProcessor {
    constructor(config = {}) {
        this.config = {
            maxConcurrent: config.maxConcurrent || 1000, // Max parallel trades
            internalPoolConcurrent: config.internalPoolConcurrent || 10000, // Internal pool can handle more
            batchExecutor: config.batchExecutor || null, // Optional batch executor
            ...config
        };

        // Active trades counter
        this.activeTrades = 0;
        this.queuedTrades = [];

        // Stats
        this.stats = {
            totalTrades: 0,
            concurrent: 0,
            maxConcurrent: 0,
            avgLatency: 0,
            totalLatency: 0,
            tpsHistory: [],
            startTime: Date.now()
        };

        // TPS monitoring
        this.tpsWindow = [];
        this.tpsInterval = setInterval(() => {
            this.updateTPS();
        }, 1000); // Update TPS every second

        console.log('⚡ Parallel Processor initialized');
        console.log(`   Max Concurrent: ${this.config.maxConcurrent}`);
        console.log(`   Internal Pool Concurrent: ${this.config.internalPoolConcurrent}`);
    }

    /**
     * Execute trade with parallelization
     */
    async executeTrade(trade, executor) {
        // Wait if at max concurrency
        while (this.activeTrades >= this.config.maxConcurrent) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        this.activeTrades++;
        this.stats.concurrent = this.activeTrades;
        this.stats.maxConcurrent = Math.max(this.stats.maxConcurrent, this.activeTrades);

        const startTime = Date.now();

        try {
            // Execute trade
            const result = await executor(trade);

            const latency = Date.now() - startTime;

            // Update stats
            this.stats.totalTrades++;
            this.stats.totalLatency += latency;
            this.stats.avgLatency = this.stats.totalLatency / this.stats.totalTrades;

            // Track for TPS calculation
            this.tpsWindow.push({
                timestamp: Date.now(),
                trades: 1
            });

            return {
                ...result,
                latency,
                concurrent: this.activeTrades
            };

        } finally {
            this.activeTrades--;
        }
    }

    /**
     * Execute batch of trades in parallel
     */
    async executeBatch(trades, executor) {
        console.log(`\n⚡ Executing ${trades.length} trades in parallel...`);

        const startTime = Date.now();

        // Execute all trades concurrently
        const results = await Promise.all(
            trades.map(trade => this.executeTrade(trade, executor))
        );

        const totalTime = Date.now() - startTime;
        const tps = trades.length / (totalTime / 1000);

        console.log(`   ✅ Batch complete: ${totalTime}ms, ${tps.toFixed(0)} TPS`);

        return {
            results,
            totalTime,
            tps,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        };
    }

    /**
     * Execute trades with controlled parallelism
     * Splits into chunks based on maxConcurrent
     */
    async executeWithControl(trades, executor) {
        console.log(`\n🚀 Processing ${trades.length} trades with controlled parallelism...`);
        console.log(`   Max concurrent: ${this.config.maxConcurrent}`);

        const results = [];
        const chunkSize = this.config.maxConcurrent;

        for (let i = 0; i < trades.length; i += chunkSize) {
            const chunk = trades.slice(i, i + chunkSize);
            const chunkNum = Math.floor(i / chunkSize) + 1;
            const totalChunks = Math.ceil(trades.length / chunkSize);

            console.log(`   📦 Chunk ${chunkNum}/${totalChunks}: ${chunk.length} trades`);

            const chunkResults = await this.executeBatch(chunk, executor);
            results.push(...chunkResults.results);

            const progress = ((i + chunk.length) / trades.length * 100).toFixed(1);
            console.log(`   Progress: ${progress}% (${i + chunk.length}/${trades.length})`);
        }

        return results;
    }

    /**
     * Update TPS calculation
     */
    updateTPS() {
        const now = Date.now();
        const windowSize = 5000; // 5 second window

        // Remove old entries
        this.tpsWindow = this.tpsWindow.filter(entry =>
            now - entry.timestamp < windowSize
        );

        // Calculate TPS
        const totalTrades = this.tpsWindow.reduce((sum, entry) => sum + entry.trades, 0);
        const tps = totalTrades / (windowSize / 1000);

        this.stats.tpsHistory.push({
            timestamp: now,
            tps: tps
        });

        // Keep only last 100 TPS readings
        if (this.stats.tpsHistory.length > 100) {
            this.stats.tpsHistory.shift();
        }

        return tps;
    }

    /**
     * Get current TPS
     */
    getCurrentTPS() {
        return this.updateTPS();
    }

    /**
     * Get average TPS
     */
    getAverageTPS() {
        if (this.stats.tpsHistory.length === 0) return 0;

        const sum = this.stats.tpsHistory.reduce((acc, entry) => acc + entry.tps, 0);
        return sum / this.stats.tpsHistory.length;
    }

    /**
     * Get max TPS achieved
     */
    getMaxTPS() {
        if (this.stats.tpsHistory.length === 0) return 0;

        return Math.max(...this.stats.tpsHistory.map(entry => entry.tps));
    }

    /**
     * Get processor stats
     */
    getStats() {
        const runtime = (Date.now() - this.stats.startTime) / 1000;
        const avgTPS = this.stats.totalTrades / runtime;

        return {
            totalTrades: this.stats.totalTrades,
            runtime: runtime.toFixed(1) + 's',
            avgTPS: avgTPS.toFixed(2),
            currentTPS: this.getCurrentTPS().toFixed(2),
            maxTPS: this.getMaxTPS().toFixed(2),
            avgLatency: this.stats.avgLatency.toFixed(0) + 'ms',
            maxConcurrent: this.stats.maxConcurrent,
            activeTrades: this.activeTrades
        };
    }

    /**
     * Display stats
     */
    displayStats() {
        const stats = this.getStats();

        console.log('\n══════════════════════════════════════════════════════════════');
        console.log('⚡ PARALLEL PROCESSOR STATS');
        console.log('══════════════════════════════════════════════════════════════');
        console.log();
        console.log(`Total Trades:      ${stats.totalTrades.toLocaleString()}`);
        console.log(`Runtime:           ${stats.runtime}`);
        console.log(`Average TPS:       ${stats.avgTPS}`);
        console.log(`Current TPS:       ${stats.currentTPS}`);
        console.log(`Max TPS:           ${stats.maxTPS}`);
        console.log(`Avg Latency:       ${stats.avgLatency}`);
        console.log(`Max Concurrent:    ${stats.maxConcurrent}`);
        console.log(`Active Trades:     ${stats.activeTrades}`);
        console.log('══════════════════════════════════════════════════════════════');
        console.log();
    }

    /**
     * Shutdown processor
     */
    shutdown() {
        if (this.tpsInterval) {
            clearInterval(this.tpsInterval);
        }
        console.log('⚡ Parallel Processor shutdown');
    }
}

module.exports = ParallelProcessor;
