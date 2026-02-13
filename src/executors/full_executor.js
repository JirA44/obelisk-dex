// ═══════════════════════════════════════════════════════════════════════════
// OBELISK FULL EXECUTOR V2.0
// Multi-venue aggregator avec auto-route vers venue optimale
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { DryRunExecutor } = require('./dryrun_executor.js');

// ═══════════════════════════════════════════════════════════════════════════
// LIVE CONNECTORS (loaded dynamically for LIVE mode)
// ═══════════════════════════════════════════════════════════════════════════
let LIVE_CONNECTORS = null;

function loadLiveConnectors() {
    if (LIVE_CONNECTORS) return LIVE_CONNECTORS;

    try {
        const mixbotPath = 'C:/Users/Hugop/mixbot';
        LIVE_CONNECTORS = {
            obelisk: require(`${mixbotPath}/obelisk_client.js`),
            dydx: require(`${mixbotPath}/dydx_connector.js`),
            lighter: require(`${mixbotPath}/lighter_connector.js`),
            morpher: require(`${mixbotPath}/morpher_connector.js`),
            jupiter: require(`${mixbotPath}/jupiter_connector.js`),
            gmx: require(`${mixbotPath}/gmx_connector.js`),
            aster: require(`${mixbotPath}/aster_connector.js`),
            quickswap: require(`${mixbotPath}/quickswap_connector.js`),
            mux: require(`${mixbotPath}/mux_connector.js`),
        };
        console.log('✅ [OBELISK] Live connectors loaded');
        return LIVE_CONNECTORS;
    } catch (error) {
        console.error('⚠️ [OBELISK] Failed to load live connectors:', error.message);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// VENUE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const VENUES = {
    obelisk: {
        name: 'Obelisk DEX',
        chain: 'multi',                          // Multi-chain aggregator
        fees: { maker: 0, taker: 0.0002 },       // 0% maker, 0.02% taker (internal)
        assets: ['*'],                           // All assets via routing
        maxLeverage: 20,
        priority: 0,                             // Highest priority - our own platform
        dryRun: {
            slippageMin: 0.005, slippageMax: 0.05, slippageAvg: 0.02,
            latencyMin: 10, latencyMax: 100, latencyAvg: 30,
            rejectChance: 0.005, partialFillChance: 0.01
        },
        apiUrl: 'http://localhost:3001',
        webUrl: 'https://obelisk-dex.pages.dev'
    },
    lighter: {
        name: 'Lighter.xyz',
        chain: 'zksync',
        fees: { maker: 0, taker: 0.0004 },      // 0% maker, 0.04% taker
        assets: ['BTC', 'ETH', 'ARB'],
        maxLeverage: 20,
        priority: 1,                             // Plus haute priorité (lowest fees)
        dryRun: {
            slippageMin: 0.01, slippageMax: 0.08, slippageAvg: 0.03,
            latencyMin: 30, latencyMax: 250, latencyAvg: 80,
            rejectChance: 0.015, partialFillChance: 0.03
        }
    },
    morpher: {
        name: 'Morpher',
        chain: 'polygon',
        fees: { maker: 0, taker: 0 },            // 0% fees!
        assets: ['*'],                           // Tout (crypto, forex, stocks)
        maxLeverage: 10,
        priority: 2,
        dryRun: {
            slippageMin: 0.02, slippageMax: 0.12, slippageAvg: 0.05,
            latencyMin: 50, latencyMax: 400, latencyAvg: 150,
            rejectChance: 0.02, partialFillChance: 0.05
        }
    },
    asterdex: {
        name: 'AsterDEX',
        chain: 'arbitrum',
        fees: { maker: 0.0001, taker: 0.00035 }, // 0.01% / 0.035%
        assets: ['*'],
        maxLeverage: 200,
        priority: 3,
        dryRun: {
            slippageMin: 0.01, slippageMax: 0.10, slippageAvg: 0.04,
            latencyMin: 40, latencyMax: 350, latencyAvg: 120,
            rejectChance: 0.02, partialFillChance: 0.04
        }
    },
    hyperliquid: {
        name: 'Hyperliquid',
        chain: 'arbitrum',
        fees: { maker: 0.0001, taker: 0.00035 }, // 0.01% / 0.035%
        assets: ['BTC', 'ETH', 'SOL', 'ARB', 'OP', 'DOGE', 'XRP', 'AVAX', 'SUI', 'TIA', 'SEI', 'INJ'],
        maxLeverage: 50,
        priority: 4,
        dryRun: {
            slippageMin: 0.01, slippageMax: 0.08, slippageAvg: 0.03,
            latencyMin: 30, latencyMax: 200, latencyAvg: 70,
            rejectChance: 0.01, partialFillChance: 0.02
        }
    },
    dydx: {
        name: 'dYdX v4',
        chain: 'dydx',
        fees: { maker: 0.0002, taker: 0.0005 },  // 0.02% / 0.05%
        assets: ['BTC', 'ETH', 'SOL', 'AVAX', 'DOGE', 'ARB', 'OP', 'LINK', 'ATOM'],
        maxLeverage: 20,
        priority: 5,
        dryRun: {
            slippageMin: 0.02, slippageMax: 0.12, slippageAvg: 0.05,
            latencyMin: 50, latencyMax: 400, latencyAvg: 150,
            rejectChance: 0.02, partialFillChance: 0.05
        }
    },
    gmx: {
        name: 'GMX',
        chain: 'arbitrum',
        fees: { maker: 0.0005, taker: 0.0005 },  // 0.05% flat
        assets: ['BTC', 'ETH', 'ARB', 'SOL', 'LINK', 'DOGE', 'AVAX', 'UNI', 'AAVE', 'OP'],
        maxLeverage: 50,
        priority: 6,
        dryRun: {
            slippageMin: 0.02, slippageMax: 0.15, slippageAvg: 0.06,
            latencyMin: 60, latencyMax: 500, latencyAvg: 200,
            rejectChance: 0.03, partialFillChance: 0.06
        }
    },
    mux: {
        name: 'MUX Protocol',
        chain: 'arbitrum',
        fees: { maker: 0.0006, taker: 0.0006 },  // 0.06% flat
        assets: ['ETH', 'BTC', 'ARB', 'AVAX', 'BNB', 'FTM', 'LINK', 'UNI'],
        maxLeverage: 100,
        priority: 7,
        dryRun: {
            slippageMin: 0.03, slippageMax: 0.18, slippageAvg: 0.08,
            latencyMin: 80, latencyMax: 600, latencyAvg: 250,
            rejectChance: 0.04, partialFillChance: 0.08
        }
    },
    // gains: REMOVED - 0.08% fees too expensive
    jupiter: {
        name: 'Jupiter Perps',
        chain: 'solana',
        fees: { maker: 0.0006, taker: 0.0006 },  // 0.06% flat (estimation)
        assets: ['SOL', 'BTC', 'ETH', 'BONK', 'WIF', 'JUP', 'JTO', 'PYTH', 'RAY', 'ORCA'],
        maxLeverage: 100,
        priority: 5,                              // Bonne priorité (Solana = rapide)
        dryRun: {
            slippageMin: 0.01, slippageMax: 0.08, slippageAvg: 0.03,
            latencyMin: 20, latencyMax: 150, latencyAvg: 50,    // Solana = très rapide
            rejectChance: 0.015, partialFillChance: 0.03,
            liquidityFactor: 0.97,
            priceNoise: 0.01,
            spreadMin: 0.01,
            spreadMax: 0.05
        },
        apiUrl: 'https://jup.ag/perps',
        rpcSolana: 'https://api.mainnet-beta.solana.com'
    },
    spookyfi: {
        name: 'SpookyFi Perps',
        chain: 'sonic',
        fees: { maker: 0.0002, taker: 0.0005 },  // 0.02% / 0.05%
        assets: ['BTC', 'ETH', 'FTM', 'SOL', 'AVAX', 'LINK', 'BOO'],
        maxLeverage: 500,                        // Très haut mais on limite
        priority: 7,
        dryRun: {
            slippageMin: 0.02, slippageMax: 0.20, slippageAvg: 0.08,
            latencyMin: 50, latencyMax: 400, latencyAvg: 150,
            rejectChance: 0.03, partialFillChance: 0.08
        },
        apiUrl: 'https://perps.spooky.fi'
    },
    quickswap: {
        name: 'QuickSwap Perps',
        chain: 'polygon',
        fees: { maker: 0.0002, taker: 0.0004 },  // 0.02% / 0.04%
        assets: ['BTC', 'ETH', 'MATIC', 'SOL', 'AVAX', 'LINK', 'ARB', 'OP', 'DOGE'],
        maxLeverage: 100,
        priority: 4,                              // Bonne priorité (fees bas)
        dryRun: {
            slippageMin: 0.01, slippageMax: 0.12, slippageAvg: 0.04,
            latencyMin: 30, latencyMax: 300, latencyAvg: 100,
            rejectChance: 0.01, partialFillChance: 0.03
        },
        apiUrl: 'https://perps.quickswap.exchange'
    }
};

class ObeliskExecutor {
    constructor(config = {}) {
        this.config = {
            mode: config.mode || 'LIVE',          // LIVE | DRY_RUN
            initialBalance: config.initialBalance || 100,
            autoRoute: config.autoRoute !== false,
            preferredVenue: config.preferredVenue || null,
            maxLeverage: config.maxLeverage || 3,
            stateFile: config.stateFile || path.join(__dirname, 'obelisk_state.json'),
        };

        // Initialiser les executors pour chaque venue
        this.executors = {};
        this.initializeExecutors();

        // État global
        this.state = {
            balance: this.config.initialBalance,
            startBalance: this.config.initialBalance,
            positions: [],
            trades: [],
            routingHistory: [],
            stats: {
                totalTrades: 0,
                wins: 0,
                losses: 0,
                totalPnL: 0,
                totalFees: 0,
                totalSlippage: 0,
                byVenue: {}
            }
        };

        this.loadState();

        console.log('═'.repeat(65));
        console.log('🏛️ OBELISK FULL EXECUTOR V2.0 - Multi-Venue Aggregator');
        console.log('═'.repeat(65));
        console.log(`   Mode: ${this.config.mode}`);
        console.log(`   Auto-Route: ${this.config.autoRoute ? 'ON' : 'OFF'}`);
        console.log(`   Balance: $${this.state.balance.toFixed(2)}`);
        console.log(`   Venues: ${Object.keys(VENUES).join(', ')}`);
        console.log('═'.repeat(65) + '\n');
    }

    initializeExecutors() {
        const isLive = this.config.mode === 'LIVE';
        const liveConnectors = isLive ? loadLiveConnectors() : null;

        for (const [venueId, venue] of Object.entries(VENUES)) {
            // Try to use LIVE connector if available and in LIVE mode
            if (isLive && liveConnectors) {
                const connector = this.createLiveConnector(venueId, liveConnectors);
                if (connector) {
                    this.executors[venueId] = connector;
                    continue;
                }
            }

            // Fallback to DryRunExecutor
            const executorConfig = {
                ...venue.dryRun,
                makerFee: venue.fees.maker,
                takerFee: venue.fees.taker,
                initialBalance: this.config.initialBalance,
                stateFile: path.join(__dirname, `obelisk_${venueId}_state.json`)
            };

            this.executors[venueId] = new DryRunExecutor(venue.name, executorConfig);
        }
    }

    createLiveConnector(venueId, liveConnectors) {
        try {
            const connectorMap = {
                'obelisk': () => new liveConnectors.obelisk.ObeliskClient(),
                'dydx': () => new liveConnectors.dydx.DydxConnector(),
                'lighter': () => new liveConnectors.lighter.LighterConnector(),
                'morpher': () => new liveConnectors.morpher.MorpherConnector(),
                'jupiter': () => new liveConnectors.jupiter.JupiterConnector(),
                'gmx': () => new liveConnectors.gmx.GmxConnector(),
                'asterdex': () => new liveConnectors.aster.AsterConnector(),
                'quickswap': () => new liveConnectors.quickswap.QuickSwapConnector(),
                'mux': () => new liveConnectors.mux.MuxConnector(),
            };

            if (connectorMap[venueId]) {
                const connector = connectorMap[venueId]();
                // Wrap with common interface
                return this.wrapLiveConnector(connector, venueId);
            }
            return null;
        } catch (error) {
            console.log(`⚠️ [OBELISK] ${venueId} live connector unavailable: ${error.message}`);
            return null;
        }
    }

    wrapLiveConnector(connector, venueId) {
        // Create a wrapper that provides consistent interface
        return {
            platform: VENUES[venueId]?.name || venueId,
            connector: connector,
            isLive: true,

            async placeOrder(order) {
                try {
                    await connector.initialize();
                    const result = await connector.openPosition(
                        order.coin,
                        order.direction,
                        order.size,
                        order.leverage
                    );
                    return result ? { success: true, ...result, venue: venueId } : { success: false };
                } catch (error) {
                    return { success: false, reason: error.message };
                }
            },

            async closePosition(positionId, exitPrice, reason) {
                try {
                    const result = await connector.closePosition(positionId);
                    return result ? { success: true, ...result } : { success: false };
                } catch (error) {
                    return { success: false, reason: error.message };
                }
            },

            getStatus() {
                return connector.getStatus ? connector.getStatus() : { platform: venueId, live: true };
            },

            reset() {
                // Live connectors don't reset like dry run
                console.log(`[${venueId}] Live connector - no reset needed`);
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTO-ROUTING: Trouve la meilleure venue
    // ═══════════════════════════════════════════════════════════════════════════

    findBestVenue(order) {
        const coin = (order.coin || '').toUpperCase();
        const leverage = order.leverage || 1;
        const orderType = (order.orderType || 'market').toLowerCase();
        const size = order.size || 0;

        const isMaker = orderType === 'limit';
        const feeType = isMaker ? 'maker' : 'taker';

        const candidates = [];

        for (const [venueId, venue] of Object.entries(VENUES)) {
            // Check asset support
            const supportsAsset = venue.assets.includes('*') || venue.assets.includes(coin);
            if (!supportsAsset) continue;

            // Check leverage support
            if (leverage > venue.maxLeverage) continue;

            // Calculate fee
            const fee = venue.fees[feeType];
            const feeUsd = size * leverage * fee;

            candidates.push({
                venueId,
                venue: venue.name,
                fee,
                feeUsd,
                priority: venue.priority,
                chain: venue.chain
            });
        }

        if (candidates.length === 0) {
            return { venueId: 'gmx', venue: 'GMX', reason: 'Fallback - no venue supports asset' };
        }

        // Sort by fee (lowest first), then by priority
        candidates.sort((a, b) => {
            if (a.fee !== b.fee) return a.fee - b.fee;
            return a.priority - b.priority;
        });

        const best = candidates[0];

        console.log(`\n🔀 [AUTO-ROUTE] ${coin} ${orderType.toUpperCase()} $${size} x${leverage}`);
        console.log(`   Best: ${best.venue} (${(best.fee * 100).toFixed(3)}% ${feeType}) | Fee: $${best.feeUsd.toFixed(4)}`);

        if (candidates.length > 1) {
            const worst = candidates[candidates.length - 1];
            const savings = worst.feeUsd - best.feeUsd;
            console.log(`   Alternatives: ${candidates.slice(1, 4).map(c => c.venue).join(', ')}`);
            console.log(`   Savings vs worst: $${savings.toFixed(4)}`);
        }

        // Log routing
        this.state.routingHistory.push({
            timestamp: Date.now(),
            coin,
            size,
            leverage,
            selectedVenue: best.venueId,
            fee: best.fee,
            alternatives: candidates.slice(1).map(c => c.venueId)
        });

        return best;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ORDER EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════

    async placeOrder(order) {
        // Auto-route si activé
        let venueId = order.venue || this.config.preferredVenue;

        if (this.config.autoRoute || !venueId) {
            const best = this.findBestVenue(order);
            venueId = best.venueId;
        }

        const executor = this.executors[venueId];
        if (!executor) {
            console.log(`❌ Venue ${venueId} non trouvée`);
            return { success: false, reason: 'VENUE_NOT_FOUND' };
        }

        // Exécuter l'ordre
        const result = await executor.placeOrder(order);

        if (result.success) {
            // Tracker dans l'état global
            this.state.positions.push({
                ...result.position,
                venue: venueId
            });

            // Stats par venue
            if (!this.state.stats.byVenue[venueId]) {
                this.state.stats.byVenue[venueId] = { trades: 0, pnl: 0, fees: 0 };
            }
            this.state.stats.byVenue[venueId].fees += result.fees;

            this.saveState();
        }

        return { ...result, venue: venueId };
    }

    async closePosition(positionId, exitPrice, reason = 'manual') {
        // Trouver la position et sa venue
        const position = this.state.positions.find(p => p.id === positionId);
        if (!position) {
            return { success: false, reason: 'POSITION_NOT_FOUND' };
        }

        const executor = this.executors[position.venue];
        const result = await executor.closePosition(positionId, exitPrice, reason);

        if (result.success) {
            // Mettre à jour les stats globales
            this.state.stats.totalTrades++;
            this.state.stats.totalPnL += result.netPnL;

            if (result.netPnL > 0) {
                this.state.stats.wins++;
            } else {
                this.state.stats.losses++;
            }

            // Stats par venue
            this.state.stats.byVenue[position.venue].trades++;
            this.state.stats.byVenue[position.venue].pnl += result.netPnL;

            // Supprimer de la liste globale
            const idx = this.state.positions.findIndex(p => p.id === positionId);
            if (idx !== -1) this.state.positions.splice(idx, 1);

            // Ajouter aux trades
            this.state.trades.push({
                ...result.trade,
                venue: position.venue
            });

            // Mettre à jour le balance global (somme de tous les executors)
            this.updateGlobalBalance();

            this.saveState();
        }

        return result;
    }

    updateGlobalBalance() {
        let total = 0;
        for (const executor of Object.values(this.executors)) {
            total += executor.state.balance - executor.state.startBalance;
        }
        this.state.balance = this.state.startBalance + total;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS
    // ═══════════════════════════════════════════════════════════════════════════

    getStatus() {
        this.updateGlobalBalance();

        const roi = ((this.state.balance - this.state.startBalance) / this.state.startBalance * 100);
        const wr = this.state.stats.totalTrades > 0
            ? (this.state.stats.wins / this.state.stats.totalTrades * 100)
            : 0;

        return {
            mode: this.config.mode,
            autoRoute: this.config.autoRoute,
            balance: this.state.balance,
            roi,
            openPositions: this.state.positions.length,
            stats: {
                ...this.state.stats,
                winRate: wr
            },
            byVenue: this.state.stats.byVenue
        };
    }

    displayStatus() {
        const s = this.getStatus();

        console.log('\n' + '═'.repeat(70));
        console.log('🏛️ OBELISK - STATUS GLOBAL');
        console.log('═'.repeat(70));

        console.log('\n💰 Balance Global:');
        console.log(`   Départ: $${this.state.startBalance.toFixed(2)}`);
        console.log(`   Actuel: $${s.balance.toFixed(2)}`);
        console.log(`   ROI: ${s.roi >= 0 ? '+' : ''}${s.roi.toFixed(2)}%`);

        console.log('\n📊 Stats Globales:');
        console.log(`   Trades: ${s.stats.totalTrades} | Wins: ${s.stats.wins} | Losses: ${s.stats.losses}`);
        console.log(`   Win Rate: ${s.stats.winRate.toFixed(1)}%`);
        console.log(`   PnL Total: $${s.stats.totalPnL.toFixed(2)}`);

        console.log('\n🏛️ Par Venue:');
        console.log('┌─────────────────┬────────┬────────────┬────────────┐');
        console.log('│ Venue           │ Trades │ PnL        │ Fees       │');
        console.log('├─────────────────┼────────┼────────────┼────────────┤');

        for (const [venueId, stats] of Object.entries(s.byVenue)) {
            const pnlStr = stats.pnl >= 0 ? `+$${stats.pnl.toFixed(2)}` : `-$${Math.abs(stats.pnl).toFixed(2)}`;
            console.log(`│ ${VENUES[venueId]?.name.padEnd(15) || venueId.padEnd(15)} │ ${String(stats.trades).padStart(6)} │ ${pnlStr.padStart(10)} │ $${stats.fees.toFixed(4).padStart(9)} │`);
        }
        console.log('└─────────────────┴────────┴────────────┴────────────┘');

        console.log('\n📍 Positions Ouvertes: ' + s.openPositions);
        if (this.state.positions.length > 0) {
            this.state.positions.forEach(p => {
                console.log(`   [${p.venue}] ${p.coin} ${p.direction} | Entry: $${p.entryPrice.toFixed(4)}`);
            });
        }

        console.log('═'.repeat(70) + '\n');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════

    saveState() {
        try {
            fs.writeFileSync(this.config.stateFile, JSON.stringify({
                ...this.state,
                savedAt: Date.now()
            }, null, 2));
        } catch (e) {}
    }

    loadState() {
        try {
            if (fs.existsSync(this.config.stateFile)) {
                const saved = JSON.parse(fs.readFileSync(this.config.stateFile, 'utf8'));
                this.state = { ...this.state, ...saved };
                console.log(`📂 Obelisk state chargé: $${this.state.balance.toFixed(2)}`);
            }
        } catch (e) {}
    }

    reset() {
        this.state = {
            balance: this.config.initialBalance,
            startBalance: this.config.initialBalance,
            positions: [],
            trades: [],
            routingHistory: [],
            stats: {
                totalTrades: 0,
                wins: 0,
                losses: 0,
                totalPnL: 0,
                totalFees: 0,
                totalSlippage: 0,
                byVenue: {}
            }
        };

        // Reset tous les executors
        for (const executor of Object.values(this.executors)) {
            executor.reset();
        }

        this.saveState();
        console.log('🔄 Obelisk state reset');
    }
}

module.exports = { ObeliskExecutor, VENUES };
