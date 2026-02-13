/**
 * OBELISK Full Professional Simulation
 * Simule un écosystème complet d'utilisateurs professionnels
 *
 * - Institutional Traders (Hedge Funds, Market Makers, etc.)
 * - Lending Users (emprunteurs avec différents profils de crédit)
 * - Retail Traders (utilisateurs normaux)
 * - Bots de trading algorithmique
 */

const WebSocket = require('ws');
const axios = require('axios');
const crypto = require('crypto');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const WS_URL = process.env.WS_URL || 'ws://localhost:3001';

// Statistiques globales
const stats = {
    startTime: Date.now(),
    totalOrders: 0,
    totalVolume: 0,
    totalLoans: 0,
    totalLoanVolume: 0,
    activeUsers: 0,
    messagesExchanged: 0
};

// Marchés disponibles
const MARKETS = [
    'BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ARB/USDC',
    'XRP/USDC', 'ADA/USDC', 'AVAX/USDC', 'LINK/USDC',
    'UNI/USDC', 'OP/USDC', 'INJ/USDC', 'SUI/USDC'
];

// ============================================
// CLASSE UTILISATEUR PROFESSIONNEL
// ============================================
class ProfessionalUser {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type;
        this.capital = config.capital;
        this.ws = null;
        this.connected = false;
        this.apiKey = null;
        this.marketData = {};
        this.portfolio = { USDC: config.capital * 0.4 };
        this.activeLoans = [];
        this.creditScore = 700;
        this.activityLog = [];
        this.isActive = true;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'trade': '📈',
            'loan': '💰',
            'deposit': '📥',
            'withdraw': '📤',
            'error': '❌',
            'success': '✅',
            'info': 'ℹ️'
        }[type] || '•';

        console.log(`[${timestamp}] ${prefix} [${this.name}] ${message}`);
        this.activityLog.push({ timestamp: Date.now(), message, type });
        stats.messagesExchanged++;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(WS_URL);

            this.ws.on('open', async () => {
                this.connected = true;
                stats.activeUsers++;

                // Enregistrer comme bot pour avoir une API key
                await this.registerAsBot();

                // S'abonner aux marchés
                this.subscribeToMarkets();

                this.log(`Connected to OBELISK | Capital: $${(this.capital/1000000).toFixed(1)}M`, 'success');
                resolve();
            });

            this.ws.on('message', (data) => {
                this.handleMessage(data);
            });

            this.ws.on('error', (err) => {
                this.log(`Connection error: ${err.message}`, 'error');
                reject(err);
            });

            this.ws.on('close', () => {
                this.connected = false;
                stats.activeUsers--;
            });

            setTimeout(() => {
                if (!this.connected) reject(new Error('Connection timeout'));
            }, 10000);
        });
    }

    async registerAsBot() {
        try {
            const response = await axios.post(`${API_URL}/api/bot/register`, {
                name: this.name,
                email: `${this.id}@obelisk-pro.com`,
                type: this.type
            });
            this.apiKey = response.data.apiKey;

            // Authentifier via WebSocket
            this.send({ type: 'auth', payload: { apiKey: this.apiKey } });
        } catch (e) {
            // Ignore
        }
    }

    subscribeToMarkets() {
        const channels = [];
        MARKETS.forEach(pair => {
            channels.push(`ticker:${pair}`);
            channels.push(`orderbook:${pair}`);
        });
        channels.push('all_tickers');

        this.send({ type: 'subscribe', payload: { channels } });
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
                case 'ticker':
                    this.marketData[message.pair] = message.data;
                    break;
                case 'all_tickers':
                    message.data.forEach(t => {
                        this.marketData[t.pair] = t;
                    });
                    break;
                case 'order_filled':
                    stats.totalOrders++;
                    stats.totalVolume += message.order.total;
                    break;
            }
        } catch (e) {
            // Ignore parse errors
        }
    }

    async placeOrder(pair, side, quantity, type = 'market') {
        try {
            const response = await axios.post(`${API_URL}/api/order`, {
                pair, side, type, quantity
            }, {
                headers: { 'X-API-Key': this.apiKey }
            });

            if (response.data.success) {
                const order = response.data.order;
                this.log(`${side.toUpperCase()} ${quantity.toFixed(4)} ${pair} @ $${order.executionPrice.toFixed(2)} | Total: $${order.total.toFixed(2)}`, 'trade');
                stats.totalOrders++;
                stats.totalVolume += order.total;
                return order;
            }
        } catch (e) {
            this.log(`Order failed: ${e.message}`, 'error');
        }
        return null;
    }

    async depositCollateral(token, amount) {
        try {
            const response = await axios.post(`${API_URL}/api/lending/collateral/deposit`, {
                userId: this.id, token, amount
            });

            if (response.data.success) {
                this.log(`Deposited ${amount.toFixed(4)} ${token} as collateral`, 'deposit');
                return response.data;
            }
        } catch (e) {
            this.log(`Deposit failed: ${e.message}`, 'error');
        }
        return null;
    }

    async borrow(token, amount, days) {
        try {
            const response = await axios.post(`${API_URL}/api/lending/borrow`, {
                userId: this.id, token, amount, durationDays: days
            });

            if (response.data.success) {
                const loan = response.data.loan;
                this.activeLoans.push(loan);
                stats.totalLoans++;
                stats.totalLoanVolume += loan.valueUsd;
                this.log(`Borrowed ${amount.toFixed(2)} ${token} for ${days} days | Interest: ${loan.interest.toFixed(4)} ${token}`, 'loan');
                return response.data;
            } else {
                this.log(`Borrow rejected: ${response.data.error}`, 'error');
            }
        } catch (e) {
            this.log(`Borrow failed: ${e.message}`, 'error');
        }
        return null;
    }

    async repayLoan(loanId, amount) {
        try {
            const response = await axios.post(`${API_URL}/api/lending/repay`, {
                userId: this.id, loanId, amount
            });

            if (response.data.success) {
                this.log(`Repaid ${amount.toFixed(2)} | Status: ${response.data.payment.status}`, 'success');
                if (response.data.creditScore) {
                    this.creditScore = response.data.creditScore.score;
                }
                return response.data;
            }
        } catch (e) {
            this.log(`Repay failed: ${e.message}`, 'error');
        }
        return null;
    }

    async getCreditScore() {
        try {
            const response = await axios.get(`${API_URL}/api/lending/credit/${this.id}`);
            this.creditScore = response.data.score;
            return response.data;
        } catch (e) {
            return null;
        }
    }

    disconnect() {
        this.isActive = false;
        if (this.ws) {
            this.ws.close();
        }
    }
}

