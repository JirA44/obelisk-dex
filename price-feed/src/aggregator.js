/**
 * Obelisk DEX - Multi-Source Price Aggregator
 * Real-time price feeds with millisecond precision
 */

const WebSocket = require('ws');
const axios = require('axios');
const { ethers } = require('ethers');

// Price sources configuration
const SOURCES = {
  binance: {
    ws: 'wss://stream.binance.com:9443/ws',
    rest: 'https://api.binance.com/api/v3',
    weight: 3,
    symbols: {
      'BTC': 'btcusdt',
      'ETH': 'ethusdt',
      'SOL': 'solusdt',
      'ARB': 'arbusdt'
    }
  },
  coinbase: {
    ws: 'wss://ws-feed.exchange.coinbase.com',
    rest: 'https://api.exchange.coinbase.com',
    weight: 3,
    symbols: {
      'BTC': 'BTC-USD',
      'ETH': 'ETH-USD',
      'SOL': 'SOL-USD'
    }
  },
  kraken: {
    ws: 'wss://ws.kraken.com',
    rest: 'https://api.kraken.com/0/public',
    weight: 2,
    symbols: {
      'BTC': 'XBT/USD',
      'ETH': 'ETH/USD',
      'SOL': 'SOL/USD'
    }
  },
  coingecko: {
    rest: 'https://api.coingecko.com/api/v3',
    weight: 1,
    ids: {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'ARB': 'arbitrum',
      'RBTC': 'rootstock'
    }
  }
};

class PriceAggregator {
  constructor(config = {}) {
    this.prices = new Map(); // token => { sources: Map, aggregated: {...} }
    this.subscribers = new Set();
    this.wsConnections = new Map();
    this.updateInterval = config.updateInterval || 100; // 100ms default
    this.onChainUpdateInterval = config.onChainUpdateInterval || 5000; // 5s for on-chain
    this.priceHistory = new Map(); // token => [{price, timestamp}]
    this.maxHistoryLength = 1000;

    // Supported tokens
    this.tokens = ['BTC', 'ETH', 'SOL', 'ARB', 'RBTC'];

    // Initialize price storage
    this.tokens.forEach(token => {
      this.prices.set(token, {
        sources: new Map(),
        aggregated: null
      });
      this.priceHistory.set(token, []);
    });
  }

  // ============ WEBSOCKET CONNECTIONS ============

