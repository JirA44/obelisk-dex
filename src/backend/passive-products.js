/**
 * OBELISK Passive Investment Products
 * Produits d'investissement passif SANS PERTES
 *
 * Produits disponibles:
 * 1. Liquid Staking - Staking avec liquidité
 * 2. Protected Vaults - Vaults à capital protégé
 * 3. Fixed Income Bonds - Obligations à revenu fixe
 * 4. Auto-DCA - Dollar Cost Averaging automatique
 * 5. Index Baskets - Paniers diversifiés
 * 6. Treasury Notes - Bons du trésor DeFi
 * 7. Yield Optimizer - Optimisation de rendement sécurisée
 */

const crypto = require('crypto');

// ========================================
// 1. LIQUID STAKING - Staking avec liquidité
// ========================================
class LiquidStaking {
    constructor() {
        this.stakes = new Map(); // userId -> { token, amount, stToken, startDate }
        this.pools = {
            ETH: {
                apy: 4.2,
                stToken: 'stETH',
                totalStaked: 0,
                minStake: 0.01,
                lockPeriod: 0, // Pas de lock, retrait instantané
                description: 'Stake ETH, recevez stETH tradable'
            },
            SOL: {
                apy: 7.5,
                stToken: 'stSOL',
                totalStaked: 0,
                minStake: 0.1,
                lockPeriod: 0,
                description: 'Stake SOL avec rendement garanti'
            },
            AVAX: {
                apy: 6.8,
                stToken: 'stAVAX',
                totalStaked: 0,
                minStake: 1,
                lockPeriod: 0,
                description: 'Stake AVAX, liquidité immédiate'
            },
            MATIC: {
                apy: 5.5,
                stToken: 'stMATIC',
                totalStaked: 0,
                minStake: 10,
                lockPeriod: 0,
                description: 'Stake Polygon avec flexibilité'
            },
            ATOM: {
                apy: 8.2,
                stToken: 'stATOM',
                totalStaked: 0,
                minStake: 1,
                lockPeriod: 0,
                description: 'Stake Cosmos, rendement élevé'
            }
        };
    }

    stake(userId, token, amount) {
        const pool = this.pools[token];
        if (!pool) return { success: false, error: `${token} staking not available` };
        if (amount < pool.minStake) return { success: false, error: `Minimum: ${pool.minStake} ${token}` };

        const stakeId = 'STK_' + crypto.randomBytes(6).toString('hex');
        const stTokenAmount = amount; // 1:1 ratio

        if (!this.stakes.has(userId)) this.stakes.set(userId, []);

        this.stakes.get(userId).push({
            id: stakeId,
            token,
            amount,
            stToken: pool.stToken,
            stTokenAmount,
            apy: pool.apy,
            startDate: Date.now(),
            accruedRewards: 0
        });

        pool.totalStaked += amount;

        return {
            success: true,
            stakeId,
            staked: amount,
            token,
            received: { token: pool.stToken, amount: stTokenAmount },
            apy: pool.apy + '%',
            message: `Staked ${amount} ${token} -> Received ${stTokenAmount} ${pool.stToken}`
        };
    }

    unstake(userId, stakeId) {
        const userStakes = this.stakes.get(userId);
        if (!userStakes) return { success: false, error: 'No stakes found' };

        const stakeIndex = userStakes.findIndex(s => s.id === stakeId);
        if (stakeIndex === -1) return { success: false, error: 'Stake not found' };

        const stake = userStakes[stakeIndex];
        const rewards = this.calculateRewards(stake);
        const totalReturn = stake.amount + rewards;

        userStakes.splice(stakeIndex, 1);
        this.pools[stake.token].totalStaked -= stake.amount;

        return {
            success: true,
            unstaked: stake.amount,
            rewards,
            total: totalReturn,
            token: stake.token,
            message: `Unstaked ${stake.amount} ${stake.token} + ${rewards.toFixed(6)} rewards`
        };
    }

    calculateRewards(stake) {
        const daysStaked = (Date.now() - stake.startDate) / (1000 * 60 * 60 * 24);
        const dailyRate = stake.apy / 365 / 100;
        return stake.amount * dailyRate * daysStaked;
    }

    getUserStakes(userId) {
        const userStakes = this.stakes.get(userId) || [];
        return userStakes.map(stake => ({
            ...stake,
            currentRewards: this.calculateRewards(stake),
            totalValue: stake.amount + this.calculateRewards(stake)
        }));
    }

    getPools() {
        return Object.entries(this.pools).map(([token, pool]) => ({
            token,
            ...pool,
            apy: pool.apy + '%'
        }));
    }
}

// ========================================
// 2. PROTECTED VAULTS - Capital Protégé
// ========================================
class ProtectedVaults {
    constructor() {
        this.deposits = new Map();
        this.vaults = {
            'STABLE_YIELD': {
                name: 'Stable Yield Vault',
                description: 'Rendement stable sur stablecoins - Capital 100% protégé',
                acceptedTokens: ['USDC', 'USDT', 'DAI'],
                baseApy: 5.5,
                bonusApy: 1.5, // Bonus si lock 30j+
                minDeposit: 1,
                capitalProtection: 1.0, // 100% protégé
                strategy: 'Lending protocols + Treasury bonds'
            },
            'BLUE_CHIP': {
                name: 'Blue Chip Vault',
                description: 'ETH/BTC avec protection du capital',
                acceptedTokens: ['ETH', 'BTC', 'WETH', 'WBTC'],
                baseApy: 3.2,
                bonusApy: 1.0,
                minDeposit: 0.001,
                capitalProtection: 1.0,
                strategy: 'Covered calls + Staking rewards'
            },
            'DEFI_SAFE': {
                name: 'DeFi Safe Vault',
                description: 'Tokens DeFi avec stratégie conservatrice',
                acceptedTokens: ['UNI', 'AAVE', 'LINK', 'CRV'],
                baseApy: 6.8,
                bonusApy: 2.0,
                minDeposit: 1,
                capitalProtection: 0.95, // 95% protégé minimum
                strategy: 'Yield farming audité + Insurance'
            },
            'EMERGING_SAFE': {
                name: 'Emerging Markets Safe',
                description: 'L2 & nouveaux tokens avec protection',
                acceptedTokens: ['ARB', 'OP', 'MATIC', 'AVAX'],
                baseApy: 8.5,
                bonusApy: 2.5,
                minDeposit: 1,
                capitalProtection: 0.90, // 90% protégé minimum
                strategy: 'Diversified staking + hedging'
            }
        };
    }