// ============================================
// TYPES D'UTILISATEURS SPÉCIALISÉS
// ============================================

class InstitutionalTrader extends ProfessionalUser {
    constructor(id, subtype) {
        const configs = {
            'HEDGE_FUND': { name: `HedgeFund_${id}`, capital: 100000000 + Math.random() * 400000000 },
            'MARKET_MAKER': { name: `MarketMaker_${id}`, capital: 200000000 + Math.random() * 800000000 },
            'PROP_TRADING': { name: `PropDesk_${id}`, capital: 50000000 + Math.random() * 150000000 },
            'FAMILY_OFFICE': { name: `FamilyOffice_${id}`, capital: 20000000 + Math.random() * 80000000 }
        };

        const config = configs[subtype] || configs['HEDGE_FUND'];
        super({ id: `inst_${id}`, ...config, type: subtype });
        this.subtype = subtype;
        this.strategy = this.selectStrategy();
    }

    selectStrategy() {
        const strategies = {
            'HEDGE_FUND': ['momentum', 'arbitrage', 'mean_reversion'],
            'MARKET_MAKER': ['spread_capture', 'inventory_management'],
            'PROP_TRADING': ['scalping', 'momentum', 'statistical_arbitrage'],
            'FAMILY_OFFICE': ['long_term_value', 'diversification']
        };
        const options = strategies[this.subtype] || ['random'];
        return options[Math.floor(Math.random() * options.length)];
    }

    async runActivity() {
        while (this.isActive && this.connected) {
            await this.executeStrategy();

            // Intervalle selon le type
            const intervals = {
                'MARKET_MAKER': 200 + Math.random() * 500,
                'PROP_TRADING': 500 + Math.random() * 2000,
                'HEDGE_FUND': 2000 + Math.random() * 8000,
                'FAMILY_OFFICE': 10000 + Math.random() * 30000
            };

            await sleep(intervals[this.subtype] || 5000);
        }
    }

