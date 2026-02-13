// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK - DYDX V4 EXECUTOR
// Direct execution on dYdX v4 (Cosmos chain) for perpetuals trading
// ═══════════════════════════════════════════════════════════════════════════════

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// dYdX v4 SDK - lazy loaded to avoid startup errors if not installed
let dydxClient = null;

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// dYdX v4 Market IDs (CLOB pair IDs)
const DYDX_MARKETS = {
    'BTC': { clobPairId: 0, tickSize: 1, stepSize: 0.0001 },
    'ETH': { clobPairId: 1, tickSize: 0.1, stepSize: 0.001 },
    'SOL': { clobPairId: 5, tickSize: 0.01, stepSize: 0.1 },
    'AVAX': { clobPairId: 7, tickSize: 0.01, stepSize: 0.1 },
    'DOGE': { clobPairId: 8, tickSize: 0.0001, stepSize: 1 },
    'LINK': { clobPairId: 3, tickSize: 0.01, stepSize: 0.1 },
    'ATOM': { clobPairId: 11, tickSize: 0.01, stepSize: 0.1 },
    'ARB': { clobPairId: 23, tickSize: 0.0001, stepSize: 1 },
    'OP': { clobPairId: 24, tickSize: 0.001, stepSize: 1 },
    'SUI': { clobPairId: 29, tickSize: 0.0001, stepSize: 1 },
    'APT': { clobPairId: 20, tickSize: 0.01, stepSize: 0.1 },
    'INJ': { clobPairId: 18, tickSize: 0.01, stepSize: 0.1 },
    'TIA': { clobPairId: 30, tickSize: 0.01, stepSize: 0.1 },
    'SEI': { clobPairId: 31, tickSize: 0.0001, stepSize: 1 },
    'NEAR': { clobPairId: 15, tickSize: 0.001, stepSize: 0.1 },
    'FIL': { clobPairId: 13, tickSize: 0.01, stepSize: 0.1 },
    'LTC': { clobPairId: 4, tickSize: 0.1, stepSize: 0.01 },
    'XRP': { clobPairId: 10, tickSize: 0.0001, stepSize: 1 },
    'ADA': { clobPairId: 12, tickSize: 0.0001, stepSize: 1 },
    'MATIC': { clobPairId: 6, tickSize: 0.0001, stepSize: 1 },
    'DOT': { clobPairId: 9, tickSize: 0.01, stepSize: 0.1 },
    'UNI': { clobPairId: 16, tickSize: 0.01, stepSize: 0.1 },
    'BCH': { clobPairId: 17, tickSize: 0.1, stepSize: 0.01 },
    'TRX': { clobPairId: 19, tickSize: 0.0001, stepSize: 1 },
    'PEPE': { clobPairId: 33, tickSize: 0.00000001, stepSize: 1000000 },
    'SHIB': { clobPairId: 32, tickSize: 0.00000001, stepSize: 100000 },
    'WIF': { clobPairId: 37, tickSize: 0.001, stepSize: 1 },
    'BONK': { clobPairId: 36, tickSize: 0.00000001, stepSize: 1000000 },
    'MKR': { clobPairId: 14, tickSize: 1, stepSize: 0.001 },
    'AAVE': { clobPairId: 21, tickSize: 0.1, stepSize: 0.01 },
    'CRV': { clobPairId: 22, tickSize: 0.001, stepSize: 1 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DYDX EXECUTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class DydxExecutor {
    constructor() {
        this.client = null;
        this.wallet = null;
        this.subaccount = null;
        this.initialized = false;
        this.lastError = null;
        this.rateLimited = false;
        this.stats = { orders: 0, filled: 0, failed: 0 };
    }

    async init() {
        try {
            // Check for mnemonic
            const mnemonic = process.env.DYDX_MNEMONIC;

            if (!mnemonic) {
                console.log('[DYDX-EXEC] No DYDX_MNEMONIC, simulation mode only');
                return false;
            }

            // Lazy load dYdX SDK
            try {
                dydxClient = require('@dydxprotocol/v4-client-js');
            } catch (e) {
                console.log('[DYDX-EXEC] SDK not installed. Run: npm install @dydxprotocol/v4-client-js');
                return false;
            }

            const {
                CompositeClient,
                LocalWallet,
                Network,
                BECH32_PREFIX
            } = dydxClient;

            // Create wallet from mnemonic
            this.wallet = await LocalWallet.fromMnemonic(mnemonic, BECH32_PREFIX);
            console.log(`[DYDX-EXEC] Wallet: ${this.wallet.address}`);

            // Connect to mainnet
            const network = Network.mainnet();
            this.client = await CompositeClient.connect(network);

            // Create subaccount (index 0)
            const { SubaccountClient } = dydxClient;
            this.subaccount = new SubaccountClient(this.wallet, 0);

            // Test connection by fetching account
            try {
                const account = await this.client.indexerClient.account.getSubaccount(
                    this.wallet.address,
                    0
                );
                const equity = parseFloat(account?.subaccount?.equity || 0);
                console.log(`[DYDX-EXEC] Account equity: $${equity.toFixed(2)}`);

                if (equity < 1) {
                    console.log('[DYDX-EXEC] Warning: Low account balance');
                }
            } catch (accErr) {
                console.log(`[DYDX-EXEC] Could not fetch account: ${accErr.message}`);
            }

            this.initialized = true;
            console.log('[DYDX-EXEC] dYdX v4 executor ready');
            return true;

        } catch (err) {
            console.error('[DYDX-EXEC] Init error:', err.message);
            this.lastError = err.message;
            return false;
        }
    }

    /**
     * Round quantity according to dYdX step size
     */
    roundQuantity(coin, quantity) {
        const market = DYDX_MARKETS[coin];
        if (!market) {
            console.log(`[DYDX-EXEC] Unknown market ${coin}, using default step`);
            return Math.floor(quantity * 100) / 100;
        }

        const stepSize = market.stepSize;
        const rounded = Math.floor(quantity / stepSize) * stepSize;
        console.log(`[DYDX-EXEC] Rounding ${coin}: ${quantity} → ${rounded} (stepSize=${stepSize})`);
        return rounded;
    }

    /**
     * Round price according to dYdX tick size
     */
    roundPrice(coin, price) {
        const market = DYDX_MARKETS[coin];
        if (!market) return price;

        const tickSize = market.tickSize;
        return Math.round(price / tickSize) * tickSize;
    }

    /**
     * Execute order on dYdX v4
     */
    async execute(order) {
        this.stats.orders++;

        if (!this.initialized || this.rateLimited || !this.client) {
            console.log('[DYDX-EXEC] Not initialized, simulating');
            return this.simulateOrder(order);
        }

        try {
            const { pair, side, quantity, leverage = 1, price: orderPrice } = order;

            // Parse coin
            const coin = pair.split('/')[0].replace('-PERP', '').toUpperCase();

            // Check if market supported
            const market = DYDX_MARKETS[coin];
            if (!market) {
                console.log(`[DYDX-EXEC] Market ${coin} not supported on dYdX`);
                return this.simulateOrder(order);
            }

            const isBuy = side.toLowerCase() === 'buy';

            // Get current price
            let currentPrice = orderPrice;
            if (!currentPrice) {
                try {
                    const binanceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
                    const binanceData = await binanceRes.json();
                    currentPrice = parseFloat(binanceData.price);
                } catch (e) {
                    console.log(`[DYDX-EXEC] Could not fetch price for ${coin}`);
                }
            }

            if (!currentPrice) {
                return this.simulateOrder(order);
            }

            // Round quantity and price
            const roundedQuantity = this.roundQuantity(coin, quantity);
            const roundedPrice = this.roundPrice(coin, currentPrice * (isBuy ? 1.005 : 0.995)); // 0.5% slippage

            if (roundedQuantity <= 0) {
                console.log(`[DYDX-EXEC] Quantity too small: ${quantity} → ${roundedQuantity}`);
                return this.simulateOrder(order);
            }

            // Place order
            const { OrderSide, OrderType, OrderTimeInForce } = dydxClient;

            console.log(`[DYDX-EXEC] Placing: ${isBuy ? 'BUY' : 'SELL'} ${roundedQuantity} ${coin} @ $${roundedPrice.toFixed(4)}`);

            const marketId = `${coin}-USD`;

            try {
                const result = await this.client.placeShortTermOrder(
                    this.subaccount,
                    marketId,
                    isBuy ? OrderSide.BUY : OrderSide.SELL,
                    roundedPrice,
                    roundedQuantity,
                    Math.floor(Math.random() * 1000000), // clientId
                    await this.client.validatorClient.get.latestBlockHeight() + 10, // goodTilBlock
                    OrderTimeInForce.IOC, // Immediate or Cancel for market-like behavior
                    false // reduceOnly
                );

                console.log(`[DYDX-EXEC] Order result:`, JSON.stringify(result).slice(0, 200));

                // Check if filled
                if (result && result.hash) {
                    this.stats.filled++;

                    return {
                        success: true,
                        order: {
                            id: 'DYDX_' + Date.now(),
                            txHash: result.hash,
                            executionPrice: roundedPrice,
                            quantity: roundedQuantity,
                            status: 'submitted',
                            filledAt: Date.now()
                        },
                        simulated: false,
                        route: 'DYDX_V4_MAINNET',
                        fee: roundedQuantity * roundedPrice * 0.0002 // ~0.02% maker fee
                    };
                }

                // Fallback to simulation
                return this.simulateOrder(order);

            } catch (orderErr) {
                console.log(`[DYDX-EXEC] Order error: ${orderErr.message}`);

                // Check for rate limit
                if (orderErr.message?.includes('429') || orderErr.message?.includes('rate')) {
                    this.rateLimited = true;
                    console.log('[DYDX-EXEC] Rate limited');
                }

                this.stats.failed++;
                return this.simulateOrder(order);
            }

        } catch (err) {
            this.stats.failed++;
            console.error('[DYDX-EXEC] Execution error:', err.message);
            this.lastError = err.message;
            return this.simulateOrder(order);
        }
    }

    /**
     * Simulate order when real execution not available
     */
    simulateOrder(order) {
        const { pair, side, quantity } = order;
        const coin = pair.split('/')[0].replace('-PERP', '');

        const estimatedPrices = {
            'BTC': 95000, 'ETH': 3200, 'SOL': 180, 'ARB': 0.8, 'OP': 2.0,
            'AVAX': 35, 'LINK': 20, 'DOGE': 0.35, 'SUI': 4.5, 'INJ': 25,
            'CRV': 0.42, 'TIA': 5.5, 'SEI': 0.45, 'NEAR': 5.0, 'APT': 9.0
        };
        const price = estimatedPrices[coin] || 1;

        return {
            success: true,
            order: {
                id: 'DYDX_SIM_' + Date.now(),
                executionPrice: price * (side === 'buy' ? 1.0005 : 0.9995),
                quantity: quantity,
                status: 'simulated',
                filledAt: Date.now()
            },
            simulated: true,
            route: this.rateLimited ? 'DYDX_SIMULATED_RATE_LIMITED' : 'DYDX_SIMULATED',
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

module.exports = { DydxExecutor, DYDX_MARKETS };
