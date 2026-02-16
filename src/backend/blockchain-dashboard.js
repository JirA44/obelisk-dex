/**
 * BLOCKCHAIN SETTLEMENT DASHBOARD
 * Real-time statistics and analytics for multi-chain settlement
 *
 * Version: 1.0
 * Date: 2026-02-17
 */

class BlockchainDashboard {
    constructor(engines) {
        this.engines = engines; // { settlement, smartAccount, arbitrum, base, optimism, sonic }

        // Historical data (last 24h)
        this.history = {
            settlements: [],
            batchSettlements: [],
            gasSavings: []
        };

        // Performance metrics
        this.metrics = {
            totalSettlements: 0,
            totalBatchSettlements: 0,
            totalGasCost: 0,
            totalGasSaved: 0,
            avgLatency: 0,
            successRate: 0
        };

        // Start metrics collection
        this.startMetricsCollection();
    }

    /**
     * Start collecting metrics every minute
     */
    startMetricsCollection() {
        setInterval(() => {
            this.collectMetrics();
        }, 60000); // Every minute

        // Initial collection
        this.collectMetrics();
    }

    /**
     * Collect current metrics from all executors
     */
    collectMetrics() {
        const timestamp = Date.now();

        // Collect from Smart Account executor
        if (this.engines.smartAccount) {
            const stats = this.engines.smartAccount.getStats();

            this.metrics.totalSettlements = stats.settlements;
            this.metrics.totalBatchSettlements = stats.batchSettlements;
            this.metrics.totalGasCost = parseFloat(stats.totalGasCost);
            this.metrics.totalGasSaved = parseFloat(stats.totalGasSaved);
            this.metrics.successRate = parseFloat(stats.successRate);
        }

        // Record historical data point
        this.history.settlements.push({
            timestamp,
            count: this.metrics.totalSettlements
        });

        this.history.batchSettlements.push({
            timestamp,
            count: this.metrics.totalBatchSettlements
        });

        this.history.gasSavings.push({
            timestamp,
            saved: this.metrics.totalGasSaved
        });

        // Keep only last 24 hours (1440 data points at 1 min intervals)
        const dayAgo = timestamp - (24 * 60 * 60 * 1000);

        this.history.settlements = this.history.settlements.filter(d => d.timestamp > dayAgo);
        this.history.batchSettlements = this.history.batchSettlements.filter(d => d.timestamp > dayAgo);
        this.history.gasSavings = this.history.gasSavings.filter(d => d.timestamp > dayAgo);
    }