    deposit(userId, vaultId, token, amount, lockDays = 0) {
        const vault = this.vaults[vaultId];
        if (!vault) return { success: false, error: 'Vault not found' };
        if (!vault.acceptedTokens.includes(token)) {
            return { success: false, error: `${token} not accepted. Use: ${vault.acceptedTokens.join(', ')}` };
        }
        if (amount < vault.minDeposit) {
            return { success: false, error: `Minimum deposit: ${vault.minDeposit}` };
        }

        const depositId = 'VLT_' + crypto.randomBytes(6).toString('hex');
        const effectiveApy = lockDays >= 30 ? vault.baseApy + vault.bonusApy : vault.baseApy;

        if (!this.deposits.has(userId)) this.deposits.set(userId, []);

        this.deposits.get(userId).push({
            id: depositId,
            vaultId,
            vaultName: vault.name,
            token,
            amount,
            apy: effectiveApy,
            lockDays,
            lockUntil: lockDays > 0 ? Date.now() + (lockDays * 24 * 60 * 60 * 1000) : null,
            capitalProtection: vault.capitalProtection,
            startDate: Date.now(),
            accruedYield: 0
        });

        return {
            success: true,
            depositId,
            vault: vault.name,
            deposited: { token, amount },
            apy: effectiveApy + '%',
            capitalProtection: (vault.capitalProtection * 100) + '%',
            lockDays,
            message: `Deposited in ${vault.name} with ${effectiveApy}% APY`
        };
    }

    withdraw(userId, depositId) {
        const userDeposits = this.deposits.get(userId);
        if (!userDeposits) return { success: false, error: 'No deposits found' };

        const index = userDeposits.findIndex(d => d.id === depositId);
        if (index === -1) return { success: false, error: 'Deposit not found' };

        const deposit = userDeposits[index];

        // Vérifier le lock
        if (deposit.lockUntil && Date.now() < deposit.lockUntil) {
            const daysLeft = Math.ceil((deposit.lockUntil - Date.now()) / (1000 * 60 * 60 * 24));
            return { success: false, error: `Locked for ${daysLeft} more days` };
        }

        const yield_ = this.calculateYield(deposit);
        const protectedAmount = deposit.amount * deposit.capitalProtection;
        const totalReturn = Math.max(protectedAmount, deposit.amount + yield_);

        userDeposits.splice(index, 1);

        return {
            success: true,
            withdrawn: deposit.amount,
            yield: yield_,
            total: totalReturn,
            token: deposit.token,
            capitalProtected: true
        };
    }

    calculateYield(deposit) {
        const days = (Date.now() - deposit.startDate) / (1000 * 60 * 60 * 24);
        const dailyRate = deposit.apy / 365 / 100;
        return deposit.amount * dailyRate * days;
    }

    getUserDeposits(userId) {
        return (this.deposits.get(userId) || []).map(d => ({
            ...d,
            currentYield: this.calculateYield(d),
            totalValue: d.amount + this.calculateYield(d),
            isLocked: d.lockUntil && Date.now() < d.lockUntil
        }));
    }

    getVaults() {
        return Object.entries(this.vaults).map(([id, vault]) => ({
            id,
            ...vault,
            baseApy: vault.baseApy + '%',
            bonusApy: '+' + vault.bonusApy + '% (30d+ lock)',
            capitalProtection: (vault.capitalProtection * 100) + '%'
        }));
    }
}

// ========================================
// 3. FIXED INCOME BONDS - Obligations
// ========================================
class FixedIncomeBonds {
    constructor() {
        this.bonds = new Map();
        this.offerings = {
            'TREASURY_7D': {
                name: 'Treasury Note 7 Days',
                description: 'Obligation court terme - Rendement garanti',
                duration: 7,
                apy: 4.0,
                minAmount: 100,
                maxAmount: 1000000,
                token: 'USDC',
                risk: 'Minimal',
                guaranteed: true
            },
            'TREASURY_30D': {
                name: 'Treasury Note 30 Days',
                description: 'Obligation moyen terme - Meilleur rendement',
                duration: 30,
                apy: 5.5,
                minAmount: 100,
                maxAmount: 1000000,
                token: 'USDC',
                risk: 'Minimal',
                guaranteed: true
            },
            'TREASURY_90D': {
                name: 'Treasury Bond 90 Days',
                description: 'Obligation long terme - Rendement premium',
                duration: 90,
                apy: 7.0,
                minAmount: 500,
                maxAmount: 5000000,
                token: 'USDC',
                risk: 'Minimal',
                guaranteed: true
            },
            'CORPORATE_30D': {
                name: 'Corporate Bond 30 Days',
                description: 'Obligation corporate - Rendement élevé',
                duration: 30,
                apy: 8.5,
                minAmount: 1000,
                maxAmount: 500000,
                token: 'USDC',
                risk: 'Low',
                guaranteed: true
            },
            'HIGH_YIELD_60D': {
                name: 'High Yield Bond 60 Days',
                description: 'Obligation haut rendement - Capital protégé',
                duration: 60,
                apy: 12.0,
                minAmount: 5000,
                maxAmount: 100000,
                token: 'USDC',
                risk: 'Low-Medium',
                guaranteed: true,
                capitalProtection: 0.98 // 98% minimum garanti
            }
        };
    }

    purchase(userId, bondId, amount) {
        const offering = this.offerings[bondId];
        if (!offering) return { success: false, error: 'Bond not found' };
        if (amount < offering.minAmount) return { success: false, error: `Minimum: ${offering.minAmount} ${offering.token}` };
        if (amount > offering.maxAmount) return { success: false, error: `Maximum: ${offering.maxAmount} ${offering.token}` };

        const purchaseId = 'BND_' + crypto.randomBytes(6).toString('hex');
        const interest = amount * (offering.apy / 100) * (offering.duration / 365);
        const maturityValue = amount + interest;
        const maturityDate = Date.now() + (offering.duration * 24 * 60 * 60 * 1000);

        if (!this.bonds.has(userId)) this.bonds.set(userId, []);

        this.bonds.get(userId).push({
            id: purchaseId,
            bondId,
            bondName: offering.name,
            principal: amount,
            interest,
            maturityValue,
            token: offering.token,
            apy: offering.apy,
            purchaseDate: Date.now(),
            maturityDate,
            duration: offering.duration,
            status: 'active',
            guaranteed: offering.guaranteed
        });

        return {
            success: true,
            purchaseId,
            bond: offering.name,
            principal: amount,
            interestAtMaturity: interest.toFixed(2),
            maturityValue: maturityValue.toFixed(2),
            token: offering.token,
            maturityDate: new Date(maturityDate).toLocaleDateString(),
            apy: offering.apy + '%',
            guaranteed: offering.guaranteed
        };
    }

    redeem(userId, purchaseId) {
        const userBonds = this.bonds.get(userId);
        if (!userBonds) return { success: false, error: 'No bonds found' };

        const index = userBonds.findIndex(b => b.id === purchaseId);
        if (index === -1) return { success: false, error: 'Bond not found' };

        const bond = userBonds[index];

        if (Date.now() < bond.maturityDate) {
            // Retrait anticipé avec pénalité
            const daysHeld = (Date.now() - bond.purchaseDate) / (1000 * 60 * 60 * 24);
            const earnedInterest = bond.principal * (bond.apy / 100) * (daysHeld / 365);
            const penalty = earnedInterest * 0.5; // 50% des intérêts perdus
            const totalReturn = bond.principal + earnedInterest - penalty;

            userBonds.splice(index, 1);

            return {
                success: true,
                earlyRedemption: true,
                principal: bond.principal,
                earnedInterest,
                penalty,
                total: totalReturn,
                token: bond.token,
                warning: 'Early redemption - 50% interest penalty applied'
            };
        }

        // Maturité atteinte
        userBonds.splice(index, 1);

        return {
            success: true,
            principal: bond.principal,
            interest: bond.interest,
            total: bond.maturityValue,
            token: bond.token,
            message: 'Bond matured - Full value redeemed'
        };
    }

