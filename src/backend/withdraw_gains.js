// Quick script to withdraw from Gains Network (epoch-based)
const { GainsExecutor } = require('./gains-executor');

async function main() {
    console.log('Initializing Gains Executor...');
    const executor = new GainsExecutor();
    await executor.init();

    // Check balances and withdrawal status
    console.log('\n=== Current Status ===');
    const balances = await executor.getBalances();
    console.log('Balances:', balances);

    const status = await executor.getWithdrawStatus('USDC');
    console.log('\nWithdraw Status:', status);

    const gUSDC = parseFloat(balances.gusdc);

    // Check if we can redeem (have matured requests)
    if (status.canRedeem) {
        console.log('\n=== Executing Withdrawal ===');
        const result = await executor.executeWithdraw('USDC');
        console.log('Result:', result);
    } else if (gUSDC > 1) {
        // No matured requests - need to make a request
        console.log('\n=== Making Withdraw Request ===');
        console.log(`Requesting withdrawal of ${gUSDC.toFixed(2)} gUSDC shares...`);
        const result = await executor.requestWithdraw(Math.floor(gUSDC), 'USDC');
        console.log('Result:', result);
    } else {
        console.log('\nNo gUSDC to withdraw');
    }

    // Final balance check
    console.log('\n=== Final Status ===');
    const finalBalances = await executor.getBalances();
    console.log('Balances:', finalBalances);
}

main().catch(console.error);
