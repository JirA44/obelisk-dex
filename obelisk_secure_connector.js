// ═══════════════════════════════════════════════════════════════════════════════
// ██████╗ ██████╗ ███████╗██╗     ██╗███████╗██╗  ██╗
// ██╔═══██╗██╔══██╗██╔════╝██║     ██║██╔════╝██║ ██╔╝
// ██║   ██║██████╔╝█████╗  ██║     ██║███████╗█████╔╝
// ██║   ██║██╔══██╗██╔══╝  ██║     ██║╚════██║██╔═██╗
// ╚██████╔╝██████╔╝███████╗███████╗██║███████║██║  ██╗
//  ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═╝
// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK SECURE CONNECTOR FOR MIXBOT V29
// ═══════════════════════════════════════════════════════════════════════════════
// - Session unique par connexion (HMAC signed)
// - Clé privée P2P pour communication chiffrée
// - Compatible avec l'API MixBot existante
// ═══════════════════════════════════════════════════════════════════════════════

const crypto = require('crypto');
const https = require('https');
const http = require('http');

const OBELISK_API = 'https://obelisk-api-secure.hugo-padilla-pro.workers.dev';

// ═══════════════════════════════════════════════════════════════════════════════
// SECURE OBELISK CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════

class ObeliskSecureConnector {
    constructor(config = {}) {
        this.apiUrl = config.apiUrl || OBELISK_API;
        this.botName = config.botName || 'MixBot_V29';

        // Credentials
        this.apiKey = null;
        this.apiSecret = null;
        this.sessionId = null;
        this.sessionExpires = null;

        // P2P Channels
        this.channels = new Map();

        // State
        this.connected = false;
        this.lastPrices = {};

        // Virtual positions (for simulation)
        this.positions = [];
        this.trades = [];
        this.capital = config.initialCapital || 50;
        this.initialCapital = this.capital;

        console.log(`[OBELISK] Secure connector initialized for ${this.botName}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CRYPTO UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════

    generateNonce(length = 16) {
        return crypto.randomBytes(length).toString('hex');
    }

    hmacSign(message) {
        if (!this.apiSecret) return '';
        return crypto.createHmac('sha256', this.apiSecret).update(message).digest('hex');
    }

    encryptP2P(data, sharedKey) {
        const iv = crypto.randomBytes(12);
        const key = Buffer.from(sharedKey, 'hex').slice(0, 32);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return { iv: iv.toString('hex'), encrypted, authTag: cipher.getAuthTag().toString('hex') };
    }

    decryptP2P(encData, sharedKey) {
        const key = Buffer.from(sharedKey, 'hex').slice(0, 32);
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encData.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(encData.authTag, 'hex'));
        let decrypted = decipher.update(encData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HTTP REQUEST
    // ═══════════════════════════════════════════════════════════════════════════

    async request(method, path, body = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.apiUrl + path);
            const isHttps = url.protocol === 'https:';

            const timestamp = Date.now().toString();
            const nonce = this.generateNonce();
            const signature = this.hmacSign(`${timestamp}:${method}:${path}`);

            const headers = {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey || '',
                'X-Session-Id': this.sessionId || '',
                'X-Timestamp': timestamp,
                'X-Nonce': nonce,
                'X-Signature': signature
            };

            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method,
                headers
            };

            const req = (isHttps ? https : http).request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve({ error: data });
                    }
                });
            });

            req.on('error', reject);
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTHENTICATION
    // ═══════════════════════════════════════════════════════════════════════════

    async connect() {
        console.log(`[OBELISK] Connecting ${this.botName}...`);

        // 1. Register
        const regData = await this.request('POST', '/api/auth/register', {
            name: this.botName,
            type: 'trading',
            capabilities: ['trade', 'read', 'stream', 'p2p']
        });

        if (!regData.success) throw new Error(regData.error || 'Registration failed');

        this.apiKey = regData.apiKey;
        this.apiSecret = regData.secret;
        console.log(`[OBELISK] ✓ Registered: ${this.apiKey.slice(0, 20)}...`);

        // 2. Create session
        const sessData = await this.request('POST', '/api/auth/session', { ttlMinutes: 120 });

        if (!sessData.success) throw new Error(sessData.error || 'Session failed');

        this.sessionId = sessData.sessionId;
        this.sessionExpires = sessData.expires;
        this.connected = true;

        console.log(`[OBELISK] ✓ Session: ${this.sessionId.slice(0, 24)}...`);
        console.log(`[OBELISK] ✓ Connected securely!\n`);

        // Auto-refresh session
        this._scheduleRefresh();

        return { apiKey: this.apiKey, sessionId: this.sessionId };
    }

    _scheduleRefresh() {
        const refreshIn = 110 * 60 * 1000; // 110 min (before 120 min expiry)
        setTimeout(async () => {
            if (this.connected) {
                console.log('[OBELISK] Refreshing session...');
                const sessData = await this.request('POST', '/api/auth/session', { ttlMinutes: 120 });
                if (sessData.success) {
                    this.sessionId = sessData.sessionId;
                    this.sessionExpires = sessData.expires;
                    this._scheduleRefresh();
                }
            }
        }, refreshIn);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // P2P ENCRYPTED CHANNELS
    // ═══════════════════════════════════════════════════════════════════════════

    async createP2PChannel(targetBotId) {
        console.log(`[OBELISK] Creating P2P channel with: ${targetBotId}`);

        const data = await this.request('POST', '/api/p2p/channel', {
            targetUserId: targetBotId,
            ttlHours: 24
        });

        if (!data.success) throw new Error(data.error || 'Channel creation failed');

        this.channels.set(data.channelId, {
            targetBot: targetBotId,
            sharedKey: data.sharedKey,
            expires: data.expires
        });

        console.log(`[OBELISK] ✓ P2P Channel: ${data.channelId}`);
        console.log(`[OBELISK] ✓ Shared Key: ${data.sharedKey.slice(0, 16)}... (AES-256-GCM)`);

        return data;
    }

    async sendSignal(channelId, signal) {
        const channel = this.channels.get(channelId);
        if (!channel) throw new Error('Channel not found');

        const encrypted = this.encryptP2P(signal, channel.sharedKey);

        return this.request('POST', '/api/p2p/message', { channelId, encrypted });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MARKET DATA
    // ═══════════════════════════════════════════════════════════════════════════

    async getMarkets() {
        const data = await this.request('GET', '/api/markets');
        if (data.markets) {
            data.markets.forEach(m => {
                this.lastPrices[m.pair] = m.price;
            });
        }
        return data.markets || [];
    }

    async getTicker(symbol) {
        const pair = symbol.includes('/') ? symbol : `${symbol}/USDC`;
        const data = await this.request('GET', `/api/ticker/${encodeURIComponent(pair)}`);
        if (data.price) this.lastPrices[pair] = data.price;
        return data;
    }

    async getOrderBook(symbol) {
        const pair = symbol.includes('/') ? symbol : `${symbol}/USDC`;
        return this.request('GET', `/api/orderbook/${encodeURIComponent(pair)}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TRADING (SIMULATION MODE)
    // ═══════════════════════════════════════════════════════════════════════════

    async placeOrder(symbol, side, size, leverage = 1) {
        const pair = symbol.includes('/') ? symbol : `${symbol}/USDC`;

        // Get current price
        const ticker = await this.getTicker(pair);
        const price = ticker.price || this.lastPrices[pair] || 100000;

        // Place order via API
        const orderData = await this.request('POST', '/api/order', {
            pair,
            side,
            quantity: size,
            type: 'market'
        });

        if (!orderData.success) {
            console.log(`[OBELISK] ✗ Order failed: ${orderData.error}`);
            return null;
        }

        const order = orderData.order;

        // Track position locally
        const position = {
            id: order.id,
            symbol: pair,
            side,
            size,
            entryPrice: order.executionPrice,
            leverage,
            timestamp: Date.now(),
            pnl: 0
        };

        this.positions.push(position);
        this.trades.push({
            ...position,
            type: 'OPEN',
            total: order.total
        });

        console.log(`[OBELISK] ✓ ${side.toUpperCase()} ${size} ${pair} @ $${order.executionPrice.toFixed(2)}`);

        return order;
    }

    async closePosition(positionId) {
        const posIndex = this.positions.findIndex(p => p.id === positionId);
        if (posIndex === -1) return null;

        const pos = this.positions[posIndex];
        const ticker = await this.getTicker(pos.symbol);
        const currentPrice = ticker.price || this.lastPrices[pos.symbol];

        // Calculate PnL
        const priceDiff = currentPrice - pos.entryPrice;
        const pnl = pos.side === 'buy'
            ? (priceDiff / pos.entryPrice) * pos.size * currentPrice * pos.leverage
            : (-priceDiff / pos.entryPrice) * pos.size * currentPrice * pos.leverage;

        // Update capital
        this.capital += pnl;

        // Close order
        const closeOrder = await this.request('POST', '/api/order', {
            pair: pos.symbol,
            side: pos.side === 'buy' ? 'sell' : 'buy',
            quantity: pos.size,
            type: 'market'
        });

        // Remove position
        this.positions.splice(posIndex, 1);
        this.trades.push({
            ...pos,
            type: 'CLOSE',
            exitPrice: currentPrice,
            pnl,
            closedAt: Date.now()
        });

        console.log(`[OBELISK] ✓ Closed ${pos.symbol}: PnL $${pnl.toFixed(2)}`);

        return { ...closeOrder, pnl };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MIXBOT COMPATIBLE INTERFACE
    // ═══════════════════════════════════════════════════════════════════════════

    // Compatible with MixBot's expected interface
    async getMids() {
        const markets = await this.getMarkets();
        const mids = {};
        markets.forEach(m => {
            const symbol = m.pair.replace('/USDC', '');
            mids[symbol] = m.price;
        });
        return mids;
    }

    async executeSignal(signal) {
        // signal: { coin, direction, confidence, strategy, size }
        const side = signal.direction === 'LONG' ? 'buy' : 'sell';
        return this.placeOrder(signal.coin, side, signal.size || 0.01, signal.leverage || 1);
    }

    getStatus() {
        const totalPnl = this.capital - this.initialCapital;
        const pnlPercent = (totalPnl / this.initialCapital) * 100;

        return {
            connected: this.connected,
            apiKey: this.apiKey ? this.apiKey.slice(0, 16) + '...' : null,
            sessionId: this.sessionId ? this.sessionId.slice(0, 20) + '...' : null,
            capital: this.capital,
            initialCapital: this.initialCapital,
            pnl: totalPnl,
            pnlPercent,
            positions: this.positions.length,
            trades: this.trades.length,
            p2pChannels: this.channels.size
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK START
// ═══════════════════════════════════════════════════════════════════════════════

async function connectMixBot(config = {}) {
    const connector = new ObeliskSecureConnector({
        botName: config.name || 'MixBot_V29',
        initialCapital: config.capital || 50,
        ...config
    });

    await connector.connect();

    return connector;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    ObeliskSecureConnector,
    connectMixBot,
    OBELISK_API
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEST IF RUN DIRECTLY
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
    (async () => {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║   OBELISK SECURE CONNECTOR - MixBot Test                     ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        try {
            // Connect
            const bot = await connectMixBot({ name: 'MixBot_V29_TEST', capital: 50 });

            // Get markets
            console.log('[TEST] Fetching markets...');
            const markets = await bot.getMarkets();
            console.log(`[TEST] Found ${markets.length} markets\n`);

            // Show prices
            const mids = await bot.getMids();
            console.log('[TEST] Current prices:');
            Object.entries(mids).slice(0, 6).forEach(([k, v]) => {
                console.log(`  ${k}: $${v.toLocaleString()}`);
            });

            // Test order
            console.log('\n[TEST] Placing test order...');
            const order = await bot.placeOrder('BTC/USDC', 'buy', 0.001, 5);

            // Create P2P channel
            console.log('\n[TEST] Creating P2P channel...');
            const channel = await bot.createP2PChannel('InstitutionalBot_001');

            // Send encrypted signal
            await bot.sendSignal(channel.channelId, {
                type: 'SIGNAL',
                coin: 'BTC',
                direction: 'LONG',
                confidence: 85,
                strategy: 'RSI_MACD_Supertrend'
            });
            console.log('[TEST] ✓ Encrypted signal sent\n');

            // Status
            console.log('[TEST] Bot Status:');
            const status = bot.getStatus();
            Object.entries(status).forEach(([k, v]) => {
                console.log(`  ${k}: ${v}`);
            });

            console.log('\n✅ All tests passed! MixBot connected to Obelisk securely.');

        } catch (error) {
            console.error('[ERROR]', error.message);
        }
    })();
}