    getUserBonds(userId) {
        return (this.bonds.get(userId) || []).map(bond => ({
            ...bond,
            daysToMaturity: Math.max(0, Math.ceil((bond.maturityDate - Date.now()) / (1000 * 60 * 60 * 24))),
            isMatured: Date.now() >= bond.maturityDate
        }));
    }

    getOfferings() {
        return Object.entries(this.offerings).map(([id, offering]) => ({
            id,
            ...offering,
            apy: offering.apy + '%'
        }));
    }
}

// ========================================
// 4. AUTO-DCA - Dollar Cost Averaging
// ========================================
class AutoDCA {
    constructor() {
        this.plans = new Map();
        this.executions = new Map();
        this.templates = {
            'BTC_WEEKLY': {
                name: 'Bitcoin Weekly',
                targetToken: 'BTC',
                sourceToken: 'USDC',
                frequency: 'weekly',
                frequencyMs: 7 * 24 * 60 * 60 * 1000,
                minAmount: 10,
                description: 'Accumulate BTC every week'
            },
            'ETH_WEEKLY': {
                name: 'Ethereum Weekly',
                targetToken: 'ETH',
                sourceToken: 'USDC',
                frequency: 'weekly',
                frequencyMs: 7 * 24 * 60 * 60 * 1000,
                minAmount: 10,
                description: 'Accumulate ETH every week'
            },
            'BTC_DAILY': {
                name: 'Bitcoin Daily',
                targetToken: 'BTC',
                sourceToken: 'USDC',
                frequency: 'daily',
                frequencyMs: 24 * 60 * 60 * 1000,
                minAmount: 1,
                description: 'Small daily BTC purchases'
            },
            'BLUE_CHIP_MIX': {
                name: 'Blue Chip Mix',
                targetTokens: { BTC: 0.5, ETH: 0.5 },
                sourceToken: 'USDC',
                frequency: 'weekly',
                frequencyMs: 7 * 24 * 60 * 60 * 1000,
                minAmount: 20,
                description: '50% BTC + 50% ETH weekly'
            },
            'DIVERSIFIED': {
                name: 'Diversified Portfolio',
                targetTokens: { BTC: 0.35, ETH: 0.35, SOL: 0.15, LINK: 0.15 },
                sourceToken: 'USDC',
                frequency: 'weekly',
                frequencyMs: 7 * 24 * 60 * 60 * 1000,
                minAmount: 50,
                description: 'Diversified crypto accumulation'
            }
        };
    }

    createPlan(userId, templateId, amountPerExecution, totalBudget = null) {
        const template = this.templates[templateId];
        if (!template) return { success: false, error: 'Template not found' };
        if (amountPerExecution < template.minAmount) {
            return { success: false, error: `Minimum: ${template.minAmount} ${template.sourceToken}` };
        }

        const planId = 'DCA_' + crypto.randomBytes(6).toString('hex');

        if (!this.plans.has(userId)) this.plans.set(userId, []);

        const plan = {
            id: planId,
            templateId,
            name: template.name,
            targetToken: template.targetToken,
            targetTokens: template.targetTokens,
            sourceToken: template.sourceToken,
            amountPerExecution,
            frequency: template.frequency,
            frequencyMs: template.frequencyMs,
            totalBudget,
            spent: 0,
            accumulated: template.targetTokens ? {} : 0,
            executionsCount: 0,
            avgPrice: 0,
            status: 'active',
            createdAt: Date.now(),
            nextExecution: Date.now() + template.frequencyMs,
            history: []
        };

        if (template.targetTokens) {
            Object.keys(template.targetTokens).forEach(t => plan.accumulated[t] = 0);
        }

        this.plans.get(userId).push(plan);

        return {
            success: true,
            planId,
            plan: template.name,
            amountPerExecution,
            frequency: template.frequency,
            totalBudget: totalBudget || 'Unlimited',
            message: `DCA plan created - First execution in ${template.frequency}`
        };
    }

    executeDCA(userId, planId, prices) {
        const userPlans = this.plans.get(userId);
        if (!userPlans) return { success: false, error: 'No plans found' };

        const plan = userPlans.find(p => p.id === planId);
        if (!plan) return { success: false, error: 'Plan not found' };
        if (plan.status !== 'active') return { success: false, error: 'Plan not active' };

        // Vérifier budget
        if (plan.totalBudget && plan.spent + plan.amountPerExecution > plan.totalBudget) {
            plan.status = 'completed';
            return { success: false, error: 'Budget exhausted', planCompleted: true };
        }

        const execution = {
            id: 'EXE_' + Date.now(),
            date: Date.now(),
            sourceAmount: plan.amountPerExecution,
            purchases: []
        };

        if (plan.targetTokens) {
            // Multi-token DCA
            Object.entries(plan.targetTokens).forEach(([token, allocation]) => {
                const amount = plan.amountPerExecution * allocation;
                const price = prices[token] || 1;
                const tokenAmount = amount / price;

                plan.accumulated[token] = (plan.accumulated[token] || 0) + tokenAmount;
                execution.purchases.push({ token, usdcSpent: amount, tokenReceived: tokenAmount, price });
            });
        } else {
            // Single token DCA
            const price = prices[plan.targetToken] || 1;
            const tokenAmount = plan.amountPerExecution / price;
            plan.accumulated += tokenAmount;

            // Update average price
            const totalSpent = plan.spent + plan.amountPerExecution;
            plan.avgPrice = totalSpent / (typeof plan.accumulated === 'number' ? plan.accumulated : 1);

            execution.purchases.push({
                token: plan.targetToken,
                usdcSpent: plan.amountPerExecution,
                tokenReceived: tokenAmount,
                price
            });
        }

        plan.spent += plan.amountPerExecution;
        plan.executionsCount++;
        plan.nextExecution = Date.now() + plan.frequencyMs;
        plan.history.push(execution);

        // Garder les 100 dernières exécutions
        if (plan.history.length > 100) plan.history = plan.history.slice(-100);

        return {
            success: true,
            execution,
            planStats: {
                totalSpent: plan.spent,
                accumulated: plan.accumulated,
                executionsCount: plan.executionsCount,
                avgPrice: plan.avgPrice
            }
        };
    }

    pausePlan(userId, planId) {
        const userPlans = this.plans.get(userId);
        const plan = userPlans?.find(p => p.id === planId);
        if (!plan) return { success: false, error: 'Plan not found' };

        plan.status = plan.status === 'active' ? 'paused' : 'active';
        return { success: true, status: plan.status };
    }

    getUserPlans(userId) {
        return this.plans.get(userId) || [];
    }

    getTemplates() {
        return Object.entries(this.templates).map(([id, t]) => ({ id, ...t }));
    }
}

