/**
 * OBELISK Lending System
 * Système de prêt collatéralisé
 *
 * Règles:
 * 1. L'utilisateur doit d'abord déposer un collatéral
 * 2. Le prêt maximum = valeur_collatéral / ratio_collatéralisation
 * 3. Si l'utilisateur ne rembourse pas à temps, le collatéral est saisi
 * 4. Liquidation automatique si le ratio tombe sous le seuil
 */

const crypto = require('crypto');

// Configuration du système de prêt
const LENDING_CONFIG = {
    // Ratio de collatéralisation minimum (150% = 1.5)
    MIN_COLLATERAL_RATIO: 1.0,

    // Ratio de liquidation (120% = 1.2)
    LIQUIDATION_RATIO: 0.95,

    // Taux d'intérêt annuel par token (en %)
    INTEREST_RATES: {
        USDC: 5.0,    // 5% APY pour emprunter USDC
        USDT: 5.0,
        ETH: 3.0,     // 3% APY pour emprunter ETH
        BTC: 2.5,     // 2.5% APY pour emprunter BTC
        SOL: 8.0,     // 8% APY pour emprunter SOL
        ARB: 10.0
    },

    // Facteurs de collatéral (LTV - Loan to Value)
    COLLATERAL_FACTORS: {
        BTC: 1.0,    // BTC peut garantir 75% de sa valeur
        ETH: 1.0,
        SOL: 1.0,
        ARB: 1.0,
        AVAX: 1.0,
        LINK: 1.0,
        UNI: 1.0,
        USDC: 1.0,   // Stablecoins ont un meilleur ratio
        USDT: 1.0
    },

    // Durées de prêt disponibles (en jours)
    LOAN_DURATIONS: [7, 14, 30, 60, 90],

    // Frais de liquidation (0.1%)
    LIQUIDATION_FEE: 0.05,

    // Pénalité de retard par jour (0.5%)
    LATE_PENALTY_PER_DAY: 0.005
};

// Credit score tiers
const CREDIT_TIERS = {
    AAA: { min: 900, max: 1000, label: 'Excellent', interestDiscount: 0.30, maxLTV: 1.0 },
    AA:  { min: 800, max: 899, label: 'Very Good', interestDiscount: 0.20, maxLTV: 1.0 },
    A:   { min: 700, max: 799, label: 'Good', interestDiscount: 0.10, maxLTV: 1.0 },
    BBB: { min: 600, max: 699, label: 'Fair', interestDiscount: 0.00, maxLTV: 1.0 },
    BB:  { min: 500, max: 599, label: 'Below Average', interestDiscount: -0.10, maxLTV: 1.0 },
    B:   { min: 400, max: 499, label: 'Poor', interestDiscount: -0.25, maxLTV: 1.0 },
    CCC: { min: 300, max: 399, label: 'Very Poor', interestDiscount: -0.50, maxLTV: 1.0 },
    D:   { min: 0, max: 299, label: 'Default Risk', interestDiscount: -1.00, maxLTV: 1.0 }
};

class LendingSystem {
    constructor() {
        // Collatéraux déposés: { userId: { tokenSymbol: amount } }
        this.collaterals = new Map();

        // Prêts actifs: { loanId: LoanData }
        this.loans = new Map();

        // Credit scores (réputation): { userId: CreditData }
        this.creditScores = new Map();

        // Pool de liquidité disponible pour les prêts
        this.liquidityPool = {
            USDC: 50000000,  // $50M
            USDT: 30000000,
            ETH: 5000,       // 5000 ETH
            BTC: 200,        // 200 BTC
            SOL: 100000
        };

        // Historique des liquidations
        this.liquidations = [];

        // Prix actuels (mis à jour depuis le serveur)
        this.prices = {};

        // Callback pour distribuer aux prêteurs (set by MicroInvestSystem)
        this.onLiquidation = null;

        // Intérêts collectés
        this.totalInterestCollected = 0;
    }

    // ========================================
    // SYSTÈME DE RÉPUTATION / CRÉDIT
    // ========================================

    initCreditScore(userId) {
        if (!this.creditScores.has(userId)) {
            this.creditScores.set(userId, {
                score: 700, // Score initial: "Good"
                loansCompleted: 0,
                loansDefaulted: 0,
                totalBorrowed: 0,
                totalRepaid: 0,
                onTimePayments: 0,
                latePayments: 0,
                liquidations: 0,
                history: [],
                lastUpdated: Date.now()
            });
        }
        return this.creditScores.get(userId);
    }

