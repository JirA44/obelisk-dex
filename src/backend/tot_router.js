/**
 * TOT Router — Tree of Thoughts Venue Router
 * ===========================================
 * Choisit la meilleure venue/chain pour chaque trade
 * via raisonnement arborescent déterministe.
 *
 * Usage:
 *   const totRouter = require('./tot_router');
 *   const route = totRouter.route({ size: 5, coin: 'BTC', urgent: false });
 *   // { venue: 'SONIC', score: 0.94, reasoning: [...] }
 */

// ─── Config venues ───────────────────────────────────────────────
const VENUES = {
    SONIC: {
        fees: 0.000,          // 0% DEX Odos
        gasCost: 0.00021,     // $0.00021 batch
        latency: 1000,        // 1s block
        maxSize: 50000,
        available: true,
        tps: 10000,
        priority: 1
    },
    APEX: {
        fees: 0.000,          // 0% maker
        gasCost: 0.00,
        latency: 500,
        maxSize: 100000,
        available: true,
        tps: 5000,
        priority: 2
    },
    ASTERDEX: {
        fees: 0.00035,        // 0.035%
        gasCost: 0.00,
        latency: 300,
        maxSize: 50000,
        available: true,
        tps: 3000,
        priority: 3
    },
    LIGHTER: {
        fees: 0.000,          // 0% maker
        gasCost: 0.00,
        latency: 200,
        maxSize: 50000,
        available: false,     // sig error
        tps: 3000,
        priority: 4
    },
    MUX: {
        fees: 0.0006,         // 0.06%
        gasCost: 0.001,
        latency: 250,
        maxSize: 50000,
        available: true,
        tps: 2000,
        priority: 5
    },
    OBELISK: {
        fees: 0.001,          // 0.1%
        gasCost: 0.00,
        latency: 50,          // local
        maxSize: 10000,
        available: true,
        tps: 999999,
        priority: 6
    }
};

// ─────────────────────────────────────────────
// BRANCHES TOT
// ─────────────────────────────────────────────

function branchCost(venue, config, trade) {
    const { size = 5, hft = false } = trade;
    const feeCost = size * config.fees;
    const totalCost = feeCost + config.gasCost;
    const costPct = totalCost / size;

    // Score inversé : moins c'est cher, mieux c'est
    // 0% fee → 1.0, 0.1% → 0.6, 0.5% → 0.2
    const score = Math.max(0.10, 1.0 - costPct * 400);

    return {
        branch: 'Cost',
        venue,
        score: Math.min(1.0, score),
        reasoning: `Fees ${(config.fees * 100).toFixed(3)}% + gas $${config.gasCost.toFixed(5)} = $${totalCost.toFixed(5)}/trade`
    };
}

function branchLatency(venue, config, trade) {
    const { urgent = false } = trade;
    const weight = urgent ? 2.0 : 1.0;  // latence critique si urgent

    // 50ms → 1.0, 500ms → 0.75, 2000ms → 0.4
    const score = Math.max(0.20, 1.0 - config.latency / 3000);

    return {
        branch: 'Latency',
        venue,
        score: Math.min(1.0, score * weight > 1 ? 1 : score),
        reasoning: `Latence ${config.latency}ms${urgent ? ' (urgent!)' : ''}`
    };
}

function branchCapacity(venue, config, trade) {
    const { size = 5, hft = false, tradesPerDay = 50 } = trade;

    if (size > config.maxSize) {
        return { branch: 'Capacity', venue, score: 0.0, reasoning: `$${size} > max $${config.maxSize}` };
    }

    // TPS suffisant pour HFT ?
    const tpsNeeded = hft ? tradesPerDay / 86400 * 10 : 0.1;
    const tpsScore = Math.min(1.0, config.tps / (tpsNeeded * 100));

    return {
        branch: 'Capacity',
        venue,
        score: Math.min(0.95, 0.70 + tpsScore * 0.25),
        reasoning: `Max $${config.maxSize}, TPS ${config.tps}${hft ? ` (besoin: ${tpsNeeded.toFixed(2)})` : ''}`
    };
}

function branchAvailability(venue, config) {
    if (!config.available) {
        return { branch: 'Availability', venue, score: 0.0, reasoning: 'OFFLINE / DISABLED' };
    }
    return {
        branch: 'Availability',
        venue,
        score: 1.0,
        reasoning: 'Active'
    };
}