// ========================================
// 5. INDEX BASKETS - Paniers Diversifiés
// ========================================
class IndexBaskets {
    constructor() {
        this.holdings = new Map();
        this.indices = {
            'CRYPTO_TOP10': {
                name: 'Crypto Top 10 Index',
                description: 'Top 10 cryptos par market cap - Rééquilibrage mensuel',
                composition: {
                    BTC: 0.35, ETH: 0.25, BNB: 0.08, SOL: 0.07, XRP: 0.06,
                    ADA: 0.05, AVAX: 0.05, DOT: 0.04, MATIC: 0.03, LINK: 0.02
                },
                rebalanceFrequency: 'monthly',
                managementFee: 0.5, // 0.5% annuel
                minInvestment: 100,
                capitalProtection: 0 // Pas de protection, exposition marché
            },
            'DEFI_INDEX': {
                name: 'DeFi Leaders Index',
                description: 'Top projets DeFi',
                composition: {
                    UNI: 0.20, AAVE: 0.18, LINK: 0.15, CRV: 0.12, MKR: 0.10,
                    SNX: 0.08, COMP: 0.07, SUSHI: 0.05, YFI: 0.03, BAL: 0.02
                },
                rebalanceFrequency: 'monthly',
                managementFee: 0.75,
                minInvestment: 50,
                capitalProtection: 0
            },
            'STABLE_INCOME': {
                name: 'Stable Income Index',
                description: 'Stablecoins diversifiés avec yield - SANS PERTE',
                composition: {
                    USDC: 0.40, USDT: 0.30, DAI: 0.20, FRAX: 0.10
                },
                rebalanceFrequency: 'weekly',
                managementFee: 0.2,
                minInvestment: 10,
                baseYield: 5.0, // 5% APY garanti
                capitalProtection: 1.0 // 100% capital protégé
            },
            'LAYER2_INDEX': {
                name: 'Layer 2 Index',
                description: 'Tokens des solutions Layer 2',
                composition: {
                    ARB: 0.30, OP: 0.25, MATIC: 0.25, IMX: 0.10, LRC: 0.10
                },
                rebalanceFrequency: 'monthly',
                managementFee: 0.5,
                minInvestment: 25,
                capitalProtection: 0
            },
            'CONSERVATIVE': {
                name: 'Conservative Growth',
                description: 'Croissance prudente - 80% stable, 20% crypto',
                composition: {
                    USDC: 0.50, USDT: 0.30, BTC: 0.12, ETH: 0.08
                },
                rebalanceFrequency: 'weekly',
                managementFee: 0.3,
                minInvestment: 100,
                capitalProtection: 0.80 // 80% minimum garanti
            }
        };
    }

    invest(userId, indexId, amount, token = 'USDC') {
        const index = this.indices[indexId];
        if (!index) return { success: false, error: 'Index not found' };
        if (amount < index.minInvestment) {
            return { success: false, error: `Minimum: ${index.minInvestment} ${token}` };
        }

        const investmentId = 'IDX_' + crypto.randomBytes(6).toString('hex');

        if (!this.holdings.has(userId)) this.holdings.set(userId, []);

        // Calculer les tokens reçus selon la composition
        const tokens = {};
        Object.entries(index.composition).forEach(([t, weight]) => {
            tokens[t] = amount * weight; // Simplifié pour la démo
        });

        this.holdings.get(userId).push({
            id: investmentId,
            indexId,
            indexName: index.name,
            investedAmount: amount,
            investedToken: token,
            tokens,
            shares: amount, // 1 share = 1 USDC invested
            entryDate: Date.now(),
            capitalProtection: index.capitalProtection,
            baseYield: index.baseYield || 0
        });

        return {
            success: true,
            investmentId,
            index: index.name,
            invested: amount,
            composition: index.composition,
            capitalProtection: (index.capitalProtection * 100) + '%',
            managementFee: index.managementFee + '% yearly'
        };
    }

    redeem(userId, investmentId, prices) {
        const userHoldings = this.holdings.get(userId);
        if (!userHoldings) return { success: false, error: 'No holdings found' };

        const index = userHoldings.findIndex(h => h.id === investmentId);
        if (index === -1) return { success: false, error: 'Investment not found' };

        const holding = userHoldings[index];
        const indexConfig = this.indices[holding.indexId];

        // Calculer la valeur actuelle
        let currentValue = 0;
        Object.entries(holding.tokens).forEach(([token, amount]) => {
            currentValue += amount * (prices[token] || 1);
        });

        // Ajouter le yield si applicable
        if (holding.baseYield > 0) {
            const days = (Date.now() - holding.entryDate) / (1000 * 60 * 60 * 24);
            const yieldAmount = holding.investedAmount * (holding.baseYield / 100) * (days / 365);
            currentValue += yieldAmount;
        }

        // Appliquer la protection du capital
        const protectedAmount = holding.investedAmount * holding.capitalProtection;
        const finalValue = Math.max(protectedAmount, currentValue);

        // Déduire les frais de gestion
        const days = (Date.now() - holding.entryDate) / (1000 * 60 * 60 * 24);
        const managementFee = finalValue * (indexConfig.managementFee / 100) * (days / 365);
        const netValue = finalValue - managementFee;

        userHoldings.splice(index, 1);

        return {
            success: true,
            invested: holding.investedAmount,
            currentValue,
            capitalProtection: protectedAmount,
            managementFee,
            netRedemption: netValue,
            pnl: netValue - holding.investedAmount,
            pnlPercent: ((netValue / holding.investedAmount - 1) * 100).toFixed(2) + '%'
        };
    }

    getUserHoldings(userId, prices = {}) {
        return (this.holdings.get(userId) || []).map(h => {
            let currentValue = 0;
            Object.entries(h.tokens).forEach(([token, amount]) => {
                currentValue += amount * (prices[token] || 1);
            });

            if (h.baseYield > 0) {
                const days = (Date.now() - h.entryDate) / (1000 * 60 * 60 * 24);
                currentValue += h.investedAmount * (h.baseYield / 100) * (days / 365);
            }

            return {
                ...h,
                currentValue,
                pnl: currentValue - h.investedAmount,
                pnlPercent: ((currentValue / h.investedAmount - 1) * 100).toFixed(2) + '%'
            };
        });
    }

    getIndices() {
        return Object.entries(this.indices).map(([id, idx]) => ({
            id,
            ...idx,
            managementFee: idx.managementFee + '%',
            capitalProtection: (idx.capitalProtection * 100) + '%'
        }));
    }
}

// ========================================
// 6. YIELD OPTIMIZER - Optimisation Sécurisée
// ========================================
class YieldOptimizer {
    constructor() {
        this.deposits = new Map();
        this.strategies = {
            'STABLE_MAX': {
                name: 'Stable Maximizer',
                description: 'Optimise le yield sur stablecoins - Rotations automatiques',
                acceptedTokens: ['USDC', 'USDT', 'DAI'],
                targetApy: 7.5,
                minApy: 5.0, // Garanti minimum
                capitalProtection: 1.0,
                riskLevel: 'Minimal',
                protocols: ['Aave', 'Compound', 'MakerDAO']
            },
            'ETH_YIELD': {
                name: 'ETH Yield Hunter',
                description: 'Maximise le rendement ETH - Staking + Lending',
                acceptedTokens: ['ETH', 'stETH', 'WETH'],
                targetApy: 6.0,
                minApy: 3.5,
                capitalProtection: 1.0,
                riskLevel: 'Low',
                protocols: ['Lido', 'Rocket Pool', 'Aave']
            },
            'MULTI_CHAIN': {
                name: 'Multi-Chain Optimizer',
                description: 'Yield farming cross-chain sécurisé',
                acceptedTokens: ['USDC', 'USDT'],
                targetApy: 10.0,
                minApy: 6.0,
                capitalProtection: 0.98,
                riskLevel: 'Low-Medium',
                protocols: ['Ethereum', 'Arbitrum', 'Optimism', 'Polygon']
            }
        };
    }