    /**
     * Get comprehensive dashboard data
     */
    getDashboard() {
        const chains = this.getChainComparison();
        const savings = this.calculateSavings();
        const performance = this.getPerformanceMetrics();

        return {
            summary: {
                totalSettlements: this.metrics.totalSettlements,
                totalBatchSettlements: this.metrics.totalBatchSettlements,
                totalGasCost: this.metrics.totalGasCost.toFixed(6),
                totalGasSaved: this.metrics.totalGasSaved.toFixed(6),
                savingsPercent: savings.percent,
                successRate: this.metrics.successRate
            },
            chains,
            savings,
            performance,
            history: {
                settlements: this.history.settlements.slice(-60), // Last hour
                batchSettlements: this.history.batchSettlements.slice(-60),
                gasSavings: this.history.gasSavings.slice(-60)
            },
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Compare all chains
     */
    getChainComparison() {
        const chains = [];

        // Arbitrum
        if (this.engines.arbitrum) {
            const stats = this.engines.arbitrum.getStats();
            chains.push({
                name: 'Arbitrum',
                settlements: stats.settlements,
                avgCost: stats.avgGasPerSettlement,
                successRate: stats.successRate,
                totalCost: stats.totalGasCost,
                smartAccountEnabled: true
            });
        }

        // Base
        if (this.engines.base) {
            const stats = this.engines.base.getStats();
            chains.push({
                name: 'Base',
                settlements: stats.settlements,
                avgCost: stats.avgGasPerSettlement,
                successRate: stats.successRate,
                totalCost: stats.totalGasCost,
                smartAccountEnabled: true
            });
        }

        // Optimism
        if (this.engines.optimism) {
            const stats = this.engines.optimism.getStats();
            chains.push({
                name: 'Optimism',
                settlements: stats.settlements,
                avgCost: stats.avgGasPerSettlement,
                successRate: stats.successRate,
                totalCost: stats.totalGasCost,
                smartAccountEnabled: true
            });
        }

        // Sonic
        if (this.engines.sonic) {
            const stats = this.engines.sonic.getStats();
            chains.push({
                name: 'Sonic',
                settlements: stats.settlements,
                avgCost: stats.avgGasPerSettlement,
                successRate: stats.successRate,
                totalCost: stats.totalGasCost,
                smartAccountEnabled: true,
                featured: true // Cheapest!
            });
        }

        return chains.sort((a, b) => parseFloat(a.avgCost) - parseFloat(b.avgCost));
    }

    /**
     * Calculate savings from batching
     */
    calculateSavings() {
        const totalCost = this.metrics.totalGasCost;
        const totalSaved = this.metrics.totalGasSaved;
        const withoutBatch = totalCost + totalSaved;

        const percent = withoutBatch > 0
            ? ((totalSaved / withoutBatch) * 100).toFixed(1) + '%'
            : '0%';

        return {
            totalSaved: totalSaved.toFixed(6),
            percent,
            avgPerBatch: this.metrics.totalBatchSettlements > 0
                ? (totalSaved / this.metrics.totalBatchSettlements).toFixed(6)
                : '0',
            projectedMonthly: (totalSaved * 30).toFixed(2),
            projectedYearly: (totalSaved * 365).toFixed(2)
        };
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const smartAccountStats = this.engines.smartAccount?.getStats() || {};

        return {
            avgGasPerSettlement: this.metrics.totalSettlements > 0
                ? (this.metrics.totalGasCost / this.metrics.totalSettlements).toFixed(8)
                : '0',
            batchEfficiency: smartAccountStats.efficiency || 'N/A',
            successRate: this.metrics.successRate || '0%',
            totalThroughput: this.metrics.totalSettlements + ' settlements'
        };
    }

    /**
     * Get recommendations based on usage patterns
     */
    getRecommendations() {
        const recommendations = [];

        // Recommend batching if not using it much
        const batchRatio = this.metrics.totalSettlements > 0
            ? (this.metrics.totalBatchSettlements / this.metrics.totalSettlements)
            : 0;

        if (batchRatio < 0.5 && this.metrics.totalSettlements > 10) {
            recommendations.push({
                type: 'optimization',
                title: 'Increase batch usage',
                description: `Only ${(batchRatio * 100).toFixed(0)}% of settlements are batched. Batching can save up to 80% on gas costs.`,
                action: 'Enable auto-batching or batch manually'
            });
        }

        // Recommend cheapest chain
        const chains = this.getChainComparison();
        if (chains.length > 0) {
            const cheapest = chains[0];
            recommendations.push({
                type: 'cost-saving',
                title: `Use ${cheapest.name} for lowest costs`,
                description: `${cheapest.name} has the lowest average cost at $${cheapest.avgCost} per settlement.`,
                action: `Route more settlements to ${cheapest.name}`
            });
        }

        // Recommend Smart Account upgrade if not enabled
        const smartAccountEnabled = this.engines.smartAccount?.isSmartAccount;
        if (!smartAccountEnabled && this.metrics.totalSettlements > 5) {
            recommendations.push({
                type: 'feature',
                title: 'Upgrade to Smart Account',
                description: 'Enable EIP-7702 Smart Account for batch transactions and 80% gas savings.',
                action: 'Upgrade wallet to Smart Account'
            });
        }

        return recommendations;
    }

    /**
     * Export dashboard as JSON
     */
    export() {
        return JSON.stringify(this.getDashboard(), null, 2);
    }

    /**
     * Generate HTML dashboard
     */
    generateHTML() {
        const dashboard = this.getDashboard();

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Obelisk Blockchain Dashboard</title>
    <style>
        body { font-family: monospace; background: #0a0a0a; color: #0f0; padding: 20px; }
        h1 { color: #00ff00; text-align: center; }
        .section { background: #1a1a1a; padding: 15px; margin: 15px 0; border-left: 3px solid #00ff00; }
        .metric { display: inline-block; margin: 10px 20px; }
        .label { color: #888; }
        .value { color: #0f0; font-size: 1.2em; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #333; }
        th { color: #00ff00; }
        .recommendation { background: #2a2a00; padding: 10px; margin: 10px 0; border-left: 3px solid #ff0; }
        .featured { color: #ff0; font-weight: bold; }
    </style>
</head>
<body>
    <h1>🚀 OBELISK V3 TURBO - Blockchain Settlement Dashboard</h1>

    <div class="section">
        <h2>📊 Summary</h2>
        <div class="metric">
            <div class="label">Total Settlements</div>
            <div class="value">${dashboard.summary.totalSettlements}</div>
        </div>
        <div class="metric">
            <div class="label">Batch Settlements</div>
            <div class="value">${dashboard.summary.totalBatchSettlements}</div>
        </div>
        <div class="metric">
            <div class="label">Total Gas Cost</div>
            <div class="value">$${dashboard.summary.totalGasCost}</div>
        </div>
        <div class="metric">
            <div class="label">Total Saved</div>
            <div class="value">$${dashboard.summary.totalGasSaved}</div>
        </div>
        <div class="metric">
            <div class="label">Savings</div>
            <div class="value">${dashboard.summary.savingsPercent}</div>
        </div>
        <div class="metric">
            <div class="label">Success Rate</div>
            <div class="value">${dashboard.summary.successRate}</div>
        </div>
    </div>

    <div class="section">
        <h2>⛓️ Chain Comparison</h2>
        <table>
            <tr>
                <th>Chain</th>
                <th>Settlements</th>
                <th>Avg Cost</th>
                <th>Total Cost</th>
                <th>Success Rate</th>
            </tr>
            ${dashboard.chains.map(chain => `
                <tr ${chain.featured ? 'class="featured"' : ''}>
                    <td>${chain.name} ${chain.featured ? '⭐' : ''}</td>
                    <td>${chain.settlements}</td>
                    <td>$${chain.avgCost}</td>
                    <td>$${chain.totalCost}</td>
                    <td>${chain.successRate}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    <div class="section">
        <h2>💰 Savings Analysis</h2>
        <div class="metric">
            <div class="label">Total Saved</div>
            <div class="value">$${dashboard.savings.totalSaved}</div>
        </div>
        <div class="metric">
            <div class="label">Savings %</div>
            <div class="value">${dashboard.savings.percent}</div>
        </div>
        <div class="metric">
            <div class="label">Avg Per Batch</div>
            <div class="value">$${dashboard.savings.avgPerBatch}</div>
        </div>
        <div class="metric">
            <div class="label">Projected Monthly</div>
            <div class="value">$${dashboard.savings.projectedMonthly}</div>
        </div>
        <div class="metric">
            <div class="label">Projected Yearly</div>
            <div class="value">$${dashboard.savings.projectedYearly}</div>
        </div>
    </div>

    <div class="section">
        <h2>💡 Recommendations</h2>
        ${dashboard.recommendations.map(rec => `
            <div class="recommendation">
                <strong>${rec.title}</strong><br>
                ${rec.description}<br>
                <em>Action: ${rec.action}</em>
            </div>
        `).join('')}
    </div>

    <p style="text-align: center; color: #666; margin-top: 40px;">
        Obelisk V3 TURBO - Multi-Chain Settlement Engine
    </p>
</body>
</html>
        `;
    }
}

module.exports = BlockchainDashboard;
