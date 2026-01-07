// Patch: Add translations for "What is Obelisk" section
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Check if translations already added
if (html.includes('aboutTitle')) {
    console.log('Translations already added!');
    process.exit(0);
}

// English translations to add after 'liveRefresh: \'Live Refresh\''
const enTranslations = `liveRefresh: 'Live Refresh',
                // About Section
                aboutTitle: 'What is OBELISK?',
                aboutSubtitle: 'The next-generation decentralized exchange built for the quantum computing era',
                aboutDesc1: 'OBELISK is a non-custodial decentralized exchange (DEX) that combines the power of multiple liquidity sources with military-grade post-quantum cryptography. Unlike traditional exchanges, we never hold your funds - you always maintain complete control of your assets.',
                aboutDesc2: 'We aggregate real-time prices from Hyperliquid, dYdX, Uniswap, Binance, Coinbase and Kraken to give you the best execution across 600+ trading pairs.',
                specPqTitle: 'Post-Quantum Security',
                specPqDesc: 'First DEX using CRYSTALS-Kyber & Dilithium algorithms. Your assets are protected against future quantum computer attacks.',
                specMultiTitle: 'Multi-Source Aggregator',
                specMultiDesc: 'Real-time prices from 6 major sources. Best execution guaranteed with millisecond updates.',
                specToolsTitle: 'Exclusive Pro Tools',
                specToolsDesc: 'Liquidation Sniper, Smart Money Tracker, Rug Pull Detector, Cross-DEX Arbitrage, Funding Rate Arb, AI Trade Signals.',
                specPassiveTitle: 'Risk-Free Passive Products',
                specPassiveDesc: 'Staking, Protected Vaults, Fixed Bonds (4-12% APY), Index Baskets, Yield Optimizer - 14 combo strategies available.',
                specCustodyTitle: '100% Self-Custody',
                specCustodyDesc: 'Your keys, your crypto. We never store private keys. Connect your wallet, trade securely, withdraw anytime.',
                specTradingTitle: 'Pro Trading Features',
                specTradingDesc: 'Up to 100x leverage, Grid Bots, DCA Automation, Copy Trading, Trailing Stops, Whale Tracking, PnL Analytics.'`;

// French translations
const frTranslations = `liveRefresh: 'Temps Réel',
                // About Section
                aboutTitle: 'Qu\\'est-ce qu\\'OBELISK ?',
                aboutSubtitle: 'L\\'exchange décentralisé nouvelle génération conçu pour l\\'ère de l\\'informatique quantique',
                aboutDesc1: 'OBELISK est un exchange décentralisé (DEX) non-custodial qui combine la puissance de multiples sources de liquidité avec une cryptographie post-quantique de niveau militaire. Contrairement aux exchanges traditionnels, nous ne détenons jamais vos fonds - vous gardez toujours le contrôle total de vos actifs.',
                aboutDesc2: 'Nous agrégeons les prix en temps réel de Hyperliquid, dYdX, Uniswap, Binance, Coinbase et Kraken pour vous offrir la meilleure exécution sur plus de 600 paires de trading.',
                specPqTitle: 'Sécurité Post-Quantique',
                specPqDesc: 'Premier DEX utilisant les algorithmes CRYSTALS-Kyber & Dilithium. Vos actifs sont protégés contre les futures attaques d\\'ordinateurs quantiques.',
                specMultiTitle: 'Agrégateur Multi-Sources',
                specMultiDesc: 'Prix en temps réel de 6 sources majeures. Meilleure exécution garantie avec mises à jour en millisecondes.',
                specToolsTitle: 'Outils Pro Exclusifs',
                specToolsDesc: 'Sniper de Liquidations, Tracker Smart Money, Détecteur de Rug Pull, Arbitrage Cross-DEX, Arbitrage Funding Rate, Signaux IA.',
                specPassiveTitle: 'Produits Passifs Sans Risque',
                specPassiveDesc: 'Staking, Vaults Protégés, Obligations Fixes (4-12% APY), Paniers Index, Optimiseur de Rendement - 14 stratégies combo disponibles.',
                specCustodyTitle: '100% Auto-Custody',
                specCustodyDesc: 'Vos clés, vos cryptos. Nous ne stockons jamais vos clés privées. Connectez votre wallet, tradez en sécurité, retirez à tout moment.',
                specTradingTitle: 'Fonctionnalités Pro Trading',
                specTradingDesc: 'Jusqu\\'à 100x de levier, Bots Grid, Automation DCA, Copy Trading, Trailing Stops, Suivi des Whales, Analytics PnL.'`;

