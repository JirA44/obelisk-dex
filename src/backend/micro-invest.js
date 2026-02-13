/**
 * OBELISK Micro-Investment System
 * Permet d'investir à partir de 0.01 USDC
 *
 * Features:
 * - Dépôts minimum: 0.01 USDC
 * - Épargne garantie (prêts sur-collatéralisés 150%)
 * - APY dynamique basé sur l'utilisation du pool
 * - Intérêts composés automatiques
 * - Retrait instantané (si liquidité disponible)
 */

const crypto = require('crypto');

// Configuration micro-investissement
const MICRO_CONFIG = {
    // Minimum absolu
    MIN_DEPOSIT: 0.01,        // 0.01 USDC minimum
    MIN_WITHDRAW: 0.01,
    MIN_TRADE: 0.0001,        // Pour les fractions de crypto

    // Précision décimale par token
    DECIMALS: {
        USDC: 6,
        USDT: 6,
        BTC: 8,
        ETH: 18,
        SOL: 9,
        ARB: 18
    },

    // APY de base pour les épargnants (payé par les emprunteurs)
    BASE_APY: {
        USDC: 4.5,   // 4.5% APY garanti
        USDT: 4.5,
        ETH: 2.5,
        BTC: 2.0,
        SOL: 6.0,
        ARB: 8.0
    },

    // Bonus APY selon utilisation du pool
    UTILIZATION_BONUS: {
        0: 0,      // 0-50% utilisation: pas de bonus
        50: 1.0,   // 50-70%: +1% APY
        70: 2.0,   // 70-85%: +2% APY
        85: 4.0,   // 85-95%: +4% APY
        95: 8.0    // 95%+: +8% APY
    },

    // Frais
    WITHDRAWAL_FEE: 0.001,    // 0.1% frais de retrait
    INSTANT_WITHDRAWAL_FEE: 0.005, // 0.5% pour retrait instantané si pool tendu

    // Périodes de compound
    COMPOUND_INTERVAL: 3600000  // 1 heure
};

class MicroInvestSystem {
    constructor(lendingSystem) {
        this.lending = lendingSystem;

        // Wallets utilisateurs: { odre: { token: amount }}
        this.wallets = new Map();

        // Pools d'épargne par token
        this.savingsPools = {
            USDC: { totalDeposits: 0, totalBorrowed: 0, reserves: 1000000 },
            USDT: { totalDeposits: 0, totalBorrowed: 0, reserves: 500000 },
            ETH: { totalDeposits: 0, totalBorrowed: 0, reserves: 500 },
            BTC: { totalDeposits: 0, totalBorrowed: 0, reserves: 20 },
            SOL: { totalDeposits: 0, totalBorrowed: 0, reserves: 10000 },
            ARB: { totalDeposits: 0, totalBorrowed: 0, reserves: 100000 }
        };

        // Historique des dépôts/retraits pour calcul intérêts
        this.depositHistory = new Map(); // { odre: [{ token, amount, timestamp }] }

        // Intérêts accumulés par user
        this.accruedInterest = new Map(); // { odre: { token: amount } }

        // Stats globales
        this.stats = {
            totalUsers: 0,
            totalDeposited: 0,
            totalInterestPaid: 0,
            smallestDeposit: Infinity,
            avgDeposit: 0
        };

        // Démarrer le calcul des intérêts composés
        this.startCompounding();

        // Connecter au système de lending pour recevoir les liquidations
        if (this.lending) {
            this.lending.onLiquidation = (liquidation) => {
                this.distributeSeizedCollateral(liquidation);
            };
        }
    }

    // ========================================
    // DISTRIBUTION DU COLLATÉRAL AUX PRÊTEURS
    // ========================================

