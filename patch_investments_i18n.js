const fs = require('fs');

let ui = fs.readFileSync('js/investments-ui.js', 'utf8');

// Replace the internal t() function with one that uses global I18n
const oldTFunction = `    t(key) {
        const translations = {
            en: {
                investments: 'Investments',
                staking: 'Staking',
                pools: 'Liquidity Pools',
                vaults: 'Vaults',
                lending: 'Lending',
                savings: 'Savings',
                indexFunds: 'Index Funds',
                apy: 'APY',
                tvl: 'TVL',
                risk: 'Risk',
                invest: 'Invest',
                withdraw: 'Withdraw',
                myPortfolio: 'My Portfolio',
                totalInvested: 'Total Invested',
                totalEarnings: 'Total Earnings',
                viewAll: 'View All',
                stake: 'Stake',
                unstake: 'Unstake',
                supply: 'Supply',
                borrow: 'Borrow',
                deposit: 'Deposit',
                addLiquidity: 'Add Liquidity',
                removeLiquidity: 'Remove Liquidity',
                buy: 'Buy',
                sell: 'Sell',
                amount: 'Amount',
                balance: 'Balance',
                max: 'MAX',
                confirm: 'Confirm',
                cancel: 'Cancel',
                lockPeriod: 'Lock Period',
                days: 'days',
                flexible: 'Flexible',
                autoCompound: 'Auto-compound',
                fee: 'Fee',
                volume24h: '24h Volume',
                utilization: 'Utilization',
                supplyApy: 'Supply APY',
                borrowApy: 'Borrow APY',
                holdings: 'Holdings',
                rebalance: 'Rebalance',
                strategy: 'Strategy',
                protocols: 'Protocols',
                minDeposit: 'Min Deposit',
                performance: 'Performance',
                projectedReturns: 'Projected Returns',
                weekly: 'Weekly',
                monthly: 'Monthly',
                yearly: 'Yearly',
                noInvestments: 'No investments yet',
                startInvesting: 'Start investing to see your portfolio here'
            },
            fr: {
                investments: 'Investissements',
                staking: 'Staking',
                pools: 'Pools de Liquidité',
                vaults: 'Coffres',
                lending: 'Prêts',
                savings: 'Épargne',
                indexFunds: 'Fonds Indiciels',
                apy: 'APY',
                tvl: 'TVL',
                risk: 'Risque',
                invest: 'Investir',
                withdraw: 'Retirer',
                myPortfolio: 'Mon Portefeuille',
                totalInvested: 'Total Investi',
                totalEarnings: 'Gains Totaux',
                viewAll: 'Voir Tout',
                stake: 'Staker',
                unstake: 'Unstaker',
                supply: 'Fournir',
                borrow: 'Emprunter',
                deposit: 'Déposer',
                addLiquidity: 'Ajouter Liquidité',
                removeLiquidity: 'Retirer Liquidité',
                buy: 'Acheter',
                sell: 'Vendre',
                amount: 'Montant',
                balance: 'Solde',
                max: 'MAX',
                confirm: 'Confirmer',
                cancel: 'Annuler',
                lockPeriod: 'Période de Blocage',
                days: 'jours',
                flexible: 'Flexible',
                autoCompound: 'Auto-composé',
                fee: 'Frais',
                volume24h: 'Volume 24h',
                utilization: 'Utilisation',
                supplyApy: 'APY Prêt',
                borrowApy: 'APY Emprunt',
                holdings: 'Composition',
                rebalance: 'Rééquilibrage',
                strategy: 'Stratégie',
                protocols: 'Protocoles',
                minDeposit: 'Dépôt Min',
                performance: 'Performance',
                projectedReturns: 'Rendements Projetés',
                weekly: 'Hebdomadaire',
                monthly: 'Mensuel',
                yearly: 'Annuel',
                noInvestments: 'Aucun investissement',
                startInvesting: 'Commencez à investir pour voir votre portefeuille ici'
            }
        };
        const lang = this.getLang();
        return (translations[lang] || translations.en)[key] || key;
    },`;

