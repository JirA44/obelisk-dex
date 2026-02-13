/**
 * Example client for Obelisk Price Feed
 * Shows how to connect and receive real-time ms prices
 */

const WebSocket = require('ws');

class ObeliskPriceClient {
  constructor(wsUrl = 'ws://localhost:8080') {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.prices = new Map();
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.on('open', () => {
        console.log('Connected to Obelisk Price Feed');
        resolve();
      });

      this.ws.on('message', (data) => {
        const msg = JSON.parse(data);

        switch (msg.type) {
          case 'snapshot':
            // Initial price snapshot
            for (const [token, price] of Object.entries(msg.data)) {
              this.prices.set(token, price);
              this.emit('price', token, price);
            }
            break;

          case 'price':
            // Real-time price update
            this.prices.set(msg.token, msg.data);
            this.emit('price', msg.token, msg.data);
            break;
        }
      });

      this.ws.on('error', reject);
      this.ws.on('close', () => {
        console.log('Disconnected, reconnecting in 5s...');
        setTimeout(() => this.connect(), 5000);
      });
    });
  }

  subscribe(tokens) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        tokens
      }));
    }
  }

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  emit(event, ...args) {
    const cbs = this.callbacks.get(event) || [];
    for (const cb of cbs) {
      cb(...args);
    }
  }

  getPrice(token) {
    return this.prices.get(token);
  }

  getAllPrices() {
    return Object.fromEntries(this.prices);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// ============ USAGE EXAMPLE ============

async function main() {
  const client = new ObeliskPriceClient();

  // Connect to price feed
  await client.connect();

  // Subscribe to specific tokens
  client.subscribe(['BTC', 'ETH', 'SOL']);

  // Listen for price updates
  client.on('price', (token, data) => {
    console.log(`[${new Date(data.timestamp).toISOString()}] ${token}: $${data.price.toFixed(2)}`);
    console.log(`  Sources: ${data.sources.join(', ')}`);
    console.log(`  Confidence: ${data.confidence}%`);
    console.log(`  Spread: ${data.spread}%`);
    console.log(`  Latency: ${Date.now() - data.timestamp}ms`);
    console.log('');
  });

  // Keep running
  console.log('Listening for price updates (Ctrl+C to exit)...\n');
}

main().catch(console.error);

module.exports = { ObeliskPriceClient };
