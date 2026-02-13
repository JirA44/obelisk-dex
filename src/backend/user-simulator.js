/**
 * OBELISK User Simulator
 * Simule plusieurs utilisateurs interagissant avec le DEX
 */

const WebSocket = require('ws');

const WS_URL = process.env.WS_URL || 'ws://localhost:3001';
const NUM_USERS = parseInt(process.env.NUM_USERS) || 5;
const SIMULATION_DURATION = parseInt(process.env.DURATION) || 60000; // 60 secondes par défaut

const markets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT', 'XRP/USDT', 'ADA/USDT', 'AVAX/USDT', 'LINK/USDT'];

class SimulatedUser {
    constructor(id) {
        this.id = id;
        this.name = `user_${id}_${Math.random().toString(36).substr(2, 6)}`;
        this.ws = null;
        this.connected = false;
        this.balance = {
            USDT: 10000 + Math.random() * 90000,
            BTC: Math.random() * 2,
            ETH: Math.random() * 20,
            SOL: Math.random() * 100
        };
        this.orders = [];
        this.errors = [];
        this.actions = 0;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            console.log(`[User ${this.id}] Connecting to ${WS_URL}...`);

            this.ws = new WebSocket(WS_URL);

            this.ws.on('open', () => {
                console.log(`[User ${this.id}] ✅ Connected as ${this.name}`);
                this.connected = true;
                resolve();
            });

            this.ws.on('message', (data) => {
                this.handleMessage(data);
            });

            this.ws.on('error', (err) => {
                console.error(`[User ${this.id}] ❌ Connection error:`, err.message);
                this.errors.push({ type: 'connection', error: err.message, time: Date.now() });
                reject(err);
            });

            this.ws.on('close', () => {
                console.log(`[User ${this.id}] Disconnected`);
                this.connected = false;
            });

            setTimeout(() => {
                if (!this.connected) {
                    reject(new Error('Connection timeout'));
                }
            }, 10000);
        });
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'welcome':
                    console.log(`[User ${this.id}] Received welcome, clientId: ${message.clientId}`);
                    this.subscribeToMarkets();
                    break;
                case 'subscribed':
                    console.log(`[User ${this.id}] Subscribed to ${message.channels.length} channels`);
                    break;
                case 'ticker':
                    // Process silently
                    break;
                case 'orderbook':
                    // Process silently
                    break;
                case 'trade':
                    // Process silently
                    break;
                case 'order_filled':
                    console.log(`[User ${this.id}] ✅ Order filled: ${message.order.side} ${message.order.quantity} ${message.order.pair} @ ${message.order.filledPrice.toFixed(2)}`);
                    this.orders.push(message.order);
                    break;
                case 'order_rejected':
                    console.log(`[User ${this.id}] ❌ Order rejected: ${message.reason}`);
                    this.errors.push({ type: 'order_rejected', reason: message.reason, time: Date.now() });
                    break;
                case 'error':
                    console.error(`[User ${this.id}] Server error: ${message.message}`);
                    this.errors.push({ type: 'server_error', message: message.message, time: Date.now() });
                    break;
                case 'pong':
                    // Heartbeat response
                    break;
                default:
                    console.log(`[User ${this.id}] Unknown message type: ${message.type}`);
            }
        } catch (e) {
            console.error(`[User ${this.id}] Failed to parse message:`, e.message);
            this.errors.push({ type: 'parse_error', error: e.message, time: Date.now() });
        }
    }

    subscribeToMarkets() {
        // Subscribe to random markets
        const numMarkets = Math.floor(Math.random() * 4) + 1;
        const selectedMarkets = markets.sort(() => 0.5 - Math.random()).slice(0, numMarkets);

        const channels = [];
        selectedMarkets.forEach(pair => {
            channels.push(`ticker:${pair}`);
            channels.push(`orderbook:${pair}`);
            channels.push(`trades:${pair}`);
        });

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

    // Simulate different user behaviors
    async simulateActivity() {
        const actions = [
            () => this.placeMarketOrder(),
            () => this.placeLimitOrder(),
            () => this.sendPing(),
            () => this.subscribeToNewMarket(),
            () => this.sendInvalidMessage(),
            () => this.sendMalformedOrder(),
            () => this.rapidFireOrders(),
            () => this.testEdgeCases()
        ];

        const action = actions[Math.floor(Math.random() * actions.length)];
        try {
            await action();
            this.actions++;
        } catch (e) {
            console.error(`[User ${this.id}] Action error:`, e.message);
            this.errors.push({ type: 'action_error', error: e.message, time: Date.now() });
        }
    }

    placeMarketOrder() {
        const pair = markets[Math.floor(Math.random() * markets.length)];
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const quantity = Math.random() * 10 + 0.01;

        console.log(`[User ${this.id}] Placing market ${side} order: ${quantity.toFixed(4)} ${pair}`);

        this.send({
            type: 'order',
            payload: {
                pair,
                side,
                type: 'market',
                quantity
            }
        });
    }

    placeLimitOrder() {
        const pair = markets[Math.floor(Math.random() * markets.length)];
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const quantity = Math.random() * 5 + 0.1;
        const price = 100 + Math.random() * 50000;

        console.log(`[User ${this.id}] Placing limit ${side} order: ${quantity.toFixed(4)} ${pair} @ ${price.toFixed(2)}`);

        this.send({
            type: 'order',
            payload: {
                pair,
                side,
                type: 'limit',
                price,
                quantity
            }
        });
    }

    sendPing() {
        this.send({ type: 'ping' });
    }

    subscribeToNewMarket() {
        const pair = markets[Math.floor(Math.random() * markets.length)];
        console.log(`[User ${this.id}] Subscribing to ${pair}`);

        this.send({
            type: 'subscribe',
            payload: {
                channels: [`ticker:${pair}`, `orderbook:${pair}`]
            }
        });
    }

    // Test error handling
    sendInvalidMessage() {
        console.log(`[User ${this.id}] 🔧 Testing: sending invalid message type`);
        this.send({
            type: 'invalid_type_that_does_not_exist',
            payload: { test: true }
        });
    }

    sendMalformedOrder() {
        console.log(`[User ${this.id}] 🔧 Testing: sending malformed order`);

        // Test various malformed orders
        const malformedOrders = [
            { type: 'order', payload: { pair: 'INVALID/PAIR', side: 'buy', quantity: 1 } },
            { type: 'order', payload: { pair: 'BTC/USDT', side: 'invalid_side', quantity: 1 } },
            { type: 'order', payload: { pair: 'BTC/USDT', side: 'buy', quantity: -1 } },
            { type: 'order', payload: { pair: 'BTC/USDT', side: 'buy', quantity: 0 } },
            { type: 'order', payload: { pair: 'BTC/USDT', side: 'buy' } }, // Missing quantity
            { type: 'order', payload: {} }, // Empty payload
            { type: 'order' }, // No payload
        ];

        const order = malformedOrders[Math.floor(Math.random() * malformedOrders.length)];
        this.send(order);
    }

    rapidFireOrders() {
        console.log(`[User ${this.id}] 🔧 Testing: rapid fire orders (stress test)`);
        for (let i = 0; i < 10; i++) {
            this.placeMarketOrder();
        }
    }

    testEdgeCases() {
        console.log(`[User ${this.id}] 🔧 Testing: edge cases`);

        const edgeCases = [
            // Very large quantity
            { type: 'order', payload: { pair: 'BTC/USDT', side: 'buy', quantity: 999999999 } },
            // Very small quantity
            { type: 'order', payload: { pair: 'BTC/USDT', side: 'buy', quantity: 0.000000001 } },
            // String instead of number
            { type: 'order', payload: { pair: 'BTC/USDT', side: 'buy', quantity: 'abc' } },
            // XSS attempt
            { type: 'order', payload: { pair: '<script>alert("xss")</script>', side: 'buy', quantity: 1 } },
            // SQL injection attempt
            { type: 'order', payload: { pair: "'; DROP TABLE orders;--", side: 'buy', quantity: 1 } },
            // Empty string
            { type: 'subscribe', payload: { channels: [''] } },
            // Null values
            { type: 'subscribe', payload: { channels: null } },
        ];

        const testCase = edgeCases[Math.floor(Math.random() * edgeCases.length)];
        this.send(testCase);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    getStats() {
        return {
            id: this.id,
            name: this.name,
            connected: this.connected,
            actions: this.actions,
            orders: this.orders.length,
            errors: this.errors.length,
            errorDetails: this.errors
        };
    }
}

// Main simulation
async function runSimulation() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         OBELISK User Simulator - Starting                  ║');
    console.log(`║         Simulating ${NUM_USERS} users for ${SIMULATION_DURATION/1000}s                       ║`);
    console.log('╚════════════════════════════════════════════════════════════╝');

    const users = [];

    // Create and connect users
    for (let i = 1; i <= NUM_USERS; i++) {
        const user = new SimulatedUser(i);
        users.push(user);

        try {
            await user.connect();
        } catch (e) {
            console.error(`Failed to connect user ${i}:`, e.message);
        }

        // Stagger connections
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n✅ ${users.filter(u => u.connected).length}/${NUM_USERS} users connected\n`);

    // Run simulation
    const startTime = Date.now();
    const intervalIds = [];

    users.forEach(user => {
        if (user.connected) {
            // Each user acts at random intervals
            const interval = setInterval(() => {
                if (user.connected) {
                    user.simulateActivity();
                }
            }, 1000 + Math.random() * 4000);
            intervalIds.push(interval);
        }
    });

    // Wait for simulation duration
    await new Promise(r => setTimeout(r, SIMULATION_DURATION));

    // Cleanup
    intervalIds.forEach(id => clearInterval(id));

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         SIMULATION COMPLETE - RESULTS                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    let totalActions = 0;
    let totalOrders = 0;
    let totalErrors = 0;
    const allErrors = [];

    users.forEach(user => {
        const stats = user.getStats();
        totalActions += stats.actions;
        totalOrders += stats.orders;
        totalErrors += stats.errors;

        if (stats.errors > 0) {
            allErrors.push(...stats.errorDetails);
        }

        console.log(`User ${stats.id} (${stats.name}): ${stats.actions} actions, ${stats.orders} orders, ${stats.errors} errors`);
        user.disconnect();
    });

    console.log('\n─────────────────────────────────────────────────────────────');
    console.log(`TOTAL: ${totalActions} actions, ${totalOrders} orders, ${totalErrors} errors`);
    console.log(`Duration: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    if (allErrors.length > 0) {
        console.log('\n⚠️  ERRORS DETECTED:');
        const errorTypes = {};
        allErrors.forEach(err => {
            const key = `${err.type}: ${err.reason || err.message || err.error}`;
            errorTypes[key] = (errorTypes[key] || 0) + 1;
        });
        Object.entries(errorTypes).forEach(([error, count]) => {
            console.log(`  - ${error} (x${count})`);
        });
    } else {
        console.log('\n✅ No errors detected during simulation');
    }

    console.log('\n─────────────────────────────────────────────────────────────');
    process.exit(0);
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

runSimulation().catch(console.error);