    deposit(userId, strategyId, token, amount) {
        const strategy = this.strategies[strategyId];
        if (!strategy) return { success: false, error: 'Strategy not found' };
        if (!strategy.acceptedTokens.includes(token)) {
            return { success: false, error: `Token not accepted. Use: ${strategy.acceptedTokens.join(', ')}` };
        }

        const depositId = 'OPT_' + crypto.randomBytes(6).toString('hex');

        if (!this.deposits.has(userId)) this.deposits.set(userId, []);

        this.deposits.get(userId).push({
            id: depositId,
            strategyId,
            strategyName: strategy.name,
            token,
            amount,
            targetApy: strategy.targetApy,
            minApy: strategy.minApy,
            currentApy: strategy.targetApy, // Simulé
            capitalProtection: strategy.capitalProtection,
            startDate: Date.now(),
            accruedYield: 0,
            rotations: [] // Historique des rotations de protocoles
        });

        return {
            success: true,
            depositId,
            strategy: strategy.name,
            deposited: { token, amount },
            targetApy: strategy.targetApy + '%',
            minGuaranteedApy: strategy.minApy + '%',
            capitalProtection: (strategy.capitalProtection * 100) + '%',
            protocols: strategy.protocols
        };
    }

    withdraw(userId, depositId) {
        const userDeposits = this.deposits.get(userId);
        if (!userDeposits) return { success: false, error: 'No deposits found' };

        const index = userDeposits.findIndex(d => d.id === depositId);
        if (index === -1) return { success: false, error: 'Deposit not found' };

        const deposit = userDeposits[index];

        // Calculer le yield (utilise au moins minApy garanti)
        const days = (Date.now() - deposit.startDate) / (1000 * 60 * 60 * 24);
        const effectiveApy = Math.max(deposit.minApy, deposit.currentApy);
        const yield_ = deposit.amount * (effectiveApy / 100) * (days / 365);

        const protectedAmount = deposit.amount * deposit.capitalProtection;
        const total = Math.max(protectedAmount + yield_, deposit.amount + yield_);

        userDeposits.splice(index, 1);

        return {
            success: true,
            withdrawn: deposit.amount,
            yield: yield_,
            total,
            token: deposit.token,
            effectiveApy: effectiveApy + '%',
            daysInvested: Math.floor(days)
        };
    }

    getUserDeposits(userId) {
        return (this.deposits.get(userId) || []).map(d => {
            const days = (Date.now() - d.startDate) / (1000 * 60 * 60 * 24);
            const effectiveApy = Math.max(d.minApy, d.currentApy);
            const currentYield = d.amount * (effectiveApy / 100) * (days / 365);

            return {
                ...d,
                currentYield,
                totalValue: d.amount + currentYield,
                daysInvested: Math.floor(days)
            };
        });
    }

    getStrategies() {
        return Object.entries(this.strategies).map(([id, s]) => ({
            id,
            ...s,
            targetApy: s.targetApy + '%',
            minApy: s.minApy + '%',
            capitalProtection: (s.capitalProtection * 100) + '%'
        }));
    }
}

// ========================================
// 7. INSURANCE POOL - Protection des Dépôts
// ========================================
class InsurancePool {
    constructor() {
        this.policies = new Map();
        this.coverages = {
            'SMART_CONTRACT': {
                name: 'Smart Contract Cover',
                description: 'Protection contre les bugs de smart contracts',
                premiumRate: 2.5, // 2.5% annuel
                maxCoverage: 1000000,
                deductible: 0.01 // 1%
            },
            'STABLECOIN_DEPEG': {
                name: 'Stablecoin Depeg Protection',
                description: 'Protection si un stablecoin perd son peg',
                premiumRate: 1.5,
                maxCoverage: 500000,
                deductible: 0.02
            },
            'PROTOCOL_HACK': {
                name: 'Protocol Hack Insurance',
                description: 'Couverture en cas de hack de protocole',
                premiumRate: 3.0,
                maxCoverage: 250000,
                deductible: 0.05
            },
            'FULL_COVERAGE': {
                name: 'Full DeFi Insurance',
                description: 'Couverture complète - Smart contracts + Hacks + Depeg',
                premiumRate: 5.0,
                maxCoverage: 100000,
                deductible: 0.02
            }
        };
        this.poolBalance = 10000000; // $10M pool
    }

    purchasePolicy(userId, coverageId, amountToInsure, durationDays) {
        const coverage = this.coverages[coverageId];
        if (!coverage) return { success: false, error: 'Coverage not found' };
        if (amountToInsure > coverage.maxCoverage) {
            return { success: false, error: `Max coverage: $${coverage.maxCoverage}` };
        }

        const policyId = 'INS_' + crypto.randomBytes(6).toString('hex');
        const premium = amountToInsure * (coverage.premiumRate / 100) * (durationDays / 365);

        if (!this.policies.has(userId)) this.policies.set(userId, []);

        this.policies.get(userId).push({
            id: policyId,
            coverageId,
            coverageName: coverage.name,
            insuredAmount: amountToInsure,
            premium,
            deductible: coverage.deductible,
            startDate: Date.now(),
            endDate: Date.now() + (durationDays * 24 * 60 * 60 * 1000),
            status: 'active',
            claims: []
        });

        this.poolBalance += premium;

        return {
            success: true,
            policyId,
            coverage: coverage.name,
            insuredAmount: amountToInsure,
            premium: premium.toFixed(2),
            duration: durationDays + ' days',
            deductible: (coverage.deductible * 100) + '%'
        };
    }

    fileClaim(userId, policyId, lossAmount, description) {
        const userPolicies = this.policies.get(userId);
        const policy = userPolicies?.find(p => p.id === policyId);

        if (!policy) return { success: false, error: 'Policy not found' };
        if (policy.status !== 'active') return { success: false, error: 'Policy not active' };
        if (Date.now() > policy.endDate) return { success: false, error: 'Policy expired' };
        if (lossAmount > policy.insuredAmount) {
            lossAmount = policy.insuredAmount;
        }

        const deductibleAmount = lossAmount * policy.deductible;
        const payout = lossAmount - deductibleAmount;

        const claim = {
            id: 'CLM_' + Date.now(),
            lossAmount,
            deductible: deductibleAmount,
            payout,
            description,
            status: 'approved', // Auto-approved pour la démo
            filedAt: Date.now()
        };

        policy.claims.push(claim);
        this.poolBalance -= payout;

        return {
            success: true,
            claim,
            message: `Claim approved. Payout: $${payout.toFixed(2)} (after ${(policy.deductible * 100)}% deductible)`
        };
    }

    getUserPolicies(userId) {
        return (this.policies.get(userId) || []).map(p => ({
            ...p,
            isActive: p.status === 'active' && Date.now() < p.endDate,
            daysRemaining: Math.max(0, Math.ceil((p.endDate - Date.now()) / (1000 * 60 * 60 * 24)))
        }));
    }

