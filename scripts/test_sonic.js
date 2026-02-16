/**
 * SONIC EXECUTOR TEST
 * Tests Sonic (ex-Fantom) - Ultra fast & ultra cheap blockchain
 *
 * TPS: 10,000+
 * Fees: ~$0.0001/tx (4x cheaper than Solana!)
 *
 * Usage: node scripts/test_sonic.js
 */

require('dotenv').config();
const SonicExecutor = require('../src/backend/executors/sonic-executor');

async function main() {
    console.log('\n🔥 SONIC EXECUTOR TEST (Ultra Fast & Cheap!)\n');
    console.log('═'.repeat(80));

    // Initialize Sonic executor
    const executor = new SonicExecutor({
        network: 'MAINNET'
    });

    // Step 1: Check wallet balance
    console.log('\n1️⃣  Checking Sonic MAINNET balance...');
    const balance = await executor.getBalance();

    if (balance === null) {
        console.error('❌ Sonic wallet not configured!');
        process.exit(1);
    }

    console.log(`   ✅ Balance: ${balance.toFixed(6)} S (Sonic)`);
    console.log(`   ≈ $${(balance * 1).toFixed(2)} USD (at $1/S)`);

    if (balance === 0) {
        console.log('\n❌ ZERO BALANCE!');
        console.log('   You need S tokens on Sonic to test.');
        console.log('\n   Your wallet:', executor.wallet.address);
        console.log('\n💰 Get Sonic (S) tokens:');
        console.log('   1. Bridge from Ethereum/Arbitrum: https://bridge.soniclabs.com');
        console.log('   2. Buy on exchange and withdraw to Sonic network');
        console.log('   3. Swap on Sonic DEX (if you have other tokens)');
        process.exit(1);
    }

    if (balance < 0.01) {
        console.log('\n⚠️  LOW BALANCE WARNING!');
        console.log(`   Current: ${balance.toFixed(6)} S`);
        console.log('   Recommended: 0.1 S minimum (~$0.10)');
        console.log('\n   Continue anyway? (Ctrl+C to cancel, 5s to continue)');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Step 2: Execute test settlement
    console.log('\n2️⃣  Executing test settlement on Sonic...');
    console.log('   ⚠️  Cost: ~$0.0001 (ULTRA CHEAP!)');

    const testTrade = {
        symbol: 'BTC-USD',
        side: 'LONG',
        size: 5,
        price: 50000,
        timestamp: Date.now(),
        source: 'SONIC_TEST'
    };

    console.log('   Trade:', JSON.stringify(testTrade, null, 2));
    console.log('\n   Sending REAL transaction to Sonic blockchain...');

    const result = await executor.executeSettlement(testTrade);

    console.log('\n3️⃣  Settlement Result:');
    console.log('═'.repeat(80));

    if (result.success) {
        console.log('   ✅ SUCCESS! REAL TRANSACTION CONFIRMED!');
        console.log(`   TX Hash: ${result.txHash}`);
        console.log(`   Gas Cost: $${result.gasCost.toFixed(8)} 🔥 ULTRA CHEAP!`);
        console.log(`   Latency: ${result.latency}ms`);

        if (result.explorer) {
            console.log(`\n   🔍 View on Sonic Explorer:`);
            console.log(`   ${result.explorer}`);
        }
    } else {
        console.log('   ❌ FAILED');
        console.log(`   Error: ${result.error}`);
    }

    // Step 4: Check balance after
    console.log('\n4️⃣  Balance after settlement:');
    const balanceAfter = await executor.getBalance();
    console.log(`   ${balanceAfter.toFixed(6)} S`);
    console.log(`   Cost: ${(balance - balanceAfter).toFixed(8)} S (~$${((balance - balanceAfter) * 1).toFixed(6)})`);

    // Step 5: Display stats
    console.log('\n5️⃣  Executor Stats:');
    console.log('═'.repeat(80));

    const stats = executor.getStats();

    console.log(`\n📊 Summary:`);
    console.log(`   Network: ${stats.networkName}`);
    console.log(`   Wallet: ${stats.wallet}`);
    console.log(`   Settlements: ${stats.settlements}`);
    console.log(`   Total Gas: $${stats.totalGasCost}`);
    console.log(`   Avg Gas/Settlement: $${stats.avgGasPerSettlement}`);
    console.log(`   Success Rate: ${stats.successRate}`);

    console.log('\n═'.repeat(80));
    console.log('✅ SONIC TEST COMPLETED!\n');

    console.log('💡 SONIC = ULTRA CHEAP SETTLEMENT');
    console.log('   - 10,000+ TPS (faster than most blockchains)');
    console.log('   - $0.0001/tx (4x cheaper than Solana!)');
    console.log('   - Perfect for high-frequency trading');
    console.log('   - Compatible with MetaMask Smart Accounts\n');
}

// Run test
main().catch(error => {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
});
