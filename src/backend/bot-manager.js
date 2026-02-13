/**
 * OBELISK BOT MANAGER - Memory Optimized
 * Single process managing all bot types with memory limits
 *
 * Usage: node bot-manager.js [--max-memory=256] [--bots=5]
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, val] = arg.replace('--', '').split('=');
    acc[key] = val;
    return acc;
}, {});

// Configuration with memory limits
const CONFIG = {
    MAX_MEMORY_MB: parseInt(args['max-memory']) || 256,  // Max RAM in MB
    MAX_BOTS: parseInt(args['bots']) || 10,              // Max concurrent bots
    GC_INTERVAL: 30000,                                   // Force GC every 30s
    MEMORY_CHECK_INTERVAL: 5000,                          // Check memory every 5s
    REDUCE_ACTIVITY_THRESHOLD: 0.8,                       // Reduce at 80% memory
    PAUSE_THRESHOLD: 0.95,                                // Pause at 95% memory
    MIN_TRADE_INTERVAL: 500,                              // Min ms between trades
    BATCH_SIZE: 3                                         // Process N bots per tick
};

// Bot profiles - lightweight version
const BOT_TYPES = {
    MARKET_MAKER: { icon: '🏦', interval: 3000, weight: 2 },
    SCALPER:      { icon: '⚡', interval: 2000, weight: 1 },
    TREND:        { icon: '📈', interval: 15000, weight: 1 },
    DCA:          { icon: '🤖', interval: 45000, weight: 1 },
    WHALE:        { icon: '🐋', interval: 90000, weight: 1 },
    RETAIL:       { icon: '👤', interval: 20000, weight: 3 },
    ARBITRAGE:    { icon: '🔄', interval: 1000, weight: 1 }
};

class MemoryOptimizedBotManager {
    constructor() {
        this.bots = [];
        this.running = false;
        this.paused = false;
        this.stats = {
            trades: 0,
            errors: 0,
            memoryPeakMB: 0,
            startTime: Date.now(),
            gcRuns: 0
        };
        this.priceCache = {};
        this.lastPriceFetch = 0;
        this.activityMultiplier = 1.0;
    }

    // Get memory usage in MB
    getMemoryMB() {
        const used = process.memoryUsage();
        return Math.round(used.heapUsed / 1024 / 1024);
    }

    // Get memory percentage of limit
    getMemoryPercent() {
        return this.getMemoryMB() / CONFIG.MAX_MEMORY_MB;
    }

    // Force garbage collection if available
    forceGC() {
        if (global.gc) {
            global.gc();
            this.stats.gcRuns++;
            console.log(`[GC] Forced garbage collection (${this.stats.gcRuns}x)`);
        }
    }

    // Create bot instances
    initBots() {
        let id = 0;
        const totalWeight = Object.values(BOT_TYPES).reduce((sum, t) => sum + t.weight, 0);

        for (const [type, config] of Object.entries(BOT_TYPES)) {
            const count = Math.max(1, Math.round((config.weight / totalWeight) * CONFIG.MAX_BOTS));

            for (let i = 0; i < count && this.bots.length < CONFIG.MAX_BOTS; i++) {
                this.bots.push({
                    id: ++id,
                    type,
                    icon: config.icon,
                    interval: config.interval,
                    lastTrade: 0,
                    trades: 0,
                    pnl: 0
                });
            }
        }

        console.log(`[INIT] Created ${this.bots.length} bots (max: ${CONFIG.MAX_BOTS})`);
    }

    // Fetch prices with caching
    async fetchPrices() {
        const now = Date.now();
        if (now - this.lastPriceFetch < 1000 && Object.keys(this.priceCache).length > 0) {
            return this.priceCache;
        }

        try {
            const res = await fetch(`${API_URL}/api/tickers`);
            const data = await res.json();
            this.priceCache = data.tickers || {};
            this.lastPriceFetch = now;
            return this.priceCache;
        } catch (e) {
            return this.priceCache;
        }
    }

    // Execute a single bot trade
    async executeTrade(bot) {
        const now = Date.now();
        const adjustedInterval = bot.interval / this.activityMultiplier;

        if (now - bot.lastTrade < adjustedInterval) {
            return null;
        }

        const prices = await this.fetchPrices();
        if (!prices || Object.keys(prices).length === 0) return null;

        const pairs = Object.keys(prices).filter(p => p.includes('/USDC'));
        if (pairs.length === 0) return null;

        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const price = prices[pair]?.price;
        if (!price) return null;

        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const quantity = (Math.random() * 2 + 0.01).toFixed(4);

        try {
            const res = await fetch(`${API_URL}/api/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pair, side, type: 'market', quantity: parseFloat(quantity),
                    userId: `bot_${bot.type.toLowerCase()}_${bot.id}`
                })
            });

            const data = await res.json();

            if (data.success) {
                bot.lastTrade = now;
                bot.trades++;
                this.stats.trades++;

                return {
                    bot: `${bot.icon} ${bot.type}#${bot.id}`,
                    action: `${side.toUpperCase()} ${quantity} ${pair} @ $${price.toFixed(2)}`
                };
            }
        } catch (e) {
            this.stats.errors++;
        }

        return null;
    }

    // Process batch of bots
    async processBatch() {
        if (this.paused) return;

        const batch = this.bots
            .filter(b => Date.now() - b.lastTrade >= b.interval / this.activityMultiplier)
            .slice(0, CONFIG.BATCH_SIZE);

        for (const bot of batch) {
            const result = await this.executeTrade(bot);
            if (result) {
                console.log(`[TRADE] ${result.bot}: ${result.action}`);
            }

            // Small delay between trades in batch
            await new Promise(r => setTimeout(r, 50));
        }
    }

    // Memory management
    checkMemory() {
        const memMB = this.getMemoryMB();
        const memPercent = this.getMemoryPercent();

        if (memMB > this.stats.memoryPeakMB) {
            this.stats.memoryPeakMB = memMB;
        }

        // Adjust activity based on memory
        if (memPercent >= CONFIG.PAUSE_THRESHOLD) {
            if (!this.paused) {
                console.log(`[MEMORY] ⚠️ PAUSED - ${memMB}MB (${(memPercent*100).toFixed(0)}% of limit)`);
                this.paused = true;
                this.forceGC();
            }
        } else if (memPercent >= CONFIG.REDUCE_ACTIVITY_THRESHOLD) {
            this.paused = false;
            this.activityMultiplier = 0.5;
            console.log(`[MEMORY] ⚡ Reduced activity - ${memMB}MB`);
        } else {
            this.paused = false;
            this.activityMultiplier = 1.0;
        }

        return { memMB, memPercent, paused: this.paused };
    }

    // Print status
    printStatus() {
        const mem = this.checkMemory();
        const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
        const tps = (this.stats.trades / uptime).toFixed(2);

        console.log(`
╔═══════════════════════════════════════════════════════════╗
║  📊 BOT MANAGER STATUS                                    ║
╠═══════════════════════════════════════════════════════════╣
║  Bots: ${this.bots.length.toString().padEnd(3)} │ Trades: ${this.stats.trades.toString().padEnd(6)} │ TPS: ${tps.padEnd(5)}     ║
║  RAM:  ${mem.memMB.toString().padEnd(3)}MB/${CONFIG.MAX_MEMORY_MB}MB │ Peak: ${this.stats.memoryPeakMB.toString().padEnd(3)}MB │ ${mem.paused ? '⏸ PAUSED' : '▶ RUNNING'}   ║
║  Activity: ${(this.activityMultiplier * 100).toFixed(0)}% │ Errors: ${this.stats.errors} │ GC: ${this.stats.gcRuns}x       ║
╚═══════════════════════════════════════════════════════════╝`);
    }

    // Main loop
    async start() {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🤖 OBELISK BOT MANAGER - Memory Optimized                ║
║  API: ${API_URL.padEnd(45)}║
║  Max RAM: ${CONFIG.MAX_MEMORY_MB}MB │ Max Bots: ${CONFIG.MAX_BOTS}                        ║
╚═══════════════════════════════════════════════════════════╝
`);

        this.initBots();
        this.running = true;

        // Main trading loop
        const tradingLoop = setInterval(async () => {
            await this.processBatch();
        }, CONFIG.MIN_TRADE_INTERVAL);

        // Memory check loop
        const memoryLoop = setInterval(() => {
            this.checkMemory();
        }, CONFIG.MEMORY_CHECK_INTERVAL);

        // GC loop
        const gcLoop = setInterval(() => {
            if (this.getMemoryPercent() > 0.6) {
                this.forceGC();
            }
        }, CONFIG.GC_INTERVAL);

        // Status loop
        const statusLoop = setInterval(() => {
            this.printStatus();
        }, 30000);

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n[SHUTDOWN] Stopping bots...');
            this.running = false;
            clearInterval(tradingLoop);
            clearInterval(memoryLoop);
            clearInterval(gcLoop);
            clearInterval(statusLoop);
            this.printStatus();
            process.exit(0);
        });

        // Initial status
        setTimeout(() => this.printStatus(), 5000);
    }
}

// Run with --expose-gc for manual GC control
// node --expose-gc bot-manager.js --max-memory=256 --bots=10

const manager = new MemoryOptimizedBotManager();
manager.start();