    async executeStrategy() {
        const pair = MARKETS[Math.floor(Math.random() * MARKETS.length)];
        const market = this.marketData[pair];
        if (!market) return;

        const sizePct = this.subtype === 'MARKET_MAKER' ? 0.0001 : 0.001;
        const quantity = (this.capital * sizePct) / market.price;

        switch (this.strategy) {
            case 'momentum':
                // Suivre la tendance
                const side = market.change24h > 0 ? 'buy' : 'sell';
                await this.placeOrder(pair, side, quantity);
                break;

            case 'spread_capture':
                // Market maker: place des ordres des deux côtés
                await this.placeOrder(pair, 'buy', quantity * 0.5);
                await this.placeOrder(pair, 'sell', quantity * 0.5);
                break;

            case 'mean_reversion':
                // Parier sur le retour à la moyenne
                const revertSide = market.change24h > 2 ? 'sell' : market.change24h < -2 ? 'buy' : null;
                if (revertSide) {
                    await this.placeOrder(pair, revertSide, quantity);
                }
                break;

            case 'scalping':
                // Petits trades rapides
                const scalpSide = Math.random() > 0.5 ? 'buy' : 'sell';
                await this.placeOrder(pair, scalpSide, quantity * 0.3);
                break;

            default:
                // Random trading
                const randomSide = Math.random() > 0.5 ? 'buy' : 'sell';
                await this.placeOrder(pair, randomSide, quantity);
        }
    }
}

class LendingUser extends ProfessionalUser {
    constructor(id, behavior) {
        const behaviors = {
            'EXCELLENT': { name: `ExcellentBorrower_${id}`, capital: 5000000, defaultRate: 0, lateRate: 0 },
            'GOOD': { name: `GoodBorrower_${id}`, capital: 2000000, defaultRate: 0, lateRate: 0.1 },
            'AVERAGE': { name: `AverageBorrower_${id}`, capital: 1000000, defaultRate: 0.05, lateRate: 0.3 },
            'RISKY': { name: `RiskyBorrower_${id}`, capital: 500000, defaultRate: 0.2, lateRate: 0.5 }
        };

        const config = behaviors[behavior] || behaviors['GOOD'];
        super({ id: `lending_${id}`, ...config, type: 'BORROWER' });
        this.behavior = behavior;
        this.defaultRate = config.defaultRate;
        this.lateRate = config.lateRate;
    }

    async runActivity() {
        while (this.isActive && this.connected) {
            await this.loanCycle();
            await sleep(15000 + Math.random() * 30000);
        }
    }

    async loanCycle() {
        // 1. Déposer du collatéral
        const collateralAmount = 0.5 + Math.random() * 2;
        await this.depositCollateral('BTC', collateralAmount);
        await sleep(1000);

        // 2. Emprunter
        const borrowAmount = 10000 + Math.random() * 40000;
        const duration = [7, 14, 30][Math.floor(Math.random() * 3)];
        const borrowResult = await this.borrow('USDC', borrowAmount, duration);

        if (!borrowResult || !borrowResult.success) return;

        const loan = borrowResult.loan;
        await sleep(2000);

        // 3. Décider du comportement de remboursement
        const roll = Math.random();

        if (roll < this.defaultRate) {
            // Default - ne pas rembourser
            this.log(`DEFAULTING on loan ${loan.id}! Collateral at risk!`, 'error');
        } else if (roll < this.defaultRate + this.lateRate) {
            // Remboursement tardif
            this.log(`Paying LATE with penalty...`, 'info');
            await this.repayLoan(loan.id, loan.totalDue * 1.02);
        } else {
            // Remboursement à temps
            this.log(`Paying on time`, 'info');
            await this.repayLoan(loan.id, loan.totalDue);
        }

        // Afficher le score de crédit
        const credit = await this.getCreditScore();
        if (credit) {
            const emoji = credit.score >= 800 ? '⭐' : credit.score >= 600 ? '✅' : '⚠️';
            this.log(`Credit Score: ${emoji} ${credit.score} (${credit.tier})`, 'info');
        }
    }
}

class RetailTrader extends ProfessionalUser {
    constructor(id) {
        super({
            id: `retail_${id}`,
            name: `Trader_${id}`,
            capital: 10000 + Math.random() * 90000,
            type: 'RETAIL'
        });
    }

    async runActivity() {
        while (this.isActive && this.connected) {
            await this.trade();
            await sleep(5000 + Math.random() * 25000);
        }
    }

    async trade() {
        const pair = MARKETS[Math.floor(Math.random() * 8)]; // Top 8 pairs only
        const market = this.marketData[pair];
        if (!market) return;

        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const quantity = (this.capital * 0.01) / market.price;

        await this.placeOrder(pair, side, quantity);
    }
}

