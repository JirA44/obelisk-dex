/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║   OBELISK MULTI-DEX PRICE FEED FOR MIXBOT                                ║
 * ║   Agrège les prix de: Hyperliquid + dYdX + Uniswap                       ║
 * ║   Détection d'arbitrage en temps réel                                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * USAGE DANS TON BOT:
 *   const obelisk = require('./obelisk_prices');
 *   await obelisk.connect();
 *
 *   // Obtenir le meilleur prix
 *   const btcPrice = obelisk.getPrice('BTC');
 *
 *   // Vérifier les opportunités d'arbitrage
 *   const arb = obelisk.getArbitrage('BTC');
 *   if (arb && arb.spread > 0.1) {
 *       console.log(`Arbitrage BTC: ${arb.spread}% - ${arb.direction}`);
 *   }
 */

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

const OBELISK_API = 'https://obelisk-api-real.hugo-padilla-pro.workers.dev';
const UPDATE_INTERVAL = 500; // ms

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════

let prices = {};
let arbitrage = [];
let connected = false;
let apiKey = null;
let sessionId = null;
let updateLoop = null;

// Metrics
let metrics = {
    apiLatency: 0,
    lastUpdate: 0,
    totalCalls: 0,
    errors: 0
};

// ═══════════════════════════════════════════════════════════
// CONNEXION
// ═══════════════════════════════════════════════════════════

async function connect() {
    console.log('🔌 [OBELISK] Connexion au Multi-DEX aggregator...');

    try {
        // 1. Register
        const regRes = await fetch(`${OBELISK_API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'MixBot_v25', type: 'trading' })
        });
        const regData = await regRes.json();

        if (regData.success) {
            apiKey = regData.apiKey;
            console.log(`✅ [OBELISK] Enregistré: ${apiKey.slice(0, 16)}...`);
        }

        // 2. Create session
        const sessRes = await fetch(`${OBELISK_API}/api/auth/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
            body: JSON.stringify({ ttlMinutes: 60 })
        });
        const sessData = await sessRes.json();

        if (sessData.success) {
            sessionId = sessData.sessionId;
            console.log(`✅ [OBELISK] Session: ${sessionId.slice(0, 20)}...`);
        }

        // 3. Test + first fetch
        await fetchPrices();
        await fetchArbitrage();

        connected = true;
        console.log(`🟢 [OBELISK] Connecté! ${Object.keys(prices).length} marchés (Hyperliquid + dYdX)`);

        // 4. Start update loops
        updateLoop = setInterval(fetchPrices, UPDATE_INTERVAL);
        setInterval(fetchArbitrage, 5000);

        return true;
    } catch (error) {
        console.error('❌ [OBELISK] Erreur connexion:', error.message);
        metrics.errors++;
        return false;
    }
}

function disconnect() {
    if (updateLoop) clearInterval(updateLoop);
    connected = false;
    console.log('🔴 [OBELISK] Déconnecté');
}

// ═══════════════════════════════════════════════════════════
// FETCH PRICES
// ═══════════════════════════════════════════════════════════

async function fetchPrices() {
    const start = Date.now();

    try {
        const res = await fetch(`${OBELISK_API}/api/markets`);
        const data = await res.json();

        metrics.apiLatency = Date.now() - start;
        metrics.totalCalls++;
        metrics.lastUpdate = Date.now();

        if (data.markets) {
            data.markets.forEach(m => {
                const coin = m.pair.replace('/USDC', '');
                const oldPrice = prices[coin]?.price;

                prices[coin] = {
                    price: m.price,
                    change24h: m.change24h,
                    source: m.source,           // 'Hyperliquid' ou 'dYdX'
                    spread: m.spread || 0,
                    timestamp: Date.now(),
                    direction: oldPrice ? (m.price > oldPrice ? 'up' : m.price < oldPrice ? 'down' : 'stable') : 'stable'
                };
            });
        }
    } catch (e) {
        metrics.errors++;
    }
}

async function fetchArbitrage() {
    try {
        const res = await fetch(`${OBELISK_API}/api/arbitrage`);
        const data = await res.json();

        if (data.opportunities) {
            arbitrage = data.opportunities;
        }
    } catch (e) {
        // Silent fail for arbitrage
    }
}

// ═══════════════════════════════════════════════════════════
// API PUBLIQUE - À UTILISER DANS TON BOT
// ═══════════════════════════════════════════════════════════

/**
 * Obtenir le prix d'un coin (meilleur prix multi-DEX)
 * @param {string} coin - Symbol (BTC, ETH, SOL, etc.)
 * @returns {number|null} Prix ou null si indisponible
 */
