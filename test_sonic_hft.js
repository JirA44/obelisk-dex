#!/usr/bin/env node
/**
 * TEST SONIC HFT ENGINE
 * Runs HFT loop with real Sonic DEX price feed + profit guard
 *
 * Usage:
 *   node test_sonic_hft.js            # Run 5 minutes
 *   node test_sonic_hft.js --fast     # 1s price interval (faster signals)
 *   node test_sonic_hft.js --min 10   # Run 10 minutes
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const SonicHFTEngine = require('./src/backend/hft/sonic-hft-engine');

const args = process.argv.slice(2);
const FAST  = args.includes('--fast');
const MINS  = parseInt(args.find(a => a.match(/^\d+$/)) || '5');
const RUN_MS = MINS * 60 * 1000;

console.log('══════════════════════════════════════════════════════════════');
console.log('   SONIC HFT ENGINE — LIVE TEST');
console.log('══════════════════════════════════════════════════════════════');
console.log(`  Mode: ${FAST ? 'FAST (1s)' : 'NORMAL (3s)'} | Duration: ${MINS} min`);
console.log(`  Price feed: Sonic DEX (Odos best route)`);
console.log(`  Pair: wS/USDC | Strategy: RSI Micro Scalp`);
console.log(`  Profit guard: ON (batch 10 trades, Sonic gas $0.00021)`);
console.log('');

const engine = new SonicHFTEngine({
    priceInterval: FAST ? 1000 : 3000,
    sizeUsd:       5.00,
    slPct:         0.005,
    tpPct:         0.015,
    maxPositions:  5,
    batchSize:     10,
});

// Status report every 30s
const reportInterval = setInterval(() => {
    const s = engine.getStats();
    const elapsed = Math.floor(s.elapsedSec / 60) + 'm' + (s.elapsedSec % 60) + 's';
    console.log('');
    console.log('─'.repeat(50));
    console.log(`  [${elapsed}] STATS`);
    console.log(`  Prices fetched  : ${s.pricesFetched} | Current: $${s.currentPrice?.toFixed(6) || '...'}`);
    console.log(`  Signals         : ${s.signalsGenerated}`);
    console.log(`  Trades open/total: ${s.openPositions}/${s.tradesClosed}`);
    console.log(`  Win rate        : ${s.winRate} (${s.wins}W / ${s.losses}L)`);
    console.log(`  Total PnL       : ${s.totalPnl}`);
    console.log(`  Pending in batch: ${s.pendingInBatch}/10`);
    console.log(`  Batches exec/skip: ${s.batchesExecuted}/${s.batchesSkipped}`);
    console.log('─'.repeat(50));
}, 30000);

// Stop after duration
setTimeout(async () => {
    clearInterval(reportInterval);
    engine.stop();

    await new Promise(r => setTimeout(r, 500));

    const s = engine.getStats();
    const elapsed = Math.floor(s.elapsedSec / 60) + 'm' + (s.elapsedSec % 60) + 's';

    console.log('');
    console.log('══════════════════════════════════════════════════════════════');
    console.log('   FINAL RESULTS');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`  Duration        : ${elapsed}`);
    console.log(`  Prices fetched  : ${s.pricesFetched}`);
    console.log(`  Signals         : ${s.signalsGenerated}`);
    console.log(`  Trades closed   : ${s.tradesClosed}`);
    console.log(`  Win rate        : ${s.winRate} (${s.wins}W / ${s.losses}L)`);
    console.log(`  Total PnL       : ${s.totalPnl}`);
    console.log(`  Trades/hour     : ${s.tradesPerHour}`);
    console.log('');
    console.log('  Profit Guard:');
    console.log(`    Batches exec  : ${s.batchesExecuted}`);
    console.log(`    Batches skip  : ${s.batchesSkipped}`);
    console.log(`    Total net PnL : ${s.batcher.profitGuard?.totalNetPnl || '$0'}`);
    console.log('══════════════════════════════════════════════════════════════');

    process.exit(0);
}, RUN_MS);

// Graceful Ctrl+C
process.on('SIGINT', () => {
    clearInterval(reportInterval);
    engine.stop();
    console.log('\n[HFT] Stopped by user');
    setTimeout(() => {
        const s = engine.getStats();
        console.log(`Trades: ${s.tradesClosed} | PnL: ${s.totalPnl} | Win rate: ${s.winRate}`);
        process.exit(0);
    }, 300);
});

engine.start();
