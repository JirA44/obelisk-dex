const ENABLE_LOGS = false; // Quick Win: Disable for performance

/**
 * OBELISK PERPS ENGINE V2.0
 * Trading de perpetuels multi-venue
 *
 * Features:
 * - Long/Short avec leverage (1x-50x)
 * - Liquidation automatique
 * - Funding rate (8h) - taux réels Binance
 * - PnL temps réel
 * - TP/SL orders
 * - Multi-venue: PAPER (default) + GMX + HYPERLIQUID (optionnel)
 */

const fs = require('fs');
const path = require('path');

// Venue configurations
const VENUES = {
    PAPER: { name: 'Paper Trading', maxLeverage: 50, fee: 0.05 },
    GMX: { name: 'GMX V2 Arbitrum', maxLeverage: 50, fee: 0.05 },
    HYPERLIQUID: { name: 'Hyperliquid', maxLeverage: 50, fee: 0.025 },
};

class ObeliskPerps {
    constructor() {
        this.positions = new Map();
        this.tpslOrders = new Map();  // V2.0: TP/SL orders
        this.history = [];  // V2.0: Trade history

        // External executors (injected for real execution)
        this.executors = {
            gmx: null,
            hyperliquid: null,
        };

        // Liquidity pool for perps (protocol is counterparty)
        // ⚠️ SIMULATED — $100K liquidity est fictive (paper mode)
        // Pour passer en real: connecter GMX ou Hyperliquid executor
        this.liquidityPool = {
            USDC: 100000,       // SIMULATED — pas de vrais fonds
            totalLongs: 0,
            totalShorts: 0,
            openInterest: 0,
            mode: 'PAPER',      // 'PAPER' | 'LIVE'
        };

        // Config V2.0
        this.config = {
            defaultVenue: 'PAPER',
            maxLeverage: 50,           // V2.0: Increased from 10
            minLeverage: 1,
            liquidationThreshold: 0.9,
            maintenanceMargin: 0.05,
            fundingInterval: 8 * 60 * 60 * 1000,
            maxOpenInterest: 1000000,  // V2.0: $1M max OI
            tradingFee: 0.0005,        // V2.0: 0.05% fee
            fundingRate: 0.0001,
        };

        // Stats
        this.stats = {
            totalTrades: 0,
            totalVolume: 0,
            totalLiquidations: 0,
            feesCollected: 0,
            fundingCollected: 0,
            pnlPaid: 0,
            byVenue: { PAPER: 0, GMX: 0, HYPERLIQUID: 0 }
        };

        // V2.0: Extended coins (36 coins)
        this.prices = {};
        this.fundingRates = {};  // V2.0: Real funding rates
        this.coins = [
            'BTC', 'ETH', 'SOL', 'ARB', 'LINK', 'DOGE', 'XRP', 'ADA', 'AVAX', 'OP',
            'AAVE', 'CRV', 'UNI', 'MKR', 'LDO', 'MATIC', 'SUI', 'APT', 'NEAR', 'FTM',
            'TIA', 'INJ', 'SEI', 'PENDLE', 'ENA', 'WIF', 'PEPE', 'BONK', 'JUP',
            'RENDER', 'STX', 'IMX', 'GALA', 'AXS', 'SAND', 'ENJ'
        ];

        this.dataFile = path.join(__dirname, 'data', 'obelisk_perps.json');
        this.historyFile = path.join(__dirname, 'data', 'obelisk_perps_history.json');
        this.lastFundingTime = Date.now();

        console.log('[OBELISK-PERPS] Perpetuals Engine V2.0 initialized');
    }

