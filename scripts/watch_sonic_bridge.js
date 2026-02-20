#!/usr/bin/env node
/**
 * SONIC BRIDGE WATCHER
 * Polls wallet USDC balance on Sonic chain every 30s
 * Auto-activates sonic-dex executor when ≥$MIN_USDC detected
 *
 * Usage:
 *   node scripts/watch_sonic_bridge.js          # watch until funded
 *   node scripts/watch_sonic_bridge.js --check  # one-shot check
 *
 * When funded: updates .env HFT_EXECUTOR=sonic-dex + restarts sonic-hft
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { ethers } = require('ethers');
const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const WALLET  = '0x377706801308ac4c3Fe86EEBB295FeC6E1279140';
const USDC    = '0x29219dd400f2Bf60E5a23d13Be72B486D4038894';
const RPC     = 'https://rpc.soniclabs.com';
const ENV_FILE = path.join(__dirname, '../.env');

const MIN_USDC = parseFloat(process.env.HFT_MIN_USD || '0.50'); // 20 S ≈ $1 = OK
const POLL_MS  = 30000; // 30s

const provider = new ethers.JsonRpcProvider(RPC);
const erc20    = new ethers.Contract(USDC, [
    'function balanceOf(address) view returns (uint256)',
], provider);

const wS_contract = new ethers.Contract(
    '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
    ['function balanceOf(address) view returns (uint256)'],
    provider
);

async function getBalances() {
    const [sNative, usdcRaw, wSRaw] = await Promise.all([
        provider.getBalance(WALLET),
        erc20.balanceOf(WALLET),
        wS_contract.balanceOf(WALLET),
    ]);
    return {
        S:    parseFloat(ethers.formatEther(sNative)),
        wS:   parseFloat(ethers.formatEther(wSRaw)),
        USDC: parseFloat(ethers.formatUnits(usdcRaw, 6)),
    };
}

function activate() {
    console.log('\n🚀 ACTIVATION sonic-dex executor...');

    // Update .env: switch HFT_EXECUTOR
    let env = fs.readFileSync(ENV_FILE, 'utf8');
    env = env.replace(/^HFT_EXECUTOR=obelisk/m, 'HFT_EXECUTOR=sonic-dex');
    env = env.replace(/^# HFT_EXECUTOR=sonic-dex/m, '# HFT_EXECUTOR=obelisk (backup)');
    fs.writeFileSync(ENV_FILE, env);
    console.log('  ✅ .env updated → HFT_EXECUTOR=sonic-dex');

    // Restart sonic-hft
    try {
        execSync('pm2 restart sonic-hft --update-env', { stdio: 'inherit' });
        console.log('  ✅ sonic-hft restarted');
    } catch (e) {
        console.error('  ❌ pm2 restart failed:', e.message);
        console.log('  → Restart manuellement: pm2 restart sonic-hft --update-env');
    }
}

async function check() {
    const bal = await getBalances();
    const S_PRICE = 0.049;
    const totalUsd = (bal.S + bal.wS) * S_PRICE + bal.USDC;
    const ready = totalUsd >= MIN_USDC && bal.S >= 0.002;
    console.log(`[${new Date().toLocaleTimeString()}] S: ${bal.S.toFixed(4)} | wS: ${bal.wS.toFixed(4)} | USDC: $${bal.USDC.toFixed(4)} | Total: ~$${totalUsd.toFixed(4)} | ${ready ? '✅ READY' : '⏳ Waiting...'}`);
    return { bal, ready };
}

async function main() {
    const oneShot = process.argv.includes('--check');

    console.log('══════════════════════════════════════════════');
    console.log('   SONIC BRIDGE WATCHER');
    console.log(`  Wallet : ${WALLET}`);
    console.log(`  Target : ≥$${MIN_USDC} USDC + ≥0.005 S gas`);
    console.log(`  Bridge : https://app.soniclabs.com/bridge`);
    console.log('══════════════════════════════════════════════');

    const { bal, ready } = await check();

    if (oneShot) {
        if (ready) {
            console.log('\n✅ Already funded! Run activate manually:');
            console.log('   node scripts/watch_sonic_bridge.js --activate');
        }
        process.exit(ready ? 0 : 1);
    }

    if (ready) {
        console.log('\n✅ Already funded!');
        activate();
        return;
    }

    if (process.argv.includes('--activate')) {
        activate();
        return;
    }

    console.log(`\nPolling every ${POLL_MS / 1000}s... (Ctrl+C to stop)\n`);
    const interval = setInterval(async () => {
        const { ready } = await check();
        if (ready) {
            clearInterval(interval);
            activate();
        }
    }, POLL_MS);
}

main().catch(e => { console.error(e.message); process.exit(1); });