    distributeSeizedCollateral(liquidation) {
        console.log(`[MICRO] Distributing seized collateral from liquidation ${liquidation.id}`);

        const { seizedCollateral, debtToken, debtAmount } = liquidation;

        // Trouver tous les prêteurs qui ont déposé le token emprunté
        const lenders = [];
        let totalDeposited = 0;

        this.wallets.forEach((wallet, odre) => {
            const deposited = wallet[debtToken] || 0;
            if (deposited > 0) {
                lenders.push({ odre, deposited });
                totalDeposited += deposited;
            }
        });

        if (lenders.length === 0 || totalDeposited === 0) {
            console.log(`[MICRO] No lenders found for ${debtToken}, collateral goes to reserve`);
            // Mettre dans les réserves du pool
            Object.entries(seizedCollateral).forEach(([token, amount]) => {
                if (this.savingsPools[token]) {
                    this.savingsPools[token].reserves += amount;
                }
            });
            return;
        }

        // Distribuer proportionnellement aux prêteurs
        const distributions = [];

        Object.entries(seizedCollateral).forEach(([token, amount]) => {
            lenders.forEach(({ odre, deposited }) => {
                const share = deposited / totalDeposited;
                const reward = amount * share;

                if (reward > 0.000001) {
                    // Ajouter directement au wallet du prêteur
                    const lenderWallet = this.wallets.get(userId);
                    lenderWallet[token] = (lenderWallet[token] || 0) + reward;

                    distributions.push({
                        odre,
                        token,
                        amount: reward,
                        share: (share * 100).toFixed(2) + '%'
                    });

                    console.log(`[MICRO] ${userId} received ${reward.toFixed(6)} ${token} (${(share * 100).toFixed(2)}% share)`);
                }
            });
        });

        // Enregistrer la distribution
        this.stats.totalLiquidationsDistributed = (this.stats.totalLiquidationsDistributed || 0) + 1;

        return {
            liquidationId: liquidation.id,
            debtToken,
            debtAmount,
            seizedCollateral,
            distributions,
            lendersRewarded: lenders.length
        };
    }

    // ========================================
    // GESTION DES WALLETS
    // ========================================

    createWallet(userId) {
        if (this.wallets.has(userId)) {
            return { success: false, error: 'Wallet already exists' };
        }

        this.wallets.set(userId, {
            USDC: 0, USDT: 0, ETH: 0, BTC: 0, SOL: 0, ARB: 0
        });

        this.depositHistory.set(userId, []);
        this.accruedInterest.set(userId, {
            USDC: 0, USDT: 0, ETH: 0, BTC: 0, SOL: 0, ARB: 0
        });

        this.stats.totalUsers++;

        return {
            success: true,
            wallet: this.wallets.get(userId),
            message: 'Wallet created. Min deposit: 0.01 USDC'
        };
    }

    getWallet(userId) {
        if (!this.wallets.has(userId)) {
            this.createWallet(userId);
        }

        const wallet = this.wallets.get(userId);
        const interest = this.accruedInterest.get(userId);

        // Calculer la valeur totale en USDC
        const prices = this.lending?.prices || {
            BTC: 104000, ETH: 3900, SOL: 225, ARB: 1.85, USDC: 1, USDT: 1
        };

        let totalValue = 0;
        const balances = {};

        Object.entries(wallet).forEach(([token, amount]) => {
            const interestAmount = interest[token] || 0;
            const total = amount + interestAmount;
            balances[token] = {
                principal: this.formatAmount(amount, token),
                interest: this.formatAmount(interestAmount, token),
                total: this.formatAmount(total, token),
                valueUSDC: total * (prices[token] || 0)
            };
            totalValue += balances[token].valueUSDC;
        });

        return {
            userId,
            balances,
            totalValueUSDC: totalValue.toFixed(2),
            apyRates: this.getCurrentAPY(),
            timestamp: Date.now()
        };
    }

    // ========================================
    // DÉPÔTS & RETRAITS
    // ========================================

    deposit(userId, token, amount) {
        // Validation
        amount = parseFloat(amount);
        if (isNaN(amount) || amount < MICRO_CONFIG.MIN_DEPOSIT) {
            return {
                success: false,
                error: `Minimum deposit: ${MICRO_CONFIG.MIN_DEPOSIT} ${token}`
            };
        }

        if (!this.savingsPools[token]) {
            return { success: false, error: `Token ${token} not supported` };
        }

        // Créer wallet si n'existe pas
        if (!this.wallets.has(userId)) {
            this.createWallet(userId);
        }

        const wallet = this.wallets.get(userId);
        const formattedAmount = this.formatAmount(amount, token);

        // Ajouter au wallet
        wallet[token] = (wallet[token] || 0) + formattedAmount;

        // Ajouter au pool
        this.savingsPools[token].totalDeposits += formattedAmount;

        // Enregistrer pour calcul intérêts
        const history = this.depositHistory.get(userId);
        history.push({
            type: 'deposit',
            token,
            amount: formattedAmount,
            timestamp: Date.now(),
            apy: this.getCurrentAPY()[token]
        });

        // Stats
        this.stats.totalDeposited += formattedAmount * (token === 'USDC' || token === 'USDT' ? 1 : 0);
        if (formattedAmount < this.stats.smallestDeposit) {
            this.stats.smallestDeposit = formattedAmount;
        }

        console.log(`[MICRO] ${userId} deposited ${formattedAmount} ${token}`);

        return {
            success: true,
            deposited: formattedAmount,
            token,
            newBalance: wallet[token],
            currentAPY: this.getCurrentAPY()[token] + '%',
            message: `Deposit successful! Earning ${this.getCurrentAPY()[token]}% APY`
        };
    }

