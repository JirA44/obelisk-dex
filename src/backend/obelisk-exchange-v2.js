/**
 * OBELISK EXCHANGE ENGINE V2.0
 * Ultra-Fast Multi-Chain Exchange
 *
 * Features:
 * - Internal pool: 10,000+ TPS (<1ms latency)
 * - Blockchain settlement: Solana/AVAX/Base/Arbitrum
 * - TPS-based fee tiers (0.02-0.1%)
 * - Gas subsidy (25-75% based on tier)
 * - Batch execution (90% gas savings)
 * - Smart routing (internal vs blockchain)
 */

const FeeTierManager = require('./fee-tier-manager.js');
const BlockchainSettlementEngine = require('./blockchain-settlement.js');
const TrackingSystemV2 = require('../../../mixbot/tracking_system_v2.js');

class ObeliskExchangeV2 {
    constructor(config = {}) {
        this.config = {
            mode: config.mode || 'PAPER',  // PAPER or LIVE
            internalPoolSize: config.internalPoolSize || 100000, // $100K
            internalThreshold: config.internalThreshold || 50, // <$50 = internal
            batchEnabled: config.batchEnabled !== false,
            settlementStrategy: config.settlementStrategy || 'CHEAPEST_FIRST',
            ...config
        };

        // Initialize modules
        this.feeManager = new FeeTierManager();
        this.settlement = new BlockchainSettlementEngine({
            strategy: this.config.settlementStrategy
        });
        this.tracker = new TrackingSystemV2();

        // Internal pool state
        this.internalPool = {
            balance: this.config.internalPoolSize,
            reserves: {},  // coin -> amount
            positions: new Map(), // userID -> positions
            volume24h: 0,
            trades24h: 0
        };

        // Trading stats
        this.stats = {
            totalTrades: 0,
            internalTrades: 0,
            blockchainTrades: 0,
            totalVolume: 0,
            totalRevenue: 0,
            avgLatency: 0
        };

        // Run ID for tracking
        this.runID = null;

        console.log('🏦 Obelisk Exchange V2 initialized');
        console.log(`   Mode: ${this.config.mode}`);
        console.log(`   Internal Pool: $${this.config.internalPoolSize.toLocaleString()}`);
        console.log(`   Settlement: ${this.config.settlementStrategy}`);
    }

    /**
     * Initialize exchange and start tracking
     */
    async initialize() {
        console.log('\n🚀 Initializing Obelisk Exchange V2...\n');

        // Display fee tiers
        this.feeManager.displayTiers();

        // Display supported chains
        this.settlement.displayChains();

        // Start tracking run
        this.runID = this.tracker.startTestRun(
            'Obelisk Exchange V2',
            'Ultra-fast multi-chain exchange with TPS-based fees',
            {
                provenance: 'Obelisk Exchange V2.0',
                mode: this.config.mode,
                internalPoolSize: this.config.internalPoolSize,
                chains: Object.keys(this.settlement.chains).filter(k =>
                    this.settlement.chains[k].enabled
                ),
                trackingVersion: 'v2',
                launchTime: new Date().toISOString()
            }
        );

        console.log(`📊 Tracking Run: ${this.runID}\n`);
        console.log('✅ Obelisk Exchange V2 ready for trading!\n');
    }

