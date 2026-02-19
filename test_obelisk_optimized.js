#!/usr/bin/env node
/**
 * OPTIMIZED 2K TPS TEST
 * With Quick Wins applied
 */

const { ObeliskPerps } = require('./src/backend/obelisk-perps');

console.log('═'.repeat(80));
console.log('⚡ OBELISK 2K TPS TEST - OPTIMIZED');
console.log('═'.repeat(80));
console.log();

const ENABLE_TRACKING = false; // Quick Win: Disable for speed
const NUM_TRADES = parseInt(process.argv[2]) || 10000;

async function runOptimizedTest() {
    const perps = new ObeliskPerps();
    await perps.init();

    console.log(`Testing ${NUM_TRADES.toLocaleString()} trades (no tracking)...
`);

    const startTime = Date.now();
    let successful = 0;

    // Batch execution
    const batchSize = 5000;
    for (let i = 0; i < NUM_TRADES; i += batchSize) {
        const batch = [];
        const count = Math.min(batchSize, NUM_TRADES - i);

        for (let j = 0; j < count; j++) {
            const coin = ['BTC', 'ETH', 'SOL'][Math.floor(Math.random() * 3)];
            const side = Math.random() > 0.5 ? 'long' : 'short';

            batch.push(
                perps.openPosition({ coin, side, size: 10, leverage: 2, userId: 'test' })
                    .then(r => perps.closePosition({ coin, userId: 'test' }))
            );
        }

        await Promise.all(batch);
        successful += count;

        const progress = ((i + count) / NUM_TRADES * 100).toFixed(1);
        const elapsed = (Date.now() - startTime) / 1000;
        const currentTPS = (i + count) / elapsed;

        process.stdout.write(`\r   Progress: ${progress}% | ${currentTPS.toFixed(0)} TPS`);
    }

    const totalTime = Date.now() - startTime;
    const tps = NUM_TRADES / (totalTime / 1000);

    console.log('\n');
    console.log('═'.repeat(80));
    console.log('🎯 RESULTS - OPTIMIZED');
    console.log('═'.repeat(80));
    console.log();
    console.log(`Total Trades:  ${NUM_TRADES.toLocaleString()}`);
    console.log(`Successful:    ${successful.toLocaleString()}`);
    console.log(`Duration:      ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`Average TPS:   ${tps.toFixed(0)}`);
    console.log(`Avg Latency:   ${(totalTime / NUM_TRADES).toFixed(2)}ms`);
    console.log();

    if (tps >= 800) {
        console.log('✅ SUCCESS! Target 800+ TPS achieved!');
    } else if (tps >= 600) {
        console.log('⚠️  Good progress, but need more optimization');
    } else {
        console.log('❌ Need more optimization work');
    }

    console.log();
}

runOptimizedTest().catch(console.error);
