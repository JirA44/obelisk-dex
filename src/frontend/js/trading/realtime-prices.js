/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║   OBELISK REALTIME PRICES - Multi-DEX Aggregator                         ║
 * ║   Live prices from: Hyperliquid | dYdX | Uniswap                         ║
 * ║   Full Performance Metrics: API, Render, Network, Page Load              ║
 * ║   Version: 2.1.0 - Collapsible panels                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

const RealtimePrices = {
    // Config - Offline mode (uses PriceService)
    config: {
        offlineMode: true,        // No external API calls
        updateInterval: 5000,     // Sync with PriceService every 5s
        chartInterval: 50,        // Chart updates every 50ms
        maxDataPoints: 500,       // Max candles in memory
    },

    // State
    state: {
        prices: {},
        priceHistory: {},
        arbitrage: [],
        lastUpdate: 0,
        connected: false,
        subscribers: new Set(),
        // Performance Metrics (all in ms)
        metrics: {
            // Page Performance
            pageLoadTime: 0,          // Time to load page
            domReadyTime: 0,          // DOM ready time

            // API Performance
            apiLatency: 0,            // Current API response time
            apiLatencyAvg: 0,         // Average API latency
            apiLatencyMin: Infinity,  // Best API latency
            apiLatencyMax: 0,         // Worst API latency
            apiCalls: 0,              // Total API calls

            // Price Performance
            priceUpdateRate: 0,       // ms between price updates
            pps: 0,                   // Prices per second
            priceUpdates: [],         // Timestamps for PPS calc

            // Chart Performance
            chartFps: 0,              // Chart frames per second
            chartRenderTime: 0,       // Time to render chart
            chartFrames: [],          // Frame timestamps for FPS

            // Network Performance
            networkRtt: 0,            // Round-trip time estimate
            downloadSpeed: 0,         // Estimated download speed

            // Timestamps
            lastApiCall: 0,
            lastPriceUpdate: 0,
            lastChartRender: 0,
            startTime: Date.now(),
        }
    },

    // Chart data
    charts: {},

    /**
     * Initialize realtime price feed
     */
    async init() {
        console.log('🔴 Initializing Realtime Price Feed...');

        // Measure page load time
        this.measurePagePerformance();

        // Fetch initial prices
        await this.fetchPrices();

        // Start update loops
        this.startPriceLoop();
        // this.startArbitrageLoop(); // Disabled - API endpoint doesn't exist
        this.startMetricsLoop();

        // Mark as connected
        this.state.connected = true;

        console.log('🟢 Realtime Price Feed active!');
        this.showPerformancePanel();

        return this;
    },

    /**
     * Measure page load performance
     */
    measurePagePerformance() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const metrics = this.state.metrics;

            // Wait for load complete
            if (timing.loadEventEnd > 0) {
                metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                metrics.domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
            } else {
                // Measure on next tick if not ready
                setTimeout(() => this.measurePagePerformance(), 100);
            }
        }

        // Also use newer Performance API if available
        if (window.performance && window.performance.getEntriesByType) {
            const navEntries = window.performance.getEntriesByType('navigation');
            if (navEntries.length > 0) {
                const nav = navEntries[0];
                this.state.metrics.pageLoadTime = Math.round(nav.loadEventEnd);
                this.state.metrics.domReadyTime = Math.round(nav.domContentLoadedEventEnd);
            }
        }
    },

    /**
     * Fetch prices from PriceService (offline mode)
     */
    async fetchPrices() {
        const metrics = this.state.metrics;
        const fetchStart = performance.now();
        metrics.lastApiCall = Date.now();

        try {
            // Use PriceService instead of external API
            if (typeof PriceService === 'undefined' || !PriceService.priceCache) {
                console.log('[RealtimePrices] Waiting for PriceService...');
                return;
            }

            const fetchEnd = performance.now();
            const latency = fetchEnd - fetchStart;
            metrics.apiLatency = latency;
            metrics.apiCalls++;
            metrics.apiLatencyMin = Math.min(metrics.apiLatencyMin, latency);
            metrics.apiLatencyMax = Math.max(metrics.apiLatencyMax, latency);
            metrics.apiLatencyAvg = metrics.apiLatencyAvg === 0 ? latency : (metrics.apiLatencyAvg * 0.9 + latency * 0.1);
            metrics.networkRtt = 1; // Simulated - local data

            const priceCache = PriceService.priceCache;
            const now = Date.now();

            if (Object.keys(priceCache).length > 0) {
                // Calculate price update rate
                if (metrics.lastPriceUpdate > 0) {
                    metrics.priceUpdateRate = now - metrics.lastPriceUpdate;
                }
                metrics.lastPriceUpdate = now;

                // Update PPS counter
                metrics.priceUpdates.push(now);
                const oneSecondAgo = now - 1000;
                metrics.priceUpdates = metrics.priceUpdates.filter(t => t > oneSecondAgo);
                metrics.pps = metrics.priceUpdates.length;
                metrics.downloadSpeed = 1000000; // Simulated - instant local

                Object.entries(priceCache).forEach(([coin, data]) => {
                    const oldPrice = this.state.prices[coin]?.price || data.price;

                    this.state.prices[coin] = {
                        price: data.price,
                        change24h: data.change24h,
                        source: 'PriceService',
                        spread: 0.1,
                        timestamp: now,
                        direction: data.price > oldPrice ? 'up' : data.price < oldPrice ? 'down' : 'neutral'
                    };

                    // Add to history for charts
                    if (!this.state.priceHistory[coin]) {
                        this.state.priceHistory[coin] = [];
                    }
                    this.state.priceHistory[coin].push({
                        time: now,
                        price: data.price
                    });

                    // Limit history size
                    if (this.state.priceHistory[coin].length > this.config.maxDataPoints) {
                        this.state.priceHistory[coin].shift();
                    }
                });

                this.state.lastUpdate = now;
                this.notifySubscribers('prices', this.state.prices);
            }
        } catch (error) {
            console.error('Price fetch error:', error);
            metrics.apiLatency = -1; // Error indicator
        }
    },

    /**
     * Start metrics display update loop
     */
    startMetricsLoop() {
        setInterval(() => {
            this.updateMetricsDisplay();
        }, 100); // Update display every 100ms
    },

    /**
     * Update metrics display in UI
     */
    updateMetricsDisplay() {
        const m = this.state.metrics;

        // Update last update time in header
        const updateTimeEl = document.getElementById('update-time');
        if (updateTimeEl && this.state.lastUpdate > 0) {
            const now = new Date(this.state.lastUpdate);
            updateTimeEl.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }

        // Update each metric element if it exists
        const updates = {
            'metric-page-load': `${Math.round(m.pageLoadTime)}ms`,
            'metric-dom-ready': `${Math.round(m.domReadyTime)}ms`,
            'metric-api-latency': `${Math.round(m.apiLatency)}ms`,
            'metric-api-avg': `${Math.round(m.apiLatencyAvg)}ms`,
            'metric-api-min': `${m.apiLatencyMin === Infinity ? '--' : Math.round(m.apiLatencyMin)}ms`,
            'metric-api-max': `${Math.round(m.apiLatencyMax)}ms`,
            'metric-pps': `${m.pps} PPS`,
            'metric-update-rate': `${Math.round(m.priceUpdateRate)}ms`,
            'metric-chart-fps': `${Math.round(m.chartFps)} FPS`,
            'metric-chart-render': `${m.chartRenderTime.toFixed(1)}ms`,
            'metric-network-rtt': `${Math.round(m.networkRtt)}ms`,
            'metric-download': `${(m.downloadSpeed / 1024).toFixed(1)} KB/s`,
            'metric-api-calls': `${m.apiCalls}`,
            'metric-uptime': `${Math.round((Date.now() - m.startTime) / 1000)}s`,
        };

        for (const [id, value] of Object.entries(updates)) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
                // Color coding based on performance
                this.colorCodeMetric(el, id, value);
            }
        }
    },

    /**
     * Color code metrics based on performance
     */
    colorCodeMetric(el, id, value) {
        const num = parseFloat(value);

        if (id.includes('api-latency') || id.includes('api-avg')) {
            if (num < 100) el.style.color = '#00ff88';
            else if (num < 300) el.style.color = '#ffaa00';
            else el.style.color = '#ff4444';
        }
        else if (id.includes('pps')) {
            if (num >= 2) el.style.color = '#00ff88';
            else if (num >= 1) el.style.color = '#ffaa00';
            else el.style.color = '#ff4444';
        }
        else if (id.includes('chart-fps')) {
            if (num >= 30) el.style.color = '#00ff88';
            else if (num >= 15) el.style.color = '#ffaa00';
            else el.style.color = '#ff4444';
        }
        else if (id.includes('network-rtt')) {
            if (num < 50) el.style.color = '#00ff88';
            else if (num < 150) el.style.color = '#ffaa00';
            else el.style.color = '#ff4444';
        }
    },

    /**
     * Generate simulated arbitrage opportunities (offline mode)
     */
    async fetchArbitrage() {
        // Simulate arbitrage opportunities
        const pairs = ['BTC', 'ETH', 'SOL', 'ARB'];
        const dexes = ['Uniswap', 'SushiSwap', 'Curve', 'Balancer'];

        this.state.arbitrage = pairs.slice(0, 2).map(pair => ({
            pair: `${pair}/USDC`,
            buyDex: dexes[Math.floor(Math.random() * dexes.length)],
            sellDex: dexes[Math.floor(Math.random() * dexes.length)],
            spread: (Math.random() * 0.5 + 0.1).toFixed(2) + '%',
            profit: '$' + (Math.random() * 50 + 10).toFixed(2)
        }));

        this.notifySubscribers('arbitrage', this.state.arbitrage);
    },

    /**
     * Start price update loop
     */
    startPriceLoop() {
        setInterval(() => this.fetchPrices(), this.config.updateInterval);
    },

    /**
     * Start arbitrage update loop (every 5 seconds)
     */
    startArbitrageLoop() {
        this.fetchArbitrage();
        setInterval(() => this.fetchArbitrage(), 5000);
    },

    /**
     * Subscribe to price updates
     */
    subscribe(callback) {
        this.state.subscribers.add(callback);
        return () => this.state.subscribers.delete(callback);
    },

    /**
     * Notify all subscribers
     */
    notifySubscribers(type, data) {
        this.state.subscribers.forEach(callback => {
            try {
                callback(type, data);
            } catch (e) {
                console.warn('Subscriber callback error (ObeliskApp may not be ready):', e.message);
            }
        });
    },

    /**
     * Get current price for a coin
     */
    getPrice(coin) {
        return this.state.prices[coin]?.price || 0;
    },

    /**
     * Get price history for charts
     */
    getHistory(coin, limit = 100) {
        const history = this.state.priceHistory[coin] || [];
        return history.slice(-limit);
    },

    /**
     * Get top movers
     */
    getTopMovers(limit = 10) {
        return Object.entries(this.state.prices)
            .map(([coin, data]) => ({ coin, ...data }))
            .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
            .slice(0, limit);
    },

    /**
     * Get arbitrage opportunities
     */
    getArbitrageOpportunities() {
        return this.state.arbitrage;
    },

    /**
     * Show comprehensive performance panel
     */
    showPerformancePanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-panel';
        panel.innerHTML = `
            <div id="obelisk-live-panel" style="
                position: fixed;
                top: 100px;
                right: 10px;
                background: linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0f0f2a 100%);
                border: 1px solid #4a2c8a;
                border-radius: 12px;
                padding: 10px 14px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 9px;
                color: #fff;
                z-index: 300;
                min-width: 240px;
                box-shadow: 0 4px 24px rgba(138, 43, 226, 0.4), 0 0 40px rgba(0, 170, 255, 0.15);
            ">
                <!-- Header - Draggable -->
                <div id="obelisk-live-header" style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(138, 43, 226, 0.3);
                    cursor: move;
                ">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="
                            width: 8px;
                            height: 8px;
                            background: linear-gradient(135deg, #00aaff, #8a2be2);
                            border-radius: 50%;
                            animation: pulse 1s infinite;
                            box-shadow: 0 0 10px #00aaff;
                        "></span>
                        <span style="color: #00aaff; font-weight: bold; font-size: 12px;">OBELISK LIVE</span>
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button id="obelisk-live-toggle" onclick="toggleObeliskLive()" style="
                            background: rgba(138, 43, 226, 0.3);
                            border: 1px solid #8a2be2;
                            color: #fff;
                            width: 20px;
                            height: 20px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                        ">−</button>
                        <button id="obelisk-live-close" onclick="closeObeliskLive()" style="
                            background: rgba(255, 68, 68, 0.3);
                            border: 1px solid #ff4444;
                            color: #ff4444;
                            width: 20px;
                            height: 20px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                            font-weight: bold;
                        ">✕</button>
                    </div>
                </div>

                <!-- Main Metrics Grid -->
                <div id="obelisk-live-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px;">

                    <!-- Price Metrics -->
                    <div style="grid-column: span 2; color: #00aaff; font-weight: bold; margin-top: 4px; font-size: 9px;">
                        PRIX EN TEMPS RÉEL
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">PPS:</span>
                        <span id="metric-pps" style="color: #00ff88; font-weight: bold;">0 PPS</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">Refresh:</span>
                        <span id="metric-update-rate" style="color: #00aaff;">--ms</span>
                    </div>

                    <!-- API Metrics -->
                    <div style="grid-column: span 2; color: #8a2be2; font-weight: bold; margin-top: 8px; font-size: 9px;">
                        API LATENCY
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">Current:</span>
                        <span id="metric-api-latency" style="color: #00ff88;">--ms</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">Average:</span>
                        <span id="metric-api-avg" style="color: #00aaff;">--ms</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">Min:</span>
                        <span id="metric-api-min" style="color: #00ff88;">--ms</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">Max:</span>
                        <span id="metric-api-max" style="color: #ffaa00;">--ms</span>
                    </div>

                    <!-- Chart Metrics -->
                    <div style="grid-column: span 2; color: #00ff88; font-weight: bold; margin-top: 8px; font-size: 9px;">
                        CHART RENDER
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">FPS:</span>
                        <span id="metric-chart-fps" style="color: #00ff88;">0 FPS</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">Render:</span>
                        <span id="metric-chart-render" style="color: #00aaff;">--ms</span>
                    </div>

                    <!-- Network Metrics -->
                    <div style="grid-column: span 2; color: #ffaa00; font-weight: bold; margin-top: 8px; font-size: 9px;">
                        NETWORK
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">RTT:</span>
                        <span id="metric-network-rtt" style="color: #00aaff;">--ms</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">Speed:</span>
                        <span id="metric-download" style="color: #00ff88;">-- KB/s</span>
                    </div>

                    <!-- Page Metrics -->
                    <div style="grid-column: span 2; color: #ff6b9d; font-weight: bold; margin-top: 8px; font-size: 9px;">
                        PAGE LOAD
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">Total:</span>
                        <span id="metric-page-load" style="color: #00aaff;">--ms</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">DOM:</span>
                        <span id="metric-dom-ready" style="color: #00ff88;">--ms</span>
                    </div>

                    <!-- Stats -->
                    <div style="grid-column: span 2; border-top: 1px solid rgba(138, 43, 226, 0.2); margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between;">
                        <span style="color: #555;">Calls: <span id="metric-api-calls" style="color: #888;">0</span></span>
                        <span style="color: #555;">Uptime: <span id="metric-uptime" style="color: #888;">0s</span></span>
                    </div>
                </div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; box-shadow: 0 0 10px #00aaff; }
                    50% { opacity: 0.6; box-shadow: 0 0 20px #8a2be2; }
                }
            </style>
        `;
        document.body.appendChild(panel);

        // Add toggle function to window
        window.closeObeliskLive = function() {
            const panel = document.getElementById('obelisk-live-panel');
            if (panel) {
                panel.style.display = 'none';
                localStorage.setItem('obelisk_live_closed', 'true');
            }
        };

        // Restore closed state
        if (localStorage.getItem('obelisk_live_closed') === 'true') {
            const panel = document.getElementById('obelisk-live-panel');
            if (panel) panel.style.display = 'none';
        }

        window.toggleObeliskLive = function() {
            const content = document.getElementById('obelisk-live-content');
            const btn = document.getElementById('obelisk-live-toggle');
            const header = document.getElementById('obelisk-live-header');
            if (content && btn) {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'grid' : 'none';
                btn.textContent = isHidden ? '−' : '+';
                header.style.marginBottom = isHidden ? '10px' : '0';
                header.style.paddingBottom = isHidden ? '8px' : '0';
                header.style.borderBottom = isHidden ? '1px solid rgba(138, 43, 226, 0.3)' : 'none';
                localStorage.setItem('obelisk_live_collapsed', !isHidden);
            }
        };

        // Make panel draggable
        const livePanel = document.getElementById('obelisk-live-panel');
        const liveHeader = document.getElementById('obelisk-live-header');
        if (livePanel && liveHeader) {
            let isDragging = false;
            let offsetX = 0, offsetY = 0;

            // Load saved position
            const savedPos = localStorage.getItem('obelisk_live_pos');
            if (savedPos) {
                try {
                    const pos = JSON.parse(savedPos);
                    livePanel.style.top = pos.top + 'px';
                    livePanel.style.left = pos.left + 'px';
                    livePanel.style.right = 'auto';
                } catch(e) {}
            }

            liveHeader.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON') return;
                isDragging = true;
                offsetX = e.clientX - livePanel.getBoundingClientRect().left;
                offsetY = e.clientY - livePanel.getBoundingClientRect().top;
                livePanel.style.right = 'auto';
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const x = Math.max(0, Math.min(window.innerWidth - livePanel.offsetWidth, e.clientX - offsetX));
                const y = Math.max(0, Math.min(window.innerHeight - livePanel.offsetHeight, e.clientY - offsetY));
                livePanel.style.left = x + 'px';
                livePanel.style.top = y + 'px';
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    // Save position
                    localStorage.setItem('obelisk_live_pos', JSON.stringify({
                        top: parseInt(livePanel.style.top),
                        left: parseInt(livePanel.style.left)
                    }));
                }
            });
        }

        // Restore collapsed state
        if (localStorage.getItem('obelisk_live_collapsed') === 'true') {
            setTimeout(() => window.toggleObeliskLive(), 100);
        }
    },

    /**
     * Create live chart for a coin - Blue to Violet gradient with FPS tracking
     */
    createChart(containerId, coin, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const width = options.width || container.clientWidth || 800;
        const height = options.height || 300;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const metrics = this.state.metrics;

        const chart = {
            coin,
            canvas,
            ctx,
            width,
            height,
            data: [],
            running: true
        };

        // Start chart update loop with FPS tracking
        const updateChart = () => {
            if (!chart.running) return;

            const frameStart = performance.now();

            const history = this.getHistory(coin, window.obeliskZoom || 100);
            if (history.length < 2) {
                requestAnimationFrame(updateChart);
                return;
            }

            // Clear canvas with dark gradient
            const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
            bgGradient.addColorStop(0, '#0a0a1a');
            bgGradient.addColorStop(0.5, '#0f0f25');
            bgGradient.addColorStop(1, '#0a0a1a');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            // Calculate price range
            const prices = history.map(h => h.price);
            const minPrice = Math.min(...prices) * 0.9999;
            const maxPrice = Math.max(...prices) * 1.0001;
            const priceRange = maxPrice - minPrice || 1;

            // Draw grid with purple tint
            ctx.strokeStyle = 'rgba(138, 43, 226, 0.15)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const y = (height / 5) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw price area - BLUE to VIOLET gradient
            const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
            areaGradient.addColorStop(0, 'rgba(0, 170, 255, 0.4)');
            areaGradient.addColorStop(0.5, 'rgba(100, 100, 255, 0.2)');
            areaGradient.addColorStop(1, 'rgba(138, 43, 226, 0.05)');

            ctx.beginPath();
            ctx.moveTo(0, height);

            history.forEach((point, i) => {
                const x = (i / (history.length - 1)) * width;
                const y = height - ((point.price - minPrice) / priceRange) * height;
                ctx.lineTo(x, y);
            });

            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fillStyle = areaGradient;
            ctx.fill();

            // Draw main line - Blue to Violet gradient stroke
            const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
            lineGradient.addColorStop(0, '#00aaff');
            lineGradient.addColorStop(0.5, '#6666ff');
            lineGradient.addColorStop(1, '#8a2be2');

            ctx.beginPath();
            history.forEach((point, i) => {
                const x = (i / (history.length - 1)) * width;
                const y = height - ((point.price - minPrice) / priceRange) * height;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Glow effect
            ctx.shadowColor = '#00aaff';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw current price point with glow
            const currentPrice = prices[prices.length - 1];
            const priceY = height - ((currentPrice - minPrice) / priceRange) * height;

            // Outer glow
            ctx.beginPath();
            ctx.arc(width - 5, priceY, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
            ctx.fill();

            // Inner dot
            ctx.beginPath();
            ctx.arc(width - 5, priceY, 4, 0, Math.PI * 2);
            const dotGradient = ctx.createRadialGradient(width - 5, priceY, 0, width - 5, priceY, 4);
            dotGradient.addColorStop(0, '#ffffff');
            dotGradient.addColorStop(1, '#8a2be2');
            ctx.fillStyle = dotGradient;
            ctx.fill();

            // Price label with background
            const priceText = `$${currentPrice.toLocaleString()}`;
            ctx.font = 'bold 14px JetBrains Mono';
            const textWidth = ctx.measureText(priceText).width;

            ctx.fillStyle = 'rgba(10, 10, 26, 0.8)';
            ctx.fillRect(width - textWidth - 25, priceY - 24, textWidth + 10, 20);
            ctx.strokeStyle = '#8a2be2';
            ctx.lineWidth = 1;
            ctx.strokeRect(width - textWidth - 25, priceY - 24, textWidth + 10, 20);

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(priceText, width - 20, priceY - 10);

            // Coin name with gradient
            ctx.font = 'bold 16px JetBrains Mono';
            ctx.textAlign = 'left';
            const coinGradient = ctx.createLinearGradient(10, 0, 100, 0);
            coinGradient.addColorStop(0, '#00aaff');
            coinGradient.addColorStop(1, '#8a2be2');
            ctx.fillStyle = coinGradient;
            ctx.fillText(`${coin}/USDC`, 10, 25);

            // Source badge
            const priceData = this.state.prices[coin];
            if (priceData) {
                ctx.font = '10px JetBrains Mono';
                ctx.fillStyle = priceData.source === 'Hyperliquid' ? '#00aaff' : '#8a2be2';
                ctx.fillText(priceData.source, 10, 45);
            }

            // Performance metrics on chart
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'right';

            // API Latency
            const latencyColor = metrics.apiLatency < 100 ? '#00ff88' : metrics.apiLatency < 300 ? '#ffaa00' : '#ff4444';
            ctx.fillStyle = latencyColor;
            ctx.fillText(`API: ${Math.round(metrics.apiLatency)}ms`, width - 10, 18);

            // PPS
            const ppsColor = metrics.pps >= 2 ? '#00ff88' : metrics.pps >= 1 ? '#ffaa00' : '#ff4444';
            ctx.fillStyle = ppsColor;
            ctx.fillText(`${metrics.pps} PPS`, width - 10, 32);

            // FPS
            const fpsColor = metrics.chartFps >= 30 ? '#00ff88' : metrics.chartFps >= 15 ? '#ffaa00' : '#ff4444';
            ctx.fillStyle = fpsColor;
            ctx.fillText(`${Math.round(metrics.chartFps)} FPS`, width - 10, 46);

            // Calculate render time and FPS
            const frameEnd = performance.now();
            metrics.chartRenderTime = frameEnd - frameStart;
            metrics.lastChartRender = Date.now();

            // Track frames for FPS calculation
            metrics.chartFrames.push(Date.now());
            const oneSecAgo = Date.now() - 1000;
            metrics.chartFrames = metrics.chartFrames.filter(t => t > oneSecAgo);
            metrics.chartFps = metrics.chartFrames.length;

            requestAnimationFrame(updateChart);
        };

        updateChart();
        this.charts[coin] = chart;

        return chart;
    },

    /**
     * Stop chart updates
     */
    destroyChart(coin) {
        if (this.charts[coin]) {
            this.charts[coin].running = false;
            delete this.charts[coin];
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RealtimePrices.init());
} else {
    RealtimePrices.init();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtimePrices;
}

// Zoom control for Obelisk chart
window.obeliskZoom = 100; // Default 100 data points

window.zoomObeliskChart = function(direction) {
    if (direction === 'in') {
        window.obeliskZoom = Math.max(20, window.obeliskZoom - 20);
    } else if (direction === 'out') {
        window.obeliskZoom = Math.min(500, window.obeliskZoom + 50);
    }
    console.log('[Obelisk] Zoom level:', window.obeliskZoom, 'points');
    
    // Update zoom display
    const zoomDisplay = document.getElementById('zoom-level');
    if (zoomDisplay) zoomDisplay.textContent = window.obeliskZoom + ' pts';
};

// Add zoom controls to chart container
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer && !document.getElementById('zoom-controls')) {
            const zoomDiv = document.createElement('div');
            zoomDiv.id = 'zoom-controls';
            zoomDiv.style.cssText = 'position:absolute;top:60px;right:10px;z-index:100;display:flex;gap:4px;background:rgba(0,0,0,0.7);padding:6px 10px;border-radius:8px;border:1px solid rgba(138,43,226,0.4);';
            zoomDiv.innerHTML = '<button onclick="zoomObeliskChart(\'in\')" style="background:#8a2be2;border:none;color:#fff;width:28px;height:28px;border-radius:4px;cursor:pointer;font-size:16px;font-weight:bold;">+</button><span id="zoom-level" style="color:#00ff88;font-size:11px;padding:0 8px;align-self:center;">100 pts</span><button onclick="zoomObeliskChart(\'out\')" style="background:#8a2be2;border:none;color:#fff;width:28px;height:28px;border-radius:4px;cursor:pointer;font-size:16px;font-weight:bold;">−</button>';
            chartContainer.style.position = 'relative';
            chartContainer.appendChild(zoomDiv);
        }
    }, 2000);
});
