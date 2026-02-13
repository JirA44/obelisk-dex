/**
 * OBELISK Institutional User Simulator
 * Simule des utilisateurs institutionnels passant par l'API
 *
 * Profils:
 * - Hedge Funds
 * - Market Makers
 * - Family Offices
 * - Prop Trading Firms
 * - Treasury Managers
 * - Algorithmic Traders
 */

const WebSocket = require('ws');
const axios = require('axios');
const crypto = require('crypto');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const WS_URL = process.env.WS_URL || 'ws://localhost:3001';
const NUM_INSTITUTIONS = parseInt(process.env.NUM_INSTITUTIONS) || 6;
const SIMULATION_DURATION = parseInt(process.env.DURATION) || 120000; // 2 minutes

// Available markets
const markets = [
    'BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ARB/USDC',
    'XRP/USDC', 'ADA/USDC', 'AVAX/USDC', 'DOGE/USDC',
    'LINK/USDC', 'UNI/USDC', 'OP/USDC', 'INJ/USDC'
];

// Institutional profiles with realistic behaviors
const INSTITUTIONAL_PROFILES = {
    HEDGE_FUND: {
        name: 'Hedge Fund',
        capitalRange: [50000000, 500000000], // $50M - $500M
        tradeSizePercent: [0.001, 0.01], // 0.1% - 1% of capital per trade
        strategies: ['momentum', 'mean_reversion', 'arbitrage', 'trend_following'],
        riskTolerance: 0.7,
        tradeFrequency: [5000, 30000], // 5-30 seconds between trades
        preferredPairs: ['BTC/USDC', 'ETH/USDC', 'SOL/USDC'],
        useAlgorithms: true
    },
    MARKET_MAKER: {
        name: 'Market Maker',
        capitalRange: [100000000, 1000000000], // $100M - $1B
        tradeSizePercent: [0.0001, 0.001],
        strategies: ['spread_capture', 'inventory_management', 'quote_stuffing'],
        riskTolerance: 0.3,
        tradeFrequency: [100, 500], // Very fast: 100-500ms
        preferredPairs: markets, // All markets
        useAlgorithms: true,
        providesTwoSidedQuotes: true
    },
    FAMILY_OFFICE: {
        name: 'Family Office',
        capitalRange: [10000000, 100000000], // $10M - $100M
        tradeSizePercent: [0.005, 0.02],
        strategies: ['long_term_value', 'diversification', 'yield_farming'],
        riskTolerance: 0.4,
        tradeFrequency: [60000, 300000], // 1-5 minutes
        preferredPairs: ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'LINK/USDC'],
        useAlgorithms: false
    },
    PROP_TRADING: {
        name: 'Prop Trading Firm',
        capitalRange: [20000000, 200000000],
        tradeSizePercent: [0.002, 0.015],
        strategies: ['scalping', 'momentum', 'statistical_arbitrage', 'high_frequency'],
        riskTolerance: 0.8,
        tradeFrequency: [500, 5000], // Fast trading
        preferredPairs: ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ARB/USDC', 'INJ/USDC'],
        useAlgorithms: true
    },
    TREASURY_MANAGER: {
        name: 'Corporate Treasury',
        capitalRange: [5000000, 50000000],
        tradeSizePercent: [0.01, 0.05],
        strategies: ['hedging', 'stablecoin_yield', 'rebalancing'],
        riskTolerance: 0.2,
        tradeFrequency: [120000, 600000], // 2-10 minutes
        preferredPairs: ['BTC/USDC', 'ETH/USDC'],
        useAlgorithms: false,
        prefersStablecoins: true
    },
    ALGO_TRADER: {
        name: 'Algorithmic Trader',
        capitalRange: [1000000, 20000000],
        tradeSizePercent: [0.001, 0.005],
        strategies: ['twap', 'vwap', 'iceberg', 'grid_trading', 'dca'],
        riskTolerance: 0.5,
        tradeFrequency: [1000, 10000],
        preferredPairs: markets,
        useAlgorithms: true,
        usesAdvancedOrders: true
    }
};

