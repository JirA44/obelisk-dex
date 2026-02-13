/* ============================================
   FUNDING ARBITRAGE - Capture funding rate spreads
   ============================================ */

const FundingArbitrage = {
    positions: [],

    init() {
        try { this.positions = JSON.parse(localStorage.getItem('obelisk_funding_arb') || '[]'); } catch(e) { this.positions = []; }
        if (this.positions.length === 0) {
            this.positions = [
                { id: 'fa1', asset: 'BTC', longVenue: 'Spot (Obelisk)', shortVenue: 'dYdX Perps', size: '$500K', funding: '+0.042%/8h', annualized: '57.3%', pnl: '$8,450', days: 12, status: 'active' },
                { id: 'fa2', asset: 'ETH', longVenue: 'Spot (Obelisk)', shortVenue: 'Hyperliquid', size: '$300K', funding: '+0.031%/8h', annualized: '42.2%', pnl: '$3,200', days: 8, status: 'active' },
                { id: 'fa3', asset: 'SOL', longVenue: 'Spot (Obelisk)', shortVenue: 'MUX Protocol', size: '$200K', funding: '-0.008%/8h', annualized: '-10.9%', pnl: '-$420', days: 3, status: 'monitoring' }
            ];
        }
    },

    save() { localStorage.setItem('obelisk_funding_arb', JSON.stringify(this.positions)); },

    getFundingRates() {
        return [
            { asset: 'BTC', venue: 'dYdX', rate: 0.042, predicted: 0.038, trend: 'up' },
            { asset: 'BTC', venue: 'Hyperliquid', rate: 0.035, predicted: 0.032, trend: 'down' },
            { asset: 'BTC', venue: 'MUX', rate: 0.028, predicted: 0.030, trend: 'up' },
            { asset: 'ETH', venue: 'dYdX', rate: 0.031, predicted: 0.029, trend: 'down' },
            { asset: 'ETH', venue: 'Hyperliquid', rate: 0.038, predicted: 0.041, trend: 'up' },
            { asset: 'ETH', venue: 'MUX', rate: 0.022, predicted: 0.025, trend: 'up' },
            { asset: 'SOL', venue: 'dYdX', rate: -0.008, predicted: -0.005, trend: 'up' },
            { asset: 'SOL', venue: 'Hyperliquid', rate: 0.015, predicted: 0.018, trend: 'up' },
            { asset: 'SOL', venue: 'MUX', rate: 0.012, predicted: 0.010, trend: 'down' },
            { asset: 'ARB', venue: 'dYdX', rate: 0.055, predicted: 0.048, trend: 'down' },
            { asset: 'LINK', venue: 'Hyperliquid', rate: 0.025, predicted: 0.028, trend: 'up' }
        ];
    },

    renderHeatmap(rates, width) {
        var assets = ['BTC', 'ETH', 'SOL', 'ARB', 'LINK'];
        var venues = ['dYdX', 'Hyperliquid', 'MUX'];
        var cellW = Math.floor((width - 80) / venues.length);
        var cellH = 30;
        var svg = '<svg width="' + width + '" height="' + (assets.length * cellH + 30) + '">';
        venues.forEach(function(v, vi) {
            svg += '<text x="' + (90 + vi * cellW + cellW / 2) + '" y="12" text-anchor="middle" fill="#888" font-size="10">' + v + '</text>';
        });
        assets.forEach(function(a, ai) {
            svg += '<text x="40" y="' + (30 + ai * cellH + cellH / 2 + 4) + '" text-anchor="middle" fill="#aaa" font-size="11" font-weight="600">' + a + '</text>';
            venues.forEach(function(v, vi) {
                var rate = rates.find(function(r) { return r.asset === a && r.venue === v; });
                var val = rate ? rate.rate : 0;
                var color, textColor;
                if (val > 0.03) { color = '#00ff88'; textColor = '#000'; }
                else if (val > 0.01) { color = '#00ff8866'; textColor = '#00ff88'; }
                else if (val > 0) { color = '#00ff8833'; textColor = '#00ff88'; }
                else if (val === 0) { color = '#222'; textColor = '#555'; }
                else { color = '#ff446633'; textColor = '#ff4466'; }
                var x = 80 + vi * cellW, y = 20 + ai * cellH;
                svg += '<rect x="' + x + '" y="' + y + '" width="' + (cellW - 2) + '" height="' + (cellH - 2) + '" fill="' + color + '" rx="4"/>';
                svg += '<text x="' + (x + cellW / 2) + '" y="' + (y + cellH / 2 + 4) + '" text-anchor="middle" fill="' + textColor + '" font-size="11" font-family="monospace">' + (val > 0 ? '+' : '') + val.toFixed(3) + '%</text>';
            });
        });
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var rates = this.getFundingRates();
        var self = this;
        var totalPnl = 0;
        this.positions.forEach(function(p) { totalPnl += parseFloat(p.pnl.replace(/[^-\d.]/g, '')); });
        var activeCount = this.positions.filter(function(p) { return p.status === 'active'; }).length;
        var bestRate = Math.max.apply(null, rates.map(function(r) { return r.rate; }));

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (totalPnl >= 0 ? 'green' : 'red') + '">$' + totalPnl.toLocaleString() + '</div><div class="sol-stat-label">Total PnL</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + activeCount + '</div><div class="sol-stat-label">Active Arbs</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">+' + bestRate.toFixed(3) + '%</div><div class="sol-stat-label">Best Rate (8h)</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + (bestRate * 3 * 365).toFixed(0) + '%</div><div class="sol-stat-label">Best Annualized</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🗺️ Funding Rate Heatmap (per 8h)</div>' +
            '<div style="padding:10px 0;overflow-x:auto">' + this.renderHeatmap(rates, 520) + '</div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">💹 Active Arbitrage Positions</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Long</th><th>Short</th><th>Size</th><th>Funding</th><th>Annual.</th><th>PnL</th><th>Status</th></tr></thead><tbody>';
        this.positions.forEach(function(p) {
            var pnlColor = p.pnl.startsWith('-') ? '#ff4466' : '#00ff88';
            var statusTag = p.status === 'active' ? 'sol-tag-green' : 'sol-tag-yellow';
            html += '<tr><td><strong>' + p.asset + '</strong></td>' +
                '<td style="font-size:12px;color:#888">' + p.longVenue + '</td>' +
                '<td style="font-size:12px;color:#888">' + p.shortVenue + '</td>' +
                '<td style="font-family:monospace">' + p.size + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">' + p.funding + '</td>' +
                '<td style="font-family:monospace;color:#c9a227">' + p.annualized + '</td>' +
                '<td style="font-family:monospace;color:' + pnlColor + '">' + p.pnl + '</td>' +
                '<td><span class="sol-tag ' + statusTag + '">' + p.status + '</span></td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📋 All Funding Rates</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Venue</th><th>Current (8h)</th><th>Predicted</th><th>Annualized</th><th>Trend</th><th></th></tr></thead><tbody>';
        rates.sort(function(a, b) { return b.rate - a.rate; });
        rates.forEach(function(r) {
            var rateColor = r.rate > 0 ? '#00ff88' : r.rate < 0 ? '#ff4466' : '#888';
            var annual = (r.rate * 3 * 365).toFixed(0);
            var trendIcon = r.trend === 'up' ? '↑' : '↓';
            var trendColor = r.trend === 'up' ? '#00ff88' : '#ff4466';
            html += '<tr><td><strong>' + r.asset + '</strong></td><td>' + r.venue + '</td>' +
                '<td style="font-family:monospace;color:' + rateColor + '">' + (r.rate >= 0 ? '+' : '') + r.rate.toFixed(3) + '%</td>' +
                '<td style="font-family:monospace;color:#888">' + (r.predicted >= 0 ? '+' : '') + r.predicted.toFixed(3) + '%</td>' +
                '<td style="font-family:monospace;color:#c9a227">' + annual + '%</td>' +
                '<td style="color:' + trendColor + '">' + trendIcon + '</td>' +
                '<td><button class="sol-btn sol-btn-sm sol-btn-outline">Arb</button></td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('funding-arb', FundingArbitrage, 'institutional', {
    icon: '💹', name: 'Funding Arbitrage', description: 'Capture funding rate spreads across venues with delta-neutral positions'
});
