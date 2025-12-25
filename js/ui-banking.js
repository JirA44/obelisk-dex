/**
 * Obelisk DEX - Banking & Bonds UI Controller
 * Version: 2.1.0 - Demo mode support
 *
 * Handles UI interactions for deposit/withdraw and bonds modules.
 */

const DepositUI = {
    walletBalance: 0,
    hlBalance: 0,

    async init() {
        this.setupEventListeners();
        await this.updateBalances();
    },

    setupEventListeners() {
        // Deposit button
        document.getElementById('btn-deposit')?.addEventListener('click', () => this.handleDeposit());

        // Withdraw button
        document.getElementById('btn-withdraw')?.addEventListener('click', () => this.handleWithdraw());

        // Deposit amount change
        document.getElementById('deposit-amount')?.addEventListener('input', (e) => {
            this.updateDepositPreview(parseFloat(e.target.value) || 0);
        });

        // Withdraw amount change
        document.getElementById('withdraw-amount')?.addEventListener('input', (e) => {
            this.updateWithdrawPreview(parseFloat(e.target.value) || 0);
        });
    },

    async updateBalances() {
        if (typeof WalletManager === 'undefined' || !WalletManager.isUnlocked) return;

        const address = WalletManager.currentWallet?.address;
        if (!address) return;

        // Get USDC balance on wallet
        this.walletBalance = await DepositWithdraw.getUSDCBalance(address);
        document.getElementById('deposit-wallet-balance').textContent =
            `$${this.walletBalance.toFixed(2)} USDC`;

        // Get Hyperliquid balance
        this.hlBalance = await DepositWithdraw.getHyperliquidBalance(address);
        document.getElementById('withdraw-hl-balance').textContent =
            `$${this.hlBalance.toFixed(2)} USDC`;

        // Update button states
        this.updateButtonStates();
    },

    updateButtonStates() {
        const btnDeposit = document.getElementById('btn-deposit');
        const btnWithdraw = document.getElementById('btn-withdraw');

        if (!btnDeposit || !btnWithdraw) {
            console.warn('Deposit/Withdraw buttons not found');
            return;
        }

        // Check demo mode
        const isDemo = typeof DemoTrading !== 'undefined' && DemoTrading.enabled;

        // Check multiple ways if wallet is connected
        const walletManagerConnected = typeof WalletManager !== 'undefined' && WalletManager.isUnlocked;
        const metamaskConnected = typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress;
        const isConnected = walletManagerConnected || metamaskConnected || isDemo;

        console.log('Wallet status:', { walletManagerConnected, metamaskConnected, isDemo, isConnected });

        if (isConnected) {
            btnDeposit.disabled = false;
            btnDeposit.textContent = isDemo ? 'Deposit USDC (Demo)' : 'Deposit USDC';
            btnDeposit.style.opacity = '1';
            btnDeposit.style.cursor = 'pointer';
            btnWithdraw.disabled = false;
            btnWithdraw.textContent = isDemo ? 'Withdraw USDC (Demo)' : 'Withdraw USDC';
            btnWithdraw.style.opacity = '1';
            btnWithdraw.style.cursor = 'pointer';
        } else {
            btnDeposit.disabled = true;
            btnDeposit.textContent = 'Connect Wallet to Deposit';
            btnDeposit.style.opacity = '0.5';
            btnDeposit.style.cursor = 'not-allowed';
            btnWithdraw.disabled = true;
            btnWithdraw.textContent = 'Connect Wallet to Withdraw';
            btnWithdraw.style.opacity = '0.5';
            btnWithdraw.style.cursor = 'not-allowed';
        }
    },

    setMaxDeposit() {
        const input = document.getElementById('deposit-amount');
        input.value = this.walletBalance.toFixed(2);
        this.updateDepositPreview(this.walletBalance);
    },

    setMaxWithdraw() {
        const input = document.getElementById('withdraw-amount');
        input.value = Math.max(0, this.hlBalance - 1).toFixed(2); // Leave $1 for fee
        this.updateWithdrawPreview(this.hlBalance - 1);
    },

    async updateDepositPreview(amount) {
        const gasFee = await DepositWithdraw.estimateDepositGas();
        document.getElementById('deposit-gas-fee').textContent = `~$${gasFee.gasCostUSD.toFixed(2)}`;
    },

    updateWithdrawPreview(amount) {
        const fee = 1; // $1 withdrawal fee
        const receive = Math.max(0, amount - fee);
        document.getElementById('withdraw-receive').textContent = `$${receive.toFixed(2)}`;
    },

    async handleDeposit() {
        const amount = parseFloat(document.getElementById('deposit-amount').value);
        const minDeposit = DepositWithdraw?.MIN_DEPOSIT?.USDC || 0.01;

        if (!amount || amount < minDeposit) {
            (window.ObeliskApp?.showNotification || console.log)(`Minimum deposit is $${minDeposit} USDC`, 'error');
            return;
        }

        // Check demo mode
        const isDemo = typeof DemoTrading !== 'undefined' && DemoTrading.enabled;

        try {
            const btn = document.getElementById('btn-deposit');
            btn.disabled = true;
            btn.textContent = 'Depositing...';

            if (isDemo) {
                // Demo mode - simulate deposit
                await new Promise(r => setTimeout(r, 1000));
                (window.ObeliskApp?.showNotification || console.log)(`[DEMO] Deposited $${amount} USDC`, 'success');
                document.getElementById('deposit-amount').value = '';
            } else {
                const result = await DepositWithdraw.depositUSDC(
                    WalletManager.currentWallet,
                    amount
                );

                if (result.success) {
                    (window.ObeliskApp?.showNotification || console.log)(result.message, 'success');
                    document.getElementById('deposit-amount').value = '';
                    this.updateTransactionHistory();
                    await this.updateBalances();
                }
            }
        } catch (e) {
            (window.ObeliskApp?.showNotification || console.log)(e.message, 'error');
        } finally {
            this.updateButtonStates();
        }
    },

    async handleWithdraw() {
        const amount = parseFloat(document.getElementById('withdraw-amount').value);

        if (!amount || amount < 0.1) {
            (window.ObeliskApp?.showNotification || console.log)('Minimum withdrawal is $0.10 USDC', 'error');
            return;
        }

        // Check demo mode
        const isDemo = typeof DemoTrading !== 'undefined' && DemoTrading.enabled;

        try {
            const btn = document.getElementById('btn-withdraw');
            btn.disabled = true;
            btn.textContent = 'Withdrawing...';

            if (isDemo) {
                // Demo mode - simulate withdrawal
                await new Promise(r => setTimeout(r, 1000));
                const fee = 1;
                const receive = Math.max(0, amount - fee);
                (window.ObeliskApp?.showNotification || console.log)(`[DEMO] Withdrew $${receive.toFixed(2)} USDC (fee: $${fee})`, 'success');
                document.getElementById('withdraw-amount').value = '';
            } else {
                const result = await DepositWithdraw.withdrawUSDC(
                    WalletManager.currentWallet,
                    amount
                );

                if (result.success) {
                    (window.ObeliskApp?.showNotification || console.log)(result.message, 'success');
                    document.getElementById('withdraw-amount').value = '';
                    this.updateTransactionHistory();
                    await this.updateBalances();
                }
            }
        } catch (e) {
            (window.ObeliskApp?.showNotification || console.log)(e.message, 'error');
        } finally {
            this.updateButtonStates();
        }
    },

    updateTransactionHistory() {
        const container = document.getElementById('banking-tx-list');
        const transactions = DepositWithdraw.getRecentTransactions(5);

        if (transactions.length === 0) {
            container.innerHTML = '<div class="tx-empty">No transactions yet</div>';
            return;
        }

        container.innerHTML = transactions.map(tx => {
            const status = DepositWithdraw.formatStatus(tx.status);
            const icon = tx.type === 'deposit' ? '↑' : '↓';
            const date = new Date(tx.timestamp).toLocaleDateString();

            return `
                <div class="tx-item">
                    <div class="tx-icon ${tx.type}">${icon}</div>
                    <div class="tx-info">
                        <span class="tx-type">${tx.type === 'deposit' ? 'Deposit' : 'Withdraw'}</span>
                        <span class="tx-date">${date}</span>
                    </div>
                    <div class="tx-amount">
                        <span>$${tx.amount.toFixed(2)}</span>
                        <span class="tx-status ${status.class}">${status.text}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
};

const BondsUI = {
    isInstitutional: false,
    selectedCategory: 'all',

    async init() {
        this.setupEventListeners();
        this.updatePortfolioSummary();
    },

    setupEventListeners() {
        // Investor type toggle
        document.querySelectorAll('.investor-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleInvestorType(e.target.dataset.type));
        });

        // Category filter
        document.querySelectorAll('.bond-categories .cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByCategory(e.target.dataset.category));
        });

        // Invest buttons
        document.querySelectorAll('.btn-invest').forEach(btn => {
            btn.addEventListener('click', (e) => this.showInvestModal(e.target.dataset.product));
        });

        // Institutional access request
        document.getElementById('btn-request-institutional')?.addEventListener('click', () => {
            this.showInstitutionalModal();
        });
    },

    toggleInvestorType(type) {
        this.isInstitutional = type === 'institutional';

        // Update toggle buttons
        document.querySelectorAll('.investor-toggle .toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // Show/hide institutional-only products
        document.querySelectorAll('.bond-card.institutional-only').forEach(card => {
            card.style.display = this.isInstitutional ? 'flex' : 'none';
        });

        // Show institutional section
        const instSection = document.getElementById('institutional-section');
        if (instSection) {
            instSection.style.display = this.isInstitutional && !BondsModule.isInstitutional ? 'block' : 'none';
        }
    },

    filterByCategory(category) {
        this.selectedCategory = category;

        // Update category buttons
        document.querySelectorAll('.bond-categories .cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Filter cards
        document.querySelectorAll('.bond-card').forEach(card => {
            const cardType = card.dataset.type;
            const isInstitutional = card.classList.contains('institutional-only');

            const matchesCategory = category === 'all' || cardType === category;
            const matchesInvestorType = !isInstitutional || this.isInstitutional;

            card.style.display = matchesCategory && matchesInvestorType ? 'flex' : 'none';
        });
    },

    showInvestModal(productId) {
        console.log('Opening invest modal for:', productId);

        // Check BondsModule exists
        if (typeof BondsModule === 'undefined') {
            console.error('BondsModule not loaded');
            ObeliskApp?.showNotification?.('Module not loaded', 'error');
            return;
        }

        const product = BondsModule.PRODUCTS[productId];
        if (!product) {
            console.error('Product not found:', productId);
            ObeliskApp?.showNotification?.('Product not found', 'error');
            return;
        }

        // Check if wallet connected
        if (typeof WalletManager === 'undefined' || !WalletManager.isUnlocked) {
            // Show clearer message
            const msg = window.ethereum
                ? 'Connectez votre wallet MetaMask via le bouton "Connect Wallet" en haut'
                : 'Installez MetaMask ou connectez un wallet Web3 pour investir';
            ObeliskApp?.showNotification?.(msg, 'error');
            ObeliskApp?.switchTab?.('wallet');
            return;
        }

        // Check institutional requirement
        if (product.institutionalOnly && !BondsModule.isInstitutional) {
            this.showInstitutionalModal();
            return;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal invest-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Invest in ${product.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="invest-product-info">
                        <div class="apy-highlight">
                            <span class="apy-value">${product.apy}%</span>
                            <span class="apy-label">APY</span>
                        </div>
                        <div class="product-details">
                            <p><strong>Issuer:</strong> ${product.issuer}</p>
                            <p><strong>Underlying:</strong> ${product.underlying}</p>
                            <p><strong>Rating:</strong> ${product.rating}</p>
                            <p><strong>Min. Investment:</strong> $${product.minInvestment.toLocaleString()}</p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Investment Amount (USDC)</label>
                        <div class="input-group">
                            <input type="number" id="invest-amount" placeholder="0.00" min="${product.minInvestment}" step="0.01"/>
                            <span class="input-suffix">USDC</span>
                        </div>
                    </div>

                    <div class="yield-preview">
                        <h4>Expected Returns</h4>
                        <div class="yield-row">
                            <span>30 Days</span>
                            <span id="yield-30d">$0.00</span>
                        </div>
                        <div class="yield-row">
                            <span>90 Days</span>
                            <span id="yield-90d">$0.00</span>
                        </div>
                        <div class="yield-row">
                            <span>1 Year</span>
                            <span id="yield-365d">$0.00</span>
                        </div>
                    </div>

                    <div class="risk-disclosure">
                        <h4>Risk Disclosure</h4>
                        <p>${BondsModule.getRiskDisclosure(productId)?.disclosure || ''}</p>
                    </div>

                    <button class="btn-primary" id="btn-confirm-invest">Invest Now</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Setup modal events
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove());

        // Update yield preview on amount change
        const amountInput = modal.querySelector('#invest-amount');
        amountInput.addEventListener('input', () => {
            try {
                const amount = parseFloat(amountInput.value) || 0;
                const yield30 = BondsModule.calculateYield?.(productId, amount, 30) || { yield: amount * (product.apy/100) * (30/365) };
                const yield90 = BondsModule.calculateYield?.(productId, amount, 90) || { yield: amount * (product.apy/100) * (90/365) };
                const yield365 = BondsModule.calculateYield?.(productId, amount, 365) || { yield: amount * (product.apy/100) };

                modal.querySelector('#yield-30d').textContent = `+$${(yield30.yield || 0).toFixed(2)}`;
                modal.querySelector('#yield-90d').textContent = `+$${(yield90.yield || 0).toFixed(2)}`;
                modal.querySelector('#yield-365d').textContent = `+$${(yield365.yield || 0).toFixed(2)}`;
            } catch (e) {
                console.error('Yield calculation error:', e);
            }
        });

        // Confirm invest
        modal.querySelector('#btn-confirm-invest').addEventListener('click', async () => {
            const amount = parseFloat(amountInput.value);
            if (!amount || amount < product.minInvestment) {
                (window.ObeliskApp?.showNotification || console.log)(`Minimum investment is $${product.minInvestment.toLocaleString()}`, 'error');
                return;
            }

            // Demo mode check
            const isDemo = typeof DemoTrading !== 'undefined' && DemoTrading.enabled;
            const wallet = WalletManager?.currentWallet || (isDemo ? { type: 'demo', address: '0xDEMO' } : null);

            try {
                const result = await BondsModule.buyBond(
                    wallet,
                    productId,
                    amount
                );

                if (result.success) {
                    (window.ObeliskApp?.showNotification || console.log)(result.message, 'success');
                    modal.remove();
                    this.updatePortfolioSummary();
                    this.updatePositionsList();
                }
            } catch (e) {
                (window.ObeliskApp?.showNotification || console.log)(e.message, 'error');
            }
        });
    },

    showInstitutionalModal() {
        const modal = document.createElement('div');
        modal.className = 'modal inst-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Institutional Investor Application</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Access exclusive bond products with institutional-grade yields.</p>

                    <div class="inst-requirements">
                        <h4>Eligibility Requirements</h4>
                        <ul>
                            <li>Net worth of $1,000,000+ (excluding primary residence)</li>
                            <li>OR Annual income of $200,000+ for last 2 years</li>
                            <li>OR Entity with $5,000,000+ in assets</li>
                        </ul>
                    </div>

                    <div class="form-group">
                        <label>Organization Name</label>
                        <input type="text" id="inst-org-name" placeholder="Company/Fund Name"/>
                    </div>

                    <div class="form-group">
                        <label>Contact Email</label>
                        <input type="email" id="inst-email" placeholder="contact@company.com"/>
                    </div>

                    <div class="form-group">
                        <label>Expected Investment Size</label>
                        <select id="inst-size">
                            <option value="100k">$100,000 - $500,000</option>
                            <option value="500k">$500,000 - $1,000,000</option>
                            <option value="1m">$1,000,000 - $5,000,000</option>
                            <option value="5m">$5,000,000+</option>
                        </select>
                    </div>

                    <button class="btn-primary" id="btn-submit-inst">Submit Application</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove());

        modal.querySelector('#btn-submit-inst').addEventListener('click', async () => {
            const orgName = modal.querySelector('#inst-org-name').value;
            const email = modal.querySelector('#inst-email').value;

            if (!orgName || !email) {
                (window.ObeliskApp?.showNotification || console.log)('Please fill all fields', 'error');
                return;
            }

            const result = await BondsModule.requestInstitutionalVerification({
                orgName,
                email,
                size: modal.querySelector('#inst-size').value
            });

            (window.ObeliskApp?.showNotification || console.log)(result.message, 'success');
            modal.remove();
        });
    },

    updatePortfolioSummary() {
        const positions = BondsModule.getPositions().filter(p => p.status === 'active');
        const totalInvested = positions.reduce((sum, p) => sum + p.amount, 0);
        const totalYield = positions.reduce((sum, p) => sum + p.accruedYield, 0);
        const avgAPY = positions.length > 0
            ? positions.reduce((sum, p) => sum + p.apy, 0) / positions.length
            : 0;

        document.getElementById('bonds-total').textContent = `$${totalInvested.toLocaleString()}`;
        document.getElementById('bonds-yield').textContent = `+$${totalYield.toFixed(2)}`;
        document.getElementById('bonds-avg-apy').textContent = `${avgAPY.toFixed(2)}%`;
    },

    updatePositionsList() {
        const container = document.getElementById('bond-positions-list');
        const positions = BondsModule.getPositions().filter(p => p.status === 'active');

        if (positions.length === 0) {
            container.innerHTML = `
                <div class="positions-empty">
                    <span>No bond positions yet</span>
                    <span class="sub">Invest in bonds above to start earning yield</span>
                </div>
            `;
            return;
        }

        container.innerHTML = positions.map((pos, index) => `
            <div class="position-item">
                <div class="position-info">
                    <span class="position-name">${pos.product}</span>
                    <span class="position-date">Invested ${new Date(pos.purchaseDate).toLocaleDateString()}</span>
                </div>
                <div class="position-values">
                    <div class="value-col">
                        <span class="value-label">Principal</span>
                        <span class="value-amount">$${pos.amount.toLocaleString()}</span>
                    </div>
                    <div class="value-col">
                        <span class="value-label">Yield</span>
                        <span class="value-amount positive">+$${pos.accruedYield.toFixed(2)}</span>
                    </div>
                    <div class="value-col">
                        <span class="value-label">Current Value</span>
                        <span class="value-amount">$${pos.currentValue.toFixed(2)}</span>
                    </div>
                </div>
                <button class="btn-redeem" data-index="${index}">Redeem</button>
            </div>
        `).join('');

        // Add redeem handlers
        container.querySelectorAll('.btn-redeem').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const index = parseInt(e.target.dataset.index);
                try {
                    const result = await BondsModule.redeemBond(WalletManager.currentWallet, index);
                    if (result.success) {
                        (window.ObeliskApp?.showNotification || console.log)(result.message, 'success');
                        this.updatePortfolioSummary();
                        this.updatePositionsList();
                    }
                } catch (e) {
                    (window.ObeliskApp?.showNotification || console.log)(e.message, 'error');
                }
            });
        });
    }
};

// Real-time price ticker
const PriceTicker = {
    init() {
        // Subscribe to price updates
        PriceService.subscribe((prices, symbol) => {
            this.updateTradingPrice(prices);
            this.updatePriceTicker(prices);
        });

        // Initial update
        this.updateTradingPrice(PriceService.getAllPrices());
    },

    updateTradingPrice(prices) {
        const currentPair = (window.ObeliskApp?.state || {})?.currentPair || 'BTC';
        const priceData = prices[currentPair];

        if (priceData) {
            const priceEl = document.getElementById('current-price');
            const changeEl = document.getElementById('price-change');

            if (priceEl) {
                priceEl.textContent = PriceService.formatPrice(priceData.price);
                priceEl.className = `pair-price ${priceData.change24h >= 0 ? 'positive' : 'negative'}`;
            }

            if (changeEl) {
                changeEl.textContent = PriceService.formatChange(priceData.change24h);
                changeEl.className = `pair-change ${priceData.change24h >= 0 ? 'positive' : 'negative'}`;
            }
        }
    },

    updatePriceTicker(prices) {
        // Update any price ticker displays throughout the app
    }
};

// Initialize all UI modules
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize price service
    await PriceService.init();

    // Initialize modules
    await DepositWithdraw.init();
    await BondsModule.init();

    // Initialize UI
    DepositUI.init();
    BondsUI.init();
    PriceTicker.init();

    // Listen for wallet connection
    window.addEventListener('wallet-connected', () => {
        console.log('✅ Wallet connected event received');
        DepositUI.updateButtonStates();
        DepositUI.updateBalances();
        BondsUI.updatePortfolioSummary();
        BondsUI.updatePositionsList();
    });

    // Also listen for MetaMask account changes
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('MetaMask accounts changed:', accounts);
            if (accounts.length > 0) {
                DepositUI.updateButtonStates();
                DepositUI.updateBalances();
            }
        });

        // Check if already connected
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts.length > 0) {
                console.log('MetaMask already connected:', accounts[0]);
                DepositUI.updateButtonStates();
            }
        }).catch(console.error);
    }

    console.log('Banking & Bonds UI initialized!');
});

// Export for global access
window.DepositUI = DepositUI;
window.BondsUI = BondsUI;
window.PriceTicker = PriceTicker;
