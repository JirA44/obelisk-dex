/**
 * Obelisk DEX - Real-Time Price Service
 *
 * Uses CoinGecko API for real-time cryptocurrency prices.
 * No API key required for basic usage (rate limited).
 */

const PriceService = {
    // CoinGecko API
    COINGECKO_API: 'https://api.coingecko.com/api/v3',

    // Coin ID mapping
    COIN_IDS: {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        SOL: 'solana',
        ARB: 'arbitrum',
        MATIC: 'matic-network',
        AVAX: 'avalanche-2',
        LINK: 'chainlink',
        UNI: 'uniswap',
        AAVE: 'aave',
        OP: 'optimism',
        DOGE: 'dogecoin',
        XRP: 'ripple',
        ADA: 'cardano',
        DOT: 'polkadot',
        ATOM: 'cosmos',
        NEAR: 'near',
        APT: 'aptos',
        SUI: 'sui',
        INJ: 'injective-protocol',
        TIA: 'celestia',
        SEI: 'sei-network',
        WIF: 'dogwifcoin',
        PEPE: 'pepe',
        BONK: 'bonk',
        SHIB: 'shiba-inu'
    },

    // Price cache
    priceCache: {},
    lastUpdate: 0,
    updateInterval: 10000, // 10 seconds

    // Subscribers for price updates
    subscribers: [],

    // WebSocket for Binance real-time (faster updates)
    binanceWs: null,

    /**
     * Initialize price service
     */
    async init() {
        console.log('Initializing Price Service...');

        // Initial price fetch
        await this.fetchAllPrices();

        // Start periodic updates
        this.startPeriodicUpdates();

        // Connect to Binance WebSocket for real-time
        this.connectBinanceWebSocket();

        console.log('Price Service ready!');
    },

    /**
     * Fetch all prices from CoinGecko
     */
    async fetchAllPrices() {
        const coinIds = Object.values(this.COIN_IDS).join(',');

        try {
            const response = await fetch(
                `${this.COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Map back to symbols
            for (const [symbol, coinId] of Object.entries(this.COIN_IDS)) {
                if (data[coinId]) {
                    this.priceCache[symbol] = {
                        price: data[coinId].usd,
                        change24h: data[coinId].usd_24h_change || 0,
                        volume24h: data[coinId].usd_24h_vol || 0,
                        marketCap: data[coinId].usd_market_cap || 0,
                        lastUpdate: Date.now()
                    };
                }
            }

            this.lastUpdate = Date.now();
            this.notifySubscribers();

            return this.priceCache;
        } catch (e) {
            console.error('Failed to fetch prices from CoinGecko:', e);
            return this.priceCache;
        }
    },

    /**
     * Fetch detailed market data for a specific coin
     */
    async fetchCoinDetails(symbol) {
        const coinId = this.COIN_IDS[symbol];
        if (!coinId) return null;

        try {
            const response = await fetch(
                `${this.COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            return {
                symbol: symbol,
                name: data.name,
                price: data.market_data.current_price.usd,
                change24h: data.market_data.price_change_percentage_24h,
                change7d: data.market_data.price_change_percentage_7d,
                change30d: data.market_data.price_change_percentage_30d,
                high24h: data.market_data.high_24h.usd,
                low24h: data.market_data.low_24h.usd,
                volume24h: data.market_data.total_volume.usd,
                marketCap: data.market_data.market_cap.usd,
                rank: data.market_cap_rank,
                ath: data.market_data.ath.usd,
                athDate: data.market_data.ath_date.usd,
                athChange: data.market_data.ath_change_percentage.usd,
                circulatingSupply: data.market_data.circulating_supply,
                totalSupply: data.market_data.total_supply,
                image: data.image.small
            };
        } catch (e) {
            console.error(`Failed to fetch details for ${symbol}:`, e);
            return null;
        }
    },

    /**
     * Fetch price history for charts
     */
    async fetchPriceHistory(symbol, days = 7) {
        const coinId = this.COIN_IDS[symbol];
        if (!coinId) return [];

        try {
            const response = await fetch(
                `${this.COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            return data.prices.map(([timestamp, price]) => ({
                time: timestamp,
                price: price
            }));
        } catch (e) {
            console.error(`Failed to fetch price history for ${symbol}:`, e);
            return [];
        }
    },

    /**
     * Fetch OHLCV candles for trading chart
     */
    async fetchOHLCV(symbol, days = 30) {
        const coinId = this.COIN_IDS[symbol];
        if (!coinId) return [];

        try {
            const response = await fetch(
                `${this.COINGECKO_API}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            return data.map(([timestamp, open, high, low, close]) => ({
                time: timestamp / 1000,
                open,
                high,
                low,
                close
            }));
        } catch (e) {
            console.error(`Failed to fetch OHLCV for ${symbol}:`, e);
            return [];
        }
    },

    /**
     * Connect to Binance WebSocket for real-time prices
     */
    connectBinanceWebSocket() {
        const symbols = ['btcusdt', 'ethusdt', 'solusdt', 'arbusdt', 'linkusdt', 'uniusdt', 'avaxusdt', 'maticusdt', 'dogeusdt', 'xrpusdt'];
        const streams = symbols.map(s => `${s}@ticker`).join('/');

        try {
            this.binanceWs = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

            this.binanceWs.onopen = () => {
                console.log('Binance WebSocket connected for real-time prices');
            };

            this.binanceWs.onmessage = (event) => {
                try {
                    const { data } = JSON.parse(event.data);
                    const symbol = data.s.replace('USDT', '');

                    if (this.priceCache[symbol]) {
                        this.priceCache[symbol] = {
                            ...this.priceCache[symbol],
                            price: parseFloat(data.c),
                            change24h: parseFloat(data.P),
                            volume24h: parseFloat(data.v) * parseFloat(data.c),
                            high24h: parseFloat(data.h),
                            low24h: parseFloat(data.l),
                            lastUpdate: Date.now()
                        };

                        this.notifySubscribers(symbol);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            };

            this.binanceWs.onclose = () => {
                console.log('Binance WebSocket disconnected, reconnecting...');
                setTimeout(() => this.connectBinanceWebSocket(), 5000);
            };

            this.binanceWs.onerror = (error) => {
                console.error('Binance WebSocket error:', error);
            };
        } catch (e) {
            console.error('Failed to connect Binance WebSocket:', e);
        }
    },

    /**
     * Start periodic price updates
     */
    startPeriodicUpdates() {
        setInterval(() => {
            this.fetchAllPrices();
        }, 30000); // Update every 30 seconds
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
     * Get trending coins
     */
    async getTrending() {
        try {
            const response = await fetch(`${this.COINGECKO_API}/search/trending`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return data.coins.map(coin => ({
                id: coin.item.id,
                symbol: coin.item.symbol.toUpperCase(),
                name: coin.item.name,
                rank: coin.item.market_cap_rank,
                image: coin.item.small
            }));
        } catch (e) {
            console.error('Failed to fetch trending:', e);
            return [];
        }
    },

    /**
     * Search for coins
     */
    async searchCoins(query) {
        try {
            const response = await fetch(`${this.COINGECKO_API}/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return data.coins.slice(0, 10).map(coin => ({
                id: coin.id,
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                rank: coin.market_cap_rank,
                image: coin.thumb
            }));
        } catch (e) {
            console.error('Failed to search coins:', e);
            return [];
        }
    }
};

// Export
window.PriceService = PriceService;
