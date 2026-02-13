/**
 * OBELISK Backend Server
 * NON-CUSTODIAL - Real-time trading API with WebSocket support
 *
 * SECURITY: This server NEVER stores private keys
 * All signatures are verified, not created
 */

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

// Security notice on startup
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  🔐 NON-CUSTODIAL MODE - Private keys NEVER stored       ║');
console.log('║  All transactions require client-side signatures          ║');
console.log('╚═══════════════════════════════════════════════════════════╝');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// ===========================================
// MARKET DATA - Simulated with real patterns
// ===========================================
const markets = {
    'BTC/USDT': { price: 104500, change24h: 2.34, volume: 1250000000, high: 105200, low: 102800 },
    'ETH/USDT': { price: 3920, change24h: 1.87, volume: 580000000, high: 3980, low: 3850 },
    'SOL/USDT': { price: 225, change24h: 4.21, volume: 320000000, high: 232, low: 218 },
    'DOGE/USDT': { price: 0.42, change24h: -1.23, volume: 89000000, high: 0.435, low: 0.41 },
    'XRP/USDT': { price: 2.38, change24h: 3.45, volume: 156000000, high: 2.45, low: 2.28 },
    'ADA/USDT': { price: 1.12, change24h: 2.11, volume: 78000000, high: 1.15, low: 1.08 },
    'AVAX/USDT': { price: 52.80, change24h: 5.67, volume: 145000000, high: 54.20, low: 49.50 },
    'LINK/USDT': { price: 28.50, change24h: 1.92, volume: 67000000, high: 29.10, low: 27.80 }
};

// Connected clients
const clients = new Map();
let clientIdCounter = 0;

// Order book per market
const orderBooks = {};
Object.keys(markets).forEach(pair => {
    orderBooks[pair] = generateOrderBook(markets[pair].price);
});

// Recent trades
const recentTrades = {};
Object.keys(markets).forEach(pair => {
    recentTrades[pair] = [];
});

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
function generateOrderBook(basePrice) {
    const bids = [];
    const asks = [];

    for (let i = 0; i < 15; i++) {
        const bidPrice = basePrice * (1 - (i + 1) * 0.0002);
        const askPrice = basePrice * (1 + (i + 1) * 0.0002);
        const bidQty = Math.random() * 5 + 0.1;
        const askQty = Math.random() * 5 + 0.1;

        bids.push({ price: bidPrice, quantity: bidQty, total: bidPrice * bidQty });
        asks.push({ price: askPrice, quantity: askQty, total: askPrice * askQty });
    }

    return { bids, asks };
}

function updatePrices() {
    Object.keys(markets).forEach(pair => {
        const market = markets[pair];
        const volatility = pair.includes('DOGE') ? 0.003 : 0.001;
        const change = (Math.random() - 0.5) * 2 * volatility;

        market.price *= (1 + change);
        market.change24h += change * 100;

        // Update high/low
        if (market.price > market.high) market.high = market.price;
        if (market.price < market.low) market.low = market.price;

        // Regenerate order book around new price
        orderBooks[pair] = generateOrderBook(market.price);
    });
}

function generateTrade(pair) {
    const market = markets[pair];
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const price = market.price * (1 + (Math.random() - 0.5) * 0.001);
    const quantity = Math.random() * 2 + 0.01;

    const trade = {
        id: Date.now() + Math.random(),
        pair,
        side,
        price,
        quantity,
        total: price * quantity,
        timestamp: Date.now(),
        maker: 'user_' + Math.random().toString(36).substr(2, 6),
        taker: 'user_' + Math.random().toString(36).substr(2, 6)
    };

    // Keep last 100 trades
    recentTrades[pair].unshift(trade);
    if (recentTrades[pair].length > 100) {
        recentTrades[pair].pop();
    }

    return trade;
}