    withdraw(userId, token, amount, instant = false) {
        amount = parseFloat(amount);

        if (!this.wallets.has(userId)) {
            return { success: false, error: 'Wallet not found' };
        }

        const wallet = this.wallets.get(userId);
        const interest = this.accruedInterest.get(userId);
        const totalAvailable = (wallet[token] || 0) + (interest[token] || 0);

        if (amount > totalAvailable) {
            return {
                success: false,
                error: `Insufficient balance. Available: ${totalAvailable} ${token}`
            };
        }

        // Vérifier liquidité du pool
        const pool = this.savingsPools[token];
        const availableLiquidity = pool.reserves + pool.totalDeposits - pool.totalBorrowed;

        if (amount > availableLiquidity) {
            if (instant) {
                return {
                    success: false,
                    error: `Pool liquidity too low. Max available: ${availableLiquidity.toFixed(4)} ${token}`
                };
            }
            // Mettre en queue pour retrait différé
            return this.queueWithdrawal(userId, token, amount);
        }

        // Calculer frais
        const feeRate = instant && (pool.totalBorrowed / pool.totalDeposits > 0.8)
            ? MICRO_CONFIG.INSTANT_WITHDRAWAL_FEE
            : MICRO_CONFIG.WITHDRAWAL_FEE;
        const fee = amount * feeRate;
        const netAmount = amount - fee;

        // D'abord utiliser les intérêts, puis le principal
        let remaining = amount;
        if (interest[token] > 0) {
            const fromInterest = Math.min(interest[token], remaining);
            interest[token] -= fromInterest;
            remaining -= fromInterest;
        }
        if (remaining > 0) {
            wallet[token] -= remaining;
            pool.totalDeposits -= remaining;
        }

        // Historique
        const history = this.depositHistory.get(userId);
        history.push({
            type: 'withdrawal',
            token,
            amount: netAmount,
            fee,
            timestamp: Date.now()
        });

        console.log(`[MICRO] ${userId} withdrew ${netAmount} ${token} (fee: ${fee})`);

        return {
            success: true,
            withdrawn: netAmount,
            fee,
            token,
            newBalance: wallet[token] + interest[token],
            message: `Withdrawal successful!`
        };
    }

    queueWithdrawal(userId, token, amount) {
        // Pour les gros retraits quand la liquidité est basse
        return {
            success: true,
            queued: true,
            amount,
            token,
            estimatedTime: '24-48 hours',
            message: 'Withdrawal queued. You will be notified when processed.'
        };
    }

    // ========================================
    // CALCUL DES INTÉRÊTS
    // ========================================

    getCurrentAPY() {
        const rates = {};

        Object.entries(this.savingsPools).forEach(([token, pool]) => {
            const baseRate = MICRO_CONFIG.BASE_APY[token] || 3;

            // Calcul utilisation
            const utilization = pool.totalDeposits > 0
                ? (pool.totalBorrowed / pool.totalDeposits) * 100
                : 0;

            // Bonus selon utilisation
            let bonus = 0;
            for (const [threshold, rate] of Object.entries(MICRO_CONFIG.UTILIZATION_BONUS).reverse()) {
                if (utilization >= parseInt(threshold)) {
                    bonus = rate;
                    break;
                }
            }

            rates[token] = parseFloat((baseRate + bonus).toFixed(2));
        });

        return rates;
    }

    calculateInterest(principal, apy, timeMs) {
        // Intérêt composé: A = P(1 + r/n)^(nt)
        const n = 8760; // Compound hourly (365 * 24)
        const t = timeMs / (365 * 24 * 60 * 60 * 1000); // Temps en années
        const r = apy / 100;

        return principal * (Math.pow(1 + r/n, n*t) - 1);
    }

    compoundAllInterests() {
        const currentAPY = this.getCurrentAPY();
        const now = Date.now();

        this.wallets.forEach((wallet, odre) => {
            const interest = this.accruedInterest.get(userId);
            const history = this.depositHistory.get(userId);

            Object.entries(wallet).forEach(([token, balance]) => {
                if (balance > 0) {
                    // Trouver le dernier événement pour ce token
                    const lastEvent = [...history]
                        .reverse()
                        .find(h => h.token === token);

                    const lastTimestamp = lastEvent?.timestamp || now - MICRO_CONFIG.COMPOUND_INTERVAL;
                    const timeSinceLast = now - lastTimestamp;

                    // Calculer intérêts sur le principal + intérêts précédents
                    const totalPrincipal = balance + (interest[token] || 0);
                    const newInterest = this.calculateInterest(
                        totalPrincipal,
                        currentAPY[token],
                        timeSinceLast
                    );

                    if (newInterest > 0.000001) { // Seulement si significatif
                        interest[token] = (interest[token] || 0) + newInterest;
                        this.stats.totalInterestPaid += newInterest * (token === 'USDC' ? 1 : 0);
                    }
                }
            });
        });

        console.log(`[MICRO] Compounded interests for ${this.wallets.size} wallets`);
    }

