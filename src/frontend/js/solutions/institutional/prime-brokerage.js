/* ============================================
   PRIME BROKERAGE - Institutional prime services
   ============================================ */

const PrimeBrokerage = {
    init() {},

    getAccountData() {
        return {
            creditLine: 5000000, utilized: 1850000, available: 3150000,
            marginReq: 12.5, maintenanceMargin: 8.0, currentMargin: 22.4,
            borrowRate: 3.2, collateral: 4200000,
            positions: [
                { asset: 'BTC', side: 'Long', size: '50 BTC', notional: '$4.87M', margin: '$487K', pnl: '+$125K', leverage: '10x' },
                { asset: 'ETH', side: 'Short', size: '2,000 ETH', notional: '$6.8M', margin: '$680K', pnl: '-$45K', leverage: '10x' },
                { asset: 'SOL', side: 'Long', size: '25,000 SOL', notional: '$4.75M', margin: '$475K', pnl: '+$210K', leverage: '10x' }
            ],
            services: [
                { name: 'Cross-Margining', status: 'active', description: 'Portfolio margin across all positions' },
                { name: 'Securities Lending', status: 'active', description: 'Borrow assets for short selling' },
                { name: 'Custody', status: 'active', description: 'Institutional-grade cold storage' },
                { name: 'Capital Introduction', status: 'available', description: 'Connect with qualified investors' },
                { name: 'Research & Analytics', status: 'active', description: 'Proprietary market research' },
                { name: 'FX Services', status: 'available', description: 'Crypto-fiat conversion at prime rates' }
            ]
        };
    },

    renderMarginGauge(current, maintenance, initial, width) {
        var svg = '<svg width="' + width + '" height="50">';
        var barY = 15, barH = 12;
        var scale = Math.max(current, maintenance, initial, 1) * 1.3;
        svg += '<rect x="0" y="' + barY + '" width="' + width + '" height="' + barH + '" fill="#111" rx="6"/>';
        var pct = Math.min(current / scale * 100, 100);
        var color = current > initial * 2 ? '#00ff88' : current > initial ? '#c9a227' : current > maintenance ? '#ff8844' : '#ff4466';
        svg += '<rect x="0" y="' + barY + '" width="' + (pct / 100 * width) + '" height="' + barH + '" fill="' + color + '" rx="6" opacity="0.8"/>';
        var maintX = maintenance / scale * width;
        var initX = initial / scale * width;
        svg += '<line x1="' + maintX + '" y1="' + (barY - 3) + '" x2="' + maintX + '" y2="' + (barY + barH + 3) + '" stroke="#ff4466" stroke-width="2" stroke-dasharray="3,2"/>';
        svg += '<line x1="' + initX + '" y1="' + (barY - 3) + '" x2="' + initX + '" y2="' + (barY + barH + 3) + '" stroke="#c9a227" stroke-width="2" stroke-dasharray="3,2"/>';
        svg += '<text x="' + maintX + '" y="43" text-anchor="middle" fill="#ff4466" font-size="9">Maint ' + maintenance + '%</text>';
        svg += '<text x="' + initX + '" y="43" text-anchor="middle" fill="#c9a227" font-size="9">Initial ' + initial + '%</text>';
        svg += '<text x="' + Math.min(pct / 100 * width, width - 20) + '" y="10" text-anchor="middle" fill="' + color + '" font-size="11" font-weight="700">' + current + '%</text>';
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var data = this.getAccountData();
        var utilPct = (data.utilized / data.creditLine * 100);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + (data.creditLine / 1000000).toFixed(0) + 'M</div><div class="sol-stat-label">Credit Line</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">$' + (data.available / 1000000).toFixed(1) + 'M</div><div class="sol-stat-label">Available</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + utilPct.toFixed(0) + '%</div><div class="sol-stat-label">Utilization</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + data.borrowRate + '%</div><div class="sol-stat-label">Borrow Rate</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Margin Status</div>' +
            '<div style="padding:10px 0">' + this.renderMarginGauge(data.currentMargin, data.maintenanceMargin, data.marginReq, 560) + '</div>' +
            '<div class="sol-stats-row">' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value green" style="font-size:16px">' + data.currentMargin + '%</div><div class="sol-stat-label">Current Margin</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:16px">$' + (data.collateral / 1000000).toFixed(1) + 'M</div><div class="sol-stat-label">Collateral</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:16px">$' + (data.utilized / 1000000).toFixed(1) + 'M</div><div class="sol-stat-label">Utilized</div></div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📋 Prime Positions</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Side</th><th>Size</th><th>Notional</th><th>Margin</th><th>PnL</th><th>Leverage</th></tr></thead><tbody>';
        data.positions.forEach(function(p) {
            var sideTag = p.side === 'Long' ? 'sol-tag-green' : 'sol-tag-red';
            var pnlColor = p.pnl.startsWith('+') ? '#00ff88' : '#ff4466';
            html += '<tr><td><strong>' + p.asset + '</strong></td>' +
                '<td><span class="sol-tag ' + sideTag + '">' + p.side + '</span></td>' +
                '<td style="font-family:monospace">' + p.size + '</td>' +
                '<td style="font-family:monospace">' + p.notional + '</td>' +
                '<td style="font-family:monospace;color:#888">' + p.margin + '</td>' +
                '<td style="font-family:monospace;color:' + pnlColor + '">' + p.pnl + '</td>' +
                '<td style="color:#c9a227">' + p.leverage + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🏛️ Prime Services</div>';
        data.services.forEach(function(s) {
            var statusColor = s.status === 'active' ? '#00ff88' : '#00d4ff';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #111">' +
                '<div><strong style="color:#fff">' + s.name + '</strong>' +
                '<div style="font-size:11px;color:#555">' + s.description + '</div></div>' +
                '<span class="sol-tag" style="background:' + statusColor + '22;color:' + statusColor + '">' + s.status + '</span></div>';
        });
        html += '</div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('prime-brokerage', PrimeBrokerage, 'institutional', {
    icon: '🏛️', name: 'Prime Brokerage', description: 'Cross-margining, securities lending, custody, and capital introduction services'
});
