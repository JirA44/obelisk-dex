/**
 * PERPETUAL FUTURES TRADING MODULE
 * Trade crypto perpetuals with leverage up to 100x
 * Build: 2026-01-18
 */
const PerpsModule = {
    // Available trading pairs
    pairs: [
        { symbol: 'BTC/USDC', name: 'Bitcoin', icon: '₿', maxLeverage: 100, tickSize: 0.1, minSize: 0.001 },
        { symbol: 'ETH/USDC', name: 'Ethereum', icon: 'Ξ', maxLeverage: 100, tickSize: 0.01, minSize: 0.01 },
        { symbol: 'SOL/USDC', name: 'Solana', icon: '◎', maxLeverage: 50, tickSize: 0.001, minSize: 0.1 },
        { symbol: 'ARB/USDC', name: 'Arbitrum', icon: '🔷', maxLeverage: 50, tickSize: 0.0001, minSize: 1 },
        { symbol: 'OP/USDC', name: 'Optimism', icon: '🔴', maxLeverage: 50, tickSize: 0.0001, minSize: 1 },
        { symbol: 'AVAX/USDC', name: 'Avalanche', icon: '🔺', maxLeverage: 50, tickSize: 0.001, minSize: 0.1 },
        { symbol: 'LINK/USDC', name: 'Chainlink', icon: '⬡', maxLeverage: 50, tickSize: 0.001, minSize: 0.1 },
        { symbol: 'DOGE/USDC', name: 'Dogecoin', icon: '🐕', maxLeverage: 25, tickSize: 0.00001, minSize: 10 },
        { symbol: 'SUI/USDC', name: 'Sui', icon: '💧', maxLeverage: 50, tickSize: 0.0001, minSize: 1 },
        { symbol: 'APT/USDC', name: 'Aptos', icon: '🅰️', maxLeverage: 50, tickSize: 0.001, minSize: 0.1 },
        { symbol: 'INJ/USDC', name: 'Injective', icon: '💉', maxLeverage: 50, tickSize: 0.001, minSize: 0.1 },
        { symbol: 'TIA/USDC', name: 'Celestia', icon: '🌌', maxLeverage: 25, tickSize: 0.001, minSize: 0.1 },
        { symbol: 'WIF/USDC', name: 'Dogwifhat', icon: '🎩', maxLeverage: 20, tickSize: 0.0001, minSize: 1 },
        { symbol: 'PEPE/USDC', name: 'Pepe', icon: '🐸', maxLeverage: 20, tickSize: 0.00000001, minSize: 100000 },
        { symbol: 'XRP/USDC', name: 'Ripple', icon: '✕', maxLeverage: 50, tickSize: 0.0001, minSize: 1 }
    ],

    // Current state
    selectedPair: 'BTC/USDC',
    leverage: 10,
    orderType: 'market', // market, limit, stop
    side: 'long', // long, short
    marginMode: 'cross', // cross, isolated

    // V2.2: Execution mode
    executionMode: 'paper', // 'paper' | 'hyperliquid' | 'gmx'
    paperBalance: 10000, // Starting paper balance $10K

    // Positions & orders
    positions: [],
    openOrders: [],
    tradeHistory: [],
    paperPnL: 0, // Track paper trading PnL

    // Liquidation Protection
    liqProtectionEnabled: false,
    liqProtectionPlan: 'standard', // basic, standard, premium

    // Prices cache
    prices: {},
    fundingRates: {},

    // Venue fees (maker/taker in percentage)
    venueFees: {
        paper: { name: 'Paper Trading', maker: 0, taker: 0, icon: '📝' },
        hyperliquid: { name: 'Hyperliquid', maker: 0.01, taker: 0.035, icon: '🌊' },
        dydx: { name: 'dYdX', maker: 0.02, taker: 0.05, icon: '📊' },
        gmx: { name: 'GMX', maker: 0.01, taker: 0.01, icon: '💎', note: 'Fixed execution fee' },
        gains: { name: 'Gains Network', maker: 0.08, taker: 0.08, icon: '📈', note: 'Fixed open/close fee' },
        mux: { name: 'MUX Protocol', maker: 0.06, taker: 0.06, icon: '🔷' },
        morpher: { name: 'Morpher', maker: 0.03, taker: 0.03, icon: '🟣' },
        asterdex: { name: 'AsterDEX', maker: 0.015, taker: 0.04, icon: '⭐' },
        lighter: { name: 'Lighter', maker: 0.01, taker: 0.025, icon: '💡' },
        orderly: { name: 'Orderly/QuickPerps', maker: 0.02, taker: 0.05, icon: '⚡' },
        smart: { name: 'Smart Router', maker: 0.01, taker: 0.03, icon: '🧠', note: 'Auto-selects lowest fee' }
    },

    // WebSocket connection
    ws: null,
    wsConnected: false,

    init() {
        this.load();
        this.connectWebSocket();
        this.fetchFundingRates();
        console.log('[Perps] Initialized with', this.pairs.length, 'pairs');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_perps_positions', []);
        this.openOrders = SafeOps.getStorage('obelisk_perps_orders', []);
        this.tradeHistory = SafeOps.getStorage('obelisk_perps_history', []);
        // V2.2: Load execution mode and paper balance
        this.executionMode = SafeOps.getStorage('obelisk_perps_mode', 'paper');
        this.paperBalance = SafeOps.getStorage('obelisk_perps_paper_balance', 10000);
        this.paperPnL = SafeOps.getStorage('obelisk_perps_paper_pnl', 0);
    },

    save() {
        SafeOps.setStorage('obelisk_perps_positions', this.positions);
        SafeOps.setStorage('obelisk_perps_orders', this.openOrders);
        SafeOps.setStorage('obelisk_perps_history', this.tradeHistory);
        // V2.2: Save paper balance
        SafeOps.setStorage('obelisk_perps_paper_balance', this.paperBalance);
        SafeOps.setStorage('obelisk_perps_paper_pnl', this.paperPnL);
    },

    connectWebSocket() {
        try {
            // Connect to Obelisk server for real-time prices
            this.ws = new WebSocket('ws://localhost:3001');

            this.ws.onopen = () => {
                this.wsConnected = true;
                this.ws.send(JSON.stringify({ type: 'subscribe', channel: 'prices' }));
                console.log('[Perps] WebSocket connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'prices' && data.data) {
                        Object.entries(data.data).forEach(([pair, info]) => {
                            if (info && info.price) {
                                this.prices[pair] = info.price;
                            }
                        });
                        this.updatePositionsPnL();
                        this.updatePriceDisplay();
                    }
                } catch (e) {}
            };

            this.ws.onclose = () => {
                this.wsConnected = false;
                setTimeout(() => this.connectWebSocket(), 5000);
            };
        } catch (e) {
            console.error('[Perps] WebSocket error:', e);
        }
    },

    async fetchFundingRates() {
        try {
            const response = await fetch('http://localhost:3001/api/funding');
            const data = await response.json();
            if (data.rates) {
                this.fundingRates = data.rates;
            }
        } catch (e) {
            // Generate mock funding rates
            this.pairs.forEach(p => {
                this.fundingRates[p.symbol] = {
                    rate: (Math.random() - 0.5) * 0.1,
                    nextFunding: Date.now() + 8 * 3600000
                };
            });
        }
    },

    /**
     * Get fee info for a venue
     * @param {string} venue - Venue name (hyperliquid, gmx, etc.)
     * @param {string} orderType - 'maker' or 'taker' (market orders = taker, limit = maker)
     * @param {number} notional - Trade notional value for fee calculation
     */
    getVenueFee(venue, orderType = 'taker', notional = 0) {
        const venueKey = venue?.toLowerCase() || this.executionMode || 'paper';
        const fees = this.venueFees[venueKey] || this.venueFees.paper;

        const feePercent = orderType === 'maker' ? fees.maker : fees.taker;
        const feeAmount = notional * (feePercent / 100);

        return {
            venue: fees.name,
            icon: fees.icon,
            type: orderType,
            percent: feePercent,
            amount: feeAmount,
            displayPercent: feePercent.toFixed(3) + '%',
            displayAmount: '$' + feeAmount.toFixed(4),
            note: fees.note || null,
            makerPercent: fees.maker,
            takerPercent: fees.taker
        };
    },

    /**
     * Get fee comparison for all venues
     * @param {number} notional - Trade notional value
     */
    compareVenueFees(notional = 1000) {
        return Object.entries(this.venueFees).map(([key, venue]) => ({
            key,
            name: venue.name,
            icon: venue.icon,
            makerFee: (notional * venue.maker / 100).toFixed(2),
            takerFee: (notional * venue.taker / 100).toFixed(2),
            makerPercent: venue.maker + '%',
            takerPercent: venue.taker + '%',
            note: venue.note
        })).sort((a, b) => parseFloat(a.takerFee) - parseFloat(b.takerFee));
    },

    getPrice(symbol) {
        return this.prices[symbol] || this.prices[symbol.replace('/', '')] || 0;
    },

    calculateLiquidationPrice(entry, leverage, side, marginMode = 'cross') {
        const maintenanceMargin = 0.005; // 0.5%
        if (side === 'long') {
            return entry * (1 - (1 / leverage) + maintenanceMargin);
        } else {
            return entry * (1 + (1 / leverage) - maintenanceMargin);
        }
    },

    calculatePnL(position) {
        const currentPrice = this.getPrice(position.symbol);
        if (!currentPrice) return { pnl: 0, pnlPercent: 0, roe: 0 };

        const priceDiff = position.side === 'long'
            ? currentPrice - position.entryPrice
            : position.entryPrice - currentPrice;

        const pnl = priceDiff * position.size;
        const pnlPercent = (priceDiff / position.entryPrice) * 100;
        const roe = pnlPercent * position.leverage; // Return on Equity

        return { pnl, pnlPercent, roe, currentPrice };
    },

    updatePositionsPnL() {
        this.positions.forEach(pos => {
            const { pnl, pnlPercent, roe, currentPrice } = this.calculatePnL(pos);
            pos.unrealizedPnl = pnl;
            pos.pnlPercent = pnlPercent;
            pos.roe = roe;
            pos.markPrice = currentPrice;

            // Check liquidation
            if (pos.side === 'long' && currentPrice <= pos.liquidationPrice) {
                this.liquidatePosition(pos.id, 'Price reached liquidation level');
            } else if (pos.side === 'short' && currentPrice >= pos.liquidationPrice) {
                this.liquidatePosition(pos.id, 'Price reached liquidation level');
            }

            // Check TP/SL
            if (pos.takeProfit && pos.side === 'long' && currentPrice >= pos.takeProfit) {
                this.closePosition(pos.id, 'Take Profit triggered');
            } else if (pos.takeProfit && pos.side === 'short' && currentPrice <= pos.takeProfit) {
                this.closePosition(pos.id, 'Take Profit triggered');
            }

            if (pos.stopLoss && pos.side === 'long' && currentPrice <= pos.stopLoss) {
                this.closePosition(pos.id, 'Stop Loss triggered');
            } else if (pos.stopLoss && pos.side === 'short' && currentPrice >= pos.stopLoss) {
                this.closePosition(pos.id, 'Stop Loss triggered');
            }
        });
    },

    // V2.2: Set execution mode
    // V5.0: Added smart mode (auto fee optimization)
    setExecutionMode(mode) {
        const validModes = ['paper', 'smart', 'hyperliquid', 'gmx', 'gains', 'mux', 'morpher', 'asterdex', 'lighter'];
        if (validModes.includes(mode)) {
            this.executionMode = mode;
            SafeOps.setStorage('obelisk_perps_mode', mode);
            console.log(`[Perps] Execution mode: ${mode.toUpperCase()}`);
            if (typeof showNotification === 'function') {
                const modeNames = {
                    paper: '📝 Paper Trading', smart: '🧠 Smart Router', hyperliquid: '🌊 Hyperliquid', gmx: '💎 GMX',
                    gains: '📈 Gains', mux: '🔷 MUX', morpher: '🟣 Morpher', asterdex: '⭐ AsterDEX',
                    lighter: '💡 Lighter'
                };
                showNotification(`Mode: ${modeNames[mode]}`, 'info');
            }
        }
    },

    // V2.2: Execute real order via backend API
    // V3.0: Sends TP/SL and venue to backend for on-chain conditional orders
    async executeRealOrder(symbol, side, size, leverage, price, options = {}) {
        // Paper trading - no real execution
        if (this.executionMode === 'paper') {
            console.log(`[Perps] 📝 PAPER TRADE: ${side.toUpperCase()} ${size} ${symbol} x${leverage}`);
            return {
                success: true,
                simulated: true,
                route: 'PAPER_TRADING',
                order: {
                    id: 'PAPER_' + Date.now(),
                    executionPrice: price * (side === 'long' ? 1.0001 : 0.9999), // Tiny slippage simulation
                    quantity: size,
                    status: 'filled',
                    filledAt: Date.now()
                }
            };
        }

        try {
            const coin = symbol.split('/')[0];

            // V5.0: Use unified trading API with TP/SL and venue (smart = auto fee optimization)
            const modeToVenue = { smart: 'smart', gmx: 'gmx', gains: 'gains', mux: 'mux', morpher: 'morpher', asterdex: 'asterdex', lighter: 'lighter', hyperliquid: 'hyperliquid' };
            const venue = modeToVenue[this.executionMode] || 'smart';

            const response = await fetch('http://localhost:3001/api/trade/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    symbol: `${coin}/USDC`,
                    side: side === 'long' ? 'buy' : 'sell',
                    size: size,
                    leverage: leverage,
                    type: 'perp',
                    price: price,
                    tp: options.takeProfit || 0,
                    sl: options.stopLoss || 0,
                    venue: venue,
                    source: 'PERPS_UI',
                    strategy: 'PERPS_UI',
                    realExecution: true,
                    rejectPaper: true
                })
            });

            const result = await response.json();
            console.log('[Perps] API Response:', result);
            return result;
        } catch (err) {
            console.error('[Perps] API Error:', err.message);
            return { success: false, error: err.message, simulated: true };
        }
    },

    async openPosition(symbol, side, size, leverage, options = {}) {
        const pair = this.pairs.find(p => p.symbol === symbol);
        if (!pair) return { success: false, error: 'Invalid pair' };

        if (leverage > pair.maxLeverage) {
            return { success: false, error: `Max leverage for ${symbol} is ${pair.maxLeverage}x` };
        }

        const price = options.limitPrice || this.getPrice(symbol);
        if (!price) return { success: false, error: 'Price not available' };

        const notional = size * price;
        const margin = notional / leverage;
        const liquidationPrice = this.calculateLiquidationPrice(price, leverage, side);

        // Determine order type (market = taker, limit = maker)
        const orderType = options.limitPrice ? 'maker' : 'taker';

        // V2.2: Execute REAL order via backend if enabled
        // V3.0: Forward TP/SL to backend for on-chain conditional orders
        let realExecution = null;
        const useRealExecution = options.realExecution !== false; // Default true

        if (useRealExecution) {
            // Get fee info for the venue
            const feeInfo = this.getVenueFee(this.executionMode, orderType, notional);

            if (typeof showNotification === 'function') {
                showNotification(`Executing ${side.toUpperCase()} ${symbol} x${leverage}... (${feeInfo.type}: ${feeInfo.displayPercent})`, 'info');
            }
            realExecution = await this.executeRealOrder(symbol, side, size, leverage, price, {
                takeProfit: options.takeProfit || null,
                stopLoss: options.stopLoss || null
            });

            // Get fee info for executed route
            const executedVenue = realExecution?.route?.toLowerCase().replace('_', '') || this.executionMode;
            const executedFee = this.getVenueFee(executedVenue, orderType, notional);

            if (realExecution.success && !realExecution.simulated) {
                console.log(`[Perps] ✅ REAL ORDER FILLED via ${realExecution.route}`);
                if (typeof showNotification === 'function') {
                    showNotification(
                        `✅ ${side.toUpperCase()} ${symbol} FILLED @ $${realExecution.order?.executionPrice?.toFixed(2) || price.toFixed(2)}` +
                        ` | ${executedFee.icon} ${executedFee.venue} | Fee: ${executedFee.displayAmount} (${executedFee.type}: ${executedFee.displayPercent})`,
                        'success'
                    );
                }
            } else if (realExecution.simulated) {
                console.log(`[Perps] ⚪ Simulated (${realExecution.route})`);
                if (typeof showNotification === 'function') {
                    showNotification(
                        `📝 PAPER ${side.toUpperCase()} ${symbol} @ $${price.toFixed(2)} | ${executedFee.icon} ${executedFee.venue}`,
                        'info'
                    );
                }
            }
        }

        // Calculate entry fee
        const executedVenue = realExecution?.route?.toLowerCase().replace('_', '') || this.executionMode;
        const entryFee = this.getVenueFee(executedVenue, orderType, notional);

        const position = {
            id: realExecution?.order?.id || 'pos-' + Date.now(),
            symbol,
            side,
            size,
            entryPrice: realExecution?.order?.executionPrice || price,
            leverage,
            margin,
            notional,
            liquidationPrice,
            takeProfit: options.takeProfit || null,
            stopLoss: options.stopLoss || null,
            marginMode: options.marginMode || 'cross',
            liqProtection: options.liqProtection || null,
            liqProtectionPlan: options.liqProtectionPlan || null,
            openTime: Date.now(),
            unrealizedPnl: 0,
            pnlPercent: 0,
            roe: 0,
            isReal: realExecution?.success && !realExecution?.simulated,
            route: realExecution?.route || 'LOCAL',
            // Fee tracking
            venue: entryFee.venue,
            venueIcon: entryFee.icon,
            entryFeeType: orderType,
            entryFeePercent: entryFee.percent,
            entryFeeAmount: entryFee.amount
        };

        // Check if there's an existing position to merge
        const existingIdx = this.positions.findIndex(p => p.symbol === symbol && p.side === side);
        if (existingIdx >= 0) {
            const existing = this.positions[existingIdx];
            const totalSize = existing.size + size;
            const avgPrice = (existing.entryPrice * existing.size + position.entryPrice * size) / totalSize;
            existing.size = totalSize;
            existing.entryPrice = avgPrice;
            existing.margin += margin;
            existing.notional = totalSize * avgPrice;
            existing.liquidationPrice = this.calculateLiquidationPrice(avgPrice, leverage, side);
            existing.isReal = existing.isReal || position.isReal;
            this.save();
            return { success: true, position: existing, action: 'increased', realExecution };
        }

        this.positions.push(position);
        this.save();

        if (typeof showNotification === 'function' && !useRealExecution) {
            showNotification(`${side.toUpperCase()} ${symbol} opened at $${price.toFixed(2)}`, 'success');
        }

        return { success: true, position, action: 'opened', realExecution };
    },

    closePosition(positionId, reason = 'Manual close') {
        const idx = this.positions.findIndex(p => p.id === positionId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const position = this.positions[idx];
        const { pnl, roe } = this.calculatePnL(position);
        const closePrice = this.getPrice(position.symbol);

        // Calculate exit fee (close = usually taker)
        const closeNotional = position.size * closePrice;
        const exitFee = this.getVenueFee(position.route?.toLowerCase() || this.executionMode, 'taker', closeNotional);

        // Add to history with fee tracking
        this.tradeHistory.unshift({
            ...position,
            closePrice,
            closePnl: pnl,
            closeRoe: roe,
            closeTime: Date.now(),
            reason,
            // Exit fee tracking
            exitFeeType: 'taker',
            exitFeePercent: exitFee.percent,
            exitFeeAmount: exitFee.amount,
            // Total fees (entry + exit)
            totalFees: (position.entryFeeAmount || 0) + exitFee.amount
        });

        // Keep only last 100 trades
        if (this.tradeHistory.length > 100) {
            this.tradeHistory = this.tradeHistory.slice(0, 100);
        }

        this.positions.splice(idx, 1);
        this.save();

        if (typeof showNotification === 'function') {
            const pnlStr = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
            const feeStr = exitFee.amount > 0.01 ? ` | Fee: ${exitFee.displayAmount}` : '';
            showNotification(
                `Position closed: ${pnlStr} (${roe.toFixed(1)}% ROE)${feeStr}`,
                pnl >= 0 ? 'success' : 'error'
            );
        }

        return { success: true, pnl, roe, exitFee };
    },

    /**
     * Enable/Disable Liquidation Protection on existing position
     * @param {string} positionId - Position ID
     * @param {boolean} enabled - Enable or disable
     * @param {string} plan - Protection plan (basic, standard, premium)
     */
    setPositionProtection(positionId, enabled, plan = 'standard') {
        const position = this.positions.find(p => p.id === positionId);
        if (!position) return { success: false, error: 'Position not found' };

        const oldProtection = position.liqProtection;
        position.liqProtection = enabled;
        position.liqProtectionPlan = enabled ? plan : null;
        this.save();

        const planIcons = { basic: '🔔', standard: '🛡️', premium: '👑' };

        if (typeof showNotification === 'function') {
            if (enabled) {
                showNotification(`${planIcons[plan] || '🛡️'} Protection ${plan.toUpperCase()} enabled on ${position.symbol}`, 'success');
            } else {
                showNotification(`⚠️ Protection disabled on ${position.symbol}`, 'warning');
            }
        }

        // Emit event for API listeners
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('obelisk:protection-changed', {
                detail: { positionId, enabled, plan, position }
            }));
        }

        return { success: true, position, action: enabled ? 'enabled' : 'disabled' };
    },

    /**
     * Upgrade/Downgrade protection plan on existing position
     */
    upgradeProtectionPlan(positionId, newPlan) {
        const position = this.positions.find(p => p.id === positionId);
        if (!position) return { success: false, error: 'Position not found' };
        if (!position.liqProtection) return { success: false, error: 'Protection not enabled' };

        const oldPlan = position.liqProtectionPlan;
        position.liqProtectionPlan = newPlan;
        this.save();

        if (typeof showNotification === 'function') {
            const planIcons = { basic: '🔔', standard: '🛡️', premium: '👑' };
            showNotification(`${planIcons[newPlan]} Protection changed: ${oldPlan} → ${newPlan}`, 'info');
        }

        return { success: true, position, oldPlan, newPlan };
    },

    /**
     * Get all protected positions
     */
    getProtectedPositions() {
        return this.positions.filter(p => p.liqProtection);
    },

    /**
     * API Interface for external access
     */
    api: {
        // Get all positions
        getPositions() {
            return PerpsModule.positions;
        },

        // Get specific position
        getPosition(id) {
            return PerpsModule.positions.find(p => p.id === id);
        },

        // Enable protection via API
        enableProtection(positionId, plan = 'standard') {
            return PerpsModule.setPositionProtection(positionId, true, plan);
        },

        // Disable protection via API
        disableProtection(positionId) {
            return PerpsModule.setPositionProtection(positionId, false);
        },

        // Change plan via API
        changePlan(positionId, plan) {
            return PerpsModule.upgradeProtectionPlan(positionId, plan);
        },

        // Get protected positions
        getProtected() {
            return PerpsModule.getProtectedPositions();
        },

        // Bulk enable protection on all positions
        enableAllProtection(plan = 'standard') {
            const results = [];
            PerpsModule.positions.forEach(pos => {
                if (!pos.liqProtection) {
                    results.push(PerpsModule.setPositionProtection(pos.id, true, plan));
                }
            });
            return { success: true, count: results.length, results };
        },

        // Bulk disable protection on all positions
        disableAllProtection() {
            const results = [];
            PerpsModule.positions.forEach(pos => {
                if (pos.liqProtection) {
                    results.push(PerpsModule.setPositionProtection(pos.id, false));
                }
            });
            return { success: true, count: results.length, results };
        }
    },

    liquidatePosition(positionId, reason) {
        const idx = this.positions.findIndex(p => p.id === positionId);
        if (idx === -1) return;

        const position = this.positions[idx];

        this.tradeHistory.unshift({
            ...position,
            closePrice: position.liquidationPrice,
            closePnl: -position.margin,
            closeRoe: -100,
            closeTime: Date.now(),
            reason: 'LIQUIDATED: ' + reason
        });

        this.positions.splice(idx, 1);
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`⚠️ ${position.symbol} ${position.side.toUpperCase()} LIQUIDATED`, 'error');
        }
    },

    updatePriceDisplay() {
        const priceEl = document.getElementById('perps-current-price');
        if (priceEl) {
            const price = this.getPrice(this.selectedPair);
            priceEl.textContent = price ? `$${price.toLocaleString()}` : '--';
        }
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const pair = this.pairs.find(p => p.symbol === this.selectedPair) || this.pairs[0];
        const price = this.getPrice(this.selectedPair);
        const funding = this.fundingRates[this.selectedPair];

        el.innerHTML = `
            <div style="display:grid;grid-template-columns:280px 1fr 320px;gap:16px;padding:16px;min-height:600px;">

                <!-- Left Panel: Pairs List -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;overflow-y:auto;max-height:700px;">
                    <h3 style="color:#00ff88;margin:0 0 12px;font-size:14px;">📊 Perpetual Markets</h3>

                    <!-- V2.2: Execution Mode Selector -->
                    <div style="background:rgba(0,0,0,0.4);border-radius:8px;padding:10px;margin-bottom:12px;">
                        <div style="font-size:10px;color:#888;margin-bottom:6px;">EXECUTION MODE</div>
                        <div style="display:flex;gap:3px;margin-bottom:3px;">
                            ${['paper', 'smart'].map(m => {
                                const labels = { paper: '📝 Paper', smart: '🧠 SMART' };
                                const bg = m === 'smart' && this.executionMode === m ? '#ff6600' : (this.executionMode === m ? '#00ff88' : 'rgba(255,255,255,0.1)');
                                return `<button onclick="PerpsModule.setExecutionMode('${m}');PerpsModule.render('perps-container')"
                                    style="flex:1;padding:5px 4px;border:none;border-radius:5px;font-size:10px;font-weight:600;cursor:pointer;
                                           background:${bg};
                                           color:${this.executionMode === m ? '#000' : '#888'};">
                                    ${labels[m]}
                                </button>`;
                            }).join('')}
                        </div>
                        <div style="display:flex;gap:3px;margin-bottom:3px;">
                            ${['gmx', 'gains', 'mux', 'morpher'].map(m => {
                                const labels = { gmx: '💎 GMX', gains: '📈 Gains', mux: '🔷 MUX', morpher: '🟣 Morph' };
                                return `<button onclick="PerpsModule.setExecutionMode('${m}');PerpsModule.render('perps-container')"
                                    style="flex:1;padding:5px 4px;border:none;border-radius:5px;font-size:9px;font-weight:600;cursor:pointer;
                                           background:${this.executionMode === m ? '#00ff88' : 'rgba(255,255,255,0.1)'};
                                           color:${this.executionMode === m ? '#000' : '#666'};">
                                    ${labels[m]}
                                </button>`;
                            }).join('')}
                        </div>
                        <div style="display:flex;gap:3px;">
                            ${['asterdex', 'lighter', 'hyperliquid'].map(m => {
                                const labels = { asterdex: '⭐ Aster', lighter: '💡 Light', hyperliquid: '🌊 Hyper' };
                                return `<button onclick="PerpsModule.setExecutionMode('${m}');PerpsModule.render('perps-container')"
                                    style="flex:1;padding:5px 4px;border:none;border-radius:5px;font-size:9px;font-weight:600;cursor:pointer;
                                           background:${this.executionMode === m ? '#00ff88' : 'rgba(255,255,255,0.1)'};
                                           color:${this.executionMode === m ? '#000' : '#666'};">
                                    ${labels[m]}
                                </button>`;
                            }).join('')}
                        </div>
                        <div style="font-size:9px;color:#666;margin-top:6px;text-align:center;">
                            ${{
                                paper: '⚠️ Simulation - No real money',
                                smart: '🧠 Auto-routes to LOWEST FEE venue',
                                hyperliquid: '🔴 REAL trades on Hyperliquid',
                                gmx: '🔴 REAL trades on GMX (Arbitrum)',
                                gains: '🔴 REAL trades on Gains Network',
                                mux: '🔴 REAL trades on MUX Protocol',
                                morpher: '🔴 REAL trades on Morpher (0% fee)',
                                asterdex: '🔴 REAL trades on AsterDEX',
                                lighter: '🔴 REAL trades on Lighter (0% maker)'
                            }[this.executionMode] || '⚠️ Unknown mode'}
                        </div>
                        ${this.executionMode === 'paper' ? `<div style="color:#00ff88;font-size:11px;text-align:center;margin-top:4px;">Balance: $${this.paperBalance.toLocaleString()}</div>` : ''}

                        <!-- Fee Display for Current Venue -->
                        ${(() => {
                            const feeInfo = this.getVenueFee(this.executionMode, 'taker', 1000);
                            return `
                            <div style="margin-top:8px;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;font-size:10px;">
                                <div style="display:flex;justify-content:space-between;color:#888;">
                                    <span>${feeInfo.icon} ${feeInfo.venue} Fees:</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;margin-top:4px;">
                                    <span style="color:#00ff88;">Maker:</span>
                                    <span style="color:#fff;">${feeInfo.makerPercent}%</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;">
                                    <span style="color:#ffaa00;">Taker:</span>
                                    <span style="color:#fff;">${feeInfo.takerPercent}%</span>
                                </div>
                                ${feeInfo.note ? `<div style="color:#666;font-size:9px;margin-top:4px;">${feeInfo.note}</div>` : ''}
                            </div>`;
                        })()}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        ${this.pairs.map(p => {
                            const pPrice = this.getPrice(p.symbol);
                            const isSelected = p.symbol === this.selectedPair;
                            return `
                                <div onclick="PerpsModule.selectPair('${p.symbol}')"
                                     style="padding:10px 12px;background:${isSelected ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.03)'};
                                            border:1px solid ${isSelected ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)'};
                                            border-radius:8px;cursor:pointer;transition:all 0.2s;display:flex;justify-content:space-between;align-items:center;"
                                     onmouseover="this.style.background='rgba(0,255,136,0.1)'"
                                     onmouseout="this.style.background='${isSelected ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.03)'}'">
                                    <div>
                                        <span style="font-size:16px;margin-right:6px;">${p.icon}</span>
                                        <span style="font-weight:600;color:#fff;">${p.symbol.split('/')[0]}</span>
                                        <span style="font-size:10px;color:#888;margin-left:4px;">${p.maxLeverage}x</span>
                                    </div>
                                    <span style="color:#00ff88;font-size:12px;font-weight:600;">
                                        ${pPrice ? '$' + pPrice.toLocaleString(undefined, {maximumFractionDigits: 2}) : '--'}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Center: Chart & Positions -->
                <div style="display:flex;flex-direction:column;gap:16px;">

                    <!-- Price Header -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <span style="font-size:24px;margin-right:8px;">${pair.icon}</span>
                            <span style="font-size:20px;font-weight:700;color:#fff;">${this.selectedPair}</span>
                            <span style="font-size:12px;color:#888;margin-left:8px;">Perpetual</span>
                        </div>
                        <div style="text-align:right;">
                            <div id="perps-current-price" style="font-size:24px;font-weight:700;color:#00ff88;">
                                ${price ? '$' + price.toLocaleString() : '--'}
                            </div>
                            <div style="font-size:11px;color:#888;">
                                Funding: <span style="color:${funding?.rate >= 0 ? '#22c55e' : '#ef4444'}">
                                    ${funding?.rate ? (funding.rate > 0 ? '+' : '') + funding.rate.toFixed(4) + '%' : '--'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Chart Placeholder -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;flex:1;min-height:300px;display:flex;align-items:center;justify-content:center;">
                        <div style="text-align:center;color:#888;">
                            <div style="font-size:48px;margin-bottom:12px;">📈</div>
                            <div>TradingView Chart</div>
                            <div style="font-size:11px;margin-top:8px;">Real-time ${this.selectedPair} chart</div>
                        </div>
                    </div>

                    <!-- Open Positions -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;">
                        <h3 style="color:#00ff88;margin:0 0 12px;font-size:14px;">📋 Open Positions (${this.positions.length})</h3>
                        ${this.positions.length === 0 ? `
                            <div style="text-align:center;padding:20px;color:#888;">
                                No open positions
                            </div>
                        ` : `
                            <div style="overflow-x:auto;">
                                <table style="width:100%;border-collapse:collapse;font-size:12px;">
                                    <thead>
                                        <tr style="color:#888;border-bottom:1px solid rgba(255,255,255,0.1);">
                                            <th style="text-align:left;padding:8px;">Symbol</th>
                                            <th style="text-align:left;padding:8px;">Side</th>
                                            <th style="text-align:right;padding:8px;">Size</th>
                                            <th style="text-align:right;padding:8px;">Entry</th>
                                            <th style="text-align:right;padding:8px;">Mark</th>
                                            <th style="text-align:right;padding:8px;">Liq.</th>
                                            <th style="text-align:right;padding:8px;">PnL</th>
                                            <th style="text-align:right;padding:8px;">ROE</th>
                                            <th style="text-align:center;padding:8px;">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.positions.map(pos => {
                                            const pnlColor = pos.unrealizedPnl >= 0 ? '#22c55e' : '#ef4444';
                                            return `
                                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                                    <td style="padding:8px;font-weight:600;">
                                                        ${pos.symbol}
                                                        <div style="font-size:9px;color:#888;" title="Venue: ${pos.venue || 'Paper'} | Entry Fee: ${pos.entryFeeType || 'taker'} ${(pos.entryFeePercent || 0).toFixed(3)}%">
                                                            ${pos.venueIcon || '📝'} ${pos.entryFeeType || 'taker'}: ${(pos.entryFeePercent || 0).toFixed(3)}%
                                                        </div>
                                                    </td>
                                                    <td style="padding:8px;">
                                                        <span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;
                                                                     background:${pos.side === 'long' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'};
                                                                     color:${pos.side === 'long' ? '#22c55e' : '#ef4444'};">
                                                            ${pos.side.toUpperCase()} ${pos.leverage}x
                                                        </span>
                                                    </td>
                                                    <td style="padding:8px;text-align:right;">${pos.size}</td>
                                                    <td style="padding:8px;text-align:right;">$${pos.entryPrice.toFixed(2)}</td>
                                                    <td style="padding:8px;text-align:right;">$${(pos.markPrice || 0).toFixed(2)}</td>
                                                    <td style="padding:8px;text-align:right;color:#f59e0b;">
                                                        $${pos.liquidationPrice.toFixed(2)}
                                                        ${pos.liqProtection ? `<span title="${pos.liqProtectionPlan} protection" style="margin-left:4px;">${pos.liqProtectionPlan === 'basic' ? '🔔' : pos.liqProtectionPlan === 'standard' ? '🛡️' : '👑'}</span>` : ''}
                                                    </td>
                                                    <td style="padding:8px;text-align:right;color:${pnlColor};font-weight:600;">
                                                        ${pos.unrealizedPnl >= 0 ? '+' : ''}$${pos.unrealizedPnl.toFixed(2)}
                                                    </td>
                                                    <td style="padding:8px;text-align:right;color:${pnlColor};font-weight:600;">
                                                        ${pos.roe >= 0 ? '+' : ''}${pos.roe.toFixed(1)}%
                                                    </td>
                                                    <td style="padding:8px;text-align:center;">
                                                        <div style="display:flex;gap:4px;justify-content:center;">
                                                            ${pos.liqProtection ? `
                                                                <button onclick="PerpsModule.setPositionProtection('${pos.id}', false);PerpsModule.render('perps-container')"
                                                                        title="Disable protection"
                                                                        style="padding:4px 8px;background:rgba(245,158,11,0.2);border:1px solid rgba(245,158,11,0.4);
                                                                               border-radius:4px;color:#f59e0b;cursor:pointer;font-size:10px;">
                                                                    🛡️✕
                                                                </button>
                                                            ` : `
                                                                <button onclick="PerpsModule.setPositionProtection('${pos.id}', true, 'standard');PerpsModule.render('perps-container')"
                                                                        title="Enable protection"
                                                                        style="padding:4px 8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);
                                                                               border-radius:4px;color:#888;cursor:pointer;font-size:10px;">
                                                                    🛡️+
                                                                </button>
                                                            `}
                                                            <button onclick="PerpsModule.closePosition('${pos.id}')"
                                                                    style="padding:4px 8px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);
                                                                           border-radius:4px;color:#ef4444;cursor:pointer;font-size:10px;font-weight:600;">
                                                                Close
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>

                    <!-- Trade History -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;">
                        <h3 style="color:#00ff88;margin:0 0 12px;font-size:14px;">📜 Trade History</h3>
                        ${this.tradeHistory.length === 0 ? `
                            <div style="text-align:center;padding:20px;color:#888;">No trades yet</div>
                        ` : `
                            <div style="max-height:200px;overflow-y:auto;">
                                ${this.tradeHistory.slice(0, 10).map(trade => {
                                    const pnlColor = trade.closePnl >= 0 ? '#22c55e' : '#ef4444';
                                    const totalFees = trade.totalFees || 0;
                                    return `
                                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;
                                                    border-bottom:1px solid rgba(255,255,255,0.05);font-size:11px;">
                                            <div>
                                                <span style="color:${trade.side === 'long' ? '#22c55e' : '#ef4444'};font-weight:600;">
                                                    ${trade.side.toUpperCase()}
                                                </span>
                                                <span style="color:#fff;margin-left:6px;">${trade.symbol}</span>
                                                <span style="color:#888;margin-left:6px;">${trade.leverage}x</span>
                                                <span style="color:#666;margin-left:4px;font-size:9px;">${trade.venueIcon || ''}</span>
                                            </div>
                                            <div style="text-align:right;">
                                                <div style="color:${pnlColor};font-weight:600;">
                                                    ${trade.closePnl >= 0 ? '+' : ''}$${trade.closePnl.toFixed(2)}
                                                </div>
                                                ${totalFees > 0.01 ? `<div style="font-size:9px;color:#888;">Fees: $${totalFees.toFixed(2)}</div>` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>
                </div>

                <!-- Right Panel: Order Form -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;">
                    <h3 style="color:#00ff88;margin:0 0 16px;font-size:14px;">📝 Place Order</h3>

                    <!-- Margin Mode -->
                    <div style="display:flex;gap:8px;margin-bottom:16px;">
                        <button onclick="PerpsModule.setMarginMode('cross')" id="btn-margin-cross"
                                style="flex:1;padding:8px;border-radius:6px;cursor:pointer;font-weight:600;font-size:12px;
                                       background:${this.marginMode === 'cross' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)'};
                                       border:1px solid ${this.marginMode === 'cross' ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)'};
                                       color:${this.marginMode === 'cross' ? '#00ff88' : '#888'};">
                            Cross
                        </button>
                        <button onclick="PerpsModule.setMarginMode('isolated')" id="btn-margin-isolated"
                                style="flex:1;padding:8px;border-radius:6px;cursor:pointer;font-weight:600;font-size:12px;
                                       background:${this.marginMode === 'isolated' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)'};
                                       border:1px solid ${this.marginMode === 'isolated' ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)'};
                                       color:${this.marginMode === 'isolated' ? '#00ff88' : '#888'};">
                            Isolated
                        </button>
                    </div>

                    <!-- Order Type -->
                    <div style="display:flex;gap:8px;margin-bottom:16px;">
                        <button onclick="PerpsModule.setOrderType('market')" id="btn-type-market"
                                style="flex:1;padding:8px;border-radius:6px;cursor:pointer;font-weight:600;font-size:11px;
                                       background:${this.orderType === 'market' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)'};
                                       border:1px solid ${this.orderType === 'market' ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'};
                                       color:${this.orderType === 'market' ? '#a855f7' : '#888'};">
                            Market
                        </button>
                        <button onclick="PerpsModule.setOrderType('limit')" id="btn-type-limit"
                                style="flex:1;padding:8px;border-radius:6px;cursor:pointer;font-weight:600;font-size:11px;
                                       background:${this.orderType === 'limit' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)'};
                                       border:1px solid ${this.orderType === 'limit' ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'};
                                       color:${this.orderType === 'limit' ? '#a855f7' : '#888'};">
                            Limit
                        </button>
                        <button onclick="PerpsModule.setOrderType('stop')" id="btn-type-stop"
                                style="flex:1;padding:8px;border-radius:6px;cursor:pointer;font-weight:600;font-size:11px;
                                       background:${this.orderType === 'stop' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)'};
                                       border:1px solid ${this.orderType === 'stop' ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'};
                                       color:${this.orderType === 'stop' ? '#a855f7' : '#888'};">
                            Stop
                        </button>
                    </div>

                    <!-- Leverage Slider -->
                    <div style="margin-bottom:16px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#888;font-size:12px;">Leverage</span>
                            <span id="leverage-display" style="color:#00ff88;font-weight:700;">${this.leverage}x</span>
                        </div>
                        <input type="range" id="leverage-slider" min="1" max="${pair.maxLeverage}" value="${this.leverage}"
                               oninput="PerpsModule.setLeverage(this.value)"
                               style="width:100%;height:6px;border-radius:3px;background:rgba(255,255,255,0.1);cursor:pointer;">
                        <div style="display:flex;justify-content:space-between;margin-top:4px;">
                            ${[1, 5, 10, 25, 50, pair.maxLeverage].filter(l => l <= pair.maxLeverage).map(l => `
                                <button onclick="PerpsModule.setLeverage(${l})"
                                        style="padding:4px 8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                                               border-radius:4px;color:#888;font-size:10px;cursor:pointer;">${l}x</button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Size Input -->
                    <div style="margin-bottom:16px;">
                        <label style="color:#888;font-size:12px;display:block;margin-bottom:6px;">Size (${pair.symbol.split('/')[0]})</label>
                        <div style="display:flex;gap:8px;">
                            <input type="number" id="perps-size" step="${pair.minSize}" min="${pair.minSize}" placeholder="${pair.minSize}"
                                   style="flex:1;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                                          border-radius:8px;color:#fff;font-size:14px;">
                            <button onclick="PerpsModule.setMaxSize()"
                                    style="padding:8px 12px;background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.4);
                                           border-radius:8px;color:#a855f7;font-weight:600;cursor:pointer;font-size:11px;">MAX</button>
                        </div>
                    </div>

                    <!-- Limit Price (if applicable) -->
                    <div id="limit-price-container" style="margin-bottom:16px;display:${this.orderType !== 'market' ? 'block' : 'none'};">
                        <label style="color:#888;font-size:12px;display:block;margin-bottom:6px;">
                            ${this.orderType === 'stop' ? 'Stop Price' : 'Limit Price'}
                        </label>
                        <input type="number" id="perps-limit-price" step="${pair.tickSize}" placeholder="${price || 0}"
                               style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                                      border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                    </div>

                    <!-- TP/SL -->
                    <div style="margin-bottom:16px;">
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;">
                                <label style="color:#888;font-size:11px;display:block;margin-bottom:4px;">Take Profit</label>
                                <input type="number" id="perps-tp" step="${pair.tickSize}" placeholder="Optional"
                                       style="width:100%;padding:10px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);
                                              border-radius:6px;color:#22c55e;font-size:12px;box-sizing:border-box;">
                            </div>
                            <div style="flex:1;">
                                <label style="color:#888;font-size:11px;display:block;margin-bottom:4px;">Stop Loss</label>
                                <input type="number" id="perps-sl" step="${pair.tickSize}" placeholder="Optional"
                                       style="width:100%;padding:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);
                                              border-radius:6px;color:#ef4444;font-size:12px;box-sizing:border-box;">
                            </div>
                        </div>
                    </div>

                    <!-- Liquidation Protection -->
                    <div style="margin-bottom:16px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-size:16px;">🛡️</span>
                                <span style="color:#f59e0b;font-weight:600;font-size:12px;">Liquidation Protection</span>
                            </div>
                            <label style="display:flex;align-items:center;cursor:pointer;">
                                <input type="checkbox" id="liq-protection-toggle" ${this.liqProtectionEnabled ? 'checked' : ''}
                                       onchange="PerpsModule.toggleLiqProtection(this.checked)"
                                       style="width:18px;height:18px;accent-color:#f59e0b;cursor:pointer;">
                            </label>
                        </div>
                        <div id="liq-protection-options" style="display:${this.liqProtectionEnabled ? 'block' : 'none'};">
                            <div style="display:flex;gap:6px;margin-bottom:8px;">
                                <button onclick="PerpsModule.setLiqProtectionPlan('basic')"
                                        style="flex:1;padding:6px;border-radius:4px;font-size:10px;cursor:pointer;
                                               background:${this.liqProtectionPlan === 'basic' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'};
                                               border:1px solid ${this.liqProtectionPlan === 'basic' ? '#f59e0b' : 'rgba(255,255,255,0.1)'};
                                               color:${this.liqProtectionPlan === 'basic' ? '#f59e0b' : '#888'};">
                                    🔔 Basic
                                </button>
                                <button onclick="PerpsModule.setLiqProtectionPlan('standard')"
                                        style="flex:1;padding:6px;border-radius:4px;font-size:10px;cursor:pointer;
                                               background:${this.liqProtectionPlan === 'standard' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'};
                                               border:1px solid ${this.liqProtectionPlan === 'standard' ? '#f59e0b' : 'rgba(255,255,255,0.1)'};
                                               color:${this.liqProtectionPlan === 'standard' ? '#f59e0b' : '#888'};">
                                    🛡️ Standard
                                </button>
                                <button onclick="PerpsModule.setLiqProtectionPlan('premium')"
                                        style="flex:1;padding:6px;border-radius:4px;font-size:10px;cursor:pointer;
                                               background:${this.liqProtectionPlan === 'premium' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'};
                                               border:1px solid ${this.liqProtectionPlan === 'premium' ? '#f59e0b' : 'rgba(255,255,255,0.1)'};
                                               color:${this.liqProtectionPlan === 'premium' ? '#f59e0b' : '#888'};">
                                    👑 Premium
                                </button>
                            </div>
                            <div style="color:#888;font-size:10px;line-height:1.4;">
                                ${this.liqProtectionPlan === 'basic' ? '🔔 Alert only at 80% to liquidation' :
                                  this.liqProtectionPlan === 'standard' ? '🛡️ Auto-add collateral at 85% (0.2%/mo)' :
                                  '👑 Auto-close at 90% + refund guarantee (0.5%/mo)'}
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div id="order-summary" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;margin-bottom:16px;font-size:11px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                            <span style="color:#888;">Margin Required</span>
                            <span id="margin-required" style="color:#fff;">$0.00</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                            <span style="color:#888;">Notional Value</span>
                            <span id="notional-value" style="color:#fff;">$0.00</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span style="color:#888;">Est. Liq. Price</span>
                            <span id="est-liq" style="color:#f59e0b;">--</span>
                        </div>
                    </div>

                    <!-- Long/Short Buttons -->
                    <div style="display:flex;gap:12px;">
                        <button onclick="PerpsModule.submitOrder('long')"
                                style="flex:1;padding:16px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;
                                       border-radius:10px;color:#fff;font-weight:700;font-size:14px;cursor:pointer;
                                       transition:all 0.3s;box-shadow:0 4px 15px rgba(34,197,94,0.3);"
                                onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(34,197,94,0.4)'"
                                onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(34,197,94,0.3)'">
                            🟢 Long / Buy
                        </button>
                        <button onclick="PerpsModule.submitOrder('short')"
                                style="flex:1;padding:16px;background:linear-gradient(135deg,#ef4444,#dc2626);border:none;
                                       border-radius:10px;color:#fff;font-weight:700;font-size:14px;cursor:pointer;
                                       transition:all 0.3s;box-shadow:0 4px 15px rgba(239,68,68,0.3);"
                                onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(239,68,68,0.4)'"
                                onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(239,68,68,0.3)'">
                            🔴 Short / Sell
                        </button>
                    </div>

                    <!-- Account Stats -->
                    <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                        <h4 style="color:#888;font-size:12px;margin:0 0 12px;">Account</h4>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;">
                            <div>
                                <div style="color:#888;">Total Balance</div>
                                <div style="color:#fff;font-weight:600;">$${this.getTotalBalance().toFixed(2)}</div>
                            </div>
                            <div>
                                <div style="color:#888;">Available</div>
                                <div style="color:#00ff88;font-weight:600;">$${this.getAvailableBalance().toFixed(2)}</div>
                            </div>
                            <div>
                                <div style="color:#888;">Unrealized PnL</div>
                                <div style="color:${this.getTotalUnrealizedPnL() >= 0 ? '#22c55e' : '#ef4444'};font-weight:600;">
                                    ${this.getTotalUnrealizedPnL() >= 0 ? '+' : ''}$${this.getTotalUnrealizedPnL().toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div style="color:#888;">Margin Used</div>
                                <div style="color:#f59e0b;font-weight:600;">$${this.getTotalMargin().toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup size input listener for order summary
        setTimeout(() => {
            const sizeInput = document.getElementById('perps-size');
            if (sizeInput) {
                sizeInput.addEventListener('input', () => this.updateOrderSummary());
            }
        }, 100);
    },

    selectPair(symbol) {
        this.selectedPair = symbol;
        const pair = this.pairs.find(p => p.symbol === symbol);
        if (pair && this.leverage > pair.maxLeverage) {
            this.leverage = pair.maxLeverage;
        }
        this.render('perps-container');
    },

    setMarginMode(mode) {
        this.marginMode = mode;
        this.render('perps-container');
    },

    toggleLiqProtection(enabled) {
        this.liqProtectionEnabled = enabled;
        const optionsEl = document.getElementById('liq-protection-options');
        if (optionsEl) {
            optionsEl.style.display = enabled ? 'block' : 'none';
        }
        if (enabled && typeof showNotification === 'function') {
            showNotification(`🛡️ Liquidation Protection ${this.liqProtectionPlan.toUpperCase()} enabled`, 'success');
        }
    },

    setLiqProtectionPlan(plan) {
        this.liqProtectionPlan = plan;
        this.render('perps-container');
        if (typeof showNotification === 'function') {
            const planInfo = {
                basic: '🔔 Alert only - Get notified at 80% to liquidation',
                standard: '🛡️ Auto-collateral - Add margin at 85% threshold',
                premium: '👑 Auto-close - Close position at 90% with refund'
            };
            showNotification(planInfo[plan] || 'Plan updated', 'info');
        }
    },

    setOrderType(type) {
        this.orderType = type;
        this.render('perps-container');
    },

    setLeverage(value) {
        this.leverage = parseInt(value);
        const display = document.getElementById('leverage-display');
        if (display) display.textContent = this.leverage + 'x';
        const slider = document.getElementById('leverage-slider');
        if (slider) slider.value = this.leverage;
        this.updateOrderSummary();
    },

    setMaxSize() {
        const available = this.getAvailableBalance();
        const price = this.getPrice(this.selectedPair);
        if (!price) return;

        const maxNotional = available * this.leverage * 0.95; // 95% to leave margin
        const maxSize = maxNotional / price;

        const sizeInput = document.getElementById('perps-size');
        if (sizeInput) {
            sizeInput.value = maxSize.toFixed(4);
            this.updateOrderSummary();
        }
    },

    updateOrderSummary() {
        const sizeInput = document.getElementById('perps-size');
        const size = parseFloat(sizeInput?.value) || 0;
        const price = this.getPrice(this.selectedPair);

        if (!price || !size) {
            document.getElementById('margin-required').textContent = '$0.00';
            document.getElementById('notional-value').textContent = '$0.00';
            document.getElementById('est-liq').textContent = '--';
            return;
        }

        const notional = size * price;
        const margin = notional / this.leverage;
        const liqPrice = this.calculateLiquidationPrice(price, this.leverage, 'long');

        document.getElementById('margin-required').textContent = '$' + margin.toFixed(2);
        document.getElementById('notional-value').textContent = '$' + notional.toFixed(2);
        document.getElementById('est-liq').textContent = '$' + liqPrice.toFixed(2);
    },

    submitOrder(side) {
        const sizeInput = document.getElementById('perps-size');
        const size = parseFloat(sizeInput?.value);

        if (!size || size <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Please enter a valid size', 'error');
            }
            return;
        }

        const tpInput = document.getElementById('perps-tp');
        const slInput = document.getElementById('perps-sl');
        const limitInput = document.getElementById('perps-limit-price');

        const options = {
            takeProfit: parseFloat(tpInput?.value) || null,
            stopLoss: parseFloat(slInput?.value) || null,
            limitPrice: this.orderType !== 'market' ? parseFloat(limitInput?.value) : null,
            marginMode: this.marginMode,
            liqProtection: this.liqProtectionEnabled,
            liqProtectionPlan: this.liqProtectionEnabled ? this.liqProtectionPlan : null
        };

        // Notify if liquidation protection is enabled
        if (this.liqProtectionEnabled && typeof showNotification === 'function') {
            const planIcons = { basic: '🔔', standard: '🛡️', premium: '👑' };
            showNotification(`${planIcons[this.liqProtectionPlan] || '🛡️'} Position protected with ${this.liqProtectionPlan.toUpperCase()} plan`, 'info');
        }

        const result = this.openPosition(this.selectedPair, side, size, this.leverage, options);

        if (result.success) {
            this.render('perps-container');
        }
    },

    getTotalBalance() {
        // Get from SimulatedPortfolio if available
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.portfolio) {
            return SimulatedPortfolio.portfolio.simulatedBalance || 10000;
        }
        return 10000;
    },

    getAvailableBalance() {
        return this.getTotalBalance() - this.getTotalMargin();
    },

    getTotalMargin() {
        return this.positions.reduce((sum, pos) => sum + pos.margin, 0);
    },

    getTotalUnrealizedPnL() {
        return this.positions.reduce((sum, pos) => sum + (pos.unrealizedPnl || 0), 0);
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => PerpsModule.init());
console.log('[Perps] Module loaded');
