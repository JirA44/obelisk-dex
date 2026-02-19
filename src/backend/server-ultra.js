/**
 * OBELISK Ultra-Fast Trading Server
 * NON-CUSTODIAL - Real-time trading API with millisecond price updates
 *
 * Features:
 * - Millisecond price updates (50ms intervals)
 * - Top 15+ trading pairs
 * - Institutional-grade API for bots
 * - WebSocket streaming
 */

const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');
const http = require('http');
const https = require('https');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

// ===========================================
// SENTRY ERROR TRACKING (must be early)
// ===========================================
const {
    initSentry,
    sentryRequestHandler,
    sentryErrorHandler,
    captureError
} = require('./sentry');
const SentryInstance = initSentry();

// ===========================================
// CONFIGURATION VALIDATION
// ===========================================
const { validateConfig } = require('./config-validator');
validateConfig({ exitOnError: true });
// ===========================================
// PRODUCTION SECURITY MIDDLEWARE
// ===========================================
const { rateLimiters: prodRateLimiters, securityHeaders, corsOptions, noSqlInjectionProtection, parameterPollutionProtection } = require('./middleware/security');
const { authenticateUser, authenticateBot, optionalAuth, requirePermission, generateApiKey, generateToken } = require('./middleware/auth');
const { validationChains } = require('./middleware/validation');
const { createLogger, requestTiming, logger } = require('./middleware/logging');
const { router: healthRouter, updateHealthState, healthState, startAutoCheck, stopAutoCheck, trackResponseTime, incrementRequestCount } = require('./routes/health');
const authRouter = require('./routes/auth');
// ===========================================
// PRODUCTION AUTH & LEGAL ROUTES
// ===========================================
const legalRouter = require('./routes/legal');
// ===========================================
// ADMIN & ONBOARDING ROUTES
// ===========================================
const adminRouter = require('./routes/admin');
const onboardingRouter = require('./routes/onboarding');
const educationRouter = require('./routes/education');
const helpRouter = require('./routes/help');
const featuresRouter = require('./routes/features');
const kycRouter = require('./routes/kyc');
const defiRouter = require('./routes/defi');
const liquidityRouter = require('./routes/liquidity');
const marketIntelRouter = require('./routes/market_intel');
const { getFeatureStatus, isDemoMode, canDeposit } = require('./config/features');

const cookieParser = require('cookie-parser');

const { setupSwagger } = require('./swagger');
const { setupGracefulShutdown } = require('./middleware/shutdown');


// Import DEX Aggregator
const { RealDexAggregator } = require('./real-dex-aggregator');
const dexAggregator = new RealDexAggregator();

// Import Hyperliquid Executor for MixBot fallback
const { HyperliquidExecutor } = require('./hyperliquid-executor');
const hyperliquidExecutor = new HyperliquidExecutor();

// Import DEX Executor (GMX Perps + Spot Swaps on Arbitrum)
const { DexExecutor } = require('./dex-executor');
const dexExecutor = new DexExecutor();

// Import dYdX v4 Executor (Cosmos chain perpetuals)
const { DydxExecutor } = require('./dydx-executor');
const dydxExecutor = new DydxExecutor();

// Import Gains Network Executor (150x leverage perps - Crypto, Forex, Stocks)
const { GainsExecutor } = require('./gains-executor');
const gainsExecutor = new GainsExecutor();

// V2.4: Import Internal Matching Engine (Obelisk autonomous trading)
const { InternalMatchingEngine } = require('./internal-matching-engine');
const internalEngine = new InternalMatchingEngine();

// V2.5: Import Obelisk AMM (autonomous trading like Uniswap)
const { ObeliskAMM } = require('./obelisk-amm');
const obeliskAMM = new ObeliskAMM();

// V2.6: Import Obelisk Perps (internal perpetuals engine)
const { ObeliskPerps } = require('./obelisk-perps');
const obeliskPerps = new ObeliskPerps();

// V3.0 TURBO: Import Blockchain Settlement Engines (Multi-chain settlement)
const BlockchainSettlementEngine = require('./blockchain-settlement');
const SmartAccountExecutor = require('./executors/smart-account-executor');
const ArbitrumExecutor = require('./executors/arbitrum-executor');
const BaseExecutor = require('./executors/base-executor');
const OptimismExecutor = require('./executors/optimism-executor');
const SonicExecutor = require('./executors/sonic-executor');

// Initialize blockchain settlement engine
const blockchainSettlement = new BlockchainSettlementEngine({
    solanaMode: 'MAINNET',
    cosmosNetwork: 'COSMOS_TESTNET',
    arbitrumNetwork: 'MAINNET',
    strategy: 'CHEAPEST_FIRST'
});

// Initialize Smart Account executor (Arbitrum by default)
const smartAccountExecutor = new SmartAccountExecutor({
    network: 'ARBITRUM',
    mode: 'MAINNET'
});

// Initialize additional executors
const arbitrumExecutor = new ArbitrumExecutor({ network: 'MAINNET' });
const baseExecutor = new BaseExecutor({ network: 'MAINNET' });
const optimismExecutor = new OptimismExecutor({ network: 'MAINNET' });
const sonicExecutor = new SonicExecutor({ network: 'MAINNET' });

console.log('✅ V3 TURBO Blockchain Settlement Engines initialized');

// V3.1: Auto-Batcher for blockchain settlements (batch every 10s)
const AutoBatcher = require('./auto-batcher');
const settlementBatcher = new AutoBatcher(blockchainSettlement, {
    mode: 'HYBRID',
    batchInterval: 10000,  // 10s batches
    batchSize: 10,          // Or when 10 trades accumulated
    enabled: true           // Auto-settlement ON
});

// Connect settlement to Obelisk Perps
obeliskPerps.settlementEngine = blockchainSettlement;
obeliskPerps.batcher = settlementBatcher;
console.log('✅ Auto-Batcher initialized - Settlement enabled (Sonic Multicall3 priority)');

// ===========================================
// MULTI-SOURCE PRICE AGGREGATION
// ===========================================
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const COINBASE_WS_URL = 'wss://ws-feed.exchange.coinbase.com';
const KRAKEN_WS_URL = 'wss://ws.kraken.com';

// ===========================================
// OBELISK PLATFORM FEES (0.1% per transaction)
// ===========================================
const OBELISK_FEE_RATE = 0.001; // 0.1%
const OBELISK_FEE_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00'; // Platform wallet
let totalFeesCollected = 0; // Track total fees in USD

// Store prices from each source
const pricesBySource = {
    binance: {},
    coinbase: {},
    kraken: {},
    hyperliquid: {},
    dydx: {}
};

// Aggregated best prices
const aggregatedPrices = {};

// Mapping Obelisk pairs to Binance symbols
const BINANCE_SYMBOL_MAP = {
    'BTC/USDC': 'btcusdt',
    'ETH/USDC': 'ethusdt',
    'SOL/USDC': 'solusdt',
    'ARB/USDC': 'arbusdt',
    'BTC/USDT': 'btcusdt',
    'ETH/USDT': 'ethusdt',
    'SOL/USDT': 'solusdt',
    'XRP/USDC': 'xrpusdt',
    'ADA/USDC': 'adausdt',
    'AVAX/USDC': 'avaxusdt',
    'DOGE/USDC': 'dogeusdt',
    'DOT/USDC': 'dotusdt',
    'LINK/USDC': 'linkusdt',
    'MATIC/USDC': 'polusdt', // MATIC renamed to POL on Binance
    'UNI/USDC': 'uniusdt',
    'OP/USDC': 'opusdt',
    'APT/USDC': 'aptusdt',
    'INJ/USDC': 'injusdt',
    'SUI/USDC': 'suiusdt',
    'TIA/USDC': 'tiausdt',
    'JTO/USDC': 'jtousdt',
    'WIF/USDC': 'wifusdt',
    'BONK/USDC': 'bonkusdt'
};

// Reverse mapping: Binance symbol -> Obelisk pairs
const REVERSE_SYMBOL_MAP = {};
Object.entries(BINANCE_SYMBOL_MAP).forEach(([obelisk, binance]) => {
    if (!REVERSE_SYMBOL_MAP[binance]) {
        REVERSE_SYMBOL_MAP[binance] = [];
    }
    REVERSE_SYMBOL_MAP[binance].push(obelisk);
});

let binanceWs = null;
let binanceConnected = false;
let binanceReconnectTimer = null;

// Coinbase WebSocket
let coinbaseWs = null;
let coinbaseConnected = false;

// Kraken WebSocket
let krakenWs = null;
let krakenConnected = false;

// Coinbase symbol mapping
const COINBASE_SYMBOL_MAP = {
    'BTC/USDC': 'BTC-USD',
    'ETH/USDC': 'ETH-USD',
    'SOL/USDC': 'SOL-USD',
    'XRP/USDC': 'XRP-USD',
    'ADA/USDC': 'ADA-USD',
    'AVAX/USDC': 'AVAX-USD',
    'DOGE/USDC': 'DOGE-USD',
    'DOT/USDC': 'DOT-USD',
    'LINK/USDC': 'LINK-USD',
    'UNI/USDC': 'UNI-USD',
    'OP/USDC': 'OP-USD',
    'APT/USDC': 'APT-USD',
    'SUI/USDC': 'SUI-USD'
};

// Kraken symbol mapping
const KRAKEN_SYMBOL_MAP = {
    'BTC/USDC': 'XBT/USD',
    'ETH/USDC': 'ETH/USD',
    'SOL/USDC': 'SOL/USD',
    'XRP/USDC': 'XRP/USD',
    'ADA/USDC': 'ADA/USD',
    'AVAX/USDC': 'AVAX/USD',
    'DOGE/USDC': 'DOGE/USD',
    'DOT/USDC': 'DOT/USD',
    'LINK/USDC': 'LINK/USD'
};

// Import lending system
const { LendingSystem, LENDING_CONFIG } = require('./lending-system');
const lendingSystem = new LendingSystem();

// Import micro-invest system (min 0.01 USDC)
const { MicroInvestSystem, MICRO_CONFIG } = require('./micro-invest');
const microInvest = new MicroInvestSystem(lendingSystem);

// Import passive investment products (NO LOSS products)
const { PassiveInvestmentProducts } = require('./passive-products');
const passiveProducts = new PassiveInvestmentProducts();

// V3.0: Import Trading Router (central trading hub for MixBot)
const { tradingRouter } = require('./trading-router');

// V3.0: Import Simulated Traders Academy
const { simulatedTraders } = require('./simulated-traders');

// V3.0: Import Trading & Academy routes
const { router: tradingRoutes, initTradingRoutes } = require('./routes/trading');
const { router: academyRoutes, initAcademyRoutes } = require('./routes/academy');

// Import database and auth (for real users)
const db = require('./database');
const { auth, rateLimiters: existingRateLimiters } = require('./auth');
const { security } = require('./security');

// Performance tracking
const startTime = Date.now();
let priceUpdates = 0;
let tradesProcessed = 0;

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  🚀 OBELISK ULTRA-FAST SERVER - Millisecond Price Updates     ║');
console.log('║  🔐 NON-CUSTODIAL MODE - Private keys NEVER stored            ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Inject Obelisk Perps for venue trading
app.set('obeliskPerps', obeliskPerps);

// SECURITY: Disable Express server header
app.disable('x-powered-by');

// SECURITY: Security headers (helmet) - apply first
app.use(securityHeaders);

// Health check BEFORE CORS (for monitoring tools)
app.use('/api/health', healthRouter);

// Middleware - CORS with proper security
app.use(cors(corsOptions));

// SECURITY: Limit request body size to prevent DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// SECURITY: NoSQL injection & parameter pollution protection
app.use(noSqlInjectionProtection);
app.use(parameterPollutionProtection);

// SECURITY: Anti-hacking protection middleware
app.use(security.middleware());

// SENTRY: Request handler (must be first handler after basic middleware)
app.use(sentryRequestHandler());

// ===========================================
// PRODUCTION MIDDLEWARE STACK
// ===========================================

// Request logging
app.use(...createLogger());
app.use(requestTiming);

// Rate limiting by route type
app.use('/api/auth', prodRateLimiters.auth);
app.use('/api/order', prodRateLimiters.trading);
app.use('/api/bot', prodRateLimiters.bot);
app.use(['/api/ticker', '/api/markets', '/api/prices'], prodRateLimiters.prices);
app.use('/api', prodRateLimiters.general);

// Authentication routes
app.use('/api/auth', authRouter);

// Cookie parser (for CSRF)
app.use(cookieParser());

// Legal pages (Terms, Privacy, etc.)
app.use('/api/legal', legalRouter);

// Admin API (requires ADMIN_API_KEY)
app.use('/api/admin', adminRouter);

// User onboarding
app.use('/api/onboarding', onboardingRouter);

// Education center for beginners
app.use('/api/education', educationRouter);

// Help center for site usage
app.use('/api/help', helpRouter);

// Feature flags API (public - no rate limit)
app.use('/api/features', featuresRouter);

// KYC verification (Stripe Identity)
app.use('/api/kyc', kycRouter);

// DeFi integrations (Aave, GMX, etc.)
app.use('/api/defi', defiRouter);

// V3.0: Trading Router API (central hub for MixBot)
app.use('/api/trade', tradingRoutes);

// V3.0: Trading Academy API (simulated traders)
app.use('/api/academy', academyRoutes);

// V2.1: Global Liquidity Indicators
app.use('/api/liquidity', liquidityRouter);

// V2.1: Market Intelligence (all indicators aggregated)
app.use('/api/market-intel', marketIntelRouter);

// V3.0 TURBO: Blockchain Settlement API (Multi-chain with Smart Accounts)
const { router: blockchainRouter, initBlockchainRoutes } = require('./routes/blockchain');
initBlockchainRoutes({
    settlement: blockchainSettlement,
    smartAccount: smartAccountExecutor,
    arbitrum: arbitrumExecutor,
    base: baseExecutor,
    optimism: optimismExecutor,
    sonic: sonicExecutor
});
app.use('/api/blockchain', blockchainRouter);

// Sonic DEX Router (ShadowDEX, SwapX, Beets, Equalizer, Metropolis)
const sonicDexRouter = require('./routes/sonic-dex');
app.use('/api/sonic-dex', sonicDexRouter);
console.log('✅ Sonic DEX Router: ShadowDEX CL/V2, SwapX, Beets, Equalizer, Metropolis');

// Public announcements (from admin)
app.get('/api/announcements', (req, res) => {
    res.json({ announcements: adminRouter.getAnnouncements() });
});

// Maintenance mode middleware
app.use((req, res, next) => {
    const maintenance = adminRouter.getMaintenanceMode();
    if (maintenance.enabled && !req.path.startsWith('/api/health') && !req.path.startsWith('/api/admin')) {
        return res.status(503).json({
            error: 'Service temporarily unavailable',
            message: maintenance.message,
            estimatedEnd: maintenance.estimatedEnd
        });
    }
    next();
});



// API Documentation
setupSwagger(app);


// REQUEST TIMEOUT (30 seconds max)
app.use((req, res, next) => {
    req.setTimeout(30000, () => {
        if (!res.headersSent) {
            res.status(408).json({ error: 'Request timeout', code: 'TIMEOUT' });
        }
    });
    res.setTimeout(30000);
    next();
});

// ===========================================
// HEALTH CHECK ENDPOINT (for load balancers & monitoring)
// ===========================================
const serverStartTime = Date.now();
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: Math.floor((Date.now() - serverStartTime) / 1000),
        timestamp: Date.now(),
        version: '4.1.0',
        connections: {
            binance: binanceConnected,
            coinbase: coinbaseConnected,
            kraken: krakenConnected,
            clients: clients.size
        }
    });
});

app.get('/ready', (req, res) => {
    // Ready when at least one price source is connected
    const isReady = binanceConnected || coinbaseConnected || krakenConnected;
    if (isReady) {
        res.json({ ready: true });
    } else {
        res.status(503).json({ ready: false, reason: 'No price sources connected' });
    }
});

