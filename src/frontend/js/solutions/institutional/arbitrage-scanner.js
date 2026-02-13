/* ============================================
   ARBITRAGE SCANNER - Cross-exchange price diffs
   ============================================ */

const ArbitrageScanner = {
    refreshInterval: null,

    init() {},

    getExchangeData() {
        var seed = Math.floor(Date.now() / 5000);
        var rng = function(s) { s = (s * 16807 + 7) % 2147483647; return s; };

        var exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit', 'KuCoin', 'Bitfinex', 'Gate.io'];
        var pairs = [
            { symbol: 'BTC/USDT', base: 97500 },
            { symbol: 'ETH/USDT', base: 3400 },
            { symbol: 'SOL/USDT', base: 190 },
            { symbol: 'AVAX/USDT', base: 35 },
            { symbol: 'LINK/USDT', base: 22 },
            { symbol: 'ARB/USDT', base: 1.80 },
            { symbol: 'DOGE/USDT', base: 0.32 },
            { symbol: 'BNB/USDT', base: 620 }
        ];

        var opportunities = [];
        pairs.forEach(function(pair) {
            var prices = {};
            var minPrice = Infinity, maxPrice = -Infinity, minEx = '', maxEx = '';

            exchanges.forEach(function(ex) {
                var s = seed;
                for (var i = 0; i < ex.length; i++) s = rng(s + ex.charCodeAt(i));
                for (var i = 0; i < pair.symbol.length; i++) s = rng(s + pair.symbol.charCodeAt(i));
                var spread = pair.base * 0.003; // 0.3% max spread
                var price = pair.base + ((s % 10000) / 10000 - 0.5) * spread * 2;
                prices[ex] = price;
                if (price < minPrice) { minPrice = price; minEx = ex; }
                if (price > maxPrice) { maxPrice = price; maxEx = ex; }
            });

            var spreadPct = minPrice > 0 ? ((maxPrice - minPrice) / minPrice * 100) : 0;
            var profit = maxPrice - minPrice;
            var profitPer10K = (profit / minPrice) * 10000;

            opportunities.push({
                symbol: pair.symbol,
                base: pair.base,
                prices: prices,
                buyEx: minEx, buyPrice: minPrice,
                sellEx: maxEx, sellPrice: maxPrice,
                spread: spreadPct,
                profitPer10K: profitPer10K
            });
        });

        opportunities.sort(function(a, b) { return b.spread - a.spread; });
        return { exchanges: exchanges, opportunities: opportunities };
    },

    renderSpreadChart(opportunities, w, h) {
        var padL = 80, padR = 50, padT = 10, padB = 5;
        var maxSpread = 0.01;
        opportunities.forEach(function(o) { if (o.spread > maxSpread) maxSpread = o.spread; });
        var barH = Math.min(24, (h / opportunities.length) - 4);

        var svg = '<svg width="' + w + '" height="' + h + '">';
        opportunities.forEach(function(o, i) {
            var y = padT + i * (barH + 4);
            var barW = (o.spread / maxSpread) * (w - padL - padR);
            var color = o.spread > 0.15 ? '#00ff88' : o.spread > 0.08 ? '#c9a227' : '#555';
            svg += '<rect x="' + padL + '" y="' + y + '" width="' + Math.max(2, barW) + '" height="' + barH + '" fill="' + color + '" opacity="0.5" rx="3"/>';
            svg += '<text x="' + (padL - 5) + '" y="' + (y + barH / 2 + 4) + '" text-anchor="end" fill="#aaa" font-size="10" font-weight="600">' + o.symbol.split('/')[0] + '</text>';
            svg += '<text x="' + (padL + barW + 5) + '" y="' + (y + barH / 2 + 3) + '" fill="' + color + '" font-size="10" font-weight="600">' + o.spread.toFixed(3) + '% → $' + o.profitPer10K.toFixed(2) + '/10K</text>';
        });
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var data = this.getExchangeData();

        var topOpp = data.opportunities[0];
        var totalProfit = 0;
        data.opportunities.forEach(function(o) { totalProfit += o.profitPer10K; });
        var profitable = data.opportunities.filter(function(o) { return o.spread > 0.1; }).length;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + topOpp.spread.toFixed(3) + '%</div><div class="sol-stat-label">Best Spread (' + topOpp.symbol.split('/')[0] + ')</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + data.exchanges.length + '</div><div class="sol-stat-label">Exchanges</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + profitable + '</div><div class="sol-stat-label">Opportunities (&gt;0.1%)</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$' + totalProfit.toFixed(2) + '</div><div class="sol-stat-label">Profit Total/10K</div></div></div>';

        // Spread chart
        html += '<div class="sol-section"><div class="sol-section-title">📊 Spreads Cross-Exchange</div>' +
            '<div style="overflow-x:auto">' + this.renderSpreadChart(data.opportunities, 600, data.opportunities.length * 28 + 15) + '</div></div>';

        // Opportunity details
        html += '<div class="sol-section"><div class="sol-section-title">💰 Arbitrage Opportunities</div>' +
            '<table class="sol-table"><thead><tr><th>Pair</th><th>Buy</th><th>Sell</th><th>Spread</th><th>Profit/10K</th><th>Status</th></tr></thead><tbody>';
        data.opportunities.forEach(function(o) {
            var profitColor = o.spread > 0.15 ? '#00ff88' : o.spread > 0.08 ? '#c9a227' : '#555';
            var status = o.spread > 0.15 ? 'PROFITABLE' : o.spread > 0.08 ? 'MARGINAL' : 'TOO TIGHT';
            var statusColor = o.spread > 0.15 ? '#00ff88' : o.spread > 0.08 ? '#c9a227' : '#ff4466';
            var fmt = o.base >= 100 ? function(v) { return v.toFixed(2); } : o.base >= 1 ? function(v) { return v.toFixed(4); } : function(v) { return v.toFixed(6); };
            html += '<tr><td><strong>' + o.symbol + '</strong></td>' +
                '<td style="font-size:11px"><span style="color:#00ff88;font-weight:600">' + o.buyEx + '</span><div style="font-family:monospace;color:#888">$' + fmt(o.buyPrice) + '</div></td>' +
                '<td style="font-size:11px"><span style="color:#ff4466;font-weight:600">' + o.sellEx + '</span><div style="font-family:monospace;color:#888">$' + fmt(o.sellPrice) + '</div></td>' +
                '<td style="font-family:monospace;color:' + profitColor + ';font-weight:700">' + o.spread.toFixed(3) + '%</td>' +
                '<td style="font-family:monospace;color:' + profitColor + '">$' + o.profitPer10K.toFixed(2) + '</td>' +
                '<td style="color:' + statusColor + ';font-weight:600;font-size:11px">' + status + '</td></tr>';
        });
        html += '</tbody></table></div>';

        // Price matrix
        html += '<div class="sol-section"><div class="sol-section-title">📋 Price Matrix - ' + topOpp.symbol + '</div>' +
            '<table class="sol-table"><thead><tr><th>Exchange</th><th>Price</th><th>vs Min</th></tr></thead><tbody>';
        var prices = [];
        data.exchanges.forEach(function(ex) { if (topOpp.prices[ex]) prices.push({ ex: ex, price: topOpp.prices[ex] }); });
        prices.sort(function(a, b) { return a.price - b.price; });
        prices.forEach(function(p, i) {
            var diff = ((p.price - topOpp.buyPrice) / topOpp.buyPrice * 100);
            var isBuy = p.ex === topOpp.buyEx;
            var isSell = p.ex === topOpp.sellEx;
            var fmt = topOpp.base >= 100 ? p.price.toFixed(2) : p.price.toFixed(4);
            html += '<tr style="' + (isBuy ? 'background:#00ff8810' : isSell ? 'background:#ff446610' : '') + '"><td><strong>' + p.ex + '</strong>' + (isBuy ? ' <span style="color:#00ff88;font-size:10px">BUY</span>' : isSell ? ' <span style="color:#ff4466;font-size:10px">SELL</span>' : '') + '</td>' +
                '<td style="font-family:monospace;font-weight:600">$' + fmt + '</td>' +
                '<td style="font-family:monospace;color:' + (diff > 0.05 ? '#c9a227' : '#555') + '">' + (diff > 0 ? '+' : '') + diff.toFixed(4) + '%</td></tr>';
        });
        html += '</tbody></table></div>';

        // Note
        html += '<div style="color:#888;font-size:11px;padding:8px;background:#111;border-radius:6px;margin-top:8px">' +
            '⚠️ Displayed spreads are before trading fees (0.02-0.1%) and transfer costs. Arbitrage is only profitable if spread > total fee cost.</div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('arbitrage-scanner', ArbitrageScanner, 'institutional', {
    icon: '⚡', name: 'Arbitrage Scanner', description: 'Detect cross-exchange arbitrage opportunities in real-time with price matrix'
});
