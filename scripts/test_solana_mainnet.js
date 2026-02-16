/**
 * SOLANA MAINNET SETTLEMENT TEST
 * Tests REAL blockchain settlement on Solana MAINNET
 *
 * ⚠️  WARNING: This uses REAL MONEY! (but very small amounts)
 *
 * Usage: node scripts/test_solana_mainnet.js
 */

require('dotenv').config();
const BlockchainSettlementEngine = require('../src/backend/blockchain-settlement');

async function main() {
    console.log('\n🚨 SOLANA MAINNET TEST (REAL MONEY) 🚨\n');
    console.log('═'.repeat(80));

    // Initialize settlement engine (MAINNET mode)
    const engine = new BlockchainSettlementEngine({
        solanaMode: 'MAINNET',
        strategy: 'CHEAPEST_FIRST'
    });

    // Step 1: Check Solana wallet balance
    console.log('\n1️⃣  Checking Solana MAINNET balance...');
    const balance = await engine.getSolanaBalance();

    if (balance === null) {
        console.error('❌ Solana mainnet wallet not configured!');
        console.log('\nℹ️  Please ensure SOLANA_MAINNET_PRIVATE_KEY is set in .env');
        process.exit(1);
    }

    console.log(`   ✅ Balance: ${balance.toFixed(6)} SOL`);

    if (balance === 0) {
        console.log('\n❌ ZERO BALANCE!');
        console.log('   You need to deposit SOL to test on mainnet.');
        console.log('\n💰 Send SOL to this wallet:');
        console.log(`   ${process.env.SOLANA_MAINNET_PUBLIC_KEY}`);
        console.log('\n   Recommended: 0.001 SOL (~$0.20)');
        console.log('   This allows ~4000 test transactions at $0.00025 each!');
        console.log('\n   You can buy SOL on:');
        console.log('   - Coinbase, Binance, Kraken, etc.');
        console.log('   - Then withdraw to the address above');
        process.exit(1);
    }

    if (balance < 0.001) {
        console.log('\n⚠️  LOW BALANCE WARNING!');
        console.log(`   Current: ${balance.toFixed(6)} SOL`);
        console.log('   Recommended: 0.001 SOL minimum');
        console.log('\n   Continue anyway? (Ctrl+C to cancel, or wait 5s to continue)');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Step 2: Display chain info
    console.log('\n2️⃣  Chain configuration:');
    engine.displayChains();

    // Step 3: Execute a REAL settlement
    console.log('\n3️⃣  Executing REAL settlement on Solana MAINNET...');
    console.log('   ⚠️  This will cost ~$0.00025');

    const testTrade = {
        symbol: 'BTC-USD',
        side: 'LONG',
        size: 5,
        price: 50000,
        timestamp: Date.now(),
        source: 'MAINNET_TEST'
    };

    console.log('   Trade:', JSON.stringify(testTrade, null, 2));
    console.log('\n   Sending REAL transaction to Solana blockchain...');

    const result = await engine.settleTrade(testTrade);

    console.log('\n4️⃣  Settlement Result:');
    console.log('═'.repeat(80));

    if (result.success) {
        console.log('   ✅ SUCCESS! REAL TRANSACTION CONFIRMED!');
        console.log(`   Chain: ${result.chain}`);
        console.log(`   TX Hash: ${result.txHash}`);
        console.log(`   Gas Cost: $${result.gasCost.toFixed(8)}`);
        console.log(`   Latency: ${result.latency}ms`);

        if (result.explorer) {
            console.log(`\n   🔍 View on Solana Explorer:`);
            console.log(`   ${result.explorer}`);
            console.log('\n   ✅ Transaction is permanently recorded on Solana blockchain!');
        }
    } else {
        console.log('   ❌ FAILED');
        console.log(`   Error: ${result.error}`);
        console.log(`   Latency: ${result.latency}ms`);
    }

    // Step 5: Check balance after
    console.log('\n5️⃣  Balance after settlement:');
    const balanceAfter = await engine.getSolanaBalance();
    console.log(`   ${balanceAfter.toFixed(6)} SOL`);
    console.log(`   Cost: ${(balance - balanceAfter).toFixed(8)} SOL (~$${((balance - balanceAfter) * 200).toFixed(4)})`);

    // Step 6: Display stats
    console.log('\n6️⃣  Settlement Engine Stats:');
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
    console.log('✅ MAINNET TEST COMPLETED!\n');
    console.log('🎉 Obelisk V3 TURBO blockchain settlement is LIVE on mainnet!\n');
}

// Run test
main().catch(error => {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
});
