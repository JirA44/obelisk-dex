/**
 * OBELISK DEX - Portfolio Positions List
 * Affiche la liste des positions ouvertes dans l'onglet Portfolio
 */

const PortfolioPositionsList = {
    t(key) {
        return I18n?.t?.(key) || key;
    },

    init() {
        // Attendre que SimulatedPortfolio soit charge
        this.waitForPortfolio();
        console.log('📋 Portfolio Positions List initialized');
    },

    waitForPortfolio() {
        if (typeof SimulatedPortfolio !== 'undefined') {
            this.patchUpdateFunction();
            this.update();
            // Mettre a jour regulierement
            setInterval(() => this.update(), 500);
        } else {
            setTimeout(() => this.waitForPortfolio(), 100);
        }
    },

    patchUpdateFunction() {
        // Sauvegarder la fonction originale
        const originalUpdate = SimulatedPortfolio.updateMainPortfolio.bind(SimulatedPortfolio);

        // Creer une nouvelle version qui appelle aussi notre update
        SimulatedPortfolio.updateMainPortfolio = () => {
            originalUpdate();
            this.update();
        };
    },

    update() {
        const positionsListEl = document.getElementById('portfolio-positions-list');
        if (!positionsListEl || typeof SimulatedPortfolio === 'undefined') return;

        const investments = SimulatedPortfolio.portfolio?.investments || [];

        if (investments.length === 0) {
            const noPositions = this.t('no_open_positions') !== 'no_open_positions' ? this.t('no_open_positions') : 'No open positions';
            const investMsg = this.t('invest_to_see_positions') !== 'invest_to_see_positions' ? this.t('invest_to_see_positions') : 'Invest to see your positions here';
            positionsListEl.innerHTML = `
                <div class="positions-empty" style="text-align:center;color:#888;padding:20px;">
                    <span>${noPositions}</span>
                    <p style="font-size:12px;margin-top:8px;">${investMsg}</p>
                </div>
            `;
        } else {
            positionsListEl.innerHTML = investments.map(inv => {
                const daysActive = ((Date.now() - inv.startDate) / (1000 * 60 * 60 * 24)).toFixed(1);
                const totalValue = inv.amount + (inv.earnings || 0);
                const typeLabel = inv.isSimulated ? '🎮' : '💎';
                const borderColor = inv.isSimulated ? '#a855f7' : '#3b82f6';
                const bgColor = inv.isSimulated ? 'rgba(168,85,247,0.2)' : 'rgba(59,130,246,0.2)';

                const formatAmount = (val) => {
                    if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
                    if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
                    return val.toFixed(2);
                };

                return `
                    <div class="position-card" style="
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-left: 3px solid ${borderColor};
                        border-radius: 10px;
                        padding: 12px 16px;
                        margin-bottom: 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 10px;
                    ">
                        <div class="position-info" style="flex:1;min-width:150px;">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                                <span style="font-weight:600;color:#fff;">${inv.productName}</span>
                                <span style="font-size:10px;background:${bgColor};color:${borderColor};padding:2px 6px;border-radius:4px;">${typeLabel} ${inv.isSimulated ? 'SIM' : 'REAL'}</span>
                            </div>
                            <div style="font-size:11px;color:#888;">
                                ${inv.apy}% APY | ${daysActive} ${this.t('days') !== 'days' ? this.t('days') : 'days'} | ${this.t('fee') !== 'fee' ? this.t('fee') : 'Fee'}: $${(inv.conversionFee || 0).toFixed(2)}
                            </div>
                        </div>
                        <div class="position-values" style="text-align:right;margin-right:12px;">
                            <div style="font-weight:600;color:#fff;">$${formatAmount(totalValue)}</div>
                            <div style="font-size:12px;color:#00ff88;">+$${(inv.earnings || 0).toFixed(2)}</div>
                        </div>
                        <button onclick="SimulatedPortfolio.withdraw('${inv.id}')" style="
                            padding:8px 14px;
                            background:rgba(255,100,100,0.15);
                            border:1px solid rgba(255,100,100,0.3);
                            border-radius:6px;
                            color:#ff6464;
                            font-size:12px;
                            font-weight:600;
                            cursor:pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(255,100,100,0.3)'" onmouseout="this.style.background='rgba(255,100,100,0.15)'">Retirer</button>
                    </div>
                `;
            }).join('');
        }
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PortfolioPositionsList.init());
} else {
    setTimeout(() => PortfolioPositionsList.init(), 200);
}

window.PortfolioPositionsList = PortfolioPositionsList;
