/**
 * Obelisk DEX - Price Service v3.0 (Offline Mode)
 * Uses static prices to avoid API rate limits and errors
 * Updated: 2026-01-09
 */

const PriceService = {
    // Supported pairs
    PAIRS: ['BTC', 'ETH', 'SOL', 'ARB', 'XRP', 'ADA', 'AVAX', 'LINK', 'UNI', 'OP', 'INJ', 'SUI'],

    // Static prices (updated manually or via simulation)
    staticPrices: {
        BTC: { price: 97234, change24h: 2.4 },
        ETH: { price: 3521, change24h: 1.8 },
        SOL: { price: 198, change24h: -0.5 },
        ARB: { price: 1.24, change24h: 3.2 },
        XRP: { price: 2.35, change24h: 1.1 },
        ADA: { price: 0.98, change24h: -0.3 },
        AVAX: { price: 42.18, change24h: 2.1 },
        LINK: { price: 24.67, change24h: 1.1 },
        UNI: { price: 14.32, change24h: -0.8 },
        OP: { price: 2.87, change24h: 4.5 },
        INJ: { price: 38.90, change24h: 2.9 },
        SUI: { price: 4.12, change24h: 5.2 }
    },

    // Price cache
    priceCache: {},
    lastUpdate: 0,
    updateInterval: 60000,

    // Subscribers for price updates
    subscribers: [],

    // Connection status
    connected: true, // Always "connected" in offline mode

    /**
     * Initialize price service
     */
    async init() {
        console.log('[PriceService] Initializing (Offline Mode)...');

        // Load static prices into cache
        this.loadStaticPrices();

        // Start price simulation (small random changes)
        this.startPriceSimulation();

        console.log('[PriceService] Ready with', Object.keys(this.priceCache).length, 'pairs');
    },

    /**
     * Load static prices into cache
     */
    loadStaticPrices() {
        for (const [symbol, data] of Object.entries(this.staticPrices)) {
            this.priceCache[symbol] = {
                price: data.price,
                change24h: data.change24h,
                volume24h: Math.random() * 1000000000,
                marketCap: data.price * (Math.random() * 100000000),
                lastUpdate: Date.now()
            };
        }
        this.lastUpdate = Date.now();
        this.notifySubscribers();
    },

    /**
     * Simulate small price changes
     */
    startPriceSimulation() {
        setInterval(() => {
            for (const symbol of Object.keys(this.priceCache)) {
                const change = (Math.random() - 0.5) * 0.002; // ±0.1% max
                this.priceCache[symbol].price *= (1 + change);
                this.priceCache[symbol].lastUpdate = Date.now();
            }
            this.notifySubscribers();
        }, 5000); // Every 5 seconds
    },

    /**
     * Fetch all prices (returns cached static prices)
     */
    async fetchAllPrices() {
        return this.priceCache;
    },

    /**
     * Get coin details (from cache)
     */
    async fetchCoinDetails(symbol) {
        const cached = this.priceCache[symbol];
        if (cached) {
            return {
                symbol: symbol,
                name: symbol,
                price: cached.price,
                change24h: cached.change24h,
                high24h: cached.price * 1.05,
                low24h: cached.price * 0.95,
                volume24h: cached.volume24h,
                marketCap: cached.marketCap,
                lastUpdate: cached.lastUpdate
            };
        }
        return null;
    },

    /**
     * Generate simulated orderbook
     */
    async fetchOrderbook(symbol) {
        const price = this.priceCache[symbol]?.price || 100;
        const bids = [];
        const asks = [];

        // Generate 10 bid/ask levels
        for (let i = 0; i < 10; i++) {
            const bidPrice = price * (1 - 0.001 * (i + 1));
            const askPrice = price * (1 + 0.001 * (i + 1));
            bids.push([bidPrice.toFixed(2), (Math.random() * 10).toFixed(4)]);
            asks.push([askPrice.toFixed(2), (Math.random() * 10).toFixed(4)]);
        }

        return {
            bids: bids,
            asks: asks,
            spread: ((asks[0][0] - bids[0][0]) / price * 100).toFixed(4),
            timestamp: Date.now()
        };
    },

    /**
     * Start periodic updates (not needed in offline mode, but kept for compatibility)
     */
    startPeriodicUpdates() {
        // Price simulation already runs via startPriceSimulation()
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
     * Get all available markets (from cache)
     */
    async getMarkets() {
        return this.PAIRS.map(symbol => ({
            pair: `${symbol}/USDC`,
            price: this.priceCache[symbol]?.price || 0,
            change24h: this.priceCache[symbol]?.change24h || 0,
            volume24h: this.priceCache[symbol]?.volume24h || 0
        }));
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
     * Get API info (offline mode - returns static info)
     */
    async getApiInfo() {
        return {
            status: 'offline_mode',
            version: '3.0',
            pairs: this.PAIRS.length,
            message: 'Running in offline simulation mode'
        };
    }
};

// Export
window.PriceService = PriceService;
