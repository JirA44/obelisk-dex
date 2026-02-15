/**
 * FEE TIER MANAGER V1.0
 * Dynamic TPS-based fee structure for Obelisk Exchange
 *
 * Model: Higher TPS = Lower fees + Gas subsidy
 * Revenue: Fee collection covers gas costs with healthy margin
 */

class FeeTierManager {
    constructor() {
        this.tiers = {
            TIER_0: {
                name: 'Retail',
                tpsMin: 0,
                tpsMax: 1,
                tradingFee: 0.001,      // 0.1%
                gasSubsidy: 0,           // 0% - user pays all
                makerRebate: 0,
                description: 'Low frequency traders'
            },
            TIER_1: {
                name: 'Active',
                tpsMin: 1,
                tpsMax: 10,
                tradingFee: 0.0008,     // 0.08% (-20%)
                gasSubsidy: 0.25,        // 25% subsidy
                makerRebate: 0,
                description: 'Medium HFT'
            },
            TIER_2: {
                name: 'Pro',
                tpsMin: 10,
                tpsMax: 100,
                tradingFee: 0.0005,     // 0.05% (-50%)
                gasSubsidy: 0.50,        // 50% subsidy
                makerRebate: 0,
                description: 'High frequency traders'
            },
            TIER_3: {
                name: 'Market Maker',
                tpsMin: 100,
                tpsMax: Infinity,
                tradingFee: 0.0002,     // 0.02% (-80%)
                gasSubsidy: 0.75,        // 75% subsidy
                makerRebate: -0.00001,   // -0.001% REBATE!
                description: 'Ultra HFT & Market Makers'
            }
        };

        // User TPS tracking (rolling 60s window)
        this.userTPS = new Map(); // userID -> { trades: [], currentTPS: 0 }

        // Revenue tracking
        this.revenue = {
            totalFees: 0,
            totalGasCost: 0,
            totalSubsidy: 0,
            totalRebates: 0,
            netRevenue: 0,
            byTier: {}
        };

        // Initialize tier revenue tracking
        for (const tierKey of Object.keys(this.tiers)) {
            this.revenue.byTier[tierKey] = {
                trades: 0,
                fees: 0,
                gasCost: 0,
                subsidy: 0,
                rebates: 0,
                net: 0
            };
        }

        console.log('💰 Fee Tier Manager initialized');
        console.log('   Tiers:', Object.keys(this.tiers).length);
    }

    /**
     * Calculate user's current TPS based on recent activity
     */
    calculateUserTPS(userID) {
        if (!this.userTPS.has(userID)) {
            this.userTPS.set(userID, { trades: [], currentTPS: 0 });
        }

        const userData = this.userTPS.get(userID);
        const now = Date.now();
        const windowMs = 60000; // 60 second window

        // Remove trades older than 60s
        userData.trades = userData.trades.filter(t => now - t < windowMs);

        // Calculate TPS
        const tps = userData.trades.length / 60;
        userData.currentTPS = tps;

        return tps;
    }

    /**
     * Record a trade for TPS calculation
     */
    recordTrade(userID) {
        if (!this.userTPS.has(userID)) {
            this.userTPS.set(userID, { trades: [], currentTPS: 0 });
        }

        this.userTPS.get(userID).trades.push(Date.now());
    }

    /**
     * Get user's current tier based on TPS
     */
    getUserTier(userID) {
        const tps = this.calculateUserTPS(userID);

        for (const [tierKey, tier] of Object.entries(this.tiers)) {
            if (tps >= tier.tpsMin && tps < tier.tpsMax) {
                return { tierKey, tier, tps };
            }
        }

        // Default to TIER_0
        return { tierKey: 'TIER_0', tier: this.tiers.TIER_0, tps };
    }

    /**
     * Calculate fees for a trade
     */
    calculateFees(userID, tradeSize, isMaker = false, gasCost = 0.001) {
        const { tierKey, tier, tps } = this.getUserTier(userID);

        // Base trading fee
        let tradingFee = tradeSize * tier.tradingFee;

        // Maker rebate (negative fee!)
        if (isMaker && tier.makerRebate < 0) {
            tradingFee += tradeSize * tier.makerRebate; // Subtract rebate
        }

        // Gas subsidy
        const gasSubsidy = gasCost * tier.gasSubsidy;
        const userGasCost = gasCost - gasSubsidy;

        // Total user pays
        const totalUserCost = tradingFee + userGasCost;

        // Obelisk net (fee collected - subsidy paid)
        const obeliskNet = tradingFee - gasSubsidy;

        return {
            tierKey,
            tierName: tier.name,
            tps: tps.toFixed(2),
            tradingFee: tradingFee,
            tradingFeePercent: (tier.tradingFee * 100).toFixed(3),
            gasCost: gasCost,
            gasSubsidy: gasSubsidy,
            gasSubsidyPercent: (tier.gasSubsidy * 100).toFixed(0),
            userGasCost: userGasCost,
            totalUserCost: totalUserCost,
            obeliskNet: obeliskNet,
            makerRebate: isMaker ? tier.makerRebate : 0
        };
    }

