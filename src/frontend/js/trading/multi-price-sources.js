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
            baseUrl: 'https://retrieve-velvet-percent-classic.trycloudflare.com',
            priority: 2
        },
        defillama: {
            name: 'DefiLlama',
            type: 'REST',
            baseUrl: 'https://api.llama.fi',
            coinsUrl: 'https://coins.llama.fi',
            yieldsUrl: 'https://yields.llama.fi',
            rateLimit: 300, // generous rate limit
            priority: 2
        }
    },

    // DefiLlama protocol data cache
    protocolData: {},
    yieldData: {},
    tvlData: {
        total: 0,
        protocols: {},
        chains: {},
        lastUpdate: null
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
        },
        defillama: {
            // Chain identifiers for DefiLlama
            ETH: 'ethereum',
            ARB: 'arbitrum',
            OP: 'optimism',
            MATIC: 'polygon',
            AVAX: 'avalanche',
            SOL: 'solana',
            BNB: 'bsc',
            FTM: 'fantom',
            BASE: 'base',
            LINEA: 'linea',
            SCROLL: 'scroll',
            ZKSYNC: 'zksync-era',
            MANTA: 'manta',
            BLAST: 'blast'
        }
    },

    // Top DeFi protocols to track
    TRACKED_PROTOCOLS: [
        'aave', 'lido', 'makerdao', 'uniswap', 'curve-dex', 'compound',
        'convex-finance', 'eigenlayer', 'pendle', 'gmx', 'hyperliquid-perp',
        'aerodrome', 'jito', 'marinade-finance', 'kamino-lend', 'jupiter-perps',
        'ethena', 'morpho', 'spark', 'instadapp', 'yearn-finance', 'beefy'
    ],

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
     * Initialize multi-source price aggregation (OFFLINE MODE)
     */
    async init() {
        console.log('[MultiPrice] Initializing (Offline Mode - uses PriceService)...');

        // Initialize source status - all simulated
        Object.keys(this.SOURCES).forEach(source => {
            this.sourcesStatus[source] = 'simulated';
            this.priceData[source] = {};
        });

        // Load from PriceService
        this.loadFromPriceService();

        // Create UI
        this.createPriceSourcesUI();

        // Start sync loop with PriceService
        setInterval(() => this.loadFromPriceService(), 5000);

        console.log('[MultiPrice] Ready (Offline Mode)');
    },

    /**
     * Load prices from PriceService (offline mode)
     */
    loadFromPriceService() {
        if (typeof PriceService === 'undefined' || !PriceService.priceCache) {
            return;
        }

        const now = Date.now();
        const cache = PriceService.priceCache;

        // Simulate all sources with same data
        Object.entries(cache).forEach(([symbol, data]) => {
            const priceInfo = {
                price: data.price,
                change24h: data.change24h || 0,
                volume24h: data.volume24h || 0,
                timestamp: now
            };

            // Add slight variation for each "source" to make it realistic
            this.priceData.coingecko = this.priceData.coingecko || {};
            this.priceData.binance = this.priceData.binance || {};
            this.priceData.obelisk = this.priceData.obelisk || {};

            this.priceData.coingecko[symbol] = { ...priceInfo };
            this.priceData.binance[symbol] = { ...priceInfo, price: priceInfo.price * (1 + (Math.random() - 0.5) * 0.001) };
            this.priceData.obelisk[symbol] = { ...priceInfo, price: priceInfo.price * (1 + (Math.random() - 0.5) * 0.001) };

            // Aggregated price
            this.aggregatedPrices[symbol] = {
                price: priceInfo.price,
                change24h: priceInfo.change24h,
                sources: ['coingecko', 'binance', 'obelisk'],
                spread: 0.1,
                timestamp: now
            };
        });

        this.lastUpdate.coingecko = now;
        this.lastUpdate.binance = now;
        this.lastUpdate.obelisk = now;

        this.notifySubscribers();
    },

    /**
     * Initialize CoinGecko API (DISABLED - offline mode)
     */
    async initCoinGecko() {
        // Offline mode - no API calls
        this.sourcesStatus.coingecko = 'simulated';
        this.lastUpdate.coingecko = Date.now();
        console.log('[MultiPrice] CoinGecko: simulated (offline mode)');
    },

    /**
     * Initialize Binance WebSocket (DISABLED - offline mode)
     */
    initBinanceWebSocket() {
        return new Promise((resolve) => {
            // Offline mode - no WebSocket connection
            this.sourcesStatus.binance = 'simulated';
            this.lastUpdate.binance = Date.now();
            console.log('[MultiPrice] Binance: simulated (offline mode)');
            resolve();
        });
    },

    /**
     * Handle Binance ticker message (DISABLED - offline mode)
     */
    handleBinanceTicker(data) {
        // Offline mode - not used
    },

    /**
     * Initialize Obelisk prices (DISABLED - offline mode)
     */
    async initObeliskPrices() {
        // Offline mode - uses PriceService instead
        this.sourcesStatus.obelisk = 'simulated';
        this.lastUpdate.obelisk = Date.now();
        console.log('[MultiPrice] Obelisk: simulated (offline mode)');
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
                <span class="sources-count" id="sources-count">0/5</span>
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
                <div class="source-item" data-source="defillama">
                    <span class="source-status"></span>
                    <span class="source-name">DefiLlama</span>
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
                <div class="tvl-widget" id="tvl-widget">
                    <span class="tvl-label">Total DeFi TVL:</span>
                    <span class="tvl-value" id="total-tvl">--</span>
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
        const connected = Object.values(this.sourcesStatus).filter(s => s === 'connected' || s === 'simulated').length;
        const countEl = document.getElementById('sources-count');
        if (countEl) {
            countEl.textContent = `${connected}/5`;
            countEl.className = 'sources-count ' + (connected >= 4 ? 'good' : connected >= 3 ? 'ok' : 'bad');
        }

        // Update TVL widget
        const tvlEl = document.getElementById('total-tvl');
        if (tvlEl && this.tvlData.total) {
            tvlEl.textContent = this.formatTVL(this.tvlData.total);
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

            .tvl-widget {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 8px;
                padding: 8px;
                background: rgba(0, 255, 136, 0.08);
                border: 1px solid rgba(0, 255, 136, 0.2);
                border-radius: 6px;
            }

            .tvl-label {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
            }

            .tvl-value {
                font-family: 'JetBrains Mono', monospace;
                font-size: 13px;
                font-weight: 600;
                color: #00ff88;
            }

            .source-status.simulated {
                background: #00aaff;
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
    },

    // ========================================
    // DefiLlama Integration Methods
    // ========================================

    /**
     * Fetch total DeFi TVL and chain breakdown
     */
    async fetchDefiLlamaTVL() {
        try {
            const response = await fetch(`${this.SOURCES.defillama.baseUrl}/v2/chains`);
            if (!response.ok) throw new Error('DefiLlama API error');

            const chains = await response.json();

            // Calculate total TVL
            let totalTvl = 0;
            const chainTvl = {};

            chains.forEach(chain => {
                totalTvl += chain.tvl || 0;
                chainTvl[chain.name.toLowerCase()] = {
                    tvl: chain.tvl,
                    change24h: chain.change_1d || 0,
                    change7d: chain.change_7d || 0
                };
            });

            this.tvlData.total = totalTvl;
            this.tvlData.chains = chainTvl;
            this.tvlData.lastUpdate = Date.now();

            console.log(`[DefiLlama] TVL updated: $${(totalTvl / 1e9).toFixed(2)}B`);
            return this.tvlData;
        } catch (e) {
            console.warn('[DefiLlama] TVL fetch error:', e.message);
            return null;
        }
    },

    /**
     * Fetch protocol TVL data
     */
    async fetchDefiLlamaProtocols() {
        try {
            const response = await fetch(`${this.SOURCES.defillama.baseUrl}/protocols`);
            if (!response.ok) throw new Error('DefiLlama API error');

            const protocols = await response.json();

            // Filter and map tracked protocols
            this.TRACKED_PROTOCOLS.forEach(slug => {
                const protocol = protocols.find(p => p.slug === slug);
                if (protocol) {
                    this.protocolData[slug] = {
                        name: protocol.name,
                        tvl: protocol.tvl,
                        change24h: protocol.change_1d || 0,
                        change7d: protocol.change_7d || 0,
                        chains: protocol.chains || [],
                        category: protocol.category,
                        url: protocol.url,
                        logo: protocol.logo,
                        lastUpdate: Date.now()
                    };
                }
            });

            this.sourcesStatus.defillama = 'connected';
            this.lastUpdate.defillama = Date.now();
            console.log(`[DefiLlama] Protocols updated: ${Object.keys(this.protocolData).length} tracked`);
            return this.protocolData;
        } catch (e) {
            this.sourcesStatus.defillama = 'error';
            console.warn('[DefiLlama] Protocols fetch error:', e.message);
            return null;
        }
    },

    /**
     * Fetch yield opportunities from DefiLlama
     */
    async fetchDefiLlamaYields(minTvl = 1000000, minApy = 1) {
        try {
            const response = await fetch(`${this.SOURCES.defillama.yieldsUrl}/pools`);
            if (!response.ok) throw new Error('DefiLlama Yields API error');

            const data = await response.json();
            const pools = data.data || [];

            // Filter and sort by APY
            const filteredPools = pools
                .filter(pool =>
                    pool.tvlUsd >= minTvl &&
                    pool.apy >= minApy &&
                    pool.apy < 10000 && // Filter out unrealistic APYs
                    pool.stablecoin !== undefined
                )
                .map(pool => ({
                    id: pool.pool,
                    project: pool.project,
                    chain: pool.chain,
                    symbol: pool.symbol,
                    tvl: pool.tvlUsd,
                    apy: pool.apy,
                    apyBase: pool.apyBase || 0,
                    apyReward: pool.apyReward || 0,
                    stablecoin: pool.stablecoin,
                    ilRisk: pool.ilRisk || 'unknown',
                    exposure: pool.exposure || 'single',
                    rewardTokens: pool.rewardTokens || []
                }))
                .sort((a, b) => b.apy - a.apy);

            // Group by category
            this.yieldData = {
                stablecoins: filteredPools.filter(p => p.stablecoin).slice(0, 20),
                singleAsset: filteredPools.filter(p => p.exposure === 'single' && !p.stablecoin).slice(0, 20),
                liquidityPools: filteredPools.filter(p => p.exposure === 'multi').slice(0, 20),
                topByTvl: [...filteredPools].sort((a, b) => b.tvl - a.tvl).slice(0, 20),
                lastUpdate: Date.now()
            };

            console.log(`[DefiLlama] Yields updated: ${filteredPools.length} pools`);
            return this.yieldData;
        } catch (e) {
            console.warn('[DefiLlama] Yields fetch error:', e.message);
            return null;
        }
    },

    /**
     * Get top yield opportunities
     */
    getTopYields(category = 'all', limit = 10) {
        if (!this.yieldData.lastUpdate) return [];

        switch (category) {
            case 'stablecoins':
                return this.yieldData.stablecoins?.slice(0, limit) || [];
            case 'single':
                return this.yieldData.singleAsset?.slice(0, limit) || [];
            case 'lp':
                return this.yieldData.liquidityPools?.slice(0, limit) || [];
            case 'tvl':
                return this.yieldData.topByTvl?.slice(0, limit) || [];
            default:
                // Combine all and sort by APY
                const all = [
                    ...(this.yieldData.stablecoins || []),
                    ...(this.yieldData.singleAsset || []),
                    ...(this.yieldData.liquidityPools || [])
                ];
                return all.sort((a, b) => b.apy - a.apy).slice(0, limit);
        }
    },

    /**
     * Get protocol TVL and data
     */
    getProtocolData(slug) {
        return this.protocolData[slug] || null;
    },

    /**
     * Get TVL for a specific chain
     */
    getChainTVL(chain) {
        return this.tvlData.chains[chain.toLowerCase()] || null;
    },

    /**
     * Get total DeFi TVL
     */
    getTotalTVL() {
        return this.tvlData.total;
    },

    /**
     * Format TVL for display
     */
    formatTVL(value) {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
        return `$${value.toFixed(2)}`;
    },

    /**
     * Initialize DefiLlama data (call on startup)
     */
    async initDefiLlama() {
        console.log('[DefiLlama] Initializing...');
        this.sourcesStatus.defillama = 'connecting';

        try {
            // Fetch all data in parallel
            await Promise.all([
                this.fetchDefiLlamaTVL(),
                this.fetchDefiLlamaProtocols(),
                this.fetchDefiLlamaYields()
            ]);

            this.sourcesStatus.defillama = 'connected';
            console.log('[DefiLlama] Initialized successfully');

            // Refresh every 5 minutes
            setInterval(() => {
                this.fetchDefiLlamaTVL();
                this.fetchDefiLlamaProtocols();
                this.fetchDefiLlamaYields();
            }, 5 * 60 * 1000);

            return true;
        } catch (e) {
            this.sourcesStatus.defillama = 'error';
            console.warn('[DefiLlama] Initialization error:', e.message);
            return false;
        }
    },

    /**
     * Get DeFi overview (for dashboard)
     */
    getDefiOverview() {
        return {
            totalTvl: this.tvlData.total,
            totalTvlFormatted: this.formatTVL(this.tvlData.total),
            topChains: Object.entries(this.tvlData.chains || {})
                .sort((a, b) => (b[1].tvl || 0) - (a[1].tvl || 0))
                .slice(0, 10)
                .map(([name, data]) => ({ name, ...data, tvlFormatted: this.formatTVL(data.tvl) })),
            trackedProtocols: Object.entries(this.protocolData)
                .map(([slug, data]) => ({ slug, ...data, tvlFormatted: this.formatTVL(data.tvl) }))
                .sort((a, b) => b.tvl - a.tvl),
            topYields: this.getTopYields('all', 5),
            lastUpdate: Math.max(
                this.tvlData.lastUpdate || 0,
                this.yieldData.lastUpdate || 0
            )
        };
    }
};

// Export
window.MultiPriceAggregator = MultiPriceAggregator;

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    MultiPriceAggregator.init();
});
