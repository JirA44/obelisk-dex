#!/usr/bin/env node
/**
 * TEST HFT SOLANA — Obelisk venue + Real Solana settlement
 * Flow: trade via solana_mixbot venue → settlement on-chain Solana mainnet
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const axios = require('axios').default || require('axios');

const OBELISK_API = 'http://localhost:3001';
const VENUE       = 'solana_mixbot';
const NUM_TRADES  = 20;        // Start with 20 (each = 2 settlements on Solana)
const HOLD_TIME   = 2000;      // 2s hold
const SETTLE_SOL  = true;      // Enable real Solana settlement

// Load Solana executor for real settlement
let solanaExecutor = null;
try {
    const SolanaExecutor = require('./src/backend/executors/solana-executor');
    // Use official RPC with retry disabled to control timing ourselves
    solanaExecutor = new SolanaExecutor({ mode: 'MAINNET' }); // uses SOLANA_RPC_URL env
    if (!solanaExecutor.wallet) solanaExecutor = null;
} catch (e) {
    console.warn('⚠️  Solana executor unavailable:', e.message);
}

// Sequential settlement queue (avoids rate-limit)
const settlementQueue = [];
let settling = false;
async function processSettlements() {
    if (settling || settlementQueue.length === 0) return;
    settling = true;
    while (settlementQueue.length > 0) {
        const item = settlementQueue.shift();
        try {
            const result = await solanaExecutor.executeSettlement(item);
            if (result.success) {
                stats.settlements++;
                stats.totalGas += result.gasCost || 0.000005;
                stats.txHashes.push(result.txHash);
                process.stdout.write(' ⛓️');
            } else {
                stats.settlementErrors++;
            }
        } catch (e) {
            stats.settlementErrors++;
        }
        await new Promise(r => setTimeout(r, 1500)); // 1.5s between settlements
    }
    settling = false;
}

console.log('═'.repeat(70));
console.log('🚀 SOLANA HFT TEST — Obelisk venue + Solana mainnet settlement');
console.log('═'.repeat(70));
console.log(`Venue:     ${VENUE} ($5 capital)`);
console.log(`Trades:    ${NUM_TRADES}`);
console.log(`Hold:      ${HOLD_TIME}ms`);
console.log(`Wallet:    ${solanaExecutor?.wallet?.publicKey || 'NOT LOADED'}`);
console.log(`Settlement: ${solanaExecutor ? '✅ REAL on-chain Solana' : '⚠️  Skipped'}`);
console.log();

let stats = {
    total: 0, successful: 0, failed: 0,
    totalPnL: 0, totalFees: 0,
    wins: 0, losses: 0,
    latencies: [],
    settlements: 0, settlementErrors: 0,
    totalGas: 0,
    txHashes: []
};

function queueSettlement(orderId, symbol, side, size) {
    if (!solanaExecutor || !SETTLE_SOL) return;
    settlementQueue.push({ orderId, symbol, side, size, source: VENUE });
    processSettlements(); // kick queue if idle
}

async function executeTrade(coin, side, size) {
    const startTime = Date.now();

    try {
        // 1. Open position
        const openRes = await axios.post(`${OBELISK_API}/api/trade/venue/order`, {
            venue: VENUE, coin,
            side: side === 'long' ? 'buy' : 'sell',
            size, leverage: 2
        });

        if (!openRes.data.success) {
            stats.failed++;
            return { success: false, error: openRes.data.error };
        }

        const orderId = openRes.data.orderId || `sol-${Date.now()}`;
        const openLatency = Date.now() - startTime;

        // 2. Hold
        await new Promise(r => setTimeout(r, HOLD_TIME));

        // 3. Close position
        const closeStart = Date.now();
        const closeRes = await axios.post(`${OBELISK_API}/api/trade/venue/close`, {
            venue: VENUE, coin
        });
        const closeLatency = Date.now() - closeStart;

        if (!closeRes.data.success) {
            stats.failed++;
            return { success: false, error: closeRes.data.error };
        }

        const pnl  = closeRes.data.pnl  || 0;
        const fees = (openRes.data.fees  || 0) + (closeRes.data.fees || 0);
        const totalLatency = openLatency + closeLatency;

        stats.successful++;
        stats.totalPnL  += pnl;
        stats.totalFees += fees;
        stats.latencies.push(totalLatency);
        if (pnl > 0) stats.wins++; else stats.losses++;

        // Queue close settlement (sequential, 1 per 1.5s)
        queueSettlement(`${orderId}-CLOSE`, `${coin}-USD`, 'CLOSE', size);

        return { success: true, pnl, fees, latency: totalLatency };

    } catch (error) {
        stats.failed++;
        return { success: false, error: error.message };
    }
}

async function runTest() {
    // Check equity
    try {
        const eq = await axios.get(`${OBELISK_API}/api/trade/equity?venue=${VENUE}`);
        console.log(`Equity:    $${eq.data.equity?.toFixed(2) || '?'}`);
    } catch (e) {}

    // Check SOL balance
    if (solanaExecutor) {
        const bal = await solanaExecutor.getBalance();
        console.log(`SOL gas:   ${bal.toFixed(6)} SOL (~${Math.floor(bal / 0.000005)} settlements)\n`);
    }

    console.log('Starting...\n');

    const coins  = ['BTC', 'ETH', 'SOL'];
    const sides  = ['long', 'short'];
    const startTime = Date.now();

    for (let i = 0; i < NUM_TRADES; i++) {
        const coin = coins[Math.floor(Math.random() * coins.length)];
        const side = sides[Math.floor(Math.random() * sides.length)];
        const size = 3;

        stats.total++;
        const result = await executeTrade(coin, side, size);

        const pct     = ((i + 1) / NUM_TRADES * 100).toFixed(0);
        const avgLat  = stats.latencies.length
            ? (stats.latencies.reduce((a,b)=>a+b,0)/stats.latencies.length).toFixed(0)
            : 0;

        process.stdout.write(
            `\r  ${pct}% | ${stats.successful}/${stats.total} OK | ` +
            `${avgLat}ms avg | PnL: $${stats.totalPnL.toFixed(3)} | ` +
            `⛓️ ${stats.settlements} on-chain`
        );

        await new Promise(r => setTimeout(r, 200));
    }

    // Wait for pending settlements (20 trades × 1.5s each)
    console.log('\nWaiting for pending settlements...');
    while (settlementQueue.length > 0 || settling) {
        await new Promise(r => setTimeout(r, 500));
    }
    await new Promise(r => setTimeout(r, 1000));

    const totalTime = (Date.now() - startTime) / 1000;

    console.log('\n');
    console.log('═'.repeat(70));
    console.log('📊 SOLANA HFT RESULTS');
    console.log('═'.repeat(70));
    console.log();
    console.log(`Total Trades:    ${stats.total}`);
    console.log(`Successful:      ${stats.successful} (${(stats.successful/stats.total*100).toFixed(1)}%)`);
    console.log(`Failed:          ${stats.failed}`);
    console.log(`Win Rate:        ${stats.wins}/${stats.successful}`);
    console.log(`Total PnL:       $${stats.totalPnL.toFixed(4)}`);
    console.log(`Total Fees:      $${stats.totalFees.toFixed(4)}`);
    console.log(`Net Profit:      $${(stats.totalPnL - stats.totalFees).toFixed(4)}`);
    console.log();
    if (stats.latencies.length) {
        const avg = stats.latencies.reduce((a,b)=>a+b,0)/stats.latencies.length;
        console.log(`Avg Latency:     ${avg.toFixed(0)}ms`);
        console.log(`Min Latency:     ${Math.min(...stats.latencies)}ms`);
        console.log(`Max Latency:     ${Math.max(...stats.latencies)}ms`);
    }
    console.log(`Duration:        ${totalTime.toFixed(1)}s`);
    console.log(`TPS:             ${(stats.total/totalTime).toFixed(2)}`);
    console.log();
    console.log('⛓️  SOLANA SETTLEMENT');
    console.log(`On-chain txs:    ${stats.settlements} / ${stats.total * 2} expected`);
    console.log(`Errors:          ${stats.settlementErrors}`);
    console.log(`Total gas:       $${stats.totalGas.toFixed(6)}`);
    console.log(`Gas/trade:       $${stats.settlements > 0 ? (stats.totalGas/stats.settlements).toFixed(6) : '0'}`);
    if (stats.txHashes.length > 0) {
        console.log();
        console.log('Last TX:');
        console.log(`  https://solscan.io/tx/${stats.txHashes[stats.txHashes.length - 1]}`);
    }
    console.log();

    if (stats.successful > 0) {
        const roi = (stats.totalPnL - stats.totalFees) / 5 * 100;
        const dailyProj = roi * (86400 / totalTime);
        console.log('═'.repeat(70));
        console.log('💰 PERFORMANCE vs $5 CAPITAL');
        console.log('═'.repeat(70));
        console.log(`ROI (test):      ${roi.toFixed(2)}%`);
        console.log(`Daily proj:      ${dailyProj.toFixed(1)}%`);
        console.log(`Daily profit:    $${(5 * dailyProj / 100).toFixed(3)}/day`);
        console.log();
    }
}

runTest().catch(console.error);