// ─────────────────────────────────────────────
// MOTEUR TOT PRINCIPAL
// ─────────────────────────────────────────────

/**
 * Route un trade vers la meilleure venue via ToT.
 *
 * @param {Object} trade
 * @param {number} trade.size       - Taille en $ (défaut 5)
 * @param {string} trade.coin       - Symbole (ex: 'BTC')
 * @param {boolean} trade.urgent    - Exécution rapide requise
 * @param {boolean} trade.hft       - Mode HFT (fréquence élevée)
 * @param {number} trade.tradesPerDay - Trades/jour estimés
 *
 * @returns {Object} { venue, score, confidence, tree, reasoning }
 */
function route(trade = {}) {
    const t0 = Date.now();
    const weights = {
        Cost: 0.40,
        Latency: 0.25,
        Capacity: 0.20,
        Availability: 0.15
    };

    const venueScores = {};
    const venueTree = {};

    for (const [venue, config] of Object.entries(VENUES)) {
        const bAvail = branchAvailability(venue, config);

        // Si venue offline → score final = 0, on skip
        if (bAvail.score === 0) {
            venueScores[venue] = 0;
            venueTree[venue] = [bAvail];
            continue;
        }

        const bCost = branchCost(venue, config, trade);
        const bLatency = branchLatency(venue, config, trade);
        const bCapacity = branchCapacity(venue, config, trade);

        const branches = [bCost, bLatency, bCapacity, bAvail];

        // Score pondéré
        const totalScore = branches.reduce((acc, b) => {
            return acc + b.score * (weights[b.branch] || 0.25);
        }, 0);

        venueScores[venue] = Math.min(1.0, totalScore);
        venueTree[venue] = branches;
    }

    // Tri par score
    const ranked = Object.entries(venueScores)
        .sort((a, b) => b[1] - a[1])
        .filter(([, score]) => score > 0);

    if (ranked.length === 0) {
        return { venue: null, score: 0, error: 'Aucune venue disponible' };
    }

    const [bestVenue, bestScore] = ranked[0];

    // Reasoning summary
    const reasoning = venueTree[bestVenue].map(b =>
        `${b.branch}: ${b.reasoning} (${(b.score * 100).toFixed(0)}%)`
    );

    return {
        venue: bestVenue,
        score: Math.round(bestScore * 1000) / 1000,
        confidence: bestScore > 0.80 ? 'HIGH' : bestScore > 0.60 ? 'MEDIUM' : 'LOW',
        ranking: ranked.map(([v, s]) => ({ venue: v, score: Math.round(s * 1000) / 1000 })),
        tree: venueTree[bestVenue],
        reasoning,
        elapsed_ms: Date.now() - t0,
        trade
    };
}

/**
 * Met à jour la disponibilité d'une venue.
 */
function setAvailable(venue, available) {
    if (VENUES[venue]) {
        VENUES[venue].available = available;
    }
}

/**
 * Retourne le classement complet des venues.
 */
function rankAll(trade = {}) {
    const result = route(trade);
    return result.ranking || [];
}

module.exports = { route, setAvailable, rankAll, VENUES };

// ─────────────────────────────────────────────
// TEST
// node src/backend/tot_router.js
// ─────────────────────────────────────────────

if (require.main === module) {
    console.log('=== TOT Router — Test ===\n');

    const trades = [
        { size: 5, coin: 'BTC', urgent: false, hft: false, label: 'Trade standard $5' },
        { size: 5, coin: 'ETH', urgent: true, hft: false, label: 'Trade urgent $5' },
        { size: 5, coin: 'SOL', urgent: false, hft: true, tradesPerDay: 200, label: 'HFT $5 200t/j' },
    ];

    for (const trade of trades) {
        const { label, ...params } = trade;
        const result = route(params);
        console.log(`${label}:`);
        console.log(`  → ${result.venue} (score ${(result.score * 100).toFixed(0)}%, ${result.confidence})`);
        console.log(`  Ranking: ${result.ranking.map(r => `${r.venue}:${(r.score * 100).toFixed(0)}%`).join(' > ')}`);
        console.log(`  Raisons:`);
        for (const r of result.reasoning) console.log(`    - ${r}`);
        console.log();
    }
}
