/**
 * OBELISK BOT SIMULATOR
 * Simulates multiple trading bots using the Obelisk API
 */

const API_URL = 'https://obelisk-api.hugo-padilla-pro.workers.dev';

// Bot profiles with different trading strategies
const BOT_PROFILES = {
    MARKET_MAKER: {
        name: 'Market Maker Bot',
        icon: '🏦',
        strategy: 'spread_capture',
        tradeFrequency: 2000,  // ms between trades
        orderSize: { min: 0.1, max: 2.0 },
        spreadTarget: 0.002,  // 0.2% spread
        pairs: ['BTC/USDC', 'ETH/USDC', 'SOL/USDC']
    },
    SCALPER: {
        name: 'Scalper Bot',
        icon: '⚡',
        strategy: 'quick_profit',
        tradeFrequency: 1000,
        orderSize: { min: 0.5, max: 5.0 },
        profitTarget: 0.001,  // 0.1% profit target
        pairs: ['BTC/USDC', 'ETH/USDC']
    },
    TREND_FOLLOWER: {
        name: 'Trend Follower',
        icon: '📈',
        strategy: 'momentum',
        tradeFrequency: 10000,
        orderSize: { min: 1.0, max: 10.0 },
        momentumPeriod: 5,
        pairs: ['BTC/USDC', 'SOL/USDC', 'ARB/USDC']
    },
    DCA_BOT: {
        name: 'DCA Bot',
        icon: '🤖',
        strategy: 'dollar_cost_average',
        tradeFrequency: 30000,
        orderSize: { min: 100, max: 500 },  // USD value
        pairs: ['BTC/USDC', 'ETH/USDC']
    },
    WHALE: {
        name: 'Whale Trader',
        icon: '🐋',
        strategy: 'large_orders',
        tradeFrequency: 60000,
        orderSize: { min: 50, max: 200 },
        pairs: ['BTC/USDC']
    },
    RETAIL: {
        name: 'Retail Trader',
        icon: '👤',
        strategy: 'random',
        tradeFrequency: 15000,
        orderSize: { min: 0.01, max: 0.5 },
        pairs: ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ARB/USDC']
    },
    ARBITRAGE: {
        name: 'Arbitrage Bot',
        icon: '🔄',
        strategy: 'price_diff',
        tradeFrequency: 500,
        orderSize: { min: 1.0, max: 10.0 },
        pairs: ['BTC/USDC', 'ETH/USDC']
    }
};

class TradingBot {
    constructor(profile, id) {
        this.id = id;
        this.profile = profile;
        this.config = BOT_PROFILES[profile];
        this.name = `${this.config.name} #${id}`;
        this.balance = { USDC: 100000, BTC: 0, ETH: 0, SOL: 0, ARB: 0 };
        this.positions = [];
        this.trades = [];
        this.pnl = 0;
        this.priceHistory = {};
        this.running = false;
    }

    log(message) {
        const time = new Date().toLocaleTimeString();
        console.log(`[${time}] ${this.config.icon} ${this.name}: ${message}`);
    }

    async fetchPrices() {
        try {
            const res = await fetch(`${API_URL}/api/tickers`);
            const data = await res.json();
            return data.tickers;
        } catch (e) {
            this.log(`Error fetching prices: ${e.message}`);
            return null;
        }
    }

