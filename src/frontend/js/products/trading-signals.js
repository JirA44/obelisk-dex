/**
 * TRADING SIGNALS ENGINE
 * Generates real trading signals based on market data
 * Can be copied by MixBot or manual trading
 */

const TradingSignals = {
    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    config: {
        priceUpdateInterval: 30000,    // 30 sec
        signalCheckInterval: 60000,    // 1 min
        maxActiveSignals: 50,
        maxSignalHistory: 500,
        bridgeUrl: 'http://localhost:3456', // MixBot bridge
        autoSendToBridge: true,             // Auto-send signals to MixBot
    },

    // Supported assets with their trading pairs
    assets: {
        'BTC': { symbol: 'BTCUSDT', decimals: 2, minSize: 0.001 },
        'ETH': { symbol: 'ETHUSDT', decimals: 2, minSize: 0.01 },
        'SOL': { symbol: 'SOLUSDT', decimals: 3, minSize: 0.1 },
        'ARB': { symbol: 'ARBUSDT', decimals: 4, minSize: 1 },
        'AVAX': { symbol: 'AVAXUSDT', decimals: 3, minSize: 0.1 },
        'LINK': { symbol: 'LINKUSDT', decimals: 3, minSize: 0.1 },
        'DOGE': { symbol: 'DOGEUSDT', decimals: 5, minSize: 10 },
        'OP': { symbol: 'OPUSDT', decimals: 4, minSize: 1 },
        'MATIC': { symbol: 'MATICUSDT', decimals: 4, minSize: 1 },
        'ATOM': { symbol: 'ATOMUSDT', decimals: 3, minSize: 0.1 },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════════

    prices: {},           // Current prices
    priceHistory: {},     // Price history for indicators (last 100 candles per asset)
    indicators: {},       // Calculated indicators
    activeSignals: [],    // Current open signals
    signalHistory: [],    // Past signals with results
    subscribers: {},      // Trader ID -> callback for signal notifications
    running: false,

    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    async init() {
        console.log('[Signals] Initializing trading signals engine...');
        this.loadState();
        await this.fetchPrices();
        await this.fetchPriceHistory();
        this.calculateAllIndicators();
        this.startEngine();
        console.log('[Signals] Engine started with', Object.keys(this.prices).length, 'assets');
    },

    loadState() {
        try {
            const saved = localStorage.getItem('obelisk_trading_signals');
            if (saved) {
                const data = JSON.parse(saved);
                this.activeSignals = data.activeSignals || [];
                this.signalHistory = data.signalHistory || [];
                this.subscribers = data.subscribers || {};
            }
        } catch (e) {
            console.error('[Signals] Failed to load state:', e);
        }
    },

    saveState() {
        try {
            localStorage.setItem('obelisk_trading_signals', JSON.stringify({
                activeSignals: this.activeSignals.slice(-50),
                signalHistory: this.signalHistory.slice(-500),
                subscribers: this.subscribers
            }));
        } catch (e) {
            console.error('[Signals] Failed to save state:', e);
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRICE FEEDS
    // ═══════════════════════════════════════════════════════════════════════════════

    async fetchPrices() {
        try {
            // Use Binance API for real-time prices
            const symbols = Object.values(this.assets).map(a => a.symbol).join(',');
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=[${Object.values(this.assets).map(a => `"${a.symbol}"`).join(',')}]`);

            if (!response.ok) {
                // Fallback to individual requests
                for (const [asset, config] of Object.entries(this.assets)) {
                    try {
                        const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${config.symbol}`);
                        const data = await r.json();
                        this.prices[asset] = parseFloat(data.price);
                    } catch (e) {
                        console.warn(`[Signals] Failed to fetch ${asset} price`);
                    }
                }
            } else {
                const data = await response.json();
                data.forEach(item => {
                    const asset = Object.entries(this.assets).find(([k, v]) => v.symbol === item.symbol)?.[0];
                    if (asset) this.prices[asset] = parseFloat(item.price);
                });
            }

            // Add timestamp
            this.prices._timestamp = Date.now();
            return this.prices;
        } catch (e) {
            console.error('[Signals] Price fetch error:', e);
            return this.prices;
        }
    },

    async fetchPriceHistory() {
        // Fetch 1h candles for indicator calculation
        for (const [asset, config] of Object.entries(this.assets)) {
            try {
                const response = await fetch(
                    `https://api.binance.com/api/v3/klines?symbol=${config.symbol}&interval=1h&limit=100`
                );
                const data = await response.json();

                this.priceHistory[asset] = data.map(candle => ({
                    timestamp: candle[0],
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4]),
                    volume: parseFloat(candle[5])
                }));
            } catch (e) {
                console.warn(`[Signals] Failed to fetch ${asset} history`);
                this.priceHistory[asset] = [];
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // TECHNICAL INDICATORS
    // ═══════════════════════════════════════════════════════════════════════════════

    calculateAllIndicators() {
        for (const asset of Object.keys(this.assets)) {
            this.indicators[asset] = this.calculateIndicators(asset);
        }
    },

    calculateIndicators(asset) {
        const history = this.priceHistory[asset] || [];
        if (history.length < 20) return {};

        const closes = history.map(c => c.close);
        const highs = history.map(c => c.high);
        const lows = history.map(c => c.low);
        const volumes = history.map(c => c.volume);

        return {
            price: closes[closes.length - 1],
            sma20: this.sma(closes, 20),
            sma50: this.sma(closes, 50),
            ema12: this.ema(closes, 12),
            ema26: this.ema(closes, 26),
            rsi14: this.rsi(closes, 14),
            macd: this.macd(closes),
            bollinger: this.bollingerBands(closes, 20),
            atr14: this.atr(highs, lows, closes, 14),
            volumeSma: this.sma(volumes, 20),
            currentVolume: volumes[volumes.length - 1],
            priceChange1h: ((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2]) * 100,
            priceChange24h: closes.length >= 24 ? ((closes[closes.length - 1] - closes[closes.length - 24]) / closes[closes.length - 24]) * 100 : 0,
            support: Math.min(...lows.slice(-20)),
            resistance: Math.max(...highs.slice(-20)),
        };
    },

    sma(data, period) {
        if (data.length < period) return null;
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / period;
    },

    ema(data, period) {
        if (data.length < period) return null;
        const k = 2 / (period + 1);
        let ema = this.sma(data.slice(0, period), period);
        for (let i = period; i < data.length; i++) {
            ema = data[i] * k + ema * (1 - k);
        }
        return ema;
    },

    rsi(data, period = 14) {
        if (data.length < period + 1) return 50;

        let gains = 0, losses = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const change = data[i] - data[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    },

    macd(data) {
        const ema12 = this.ema(data, 12);
        const ema26 = this.ema(data, 26);
        if (!ema12 || !ema26) return { line: 0, signal: 0, histogram: 0 };

        const macdLine = ema12 - ema26;
        // Simplified signal line
        const signal = macdLine * 0.9; // Approximation
        return {
            line: macdLine,
            signal: signal,
            histogram: macdLine - signal
        };
    },

    bollingerBands(data, period = 20) {
        const sma = this.sma(data, period);
        if (!sma) return { upper: 0, middle: 0, lower: 0 };

        const slice = data.slice(-period);
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        return {
            upper: sma + stdDev * 2,
            middle: sma,
            lower: sma - stdDev * 2
        };
    },

    atr(highs, lows, closes, period = 14) {
        if (highs.length < period + 1) return 0;

        let atr = 0;
        for (let i = highs.length - period; i < highs.length; i++) {
            const tr = Math.max(
                highs[i] - lows[i],
                Math.abs(highs[i] - closes[i - 1]),
                Math.abs(lows[i] - closes[i - 1])
            );
            atr += tr;
        }
        return atr / period;
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // STRATEGY SIGNAL GENERATORS
    // ═══════════════════════════════════════════════════════════════════════════════

    strategies: {
        // Trend Following - SMA crossover
        trend: (ind, asset) => {
            if (!ind.sma20 || !ind.sma50) return null;

            const bullish = ind.sma20 > ind.sma50 && ind.price > ind.sma20;
            const bearish = ind.sma20 < ind.sma50 && ind.price < ind.sma20;

            if (bullish && ind.rsi14 < 70) {
                return { side: 'long', confidence: 0.6, reason: 'SMA20 > SMA50, price above SMA20' };
            }
            if (bearish && ind.rsi14 > 30) {
                return { side: 'short', confidence: 0.6, reason: 'SMA20 < SMA50, price below SMA20' };
            }
            return null;
        },

        // Mean Reversion - RSI extremes
        'mean-revert': (ind, asset) => {
            if (ind.rsi14 < 25) {
                return { side: 'long', confidence: 0.7, reason: `RSI oversold at ${ind.rsi14.toFixed(1)}` };
            }
            if (ind.rsi14 > 75) {
                return { side: 'short', confidence: 0.7, reason: `RSI overbought at ${ind.rsi14.toFixed(1)}` };
            }
            return null;
        },

        // Momentum - Strong moves
        momentum: (ind, asset) => {
            const strongUp = ind.priceChange1h > 2 && ind.currentVolume > ind.volumeSma * 1.5;
            const strongDown = ind.priceChange1h < -2 && ind.currentVolume > ind.volumeSma * 1.5;

            if (strongUp && ind.rsi14 < 80) {
                return { side: 'long', confidence: 0.65, reason: `Strong momentum +${ind.priceChange1h.toFixed(1)}% with volume` };
            }
            if (strongDown && ind.rsi14 > 20) {
                return { side: 'short', confidence: 0.65, reason: `Strong momentum ${ind.priceChange1h.toFixed(1)}% with volume` };
            }
            return null;
        },

        // Breakout - Support/Resistance
        breakout: (ind, asset) => {
            const breakoutUp = ind.price > ind.resistance * 1.01;
            const breakoutDown = ind.price < ind.support * 0.99;

            if (breakoutUp && ind.currentVolume > ind.volumeSma * 1.3) {
                return { side: 'long', confidence: 0.7, reason: `Breakout above resistance $${ind.resistance.toFixed(2)}` };
            }
            if (breakoutDown && ind.currentVolume > ind.volumeSma * 1.3) {
                return { side: 'short', confidence: 0.7, reason: `Breakdown below support $${ind.support.toFixed(2)}` };
            }
            return null;
        },

        // Bollinger Bands
        range: (ind, asset) => {
            if (!ind.bollinger) return null;

            if (ind.price < ind.bollinger.lower) {
                return { side: 'long', confidence: 0.6, reason: 'Price below lower Bollinger Band' };
            }
            if (ind.price > ind.bollinger.upper) {
                return { side: 'short', confidence: 0.6, reason: 'Price above upper Bollinger Band' };
            }
            return null;
        },

        // MACD crossover
        technical: (ind, asset) => {
            if (!ind.macd) return null;

            if (ind.macd.histogram > 0 && ind.macd.line > 0 && ind.rsi14 < 65) {
                return { side: 'long', confidence: 0.55, reason: 'MACD bullish crossover' };
            }
            if (ind.macd.histogram < 0 && ind.macd.line < 0 && ind.rsi14 > 35) {
                return { side: 'short', confidence: 0.55, reason: 'MACD bearish crossover' };
            }
            return null;
        },

        // Scalping - Quick moves
        scalp: (ind, asset) => {
            // Quick reversal after extreme RSI
            if (ind.rsi14 < 20 && ind.priceChange1h > 0.5) {
                return { side: 'long', confidence: 0.5, reason: 'Quick bounce from RSI extreme' };
            }
            if (ind.rsi14 > 80 && ind.priceChange1h < -0.5) {
                return { side: 'short', confidence: 0.5, reason: 'Quick fade from RSI extreme' };
            }
            return null;
        },

        // DCA - Always looking to accumulate on dips
        dca: (ind, asset) => {
            if (ind.priceChange24h < -5 && ind.rsi14 < 40) {
                return { side: 'long', confidence: 0.8, reason: `DCA opportunity: -${Math.abs(ind.priceChange24h).toFixed(1)}% in 24h` };
            }
            return null;
        },

        // Swing trading - Multi-day setups
        swing: (ind, asset) => {
            const bullSetup = ind.price > ind.sma20 && ind.rsi14 > 50 && ind.rsi14 < 65 && ind.macd?.histogram > 0;
            const bearSetup = ind.price < ind.sma20 && ind.rsi14 < 50 && ind.rsi14 > 35 && ind.macd?.histogram < 0;

            if (bullSetup) {
                return { side: 'long', confidence: 0.6, reason: 'Bullish swing setup: above SMA20, RSI neutral, MACD positive' };
            }
            if (bearSetup) {
                return { side: 'short', confidence: 0.6, reason: 'Bearish swing setup: below SMA20, RSI neutral, MACD negative' };
            }
            return null;
        },

        // Volatility - Trade expansions
        volatility: (ind, asset) => {
            const volExpansion = ind.atr14 > ind.price * 0.03; // ATR > 3% of price

            if (volExpansion && ind.priceChange1h > 1.5) {
                return { side: 'long', confidence: 0.55, reason: 'Volatility expansion to upside' };
            }
            if (volExpansion && ind.priceChange1h < -1.5) {
                return { side: 'short', confidence: 0.55, reason: 'Volatility expansion to downside' };
            }
            return null;
        },

        // Reversal hunting
        reversal: (ind, asset) => {
            // Look for reversal after big moves
            if (ind.priceChange24h < -10 && ind.rsi14 < 30 && ind.priceChange1h > 0) {
                return { side: 'long', confidence: 0.65, reason: 'Reversal signal after -10% drop' };
            }
            if (ind.priceChange24h > 10 && ind.rsi14 > 70 && ind.priceChange1h < 0) {
                return { side: 'short', confidence: 0.65, reason: 'Reversal signal after +10% pump' };
            }
            return null;
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // SIGNAL GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    generateSignalsForTrader(trader) {
        const style = trader.style;
        const assets = trader.assets.filter(a => this.assets[a]); // Only supported assets

        if (assets.length === 0) return null;

        // Get the strategy for this trading style
        const strategy = this.strategies[style] || this.strategies.technical;

        // Check each asset
        for (const asset of assets) {
            const ind = this.indicators[asset];
            if (!ind || !ind.price) continue;

            // Run strategy
            const signal = strategy(ind, asset);
            if (!signal) continue;

            // Apply trader-specific filters
            if (signal.confidence < 0.5) continue;

            // Check if we already have an active signal for this trader+asset
            const existingSignal = this.activeSignals.find(
                s => s.traderId === trader.id && s.asset === asset && s.status === 'open'
            );
            if (existingSignal) continue;

            // Generate the signal
            return this.createSignal(trader, asset, signal);
        }

        return null;
    },

    createSignal(trader, asset, signalData) {
        const price = this.prices[asset];
        const atr = this.indicators[asset]?.atr14 || price * 0.02;

        // Calculate position size based on trader's avg trade size
        const positionSize = trader.avgTradeSize || 500;

        // Calculate SL/TP based on ATR and risk level
        const riskMultiplier = { low: 1, medium: 1.5, high: 2, extreme: 3 }[trader.riskLevel] || 1.5;
        const slDistance = atr * riskMultiplier;
        const tpDistance = atr * riskMultiplier * 2; // 2:1 reward/risk

        const signal = {
            id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            traderId: trader.id,
            traderName: trader.name,
            traderStyle: trader.style,
            asset,
            side: signalData.side,
            confidence: signalData.confidence,
            reason: signalData.reason,

            // Entry
            entryPrice: price,
            entryTime: Date.now(),

            // Position
            size: positionSize,
            leverage: trader.leverage,
            notionalValue: positionSize * trader.leverage,

            // Risk management
            stopLoss: signalData.side === 'long' ? price - slDistance : price + slDistance,
            takeProfit: signalData.side === 'long' ? price + tpDistance : price - tpDistance,
            riskRewardRatio: 2,

            // Status
            status: 'open',
            currentPrice: price,
            unrealizedPnl: 0,
            unrealizedPnlPercent: 0,

            // Metadata
            indicators: { ...this.indicators[asset] },
            createdAt: new Date().toISOString(),
        };

        // Add to active signals
        this.activeSignals.push(signal);
        this.saveState();

        // Notify subscribers
        this.notifySubscribers(signal);

        console.log(`[Signals] New signal: ${signal.side.toUpperCase()} ${asset} @ $${price.toFixed(2)} - ${signal.reason}`);

        return signal;
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // SIGNAL MONITORING & UPDATES
    // ═══════════════════════════════════════════════════════════════════════════════

    updateActiveSignals() {
        const now = Date.now();

        this.activeSignals.forEach(signal => {
            if (signal.status !== 'open') return;

            const currentPrice = this.prices[signal.asset];
            if (!currentPrice) return;

            signal.currentPrice = currentPrice;

            // Calculate PnL
            const priceDiff = signal.side === 'long'
                ? currentPrice - signal.entryPrice
                : signal.entryPrice - currentPrice;

            signal.unrealizedPnl = (priceDiff / signal.entryPrice) * signal.notionalValue;
            signal.unrealizedPnlPercent = (priceDiff / signal.entryPrice) * 100 * signal.leverage;

            // Check SL/TP
            if (signal.side === 'long') {
                if (currentPrice <= signal.stopLoss) {
                    this.closeSignal(signal, 'stop_loss', currentPrice);
                } else if (currentPrice >= signal.takeProfit) {
                    this.closeSignal(signal, 'take_profit', currentPrice);
                }
            } else {
                if (currentPrice >= signal.stopLoss) {
                    this.closeSignal(signal, 'stop_loss', currentPrice);
                } else if (currentPrice <= signal.takeProfit) {
                    this.closeSignal(signal, 'take_profit', currentPrice);
                }
            }

            // Auto-close after 24h if still open
            if (now - signal.entryTime > 24 * 60 * 60 * 1000) {
                this.closeSignal(signal, 'timeout', currentPrice);
            }
        });

        this.saveState();
    },

    closeSignal(signal, reason, exitPrice) {
        signal.status = 'closed';
        signal.exitPrice = exitPrice;
        signal.exitTime = Date.now();
        signal.exitReason = reason;

        // Calculate final PnL
        const priceDiff = signal.side === 'long'
            ? exitPrice - signal.entryPrice
            : signal.entryPrice - exitPrice;

        signal.realizedPnl = (priceDiff / signal.entryPrice) * signal.notionalValue;
        signal.realizedPnlPercent = (priceDiff / signal.entryPrice) * 100 * signal.leverage;

        // Move to history
        this.signalHistory.push({ ...signal });

        // Remove from active
        this.activeSignals = this.activeSignals.filter(s => s.id !== signal.id);

        // Notify
        this.notifySubscribers(signal, 'closed');

        console.log(`[Signals] Closed: ${signal.side} ${signal.asset} - ${reason} - PnL: ${signal.realizedPnlPercent.toFixed(2)}%`);
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // SUBSCRIPTION & NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    subscribe(traderId, callback) {
        this.subscribers[traderId] = callback;
        console.log(`[Signals] Subscribed to trader ${traderId}`);
    },

    unsubscribe(traderId) {
        delete this.subscribers[traderId];
        console.log(`[Signals] Unsubscribed from trader ${traderId}`);
    },

    notifySubscribers(signal, eventType = 'new') {
        // Call registered callbacks
        const callback = this.subscribers[signal.traderId];
        if (callback && typeof callback === 'function') {
            try {
                callback(signal, eventType);
            } catch (e) {
                console.error('[Signals] Callback error:', e);
            }
        }

        // Global event for UI
        window.dispatchEvent(new CustomEvent('tradingSignal', {
            detail: { signal, eventType }
        }));

        // Store for MixBot API
        this.lastSignal = { signal, eventType, timestamp: Date.now() };

        // Auto-send to MixBot bridge
        if (this.config.autoSendToBridge && eventType === 'new') {
            this.sendToBridge(signal);
        }
    },

    async sendToBridge(signal) {
        try {
            const formatted = this.formatForMixBot(signal);
            const response = await fetch(`${this.config.bridgeUrl}/signals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formatted)
            });

            if (response.ok) {
                console.log(`[Signals] Sent to MixBot bridge: ${signal.side} ${signal.asset}`);
            }
        } catch (e) {
            // Bridge not running - silently fail
            console.log('[Signals] Bridge not available (run obelisk_signal_bridge.js in mixbot folder)');
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // ENGINE LOOP
    // ═══════════════════════════════════════════════════════════════════════════════

    startEngine() {
        if (this.running) return;
        this.running = true;

        // Price updates
        setInterval(async () => {
            await this.fetchPrices();
            this.updateActiveSignals();
        }, this.config.priceUpdateInterval);

        // Signal generation (check traders)
        setInterval(() => {
            this.generateSignalsForActiveTraders();
        }, this.config.signalCheckInterval);

        // Indicator recalculation
        setInterval(async () => {
            await this.fetchPriceHistory();
            this.calculateAllIndicators();
        }, 5 * 60 * 1000); // Every 5 min
    },

    generateSignalsForActiveTraders() {
        if (typeof TraderSimulator === 'undefined') return;

        // Get traders that are being copied
        const copiedTraderIds = Object.keys(this.subscribers);
        if (copiedTraderIds.length === 0) return;

        copiedTraderIds.forEach(traderId => {
            const trader = TraderSimulator.getTrader(traderId);
            if (!trader) return;

            // Random chance based on trading frequency
            const freqChance = { hourly: 0.1, daily: 0.02, weekly: 0.003, monthly: 0.001 };
            if (Math.random() > (freqChance[trader.tradingFreq] || 0.02)) return;

            this.generateSignalsForTrader(trader);
        });
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // PUBLIC API (for MixBot integration)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Get all active signals
    getActiveSignals(traderId = null) {
        if (traderId) {
            return this.activeSignals.filter(s => s.traderId === traderId);
        }
        return this.activeSignals;
    },

    // Get signal history
    getSignalHistory(traderId = null, limit = 50) {
        let history = this.signalHistory;
        if (traderId) {
            history = history.filter(s => s.traderId === traderId);
        }
        return history.slice(-limit);
    },

    // Get current prices
    getPrices() {
        return { ...this.prices };
    },

    // Get indicators for an asset
    getIndicators(asset) {
        return this.indicators[asset] || null;
    },

    // Manual signal trigger (for testing)
    triggerSignal(traderId, asset, side) {
        const trader = TraderSimulator?.getTrader(traderId);
        if (!trader) return null;

        return this.createSignal(trader, asset, {
            side,
            confidence: 0.8,
            reason: 'Manual trigger'
        });
    },

    // Get performance stats
    getPerformanceStats(traderId = null) {
        let signals = this.signalHistory;
        if (traderId) {
            signals = signals.filter(s => s.traderId === traderId);
        }

        const total = signals.length;
        const wins = signals.filter(s => s.realizedPnl > 0).length;
        const losses = signals.filter(s => s.realizedPnl <= 0).length;
        const totalPnl = signals.reduce((sum, s) => sum + (s.realizedPnl || 0), 0);
        const avgPnl = total > 0 ? totalPnl / total : 0;

        return {
            total,
            wins,
            losses,
            winRate: total > 0 ? (wins / total * 100).toFixed(1) : 0,
            totalPnl: totalPnl.toFixed(2),
            avgPnl: avgPnl.toFixed(2),
            byReason: {
                takeProfit: signals.filter(s => s.exitReason === 'take_profit').length,
                stopLoss: signals.filter(s => s.exitReason === 'stop_loss').length,
                timeout: signals.filter(s => s.exitReason === 'timeout').length,
            }
        };
    },

    // Format signal for MixBot
    formatForMixBot(signal) {
        return {
            action: signal.side === 'long' ? 'BUY' : 'SELL',
            symbol: `${signal.asset}-USD`,
            size: signal.size,
            leverage: signal.leverage,
            price: signal.entryPrice,
            stopLoss: signal.stopLoss,
            takeProfit: signal.takeProfit,
            source: `obelisk-copy-${signal.traderId}`,
            signalId: signal.id,
            timestamp: signal.entryTime
        };
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => TradingSignals.init());
window.TradingSignals = TradingSignals;

// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK SIGNALS API - For MixBot Integration
// ═══════════════════════════════════════════════════════════════════════════════

window.ObeliskSignals = {
    // Get all pending signals formatted for MixBot
    getForMixBot() {
        const signals = TradingSignals.getActiveSignals();
        return signals.map(s => TradingSignals.formatForMixBot(s));
    },

    // Get latest signal
    getLatest() {
        return TradingSignals.lastSignal || null;
    },

    // Get signals since timestamp
    getSince(timestamp) {
        return TradingSignals.signalHistory
            .filter(s => s.entryTime > timestamp)
            .map(s => TradingSignals.formatForMixBot(s));
    },

    // Subscribe to real-time signals (for WebSocket bridge)
    onSignal(callback) {
        window.addEventListener('tradingSignal', (e) => {
            const formatted = TradingSignals.formatForMixBot(e.detail.signal);
            callback(formatted, e.detail.eventType);
        });
    },

    // Get trader stats
    getTraderStats(traderId) {
        return TradingSignals.getPerformanceStats(traderId);
    },

    // Get current market data
    getMarketData() {
        return {
            prices: TradingSignals.getPrices(),
            indicators: Object.keys(TradingSignals.assets).reduce((acc, asset) => {
                acc[asset] = TradingSignals.getIndicators(asset);
                return acc;
            }, {})
        };
    },

    // Manual trigger for testing
    trigger(traderId, asset, side) {
        return TradingSignals.triggerSignal(traderId, asset, side);
    },

    // Poll endpoint (call every X seconds from MixBot)
    poll() {
        return {
            timestamp: Date.now(),
            activeSignals: this.getForMixBot(),
            prices: TradingSignals.getPrices(),
            lastSignal: this.getLatest()
        };
    }
};

console.log('[ObeliskSignals] API ready - Use window.ObeliskSignals.poll() or window.ObeliskSignals.getForMixBot()');
