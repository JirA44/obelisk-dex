const fs = require('fs');

// Update combos.js with detailed projections
let combos = fs.readFileSync('js/combos.js', 'utf8');

// Find updatePreview and replace with enhanced version
const newUpdatePreview = `
    updatePreview() {
        const preview = document.getElementById('comboInvestPreview');
        const amountInput = document.getElementById('comboInvestAmount');
        if (!preview || !amountInput || !this.selectedCombo) return;

        const amount = parseFloat(amountInput.value) || 0;
        const combo = this.selectedCombo;
        const lang = (typeof I18n !== 'undefined') ? I18n.currentLang : 'en';
        const isFr = lang === 'fr';
        const isEs = lang === 'es';
        const isDe = lang === 'de';

        // Full translations
        const txt = {
            minimum: isFr ? 'Minimum requis' : isEs ? 'Mínimo requerido' : isDe ? 'Mindestbetrag' : 'Minimum required',
            netReturns: isFr ? 'Rendements Nets Estimés' : isEs ? 'Rendimientos Netos Estimados' : isDe ? 'Geschätzte Nettorenditen' : 'Estimated Net Returns',
            week: isFr ? 'Semaine' : isEs ? 'Semana' : isDe ? 'Woche' : 'Week',
            month: isFr ? 'Mois' : isEs ? 'Mes' : isDe ? 'Monat' : 'Month',
            quarter: isFr ? 'Trimestre' : isEs ? 'Trimestre' : isDe ? 'Quartal' : 'Quarter',
            year: isFr ? 'Année' : isEs ? 'Año' : isDe ? 'Jahr' : 'Year',
            netPnl: isFr ? 'PnL Net' : isEs ? 'PnL Neto' : isDe ? 'Netto-PnL' : 'Net PnL',
            afterRisk: isFr ? 'après risques' : isEs ? 'después de riesgos' : isDe ? 'nach Risiken' : 'after risks',
            riskIncluded: isFr ? '⚠️ Risques pré-calculés inclus' : isEs ? '⚠️ Riesgos precalculados incluidos' : isDe ? '⚠️ Vorberechnete Risiken enthalten' : '⚠️ Pre-calculated risks included',
            worstCase: isFr ? 'Pire cas' : isEs ? 'Peor caso' : isDe ? 'Schlimmster Fall' : 'Worst case',
            bestCase: isFr ? 'Meilleur cas' : isEs ? 'Mejor caso' : isDe ? 'Bester Fall' : 'Best case',
            avgCase: isFr ? 'Cas moyen' : isEs ? 'Caso promedio' : isDe ? 'Durchschnitt' : 'Average',
            protected: isFr ? 'Protégé' : isEs ? 'Protegido' : isDe ? 'Geschützt' : 'Protected',
            atRisk: isFr ? 'À risque' : isEs ? 'En riesgo' : isDe ? 'Gefährdet' : 'At risk',
            allocation: isFr ? 'Répartition' : isEs ? 'Distribución' : isDe ? 'Verteilung' : 'Allocation',
            buyWithCard: isFr ? 'Acheter USDC par Carte' : isEs ? 'Comprar USDC con Tarjeta' : isDe ? 'USDC mit Karte kaufen' : 'Buy USDC with Card'
        };

        if (amount < combo.minInvestment) {
            preview.innerHTML = \`<p style="color:#ff6464;text-align:center;">\${txt.minimum}: $\${combo.minInvestment}</p>\`;
            return;
        }

        const apyMin = parseFloat(combo.expectedApy.split('-')[0]);
        const apyMax = parseFloat(combo.expectedApy.split('-')[1] || apyMin);
        const protectionPercent = parseFloat(combo.capitalProtection);
        const maxLossPercent = 100 - protectionPercent;

        // Calculate projections for each period
        const periods = [
            { key: 'week', label: txt.week, days: 7 },
            { key: 'month', label: txt.month, days: 30 },
            { key: 'quarter', label: txt.quarter, days: 90 },
            { key: 'year', label: txt.year, days: 365 }
        ];

        const projections = periods.map(p => {
            const fraction = p.days / 365;
            const minGain = amount * (apyMin / 100) * fraction;
            const maxGain = amount * (apyMax / 100) * fraction;
            const avgGain = (minGain + maxGain) / 2;
            const maxLoss = amount * (maxLossPercent / 100) * fraction;

            // Net = gain minus risk-weighted loss (30% probability of worst case)
            const riskWeight = 0.3;
            const netMin = minGain - (maxLoss * riskWeight);
            const netMax = maxGain - (maxLoss * riskWeight * 0.5);
            const netAvg = (netMin + netMax) / 2;

            return {
                ...p,
                netMin,
                netMax,
                netAvg,
                netMinPct: (netMin / amount) * 100,
                netMaxPct: (netMax / amount) * 100,
                netAvgPct: (netAvg / amount) * 100
            };
        });

        // Yearly summary for display
        const yearly = projections.find(p => p.key === 'year');

        preview.innerHTML = \`
            <!-- Header -->
            <div style="background:linear-gradient(135deg, #00d4aa15, #4a9eff15);border:1px solid #333;border-radius:12px;padding:16px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <span style="color:#00d4aa;font-size:1.2rem;">💰</span>
                    <span style="color:#fff;font-weight:600;">\${txt.netReturns}</span>
                </div>
                <div style="color:#888;font-size:0.8rem;">\${txt.riskIncluded}</div>
            </div>

            <!-- Projections Grid -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
                \${projections.map(p => \`
                    <div style="background:#0a0a15;border-radius:10px;padding:12px;text-align:center;">
                        <div style="color:#888;font-size:0.7rem;margin-bottom:6px;">\${p.label}</div>
                        <div style="color:\${p.netAvg >= 0 ? '#00ff88' : '#ff6464'};font-size:1rem;font-weight:700;">
                            \${p.netAvg >= 0 ? '+' : ''}\${p.netAvgPct.toFixed(2)}%
                        </div>
                        <div style="color:\${p.netAvg >= 0 ? '#00ff88' : '#ff6464'};font-size:0.8rem;">
                            \${p.netAvg >= 0 ? '+' : ''}$\${p.netAvg.toFixed(2)}
                        </div>
                    </div>
                \`).join('')}
            </div>

            <!-- Net PnL Summary -->
            <div style="background:#0a0a15;border-radius:12px;padding:16px;margin-bottom:16px;">
                <div style="color:#888;font-size:0.75rem;margin-bottom:10px;">\${txt.netPnl} \${txt.year.toLowerCase()} (\${txt.afterRisk})</div>

                <div style="display:flex;justify-content:space-between;margin-bottom:8px;padding:8px;background:#ff646415;border-radius:8px;">
                    <span style="color:#ff6464;">\${txt.worstCase}</span>
                    <span style="color:#ff6464;font-weight:600;">\${yearly.netMin >= 0 ? '+' : ''}$\${yearly.netMin.toFixed(2)} (\${yearly.netMinPct.toFixed(1)}%)</span>
                </div>

                <div style="display:flex;justify-content:space-between;margin-bottom:8px;padding:8px;background:#ffaa0015;border-radius:8px;">
                    <span style="color:#ffaa00;">\${txt.avgCase}</span>
                    <span style="color:#ffaa00;font-weight:600;">\${yearly.netAvg >= 0 ? '+' : ''}$\${yearly.netAvg.toFixed(2)} (\${yearly.netAvgPct.toFixed(1)}%)</span>
                </div>

                <div style="display:flex;justify-content:space-between;padding:8px;background:#00ff8815;border-radius:8px;">
                    <span style="color:#00ff88;">\${txt.bestCase}</span>
                    <span style="color:#00ff88;font-weight:600;">+$\${yearly.netMax.toFixed(2)} (+\${yearly.netMaxPct.toFixed(1)}%)</span>
                </div>
            </div>

            <!-- Protection Bar -->
            <div style="background:#0a0a15;border-radius:10px;padding:12px;margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <span style="color:#888;font-size:0.8rem;">🛡️ \${txt.protected}: \${protectionPercent}%</span>
                    <span style="color:#888;font-size:0.8rem;">⚡ \${txt.atRisk}: \${maxLossPercent}%</span>
                </div>
                <div style="height:8px;border-radius:4px;background:#ff646433;overflow:hidden;">
                    <div style="width:\${protectionPercent}%;height:100%;background:#00d4aa;"></div>
                </div>
            </div>

            <!-- Allocation -->
            <details style="color:#888;font-size:0.8rem;">
                <summary style="cursor:pointer;font-weight:600;margin-bottom:10px;">📊 \${txt.allocation}</summary>
                <div style="display:flex;height:24px;border-radius:6px;overflow:hidden;margin-top:8px;">
                    \${combo.allocation.map(a => \`<div style="width:\${a.percent}%;background:\${a.color};" title="\${a.product} \${a.percent}%"></div>\`).join('')}
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                    \${combo.allocation.map(a => \`
                        <span style="font-size:0.75rem;"><span style="color:\${a.color};">●</span> \${a.product} \${a.percent}%</span>
                    \`).join('')}
                </div>
            </details>

            <!-- Buy with Card -->
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid #333;">
                <button onclick="CombosModule.openBuyWithCard()" style="
                    width:100%;padding:12px;border-radius:10px;border:1px solid #4a9eff;
                    background:rgba(74,158,255,0.1);color:#4a9eff;font-weight:500;cursor:pointer;
                    display:flex;align-items:center;justify-content:center;gap:8px;
                ">💳 \${txt.buyWithCard}</button>
            </div>
        \`;
    },`;