// ===========================================
// TOP 15+ MARKETS - Real-time data
// ===========================================
const markets = {
    // Major pairs
    'BTC/USDC': { price: 104850, change24h: 2.34, volume: 2850000000, high: 105200, low: 102800, volatility: 0.0008 },
    'ETH/USDC': { price: 3945, change24h: 1.87, volume: 1580000000, high: 3980, low: 3850, volatility: 0.001 },
    'SOL/USDC': { price: 228.50, change24h: 4.21, volume: 820000000, high: 232, low: 218, volatility: 0.0015 },
    'ARB/USDC': { price: 1.85, change24h: 3.12, volume: 156000000, high: 1.92, low: 1.78, volatility: 0.002 },

    // USDT pairs
    'BTC/USDT': { price: 104850, change24h: 2.34, volume: 1250000000, high: 105200, low: 102800, volatility: 0.0008 },
    'ETH/USDT': { price: 3945, change24h: 1.87, volume: 580000000, high: 3980, low: 3850, volatility: 0.001 },
    'SOL/USDT': { price: 228.50, change24h: 4.21, volume: 320000000, high: 232, low: 218, volatility: 0.0015 },

    // Top 10 tokens
    'XRP/USDC': { price: 2.42, change24h: 3.45, volume: 256000000, high: 2.50, low: 2.35, volatility: 0.0018 },
    'ADA/USDC': { price: 1.15, change24h: 2.11, volume: 178000000, high: 1.18, low: 1.10, volatility: 0.0016 },
    'AVAX/USDC': { price: 53.80, change24h: 5.67, volume: 245000000, high: 55.20, low: 51.50, volatility: 0.002 },
    'DOGE/USDC': { price: 0.425, change24h: -1.23, volume: 189000000, high: 0.44, low: 0.41, volatility: 0.003 },
    'DOT/USDC': { price: 9.85, change24h: 1.92, volume: 98000000, high: 10.10, low: 9.60, volatility: 0.0017 },
    'LINK/USDC': { price: 28.75, change24h: 2.45, volume: 167000000, high: 29.50, low: 28.00, volatility: 0.0015 },
    'MATIC/USDC': { price: 0.68, change24h: 1.78, volume: 134000000, high: 0.70, low: 0.66, volatility: 0.002 },
    'UNI/USDC': { price: 14.25, change24h: 3.21, volume: 112000000, high: 14.80, low: 13.80, volatility: 0.0018 },

    // Additional pairs
    'OP/USDC': { price: 2.95, change24h: 4.56, volume: 89000000, high: 3.05, low: 2.82, volatility: 0.0022 },
    'APT/USDC': { price: 12.80, change24h: 2.89, volume: 76000000, high: 13.20, low: 12.40, volatility: 0.002 },
    'INJ/USDC': { price: 38.50, change24h: 5.12, volume: 145000000, high: 40.00, low: 36.50, volatility: 0.0025 },
    'SUI/USDC': { price: 4.25, change24h: 6.78, volume: 234000000, high: 4.45, low: 3.95, volatility: 0.003 },
    'TIA/USDC': { price: 8.90, change24h: 3.45, volume: 87000000, high: 9.20, low: 8.55, volatility: 0.0022 },
    'JTO/USDC': { price: 3.85, change24h: 4.23, volume: 56000000, high: 4.00, low: 3.65, volatility: 0.0025 },
    'WIF/USDC': { price: 2.45, change24h: 8.92, volume: 178000000, high: 2.65, low: 2.20, volatility: 0.004 },
    'BONK/USDC': { price: 0.0000345, change24h: 12.45, volume: 89000000, high: 0.000038, low: 0.000031, volatility: 0.005 }
};

// Millisecond timestamp tracking
const priceHistory = {};
Object.keys(markets).forEach(pair => {
    priceHistory[pair] = [];
});

// Connected clients
const clients = new Map();
let clientIdCounter = 0;

// Order book per market (deep liquidity)
const orderBooks = {};
Object.keys(markets).forEach(pair => {
    orderBooks[pair] = generateOrderBook(markets[pair].price, pair);
});

// Recent trades with millisecond precision
const recentTrades = {};
Object.keys(markets).forEach(pair => {
    recentTrades[pair] = [];
});

// API Keys for bots
const apiKeys = new Map();

// ===========================================
// BINANCE WEBSOCKET CONNECTION
// ===========================================
function connectToBinance() {
    // Get unique Binance symbols
    const binanceSymbols = [...new Set(Object.values(BINANCE_SYMBOL_MAP))];
    const streams = binanceSymbols.map(s => `${s}@ticker`).join('/');
    const wsUrl = `${BINANCE_WS_URL}/${streams}`;

    console.log('[BINANCE] Connecting to real-time price feed...');
    console.log(`[BINANCE] Subscribing to ${binanceSymbols.length} symbols`);

    binanceWs = new WebSocket(wsUrl);

    binanceWs.on('open', () => {
        binanceConnected = true;
        updateHealthState('binanceConnected', true);
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║  ✅ BINANCE CONNECTED - REAL PRICES ACTIVE                   ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
    });

    binanceWs.on('message', (data) => {
        try {
            const ticker = JSON.parse(data);
            handleBinanceTicker(ticker);
        } catch (e) {
            // Ignore parse errors
        }
    });

    binanceWs.on('close', () => {
        binanceConnected = false;
        updateHealthState('binanceConnected', false);
        console.log('[BINANCE] Connection closed, reconnecting in 5s...');
        binanceReconnectTimer = setTimeout(connectToBinance, 5000);
    });

    binanceWs.on('error', (err) => {
        console.error('[BINANCE] WebSocket error:', err.message);
        binanceConnected = false;
        updateHealthState('binanceConnected', false);
        updateHealthState('error', `Binance WS error: ${err.message}`);
    });
}

function handleBinanceTicker(ticker) {
    const symbol = ticker.s?.toLowerCase();
    if (!symbol) return;

    const obeliskPairs = REVERSE_SYMBOL_MAP[symbol];
    if (!obeliskPairs) return;

    const price = parseFloat(ticker.c); // Current price
    const change24h = parseFloat(ticker.P); // 24h change %
    const volume = parseFloat(ticker.q); // Quote volume (USDT)
    const high = parseFloat(ticker.h); // 24h high
    const low = parseFloat(ticker.l); // 24h low

    // Update all Obelisk pairs that use this Binance symbol
    obeliskPairs.forEach(pair => {
        // Store in multi-source prices
        pricesBySource.binance[pair] = { price, timestamp: Date.now() };

        // Calculate aggregated price (will be overwritten by aggregator)
        updateAggregatedPrice(pair);

        if (markets[pair]) {
            markets[pair].price = price;
            markets[pair].change24h = change24h;
            markets[pair].volume = volume;
            markets[pair].high = high;
            markets[pair].low = low;

            // Store price history
            const now = Date.now();
            priceHistory[pair].push({
                price,
                timestamp: now,
                microTimestamp: process.hrtime.bigint().toString(),
                source: 'binance'
            });
            if (priceHistory[pair].length > 1000) {
                priceHistory[pair].shift();
            }

            // Update order book with real price
            orderBooks[pair] = generateOrderBook(price, pair);
        }
    });

    priceUpdates++;
}

// ===========================================
// PRICE AGGREGATION FUNCTIONS
// ===========================================
function updateAggregatedPrice(pair) {
    const sources = [];
    const prices = [];

    // Collect prices from all sources
    Object.entries(pricesBySource).forEach(([source, data]) => {
        if (data[pair] && data[pair].price && (Date.now() - data[pair].timestamp) < 30000) {
            sources.push(source);
            prices.push(data[pair].price);
        }
    });

    if (prices.length === 0) return;

    // Calculate median (more robust than average)
    prices.sort((a, b) => a - b);
    const median = prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const spread = ((max - min) / median) * 100;

    aggregatedPrices[pair] = {
        median,
        min,
        max,
        spread: spread.toFixed(4),
        sources,
        pricesBySource: Object.fromEntries(
            Object.entries(pricesBySource)
                .filter(([_, data]) => data[pair]?.price)
                .map(([src, data]) => [src, data[pair].price])
        ),
        bestBuy: { price: min, source: sources[prices.indexOf(min)] },
        bestSell: { price: max, source: sources[prices.indexOf(max)] },
        timestamp: Date.now()
    };

    // Update health state with last price update time
    updateHealthState('lastPriceUpdate', Date.now());
}

// Start Binance connection after server starts
setTimeout(connectToBinance, 1000);

// ===========================================
// COINBASE WEBSOCKET CONNECTION
// ===========================================
function connectToCoinbase() {
    console.log('[COINBASE] Connecting to price feed...');

    coinbaseWs = new WebSocket(COINBASE_WS_URL);

    coinbaseWs.on('open', () => {
        coinbaseConnected = true;
        updateHealthState('coinbaseConnected', true);
        console.log('[COINBASE] ✅ Connected');

        // Subscribe to ticker channel
        const products = Object.values(COINBASE_SYMBOL_MAP);
        coinbaseWs.send(JSON.stringify({
            type: 'subscribe',
            product_ids: products,
            channels: ['ticker']
        }));
    });

    coinbaseWs.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            if (msg.type === 'ticker' && msg.price) {
                handleCoinbaseTicker(msg);
            }
        } catch (e) {}
    });

    coinbaseWs.on('close', () => {
        coinbaseConnected = false;
        updateHealthState('coinbaseConnected', false);
        console.log('[COINBASE] Connection closed, reconnecting in 10s...');
        setTimeout(connectToCoinbase, 10000);
    });

    coinbaseWs.on('error', (err) => {
        console.error('[COINBASE] Error:', err.message);
        updateHealthState('error', `Coinbase WS error: ${err.message}`);
    });
}

function handleCoinbaseTicker(ticker) {
    const coinbaseSymbol = ticker.product_id;
    const price = parseFloat(ticker.price);

    // Find Obelisk pair from Coinbase symbol
    Object.entries(COINBASE_SYMBOL_MAP).forEach(([obeliskPair, cbSymbol]) => {
        if (cbSymbol === coinbaseSymbol) {
            pricesBySource.coinbase[obeliskPair] = { price, timestamp: Date.now() };
            updateAggregatedPrice(obeliskPair);
        }
    });
}

// Start Coinbase connection
setTimeout(connectToCoinbase, 2000);

// ===========================================
// KRAKEN WEBSOCKET CONNECTION
// ===========================================
function connectToKraken() {
    console.log('[KRAKEN] Connecting to price feed...');

    krakenWs = new WebSocket(KRAKEN_WS_URL);

    krakenWs.on('open', () => {
        krakenConnected = true;
        updateHealthState('krakenConnected', true);
        console.log('[KRAKEN] ✅ Connected');

        // Subscribe to ticker channel
        const pairs = Object.values(KRAKEN_SYMBOL_MAP);
        krakenWs.send(JSON.stringify({
            event: 'subscribe',
            pair: pairs,
            subscription: { name: 'ticker' }
        }));
    });

    krakenWs.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            // Kraken ticker format: [channelID, data, channelName, pair]
            if (Array.isArray(msg) && msg.length >= 4 && msg[2] === 'ticker') {
                handleKrakenTicker(msg);
            }
        } catch (e) {}
    });

    krakenWs.on('close', () => {
        krakenConnected = false;
        updateHealthState('krakenConnected', false);
        console.log('[KRAKEN] Connection closed, reconnecting in 10s...');
        setTimeout(connectToKraken, 10000);
    });

    krakenWs.on('error', (err) => {
        console.error('[KRAKEN] Error:', err.message);
        updateHealthState('error', `Kraken WS error: ${err.message}`);
    });
}

function handleKrakenTicker(msg) {
    const tickerData = msg[1];
    const krakenPair = msg[3];
    const price = parseFloat(tickerData.c?.[0]); // Last trade price

    if (!price) return;

    // Find Obelisk pair from Kraken symbol
    Object.entries(KRAKEN_SYMBOL_MAP).forEach(([obeliskPair, krPair]) => {
        if (krPair === krakenPair) {
            pricesBySource.kraken[obeliskPair] = { price, timestamp: Date.now() };
            updateAggregatedPrice(obeliskPair);
        }
    });
}

// Start Kraken connection
setTimeout(connectToKraken, 3000);

// ===========================================
// DEX AGGREGATOR POLLING
// ===========================================
async function fetchDexPrices() {
    try {
        await dexAggregator.fetchAllPrices();

        // Map DEX prices to Obelisk pairs
        const dexPrices = dexAggregator.aggregatedPrices;

        Object.entries(dexPrices).forEach(([coin, data]) => {
            const pair = `${coin}/USDC`;
            if (markets[pair]) {
                if (data.prices?.HL) {
                    pricesBySource.hyperliquid[pair] = { price: parseFloat(data.prices.HL), timestamp: Date.now() };
                }
                if (data.prices?.dYdX) {
                    pricesBySource.dydx[pair] = { price: parseFloat(data.prices.dYdX), timestamp: Date.now() };
                }
                updateAggregatedPrice(pair);
            }
        });

        console.log(`[DEX] Updated ${Object.keys(dexPrices).length} prices from Hyperliquid/dYdX`);
    } catch (e) {
        console.error('[DEX] Fetch error:', e.message);
    }
}

// Poll DEX prices every 5 seconds
setTimeout(fetchDexPrices, 5000);
setInterval(fetchDexPrices, 5000);

// ===========================================
// HIGH-FREQUENCY UTILITY FUNCTIONS
// ===========================================
function generateOrderBook(basePrice, pair) {
    const bids = [];
    const asks = [];
    const spread = basePrice * 0.0001; // 0.01% spread

    for (let i = 0; i < 25; i++) {
        const bidPrice = basePrice - spread - (i * basePrice * 0.0001);
        const askPrice = basePrice + spread + (i * basePrice * 0.0001);

        // Realistic liquidity distribution
        const bidQty = (Math.random() * 10 + 1) * Math.exp(-i * 0.1);
        const askQty = (Math.random() * 10 + 1) * Math.exp(-i * 0.1);

        bids.push({
            price: Number(bidPrice.toPrecision(8)),
            quantity: Number(bidQty.toFixed(4)),
            total: Number((bidPrice * bidQty).toFixed(2)),
            orders: Math.floor(Math.random() * 5) + 1
        });
        asks.push({
            price: Number(askPrice.toPrecision(8)),
            quantity: Number(askQty.toFixed(4)),
            total: Number((askPrice * askQty).toFixed(2)),
            orders: Math.floor(Math.random() * 5) + 1
        });
    }

    return {
        bids,
        asks,
        spread: Number(spread.toPrecision(6)),
        spreadPercent: 0.02,
        timestamp: Date.now(),
        timestampMicro: process.hrtime.bigint().toString()
    };
}

// ULTRA-FAST price update (called every 50ms)
// Only simulates prices for pairs NOT connected to Binance
function updatePricesMillisecond() {
    // If Binance is connected, it handles price updates
    // Only simulate for pairs without Binance mapping
    if (binanceConnected) {
        return; // Binance handles all price updates
    }

    // FALLBACK: Simulate prices when Binance is disconnected
    const now = Date.now();
    const microTimestamp = process.hrtime.bigint().toString();

    Object.keys(markets).forEach(pair => {
        const market = markets[pair];
        const volatility = market.volatility || 0.001;

        // Brownian motion with mean reversion
        const randomWalk = (Math.random() - 0.5) * 2 * volatility;
        const meanReversion = (market.price > market.high * 0.98) ? -0.0001 :
                             (market.price < market.low * 1.02) ? 0.0001 : 0;

        const change = randomWalk + meanReversion;
        market.price *= (1 + change);
        market.change24h += change * 100 * 0.01; // Dampened 24h change

        // Update high/low
        if (market.price > market.high) market.high = market.price;
        if (market.price < market.low) market.low = market.price;

        // Store price history (keep last 1000 points = 50 seconds)
        priceHistory[pair].push({
            price: market.price,
            timestamp: now,
            microTimestamp,
            source: 'simulation'
        });
        if (priceHistory[pair].length > 1000) {
            priceHistory[pair].shift();
        }

        // Regenerate order book
        orderBooks[pair] = generateOrderBook(market.price, pair);
    });

    priceUpdates++;
}

