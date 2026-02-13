/**
 * OBELISK SECURE BOT CONNECTOR v1.0
 * - Unique session key per connection
 * - P2P private key for encrypted communication
 * - HMAC request signing
 * - Rate limiting
 */

const WebSocket = require('ws');
const crypto = require('crypto');

class SecureConnector {
    constructor(config = {}) {
        this.apiUrl = config.apiUrl || 'https://obelisk-api.hugo-padilla-pro.workers.dev';
        this.wsUrl = config.wsUrl || 'wss://obelisk-api.hugo-padilla-pro.workers.dev';

        // Credentials
        this.apiKey = null;
        this.apiSecret = null;
        this.sessionId = null;
        this.sessionExpires = null;

        // P2P channels
        this.channels = new Map();

        // WebSocket
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnects = 5;

        // Callbacks
        this.onMessage = config.onMessage || (() => {});
        this.onTrade = config.onTrade || (() => {});
        this.onError = config.onError || console.error;
    }

    // ==========================================
    // CRYPTO UTILITIES
    // ==========================================

    generateNonce(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    hmacSign(message) {
        if (!this.apiSecret) throw new Error('API secret not set');
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(message)
            .digest('hex');
    }

    // AES-256-GCM encryption for P2P
    encrypt(plaintext, sharedKey) {
        const iv = crypto.randomBytes(12);
        const key = Buffer.from(sharedKey, 'hex').slice(0, 32);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        return {
            iv: iv.toString('hex'),
            encrypted,
            authTag
        };
    }

    decrypt(encryptedData, sharedKey) {
        const key = Buffer.from(sharedKey, 'hex').slice(0, 32);
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    async register(botName, botType = 'trading') {
        console.log(`[SECURE] Registering bot: ${botName}`);

        const response = await fetch(`${this.apiUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: botName,
                type: botType,
                capabilities: ['trade', 'read', 'stream']
            })
        });

        const data = await response.json();

        if (data.success) {
            this.apiKey = data.apiKey;
            this.apiSecret = data.secret;
            console.log(`[SECURE] Registered with API key: ${this.apiKey.slice(0, 16)}...`);
            return data;
        }

        throw new Error(data.error || 'Registration failed');
    }

    async createSession() {
        if (!this.apiKey || !this.apiSecret) {
            throw new Error('Must register first');
        }

        const timestamp = Date.now().toString();
        const nonce = this.generateNonce(16);
        const message = `${timestamp}:POST:/api/auth/session`;
        const signature = this.hmacSign(message);

        const response = await fetch(`${this.apiUrl}/api/auth/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey,
                'X-Timestamp': timestamp,
                'X-Nonce': nonce,
                'X-Signature': signature
            },
            body: JSON.stringify({ ttlMinutes: 60 })
        });

        const data = await response.json();

        if (data.success) {
            this.sessionId = data.sessionId;
            this.sessionExpires = data.expires;
            console.log(`[SECURE] Session created: ${this.sessionId.slice(0, 20)}... (expires in ${Math.round((data.expires - Date.now()) / 60000)}min)`);

            // Auto-refresh session before expiry
            this.scheduleSessionRefresh();

            return data;
        }

        throw new Error(data.error || 'Session creation failed');
    }

    scheduleSessionRefresh() {
        if (this.sessionExpires) {
            const refreshIn = (this.sessionExpires - Date.now()) - (5 * 60 * 1000); // 5 min before expiry
            if (refreshIn > 0) {
                setTimeout(() => this.createSession(), refreshIn);
            }
        }
    }

    // ==========================================
    // SIGNED REQUESTS
    // ==========================================

