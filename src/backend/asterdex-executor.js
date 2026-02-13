// ===============================================================================
// OBELISK - ASTERDEX EXECUTOR V1.0
// Perpetual futures trading on AsterDEX (Arbitrum/BNB)
// REST API (Binance-like), HMAC SHA256 auth
// Up to 200x leverage, 75+ pairs, SL/TP via conditional orders
// ===============================================================================
console.log('[ASTER-EXEC] V1.0 LOADED');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const crypto = require('crypto');
const fs = require('fs');

// ===============================================================================
// CONFIGURATION
// ===============================================================================

const ASTER_BASE_URL = 'https://fapi.asterdex.com';
const ASTER_WS_URL = 'wss://fstream.asterdex.com';

// Data persistence
const DATA_FILE = path.join(__dirname, 'data', 'aster_trades.json');

// ===============================================================================
// ASTERDEX EXECUTOR CLASS
// ===============================================================================

class AsterDexExecutor {
    constructor() {
        this.apiKey = process.env.ASTERDEX_API_KEY || null;
        this.apiSecret = process.env.ASTERDEX_API_SECRET || null;
        this.initialized = false;
        this.stats = { orders: 0, filled: 0, failed: 0, volume: 0 };
        this.activeTrades = [];
        this.supportedSymbols = [];
    }

    async init() {
        try {
            if (!this.apiKey || !this.apiSecret) {
                console.log('[ASTER-EXEC] No API key/secret, simulation mode');
                return false;
            }

            // Test connectivity
            const pingRes = await this.publicRequest('GET', '/fapi/v3/ping');
            if (pingRes === null) {
                console.log('[ASTER-EXEC] API connectivity failed');
                return false;
            }

            // Get exchange info for supported symbols
            const exchangeInfo = await this.publicRequest('GET', '/fapi/v3/exchangeInfo');
            if (exchangeInfo?.symbols) {
                this.supportedSymbols = exchangeInfo.symbols.map(s => s.symbol);
                console.log(`[ASTER-EXEC] ${this.supportedSymbols.length} symbols available`);
            }

            // Check account balance
            try {
                const account = await this.signedRequest('GET', '/fapi/v3/account');
                if (account?.totalWalletBalance) {
                    console.log(`[ASTER-EXEC] Wallet Balance: $${parseFloat(account.totalWalletBalance).toFixed(2)}`);
                    console.log(`[ASTER-EXEC] Available: $${parseFloat(account.availableBalance).toFixed(2)}`);
                }
            } catch (accErr) {
                console.log(`[ASTER-EXEC] Account query failed: ${accErr.message}`);
            }

            this.loadTrades();
            this.initialized = true;
            console.log('[ASTER-EXEC] Initialized successfully');
            return true;

        } catch (err) {
            console.error('[ASTER-EXEC] Init error:', err.message);
            return false;
        }
    }

    // ===============================================================================
    // API HELPERS
    // ===============================================================================

    sign(queryString) {
        return crypto.createHmac('sha256', this.apiSecret)
            .update(queryString)
            .digest('hex');
    }

