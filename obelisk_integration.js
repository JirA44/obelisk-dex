/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║   OBELISK INTEGRATION FOR MIXBOT                                          ║
 * ║   Multi-DEX Price Aggregation: Hyperliquid + dYdX + Uniswap              ║
 * ║   Real-time Arbitrage Detection                                           ║
 * ║   Secure API Connection with Session Management                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import crypto from 'crypto';

class ObeliskIntegration {
    constructor(config = {}) {
        // API Configuration
        this.apiUrl = config.apiUrl || 'https://obelisk-api-real.hugo-padilla-pro.workers.dev';
        this.updateInterval = config.updateInterval || 500; // ms

        // State
        this.prices = {};
        this.arbitrage = [];
        this.lastUpdate = 0;
        this.connected = false;

        // Session Management
        this.apiKey = null;
        this.apiSecret = null;
        this.sessionId = null;

        // Callbacks
        this.onPriceUpdate = config.onPriceUpdate || (() => {});
        this.onArbitrage = config.onArbitrage || (() => {});
        this.onError = config.onError || console.error;

        // Performance metrics
        this.metrics = {
            apiLatency: 0,
            pps: 0,
            totalCalls: 0
        };

        // Update loop
        this._updateLoop = null;
    }

    // ==========================================
    // CONNECTION
    // ==========================================