    async init(executors = {}) {
        this.executors = { ...this.executors, ...executors };
        this.loadState();
        await this.syncPrices();
        await this.syncFundingRates();

        // Start intervals
        setInterval(() => this.applyFunding(), this.config.fundingInterval);
        setInterval(() => this.syncPrices(), 5000);  // V2.0: 5s price updates
        setInterval(() => this.syncFundingRates(), 60000);  // V2.0: Funding rates every min
        setInterval(() => this.checkLiquidations(), 2000);  // V2.0: 2s liquidation check
        setInterval(() => this.checkTpSlOrders(), 2000);  // V2.0: TP/SL check

        const venues = ['PAPER'];
        if (this.executors.gmx) venues.push('GMX');
        if (this.executors.hyperliquid) venues.push('HYPERLIQUID');

        if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] Pool: $${this.liquidityPool.USDC.toFixed(0)} USDC`);
        if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] Max Leverage: ${this.config.maxLeverage}x | Coins: ${this.coins.length}`);
        if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] Venues: ${venues.join(', ')}`);

        return true;
    }

    // V2.0: Sync all prices from Binance
    async syncPrices() {
        try {
            const res = await fetch('https://api.binance.com/api/v3/ticker/price');
            const data = await res.json();

            for (const ticker of data) {
                const coin = ticker.symbol.replace('USDT', '');
                if (this.coins.includes(coin)) {
                    this.prices[coin] = parseFloat(ticker.price);
                }
            }
        } catch (e) {
            // Keep existing prices
        }
    }

    // V2.0: Sync real funding rates from Binance Futures
    async syncFundingRates() {
        try {
            const res = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex');
            const data = await res.json();

            for (const item of data) {
                const coin = item.symbol.replace('USDT', '');
                if (this.coins.includes(coin)) {
                    this.fundingRates[coin] = parseFloat(item.lastFundingRate);
                }
            }
        } catch (e) {
            // Keep simulated rates
        }
    }

    // V2.0: Open position with venue support
    async openPosition(order) {
        const {
            coin, side, size, leverage = 2, userId = 'default',
            venue = this.config.defaultVenue,
            tp = null, sl = null,  // V2.0: TP/SL
            source = 'api'
        } = order;

        const coinUpper = coin.toUpperCase();
        const venueUpper = (venue || 'PAPER').toUpperCase();

        // Validate
        if (!this.prices[coinUpper]) {
            await this.syncPrices();
            if (!this.prices[coinUpper]) {
                return { success: false, error: `Unknown coin: ${coinUpper}` };
            }
        }

        if (leverage < this.config.minLeverage || leverage > this.config.maxLeverage) {
            return { success: false, error: `Leverage must be ${this.config.minLeverage}-${this.config.maxLeverage}x` };
        }

        const entryPrice = this.prices[coinUpper];
        const notionalValue = size;
        const margin = notionalValue / leverage;

        if (this.liquidityPool.openInterest + notionalValue > this.config.maxOpenInterest) {
            return { success: false, error: 'Max open interest reached' };
        }

        // V3.1: Allow up to 3 positions per coin (for HFT scaling)
        const existingPositions = Array.from(this.positions.values()).filter(
            p => p.userId === userId && p.coin === coinUpper
        );
        const MAX_POSITIONS_PER_COIN = 3;
        if (existingPositions.length >= MAX_POSITIONS_PER_COIN) {
            return { success: false, error: `Max ${MAX_POSITIONS_PER_COIN} positions on ${coinUpper}. Close one first.` };
        }

        // Unique position key with timestamp
        const positionKey = `${userId}_${coinUpper}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // V2.0: Execute on venue if not PAPER
        let txHash = null;
        if (venueUpper !== 'PAPER' && this.executors[venueUpper.toLowerCase()]) {
            try {
                const result = await this.executeOnVenue(venueUpper, {
                    coin: coinUpper, side, size, leverage, entryPrice
                });
                if (!result.success) {
                    if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] ${venueUpper} failed, fallback to PAPER`);
                }
                txHash = result.txHash;
            } catch (e) {
                if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] ${venueUpper} error: ${e.message}`);
            }
        }

        const fee = notionalValue * this.config.tradingFee;

        const position = {
            id: `PERP_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            userId,
            coin: coinUpper,
            side: side.toLowerCase(),
            size: notionalValue,
            margin,
            leverage,
            entryPrice,
            liquidationPrice: this.calculateLiquidationPrice(entryPrice, leverage, side),
            tp,  // V2.0
            sl,  // V2.0
            venue: venueUpper,  // V2.0
            txHash,  // V2.0
            source,  // V2.0
            openedAt: Date.now(),
            lastFundingTime: Date.now(),
            accumulatedFunding: 0,
            realizedPnl: -fee
        };

        this.positions.set(positionKey, position);
        this.liquidityPool.openInterest += notionalValue;
        if (side.toLowerCase() === 'long') {
            this.liquidityPool.totalLongs += notionalValue;
        } else {
            this.liquidityPool.totalShorts += notionalValue;
        }

        this.stats.totalTrades++;
        this.stats.totalVolume += notionalValue;
        this.stats.feesCollected += fee;
        this.stats.byVenue[venueUpper] = (this.stats.byVenue[venueUpper] || 0) + 1;

        // V2.0: Create TP/SL orders
        if (tp) this.createTpSlOrder(positionKey, 'tp', tp);
        if (sl) this.createTpSlOrder(positionKey, 'sl', sl);

        this.saveState();

        const emoji = venueUpper === 'PAPER' ? '📝' : '🔥';
        if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] ${emoji} OPEN ${venueUpper}: ${side.toUpperCase()} ${coinUpper} $${notionalValue} @ ${leverage}x`);

        // V3.1: Queue for blockchain settlement (async, non-blocking)
        if (this.settlementEngine && this.batcher) {
            const tradeData = {
                type: 'OPEN',
                coin: coinUpper,
                side: position.side,
                size: notionalValue,
                price: entryPrice,
                leverage,
                userId: userId,
                timestamp: Date.now()
            };
            try { this.batcher.addTrade(tradeData); } catch(err) {
                console.warn('[OBELISK-PERPS] Settlement queue error:', err.message);
            }
        }

        return {
            success: true,
            position: {
                id: position.id,
                coin: coinUpper,
                side: position.side,
                size: notionalValue,
                margin,
                leverage,
                entryPrice,
                liquidationPrice: position.liquidationPrice,
                tp, sl,
                venue: venueUpper,
                fee
            },
            route: `OBELISK_PERPS_${venueUpper}`,
            simulated: venueUpper === 'PAPER'
        };
    }

    // V2.0: Execute on external venue
    async executeOnVenue(venue, order) {
        if (venue === 'GMX' && this.executors.gmx) {
            return await this.executors.gmx.openGmxPosition({
                coin: order.coin,
                side: order.side,
                size: order.size,
                leverage: order.leverage,
            });
        }
        if (venue === 'HYPERLIQUID' && this.executors.hyperliquid) {
            return await this.executors.hyperliquid.placeOrder({
                coin: order.coin,
                isBuy: order.side === 'long' || order.side === 'buy',
                sz: order.size / order.entryPrice,
                px: order.entryPrice,
                leverage: order.leverage,
            });
        }
        return { success: false, error: 'Venue not available' };
    }

    // Close position
    async closePosition(order) {
        const { coin, userId = 'default', reason = 'manual', positionId } = order;

        // V3.1: Find position by userId + coin (or specific positionId)
        let positionKey, position;
        if (positionId) {
            // Close specific position by ID
            positionKey = positionId;
            position = this.positions.get(positionKey);
        } else {
            // Close first matching position for this coin
            const matches = Array.from(this.positions.entries()).filter(
                ([key, pos]) => pos.userId === userId && pos.coin === coin.toUpperCase()
            );
            if (matches.length > 0) {
                [positionKey, position] = matches[0];
            }
        }

        if (!position) {
            return { success: false, error: `No position found for ${coin}` };
        }

        const exitPrice = this.prices[position.coin];
        const pnl = this.calculatePnL(position, exitPrice);
        const fee = position.size * this.config.tradingFee;

        this.liquidityPool.openInterest -= position.size;
        if (position.side === 'long') {
            this.liquidityPool.totalLongs -= position.size;
        } else {
            this.liquidityPool.totalShorts -= position.size;
        }

        const netPnl = pnl.total - fee;
        this.liquidityPool.USDC -= netPnl;
        this.stats.pnlPaid += netPnl;
        this.stats.feesCollected += fee;
        this.stats.totalTrades++;

        // V2.0: Add to history
        this.history.push({
            ...position,
            exitPrice,
            pnl: netPnl,
            closedAt: Date.now(),
            closeReason: reason
        });

        // Remove TP/SL orders
        this.tpslOrders.delete(`${positionKey}_tp`);
        this.tpslOrders.delete(`${positionKey}_sl`);

        this.positions.delete(positionKey);
        this.saveState();

        const emoji = netPnl > 0 ? '✅' : '❌';
        if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] ${emoji} CLOSE: ${position.side.toUpperCase()} ${position.coin} | PnL: $${netPnl.toFixed(2)}`);

        // V3.1: Queue settlement for closed position
        if (this.settlementEngine && this.batcher) {
            const tradeData = {
                type: 'CLOSE',
                coin: position.coin,
                side: position.side,
                size: position.size,
                entryPrice: position.entryPrice,
                exitPrice: exitPrice,
                pnl: netPnl,
                userId: position.userId,
                timestamp: Date.now()
            };
            try { this.batcher.addTrade(tradeData); } catch(err) {
                console.warn('[OBELISK-PERPS] Settlement queue error:', err.message);
            }
        }

        return {
            success: true,
            result: {
                id: position.id,
                coin: position.coin,
                side: position.side,
                entryPrice: position.entryPrice,
                exitPrice,
                size: position.size,
                leverage: position.leverage,
                pnl: pnl.total,
                fee,
                netPnl,
                venue: position.venue,
                duration: Date.now() - position.openedAt
            },
            route: `OBELISK_PERPS_${position.venue}`,
            simulated: position.venue === 'PAPER'
        };
    }

    // V2.0: TP/SL orders
    createTpSlOrder(positionKey, type, price) {
        this.tpslOrders.set(`${positionKey}_${type}`, {
            positionKey,
            type,
            triggerPrice: price,
            createdAt: Date.now()
        });
    }

    checkTpSlOrders() {
        this.tpslOrders.forEach((order, key) => {
            const position = this.positions.get(order.positionKey);
            if (!position) {
                this.tpslOrders.delete(key);
                return;
            }

            const price = this.prices[position.coin];
            if (!price) return;

            let triggered = false;

            if (order.type === 'tp') {
                triggered = position.side === 'long'
                    ? price >= order.triggerPrice
                    : price <= order.triggerPrice;
            } else if (order.type === 'sl') {
                triggered = position.side === 'long'
                    ? price <= order.triggerPrice
                    : price >= order.triggerPrice;
            }

            if (triggered) {
                if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] 🎯 ${order.type.toUpperCase()} triggered for ${position.coin}`);
                this.closePosition({
                    coin: position.coin,
                    userId: position.userId,
                    reason: order.type === 'tp' ? 'take_profit' : 'stop_loss'
                });
            }
        });
    }

    calculatePnL(position, currentPrice) {
        const priceDiff = currentPrice - position.entryPrice;
        const direction = position.side === 'long' ? 1 : -1;
        const percentChange = (priceDiff / position.entryPrice) * direction;
        const leveragedChange = percentChange * position.leverage;
        const unrealizedPnl = position.margin * leveragedChange;

        return {
            unrealized: unrealizedPnl,
            funding: position.accumulatedFunding,
            realized: position.realizedPnl,
            total: unrealizedPnl + position.accumulatedFunding + position.realizedPnl,
            percentChange: percentChange * 100,
            leveragedPercent: leveragedChange * 100
        };
    }

    calculateLiquidationPrice(entryPrice, leverage, side) {
        const liquidationPercent = this.config.liquidationThreshold / leverage;
        return side.toLowerCase() === 'long'
            ? entryPrice * (1 - liquidationPercent)
            : entryPrice * (1 + liquidationPercent);
    }

    checkLiquidations() {
        this.positions.forEach((position, key) => {
            const currentPrice = this.prices[position.coin];
            if (!currentPrice) return;

            const shouldLiquidate = position.side === 'long'
                ? currentPrice <= position.liquidationPrice
                : currentPrice >= position.liquidationPrice;

            if (shouldLiquidate) {
                if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] 💀 LIQUIDATION: ${position.side.toUpperCase()} ${position.coin}`);

                this.liquidityPool.USDC += position.margin * 0.9;
                this.liquidityPool.openInterest -= position.size;
                if (position.side === 'long') {
                    this.liquidityPool.totalLongs -= position.size;
                } else {
                    this.liquidityPool.totalShorts -= position.size;
                }

                this.history.push({
                    ...position,
                    exitPrice: currentPrice,
                    pnl: -position.margin,
                    closedAt: Date.now(),
                    closeReason: 'liquidation'
                });

                this.stats.totalLiquidations++;
                this.positions.delete(key);
                this.tpslOrders.delete(`${key}_tp`);
                this.tpslOrders.delete(`${key}_sl`);
            }
        });
    }

    // V2.0: Real funding rates from Binance
    applyFunding() {
        this.positions.forEach((position) => {
            const rate = this.fundingRates[position.coin] || this.config.fundingRate;
            const fundingAmount = position.size * Math.abs(rate);

            // Longs pay when rate > 0, shorts pay when rate < 0
            if (rate > 0) {
                position.accumulatedFunding += position.side === 'long' ? -fundingAmount : fundingAmount;
            } else {
                position.accumulatedFunding += position.side === 'short' ? -fundingAmount : fundingAmount;
            }

            position.lastFundingTime = Date.now();
        });

        this.lastFundingTime = Date.now();
        if (this.positions.size > 0) {
            if (ENABLE_LOGS) console.log(`[OBELISK-PERPS] 💰 Funding applied to ${this.positions.size} positions`);
        }
        this.saveState();
    }

    getPosition(userId, coin) {
        const positionKey = `${userId}_${coin.toUpperCase()}`;
        const position = this.positions.get(positionKey);
        if (!position) return null;

        const currentPrice = this.prices[position.coin];
        const pnl = this.calculatePnL(position, currentPrice);

        return { ...position, currentPrice, pnl };
    }

    getUserPositions(userId) {
        const positions = [];
        this.positions.forEach((position) => {
            if (position.userId === userId) {
                positions.push(this.getPosition(userId, position.coin));
            }
        });
        return positions;
    }

    getAllPositions() {
        const positions = [];
        this.positions.forEach((position) => {
            const currentPrice = this.prices[position.coin];
            const pnl = this.calculatePnL(position, currentPrice);
            positions.push({ ...position, currentPrice, pnl });
        });
        return positions;
    }

    // V2.0: Get history
    getHistory(limit = 100) {
        return this.history.slice(-limit);
    }

    getPoolStats() {
        return {
            liquidity: this.liquidityPool.USDC,
            totalLongs: this.liquidityPool.totalLongs,
            totalShorts: this.liquidityPool.totalShorts,
            openInterest: this.liquidityPool.openInterest,
            longShortRatio: this.liquidityPool.totalLongs / (this.liquidityPool.totalShorts || 1),
            utilizationRate: this.liquidityPool.openInterest / this.config.maxOpenInterest,
            nextFunding: this.lastFundingTime + this.config.fundingInterval - Date.now()
        };
    }

    getStats() {
        return {
            ...this.stats,
            openPositions: this.positions.size,
            pool_simule: this.getPoolStats(),
            type: 'PAPER_TRADING',
            disclaimer: 'SIMULÉ - Pas de vrais fonds, liquidité virtuelle',
            prices: this.prices,
            venues: Object.keys(VENUES),
            maxLeverage: this.config.maxLeverage,
            coins: this.coins.length
        };
    }

    loadState() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
                if (data.positions) this.positions = new Map(data.positions);
                if (data.tpslOrders) this.tpslOrders = new Map(data.tpslOrders);
                this.liquidityPool = data.liquidityPool || this.liquidityPool;
                this.stats = { ...this.stats, ...data.stats };
                this.lastFundingTime = data.lastFundingTime || Date.now();
            }
            if (fs.existsSync(this.historyFile)) {
                this.history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
            }
        } catch (e) {
            console.log('[OBELISK-PERPS] Could not load state');
        }
    }

    saveState() {
        try {
            const dir = path.dirname(this.dataFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(this.dataFile, JSON.stringify({
                positions: Array.from(this.positions.entries()),
                tpslOrders: Array.from(this.tpslOrders.entries()),
                liquidityPool: this.liquidityPool,
                stats: this.stats,
                lastFundingTime: this.lastFundingTime,
                savedAt: new Date().toISOString()
            }, null, 2));

            fs.writeFileSync(this.historyFile, JSON.stringify(this.history.slice(-500), null, 2));
        } catch (e) {}
    }
}

module.exports = { ObeliskPerps, VENUES };