    async publicRequest(method, endpoint, params = {}) {
        try {
            const qs = new URLSearchParams(params).toString();
            const url = `${ASTER_BASE_URL}${endpoint}${qs ? '?' + qs : ''}`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                const errText = await res.text();
                console.log(`[ASTER-EXEC] API error ${res.status}: ${errText}`);
                return null;
            }

            return await res.json();
        } catch (e) {
            console.error('[ASTER-EXEC] Request error:', e.message);
            return null;
        }
    }

    async signedRequest(method, endpoint, params = {}) {
        params.timestamp = Date.now();
        params.recvWindow = 5000;

        const queryString = new URLSearchParams(params).toString();
        const signature = this.sign(queryString);
        const fullQs = `${queryString}&signature=${signature}`;

        const url = method === 'GET'
            ? `${ASTER_BASE_URL}${endpoint}?${fullQs}`
            : `${ASTER_BASE_URL}${endpoint}`;

        const fetchOpts = {
            method,
            headers: {
                'X-MBX-APIKEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        if (method !== 'GET') {
            fetchOpts.body = fullQs;
        }

        const res = await fetch(url, fetchOpts);

        if (!res.ok) {
            const errData = await res.json().catch(() => ({ msg: res.statusText }));
            throw new Error(`AsterDEX ${res.status}: ${errData.msg || JSON.stringify(errData)}`);
        }

        return await res.json();
    }

    // ===============================================================================
    // TRADING
    // ===============================================================================

    async openPosition(order) {
        this.stats.orders++;

        if (!this.initialized) {
            return this.simulateOrder(order, 'OPEN');
        }

        try {
            const { coin, side, size, leverage = 10, tp = 0, sl = 0 } = order;
            const isLong = side.toLowerCase() === 'buy' || side.toLowerCase() === 'long';

            // Build symbol (e.g., BTC -> BTCUSDT)
            const symbol = `${coin.toUpperCase()}USDT`;

            if (!this.supportedSymbols.includes(symbol)) {
                console.log(`[ASTER-EXEC] Unsupported symbol: ${symbol}`);
                return this.simulateOrder(order, 'UNSUPPORTED');
            }

            // Set leverage first
            try {
                await this.signedRequest('POST', '/fapi/v3/leverage', {
                    symbol,
                    leverage: Math.min(leverage, 125) // API max is 125
                });
                console.log(`[ASTER-EXEC] Leverage set to ${leverage}x for ${symbol}`);
            } catch (levErr) {
                console.log(`[ASTER-EXEC] Leverage set warning: ${levErr.message}`);
            }

            // Get price
            const price = await this.getPrice(coin);
            if (!price) {
                return { success: false, error: 'Could not get price', simulated: true };
            }

            // Calculate quantity (size in USD / price = quantity in coins)
            const quantity = (size / price).toFixed(6);

            console.log(`[ASTER-EXEC] Opening ${isLong ? 'LONG' : 'SHORT'} ${symbol} qty=${quantity} @ ${leverage}x${tp ? ' TP=$' + tp : ''}${sl ? ' SL=$' + sl : ''}`);

            // Place market order
            const orderResult = await this.signedRequest('POST', '/fapi/v3/order', {
                symbol,
                side: isLong ? 'BUY' : 'SELL',
                type: 'MARKET',
                quantity,
            });

            console.log(`[ASTER-EXEC] Order placed: ${orderResult.orderId}`);

            // Place SL if provided
            let slResult = null;
            if (sl > 0) {
                try {
                    slResult = await this.signedRequest('POST', '/fapi/v3/order', {
                        symbol,
                        side: isLong ? 'SELL' : 'BUY', // Opposite side to close
                        type: 'STOP_MARKET',
                        stopPrice: sl.toString(),
                        closePosition: 'true',
                    });
                    console.log(`[ASTER-EXEC] SL set @ $${sl}`);
                } catch (slErr) {
                    console.log(`[ASTER-EXEC] SL failed: ${slErr.message}`);
                }
            }

            // Place TP if provided
            let tpResult = null;
            if (tp > 0) {
                try {
                    tpResult = await this.signedRequest('POST', '/fapi/v3/order', {
                        symbol,
                        side: isLong ? 'SELL' : 'BUY',
                        type: 'TAKE_PROFIT_MARKET',
                        stopPrice: tp.toString(),
                        closePosition: 'true',
                    });
                    console.log(`[ASTER-EXEC] TP set @ $${tp}`);
                } catch (tpErr) {
                    console.log(`[ASTER-EXEC] TP failed: ${tpErr.message}`);
                }
            }

            this.stats.filled++;
            this.stats.volume += size;

            const avgPrice = parseFloat(orderResult.avgPrice || orderResult.price || price);

            const trade = {
                id: `ASTER_${orderResult.orderId}`,
                orderId: orderResult.orderId,
                symbol,
                coin: coin.toUpperCase(),
                side: isLong ? 'LONG' : 'SHORT',
                size,
                quantity: parseFloat(quantity),
                leverage,
                entryPrice: avgPrice,
                tp, sl,
                tpOrderId: tpResult?.orderId || null,
                slOrderId: slResult?.orderId || null,
                openedAt: Date.now(),
                status: 'open'
            };

            this.activeTrades.push(trade);
            this.saveTrades();

            return {
                success: true,
                order: {
                    id: trade.id,
                    orderId: orderResult.orderId,
                    coin: coin.toUpperCase(),
                    side: trade.side,
                    size,
                    leverage,
                    executionPrice: avgPrice,
                    tp, sl,
                    tpSet: !!tpResult,
                    slSet: !!slResult,
                    status: orderResult.status || 'FILLED',
                    filledAt: Date.now(),
                },
                simulated: false,
                route: 'ASTERDEX',
                fee: size * 0.00035 // 0.035% taker
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[ASTER-EXEC] Open error:', err.message);
            return this.simulateOrder(order, 'OPEN');
        }
    }

    async closePosition(order) {
        this.stats.orders++;

        if (!this.initialized) {
            return this.simulateOrder(order, 'CLOSE');
        }

        try {
            const { coin, side, size } = order;
            const isLong = side.toLowerCase() === 'long' || side.toLowerCase() === 'buy';
            const symbol = `${coin.toUpperCase()}USDT`;

            const price = await this.getPrice(coin);
            const quantity = size ? (size / (price || 1)).toFixed(6) : undefined;

            console.log(`[ASTER-EXEC] Closing ${isLong ? 'LONG' : 'SHORT'} ${symbol}`);

            // Close by placing opposite market order
            const params = {
                symbol,
                side: isLong ? 'SELL' : 'BUY',
                type: 'MARKET',
                reduceOnly: 'true',
            };
            if (quantity) params.quantity = quantity;

            const result = await this.signedRequest('POST', '/fapi/v3/order', params);

            this.stats.filled++;

            // Update local trade
            const trade = this.activeTrades.find(t => t.coin === coin.toUpperCase() && t.status === 'open');
            if (trade) {
                trade.status = 'closed';
                trade.closedAt = Date.now();
                this.saveTrades();
            }

            return {
                success: true,
                order: {
                    id: `CLOSE_ASTER_${result.orderId}`,
                    orderId: result.orderId,
                    coin: coin.toUpperCase(),
                    side: `CLOSE_${isLong ? 'LONG' : 'SHORT'}`,
                    executionPrice: parseFloat(result.avgPrice || price),
                    status: result.status || 'FILLED',
                    filledAt: Date.now(),
                },
                simulated: false,
                route: 'ASTERDEX_CLOSE'
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[ASTER-EXEC] Close error:', err.message);
            return this.simulateOrder(order, 'CLOSE');
        }
    }

    async updateStopLoss(symbol, side, slPrice) {
        if (!this.initialized) return { success: false, error: 'Not initialized' };

        try {
            const isLong = side.toLowerCase() === 'long' || side.toLowerCase() === 'buy';
            const result = await this.signedRequest('POST', '/fapi/v3/order', {
                symbol: symbol.toUpperCase() + (symbol.includes('USDT') ? '' : 'USDT'),
                side: isLong ? 'SELL' : 'BUY',
                type: 'STOP_MARKET',
                stopPrice: slPrice.toString(),
                closePosition: 'true',
            });
            return { success: true, orderId: result.orderId };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async updateTakeProfit(symbol, side, tpPrice) {
        if (!this.initialized) return { success: false, error: 'Not initialized' };

        try {
            const isLong = side.toLowerCase() === 'long' || side.toLowerCase() === 'buy';
            const result = await this.signedRequest('POST', '/fapi/v3/order', {
                symbol: symbol.toUpperCase() + (symbol.includes('USDT') ? '' : 'USDT'),
                side: isLong ? 'SELL' : 'BUY',
                type: 'TAKE_PROFIT_MARKET',
                stopPrice: tpPrice.toString(),
                closePosition: 'true',
            });
            return { success: true, orderId: result.orderId };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async getPositions() {
        if (!this.initialized) return { success: false, positions: [] };

        try {
            const posData = await this.signedRequest('GET', '/fapi/v2/positionRisk');

            const positions = (posData || [])
                .filter(p => parseFloat(p.positionAmt) !== 0)
                .map(p => ({
                    symbol: p.symbol,
                    coin: p.symbol.replace('USDT', ''),
                    side: parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT',
                    size: Math.abs(parseFloat(p.positionAmt)),
                    sizeUsd: Math.abs(parseFloat(p.notional || 0)).toFixed(2),
                    entryPrice: parseFloat(p.entryPrice),
                    markPrice: parseFloat(p.markPrice),
                    liquidationPrice: parseFloat(p.liquidationPrice),
                    leverage: parseFloat(p.leverage),
                    unrealizedPnl: parseFloat(p.unRealizedProfit),
                    marginType: p.marginType,
                    venue: 'asterdex'
                }));

            return { success: true, count: positions.length, positions };

        } catch (err) {
            console.error('[ASTER-EXEC] getPositions error:', err.message);
            return { success: false, error: err.message, positions: [] };
        }
    }

    // ===============================================================================
    // HELPERS
    // ===============================================================================

    async getPrice(coin) {
        try {
            const symbol = `${coin.toUpperCase()}USDT`;
            const data = await this.publicRequest('GET', '/fapi/v3/ticker/price', { symbol });
            return data ? parseFloat(data.price) : null;
        } catch (e) {
            // Fallback to Binance
            try {
                const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin.toUpperCase()}USDT`);
                const data = await res.json();
                return parseFloat(data.price);
            } catch (e2) {
                return null;
            }
        }
    }

    async execute(order) {
        const { type, action } = order;
        if (type === 'close' || action === 'close') {
            return await this.closePosition(order);
        }
        return await this.openPosition(order);
    }

    simulateOrder(order, type) {
        const { coin, side, size = 50, leverage = 10 } = order;
        return {
            success: true,
            order: {
                id: `SIM_ASTER_${type}_${Date.now()}`,
                coin: coin || 'BTC',
                side: side || 'LONG',
                size, leverage,
                executionPrice: 95000,
                status: 'simulated',
                filledAt: Date.now(),
            },
            simulated: true,
            route: `SIMULATED_ASTER_${type}`,
            fee: size * 0.00035
        };
    }

    loadTrades() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                this.activeTrades = data.trades || [];
                this.stats = { ...this.stats, ...data.stats };
            }
        } catch (e) {}
    }

    saveTrades() {
        try {
            const dir = path.dirname(DATA_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(DATA_FILE, JSON.stringify({
                trades: this.activeTrades,
                stats: this.stats,
                savedAt: new Date().toISOString()
            }, null, 2));
        } catch (e) {}
    }

    getStats() {
        return {
            initialized: this.initialized,
            apiConfigured: !!(this.apiKey && this.apiSecret),
            activeTrades: this.activeTrades.filter(t => t.status === 'open').length,
            supportedSymbols: this.supportedSymbols.length,
            maxLeverage: 200,
            fees: { maker: '0.01%', taker: '0.035%' },
            ...this.stats
        };
    }

    getSupportedPairs() {
        return {
            pairs: this.supportedSymbols,
            count: this.supportedSymbols.length,
            maxLeverage: 200,
            fees: { maker: '0.01%', taker: '0.035%' }
        };
    }

    async getBalances() {
        if (!this.initialized) return { usdt: 0, initialized: false };

        try {
            const account = await this.signedRequest('GET', '/fapi/v3/account');
            return {
                totalBalance: parseFloat(account.totalWalletBalance || 0),
                availableBalance: parseFloat(account.availableBalance || 0),
                unrealizedPnl: parseFloat(account.totalUnrealizedProfit || 0),
                initialized: true
            };
        } catch (err) {
            return { totalBalance: 0, availableBalance: 0, error: err.message };
        }
    }
}

module.exports = { AsterDexExecutor };
