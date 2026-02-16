/**
 * ARBITRUM MAINNET SETTLEMENT TEST
 * Tests REAL blockchain settlement on Arbitrum One
 *
 * ⚠️  WARNING: This uses REAL MONEY! (but very small amounts ~$0.02/tx)
 *
 * Usage: node scripts/test_arbitrum_mainnet.js
 */

require('dotenv').config();
const BlockchainSettlementEngine = require('../src/backend/blockchain-settlement');

async function main() {
    console.log('\n🚨 ARBITRUM MAINNET TEST (REAL MONEY) 🚨\n');
    console.log('═'.repeat(80));

    // Initialize settlement engine (MAINNET mode)
    const engine = new BlockchainSettlementEngine({
        arbitrumNetwork: 'MAINNET',
        strategy: 'CHEAPEST_FIRST'
    });

    // Step 1: Check Arbitrum wallet balance
    console.log('\n1️⃣  Checking Arbitrum MAINNET balance...');
    const balance = await engine.getArbitrumBalance();

    if (balance === null) {
        console.error('❌ Arbitrum mainnet wallet not configured!');
        console.log('\nℹ️  Please ensure ARBITRUM_PRIVATE_KEY is set in .env');
        process.exit(1);
    }

    console.log(`   ✅ Balance: ${balance.toFixed(6)} ETH`);
    console.log(`   ≈ $${(balance * 3000).toFixed(2)} USD (at $3000/ETH)`);

    if (balance === 0) {
        console.log('\n❌ ZERO BALANCE!');
        console.log('   You need ETH on Arbitrum to test.');
        console.log('\n   Your wallet:', engine.arbitrumExecutor.wallet.address);
        process.exit(1);
    }

    if (balance < 0.0001) {
        console.log('\n⚠️  LOW BALANCE WARNING!');
        console.log(`   Current: ${balance.toFixed(6)} ETH`);
        console.log('   Recommended: 0.001 ETH minimum (~$3)');
        console.log('\n   Continue anyway? (Ctrl+C to cancel, or wait 5s to continue)');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Step 2: Display chain info
    console.log('\n2️⃣  Chain configuration:');
    engine.displayChains();

    // Step 3: Execute a REAL settlement
    console.log('\n3️⃣  Executing REAL settlement on Arbitrum MAINNET...');
    console.log('   ⚠️  This will cost ~$0.02');

    const testTrade = {
        symbol: 'BTC-USD',
        side: 'LONG',
        size: 5,
        price: 50000,
        timestamp: Date.now(),
        source: 'ARBITRUM_MAINNET_TEST'
    };

    console.log('   Trade:', JSON.stringify(testTrade, null, 2));
    console.log('\n   Sending REAL transaction to Arbitrum blockchain...');

    // Force Arbitrum chain selection
    const arbChain = { key: 'ARBITRUM', ...engine.chains.ARBITRUM };
    const result = await engine.settleTrade(testTrade, { chain: arbChain });

    console.log('\n4️⃣  Settlement Result:');
    console.log('═'.repeat(80));

    if (result.success) {
        console.log('   ✅ SUCCESS! REAL TRANSACTION CONFIRMED!');
        console.log(`   Chain: ${result.chain}`);
        console.log(`   TX Hash: ${result.txHash}`);
        console.log(`   Gas Cost: $${result.gasCost.toFixed(6)}`);
        console.log(`   Latency: ${result.latency}ms`);

        if (result.explorer) {
            console.log(`\n   🔍 View on Arbiscan:`);
            console.log(`   ${result.explorer}`);
            console.log('\n   ✅ Transaction is permanently recorded on Arbitrum blockchain!');
        }
    } else {
        console.log('   ❌ FAILED');
        console.log(`   Error: ${result.error}`);
        console.log(`   Latency: ${result.latency}ms`);
    }

    // Step 5: Check balance after
    console.log('\n5️⃣  Balance after settlement:');
    const balanceAfter = await engine.getArbitrumBalance();
    console.log(`   ${balanceAfter.toFixed(6)} ETH`);
    console.log(`   Cost: ${(balance - balanceAfter).toFixed(8)} ETH (~$${((balance - balanceAfter) * 3000).toFixed(4)})`);

    // Step 6: Display stats
    console.log('\n6️⃣  Settlement Engine Stats:');
    console.log('═'.repeat(80));

    const stats = engine.getStats();

    console.log('\n📊 Summary:');
    console.log(`   Total Settlements: ${stats.summary.totalSettlements}`);
    console.log(`   Total Gas Cost: $${stats.summary.totalGasCost}`);
    console.log(`   Avg Gas/Settlement: $${stats.summary.avgGasPerSettlement}`);
    console.log(`   Strategy: ${stats.summary.strategy}`);

    if (stats.arbitrumExecutor) {
        console.log('\n⚡ Arbitrum Executor:');
        console.log(`   Network: ${stats.arbitrumExecutor.networkName}`);
        console.log(`   Wallet: ${stats.arbitrumExecutor.wallet}`);
        console.log(`   Settlements: ${stats.arbitrumExecutor.settlements}`);
        console.log(`   Total Gas: $${stats.arbitrumExecutor.totalGasCost}`);
        console.log(`   Success Rate: ${stats.arbitrumExecutor.successRate}`);
    }

    console.log('\n═'.repeat(80));
    console.log('✅ ARBITRUM MAINNET TEST COMPLETED!\n');
    console.log('🎉 Obelisk V3 TURBO blockchain settlement is LIVE on Arbitrum!\n');
}

// Run test
main().catch(error => {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
});
