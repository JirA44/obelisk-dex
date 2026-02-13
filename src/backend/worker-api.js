/**
 * OBELISK API - Cloudflare Worker v2.1
 * REST API for trading, lending, market data & backtesting
 */

// ============================================
// BACKTEST ENGINE (Embedded)
// ============================================
class TechnicalIndicators {
    static SMA(data, period) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) result.push(null);
            else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b.close, 0);
                result.push(sum / period);
            }
        }
        return result;
    }

    static RSI(data, period = 14) {
        const result = [];
        const gains = [], losses = [];
        for (let i = 0; i < data.length; i++) {
            if (i === 0) { result.push(50); continue; }
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
            if (i < period) result.push(50);
            else {
                const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
                const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                result.push(100 - (100 / (1 + rs)));
            }
        }
        return result;
    }
}

function generateHistoricalData(pair, days) {
    const basePrices = { 'BTC/USDC': 45000, 'ETH/USDC': 2500, 'SOL/USDC': 100, 'ARB/USDC': 1.20 };
    const volatility = { 'BTC/USDC': 0.03, 'ETH/USDC': 0.04, 'SOL/USDC': 0.06, 'ARB/USDC': 0.08 };

    let price = basePrices[pair] || 100;
    const vol = volatility[pair] || 0.05;
    const data = [];
    const now = Date.now();

    for (let d = days; d >= 0; d--) {
        for (let h = 0; h < 24; h++) {
            const timestamp = now - (d * 86400000) - ((23 - h) * 3600000);
            const change = (Math.random() - 0.5) * 2 * vol;
            const open = price;
            price *= (1 + change);
            data.push({
                timestamp,
                open: Number(open.toFixed(2)),
                high: Number((Math.max(open, price) * (1 + Math.random() * vol * 0.5)).toFixed(2)),
                low: Number((Math.min(open, price) * (1 - Math.random() * vol * 0.5)).toFixed(2)),
                close: Number(price.toFixed(2)),
                volume: Number((price * 1000000 * (0.5 + Math.random())).toFixed(0))
            });
        }
    }
    return data;
}

function runBacktest(data, strategy, initialCapital = 10000) {
    const signals = [];

    if (strategy === 'SMA_CROSSOVER') {
        const fast = TechnicalIndicators.SMA(data, 10);
        const slow = TechnicalIndicators.SMA(data, 30);
        for (let i = 1; i < data.length; i++) {
            if (fast[i] && slow[i] && fast[i-1] && slow[i-1]) {
                if (fast[i] > slow[i] && fast[i-1] <= slow[i-1])
                    signals.push({ i, type: 'BUY', price: data[i].close });
                else if (fast[i] < slow[i] && fast[i-1] >= slow[i-1])
                    signals.push({ i, type: 'SELL', price: data[i].close });
            }
        }
    } else if (strategy === 'RSI_REVERSAL') {
        const rsi = TechnicalIndicators.RSI(data, 14);
        for (let i = 1; i < data.length; i++) {
            if (rsi[i] < 30 && rsi[i-1] >= 30) signals.push({ i, type: 'BUY', price: data[i].close });
            else if (rsi[i] > 70 && rsi[i-1] <= 70) signals.push({ i, type: 'SELL', price: data[i].close });
        }
    } else if (strategy === 'DCA') {
        for (let i = 0; i < data.length; i += 168) signals.push({ i, type: 'BUY', price: data[i].close });
    } else { // BUY_AND_HOLD
        signals.push({ i: 0, type: 'BUY', price: data[0].close });
    }

    // Simulate trades
    let capital = initialCapital, position = 0, entryPrice = 0;
    const trades = [];

    for (const sig of signals) {
        const fee = sig.price * 0.001;
        if (sig.type === 'BUY' && position === 0) {
            position = (capital - fee) / sig.price;
            entryPrice = sig.price;
            capital = 0;
            trades.push({ type: 'BUY', price: sig.price, qty: position });
        } else if (sig.type === 'SELL' && position > 0) {
            const proceeds = position * sig.price - fee;
            const pnl = proceeds - (position * entryPrice);
            trades.push({ type: 'SELL', price: sig.price, qty: position, pnl });
            capital = proceeds;
            position = 0;
        }
    }

    const finalEquity = position > 0 ? position * data[data.length-1].close : capital;
    const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100;
    const buyHold = ((data[data.length-1].close - data[0].close) / data[0].close) * 100;
    const wins = trades.filter(t => t.pnl > 0).length;
    const losses = trades.filter(t => t.pnl && t.pnl <= 0).length;

    return {
        strategy,
        initialCapital,
        finalEquity: Number(finalEquity.toFixed(2)),
        totalReturn: Number(totalReturn.toFixed(2)),
        buyHoldReturn: Number(buyHold.toFixed(2)),
        alpha: Number((totalReturn - buyHold).toFixed(2)),
        trades: trades.length,
        wins, losses,
        winRate: trades.length > 0 ? Number(((wins / (wins + losses || 1)) * 100).toFixed(1)) : 0
    };
}