// ============================================
// SIMULATION PRINCIPALE
// ============================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function printStats() {
    const elapsed = (Date.now() - stats.startTime) / 1000;
    const ordersPerSec = (stats.totalOrders / elapsed).toFixed(2);

    console.log('\n' + '═'.repeat(70));
    console.log('                    📊 LIVE STATISTICS');
    console.log('═'.repeat(70));
    console.log(`  Active Users:     ${stats.activeUsers}`);
    console.log(`  Total Orders:     ${stats.totalOrders} (${ordersPerSec}/s)`);
    console.log(`  Trading Volume:   $${(stats.totalVolume / 1000000).toFixed(2)}M`);
    console.log(`  Total Loans:      ${stats.totalLoans}`);
    console.log(`  Loan Volume:      $${(stats.totalLoanVolume / 1000000).toFixed(2)}M`);
    console.log(`  Messages:         ${stats.messagesExchanged}`);
    console.log(`  Runtime:          ${Math.floor(elapsed)}s`);
    console.log('═'.repeat(70) + '\n');
}

async function runFullSimulation() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║          🏛️  OBELISK DEX - FULL PROFESSIONAL SIMULATION  🏛️          ║');
    console.log('╠══════════════════════════════════════════════════════════════════════╣');
    console.log('║  Simulating a complete professional trading ecosystem                ║');
    console.log('║  • Institutional Traders (Hedge Funds, Market Makers)               ║');
    console.log('║  • Lending Users (Various credit profiles)                          ║');
    console.log('║  • Retail Traders                                                   ║');
    console.log('║  • All using REST API + WebSocket                                   ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log('');

    const users = [];

    // Créer les utilisateurs institutionnels
    console.log('🏦 Creating Institutional Traders...');
    const institutionalTypes = ['HEDGE_FUND', 'MARKET_MAKER', 'PROP_TRADING', 'FAMILY_OFFICE'];
    for (let i = 0; i < 4; i++) {
        users.push(new InstitutionalTrader(i + 1, institutionalTypes[i]));
    }

    // Créer les utilisateurs de lending
    console.log('💰 Creating Lending Users...');
    const lendingBehaviors = ['EXCELLENT', 'GOOD', 'AVERAGE', 'RISKY'];
    for (let i = 0; i < 4; i++) {
        users.push(new LendingUser(i + 1, lendingBehaviors[i]));
    }

    // Créer des traders retail
    console.log('👥 Creating Retail Traders...');
    for (let i = 0; i < 3; i++) {
        users.push(new RetailTrader(i + 1));
    }

    console.log(`\n✅ Created ${users.length} professional users\n`);

    // Connecter tous les utilisateurs avec délai
    console.log('🔌 Connecting users to OBELISK...\n');
    for (const user of users) {
        try {
            await user.connect();
            await sleep(800); // Plus de délai entre chaque connexion
        } catch (e) {
            console.error(`Failed to connect ${user.name}: ${e.message}`);
        }
    }

    console.log(`\n✅ ${stats.activeUsers}/${users.length} users connected!\n`);
    console.log('═'.repeat(70));
    console.log('                    🚀 STARTING LIVE ACTIVITY');
    console.log('═'.repeat(70));
    console.log('');

    // Démarrer les activités en parallèle
    const activityPromises = users.map(user => user.runActivity());

    // Afficher les stats périodiquement
    const statsInterval = setInterval(printStats, 15000);

    // Laisser tourner pendant la durée spécifiée
    const duration = parseInt(process.env.DURATION) || 120000;
    await sleep(duration);

    // Arrêter
    clearInterval(statsInterval);
    users.forEach(u => u.disconnect());

    // Stats finales
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                    SIMULATION COMPLETE                               ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    printStats();

    process.exit(0);
}

// Vérifier le serveur
async function checkServer() {
    try {
        const response = await axios.get(`${API_URL}/health`);
        return response.data.status === 'ok';
    } catch {
        return false;
    }
}

async function main() {
    console.log(`Checking server at ${API_URL}...`);

    if (!await checkServer()) {
        console.error('❌ Server not available. Starting server...');

        // Le serveur n'est pas démarré, on attend qu'il soit prêt
        console.log('Waiting for server to start...');
        for (let i = 0; i < 10; i++) {
            await sleep(2000);
            if (await checkServer()) {
                console.log('✅ Server is ready!');
                break;
            }
        }

        if (!await checkServer()) {
            console.error('Server failed to start. Please run: npm run ultra');
            process.exit(1);
        }
    } else {
        console.log('✅ Server is running!');
    }

    await runFullSimulation();
}

main().catch(console.error);
