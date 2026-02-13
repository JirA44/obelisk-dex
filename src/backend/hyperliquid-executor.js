// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK - HYPERLIQUID EXECUTOR
// Direct execution on Hyperliquid for MixBot fallback orders
// ═══════════════════════════════════════════════════════════════════════════════

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Hyperliquid } = require('hyperliquid');

class HyperliquidExecutor {
    constructor() {
        this.sdk = null;
        this.initialized = false;
        this.lastError = null;
        this.rateLimited = false;
        this.stats = { orders: 0, filled: 0, failed: 0 };

        // V2.2: Hyperliquid szDecimals mapping (precision requirements)
        this.szDecimals = {
            'BTC': 5, 'ETH': 4, 'SOL': 2, 'AVAX': 1, 'ARB': 0, 'OP': 0,
            'SUI': 0, 'APT': 1, 'INJ': 1, 'TIA': 1, 'SEI': 0, 'NEAR': 1,
            'LINK': 1, 'ATOM': 1, 'DOT': 1, 'MATIC': 0, 'FTM': 0,
            'DOGE': 0, 'SHIB': 0, 'PEPE': 0, 'WIF': 0, 'BONK': 0,
            'XRP': 0, 'ADA': 0, 'LTC': 2, 'BCH': 2, 'ETC': 1,
            'AAVE': 2, 'UNI': 1, 'MKR': 3, 'CRV': 0, 'LDO': 0,
            'FIL': 1, 'RNDR': 0, 'STX': 0, 'IMX': 0, 'GALA': 0,
            'SAND': 0, 'AXS': 1, 'MANA': 0, 'ENJ': 0, 'GMT': 0,
            'BLUR': 0, 'STRAX': 0, 'SXP': 0, 'COMBO': 0, 'DUSK': 0,
            'BIGTIME': 0, 'RONIN': 0, 'GUN': 0, 'DOLO': 0, 'FOGO': 0, 'PUMP': 0
        };
    }

    // V2.2: Round quantity according to Hyperliquid requirements
    roundQuantity(coin, quantity) {
        const decimals = this.szDecimals[coin] ?? 2; // Default 2 decimals
        const multiplier = Math.pow(10, decimals);
        const rounded = Math.floor(quantity * multiplier) / multiplier;
        console.log(`[HYP-EXEC] Rounding ${coin}: ${quantity} → ${rounded} (szDecimals=${decimals})`);
        return rounded;
    }

    async init() {
        try {
            const privateKey = process.env.HYPERLIQUID_PRIVATE_KEY || process.env.PRIVATE_KEY;
            // V2.3: Prioritize HYPERLIQUID_WALLET to avoid Windows ENV conflicts
            const walletAddress = process.env.HYPERLIQUID_WALLET || process.env.WALLET_ADDRESS;

            if (!privateKey || !walletAddress) {
                console.log('[HYP-EXEC] Missing credentials, simulation mode only');
                return false;
            }

            this.sdk = new Hyperliquid({
                privateKey: privateKey,
                walletAddress: walletAddress,
                testnet: false,
                disableAssetMapRefresh: true,
            });

            // Test connection
            try {
                await this.sdk.info.perpetuals.getMeta();
                this.initialized = true;
                console.log('[HYP-EXEC] Hyperliquid executor ready');
                return true;
            } catch (testErr) {
                if (testErr.message?.includes('429') || testErr.code === 429) {
                    this.rateLimited = true;
                    console.log('[HYP-EXEC] Rate limited (429) - will simulate orders');
                } else {
                    console.log('[HYP-EXEC] Connection test failed:', testErr.message);
                }
                return false;
            }
        } catch (err) {
            console.error('[HYP-EXEC] Init error:', err.message);
            this.lastError = err.message;
            return false;
        }
    }