    getCreditScore(userId) {
        return this.initCreditScore(userId);
    }

    getCreditTier(userId) {
        const credit = this.getCreditScore(userId);
        for (const [tier, config] of Object.entries(CREDIT_TIERS)) {
            if (credit.score >= config.min && credit.score <= config.max) {
                return { tier, ...config, score: credit.score };
            }
        }
        return { tier: 'D', ...CREDIT_TIERS.D, score: credit.score };
    }

    // Mettre à jour le score après un événement
    updateCreditScore(userId, event, details = {}) {
        const credit = this.initCreditScore(userId);
        let scoreChange = 0;
        let reason = '';

        switch (event) {
            case 'LOAN_REPAID_ON_TIME':
                scoreChange = 15 + Math.min(10, credit.loansCompleted * 2);
                reason = 'Loan repaid on time';
                credit.loansCompleted++;
                credit.onTimePayments++;
                break;

            case 'LOAN_REPAID_EARLY':
                scoreChange = 25;
                reason = 'Loan repaid early';
                credit.loansCompleted++;
                credit.onTimePayments++;
                break;

            case 'LOAN_REPAID_LATE':
                const daysLate = details.daysLate || 1;
                scoreChange = -10 - (daysLate * 2);
                reason = `Loan repaid ${daysLate} days late`;
                credit.loansCompleted++;
                credit.latePayments++;
                break;

            case 'LOAN_LIQUIDATED':
                scoreChange = -100;
                reason = 'Loan liquidated - collateral seized';
                credit.loansDefaulted++;
                credit.liquidations++;
                break;

            case 'COLLATERAL_ADDED':
                scoreChange = 5;
                reason = 'Additional collateral deposited';
                break;

            case 'LARGE_LOAN_SUCCESS':
                scoreChange = 20;
                reason = 'Successfully repaid large loan';
                break;

            case 'CONSISTENT_HISTORY':
                if (credit.loansCompleted >= 5 && credit.latePayments === 0) {
                    scoreChange = 30;
                    reason = 'Perfect payment history bonus';
                }
                break;

            case 'ACCOUNT_AGE_BONUS':
                scoreChange = 10;
                reason = 'Account age bonus';
                break;
        }

        // Appliquer le changement avec limites
        const oldScore = credit.score;
        credit.score = Math.max(0, Math.min(1000, credit.score + scoreChange));
        credit.lastUpdated = Date.now();

        // Historique
        credit.history.push({
            event,
            reason,
            scoreChange,
            oldScore,
            newScore: credit.score,
            timestamp: Date.now(),
            details
        });

        // Garder seulement les 50 derniers événements
        if (credit.history.length > 50) {
            credit.history = credit.history.slice(-50);
        }

        console.log(`[CREDIT] ${userId}: ${oldScore} -> ${credit.score} (${scoreChange >= 0 ? '+' : ''}${scoreChange}) - ${reason}`);

        return {
            oldScore,
            newScore: credit.score,
            change: scoreChange,
            reason,
            tier: this.getCreditTier(userId)
        };
    }

    // Calculer le taux d'intérêt ajusté selon le crédit
    getAdjustedInterestRate(userId, baseRate) {
        const tier = this.getCreditTier(userId);
        const adjustment = baseRate * tier.interestDiscount;
        return Math.max(1, baseRate - adjustment); // Minimum 1% APR
    }

    // Calculer le LTV maximum selon le crédit
    getMaxLTV(userId) {
        const tier = this.getCreditTier(userId);
        return tier.maxLTV;
    }

    getCreditSummary(userId) {
        const credit = this.getCreditScore(userId);
        const tier = this.getCreditTier(userId);

        return {
            score: credit.score,
            tier: tier.tier,
            tierLabel: tier.label,
            interestDiscount: `${(tier.interestDiscount * 100).toFixed(0)}%`,
            maxLTV: `${(tier.maxLTV * 100).toFixed(0)}%`,
            stats: {
                loansCompleted: credit.loansCompleted,
                loansDefaulted: credit.loansDefaulted,
                onTimePayments: credit.onTimePayments,
                latePayments: credit.latePayments,
                liquidations: credit.liquidations,
                paymentRatio: credit.loansCompleted > 0
                    ? ((credit.onTimePayments / credit.loansCompleted) * 100).toFixed(1) + '%'
                    : 'N/A'
            },
            recentHistory: credit.history.slice(-10)
        };
    }

