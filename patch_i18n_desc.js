const fs = require('fs');

let i18n = fs.readFileSync('js/i18n.js', 'utf8');

// Add description translations for each language
const descTranslations = {
    en: `
            // Investment descriptions
            staking_desc: 'Lock tokens to secure networks and earn rewards',
            pools_desc: 'Provide liquidity to earn trading fees',
            vaults_desc: 'Automated yield strategies with auto-compound',
            lending_desc: 'Earn interest by lending your crypto',
            savings_desc: 'Simple interest-bearing accounts',
            index_desc: 'Diversified crypto portfolios',
            liquidity_pools: 'Liquidity Pools',`,

    fr: `
            // Descriptions investissements
            staking_desc: 'Verrouillez des tokens pour sécuriser les réseaux et gagner des récompenses',
            pools_desc: 'Fournissez de la liquidité pour gagner des frais de trading',
            vaults_desc: 'Stratégies de rendement automatisées avec auto-composition',
            lending_desc: 'Gagnez des intérêts en prêtant vos crypto',
            savings_desc: 'Comptes d\\'épargne simples avec intérêts',
            index_desc: 'Portefeuilles crypto diversifiés',
            liquidity_pools: 'Pools de Liquidité',`,

    es: `
            // Descripciones de inversiones
            staking_desc: 'Bloquea tokens para asegurar redes y ganar recompensas',
            pools_desc: 'Proporciona liquidez para ganar comisiones de trading',
            vaults_desc: 'Estrategias de rendimiento automatizadas con auto-composición',
            lending_desc: 'Gana intereses prestando tus crypto',
            savings_desc: 'Cuentas de ahorro simples con intereses',
            index_desc: 'Carteras crypto diversificadas',
            liquidity_pools: 'Pools de Liquidez',`,

    de: `
            // Investitionsbeschreibungen
            staking_desc: 'Token sperren um Netzwerke zu sichern und Belohnungen zu verdienen',
            pools_desc: 'Liquidität bereitstellen um Trading-Gebühren zu verdienen',
            vaults_desc: 'Automatisierte Renditestrategien mit Auto-Compound',
            lending_desc: 'Zinsen verdienen durch Krypto-Verleih',
            savings_desc: 'Einfache verzinsliche Sparkonten',
            index_desc: 'Diversifizierte Krypto-Portfolios',
            liquidity_pools: 'Liquiditätspools',`
};

// Add to each language section
for (const [lang, translations] of Object.entries(descTranslations)) {
    const marker = lang === 'en' ? "high: 'High'" :
                   lang === 'fr' ? "high: 'Élevé'" :
                   lang === 'es' ? "high: 'Alto'" :
                   "high: 'Hoch'";

    if (i18n.includes(marker) && !i18n.includes(`staking_desc:`)) {
        i18n = i18n.replace(marker, marker + ',' + translations);
        console.log(`✅ ${lang.toUpperCase()} descriptions added`);
    }
}

fs.writeFileSync('js/i18n.js', i18n);
console.log('\\n🌍 All investment descriptions translated!');
