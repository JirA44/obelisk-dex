/**
 * SOLANA TESTNET AIRDROP
 * Requests 2 SOL from Solana testnet faucet
 *
 * Usage: node scripts/solana_airdrop.js
 */

require('dotenv').config();
const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function requestAirdrop() {
    console.log('\n💰 SOLANA TESTNET AIRDROP\n');
    console.log('═'.repeat(60));

    // Load wallet from .env
    if (!process.env.SOLANA_PRIVATE_KEY) {
        console.error('❌ SOLANA_PRIVATE_KEY not found in .env');
        process.exit(1);
    }

    let wallet;
    try {
        const secretKey = new Uint8Array(JSON.parse(process.env.SOLANA_PRIVATE_KEY));
        wallet = Keypair.fromSecretKey(secretKey);
        console.log('✅ Wallet loaded:', wallet.publicKey.toString());
    } catch (error) {
        console.error('❌ Failed to load wallet:', error.message);
        process.exit(1);
    }

    // Connect to testnet
    const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
    console.log('✅ Connected to Solana testnet');

    // Check current balance
    console.log('\n📊 Current balance...');
    const balanceBefore = await connection.getBalance(wallet.publicKey);
    console.log(`   ${(balanceBefore / LAMPORTS_PER_SOL).toFixed(6)} SOL`);

    // Request airdrop (2 SOL)
    console.log('\n💸 Requesting airdrop (2 SOL)...');
    console.log('   (This may take 30-60 seconds)');

    try {
        const signature = await connection.requestAirdrop(
            wallet.publicKey,
            2 * LAMPORTS_PER_SOL
        );

        console.log('   Transaction signature:', signature);
        console.log('   Confirming...');

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');

        console.log('   ✅ Airdrop confirmed!');

        // Check new balance
        const balanceAfter = await connection.getBalance(wallet.publicKey);
        console.log('\n📊 New balance:');
        console.log(`   ${(balanceAfter / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
        console.log(`   (+${((balanceAfter - balanceBefore) / LAMPORTS_PER_SOL).toFixed(6)} SOL)`);

        console.log('\n🔍 View transaction:');
        console.log(`   https://explorer.solana.com/tx/${signature}?cluster=testnet`);

        console.log('\n✅ Ready to test settlements!');
        console.log('   Run: node scripts/test_solana_settlement.js\n');

    } catch (error) {
        console.error('\n❌ Airdrop failed:', error.message);

        if (error.message.includes('airdrop request limit')) {
            console.log('\n⏰ Rate limit reached!');
            console.log('   Testnet faucet allows 1 airdrop per IP per 24 hours.');
            console.log('\n💡 Alternative options:');
            console.log('   1. Wait 24 hours and try again');
            console.log('   2. Use a different network/VPN');
            console.log('   3. Use web faucet: https://faucet.solana.com');
        }

        process.exit(1);
    }

    console.log('═'.repeat(60));
}

requestAirdrop().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});
