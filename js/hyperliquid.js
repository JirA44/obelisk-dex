/**
 * Obelisk DEX - Hyperliquid Integration
 *
 * Connects to Hyperliquid DEX for perpetual futures trading.
 * All API calls go directly from client to Hyperliquid (no proxy).
 */

const HyperliquidAPI = {
    // API endpoints
    MAINNET_API: 'https://api.hyperliquid.xyz',
    MAINNET_WS: 'wss://api.hyperliquid.xyz/ws',

    // WebSocket connection
    ws: null,
    wsCallbacks: {},
    wsReconnectAttempts: 0,
    maxReconnectAttempts: 5,

    // Cache
    marketsCache: null,
    marketsCacheTime: 0,
    CACHE_TTL: 60000, // 1 minute

    /**
     * Initialize Hyperliquid connection
     */
    async init() {
        await this.loadMarkets();
        this.connectWebSocket();
    },

    /**
     * Make API request to Hyperliquid
     */
    async request(endpoint, data = null) {
        const url = `${this.MAINNET_API}${endpoint}`;
        const options = {
            method: data ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (e) {
            console.error('Hyperliquid API error:', e);
            throw e;
        }
    },

    /**
     * Get all available markets
     */
    async loadMarkets() {
        if (this.marketsCache && Date.now() - this.marketsCacheTime < this.CACHE_TTL) {
            return this.marketsCache;
        }

        try {
            const response = await this.request('/info', {
                type: 'meta'
            });

            this.marketsCache = response.universe.map(market => ({
                name: market.name,
                szDecimals: market.szDecimals,
                maxLeverage: market.maxLeverage || 50
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
     * Get current prices for all markets
     */
    async getAllPrices() {
        try {
            const response = await this.request('/info', {
                type: 'allMids'
            });
            return response;
        } catch (e) {
            console.error('Failed to get prices:', e);
            return {};
        }
    },

    /**
     * Get orderbook for a market
     */
    async getOrderbook(symbol) {
        try {
            const response = await this.request('/info', {
                type: 'l2Book',
                coin: symbol
            });

            return {
                bids: response.levels[0].map(level => ({
                    price: parseFloat(level.px),
                    size: parseFloat(level.sz),
                    total: parseFloat(level.px) * parseFloat(level.sz)
                })),
                asks: response.levels[1].map(level => ({
                    price: parseFloat(level.px),
                    size: parseFloat(level.sz),
                    total: parseFloat(level.px) * parseFloat(level.sz)
                }))
            };
        } catch (e) {
            console.error('Failed to get orderbook:', e);
            return { bids: [], asks: [] };
        }
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
     */
    async getAccountInfo(address) {
        try {
            const response = await this.request('/info', {
                type: 'clearinghouseState',
                user: address
            });

            return {
                accountValue: parseFloat(response.marginSummary?.accountValue || 0),
                totalMarginUsed: parseFloat(response.marginSummary?.totalMarginUsed || 0),
                totalPositionValue: parseFloat(response.marginSummary?.totalPositionValue || 0),
                availableBalance: parseFloat(response.marginSummary?.accountValue || 0) -
                    parseFloat(response.marginSummary?.totalMarginUsed || 0)
            };
        } catch (e) {
            console.error('Failed to get account info:', e);
            return {
                accountValue: 0,
                totalMarginUsed: 0,
                totalPositionValue: 0,
                availableBalance: 0
            };
        }
    },

    /**
     * Get trade history
     */
    async getTradeHistory(address, limit = 100) {
        try {
            const response = await this.request('/info', {
                type: 'userFills',
                user: address
            });

            return response.slice(0, limit).map(fill => ({
                symbol: fill.coin,
                side: fill.side,
                size: parseFloat(fill.sz),
                price: parseFloat(fill.px),
                fee: parseFloat(fill.fee),
                timestamp: fill.time,
                hash: fill.hash
            }));
        } catch (e) {
            console.error('Failed to get trade history:', e);
            return [];
        }
    },

    /**
     * Place a market order
     */
    async placeMarketOrder(address, symbol, side, size, leverage, privateKey) {
        const order = {
            a: this.getAssetIndex(symbol),
            b: side === 'buy',
            p: '0', // Market order
            s: size.toString(),
            r: false, // Not reduce only
            t: {
                limit: {
                    tif: 'Ioc' // Immediate or cancel for market orders
                }
            }
        };

        return await this.signAndSendOrder(address, order, privateKey);
    },

    /**
     * Place a limit order
     */
    async placeLimitOrder(address, symbol, side, size, price, leverage, privateKey) {
        const order = {
            a: this.getAssetIndex(symbol),
            b: side === 'buy',
            p: price.toString(),
            s: size.toString(),
            r: false,
            t: {
                limit: {
                    tif: 'Gtc' // Good til cancelled
                }
            }
        };

        return await this.signAndSendOrder(address, order, privateKey);
    },

    /**
     * Cancel an order
     */
    async cancelOrder(address, symbol, orderId, privateKey) {
        const cancel = {
            a: this.getAssetIndex(symbol),
            o: orderId
        };

        // Sign and send cancel request
        // Implementation depends on Hyperliquid signing requirements
        return await this.signAndSendCancel(address, cancel, privateKey);
    },

    /**
     * Get asset index from symbol
     */
    getAssetIndex(symbol) {
        const markets = this.marketsCache || [];
        const index = markets.findIndex(m => m.name === symbol);
        return index >= 0 ? index : 0;
    },

    /**
     * Sign and send order (simplified - full implementation needs EIP-712 signing)
     */
    async signAndSendOrder(address, order, privateKey) {
        // In production, implement proper Hyperliquid signing:
        // 1. Create typed data structure (EIP-712)
        // 2. Sign with private key
        // 3. Send to /exchange endpoint

        console.log('Order to sign:', order);

        // For now, return mock response
        // Full implementation requires ethers.js or similar for EIP-712 signing
        return {
            success: true,
            orderId: 'mock_' + Date.now()
        };
    },

    /**
     * Sign and send cancel
     */
    async signAndSendCancel(address, cancel, privateKey) {
        console.log('Cancel to sign:', cancel);
        return { success: true };
    },

    // ============ WEBSOCKET ============

    /**
     * Connect to WebSocket for real-time data
     */
    connectWebSocket() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        this.ws = new WebSocket(this.MAINNET_WS);

        this.ws.onopen = () => {
            console.log('Hyperliquid WebSocket connected');
            this.wsReconnectAttempts = 0;
            window.dispatchEvent(new Event('hyperliquid-connected'));
        };

        this.ws.onclose = () => {
            console.log('Hyperliquid WebSocket disconnected');
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('Hyperliquid WebSocket error:', error);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        };
    },

    /**
     * Attempt to reconnect WebSocket
     */
    attemptReconnect() {
        if (this.wsReconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max WebSocket reconnect attempts reached');
            return;
        }

        this.wsReconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.wsReconnectAttempts), 30000);

        setTimeout(() => {
            console.log(`Attempting WebSocket reconnect (${this.wsReconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connectWebSocket();
        }, delay);
    },

    /**
     * Handle incoming WebSocket message
     */
    handleWebSocketMessage(data) {
        const channel = data.channel;
        if (this.wsCallbacks[channel]) {
            this.wsCallbacks[channel].forEach(callback => callback(data.data));
        }
    },

    /**
     * Subscribe to orderbook updates
     */
    subscribeOrderbook(symbol, callback) {
        const channel = `l2Book:${symbol}`;
        if (!this.wsCallbacks[channel]) {
            this.wsCallbacks[channel] = [];
        }
        this.wsCallbacks[channel].push(callback);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                method: 'subscribe',
                subscription: { type: 'l2Book', coin: symbol }
            }));
        }
    },

    /**
     * Subscribe to trades
     */
    subscribeTrades(symbol, callback) {
        const channel = `trades:${symbol}`;
        if (!this.wsCallbacks[channel]) {
            this.wsCallbacks[channel] = [];
        }
        this.wsCallbacks[channel].push(callback);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                method: 'subscribe',
                subscription: { type: 'trades', coin: symbol }
            }));
        }
    },

    /**
     * Subscribe to user updates (positions, orders)
     */
    subscribeUser(address, callback) {
        const channel = `user:${address}`;
        if (!this.wsCallbacks[channel]) {
            this.wsCallbacks[channel] = [];
        }
        this.wsCallbacks[channel].push(callback);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                method: 'subscribe',
                subscription: { type: 'userEvents', user: address }
            }));
        }
    },

    /**
     * Unsubscribe from a channel
     */
    unsubscribe(channel) {
        delete this.wsCallbacks[channel];
    },

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.wsCallbacks = {};
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