    async fetchOrderbook(pair) {
        try {
            const [base, quote] = pair.split('/');
            const res = await fetch(`${API_URL}/api/orderbook/${base}/${quote}`);
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async placeOrder(pair, side, quantity) {
        try {
            const res = await fetch(`${API_URL}/api/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pair,
                    side,
                    type: 'market',
                    quantity,
                    userId: `bot_${this.profile.toLowerCase()}_${this.id}`
                })
            });
            const data = await res.json();

            if (data.success) {
                this.trades.push({
                    time: Date.now(),
                    pair,
                    side,
                    quantity,
                    price: data.order.executionPrice,
                    total: data.order.total
                });
                this.log(`${side.toUpperCase()} ${quantity.toFixed(4)} ${pair} @ $${data.order.executionPrice.toFixed(2)}`);
            }
            return data;
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    getRandomSize() {
        const { min, max } = this.config.orderSize;
        return min + Math.random() * (max - min);
    }

    getRandomPair() {
        const pairs = this.config.pairs;
        return pairs[Math.floor(Math.random() * pairs.length)];
    }

    // Strategy: Market Making
    async executeMarketMaker(prices) {
        const pair = this.getRandomPair();
        const price = prices[pair]?.price;
        if (!price) return;

        const orderbook = await this.fetchOrderbook(pair);
        if (!orderbook) return;

        const spread = orderbook.spread / price;

        // Place both buy and sell orders
        if (Math.random() > 0.5) {
            await this.placeOrder(pair, 'buy', this.getRandomSize());
        } else {
            await this.placeOrder(pair, 'sell', this.getRandomSize());
        }
    }

    // Strategy: Scalping
    async executeScalper(prices) {
        const pair = this.getRandomPair();
        const price = prices[pair]?.price;
        if (!price) return;

        // Track price history for quick decisions
        if (!this.priceHistory[pair]) this.priceHistory[pair] = [];
        this.priceHistory[pair].push(price);
        if (this.priceHistory[pair].length > 10) this.priceHistory[pair].shift();

        if (this.priceHistory[pair].length >= 3) {
            const recent = this.priceHistory[pair].slice(-3);
            const trend = (recent[2] - recent[0]) / recent[0];

            if (trend > 0.0005) {
                await this.placeOrder(pair, 'buy', this.getRandomSize());
            } else if (trend < -0.0005) {
                await this.placeOrder(pair, 'sell', this.getRandomSize());
            }
        }
    }

    // Strategy: Trend Following
    async executeTrendFollower(prices) {
        const pair = this.getRandomPair();
        const ticker = prices[pair];
        if (!ticker) return;

        // Follow the 24h trend
        if (ticker.change24h > 1) {
            this.log(`Bullish trend detected on ${pair} (+${ticker.change24h.toFixed(2)}%)`);
            await this.placeOrder(pair, 'buy', this.getRandomSize());
        } else if (ticker.change24h < -1) {
            this.log(`Bearish trend detected on ${pair} (${ticker.change24h.toFixed(2)}%)`);
            await this.placeOrder(pair, 'sell', this.getRandomSize());
        }
    }

    // Strategy: DCA
    async executeDCA(prices) {
        const pair = this.getRandomPair();
        const price = prices[pair]?.price;
        if (!price) return;

        // Always buy in DCA strategy
        const usdAmount = this.getRandomSize();
        const quantity = usdAmount / price;

        this.log(`DCA buying $${usdAmount.toFixed(2)} of ${pair}`);
        await this.placeOrder(pair, 'buy', quantity);
    }

    // Strategy: Whale moves
    async executeWhale(prices) {
        const pair = 'BTC/USDC';
        const price = prices[pair]?.price;
        if (!price) return;

        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const size = this.getRandomSize();

        this.log(`🐋 WHALE ALERT: Large ${side} order incoming!`);
        await this.placeOrder(pair, side, size);
    }

    // Strategy: Retail random
    async executeRetail(prices) {
        const pair = this.getRandomPair();
        const price = prices[pair]?.price;
        if (!price) return;

        // Retail traders often buy high, sell low (FOMO/panic)
        const change = prices[pair]?.change24h || 0;
        let side;

        if (change > 2) {
            side = Math.random() > 0.3 ? 'buy' : 'sell';  // FOMO buying
        } else if (change < -2) {
            side = Math.random() > 0.3 ? 'sell' : 'buy';  // Panic selling
        } else {
            side = Math.random() > 0.5 ? 'buy' : 'sell';
        }

        await this.placeOrder(pair, side, this.getRandomSize());
    }

    // Strategy: Arbitrage simulation
    async executeArbitrage(prices) {
        // Simulate finding arbitrage opportunities
        const pair = this.getRandomPair();

        if (Math.random() > 0.7) {  // 30% chance of "finding" an opportunity
            this.log(`Arbitrage opportunity found on ${pair}!`);
            await this.placeOrder(pair, 'buy', this.getRandomSize());
            await new Promise(r => setTimeout(r, 100));
            await this.placeOrder(pair, 'sell', this.getRandomSize());
        }
    }

    async executeTrade() {
        const prices = await this.fetchPrices();
        if (!prices) return;

        switch (this.config.strategy) {
            case 'spread_capture':
                await this.executeMarketMaker(prices);
                break;
            case 'quick_profit':
                await this.executeScalper(prices);
                break;
            case 'momentum':
                await this.executeTrendFollower(prices);
                break;
            case 'dollar_cost_average':
                await this.executeDCA(prices);
                break;
            case 'large_orders':
                await this.executeWhale(prices);
                break;
            case 'random':
                await this.executeRetail(prices);
                break;
            case 'price_diff':
                await this.executeArbitrage(prices);
                break;
        }
    }

    async start() {
        this.running = true;
        this.log(`Starting... Strategy: ${this.config.strategy}`);

        while (this.running) {
            await this.executeTrade();
            await new Promise(r => setTimeout(r, this.config.tradeFrequency));
        }
    }

    stop() {
        this.running = false;
        this.log(`Stopped. Total trades: ${this.trades.length}`);
    }

    getStats() {
        return {
            name: this.name,
            profile: this.profile,
            trades: this.trades.length,
            lastTrade: this.trades[this.trades.length - 1],
            running: this.running
        };
    }
}

class BotSimulator {
    constructor() {
        this.bots = [];
    }

    addBot(profile, id = null) {
        const botId = id || this.bots.length + 1;
        const bot = new TradingBot(profile, botId);
        this.bots.push(bot);
        return bot;
    }

    async startAll() {
        console.log('\n' + '='.repeat(60));
        console.log('  OBELISK BOT SIMULATOR - Starting all bots');
        console.log('  API: ' + API_URL);
        console.log('='.repeat(60) + '\n');

        // Start all bots in parallel
        await Promise.all(this.bots.map(bot => bot.start()));
    }

    stopAll() {
        this.bots.forEach(bot => bot.stop());
        console.log('\n' + '='.repeat(60));
        console.log('  All bots stopped');
        console.log('='.repeat(60) + '\n');
    }

    getStats() {
        return this.bots.map(bot => bot.getStats());
    }

    printStats() {
        console.log('\n📊 BOT STATISTICS:');
        console.log('-'.repeat(50));
        this.bots.forEach(bot => {
            const stats = bot.getStats();
            console.log(`${bot.config.icon} ${stats.name}: ${stats.trades} trades`);
        });
        console.log('-'.repeat(50));
    }
}

// Main execution
async function main() {
    const simulator = new BotSimulator();

    // Add different types of bots
    simulator.addBot('MARKET_MAKER', 1);
    simulator.addBot('MARKET_MAKER', 2);
    simulator.addBot('SCALPER', 1);
    simulator.addBot('TREND_FOLLOWER', 1);
    simulator.addBot('DCA_BOT', 1);
    simulator.addBot('WHALE', 1);
    simulator.addBot('RETAIL', 1);
    simulator.addBot('RETAIL', 2);
    simulator.addBot('RETAIL', 3);
    simulator.addBot('ARBITRAGE', 1);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\nShutting down...');
        simulator.stopAll();
        simulator.printStats();
        process.exit(0);
    });

    // Print stats every 30 seconds
    setInterval(() => {
        simulator.printStats();
    }, 30000);

    // Start all bots
    await simulator.startAll();
}

main().catch(console.error);