class InstitutionalUser {
    constructor(id, profileType) {
        this.id = id;
        this.profile = INSTITUTIONAL_PROFILES[profileType];
        this.profileType = profileType;
        this.name = this.generateInstitutionName();

        // Capital and balances
        const [minCap, maxCap] = this.profile.capitalRange;
        this.capital = minCap + Math.random() * (maxCap - minCap);
        this.initialCapital = this.capital;

        // Portfolio
        this.portfolio = {
            USDC: this.capital * 0.4,
            BTC: (this.capital * 0.25) / 104000,
            ETH: (this.capital * 0.20) / 3900,
            SOL: (this.capital * 0.10) / 225,
            ARB: (this.capital * 0.05) / 1.85
        };

        // API credentials
        this.apiKey = null;
        this.secret = null;

        // Connection
        this.ws = null;
        this.connected = false;

        // Trading state
        this.currentStrategy = this.profile.strategies[Math.floor(Math.random() * this.profile.strategies.length)];
        this.positions = {};
        this.openOrders = [];
        this.tradeHistory = [];
        this.pnl = 0;

        // Metrics
        this.ordersPlaced = 0;
        this.ordersFilled = 0;
        this.volumeTraded = 0;
        this.errors = [];

        // Market data
        this.marketData = {};
        this.orderBooks = {};
    }

    generateInstitutionName() {
        const prefixes = {
            HEDGE_FUND: ['Citadel', 'Renaissance', 'Bridgewater', 'Two Sigma', 'AQR', 'DE Shaw', 'Point72', 'Millennium'],
            MARKET_MAKER: ['Jump Trading', 'Virtu', 'Citadel Securities', 'Jane Street', 'Flow Traders', 'Optiver', 'IMC'],
            FAMILY_OFFICE: ['Walton Family', 'Bezos Expeditions', 'Cascade Investment', 'Emerson Collective', 'Willett Advisors'],
            PROP_TRADING: ['DRW', 'Akuna Capital', 'Belvedere Trading', 'Peak6', 'Wolverine', 'Group One', 'SIG'],
            TREASURY_MANAGER: ['Apple Treasury', 'Google Treasury', 'Microsoft Corp', 'Meta Finance', 'Tesla Treasury'],
            ALGO_TRADER: ['Quantopian Alpha', 'AlgoTrader Pro', 'QuantConnect', 'Numerai Fund', 'WorldQuant']
        };

        const names = prefixes[this.profileType] || ['Institution'];
        const baseName = names[Math.floor(Math.random() * names.length)];
        const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();

        return `${baseName}_${suffix}`;
    }

    async registerBot() {
        try {
            console.log(`[${this.name}] Registering as institutional bot...`);

            const response = await axios.post(`${API_URL}/api/bot/register`, {
                name: this.name,
                email: `${this.name.toLowerCase().replace(/\s/g, '_')}@institutional.com`,
                type: this.profileType,
                capital: this.capital
            });

            this.apiKey = response.data.apiKey;
            this.secret = response.data.secret;

            console.log(`[${this.name}] ✅ Registered with API key: ${this.apiKey.substring(0, 20)}...`);
            return true;
        } catch (error) {
            console.error(`[${this.name}] ❌ Registration failed:`, error.message);
            this.errors.push({ type: 'registration', error: error.message, time: Date.now() });
            return false;
        }
    }

    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            console.log(`[${this.name}] Connecting to WebSocket...`);

            this.ws = new WebSocket(WS_URL);

            this.ws.on('open', () => {
                console.log(`[${this.name}] ✅ WebSocket connected`);
                this.connected = true;

                // Authenticate
                if (this.apiKey) {
                    this.send({
                        type: 'auth',
                        payload: { apiKey: this.apiKey, secret: this.secret }
                    });
                }

                // Subscribe to markets
                this.subscribeToMarkets();
                resolve();
            });

            this.ws.on('message', (data) => {
                this.handleMessage(data);
            });

            this.ws.on('error', (err) => {
                console.error(`[${this.name}] ❌ WebSocket error:`, err.message);
                this.errors.push({ type: 'websocket', error: err.message, time: Date.now() });
                reject(err);
            });

            this.ws.on('close', () => {
                console.log(`[${this.name}] WebSocket disconnected`);
                this.connected = false;
            });

