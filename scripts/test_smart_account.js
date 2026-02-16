/**
 * SMART ACCOUNT TEST SCRIPT
 * Tests batch settlement and Smart Account features
 *
 * Usage: node scripts/test_smart_account.js
 */

require('dotenv').config();
const SmartAccountExecutor = require('../src/backend/executors/smart-account-executor');

async function main() {
    console.log('\n🧠 SMART ACCOUNT EXECUTOR TEST\n');
    console.log('═'.repeat(80));

    // Initialize executor (Arbitrum mainnet)
    const executor = new SmartAccountExecutor({
        network: 'ARBITRUM',
        mode: 'MAINNET'
    });

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 1: Check wallet balance
    console.log('\n1️⃣  Checking wallet balance...');
    const balance = await executor.getBalance();

    if (balance === null) {
        console.error('❌ Wallet not configured!');
        process.exit(1);
    }

    console.log(`   ✅ Balance: ${balance.toFixed(6)} ETH ($${(balance * 3000).toFixed(2)})`);

    if (!executor.isSmartAccount) {
        console.log('\n⚠️  STANDARD EOA DETECTED');
        console.log('   Your wallet is not upgraded to Smart Account yet.');
        console.log('   Batch transactions will still work, but without extra savings.\n');
        SmartAccountExecutor.upgradeGuide();
        console.log('   Continue with test anyway? (Ctrl+C to cancel, 5s to continue)');
        await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
        console.log('\n✅ SMART ACCOUNT DETECTED!');
        console.log('   Your wallet has EIP-7702 delegation enabled!');
        console.log('   Batch transactions will provide maximum gas savings!\n');
    }

    // Step 2: Test single settlement
    console.log('\n2️⃣  Testing single settlement...');

    const singleTrade = {
        symbol: 'BTC-USD',
        side: 'LONG',
        size: 5,
        price: 50000,
        timestamp: Date.now()
    };

    const singleResult = await executor.executeSettlement(singleTrade);

    if (singleResult.success) {
        console.log(`   ✅ Single settlement: $${singleResult.gasCost.toFixed(6)}`);
        console.log(`   TX: ${singleResult.txHash}`);
    } else {
        console.log(`   ❌ Failed: ${singleResult.error}`);
    }

    // Step 3: Test BATCH settlement (THE KILLER FEATURE!)
    console.log('\n3️⃣  Testing BATCH settlement (5 trades in 1 tx)...');

    const batchTrades = [
        { symbol: 'BTC-USD', side: 'LONG', size: 5, price: 50000, timestamp: Date.now() },
        { symbol: 'ETH-USD', side: 'LONG', size: 10, price: 3000, timestamp: Date.now() },
        { symbol: 'SOL-USD', side: 'SHORT', size: 20, price: 200, timestamp: Date.now() },
        { symbol: 'AVAX-USD', side: 'LONG', size: 15, price: 40, timestamp: Date.now() },
        { symbol: 'LINK-USD', side: 'SHORT', size: 30, price: 20, timestamp: Date.now() }
    ];

    console.log(`   Batching ${batchTrades.length} trades...`);

    const batchResults = await executor.batchSettle(batchTrades);

    if (batchResults.length > 0 && batchResults[0].success) {
        const totalCost = batchResults.reduce((sum, r) => sum + r.gasCost, 0);
        const totalSaved = batchResults.reduce((sum, r) => sum + (r.gasSaved || 0), 0);

        console.log(`\n   ✅ BATCH SETTLEMENT SUCCESS!`);
        console.log(`   Total trades: ${batchResults.length}`);
        console.log(`   Total gas cost: $${totalCost.toFixed(6)}`);
        console.log(`   Avg per trade: $${(totalCost / batchResults.length).toFixed(6)}`);

        if (totalSaved > 0) {
            console.log(`   💰 Gas saved: $${totalSaved.toFixed(6)} (${((totalSaved / (totalCost + totalSaved)) * 100).toFixed(1)}%)`);
        }

        console.log(`   TX: ${batchResults[0].txHash}`);
        console.log(`   Explorer: ${batchResults[0].explorer}`);
    } else {
        console.log(`   ❌ Batch failed, results:`, batchResults);
    }

    // Step 4: Display stats
    console.log('\n4️⃣  Executor Stats:');
    console.log('═'.repeat(80));

    const stats = executor.getStats();

    console.log(`\n📊 Summary:`);
    console.log(`   Network: ${stats.networkName}`);
    console.log(`   Wallet: ${stats.wallet}`);
    console.log(`   Smart Account: ${stats.isSmartAccount ? '✅ ENABLED' : '❌ Disabled'}`);
    console.log(`   Total Settlements: ${stats.settlements}`);
    console.log(`   Batch Settlements: ${stats.batchSettlements}`);
    console.log(`   Total Gas Cost: $${stats.totalGasCost}`);
    console.log(`   Total Gas Saved: $${stats.totalGasSaved}`);
    console.log(`   Avg Gas/Settlement: $${stats.avgGasPerSettlement}`);
    console.log(`   Success Rate: ${stats.successRate}`);
    console.log(`   Efficiency: ${stats.efficiency}`);

    console.log('\n═'.repeat(80));
    console.log('✅ TEST COMPLETED!\n');

    if (!executor.isSmartAccount) {
        console.log('💡 TIP: Upgrade to Smart Account for even better gas savings!');
        console.log('   Run: node scripts/test_smart_account.js --upgrade-guide\n');
    }
}

// Run test
if (process.argv.includes('--upgrade-guide')) {
    SmartAccountExecutor.upgradeGuide();
} else {
    main().catch(error => {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    });
}
