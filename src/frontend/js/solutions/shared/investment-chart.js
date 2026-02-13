/* ============================================
   INVESTMENT CHART - Full portfolio tracking
   with performance, deposits, PnL breakdown
   ============================================ */

const InvestmentChart = {
    portfolio: null,

    init() {
        try { this.portfolio = JSON.parse(localStorage.getItem('obelisk_invest_chart')); } catch(e) {}
        if (!this.portfolio) this.generatePortfolio();
    },

    save() { localStorage.setItem('obelisk_invest_chart', JSON.stringify(this.portfolio)); },

    generatePortfolio() {
        var now = Date.now();
        var day = 86400000;
        var deposits = [
            { date: now - 365 * day, amount: 10000, type: 'deposit' },
            { date: now - 300 * day, amount: 5000, type: 'deposit' },
            { date: now - 200 * day, amount: 3000, type: 'deposit' },
            { date: now - 120 * day, amount: 8000, type: 'deposit' },
            { date: now - 60 * day, amount: -2000, type: 'withdrawal' },
            { date: now - 30 * day, amount: 5000, type: 'deposit' }
        ];
        var totalDeposited = 0;
        deposits.forEach(function(d) { totalDeposited += d.amount; });

        // Generate daily portfolio values for 365 days
        var history = [];
        var val = 10000;
        var depositIdx = 1;
        for (var i = 365; i >= 0; i--) {
            var date = now - i * day;
            // Check for deposits
            while (depositIdx < deposits.length && deposits[depositIdx].date <= date) {
                val += deposits[depositIdx].amount;
                depositIdx++;
            }
            // Market movement
            var trend = Math.sin(i / 60) * 0.002 + 0.0004;
            val *= (1 + trend + (Math.random() - 0.47) * 0.025);
            val = Math.max(val, 1000);
            history.push({ date: date, value: val });
        }

        // Asset breakdown over time (quarterly snapshots)
        var allocHistory = [];
        for (var q = 0; q < 5; q++) {
            var idx = Math.floor((q / 4) * (history.length - 1));
            var total = history[idx].value;
            allocHistory.push({
                date: history[idx].date,
                BTC: 35 + (Math.random() - 0.5) * 10,
                ETH: 25 + (Math.random() - 0.5) * 8,
                SOL: 15 + (Math.random() - 0.5) * 6,
                Stables: 15 + (Math.random() - 0.5) * 5,
                Other: 10 + (Math.random() - 0.5) * 4
            });
        }

        // Monthly returns
        var monthlyReturns = [];
        var months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
        var prevVal = history[0].value;
        for (var m = 0; m < 12; m++) {
            var mIdx = Math.floor(((m + 1) / 12) * (history.length - 1));
            var mVal = history[mIdx].value;
            var ret = ((mVal - prevVal) / prevVal) * 100;
            monthlyReturns.push({ month: months[m], return: ret });
            prevVal = mVal;
        }

        this.portfolio = {
            history: history,
            deposits: deposits,
            totalDeposited: totalDeposited,
            currentValue: history[history.length - 1].value,
            allocHistory: allocHistory,
            monthlyReturns: monthlyReturns,
            holdings: [
                { asset: 'BTC', amount: 0.12, value: 11700, cost: 9800, pct: 35, color: '#f7931a' },
                { asset: 'ETH', amount: 2.5, value: 8500, cost: 7200, pct: 25, color: '#627eea' },
                { asset: 'SOL', amount: 26, value: 4940, cost: 3800, pct: 15, color: '#9945ff' },
                { asset: 'USDC', amount: 5000, value: 5000, cost: 5000, pct: 15, color: '#2775ca' },
                { asset: 'Other', amount: 0, value: 3360, cost: 3200, pct: 10, color: '#888' }
            ]
        };
        this.save();
    },

    renderPortfolioChart(history, deposits, width, height) {
        if (history.length < 2) return '';
        var vals = history.map(function(h) { return h.value; });
        var min = Math.min.apply(null, vals) * 0.95;
        var max = Math.max.apply(null, vals) * 1.05;
        var range = max - min || 1;
        var len = history.length;

        var svg = '<svg width="' + width + '" height="' + (height + 25) + '">';

        // Grid lines
        for (var g = 0; g <= 4; g++) {
            var gy = 5 + (g / 4) * (height - 10);
            var gVal = max - (g / 4) * range;
            svg += '<line x1="40" y1="' + gy + '" x2="' + width + '" y2="' + gy + '" stroke="#111" stroke-width="0.5"/>';
            svg += '<text x="38" y="' + (gy + 3) + '" text-anchor="end" fill="#444" font-size="9" font-family="monospace">$' + (gVal / 1000).toFixed(1) + 'K</text>';
        }

        // Area fill + line
        var path = '', areaPath = '';
        history.forEach(function(h, i) {
            var x = 40 + ((i / (len - 1)) * (width - 45));
            var y = 5 + ((max - h.value) / range) * (height - 10);
            path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
            areaPath += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        var lastX = 40 + (width - 45);
        areaPath += ' L' + lastX + ',' + height + ' L40,' + height + ' Z';
        var lastVal = history[len - 1].value;
        var firstVal = history[0].value;
        var lineColor = lastVal >= firstVal ? '#00ff88' : '#ff4466';
        var gradId = 'inv-grad-' + Math.floor(Math.random() * 9999);
        svg += '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + lineColor + '" stop-opacity="0.25"/><stop offset="100%" stop-color="' + lineColor + '" stop-opacity="0.02"/></linearGradient></defs>';
        svg += '<path d="' + areaPath + '" fill="url(#' + gradId + ')"/>';
        svg += '<path d="' + path + '" fill="none" stroke="' + lineColor + '" stroke-width="2"/>';

        // Deposit/withdrawal markers
        var startDate = history[0].date, endDate = history[len - 1].date;
        var dateRange = endDate - startDate || 1;
        deposits.forEach(function(d) {
            var dx = 40 + ((d.date - startDate) / dateRange) * (width - 45);
            if (dx < 40 || dx > width) return;
            var nearIdx = Math.round(((d.date - startDate) / dateRange) * (len - 1));
            nearIdx = Math.max(0, Math.min(len - 1, nearIdx));
            var dy = 5 + ((max - history[nearIdx].value) / range) * (height - 10);
            var mColor = d.amount > 0 ? '#00d4ff' : '#ff8844';
            svg += '<circle cx="' + dx.toFixed(1) + '" cy="' + dy.toFixed(1) + '" r="4" fill="' + mColor + '" stroke="#0a0a0a" stroke-width="1.5"/>';
            svg += '<text x="' + dx.toFixed(1) + '" y="' + (dy - 8) + '" text-anchor="middle" fill="' + mColor + '" font-size="8" font-weight="600">' + (d.amount > 0 ? '+' : '') + '$' + (d.amount / 1000).toFixed(1) + 'K</text>';
        });

        // Time axis
        var timeLabels = ['1Y', '9M', '6M', '3M', 'Now'];
        timeLabels.forEach(function(label, i) {
            var tx = 40 + (i / (timeLabels.length - 1)) * (width - 45);
            svg += '<text x="' + tx + '" y="' + (height + 15) + '" text-anchor="middle" fill="#444" font-size="9">' + label + '</text>';
        });

        svg += '</svg>';
        return svg;
    },

    renderMonthlyBars(returns, width, height) {
        var maxAbs = Math.max.apply(null, returns.map(function(r) { return Math.abs(r.return); })) || 1;
        var barW = Math.floor((width - 20) / returns.length) - 3;
        var midY = height / 2;
        var svg = '<svg width="' + width + '" height="' + (height + 18) + '">';
        svg += '<line x1="10" y1="' + midY + '" x2="' + (width - 5) + '" y2="' + midY + '" stroke="#333" stroke-width="1"/>';

        returns.forEach(function(r, i) {
            var x = 10 + i * (barW + 3);
            var barH = (Math.abs(r.return) / maxAbs) * (midY - 5);
            var y = r.return >= 0 ? midY - barH : midY;
            var color = r.return >= 0 ? '#00ff88' : '#ff4466';
            svg += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" fill="' + color + '" rx="2" opacity="0.7"/>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (height + 12) + '" text-anchor="middle" fill="#555" font-size="8">' + r.month + '</text>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (r.return >= 0 ? y - 3 : y + barH + 10) + '" text-anchor="middle" fill="' + color + '" font-size="8">' + (r.return >= 0 ? '+' : '') + r.return.toFixed(1) + '%</text>';
        });
        svg += '</svg>';
        return svg;
    },

    renderAllocationDonut(holdings, size) {
        var cx = size / 2, cy = size / 2, r = size * 0.38, ir = size * 0.22;
        var svg = '<svg width="' + size + '" height="' + size + '">';
        var angle = -Math.PI / 2;
        var total = 0;
        holdings.forEach(function(h) { total += h.value; });
        if (total === 0) { svg += '</svg>'; return svg; }

        holdings.forEach(function(h) {
            var sweep = (h.value / total) * Math.PI * 2;
            var x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
            var ix1 = cx + ir * Math.cos(angle), iy1 = cy + ir * Math.sin(angle);
            angle += sweep;
            var x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
            var ix2 = cx + ir * Math.cos(angle), iy2 = cy + ir * Math.sin(angle);
            var large = sweep > Math.PI ? 1 : 0;
            svg += '<path d="M' + ix1.toFixed(1) + ',' + iy1.toFixed(1) +
                ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) +
                ' A' + r + ',' + r + ' 0 ' + large + ',1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) +
                ' L' + ix2.toFixed(1) + ',' + iy2.toFixed(1) +
                ' A' + ir + ',' + ir + ' 0 ' + large + ',0 ' + ix1.toFixed(1) + ',' + iy1.toFixed(1) +
                ' Z" fill="' + h.color + '" opacity="0.8"/>';
        });
        svg += '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">$' + (total / 1000).toFixed(1) + 'K</text>';
        svg += '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" fill="#888" font-size="9">Total Value</text>';
        svg += '</svg>';
        return svg;
    },

    renderPnLWaterfall(holdings, width, height) {
        var svg = '<svg width="' + width + '" height="' + (height + 20) + '">';
        var barW = Math.floor((width - 40) / holdings.length) - 8;
        var maxPnl = Math.max.apply(null, holdings.map(function(h) { return Math.abs(h.value - h.cost); })) || 1;

        holdings.forEach(function(h, i) {
            var x = 20 + i * (barW + 8);
            var pnl = h.value - h.cost;
            var pnlPct = h.cost > 0 ? ((pnl / h.cost) * 100) : 0;
            var barH = (Math.abs(pnl) / maxPnl) * (height / 2 - 10);
            var midY = height / 2;
            var y = pnl >= 0 ? midY - barH : midY;
            var color = pnl >= 0 ? '#00ff88' : '#ff4466';

            svg += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" fill="' + color + '" rx="3" opacity="0.7"/>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (pnl >= 0 ? y - 4 : y + barH + 12) + '" text-anchor="middle" fill="' + color + '" font-size="10" font-weight="600">' + (pnl >= 0 ? '+' : '') + '$' + pnl.toFixed(0) + '</text>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (pnl >= 0 ? y - 14 : y + barH + 22) + '" text-anchor="middle" fill="#888" font-size="8">' + (pnlPct >= 0 ? '+' : '') + pnlPct.toFixed(1) + '%</text>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (height + 14) + '" text-anchor="middle" fill="#aaa" font-size="10" font-weight="600">' + h.asset + '</text>';
        });

        svg += '<line x1="15" y1="' + (height / 2) + '" x2="' + (width - 5) + '" y2="' + (height / 2) + '" stroke="#333" stroke-width="1" stroke-dasharray="4,3"/>';
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var p = this.portfolio;
        var totalPnl = p.currentValue - p.totalDeposited;
        var totalReturn = p.totalDeposited > 0 ? ((totalPnl / p.totalDeposited) * 100) : 0;
        var unrealizedPnl = 0;
        p.holdings.forEach(function(h) { unrealizedPnl += h.value - h.cost; });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + p.currentValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</div><div class="sol-stat-label">Portfolio Value</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (totalPnl >= 0 ? 'green' : 'red') + '">' + (totalPnl >= 0 ? '+' : '') + '$' + totalPnl.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</div><div class="sol-stat-label">Total PnL</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (totalReturn >= 0 ? 'green' : 'red') + '">' + (totalReturn >= 0 ? '+' : '') + totalReturn.toFixed(1) + '%</div><div class="sol-stat-label">Total Return</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">$' + p.totalDeposited.toLocaleString() + '</div><div class="sol-stat-label">Total Invested</div></div></div>';

        // Timeframe tabs
        html += '<div style="display:flex;gap:6px;margin-bottom:12px">';
        ['1W', '1M', '3M', '6M', '1Y', 'ALL'].forEach(function(tf, i) {
            html += '<button class="sol-btn sol-btn-sm ' + (i === 4 ? 'sol-btn-primary' : 'sol-btn-outline') + ' ic-tf" data-tf="' + tf + '">' + tf + '</button>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">📈 Portfolio Performance</div>' +
            '<div style="padding:5px 0;overflow-x:auto">' + this.renderPortfolioChart(p.history, p.deposits, 600, 220) + '</div>' +
            '<div style="display:flex;gap:12px;justify-content:center;font-size:11px;margin-top:4px">' +
            '<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00d4ff;margin-right:4px"></span>Deposit</span>' +
            '<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff8844;margin-right:4px"></span>Withdrawal</span></div></div>';

        html += '<div style="display:flex;gap:16px;flex-wrap:wrap">';

        // Donut
        html += '<div class="sol-section" style="flex:0 0 auto"><div class="sol-section-title">🍩 Allocation</div>' +
            '<div style="text-align:center">' + this.renderAllocationDonut(p.holdings, 200) + '</div>' +
            '<div style="margin-top:8px">';
        p.holdings.forEach(function(h) {
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:12px">' +
                '<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + h.color + ';margin-right:6px"></span>' + h.asset + '</span>' +
                '<span style="font-family:monospace;color:#888">' + h.pct + '%</span></div>';
        });
        html += '</div></div>';

        // PnL Waterfall
        html += '<div class="sol-section" style="flex:1;min-width:300px"><div class="sol-section-title">💰 PnL by Asset</div>' +
            '<div style="padding:5px 0">' + this.renderPnLWaterfall(p.holdings, 360, 160) + '</div></div></div>';

        // Monthly returns
        html += '<div class="sol-section"><div class="sol-section-title">📊 Monthly Returns</div>' +
            '<div style="padding:5px 0;overflow-x:auto">' + this.renderMonthlyBars(p.monthlyReturns, 600, 120) + '</div></div>';

        // Holdings table
        html += '<div class="sol-section"><div class="sol-section-title">📋 Holdings Detail</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Amount</th><th>Value</th><th>Cost Basis</th><th>PnL</th><th>Return</th><th>Weight</th></tr></thead><tbody>';
        p.holdings.forEach(function(h) {
            var pnl = h.value - h.cost;
            var ret = h.cost > 0 ? ((pnl / h.cost) * 100) : 0;
            var pnlColor = pnl >= 0 ? '#00ff88' : '#ff4466';
            html += '<tr><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + h.color + ';margin-right:6px"></span><strong>' + h.asset + '</strong></td>' +
                '<td style="font-family:monospace">' + (h.amount > 0 ? h.amount : '-') + '</td>' +
                '<td style="font-family:monospace;color:#fff">$' + h.value.toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:#888">$' + h.cost.toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:' + pnlColor + '">' + (pnl >= 0 ? '+' : '') + '$' + pnl.toFixed(0) + '</td>' +
                '<td style="font-family:monospace;color:' + pnlColor + '">' + (ret >= 0 ? '+' : '') + ret.toFixed(1) + '%</td>' +
                '<td><div style="display:flex;align-items:center;gap:4px"><div class="sol-progress" style="width:50px;height:4px"><div class="sol-progress-fill" style="width:' + h.pct + '%;background:' + h.color + '"></div></div><span style="font-size:11px;color:#888">' + h.pct + '%</span></div></td></tr>';
        });
        html += '</tbody></table></div>';

        // Deposit history
        html += '<div class="sol-section"><div class="sol-section-title">📥 Deposit History</div>' +
            '<table class="sol-table"><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Cumulative</th></tr></thead><tbody>';
        var cum = 0;
        p.deposits.forEach(function(d) {
            cum += d.amount;
            var typeTag = d.amount > 0 ? 'sol-tag-green' : 'sol-tag-red';
            html += '<tr><td style="color:#888">' + new Date(d.date).toISOString().split('T')[0] + '</td>' +
                '<td><span class="sol-tag ' + typeTag + '">' + (d.amount > 0 ? 'Deposit' : 'Withdrawal') + '</span></td>' +
                '<td style="font-family:monospace;color:' + (d.amount > 0 ? '#00ff88' : '#ff8844') + '">' + (d.amount > 0 ? '+' : '') + '$' + d.amount.toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:#888">$' + cum.toLocaleString() + '</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('investment-chart', InvestmentChart, 'shared', {
    icon: '📈', name: 'Investment Tracker', description: 'Full portfolio performance chart with PnL waterfall, monthly returns, and deposit history'
});