const newTFunction = `    t(key) {
        // Use global I18n if available
        if (typeof I18n !== 'undefined' && I18n.t) {
            // Convert camelCase to snake_case for I18n keys
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            const result = I18n.t(snakeKey);
            if (result !== snakeKey) return result;
        }

        // Fallback translations
        const fallback = {
            en: {
                investments: 'Investments', staking: 'Staking', pools: 'Liquidity Pools',
                vaults: 'Vaults', lending: 'Lending', savings: 'Savings', indexFunds: 'Index Funds',
                apy: 'APY', tvl: 'TVL', risk: 'Risk', invest: 'Invest', withdraw: 'Withdraw',
                myPortfolio: 'My Portfolio', totalInvested: 'Total Invested', totalEarnings: 'Total Earnings',
                viewAll: 'View All', stake: 'Stake', unstake: 'Unstake', supply: 'Supply', borrow: 'Borrow',
                deposit: 'Deposit', addLiquidity: 'Add Liquidity', removeLiquidity: 'Remove Liquidity',
                buy: 'Buy', sell: 'Sell', amount: 'Amount', balance: 'Balance', max: 'MAX',
                confirm: 'Confirm', cancel: 'Cancel', lockPeriod: 'Lock Period', days: 'days',
                flexible: 'Flexible', autoCompound: 'Auto-compound', fee: 'Fee', volume24h: '24h Volume',
                utilization: 'Utilization', supplyApy: 'Supply APY', borrowApy: 'Borrow APY',
                holdings: 'Holdings', rebalance: 'Rebalance', strategy: 'Strategy', protocols: 'Protocols',
                minDeposit: 'Min Deposit', performance: 'Performance', projectedReturns: 'Projected Returns',
                weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
                noInvestments: 'No investments yet', startInvesting: 'Start investing to see your portfolio here'
            },
            fr: {
                investments: 'Investissements', staking: 'Staking', pools: 'Pools de Liquidité',
                vaults: 'Coffres', lending: 'Prêts', savings: 'Épargne', indexFunds: 'Fonds Indiciels',
                apy: 'APY', tvl: 'TVL', risk: 'Risque', invest: 'Investir', withdraw: 'Retirer',
                myPortfolio: 'Mon Portefeuille', totalInvested: 'Total Investi', totalEarnings: 'Gains Totaux',
                viewAll: 'Voir Tout', stake: 'Staker', unstake: 'Unstaker', supply: 'Fournir', borrow: 'Emprunter',
                deposit: 'Déposer', addLiquidity: 'Ajouter Liquidité', removeLiquidity: 'Retirer Liquidité',
                buy: 'Acheter', sell: 'Vendre', amount: 'Montant', balance: 'Solde', max: 'MAX',
                confirm: 'Confirmer', cancel: 'Annuler', lockPeriod: 'Période de Blocage', days: 'jours',
                flexible: 'Flexible', autoCompound: 'Auto-composé', fee: 'Frais', volume24h: 'Volume 24h',
                utilization: 'Utilisation', supplyApy: 'APY Prêt', borrowApy: 'APY Emprunt',
                holdings: 'Composition', rebalance: 'Rééquilibrage', strategy: 'Stratégie', protocols: 'Protocoles',
                minDeposit: 'Dépôt Min', performance: 'Performance', projectedReturns: 'Rendements Projetés',
                weekly: 'Hebdo', monthly: 'Mensuel', yearly: 'Annuel',
                noInvestments: 'Aucun investissement', startInvesting: 'Commencez à investir'
            },
            es: {
                investments: 'Inversiones', staking: 'Staking', pools: 'Pools de Liquidez',
                vaults: 'Bóvedas', lending: 'Préstamos', savings: 'Ahorros', indexFunds: 'Fondos Indexados',
                myPortfolio: 'Mi Cartera', totalInvested: 'Total Invertido', totalEarnings: 'Ganancias',
                stake: 'Stakear', deposit: 'Depositar', addLiquidity: 'Añadir Liquidez',
                buy: 'Comprar', sell: 'Vender', confirm: 'Confirmar', cancel: 'Cancelar',
                weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual'
            },
            de: {
                investments: 'Investitionen', staking: 'Staking', pools: 'Liquiditätspools',
                vaults: 'Tresore', lending: 'Kredite', savings: 'Sparen', indexFunds: 'Indexfonds',
                myPortfolio: 'Mein Portfolio', totalInvested: 'Gesamt Investiert', totalEarnings: 'Gesamtgewinn',
                stake: 'Staken', deposit: 'Einzahlen', addLiquidity: 'Liquidität Hinzufügen',
                buy: 'Kaufen', sell: 'Verkaufen', confirm: 'Bestätigen', cancel: 'Abbrechen',
                weekly: 'Wöchentlich', monthly: 'Monatlich', yearly: 'Jährlich'
            }
        };
        const lang = this.getLang();
        return (fallback[lang] || fallback.en)[key] || (fallback.en)[key] || key;
    },`;

if (ui.includes(oldTFunction)) {
    ui = ui.replace(oldTFunction, newTFunction);
    fs.writeFileSync('js/investments-ui.js', ui);
    console.log('✅ investments-ui.js updated to use I18n');
} else {
    console.log('⚠️ Could not find exact match, updating t() function manually...');

    // Alternative approach: Replace just the t() function logic
    const tFuncStart = ui.indexOf('    t(key) {');
    const tFuncEnd = ui.indexOf('    },', tFuncStart) + 6;

    if (tFuncStart > 0 && tFuncEnd > tFuncStart) {
        ui = ui.slice(0, tFuncStart) + newTFunction + ui.slice(tFuncEnd);
        fs.writeFileSync('js/investments-ui.js', ui);
        console.log('✅ investments-ui.js t() function replaced');
    } else {
        console.log('❌ Could not update t() function');
    }
}
