const fs = require('fs');

// Read the i18n.js file
const filePath = 'js/i18n.js';
let content = fs.readFileSync(filePath, 'utf8');

// English translations to add
const enTranslations = `
            // Combos
            combos: 'Combos',
            combo_products: 'Investment Combos',
            combo_desc: 'Diversified investment products combining multiple strategies',
            select_combo: 'Select a combo',
            invest_amount: 'Investment Amount',
            invest_now: 'Invest Now',
            allocation: 'Allocation',
            product: 'Product',
            invested: 'Invested',
            max_gain: 'Max Gain',
            max_loss: 'Max Loss',
            annual_yield_estimate: 'Estimated Annual Yield',
            optimistic_case: 'Optimistic',
            average_case: 'Average',
            worst_case: 'Worst case',
            potential_gain: 'Potential Gain',
            max_risk: 'Max Risk',

            // Leaderboard
            top_traders_live: 'Top Traders Live',
            live_ranking: 'Real-time ranking',
            pnl_24h: 'PnL 24h',
            win_rate: 'Win Rate',
            volume: 'Volume',
            streak: 'Streak',
            status: 'Status',
            live: 'Live',
            trader: 'Trader',
            trades: 'trades'`;

// French translations to add
const frTranslations = `
            // Combos
            combos: 'Combos',
            combo_products: 'Combos d\\'investissement',
            combo_desc: 'Produits d\\'investissement diversifiés combinant plusieurs stratégies',
            select_combo: 'Sélectionnez un combo',
            invest_amount: 'Montant à investir',
            invest_now: 'Investir',
            allocation: 'Répartition',
            product: 'Produit',
            invested: 'Investi',
            max_gain: 'Gain max',
            max_loss: 'Perte max',
            annual_yield_estimate: 'Rendement annuel estimé',
            optimistic_case: 'Optimiste',
            average_case: 'Moyenne',
            worst_case: 'Pire cas',
            potential_gain: 'Gain potentiel',
            max_risk: 'Risque max',

            // Leaderboard
            top_traders_live: 'Top Traders Live',
            live_ranking: 'Classement en temps réel',
            pnl_24h: 'PnL 24h',
            win_rate: 'Taux de réussite',
            volume: 'Volume',
            streak: 'Série',
            status: 'Statut',
            live: 'En ligne',
            trader: 'Trader',
            trades: 'trades'`;

// Spanish translations
const esTranslations = `
            // Combos
            combos: 'Combos',
            combo_products: 'Combos de inversión',
            combo_desc: 'Productos de inversión diversificados que combinan múltiples estrategias',
            select_combo: 'Selecciona un combo',
            invest_amount: 'Monto a invertir',
            invest_now: 'Invertir',
            allocation: 'Distribución',
            product: 'Producto',
            invested: 'Invertido',
            max_gain: 'Ganancia máx',
            max_loss: 'Pérdida máx',
            annual_yield_estimate: 'Rendimiento anual estimado',
            optimistic_case: 'Optimista',
            average_case: 'Promedio',
            worst_case: 'Peor caso',
            potential_gain: 'Ganancia potencial',
            max_risk: 'Riesgo máx',

            // Leaderboard
            top_traders_live: 'Top Traders en vivo',
            live_ranking: 'Clasificación en tiempo real',
            pnl_24h: 'PnL 24h',
            win_rate: 'Tasa de éxito',
            volume: 'Volumen',
            streak: 'Racha',
            status: 'Estado',
            live: 'En vivo',
            trader: 'Trader',
            trades: 'trades'`;

// German translations
const deTranslations = `
            // Combos
            combos: 'Kombos',
            combo_products: 'Investment-Kombos',
            combo_desc: 'Diversifizierte Anlageprodukte die mehrere Strategien kombinieren',
            select_combo: 'Kombo auswählen',
            invest_amount: 'Investitionsbetrag',
            invest_now: 'Jetzt investieren',
            allocation: 'Verteilung',
            product: 'Produkt',
            invested: 'Investiert',
            max_gain: 'Max Gewinn',
            max_loss: 'Max Verlust',
            annual_yield_estimate: 'Geschätzte Jahresrendite',
            optimistic_case: 'Optimistisch',
            average_case: 'Durchschnitt',
            worst_case: 'Schlimmster Fall',
            potential_gain: 'Potenzieller Gewinn',
            max_risk: 'Max Risiko',

            // Leaderboard
            top_traders_live: 'Top Trader Live',
            live_ranking: 'Echtzeit-Rangliste',
            pnl_24h: 'PnL 24h',
            win_rate: 'Erfolgsrate',
            volume: 'Volumen',
            streak: 'Serie',
            status: 'Status',
            live: 'Live',
            trader: 'Trader',
            trades: 'Trades'`;

// Add to English section (before "fr: {")
if (!content.includes('combo_products:')) {
    content = content.replace(
        /settings_reset: 'Settings reset to default'\s*\},\s*\n\s*fr: \{/,
        `settings_reset: 'Settings reset to default',${enTranslations}
        },

        fr: {`
    );

    // Add to French section (before "es: {")
    content = content.replace(
        /settings_reset: 'Paramètres réinitialisés'\s*\},\s*\n\s*es: \{/,
        `settings_reset: 'Paramètres réinitialisés',${frTranslations}
        },

        es: {`
    );

    // Add to Spanish section (before "de: {")
    content = content.replace(
        /settings_reset: 'Configuración restablecida'\s*\},\s*\n\s*de: \{/,
        `settings_reset: 'Configuración restablecida',${esTranslations}
        },

        de: {`
    );

    // Add to German section (before closing brace of translations object)
    content = content.replace(
        /settings_reset: 'Einstellungen zurückgesetzt'\s*\}\s*\n\s*\},/,
        `settings_reset: 'Einstellungen zurückgesetzt',${deTranslations}
        }
    },`
    );

    fs.writeFileSync(filePath, content);
    console.log('✅ i18n.js updated with combos and leaderboard translations');
} else {
    console.log('ℹ️ Translations already present');
}