// User backtests storage (in-memory for demo)
const userBacktests = new Map();

// ============================================
// MARKET DATA
// ============================================
const markets = {
    'BTC/USDC': { price: 104850, change24h: 2.34, volume: 2850000000, high: 105200, low: 102800 },
    'ETH/USDC': { price: 3945, change24h: 1.87, volume: 1580000000, high: 3980, low: 3850 },
    'SOL/USDC': { price: 228.50, change24h: 4.21, volume: 820000000, high: 232, low: 218 },
    'ARB/USDC': { price: 1.85, change24h: 3.12, volume: 156000000, high: 1.92, low: 1.78 },
    'XRP/USDC': { price: 2.42, change24h: 3.45, volume: 256000000, high: 2.50, low: 2.35 },
    'ADA/USDC': { price: 1.15, change24h: 2.11, volume: 178000000, high: 1.18, low: 1.10 },
    'AVAX/USDC': { price: 53.80, change24h: 5.67, volume: 245000000, high: 55.20, low: 51.50 },
    'LINK/USDC': { price: 28.75, change24h: 2.45, volume: 167000000, high: 29.50, low: 28.00 },
    'UNI/USDC': { price: 14.25, change24h: 3.21, volume: 112000000, high: 14.80, low: 13.80 },
    'OP/USDC': { price: 2.95, change24h: 4.56, volume: 89000000, high: 3.05, low: 2.82 },
    'INJ/USDC': { price: 38.50, change24h: 5.12, volume: 145000000, high: 40.00, low: 36.50 },
    'SUI/USDC': { price: 4.25, change24h: 6.78, volume: 234000000, high: 4.45, low: 3.95 }
};

// Credit tiers
const CREDIT_TIERS = {
    AAA: { min: 900, max: 1000, label: 'Excellent', interestDiscount: 0.30, maxLTV: 0.85 },
    AA: { min: 800, max: 899, label: 'Very Good', interestDiscount: 0.20, maxLTV: 0.80 },
    A: { min: 700, max: 799, label: 'Good', interestDiscount: 0.10, maxLTV: 0.75 },
    BBB: { min: 600, max: 699, label: 'Fair', interestDiscount: 0.00, maxLTV: 0.70 },
    BB: { min: 500, max: 599, label: 'Below Average', interestDiscount: -0.10, maxLTV: 0.60 },
    B: { min: 400, max: 499, label: 'Poor', interestDiscount: -0.25, maxLTV: 0.50 }
};

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Content-Type': 'application/json'
};

// Helper to create JSON response
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: corsHeaders
    });
}

// Update prices with random walk
function updatePrices() {
    Object.keys(markets).forEach(pair => {
        const market = markets[pair];
        const volatility = 0.001;
        const change = (Math.random() - 0.5) * 2 * volatility;
        market.price *= (1 + change);
        market.change24h += change * 100 * 0.01;
        if (market.price > market.high) market.high = market.price;
        if (market.price < market.low) market.low = market.price;
    });
}

