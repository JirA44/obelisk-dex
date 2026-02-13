/**
 * Obelisk DEX - Trading API v2.1
 *
 * Connects to Hyperliquid API for market data and trading.
 * API: https://api.hyperliquid.xyz
 * Updated: 2025-01-08
 */

const HyperliquidAPI = {
    // Hyperliquid public API
    OBELISK_API: 'https://api.hyperliquid.xyz',

    // Cache
    marketsCache: null,
    marketsCacheTime: 0,
    CACHE_TTL: 30000, // 30 seconds

    // Connection status
    connected: false,

    /**
     * Initialize connection to Obelisk API
     */
    async init() {
        console.log('Connecting to Obelisk API...');
        await this.loadMarkets();
        this.connected = true;
        console.log('Obelisk API connected!');
        window.dispatchEvent(new Event('hyperliquid-connected'));
    },

    /**
     * Make API request to Obelisk
     */
    async request(endpoint) {
        const url = `${this.OBELISK_API}${endpoint}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (e) {
            console.error('Obelisk API error:', e);
            throw e;
        }
    },

    /**
     * Get all available markets from Obelisk API
     */
    async loadMarkets() {
        if (this.marketsCache && Date.now() - this.marketsCacheTime < this.CACHE_TTL) {
            return this.marketsCache;
        }

        try {
            const response = await this.request('/api/markets');

            this.marketsCache = (response.markets || []).map(market => ({
                name: market.pair.replace('/USDC', ''),
                pair: market.pair,
                price: market.price,
                change24h: market.change24h,
                volume: market.volume,
                maxLeverage: 50
            }));
            this.marketsCacheTime = Date.now();

            return this.marketsCache;
        } catch (e) {
            console.error('Failed to load markets:', e);
            return [];
        }
    },

    /**
     * Get market info
     */
    async getMarketInfo(symbol) {
        const markets = await this.loadMarkets();
        return markets.find(m => m.name === symbol);
    },

    /**
     * Get current prices for all markets from Obelisk API
     */
    async getAllPrices() {
        try {
            const response = await this.request('/api/tickers');
            const prices = {};

            for (const [pair, data] of Object.entries(response.tickers || {})) {
                const symbol = pair.replace('/USDC', '');
                prices[symbol] = data.price;
            }

            return prices;
        } catch (e) {
            console.error('Failed to get prices:', e);
            return {};
        }
    },

    /**
     * Get orderbook for a market from Obelisk API
     */
    async getOrderbook(symbol) {
        try {
            // Encode the pair properly (BTC/USDC -> BTC%2FUSDC)
            const pair = encodeURIComponent(`${symbol}/USDC`);
            const response = await this.request(`/api/orderbook/${pair}`);

            const result = {
                bids: (response.bids || []).map(level => ({
                    price: level.price,
                    size: level.quantity,
                    total: level.total
                })),
                asks: (response.asks || []).map(level => ({
                    price: level.price,
                    size: level.quantity,
                    total: level.total
                })),
                spread: response.spread
            };

            // If empty, use mock data
            if (result.bids.length === 0 && result.asks.length === 0) {
                return this.generateMockOrderbook(symbol);
            }
            return result;
        } catch (e) {
            console.error('Failed to get orderbook, using mock data:', e);
            return this.generateMockOrderbook(symbol);
        }
    },

    /**
     * Generate realistic mock orderbook data
     */
    generateMockOrderbook(symbol) {
        const basePrices = {
            'BTC': 97250, 'ETH': 3420, 'SOL': 198, 'ARB': 1.85,
            'LINK': 24.5, 'UNI': 14.2, 'AVAX': 42, 'OP': 3.15,
            'DOGE': 0.42, 'XRP': 2.35, 'ADA': 1.05, 'DOT': 8.5
        };
        const basePrice = basePrices[symbol] || 100;
        const spread = basePrice * 0.0001; // 0.01% spread

        const bids = [];
        const asks = [];
        let bidTotal = 0;
        let askTotal = 0;

        for (let i = 0; i < 15; i++) {
            const bidPrice = basePrice - spread/2 - (i * basePrice * 0.0002);
            const askPrice = basePrice + spread/2 + (i * basePrice * 0.0002);
            const bidSize = (Math.random() * 5 + 0.5).toFixed(4);
            const askSize = (Math.random() * 5 + 0.5).toFixed(4);
            bidTotal += bidPrice * parseFloat(bidSize);
            askTotal += askPrice * parseFloat(askSize);

            bids.push({ price: bidPrice, size: parseFloat(bidSize), total: bidTotal });
            asks.push({ price: askPrice, size: parseFloat(askSize), total: askTotal });
        }

        return { bids, asks, spread };
    },

    /**
     * Get user's open positions
     */
    async getPositions(address) {
        try {
            const response = await this.request('/info', {
                type: 'clearinghouseState',
                user: address
            });

            return response.assetPositions.map(pos => ({
                symbol: pos.position.coin,
                size: parseFloat(pos.position.szi),
                entryPrice: parseFloat(pos.position.entryPx),
                unrealizedPnl: parseFloat(pos.position.unrealizedPnl),
                leverage: parseFloat(pos.position.leverage?.value || 1),
                liquidationPrice: parseFloat(pos.position.liquidationPx || 0),
                margin: parseFloat(pos.position.marginUsed || 0)
            })).filter(pos => pos.size !== 0);
        } catch (e) {
            console.error('Failed to get positions:', e);
            return [];
        }
    },

    /**
     * Get user's open orders
     */
    async getOpenOrders(address) {
        try {
            const response = await this.request('/info', {
                type: 'openOrders',
                user: address
            });

            return response.map(order => ({
                id: order.oid,
                symbol: order.coin,
                side: order.side,
                size: parseFloat(order.sz),
                price: parseFloat(order.limitPx),
                reduceOnly: order.reduceOnly,
                orderType: order.orderType,
                timestamp: order.timestamp
            }));
        } catch (e) {
            console.error('Failed to get open orders:', e);
            return [];
        }
    },

    /**
     * Get user's account value and margin info
     * Tries real Hyperliquid API first, falls back to local storage
     */
    async getAccountInfo(address) {
        // Try to get real balance from Hyperliquid API
        if (address && address !== '0xDEMO') {
            try {
                const response = await fetch('https://api.hyperliquid.xyz/info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'clearinghouseState',
                        user: address
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.marginSummary) {
                        const accountValue = parseFloat(data.marginSummary.accountValue) || 0;
                        return {
                            accountValue: accountValue,
                            totalMarginUsed: parseFloat(data.marginSummary.totalMarginUsed) || 0,
                            totalPositionValue: parseFloat(data.marginSummary.totalNtlPos) || 0,
                            availableBalance: parseFloat(data.marginSummary.accountValue) || 0,
                            isReal: true
                        };
                    }
                }
            } catch (e) {
                console.warn('Could not fetch real Hyperliquid balance:', e.message);
            }
        }

        // Fallback to local storage (demo mode) - default 0 instead of fake 10000
        const stored = localStorage.getItem('obelisk_demo_balance');
        const balance = stored ? parseFloat(stored) : 0;

        return {
            accountValue: balance,
            totalMarginUsed: 0,
            totalPositionValue: 0,
            availableBalance: balance,
            isReal: false
        };
    },

    /**
     * Get trade history
     * Note: Returns local trade history since API doesn't have this endpoint
     */
    async getTradeHistory(address, limit = 100) {
        // Return trades from local storage (demo mode)
        const stored = localStorage.getItem('obelisk_trade_history');
        const trades = stored ? JSON.parse(stored) : [];
        return trades.slice(0, limit);
    },

    /**
     * Place a market order via Obelisk API
     */
    async placeMarketOrder(address, symbol, side, size, leverage, privateKey) {
        try {
            const response = await fetch(`${this.OBELISK_API}/api/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pair: `${symbol}/USDC`,
                    side: side,
                    type: 'market',
                    quantity: size,
                    userId: address
                })
            });

            const data = await response.json();
            return {
                success: data.success,
                orderId: data.order?.id,
                order: data.order
            };
        } catch (e) {
            console.error('Failed to place market order:', e);
            return { success: false, error: e.message };
        }
    },

    /**
     * Place a limit order via Obelisk API
     */
    async placeLimitOrder(address, symbol, side, size, price, leverage, privateKey) {
        try {
            const response = await fetch(`${this.OBELISK_API}/api/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pair: `${symbol}/USDC`,
                    side: side,
                    type: 'limit',
                    quantity: size,
                    price: price,
                    userId: address
                })
            });

            const data = await response.json();
            return {
                success: data.success,
                orderId: data.order?.id,
                order: data.order
            };
        } catch (e) {
            console.error('Failed to place limit order:', e);
            return { success: false, error: e.message };
        }
    },

    // ============ UTILITIES ============

    /**
     * Calculate liquidation price
     */
    calculateLiquidationPrice(entryPrice, side, leverage, maintenanceMargin = 0.03) {
        const direction = side === 'long' ? 1 : -1;
        const liqDistance = (1 - maintenanceMargin) / leverage;
        return entryPrice * (1 - direction * liqDistance);
    },

    /**
     * Calculate position PnL
     */
    calculatePnL(entryPrice, currentPrice, size, side) {
        const direction = side === 'long' ? 1 : -1;
        return direction * size * (currentPrice - entryPrice);
    },

    /**
     * Calculate position ROI percentage
     */
    calculateROI(entryPrice, currentPrice, side, leverage) {
        const direction = side === 'long' ? 1 : -1;
        const priceChange = (currentPrice - entryPrice) / entryPrice;
        return direction * priceChange * leverage * 100;
    },

    /**
     * Format price with appropriate decimals
     */
    formatPrice(price, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(price);
    },

    /**
     * Format size with appropriate decimals
     */
    formatSize(size, decimals = 4) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        }).format(size);
    }
};

// Export
window.HyperliquidAPI = HyperliquidAPI;
