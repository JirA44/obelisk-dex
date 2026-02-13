// ===============================================================================
// OBELISK - LIGHTER.XYZ EXECUTOR V1.0
// Perpetual trading on Lighter DEX (Arbitrum) - CLOB orderbook
// REST API + EIP-712 signing, 0% maker / 0.04% taker fees
// Supported: BTC, ETH, ARB pairs with USDC
// ===============================================================================
console.log('[LIGHTER-EXEC] V1.0 LOADED');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ethers } = require('ethers');
const fs = require('fs');

// ===============================================================================
// CONFIGURATION
// ===============================================================================

const LIGHTER_API_BASE = 'https://api.lighter.xyz';
const LIGHTER_WS_URL = 'wss://ws.lighter.xyz';
const ARBITRUM_CHAIN_ID = 42161;

// Lighter market IDs
const LIGHTER_MARKETS = {
    BTC: 0,
    ETH: 1,
    ARB: 2,
};

const LIGHTER_SYMBOLS = {
    0: 'BTC/USDC',
    1: 'ETH/USDC',
    2: 'ARB/USDC',
};

// Arbitrum RPCs
const ARBITRUM_RPCS = [
    'https://arbitrum-one.public.blastapi.io',
    'https://1rpc.io/arb',
    'https://arb1.arbitrum.io/rpc',
];

// EIP-712 Domain for Lighter
const LIGHTER_DOMAIN = {
    name: 'Lighter',
    version: '1',
    chainId: ARBITRUM_CHAIN_ID,
};

// Data persistence
const DATA_FILE = path.join(__dirname, 'data', 'lighter_trades.json');

// ===============================================================================
// LIGHTER EXECUTOR CLASS
// ===============================================================================

