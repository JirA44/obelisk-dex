/**
 * Obelisk DEX - Real-Time Price Service v2.1
 *
 * Uses Obelisk API for real-time cryptocurrency prices.
 * Connected to: https://obelisk-api.hugo-padilla-pro.workers.dev
 * Updated: 2024-12-13
 */

const PriceService = {
    // Obelisk API
    OBELISK_API: 'https://obelisk-api.hugo-padilla-pro.workers.dev',

    // Supported pairs (from Obelisk API)
    PAIRS: ['BTC', 'ETH', 'SOL', 'ARB', 'XRP', 'ADA', 'AVAX', 'LINK', 'UNI', 'OP', 'INJ', 'SUI'],

    // Price cache
    priceCache: {},
    lastUpdate: 0,
    updateInterval: 2000, // 2 seconds (faster updates)

    // Subscribers for price updates
    subscribers: [],

    // Connection status
    connected: false,

    /**
     * Initialize price service
     */
    async init() {
        console.log('Initializing Obelisk Price Service...');

        // Initial price fetch
        await this.fetchAllPrices();

        // Start periodic updates (fast)
        this.startPeriodicUpdates();

        console.log('Obelisk Price Service ready!');
    },

    /**
     * Fetch all prices from Obelisk API
     */
    async fetchAllPrices() {
        try {
            const response = await fetch(`${this.OBELISK_API}/api/tickers`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.connected = true;

            // Map tickers to price cache
            for (const [pair, ticker] of Object.entries(data.tickers || {})) {
                const symbol = pair.replace('/USDC', '');
                this.priceCache[symbol] = {
                    price: ticker.price,
                    change24h: ticker.change24h || 0,
                    volume24h: ticker.volume || 0,
                    marketCap: 0,
                    lastUpdate: Date.now()
                };
            }

            this.lastUpdate = Date.now();
            this.notifySubscribers();

            return this.priceCache;
        } catch (e) {
            console.error('Failed to fetch prices from Obelisk API:', e);
            this.connected = false;
            return this.priceCache;
        }
    },

    /**
     * Fetch detailed market data for a specific coin from Obelisk API
     */
    async fetchCoinDetails(symbol) {
        try {
            const response = await fetch(`${this.OBELISK_API}/api/ticker/${symbol}/USDC`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            return {
                symbol: symbol,
                name: symbol,
                price: data.price,
                change24h: data.change24h,
                high24h: data.high,
                low24h: data.low,
                volume24h: data.volume,
                marketCap: 0,
                lastUpdate: data.timestamp
            };
        } catch (e) {
            console.error(`Failed to fetch details for ${symbol}:`, e);
            return this.priceCache[symbol] || null;
        }
    },

    /**
     * Fetch orderbook from Obelisk API
     */
    async fetchOrderbook(symbol) {
        try {
            const response = await fetch(`${this.OBELISK_API}/api/orderbook/${symbol}/USDC`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return {
                bids: data.bids || [],
                asks: data.asks || [],
                spread: data.spread,
                timestamp: data.timestamp
            };
        } catch (e) {
            console.error(`Failed to fetch orderbook for ${symbol}:`, e);
            return { bids: [], asks: [], spread: 0 };
        }
    },

    /**
     * Start periodic price updates (fast - every 2 seconds)
     */
    startPeriodicUpdates() {
        setInterval(() => {
            this.fetchAllPrices();
        }, this.updateInterval);
    },

    /**
     * Subscribe to price updates
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    },

    /**
     * Notify subscribers of price changes
     */
    notifySubscribers(symbol = null) {
        this.subscribers.forEach(callback => {
            try {
                callback(this.priceCache, symbol);
            } catch (e) {
                console.error('Subscriber error:', e);
            }
        });
    },

    /**
     * Get current price for a symbol
     */
    getPrice(symbol) {
        return this.priceCache[symbol]?.price || null;
    },

    /**
     * Get all cached prices
     */
    getAllPrices() {
        return this.priceCache;
    },

    /**
     * Get price with 24h change
     */
    getPriceWithChange(symbol) {
        const data = this.priceCache[symbol];
        if (!data) return null;

        return {
            price: data.price,
            change: data.change24h,
            isPositive: data.change24h >= 0
        };
    },

    /**
     * Format price for display
     */
    formatPrice(price, decimals = 2) {
        if (price === null || price === undefined) return '$0.00';

        if (price >= 1000) {
            return '$' + price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else if (price >= 1) {
            return '$' + price.toFixed(decimals);
        } else if (price >= 0.01) {
            return '$' + price.toFixed(4);
        } else {
            return '$' + price.toFixed(8);
        }
    },

    /**
     * Format percentage change
     */
    formatChange(change) {
        if (change === null || change === undefined) return '0.00%';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    },

    /**
     * Format volume
     */
    formatVolume(volume) {
        if (volume >= 1e9) {
            return '$' + (volume / 1e9).toFixed(2) + 'B';
        } else if (volume >= 1e6) {
            return '$' + (volume / 1e6).toFixed(2) + 'M';
        } else if (volume >= 1e3) {
            return '$' + (volume / 1e3).toFixed(2) + 'K';
        }
        return '$' + volume.toFixed(2);
    },

    /**
     * Get all available markets from Obelisk API
     */
    async getMarkets() {
        try {
            const response = await fetch(`${this.OBELISK_API}/api/markets`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return data.markets || [];
        } catch (e) {
            console.error('Failed to fetch markets:', e);
            return [];
        }
    },

    /**
     * Get top movers (highest change)
     */
    getTopMovers() {
        const prices = Object.entries(this.priceCache)
            .map(([symbol, data]) => ({ symbol, ...data }))
            .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
        return prices.slice(0, 5);
    },

    /**
     * Search for coins in available pairs
     */
    searchCoins(query) {
        const q = query.toUpperCase();
        return this.PAIRS
            .filter(symbol => symbol.includes(q))
            .map(symbol => ({
                symbol,
                name: symbol,
                price: this.priceCache[symbol]?.price || 0
            }));
    },

    /**
     * Check API connection status
     */
    isConnected() {
        return this.connected;
    },

    /**
     * Get API info
     */
    async getApiInfo() {
        try {
            const response = await fetch(`${this.OBELISK_API}/`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (e) {
            return { error: e.message };
        }
    }
};

// Export
window.PriceService = PriceService;
