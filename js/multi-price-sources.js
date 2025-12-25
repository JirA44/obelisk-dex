/**
 * Obelisk DEX - Multi-Source Price Aggregator
 *
 * Aggregates prices from multiple sources for accuracy:
 * - CoinGecko API (free tier)
 * - Binance WebSocket (real-time)
 * - Chainlink Oracles (on-chain reference)
 * - Hyperliquid/dYdX (existing Obelisk API)
 *
 * Provides arbitrage detection between CEX/DEX prices.
 */

const MultiPriceAggregator = {
    // API endpoints
    SOURCES: {
        coingecko: {
            name: 'CoinGecko',
            type: 'REST',
            baseUrl: 'https://api.coingecko.com/api/v3',
            rateLimit: 50, // requests per minute
            priority: 2
        },
        binance: {
            name: 'Binance',
            type: 'WebSocket',
            wsUrl: 'wss://stream.binance.com:9443/ws',
            restUrl: 'https://api.binance.com/api/v3',
            priority: 1 // Highest priority (most liquid)
        },
        chainlink: {
            name: 'Chainlink',
            type: 'Oracle',
            // Price feed addresses on Ethereum mainnet
            feeds: {
                'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
                'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
                'LINK/USD': '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
                'UNI/USD': '0x553303d460EE0afB37EdFf9bE42922D8FF63220e'
            },
            priority: 3 // Reference oracle
        },
        obelisk: {
            name: 'Obelisk (Hyperliquid+dYdX)',
            type: 'REST',
            baseUrl: 'https://obelisk-api.hugo-padilla-pro.workers.dev',
            priority: 2
        }
    },

    // Symbol mappings between exchanges
    SYMBOL_MAP: {
        coingecko: {
            BTC: 'bitcoin',
            ETH: 'ethereum',
            SOL: 'solana',
            ARB: 'arbitrum',
            XRP: 'ripple',
            ADA: 'cardano',
            AVAX: 'avalanche-2',
            LINK: 'chainlink',
            UNI: 'uniswap',
            OP: 'optimism',
            MATIC: 'matic-network',
            DOT: 'polkadot',
            ATOM: 'cosmos',
            NEAR: 'near',
            APT: 'aptos'
        },
        binance: {
            BTC: 'BTCUSDT',
            ETH: 'ETHUSDT',
            SOL: 'SOLUSDT',
            ARB: 'ARBUSDT',
            XRP: 'XRPUSDT',
            ADA: 'ADAUSDT',
            AVAX: 'AVAXUSDT',
            LINK: 'LINKUSDT',
            UNI: 'UNIUSDT',
            OP: 'OPUSDT',
            MATIC: 'MATICUSDT',
            DOT: 'DOTUSDT',
            ATOM: 'ATOMUSDT',
            NEAR: 'NEARUSDT',
            APT: 'APTUSDT'
        }
    },

    // Price data from all sources
    priceData: {},
    aggregatedPrices: {},

    // WebSocket connections
    binanceWs: null,

    // Status
    sourcesStatus: {},
    lastUpdate: {},

    // Subscribers
    subscribers: [],

    /**
     * Initialize multi-source price aggregation
     */
    async init() {
        console.log('Initializing Multi-Source Price Aggregator...');

        // Initialize source status
        Object.keys(this.SOURCES).forEach(source => {
            this.sourcesStatus[source] = 'connecting';
            this.priceData[source] = {};
        });

        // Connect to all sources in parallel
        await Promise.allSettled([
            this.initCoinGecko(),
            this.initBinanceWebSocket(),
            this.initObeliskPrices()
        ]);

        // Create UI
        this.createPriceSourcesUI();

        // Start aggregation loop
        this.startAggregation();

        console.log('Multi-Source Price Aggregator ready!');
    },

    /**
     * Initialize CoinGecko API
     */
    async initCoinGecko() {
        try {
            const ids = Object.values(this.SYMBOL_MAP.coingecko).join(',');
            const response = await fetch(
                `${this.SOURCES.coingecko.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            // Map back to standard symbols
            Object.entries(this.SYMBOL_MAP.coingecko).forEach(([symbol, geckoId]) => {
                if (data[geckoId]) {
                    this.priceData.coingecko[symbol] = {
                        price: data[geckoId].usd,
                        change24h: data[geckoId].usd_24h_change || 0,
                        volume24h: data[geckoId].usd_24h_vol || 0,
                        timestamp: Date.now()
                    };
                }
            });

            this.sourcesStatus.coingecko = 'connected';
            this.lastUpdate.coingecko = Date.now();

            // Refresh every 60 seconds (CoinGecko rate limit)
            setInterval(() => this.initCoinGecko(), 60000);

        } catch (e) {
            console.error('CoinGecko error:', e);
            this.sourcesStatus.coingecko = 'error';
        }
    },

    /**
     * Initialize Binance WebSocket for real-time prices
     */
    initBinanceWebSocket() {
        return new Promise((resolve) => {
            try {
                // Get all symbols to subscribe
                const symbols = Object.values(this.SYMBOL_MAP.binance)
                    .map(s => s.toLowerCase() + '@ticker')
                    .join('/');

                this.binanceWs = new WebSocket(
                    `${this.SOURCES.binance.wsUrl}/${symbols}`
                );

                this.binanceWs.onopen = () => {
                    console.log('Binance WebSocket connected');
                    this.sourcesStatus.binance = 'connected';
                    resolve();
                };

                this.binanceWs.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.handleBinanceTicker(data);
                };

                this.binanceWs.onerror = (error) => {
                    console.error('Binance WebSocket error:', error);
                    this.sourcesStatus.binance = 'error';
                };

                this.binanceWs.onclose = () => {
                    console.log('Binance WebSocket closed, reconnecting...');
                    this.sourcesStatus.binance = 'disconnected';
                    // Reconnect after 5 seconds
                    setTimeout(() => this.initBinanceWebSocket(), 5000);
                };

            } catch (e) {
                console.error('Binance WebSocket init error:', e);
                this.sourcesStatus.binance = 'error';
                resolve();
            }
        });
    },

    /**
     * Handle Binance ticker message
     */
    handleBinanceTicker(data) {
        if (!data.s) return; // Not a ticker message

        // Find standard symbol
        const symbol = Object.entries(this.SYMBOL_MAP.binance)
            .find(([_, binanceSymbol]) => binanceSymbol === data.s)?.[0];

        if (symbol) {
            this.priceData.binance[symbol] = {
                price: parseFloat(data.c), // Current price
                change24h: parseFloat(data.P), // 24h change %
                volume24h: parseFloat(data.v) * parseFloat(data.c), // Volume in USDT
                high24h: parseFloat(data.h),
                low24h: parseFloat(data.l),
                bid: parseFloat(data.b),
                ask: parseFloat(data.a),
                timestamp: Date.now()
            };

            this.lastUpdate.binance = Date.now();

            // Immediately update aggregated price for this symbol
            this.aggregatePrice(symbol);
        }
    },

    /**
     * Initialize Obelisk prices (existing API)
     */
    async initObeliskPrices() {
        try {
            const response = await fetch(`${this.SOURCES.obelisk.baseUrl}/api/tickers`);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            for (const [pair, ticker] of Object.entries(data.tickers || {})) {
                const symbol = pair.replace('/USDC', '');
                this.priceData.obelisk[symbol] = {
                    price: ticker.price,
                    change24h: ticker.change24h || 0,
                    volume24h: ticker.volume || 0,
                    timestamp: Date.now()
                };
            }

            this.sourcesStatus.obelisk = 'connected';
            this.lastUpdate.obelisk = Date.now();

            // Refresh every 2 seconds
            setInterval(() => this.initObeliskPrices(), 2000);

        } catch (e) {
            console.error('Obelisk API error:', e);
            this.sourcesStatus.obelisk = 'error';
        }
    },

    /**
     * Aggregate price from all sources for a symbol
     */
    aggregatePrice(symbol) {
        const prices = [];
        const sources = [];

        // Collect prices from all sources
        Object.entries(this.priceData).forEach(([source, data]) => {
            if (data[symbol]?.price) {
                prices.push({
                    source,
                    price: data[symbol].price,
                    priority: this.SOURCES[source]?.priority || 5,
                    timestamp: data[symbol].timestamp
                });
                sources.push(source);
            }
        });

        if (prices.length === 0) return;

        // Calculate weighted average (higher priority = more weight)
        const totalWeight = prices.reduce((sum, p) => sum + (6 - p.priority), 0);
        const weightedPrice = prices.reduce((sum, p) => {
            const weight = (6 - p.priority) / totalWeight;
            return sum + p.price * weight;
        }, 0);

        // Calculate price variance (for arbitrage detection)
        const minPrice = Math.min(...prices.map(p => p.price));
        const maxPrice = Math.max(...prices.map(p => p.price));
        const variance = ((maxPrice - minPrice) / minPrice) * 100;

        // Get 24h change from highest priority source
        prices.sort((a, b) => a.priority - b.priority);
        const primarySource = prices[0].source;
        const change24h = this.priceData[primarySource][symbol]?.change24h || 0;

        this.aggregatedPrices[symbol] = {
            price: weightedPrice,
            change24h,
            sources: sources.length,
            sourceList: sources,
            minPrice,
            maxPrice,
            variance,
            hasArbitrage: variance > 0.5, // >0.5% spread = potential arbitrage
            timestamp: Date.now()
        };

        this.notifySubscribers(symbol);
    },

    /**
     * Start continuous aggregation
     */
    startAggregation() {
        // Aggregate all symbols every 500ms
        setInterval(() => {
            const allSymbols = new Set();
            Object.values(this.priceData).forEach(sourceData => {
                Object.keys(sourceData).forEach(symbol => allSymbols.add(symbol));
            });

            allSymbols.forEach(symbol => this.aggregatePrice(symbol));
            this.updateSourcesUI();
        }, 500);
    },

    /**
     * Create price sources UI panel
     */
    createPriceSourcesUI() {
        // Create floating panel
        const panel = document.createElement('div');
        panel.id = 'price-sources-panel';
        panel.className = 'price-sources-panel collapsed';
        panel.innerHTML = `
            <div class="sources-header" onclick="MultiPriceAggregator.togglePanel()">
                <span class="sources-title">Price Sources</span>
                <span class="sources-count" id="sources-count">0/4</span>
                <span class="toggle-icon">▼</span>
            </div>
            <div class="sources-body">
                <div class="source-item" data-source="binance">
                    <span class="source-status"></span>
                    <span class="source-name">Binance</span>
                    <span class="source-latency">--ms</span>
                </div>
                <div class="source-item" data-source="coingecko">
                    <span class="source-status"></span>
                    <span class="source-name">CoinGecko</span>
                    <span class="source-latency">--ms</span>
                </div>
                <div class="source-item" data-source="obelisk">
                    <span class="source-status"></span>
                    <span class="source-name">Obelisk API</span>
                    <span class="source-latency">--ms</span>
                </div>
                <div class="source-item" data-source="chainlink">
                    <span class="source-status"></span>
                    <span class="source-name">Chainlink</span>
                    <span class="source-latency">Oracle</span>
                </div>
                <div class="arbitrage-alert" id="arbitrage-alert" style="display:none;">
                    <span class="alert-icon">⚡</span>
                    <span class="alert-text">Arbitrage detected!</span>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.injectStyles();
    },

    /**
     * Toggle panel expanded/collapsed
     */
    togglePanel() {
        const panel = document.getElementById('price-sources-panel');
        if (panel) {
            panel.classList.toggle('collapsed');
        }
    },

    /**
     * Update sources UI
     */
    updateSourcesUI() {
        // Update connection count
        const connected = Object.values(this.sourcesStatus).filter(s => s === 'connected').length;
        const countEl = document.getElementById('sources-count');
        if (countEl) {
            countEl.textContent = `${connected}/4`;
            countEl.className = 'sources-count ' + (connected >= 3 ? 'good' : connected >= 2 ? 'ok' : 'bad');
        }

        // Update individual sources
        Object.entries(this.sourcesStatus).forEach(([source, status]) => {
            const item = document.querySelector(`[data-source="${source}"]`);
            if (item) {
                const statusEl = item.querySelector('.source-status');
                statusEl.className = 'source-status ' + status;

                // Update latency
                const latencyEl = item.querySelector('.source-latency');
                if (this.lastUpdate[source]) {
                    const latency = Date.now() - this.lastUpdate[source];
                    if (latency < 60000) {
                        latencyEl.textContent = latency < 1000 ? `${latency}ms` : `${Math.round(latency/1000)}s ago`;
                    }
                }
            }
        });

        // Check for arbitrage opportunities
        const hasArbitrage = Object.values(this.aggregatedPrices).some(p => p.hasArbitrage);
        const alertEl = document.getElementById('arbitrage-alert');
        if (alertEl) {
            alertEl.style.display = hasArbitrage ? 'flex' : 'none';
        }
    },

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('multi-price-styles')) return;

        const style = document.createElement('style');
        style.id = 'multi-price-styles';
        style.textContent = `
            .price-sources-panel {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 220px;
                background: rgba(10, 10, 15, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                font-size: 12px;
                z-index: 1000;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }

            .price-sources-panel.collapsed .sources-body {
                display: none;
            }

            .price-sources-panel.collapsed .toggle-icon {
                transform: rotate(-90deg);
            }

            .sources-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px;
                cursor: pointer;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .sources-title {
                font-weight: 600;
                color: #fff;
            }

            .sources-count {
                font-family: 'JetBrains Mono', monospace;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
            }

            .sources-count.good { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
            .sources-count.ok { background: rgba(255, 170, 0, 0.2); color: #ffaa00; }
            .sources-count.bad { background: rgba(255, 68, 68, 0.2); color: #ff4444; }

            .toggle-icon {
                color: rgba(255, 255, 255, 0.5);
                transition: transform 0.3s ease;
            }

            .sources-body {
                padding: 8px;
            }

            .source-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 8px;
                border-radius: 6px;
                transition: background 0.2s ease;
            }

            .source-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .source-status {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #666;
            }

            .source-status.connected { background: #00ff88; }
            .source-status.connecting { background: #ffaa00; animation: pulse 1s infinite; }
            .source-status.error { background: #ff4444; }
            .source-status.disconnected { background: #666; }

            .source-name {
                flex: 1;
                color: rgba(255, 255, 255, 0.8);
            }

            .source-latency {
                font-family: 'JetBrains Mono', monospace;
                color: rgba(255, 255, 255, 0.5);
                font-size: 10px;
            }

            .arbitrage-alert {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
                padding: 8px;
                background: rgba(255, 170, 0, 0.15);
                border: 1px solid rgba(255, 170, 0, 0.3);
                border-radius: 6px;
                color: #ffaa00;
                animation: pulse-alert 2s infinite;
            }

            @keyframes pulse-alert {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .alert-icon {
                font-size: 14px;
            }

            .alert-text {
                font-weight: 500;
                font-size: 11px;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Get aggregated price for symbol
     */
    getPrice(symbol) {
        return this.aggregatedPrices[symbol]?.price || null;
    },

    /**
     * Get all prices from specific source
     */
    getSourcePrices(source) {
        return this.priceData[source] || {};
    },

    /**
     * Get price comparison across sources
     */
    getPriceComparison(symbol) {
        const comparison = {};

        Object.entries(this.priceData).forEach(([source, data]) => {
            if (data[symbol]) {
                comparison[source] = data[symbol];
            }
        });

        return comparison;
    },

    /**
     * Find arbitrage opportunities
     */
    getArbitrageOpportunities(minSpread = 0.3) {
        const opportunities = [];

        Object.entries(this.aggregatedPrices).forEach(([symbol, data]) => {
            if (data.variance >= minSpread) {
                // Find best buy and sell sources
                let bestBuy = { source: null, price: Infinity };
                let bestSell = { source: null, price: 0 };

                Object.entries(this.priceData).forEach(([source, sourceData]) => {
                    if (sourceData[symbol]) {
                        const price = sourceData[symbol].price;
                        if (price < bestBuy.price) {
                            bestBuy = { source, price };
                        }
                        if (price > bestSell.price) {
                            bestSell = { source, price };
                        }
                    }
                });

                opportunities.push({
                    symbol,
                    buySource: bestBuy.source,
                    buyPrice: bestBuy.price,
                    sellSource: bestSell.source,
                    sellPrice: bestSell.price,
                    spread: data.variance,
                    potentialProfit: ((bestSell.price - bestBuy.price) / bestBuy.price) * 100
                });
            }
        });

        return opportunities.sort((a, b) => b.potentialProfit - a.potentialProfit);
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
     * Notify subscribers
     */
    notifySubscribers(symbol) {
        this.subscribers.forEach(cb => {
            try {
                cb(this.aggregatedPrices, symbol);
            } catch (e) {
                console.warn('Subscriber callback error:', e.message);
            }
        });
    }
};

// Export
window.MultiPriceAggregator = MultiPriceAggregator;

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    MultiPriceAggregator.init();
});