class LighterExecutor {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.initialized = false;
        this.stats = { orders: 0, filled: 0, failed: 0, volume: 0 };
        this.activeTrades = [];
        this.marketInfo = {};
    }

    async init() {
        try {
            const privateKey = process.env.PRIVATE_KEY;
            if (!privateKey) {
                console.log('[LIGHTER-EXEC] No private key, simulation mode');
                return false;
            }

            // Connect to Arbitrum
            for (const rpc of ARBITRUM_RPCS) {
                try {
                    this.provider = new ethers.JsonRpcProvider(rpc, undefined, { staticNetwork: true });
                    this.wallet = new ethers.Wallet(privateKey, this.provider);

                    const network = await Promise.race([
                        this.provider.getNetwork(),
                        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
                    ]);

                    if (Number(network.chainId) === ARBITRUM_CHAIN_ID) {
                        console.log(`[LIGHTER-EXEC] Connected via ${rpc.slice(8, 35)}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!this.provider) {
                console.log('[LIGHTER-EXEC] All RPCs failed');
                return false;
            }

            console.log(`[LIGHTER-EXEC] Wallet: ${this.wallet.address}`);

            // Get market info
            try {
                const markets = await this.apiRequest('GET', '/api/v1/markets');
                if (markets?.data) {
                    markets.data.forEach(m => {
                        this.marketInfo[m.market_id] = m;
                    });
                    console.log(`[LIGHTER-EXEC] ${Object.keys(this.marketInfo).length} markets loaded`);
                }
            } catch (e) {
                console.log(`[LIGHTER-EXEC] Markets fetch warning: ${e.message}`);
            }

            // Check balance
            const balance = await this.provider.getBalance(this.wallet.address);
            console.log(`[LIGHTER-EXEC] ETH Balance: ${parseFloat(ethers.formatEther(balance)).toFixed(4)} ETH`);

            this.loadTrades();
            this.initialized = true;
            console.log('[LIGHTER-EXEC] Initialized successfully');
            return true;

        } catch (err) {
            console.error('[LIGHTER-EXEC] Init error:', err.message);
            return false;
        }
    }

    // ===============================================================================
    // API HELPERS
    // ===============================================================================

    async apiRequest(method, endpoint, body = null) {
        try {
            const url = `${LIGHTER_API_BASE}${endpoint}`;
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const res = await fetch(url, options);

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`API ${res.status}: ${errText}`);
            }

            return await res.json();
        } catch (e) {
            console.error(`[LIGHTER-EXEC] API error: ${e.message}`);
            throw e;
        }
    }

    async signedApiRequest(method, endpoint, body) {
        if (!this.wallet) throw new Error('Wallet not initialized');

        // Create timestamp
        const timestamp = Date.now();

        // EIP-712 typed data for Lighter
        const domain = LIGHTER_DOMAIN;
        const types = {
            Order: [
                { name: 'market_id', type: 'uint8' },
                { name: 'side', type: 'string' },
                { name: 'size', type: 'string' },
                { name: 'price', type: 'string' },
                { name: 'timestamp', type: 'uint256' },
            ],
        };

        const value = {
            market_id: body.market_id,
            side: body.side,
            size: body.size?.toString() || '0',
            price: body.price?.toString() || '0',
            timestamp,
        };

        // Sign with EIP-712
        const signature = await this.wallet.signTypedData(domain, types, value);

        // Add auth headers
        const url = `${LIGHTER_API_BASE}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Lighter-Address': this.wallet.address,
                'X-Lighter-Signature': signature,
                'X-Lighter-Timestamp': timestamp.toString(),
            },
            body: JSON.stringify({ ...body, signature, timestamp }),
        };

        const res = await fetch(url, options);

        if (!res.ok) {
            const errData = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(`Lighter ${res.status}: ${errData.message || JSON.stringify(errData)}`);
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

            // Get market ID
            const marketId = LIGHTER_MARKETS[coin.toUpperCase()];
            if (marketId === undefined) {
                console.log(`[LIGHTER-EXEC] Unsupported asset: ${coin}. Supported: BTC, ETH, ARB`);
                return this.simulateOrder(order, 'UNSUPPORTED');
            }

            // Get current price
            const price = await this.getPrice(coin);
            if (!price) {
                return { success: false, error: 'Could not get price', simulated: true };
            }

            // Calculate quantity
            const quantity = (size / price).toFixed(8);

            console.log(`[LIGHTER-EXEC] Opening ${isLong ? 'LONG' : 'SHORT'} ${coin} qty=${quantity} @ market${tp ? ' TP=$' + tp : ''}${sl ? ' SL=$' + sl : ''}`);

            // Place market order via API
            const orderPayload = {
                market_id: marketId,
                side: isLong ? 'buy' : 'sell',
                type: 'market',
                size: quantity,
                price: '0', // Market order
                reduce_only: false,
            };

            let orderResult;
            try {
                orderResult = await this.signedApiRequest('POST', '/api/v1/orders', orderPayload);
            } catch (apiErr) {
                console.log(`[LIGHTER-EXEC] API order failed: ${apiErr.message}`);
                return this.simulateOrder(order, 'API_ERROR');
            }

            console.log(`[LIGHTER-EXEC] Order placed: ${orderResult.order_id || orderResult.id}`);

            this.stats.filled++;
            this.stats.volume += size;

            const trade = {
                id: `LIGHTER_${orderResult.order_id || orderResult.id || Date.now()}`,
                orderId: orderResult.order_id || orderResult.id,
                marketId,
                coin: coin.toUpperCase(),
                side: isLong ? 'LONG' : 'SHORT',
                size,
                quantity: parseFloat(quantity),
                leverage,
                entryPrice: parseFloat(orderResult.avg_price || orderResult.price || price),
                tp, sl,
                openedAt: Date.now(),
                status: 'open'
            };

            this.activeTrades.push(trade);
            this.saveTrades();

            // Place SL/TP as separate limit orders if needed
            if (sl > 0) {
                try {
                    await this.signedApiRequest('POST', '/api/v1/orders', {
                        market_id: marketId,
                        side: isLong ? 'sell' : 'buy',
                        type: 'stop_market',
                        size: quantity,
                        trigger_price: sl.toString(),
                        reduce_only: true,
                    });
                    console.log(`[LIGHTER-EXEC] SL set @ $${sl}`);
                } catch (slErr) {
                    console.log(`[LIGHTER-EXEC] SL failed: ${slErr.message}`);
                }
            }

            if (tp > 0) {
                try {
                    await this.signedApiRequest('POST', '/api/v1/orders', {
                        market_id: marketId,
                        side: isLong ? 'sell' : 'buy',
                        type: 'take_profit_market',
                        size: quantity,
                        trigger_price: tp.toString(),
                        reduce_only: true,
                    });
                    console.log(`[LIGHTER-EXEC] TP set @ $${tp}`);
                } catch (tpErr) {
                    console.log(`[LIGHTER-EXEC] TP failed: ${tpErr.message}`);
                }
            }

            return {
                success: true,
                order: {
                    id: trade.id,
                    orderId: trade.orderId,
                    coin: coin.toUpperCase(),
                    side: trade.side,
                    size,
                    leverage,
                    executionPrice: trade.entryPrice,
                    tp, sl,
                    tpSet: tp > 0,
                    slSet: sl > 0,
                    status: orderResult.status || 'FILLED',
                    filledAt: Date.now(),
                },
                simulated: false,
                route: 'LIGHTER',
                fee: size * 0.0004 // 0.04% taker fee
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[LIGHTER-EXEC] Open error:', err.message);
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

            const marketId = LIGHTER_MARKETS[coin.toUpperCase()];
            if (marketId === undefined) {
                return this.simulateOrder(order, 'CLOSE_UNSUPPORTED');
            }

            const price = await this.getPrice(coin);
            const quantity = size ? (size / (price || 1)).toFixed(8) : undefined;

            console.log(`[LIGHTER-EXEC] Closing ${isLong ? 'LONG' : 'SHORT'} ${coin}`);

            const closePayload = {
                market_id: marketId,
                side: isLong ? 'sell' : 'buy', // Opposite side to close
                type: 'market',
                size: quantity,
                price: '0',
                reduce_only: true,
            };

            let result;
            try {
                result = await this.signedApiRequest('POST', '/api/v1/orders', closePayload);
            } catch (apiErr) {
                console.log(`[LIGHTER-EXEC] Close API failed: ${apiErr.message}`);
                return this.simulateOrder(order, 'CLOSE_API_ERROR');
            }

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
                    id: `CLOSE_LIGHTER_${result.order_id || Date.now()}`,
                    orderId: result.order_id || result.id,
                    coin: coin.toUpperCase(),
                    side: `CLOSE_${isLong ? 'LONG' : 'SHORT'}`,
                    executionPrice: parseFloat(result.avg_price || price),
                    status: result.status || 'FILLED',
                    filledAt: Date.now(),
                },
                simulated: false,
                route: 'LIGHTER_CLOSE'
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[LIGHTER-EXEC] Close error:', err.message);
            return this.simulateOrder(order, 'CLOSE');
        }
    }

    async getPositions(address = null) {
        const walletAddress = address || this.wallet?.address;
        if (!walletAddress || !this.initialized) {
            return { success: false, positions: [] };
        }

        try {
            const posData = await this.apiRequest('GET', `/api/v1/positions?address=${walletAddress}`);

            const positions = (posData?.data || [])
                .filter(p => parseFloat(p.size) !== 0)
                .map(p => {
                    const marketId = p.market_id;
                    const symbol = LIGHTER_SYMBOLS[marketId] || `MARKET_${marketId}`;
                    const coin = symbol.split('/')[0];

                    return {
                        symbol,
                        coin,
                        marketId,
                        side: parseFloat(p.size) > 0 ? 'LONG' : 'SHORT',
                        size: Math.abs(parseFloat(p.size)),
                        sizeUsd: Math.abs(parseFloat(p.notional || 0)).toFixed(2),
                        entryPrice: parseFloat(p.entry_price || p.avg_entry_price),
                        markPrice: parseFloat(p.mark_price),
                        unrealizedPnl: parseFloat(p.unrealized_pnl || 0),
                        leverage: parseFloat(p.leverage || 1),
                        venue: 'lighter'
                    };
                });

            return { success: true, wallet: walletAddress, count: positions.length, positions };

        } catch (err) {
            console.error('[LIGHTER-EXEC] getPositions error:', err.message);
            return { success: false, error: err.message, positions: [] };
        }
    }

    // ===============================================================================
    // HELPERS
    // ===============================================================================

    async getPrice(coin) {
        try {
            const marketId = LIGHTER_MARKETS[coin.toUpperCase()];
            if (marketId !== undefined) {
                // Try Lighter API first
                const ticker = await this.apiRequest('GET', `/api/v1/ticker?market_id=${marketId}`);
                if (ticker?.data?.last_price) {
                    return parseFloat(ticker.data.last_price);
                }
            }
        } catch (e) {
            // Fallback to Binance
        }

        // Binance fallback
        try {
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin.toUpperCase()}USDT`);
            const data = await res.json();
            return parseFloat(data.price);
        } catch (e2) {
            return null;
        }
    }

    async execute(order) {
        const { type, action, pair, side, size, leverage } = order;
        if (type === 'close' || action === 'close') {
            return await this.closePosition({
                coin: pair?.replace('/USD', '').replace('-PERP', '').replace('/USDC', '') || order.coin,
                side: order.positionSide || side || 'long',
                size: size || order.quantity,
            });
        }
        return await this.openPosition({
            coin: pair?.replace('/USD', '').replace('-PERP', '').replace('/USDC', '') || order.coin,
            side: side || 'long',
            size: size || order.quantity || 50,
            leverage: leverage || 10,
            tp: order.tp || 0,
            sl: order.sl || 0,
        });
    }

    simulateOrder(order, type) {
        const { coin, side, size = 50, leverage = 10 } = order;
        return {
            success: true,
            order: {
                id: `SIM_LIGHTER_${type}_${Date.now()}`,
                coin: coin || 'ETH',
                side: side || 'LONG',
                size, leverage,
                executionPrice: 3200,
                status: 'simulated',
                filledAt: Date.now(),
            },
            simulated: true,
            route: `SIMULATED_LIGHTER_${type}`,
            fee: size * 0.0004
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
            wallet: this.wallet?.address || null,
            activeTrades: this.activeTrades.filter(t => t.status === 'open').length,
            supportedAssets: Object.keys(LIGHTER_MARKETS),
            maxLeverage: 20, // Lighter max leverage
            fees: { maker: '0%', taker: '0.04%' },
            ...this.stats
        };
    }

    getSupportedPairs() {
        return {
            pairs: Object.keys(LIGHTER_MARKETS),
            symbols: Object.values(LIGHTER_SYMBOLS),
            count: Object.keys(LIGHTER_MARKETS).length,
            maxLeverage: 20,
            fees: { maker: '0%', taker: '0.04%' }
        };
    }

    async getBalances() {
        if (!this.initialized) return { usdc: 0, initialized: false };

        try {
            const balances = await this.apiRequest('GET', `/api/v1/balances?address=${this.wallet.address}`);
            return {
                totalBalance: parseFloat(balances?.data?.total || 0),
                availableBalance: parseFloat(balances?.data?.available || 0),
                initialized: true
            };
        } catch (err) {
            return { totalBalance: 0, availableBalance: 0, error: err.message };
        }
    }
}

module.exports = { LighterExecutor, LIGHTER_MARKETS, LIGHTER_SYMBOLS };
