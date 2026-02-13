/**
 * FUNDING RATE MONITOR - Track Funding Across Venues
 * Monitor funding rates for arbitrage opportunities
 */
const FundingMonitorModule = {
    venues: ['Hyperliquid', 'dYdX', 'GMX', 'Binance', 'Bybit', 'OKX'],

    assets: ['BTC', 'ETH', 'SOL', 'ARB', 'OP', 'AVAX', 'LINK', 'DOGE', 'SUI', 'APT'],

    // Mock funding data (in production, fetch from APIs)
    fundingData: {},

    init() {
        this.generateMockData();
        // Update every 30 seconds
        setInterval(() => this.generateMockData(), 30000);
    },

    generateMockData() {
        this.fundingData = {};
        this.assets.forEach(asset => {
            this.fundingData[asset] = {};
            this.venues.forEach(venue => {
                // Generate realistic funding rates (-0.1% to +0.1% per 8h)
                const rate = (Math.random() - 0.5) * 0.2;
                const annualized = rate * 3 * 365; // 3 funding periods per day
                this.fundingData[asset][venue] = {
                    rate: rate,
                    annualized: annualized,
                    nextFunding: Date.now() + Math.random() * 8 * 3600000,
                    predicted: rate + (Math.random() - 0.5) * 0.02
                };
            });
        });
    },

    getArbitrageOpportunities() {
        const opportunities = [];

        this.assets.forEach(asset => {
            const rates = Object.entries(this.fundingData[asset] || {});
            if (rates.length < 2) return;

            const sorted = rates.sort((a, b) => a[1].rate - b[1].rate);
            const lowest = sorted[0];
            const highest = sorted[sorted.length - 1];

            const spread = highest[1].rate - lowest[1].rate;

            if (Math.abs(spread) > 0.02) { // > 0.02% spread
                opportunities.push({
                    asset,
                    longVenue: lowest[0],
                    shortVenue: highest[0],
                    longRate: lowest[1].rate,
                    shortRate: highest[1].rate,
                    spread,
                    annualizedProfit: spread * 3 * 365
                });
            }
        });

        return opportunities.sort((a, b) => Math.abs(b.spread) - Math.abs(a.spread));
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const opportunities = this.getArbitrageOpportunities();

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">📊 Funding Rate Monitor</h2>
                <p style="color:#888;margin-bottom:20px;">Track funding rates across venues • Find arbitrage opportunities</p>

                <!-- Arbitrage Opportunities -->
                ${opportunities.length > 0 ? `
                    <div style="background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,170,255,0.1));border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;margin-bottom:24px;">
                        <h3 style="color:#00ff88;margin-bottom:12px;">💰 Arbitrage Opportunities</h3>
                        <div style="display:grid;gap:10px;">
                            ${opportunities.slice(0, 5).map(opp => `
                                <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;display:grid;grid-template-columns:auto 1fr 1fr auto;gap:16px;align-items:center;">
                                    <div style="font-weight:bold;color:#fff;">${opp.asset}</div>
                                    <div>
                                        <div style="color:#22c55e;font-size:12px;">Long @ ${opp.longVenue}</div>
                                        <div style="color:#888;font-size:11px;">${opp.longRate.toFixed(4)}%</div>
                                    </div>
                                    <div>
                                        <div style="color:#ef4444;font-size:12px;">Short @ ${opp.shortVenue}</div>
                                        <div style="color:#888;font-size:11px;">${opp.shortRate.toFixed(4)}%</div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="color:#00ff88;font-weight:bold;">${opp.spread.toFixed(4)}%</div>
                                        <div style="color:#888;font-size:10px;">~${opp.annualizedProfit.toFixed(0)}% APY</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Funding Rate Table -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;overflow-x:auto;">
                    <h3 style="color:#fff;margin-bottom:16px;">📋 Funding Rates (8h)</h3>
                    <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:800px;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                                <th style="padding:10px;text-align:left;color:#888;">Asset</th>
                                ${this.venues.map(v => `<th style="padding:10px;text-align:center;color:#888;">${v}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${this.assets.map(asset => {
                                const rates = this.fundingData[asset] || {};
                                const values = Object.values(rates).map(r => r.rate);
                                const min = Math.min(...values);
                                const max = Math.max(...values);

                                return `
                                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                        <td style="padding:10px;font-weight:bold;color:#fff;">${asset}</td>
                                        ${this.venues.map(venue => {
                                            const data = rates[venue];
                                            if (!data) return '<td style="padding:10px;text-align:center;color:#888;">-</td>';

                                            const rate = data.rate;
                                            const isMin = rate === min;
                                            const isMax = rate === max;
                                            const color = rate > 0.02 ? '#ef4444' : rate < -0.02 ? '#22c55e' : '#888';

                                            return `
                                                <td style="padding:10px;text-align:center;">
                                                    <span style="color:${color};font-weight:${isMin || isMax ? 'bold' : 'normal'};${isMin ? 'background:rgba(34,197,94,0.2);padding:2px 6px;border-radius:4px;' : ''}${isMax ? 'background:rgba(239,68,68,0.2);padding:2px 6px;border-radius:4px;' : ''}">
                                                        ${rate >= 0 ? '+' : ''}${rate.toFixed(4)}%
                                                    </span>
                                                </td>
                                            `;
                                        }).join('')}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Legend -->
                <div style="margin-top:16px;display:flex;gap:20px;justify-content:center;font-size:11px;color:#888;">
                    <span><span style="color:#22c55e;">■</span> Negative = Shorts pay Longs</span>
                    <span><span style="color:#ef4444;">■</span> Positive = Longs pay Shorts</span>
                    <span><span style="background:rgba(34,197,94,0.2);padding:2px 6px;border-radius:4px;">Lowest</span></span>
                    <span><span style="background:rgba(239,68,68,0.2);padding:2px 6px;border-radius:4px;">Highest</span></span>
                </div>

                <!-- Auto-refresh indicator -->
                <div style="margin-top:16px;text-align:center;color:#888;font-size:11px;">
                    🔄 Auto-refreshes every 30 seconds | Last update: ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => FundingMonitorModule.init());
window.FundingMonitorModule = FundingMonitorModule;
