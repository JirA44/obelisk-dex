#!/usr/bin/env node
/**
 * OBELISK V3 TURBO - PERFORMANCE TEST
 * Demonstrates 10K-100K TPS through optimizations
 *
 * Tests:
 * 1. Batch Execution: 100 trades/batch
 * 2. Parallel Processing: 1000 concurrent trades
 * 3. TURBO MODE: 10,000+ TPS target
 */

const ObeliskExchangeV3Turbo = require('./src/backend/obelisk-exchange-v3-turbo.js');

console.log('═'.repeat(80));
console.log('🚀 OBELISK V3 TURBO - PERFORMANCE TEST');
console.log('═'.repeat(80));
console.log(`Start Time: ${new Date().toISOString()}`);
console.log();

// Test configuration
const TEST_SIZES = {
    SMALL: 1000,     // 1K trades - warm-up
    MEDIUM: 10000,   // 10K trades - standard
    LARGE: 100000,   // 100K trades - stress test
    EXTREME: 1000000 // 1M trades - ultimate test
};

// Get test size from command line
const testSize = process.argv[2]?.toUpperCase() || 'MEDIUM';
const numTrades = TEST_SIZES[testSize] || TEST_SIZES.MEDIUM;

console.log(`📊 Test Size: ${testSize}`);
console.log(`📈 Target: ${numTrades.toLocaleString()} trades`);
console.log();

// Initialize exchange
const exchange = new ObeliskExchangeV3Turbo({
    mode: 'TESTNET',
    internalPoolSize: 100000,
    internalThreshold: 50, // <$50 = internal pool
    settlementStrategy: 'CHEAPEST_FIRST',
    batchSize: 100, // 100 trades per batch
    maxConcurrent: 1000 // 1000 parallel trades
});

// Trading pairs
const PAIRS = ['BTC-USDC', 'ETH-USDC', 'SOL-USDC', 'AVAX-USDC'];
const SIDES = ['BUY', 'SELL'];

/**
 * Generate random order
 */
function generateOrder(userID) {
    const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    const side = SIDES[Math.floor(Math.random() * SIDES.length)];
    const size = 10 + Math.random() * 90; // $10-$100
    const price = 1000 + Math.random() * 50000;

    return {
        userID,
        pair,
        side,
        size,
        price,
        isMaker: Math.random() > 0.5
    };
}

/**
 * Run performance test
 */
async function runPerformanceTest() {
    try {
        // Initialize
        await exchange.initialize();

        console.log('🔥 Starting TURBO performance test...\n');
        console.log(`Target: ${numTrades.toLocaleString()} trades\n`);

        // Generate all orders upfront
        console.log('📝 Generating orders...');
        const orders = [];
        for (let i = 0; i < numTrades; i++) {
            const userID = `user_turbo_${Math.floor(Math.random() * 100)}`;
            orders.push(generateOrder(userID));
        }
        console.log(`✅ Generated ${orders.length.toLocaleString()} orders\n`);

        // Execute in TURBO mode (parallel + batched)
        const result = await exchange.executeBulk(orders);

        console.log('\n═'.repeat(80));
        console.log('🎯 TEST COMPLETE');
        console.log('═'.repeat(80));
        console.log();
        console.log(`Total Trades:      ${numTrades.toLocaleString()}`);
        console.log(`Successful:        ${result.successful.toLocaleString()}`);
        console.log(`Failed:            ${result.failed.toLocaleString()}`);
        console.log(`Success Rate:      ${(result.successful / numTrades * 100).toFixed(2)}%`);
        console.log(`Total Time:        ${(result.totalTime / 1000).toFixed(1)}s`);
        console.log(`Average TPS:       ${result.tps.toFixed(0)}`);
        console.log();

        // Performance comparison
        console.log('📊 PERFORMANCE COMPARISON');
        console.log('─'.repeat(80));
        console.log(`V2 (Sequential):   ~3-4 TPS`);
        console.log(`V3 TURBO:          ${result.tps.toFixed(0)} TPS`);
        console.log(`Improvement:       ${(result.tps / 3.5).toFixed(0)}x faster!`);
        console.log();

        // Show detailed stats
        exchange.displayPerformance();

        // Shutdown
        await exchange.shutdown();

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
console.log('⚠️  WARNING: This will execute THOUSANDS of trades in TURBO mode!');
console.log('   Maximum parallelization + batch execution enabled.\n');

setTimeout(() => {
    runPerformanceTest();
}, 2000); // 2s delay to allow user to read warning
