/* ============================================
   MARKET HEATMAP - Crypto market treemap
   Style finviz / coingecko heatmap
   ============================================ */

const MarketHeatmap = {
    category: 'all',

    init() {},

    getMarketData() {
        return [
            { symbol: 'BTC', name: 'Bitcoin', mcap: 1920, change: 2.4, cat: 'L1', price: 97500 },
            { symbol: 'ETH', name: 'Ethereum', mcap: 410, change: -1.2, cat: 'L1', price: 3400 },
            { symbol: 'BNB', name: 'BNB', mcap: 95, change: 0.8, cat: 'L1', price: 620 },
            { symbol: 'SOL', name: 'Solana', mcap: 88, change: 5.2, cat: 'L1', price: 190 },
            { symbol: 'XRP', name: 'Ripple', mcap: 75, change: -0.5, cat: 'L1', price: 1.35 },
            { symbol: 'ADA', name: 'Cardano', mcap: 35, change: 3.1, cat: 'L1', price: 0.98 },
            { symbol: 'AVAX', name: 'Avalanche', mcap: 14, change: -2.8, cat: 'L1', price: 35 },
            { symbol: 'DOT', name: 'Polkadot', mcap: 11, change: 1.5, cat: 'L1', price: 7.5 },
            { symbol: 'DOGE', name: 'Dogecoin', mcap: 45, change: 8.5, cat: 'Meme', price: 0.32 },
            { symbol: 'SHIB', name: 'Shiba Inu', mcap: 15, change: 4.2, cat: 'Meme', price: 0.000025 },
            { symbol: 'PEPE', name: 'Pepe', mcap: 7.5, change: 12.3, cat: 'Meme', price: 0.000018 },
            { symbol: 'WIF', name: 'dogwifhat', mcap: 3.2, change: -5.4, cat: 'Meme', price: 3.2 },
            { symbol: 'BONK', name: 'Bonk', mcap: 2.1, change: -3.2, cat: 'Meme', price: 0.00003 },
            { symbol: 'LINK', name: 'Chainlink', mcap: 14, change: 1.8, cat: 'Infra', price: 22 },
            { symbol: 'UNI', name: 'Uniswap', mcap: 8, change: -1.5, cat: 'DeFi', price: 13 },
            { symbol: 'AAVE', name: 'Aave', mcap: 5.5, change: 3.8, cat: 'DeFi', price: 370 },
            { symbol: 'MKR', name: 'Maker', mcap: 3.2, change: 0.4, cat: 'DeFi', price: 3400 },
            { symbol: 'CRV', name: 'Curve', mcap: 1.5, change: -4.1, cat: 'DeFi', price: 1.2 },
            { symbol: 'LDO', name: 'Lido', mcap: 2.8, change: 2.1, cat: 'DeFi', price: 3.1 },
            { symbol: 'ARB', name: 'Arbitrum', mcap: 3.8, change: -0.8, cat: 'L2', price: 1.8 },
            { symbol: 'OP', name: 'Optimism', mcap: 3.2, change: 1.2, cat: 'L2', price: 3.5 },
            { symbol: 'MATIC', name: 'Polygon', mcap: 5.5, change: -2.1, cat: 'L2', price: 0.55 },
            { symbol: 'STRK', name: 'Starknet', mcap: 1.8, change: -6.2, cat: 'L2', price: 0.8 },
            { symbol: 'USDT', name: 'Tether', mcap: 120, change: 0.01, cat: 'Stable', price: 1 },
            { symbol: 'USDC', name: 'USD Coin', mcap: 45, change: 0.0, cat: 'Stable', price: 1 },
            { symbol: 'RENDER', name: 'Render', mcap: 4.8, change: 6.5, cat: 'AI', price: 12 },
            { symbol: 'FET', name: 'Fetch.ai', mcap: 3.5, change: 4.8, cat: 'AI', price: 2.8 },
            { symbol: 'TAO', name: 'Bittensor', mcap: 4.2, change: -1.8, cat: 'AI', price: 620 },
            { symbol: 'NEAR', name: 'Near', mcap: 6.5, change: 2.2, cat: 'AI', price: 5.8 }
        ];
    },

    renderTreemap(data, w, h) {
        if (data.length === 0) return '<svg width="' + w + '" height="' + h + '"><text x="' + w/2 + '" y="' + h/2 + '" text-anchor="middle" fill="#555">No data</text></svg>';

        // Sort by mcap descending
        data.sort(function(a, b) { return b.mcap - a.mcap; });
        var totalMcap = 0;
        data.forEach(function(d) { totalMcap += d.mcap; });
        if (totalMcap === 0) totalMcap = 1;

        // Squarified treemap layout
        var rects = this.squarify(data, totalMcap, 0, 0, w, h);

        var svg = '<svg width="' + w + '" height="' + h + '">';
        rects.forEach(function(r) {
            var change = r.data.change;
            var intensity = Math.min(1, Math.abs(change) / 10);
            var color;
            if (change >= 0) {
                var g = Math.floor(40 + intensity * 180);
                color = 'rgb(' + Math.floor(g * 0.1) + ',' + g + ',' + Math.floor(g * 0.3) + ')';
            } else {
                var red = Math.floor(40 + intensity * 180);
                color = 'rgb(' + red + ',' + Math.floor(red * 0.15) + ',' + Math.floor(red * 0.2) + ')';
            }

            svg += '<rect x="' + r.x.toFixed(1) + '" y="' + r.y.toFixed(1) + '" width="' + Math.max(0, r.w - 1).toFixed(1) + '" height="' + Math.max(0, r.h - 1).toFixed(1) + '" fill="' + color + '" stroke="#0a0a0a" stroke-width="1" rx="2">' +
                '<title>' + r.data.name + ' (' + r.data.symbol + ')\nMarket Cap: $' + r.data.mcap + 'B\n24h: ' + (change >= 0 ? '+' : '') + change + '%</title></rect>';

            // Labels - only if cell large enough
            var cx = r.x + r.w / 2;
            var cy = r.y + r.h / 2;
            if (r.w > 45 && r.h > 30) {
                svg += '<text x="' + cx.toFixed(1) + '" y="' + (cy - 5).toFixed(1) + '" text-anchor="middle" fill="#fff" font-size="' + (r.w > 80 ? '12' : '10') + '" font-weight="700">' + r.data.symbol + '</text>';
                svg += '<text x="' + cx.toFixed(1) + '" y="' + (cy + 9).toFixed(1) + '" text-anchor="middle" fill="' + (change >= 0 ? '#aaffaa' : '#ffaaaa') + '" font-size="' + (r.w > 80 ? '11' : '9') + '" font-weight="600">' + (change >= 0 ? '+' : '') + change.toFixed(1) + '%</text>';
            } else if (r.w > 25 && r.h > 18) {
                svg += '<text x="' + cx.toFixed(1) + '" y="' + (cy + 3).toFixed(1) + '" text-anchor="middle" fill="#fff" font-size="8" font-weight="600">' + r.data.symbol + '</text>';
            }
        });
        svg += '</svg>';
        return svg;
    },

    squarify(data, totalMcap, x, y, w, h) {
        var rects = [];
        if (data.length === 0 || w <= 0 || h <= 0) return rects;
        if (data.length === 1) {
            rects.push({ x: x, y: y, w: w, h: h, data: data[0] });
            return rects;
        }

        // Simple slice-and-dice
        var vertical = w >= h;
        var remaining = totalMcap;
        var pos = 0;

        for (var i = 0; i < data.length; i++) {
            var ratio = data[i].mcap / totalMcap;
            if (vertical) {
                var rw = ratio * w;
                rects.push({ x: x + pos, y: y, w: rw, h: h, data: data[i] });
                pos += rw;
            } else {
                var rh = ratio * h;
                rects.push({ x: x, y: y + pos, w: w, h: rh, data: data[i] });
                pos += rh;
            }
        }
        return rects;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var allData = this.getMarketData();
        var categories = ['all', 'L1', 'L2', 'DeFi', 'Meme', 'AI', 'Infra', 'Stable'];

        var filtered = this.category === 'all' ? allData.filter(function(d) { return d.cat !== 'Stable'; }) : allData.filter(function(d) { return d.cat === self.category; });

        // Market stats
        var totalMcap = 0, gainers = 0, losers = 0, avgChange = 0;
        allData.forEach(function(d) { totalMcap += d.mcap; avgChange += d.change; if (d.change > 0) gainers++; else if (d.change < 0) losers++; });
        avgChange = allData.length > 0 ? avgChange / allData.length : 0;

        var topGainer = allData.slice().sort(function(a, b) { return b.change - a.change; })[0];
        var topLoser = allData.slice().sort(function(a, b) { return a.change - b.change; })[0];

        // Category filters
        var html = '<div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap">';
        categories.forEach(function(cat) {
            var active = cat === self.category;
            html += '<button class="sol-btn sol-btn-sm hm-cat" data-cat="' + cat + '" style="' + (active ? 'background:#c9a227;color:#000' : '') + '">' + (cat === 'all' ? 'All' : cat) + '</button>';
        });
        html += '</div>';

        html += '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$' + (totalMcap / 1000).toFixed(1) + 'T</div><div class="sol-stat-label">Market Cap Total</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (avgChange >= 0 ? 'green' : 'red') + '">' + (avgChange >= 0 ? '+' : '') + avgChange.toFixed(2) + '%</div><div class="sol-stat-label">Avg Change</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + gainers + '</div><div class="sol-stat-label">Gainers</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + losers + '</div><div class="sol-stat-label">Losers</div></div></div>';

        // Treemap
        html += '<div class="sol-section"><div class="sol-section-title">🗺️ Market Heatmap (' + (this.category === 'all' ? 'All' : this.category) + ')</div>' +
            '<div style="overflow-x:auto;padding:4px 0">' + this.renderTreemap(filtered, 600, 340) + '</div></div>';

        // Top movers
        html += '<div style="display:flex;gap:12px;flex-wrap:wrap">';
        html += '<div class="sol-section" style="flex:1;min-width:250px"><div class="sol-section-title">🚀 Top Gainers 24h</div>';
        allData.slice().sort(function(a, b) { return b.change - a.change; }).slice(0, 5).forEach(function(d) {
            html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #111">' +
                '<span><strong>' + d.symbol + '</strong> <span style="color:#555;font-size:11px">' + d.name + '</span></span>' +
                '<span style="color:#00ff88;font-family:monospace;font-weight:700">+' + d.change.toFixed(1) + '%</span></div>';
        });
        html += '</div>';

        html += '<div class="sol-section" style="flex:1;min-width:250px"><div class="sol-section-title">📉 Top Losers 24h</div>';
        allData.slice().sort(function(a, b) { return a.change - b.change; }).slice(0, 5).forEach(function(d) {
            html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #111">' +
                '<span><strong>' + d.symbol + '</strong> <span style="color:#555;font-size:11px">' + d.name + '</span></span>' +
                '<span style="color:#ff4466;font-family:monospace;font-weight:700">' + d.change.toFixed(1) + '%</span></div>';
        });
        html += '</div></div>';

        // Sector performance
        html += '<div class="sol-section"><div class="sol-section-title">📊 Sector Performance</div>' +
            '<table class="sol-table"><thead><tr><th>Sector</th><th>Market Cap</th><th>Tokens</th><th>24h Perf</th></tr></thead><tbody>';
        var sectorData = {};
        allData.forEach(function(d) {
            if (!sectorData[d.cat]) sectorData[d.cat] = { mcap: 0, count: 0, changeSum: 0 };
            sectorData[d.cat].mcap += d.mcap;
            sectorData[d.cat].count++;
            sectorData[d.cat].changeSum += d.change;
        });
        Object.keys(sectorData).sort(function(a, b) { return sectorData[b].mcap - sectorData[a].mcap; }).forEach(function(k) {
            var s = sectorData[k];
            var avgCh = s.count > 0 ? s.changeSum / s.count : 0;
            html += '<tr><td><strong>' + k + '</strong></td>' +
                '<td style="font-family:monospace;color:#888">$' + s.mcap.toFixed(0) + 'B</td>' +
                '<td style="font-family:monospace">' + s.count + '</td>' +
                '<td style="font-family:monospace;color:' + (avgCh >= 0 ? '#00ff88' : '#ff4466') + ';font-weight:600">' + (avgCh >= 0 ? '+' : '') + avgCh.toFixed(2) + '%</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
        c.querySelectorAll('.hm-cat').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.category = btn.dataset.cat;
                self.render(containerId);
            });
        });
    }
};

SolutionsHub.registerSolution('market-heatmap', MarketHeatmap, 'shared', {
    icon: '🗺️', name: 'Market Heatmap', description: 'Interactive crypto market treemap by market cap and 24h performance'
});
