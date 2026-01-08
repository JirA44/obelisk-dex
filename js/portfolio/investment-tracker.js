// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - INVESTMENT TRACKER
// Track investments with real-time PnL calculations
// ═══════════════════════════════════════════════════════════════════════════════

const InvestmentTracker = {
    investments: [],

    init() {
        // Load investments from localStorage
        const saved = localStorage.getItem('obelisk-investments');
        if (saved) {
            try {
                this.investments = JSON.parse(saved);
            } catch (e) {
                this.investments = [];
            }
        }
        console.log('[InvestmentTracker] Loaded', this.investments.length, 'investments');
    },

    // Add new investment
    addInvestment(combo, amount) {
        const investment = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            comboId: combo.id,
            comboName: combo.name,
            comboIcon: combo.icon,
            amount: amount,
            date: new Date().toISOString(),
            expectedApyMin: parseFloat(combo.expectedApy.split('-')[0]),
            expectedApyMax: parseFloat(combo.expectedApy.split('-')[1] || combo.expectedApy.split('-')[0]),
            capitalProtection: parseFloat(combo.capitalProtection),
            riskLevel: combo.riskLevel,
            allocation: combo.allocation
        };

        this.investments.push(investment);
        this.save();
        return investment;
    },

    // Save to localStorage
    save() {
        localStorage.setItem('obelisk-investments', JSON.stringify(this.investments));
    },

    // Calculate current value with simulated growth
    calculateCurrentValue(investment) {
        const startDate = new Date(investment.date);
        const now = new Date();
        const daysElapsed = (now - startDate) / (1000 * 60 * 60 * 24);
        const yearsElapsed = daysElapsed / 365;

        // Average APY for simulation
        const avgApy = (investment.expectedApyMin + investment.expectedApyMax) / 2;

        // Simulate daily fluctuation (-0.5% to +0.5% daily variance)
        const dailyVariance = (Math.sin(Date.now() / 100000) * 0.005);

        // Calculate growth
        const growth = investment.amount * (avgApy / 100) * yearsElapsed;
        const currentValue = investment.amount + growth + (investment.amount * dailyVariance);

        return {
            currentValue: Math.max(0, currentValue),
            pnl: currentValue - investment.amount,
            pnlPercent: ((currentValue - investment.amount) / investment.amount) * 100,
            daysElapsed: Math.floor(daysElapsed),
            yearsElapsed
        };
    },

    // Get projections for an investment amount
    getProjections(amount, apyMin, apyMax, capitalProtection) {
        const protectionPercent = capitalProtection / 100;
        const maxLossPercent = 1 - protectionPercent;

        // Calculate for different timeframes
        const timeframes = {
            week: 7 / 365,
            month: 30 / 365,
            quarter: 90 / 365,
            year: 1
        };

        const projections = {};

        for (const [period, fraction] of Object.entries(timeframes)) {
            const minGain = amount * (apyMin / 100) * fraction;
            const maxGain = amount * (apyMax / 100) * fraction;
            const avgGain = (minGain + maxGain) / 2;
            const maxLoss = amount * maxLossPercent * fraction;

            // Net return (gain - potential loss weighted by risk)
            const riskWeight = 0.3; // 30% weight to worst case
            const netMin = minGain - (maxLoss * riskWeight);
            const netMax = maxGain - (maxLoss * riskWeight * 0.5);
            const netAvg = (netMin + netMax) / 2;

            projections[period] = {
                minGain,
                maxGain,
                avgGain,
                maxLoss,
                netMin,
                netMax,
                netAvg,
                netMinPercent: (netMin / amount),
                netMaxPercent: (netMax / amount) * 100,
                netAvgPercent: (netAvg / amount) * 100
            };
        }

        return projections;
    },

    // Get total portfolio stats
    getPortfolioStats() {
        if (this.investments.length === 0) {
            return { totalInvested: 0, currentValue: 0, totalPnl: 0, totalPnlPercent: 0 };
        }

        let totalInvested = 0;
        let currentValue = 0;

        for (const inv of this.investments) {
            const calc = this.calculateCurrentValue(inv);
            totalInvested += inv.amount;
            currentValue += calc.currentValue;
        }

        return {
            totalInvested,
            currentValue,
            totalPnl: currentValue - totalInvested,
            totalPnlPercent: ((currentValue - totalInvested) , totalInvested)
        };
    },

    // Render portfolio widget
    renderPortfolioWidget() {
        const stats = this.getPortfolioStats();
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        if (stats.totalInvested === 0) {
            return `
                <div style="text-align:center;padding:30px;color:#888;">
                    <div style="font-size:3rem;margin-bottom:10px;">📊</div>
                    <p>${isFr ? 'Aucun investissement actif' : 'No active investments'}</p>
                    <p style="font-size:0.85rem;">${isFr ? 'Investissez dans un Combo pour commencer' : 'Invest in a Combo to start'}</p>
                </div>
            `;
        }

        const pnlColor = stats.totalPnl >= 0 ? '#00ff88' : '#ff6464';
        const pnlSign = stats.totalPnl >= 0 ? '+' : '';

        return `
            <div style="padding:20px;">
                <h3 style="color:#fff;margin:0 0 20px 0;">💼 ${isFr ? 'Mon Portfolio' : 'My Portfolio'}</h3>

                <!-- Summary -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                    <div style="background:#0a0a15;border-radius:12px;padding:16px;">
                        <div style="color:#888;font-size:0.8rem;">${isFr ? 'Investi' : 'Invested'}</div>
                        <div style="color:#fff;font-size:1.5rem;font-weight:700;">$${stats.totalInvested.toFixed(2)}</div>
                    </div>
                    <div style="background:#0a0a15;border-radius:12px;padding:16px;">
                        <div style="color:#888;font-size:0.8rem;">${isFr ? 'Valeur actuelle' : 'Current Value'}</div>
                        <div style="color:#00d4aa;font-size:1.5rem;font-weight:700;">$${stats.currentValue.toFixed(2)}</div>
                    </div>
                </div>

                <!-- PnL -->
                <div style="background:linear-gradient(135deg, ${pnlColor}15, ${pnlColor}05);border:1px solid ${pnlColor}50;border-radius:12px;padding:16px;text-align:center;">
                    <div style="color:#888;font-size:0.8rem;">${isFr ? 'PnL Net Total' : 'Total Net PnL'}</div>
                    <div style="color:${pnlColor};font-size:2rem;font-weight:700;">
                        ${pnlSign}$${stats.totalPnl.toFixed(2)}
                    </div>
                    <div style="color:${pnlColor};font-size:1rem;">
                        (${pnlSign}${stats.totalPnlPercent.toFixed(2)}%)
                    </div>
                </div>

                <!-- Investments list -->
                <div style="margin-top:20px;">
                    <h4 style="color:#888;font-size:0.85rem;margin-bottom:12px;">${isFr ? 'Mes Investissements' : 'My Investments'}</h4>
                    ${this.investments.map(inv => {
                        const calc = this.calculateCurrentValue(inv);
                        const invPnlColor = calc.pnl >= 0 ? '#00ff88' : '#ff6464';
                        const invPnlSign = calc.pnl >= 0 ? '+' : '';
                        return `
                            <div style="background:#0a0a15;border-radius:10px;padding:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                                <div style="display:flex;align-items:center;gap:10px;">
                                    <span style="font-size:1.5rem;">${inv.comboIcon}</span>
                                    <div>
                                        <div style="color:#fff;font-weight:500;">${inv.comboName}</div>
                                        <div style="color:#666;font-size:0.75rem;">${calc.daysElapsed}j • $${inv.amount.toFixed(2)}</div>
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="color:${invPnlColor};font-weight:600;">${invPnlSign}$${calc.pnl.toFixed(2)}</div>
                                    <div style="color:${invPnlColor};font-size:0.8rem;">${invPnlSign}${calc.pnlPercent.toFixed(2)}%</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    InvestmentTracker.init();
});

window.InvestmentTracker = InvestmentTracker;