    /**
     * Process a trade and update revenue tracking
     */
    processTrade(userID, tradeSize, isMaker = false, gasCost = 0.001) {
        // Record trade for TPS calculation
        this.recordTrade(userID);

        // Calculate fees
        const fees = this.calculateFees(userID, tradeSize, isMaker, gasCost);

        // Update revenue tracking
        this.revenue.totalFees += fees.tradingFee;
        this.revenue.totalGasCost += fees.gasCost;
        this.revenue.totalSubsidy += fees.gasSubsidy;
        this.revenue.netRevenue = this.revenue.totalFees - this.revenue.totalSubsidy;

        // Update tier-specific tracking
        const tierStats = this.revenue.byTier[fees.tierKey];
        tierStats.trades++;
        tierStats.fees += fees.tradingFee;
        tierStats.gasCost += fees.gasCost;
        tierStats.subsidy += fees.gasSubsidy;
        tierStats.net = tierStats.fees - tierStats.subsidy;

        if (isMaker && fees.makerRebate < 0) {
            const rebate = Math.abs(tradeSize * fees.makerRebate);
            this.revenue.totalRebates += rebate;
            tierStats.rebates += rebate;
        }

        return fees;
    }

    /**
     * Get revenue report
     */
    getRevenueReport() {
        const totalTrades = Object.values(this.revenue.byTier)
            .reduce((sum, tier) => sum + tier.trades, 0);

        return {
            summary: {
                totalTrades,
                totalFees: this.revenue.totalFees.toFixed(2),
                totalGasCost: this.revenue.totalGasCost.toFixed(2),
                totalSubsidy: this.revenue.totalSubsidy.toFixed(2),
                totalRebates: this.revenue.totalRebates.toFixed(2),
                netRevenue: this.revenue.netRevenue.toFixed(2),
                profitMargin: totalTrades > 0
                    ? ((this.revenue.netRevenue / this.revenue.totalFees) * 100).toFixed(1) + '%'
                    : '0%'
            },
            byTier: Object.entries(this.revenue.byTier).map(([key, stats]) => ({
                tier: key,
                name: this.tiers[key].name,
                trades: stats.trades,
                fees: stats.fees.toFixed(2),
                gasCost: stats.gasCost.toFixed(2),
                subsidy: stats.subsidy.toFixed(2),
                rebates: stats.rebates.toFixed(2),
                net: stats.net.toFixed(2),
                avgFeePerTrade: stats.trades > 0
                    ? (stats.fees / stats.trades).toFixed(4)
                    : '0'
            }))
        };
    }

    /**
     * Display tier structure
     */
    displayTiers() {
        console.log('\n💰 OBELISK FEE TIER STRUCTURE\n');
        console.log('─'.repeat(80));
        console.log('Tier      TPS Range      Fee     Gas Subsidy    Maker Rebate    Description');
        console.log('─'.repeat(80));

        for (const [key, tier] of Object.entries(this.tiers)) {
            const tpsRange = tier.tpsMax === Infinity
                ? `${tier.tpsMin}+`
                : `${tier.tpsMin}-${tier.tpsMax}`;

            const feeStr = (tier.tradingFee * 100).toFixed(2) + '%';
            const subsidyStr = (tier.gasSubsidy * 100).toFixed(0) + '%';
            const rebateStr = tier.makerRebate < 0
                ? (tier.makerRebate * 100).toFixed(3) + '%'
                : 'None';

            console.log(
                key.padEnd(10),
                tpsRange.padEnd(15),
                feeStr.padEnd(8),
                subsidyStr.padEnd(15),
                rebateStr.padEnd(16),
                tier.description
            );
        }
        console.log('─'.repeat(80));
        console.log();
    }
}

module.exports = FeeTierManager;
