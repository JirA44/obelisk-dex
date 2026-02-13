/**
 * FAST TRADING MODULE - Prepare for Real Fast/HFT Trading
 * Education, Tools, Real-time Data, API Connections
 * Build: 2026-01-18
 */
const FastTradingModule = {
    // WebSocket connections
    binanceWS: null,
    priceFeeds: {},
    latencyResults: {},

    // User's API keys (stored encrypted in localStorage)
    apiKeys: {},

    // Hotkey bindings
    hotkeys: {
        'KeyB': { action: 'buy', label: 'B = Buy' },
        'KeyS': { action: 'sell', label: 'S = Sell' },
        'KeyC': { action: 'cancel', label: 'C = Cancel All' },
        'KeyM': { action: 'market', label: 'M = Market Order' },
        'KeyL': { action: 'limit', label: 'L = Limit Order' },
        'Digit1': { action: 'size25', label: '1 = 25% Size' },
        'Digit2': { action: 'size50', label: '2 = 50% Size' },
        'Digit3': { action: 'size75', label: '3 = 75% Size' },
        'Digit4': { action: 'size100', label: '4 = 100% Size' },
        'ArrowUp': { action: 'priceUp', label: '↑ = Price +1 tick' },
        'ArrowDown': { action: 'priceDown', label: '↓ = Price -1 tick' },
        'Enter': { action: 'execute', label: 'Enter = Execute' },
        'Escape': { action: 'reset', label: 'Esc = Reset' }
    },

    // Trading state
    tradingState: {
        pair: 'BTCUSDT',
        side: 'buy',
        type: 'limit',
        sizePercent: 100,
        price: 0,
        enabled: false
    },

    // Academy lessons
    lessons: [
        {
            id: 'basics',
            title: 'Fast Trading Fundamentals',
            icon: '📚',
            duration: '15 min',
            topics: [
                'Order types: Market, Limit, Stop, OCO',
                'Latency and its impact on execution',
                'Slippage and how to minimize it',
                'Maker vs Taker fees',
                'Order book reading basics'
            ]
        },
        {
            id: 'execution',
            title: 'Execution Optimization',
            icon: '⚡',
            duration: '20 min',
            topics: [
                'Pre-loading orders',
                'Hotkey trading setup',
                'Position sizing strategies',
                'Risk per trade calculations',
                'Emergency exit strategies'
            ]
        },
        {
            id: 'infrastructure',
            title: 'Trading Infrastructure',
            icon: '🖥️',
            duration: '25 min',
            topics: [
                'Low-latency internet setup',
                'VPS near exchange servers',
                'API rate limits and optimization',
                'Redundancy and failover',
                'Monitoring and alerts'
            ]
        },
        {
            id: 'strategies',
            title: 'Fast Trading Strategies',
            icon: '🎯',
            duration: '30 min',
            topics: [
                'Scalping techniques',
                'Momentum trading',
                'Mean reversion micro-trades',
                'News trading setup',
                'Breakout detection'
            ]
        },
        {
            id: 'psychology',
            title: 'Fast Trading Psychology',
            icon: '🧠',
            duration: '20 min',
            topics: [
                'Decision making under pressure',
                'Avoiding revenge trading',
                'Managing winning/losing streaks',
                'Screen time management',
                'Building trading discipline'
            ]
        },
        {
            id: 'tools',
            title: 'Professional Tools',
            icon: '🛠️',
            duration: '25 min',
            topics: [
                'TradingView integration',
                'Custom alerts and webhooks',
                'API trading bots',
                'Order flow tools',
                'Performance tracking'
            ]
        }
    ],

    // DEX configurations
    dexes: [
        { id: 'uniswap', name: 'Uniswap V3', chain: 'Ethereum', chainId: 1, router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', icon: '🦄', color: '#FF007A', tvl: '5.2B', gasAvg: 150000 },
        { id: 'uniswap-arb', name: 'Uniswap (Arbitrum)', chain: 'Arbitrum', chainId: 42161, router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', icon: '🦄', color: '#FF007A', tvl: '890M', gasAvg: 800000 },
        { id: 'sushiswap', name: 'SushiSwap', chain: 'Ethereum', chainId: 1, router: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', icon: '🍣', color: '#FA52A0', tvl: '420M', gasAvg: 140000 },
        { id: 'pancakeswap', name: 'PancakeSwap', chain: 'BSC', chainId: 56, router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', icon: '🥞', color: '#1FC7D4', tvl: '1.8B', gasAvg: 200000 },
        { id: 'curve', name: 'Curve Finance', chain: 'Ethereum', chainId: 1, router: '0x99a58482BD75cbab83b27EC03CA68fF489b5788f', icon: '🌀', color: '#FF6B6B', tvl: '2.1B', gasAvg: 250000 },
        { id: '1inch', name: '1inch (Aggregator)', chain: 'Multi', chainId: 1, router: '0x1111111254EEB25477B68fb85Ed929f73A960582', icon: '🦊', color: '#1C1C1C', tvl: 'Aggregator', gasAvg: 180000 },
        { id: 'paraswap', name: 'ParaSwap', chain: 'Multi', chainId: 1, router: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', icon: '🔄', color: '#0058FF', tvl: 'Aggregator', gasAvg: 170000 },
        { id: 'odos', name: 'ODOS', chain: 'Multi', chainId: 1, router: '0x76f4eeD9fE41262669D0250b2A97db79712aD855', icon: '🔷', color: '#8B5CF6', tvl: 'Aggregator', gasAvg: 160000 },
        { id: 'camelot', name: 'Camelot', chain: 'Arbitrum', chainId: 42161, router: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d', icon: '⚔️', color: '#FFAF1D', tvl: '95M', gasAvg: 600000 },
        { id: 'velodrome', name: 'Velodrome', chain: 'Optimism', chainId: 10, router: '0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858', icon: '🚴', color: '#FF0000', tvl: '320M', gasAvg: 500000 },
        { id: 'aerodrome', name: 'Aerodrome', chain: 'Base', chainId: 8453, router: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43', icon: '✈️', color: '#0052FF', tvl: '650M', gasAvg: 400000 },
        { id: 'traderjoe', name: 'Trader Joe', chain: 'Avalanche', chainId: 43114, router: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4', icon: '🏔️', color: '#E84142', tvl: '180M', gasAvg: 300000 },
        { id: 'gmx', name: 'GMX', chain: 'Arbitrum', chainId: 42161, router: '0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064', icon: '💎', color: '#4F67FF', tvl: '520M', gasAvg: 700000 },
        { id: 'hyperliquid', name: 'Hyperliquid', chain: 'Hyperliquid', chainId: 999, router: 'native', icon: '🌊', color: '#00FF88', tvl: '2.8B', gasAvg: 50000 }
    ],

    // Wallet state
    walletState: {
        connected: false,
        address: null,
        chainId: null,
        balance: 0
    },

    // DEX trading settings
    dexSettings: {
        slippage: 2.0,  // V2.1: Increased from 0.5% (caused INSUFFICIENT_OUTPUT_AMOUNT failures)
        deadline: 20, // minutes
        gasMultiplier: 1.1,
        autoApprove: false
    },

    // Popular tokens for quick trading
    popularTokens: {
        1: [ // Ethereum
            { symbol: 'ETH', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
            { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
            { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
            { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
            { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 }
        ],
        42161: [ // Arbitrum
            { symbol: 'ETH', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
            { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
            { symbol: 'ARB', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18 },
            { symbol: 'GMX', address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', decimals: 18 }
        ],
        8453: [ // Base
            { symbol: 'ETH', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
            { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 }
        ]
    },

    // Exchange endpoints for latency testing
    exchanges: [
        { id: 'binance', name: 'Binance', url: 'https://api.binance.com/api/v3/ping', ws: 'wss://stream.binance.com:9443/ws', region: 'Tokyo/Singapore' },
        { id: 'coinbase', name: 'Coinbase', url: 'https://api.coinbase.com/v2/time', ws: 'wss://ws-feed.exchange.coinbase.com', region: 'US East' },
        { id: 'kraken', name: 'Kraken', url: 'https://api.kraken.com/0/public/Time', ws: 'wss://ws.kraken.com', region: 'Europe' },
        { id: 'bybit', name: 'Bybit', url: 'https://api.bybit.com/v5/market/time', ws: 'wss://stream.bybit.com/v5/public/spot', region: 'Singapore' },
        { id: 'okx', name: 'OKX', url: 'https://www.okx.com/api/v5/public/time', ws: 'wss://ws.okx.com:8443/ws/v5/public', region: 'Hong Kong' },
        { id: 'kucoin', name: 'KuCoin', url: 'https://api.kucoin.com/api/v1/timestamp', ws: null, region: 'Singapore' },
        { id: 'hyperliquid', name: 'Hyperliquid', url: 'https://api.hyperliquid.xyz/info', ws: 'wss://api.hyperliquid.xyz/ws', region: 'Decentralized' }
    ],

    init() {
        this.loadSettings();
        console.log('[FastTrading] Module initialized');
    },

    loadSettings() {
        this.apiKeys = SafeOps.getStorage('obelisk_fast_api_keys', {});
        this.latencyResults = SafeOps.getStorage('obelisk_latency_results', {});
    },

    saveSettings() {
        SafeOps.setStorage('obelisk_fast_api_keys', this.apiKeys);
        SafeOps.setStorage('obelisk_latency_results', this.latencyResults);
    },

    // ==================== LATENCY TESTING ====================
    async testLatency(exchangeId) {
        const exchange = this.exchanges.find(e => e.id === exchangeId);
        if (!exchange) return null;

        const results = [];
        const tests = 5;

        for (let i = 0; i < tests; i++) {
            const start = performance.now();
            try {
                await fetch(exchange.url, { mode: 'cors', cache: 'no-store' });
                const latency = performance.now() - start;
                results.push(latency);
            } catch (e) {
                results.push(null);
            }
            await new Promise(r => setTimeout(r, 100));
        }

        const validResults = results.filter(r => r !== null);
        if (validResults.length === 0) return { error: 'Connection failed' };

        const avg = validResults.reduce((a, b) => a + b, 0) / validResults.length;
        const min = Math.min(...validResults);
        const max = Math.max(...validResults);

        this.latencyResults[exchangeId] = {
            avg: avg.toFixed(1),
            min: min.toFixed(1),
            max: max.toFixed(1),
            timestamp: Date.now()
        };
        this.saveSettings();

        return this.latencyResults[exchangeId];
    },

    async testAllLatencies(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = '<div style="color:#888;text-align:center;padding:20px;">Testing latencies...</div>';

        for (const exchange of this.exchanges) {
            await this.testLatency(exchange.id);
            this.renderLatencyResults(containerId);
        }
    },

    renderLatencyResults(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = '';
        this.exchanges.forEach(ex => {
            const result = this.latencyResults[ex.id];
            const latencyColor = !result ? '#888' :
                parseFloat(result.avg) < 100 ? '#00ff88' :
                parseFloat(result.avg) < 300 ? '#f59e0b' : '#ef4444';
            const latencyText = result ? `${result.avg}ms` : 'Not tested';
            const qualityText = !result ? '' :
                parseFloat(result.avg) < 100 ? '(Excellent)' :
                parseFloat(result.avg) < 200 ? '(Good)' :
                parseFloat(result.avg) < 400 ? '(Fair)' : '(Poor)';

            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px;">
                    <div>
                        <div style="font-weight:600;color:#fff;">${ex.name}</div>
                        <div style="font-size:11px;color:#888;">${ex.region}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:${latencyColor};font-weight:600;">${latencyText} <span style="font-size:10px;opacity:0.7;">${qualityText}</span></div>
                        ${result ? `<div style="font-size:10px;color:#666;">Min: ${result.min}ms | Max: ${result.max}ms</div>` : ''}
                    </div>
                </div>`;
        });

        el.innerHTML = html;
    },

    // ==================== REAL-TIME PRICE FEEDS ====================
    connectBinanceWS(symbols = ['btcusdt', 'ethusdt', 'solusdt']) {
        if (this.binanceWS) {
            this.binanceWS.close();
        }

        const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
        this.binanceWS = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

        this.binanceWS.onopen = () => {
            console.log('[FastTrading] Binance WS connected');
            if (typeof showNotification === 'function') {
                showNotification('Real-time price feed connected', 'success');
            }
        };

        this.binanceWS.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.s) {
                this.priceFeeds[data.s] = {
                    price: parseFloat(data.c),
                    change: parseFloat(data.P),
                    high: parseFloat(data.h),
                    low: parseFloat(data.l),
                    volume: parseFloat(data.v),
                    timestamp: Date.now()
                };
                this.updatePriceDisplay(data.s);
            }
        };

        this.binanceWS.onerror = (error) => {
            console.error('[FastTrading] WS error:', error);
        };

        this.binanceWS.onclose = () => {
            console.log('[FastTrading] Binance WS closed');
        };
    },

    disconnectWS() {
        if (this.binanceWS) {
            this.binanceWS.close();
            this.binanceWS = null;
        }
    },

    updatePriceDisplay(symbol) {
        const el = document.getElementById('price-' + symbol);
        if (!el) return;

        const feed = this.priceFeeds[symbol];
        if (!feed) return;

        const changeColor = feed.change >= 0 ? '#00ff88' : '#ef4444';
        const changeSign = feed.change >= 0 ? '+' : '';

        el.innerHTML = `
            <span style="font-size:18px;font-weight:700;color:#fff;">$${feed.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span style="font-size:12px;color:${changeColor};margin-left:8px;">${changeSign}${feed.change.toFixed(2)}%</span>
        `;
    },

    // ==================== HOTKEY TRADING ====================
    enableHotkeyTrading() {
        this.tradingState.enabled = true;
        document.addEventListener('keydown', this.handleHotkey.bind(this));
        if (typeof showNotification === 'function') {
            showNotification('Hotkey trading enabled! Press Esc to disable.', 'info');
        }
    },

    disableHotkeyTrading() {
        this.tradingState.enabled = false;
        document.removeEventListener('keydown', this.handleHotkey.bind(this));
        if (typeof showNotification === 'function') {
            showNotification('Hotkey trading disabled', 'info');
        }
    },

    handleHotkey(event) {
        if (!this.tradingState.enabled) return;
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

        const hotkey = this.hotkeys[event.code];
        if (!hotkey) return;

        event.preventDefault();

        switch (hotkey.action) {
            case 'buy': this.tradingState.side = 'buy'; break;
            case 'sell': this.tradingState.side = 'sell'; break;
            case 'market': this.tradingState.type = 'market'; break;
            case 'limit': this.tradingState.type = 'limit'; break;
            case 'size25': this.tradingState.sizePercent = 25; break;
            case 'size50': this.tradingState.sizePercent = 50; break;
            case 'size75': this.tradingState.sizePercent = 75; break;
            case 'size100': this.tradingState.sizePercent = 100; break;
            case 'priceUp': this.adjustPrice(1); break;
            case 'priceDown': this.adjustPrice(-1); break;
            case 'execute': this.executeHotkeyOrder(); break;
            case 'cancel': this.cancelAllOrders(); break;
            case 'reset': this.disableHotkeyTrading(); break;
        }

        this.updateHotkeyDisplay();
    },

    adjustPrice(ticks) {
        const tickSize = this.tradingState.pair.includes('BTC') ? 0.1 : 0.01;
        this.tradingState.price += ticks * tickSize;
    },

    executeHotkeyOrder() {
        console.log('[FastTrading] Execute order:', this.tradingState);
        if (typeof showNotification === 'function') {
            showNotification(`${this.tradingState.side.toUpperCase()} ${this.tradingState.type.toUpperCase()} ${this.tradingState.sizePercent}%`, 'info');
        }
        // Here would integrate with real API
    },

    cancelAllOrders() {
        console.log('[FastTrading] Cancel all orders');
        if (typeof showNotification === 'function') {
            showNotification('All orders cancelled', 'warning');
        }
    },

    updateHotkeyDisplay() {
        const el = document.getElementById('hotkey-status');
        if (!el) return;

        const sideColor = this.tradingState.side === 'buy' ? '#00ff88' : '#ef4444';
        el.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">
                <div style="padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;">
                    <div style="color:#888;font-size:10px;">SIDE</div>
                    <div style="color:${sideColor};font-weight:700;font-size:14px;">${this.tradingState.side.toUpperCase()}</div>
                </div>
                <div style="padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;">
                    <div style="color:#888;font-size:10px;">TYPE</div>
                    <div style="color:#3b82f6;font-weight:700;font-size:14px;">${this.tradingState.type.toUpperCase()}</div>
                </div>
                <div style="padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;">
                    <div style="color:#888;font-size:10px;">SIZE</div>
                    <div style="color:#f59e0b;font-weight:700;font-size:14px;">${this.tradingState.sizePercent}%</div>
                </div>
                <div style="padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;">
                    <div style="color:#888;font-size:10px;">PAIR</div>
                    <div style="color:#fff;font-weight:700;font-size:14px;">${this.tradingState.pair}</div>
                </div>
            </div>
        `;
    },

    // ==================== API KEY MANAGEMENT ====================
    saveApiKey(exchange, apiKey, secret) {
        // In production, encrypt these before storing
        this.apiKeys[exchange] = {
            key: apiKey,
            secret: secret,
            added: Date.now()
        };
        this.saveSettings();
        return true;
    },

    removeApiKey(exchange) {
        delete this.apiKeys[exchange];
        this.saveSettings();
    },

    hasApiKey(exchange) {
        return !!this.apiKeys[exchange];
    },

    // ==================== MAIN RENDER ====================
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = `
            <div style="max-height:80vh;overflow-y:auto;padding-right:10px;">
                <h3 style="color:#00ff88;margin-bottom:8px;">⚡ Préparation Fast Trading</h3>
                <p style="color:#888;font-size:12px;margin-bottom:20px;">Apprenez, pratiquez et préparez-vous au trading rapide réel</p>

                <!-- Tab Navigation -->
                <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
                    <button onclick="FastTradingModule.showTab('academy')" id="tab-academy" class="fast-tab active" style="padding:10px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">📚 Académie</button>
                    <button onclick="FastTradingModule.showTab('latency')" id="tab-latency" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">📡 Test Latence</button>
                    <button onclick="FastTradingModule.showTab('realtime')" id="tab-realtime" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">📊 Temps Réel</button>
                    <button onclick="FastTradingModule.showTab('hotkeys')" id="tab-hotkeys" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">⌨️ Raccourcis</button>
                    <button onclick="FastTradingModule.showTab('api')" id="tab-api" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">🔑 Clés API</button>
                    <button onclick="FastTradingModule.showTab('dex')" id="tab-dex" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">🔗 DEX</button>
                    <button onclick="FastTradingModule.showTab('tools')" id="tab-tools" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">🛠️ Outils</button>
                    <button onclick="FastTradingModule.showTab('stats')" id="tab-stats" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">📈 Stats</button>
                    <button onclick="FastTradingModule.showTab('calculator')" id="tab-calculator" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">🧮 Calculateur</button>
                    <button onclick="FastTradingModule.showTab('journal')" id="tab-journal" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">📓 Journal</button>
                    <button onclick="FastTradingModule.showTab('checklist')" id="tab-checklist" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">✅ Checklist</button>
                    <button onclick="FastTradingModule.showTab('strategies')" id="tab-strategies" class="fast-tab" style="padding:10px 16px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">🎯 Stratégies $1+</button>
                </div>

                <!-- Tab Content -->
                <div id="fast-tab-content"></div>
            </div>
        `;

        el.innerHTML = html;
        this.showTab('academy');
    },

    showTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.fast-tab').forEach(btn => {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.color = '#fff';
        });
        const activeBtn = document.getElementById('tab-' + tabId);
        if (activeBtn) {
            activeBtn.style.background = '#00ff88';
            activeBtn.style.color = '#000';
        }

        const content = document.getElementById('fast-tab-content');
        if (!content) return;

        switch (tabId) {
            case 'academy': this.renderAcademy(content); break;
            case 'latency': this.renderLatency(content); break;
            case 'realtime': this.renderRealtime(content); break;
            case 'hotkeys': this.renderHotkeys(content); break;
            case 'api': this.renderApiKeys(content); break;
            case 'dex': this.renderDex(content); break;
            case 'tools': this.renderTools(content); break;
            case 'stats': this.renderStats(content); break;
            case 'calculator': this.renderCalculator(content); break;
            case 'journal': this.renderJournal(content); break;
            case 'checklist': this.renderChecklist(content); break;
            case 'strategies': this.renderStrategies(content); break;
        }
    },

    // ==================== DEX CONNECTIONS ====================
    async connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            if (typeof showNotification === 'function') {
                showNotification('Please install MetaMask or another Web3 wallet', 'error');
            }
            return false;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });

            this.walletState = {
                connected: true,
                address: accounts[0],
                chainId: parseInt(chainId, 16),
                balance: 0
            };

            // Get balance
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
            });
            this.walletState.balance = parseInt(balance, 16) / 1e18;

            if (typeof showNotification === 'function') {
                showNotification('Wallet connected: ' + accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4), 'success');
            }

            // Listen for account/chain changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    this.walletState.address = accounts[0];
                    this.renderDex(document.getElementById('fast-tab-content'));
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                this.walletState.chainId = parseInt(chainId, 16);
                this.renderDex(document.getElementById('fast-tab-content'));
            });

            return true;
        } catch (error) {
            console.error('[FastTrading] Wallet connection error:', error);
            if (typeof showNotification === 'function') {
                showNotification('Wallet connection failed', 'error');
            }
            return false;
        }
    },

    disconnectWallet() {
        this.walletState = {
            connected: false,
            address: null,
            chainId: null,
            balance: 0
        };
        if (typeof showNotification === 'function') {
            showNotification('Wallet disconnected', 'info');
        }
    },

    async switchChain(chainId) {
        if (!window.ethereum) return false;

        const chainHex = '0x' + chainId.toString(16);
        const chainConfigs = {
            1: { chainId: chainHex, chainName: 'Ethereum Mainnet' },
            42161: { chainId: chainHex, chainName: 'Arbitrum One', rpcUrls: ['https://arb1.arbitrum.io/rpc'], nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://arbiscan.io'] },
            8453: { chainId: chainHex, chainName: 'Base', rpcUrls: ['https://mainnet.base.org'], nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://basescan.org'] },
            10: { chainId: chainHex, chainName: 'Optimism', rpcUrls: ['https://mainnet.optimism.io'], nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://optimistic.etherscan.io'] },
            56: { chainId: chainHex, chainName: 'BNB Smart Chain', rpcUrls: ['https://bsc-dataseed.binance.org'], nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }, blockExplorerUrls: ['https://bscscan.com'] },
            43114: { chainId: chainHex, chainName: 'Avalanche C-Chain', rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'], nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 }, blockExplorerUrls: ['https://snowtrace.io'] }
        };

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainHex }]
            });
            return true;
        } catch (switchError) {
            if (switchError.code === 4902 && chainConfigs[chainId]) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [chainConfigs[chainId]]
                    });
                    return true;
                } catch (addError) {
                    console.error('[FastTrading] Add chain error:', addError);
                }
            }
            return false;
        }
    },

    getChainName(chainId) {
        const chains = {
            1: 'Ethereum',
            42161: 'Arbitrum',
            8453: 'Base',
            10: 'Optimism',
            56: 'BSC',
            43114: 'Avalanche',
            137: 'Polygon'
        };
        return chains[chainId] || 'Unknown';
    },

    updateDexSettings(setting, value) {
        this.dexSettings[setting] = value;
        SafeOps.setStorage('obelisk_dex_settings', this.dexSettings);
    },

    async getQuote(dexId, tokenIn, tokenOut, amountIn) {
        // This would call real DEX APIs in production
        console.log('[FastTrading] Getting quote from', dexId, tokenIn, '->', tokenOut, amountIn);

        // Simulated quote for demo
        const mockRate = 1 + (Math.random() * 0.02 - 0.01); // +/- 1%
        return {
            amountOut: amountIn * mockRate,
            priceImpact: (Math.random() * 0.5).toFixed(2),
            gasEstimate: this.dexes.find(d => d.id === dexId)?.gasAvg || 150000,
            route: [tokenIn, tokenOut]
        };
    },

    // V2.2: Router ABIs for DEX swaps
    routerABI: {
        // Uniswap V2 / SushiSwap / Camelot style
        v2: [
            'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)',
            'function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable returns (uint[] amounts)',
            'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)',
            'function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)'
        ],
        // Camelot with referrer
        camelot: [
            'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] path, address to, address referrer, uint deadline)'
        ],
        // ERC20 approval
        erc20: [
            'function approve(address spender, uint256 amount) returns (bool)',
            'function allowance(address owner, address spender) view returns (uint256)',
            'function balanceOf(address account) view returns (uint256)',
            'function decimals() view returns (uint8)'
        ]
    },

    async executeDexSwap(dexId, tokenIn, tokenOut, amountIn, minAmountOut) {
        if (!this.walletState.connected) {
            if (typeof showNotification === 'function') {
                showNotification('Please connect your wallet first', 'error');
            }
            return { success: false, error: 'Wallet not connected' };
        }

        if (typeof ethers === 'undefined') {
            console.error('[FastTrading] ethers.js not loaded');
            return { success: false, error: 'ethers.js not loaded' };
        }

        console.log('[FastTrading] Executing swap:', dexId, amountIn, tokenIn.symbol, '->', tokenOut.symbol);

        try {
            const dex = this.dexes.find(d => d.id === dexId);
            if (!dex) throw new Error(`DEX ${dexId} not found`);
            if (dex.chainId !== this.walletState.chainId) {
                throw new Error(`Wrong chain. Expected ${dex.chain}, got chainId ${this.walletState.chainId}`);
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Parse amount with decimals
            const amountInWei = ethers.parseUnits(amountIn.toString(), tokenIn.decimals || 18);
            const minOutWei = ethers.parseUnits(minAmountOut.toString(), tokenOut.decimals || 18);
            const deadline = Math.floor(Date.now() / 1000) + (this.dexSettings.deadline * 60);

            // Check if tokenIn is native ETH
            const isNativeIn = tokenIn.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
            const isNativeOut = tokenOut.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

            // WETH addresses by chain
            const WETH = {
                1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                10: '0x4200000000000000000000000000000000000006',
                8453: '0x4200000000000000000000000000000000000006',
                56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
            };

            // Build path
            const pathIn = isNativeIn ? WETH[dex.chainId] : tokenIn.address;
            const pathOut = isNativeOut ? WETH[dex.chainId] : tokenOut.address;
            const path = [pathIn, pathOut];

            // Approve if not native
            if (!isNativeIn) {
                const tokenContract = new ethers.Contract(tokenIn.address, this.routerABI.erc20, signer);
                const allowance = await tokenContract.allowance(this.walletState.address, dex.router);
                if (allowance < amountInWei) {
                    if (typeof showNotification === 'function') {
                        showNotification('Approving token...', 'info');
                    }
                    const approveTx = await tokenContract.approve(dex.router, ethers.MaxUint256);
                    await approveTx.wait();
                    console.log('[FastTrading] Token approved');
                }
            }

            // Execute swap based on DEX type
            let tx;
            if (dexId === 'camelot') {
                // Camelot uses referrer parameter
                const router = new ethers.Contract(dex.router, this.routerABI.camelot, signer);
                tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                    amountInWei, minOutWei, path, this.walletState.address,
                    '0x0000000000000000000000000000000000000000', // no referrer
                    deadline
                );
            } else {
                // Standard Uniswap V2 style
                const router = new ethers.Contract(dex.router, this.routerABI.v2, signer);
                if (isNativeIn) {
                    tx = await router.swapExactETHForTokens(minOutWei, path, this.walletState.address, deadline, { value: amountInWei });
                } else if (isNativeOut) {
                    tx = await router.swapExactTokensForETH(amountInWei, minOutWei, path, this.walletState.address, deadline);
                } else {
                    tx = await router.swapExactTokensForTokens(amountInWei, minOutWei, path, this.walletState.address, deadline);
                }
            }

            if (typeof showNotification === 'function') {
                showNotification('Swap submitted! Waiting for confirmation...', 'info');
            }

            console.log('[FastTrading] TX submitted:', tx.hash);
            const receipt = await tx.wait();

            if (receipt.status === 0) {
                throw new Error('Transaction reverted');
            }

            console.log('[FastTrading] ✅ Swap confirmed:', tx.hash);
            if (typeof showNotification === 'function') {
                showNotification(`Swap confirmed! TX: ${tx.hash.slice(0, 10)}...`, 'success');
            }

            return {
                success: true,
                txHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                amountIn: amountIn,
                minAmountOut: minAmountOut
            };

        } catch (err) {
            console.error('[FastTrading] Swap failed:', err.message);
            if (typeof showNotification === 'function') {
                showNotification(`Swap failed: ${err.message}`, 'error');
            }
            return { success: false, error: err.message };
        }
    },

    renderDex(el) {
        if (!el) return;

        const chainDexes = this.walletState.chainId
            ? this.dexes.filter(d => d.chainId === this.walletState.chainId || d.chain === 'Multi')
            : this.dexes;

        el.innerHTML = `
            <h4 style="color:#fff;margin-bottom:16px;">🔗 Connexions DEX</h4>
            <p style="color:#888;font-size:12px;margin-bottom:20px;">Connectez-vous aux exchanges décentralisés pour du trading on-chain réel</p>

            <!-- Wallet Connection -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <div style="color:#888;font-size:12px;margin-bottom:4px;">Statut Wallet</div>
                        ${this.walletState.connected ? `
                            <div style="color:#00ff88;font-weight:600;">
                                ● Connected: ${this.walletState.address.slice(0, 6)}...${this.walletState.address.slice(-4)}
                            </div>
                            <div style="color:#888;font-size:11px;margin-top:4px;">
                                Chain: ${this.getChainName(this.walletState.chainId)} | Balance: ${this.walletState.balance.toFixed(4)} ETH
                            </div>
                        ` : `
                            <div style="color:#888;">○ Non connecté</div>
                        `}
                    </div>
                    <div style="display:flex;gap:8px;">
                        ${this.walletState.connected ? `
                            <button onclick="FastTradingModule.disconnectWallet();FastTradingModule.renderDex(document.getElementById('fast-tab-content'))"
                                    style="padding:10px 16px;background:#ef4444;border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">
                                Disconnect
                            </button>
                        ` : `
                            <button onclick="FastTradingModule.connectWallet().then(() => FastTradingModule.renderDex(document.getElementById('fast-tab-content')))"
                                    style="padding:10px 16px;background:linear-gradient(135deg,#00ff88,#00d4aa);border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">
                                🦊 Connect Wallet
                            </button>
                        `}
                    </div>
                </div>
            </div>

            <!-- Chain Selector -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:20px;">
                <div style="color:#888;font-size:12px;margin-bottom:12px;">Sélectionner Chain</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${[
                        { id: 1, name: 'Ethereum', icon: '⟠' },
                        { id: 42161, name: 'Arbitrum', icon: '🔵' },
                        { id: 8453, name: 'Base', icon: '🔷' },
                        { id: 10, name: 'Optimism', icon: '🔴' },
                        { id: 56, name: 'BSC', icon: '💛' },
                        { id: 43114, name: 'Avalanche', icon: '🔺' }
                    ].map(chain => `
                        <button onclick="FastTradingModule.switchChain(${chain.id}).then(() => FastTradingModule.renderDex(document.getElementById('fast-tab-content')))"
                                style="padding:8px 14px;background:${this.walletState.chainId === chain.id ? '#00ff88' : 'rgba(255,255,255,0.1)'};border:none;border-radius:8px;color:${this.walletState.chainId === chain.id ? '#000' : '#fff'};font-weight:600;cursor:pointer;font-size:12px;">
                            ${chain.icon} ${chain.name}
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- DEX Settings -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:20px;">
                <div style="color:#fff;font-weight:600;margin-bottom:12px;">⚙️ Paramètres Trading</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
                    <div>
                        <label style="color:#888;font-size:11px;">Tolérance Slippage</label>
                        <div style="display:flex;gap:4px;margin-top:4px;">
                            ${[0.1, 0.5, 1.0, 3.0].map(s => `
                                <button onclick="FastTradingModule.updateDexSettings('slippage', ${s});FastTradingModule.renderDex(document.getElementById('fast-tab-content'))"
                                        style="padding:6px 10px;background:${this.dexSettings.slippage === s ? '#00ff88' : 'rgba(255,255,255,0.1)'};border:none;border-radius:6px;color:${this.dexSettings.slippage === s ? '#000' : '#fff'};font-size:11px;cursor:pointer;">
                                    ${s}%
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Délai TX (min)</label>
                        <input type="number" value="${this.dexSettings.deadline}" min="1" max="60"
                               onchange="FastTradingModule.updateDexSettings('deadline', parseInt(this.value))"
                               style="width:100%;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Multiplicateur Gas</label>
                        <input type="number" value="${this.dexSettings.gasMultiplier}" min="1" max="2" step="0.1"
                               onchange="FastTradingModule.updateDexSettings('gasMultiplier', parseFloat(this.value))"
                               style="width:100%;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;">
                    </div>
                </div>
            </div>

            <!-- Available DEXes -->
            <h5 style="color:#fff;margin-bottom:12px;">Available DEXes (${chainDexes.length})</h5>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:20px;">
                ${chainDexes.map(dex => `
                    <div style="background:rgba(255,255,255,0.05);border:1px solid ${dex.color}33;border-radius:12px;padding:14px;transition:all 0.3s;cursor:pointer;"
                         onmouseover="this.style.borderColor='${dex.color}'"
                         onmouseout="this.style.borderColor='${dex.color}33'"
                         onclick="FastTradingModule.showDexSwapModal('${dex.id}')">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-size:20px;">${dex.icon}</span>
                            <span style="font-size:10px;padding:2px 6px;background:${dex.color}22;color:${dex.color};border-radius:4px;">${dex.chain}</span>
                        </div>
                        <div style="font-weight:600;color:#fff;margin-bottom:4px;">${dex.name}</div>
                        <div style="display:flex;justify-content:space-between;font-size:11px;color:#888;">
                            <span>TVL: $${dex.tvl}</span>
                            <span>Gas: ~${(dex.gasAvg / 1000).toFixed(0)}k</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Quick Swap Panel -->
            <div style="background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,212,170,0.05));border:1px solid #00ff8833;border-radius:12px;padding:20px;">
                <h5 style="color:#00ff88;margin:0 0 16px;">⚡ Quick Swap</h5>
                <div style="display:grid;gap:12px;">
                    <div style="display:flex;gap:12px;align-items:center;">
                        <div style="flex:1;">
                            <label style="color:#888;font-size:11px;">From</label>
                            <div style="display:flex;gap:8px;margin-top:4px;">
                                <input type="number" id="dex-amount-in" placeholder="0.0" value="0.1"
                                       style="flex:1;padding:12px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#fff;font-size:16px;">
                                <select id="dex-token-in" style="padding:12px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#fff;">
                                    <option value="ETH">ETH</option>
                                    <option value="USDC">USDC</option>
                                    <option value="USDT">USDT</option>
                                </select>
                            </div>
                        </div>
                        <div style="color:#888;font-size:20px;margin-top:20px;">→</div>
                        <div style="flex:1;">
                            <label style="color:#888;font-size:11px;">To</label>
                            <div style="display:flex;gap:8px;margin-top:4px;">
                                <input type="number" id="dex-amount-out" placeholder="0.0" readonly
                                       style="flex:1;padding:12px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#00ff88;font-size:16px;">
                                <select id="dex-token-out" style="padding:12px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#fff;">
                                    <option value="USDC">USDC</option>
                                    <option value="ETH">ETH</option>
                                    <option value="USDT">USDT</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="FastTradingModule.getQuickQuote()"
                                style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">
                            🔄 Get Quote
                        </button>
                        <button onclick="FastTradingModule.executeQuickSwap()"
                                style="flex:1;padding:12px;background:linear-gradient(135deg,#00ff88,#00d4aa);border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">
                            ⚡ Swap
                        </button>
                    </div>
                </div>
            </div>

            <!-- DEX Info -->
            <div style="margin-top:20px;padding:16px;background:rgba(59,130,246,0.1);border:1px solid #3b82f633;border-radius:12px;">
                <h5 style="color:#3b82f6;margin:0 0 8px;">💡 DEX Trading Tips</h5>
                <ul style="margin:0;padding-left:20px;color:#888;font-size:12px;">
                    <li>Use aggregators (1inch, ParaSwap, ODOS) for best prices</li>
                    <li>Lower slippage = more likely to fail on volatile tokens</li>
                    <li>Check gas prices before large trades on Ethereum</li>
                    <li>L2s (Arbitrum, Base, Optimism) have much lower fees</li>
                    <li>Always verify token contracts before trading</li>
                </ul>
            </div>
        `;
    },

    async getQuickQuote() {
        const amountIn = parseFloat(document.getElementById('dex-amount-in').value) || 0;
        const tokenIn = document.getElementById('dex-token-in').value;
        const tokenOut = document.getElementById('dex-token-out').value;

        if (amountIn <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Please enter an amount', 'warning');
            }
            return;
        }

        // Get quote from best DEX (using 1inch as default aggregator)
        const quote = await this.getQuote('1inch', tokenIn, tokenOut, amountIn);

        document.getElementById('dex-amount-out').value = quote.amountOut.toFixed(6);

        if (typeof showNotification === 'function') {
            showNotification(`Quote: ${amountIn} ${tokenIn} → ${quote.amountOut.toFixed(4)} ${tokenOut} (impact: ${quote.priceImpact}%)`, 'info');
        }
    },

    // V2.2: Helper to get token object from symbol
    getTokenBySymbol(symbol) {
        const chainId = this.walletState.chainId || 42161; // Default Arbitrum
        const tokens = this.popularTokens[chainId] || this.popularTokens[42161];
        return tokens.find(t => t.symbol === symbol) || { symbol, address: null, decimals: 18 };
    },

    // V2.2: Get best DEX for current chain
    getBestDexForChain() {
        const chainId = this.walletState.chainId;
        const chainDexMap = {
            1: 'uniswap',      // Ethereum -> Uniswap
            42161: 'camelot',  // Arbitrum -> Camelot
            8453: 'aerodrome', // Base -> Aerodrome
            10: 'velodrome',   // Optimism -> Velodrome
            56: 'pancakeswap', // BSC -> PancakeSwap
            43114: 'traderjoe' // Avalanche -> Trader Joe
        };
        return chainDexMap[chainId] || 'uniswap';
    },

    async executeQuickSwap() {
        if (!this.walletState.connected) {
            await this.connectWallet();
            if (!this.walletState.connected) return;
        }

        const amountIn = parseFloat(document.getElementById('dex-amount-in').value) || 0;
        const tokenInSymbol = document.getElementById('dex-token-in').value;
        const tokenOutSymbol = document.getElementById('dex-token-out').value;
        const amountOut = parseFloat(document.getElementById('dex-amount-out').value) || 0;

        if (amountIn <= 0 || amountOut <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Please get a quote first', 'warning');
            }
            return;
        }

        // V2.2: Get full token objects with addresses
        const tokenIn = this.getTokenBySymbol(tokenInSymbol);
        const tokenOut = this.getTokenBySymbol(tokenOutSymbol);

        if (!tokenIn.address || !tokenOut.address) {
            if (typeof showNotification === 'function') {
                showNotification(`Token not supported on this chain`, 'error');
            }
            return;
        }

        const minAmountOut = amountOut * (1 - this.dexSettings.slippage / 100);
        const bestDex = this.getBestDexForChain();

        console.log(`[FastTrading] Using ${bestDex} for swap on chain ${this.walletState.chainId}`);
        const result = await this.executeDexSwap(bestDex, tokenIn, tokenOut, amountIn, minAmountOut);

        if (result.success) {
            console.log(`[FastTrading] ✅ Swap complete: ${result.txHash}`);
        }
        return result;
    },

    showDexSwapModal(dexId) {
        const dex = this.dexes.find(d => d.id === dexId);
        if (!dex) return;

        if (typeof showNotification === 'function') {
            showNotification(`Selected ${dex.name} - Use Quick Swap panel below`, 'info');
        }
    },

    // ==================== TRADING TOOLS ====================
    renderTools(el) {
        if (!el) return;

        el.innerHTML = `
            <h4 style="color:#fff;margin-bottom:16px;">🛠️ Trading Tools</h4>

            <!-- Order Book Visualization -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h5 style="color:#fff;margin:0;">📊 Order Book</h5>
                    <select id="orderbook-pair" onchange="FastTradingModule.updateOrderBook()" style="padding:6px 12px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;">
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="SOLUSDT">SOL/USDT</option>
                    </select>
                </div>
                <div id="orderbook-display" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <div style="color:#00ff88;font-size:11px;font-weight:600;margin-bottom:8px;">BIDS (Buy)</div>
                        <div id="orderbook-bids" style="font-family:monospace;font-size:11px;">
                            ${this.generateMockOrderBook('bids')}
                        </div>
                    </div>
                    <div>
                        <div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:8px;">ASKS (Sell)</div>
                        <div id="orderbook-asks" style="font-family:monospace;font-size:11px;">
                            ${this.generateMockOrderBook('asks')}
                        </div>
                    </div>
                </div>
                <div style="text-align:center;margin-top:12px;padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;">
                    <span style="color:#888;font-size:11px;">Spread: </span>
                    <span style="color:#f59e0b;font-weight:600;">$2.50 (0.003%)</span>
                </div>
            </div>

            <!-- Trade Tape / Recent Trades -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">📜 Trade Tape (Recent Trades)</h5>
                <div id="trade-tape" style="max-height:200px;overflow-y:auto;font-family:monospace;font-size:11px;">
                    ${this.generateMockTradeTape()}
                </div>
            </div>

            <!-- Technical Indicators -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">📉 Technical Indicators (BTC)</h5>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">
                    ${this.generateIndicators()}
                </div>
            </div>

            <!-- Volume Profile -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">📊 Volume Profile (24h)</h5>
                <div style="display:flex;align-items:flex-end;height:100px;gap:2px;">
                    ${Array.from({length: 24}, (_, i) => {
                        const height = 20 + Math.random() * 80;
                        const hour = i.toString().padStart(2, '0');
                        return `<div style="flex:1;background:linear-gradient(to top, #00ff8833, #00ff88);height:${height}%;border-radius:2px 2px 0 0;" title="${hour}:00 UTC"></div>`;
                    }).join('')}
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:9px;color:#666;">
                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                </div>
            </div>

            <!-- Support/Resistance Levels -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">🎯 Key Levels (BTC)</h5>
                <div style="display:grid;gap:8px;">
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;border-radius:4px;">
                        <span style="color:#ef4444;">R3 (Strong Resistance)</span>
                        <span style="color:#fff;font-weight:600;">$105,500</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(239,68,68,0.05);border-left:3px solid #ef444488;border-radius:4px;">
                        <span style="color:#ef4444aa;">R2</span>
                        <span style="color:#fff;">$103,200</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(239,68,68,0.03);border-left:3px solid #ef444444;border-radius:4px;">
                        <span style="color:#ef444488;">R1</span>
                        <span style="color:#fff;">$101,800</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.1);border-left:3px solid #f59e0b;border-radius:4px;">
                        <span style="color:#f59e0b;">Current Price</span>
                        <span style="color:#f59e0b;font-weight:600;">$100,450</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(0,255,136,0.03);border-left:3px solid #00ff8844;border-radius:4px;">
                        <span style="color:#00ff8888;">S1</span>
                        <span style="color:#fff;">$99,200</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(0,255,136,0.05);border-left:3px solid #00ff8888;border-radius:4px;">
                        <span style="color:#00ff88aa;">S2</span>
                        <span style="color:#fff;">$97,500</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(0,255,136,0.1);border-left:3px solid #00ff88;border-radius:4px;">
                        <span style="color:#00ff88;">S3 (Strong Support)</span>
                        <span style="color:#fff;font-weight:600;">$95,000</span>
                    </div>
                </div>
            </div>
        `;
    },

    generateMockOrderBook(side) {
        const basePrice = 100450;
        const rows = [];
        for (let i = 0; i < 8; i++) {
            const price = side === 'bids'
                ? (basePrice - i * 5 - Math.random() * 3).toFixed(2)
                : (basePrice + i * 5 + Math.random() * 3).toFixed(2);
            const size = (Math.random() * 5 + 0.1).toFixed(3);
            const total = (parseFloat(price) * parseFloat(size)).toFixed(0);
            const barWidth = Math.min(100, parseFloat(size) * 20);
            const color = side === 'bids' ? '#00ff88' : '#ef4444';
            rows.push(`
                <div style="display:flex;justify-content:space-between;padding:4px;position:relative;margin-bottom:2px;">
                    <div style="position:absolute;left:0;top:0;height:100%;width:${barWidth}%;background:${color}15;border-radius:2px;"></div>
                    <span style="color:${color};z-index:1;">$${price}</span>
                    <span style="color:#888;z-index:1;">${size}</span>
                </div>
            `);
        }
        return rows.join('');
    },

    generateMockTradeTape() {
        const trades = [];
        const basePrice = 100450;
        for (let i = 0; i < 15; i++) {
            const isBuy = Math.random() > 0.5;
            const price = (basePrice + (Math.random() - 0.5) * 20).toFixed(2);
            const size = (Math.random() * 2 + 0.01).toFixed(4);
            const time = new Date(Date.now() - i * 2000).toLocaleTimeString();
            const color = isBuy ? '#00ff88' : '#ef4444';
            trades.push(`
                <div style="display:flex;justify-content:space-between;padding:4px 8px;background:${color}08;border-radius:4px;margin-bottom:2px;">
                    <span style="color:${color};">${isBuy ? 'BUY' : 'SELL'}</span>
                    <span style="color:#fff;">$${price}</span>
                    <span style="color:#888;">${size} BTC</span>
                    <span style="color:#666;">${time}</span>
                </div>
            `);
        }
        return trades.join('');
    },

    generateIndicators() {
        const indicators = [
            { name: 'RSI (14)', value: 58, status: 'neutral', color: '#f59e0b' },
            { name: 'MACD', value: '+125', status: 'bullish', color: '#00ff88' },
            { name: 'Stoch RSI', value: 72, status: 'overbought', color: '#ef4444' },
            { name: 'EMA 20', value: '$99,850', status: 'above', color: '#00ff88' },
            { name: 'EMA 50', value: '$98,200', status: 'above', color: '#00ff88' },
            { name: 'EMA 200', value: '$85,500', status: 'above', color: '#00ff88' },
            { name: 'Bollinger', value: 'Upper', status: 'near band', color: '#f59e0b' },
            { name: 'ATR (14)', value: '$1,250', status: 'medium', color: '#888' },
            { name: 'ADX', value: 28, status: 'trending', color: '#3b82f6' },
            { name: 'OBV', value: '+2.5M', status: 'rising', color: '#00ff88' },
            { name: 'VWAP', value: '$100,120', status: 'above', color: '#00ff88' },
            { name: 'CMF', value: 0.15, status: 'inflow', color: '#00ff88' }
        ];

        return indicators.map(ind => `
            <div style="padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;">
                <div style="color:#888;font-size:10px;margin-bottom:4px;">${ind.name}</div>
                <div style="color:${ind.color};font-weight:600;">${ind.value}</div>
                <div style="color:#666;font-size:9px;">${ind.status}</div>
            </div>
        `).join('');
    },

    // ==================== MARKET STATS ====================
    renderStats(el) {
        if (!el) return;

        el.innerHTML = `
            <h4 style="color:#fff;margin-bottom:16px;">📈 Market Stats</h4>

            <!-- Funding Rates -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">💰 Funding Rates (Perpetuals)</h5>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;">
                    ${this.generateFundingRates()}
                </div>
                <div style="margin-top:12px;padding:8px;background:rgba(59,130,246,0.1);border-radius:6px;font-size:11px;color:#888;">
                    💡 Positive = longs pay shorts | Negative = shorts pay longs | Extreme rates = reversal signal
                </div>
            </div>

            <!-- Liquidation Map -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">💥 Liquidation Heatmap (BTC)</h5>
                <div style="display:grid;gap:4px;">
                    ${this.generateLiquidationMap()}
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:10px;color:#888;">
                    <span>High liq. concentration = potential magnets</span>
                    <span style="color:#ef4444;">■</span> Shorts
                    <span style="color:#00ff88;">■</span> Longs
                </div>
            </div>

            <!-- Whale Alerts -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">🐋 Whale Alerts (24h)</h5>
                <div style="max-height:200px;overflow-y:auto;">
                    ${this.generateWhaleAlerts()}
                </div>
            </div>

            <!-- Gas Tracker -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">⛽ Gas Tracker</h5>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">
                    ${this.generateGasTracker()}
                </div>
            </div>

            <!-- Fear & Greed Index -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">😰 Fear & Greed Index</h5>
                <div style="display:flex;align-items:center;gap:20px;">
                    <div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(#ef4444 0% 20%, #f59e0b 20% 40%, #facc15 40% 60%, #84cc16 60% 80%, #00ff88 80% 100%);display:flex;align-items:center;justify-content:center;">
                        <div style="width:80px;height:80px;border-radius:50%;background:#0d0d1a;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                            <span style="font-size:24px;font-weight:700;color:#84cc16;">68</span>
                            <span style="font-size:10px;color:#888;">Greed</span>
                        </div>
                    </div>
                    <div style="flex:1;">
                        <div style="display:grid;gap:4px;font-size:11px;">
                            <div style="display:flex;justify-content:space-between;"><span style="color:#888;">Yesterday:</span><span style="color:#84cc16;">65 (Greed)</span></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#888;">Last Week:</span><span style="color:#f59e0b;">52 (Neutral)</span></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#888;">Last Month:</span><span style="color:#84cc16;">71 (Greed)</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Open Interest -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">📊 Open Interest</h5>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">
                    ${this.generateOpenInterest()}
                </div>
            </div>
        `;
    },

    generateFundingRates() {
        const rates = [
            { symbol: 'BTC', rate: 0.0085, color: '#00ff88' },
            { symbol: 'ETH', rate: 0.0072, color: '#00ff88' },
            { symbol: 'SOL', rate: 0.0156, color: '#00ff88' },
            { symbol: 'ARB', rate: -0.0023, color: '#ef4444' },
            { symbol: 'DOGE', rate: 0.0245, color: '#f59e0b' },
            { symbol: 'LINK', rate: 0.0068, color: '#00ff88' },
            { symbol: 'AVAX', rate: 0.0034, color: '#00ff88' },
            { symbol: 'OP', rate: -0.0015, color: '#ef4444' }
        ];

        return rates.map(r => `
            <div style="padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;text-align:center;">
                <div style="color:#fff;font-weight:600;margin-bottom:4px;">${r.symbol}</div>
                <div style="color:${r.color};font-size:14px;font-weight:600;">${r.rate > 0 ? '+' : ''}${(r.rate * 100).toFixed(4)}%</div>
                <div style="color:#666;font-size:9px;">${(r.rate * 3 * 365 * 100).toFixed(1)}% APR</div>
            </div>
        `).join('');
    },

    generateLiquidationMap() {
        const levels = [];
        const basePrice = 100450;
        for (let i = -5; i <= 5; i++) {
            const price = basePrice + i * 1000;
            const shortsLiq = i > 0 ? Math.random() * 50 + (i * 10) : 0;
            const longsLiq = i < 0 ? Math.random() * 50 + (Math.abs(i) * 10) : 0;
            const isCurrent = i === 0;

            levels.push(`
                <div style="display:flex;align-items:center;gap:8px;padding:6px;${isCurrent ? 'background:rgba(245,158,11,0.2);border-radius:4px;' : ''}">
                    <span style="width:70px;color:${isCurrent ? '#f59e0b' : '#888'};font-size:11px;">$${(price/1000).toFixed(1)}k</span>
                    <div style="flex:1;display:flex;height:16px;gap:1px;">
                        <div style="width:${shortsLiq}%;background:#ef4444;border-radius:2px;" title="Shorts: $${shortsLiq.toFixed(0)}M"></div>
                        <div style="flex:1;"></div>
                        <div style="width:${longsLiq}%;background:#00ff88;border-radius:2px;" title="Longs: $${longsLiq.toFixed(0)}M"></div>
                    </div>
                </div>
            `);
        }
        return levels.join('');
    },

    generateWhaleAlerts() {
        const alerts = [
            { time: '2 min ago', type: 'Transfer', amount: '1,500 BTC', from: 'Unknown', to: 'Binance', color: '#ef4444' },
            { time: '15 min ago', type: 'Buy', amount: '$45M USDT', from: 'Binance', to: '', color: '#00ff88' },
            { time: '32 min ago', type: 'Transfer', amount: '25,000 ETH', from: 'Coinbase', to: 'Unknown', color: '#00ff88' },
            { time: '1h ago', type: 'Sell', amount: '800 BTC', from: '', to: 'Kraken', color: '#ef4444' },
            { time: '2h ago', type: 'Transfer', amount: '500M USDC', from: 'Circle', to: 'Unknown', color: '#3b82f6' },
            { time: '3h ago', type: 'Buy', amount: '$120M BTC', from: 'OTC', to: '', color: '#00ff88' }
        ];

        return alerts.map(a => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:${a.color}08;border-left:3px solid ${a.color};border-radius:4px;margin-bottom:6px;">
                <div>
                    <span style="color:${a.color};font-weight:600;">${a.type}</span>
                    <span style="color:#fff;margin-left:8px;">${a.amount}</span>
                </div>
                <div style="text-align:right;">
                    <div style="color:#888;font-size:10px;">${a.from}${a.to ? ' → ' + a.to : ''}</div>
                    <div style="color:#666;font-size:9px;">${a.time}</div>
                </div>
            </div>
        `).join('');
    },

    generateGasTracker() {
        const chains = [
            { name: 'Ethereum', gas: 25, unit: 'gwei', cost: '$2.50', color: '#627eea' },
            { name: 'Arbitrum', gas: 0.1, unit: 'gwei', cost: '$0.15', color: '#28a0f0' },
            { name: 'Base', gas: 0.002, unit: 'gwei', cost: '$0.01', color: '#0052ff' },
            { name: 'Optimism', gas: 0.001, unit: 'gwei', cost: '$0.02', color: '#ff0420' },
            { name: 'BSC', gas: 3, unit: 'gwei', cost: '$0.08', color: '#f0b90b' },
            { name: 'Polygon', gas: 80, unit: 'gwei', cost: '$0.02', color: '#8247e5' }
        ];

        return chains.map(c => `
            <div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:3px solid ${c.color};">
                <div style="color:#fff;font-weight:600;margin-bottom:4px;">${c.name}</div>
                <div style="color:${c.color};font-size:16px;font-weight:600;">${c.gas} ${c.unit}</div>
                <div style="color:#888;font-size:11px;">Swap: ~${c.cost}</div>
            </div>
        `).join('');
    },

    generateOpenInterest() {
        const coins = [
            { symbol: 'BTC', oi: '18.5B', change: '+2.3%', longs: 52 },
            { symbol: 'ETH', oi: '8.2B', change: '-1.1%', longs: 48 },
            { symbol: 'SOL', oi: '2.1B', change: '+5.8%', longs: 58 },
            { symbol: 'XRP', oi: '1.4B', change: '+0.5%', longs: 51 }
        ];

        return coins.map(c => {
            const changeColor = c.change.startsWith('+') ? '#00ff88' : '#ef4444';
            return `
                <div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#fff;font-weight:600;">${c.symbol}</span>
                        <span style="color:${changeColor};font-size:11px;">${c.change}</span>
                    </div>
                    <div style="color:#888;font-size:12px;margin-bottom:8px;">OI: $${c.oi}</div>
                    <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="width:${c.longs}%;background:#00ff88;"></div>
                        <div style="width:${100-c.longs}%;background:#ef4444;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:9px;color:#888;margin-top:4px;">
                        <span>L: ${c.longs}%</span>
                        <span>S: ${100-c.longs}%</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==================== PNL CALCULATOR ====================
    renderCalculator(el) {
        if (!el) return;

        // Load saved calculations
        const saved = SafeOps.getStorage('obelisk_calculator', {});

        el.innerHTML = `
            <h4 style="color:#fff;margin-bottom:16px;">🧮 Trading Calculator</h4>

            <!-- Position Size Calculator -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">📐 Position Size Calculator</h5>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
                    <div>
                        <label style="color:#888;font-size:11px;">Account Balance ($)</label>
                        <input type="number" id="calc-balance" value="10000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Risk per Trade (%)</label>
                        <input type="number" id="calc-risk" value="1" step="0.1" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Entry Price ($)</label>
                        <input type="number" id="calc-entry" value="100000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Stop Loss ($)</label>
                        <input type="number" id="calc-sl" value="98000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                </div>
                <button onclick="FastTradingModule.calculatePosition()" style="margin-top:12px;padding:10px 20px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:600;cursor:pointer;">
                    Calculate Position Size
                </button>
                <div id="calc-result" style="margin-top:12px;padding:12px;background:rgba(0,255,136,0.1);border-radius:8px;display:none;"></div>
            </div>

            <!-- PnL Calculator -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">💰 PnL Calculator</h5>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">
                    <div>
                        <label style="color:#888;font-size:11px;">Position Size ($)</label>
                        <input type="number" id="pnl-size" value="1000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Entry Price</label>
                        <input type="number" id="pnl-entry" value="100000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Exit Price</label>
                        <input type="number" id="pnl-exit" value="102000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Leverage</label>
                        <input type="number" id="pnl-leverage" value="1" min="1" max="100" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Direction</label>
                        <select id="pnl-direction" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                            <option value="long">Long</option>
                            <option value="short">Short</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Fee (%)</label>
                        <input type="number" id="pnl-fee" value="0.1" step="0.01" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                </div>
                <button onclick="FastTradingModule.calculatePnL()" style="margin-top:12px;padding:10px 20px;background:#3b82f6;border:none;border-radius:6px;color:#fff;font-weight:600;cursor:pointer;">
                    Calculate PnL
                </button>
                <div id="pnl-result" style="margin-top:12px;padding:12px;background:rgba(59,130,246,0.1);border-radius:8px;display:none;"></div>
            </div>

            <!-- Risk/Reward Calculator -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">⚖️ Risk/Reward Ratio</h5>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                    <div>
                        <label style="color:#888;font-size:11px;">Entry Price</label>
                        <input type="number" id="rr-entry" value="100000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Stop Loss</label>
                        <input type="number" id="rr-sl" value="98000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Take Profit</label>
                        <input type="number" id="rr-tp" value="106000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                </div>
                <button onclick="FastTradingModule.calculateRR()" style="margin-top:12px;padding:10px 20px;background:#f59e0b;border:none;border-radius:6px;color:#000;font-weight:600;cursor:pointer;">
                    Calculate R:R
                </button>
                <div id="rr-result" style="margin-top:12px;padding:12px;background:rgba(245,158,11,0.1);border-radius:8px;display:none;"></div>
            </div>

            <!-- Compound Calculator -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">📈 Compound Growth Calculator</h5>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">
                    <div>
                        <label style="color:#888;font-size:11px;">Starting Capital ($)</label>
                        <input type="number" id="comp-capital" value="1000" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Daily Return (%)</label>
                        <input type="number" id="comp-return" value="1" step="0.1" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Days</label>
                        <input type="number" id="comp-days" value="30" style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                </div>
                <button onclick="FastTradingModule.calculateCompound()" style="margin-top:12px;padding:10px 20px;background:#8b5cf6;border:none;border-radius:6px;color:#fff;font-weight:600;cursor:pointer;">
                    Calculate Growth
                </button>
                <div id="comp-result" style="margin-top:12px;padding:12px;background:rgba(139,92,246,0.1);border-radius:8px;display:none;"></div>
            </div>
        `;
    },

    calculatePosition() {
        const balance = parseFloat(document.getElementById('calc-balance').value) || 0;
        const riskPercent = parseFloat(document.getElementById('calc-risk').value) || 0;
        const entry = parseFloat(document.getElementById('calc-entry').value) || 0;
        const sl = parseFloat(document.getElementById('calc-sl').value) || 0;

        const riskAmount = balance * (riskPercent / 100);
        const slPercent = Math.abs((entry - sl) / entry) * 100;
        const positionSize = riskAmount / (slPercent / 100);
        const units = positionSize / entry;

        const resultEl = document.getElementById('calc-result');
        resultEl.style.display = 'block';
        resultEl.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;text-align:center;">
                <div>
                    <div style="color:#888;font-size:11px;">Position Size</div>
                    <div style="color:#00ff88;font-size:18px;font-weight:700;">$${positionSize.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;">Units</div>
                    <div style="color:#fff;font-size:18px;font-weight:700;">${units.toFixed(6)}</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;">Risk Amount</div>
                    <div style="color:#ef4444;font-size:14px;">$${riskAmount.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;">SL Distance</div>
                    <div style="color:#f59e0b;font-size:14px;">${slPercent.toFixed(2)}%</div>
                </div>
            </div>
        `;
    },

    calculatePnL() {
        const size = parseFloat(document.getElementById('pnl-size').value) || 0;
        const entry = parseFloat(document.getElementById('pnl-entry').value) || 0;
        const exit = parseFloat(document.getElementById('pnl-exit').value) || 0;
        const leverage = parseFloat(document.getElementById('pnl-leverage').value) || 1;
        const direction = document.getElementById('pnl-direction').value;
        const fee = parseFloat(document.getElementById('pnl-fee').value) || 0;

        const priceChange = ((exit - entry) / entry) * 100;
        const pnlPercent = direction === 'long' ? priceChange * leverage : -priceChange * leverage;
        const fees = size * (fee / 100) * 2; // Entry + exit
        const grossPnl = size * (pnlPercent / 100);
        const netPnl = grossPnl - fees;

        const color = netPnl >= 0 ? '#00ff88' : '#ef4444';
        const resultEl = document.getElementById('pnl-result');
        resultEl.style.display = 'block';
        resultEl.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">
                <div>
                    <div style="color:#888;font-size:11px;">Gross PnL</div>
                    <div style="color:${color};font-size:16px;font-weight:700;">${grossPnl >= 0 ? '+' : ''}$${grossPnl.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;">Fees</div>
                    <div style="color:#ef4444;font-size:16px;">-$${fees.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;">Net PnL</div>
                    <div style="color:${color};font-size:18px;font-weight:700;">${netPnl >= 0 ? '+' : ''}$${netPnl.toFixed(2)}</div>
                </div>
            </div>
            <div style="margin-top:8px;text-align:center;color:#888;font-size:11px;">
                Return: ${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}% | Price Change: ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%
            </div>
        `;
    },

    calculateRR() {
        const entry = parseFloat(document.getElementById('rr-entry').value) || 0;
        const sl = parseFloat(document.getElementById('rr-sl').value) || 0;
        const tp = parseFloat(document.getElementById('rr-tp').value) || 0;

        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);
        const ratio = reward / risk;
        const winRateBreakeven = (1 / (1 + ratio)) * 100;

        const ratioColor = ratio >= 2 ? '#00ff88' : ratio >= 1 ? '#f59e0b' : '#ef4444';
        const resultEl = document.getElementById('rr-result');
        resultEl.style.display = 'block';
        resultEl.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">
                <div>
                    <div style="color:#888;font-size:11px;">Risk</div>
                    <div style="color:#ef4444;font-size:16px;font-weight:700;">$${risk.toFixed(2)}</div>
                    <div style="color:#666;font-size:10px;">${((risk/entry)*100).toFixed(2)}%</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;">Reward</div>
                    <div style="color:#00ff88;font-size:16px;font-weight:700;">$${reward.toFixed(2)}</div>
                    <div style="color:#666;font-size:10px;">${((reward/entry)*100).toFixed(2)}%</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;">R:R Ratio</div>
                    <div style="color:${ratioColor};font-size:20px;font-weight:700;">1:${ratio.toFixed(2)}</div>
                </div>
            </div>
            <div style="margin-top:8px;text-align:center;color:#888;font-size:11px;">
                Breakeven Win Rate: ${winRateBreakeven.toFixed(1)}%
            </div>
        `;
    },

    calculateCompound() {
        const capital = parseFloat(document.getElementById('comp-capital').value) || 0;
        const dailyReturn = parseFloat(document.getElementById('comp-return').value) || 0;
        const days = parseInt(document.getElementById('comp-days').value) || 0;

        const finalCapital = capital * Math.pow(1 + dailyReturn / 100, days);
        const totalReturn = finalCapital - capital;
        const totalReturnPercent = ((finalCapital - capital) / capital) * 100;

        const resultEl = document.getElementById('comp-result');
        resultEl.style.display = 'block';
        resultEl.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">
                <div>
                    <div style="color:#888;font-size:11px;">Final Capital</div>
                    <div style="color:#00ff88;font-size:18px;font-weight:700;">$${finalCapital.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;">Total Profit</div>
                    <div style="color:#00ff88;font-size:16px;">+$${totalReturn.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;">Total Return</div>
                    <div style="color:#8b5cf6;font-size:16px;font-weight:700;">+${totalReturnPercent.toFixed(1)}%</div>
                </div>
            </div>
        `;
    },

    // ==================== TRADING JOURNAL ====================
    journalEntries: [],

    renderJournal(el) {
        if (!el) return;

        // Load journal entries
        this.journalEntries = SafeOps.getStorage('obelisk_journal', []);

        const stats = this.calculateJournalStats();

        el.innerHTML = `
            <h4 style="color:#fff;margin-bottom:16px;">📓 Trading Journal</h4>

            <!-- Stats Overview -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin-bottom:20px;">
                <div style="padding:16px;background:rgba(0,255,136,0.1);border-radius:12px;text-align:center;">
                    <div style="color:#888;font-size:11px;">Total Trades</div>
                    <div style="color:#fff;font-size:24px;font-weight:700;">${stats.total}</div>
                </div>
                <div style="padding:16px;background:rgba(0,255,136,0.1);border-radius:12px;text-align:center;">
                    <div style="color:#888;font-size:11px;">Win Rate</div>
                    <div style="color:${stats.winRate >= 50 ? '#00ff88' : '#ef4444'};font-size:24px;font-weight:700;">${stats.winRate.toFixed(1)}%</div>
                </div>
                <div style="padding:16px;background:${stats.totalPnl >= 0 ? 'rgba(0,255,136,0.1)' : 'rgba(239,68,68,0.1)'};border-radius:12px;text-align:center;">
                    <div style="color:#888;font-size:11px;">Total PnL</div>
                    <div style="color:${stats.totalPnl >= 0 ? '#00ff88' : '#ef4444'};font-size:24px;font-weight:700;">${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(2)}</div>
                </div>
                <div style="padding:16px;background:rgba(245,158,11,0.1);border-radius:12px;text-align:center;">
                    <div style="color:#888;font-size:11px;">Avg R:R</div>
                    <div style="color:#f59e0b;font-size:24px;font-weight:700;">${stats.avgRR.toFixed(2)}</div>
                </div>
                <div style="padding:16px;background:rgba(59,130,246,0.1);border-radius:12px;text-align:center;">
                    <div style="color:#888;font-size:11px;">Best Trade</div>
                    <div style="color:#00ff88;font-size:18px;font-weight:700;">+$${stats.bestTrade.toFixed(2)}</div>
                </div>
                <div style="padding:16px;background:rgba(239,68,68,0.1);border-radius:12px;text-align:center;">
                    <div style="color:#888;font-size:11px;">Worst Trade</div>
                    <div style="color:#ef4444;font-size:18px;font-weight:700;">$${stats.worstTrade.toFixed(2)}</div>
                </div>
            </div>

            <!-- Add New Trade -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h5 style="color:#fff;margin:0 0 12px;">➕ Log New Trade</h5>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">
                    <div>
                        <label style="color:#888;font-size:11px;">Pair</label>
                        <input type="text" id="journal-pair" value="BTC/USDT" style="width:100%;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Direction</label>
                        <select id="journal-direction" style="width:100%;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                            <option value="long">Long</option>
                            <option value="short">Short</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Entry Price</label>
                        <input type="number" id="journal-entry" style="width:100%;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Exit Price</label>
                        <input type="number" id="journal-exit" style="width:100%;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Size ($)</label>
                        <input type="number" id="journal-size" style="width:100%;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                    </div>
                    <div>
                        <label style="color:#888;font-size:11px;">Result</label>
                        <select id="journal-result" style="width:100%;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;">
                            <option value="win">Win</option>
                            <option value="loss">Loss</option>
                            <option value="breakeven">Breakeven</option>
                        </select>
                    </div>
                </div>
                <div style="margin-top:12px;">
                    <label style="color:#888;font-size:11px;">Notes</label>
                    <textarea id="journal-notes" rows="2" placeholder="What went well? What could improve?" style="width:100%;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;margin-top:4px;resize:none;"></textarea>
                </div>
                <button onclick="FastTradingModule.addJournalEntry()" style="margin-top:12px;padding:10px 20px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:600;cursor:pointer;">
                    Save Trade
                </button>
            </div>

            <!-- Trade History -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h5 style="color:#fff;margin:0;">📋 Trade History</h5>
                    <button onclick="FastTradingModule.exportJournal()" style="padding:6px 12px;background:rgba(255,255,255,0.1);border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;">
                        📥 Export CSV
                    </button>
                </div>
                <div style="max-height:300px;overflow-y:auto;">
                    ${this.journalEntries.length === 0 ?
                        '<div style="text-align:center;color:#888;padding:20px;">No trades logged yet. Start tracking your trades above!</div>' :
                        this.journalEntries.slice().reverse().map((trade, idx) => this.renderJournalEntry(trade, this.journalEntries.length - 1 - idx)).join('')
                    }
                </div>
            </div>
        `;
    },

    renderJournalEntry(trade, idx) {
        const pnlColor = trade.pnl >= 0 ? '#00ff88' : '#ef4444';
        const dirColor = trade.direction === 'long' ? '#00ff88' : '#ef4444';
        const resultColor = trade.result === 'win' ? '#00ff88' : trade.result === 'loss' ? '#ef4444' : '#888';

        return `
            <div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px;border-left:3px solid ${resultColor};">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div>
                        <span style="color:#fff;font-weight:600;">${trade.pair}</span>
                        <span style="color:${dirColor};font-size:11px;margin-left:8px;">${trade.direction.toUpperCase()}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:${pnlColor};font-weight:600;">${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}</span>
                        <button onclick="FastTradingModule.deleteJournalEntry(${idx})" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button>
                    </div>
                </div>
                <div style="display:flex;gap:16px;font-size:11px;color:#888;">
                    <span>Entry: $${trade.entry}</span>
                    <span>Exit: $${trade.exit}</span>
                    <span>Size: $${trade.size}</span>
                </div>
                ${trade.notes ? `<div style="margin-top:8px;font-size:11px;color:#666;font-style:italic;">"${trade.notes}"</div>` : ''}
                <div style="margin-top:4px;font-size:10px;color:#555;">${new Date(trade.date).toLocaleString()}</div>
            </div>
        `;
    },

    addJournalEntry() {
        const pair = document.getElementById('journal-pair').value;
        const direction = document.getElementById('journal-direction').value;
        const entry = parseFloat(document.getElementById('journal-entry').value) || 0;
        const exit = parseFloat(document.getElementById('journal-exit').value) || 0;
        const size = parseFloat(document.getElementById('journal-size').value) || 0;
        const result = document.getElementById('journal-result').value;
        const notes = document.getElementById('journal-notes').value;

        if (!entry || !exit || !size) {
            if (typeof showNotification === 'function') {
                showNotification('Please fill in all required fields', 'error');
            }
            return;
        }

        const priceChange = ((exit - entry) / entry) * 100;
        const pnl = direction === 'long' ? size * (priceChange / 100) : size * (-priceChange / 100);

        const trade = {
            pair,
            direction,
            entry,
            exit,
            size,
            result,
            pnl,
            notes,
            date: Date.now()
        };

        this.journalEntries.push(trade);
        SafeOps.setStorage('obelisk_journal', this.journalEntries);

        if (typeof showNotification === 'function') {
            showNotification('Trade logged successfully!', 'success');
        }

        this.renderJournal(document.getElementById('fast-tab-content'));
    },

    deleteJournalEntry(idx) {
        this.journalEntries.splice(idx, 1);
        SafeOps.setStorage('obelisk_journal', this.journalEntries);
        this.renderJournal(document.getElementById('fast-tab-content'));
    },

    calculateJournalStats() {
        if (this.journalEntries.length === 0) {
            return { total: 0, winRate: 0, totalPnl: 0, avgRR: 0, bestTrade: 0, worstTrade: 0 };
        }

        const wins = this.journalEntries.filter(t => t.result === 'win').length;
        const totalPnl = this.journalEntries.reduce((sum, t) => sum + t.pnl, 0);
        const pnls = this.journalEntries.map(t => t.pnl);
        const avgWin = this.journalEntries.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / Math.max(1, wins);
        const losses = this.journalEntries.filter(t => t.result === 'loss').length;
        const avgLoss = Math.abs(this.journalEntries.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / Math.max(1, losses));

        return {
            total: this.journalEntries.length,
            winRate: (wins / this.journalEntries.length) * 100,
            totalPnl,
            avgRR: avgLoss > 0 ? avgWin / avgLoss : 0,
            bestTrade: Math.max(...pnls, 0),
            worstTrade: Math.min(...pnls, 0)
        };
    },

    exportJournal() {
        if (this.journalEntries.length === 0) {
            if (typeof showNotification === 'function') {
                showNotification('No trades to export', 'warning');
            }
            return;
        }

        const headers = ['Date', 'Pair', 'Direction', 'Entry', 'Exit', 'Size', 'PnL', 'Result', 'Notes'];
        const rows = this.journalEntries.map(t => [
            new Date(t.date).toISOString(),
            t.pair,
            t.direction,
            t.entry,
            t.exit,
            t.size,
            t.pnl.toFixed(2),
            t.result,
            `"${t.notes || ''}"`
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trading_journal_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        if (typeof showNotification === 'function') {
            showNotification('Journal exported!', 'success');
        }
    },

    renderAcademy(el) {
        let html = `<h4 style="color:#fff;margin-bottom:16px;">📚 Fast Trading Academy</h4>`;
        html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">`;

        this.lessons.forEach(lesson => {
            html += `
                <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;cursor:pointer;transition:all 0.3s;"
                     onmouseover="this.style.borderColor='#00ff88'"
                     onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'"
                     onclick="FastTradingModule.showLesson('${lesson.id}')">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <span style="font-size:24px;">${lesson.icon}</span>
                        <span style="font-size:11px;color:#888;background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:4px;">${lesson.duration}</span>
                    </div>
                    <div style="font-weight:600;color:#fff;margin-bottom:8px;">${lesson.title}</div>
                    <ul style="margin:0;padding-left:16px;color:#888;font-size:11px;">
                        ${lesson.topics.slice(0, 3).map(t => `<li>${t}</li>`).join('')}
                        ${lesson.topics.length > 3 ? `<li style="color:#00ff88;">+${lesson.topics.length - 3} more...</li>` : ''}
                    </ul>
                </div>`;
        });

        html += `</div>`;
        el.innerHTML = html;
    },

    renderLatency(el) {
        el.innerHTML = `
            <h4 style="color:#fff;margin-bottom:16px;">📡 Exchange Latency Test</h4>
            <p style="color:#888;font-size:12px;margin-bottom:16px;">Test your connection speed to major exchanges. Lower latency = faster execution.</p>

            <button onclick="FastTradingModule.testAllLatencies('latency-results')"
                    style="padding:12px 24px;background:linear-gradient(135deg,#00ff88,#00d4aa);border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;margin-bottom:20px;">
                🔄 Run Latency Test
            </button>

            <div id="latency-results"></div>

            <div style="margin-top:20px;padding:16px;background:rgba(59,130,246,0.1);border:1px solid #3b82f633;border-radius:12px;">
                <h5 style="color:#3b82f6;margin:0 0 8px;">💡 Tips to Reduce Latency</h5>
                <ul style="margin:0;padding-left:20px;color:#888;font-size:12px;">
                    <li>Use wired ethernet instead of WiFi</li>
                    <li>Close bandwidth-heavy apps during trading</li>
                    <li>Consider a VPS in Singapore/Tokyo for Asian exchanges</li>
                    <li>Use a VPS in Virginia/New York for US exchanges</li>
                    <li>Optimal latency for fast trading: <span style="color:#00ff88;">&lt;100ms</span></li>
                </ul>
            </div>
        `;
        this.renderLatencyResults('latency-results');
    },

    renderRealtime(el) {
        el.innerHTML = `
            <h4 style="color:#fff;margin-bottom:16px;">📊 Real-Time Price Feeds</h4>
            <p style="color:#888;font-size:12px;margin-bottom:16px;">Live WebSocket connection to Binance for real-time prices.</p>

            <div style="display:flex;gap:8px;margin-bottom:20px;">
                <button onclick="FastTradingModule.connectBinanceWS(['btcusdt','ethusdt','solusdt','bnbusdt','xrpusdt']);FastTradingModule.renderRealtime(document.getElementById('fast-tab-content'))"
                        style="padding:10px 20px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">
                    ▶️ Connect
                </button>
                <button onclick="FastTradingModule.disconnectWS()"
                        style="padding:10px 20px;background:#ef4444;border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">
                    ⏹️ Disconnect
                </button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
                ${['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'].map(symbol => `
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                        <div style="color:#888;font-size:12px;margin-bottom:8px;">${symbol}</div>
                        <div id="price-${symbol}" style="color:#fff;">
                            ${this.priceFeeds[symbol] ?
                                `<span style="font-size:18px;font-weight:700;">$${this.priceFeeds[symbol].price.toLocaleString()}</span>` :
                                '<span style="color:#666;">Waiting...</span>'}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="margin-top:20px;padding:16px;background:rgba(0,255,136,0.1);border:1px solid #00ff8833;border-radius:12px;">
                <h5 style="color:#00ff88;margin:0 0 8px;">WebSocket Status</h5>
                <div style="color:#888;font-size:12px;">
                    ${this.binanceWS && this.binanceWS.readyState === 1 ?
                        '<span style="color:#00ff88;">● Connected to Binance</span>' :
                        '<span style="color:#888;">○ Disconnected</span>'}
                </div>
            </div>
        `;
    },

    renderHotkeys(el) {
        el.innerHTML = `
            <h4 style="color:#fff;margin-bottom:16px;">⌨️ Hotkey Trading</h4>
            <p style="color:#888;font-size:12px;margin-bottom:16px;">Practice keyboard-based fast execution. Essential for scalping.</p>

            <div style="display:flex;gap:8px;margin-bottom:20px;">
                <button onclick="FastTradingModule.enableHotkeyTrading()"
                        style="padding:10px 20px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">
                    ▶️ Enable Hotkeys
                </button>
                <button onclick="FastTradingModule.disableHotkeyTrading()"
                        style="padding:10px 20px;background:#ef4444;border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">
                    ⏹️ Disable
                </button>
            </div>

            <div id="hotkey-status" style="margin-bottom:20px;padding:16px;background:rgba(255,255,255,0.05);border-radius:12px;">
                <div style="text-align:center;color:#888;">Enable hotkeys to start practicing</div>
            </div>

            <h5 style="color:#fff;margin-bottom:12px;">Keyboard Shortcuts</h5>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">
                ${Object.entries(this.hotkeys).map(([key, config]) => `
                    <div style="padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;text-align:center;">
                        <div style="font-family:monospace;color:#00ff88;font-weight:700;font-size:14px;">${config.label.split(' = ')[0]}</div>
                        <div style="color:#888;font-size:11px;">${config.label.split(' = ')[1]}</div>
                    </div>
                `).join('')}
            </div>

            <div style="margin-top:20px;padding:16px;background:rgba(245,158,11,0.1);border:1px solid #f59e0b33;border-radius:12px;">
                <h5 style="color:#f59e0b;margin:0 0 8px;">⚠️ Practice Mode</h5>
                <p style="color:#888;font-size:12px;margin:0;">Hotkeys are in practice mode - no real orders will be placed. Connect your API to enable real execution.</p>
            </div>
        `;
    },

    renderApiKeys(el) {
        const exchanges = ['binance', 'bybit', 'okx', 'coinbase', 'hyperliquid'];

        el.innerHTML = `
            <h4 style="color:#fff;margin-bottom:16px;">🔑 API Key Management</h4>
            <p style="color:#888;font-size:12px;margin-bottom:16px;">Connect your exchange APIs for real fast trading execution.</p>

            <div style="display:grid;gap:12px;">
                ${exchanges.map(ex => {
                    const hasKey = this.hasApiKey(ex);
                    return `
                        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                <span style="font-weight:600;color:#fff;text-transform:capitalize;">${ex}</span>
                                <span style="font-size:11px;padding:4px 8px;border-radius:4px;${hasKey ? 'background:#00ff8822;color:#00ff88;' : 'background:#88888822;color:#888;'}">${hasKey ? '● Connected' : '○ Not connected'}</span>
                            </div>
                            ${hasKey ? `
                                <button onclick="FastTradingModule.removeApiKey('${ex}');FastTradingModule.renderApiKeys(document.getElementById('fast-tab-content'))"
                                        style="padding:8px 16px;background:#ef4444;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">
                                    Remove Key
                                </button>
                            ` : `
                                <div style="display:flex;gap:8px;">
                                    <input type="text" id="api-key-${ex}" placeholder="API Key" style="flex:1;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;font-size:12px;">
                                    <input type="password" id="api-secret-${ex}" placeholder="Secret" style="flex:1;padding:8px;background:#0a0a15;border:1px solid #333;border-radius:6px;color:#fff;font-size:12px;">
                                    <button onclick="FastTradingModule.saveApiKeyFromForm('${ex}')"
                                            style="padding:8px 16px;background:#00ff88;border:none;border-radius:6px;color:#000;font-size:12px;font-weight:600;cursor:pointer;">
                                        Save
                                    </button>
                                </div>
                            `}
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="margin-top:20px;padding:16px;background:rgba(239,68,68,0.1);border:1px solid #ef444433;border-radius:12px;">
                <h5 style="color:#ef4444;margin:0 0 8px;">⚠️ Security Warning</h5>
                <ul style="margin:0;padding-left:20px;color:#888;font-size:12px;">
                    <li>Only use API keys with <strong>trade permissions only</strong></li>
                    <li>Never enable withdrawal permissions</li>
                    <li>Use IP whitelist when possible</li>
                    <li>Keys are stored locally in your browser only</li>
                </ul>
            </div>
        `;
    },

    saveApiKeyFromForm(exchange) {
        const keyEl = document.getElementById('api-key-' + exchange);
        const secretEl = document.getElementById('api-secret-' + exchange);
        if (keyEl && secretEl && keyEl.value && secretEl.value) {
            this.saveApiKey(exchange, keyEl.value, secretEl.value);
            this.renderApiKeys(document.getElementById('fast-tab-content'));
            if (typeof showNotification === 'function') {
                showNotification(`${exchange} API key saved`, 'success');
            }
        }
    },

    renderChecklist(el) {
        const checklist = [
            { category: 'Infrastructure', items: [
                { text: 'Stable internet connection (wired preferred)', critical: true },
                { text: 'Low latency to target exchange (<200ms)', critical: true },
                { text: 'Backup internet connection', critical: false },
                { text: 'UPS/power backup', critical: false },
                { text: 'Dedicated trading computer/screen', critical: false }
            ]},
            { category: 'Account Setup', items: [
                { text: 'Exchange account verified', critical: true },
                { text: 'API keys created (trade only, no withdrawal)', critical: true },
                { text: 'IP whitelist configured', critical: false },
                { text: '2FA enabled on exchange', critical: true },
                { text: 'Sufficient trading capital deposited', critical: true }
            ]},
            { category: 'Trading Preparation', items: [
                { text: 'Trading plan written and tested', critical: true },
                { text: 'Risk management rules defined', critical: true },
                { text: 'Position sizing calculated', critical: true },
                { text: 'Hotkeys practiced in simulation', critical: false },
                { text: 'Emergency exit strategy prepared', critical: true }
            ]},
            { category: 'Tools & Monitoring', items: [
                { text: 'Real-time price feed connected', critical: false },
                { text: 'Alerts configured', critical: false },
                { text: 'Trade journal ready', critical: false },
                { text: 'Performance tracking setup', critical: false },
                { text: 'Multiple timeframe charts ready', critical: false }
            ]}
        ];

        let html = `
            <h4 style="color:#fff;margin-bottom:16px;">✅ Fast Trading Readiness Checklist</h4>
            <p style="color:#888;font-size:12px;margin-bottom:20px;">Complete this checklist before starting real fast trading.</p>
        `;

        checklist.forEach(cat => {
            html += `
                <div style="margin-bottom:20px;">
                    <h5 style="color:#00ff88;margin-bottom:12px;">${cat.category}</h5>
                    <div style="display:grid;gap:8px;">
                        ${cat.items.map((item, idx) => `
                            <label style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;cursor:pointer;">
                                <input type="checkbox" id="check-${cat.category}-${idx}" style="width:18px;height:18px;accent-color:#00ff88;">
                                <span style="color:#fff;flex:1;">${item.text}</span>
                                ${item.critical ? '<span style="font-size:10px;padding:2px 6px;background:#ef444422;color:#ef4444;border-radius:4px;">Required</span>' : ''}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        html += `
            <div style="margin-top:20px;padding:20px;background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,212,170,0.1));border:1px solid #00ff8833;border-radius:12px;text-align:center;">
                <h5 style="color:#00ff88;margin:0 0 8px;">🚀 Ready to Trade?</h5>
                <p style="color:#888;font-size:12px;margin:0 0 16px;">Once all required items are checked, you're prepared for fast trading!</p>
                <button onclick="FastTradingModule.validateChecklist()"
                        style="padding:12px 24px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">
                    Validate Checklist
                </button>
            </div>
        `;

        el.innerHTML = html;
    },

    validateChecklist() {
        const checkboxes = document.querySelectorAll('[id^="check-"]');
        const requiredLabels = document.querySelectorAll('label:has([id^="check-"]):has([style*="ef4444"])');
        let allRequiredChecked = true;

        requiredLabels.forEach(label => {
            const checkbox = label.querySelector('input[type="checkbox"]');
            if (!checkbox.checked) allRequiredChecked = false;
        });

        if (allRequiredChecked) {
            if (typeof showNotification === 'function') {
                showNotification('Congratulations! You are ready for fast trading! 🚀', 'success');
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification('Please complete all required items first', 'warning');
            }
        }
    },

    showLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const modal = document.createElement('div');
        modal.id = 'lesson-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10001;display:flex;align-items:center;justify-content:center;';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#1a1a2e,#0d0d1a);border:1px solid #333;border-radius:16px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#fff;margin:0;">${lesson.icon} ${lesson.title}</h3>
                    <button onclick="document.getElementById('lesson-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">&times;</button>
                </div>
                <div style="color:#888;font-size:12px;margin-bottom:20px;">Duration: ${lesson.duration}</div>

                <h4 style="color:#00ff88;margin-bottom:16px;">Topics Covered</h4>
                <div style="display:grid;gap:12px;">
                    ${lesson.topics.map((topic, idx) => `
                        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;">
                            <span style="background:#00ff88;color:#000;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:12px;flex-shrink:0;">${idx + 1}</span>
                            <span style="color:#fff;">${topic}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top:24px;padding:16px;background:rgba(59,130,246,0.1);border-radius:12px;">
                    <p style="color:#3b82f6;margin:0;font-size:13px;">📖 Full lesson content coming soon! Practice with the tools in other tabs.</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // ==================== STRATEGIES $1+ ====================
    fastStrategies: [
        // === $1 Strategies - Ultra micro, L2 only ===
        // REALISTIC: À $1, les frais mangent presque tout. Valeur = éducative.
        { id: 'ft-dca-1', name: '$1 DCA Express', capital: 1, chain: 'Base', type: 'DCA', risk: 1.5, estDaily: '~0%', estAPY: '0-5%', icon: '🔄', fees: '<$0.001',
          realisticNote: 'À $1, le DCA sert surtout à apprendre les mécaniques. Le profit réel sera quasi nul.',
          description: 'DCA automatique sur ETH/USDC toutes les 4h. Frais quasi nuls sur Base.',
          steps: ['Connecter wallet Base', 'Déposer $1 USDC', 'Activer DCA 4h sur ETH', 'Laisser tourner 7j+'] },
        { id: 'ft-swap-1', name: '$1 Swap Sniper', capital: 1, chain: 'Optimism', type: 'Swap', risk: 3.0, estDaily: '~0%', estAPY: '-5 à +3%', icon: '🎯', fees: '<$0.002',
          realisticNote: 'Chaque swap coûte ~$0.002. Sur $1, c\'est 0.2% de frais par trade. Difficile d\'être profitable.',
          description: 'Swap rapide sur micro-dips ETH détectés par l\'algo. Optimism pour frais minimaux.',
          steps: ['Connecter wallet OP', 'Déposer $1 USDC', 'Activer détection dips', 'Auto-swap sur signal'] },
        { id: 'ft-grid-1', name: '$1 Micro Grid', capital: 1, chain: 'Base', type: 'Grid', risk: 2.0, estDaily: '~0%', estAPY: '-3 à +5%', icon: '📊', fees: '<$0.001',
          realisticNote: 'Grid trading à $1 = apprentissage. Les gains par trade sont en fractions de centime.',
          description: 'Grid trading avec 5 niveaux sur range ETH. Accumulation passive.',
          steps: ['Définir range ±0.5%', 'Placer 5 ordres grid', 'Récolter les profits', 'Réajuster le range'] },
        // === $2 Strategies ===
        { id: 'ft-arb-2', name: '$2 L2 Arb Express', capital: 2, chain: 'Base/OP', type: 'Arbitrage', risk: 2.5, estDaily: '~0%', estAPY: '-8 à +3%', icon: '⚡', fees: '<$0.003',
          realisticNote: 'L\'arbitrage cross-chain à $2 coûte plus en frais de bridge qu\'il ne rapporte.',
          description: 'Arbitrage de prix entre DEX Base et Optimism. Profit sur les écarts >0.1%.',
          steps: ['Fonds sur Base + OP', 'Scanner les écarts', 'Exécuter swap cross-chain', 'Collecter le spread'] },
        { id: 'ft-scalp-2', name: '$2 Scalp Rapide', capital: 2, chain: 'Base', type: 'Scalp', risk: 4.0, estDaily: '~0%', estAPY: '-10 à +5%', icon: '⚔️', fees: '<$0.001',
          realisticNote: 'Scalping à $2: un gain de 0.3% = $0.006. Les frais sur 10 trades = $0.01. Marginal.',
          description: 'Scalping 1-5min sur ETH/USDC. Entrée/sortie rapide sur micro-mouvements.',
          steps: ['Surveiller chart 1m', 'Entrer sur breakout', 'TP à +0.3%', 'SL à -0.2%'] },
        // === $3 Strategies ===
        { id: 'ft-momentum-3', name: '$3 Momentum Rider', capital: 3, chain: 'Optimism', type: 'Momentum', risk: 4.5, estDaily: '~0.01%', estAPY: '-5 à +8%', icon: '🏄', fees: '<$0.002',
          realisticNote: 'Le momentum trading à $3 peut commencer à être marginalement profitable sur L2.',
          description: 'Suit le momentum 15min des top tokens L2. Entrée sur confirmation de trend.',
          steps: ['Scanner momentum 15m', 'Confirmer volume >2x', 'Entrer dans le trend', 'Trailing stop -0.5%'] },
        { id: 'ft-meanrev-3', name: '$3 Mean Reversion', capital: 3, chain: 'Base', type: 'Mean Rev', risk: 3.0, estDaily: '~0.01%', estAPY: '-3 à +8%', icon: '🎢', fees: '<$0.001',
          realisticNote: 'Mean reversion sur Base à $3: les frais sont gérables, mais les gains restent très petits.',
          description: 'Achète quand prix dévie >1% sous la moyenne mobile 1h. Revente au retour.',
          steps: ['Calculer MA 1h', 'Acheter à -1% MA', 'Vendre au retour MA', 'Max 3 trades/jour'] },
        // === $5 Strategies ===
        { id: 'ft-multi-5', name: '$5 Multi-Strat', capital: 5, chain: 'Base/OP', type: 'Multi', risk: 3.5, estDaily: '~0.02%', estAPY: '0 à +12%', icon: '🎪', fees: '<$0.005',
          realisticNote: 'À $5, les stratégies combinées commencent à avoir du sens. Premier palier viable.',
          description: 'Combine DCA + Grid + Scalp. $2 en DCA, $2 en Grid, $1 en Scalp opportuniste.',
          steps: ['Répartir: $2 DCA + $2 Grid + $1 Scalp', 'Activer DCA auto 6h', 'Grid ±0.8% ETH', 'Scalp manuel sur signal'] },
        { id: 'ft-yield-5', name: '$5 Yield Hunter', capital: 5, chain: 'Base', type: 'Yield', risk: 2.0, estDaily: '~0.01%', estAPY: '3 à +10%', icon: '🌾', fees: '<$0.001',
          realisticNote: 'Le yield farming à $5: rendements modestes mais relativement stables. APY réels des pools = 3-15%.',
          description: 'Farm les meilleurs yields DEX sur Base. Rotation automatique vers le meilleur APY.',
          steps: ['Scanner pools Base', 'Déposer dans top APY', 'Rotation hebdo', 'Compound auto'] },
        { id: 'ft-snipe-5', name: '$5 Launch Sniper', capital: 5, chain: 'Base', type: 'Snipe', risk: 8.0, estDaily: 'Variable', estAPY: '-90 à +200%', icon: '🚀', fees: '<$0.01',
          realisticNote: 'EXTRÊMEMENT RISQUÉ. 90% des token snipers perdent tout. Comparable au casino.',
          description: 'Snipe les nouveaux tokens Base dans les premières secondes. Très risqué mais potentiel élevé.',
          steps: ['Surveiller factory contracts', 'Analyser liquidity lock', 'Acheter <10s après launch', 'Vendre à +50% ou SL -30%'] },
        // === $10 Strategies ===
        { id: 'ft-pro-10', name: '$10 Pro Trader', capital: 10, chain: 'Arbitrum', type: 'Pro', risk: 5.0, estDaily: '~0.03%', estAPY: '5 à +20%', icon: '💎', fees: '<$0.02',
          realisticNote: 'À $10 sur Arbitrum, le trading devient viable. Un bon trader peut viser 10-20%/an.',
          description: 'Stratégie complète: analyse technique + scalping + swing sur Arbitrum.',
          steps: ['Analyse multi-timeframe', 'Scalp sur 5m', 'Swing sur 4h', 'Risk management strict'] },
        { id: 'ft-perp-10', name: '$10 Perp Micro', capital: 10, chain: 'Arbitrum', type: 'Perps', risk: 6.0, estDaily: '~0.04%', estAPY: '-15 à +25%', icon: '📈', fees: '<$0.03',
          realisticNote: 'Perps à levier avec $10: possible mais dangereux. La majorité des traders perps perdent de l\'argent.',
          description: 'Perpétuels avec 2x levier max sur GMX/Obelisk. Small positions, tight stops.',
          steps: ['Ouvrir perp 2x max', 'SL à -3%', 'TP à +5%', 'Max 2 positions actives'] }
    ],

    renderStrategies(content) {
        const groupedByCapital = {};
        this.fastStrategies.forEach(s => {
            const key = '$' + s.capital;
            if (!groupedByCapital[key]) groupedByCapital[key] = [];
            groupedByCapital[key].push(s);
        });

        const capitalGroups = Object.keys(groupedByCapital).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

        content.innerHTML = `
            <div style="padding:20px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
                    <div>
                        <h3 style="color:#fff;margin:0 0 8px 0;">🎯 Stratégies Fast Trading dès $1</h3>
                        <p style="color:#888;margin:0;font-size:13px;">Stratégies optimisées pour petits capitaux sur L2 (Base, Optimism, Arbitrum). Frais < $0.01.</p>
                    </div>
                    <div style="display:flex;gap:8px;">
                        ${capitalGroups.map(g => `
                            <button onclick="document.getElementById('strat-group-${g.slice(1)}').scrollIntoView({behavior:'smooth'})"
                                style="padding:6px 14px;background:rgba(0,255,136,0.15);border:1px solid rgba(0,255,136,0.3);border-radius:20px;color:#00ff88;cursor:pointer;font-size:12px;font-weight:600;">
                                ${g}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Disclaimer -->
                <div style="background:rgba(239,68,68,0.12);border:2px solid rgba(239,68,68,0.4);border-radius:12px;padding:16px;margin-bottom:20px;">
                    <div style="display:flex;align-items:flex-start;gap:12px;">
                        <span style="font-size:24px;flex-shrink:0;">⚠️</span>
                        <div>
                            <div style="color:#ef4444;font-weight:700;font-size:14px;margin-bottom:6px;">SIMULATION ÉDUCATIVE - Rendements réalistes affichés</div>
                            <p style="color:#ccc;font-size:12px;margin:0 0 8px 0;line-height:1.5;">
                                Les rendements affichés sont des <strong style="color:#fff;">estimations réalistes</strong> basées sur les conditions réelles du marché.
                                À $1-$5, l'objectif principal est <strong style="color:#fde047;">l'apprentissage</strong>, pas le profit.
                            </p>
                            <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:11px;">
                                <span style="padding:4px 10px;background:rgba(239,68,68,0.2);border-radius:6px;color:#fca5a5;">$1-$3 = Frais > Gains (éducatif)</span>
                                <span style="padding:4px 10px;background:rgba(250,204,21,0.2);border-radius:6px;color:#fde047;">$5 = Début de viabilité</span>
                                <span style="padding:4px 10px;background:rgba(34,197,94,0.2);border-radius:6px;color:#86efac;">$10+ = Trading viable</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chain info -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:24px;">
                    <div style="padding:12px;background:rgba(59,130,246,0.1);border-radius:10px;text-align:center;">
                        <div style="font-size:20px;margin-bottom:4px;">🔵</div>
                        <div style="color:#3b82f6;font-weight:600;font-size:13px;">Base</div>
                        <div style="color:#888;font-size:11px;">Frais: ~$0.001</div>
                    </div>
                    <div style="padding:12px;background:rgba(239,68,68,0.1);border-radius:10px;text-align:center;">
                        <div style="font-size:20px;margin-bottom:4px;">🔴</div>
                        <div style="color:#ef4444;font-weight:600;font-size:13px;">Optimism</div>
                        <div style="color:#888;font-size:11px;">Frais: ~$0.002</div>
                    </div>
                    <div style="padding:12px;background:rgba(99,102,241,0.1);border-radius:10px;text-align:center;">
                        <div style="font-size:20px;margin-bottom:4px;">🟣</div>
                        <div style="color:#6366f1;font-weight:600;font-size:13px;">Arbitrum</div>
                        <div style="color:#888;font-size:11px;">Frais: ~$0.02</div>
                    </div>
                </div>

                <!-- Strategy groups -->
                ${capitalGroups.map(group => `
                    <div id="strat-group-${group.slice(1)}" style="margin-bottom:32px;">
                        <h4 style="color:#00ff88;margin:0 0 16px 0;padding-bottom:8px;border-bottom:1px solid rgba(0,255,136,0.2);">
                            💰 Stratégies ${group} (${groupedByCapital[group].length} disponibles)
                        </h4>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
                            ${groupedByCapital[group].map(strat => `
                                <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;transition:all 0.2s;" onmouseenter="this.style.borderColor='rgba(0,255,136,0.3)';this.style.transform='translateY(-2px)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.08)';this.style.transform='translateY(0)'">
                                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                                        <div>
                                            <span style="font-size:24px;">${strat.icon}</span>
                                            <h5 style="color:#fff;margin:8px 0 4px 0;font-size:15px;">${strat.name}</h5>
                                            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                                                <span style="padding:2px 8px;background:rgba(0,255,136,0.15);border-radius:10px;color:#00ff88;font-size:11px;font-weight:600;">${strat.type}</span>
                                                <span style="padding:2px 8px;background:rgba(59,130,246,0.15);border-radius:10px;color:#3b82f6;font-size:11px;">${strat.chain}</span>
                                                <span style="padding:2px 8px;background:rgba(255,255,255,0.08);border-radius:10px;color:#888;font-size:11px;">Frais: ${strat.fees}</span>
                                            </div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="color:#00ff88;font-weight:700;font-size:16px;">${group}</div>
                                            <div style="color:${strat.risk >= 6 ? '#ef4444' : strat.risk >= 4 ? '#f59e0b' : '#00ff88'};font-size:11px;">Risque: ${strat.risk}/10</div>
                                        </div>
                                    </div>
                                    <p style="color:#aaa;font-size:12px;margin:0 0 12px 0;line-height:1.5;">${strat.description}</p>
                                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
                                        <div style="padding:6px 8px;background:rgba(0,0,0,0.2);border-radius:6px;">
                                            <span style="color:#888;font-size:10px;">Gain/jour:</span>
                                            <span style="color:#fde047;font-weight:600;font-size:11px;"> ${strat.estDaily}</span>
                                        </div>
                                        <div style="padding:6px 8px;background:rgba(0,0,0,0.2);border-radius:6px;">
                                            <span style="color:#888;font-size:10px;">APY réel:</span>
                                            <span style="color:${strat.estAPY.includes('-') ? '#ef4444' : '#00ff88'};font-weight:600;font-size:11px;"> ${strat.estAPY}</span>
                                        </div>
                                    </div>
                                    <div style="padding:6px 10px;background:rgba(250,204,21,0.08);border-radius:6px;margin-bottom:12px;">
                                        <p style="color:#fde047;font-size:10px;margin:0;line-height:1.4;">${strat.realisticNote}</p>
                                    </div>
                                    <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:10px;margin-bottom:12px;">
                                        <div style="color:#888;font-size:10px;text-transform:uppercase;margin-bottom:6px;">Étapes:</div>
                                        ${strat.steps.map((step, i) => `
                                            <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:4px;">
                                                <span style="color:#00ff88;font-size:11px;flex-shrink:0;">${i + 1}.</span>
                                                <span style="color:#ccc;font-size:11px;">${step}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div style="text-align:center;margin-bottom:8px;">
                                        <span style="font-size:9px;color:#f97316;background:rgba(249,115,22,0.15);padding:2px 8px;border-radius:4px;">SIMULATION ÉDUCATIVE</span>
                                    </div>
                                    <button onclick="FastTradingModule.activateStrategy('${strat.id}')"
                                        style="width:100%;padding:10px;background:linear-gradient(135deg,#00ff88,#00cc6a);border:none;border-radius:10px;color:#000;font-weight:700;cursor:pointer;font-size:13px;transition:opacity 0.2s;"
                                        onmouseenter="this.style.opacity='0.85'" onmouseleave="this.style.opacity='1'">
                                        ▶ Tester en simulation
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}

                <!-- Bottom CTA -->
                <div style="text-align:center;padding:24px;background:rgba(0,255,136,0.05);border-radius:16px;border:1px solid rgba(0,255,136,0.15);">
                    <p style="color:#fff;font-size:15px;margin:0 0 8px 0;font-weight:600;">🧪 Nouveau ? Apprenez avec $1 sur Base</p>
                    <p style="color:#888;font-size:12px;margin:0 0 16px 0;">À $1, l'objectif est d'apprendre les mécaniques du trading DeFi sans risque financier réel. Base offre les frais les plus bas (~$0.001/tx).</p>
                    <button onclick="FastTradingModule.activateStrategy('ft-dca-1')"
                        style="padding:12px 32px;background:linear-gradient(135deg,#00ff88,#00cc6a);border:none;border-radius:12px;color:#000;font-weight:700;cursor:pointer;font-size:14px;">
                        📚 Apprendre avec $1 DCA Express (Simulation)
                    </button>
                </div>
            </div>
        `;
    },

    activateStrategy(stratId) {
        const strat = this.fastStrategies.find(s => s.id === stratId);
        if (!strat) return;

        // Check wallet connection
        if (!this.walletState.connected) {
            if (typeof showNotification === 'function') {
                showNotification('Connectez votre wallet pour activer une stratégie', 'warning');
            }
            this.showTab('dex');
            return;
        }

        // Check balance
        if (this.walletState.balance < strat.capital * 0.001) {
            if (typeof showNotification === 'function') {
                showNotification(`Solde insuffisant. Cette stratégie nécessite $${strat.capital} minimum.`, 'error');
            }
            return;
        }

        // Show activation confirmation
        const existing = document.getElementById('strat-activation-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'strat-activation-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(0,255,136,0.3);border-radius:20px;padding:32px;max-width:440px;width:90%;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#fff;margin:0;">${strat.icon} Activer ${strat.name}</h3>
                    <button onclick="document.getElementById('strat-activation-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">&times;</button>
                </div>
                <div style="display:grid;gap:12px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;">
                        <span style="color:#888;">Capital requis</span>
                        <span style="color:#00ff88;font-weight:600;">$${strat.capital}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;">
                        <span style="color:#888;">Chain</span>
                        <span style="color:#3b82f6;font-weight:600;">${strat.chain}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;">
                        <span style="color:#888;">Risque</span>
                        <span style="color:${strat.risk >= 6 ? '#ef4444' : strat.risk >= 4 ? '#f59e0b' : '#00ff88'};font-weight:600;">${strat.risk}/10</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;">
                        <span style="color:#888;">Est. journalier</span>
                        <span style="color:#00ff88;font-weight:600;">${strat.estDaily}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;">
                        <span style="color:#888;">Frais estimés</span>
                        <span style="color:#fff;">${strat.fees}/tx</span>
                    </div>
                </div>
                <div style="padding:12px;background:rgba(250,204,21,0.1);border-radius:10px;margin-bottom:20px;">
                    <p style="color:#facc15;margin:0;font-size:11px;">⚠️ Mode simulé. Les trades seront exécutés virtuellement. Passez en mode Live pour des transactions réelles.</p>
                </div>
                <div style="display:flex;gap:12px;">
                    <button onclick="document.getElementById('strat-activation-modal').remove()"
                        style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:none;border-radius:10px;color:#fff;cursor:pointer;font-weight:600;">
                        Annuler
                    </button>
                    <button onclick="FastTradingModule.confirmActivation('${strat.id}')"
                        style="flex:1;padding:12px;background:linear-gradient(135deg,#00ff88,#00cc6a);border:none;border-radius:10px;color:#000;font-weight:700;cursor:pointer;">
                        ✅ Confirmer
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    confirmActivation(stratId) {
        const strat = this.fastStrategies.find(s => s.id === stratId);
        if (!strat) return;

        // Remove modal
        const modal = document.getElementById('strat-activation-modal');
        if (modal) modal.remove();

        // Store active strategy
        if (!this.activeStrategies) this.activeStrategies = [];
        if (this.activeStrategies.find(s => s.id === stratId)) {
            if (typeof showNotification === 'function') {
                showNotification(`${strat.name} est déjà active`, 'info');
            }
            return;
        }

        this.activeStrategies.push({
            id: stratId,
            name: strat.name,
            capital: strat.capital,
            activatedAt: Date.now(),
            status: 'running',
            pnl: 0
        });

        if (typeof showNotification === 'function') {
            showNotification(`✅ ${strat.name} activée ! Capital: $${strat.capital}`, 'success');
        }

        console.log(`[FastTrading] Strategy activated: ${strat.name} ($${strat.capital})`);

        // Refresh the strategies view
        const content = document.getElementById('fast-tab-content');
        if (content && document.getElementById('tab-strategies')?.classList.contains('active')) {
            this.renderStrategies(content);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => FastTradingModule.init());
console.log('[FastTrading] Module loaded');
