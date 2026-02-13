/* ============================================
   TOKEN UNLOCK CALENDAR - Vesting schedules
   ============================================ */

const TokenUnlockCalendar = {
    watchlist: [],

    init() {
        try { this.watchlist = JSON.parse(localStorage.getItem('obelisk_unlock_watch') || '[]'); } catch(e) { this.watchlist = []; }
    },

    save() { localStorage.setItem('obelisk_unlock_watch', JSON.stringify(this.watchlist)); },

    getUnlocks() {
        var today = new Date();
        return [
            { token: 'ARB', amount: '92.65M', value: '$166.8M', pctCirculating: 2.8, date: new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0], type: 'Team', impact: 'high' },
            { token: 'OP', amount: '31.4M', value: '$62.8M', pctCirculating: 1.2, date: new Date(today.getTime() + 5 * 86400000).toISOString().split('T')[0], type: 'Investor', impact: 'medium' },
            { token: 'APT', amount: '11.3M', value: '$101.7M', pctCirculating: 2.5, date: new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0], type: 'Foundation', impact: 'high' },
            { token: 'TIA', amount: '85M', value: '$1.02B', pctCirculating: 42.5, date: new Date(today.getTime() + 10 * 86400000).toISOString().split('T')[0], type: 'Team + Investor', impact: 'critical' },
            { token: 'SUI', amount: '64M', value: '$115.2M', pctCirculating: 2.4, date: new Date(today.getTime() + 12 * 86400000).toISOString().split('T')[0], type: 'Ecosystem', impact: 'medium' },
            { token: 'STRK', amount: '127M', value: '$101.6M', pctCirculating: 5.6, date: new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0], type: 'Investor', impact: 'high' },
            { token: 'SEI', amount: '55M', value: '$22M', pctCirculating: 1.8, date: new Date(today.getTime() + 18 * 86400000).toISOString().split('T')[0], type: 'Team', impact: 'low' },
            { token: 'DYDX', amount: '33M', value: '$49.5M', pctCirculating: 3.1, date: new Date(today.getTime() + 21 * 86400000).toISOString().split('T')[0], type: 'Team', impact: 'medium' },
            { token: 'JTO', amount: '28M', value: '$84M', pctCirculating: 8.2, date: new Date(today.getTime() + 25 * 86400000).toISOString().split('T')[0], type: 'Investor', impact: 'high' },
            { token: 'EIGEN', amount: '18M', value: '$81M', pctCirculating: 1.1, date: new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0], type: 'Community', impact: 'low' }
        ];
    },

    renderTimeline(unlocks, width) {
        var svg = '<svg width="' + width + '" height="180">';
        var today = Date.now();
        var maxDays = 35;
        svg += '<line x1="30" y1="90" x2="' + (width - 10) + '" y2="90" stroke="#222" stroke-width="2"/>';
        svg += '<circle cx="30" cy="90" r="4" fill="#00d4ff"/>';
        svg += '<text x="30" y="115" text-anchor="middle" fill="#00d4ff" font-size="9">Today</text>';

        unlocks.forEach(function(u, i) {
            var daysAway = Math.max(0, Math.ceil((new Date(u.date) - today) / 86400000));
            var x = Math.min(width - 15, 30 + (daysAway / maxDays) * (width - 50));
            var color = u.impact === 'critical' ? '#ff4466' : u.impact === 'high' ? '#ff8844' : u.impact === 'medium' ? '#c9a227' : '#888';
            var y = i % 2 === 0 ? 40 : 130;
            var lineY = i % 2 === 0 ? 55 : 120;
            svg += '<line x1="' + x + '" y1="' + lineY + '" x2="' + x + '" y2="90" stroke="' + color + '" stroke-width="1" stroke-dasharray="2,2"/>';
            svg += '<circle cx="' + x + '" cy="90" r="5" fill="' + color + '"/>';
            svg += '<text x="' + x + '" y="' + y + '" text-anchor="middle" fill="#fff" font-size="10" font-weight="600">' + u.token + '</text>';
            svg += '<text x="' + x + '" y="' + (y + 12) + '" text-anchor="middle" fill="' + color + '" font-size="9">' + u.value + '</text>';
        });
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var unlocks = this.getUnlocks();
        var self = this;
        var next7d = unlocks.filter(function(u) { return (new Date(u.date) - Date.now()) / 86400000 <= 7; });
        var totalValue = 0;
        unlocks.forEach(function(u) { totalValue += parseFloat(u.value.replace(/[$BMK,]/g, '')) * (u.value.includes('B') ? 1000 : 1); });
        var critical = unlocks.filter(function(u) { return u.impact === 'critical' || u.impact === 'high'; });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + next7d.length + '</div><div class="sol-stat-label">Next 7 Days</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">$' + (totalValue / 1000).toFixed(1) + 'B</div><div class="sol-stat-label">30d Unlock Value</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + critical.length + '</div><div class="sol-stat-label">High Impact</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + unlocks.length + '</div><div class="sol-stat-label">Tracked Events</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📅 Unlock Timeline (30 days)</div>' +
            '<div style="padding:10px 0;overflow-x:auto">' + this.renderTimeline(unlocks, 580) + '</div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📋 Upcoming Unlocks</div>' +
            '<table class="sol-table"><thead><tr><th>Token</th><th>Date</th><th>Amount</th><th>Value</th><th>% Circulating</th><th>Type</th><th>Impact</th></tr></thead><tbody>';
        unlocks.forEach(function(u) {
            var impactColor = u.impact === 'critical' ? '#ff4466' : u.impact === 'high' ? '#ff8844' : u.impact === 'medium' ? '#c9a227' : '#888';
            var daysAway = Math.ceil((new Date(u.date) - Date.now()) / 86400000);
            html += '<tr><td><strong>' + u.token + '</strong></td>' +
                '<td style="color:#888">' + u.date + '<div style="font-size:10px;color:#555">' + daysAway + 'd away</div></td>' +
                '<td style="font-family:monospace">' + u.amount + '</td>' +
                '<td style="font-family:monospace;color:#ff8844">' + u.value + '</td>' +
                '<td style="font-family:monospace;color:' + (u.pctCirculating > 5 ? '#ff4466' : u.pctCirculating > 2 ? '#c9a227' : '#888') + '">' + u.pctCirculating + '%</td>' +
                '<td><span class="sol-tag sol-tag-blue" style="font-size:10px">' + u.type + '</span></td>' +
                '<td><span style="color:' + impactColor + ';font-weight:600;font-size:12px">' + u.impact.toUpperCase() + '</span></td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">💡 Impact Guide</div>' +
            '<div style="color:#aaa;font-size:13px;line-height:1.8">' +
            '<div><span style="color:#ff4466;font-weight:600">CRITICAL:</span> >10% of circulating supply unlocking - expect significant sell pressure</div>' +
            '<div><span style="color:#ff8844;font-weight:600">HIGH:</span> 2-10% unlocking - monitor for large OTC deals or market selling</div>' +
            '<div><span style="color:#c9a227;font-weight:600">MEDIUM:</span> 1-2% unlocking - moderate impact, watch insider wallets</div>' +
            '<div><span style="color:#888;font-weight:600">LOW:</span> <1% unlocking - minimal market impact expected</div></div></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('token-unlock-calendar', TokenUnlockCalendar, 'shared', {
    icon: '🔓', name: 'Token Unlocks', description: 'Track upcoming token vesting unlocks with impact analysis and timeline visualization'
});
