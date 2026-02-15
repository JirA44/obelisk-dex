#!/usr/bin/env node
/**
 * OBELISK V3 TURBO - SIMPLE PERFORMANCE TEST
 * NO TRACKING - Pure performance measurement
 *
 * Target: Demonstrate 10K-100K TPS
 */

const BatchExecutor = require('./src/backend/batch-executor.js');
const ParallelProcessor = require('./src/backend/parallel-processor.js');

console.log('═'.repeat(80));
console.log('🚀 OBELISK V3 TURBO - PERFORMANCE TEST (NO TRACKING)');
console.log('═'.repeat(80));
console.log(`Start Time: ${new Date().toISOString()}`);
console.log();

// Test configuration
const numTrades = parseInt(process.argv[2]) || 10000;

console.log(`📊 Target: ${numTrades.toLocaleString()} trades`);
console.log();

// Initialize components
const batchExecutor = new BatchExecutor({
    batchSize: 100,
    maxBatchWait: 100 // 100ms max wait
});

const parallelProcessor = new ParallelProcessor({
    maxConcurrent: 1000
});

const PAIRS = ['BTC-USDC', 'ETH-USDC', 'SOL-USDC', 'AVAX-USDC'];
const SIDES = ['BUY', 'SELL'];
const CHAINS = ['SOLANA', 'AVALANCHE', 'BASE'];

/**
 * Generate random order
 */
function generateOrder() {
    return {
        pair: PAIRS[Math.floor(Math.random() * PAIRS.length)],
        side: SIDES[Math.floor(Math.random() * SIDES.length)],
        size: 10 + Math.random() * 90,
        price: 1000 + Math.random() * 50000,
        chain: CHAINS[Math.floor(Math.random() * CHAINS.length)]
    };
}

/**
 * Execute trade (simulated)
 */
async function executeTrade(order) {
    // Determine execution method
    const useInternal = order.size < 50;

    if (useInternal) {
        // Internal pool - instant
        await new Promise(resolve => setTimeout(resolve, 1));
        return { success: true, venue: 'internal', gasUsed: 0 };
    } else {
        // Blockchain - batched
        const result = await batchExecutor.addTrade(order, order.chain);
        return { success: true, venue: 'blockchain', ...result };
    }
}

/**
 * Run performance test
 */
async function runPerformanceTest() {
    try {
        console.log('📝 Generating orders...');
        const orders = Array.from({ length: numTrades }, () => generateOrder());
        console.log(`✅ Generated ${orders.length.toLocaleString()} orders\n`);

        console.log('🚀 Executing trades in TURBO mode...\n');

        const startTime = Date.now();

        // Execute all trades in parallel
        const result = await parallelProcessor.executeWithControl(
            orders,
            (order) => executeTrade(order)
        );

        // Wait for all batches to flush
        await batchExecutor.flushAll();

        const totalTime = Date.now() - startTime;
        const tps = numTrades / (totalTime / 1000);

        console.log('\n═'.repeat(80));
        console.log('🎯 TEST COMPLETE');
        console.log('═'.repeat(80));
        console.log();
        console.log(`Total Trades:      ${numTrades.toLocaleString()}`);
        console.log(`Successful:        ${result.filter(r => r.success).length.toLocaleString()}`);
        console.log(`Total Time:        ${(totalTime / 1000).toFixed(2)}s`);
        console.log(`Average TPS:       ${tps.toFixed(0)}`);
        console.log();

        // Performance comparison
        console.log('📊 PERFORMANCE COMPARISON');
        console.log('─'.repeat(80));
        console.log(`V2 (Sequential):   ~3-4 TPS`);
        console.log(`V3 TURBO:          ${tps.toFixed(0)} TPS`);
        console.log(`Improvement:       ${(tps / 3.5).toFixed(0)}x faster!`);
        console.log();

        // Show detailed stats
        batchExecutor.displayStats();
        parallelProcessor.displayStats();

        // Shutdown
        parallelProcessor.shutdown();

        console.log('═'.repeat(80));
        console.log('✅ PERFORMANCE TEST COMPLETE');
        console.log('═'.repeat(80));
        console.log();

    } catch (error) {
        console.error('❌ Test error:', error);
        process.exit(1);
    }
}

// Run test
runPerformanceTest();