  async connectBinance() {
    const streams = Object.values(SOURCES.binance.symbols)
      .map(s => `${s}@trade`)
      .join('/');

    const ws = new WebSocket(`${SOURCES.binance.ws}/${streams}`);

    ws.on('open', () => console.log('[Binance] Connected'));

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.e === 'trade') {
        const symbol = msg.s.toLowerCase();
        const token = this.getTokenFromSymbol('binance', symbol);
        if (token) {
          this.updateSourcePrice('binance', token, {
            price: parseFloat(msg.p),
            timestamp: msg.T, // Trade time in ms
            volume: parseFloat(msg.q)
          });
        }
      }
    });

    ws.on('error', (err) => console.error('[Binance] Error:', err.message));
    ws.on('close', () => {
      console.log('[Binance] Disconnected, reconnecting...');
      setTimeout(() => this.connectBinance(), 5000);
    });

    this.wsConnections.set('binance', ws);
  }

  async connectCoinbase() {
    const ws = new WebSocket(SOURCES.coinbase.ws);

    ws.on('open', () => {
      console.log('[Coinbase] Connected');
      ws.send(JSON.stringify({
        type: 'subscribe',
        product_ids: Object.values(SOURCES.coinbase.symbols),
        channels: ['matches']
      }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'match') {
        const token = this.getTokenFromSymbol('coinbase', msg.product_id);
        if (token) {
          this.updateSourcePrice('coinbase', token, {
            price: parseFloat(msg.price),
            timestamp: new Date(msg.time).getTime(),
            volume: parseFloat(msg.size)
          });
        }
      }
    });

    ws.on('error', (err) => console.error('[Coinbase] Error:', err.message));
    ws.on('close', () => {
      console.log('[Coinbase] Disconnected, reconnecting...');
      setTimeout(() => this.connectCoinbase(), 5000);
    });

    this.wsConnections.set('coinbase', ws);
  }

  async connectKraken() {
    const ws = new WebSocket(SOURCES.kraken.ws);

    ws.on('open', () => {
      console.log('[Kraken] Connected');
      ws.send(JSON.stringify({
        event: 'subscribe',
        pair: Object.values(SOURCES.kraken.symbols),
        subscription: { name: 'trade' }
      }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (Array.isArray(msg) && msg.length >= 4) {
        const trades = msg[1];
        const pair = msg[3];
        const token = this.getTokenFromSymbol('kraken', pair);
        if (token && trades.length > 0) {
          const trade = trades[trades.length - 1];
          this.updateSourcePrice('kraken', token, {
            price: parseFloat(trade[0]),
            timestamp: parseFloat(trade[2]) * 1000,
            volume: parseFloat(trade[1])
          });
        }
      }
    });

    ws.on('error', (err) => console.error('[Kraken] Error:', err.message));
    ws.on('close', () => {
      console.log('[Kraken] Disconnected, reconnecting...');
      setTimeout(() => this.connectKraken(), 5000);
    });

    this.wsConnections.set('kraken', ws);
  }

  // ============ REST API POLLING ============

  async pollCoinGecko() {
    try {
      const ids = Object.values(SOURCES.coingecko.ids).join(',');
      const response = await axios.get(
        `${SOURCES.coingecko.rest}/simple/price?ids=${ids}&vs_currencies=usd&include_last_updated_at=true`
      );

      const timestampMs = Date.now();
      for (const [token, id] of Object.entries(SOURCES.coingecko.ids)) {
        if (response.data[id]) {
          this.updateSourcePrice('coingecko', token, {
            price: response.data[id].usd,
            timestamp: response.data[id].last_updated_at * 1000 || timestampMs,
            volume: 0
          });
        }
      }
    } catch (err) {
      console.error('[CoinGecko] Error:', err.message);
    }
  }

  // ============ PRICE AGGREGATION ============

  updateSourcePrice(source, token, data) {
    const tokenData = this.prices.get(token);
    if (!tokenData) return;

    tokenData.sources.set(source, {
      ...data,
      receivedAt: Date.now()
    });

    this.aggregatePrices(token);
  }

  aggregatePrices(token) {
    const tokenData = this.prices.get(token);
    if (!tokenData) return;

    const now = Date.now();
    const validSources = [];
    let weightedSum = 0;
    let totalWeight = 0;
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const [sourceName, data] of tokenData.sources) {
      // Only use prices less than 10 seconds old
      if (now - data.receivedAt > 10000) continue;

      const weight = SOURCES[sourceName]?.weight || 1;
      weightedSum += data.price * weight;
      totalWeight += weight;
      validSources.push(sourceName);

      minPrice = Math.min(minPrice, data.price);
      maxPrice = Math.max(maxPrice, data.price);
    }

    if (totalWeight === 0) return;

    const aggregatedPrice = weightedSum / totalWeight;
    const spread = maxPrice > 0 ? ((maxPrice - minPrice) / aggregatedPrice) * 100 : 0;

    // Confidence based on source count and spread
    const sourceScore = Math.min(validSources.length / 4, 1) * 50;
    const spreadScore = Math.max(0, 50 - spread * 10);
    const confidence = Math.round(sourceScore + spreadScore);

    const aggregated = {
      price: aggregatedPrice,
      priceWei: ethers.parseUnits(aggregatedPrice.toFixed(18), 18).toString(),
      timestamp: now,
      confidence: Math.min(confidence, 100),
      sourceCount: validSources.length,
      sources: validSources,
      spread: spread.toFixed(4),
      min: minPrice,
      max: maxPrice
    };

    tokenData.aggregated = aggregated;

    // Store in history
    const history = this.priceHistory.get(token);
    history.push({ price: aggregatedPrice, timestamp: now });
    if (history.length > this.maxHistoryLength) {
      history.shift();
    }

    // Notify subscribers
    this.notifySubscribers(token, aggregated);
  }

  // ============ WEBSOCKET SERVER ============

  startServer(port = 8080) {
    this.wss = new WebSocket.Server({ port });

    this.wss.on('connection', (ws) => {
      console.log('Client connected');
      this.subscribers.add(ws);

      // Send current prices
      const currentPrices = {};
      for (const [token, data] of this.prices) {
        if (data.aggregated) {
          currentPrices[token] = data.aggregated;
        }
      }
      ws.send(JSON.stringify({ type: 'snapshot', data: currentPrices }));

      ws.on('close', () => {
        this.subscribers.delete(ws);
        console.log('Client disconnected');
      });

      ws.on('message', (msg) => {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.type === 'subscribe') {
            ws.subscribedTokens = parsed.tokens || this.tokens;
          }
        } catch {}
      });
    });

    console.log(`WebSocket server running on port ${port}`);
  }

  notifySubscribers(token, data) {
    const message = JSON.stringify({
      type: 'price',
      token,
      data
    });

    for (const ws of this.subscribers) {
      if (ws.readyState === WebSocket.OPEN) {
        if (!ws.subscribedTokens || ws.subscribedTokens.includes(token)) {
          ws.send(message);
        }
      }
    }
  }

  // ============ ON-CHAIN UPDATES ============

  async setupOnChainUpdater(config) {
    const { rpcUrl, privateKey, oracleAddress } = config;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    const oracleAbi = [
      'function updatePrices(address[] tokens, uint256[] prices, uint256[] timestampsMs, uint8[] confidences, uint8[] sourceCounts) external',
      'function updatePrice(address token, uint256 price, uint256 timestampMs, uint8 confidence, uint8 sourceCount) external'
    ];

    this.oracle = new ethers.Contract(oracleAddress, oracleAbi, this.wallet);
    console.log('On-chain updater configured');
  }

  async pushToChain(tokenAddresses) {
    if (!this.oracle) return;

    const tokens = [];
    const prices = [];
    const timestamps = [];
    const confidences = [];
    const sourceCounts = [];

    for (const [symbol, address] of Object.entries(tokenAddresses)) {
      const data = this.prices.get(symbol)?.aggregated;
      if (data) {
        tokens.push(address);
        prices.push(data.priceWei);
        timestamps.push(data.timestamp);
        confidences.push(data.confidence);
        sourceCounts.push(data.sourceCount);
      }
    }

    if (tokens.length === 0) return;

    try {
      const tx = await this.oracle.updatePrices(
        tokens, prices, timestamps, confidences, sourceCounts
      );
      console.log(`On-chain update: ${tx.hash}`);
      await tx.wait();
    } catch (err) {
      console.error('On-chain update failed:', err.message);
    }
  }

  // ============ TWAP CALCULATION ============

  getTWAP(token, periodMs = 300000) {
    const history = this.priceHistory.get(token);
    if (!history || history.length === 0) return null;

    const now = Date.now();
    const cutoff = now - periodMs;

    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].timestamp < cutoff) break;
      const weight = history[i].timestamp - cutoff;
      weightedSum += history[i].price * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }

  // ============ HELPERS ============

  getTokenFromSymbol(source, symbol) {
    const symbols = SOURCES[source]?.symbols || SOURCES[source]?.ids;
    if (!symbols) return null;

    for (const [token, sym] of Object.entries(symbols)) {
      if (sym.toLowerCase() === symbol.toLowerCase()) {
        return token;
      }
    }
    return null;
  }

  getPrice(token) {
    return this.prices.get(token)?.aggregated || null;
  }

  getAllPrices() {
    const result = {};
    for (const [token, data] of this.prices) {
      if (data.aggregated) {
        result[token] = data.aggregated;
      }
    }
    return result;
  }

  // ============ LIFECYCLE ============

  async start() {
    console.log('Starting Obelisk Price Aggregator...');

    // Connect to WebSocket feeds
    await Promise.all([
      this.connectBinance(),
      this.connectCoinbase(),
      this.connectKraken()
    ]);

    // Start REST polling for CoinGecko (every 30s)
    this.coingeckoInterval = setInterval(() => this.pollCoinGecko(), 30000);
    await this.pollCoinGecko();

    // Start WebSocket server
    this.startServer();

    console.log('Price aggregator started');
  }

  stop() {
    // Close WebSocket connections
    for (const ws of this.wsConnections.values()) {
      ws.close();
    }

    // Clear intervals
    if (this.coingeckoInterval) {
      clearInterval(this.coingeckoInterval);
    }

    // Close server
    if (this.wss) {
      this.wss.close();
    }

    console.log('Price aggregator stopped');
  }
}

module.exports = { PriceAggregator, SOURCES };