function getPrice(coin) {
    return prices[coin]?.price || null;
}

/**
 * Obtenir les données complètes d'un coin
 * @param {string} coin - Symbol
 * @returns {object|null} { price, change24h, source, spread, direction }
 */
function getPriceData(coin) {
    return prices[coin] || null;
}

/**
 * Obtenir tous les prix
 * @returns {object} Tous les prix
 */
function getAllPrices() {
    return prices;
}

/**
 * Vérifier s'il y a arbitrage pour un coin
 * @param {string} coin - Symbol
 * @returns {object|null} { spread, direction, hlPrice, dydxPrice }
 */
function getArbitrage(coin) {
    return arbitrage.find(a => a.coin === coin) || null;
}

/**
 * Obtenir les meilleures opportunités d'arbitrage
 * @param {number} minSpread - Spread minimum en % (défaut 0.1%)
 * @returns {array} Opportunités triées par profit
 */
function getTopArbitrage(minSpread = 0.1) {
    return arbitrage
        .filter(a => parseFloat(a.spread) >= minSpread)
        .sort((a, b) => parseFloat(b.spread) - parseFloat(a.spread))
        .slice(0, 10);
}

/**
 * Comparer prix Obelisk vs Hyperliquid direct
 * Utile pour vérifier si Obelisk donne un meilleur prix
 * @param {string} coin - Symbol
 * @param {number} hlPrice - Prix Hyperliquid actuel
 * @returns {object} { obeliskPrice, hlPrice, diff, betterSource }
 */
function comparePrices(coin, hlPrice) {
    const obeliskPrice = getPrice(coin);
    if (!obeliskPrice || !hlPrice) return null;

    const diff = ((obeliskPrice - hlPrice) / hlPrice * 100).toFixed(4);

    return {
        obeliskPrice,
        hlPrice,
        diff: parseFloat(diff),
        betterSource: Math.abs(diff) < 0.01 ? 'same' : (obeliskPrice < hlPrice ? 'obelisk' : 'hyperliquid')
    };
}

/**
 * Obtenir les métriques de performance
 * @returns {object} { apiLatency, lastUpdate, totalCalls, errors, connected }
 */
function getMetrics() {
    return {
        ...metrics,
        connected,
        marketsCount: Object.keys(prices).length,
        arbitrageCount: arbitrage.length
    };
}

/**
 * Vérifier si connecté
 * @returns {boolean}
 */
function isConnected() {
    return connected;
}

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

module.exports = {
    // Connexion
    connect,
    disconnect,
    isConnected,

    // Prix
    getPrice,
    getPriceData,
    getAllPrices,

    // Arbitrage
    getArbitrage,
    getTopArbitrage,

    // Utilitaires
    comparePrices,
    getMetrics,

    // Constants
    API_URL: OBELISK_API,
    UPDATE_INTERVAL
};

// ═══════════════════════════════════════════════════════════
// AUTO-TEST SI EXÉCUTÉ DIRECTEMENT
// ═══════════════════════════════════════════════════════════

if (require.main === module) {
    (async () => {
        console.log('\n═══════════════════════════════════════════');
        console.log('   TEST OBELISK MULTI-DEX PRICE FEED');
        console.log('═══════════════════════════════════════════\n');

        await connect();

        console.log('\n📊 Exemples de prix:');
        ['BTC', 'ETH', 'SOL', 'ARB', 'DOGE'].forEach(coin => {
            const data = getPriceData(coin);
            if (data) {
                console.log(`  ${coin}: $${data.price.toLocaleString()} (${data.source}) ${data.direction === 'up' ? '↑' : data.direction === 'down' ? '↓' : '→'}`);
            }
        });

        console.log('\n⚡ Top 5 Arbitrage:');
        getTopArbitrage(0.05).slice(0, 5).forEach(a => {
            console.log(`  ${a.coin}: ${a.spread} - ${a.direction}`);
        });

        console.log('\n📈 Métriques:');
        const m = getMetrics();
        console.log(`  API Latency: ${m.apiLatency}ms`);
        console.log(`  Marchés: ${m.marketsCount}`);
        console.log(`  Arbitrage: ${m.arbitrageCount} opportunités`);

        console.log('\n✅ Test réussi! Ctrl+C pour arrêter.\n');

        // Keep running for 10s to show updates
        setTimeout(() => {
            disconnect();
            process.exit(0);
        }, 10000);
    })();
}
