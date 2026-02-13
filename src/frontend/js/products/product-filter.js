/**
 * Product Filter Module - Search, filter and sort products
 * Build: 2026-01-17
 */

const ProductFilter = {
    // Product metadata with min-budget, apy, risk, category and descriptions
    products: {
        // Yield & Savings
        'staking': { name: 'Staking', minBudget: 10, apy: 8, risk: 2, category: 'yield', module: 'StakingModule', recommended: true,
            desc: 'Lock your crypto to secure the network and earn passive rewards. Safe and predictable returns.',
            descFr: 'Verrouillez vos cryptos pour sécuriser le réseau et gagner des récompenses passives. Rendements sûrs et prévisibles.' },
        'savings': { name: 'Savings', minBudget: 1, apy: 5, risk: 1, category: 'yield', module: 'SavingsModule', recommended: true,
            desc: 'Earn interest on your stablecoins. Capital protected, ideal for beginners.',
            descFr: 'Gagnez des intérêts sur vos stablecoins. Capital protégé, idéal pour débutants.' },
        'vaults': { name: 'Vaults', minBudget: 50, apy: 12, risk: 2, category: 'yield', module: 'VaultsModule', recommended: true,
            desc: 'Automated yield strategies. Your funds are auto-compounded for maximum returns.',
            descFr: 'Stratégies de rendement automatisées. Vos fonds sont auto-composés pour un rendement maximum.' },
        'yield-farming': { name: 'Yield Farming', minBudget: 100, apy: 25, risk: 4, category: 'yield', module: 'YieldFarmingModule',
            desc: 'Provide liquidity to DeFi protocols for high rewards. Higher risk, higher returns.',
            descFr: 'Fournissez de la liquidité aux protocoles DeFi pour des récompenses élevées. Plus de risque, plus de rendement.' },

        // Liquidity
        'liquidity-pools': { name: 'Liquidity Pools', minBudget: 100, apy: 20, risk: 3, category: 'liquidity', module: 'LiquidityPoolsModule',
            desc: 'Add tokens to trading pairs and earn fees from every swap. Watch for impermanent loss.',
            descFr: 'Ajoutez des tokens aux paires de trading et gagnez des frais sur chaque échange. Attention à l\'impermanent loss.' },
        'lending': { name: 'Lending', minBudget: 10, apy: 8, risk: 2, category: 'liquidity', module: 'LendingModule', recommended: true,
            desc: 'Lend your crypto to borrowers and earn interest. Protocol-secured with collateral.',
            descFr: 'Prêtez vos cryptos aux emprunteurs et gagnez des intérêts. Sécurisé par collatéral.' },

        // Trading & Derivatives
        'perpetuals': { name: 'Perpetuals', minBudget: 10, apy: 0, risk: 5, category: 'trading', module: 'PerpetualsModule',
            desc: 'Trade with leverage, no expiry. High risk - you can lose more than your deposit.',
            descFr: 'Tradez avec effet de levier, sans expiration. Risque élevé - perte possible supérieure au dépôt.' },
        'options': { name: 'Options', minBudget: 50, apy: 0, risk: 4, category: 'trading', module: 'OptionsModule',
            desc: 'Buy/sell the right to trade at a fixed price. Limited loss potential, strategic trading.',
            descFr: 'Achetez/vendez le droit de trader à un prix fixe. Perte limitée, trading stratégique.' },
        'derivatives': { name: 'Derivatives', minBudget: 100, apy: 0, risk: 5, category: 'trading', module: 'DerivativesModule',
            desc: 'Complex financial instruments. For experienced traders only.',
            descFr: 'Instruments financiers complexes. Réservé aux traders expérimentés.' },
        'leveraged-tokens': { name: 'Leveraged Tokens', minBudget: 20, apy: 0, risk: 5, category: 'trading', module: 'LeveragedTokensModule',
            desc: 'Tokens with built-in leverage (2x-3x). Amplified gains and losses.',
            descFr: 'Tokens avec effet de levier intégré (2x-3x). Gains et pertes amplifiés.' },
        'copy-trading': { name: 'Copy Trading', minBudget: 50, apy: 15, risk: 3, category: 'trading', module: 'CopyTradingModule',
            desc: 'Automatically copy trades from successful traders. Good for learning.',
            descFr: 'Copiez automatiquement les trades des traders performants. Idéal pour apprendre.' },

        // Structured & Special
        'structured': { name: 'Structured', minBudget: 500, apy: 18, risk: 3, category: 'structured', module: 'StructuredModule',
            desc: 'Pre-packaged investment strategies combining multiple products for optimal risk/return.',
            descFr: 'Stratégies d\'investissement pré-packagées combinant plusieurs produits pour un ratio risque/rendement optimal.' },
        'index-funds': { name: 'Index Funds', minBudget: 10, apy: 12, risk: 2, category: 'structured', module: 'IndexFundsModule', recommended: true,
            desc: 'Invest in a basket of top cryptocurrencies. Diversified exposure, lower risk.',
            descFr: 'Investissez dans un panier des meilleures cryptos. Exposition diversifiée, risque réduit.' },
        'predictions': { name: 'Predictions', minBudget: 5, apy: 0, risk: 5, category: 'structured', module: 'PredictionsModule',
            desc: 'Bet on future events. Entertainment product - treat as gambling.',
            descFr: 'Pariez sur des événements futurs. Produit de divertissement - considérez comme jeu d\'argent.' },
        'lottery': { name: 'Lottery', minBudget: 1, apy: 0, risk: 5, category: 'structured', module: 'LotteryModule',
            desc: 'No-loss lottery using yield. Your principal is safe, only yield is at risk.',
            descFr: 'Loterie sans perte utilisant le rendement. Votre capital est sûr, seul le rendement est risqué.' },

        // Real World Assets
        'rwa': { name: 'RWA', minBudget: 1000, apy: 8, risk: 2, category: 'rwa', module: 'RWAModule',
            desc: 'Tokenized real-world assets like bonds, real estate, and commodities.',
            descFr: 'Actifs réels tokenisés comme obligations, immobilier et matières premières.' },
        'insurance': { name: 'Insurance', minBudget: 50, apy: 0, risk: 1, category: 'rwa', module: 'InsuranceModule',
            desc: 'Protect your DeFi investments against hacks and smart contract failures.',
            descFr: 'Protégez vos investissements DeFi contre les hacks et défaillances de smart contracts.' },

        // Launchpad & NFT
        'launchpad': { name: 'Launchpad', minBudget: 100, apy: 0, risk: 5, category: 'advanced', module: 'LaunchpadModule',
            desc: 'Invest in new crypto projects at launch. High risk, high potential.',
            descFr: 'Investissez dans de nouveaux projets crypto au lancement. Risque élevé, fort potentiel.' },
        'nft-staking': { name: 'NFT Staking', minBudget: 0, apy: 15, risk: 3, category: 'advanced', module: 'NFTStakingModule',
            desc: 'Stake your NFTs to earn rewards. Returns depend on NFT value and collection.',
            descFr: 'Stakez vos NFTs pour gagner des récompenses. Rendement selon valeur et collection.' },

        // Advanced
        'margin-trading': { name: 'Margin Trading', minBudget: 100, apy: 0, risk: 5, category: 'advanced', module: 'MarginTradingModule',
            desc: 'Borrow funds to trade larger positions. Risk of liquidation if market moves against you.',
            descFr: 'Empruntez pour trader des positions plus grandes. Risque de liquidation si le marché va contre vous.' },
        'fixed-income': { name: 'Fixed Income', minBudget: 100, apy: 10, risk: 1, category: 'advanced', module: 'FixedIncomeModule', recommended: true,
            desc: 'Guaranteed fixed returns for a set period. Predictable and safe.',
            descFr: 'Rendements fixes garantis pour une période définie. Prévisible et sûr.' },
        'crypto-bonds': { name: 'Crypto Bonds', minBudget: 500, apy: 12, risk: 2, category: 'advanced', module: 'CryptoBondsModule',
            desc: 'Tokenized bonds with regular interest payments. Institutional-grade investment.',
            descFr: 'Obligations tokenisées avec paiements d\'intérêts réguliers. Investissement de qualité institutionnelle.' },
        'etf-tokens': { name: 'ETF Tokens', minBudget: 10, apy: 10, risk: 2, category: 'advanced', module: 'ETFTokensModule', recommended: true,
            desc: 'Exchange-traded funds in token form. Easy exposure to crypto sectors.',
            descFr: 'Fonds négociés en bourse sous forme de token. Exposition facile aux secteurs crypto.' },
        'social-trading': { name: 'Social Trading', minBudget: 25, apy: 15, risk: 3, category: 'advanced', module: 'SocialTradingModule',
            desc: 'Follow and copy top traders. Learn while earning.',
            descFr: 'Suivez et copiez les meilleurs traders. Apprenez en gagnant.' },
        'algo-strategies': { name: 'Algo Strategies', minBudget: 100, apy: 20, risk: 3, category: 'advanced', module: 'AlgoStrategiesModule',
            desc: 'Automated trading bots using advanced algorithms. 24/7 market monitoring.',
            descFr: 'Bots de trading automatisés utilisant des algorithmes avancés. Surveillance du marché 24/7.' },
        'flash-loans': { name: 'Flash Loans', minBudget: 0, apy: 50, risk: 5, category: 'advanced', module: 'FlashLoansModule',
            desc: 'Instant uncollateralized loans repaid in same transaction. For arbitrage experts.',
            descFr: 'Prêts instantanés sans collatéral remboursés dans la même transaction. Pour experts en arbitrage.' },
        'yield-aggregator': { name: 'Yield Aggregator', minBudget: 50, apy: 18, risk: 2, category: 'advanced', module: 'YieldAggregatorModule', recommended: true,
            desc: 'Automatically find and move funds to best yields. Set and forget optimization.',
            descFr: 'Trouve et déplace automatiquement les fonds vers les meilleurs rendements. Optimisation sans effort.' },
        'governance-staking': { name: 'Governance Staking', minBudget: 100, apy: 8, risk: 2, category: 'advanced', module: 'GovernanceStakingModule',
            desc: 'Stake governance tokens to vote on protocol decisions and earn rewards.',
            descFr: 'Stakez des tokens de gouvernance pour voter sur les décisions du protocole et gagner des récompenses.' },
        'liquidation-pools': { name: 'Liquidation Pools', minBudget: 500, apy: 30, risk: 4, category: 'advanced', module: 'LiquidationPoolsModule',
            desc: 'Provide funds to liquidate underwater positions. High yield, market timing risk.',
            descFr: 'Fournissez des fonds pour liquider les positions sous-collatéralisées. Haut rendement, risque de timing.' }
    },

    // Current filter state
    state: {
        searchQuery: '',
        maxBudget: 'all',
        category: 'all',
        sortBy: 'default'
    },

    // Initialize
    init() {
        console.log('[ProductFilter] Initialized with', Object.keys(this.products).length, 'products');
        this.addDataAttributesToCards();
        this.addDescriptionsToAllCards();
        this.createRecommendedBanner();
        this.injectHighlightStyle();
    },

    // Add descriptions to all cards
    addDescriptionsToAllCards() {
        document.querySelectorAll('.product-card[data-product-id]').forEach(card => {
            const productId = card.getAttribute('data-product-id');
            if (productId) {
                this.addDescriptionToCard(card, productId);
            }
        });
    },

    // Inject highlight animation style
    injectHighlightStyle() {
        if (document.getElementById('product-highlight-style')) return;
        const style = document.createElement('style');
        style.id = 'product-highlight-style';
        style.textContent = `
            @keyframes pulse-highlight {
                0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.7); }
                50% { box-shadow: 0 0 20px 10px rgba(0,255,136,0.3); }
                100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
            }
        `;
        document.head.appendChild(style);
    },

    // Risk level definitions
    riskLevels: {
        1: { label: 'Très Faible', labelEn: 'Very Low', color: '#22c55e', bgColor: 'rgba(34,197,94,0.15)' },
        2: { label: 'Faible', labelEn: 'Low', color: '#84cc16', bgColor: 'rgba(132,204,22,0.15)' },
        3: { label: 'Moyen', labelEn: 'Medium', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)' },
        4: { label: 'Élevé', labelEn: 'High', color: '#f97316', bgColor: 'rgba(249,115,22,0.15)' },
        5: { label: 'Extrême', labelEn: 'Extreme', color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)' }
    },

    // Add data attributes to product cards based on module name
    addDataAttributesToCards() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const onclick = card.getAttribute('onclick') || '';
            // Extract module name from onclick
            for (const [id, data] of Object.entries(this.products)) {
                if (onclick.includes(data.module)) {
                    card.setAttribute('data-product-id', id);
                    card.setAttribute('data-min-budget', data.minBudget);
                    card.setAttribute('data-apy', data.apy);
                    card.setAttribute('data-risk', data.risk);
                    card.setAttribute('data-category', data.category);
                    card.setAttribute('data-name', data.name.toLowerCase());

                    // Add risk badge if not already present
                    if (!card.querySelector('.product-risk-badge')) {
                        this.addRiskBadge(card, data.risk, data.apy);
                    }
                    break;
                }
            }
        });
    },

    // Add risk badge to a product card
    addRiskBadge(card, riskLevel, apy) {
        const risk = this.riskLevels[riskLevel] || this.riskLevels[3];
        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || 'en';
        const label = lang === 'fr' ? risk.label : risk.labelEn;

        // Create risk badge
        const badge = document.createElement('div');
        badge.className = 'product-risk-badge';
        badge.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            font-size: 10px;
        `;

        badge.innerHTML = `
            <span style="background:${risk.bgColor};color:${risk.color};padding:2px 6px;border-radius:4px;font-weight:600;">
                ⚠️ ${label}
            </span>
            ${apy > 0 ? `<span style="background:rgba(0,255,136,0.15);color:#00ff88;padding:2px 6px;border-radius:4px;font-weight:600;">
                ${apy}% APY
            </span>` : ''}
        `;

        // Make card position relative for absolute positioning
        card.style.position = 'relative';
        card.appendChild(badge);
    },

    // Add description tooltip to a product card
    addDescriptionToCard(card, productId) {
        const product = this.products[productId];
        if (!product || card.querySelector('.product-desc-tooltip')) return;

        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || 'en';
        const desc = lang === 'fr' ? (product.descFr || product.desc) : product.desc;
        if (!desc) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'product-desc-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            bottom: 8px;
            left: 8px;
            right: 8px;
            background: rgba(0,0,0,0.85);
            color: #aaa;
            font-size: 10px;
            padding: 6px 8px;
            border-radius: 6px;
            line-height: 1.4;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            z-index: 10;
        `;
        tooltip.textContent = desc;

        card.appendChild(tooltip);
        card.addEventListener('mouseenter', () => tooltip.style.opacity = '1');
        card.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
    },

    // Get recommended products (safe + profitable)
    getRecommendedProducts() {
        return Object.entries(this.products)
            .filter(([id, p]) => p.recommended)
            .sort((a, b) => {
                // Sort by score: APY / risk (higher APY, lower risk = better)
                const scoreA = a[1].apy / (a[1].risk || 1);
                const scoreB = b[1].apy / (b[1].risk || 1);
                return scoreB - scoreA;
            });
    },

    // Get the single best product (highest APY with risk <= 2)
    getBestSafeProduct() {
        return Object.entries(this.products)
            .filter(([id, p]) => p.risk <= 2 && p.apy > 0)
            .sort((a, b) => b[1].apy - a[1].apy)[0];
    },

    // Create recommended products banner
    createRecommendedBanner() {
        const existingBanner = document.getElementById('recommended-products-banner');
        if (existingBanner) return;

        const container = document.querySelector('#tab-products .products-grid, #tab-products .product-categories');
        if (!container) return;

        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || 'en';
        const isFr = lang === 'fr';
        const recommended = this.getRecommendedProducts().slice(0, 4);
        const best = this.getBestSafeProduct();

        if (recommended.length === 0) return;

        const banner = document.createElement('div');
        banner.id = 'recommended-products-banner';
        banner.style.cssText = `
            background: linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,212,170,0.05));
            border: 1px solid rgba(0,255,136,0.3);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
        `;

        let bestHtml = '';
        if (best) {
            const [bestId, bestData] = best;
            const bestDesc = isFr ? (bestData.descFr || bestData.desc) : bestData.desc;
            bestHtml = `
                <div style="background:linear-gradient(135deg,rgba(0,255,136,0.2),rgba(0,212,170,0.1));border:2px solid rgba(0,255,136,0.5);border-radius:12px;padding:16px;margin-bottom:16px;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                        <span style="font-size:28px;">🏆</span>
                        <div>
                            <div style="color:#00ff88;font-size:13px;font-weight:700;">${isFr ? 'MEILLEUR CHOIX - SÛR & RENTABLE' : 'BEST CHOICE - SAFE & PROFITABLE'}</div>
                            <div style="color:#fff;font-size:18px;font-weight:600;">${bestData.name}</div>
                        </div>
                        <div style="margin-left:auto;text-align:right;">
                            <div style="color:#00ff88;font-size:20px;font-weight:700;">${bestData.apy}% APY</div>
                            <div style="color:#84cc16;font-size:11px;">${isFr ? 'Risque Faible' : 'Low Risk'}</div>
                        </div>
                    </div>
                    <div style="color:#aaa;font-size:12px;line-height:1.5;">${bestDesc}</div>
                </div>
            `;
        }

        banner.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <h3 style="color:#00ff88;margin:0;font-size:16px;">⭐ ${isFr ? 'Produits Recommandés' : 'Recommended Products'}</h3>
                <span style="color:#888;font-size:11px;">${isFr ? 'Sûrs & rentables pour débutants' : 'Safe & profitable for beginners'}</span>
            </div>
            ${bestHtml}
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
                ${recommended.map(([id, p]) => {
                    const desc = isFr ? (p.descFr || p.desc) : p.desc;
                    const riskInfo = this.riskLevels[p.risk];
                    return `
                        <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;cursor:pointer;transition:all 0.3s;"
                             onclick="ProductFilter.scrollToProduct('${id}')"
                             onmouseover="this.style.borderColor='rgba(0,255,136,0.5)'"
                             onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                <span style="color:#fff;font-weight:600;">${p.name}</span>
                                <span style="color:#00ff88;font-size:12px;font-weight:600;">${p.apy}%</span>
                            </div>
                            <div style="color:#888;font-size:10px;line-height:1.4;margin-bottom:6px;">${desc ? desc.substring(0, 60) + '...' : ''}</div>
                            <div style="display:flex;gap:6px;">
                                <span style="background:${riskInfo.bgColor};color:${riskInfo.color};padding:2px 6px;border-radius:4px;font-size:9px;">
                                    ${isFr ? riskInfo.label : riskInfo.labelEn}
                                </span>
                                <span style="background:rgba(255,255,255,0.1);color:#888;padding:2px 6px;border-radius:4px;font-size:9px;">
                                    Min $${p.minBudget}
                                </span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.parentNode.insertBefore(banner, container);
    },

    // Scroll to a specific product
    scrollToProduct(productId) {
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.animation = 'pulse-highlight 1s ease-out';
            setTimeout(() => card.style.animation = '', 1000);
        }
    },

    // Search by name with suggestions
    search(query) {
        this.state.searchQuery = query.toLowerCase();
        this.applyFilters();
        this.showSuggestions(query);
    },

    // Show search suggestions dropdown
    showSuggestions(query) {
        const searchInput = document.getElementById('product-search');
        if (!searchInput) return;

        // Remove existing dropdown
        const existingDropdown = document.getElementById('product-search-suggestions');
        if (existingDropdown) existingDropdown.remove();

        if (!query || query.length < 2) return;

        const q = query.toLowerCase();
        const matches = [];

        // Find matching products
        for (const [id, data] of Object.entries(this.products)) {
            if (data.name.toLowerCase().includes(q)) {
                matches.push({ id, ...data });
            }
        }

        if (matches.length === 0) return;

        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.id = 'product-search-suggestions';
        dropdown.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#1a1a2e;border:1px solid rgba(0,255,136,0.3);border-radius:8px;max-height:300px;overflow-y:auto;z-index:1000;margin-top:4px;box-shadow:0 10px 40px rgba(0,0,0,0.5);';

        matches.slice(0, 8).forEach(product => {
            const item = document.createElement('div');
            item.style.cssText = 'padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.2s;';
            item.onmouseover = () => item.style.background = 'rgba(0,255,136,0.1)';
            item.onmouseout = () => item.style.background = 'transparent';

            const riskColors = ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];
            const riskLabels = ['Très faible', 'Faible', 'Moyen', 'Élevé', 'Extrême'];

            item.innerHTML = `
                <div>
                    <div style="color:#fff;font-weight:600;font-size:14px;">${product.name}</div>
                    <div style="color:#888;font-size:11px;margin-top:2px;">Min: $${product.minBudget} | APY: ${product.apy}%</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="color:${riskColors[product.risk - 1]};font-size:11px;">${riskLabels[product.risk - 1]}</span>
                    <span style="color:#00ff88;font-size:12px;">→</span>
                </div>
            `;

            item.onclick = () => {
                dropdown.remove();
                searchInput.value = '';
                this.state.searchQuery = '';
                this.applyFilters();
                this.navigateToProduct(product.id, product.module);
            };

            dropdown.appendChild(item);
        });

        // Position relative to input
        const inputParent = searchInput.parentElement;
        inputParent.style.position = 'relative';
        inputParent.appendChild(dropdown);

        // Close on click outside
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== searchInput) {
                dropdown.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 100);
    },

    // Navigate to a product (scroll and optionally open modal)
    navigateToProduct(productId, moduleName) {
        console.log('[ProductFilter] Navigating to:', productId, moduleName);

        // First ensure we're on the products tab
        if (typeof ObeliskApp !== 'undefined' && ObeliskApp.switchTab) {
            ObeliskApp.switchTab('products');
        }

        // Wait for tab switch, then find and scroll to product
        setTimeout(() => {
            // Try to find the product card
            const card = document.querySelector(`[data-product-id="${productId}"]`) ||
                         document.querySelector(`.product-card[onclick*="${moduleName}"]`);

            if (card) {
                // Scroll to card
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Highlight it briefly
                card.style.transition = 'box-shadow 0.3s, transform 0.3s';
                card.style.boxShadow = '0 0 30px rgba(0,255,136,0.5)';
                card.style.transform = 'scale(1.02)';

                setTimeout(() => {
                    card.style.boxShadow = '';
                    card.style.transform = '';
                }, 2000);

                // Click the card to open modal
                setTimeout(() => card.click(), 500);
            } else {
                // Fallback: try to open the module directly
                if (typeof window[moduleName] !== 'undefined' && window[moduleName].openInvest) {
                    window[moduleName].openInvest();
                }
            }
        }, 300);
    },

    // Filter by budget
    filterByBudget(maxBudget) {
        this.state.maxBudget = maxBudget;
        this.applyFilters();
    },

    // Filter by category
    filterByCategory(category) {
        this.state.category = category;
        this.applyFilters();
    },

    // Sort products
    sort(sortBy) {
        this.state.sortBy = sortBy;
        this.applyFilters();
    },

    // Reset all filters
    reset() {
        this.state = {
            searchQuery: '',
            maxBudget: 'all',
            category: 'all',
            sortBy: 'default'
        };

        // Reset UI
        document.getElementById('product-search').value = '';
        document.getElementById('product-budget-filter').value = 'all';
        document.getElementById('product-category-filter').value = 'all';
        document.getElementById('product-sort').value = 'default';

        this.applyFilters();
    },

    // Apply all filters
    applyFilters() {
        const cards = document.querySelectorAll('.product-card');
        const categories = document.querySelectorAll('.product-category, [data-category]');
        let visibleCount = 0;

        // Track which categories have visible products
        const visibleCategories = new Set();

        cards.forEach(card => {
            const name = card.getAttribute('data-name') || '';
            const minBudget = parseFloat(card.getAttribute('data-min-budget')) || 0;
            const apy = parseFloat(card.getAttribute('data-apy')) || 0;
            const risk = parseFloat(card.getAttribute('data-risk')) || 0;
            const category = card.getAttribute('data-category') || '';

            let visible = true;

            // Search filter
            if (this.state.searchQuery && !name.includes(this.state.searchQuery)) {
                visible = false;
            }

            // Budget filter
            if (this.state.maxBudget !== 'all') {
                const maxBudget = parseFloat(this.state.maxBudget);
                if (minBudget > maxBudget) {
                    visible = false;
                }
            }

            // Category filter
            if (this.state.category !== 'all' && category !== this.state.category) {
                visible = false;
            }

            // Show/hide card
            card.style.display = visible ? '' : 'none';

            if (visible) {
                visibleCount++;
                visibleCategories.add(category);
            }
        });

        // Hide empty category sections
        categories.forEach(cat => {
            const catName = cat.getAttribute('data-category');
            if (catName) {
                // Check if any cards in this category are visible
                const catCards = cat.querySelectorAll('.product-card');
                let hasVisible = false;
                catCards.forEach(c => {
                    if (c.style.display !== 'none') hasVisible = true;
                });
                cat.style.display = hasVisible ? '' : 'none';
            }
        });

        // Sorting (reorder within each grid)
        if (this.state.sortBy !== 'default') {
            this.sortCards();
        }

        // Update results count
        const filterResults = document.getElementById('filter-results');
        const filterCount = document.getElementById('filter-count');
        if (filterResults && filterCount) {
            filterCount.textContent = visibleCount;
            filterResults.style.display = (this.state.searchQuery || this.state.maxBudget !== 'all' || this.state.category !== 'all') ? 'block' : 'none';
        }

        console.log('[ProductFilter] Showing', visibleCount, 'products');
    },

    // Sort cards within their grids
    sortCards() {
        const grids = document.querySelectorAll('#tab-products .product-category > div:last-child, #tab-products [style*="grid"]');

        grids.forEach(grid => {
            const cards = Array.from(grid.querySelectorAll('.product-card'));
            if (cards.length < 2) return;

            cards.sort((a, b) => {
                const apyA = parseFloat(a.getAttribute('data-apy')) || 0;
                const apyB = parseFloat(b.getAttribute('data-apy')) || 0;
                const riskA = parseFloat(a.getAttribute('data-risk')) || 0;
                const riskB = parseFloat(b.getAttribute('data-risk')) || 0;
                const budgetA = parseFloat(a.getAttribute('data-min-budget')) || 0;
                const budgetB = parseFloat(b.getAttribute('data-min-budget')) || 0;

                switch (this.state.sortBy) {
                    case 'apy-desc': return apyB - apyA;
                    case 'apy-asc': return apyA - apyB;
                    case 'risk-asc': return riskA - riskB;
                    case 'risk-desc': return riskB - riskA;
                    case 'budget-asc': return budgetA - budgetB;
                    default: return 0;
                }
            });

            // Reorder in DOM
            cards.forEach(card => grid.appendChild(card));
        });
    },

    // Get product info by ID
    getProduct(id) {
        return this.products[id] || null;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => ProductFilter.init(), 500);
});

console.log('[ProductFilter] Module loaded');
