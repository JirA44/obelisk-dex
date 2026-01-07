const fs = require('fs');

let i18n = fs.readFileSync('js/i18n.js', 'utf8');

// English investment translations
const enInvestments = `
            // Investments
            investments: 'Investments',
            invest: 'Invest',
            staking: 'Staking',
            liquidity_pools: 'Liquidity Pools',
            vaults: 'Vaults',
            lending: 'Lending',
            savings: 'Savings',
            index_funds: 'Index Funds',
            tvl: 'TVL',
            risk: 'Risk',
            withdraw: 'Withdraw',
            my_portfolio: 'My Portfolio',
            total_invested: 'Total Invested',
            total_earnings: 'Total Earnings',
            view_all: 'View All',
            stake: 'Stake',
            unstake: 'Unstake',
            add_liquidity: 'Add Liquidity',
            remove_liquidity: 'Remove Liquidity',
            buy: 'Buy',
            sell: 'Sell',
            confirm: 'Confirm',
            cancel: 'Cancel',
            lock_period: 'Lock Period',
            days: 'days',
            flexible: 'Flexible',
            auto_compound: 'Auto-compound',
            volume_24h: '24h Volume',
            utilization: 'Utilization',
            supply_apy: 'Supply APY',
            borrow_apy: 'Borrow APY',
            holdings: 'Holdings',
            rebalance: 'Rebalance',
            strategy: 'Strategy',
            protocols: 'Protocols',
            min_deposit: 'Min Deposit',
            performance: 'Performance',
            projected_returns: 'Projected Returns',
            weekly: 'Weekly',
            monthly: 'Monthly',
            yearly: 'Yearly',
            no_investments: 'No investments yet',
            start_investing: 'Start investing to see your portfolio here',
            very_low: 'Very Low',
            low: 'Low',
            medium: 'Medium',
            high: 'High'`;

// French investment translations
const frInvestments = `
            // Investissements
            investments: 'Investissements',
            invest: 'Investir',
            staking: 'Staking',
            liquidity_pools: 'Pools de Liquidité',
            vaults: 'Coffres',
            lending: 'Prêts',
            savings: 'Épargne',
            index_funds: 'Fonds Indiciels',
            tvl: 'TVL',
            risk: 'Risque',
            withdraw: 'Retirer',
            my_portfolio: 'Mon Portefeuille',
            total_invested: 'Total Investi',
            total_earnings: 'Gains Totaux',
            view_all: 'Voir Tout',
            stake: 'Staker',
            unstake: 'Unstaker',
            add_liquidity: 'Ajouter Liquidité',
            remove_liquidity: 'Retirer Liquidité',
            buy: 'Acheter',
            sell: 'Vendre',
            confirm: 'Confirmer',
            cancel: 'Annuler',
            lock_period: 'Période de Blocage',
            days: 'jours',
            flexible: 'Flexible',
            auto_compound: 'Auto-composé',
            volume_24h: 'Volume 24h',
            utilization: 'Utilisation',
            supply_apy: 'APY Prêt',
            borrow_apy: 'APY Emprunt',
            holdings: 'Composition',
            rebalance: 'Rééquilibrage',
            strategy: 'Stratégie',
            protocols: 'Protocoles',
            min_deposit: 'Dépôt Min',
            performance: 'Performance',
            projected_returns: 'Rendements Projetés',
            weekly: 'Hebdo',
            monthly: 'Mensuel',
            yearly: 'Annuel',
            no_investments: 'Aucun investissement',
            start_investing: 'Commencez à investir pour voir votre portefeuille',
            very_low: 'Très Faible',
            low: 'Faible',
            medium: 'Moyen',
            high: 'Élevé'`;

