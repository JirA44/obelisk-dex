#!/usr/bin/env node
/**
 * OBELISK STRESS TEST - MASSIVE SCALE
 * Test with THOUSANDS of trades to validate production readiness
 *
 * Test levels:
 * 1. Warm-up: 1,000 trades
 * 2. Standard: 10,000 trades
 * 3. Heavy: 100,000 trades
 * 4. Extreme: 1,000,000 trades
 *
 * Auto-promotion: After X successful testnet trades → Auto-switch to MAINNET
 */

const ObeliskExchangeV2 = require('./src/backend/obelisk-exchange-v2.js');
const RealBlockchainExecutor = require('./src/backend/real-blockchain-executor.js');

console.log('═'.repeat(80));
console.log('🔥 OBELISK STRESS TEST - MASSIVE SCALE');
console.log('═'.repeat(80));
console.log(`Start Time: ${new Date().toISOString()}`);
console.log();

// Test configuration
const TEST_LEVELS = {
    WARM_UP: {
        name: 'Warm-up',
        trades: 1000,
        description: 'Initial stress test'
    },
    STANDARD: {
        name: 'Standard',
        trades: 10000,
        description: 'Standard production load'
    },
    HEAVY: {
        name: 'Heavy',
        trades: 100000,
        description: 'Heavy traffic simulation'
    },
    EXTREME: {
        name: 'Extreme',
        trades: 1000000,
        description: 'Extreme stress test (1M trades!)'
    }
};

// Auto-promotion thresholds
const AUTO_PROMOTION = {
    testnetTradesNeeded: 10000,    // 10K successful testnet trades
    minSuccessRate: 99.5,          // 99.5% success rate
    maxAvgLatency: 500,            // Max 500ms avg latency
    enabled: true
};

// User selection (from command line)
const selectedLevel = process.argv[2]?.toUpperCase() || 'WARM_UP';
const testConfig = TEST_LEVELS[selectedLevel] || TEST_LEVELS.WARM_UP;

console.log(`📊 Test Level: ${testConfig.name}`);
console.log(`📈 Target: ${testConfig.trades.toLocaleString()} trades`);
console.log(`📝 Description: ${testConfig.description}`);
console.log();

// Initialize exchange
const exchange = new ObeliskExchangeV2({
    mode: 'TESTNET',  // Start with testnet
    internalPoolSize: 100000,
    settlementStrategy: 'CHEAPEST_FIRST' // Solana priority!
});

// Initialize blockchain executor
const blockchain = new RealBlockchainExecutor({
    mode: 'TESTNET'
});

const PAIRS = ['BTC-USDC', 'ETH-USDC', 'SOL-USDC', 'AVAX-USDC'];
const SIDES = ['BUY', 'SELL'];

// Stats tracking
const stats = {
    totalTrades: 0,
    successful: 0,
    failed: 0,
    totalLatency: 0,
    startTime: Date.now(),
    milestones: []
};

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

async function executeBatch(batchSize, batchNum) {
    const batchStart = Date.now();
    let batchSuccessful = 0;

    for (let i = 0; i < batchSize; i++) {
        const userID = `user_stress_${Math.floor(Math.random() * 100)}`;
        const order = generateOrder(userID);

        const result = await exchange.executeTrade(order);

        stats.totalTrades++;

        if (result.success) {
            stats.successful++;
            batchSuccessful++;
            stats.totalLatency += result.latency;
        } else {
            stats.failed++;
        }

        // No delay for stress test - max speed!
    }

    const batchTime = Date.now() - batchStart;
    const batchTPS = batchSize / (batchTime / 1000);

    return {
        batchNum,
        trades: batchSize,
        successful: batchSuccessful,
        time: batchTime,
        tps: batchTPS
    };
}

async function checkAutoPromotion() {
    if (!AUTO_PROMOTION.enabled) return false;

    const successRate = (stats.successful / stats.totalTrades) * 100;
    const avgLatency = stats.totalLatency / stats.successful;

    console.log('\n🔍 Checking auto-promotion criteria...');
    console.log(`   Testnet trades: ${stats.successful.toLocaleString()}/${AUTO_PROMOTION.testnetTradesNeeded.toLocaleString()}`);
    console.log(`   Success rate: ${successRate.toFixed(2)}% (need ${AUTO_PROMOTION.minSuccessRate}%)`);
    console.log(`   Avg latency: ${avgLatency.toFixed(0)}ms (max ${AUTO_PROMOTION.maxAvgLatency}ms)`);

    if (stats.successful >= AUTO_PROMOTION.testnetTradesNeeded &&
        successRate >= AUTO_PROMOTION.minSuccessRate &&
        avgLatency <= AUTO_PROMOTION.maxAvgLatency) {

        console.log('\n✅ AUTO-PROMOTION CRITERIA MET!');
        console.log('   🚀 System ready for MAINNET deployment!');
        console.log('   ⚠️  Manual approval required for mainnet switch.');

        return true;
    }

    return false;
}