    getCoverages() {
        return Object.entries(this.coverages).map(([id, c]) => ({
            id,
            ...c,
            premiumRate: c.premiumRate + '% yearly',
            deductible: (c.deductible * 100) + '%'
        }));
    }

    getPoolStats() {
        return {
            poolBalance: this.poolBalance,
            totalPolicies: Array.from(this.policies.values()).flat().length,
            activePolicies: Array.from(this.policies.values()).flat().filter(p => p.status === 'active').length
        };
    }
}

// ========================================
// 8. COMBO PRODUCTS - Stratégies Combinées
// ========================================
class ComboProducts {
    constructor(passiveProducts) {
        this.parent = passiveProducts;
        this.investments = new Map();

        this.combos = {
            // === ULTRA SAFE - Capital 100% Protégé ===
            'SAFE_HAVEN': {
                name: 'Safe Haven',
                icon: '🛡️',
                description: 'Capital 100% protégé - Idéal pour débutants',
                riskLevel: 'Minimal',
                expectedApy: { min: 4.5, max: 5.5 },
                capitalProtection: 1.0,
                allocation: [
                    { product: 'vault', id: 'STABLE_YIELD', weight: 0.60 },
                    { product: 'bond', id: 'TREASURY_30D', weight: 0.30 },
                    { product: 'insurance', id: 'FULL_COVERAGE', weight: 0.10, isProtection: true }
                ],
                minInvestment: 100,
                rebalanceFrequency: 'monthly'
            },

            'STABLE_MAXIMIZER': {
                name: 'Stable Maximizer',
                icon: '💰',
                description: 'Maximise le yield sur stablecoins - Zéro risque crypto',
                riskLevel: 'Minimal',
                expectedApy: { min: 6.0, max: 8.0 },
                capitalProtection: 1.0,
                allocation: [
                    { product: 'yield', id: 'STABLE_MAX', weight: 0.50 },
                    { product: 'bond', id: 'CORPORATE_30D', weight: 0.30 },
                    { product: 'vault', id: 'STABLE_YIELD', weight: 0.20 }
                ],
                minInvestment: 500,
                rebalanceFrequency: 'weekly'
            },

            // === BALANCED - Croissance Modérée ===
            'BALANCED_GROWTH': {
                name: 'Balanced Growth',
                icon: '⚖️',
                description: '70% stable + 30% crypto - Croissance équilibrée',
                riskLevel: 'Low',
                expectedApy: { min: 5.5, max: 9.0 },
                capitalProtection: 0.85,
                allocation: [
                    { product: 'vault', id: 'STABLE_YIELD', weight: 0.40 },
                    { product: 'staking', id: 'ETH', weight: 0.20 },
                    { product: 'index', id: 'CONSERVATIVE', weight: 0.25 },
                    { product: 'bond', id: 'TREASURY_30D', weight: 0.15 }
                ],
                minInvestment: 250,
                rebalanceFrequency: 'weekly'
            },

            'SMART_SAVER': {
                name: 'Smart Saver',
                icon: '🧠',
                description: 'Épargne intelligente avec exposition crypto limitée',
                riskLevel: 'Low',
                expectedApy: { min: 5.0, max: 7.5 },
                capitalProtection: 0.90,
                allocation: [
                    { product: 'yield', id: 'STABLE_MAX', weight: 0.45 },
                    { product: 'vault', id: 'BLUE_CHIP', weight: 0.25 },
                    { product: 'dca', id: 'BTC_WEEKLY', weight: 0.20 },
                    { product: 'insurance', id: 'SMART_CONTRACT', weight: 0.10, isProtection: true }
                ],
                minInvestment: 200,
                rebalanceFrequency: 'weekly'
            },

            // === GROWTH - Croissance Active ===
            'BLUE_CHIP_COMBO': {
                name: 'Blue Chip Combo',
                icon: '💎',
                description: 'BTC + ETH avec rendement optimisé',
                riskLevel: 'Low-Medium',
                expectedApy: { min: 6.0, max: 12.0 },
                capitalProtection: 0.80,
                allocation: [
                    { product: 'staking', id: 'ETH', weight: 0.35 },
                    { product: 'vault', id: 'BLUE_CHIP', weight: 0.30 },
                    { product: 'dca', id: 'BLUE_CHIP_MIX', weight: 0.25 },
                    { product: 'bond', id: 'TREASURY_7D', weight: 0.10 }
                ],
                minInvestment: 500,
                rebalanceFrequency: 'weekly'
            },

            'YIELD_HUNTER': {
                name: 'Yield Hunter',
                icon: '🎯',
                description: 'Chasse aux meilleurs rendements - APY optimisé',
                riskLevel: 'Medium',
                expectedApy: { min: 8.0, max: 15.0 },
                capitalProtection: 0.75,
                allocation: [
                    { product: 'yield', id: 'MULTI_CHAIN', weight: 0.35 },
                    { product: 'bond', id: 'HIGH_YIELD_60D', weight: 0.25 },
                    { product: 'staking', id: 'SOL', weight: 0.20 },
                    { product: 'staking', id: 'ATOM', weight: 0.20 }
                ],
                minInvestment: 1000,
                rebalanceFrequency: 'daily'
            },

            // === DIVERSIFIED - Maximum Diversification ===
            'TOTAL_DIVERSIFIED': {
                name: 'Total Diversified',
                icon: '🌐',
                description: 'Diversification maximale - Tous les produits',
                riskLevel: 'Low-Medium',
                expectedApy: { min: 6.5, max: 11.0 },
                capitalProtection: 0.82,
                allocation: [
                    { product: 'vault', id: 'STABLE_YIELD', weight: 0.20 },
                    { product: 'staking', id: 'ETH', weight: 0.15 },
                    { product: 'bond', id: 'TREASURY_30D', weight: 0.15 },
                    { product: 'index', id: 'CRYPTO_TOP10', weight: 0.15 },
                    { product: 'yield', id: 'STABLE_MAX', weight: 0.15 },
                    { product: 'dca', id: 'DIVERSIFIED', weight: 0.10 },
                    { product: 'insurance', id: 'FULL_COVERAGE', weight: 0.10, isProtection: true }
                ],
                minInvestment: 1000,
                rebalanceFrequency: 'weekly'
            },

            'DEFI_EXPLORER': {
                name: 'DeFi Explorer',
                icon: '🚀',
                description: 'Exposition DeFi diversifiée avec filet de sécurité',
                riskLevel: 'Medium',
                expectedApy: { min: 8.0, max: 14.0 },
                capitalProtection: 0.70,
                allocation: [
                    { product: 'index', id: 'DEFI_INDEX', weight: 0.30 },
                    { product: 'vault', id: 'DEFI_SAFE', weight: 0.25 },
                    { product: 'yield', id: 'MULTI_CHAIN', weight: 0.25 },
                    { product: 'bond', id: 'CORPORATE_30D', weight: 0.20 }
                ],
                minInvestment: 500,
                rebalanceFrequency: 'daily'
            },

            // === INCOME - Revenu Passif ===
            'PASSIVE_INCOME': {
                name: 'Passive Income',
                icon: '💵',
                description: 'Revenu mensuel stable - Paiements réguliers',
                riskLevel: 'Low',
                expectedApy: { min: 5.5, max: 7.5 },
                capitalProtection: 0.95,
                allocation: [
                    { product: 'bond', id: 'TREASURY_30D', weight: 0.35 },
                    { product: 'bond', id: 'CORPORATE_30D', weight: 0.25 },
                    { product: 'vault', id: 'STABLE_YIELD', weight: 0.25 },
                    { product: 'yield', id: 'STABLE_MAX', weight: 0.15 }
                ],
                minInvestment: 1000,
                rebalanceFrequency: 'monthly',
                payoutFrequency: 'monthly'
            },

            'RETIREMENT_BUILDER': {
                name: 'Retirement Builder',
                icon: '🏖️',
                description: 'Accumulation long terme - Capital ultra-protégé',
                riskLevel: 'Minimal',
                expectedApy: { min: 5.0, max: 6.5 },
                capitalProtection: 0.98,
                allocation: [
                    { product: 'bond', id: 'TREASURY_90D', weight: 0.40 },
                    { product: 'vault', id: 'STABLE_YIELD', weight: 0.30 },
                    { product: 'index', id: 'STABLE_INCOME', weight: 0.20 },
                    { product: 'insurance', id: 'FULL_COVERAGE', weight: 0.10, isProtection: true }
                ],
                minInvestment: 5000,
                rebalanceFrequency: 'monthly'
            },

            // === EMERGING - Nouvelles Opportunités ===
            'L2_OPPORTUNITY': {
                name: 'Layer 2 Opportunity',
                icon: '⚡',
                description: 'Focus Layer 2 - ARB, OP, MATIC avec protection',
                riskLevel: 'Medium',
                expectedApy: { min: 9.0, max: 16.0 },
                capitalProtection: 0.65,
                allocation: [
                    { product: 'index', id: 'LAYER2_INDEX', weight: 0.35 },
                    { product: 'vault', id: 'EMERGING_SAFE', weight: 0.30 },
                    { product: 'staking', id: 'MATIC', weight: 0.20 },
                    { product: 'bond', id: 'TREASURY_7D', weight: 0.15 }
                ],
                minInvestment: 300,
                rebalanceFrequency: 'daily'
            },

            'STAKING_MASTER': {
                name: 'Staking Master',
                icon: '🔒',
                description: 'Multi-chain staking optimisé - Récompenses maximales',
                riskLevel: 'Low-Medium',
                expectedApy: { min: 6.0, max: 10.0 },
                capitalProtection: 0.85,
                allocation: [
                    { product: 'staking', id: 'ETH', weight: 0.30 },
                    { product: 'staking', id: 'SOL', weight: 0.25 },
                    { product: 'staking', id: 'ATOM', weight: 0.20 },
                    { product: 'staking', id: 'AVAX', weight: 0.15 },
                    { product: 'vault', id: 'STABLE_YIELD', weight: 0.10 }
                ],
                minInvestment: 500,
                rebalanceFrequency: 'weekly'
            },

            // === CUSTOM RISK LEVELS ===
            'ULTRA_CONSERVATIVE': {
                name: 'Ultra Conservative',
                icon: '🏦',
                description: 'Pour les investisseurs très prudents - 100% garanti',
                riskLevel: 'Minimal',
                expectedApy: { min: 4.0, max: 5.0 },
                capitalProtection: 1.0,
                allocation: [
                    { product: 'bond', id: 'TREASURY_7D', weight: 0.50 },
                    { product: 'vault', id: 'STABLE_YIELD', weight: 0.40 },
                    { product: 'insurance', id: 'STABLECOIN_DEPEG', weight: 0.10, isProtection: true }
                ],
                minInvestment: 50,
                rebalanceFrequency: 'daily'
            },

            'AGGRESSIVE_YIELD': {
                name: 'Aggressive Yield',
                icon: '🔥',
                description: 'Rendement agressif avec protection minimale',
                riskLevel: 'Medium-High',
                expectedApy: { min: 12.0, max: 20.0 },
                capitalProtection: 0.60,
                allocation: [
                    { product: 'bond', id: 'HIGH_YIELD_60D', weight: 0.30 },
                    { product: 'yield', id: 'MULTI_CHAIN', weight: 0.30 },
                    { product: 'staking', id: 'ATOM', weight: 0.20 },
                    { product: 'index', id: 'DEFI_INDEX', weight: 0.20 }
                ],
                minInvestment: 2000,
                rebalanceFrequency: 'daily'
            }
        };
    }

