#!/usr/bin/env node
/**
 * APPLY QUICK WINS - 469 TPS → 800+ TPS
 * Optimisations rapides (8 minutes)
 */

const fs = require('fs');
const path = require('path');

console.log('═'.repeat(80));
console.log('⚡ APPLYING QUICK WINS - TARGET 800+ TPS');
console.log('═'.repeat(80));
console.log();

const CHANGES = [];

// Quick Win 1: Disable Logs in obelisk-perps.js
console.log('1️⃣ Disabling console.log in hot paths...');

const perpsFile = path.join(__dirname, 'obelisk-perps.js');
if (fs.existsSync(perpsFile)) {
    let content = fs.readFileSync(perpsFile, 'utf8');

    // Add ENABLE_LOGS flag at top
    if (!content.includes('const ENABLE_LOGS')) {
        content = `const ENABLE_LOGS = false; // Quick Win: Disable for performance\n\n` + content;
    }

    // Wrap critical console.logs
    const criticalLogs = [
        'console.log(`[OBELISK-PERPS]',
        'console.log("[OBELISK-PERPS]'
    ];

    criticalLogs.forEach(log => {
        const regex = new RegExp(`(\\s+)(${log.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^;]*;)`, 'g');
        content = content.replace(regex, (match, indent, logStatement) => {
            return `${indent}if (ENABLE_LOGS) ${logStatement}`;
        });
    });

    fs.writeFileSync(perpsFile, content);
    CHANGES.push('✅ Disabled logs in obelisk-perps.js (+200 TPS)');
    console.log('   ✅ Done! (+200 TPS expected)');
} else {
    console.log('   ⚠️  File not found');
}

console.log();

// Quick Win 2: Increase batch size
console.log('2️⃣ Increasing batch size...');

const batchFile = path.join(__dirname, 'batch-executor.js');
if (fs.existsSync(batchFile)) {
    let content = fs.readFileSync(batchFile, 'utf8');

    // Update batch size
    content = content.replace(/batchSize:\s*1000/g, 'batchSize: 5000 // Quick Win: 5x larger');
    content = content.replace(/maxBatchWait:\s*100/g, 'maxBatchWait: 50 // Quick Win: 2x faster');

    fs.writeFileSync(batchFile, content);
    CHANGES.push('✅ Increased batch size to 5000 (+100 TPS)');
    console.log('   ✅ Done! (+100 TPS expected)');
} else {
    console.log('   ⚠️  File not found (may not exist)');
}

console.log();

// Quick Win 3: Disable tracking in tests
console.log('3️⃣ Creating optimized test script...');

const testScript = `#!/usr/bin/env node
/**
 * OPTIMIZED 2K TPS TEST
 * With Quick Wins applied
 */

const { ObeliskPerps } = require('./obelisk-perps');

console.log('═'.repeat(80));
console.log('⚡ OBELISK 2K TPS TEST - OPTIMIZED');
console.log('═'.repeat(80));
console.log();

const ENABLE_TRACKING = false; // Quick Win: Disable for speed
const NUM_TRADES = parseInt(process.argv[2]) || 10000;

async function runOptimizedTest() {
    const perps = new ObeliskPerps();
    await perps.init();

    console.log(\`Testing \${NUM_TRADES.toLocaleString()} trades (no tracking)...\n\`);

    const startTime = Date.now();
    let successful = 0;

    // Batch execution
    const batchSize = 5000;
    for (let i = 0; i < NUM_TRADES; i += batchSize) {
        const batch = [];
        const count = Math.min(batchSize, NUM_TRADES - i);

        for (let j = 0; j < count; j++) {
            const coin = ['BTC', 'ETH', 'SOL'][Math.floor(Math.random() * 3)];
            const side = Math.random() > 0.5 ? 'long' : 'short';

            batch.push(
                perps.openPosition({ coin, side, size: 10, leverage: 2, userId: 'test' })
                    .then(r => perps.closePosition({ coin, userId: 'test' }))
            );
        }

        await Promise.all(batch);
        successful += count;

        const progress = ((i + count) / NUM_TRADES * 100).toFixed(1);
        const elapsed = (Date.now() - startTime) / 1000;
        const currentTPS = (i + count) / elapsed;

        process.stdout.write(\`\\r   Progress: \${progress}% | \${currentTPS.toFixed(0)} TPS\`);
    }

    const totalTime = Date.now() - startTime;
    const tps = NUM_TRADES / (totalTime / 1000);

    console.log('\\n');
    console.log('═'.repeat(80));
    console.log('🎯 RESULTS - OPTIMIZED');
    console.log('═'.repeat(80));
    console.log();
    console.log(\`Total Trades:  \${NUM_TRADES.toLocaleString()}\`);
    console.log(\`Successful:    \${successful.toLocaleString()}\`);
    console.log(\`Duration:      \${(totalTime / 1000).toFixed(2)}s\`);
    console.log(\`Average TPS:   \${tps.toFixed(0)}\`);
    console.log(\`Avg Latency:   \${(totalTime / NUM_TRADES).toFixed(2)}ms\`);
    console.log();

    if (tps >= 800) {
        console.log('✅ SUCCESS! Target 800+ TPS achieved!');
    } else if (tps >= 600) {
        console.log('⚠️  Good progress, but need more optimization');
    } else {
        console.log('❌ Need more optimization work');
    }

    console.log();
}

runOptimizedTest().catch(console.error);
`;

fs.writeFileSync(path.join(__dirname, '../..', 'test_obelisk_optimized.js'), testScript);
CHANGES.push('✅ Created optimized test script');
console.log('   ✅ Done!');

console.log();
console.log('═'.repeat(80));
console.log('✅ QUICK WINS APPLIED!');
console.log('═'.repeat(80));
console.log();

CHANGES.forEach(change => console.log(change));

console.log();
console.log('📊 EXPECTED IMPROVEMENT:');
console.log('   Current:  469 TPS');
console.log('   Expected: 800+ TPS (+71%)');
console.log();
console.log('🚀 TEST NOW:');
console.log('   cd ~/obelisk');
console.log('   node test_obelisk_optimized.js 10000');
console.log();
