/* ============================================
   BUSINESS DASHBOARD - Business Module
   AUM, PnL, treasury allocations, activity feed
   Backend: /api/institutional/treasury/overview, reports/pnl, reports/audit
   ============================================ */

const BusinessDashboard = {
    data: null,
    API_BASE: '/api/institutional',

    init() {},

    async fetchData() {
        try {
            var [treasury, pnl, audit] = await Promise.all([
                fetch(this.API_BASE + '/treasury/overview').then(function(r) { return r.json(); }),
                fetch(this.API_BASE + '/reports/pnl').then(function(r) { return r.json(); }),
                fetch(this.API_BASE + '/reports/audit').then(function(r) { return r.json(); })
            ]);
            return { treasury: treasury, pnl: pnl, audit: audit };
        } catch (e) {
            return this.getMockData();
        }
    },

    getMockData() {
        return {
            treasury: {
                aum: 2450000,
                allocations: [
                    { name: 'BTC', value: 980000, pct: 40, color: '#f7931a' },
                    { name: 'ETH', value: 612500, pct: 25, color: '#627eea' },
                    { name: 'Stablecoins', value: 490000, pct: 20, color: '#00ff88' },
                    { name: 'DeFi Yield', value: 245000, pct: 10, color: '#00d4ff' },
                    { name: 'Other', value: 122500, pct: 5, color: '#c9a227' }
                ]
            },
            pnl: {
                daily: 12340,
                weekly: 45670,
                monthly: 186500,
                yearly: 890000,
                dailyPct: 0.5,
                weeklyPct: 1.9,
                monthlyPct: 7.6,
                yearlyPct: 36.3,
                history: this.generateSparkline(30)
            },
            audit: {
                recentActivity: [
                    { time: '2026-02-07T14:30:00Z', action: 'Trade Executed', details: 'Buy 0.5 BTC @ $97,500', user: 'Hugo', type: 'trade' },
                    { time: '2026-02-07T12:00:00Z', action: 'Withdrawal', details: '500 USDC to 0x377...9140', user: 'Alice', type: 'withdrawal' },
                    { time: '2026-02-06T18:45:00Z', action: 'Stake', details: '10 ETH staked (4.2% APY)', user: 'Hugo', type: 'stake' },
                    { time: '2026-02-06T09:15:00Z', action: 'Deposit', details: '5,000 USDC deposited', user: 'Bob', type: 'deposit' },
                    { time: '2026-02-05T16:30:00Z', action: 'Trade Executed', details: 'Sell 2 SOL @ $190', user: 'Alice', type: 'trade' }
                ]
            }
        };
    },

    generateSparkline(days) {
        var data = [];
        var val = 2300000;
        for (var i = 0; i < days; i++) {
            val += (Math.random() - 0.45) * 20000;
            data.push(Math.round(val));
        }
        return data;
    },

    renderSparklineSVG(data, width, height, color) {
        if (!data || data.length < 2) return '';
        var min = Math.min.apply(null, data);
        var max = Math.max.apply(null, data);
        var range = max - min || 1;
        var points = data.map(function(v, i) {
            var x = (i / (data.length - 1)) * width;
            var y = height - ((v - min) / range) * height;
            return x + ',' + y;
        }).join(' ');
        return '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">' +
            '<polyline points="' + points + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
    },

    renderDonutSVG(allocations, size) {
        var cx = size / 2, cy = size / 2, r = size * 0.35;
        var circumference = 2 * Math.PI * r;
        var offset = 0;
        var segments = '';
        allocations.forEach(function(a) {
            var dashLen = (a.pct / 100) * circumference;
            segments += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + a.color + '" stroke-width="' + (size * 0.12) + '" ' +
                'stroke-dasharray="' + dashLen + ' ' + (circumference - dashLen) + '" ' +
                'stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
            offset += dashLen;
        });
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + segments + '</svg>';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;

        c.innerHTML = '<div style="text-align:center;padding:40px;color:#666">Loading dashboard...</div>';

        this.fetchData().then(function(data) {
            self.data = data;
            self.renderUI(c, data);
        });
    },

    renderUI(c, data) {
        var t = data.treasury;
        var p = data.pnl;
        var a = data.audit;

        var pnlColor = function(v) { return v >= 0 ? '#00ff88' : '#ff4466'; };
        var pnlSign = function(v) { return v >= 0 ? '+' : ''; };

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">$' + (t.aum / 1000000).toFixed(2) + 'M</div><div class="sol-stat-label">Total AUM</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + pnlColor(p.daily) + '">' + pnlSign(p.daily) + '$' + p.daily.toLocaleString() + '</div><div class="sol-stat-label">Daily PnL (' + pnlSign(p.dailyPct) + p.dailyPct + '%)</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + pnlColor(p.monthly) + '">' + pnlSign(p.monthly) + '$' + p.monthly.toLocaleString() + '</div><div class="sol-stat-label">Monthly PnL (' + pnlSign(p.monthlyPct) + p.monthlyPct + '%)</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + pnlColor(p.yearly) + '">' + pnlSign(p.yearly) + '$' + (p.yearly / 1000).toFixed(0) + 'K</div><div class="sol-stat-label">YTD PnL (' + pnlSign(p.yearlyPct) + p.yearlyPct + '%)</div></div>' +
            '</div>';

        // PnL chart + Allocations
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
            '<div class="sol-section"><div class="sol-section-title">📈 AUM (30 days)</div>' +
            '<div style="padding:10px 0">' + this.renderSparklineSVG(p.history, 400, 120, '#00d4ff') + '</div></div>' +

            '<div class="sol-section"><div class="sol-section-title">🍩 Treasury Allocations</div>' +
            '<div class="sol-donut-container">' +
            this.renderDonutSVG(t.allocations, 140) +
            '<div class="sol-donut-legend">' +
            t.allocations.map(function(a) {
                return '<div class="sol-donut-legend-item"><div class="sol-donut-legend-dot" style="background:' + a.color + '"></div>' + a.name + ' (' + a.pct + '%) - $' + (a.value / 1000).toFixed(0) + 'K</div>';
            }).join('') +
            '</div></div></div></div>';

        // Activity feed
        html += '<div class="sol-section"><div class="sol-section-title">📋 Recent Activity</div>';
        if (a.recentActivity.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No recent activity</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Time</th><th>Action</th><th>Details</th><th>User</th></tr></thead><tbody>';
            a.recentActivity.forEach(function(ev) {
                var typeColor = ev.type === 'trade' ? 'sol-tag-green' : ev.type === 'deposit' ? 'sol-tag-cyan' : ev.type === 'withdrawal' ? 'sol-tag-red' : 'sol-tag-gold';
                html += '<tr><td style="color:#666;font-size:12px">' + new Date(ev.time).toLocaleString() + '</td>' +
                    '<td><span class="sol-tag ' + typeColor + '">' + ev.action + '</span></td>' +
                    '<td style="font-size:13px">' + ev.details + '</td>' +
                    '<td>' + ev.user + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('business-dashboard', BusinessDashboard, 'business', {
    icon: '📊', name: 'Business Dashboard', description: 'Treasury overview, PnL tracking, allocation charts and activity audit'
});
