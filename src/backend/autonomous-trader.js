/**
 * OBELISK AUTONOMOUS TRADER V1.0
 * Trading independant sans Hyperliquid
 * Routes: GMX Perps (BTC/ETH) + Paraswap Spot (tous tokens)
 */

const { DexExecutor } = require('./dex-executor');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    // Trading params
    minBalance: 15,          // Min USDC pour trader
    maxPositionSize: 20,     // Max $20 par trade
    minPositionSize: 10,     // Min $10 par trade
    maxOpenPositions: 3,     // Max positions simultanées
    scanInterval: 60000,     // Scan toutes les 60s

    // GMX Perps (BTC/ETH only)
    gmxEnabled: true,
    gmxLeverage: 2,          // x2 leverage (safe)
    gmxSL: 0.02,             // 2% stop loss
    gmxTP: 0.04,             // 4% take profit

    // Spot (Paraswap)
    spotEnabled: true,
    spotMinSpread: 0.005,    // 0.5% min profit

    // Risk
    maxDailyLoss: -10,       // Stop si -$10/jour
    maxDrawdown: -20,        // Stop si -$20 total
};

// Simple strategies for autonomous trading
const STRATEGIES = {
    // RSI Oversold/Overbought
    RSI_EXTREME: {
        name: 'RSI Extreme',
        type: 'perp',
        coins: ['BTC', 'ETH'],
        async check(coin, data) {
            const rsi = data.rsi;
            if (rsi < 30) return { signal: 'long', confidence: 0.7 };
            if (rsi > 70) return { signal: 'short', confidence: 0.7 };
            return null;
        }
    },

    // BB Squeeze
    BB_SQUEEZE: {
        name: 'BB Squeeze',
        type: 'perp',
        coins: ['BTC', 'ETH'],
        async check(coin, data) {
            const { price, bb_upper, bb_lower, bb_mid } = data;
            const squeeze = (bb_upper - bb_lower) / bb_mid < 0.02;
            if (squeeze && price < bb_lower * 1.01) return { signal: 'long', confidence: 0.65 };
            if (squeeze && price > bb_upper * 0.99) return { signal: 'short', confidence: 0.65 };
            return null;
        }
    },

    // EMA Cross
    EMA_CROSS: {
        name: 'EMA Cross',
        type: 'perp',
        coins: ['BTC', 'ETH'],
        async check(coin, data) {
            const { ema_12, ema_26, prev_ema_12, prev_ema_26 } = data;
            // Golden cross
            if (prev_ema_12 < prev_ema_26 && ema_12 > ema_26) return { signal: 'long', confidence: 0.75 };
            // Death cross
            if (prev_ema_12 > prev_ema_26 && ema_12 < ema_26) return { signal: 'short', confidence: 0.75 };
            return null;
        }
    }
};

class AutonomousTrader {
    constructor() {
        this.dexExecutor = new DexExecutor();
        this.positions = new Map();
        this.stats = {
            trades: 0,
            wins: 0,
            losses: 0,
            totalPnl: 0,
            dailyPnl: 0,
            lastReset: new Date().toDateString()
        };
        this.running = false;
        this.dataFile = path.join(__dirname, 'data', 'autonomous_stats.json');
    }

    async init() {
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  🤖 OBELISK AUTONOMOUS TRADER V1.0                         ║');
        console.log('║  Trading sans Hyperliquid - GMX + Paraswap                 ║');
        console.log('╚════════════════════════════════════════════════════════════╝');

        // Init DEX executor
        const dexOk = await this.dexExecutor.init();
        if (!dexOk) {
            console.log('[AUTONOMOUS] ❌ DEX Executor not initialized - check PRIVATE_KEY');
            return false;
        }

        // Check balance
        const balance = await this.getBalance();
        console.log(`[AUTONOMOUS] 💰 Balance: $${balance.toFixed(2)} USDC`);

        if (balance < CONFIG.minBalance) {
            console.log(`[AUTONOMOUS] ⚠️ Insufficient balance. Need $${CONFIG.minBalance}+`);
            console.log(`[AUTONOMOUS] 📥 Fund wallet: ${this.dexExecutor.wallet.address}`);
            return false;
        }

        // Load stats
        this.loadStats();

        console.log(`[AUTONOMOUS] ✅ Ready - ${Object.keys(STRATEGIES).length} strategies`);
        console.log(`[AUTONOMOUS] 🎯 Position size: $${CONFIG.minPositionSize}-$${CONFIG.maxPositionSize}`);
        console.log(`[AUTONOMOUS] 📊 GMX Leverage: ${CONFIG.gmxLeverage}x`);

        return true;
    }

