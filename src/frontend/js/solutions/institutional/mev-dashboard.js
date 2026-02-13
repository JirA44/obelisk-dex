/* ============================================
   MEV DASHBOARD - Monitor MEV extraction
   ============================================ */

const MEVDashboard = {
    init() {},

    getMEVData() {
        return {
            stats: { totalExtracted24h: '$4.2M', sandwichCount: 342, arbCount: 1250, liquidationCount: 89, topSearcher: '0x8aE...f21' },
            recentMEV: [
                { type: 'Sandwich', victim: '0xAbc...123', token: 'UNI', profit: '$1,240', gas: '$45', block: 19284567, time: '2m ago' },
                { type: 'Arbitrage', route: 'Uni→Sushi→Curve', token: 'ETH', profit: '$890', gas: '$120', block: 19284565, time: '3m ago' },
                { type: 'Liquidation', protocol: 'Aave', token: 'ETH', profit: '$6,250', gas: '$380', block: 19284560, time: '5m ago' },
                { type: 'Sandwich', victim: '0xDef...456', token: 'PEPE', profit: '$320', gas: '$28', block: 19284555, time: '8m ago' },
                { type: 'Backrun', target: 'Large swap', token: 'WBTC', profit: '$2,100', gas: '$200', block: 19284550, time: '12m ago' },
                { type: 'Arbitrage', route: 'Uni V3→Balancer', token: 'LINK', profit: '$450', gas: '$65', block: 19284545, time: '15m ago' },
                { type: 'JIT Liquidity', pool: 'ETH/USDC 0.3%', token: 'ETH', profit: '$180', gas: '$40', block: 19284540, time: '18m ago' },
                { type: 'Sandwich', victim: '0x789...abc', token: 'ARB', profit: '$560', gas: '$32', block: 19284535, time: '22m ago' }
            ],
            topSearchers: [
                { address: '0x8aE...f21', name: 'jaredfromsubway', profit7d: '$128K', txCount: 4500, successRate: 92 },
                { address: '0x5bC...d89', name: 'Wintermute MEV', profit7d: '$95K', txCount: 2800, successRate: 88 },
                { address: '0x3Df...a12', name: 'Unknown Bot #1', profit7d: '$67K', txCount: 8200, successRate: 78 },
                { address: '0x1Ac...e45', name: 'Flashbots Alpha', profit7d: '$54K', txCount: 1500, successRate: 95 }
            ],
            protection: {
                flashbotsProtect: true, mevBlocker: false, cowswap: true,
                savedFromMEV: '$1,240', totalTxProtected: 45
            }
        };
    },

    renderMEVBreakdown(data, width, height) {
        var types = {};
        data.recentMEV.forEach(function(m) { types[m.type] = (types[m.type] || 0) + parseFloat(m.profit.replace(/[$,]/g, '')); });
        var total = 0;
        Object.values(types).forEach(function(v) { total += v; });
        if (total === 0) total = 1;
        var colors = { Sandwich: '#ff4466', Arbitrage: '#00ff88', Liquidation: '#c9a227', Backrun: '#00d4ff', 'JIT Liquidity': '#88cc44' };
        var svg = '<svg width="' + width + '" height="' + height + '">';
        var x = 0, barH = 24;
        Object.keys(types).forEach(function(type) {
            var w = (types[type] / total) * width;
            svg += '<rect x="' + x + '" y="0" width="' + w + '" height="' + barH + '" fill="' + (colors[type] || '#888') + '" opacity="0.7" rx="' + (x === 0 ? '4' : '0') + '"/>';
            if (w > 60) svg += '<text x="' + (x + w / 2) + '" y="16" text-anchor="middle" fill="#fff" font-size="10" font-weight="600">' + type + '</text>';
            x += w;
        });
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var data = this.getMEVData();

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + data.stats.totalExtracted24h + '</div><div class="sol-stat-label">24h MEV Extracted</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#ff8844">' + data.stats.sandwichCount + '</div><div class="sol-stat-label">Sandwiches</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + data.stats.arbCount + '</div><div class="sol-stat-label">Arbitrages</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + data.stats.liquidationCount + '</div><div class="sol-stat-label">Liquidations</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 MEV Type Breakdown</div>' +
            '<div style="padding:10px 0">' + this.renderMEVBreakdown(data, 580, 28) + '</div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🔴 Live MEV Activity</div>' +
            '<table class="sol-table"><thead><tr><th>Type</th><th>Details</th><th>Token</th><th>Profit</th><th>Gas</th><th>Time</th></tr></thead><tbody>';
        data.recentMEV.forEach(function(m) {
            var typeColor = m.type === 'Sandwich' ? '#ff4466' : m.type === 'Arbitrage' ? '#00ff88' : m.type === 'Liquidation' ? '#c9a227' : '#00d4ff';
            var detail = m.victim || m.route || m.protocol || m.pool || m.target || '';
            html += '<tr><td><span style="color:' + typeColor + ';font-weight:600;font-size:12px">' + m.type + '</span></td>' +
                '<td style="font-size:11px;color:#888;font-family:monospace">' + detail + '</td>' +
                '<td><strong>' + m.token + '</strong></td>' +
                '<td style="font-family:monospace;color:#00ff88">' + m.profit + '</td>' +
                '<td style="font-family:monospace;color:#888">' + m.gas + '</td>' +
                '<td style="color:#555;font-size:11px">' + m.time + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🤖 Top MEV Searchers (7d)</div>' +
            '<table class="sol-table"><thead><tr><th>Searcher</th><th>7d Profit</th><th>Txs</th><th>Success Rate</th></tr></thead><tbody>';
        data.topSearchers.forEach(function(s) {
            html += '<tr><td><strong style="color:#fff">' + s.name + '</strong><div style="font-size:10px;color:#555;font-family:monospace">' + s.address + '</div></td>' +
                '<td style="font-family:monospace;color:#00ff88">' + s.profit7d + '</td>' +
                '<td style="font-family:monospace">' + s.txCount.toLocaleString() + '</td>' +
                '<td><div style="display:flex;align-items:center;gap:6px"><div class="sol-progress" style="width:50px;height:4px"><div class="sol-progress-fill" style="width:' + s.successRate + '%"></div></div><span style="font-size:11px">' + s.successRate + '%</span></div></td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🛡️ Your MEV Protection</div>' +
            '<div class="sol-stats-row">' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px;color:' + (data.protection.flashbotsProtect ? '#00ff88' : '#ff4466') + '">' + (data.protection.flashbotsProtect ? 'ON' : 'OFF') + '</div><div class="sol-stat-label">Flashbots Protect</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px;color:' + (data.protection.cowswap ? '#00ff88' : '#ff4466') + '">' + (data.protection.cowswap ? 'ON' : 'OFF') + '</div><div class="sol-stat-label">CoW Swap</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value green" style="font-size:14px">' + data.protection.savedFromMEV + '</div><div class="sol-stat-label">Saved from MEV</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px">' + data.protection.totalTxProtected + '</div><div class="sol-stat-label">Txs Protected</div></div></div></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('mev-dashboard', MEVDashboard, 'institutional', {
    icon: '🤖', name: 'MEV Dashboard', description: 'Monitor MEV extraction - sandwiches, arbitrage, liquidations, and protection status'
});
