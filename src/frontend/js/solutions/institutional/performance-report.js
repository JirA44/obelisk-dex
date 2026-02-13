/* ============================================
   PERFORMANCE REPORT - Institutional Module
   Attribution analysis, Sharpe ratio, benchmark comparison
   ============================================ */

const PerformanceReport = {
    init() {},

    getMockData() {
        var months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
        return {
            period: 'Last 8 Months',
            totalReturn: 36.4,
            annualizedReturn: 45.2,
            sharpe: 1.42,
            sortino: 1.85,
            maxDrawdown: -8.5,
            winRate: 62.3,
            profitFactor: 1.78,
            avgWin: 4.2,
            avgLoss: -2.4,
            monthlyReturns: months.map(function(m) { return { month: m, ret: parseFloat((Math.random() * 12 - 3).toFixed(1)) }; }),
            attribution: [
                { source: 'BTC Spot', contribution: 15.2, pct: 41.8 },
                { source: 'ETH Staking', contribution: 8.5, pct: 23.4 },
                { source: 'Perps Trading', contribution: 6.1, pct: 16.8 },
                { source: 'DeFi Yield', contribution: 4.2, pct: 11.5 },
                { source: 'SOL/AVAX', contribution: 2.4, pct: 6.5 }
            ],
            benchmarks: [
                { name: 'Portfolio', ret: 36.4, color: '#00ff88' },
                { name: 'BTC', ret: 28.1, color: '#f7931a' },
                { name: 'ETH', ret: 22.5, color: '#627eea' },
                { name: 'S&P 500', ret: 12.3, color: '#888' }
            ]
        };
    },

    renderBarChart(data, width, height) {
        var maxVal = Math.max.apply(null, data.map(function(d) { return Math.abs(d.ret); }));
        var barW = (width / data.length) - 4;
        var midY = height / 2;
        var bars = '';
        data.forEach(function(d, i) {
            var barH = (Math.abs(d.ret) / maxVal) * (height / 2 - 10);
            var x = i * (barW + 4) + 2;
            var y = d.ret >= 0 ? midY - barH : midY;
            var color = d.ret >= 0 ? '#00ff88' : '#ff4466';
            bars += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" fill="' + color + '" rx="2"/>';
            bars += '<text x="' + (x + barW / 2) + '" y="' + (height - 2) + '" text-anchor="middle" fill="#666" font-size="9">' + d.month + '</text>';
            bars += '<text x="' + (x + barW / 2) + '" y="' + (d.ret >= 0 ? y - 3 : y + barH + 10) + '" text-anchor="middle" fill="' + color + '" font-size="9">' + d.ret + '%</text>';
        });
        bars += '<line x1="0" y1="' + midY + '" x2="' + width + '" y2="' + midY + '" stroke="#333" stroke-width="1"/>';
        return '<svg width="' + width + '" height="' + height + '">' + bars + '</svg>';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var d = this.getMockData();

        var returnColor = d.totalReturn >= 0 ? '#00ff88' : '#ff4466';
        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + returnColor + '">+' + d.totalReturn + '%</div><div class="sol-stat-label">Total Return</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + d.sharpe.toFixed(2) + '</div><div class="sol-stat-label">Sharpe Ratio</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + d.sortino.toFixed(2) + '</div><div class="sol-stat-label">Sortino Ratio</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + d.maxDrawdown + '%</div><div class="sol-stat-label">Max Drawdown</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value gold">' + d.winRate + '%</div><div class="sol-stat-label">Win Rate</div></div>' +
            '</div>';

        // Monthly returns
        html += '<div class="sol-section"><div class="sol-section-title">📊 Monthly Returns</div>' +
            '<div style="text-align:center;padding:10px 0">' + this.renderBarChart(d.monthlyReturns, 500, 160) + '</div></div>';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">';

        // Attribution
        html += '<div class="sol-section"><div class="sol-section-title">🎯 Return Attribution</div>' +
            '<table class="sol-table"><thead><tr><th>Source</th><th>Contribution</th><th>% of Total</th></tr></thead><tbody>';
        d.attribution.forEach(function(a) {
            var w = a.pct;
            html += '<tr><td>' + a.source + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">+' + a.contribution + '%</td>' +
                '<td><div style="display:flex;align-items:center;gap:8px"><div style="width:' + w + '%;height:8px;background:#00ff88;border-radius:4px;max-width:100px"></div><span style="color:#888">' + a.pct + '%</span></div></td></tr>';
        });
        html += '</tbody></table></div>';

        // Benchmark comparison
        html += '<div class="sol-section"><div class="sol-section-title">📈 Benchmark Comparison</div>';
        var maxBench = Math.max.apply(null, d.benchmarks.map(function(b) { return b.ret; }));
        d.benchmarks.forEach(function(b) {
            var w = (b.ret / maxBench) * 100;
            html += '<div style="margin-bottom:12px">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#aaa;font-size:13px">' + b.name + '</span><span style="font-family:monospace;color:' + b.color + '">+' + b.ret + '%</span></div>' +
                '<div class="sol-progress"><div class="sol-progress-fill" style="width:' + w + '%;background:' + b.color + '"></div></div></div>';
        });
        html += '</div></div>';

        // Key metrics table
        html += '<div class="sol-section"><div class="sol-section-title">📋 Key Metrics</div>' +
            '<table class="sol-table"><tbody>' +
            '<tr><td>Annualized Return</td><td style="font-family:monospace;color:#00ff88;text-align:right">+' + d.annualizedReturn + '%</td></tr>' +
            '<tr><td>Profit Factor</td><td style="font-family:monospace;text-align:right">' + d.profitFactor + 'x</td></tr>' +
            '<tr><td>Average Win</td><td style="font-family:monospace;color:#00ff88;text-align:right">+' + d.avgWin + '%</td></tr>' +
            '<tr><td>Average Loss</td><td style="font-family:monospace;color:#ff4466;text-align:right">' + d.avgLoss + '%</td></tr>' +
            '<tr><td>Win Rate</td><td style="font-family:monospace;text-align:right">' + d.winRate + '%</td></tr>' +
            '</tbody></table></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('performance-report', PerformanceReport, 'institutional', {
    icon: '📊', name: 'Performance Report', description: 'Return attribution, Sharpe ratio, benchmark comparison and monthly analysis'
});