    async getBalance() {
        try {
            const { ethers } = require('ethers');
            const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
            const usdcAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
            const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
            const usdc = new ethers.Contract(usdcAddress, usdcAbi, provider);
            const balance = await usdc.balanceOf(this.dexExecutor.wallet.address);
            return parseFloat(ethers.formatUnits(balance, 6));
        } catch (e) {
            return 0;
        }
    }

    async getMarketData(coin) {
        try {
            // Fetch from Binance (free API)
            const [ticker, klines] = await Promise.all([
                fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}USDT`).then(r => r.json()),
                fetch(`https://api.binance.com/api/v3/klines?symbol=${coin}USDT&interval=1h&limit=50`).then(r => r.json())
            ]);

            const closes = klines.map(k => parseFloat(k[4]));
            const price = parseFloat(ticker.lastPrice);

            // Calculate indicators
            const rsi = this.calculateRSI(closes, 14);
            const ema_12 = this.calculateEMA(closes, 12);
            const ema_26 = this.calculateEMA(closes, 26);
            const prev_ema_12 = this.calculateEMA(closes.slice(0, -1), 12);
            const prev_ema_26 = this.calculateEMA(closes.slice(0, -1), 26);
            const { upper: bb_upper, lower: bb_lower, mid: bb_mid } = this.calculateBB(closes, 20, 2);

            return {
                coin,
                price,
                rsi,
                ema_12,
                ema_26,
                prev_ema_12,
                prev_ema_26,
                bb_upper,
                bb_lower,
                bb_mid,
                change24h: parseFloat(ticker.priceChangePercent)
            };
        } catch (e) {
            console.log(`[AUTONOMOUS] Error fetching ${coin} data:`, e.message);
            return null;
        }
    }

    calculateRSI(closes, period = 14) {
        if (closes.length < period + 1) return 50;
        let gains = 0, losses = 0;
        for (let i = closes.length - period; i < closes.length; i++) {
            const change = closes[i] - closes[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    calculateEMA(closes, period) {
        if (closes.length < period) return closes[closes.length - 1];
        const k = 2 / (period + 1);
        let ema = closes.slice(0, period).reduce((a, b) => a + b) / period;
        for (let i = period; i < closes.length; i++) {
            ema = closes[i] * k + ema * (1 - k);
        }
        return ema;
    }

    calculateBB(closes, period = 20, stdDev = 2) {
        const slice = closes.slice(-period);
        const mid = slice.reduce((a, b) => a + b) / period;
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mid, 2), 0) / period;
        const std = Math.sqrt(variance);
        return { upper: mid + std * stdDev, lower: mid - std * stdDev, mid };
    }

    async scanAndTrade() {
        // Reset daily PnL
        const today = new Date().toDateString();
        if (this.stats.lastReset !== today) {
            this.stats.dailyPnl = 0;
            this.stats.lastReset = today;
            this.saveStats();
        }

        // Check risk limits
        if (this.stats.dailyPnl <= CONFIG.maxDailyLoss) {
            console.log(`[AUTONOMOUS] 🛑 Daily loss limit reached: $${this.stats.dailyPnl.toFixed(2)}`);
            return;
        }

        if (this.stats.totalPnl <= CONFIG.maxDrawdown) {
            console.log(`[AUTONOMOUS] 🛑 Max drawdown reached: $${this.stats.totalPnl.toFixed(2)}`);
            return;
        }

        // Check balance
        const balance = await this.getBalance();
        if (balance < CONFIG.minBalance) {
            console.log(`[AUTONOMOUS] ⚠️ Low balance: $${balance.toFixed(2)}`);
            return;
        }

        // Check max positions
        if (this.positions.size >= CONFIG.maxOpenPositions) {
            console.log(`[AUTONOMOUS] 📊 Max positions (${CONFIG.maxOpenPositions}) reached`);
            return;
        }

        // Scan each strategy
        for (const [stratName, strategy] of Object.entries(STRATEGIES)) {
            for (const coin of strategy.coins) {
                // Skip if already have position on this coin
                if (this.positions.has(coin)) continue;

                const data = await this.getMarketData(coin);
                if (!data) continue;

                const signal = await strategy.check(coin, data);
                if (!signal || signal.confidence < 0.6) continue;

                console.log(`[AUTONOMOUS] 🎯 Signal: ${stratName} ${signal.signal.toUpperCase()} ${coin} (${(signal.confidence * 100).toFixed(0)}%)`);

                // Calculate position size
                const availableBalance = Math.min(balance * 0.3, CONFIG.maxPositionSize);
                const size = Math.max(CONFIG.minPositionSize, Math.min(availableBalance, CONFIG.maxPositionSize));

                if (size < CONFIG.minPositionSize) {
                    console.log(`[AUTONOMOUS] ⚠️ Insufficient size: $${size.toFixed(2)}`);
                    continue;
                }

                // Execute trade
                await this.openPosition(coin, signal.signal, size, stratName, data.price);
            }
        }
    }

    async openPosition(coin, side, size, strategy, entryPrice) {
        console.log(`[AUTONOMOUS] 🔥 Opening ${side.toUpperCase()} ${coin} $${size} via GMX...`);

        const result = await this.dexExecutor.openGmxPosition({
            coin,
            side,
            size,
            leverage: CONFIG.gmxLeverage
        });

        if (result.success && !result.simulated) {
            const position = {
                coin,
                side,
                size,
                entryPrice,
                strategy,
                openedAt: Date.now(),
                txHash: result.order.id,
                slPrice: side === 'long' ? entryPrice * (1 - CONFIG.gmxSL) : entryPrice * (1 + CONFIG.gmxSL),
                tpPrice: side === 'long' ? entryPrice * (1 + CONFIG.gmxTP) : entryPrice * (1 - CONFIG.gmxTP),
            };

            this.positions.set(coin, position);
            this.stats.trades++;
            this.saveStats();

            console.log(`[AUTONOMOUS] ✅ Position opened: ${coin} ${side} $${size} @ $${entryPrice.toFixed(2)}`);
            console.log(`[AUTONOMOUS]    SL: $${position.slPrice.toFixed(2)} | TP: $${position.tpPrice.toFixed(2)}`);
            console.log(`[AUTONOMOUS]    TX: ${result.order.id}`);
        } else {
            console.log(`[AUTONOMOUS] ❌ Trade failed:`, result.error || 'Simulated (no real execution)');
            if (result.simulated) {
                console.log(`[AUTONOMOUS] 💡 Need more USDC balance for real trades`);
            }
        }
    }

    async checkPositions() {
        for (const [coin, position] of this.positions) {
            const data = await this.getMarketData(coin);
            if (!data) continue;

            const currentPrice = data.price;
            const pnl = position.side === 'long'
                ? (currentPrice - position.entryPrice) / position.entryPrice * position.size
                : (position.entryPrice - currentPrice) / position.entryPrice * position.size;

            console.log(`[AUTONOMOUS] 📊 ${coin} ${position.side} | Entry: $${position.entryPrice.toFixed(2)} | Now: $${currentPrice.toFixed(2)} | PnL: $${pnl.toFixed(2)}`);

            // Check SL/TP
            const hitSL = position.side === 'long' ? currentPrice <= position.slPrice : currentPrice >= position.slPrice;
            const hitTP = position.side === 'long' ? currentPrice >= position.tpPrice : currentPrice <= position.tpPrice;

            if (hitSL || hitTP) {
                console.log(`[AUTONOMOUS] 🎯 ${hitTP ? 'TP' : 'SL'} hit for ${coin}`);
                await this.closePosition(coin, currentPrice, pnl, hitTP ? 'TP' : 'SL');
            }
        }
    }

    async closePosition(coin, exitPrice, pnl, reason) {
        const position = this.positions.get(coin);
        if (!position) return;

        // Close via GMX
        const result = await this.dexExecutor.closeGmxPosition({
            coin,
            side: position.side === 'long' ? 'sell' : 'buy',
            size: position.size
        });

        // Update stats
        if (pnl > 0) this.stats.wins++;
        else this.stats.losses++;
        this.stats.totalPnl += pnl;
        this.stats.dailyPnl += pnl;

        this.positions.delete(coin);
        this.saveStats();

        console.log(`[AUTONOMOUS] ✅ Closed ${coin} | Reason: ${reason} | PnL: $${pnl.toFixed(2)}`);
        console.log(`[AUTONOMOUS] 📊 Total PnL: $${this.stats.totalPnl.toFixed(2)} | WR: ${((this.stats.wins / (this.stats.wins + this.stats.losses)) * 100).toFixed(1)}%`);
    }

    loadStats() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
                this.stats = { ...this.stats, ...data };
            }
        } catch (e) {
            console.log('[AUTONOMOUS] Could not load stats');
        }
    }

    saveStats() {
        try {
            const dir = path.dirname(this.dataFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.dataFile, JSON.stringify(this.stats, null, 2));
        } catch (e) {
            console.log('[AUTONOMOUS] Could not save stats');
        }
    }

    async start() {
        const ok = await this.init();
        if (!ok) {
            console.log('[AUTONOMOUS] ❌ Initialization failed');
            return;
        }

        this.running = true;
        console.log(`[AUTONOMOUS] 🚀 Starting trading loop (${CONFIG.scanInterval / 1000}s interval)`);

        // Initial scan
        await this.scanAndTrade();

        // Trading loop
        this.tradingLoop = setInterval(async () => {
            if (!this.running) return;

            try {
                await this.checkPositions();
                await this.scanAndTrade();
            } catch (e) {
                console.error('[AUTONOMOUS] Loop error:', e.message);
            }
        }, CONFIG.scanInterval);

        // Status loop
        this.statusLoop = setInterval(() => {
            this.printStatus();
        }, 300000); // Every 5 min

        console.log('[AUTONOMOUS] ✅ Trading loop started');

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n[AUTONOMOUS] Stopping...');
            this.stop();
        });
    }

    stop() {
        this.running = false;
        if (this.tradingLoop) clearInterval(this.tradingLoop);
        if (this.statusLoop) clearInterval(this.statusLoop);
        this.printStatus();
        this.saveStats();
        process.exit(0);
    }

    printStatus() {
        const winRate = this.stats.trades > 0
            ? ((this.stats.wins / (this.stats.wins + this.stats.losses)) * 100).toFixed(1)
            : '0.0';

        console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🤖 OBELISK AUTONOMOUS TRADER                             ║
╠═══════════════════════════════════════════════════════════╣
║  Trades: ${this.stats.trades.toString().padEnd(6)} │ Wins: ${this.stats.wins.toString().padEnd(4)} │ Losses: ${this.stats.losses.toString().padEnd(4)}    ║
║  Win Rate: ${winRate.padEnd(5)}% │ Total PnL: $${this.stats.totalPnl.toFixed(2).padEnd(8)}         ║
║  Daily PnL: $${this.stats.dailyPnl.toFixed(2).padEnd(7)} │ Positions: ${this.positions.size}/${CONFIG.maxOpenPositions}            ║
╚═══════════════════════════════════════════════════════════╝`);
    }
}

// Run if called directly
if (require.main === module) {
    const trader = new AutonomousTrader();
    trader.start();
}

module.exports = { AutonomousTrader };
