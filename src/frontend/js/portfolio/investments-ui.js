// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - INVESTMENTS UI
// Complete UI for all investment products
// ═══════════════════════════════════════════════════════════════════════════════

const InvestmentsUI = {
    currentTab: 'all',
    userInvestments: [],
    sortBy: 'apy',
    sortDir: 'desc',
    budgetFilter: null,  // Filter by max budget

    init() {
        this.loadUserInvestments();
        this.render();
        this.bindEvents();
        console.log('💰 Investments UI initialized');
    },

    loadUserInvestments() {
        try {
            const saved = localStorage.getItem('obelisk_investments');
            this.userInvestments = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.userInvestments = [];
        }
    },

    saveUserInvestments() {
        localStorage.setItem('obelisk_investments', JSON.stringify(this.userInvestments));
    },

    getLang() {
        return (typeof I18n !== 'undefined') ? I18n.currentLang : 'en';
    },

    t(key) {
        // Use global I18n if available
        if (typeof I18n !== 'undefined' && I18n.t) {
            // Convert camelCase to snake_case for I18n keys
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            const result = I18n.t(snakeKey);
            if (result !== snakeKey) return result;
        }

        // Fallback translations
        const fallback = {
            en: {
                all: 'All', investments: 'Investments', staking: 'Staking', pools: 'Liquidity Pools',
                vaults: 'Vaults', lending: 'Lending', savings: 'Savings', indexFunds: 'Index Funds',
                apy: 'APY', tvl: 'TVL', risk: 'Risk', invest: 'Invest', withdraw: 'Withdraw',
                myPortfolio: 'My Portfolio', totalInvested: 'Total Invested', totalEarnings: 'Total Earnings',
                viewAll: 'View All', stake: 'Stake', unstake: 'Unstake', supply: 'Supply', borrow: 'Borrow',
                deposit: 'Deposit', addLiquidity: 'Add Liquidity', removeLiquidity: 'Remove Liquidity',
                buy: 'Buy', sell: 'Sell', amount: 'Amount', balance: 'Balance', max: 'MAX',
                confirm: 'Confirm', cancel: 'Cancel', lockPeriod: 'Lock Period', days: 'days',
                flexible: 'Flexible', autoCompound: 'Auto-compound', fee: 'Fee', volume24h: '24h Volume',
                utilization: 'Utilization', supplyApy: 'Supply APY', borrowApy: 'Borrow APY',
                holdings: 'Holdings', rebalance: 'Rebalance', strategy: 'Strategy', protocols: 'Protocols',
                minDeposit: 'Min Deposit', performance: 'Performance', projectedReturns: 'Projected Returns',
                weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
                noInvestments: 'No investments yet', startInvesting: 'Start investing to see your portfolio here',
                sortBy: 'Sort by', minInvest: 'Min Investment', highest: 'Highest', lowest: 'Lowest',
                fees: 'Fees', rewards: 'Rewards', totalSupply: 'Total Supply', collateralFactor: 'Collateral Factor',
                insurance: 'Insurance', protected: 'Protected', aum: 'AUM', mgmtFee: 'Mgmt Fee',
                targetApy: 'Target APY', allocation: 'Allocation', simulated: 'SIMULATED', real: 'REAL',
                conversionFee: 'Conversion Fee', totalToPay: 'Total to Pay',
                myBudget: 'My budget', filter: 'Filter', showingProductsUnder: 'Products with min',
                availableToInvest: 'Available to invest', addFunds: 'Add funds', refresh: 'Refresh'
            },
            fr: {
                all: 'Tout', investments: 'Investissements', staking: 'Staking', pools: 'Pools de Liquidité',
                vaults: 'Coffres', lending: 'Prêts', savings: 'Épargne', indexFunds: 'Fonds Indiciels',
                apy: 'APY', tvl: 'TVL', risk: 'Risque', invest: 'Investir', withdraw: 'Retirer',
                myPortfolio: 'Mon Portefeuille', totalInvested: 'Total Investi', totalEarnings: 'Gains Totaux',
                viewAll: 'Voir Tout', stake: 'Staker', unstake: 'Unstaker', supply: 'Fournir', borrow: 'Emprunter',
                deposit: 'Déposer', addLiquidity: 'Ajouter Liquidité', removeLiquidity: 'Retirer Liquidité',
                buy: 'Acheter', sell: 'Vendre', amount: 'Montant', balance: 'Solde', max: 'MAX',
                confirm: 'Confirmer', cancel: 'Annuler', lockPeriod: 'Période de Blocage', days: 'jours',
                flexible: 'Flexible', autoCompound: 'Auto-composé', fee: 'Frais', volume24h: 'Volume 24h',
                utilization: 'Utilisation', supplyApy: 'APY Prêt', borrowApy: 'APY Emprunt',
                holdings: 'Composition', rebalance: 'Rééquilibrage', strategy: 'Stratégie', protocols: 'Protocoles',
                minDeposit: 'Dépôt Min', performance: 'Performance', projectedReturns: 'Rendements Projetés',
                weekly: 'Hebdo', monthly: 'Mensuel', yearly: 'Annuel',
                noInvestments: 'Aucun investissement', startInvesting: 'Commencez à investir',
                sortBy: 'Trier par', minInvest: 'Invest. Min', highest: 'Plus haut', lowest: 'Plus bas',
                fees: 'Frais', rewards: 'Récompenses', totalSupply: 'Offre Totale', collateralFactor: 'Facteur Collatéral',
                insurance: 'Assurance', protected: 'Protégé', aum: 'AUM', mgmtFee: 'Frais Gestion',
                targetApy: 'APY Cible', allocation: 'Répartition', simulated: 'SIMULÉ', real: 'RÉEL',
                conversionFee: 'Frais Conversion', totalToPay: 'Total à Payer',
                myBudget: 'Mon budget', filter: 'Filtrer', showingProductsUnder: 'Produits avec min',
                availableToInvest: 'Disponible à investir', addFunds: 'Ajouter fonds', refresh: 'Rafraîchir'
            },
            es: {
                all: 'Todo', investments: 'Inversiones', staking: 'Staking', pools: 'Pools de Liquidez',
                vaults: 'Bóvedas', lending: 'Préstamos', savings: 'Ahorros', indexFunds: 'Fondos Indexados',
                myPortfolio: 'Mi Cartera', totalInvested: 'Total Invertido', totalEarnings: 'Ganancias',
                stake: 'Stakear', deposit: 'Depositar', addLiquidity: 'Añadir Liquidez',
                buy: 'Comprar', sell: 'Vender', confirm: 'Confirmar', cancel: 'Cancelar',
                weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual',
                sortBy: 'Ordenar por', minInvest: 'Inv. Mín', highest: 'Mayor', lowest: 'Menor',
                fees: 'Comisiones', rewards: 'Recompensas', totalSupply: 'Oferta Total', collateralFactor: 'Factor Colateral',
                insurance: 'Seguro', protected: 'Protegido', aum: 'AUM', mgmtFee: 'Comisión Gestión',
                targetApy: 'APY Objetivo', allocation: 'Asignación', simulated: 'SIMULADO', real: 'REAL',
                conversionFee: 'Comisión Conversión', totalToPay: 'Total a Pagar'
            },
            de: {
                all: 'Alle', investments: 'Investitionen', staking: 'Staking', pools: 'Liquiditätspools',
                vaults: 'Tresore', lending: 'Kredite', savings: 'Sparen', indexFunds: 'Indexfonds',
                myPortfolio: 'Mein Portfolio', totalInvested: 'Gesamt Investiert', totalEarnings: 'Gesamtgewinn',
                stake: 'Staken', deposit: 'Einzahlen', addLiquidity: 'Liquidität Hinzufügen',
                buy: 'Kaufen', sell: 'Verkaufen', confirm: 'Bestätigen', cancel: 'Abbrechen',
                weekly: 'Wöchentlich', monthly: 'Monatlich', yearly: 'Jährlich',
                sortBy: 'Sortieren nach', minInvest: 'Min Invest', highest: 'Höchste', lowest: 'Niedrigste',
                fees: 'Gebühren', rewards: 'Belohnungen', totalSupply: 'Gesamtangebot', collateralFactor: 'Sicherheitsfaktor',
                insurance: 'Versicherung', protected: 'Geschützt', aum: 'AUM', mgmtFee: 'Verwaltungsgebühr',
                targetApy: 'Ziel-APY', allocation: 'Zuteilung', simulated: 'SIMULIERT', real: 'REAL',
                conversionFee: 'Umrechnungsgebühr', totalToPay: 'Gesamtbetrag'
            }
        };
        const lang = this.getLang();
        return (fallback[lang] || fallback.en)[key] || (fallback.en)[key] || key;
    },

    renderGuide() {
        const guideContainer = document.getElementById('investments-guide-container');
        if (!guideContainer) return;

        const lang = this.getLang();
        const guides = {
            en: {
                title: 'Investment Products',
                staking: { name: 'Staking', desc: 'Lock tokens to secure networks and earn rewards' },
                pools: { name: 'Liquidity Pools', desc: 'Provide liquidity to earn trading fees' },
                vaults: { name: 'Vaults', desc: 'Automated yield strategies with auto-compound' },
                lending: { name: 'Lending', desc: 'Earn interest by lending your crypto' },
                savings: { name: 'Savings', desc: 'Simple interest-bearing accounts' },
                index: { name: 'Index Funds', desc: 'Diversified crypto portfolios' }
            },
            fr: {
                title: 'Produits d\'Investissement',
                staking: { name: 'Staking', desc: 'Verrouillez des tokens pour sécuriser les réseaux et gagner des récompenses' },
                pools: { name: 'Pools de Liquidité', desc: 'Fournissez de la liquidité pour gagner des frais de trading' },
                vaults: { name: 'Coffres', desc: 'Stratégies de rendement automatisées avec auto-composition' },
                lending: { name: 'Prêts', desc: 'Gagnez des intérêts en prêtant vos crypto' },
                savings: { name: 'Épargne', desc: 'Comptes d\'épargne simples avec intérêts' },
                index: { name: 'Fonds Indiciels', desc: 'Portefeuilles crypto diversifiés' }
            },
            es: {
                title: 'Productos de Inversión',
                staking: { name: 'Staking', desc: 'Bloquea tokens para asegurar redes y ganar recompensas' },
                pools: { name: 'Pools de Liquidez', desc: 'Proporciona liquidez para ganar comisiones' },
                vaults: { name: 'Bóvedas', desc: 'Estrategias automatizadas con auto-composición' },
                lending: { name: 'Préstamos', desc: 'Gana intereses prestando tus crypto' },
                savings: { name: 'Ahorros', desc: 'Cuentas de ahorro simples con intereses' },
                index: { name: 'Fondos Indexados', desc: 'Carteras crypto diversificadas' }
            },
            de: {
                title: 'Investitionsprodukte',
                staking: { name: 'Staking', desc: 'Token sperren um Netzwerke zu sichern und Belohnungen zu verdienen' },
                pools: { name: 'Liquiditätspools', desc: 'Liquidität bereitstellen um Gebühren zu verdienen' },
                vaults: { name: 'Tresore', desc: 'Automatisierte Renditestrategien mit Auto-Compound' },
                lending: { name: 'Kredite', desc: 'Zinsen verdienen durch Krypto-Verleih' },
                savings: { name: 'Sparen', desc: 'Einfache verzinsliche Sparkonten' },
                index: { name: 'Indexfonds', desc: 'Diversifizierte Krypto-Portfolios' }
            }
        };

        const g = guides[lang] || guides.en;

        guideContainer.innerHTML = `
            <div class="product-guide" id="investments-guide">
                <div class="product-guide-header" onclick="this.parentElement.classList.toggle('expanded')">
                    <div class="product-guide-title">
                        <span class="icon">💰</span>
                        <span>${g.title}</span>
                    </div>
                    <span class="product-guide-toggle">▼</span>
                </div>
                <div class="product-guide-content">
                    <p><strong>${g.staking.name}:</strong> ${g.staking.desc}</p>
                    <p><strong>${g.pools.name}:</strong> ${g.pools.desc}</p>
                    <p><strong>${g.vaults.name}:</strong> ${g.vaults.desc}</p>
                    <p><strong>${g.lending.name}:</strong> ${g.lending.desc}</p>
                    <p><strong>${g.savings.name}:</strong> ${g.savings.desc}</p>
                    <p><strong>${g.index.name}:</strong> ${g.index.desc}</p>
                </div>
            </div>
        `;
    },

    render() {
        this.renderGuide();
        const container = document.getElementById('investments-content');
        if (!container) return;

        // Get balances from SimulatedPortfolio
        const simBalance = (typeof SimulatedPortfolio !== 'undefined') ? (SimulatedPortfolio.portfolio?.simulatedBalance || 0) : 0;
        const realBalance = (typeof SimulatedPortfolio !== 'undefined') ? (SimulatedPortfolio.portfolio?.realBalance || 0) : 0;
        const totalAvailable = simBalance + realBalance;

        container.innerHTML = `
            <div class="investments-container">
                <!-- Available Balance Banner -->
                <div class="available-balance-banner" style="background:linear-gradient(135deg,rgba(0,255,136,0.15),rgba(59,130,246,0.15));border:2px solid rgba(0,255,136,0.3);border-radius:16px;padding:20px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;">
                        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
                            <div>
                                <div style="color:#888;font-size:12px;margin-bottom:4px;">💰 ${this.t('availableToInvest') || 'Disponible à investir'}</div>
                                <div style="font-size:28px;font-weight:700;color:#fff;">$${totalAvailable.toFixed(2)} <span style="font-size:14px;color:#888;">USDC</span></div>
                            </div>
                            <div style="display:flex;gap:15px;">
                                <div style="padding:10px 15px;background:rgba(168,85,247,0.2);border-radius:10px;border:1px solid rgba(168,85,247,0.3);">
                                    <div style="color:#a855f7;font-size:11px;">🎮 ${this.t('simulated') || 'SIMULÉ'}</div>
                                    <div style="color:#a855f7;font-size:18px;font-weight:600;">$${simBalance.toFixed(2)}</div>
                                </div>
                                <div style="padding:10px 15px;background:rgba(59,130,246,0.2);border-radius:10px;border:1px solid rgba(59,130,246,0.3);">
                                    <div style="color:#3b82f6;font-size:11px;">💎 ${this.t('real') || 'RÉEL'}
                                        <button onclick="InvestmentsUI.refreshRealBalance()" title="${this.t('refresh') || 'Rafraîchir'}" style="background:none;border:none;cursor:pointer;font-size:11px;padding:0 4px;">🔄</button>
                                    </div>
                                    <div style="color:#3b82f6;font-size:18px;font-weight:600;">$${realBalance.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                        <div style="display:flex;gap:10px;">
                            <button onclick="SimulatedPortfolio.openModal()" style="padding:10px 20px;background:linear-gradient(135deg,#a855f7,#7c3aed);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">
                                + ${this.t('addFunds') || 'Ajouter fonds'}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Portfolio Summary -->
                <div class="portfolio-summary">
                    <div class="portfolio-card">
                        <span class="portfolio-label">${this.t('totalInvested')}</span>
                        <span class="portfolio-value">$${this.getTotalInvested().toLocaleString()}</span>
                    </div>
                    <div class="portfolio-card">
                        <span class="portfolio-label">${this.t('totalEarnings')}</span>
                        <span class="portfolio-value earnings">+$${this.getTotalEarnings().toLocaleString()}</span>
                    </div>
                    <div class="portfolio-card">
                        <span class="portfolio-label">${this.t('myPortfolio')}</span>
                        <button class="btn-view-portfolio" onclick="InvestmentsUI.showPortfolio()">${this.t('viewAll')}</button>
                    </div>
                </div>

                <!-- Investment Tabs -->
                <div class="investment-tabs">
                    <button class="inv-tab ${this.currentTab === 'all' ? 'active' : ''}" data-tab="all">
                        <span class="tab-icon">🌐</span> ${this.t('all')}
                    </button>
                    <button class="inv-tab ${this.currentTab === 'combos' ? 'active' : ''}" data-tab="combos">
                        <span class="tab-icon">🎯</span> ${this.t('combos')}
                    </button>
                    <button class="inv-tab ${this.currentTab === 'staking' ? 'active' : ''}" data-tab="staking">
                        <span class="tab-icon">🔒</span> ${this.t('staking')}
                    </button>
                    <button class="inv-tab ${this.currentTab === 'pools' ? 'active' : ''}" data-tab="pools">
                        <span class="tab-icon">💧</span> ${this.t('pools')}
                    </button>
                    <button class="inv-tab ${this.currentTab === 'vaults' ? 'active' : ''}" data-tab="vaults">
                        <span class="tab-icon">🏛️</span> ${this.t('vaults')}
                    </button>
                    <button class="inv-tab ${this.currentTab === 'lending' ? 'active' : ''}" data-tab="lending">
                        <span class="tab-icon">💳</span> ${this.t('lending')}
                    </button>
                    <button class="inv-tab ${this.currentTab === 'savings' ? 'active' : ''}" data-tab="savings">
                        <span class="tab-icon">🏦</span> ${this.t('savings')}
                    </button>
                    <button class="inv-tab ${this.currentTab === 'indexFunds' ? 'active' : ''}" data-tab="indexFunds">
                        <span class="tab-icon">📊</span> ${this.t('indexFunds')}
                    </button>
                </div>

                <!-- Budget Filter -->
                <div class="budget-filter" style="display:flex;align-items:center;gap:15px;margin-bottom:15px;padding:12px 16px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:10px;">
                    <span style="color:#00ff88;font-weight:600;font-size:14px;">💰 ${this.t('myBudget') || 'Mon budget'}:</span>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:#888;">$</span>
                        <input type="number" id="budget-filter-input"
                               value="${this.budgetFilter || ''}"
                               placeholder="ex: 1, 10, 100..."
                               style="width:100px;padding:8px 12px;background:rgba(0,0,0,0.3);border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;"
                               onchange="InvestmentsUI.applyBudgetFilter(this.value)"
                               onkeyup="if(event.key==='Enter')InvestmentsUI.applyBudgetFilter(this.value)">
                        <button onclick="InvestmentsUI.applyBudgetFilter(document.getElementById('budget-filter-input').value)"
                                style="padding:8px 16px;background:linear-gradient(135deg,#00ff88,#00d4aa);border:none;border-radius:6px;color:#000;font-weight:600;cursor:pointer;">
                            🔍 ${this.t('filter') || 'Filtrer'}
                        </button>
                        ${this.budgetFilter ? `
                        <button onclick="InvestmentsUI.clearBudgetFilter()"
                                style="padding:8px 12px;background:rgba(255,100,100,0.2);border:1px solid rgba(255,100,100,0.3);border-radius:6px;color:#ff6464;cursor:pointer;">
                            ✕
                        </button>
                        ` : ''}
                    </div>
                    ${this.budgetFilter ? `
                    <span style="color:#00ff88;font-size:13px;margin-left:auto;">
                        ✓ ${this.t('showingProductsUnder') || 'Produits avec min'} ≤ $${this.budgetFilter}
                    </span>
                    ` : ''}
                </div>

                <!-- Sort Controls -->
                <div class="sort-controls">
                    <span class="sort-label">${this.t('sortBy')}:</span>
                    <div class="sort-buttons">
                        <button class="sort-btn ${this.sortBy === 'apy' ? 'active' : ''}" data-sort="apy">
                            ${this.t('apy')} ${this.sortBy === 'apy' ? (this.sortDir === 'desc' ? '↓' : '↑') : ''}
                        </button>
                        <button class="sort-btn ${this.sortBy === 'tvl' ? 'active' : ''}" data-sort="tvl">
                            ${this.t('tvl')} ${this.sortBy === 'tvl' ? (this.sortDir === 'desc' ? '↓' : '↑') : ''}
                        </button>
                        <button class="sort-btn ${this.sortBy === 'minInvest' ? 'active' : ''}" data-sort="minInvest">
                            ${this.t('minInvest')} ${this.sortBy === 'minInvest' ? (this.sortDir === 'desc' ? '↓' : '↑') : ''}
                        </button>
                        <button class="sort-btn ${this.sortBy === 'risk' ? 'active' : ''}" data-sort="risk">
                            ${this.t('risk')} ${this.sortBy === 'risk' ? (this.sortDir === 'desc' ? '↓' : '↑') : ''}
                        </button>
                    </div>
                </div>

                <!-- Products Grid -->
                <div class="products-grid" id="products-grid">
                    ${this.renderProducts()}
                </div>
            </div>
        `;

        this.injectStyles();
    },

    // Apply budget filter
    applyBudgetFilter(value) {
        const budget = parseFloat(value);
        if (isNaN(budget) || budget <= 0) {
            this.budgetFilter = null;
        } else {
            this.budgetFilter = budget;
            // Auto-sort by minInvest ascending when budget is set
            this.sortBy = 'minInvest';
            this.sortDir = 'asc';
        }
        this.render();
    },

    // Clear budget filter
    clearBudgetFilter() {
        this.budgetFilter = null;
        this.sortBy = 'apy';
        this.sortDir = 'desc';
        this.render();
    },

    // Refresh real balance from wallet
    async refreshRealBalance() {
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.refreshRealBalance) {
            await SimulatedPortfolio.refreshRealBalance();
            this.render(); // Re-render to update the display
        } else if (typeof WalletConnect !== 'undefined' && WalletConnect.fetchAndUpdateUSDCBalance) {
            await WalletConnect.fetchAndUpdateUSDCBalance();
            this.render();
        }
    },

    // Filter and sort products
    sortProducts(products) {
        const riskOrder = { 'very-low': 1, 'low': 2, 'low-medium': 3, 'medium': 4, 'medium-high': 5, 'high': 6 };

        // First, filter by budget if set
        let filtered = [...products];
        if (this.budgetFilter) {
            filtered = filtered.filter(p => {
                const minInvest = p.minInvest || p.minDeposit || p.minAmount || 0;
                return minInvest <= this.budgetFilter;
            });
        }

        // Then sort
        return filtered.sort((a, b) => {
            let aVal, bVal;

            switch(this.sortBy) {
                case 'apy':
                    aVal = a.apy || a.targetApy || a.supplyApy || 0;
                    bVal = b.apy || b.targetApy || b.supplyApy || 0;
                    break;
                case 'tvl':
                    aVal = a.tvl || a.aum || a.totalSupply || 0;
                    bVal = b.tvl || b.aum || b.totalSupply || 0;
                    break;
                case 'minInvest':
                    aVal = a.minInvest || a.minDeposit || a.minAmount || 0;
                    bVal = b.minInvest || b.minDeposit || b.minAmount || 0;
                    break;
                case 'risk':
                    aVal = riskOrder[a.risk] || 3;
                    bVal = riskOrder[b.risk] || 3;
                    break;
                default:
                    aVal = 0;
                    bVal = 0;
            }

            return this.sortDir === 'desc' ? bVal - aVal : aVal - bVal;
        });
    },

    renderProducts() {
        const rawProducts = InvestmentProducts[this.currentTab]?.products || [];
        const products = this.sortProducts(rawProducts);

        switch(this.currentTab) {
            case 'all':
                return this.renderAllProducts();
            case 'combos':
                return this.renderComboProducts(products);
            case 'staking':
                return this.renderStakingProducts(products);
            case 'pools':
                return this.renderPoolProducts(products);
            case 'vaults':
                return this.renderVaultProducts(products);
            case 'lending':
                return this.renderLendingProducts(products);
            case 'savings':
                return this.renderSavingsProducts(products);
            case 'indexFunds':
                return this.renderIndexProducts(products);
            default:
                return '';
        }
    },

    renderAllProducts() {
        let html = '';
        const categories = ['combos', 'staking', 'pools', 'vaults', 'lending', 'savings', 'indexFunds'];
        const icons = { combos: '🎯', staking: '🔒', pools: '💧', vaults: '🏛️', lending: '💳', savings: '🏦', indexFunds: '📊' };

        categories.forEach(cat => {
            const rawProducts = InvestmentProducts[cat]?.products || [];
            const products = this.sortProducts(rawProducts);
            if (products.length > 0) {
                html += `<div class="category-section">
                    <h3 class="category-title">${icons[cat]} ${this.t(cat)}</h3>
                    <div class="category-products">`;

                switch(cat) {
                    case 'combos':
                        html += this.renderComboProducts(products);
                        break;
                    case 'staking':
                        html += this.renderStakingProducts(products);
                        break;
                    case 'pools':
                        html += this.renderPoolProducts(products);
                        break;
                    case 'vaults':
                        html += this.renderVaultProducts(products);
                        break;
                    case 'lending':
                        html += this.renderLendingProducts(products);
                        break;
                    case 'savings':
                        html += this.renderSavingsProducts(products);
                        break;
                    case 'indexFunds':
                        html += this.renderIndexProducts(products);
                        break;
                }

                html += `</div></div>`;
            }
        });

        return html;
    },

    renderStakingProducts(products) {
        return products.map(p => `
            <div class="product-card" data-id="${p.id}">
                ${this.renderInvestedBadge(p.id)}
                <div class="product-header">
                    <span class="product-icon">${p.icon}</span>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <span class="product-token">${p.token}</span>
                    </div>
                    <div class="product-apy">
                        <span class="apy-value">${p.apy}%</span>
                        <span class="apy-label">${this.t('apy')}</span>
                    </div>
                </div>
                <div class="product-details">
                    <div class="detail-row">
                        <span>${this.t('tvl')}</span>
                        <span>${InvestmentProducts.formatTVL(p.tvl)}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('lockPeriod')}</span>
                        <span>${p.lockPeriod === 0 ? this.t('flexible') : p.lockPeriod + ' ' + this.t('days')}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('risk')}</span>
                        <span class="risk-badge" style="color: ${InvestmentProducts.getRiskColor(p.risk)}">${InvestmentProducts.getRiskLabel(p.risk, this.getLang())}</span>
                    </div>
                    ${p.autoCompound ? `<div class="detail-row"><span>${this.t('autoCompound')}</span><span>✅</span></div>` : ''}
                </div>
                <p class="product-desc">${p.description}</p>
                <button class="btn-invest" onclick="InvestmentsUI.openInvestModal('staking', '${p.id}')">${this.t('stake')}</button>
            </div>
        `).join('');
    },

    renderPoolProducts(products) {
        return products.map(p => `
            <div class="product-card pool-card" data-id="${p.id}">
                ${this.renderInvestedBadge(p.id)}
                <div class="product-header">
                    <div class="pool-icons">
                        <span class="product-icon">${p.icons[0]}</span>
                        <span class="product-icon overlap">${p.icons[1]}</span>
                    </div>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <span class="product-protocol">${p.protocol}</span>
                    </div>
                    <div class="product-apy">
                        <span class="apy-value">${p.apy}%</span>
                        <span class="apy-label">${this.t('apy')}</span>
                    </div>
                </div>
                <div class="apy-breakdown">
                    <div class="apy-item">
                        <span>${this.t('fees')}</span>
                        <span class="apy-sub">${p.feeApr}%</span>
                    </div>
                    <div class="apy-item">
                        <span>${this.t('rewards')}</span>
                        <span class="apy-sub">${p.rewardApr}%</span>
                    </div>
                </div>
                <div class="product-details">
                    <div class="detail-row">
                        <span>${this.t('tvl')}</span>
                        <span>${InvestmentProducts.formatTVL(p.tvl)}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('volume24h')}</span>
                        <span>${InvestmentProducts.formatTVL(p.volume24h)}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('fee')}</span>
                        <span>${p.fee}%</span>
                    </div>
                </div>
                <p class="product-desc il-warning">${p.impermanentLoss}</p>
                <button class="btn-invest" onclick="InvestmentsUI.openInvestModal('pools', '${p.id}')">${this.t('addLiquidity')}</button>
            </div>
        `).join('');
    },

    renderVaultProducts(products) {
        return products.map(p => `
            <div class="product-card vault-card" data-id="${p.id}">
                ${this.renderInvestedBadge(p.id)}
                <div class="product-header">
                    <span class="product-icon vault-icon">${p.icon}</span>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <span class="product-token">${p.token}</span>
                    </div>
                    <div class="product-apy">
                        <span class="apy-value">${p.apy}%</span>
                        <span class="apy-label">${this.t('apy')}</span>
                    </div>
                </div>
                <div class="vault-strategy">
                    <span class="strategy-label">${this.t('strategy')}:</span>
                    <span class="strategy-text">${p.strategy}</span>
                </div>
                <div class="vault-protocols">
                    ${p.protocols.map(pr => `<span class="protocol-tag">${pr}</span>`).join('')}
                </div>
                <div class="product-details">
                    <div class="detail-row">
                        <span>${this.t('tvl')}</span>
                        <span>${InvestmentProducts.formatTVL(p.tvl)}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('risk')}</span>
                        <span class="risk-badge" style="color: ${InvestmentProducts.getRiskColor(p.risk)}">${InvestmentProducts.getRiskLabel(p.risk, this.getLang())}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('performance')} ${this.t('fee')}</span>
                        <span>${p.performanceFee}%</span>
                    </div>
                </div>
                <button class="btn-invest" onclick="InvestmentsUI.openInvestModal('vaults', '${p.id}')">${this.t('deposit')}</button>
            </div>
        `).join('');
    },

    renderLendingProducts(products) {
        return products.map(p => `
            <div class="product-card lending-card" data-id="${p.id}">
                ${this.renderInvestedBadge(p.id)}
                <div class="product-header">
                    <span class="product-icon">${p.icon}</span>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <span class="product-token">${p.token}</span>
                    </div>
                </div>
                <div class="lending-rates">
                    <div class="rate-box supply">
                        <span class="rate-label">${this.t('supplyApy')}</span>
                        <span class="rate-value">${p.supplyApy}%</span>
                    </div>
                    <div class="rate-box borrow">
                        <span class="rate-label">${this.t('borrowApy')}</span>
                        <span class="rate-value">${p.borrowApy}%</span>
                    </div>
                </div>
                <div class="utilization-bar">
                    <div class="util-fill" style="width: ${p.utilization}%"></div>
                    <span class="util-label">${this.t('utilization')}: ${p.utilization}%</span>
                </div>
                <div class="product-details">
                    <div class="detail-row">
                        <span>${this.t('totalSupply')}</span>
                        <span>${InvestmentProducts.formatTVL(p.totalSupply)}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('collateralFactor')}</span>
                        <span>${(p.collateralFactor * 100).toFixed(0)}%</span>
                    </div>
                </div>
                <div class="lending-actions">
                    <button class="btn-supply" onclick="InvestmentsUI.openInvestModal('lending', '${p.id}', 'supply')">${this.t('supply')}</button>
                    <button class="btn-borrow" onclick="InvestmentsUI.openInvestModal('lending', '${p.id}', 'borrow')">${this.t('borrow')}</button>
                </div>
            </div>
        `).join('');
    },

    renderSavingsProducts(products) {
        return products.map(p => `
            <div class="product-card savings-card" data-id="${p.id}">
                ${this.renderInvestedBadge(p.id)}
                <div class="product-header">
                    <span class="product-icon">${p.icon}</span>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <span class="product-token">${p.token}</span>
                    </div>
                    <div class="product-apy">
                        <span class="apy-value">${p.apy}%</span>
                        <span class="apy-label">${this.t('apy')}</span>
                    </div>
                </div>
                <div class="product-details">
                    <div class="detail-row">
                        <span>${this.t('lockPeriod')}</span>
                        <span>${p.lockPeriod === 0 ? this.t('flexible') : p.lockPeriod + ' ' + this.t('days')}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('minDeposit')}</span>
                        <span>${p.minDeposit} ${p.token}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('risk')}</span>
                        <span class="risk-badge" style="color: ${InvestmentProducts.getRiskColor(p.risk)}">${InvestmentProducts.getRiskLabel(p.risk, this.getLang())}</span>
                    </div>
                    ${p.insurance ? `<div class="detail-row"><span>${this.t('insurance')}</span><span>✅ ${this.t('protected')}</span></div>` : ''}
                </div>
                <p class="product-desc">${p.description}</p>
                <button class="btn-invest" onclick="InvestmentsUI.openInvestModal('savings', '${p.id}')">${this.t('deposit')}</button>
            </div>
        `).join('');
    },

    renderIndexProducts(products) {
        return products.map(p => `
            <div class="product-card index-card" data-id="${p.id}">
                ${this.renderInvestedBadge(p.id)}
                <div class="product-header">
                    <span class="product-icon index-icon">${p.icon}</span>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <span class="product-symbol">${p.symbol}</span>
                    </div>
                    <div class="index-price">
                        <span class="price-value">$${p.price.toFixed(2)}</span>
                        <span class="price-change ${p.change24h >= 0 ? 'positive' : 'negative'}">${p.change24h >= 0 ? '+' : ''}${p.change24h}%</span>
                    </div>
                </div>
                <div class="index-holdings">
                    <span class="holdings-label">${this.t('holdings')}:</span>
                    <div class="holdings-bar">
                        ${p.holdings.slice(0, 5).map(h => `
                            <div class="holding-segment" style="width: ${h.weight}%" title="${h.token}: ${h.weight}%"></div>
                        `).join('')}
                    </div>
                    <div class="holdings-legend">
                        ${p.holdings.slice(0, 5).map(h => `<span>${h.token} ${h.weight}%</span>`).join('')}
                    </div>
                </div>
                <div class="product-details">
                    <div class="detail-row">
                        <span>${this.t('aum')}</span>
                        <span>${InvestmentProducts.formatTVL(p.aum)}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('rebalance')}</span>
                        <span>${p.rebalanceFreq}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('mgmtFee')}</span>
                        <span>${p.managementFee}%</span>
                    </div>
                </div>
                <p class="product-desc">${p.description}</p>
                <button class="btn-invest" onclick="InvestmentsUI.openInvestModal('indexFunds', '${p.id}')">${this.t('buy')}</button>
            </div>
        `).join('');
    },

    renderComboProducts(products) {
        return products.map(p => `
            <div class="product-card combo-card" data-id="${p.id}">
                ${this.renderInvestedBadge(p.id)}
                <div class="product-header">
                    <span class="product-icon combo-icon">${p.icon}</span>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <span class="product-desc-short">${p.description}</span>
                    </div>
                    <div class="product-apy">
                        <span class="apy-value">${p.targetApy}%</span>
                        <span class="apy-label">${this.t('targetApy')}</span>
                    </div>
                </div>
                <div class="combo-allocation">
                    <span class="allocation-label">${this.t('allocation')}:</span>
                    <div class="allocation-bar">
                        ${p.allocation.map((a, i) => `
                            <div class="alloc-segment alloc-${i}" style="width: ${a.weight}%" title="${a.product}: ${a.weight}%"></div>
                        `).join('')}
                    </div>
                    <div class="allocation-legend">
                        ${p.allocation.map((a, i) => `
                            <div class="alloc-item">
                                <span class="alloc-dot alloc-${i}"></span>
                                <span class="alloc-name">${a.product}</span>
                                <span class="alloc-weight">${a.weight}%</span>
                                <span class="alloc-apy">${a.apy}% APY</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="product-details">
                    <div class="detail-row">
                        <span>${this.t('tvl')}</span>
                        <span>${InvestmentProducts.formatTVL(p.tvl)}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('risk')}</span>
                        <span class="risk-badge" style="color: ${InvestmentProducts.getRiskColor(p.risk)}">${InvestmentProducts.getRiskLabel(p.risk, this.getLang())}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('minDeposit')}</span>
                        <span>$${p.minInvest}</span>
                    </div>
                </div>
                <button class="btn-invest combo-btn" onclick="InvestmentsUI.openInvestModal('combos', '${p.id}')">${this.t('invest')}</button>
            </div>
        `).join('');
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            // Tab click - use closest to handle clicks on child elements
            const tabBtn = e.target.closest('.inv-tab');
            if (tabBtn) {
                this.currentTab = tabBtn.dataset.tab;
                this.render();
                return;
            }

            // Sort button click - use closest to handle clicks on child elements
            const sortBtn = e.target.closest('.sort-btn');
            if (sortBtn) {
                const sortKey = sortBtn.dataset.sort;
                if (this.sortBy === sortKey) {
                    this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
                } else {
                    this.sortBy = sortKey;
                    this.sortDir = 'desc';
                }
                this.render();
                return;
            }
        });

        // Re-render on language change
        document.addEventListener('languageChanged', () => this.render());
    },

    openInvestModal(category, productId, action = 'invest') {
        const products = InvestmentProducts[category]?.products || [];
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Obtenir les soldes du SimulatedPortfolio
        let simBalance = 0, realBalance = 0;
        if (typeof SimulatedPortfolio !== 'undefined') {
            const totals = SimulatedPortfolio.getTotalValue();
            simBalance = totals.simulatedBalance || 0;
            realBalance = totals.realBalance || 0;
        }

        // Obtenir la position actuelle pour ce produit
        const currentPosition = this.getInvestedAmounts(productId);
        const hasPosition = currentPosition.simulated > 0 || currentPosition.real > 0;

        const formatBal = (v) => v >= 1000000 ? (v/1000000).toFixed(2) + 'M' : v >= 1000 ? (v/1000).toFixed(2) + 'K' : v.toFixed(2);

        // HTML pour afficher la position actuelle
        const positionHTML = hasPosition ? `
            <div class="current-position-section">
                <div class="position-header">📊 ${this.t('currentPosition') || 'Position actuelle'}</div>
                <div class="position-grid">
                    ${currentPosition.simulated > 0 ? `
                        <div class="position-item simulated">
                            <div class="position-type">🎮 Simulé</div>
                            <div class="position-amount">$${formatBal(currentPosition.simulated)}</div>
                            <div class="position-earnings ${currentPosition.simulatedEarnings >= 0 ? 'positive' : 'negative'}">
                                ${currentPosition.simulatedEarnings >= 0 ? '+' : ''}$${currentPosition.simulatedEarnings.toFixed(2)}
                            </div>
                            <button class="btn-withdraw-small" onclick="InvestmentsUI.withdrawFromProduct('${productId}', 'simulated')">
                                Retirer
                            </button>
                        </div>
                    ` : ''}
                    ${currentPosition.real > 0 ? `
                        <div class="position-item real">
                            <div class="position-type">💎 Réel</div>
                            <div class="position-amount">$${formatBal(currentPosition.real)}</div>
                            <div class="position-earnings ${currentPosition.realEarnings >= 0 ? 'positive' : 'negative'}">
                                ${currentPosition.realEarnings >= 0 ? '+' : ''}$${currentPosition.realEarnings.toFixed(2)}
                            </div>
                            <button class="btn-withdraw-small real" onclick="InvestmentsUI.withdrawFromProduct('${productId}', 'real')">
                                Retirer
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        ` : '';

        const modal = document.createElement('div');
        modal.className = 'invest-modal-overlay';
        modal.innerHTML = `
            <div class="invest-modal">
                <div class="modal-header">
                    <h2>${product.icon} ${product.name}</h2>
                    <button class="modal-close" onclick="this.closest('.invest-modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <!-- Position actuelle si existante -->
                    ${positionHTML}

                    <!-- Selecteur Simule / Reel -->
                    <div class="invest-type-selector">
                        <button class="type-btn simulated active" onclick="InvestmentsUI.setInvestType('simulated', this)">
                            🎮 ${this.t('simulated')}
                            <span class="type-balance">${formatBal(simBalance)} USDC</span>
                        </button>
                        <button class="type-btn real" onclick="InvestmentsUI.setInvestType('real', this)">
                            💎 ${this.t('real')}
                            <span class="type-balance">${formatBal(realBalance)} USDC</span>
                        </button>
                    </div>
                    <input type="hidden" id="invest-type" value="simulated">
                    <input type="hidden" id="invest-product-id" value="${productId}">
                    <input type="hidden" id="invest-category" value="${category}">

                    <div class="invest-form">
                        <label>${this.t('amount')}</label>
                        <div class="amount-input-group">
                            <input type="number" id="invest-amount" placeholder="0.00" step="any" min="0">
                            <span class="token-label">USDC</span>
                            <button class="btn-max" onclick="InvestmentsUI.setMaxAmount()">${this.t('max')}</button>
                        </div>
                        <div class="balance-row" id="current-balance-row">
                            <span>${this.t('balance')} 🎮:</span>
                            <span id="current-balance-value">${formatBal(simBalance)} USDC</span>
                        </div>
                        <div class="fee-row" id="fee-row">
                            <span>⛽ ${this.t('conversionFee')}:</span>
                            <span id="fee-value">${this.getConversionFee(category, product.token)} USDC</span>
                        </div>
                        <div class="total-row" id="total-row">
                            <span>💰 ${this.t('totalToPay')}:</span>
                            <span id="total-value">0.00 USDC</span>
                        </div>
                    </div>
                    <div class="invest-preview">
                        <h4>${this.t('projectedReturns')}</h4>
                        <div class="returns-grid" id="returns-preview">
                            <div class="return-item">
                                <span>${this.t('weekly')}</span>
                                <span class="return-value">$0.00</span>
                            </div>
                            <div class="return-item">
                                <span>${this.t('monthly')}</span>
                                <span class="return-value">$0.00</span>
                            </div>
                            <div class="return-item">
                                <span>${this.t('yearly')}</span>
                                <span class="return-value">$0.00</span>
                            </div>
                        </div>
                    </div>
                    <!-- Forecast Chart 12 months -->
                    <div class="invest-forecast-chart" id="invest-forecast-chart">
                        ${this.renderForecastChart(100, product.apy || 5, product.risk || 3)}
                    </div>
                </div>
                <div class="modal-footer-enhanced">
                    <!-- Section Investir -->
                    <div class="action-section invest-section">
                        <div class="section-title">📥 Investir</div>
                        <div class="action-buttons">
                            <button class="btn-action btn-simulated" onclick="InvestmentsUI.confirmInvestment('${category}', '${productId}', 'simulated')">
                                🎮 Simulé
                            </button>
                            <button class="btn-action btn-real" onclick="InvestmentsUI.confirmInvestment('${category}', '${productId}', 'real')">
                                💎 Réel
                            </button>
                        </div>
                    </div>

                    <!-- Section Retirer -->
                    <div class="action-section withdraw-section">
                        <div class="section-title">📤 Retirer</div>
                        <div class="action-buttons">
                            <button class="btn-action btn-withdraw-sim" onclick="InvestmentsUI.withdrawFromProduct('${productId}', 'simulated')" ${currentPosition.simulated <= 0 ? 'disabled' : ''}>
                                🎮 Simulé ${currentPosition.simulated > 0 ? '($' + formatBal(currentPosition.simulated) + ')' : '(vide)'}
                            </button>
                            <button class="btn-action btn-withdraw-real" onclick="InvestmentsUI.withdrawFromProduct('${productId}', 'real')" ${currentPosition.real <= 0 ? 'disabled' : ''}>
                                💎 Réel ${currentPosition.real > 0 ? '($' + formatBal(currentPosition.real) + ')' : '(vide)'}
                            </button>
                        </div>
                    </div>

                    <button class="btn-cancel" onclick="this.closest('.invest-modal-overlay').remove()">${this.t('cancel')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.injectInvestTypeStyles();

        // Update preview on amount change
        const input = modal.querySelector('#invest-amount');
        const fee = parseFloat(this.getConversionFee(category, product.token));

        const updateTotal = () => {
            const amount = parseFloat(input.value) || 0;
            const total = amount + fee;
            document.getElementById('total-value').textContent = total.toFixed(2) + ' USDC';
        };

        input.addEventListener('input', () => {
            const amount = parseFloat(input.value) || 0;
            const apy = product.apy || product.supplyApy || 5;
            const weekly = InvestmentProducts.calculateReturns(amount, apy, 7);
            const monthly = InvestmentProducts.calculateReturns(amount, apy, 30);
            const yearly = InvestmentProducts.calculateReturns(amount, apy, 365);

            const preview = modal.querySelector('#returns-preview');
            preview.innerHTML = `
                <div class="return-item">
                    <span>${this.t('weekly')}</span>
                    <span class="return-value">+$${weekly.toFixed(2)}</span>
                </div>
                <div class="return-item">
                    <span>${this.t('monthly')}</span>
                    <span class="return-value">+$${monthly.toFixed(2)}</span>
                </div>
                <div class="return-item">
                    <span>${this.t('yearly')}</span>
                    <span class="return-value">+$${yearly.toFixed(2)}</span>
                </div>
            `;

            // Update forecast chart
            const chartContainer = modal.querySelector('#invest-forecast-chart');
            if (chartContainer && amount > 0) {
                chartContainer.innerHTML = this.renderForecastChart(amount, apy, product.risk || 3);
            }

            updateTotal();
        });

        // Initial total update
        updateTotal();
    },

    setInvestType(type, btn) {
        // Update hidden input
        document.getElementById('invest-type').value = type;

        // Update button states
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update balance display
        if (typeof SimulatedPortfolio !== 'undefined') {
            const totals = SimulatedPortfolio.getTotalValue();
            const balance = type === 'simulated' ? totals.simulatedBalance : totals.realBalance;
            const formatBal = (v) => v >= 1000000 ? (v/1000000).toFixed(2) + 'M' : v >= 1000 ? (v/1000).toFixed(2) + 'K' : v.toFixed(2);
            const icon = type === 'simulated' ? '🎮' : '💎';
            document.getElementById('current-balance-row').querySelector('span:first-child').textContent = `${this.t('balance')} ${icon}:`;
            document.getElementById('current-balance-value').textContent = `${formatBal(balance)} USDC`;
        }
    },

    setMaxAmount() {
        const type = document.getElementById('invest-type')?.value || 'simulated';
        if (typeof SimulatedPortfolio !== 'undefined') {
            const totals = SimulatedPortfolio.getTotalValue();
            const balance = type === 'simulated' ? totals.simulatedBalance : totals.realBalance;
            document.getElementById('invest-amount').value = balance.toFixed(2);
            document.getElementById('invest-amount').dispatchEvent(new Event('input'));
        }
    },

    getConversionFee(category, token) {
        if (typeof SimulatedPortfolio !== 'undefined') {
            return SimulatedPortfolio.getConversionFee(category, token).toFixed(2);
        }
        return '1.00';
    },

    /**
     * Obtenir les montants investis pour un produit
     */
    getInvestedAmounts(productId) {
        if (typeof SimulatedPortfolio !== 'undefined') {
            const stats = SimulatedPortfolio.getProductStats(productId);
            return {
                simulated: stats.simulated.amount,
                real: stats.real.amount,
                simulatedEarnings: stats.simulated.earnings,
                realEarnings: stats.real.earnings
            };
        }
        return { simulated: 0, real: 0, simulatedEarnings: 0, realEarnings: 0 };
    },

    /**
     * Generer le HTML pour afficher les investissements sur une carte
     */
    renderInvestedBadge(productId) {
        const amounts = this.getInvestedAmounts(productId);
        if (amounts.simulated === 0 && amounts.real === 0) {
            return '';
        }

        const formatAmt = (v) => v >= 1000000 ? (v/1000000).toFixed(1) + 'M' : v >= 1000 ? (v/1000).toFixed(1) + 'K' : v.toFixed(0);

        let html = '<div class="invested-badge-container">';

        if (amounts.simulated > 0) {
            html += `
                <div class="invested-badge simulated">
                    <span class="badge-icon">🎮</span>
                    <span class="badge-amount">$${formatAmt(amounts.simulated)}</span>
                    ${amounts.simulatedEarnings > 0 ? `<span class="badge-earnings">+$${amounts.simulatedEarnings.toFixed(2)}</span>` : ''}
                </div>
            `;
        }

        if (amounts.real > 0) {
            html += `
                <div class="invested-badge real">
                    <span class="badge-icon">💎</span>
                    <span class="badge-amount">$${formatAmt(amounts.real)}</span>
                    ${amounts.realEarnings > 0 ? `<span class="badge-earnings">+$${amounts.realEarnings.toFixed(2)}</span>` : ''}
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    injectInvestTypeStyles() {
        if (document.getElementById('invest-type-styles')) return;
        const styles = document.createElement('style');
        styles.id = 'invest-type-styles';
        styles.textContent = `
            .invest-type-selector {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            .type-btn {
                flex: 1;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #888;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            .type-btn .type-balance {
                font-size: 11px;
                opacity: 0.7;
            }
            .type-btn.simulated.active {
                background: rgba(168, 85, 247, 0.2);
                border-color: #a855f7;
                color: #a855f7;
            }
            .type-btn.real.active {
                background: rgba(59, 130, 246, 0.2);
                border-color: #3b82f6;
                color: #3b82f6;
            }
            .type-btn:hover:not(.active) {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
            .fee-row, .total-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 13px;
                border-top: 1px solid rgba(255,255,255,0.1);
                margin-top: 8px;
            }
            .fee-row span:first-child {
                color: #f59e0b;
            }
            .fee-row span:last-child {
                color: #f59e0b;
                font-weight: 600;
            }
            .total-row {
                background: rgba(0,255,136,0.1);
                padding: 10px;
                border-radius: 8px;
                border: 1px solid rgba(0,255,136,0.2);
            }
            .total-row span:first-child {
                color: #00ff88;
            }
            .total-row span:last-child {
                color: #00ff88;
                font-weight: 700;
                font-size: 16px;
            }

            /* Invested badges on cards */
            .invested-badge-container {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
                flex-wrap: wrap;
            }
            .invested-badge {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
            }
            .invested-badge.simulated {
                background: rgba(168, 85, 247, 0.2);
                border: 1px solid rgba(168, 85, 247, 0.4);
                color: #a855f7;
            }
            .invested-badge.real {
                background: rgba(59, 130, 246, 0.2);
                border: 1px solid rgba(59, 130, 246, 0.4);
                color: #3b82f6;
            }
            .badge-icon {
                font-size: 14px;
            }
            .badge-amount {
                font-weight: 700;
            }
            .badge-earnings {
                color: #00ff88;
                font-size: 10px;
            }

            /* Enhanced Modal Footer */
            .modal-footer-enhanced {
                padding: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .action-section {
                background: rgba(0,0,0,0.2);
                border-radius: 12px;
                padding: 15px;
            }
            .section-title {
                font-size: 14px;
                font-weight: 600;
                color: #888;
                margin-bottom: 10px;
            }
            .action-buttons {
                display: flex;
                gap: 10px;
            }
            .btn-action {
                flex: 1;
                padding: 12px 16px;
                border-radius: 10px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid transparent;
            }
            .btn-action.btn-simulated {
                background: linear-gradient(135deg, #a855f7, #7c3aed);
                color: white;
                border: none;
            }
            .btn-action.btn-simulated:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
            }
            .btn-action.btn-real {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                border: none;
            }
            .btn-action.btn-real:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            }
            .btn-action.btn-withdraw-sim {
                background: rgba(168, 85, 247, 0.1);
                border: 2px solid #a855f7;
                color: #a855f7;
            }
            .btn-action.btn-withdraw-sim:hover:not(:disabled) {
                background: rgba(168, 85, 247, 0.2);
            }
            .btn-action.btn-withdraw-real {
                background: rgba(59, 130, 246, 0.1);
                border: 2px solid #3b82f6;
                color: #3b82f6;
            }
            .btn-action.btn-withdraw-real:hover:not(:disabled) {
                background: rgba(59, 130, 246, 0.2);
            }
            .btn-action:disabled {
                opacity: 0.4;
                cursor: not-allowed;
                transform: none !important;
                box-shadow: none !important;
            }
            .modal-footer-enhanced .btn-cancel {
                padding: 10px 20px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                color: #888;
                cursor: pointer;
                align-self: center;
            }
            .modal-footer-enhanced .btn-cancel:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
            }
            .invest-section {
                border-left: 3px solid #00d4aa;
            }
            .withdraw-section {
                border-left: 3px solid #f59e0b;
            }
        `;
        document.head.appendChild(styles);
    },

    confirmInvestment(category, productId, type = null) {
        console.log('[DEBUG] confirmInvestment called', { category, productId, type });

        const amount = parseFloat(document.getElementById('invest-amount')?.value) || 0;
        // Si type passé en paramètre, l'utiliser, sinon utiliser le sélecteur
        const investType = type || document.getElementById('invest-type')?.value || 'simulated';
        const isSimulated = investType === 'simulated';

        if (amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const products = InvestmentProducts[category]?.products || [];
        const product = products.find(p => p.id === productId);
        if (!product) {
            alert('Product not found');
            return;
        }

        const apy = product.apy || product.supplyApy || 5;

        // Utiliser SimulatedPortfolio si disponible
        if (typeof SimulatedPortfolio !== 'undefined') {
            // Si REEL et pas de wallet connecte, demander connexion
            if (!isSimulated && !SimulatedPortfolio.checkWalletConnected()) {
                if (typeof showNotification === 'function') {
                    showNotification(I18n?.t?.('connect_wallet_for_real') || 'Connect wallet to invest with real funds', 'warning');
                }
                SimulatedPortfolio.promptWalletConnect();
                return;
            }

            console.log("[DEBUG] Calling SimulatedPortfolio.invest", { productId, name: product.name, amount, apy, category, isSimulated });
            const result = SimulatedPortfolio.invest(
                productId,
                product.name,
                amount,
                apy,
                category,
                isSimulated,  // true = simule, false = reel
                product.token || null  // token pour calculer les frais
            );

            console.log("[DEBUG] invest result:", result);
            if (!result.success) {
                const typeLabel = isSimulated ? 'SIMULE' : 'REEL';
                if (typeof showNotification === 'function') {
                    showNotification(result.error || `Solde ${typeLabel} insuffisant`, 'error');
                } else {
                    alert(result.error || `Solde ${typeLabel} insuffisant`);
                }
                return;
            }
        }

        // Garder aussi dans userInvestments pour compatibilite
        this.userInvestments.push({
            id: Date.now(),
            category,
            productId,
            productName: product.name,
            amount,
            token: product.token || 'USDC',
            apy: apy,
            isSimulated,
            timestamp: new Date().toISOString()
        });

        this.saveUserInvestments();
        document.querySelector('.invest-modal-overlay')?.remove();
        this.render();

        // Show success notification with fee info
        const typeLabel = isSimulated ? '🎮 SIMULE' : '💎 REEL';
        const fee = typeof SimulatedPortfolio !== 'undefined'
            ? SimulatedPortfolio.getConversionFee(category, product.token)
            : 1;
        if (typeof showNotification === 'function') {
            showNotification(`${typeLabel}: $${amount.toLocaleString()} investi dans ${product.name} (frais: $${fee.toFixed(2)})`, 'success');
        }
    },

    /**
     * Retirer un investissement d'un produit
     */
    withdrawFromProduct(productId, type = 'simulated') {
        console.log('[InvestmentsUI] withdrawFromProduct', { productId, type });

        if (typeof SimulatedPortfolio === 'undefined') {
            if (typeof showNotification === 'function') {
                showNotification('Portfolio non disponible', 'error');
            }
            return;
        }

        // Trouver les investissements pour ce produit
        const investments = SimulatedPortfolio.portfolio?.investments?.filter(
            inv => inv.productId === productId && inv.isSimulated === (type === 'simulated')
        ) || [];

        if (investments.length === 0) {
            if (typeof showNotification === 'function') {
                showNotification('Aucun investissement trouvé', 'warning');
            }
            return;
        }

        // Calculer le total
        const total = investments.reduce((sum, inv) => sum + inv.amount + (inv.earnings || 0), 0);
        const typeLabel = type === 'simulated' ? '🎮 Simulé' : '💎 Réel';

        // Confirmation
        if (!confirm(`Retirer ${typeLabel}: $${total.toFixed(2)} ?\n\nCela retirera tous vos fonds de ce produit.`)) {
            return;
        }

        // Retirer chaque investissement
        let withdrawnTotal = 0;
        for (const inv of investments) {
            const result = SimulatedPortfolio.withdraw(inv.id);
            if (result.success) {
                withdrawnTotal += result.amount || (inv.amount + (inv.earnings || 0));
            }
        }

        // Fermer le modal et rafraîchir
        document.querySelector('.invest-modal-overlay')?.remove();
        this.render();

        if (typeof showNotification === 'function') {
            showNotification(`${typeLabel}: $${withdrawnTotal.toFixed(2)} retiré avec succès`, 'success');
        }
    },

    /**
     * Investir en réel via les protocoles DeFi
     */
    investReal(category, productId) {
        const amount = parseFloat(document.getElementById('invest-amount')?.value) || 0;

        if (amount <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Veuillez entrer un montant', 'warning');
            }
            return;
        }

        const products = InvestmentProducts[category]?.products || [];
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Vérifier si wallet connecté
        const isWalletConnected = (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) ||
            (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress);

        if (!isWalletConnected) {
            if (typeof showNotification === 'function') {
                showNotification('Connectez votre wallet pour investir en réel', 'warning');
            }
            // Ouvrir le modal de connexion wallet
            if (typeof WalletManager !== 'undefined' && WalletManager.showConnectModal) {
                WalletManager.showConnectModal();
            }
            return;
        }

        // Déterminer le protocole DeFi approprié
        let protocol = null;
        let protocolName = '';

        // Mapping produits -> protocoles DeFi
        if (productId.includes('aave') || category === 'lending' || category === 'savings') {
            protocol = typeof AaveIntegration !== 'undefined' ? AaveIntegration : null;
            protocolName = 'Aave V3';
        } else if (productId.includes('gmx') || productId.includes('glp')) {
            protocol = typeof GMXIntegration !== 'undefined' ? GMXIntegration : null;
            protocolName = 'GMX GLP';
        } else if (productId.includes('aerodrome') || productId.includes('velodrome')) {
            protocol = typeof AerodromeIntegration !== 'undefined' ? AerodromeIntegration : null;
            protocolName = 'Aerodrome';
        }

        if (!protocol) {
            // Fallback: utiliser le DeFiManager générique
            if (typeof DeFiManager !== 'undefined') {
                this.showRealInvestConfirmation(product, amount, 'DeFi Protocol');
            } else {
                if (typeof showNotification === 'function') {
                    showNotification(`Protocole DeFi non disponible pour ${product.name}. Utilisez le mode simulé.`, 'warning');
                }
            }
            return;
        }

        this.showRealInvestConfirmation(product, amount, protocolName);
    },

    /**
     * Afficher la confirmation d'investissement réel
     */
    showRealInvestConfirmation(product, amount, protocolName) {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'invest-modal-overlay';
        confirmModal.innerHTML = `
            <div class="invest-modal real-confirm-modal">
                <div class="modal-header">
                    <h2>💎 Investissement Réel</h2>
                    <button class="modal-close" onclick="this.closest('.invest-modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="real-invest-warning">
                        <div class="warning-icon">⚠️</div>
                        <div class="warning-text">
                            <strong>Attention: Transaction Blockchain Réelle</strong>
                            <p>Vous êtes sur le point d'investir de vrais fonds via ${protocolName}.</p>
                        </div>
                    </div>

                    <div class="real-invest-summary">
                        <div class="summary-row">
                            <span>Produit:</span>
                            <span>${product.icon} ${product.name}</span>
                        </div>
                        <div class="summary-row">
                            <span>Montant:</span>
                            <span class="amount-value">$${amount.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Protocole:</span>
                            <span>${protocolName}</span>
                        </div>
                        <div class="summary-row">
                            <span>APY estimé:</span>
                            <span class="apy-value">${product.apy || product.supplyApy || '5-10'}%</span>
                        </div>
                        <div class="summary-row">
                            <span>Frais de gas estimés:</span>
                            <span>~$0.50-2.00</span>
                        </div>
                    </div>

                    <div class="real-invest-checklist">
                        <label>
                            <input type="checkbox" id="confirm-understand">
                            Je comprends que c'est une transaction réelle et irréversible
                        </label>
                        <label>
                            <input type="checkbox" id="confirm-risks">
                            Je comprends les risques DeFi (smart contract, impermanent loss, etc.)
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="this.closest('.invest-modal-overlay').remove()">Annuler</button>
                    <button class="btn-confirm-real" onclick="InvestmentsUI.executeRealInvestment('${product.id}', ${amount}, '${protocolName}')" disabled>
                        🔐 Confirmer & Signer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmModal);

        // Enable confirm button when checkboxes are checked
        const checkboxes = confirmModal.querySelectorAll('input[type="checkbox"]');
        const confirmBtn = confirmModal.querySelector('.btn-confirm-real');

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const allChecked = Array.from(checkboxes).every(c => c.checked);
                confirmBtn.disabled = !allChecked;
            });
        });

        this.injectRealInvestStyles();
    },

    /**
     * Exécuter l'investissement réel via le protocole DeFi
     */
    async executeRealInvestment(productId, amount, protocolName) {
        const confirmBtn = document.querySelector('.btn-confirm-real');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '⏳ Transaction en cours...';
        }

        try {
            let result;

            // Router vers le bon protocole
            if (protocolName === 'Aave V3' && typeof AaveIntegration !== 'undefined') {
                result = await AaveIntegration.supply('USDC', amount);
            } else if (protocolName === 'GMX GLP' && typeof GMXIntegration !== 'undefined') {
                result = await GMXIntegration.buyGLP(amount);
            } else if (protocolName === 'Aerodrome' && typeof AerodromeIntegration !== 'undefined') {
                result = await AerodromeIntegration.addLiquidity(amount);
            } else if (typeof DeFiManager !== 'undefined') {
                result = await DeFiManager.invest(productId, amount);
            } else {
                throw new Error('Protocole non disponible');
            }

            if (result && result.success) {
                // Fermer les modals
                document.querySelectorAll('.invest-modal-overlay').forEach(m => m.remove());

                if (typeof showNotification === 'function') {
                    showNotification(`💎 Investissement réel réussi: $${amount} via ${protocolName}`, 'success');
                }

                // Rafraîchir l'affichage
                this.render();
            } else {
                throw new Error(result?.error || 'Transaction échouée');
            }
        } catch (error) {
            console.error('[InvestmentsUI] Real investment error:', error);

            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '🔐 Confirmer & Signer';
            }

            if (typeof showNotification === 'function') {
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        }
    },

    injectRealInvestStyles() {
        if (document.getElementById('real-invest-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'real-invest-styles';
        styles.textContent = `
            .real-confirm-modal {
                max-width: 450px;
            }

            .real-invest-warning {
                display: flex;
                gap: 12px;
                padding: 16px;
                background: rgba(255, 170, 0, 0.15);
                border: 1px solid rgba(255, 170, 0, 0.3);
                border-radius: 12px;
                margin-bottom: 20px;
            }

            .warning-icon {
                font-size: 24px;
            }

            .warning-text strong {
                color: #ffaa00;
                display: block;
                margin-bottom: 4px;
            }

            .warning-text p {
                color: #ccc;
                font-size: 13px;
                margin: 0;
            }

            .real-invest-summary {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .summary-row:last-child {
                border-bottom: none;
            }

            .summary-row .amount-value {
                color: #00ff88;
                font-weight: 600;
            }

            .summary-row .apy-value {
                color: #a855f7;
                font-weight: 600;
            }

            .real-invest-checklist {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .real-invest-checklist label {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                font-size: 13px;
                color: #aaa;
                cursor: pointer;
            }

            .real-invest-checklist input[type="checkbox"] {
                width: 18px;
                height: 18px;
                margin-top: 2px;
                cursor: pointer;
            }

            .btn-confirm-real {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-confirm-real:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .btn-confirm-real:not(:disabled):hover {
                transform: scale(1.02);
                box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
            }

            .btn-real-invest {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-real-invest:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
            }

            /* Position actuelle dans le modal */
            .current-position-section {
                background: linear-gradient(145deg, rgba(0, 170, 255, 0.1), rgba(0, 100, 200, 0.05));
                border: 1px solid rgba(0, 170, 255, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .position-header {
                font-weight: 600;
                color: #00aaff;
                margin-bottom: 12px;
                font-size: 14px;
            }

            .position-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 12px;
            }

            .position-item {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 12px;
                text-align: center;
            }

            .position-item.simulated {
                border: 1px solid rgba(168, 85, 247, 0.3);
            }

            .position-item.real {
                border: 1px solid rgba(59, 130, 246, 0.3);
            }

            .position-type {
                font-size: 12px;
                color: #888;
                margin-bottom: 6px;
            }

            .position-amount {
                font-size: 18px;
                font-weight: 700;
                color: #fff;
            }

            .position-earnings {
                font-size: 13px;
                font-weight: 600;
                margin: 4px 0 10px;
            }

            .position-earnings.positive {
                color: #00ff88;
            }

            .position-earnings.negative {
                color: #ff4444;
            }

            .btn-withdraw-small {
                padding: 6px 16px;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-withdraw-small.real {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }

            .btn-withdraw-small:hover {
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(styles);
    },

    getTotalInvested() {
        return this.userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    },

    getTotalEarnings() {
        const now = Date.now();
        return this.userInvestments.reduce((sum, inv) => {
            const days = (now - new Date(inv.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            return sum + InvestmentProducts.calculateReturns(inv.amount, inv.apy, days);
        }, 0);
    },

    showPortfolio() {
        if (this.userInvestments.length === 0) {
            alert(this.t('noInvestments'));
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'invest-modal-overlay';
        modal.innerHTML = `
            <div class="invest-modal portfolio-modal">
                <div class="modal-header">
                    <h2>📊 ${this.t('myPortfolio')}</h2>
                    <button class="modal-close" onclick="this.closest('.invest-modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="portfolio-stats">
                        <div class="stat-box">
                            <span class="stat-label">${this.t('totalInvested')}</span>
                            <span class="stat-value">$${this.getTotalInvested().toLocaleString()}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">${this.t('totalEarnings')}</span>
                            <span class="stat-value earnings">+$${this.getTotalEarnings().toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="portfolio-list">
                        ${this.userInvestments.map(inv => `
                            <div class="portfolio-item">
                                <div class="item-info">
                                    <span class="item-name">${inv.productName}</span>
                                    <span class="item-amount">${inv.amount} ${inv.token}</span>
                                </div>
                                <div class="item-stats">
                                    <span class="item-apy">${inv.apy}% APY</span>
                                    <span class="item-earnings">+$${InvestmentProducts.calculateReturns(inv.amount, inv.apy, (Date.now() - new Date(inv.timestamp).getTime()) / (1000 * 60 * 60 * 24)).toFixed(2)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    injectStyles() {
        if (document.getElementById('investments-ui-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'investments-ui-styles';
        styles.textContent = `
            .investments-container {
                padding: 20px;
            }

            .portfolio-summary {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                margin-bottom: 24px;
            }

            .portfolio-card {
                background: rgba(0, 255, 136, 0.08);
                border: 1px solid rgba(0, 255, 136, 0.2);
                border-radius: 12px;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .portfolio-label {
                color: #888;
                font-size: 12px;
            }

            .portfolio-value {
                font-size: 24px;
                font-weight: 700;
                color: #fff;
            }

            .portfolio-value.earnings {
                color: #00ff88;
            }

            .btn-view-portfolio {
                background: rgba(0, 255, 136, 0.2);
                border: 1px solid rgba(0, 255, 136, 0.4);
                color: #00ff88;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn-view-portfolio:hover {
                background: rgba(0, 255, 136, 0.3);
            }

            .investment-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 24px;
                overflow-x: auto;
                padding-bottom: 8px;
            }

            .inv-tab {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #888;
                padding: 10px 16px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .inv-tab:hover {
                background: rgba(0, 255, 136, 0.1);
                color: #fff;
            }

            .inv-tab.active {
                background: rgba(0, 255, 136, 0.2);
                border-color: #00ff88;
                color: #00ff88;
            }

            .tab-icon {
                font-size: 16px;
            }

            .sort-controls {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.08);
            }

            .sort-label {
                color: #888;
                font-size: 13px;
                font-weight: 500;
            }

            .sort-buttons {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .sort-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #888;
                padding: 8px 14px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 12px;
                font-weight: 500;
            }

            .sort-btn:hover {
                background: rgba(0, 255, 136, 0.1);
                color: #fff;
            }

            .sort-btn.active {
                background: rgba(0, 255, 136, 0.2);
                border-color: #00ff88;
                color: #00ff88;
            }

            .products-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 20px;
            }

            .category-section {
                margin-bottom: 32px;
            }

            .category-title {
                color: #fff;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .category-products {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 20px;
            }

            .product-card {
                background: rgba(5, 10, 20, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 20px;
                transition: all 0.3s;
            }

            .product-card:hover {
                border-color: rgba(0, 255, 136, 0.4);
                transform: translateY(-2px);
            }

            .product-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .product-icon {
                font-size: 32px;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 255, 136, 0.1);
                border-radius: 12px;
            }

            .pool-icons {
                display: flex;
            }

            .pool-icons .overlap {
                margin-left: -16px;
            }

            .product-info {
                flex: 1;
            }

            .product-info h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .product-token, .product-protocol, .product-symbol {
                color: #888;
                font-size: 12px;
            }

            .product-apy {
                text-align: right;
            }

            .apy-value {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: #00ff88;
            }

            .apy-label {
                font-size: 11px;
                color: #888;
            }

            .apy-breakdown {
                display: flex;
                gap: 16px;
                margin-bottom: 12px;
                padding: 8px;
                background: rgba(0, 255, 136, 0.05);
                border-radius: 8px;
            }

            .apy-item {
                display: flex;
                flex-direction: column;
                font-size: 12px;
            }

            .apy-sub {
                color: #00ff88;
            }

            .product-details {
                margin-bottom: 12px;
            }

            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                font-size: 13px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .detail-row span:first-child {
                color: #888;
            }

            .risk-badge {
                font-weight: 600;
            }

            .product-desc {
                font-size: 12px;
                color: #888;
                margin: 12px 0;
            }

            .il-warning {
                color: #facc15;
            }

            .vault-strategy {
                background: rgba(0, 255, 136, 0.05);
                padding: 8px 12px;
                border-radius: 8px;
                margin-bottom: 12px;
                font-size: 12px;
            }

            .strategy-label {
                color: #888;
            }

            .vault-protocols {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                margin-bottom: 12px;
            }

            .protocol-tag {
                background: rgba(0, 255, 136, 0.1);
                color: #00ff88;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
            }

            .lending-rates {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 16px;
            }

            .rate-box {
                padding: 12px;
                border-radius: 8px;
                text-align: center;
            }

            .rate-box.supply {
                background: rgba(0, 255, 136, 0.1);
            }

            .rate-box.borrow {
                background: rgba(255, 136, 0, 0.1);
            }

            .rate-label {
                display: block;
                font-size: 11px;
                color: #888;
                margin-bottom: 4px;
            }

            .rate-value {
                font-size: 20px;
                font-weight: 700;
            }

            .rate-box.supply .rate-value {
                color: #00ff88;
            }

            .rate-box.borrow .rate-value {
                color: #ff8800;
            }

            .utilization-bar {
                position: relative;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                margin-bottom: 16px;
                overflow: hidden;
            }

            .util-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ff88, #00aa55);
                border-radius: 4px;
            }

            .util-label {
                position: absolute;
                right: 0;
                top: 12px;
                font-size: 11px;
                color: #888;
            }

            .lending-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .btn-supply, .btn-borrow {
                padding: 10px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn-supply {
                background: rgba(0, 255, 136, 0.2);
                border: 1px solid rgba(0, 255, 136, 0.4);
                color: #00ff88;
            }

            .btn-borrow {
                background: rgba(255, 136, 0, 0.2);
                border: 1px solid rgba(255, 136, 0, 0.4);
                color: #ff8800;
            }

            .index-price {
                text-align: right;
            }

            .price-value {
                display: block;
                font-size: 20px;
                font-weight: 700;
            }

            .price-change {
                font-size: 12px;
            }

            .price-change.positive {
                color: #00ff88;
            }

            .price-change.negative {
                color: #ff4444;
            }

            .index-holdings {
                margin-bottom: 16px;
            }

            .holdings-label {
                font-size: 12px;
                color: #888;
                display: block;
                margin-bottom: 6px;
            }

            .holdings-bar {
                display: flex;
                height: 12px;
                border-radius: 6px;
                overflow: hidden;
                margin-bottom: 8px;
            }

            .holding-segment {
                height: 100%;
                transition: all 0.3s;
            }

            .holding-segment:nth-child(1) { background: #f59e0b; }
            .holding-segment:nth-child(2) { background: #3b82f6; }
            .holding-segment:nth-child(3) { background: #8b5cf6; }
            .holding-segment:nth-child(4) { background: #ec4899; }
            .holding-segment:nth-child(5) { background: #10b981; }

            .holdings-legend {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                font-size: 10px;
                color: #888;
            }

            /* Combo Cards Styles */
            .combo-card {
                border-color: rgba(168, 85, 247, 0.3);
            }
            .combo-card:hover {
                border-color: rgba(168, 85, 247, 0.6);
            }
            .combo-icon {
                background: rgba(168, 85, 247, 0.2);
            }
            .product-desc-short {
                font-size: 11px;
                color: #888;
                display: block;
                margin-top: 4px;
            }
            .combo-allocation {
                margin-bottom: 16px;
            }
            .allocation-label {
                font-size: 12px;
                color: #888;
                display: block;
                margin-bottom: 8px;
            }
            .allocation-bar {
                display: flex;
                height: 10px;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            .alloc-segment {
                height: 100%;
                transition: all 0.3s;
            }
            .alloc-segment.alloc-0, .alloc-dot.alloc-0 { background: #a855f7; }
            .alloc-segment.alloc-1, .alloc-dot.alloc-1 { background: #3b82f6; }
            .alloc-segment.alloc-2, .alloc-dot.alloc-2 { background: #00ff88; }
            .alloc-segment.alloc-3, .alloc-dot.alloc-3 { background: #f59e0b; }
            .allocation-legend {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .alloc-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
            }
            .alloc-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            .alloc-name {
                flex: 1;
                color: #ccc;
            }
            .alloc-weight {
                color: #888;
                min-width: 35px;
                text-align: right;
            }
            .alloc-apy {
                color: #00ff88;
                min-width: 60px;
                text-align: right;
            }
            .combo-btn {
                background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%);
            }

            .btn-invest {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #00ff88 0%, #00aa55 100%);
                border: none;
                border-radius: 8px;
                color: #000;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn-invest:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
            }

            /* Modal Styles */
            .invest-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 500;
                backdrop-filter: blur(4px);
            }

            .invest-modal {
                background: #0a0a0f;
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 16px;
                width: 90%;
                max-width: 420px;
                overflow: hidden;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .modal-header h2 {
                margin: 0;
                font-size: 18px;
            }

            .modal-close {
                background: none;
                border: none;
                color: #888;
                font-size: 20px;
                cursor: pointer;
            }

            .modal-body {
                padding: 20px;
            }

            .invest-form label {
                display: block;
                color: #888;
                font-size: 12px;
                margin-bottom: 8px;
            }

            .amount-input-group {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 4px;
            }

            .amount-input-group input {
                flex: 1;
                background: none;
                border: none;
                color: #fff;
                font-size: 18px;
                padding: 8px 12px;
                outline: none;
            }

            .token-label {
                color: #888;
                padding: 0 8px;
            }

            .btn-max {
                background: rgba(0, 255, 136, 0.2);
                border: none;
                color: #00ff88;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }

            .balance-row {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #888;
                margin-top: 8px;
            }

            .invest-preview {
                margin-top: 20px;
                padding: 16px;
                background: rgba(0, 255, 136, 0.05);
                border-radius: 12px;
            }

            .invest-preview h4 {
                margin: 0 0 12px;
                font-size: 14px;
                color: #00ff88;
            }

            .returns-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }

            .return-item {
                text-align: center;
            }

            .return-item span:first-child {
                display: block;
                font-size: 11px;
                color: #888;
                margin-bottom: 4px;
            }

            .return-value {
                color: #00ff88;
                font-weight: 600;
            }

            .modal-footer {
                display: flex;
                gap: 12px;
                padding: 16px 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .btn-cancel, .btn-confirm {
                flex: 1;
                padding: 12px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn-cancel {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #888;
            }

            .btn-confirm {
                background: linear-gradient(135deg, #00ff88 0%, #00aa55 100%);
                border: none;
                color: #000;
            }

            .portfolio-modal {
                max-width: 560px;
            }

            .portfolio-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 20px;
            }

            .stat-box {
                background: rgba(0, 255, 136, 0.1);
                padding: 16px;
                border-radius: 12px;
                text-align: center;
            }

            .stat-label {
                display: block;
                font-size: 12px;
                color: #888;
                margin-bottom: 4px;
            }

            .stat-value {
                font-size: 24px;
                font-weight: 700;
            }

            .stat-value.earnings {
                color: #00ff88;
            }

            .portfolio-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .portfolio-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .item-name {
                display: block;
                font-weight: 600;
            }

            .item-amount {
                font-size: 12px;
                color: #888;
            }

            .item-stats {
                text-align: right;
            }

            .item-apy {
                display: block;
                font-size: 12px;
                color: #888;
            }

            .item-earnings {
                color: #00ff88;
                font-weight: 600;
            }

            @media (max-width: 768px) {
                .portfolio-summary {
                    grid-template-columns: 1fr;
                }

                .investment-tabs {
                    flex-wrap: nowrap;
                }

                .products-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(styles);
    },

    // Generate forecast chart for 12 months
    renderForecastChart(amount, apy, riskLevel) {
        const risk = Math.min(5, Math.max(1, riskLevel || 3));
        const volatility = { 1: 0.05, 2: 0.10, 3: 0.15, 4: 0.25, 5: 0.40 }[risk] || 0.15;
        const monthlyRate = (apy || 5) / 100 / 12;
        const maxLoss = { 1: 5, 2: 15, 3: 30, 4: 50, 5: 90 }[risk] || 30;

        // Generate data
        const data = [];
        for (let m = 0; m <= 12; m++) {
            const mean = amount * Math.pow(1 + monthlyRate, m);
            const timeVar = Math.sqrt(m / 12);
            const variation = mean * volatility * timeVar;
            data.push({
                month: m,
                mean: mean,
                min: Math.max(amount * (1 - maxLoss / 100), mean - variation),
                max: mean + variation
            });
        }

        const width = 280, height = 80;
        const padding = { top: 8, right: 8, bottom: 20, left: 8 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const minY = Math.min(...data.map(d => d.min));
        const maxY = Math.max(...data.map(d => d.max));
        const range = maxY - minY || 1;

        const scaleX = (m) => padding.left + (m / 12) * chartWidth;
        const scaleY = (v) => padding.top + ((maxY - v) / range) * chartHeight;

        const meanPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.mean)}`).join(' ');
        const minPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.min)}`).join(' ');
        const maxPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.max)}`).join(' ');
        const areaPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.max)}`).join(' ')
            + data.slice().reverse().map(d => `L ${scaleX(d.month)} ${scaleY(d.min)}`).join(' ') + ' Z';

        const finalMean = data[12].mean;
        const finalMin = data[12].min;
        const finalMax = data[12].max;
        const gain = ((finalMean - amount) / amount * 100).toFixed(1);
        const formatAmt = (v) => v >= 1000 ? (v/1000).toFixed(1) + 'K' : v.toFixed(0);

        return `
            <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;margin-top:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="color:#888;font-size:11px;text-transform:uppercase;">Prévision 12 mois</span>
                    <span style="background:rgba(0,255,136,0.15);color:#00ff88;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:700;">+${gain}%</span>
                </div>
                <svg viewBox="0 0 ${width} ${height}" style="display:block;width:100%;height:80px;">
                    <defs>
                        <linearGradient id="iui-forecast-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="rgba(0,255,136,0.25)" />
                            <stop offset="100%" stop-color="rgba(0,255,136,0)" />
                        </linearGradient>
                    </defs>
                    <path d="${areaPath}" fill="url(#iui-forecast-grad)" />
                    <path d="${maxPath}" fill="none" stroke="rgba(0,255,136,0.3)" stroke-width="1" stroke-dasharray="3,3" />
                    <path d="${minPath}" fill="none" stroke="rgba(255,100,100,0.3)" stroke-width="1" stroke-dasharray="3,3" />
                    <path d="${meanPath}" fill="none" stroke="#00ff88" stroke-width="2" />
                    <circle cx="${scaleX(12)}" cy="${scaleY(finalMean)}" r="4" fill="#00ff88" />
                    <text x="${padding.left}" y="${height - 4}" fill="#666" font-size="9">0</text>
                    <text x="${scaleX(6)}" y="${height - 4}" fill="#666" font-size="9" text-anchor="middle">6m</text>
                    <text x="${width - padding.right}" y="${height - 4}" fill="#666" font-size="9" text-anchor="end">12m</text>
                </svg>
                <div style="display:flex;justify-content:space-around;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05);">
                    <div style="text-align:center;">
                        <div style="color:#666;font-size:9px;text-transform:uppercase;">Min</div>
                        <div style="color:rgba(255,100,100,0.8);font-size:12px;font-weight:600;">$${formatAmt(finalMin)}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#666;font-size:9px;text-transform:uppercase;">Moy</div>
                        <div style="color:#00ff88;font-size:12px;font-weight:600;">$${formatAmt(finalMean)}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#666;font-size:9px;text-transform:uppercase;">Max</div>
                        <div style="color:rgba(0,255,136,0.8);font-size:12px;font-weight:600;">$${formatAmt(finalMax)}</div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InvestmentsUI.init());
} else {
    InvestmentsUI.init();
}

window.InvestmentsUI = InvestmentsUI;
