// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - TRADINGVIEW LIGHTWEIGHT CHARTS
// Professional charting with TradingView's Lightweight Charts library
// ═══════════════════════════════════════════════════════════════════════════════

const ObeliskCharts = {
    // Chart instances
    charts: {},

    // Theme configuration matching Obelisk's Forerunner theme
    theme: {
        background: '#000000',
        textColor: '#e8e4d9',
        gridColor: 'rgba(201, 162, 39, 0.1)',
        borderColor: 'rgba(201, 162, 39, 0.3)',
        crosshairColor: '#c9a227',
        upColor: '#00d4ff',      // Cyan for bullish
        downColor: '#ff4444',    // Red for bearish
        wickUpColor: '#00b8e6',
        wickDownColor: '#cc3333',
        volumeUpColor: 'rgba(0, 212, 255, 0.5)',
        volumeDownColor: 'rgba(255, 68, 68, 0.5)',
        lineColor: '#c9a227'     // Forerunner gold
    },

    // CDN URL for TradingView Lightweight Charts
    cdnUrl: 'https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js',

    // Library loaded state
    isLoaded: false,

    /**
     * Initialize the charts module
     */
    async init() {
        console.log('[ObeliskCharts] Initializing...');

        // Load TradingView Lightweight Charts if not already loaded
        if (typeof LightweightCharts === 'undefined') {
            await this.loadLibrary();
        }

        this.isLoaded = true;
        console.log('[ObeliskCharts] Ready');
        return true;
    },

    /**
     * Dynamically load the TradingView library
     */
    loadLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof LightweightCharts !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = this.cdnUrl;
            script.async = true;
            script.onload = () => {
                console.log('[ObeliskCharts] Library loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('[ObeliskCharts] Failed to load library');
                reject(new Error('Failed to load TradingView Lightweight Charts'));
            };
            document.head.appendChild(script);
        });
    },

    /**
     * Create a candlestick chart
     * @param {string} containerId - DOM element ID
     * @param {object} options - Chart options
     */
    createCandlestickChart(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[ObeliskCharts] Container #${containerId} not found`);
            return null;
        }

        // Clear existing chart
        if (this.charts[containerId]) {
            this.charts[containerId].chart.remove();
        }

        const chartOptions = {
            layout: {
                background: { type: 'solid', color: this.theme.background },
                textColor: this.theme.textColor,
                fontFamily: "'Inter', sans-serif"
            },
            grid: {
                vertLines: { color: this.theme.gridColor },
                horzLines: { color: this.theme.gridColor }
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: {
                    color: this.theme.crosshairColor,
                    width: 1,
                    style: LightweightCharts.LineStyle.Dashed,
                    labelBackgroundColor: this.theme.crosshairColor
                },
                horzLine: {
                    color: this.theme.crosshairColor,
                    width: 1,
                    style: LightweightCharts.LineStyle.Dashed,
                    labelBackgroundColor: this.theme.crosshairColor
                }
            },
            rightPriceScale: {
                borderColor: this.theme.borderColor,
                scaleMargins: { top: 0.1, bottom: 0.2 }
            },
            timeScale: {
                borderColor: this.theme.borderColor,
                timeVisible: true,
                secondsVisible: false
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true
            },
            ...options
        };

        const chart = LightweightCharts.createChart(container, chartOptions);

        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: this.theme.upColor,
            downColor: this.theme.downColor,
            borderUpColor: this.theme.upColor,
            borderDownColor: this.theme.downColor,
            wickUpColor: this.theme.wickUpColor,
            wickDownColor: this.theme.wickDownColor
        });

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
            scaleMargins: { top: 0.8, bottom: 0 }
        });

        // Store chart instance
        this.charts[containerId] = {
            chart,
            candlestickSeries,
            volumeSeries,
            indicators: {}
        };

        // Make chart responsive
        this.setupResizeObserver(containerId, chart, container);

        return this.charts[containerId];
    },

    /**
     * Create a line chart (for portfolio value, PnL, etc.)
     * @param {string} containerId - DOM element ID
     * @param {object} options - Chart options
     */
    createLineChart(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[ObeliskCharts] Container #${containerId} not found`);
            return null;
        }

        // Clear existing
        if (this.charts[containerId]) {
            this.charts[containerId].chart.remove();
        }

        const chartOptions = {
            layout: {
                background: { type: 'solid', color: this.theme.background },
                textColor: this.theme.textColor,
                fontFamily: "'Inter', sans-serif"
            },
            grid: {
                vertLines: { color: this.theme.gridColor },
                horzLines: { color: this.theme.gridColor }
            },
            rightPriceScale: {
                borderColor: this.theme.borderColor
            },
            timeScale: {
                borderColor: this.theme.borderColor,
                timeVisible: true
            },
            ...options
        };

        const chart = LightweightCharts.createChart(container, chartOptions);

        const lineSeries = chart.addLineSeries({
            color: this.theme.lineColor,
            lineWidth: 2,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
            crosshairMarkerBorderColor: this.theme.lineColor,
            crosshairMarkerBackgroundColor: this.theme.background
        });

        this.charts[containerId] = {
            chart,
            lineSeries
        };

        this.setupResizeObserver(containerId, chart, container);

        return this.charts[containerId];
    },

    /**
     * Create an area chart (for portfolio allocation, etc.)
     */
    createAreaChart(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].chart.remove();
        }

        const chartOptions = {
            layout: {
                background: { type: 'solid', color: this.theme.background },
                textColor: this.theme.textColor,
                fontFamily: "'Inter', sans-serif"
            },
            grid: {
                vertLines: { color: this.theme.gridColor },
                horzLines: { color: this.theme.gridColor }
            },
            rightPriceScale: { borderColor: this.theme.borderColor },
            timeScale: { borderColor: this.theme.borderColor, timeVisible: true },
            ...options
        };

        const chart = LightweightCharts.createChart(container, chartOptions);

        const areaSeries = chart.addAreaSeries({
            topColor: 'rgba(201, 162, 39, 0.4)',
            bottomColor: 'rgba(201, 162, 39, 0.0)',
            lineColor: this.theme.lineColor,
            lineWidth: 2
        });

        this.charts[containerId] = { chart, areaSeries };
        this.setupResizeObserver(containerId, chart, container);

        return this.charts[containerId];
    },

    /**
     * Set up resize observer for responsive charts
     */
    setupResizeObserver(containerId, chart, container) {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || entries[0].target !== container) return;
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height });
        });
        resizeObserver.observe(container);
    },

    /**
     * Update candlestick chart data
     * @param {string} containerId - Chart container ID
     * @param {Array} candles - OHLCV data [{time, open, high, low, close, volume}]
     */
    updateCandlestickData(containerId, candles) {
        const chartInstance = this.charts[containerId];
        if (!chartInstance || !chartInstance.candlestickSeries) return;

        // Format candles for TradingView
        const formattedCandles = candles.map(c => ({
            time: typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000),
            open: parseFloat(c.open),
            high: parseFloat(c.high),
            low: parseFloat(c.low),
            close: parseFloat(c.close)
        }));

        // Format volume
        const volumeData = candles.map(c => ({
            time: typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000),
            value: parseFloat(c.volume || 0),
            color: parseFloat(c.close) >= parseFloat(c.open)
                ? this.theme.volumeUpColor
                : this.theme.volumeDownColor
        }));

        chartInstance.candlestickSeries.setData(formattedCandles);
        chartInstance.volumeSeries.setData(volumeData);
        chartInstance.chart.timeScale().fitContent();
    },

    /**
     * Update line chart data
     */
    updateLineData(containerId, data) {
        const chartInstance = this.charts[containerId];
        if (!chartInstance || !chartInstance.lineSeries) return;

        const formattedData = data.map(d => ({
            time: typeof d.time === 'number' ? d.time : Math.floor(new Date(d.time).getTime() / 1000),
            value: parseFloat(d.value)
        }));

        chartInstance.lineSeries.setData(formattedData);
        chartInstance.chart.timeScale().fitContent();
    },

    /**
     * Update area chart data
     */
    updateAreaData(containerId, data) {
        const chartInstance = this.charts[containerId];
        if (!chartInstance || !chartInstance.areaSeries) return;

        const formattedData = data.map(d => ({
            time: typeof d.time === 'number' ? d.time : Math.floor(new Date(d.time).getTime() / 1000),
            value: parseFloat(d.value)
        }));

        chartInstance.areaSeries.setData(formattedData);
        chartInstance.chart.timeScale().fitContent();
    },

    /**
     * Add EMA indicator
     */
    addEMA(containerId, period = 20, color = '#00d4ff') {
        const chartInstance = this.charts[containerId];
        if (!chartInstance) return null;

        const emaSeries = chartInstance.chart.addLineSeries({
            color: color,
            lineWidth: 1,
            crosshairMarkerVisible: false
        });

        chartInstance.indicators[`EMA_${period}`] = emaSeries;
        return emaSeries;
    },

    /**
     * Add Bollinger Bands
     */
    addBollingerBands(containerId, period = 20) {
        const chartInstance = this.charts[containerId];
        if (!chartInstance) return null;

        const upperBand = chartInstance.chart.addLineSeries({
            color: 'rgba(201, 162, 39, 0.6)',
            lineWidth: 1,
            crosshairMarkerVisible: false
        });

        const lowerBand = chartInstance.chart.addLineSeries({
            color: 'rgba(201, 162, 39, 0.6)',
            lineWidth: 1,
            crosshairMarkerVisible: false
        });

        const middleBand = chartInstance.chart.addLineSeries({
            color: '#c9a227',
            lineWidth: 1,
            lineStyle: LightweightCharts.LineStyle.Dashed,
            crosshairMarkerVisible: false
        });

        chartInstance.indicators.bollingerBands = { upperBand, lowerBand, middleBand };
        return chartInstance.indicators.bollingerBands;
    },

    /**
     * Add price markers (buy/sell signals)
     */
    addMarkers(containerId, markers) {
        const chartInstance = this.charts[containerId];
        if (!chartInstance || !chartInstance.candlestickSeries) return;

        const formattedMarkers = markers.map(m => ({
            time: typeof m.time === 'number' ? m.time : Math.floor(new Date(m.time).getTime() / 1000),
            position: m.type === 'buy' ? 'belowBar' : 'aboveBar',
            color: m.type === 'buy' ? '#00d4ff' : '#ff4444',
            shape: m.type === 'buy' ? 'arrowUp' : 'arrowDown',
            text: m.text || (m.type === 'buy' ? 'BUY' : 'SELL'),
            size: 2
        }));

        chartInstance.candlestickSeries.setMarkers(formattedMarkers);
    },

    /**
     * Add price line (support/resistance)
     */
    addPriceLine(containerId, price, options = {}) {
        const chartInstance = this.charts[containerId];
        if (!chartInstance || !chartInstance.candlestickSeries) return null;

        return chartInstance.candlestickSeries.createPriceLine({
            price: price,
            color: options.color || '#c9a227',
            lineWidth: options.lineWidth || 1,
            lineStyle: options.dashed ? LightweightCharts.LineStyle.Dashed : LightweightCharts.LineStyle.Solid,
            axisLabelVisible: true,
            title: options.title || ''
        });
    },

    /**
     * Subscribe to crosshair move (for tooltip)
     */
    onCrosshairMove(containerId, callback) {
        const chartInstance = this.charts[containerId];
        if (!chartInstance) return;

        chartInstance.chart.subscribeCrosshairMove(param => {
            if (!param.point || !param.time) {
                callback(null);
                return;
            }

            const data = {};
            if (chartInstance.candlestickSeries) {
                data.candle = param.seriesData.get(chartInstance.candlestickSeries);
            }
            if (chartInstance.volumeSeries) {
                data.volume = param.seriesData.get(chartInstance.volumeSeries);
            }
            if (chartInstance.lineSeries) {
                data.line = param.seriesData.get(chartInstance.lineSeries);
            }

            callback({
                time: param.time,
                point: param.point,
                ...data
            });
        });
    },

    /**
     * Fetch and display real-time price data
     */
    async loadPriceData(containerId, symbol = 'BTC', interval = '1h', limit = 200) {
        try {
            // Use Binance API for price data
            const response = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`
            );

            if (!response.ok) throw new Error('Failed to fetch price data');

            const data = await response.json();

            // Format for TradingView
            const candles = data.map(k => ({
                time: Math.floor(k[0] / 1000),
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5])
            }));

            this.updateCandlestickData(containerId, candles);

            return candles;
        } catch (err) {
            console.error('[ObeliskCharts] Error loading price data:', err);
            return null;
        }
    },

    /**
     * Create a mini sparkline chart
     */
    createSparkline(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const chartOptions = {
            width: options.width || container.clientWidth || 100,
            height: options.height || 40,
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: 'transparent'
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false }
            },
            rightPriceScale: { visible: false },
            timeScale: { visible: false },
            crosshair: { visible: false },
            handleScroll: false,
            handleScale: false
        };

        const chart = LightweightCharts.createChart(container, chartOptions);

        // Determine if positive or negative trend
        const isPositive = data.length > 1 && data[data.length - 1].value >= data[0].value;

        const series = chart.addAreaSeries({
            topColor: isPositive ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 68, 68, 0.4)',
            bottomColor: isPositive ? 'rgba(0, 212, 255, 0.0)' : 'rgba(255, 68, 68, 0.0)',
            lineColor: isPositive ? '#00d4ff' : '#ff4444',
            lineWidth: 2
        });

        const formattedData = data.map((d, i) => ({
            time: typeof d.time === 'number' ? d.time : i,
            value: parseFloat(d.value)
        }));

        series.setData(formattedData);
        chart.timeScale().fitContent();

        return { chart, series };
    },

    /**
     * Destroy a chart instance
     */
    destroyChart(containerId) {
        if (this.charts[containerId]) {
            this.charts[containerId].chart.remove();
            delete this.charts[containerId];
        }
    },

    /**
     * Destroy all charts
     */
    destroyAll() {
        Object.keys(this.charts).forEach(id => this.destroyChart(id));
    }
};

// Auto-init when DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        ObeliskCharts.init();
    });
}

// Export
if (typeof window !== 'undefined') {
    window.ObeliskCharts = ObeliskCharts;
}

console.log('[ObeliskCharts] Module loaded');
