/**
 * OBELISK INTERNAL MATCHING ENGINE V1.0
 * Permet à Obelisk de trader sans exchange externe
 *
 * Modes:
 * 1. PAPER - Simule les trades avec prix réels (Binance)
 * 2. POOL - Trade contre la liquidité interne Obelisk
 * 3. P2P - Match les ordres entre utilisateurs
 */

const fs = require('fs');
const path = require('path');

class InternalMatchingEngine {
    constructor() {
        // Order books par paire
        this.orderBooks = new Map();

        // Positions ouvertes
        this.positions = new Map();

        // Liquidité interne (pool Obelisk)
        this.liquidityPool = {
            USDC: 10000,  // Pool virtuel initial
            BTC: 0.1,
            ETH: 3,
            SOL: 50,
            ARB: 5000,
            LINK: 200
        };

        // Stats
        this.stats = {
            totalTrades: 0,
            totalVolume: 0,
            paperTrades: 0,
            poolTrades: 0,
            p2pMatches: 0,
            fees: 0
        };

        // Config
        this.config = {
            mode: 'PAPER',           // PAPER | POOL | P2P
            feeRate: 0.001,          // 0.1%
            maxSlippage: 0.005,      // 0.5%
            poolLiquidity: true,     // Use internal pool
            enableP2P: false,        // P2P matching
            dataFile: path.join(__dirname, 'data', 'internal_engine.json')
        };

        this.priceCache = {};
        this.lastPriceUpdate = 0;

        console.log('[INTERNAL-ENGINE] Obelisk Internal Matching Engine V1.0');
    }

    async init() {
        this.loadState();
        await this.updatePrices();
        console.log(`[INTERNAL-ENGINE] Mode: ${this.config.mode}`);
        console.log(`[INTERNAL-ENGINE] Pool USDC: $${this.liquidityPool.USDC.toFixed(2)}`);
        return true;
    }