    /**
     * Execute order on Hyperliquid
     * @param {Object} order - Order details
     * @returns {Object} Execution result
     */
    async execute(order) {
        this.stats.orders++;

        // If not initialized or rate limited, return simulation
        if (!this.initialized || this.rateLimited || !this.sdk) {
            console.log('[HYP-EXEC] Simulating order (not connected)');
            return this.simulateOrder(order);
        }

        try {
            const { pair, side, quantity, leverage, strategy, price: orderPrice, coin: orderCoin, symbol } = order;

            // Parse coin from pair (BTC/USDT -> BTC) with fallbacks
            const rawPair = pair || symbol || orderCoin;
            if (!rawPair) {
                console.log('[HYP-EXEC] No pair/symbol/coin in order, simulating');
                return this.simulateOrder(order);
            }
            const coin = rawPair.includes('/') ? rawPair.split('/')[0] : rawPair.replace('-PERP', '').replace('USDT', '');

            // V63.95: Fix undefined side - check direction too
            const orderSide = side || order.direction;
            if (!orderSide) {
                console.log('[HYP-EXEC] No side/direction in order, simulating');
                return this.simulateOrder(order);
            }
            const sideStr = String(orderSide).toLowerCase();
            const isBuy = sideStr === 'buy' || sideStr === 'long';

            // Get current price - use provided price or fetch from Binance
            let currentPrice = orderPrice;
            if (!currentPrice) {
                try {
                    const binanceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
                    const binanceData = await binanceRes.json();
                    currentPrice = parseFloat(binanceData.price);
                } catch (priceErr) {
                    console.log(`[HYP-EXEC] Could not fetch price for ${coin}`);
                }
            }

            if (!currentPrice) {
                console.log(`[HYP-EXEC] No price for ${coin}, simulating`);
                return this.simulateOrder(order);
            }

            // Note: Leverage is set per-asset on Hyperliquid UI, skip SDK call to avoid errors
            // The account default leverage will be used

            // V2.2: Round quantity according to Hyperliquid szDecimals
            const roundedQuantity = this.roundQuantity(coin, quantity);
            if (roundedQuantity <= 0) {
                console.log(`[HYP-EXEC] Quantity too small after rounding: ${quantity} → ${roundedQuantity}`);
                return this.simulateOrder(order);
            }

            // Execute market order
            console.log(`[HYP-EXEC] Executing: ${sideStr.toUpperCase()} ${roundedQuantity} ${coin} @ ~$${currentPrice.toFixed(2)}`);

            let result;
            try {
                result = await this.sdk.custom.marketOpen(
                    coin,
                    isBuy,
                    roundedQuantity,
                    currentPrice,
                    0.02 // V2.2: 2% slippage (was 1%)
                );
                console.log(`[HYP-EXEC] SDK Response:`, JSON.stringify(result).slice(0, 200));
            } catch (sdkErr) {
                console.log(`[HYP-EXEC] SDK marketOpen error: ${sdkErr.message}`);
                return this.simulateOrder(order);
            }

            // Check result
            const statuses = result?.response?.data?.statuses || result?.data?.statuses || [];
            const orderFilled = statuses.find(s => s.filled);
            const orderError = statuses.find(s => s.error);

            if (orderError) {
                this.stats.failed++;

                // Check for rate limit
                if (orderError.error?.includes('Too many') || orderError.error?.includes('429')) {
                    this.rateLimited = true;
                    console.log('[HYP-EXEC] Rate limited - switching to simulation mode');
                }

                return {
                    success: false,
                    error: orderError.error,
                    simulated: false,
                    route: 'HYPERLIQUID_ERROR'
                };
            }

            if (orderFilled) {
                this.stats.filled++;
                const execPrice = parseFloat(orderFilled.filled.avgPx);
                const execQty = parseFloat(orderFilled.filled.totalSz);

                console.log(`[HYP-EXEC] FILLED: ${execQty} @ $${execPrice}`);

                return {
                    success: true,
                    order: {
                        id: 'HYP_' + Date.now(),
                        executionPrice: execPrice,
                        quantity: execQty,
                        status: 'filled',
                        filledAt: Date.now()
                    },
                    simulated: false,
                    route: 'HYPERLIQUID_LIVE',
                    fee: execQty * execPrice * 0.0002 // ~0.02% taker fee
                };
            }

            // Unknown result
            return this.simulateOrder(order);

        } catch (err) {
            this.stats.failed++;
            console.error('[HYP-EXEC] Execution error:', err.message);

            // Check for rate limit
            if (err.message?.includes('429') || err.message?.includes('Too many')) {
                this.rateLimited = true;
            }

            this.lastError = err.message;
            return this.simulateOrder(order);
        }
    }

    /**
     * Close position on Hyperliquid (reduce only)
     */
    async closePosition(coin) {
        if (!this.initialized || !this.sdk) {
            console.log('[HYP-EXEC] Cannot close position - not initialized');
            return { success: false, error: 'Not initialized' };
        }

        try {
            console.log(`[HYP-EXEC] Closing position: ${coin}`);
            const result = await this.sdk.custom.marketClose(coin);
            console.log(`[HYP-EXEC] Close result:`, JSON.stringify(result).slice(0, 300));

            const statuses = result?.response?.data?.statuses || result?.data?.statuses || [];
            const filled = statuses.find(s => s.filled);

            if (filled) {
                return {
                    success: true,
                    order: {
                        id: 'HYP_CLOSE_' + Date.now(),
                        executionPrice: parseFloat(filled.filled.avgPx),
                        quantity: parseFloat(filled.filled.totalSz),
                        status: 'closed',
                        filledAt: Date.now()
                    },
                    simulated: false,
                    route: 'HYPERLIQUID_CLOSE'
                };
            }

            return { success: false, error: statuses[0]?.error || 'Unknown error' };
        } catch (err) {
            console.log(`[HYP-EXEC] Close error: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * Simulate order when real execution not available
     */
    simulateOrder(order) {
        const { pair, side, quantity, coin: orderCoin, symbol } = order;
        const rawPair = pair || symbol || orderCoin || 'BTC/USDT';
        const coin = rawPair.includes('/') ? rawPair.split('/')[0] : rawPair.replace('-PERP', '').replace('USDT', '');

        // Use a reasonable price estimate
        const estimatedPrices = {
            'BTC': 95000, 'ETH': 3200, 'SOL': 180, 'ARB': 0.8, 'OP': 2.0,
            'AVAX': 35, 'LINK': 20, 'DOGE': 0.35, 'SUI': 4.5, 'INJ': 25
        };
        const price = estimatedPrices[coin] || 1;

        return {
            success: true,
            order: {
                id: 'SIM_' + Date.now(),
                executionPrice: price * (side === 'buy' ? 1.0005 : 0.9995),
                quantity: quantity,
                status: 'simulated',
                filledAt: Date.now()
            },
            simulated: true,
            route: this.rateLimited ? 'SIMULATED_RATE_LIMITED' : 'SIMULATED_NO_CONNECTION',
            fee: quantity * price * 0.001
        };
    }

    getStats() {
        return {
            initialized: this.initialized,
            rateLimited: this.rateLimited,
            ...this.stats
        };
    }
}

module.exports = { HyperliquidExecutor };
