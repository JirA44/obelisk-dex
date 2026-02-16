/**
 * TEST ALL CHAINS
 * Tests settlement on all available EVM chains
 *
 * Usage: node scripts/test_all_chains.js
 */

require('dotenv').config();
const ArbitrumExecutor = require('../src/backend/executors/arbitrum-executor');
const BaseExecutor = require('../src/backend/executors/base-executor');
const OptimismExecutor = require('../src/backend/executors/optimism-executor');
const SonicExecutor = require('../src/backend/executors/sonic-executor');

async function testChain(executor, chainName) {
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`Testing ${chainName}...`);
    console.log('═'.repeat(80));

    try {
        // Check balance
        const balance = await executor.getBalance();
        console.log(`✅ Balance: ${balance.toFixed(6)} ETH ($${(balance * 3000).toFixed(2)})`);

        if (balance < 0.0001) {
            console.log(`⚠️  Low balance, skipping settlement test`);
            return { chain: chainName, balance, settled: false };
        }

        // Execute test settlement
        const testTrade = {
            symbol: 'BTC-USD',
            side: 'LONG',
            size: 5,
            price: 50000,
            timestamp: Date.now(),
            source: `${chainName}_TEST`
        };

        console.log(`\n🔄 Executing settlement...`);
        const result = await executor.executeSettlement(testTrade);

        if (result.success) {
            console.log(`✅ SUCCESS!`);
            console.log(`   TX Hash: ${result.txHash}`);
            console.log(`   Gas Cost: $${result.gasCost.toFixed(6)}`);
            console.log(`   Latency: ${result.latency}ms`);
            console.log(`   Explorer: ${result.explorer}`);

            return {
                chain: chainName,
                balance,
                settled: true,
                txHash: result.txHash,
                gasCost: result.gasCost,
                latency: result.latency,
                explorer: result.explorer
            };
        } else {
            console.log(`❌ FAILED: ${result.error}`);
            return { chain: chainName, balance, settled: false, error: result.error };
        }

    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return { chain: chainName, settled: false, error: error.message };
    }
}

async function main() {
    console.log('\n🧪 TESTING ALL EVM CHAINS');
    console.log('═'.repeat(80));
    console.log('Testing 4 chains with same wallet...\n');

    const results = [];

    // Test Arbitrum
    const arbitrum = new ArbitrumExecutor({ network: 'MAINNET' });
    results.push(await testChain(arbitrum, 'Arbitrum'));

    // Test Base
    const base = new BaseExecutor({ network: 'MAINNET' });
    results.push(await testChain(base, 'Base'));

    // Test Optimism
    const optimism = new OptimismExecutor({ network: 'MAINNET' });
    results.push(await testChain(optimism, 'Optimism'));

    // Test Sonic
    const sonic = new SonicExecutor({ network: 'MAINNET' });
    results.push(await testChain(sonic, 'Sonic'));

    // Summary
    console.log(`\n\n${'═'.repeat(80)}`);
    console.log('📊 SUMMARY - ALL CHAINS');
    console.log('═'.repeat(80));

    console.log('\n| Chain      | Balance       | Settled | Gas Cost    | Latency  |');
    console.log('|------------|---------------|---------|-------------|----------|');

    for (const r of results) {
        const balance = r.balance ? `${r.balance.toFixed(6)} ETH` : 'N/A';
        const settled = r.settled ? '✅' : '❌';
        const gasCost = r.gasCost ? `$${r.gasCost.toFixed(6)}` : '-';
        const latency = r.latency ? `${r.latency}ms` : '-';

        console.log(`| ${r.chain.padEnd(10)} | ${balance.padEnd(13)} | ${settled.padEnd(7)} | ${gasCost.padEnd(11)} | ${latency.padEnd(8)} |`);
    }

    const totalSettled = results.filter(r => r.settled).length;
    const totalGasCost = results.reduce((sum, r) => sum + (r.gasCost || 0), 0);

    console.log('\n' + '═'.repeat(80));
    console.log(`✅ Settled: ${totalSettled}/${results.length} chains`);
    console.log(`💰 Total Gas Cost: $${totalGasCost.toFixed(6)}`);
    console.log(`⚡ Avg Gas Cost: $${(totalGasCost / totalSettled).toFixed(6)}`);
    console.log('═'.repeat(80));

    // Find cheapest
    const settled = results.filter(r => r.settled);
    if (settled.length > 0) {
        const cheapest = settled.sort((a, b) => a.gasCost - b.gasCost)[0];
        console.log(`\n💡 CHEAPEST: ${cheapest.chain} at $${cheapest.gasCost.toFixed(6)}/tx`);
    }

    console.log('\n✅ ALL TESTS COMPLETED!\n');
}

main().catch(error => {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
});