    startCompounding() {
        setInterval(() => {
            this.compoundAllInterests();
        }, MICRO_CONFIG.COMPOUND_INTERVAL);
    }

    // ========================================
    // MICRO-TRADING
    // ========================================

    trade(userId, fromToken, toToken, amount, prices) {
        amount = parseFloat(amount);

        if (amount < MICRO_CONFIG.MIN_TRADE) {
            return {
                success: false,
                error: `Minimum trade: ${MICRO_CONFIG.MIN_TRADE}`
            };
        }

        if (!this.wallets.has(userId)) {
            return { success: false, error: 'Wallet not found' };
        }

        const wallet = this.wallets.get(userId);
        const interest = this.accruedInterest.get(userId);
        const totalFrom = (wallet[fromToken] || 0) + (interest[fromToken] || 0);

        if (amount > totalFrom) {
            return { success: false, error: 'Insufficient balance' };
        }

        // Calcul du montant reçu
        const fromPrice = prices[fromToken] || 1;
        const toPrice = prices[toToken] || 1;
        const valueUSD = amount * fromPrice;
        const received = valueUSD / toPrice;

        // Frais de trading: 0.1%
        const fee = received * 0.001;
        const netReceived = received - fee;

        // Déduire
        let remaining = amount;
        if (interest[fromToken] > 0) {
            const fromInterest = Math.min(interest[fromToken], remaining);
            interest[fromToken] -= fromInterest;
            remaining -= fromInterest;
        }
        wallet[fromToken] -= remaining;

        // Ajouter
        wallet[toToken] = (wallet[toToken] || 0) + netReceived;

        return {
            success: true,
            sold: { amount, token: fromToken },
            bought: { amount: netReceived, token: toToken },
            fee: { amount: fee, token: toToken },
            rate: `1 ${fromToken} = ${(fromPrice/toPrice).toFixed(8)} ${toToken}`
        };
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    formatAmount(amount, token) {
        const decimals = MICRO_CONFIG.DECIMALS[token] || 8;
        return parseFloat(amount.toFixed(decimals));
    }

    getPoolStats() {
        const pools = {};
        const currentAPY = this.getCurrentAPY();

        Object.entries(this.savingsPools).forEach(([token, pool]) => {
            const utilization = pool.totalDeposits > 0
                ? ((pool.totalBorrowed / pool.totalDeposits) * 100).toFixed(2)
                : 0;

            pools[token] = {
                totalDeposited: pool.totalDeposits,
                totalBorrowed: pool.totalBorrowed,
                reserves: pool.reserves,
                availableLiquidity: pool.reserves + pool.totalDeposits - pool.totalBorrowed,
                utilization: utilization + '%',
                currentAPY: currentAPY[token] + '%'
            };
        });

        return {
            pools,
            globalStats: this.stats,
            minDeposit: MICRO_CONFIG.MIN_DEPOSIT + ' USDC',
            timestamp: Date.now()
        };
    }

    getLeaderboard(limit = 10) {
        const users = [];

        const prices = this.lending?.prices || {
            BTC: 104000, ETH: 3900, SOL: 225, ARB: 1.85, USDC: 1, USDT: 1
        };

        this.wallets.forEach((wallet, odre) => {
            const interest = this.accruedInterest.get(userId);
            let totalValue = 0;
            let totalInterest = 0;

            Object.entries(wallet).forEach(([token, amount]) => {
                const interestAmt = interest[token] || 0;
                totalValue += (amount + interestAmt) * (prices[token] || 0);
                totalInterest += interestAmt * (prices[token] || 0);
            });

            users.push({
                odre,
                totalValue,
                totalInterest,
                roi: totalValue > 0 ? ((totalInterest / (totalValue - totalInterest)) * 100).toFixed(2) + '%' : '0%'
            });
        });

        return users
            .sort((a, b) => b.totalValue - a.totalValue)
            .slice(0, limit)
            .map((u, i) => ({ rank: i + 1, ...u }));
    }
}

module.exports = { MicroInvestSystem, MICRO_CONFIG };
