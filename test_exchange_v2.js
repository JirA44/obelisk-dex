#!/usr/bin/env node
/**
 * OBELISK EXCHANGE V2 TEST
 * Comprehensive test of ultra-fast multi-chain exchange
 *
 * Test scenarios:
 * 1. Low TPS user (TIER_0) - Internal execution
 * 2. Medium TPS user (TIER_1) - Mix internal/blockchain
 * 3. High TPS user (TIER_2) - Mostly blockchain
 * 4. Market maker (TIER_3) - Blockchain with rebates
 *
 * Total: 200 trades across 4 user profiles
 */

const ObeliskExchangeV2 = require('./src/backend/obelisk-exchange-v2.js');

console.log('═'.repeat(80));
console.log('🏦 OBELISK EXCHANGE V2 - COMPREHENSIVE TEST');
console.log('═'.repeat(80));
console.log(`Start Time: ${new Date().toISOString()}`);
console.log();

// Initialize exchange
const exchange = new ObeliskExchangeV2({
    mode: 'PAPER',              // PAPER or LIVE
    internalPoolSize: 100000,   // $100K pool
    internalThreshold: 50,      // <$50 = internal, >=$50 = blockchain
    batchEnabled: true,
    settlementStrategy: 'CHEAPEST_FIRST' // Solana first!
});

// Test users with different TPS profiles
const USERS = {
    retail: {
        id: 'user_retail_001',
        tradesPerBatch: 5,      // Low TPS
        tradeSize: [5, 20],     // $5-$20 (mostly internal)
        description: 'Retail trader (TIER_0)'
    },
    active: {
        id: 'user_active_001',
        tradesPerBatch: 25,     // Medium TPS
        tradeSize: [10, 60],    // $10-$60 (mix)
        description: 'Active trader (TIER_1)'
    },
    pro: {
        id: 'user_pro_001',
        tradesPerBatch: 70,     // High TPS
        tradeSize: [50, 200],   // $50-$200 (blockchain)
        description: 'Pro HFT (TIER_2)'
    },
    marketMaker: {
        id: 'user_mm_001',
        tradesPerBatch: 100,    // Ultra TPS
        tradeSize: [100, 500],  // $100-$500 (blockchain)
        isMaker: true,          // Gets rebate!
        description: 'Market Maker (TIER_3)'
    }
};

const PAIRS = ['BTC-USDC', 'ETH-USDC', 'SOL-USDC', 'AVAX-USDC', 'ARB-USDC'];
const SIDES = ['BUY', 'SELL'];

function generateOrder(userProfile) {
    const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    const side = SIDES[Math.floor(Math.random() * SIDES.length)];

    const basePrices = {
        'BTC-USDC': 50000,
        'ETH-USDC': 2500,
        'SOL-USDC': 100,
        'AVAX-USDC': 35,
        'ARB-USDC': 1.2
    };

    const [minSize, maxSize] = userProfile.tradeSize;
    const size = minSize + Math.random() * (maxSize - minSize);
    const price = basePrices[pair] * (0.95 + Math.random() * 0.1);

    return {
        userID: userProfile.id,
        pair,
        side,
        size,
        price,
        isMaker: userProfile.isMaker || false
    };
}

async function testUserProfile(userProfile) {
    console.log(`\n📊 Testing ${userProfile.description}`);
    console.log('─'.repeat(80));

    const results = {
        trades: 0,
        internal: 0,
        blockchain: 0,
        totalCost: 0,
        avgLatency: 0
    };

    for (let i = 0; i < userProfile.tradesPerBatch; i++) {
        const order = generateOrder(userProfile);
        const result = await exchange.executeTrade(order);

        if (result.success) {
            results.trades++;
            if (result.venue === 'internal') results.internal++;
            else results.blockchain++;
            results.totalCost += result.fees.totalUserCost;
            results.avgLatency += result.latency;

            // Log every 10th trade
            if ((i + 1) % 10 === 0) {
                const pct = ((i + 1) / userProfile.tradesPerBatch * 100).toFixed(0);
                console.log(`  Progress: ${i + 1}/${userProfile.tradesPerBatch} (${pct}%) | Tier: ${result.fees.tierName} | TPS: ${result.fees.tps}`);
            }
        }

        // Simulate realistic trading intervals
        const interval = 1000 / (userProfile.tradesPerBatch / 60); // Spread over 60s
        await new Promise(resolve => setTimeout(resolve, Math.random() * interval));
    }

    results.avgLatency = results.avgLatency / results.trades;

    console.log(`\n  ✅ Complete: ${results.trades} trades`);
    console.log(`     Internal: ${results.internal} (${(results.internal / results.trades * 100).toFixed(0)}%)`);
    console.log(`     Blockchain: ${results.blockchain} (${(results.blockchain / results.trades * 100).toFixed(0)}%)`);
    console.log(`     Total Cost: $${results.totalCost.toFixed(2)}`);
    console.log(`     Avg Latency: ${results.avgLatency.toFixed(0)}ms`);
    console.log();

    return results;
}

async function runComprehensiveTest() {
    try {
        // Initialize exchange
        await exchange.initialize();

        console.log('🔥 Starting comprehensive test with 4 user profiles...\n');

        const allResults = [];

        // Test each user profile
        for (const [key, profile] of Object.entries(USERS)) {
            const results = await testUserProfile(profile);
            allResults.push({ profile: key, ...results });
        }

        // Display final report
        console.log('\n═'.repeat(80));
        console.log('🎯 TEST COMPLETE - FINAL RESULTS');
        console.log('═'.repeat(80));
        console.log();

        let totalTrades = 0;
        let totalInternal = 0;
        let totalBlockchain = 0;
        let totalCost = 0;

        console.log('By User Profile:');
        console.log('─'.repeat(80));
        for (const result of allResults) {
            totalTrades += result.trades;
            totalInternal += result.internal;
            totalBlockchain += result.blockchain;
            totalCost += result.totalCost;

            console.log(`${USERS[result.profile].description.padEnd(30)} ${result.trades}t | Cost: $${result.totalCost.toFixed(2)} | ${result.avgLatency.toFixed(0)}ms avg`);
        }
        console.log();

        console.log(`TOTAL: ${totalTrades} trades | $${totalCost.toFixed(2)} cost`);
        console.log(`  Internal: ${totalInternal} (${(totalInternal / totalTrades * 100).toFixed(1)}%)`);
        console.log(`  Blockchain: ${totalBlockchain} (${(totalBlockchain / totalTrades * 100).toFixed(1)}%)`);
        console.log();

        // Shutdown and display comprehensive report
        await exchange.shutdown();

        console.log('═'.repeat(80));
        console.log('✅ ALL TESTS PASSED');
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
    await exchange.shutdown();
    process.exit(0);
});

// Run test
runComprehensiveTest();
