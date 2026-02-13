// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - FIAT ON-RAMP MODULE
// Credit/Debit Card Payment Integration
// ═══════════════════════════════════════════════════════════════════════════════

const FiatOnRamp = {
    // Supported payment methods
    paymentMethods: [
        { id: 'card', name: 'Credit/Debit Card', icon: '💳', fee: '2.9%', minAmount: 20, maxAmount: 10000 },
        { id: 'apple_pay', name: 'Apple Pay', icon: '', fee: '2.5%', minAmount: 20, maxAmount: 5000 },
        { id: 'google_pay', name: 'Google Pay', icon: '🔵', fee: '2.5%', minAmount: 20, maxAmount: 5000 },
        { id: 'sepa', name: 'Bank Transfer (SEPA)', icon: '🏦', fee: '0.5%', minAmount: 100, maxAmount: 50000, time: '1-3 days' },
    ],

    // Supported currencies
    currencies: [
        { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
        { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
        { code: 'CHF', symbol: 'Fr.', name: 'Swiss Franc', flag: '🇨🇭' },
    ],

    // State
    selectedPaymentMethod: 'card',
    selectedCurrency: 'EUR',
    amount: 100,
    isProcessing: false,

    // MoonPay configuration
    moonpay: {
        apiKey: '', // Set via FiatOnRamp.configure({moonpayApiKey: '...'})
        baseUrl: 'https://buy.moonpay.com',
        widgetUrl: 'https://buy-sandbox.moonpay.com', // sandbox for testing
        supportedCurrencies: ['eth', 'usdc', 'btc', 'sol', 'matic', 'arb'],
        isLive: false
    },

    // Transak configuration
    transak: {
        apiKey: '',
        baseUrl: 'https://global.transak.com',
        widgetUrl: 'https://global-stg.transak.com', // staging for testing
        supportedCurrencies: ['ETH', 'USDC', 'BTC', 'SOL', 'MATIC'],
        isLive: false
    },

    // Active provider
    activeProvider: 'simulation', // 'moonpay' | 'transak' | 'simulation'

    // Payment completion callback
    onPaymentCompleteCallback: null,

    // Initialize the module
    init() {
        console.log('[FiatOnRamp] Module initialized');
        this.setupPostMessageListener();
    },

    // Configure fiat providers (MoonPay/Transak)
    configure(config) {
        if (config.moonpayApiKey) {
            this.moonpay.apiKey = config.moonpayApiKey;
            if (config.moonpayLive) {
                this.moonpay.isLive = true;
                this.moonpay.widgetUrl = this.moonpay.baseUrl;
            }
            console.log('[FiatOnRamp] MoonPay configured', this.moonpay.isLive ? '(LIVE)' : '(SANDBOX)');
        }

        if (config.transakApiKey) {
            this.transak.apiKey = config.transakApiKey;
            if (config.transakLive) {
                this.transak.isLive = true;
                this.transak.widgetUrl = this.transak.baseUrl;
            }
            console.log('[FiatOnRamp] Transak configured', this.transak.isLive ? '(LIVE)' : '(STAGING)');
        }

        // Set active provider
        if (config.provider) {
            this.activeProvider = config.provider;
            console.log('[FiatOnRamp] Active provider:', this.activeProvider);
        }
    },

    // Get provider status
    getProviderStatus() {
        return {
            activeProvider: this.activeProvider,
            moonpay: {
                configured: !!this.moonpay.apiKey,
                isLive: this.moonpay.isLive
            },
            transak: {
                configured: !!this.transak.apiKey,
                isLive: this.transak.isLive
            }
        };
    },

    // Setup postMessage listener for widget callbacks
    setupPostMessageListener() {
        window.addEventListener('message', (event) => {
            // Security: validate origin
            const moonpayOrigins = ['https://buy.moonpay.com', 'https://buy-sandbox.moonpay.com'];
            const transakOrigins = ['https://global.transak.com', 'https://global-stg.transak.com'];
            const validOrigins = [...moonpayOrigins, ...transakOrigins];

            if (!validOrigins.includes(event.origin)) {
                return;
            }

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                // MoonPay events
                if (data.type === 'moonpay_status_update') {
                    this.handleMoonPayEvent(data);
                }

                // Transak events
                if (data.eventName) {
                    this.handleTransakEvent(data);
                }
            } catch (e) {
                console.error('[FiatOnRamp] Error parsing postMessage:', e);
            }
        });
    },

    // Handle MoonPay events
    handleMoonPayEvent(data) {
        console.log('[FiatOnRamp] MoonPay event:', data);

        if (data.status === 'completed') {
            this.closeMoonPayWidget();
            this.showNotification('Payment completed successfully!', 'success');
            if (this.onPaymentCompleteCallback) {
                this.onPaymentCompleteCallback({
                    provider: 'moonpay',
                    status: 'completed',
                    data
                });
            }
        } else if (data.status === 'failed') {
            this.closeMoonPayWidget();
            this.showNotification('Payment failed. Please try again.', 'error');
        }
    },

    // Handle Transak events
    handleTransakEvent(data) {
        console.log('[FiatOnRamp] Transak event:', data);

        if (data.eventName === 'TRANSAK_ORDER_SUCCESSFUL') {
            this.closeTransakWidget();
            this.showNotification('Payment completed successfully!', 'success');
            if (this.onPaymentCompleteCallback) {
                this.onPaymentCompleteCallback({
                    provider: 'transak',
                    status: 'completed',
                    data
                });
            }
        } else if (data.eventName === 'TRANSAK_ORDER_FAILED') {
            this.closeTransakWidget();
            this.showNotification('Payment failed. Please try again.', 'error');
        } else if (data.eventName === 'TRANSAK_WIDGET_CLOSE') {
            this.closeTransakWidget();
        }
    },

    // Register payment completion callback
    onPaymentComplete(callback) {
        this.onPaymentCompleteCallback = callback;
    },

    // Open MoonPay widget
    openMoonPayWidget(options = {}) {
        if (!this.moonpay.apiKey) {
            this.showNotification('MoonPay not configured. Using simulation mode.', 'error');
            return;
        }

        const walletAddress = options.walletAddress || (typeof ObeliskApp !== 'undefined' ? ObeliskApp.state.account : '');
        if (!walletAddress) {
            this.showNotification('Please connect wallet first', 'error');
            return;
        }

        const params = new URLSearchParams({
            apiKey: this.moonpay.apiKey,
            currencyCode: options.currencyCode || 'usdc',
            walletAddress: walletAddress,
            baseCurrencyAmount: options.baseCurrencyAmount || this.amount,
            baseCurrencyCode: options.baseCurrencyCode || this.selectedCurrency.toLowerCase(),
            colorCode: '00ff88'
        });

        const widgetUrl = `${this.moonpay.widgetUrl}?${params.toString()}`;

        // Create overlay and iframe
        const overlay = document.createElement('div');
        overlay.id = 'moonpayWidgetOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 500;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const iframe = document.createElement('iframe');
        iframe.id = 'moonpayWidgetIframe';
        iframe.src = widgetUrl;
        iframe.allow = 'payment';
        iframe.style.cssText = `
            width: 95%;
            max-width: 450px;
            height: 90%;
            border: none;
            border-radius: 20px;
            background: white;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.closeMoonPayWidget();
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 32px;
            cursor: pointer;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        `;

        overlay.appendChild(iframe);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        console.log('[FiatOnRamp] MoonPay widget opened');
    },

    // Close MoonPay widget
    closeMoonPayWidget() {
        const overlay = document.getElementById('moonpayWidgetOverlay');
        if (overlay) {
            overlay.remove();
        }
    },

    // Open Transak widget
    openTransakWidget(options = {}) {
        if (!this.transak.apiKey) {
            this.showNotification('Transak not configured. Using simulation mode.', 'error');
            return;
        }

        const walletAddress = options.walletAddress || (typeof ObeliskApp !== 'undefined' ? ObeliskApp.state.account : '');
        if (!walletAddress) {
            this.showNotification('Please connect wallet first', 'error');
            return;
        }

        const params = new URLSearchParams({
            apiKey: this.transak.apiKey,
            cryptoCurrencyCode: options.cryptoCurrencyCode || 'USDC',
            walletAddress: walletAddress,
            fiatAmount: options.fiatAmount || this.amount,
            fiatCurrency: options.fiatCurrency || this.selectedCurrency,
            network: options.network || 'arbitrum',
            themeColor: '00ff88',
            email: options.email || '',
            hideMenu: true
        });

        const widgetUrl = `${this.transak.widgetUrl}?${params.toString()}`;

        // Create overlay and iframe
        const overlay = document.createElement('div');
        overlay.id = 'transakWidgetOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 500;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const iframe = document.createElement('iframe');
        iframe.id = 'transakWidgetIframe';
        iframe.src = widgetUrl;
        iframe.allow = 'payment';
        iframe.style.cssText = `
            width: 95%;
            max-width: 500px;
            height: 90%;
            border: none;
            border-radius: 20px;
            background: white;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.closeTransakWidget();
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 32px;
            cursor: pointer;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        `;

        overlay.appendChild(iframe);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        console.log('[FiatOnRamp] Transak widget opened');
    },

    // Close Transak widget
    closeTransakWidget() {
        const overlay = document.getElementById('transakWidgetOverlay');
        if (overlay) {
            overlay.remove();
        }
    },

    // Get the t function for translations
    t(key, fallback) {
        return typeof I18n !== 'undefined' ? I18n.t(key) : fallback;
    },

    // Get current exchange rates (simulated - would use API in production)
    getExchangeRate(fiatCurrency) {
        const rates = {
            'EUR': { USDC: 1.08, ETH: 0.00032, BTC: 0.000011 },
            'USD': { USDC: 1.00, ETH: 0.00030, BTC: 0.000010 },
            'GBP': { USDC: 1.26, ETH: 0.00038, BTC: 0.000013 },
            'CHF': { USDC: 1.13, ETH: 0.00034, BTC: 0.000012 },
        };
        return rates[fiatCurrency] || rates['EUR'];
    },

    // Calculate what user will receive
    calculateReceived(fiatAmount, fiatCurrency, cryptoAsset = 'USDC') {
        const rate = this.getExchangeRate(fiatCurrency);
        const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
        const feePercent = parseFloat(method.fee) / 100;
        const netAmount = fiatAmount * (1 - feePercent);
        return {
            crypto: netAmount * rate[cryptoAsset],
            fee: fiatAmount * feePercent,
            netFiat: netAmount,
            rate: rate[cryptoAsset]
        };
    },

    // Show the on-ramp modal
    showModal(presetAmount = null) {
        if (presetAmount) this.amount = presetAmount;

        // Check if modal exists, if not create it
        let modal = document.getElementById('fiatOnRampModal');
        if (!modal) {
            this.createModal();
            modal = document.getElementById('fiatOnRampModal');
        }

        modal.style.display = 'flex';
        this.updateModalContent();
    },

    // Create the modal
    createModal() {
        const modalHTML = `
            <div id="fiatOnRampModal" class="modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:500;align-items:center;justify-content:center;">
                <div style="
                    background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                    border: 1px solid #333;
                    border-radius: 20px;
                    width: 95%;
                    max-width: 480px;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                ">
                    <!-- Header -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20px 24px;
                        border-bottom: 1px solid #333;
                    ">
                        <div>
                            <h2 style="color:#fff;margin:0;font-size:1.3rem;">💳 ${this.t('buy_with_card', 'Acheter par Carte')}</h2>
                            <p style="color:#888;margin:4px 0 0;font-size:0.85rem;">Visa, Mastercard, Apple Pay</p>
                        </div>
                        <button onclick="FiatOnRamp.closeModal()" style="
                            background: none;
                            border: none;
                            color: #888;
                            font-size: 24px;
                            cursor: pointer;
                            padding: 0;
                            line-height: 1;
                        ">&times;</button>
                    </div>

                    <!-- Content -->
                    <div id="fiatOnRampContent" style="padding: 24px;">
                        <!-- Will be filled by updateModalContent -->
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // Update modal content
    updateModalContent() {
        const content = document.getElementById('fiatOnRampContent');
        if (!content) return;

        const currency = this.currencies.find(c => c.code === this.selectedCurrency);
        const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
        const calc = this.calculateReceived(this.amount, this.selectedCurrency);

        content.innerHTML = `
            <!-- Amount Input -->
            <div style="margin-bottom: 24px;">
                <label style="color:#888;font-size:0.85rem;display:block;margin-bottom:8px;">
                    ${this.t('amount', 'Montant')} à payer
                </label>
                <div style="display:flex;gap:10px;">
                    <div style="
                        flex: 1;
                        background: #0a0a15;
                        border: 1px solid #333;
                        border-radius: 12px;
                        padding: 16px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    ">
                        <input type="number" id="fiatAmount" value="${this.amount}" min="20" max="10000"
                            onchange="FiatOnRamp.updateAmount(this.value)"
                            style="
                                flex: 1;
                                background: none;
                                border: none;
                                color: #fff;
                                font-size: 1.5rem;
                                font-weight: 600;
                                width: 100%;
                                outline: none;
                            " />
                        <span style="color:#00d4aa;font-size:1.3rem;">${currency.symbol}</span>
                    </div>
                    <select onchange="FiatOnRamp.selectCurrency(this.value)" style="
                        background: #0a0a15;
                        border: 1px solid #333;
                        border-radius: 12px;
                        padding: 0 16px;
                        color: #fff;
                        font-size: 1rem;
                        cursor: pointer;
                    ">
                        ${this.currencies.map(c => `
                            <option value="${c.code}" ${c.code === this.selectedCurrency ? 'selected' : ''}>
                                ${c.flag} ${c.code}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>

            <!-- Quick amounts -->
            <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;">
                ${[50, 100, 250, 500, 1000].map(amt => `
                    <button onclick="FiatOnRamp.setAmount(${amt})" style="
                        flex: 1;
                        min-width: 60px;
                        padding: 10px;
                        border-radius: 8px;
                        border: 1px solid ${this.amount === amt ? '#00d4aa' : '#333'};
                        background: ${this.amount === amt ? 'rgba(0,212,170,0.15)' : 'transparent'};
                        color: ${this.amount === amt ? '#00d4aa' : '#888'};
                        cursor: pointer;
                        font-size: 0.9rem;
                        transition: all 0.2s;
                    ">${currency.symbol}${amt}</button>
                `).join('')}
            </div>

            <!-- You'll receive -->
            <div style="
                background: linear-gradient(145deg, #0a0a15, #0d0d1a);
                border: 1px solid #333;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
            ">
                <div style="color:#888;font-size:0.8rem;margin-bottom:8px;">${this.t('min_received', 'Vous recevrez')}</div>
                <div style="display:flex;align-items:baseline;gap:10px;">
                    <span style="color:#00ff88;font-size:2rem;font-weight:700;">${calc.crypto.toFixed(2)}</span>
                    <span style="color:#00d4aa;font-size:1.2rem;">USDC</span>
                </div>
                <div style="margin-top:12px;padding-top:12px;border-top:1px solid #222;color:#666;font-size:0.8rem;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span>${this.t('rate', 'Rate')}</span>
                        <span>1 ${currency.code} = ${calc.rate.toFixed(4)} USDC</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span>${this.t('fee', 'Fee')} (${method.fee})</span>
                        <span style="color:#ff6464;">-${currency.symbol}${calc.fee.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Methods -->
            <div style="margin-bottom: 24px;">
                <label style="color:#888;font-size:0.85rem;display:block;margin-bottom:12px;">
                    ${this.t('payment_method', 'Payment Method')}
                </label>
                <div style="display:grid;gap:8px;">
                    ${this.paymentMethods.map(m => `
                        <button onclick="FiatOnRamp.selectPaymentMethod('${m.id}')" style="
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            padding: 14px 16px;
                            border-radius: 10px;
                            border: 1px solid ${this.selectedPaymentMethod === m.id ? '#00d4aa' : '#333'};
                            background: ${this.selectedPaymentMethod === m.id ? 'rgba(0,212,170,0.1)' : '#0a0a15'};
                            cursor: pointer;
                            transition: all 0.2s;
                            text-align: left;
                            width: 100%;
                        ">
                            <span style="font-size:1.5rem;">${m.icon}</span>
                            <div style="flex:1;">
                                <div style="color:#fff;font-weight:500;">${m.name}</div>
                                <div style="color:#666;font-size:0.75rem;">
                                    ${this.t('fee', 'Fee')}: ${m.fee}
                                    ${m.time ? ` • ${m.time}` : ` • ${this.t('instant', 'Instant')}`}
                                </div>
                            </div>
                            ${this.selectedPaymentMethod === m.id ? '<span style="color:#00d4aa;">✓</span>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Card Form (shown when card is selected) -->
            ${this.selectedPaymentMethod === 'card' ? this.renderCardForm() : ''}

            <!-- Third-party provider buttons (MoonPay/Transak) -->
            ${this.renderProviderButtons()}

            <!-- Pay Button -->
            <button onclick="FiatOnRamp.processPayment()" id="payButton" style="
                width: 100%;
                padding: 16px;
                border-radius: 12px;
                border: none;
                background: linear-gradient(135deg, #00d4aa, #00a884);
                color: #fff;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 16px;
            " ${this.isProcessing ? 'disabled' : ''}>
                ${this.isProcessing ? '⏳ Traitement...' : `💳 Payer ${currency.symbol}${this.amount}`}
            </button>

            <!-- Security badges -->
            <div style="display:flex;justify-content:center;gap:20px;margin-top:20px;opacity:0.6;">
                <span style="font-size:0.75rem;color:#888;">🔒 SSL Sécurisé</span>
                <span style="font-size:0.75rem;color:#888;">💳 PCI DSS</span>
                <span style="font-size:0.75rem;color:#888;">🛡️ 3D Secure</span>
            </div>
        `;
    },

    // Render card form
    renderCardForm() {
        return `
            <div style="
                background: #0a0a15;
                border: 1px solid #333;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
            ">
                <!-- Card Number -->
                <div style="margin-bottom:16px;">
                    <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:6px;">
                        Numéro de carte
                    </label>
                    <input type="text" id="cardNumber" placeholder="4242 4242 4242 4242"
                        maxlength="19"
                        oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim()"
                        style="
                            width: 100%;
                            background: #0d0d1a;
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 12px 16px;
                            color: #fff;
                            font-size: 1rem;
                            letter-spacing: 1px;
                        " />
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                    <!-- Expiry -->
                    <div>
                        <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:6px;">
                            Expiration
                        </label>
                        <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5"
                            oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/^(.{2})/, '$1/').slice(0,5)"
                            style="
                                width: 100%;
                                background: #0d0d1a;
                                border: 1px solid #333;
                                border-radius: 8px;
                                padding: 12px 16px;
                                color: #fff;
                                font-size: 1rem;
                            " />
                    </div>

                    <!-- CVC -->
                    <div>
                        <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:6px;">
                            CVC
                        </label>
                        <input type="text" id="cardCVC" placeholder="123" maxlength="4"
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                            style="
                                width: 100%;
                                background: #0d0d1a;
                                border: 1px solid #333;
                                border-radius: 8px;
                                padding: 12px 16px;
                                color: #fff;
                                font-size: 1rem;
                            " />
                    </div>
                </div>

                <!-- Cardholder name -->
                <div>
                    <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:6px;">
                        Nom sur la carte
                    </label>
                    <input type="text" id="cardName" placeholder="HUGO PADILLA"
                        oninput="this.value = this.value.toUpperCase()"
                        style="
                            width: 100%;
                            background: #0d0d1a;
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 12px 16px;
                            color: #fff;
                            font-size: 1rem;
                            letter-spacing: 1px;
                        " />
                </div>
            </div>
        `;
    },

    // Update amount
    updateAmount(value) {
        this.amount = Math.max(20, Math.min(10000, parseFloat(value) || 0));
        this.updateModalContent();
    },

    // Set amount from quick buttons
    setAmount(amount) {
        this.amount = amount;
        this.updateModalContent();
    },

    // Select currency
    selectCurrency(code) {
        this.selectedCurrency = code;
        this.updateModalContent();
    },

    // Select payment method
    selectPaymentMethod(id) {
        this.selectedPaymentMethod = id;
        this.updateModalContent();
    },

    // Render provider buttons (MoonPay/Transak)
    renderProviderButtons() {
        const buttons = [];

        // MoonPay button
        if (this.moonpay.apiKey && (this.activeProvider === 'moonpay' || this.activeProvider === 'simulation')) {
            buttons.push(`
                <button onclick="FiatOnRamp.openMoonPayWidget()" style="
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    border: 1px solid #4a9eff;
                    background: linear-gradient(135deg, #4a9eff, #357abd);
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <span style="font-size:1.3rem;">🌙</span>
                    Buy with MoonPay
                    ${!this.moonpay.isLive ? '<span style="font-size:0.75rem;opacity:0.8;">(Sandbox)</span>' : ''}
                </button>
            `);
        }

        // Transak button
        if (this.transak.apiKey && (this.activeProvider === 'transak' || this.activeProvider === 'simulation')) {
            buttons.push(`
                <button onclick="FiatOnRamp.openTransakWidget()" style="
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    border: 1px solid #6b46ff;
                    background: linear-gradient(135deg, #6b46ff, #5236cc);
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <span style="font-size:1.3rem;">💎</span>
                    Buy with Transak
                    ${!this.transak.isLive ? '<span style="font-size:0.75rem;opacity:0.8;">(Staging)</span>' : ''}
                </button>
            `);
        }

        if (buttons.length > 0) {
            return `
                <div style="margin-bottom:20px;">
                    <div style="
                        text-align:center;
                        color:#888;
                        font-size:0.85rem;
                        margin-bottom:12px;
                        position:relative;
                    ">
                        <span style="background:#1a1a2e;padding:0 10px;position:relative;z-index:1;">
                            ${this.t('or_use_provider', 'Or use secure payment provider')}
                        </span>
                        <div style="
                            position:absolute;
                            top:50%;
                            left:0;
                            right:0;
                            height:1px;
                            background:#333;
                            z-index:0;
                        "></div>
                    </div>
                    ${buttons.join('')}
                </div>
            `;
        }

        return '';
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('fiatOnRampModal');
        if (modal) modal.style.display = 'none';
        this.isProcessing = false;
    },

    // Process payment (simulation)
    async processPayment() {
        if (this.isProcessing) return;

        // Validate card fields
        if (this.selectedPaymentMethod === 'card') {
            const cardNumber = document.getElementById('cardNumber')?.value?.replace(/\s/g, '');
            const cardExpiry = document.getElementById('cardExpiry')?.value;
            const cardCVC = document.getElementById('cardCVC')?.value;
            const cardName = document.getElementById('cardName')?.value;

            if (!cardNumber || cardNumber.length < 16) {
                this.showNotification('Numéro de carte invalide', 'error');
                return;
            }
            if (!cardExpiry || cardExpiry.length < 5) {
                this.showNotification('Date d\'expiration invalide', 'error');
                return;
            }
            if (!cardCVC || cardCVC.length < 3) {
                this.showNotification('CVC invalide', 'error');
                return;
            }
            if (!cardName || cardName.length < 2) {
                this.showNotification('Nom du titulaire requis', 'error');
                return;
            }
        }

        this.isProcessing = true;
        this.updateModalContent();

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Calculate received amount
        const calc = this.calculateReceived(this.amount, this.selectedCurrency);
        const currency = this.currencies.find(c => c.code === this.selectedCurrency);

        // Simulate 3D Secure (show success)
        this.isProcessing = false;

        // Show success
        const content = document.getElementById('fiatOnRampContent');
        if (content) {
            content.innerHTML = `
                <div style="text-align:center;padding:40px 20px;">
                    <div style="font-size:4rem;margin-bottom:20px;">✅</div>
                    <h3 style="color:#00ff88;margin-bottom:10px;">Paiement Réussi!</h3>
                    <p style="color:#888;margin-bottom:24px;">
                        Vous avez acheté <strong style="color:#00d4aa;">${calc.crypto.toFixed(2)} USDC</strong>
                    </p>

                    <div style="
                        background: #0a0a15;
                        border: 1px solid #333;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 24px;
                        text-align: left;
                    ">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#888;">${this.t('amount_paid', 'Amount Paid')}</span>
                            <span style="color:#fff;">${currency.symbol}${this.amount}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#888;">${this.t('fee', 'Fee')}</span>
                            <span style="color:#ff6464;">-${currency.symbol}${calc.fee.toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #333;">
                            <span style="color:#888;">${this.t('usdc_received', 'USDC Received')}</span>
                            <span style="color:#00ff88;font-weight:600;">${calc.crypto.toFixed(2)} USDC</span>
                        </div>
                    </div>

                    <p style="color:#666;font-size:0.85rem;margin-bottom:20px;">
                        ${this.t('usdc_credited', 'USDC has been credited to your Obelisk account.')}<br>
                        ${this.t('can_invest_now', 'You can now invest in Combos!')}
                    </p>

                    <button onclick="FiatOnRamp.closeModal()" style="
                        width: 100%;
                        padding: 14px;
                        border-radius: 10px;
                        border: none;
                        background: linear-gradient(135deg, #00d4aa, #00a884);
                        color: #fff;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        Continuer
                    </button>
                </div>
            `;
        }

        // Update balance in app state if available
        if (typeof ObeliskApp !== 'undefined' && ObeliskApp.state) {
            ObeliskApp.state.balance = (ObeliskApp.state.balance || 0) + calc.crypto;
        }

        console.log('[FiatOnRamp] Payment successful:', calc.crypto, 'USDC');
    },

    // Show notification
    showNotification(message, type = 'info') {
        const colors = {
            error: '#ff6464',
            success: '#00ff88',
            info: '#4a9eff'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: ${type === 'error' || type === 'success' ? '#000' : '#fff'};
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    FiatOnRamp.init();
});

// Make globally available
window.FiatOnRamp = FiatOnRamp;
