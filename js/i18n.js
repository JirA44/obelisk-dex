/**
 * Obelisk DEX - Internationalization (i18n)
 * Language support: English, French, Spanish, German
 */

const I18n = {
    currentLang: localStorage.getItem('obelisk-lang') || 'en',

    langInfo: {
        en: { flag: '🇬🇧', name: 'EN' },
        fr: { flag: '🇫🇷', name: 'FR' },
        es: { flag: '🇪🇸', name: 'ES' },
        de: { flag: '🇩🇪', name: 'DE' }
    },

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
            chart: 'Chart',
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
            entry_price: 'Entry Price',
            liq_price: 'Liquidation Price',
            fee: 'Fee',
            limit_price: 'Limit Price',
            connect_to_trade: 'Connect Wallet to Trade',
            connect_to_swap: 'Connect Wallet to Swap',
            connect_to_deposit: 'Connect Wallet to Deposit',

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

            // Banking - with explanations
            earn_interest: 'Earn Interest',
            borrow: 'Borrow',
            your_deposits: 'Your Deposits',
            your_loans: 'Your Loans',
            apy: 'APY',
            supply: 'Supply',
            borrowed: 'Borrowed',
            health_factor: 'Health Factor',
            deposit_title: 'Deposit',
            deposit_desc: 'Transfer USDC from your wallet to start trading',
            withdraw_title: 'Withdraw',
            withdraw_desc: 'Transfer funds back to your wallet',
            select_network: 'Select Network',

            // Bonds - with explanations
            tokenized_bonds: 'Tokenized Bonds',
            bond_name: 'Bond Name',
            yield_rate: 'Yield',
            maturity: 'Maturity',
            buy_bond: 'Buy Bond',
            your_bonds: 'Your Bonds',
            bonds_title: 'Crypto Bonds',
            bonds_desc: 'Fixed-income investments with guaranteed returns. Lock your funds for a period and earn predictable yield.',
            bonds_how: 'How it works: Choose a bond, invest USDC, wait until maturity, collect your capital + interest.',

            // Tools - with explanations
            smart_intent: 'Smart Intent',
            smart_intent_desc: 'Describe what you want in plain language. AI will execute the best strategy.',
            intent_placeholder: 'Example: Buy $100 BTC if price drops 5%',
            active_intents: 'Active Intents',
            no_intents: 'No active intents',

            arbitrage_scanner: 'Arbitrage Scanner',
            arbitrage_desc: 'Find price differences across exchanges. Buy low on one, sell high on another.',
            start_scanner: 'Start Scanner',
            stop_scanner: 'Stop Scanner',
            scanning: 'Scanning for opportunities...',

            ai_advisor: 'AI Advisor',
            ai_advisor_desc: 'Get personalized trading advice based on your portfolio and market conditions.',
            analyze_portfolio: 'Analyze Portfolio',

            social_recovery: 'Social Recovery',
            social_recovery_desc: 'Add trusted contacts who can help recover your wallet if you lose access.',
            add_guardians: 'Add Guardians',
            guardian_threshold: 'Guardians Required',

            yield_farming: 'Yield Farming',
            yield_farming_desc: 'Provide liquidity to trading pools and earn fees + rewards.',

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

            // Welcome
            welcome_title: 'Welcome to Obelisk DEX!',
            welcome_text: 'Start by depositing 1 USDC to trade and invest securely.',

            // Auth
            login: 'Login',
            signup: 'Sign Up',
            logout: 'Logout',
            login_subtitle: 'Welcome back to Obelisk DEX',
            signup_subtitle: 'Create your Obelisk account',
            email: 'Email',
            email_or_username: 'Email or Username',
            username: 'Username',
            password: 'Password',
            confirm_password: 'Confirm Password',
            fill_all_fields: 'Please fill all fields',
            passwords_no_match: 'Passwords do not match',
            password_too_short: 'Password must be at least 6 characters',
            invalid_email: 'Invalid email address',
            email_exists: 'Email already exists',
            username_exists: 'Username already exists',
            login_success: 'Login successful!',
            signup_success: 'Account created successfully!',
            logout_success: 'Logged out successfully',
            signup_error: 'Signup failed. Please try again.',
            invalid_credentials: 'Invalid email or password',
            no_account: 'No account?',
            have_account: 'Already have an account?',

            // Misc
            loading: 'Loading...',
            confirm: 'Confirm',
            cancel: 'Cancel',
            close: 'Close',
            refresh: 'Refresh',
            select_wallet: 'Select Wallet',
            choose_wallet: 'Choose your wallet:',

            // Settings
            settings: 'Settings',
            settings_desc: 'Personalize your Obelisk experience',
            bg_animation: 'Background Animation',
            bg_animation_desc: 'Choose your preferred background style',
            animation_none: 'None',
            animation_matrix: 'Matrix',
            animation_halo: 'Halo Forerunners',
            animation_avatar: 'Avatar Biolum',
            animation_particles: 'Particles',
            matrix_colors: 'Matrix Colors',
            halo_style: 'Forerunner Style',
            bg_image: 'Background Image',
            bg_image_desc: 'Add a custom background image (optional)',
            upload_image: 'Upload Custom Image',
            clear_image: 'Clear Image',
            bg_opacity: 'Background Opacity',
            anim_speed: 'Animation Speed',
            live_preview: 'Live Preview',
            save_settings: 'Save Settings',
            reset_default: 'Reset to Default',
            settings_saved: 'Settings saved!',
            settings_reset: 'Settings reset to default'
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
            chart: 'Graphique',
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
            entry_price: 'Prix d\'entrée',
            liq_price: 'Prix de liquidation',
            fee: 'Frais',
            limit_price: 'Prix limite',
            connect_to_trade: 'Connecter pour trader',
            connect_to_swap: 'Connecter pour échanger',
            connect_to_deposit: 'Connecter pour déposer',

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

            // Banking - with explanations
            earn_interest: 'Gagner des intérêts',
            borrow: 'Emprunter',
            your_deposits: 'Vos Dépôts',
            your_loans: 'Vos Emprunts',
            apy: 'APY',
            supply: 'Fourni',
            borrowed: 'Emprunté',
            health_factor: 'Facteur Santé',
            deposit_title: 'Déposer',
            deposit_desc: 'Transférez vos USDC depuis votre wallet pour commencer à trader',
            withdraw_title: 'Retirer',
            withdraw_desc: 'Transférez vos fonds vers votre wallet',
            select_network: 'Choisir le réseau',

            // Bonds - with explanations
            tokenized_bonds: 'Obligations Tokenisées',
            bond_name: 'Nom',
            yield_rate: 'Rendement',
            maturity: 'Échéance',
            buy_bond: 'Acheter',
            your_bonds: 'Vos Obligations',
            bonds_title: 'Obligations Crypto',
            bonds_desc: 'Investissements à revenu fixe avec rendement garanti. Bloquez vos fonds pour une période et gagnez un rendement prévisible.',
            bonds_how: 'Comment ça marche : Choisissez une obligation, investissez en USDC, attendez l\'échéance, récupérez votre capital + intérêts.',

            // Tools - with explanations
            smart_intent: 'Intent Intelligent',
            smart_intent_desc: 'Décrivez ce que vous voulez en langage naturel. L\'IA exécutera la meilleure stratégie.',
            intent_placeholder: 'Exemple: Acheter 100$ de BTC si le prix baisse de 5%',
            active_intents: 'Intents Actifs',
            no_intents: 'Aucun intent actif',

            arbitrage_scanner: 'Scanner Arbitrage',
            arbitrage_desc: 'Trouvez les différences de prix entre exchanges. Achetez bas sur l\'un, vendez haut sur l\'autre.',
            start_scanner: 'Démarrer',
            stop_scanner: 'Arrêter',
            scanning: 'Recherche d\'opportunités...',

            ai_advisor: 'Conseiller IA',
            ai_advisor_desc: 'Obtenez des conseils de trading personnalisés basés sur votre portfolio et les conditions de marché.',
            analyze_portfolio: 'Analyser Portfolio',

            social_recovery: 'Récupération Sociale',
            social_recovery_desc: 'Ajoutez des contacts de confiance qui peuvent aider à récupérer votre wallet si vous perdez l\'accès.',
            add_guardians: 'Ajouter Gardiens',
            guardian_threshold: 'Gardiens requis',

            yield_farming: 'Yield Farming',
            yield_farming_desc: 'Fournissez de la liquidité aux pools de trading et gagnez des frais + récompenses.',

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

            // Welcome
            welcome_title: 'Bienvenue sur Obelisk DEX !',
            welcome_text: 'Commencez par déposer 1 USDC pour trader et investir en toute sécurité.',

            // Auth
            login: 'Connexion',
            signup: 'Inscription',
            logout: 'Déconnexion',
            login_subtitle: 'Bon retour sur Obelisk DEX',
            signup_subtitle: 'Créez votre compte Obelisk',
            email: 'Email',
            email_or_username: 'Email ou Pseudo',
            username: 'Pseudo',
            password: 'Mot de passe',
            confirm_password: 'Confirmer le mot de passe',
            fill_all_fields: 'Veuillez remplir tous les champs',
            passwords_no_match: 'Les mots de passe ne correspondent pas',
            password_too_short: 'Le mot de passe doit contenir au moins 6 caractères',
            invalid_email: 'Adresse email invalide',
            email_exists: 'Cet email existe déjà',
            username_exists: 'Ce pseudo existe déjà',
            login_success: 'Connexion réussie !',
            signup_success: 'Compte créé avec succès !',
            logout_success: 'Déconnexion réussie',
            signup_error: 'Échec de l\'inscription. Réessayez.',
            invalid_credentials: 'Email ou mot de passe invalide',
            no_account: 'Pas de compte ?',
            have_account: 'Déjà un compte ?',

            // Misc
            loading: 'Chargement...',
            confirm: 'Confirmer',
            cancel: 'Annuler',
            close: 'Fermer',
            refresh: 'Rafraîchir',
            select_wallet: 'Sélectionner Wallet',
            choose_wallet: 'Choisissez votre wallet :',

            // Settings
            settings: 'Paramètres',
            settings_desc: 'Personnalisez votre expérience Obelisk',
            bg_animation: 'Animation de fond',
            bg_animation_desc: 'Choisissez votre style d\'arrière-plan',
            animation_none: 'Aucune',
            animation_matrix: 'Matrix',
            animation_halo: 'Halo Forerunners',
            animation_avatar: 'Avatar Biolum',
            animation_particles: 'Particules',
            matrix_colors: 'Couleurs Matrix',
            halo_style: 'Style Forerunner',
            bg_image: 'Image de fond',
            bg_image_desc: 'Ajouter une image personnalisée (optionnel)',
            upload_image: 'Télécharger une image',
            clear_image: 'Supprimer l\'image',
            bg_opacity: 'Opacité du fond',
            anim_speed: 'Vitesse d\'animation',
            live_preview: 'Aperçu en direct',
            save_settings: 'Enregistrer',
            reset_default: 'Réinitialiser',
            settings_saved: 'Paramètres enregistrés !',
            settings_reset: 'Paramètres réinitialisés'
        },

        es: {
            // Header & Navigation
            connect_wallet: 'Conectar',
            trade: 'Trading',
            swap: 'Intercambio',
            banking: 'Banco',
            bonds: 'Bonos',
            tools: 'Herramientas',
            wallet: 'Cartera',
            portfolio: 'Portfolio',

            // Trading
            chart: 'Gráfico',
            order_book: 'Libro de órdenes',
            price: 'Precio',
            size: 'Cantidad',
            total: 'Total',
            spread: 'Spread',
            long: 'Largo',
            short: 'Corto',
            market: 'Mercado',
            limit: 'Límite',
            leverage: 'Apalancamiento',
            amount: 'Monto',
            place_order: 'Colocar orden',
            available: 'Disponible',
            positions: 'Posiciones',
            open_orders: 'Órdenes abiertas',
            no_positions: 'Sin posiciones abiertas',
            no_orders: 'Sin órdenes abiertas',
            entry_price: 'Precio de entrada',
            liq_price: 'Precio de liquidación',
            fee: 'Comisión',
            limit_price: 'Precio límite',
            connect_to_trade: 'Conectar para operar',
            connect_to_swap: 'Conectar para intercambiar',
            connect_to_deposit: 'Conectar para depositar',

            // Swap
            from: 'De',
            to: 'A',
            balance: 'Saldo',
            max: 'MAX',
            swap_tokens: 'Intercambiar',
            rate: 'Tasa',
            route: 'Ruta',
            price_impact: 'Impacto precio',
            min_received: 'Mín. recibido',
            slippage: 'Deslizamiento',

            // Wallet
            your_wallet: 'Tu Cartera',
            create_wallet: 'Crear Cartera',
            import_wallet: 'Importar Cartera',
            connect_external: 'Conectar Externa',
            deposit: 'Depositar',
            withdraw: 'Retirar',
            copy_address: 'Copiar Dirección',
            view_explorer: 'Ver en Explorer',
            disconnect: 'Desconectar',
            total_balance: 'Saldo Total',

            // Banking
            earn_interest: 'Ganar intereses',
            borrow: 'Prestar',
            your_deposits: 'Tus Depósitos',
            your_loans: 'Tus Préstamos',
            apy: 'APY',
            supply: 'Suministro',
            borrowed: 'Prestado',
            health_factor: 'Factor Salud',
            deposit_title: 'Depositar',
            deposit_desc: 'Transfiere USDC desde tu cartera para empezar a operar',
            withdraw_title: 'Retirar',
            withdraw_desc: 'Transfiere fondos a tu cartera',
            select_network: 'Seleccionar red',

            // Bonds
            tokenized_bonds: 'Bonos Tokenizados',
            bond_name: 'Nombre',
            yield_rate: 'Rendimiento',
            maturity: 'Vencimiento',
            buy_bond: 'Comprar',
            your_bonds: 'Tus Bonos',
            bonds_title: 'Bonos Crypto',
            bonds_desc: 'Inversiones de renta fija con rendimiento garantizado. Bloquea tus fondos por un período y gana rendimiento predecible.',
            bonds_how: 'Cómo funciona: Elige un bono, invierte USDC, espera al vencimiento, recoge tu capital + intereses.',

            // Tools
            smart_intent: 'Intent Inteligente',
            smart_intent_desc: 'Describe lo que quieres en lenguaje natural. La IA ejecutará la mejor estrategia.',
            intent_placeholder: 'Ejemplo: Comprar $100 BTC si el precio baja 5%',
            active_intents: 'Intents Activos',
            no_intents: 'Sin intents activos',
            arbitrage_scanner: 'Escáner Arbitraje',
            arbitrage_desc: 'Encuentra diferencias de precio entre exchanges. Compra bajo en uno, vende alto en otro.',
            start_scanner: 'Iniciar',
            stop_scanner: 'Detener',
            scanning: 'Buscando oportunidades...',
            ai_advisor: 'Consejero IA',
            ai_advisor_desc: 'Obtén consejos de trading personalizados basados en tu portfolio y condiciones de mercado.',
            analyze_portfolio: 'Analizar Portfolio',
            social_recovery: 'Recuperación Social',
            social_recovery_desc: 'Añade contactos de confianza que puedan ayudar a recuperar tu cartera si pierdes acceso.',
            add_guardians: 'Añadir Guardianes',
            guardian_threshold: 'Guardianes requeridos',
            yield_farming: 'Yield Farming',
            yield_farming_desc: 'Proporciona liquidez a pools de trading y gana comisiones + recompensas.',

            // Portfolio
            portfolio_value: 'Valor del Portfolio',
            assets: 'Activos',
            allocation: 'Asignación',
            performance: 'Rendimiento 24h',
            history: 'Historial',

            // Welcome
            welcome_title: '¡Bienvenido a Obelisk DEX!',
            welcome_text: 'Comienza depositando 1 USDC para operar e invertir de forma segura.',

            // Auth
            login: 'Iniciar sesión',
            signup: 'Registrarse',
            logout: 'Cerrar sesión',
            login_subtitle: 'Bienvenido de nuevo a Obelisk DEX',
            signup_subtitle: 'Crea tu cuenta Obelisk',
            email: 'Email',
            email_or_username: 'Email o Usuario',
            username: 'Usuario',
            password: 'Contraseña',
            confirm_password: 'Confirmar contraseña',
            fill_all_fields: 'Por favor completa todos los campos',
            passwords_no_match: 'Las contraseñas no coinciden',
            password_too_short: 'La contraseña debe tener al menos 6 caracteres',
            invalid_email: 'Dirección de email inválida',
            email_exists: 'Este email ya existe',
            username_exists: 'Este usuario ya existe',
            login_success: '¡Inicio de sesión exitoso!',
            signup_success: '¡Cuenta creada con éxito!',
            logout_success: 'Sesión cerrada correctamente',
            signup_error: 'Error al registrarse. Inténtalo de nuevo.',
            invalid_credentials: 'Email o contraseña inválidos',
            no_account: '¿No tienes cuenta?',
            have_account: '¿Ya tienes cuenta?',

            // Misc
            loading: 'Cargando...',
            confirm: 'Confirmar',
            cancel: 'Cancelar',
            close: 'Cerrar',
            refresh: 'Actualizar',
            select_wallet: 'Seleccionar Wallet',
            choose_wallet: 'Elige tu wallet:',

            // Settings
            settings: 'Configuración',
            settings_desc: 'Personaliza tu experiencia Obelisk',
            bg_animation: 'Animación de fondo',
            bg_animation_desc: 'Elige tu estilo de fondo preferido',
            animation_none: 'Ninguna',
            animation_matrix: 'Matrix',
            animation_halo: 'Halo Forerunners',
            animation_avatar: 'Avatar Biolum',
            animation_particles: 'Partículas',
            matrix_colors: 'Colores Matrix',
            halo_style: 'Estilo Forerunner',
            bg_image: 'Imagen de fondo',
            bg_image_desc: 'Añadir una imagen personalizada (opcional)',
            upload_image: 'Subir imagen',
            clear_image: 'Borrar imagen',
            bg_opacity: 'Opacidad del fondo',
            anim_speed: 'Velocidad de animación',
            live_preview: 'Vista previa',
            save_settings: 'Guardar',
            reset_default: 'Restablecer',
            settings_saved: '¡Configuración guardada!',
            settings_reset: 'Configuración restablecida'
        },

        de: {
            // Header & Navigation
            connect_wallet: 'Verbinden',
            trade: 'Trading',
            swap: 'Tauschen',
            banking: 'Banking',
            bonds: 'Anleihen',
            tools: 'Werkzeuge',
            wallet: 'Wallet',
            portfolio: 'Portfolio',

            // Trading
            chart: 'Chart',
            order_book: 'Orderbuch',
            price: 'Preis',
            size: 'Menge',
            total: 'Gesamt',
            spread: 'Spread',
            long: 'Long',
            short: 'Short',
            market: 'Markt',
            limit: 'Limit',
            leverage: 'Hebel',
            amount: 'Betrag',
            place_order: 'Order platzieren',
            available: 'Verfügbar',
            positions: 'Positionen',
            open_orders: 'Offene Orders',
            no_positions: 'Keine offenen Positionen',
            no_orders: 'Keine offenen Orders',
            entry_price: 'Einstiegspreis',
            liq_price: 'Liquidationspreis',
            fee: 'Gebühr',
            limit_price: 'Limitpreis',
            connect_to_trade: 'Verbinden zum Traden',
            connect_to_swap: 'Verbinden zum Tauschen',
            connect_to_deposit: 'Verbinden zum Einzahlen',

            // Swap
            from: 'Von',
            to: 'Nach',
            balance: 'Guthaben',
            max: 'MAX',
            swap_tokens: 'Tauschen',
            rate: 'Kurs',
            route: 'Route',
            price_impact: 'Preisauswirkung',
            min_received: 'Min. erhalten',
            slippage: 'Slippage',

            // Wallet
            your_wallet: 'Dein Wallet',
            create_wallet: 'Wallet erstellen',
            import_wallet: 'Wallet importieren',
            connect_external: 'Extern verbinden',
            deposit: 'Einzahlen',
            withdraw: 'Auszahlen',
            copy_address: 'Adresse kopieren',
            view_explorer: 'Im Explorer ansehen',
            disconnect: 'Trennen',
            total_balance: 'Gesamtguthaben',

            // Banking
            earn_interest: 'Zinsen verdienen',
            borrow: 'Leihen',
            your_deposits: 'Deine Einlagen',
            your_loans: 'Deine Kredite',
            apy: 'APY',
            supply: 'Angebot',
            borrowed: 'Geliehen',
            health_factor: 'Gesundheitsfaktor',
            deposit_title: 'Einzahlen',
            deposit_desc: 'Übertrage USDC von deinem Wallet um mit dem Trading zu beginnen',
            withdraw_title: 'Auszahlen',
            withdraw_desc: 'Übertrage Geld zurück zu deinem Wallet',
            select_network: 'Netzwerk wählen',

            // Bonds
            tokenized_bonds: 'Tokenisierte Anleihen',
            bond_name: 'Name',
            yield_rate: 'Rendite',
            maturity: 'Laufzeit',
            buy_bond: 'Kaufen',
            your_bonds: 'Deine Anleihen',
            bonds_title: 'Krypto-Anleihen',
            bonds_desc: 'Festverzinsliche Anlagen mit garantierter Rendite. Sperre deine Mittel für einen Zeitraum und verdiene vorhersehbare Erträge.',
            bonds_how: 'So funktioniert es: Wähle eine Anleihe, investiere USDC, warte bis zur Fälligkeit, erhalte dein Kapital + Zinsen.',

            // Tools
            smart_intent: 'Smart Intent',
            smart_intent_desc: 'Beschreibe was du willst in natürlicher Sprache. KI führt die beste Strategie aus.',
            intent_placeholder: 'Beispiel: Kaufe $100 BTC wenn Preis um 5% fällt',
            active_intents: 'Aktive Intents',
            no_intents: 'Keine aktiven Intents',
            arbitrage_scanner: 'Arbitrage-Scanner',
            arbitrage_desc: 'Finde Preisunterschiede zwischen Börsen. Kaufe günstig auf einer, verkaufe teurer auf der anderen.',
            start_scanner: 'Starten',
            stop_scanner: 'Stoppen',
            scanning: 'Suche nach Möglichkeiten...',
            ai_advisor: 'KI-Berater',
            ai_advisor_desc: 'Erhalte personalisierte Trading-Beratung basierend auf deinem Portfolio und Marktbedingungen.',
            analyze_portfolio: 'Portfolio analysieren',
            social_recovery: 'Soziale Wiederherstellung',
            social_recovery_desc: 'Füge vertrauenswürdige Kontakte hinzu, die helfen können dein Wallet wiederherzustellen.',
            add_guardians: 'Wächter hinzufügen',
            guardian_threshold: 'Benötigte Wächter',
            yield_farming: 'Yield Farming',
            yield_farming_desc: 'Stelle Liquidität für Trading-Pools bereit und verdiene Gebühren + Belohnungen.',

            // Portfolio
            portfolio_value: 'Portfolio-Wert',
            assets: 'Vermögenswerte',
            allocation: 'Verteilung',
            performance: '24h Performance',
            history: 'Verlauf',

            // Welcome
            welcome_title: 'Willkommen bei Obelisk DEX!',
            welcome_text: 'Beginne mit einer Einzahlung von 1 USDC um sicher zu traden und zu investieren.',

            // Auth
            login: 'Anmelden',
            signup: 'Registrieren',
            logout: 'Abmelden',
            login_subtitle: 'Willkommen zurück bei Obelisk DEX',
            signup_subtitle: 'Erstelle dein Obelisk-Konto',
            email: 'E-Mail',
            email_or_username: 'E-Mail oder Benutzername',
            username: 'Benutzername',
            password: 'Passwort',
            confirm_password: 'Passwort bestätigen',
            fill_all_fields: 'Bitte alle Felder ausfüllen',
            passwords_no_match: 'Passwörter stimmen nicht überein',
            password_too_short: 'Passwort muss mindestens 6 Zeichen haben',
            invalid_email: 'Ungültige E-Mail-Adresse',
            email_exists: 'Diese E-Mail existiert bereits',
            username_exists: 'Dieser Benutzername existiert bereits',
            login_success: 'Anmeldung erfolgreich!',
            signup_success: 'Konto erfolgreich erstellt!',
            logout_success: 'Erfolgreich abgemeldet',
            signup_error: 'Registrierung fehlgeschlagen. Bitte erneut versuchen.',
            invalid_credentials: 'Ungültige E-Mail oder Passwort',
            no_account: 'Kein Konto?',
            have_account: 'Bereits ein Konto?',

            // Misc
            loading: 'Laden...',
            confirm: 'Bestätigen',
            cancel: 'Abbrechen',
            close: 'Schließen',
            refresh: 'Aktualisieren',
            select_wallet: 'Wallet wählen',
            choose_wallet: 'Wähle dein Wallet:',

            // Settings
            settings: 'Einstellungen',
            settings_desc: 'Personalisiere dein Obelisk-Erlebnis',
            bg_animation: 'Hintergrundanimation',
            bg_animation_desc: 'Wähle deinen bevorzugten Hintergrundstil',
            animation_none: 'Keine',
            animation_matrix: 'Matrix',
            animation_halo: 'Halo Forerunners',
            animation_avatar: 'Avatar Biolum',
            animation_particles: 'Partikel',
            matrix_colors: 'Matrix Farben',
            halo_style: 'Forerunner Stil',
            bg_image: 'Hintergrundbild',
            bg_image_desc: 'Füge ein eigenes Bild hinzu (optional)',
            upload_image: 'Bild hochladen',
            clear_image: 'Bild löschen',
            bg_opacity: 'Hintergrund-Deckkraft',
            anim_speed: 'Animationsgeschwindigkeit',
            live_preview: 'Live-Vorschau',
            save_settings: 'Speichern',
            reset_default: 'Zurücksetzen',
            settings_saved: 'Einstellungen gespeichert!',
            settings_reset: 'Einstellungen zurückgesetzt'
        }
    },

    /**
     * Initialize i18n
     */
    init() {
        this.updateUI();
        this.translatePage();
        this.setupLangSelector();
    },

    /**
     * Get translation
     */
    t(key) {
        return this.translations[this.currentLang]?.[key] || this.translations['en'][key] || key;
    },

    /**
     * Set language
     */
    setLanguage(lang) {
        if (!this.translations[lang]) return;

        this.currentLang = lang;
        localStorage.setItem('obelisk-lang', lang);
        this.updateUI();
        this.translatePage();

        // Update app state if available
        if (window.ObeliskApp) {
            window.ObeliskApp.state.language = lang;
        }

        // Close dropdown
        const dropdown = document.getElementById('lang-dropdown');
        if (dropdown) dropdown.classList.remove('active');
    },

    /**
     * Update UI (flag and code)
     */
    updateUI() {
        const info = this.langInfo[this.currentLang];
        if (!info) return;

        const flag = document.getElementById('lang-flag');
        const code = document.getElementById('lang-code');

        if (flag) flag.textContent = info.flag;
        if (code) code.textContent = info.name;

        // Update active state in dropdown
        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lang === this.currentLang);
        });
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

        // Translate select network label if exists
        const networkLabel = document.querySelector('label[for="deposit-network"]');
        if (networkLabel) {
            networkLabel.textContent = this.t('select_network');
        }
    },

    /**
     * Setup language selector (dropdown)
     */
    setupLangSelector() {
        const btn = document.getElementById('btn-lang');
        const dropdown = document.getElementById('lang-dropdown');

        if (btn && dropdown) {
            // Toggle dropdown
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
                btn.setAttribute('aria-expanded', dropdown.classList.contains('active'));
            });

            // Language option clicks
            document.querySelectorAll('.lang-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    this.setLanguage(opt.dataset.lang);
                });
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#lang-selector')) {
                    dropdown.classList.remove('active');
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
        } else if (btn) {
            // Fallback: simple toggle for old layout
            btn.addEventListener('click', () => {
                const langs = Object.keys(this.translations);
                const idx = langs.indexOf(this.currentLang);
                const nextLang = langs[(idx + 1) % langs.length];
                this.setLanguage(nextLang);
            });
        }
    }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
});

// Export
window.I18n = I18n;
// v1766592213