    // Mettre à jour les prix depuis le marché
    updatePrices(marketData) {
        Object.entries(marketData).forEach(([pair, data]) => {
            const [base, quote] = pair.split('/');
            if (quote === 'USDC' || quote === 'USDT') {
                this.prices[base] = data.price;
            }
        });
        this.prices.USDC = 1;
        this.prices.USDT = 1;
    }

    // Obtenir le prix d'un token en USD
    getPrice(symbol) {
        return this.prices[symbol] || 0;
    }

    // ========================================
    // DÉPÔT DE COLLATÉRAL
    // ========================================

    depositCollateral(userId, tokenSymbol, amount) {
        if (amount <= 0) {
            return { success: false, error: 'Amount must be positive' };
        }

        if (!LENDING_CONFIG.COLLATERAL_FACTORS[tokenSymbol]) {
            return { success: false, error: 'Token not accepted as collateral' };
        }

        if (!this.collaterals.has(userId)) {
            this.collaterals.set(userId, {});
        }

        const userCollateral = this.collaterals.get(userId);
        userCollateral[tokenSymbol] = (userCollateral[tokenSymbol] || 0) + amount;

        const valueUsd = amount * this.getPrice(tokenSymbol);

        console.log(`[LENDING] ${userId} deposited ${amount} ${tokenSymbol} ($${valueUsd.toFixed(2)}) as collateral`);

        return {
            success: true,
            deposit: {
                id: 'DEP_' + Date.now(),
                userId,
                token: tokenSymbol,
                amount,
                valueUsd,
                timestamp: Date.now()
            },
            totalCollateral: this.getUserCollateralValue(userId),
            borrowingPower: this.getBorrowingPower(userId)
        };
    }

    // Retirer du collatéral (si pas utilisé pour un prêt)
    withdrawCollateral(userId, tokenSymbol, amount) {
        const userCollateral = this.collaterals.get(userId);
        if (!userCollateral || !userCollateral[tokenSymbol] || userCollateral[tokenSymbol] < amount) {
            return { success: false, error: 'Insufficient collateral balance' };
        }

        // Vérifier que le retrait ne mettrait pas les prêts en danger
        const currentValue = this.getUserCollateralValue(userId);
        const withdrawValue = amount * this.getPrice(tokenSymbol);
        const afterWithdraw = currentValue - withdrawValue;

        const totalBorrowed = this.getUserTotalBorrowed(userId);
        const requiredCollateral = totalBorrowed * LENDING_CONFIG.MIN_COLLATERAL_RATIO;

        if (afterWithdraw < requiredCollateral) {
            return {
                success: false,
                error: 'Cannot withdraw: would breach collateral ratio',
                currentRatio: currentValue / totalBorrowed,
                minRequired: LENDING_CONFIG.MIN_COLLATERAL_RATIO
            };
        }

        userCollateral[tokenSymbol] -= amount;

        return {
            success: true,
            withdrawal: {
                id: 'WTH_' + Date.now(),
                userId,
                token: tokenSymbol,
                amount,
                valueUsd: withdrawValue,
                timestamp: Date.now()
            },
            remainingCollateral: this.getUserCollateralValue(userId)
        };
    }

    // ========================================
    // EMPRUNT
    // ========================================

