/**
 * OBELISK User Profile Simulator
 * Simule différents profils d'utilisateurs avec comportements variés
 *
 * Usage: node user-profiles.js [--users=20] [--max-memory=128]
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, val] = arg.replace('--', '').split('=');
    acc[key] = val;
    return acc;
}, {});

const MAX_USERS = parseInt(args['users']) || 20;
const MAX_MEMORY_MB = parseInt(args['max-memory']) || 128;

// ═══════════════════════════════════════════════════════════════
// PROFILS UTILISATEURS
// ═══════════════════════════════════════════════════════════════

const USER_PROFILES = {
    // 💎 HODLER - Achète et garde longtemps
    HODLER: {
        icon: '💎',
        name: 'HODLer',
        description: 'Buy and hold forever',
        initialDeposit: { min: 100, max: 10000 },
        activity: {
            depositFrequency: 604800000,  // 1x par semaine (simulé en secondes)
            tradeFrequency: 2592000000,   // 1x par mois
            withdrawFrequency: null,       // Never
            checkBalanceFrequency: 86400000
        },
        behavior: {
            onlyBuys: true,
            preferredTokens: ['BTC', 'ETH'],
            usesLending: false,
            usesSavings: true,
            panicSells: false
        },
        weight: 15  // 15% des users
    },

    // 📈 DAY_TRADER - Trade actif tous les jours
    DAY_TRADER: {
        icon: '📈',
        name: 'Day Trader',
        description: 'Active daily trading',
        initialDeposit: { min: 1000, max: 50000 },
        activity: {
            depositFrequency: 86400000,
            tradeFrequency: 5000,          // Très fréquent
            withdrawFrequency: 604800000,
            checkBalanceFrequency: 60000
        },
        behavior: {
            onlyBuys: false,
            preferredTokens: ['BTC', 'ETH', 'SOL', 'ARB'],
            usesLending: true,
            usesSavings: false,
            panicSells: true,
            followsTrends: true
        },
        weight: 10
    },

    // 🌾 YIELD_FARMER - Maximise les rendements
    YIELD_FARMER: {
        icon: '🌾',
        name: 'Yield Farmer',
        description: 'Maximizes APY returns',
        initialDeposit: { min: 500, max: 100000 },
        activity: {
            depositFrequency: 43200000,    // 2x par jour
            tradeFrequency: 3600000,       // Rebalance toutes les heures
            withdrawFrequency: 604800000,
            checkBalanceFrequency: 300000
        },
        behavior: {
            onlyBuys: false,
            preferredTokens: ['USDC', 'ETH', 'SOL', 'ARB'],
            usesLending: true,
            usesSavings: true,
            optimizesAPY: true,
            movesToHighestYield: true
        },
        weight: 12
    },

    // 🎰 DEGEN - Trading risqué, gros leverage
    DEGEN: {
        icon: '🎰',
        name: 'Degen Trader',
        description: 'High risk, high reward',
        initialDeposit: { min: 50, max: 5000 },
        activity: {
            depositFrequency: 3600000,
            tradeFrequency: 2000,
            withdrawFrequency: 86400000,
            checkBalanceFrequency: 30000
        },
        behavior: {
            onlyBuys: false,
            preferredTokens: ['SOL', 'ARB', 'WIF', 'BONK', 'INJ'],
            usesLending: true,
            usesSavings: false,
            maxLeverage: true,
            chasesVolatility: true,
            panicSells: true
        },
        weight: 8
    },

    // 👶 NEWBIE - Débutant prudent
    NEWBIE: {
        icon: '👶',
        name: 'Crypto Newbie',
        description: 'Learning the ropes',
        initialDeposit: { min: 10, max: 500 },
        activity: {
            depositFrequency: 604800000,
            tradeFrequency: 86400000,
            withdrawFrequency: 2592000000,
            checkBalanceFrequency: 3600000
        },
        behavior: {
            onlyBuys: true,
            preferredTokens: ['BTC', 'ETH'],
            usesLending: false,
            usesSavings: true,
            smallAmounts: true,
            copiesOthers: true
        },
        weight: 20
    },

    // 🐋 WHALE - Gros investisseur
    WHALE: {
        icon: '🐋',
        name: 'Whale',
        description: 'Large capital investor',
        initialDeposit: { min: 100000, max: 10000000 },
        activity: {
            depositFrequency: 2592000000,
            tradeFrequency: 60000,
            withdrawFrequency: 2592000000,
            checkBalanceFrequency: 300000
        },
        behavior: {
            onlyBuys: false,
            preferredTokens: ['BTC', 'ETH', 'SOL'],
            usesLending: true,
            usesSavings: true,
            movesMarkets: true,
            splitsOrders: true
        },
        weight: 2
    },

    // 💼 SALARYMAN - DCA régulier
    SALARYMAN: {
        icon: '💼',
        name: 'Salary DCA',
        description: 'Regular paycheck investor',
        initialDeposit: { min: 100, max: 2000 },
        activity: {
            depositFrequency: 2592000000,  // Mensuel
            tradeFrequency: 2592000000,    // DCA mensuel
            withdrawFrequency: null,
            checkBalanceFrequency: 604800000
        },
        behavior: {
            onlyBuys: true,
            preferredTokens: ['BTC', 'ETH'],
            usesLending: false,
            usesSavings: true,
            fixedAmounts: true,
            ignoresPrice: true
        },
        weight: 18
    },

    // 🔄 ARBITRAGEUR - Cherche les opportunités
    ARBITRAGEUR: {
        icon: '🔄',
        name: 'Arbitrageur',
        description: 'Exploits price differences',
        initialDeposit: { min: 5000, max: 500000 },
        activity: {
            depositFrequency: 86400000,
            tradeFrequency: 500,
            withdrawFrequency: 86400000,
            checkBalanceFrequency: 1000
        },
        behavior: {
            onlyBuys: false,
            preferredTokens: ['BTC', 'ETH', 'SOL', 'USDC'],
            usesLending: false,
            usesSavings: false,
            watchesSpreads: true,
            fastExecution: true
        },
        weight: 5
    },

    // 🏦 LENDER - Prête pour les intérêts
    LENDER: {
        icon: '🏦',
        name: 'Passive Lender',
        description: 'Earns from lending',
        initialDeposit: { min: 1000, max: 500000 },
        activity: {
            depositFrequency: 604800000,
            tradeFrequency: null,
            withdrawFrequency: 2592000000,
            checkBalanceFrequency: 86400000
        },
        behavior: {
            onlyBuys: false,
            preferredTokens: ['USDC', 'USDT', 'ETH'],
            usesLending: true,
            usesSavings: true,
            neverTrades: true,
            compoundsInterest: true
        },
        weight: 10
    }
};

// ═══════════════════════════════════════════════════════════════
// SIMULATEUR D'UTILISATEUR
// ═══════════════════════════════════════════════════════════════

class SimulatedUser {
    constructor(id, profileType) {
        this.id = `user_${profileType.toLowerCase()}_${id}`;
        this.profile = USER_PROFILES[profileType];
        this.type = profileType;

        // Générer capital initial
        const { min, max } = this.profile.initialDeposit;
        this.initialDeposit = min + Math.random() * (max - min);

        // État
        this.wallet = { USDC: 0 };
        this.totalDeposited = 0;
        this.totalWithdrawn = 0;
        this.trades = 0;
        this.pnl = 0;
        this.lastActions = {
            deposit: 0,
            trade: 0,
            withdraw: 0,
            checkBalance: 0
        };
        this.active = true;
        this.created = Date.now();
    }

    // Simuler les intervalles (accéléré x1000 pour la démo)
    getSimulatedInterval(realInterval) {
        if (!realInterval) return null;
        return Math.max(1000, realInterval / 1000);  // Min 1 seconde
    }

    shouldDoAction(actionType) {
        const interval = this.getSimulatedInterval(this.profile.activity[`${actionType}Frequency`]);
        if (!interval) return false;
        return Date.now() - this.lastActions[actionType] >= interval;
    }

    async doDeposit() {
        if (!this.shouldDoAction('deposit')) return null;

        let amount;
        if (this.totalDeposited === 0) {
            amount = this.initialDeposit;
        } else {
            // Dépôts suivants = 10-50% du dépôt initial
            amount = this.initialDeposit * (0.1 + Math.random() * 0.4);
        }

        try {
            const res = await fetch(`${API_URL}/api/micro/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.id,
                    token: 'USDC',
                    amount: amount.toFixed(2)
                })
            });
            const data = await res.json();

            if (data.success) {
                this.totalDeposited += amount;
                this.lastActions.deposit = Date.now();
                return { action: 'DEPOSIT', amount: amount.toFixed(2), token: 'USDC' };
            }
        } catch (e) {}
        return null;
    }

    async doTrade(prices) {
        if (!this.shouldDoAction('trade')) return null;
        if (this.profile.behavior.neverTrades) return null;

        const tokens = this.profile.behavior.preferredTokens;
        const token = tokens[Math.floor(Math.random() * tokens.length)];

        // Décider buy/sell
        let side = 'buy';
        if (!this.profile.behavior.onlyBuys) {
            if (this.profile.behavior.panicSells && prices[`${token}/USDC`]?.change24h < -5) {
                side = 'sell';
            } else if (this.profile.behavior.followsTrends && prices[`${token}/USDC`]?.change24h > 2) {
                side = 'buy';
            } else {
                side = Math.random() > 0.5 ? 'buy' : 'sell';
            }
        }

        // Montant basé sur le profil
        let amount;
        if (this.profile.behavior.smallAmounts) {
            amount = 0.01 + Math.random() * 0.1;
        } else if (this.profile.behavior.splitsOrders) {
            amount = (this.totalDeposited * 0.01) / (prices[`${token}/USDC`]?.price || 1);
        } else {
            amount = 0.1 + Math.random() * 2;
        }

        try {
            const res = await fetch(`${API_URL}/api/micro/trade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.id,
                    fromToken: side === 'buy' ? 'USDC' : token,
                    toToken: side === 'buy' ? token : 'USDC',
                    amount: amount.toFixed(6)
                })
            });
            const data = await res.json();

            if (data.success) {
                this.trades++;
                this.lastActions.trade = Date.now();
                return { action: side.toUpperCase(), amount: amount.toFixed(4), token };
            }
        } catch (e) {}
        return null;
    }

    async doWithdraw() {
        if (!this.shouldDoAction('withdraw')) return null;
        if (this.totalDeposited === 0) return null;

        // Retirer 10-30% du total
        const amount = this.totalDeposited * (0.1 + Math.random() * 0.2);

        try {
            const res = await fetch(`${API_URL}/api/micro/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.id,
                    token: 'USDC',
                    amount: amount.toFixed(2)
                })
            });
            const data = await res.json();

            if (data.success) {
                this.totalWithdrawn += data.withdrawn;
                this.lastActions.withdraw = Date.now();
                return { action: 'WITHDRAW', amount: data.withdrawn.toFixed(2), token: 'USDC' };
            }
        } catch (e) {}
        return null;
    }

    async checkBalance() {
        if (!this.shouldDoAction('checkBalance')) return null;

        try {
            const res = await fetch(`${API_URL}/api/micro/wallet/${this.id}`);
            const data = await res.json();
            this.wallet = data.balances || {};
            this.lastActions.checkBalance = Date.now();
            return { action: 'CHECK', balance: data.totalValueUSDC };
        } catch (e) {}
        return null;
    }

    getStats() {
        return {
            id: this.id,
            type: this.type,
            icon: this.profile.icon,
            deposited: this.totalDeposited.toFixed(2),
            withdrawn: this.totalWithdrawn.toFixed(2),
            trades: this.trades,
            active: this.active
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// GESTIONNAIRE DE SIMULATION
// ═══════════════════════════════════════════════════════════════

class UserSimulator {
    constructor() {
        this.users = [];
        this.running = false;
        this.priceCache = {};
        this.stats = {
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalTrades: 0,
            actions: 0
        };
    }

    getMemoryMB() {
        return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    }

    // Créer les utilisateurs selon les poids
    initUsers() {
        const totalWeight = Object.values(USER_PROFILES).reduce((sum, p) => sum + p.weight, 0);
        let id = 0;

        for (const [type, profile] of Object.entries(USER_PROFILES)) {
            const count = Math.max(1, Math.round((profile.weight / totalWeight) * MAX_USERS));

            for (let i = 0; i < count && this.users.length < MAX_USERS; i++) {
                this.users.push(new SimulatedUser(++id, type));
            }
        }

        console.log(`[INIT] Created ${this.users.length} simulated users`);

        // Afficher distribution
        const dist = {};
        this.users.forEach(u => {
            dist[u.type] = (dist[u.type] || 0) + 1;
        });
        console.log('[DISTRIBUTION]', dist);
    }

    async fetchPrices() {
        try {
            const res = await fetch(`${API_URL}/api/tickers`);
            const data = await res.json();
            this.priceCache = data.tickers || {};
        } catch (e) {}
        return this.priceCache;
    }

    async processUser(user) {
        const prices = this.priceCache;

        // Essayer chaque action possible
        let result = await user.doDeposit();
        if (result) {
            this.stats.totalDeposits += parseFloat(result.amount);
            this.stats.actions++;
            return { user, result };
        }

        result = await user.doTrade(prices);
        if (result) {
            this.stats.totalTrades++;
            this.stats.actions++;
            return { user, result };
        }

        result = await user.doWithdraw();
        if (result) {
            this.stats.totalWithdrawals += parseFloat(result.amount);
            this.stats.actions++;
            return { user, result };
        }

        await user.checkBalance();
        return null;
    }

    printStatus() {
        const mem = this.getMemoryMB();
        const uptime = Math.round((Date.now() - this.startTime) / 1000);

        // Compter par type
        const byType = {};
        this.users.forEach(u => {
            if (!byType[u.type]) byType[u.type] = { count: 0, deposits: 0, trades: 0 };
            byType[u.type].count++;
            byType[u.type].deposits += u.totalDeposited;
            byType[u.type].trades += u.trades;
        });

        console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  👥 USER PROFILE SIMULATOR                                        ║
╠═══════════════════════════════════════════════════════════════════╣
║  Users: ${this.users.length.toString().padEnd(4)} │ Actions: ${this.stats.actions.toString().padEnd(6)} │ RAM: ${mem}MB/${MAX_MEMORY_MB}MB     ║
║  Deposits: $${this.stats.totalDeposits.toFixed(0).padEnd(8)} │ Trades: ${this.stats.totalTrades.toString().padEnd(5)} │ Uptime: ${uptime}s  ║
╠═══════════════════════════════════════════════════════════════════╣`);

        for (const [type, data] of Object.entries(byType)) {
            const profile = USER_PROFILES[type];
            console.log(`║  ${profile.icon} ${type.padEnd(12)} │ ${data.count} users │ $${data.deposits.toFixed(0).padEnd(8)} │ ${data.trades} trades  ║`);
        }

        console.log(`╚═══════════════════════════════════════════════════════════════════╝`);
    }

    async start() {
        console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  👥 OBELISK USER PROFILE SIMULATOR                                ║
║  Simulating ${MAX_USERS} users with different behaviors                    ║
╚═══════════════════════════════════════════════════════════════════╝
`);

        this.initUsers();
        this.running = true;
        this.startTime = Date.now();

        // Fetch prices régulièrement
        setInterval(() => this.fetchPrices(), 2000);
        await this.fetchPrices();

        // Process users
        const loop = setInterval(async () => {
            if (this.getMemoryMB() > MAX_MEMORY_MB * 0.9) {
                if (global.gc) global.gc();
                return;
            }

            // Process 3 users par tick
            const batch = this.users
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            for (const user of batch) {
                const result = await this.processUser(user);
                if (result) {
                    const { user: u, result: r } = result;
                    console.log(`[${u.profile.icon} ${u.type}] ${r.action} ${r.amount || ''} ${r.token || ''} ${r.balance ? '($' + r.balance + ')' : ''}`);
                }
                await new Promise(r => setTimeout(r, 100));
            }
        }, 500);

        // Status toutes les 30s
        setInterval(() => this.printStatus(), 30000);
        setTimeout(() => this.printStatus(), 5000);

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n[SHUTDOWN] Stopping simulation...');
            clearInterval(loop);
            this.printStatus();
            process.exit(0);
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// LANCEMENT
// ═══════════════════════════════════════════════════════════════

const simulator = new UserSimulator();
simulator.start();
