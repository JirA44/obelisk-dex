/**
 * OBELISK Trading Router V1.0
 * Central trading hub - routes orders to Hyperliquid or DEX
 *
 * Features:
 * - Smart routing (HYP priority, DEX fallback)
 * - Order management (place, cancel, track)
 * - Position aggregation across exchanges
 * - Trade history with full audit trail
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Data persistence
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'trading_router_orders.json');
const HISTORY_FILE = path.join(DATA_DIR, 'trading_router_history.json');

class TradingRouter {
    constructor() {
        this.orders = new Map(); // Active orders
        this.positions = new Map(); // Open positions
        this.history = []; // Trade history
        this.executors = {}; // Exchange executors
        this.stats = {
            totalOrders: 0,
            totalVolume: 0,
            hypOrders: 0,
            dexOrders: 0,
            failedOrders: 0
        };
        this.config = {
            preferredExchange: 'hyperliquid', // Default routing
            dexFallback: true, // Use DEX if HYP fails
            maxRetries: 2,
            hyperliquidRateLimited: false,
            dexPriorityMode: false
        };
    }

    /**
     * Initialize with exchange executors
     */
    async init(executors) {
        this.executors = executors;
        await this.loadState();
        console.log('[TRADING-ROUTER] Initialized with executors:', Object.keys(executors));
        return this;
    }

    /**
     * Load persisted state
     */
    async loadState() {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }

            if (fs.existsSync(ORDERS_FILE)) {
                const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
                data.orders?.forEach(o => this.orders.set(o.id, o));
                data.positions?.forEach(p => this.positions.set(p.id, p));
                this.stats = data.stats || this.stats;
                this.config = { ...this.config, ...data.config };
            }

            if (fs.existsSync(HISTORY_FILE)) {
                this.history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
            }
        } catch (err) {
            console.error('[TRADING-ROUTER] Load state error:', err.message);
        }
    }

    /**
     * Save state to disk
     */
    saveState() {
        try {
            const ordersData = {
                orders: Array.from(this.orders.values()),
                positions: Array.from(this.positions.values()),
                stats: this.stats,
                config: this.config,
                timestamp: Date.now()
            };
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersData, null, 2));
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(this.history.slice(-1000), null, 2)); // Keep last 1000
        } catch (err) {
            console.error('[TRADING-ROUTER] Save state error:', err.message);
        }
    }

    /**
     * Generate unique order ID
     */
    generateOrderId() {
        return `OBE-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    }

    /**
     * Place an order - smart routing
     * @param {Object} order - Order details
     * @returns {Object} - Order result
     */
    async placeOrder(order) {
        const orderId = this.generateOrderId();
        const timestamp = Date.now();

        // V63.99: Extract TIER1+ flags
        const tierNum = order.tier ? parseInt(String(order.tier).replace('TIER', '')) : 0;
        const isTier1Plus = tierNum >= 1 || order.realExecution === true;
        const rejectPaper = order.rejectPaper === true || isTier1Plus;

        if (isTier1Plus) {
            console.log(`[TRADING-ROUTER] 🔥 TIER${tierNum} REAL EXECUTION: ${order.side} ${order.symbol} | Strategy: ${order.strategy || 'unknown'}`);
        }

        const orderRecord = {
            id: orderId,
            ...order,
            status: 'pending',
            createdAt: timestamp,
            exchange: null,
            txHash: null,
            fills: [],
            error: null,
            tier: tierNum,
            realExecution: isTier1Plus
        };

        this.orders.set(orderId, orderRecord);
        this.stats.totalOrders++;

        try {
            // V63.99: TIER1+ forces DEX execution first
            let targetExchange = this.config.preferredExchange;

            // TIER1+ always tries DEX first (real on-chain execution)
            if (isTier1Plus) {
                targetExchange = 'dex';
                console.log(`[TRADING-ROUTER] TIER${tierNum} forcing DEX execution (real on-chain)`);
            }
            // DEX Priority Mode - bypass HYP
            else if (this.config.dexPriorityMode) {
                targetExchange = 'dex';
                console.log(`[TRADING-ROUTER] DEX Priority Mode - routing to DEX`);
            }

            // Check if HYP is rate limited
            if (this.config.hyperliquidRateLimited && targetExchange === 'hyperliquid') {
                if (this.config.dexFallback) {
                    targetExchange = 'dex';
                    console.log(`[TRADING-ROUTER] HYP rate limited - fallback to DEX`);
                } else if (rejectPaper) {
                    throw new Error('Hyperliquid rate limited, TIER1+ rejects paper fallback');
                } else {
                    throw new Error('Hyperliquid rate limited, no fallback available');
                }
            }

            // Execute on target exchange
            let result;
            let executionAttempts = [];

            // V63.99: TIER1+ execution cascade: DEX -> GMX -> HYP -> reject (no paper)
            if (isTier1Plus) {
                // Try DEX first
                if (this.executors.dex) {
                    try {
                        result = await this.executeOnDex(orderRecord);
                        if (result.success && !result.simulated) {
                            this.stats.dexOrders++;
                            console.log(`[TRADING-ROUTER] ✅ TIER${tierNum} executed on DEX`);
                        } else {
                            executionAttempts.push({ exchange: 'dex', error: 'Simulated or failed' });
                            result = null;
                        }
                    } catch (dexErr) {
                        executionAttempts.push({ exchange: 'dex', error: dexErr.message });
                        console.log(`[TRADING-ROUTER] DEX failed: ${dexErr.message}`);
                    }
                }

                // Try HYP if DEX failed
                if (!result && this.executors.hyperliquid && !this.config.hyperliquidRateLimited) {
                    try {
                        result = await this.executeOnHyperliquid(orderRecord);
                        if (result.success) {
                            this.stats.hypOrders++;
                            console.log(`[TRADING-ROUTER] ✅ TIER${tierNum} executed on Hyperliquid`);
                        }
                    } catch (hypErr) {
                        executionAttempts.push({ exchange: 'hyperliquid', error: hypErr.message });
                        console.log(`[TRADING-ROUTER] HYP failed: ${hypErr.message}`);
                    }
                }

                // TIER1+ rejects paper trade
                if (!result || !result.success) {
                    throw new Error(`TIER${tierNum} real execution failed: ${executionAttempts.map(a => `${a.exchange}:${a.error}`).join(', ')}`);
                }
            }
            // Non-TIER1+ normal routing
            else if (targetExchange === 'hyperliquid' && this.executors.hyperliquid) {
                result = await this.executeOnHyperliquid(orderRecord);
                this.stats.hypOrders++;
            } else if (this.executors.dex) {
                result = await this.executeOnDex(orderRecord);
                this.stats.dexOrders++;
            } else if (!rejectPaper) {
                // Paper trade fallback (only for non-TIER1+)
                result = await this.executePaperTrade(orderRecord);
            } else {
                throw new Error('No real exchange available and paper rejected');
            }

            // Update order record
            orderRecord.status = result.success ? 'filled' : 'failed';
            orderRecord.exchange = result.exchange;
            orderRecord.txHash = result.txHash;
            orderRecord.fills = result.fills || [];
            orderRecord.executedAt = Date.now();
            orderRecord.executedPrice = result.price;
            orderRecord.fee = result.fee;

            // Track position
            if (result.success && order.type !== 'close') {
                this.trackPosition(orderRecord);
            }

            // Add to history
            this.history.push({
                ...orderRecord,
                pnl: result.pnl || 0
            });

            this.stats.totalVolume += (order.size * (result.price || order.price || 0));
            this.saveState();

            return {
                success: result.success,
                orderId,
                exchange: result.exchange,
                txHash: result.txHash,
                price: result.price,
                fee: result.fee,
                message: result.message
            };

        } catch (err) {
            orderRecord.status = 'failed';
            orderRecord.error = err.message;
            this.stats.failedOrders++;
            this.saveState();

            return {
                success: false,
                orderId,
                error: err.message
            };
        }
    }

    /**
     * Execute order on Hyperliquid
     */
    async executeOnHyperliquid(order) {
        const executor = this.executors.hyperliquid;
        if (!executor) {
            throw new Error('Hyperliquid executor not available');
        }

        try {
            // Convert to HYP format
            const coin = order.symbol.replace('/USDC', '').replace('/USDT', '');
            const isBuy = order.side === 'buy';

            // V1.1: Use execute() method (not placeOrder)
            const result = await executor.execute({
                coin,
                isBuy,
                sz: order.size,
                px: order.price,
                orderType: order.orderType || 'limit',
                reduceOnly: order.reduceOnly || false,
                slippage: order.slippage || 0.5
            });

            return {
                success: true,
                exchange: 'hyperliquid',
                txHash: result.txHash || result.orderId,
                price: result.avgPrice || order.price,
                fee: result.fee || (order.size * order.price * 0.0002),
                fills: result.fills || [],
                message: 'Order executed on Hyperliquid'
            };
        } catch (err) {
            // Check for rate limit
            if (err.message?.includes('429') || err.message?.includes('rate')) {
                this.config.hyperliquidRateLimited = true;
                setTimeout(() => {
                    this.config.hyperliquidRateLimited = false;
                }, 60000); // Reset after 1 min
            }
            throw err;
        }
    }

    /**
     * Execute order on DEX (Arbitrum)
     */
    async executeOnDex(order) {
        const executor = this.executors.dex;
        if (!executor) {
            throw new Error('DEX executor not available');
        }

        try {
            // For perps, use GMX
            if (order.leverage || order.type === 'perp') {
                return await this.executeOnGmx(order);
            }

            // For spot, use Paraswap/ODOS - V1.1: Use swapSpot() method
            const result = await executor.swapSpot({
                tokenIn: order.side === 'buy' ? 'USDC' : order.symbol.split('/')[0],
                tokenOut: order.side === 'buy' ? order.symbol.split('/')[0] : 'USDC',
                amount: order.size,
                slippage: order.slippage || 0.5
            });

            return {
                success: true,
                exchange: 'dex-arbitrum',
                txHash: result.txHash,
                price: result.executedPrice,
                fee: result.gasCost + (result.executedPrice * order.size * 0.001),
                message: 'Order executed on Arbitrum DEX'
            };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Execute perps on GMX
     * V1.5: Extended to support 13 GMX V2 markets (BTC, ETH, ARB, SOL, LINK, DOGE, AVAX, UNI, AAVE, OP, NEAR, ATOM, XRP)
     */
    async executeOnGmx(order) {
        const executor = this.executors.dex;

        // Extract coin from symbol (e.g., "ARB/USDC" -> "ARB", "SOL-PERP" -> "SOL")
        const coin = order.symbol
            .replace('/USDC', '')
            .replace('/USDT', '')
            .replace('-PERP', '')
            .toUpperCase();

        console.log(`[TRADING-ROUTER] GMX perp order: ${coin} ${order.side} $${order.size} x${order.leverage || 1}`);

        // V1.5: Use openGmxPosition() with coin parameter
        const result = await executor.openGmxPosition({
            coin,
            side: order.side,
            size: order.size,
            leverage: order.leverage || 2,
        });

        // Check if simulated (unsupported market)
        if (result.simulated) {
            console.log(`[TRADING-ROUTER] GMX returned simulation for ${coin}`);
            return {
                success: true,
                exchange: 'gmx-arbitrum-simulated',
                txHash: result.order?.id,
                price: result.order?.executionPrice,
                fee: result.fee,
                message: `GMX position simulated (${result.route})`,
                simulated: true
            };
        }

        return {
            success: true,
            exchange: 'gmx-arbitrum',
            txHash: result.order?.id,
            price: result.order?.executionPrice,
            fee: result.fee,
            message: `Position opened on GMX V2 (${coin})`
        };
    }

    /**
     * Paper trade fallback (simulation)
     */
    async executePaperTrade(order) {
        // Simulate execution with small slippage
        const slippage = (Math.random() - 0.5) * 0.002; // +/- 0.1%
        const executedPrice = order.price * (1 + slippage);

        return {
            success: true,
            exchange: 'paper',
            txHash: `PAPER-${Date.now()}`,
            price: executedPrice,
            fee: order.size * executedPrice * 0.001,
            message: 'Paper trade executed (simulation)',
            simulated: true
        };
    }

    /**
     * Track open position
     */
    trackPosition(order) {
        const positionId = `${order.symbol}-${order.side}`;
        const existing = this.positions.get(positionId);

        if (existing) {
            // Average into position
            const totalSize = existing.size + order.size;
            const avgPrice = (existing.size * existing.entryPrice + order.size * order.executedPrice) / totalSize;
            existing.size = totalSize;
            existing.entryPrice = avgPrice;
            existing.updatedAt = Date.now();
        } else {
            this.positions.set(positionId, {
                id: positionId,
                symbol: order.symbol,
                side: order.side,
                size: order.size,
                entryPrice: order.executedPrice,
                exchange: order.exchange,
                openedAt: Date.now(),
                updatedAt: Date.now()
            });
        }
    }

    /**
     * Cancel an order
     */
    async cancelOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        if (order.status !== 'pending' && order.status !== 'open') {
            return { success: false, error: `Cannot cancel order with status: ${order.status}` };
        }

        try {
            // Cancel on exchange if applicable
            if (order.exchange === 'hyperliquid' && this.executors.hyperliquid) {
                await this.executors.hyperliquid.cancelOrder(order.txHash);
            }

            order.status = 'cancelled';
            order.cancelledAt = Date.now();
            this.saveState();

            return { success: true, orderId, message: 'Order cancelled' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    /**
     * Get all open positions
     */
    getPositions() {
        return Array.from(this.positions.values());
    }

    /**
     * Get trade history
     */
    getHistory(options = {}) {
        let history = [...this.history];

        // Filter by symbol
        if (options.symbol) {
            history = history.filter(h => h.symbol === options.symbol);
        }

        // Filter by exchange
        if (options.exchange) {
            history = history.filter(h => h.exchange === options.exchange);
        }

        // Filter by date range
        if (options.from) {
            history = history.filter(h => h.createdAt >= options.from);
        }
        if (options.to) {
            history = history.filter(h => h.createdAt <= options.to);
        }

        // Limit
        if (options.limit) {
            history = history.slice(-options.limit);
        }

        return history;
    }

    /**
     * Get router stats
     */
    getStats() {
        return {
            ...this.stats,
            activeOrders: this.orders.size,
            openPositions: this.positions.size,
            config: this.config
        };
    }

    /**
     * Set DEX priority mode
     */
    setDexPriorityMode(enabled) {
        this.config.dexPriorityMode = enabled;
        this.saveState();
        console.log(`[TRADING-ROUTER] DEX Priority Mode: ${enabled ? 'ON' : 'OFF'}`);
    }

    /**
     * Set rate limit status
     */
    setHyperliquidRateLimited(limited) {
        this.config.hyperliquidRateLimited = limited;
        this.saveState();
    }
}

// Singleton instance
const tradingRouter = new TradingRouter();

module.exports = { TradingRouter, tradingRouter };