    // Fetch real prices from Binance
    async updatePrices() {
        const now = Date.now();
        if (now - this.lastPriceUpdate < 5000) return this.priceCache;

        try {
            const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ARBUSDT', 'LINKUSDT', 'DOGEUSDT', 'XRPUSDT', 'ADAUSDT'];
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbols)}`);
            const data = await res.json();

            data.forEach(t => {
                const coin = t.symbol.replace('USDT', '');
                this.priceCache[coin] = parseFloat(t.price);
            });

            this.lastPriceUpdate = now;
        } catch (e) {
            console.log('[INTERNAL-ENGINE] Price fetch error:', e.message);
        }

        return this.priceCache;
    }

    // Main execute function
    async execute(order) {
        const { pair, side, quantity, price, leverage = 1, userId = 'default' } = order;

        // Get current price
        await this.updatePrices();
        const coin = pair.split('/')[0].replace('-PERP', '');
        const currentPrice = this.priceCache[coin];

        if (!currentPrice) {
            return { success: false, error: `No price for ${coin}`, simulated: true };
        }

        // Calculate execution price with slippage
        const slippage = side === 'buy' ? 1 + this.config.maxSlippage : 1 - this.config.maxSlippage;
        const executionPrice = price || (currentPrice * slippage);

        // Calculate size in USD
        const sizeUsd = quantity * executionPrice;
        const fee = sizeUsd * this.config.feeRate;

        // Execute based on mode
        let result;
        switch (this.config.mode) {
            case 'POOL':
                result = await this.executeAgainstPool(coin, side, quantity, executionPrice, userId);
                break;
            case 'P2P':
                result = await this.matchP2P(pair, side, quantity, executionPrice, userId);
                break;
            default:
                result = this.executePaper(coin, side, quantity, executionPrice, userId);
        }

        if (result.success) {
            // Update stats
            this.stats.totalTrades++;
            this.stats.totalVolume += sizeUsd;
            this.stats.fees += fee;

            // Track position
            this.updatePosition(userId, coin, side, quantity, executionPrice, leverage);

            this.saveState();
        }

        return {
            ...result,
            fee,
            route: `OBELISK_INTERNAL_${this.config.mode}`,
            simulated: this.config.mode === 'PAPER'
        };
    }

    // Paper trading - simulates with real prices
    executePaper(coin, side, quantity, price, userId) {
        this.stats.paperTrades++;

        return {
            success: true,
            order: {
                id: `PAPER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                coin,
                side,
                quantity,
                executionPrice: price,
                status: 'filled',
                filledAt: Date.now(),
                mode: 'PAPER'
            }
        };
    }

    // Pool trading - trade against Obelisk liquidity
    async executeAgainstPool(coin, side, quantity, price, userId) {
        const sizeUsd = quantity * price;

        // Check pool liquidity
        if (side === 'buy') {
            // User buys coin, pool sells coin
            const poolCoin = this.liquidityPool[coin] || 0;
            if (poolCoin < quantity) {
                return { success: false, error: `Insufficient pool liquidity for ${coin}` };
            }

            // Execute
            this.liquidityPool[coin] -= quantity;
            this.liquidityPool.USDC += sizeUsd;
        } else {
            // User sells coin, pool buys coin
            if (this.liquidityPool.USDC < sizeUsd) {
                return { success: false, error: 'Insufficient USDC in pool' };
            }

            // Execute
            this.liquidityPool[coin] = (this.liquidityPool[coin] || 0) + quantity;
            this.liquidityPool.USDC -= sizeUsd;
        }

        this.stats.poolTrades++;

        return {
            success: true,
            order: {
                id: `POOL_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                coin,
                side,
                quantity,
                executionPrice: price,
                status: 'filled',
                filledAt: Date.now(),
                mode: 'POOL',
                poolBalance: this.liquidityPool.USDC
            }
        };
    }

    // P2P matching - match orders between users
    async matchP2P(pair, side, quantity, price, userId) {
        // Get order book for pair
        if (!this.orderBooks.has(pair)) {
            this.orderBooks.set(pair, { bids: [], asks: [] });
        }

        const book = this.orderBooks.get(pair);
        const oppositeOrders = side === 'buy' ? book.asks : book.bids;

        // Try to match
        let remaining = quantity;
        const fills = [];

        for (let i = 0; i < oppositeOrders.length && remaining > 0; i++) {
            const order = oppositeOrders[i];

            // Check price compatibility
            if (side === 'buy' && order.price > price) break;
            if (side === 'sell' && order.price < price) break;

            // Match
            const fillQty = Math.min(remaining, order.quantity);
            fills.push({
                matchedWith: order.userId,
                quantity: fillQty,
                price: order.price
            });

            order.quantity -= fillQty;
            remaining -= fillQty;

            if (order.quantity <= 0) {
                oppositeOrders.splice(i, 1);
                i--;
            }
        }

        // If not fully filled, add to book
        if (remaining > 0) {
            const newOrder = { userId, quantity: remaining, price, timestamp: Date.now() };
            if (side === 'buy') {
                book.bids.push(newOrder);
                book.bids.sort((a, b) => b.price - a.price);
            } else {
                book.asks.push(newOrder);
                book.asks.sort((a, b) => a.price - b.price);
            }
        }

        const filledQty = quantity - remaining;
        this.stats.p2pMatches += fills.length;

        return {
            success: true,
            order: {
                id: `P2P_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                pair,
                side,
                quantity: filledQty,
                remaining,
                executionPrice: fills.length > 0 ? fills.reduce((sum, f) => sum + f.price * f.quantity, 0) / filledQty : price,
                status: remaining > 0 ? 'partial' : 'filled',
                fills,
                filledAt: Date.now(),
                mode: 'P2P'
            }
        };
    }

    // Position tracking
    updatePosition(userId, coin, side, quantity, price, leverage) {
        const key = `${userId}_${coin}`;
        const existing = this.positions.get(key) || { quantity: 0, avgPrice: 0, leverage: 1, pnl: 0 };

        if (side === 'buy') {
            const newQty = existing.quantity + quantity;
            existing.avgPrice = (existing.avgPrice * existing.quantity + price * quantity) / newQty;
            existing.quantity = newQty;
        } else {
            existing.quantity -= quantity;
            // Calculate PnL on close
            existing.pnl += (price - existing.avgPrice) * quantity * leverage;
        }

        existing.leverage = leverage;
        existing.lastUpdate = Date.now();

        if (existing.quantity <= 0) {
            this.positions.delete(key);
        } else {
            this.positions.set(key, existing);
        }
    }

    // Get user positions
    getPositions(userId) {
        const userPositions = [];
        this.positions.forEach((pos, key) => {
            if (key.startsWith(userId)) {
                const coin = key.split('_')[1];
                const currentPrice = this.priceCache[coin] || pos.avgPrice;
                const unrealizedPnl = (currentPrice - pos.avgPrice) * pos.quantity * pos.leverage;

                userPositions.push({
                    coin,
                    quantity: pos.quantity,
                    avgPrice: pos.avgPrice,
                    currentPrice,
                    leverage: pos.leverage,
                    unrealizedPnl,
                    realizedPnl: pos.pnl
                });
            }
        });
        return userPositions;
    }

    // Get pool status
    getPoolStatus() {
        return {
            ...this.liquidityPool,
            totalValueUsd: this.calculatePoolValue()
        };
    }

    calculatePoolValue() {
        let total = this.liquidityPool.USDC;
        for (const [coin, qty] of Object.entries(this.liquidityPool)) {
            if (coin !== 'USDC' && this.priceCache[coin]) {
                total += qty * this.priceCache[coin];
            }
        }
        return total;
    }

    // Add liquidity to pool
    addLiquidity(coin, amount) {
        this.liquidityPool[coin] = (this.liquidityPool[coin] || 0) + amount;
        this.saveState();
        return this.liquidityPool[coin];
    }

    // Set mode
    setMode(mode) {
        if (['PAPER', 'POOL', 'P2P'].includes(mode)) {
            this.config.mode = mode;
            console.log(`[INTERNAL-ENGINE] Mode changed to: ${mode}`);
            this.saveState();
            return true;
        }
        return false;
    }

    // Stats
    getStats() {
        return {
            mode: this.config.mode,
            ...this.stats,
            poolValue: this.calculatePoolValue(),
            openPositions: this.positions.size
        };
    }

    // Persistence
    loadState() {
        try {
            if (fs.existsSync(this.config.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.config.dataFile, 'utf8'));
                this.stats = data.stats || this.stats;
                this.liquidityPool = data.liquidityPool || this.liquidityPool;
                this.config.mode = data.mode || this.config.mode;
                if (data.positions) {
                    this.positions = new Map(data.positions);
                }
            }
        } catch (e) {
            console.log('[INTERNAL-ENGINE] Could not load state');
        }
    }

    saveState() {
        try {
            const dir = path.dirname(this.config.dataFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(this.config.dataFile, JSON.stringify({
                stats: this.stats,
                liquidityPool: this.liquidityPool,
                mode: this.config.mode,
                positions: Array.from(this.positions.entries()),
                savedAt: new Date().toISOString()
            }, null, 2));
        } catch (e) {
            console.log('[INTERNAL-ENGINE] Could not save state');
        }
    }
}

module.exports = { InternalMatchingEngine };