    invest(userId, comboId, amount, token = 'USDC') {
        const combo = this.combos[comboId];
        if (!combo) return { success: false, error: 'Combo not found' };
        if (amount < combo.minInvestment) {
            return { success: false, error: `Minimum investment: ${combo.minInvestment} ${token}` };
        }

        const investmentId = 'CMB_' + crypto.randomBytes(6).toString('hex');

        // Calculer les allocations
        const allocations = combo.allocation.map(alloc => ({
            ...alloc,
            amount: amount * alloc.weight,
            subInvestmentId: null // Sera rempli lors de l'exécution réelle
        }));

        // Calculer l'APY estimé
        const estimatedApy = (combo.expectedApy.min + combo.expectedApy.max) / 2;

        if (!this.investments.has(userId)) this.investments.set(userId, []);

        const investment = {
            id: investmentId,
            comboId,
            comboName: combo.name,
            icon: combo.icon,
            totalInvested: amount,
            token,
            allocations,
            expectedApy: combo.expectedApy,
            currentApy: estimatedApy,
            capitalProtection: combo.capitalProtection,
            riskLevel: combo.riskLevel,
            startDate: Date.now(),
            lastRebalance: Date.now(),
            rebalanceFrequency: combo.rebalanceFrequency,
            accruedYield: 0,
            status: 'active'
        };

        this.investments.get(userId).push(investment);

        return {
            success: true,
            investmentId,
            combo: combo.name,
            icon: combo.icon,
            totalInvested: amount,
            token,
            allocations: allocations.map(a => ({
                product: a.product,
                id: a.id,
                amount: a.amount.toFixed(2),
                weight: (a.weight * 100) + '%'
            })),
            expectedApy: `${combo.expectedApy.min}-${combo.expectedApy.max}%`,
            capitalProtection: (combo.capitalProtection * 100) + '%',
            riskLevel: combo.riskLevel,
            message: `Invested in ${combo.name} - Auto-diversified across ${combo.allocation.length} products`
        };
    }

    withdraw(userId, investmentId) {
        const userInvestments = this.investments.get(userId);
        if (!userInvestments) return { success: false, error: 'No investments found' };

        const index = userInvestments.findIndex(i => i.id === investmentId);
        if (index === -1) return { success: false, error: 'Investment not found' };

        const investment = userInvestments[index];

        // Calculer le yield
        const days = (Date.now() - investment.startDate) / (1000 * 60 * 60 * 24);
        const yield_ = investment.totalInvested * (investment.currentApy / 100) * (days / 365);

        // Appliquer la protection du capital
        const protectedAmount = investment.totalInvested * investment.capitalProtection;
        const totalReturn = Math.max(protectedAmount, investment.totalInvested + yield_);

        userInvestments.splice(index, 1);

        return {
            success: true,
            combo: investment.comboName,
            invested: investment.totalInvested,
            yield: yield_.toFixed(2),
            total: totalReturn.toFixed(2),
            token: investment.token,
            daysInvested: Math.floor(days),
            effectiveApy: ((yield_ / investment.totalInvested) * (365 / days) * 100).toFixed(2) + '%',
            capitalProtected: true
        };
    }

