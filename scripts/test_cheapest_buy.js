#!/usr/bin/env node
/**
 * TEST CHEAPEST BUY — Base + Sonic
 * Finds cheapest token buy opportunities on Base and Sonic chains
 *
 * Base:  $0.18 ETH available  → swap ~$0.14 ETH → token (keep $0.04 for gas)
 * Sonic: 0.0018 S (not enough) → shows needed funding
 *
 * Usage:
 *   node scripts/test_cheapest_buy.js           # dry-run (quotes only)
 *   node scripts/test_cheapest_buy.js --exec    # execute on Base
 *   node scripts/test_cheapest_buy.js --chain sonic --exec
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { ethers } = require('ethers');
const https = require('https');

const EXEC  = process.argv.includes('--exec');
const CHAIN = process.argv.includes('--chain') ? process.argv[process.argv.indexOf('--chain') + 1] : 'base';
const DRY   = !EXEC;

// ── Config ────────────────────────────────────────────────────────────────────

const WALLET = '0x377706801308ac4c3Fe86EEBB295FeC6E1279140';

const BASE = {
    rpc:     'https://mainnet.base.org',
    name:    'Base',
    chainId: 8453,
    WETH:    '0x4200000000000000000000000000000000000006',
    USDC:    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    AERO:    '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    // Aerodrome Router v2
    router:  '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
    factory: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
    // Gas reserve: 0.00003 ETH (~$0.06) to be safe
    gasReserveETH: '0.00003',
};

const SONIC = {
    rpc:     'https://rpc.soniclabs.com',
    name:    'Sonic',
    chainId: 146,
    wS:      '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
    USDC:    '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
    // Shadow DEX v2 Router (CL pool aggregator)
    router:  '0x1D368773735ee1E678950B7A97bcA5a2E64B44e5',
    // Min for swap: ~0.05 S ($0.04) + gas 0.01 S
    minS:    '0.06',
};

const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
];

const ROUTER_ABI = [
    'function getAmountsOut(uint256 amountIn, (address from, address to, bool stable, address factory)[] routes) external view returns (uint256[])',
    'function swapExactETHForTokens(uint256 amountOutMin, (address from, address to, bool stable, address factory)[] routes, address to, uint256 deadline) external payable returns (uint256[])',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fetchJson(url) {
    return new Promise((res, rej) => {
        https.get(url, { headers: { 'User-Agent': 'Obelisk/3.0' } }, r => {
            let d = '';
            r.on('data', c => d += c);
            r.on('end', () => { try { res(JSON.parse(d)); } catch { res(null); } });
        }).on('error', rej);
    });
}

async function getEthPrice() {
    try {
        const d = await fetchJson('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        return d?.ethereum?.usd || 1940;
    } catch { return 1940; }
}

async function getSonicPrice() {
    try {
        const d = await fetchJson('https://api.coingecko.com/api/v3/simple/price?ids=sonic-3&vs_currencies=usd');
        return d?.['sonic-3']?.usd || 0.85;
    } catch { return 0.85; }
}

// ── BASE CHAIN TEST ───────────────────────────────────────────────────────────

async function testBase() {
    console.log('\n══════════════════════════════════════════════');
    console.log('   BASE CHAIN — Cheapest Buy Test');
    console.log('══════════════════════════════════════════════');

    const provider  = new ethers.JsonRpcProvider(BASE.rpc);
    const ethPrice  = await getEthPrice();
    const ethBal    = await provider.getBalance(WALLET);
    const ethFloat  = parseFloat(ethers.formatEther(ethBal));
    const ethUSD    = ethFloat * ethPrice;

    const usdcContract = new ethers.Contract(BASE.USDC, ERC20_ABI, provider);
    const usdcBal      = await usdcContract.balanceOf(WALLET);
    const usdcFloat    = parseFloat(ethers.formatUnits(usdcBal, 6));

    const feeData  = await provider.getFeeData();
    const gwei     = parseFloat(ethers.formatUnits(feeData.gasPrice || feeData.maxFeePerGas, 'gwei'));
    const swapGas  = 150000 * gwei * 1e-9 * ethPrice;

    console.log(`  ETH balance : ${ethFloat.toFixed(6)} ETH = $${ethUSD.toFixed(2)}`);
    console.log(`  USDC balance: ${usdcFloat.toFixed(2)} USDC`);
    console.log(`  Gas price   : ${gwei.toFixed(4)} gwei`);
    console.log(`  Swap cost   : ~$${swapGas.toFixed(4)}`);

    const reserveETH  = parseFloat(BASE.gasReserveETH);
    const spendETH    = Math.max(0, ethFloat - reserveETH);
    const spendUSD    = spendETH * ethPrice;

    if (spendETH <= 0) {
        console.log(`\n  ❌ Not enough ETH (need >${reserveETH} ETH, have ${ethFloat.toFixed(6)})`);
        return;
    }

    console.log(`\n  Spendable   : ${spendETH.toFixed(6)} ETH = $${spendUSD.toFixed(2)}`);
    console.log(`  (keeping ${reserveETH} ETH for gas)\n`);

    // Quote: ETH → USDC
    const router     = new ethers.Contract(BASE.router, ROUTER_ABI, provider);
    const amtIn      = ethers.parseEther(spendETH.toFixed(8));
    const route      = [{ from: BASE.WETH, to: BASE.USDC, stable: false, factory: BASE.factory }];

    let usdcOut = 0n;
    try {
        const amts = await router.getAmountsOut(amtIn, route);
        usdcOut = amts[amts.length - 1];
        const usdcOutFloat = parseFloat(ethers.formatUnits(usdcOut, 6));
        console.log(`  Quote ETH→USDC : ${spendETH.toFixed(6)} ETH → ${usdcOutFloat.toFixed(4)} USDC`);
        console.log(`  Slippage est.  : ${((spendUSD - usdcOutFloat) / spendUSD * 100).toFixed(2)}%`);
    } catch (e) {
        console.log('  Quote error:', e.message);
    }

    // Quote: ETH → AERO (another cheap token option)
    const routeAero = [{ from: BASE.WETH, to: BASE.AERO, stable: false, factory: BASE.factory }];
    try {
        const amtsAero = await router.getAmountsOut(amtIn, routeAero);
        const aeroOut  = parseFloat(ethers.formatEther(amtsAero[amtsAero.length - 1]));
        console.log(`  Quote ETH→AERO : ${spendETH.toFixed(6)} ETH → ${aeroOut.toFixed(4)} AERO`);
    } catch (e) {
        console.log('  AERO quote skip:', e.message);
    }

    if (DRY) {
        console.log('\n  MODE: Dry-run (pass --exec to execute)');
        return;
    }

    // ── EXECUTE ──────────────────────────────────────────────────────────────
    console.log('\n  Executing swap ETH→USDC...');
    const pk     = process.env.ARBITRUM_PRIVATE_KEY;
    if (!pk)     { console.log('  ❌ ARBITRUM_PRIVATE_KEY not in .env'); return; }
    const wallet = new ethers.Wallet(pk, provider);
    const deadline = Math.floor(Date.now() / 1000) + 600;
    // 2% slippage min out
    const minOut   = usdcOut * 98n / 100n;

    try {
        const routerW = new ethers.Contract(BASE.router, ROUTER_ABI, wallet);
        const tx = await routerW.swapExactETHForTokens(
            minOut,
            route,
            WALLET,
            deadline,
            { value: amtIn, gasLimit: 300000n }
        );
        console.log(`  TX sent: ${tx.hash}`);
        console.log(`  BaseScan: https://basescan.org/tx/${tx.hash}`);
        const receipt = await tx.wait();
        const newUsdc = await usdcContract.balanceOf(WALLET);
        console.log(`  ✅ Success! Gas used: ${receipt.gasUsed}`);
        console.log(`  USDC balance now: ${ethers.formatUnits(newUsdc, 6)}`);
    } catch (e) {
        console.log('  ❌ TX failed:', e.message);
    }
}

// ── SONIC CHAIN TEST ──────────────────────────────────────────────────────────

async function testSonic() {
    console.log('\n══════════════════════════════════════════════');
    console.log('   SONIC CHAIN — Cheapest Buy Test');
    console.log('══════════════════════════════════════════════');

    const provider   = new ethers.JsonRpcProvider(SONIC.rpc);
    const sonicPrice = await getSonicPrice();
    const sBal       = await provider.getBalance(WALLET);
    const sFloat     = parseFloat(ethers.formatEther(sBal));
    const sUSD       = sFloat * sonicPrice;

    const usdcContract = new ethers.Contract(SONIC.USDC, ERC20_ABI, provider);
    const usdcBal      = await usdcContract.balanceOf(WALLET).catch(() => 0n);
    const usdcFloat    = parseFloat(ethers.formatUnits(usdcBal, 6));

    const feeData  = await provider.getFeeData();
    const gwei     = parseFloat(ethers.formatUnits(feeData.gasPrice || feeData.maxFeePerGas, 'gwei'));
    const swapCost = 150000 * gwei * 1e-9 * sonicPrice;

    console.log(`  S balance  : ${sFloat.toFixed(6)} S = $${sUSD.toFixed(4)}`);
    console.log(`  USDC       : ${usdcFloat.toFixed(4)}`);
    console.log(`  Gas price  : ${gwei.toFixed(2)} gwei`);
    console.log(`  Swap cost  : ~$${swapCost.toFixed(4)} (~${(swapCost/sonicPrice).toFixed(4)} S)`);

    const minS   = parseFloat(SONIC.minS);
    if (sFloat < minS) {
        console.log(`\n  ❌ Not enough S for a swap`);
        console.log(`  Need ≥ ${minS} S ($${(minS * sonicPrice).toFixed(3)})`);
        console.log(`  Have   ${sFloat.toFixed(6)} S ($${sUSD.toFixed(4)})`);
        console.log(`\n  💡 Options to fund Sonic:`);
        console.log(`     1. Bridge ETH from Arbitrum → Sonic via deBridge/Stargate`);
        console.log(`        Cost: ~$0.50-1 bridge fee, bridge $2-5 ETH`);
        console.log(`     2. Buy S on CEX (Binance/Bybit) + withdraw to Sonic`);
        console.log(`     3. Or skip Sonic, use Base (already have $0.18 ETH there)`);
        console.log(`\n  Available capital for testing:`);
        console.log(`     Base:      $0.18 ETH  ✅ Ready`);
        console.log(`     Arbitrum:  $5.65 ETH + $4.92 USDC (can bridge)`);
        return;
    }

    console.log(`\n  ✅ Enough S to swap!`);
    // Would add quote here using Shadow DEX if balance was sufficient
}

// ── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  OBELISK — Cheapest Buy Test (Base + Sonic)');
    console.log(`  Mode: ${DRY ? 'DRY-RUN (quotes only)' : 'EXECUTE LIVE'}`);
    console.log(`  Wallet: ${WALLET}`);
    console.log('═══════════════════════════════════════════════════════════');

    if (CHAIN === 'sonic') {
        await testSonic();
    } else if (CHAIN === 'all') {
        await testBase();
        await testSonic();
    } else {
        await testBase();
    }

    console.log('\n  Done. Pass --chain sonic|base|all to switch chains.');
    console.log('  Pass --exec to execute (not just quote).');
}

main().catch(console.error);
