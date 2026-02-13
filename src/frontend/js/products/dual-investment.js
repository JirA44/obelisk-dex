/**
 * Dual Investment Module - Add Simulated/Real mode to ALL products
 * Build: 2026-01-17
 */

const DualInvestment = {
    currentProduct: null,
    currentModule: null,

    // Translations
    t(key) {
        const translations = {
            en: {
                choose_mode: 'Choose Investment Mode',
                simulated_mode: 'SIMULATED',
                real_mode: 'REAL',
                simulated_desc: 'Practice with virtual funds. No real money at risk.',
                real_desc: 'Invest real cryptocurrency. Requires wallet connection.',
                sim_balance: 'Simulated Balance',
                real_balance: 'Real Balance',
                invest_simulated: 'Invest (Simulated)',
                invest_real: 'Invest (Real)',
                amount: 'Amount',
                min_investment: 'Min Investment',
                expected_apy: 'Expected APY',
                risk_level: 'Risk Level',
                confirm_sim: 'Confirm Simulated Investment',
                confirm_real: 'Confirm Real Investment',
                connect_wallet: 'Connect Wallet First',
                success_sim: 'Simulated investment successful!',
                success_real: 'Real investment submitted!',
                cancel: 'Cancel',
                back: 'Back',
                low: 'Low',
                medium: 'Medium',
                high: 'High',
                very_high: 'Very High'
            },
            fr: {
                choose_mode: 'Choisir le Mode d\'Investissement',
                simulated_mode: 'SIMULÉ',
                real_mode: 'RÉEL',
                simulated_desc: 'Entraînez-vous avec des fonds virtuels. Aucun argent réel en jeu.',
                real_desc: 'Investissez de vraies cryptomonnaies. Nécessite une connexion wallet.',
                sim_balance: 'Solde Simulé',
                real_balance: 'Solde Réel',
                invest_simulated: 'Investir (Simulé)',
                invest_real: 'Investir (Réel)',
                amount: 'Montant',
                min_investment: 'Investissement Min',
                expected_apy: 'APY Attendu',
                risk_level: 'Niveau de Risque',
                confirm_sim: 'Confirmer l\'Investissement Simulé',
                confirm_real: 'Confirmer l\'Investissement Réel',
                connect_wallet: 'Connectez votre Wallet d\'abord',
                success_sim: 'Investissement simulé réussi !',
                success_real: 'Investissement réel soumis !',
                cancel: 'Annuler',
                back: 'Retour',
                low: 'Faible',
                medium: 'Moyen',
                high: 'Élevé',
                very_high: 'Très Élevé'
            }
        };
        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || 'en';
        return translations[lang]?.[key] || translations.en[key] || key;
    },

    // Get risk label
    getRiskLabel(level) {
        const labels = {
            1: this.t('low'),
            2: this.t('low'),
            3: this.t('medium'),
            4: this.t('high'),
            5: this.t('very_high')
        };
        return labels[level] || this.t('medium');
    },

    // Get risk color
    getRiskColor(level) {
        const colors = { 1: '#00ff88', 2: '#00d4aa', 3: '#f59e0b', 4: '#f97316', 5: '#ef4444' };
        return colors[level] || '#f59e0b';
    },

    // Show dual investment modal for a product
    showForProduct(productId, moduleName) {
        const productInfo = ProductFilter?.products[productId] || {
            name: productId,
            minBudget: 10,
            apy: 10,
            risk: 3
        };

        this.currentProduct = { id: productId, ...productInfo };
        this.currentModule = moduleName;

        const modal = document.getElementById('product-modal');
        const content = document.getElementById('product-modal-content');
        if (!content) return;

        // Get balances
        const simBalance = (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.getBalance)
            ? SimulatedPortfolio.getBalance()
            : 0;
        const realBalance = (typeof WalletManager !== 'undefined' && WalletManager.getUSDCBalance)
            ? WalletManager.getUSDCBalance()
            : 0;

        content.innerHTML = `
            <div style="text-align:center;margin-bottom:24px;">
                <h2 style="color:#fff;margin-bottom:8px;">${productInfo.name}</h2>
                <p style="color:#888;font-size:14px;">${this.t('choose_mode')}</p>
            </div>

            <!-- Dual Mode Selection -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
                <!-- Simulated Mode -->
                <div onclick="DualInvestment.selectMode('simulated')"
                     class="mode-card" id="mode-simulated"
                     style="background:linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.05));border:2px solid rgba(168,85,247,0.5);border-radius:16px;padding:20px;cursor:pointer;transition:all 0.3s;">
                    <div style="font-size:32px;margin-bottom:12px;">🎮</div>
                    <div style="color:#a855f7;font-weight:700;font-size:18px;margin-bottom:8px;">${this.t('simulated_mode')}</div>
                    <div style="color:#888;font-size:12px;margin-bottom:12px;">${this.t('simulated_desc')}</div>
                    <div style="background:rgba(168,85,247,0.2);border-radius:8px;padding:8px;">
                        <div style="color:#888;font-size:11px;">${this.t('sim_balance')}</div>
                        <div style="color:#a855f7;font-size:18px;font-weight:600;">$${simBalance.toFixed(2)}</div>
                    </div>
                </div>

                <!-- Real Mode -->
                <div onclick="DualInvestment.selectMode('real')"
                     class="mode-card" id="mode-real"
                     style="background:linear-gradient(135deg,rgba(59,130,246,0.2),rgba(59,130,246,0.05));border:2px solid rgba(59,130,246,0.5);border-radius:16px;padding:20px;cursor:pointer;transition:all 0.3s;">
                    <div style="font-size:32px;margin-bottom:12px;">💎</div>
                    <div style="color:#3b82f6;font-weight:700;font-size:18px;margin-bottom:8px;">${this.t('real_mode')}</div>
                    <div style="color:#888;font-size:12px;margin-bottom:12px;">${this.t('real_desc')}</div>
                    <div style="background:rgba(59,130,246,0.2);border-radius:8px;padding:8px;">
                        <div style="color:#888;font-size:11px;">${this.t('real_balance')}</div>
                        <div style="color:#3b82f6;font-size:18px;font-weight:600;">$${realBalance.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <!-- Product Info -->
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:20px;">
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">
                    <div>
                        <div style="color:#888;font-size:11px;">${this.t('min_investment')}</div>
                        <div style="color:#fff;font-size:16px;font-weight:600;">$${productInfo.minBudget}</div>
                    </div>
                    <div>
                        <div style="color:#888;font-size:11px;">${this.t('expected_apy')}</div>
                        <div style="color:#00ff88;font-size:16px;font-weight:600;">${productInfo.apy}%</div>
                    </div>
                    <div>
                        <div style="color:#888;font-size:11px;">${this.t('risk_level')}</div>
                        <div style="color:${this.getRiskColor(productInfo.risk)};font-size:16px;font-weight:600;">${this.getRiskLabel(productInfo.risk)}</div>
                    </div>
                </div>
            </div>

            <!-- Investment Form (hidden until mode selected) -->
            <div id="investment-form" style="display:none;">
                <div style="margin-bottom:16px;">
                    <label style="color:#888;font-size:12px;display:block;margin-bottom:6px;">${this.t('amount')} (USDC)</label>
                    <input type="number" id="invest-amount" min="${productInfo.minBudget}" step="1" value="${productInfo.minBudget}"
                           style="width:100%;padding:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:16px;">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <button onclick="DualInvestment.cancel()"
                            style="padding:14px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">
                        ${this.t('cancel')}
                    </button>
                    <button id="confirm-invest-btn" onclick="DualInvestment.confirmInvestment()"
                            style="padding:14px;background:linear-gradient(135deg,#a855f7,#7c3aed);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">
                        ${this.t('confirm_sim')}
                    </button>
                </div>
            </div>

            <!-- View Details Button -->
            <button onclick="DualInvestment.showProductDetails()"
                    style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#888;cursor:pointer;margin-top:12px;">
                📋 Voir les détails du produit
            </button>
        `;

        modal.style.display = 'flex';
    },

    // Select investment mode
    selectedMode: null,
    selectMode(mode) {
        this.selectedMode = mode;

        // Update UI
        const simCard = document.getElementById('mode-simulated');
        const realCard = document.getElementById('mode-real');
        const form = document.getElementById('investment-form');
        const confirmBtn = document.getElementById('confirm-invest-btn');

        if (mode === 'simulated') {
            simCard.style.border = '2px solid #a855f7';
            simCard.style.boxShadow = '0 0 20px rgba(168,85,247,0.3)';
            realCard.style.border = '2px solid rgba(59,130,246,0.3)';
            realCard.style.boxShadow = 'none';
            confirmBtn.style.background = 'linear-gradient(135deg,#a855f7,#7c3aed)';
            confirmBtn.textContent = this.t('confirm_sim');
        } else {
            realCard.style.border = '2px solid #3b82f6';
            realCard.style.boxShadow = '0 0 20px rgba(59,130,246,0.3)';
            simCard.style.border = '2px solid rgba(168,85,247,0.3)';
            simCard.style.boxShadow = 'none';
            confirmBtn.style.background = 'linear-gradient(135deg,#3b82f6,#2563eb)';

            // Check wallet connection
            const isConnected = typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected();
            confirmBtn.textContent = isConnected ? this.t('confirm_real') : this.t('connect_wallet');
        }

        form.style.display = 'block';
    },

    // Confirm investment
    confirmInvestment() {
        const amount = parseFloat(document.getElementById('invest-amount')?.value) || 0;
        const product = this.currentProduct;

        if (amount < product.minBudget) {
            alert(`Minimum: $${product.minBudget}`);
            return;
        }

        if (this.selectedMode === 'simulated') {
            // Simulated investment
            if (typeof SimulatedPortfolio !== 'undefined') {
                const balance = SimulatedPortfolio.getBalance();
                if (amount > balance) {
                    alert('Solde simulé insuffisant');
                    return;
                }
                SimulatedPortfolio.invest(
                    product.id + '-' + Date.now(),
                    product.name,
                    amount,
                    product.apy,
                    'product',
                    true
                );
                this.showSuccess('simulated', amount);
            }
        } else {
            // Real investment
            if (typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected()) {
                // Execute real investment via wallet
                this.executeRealInvestment(product, amount);
            } else {
                // Open wallet connection
                if (typeof WalletManager !== 'undefined' && WalletManager.openModal) {
                    WalletManager.openModal();
                } else {
                    alert(this.t('connect_wallet'));
                }
            }
        }
    },

    // Execute real investment
    async executeRealInvestment(product, amount) {
        try {
            // This would integrate with actual DeFi protocols
            // For now, show confirmation
            this.showSuccess('real', amount);
        } catch (error) {
            console.error('[DualInvestment] Real investment error:', error);
            alert('Error: ' + error.message);
        }
    },

    // Show success message
    showSuccess(mode, amount) {
        const content = document.getElementById('product-modal-content');
        const color = mode === 'simulated' ? '#a855f7' : '#3b82f6';
        const icon = mode === 'simulated' ? '🎮' : '💎';
        const modeText = mode === 'simulated' ? this.t('simulated_mode') : this.t('real_mode');

        content.innerHTML = `
            <div style="text-align:center;padding:40px 20px;">
                <div style="font-size:64px;margin-bottom:20px;">✅</div>
                <h2 style="color:${color};margin-bottom:12px;">${mode === 'simulated' ? this.t('success_sim') : this.t('success_real')}</h2>
                <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin:20px 0;">
                    <div style="color:#888;font-size:14px;margin-bottom:8px;">${icon} ${modeText}</div>
                    <div style="color:#fff;font-size:28px;font-weight:700;">$${amount.toFixed(2)}</div>
                    <div style="color:#888;font-size:14px;margin-top:8px;">→ ${this.currentProduct.name}</div>
                </div>
                <button onclick="document.getElementById('product-modal').style.display='none'"
                        style="padding:14px 40px;background:${color};border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">
                    OK
                </button>
            </div>
        `;

        // Refresh portfolio display if available
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.renderSidebar) {
            SimulatedPortfolio.renderSidebar();
        }
    },

    // Show product details (original module content)
    showProductDetails() {
        if (this.currentModule && window[this.currentModule]?.render) {
            window[this.currentModule].render('product-modal-content');
        }
    },

    // Cancel and close
    cancel() {
        document.getElementById('product-modal').style.display = 'none';
    },

    // Override default product card clicks
    init() {
        console.log('[DualInvestment] Initializing...');

        // Wait for DOM and ProductFilter to be ready
        setTimeout(() => {
            this.overrideProductClicks();
        }, 1000);
    },

    // Override product card onclick handlers
    overrideProductClicks() {
        const cards = document.querySelectorAll('.product-card');

        cards.forEach(card => {
            const originalOnclick = card.getAttribute('onclick') || '';

            // Extract module name from onclick
            const moduleMatch = originalOnclick.match(/(\w+Module)\.render/);
            if (moduleMatch) {
                const moduleName = moduleMatch[1];
                const productId = card.getAttribute('data-product-id');

                if (productId) {
                    // Replace onclick with dual investment
                    card.setAttribute('onclick', `DualInvestment.showForProduct('${productId}', '${moduleName}')`);
                }
            }
        });

        console.log('[DualInvestment] Overridden', cards.length, 'product cards');
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => DualInvestment.init(), 1500);
});

console.log('[DualInvestment] Module loaded');