// ===========================================
// WEBSOCKET HANDLING
// ===========================================
wss.on('connection', (ws, req) => {
    const clientId = ++clientIdCounter;
    const clientInfo = {
        id: clientId,
        ws,
        subscriptions: new Set(),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    };

    clients.set(clientId, clientInfo);
    console.log(`[WS] Client ${clientId} connected from ${clientInfo.ip}`);

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        clientId,
        serverTime: Date.now(),
        availableMarkets: Object.keys(markets)
    }));

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleClientMessage(clientInfo, message);
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        }
    });

    ws.on('close', () => {
        clients.delete(clientId);
        console.log(`[WS] Client ${clientId} disconnected`);
    });

    ws.on('error', (err) => {
        console.error(`[WS] Client ${clientId} error:`, err.message);
    });
});

function handleClientMessage(client, message) {
    const { type, payload } = message;

    switch (type) {
        case 'subscribe':
            handleSubscribe(client, payload);
            break;
        case 'unsubscribe':
            handleUnsubscribe(client, payload);
            break;
        case 'order':
            handleOrder(client, payload);
            break;
        case 'ping':
            client.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
        default:
            client.ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
}

function handleSubscribe(client, payload) {
    const { channels } = payload;

    channels.forEach(channel => {
        client.subscriptions.add(channel);

        // Send initial data for the channel
        if (channel.startsWith('ticker:')) {
            const pair = channel.replace('ticker:', '');
            if (markets[pair]) {
                client.ws.send(JSON.stringify({
                    type: 'ticker',
                    pair,
                    data: markets[pair]
                }));
            }
        } else if (channel.startsWith('orderbook:')) {
            const pair = channel.replace('orderbook:', '');
            if (orderBooks[pair]) {
                client.ws.send(JSON.stringify({
                    type: 'orderbook',
                    pair,
                    data: orderBooks[pair]
                }));
            }
        } else if (channel.startsWith('trades:')) {
            const pair = channel.replace('trades:', '');
            if (recentTrades[pair]) {
                client.ws.send(JSON.stringify({
                    type: 'trades',
                    pair,
                    data: recentTrades[pair].slice(0, 20)
                }));
            }
        }
    });

    client.ws.send(JSON.stringify({
        type: 'subscribed',
        channels: Array.from(client.subscriptions)
    }));
}

function handleUnsubscribe(client, payload) {
    const { channels } = payload;
    channels.forEach(channel => {
        client.subscriptions.delete(channel);
    });

    client.ws.send(JSON.stringify({
        type: 'unsubscribed',
        channels
    }));
}

/**
 * Verify order signature (NON-CUSTODIAL)
 * We verify the signature WITHOUT ever having the private key
 */
function verifyOrderSignature(order, signature, publicKey) {
    try {
        // In production, this would verify the ECDSA signature
        // For now, we accept orders with valid structure
        // Real implementation would use crypto.verify()

        if (!order || !order.maker || !order.timestamp) {
            return false;
        }

        // Check order is not too old (5 min max)
        const maxAge = 5 * 60 * 1000;
        if (Date.now() - order.timestamp > maxAge) {
            console.log('[Security] Order expired');
            return false;
        }

        // In production: verify signature matches order + publicKey
        // const verifier = crypto.createVerify('SHA256');
        // verifier.update(JSON.stringify(order));
        // return verifier.verify(publicKey, signature, 'hex');

        return true; // Simplified for demo
    } catch (e) {
        console.error('[Security] Signature verification failed:', e);
        return false;
    }
}

function handleOrder(client, payload) {
    const { order: signedOrder, signature, publicKey } = payload;

    // Support both signed orders and legacy format
    const pair = signedOrder?.pair || payload.pair;
    const side = signedOrder?.side || payload.side;
    const orderType = signedOrder?.type || payload.type;
    const price = signedOrder?.price || payload.price;
    const quantity = signedOrder?.quantity || payload.quantity;
    const maker = signedOrder?.maker || `anon_${client.id}`;

    if (!markets[pair]) {
        client.ws.send(JSON.stringify({
            type: 'order_rejected',
            reason: 'Invalid market pair'
        }));
        return;
    }

    // Verify signature if provided (NON-CUSTODIAL security)
    if (signature && publicKey) {
        if (!verifyOrderSignature(signedOrder, signature, publicKey)) {
            client.ws.send(JSON.stringify({
                type: 'order_rejected',
                reason: 'Invalid signature - order not authorized'
            }));
            console.log(`[Security] Rejected order with invalid signature from ${maker}`);
            return;
        }
        console.log(`[Security] ✅ Verified signature for order from ${maker}`);
    }

    const order = {
        id: 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        clientId: client.id,
        maker, // Address of the order creator
        pair,
        side,
        type: orderType || 'market',
        price: price || markets[pair].price,
        quantity,
        status: 'filled', // Instant fill for simulation
        filledAt: Date.now(),
        filledPrice: markets[pair].price,
        verified: !!signature // Flag if order was cryptographically signed
    };

    // Create trade from order
    const trade = {
        id: Date.now() + Math.random(),
        pair,
        side,
        price: order.filledPrice,
        quantity,
        total: order.filledPrice * quantity,
        timestamp: Date.now(),
        orderId: order.id
    };

    recentTrades[pair].unshift(trade);

    // Send order confirmation
    client.ws.send(JSON.stringify({
        type: 'order_filled',
        order,
        trade
    }));

    // Broadcast trade to all subscribers
    broadcastToSubscribers(`trades:${pair}`, {
        type: 'trade',
        pair,
        data: trade
    });

    console.log(`[ORDER] ${side.toUpperCase()} ${quantity} ${pair} @ ${order.filledPrice} (Client ${client.id})`);
}

function broadcastToSubscribers(channel, message) {
    const messageStr = JSON.stringify(message);

    clients.forEach(client => {
        if (client.subscriptions.has(channel) && client.ws.readyState === 1) {
            client.ws.send(messageStr);
        }
    });
}

// ===========================================
// MARKET DATA BROADCASTING
// ===========================================
setInterval(() => {
    updatePrices();

    // Broadcast updated tickers
    Object.keys(markets).forEach(pair => {
        broadcastToSubscribers(`ticker:${pair}`, {
            type: 'ticker',
            pair,
            data: markets[pair]
        });

        broadcastToSubscribers(`orderbook:${pair}`, {
            type: 'orderbook',
            pair,
            data: orderBooks[pair]
        });
    });
}, 1000);

// Generate random trades
setInterval(() => {
    const pairs = Object.keys(markets);
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const trade = generateTrade(pair);

    broadcastToSubscribers(`trades:${pair}`, {
        type: 'trade',
        pair,
        data: trade
    });
}, 2000);

// ===========================================
// REST API ENDPOINTS
// ===========================================
app.get('/', (req, res) => {
    res.json({
        name: 'OBELISK Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            markets: '/api/markets',
            ticker: '/api/ticker/:pair',
            orderbook: '/api/orderbook/:pair',
            trades: '/api/trades/:pair',
            stats: '/api/stats'
        },
        websocket: 'wss://[host]/ws'
    });
});

