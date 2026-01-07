const fs = require('fs');

// Read combos.js
const filePath = 'js/combos.js';
let content = fs.readFileSync(filePath, 'utf8');

// Helper function - use I18n.t() with fallback
const getT = () => `(typeof I18n !== 'undefined' ? I18n.t : (k => k))`;

// Replace hardcoded French strings with i18n calls
const replacements = [
    // Button text
    ['>Investir</button>', ` data-i18n="invest_now">Investir</button>`],
    ['>Détails</button>', ` data-i18n="details">Détails</button>`],

    // Modal title
    [`title.textContent = \`Investir dans \${this.selectedCombo.name}\`;`,
     `title.innerHTML = \`<span data-i18n="invest_amount">Investir dans</span> \${this.selectedCombo.name}\`;`],

    // Preview labels - first update the projection heading
    [`<div style="color:#888;font-size:0.75rem;margin-bottom:8px;text-transform:uppercase;">Projection à 1 an</div>`,
     `<div style="color:#888;font-size:0.75rem;margin-bottom:8px;text-transform:uppercase;">\${(typeof I18n !== 'undefined' ? I18n.t('annual_yield_estimate') : 'Projection à 1 an')}</div>`],

    // Scenario labels
    [`🚀 Optimiste</span>`, `🚀 \${(typeof I18n !== 'undefined' ? I18n.t('optimistic_case') : 'Optimiste')}</span>`],
    [`📊 Moyen</span>`, `📊 \${(typeof I18n !== 'undefined' ? I18n.t('average_case') : 'Moyen')}</span>`],
    [`⚠️ Pire cas</span>`, `⚠️ \${(typeof I18n !== 'undefined' ? I18n.t('worst_case') : 'Pire cas')}</span>`],

    // Gain/Risk labels
    [`>Gain potentiel / an</div>`, ` data-i18n="potential_gain">Gain potentiel / an</div>`],
    [`>Perte max (-\${maxLossPercent}%)</div>`, `>\${(typeof I18n !== 'undefined' ? I18n.t('max_risk') : 'Perte max')} (-\${maxLossPercent}%)</div>`],

    // Detail headers
    [`<summary style="cursor:pointer;font-weight:600;margin-bottom:10px;">📊 Détail par produit (gains & pertes)</summary>`,
     `<summary style="cursor:pointer;font-weight:600;margin-bottom:10px;">📊 \${(typeof I18n !== 'undefined' ? I18n.t('allocation') : 'Détail par produit')}</summary>`],

    // Column headers in detail section
    [`<span>Produit</span>`, `<span>\${(typeof I18n !== 'undefined' ? I18n.t('product') : 'Produit')}</span>`],
    [`<span style="text-align:right;">Investi</span>`, `<span style="text-align:right;">\${(typeof I18n !== 'undefined' ? I18n.t('invested') : 'Investi')}</span>`],
    [`<span style="text-align:right;color:#00ff88;">Gain max</span>`, `<span style="text-align:right;color:#00ff88;">\${(typeof I18n !== 'undefined' ? I18n.t('max_gain') : 'Gain max')}</span>`],
    [`<span style="text-align:right;color:#ff6464;">Perte max</span>`, `<span style="text-align:right;color:#ff6464;">\${(typeof I18n !== 'undefined' ? I18n.t('max_loss') : 'Perte max')}</span>`],

    // Minimum required message
    [`preview.innerHTML = \`<p style="color:#ff6464;text-align:center;">Minimum requis: $\${combo.minInvestment}</p>\`;`,
     `preview.innerHTML = \`<p style="color:#ff6464;text-align:center;">Minimum: $\${combo.minInvestment}</p>\`;`],

    // Alerts
    [`alert('Montant insuffisant');`, `alert((typeof I18n !== 'undefined' ? I18n.t('amount') : 'Montant') + ' insuffisant');`],

    // Success message
    [`alert(\`✅ Investissement réussi!\\n\\nCombo: \${this.selectedCombo.name}\\nMontant: $\${amount}\\nAPY attendu: \${this.selectedCombo.expectedApy}\\nProtection: \${this.selectedCombo.capitalProtection}\`);`,
     `alert(\`✅ \${(typeof I18n !== 'undefined' ? I18n.t('invest_now') : 'Investment')} OK!\\n\\nCombo: \${this.selectedCombo.name}\\n\${(typeof I18n !== 'undefined' ? I18n.t('amount') : 'Amount')}: $\${amount}\\nAPY: \${this.selectedCombo.expectedApy}\\nProtection: \${this.selectedCombo.capitalProtection}\`);`]
];

// Apply all replacements
let changes = 0;
replacements.forEach(([from, to]) => {
    if (content.includes(from)) {
        content = content.replace(from, to);
        changes++;
    }
});

// Add translation initialization after init
if (!content.includes('translateUI')) {
    content = content.replace(
        'init() {',
        `init() {
        // Translate UI when language changes
        if (typeof I18n !== 'undefined') {
            document.addEventListener('languageChanged', () => this.render());
        }`
    );
    changes++;
}

fs.writeFileSync(filePath, content);
console.log(`✅ combos.js updated with i18n support (${changes} changes)`);
