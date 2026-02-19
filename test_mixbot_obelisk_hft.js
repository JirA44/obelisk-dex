#!/usr/bin/env node
/**
 * TEST MIXBOT → OBELISK HFT INTEGRATION
 * Simulate HFT strategy using Obelisk hybrid matching
 */

const axios = require('axios').default || require('axios');

const OBELISK_API = 'http://localhost:3001';
const VENUE = 'test_hft'; // Isolated venue (not shared with live MixBot)
const CAPITAL = 5; // $5 USDC
const NUM_TRADES = 100; // Test 100 trades
const HOLD_TIME = 5000; // 5 seconds hold

console.log('═'.repeat(80));
console.log('🚀 MIXBOT → OBELISK HFT TEST');
console.log('═'.repeat(80));
console.log();
console.log(`Capital: $${CAPITAL} USDC`);
console.log(`Trades: ${NUM_TRADES}`);
console.log(`Strategy: Random BTC/ETH/SOL long/short`);
console.log();

let stats = {
    total: 0,
    successful: 0,
    failed: 0,
    totalPnL: 0,
    totalFees: 0,
    wins: 0,
    losses: 0,
    latencies: [],
    venues: {}
};

async function executeTrade(coin, side, size) {
    const startTime = Date.now();

    try {
        // 1. Open position
        const openRes = await axios.post(`${OBELISK_API}/api/trade/venue/order`, {
            venue: VENUE,
            coin,
            side: side === 'long' ? 'buy' : 'sell',
            size,
            leverage: 2
        });

        if (!openRes.data.success) {
            stats.failed++;
            console.error(`\n[FAIL #${stats.total}] OPEN ${coin}: ${openRes.data.error}`);
            return { success: false, error: 'Open failed' };
        }

        const openLatency = Date.now() - startTime;
        const orderId = openRes.data.orderId;
        const venue = openRes.data.venue || 'obelisk_internal';

        // Track venue usage
        stats.venues[venue] = (stats.venues[venue] || 0) + 1;

        // 2. Hold position
        await new Promise(r => setTimeout(r, HOLD_TIME));

        // 3. Close position
        const closeStart = Date.now();
        const closeRes = await axios.post(`${OBELISK_API}/api/trade/venue/close`, {
            venue: VENUE,
            coin: coin
        });

        const closeLatency = Date.now() - closeStart;
        const totalLatency = openLatency + closeLatency;

        if (!closeRes.data.success) {
            stats.failed++;
            console.error(`\n[FAIL #${stats.total}] CLOSE ${coin}: ${closeRes.data.error}`);
            return { success: false, error: 'Close failed' };
        }

        const pnl = closeRes.data.pnl || 0;
        const fees = (openRes.data.fees || 0) + (closeRes.data.fees || 0);

        stats.successful++;
        stats.totalPnL += pnl;
        stats.totalFees += fees;
        stats.latencies.push(totalLatency);

        if (pnl > 0) stats.wins++;
        else stats.losses++;

        return {
            success: true,
            pnl,
            fees,
            latency: totalLatency,
            venue
        };

    } catch (error) {
        stats.failed++;
        console.error(`\n[FAIL #${stats.total}] EXCEPTION ${coin}: ${error.message}`, error.response?.data || '');
        return { success: false, error: error.message };
    }
}

async function runHFTTest() {
    console.log('Starting HFT test...\n');

    const coins = ['BTC', 'ETH', 'SOL'];
    const sides = ['long', 'short'];

    const startTime = Date.now();

    for (let i = 0; i < NUM_TRADES; i++) {
        const coin = coins[Math.floor(Math.random() * coins.length)];
        const side = sides[Math.floor(Math.random() * sides.length)];
        const size = 10; // $10 position (2x leverage on $5)

        stats.total++;

        const result = await executeTrade(coin, side, size);

        const progress = ((i + 1) / NUM_TRADES * 100).toFixed(1);
        const avgLatency = stats.latencies.length > 0
            ? (stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length).toFixed(0)
            : 0;

        process.stdout.write(
            `\r   Progress: ${progress}% | ` +
            `Success: ${stats.successful}/${stats.total} | ` +
            `Avg Latency: ${avgLatency}ms | ` +
            `PnL: $${stats.totalPnL.toFixed(3)}`
        );

        // Small delay between trades (simulate HFT rate)
        await new Promise(r => setTimeout(r, 100)); // 10 trades/second
    }

    const totalTime = (Date.now() - startTime) / 1000;

    console.log('\n');
    console.log('═'.repeat(80));
    console.log('📊 HFT TEST RESULTS');
    console.log('═'.repeat(80));
    console.log();
    console.log(`Total Trades:     ${stats.total}`);
    console.log(`Successful:       ${stats.successful} (${(stats.successful/stats.total*100).toFixed(1)}%)`);
    console.log(`Failed:           ${stats.failed}`);
    console.log();
    console.log(`Win Rate:         ${stats.wins}/${stats.successful} (${(stats.wins/stats.successful*100).toFixed(1)}%)`);
    console.log(`Total PnL:        $${stats.totalPnL.toFixed(3)}`);
    console.log(`Total Fees:       $${stats.totalFees.toFixed(3)}`);
    console.log(`Net Profit:       $${(stats.totalPnL - stats.totalFees).toFixed(3)}`);
    console.log();
    console.log(`Avg Latency:      ${(stats.latencies.reduce((a,b) => a+b, 0) / stats.latencies.length).toFixed(1)}ms`);
    console.log(`Min Latency:      ${Math.min(...stats.latencies)}ms`);
    console.log(`Max Latency:      ${Math.max(...stats.latencies)}ms`);
    console.log();
    console.log(`Duration:         ${totalTime.toFixed(1)}s`);
    console.log(`Trades/second:    ${(stats.total / totalTime).toFixed(1)}`);
    console.log();
    console.log('Venue Distribution:');
    Object.entries(stats.venues).forEach(([venue, count]) => {
        console.log(`  ${venue}: ${count} (${(count/stats.successful*100).toFixed(1)}%)`);
    });
    console.log();

    // Performance vs capital
    const roi = (stats.totalPnL - stats.totalFees) / CAPITAL * 100;
    const dailyProjection = roi * (86400 / totalTime);

    console.log('═'.repeat(80));
    console.log('💰 PROFITABILITY ANALYSIS');
    console.log('═'.repeat(80));
    console.log();
    console.log(`Capital:          $${CAPITAL}`);
    console.log(`ROI (test):       ${roi.toFixed(2)}%`);
    console.log(`Daily projection: ${dailyProjection.toFixed(2)}% ROI/day`);
    console.log(`Daily profit:     $${(CAPITAL * dailyProjection / 100).toFixed(3)}/day`);
    console.log();

    if (roi > 0) {
        console.log('✅ PROFITABLE! Strategy is working!');
        console.log(`   Scale to $50: +$${(50 * dailyProjection / 100).toFixed(2)}/day`);
        console.log(`   Scale to $500: +$${(500 * dailyProjection / 100).toFixed(2)}/day`);
    } else {
        console.log('❌ NOT PROFITABLE - Fees > Profit');
        console.log('   Recommendations:');
        console.log('   - Increase hold time (reduce fees/trade ratio)');
        console.log('   - Optimize entry signals');
        console.log('   - Use Cosmos settlement ($0 gas)');
    }
    console.log();
}

runHFTTest().catch(console.error);