// Spanish investment translations
const esInvestments = `
            // Inversiones
            investments: 'Inversiones',
            invest: 'Invertir',
            staking: 'Staking',
            liquidity_pools: 'Pools de Liquidez',
            vaults: 'Bóvedas',
            lending: 'Préstamos',
            savings: 'Ahorros',
            index_funds: 'Fondos Indexados',
            tvl: 'TVL',
            risk: 'Riesgo',
            withdraw: 'Retirar',
            my_portfolio: 'Mi Cartera',
            total_invested: 'Total Invertido',
            total_earnings: 'Ganancias Totales',
            view_all: 'Ver Todo',
            stake: 'Stakear',
            unstake: 'Unstakear',
            add_liquidity: 'Añadir Liquidez',
            remove_liquidity: 'Retirar Liquidez',
            buy: 'Comprar',
            sell: 'Vender',
            confirm: 'Confirmar',
            cancel: 'Cancelar',
            lock_period: 'Período de Bloqueo',
            days: 'días',
            flexible: 'Flexible',
            auto_compound: 'Auto-compuesto',
            volume_24h: 'Volumen 24h',
            utilization: 'Utilización',
            supply_apy: 'APY Préstamo',
            borrow_apy: 'APY Préstamo',
            holdings: 'Composición',
            rebalance: 'Reequilibrio',
            strategy: 'Estrategia',
            protocols: 'Protocolos',
            min_deposit: 'Depósito Mín',
            performance: 'Rendimiento',
            projected_returns: 'Rendimientos Proyectados',
            weekly: 'Semanal',
            monthly: 'Mensual',
            yearly: 'Anual',
            no_investments: 'Sin inversiones',
            start_investing: 'Empieza a invertir para ver tu cartera',
            very_low: 'Muy Bajo',
            low: 'Bajo',
            medium: 'Medio',
            high: 'Alto'`;

// German investment translations
const deInvestments = `
            // Investitionen
            investments: 'Investitionen',
            invest: 'Investieren',
            staking: 'Staking',
            liquidity_pools: 'Liquiditätspools',
            vaults: 'Tresore',
            lending: 'Kredite',
            savings: 'Sparen',
            index_funds: 'Indexfonds',
            tvl: 'TVL',
            risk: 'Risiko',
            withdraw: 'Abheben',
            my_portfolio: 'Mein Portfolio',
            total_invested: 'Gesamt Investiert',
            total_earnings: 'Gesamtgewinn',
            view_all: 'Alle Anzeigen',
            stake: 'Staken',
            unstake: 'Unstaken',
            add_liquidity: 'Liquidität Hinzufügen',
            remove_liquidity: 'Liquidität Entfernen',
            buy: 'Kaufen',
            sell: 'Verkaufen',
            confirm: 'Bestätigen',
            cancel: 'Abbrechen',
            lock_period: 'Sperrfrist',
            days: 'Tage',
            flexible: 'Flexibel',
            auto_compound: 'Auto-Compound',
            volume_24h: '24h Volumen',
            utilization: 'Auslastung',
            supply_apy: 'Einlagen APY',
            borrow_apy: 'Kredit APY',
            holdings: 'Bestände',
            rebalance: 'Rebalancing',
            strategy: 'Strategie',
            protocols: 'Protokolle',
            min_deposit: 'Min Einzahlung',
            performance: 'Leistung',
            projected_returns: 'Projizierte Renditen',
            weekly: 'Wöchentlich',
            monthly: 'Monatlich',
            yearly: 'Jährlich',
            no_investments: 'Keine Investitionen',
            start_investing: 'Starten Sie zu investieren',
            very_low: 'Sehr Niedrig',
            low: 'Niedrig',
            medium: 'Mittel',
            high: 'Hoch'`;

// Add to EN translations (after trades: 'trades')
if (!i18n.includes("investments: 'Investments'")) {
    i18n = i18n.replace(
        "trades: 'trades'\n        },\n\n        fr: {",
        "trades: 'trades'," + enInvestments + "\n        },\n\n        fr: {"
    );
    console.log('✅ EN investment translations added');
}

// Add to FR translations
if (!i18n.includes("investments: 'Investissements'")) {
    i18n = i18n.replace(
        /trades: 'trades'\n(\s+)\},\n\n(\s+)es: \{/,
        "trades: 'trades'," + frInvestments + "\n        },\n\n        es: {"
    );
    console.log('✅ FR investment translations added');
}

// Add to ES translations
if (!i18n.includes("investments: 'Inversiones'")) {
    i18n = i18n.replace(
        /trades: 'trades'\n(\s+)\},\n\n(\s+)de: \{/,
        "trades: 'trades'," + esInvestments + "\n        },\n\n        de: {"
    );
    console.log('✅ ES investment translations added');
}

// Add to DE translations (at the end before the closing brace)
if (!i18n.includes("investments: 'Investitionen'")) {
    // Find the last trades: 'trades' in DE section
    const deTradesMatch = i18n.lastIndexOf("trades: 'trades'");
    if (deTradesMatch > 0) {
        i18n = i18n.slice(0, deTradesMatch) +
               "trades: 'trades'," + deInvestments +
               i18n.slice(deTradesMatch + "trades: 'trades'".length);
        console.log('✅ DE investment translations added');
    }
}

fs.writeFileSync('js/i18n.js', i18n);
console.log('\\n🌍 All investment translations added!');
