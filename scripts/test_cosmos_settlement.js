/**
 * COSMOS SETTLEMENT TEST SCRIPT
 * Tests real blockchain settlement on Cosmos Hub testnet
 *
 * Usage: node scripts/test_cosmos_settlement.js
 */

require('dotenv').config();
const BlockchainSettlementEngine = require('../src/backend/blockchain-settlement');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('\n🧪 COSMOS SETTLEMENT TEST\n');
    console.log('═'.repeat(80));

    // Initialize settlement engine (TESTNET mode)
    const engine = new BlockchainSettlementEngine({
        cosmosNetwork: 'COSMOS_TESTNET',
        strategy: 'CHEAPEST_FIRST'
    });

    // Wait for Cosmos executor to initialize (async)
    console.log('\n⏳ Initializing Cosmos executor...');
    await sleep(2000);

    // Step 1: Check Cosmos wallet balance
    console.log('\n1️⃣  Checking Cosmos testnet balance...');
    const balance = await engine.getCosmosBalance();

    if (balance === null) {
        console.error('❌ Cosmos wallet not configured!');
        console.log('\nℹ️  Please ensure COSMOS_MNEMONIC is set in .env');
        process.exit(1);
    }

    console.log(`   ✅ Balance: ${balance.toFixed(6)} ATOM`);

    if (balance < 0.001) {
        console.log('\n⚠️  LOW BALANCE WARNING!');
        console.log('   Your testnet balance is too low to execute transactions.');
        console.log('\n💰 Get free testnet ATOM:');
        console.log('   1. Join Cosmos Discord: https://discord.gg/cosmosnetwork');
        console.log('   2. Go to #cosmos-testnet-faucet channel');
        console.log('   3. Request: !faucet <YOUR_WALLET>\n');

        if (engine.cosmosExecutor && engine.cosmosExecutor.wallet) {
            const [account] = await engine.cosmosExecutor.wallet.getAccounts();
            console.log('   Your wallet:', account.address);
        }
        console.log('\n⏭️  Continuing with test anyway (may fail)...\n');
    }

    // Step 2: Display chain info
    console.log('\n2️⃣  Chain configuration:');
    engine.displayChains();

    // Step 3: Execute a test settlement
    console.log('\n3️⃣  Executing test settlement on Cosmos...');

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

    // Force Cosmos chain selection
    const cosmosChain = { key: 'COSMOS', ...engine.chains.COSMOS };
    const result = await engine.settleTrade(testTrade, { chain: cosmosChain });

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

    // Step 4: Display stats
    console.log('\n5️⃣  Settlement Engine Stats:');
    console.log('═'.repeat(80));

    const stats = engine.getStats();

    console.log('\n📊 Summary:');
    console.log(`   Total Settlements: ${stats.summary.totalSettlements}`);
    console.log(`   Total Gas Cost: $${stats.summary.totalGasCost}`);
    console.log(`   Avg Gas/Settlement: $${stats.summary.avgGasPerSettlement}`);
    console.log(`   Strategy: ${stats.summary.strategy}`);

    if (stats.cosmosExecutor) {
        console.log('\n⚡ Cosmos Executor:');
        console.log(`   Network: ${stats.cosmosExecutor.networkName}`);
        console.log(`   Wallet: ${stats.cosmosExecutor.wallet || 'not loaded'}`);
        console.log(`   Settlements: ${stats.cosmosExecutor.settlements}`);
        console.log(`   Total Gas: $${stats.cosmosExecutor.totalGasCost}`);
        console.log(`   Success Rate: ${stats.cosmosExecutor.successRate}`);
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
