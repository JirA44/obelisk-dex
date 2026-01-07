/**
 * Obelisk DEX - Price Feed API Server
 * REST + WebSocket endpoints for real-time prices (ms precision)
 */

const express = require('express');
const cors = require('cors');
const { PriceAggregator } = require('./aggregator');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize aggregator
const aggregator = new PriceAggregator({
  updateInterval: 100,        // Aggregate every 100ms
  onChainUpdateInterval: 5000 // Push to chain every 5s
});

// ============ REST ENDPOINTS ============

/**
 * GET /prices
 * Get all aggregated prices
 * Response: { BTC: {...}, ETH: {...}, ... }
 */
app.get('/prices', (req, res) => {
  const prices = aggregator.getAllPrices();
  res.json({
    success: true,
    timestamp: Date.now(),
    data: prices
  });
});

/**
 * GET /price/:token
 * Get price for specific token
 */
app.get('/price/:token', (req, res) => {
  const token = req.params.token.toUpperCase();
  const price = aggregator.getPrice(token);

  if (!price) {
    return res.status(404).json({
      success: false,
      error: `Price not found for ${token}`
    });
  }

  res.json({
    success: true,
    timestamp: Date.now(),
    token,
    data: price
  });
});

/**
 * GET /twap/:token
 * Get TWAP for token (default 5 min)
 */
app.get('/twap/:token', (req, res) => {
  const token = req.params.token.toUpperCase();
  const period = parseInt(req.query.period) || 300000; // 5 min default

  const twap = aggregator.getTWAP(token, period);

  if (twap === null) {
    return res.status(404).json({
      success: false,
      error: `TWAP not available for ${token}`
    });
  }

  res.json({
    success: true,
    timestamp: Date.now(),
    token,
    periodMs: period,
    twap
  });
});

/**
 * GET /pair/:tokenA/:tokenB
 * Get price of tokenA in terms of tokenB
 */
app.get('/pair/:tokenA/:tokenB', (req, res) => {
  const tokenA = req.params.tokenA.toUpperCase();
  const tokenB = req.params.tokenB.toUpperCase();

  const priceA = aggregator.getPrice(tokenA);
  const priceB = aggregator.getPrice(tokenB);

  if (!priceA || !priceB) {
    return res.status(404).json({
      success: false,
      error: 'Price not found for one or both tokens'
    });
  }

  const pairPrice = priceA.price / priceB.price;

  res.json({
    success: true,
    timestamp: Date.now(),
    pair: `${tokenA}/${tokenB}`,
    price: pairPrice,
    priceA: priceA.price,
    priceB: priceB.price,
    confidence: Math.min(priceA.confidence, priceB.confidence)
  });
});

/**
 * GET /quote
 * Get swap quote with price impact
 */
app.get('/quote', (req, res) => {
  const { tokenIn, tokenOut, amountIn, reserveIn, reserveOut } = req.query;

  if (!tokenIn || !tokenOut || !amountIn) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: tokenIn, tokenOut, amountIn'
    });
  }

  const priceIn = aggregator.getPrice(tokenIn.toUpperCase());
  const priceOut = aggregator.getPrice(tokenOut.toUpperCase());

  if (!priceIn || !priceOut) {
    return res.status(404).json({
      success: false,
      error: 'Price not found'
    });
  }

  const amount = parseFloat(amountIn);
  const spotPrice = priceIn.price / priceOut.price;

  // If reserves provided, calculate with AMM formula
  let amountOut, priceImpact, effectivePrice;

  if (reserveIn && reserveOut) {
    const rIn = parseFloat(reserveIn);
    const rOut = parseFloat(reserveOut);
    const amountInWithFee = amount * 0.997; // 0.3% fee
    amountOut = (amountInWithFee * rOut) / (rIn + amountInWithFee);
    effectivePrice = amount / amountOut;
    priceImpact = ((effectivePrice / spotPrice) - 1) * 100;
  } else {
    // Without reserves, use spot price
    amountOut = amount * spotPrice;
    effectivePrice = spotPrice;
    priceImpact = 0;
  }

  res.json({
    success: true,
    timestamp: Date.now(),
    quote: {
      tokenIn: tokenIn.toUpperCase(),
      tokenOut: tokenOut.toUpperCase(),
      amountIn: amount,
      amountOut,
      spotPrice,
      effectivePrice,
      priceImpact: priceImpact.toFixed(4) + '%',
      fee: '0.30%'
    }
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  const prices = aggregator.getAllPrices();
  const tokenCount = Object.keys(prices).length;
  const avgConfidence = tokenCount > 0
    ? Object.values(prices).reduce((sum, p) => sum + p.confidence, 0) / tokenCount
    : 0;

  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    tokens: tokenCount,
    avgConfidence: avgConfidence.toFixed(2)
  });
});

/**
 * GET /sources
 * Get source status
 */
app.get('/sources', (req, res) => {
  const sources = ['binance', 'coinbase', 'kraken', 'coingecko'];
  const status = {};

  for (const source of sources) {
    const ws = aggregator.wsConnections.get(source);
    status[source] = {
      connected: ws ? ws.readyState === 1 : false,
      type: source === 'coingecko' ? 'REST' : 'WebSocket'
    };
  }

  res.json({
    success: true,
    sources: status
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 8080;

async function start() {
  // Start price aggregator
  await aggregator.start();

  // Start REST API
  app.listen(PORT, () => {
    console.log(`REST API running on http://localhost:${PORT}`);
    console.log(`WebSocket feed on ws://localhost:${WS_PORT}`);
    console.log('\nEndpoints:');
    console.log('  GET /prices         - All prices');
    console.log('  GET /price/:token   - Single token price');
    console.log('  GET /twap/:token    - TWAP price');
    console.log('  GET /pair/:a/:b     - Pair price');
    console.log('  GET /quote          - Swap quote');
    console.log('  GET /health         - Health check');
    console.log('  GET /sources        - Source status');
    console.log('\nWebSocket: Connect to ws://localhost:8080 for real-time ms updates');
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  aggregator.stop();
  process.exit(0);
});

start().catch(console.error);

module.exports = { app, aggregator };