// Spanish translations
const esTranslations = `liveRefresh: 'Tiempo Real',
                // About Section
                aboutTitle: '¿Qué es OBELISK?',
                aboutSubtitle: 'El exchange descentralizado de nueva generación construido para la era de la computación cuántica',
                aboutDesc1: 'OBELISK es un exchange descentralizado (DEX) sin custodia que combina el poder de múltiples fuentes de liquidez con criptografía post-cuántica de grado militar. A diferencia de los exchanges tradicionales, nunca guardamos tus fondos - siempre mantienes el control total de tus activos.',
                aboutDesc2: 'Agregamos precios en tiempo real de Hyperliquid, dYdX, Uniswap, Binance, Coinbase y Kraken para darte la mejor ejecución en más de 600 pares de trading.',
                specPqTitle: 'Seguridad Post-Cuántica',
                specPqDesc: 'Primer DEX usando algoritmos CRYSTALS-Kyber & Dilithium. Tus activos están protegidos contra futuros ataques de computadoras cuánticas.',
                specMultiTitle: 'Agregador Multi-Fuente',
                specMultiDesc: 'Precios en tiempo real de 6 fuentes principales. Mejor ejecución garantizada con actualizaciones en milisegundos.',
                specToolsTitle: 'Herramientas Pro Exclusivas',
                specToolsDesc: 'Sniper de Liquidaciones, Tracker Smart Money, Detector de Rug Pull, Arbitraje Cross-DEX, Arbitraje Funding Rate, Señales IA.',
                specPassiveTitle: 'Productos Pasivos Sin Riesgo',
                specPassiveDesc: 'Staking, Vaults Protegidos, Bonos Fijos (4-12% APY), Cestas Index, Optimizador de Rendimiento - 14 estrategias combo disponibles.',
                specCustodyTitle: '100% Auto-Custodia',
                specCustodyDesc: 'Tus llaves, tu crypto. Nunca almacenamos claves privadas. Conecta tu wallet, opera seguro, retira cuando quieras.',
                specTradingTitle: 'Funciones Pro Trading',
                specTradingDesc: 'Hasta 100x de apalancamiento, Bots Grid, Automatización DCA, Copy Trading, Trailing Stops, Seguimiento de Whales, Analytics PnL.'`;

// German translations
const deTranslations = `liveRefresh: 'Live-Aktualisierung',
                // About Section
                aboutTitle: 'Was ist OBELISK?',
                aboutSubtitle: 'Die dezentralisierte Börse der nächsten Generation für das Zeitalter der Quantencomputer',
                aboutDesc1: 'OBELISK ist eine nicht-verwahrende dezentralisierte Börse (DEX), die die Kraft mehrerer Liquiditätsquellen mit Post-Quanten-Kryptographie auf Militärniveau kombiniert. Im Gegensatz zu traditionellen Börsen halten wir niemals Ihre Gelder - Sie behalten immer die volle Kontrolle über Ihre Assets.',
                aboutDesc2: 'Wir aggregieren Echtzeitpreise von Hyperliquid, dYdX, Uniswap, Binance, Coinbase und Kraken, um Ihnen die beste Ausführung bei über 600 Handelspaaren zu bieten.',
                specPqTitle: 'Post-Quanten-Sicherheit',
                specPqDesc: 'Erste DEX mit CRYSTALS-Kyber & Dilithium Algorithmen. Ihre Assets sind vor zukünftigen Quantencomputer-Angriffen geschützt.',
                specMultiTitle: 'Multi-Quellen-Aggregator',
                specMultiDesc: 'Echtzeitpreise von 6 Hauptquellen. Beste Ausführung garantiert mit Millisekunden-Updates.',
                specToolsTitle: 'Exklusive Pro-Tools',
                specToolsDesc: 'Liquidations-Sniper, Smart Money Tracker, Rug Pull Detektor, Cross-DEX Arbitrage, Funding Rate Arb, KI-Signale.',
                specPassiveTitle: 'Risikofreie Passive Produkte',
                specPassiveDesc: 'Staking, Geschützte Vaults, Festzinsanleihen (4-12% APY), Index-Körbe, Rendite-Optimierer - 14 Combo-Strategien verfügbar.',
                specCustodyTitle: '100% Selbstverwahrung',
                specCustodyDesc: 'Ihre Schlüssel, Ihre Kryptos. Wir speichern niemals private Schlüssel. Wallet verbinden, sicher handeln, jederzeit abheben.',
                specTradingTitle: 'Pro-Trading-Funktionen',
                specTradingDesc: 'Bis zu 100x Hebel, Grid Bots, DCA Automatisierung, Copy Trading, Trailing Stops, Whale Tracking, PnL Analytics.'`;