            setTimeout(() => {
                if (!this.connected) {
                    reject(new Error('Connection timeout'));
                }
            }, 15000);
        });
    }

    subscribeToMarkets() {
        const channels = [];

        // Subscribe to preferred pairs
        this.profile.preferredPairs.forEach(pair => {
            channels.push(`ticker:${pair}`);
            channels.push(`orderbook:${pair}`);
            channels.push(`trades:${pair}`);
        });

        // All tickers for market overview
        channels.push('all_tickers');

        this.send({
            type: 'subscribe',
            payload: { channels }
        });
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'welcome':
                    console.log(`[${this.name}] Server ready, ${message.availableMarkets.length} markets available`);
                    break;

                case 'auth_success':
                    console.log(`[${this.name}] ✅ Authenticated as bot`);
                    break;

                case 'ticker':
                    this.marketData[message.pair] = message.data;
                    break;

                case 'all_tickers':
                    message.data.forEach(ticker => {
                        this.marketData[ticker.pair] = ticker;
                    });
                    break;

                case 'orderbook':
                    this.orderBooks[message.pair] = message.data;
                    break;

                case 'order_filled':
                    this.handleOrderFilled(message);
                    break;

                case 'order_rejected':
                    console.log(`[${this.name}] ❌ Order rejected: ${message.reason}`);
                    this.errors.push({ type: 'order_rejected', reason: message.reason, time: Date.now() });
                    break;

                case 'pong':
                    // Latency check
                    break;
            }
        } catch (e) {
            this.errors.push({ type: 'parse_error', error: e.message, time: Date.now() });
        }
    }

    handleOrderFilled(message) {
        const order = message.order;
        this.ordersFilled++;
        this.volumeTraded += order.total;

        // Update portfolio
        const [base, quote] = order.pair.split('/');
        if (order.side === 'buy') {
            this.portfolio[base] = (this.portfolio[base] || 0) + order.quantity;
            this.portfolio[quote] -= order.total;
        } else {
            this.portfolio[base] = (this.portfolio[base] || 0) - order.quantity;
            this.portfolio[quote] = (this.portfolio[quote] || 0) + order.total;
        }

        this.tradeHistory.push({
            ...order,
            timestamp: Date.now()
        });

        const emoji = order.side === 'buy' ? '🟢' : '🔴';
        console.log(`[${this.name}] ${emoji} ${order.side.toUpperCase()} ${order.quantity.toFixed(4)} ${order.pair} @ $${order.executionPrice.toFixed(2)} | Total: $${order.total.toFixed(2)}`);
    }

    // ========================================
    // TRADING STRATEGIES
    // ========================================

    async executeStrategy() {
        if (!this.connected || Object.keys(this.marketData).length === 0) {
            return;
        }

        switch (this.currentStrategy) {
            case 'momentum':
                await this.momentumStrategy();
                break;
            case 'mean_reversion':
                await this.meanReversionStrategy();
                break;
            case 'spread_capture':
                await this.spreadCaptureStrategy();
                break;
            case 'scalping':
                await this.scalpingStrategy();
                break;
            case 'twap':
                await this.twapStrategy();
                break;
            case 'vwap':
                await this.vwapStrategy();
                break;
            case 'grid_trading':
                await this.gridTradingStrategy();
                break;
            case 'arbitrage':
                await this.arbitrageStrategy();
                break;
            case 'hedging':
                await this.hedgingStrategy();
                break;
            default:
                await this.randomStrategy();
        }
    }

    // Momentum strategy - follow the trend
    async momentumStrategy() {
        const pairs = this.profile.preferredPairs;
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const market = this.marketData[pair];

        if (!market) return;

        const side = market.change24h > 0 ? 'buy' : 'sell';
        const size = this.calculateTradeSize(pair);

        await this.placeOrder(pair, side, 'market', null, size, 'momentum');
    }

    // Mean reversion - bet on price returning to mean
    async meanReversionStrategy() {
        const pairs = this.profile.preferredPairs;
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const market = this.marketData[pair];

        if (!market) return;

        // If price is far from daily average, bet on reversion
        const midPoint = (market.high + market.low) / 2;
        const deviation = (market.price - midPoint) / midPoint;

        if (Math.abs(deviation) > 0.02) { // 2% deviation
            const side = deviation > 0 ? 'sell' : 'buy';
            const size = this.calculateTradeSize(pair) * Math.min(Math.abs(deviation) * 10, 2);

            await this.placeOrder(pair, side, 'limit', midPoint, size, 'mean_reversion');
        }
    }

    // Market maker spread capture
    async spreadCaptureStrategy() {
        if (!this.profile.providesTwoSidedQuotes) return;

        const pair = this.profile.preferredPairs[Math.floor(Math.random() * this.profile.preferredPairs.length)];
        const market = this.marketData[pair];
        const book = this.orderBooks[pair];

        if (!market || !book) return;

        const spread = book.spread || market.price * 0.0002;
        const size = this.calculateTradeSize(pair);

        // Place both sides
        const bidPrice = market.price - spread;
        const askPrice = market.price + spread;

        await this.placeOrder(pair, 'buy', 'limit', bidPrice, size, 'spread_bid');
        await this.placeOrder(pair, 'sell', 'limit', askPrice, size, 'spread_ask');
    }

    // Scalping - quick in and out
    async scalpingStrategy() {
        const pair = this.profile.preferredPairs[Math.floor(Math.random() * this.profile.preferredPairs.length)];
        const market = this.marketData[pair];

        if (!market) return;

        // Quick market order
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const size = this.calculateTradeSize(pair) * 0.5; // Smaller size for scalping

        await this.placeOrder(pair, side, 'market', null, size, 'scalp');
    }

    // TWAP - Time Weighted Average Price
    async twapStrategy() {
        const pair = 'BTC/USDC';
        const market = this.marketData[pair];

        if (!market) return;

        // Execute small portions over time
        const totalSize = this.calculateTradeSize(pair) * 5; // Larger total order
        const slices = 10;
        const sliceSize = totalSize / slices;

        // Place one slice
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        await this.placeOrder(pair, side, 'market', null, sliceSize, 'twap_slice');
    }

    // VWAP - Volume Weighted Average Price
    async vwapStrategy() {
        const pair = 'ETH/USDC';
        const market = this.marketData[pair];

        if (!market) return;

        // Weight by volume
        const volumeWeight = Math.random(); // Simulate volume-based execution
        const size = this.calculateTradeSize(pair) * (0.5 + volumeWeight);

        const side = market.change24h > 0 ? 'buy' : 'sell';
        await this.placeOrder(pair, side, 'market', null, size, 'vwap');
    }

    // Grid trading
    async gridTradingStrategy() {
        const pair = 'SOL/USDC';
        const market = this.marketData[pair];

        if (!market) return;

        // Place orders at grid levels
        const gridSpacing = 0.01; // 1% grid
        const size = this.calculateTradeSize(pair) * 0.3;

        const buyPrice = market.price * (1 - gridSpacing);
        const sellPrice = market.price * (1 + gridSpacing);

        if (Math.random() > 0.5) {
            await this.placeOrder(pair, 'buy', 'limit', buyPrice, size, 'grid_buy');
        } else {
            await this.placeOrder(pair, 'sell', 'limit', sellPrice, size, 'grid_sell');
        }
    }

    // Arbitrage looking for price differences
    async arbitrageStrategy() {
        // Check for price discrepancies between USDC and USDT pairs
        const btcUsdc = this.marketData['BTC/USDC'];
        const ethUsdc = this.marketData['ETH/USDC'];

        if (!btcUsdc || !ethUsdc) return;

        // Simulate arb opportunity detection
        if (Math.random() > 0.7) {
            const pair = Math.random() > 0.5 ? 'BTC/USDC' : 'ETH/USDC';
            const size = this.calculateTradeSize(pair);

            // Quick execution on arb
            await this.placeOrder(pair, 'buy', 'market', null, size, 'arb_buy');
            setTimeout(() => {
                this.placeOrder(pair, 'sell', 'market', null, size, 'arb_sell');
            }, 100);
        }
    }

    // Hedging strategy
    async hedgingStrategy() {
        const pair = 'BTC/USDC';
        const market = this.marketData[pair];

        if (!market) return;

        // Check if need to hedge
        const btcValue = (this.portfolio.BTC || 0) * market.price;
        const portfolioValue = this.calculatePortfolioValue();
        const btcExposure = btcValue / portfolioValue;

        // If BTC exposure > 30%, hedge
        if (btcExposure > 0.3) {
            const excessBtc = (this.portfolio.BTC || 0) * (btcExposure - 0.25);
            if (excessBtc > 0.001) {
                await this.placeOrder(pair, 'sell', 'market', null, excessBtc, 'hedge');
            }
        }
    }

    // Random trading
    async randomStrategy() {
        const pair = this.profile.preferredPairs[Math.floor(Math.random() * this.profile.preferredPairs.length)];
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const size = this.calculateTradeSize(pair);

        await this.placeOrder(pair, side, 'market', null, size, 'random');
    }

    // ========================================
    // ORDER EXECUTION
    // ========================================

    calculateTradeSize(pair) {
        const [minPct, maxPct] = this.profile.tradeSizePercent;
        const sizePct = minPct + Math.random() * (maxPct - minPct);
        const usdSize = this.capital * sizePct;

        const market = this.marketData[pair];
        if (!market) return 0.01;

        return usdSize / market.price;
    }

    calculatePortfolioValue() {
        let total = this.portfolio.USDC || 0;

        Object.entries(this.portfolio).forEach(([asset, amount]) => {
            if (asset !== 'USDC' && amount > 0) {
                const pair = `${asset}/USDC`;
                const market = this.marketData[pair];
                if (market) {
                    total += amount * market.price;
                }
            }
        });

        return total;
    }

    async placeOrder(pair, side, type, price, quantity, reason) {
        if (quantity <= 0 || !this.connected) return;

        this.ordersPlaced++;

        // Use REST API for order
        try {
            const response = await axios.post(`${API_URL}/api/order`, {
                pair,
                side,
                type,
                price,
                quantity
            }, {
                headers: {
                    'X-API-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                this.handleOrderFilled({ order: response.data.order });
            }
        } catch (error) {
            // Fallback to WebSocket
            this.send({
                type: 'order',
                payload: { pair, side, type, price, quantity }
            });
        }
    }

    // ========================================
    // ACTIVITY LOOP
    // ========================================

    async startTrading() {
        if (!this.connected) return;

        const [minInterval, maxInterval] = this.profile.tradeFrequency;

        const trade = async () => {
            if (this.connected) {
                await this.executeStrategy();

                // Random interval based on profile
                const nextInterval = minInterval + Math.random() * (maxInterval - minInterval);
                setTimeout(trade, nextInterval);
            }
        };

        // Start with a small delay
        setTimeout(trade, 1000 + Math.random() * 3000);
    }

    getStats() {
        const portfolioValue = this.calculatePortfolioValue();
        const pnl = portfolioValue - this.initialCapital;
        const pnlPercent = (pnl / this.initialCapital) * 100;

        return {
            name: this.name,
            profile: this.profile.name,
            profileType: this.profileType,
            strategy: this.currentStrategy,
            initialCapital: this.initialCapital,
            currentValue: portfolioValue,
            pnl,
            pnlPercent: pnlPercent.toFixed(2) + '%',
            ordersPlaced: this.ordersPlaced,
            ordersFilled: this.ordersFilled,
            volumeTraded: this.volumeTraded,
            fillRate: this.ordersPlaced > 0 ? ((this.ordersFilled / this.ordersPlaced) * 100).toFixed(1) + '%' : '0%',
            errors: this.errors.length,
            connected: this.connected
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// ========================================
// MAIN SIMULATION
// ========================================

async function runInstitutionalSimulation() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║          OBELISK INSTITUTIONAL USER SIMULATOR                        ║');
    console.log('╠══════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Simulating ${NUM_INSTITUTIONS} institutional users                                    ║`);
    console.log(`║  Duration: ${SIMULATION_DURATION / 1000} seconds                                              ║`);
    console.log(`║  API: ${API_URL}                                       ║`);
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log('');

    const institutions = [];
    const profileTypes = Object.keys(INSTITUTIONAL_PROFILES);

    // Create institutional users
    for (let i = 0; i < NUM_INSTITUTIONS; i++) {
        const profileType = profileTypes[i % profileTypes.length];
        const institution = new InstitutionalUser(i + 1, profileType);
        institutions.push(institution);
    }

    console.log('📋 Created Institutions:');
    console.log('─'.repeat(70));
    institutions.forEach(inst => {
        console.log(`  ${inst.name} | ${inst.profile.name} | Capital: $${(inst.capital / 1000000).toFixed(1)}M | Strategy: ${inst.currentStrategy}`);
    });
    console.log('');

    // Register and connect all institutions
    console.log('🔐 Registering bots and connecting...');
    console.log('─'.repeat(70));

    for (const institution of institutions) {
        try {
            await institution.registerBot();
            await institution.connectWebSocket();
        } catch (error) {
            console.error(`[${institution.name}] Failed to connect:`, error.message);
        }
        await new Promise(r => setTimeout(r, 300)); // Stagger connections
    }

    const connectedCount = institutions.filter(i => i.connected).length;
    console.log('');
    console.log(`✅ ${connectedCount}/${NUM_INSTITUTIONS} institutions connected and authenticated`);
    console.log('');

    // Start trading
    console.log('📈 Starting institutional trading activity...');
    console.log('═'.repeat(70));

    for (const institution of institutions) {
        if (institution.connected) {
            institution.startTrading();
        }
    }

    // Progress updates every 10 seconds
    const progressInterval = setInterval(() => {
        let totalVolume = 0;
        let totalOrders = 0;
        institutions.forEach(i => {
            totalVolume += i.volumeTraded;
            totalOrders += i.ordersPlaced;
        });
        console.log(`\n📊 Progress: ${totalOrders} orders | Volume: $${(totalVolume / 1000000).toFixed(2)}M`);
    }, 10000);

    // Wait for simulation duration
    await new Promise(r => setTimeout(r, SIMULATION_DURATION));

    // Cleanup
    clearInterval(progressInterval);

    console.log('');
    console.log('═'.repeat(70));
    console.log('                    SIMULATION COMPLETE - RESULTS                      ');
    console.log('═'.repeat(70));
    console.log('');

    let totalVolume = 0;
    let totalOrders = 0;
    let totalPnl = 0;

    console.log('Institution                          | Capital    | P&L        | Orders | Volume');
    console.log('─'.repeat(90));

    institutions.forEach(institution => {
        const stats = institution.getStats();
        totalVolume += stats.volumeTraded;
        totalOrders += stats.ordersPlaced;
        totalPnl += stats.pnl;

        const pnlColor = stats.pnl >= 0 ? '\x1b[32m' : '\x1b[31m';
        const reset = '\x1b[0m';

        console.log(
            `${stats.name.padEnd(36)} | $${(stats.initialCapital/1000000).toFixed(1)}M`.padEnd(48) +
            `| ${pnlColor}${stats.pnl >= 0 ? '+' : ''}$${(stats.pnl/1000).toFixed(1)}K${reset}`.padEnd(22) +
            `| ${stats.ordersPlaced}`.padEnd(9) +
            `| $${(stats.volumeTraded/1000000).toFixed(2)}M`
        );

        institution.disconnect();
    });

    console.log('─'.repeat(90));
    console.log(`${'TOTAL'.padEnd(36)} | `.padEnd(48) +
                `| ${totalPnl >= 0 ? '+' : ''}$${(totalPnl/1000).toFixed(1)}K`.padEnd(12) +
                `| ${totalOrders}`.padEnd(9) +
                `| $${(totalVolume/1000000).toFixed(2)}M`);

    console.log('');
    console.log('═'.repeat(70));
    console.log(`Duration: ${(SIMULATION_DURATION / 1000).toFixed(0)}s | Avg Orders/sec: ${(totalOrders / (SIMULATION_DURATION / 1000)).toFixed(1)}`);
    console.log('═'.repeat(70));

    process.exit(0);
}

// Handle errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

runInstitutionalSimulation().catch(console.error);