    borrow(userId, tokenSymbol, amount, durationDays) {
        // Vérifications
        if (amount <= 0) {
            return { success: false, error: 'Amount must be positive' };
        }

        if (!LENDING_CONFIG.LOAN_DURATIONS.includes(durationDays)) {
            return { success: false, error: 'Invalid loan duration' };
        }

        if (!this.liquidityPool[tokenSymbol] || this.liquidityPool[tokenSymbol] < amount) {
            return { success: false, error: 'Insufficient liquidity in pool' };
        }

        // Vérifier le score de crédit
        const creditTier = this.getCreditTier(userId);
        if (creditTier.tier === 'D') {
            return {
                success: false,
                error: 'Credit score too low to borrow. Improve your reputation first.',
                creditScore: creditTier.score,
                tier: 'D'
            };
        }

        // Calculer la valeur de l'emprunt en USD
        const borrowValueUsd = amount * this.getPrice(tokenSymbol);

        // Vérifier le pouvoir d'emprunt (ajusté selon le crédit)
        const maxLTV = this.getMaxLTV(userId);
        const collateralValue = this.getUserCollateralValue(userId);
        const adjustedBorrowingPower = collateralValue * maxLTV;
        const currentBorrowed = this.getUserTotalBorrowed(userId);
        const availableBorrow = adjustedBorrowingPower - currentBorrowed;

        if (borrowValueUsd > availableBorrow) {
            return {
                success: false,
                error: 'Insufficient collateral for your credit tier',
                borrowingPower: adjustedBorrowingPower,
                currentBorrowed,
                available: availableBorrow,
                requested: borrowValueUsd,
                creditTier: creditTier.tier,
                maxLTV: `${(maxLTV * 100).toFixed(0)}%`
            };
        }

        // Calculer les intérêts (ajustés selon le crédit)
        const baseRate = LENDING_CONFIG.INTEREST_RATES[tokenSymbol] || 10;
        const annualRate = this.getAdjustedInterestRate(userId, baseRate);
        const dailyRate = annualRate / 365;
        const interestAmount = amount * (dailyRate / 100) * durationDays;
        const totalRepayment = amount + interestAmount;

        // Créer le prêt
        const loanId = 'LOAN_' + crypto.randomBytes(8).toString('hex');
        const loan = {
            id: loanId,
            userId,
            token: tokenSymbol,
            principal: amount,
            interest: interestAmount,
            totalDue: totalRepayment,
            valueUsd: borrowValueUsd,
            annualRate,
            durationDays,
            startDate: Date.now(),
            dueDate: Date.now() + (durationDays * 24 * 60 * 60 * 1000),
            status: 'active',
            repaid: 0
        };

        this.loans.set(loanId, loan);
        this.liquidityPool[tokenSymbol] -= amount;

        console.log(`[LENDING] ${userId} borrowed ${amount} ${tokenSymbol} for ${durationDays} days | Interest: ${interestAmount.toFixed(4)} ${tokenSymbol}`);

        return {
            success: true,
            loan,
            collateralRatio: this.getUserCollateralRatio(userId),
            message: `Loan approved. Repay ${totalRepayment.toFixed(6)} ${tokenSymbol} by ${new Date(loan.dueDate).toLocaleDateString()}`
        };
    }

    // ========================================
    // REMBOURSEMENT
    // ========================================

