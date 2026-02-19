/**
 * OBELISK DEX - Simulated Portfolio System
 * Permet aux utilisateurs de simuler des investissements avec un capital virtuel
 * Pas de wallet requis - 100% simulation
 */

const SimulatedPortfolio = {
    // Portfolio state
    portfolio: {
        simulatedBalance: 0,  // Solde SIMULE (paper trading)
        realBalance: 0,       // Solde REEL (depuis wallet)
        totalDeposited: 0,    // Total des depots simules
        investments: [],      // Investissements actifs
        history: [],          // Historique des transactions
        totalEarnings: 0,     // Gains totaux
        createdAt: null
    },

    // Tri des investissements: 'all', 'simulated', 'real'
    sortOrder: 'all',
    filterType: 'all',

    // Compatibilite avec ancien code
    get balance() { return this.portfolio.simulatedBalance; },

    // Method version of balance getter for external modules
    getBalance() { return this.portfolio.simulatedBalance || 0; },

    // Prix actuels (mis a jour en temps reel)
    prices: {
        BTC: 97000,
        ETH: 3500,
        SOL: 200,
        USDC: 1
    },

    // Configuration
    config: {
        maxSimulatedBalance: 1000000000000,  // Pas de limite pratique
        minDeposit: 1,
        autoCompoundInterval: 3600000,  // 1 heure
        // Frais de conversion USDC -> Token
        conversionFees: {
            default: 1.00,      // 1 USDC par defaut
            BTC: 2.00,          // 2 USDC pour BTC
            ETH: 1.50,          // 1.50 USDC pour ETH
            SOL: 0.50,          // 0.50 USDC pour SOL
            staking: 0.50,      // Staking moins cher
            pools: 1.00,        // Liquidity pools
            vaults: 0.75,       // Vaults
            lending: 0.25,      // Lending tres bas
            savings: 0.10,      // Savings minimal
            indexFunds: 1.50    // Index funds
        },
        // Protection anti-retrait massif
        withdrawLimits: {
            maxPerTransaction: 50000,    // Max 50K par retrait
            cooldownMs: 60000,           // 1 minute entre retraits
            maxPerDay: 100000,           // Max 100K par jour
            maxWithdrawalsPerDay: 10     // Max 10 retraits par jour
        }
    },

    // Tracking des retraits
    withdrawalTracking: {
        lastWithdrawal: 0,
        dailyTotal: 0,
        dailyCount: 0,
        lastResetDate: null
    },

    /**
     * Calculer les frais de conversion pour un investissement
     */
    getConversionFee(category, token) {
        const fees = this.config.conversionFees;
        // D'abord verifier par token
        if (token && fees[token.toUpperCase()]) {
            return fees[token.toUpperCase()];
        }
        // Sinon par categorie
        if (category && fees[category]) {
            return fees[category];
        }
        return fees.default;
    },

    /**
     * Initialiser le systeme
     */
    init() {
        this.loadState();
        this.createUI();
        this.startEarningsCalculator();
        this.updatePrices();
        console.log('💰 Simulated Portfolio initialized');
    },

    /**
     * Charger l'etat sauvegarde
     */
    loadState() {
        const saved = localStorage.getItem('obelisk_simulated_portfolio');
        if (saved) {
            try {
                this.portfolio = JSON.parse(saved);

                // Migration: ancien format avec 'balance' -> nouveau format
                if (this.portfolio.balance !== undefined && this.portfolio.simulatedBalance === undefined) {
                    this.portfolio.simulatedBalance = this.portfolio.balance;
                    delete this.portfolio.balance;
                }

                // S'assurer que simulatedBalance existe
                if (this.portfolio.simulatedBalance === undefined) {
                    this.portfolio.simulatedBalance = 0;
                }

                // IMPORTANT: Le solde REEL ne peut venir QUE d'un wallet connecte
                // Reset le solde reel s'il n'y a pas de wallet connecte
                if (!this.checkWalletConnected()) {
                    this.portfolio.realBalance = 0;
                }

                // Migrer les anciens investissements sans isSimulated
                if (this.portfolio.investments) {
                    this.portfolio.investments.forEach(inv => {
                        if (inv.isSimulated === undefined) {
                            inv.isSimulated = true; // Ancien = simule par defaut
                        }
                    });
                }

                this.saveState();
                const total = (this.portfolio.simulatedBalance || 0) + (this.portfolio.realBalance || 0);
                console.log('💰 Portfolio loaded: $' + total.toFixed(2) + ' (Sim: $' + (this.portfolio.simulatedBalance || 0).toFixed(2) + ' | Real: $' + (this.portfolio.realBalance || 0).toFixed(2) + ')');
            } catch (e) {
                this.resetPortfolio();
            }
        } else {
            this.resetPortfolio();
        }
    },

    /**
     * Sauvegarder l'etat
     */
    saveState() {
        try {
            const data = JSON.stringify(this.portfolio);
            localStorage.setItem('obelisk_simulated_portfolio', data);

            // Marquer pour sync Firebase
            if (typeof FirebasePersistence !== 'undefined' && FirebasePersistence.isInitialized) {
                FirebasePersistence.markChanged();
            }

            console.log('💾 Portfolio saved:', this.portfolio.investments?.length || 0, 'investments');
        } catch (e) {
            console.error('💾 Save error:', e);
        }
    },

    /**
     * Reset le portfolio
     */
    resetPortfolio() {
        this.portfolio = {
            simulatedBalance: 0,
            realBalance: 0,
            totalDeposited: 0,
            investments: [],
            history: [],
            totalEarnings: 0,
            createdAt: Date.now()
        };
        this.saveState();
    },

    /**
     * Ajouter du solde SIMULE (paper trading)
     */
    addSimulatedBalance(amount) {
        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
            return { success: false, error: 'Montant invalide' };
        }
        if (amount > this.config.maxSimulatedBalance) {
            return { success: false, error: 'Montant max: $10M' };
        }

        this.portfolio.simulatedBalance += amount;
        this.portfolio.totalDeposited += amount;
        this.portfolio.history.push({
            type: 'deposit_simulated',
            amount,
            isSimulated: true,
            timestamp: Date.now(),
            description: 'Depot SIMULE'
        });

        this.saveState();
        this.updateUI();

        console.log(`🎮 Added $${amount.toLocaleString()} SIMULATED balance`);
        return { success: true, newBalance: this.portfolio.simulatedBalance };
    },

    /**
     * Ajouter du solde REEL (depuis wallet connecte)
     */
    addRealBalance(amount) {
        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
            return { success: false, error: 'Montant invalide' };
        }

        this.portfolio.realBalance += amount;
        this.portfolio.history.push({
            type: 'deposit_real',
            amount,
            isSimulated: false,
            timestamp: Date.now(),
            description: 'Depot REEL'
        });

        this.saveState();
        this.updateUI();

        console.log(`💎 Added $${amount.toLocaleString()} REAL balance`);
        return { success: true, newBalance: this.portfolio.realBalance };
    },

    /**
     * Investir dans un produit
     * @param isSimulated - true = simulation, false = reel (connecte au wallet)
     * @param token - token cible (pour calculer les frais)
     */
    invest(productId, productName, amount, apy, category = 'general', isSimulated = true, token = null) {
        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
            return { success: false, error: 'Montant invalide' };
        }

        // Calculer les frais de conversion
        const conversionFee = this.getConversionFee(category, token);
        const totalCost = amount + conversionFee;

        // Verifier le solde selon le type (montant + frais)
        if (isSimulated && totalCost > this.portfolio.simulatedBalance) {
            return { success: false, error: `Solde SIMULE insuffisant (besoin: $${totalCost.toFixed(2)} avec $${conversionFee.toFixed(2)} de frais)` };
        }
        if (!isSimulated && totalCost > this.portfolio.realBalance) {
            return { success: false, error: `Solde REEL insuffisant (besoin: $${totalCost.toFixed(2)} avec $${conversionFee.toFixed(2)} de frais)` };
        }

        const investment = {
            id: 'INV_' + Date.now(),
            productId,
            productName,
            amount,
            apy,
            category,
            isSimulated,  // true = simule, false = reel
            startDate: Date.now(),
            earnings: 0,
            lastCompound: Date.now(),
            conversionFee  // Stocker les frais payes
        };

        // Deduire du solde correspondant (montant + frais)
        if (isSimulated) {
            this.portfolio.simulatedBalance -= totalCost;
        } else {
            this.portfolio.realBalance -= totalCost;
        }
        this.portfolio.investments.push(investment);
        this.portfolio.history.push({
            type: 'invest',
            productId,
            productName,
            amount,
            conversionFee,
            totalCost,
            apy,
            isSimulated,
            timestamp: Date.now(),
            description: `Investissement ${isSimulated ? 'SIMULE' : 'REEL'} dans ${productName} (frais: $${conversionFee.toFixed(2)})`
        });

        this.saveState();
        this.updateUI();

        const label = isSimulated ? 'SIMULE' : 'REEL';
        console.log(`💰 [${label}] Invested $${amount.toLocaleString()} in ${productName} (${apy}% APY) - Fee: $${conversionFee.toFixed(2)}`);
        return { success: true, investment, conversionFee };
    },

    /**
     * Track a DeFi investment (on-chain) without balance check
     * Used when money goes directly to blockchain protocols
     */
    trackDeFiInvestment(productId, productName, amount, apy, category = 'defi', txHash = null) {
        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
            return { success: false, error: 'Montant invalide' };
        }

        const investment = {
            id: 'DEFI_' + Date.now(),
            productId,
            productName,
            amount,
            apy,
            category,
            isSimulated: false,  // DeFi = always real
            isDeFi: true,        // Flag for DeFi investments
            txHash,              // Blockchain transaction hash
            startDate: Date.now(),
            earnings: 0,
            lastCompound: Date.now(),
            conversionFee: 0     // No conversion fee for direct DeFi
        };

        this.portfolio.investments.push(investment);
        this.portfolio.history.push({
            type: 'invest_defi',
            productId,
            productName,
            amount,
            apy,
            txHash,
            isSimulated: false,
            timestamp: Date.now(),
            description: `Investissement DeFi RÉEL dans ${productName}` + (txHash ? ` (tx: ${txHash.slice(0,10)}...)` : '')
        });

        this.saveState();
        this.updateUI();

        console.log(`💎 [DEFI] Tracked $${amount.toLocaleString()} in ${productName} (${apy}% APY)` + (txHash ? ` tx:${txHash.slice(0,10)}` : ''));
        return { success: true, investment };
    },

    /**
     * Retirer un investissement
     */
    /**
     * Verifier et reinitialiser les limites quotidiennes
     */
    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.withdrawalTracking.lastResetDate !== today) {
            this.withdrawalTracking.dailyTotal = 0;
            this.withdrawalTracking.dailyCount = 0;
            this.withdrawalTracking.lastResetDate = today;
        }
    },

    /**
     * Verifier si le retrait est autorise
     */
    canWithdraw(amount) {
        this.checkDailyReset();
        const limits = this.config.withdrawLimits;
        const tracking = this.withdrawalTracking;
        const now = Date.now();

        // Verifier cooldown
        if (now - tracking.lastWithdrawal < limits.cooldownMs) {
            const waitSec = Math.ceil((limits.cooldownMs - (now - tracking.lastWithdrawal)) / 1000);
            return { allowed: false, error: `Attendez ${waitSec}s avant le prochain retrait` };
        }

        // Verifier limite par transaction
        if (amount > limits.maxPerTransaction) {
            return { allowed: false, error: `Retrait max: ${limits.maxPerTransaction.toLocaleString()} par transaction` };
        }

        // Verifier limite quotidienne en montant
        if (tracking.dailyTotal + amount > limits.maxPerDay) {
            const remaining = limits.maxPerDay - tracking.dailyTotal;
            return { allowed: false, error: `Limite quotidienne. Reste: ${remaining.toLocaleString()}` };
        }

        // Verifier nombre de retraits quotidiens
        if (tracking.dailyCount >= limits.maxWithdrawalsPerDay) {
            return { allowed: false, error: "Limite atteinte" };
        }

        return { allowed: true };
    },

    withdraw(investmentId) {
        const index = this.portfolio.investments.findIndex(i => i.id === investmentId);
        if (index === -1) {
            return { success: false, error: 'Investissement non trouve' };
        }

        const inv = this.portfolio.investments[index];
        const totalValue = inv.amount + inv.earnings;

        // PROTECTION: Verifier les limites de retrait (seulement pour REEL)
        if (!inv.isSimulated) {
            const canWithdrawResult = this.canWithdraw(totalValue);
            if (!canWithdrawResult.allowed) {
                if (typeof showNotification === 'function') {
                    showNotification(canWithdrawResult.error, 'error');
                }
                return { success: false, error: canWithdrawResult.error };
            }

            // Mettre a jour le tracking
            this.withdrawalTracking.lastWithdrawal = Date.now();
            this.withdrawalTracking.dailyTotal += totalValue;
            this.withdrawalTracking.dailyCount++;
        }

        // Retourner au bon solde (simule ou reel)
        if (inv.isSimulated) {
            this.portfolio.simulatedBalance += totalValue;
        } else {
            this.portfolio.realBalance += totalValue;
        }
        this.portfolio.totalEarnings += inv.earnings;
        this.portfolio.investments.splice(index, 1);
        this.portfolio.history.push({
            type: 'withdraw',
            productId: inv.productId,
            productName: inv.productName,
            amount: totalValue,
            earnings: inv.earnings,
            isSimulated: inv.isSimulated,
            timestamp: Date.now(),
            description: `Retrait ${inv.isSimulated ? 'SIMULE' : 'REEL'} de ${inv.productName}`
        });

        this.saveState();
        this.updateUI();

        const label = inv.isSimulated ? 'SIMULE' : 'REEL';
        console.log(`💰 [${label}] Withdrew $${totalValue.toFixed(2)} from ${inv.productName}`);
        return { success: true, amount: totalValue, earnings: inv.earnings };
    },

    /**
     * Calculer les gains en temps reel
     */
    calculateEarnings() {
        const now = Date.now();
        this.portfolio.investments.forEach(inv => {
            const daysSinceStart = (now - inv.startDate) / (1000 * 60 * 60 * 24);
            const dailyRate = inv.apy / 365 / 100;
            inv.earnings = inv.amount * dailyRate * daysSinceStart;
        });
        this.saveState();
    },

    /**
     * Demarrer le calculateur de gains
     */
    startEarningsCalculator() {
        // Calculer tres frequemment pour les simulations rapides (100ms)
        setInterval(() => {
            this.calculateEarnings();
            this.updateUI();
        }, 100);  // 100ms = 10 fois par seconde

        // Premier calcul immediat
        this.calculateEarnings();
    },

    /**
     * Simulation acceleree: avancer le temps pour un investissement
     * @param investmentId - ID de l'investissement
     * @param daysToAdd - Nombre de jours a simuler (peut etre decimal: 0.001 = ~1.4 minutes)
     */
    fastForward(investmentId, daysToAdd) {
        const inv = this.portfolio.investments.find(i => i.id === investmentId);
        if (!inv) return { success: false, error: 'Investissement non trouve' };

        // Simuler le temps passe
        const msToAdd = daysToAdd * 24 * 60 * 60 * 1000;
        inv.startDate -= msToAdd;

        // Recalculer les gains
        const daysSinceStart = (Date.now() - inv.startDate) / (1000 * 60 * 60 * 24);
        const dailyRate = inv.apy / 365 / 100;
        inv.earnings = inv.amount * dailyRate * daysSinceStart;

        this.saveState();
        this.updateUI();

        console.log(`⏩ Fast-forward ${daysToAdd} jours sur ${inv.productName}: +$${inv.earnings.toFixed(4)}`);
        return { success: true, newEarnings: inv.earnings, totalDays: daysSinceStart };
    },

    /**
     * Simulation acceleree pour TOUS les investissements
     * @param daysToAdd - Jours a avancer (0.001 = ~1.4 min, 0.01 = ~14 min, 1 = 1 jour)
     */
    fastForwardAll(daysToAdd) {
        const msToAdd = daysToAdd * 24 * 60 * 60 * 1000;
        let totalNewEarnings = 0;

        this.portfolio.investments.forEach(inv => {
            inv.startDate -= msToAdd;
            const daysSinceStart = (Date.now() - inv.startDate) / (1000 * 60 * 60 * 24);
            const dailyRate = inv.apy / 365 / 100;
            inv.earnings = inv.amount * dailyRate * daysSinceStart;
            totalNewEarnings += inv.earnings;
        });

        this.saveState();
        this.updateUI();

        console.log(`⏩ Fast-forward ALL ${daysToAdd} jours: Total earnings = $${totalNewEarnings.toFixed(4)}`);
        return { success: true, totalEarnings: totalNewEarnings };
    },

    /**
     * Calculer le PnL par période (projeté)
     */
    /**
     * Get 24h PnL for dashboard
     */
    getPnL24h() {
        return this.getPnLByPeriod().daily;
    },

    getPnLByPeriod() {
        let daily = 0, weekly = 0, monthly = 0, yearly = 0;
        this.portfolio.investments.forEach(inv => {
            const amount = parseFloat(inv.amount) || 0;
            const apy = parseFloat(inv.apy) || 0;
            const dailyRate = apy / 100 / 365;
            daily += amount * dailyRate;
            weekly += amount * dailyRate * 7;
            monthly += amount * dailyRate * 30;
            yearly += amount * (apy / 100);
        });
        // Ensure no NaN values
        return {
            daily: Number.isFinite(daily) ? daily : 0,
            weekly: Number.isFinite(weekly) ? weekly : 0,
            monthly: Number.isFinite(monthly) ? monthly : 0,
            yearly: Number.isFinite(yearly) ? yearly : 0
        };
    },

    /**
     * Filtrer par type
     */
    setFilterType(type) {
        this.filterType = type;
        this.openModal();
    },

    /**
     * Calculer PnL d'un investissement
     */
    calculateInvPnL(inv) {
        if (!inv) return 0;
        const timestamp = inv.timestamp || inv.startDate || Date.now();
        const days = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24);
        const amount = parseFloat(inv.amount) || 0;
        const apy = parseFloat(inv.apy) || 0;
        const safeDays = Number.isFinite(days) && days >= 0 ? days : 0;
        const result = amount * (apy / 100) * (safeDays / 365);
        return Number.isFinite(result) ? result : 0;
    },


    /**
     * Obtenir le total du portfolio (simule + reel)
     */
    getTotalValue() {
        let investedValue = 0;
        let totalEarnings = 0;
        let simulatedInvested = 0;
        let realInvested = 0;
        let simulatedEarnings = 0;
        let realEarnings = 0;
        let simulatedPositions = 0;
        let realPositions = 0;

        // Safe number helper
        const safe = (n) => Number.isFinite(parseFloat(n)) ? parseFloat(n) : 0;

        this.portfolio.investments.forEach(inv => {
            const amount = safe(inv.amount);
            const earnings = safe(inv.earnings);
            investedValue += amount;
            totalEarnings += earnings;
            if (inv.isSimulated) {
                simulatedInvested += amount;
                simulatedEarnings += earnings;
                simulatedPositions++;
            } else {
                realInvested += amount;
                realEarnings += earnings;
                realPositions++;
            }
        });

        const simBalance = safe(this.portfolio.simulatedBalance);
        const realBalance = safe(this.portfolio.realBalance);

        // Total simulated = balance + invested + earnings
        const simulatedTotal = simBalance + simulatedInvested + simulatedEarnings;
        // Total real = balance + invested + earnings
        const realTotal = realBalance + realInvested + realEarnings;

        return {
            simulatedBalance: simBalance,
            realBalance: realBalance,
            balance: simBalance + realBalance,  // Compatibilite
            invested: investedValue,
            simulatedInvested,
            realInvested,
            earnings: totalEarnings,
            simulatedEarnings,
            realEarnings,
            simulatedPositions,
            realPositions,
            simulatedTotal,
            realTotal,
            total: simBalance + realBalance + investedValue + totalEarnings
        };
    },

    /**
     * Obtenir les statistiques par produit (simule vs reel)
     */
    getProductStats(productId) {
        let simulated = { amount: 0, earnings: 0, count: 0 };
        let real = { amount: 0, earnings: 0, count: 0 };

        this.portfolio.investments.forEach(inv => {
            if (inv.productId === productId) {
                if (inv.isSimulated) {
                    simulated.amount += inv.amount;
                    simulated.earnings += inv.earnings;
                    simulated.count++;
                } else {
                    real.amount += inv.amount;
                    real.earnings += inv.earnings;
                    real.count++;
                }
            }
        });

        return { simulated, real, total: simulated.amount + real.amount };
    },

    /**
     * Obtenir tous les produits avec leurs stats
     */
    getAllProductStats() {
        const stats = {};

        this.portfolio.investments.forEach(inv => {
            if (!stats[inv.productId]) {
                stats[inv.productId] = {
                    productId: inv.productId,
                    productName: inv.productName,
                    apy: inv.apy,
                    simulated: { amount: 0, earnings: 0 },
                    real: { amount: 0, earnings: 0 }
                };
            }

            if (inv.isSimulated) {
                stats[inv.productId].simulated.amount += inv.amount;
                stats[inv.productId].simulated.earnings += inv.earnings;
            } else {
                stats[inv.productId].real.amount += inv.amount;
                stats[inv.productId].real.earnings += inv.earnings;
            }
        });

        return Object.values(stats);
    },

    /**
     * Creer l'interface utilisateur
     */
    createUI() {
        // Bouton flottant pour ouvrir le portfolio
        const btn = document.createElement('button');
        btn.id = 'simulated-portfolio-btn';
        btn.innerHTML = '💰 Mon Portfolio';
        btn.onclick = () => this.openModal();
        btn.style.cssText = `
            position: fixed;
            bottom: 140px;
            right: 20px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #000;
            border: none;
            padding: 12px 20px;
            border-radius: 30px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            z-index: 8000;
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
            transition: all 0.3s;
        `;
        btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        document.body.appendChild(btn);

        // Mettre a jour le bouton avec le solde
        this.updateButtonBadge();
        this.updateMainPortfolio();
    },

    updateButtonBadge() {
        const btn = document.getElementById('simulated-portfolio-btn');
        if (btn) {
            const total = this.getTotalValue().total;
            btn.innerHTML = `💰 $${this.formatAmount(total)}`;
        }
    },

    /**
     * Ouvrir le modal du portfolio
     */
    /**
     * Obtenir l'adresse Obelisk de l'utilisateur
     */
    getWalletAddress() {
        // Essayer de recuperer l'adresse depuis le wallet connecte
        if (typeof window.walletAddress !== 'undefined' && window.walletAddress) {
            return window.walletAddress;
        }
        if (typeof WalletConnect !== 'undefined' && WalletConnect.address) {
            return WalletConnect.address;
        }
        // Generer une adresse Obelisk simulee si pas connecte
        if (!this.portfolio.obeliskAddress) {
            this.portfolio.obeliskAddress = '0x' + Array.from({length: 40}, () =>
                Math.floor(Math.random() * 16).toString(16)).join('');
            this.saveState();
        }
        return this.portfolio.obeliskAddress;
    },

    /**
     * Formater l'adresse (raccourcie)
     */
    formatAddress(addr) {
        if (!addr) return 'Non connecte';
        return addr.slice(0, 6) + '...' + addr.slice(-4);
    },

    openModal() {
        const existing = document.getElementById('portfolio-modal');
        if (existing) existing.remove();

        const totals = this.getTotalValue();
        const walletAddr = this.getWalletAddress();

        const modal = document.createElement('div');
        modal.id = 'portfolio-modal';
        modal.innerHTML = `
            <div class="portfolio-modal-content">
                <div class="portfolio-header">
                    <h2>💰 Mon Profil Obelisk</h2>
                    <p class="portfolio-subtitle">Testez vos strategies sans risque</p>
                    <button class="portfolio-close" onclick="SimulatedPortfolio.closeModal()">✕</button>
                </div>

                <!-- Profil Utilisateur -->
                <div class="user-profile-section">
                    <div class="profile-address">
                        <span class="address-label">📍 Mon Adresse Obelisk:</span>
                        <span class="address-value" title="${walletAddr}">${this.formatAddress(walletAddr)}</span>
                        <button class="btn-copy" onclick="navigator.clipboard.writeText('${walletAddr}'); SimulatedPortfolio.showNotification('Adresse copiee!', 'success');">📋</button>
                    </div>
                    <div class="profile-balances">
                        <div class="balance-row simulated">
                            <span class="balance-icon">🎮</span>
                            <span class="balance-label">Solde SIMULE:</span>
                            <span class="balance-amount simulated-color">${this.formatAmount(totals.simulatedBalance)} USDC</span>
                        </div>
                        <div class="balance-row real">
                            <span class="balance-icon">💎</span>
                            <span class="balance-label">Solde REEL:</span>
                            <span class="balance-amount real-color">${this.formatAmount(totals.realBalance)} USDC</span>
                        </div>
                    </div>
                </div>

                <div class="portfolio-body">
                    <!-- Ajouter du solde SIMULE -->
                    <div class="add-balance-section simulated">
                        <h3>🎮 Ajouter Capital SIMULE</h3>
                        <div class="add-balance-form">
                            <input type="number" id="add-balance-amount" placeholder="Montant en USDC" value="100000">
                            <div class="quick-add-btns">
                                <button onclick="SimulatedPortfolio.quickAdd(1000)">+$1K</button>
                                <button onclick="SimulatedPortfolio.quickAdd(10000)">+$10K</button>
                                <button onclick="SimulatedPortfolio.quickAdd(100000)">+$100K</button>
                                <button onclick="SimulatedPortfolio.quickAdd(1000000)">+$1M</button>
                                <button onclick="SimulatedPortfolio.quickAdd(10000000)">+$10M</button>
                                <button onclick="SimulatedPortfolio.quickAdd(100000000)">+$100M</button>
                            </div>
                            <button class="btn-add-balance simulated" onclick="SimulatedPortfolio.addFromInput()">
                                🎮 Ajouter au Solde Simule
                            </button>
                        </div>
                    </div>

                    <!-- Ajouter du solde REEL -->
                    <div class="add-balance-section real">
                        <h3>💎 Ajouter Capital REEL</h3>
                        <div class="add-balance-form">
                            <input type="number" id="add-real-balance-amount" placeholder="Montant en USDC" value="1000">
                            <div class="quick-add-btns real">
                                <button onclick="SimulatedPortfolio.quickAddReal(100)">+$100</button>
                                <button onclick="SimulatedPortfolio.quickAddReal(500)">+$500</button>
                                <button onclick="SimulatedPortfolio.quickAddReal(1000)">+$1K</button>
                                <button onclick="SimulatedPortfolio.quickAddReal(5000)">+$5K</button>
                            </div>
                            <button class="btn-add-balance real" onclick="SimulatedPortfolio.addRealFromInput()">
                                💎 Ajouter au Solde Reel
                            </button>
                        </div>
                    </div>

                    <!-- Resume du portfolio -->
                    <div class="portfolio-summary dual">
                        <div class="summary-card simulated-balance">
                            <span class="summary-label">🎮 Solde SIMULE</span>
                            <span class="summary-value simulated" id="modal-simulated-balance">$${this.formatAmount(this.portfolio.simulatedBalance)}</span>
                        </div>
                        <div class="summary-card real-balance">
                            <span class="summary-label">💎 Solde REEL
                                <button onclick="SimulatedPortfolio.refreshRealBalance()" title="Rafraîchir depuis le wallet" style="background:none;border:none;cursor:pointer;font-size:12px;padding:2px;">🔄</button>
                            </span>
                            <span class="summary-value real" id="modal-real-balance">$${this.formatAmount(this.portfolio.realBalance)}</span>
                        </div>
                        <div class="summary-card invested">
                            <span class="summary-label">Investi</span>
                            <span class="summary-value" id="modal-invested">$${this.formatAmount(totals.invested)}</span>
                        </div>
                        <div class="summary-card earnings">
                            <span class="summary-label">Gains</span>
                            <span class="summary-value positive" id="modal-earnings">+$${(totals.earnings || 0).toFixed(2)}</span>
                        </div>
                        <div class="summary-card total">
                            <span class="summary-label">Total Global</span>
                            <span class="summary-value" id="modal-total">$${this.formatAmount(totals.total)}</span>
                        </div>
                    </div>

                    
                    <!-- PnL par Periode -->
                    <div class="pnl-periods" style="background:linear-gradient(135deg,rgba(0,212,170,0.1),rgba(0,168,132,0.05));border:1px solid rgba(0,212,170,0.3);border-radius:12px;padding:15px;margin-bottom:20px;">
                        <h4 style="color:#888;font-size:12px;margin:0 0 10px 0;">📊 Rendement Projeté</h4>
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
                            <div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                                <span style="display:block;color:#888;font-size:11px;">24h</span>
                                <span style="display:block;color:#00d4aa;font-size:16px;font-weight:600;">+${this.getPnLByPeriod().daily.toFixed(2)}</span>
                            </div>
                            <div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                                <span style="display:block;color:#888;font-size:11px;">7 jours</span>
                                <span style="display:block;color:#00d4aa;font-size:16px;font-weight:600;">+${this.getPnLByPeriod().weekly.toFixed(2)}</span>
                            </div>
                            <div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                                <span style="display:block;color:#888;font-size:11px;">30 jours</span>
                                <span style="display:block;color:#00d4aa;font-size:16px;font-weight:600;">+${this.getPnLByPeriod().monthly.toFixed(2)}</span>
                            </div>
                            <div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                                <span style="display:block;color:#888;font-size:11px;">1 an</span>
                                <span style="display:block;color:#00d4aa;font-size:16px;font-weight:600;">+${this.getPnLByPeriod().yearly.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Acceleration du temps -->
                    <div class="time-acceleration-section">
                        <h3>⏩ Accelerer le Temps (Simulation)</h3>
                        <div class="time-btns">
                            <button onclick="SimulatedPortfolio.fastForwardAll(0.001)">+1 min</button>
                            <button onclick="SimulatedPortfolio.fastForwardAll(0.01)">+15 min</button>
                            <button onclick="SimulatedPortfolio.fastForwardAll(0.042)">+1 heure</button>
                            <button onclick="SimulatedPortfolio.fastForwardAll(1)">+1 jour</button>
                            <button onclick="SimulatedPortfolio.fastForwardAll(7)">+1 sem</button>
                            <button onclick="SimulatedPortfolio.fastForwardAll(30)">+1 mois</button>
                            <button onclick="SimulatedPortfolio.fastForwardAll(365)">+1 an</button>
                        </div>
                    </div>

                    <!-- Investissements actifs -->
                    <div class="active-investments">
                        <div class="investments-header">
                            <h3>📊 Investissements Actifs</h3>
                            <div class="sort-buttons">
                                <button class="sort-btn ${this.sortOrder === 'all' ? 'active' : ''}" onclick="SimulatedPortfolio.setSortOrder('all')">Tous</button>
                                <button class="sort-btn simulated ${this.sortOrder === 'simulated' ? 'active' : ''}" onclick="SimulatedPortfolio.setSortOrder('simulated')">🎮 Simulé</button>
                                <button class="sort-btn real ${this.sortOrder === 'real' ? 'active' : ''}" onclick="SimulatedPortfolio.setSortOrder('real')">💎 Réel</button>
                            </div>
                        </div>
                        <div class="investments-list" id="investments-list">
                            ${this.renderInvestments()}
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="portfolio-actions">
                        <button class="btn-invest-now" onclick="SimulatedPortfolio.closeModal(); InvestmentSimulator.open();">
                            📊 Simuler un Investissement
                        </button>
                        <button class="btn-reset" onclick="SimulatedPortfolio.confirmReset()">
                            🔄 Reset Portfolio
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            backdrop-filter: blur(8px);
        `;

        document.body.appendChild(modal);
        this.injectStyles();
    },

    closeModal() {
        const modal = document.getElementById('portfolio-modal');
        if (modal) modal.remove();
    },

    /**
     * Changer l'ordre de tri des investissements
     */
    setSortOrder(order) {
        this.sortOrder = order;
        this.openModal(); // Refresh
    },

    /**
     * Obtenir les investissements filtrés/triés
     */
    getFilteredInvestments() {
        let investments = [...this.portfolio.investments];

        if (this.sortOrder === 'simulated') {
            // Simulés en premier, puis réels
            investments.sort((a, b) => {
                if (a.isSimulated && !b.isSimulated) return -1;
                if (!a.isSimulated && b.isSimulated) return 1;
                return 0;
            });
        } else if (this.sortOrder === 'real') {
            // Réels en premier, puis simulés
            investments.sort((a, b) => {
                if (!a.isSimulated && b.isSimulated) return -1;
                if (a.isSimulated && !b.isSimulated) return 1;
                return 0;
            });
        }

        return investments;
    },

    renderInvestments() {
        if (this.portfolio.investments.length === 0) {
            return `
                <div class="no-investments">
                    <p>Aucun investissement actif</p>
                    <p class="hint">Utilisez le simulateur pour investir votre capital</p>
                </div>
            `;
        }

        // Filtrer selon le tri
        const filteredInvestments = this.getFilteredInvestments();

        // Si filtre actif, afficher les investissements individuels
        if (this.sortOrder !== 'all') {
            const filtered = this.sortOrder === 'simulated'
                ? filteredInvestments.filter(i => i.isSimulated)
                : filteredInvestments.filter(i => !i.isSimulated);

            if (filtered.length === 0) {
                const label = this.sortOrder === 'simulated' ? 'simulé' : 'réel';
                return `
                    <div class="no-investments">
                        <p>Aucun investissement ${label}</p>
                    </div>
                `;
            }

            return filtered.map(inv => this.renderSingleInvestment(inv)).join('');
        }

        // Grouper par produit avec stats simule/reel
        const productStats = this.getAllProductStats();

        if (productStats.length === 0) {
            return this.portfolio.investments.map(inv => this.renderSingleInvestment(inv)).join('');
        }

        // Afficher par produit avec simule vs reel
        return productStats.map(product => `
            <div class="investment-product-group">
                <div class="product-header">
                    <span class="product-name">${product.productName}</span>
                    <span class="product-apy">${product.apy}% APY</span>
                </div>
                <div class="product-stats">
                    <div class="stat-row simulated">
                        <span class="stat-label">🎮 Simule:</span>
                        <span class="stat-amount">$${this.formatAmount(product.simulated.amount)}</span>
                        <span class="stat-earnings positive">+$${(product.simulated.earnings || 0).toFixed(2)}</span>
                    </div>
                    <div class="stat-row real">
                        <span class="stat-label">💎 Reel:</span>
                        <span class="stat-amount">$${this.formatAmount(product.real.amount)}</span>
                        <span class="stat-earnings positive">+$${(product.real.earnings || 0).toFixed(2)}</span>
                    </div>
                    <div class="stat-row total-row">
                        <span class="stat-label">Total:</span>
                        <span class="stat-amount total-amount">$${this.formatAmount(product.simulated.amount + product.real.amount)}</span>
                        <span class="stat-earnings total-earnings">+$${((product.simulated.earnings || 0) + (product.real.earnings || 0)).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderSingleInvestment(inv) {
        const daysActive = ((Date.now() - inv.startDate) / (1000 * 60 * 60 * 24)).toFixed(1);
        const dailyReturn = (inv.amount * inv.apy / 100 / 365).toFixed(2);
        const pnlPct = inv.amount > 0 ? ((inv.earnings / inv.amount) * 100).toFixed(2) : 0;
        const typeLabel = inv.isSimulated ? '🎮 SIMULE' : '💎 REEL';
        const typeClass = inv.isSimulated ? 'simulated' : 'real';

        return `
            <div class="investment-item ${typeClass}">
                <div class="inv-info">
                    <span class="inv-name">${inv.productName}</span>
                    <span class="inv-type-badge ${typeClass}">${typeLabel}</span>
                    <span class="inv-details">${inv.apy}% APY | ${daysActive} jours</span>
                </div>
                <div class="inv-values">
                    <span class="inv-amount">$${this.formatAmount(inv.amount)}</span>
                    <span class="inv-earnings positive">+${(inv.earnings || 0).toFixed(2)} (${pnlPct}%)</span>
                    <span class="inv-daily" style="color:#888;font-size:10px;">+${dailyReturn}/j</span>
                </div>
                <button class="btn-withdraw" onclick="SimulatedPortfolio.withdraw('${inv.id}')">
                    Retirer
                </button>
            </div>
        `;
    },

    quickAdd(amount) {
        document.getElementById('add-balance-amount').value = amount;
        this.addFromInput();
    },

    addFromInput() {
        const input = document.getElementById('add-balance-amount');
        const amount = parseFloat(input.value);
        const result = this.addSimulatedBalance(amount);

        if (result.success) {
            this.showNotification(`+$${amount.toLocaleString()} SIMULE ajoute!`, 'success');
            this.openModal(); // Refresh modal
        } else {
            this.showNotification(result.error, 'error');
        }
    },

    /**
     * Ajouter rapidement un montant REEL (via wallet)
     */
    quickAddReal(amount) {
        document.getElementById('add-real-balance-amount').value = amount;
        this.addRealFromInput();
    },

    /**
     * Ajouter depuis l'input REEL - demande au wallet
     */
    async addRealFromInput() {
        const input = document.getElementById('add-real-balance-amount');
        const amount = parseFloat(input.value);

        if (isNaN(amount) || amount <= 0) {
            this.showNotification(I18n?.t?.('invalid_amount') || 'Invalid amount', 'error');
            return;
        }

        // Verifier si wallet connecte
        const isConnected = this.checkWalletConnected();
        if (!isConnected) {
            this.showNotification(I18n?.t?.('connect_wallet_for_real') || 'Connect wallet to deposit real funds', 'warning');
            this.promptWalletConnect();
            return;
        }

        // Demander confirmation et transfert depuis le wallet
        try {
            console.log('[Deposit] Requesting confirmation for', amount, 'USDC');
            const confirmed = await this.requestWalletDeposit(amount);
            console.log('[Deposit] Confirmation result:', confirmed);

            if (confirmed) {
                console.log('[Deposit] Adding real balance...');
                const result = this.addRealBalance(amount);
                console.log('[Deposit] Add result:', result);

                if (result.success) {
                    this.showNotification(`+$${amount.toLocaleString()} USDC ${I18n?.t?.('deposited_from_wallet') || 'deposited from wallet'}!`, 'success');
                    this.openModal(); // Refresh modal
                } else {
                    this.showNotification(result.error || 'Erreur lors du dépôt', 'error');
                }
            } else {
                console.log('[Deposit] User cancelled');
            }
        } catch (err) {
            console.error('[Deposit] Error:', err);
            this.showNotification('Erreur: ' + err.message, 'error');
        }
    },

    /**
     * Rafraîchir le solde REEL depuis le wallet connecté
     */
    async refreshRealBalance() {
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        // Check if wallet is connected
        if (!this.checkWalletConnected()) {
            this.showNotification(
                isFr ? '⚠️ Connectez un wallet pour voir votre solde réel' : '⚠️ Connect a wallet to see your real balance',
                'warning'
            );
            return;
        }

        // Try to fetch USDC balance from WalletConnect
        if (typeof WalletConnect !== 'undefined' && WalletConnect.fetchAndUpdateUSDCBalance) {
            this.showNotification(
                isFr ? '🔄 Récupération du solde USDC...' : '🔄 Fetching USDC balance...',
                'info'
            );

            try {
                const balance = await WalletConnect.fetchAndUpdateUSDCBalance();
                if (balance > 0) {
                    this.showNotification(
                        isFr ? `✅ Solde mis à jour: $${balance.toFixed(2)} USDC` : `✅ Balance updated: $${balance.toFixed(2)} USDC`,
                        'success'
                    );
                } else {
                    this.showNotification(
                        isFr ? 'ℹ️ Aucun USDC détecté sur ce wallet' : 'ℹ️ No USDC detected on this wallet',
                        'info'
                    );
                }
            } catch (e) {
                console.error('Error refreshing balance:', e);
                this.showNotification(
                    isFr ? '❌ Erreur lors de la récupération du solde' : '❌ Error fetching balance',
                    'error'
                );
            }
        } else {
            this.showNotification(
                isFr ? '⚠️ WalletConnect non disponible' : '⚠️ WalletConnect not available',
                'warning'
            );
        }
    },

    /**
     * Verifier si un wallet est connecte (verification robuste)
     */
    checkWalletConnected() {
        // 1. WalletManager
        if (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) {
            return true;
        }
        // 2. WalletConnect
        if (typeof WalletConnect !== 'undefined' && (WalletConnect.address || WalletConnect.connected)) {
            return true;
        }
        // 3. window.walletAddress
        if (typeof window.walletAddress !== 'undefined' && window.walletAddress) {
            return true;
        }
        // 4. MetaMask directement
        if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
            return true;
        }
        // 5. localStorage
        if (localStorage.getItem('obelisk_wallet') || localStorage.getItem('metamask_connected')) {
            return true;
        }
        // 6. Mode demo
        if (localStorage.getItem('demo_mode') === 'true') {
            return true;
        }
        return false;
    },

    /**
     * Ouvrir le dialogue de connexion wallet
     */
    promptWalletConnect() {
        // Essayer d'ouvrir le modal de connexion wallet existant
        if (typeof WalletConnect !== 'undefined' && WalletConnect.openModal) {
            WalletConnect.openModal();
        } else if (document.querySelector('[data-action="connect-wallet"]')) {
            document.querySelector('[data-action="connect-wallet"]').click();
        } else {
            // Afficher un dialogue de connexion
            this.showWalletConnectDialog();
        }
    },

    /**
     * Afficher dialogue de connexion wallet
     */
    showWalletConnectDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'wallet-connect-dialog';
        const connectWallet = I18n?.t?.('connect_wallet') || 'Connect Wallet';
        const connectMsg = I18n?.t?.('connect_wallet_for_real') || 'Connect wallet to deposit real funds';
        const cancelText = I18n?.t?.('cancel') || 'Cancel';
        dialog.innerHTML = `
            <div class="wallet-dialog-content">
                <h3>🔗 ${connectWallet}</h3>
                <p>${connectMsg}</p>
                <div class="wallet-options">
                    <button onclick="SimulatedPortfolio.connectMetaMask()">
                        🦊 MetaMask
                    </button>
                    <button onclick="SimulatedPortfolio.connectWalletConnect()">
                        🔗 WalletConnect
                    </button>
                </div>
                <button class="btn-cancel" onclick="document.getElementById('wallet-connect-dialog').remove()">
                    ${cancelText}
                </button>
            </div>
        `;
        dialog.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20000;
        `;
        document.body.appendChild(dialog);

        // Injecter styles du dialog
        if (!document.getElementById('wallet-dialog-styles')) {
            const styles = document.createElement('style');
            styles.id = 'wallet-dialog-styles';
            styles.textContent = `
                .wallet-dialog-content {
                    background: #1a1a2e;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 16px;
                    padding: 24px;
                    text-align: center;
                    min-width: 300px;
                }
                .wallet-dialog-content h3 { color: #fff; margin: 0 0 12px; }
                .wallet-dialog-content p { color: #888; margin: 0 0 20px; }
                .wallet-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
                .wallet-options button {
                    padding: 14px 20px;
                    background: rgba(59, 130, 246, 0.2);
                    border: 1px solid rgba(59, 130, 246, 0.4);
                    border-radius: 10px;
                    color: #3b82f6;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .wallet-options button:hover { background: rgba(59, 130, 246, 0.3); }
                .btn-cancel {
                    background: none;
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #888;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(styles);
        }
    },

    /**
     * Connecter MetaMask
     */
    async connectMetaMask() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    window.walletAddress = accounts[0];
                    this.showNotification('Wallet connecte: ' + this.formatAddress(accounts[0]), 'success');
                    document.getElementById('wallet-connect-dialog')?.remove();
                    this.openModal();
                }
            } catch (err) {
                this.showNotification('Connexion refusee', 'error');
            }
        } else {
            this.showNotification('MetaMask non installe', 'error');
        }
    },

    /**
     * Connecter via WalletConnect
     */
    connectWalletConnect() {
        if (typeof WalletConnect !== 'undefined' && WalletConnect.connect) {
            WalletConnect.connect();
            document.getElementById('wallet-connect-dialog')?.remove();
        } else {
            this.showNotification('WalletConnect non disponible', 'error');
        }
    },

    /**
     * Demander un depot depuis le wallet
     */
    async requestWalletDeposit(amount) {
        console.log('[Deposit Dialog] Creating dialog for', amount, 'USDC');
        return new Promise((resolve) => {
            // Remove any existing dialog
            const existingDialog = document.getElementById('deposit-confirm-dialog');
            if (existingDialog) existingDialog.remove();

            const dialog = document.createElement('div');
            dialog.id = 'deposit-confirm-dialog';
            dialog.innerHTML = `
                <div class="deposit-dialog-content">
                    <h3>💎 Confirmer Depot</h3>
                    <p>Vous allez deposer depuis votre wallet:</p>
                    <div class="deposit-amount">${amount.toLocaleString()} USDC</div>
                    <p class="deposit-warning">⚠️ Cette action va demander une signature de votre wallet</p>
                    <div class="deposit-actions">
                        <button class="btn-confirm" onclick="console.log('[Deposit] Confirm clicked'); document.getElementById('deposit-confirm-dialog').remove(); if(window._depositResolve) window._depositResolve(true); else console.error('_depositResolve not found!');">
                            ✅ Confirmer le Depot
                        </button>
                        <button class="btn-cancel" onclick="console.log('[Deposit] Cancel clicked'); document.getElementById('deposit-confirm-dialog').remove(); if(window._depositResolve) window._depositResolve(false);">
                            Annuler
                        </button>
                    </div>
                </div>
            `;
            dialog.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 20000;
            `;

            // Injecter styles
            if (!document.getElementById('deposit-dialog-styles')) {
                const styles = document.createElement('style');
                styles.id = 'deposit-dialog-styles';
                styles.textContent = `
                    .deposit-dialog-content {
                        background: #1a1a2e;
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        border-radius: 16px;
                        padding: 24px;
                        text-align: center;
                        min-width: 320px;
                    }
                    .deposit-dialog-content h3 { color: #3b82f6; margin: 0 0 12px; }
                    .deposit-dialog-content p { color: #888; margin: 0 0 16px; }
                    .deposit-amount {
                        font-size: 32px;
                        font-weight: 700;
                        color: #3b82f6;
                        margin: 20px 0;
                    }
                    .deposit-warning {
                        font-size: 12px;
                        color: #f59e0b;
                        margin: 16px 0 !important;
                    }
                    .deposit-actions { display: flex; gap: 12px; justify-content: center; }
                    .deposit-actions .btn-confirm {
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #3b82f6, #2563eb);
                        border: none;
                        border-radius: 10px;
                        color: #fff;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .deposit-actions .btn-cancel {
                        padding: 12px 24px;
                        background: none;
                        border: 1px solid rgba(255,255,255,0.2);
                        border-radius: 10px;
                        color: #888;
                        cursor: pointer;
                    }
                `;
                document.head.appendChild(styles);
            }

            window._depositResolve = resolve;
            document.body.appendChild(dialog);
        });
    },

    confirmReset() {
        if (confirm('Voulez-vous vraiment reset votre portfolio simule? Tous les investissements seront perdus.')) {
            this.resetPortfolio();
            this.openModal();
            this.showNotification('Portfolio reset!', 'info');
        }
    },

        /**
     * Mettre a jour le portfolio principal du site
     */
    updateMainPortfolio() {
        const totals = this.getTotalValue();

        // Legacy elements (backward compatibility)
        const totalEl = document.getElementById('portfolio-total');
        const pnlEl = document.getElementById('portfolio-pnl');
        const positionsEl = document.getElementById('portfolio-positions');

        if (totalEl) totalEl.textContent = '$' + this.formatAmount(totals.total || 0);
        if (pnlEl) pnlEl.textContent = (totals.earnings >= 0 ? '+' : '') + '$' + (totals.earnings || 0).toFixed(2);
        if (positionsEl) positionsEl.textContent = this.portfolio.investments.length;

        // SIMULATED portfolio elements
        const totalSimEl = document.getElementById('portfolio-total-sim');
        const pnlSimEl = document.getElementById('portfolio-pnl-sim');
        const posSimEl = document.getElementById('portfolio-positions-sim');

        if (totalSimEl) totalSimEl.textContent = '$' + this.formatAmount(totals.simulatedTotal || 0);
        if (pnlSimEl) {
            pnlSimEl.textContent = (totals.simulatedEarnings >= 0 ? '+' : '') + '$' + (totals.simulatedEarnings || 0).toFixed(2);
            pnlSimEl.style.color = totals.simulatedEarnings >= 0 ? '#00ff88' : '#ff4444';
        }
        if (posSimEl) posSimEl.textContent = totals.simulatedPositions;

        // REAL portfolio elements
        const totalRealEl = document.getElementById('portfolio-total-real');
        const pnlRealEl = document.getElementById('portfolio-pnl-real');
        const posRealEl = document.getElementById('portfolio-positions-real');

        if (totalRealEl) totalRealEl.textContent = '$' + this.formatAmount(totals.realTotal || 0);
        if (pnlRealEl) {
            pnlRealEl.textContent = (totals.realEarnings >= 0 ? '+' : '') + '$' + (totals.realEarnings || 0).toFixed(2);
            pnlRealEl.style.color = totals.realEarnings >= 0 ? '#00ff88' : '#ff4444';
        }
        if (posRealEl) posRealEl.textContent = totals.realPositions;
    },

    updateUI() {
        this.updateButtonBadge();
        this.updateMainPortfolio();
        this.updateAllBalanceBanners();

        const modal = document.getElementById('portfolio-modal');
        if (modal) {
            const totals = this.getTotalValue();
            const simBalanceEl = document.getElementById('modal-simulated-balance');
            const realBalanceEl = document.getElementById('modal-real-balance');
            const investedEl = document.getElementById('modal-invested');
            const earningsEl = document.getElementById('modal-earnings');
            const totalEl = document.getElementById('modal-total');
            const listEl = document.getElementById('investments-list');

            if (simBalanceEl) simBalanceEl.textContent = '$' + this.formatAmount(totals.simulatedBalance);
            if (realBalanceEl) realBalanceEl.textContent = '$' + this.formatAmount(totals.realBalance);
            if (investedEl) investedEl.textContent = '$' + this.formatAmount(totals.invested);
            if (earningsEl) earningsEl.textContent = '+$' + (totals.earnings || 0).toFixed(2);
            if (totalEl) totalEl.textContent = '$' + this.formatAmount(totals.total);
            if (listEl) listEl.innerHTML = this.renderInvestments();
        }
    },

    /**
     * Sync real balance from connected wallet USDC
     */
    async syncWalletBalance() {
        if (typeof WalletConnect !== 'undefined' && WalletConnect.connected) {
            try {
                const usdcBalance = await WalletConnect.getUSDCBalance();
                if (usdcBalance > 0) {
                    this.portfolio.realBalance = usdcBalance;
                    this.saveState();
                    console.log(`[Portfolio] Synced wallet USDC: $${usdcBalance.toFixed(2)}`);
                }
            } catch (e) {
                console.error('[Portfolio] Failed to sync wallet balance:', e);
            }
        }
    },

    /**
     * Update all balance banners across the site
     */
    updateAllBalanceBanners() {
        const totals = this.getTotalValue();
        const simBalance = totals.simulatedBalance || 0;
        let realBalance = totals.realBalance || 0;

        // Also check wallet USDC if connected (show as available)
        if (typeof WalletConnect !== 'undefined' && WalletConnect.connected && WalletConnect.usdcBalance) {
            realBalance = Math.max(realBalance, WalletConnect.usdcBalance);
        }

        const totalAvailable = simBalance + realBalance;

        // Update combos section banner
        const combosTotalEl = document.getElementById('combos-total-balance');
        const combosSimEl = document.getElementById('combos-sim-balance');
        const combosRealEl = document.getElementById('combos-real-balance');
        if (combosTotalEl) combosTotalEl.textContent = '$' + this.formatAmount(totalAvailable);
        if (combosSimEl) combosSimEl.textContent = '$' + this.formatAmount(simBalance);
        if (combosRealEl) combosRealEl.textContent = '$' + this.formatAmount(realBalance);

        // Update investments section banner
        const investmentsTotalEl = document.getElementById('investments-total-balance');
        const investSimEl = document.getElementById('invest-sim-balance');
        const investRealEl = document.getElementById('invest-real-balance');
        const investSimProductsEl = document.getElementById('invest-sim-products');
        const investRealProductsEl = document.getElementById('invest-real-products');
        if (investmentsTotalEl) investmentsTotalEl.textContent = '$' + this.formatAmount(totalAvailable);
        if (investSimEl) investSimEl.textContent = '$' + this.formatAmount(simBalance);
        if (investRealEl) investRealEl.textContent = '$' + this.formatAmount(realBalance);
        if (investSimProductsEl) investSimProductsEl.textContent = totals.simulatedPositions || 0;
        if (investRealProductsEl) investRealProductsEl.textContent = totals.realPositions || 0;

        // Update products section banner
        const productsTotalEl = document.getElementById('products-total-balance');
        const productsSimEl = document.getElementById('products-sim-balance');
        const productsRealEl = document.getElementById('products-real-balance');
        const productsSimProductsEl = document.getElementById('products-sim-products');
        const productsRealProductsEl = document.getElementById('products-real-products');
        if (productsTotalEl) productsTotalEl.textContent = '$' + this.formatAmount(totalAvailable);
        if (productsSimEl) productsSimEl.textContent = '$' + this.formatAmount(simBalance);
        if (productsRealEl) productsRealEl.textContent = '$' + this.formatAmount(realBalance);
        if (productsSimProductsEl) productsSimProductsEl.textContent = totals.simulatedPositions || 0;
        if (productsRealProductsEl) productsRealProductsEl.textContent = totals.realPositions || 0;

        // Update any other banner with standard IDs
        document.querySelectorAll('[data-balance-type]').forEach(el => {
            const type = el.dataset.balanceType;
            if (type === 'total') el.textContent = '$' + this.formatAmount(totalAvailable);
            if (type === 'simulated') el.textContent = '$' + this.formatAmount(simBalance);
            if (type === 'real') el.textContent = '$' + this.formatAmount(realBalance);
        });
    },

    formatAmount(value) {
        if (!Number.isFinite(value)) return '0.00';
        if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B';
        if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
        if (value >= 10000) {
            // Format with spaces for thousands: 100 000.00
            return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
        return value.toFixed(2);
    },

    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    },

    updatePrices() {
        // Use PriceService if available, otherwise use static prices
        setInterval(() => {
            try {
                if (typeof PriceService !== 'undefined' && PriceService.priceCache) {
                    Object.entries(PriceService.priceCache).forEach(([symbol, data]) => {
                        if (data && data.price) {
                            this.prices[symbol] = data.price;
                        }
                    });
                }
            } catch (e) {
                // Silent fail - use static prices
            }
        }, 30000);
    },

    injectStyles() {
        if (document.getElementById('simulated-portfolio-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'simulated-portfolio-styles';
        styles.textContent = `
            .portfolio-modal-content {
                background: linear-gradient(180deg, #0a0a0f 0%, #0f1419 100%);
                border: 1px solid rgba(245, 158, 11, 0.3);
                border-radius: 20px;
                width: 95%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(245, 158, 11, 0.2);
            }

            .portfolio-header {
                padding: 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                position: relative;
            }

            .portfolio-header h2 {
                margin: 0;
                font-size: 24px;
                color: #f59e0b;
            }

            .portfolio-subtitle {
                margin: 8px 0 0;
                color: #888;
                font-size: 14px;
            }

            .portfolio-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
            }

            .portfolio-body {
                padding: 24px;
            }

            /* Profile Section */
            .user-profile-section {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(168, 85, 247, 0.1));
                border: 1px solid rgba(245, 158, 11, 0.3);
                border-radius: 16px;
                padding: 20px;
                margin: 0 24px 24px;
            }

            .profile-address {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .address-label {
                color: #888;
                font-size: 13px;
            }

            .address-value {
                font-family: 'Monaco', 'Menlo', monospace;
                background: rgba(0, 0, 0, 0.3);
                padding: 6px 12px;
                border-radius: 8px;
                color: #f59e0b;
                font-size: 14px;
                font-weight: 600;
            }

            .btn-copy {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                padding: 6px 10px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .btn-copy:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            .profile-balances {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .balance-row {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-radius: 10px;
            }

            .balance-row.simulated {
                background: rgba(168, 85, 247, 0.15);
                border: 1px solid rgba(168, 85, 247, 0.3);
            }

            .balance-row.real {
                background: rgba(59, 130, 246, 0.15);
                border: 1px solid rgba(59, 130, 246, 0.3);
            }

            .balance-icon {
                font-size: 20px;
            }

            .balance-label {
                flex: 1;
                color: #ccc;
                font-size: 14px;
            }

            .balance-amount {
                font-size: 18px;
                font-weight: 700;
            }

            .simulated-color {
                color: #a855f7;
            }

            .real-color {
                color: #3b82f6;
            }

            .add-balance-section {
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 24px;
            }

            .add-balance-section h3 {
                margin: 0 0 16px;
                color: #f59e0b;
                font-size: 16px;
            }

            .add-balance-form input {
                width: 100%;
                padding: 14px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: #fff;
                font-size: 18px;
                text-align: center;
                margin-bottom: 12px;
            }

            .quick-add-btns {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
                flex-wrap: wrap;
            }

            .quick-add-btns button {
                flex: 1;
                min-width: 60px;
                padding: 8px;
                background: rgba(245, 158, 11, 0.2);
                border: 1px solid rgba(245, 158, 11, 0.4);
                border-radius: 8px;
                color: #f59e0b;
                font-weight: 600;
                cursor: pointer;
            }

            .quick-add-btns button:hover {
                background: rgba(245, 158, 11, 0.3);
            }

            .btn-add-balance {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: none;
                border-radius: 10px;
                color: #000;
                font-weight: 700;
                font-size: 16px;
                cursor: pointer;
            }

            /* Section SIMULE style */
            .add-balance-section.simulated {
                background: rgba(168, 85, 247, 0.1);
                border-color: rgba(168, 85, 247, 0.3);
            }

            .add-balance-section.simulated h3 {
                color: #a855f7;
            }

            .add-balance-section.simulated .quick-add-btns button {
                background: rgba(168, 85, 247, 0.2);
                border-color: rgba(168, 85, 247, 0.4);
                color: #a855f7;
            }

            .btn-add-balance.simulated {
                background: linear-gradient(135deg, #a855f7, #7c3aed);
            }

            /* Section REEL style */
            .add-balance-section.real {
                background: rgba(59, 130, 246, 0.1);
                border-color: rgba(59, 130, 246, 0.3);
            }

            .add-balance-section.real h3 {
                color: #3b82f6;
            }

            .quick-add-btns.real button {
                background: rgba(59, 130, 246, 0.2);
                border-color: rgba(59, 130, 246, 0.4);
                color: #3b82f6;
            }

            .btn-add-balance.real {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
            }

            /* Balances dans summary */
            .summary-card.simulated-balance {
                background: rgba(168, 85, 247, 0.1);
                border-color: rgba(168, 85, 247, 0.3);
            }

            .summary-value.simulated {
                color: #a855f7;
            }

            .summary-card.real-balance {
                background: rgba(59, 130, 246, 0.1);
                border-color: rgba(59, 130, 246, 0.3);
            }

            .summary-value.real {
                color: #3b82f6;
            }

            .portfolio-summary {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-bottom: 24px;
            }

            .summary-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
            }

            .summary-card.total {
                grid-column: span 2;
                background: rgba(245, 158, 11, 0.1);
                border-color: rgba(245, 158, 11, 0.3);
            }

            .summary-label {
                display: block;
                font-size: 12px;
                color: #888;
                margin-bottom: 6px;
            }

            .summary-value {
                font-size: 20px;
                font-weight: 700;
                color: #fff;
            }

            .summary-value.positive {
                color: #00ff88;
            }

            .summary-card.total .summary-value {
                font-size: 28px;
                color: #f59e0b;
            }

            .active-investments h3 {
                margin: 0;
                color: #fff;
                font-size: 16px;
            }

            .investments-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                flex-wrap: wrap;
                gap: 12px;
            }

            .sort-buttons {
                display: flex;
                gap: 6px;
            }

            .sort-btn {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #888;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .sort-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .sort-btn.active {
                background: rgba(245, 158, 11, 0.2);
                border-color: rgba(245, 158, 11, 0.4);
                color: #f59e0b;
            }

            .sort-btn.simulated.active {
                background: rgba(168, 85, 247, 0.2);
                border-color: rgba(168, 85, 247, 0.4);
                color: #a855f7;
            }

            .sort-btn.real.active {
                background: rgba(59, 130, 246, 0.2);
                border-color: rgba(59, 130, 246, 0.4);
                color: #3b82f6;
            }

            .investments-list {
                max-height: 250px;
                overflow-y: auto;
            }

            .no-investments {
                text-align: center;
                padding: 30px;
                color: #666;
            }

            .no-investments .hint {
                font-size: 12px;
                color: #555;
            }

            .investment-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                margin-bottom: 8px;
            }

            .inv-info {
                flex: 1;
            }

            .inv-name {
                display: block;
                font-weight: 600;
                color: #fff;
            }

            .inv-details {
                font-size: 11px;
                color: #888;
            }

            .inv-values {
                text-align: right;
            }

            .inv-amount {
                display: block;
                font-weight: 600;
            }

            .inv-earnings {
                font-size: 12px;
            }

            .btn-withdraw {
                padding: 6px 12px;
                background: rgba(255, 100, 100, 0.2);
                border: 1px solid rgba(255, 100, 100, 0.3);
                border-radius: 6px;
                color: #ff6464;
                font-size: 12px;
                cursor: pointer;
            }

            .portfolio-actions {
                display: flex;
                gap: 12px;
                margin-top: 24px;
            }

            .btn-invest-now {
                flex: 2;
                padding: 14px;
                background: linear-gradient(135deg, #00ff88, #00aa55);
                border: none;
                border-radius: 10px;
                color: #000;
                font-weight: 700;
                cursor: pointer;
            }

            .btn-reset {
                flex: 1;
                padding: 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: #888;
                cursor: pointer;
            }

            /* Time acceleration */
            .time-acceleration-section {
                background: rgba(147, 51, 234, 0.1);
                border: 1px solid rgba(147, 51, 234, 0.3);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .time-acceleration-section h3 {
                margin: 0 0 12px;
                color: #a855f7;
                font-size: 14px;
            }

            .time-btns {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }

            .time-btns button {
                padding: 8px 12px;
                background: rgba(147, 51, 234, 0.2);
                border: 1px solid rgba(147, 51, 234, 0.4);
                border-radius: 8px;
                color: #a855f7;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .time-btns button:hover {
                background: rgba(147, 51, 234, 0.4);
                transform: scale(1.05);
            }

            /* Product group styles (simule vs reel) */
            .investment-product-group {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
            }

            .product-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .product-name {
                font-weight: 700;
                color: #fff;
                font-size: 14px;
            }

            .product-apy {
                background: rgba(0, 255, 136, 0.2);
                color: #00ff88;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
            }

            .product-stats {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .stat-row {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 13px;
            }

            .stat-row.simulated {
                background: rgba(168, 85, 247, 0.1);
                border: 1px solid rgba(168, 85, 247, 0.2);
            }

            .stat-row.real {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
            }

            .stat-row.total-row {
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                font-weight: 600;
            }

            .stat-label {
                flex: 1;
                color: #aaa;
            }

            .stat-amount {
                margin-right: 16px;
                color: #fff;
                font-weight: 600;
            }

            .stat-earnings {
                color: #00ff88;
            }

            .total-amount {
                color: #f59e0b;
            }

            .total-earnings {
                color: #00ff88;
                font-weight: 700;
            }

            .inv-type-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 700;
                margin-left: 8px;
            }

            .inv-type-badge.simulated {
                background: rgba(168, 85, 247, 0.2);
                color: #a855f7;
            }

            .inv-type-badge.real {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
            }

            .investment-item.simulated {
                border-left: 3px solid #a855f7;
            }

            .investment-item.real {
                border-left: 3px solid #3b82f6;
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init avec integration Market Indexes
function initSimulatedPortfolio() {
    try {
        // Ajouter les Market Indexes au Investment Simulator
        if (typeof InvestmentSimulator !== 'undefined' && typeof MarketIndexes !== 'undefined') {
            if (InvestmentSimulator.products && MarketIndexes.indexes) {
                const indexProducts = MarketIndexes.indexes.map(idx => ({
                    id: idx.id,
                    name: idx.name,
                    apy: idx.change24h > 0 ? 5.0 + idx.change24h / 2 : 3.0,
                    risk: idx.risk || 'medium',
                    icon: idx.icon,
                    category: 'index'
                }));
                const existingIds = InvestmentSimulator.products.map(p => p.id);
                const newProducts = indexProducts.filter(p => !existingIds.includes(p.id));
                if (newProducts.length > 0) {
                    InvestmentSimulator.products = [...newProducts, ...InvestmentSimulator.products];
                    console.log('📊 Market Indexes ajoutes au Simulator:', newProducts.length);
                }
            }
        }
    } catch (e) {
        console.warn('Market Indexes integration skipped:', e.message);
    }

    try {
        SimulatedPortfolio.init();
    } catch (e) {
        console.error('SimulatedPortfolio init failed:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulatedPortfolio);
} else {
    // Petit delai pour s'assurer que tout est charge
    setTimeout(initSimulatedPortfolio, 100);
}

window.SimulatedPortfolio = SimulatedPortfolio;

console.log('💰 Simulated Portfolio loaded. Click the button or use SimulatedPortfolio.openModal()');