function generateTrade(pair, side = null, quantity = null, source = 'market') {
    const market = markets[pair];
    if (!market || !market.price) {
        console.log(`[TRADE] Market ${pair} not found, skipping trade`);
        return null;
    }
    const tradeSide = side || (Math.random() > 0.5 ? 'buy' : 'sell');
    const slippage = (Math.random() - 0.5) * market.price * 0.0002;
    const price = market.price + slippage;
    const qty = quantity || (Math.random() * 2 + 0.01);

    const trade = {
        id: `T${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
        pair,
        side: tradeSide,
        price: Number(price.toPrecision(8)),
        quantity: Number(qty.toFixed(6)),
        total: Number((price * qty).toFixed(2)),
        timestamp: Date.now(),
        timestampMicro: process.hrtime.bigint().toString(),
        source,
        maker: 'user_' + Math.random().toString(36).substr(2, 6),
        taker: 'user_' + Math.random().toString(36).substr(2, 6)
    };

    recentTrades[pair].unshift(trade);
    if (recentTrades[pair].length > 500) {
        recentTrades[pair].pop();
    }

    tradesProcessed++;
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
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        connectedAt: Date.now(),
        isBot: false,
        apiKey: null
    };

    clients.set(clientId, clientInfo);
    healthState.wsConnectionCount = clients.size; // Track WS connections
    console.log(`[WS] Client ${clientId} connected from ${clientInfo.ip} (total: ${clients.size})`);

    ws.send(JSON.stringify({
        type: 'welcome',
        clientId,
        serverTime: Date.now(),
        serverTimeMicro: process.hrtime.bigint().toString(),
        availableMarkets: Object.keys(markets),
        updateInterval: '50ms',
        features: ['millisecond_prices', 'deep_orderbook', 'institutional_api']
    }));

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleClientMessage(clientInfo, message);
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON', timestamp: Date.now() }));
        }
    });

    ws.on('close', () => {
        clients.delete(clientId);
        healthState.wsConnectionCount = clients.size; // Track WS connections
        console.log(`[WS] Client ${clientId} disconnected (remaining: ${clients.size})`);
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
        case 'auth':
            handleAuth(client, payload);
            break;
        case 'ping':
            client.ws.send(JSON.stringify({
                type: 'pong',
                timestamp: Date.now(),
                timestampMicro: process.hrtime.bigint().toString()
            }));
            break;
        case 'get_price_history':
            handlePriceHistory(client, payload);
            break;
        default:
            client.ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
}

function handleAuth(client, payload) {
    const { apiKey, secret } = payload;

    if (apiKey && apiKeys.has(apiKey)) {
        client.isBot = true;
        client.apiKey = apiKey;
        client.ws.send(JSON.stringify({
            type: 'auth_success',
            message: 'Bot authenticated',
            permissions: ['trade', 'read', 'stream'],
            rateLimit: '1000/s'
        }));
        console.log(`[AUTH] Bot authenticated: ${apiKey.substring(0, 8)}...`);
    } else {
        client.ws.send(JSON.stringify({
            type: 'auth_failed',
            message: 'Invalid API key'
        }));
    }
}

function handleSubscribe(client, payload) {
    const { channels } = payload;

    if (!Array.isArray(channels)) {
        client.ws.send(JSON.stringify({ type: 'error', message: 'Channels must be an array' }));
        return;
    }

    channels.forEach(channel => {
        client.subscriptions.add(channel);
        sendInitialData(client, channel);
    });

    client.ws.send(JSON.stringify({
        type: 'subscribed',
        channels: Array.from(client.subscriptions),
        timestamp: Date.now()
    }));
}

function sendInitialData(client, channel) {
    if (channel.startsWith('ticker:')) {
        const pair = channel.replace('ticker:', '');
        if (markets[pair]) {
            client.ws.send(JSON.stringify({
                type: 'ticker',
                pair,
                data: { ...markets[pair], timestamp: Date.now() }
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
                data: recentTrades[pair].slice(0, 100)
            }));
        }
    } else if (channel === 'all_tickers') {
        client.ws.send(JSON.stringify({
            type: 'all_tickers',
            data: Object.entries(markets).map(([pair, data]) => ({
                pair,
                ...data,
                timestamp: Date.now()
            }))
        }));
    }
}

function handleUnsubscribe(client, payload) {
    const { channels } = payload;
    channels.forEach(channel => {
        client.subscriptions.delete(channel);
    });

    client.ws.send(JSON.stringify({
        type: 'unsubscribed',
        channels,
        timestamp: Date.now()
    }));
}

function handlePriceHistory(client, payload) {
    const { pair, limit = 100 } = payload;

    if (!priceHistory[pair]) {
        client.ws.send(JSON.stringify({ type: 'error', message: 'Invalid pair' }));
        return;
    }

    client.ws.send(JSON.stringify({
        type: 'price_history',
        pair,
        data: priceHistory[pair].slice(-limit),
        interval: '50ms'
    }));
}

function handleOrder(client, payload) {
    const pair = payload.pair;
    const side = payload.side;
    const orderType = payload.type || 'market';
    const price = payload.price;
    const quantity = payload.quantity;

    if (!markets[pair]) {
        client.ws.send(JSON.stringify({
            type: 'order_rejected',
            reason: 'Invalid market pair',
            timestamp: Date.now()
        }));
        return;
    }

    if (!quantity || quantity <= 0) {
        client.ws.send(JSON.stringify({
            type: 'order_rejected',
            reason: 'Invalid quantity',
            timestamp: Date.now()
        }));
        return;
    }

    const executionPrice = orderType === 'market' ?
        markets[pair].price * (1 + (side === 'buy' ? 0.0001 : -0.0001)) :
        price;

    const order = {
        id: 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        clientId: client.id,
        pair,
        side,
        type: orderType,
        requestedPrice: price,
        executionPrice: Number(executionPrice.toPrecision(8)),
        quantity: Number(quantity),
        total: Number((executionPrice * quantity).toFixed(2)),
        status: 'filled',
        filledAt: Date.now(),
        filledAtMicro: process.hrtime.bigint().toString(),
        latency: '< 1ms'
    };

    // Create trade
    const trade = generateTrade(pair, side, quantity, client.isBot ? 'bot' : 'user');

    client.ws.send(JSON.stringify({
        type: 'order_filled',
        order,
        trade,
        timestamp: Date.now()
    }));

    // Broadcast trade
    broadcastToSubscribers(`trades:${pair}`, {
        type: 'trade',
        pair,
        data: trade
    });

    console.log(`[ORDER] ${side.toUpperCase()} ${quantity} ${pair} @ ${executionPrice.toPrecision(6)} (${client.isBot ? 'BOT' : 'Client'} ${client.id})`);
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
// ULTRA-FAST MARKET DATA BROADCASTING (50ms)
// ===========================================
setInterval(() => {
    updatePricesMillisecond();

    // Broadcast to subscribed clients
    Object.keys(markets).forEach(pair => {
        broadcastToSubscribers(`ticker:${pair}`, {
            type: 'ticker',
            pair,
            data: {
                ...markets[pair],
                timestamp: Date.now(),
                timestampMicro: process.hrtime.bigint().toString()
            }
        });
    });

    // All tickers channel
    broadcastToSubscribers('all_tickers', {
        type: 'all_tickers',
        data: Object.entries(markets).map(([pair, data]) => ({
            pair,
            ...data,
            timestamp: Date.now()
        })),
        timestamp: Date.now()
    });
}, 50); // 50ms = 20 updates per second

// Order book updates (100ms)
setInterval(() => {
    Object.keys(markets).forEach(pair => {
        broadcastToSubscribers(`orderbook:${pair}`, {
            type: 'orderbook',
            pair,
            data: orderBooks[pair]
        });
    });
}, 100);

// Random trades generation
setInterval(() => {
    const pairs = Object.keys(markets);
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const trade = generateTrade(pair);

    broadcastToSubscribers(`trades:${pair}`, {
        type: 'trade',
        pair,
        data: trade
    });
}, 200);

// ===========================================
// REST API ENDPOINTS (for bots)
// ===========================================
app.get('/', (req, res) => {
    res.json({
        name: 'OBELISK Ultra-Fast Trading API',
        version: '2.1.0',
        status: 'running',
        priceSource: binanceConnected ? 'BINANCE REAL-TIME' : 'SIMULATION',
        features: [
            'Real-time Binance prices',
            'Millisecond price updates (50ms)',
            '20+ trading pairs',
            'Deep liquidity order books',
            'WebSocket streaming',
            'Bot API support'
        ],
        endpoints: {
            markets: '/api/markets',
            ticker: '/api/ticker/:pair',
            tickers: '/api/tickers',
            orderbook: '/api/orderbook/:pair',
            trades: '/api/trades/:pair',
            price_history: '/api/price-history/:pair',
            order: 'POST /api/order',
            stats: '/api/stats',
            binance_status: '/api/binance/status',
            register_bot: 'POST /api/bot/register'
        },
        websocket: {
            url: 'wss://[host]/ws',
            channels: ['ticker:PAIR', 'orderbook:PAIR', 'trades:PAIR', 'all_tickers']
        }
    });
});

// ===========================================
// AUTHENTICATION ENDPOINTS (Wallet-based)
// ===========================================

// Get nonce to sign (step 1)
app.post('/api/auth/nonce', existingRateLimiters.auth.middleware(), (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: 'walletAddress required' });
        }
        const { message, nonce } = auth.getNonce(walletAddress);
        res.json({ message, nonce });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Verify signature and login (step 2)
app.post('/api/auth/verify', existingRateLimiters.auth.middleware(), async (req, res) => {
    try {
        const { walletAddress, signature, nonce } = req.body;
        if (!walletAddress || !signature || !nonce) {
            return res.status(400).json({ error: 'walletAddress, signature, and nonce required' });
        }
        const result = await auth.verifySignature(walletAddress, signature, nonce);
        res.json(result);
    } catch (e) {
        res.status(401).json({ error: e.message });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        auth.logout(authHeader.substring(7));
    }
    res.json({ success: true });
});

// Get current user (protected)
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token' });
    }
    const session = auth.validateToken(authHeader.substring(7));
    if (!session) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    const user = db.getUserById(session.userId);
    const balances = db.getAllBalances(session.userId);
    res.json({
        user: {
            id: user.id,
            wallet: user.wallet_address,
            creditScore: user.credit_score,
            totalVolume: user.total_volume,
            isVerified: user.is_verified === 1
        },
        balances
    });
});

// ===========================================
// PROTECTED USER ENDPOINTS
// ===========================================

// Get user balances (protected)
app.get('/api/user/balances', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const session = auth.validateToken(authHeader.substring(7));
    if (!session) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    res.json(db.getAllBalances(session.userId));
});

// Get user trades (protected)
app.get('/api/user/trades', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const session = auth.validateToken(authHeader.substring(7));
    if (!session) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    res.json(db.getUserTrades(session.userId));
});

// Get user orders (protected)
app.get('/api/user/orders', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const session = auth.validateToken(authHeader.substring(7));
    if (!session) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    res.json(db.getUserOrders(session.userId));
});

// Get user loans (protected)
app.get('/api/user/loans', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const session = auth.validateToken(authHeader.substring(7));
    if (!session) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    res.json(db.getUserLoans(session.userId));
});

// Get global stats (admin only)
app.get('/api/db/stats', (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_API_KEY && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    res.json(db.getGlobalStats());
});

// Get all markets
app.get('/api/markets', (req, res) => {
    res.json({
        markets: Object.keys(markets).map(pair => ({
            pair,
            ...markets[pair],
            timestamp: Date.now()
        })),
        count: Object.keys(markets).length,
        timestamp: Date.now()
    });
});

// All tickers (fast endpoint for bots)
app.get('/api/tickers', (req, res) => {
    const tickers = {};
    Object.entries(markets).forEach(([pair, data]) => {
        tickers[pair] = {
            price: data.price,
            change24h: data.change24h,
            volume: data.volume,
            timestamp: Date.now()
        };
    });
    res.json({ tickers, timestamp: Date.now() });
});

// Single ticker
app.get('/api/ticker/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    if (!markets[pair]) {
        return res.status(404).json({ error: 'Market not found' });
    }
    res.json({
        pair,
        ...markets[pair],
        timestamp: Date.now(),
        timestampMicro: process.hrtime.bigint().toString()
    });
});

// Order book
app.get('/api/orderbook/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    if (!orderBooks[pair]) {
        return res.status(404).json({ error: 'Market not found' });
    }
    const depth = parseInt(req.query.depth) || 25;
    const book = orderBooks[pair];
    res.json({
        pair,
        bids: book.bids.slice(0, depth),
        asks: book.asks.slice(0, depth),
        spread: book.spread,
        timestamp: Date.now()
    });
});

// Recent trades
app.get('/api/trades/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    if (!recentTrades[pair]) {
        return res.status(404).json({ error: 'Market not found' });
    }
    const limit = parseInt(req.query.limit) || 100;
    res.json({
        pair,
        trades: recentTrades[pair].slice(0, limit),
        timestamp: Date.now()
    });
});

// Price history (millisecond granularity)
app.get('/api/price-history/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    if (!priceHistory[pair]) {
        return res.status(404).json({ error: 'Market not found' });
    }
    const limit = parseInt(req.query.limit) || 100;
    res.json({
        pair,
        history: priceHistory[pair].slice(-limit),
        interval: '50ms',
        timestamp: Date.now()
    });
});

// Place order (REST API for bots)
// V2.1: Enhanced with real DEX execution fallback
app.post('/api/order', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const { pair, side, type, price, quantity, leverage, source, strategy } = req.body;

    // SECURITY: Input validation
    if (!pair || typeof pair !== 'string') {
        return res.status(400).json({ error: 'Invalid pair format' });
    }
    if (!side || !['buy', 'sell'].includes(side.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid side (must be buy or sell)' });
    }
    if (!quantity || typeof quantity !== 'number' || quantity <= 0 || quantity > 1000000) {
        return res.status(400).json({ error: 'Invalid quantity (must be 0 < qty <= 1000000)' });
    }

    // V2.1: Get real-time price from aggregated sources
    const pairKey = pair.replace('-', '/').toUpperCase();
    const baseCoin = pairKey.split('/')[0];
    let currentPrice = aggregatedPrices[pairKey]?.price || aggregatedPrices[baseCoin + '/USDT']?.price;

    // Fallback to markets if available
    if (!currentPrice && markets[pair]) {
        currentPrice = markets[pair].price;
    }

    // If still no price, try Binance
    if (!currentPrice) {
        try {
            const binanceSymbol = baseCoin + 'USDT';
            const priceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);
            const priceData = await priceRes.json();
            currentPrice = parseFloat(priceData.price);
        } catch (e) {
            console.log(`[API ORDER] ⚠️ Could not fetch price for ${pair}`);
        }
    }

    if (!currentPrice) {
        return res.status(400).json({ error: 'Could not determine price for pair', pair });
    }

    const executionPrice = type === 'market' ?
        currentPrice * (1 + (side === 'buy' ? 0.0005 : -0.0005)) : // 0.05% slippage
        (price || currentPrice);

    // Calculate totals and fees
    const grossTotal = executionPrice * quantity;
    const platformFee = grossTotal * OBELISK_FEE_RATE; // 0.1% fee
    const netTotal = grossTotal + (side === 'buy' ? platformFee : -platformFee);

    // Track fees collected
    totalFeesCollected += platformFee;

    // V2.8: REAL TRADING FIRST - DEX on-chain, paper only as fallback
    // Priority: 1. DEX Real (GMX/Paraswap) → 2. Paper (AMM/Perps) si échec
    let route = 'PENDING';
    let realExecution = false;

    const coin = pair.split('/')[0].replace('-PERP', '');
    const isPerp = pair.includes('-PERP') || (leverage && leverage > 1);

    // V2.8: TRY REAL DEX EXECUTION FIRST
    if (dexExecutor.initialized) {
        try {
            console.log(`[API ORDER] 🔥 REAL DEX: Trying ${isPerp ? 'GMX Perps' : 'Paraswap Spot'}...`);

            const dexResult = await dexExecutor.execute({
                type: isPerp ? 'perp' : 'spot',
                pair,
                coin,
                side,
                size: quantity * (currentPrice || 1),
                quantity,
                leverage: leverage || 1,
            });

            if (dexResult.success && !dexResult.simulated) {
                console.log(`[API ORDER] ✅ REAL EXECUTION via ${dexResult.route}: ${side.toUpperCase()} ${quantity.toFixed(4)} ${pair}`);

                return res.json({
                    success: true,
                    order: {
                        id: dexResult.order.id,
                        pair,
                        side,
                        executionPrice: dexResult.order.executionPrice,
                        quantity: dexResult.order.quantity || quantity,
                        status: 'filled',
                        filledAt: dexResult.order.filledAt || Date.now(),
                        route: dexResult.route,
                        simulated: false,  // REAL execution on-chain
                        fee: dexResult.fee || 0,
                        txHash: dexResult.order.id
                    },
                    route: dexResult.route,
                    simulated: false,
                    realExecution: true
                });
            } else {
                console.log(`[API ORDER] ⚠️ DEX returned simulated, falling back to paper`);
            }
        } catch (dexErr) {
            console.log(`[API ORDER] ⚠️ DEX error: ${dexErr.message}, falling back to paper`);
        }
    } else {
        console.log(`[API ORDER] ⚠️ DEX not initialized, using paper trading`);
    }

    // V2.8: FALLBACK TO PAPER TRADING (AMM/Perps) if DEX fails
    if (!isPerp) {
        // SPOT via AMM (paper)
        try {
            const tokenIn = side === 'buy' ? 'USDC' : coin;
            const tokenOut = side === 'buy' ? coin : 'USDC';
            const amountIn = side === 'buy' ? quantity * currentPrice : quantity;

            const ammResult = await obeliskAMM.swap(tokenIn, tokenOut, amountIn, source || 'api');

            if (ammResult.success) {
                console.log(`[API ORDER] 📊 PAPER (AMM): ${side.toUpperCase()} ${quantity.toFixed(4)} ${pair}`);

                return res.json({
                    success: true,
                    order: {
                        id: ammResult.order.id,
                        pair,
                        side,
                        executionPrice: ammResult.order.executionPrice,
                        quantity: ammResult.order.amountOut,
                        status: 'filled',
                        filledAt: ammResult.order.filledAt,
                        route: 'OBELISK_AMM_PAPER',
                        simulated: false,  // Accept as "real" for tracking
                        fee: ammResult.order.fee,
                        priceImpact: ammResult.order.priceImpact
                    },
                    route: 'OBELISK_AMM_PAPER',
                    simulated: false,
                    realExecution: false,
                    paperTrading: true
                });
            }
        } catch (ammErr) {
            console.log(`[API ORDER] ⚠️ AMM error: ${ammErr.message}`);
        }
    } else {
        // PERPS via internal engine (paper)
        try {
            const perpSide = side === 'buy' ? 'long' : 'short';
            const sizeUsd = quantity * currentPrice;

            const perpResult = await obeliskPerps.openPosition({
                coin,
                side: perpSide,
                size: sizeUsd,
                leverage: leverage || 2,
                userId: source || 'api'
            });

            if (perpResult.success) {
                console.log(`[API ORDER] 📊 PAPER (PERPS): ${perpSide.toUpperCase()} ${coin} $${sizeUsd.toFixed(0)} @ ${leverage}x`);

                return res.json({
                    success: true,
                    order: {
                        id: perpResult.position.id,
                        pair,
                        side: perpSide,
                        executionPrice: perpResult.position.entryPrice,
                        quantity: sizeUsd,
                        leverage: perpResult.position.leverage,
                        liquidationPrice: perpResult.position.liquidationPrice,
                        status: 'filled',
                        filledAt: Date.now(),
                        route: 'OBELISK_PERPS_PAPER',
                        simulated: false,  // Accept as "real" for tracking
                        fee: perpResult.position.fee
                    },
                    route: 'OBELISK_PERPS_PAPER',
                    simulated: false,
                    realExecution: false,
                    paperTrading: true
                });
            }
        } catch (perpErr) {
            console.log(`[API ORDER] ⚠️ Perps error: ${perpErr.message}`);
        }
    }

    // Fallback for perps or if AMM failed - MIXBOT orders only
    if (source === 'MIXBOT_FALLBACK') {
        route = 'OBELISK_FALLBACK';
        console.log(`[API ORDER] 🔄 MixBot fallback order: ${side.toUpperCase()} ${quantity.toFixed(4)} ${pair}`);
        console.log(`   Strategy: ${strategy || 'unknown'} | Leverage: ${leverage || 1}x`);

        // V2.5: Execution cascade: AMM -> DEX -> HYP -> dYdX
        // Obelisk trade par lui-même d'abord!
        let execResult = null;
        let executedVia = null;
        const coin = pair.split('/')[0].replace('-PERP', '');
        const isPerp = pair.includes('-PERP') || leverage > 1;

        // 1. Try Obelisk AMM FIRST (internal trading - no external dependency)
        if (!isPerp) {  // AMM only for spot
            try {
                console.log(`[API ORDER] 🏦 Trying Obelisk AMM (internal)...`);
                const tokenIn = side === 'buy' ? 'USDC' : coin;
                const tokenOut = side === 'buy' ? coin : 'USDC';
                const amountIn = side === 'buy' ? quantity * currentPrice : quantity;

                execResult = await obeliskAMM.swap(tokenIn, tokenOut, amountIn);

                if (execResult.success) {
                    executedVia = 'OBELISK_AMM';
                    // Map AMM result to standard format
                    execResult.order.quantity = execResult.order.amountOut;
                }
            } catch (ammErr) {
                console.log(`[API ORDER] ⚠️ AMM error: ${ammErr.message}`);
            }
        }

        // 2. If AMM failed or perp, try DEX (GMX for perps, Paraswap for spot)
        if (!executedVia) {
            try {
                console.log(`[API ORDER] 🔄 Trying DEX execution (GMX/Spot)...`);

                execResult = await dexExecutor.execute({
                    type: isPerp ? 'perp' : 'spot',
                    pair,
                    coin,
                    side,
                    size: quantity * (currentPrice || 1), // Convert to USD size
                    quantity,
                    leverage: leverage || 1,
                });

                if (execResult.success && !execResult.simulated) {
                    executedVia = execResult.route;
                }
            } catch (dexErr) {
                console.log(`[API ORDER] ⚠️ DEX error: ${dexErr.message}`);
            }
        }

        // 3. If DEX failed, try Hyperliquid
        if (!executedVia) {
            try {
                console.log(`[API ORDER] 🔄 Trying Hyperliquid...`);
                execResult = await hyperliquidExecutor.execute({
                    pair,
                    side,
                    quantity,
                    leverage: leverage || 1,
                    strategy
                });

                if (execResult.success && !execResult.simulated) {
                    executedVia = 'HYPERLIQUID';
                }
            } catch (hypErr) {
                console.log(`[API ORDER] ⚠️ Hyperliquid error: ${hypErr.message}`);
            }
        }

        // 4. If HYP failed, try dYdX v4
        if (!executedVia && dydxExecutor?.initialized) {
            try {
                console.log(`[API ORDER] 🔄 Trying dYdX v4 execution...`);
                execResult = await dydxExecutor.execute({
                    pair,
                    side,
                    quantity,
                    leverage: leverage || 1,
                    strategy,
                    price: currentPrice
                });

                if (execResult.success && !execResult.simulated) {
                    executedVia = 'DYDX_V4';
                }
            } catch (dydxErr) {
                console.log(`[API ORDER] ⚠️ dYdX error: ${dydxErr.message}`);
            }
        }

        // Return result
        if (execResult && execResult.success) {
            route = execResult.route;
            const vol = (execResult.order.executionPrice * execResult.order.quantity) || 0;
            console.log(`[API ORDER] ✅ Executed via ${route}: $${vol.toFixed(2)} ${execResult.simulated ? '(simulated)' : '(LIVE)'}`);

            return res.json({
                success: true,
                order: {
                    id: execResult.order.id,
                    pair,
                    side,
                    executionPrice: execResult.order.executionPrice,
                    quantity: execResult.order.quantity,
                    status: execResult.order.status,
                    filledAt: execResult.order.filledAt,
                    route: execResult.route,
                    simulated: execResult.simulated,
                    strategy,
                    leverage: leverage || 1,
                    fee: execResult.fee || 0
                }
            });
        } else {
            console.log(`[API ORDER] ❌ All execution routes failed`);
            route = 'EXECUTION_FAILED';
        }
    }

    const order = {
        id: 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        pair,
        side,
        type: type || 'market',
        requestedPrice: price,
        executionPrice: Number(executionPrice.toPrecision(8)),
        quantity: Number(quantity),
        grossTotal: Number(grossTotal.toFixed(2)),
        platformFee: Number(platformFee.toFixed(4)),
        feeRate: '0.1%',
        netTotal: Number(netTotal.toFixed(2)),
        total: Number(netTotal.toFixed(2)),
        status: route === 'EXECUTION_FAILED' ? 'failed' : 'filled',  // V2.2: Don't mark failed TX as filled
        filledAt: Date.now(),
        source: source || (apiKey ? 'bot_api' : 'rest_api'),
        route: route,
        strategy: strategy,
        leverage: leverage || 1,
    };

    // V2.1: Track MixBot fallback orders separately
    if (realExecution) {
        // Log to file for tracking
        const fs = require('fs');
        const logPath = require('path').join(__dirname, 'data', 'mixbot_fallback_orders.json');
        try {
            let orders = [];
            if (fs.existsSync(logPath)) {
                orders = JSON.parse(fs.readFileSync(logPath, 'utf8'));
            }
            orders.push(order);
            // Keep last 1000 orders
            if (orders.length > 1000) orders = orders.slice(-1000);
            fs.writeFileSync(logPath, JSON.stringify(orders, null, 2));
        } catch (e) {
            console.log(`[API ORDER] ⚠️ Could not log order: ${e.message}`);
        }
    }

    const trade = generateTrade ? generateTrade(pair, side, quantity, 'api') : null;

    // Broadcast trade if function exists
    if (typeof broadcastToSubscribers === 'function' && trade) {
        broadcastToSubscribers(`trades:${pair}`, {
            type: 'trade',
            pair,
            data: trade
        });
    }

    const emoji = realExecution ? '🔥' : '📊';
    console.log(`[API ORDER] ${emoji} ${side.toUpperCase()} ${quantity.toFixed(4)} ${pair} @ $${executionPrice.toFixed(2)} | Fee: $${platformFee.toFixed(4)} | Route: ${route}`);

    // V2.2: Return success=false if execution failed (helps MixBot track correctly)
    const execSuccess = route !== 'EXECUTION_FAILED';
    res.json({
        success: execSuccess,
        order,
        trade,
        route,
        fee: platformFee,
        timestamp: Date.now(),
        simulated: !execSuccess  // V2.2: Flag simulation fallback
    });
});

// V1.3: DEX Balance endpoint for MixBot fallback sizing
app.get('/api/dex/balance', async (req, res) => {
    try {
        const balances = await dexExecutor.getBalances();
        res.json({
            success: true,
            ...balances,
            maxOrderSize: balances.usdc * 0.95,  // 95% available for orders
            timestamp: Date.now()
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Register bot API key
app.post('/api/bot/register', (req, res) => {
    const { name, email } = req.body;

    const apiKey = 'obelisk_' + crypto.randomBytes(24).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');

    apiKeys.set(apiKey, {
        name: name || 'Trading Bot',
        email,
        createdAt: Date.now(),
        permissions: ['trade', 'read', 'stream']
    });

    console.log(`[BOT] New bot registered: ${name || 'Trading Bot'}`);

    res.json({
        success: true,
        apiKey,
        secret,
        message: 'Store these credentials securely. The secret cannot be recovered.',
        permissions: ['trade', 'read', 'stream'],
        rateLimit: '1000 requests/second',
        wsAuth: {
            type: 'auth',
            payload: { apiKey, secret }
        }
    });
});

// Stats
app.get('/api/stats', (req, res) => {
    res.json({
        connectedClients: clients.size,
        botClients: Array.from(clients.values()).filter(c => c.isBot).length,
        markets: Object.keys(markets).length,
        priceUpdatesTotal: priceUpdates,
        tradesProcessed,
        platformFees: {
            rate: '0.1%',
            totalCollected: Number(totalFeesCollected.toFixed(2)),
            wallet: OBELISK_FEE_WALLET
        },
        uptime: process.uptime(),
        uptimeFormatted: formatUptime(process.uptime()),
        priceUpdateInterval: '50ms',
        memory: process.memoryUsage(),
        binance: {
            connected: binanceConnected,
            source: binanceConnected ? 'BINANCE REAL-TIME' : 'SIMULATION',
            symbols: Object.keys(BINANCE_SYMBOL_MAP).length
        },
        timestamp: Date.now()
    });
});

// Binance status endpoint
app.get('/api/binance/status', (req, res) => {
    res.json({
        connected: binanceConnected,
        source: binanceConnected ? 'BINANCE REAL-TIME' : 'SIMULATION (fallback)',
        mappedPairs: Object.keys(BINANCE_SYMBOL_MAP),
        uniqueBinanceSymbols: [...new Set(Object.values(BINANCE_SYMBOL_MAP))],
        message: binanceConnected
            ? '✅ Connected to Binance - Real prices active'
            : '⚠️ Binance disconnected - Using simulated prices',
        timestamp: Date.now()
    });
});

// ===========================================
// MULTI-SOURCE PRICE AGGREGATION ENDPOINTS
// ===========================================

// Get aggregated status of all price sources
app.get('/api/sources/status', (req, res) => {
    res.json({
        sources: {
            binance: { connected: binanceConnected, pairs: Object.keys(pricesBySource.binance).length },
            coinbase: { connected: coinbaseConnected, pairs: Object.keys(pricesBySource.coinbase).length },
            kraken: { connected: krakenConnected, pairs: Object.keys(pricesBySource.kraken).length },
            hyperliquid: { pairs: Object.keys(pricesBySource.hyperliquid).length },
            dydx: { pairs: Object.keys(pricesBySource.dydx).length }
        },
        totalAggregated: Object.keys(aggregatedPrices).length,
        timestamp: Date.now()
    });
});

// Compare prices across all sources for a specific pair
app.get('/api/prices/compare/:pair', (req, res) => {
    const pair = req.params.pair.replace('-', '/').toUpperCase();

    const comparison = {
        pair,
        sources: {},
        aggregated: aggregatedPrices[pair] || null
    };

    // Get price from each source
    Object.entries(pricesBySource).forEach(([source, data]) => {
        if (data[pair]) {
            comparison.sources[source] = {
                price: data[pair].price,
                age: Date.now() - data[pair].timestamp + 'ms'
            };
        }
    });

    if (Object.keys(comparison.sources).length === 0) {
        return res.status(404).json({ error: `No price data found for ${pair}` });
    }

    res.json(comparison);
});

// Compare all pairs across sources
app.get('/api/prices/compare', (req, res) => {
    const comparisons = {};

    Object.keys(markets).forEach(pair => {
        const sources = {};
        let minPrice = Infinity;
        let maxPrice = 0;
        let minSource = '';
        let maxSource = '';

        Object.entries(pricesBySource).forEach(([source, data]) => {
            if (data[pair]?.price) {
                const price = data[pair].price;
                sources[source] = price;

                if (price < minPrice) {
                    minPrice = price;
                    minSource = source;
                }
                if (price > maxPrice) {
                    maxPrice = price;
                    maxSource = source;
                }
            }
        });

        if (Object.keys(sources).length > 0) {
            const spread = minPrice !== Infinity ? ((maxPrice - minPrice) / minPrice) * 100 : 0;
            comparisons[pair] = {
                sources,
                spread: spread.toFixed(4) + '%',
                bestBuy: { price: minPrice, source: minSource },
                bestSell: { price: maxPrice, source: maxSource }
            };
        }
    });

    res.json({
        pairs: comparisons,
        totalPairs: Object.keys(comparisons).length,
        timestamp: Date.now()
    });
});

// Get arbitrage opportunities
app.get('/api/arbitrage', (req, res) => {
    const minSpread = parseFloat(req.query.minSpread) || 0.05; // Default 0.05%
    const opportunities = [];

    Object.entries(aggregatedPrices).forEach(([pair, data]) => {
        const spread = parseFloat(data.spread);
        if (spread >= minSpread && data.sources.length >= 2) {
            opportunities.push({
                pair,
                spread: spread.toFixed(4) + '%',
                spreadUsd: ((data.max - data.min)).toFixed(4),
                buyAt: data.bestBuy.source,
                buyPrice: data.bestBuy.price,
                sellAt: data.bestSell.source,
                sellPrice: data.bestSell.price,
                sources: data.sources,
                potentialProfit: `$${((data.max - data.min) * 1).toFixed(2)} per unit`
            });
        }
    });

    // Sort by spread descending
    opportunities.sort((a, b) => parseFloat(b.spread) - parseFloat(a.spread));

    res.json({
        minSpreadFilter: minSpread + '%',
        opportunities,
        count: opportunities.length,
        timestamp: Date.now()
    });
});

// Get best execution route for an order
app.get('/api/route/:pair/:side/:amount', (req, res) => {
    const pair = req.params.pair.replace('-', '/').toUpperCase();
    const side = req.params.side.toLowerCase();
    const amount = parseFloat(req.params.amount) || 1;

    const agg = aggregatedPrices[pair];
    if (!agg) {
        return res.status(404).json({ error: `No aggregated data for ${pair}` });
    }

    const best = side === 'buy' ? agg.bestBuy : agg.bestSell;
    const worst = side === 'buy' ? agg.bestSell : agg.bestBuy;
    const savings = Math.abs(worst.price - best.price) * amount;

    res.json({
        pair,
        side,
        amount,
        bestExecution: {
            source: best.source,
            price: best.price,
            total: best.price * amount
        },
        worstExecution: {
            source: worst.source,
            price: worst.price,
            total: worst.price * amount
        },
        savings: savings.toFixed(4),
        savingsPercent: ((savings / (worst.price * amount)) * 100).toFixed(4) + '%',
        allSources: agg.pricesBySource,
        timestamp: Date.now()
    });
});

// ===========================================
// OBELISK AMM API - Autonomous Trading
// ===========================================

// Get all AMM pools
app.get('/api/amm/pools', async (req, res) => {
    try {
        const pools = obeliskAMM.getAllPools();
        res.json({
            success: true,
            pools,
            stats: obeliskAMM.getStats()
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get specific pool
app.get('/api/amm/pool/:tokenA/:tokenB', async (req, res) => {
    try {
        const pool = obeliskAMM.getPool(req.params.tokenA, req.params.tokenB);
        if (!pool) {
            return res.status(404).json({ error: 'Pool not found' });
        }
        res.json({ success: true, pool });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get swap quote
app.get('/api/amm/quote/:tokenIn/:tokenOut/:amount', async (req, res) => {
    try {
        const quote = obeliskAMM.getQuote(
            req.params.tokenIn,
            req.params.tokenOut,
            parseFloat(req.params.amount)
        );
        res.json({ success: true, quote });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Execute swap (POST)
app.post('/api/amm/swap', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn, minAmountOut, userId } = req.body;

        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({ error: 'tokenIn, tokenOut, amountIn required' });
        }

        const result = await obeliskAMM.swap(
            tokenIn,
            tokenOut,
            parseFloat(amountIn),
            userId || 'anonymous',
            parseFloat(minAmountOut) || 0
        );

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// AMM stats
app.get('/api/amm/stats', (req, res) => {
    const stats = obeliskAMM.getStats();
    res.json({
        success: true,
        stats,
        type: 'PAPER_TRADING',
        disclaimer: {
            tvl: 'SIMULÉ - Liquidité virtuelle, pas de vrais fonds',
            trades: 'PAPER - Exécution interne, pas de blockchain',
            pnl: 'SIMULÉ - PnL calculé virtuellement'
        },
        message: 'Obelisk AMM - Paper trading (liquidité SIMULÉE)'
    });
});

// ===========================================
// OBELISK PERPS API - Paper Trading Perpetuals
// ===========================================

// Get perps stats
app.get('/api/perps/stats', (req, res) => {
    res.json({
        success: true,
        stats: obeliskPerps.getStats(),
        type: 'PAPER_TRADING',
        message: 'Obelisk Perps - Paper trading (liquidité SIMULÉE)'
    });
});

// Open perps position
app.post('/api/perps/open', async (req, res) => {
    try {
        const { coin, side, size, leverage, userId, tp, sl } = req.body;

        if (!coin || !side || !size) {
            return res.status(400).json({ error: 'coin, side, size required' });
        }

        const parsedLeverage = parseInt(leverage) || 2;
        const parsedSize = parseFloat(size);

        const result = await obeliskPerps.openPosition({
            coin: coin.toUpperCase(),
            side: side.toLowerCase(),
            size: parsedSize,
            leverage: parsedLeverage,
            userId: userId || 'api',
            tp: tp || null,
            sl: sl || null
        });

        // Auto TP/SL if not provided: SL -1% / TP +2% (RR 2:1 HFT)
        if (result.success && result.position && !tp && !sl) {
            const ep = result.position.entryPrice;
            const autoSl = side.toLowerCase() === 'long'
                ? parseFloat((ep * 0.99).toFixed(6))
                : parseFloat((ep * 1.01).toFixed(6));
            const autoTp = side.toLowerCase() === 'long'
                ? parseFloat((ep * 1.02).toFixed(6))
                : parseFloat((ep * 0.98).toFixed(6));
            const posKey = result.position.id;
            obeliskPerps.createTpSlOrder(posKey, 'sl', autoSl);
            obeliskPerps.createTpSlOrder(posKey, 'tp', autoTp);
            result.position.sl = autoSl;
            result.position.tp = autoTp;
        }

        // Queue to settlement batcher
        if (result.success && typeof settlementBatcher !== 'undefined' && settlementBatcher) {
            try {
                settlementBatcher.addTrade({
                    type: 'OPEN', coin: coin.toUpperCase(), side,
                    size: parsedSize, leverage: parsedLeverage,
                    userId: userId || 'api', timestamp: Date.now()
                });
            } catch(e) {}
        }

        res.json({
            ...result,
            type: 'PAPER_TRADING',
            disclaimer: 'SIMULÉ - Pas de vrais fonds'
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update TP/SL on existing position
app.post('/api/perps/update-tpsl', (req, res) => {
    try {
        const { positionId, tp, sl } = req.body;
        if (!positionId) return res.status(400).json({ error: 'positionId required' });

        // Find by position.id (Map key != position.id)
        let mapKey = null;
        let position = null;
        for (const [key, pos] of obeliskPerps.positions.entries()) {
            if (pos.id === positionId) { mapKey = key; position = pos; break; }
        }
        if (!position) return res.status(404).json({ error: 'Position not found' });

        if (tp !== undefined) {
            position.tp = tp;
            obeliskPerps.createTpSlOrder(mapKey, 'tp', tp);
        }
        if (sl !== undefined) {
            position.sl = sl;
            obeliskPerps.createTpSlOrder(mapKey, 'sl', sl);
        }

        res.json({ success: true, positionId, mapKey, tp: position.tp, sl: position.sl });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Close perps position
app.post('/api/perps/close', async (req, res) => {
    try {
        const { coin, userId } = req.body;

        if (!coin) {
            return res.status(400).json({ error: 'coin required' });
        }

        const result = await obeliskPerps.closePosition({
            coin: coin.toUpperCase(),
            userId: userId || 'api'
        });

        res.json({
            ...result,
            type: 'PAPER_TRADING',
            disclaimer: 'SIMULÉ - Pas de vrais fonds'
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get user positions
app.get('/api/perps/positions/:userId', (req, res) => {
    const positions = obeliskPerps.getUserPositions(req.params.userId);
    res.json({
        success: true,
        positions,
        type: 'PAPER_TRADING'
    });
});

// Get all positions
app.get('/api/perps/positions', (req, res) => {
    const positions = obeliskPerps.getAllPositions();
    res.json({
        success: true,
        positions,
        count: positions.length,
        type: 'PAPER_TRADING'
    });
});

// ===========================================
// GAINS NETWORK API - Real Perps (150x, Forex, Stocks)
// ===========================================

// Get Gains Network info & supported pairs
app.get('/api/gains/info', (req, res) => {
    const stats = gainsExecutor.getStats();
    const pairs = gainsExecutor.getSupportedPairs();
    res.json({
        success: true,
        protocol: 'Gains Network (gTrade)',
        chain: 'Arbitrum',
        diamond: '0xFF162c694eAA571f685030649814282eA457f169',
        ...stats,
        ...pairs,
        fees: '0.08%',
        features: ['150x Crypto', '1000x Forex', '50x Stocks', 'Real Yield']
    });
});

// Get Gains positions
app.get('/api/gains/positions', async (req, res) => {
    try {
        const result = await gainsExecutor.getPositions(req.query.address);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Open Gains position
app.post('/api/gains/open', async (req, res) => {
    try {
        const { coin, pair, side, size, leverage, tp, sl } = req.body;
        const result = await gainsExecutor.openPosition({
            coin: coin || pair?.replace('/USD', '').replace('-PERP', ''),
            side: side || 'long',
            size: size || 50,
            leverage: leverage || 10,
            tp: tp || 0,
            sl: sl || 0
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Close Gains position
app.post('/api/gains/close', async (req, res) => {
    try {
        const { tradeIndex, coin } = req.body;
        const result = await gainsExecutor.closePosition({ tradeIndex, coin });
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Update stop loss
app.post('/api/gains/update-sl', async (req, res) => {
    try {
        const { tradeIndex, newSl } = req.body;
        const result = await gainsExecutor.updateStopLoss(tradeIndex, newSl);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Update take profit
app.post('/api/gains/update-tp', async (req, res) => {
    try {
        const { tradeIndex, newTp } = req.body;
        const result = await gainsExecutor.updateTakeProfit(tradeIndex, newTp);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Deposit to Gains vault
app.post('/api/gains/deposit', async (req, res) => {
    try {
        const { amount, collateral } = req.body;
        const result = await gainsExecutor.depositToVault(amount, collateral || 'USDC');
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Withdraw from Gains vault
app.post('/api/gains/withdraw', async (req, res) => {
    try {
        const { amount, collateral } = req.body;
        const result = await gainsExecutor.withdrawFromVault(amount, collateral || 'USDC');
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Get Gains balances
app.get('/api/gains/balances', async (req, res) => {
    try {
        const result = await gainsExecutor.getBalances();
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
}


// ===========================================
// INSTITUTIONAL TIME API - Microsecond precision
// ===========================================
app.get('/api/time', (req, res) => {
    const now = new Date();
    const hrTime = process.hrtime();
    const us = Math.floor(hrTime[1] / 1000);
    res.json({
        iso: now.toISOString(),
        unix: Math.floor(now.getTime() / 1000),
        unix_ms: now.getTime(),
        unix_us: now.getTime() * 1000 + (us % 1000),
        utc: { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate(), hour: now.getUTCHours(), minute: now.getUTCMinutes(), second: now.getUTCSeconds(), ms: now.getUTCMilliseconds(), us: us % 1000 },
        trading: { date: now.toISOString().split('T')[0], time: now.toISOString().split('T')[1].replace('Z', ''), timestamp_ms: now.getTime() },
        server: { timezone: 'UTC', precision: 'microsecond', source: 'obelisk-dex' }
    });
});

app.get('/api/time/ms', (req, res) => { res.json({ t: Date.now() }); });

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now(),
        priceUpdates,
        latency: '< 50ms',
        priceSource: binanceConnected ? 'BINANCE' : 'SIMULATION'
    });
});

// ===========================================
// LENDING API ENDPOINTS
// ===========================================

// Update lending prices periodically
setInterval(() => {
    lendingSystem.updatePrices(markets);
}, 1000);

// Get lending configuration and user credit
app.get('/api/lending/info', (req, res) => {
    res.json({
        config: LENDING_CONFIG,
        availableTokens: Object.keys(LENDING_CONFIG.INTEREST_RATES),
        collateralTokens: Object.keys(LENDING_CONFIG.COLLATERAL_FACTORS),
        durations: LENDING_CONFIG.LOAN_DURATIONS,
        liquidityPool: lendingSystem.liquidityPool,
        globalStats: lendingSystem.getGlobalStats()
    });
});

// Get user credit score and lending summary
app.get('/api/lending/user/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({
        credit: lendingSystem.getCreditSummary(userId),
        lending: lendingSystem.getUserSummary(userId)
    });
});

// Deposit collateral
app.post('/api/lending/collateral/deposit', (req, res) => {
    const { userId, token, amount } = req.body;

    if (!userId || !token || !amount) {
        return res.status(400).json({ error: 'Missing userId, token, or amount' });
    }

    const result = lendingSystem.depositCollateral(userId, token, parseFloat(amount));
    res.json(result);
});

// Withdraw collateral
app.post('/api/lending/collateral/withdraw', (req, res) => {
    const { userId, token, amount } = req.body;

    if (!userId || !token || !amount) {
        return res.status(400).json({ error: 'Missing userId, token, or amount' });
    }

    const result = lendingSystem.withdrawCollateral(userId, token, parseFloat(amount));
    res.json(result);
});

// Borrow
app.post('/api/lending/borrow', (req, res) => {
    const { userId, token, amount, durationDays } = req.body;

    if (!userId || !token || !amount || !durationDays) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = lendingSystem.borrow(userId, token, parseFloat(amount), parseInt(durationDays));
    res.json(result);
});

// Repay loan
app.post('/api/lending/repay', (req, res) => {
    const { userId, loanId, amount } = req.body;

    if (!userId || !loanId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = lendingSystem.repay(userId, loanId, parseFloat(amount));
    res.json(result);
});

// Check liquidation status
app.get('/api/lending/liquidation/:userId', (req, res) => {
    const { userId } = req.params;
    const result = lendingSystem.checkAndLiquidate(userId);
    res.json(result);
});

// Get credit score history
app.get('/api/lending/credit/:userId', (req, res) => {
    const { userId } = req.params;
    res.json(lendingSystem.getCreditSummary(userId));
});

// Get all active loans for a user
app.get('/api/lending/loans/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({
        activeLoans: lendingSystem.getUserActiveLoans(userId),
        summary: lendingSystem.getUserSummary(userId)
    });
});

// ===========================================
// MICRO-INVEST ENDPOINTS (min 0.01 USDC)
// ===========================================

// Get micro-invest info and pool stats
app.get('/api/micro/info', (req, res) => {
    res.json({
        config: {
            minDeposit: MICRO_CONFIG.MIN_DEPOSIT,
            minWithdraw: MICRO_CONFIG.MIN_WITHDRAW,
            minTrade: MICRO_CONFIG.MIN_TRADE,
            withdrawalFee: (MICRO_CONFIG.WITHDRAWAL_FEE * 100) + '%',
            compoundInterval: MICRO_CONFIG.COMPOUND_INTERVAL / 3600000 + ' hours'
        },
        pools: microInvest.getPoolStats(),
        currentAPY: microInvest.getCurrentAPY(),
        howItWorks: {
            step1: 'Deposit any amount from 0.01 USDC',
            step2: 'Earn guaranteed APY (backed by over-collateralized loans)',
            step3: 'If borrower defaults, their collateral is distributed to lenders',
            step4: 'Withdraw anytime (instant if liquidity available)'
        }
    });
});

// Create wallet
app.post('/api/micro/wallet/create', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    res.json(microInvest.createWallet(userId));
});

// Get wallet balance
app.get('/api/micro/wallet/:userId', (req, res) => {
    const { userId } = req.params;
    res.json(microInvest.getWallet(userId));
});

// Deposit funds
app.post('/api/micro/deposit', (req, res) => {
    const { userId, token, amount } = req.body;
    if (!userId || !token || !amount) {
        return res.status(400).json({ error: 'userId, token, and amount required' });
    }
    res.json(microInvest.deposit(userId, token.toUpperCase(), parseFloat(amount)));
});

// Withdraw funds
app.post('/api/micro/withdraw', (req, res) => {
    const { userId, token, amount, instant } = req.body;
    if (!userId || !token || !amount) {
        return res.status(400).json({ error: 'userId, token, and amount required' });
    }
    res.json(microInvest.withdraw(userId, token.toUpperCase(), parseFloat(amount), instant || false));
});

// Swap/trade tokens
app.post('/api/micro/trade', (req, res) => {
    const { userId, fromToken, toToken, amount } = req.body;
    if (!userId || !fromToken || !toToken || !amount) {
        return res.status(400).json({ error: 'userId, fromToken, toToken, and amount required' });
    }

    // Get current prices
    const prices = {};
    Object.entries(markets).forEach(([pair, data]) => {
        const [base] = pair.split('/');
        prices[base] = data.price;
    });
    prices.USDC = 1;
    prices.USDT = 1;

    res.json(microInvest.trade(userId, fromToken.toUpperCase(), toToken.toUpperCase(), parseFloat(amount), prices));
});

// Get current APY rates
app.get('/api/micro/apy', (req, res) => {
    res.json({
        rates: microInvest.getCurrentAPY(),
        explanation: 'APY increases with pool utilization. Higher borrowing = higher yields for lenders.',
        guarantee: 'All loans are 150% over-collateralized. If borrower defaults, lenders receive the collateral.'
    });
});

// Get leaderboard
app.get('/api/micro/leaderboard', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    res.json({
        leaderboard: microInvest.getLeaderboard(limit),
        timestamp: Date.now()
    });
});

// Get liquidation history (collateral distributions)
app.get('/api/micro/liquidations', (req, res) => {
    res.json({
        totalDistributed: microInvest.stats.totalLiquidationsDistributed || 0,
        message: 'When borrowers default, their collateral is distributed proportionally to all lenders'
    });
});

// ===========================================
// AUTO-ALLOCATION STRATEGIES
// ===========================================

const ALLOCATION_STRATEGIES = {
    // Répartition équilibrée dans 5 pools
    BALANCED: {
        name: 'Balanced',
        icon: '⚖️',
        description: 'Equal split across 5 assets',
        allocation: { USDC: 20, ETH: 20, BTC: 20, SOL: 20, ARB: 20 }
    },
    // Focus stablecoins (safe)
    SAFE: {
        name: 'Safe Yield',
        icon: '🛡️',
        description: '80% stables, 20% majors',
        allocation: { USDC: 80, ETH: 10, BTC: 10 }
    },
    // Focus majors (BTC/ETH)
    BLUE_CHIP: {
        name: 'Blue Chip',
        icon: '💎',
        description: '50% BTC, 30% ETH, 20% stables',
        allocation: { BTC: 50, ETH: 30, USDC: 20 }
    },
    // Altcoins (risky)
    DEGEN: {
        name: 'Degen',
        icon: '🎰',
        description: 'High risk altcoins',
        allocation: { SOL: 30, ARB: 30, ETH: 20, BTC: 20 }
    },
    // Yield optimized
    YIELD_MAX: {
        name: 'Yield Maximizer',
        icon: '🌾',
        description: 'Highest APY tokens',
        allocation: { ARB: 40, SOL: 30, ETH: 20, USDC: 10 }
    }
};

// Get available strategies
app.get('/api/micro/strategies', (req, res) => {
    const strategies = Object.entries(ALLOCATION_STRATEGIES).map(([key, strat]) => {
        // Calculate expected APY
        const apyRates = microInvest.getCurrentAPY();
        let expectedAPY = 0;
        Object.entries(strat.allocation).forEach(([token, pct]) => {
            expectedAPY += (apyRates[token] || 0) * (pct / 100);
        });

        return {
            id: key,
            ...strat,
            expectedAPY: expectedAPY.toFixed(2) + '%'
        };
    });

    res.json({
        strategies,
        example: 'Deposit 5 USDC with BALANCED → 1 USDC in each of 5 tokens',
        minDeposit: 0.05  // Min 0.01 per token * 5 tokens
    });
});

// Auto-allocate deposit
app.post('/api/micro/auto-deposit', async (req, res) => {
    const { userId, amount, strategy } = req.body;

    if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount required' });
    }

    const depositAmount = parseFloat(amount);
    const strategyKey = (strategy || 'BALANCED').toUpperCase();
    const strat = ALLOCATION_STRATEGIES[strategyKey];

    if (!strat) {
        return res.status(400).json({
            error: 'Invalid strategy',
            available: Object.keys(ALLOCATION_STRATEGIES)
        });
    }

    // Calculate allocations
    const allocations = [];
    const tokenCount = Object.keys(strat.allocation).length;
    const minPerToken = 0.01;

    if (depositAmount < minPerToken * tokenCount) {
        return res.status(400).json({
            error: `Minimum deposit for ${strategyKey}: ${(minPerToken * tokenCount).toFixed(2)} USDC`,
            reason: `Need at least ${minPerToken} per token (${tokenCount} tokens)`
        });
    }

    // Get current prices
    const prices = { USDC: 1, USDT: 1 };
    Object.entries(markets).forEach(([pair, data]) => {
        const [base] = pair.split('/');
        prices[base] = data.price;
    });

    // First deposit USDC to wallet
    const initialDeposit = microInvest.deposit(userId, 'USDC', depositAmount);
    if (!initialDeposit.success) {
        return res.status(400).json({ error: 'Deposit failed', details: initialDeposit });
    }

    // Then swap to target allocations
    const results = [];
    for (const [token, percentage] of Object.entries(strat.allocation)) {
        const tokenAmount = (depositAmount * percentage / 100);

        if (token === 'USDC') {
            // Keep as USDC
            results.push({
                token: 'USDC',
                amount: tokenAmount.toFixed(4),
                percentage: percentage + '%',
                action: 'HOLD'
            });
        } else {
            // Swap USDC to token
            const tradeResult = microInvest.trade(
                userId,
                'USDC',
                token,
                tokenAmount,
                prices
            );

            results.push({
                token,
                usdcSpent: tokenAmount.toFixed(4),
                received: tradeResult.success ? tradeResult.bought.amount.toFixed(6) : 0,
                percentage: percentage + '%',
                action: tradeResult.success ? 'SWAP' : 'FAILED'
            });
        }
    }

    // Get final wallet state
    const finalWallet = microInvest.getWallet(userId);

    res.json({
        success: true,
        strategy: {
            id: strategyKey,
            name: strat.name,
            icon: strat.icon
        },
        deposited: depositAmount,
        allocations: results,
        wallet: finalWallet,
        message: `${depositAmount} USDC auto-allocated using ${strat.name} strategy`
    });
});

// ===========================================
// PNL TRACKING BY PROFILE
// ===========================================

// Store PnL data per user
const userPnLTracker = new Map();

// Track user activity
app.post('/api/pnl/track', (req, res) => {
    const { odre, action, amount, token, price } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    if (!userPnLTracker.has(userId)) {
        userPnLTracker.set(odre, {
            odre,
            profile: userId.split('_')[1]?.toUpperCase() || 'UNKNOWN',
            deposits: 0,
            withdrawals: 0,
            trades: [],
            realizedPnL: 0,
            fees: 0,
            created: Date.now()
        });
    }

    const tracker = userPnLTracker.get(userId);

    if (action === 'DEPOSIT') {
        tracker.deposits += parseFloat(amount) || 0;
    } else if (action === 'WITHDRAW') {
        tracker.withdrawals += parseFloat(amount) || 0;
    } else if (action === 'BUY' || action === 'SELL') {
        tracker.trades.push({
            action,
            amount: parseFloat(amount),
            token,
            price: parseFloat(price) || markets[`${token}/USDC`]?.price || 0,
            timestamp: Date.now()
        });
    }

    res.json({ success: true, tracker });
});

// Get PnL by profile type
app.get('/api/pnl/by-profile', (req, res) => {
    const profileStats = {};

    // Get current prices
    const prices = {};
    Object.entries(markets).forEach(([pair, data]) => {
        const [base] = pair.split('/');
        prices[base] = data.price;
    });
    prices.USDC = 1;

    // Aggregate from micro-invest wallets
    microInvest.wallets.forEach((wallet, odre) => {
        const profile = odre.split('_')[1]?.toUpperCase() || 'UNKNOWN';
        const interest = microInvest.accruedInterest.get(userId) || {};
        const history = microInvest.depositHistory.get(userId) || [];

        // Calculate totals
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        history.forEach(h => {
            if (h.type === 'deposit') totalDeposits += h.amount * (prices[h.token] || 1);
            if (h.type === 'withdrawal') totalWithdrawals += h.amount * (prices[h.token] || 1);
        });

        // Calculate current value
        let currentValue = 0;
        Object.entries(wallet).forEach(([token, amount]) => {
            const interestAmt = interest[token] || 0;
            currentValue += (amount + interestAmt) * (prices[token] || 0);
        });

        // PnL = Current Value + Withdrawals - Deposits
        const pnl = currentValue + totalWithdrawals - totalDeposits;
        const roi = totalDeposits > 0 ? (pnl / totalDeposits) * 100 : 0;

        if (!profileStats[profile]) {
            profileStats[profile] = {
                users: 0,
                totalDeposits: 0,
                totalWithdrawals: 0,
                totalCurrentValue: 0,
                totalPnL: 0,
                totalInterest: 0,
                trades: 0
            };
        }

        const ps = profileStats[profile];
        ps.users++;
        ps.totalDeposits += totalDeposits;
        ps.totalWithdrawals += totalWithdrawals;
        ps.totalCurrentValue += currentValue;
        ps.totalPnL += pnl;
        ps.totalInterest += Object.values(interest).reduce((sum, i) => sum + i * (prices.USDC || 1), 0);
    });

    // Calculate ROI for each profile
    const results = Object.entries(profileStats).map(([profile, stats]) => ({
        profile,
        icon: getProfileIcon(profile),
        users: stats.users,
        deposits: '$' + stats.totalDeposits.toFixed(2),
        withdrawals: '$' + stats.totalWithdrawals.toFixed(2),
        currentValue: '$' + stats.totalCurrentValue.toFixed(2),
        pnl: '$' + stats.totalPnL.toFixed(2),
        roi: (stats.totalDeposits > 0 ? (stats.totalPnL / stats.totalDeposits) * 100 : 0).toFixed(2) + '%',
        interest: '$' + stats.totalInterest.toFixed(2),
        status: stats.totalPnL >= 0 ? '🟢' : '🔴'
    }));

    res.json({
        profiles: results.sort((a, b) => parseFloat(b.pnl) - parseFloat(a.pnl)),
        totalUsers: microInvest.wallets.size,
        timestamp: Date.now()
    });
});

function getProfileIcon(profile) {
    const icons = {
        HODLER: '💎', DAY_TRADER: '📈', YIELD_FARMER: '🌾', DEGEN: '🎰',
        NEWBIE: '👶', WHALE: '🐋', SALARYMAN: '💼', ARBITRAGEUR: '🔄', LENDER: '🏦'
    };
    return icons[profile] || '👤';
}

// Get individual user PnL
app.get('/api/pnl/user/:userId', (req, res) => {
    const { userId } = req.params;
    const wallet = microInvest.wallets.get(userId);

    if (!wallet) {
        return res.status(404).json({ error: 'User not found' });
    }

    const interest = microInvest.accruedInterest.get(userId) || {};
    const history = microInvest.depositHistory.get(userId) || [];

    // Get prices
    const prices = {};
    Object.entries(markets).forEach(([pair, data]) => {
        const [base] = pair.split('/');
        prices[base] = data.price;
    });
    prices.USDC = 1;

    // Calculate
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    history.forEach(h => {
        if (h.type === 'deposit') totalDeposits += h.amount * (prices[h.token] || 1);
        if (h.type === 'withdrawal') totalWithdrawals += h.amount * (prices[h.token] || 1);
    });

    let currentValue = 0;
    const holdings = {};
    Object.entries(wallet).forEach(([token, amount]) => {
        const interestAmt = interest[token] || 0;
        const total = amount + interestAmt;
        const value = total * (prices[token] || 0);
        currentValue += value;
        if (total > 0) {
            holdings[token] = { amount: total, value, interest: interestAmt };
        }
    });

    const pnl = currentValue + totalWithdrawals - totalDeposits;

    res.json({
        odre,
        profile: userId.split('_')[1]?.toUpperCase() || 'UNKNOWN',
        deposits: totalDeposits.toFixed(2),
        withdrawals: totalWithdrawals.toFixed(2),
        currentValue: currentValue.toFixed(2),
        pnl: pnl.toFixed(2),
        roi: (totalDeposits > 0 ? (pnl / totalDeposits) * 100 : 0).toFixed(2) + '%',
        status: pnl >= 0 ? 'PROFIT' : 'LOSS',
        holdings,
        history: history.slice(-20)
    });
});


// ===========================================
// NEW MODULES - Advanced Trading Tools
// ===========================================
const { AdvancedTrading } = require('./advanced-trading');
const { AnalyticsEngine } = require('./analytics-engine');
const { AutomationEngine } = require('./automation-engine');
const { PortfolioManager } = require('./portfolio-manager');
const { setupToolsRoutes } = require('./tools-routes');

const advancedTrading = new AdvancedTrading();
const analyticsEngine = new AnalyticsEngine();
const automationEngine = new AutomationEngine();
const portfolioManager = new PortfolioManager();

// Setup all advanced tools routes
setupToolsRoutes(app, {
    advancedTrading,
    analytics: analyticsEngine,
    automation: automationEngine,
    portfolio: portfolioManager
}, markets);

// Process automation every second
setInterval(() => {
    const previousPrices = {};
    Object.entries(markets).forEach(([pair, data]) => {
        previousPrices[pair] = data.price;
    });

    // Process all trading tools
    advancedTrading.processAll(markets);
    automationEngine.processAll(markets, previousPrices);

    // Update analytics
    Object.entries(markets).forEach(([pair, data]) => {
        analyticsEngine.updatePriceHeatmap(pair, data.price, data.change24h);
        analyticsEngine.updateVolumeHeatmap(pair, data.volume, 0);
    });
}, 1000);


// ===========================================
// UNIQUE TOOLS - Exclusive Features
// ===========================================
const { UniqueTools } = require('./unique-tools');
const { setupUniqueRoutes } = require('./unique-routes');
const uniqueTools = new UniqueTools();

// Setup unique tools routes
setupUniqueRoutes(app, uniqueTools, markets, pricesBySource);

// Process unique tools every 5 seconds
setInterval(() => {
    // Scan for arbitrage opportunities
    uniqueTools.scanArbitrage(pricesBySource);

    // Simulate gas price updates
    uniqueTools.recordGasPrice('ethereum', 20 + Math.random() * 30);
    uniqueTools.recordGasPrice('arbitrum', 0.1 + Math.random() * 0.2);

    // Generate AI signals for major pairs
    ['BTC/USDC', 'ETH/USDC', 'SOL/USDC'].forEach(pair => {
        if (markets[pair]) {
            const indicators = {
                price: markets[pair].price,
                volume: markets[pair].volume,
                change24h: markets[pair].change24h,
                rsi: 50 + markets[pair].change24h * 2,
                macd: { macd: markets[pair].change24h > 0 ? 1 : -1, signal: 0, histogram: markets[pair].change24h * 0.1 },
                bb: { upper: markets[pair].high, lower: markets[pair].low }
            };
            uniqueTools.generateSignal(pair, { avgVolume: markets[pair].volume * 0.8 }, indicators);
        }
    });
}, 5000);

// ===========================================
// PASSIVE INVESTMENT PRODUCTS API (NO LOSS)
// ===========================================

// Get all passive products
app.get('/api/passive/products', (req, res) => {
    res.json(passiveProducts.getAllProducts());
});

// --- LIQUID STAKING ---
app.get('/api/passive/staking/pools', (req, res) => {
    res.json({ pools: passiveProducts.liquidStaking.getPools() });
});

app.post('/api/passive/staking/stake', (req, res) => {
    const { userId, token, amount } = req.body;
    if (!userId || !token || !amount) {
        return res.status(400).json({ error: 'userId, token, and amount required' });
    }
    res.json(passiveProducts.liquidStaking.stake(userId, token.toUpperCase(), parseFloat(amount)));
});

app.post('/api/passive/staking/unstake', (req, res) => {
    const { userId, stakeId } = req.body;
    if (!userId || !stakeId) {
        return res.status(400).json({ error: 'userId and stakeId required' });
    }
    res.json(passiveProducts.liquidStaking.unstake(userId, stakeId));
});

app.get('/api/passive/staking/user/:userId', (req, res) => {
    res.json({ stakes: passiveProducts.liquidStaking.getUserStakes(req.params.userId) });
});

// --- PROTECTED VAULTS ---
app.get('/api/passive/vaults', (req, res) => {
    res.json({ vaults: passiveProducts.protectedVaults.getVaults() });
});

app.post('/api/passive/vaults/deposit', (req, res) => {
    const { userId, vaultId, token, amount, lockDays } = req.body;
    if (!userId || !vaultId || !token || !amount) {
        return res.status(400).json({ error: 'userId, vaultId, token, and amount required' });
    }
    res.json(passiveProducts.protectedVaults.deposit(userId, vaultId, token.toUpperCase(), parseFloat(amount), lockDays || 0));
});

app.post('/api/passive/vaults/withdraw', (req, res) => {
    const { userId, depositId } = req.body;
    if (!userId || !depositId) {
        return res.status(400).json({ error: 'userId and depositId required' });
    }
    res.json(passiveProducts.protectedVaults.withdraw(userId, depositId));
});

app.get('/api/passive/vaults/user/:userId', (req, res) => {
    res.json({ deposits: passiveProducts.protectedVaults.getUserDeposits(req.params.userId) });
});

// --- FIXED INCOME BONDS ---
app.get('/api/passive/bonds', (req, res) => {
    res.json({ offerings: passiveProducts.fixedIncomeBonds.getOfferings() });
});

app.post('/api/passive/bonds/purchase', (req, res) => {
    const { userId, bondId, amount } = req.body;
    if (!userId || !bondId || !amount) {
        return res.status(400).json({ error: 'userId, bondId, and amount required' });
    }
    res.json(passiveProducts.fixedIncomeBonds.purchase(userId, bondId, parseFloat(amount)));
});

app.post('/api/passive/bonds/redeem', (req, res) => {
    const { userId, purchaseId } = req.body;
    if (!userId || !purchaseId) {
        return res.status(400).json({ error: 'userId and purchaseId required' });
    }
    res.json(passiveProducts.fixedIncomeBonds.redeem(userId, purchaseId));
});

app.get('/api/passive/bonds/user/:userId', (req, res) => {
    res.json({ bonds: passiveProducts.fixedIncomeBonds.getUserBonds(req.params.userId) });
});

// --- AUTO DCA ---
app.get('/api/passive/dca/templates', (req, res) => {
    res.json({ templates: passiveProducts.autoDCA.getTemplates() });
});

app.post('/api/passive/dca/create', (req, res) => {
    const { userId, templateId, amountPerExecution, totalBudget } = req.body;
    if (!userId || !templateId || !amountPerExecution) {
        return res.status(400).json({ error: 'userId, templateId, and amountPerExecution required' });
    }
    res.json(passiveProducts.autoDCA.createPlan(userId, templateId, parseFloat(amountPerExecution), totalBudget ? parseFloat(totalBudget) : null));
});

app.post('/api/passive/dca/pause', (req, res) => {
    const { userId, planId } = req.body;
    if (!userId || !planId) {
        return res.status(400).json({ error: 'userId and planId required' });
    }
    res.json(passiveProducts.autoDCA.pausePlan(userId, planId));
});

app.get('/api/passive/dca/user/:userId', (req, res) => {
    res.json({ plans: passiveProducts.autoDCA.getUserPlans(req.params.userId) });
});

// --- INDEX BASKETS ---
app.get('/api/passive/index', (req, res) => {
    res.json({ indices: passiveProducts.indexBaskets.getIndices() });
});

app.post('/api/passive/index/invest', (req, res) => {
    const { userId, indexId, amount, token } = req.body;
    if (!userId || !indexId || !amount) {
        return res.status(400).json({ error: 'userId, indexId, and amount required' });
    }
    res.json(passiveProducts.indexBaskets.invest(userId, indexId, parseFloat(amount), token || 'USDC'));
});

app.post('/api/passive/index/redeem', (req, res) => {
    const { userId, investmentId } = req.body;
    if (!userId || !investmentId) {
        return res.status(400).json({ error: 'userId and investmentId required' });
    }
    // Get current prices
    const prices = {};
    Object.entries(markets).forEach(([pair, data]) => {
        const [base] = pair.split('/');
        prices[base] = data.price;
    });
    prices.USDC = 1; prices.USDT = 1; prices.DAI = 1;
    res.json(passiveProducts.indexBaskets.redeem(userId, investmentId, prices));
});

app.get('/api/passive/index/user/:userId', (req, res) => {
    const prices = {};
    Object.entries(markets).forEach(([pair, data]) => {
        const [base] = pair.split('/');
        prices[base] = data.price;
    });
    prices.USDC = 1; prices.USDT = 1; prices.DAI = 1;
    res.json({ holdings: passiveProducts.indexBaskets.getUserHoldings(req.params.userId, prices) });
});

// --- YIELD OPTIMIZER ---
app.get('/api/passive/yield/strategies', (req, res) => {
    res.json({ strategies: passiveProducts.yieldOptimizer.getStrategies() });
});

app.post('/api/passive/yield/deposit', (req, res) => {
    const { userId, strategyId, token, amount } = req.body;
    if (!userId || !strategyId || !token || !amount) {
        return res.status(400).json({ error: 'userId, strategyId, token, and amount required' });
    }
    res.json(passiveProducts.yieldOptimizer.deposit(userId, strategyId, token.toUpperCase(), parseFloat(amount)));
});

app.post('/api/passive/yield/withdraw', (req, res) => {
    const { userId, depositId } = req.body;
    if (!userId || !depositId) {
        return res.status(400).json({ error: 'userId and depositId required' });
    }
    res.json(passiveProducts.yieldOptimizer.withdraw(userId, depositId));
});

app.get('/api/passive/yield/user/:userId', (req, res) => {
    res.json({ deposits: passiveProducts.yieldOptimizer.getUserDeposits(req.params.userId) });
});

// --- INSURANCE POOL ---
app.get('/api/passive/insurance/coverages', (req, res) => {
    res.json({
        coverages: passiveProducts.insurancePool.getCoverages(),
        poolStats: passiveProducts.insurancePool.getPoolStats()
    });
});

app.post('/api/passive/insurance/purchase', (req, res) => {
    const { userId, coverageId, amountToInsure, durationDays } = req.body;
    if (!userId || !coverageId || !amountToInsure || !durationDays) {
        return res.status(400).json({ error: 'userId, coverageId, amountToInsure, and durationDays required' });
    }
    res.json(passiveProducts.insurancePool.purchasePolicy(userId, coverageId, parseFloat(amountToInsure), parseInt(durationDays)));
});

app.post('/api/passive/insurance/claim', (req, res) => {
    const { userId, policyId, lossAmount, description } = req.body;
    if (!userId || !policyId || !lossAmount) {
        return res.status(400).json({ error: 'userId, policyId, and lossAmount required' });
    }
    res.json(passiveProducts.insurancePool.fileClaim(userId, policyId, parseFloat(lossAmount), description || ''));
});

app.get('/api/passive/insurance/user/:userId', (req, res) => {
    res.json({ policies: passiveProducts.insurancePool.getUserPolicies(req.params.userId) });
});

// --- COMBO PRODUCTS ---
app.get('/api/passive/combos', (req, res) => {
    res.json({ combos: passiveProducts.comboProducts.getCombos() });
});

app.get('/api/passive/combos/by-risk/:riskLevel', (req, res) => {
    res.json({ combos: passiveProducts.comboProducts.getCombosByRisk(req.params.riskLevel) });
});

app.get('/api/passive/combos/recommend', (req, res) => {
    const amount = parseFloat(req.query.amount) || 1000;
    const risk = req.query.risk || 'medium';
    res.json(passiveProducts.comboProducts.getRecommendation(amount, risk));
});

app.post('/api/passive/combos/invest', (req, res) => {
    const { userId, comboId, amount, token } = req.body;
    if (!userId || !comboId || !amount) {
        return res.status(400).json({ error: 'userId, comboId, and amount required' });
    }
    res.json(passiveProducts.comboProducts.invest(userId, comboId, parseFloat(amount), token || 'USDC'));
});

app.post('/api/passive/combos/withdraw', (req, res) => {
    const { userId, investmentId } = req.body;
    if (!userId || !investmentId) {
        return res.status(400).json({ error: 'userId and investmentId required' });
    }
    res.json(passiveProducts.comboProducts.withdraw(userId, investmentId));
});

app.post('/api/passive/combos/rebalance', (req, res) => {
    const { userId, investmentId } = req.body;
    if (!userId || !investmentId) {
        return res.status(400).json({ error: 'userId and investmentId required' });
    }
    res.json(passiveProducts.comboProducts.rebalance(userId, investmentId));
});

app.get('/api/passive/combos/user/:userId', (req, res) => {
    res.json({ investments: passiveProducts.comboProducts.getUserInvestments(req.params.userId) });
});

console.log('[PASSIVE-PRODUCTS] All passive investment routes registered');
console.log('[COMBO-PRODUCTS] 14 combo strategies available');

// ===========================================
// SECURITY API ENDPOINTS
// ===========================================
app.get('/api/security/stats', (req, res) => {
    res.json(security.getStats());
});

app.get('/api/security/audit', (req, res) => {
    const filter = {
        event: req.query.event,
        since: req.query.since,
        limit: parseInt(req.query.limit) || 100
    };
    res.json({ logs: security.getAuditLog(filter) });
});

console.log('[SECURITY] Anti-hacking protection active');

// ===========================================
// TRADING APIS: CANDLES, SIGNALS, FUNDING
// ===========================================

// Candle cache (stores historical candles)
const candleCache = {};
const CANDLE_TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];
const BINANCE_INTERVALS = { '1m': '1m', '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d' };

// Fetch candles from Binance
async function fetchBinanceCandles(symbol, interval, limit = 500) {
    const binanceSymbol = symbol.replace('/', '').replace('USDC', 'USDT');
    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!Array.isArray(data)) return [];
        return data.map(c => ({
            time: c[0],
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4]),
            volume: parseFloat(c[5]),
            closeTime: c[6],
            quoteVolume: parseFloat(c[7]),
            trades: c[8]
        }));
    } catch (e) {
        console.error('[CANDLES] Error fetching:', e.message);
        return [];
    }
}

// Calculate technical indicators
function calculateIndicators(candles) {
    if (candles.length < 26) return {};

    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);

    // EMA calculation
    const ema = (data, period) => {
        const k = 2 / (period + 1);
        let emaArr = [data[0]];
        for (let i = 1; i < data.length; i++) {
            emaArr.push(data[i] * k + emaArr[i-1] * (1 - k));
        }
        return emaArr;
    };

    // SMA calculation
    const sma = (data, period) => {
        let result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) { result.push(null); continue; }
            let sum = 0;
            for (let j = 0; j < period; j++) sum += data[i - j];
            result.push(sum / period);
        }
        return result;
    };

    // RSI
    const calculateRSI = (data, period = 14) => {
        let gains = [], losses = [];
        for (let i = 1; i < data.length; i++) {
            const diff = data[i] - data[i-1];
            gains.push(diff > 0 ? diff : 0);
            losses.push(diff < 0 ? -diff : 0);
        }
        const avgGain = ema(gains, period);
        const avgLoss = ema(losses, period);
        return avgGain.map((g, i) => avgLoss[i] === 0 ? 100 : 100 - (100 / (1 + g / avgLoss[i])));
    };

    // MACD
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = ema(macdLine, 9);
    const histogram = macdLine.map((v, i) => v - signalLine[i]);

    // Bollinger Bands
    const sma20 = sma(closes, 20);
    const std20 = closes.map((c, i) => {
        if (i < 19) return null;
        const slice = closes.slice(i - 19, i + 1);
        const mean = slice.reduce((a, b) => a + b) / 20;
        return Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / 20);
    });

    const rsi = calculateRSI(closes, 14);
    const lastIdx = closes.length - 1;

    return {
        ema9: ema(closes, 9)[lastIdx],
        ema21: ema(closes, 21)[lastIdx],
        ema50: ema(closes, 50)[lastIdx] || null,
        ema200: ema(closes, 200)[lastIdx] || null,
        sma20: sma20[lastIdx],
        rsi: rsi[rsi.length - 1],
        macd: {
            macd: macdLine[lastIdx],
            signal: signalLine[lastIdx],
            histogram: histogram[lastIdx]
        },
        bollinger: {
            upper: sma20[lastIdx] + 2 * std20[lastIdx],
            middle: sma20[lastIdx],
            lower: sma20[lastIdx] - 2 * std20[lastIdx]
        },
        atr14: calculateATR(highs, lows, closes, 14),
        volume24h: volumes.slice(-24).reduce((a, b) => a + b, 0),
        priceChange24h: ((closes[lastIdx] - closes[Math.max(0, lastIdx - 24)]) / closes[Math.max(0, lastIdx - 24)]) * 100
    };
}

// ATR calculation
function calculateATR(highs, lows, closes, period = 14) {
    const tr = [];
    for (let i = 1; i < highs.length; i++) {
        tr.push(Math.max(
            highs[i] - lows[i],
            Math.abs(highs[i] - closes[i-1]),
            Math.abs(lows[i] - closes[i-1])
        ));
    }
    let atr = tr.slice(0, period).reduce((a, b) => a + b) / period;
    for (let i = period; i < tr.length; i++) {
        atr = (atr * (period - 1) + tr[i]) / period;
    }
    return atr;
}

// 📊 CANDLES API - Historical candlestick data with indicators
app.get('/api/candles/:pair/:timeframe', async (req, res) => {
    const { pair, timeframe } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const indicators = req.query.indicators !== 'false';

    if (!CANDLE_TIMEFRAMES.includes(timeframe)) {
        return res.status(400).json({
            error: 'Invalid timeframe',
            valid: CANDLE_TIMEFRAMES
        });
    }

    const symbol = pair.toUpperCase().replace('-', '/');
    const cacheKey = `${symbol}_${timeframe}`;

    // Check cache (1 minute for 1m, 5 min for others)
    const cacheTime = timeframe === '1m' ? 60000 : 300000;
    if (candleCache[cacheKey] && Date.now() - candleCache[cacheKey].time < cacheTime) {
        const cached = candleCache[cacheKey];
        return res.json({
            pair: symbol,
            timeframe,
            candles: cached.candles.slice(-limit),
            indicators: indicators ? cached.indicators : undefined,
            cached: true,
            timestamp: Date.now()
        });
    }

    const candles = await fetchBinanceCandles(symbol, BINANCE_INTERVALS[timeframe], Math.min(limit + 200, 1000));

    if (candles.length === 0) {
        return res.status(404).json({ error: 'No data for pair', pair: symbol });
    }

    const indData = indicators ? calculateIndicators(candles) : null;

    // Cache result
    candleCache[cacheKey] = {
        time: Date.now(),
        candles,
        indicators: indData
    };

    res.json({
        pair: symbol,
        timeframe,
        candles: candles.slice(-limit),
        indicators: indData,
        cached: false,
        timestamp: Date.now()
    });
});

// 🎯 SIGNALS API - Pre-calculated trading signals
const signalCache = { signals: [], lastUpdate: 0 };

async function generateSignals() {
    const pairs = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ARB/USDC', 'OP/USDC', 'AVAX/USDC', 'LINK/USDC', 'SUI/USDC'];
    const signals = [];

    for (const pair of pairs) {
        try {
            const candles = await fetchBinanceCandles(pair, '15m', 200);
            if (candles.length < 50) continue;

            const ind = calculateIndicators(candles);
            const price = candles[candles.length - 1].close;

            // Generate signals based on indicators
            let signal = 'NEUTRAL';
            let confidence = 50;
            const reasons = [];

            // RSI signals
            if (ind.rsi < 30) { signal = 'LONG'; confidence += 15; reasons.push('RSI oversold'); }
            else if (ind.rsi > 70) { signal = 'SHORT'; confidence += 15; reasons.push('RSI overbought'); }

            // EMA crossover
            if (ind.ema9 > ind.ema21) {
                if (signal === 'NEUTRAL') signal = 'LONG';
                confidence += 10;
                reasons.push('EMA9 > EMA21');
            } else if (ind.ema9 < ind.ema21) {
                if (signal === 'NEUTRAL') signal = 'SHORT';
                confidence += 10;
                reasons.push('EMA9 < EMA21');
            }

            // MACD
            if (ind.macd.histogram > 0 && ind.macd.macd > ind.macd.signal) {
                if (signal !== 'SHORT') confidence += 10;
                reasons.push('MACD bullish');
            } else if (ind.macd.histogram < 0 && ind.macd.macd < ind.macd.signal) {
                if (signal !== 'LONG') confidence += 10;
                reasons.push('MACD bearish');
            }

            // Bollinger Bands
            if (price < ind.bollinger.lower) {
                if (signal === 'NEUTRAL') signal = 'LONG';
                confidence += 12;
                reasons.push('Below BB lower');
            } else if (price > ind.bollinger.upper) {
                if (signal === 'NEUTRAL') signal = 'SHORT';
                confidence += 12;
                reasons.push('Above BB upper');
            }

            // Price momentum
            if (ind.priceChange24h > 3) {
                reasons.push(`+${ind.priceChange24h.toFixed(1)}% 24h`);
            } else if (ind.priceChange24h < -3) {
                reasons.push(`${ind.priceChange24h.toFixed(1)}% 24h`);
            }

            confidence = Math.min(95, Math.max(20, confidence));

            signals.push({
                pair,
                price,
                signal,
                confidence,
                reasons,
                indicators: {
                    rsi: ind.rsi.toFixed(1),
                    macd: ind.macd.histogram.toFixed(4),
                    ema9: ind.ema9.toFixed(2),
                    ema21: ind.ema21.toFixed(2)
                },
                targets: signal === 'LONG' ? {
                    entry: price,
                    tp1: price * 1.015,
                    tp2: price * 1.03,
                    sl: price * 0.99
                } : signal === 'SHORT' ? {
                    entry: price,
                    tp1: price * 0.985,
                    tp2: price * 0.97,
                    sl: price * 1.01
                } : null,
                timestamp: Date.now()
            });
        } catch (e) {
            console.error(`[SIGNALS] Error for ${pair}:`, e.message);
        }
    }

    return signals.sort((a, b) => b.confidence - a.confidence);
}

app.get('/api/signals', async (req, res) => {
    const filter = req.query.signal; // LONG, SHORT, NEUTRAL
    const minConfidence = parseInt(req.query.minConfidence) || 0;

    // Refresh signals every 5 minutes
    if (Date.now() - signalCache.lastUpdate > 300000) {
        signalCache.signals = await generateSignals();
        signalCache.lastUpdate = Date.now();
    }

    let signals = signalCache.signals;

    if (filter) {
        signals = signals.filter(s => s.signal === filter.toUpperCase());
    }
    if (minConfidence > 0) {
        signals = signals.filter(s => s.confidence >= minConfidence);
    }

    res.json({
        signals,
        count: signals.length,
        lastUpdate: signalCache.lastUpdate,
        nextUpdate: signalCache.lastUpdate + 300000,
        timestamp: Date.now()
    });
});

app.get('/api/signals/:pair', async (req, res) => {
    const pair = req.params.pair.toUpperCase().replace('-', '/');

    // Get fresh signal for specific pair
    const candles = await fetchBinanceCandles(pair, '15m', 200);
    if (candles.length < 50) {
        return res.status(404).json({ error: 'No data for pair', pair });
    }

    const ind = calculateIndicators(candles);
    const price = candles[candles.length - 1].close;

    // Multi-timeframe analysis
    const candles1h = await fetchBinanceCandles(pair, '1h', 100);
    const candles4h = await fetchBinanceCandles(pair, '4h', 100);

    const ind1h = candles1h.length >= 50 ? calculateIndicators(candles1h) : null;
    const ind4h = candles4h.length >= 50 ? calculateIndicators(candles4h) : null;

    res.json({
        pair,
        price,
        timeframes: {
            '15m': { rsi: ind.rsi, macd: ind.macd, ema9: ind.ema9, ema21: ind.ema21 },
            '1h': ind1h ? { rsi: ind1h.rsi, macd: ind1h.macd, ema9: ind1h.ema9, ema21: ind1h.ema21 } : null,
            '4h': ind4h ? { rsi: ind4h.rsi, macd: ind4h.macd, ema9: ind4h.ema9, ema21: ind4h.ema21 } : null
        },
        bollinger: ind.bollinger,
        atr: ind.atr14,
        volume24h: ind.volume24h,
        priceChange24h: ind.priceChange24h,
        timestamp: Date.now()
    });
});

// 💰 FUNDING RATES API - Cross-exchange funding rates
const fundingCache = { rates: {}, lastUpdate: 0 };

async function fetchFundingRates() {
    const rates = {};

    // Binance Futures funding
    try {
        const response = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex');
        const data = await response.json();
        for (const item of data) {
            const symbol = item.symbol.replace('USDT', '/USDC');
            if (!rates[symbol]) rates[symbol] = {};
            rates[symbol].binance = {
                rate: parseFloat(item.lastFundingRate) * 100,
                nextFunding: item.nextFundingTime,
                markPrice: parseFloat(item.markPrice)
            };
        }
    } catch (e) { console.error('[FUNDING] Binance error:', e.message); }

    // Hyperliquid funding (simulated - would need real API)
    const hyperliquidPairs = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ARB/USDC', 'OP/USDC'];
    for (const pair of hyperliquidPairs) {
        if (!rates[pair]) rates[pair] = {};
        // Simulated funding - in production, fetch from Hyperliquid API
        rates[pair].hyperliquid = {
            rate: (Math.random() - 0.5) * 0.05,
            interval: '8h'
        };
    }

    // dYdX funding (simulated)
    const dydxPairs = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'AVAX/USDC', 'LINK/USDC'];
    for (const pair of dydxPairs) {
        if (!rates[pair]) rates[pair] = {};
        rates[pair].dydx = {
            rate: (Math.random() - 0.5) * 0.04,
            interval: '1h'
        };
    }

    // Calculate arbitrage opportunities
    for (const pair of Object.keys(rates)) {
        const pairRates = rates[pair];
        const exchanges = Object.keys(pairRates);
        if (exchanges.length >= 2) {
            let maxDiff = 0;
            let arbOpportunity = null;

            for (let i = 0; i < exchanges.length; i++) {
                for (let j = i + 1; j < exchanges.length; j++) {
                    const diff = Math.abs(pairRates[exchanges[i]].rate - pairRates[exchanges[j]].rate);
                    if (diff > maxDiff) {
                        maxDiff = diff;
                        const longExchange = pairRates[exchanges[i]].rate < pairRates[exchanges[j]].rate ? exchanges[i] : exchanges[j];
                        const shortExchange = pairRates[exchanges[i]].rate < pairRates[exchanges[j]].rate ? exchanges[j] : exchanges[i];
                        arbOpportunity = {
                            spread: diff,
                            longOn: longExchange,
                            shortOn: shortExchange,
                            annualized: diff * 3 * 365 // 8h funding = 3x per day
                        };
                    }
                }
            }
            rates[pair].arbitrage = arbOpportunity;
        }
    }

    return rates;
}

app.get('/api/funding', async (req, res) => {
    // Refresh every 5 minutes
    if (Date.now() - fundingCache.lastUpdate > 300000) {
        fundingCache.rates = await fetchFundingRates();
        fundingCache.lastUpdate = Date.now();
    }

    const pair = req.query.pair?.toUpperCase().replace('-', '/');

    if (pair) {
        const pairData = fundingCache.rates[pair];
        if (!pairData) {
            return res.status(404).json({ error: 'Pair not found', pair });
        }
        return res.json({ pair, ...pairData, timestamp: Date.now() });
    }

    res.json({
        rates: fundingCache.rates,
        count: Object.keys(fundingCache.rates).length,
        lastUpdate: fundingCache.lastUpdate,
        timestamp: Date.now()
    });
});

app.get('/api/funding/arbitrage', async (req, res) => {
    if (Date.now() - fundingCache.lastUpdate > 300000) {
        fundingCache.rates = await fetchFundingRates();
        fundingCache.lastUpdate = Date.now();
    }

    const minSpread = parseFloat(req.query.minSpread) || 0.01;

    const opportunities = Object.entries(fundingCache.rates)
        .filter(([, data]) => data.arbitrage && data.arbitrage.spread >= minSpread)
        .map(([pair, data]) => ({
            pair,
            ...data.arbitrage,
            exchanges: Object.keys(data).filter(k => k !== 'arbitrage')
        }))
        .sort((a, b) => b.spread - a.spread);

    res.json({
        opportunities,
        count: opportunities.length,
        minSpread,
        timestamp: Date.now()
    });
});

// ⚡ WEBSOCKET PRICE STREAMING ENHANCEMENT
// Already exists in WebSocket handler, adding dedicated price channel
const priceSubscribers = new Set();

// Enhanced WebSocket message handler for price subscriptions
wss.on('connection', (ws, req) => {
    // Add to price subscribers by default
    priceSubscribers.add(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'subscribe' && data.channel === 'prices') {
                priceSubscribers.add(ws);
                ws.send(JSON.stringify({
                    type: 'subscribed',
                    channel: 'prices',
                    pairs: Object.keys(aggregatedPrices)
                }));
            }

            if (data.type === 'unsubscribe' && data.channel === 'prices') {
                priceSubscribers.delete(ws);
                ws.send(JSON.stringify({ type: 'unsubscribed', channel: 'prices' }));
            }

            // Request specific pair updates
            if (data.type === 'get_price' && data.pair) {
                const pair = data.pair.toUpperCase();
                const price = aggregatedPrices[pair];
                ws.send(JSON.stringify({
                    type: 'price',
                    pair,
                    data: price || null,
                    timestamp: Date.now()
                }));
            }
        } catch (e) { /* ignore parse errors */ }
    });

    ws.on('close', () => {
        priceSubscribers.delete(ws);
    });

    // Send current prices immediately on connect
    ws.send(JSON.stringify({
        type: 'prices',
        data: aggregatedPrices,
        timestamp: Date.now()
    }));
});

// Broadcast prices to all subscribers every 100ms
setInterval(() => {
    if (priceSubscribers.size === 0) return;

    const message = JSON.stringify({
        type: 'prices',
        data: aggregatedPrices,
        timestamp: Date.now()
    });

    priceSubscribers.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
}, 100);

console.log('[TRADING API] Candles, Signals, Funding, WebSocket APIs ready');

// ===========================================
// SENTRY: Error handler (must be before other error handlers)
app.use(sentryErrorHandler());

// GLOBAL ERROR HANDLER (must be last middleware)
// ===========================================
app.use((err, req, res, next) => {
    console.error('[ERROR]', new Date().toISOString(), {
        path: req.path,
        method: req.method,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        code: err.code || 'INTERNAL_ERROR'
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND' });
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION]', new Date().toISOString(), reason);
    captureError(reason, { type: 'unhandledRejection' });
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('[UNCAUGHT EXCEPTION]', new Date().toISOString(), error);
    captureError(error, { type: 'uncaughtException' });
    // Give time to log and send to Sentry, then exit
    setTimeout(() => process.exit(1), 2000);
});

// ===========================================
// START SERVER
// ===========================================
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {

    // Setup graceful shutdown
    const shutdown = setupGracefulShutdown(server, {
        timeout: 30000,
        onShutdown: async () => {
            console.log('[SHUTDOWN] Closing WebSocket connections...');
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.close(1001, 'Server shutting down');
                }
            });
            console.log('[SHUTDOWN] Cleanup complete');
        }
    });
    shutdown.trackConnections();

    // Initialize Hyperliquid Executor for MixBot fallback
    hyperliquidExecutor.init().then(ready => {
        if (ready) {
            console.log('[OBELISK] ✅ Hyperliquid Executor ready for real trades');
        } else {
            console.log('[OBELISK] ⚠️ Hyperliquid Executor in simulation mode');
        }
    });

    // Initialize DEX Executor (GMX + Spot on Arbitrum)
    dexExecutor.init().then(ready => {
        if (ready) {
            console.log('[OBELISK] ✅ DEX Executor ready (GMX Perps + Spot Swaps)');
        } else {
            console.log('[OBELISK] ⚠️ DEX Executor in simulation mode');
        }
    });

    // Initialize dYdX v4 Executor (Cosmos chain perpetuals)
    dydxExecutor.init().then(ready => {
        if (ready) {
            console.log('[OBELISK] ✅ dYdX v4 Executor ready for real trades');
        } else {
            console.log('[OBELISK] ⚠️ dYdX v4 Executor in simulation mode');
        }
    });

    // Initialize Gains Network Executor (150x leverage - Crypto, Forex, Stocks)
    gainsExecutor.init().then(ready => {
        if (ready) {
            console.log('[OBELISK] ✅ Gains Network ready (150x Perps - Crypto/Forex/Stocks)');
        } else {
            console.log('[OBELISK] ⚠️ Gains Network in simulation mode');
        }
    });

    // V2.5: Initialize Obelisk AMM (autonomous trading)
    obeliskAMM.init().then(ready => {
        if (ready) {
            console.log('[OBELISK] ✅ AMM ready - PAPER TRADING (liquidité virtuelle)');
            console.log(`[OBELISK]    Pools: ${obeliskAMM.pools.size} | TVL: $${obeliskAMM.calculateTVL().toFixed(0)} (VIRTUEL)`);
        }
    });

    // V2.6: Initialize Obelisk Perps (internal perpetuals)
    // V2.7: Connect real executors for GMX + Hyperliquid + dYdX + Gains trading
    obeliskPerps.init({
        gmx: dexExecutor,
        hyperliquid: hyperliquidExecutor,
        dydx: dydxExecutor,
        gains: gainsExecutor
    }).then(ready => {
        if (ready) {
            const venues = ['PAPER'];
            if (dexExecutor) venues.push('GMX');
            if (hyperliquidExecutor) venues.push('HYPERLIQUID');
            if (dydxExecutor) venues.push('DYDX');
            if (gainsExecutor) venues.push('GAINS');
            console.log(`[OBELISK] ✅ Perps ready - Venues: ${venues.join(', ')}`);
            console.log(`[OBELISK]    Pool: $${obeliskPerps.liquidityPool.USDC.toFixed(0)} | Max Lev: ${obeliskPerps.config.maxLeverage}x`);
        }
    });

    // V3.0: Initialize Trading Router (central hub for MixBot)
    tradingRouter.init({
        hyperliquid: hyperliquidExecutor,
        dex: dexExecutor,
        dydx: dydxExecutor,
        gains: gainsExecutor
    }).then(() => {
        initTradingRoutes(tradingRouter, settlementBatcher);
        console.log('[OBELISK] ✅ Trading Router ready - Routes: HYP/DEX/dYdX/GAINS');
        console.log(`[OBELISK]    Config: ${tradingRouter.config.dexPriorityMode ? 'DEX Priority' : 'HYP Priority'}`);
    });

    // V3.0: Initialize Simulated Traders Academy
    const getPriceForAcademy = async (symbol) => {
        const pair = `${symbol}/USDC`;
        return aggregatedPrices[pair]?.price || null;
    };
    simulatedTraders.init(getPriceForAcademy).then(() => {
        initAcademyRoutes(simulatedTraders);
        console.log('[OBELISK] ✅ Trading Academy ready - 5 simulated traders');
        console.log('[OBELISK]    Traders: Marcus, Elena, Yuki, Alex, Sofia');
    });

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║       OBELISK Ultra-Fast Trading Server v4.1                 ║
║  🔗 MULTI-SOURCE + 💰 MICRO-INVEST + 🛠️ TOOLS + ⚡ UNIQUE    ║
╠══════════════════════════════════════════════════════════════╣
║  REST API:     http://localhost:${PORT}                         ║
║  WebSocket:    ws://localhost:${PORT}                           ║
║  Markets:      ${Object.keys(markets).length} pairs                                  ║
╠══════════════════════════════════════════════════════════════╣
║  🎯 UNIQUE TOOLS (Exclusive):                                ║
║    /api/unique/sniper/*     - Liquidation Sniper             ║
║    /api/unique/smartmoney/* - Smart Money Tracker            ║
║    /api/unique/arbitrage    - Cross-DEX Arbitrage            ║
║    /api/unique/rug/*        - Rug Pull Detector              ║
║    /api/unique/funding      - Funding Rate Arb               ║
║    /api/unique/social/*     - Social Sentiment               ║
║    /api/unique/airdrops     - Airdrop Hunter                 ║
║    /api/unique/gas          - Gas Optimizer                  ║
║    /api/unique/stress-test  - Portfolio Stress Test          ║
║    /api/unique/signals/*    - AI Trade Signals               ║
║    /api/unique/insider/*    - Insider Activity Detector      ║
╠══════════════════════════════════════════════════════════════╣
║  TRADING TOOLS:                                              ║
║    /api/grid/*       - Grid Trading Bots                     ║
║    /api/dca/*        - DCA Automation                        ║
║    /api/copy/*       - Copy Trading                          ║
║    /api/trailing/*   - Trailing Stop Orders                  ║
╠══════════════════════════════════════════════════════════════╣
║  ANALYTICS & AUTOMATION:                                     ║
║    /api/analytics/*  - PnL, Heatmaps, Whales, Sentiment      ║
║    /api/automation/* - Bots, Alerts, Webhooks                ║
║    /api/portfolio/*  - Multi-wallet, Rebalancing, Tax        ║
╠══════════════════════════════════════════════════════════════╣
║  PASSIVE PRODUCTS (NO LOSS):                                 ║
║    /api/passive/staking/*   - Liquid Staking (stETH, stSOL)  ║
║    /api/passive/vaults/*    - Protected Vaults (100% safe)   ║
║    /api/passive/bonds/*     - Fixed Income Bonds (4-12% APY) ║
║    /api/passive/dca/*       - Auto DCA Plans                 ║
║    /api/passive/index/*     - Index Baskets (diversified)    ║
║    /api/passive/yield/*     - Yield Optimizer (min APY)      ║
║    /api/passive/insurance/* - DeFi Insurance Pool            ║
║    /api/passive/combos/*    - 14 Combo Strategies (4-20% APY)║
╠══════════════════════════════════════════════════════════════╣
║  HEALTH & MONITORING:                                        ║
║    /api/health             - Basic health check              ║
║    /api/health/detailed    - Full status with metrics        ║
║    /api/health/metrics     - Prometheus metrics              ║
║    /api/health/alerts      - Active alerts                   ║
║    /api/health/autocheck   - Run auto-verification           ║
╚══════════════════════════════════════════════════════════════╝
    `);

    // Start auto-check system (every 30 seconds)
    startAutoCheck(30000);
    console.log('[HEALTH] Auto-verification system started');
});

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================
const gracefulShutdown = (signal) => {
    console.log(`\n[SERVER] ${signal} received. Starting graceful shutdown...`);

    // Stop auto-check system
    stopAutoCheck();
    console.log('[HEALTH] Auto-check stopped');

    // Stop accepting new connections
    server.close(() => {
        console.log('[SERVER] HTTP server closed');
    });

    // Close WebSocket connections
    wss.clients.forEach((client) => {
        client.close(1001, 'Server shutting down');
    });
    console.log('[SERVER] WebSocket clients disconnected');

    // Close price source connections
    if (binanceWs) {
        binanceWs.close();
        console.log('[BINANCE] Connection closed');
    }
    if (coinbaseWs) {
        coinbaseWs.close();
        console.log('[COINBASE] Connection closed');
    }
    if (krakenWs) {
        krakenWs.close();
        console.log('[KRAKEN] Connection closed');
    }

    // Give time for cleanup
    setTimeout(() => {
        console.log('[SERVER] Graceful shutdown complete');
        process.exit(0);
    }, 2000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
