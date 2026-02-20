/**
 * OBELISK Test Suite — Copy Trading + Strategy Generator
 * Run: node test_all.js
 */

'use strict';
const http = require('http');

const BASE = 'http://127.0.0.1:3001';
let passed = 0, failed = 0;

function get(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(BASE + path, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                catch { reject(new Error('JSON parse error: ' + d.slice(0, 100))); }
            });
        });
        req.on('error', reject);
        req.setTimeout(8000, () => reject(new Error('Timeout')));
    });
}

function post(path, data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const opts = {
            hostname: '127.0.0.1', port: 3001,
            path, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        };
        const req = http.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                catch { reject(new Error('JSON parse: ' + d.slice(0, 100))); }
            });
        });
        req.on('error', reject);
        req.setTimeout(8000, () => reject(new Error('Timeout')));
        req.write(body);
        req.end();
    });
}

function assert(condition, label, detail = '') {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
        failed++;
    }
}

async function runTests() {
    console.log('\n══════════════════════════════════════════');
    console.log('  OBELISK TEST SUITE v1.0');
    console.log('══════════════════════════════════════════\n');

    // ─── COPY TRADING ───
    console.log('📋 Copy Trading Leaderboard:');
    try {
        const { body: stats } = await get('/api/copy-trading/stats');
        assert(stats.success, 'Stats endpoint OK');
        assert(stats.stats.totalManagers >= 22, `Managers >= 22 (got ${stats.stats.totalManagers})`);
        assert(stats.stats.totalFollowers > 0, 'Followers > 0');
        assert(stats.stats.totalAUM > 0, 'AUM > 0');
        assert(stats.stats.bestManager.totalROI > 100, `Best ROI > 100% (got ${stats.stats.bestManager.totalROI}%)`);
    } catch (e) { assert(false, 'Stats endpoint', e.message); }

    try {
        const { body: lb } = await get('/api/copy-trading/leaderboard?limit=10&sort=totalROI');
        assert(lb.success, 'Leaderboard endpoint OK');
        assert(lb.managers.length === 10, `Returns 10 managers (got ${lb.managers.length})`);
        assert(lb.managers[0].performance.totalROI >= lb.managers[1].performance.totalROI, 'Sorted by totalROI DESC');
        assert(lb.managers[0].rank === 1, 'First rank = 1');
        assert(typeof lb.managers[0].equityCurve === 'object', 'Equity curve present');
    } catch (e) { assert(false, 'Leaderboard endpoint', e.message); }

    try {
        const { body: lb2 } = await get('/api/copy-trading/leaderboard?riskLevel=Low&sort=winRate');
        assert(lb2.success, 'Leaderboard filter by riskLevel OK');
        assert(lb2.managers.every(m => m.riskLevel === 'Low'), 'All results are Low risk');
    } catch (e) { assert(false, 'Leaderboard filter', e.message); }

    try {
        const { body: feat } = await get('/api/copy-trading/featured');
        assert(feat.success, 'Featured endpoint OK');
        assert(feat.featured.length > 0, `Featured managers returned (${feat.featured.length})`);
    } catch (e) { assert(false, 'Featured endpoint', e.message); }

    try {
        const { body: mgr } = await get('/api/copy-trading/managers/crypto_king');
        assert(mgr.success, 'Single manager endpoint OK');
        assert(mgr.manager.id === 'crypto_king', 'Correct manager returned');
        assert(mgr.manager.performance.totalROI > 0, 'Has totalROI');
    } catch (e) { assert(false, 'Single manager endpoint', e.message); }

    try {
        const { body: copy } = await post('/api/copy-trading/copy', { managerId: 'obelisk_mm', amount: 1, userId: 'test_user' });
        assert(copy.success, 'Copy $1 = OK');
        assert(copy.amount === 1, 'Amount = $1');
        assert(copy.performanceFee === '10%', `Fee = 10% (got ${copy.performanceFee})`);
    } catch (e) { assert(false, 'Copy $1 trade', e.message); }

    try {
        const { body: copies } = await get('/api/copy-trading/my-copies?userId=test_user');
        assert(copies.success, 'My copies endpoint OK');
        assert(copies.count >= 1, `At least 1 copy (got ${copies.count})`);
    } catch (e) { assert(false, 'My copies endpoint', e.message); }

    // ─── STRATEGY GENERATOR ───
    console.log('\n🎯 Strategy Generator (10K strats):');
    try {
        const { body: stats } = await get('/api/strategies/stats');
        assert(stats.success, 'Stats endpoint OK');
        assert(stats.stats.total >= 10000, `Generated >= 10,000 strategies (got ${stats.stats.total.toLocaleString()})`);
        assert(stats.stats.profitable > 0, `Profitable strategies > 0 (got ${stats.stats.profitable.toLocaleString()})`);
        assert(stats.stats.profitableRate > 20, `Profitable rate > 20% (got ${stats.stats.profitableRate}%)`);
        console.log(`    ℹ️  ${stats.stats.total.toLocaleString()} strategies | ${stats.stats.profitable.toLocaleString()} profitable (${stats.stats.profitableRate}%)`);
        console.log(`    ℹ️  Best: ${stats.stats.bestStrategy.name} | +${stats.stats.bestStrategy.monthlyROI}%/mo | Grade: ${stats.stats.bestStrategy.grade}`);
    } catch (e) { assert(false, 'Strategy stats', e.message); }

    try {
        const { body: top } = await get('/api/strategies/top');
        assert(top.success, 'Top by grade OK');
        assert(typeof top.S === 'number', 'Grade S count present');
        assert(top.totalProfitable > 0, `Total profitable > 0 (got ${top.totalProfitable?.toLocaleString()})`);
        console.log(`    ℹ️  Grades: S=${top.S} A=${top.A} B=${top.B} C=${top.C} F=${top.F}`);
    } catch (e) { assert(false, 'Top by grade', e.message); }

    try {
        const { body: list } = await get('/api/strategies/list?limit=5&sort=monthlyROI&grade=S');
        assert(list.success, 'List with grade=S filter OK');
        assert(list.strategies.length > 0, `Grade S strategies found (${list.strategies.length})`);
        assert(list.strategies.every(s => s.score.grade === 'S'), 'All results grade S');
    } catch (e) { assert(false, 'Strategy list filter grade=S', e.message); }

    try {
        const { body: list2 } = await get('/api/strategies/list?venue=morpher&sort=dailyROI&limit=3');
        assert(list2.success, 'Filter by venue=morpher OK');
        assert(list2.strategies.every(s => s.venue.id === 'morpher'), 'All results from Morpher');
    } catch (e) { assert(false, 'Strategy list filter venue', e.message); }

    try {
        const { body: filters } = await get('/api/strategies/filters');
        assert(filters.success, 'Filters endpoint OK');
        assert(filters.indicators.length >= 15, `>= 15 indicators (got ${filters.indicators.length})`);
        assert(filters.venues.length >= 8, `>= 8 venues (got ${filters.venues.length})`);
    } catch (e) { assert(false, 'Filters endpoint', e.message); }

    // ─── NEW MANAGERS ───
    console.log('\n🏛️  New Managers (MM + LP + Stablecoins):');
    const newManagers = ['obelisk_mm', 'hyperliquid_mm', 'apex_mm', 'usdc_usdt_lp', 'btc_eth_lp',
        'vaultka_lp', 'beefy_compounder', 'stable_perp_arb', 'coindataflow_signals', 'kyber_lp'];

    for (const id of newManagers) {
        try {
            const { body } = await get(`/api/copy-trading/managers/${id}`);
            assert(body.success, `Manager ${id} found`);
            assert(body.manager.minCopy === 1, `${id} minCopy = $1`);
        } catch (e) { assert(false, `Manager ${id}`, e.message); }
    }

    // ─── RESULTS ───
    console.log('\n══════════════════════════════════════════');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log(`  Score: ${Math.round(passed/(passed+failed)*100)}%`);
    console.log('══════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
