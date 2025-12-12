/**
 * Obelisk DEX - Internationalization (i18n)
 * Language support: English & French
 */

const I18n = {
    currentLang: localStorage.getItem('obelisk-lang') || 'en',

    translations: {
        en: {
            // Header & Navigation
            connect_wallet: 'Connect Wallet',
            trade: 'Trade',
            swap: 'Swap',
            banking: 'Banking',
            bonds: 'Bonds',
            tools: 'Tools',
            wallet: 'Wallet',
            portfolio: 'Portfolio',

            // Trading
            order_book: 'Order Book',
            price: 'Price',
            size: 'Size',
            total: 'Total',
            spread: 'Spread',
            long: 'Long',
            short: 'Short',
            market: 'Market',
            limit: 'Limit',
            leverage: 'Leverage',
            amount: 'Amount',
            place_order: 'Place Order',
            available: 'Available',
            positions: 'Positions',
            open_orders: 'Open Orders',
            no_positions: 'No open positions',
            no_orders: 'No open orders',

            // Swap
            from: 'From',
            to: 'To',
            balance: 'Balance',
            max: 'MAX',
            swap_tokens: 'Swap Tokens',
            rate: 'Rate',
            route: 'Route',
            price_impact: 'Price Impact',
            min_received: 'Min. Received',
            slippage: 'Slippage',

            // Wallet
            your_wallet: 'Your Wallet',
            create_wallet: 'Create Wallet',
            import_wallet: 'Import Wallet',
            connect_external: 'Connect External',
            deposit: 'Deposit',
            withdraw: 'Withdraw',
            copy_address: 'Copy Address',
            view_explorer: 'View on Explorer',
            disconnect: 'Disconnect',
            total_balance: 'Total Balance',

            // Banking
            earn_interest: 'Earn Interest',
            borrow: 'Borrow',
            your_deposits: 'Your Deposits',
            your_loans: 'Your Loans',
            apy: 'APY',
            supply: 'Supply',
            borrowed: 'Borrowed',
            health_factor: 'Health Factor',

            // Bonds
            tokenized_bonds: 'Tokenized Bonds',
            bond_name: 'Bond Name',
            yield_rate: 'Yield',
            maturity: 'Maturity',
            buy_bond: 'Buy Bond',
            your_bonds: 'Your Bonds',

            // Tools
            smart_intent: 'Smart Intent',
            intent_placeholder: 'Type your trading intent...',
            active_intents: 'Active Intents',
            no_intents: 'No active intents',
            arbitrage_scanner: 'Arbitrage Scanner',
            start_scanner: 'Start Scanner',
            stop_scanner: 'Stop Scanner',
            scanning: 'Scanning for opportunities...',
            ai_advisor: 'AI Advisor',
            analyze_portfolio: 'Analyze Portfolio',
            social_recovery: 'Social Recovery',
            add_guardians: 'Add Guardians',
            guardian_threshold: 'Guardians Required',

            // Portfolio
            portfolio_value: 'Portfolio Value',
            assets: 'Assets',
            allocation: 'Allocation',
            performance: '24h Performance',
            history: 'History',

            // Chart
            chart_placeholder: 'Connect wallet to load',
            tradingview_chart: 'TradingView Chart',

            // Notifications
            wallet_connected: 'Wallet connected!',
            wallet_disconnected: 'Wallet disconnected',
            transaction_sent: 'Transaction sent',
            transaction_confirmed: 'Transaction confirmed',
            error_occurred: 'An error occurred',

            // Misc
            loading: 'Loading...',
            confirm: 'Confirm',
            cancel: 'Cancel',
            close: 'Close',
            refresh: 'Refresh',
            select_wallet: 'Select Wallet',
            choose_wallet: 'Choose your wallet:'
        },

        fr: {
            // Header & Navigation
            connect_wallet: 'Connecter',
            trade: 'Trading',
            swap: 'Échange',
            banking: 'Banque',
            bonds: 'Obligations',
            tools: 'Outils',
            wallet: 'Portefeuille',
            portfolio: 'Portfolio',

            // Trading
            order_book: 'Carnet d\'ordres',
            price: 'Prix',
            size: 'Quantité',
            total: 'Total',
            spread: 'Écart',
            long: 'Achat',
            short: 'Vente',
            market: 'Marché',
            limit: 'Limite',
            leverage: 'Levier',
            amount: 'Montant',
            place_order: 'Passer l\'ordre',
            available: 'Disponible',
            positions: 'Positions',
            open_orders: 'Ordres ouverts',
            no_positions: 'Aucune position ouverte',
            no_orders: 'Aucun ordre ouvert',

            // Swap
            from: 'De',
            to: 'Vers',
            balance: 'Solde',
            max: 'MAX',
            swap_tokens: 'Échanger',
            rate: 'Taux',
            route: 'Route',
            price_impact: 'Impact prix',
            min_received: 'Min. reçu',
            slippage: 'Glissement',

            // Wallet
            your_wallet: 'Votre Portefeuille',
            create_wallet: 'Créer Portefeuille',
            import_wallet: 'Importer Portefeuille',
            connect_external: 'Connecter Externe',
            deposit: 'Déposer',
            withdraw: 'Retirer',
            copy_address: 'Copier Adresse',
            view_explorer: 'Voir sur Explorer',
            disconnect: 'Déconnecter',
            total_balance: 'Solde Total',

            // Banking
            earn_interest: 'Gagner des intérêts',
            borrow: 'Emprunter',
            your_deposits: 'Vos Dépôts',
            your_loans: 'Vos Emprunts',
            apy: 'APY',
            supply: 'Fourni',
            borrowed: 'Emprunté',
            health_factor: 'Facteur Santé',

            // Bonds
            tokenized_bonds: 'Obligations Tokenisées',
            bond_name: 'Nom',
            yield_rate: 'Rendement',
            maturity: 'Échéance',
            buy_bond: 'Acheter',
            your_bonds: 'Vos Obligations',

            // Tools
            smart_intent: 'Intent Intelligent',
            intent_placeholder: 'Décrivez votre intention de trading...',
            active_intents: 'Intents Actifs',
            no_intents: 'Aucun intent actif',
            arbitrage_scanner: 'Scanner Arbitrage',
            start_scanner: 'Démarrer',
            stop_scanner: 'Arrêter',
            scanning: 'Recherche d\'opportunités...',
            ai_advisor: 'Conseiller IA',
            analyze_portfolio: 'Analyser Portfolio',
            social_recovery: 'Récupération Sociale',
            add_guardians: 'Ajouter Gardiens',
            guardian_threshold: 'Gardiens requis',

            // Portfolio
            portfolio_value: 'Valeur du Portfolio',
            assets: 'Actifs',
            allocation: 'Répartition',
            performance: 'Performance 24h',
            history: 'Historique',

            // Chart
            chart_placeholder: 'Connectez wallet pour charger',
            tradingview_chart: 'Graphique TradingView',

            // Notifications
            wallet_connected: 'Portefeuille connecté !',
            wallet_disconnected: 'Portefeuille déconnecté',
            transaction_sent: 'Transaction envoyée',
            transaction_confirmed: 'Transaction confirmée',
            error_occurred: 'Une erreur est survenue',

            // Misc
            loading: 'Chargement...',
            confirm: 'Confirmer',
            cancel: 'Annuler',
            close: 'Fermer',
            refresh: 'Rafraîchir',
            select_wallet: 'Sélectionner Wallet',
            choose_wallet: 'Choisissez votre wallet :'
        }
    },

    /**
     * Initialize i18n
     */
    init() {
        this.updateFlag();
        this.translatePage();
        this.setupLangButton();
    },

    /**
     * Get translation
     */
    t(key) {
        return this.translations[this.currentLang]?.[key] || this.translations['en'][key] || key;
    },

    /**
     * Toggle language
     */
    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'fr' : 'en';
        localStorage.setItem('obelisk-lang', this.currentLang);
        this.updateFlag();
        this.translatePage();

        // Update app state if available
        if (typeof ObeliskApp !== 'undefined') {
            ObeliskApp.state.language = this.currentLang;
        }
    },

    /**
     * Update flag emoji
     */
    updateFlag() {
        const flag = document.getElementById('lang-flag');
        if (flag) {
            flag.textContent = this.currentLang === 'en' ? '🇬🇧' : '🇫🇷';
        }
    },

    /**
     * Translate all elements with data-i18n attribute
     */
    translatePage() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            if (el.tagName === 'INPUT' && el.placeholder) {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Translate nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            const tabName = tab.getAttribute('data-tab');
            if (tabName && this.translations[this.currentLang][tabName]) {
                tab.textContent = this.t(tabName);
            }
        });
    },

    /**
     * Setup language button click
     */
    setupLangButton() {
        const btn = document.getElementById('btn-lang');
        if (btn) {
            btn.addEventListener('click', () => this.toggleLanguage());
        }
    }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
});

// Export
window.I18n = I18n;
