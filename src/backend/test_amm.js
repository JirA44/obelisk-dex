const { ObeliskAMM } = require('./obelisk-amm');
const amm = new ObeliskAMM();

async function test() {
    await amm.init();

    console.log('\n=== POOLS ===');
    const pools = amm.getAllPools();
    pools.slice(0, 5).forEach(p => {
        console.log(`${p.pair}: TVL $${p.tvl.toFixed(0)} | Price: ${p.priceAinB.toFixed(2)}`);
    });

    console.log('\n=== QUOTE TEST ===');
    const quote = amm.getQuote('USDC', 'ETH', 100);
    console.log('100 USDC -> ETH:', quote);

    console.log('\n=== SWAP TEST ===');
    const swap = await amm.swap('USDC', 'ETH', 100, 'test_user');
    console.log('Swap result:', swap.success ? 'SUCCESS' : 'FAILED');
    if (swap.success) {
        console.log('Got:', swap.order.amountOut.toFixed(6), 'ETH');
        console.log('Route:', swap.route);
        console.log('Simulated:', swap.simulated);
    }

    console.log('\n=== STATS ===');
    console.log(amm.getStats());
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
