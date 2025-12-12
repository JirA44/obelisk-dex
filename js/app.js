/**
 * Obelisk DEX - Main Application
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

        // Initialize modules
        await SecureStorage.init();
        await HyperliquidAPI.init();

        // Setup event listeners
        this.setupEventListeners();

        // Check for existing wallet
        await this.checkExistingWallet();

        // Load initial data
        await this.loadInitialData();

        // Start price updates
        this.startPriceUpdates();

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
        window.addEventListener('hyperliquid-connected', () => this.onHyperliquidConnected());
    },

    /**
     * Switch active tab
     */
    switchTab(tabName) {
        this.state.currentTab = tabName;

        // Update nav tabs
        this.elements.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content
        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
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

        // Update button style
        const btn = this.elements.btnPlaceOrder;
        if (btn && WalletManager.isUnlocked) {
            btn.className = `btn-order btn-${side}`;
            btn.textContent = `${side === 'long' ? 'Long' : 'Short'} ${this.state.currentPair}`;
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
        const price = this.state.prices[this.state.currentPair] || 0;
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
     * Check for existing wallet
     */
    async checkExistingWallet() {
        const hasWallet = await WalletManager.hasWallet();

        if (hasWallet) {
            // Show unlock prompt
            console.log('Existing wallet found');
        }
    },

    /**
     * Load initial data
     */
    async loadInitialData() {
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
        // Update prices every 5 seconds
        setInterval(async () => {
            try {
                const prices = await HyperliquidAPI.getAllPrices();
                this.state.prices = prices;
                this.updatePriceDisplay();
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
        const price = this.state.prices[this.state.currentPair];
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
            this.elements.spreadValue.textContent = `Spread: $${spread.toFixed(2)} (${spreadPercent.toFixed(3)}%)`;
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

            const gasCostUSD = await UniswapAPI.estimateGasCostUSD(quote.estimatedGas, this.state.prices['ETH'] || 3000);
            this.elements.networkFee.textContent = `~$${gasCostUSD.toFixed(2)}`;

            this.elements.swapDetails.style.display = 'block';

            // Enable swap button if wallet connected
            if (WalletManager.isUnlocked) {
                this.elements.btnSwap.disabled = false;
                this.elements.btnSwap.textContent = 'Swap';
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
        if (!WalletManager.isUnlocked) {
            this.switchTab('wallet');
            return;
        }

        const amount = parseFloat(this.elements.swapFromAmount.value);
        if (!amount) return;

        try {
            this.elements.btnSwap.disabled = true;
            this.elements.btnSwap.textContent = 'Swapping...';

            const fromToken = this.elements.fromToken.querySelector('span').textContent;
            const toToken = this.elements.toToken.querySelector('span').textContent;

            const quote = await UniswapAPI.getQuote(fromToken, toToken, amount);
            const result = await UniswapAPI.executeSwap(quote, WalletManager.currentWallet);

            if (result.success) {
                this.showNotification('Swap submitted!', 'success');
                this.elements.swapFromAmount.value = '';
                this.elements.swapToAmount.value = '';
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (e) {
            this.showNotification('Swap failed: ' + e.message, 'error');
        } finally {
            this.elements.btnSwap.disabled = false;
            this.elements.btnSwap.textContent = 'Swap';
        }
    },

    /**
     * Place order
     */
    async placeOrder() {
        if (!WalletManager.isUnlocked) {
            this.switchTab('wallet');
            return;
        }

        const size = parseFloat(this.elements.orderSize.value);
        if (!size) {
            this.showNotification('Please enter order size', 'error');
            return;
        }

        try {
            this.elements.btnPlaceOrder.disabled = true;
            this.elements.btnPlaceOrder.textContent = 'Placing order...';

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
                this.showNotification('Order placed!', 'success');
                this.elements.orderSize.value = '';
            }
        } catch (e) {
            this.showNotification('Order failed: ' + e.message, 'error');
        } finally {
            this.updateOrderButton();
        }
    },

    /**
     * Update order button state
     */
    updateOrderButton() {
        const btn = this.elements.btnPlaceOrder;
        if (!btn) return;

        if (WalletManager.isUnlocked) {
            btn.disabled = false;
            btn.className = `btn-order btn-${this.state.orderSide}`;
            btn.textContent = `${this.state.orderSide === 'long' ? 'Long' : 'Short'} ${this.state.currentPair}`;
        } else {
            btn.disabled = true;
            btn.className = 'btn-order';
            btn.textContent = 'Connect Wallet to Trade';
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
        this.showNotification('Import wallet coming soon', 'info');
    },

    /**
     * Connect MetaMask
     */
    async connectMetaMask() {
        try {
            // Use wallet selector to let user choose their wallet
            const wallet = await WalletManager.showWalletSelector();
            this.onWalletConnected(wallet);
            this.showNotification(`${wallet.name} connected!`, 'success');
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
        this.elements.btnSwap.textContent = 'Swap';

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
        if (!container) return;

        // Clear placeholder
        container.innerHTML = '';

        // Create TradingView widget
        const widget = document.createElement('div');
        widget.id = 'tradingview-widget';
        widget.style.cssText = 'width:100%; height:100%;';
        container.appendChild(widget);

        // Load TradingView widget
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.onload = () => {
            if (typeof TradingView !== 'undefined') {
                new TradingView.widget({
                    container_id: 'tradingview-widget',
                    autosize: true,
                    symbol: 'BINANCE:' + this.state.currentPair + 'USDT',
                    interval: '15',
                    timezone: 'Etc/UTC',
                    theme: 'dark',
                    style: '1',
                    locale: this.state.language === 'fr' ? 'fr' : 'en',
                    toolbar_bg: '#1a1a2e',
                    enable_publishing: false,
                    hide_side_toolbar: false,
                    allow_symbol_change: true,
                    save_image: false,
                    studies: ['Volume@tv-basicstudies'],
                    show_popup_button: true,
                    popup_width: '1000',
                    popup_height: '650'
                });
                this.state.chartLoaded = true;
            }
        };
        document.head.appendChild(script);
    },

    /**
     * Handle wallet disconnected
     */
    onWalletDisconnected() {
        this.elements.walletEmpty.style.display = 'block';
        this.elements.walletConnected.style.display = 'none';

        this.elements.btnConnect.innerHTML = '<span class="btn-icon">🔐</span><span>Connect Wallet</span>';

        this.updateOrderButton();
        this.elements.btnSwap.disabled = true;
        this.elements.btnSwap.textContent = 'Connect Wallet to Swap';
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
            const balances = await UniswapAPI.getAllBalances(address);
            const ethPrice = this.state.prices['ETH'] || 3000;

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
});

// Export
window.ObeliskApp = ObeliskApp;