    /**
     * Execute a trade
     */
    async executeTrade(order) {
        const {
            userID,
            pair,
            side,
            size,       // Trade size in USD
            price,
            isMaker = false
        } = order;

        const startTime = Date.now();

        try {
            // Determine execution venue
            const useInternal = size < this.config.internalThreshold;
            const venue = useInternal ? 'internal' : 'blockchain';

            // Select chain if blockchain
            const chain = useInternal ? null : this.settlement.selectChain(size);
            const gasCost = useInternal ? 0 : (chain.avgGasCost);

            // Calculate fees
            const fees = this.feeManager.processTrade(userID, size, isMaker, gasCost);

            // Execute trade
            let settlement;
            if (useInternal) {
                settlement = await this.executeInternal(order);
            } else {
                settlement = await this.settlement.settleTrade({
                    pair, side, size, price
                }, { chain });
            }

            const latency = Date.now() - startTime;

            // Update stats
            this.stats.totalTrades++;
            if (useInternal) this.stats.internalTrades++;
            else this.stats.blockchainTrades++;
            this.stats.totalVolume += size;
            this.stats.totalRevenue += fees.obeliskNet;
            this.stats.avgLatency =
                (this.stats.avgLatency * (this.stats.totalTrades - 1) + latency) / this.stats.totalTrades;

            // Record in tracking
            const tradeID = this.tracker.recordTrade(this.runID, 'ObeliskExchangeV2', {
                pair,
                side,
                entry: price,
                exit: price * (1 + (Math.random() - 0.5) * 0.02), // Mock exit
                pnl: 0, // Exchange doesn't have PnL, just facilitates
                win: true,
                size,
                duration: latency / 1000,
                metadata: {
                    venue,
                    chain: chain?.name,
                    userID,
                    tier: fees.tierKey,
                    tps: fees.tps,
                    tradingFee: fees.tradingFee,
                    gasCost: fees.gasCost,
                    gasSubsidy: fees.gasSubsidy,
                    userPaid: fees.totalUserCost,
                    obeliskNet: fees.obeliskNet,
                    txHash: settlement.txHash,
                    latency
                }
            });

            return {
                success: true,
                tradeID,
                venue,
                chain: chain?.name,
                fees,
                settlement,
                latency
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * Execute trade on internal pool (<1ms)
     */
    async executeInternal(order) {
        // Instant execution (in-memory)
        const txHash = `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Update pool reserves (mock)
        this.internalPool.volume24h += order.size;
        this.internalPool.trades24h++;

        return {
            txHash,
            gasCost: 0,
            blockTime: 0,
            confirmed: true,
            instant: true
        };
    }

    /**
     * Get exchange stats
     */
    getStats() {
        const feeReport = this.feeManager.getRevenueReport();
        const settlementStats = this.settlement.getStats();

        return {
            runID: this.runID,
            summary: {
                totalTrades: this.stats.totalTrades,
                internalTrades: this.stats.internalTrades,
                blockchainTrades: this.stats.blockchainTrades,
                internalPercent: this.stats.totalTrades > 0
                    ? ((this.stats.internalTrades / this.stats.totalTrades) * 100).toFixed(1) + '%'
                    : '0%',
                totalVolume: '$' + this.stats.totalVolume.toLocaleString(),
                totalRevenue: '$' + this.stats.totalRevenue.toFixed(2),
                avgLatency: this.stats.avgLatency.toFixed(0) + 'ms'
            },
            fees: feeReport,
            settlement: settlementStats,
            internalPool: {
                balance: '$' + this.internalPool.balance.toLocaleString(),
                volume24h: '$' + this.internalPool.volume24h.toFixed(2),
                trades24h: this.internalPool.trades24h
            }
        };
    }

    /**
     * Display comprehensive report
     */
    displayReport() {
        const stats = this.getStats();

        console.log('\n══════════════════════════════════════════════════════════════════════');
        console.log('📊 OBELISK EXCHANGE V2 - PERFORMANCE REPORT');
        console.log('══════════════════════════════════════════════════════════════════════');
        console.log(`Run ID: ${stats.runID}`);
        console.log(`Mode: ${this.config.mode}`);
        console.log();

        console.log('💹 TRADING SUMMARY');
        console.log('─'.repeat(70));
        console.log(`Total Trades:      ${stats.summary.totalTrades}`);
        console.log(`  Internal:        ${stats.summary.internalTrades} (${stats.summary.internalPercent})`);
        console.log(`  Blockchain:      ${stats.summary.blockchainTrades}`);
        console.log(`Total Volume:      ${stats.summary.totalVolume}`);
        console.log(`Avg Latency:       ${stats.summary.avgLatency}`);
        console.log();

        console.log('💰 REVENUE');
        console.log('─'.repeat(70));
        console.log(`Total Fees:        $${stats.fees.summary.totalFees}`);
        console.log(`Gas Subsidy:       $${stats.fees.summary.totalSubsidy}`);
        console.log(`Net Revenue:       $${stats.fees.summary.netRevenue}`);
        console.log(`Profit Margin:     ${stats.fees.summary.profitMargin}`);
        console.log();

        console.log('🎯 BY FEE TIER');
        console.log('─'.repeat(70));
        for (const tier of stats.fees.byTier) {
            if (tier.trades > 0) {
                console.log(`${tier.tier} (${tier.name}): ${tier.trades} trades, $${tier.net} net`);
            }
        }
        console.log();

        console.log('⛓️  BY BLOCKCHAIN');
        console.log('─'.repeat(70));
        for (const chain of stats.settlement.byChain) {
            if (chain.settlements > 0) {
                console.log(`${chain.chain}: ${chain.trades} trades, ${chain.avgLatency} avg, $${chain.gasCost} gas`);
            }
        }
        console.log();

        console.log('🏊 INTERNAL POOL');
        console.log('─'.repeat(70));
        console.log(`Balance:           ${stats.internalPool.balance}`);
        console.log(`Volume 24h:        ${stats.internalPool.volume24h}`);
        console.log(`Trades 24h:        ${stats.internalPool.trades24h}`);
        console.log();

        console.log('══════════════════════════════════════════════════════════════════════');
        console.log();
    }

    /**
     * Shutdown exchange
     */
    async shutdown() {
        console.log('\n🛑 Shutting down Obelisk Exchange V2...\n');

        // End tracking run
        this.tracker.endTestRun(this.runID, {
            mode: this.config.mode,
            finalStats: this.stats,
            endTime: new Date().toISOString()
        });

        // Display final report
        this.displayReport();

        console.log('✅ Shutdown complete\n');
        console.log(`📖 View full data: node tracking_system_v2.js run ${this.runID}\n`);
    }
}

module.exports = ObeliskExchangeV2;
