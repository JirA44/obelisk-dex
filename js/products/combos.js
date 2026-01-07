// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - COMBOS MODULE
// Investment combo products with auto-allocation
// ═══════════════════════════════════════════════════════════════════════════════

const CombosModule = {
    combos: [],
    selectedCombo: null,

    // Combo definitions (static data - no API needed)
    comboData: [
        {
            id: 'CONSERVATIVE_YIELD',
            name: 'Conservative Yield',
            icon: '🛡️',
            description: 'Maximum security with stable returns',
            riskLevel: 'Low',
            expectedApy: '5-12%',
            capitalProtection: '95%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDC Staking', percent: 40, color: '#00d4aa', apy: '4-6%', maxLoss: 2 },
                { product: 'Treasury Bonds', percent: 35, color: '#4a9eff', apy: '5-8%', maxLoss: 3 },
                { product: 'Stable Vault', percent: 25, color: '#9966ff', apy: '6-10%', maxLoss: 5 }
            ]
        },
        {
            id: 'BLUE_CHIP_COMBO',
            name: 'Blue Chip Combo',
            icon: '💎',
            description: 'Focus on BTC & ETH with yield optimization',
            riskLevel: 'Medium',
            expectedApy: '15-25%',
            capitalProtection: '80%',
            minInvestment: 250,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Staking', percent: 35, color: '#627eea', apy: '8-12%', maxLoss: 15 },
                { product: 'BTC/ETH Vault', percent: 30, color: '#f7931a', apy: '15-25%', maxLoss: 25 },
                { product: 'DCA Mix', percent: 25, color: '#00d4aa', apy: '10-20%', maxLoss: 20 },
                { product: 'Bonds', percent: 10, color: '#4a9eff', apy: '5-8%', maxLoss: 5 }
            ]
        },
        {
            id: 'GROWTH_PORTFOLIO',
            name: 'Growth Portfolio',
            icon: '📈',
            description: 'Balanced growth with diversified altcoins',
            riskLevel: 'Medium',
            expectedApy: '20-35%',
            capitalProtection: '70%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'L1 Staking', percent: 30, color: '#00d4aa', apy: '12-18%', maxLoss: 20 },
                { product: 'DeFi Vault', percent: 25, color: '#ff6b9d', apy: '20-35%', maxLoss: 35 },
                { product: 'Altcoin DCA', percent: 25, color: '#ffaa00', apy: '25-50%', maxLoss: 40 },
                { product: 'LP Farming', percent: 20, color: '#9966ff', apy: '15-30%', maxLoss: 30 }
            ]
        },
        {
            id: 'DEGEN_MAX',
            name: 'Degen Max',
            icon: '🚀',
            description: 'High risk, high reward strategies',
            riskLevel: 'High',
            expectedApy: '40-80%',
            capitalProtection: '50%',
            minInvestment: 1000,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Leverage Vault', percent: 35, color: '#ff6464', apy: '50-100%', maxLoss: 60 },
                { product: 'Meme DCA', percent: 25, color: '#ffaa00', apy: '40-80%', maxLoss: 70 },
                { product: 'New Listings', percent: 25, color: '#00ff88', apy: '30-60%', maxLoss: 50 },
                { product: 'Arbitrage', percent: 15, color: '#4a9eff', apy: '20-40%', maxLoss: 25 }
            ]
        },
        {
            id: 'PASSIVE_INCOME',
            name: 'Passive Income',
            icon: '💰',
            description: 'Steady yield from staking and lending',
            riskLevel: 'Low',
            expectedApy: '8-15%',
            capitalProtection: '90%',
            minInvestment: 200,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Multi-Chain Staking', percent: 50, color: '#00d4aa', apy: '6-10%', maxLoss: 8 },
                { product: 'Lending Protocol', percent: 30, color: '#4a9eff', apy: '8-12%', maxLoss: 10 },
                { product: 'Stable LP', percent: 20, color: '#9966ff', apy: '10-15%', maxLoss: 12 }
            ]
        },
        {
            id: 'AI_QUANT',
            name: 'AI Quant Strategy',
            icon: '🤖',
            description: 'AI-driven market neutral strategies',
            riskLevel: 'Medium',
            expectedApy: '25-40%',
            capitalProtection: '75%',
            minInvestment: 500,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Grid Trading', percent: 30, color: '#00d4aa', apy: '20-35%', maxLoss: 20 },
                { product: 'Mean Reversion', percent: 25, color: '#627eea', apy: '25-40%', maxLoss: 25 },
                { product: 'Momentum', percent: 25, color: '#ffaa00', apy: '30-50%', maxLoss: 35 },
                { product: 'Arbitrage', percent: 20, color: '#ff6b9d', apy: '15-25%', maxLoss: 15 }
            ]
        }
    ],

    init() {
        // Translate UI when language changes
        if (typeof I18n !== 'undefined') {
            document.addEventListener('languageChanged', () => this.render());
        }
        this.combos = this.comboData;
        this.render();
        this.bindEvents();
        console.log('[Combos] Module initialized with', this.combos.length, 'combos');
    },

    render(filter = 'all') {
        const grid = document.getElementById('combosGrid');
        if (!grid) return;

        const filtered = filter === 'all'
            ? this.combos
            : this.combos.filter(c => c.riskLevel === filter || c.riskLevel.includes(filter));

        grid.innerHTML = filtered.map(combo => this.renderComboCard(combo)).join('');
    },

    renderComboCard(combo) {
        const riskColors = {
            'Low': '#00ff88',
            'Medium': '#ffaa00',
            'High': '#ff6464'
        };
        const riskColor = riskColors[combo.riskLevel] || '#888';

        return `
            <div class="combo-card" data-id="${combo.id}" style="
                background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                border: 1px solid #333;
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s ease;
                cursor: pointer;
            " onmouseover="this.style.borderColor='#00d4aa';this.style.transform='translateY(-4px)'"
               onmouseout="this.style.borderColor='#333';this.style.transform='translateY(0)'">

                <!-- Header -->
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                    <span style="font-size:2rem;">${combo.icon}</span>
                    <div>
                        <h3 style="color:#fff;margin:0;font-size:1.2rem;">${combo.name}</h3>
                        <span style="color:${riskColor};font-size:0.85rem;border:1px solid ${riskColor};padding:2px 8px;border-radius:12px;">${combo.riskLevel} Risk</span>
                    </div>
                </div>

                <p style="color:#888;font-size:0.9rem;margin-bottom:16px;">${combo.description}</p>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
                    <div style="text-align:center;">
                        <div style="color:#00ff88;font-size:1.1rem;font-weight:600;">${combo.expectedApy}</div>
                        <div style="color:#666;font-size:0.75rem;">APY</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#4a9eff;font-size:1.1rem;font-weight:600;">${combo.capitalProtection}</div>
                        <div style="color:#666;font-size:0.75rem;">Protection</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#fff;font-size:1.1rem;font-weight:600;">$${combo.minInvestment}</div>
                        <div style="color:#666;font-size:0.75rem;">Minimum</div>
                    </div>
                </div>

                <!-- Allocation Bar -->
                <div style="margin-bottom:16px;">
                    <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;">
                        ${combo.allocation.map(a => `<div style="width:${a.percent}%;background:${a.color};"></div>`).join('')}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                        ${combo.allocation.map(a => `
                            <span style="font-size:0.7rem;color:#888;">
                                <span style="color:${a.color};">●</span> ${a.product} ${a.percent}%
                            </span>
                        `).join('')}
                    </div>
                </div>

                <!-- Actions -->
                <div style="display:flex;gap:10px;">
                    <button onclick="CombosModule.openInvestModal('${combo.id}')" style="
                        flex:1;
                        padding:12px;
                        border-radius:8px;
                        border:none;
                        background:linear-gradient(135deg,#00d4aa,#00a884);
                        color:#fff;
                        font-weight:600;
                        cursor:pointer;
                        transition:opacity 0.2s;
                    " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        Investir
                    </button>
                    <button onclick="CombosModule.showDetails('${combo.id}')" style="
                        padding:12px 16px;
                        border-radius:8px;
                        border:1px solid #333;
                        background:transparent;
                        color:#888;
                        cursor:pointer;
                        transition:all 0.2s;
                    " onmouseover="this.style.borderColor='#00d4aa';this.style.color='#00d4aa'"
                       onmouseout="this.style.borderColor='#333';this.style.color='#888'">
                        Détails
                    </button>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.combo-filter, [data-risk]').forEach(btn => {
            if (btn.closest('#comboFilters')) {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.combo-filter').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const risk = e.target.dataset.risk;
                    this.render(risk);
                });
            }
        });

        // Amount input change
        const amountInput = document.getElementById('comboInvestAmount');
        if (amountInput) {
            amountInput.addEventListener('input', () => this.updatePreview());
        }
    },

    openInvestModal(comboId) {
        this.selectedCombo = this.combos.find(c => c.id === comboId);
        if (!this.selectedCombo) return;

        const modal = document.getElementById('comboInvestModal');
        const title = document.getElementById('modalComboTitle');
        const amountInput = document.getElementById('comboInvestAmount');

        const lang = (typeof I18n !== 'undefined') ? I18n.currentLang : 'en';
        const investIn = lang === 'fr' ? 'Investir dans' : lang === 'es' ? 'Invertir en' : lang === 'de' ? 'Investieren in' : 'Invest in';
        title.textContent = investIn + ' ' + this.selectedCombo.name;
        amountInput.value = this.selectedCombo.minInvestment;
        modal.style.display = 'flex';

        this.updatePreview();
    },

    closeModal() {
        const modal = document.getElementById('comboInvestModal');
        if (modal) modal.style.display = 'none';
        this.selectedCombo = null;
    },

    updatePreview() {
        const preview = document.getElementById('comboInvestPreview');
        const amountInput = document.getElementById('comboInvestAmount');
        if (!preview || !amountInput || !this.selectedCombo) return;

        const amount = parseFloat(amountInput.value) || 0;
        const combo = this.selectedCombo;

        if (amount < combo.minInvestment) {
            preview.innerHTML = `<p style="color:#ff6464;text-align:center;">Minimum: ${combo.minInvestment}</p>`;
            return;
        }

        const apyMin = parseFloat(combo.expectedApy.split('-')[0]);
        const apyMax = parseFloat(combo.expectedApy.split('-')[1] || apyMin);
        const yearlyMin = (amount * apyMin / 100);
        const yearlyMax = (amount * apyMax / 100);

        // Protection et perte potentielle
        const protectionPercent = parseFloat(combo.capitalProtection);
        const maxLossPercent = 100 - protectionPercent;
        const protectedAmount = amount * protectionPercent / 100;
        const maxLossAmount = amount * maxLossPercent / 100;

        // Scénarios
        const bestCase = amount + yearlyMax;
        const expectedCase = amount + (yearlyMin + yearlyMax) / 2;
        const worstCase = protectedAmount;

        preview.innerHTML = `
            <!-- Scénarios -->
            <div style="margin-bottom:15px;">
                <div style="color:#888;font-size:0.75rem;margin-bottom:8px;text-transform:uppercase;">${(typeof I18n !== 'undefined' ? I18n.t('annual_yield_estimate') : 'Projection à 1 an')}</div>

                <!-- Best case -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#00ff88;">🚀 ${(typeof I18n !== 'undefined' ? I18n.t('optimistic_case') : 'Optimiste')}</span>
                    <span style="color:#00ff88;font-weight:600;">$${bestCase.toFixed(0)} <span style="font-size:0.8rem;">(+${apyMax}%)</span></span>
                </div>

                <!-- Expected -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#ffaa00;">📊 ${(typeof I18n !== 'undefined' ? I18n.t('average_case') : 'Moyen')}</span>
                    <span style="color:#ffaa00;font-weight:600;">$${expectedCase.toFixed(0)} <span style="font-size:0.8rem;">(+${((apyMin + apyMax) / 2).toFixed(0)}%)</span></span>
                </div>

                <!-- Worst case -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
                    <span style="color:#ff6464;">⚠️ ${(typeof I18n !== 'undefined' ? I18n.t('worst_case') : 'Pire cas')}</span>
                    <span style="color:#ff6464;font-weight:600;">$${worstCase.toFixed(0)} <span style="font-size:0.8rem;">(-${maxLossPercent}%)</span></span>
                </div>
            </div>

            <!-- Résumé risque/rendement -->
            <div style="background:#0a0a15;border-radius:8px;padding:12px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;text-align:center;">
                    <div>
                        <div style="color:#00ff88;font-size:1.2rem;font-weight:700;">+$${yearlyMin.toFixed(0)} à +$${yearlyMax.toFixed(0)}</div>
                        <div style="color:#666;font-size:0.7rem;" data-i18n="potential_gain">Gain potentiel / an</div>
                    </div>
                    <div>
                        <div style="color:#ff6464;font-size:1.2rem;font-weight:700;">-$${maxLossAmount.toFixed(0)} max</div>
                        <div style="color:#666;font-size:0.7rem;">${(typeof I18n !== 'undefined' ? I18n.t('max_risk') : 'Perte max')} (-${maxLossPercent}%)</div>
                    </div>
                </div>
            </div>

            <!-- Barre protection -->
            <div style="background:linear-gradient(90deg,#00d4aa33 ${protectionPercent}%,#ff646433 ${protectionPercent}%);border-radius:6px;padding:10px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;">
                    <span>🛡️ Protégé: <strong style="color:#00d4aa;">$${protectedAmount.toFixed(0)}</strong></span>
                    <span>⚡ Risque: <strong style="color:#ff6464;">$${maxLossAmount.toFixed(0)}</strong></span>
                </div>
            </div>

            <!-- Allocation détaillée avec gains/pertes -->
            <details style="color:#888;font-size:0.8rem;" open>
                <summary style="cursor:pointer;font-weight:600;margin-bottom:10px;">📊 ${(typeof I18n !== 'undefined' ? I18n.t('allocation') : 'Détail par produit')}</summary>
                <div style="margin-top:8px;">
                    <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;font-size:0.75rem;padding-bottom:6px;border-bottom:1px solid #333;margin-bottom:6px;">
                        <span>${(typeof I18n !== 'undefined' ? I18n.t('product') : 'Produit')}</span>
                        <span style="text-align:right;">${(typeof I18n !== 'undefined' ? I18n.t('invested') : 'Investi')}</span>
                        <span style="text-align:right;color:#00ff88;">${(typeof I18n !== 'undefined' ? I18n.t('max_gain') : 'Gain max')}</span>
                        <span style="text-align:right;color:#ff6464;">${(typeof I18n !== 'undefined' ? I18n.t('max_loss') : 'Perte max')}</span>
                    </div>
                    ${combo.allocation.map(a => {
                        const invested = amount * a.percent / 100;
                        const apyMax = parseFloat((a.apy || '10-20%').split('-')[1]);
                        const maxGain = invested * apyMax / 100;
                        const maxLossAmt = invested * (a.maxLoss || 20) / 100;
                        return `
                        <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;padding:6px 0;border-bottom:1px solid #222;">
                            <span style="color:${a.color};">● ${a.product}</span>
                            <span style="text-align:right;color:#fff;">$${invested.toFixed(0)}</span>
                            <span style="text-align:right;color:#00ff88;">+$${maxGain.toFixed(0)}</span>
                            <span style="text-align:right;color:#ff6464;">-$${maxLossAmt.toFixed(0)}</span>
                        </div>`;
                    }).join('')}
                    <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;padding:8px 0;font-weight:600;border-top:1px solid #444;margin-top:4px;">
                        <span>TOTAL</span>
                        <span style="text-align:right;color:#fff;">$${amount.toFixed(0)}</span>
                        <span style="text-align:right;color:#00ff88;">+$${yearlyMax.toFixed(0)}</span>
                        <span style="text-align:right;color:#ff6464;">-$${maxLossAmount.toFixed(0)}</span>
                    </div>
                </div>
            </details>
        `;
    },

    // Open buy with card modal
    openBuyWithCard() {
        if (!this.selectedCombo) return;
        const amountInput = document.getElementById('comboInvestAmount');
        const amount = parseFloat(amountInput?.value) || 0;

        if (typeof FiatOnRamp !== 'undefined') {
            FiatOnRamp.showModal(amount);
        } else {
            alert('Module de paiement non disponible');
        }
    },

    async executeInvest() {
        const amountInput = document.getElementById('comboInvestAmount');
        const amount = parseFloat(amountInput?.value) || 0;

        if (!this.selectedCombo || amount < this.selectedCombo.minInvestment) {
            alert((typeof I18n !== 'undefined' ? I18n.t('amount') : 'Montant') + ' insuffisant');
            return;
        }

        // Enregistrer dans SimulatedPortfolio
        console.log("[Combos] Investing", amount, "in", this.selectedCombo.name);

        if (typeof SimulatedPortfolio !== "undefined") {
            const apyStr = this.selectedCombo.expectedApy || "10-15%";
            const apyMatch = apyStr.match(/([0-9]+)/);
            const apy = apyMatch ? parseFloat(apyMatch[1]) : 10;
            const result = SimulatedPortfolio.invest("combo-" + this.selectedCombo.id, this.selectedCombo.name, amount, apy, "combo", true, null);
            if (!result.success) {
                if (typeof showNotification === "function") { showNotification(result.error || "Solde insuffisant", "error"); }
                else { alert(result.error || "Solde insuffisant"); }
                return;
            }
            if (typeof showNotification === "function") { showNotification("🎮 $" + amount + " investi dans " + this.selectedCombo.name + " (" + apy + "% APY)", "success"); }
        } else {
            alert("✅ Investment OK! Combo: " + this.selectedCombo.name + " Amount: $" + amount);
        }

        this.closeModal();
    },

    showDetails(comboId) {
        const combo = this.combos.find(c => c.id === comboId);
        if (!combo) return;

        alert(
            `${combo.icon} ${combo.name}\n\n` +
            `📊 APY Attendu: ${combo.expectedApy}\n` +
            `🛡️ Protection: ${combo.capitalProtection}\n` +
            `💰 Minimum: $${combo.minInvestment}\n` +
            `🔄 Rééquilibrage: ${combo.rebalanceFrequency}\n\n` +
            `📈 Allocation:\n` +
            combo.allocation.map(a => `  • ${a.product}: ${a.percent}%`).join('\n')
        );
    }
};

// Global functions for onclick handlers
function closeComboModal() {
    CombosModule.closeModal();
}

function executeComboInvest() {
    CombosModule.executeInvest();
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Only init if on combos tab or when tab is shown
    if (document.getElementById('combosGrid')) {
        CombosModule.init();
    }
});

// Also init when tab is activated
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-tab="combos"]')) {
        setTimeout(() => CombosModule.init(), 100);
    }
});
