/* ============================================
   PNL CALENDAR - Heatmap calendrier des gains/pertes
   Style GitHub contributions
   ============================================ */

const PnLCalendar = {
    data: [],

    init() {
        try { this.data = JSON.parse(localStorage.getItem('obelisk_pnl_cal') || '[]'); } catch(e) { this.data = []; }
        if (this.data.length === 0) this.generateHistory();
    },

    save() { localStorage.setItem('obelisk_pnl_cal', JSON.stringify(this.data)); },

    generateHistory() {
        var seed = 42;
        var rng = function() { seed = (seed * 16807 + 7) % 2147483647; return (seed % 10000) / 10000; };
        var today = new Date();
        this.data = [];
        var balance = 10000;
        for (var d = 364; d >= 0; d--) {
            var date = new Date(today.getTime() - d * 86400000);
            var key = date.toISOString().split('T')[0];
            var r = rng();
            var weekday = date.getDay();
            // Weekend = less trading
            var active = weekday === 0 || weekday === 6 ? r > 0.6 : r > 0.15;
            if (!active) { this.data.push({ date: key, pnl: 0, trades: 0, balance: balance }); continue; }
            var trades = Math.floor(1 + rng() * 8);
            var pnl = (rng() - 0.44) * balance * 0.03; // Slight positive bias
            pnl = Math.round(pnl * 100) / 100;
            balance += pnl;
            balance = Math.max(balance * 0.5, balance); // Floor
            this.data.push({ date: key, pnl: pnl, trades: trades, balance: Math.round(balance * 100) / 100 });
        }
        this.save();
    },

    getStats(days) {
        var slice = this.data.slice(-days);
        var totalPnl = 0, wins = 0, losses = 0, totalTrades = 0, bestDay = -Infinity, worstDay = Infinity, streak = 0, maxStreak = 0, currentStreak = 0;
        slice.forEach(function(d) {
            totalPnl += d.pnl;
            totalTrades += d.trades;
            if (d.pnl > 0) { wins++; currentStreak++; if (currentStreak > maxStreak) maxStreak = currentStreak; }
            else if (d.pnl < 0) { losses++; currentStreak = 0; }
            if (d.pnl > bestDay) bestDay = d.pnl;
            if (d.pnl < worstDay) worstDay = d.pnl;
        });
        var activeDays = slice.filter(function(d) { return d.trades > 0; }).length;
        return {
            totalPnl: totalPnl, wins: wins, losses: losses, activeDays: activeDays,
            winRate: activeDays > 0 ? (wins / activeDays * 100) : 0,
            totalTrades: totalTrades, bestDay: bestDay, worstDay: worstDay,
            maxStreak: maxStreak, avgDaily: activeDays > 0 ? totalPnl / activeDays : 0
        };
    },

    renderHeatmap(data, cellSize) {
        var weeks = Math.ceil(data.length / 7);
        var w = (weeks + 1) * (cellSize + 2) + 40;
        var h = 7 * (cellSize + 2) + 30;
        var svg = '<svg width="' + w + '" height="' + h + '">';

        // Day labels
        var dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        dayLabels.forEach(function(l, i) {
            svg += '<text x="12" y="' + (22 + i * (cellSize + 2) + cellSize / 2) + '" text-anchor="middle" fill="#555" font-size="9">' + l + '</text>';
        });

        // Find max for color scaling
        var maxAbs = 1;
        data.forEach(function(d) { var a = Math.abs(d.pnl); if (a > maxAbs) maxAbs = a; });

        // Month labels
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var lastMonth = -1;

        data.forEach(function(d, idx) {
            var dt = new Date(d.date);
            var dayOfWeek = dt.getDay();
            var weekIdx = Math.floor(idx / 7);
            var x = 30 + weekIdx * (cellSize + 2);
            var y = 20 + dayOfWeek * (cellSize + 2);

            // Month label
            var m = dt.getMonth();
            if (m !== lastMonth) {
                svg += '<text x="' + (x + cellSize / 2) + '" y="14" fill="#555" font-size="8">' + months[m] + '</text>';
                lastMonth = m;
            }

            var color, opacity;
            if (d.trades === 0) {
                color = '#111';
                opacity = 1;
            } else {
                var intensity = Math.min(1, Math.abs(d.pnl) / maxAbs);
                if (d.pnl >= 0) {
                    var g = Math.floor(80 + intensity * 175);
                    color = 'rgb(0,' + g + ',0)';
                } else {
                    var r = Math.floor(80 + intensity * 175);
                    color = 'rgb(' + r + ',0,' + Math.floor(r * 0.3) + ')';
                }
                opacity = 0.3 + intensity * 0.7;
            }
            svg += '<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" rx="2" fill="' + color + '" opacity="' + opacity.toFixed(2) + '">' +
                '<title>' + d.date + ': ' + (d.pnl >= 0 ? '+' : '') + '$' + d.pnl.toFixed(2) + ' (' + d.trades + ' trades)</title></rect>';
        });

        // Legend
        var ly = h - 5;
        svg += '<text x="30" y="' + ly + '" fill="#555" font-size="8">Less</text>';
        var legendColors = ['#111', '#1a3a1a', '#0a6b0a', '#00aa00', '#00ff00'];
        legendColors.forEach(function(c, i) {
            svg += '<rect x="' + (60 + i * (cellSize + 2)) + '" y="' + (ly - 8) + '" width="' + cellSize + '" height="' + cellSize + '" rx="2" fill="' + c + '" opacity="0.8"/>';
        });
        svg += '<text x="' + (65 + legendColors.length * (cellSize + 2)) + '" y="' + ly + '" fill="#555" font-size="8">More</text>';

        svg += '</svg>';
        return svg;
    },

    renderMonthlyBars(data, w, h) {
        // Aggregate by month
        var monthly = {};
        data.forEach(function(d) {
            var m = d.date.substring(0, 7);
            if (!monthly[m]) monthly[m] = { pnl: 0, trades: 0 };
            monthly[m].pnl += d.pnl;
            monthly[m].trades += d.trades;
        });
        var keys = Object.keys(monthly).slice(-12);
        var maxAbs = 1;
        keys.forEach(function(k) { var a = Math.abs(monthly[k].pnl); if (a > maxAbs) maxAbs = a; });

        var padL = 50, padR = 10, padT = 15, padB = 25;
        var chartW = w - padL - padR;
        var chartH = h - padT - padB;
        var barW = Math.max(8, (chartW / keys.length) * 0.6);
        var gap = chartW / keys.length;
        var mid = padT + chartH / 2;

        var svg = '<svg width="' + w + '" height="' + h + '">';
        svg += '<line x1="' + padL + '" y1="' + mid + '" x2="' + (w - padR) + '" y2="' + mid + '" stroke="#222" stroke-width="1"/>';

        keys.forEach(function(k, i) {
            var val = monthly[k].pnl;
            var barH = (Math.abs(val) / maxAbs) * (chartH / 2 - 5);
            var x = padL + i * gap + gap / 2;
            var color = val >= 0 ? '#00ff88' : '#ff4466';
            var y = val >= 0 ? mid - barH : mid;
            svg += '<rect x="' + (x - barW / 2) + '" y="' + y + '" width="' + barW + '" height="' + Math.max(1, barH) + '" fill="' + color + '" opacity="0.7" rx="2"/>';
            svg += '<text x="' + x + '" y="' + (h - 8) + '" text-anchor="middle" fill="#555" font-size="8">' + k.substring(5) + '</text>';
            svg += '<text x="' + x + '" y="' + (val >= 0 ? y - 3 : y + barH + 10) + '" text-anchor="middle" fill="' + color + '" font-size="8" font-weight="600">' + (val >= 0 ? '+' : '') + (Math.abs(val) >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toFixed(0)) + '</text>';
        });

        svg += '</svg>';
        return svg;
    },

    renderEquityCurve(data, w, h) {
        var padL = 50, padR = 10, padT = 10, padB = 20;
        var chartW = w - padL - padR, chartH = h - padT - padB;
        var minB = Infinity, maxB = -Infinity;
        data.forEach(function(d) { if (d.balance < minB) minB = d.balance; if (d.balance > maxB) maxB = d.balance; });
        var range = maxB - minB;
        if (range === 0) range = 1;

        var svg = '<svg width="' + w + '" height="' + h + '">';
        var path = '', areaPath = '';
        var step = Math.max(1, Math.floor(data.length / chartW));
        data.forEach(function(d, i) {
            if (i % step !== 0 && i !== data.length - 1) return;
            var x = padL + (i / (data.length - 1)) * chartW;
            var y = padT + chartH - ((d.balance - minB) / range) * chartH;
            path += (path === '' ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
            areaPath += (areaPath === '' ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        areaPath += 'L' + (padL + chartW) + ',' + (padT + chartH) + 'L' + padL + ',' + (padT + chartH) + 'Z';

        var lastBal = data[data.length - 1].balance;
        var firstBal = data[0].balance;
        var color = lastBal >= firstBal ? '#00ff88' : '#ff4466';

        svg += '<defs><linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + color + '" stop-opacity="0.3"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>';
        svg += '<path d="' + areaPath + '" fill="url(#eqGrad)"/>';
        svg += '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="1.5"/>';

        // Y axis
        for (var g = 0; g <= 4; g++) {
            var gv = minB + (range / 4) * g;
            var gy = padT + chartH - (g / 4) * chartH;
            svg += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (w - padR) + '" y2="' + gy + '" stroke="#111" stroke-width="1"/>';
            svg += '<text x="' + (padL - 4) + '" y="' + (gy + 3) + '" text-anchor="end" fill="#444" font-size="8">$' + (gv / 1000).toFixed(1) + 'K</text>';
        }

        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var stats30 = this.getStats(30);
        var stats365 = this.getStats(365);

        var totalPnlColor = stats30.totalPnl >= 0 ? 'green' : 'red';
        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + totalPnlColor + '">' + (stats30.totalPnl >= 0 ? '+' : '') + '$' + stats30.totalPnl.toFixed(0) + '</div><div class="sol-stat-label">30d PnL</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + stats30.winRate.toFixed(0) + '%</div><div class="sol-stat-label">Win Rate</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">+$' + stats30.bestDay.toFixed(0) + '</div><div class="sol-stat-label">Best Day</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">-$' + Math.abs(stats30.worstDay).toFixed(0) + '</div><div class="sol-stat-label">Worst Day</div></div></div>';

        html += '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + stats30.totalTrades + '</div><div class="sol-stat-label">30d Trades</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + stats30.maxStreak + 'd</div><div class="sol-stat-label">Max Win Streak</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + (stats30.avgDaily >= 0 ? '+' : '') + '$' + stats30.avgDaily.toFixed(0) + '/d</div><div class="sol-stat-label">Avg Daily</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + stats30.activeDays + '/' + Math.min(30, this.data.length) + '</div><div class="sol-stat-label">Active Days</div></div></div>';

        // Heatmap
        html += '<div class="sol-section"><div class="sol-section-title">📅 PnL Calendar (365 days)</div>' +
            '<div style="overflow-x:auto;padding:8px 0">' + this.renderHeatmap(this.data, 12) + '</div></div>';

        // Monthly bars
        html += '<div class="sol-section"><div class="sol-section-title">📊 Monthly PnL</div>' +
            '<div style="overflow-x:auto;padding:4px 0">' + this.renderMonthlyBars(this.data, 600, 160) + '</div></div>';

        // Equity curve
        html += '<div class="sol-section"><div class="sol-section-title">📈 Equity Curve</div>' +
            '<div style="overflow-x:auto;padding:4px 0">' + this.renderEquityCurve(this.data, 600, 140) + '</div></div>';

        // Recent days table
        html += '<div class="sol-section"><div class="sol-section-title">📋 Last 14 Days</div>' +
            '<table class="sol-table"><thead><tr><th>Date</th><th>PnL</th><th>Trades</th><th>Balance</th></tr></thead><tbody>';
        this.data.slice(-14).reverse().forEach(function(d) {
            var pnlColor = d.pnl > 0 ? '#00ff88' : d.pnl < 0 ? '#ff4466' : '#555';
            html += '<tr><td style="color:#888">' + d.date + '</td>' +
                '<td style="font-family:monospace;color:' + pnlColor + ';font-weight:600">' + (d.pnl >= 0 ? '+' : '') + '$' + d.pnl.toFixed(2) + '</td>' +
                '<td style="font-family:monospace">' + d.trades + '</td>' +
                '<td style="font-family:monospace;color:#888">$' + d.balance.toFixed(0) + '</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('pnl-calendar', PnLCalendar, 'retail', {
    icon: '📅', name: 'PnL Calendar', description: 'GitHub-style heatmap of daily gains/losses with equity curve and monthly breakdown'
});