    async connect() {
        console.log('🔌 [OBELISK] Connecting to Multi-DEX aggregator...');

        try {
            // Register bot
            const regResponse = await fetch(`${this.apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'MixBot_Hyperliquid',
                    type: 'trading'
                })
            });

            const regData = await regResponse.json();
            if (regData.success) {
                this.apiKey = regData.apiKey;
                this.apiSecret = regData.secret;
                console.log(`✅ [OBELISK] Registered: ${this.apiKey.slice(0, 16)}...`);
            }

            // Create session
            const sessResponse = await fetch(`${this.apiUrl}/api/auth/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify({ ttlMinutes: 60 })
            });

            const sessData = await sessResponse.json();
            if (sessData.success) {
                this.sessionId = sessData.sessionId;
                console.log(`✅ [OBELISK] Session created: ${this.sessionId.slice(0, 20)}...`);
            }

            // Test connection
            await this.fetchPrices();

            this.connected = true;
            console.log('🟢 [OBELISK] Connected to Hyperliquid + dYdX!');
            console.log(`📊 [OBELISK] ${Object.keys(this.prices).length} markets available`);

            // Start update loop
            this.startUpdateLoop();

            return true;
        } catch (error) {
            this.onError(error);
            return false;
        }
    }

    disconnect() {
        if (this._updateLoop) {
            clearInterval(this._updateLoop);
            this._updateLoop = null;
        }
        this.connected = false;
        console.log('🔴 [OBELISK] Disconnected');
    }

    // ==========================================
    // PRICE FETCHING
    // ==========================================

    async fetchPrices() {
        const start = performance.now();

        try {
            const response = await fetch(`${this.apiUrl}/api/markets`);
            const data = await response.json();

            const latency = performance.now() - start;
            this.metrics.apiLatency = latency;
            this.metrics.totalCalls++;

            if (data.markets) {
                const now = Date.now();

                data.markets.forEach(market => {
                    const coin = market.pair.replace('/USDC', '');
                    const oldPrice = this.prices[coin]?.price;

                    this.prices[coin] = {
                        price: market.price,
                        change24h: market.change24h,
                        source: market.source,
                        spread: market.spread || 0,
                        timestamp: now,
                        direction: oldPrice ? (market.price > oldPrice ? 'up' : market.price < oldPrice ? 'down' : 'neutral') : 'neutral'
                    };
                });

                this.lastUpdate = now;
                this.onPriceUpdate(this.prices);
            }

            return this.prices;
        } catch (error) {
            this.onError(error);
            return null;
        }
    }

    async fetchArbitrage() {
        try {
            const response = await fetch(`${this.apiUrl}/api/arbitrage`);
            const data = await response.json();

            if (data.opportunities) {
                this.arbitrage = data.opportunities;

                // Notify if profitable opportunities exist
                const profitable = this.arbitrage.filter(opp => parseFloat(opp.spread) > 0.1);
                if (profitable.length > 0) {
                    this.onArbitrage(profitable);
                }
            }

            return this.arbitrage;
        } catch (error) {
            this.onError(error);
            return [];
        }
    }

    startUpdateLoop() {
        // Price updates
        this._updateLoop = setInterval(async () => {
            await this.fetchPrices();
        }, this.updateInterval);

        // Arbitrage updates (less frequent)
        setInterval(async () => {
            await this.fetchArbitrage();
        }, 5000);
    }

    // ==========================================
    // PRICE ACCESS (for MixBot strategies)
    // ==========================================

    /**
     * Get price for a coin from aggregated DEX data
     * @param {string} coin - Coin symbol (BTC, ETH, etc.)
     * @returns {number|null} - Current price or null
     */
    getPrice(coin) {
        return this.prices[coin]?.price || null;
    }

    /**
     * Get best price across DEXes (for arbitrage)
     * @param {string} coin - Coin symbol
     * @param {string} side - 'buy' or 'sell'
     * @returns {object} - { price, source, spread }
     */
    getBestPrice(coin, side = 'buy') {
        const priceData = this.prices[coin];
        if (!priceData) return null;

        // If we have prices from multiple DEXes, find best
        // For now, return primary source
        return {
            price: priceData.price,
            source: priceData.source,
            spread: priceData.spread
        };
    }

    /**
     * Get all prices (for dashboard/logging)
     * @returns {object} - All prices
     */
    getAllPrices() {
        return this.prices;
    }

    /**
     * Get price with direction indicator
     * @param {string} coin - Coin symbol
     * @returns {object} - { price, direction, change24h }
     */
    getPriceWithTrend(coin) {
        const data = this.prices[coin];
        if (!data) return null;

        return {
            price: data.price,
            direction: data.direction,
            change24h: data.change24h,
            source: data.source
        };
    }

    // ==========================================
    // ARBITRAGE SIGNALS (for MixBot)
    // ==========================================

    /**
     * Get current arbitrage opportunities
     * @param {number} minSpread - Minimum spread % (default 0.1%)
     * @returns {array} - Opportunities sorted by profit potential
     */
    getArbitrageOpportunities(minSpread = 0.1) {
        return this.arbitrage
            .filter(opp => parseFloat(opp.spread) >= minSpread)
            .sort((a, b) => parseFloat(b.spread) - parseFloat(a.spread));
    }

    /**
     * Check if arbitrage exists for a specific coin
     * @param {string} coin - Coin symbol
     * @returns {object|null} - Arbitrage opportunity or null
     */
    getArbitrageForCoin(coin) {
        return this.arbitrage.find(opp => opp.coin === coin) || null;
    }

    /**
     * Get top N arbitrage opportunities
     * @param {number} n - Number of opportunities
     * @returns {array} - Top N opportunities
     */
    getTopArbitrage(n = 5) {
        return this.getArbitrageOpportunities(0.05).slice(0, n);
    }

    // ==========================================
    // TRADING (via Obelisk API)
    // ==========================================

    /**
     * Place order through Obelisk (routes to best DEX)
     * @param {string} pair - Trading pair (BTC/USDC)
     * @param {string} side - 'buy' or 'sell'
     * @param {number} quantity - Amount to trade
     * @returns {object} - Order result
     */
    async placeOrder(pair, side, quantity) {
        const timestamp = Date.now().toString();
        const nonce = crypto.randomBytes(16).toString('hex');
        const message = `${timestamp}:POST:/api/order`;
        const signature = crypto
            .createHmac('sha256', this.apiSecret || '')
            .update(message)
            .digest('hex');

        try {
            const response = await fetch(`${this.apiUrl}/api/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                    'X-Session-Id': this.sessionId,
                    'X-Timestamp': timestamp,
                    'X-Nonce': nonce,
                    'X-Signature': signature
                },
                body: JSON.stringify({ pair, side, quantity })
            });

            const data = await response.json();

            if (data.success) {
                console.log(`✅ [OBELISK] Order filled on ${data.order.executedOn}: ${side} ${quantity} ${pair} @ $${data.order.executionPrice}`);
            }

            return data;
        } catch (error) {
            this.onError(error);
            return { success: false, error: error.message };
        }
    }

    // ==========================================
    // METRICS (for monitoring)
    // ==========================================

    getMetrics() {
        return {
            ...this.metrics,
            connected: this.connected,
            marketsCount: Object.keys(this.prices).length,
            arbitrageCount: this.arbitrage.length,
            lastUpdate: this.lastUpdate,
            updateInterval: this.updateInterval
        };
    }

    // ==========================================
    // HELPER: Integration with existing HyperliquidAPI
    // ==========================================

    /**
     * Override price fetching for existing bot logic
     * Call this to replace your current price source with Obelisk aggregated prices
     *
     * Usage in your bot:
     *   const obelisk = new ObeliskIntegration();
     *   await obelisk.connect();
     *
     *   // Instead of calling Hyperliquid directly, use:
     *   const btcPrice = obelisk.getPrice('BTC');
     */

    /**
     * Create a price feed compatible with existing bot structure
     * @returns {function} - Price getter function
     */
    createPriceFeed() {
        return {
            getPrice: (coin) => this.getPrice(coin),
            getAllPrices: () => this.getAllPrices(),
            getBestPrice: (coin, side) => this.getBestPrice(coin, side),
            getArbitrage: () => this.getTopArbitrage(),
            isConnected: () => this.connected
        };
    }
}

// ==========================================
// QUICK START EXAMPLE
// ==========================================

async function example() {
    const obelisk = new ObeliskIntegration({
        updateInterval: 500,
        onPriceUpdate: (prices) => {
            const btc = prices['BTC'];
            if (btc) {
                console.log(`BTC: $${btc.price.toLocaleString()} (${btc.source}) ${btc.direction === 'up' ? '↑' : btc.direction === 'down' ? '↓' : '→'}`);
            }
        },
        onArbitrage: (opportunities) => {
            console.log(`\n⚡ ARBITRAGE ALERT: ${opportunities.length} opportunities!`);
            opportunities.forEach(opp => {
                console.log(`  ${opp.coin}: ${opp.spread} - ${opp.direction}`);
            });
        }
    });

    await obelisk.connect();

    // Example: Get BTC price
    console.log('\nBTC Price:', obelisk.getPrice('BTC'));

    // Example: Get all arbitrage opportunities
    console.log('\nTop Arbitrage:', obelisk.getTopArbitrage(3));

    // Keep running
    console.log('\n[OBELISK] Running... Press Ctrl+C to stop\n');
}

// Export for use in MixBot
export { ObeliskIntegration };
export default ObeliskIntegration;

// Run example if executed directly
if (process.argv[1] && process.argv[1].includes('obelisk_integration')) {
    example().catch(console.error);
}