// Replace the updatePreview function
const regex = /updatePreview\(\)\s*\{[\s\S]*?\n    \},\n\n    \/\/ Open buy/;
combos = combos.replace(regex, newUpdatePreview + '\n\n    // Open buy');

// Update executeInvest to save to InvestmentTracker
combos = combos.replace(
    `// Simulate investment
        console.log('[Combos] Investing', amount, 'in', this.selectedCombo.name);`,
    `// Save investment to tracker
        if (typeof InvestmentTracker !== 'undefined') {
            InvestmentTracker.addInvestment(this.selectedCombo, amount);
        }
        console.log('[Combos] Investing', amount, 'in', this.selectedCombo.name);`
);

fs.writeFileSync('js/combos.js', combos);
console.log('✅ combos.js updated with detailed projections and PnL tracking');

// Update bg-animations.js to add slower speeds
let bgAnim = fs.readFileSync('js/bg-animations.js', 'utf8');

// Add slower speed options
if (!bgAnim.includes('0.25')) {
    bgAnim = bgAnim.replace(
        `animationSpeed: 1,`,
        `animationSpeed: 1,
    speedOptions: [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2],`
    );

    // Update the speed slider to support lower values
    bgAnim = bgAnim.replace(
        /value="\${this\.animationSpeed}" min="0\.5" max="2"/g,
        'value="${this.animationSpeed}" min="0.1" max="2" step="0.05"'
    );

    fs.writeFileSync('js/bg-animations.js', bgAnim);
    console.log('✅ bg-animations.js updated with slower speed options (0.1x to 2x)');
} else {
    console.log('ℹ️ Speed options already updated');
}

// Add investment-tracker.js to app.html
let app = fs.readFileSync('app.html', 'utf8');
if (!app.includes('investment-tracker.js')) {
    app = app.replace(
        '<script src="js/combos.js"></script>',
        '<script src="js/combos.js"></script>\n    <script src="js/investment-tracker.js"></script>'
    );
    fs.writeFileSync('app.html', app);
    console.log('✅ investment-tracker.js added to app.html');
}