async function runStressTest() {
    try {
        // Initialize
        await exchange.initialize();

        console.log('🔥 Starting stress test...\n');
        console.log(`Target: ${testConfig.trades.toLocaleString()} trades\n`);

        const batchSize = 100; // 100 trades per batch
        const numBatches = Math.ceil(testConfig.trades / batchSize);

        // Execute batches
        for (let i = 0; i < numBatches; i++) {
            const currentBatchSize = Math.min(batchSize, testConfig.trades - (i * batchSize));
            const batchResult = await executeBatch(currentBatchSize, i + 1);

            // Progress report every 10 batches
            if ((i + 1) % 10 === 0) {
                const progress = (stats.totalTrades / testConfig.trades * 100).toFixed(1);
                const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
                const avgTPS = stats.totalTrades / (elapsed);
                const successRate = (stats.successful / stats.totalTrades * 100).toFixed(2);

                console.log(`[${progress}%] Batch ${i + 1}/${numBatches} | ` +
                           `${stats.totalTrades.toLocaleString()}t | ` +
                           `${avgTPS.toFixed(0)} TPS | ` +
                           `${successRate}% success | ` +
                           `${elapsed}s`);

                // Milestone check
                if (stats.totalTrades % 10000 === 0) {
                    stats.milestones.push({
                        trades: stats.totalTrades,
                        timestamp: Date.now(),
                        successRate: parseFloat(successRate)
                    });

                    // Check auto-promotion
                    await checkAutoPromotion();
                }
            }
        }

        // Final stats
        const totalTime = (Date.now() - stats.startTime) / 1000;
        const avgTPS = stats.totalTrades / totalTime;
        const successRate = (stats.successful / stats.totalTrades) * 100;
        const avgLatency = stats.totalLatency / stats.successful;

        console.log('\n═'.repeat(80));
        console.log('🎯 STRESS TEST COMPLETE');
        console.log('═'.repeat(80));
        console.log();
        console.log(`Total Trades:      ${stats.totalTrades.toLocaleString()}`);
        console.log(`Successful:        ${stats.successful.toLocaleString()}`);
        console.log(`Failed:            ${stats.failed.toLocaleString()}`);
        console.log(`Success Rate:      ${successRate.toFixed(2)}%`);
        console.log(`Total Time:        ${totalTime.toFixed(1)}s (${(totalTime / 60).toFixed(1)}min)`);
        console.log(`Average TPS:       ${avgTPS.toFixed(0)}`);
        console.log(`Average Latency:   ${avgLatency.toFixed(0)}ms`);
        console.log();

        if (stats.milestones.length > 0) {
            console.log('📊 Milestones:');
            for (const milestone of stats.milestones) {
                console.log(`   ${milestone.trades.toLocaleString()}t: ${milestone.successRate.toFixed(2)}% success`);
            }
            console.log();
        }

        // Final auto-promotion check
        const readyForMainnet = await checkAutoPromotion();

        // Shutdown
        await exchange.shutdown();

        console.log('═'.repeat(80));
        if (readyForMainnet) {
            console.log('🚀 SYSTEM READY FOR MAINNET DEPLOYMENT');
        } else {
            console.log('✅ TEST COMPLETE - More testing needed before mainnet');
        }
        console.log('═'.repeat(80));
        console.log();

    } catch (error) {
        console.error('❌ Test error:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Interrupted by user\n');
    console.log(`Completed ${stats.totalTrades.toLocaleString()} trades before interruption`);
    await exchange.shutdown();
    process.exit(0);
});

// Run test
console.log('⚠️  WARNING: This will execute THOUSANDS of trades!');
console.log('   Press Ctrl+C to stop at any time.\n');

setTimeout(() => {
    runStressTest();
}, 2000); // 2s delay to allow user to read warning
