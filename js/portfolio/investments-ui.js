// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - INVESTMENTS UI
// Complete UI for all investment products
// ═══════════════════════════════════════════════════════════════════════════════

const InvestmentsUI = {
    currentTab: 'all',
    userInvestments: [],

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
                noInvestments: 'No investments yet', startInvesting: 'Start investing to see your portfolio here'
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
                noInvestments: 'Aucun investissement', startInvesting: 'Commencez à investir'
            },
            es: {
                all: 'Todo', investments: 'Inversiones', staking: 'Staking', pools: 'Pools de Liquidez',
                vaults: 'Bóvedas', lending: 'Préstamos', savings: 'Ahorros', indexFunds: 'Fondos Indexados',
                myPortfolio: 'Mi Cartera', totalInvested: 'Total Invertido', totalEarnings: 'Ganancias',
                stake: 'Stakear', deposit: 'Depositar', addLiquidity: 'Añadir Liquidez',
                buy: 'Comprar', sell: 'Vender', confirm: 'Confirmar', cancel: 'Cancelar',
                weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual'
            },
            de: {
                all: 'Alle', investments: 'Investitionen', staking: 'Staking', pools: 'Liquiditätspools',
                vaults: 'Tresore', lending: 'Kredite', savings: 'Sparen', indexFunds: 'Indexfonds',
                myPortfolio: 'Mein Portfolio', totalInvested: 'Gesamt Investiert', totalEarnings: 'Gesamtgewinn',
                stake: 'Staken', deposit: 'Einzahlen', addLiquidity: 'Liquidität Hinzufügen',
                buy: 'Kaufen', sell: 'Verkaufen', confirm: 'Bestätigen', cancel: 'Abbrechen',
                weekly: 'Wöchentlich', monthly: 'Monatlich', yearly: 'Jährlich'
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

        container.innerHTML = `
            <div class="investments-container">
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

                <!-- Products Grid -->
                <div class="products-grid" id="products-grid">
                    ${this.renderProducts()}
                </div>
            </div>
        `;

        this.injectStyles();
    },

    renderProducts() {
        const products = InvestmentProducts[this.currentTab]?.products || [];

        switch(this.currentTab) {
            case 'all':
                return this.renderAllProducts();
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
        const categories = ['staking', 'pools', 'vaults', 'lending', 'savings', 'indexFunds'];
        const icons = { staking: '🔒', pools: '💧', vaults: '🏛️', lending: '💳', savings: '🏦', indexFunds: '📊' };

        categories.forEach(cat => {
            const products = InvestmentProducts[cat]?.products || [];
            if (products.length > 0) {
                html += `<div class="category-section">
                    <h3 class="category-title">${icons[cat]} ${this.t(cat)}</h3>
                    <div class="category-products">`;

                switch(cat) {
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
                        <span>Fees</span>
                        <span class="apy-sub">${p.feeApr}%</span>
                    </div>
                    <div class="apy-item">
                        <span>Rewards</span>
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
                        <span>Total Supply</span>
                        <span>${InvestmentProducts.formatTVL(p.totalSupply)}</span>
                    </div>
                    <div class="detail-row">
                        <span>Collateral Factor</span>
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
                    ${p.insurance ? `<div class="detail-row"><span>Insurance</span><span>✅ Protected</span></div>` : ''}
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
                        <span>AUM</span>
                        <span>${InvestmentProducts.formatTVL(p.aum)}</span>
                    </div>
                    <div class="detail-row">
                        <span>${this.t('rebalance')}</span>
                        <span>${p.rebalanceFreq}</span>
                    </div>
                    <div class="detail-row">
                        <span>Mgmt ${this.t('fee')}</span>
                        <span>${p.managementFee}%</span>
                    </div>
                </div>
                <p class="product-desc">${p.description}</p>
                <button class="btn-invest" onclick="InvestmentsUI.openInvestModal('indexFunds', '${p.id}')">${this.t('buy')}</button>
            </div>
        `).join('');
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('inv-tab')) {
                this.currentTab = e.target.dataset.tab;
                this.render();
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

        const formatBal = (v) => v >= 1000000 ? (v/1000000).toFixed(2) + 'M' : v >= 1000 ? (v/1000).toFixed(2) + 'K' : v.toFixed(2);

        const modal = document.createElement('div');
        modal.className = 'invest-modal-overlay';
        modal.innerHTML = `
            <div class="invest-modal">
                <div class="modal-header">
                    <h2>${product.icon} ${product.name}</h2>
                    <button class="modal-close" onclick="this.closest('.invest-modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <!-- Selecteur Simule / Reel -->
                    <div class="invest-type-selector">
                        <button class="type-btn simulated active" onclick="InvestmentsUI.setInvestType('simulated', this)">
                            🎮 SIMULE
                            <span class="type-balance">${formatBal(simBalance)} USDC</span>
                        </button>
                        <button class="type-btn real" onclick="InvestmentsUI.setInvestType('real', this)">
                            💎 REEL
                            <span class="type-balance">${formatBal(realBalance)} USDC</span>
                        </button>
                    </div>
                    <input type="hidden" id="invest-type" value="simulated">

                    <div class="invest-form">
                        <label>${this.t('amount')}</label>
                        <div class="amount-input-group">
                            <input type="number" id="invest-amount" placeholder="0.00" step="any" min="0">
                            <span class="token-label">${product.token || product.tokens?.[0] || 'USDC'}</span>
                            <button class="btn-max" onclick="InvestmentsUI.setMaxAmount()">${this.t('max')}</button>
                        </div>
                        <div class="balance-row" id="current-balance-row">
                            <span>${this.t('balance')} 🎮:</span>
                            <span id="current-balance-value">${formatBal(simBalance)} USDC</span>
                        </div>
                        <div class="fee-row" id="fee-row">
                            <span>⛽ Frais conversion:</span>
                            <span id="fee-value">${this.getConversionFee(category, product.token)} USDC</span>
                        </div>
                        <div class="total-row" id="total-row">
                            <span>💰 Total à payer:</span>
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
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="this.closest('.invest-modal-overlay').remove()">${this.t('cancel')}</button>
                    <button class="btn-confirm" onclick="InvestmentsUI.confirmInvestment('${category}', '${productId}')">${this.t('confirm')}</button>
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
        `;
        document.head.appendChild(styles);
    },

    confirmInvestment(category, productId) {
        console.log('[DEBUG] confirmInvestment called', { category, productId });

        const amount = parseFloat(document.getElementById('invest-amount')?.value) || 0;
        const investType = document.getElementById('invest-type')?.value || 'simulated';
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
                    showNotification('Connectez votre wallet pour investir en REEL', 'warning');
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
                z-index: 10000;
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
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InvestmentsUI.init());
} else {
    InvestmentsUI.init();
}

window.InvestmentsUI = InvestmentsUI;
