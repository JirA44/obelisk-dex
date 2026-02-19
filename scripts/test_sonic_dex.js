/**
 * TEST SONIC DEX ROUTER — Tests réels (quotes mainnet)
 * Teste ShadowDEX, SwapX, Beets, Equalizer, Metropolis sur Sonic mainnet
 *
 * Usage:
 *   node scripts/test_sonic_dex.js          # Quotes only (pas de tx)
 *   node scripts/test_sonic_dex.js --swap   # Swap réel 0.01 S → USDC
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { ethers } = require('ethers');
const { SonicDexRouter, ADDRESSES } = require('../src/backend/executors/sonic-dex-router');

const DO_SWAP = process.argv.includes('--swap');

async function main() {
    console.log('\n══════════════════════════════════════════════════════');
    console.log('   SONIC DEX ROUTER — TEST MAINNET');
    console.log('══════════════════════════════════════════════════════\n');

    const router = new SonicDexRouter();

    // ── 1. Provider connectivity ──────────────────────────────────────────
    console.log('📡 Connexion Sonic RPC...');
    const block = await router.provider.getBlockNumber();
    const network = await router.provider.getNetwork();
    console.log(`   ✅ Block #${block} | Chain ID ${network.chainId} (Sonic)\n`);

    // ── 2. Wallet balance ─────────────────────────────────────────────────
    if (router.wallet) {
        const balS = await router.provider.getBalance(router.wallet.address);
        console.log(`💰 Wallet: ${router.wallet.address}`);
        console.log(`   Balance S: ${parseFloat(ethers.formatEther(balS)).toFixed(4)} S\n`);
    } else {
        console.log('⚠️  Pas de wallet configuré (SONIC_MAINNET_PRIVATE_KEY absent)\n');
    }

    // ── 3. Quotes: USDC → wS ─────────────────────────────────────────────
    const PAIRS = [
        { from: 'S',    to: 'USDC', amount: 0.05 },
        { from: 'USDC', to: 'wS',   amount: 10   },
        { from: 'USDC', to: 'WETH', amount: 10   },
        { from: 'wS',   to: 'USDC', amount: 100  },
    ];

    for (const pair of PAIRS) {
        console.log(`\n📊 Quote: ${pair.amount} ${pair.from} → ${pair.to}`);
        console.log('   ' + '─'.repeat(52));

        try {
            const q = await router.quoteHuman(pair.from, pair.to, pair.amount);

            if (!q.success) {
                console.log(`   ❌ Aucune liquidité: ${q.error}`);
                continue;
            }

            const h = q.human;
            console.log(`   🏆 Meilleur: ${h.bestDex.toUpperCase().padEnd(14)} → ${h.amountOut} ${pair.to}`);
            console.log(`\n   Toutes les quotes:`);
            h.allQuotes.forEach(({ dex, amountOut }) => {
                const isWinner = dex === h.bestDex;
                const marker = isWinner ? '✅' : '  ';
                console.log(`   ${marker} ${dex.padEnd(14)} ${amountOut} ${pair.to}`);
            });

        } catch (err) {
            console.log(`   ⚠️  Erreur: ${err.message}`);
        }
    }

    // ── 4. Stats ──────────────────────────────────────────────────────────
    console.log('\n\n📈 Stats Router:');
    console.log(JSON.stringify(router.getStats(), null, 2));

    // ── 5. Swap réel (--swap flag) ────────────────────────────────────────
    if (DO_SWAP) {
        if (!router.wallet) {
            console.log('\n❌ Swap impossible — wallet non configuré');
            process.exit(1);
        }

        console.log('\n\n🚀 SWAP RÉEL: 0.005 S (natif) → USDC');
        console.log('   Slippage: 2%');

        // 0.005 S = 5_000_000_000_000_000 (18 decimals)
        const amountIn = ethers.parseEther('0.005');

        try {
            const result = await router.executeSwap(
                ADDRESSES.S,
                ADDRESSES.USDC,
                amountIn,
                0.02
            );

            console.log('\n   ✅ Swap exécuté!');
            console.log(`   DEX:      ${result.dex}`);
            console.log(`   AmountIn: ${result.amountIn} USDC (units)`);
            console.log(`   AmountOut:${result.amountOut} wS (units)`);
            console.log(`   Gas:      $${result.gasCostUsd}`);
            console.log(`   Latence:  ${result.latencyMs}ms`);
            console.log(`   Tx:       ${result.explorer}`);

        } catch (err) {
            console.log(`\n   ❌ Swap failed: ${err.message}`);
        }
    } else {
        console.log('\n\n💡 Pour exécuter un vrai swap:');
        console.log('   node scripts/test_sonic_dex.js --swap');
    }

    // ── 6. API test (si server tourne) ───────────────────────────────────
    console.log('\n\n📡 Test API (localhost:3001)...');
    try {
        const http = require('http');
        await new Promise((resolve) => {
            http.get('http://localhost:3001/api/sonic-dex/dexes', (res) => {
                let data = '';
                res.on('data', d => data += d);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        console.log(`   ✅ /api/sonic-dex/dexes OK — ${parsed.dexes.length} DEXes`);
                        parsed.dexes.forEach(d => console.log(`      • ${d.name} (${d.type})`));
                    } catch {
                        console.log('   ✅ Server répond');
                    }
                    resolve();
                });
            }).on('error', () => {
                console.log('   ⚠️  Server pas lancé (pm2 start obelisk ou pm2 restart obelisk)');
                resolve();
            });
        });
    } catch {}

    console.log('\n══════════════════════════════════════════════════════');
    console.log('   TEST TERMINÉ');
    console.log('══════════════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
