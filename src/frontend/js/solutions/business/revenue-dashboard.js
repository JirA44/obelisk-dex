/* ============================================
   REVENUE DASHBOARD - Business revenue analytics
   ============================================ */

const RevenueDashboard = {
    init() {},

    generateData() {
        var months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
        var revenue = [], expenses = [], net = [];
        var r = 12000;
        for (var i = 0; i < months.length; i++) {
            r *= (1 + (Math.random() - 0.3) * 0.15);
            var e = r * (0.3 + Math.random() * 0.2);
            revenue.push(Math.round(r));
            expenses.push(Math.round(e));
            net.push(Math.round(r - e));
        }
        return { months: months, revenue: revenue, expenses: expenses, net: net };
    },

    getRevenueStreams() {
        return [
            { name: 'Trading Fees', amount: 28500, pct: 42, change: 8.5, color: '#00ff88' },
            { name: 'Subscription Plans', amount: 15200, pct: 22, change: 12.3, color: '#00d4ff' },
            { name: 'Staking Commissions', amount: 9800, pct: 14, change: -2.1, color: '#c9a227' },
            { name: 'API Access Fees', amount: 7500, pct: 11, change: 25.0, color: '#ff8844' },
            { name: 'Lending Interest', amount: 4800, pct: 7, change: 5.7, color: '#88cc44' },
            { name: 'Other', amount: 2700, pct: 4, change: -8.3, color: '#888' }
        ];
    },

    renderBarChart(data, width, height) {
        var maxVal = Math.max.apply(null, data.revenue);
        var barW = Math.floor((width - 40) / data.months.length) - 8;
        var svg = '<svg width="' + width + '" height="' + (height + 30) + '">';
        data.months.forEach(function(m, i) {
            var x = 20 + i * (barW + 8);
            var revH = (data.revenue[i] / maxVal) * (height - 20);
            var expH = (data.expenses[i] / maxVal) * (height - 20);
            svg += '<rect x="' + x + '" y="' + (height - revH) + '" width="' + (barW / 2 - 1) + '" height="' + revH + '" fill="#00ff88" rx="2" opacity="0.7"/>';
            svg += '<rect x="' + (x + barW / 2 + 1) + '" y="' + (height - expH) + '" width="' + (barW / 2 - 1) + '" height="' + expH + '" fill="#ff4466" rx="2" opacity="0.5"/>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (height + 15) + '" text-anchor="middle" fill="#555" font-size="10">' + m + '</text>';
        });
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var data = this.generateData();
        var streams = this.getRevenueStreams();
        var totalRevenue = streams.reduce(function(s, st) { return s + st.amount; }, 0);
        var lastMonthRev = data.revenue[data.revenue.length - 1];
        var prevMonthRev = data.revenue[data.revenue.length - 2];
        var monthGrowth = ((lastMonthRev - prevMonthRev) / prevMonthRev * 100);
        var totalNet = data.net.reduce(function(s, n) { return s + n; }, 0);
        var margin = (totalNet / data.revenue.reduce(function(s, r) { return s + r; }, 0) * 100);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + totalRevenue.toLocaleString() + '</div><div class="sol-stat-label">Monthly Revenue</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (monthGrowth >= 0 ? 'green' : 'red') + '">' + (monthGrowth >= 0 ? '+' : '') + monthGrowth.toFixed(1) + '%</div><div class="sol-stat-label">MoM Growth</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + margin.toFixed(0) + '%</div><div class="sol-stat-label">Net Margin</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$' + (totalRevenue * 12 / 1000).toFixed(0) + 'K</div><div class="sol-stat-label">ARR</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📈 Revenue vs Expenses (8 Months)</div>' +
            '<div style="padding:10px 0">' + this.renderBarChart(data, 580, 160) + '</div>' +
            '<div style="display:flex;gap:16px;justify-content:center;font-size:12px">' +
            '<span><span style="display:inline-block;width:10px;height:10px;background:#00ff88;border-radius:2px;margin-right:4px"></span>Revenue</span>' +
            '<span><span style="display:inline-block;width:10px;height:10px;background:#ff4466;border-radius:2px;margin-right:4px"></span>Expenses</span></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">💰 Revenue Streams</div>';
        streams.forEach(function(s) {
            var changeColor = s.change >= 0 ? '#00ff88' : '#ff4466';
            html += '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
                '<span style="color:#aaa;font-size:13px">' + s.name + '</span>' +
                '<div><span style="font-family:monospace;color:#fff;margin-right:12px">$' + s.amount.toLocaleString() + '</span>' +
                '<span style="font-family:monospace;color:' + changeColor + ';font-size:12px">' + (s.change >= 0 ? '+' : '') + s.change + '%</span></div></div>' +
                '<div class="sol-progress"><div class="sol-progress-fill" style="width:' + s.pct + '%;background:' + s.color + '"></div></div></div>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Monthly Breakdown</div>' +
            '<table class="sol-table"><thead><tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Net</th><th>Margin</th></tr></thead><tbody>';
        data.months.forEach(function(m, i) {
            var mg = (data.net[i] / data.revenue[i] * 100);
            html += '<tr><td>' + m + '</td><td style="font-family:monospace;color:#00ff88">$' + data.revenue[i].toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:#ff4466">$' + data.expenses[i].toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:' + (data.net[i] >= 0 ? '#00ff88' : '#ff4466') + '">$' + data.net[i].toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:#888">' + mg.toFixed(0) + '%</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('revenue-dashboard', RevenueDashboard, 'business', {
    icon: '💰', name: 'Revenue Dashboard', description: 'Track revenue streams, growth metrics, and P&L with detailed breakdowns'
});
