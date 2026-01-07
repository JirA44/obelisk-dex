const fs = require('fs');

// Fix combos.js - replace all text with proper i18n
let combos = fs.readFileSync('js/combos.js', 'utf8');

// Helper for i18n
const t = (key, fr) => `\${(typeof I18n !== 'undefined' && I18n.currentLang === 'fr') ? '${fr}' : I18n.t('${key}')}`;

// Complete rewrite of updatePreview to fix franglais
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

        // Translations
        const txt = {
            minimum: isFr ? 'Minimum requis' : isEs ? 'Mínimo requerido' : isDe ? 'Mindestbetrag' : 'Minimum required',
            projection: isFr ? 'Projection à 1 an' : isEs ? 'Proyección a 1 año' : isDe ? 'Prognose 1 Jahr' : '1 Year Projection',
            optimistic: isFr ? 'Optimiste' : isEs ? 'Optimista' : isDe ? 'Optimistisch' : 'Optimistic',
            average: isFr ? 'Moyen' : isEs ? 'Promedio' : isDe ? 'Durchschnitt' : 'Average',
            worstCase: isFr ? 'Pire cas' : isEs ? 'Peor caso' : isDe ? 'Schlimmster Fall' : 'Worst case',
            potentialGain: isFr ? 'Gain potentiel / an' : isEs ? 'Ganancia potencial / año' : isDe ? 'Potenzieller Gewinn / Jahr' : 'Potential gain / year',
            maxRisk: isFr ? 'Perte max' : isEs ? 'Pérdida máx' : isDe ? 'Max Verlust' : 'Max loss',
            protected: isFr ? 'Protégé' : isEs ? 'Protegido' : isDe ? 'Geschützt' : 'Protected',
            risk: isFr ? 'Risque' : isEs ? 'Riesgo' : isDe ? 'Risiko' : 'Risk',
            allocation: isFr ? 'Détail par produit' : isEs ? 'Detalle por producto' : isDe ? 'Details pro Produkt' : 'Product details',
            product: isFr ? 'Produit' : isEs ? 'Producto' : isDe ? 'Produkt' : 'Product',
            invested: isFr ? 'Investi' : isEs ? 'Invertido' : isDe ? 'Investiert' : 'Invested',
            maxGain: isFr ? 'Gain max' : isEs ? 'Ganancia máx' : isDe ? 'Max Gewinn' : 'Max gain',
            maxLoss: isFr ? 'Perte max' : isEs ? 'Pérdida máx' : isDe ? 'Max Verlust' : 'Max loss',
            buyWithCard: isFr ? 'Acheter USDC par Carte Bancaire' : isEs ? 'Comprar USDC con Tarjeta' : isDe ? 'USDC mit Karte kaufen' : 'Buy USDC with Card',
            cardFees: isFr ? 'Visa, Mastercard, Apple Pay • Frais ~2.9%' : isEs ? 'Visa, Mastercard, Apple Pay • Comisión ~2.9%' : isDe ? 'Visa, Mastercard, Apple Pay • Gebühr ~2.9%' : 'Visa, Mastercard, Apple Pay • Fee ~2.9%'
        };

        if (amount < combo.minInvestment) {
            preview.innerHTML = \`<p style="color:#ff6464;text-align:center;">\${txt.minimum}: $\${combo.minInvestment}</p>\`;
            return;
        }

        const apyMin = parseFloat(combo.expectedApy.split('-')[0]);
        const apyMax = parseFloat(combo.expectedApy.split('-')[1] || apyMin);
        const yearlyMin = (amount * apyMin / 100);
        const yearlyMax = (amount * apyMax / 100);

        const protectionPercent = parseFloat(combo.capitalProtection);
        const maxLossPercent = 100 - protectionPercent;
        const protectedAmount = amount * protectionPercent / 100;
        const maxLossAmount = amount * maxLossPercent / 100;

        const bestCase = amount + yearlyMax;
        const expectedCase = amount + (yearlyMin + yearlyMax) / 2;
        const worstCase = protectedAmount;

        preview.innerHTML = \`
            <div style="margin-bottom:15px;">
                <div style="color:#888;font-size:0.75rem;margin-bottom:8px;text-transform:uppercase;">\${txt.projection}</div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#00ff88;">🚀 \${txt.optimistic}</span>
                    <span style="color:#00ff88;font-weight:600;">$\${bestCase.toFixed(0)} <span style="font-size:0.8rem;">(+\${apyMax}%)</span></span>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#ffaa00;">📊 \${txt.average}</span>
                    <span style="color:#ffaa00;font-weight:600;">$\${expectedCase.toFixed(0)} <span style="font-size:0.8rem;">(+\${((apyMin + apyMax) / 2).toFixed(0)}%)</span></span>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
                    <span style="color:#ff6464;">⚠️ \${txt.worstCase}</span>
                    <span style="color:#ff6464;font-weight:600;">$\${worstCase.toFixed(0)} <span style="font-size:0.8rem;">(-\${maxLossPercent}%)</span></span>
                </div>
            </div>

            <div style="background:#0a0a15;border-radius:8px;padding:12px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;text-align:center;">
                    <div>
                        <div style="color:#00ff88;font-size:1.2rem;font-weight:700;">+$\${yearlyMin.toFixed(0)} \${isFr ? 'à' : isEs ? 'a' : isDe ? 'bis' : 'to'} +$\${yearlyMax.toFixed(0)}</div>
                        <div style="color:#666;font-size:0.7rem;">\${txt.potentialGain}</div>
                    </div>
                    <div>
                        <div style="color:#ff6464;font-size:1.2rem;font-weight:700;">-$\${maxLossAmount.toFixed(0)} max</div>
                        <div style="color:#666;font-size:0.7rem;">\${txt.maxRisk} (-\${maxLossPercent}%)</div>
                    </div>
                </div>
            </div>

            <div style="background:linear-gradient(90deg,#00d4aa33 \${protectionPercent}%,#ff646433 \${protectionPercent}%);border-radius:6px;padding:10px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;">
                    <span>🛡️ \${txt.protected}: <strong style="color:#00d4aa;">$\${protectedAmount.toFixed(0)}</strong></span>
                    <span>⚡ \${txt.risk}: <strong style="color:#ff6464;">$\${maxLossAmount.toFixed(0)}</strong></span>
                </div>
            </div>

            <details style="color:#888;font-size:0.8rem;" open>
                <summary style="cursor:pointer;font-weight:600;margin-bottom:10px;">📊 \${txt.allocation}</summary>
                <div style="margin-top:8px;">
                    <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;font-size:0.75rem;padding-bottom:6px;border-bottom:1px solid #333;margin-bottom:6px;">
                        <span>\${txt.product}</span>
                        <span style="text-align:right;">\${txt.invested}</span>
                        <span style="text-align:right;color:#00ff88;">\${txt.maxGain}</span>
                        <span style="text-align:right;color:#ff6464;">\${txt.maxLoss}</span>
                    </div>
                    \${combo.allocation.map(a => {
                        const invested = amount * a.percent / 100;
                        const apyMax = parseFloat((a.apy || '10-20%').split('-')[1]);
                        const maxGain = invested * apyMax / 100;
                        const maxLossAmt = invested * (a.maxLoss || 20) / 100;
                        return \`
                        <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;padding:6px 0;border-bottom:1px solid #222;">
                            <span style="color:\${a.color};">● \${a.product}</span>
                            <span style="text-align:right;color:#fff;">$\${invested.toFixed(0)}</span>
                            <span style="text-align:right;color:#00ff88;">+$\${maxGain.toFixed(0)}</span>
                            <span style="text-align:right;color:#ff6464;">-$\${maxLossAmt.toFixed(0)}</span>
                        </div>\`;
                    }).join('')}
                    <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;padding:8px 0;font-weight:600;border-top:1px solid #444;margin-top:4px;">
                        <span>TOTAL</span>
                        <span style="text-align:right;color:#fff;">$\${amount.toFixed(0)}</span>
                        <span style="text-align:right;color:#00ff88;">+$\${yearlyMax.toFixed(0)}</span>
                        <span style="text-align:right;color:#ff6464;">-$\${maxLossAmount.toFixed(0)}</span>
                    </div>
                </div>
            </details>

            <div style="margin-top:16px;padding-top:16px;border-top:1px solid #333;">
                <button onclick="CombosModule.openBuyWithCard()" style="
                    width: 100%;
                    padding: 14px;
                    border-radius: 10px;
                    border: 1px solid #4a9eff;
                    background: linear-gradient(135deg, rgba(74,158,255,0.15), rgba(74,158,255,0.05));
                    color: #4a9eff;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(74,158,255,0.25)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(74,158,255,0.15), rgba(74,158,255,0.05))'">
                    💳 \${txt.buyWithCard}
                </button>
                <p style="text-align:center;color:#666;font-size:0.75rem;margin-top:8px;">
                    \${txt.cardFees}
                </p>
            </div>
        \`;
    },`;

// Find and replace updatePreview function
const updatePreviewRegex = /updatePreview\(\)\s*\{[\s\S]*?\n    \},\n\n    \/\/ Open buy with card/;
combos = combos.replace(updatePreviewRegex, newUpdatePreview + '\n\n    // Open buy with card');

// Also fix openInvestModal title
combos = combos.replace(
    'title.innerHTML = `<span data-i18n="invest_amount">Investir dans</span> ${this.selectedCombo.name}`;',
    `const lang = (typeof I18n !== 'undefined') ? I18n.currentLang : 'en';
        const investIn = lang === 'fr' ? 'Investir dans' : lang === 'es' ? 'Invertir en' : lang === 'de' ? 'Investieren in' : 'Invest in';
        title.textContent = investIn + ' ' + this.selectedCombo.name;`
);

// Fix buttons in renderComboCard
combos = combos.replace(
    `>
                        Investir
                    </button>`,
    ` data-i18n="invest_now">
                        Investir
                    </button>`
);

combos = combos.replace(
    `>
                        Détails
                    </button>`,
    ` data-i18n="details">
                        Détails
                    </button>`
);

fs.writeFileSync('js/combos.js', combos);
console.log('✅ combos.js fixed - no more franglais!');
