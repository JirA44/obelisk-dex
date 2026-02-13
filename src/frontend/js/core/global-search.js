/**
 * GLOBAL SEARCH - Search anything on Obelisk DEX
 * Pages, products, features, tools, terms
 * Build: 2026-01-30
 */

const GlobalSearch = {
    // Search index - all searchable items
    index: [
        // ═══════════════════════════════════════════════════════════════
        // PAGES (Tab Navigation)
        // ═══════════════════════════════════════════════════════════════
        { id: 'dashboard', type: 'page', name: 'Dashboard', nameFr: 'Tableau de bord', icon: '🏠', tab: 'dashboard', desc: 'Overview of your portfolio and market', descFr: 'Vue d\'ensemble de votre portefeuille et du marché' },
        { id: 'trade', type: 'page', name: 'Trade', nameFr: 'Trading', icon: '📈', tab: 'trade', desc: 'Spot and margin trading', descFr: 'Trading spot et sur marge' },
        { id: 'swap', type: 'page', name: 'Swap', nameFr: 'Échange', icon: '🔄', tab: 'swap', desc: 'Instant token swaps', descFr: 'Échange instantané de tokens' },
        { id: 'fast-trading', type: 'page', name: 'Fast Trading', nameFr: 'Trading Rapide', icon: '⚡', tab: 'fast-trading', desc: 'Quick trades with one click', descFr: 'Trades rapides en un clic' },
        { id: 'hft', type: 'page', name: 'HFT', nameFr: 'HFT', icon: '🚀', tab: 'hft', desc: 'High-frequency trading tools', descFr: 'Outils de trading haute fréquence' },
        { id: 'perps', type: 'page', name: 'Perpetuals', nameFr: 'Perpétuels', icon: '📉', tab: 'perps', desc: 'Perpetual futures trading', descFr: 'Trading de futures perpétuels' },
        { id: 'banking', type: 'page', name: 'Banking', nameFr: 'Banque', icon: '🏦', tab: 'banking', desc: 'Deposit, withdraw, transfers', descFr: 'Dépôt, retrait, transferts' },
        { id: 'wallet', type: 'page', name: 'Wallet', nameFr: 'Portefeuille', icon: '👛', tab: 'wallet', desc: 'Manage your crypto wallet', descFr: 'Gérez votre portefeuille crypto' },
        { id: 'portfolio', type: 'page', name: 'Portfolio', nameFr: 'Portfolio', icon: '📊', tab: 'portfolio', desc: 'Track your investments', descFr: 'Suivez vos investissements' },
        { id: 'combos', type: 'page', name: 'Combos', nameFr: 'Combos', icon: '🎯', tab: 'combos', desc: 'Pre-built investment strategies', descFr: 'Stratégies d\'investissement prédéfinies' },
        { id: 'investments', type: 'page', name: 'Investments', nameFr: 'Investissements', icon: '💰', tab: 'investments', desc: 'All investment products', descFr: 'Tous les produits d\'investissement' },
        { id: 'products', type: 'page', name: 'Products', nameFr: 'Produits', icon: '🛒', tab: 'products', desc: 'Browse all products', descFr: 'Parcourir tous les produits' },
        { id: 'bonds', type: 'page', name: 'Bonds', nameFr: 'Obligations', icon: '📜', tab: 'bonds', desc: 'Crypto bonds and fixed income', descFr: 'Obligations crypto et revenus fixes' },
        { id: 'tools', type: 'page', name: 'Tools', nameFr: 'Outils', icon: '🔧', tab: 'tools', desc: 'Trading and analysis tools', descFr: 'Outils de trading et d\'analyse' },
        { id: 'bots', type: 'page', name: 'Bots', nameFr: 'Bots', icon: '🤖', tab: 'bots', desc: 'Automated trading bots', descFr: 'Bots de trading automatisés' },
        { id: 'learn', type: 'page', name: 'Learn', nameFr: 'Apprendre', icon: '📚', tab: 'learn', desc: 'Educational resources', descFr: 'Ressources éducatives' },
        { id: 'about', type: 'page', name: 'About', nameFr: 'À propos', icon: '🏛️', tab: 'about', desc: 'About Obelisk DEX', descFr: 'À propos d\'Obelisk DEX' },
        { id: 'settings', type: 'page', name: 'Settings', nameFr: 'Paramètres', icon: '⚙️', tab: 'settings', desc: 'App settings and preferences', descFr: 'Paramètres et préférences' },

        // ═══════════════════════════════════════════════════════════════
        // PRODUCTS - Yield & Savings
        // ═══════════════════════════════════════════════════════════════
        { id: 'staking', type: 'product', name: 'Staking', nameFr: 'Staking', icon: '🔒', category: 'staking', tab: 'products', desc: 'Lock crypto to earn rewards', descFr: 'Verrouillez vos cryptos pour gagner des récompenses' },
        { id: 'eth-staking', type: 'product', name: 'ETH Staking', nameFr: 'Staking ETH', icon: '⟠', category: 'staking', tab: 'products', desc: 'Stake Ethereum for ~4% APY', descFr: 'Stakez Ethereum pour ~4% APY' },
        { id: 'sol-staking', type: 'product', name: 'SOL Staking', nameFr: 'Staking SOL', icon: '◎', category: 'staking', tab: 'products', desc: 'Stake Solana for ~7% APY', descFr: 'Stakez Solana pour ~7% APY' },
        { id: 'liquid-staking', type: 'product', name: 'Liquid Staking', nameFr: 'Staking Liquide', icon: '💧', category: 'staking', tab: 'products', desc: 'Stake and keep liquidity', descFr: 'Stakez tout en gardant la liquidité' },
        { id: 'savings', type: 'product', name: 'Savings', nameFr: 'Épargne', icon: '🏦', category: 'savings', tab: 'products', desc: 'Earn interest on stablecoins', descFr: 'Gagnez des intérêts sur stablecoins' },
        { id: 'vaults', type: 'product', name: 'Vaults', nameFr: 'Coffres', icon: '🏛️', category: 'vaults', tab: 'products', desc: 'Automated yield strategies', descFr: 'Stratégies de rendement automatisées' },
        { id: 'yield-farming', type: 'product', name: 'Yield Farming', nameFr: 'Yield Farming', icon: '🌾', category: 'yield', tab: 'products', desc: 'Farm high APY rewards', descFr: 'Farmez des récompenses à haut APY' },

        // ═══════════════════════════════════════════════════════════════
        // PRODUCTS - Liquidity & Lending
        // ═══════════════════════════════════════════════════════════════
        { id: 'liquidity-pools', type: 'product', name: 'Liquidity Pools', nameFr: 'Pools de Liquidité', icon: '💧', category: 'pools', tab: 'products', desc: 'Provide liquidity and earn fees', descFr: 'Fournissez de la liquidité et gagnez des frais' },
        { id: 'lending', type: 'product', name: 'Lending', nameFr: 'Prêt', icon: '💸', category: 'lending', tab: 'products', desc: 'Lend crypto and earn interest', descFr: 'Prêtez vos cryptos et gagnez des intérêts' },
        { id: 'borrowing', type: 'product', name: 'Borrowing', nameFr: 'Emprunt', icon: '🏧', category: 'lending', tab: 'products', desc: 'Borrow against your crypto', descFr: 'Empruntez contre vos cryptos' },

        // ═══════════════════════════════════════════════════════════════
        // PRODUCTS - Trading & Derivatives
        // ═══════════════════════════════════════════════════════════════
        { id: 'perpetuals-product', type: 'product', name: 'Perpetual Futures', nameFr: 'Futures Perpétuels', icon: '📉', category: 'trading', tab: 'perps', desc: 'Trade with leverage, no expiry', descFr: 'Tradez avec levier, sans expiration' },
        { id: 'options', type: 'product', name: 'Options', nameFr: 'Options', icon: '🎲', category: 'trading', tab: 'products', desc: 'Call and put options', descFr: 'Options call et put' },
        { id: 'leveraged-tokens', type: 'product', name: 'Leveraged Tokens', nameFr: 'Tokens à Levier', icon: '⬆️', category: 'trading', tab: 'products', desc: '2x-3x leveraged tokens', descFr: 'Tokens avec levier 2x-3x' },
        { id: 'copy-trading', type: 'product', name: 'Copy Trading', nameFr: 'Copy Trading', icon: '👥', category: 'trading', tab: 'products', desc: 'Copy successful traders', descFr: 'Copiez les traders performants' },
        { id: 'margin-trading', type: 'product', name: 'Margin Trading', nameFr: 'Trading sur Marge', icon: '📊', category: 'trading', tab: 'trade', desc: 'Trade with borrowed funds', descFr: 'Tradez avec des fonds empruntés' },

        // ═══════════════════════════════════════════════════════════════
        // PRODUCTS - Structured & Index
        // ═══════════════════════════════════════════════════════════════
        { id: 'index-funds', type: 'product', name: 'Index Funds', nameFr: 'Fonds Indiciels', icon: '📈', category: 'index', tab: 'products', desc: 'Diversified crypto baskets', descFr: 'Paniers crypto diversifiés' },
        { id: 'etf-tokens', type: 'product', name: 'ETF Tokens', nameFr: 'Tokens ETF', icon: '🏷️', category: 'index', tab: 'products', desc: 'Exchange-traded fund tokens', descFr: 'Tokens de fonds négociés en bourse' },
        { id: 'structured-products', type: 'product', name: 'Structured Products', nameFr: 'Produits Structurés', icon: '🎯', category: 'structured', tab: 'products', desc: 'Pre-packaged strategies', descFr: 'Stratégies pré-packagées' },
        { id: 'dual-investment', type: 'product', name: 'Dual Investment', nameFr: 'Double Investissement', icon: '🔀', category: 'structured', tab: 'products', desc: 'Buy low or sell high', descFr: 'Achetez bas ou vendez haut' },

        // ═══════════════════════════════════════════════════════════════
        // PRODUCTS - Fixed Income & Bonds
        // ═══════════════════════════════════════════════════════════════
        { id: 'fixed-income', type: 'product', name: 'Fixed Income', nameFr: 'Revenu Fixe', icon: '📋', category: 'bonds', tab: 'bonds', desc: 'Guaranteed fixed returns', descFr: 'Rendements fixes garantis' },
        { id: 'crypto-bonds', type: 'product', name: 'Crypto Bonds', nameFr: 'Obligations Crypto', icon: '📜', category: 'bonds', tab: 'bonds', desc: 'Tokenized bonds with interest', descFr: 'Obligations tokenisées avec intérêts' },
        { id: 'rwa', type: 'product', name: 'Real World Assets', nameFr: 'Actifs Réels', icon: '🏠', category: 'rwa', tab: 'products', desc: 'Tokenized real-world assets', descFr: 'Actifs réels tokenisés' },

        // ═══════════════════════════════════════════════════════════════
        // PRODUCTS - Advanced
        // ═══════════════════════════════════════════════════════════════
        { id: 'algo-strategies', type: 'product', name: 'Algo Strategies', nameFr: 'Stratégies Algo', icon: '🤖', category: 'bots', tab: 'bots', desc: 'Automated trading algorithms', descFr: 'Algorithmes de trading automatisés' },
        { id: 'grid-bot', type: 'product', name: 'Grid Bot', nameFr: 'Bot Grid', icon: '📶', category: 'bots', tab: 'bots', desc: 'Grid trading automation', descFr: 'Automatisation du grid trading' },
        { id: 'dca-bot', type: 'product', name: 'DCA Bot', nameFr: 'Bot DCA', icon: '📅', category: 'bots', tab: 'bots', desc: 'Dollar-cost averaging bot', descFr: 'Bot d\'investissement programmé' },
        { id: 'insurance', type: 'product', name: 'Insurance', nameFr: 'Assurance', icon: '🛡️', category: 'insurance', tab: 'products', desc: 'Protect your DeFi investments', descFr: 'Protégez vos investissements DeFi' },
        { id: 'launchpad', type: 'product', name: 'Launchpad', nameFr: 'Launchpad', icon: '🚀', category: 'launchpad', tab: 'products', desc: 'Invest in new projects', descFr: 'Investissez dans de nouveaux projets' },

        // ═══════════════════════════════════════════════════════════════
        // FEATURES
        // ═══════════════════════════════════════════════════════════════
        { id: 'deposit', type: 'feature', name: 'Deposit', nameFr: 'Dépôt', icon: '⬇️', tab: 'banking', desc: 'Deposit crypto or fiat', descFr: 'Déposez crypto ou fiat' },
        { id: 'withdraw', type: 'feature', name: 'Withdraw', nameFr: 'Retrait', icon: '⬆️', tab: 'banking', desc: 'Withdraw your funds', descFr: 'Retirez vos fonds' },
        { id: 'transfer', type: 'feature', name: 'Transfer', nameFr: 'Transfert', icon: '↔️', tab: 'banking', desc: 'Transfer between accounts', descFr: 'Transférez entre comptes' },
        { id: 'kyc', type: 'feature', name: 'KYC Verification', nameFr: 'Vérification KYC', icon: '🪪', tab: 'settings', desc: 'Identity verification', descFr: 'Vérification d\'identité' },
        { id: '2fa', type: 'feature', name: '2FA Security', nameFr: 'Sécurité 2FA', icon: '🔐', tab: 'settings', desc: 'Two-factor authentication', descFr: 'Authentification à deux facteurs' },
        { id: 'api-keys', type: 'feature', name: 'API Keys', nameFr: 'Clés API', icon: '🔑', tab: 'settings', desc: 'Manage API access', descFr: 'Gérez l\'accès API' },
        { id: 'notifications', type: 'feature', name: 'Notifications', nameFr: 'Notifications', icon: '🔔', tab: 'settings', desc: 'Alert and notification settings', descFr: 'Paramètres d\'alertes et notifications' },
        { id: 'connect-wallet', type: 'feature', name: 'Connect Wallet', nameFr: 'Connecter Wallet', icon: '🔗', tab: 'wallet', desc: 'Connect external wallet', descFr: 'Connectez un wallet externe' },

        // ═══════════════════════════════════════════════════════════════
        // TOOLS
        // ═══════════════════════════════════════════════════════════════
        { id: 'arbitrage-scanner', type: 'tool', name: 'Arbitrage Scanner', nameFr: 'Scanner d\'Arbitrage', icon: '🔍', tab: 'tools', desc: 'Find arbitrage opportunities', descFr: 'Trouvez des opportunités d\'arbitrage' },
        { id: 'fee-calculator', type: 'tool', name: 'Fee Calculator', nameFr: 'Calculateur de Frais', icon: '🧮', tab: 'tools', desc: 'Calculate trading fees', descFr: 'Calculez les frais de trading' },
        { id: 'pnl-calculator', type: 'tool', name: 'PnL Calculator', nameFr: 'Calculateur PnL', icon: '📊', tab: 'tools', desc: 'Calculate profit and loss', descFr: 'Calculez profits et pertes' },
        { id: 'impermanent-loss', type: 'tool', name: 'IL Calculator', nameFr: 'Calculateur IL', icon: '📉', tab: 'tools', desc: 'Calculate impermanent loss', descFr: 'Calculez l\'impermanent loss' },
        { id: 'gas-tracker', type: 'tool', name: 'Gas Tracker', nameFr: 'Suivi du Gas', icon: '⛽', tab: 'tools', desc: 'Track gas prices', descFr: 'Suivez les prix du gas' },
        { id: 'price-alerts', type: 'tool', name: 'Price Alerts', nameFr: 'Alertes de Prix', icon: '🔔', tab: 'tools', desc: 'Set price notifications', descFr: 'Définissez des alertes de prix' },

        // ═══════════════════════════════════════════════════════════════
        // TERMS (DeFi Glossary)
        // ═══════════════════════════════════════════════════════════════
        { id: 'term-dex', type: 'term', name: 'DEX', nameFr: 'DEX', icon: '📖', tab: 'learn', desc: 'Decentralized Exchange - trade without intermediaries', descFr: 'Exchange Décentralisé - tradez sans intermédiaire' },
        { id: 'term-apy', type: 'term', name: 'APY', nameFr: 'APY', icon: '📖', tab: 'learn', desc: 'Annual Percentage Yield - yearly return with compounding', descFr: 'Rendement Annuel en Pourcentage - rendement annuel avec intérêts composés' },
        { id: 'term-apr', type: 'term', name: 'APR', nameFr: 'APR', icon: '📖', tab: 'learn', desc: 'Annual Percentage Rate - yearly return without compounding', descFr: 'Taux Annuel en Pourcentage - rendement annuel sans composition' },
        { id: 'term-tvl', type: 'term', name: 'TVL', nameFr: 'TVL', icon: '📖', tab: 'learn', desc: 'Total Value Locked - total assets in a protocol', descFr: 'Valeur Totale Verrouillée - actifs totaux dans un protocole' },
        { id: 'term-leverage', type: 'term', name: 'Leverage', nameFr: 'Effet de Levier', icon: '📖', tab: 'learn', desc: 'Borrowed funds to amplify positions', descFr: 'Fonds empruntés pour amplifier les positions' },
        { id: 'term-liquidation', type: 'term', name: 'Liquidation', nameFr: 'Liquidation', icon: '📖', tab: 'learn', desc: 'Forced position closure when collateral is insufficient', descFr: 'Fermeture forcée de position quand le collatéral est insuffisant' },
        { id: 'term-slippage', type: 'term', name: 'Slippage', nameFr: 'Glissement', icon: '📖', tab: 'learn', desc: 'Price difference between expected and executed trade', descFr: 'Différence de prix entre l\'ordre prévu et exécuté' },
        { id: 'term-impermanent-loss', type: 'term', name: 'Impermanent Loss', nameFr: 'Perte Impermanente', icon: '📖', tab: 'learn', desc: 'Temporary loss when providing liquidity', descFr: 'Perte temporaire lors de la fourniture de liquidité' },
        { id: 'term-gas', type: 'term', name: 'Gas', nameFr: 'Gas', icon: '📖', tab: 'learn', desc: 'Transaction fee on blockchain', descFr: 'Frais de transaction sur la blockchain' },
        { id: 'term-wallet', type: 'term', name: 'Wallet', nameFr: 'Portefeuille', icon: '📖', tab: 'learn', desc: 'Digital wallet to store crypto assets', descFr: 'Portefeuille numérique pour stocker vos cryptos' },
        { id: 'term-defi', type: 'term', name: 'DeFi', nameFr: 'DeFi', icon: '📖', tab: 'learn', desc: 'Decentralized Finance - financial services without banks', descFr: 'Finance Décentralisée - services financiers sans banques' },
        { id: 'term-yield', type: 'term', name: 'Yield', nameFr: 'Rendement', icon: '📖', tab: 'learn', desc: 'Return on investment from DeFi protocols', descFr: 'Retour sur investissement des protocoles DeFi' },
        { id: 'term-amm', type: 'term', name: 'AMM', nameFr: 'AMM', icon: '📖', tab: 'learn', desc: 'Automated Market Maker - algorithmic trading protocol', descFr: 'Market Maker Automatisé - protocole de trading algorithmique' },
        { id: 'term-collateral', type: 'term', name: 'Collateral', nameFr: 'Collatéral', icon: '📖', tab: 'learn', desc: 'Assets pledged to secure a loan', descFr: 'Actifs mis en gage pour garantir un prêt' },
        { id: 'term-stablecoin', type: 'term', name: 'Stablecoin', nameFr: 'Stablecoin', icon: '📖', tab: 'learn', desc: 'Crypto pegged to fiat currency', descFr: 'Crypto indexée sur une monnaie fiduciaire' },
    ],

    // State
    selectedIndex: -1,
    debounceTimer: null,
    isOpen: false,

    /**
     * Initialize global search
     */
    init() {
        console.log('[GlobalSearch] Initializing...');

        this.input = document.getElementById('global-search-input');
        this.results = document.getElementById('global-search-results');
        this.container = document.getElementById('global-search-container');

        if (!this.input || !this.results) {
            console.warn('[GlobalSearch] Elements not found');
            return;
        }

        this.bindEvents();
        console.log('[GlobalSearch] Ready with', this.index.length, 'items');
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Input events
        this.input.addEventListener('input', (e) => this.onInput(e));
        this.input.addEventListener('focus', () => this.onFocus());
        this.input.addEventListener('blur', (e) => this.onBlur(e));

        // Keyboard navigation
        this.input.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Global Ctrl+K shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.input.focus();
                this.input.select();
            }
            // Escape to close
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
                this.input.blur();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });

        // Results click (for both search results and quick help items)
        this.results.addEventListener('click', (e) => {
            const item = e.target.closest('.search-result-item');
            const helpItem = e.target.closest('.search-quick-help-item');

            if (item) {
                const itemId = item.dataset.id;
                const result = this.index.find(i => i.id === itemId);
                if (result) this.selectResult(result);
            } else if (helpItem) {
                const query = helpItem.dataset.query;
                if (query) {
                    this.input.value = query;
                    this.search(query);
                }
            }
        });
    },

    /**
     * Handle input changes with debounce
     */
    onInput(e) {
        const query = e.target.value.trim();

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            if (query.length >= 1) {
                this.search(query);
            } else {
                this.showQuickHelp();
            }
        }, 150);
    },

    /**
     * Handle focus
     */
    onFocus() {
        const query = this.input.value.trim();
        if (query.length >= 1) {
            this.search(query);
        } else {
            this.showQuickHelp();
        }
    },

    /**
     * Handle blur (with delay for click handling)
     */
    onBlur(e) {
        setTimeout(() => {
            if (!this.container.contains(document.activeElement)) {
                this.close();
            }
        }, 200);
    },

    /**
     * Handle keyboard navigation
     */
    onKeyDown(e) {
        if (!this.isOpen) return;

        const items = this.results.querySelectorAll('.search-result-item');
        if (!items.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.updateSelection(items);
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection(items);
                break;

            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
                    const itemId = items[this.selectedIndex].dataset.id;
                    const result = this.index.find(i => i.id === itemId);
                    if (result) this.selectResult(result);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.close();
                this.input.blur();
                break;
        }
    },

    /**
     * Update visual selection
     */
    updateSelection(items) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === this.selectedIndex);
        });

        // Scroll into view
        if (items[this.selectedIndex]) {
            items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    },

    /**
     * Search the index
     */
    search(query) {
        const q = query.toLowerCase();
        const lang = this.getCurrentLang();

        // Score and filter results
        const scored = this.index.map(item => {
            const name = lang === 'fr' && item.nameFr ? item.nameFr : item.name;
            const desc = lang === 'fr' && item.descFr ? item.descFr : item.desc;
            const score = this.scoreMatch(q, name, desc, item);
            return { ...item, displayName: name, displayDesc: desc, score };
        }).filter(item => item.score > 0);

        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);

        // Group by type
        const grouped = this.groupByType(scored);

        this.renderResults(grouped, query);
    },

    /**
     * Score a match (higher = better)
     */
    scoreMatch(query, name, desc, item) {
        const nameLower = name.toLowerCase();
        const descLower = (desc || '').toLowerCase();

        // Exact match
        if (nameLower === query) return 100;

        // Starts with
        if (nameLower.startsWith(query)) return 80;

        // Contains in name
        if (nameLower.includes(query)) return 60;

        // Contains in description
        if (descLower.includes(query)) return 40;

        // Fuzzy match (each word)
        const words = query.split(/\s+/);
        const matchCount = words.filter(w =>
            nameLower.includes(w) || descLower.includes(w)
        ).length;

        if (matchCount > 0) return 20 + (matchCount * 10);

        return 0;
    },

    /**
     * Group results by type
     */
    groupByType(results) {
        const groups = {
            page: { title: 'Pages', titleFr: 'Pages', items: [] },
            product: { title: 'Products', titleFr: 'Produits', items: [] },
            feature: { title: 'Features', titleFr: 'Fonctionnalités', items: [] },
            tool: { title: 'Tools', titleFr: 'Outils', items: [] },
            term: { title: 'Terms', titleFr: 'Glossaire', items: [] }
        };

        results.forEach(item => {
            if (groups[item.type] && groups[item.type].items.length < 5) {
                groups[item.type].items.push(item);
            }
        });

        return groups;
    },

    /**
     * Render results dropdown
     */
    renderResults(grouped, query) {
        const lang = this.getCurrentLang();
        let html = '';
        let hasResults = false;

        for (const [type, group] of Object.entries(grouped)) {
            if (group.items.length === 0) continue;
            hasResults = true;

            const title = lang === 'fr' ? group.titleFr : group.title;
            html += `<div class="search-category">
                <div class="search-category-title">${title}</div>`;

            group.items.forEach(item => {
                const highlighted = this.highlightMatch(item.displayName, query);
                html += `
                    <div class="search-result-item" data-id="${item.id}">
                        <span class="search-result-icon">${item.icon}</span>
                        <div class="search-result-content">
                            <div class="search-result-name">${highlighted}</div>
                            <div class="search-result-desc">${item.displayDesc || ''}</div>
                        </div>
                        ${item.category ? `<span class="search-result-badge">${item.category}</span>` : ''}
                    </div>`;
            });

            html += '</div>';
        }

        if (!hasResults) {
            const noResults = lang === 'fr' ? 'Aucun résultat' : 'No results found';
            const tryAgain = lang === 'fr' ? 'Essayez un autre terme' : 'Try a different search term';
            html = `
                <div class="search-empty">
                    <div class="search-empty-icon">🔍</div>
                    <div class="search-empty-text">${noResults}</div>
                    <div class="search-empty-text" style="font-size:12px;opacity:0.7">${tryAgain}</div>
                </div>`;
        } else {
            // Add keyboard hint
            const navHint = lang === 'fr' ? 'naviguer' : 'navigate';
            const selectHint = lang === 'fr' ? 'sélectionner' : 'select';
            const closeHint = lang === 'fr' ? 'fermer' : 'close';
            html += `
                <div class="search-keyboard-hint">
                    <span><kbd>↑</kbd><kbd>↓</kbd> ${navHint}</span>
                    <span><kbd>Enter</kbd> ${selectHint}</span>
                    <span><kbd>Esc</kbd> ${closeHint}</span>
                </div>`;
        }

        this.results.innerHTML = html;
        this.results.classList.add('active');
        this.isOpen = true;
        this.selectedIndex = -1;
    },

    /**
     * Show quick help when search is empty
     */
    showQuickHelp() {
        const lang = this.getCurrentLang();
        const title = lang === 'fr' ? 'Recherche rapide' : 'Quick search';

        const suggestions = [
            { icon: '📈', label: lang === 'fr' ? 'Trading' : 'Trade', query: 'trade' },
            { icon: '🔒', label: 'Staking', query: 'staking' },
            { icon: '💧', label: lang === 'fr' ? 'Liquidité' : 'Liquidity', query: 'liquidity' },
            { icon: '🏦', label: lang === 'fr' ? 'Banque' : 'Banking', query: 'deposit' },
            { icon: '📊', label: 'Portfolio', query: 'portfolio' },
            { icon: '📖', label: lang === 'fr' ? 'Glossaire' : 'Glossary', query: 'defi' },
        ];

        let html = `<div class="search-quick-help">
            <div class="search-quick-help-title">${title}</div>
            <div class="search-quick-help-grid">`;

        suggestions.forEach(s => {
            html += `<div class="search-quick-help-item" data-query="${s.query}">
                <span>${s.icon}</span>
                <span>${s.label}</span>
            </div>`;
        });

        html += `</div></div>`;

        this.results.innerHTML = html;
        this.results.classList.add('active');
        this.isOpen = true;
    },

    /**
     * Highlight matching text
     */
    highlightMatch(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * Escape regex special characters
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Select a result and navigate
     */
    selectResult(result) {
        console.log('[GlobalSearch] Selected:', result.id, result.name);

        this.close();
        this.input.value = '';
        this.input.blur();

        // Navigate based on type
        if (result.tab) {
            this.navigateToTab(result.tab, result);
        }
    },

    /**
     * Navigate to a tab and optionally to a specific item
     */
    navigateToTab(tabName, result) {
        // Switch tab
        if (typeof ObeliskApp !== 'undefined' && ObeliskApp.switchTab) {
            ObeliskApp.switchTab(tabName);
        } else if (typeof window.showTab === 'function') {
            window.showTab(tabName);
        }

        // For products, try to navigate to specific product
        if (result.type === 'product' && result.category) {
            setTimeout(() => {
                this.navigateToProduct(result);
            }, 300);
        }
    },

    /**
     * Navigate to a specific product
     */
    navigateToProduct(result) {
        // Try ProductFilter if available
        if (typeof ProductFilter !== 'undefined' && ProductFilter.navigateToProduct) {
            ProductFilter.navigateToProduct(result.id, result.category);
            return;
        }

        // Fallback: try to find and highlight the product card
        const card = document.querySelector(`[data-product-id="${result.id}"]`) ||
                     document.querySelector(`.product-card[onclick*="${result.id}"]`);

        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight animation
            card.style.transition = 'box-shadow 0.3s, transform 0.3s';
            card.style.boxShadow = '0 0 30px rgba(201, 162, 39, 0.5)';
            card.style.transform = 'scale(1.02)';

            setTimeout(() => {
                card.style.boxShadow = '';
                card.style.transform = '';
            }, 2000);
        }
    },

    /**
     * Close the results dropdown
     */
    close() {
        this.results.classList.remove('active');
        this.isOpen = false;
        this.selectedIndex = -1;
    },

    /**
     * Get current language
     */
    getCurrentLang() {
        if (typeof I18n !== 'undefined' && I18n.currentLang) {
            return I18n.currentLang;
        }
        return localStorage.getItem('obelisk-lang') || 'en';
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    GlobalSearch.init();
});

// Also try to init if DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => GlobalSearch.init(), 100);
}