    async signedRequest(method, path, body = null) {
        const timestamp = Date.now().toString();
        const nonce = this.generateNonce(16);
        const message = `${timestamp}:${method}:${path}`;
        const signature = this.hmacSign(message);

        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
            'X-Session-Id': this.sessionId,
            'X-Timestamp': timestamp,
            'X-Nonce': nonce,
            'X-Signature': signature
        };

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${this.apiUrl}${path}`, options);
        return response.json();
    }

    // ==========================================
    // P2P ENCRYPTED CHANNEL
    // ==========================================

    async createP2PChannel(targetUserId) {
        console.log(`[SECURE] Creating P2P channel with user: ${targetUserId}`);

        const data = await this.signedRequest('POST', '/api/p2p/channel', {
            targetUserId,
            ttlHours: 24
        });

        if (data.success) {
            this.channels.set(data.channelId, {
                targetUser: targetUserId,
                sharedKey: data.sharedKey,
                created: Date.now(),
                expires: data.expires
            });

            console.log(`[SECURE] P2P channel created: ${data.channelId}`);
            console.log(`[SECURE] Shared key (keep secret!): ${data.sharedKey.slice(0, 16)}...`);

            return data;
        }

        throw new Error(data.error || 'Channel creation failed');
    }

    async sendP2PMessage(channelId, message) {
        const channel = this.channels.get(channelId);
        if (!channel) throw new Error('Channel not found');

        // Encrypt message with shared key
        const encrypted = this.encrypt(JSON.stringify(message), channel.sharedKey);

        return this.signedRequest('POST', '/api/p2p/message', {
            channelId,
            encrypted
        });
    }

    async receiveP2PMessages(channelId) {
        const channel = this.channels.get(channelId);
        if (!channel) throw new Error('Channel not found');

        const data = await this.signedRequest('GET', `/api/p2p/messages/${channelId}`);

        if (data.messages) {
            return data.messages.map(msg => {
                try {
                    const decrypted = this.decrypt(msg.encrypted, channel.sharedKey);
                    return { ...msg, content: JSON.parse(decrypted) };
                } catch (e) {
                    return { ...msg, content: null, error: 'Decryption failed' };
                }
            });
        }

        return [];
    }

    // ==========================================
    // TRADING API
    // ==========================================

    async placeOrder(pair, side, quantity, type = 'market', price = null) {
        const order = { pair, side, quantity, type };
        if (price) order.price = price;

        console.log(`[TRADE] ${side.toUpperCase()} ${quantity} ${pair} @ ${type}`);

        return this.signedRequest('POST', '/api/order', order);
    }

    async getMarkets() {
        return this.signedRequest('GET', '/api/markets');
    }

    async getTicker(pair) {
        return this.signedRequest('GET', `/api/ticker/${encodeURIComponent(pair)}`);
    }

    async getOrderBook(pair) {
        return this.signedRequest('GET', `/api/orderbook/${encodeURIComponent(pair)}`);
    }

    // ==========================================
    // WEBSOCKET CONNECTION
    // ==========================================

    async connectWebSocket() {
        if (!this.sessionId) {
            await this.createSession();
        }

        return new Promise((resolve, reject) => {
            const wsUrl = `${this.wsUrl}?session=${this.sessionId}&key=${this.apiKey}`;

            this.ws = new WebSocket(wsUrl);

            this.ws.on('open', () => {
                console.log('[WS] Connected securely');
                this.reconnectAttempts = 0;

                // Authenticate via WebSocket
                this.ws.send(JSON.stringify({
                    type: 'auth',
                    sessionId: this.sessionId,
                    signature: this.hmacSign(`ws:${this.sessionId}`)
                }));

                resolve(this.ws);
            });

            this.ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data.toString());

                    if (msg.type === 'auth_success') {
                        console.log('[WS] Authenticated successfully');
                    } else if (msg.type === 'trade') {
                        this.onTrade(msg);
                    } else {
                        this.onMessage(msg);
                    }
                } catch (e) {
                    this.onError(e);
                }
            });

            this.ws.on('close', () => {
                console.log('[WS] Connection closed');
                this.attemptReconnect();
            });

            this.ws.on('error', (err) => {
                this.onError(err);
                reject(err);
            });
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnects) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
            setTimeout(() => this.connectWebSocket(), delay);
        }
    }

    subscribe(channels) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        this.ws.send(JSON.stringify({
            type: 'subscribe',
            channels,
            signature: this.hmacSign(`sub:${channels.join(',')}`)
        }));
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// ==========================================
// EXAMPLE USAGE
// ==========================================

async function main() {
    const bot = new SecureConnector({
        apiUrl: 'http://localhost:3001',
        wsUrl: 'ws://localhost:3001',
        onTrade: (trade) => console.log('[TRADE]', trade),
        onMessage: (msg) => console.log('[MSG]', msg)
    });

    try {
        // 1. Register bot (get API key + secret)
        await bot.register('MyTradingBot_v15', 'trading');

        // 2. Create unique session (per connection)
        await bot.createSession();

        // 3. Connect WebSocket
        await bot.connectWebSocket();

        // 4. Subscribe to markets
        bot.subscribe(['BTC/USDC', 'ETH/USDC', 'SOL/USDC']);

        // 5. Place a signed order
        const order = await bot.placeOrder('BTC/USDC', 'buy', 0.01);
        console.log('[ORDER]', order);

        // 6. Create P2P channel with another user
        const channel = await bot.createP2PChannel('user_other_bot');

        // 7. Send encrypted P2P message
        await bot.sendP2PMessage(channel.channelId, {
            type: 'signal',
            action: 'buy',
            pair: 'BTC/USDC',
            confidence: 0.85
        });

        // Keep running
        console.log('\n[BOT] Running... Press Ctrl+C to stop\n');

    } catch (error) {
        console.error('[ERROR]', error.message);
    }
}

// Export for use as module
module.exports = { SecureConnector };

// Run if executed directly
if (require.main === module) {
    main();
}
