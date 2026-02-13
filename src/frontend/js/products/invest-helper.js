/**
 * INVEST HELPER - Centralized dual investment modal for ALL products
 * Use: InvestHelper.show({ name, id, apy, minInvest, fee, risk, onInvest })
 * Build: 2026-01-17 v2
 */

const InvestHelper = {
    currentProduct: null,
    selectedMode: 'simulated',
    onInvestCallback: null,

    // Risk levels and their max potential loss percentages
    riskLevels: {
        1: { label: { en: 'Very Low', fr: 'Très Faible' }, maxLoss: 5, color: '#22c55e' },
        2: { label: { en: 'Low', fr: 'Faible' }, maxLoss: 15, color: '#84cc16' },
        3: { label: { en: 'Medium', fr: 'Moyen' }, maxLoss: 30, color: '#f59e0b' },
        4: { label: { en: 'High', fr: 'Élevé' }, maxLoss: 50, color: '#f97316' },
        5: { label: { en: 'Extreme', fr: 'Extrême' }, maxLoss: 90, color: '#ef4444' }
    },

    // Translations
    t(key) {
        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || 'en';
        const translations = {
            en: {
                invest_in: 'Invest in',
                simulated: 'SIMULATED',
                real: 'REAL',
                sim_desc: 'Virtual funds, no risk',
                real_desc: 'Real crypto, wallet required',
                sim_balance: 'Simulated Balance',
                real_balance: 'Real Balance',
                amount: 'Amount (USDC)',
                min_invest: 'Min Investment',
                apy: 'APY',
                fee: 'Fee',
                risk: 'Risk',
                est_return: 'Est. Yearly Return',
                cancel: 'Cancel',
                invest_sim: 'Invest (Simulated)',
                invest_real: 'Invest (Real)',
                connect_wallet: 'Connect Wallet',
                min_error: 'Minimum investment:',
                insuf_sim: 'Insufficient simulated balance. Add funds.',
                insuf_real: 'Insufficient real balance',
                connect_first: 'Connect your wallet first',
                success_sim: 'SIMULATED investment successful!',
                success_real: 'REAL investment submitted!',
                add_funds: 'Add Funds',
                projections: 'Projections',
                monthly: 'Monthly',
                yearly: 'Yearly',
                best_case: 'Best Case',
                worst_case: 'Worst Case',
                expected: 'Expected',
                warning_high_risk: '⚠️ High risk - You could lose up to',
                of_investment: 'of your investment'
            },
            fr: {
                invest_in: 'Investir dans',
                simulated: 'SIMULÉ',
                real: 'RÉEL',
                sim_desc: 'Fonds virtuels, sans risque',
                real_desc: 'Crypto réelle, wallet requis',
                sim_balance: 'Solde Simulé',
                real_balance: 'Solde Réel',
                amount: 'Montant (USDC)',
                min_invest: 'Invest. Min',
                apy: 'APY',
                fee: 'Frais',
                risk: 'Risque',
                est_return: 'Gain Annuel Estimé',
                cancel: 'Annuler',
                invest_sim: 'Investir (Simulé)',
                invest_real: 'Investir (Réel)',
                connect_wallet: 'Connecter Wallet',
                min_error: 'Investissement minimum:',
                insuf_sim: 'Solde simulé insuffisant. Ajoutez des fonds.',
                insuf_real: 'Solde réel insuffisant',
                connect_first: 'Connectez votre wallet d\'abord',
                success_sim: 'Investissement SIMULÉ réussi !',
                success_real: 'Investissement RÉEL soumis !',
                add_funds: 'Ajouter Fonds',
                projections: 'Projections',
                monthly: 'Mensuel',
                yearly: 'Annuel',
                best_case: 'Meilleur cas',
                worst_case: 'Pire cas',
                expected: 'Attendu',
                warning_high_risk: '⚠️ Risque élevé - Vous pourriez perdre jusqu\'à',
                of_investment: 'de votre investissement'
            }
        };
        return translations[lang]?.[key] || translations.en[key] || key;
    },

    // Get risk info
    getRiskInfo(riskLevel) {
        const level = Math.min(5, Math.max(1, riskLevel || 3));
        const info = this.riskLevels[level];
        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || 'en';
        return {
            level,
            label: info.label[lang] || info.label.en,
            maxLoss: info.maxLoss,
            color: info.color
        };
    },

    // Calculate projections
    calcProjections(amount, apy, riskLevel) {
        const risk = this.getRiskInfo(riskLevel);
        const monthlyGain = amount * (apy / 100) / 12;
        const yearlyGain = amount * (apy / 100);
        const maxLossAmount = amount * (risk.maxLoss / 100);

        return {
            monthly: {
                best: monthlyGain * 1.5,  // 150% of expected
                expected: monthlyGain,
                worst: -maxLossAmount / 12  // Monthly portion of max loss
            },
            yearly: {
                best: yearlyGain * 1.5,
                expected: yearlyGain,
                worst: -maxLossAmount
            },
            maxLossPercent: risk.maxLoss,
            maxLossAmount: maxLossAmount,
            riskColor: risk.color,
            riskLabel: risk.label
        };
    },

    // Generate 12-month forecast data
    generateForecastData(amount, apy, riskLevel) {
        const risk = this.getRiskInfo(riskLevel);
        const volatility = { 1: 0.05, 2: 0.10, 3: 0.15, 4: 0.25, 5: 0.40 }[risk.level] || 0.15;
        const monthlyRate = apy / 100 / 12;
        const data = [];

        for (let m = 0; m <= 12; m++) {
            const mean = amount * Math.pow(1 + monthlyRate, m);
            const timeVar = Math.sqrt(m / 12);
            const variation = mean * volatility * timeVar;
            data.push({
                month: m,
                mean: mean,
                min: Math.max(amount * (1 - risk.maxLoss / 100), mean - variation),
                max: mean + variation
            });
        }
        return data;
    },

    // Render forecast chart SVG
    renderForecastChart(amount, apy, riskLevel) {
        const data = this.generateForecastData(amount, apy, riskLevel);
        const width = 280;
        const height = 80;
        const padding = { top: 8, right: 8, bottom: 20, left: 8 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const minY = Math.min(...data.map(d => d.min));
        const maxY = Math.max(...data.map(d => d.max));
        const range = maxY - minY || 1;

        const scaleX = (m) => padding.left + (m / 12) * chartWidth;
        const scaleY = (v) => padding.top + ((maxY - v) / range) * chartHeight;

        const minPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.min)}`).join(' ');
        const meanPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.mean)}`).join(' ');
        const maxPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.max)}`).join(' ');
        const areaPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.max)}`).join(' ')
            + data.slice().reverse().map((d) => `L ${scaleX(d.month)} ${scaleY(d.min)}`).join(' ') + ' Z';

        const finalMean = data[12].mean;
        const finalMin = data[12].min;
        const finalMax = data[12].max;
        const gain = ((finalMean - amount) / amount * 100).toFixed(1);

        const formatAmt = (v) => v >= 1000 ? (v/1000).toFixed(1) + 'K' : v.toFixed(0);

        return `
            <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="color:#888;font-size:11px;text-transform:uppercase;">Prévision 12 mois</span>
                    <span style="background:rgba(0,255,136,0.15);color:#00ff88;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:700;">+${gain}%</span>
                </div>
                <svg viewBox="0 0 ${width} ${height}" style="display:block;width:100%;height:80px;">
                    <defs>
                        <linearGradient id="ih-forecast-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="rgba(0,255,136,0.25)" />
                            <stop offset="100%" stop-color="rgba(0,255,136,0)" />
                        </linearGradient>
                    </defs>
                    <path d="${areaPath}" fill="url(#ih-forecast-grad)" />
                    <path d="${maxPath}" fill="none" stroke="rgba(0,255,136,0.3)" stroke-width="1" stroke-dasharray="3,3" />
                    <path d="${minPath}" fill="none" stroke="rgba(255,100,100,0.3)" stroke-width="1" stroke-dasharray="3,3" />
                    <path d="${meanPath}" fill="none" stroke="#00ff88" stroke-width="2" />
                    <circle cx="${scaleX(12)}" cy="${scaleY(finalMean)}" r="4" fill="#00ff88" />
                    <text x="${padding.left}" y="${height - 4}" fill="#666" font-size="9">0</text>
                    <text x="${scaleX(6)}" y="${height - 4}" fill="#666" font-size="9" text-anchor="middle">6m</text>
                    <text x="${width - padding.right}" y="${height - 4}" fill="#666" font-size="9" text-anchor="end">12m</text>
                </svg>
                <div style="display:flex;justify-content:space-around;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05);">
                    <div style="text-align:center;">
                        <div style="color:#666;font-size:9px;text-transform:uppercase;">Min</div>
                        <div style="color:rgba(255,100,100,0.8);font-size:12px;font-weight:600;">$${formatAmt(finalMin)}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#666;font-size:9px;text-transform:uppercase;">Moy</div>
                        <div style="color:#00ff88;font-size:12px;font-weight:600;">$${formatAmt(finalMean)}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#666;font-size:9px;text-transform:uppercase;">Max</div>
                        <div style="color:rgba(0,255,136,0.8);font-size:12px;font-weight:600;">$${formatAmt(finalMax)}</div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get current position for a product
     */
    getPosition(productId) {
        let simulated = 0;
        let real = 0;

        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.portfolio?.investments) {
            SimulatedPortfolio.portfolio.investments.forEach(inv => {
                if (inv.productId === productId || inv.id === productId || inv.productId?.includes(productId)) {
                    if (inv.isSimulated !== false) {
                        simulated += inv.amount + (inv.earned || 0);
                    } else {
                        real += inv.amount + (inv.earned || 0);
                    }
                }
            });
        }

        return { simulated, real };
    },

    /**
     * Execute withdrawal
     */
    executeWithdraw(isSimulated) {
        const p = this.currentProduct;
        if (!p) return;

        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || 'en';
        const isFr = lang === 'fr';
        const position = this.getPosition(p.id);
        const amount = isSimulated ? position.simulated : position.real;

        if (amount <= 0) {
            this.showError(isFr ? 'Aucun investissement à retirer' : 'No investment to withdraw');
            return;
        }

        // Find and withdraw from SimulatedPortfolio
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.portfolio?.investments) {
            const invIndex = SimulatedPortfolio.portfolio.investments.findIndex(inv =>
                (inv.productId === p.id || inv.id === p.id || inv.productId?.includes(p.id)) &&
                (isSimulated ? inv.isSimulated !== false : inv.isSimulated === false)
            );

            if (invIndex >= 0) {
                const inv = SimulatedPortfolio.portfolio.investments[invIndex];
                const totalValue = inv.amount + (inv.earned || 0);

                SimulatedPortfolio.withdraw(inv.id);

                const emoji = isSimulated ? '🎮' : '💎';
                const type = isSimulated ? (isFr ? 'SIMULÉ' : 'SIMULATED') : (isFr ? 'RÉEL' : 'REAL');
                const msg = isFr
                    ? `${emoji} Retiré $${totalValue.toFixed(2)} de ${p.name} (${type})`
                    : `${emoji} Withdrew $${totalValue.toFixed(2)} from ${p.name} (${type})`;

                if (typeof showNotification === 'function') showNotification(msg, 'success');

                // Call custom onWithdraw if provided
                if (this.onWithdrawCallback) {
                    this.onWithdrawCallback(totalValue, isSimulated ? 'simulated' : 'real');
                }

                document.getElementById('invest-helper-modal')?.remove();

                // Refresh portfolio
                if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.renderSidebar) {
                    SimulatedPortfolio.renderSidebar();
                }
                return;
            }
        }

        this.showError(isFr ? 'Position non trouvée' : 'Position not found');
    },

    /**
     * Show dual investment modal
     * @param {Object} product - { name, id, apy, minInvest, fee, risk, icon, onInvest(amount, mode), onWithdraw(amount, mode) }
     */
    show(product) {
        this.currentProduct = product;
        this.selectedMode = 'simulated';
        this.onInvestCallback = product.onInvest;
        this.onWithdrawCallback = product.onWithdraw;

        // Remove existing modal
        const existing = document.getElementById('invest-helper-modal');
        if (existing) existing.remove();

        // Get balances
        const simBalance = (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.getBalance)
            ? SimulatedPortfolio.getBalance() : 0;
        const realBalance = (typeof WalletManager !== 'undefined' && WalletManager.getUSDCBalance)
            ? WalletManager.getUSDCBalance() : 0;

        // Get current position
        const position = this.getPosition(product.id);
        const formatBal = (val) => val >= 1000 ? `$${(val/1000).toFixed(1)}K` : `$${val.toFixed(2)}`;
        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || 'en';
        const isFr = lang === 'fr';

        const p = product;
        const minInvest = p.minInvest || 10;
        const apy = p.apy || 0;
        const fee = p.fee || 0;
        const riskLevel = p.risk || 3;
        const riskInfo = this.getRiskInfo(riskLevel);
        const proj = this.calcProjections(minInvest, apy, riskLevel);

        // Calculate risk score out of 100 (maxLoss is the main factor)
        // riskLevel 1=5%, 2=15%, 3=30%, 4=50%, 5=90%
        const riskScore = riskInfo.maxLoss;
        const isRiskAcceptable = riskScore <= 50;

        const modal = document.createElement('div');
        modal.id = 'invest-helper-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10001;display:flex;align-items:center;justify-content:center;';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        // High risk warning HTML - show when risk score >= 50%
        // Above 50% = statistically you lose more than you gain
        const riskWarning = !isRiskAcceptable ? `
            <div style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.5);border-radius:8px;padding:12px;margin-bottom:16px;">
                <div style="color:#ef4444;font-size:12px;font-weight:700;text-align:center;">
                    ⚠️ ${isFr ? 'DÉCONSEILLÉ' : 'NOT RECOMMENDED'} - ${isFr ? 'Risque' : 'Risk'} ${riskScore}% ≥ 50%
                </div>
                <div style="color:#ff8888;font-size:11px;text-align:center;margin-top:4px;">
                    ${isFr ? 'Statistiquement, vous perdrez plus que vous ne gagnerez' : 'Statistically, you will lose more than you gain'}
                </div>
            </div>` : '';

        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#1a1a2e,#0d0d1a);border:1px solid #333;border-radius:16px;padding:20px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="color:#fff;margin:0;font-size:1.1rem;">${p.icon || '💰'} ${p.name}</h3>
                    <button onclick="document.getElementById('invest-helper-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;padding:0;line-height:1;">&times;</button>
                </div>

                <!-- Current Position Display -->
                <div style="display:flex;gap:12px;justify-content:center;margin-bottom:14px;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;">
                    <div style="text-align:center;">
                        <span style="font-size:1.4em;">🎮</span>
                        <div style="color:#a855f7;font-size:0.7em;">${isFr ? 'Simulé' : 'Simulated'}</div>
                        <div style="color:#a855f7;font-weight:bold;">${formatBal(position.simulated)}</div>
                    </div>
                    <div style="text-align:center;">
                        <span style="font-size:1.4em;">💎</span>
                        <div style="color:#00d4aa;font-size:0.7em;">${isFr ? 'Réel' : 'Real'}</div>
                        <div style="color:#00d4aa;font-weight:bold;">${formatBal(position.real)}</div>
                    </div>
                </div>

                <!-- Product Info with Risk -->
                <div style="background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:10px;padding:10px;margin-bottom:12px;">
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;font-size:0.85em;">
                        <div>
                            <div style="color:#888;font-size:9px;">${this.t('min_invest')}</div>
                            <div style="color:#fff;font-weight:600;">$${minInvest}</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:9px;">${this.t('apy')}</div>
                            <div style="color:#00ff88;font-weight:600;">${apy}%</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:9px;">${this.t('fee')}</div>
                            <div style="color:#f59e0b;font-weight:600;">${fee}%</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:9px;">${this.t('risk')}</div>
                            <div style="color:${riskInfo.color};font-weight:600;">${riskInfo.label} (${riskScore}%)${!isRiskAcceptable ? ' ⚠️' : ''}</div>
                        </div>
                    </div>
                </div>

                ${riskWarning}

                <!-- Amount Input -->
                <div style="margin-bottom:12px;">
                    <label style="color:#888;font-size:11px;display:block;margin-bottom:4px;">${this.t('amount')}</label>
                    <input type="number" id="ih-amount" min="${minInvest}" step="1" value="${minInvest}"
                           style="width:100%;padding:10px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#fff;font-size:16px;box-sizing:border-box;"
                           oninput="InvestHelper.updateProjections()">
                </div>

                <!-- Invest Section -->
                <div style="background:linear-gradient(135deg,rgba(0,212,170,0.1),rgba(0,212,170,0.05));border:1px solid rgba(0,212,170,0.3);border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="color:#00d4aa;font-size:0.8em;font-weight:600;text-align:center;margin-bottom:8px;">📥 ${isFr ? 'Investir' : 'Invest'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="InvestHelper.selectedMode='simulated';InvestHelper.confirm()" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;">
                            🎮 ${isFr ? 'SIMULÉ' : 'SIMULATED'}
                        </button>
                        <button onclick="InvestHelper.selectedMode='real';InvestHelper.confirm()" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#00d4aa,#00a884);color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;">
                            💎 ${isFr ? 'RÉEL' : 'REAL'}
                        </button>
                    </div>
                </div>

                <!-- Withdraw Section -->
                <div style="background:linear-gradient(135deg,rgba(255,159,67,0.1),rgba(255,159,67,0.05));border:1px solid rgba(255,159,67,0.3);border-radius:10px;padding:12px;margin-bottom:12px;">
                    <div style="color:#ff9f43;font-size:0.8em;font-weight:600;text-align:center;margin-bottom:8px;">📤 ${isFr ? 'Retirer' : 'Withdraw'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="InvestHelper.executeWithdraw(true)" ${position.simulated <= 0 ? 'disabled' : ''} style="flex:1;padding:10px;border-radius:6px;border:1px solid rgba(168,85,247,0.5);background:linear-gradient(135deg,rgba(168,85,247,0.3),rgba(168,85,247,0.2));color:#ddd;font-size:11px;font-weight:600;cursor:pointer;${position.simulated <= 0 ? 'opacity:0.4;cursor:not-allowed;' : ''}">
                            🎮 ${position.simulated > 0 ? formatBal(position.simulated) : (isFr ? '(vide)' : '(empty)')}
                        </button>
                        <button onclick="InvestHelper.executeWithdraw(false)" ${position.real <= 0 ? 'disabled' : ''} style="flex:1;padding:10px;border-radius:6px;border:1px solid rgba(0,212,170,0.5);background:linear-gradient(135deg,rgba(0,212,170,0.3),rgba(0,212,170,0.2));color:#ddd;font-size:11px;font-weight:600;cursor:pointer;${position.real <= 0 ? 'opacity:0.4;cursor:not-allowed;' : ''}">
                            💎 ${position.real > 0 ? formatBal(position.real) : (isFr ? '(vide)' : '(empty)')}
                        </button>
                    </div>
                </div>

                <!-- Forecast Chart (always visible) -->
                <div id="ih-forecast-chart">
                    ${this.renderForecastChart(minInvest, apy, riskLevel)}
                </div>

                <button onclick="document.getElementById('invest-helper-modal').remove()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#aaa;cursor:pointer;">${this.t('cancel')}</button>
            </div>`;

        document.body.appendChild(modal);
    },

    // Update projections when amount changes
    updateProjections() {
        const amount = parseFloat(document.getElementById('ih-amount')?.value) || 0;
        const p = this.currentProduct;
        const proj = this.calcProjections(amount, p.apy || 0, p.risk || 3);

        // Update monthly
        const monthWorst = document.getElementById('ih-proj-month-worst');
        const monthExp = document.getElementById('ih-proj-month-exp');
        const monthBest = document.getElementById('ih-proj-month-best');
        if (monthWorst) monthWorst.textContent = '-$' + Math.abs(proj.monthly.worst).toFixed(2);
        if (monthExp) monthExp.textContent = '+$' + proj.monthly.expected.toFixed(2);
        if (monthBest) monthBest.textContent = '+$' + proj.monthly.best.toFixed(2);

        // Update yearly
        const yearWorst = document.getElementById('ih-proj-year-worst');
        const yearExp = document.getElementById('ih-proj-year-exp');
        const yearBest = document.getElementById('ih-proj-year-best');
        if (yearWorst) yearWorst.textContent = '-$' + Math.abs(proj.yearly.worst).toFixed(2);
        if (yearExp) yearExp.textContent = '+$' + proj.yearly.expected.toFixed(2);
        if (yearBest) yearBest.textContent = '+$' + proj.yearly.best.toFixed(2);

        // Update max loss
        const maxLoss = document.getElementById('ih-max-loss');
        if (maxLoss) maxLoss.textContent = '-$' + proj.maxLossAmount.toFixed(2) + ' (' + proj.maxLossPercent + '%)';

        // Update forecast chart
        const chartContainer = document.getElementById('ih-forecast-chart');
        if (chartContainer && amount > 0) {
            chartContainer.innerHTML = this.renderForecastChart(amount, p.apy || 0, p.risk || 3);
        }
    },

    selectMode(mode) {
        this.selectedMode = mode;
        const simCard = document.getElementById('ih-mode-sim');
        const realCard = document.getElementById('ih-mode-real');
        const investBtn = document.getElementById('ih-invest-btn');

        if (mode === 'simulated') {
            simCard.style.border = '2px solid #a855f7';
            simCard.style.boxShadow = '0 0 15px rgba(168,85,247,0.3)';
            realCard.style.border = '2px solid rgba(59,130,246,0.3)';
            realCard.style.boxShadow = 'none';
            investBtn.style.background = 'linear-gradient(135deg,#a855f7,#7c3aed)';
            investBtn.textContent = this.t('invest_sim');
        } else {
            realCard.style.border = '2px solid #3b82f6';
            realCard.style.boxShadow = '0 0 15px rgba(59,130,246,0.3)';
            simCard.style.border = '2px solid rgba(168,85,247,0.3)';
            simCard.style.boxShadow = 'none';
            investBtn.style.background = 'linear-gradient(135deg,#3b82f6,#2563eb)';
            const isConnected = typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected();
            investBtn.textContent = isConnected ? this.t('invest_real') : this.t('connect_wallet');
        }
    },

    confirm() {
        const amount = parseFloat(document.getElementById('ih-amount')?.value) || 0;
        const p = this.currentProduct;
        const minInvest = p.minInvest || 10;

        // Validate minimum
        if (amount < minInvest) {
            this.showError(this.t('min_error') + ' $' + minInvest);
            return;
        }

        if (this.selectedMode === 'real') {
            // Real mode
            const isConnected = typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected();
            if (!isConnected) {
                if (typeof WalletManager !== 'undefined' && WalletManager.openModal) {
                    WalletManager.openModal();
                } else {
                    this.showError(this.t('connect_first'));
                }
                return;
            }

            const realBalance = (typeof WalletManager !== 'undefined' && WalletManager.getUSDCBalance) ? WalletManager.getUSDCBalance() : 0;
            if (amount > realBalance) {
                this.showError(this.t('insuf_real'));
                return;
            }

            // Execute real investment
            document.getElementById('invest-helper-modal').remove();
            if (this.onInvestCallback) {
                this.onInvestCallback(amount, 'real');
            }
            this.showSuccess('real', amount);
        } else {
            // Simulated mode
            const simBalance = (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.getBalance) ? SimulatedPortfolio.getBalance() : 0;
            if (amount > simBalance) {
                this.showError(this.t('insuf_sim'));
                return;
            }

            // Execute simulated investment
            document.getElementById('invest-helper-modal').remove();
            if (this.onInvestCallback) {
                this.onInvestCallback(amount, 'simulated');
            }
            this.showSuccess('simulated', amount);
        }
    },

    showError(message) {
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
        } else {
            alert(message);
        }
    },

    showSuccess(mode, amount) {
        const p = this.currentProduct;
        const icon = mode === 'simulated' ? '🎮' : '💎';
        const modeText = mode === 'simulated' ? this.t('simulated') : this.t('real');
        const message = `${icon} ${modeText}: $${amount.toFixed(2)} → ${p.name}`;

        if (typeof showNotification === 'function') {
            showNotification(message, 'success');
        } else {
            alert(mode === 'simulated' ? this.t('success_sim') : this.t('success_real'));
        }

        // Refresh portfolio
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.renderSidebar) {
            SimulatedPortfolio.renderSidebar();
        }
    }
};

console.log('[InvestHelper] Centralized dual investment modal loaded');
