/**
 * Obelisk DEX - Main Application
 * Version: 2.1.0 - Fixed price access errors
 *
 * Zero-trust decentralized exchange with post-quantum security.
 * Your keys, your crypto, your bank.
 */

const ObeliskApp = {
    // Application state
    state: {
        currentTab: 'trade',
        currentPair: 'BTC',
        leverage: 10,
        orderSide: 'long',
        orderType: 'market',
        prices: {},
        orderbook: { bids: [], asks: [] },
        positions: [],
        orders: [],
        chartLoaded: false,
        language: localStorage.getItem('obelisk-lang') || 'en'
    },

    // DOM elements cache
    elements: {},

    /**
     * Initialize application
     */
    async init() {
        console.log('Initializing Obelisk DEX...');

        // Cache DOM elements
        this.cacheElements();

        // Setup event listeners FIRST (so navigation always works)
        this.setupEventListeners();

        // Initialize modules (with error handling)
        try {
            if (typeof SecureStorage !== 'undefined') await SecureStorage.init();
        } catch (e) {
            console.warn('SecureStorage init failed:', e.message);
        }

        try {
            if (typeof HyperliquidAPI !== 'undefined') await HyperliquidAPI.init();
        } catch (e) {
            console.warn('HyperliquidAPI init failed:', e.message);
        }

        // Check for existing wallet
        try {
            await this.checkExistingWallet();
        } catch (e) {
            console.warn('Wallet check failed:', e.message);
        }

        // Load initial data
        try {
            await this.loadInitialData();
        } catch (e) {
            console.warn('Initial data load failed:', e.message);
        }

        // Start price updates
        try {
            this.startPriceUpdates();
        } catch (e) {
            console.warn('Price updates failed:', e.message);
        }

        // Initialize Investments UI
        try {
            if (typeof InvestmentsUI !== 'undefined') InvestmentsUI.init();
        } catch (e) {
            console.warn('InvestmentsUI init failed:', e.message);
        }

        // Initialize Governance System
        try {
            if (typeof Governance !== 'undefined') {
                await Governance.init();
                if (typeof GovernanceUI !== 'undefined') {
                    GovernanceUI.init('governance-section');
                }
            }
        } catch (e) {
            console.warn('Governance init failed:', e.message);
        }

        console.log('Obelisk DEX ready!');
    },

    /**
     * Cache frequently accessed DOM elements
     */
    cacheElements() {
        this.elements = {
            // Navigation
            navTabs: document.querySelectorAll('.nav-tab'),
            tabContents: document.querySelectorAll('.tab-content'),

            // Header
            btnConnect: document.getElementById('btn-connect-wallet'),
            networkName: document.getElementById('network-name'),

            // Trade
            currentPair: document.getElementById('current-pair'),
            currentPrice: document.getElementById('current-price'),
            priceChange: document.getElementById('price-change'),
            orderbookAsks: document.getElementById('orderbook-asks'),
            orderbookBids: document.getElementById('orderbook-bids'),
            spreadValue: document.getElementById('spread-value'),
            orderSize: document.getElementById('order-size'),
            limitPrice: document.getElementById('limit-price'),
            leverageSlider: document.getElementById('leverage-slider'),
            leverageValue: document.getElementById('leverage-value'),
            entryPrice: document.getElementById('entry-price'),
            liqPrice: document.getElementById('liq-price'),
            orderFee: document.getElementById('order-fee'),
            btnPlaceOrder: document.getElementById('btn-place-order'),

            // Swap
            swapFromAmount: document.getElementById('swap-from-amount'),
            swapToAmount: document.getElementById('swap-to-amount'),
            fromToken: document.getElementById('from-token'),
            toToken: document.getElementById('to-token'),
            swapDetails: document.getElementById('swap-details'),
            swapRate: document.getElementById('swap-rate'),
            priceImpact: document.getElementById('price-impact'),
            networkFee: document.getElementById('network-fee'),
            btnSwap: document.getElementById('btn-swap'),
            btnSwapSwitch: document.getElementById('btn-swap-switch'),

            // Wallet
            walletEmpty: document.getElementById('wallet-empty'),
            walletConnected: document.getElementById('wallet-connected'),
            btnCreateWallet: document.getElementById('btn-create-wallet'),
            btnImportWallet: document.getElementById('btn-import-wallet'),
            btnConnectExternal: document.getElementById('btn-connect-external'),
            walletAddress: document.getElementById('wallet-address'),
            totalBalance: document.getElementById('total-balance'),
            assetsList: document.getElementById('assets-list'),

            // Modals
            modalCreateWallet: document.getElementById('modal-create-wallet')
        };
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation tabs
        this.elements.navTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Settings button in header
        const btnSettings = document.getElementById('btn-settings-nav');
        if (btnSettings) {
            btnSettings.addEventListener('click', () => this.switchTab('settings'));
        }

        // Transparency button in header
        const btnTransparency = document.getElementById('btn-transparency-nav');
        if (btnTransparency) {
            btnTransparency.addEventListener('click', () => {
                this.switchTab('transparency');
                // Initialize transparency tab content
                if (typeof initTransparencyTab === 'function') {
                    setTimeout(initTransparencyTab, 100);
                }
            });
        }

        // Connect wallet button - directly show wallet selector
        this.elements.btnConnect?.addEventListener('click', async () => {
            try {
                await this.connectMetaMask();
            } catch (e) {
                console.error('Wallet connection failed:', e);
                // If connection fails, switch to wallet tab
                this.switchTab('wallet');
            }
        });

        // Order tabs (Long/Short)
        document.querySelectorAll('.order-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchOrderSide(tab.dataset.side));
        });

        // Order type buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchOrderType(e.target.textContent.toLowerCase()));
        });

        // Leverage slider
        this.elements.leverageSlider?.addEventListener('input', (e) => {
            this.updateLeverage(parseInt(e.target.value));
        });

        // Leverage presets
        document.querySelectorAll('.lev-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lev = parseInt(e.target.textContent);
                this.updateLeverage(lev);
                this.elements.leverageSlider.value = lev;
            });
        });

        // Place order button
        this.elements.btnPlaceOrder?.addEventListener('click', () => this.placeOrder());

        // Swap input
        this.elements.swapFromAmount?.addEventListener('input', (e) => {
            this.updateSwapQuote(parseFloat(e.target.value) || 0);
        });

        // Swap switch button
        this.elements.btnSwapSwitch?.addEventListener('click', () => this.switchSwapTokens());

        // Swap button
        this.elements.btnSwap?.addEventListener('click', () => this.executeSwap());

        // Wallet buttons
        this.elements.btnCreateWallet?.addEventListener('click', () => this.showCreateWalletModal());
        this.elements.btnImportWallet?.addEventListener('click', () => this.showImportWalletModal());
        this.elements.btnConnectExternal?.addEventListener('click', () => this.connectMetaMask());

        // Deposit buttons (welcome screen and others)
        document.getElementById('btn-deposit-welcome')?.addEventListener('click', () => {
            this.switchTab('banking');
            // Focus on deposit amount field
            setTimeout(() => {
                document.getElementById('deposit-amount')?.focus();
            }, 100);
        });

        document.getElementById('btn-deposit-pool')?.addEventListener('click', () => {
            this.switchTab('banking');
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
            el.addEventListener('click', () => this.closeModals());
        });

        // Chart timeframe buttons
        document.querySelectorAll('.chart-tf').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-tf').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModals();
        });

        // Window events
        window.addEventListener('wallet-disconnected', () => this.onWalletDisconnected());
        window.addEventListener('wallet-changed', () => this.onWalletChanged());
        window.addEventListener('wallet-connected', () => this.onWalletConnectedEvent());
        window.addEventListener('hyperliquid-connected', () => this.onHyperliquidConnected());

        // Listen for Firebase auth state changes
        if (typeof FirebaseAuth !== 'undefined') {
            FirebaseAuth.onAuthChange(() => {
                this.updateOrderButton();
            });
        }
    },

    /**
     * Switch active tab - uses window.showTab for consistency
     */
    switchTab(tabName) {
        console.log('[ObeliskApp] switchTab called:', tabName);
        this.state.currentTab = tabName;

        // Delegate to window.showTab which handles overlays for learn/settings
        if (typeof window.showTab === 'function') {
            window.showTab(tabName);
            return;
        }

        // Fallback: direct implementation
        const tabIds = ['trade','swap','banking','bonds','tools','combos','wallet','investments','products','portfolio','settings','learn','invest'];

        // Close any overlays first
        document.querySelectorAll('[id^="tab-overlay-"]').forEach(o => o.remove());

        // Hide all tabs
        tabIds.forEach(id => {
            const tab = document.getElementById('tab-' + id);
            if (tab) {
                tab.classList.remove('active');
                tab.style.cssText = 'display: none !important;';
            }
        });

        // Show target tab
        const target = document.getElementById('tab-' + tabName);
        if (target) {
            target.classList.add('active');
            target.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; z-index: 100 !important; min-height: 400px !important;';
            console.log('[ObeliskApp] Activated:', tabName);
        }

        // Update nav tabs
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
    },

    /**
     * Switch order side (long/short)
     */
    switchOrderSide(side) {
        this.state.orderSide = side;

        document.querySelectorAll('.order-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.side === side);
        });

        // Update button style (use unified connection check)
        const btn = this.elements.btnPlaceOrder;
        if (btn && this.isUserConnected()) {
            btn.className = `btn-order btn-${side}`;
            const isFrSide = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            btn.textContent = `${side === 'long' ? (isFrSide ? 'Achat' : 'Long') : (isFrSide ? 'Vente' : 'Short')} ${this.state.currentPair}`;
        }

        this.updateOrderSummary();
    },

    /**
     * Switch order type
     */
    switchOrderType(type) {
        this.state.orderType = type;

        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === type);
        });

        // Show/hide limit price input
        const limitGroup = document.getElementById('limit-price-group');
        if (limitGroup) {
            limitGroup.style.display = type === 'limit' ? 'block' : 'none';
        }
    },

    /**
     * Update leverage
     */
    updateLeverage(leverage) {
        this.state.leverage = leverage;

        if (this.elements.leverageValue) {
            this.elements.leverageValue.textContent = `${leverage}x`;
        }

        // Update leverage preset buttons
        document.querySelectorAll('.lev-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.textContent) === leverage);
        });

        this.updateOrderSummary();
    },

    /**
     * Update order summary
     */
    updateOrderSummary() {
        const price = this.state.prices?.[this.state.currentPair] || 0;
        const leverage = this.state.leverage;
        const side = this.state.orderSide;

        if (this.elements.entryPrice) {
            this.elements.entryPrice.textContent = `$${HyperliquidAPI.formatPrice(price)}`;
        }

        if (this.elements.liqPrice) {
            const liqPrice = HyperliquidAPI.calculateLiquidationPrice(price, side, leverage);
            this.elements.liqPrice.textContent = `$${HyperliquidAPI.formatPrice(liqPrice)}`;
        }
    },

    /**
     * Check for existing wallet and update UI accordingly
     */
    async checkExistingWallet() {
        // Check all connection methods
        const isConnected = this.isUserConnected();

        if (isConnected) {
            console.log('[App] User already connected, updating UI');
            this.updateOrderButton();

            // Update wallet UI elements if WalletManager has current wallet
            if (typeof WalletManager !== 'undefined' && WalletManager.currentWallet) {
                this.onWalletConnected(WalletManager.currentWallet);
            } else if (typeof WalletConnect !== 'undefined' && WalletConnect.connected && WalletConnect.account) {
                // WalletConnect connected
                this.elements.walletEmpty.style.display = 'none';
                this.elements.walletConnected.style.display = 'block';
                const shortAddr = WalletConnect.account.slice(0, 6) + '...' + WalletConnect.account.slice(-4);
                this.elements.walletAddress.textContent = shortAddr;
                this.elements.btnConnect.innerHTML = `<span class="btn-icon">🔓</span><span>${shortAddr}</span>`;
            } else {
                // OAuth connection (GitHub, Google, etc.) - no wallet address
                this.elements.walletEmpty.style.display = 'none';
                this.elements.walletConnected.style.display = 'block';
                const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
                this.elements.walletAddress.textContent = isFr ? 'Compte connecté' : 'Account connected';
                this.elements.btnConnect.innerHTML = `<span class="btn-icon">🔓</span><span>${isFr ? 'Connecté' : 'Connected'}</span>`;
                // Load simulated balances for OAuth users
                this.loadWalletBalances(null);
            }
            return;
        }

        // Check for stored wallet that needs unlocking
        const hasWallet = await WalletManager.hasWallet();
        if (hasWallet) {
            console.log('[App] Existing wallet found, needs unlock');
        }
    },

    /**
     * Load initial data
     */
    async loadInitialData() {
        // Load chart FIRST - don't wait for anything
        console.log('[App] Loading chart first...');
        this.loadTradingChart();

        try {
            // Load markets
            await HyperliquidAPI.loadMarkets();

            // Load initial prices
            const prices = await HyperliquidAPI.getAllPrices();
            this.state.prices = prices;
            this.updatePriceDisplay();

            // Load orderbook
            const orderbook = await HyperliquidAPI.getOrderbook(this.state.currentPair);
            this.state.orderbook = orderbook;
            this.updateOrderbookDisplay();

        } catch (e) {
            console.error('Failed to load initial data:', e);
        }
    },

    /**
     * Start price update loop
     */
    startPriceUpdates() {
        // Use Obelisk RealtimePrices if available (real multi-DEX prices)
        if (typeof RealtimePrices !== 'undefined') {
            RealtimePrices.subscribe((type, data) => {
                if (type === 'prices') {
                    // Convert to expected format
                    const prices = {};
                    Object.entries(data).forEach(([coin, info]) => {
                        prices[coin] = info.price;
                    });
                    this.state.prices = prices;
                    this.updatePriceDisplay();
                }
            });
            console.log('Using Obelisk RealtimePrices (Hyperliquid + dYdX)');
            return;
        }

        // Fallback: Update prices every 5 seconds via HyperliquidAPI
        setInterval(async () => {
            try {
                if (typeof HyperliquidAPI !== 'undefined') {
                    const prices = await HyperliquidAPI.getAllPrices();
                    this.state.prices = prices;
                    this.updatePriceDisplay();
                }
            } catch (e) {
                console.error('Price update failed:', e);
            }
        }, 5000);

        // Update orderbook every 2 seconds
        setInterval(async () => {
            try {
                const orderbook = await HyperliquidAPI.getOrderbook(this.state.currentPair);
                this.state.orderbook = orderbook;
                this.updateOrderbookDisplay();
            } catch (e) {
                console.error('Orderbook update failed:', e);
            }
        }, 2000);
    },

    /**
     * Update price display
     */
    updatePriceDisplay() {
        const price = this.state.prices?.[this.state.currentPair];
        if (price && this.elements.currentPrice) {
            this.elements.currentPrice.textContent = `$${HyperliquidAPI.formatPrice(parseFloat(price))}`;
        }
        this.updateOrderSummary();
    },

    /**
     * Update orderbook display
     */
    updateOrderbookDisplay() {
        const { bids, asks } = this.state.orderbook;

        // Render asks (reversed, lowest at bottom)
        if (this.elements.orderbookAsks) {
            this.elements.orderbookAsks.innerHTML = asks.slice(0, 10).reverse().map(ask => `
                <div class="ob-row ask">
                    <span class="negative">${HyperliquidAPI.formatPrice(ask.price)}</span>
                    <span>${HyperliquidAPI.formatSize(ask.size)}</span>
                    <span>${HyperliquidAPI.formatPrice(ask.total)}</span>
                </div>
            `).join('');
        }

        // Render bids
        if (this.elements.orderbookBids) {
            this.elements.orderbookBids.innerHTML = bids.slice(0, 10).map(bid => `
                <div class="ob-row bid">
                    <span class="positive">${HyperliquidAPI.formatPrice(bid.price)}</span>
                    <span>${HyperliquidAPI.formatSize(bid.size)}</span>
                    <span>${HyperliquidAPI.formatPrice(bid.total)}</span>
                </div>
            `).join('');
        }

        // Update spread
        if (this.elements.spreadValue && asks.length > 0 && bids.length > 0) {
            const spread = asks[0].price - bids[0].price;
            const spreadPercent = (spread / asks[0].price) * 100;
            const isFrSpread = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.elements.spreadValue.textContent = `${isFrSpread ? 'Écart' : 'Spread'}: $${spread.toFixed(2)} (${spreadPercent.toFixed(3)}%)`;
        }
    },

    /**
     * Update swap quote
     */
    async updateSwapQuote(amount) {
        if (!amount || amount <= 0) {
            this.elements.swapToAmount.value = '';
            this.elements.swapDetails.style.display = 'none';
            return;
        }

        try {
            const fromToken = this.elements.fromToken.querySelector('span').textContent;
            const toToken = this.elements.toToken.querySelector('span').textContent;

            const quote = await UniswapAPI.getQuote(fromToken, toToken, amount);

            this.elements.swapToAmount.value = quote.toAmount.toFixed(6);
            this.elements.swapRate.textContent = `1 ${fromToken} = ${quote.price.toFixed(4)} ${toToken}`;
            this.elements.priceImpact.textContent = `${quote.priceImpact.toFixed(2)}%`;
            this.elements.priceImpact.className = quote.priceImpact < 1 ? 'positive' : (quote.priceImpact < 3 ? 'warning' : 'negative');

            const gasCostUSD = await UniswapAPI.estimateGasCostUSD(quote.estimatedGas, this.state.prices?.['ETH'] || 3000);
            this.elements.networkFee.textContent = `~$${gasCostUSD.toFixed(2)}`;

            this.elements.swapDetails.style.display = 'block';

            // Enable swap button if wallet connected
            if (this.isUserConnected()) {
                this.elements.btnSwap.disabled = false;
                const isFrSwap = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
                this.elements.btnSwap.textContent = isFrSwap ? 'Échanger' : 'Swap';
            }
        } catch (e) {
            console.error('Failed to get swap quote:', e);
            this.elements.swapToAmount.value = '';
            this.elements.swapDetails.style.display = 'none';
        }
    },

    /**
     * Switch swap tokens
     */
    switchSwapTokens() {
        const fromSpan = this.elements.fromToken.querySelector('span');
        const toSpan = this.elements.toToken.querySelector('span');

        const temp = fromSpan.textContent;
        fromSpan.textContent = toSpan.textContent;
        toSpan.textContent = temp;

        // Recalculate quote
        const amount = parseFloat(this.elements.swapFromAmount.value) || 0;
        if (amount > 0) {
            this.updateSwapQuote(amount);
        }
    },

    /**
     * Execute swap
     */
    async executeSwap() {
        if (!this.isUserConnected()) {
            // Show wallet connection modal instead of navigating away
            if (typeof WalletConnect !== 'undefined' && WalletConnect.showModal) {
                WalletConnect.showModal();
            } else if (typeof Auth !== 'undefined' && Auth.showLogin) {
                Auth.showLogin();
            } else {
                this.switchTab('wallet');
            }
            return;
        }

        const amount = parseFloat(this.elements.swapFromAmount.value);
        if (!amount) return;

        try {
            this.elements.btnSwap.disabled = true;
            const isFrSwapping = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.elements.btnSwap.textContent = isFrSwapping ? 'Échange en cours...' : 'Swapping...';

            const fromToken = this.elements.fromToken.querySelector('span').textContent;
            const toToken = this.elements.toToken.querySelector('span').textContent;

            const quote = await UniswapAPI.getQuote(fromToken, toToken, amount);
            const result = await UniswapAPI.executeSwap(quote, WalletManager.currentWallet);

            if (result.success) {
                const isFrN = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
                this.showNotification(isFrN ? 'Échange soumis !' : 'Swap submitted!', 'success');
                this.elements.swapFromAmount.value = '';
                this.elements.swapToAmount.value = '';
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (e) {
            const isFrE = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.showNotification((isFrE ? 'Échange échoué: ' : 'Swap failed: ') + e.message, 'error');
        } finally {
            this.elements.btnSwap.disabled = false;
            const isFrSwapBtn = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.elements.btnSwap.textContent = isFrSwapBtn ? 'Échanger' : 'Swap';
        }
    },

    /**
     * Place order
     */
    async placeOrder() {
        if (!this.isUserConnected()) {
            // Show wallet connection modal instead of navigating away
            if (typeof WalletConnect !== 'undefined' && WalletConnect.showModal) {
                WalletConnect.showModal();
            } else if (typeof Auth !== 'undefined' && Auth.showLogin) {
                Auth.showLogin();
            } else {
                this.switchTab('wallet');
            }
            return;
        }

        const size = parseFloat(this.elements.orderSize.value);
        if (!size) {
            const isFrS = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.showNotification(isFrS ? 'Veuillez entrer la taille de l\'ordre' : 'Please enter order size', 'error');
            return;
        }

        try {
            this.elements.btnPlaceOrder.disabled = true;
            const isFrP = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.elements.btnPlaceOrder.textContent = isFrP ? 'Placement en cours...' : 'Placing order...';

            const symbol = this.state.currentPair;
            const side = this.state.orderSide === 'long' ? 'buy' : 'sell';
            const leverage = this.state.leverage;

            let result;
            if (this.state.orderType === 'market') {
                result = await HyperliquidAPI.placeMarketOrder(
                    WalletManager.currentWallet.address,
                    symbol,
                    side,
                    size,
                    leverage,
                    null // privateKey - would need to get from wallet
                );
            } else {
                const price = parseFloat(this.elements.limitPrice.value);
                result = await HyperliquidAPI.placeLimitOrder(
                    WalletManager.currentWallet.address,
                    symbol,
                    side,
                    size,
                    price,
                    leverage,
                    null
                );
            }

            if (result.success) {
                const isFrO = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
                this.showNotification(isFrO ? 'Ordre placé !' : 'Order placed!', 'success');
                this.elements.orderSize.value = '';
            }
        } catch (e) {
            const isFrOE = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.showNotification((isFrOE ? 'Ordre échoué: ' : 'Order failed: ') + e.message, 'error');
        } finally {
            this.updateOrderButton();
        }
    },

    /**
     * Check if user is connected via any method
     * (WalletManager, WalletConnect, Auth, or FirebaseAuth)
     */
    isUserConnected() {
        // Check Demo mode (always allows trading)
        if (typeof DemoTrading !== 'undefined' && DemoTrading.enabled) {
            return true;
        }

        // Check WalletManager (internal wallet, MetaMask, Phantom, etc.)
        if (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) {
            return true;
        }

        // Check WalletConnect (external wallets)
        if (typeof WalletConnect !== 'undefined' && (WalletConnect.connected || WalletConnect.address)) {
            return true;
        }

        // Check MetaMask directly
        if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
            return true;
        }

        // Check localStorage persistence
        const savedWallet = localStorage.getItem('obelisk_wallet') || localStorage.getItem('metamask_connected');
        if (savedWallet) {
            return true;
        }

        // Check global wallet address
        if (typeof window.walletAddress !== 'undefined' && window.walletAddress) {
            return true;
        }

        // Check Auth (email/password login)
        if (typeof Auth !== 'undefined' && Auth.isLoggedIn && Auth.isLoggedIn()) {
            return true;
        }

        // Check FirebaseAuth (Google, Twitter, GitHub)
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn && FirebaseAuth.isSignedIn()) {
            return true;
        }

        return false;
    },

    /**
     * Update order button state
     */
    updateOrderButton() {
        const btn = this.elements.btnPlaceOrder;
        if (!btn) return;

        const isConnected = this.isUserConnected();

        if (isConnected) {
            btn.disabled = false;
            btn.className = `btn-order btn-${this.state.orderSide}`;
            const isFrOB = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            btn.textContent = `${this.state.orderSide === 'long' ? (isFrOB ? 'Achat' : 'Long') : (isFrOB ? 'Vente' : 'Short')} ${this.state.currentPair}`;
        } else {
            btn.disabled = true;
            btn.className = 'btn-order';
            const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            btn.textContent = isFr ? 'Connecter Wallet pour Trader' : 'Connect Wallet to Trade';
        }
    },

    /**
     * Show create wallet modal
     */
    showCreateWalletModal() {
        this.elements.modalCreateWallet.style.display = 'flex';
    },

    /**
     * Show import wallet modal
     */
    showImportWalletModal() {
        // TODO: Implement import modal
        const isFrI = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
        this.showNotification(isFrI ? 'Import wallet bientôt disponible' : 'Import wallet coming soon', 'info');
    },

    /**
     * Connect MetaMask
     */
    async connectMetaMask() {
        try {
            // Use wallet selector to let user choose their wallet
            const wallet = await WalletManager.showWalletSelector();
            this.onWalletConnected(wallet);
            const isFrConn = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.showNotification(`${wallet.name} ${isFrConn ? 'connecté !' : 'connected!'}`, 'success');
        } catch (e) {
            if (e.message !== 'Wallet selection cancelled') {
                this.showNotification(e.message, 'error');
            }
        }
    },

    /**
     * Handle wallet connected
     */
    onWalletConnected(wallet) {
        // Update UI
        this.elements.walletEmpty.style.display = 'none';
        this.elements.walletConnected.style.display = 'block';

        this.elements.walletAddress.textContent = WalletManager.shortenAddress(wallet.address);
        this.elements.btnConnect.innerHTML = `<span class="btn-icon">🔓</span><span>${WalletManager.shortenAddress(wallet.address)}</span>`;

        // Update buttons
        this.updateOrderButton();
        this.elements.btnSwap.disabled = false;
        const isFrSwapC = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
        this.elements.btnSwap.textContent = isFrSwapC ? 'Échanger' : 'Swap';

        // Load balances
        this.loadWalletBalances(wallet.address);

        // Load chart
        this.loadTradingChart();
    },

    /**
     * Load TradingView chart
     */
    loadTradingChart() {
        if (this.state.chartLoaded) return;

        const container = document.getElementById('trading-chart');
        if (!container) {
            console.error('[Chart] Container not found, retrying in 500ms...');
            setTimeout(() => this.loadTradingChart(), 500);
            return;
        }

        console.log('[Chart] Loading TradingView chart for:', this.state.currentPair);

        // Clear container first
        container.innerHTML = '';

        // Create iframe with simple URL (same as debug force load)
        const iframe = document.createElement('iframe');
        iframe.src = 'https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=BINANCE:BTCUSDT&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=0a0a1e&theme=dark&style=1&timezone=Etc%2FUTC&locale=en';
        iframe.style.cssText = 'width:100%;height:100%;border:none;';
        iframe.allowFullscreen = true;

        container.appendChild(iframe);

        this.state.chartLoaded = true;
        console.log('[Chart] TradingView iframe added successfully');
    },

    /**
     * Handle wallet disconnected
     */
    onWalletDisconnected() {
        this.elements.walletEmpty.style.display = 'block';
        this.elements.walletConnected.style.display = 'none';

        const isFr2 = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
        this.elements.btnConnect.innerHTML = `<span class="btn-icon">🔐</span><span>${isFr2 ? 'Connecter Wallet' : 'Connect Wallet'}</span>`;

        this.updateOrderButton();
        this.elements.btnSwap.disabled = true;
        const isFr3 = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
        this.elements.btnSwap.textContent = isFr3 ? 'Connecter Wallet pour Échanger' : 'Connect Wallet to Swap';
    },

    /**
     * Handle wallet changed
     */
    onWalletChanged() {
        if (WalletManager.currentWallet) {
            this.elements.walletAddress.textContent = WalletManager.shortenAddress(WalletManager.currentWallet.address);
            this.loadWalletBalances(WalletManager.currentWallet.address);
        }
    },

    /**
     * Handle wallet connected event (from WalletConnect or other sources)
     */
    onWalletConnectedEvent() {
        console.log('[ObeliskApp] Wallet connected event received');
        this.updateOrderButton();
    },

    /**
     * Handle Hyperliquid connected
     */
    onHyperliquidConnected() {
        console.log('Hyperliquid WebSocket connected');
    },

    /**
     * Load wallet balances
     */
    async loadWalletBalances(address) {
        try {
            const wallet = WalletManager.currentWallet;

            // Handle OAuth connections (GitHub, Google, etc.) - no Web3 wallet
            // Show simulated balance for these users
            if (!wallet && this.isUserConnected()) {
                console.log('[App] OAuth user detected, showing simulated balance');
                const simBalance = (typeof SimulatedPortfolio !== 'undefined')
                    ? (SimulatedPortfolio.portfolio?.simulatedBalance || 1000)
                    : 1000;
                this.elements.totalBalance.textContent = `$${simBalance.toFixed(2)}`;
                this.elements.assetsList.innerHTML = `
                    <div class="asset-item">
                        <div class="asset-info">
                            <div class="asset-icon">💰</div>
                            <div class="asset-details">
                                <span class="asset-name">Simulated USDC</span>
                                <span class="asset-symbol">USDC (simulé)</span>
                            </div>
                        </div>
                        <div class="asset-balance">
                            <span class="asset-amount">${simBalance.toFixed(2)}</span>
                            <span class="asset-value">$${simBalance.toFixed(2)}</span>
                        </div>
                    </div>
                `;
                return;
            }

            // Handle Solana wallets differently
            if (wallet?.type === 'solana') {
                await this.loadSolanaBalances(address);
                return;
            }

            // Ethereum balances - requires valid Web3 wallet address
            if (!address) {
                console.warn('[App] No address provided for balance loading');
                return;
            }

            const balances = await UniswapAPI.getAllBalances(address);
            const ethPrice = this.state.prices?.['ETH'] || 3000;

            let totalUSD = 0;
            let assetsHTML = '';

            for (const [symbol, balance] of Object.entries(balances)) {
                if (balance > 0) {
                    const token = UniswapAPI.TOKENS[symbol];
                    const price = symbol === 'ETH' ? ethPrice :
                        (symbol.includes('USD') ? 1 : 0);
                    const valueUSD = balance * price;
                    totalUSD += valueUSD;

                    assetsHTML += `
                        <div class="asset-item">
                            <div class="asset-info">
                                <div class="asset-icon">${symbol === 'ETH' ? 'Ξ' : symbol[0]}</div>
                                <div class="asset-details">
                                    <span class="asset-name">${token.name}</span>
                                    <span class="asset-symbol">${symbol}</span>
                                </div>
                            </div>
                            <div class="asset-balance">
                                <span class="asset-amount">${UniswapAPI.formatAmount(balance)}</span>
                                <span class="asset-value">$${valueUSD.toFixed(2)}</span>
                            </div>
                        </div>
                    `;
                }
            }

            this.elements.totalBalance.textContent = `$${totalUSD.toFixed(2)}`;
            if (assetsHTML) {
                this.elements.assetsList.innerHTML = assetsHTML;
            }
        } catch (e) {
            console.error('Failed to load balances:', e);
        }
    },

    /**
     * Load Solana wallet balances
     */
    async loadSolanaBalances(address) {
        try {
            // Get SOL price from our prices
            const solPrice = this.state.prices?.['SOL'] || 150;

            // Fetch SOL balance from Solana RPC
            const response = await fetch('https://api.mainnet-beta.solana.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBalance',
                    params: [address]
                })
            });

            const data = await response.json();
            const lamports = data.result?.value || 0;
            const solBalance = lamports / 1e9; // Convert lamports to SOL
            const valueUSD = solBalance * solPrice;

            console.log(`SOL Balance: ${solBalance} SOL ($${valueUSD.toFixed(2)})`);

            this.elements.totalBalance.textContent = `$${valueUSD.toFixed(2)}`;
            this.elements.assetsList.innerHTML = `
                <div class="asset-item">
                    <div class="asset-info">
                        <div class="asset-icon" style="background: linear-gradient(135deg, #9945FF, #14F195);">◎</div>
                        <div class="asset-details">
                            <span class="asset-name">Solana</span>
                            <span class="asset-symbol">SOL</span>
                        </div>
                    </div>
                    <div class="asset-balance">
                        <span class="asset-amount">${solBalance.toFixed(4)}</span>
                        <span class="asset-value">$${valueUSD.toFixed(2)}</span>
                    </div>
                </div>
            `;
        } catch (e) {
            console.error('Failed to load Solana balances:', e);
            this.elements.totalBalance.textContent = '$0.00';
            const isFrSol = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.elements.assetsList.innerHTML = `<div class="asset-item">${isFrSol ? 'Impossible de charger le solde Solana' : 'Unable to load Solana balance'}</div>`;
        }
    },

    /**
     * Close all modals
     */
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
            <span class="notification-message">${message}</span>
        `;

        // Add styles if not exists
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                    box-shadow: var(--shadow-lg);
                }
                .notification-success { border-color: var(--success); }
                .notification-error { border-color: var(--danger); }
                .notification-icon { font-size: 18px; }
                .notification-success .notification-icon { color: var(--success); }
                .notification-error .notification-icon { color: var(--danger); }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ObeliskApp.init();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navTabs = document.querySelector('.nav-tabs');

    if (mobileMenuBtn && navTabs) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navTabs.classList.toggle('mobile-open');
            mobileMenuBtn.setAttribute('aria-expanded',
                navTabs.classList.contains('mobile-open'));
        });

        // Close menu when a tab is clicked
        navTabs.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mobileMenuBtn.classList.remove('active');
                    navTabs.classList.remove('mobile-open');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                mobileMenuBtn.classList.remove('active');
                navTabs.classList.remove('mobile-open');
            }
        });
    }

    // Force load chart after 1 second as fallback
    setTimeout(() => {
        const container = document.getElementById('trading-chart');
        if (container && !container.querySelector('iframe')) {
            console.log('[Chart] Fallback: Force loading TradingView...');
            const iframe = document.createElement('iframe');
            iframe.src = 'https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=BINANCE:BTCUSDT&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=0a0a1e&theme=dark&style=1&timezone=Etc%2FUTC&locale=en';
            iframe.style.cssText = 'width:100%;height:100%;border:none;';
            iframe.allowFullscreen = true;
            container.innerHTML = '';
            container.appendChild(iframe);
            console.log('[Chart] Fallback chart loaded');
        }
    }, 1000);
});

// Export
window.ObeliskApp = ObeliskApp;

// Global showNotification function for other modules
window.showNotification = function(message, type = 'info') {
    if (ObeliskApp && typeof ObeliskApp.showNotification === 'function') {
        ObeliskApp.showNotification(message, type);
    } else {
        // Fallback: simple console + alert
        console.log(`[${type.toUpperCase()}] ${message}`);
        if (type === 'error') {
            console.error(message);
        }
    }
};

// ============================================
// THEME MANAGEMENT
// ============================================

window.ThemeManager = {
    currentTheme: 'default',
    themes: ['default', 'forerunner', 'neon'],
    initialized: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;

        console.log('[ThemeManager] Initializing...');

        // Load saved theme
        const saved = localStorage.getItem('obelisk-ui-theme');
        console.log('[ThemeManager] Saved theme:', saved);

        if (saved && this.themes.includes(saved)) {
            this.setTheme(saved, false);
        }

        // Setup event listeners
        this.setupListeners();
        console.log('[ThemeManager] Ready. Found', document.querySelectorAll('.theme-option').length, 'theme options');
    },

    setTheme(theme, save = true) {
        console.log('[ThemeManager] Setting theme to:', theme);

        // Remove all theme classes
        this.themes.forEach(t => {
            document.body.classList.remove(`theme-${t}`);
        });

        // Apply new theme (except default which has no class)
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
            console.log('[ThemeManager] Added class: theme-' + theme);
            console.log('[ThemeManager] Body classes now:', document.body.className);
        }

        this.currentTheme = theme;

        // Update UI
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === theme);
        });

        // Save preference
        if (save) {
            localStorage.setItem('obelisk-ui-theme', theme);
        }
    },

    setupListeners() {
        const options = document.querySelectorAll('.theme-option');
        options.forEach(option => {
            // Remove old listeners by cloning
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);

            newOption.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const theme = newOption.dataset.theme;
                console.log('[ThemeManager] Clicked theme:', theme);
                this.setTheme(theme);
            });
        });
    }
};

// Global function for onclick fallback
window.setUITheme = function(theme) {
    window.ThemeManager.setTheme(theme);
};

// Initialize theme manager - multiple fallbacks
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.ThemeManager.init();
    }, 300);
});

// Also try on load
window.addEventListener('load', () => {
    setTimeout(() => {
        window.ThemeManager.init();
    }, 500);
});

// Also try immediately if DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        window.ThemeManager.init();
    }, 100);
}
