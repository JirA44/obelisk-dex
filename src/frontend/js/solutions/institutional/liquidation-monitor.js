/* ============================================
   LIQUIDATION MONITOR - Track upcoming liquidations
   ============================================ */

const LiquidationMonitor = {
    init() {},

    getLiquidations() {
        var spot = { BTC: 97500, ETH: 3400, SOL: 190 };
        return [
            { protocol: 'Aave V3', asset: 'ETH', collateral: '$2.4M', debt: '$1.8M', healthFactor: 1.05, liqPrice: '$3,230', distFromLiq: 5.0, chain: 'Ethereum' },
            { protocol: 'Aave V3', asset: 'WBTC', collateral: '$5.1M', debt: '$3.9M', healthFactor: 1.08, liqPrice: '$93,200', distFromLiq: 4.4, chain: 'Ethereum' },
            { protocol: 'Compound', asset: 'ETH', collateral: '$800K', debt: '$650K', healthFactor: 1.02, liqPrice: '$3,340', distFromLiq: 1.8, chain: 'Ethereum' },
            { protocol: 'Morpho', asset: 'stETH', collateral: '$1.2M', debt: '$950K', healthFactor: 1.12, liqPrice: '$3,100', distFromLiq: 8.8, chain: 'Ethereum' },
            { protocol: 'Aave V3', asset: 'SOL', collateral: '$450K', debt: '$380K', healthFactor: 1.03, liqPrice: '$182', distFromLiq: 4.2, chain: 'Arbitrum' },
            { protocol: 'Radiant', asset: 'ETH', collateral: '$320K', debt: '$280K', healthFactor: 1.01, liqPrice: '$3,370', distFromLiq: 0.9, chain: 'Arbitrum' }
        ];
    },

    getRecentLiquidations() {
        return [
            { time: '15m ago', protocol: 'Aave V3', asset: 'ETH', amount: '$125K', liquidator: '0x8aE...f21', profit: '$6,250', chain: 'Ethereum' },
            { time: '42m ago', protocol: 'Compound', asset: 'WBTC', amount: '$340K', liquidator: '0x5bC...d89', profit: '$17,000', chain: 'Ethereum' },
            { time: '1h ago', protocol: 'Aave V3', asset: 'SOL', amount: '$45K', liquidator: '0x3Df...a12', profit: '$2,250', chain: 'Arbitrum' },
            { time: '2h ago', protocol: 'Morpho', asset: 'stETH', amount: '$89K', liquidator: '0x8aE...f21', profit: '$4,450', chain: 'Ethereum' },
            { time: '3h ago', protocol: 'Radiant', asset: 'ETH', amount: '$210K', liquidator: '0x1Ac...e45', profit: '$10,500', chain: 'Arbitrum' }
        ];
    },

    getLiqLevels() {
        return {
            BTC: [
                { price: 95000, volume: '$120M', side: 'long' },
                { price: 93000, volume: '$280M', side: 'long' },
                { price: 90000, volume: '$450M', side: 'long' },
                { price: 100000, volume: '$85M', side: 'short' },
                { price: 102000, volume: '$190M', side: 'short' },
                { price: 105000, volume: '$340M', side: 'short' }
            ]
        };
    },

    renderLiqHeatmap(levels, spot, width, height) {
        var allPrices = levels.map(function(l) { return l.price; });
        allPrices.push(spot);
        var minP = Math.min.apply(null, allPrices) * 0.98;
        var maxP = Math.max.apply(null, allPrices) * 1.02;
        if (maxP <= minP) maxP = minP + 1;
        var maxVol = Math.max.apply(null, levels.map(function(l) { return parseFloat(l.volume.replace(/[$M]/g, '')); })) || 1;

        var svg = '<svg width="' + width + '" height="' + height + '">';
        // Price axis
        var spotY = height - ((spot - minP) / (maxP - minP)) * height;
        svg += '<line x1="0" y1="' + spotY + '" x2="' + width + '" y2="' + spotY + '" stroke="#00d4ff" stroke-width="1.5"/>';
        svg += '<text x="' + (width - 5) + '" y="' + (spotY - 4) + '" text-anchor="end" fill="#00d4ff" font-size="10">$' + spot.toLocaleString() + ' (spot)</text>';

        levels.forEach(function(l) {
            var y = height - ((l.price - minP) / (maxP - minP)) * height;
            var vol = parseFloat(l.volume.replace(/[$M]/g, ''));
            var barW = (vol / maxVol) * (width * 0.6);
            var color = l.side === 'long' ? '#ff4466' : '#00ff88';
            svg += '<rect x="40" y="' + (y - 8) + '" width="' + barW + '" height="16" fill="' + color + '" opacity="0.3" rx="3"/>';
            svg += '<text x="35" y="' + (y + 4) + '" text-anchor="end" fill="' + color + '" font-size="10" font-family="monospace">$' + (l.price / 1000).toFixed(0) + 'K</text>';
            svg += '<text x="' + (45 + barW) + '" y="' + (y + 4) + '" fill="' + color + '" font-size="10">' + l.volume + '</text>';
        });
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var atRisk = this.getLiquidations();
        var recent = this.getRecentLiquidations();
        var levels = this.getLiqLevels();
        var critical = atRisk.filter(function(a) { return a.distFromLiq < 3; });
        var totalAtRisk = 0;
        atRisk.forEach(function(a) { totalAtRisk += parseFloat(a.collateral.replace(/[$MK,]/g, '')) * (a.collateral.includes('M') ? 1000000 : 1000); });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + critical.length + '</div><div class="sol-stat-label">Critical (&lt;3%)</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + atRisk.length + '</div><div class="sol-stat-label">At Risk</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$' + (totalAtRisk / 1000000).toFixed(1) + 'M</div><div class="sol-stat-label">Collateral at Risk</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + recent.length + '</div><div class="sol-stat-label">Recent Liqs</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🔥 BTC Liquidation Heatmap</div>' +
            '<div style="padding:10px 0">' + this.renderLiqHeatmap(levels.BTC, 97500, 550, 200) + '</div>' +
            '<div style="display:flex;gap:16px;justify-content:center;font-size:11px">' +
            '<span><span style="color:#ff4466">■</span> Long Liquidations (below spot)</span>' +
            '<span><span style="color:#00ff88">■</span> Short Liquidations (above spot)</span></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">⚠️ Positions at Risk</div>' +
            '<table class="sol-table"><thead><tr><th>Protocol</th><th>Asset</th><th>Collateral</th><th>Health</th><th>Liq Price</th><th>Distance</th></tr></thead><tbody>';
        atRisk.sort(function(a, b) { return a.distFromLiq - b.distFromLiq; });
        atRisk.forEach(function(a) {
            var hColor = a.healthFactor < 1.05 ? '#ff4466' : a.healthFactor < 1.1 ? '#c9a227' : '#00ff88';
            var dColor = a.distFromLiq < 2 ? '#ff4466' : a.distFromLiq < 5 ? '#c9a227' : '#888';
            html += '<tr><td><strong>' + a.protocol + '</strong><div style="font-size:10px;color:#555">' + a.chain + '</div></td>' +
                '<td>' + a.asset + '</td>' +
                '<td style="font-family:monospace">' + a.collateral + '</td>' +
                '<td style="font-family:monospace;color:' + hColor + '">' + a.healthFactor.toFixed(2) + '</td>' +
                '<td style="font-family:monospace">' + a.liqPrice + '</td>' +
                '<td style="font-family:monospace;color:' + dColor + '">' + a.distFromLiq.toFixed(1) + '%</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">💀 Recent Liquidations</div>' +
            '<table class="sol-table"><thead><tr><th>Time</th><th>Protocol</th><th>Asset</th><th>Amount</th><th>Liquidator</th><th>Profit</th></tr></thead><tbody>';
        recent.forEach(function(r) {
            html += '<tr><td style="color:#555">' + r.time + '</td><td>' + r.protocol + '</td><td><strong>' + r.asset + '</strong></td>' +
                '<td style="font-family:monospace;color:#ff4466">' + r.amount + '</td>' +
                '<td style="font-family:monospace;color:#888;font-size:11px">' + r.liquidator + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">' + r.profit + '</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('liquidation-monitor', LiquidationMonitor, 'institutional', {
    icon: '💀', name: 'Liquidation Monitor', description: 'Track positions at risk, liquidation heatmaps, and recent liquidation events'
});