// Generate order book
function generateOrderBook(basePrice) {
    const bids = [], asks = [];
    for (let i = 0; i < 15; i++) {
        const bidPrice = basePrice * (1 - (i + 1) * 0.0002);
        const askPrice = basePrice * (1 + (i + 1) * 0.0002);
        const qty = Math.random() * 5 + 0.1;
        bids.push({ price: bidPrice, quantity: qty, total: bidPrice * qty });
        asks.push({ price: askPrice, quantity: qty, total: askPrice * qty });
    }
    return { bids, asks, spread: basePrice * 0.0002, timestamp: Date.now() };
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Update prices on each request
        updatePrices();

        // Routes
        try {
            // Root
            if (path === '/' || path === '/api') {
                return jsonResponse({
                    name: 'OBELISK API',
                    version: env.VERSION || '2.1.0',
                    status: 'running',
                    endpoints: {
                        markets: '/api/markets',
                        ticker: '/api/ticker/:pair',
                        tickers: '/api/tickers',
                        orderbook: '/api/orderbook/:pair',
                        order: 'POST /api/order',
                        lending: '/api/lending/info',
                        credit: '/api/lending/credit/:userId',
                        backtest: 'POST /api/backtest',
                        backtestQuick: '/api/backtest/quick?pair=BTC/USDC&strategy=SMA_CROSSOVER&days=30',
                        backtestStrategies: '/api/backtest/strategies',
                        backtestCompare: 'POST /api/backtest/compare',
                        backtestUser: '/api/backtest/user/:userId'
                    }
                });
            }

            // Health check
            if (path === '/health' || path === '/api/health') {
                return jsonResponse({
                    status: 'ok',
                    timestamp: Date.now(),
                    version: env.VERSION || '2.0.0'
                });
            }

            // All markets
            if (path === '/api/markets') {
                return jsonResponse({
                    markets: Object.keys(markets).map(pair => ({
                        pair,
                        ...markets[pair],
                        timestamp: Date.now()
                    })),
                    count: Object.keys(markets).length
                });
            }

            // All tickers (compact)
            if (path === '/api/tickers') {
                const tickers = {};
                Object.entries(markets).forEach(([pair, data]) => {
                    tickers[pair] = {
                        price: data.price,
                        change24h: data.change24h,
                        volume: data.volume
                    };
                });
                return jsonResponse({ tickers, timestamp: Date.now() });
            }

            // Single ticker - supports /api/ticker/BTC/USDC or /api/ticker/BTC%2FUSDC
            const tickerMatch = path.match(/^\/api\/ticker\/([^\/]+)(?:\/([^\/]+))?$/);
            if (tickerMatch) {
                let pair;
                if (tickerMatch[2]) {
                    pair = `${tickerMatch[1]}/${tickerMatch[2]}`.toUpperCase();
                } else {
                    pair = decodeURIComponent(tickerMatch[1]).toUpperCase();
                }
                if (!markets[pair]) {
                    return jsonResponse({ error: 'Market not found', pair }, 404);
                }
                return jsonResponse({
                    pair,
                    ...markets[pair],
                    timestamp: Date.now()
                });
            }

            // Order book - supports /api/orderbook/BTC/USDC or /api/orderbook/BTC%2FUSDC
            const orderbookMatch = path.match(/^\/api\/orderbook\/([^\/]+)(?:\/([^\/]+))?$/);
            if (orderbookMatch) {
                let pair;
                if (orderbookMatch[2]) {
                    // Format: /api/orderbook/BTC/USDC
                    pair = `${orderbookMatch[1]}/${orderbookMatch[2]}`.toUpperCase();
                } else {
                    // Format: /api/orderbook/BTC%2FUSDC
                    pair = decodeURIComponent(orderbookMatch[1]).toUpperCase();
                }
                if (!markets[pair]) {
                    return jsonResponse({ error: 'Market not found', pair }, 404);
                }
                return jsonResponse({
                    pair,
                    ...generateOrderBook(markets[pair].price)
                });
            }

            // Place order
            if (path === '/api/order' && request.method === 'POST') {
                const body = await request.json();
                const { pair, side, type, quantity } = body;

                if (!markets[pair]) {
                    return jsonResponse({ error: 'Invalid market pair' }, 400);
                }
                if (!quantity || quantity <= 0) {
                    return jsonResponse({ error: 'Invalid quantity' }, 400);
                }

                const executionPrice = markets[pair].price * (1 + (side === 'buy' ? 0.0001 : -0.0001));

                const order = {
                    id: 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                    pair,
                    side,
                    type: type || 'market',
                    executionPrice,
                    quantity,
                    total: executionPrice * quantity,
                    status: 'filled',
                    filledAt: Date.now()
                };

                return jsonResponse({ success: true, order });
            }

            // Lending info
            if (path === '/api/lending/info') {
                return jsonResponse({
                    config: {
                        minCollateralRatio: 1.5,
                        liquidationRatio: 1.2,
                        interestRates: {
                            USDC: 5.0, ETH: 3.0, BTC: 2.5, SOL: 8.0
                        },
                        durations: [7, 14, 30, 60, 90]
                    },
                    creditTiers: CREDIT_TIERS,
                    liquidityPool: {
                        USDC: 50000000,
                        ETH: 5000,
                        BTC: 200,
                        SOL: 100000
                    }
                });
            }

            // Credit score
            const creditMatch = path.match(/^\/api\/lending\/credit\/(.+)$/);
            if (creditMatch) {
                const userId = creditMatch[1];
                const score = 700 + Math.floor(Math.random() * 100); // Simulated
                let tier = 'A';
                for (const [t, config] of Object.entries(CREDIT_TIERS)) {
                    if (score >= config.min && score <= config.max) {
                        tier = t;
                        break;
                    }
                }
                return jsonResponse({
                    userId,
                    score,
                    tier,
                    tierLabel: CREDIT_TIERS[tier]?.label || 'Good',
                    maxLTV: CREDIT_TIERS[tier]?.maxLTV || 0.75,
                    interestDiscount: CREDIT_TIERS[tier]?.interestDiscount || 0
                });
            }

            // Deposit collateral
            if (path === '/api/lending/collateral/deposit' && request.method === 'POST') {
                const body = await request.json();
                const { userId, token, amount } = body;

                return jsonResponse({
                    success: true,
                    deposit: {
                        id: 'DEP_' + Date.now(),
                        userId,
                        token,
                        amount,
                        valueUsd: amount * (markets[token + '/USDC']?.price || 100000),
                        timestamp: Date.now()
                    }
                });
            }

            // Borrow
            if (path === '/api/lending/borrow' && request.method === 'POST') {
                const body = await request.json();
                const { userId, token, amount, durationDays } = body;

                const rate = token === 'USDC' ? 5.0 : token === 'ETH' ? 3.0 : 5.0;
                const interest = amount * (rate / 365 / 100) * durationDays;

                return jsonResponse({
                    success: true,
                    loan: {
                        id: 'LOAN_' + Math.random().toString(36).substr(2, 16),
                        userId,
                        token,
                        principal: amount,
                        interest,
                        totalDue: amount + interest,
                        durationDays,
                        dueDate: Date.now() + (durationDays * 24 * 60 * 60 * 1000),
                        status: 'active'
                    }
                });
            }

            // Repay
            if (path === '/api/lending/repay' && request.method === 'POST') {
                const body = await request.json();
                const { userId, loanId, amount } = body;

                return jsonResponse({
                    success: true,
                    payment: {
                        loanId,
                        amountPaid: amount,
                        status: 'repaid',
                        timestamp: Date.now()
                    },
                    creditScore: {
                        score: 725 + Math.floor(Math.random() * 50),
                        tier: 'A',
                        change: '+15'
                    }
                });
            }

            // Bot register
            if (path === '/api/bot/register' && request.method === 'POST') {
                const body = await request.json();
                const apiKey = 'obelisk_' + crypto.randomUUID().replace(/-/g, '');

                return jsonResponse({
                    success: true,
                    apiKey,
                    secret: crypto.randomUUID(),
                    permissions: ['trade', 'read', 'stream'],
                    rateLimit: '1000/s'
                });
            }

            // Stats
            if (path === '/api/stats') {
                return jsonResponse({
                    markets: Object.keys(markets).length,
                    uptime: 99.99,
                    version: env.VERSION || '2.0.0',
                    timestamp: Date.now()
                });
            }

            // ============================================
            // BACKTEST ENDPOINTS
            // ============================================

            // List available strategies
            if (path === '/api/backtest/strategies') {
                return jsonResponse({
                    strategies: [
                        { id: 'SMA_CROSSOVER', name: 'SMA Crossover', description: 'Buy when fast SMA crosses above slow SMA' },
                        { id: 'RSI_REVERSAL', name: 'RSI Reversal', description: 'Buy when RSI crosses below 30, sell above 70' },
                        { id: 'DCA', name: 'Dollar Cost Average', description: 'Buy weekly regardless of price' },
                        { id: 'BUY_AND_HOLD', name: 'Buy & Hold', description: 'Buy once and hold' }
                    ],
                    pairs: Object.keys(markets),
                    defaultCapital: 10000,
                    maxDays: 365
                });
            }

            // Run backtest
            if (path === '/api/backtest' && request.method === 'POST') {
                const body = await request.json();
                const { userId, pair, strategy, days = 90, capital = 10000 } = body;

                if (!pair || !markets[pair]) {
                    return jsonResponse({ error: 'Invalid pair. Use /api/backtest/strategies for available pairs' }, 400);
                }
                if (!strategy) {
                    return jsonResponse({ error: 'Strategy required. Use /api/backtest/strategies for available strategies' }, 400);
                }

                const data = generateHistoricalData(pair, Math.min(days, 365));
                const result = runBacktest(data, strategy, capital);

                const backtestResult = {
                    id: 'BT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                    userId: userId || 'anonymous',
                    pair,
                    strategy,
                    days,
                    capital,
                    dataPoints: data.length,
                    ...result,
                    createdAt: Date.now()
                };

                // Store for user
                if (userId) {
                    if (!userBacktests.has(userId)) {
                        userBacktests.set(userId, []);
                    }
                    userBacktests.get(userId).push(backtestResult);
                }

                return jsonResponse({ success: true, backtest: backtestResult });
            }

            // Compare multiple strategies
            if (path === '/api/backtest/compare' && request.method === 'POST') {
                const body = await request.json();
                const { pair, strategies = ['SMA_CROSSOVER', 'RSI_REVERSAL', 'DCA', 'BUY_AND_HOLD'], days = 90, capital = 10000 } = body;

                if (!pair || !markets[pair]) {
                    return jsonResponse({ error: 'Invalid pair' }, 400);
                }

                const data = generateHistoricalData(pair, Math.min(days, 365));
                const results = strategies.map(strategy => ({
                    strategy,
                    ...runBacktest(data, strategy, capital)
                }));

                // Sort by total return
                results.sort((a, b) => b.totalReturn - a.totalReturn);

                return jsonResponse({
                    pair,
                    days,
                    capital,
                    dataPoints: data.length,
                    comparison: results,
                    winner: results[0].strategy,
                    bestReturn: results[0].totalReturn,
                    timestamp: Date.now()
                });
            }

            // Get user backtests
            const userBacktestMatch = path.match(/^\/api\/backtest\/user\/(.+)$/);
            if (userBacktestMatch) {
                const userId = userBacktestMatch[1];
                const backtests = userBacktests.get(userId) || [];
                return jsonResponse({
                    userId,
                    count: backtests.length,
                    backtests: backtests.slice(-20) // Last 20
                });
            }

            // Quick backtest (GET with query params)
            if (path === '/api/backtest/quick') {
                const pair = url.searchParams.get('pair') || 'BTC/USDC';
                const strategy = url.searchParams.get('strategy') || 'SMA_CROSSOVER';
                const days = parseInt(url.searchParams.get('days')) || 30;

                if (!markets[pair]) {
                    return jsonResponse({ error: 'Invalid pair' }, 400);
                }

                const data = generateHistoricalData(pair, Math.min(days, 365));
                const result = runBacktest(data, strategy, 10000);

                return jsonResponse({
                    pair,
                    strategy,
                    days,
                    ...result,
                    timestamp: Date.now()
                });
            }

            // 404
            return jsonResponse({ error: 'Not found', path }, 404);

        } catch (error) {
            return jsonResponse({ error: error.message }, 500);
        }
    }
};