// Apply patches
html = html.replace("liveRefresh: 'Live Refresh'\n            },\n            fr:", enTranslations + "\n            },\n            fr:");
html = html.replace("liveRefresh: 'Temps Réel'\n            },\n            es:", frTranslations + "\n            },\n            es:");
html = html.replace("liveRefresh: 'Tiempo Real'\n            },\n            de:", esTranslations + "\n            },\n            de:");
html = html.replace("liveRefresh: 'Live-Aktualisierung'\n            }\n        };", deTranslations + "\n            }\n        };");

// Add translation update function for about section
const translationUpdateCode = `
            // Update About section
            const aboutTitle = document.getElementById('about-title');
            if (aboutTitle && t.aboutTitle) {
                aboutTitle.innerHTML = 'What is <span style="background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">OBELISK</span>?';
                if (lang === 'fr') aboutTitle.innerHTML = 'Qu\\'est-ce qu\\'<span style="background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">OBELISK</span> ?';
                if (lang === 'es') aboutTitle.innerHTML = '¿Qué es <span style="background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">OBELISK</span>?';
                if (lang === 'de') aboutTitle.innerHTML = 'Was ist <span style="background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">OBELISK</span>?';
            }
            const aboutSubtitle = document.getElementById('about-subtitle');
            if (aboutSubtitle && t.aboutSubtitle) aboutSubtitle.textContent = t.aboutSubtitle;
            const aboutDesc1 = document.getElementById('about-desc-1');
            if (aboutDesc1 && t.aboutDesc1) aboutDesc1.innerHTML = t.aboutDesc1.replace(/OBELISK/g, '<strong>OBELISK</strong>').replace(/non-custodial decentralized exchange \\(DEX\\)/g, '<strong>non-custodial decentralized exchange (DEX)</strong>');
            const aboutDesc2 = document.getElementById('about-desc-2');
            if (aboutDesc2 && t.aboutDesc2) aboutDesc2.innerHTML = t.aboutDesc2;

            // Specialty cards
            const specPqTitle = document.getElementById('spec-pq-title');
            if (specPqTitle && t.specPqTitle) specPqTitle.textContent = t.specPqTitle;
            const specPqDesc = document.getElementById('spec-pq-desc');
            if (specPqDesc && t.specPqDesc) specPqDesc.textContent = t.specPqDesc;
            const specMultiTitle = document.getElementById('spec-multi-title');
            if (specMultiTitle && t.specMultiTitle) specMultiTitle.textContent = t.specMultiTitle;
            const specMultiDesc = document.getElementById('spec-multi-desc');
            if (specMultiDesc && t.specMultiDesc) specMultiDesc.textContent = t.specMultiDesc;
            const specToolsTitle = document.getElementById('spec-tools-title');
            if (specToolsTitle && t.specToolsTitle) specToolsTitle.textContent = t.specToolsTitle;
            const specToolsDesc = document.getElementById('spec-tools-desc');
            if (specToolsDesc && t.specToolsDesc) specToolsDesc.textContent = t.specToolsDesc;
            const specPassiveTitle = document.getElementById('spec-passive-title');
            if (specPassiveTitle && t.specPassiveTitle) specPassiveTitle.textContent = t.specPassiveTitle;
            const specPassiveDesc = document.getElementById('spec-passive-desc');
            if (specPassiveDesc && t.specPassiveDesc) specPassiveDesc.textContent = t.specPassiveDesc;
            const specCustodyTitle = document.getElementById('spec-custody-title');
            if (specCustodyTitle && t.specCustodyTitle) specCustodyTitle.textContent = t.specCustodyTitle;
            const specCustodyDesc = document.getElementById('spec-custody-desc');
            if (specCustodyDesc && t.specCustodyDesc) specCustodyDesc.textContent = t.specCustodyDesc;
            const specTradingTitle = document.getElementById('spec-trading-title');
            if (specTradingTitle && t.specTradingTitle) specTradingTitle.textContent = t.specTradingTitle;
            const specTradingDesc = document.getElementById('spec-trading-desc');
            if (specTradingDesc && t.specTradingDesc) specTradingDesc.textContent = t.specTradingDesc;

            // Save preference`;

html = html.replace("// Save preference", translationUpdateCode);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Translations added successfully for EN/FR/ES/DE!');