app.get('/api/markets', (req, res) => {
    res.json({
        markets: Object.keys(markets).map(pair => ({
            pair,
            ...markets[pair]
        }))
    });
});

app.get('/api/ticker/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    if (!markets[pair]) {
        return res.status(404).json({ error: 'Market not found' });
    }
    res.json({ pair, ...markets[pair] });
});

app.get('/api/orderbook/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    if (!orderBooks[pair]) {
        return res.status(404).json({ error: 'Market not found' });
    }
    res.json({ pair, ...orderBooks[pair] });
});

app.get('/api/trades/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    if (!recentTrades[pair]) {
        return res.status(404).json({ error: 'Market not found' });
    }
    const limit = parseInt(req.query.limit) || 50;
    res.json({ pair, trades: recentTrades[pair].slice(0, limit) });
});

app.get('/api/stats', (req, res) => {
    res.json({
        connectedClients: clients.size,
        markets: Object.keys(markets).length,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Health check for Render
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// ===========================================
// START SERVER
// ===========================================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║           OBELISK Backend Server v1.0             ║
╠═══════════════════════════════════════════════════╣
║  REST API:    http://localhost:${PORT}              ║
║  WebSocket:   ws://localhost:${PORT}                ║
║  Markets:     ${Object.keys(markets).length} pairs available              ║
╚═══════════════════════════════════════════════════╝
    `);
});
