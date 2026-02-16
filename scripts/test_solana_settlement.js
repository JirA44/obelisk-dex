/**
 * SOLANA SETTLEMENT TEST SCRIPT
 * Tests real blockchain settlement on Solana testnet
 *
 * Usage: node scripts/test_solana_settlement.js
 */

require('dotenv').config();
const BlockchainSettlementEngine = require('../src/backend/blockchain-settlement');

async function main() {
    console.log('\n🧪 SOLANA SETTLEMENT TEST\n');
    console.log('═'.repeat(80));

    // Initialize settlement engine (TESTNET mode)
    const engine = new BlockchainSettlementEngine({
        solanaMode: 'TESTNET',
        strategy: 'CHEAPEST_FIRST'
    });

    // Step 1: Check Solana wallet balance
    console.log('\n1️⃣  Checking Solana testnet balance...');
    const balance = await engine.getSolanaBalance();

    if (balance === null) {
        console.error('❌ Solana wallet not configured!');
        console.log('\nℹ️  Please ensure SOLANA_PRIVATE_KEY is set in .env');
        process.exit(1);
    }

    console.log(`   ✅ Balance: ${balance.toFixed(6)} SOL`);

    if (balance < 0.001) {
        console.log('\n⚠️  LOW BALANCE WARNING!');
        console.log('   Your testnet balance is too low to execute transactions.');
        console.log('\n💰 Get free testnet SOL:');
        console.log('   1. Install Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools');
        console.log('   2. Run: solana airdrop 2 <YOUR_WALLET> --url testnet\n');

        const stats = engine.solanaExecutor.getStats();
        console.log('   Your wallet:', stats.wallet);
        console.log('\n⏭️  Continuing with test anyway (may fail)...\n');
    }

    // Step 2: Display chain info
    console.log('\n2️⃣  Chain configuration:');
    engine.displayChains();

    // Step 3: Execute a test settlement
    console.log('\n3️⃣  Executing test settlement on Solana...');

    const testTrade = {
        symbol: 'BTC-USD',
        side: 'LONG',
        size: 5,
        price: 50000,
        timestamp: Date.now(),
        source: 'TEST'
    };

    console.log('   Trade:', JSON.stringify(testTrade, null, 2));
    console.log('\n   Sending transaction...');

    // Let the engine select the best chain (will choose Solana - cheapest + fastest)
    const result = await engine.settleTrade(testTrade);

    console.log('\n4️⃣  Settlement Result:');
    console.log('═'.repeat(80));

    if (result.success) {
        console.log('   ✅ SUCCESS!');
        console.log(`   Chain: ${result.chain}`);
        console.log(`   TX Hash: ${result.txHash}`);
        console.log(`   Gas Cost: $${result.gasCost.toFixed(6)}`);
        console.log(`   Latency: ${result.latency}ms`);

        if (result.explorer) {
            console.log(`\n   🔍 View on Explorer:`);
            console.log(`   ${result.explorer}`);
        }
    } else {
        console.log('   ❌ FAILED');
        console.log(`   Error: ${result.error}`);
        console.log(`   Latency: ${result.latency}ms`);
    }

    // Step 5: Display stats
    console.log('\n5️⃣  Settlement Engine Stats:');
    console.log('═'.repeat(80));

    const stats = engine.getStats();

    console.log('\n📊 Summary:');
    console.log(`   Total Settlements: ${stats.summary.totalSettlements}`);
    console.log(`   Total Gas Cost: $${stats.summary.totalGasCost}`);
    console.log(`   Avg Gas/Settlement: $${stats.summary.avgGasPerSettlement}`);
    console.log(`   Strategy: ${stats.summary.strategy}`);

    if (stats.solanaExecutor) {
        console.log('\n⚡ Solana Executor:');
        console.log(`   Mode: ${stats.solanaExecutor.mode}`);
        console.log(`   Wallet: ${stats.solanaExecutor.wallet}`);
        console.log(`   Settlements: ${stats.solanaExecutor.settlements}`);
        console.log(`   Total Gas: $${stats.solanaExecutor.totalGasCost}`);
        console.log(`   Success Rate: ${stats.solanaExecutor.successRate}`);
    }

    console.log('\n═'.repeat(80));
    console.log('✅ Test completed!\n');
}

// Run test
main().catch(error => {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
});
