/* ============================================
   RISK DASHBOARD - Institutional Module
   VaR, exposure heatmap, correlation matrix
   ============================================ */

const RiskDashboard = {
    init() {},

    getMockData() {
        var assets = ['BTC', 'ETH', 'SOL', 'AVAX', 'ARB', 'LINK'];
        var exposures = assets.map(function(a) {
            return { asset: a, long: Math.round(Math.random() * 500000), short: Math.round(Math.random() * 200000), net: 0 };
        });
        exposures.forEach(function(e) { e.net = e.long - e.short; });

        // Correlation matrix (symmetric)
        var corr = {};
        assets.forEach(function(a) {
            corr[a] = {};
            assets.forEach(function(b) {
                if (a === b) corr[a][b] = 1.0;
                else if (corr[b] && corr[b][a] !== undefined) corr[a][b] = corr[b][a];
                else corr[a][b] = parseFloat((Math.random() * 1.4 - 0.2).toFixed(2));
            });
        });

        return {
            var95: 125000,
            var99: 185000,
            totalExposure: exposures.reduce(function(s, e) { return s + Math.abs(e.net); }, 0),
            maxDrawdown: -8.5,
            sharpeRatio: 1.42,
            exposures: exposures,
            assets: assets,
            correlation: corr
        };
    },

    getHeatColor(val) {
        // -1 to 1 -> red to green
        if (val >= 0.7) return '#00ff88';
        if (val >= 0.4) return '#88cc44';
        if (val >= 0.1) return '#c9a227';
        if (val >= -0.2) return '#888';
        return '#ff4466';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var data = this.getMockData();

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">$' + data.var95.toLocaleString() + '</div><div class="sol-stat-label">VaR 95%</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">$' + data.var99.toLocaleString() + '</div><div class="sol-stat-label">VaR 99%</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value gold">$' + data.totalExposure.toLocaleString() + '</div><div class="sol-stat-label">Net Exposure</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + data.maxDrawdown + '%</div><div class="sol-stat-label">Max Drawdown</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + data.sharpeRatio.toFixed(2) + '</div><div class="sol-stat-label">Sharpe Ratio</div></div>' +
            '</div>';

        // Exposure heatmap
        html += '<div class="sol-section"><div class="sol-section-title">📊 Position Exposure</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Long</th><th>Short</th><th>Net</th><th>Heatmap</th></tr></thead><tbody>';
        var maxNet = Math.max.apply(null, data.exposures.map(function(e) { return Math.abs(e.net); }));
        data.exposures.forEach(function(e) {
            var netColor = e.net >= 0 ? '#00ff88' : '#ff4466';
            var barWidth = Math.abs(e.net) / (maxNet || 1) * 100;
            var barColor = e.net >= 0 ? '#00ff88' : '#ff4466';
            html += '<tr><td><strong>' + e.asset + '</strong></td>' +
                '<td style="font-family:monospace;color:#00ff88">$' + e.long.toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:#ff4466">$' + e.short.toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:' + netColor + '">' + (e.net >= 0 ? '+' : '') + '$' + e.net.toLocaleString() + '</td>' +
                '<td><div style="width:100%;background:#111;border-radius:3px;height:12px;overflow:hidden">' +
                '<div style="width:' + barWidth + '%;height:100%;background:' + barColor + ';border-radius:3px"></div></div></td></tr>';
        });
        html += '</tbody></table></div>';

        // Correlation matrix
        html += '<div class="sol-section"><div class="sol-section-title">🔗 Correlation Matrix</div>' +
            '<div style="overflow-x:auto"><table class="sol-table" style="font-size:12px"><thead><tr><th></th>';
        var self = this;
        data.assets.forEach(function(a) { html += '<th style="text-align:center">' + a + '</th>'; });
        html += '</tr></thead><tbody>';
        data.assets.forEach(function(a) {
            html += '<tr><td><strong>' + a + '</strong></td>';
            data.assets.forEach(function(b) {
                var val = data.correlation[a][b];
                var bg = self.getHeatColor(val);
                html += '<td style="text-align:center;background:' + bg + '22;color:' + bg + ';font-family:monospace;font-weight:600">' + val.toFixed(2) + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';

        // Risk metrics
        html += '<div class="sol-section"><div class="sol-section-title">📋 Risk Metrics Glossary</div>' +
            '<table class="sol-table"><tbody>' +
            '<tr><td><strong>VaR 95%</strong></td><td style="color:#aaa">Maximum expected loss over 1 day with 95% confidence</td></tr>' +
            '<tr><td><strong>VaR 99%</strong></td><td style="color:#aaa">Maximum expected loss over 1 day with 99% confidence</td></tr>' +
            '<tr><td><strong>Sharpe Ratio</strong></td><td style="color:#aaa">Risk-adjusted return. Above 1.0 is good, above 2.0 is excellent</td></tr>' +
            '<tr><td><strong>Max Drawdown</strong></td><td style="color:#aaa">Largest peak-to-trough decline in portfolio value</td></tr>' +
            '</tbody></table></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('risk-dashboard', RiskDashboard, 'institutional', {
    icon: '⚠️', name: 'Risk Dashboard', description: 'Value-at-Risk, exposure heatmap and correlation matrix analysis'
});