    rebalance(userId, investmentId) {
        const userInvestments = this.investments.get(userId);
        const investment = userInvestments?.find(i => i.id === investmentId);
        if (!investment) return { success: false, error: 'Investment not found' };

        const combo = this.combos[investment.comboId];

        // Recalculer les allocations avec le yield accumulé
        const days = (Date.now() - investment.lastRebalance) / (1000 * 60 * 60 * 24);
        const periodYield = investment.totalInvested * (investment.currentApy / 100) * (days / 365);

        investment.accruedYield += periodYield;
        investment.lastRebalance = Date.now();

        // Mettre à jour les allocations
        const newTotal = investment.totalInvested + investment.accruedYield;
        investment.allocations = combo.allocation.map(alloc => ({
            ...alloc,
            amount: newTotal * alloc.weight
        }));

        return {
            success: true,
            rebalanced: true,
            newAllocations: investment.allocations.map(a => ({
                product: a.product,
                id: a.id,
                newAmount: a.amount.toFixed(2)
            })),
            periodYield: periodYield.toFixed(2),
            totalAccruedYield: investment.accruedYield.toFixed(2)
        };
    }

    getUserInvestments(userId) {
        return (this.investments.get(userId) || []).map(inv => {
            const days = (Date.now() - inv.startDate) / (1000 * 60 * 60 * 24);
            const currentYield = inv.totalInvested * (inv.currentApy / 100) * (days / 365);

            return {
                ...inv,
                currentYield: currentYield.toFixed(2),
                totalValue: (inv.totalInvested + currentYield + inv.accruedYield).toFixed(2),
                daysInvested: Math.floor(days),
                nextRebalance: this.getNextRebalanceDate(inv)
            };
        });
    }

    getNextRebalanceDate(investment) {
        const frequencies = {
            'daily': 1,
            'weekly': 7,
            'monthly': 30
        };
        const daysToAdd = frequencies[investment.rebalanceFrequency] || 7;
        return new Date(investment.lastRebalance + (daysToAdd * 24 * 60 * 60 * 1000)).toLocaleDateString();
    }

    getCombos() {
        return Object.entries(this.combos).map(([id, combo]) => ({
            id,
            name: combo.name,
            icon: combo.icon,
            description: combo.description,
            riskLevel: combo.riskLevel,
            expectedApy: `${combo.expectedApy.min}-${combo.expectedApy.max}%`,
            capitalProtection: (combo.capitalProtection * 100) + '%',
            minInvestment: combo.minInvestment,
            rebalanceFrequency: combo.rebalanceFrequency,
            productsCount: combo.allocation.length,
            allocation: combo.allocation.map(a => ({
                product: a.product,
                id: a.id,
                weight: (a.weight * 100) + '%',
                isProtection: a.isProtection || false
            }))
        }));
    }

    getCombosByRisk(riskLevel) {
        return this.getCombos().filter(c => c.riskLevel === riskLevel);
    }

    getCombosByMinApy(minApy) {
        return this.getCombos().filter(c => {
            const min = parseFloat(c.expectedApy.split('-')[0]);
            return min >= minApy;
        });
    }

    getRecommendation(amount, riskTolerance = 'medium') {
        const riskMap = {
            'low': ['Minimal', 'Low'],
            'medium': ['Low', 'Low-Medium', 'Medium'],
            'high': ['Medium', 'Medium-High']
        };

        const acceptableRisks = riskMap[riskTolerance] || riskMap['medium'];

        const suitable = this.getCombos()
            .filter(c => acceptableRisks.includes(c.riskLevel))
            .filter(c => c.minInvestment <= amount)
            .sort((a, b) => {
                const apyA = parseFloat(a.expectedApy.split('-')[1]);
                const apyB = parseFloat(b.expectedApy.split('-')[1]);
                return apyB - apyA;
            });

        return {
            recommended: suitable[0] || null,
            alternatives: suitable.slice(1, 4),
            message: suitable.length > 0
                ? `Based on your ${riskTolerance} risk tolerance and ${amount} budget`
                : 'No suitable combos found for your criteria'
        };
    }
}

// ========================================
// EXPORT PRINCIPAL
// ========================================
class PassiveInvestmentProducts {
    constructor() {
        this.liquidStaking = new LiquidStaking();
        this.protectedVaults = new ProtectedVaults();
        this.fixedIncomeBonds = new FixedIncomeBonds();
        this.autoDCA = new AutoDCA();
        this.indexBaskets = new IndexBaskets();
        this.yieldOptimizer = new YieldOptimizer();
        this.insurancePool = new InsurancePool();
        this.comboProducts = new ComboProducts(this);
    }

    getAllProducts() {
        return {
            liquidStaking: {
                name: 'Liquid Staking',
                description: 'Stake tokens et recevez des tokens liquides tradables',
                riskLevel: 'Low',
                pools: this.liquidStaking.getPools()
            },
            protectedVaults: {
                name: 'Protected Vaults',
                description: 'Vaults à capital protégé avec rendement garanti',
                riskLevel: 'Minimal',
                vaults: this.protectedVaults.getVaults()
            },
            fixedIncomeBonds: {
                name: 'Fixed Income Bonds',
                description: 'Obligations à revenu fixe - Rendement garanti à maturité',
                riskLevel: 'Minimal',
                offerings: this.fixedIncomeBonds.getOfferings()
            },
            autoDCA: {
                name: 'Auto DCA',
                description: 'Dollar Cost Averaging automatique - Accumulation progressive',
                riskLevel: 'Variable',
                templates: this.autoDCA.getTemplates()
            },
            indexBaskets: {
                name: 'Index Baskets',
                description: 'Paniers diversifiés avec rééquilibrage automatique',
                riskLevel: 'Variable',
                indices: this.indexBaskets.getIndices()
            },
            yieldOptimizer: {
                name: 'Yield Optimizer',
                description: 'Optimisation automatique des rendements - APY minimum garanti',
                riskLevel: 'Low',
                strategies: this.yieldOptimizer.getStrategies()
            },
            insurancePool: {
                name: 'Insurance Pool',
                description: 'Assurance DeFi - Protection contre les risques',
                riskLevel: 'Protection',
                coverages: this.insurancePool.getCoverages()
            },
            comboProducts: {
                name: 'Combo Products',
                description: 'Stratégies combinées - Diversification automatique multi-produits',
                riskLevel: 'Variable',
                combos: this.comboProducts.getCombos()
            }
        };
    }
}

module.exports = {
    PassiveInvestmentProducts,
    LiquidStaking,
    ProtectedVaults,
    FixedIncomeBonds,
    AutoDCA,
    IndexBaskets,
    YieldOptimizer,
    InsurancePool,
    ComboProducts
};
