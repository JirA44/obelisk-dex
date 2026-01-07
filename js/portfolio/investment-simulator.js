/**
 * OBELISK DEX - Investment Simulator
 * Allows users to simulate investment returns before investing
 */

const InvestmentSimulator = {
    isOpen: false,

    // Available investment products with APY
    products: [
        { id: 'usdc-savings', name: 'USDC Savings', apy: 5.5, risk: 'low', icon: '💵', category: 'savings' },
        { id: 'eth-staking', name: 'ETH Staking (stETH)', apy: 4.2, risk: 'low', icon: '🔷', category: 'staking' },
        { id: 'sol-staking', name: 'SOL Staking', apy: 7.5, risk: 'low', icon: '🟣', category: 'staking' },
        { id: 'stable-vault', name: 'Stable Yield Vault', apy: 6.0, risk: 'low', icon: '🏛️', category: 'vault', protection: 100 },
        { id: 'bluechip-vault', name: 'Blue Chip Vault', apy: 4.2, risk: 'low', icon: '💎', category: 'vault', protection: 100 },
        { id: 'defi-vault', name: 'DeFi Safe Vault', apy: 8.8, risk: 'medium', icon: '🔐', category: 'vault', protection: 95 },
        { id: 'emerging-vault', name: 'Emerging Markets', apy: 11.0, risk: 'medium', icon: '🚀', category: 'vault', protection: 90 },
        { id: 'usdc-lending', name: 'USDC Lending', apy: 8.0, risk: 'low', icon: '💳', category: 'lending' },
        { id: 'eth-lending', name: 'ETH Lending', apy: 3.5, risk: 'low', icon: '🔷', category: 'lending' },
        { id: 'arb-staking', name: 'ARB Staking', apy: 12.0, risk: 'medium', icon: '🔵', category: 'staking' },
        { id: 'treasury-bond', name: 'Treasury Bond (6mo)', apy: 5.1, risk: 'very-low', icon: '📜', category: 'bond' },
        { id: 'corp-bond', name: 'Corp Bond AAA', apy: 6.5, risk: 'low', icon: '📋', category: 'bond' }
    ],

    // Combo strategies
    combos: [
        { id: 'conservative', name: 'Conservative', apy: 5.2, allocation: '60% Savings, 40% Bonds', icon: '🛡️' },
        { id: 'balanced', name: 'Balanced', apy: 7.5, allocation: '40% Staking, 30% Vaults, 30% Bonds', icon: '⚖️' },
        { id: 'growth', name: 'Growth', apy: 9.8, allocation: '50% Vaults, 30% Staking, 20% Lending', icon: '📈' },
        { id: 'aggressive', name: 'Aggressive', apy: 12.5, allocation: '60% High-Yield Vaults, 40% Staking', icon: '🔥' }
    ],

    init() {
        this.addSimulatorButton();
        this.addKeyboardShortcut();
        console.log('📊 Investment Simulator initialized (Press S to open)');
    },

    addSimulatorButton() {
        // Add floating button
        const btn = document.createElement('button');
        btn.id = 'simulator-fab';
        btn.innerHTML = '📊 Simulator';
        btn.onclick = () => this.open();
        btn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #00aaff);
            color: #000;
            border: none;
            padding: 12px 20px;
            border-radius: 30px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            z-index: 8000;
            box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
            transition: all 0.3s;
        `;
        btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        document.body.appendChild(btn);
    },

    addKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 's' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                const activeEl = document.activeElement;
                if (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA') {
                    this.toggle();
                }
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.render();
    },

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        const overlay = document.getElementById('simulator-overlay');
        if (overlay) overlay.remove();
    },

    render() {
        const existing = document.getElementById('simulator-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'simulator-overlay';
        overlay.innerHTML = `
            <div class="simulator-modal">
                <div class="simulator-header">
                    <h2>📊 Investment Simulator</h2>
                    <p class="simulator-subtitle">Simulate your potential returns before investing</p>
                    <button class="simulator-close" onclick="InvestmentSimulator.close()">✕</button>
                </div>

                <div class="simulator-body">
                    <!-- Investment Amount -->
                    <div class="sim-section">
                        <label>💰 Investment Amount (USDC)</label>
                        <div class="amount-input-container">
                            <input type="number" id="sim-amount" value="1000" min="1" step="100" onchange="InvestmentSimulator.calculate()">
                            <div class="quick-amounts">
                                <button onclick="InvestmentSimulator.setAmount(100)">$100</button>
                                <button onclick="InvestmentSimulator.setAmount(500)">$500</button>
                                <button onclick="InvestmentSimulator.setAmount(1000)">$1K</button>
                                <button onclick="InvestmentSimulator.setAmount(5000)">$5K</button>
                                <button onclick="InvestmentSimulator.setAmount(10000)">$10K</button>
                            </div>
                        </div>
                    </div>

                    <!-- Investment Duration -->
                    <div class="sim-section">
                        <label>📅 Duration</label>
                        <div class="duration-selector">
                            <button class="dur-btn active" data-days="30" onclick="InvestmentSimulator.setDuration(30)">1 Month</button>
                            <button class="dur-btn" data-days="90" onclick="InvestmentSimulator.setDuration(90)">3 Months</button>
                            <button class="dur-btn" data-days="180" onclick="InvestmentSimulator.setDuration(180)">6 Months</button>
                            <button class="dur-btn" data-days="365" onclick="InvestmentSimulator.setDuration(365)">1 Year</button>
                            <button class="dur-btn" data-days="1825" onclick="InvestmentSimulator.setDuration(1825)">5 Years</button>
                        </div>
                    </div>

                    <!-- Product Selection -->
                    <div class="sim-section">
                        <label>🎯 Investment Strategy</label>
                        <div class="strategy-tabs">
                            <button class="strat-tab active" data-type="single" onclick="InvestmentSimulator.showStrategy('single')">Single Product</button>
                            <button class="strat-tab" data-type="combo" onclick="InvestmentSimulator.showStrategy('combo')">Combo Strategy</button>
                            <button class="strat-tab" data-type="compare" onclick="InvestmentSimulator.showStrategy('compare')">Compare All</button>
                        </div>

                        <div id="strategy-content">
                            ${this.renderSingleProductSelector()}
                        </div>
                    </div>

                    <!-- Results -->
                    <div class="sim-results" id="sim-results">
                        ${this.renderResults(1000, 30, this.products[0])}
                    </div>

                    <!-- Investment Action -->
                    <div class="sim-action">
                        <button class="btn-simulate" onclick="InvestmentSimulator.calculate()">
                            🔄 Recalculate
                        </button>
                        <button class="btn-invest-now" onclick="InvestmentSimulator.investNow()">
                            💰 Invest Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.2s ease;
        `;

        document.body.appendChild(overlay);
        this.injectStyles();
        this.calculate();
    },

    renderSingleProductSelector() {
        return `
            <div class="products-selector">
                ${this.products.map((p, i) => `
                    <label class="product-option ${i === 0 ? 'selected' : ''}">
                        <input type="radio" name="sim-product" value="${p.id}" ${i === 0 ? 'checked' : ''} onchange="InvestmentSimulator.calculate()">
                        <span class="product-icon">${p.icon}</span>
                        <span class="product-name">${p.name}</span>
                        <span class="product-apy">${p.apy}% APY</span>
                        <span class="product-risk risk-${p.risk}">${p.risk.toUpperCase()}</span>
                    </label>
                `).join('')}
            </div>
        `;
    },

    renderComboSelector() {
        return `
            <div class="combos-selector">
                ${this.combos.map((c, i) => `
                    <label class="combo-option ${i === 0 ? 'selected' : ''}">
                        <input type="radio" name="sim-combo" value="${c.id}" ${i === 0 ? 'checked' : ''} onchange="InvestmentSimulator.calculate()">
                        <div class="combo-header">
                            <span class="combo-icon">${c.icon}</span>
                            <span class="combo-name">${c.name}</span>
                            <span class="combo-apy">${c.apy}% APY</span>
                        </div>
                        <p class="combo-allocation">${c.allocation}</p>
                    </label>
                `).join('')}
            </div>
        `;
    },

    renderCompareView() {
        return `
            <div class="compare-info">
                <p>📊 Compare all products side by side to find the best strategy for your goals.</p>
            </div>
        `;
    },

    showStrategy(type) {
        document.querySelectorAll('.strat-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.strat-tab[data-type="${type}"]`).classList.add('active');

        const content = document.getElementById('strategy-content');
        switch(type) {
            case 'single':
                content.innerHTML = this.renderSingleProductSelector();
                break;
            case 'combo':
                content.innerHTML = this.renderComboSelector();
                break;
            case 'compare':
                content.innerHTML = this.renderCompareView();
                break;
        }
        this.calculate();
    },

    setAmount(amount) {
        document.getElementById('sim-amount').value = amount;
        this.calculate();
    },

    setDuration(days) {
        document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.dur-btn[data-days="${days}"]`).classList.add('active');
        this.calculate();
    },

    getDuration() {
        const activeBtn = document.querySelector('.dur-btn.active');
        return parseInt(activeBtn?.dataset.days || 30);
    },

    getSelectedProduct() {
        const activeTab = document.querySelector('.strat-tab.active');
        const type = activeTab?.dataset.type || 'single';

        if (type === 'single') {
            const selected = document.querySelector('input[name="sim-product"]:checked');
            return this.products.find(p => p.id === selected?.value) || this.products[0];
        } else if (type === 'combo') {
            const selected = document.querySelector('input[name="sim-combo"]:checked');
            return this.combos.find(c => c.id === selected?.value) || this.combos[0];
        }
        return null;
    },

    calculate() {
        const amount = parseFloat(document.getElementById('sim-amount')?.value) || 1000;
        const days = this.getDuration();
        const activeTab = document.querySelector('.strat-tab.active');
        const type = activeTab?.dataset.type || 'single';

        const resultsDiv = document.getElementById('sim-results');
        if (!resultsDiv) return;

        if (type === 'compare') {
            resultsDiv.innerHTML = this.renderComparisonResults(amount, days);
        } else {
            const product = this.getSelectedProduct();
            resultsDiv.innerHTML = this.renderResults(amount, days, product);
        }
    },

    calculateReturns(principal, apy, days) {
        // Compound interest formula: A = P(1 + r/n)^(nt)
        // Using daily compounding (n = 365)
        const rate = apy / 100;
        const years = days / 365;
        const compounded = principal * Math.pow(1 + rate / 365, 365 * years);
        return {
            finalAmount: compounded,
            earnings: compounded - principal,
            effectiveAPY: apy
        };
    },

    renderResults(amount, days, product) {
        if (!product) return '';

        const result = this.calculateReturns(amount, product.apy, days);
        const durationLabel = this.getDurationLabel(days);
        const dailyEarnings = result.earnings / days;
        const monthlyEarnings = dailyEarnings * 30;

        return `
            <div class="results-header">
                <span class="result-icon">${product.icon}</span>
                <span class="result-product">${product.name}</span>
            </div>

            <div class="results-grid">
                <div class="result-card main">
                    <span class="result-label">Total After ${durationLabel}</span>
                    <span class="result-value large">$${result.finalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="result-card earnings">
                    <span class="result-label">Total Earnings</span>
                    <span class="result-value positive">+$${result.earnings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            </div>

            <div class="results-breakdown">
                <div class="breakdown-item">
                    <span>📅 Daily Earnings</span>
                    <span class="positive">+$${dailyEarnings.toFixed(2)}</span>
                </div>
                <div class="breakdown-item">
                    <span>📆 Monthly Earnings</span>
                    <span class="positive">+$${monthlyEarnings.toFixed(2)}</span>
                </div>
                <div class="breakdown-item">
                    <span>📈 APY</span>
                    <span class="apy-badge">${product.apy}%</span>
                </div>
                ${product.protection ? `
                <div class="breakdown-item protection">
                    <span>🛡️ Capital Protection</span>
                    <span class="protection-badge">${product.protection}%</span>
                </div>
                ` : ''}
            </div>

            <div class="projection-chart" id="projection-chart">
                ${this.renderMiniChart(amount, product.apy, days)}
            </div>
        `;
    },

    renderComparisonResults(amount, days) {
        const durationLabel = this.getDurationLabel(days);
        const allProducts = [...this.products, ...this.combos.map(c => ({...c, category: 'combo'}))];

        // Sort by earnings
        const results = allProducts.map(p => ({
            ...p,
            ...this.calculateReturns(amount, p.apy, days)
        })).sort((a, b) => b.earnings - a.earnings);

        return `
            <div class="comparison-header">
                <h3>📊 Comparison - ${durationLabel}</h3>
                <p>Starting with $${amount.toLocaleString()}</p>
            </div>

            <div class="comparison-table">
                <div class="comparison-row header">
                    <span>Product</span>
                    <span>APY</span>
                    <span>Earnings</span>
                    <span>Final</span>
                </div>
                ${results.slice(0, 8).map((r, i) => `
                    <div class="comparison-row ${i === 0 ? 'best' : ''}">
                        <span class="prod-name">
                            ${i === 0 ? '🏆 ' : ''}${r.icon} ${r.name}
                        </span>
                        <span class="prod-apy">${r.apy}%</span>
                        <span class="prod-earnings positive">+$${r.earnings.toFixed(2)}</span>
                        <span class="prod-final">$${r.finalAmount.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="comparison-chart">
                ${this.renderComparisonChart(results.slice(0, 5), amount)}
            </div>
        `;
    },

    renderMiniChart(amount, apy, totalDays) {
        const points = [];
        const steps = 12;
        const stepDays = totalDays / steps;

        for (let i = 0; i <= steps; i++) {
            const days = stepDays * i;
            const result = this.calculateReturns(amount, apy, days);
            points.push({
                x: (i / steps) * 100,
                y: result.finalAmount
            });
        }

        const maxY = points[points.length - 1].y;
        const minY = amount;
        const range = maxY - minY;

        const pathD = points.map((p, i) => {
            const y = 100 - ((p.y - minY) / range) * 80 - 10;
            return `${i === 0 ? 'M' : 'L'} ${p.x} ${y}`;
        }).join(' ');

        return `
            <svg viewBox="0 0 100 100" class="mini-chart">
                <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#00ff88;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#00ff88;stop-opacity:0" />
                    </linearGradient>
                </defs>
                <path d="${pathD} L 100 100 L 0 100 Z" fill="url(#chartGradient)" />
                <path d="${pathD}" fill="none" stroke="#00ff88" stroke-width="2" />
                ${points.map((p, i) => i === points.length - 1 ? `<circle cx="${p.x}" cy="${100 - ((p.y - minY) / range) * 80 - 10}" r="3" fill="#00ff88" />` : '').join('')}
            </svg>
            <div class="chart-labels">
                <span>Start</span>
                <span>Growth over ${this.getDurationLabel(totalDays)}</span>
                <span>End</span>
            </div>
        `;
    },

    renderComparisonChart(results, amount) {
        const maxEarnings = results[0].earnings;

        return `
            <div class="bar-chart">
                ${results.map((r, i) => `
                    <div class="bar-row">
                        <span class="bar-label">${r.icon}</span>
                        <div class="bar-container">
                            <div class="bar" style="width: ${(r.earnings / maxEarnings) * 100}%"></div>
                            <span class="bar-value">+$${r.earnings.toFixed(0)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getDurationLabel(days) {
        if (days === 30) return '1 Month';
        if (days === 90) return '3 Months';
        if (days === 180) return '6 Months';
        if (days === 365) return '1 Year';
        if (days === 1825) return '5 Years';
        return `${days} Days`;
    },

    investNow() {
        const product = this.getSelectedProduct();
        const amount = parseFloat(document.getElementById('sim-amount')?.value) || 0;

        if (!product) {
            if (typeof showNotification === 'function') {
                showNotification('Selectionnez un produit', 'error');
            }
            return;
        }

        if (amount <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Montant invalide', 'error');
            }
            return;
        }

        // Check if SimulatedPortfolio is available
        if (typeof SimulatedPortfolio !== 'undefined') {
            const result = SimulatedPortfolio.invest(
                product.id,
                product.name,
                amount,
                product.apy,
                product.category || 'general',
                true  // isSimulated = true
            );

            if (result.success) {
                this.close();
                if (typeof showNotification === 'function') {
                    showNotification(`$${amount.toLocaleString()} investi dans ${product.name}!`, 'success');
                }
            } else {
                if (typeof showNotification === 'function') {
                    showNotification(result.error || 'Erreur investissement', 'error');
                }
            }
        } else {
            // Fallback: navigate to investments tab
            this.close();
            const investTab = document.querySelector('[data-tab="investments"]');
            if (investTab) investTab.click();
            if (typeof showNotification === 'function') {
                showNotification(`Navigate to ${product.name} to invest`, 'info');
            }
        }
    },

    injectStyles() {
        if (document.getElementById('simulator-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'simulator-styles';
        styles.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .simulator-modal {
                background: linear-gradient(180deg, #0a0a0f 0%, #0f1419 100%);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 20px;
                width: 95%;
                max-width: 700px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 255, 136, 0.2);
            }

            .simulator-header {
                padding: 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                position: relative;
            }

            .simulator-header h2 {
                margin: 0;
                font-size: 24px;
                color: #fff;
            }

            .simulator-subtitle {
                margin: 8px 0 0;
                color: #888;
                font-size: 14px;
            }

            .simulator-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
                transition: color 0.3s;
            }

            .simulator-close:hover {
                color: #fff;
            }

            .simulator-body {
                padding: 24px;
            }

            .sim-section {
                margin-bottom: 24px;
            }

            .sim-section label {
                display: block;
                color: #00ff88;
                font-weight: 600;
                margin-bottom: 12px;
                font-size: 14px;
            }

            .amount-input-container input {
                width: 100%;
                padding: 16px;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(0, 255, 136, 0.3);
                border-radius: 12px;
                color: #fff;
                font-size: 24px;
                font-weight: 700;
                text-align: center;
                transition: all 0.3s;
            }

            .amount-input-container input:focus {
                outline: none;
                border-color: #00ff88;
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
            }

            .quick-amounts {
                display: flex;
                gap: 8px;
                margin-top: 12px;
                flex-wrap: wrap;
            }

            .quick-amounts button {
                flex: 1;
                min-width: 60px;
                padding: 8px 12px;
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 8px;
                color: #00ff88;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }

            .quick-amounts button:hover {
                background: rgba(0, 255, 136, 0.2);
            }

            .duration-selector {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .dur-btn {
                flex: 1;
                min-width: 80px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #888;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }

            .dur-btn:hover {
                background: rgba(0, 255, 136, 0.1);
                color: #fff;
            }

            .dur-btn.active {
                background: rgba(0, 255, 136, 0.2);
                border-color: #00ff88;
                color: #00ff88;
            }

            .strategy-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
            }

            .strat-tab {
                flex: 1;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #888;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }

            .strat-tab:hover {
                background: rgba(0, 170, 255, 0.1);
                color: #fff;
            }

            .strat-tab.active {
                background: rgba(0, 170, 255, 0.2);
                border-color: #00aaff;
                color: #00aaff;
            }

            .products-selector {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
                max-height: 200px;
                overflow-y: auto;
                padding: 4px;
            }

            .product-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .product-option:hover {
                background: rgba(0, 255, 136, 0.05);
                border-color: rgba(0, 255, 136, 0.3);
            }

            .product-option.selected, .product-option:has(input:checked) {
                background: rgba(0, 255, 136, 0.1);
                border-color: #00ff88;
            }

            .product-option input {
                display: none;
            }

            .product-icon {
                font-size: 20px;
            }

            .product-name {
                flex: 1;
                font-size: 12px;
                color: #fff;
            }

            .product-apy {
                font-size: 11px;
                color: #00ff88;
                font-weight: 600;
            }

            .product-risk {
                font-size: 9px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }

            .risk-very-low { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
            .risk-low { background: rgba(0, 200, 100, 0.2); color: #00c864; }
            .risk-medium { background: rgba(255, 170, 0, 0.2); color: #ffaa00; }
            .risk-high { background: rgba(255, 68, 68, 0.2); color: #ff4444; }

            .combos-selector {
                display: grid;
                gap: 12px;
            }

            .combo-option {
                padding: 16px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .combo-option:hover {
                background: rgba(0, 255, 136, 0.05);
                border-color: rgba(0, 255, 136, 0.3);
            }

            .combo-option.selected, .combo-option:has(input:checked) {
                background: rgba(0, 255, 136, 0.1);
                border-color: #00ff88;
            }

            .combo-option input {
                display: none;
            }

            .combo-header {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .combo-icon {
                font-size: 24px;
            }

            .combo-name {
                flex: 1;
                font-weight: 600;
                color: #fff;
            }

            .combo-apy {
                color: #00ff88;
                font-weight: 700;
                font-size: 16px;
            }

            .combo-allocation {
                margin: 8px 0 0;
                font-size: 12px;
                color: #888;
            }

            .compare-info {
                padding: 16px;
                background: rgba(0, 170, 255, 0.1);
                border-radius: 12px;
                text-align: center;
            }

            .compare-info p {
                margin: 0;
                color: #00aaff;
            }

            .sim-results {
                background: rgba(0, 255, 136, 0.05);
                border: 1px solid rgba(0, 255, 136, 0.2);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .results-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .result-icon {
                font-size: 32px;
            }

            .result-product {
                font-size: 18px;
                font-weight: 600;
                color: #fff;
            }

            .results-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 16px;
            }

            .result-card {
                padding: 16px;
                border-radius: 12px;
                text-align: center;
            }

            .result-card.main {
                background: rgba(0, 255, 136, 0.15);
            }

            .result-card.earnings {
                background: rgba(0, 170, 255, 0.15);
            }

            .result-label {
                display: block;
                font-size: 12px;
                color: #888;
                margin-bottom: 8px;
            }

            .result-value {
                font-size: 20px;
                font-weight: 700;
                color: #fff;
            }

            .result-value.large {
                font-size: 28px;
                color: #00ff88;
            }

            .result-value.positive {
                color: #00aaff;
            }

            .results-breakdown {
                display: grid;
                gap: 8px;
            }

            .breakdown-item {
                display: flex;
                justify-content: space-between;
                padding: 10px 12px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                font-size: 13px;
            }

            .breakdown-item span:first-child {
                color: #888;
            }

            .positive {
                color: #00ff88 !important;
            }

            .apy-badge {
                background: rgba(0, 255, 136, 0.2);
                color: #00ff88;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 600;
            }

            .protection-badge {
                background: rgba(0, 170, 255, 0.2);
                color: #00aaff;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 600;
            }

            .projection-chart {
                margin-top: 16px;
            }

            .mini-chart {
                width: 100%;
                height: 80px;
            }

            .chart-labels {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                color: #666;
                margin-top: 4px;
            }

            .comparison-header {
                text-align: center;
                margin-bottom: 16px;
            }

            .comparison-header h3 {
                margin: 0;
                color: #fff;
            }

            .comparison-header p {
                margin: 4px 0 0;
                color: #888;
                font-size: 13px;
            }

            .comparison-table {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
                overflow: hidden;
            }

            .comparison-row {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                font-size: 13px;
                align-items: center;
            }

            .comparison-row.header {
                background: rgba(255, 255, 255, 0.05);
                font-weight: 600;
                color: #888;
                font-size: 11px;
                text-transform: uppercase;
            }

            .comparison-row.best {
                background: rgba(0, 255, 136, 0.1);
            }

            .prod-name {
                color: #fff;
            }

            .prod-apy {
                color: #00ff88;
                font-weight: 600;
            }

            .prod-earnings {
                font-weight: 600;
            }

            .prod-final {
                color: #888;
            }

            .bar-chart {
                margin-top: 16px;
            }

            .bar-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
            }

            .bar-label {
                width: 30px;
                text-align: center;
                font-size: 20px;
            }

            .bar-container {
                flex: 1;
                position: relative;
                height: 24px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
                overflow: hidden;
            }

            .bar {
                height: 100%;
                background: linear-gradient(90deg, #00ff88, #00aaff);
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .bar-value {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 11px;
                font-weight: 600;
                color: #fff;
            }

            .sim-action {
                display: flex;
                gap: 12px;
            }

            .btn-simulate, .btn-invest-now {
                flex: 1;
                padding: 14px 20px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn-simulate {
                background: rgba(0, 170, 255, 0.2);
                border: 1px solid rgba(0, 170, 255, 0.4);
                color: #00aaff;
            }

            .btn-simulate:hover {
                background: rgba(0, 170, 255, 0.3);
            }

            .btn-invest-now {
                background: linear-gradient(135deg, #00ff88 0%, #00aa55 100%);
                border: none;
                color: #000;
            }

            .btn-invest-now:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
            }

            @media (max-width: 600px) {
                .results-grid {
                    grid-template-columns: 1fr;
                }

                .comparison-row {
                    grid-template-columns: 1.5fr 1fr 1fr;
                }

                .comparison-row span:last-child {
                    display: none;
                }

                .products-selector {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InvestmentSimulator.init());
} else {
    InvestmentSimulator.init();
}

window.InvestmentSimulator = InvestmentSimulator;

console.log('📊 Investment Simulator loaded. Press S or click the button to open.');