    repay(userId, loanId, amount) {
        const loan = this.loans.get(loanId);

        if (!loan) {
            return { success: false, error: 'Loan not found' };
        }

        if (loan.userId !== userId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (loan.status !== 'active') {
            return { success: false, error: 'Loan is not active' };
        }

        // Calculer les pénalités de retard si applicable
        let penalty = 0;
        const now = Date.now();
        if (now > loan.dueDate) {
            const daysLate = Math.ceil((now - loan.dueDate) / (24 * 60 * 60 * 1000));
            penalty = loan.totalDue * LENDING_CONFIG.LATE_PENALTY_PER_DAY * daysLate;
            console.log(`[LENDING] Late payment: ${daysLate} days late, penalty: ${penalty.toFixed(4)} ${loan.token}`);
        }

        const totalDueWithPenalty = loan.totalDue - loan.repaid + penalty;

        if (amount > totalDueWithPenalty) {
            amount = totalDueWithPenalty; // Cap at what's owed
        }

        loan.repaid += amount;
        this.liquidityPool[loan.token] += amount;
        this.totalInterestCollected += (amount * (loan.interest / loan.totalDue));

        if (loan.repaid >= loan.totalDue + penalty) {
            loan.status = 'repaid';
            loan.repaidDate = Date.now();
            console.log(`[LENDING] Loan ${loanId} fully repaid`);

            // Mettre à jour le score de crédit
            const now = Date.now();
            if (now < loan.dueDate) {
                // Remboursement anticipé
                this.updateCreditScore(userId, 'LOAN_REPAID_EARLY');
            } else if (penalty > 0) {
                // Remboursement en retard
                const daysLate = Math.ceil((now - loan.dueDate) / (24 * 60 * 60 * 1000));
                this.updateCreditScore(userId, 'LOAN_REPAID_LATE', { daysLate });
            } else {
                // Remboursement à temps
                this.updateCreditScore(userId, 'LOAN_REPAID_ON_TIME');
            }

            // Bonus pour gros prêt
            if (loan.valueUsd > 100000) {
                this.updateCreditScore(userId, 'LARGE_LOAN_SUCCESS');
            }

            // Vérifier bonus historique parfait
            this.updateCreditScore(userId, 'CONSISTENT_HISTORY');
        }

        return {
            success: true,
            payment: {
                loanId,
                amountPaid: amount,
                penalty,
                remaining: Math.max(0, totalDueWithPenalty - amount),
                status: loan.status
            },
            creditScore: this.getCreditSummary(userId)
        };
    }

    // ========================================
    // LIQUIDATION
    // ========================================

    checkAndLiquidate(userId) {
        const ratio = this.getUserCollateralRatio(userId);

        if (ratio >= LENDING_CONFIG.LIQUIDATION_RATIO) {
            return { needsLiquidation: false, ratio };
        }

        // Liquidation nécessaire
        console.log(`[LIQUIDATION] User ${userId} below liquidation threshold: ${(ratio * 100).toFixed(1)}%`);

        const userLoans = this.getUserActiveLoans(userId);
        const liquidations = [];

        for (const loan of userLoans) {
            const liquidation = this.executeLiquidation(userId, loan.id);
            liquidations.push(liquidation);
        }

        return {
            needsLiquidation: true,
            ratio,
            liquidations
        };
    }

    executeLiquidation(userId, loanId) {
        const loan = this.loans.get(loanId);
        if (!loan || loan.status !== 'active') {
            return { success: false, error: 'Invalid loan' };
        }

        const userCollateral = this.collaterals.get(userId);
        if (!userCollateral) {
            return { success: false, error: 'No collateral' };
        }

        // Calculer la valeur EXACTE à saisir (dette + 5% frais, PAS PLUS)
        const outstandingDebt = loan.totalDue - loan.repaid;
        const debtValueUsd = outstandingDebt * this.getPrice(loan.token);
        const liquidationFeeUsd = debtValueUsd * LENDING_CONFIG.LIQUIDATION_FEE; // 5%
        const totalToSeizeUsd = debtValueUsd + liquidationFeeUsd;

        // Calculer la valeur totale du collatéral AVANT liquidation
        let totalCollateralBefore = 0;
        for (const [token, amount] of Object.entries(userCollateral)) {
            totalCollateralBefore += amount * this.getPrice(token);
        }

        // Saisir SEULEMENT ce qui est dû (dette + 5%)
        const seized = {};
        let seizedValueUsd = 0;

        for (const [token, amount] of Object.entries(userCollateral)) {
            if (seizedValueUsd >= totalToSeizeUsd) break;

            const tokenPrice = this.getPrice(token);
            const tokenValueUsd = amount * tokenPrice;
            const neededUsd = totalToSeizeUsd - seizedValueUsd;

            if (tokenValueUsd <= neededUsd) {
                // Saisir tout ce token
                seized[token] = amount;
                seizedValueUsd += tokenValueUsd;
                userCollateral[token] = 0;
            } else {
                // Saisir partiellement - RETOURNER LE RESTE
                const amountToSeize = neededUsd / tokenPrice;
                seized[token] = amountToSeize;
                seizedValueUsd += neededUsd;
                userCollateral[token] -= amountToSeize;
            }
        }

        // Calculer ce qui est RETOURNÉ à l'emprunteur
        let returnedValueUsd = 0;
        const returned = {};
        for (const [token, amount] of Object.entries(userCollateral)) {
            if (amount > 0) {
                returned[token] = amount;
                returnedValueUsd += amount * this.getPrice(token);
            }
        }

        // Marquer le prêt comme liquidé
        loan.status = 'liquidated';
        loan.liquidatedAt = Date.now();
        loan.seizedCollateral = seized;
        loan.returnedCollateral = returned;

        // Remettre les fonds dans le pool
        this.liquidityPool[loan.token] += outstandingDebt;

        // Pénalité crédit (moins sévère car système juste)
        this.updateCreditScore(userId, 'LOAN_LIQUIDATED', {
            loanId,
            seizedValueUsd,
            debtAmount: outstandingDebt
        });

        const liquidation = {
            id: 'LIQ_' + Date.now(),
            odre,
            loanId,
            debtToken: loan.token,
            debtAmount: outstandingDebt,
            debtValueUsd: debtValueUsd,
            liquidationFee: liquidationFeeUsd,
            seizedCollateral: seized,
            seizedValueUsd: seizedValueUsd,
            returnedCollateral: returned,
            returnedValueUsd: returnedValueUsd,
            collateralBefore: totalCollateralBefore,
            timestamp: Date.now(),
            summary: `Borrowed: $${debtValueUsd.toFixed(2)} | Seized: $${seizedValueUsd.toFixed(2)} (debt + 5%) | Returned: $${returnedValueUsd.toFixed(2)}`
        };

        this.liquidations.push(liquidation);

        console.log(`[LIQUIDATION] FAIR: Debt $${debtValueUsd.toFixed(0)} + 5% fee = $${seizedValueUsd.toFixed(0)} seized | $${returnedValueUsd.toFixed(0)} RETURNED to borrower`);

        // Distribuer le collatéral saisi aux prêteurs
        if (this.onLiquidation) {
            this.onLiquidation(liquidation);
        }

        return { success: true, liquidation };
    }

    // ========================================
    // CALCULS ET UTILITAIRES
    // ========================================

    getUserCollateralValue(userId) {
        const userCollateral = this.collaterals.get(userId);
        if (!userCollateral) return 0;

        let totalValue = 0;
        for (const [token, amount] of Object.entries(userCollateral)) {
            totalValue += amount * this.getPrice(token);
        }
        return totalValue;
    }

    getBorrowingPower(userId) {
        const userCollateral = this.collaterals.get(userId);
        if (!userCollateral) return 0;

        let power = 0;
        for (const [token, amount] of Object.entries(userCollateral)) {
            const factor = LENDING_CONFIG.COLLATERAL_FACTORS[token] || 0;
            power += amount * this.getPrice(token) * factor;
        }
        return power;
    }

    getUserTotalBorrowed(userId) {
        let total = 0;
        this.loans.forEach(loan => {
            if (loan.userId === userId && loan.status === 'active') {
                total += (loan.totalDue - loan.repaid) * this.getPrice(loan.token);
            }
        });
        return total;
    }

    getUserCollateralRatio(userId) {
        const collateralValue = this.getUserCollateralValue(userId);
        const borrowed = this.getUserTotalBorrowed(userId);
        if (borrowed === 0) return Infinity;
        return collateralValue / borrowed;
    }

    getUserActiveLoans(userId) {
        const loans = [];
        this.loans.forEach(loan => {
            if (loan.userId === userId && loan.status === 'active') {
                loans.push(loan);
            }
        });
        return loans;
    }

    // Obtenir le résumé pour un utilisateur
    getUserSummary(userId) {
        return {
            collateral: this.collaterals.get(userId) || {},
            collateralValueUsd: this.getUserCollateralValue(userId),
            borrowingPower: this.getBorrowingPower(userId),
            totalBorrowed: this.getUserTotalBorrowed(userId),
            availableToBorrow: Math.max(0, this.getBorrowingPower(userId) - this.getUserTotalBorrowed(userId)),
            collateralRatio: this.getUserCollateralRatio(userId),
            activeLoans: this.getUserActiveLoans(userId),
            healthStatus: this.getHealthStatus(userId)
        };
    }

    getHealthStatus(userId) {
        const ratio = this.getUserCollateralRatio(userId);
        if (ratio === Infinity) return { status: 'safe', message: 'No active loans' };
        if (ratio >= 2.0) return { status: 'healthy', color: 'green', message: 'Excellent health' };
        if (ratio >= 1.5) return { status: 'good', color: 'lightgreen', message: 'Good health' };
        if (ratio >= 1.3) return { status: 'warning', color: 'orange', message: 'Add collateral recommended' };
        if (ratio >= 1.2) return { status: 'danger', color: 'red', message: 'Liquidation risk!' };
        return { status: 'liquidation', color: 'darkred', message: 'Being liquidated' };
    }

    // Stats globales
    getGlobalStats() {
        let totalCollateral = 0;
        let totalBorrowed = 0;
        let activeLoans = 0;

        this.collaterals.forEach((collateral, userId) => {
            totalCollateral += this.getUserCollateralValue(userId);
        });

        this.loans.forEach(loan => {
            if (loan.status === 'active') {
                activeLoans++;
                totalBorrowed += (loan.totalDue - loan.repaid) * this.getPrice(loan.token);
            }
        });

        return {
            totalCollateralUsd: totalCollateral,
            totalBorrowedUsd: totalBorrowed,
            activeLoans,
            utilizationRate: totalBorrowed / (totalCollateral || 1),
            liquidityPool: this.liquidityPool,
            totalLiquidations: this.liquidations.length,
            interestCollected: this.totalInterestCollected,
            config: LENDING_CONFIG
        };
    }
}

module.exports = { LendingSystem, LENDING_CONFIG, CREDIT_TIERS };
