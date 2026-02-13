/* ============================================
   DEBT DASHBOARD - DeFi loan tracker
   ============================================ */

const DebtDashboard = {
    positions: [],

    init() {
        try { this.positions = JSON.parse(localStorage.getItem('obelisk_debt') || '[]'); } catch(e) { this.positions = []; }
        if (this.positions.length === 0) {
            this.positions = [
                { id: 1, protocol: 'Aave V3', chain: 'Ethereum', collateral: { asset: 'ETH', amount: 5, price: 3400 }, debt: { asset: 'USDC', amount: 8500, rate: 4.2 }, ltv: 80, liqThreshold: 85 },
                { id: 2, protocol: 'Compound V3', chain: 'Ethereum', collateral: { asset: 'WBTC', amount: 0.3, price: 97500 }, debt: { asset: 'USDC', amount: 15000, rate: 3.8 }, ltv: 75, liqThreshold: 82 },
                { id: 3, protocol: 'Maker', chain: 'Ethereum', collateral: { asset: 'ETH', amount: 10, price: 3400 }, debt: { asset: 'DAI', amount: 18000, rate: 5.0 }, ltv: 67, liqThreshold: 75 },
                { id: 4, protocol: 'Morpho', chain: 'Ethereum', collateral: { asset: 'stETH', amount: 8, price: 3400 }, debt: { asset: 'USDC', amount: 12000, rate: 3.5 }, ltv: 80, liqThreshold: 86 }
            ];
            this.save();
        }
    },

    save() { localStorage.setItem('obelisk_debt', JSON.stringify(this.positions)); },

    calcHealthFactor(pos) {
        var collateralValue = pos.collateral.amount * pos.collateral.price;
        var debtValue = pos.debt.amount;
        if (debtValue === 0) return 999;
        return (collateralValue * (pos.liqThreshold / 100)) / debtValue;
    },

    calcLiquidationPrice(pos) {
        if (pos.collateral.amount === 0) return 0;
        return (pos.debt.amount / (pos.collateral.amount * (pos.liqThreshold / 100)));
    },

    calcCurrentLtv(pos) {
        var collateralValue = pos.collateral.amount * pos.collateral.price;
        if (collateralValue === 0) return 0;
        return (pos.debt.amount / collateralValue) * 100;
    },

    renderHealthGauge(hf, size) {
        var cx = size / 2, cy = size * 0.55, r = size * 0.38;
        var svg = '<svg width="' + size + '" height="' + (size * 0.65) + '">';

        // Background arc
        var x1 = cx + r * Math.cos(Math.PI), y1 = cy + r * Math.sin(Math.PI);
        var x2 = cx + r * Math.cos(0), y2 = cy + r * Math.sin(0);
        svg += '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + r + ',' + r + ' 0 1,1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + '" fill="none" stroke="#1a1a1a" stroke-width="10" stroke-linecap="round"/>';

        // Color zones
        var zones = [
            { from: 0, to: 0.33, color: '#ff4466' },
            { from: 0.33, to: 0.5, color: '#ff8844' },
            { from: 0.5, to: 0.7, color: '#c9a227' },
            { from: 0.7, to: 1, color: '#00ff88' }
        ];
        zones.forEach(function(z) {
            var a1 = Math.PI - z.from * Math.PI;
            var a2 = Math.PI - z.to * Math.PI;
            var zx1 = cx + r * Math.cos(a1), zy1 = cy + r * Math.sin(a1);
            var zx2 = cx + r * Math.cos(a2), zy2 = cy + r * Math.sin(a2);
            svg += '<path d="M' + zx1.toFixed(1) + ',' + zy1.toFixed(1) + ' A' + r + ',' + r + ' 0 0,1 ' + zx2.toFixed(1) + ',' + zy2.toFixed(1) + '" fill="none" stroke="' + z.color + '" stroke-width="10" stroke-linecap="butt" opacity="0.2"/>';
        });

        // Needle
        var normalized = Math.min(1, Math.max(0, (hf - 1) / 3));
        var angle = Math.PI - normalized * Math.PI;
        var nx = cx + (r - 12) * Math.cos(angle), ny = cy + (r - 12) * Math.sin(angle);
        var color = hf < 1.1 ? '#ff4466' : hf < 1.3 ? '#ff8844' : hf < 1.8 ? '#c9a227' : '#00ff88';
        svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round"/>';
        svg += '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + color + '"/>';

        svg += '<text x="' + cx + '" y="' + (cy - 12) + '" text-anchor="middle" fill="' + color + '" font-size="20" font-weight="800">' + hf.toFixed(2) + '</text>';
        svg += '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" fill="#888" font-size="9">Health Factor</text>';
        var status = hf < 1.1 ? 'DANGER' : hf < 1.3 ? 'WARNING' : hf < 1.8 ? 'MODERATE' : 'SAFE';
        svg += '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" fill="' + color + '" font-size="10" font-weight="700">' + status + '</text>';

        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;

        // Aggregate stats
        var totalCollateral = 0, totalDebt = 0, totalInterest = 0;
        var minHF = Infinity;
        this.positions.forEach(function(p) {
            var cv = p.collateral.amount * p.collateral.price;
            totalCollateral += cv;
            totalDebt += p.debt.amount;
            totalInterest += p.debt.amount * (p.debt.rate / 100);
            var hf = self.calcHealthFactor(p);
            if (hf < minHF) minHF = hf;
        });
        var avgLtv = totalCollateral > 0 ? (totalDebt / totalCollateral * 100) : 0;
        if (minHF === Infinity) minHF = 0;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + totalCollateral.toLocaleString() + '</div><div class="sol-stat-label">Total Collateral</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">$' + totalDebt.toLocaleString() + '</div><div class="sol-stat-label">Total Debt</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + avgLtv.toFixed(1) + '%</div><div class="sol-stat-label">Avg LTV</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">$' + totalInterest.toFixed(0) + '/an</div><div class="sol-stat-label">Annual Interest</div></div></div>';

        // Health gauge
        html += '<div class="sol-section"><div class="sol-section-title">🏥 Overall Health</div>' +
            '<div style="display:flex;justify-content:center">' + this.renderHealthGauge(minHF, 240) + '</div></div>';

        // Positions table
        html += '<div class="sol-section"><div class="sol-section-title">📋 DeFi Positions</div>' +
            '<table class="sol-table"><thead><tr><th>Protocol</th><th>Collateral</th><th>Debt</th><th>LTV</th><th>Health Factor</th><th>Liq. Price</th><th>Rate</th></tr></thead><tbody>';
        this.positions.forEach(function(p) {
            var hf = self.calcHealthFactor(p);
            var liqPrice = self.calcLiquidationPrice(p);
            var currentLtv = self.calcCurrentLtv(p);
            var hfColor = hf < 1.1 ? '#ff4466' : hf < 1.3 ? '#ff8844' : hf < 1.8 ? '#c9a227' : '#00ff88';
            var ltvColor = currentLtv > p.liqThreshold * 0.9 ? '#ff4466' : currentLtv > p.ltv * 0.8 ? '#c9a227' : '#00ff88';
            var priceDropPct = ((p.collateral.price - liqPrice) / p.collateral.price * 100);

            html += '<tr><td><strong>' + p.protocol + '</strong><div style="font-size:10px;color:#555">' + p.chain + '</div></td>' +
                '<td style="font-family:monospace"><span style="color:#00ff88">' + p.collateral.amount + ' ' + p.collateral.asset + '</span><div style="font-size:10px;color:#555">$' + (p.collateral.amount * p.collateral.price).toLocaleString() + '</div></td>' +
                '<td style="font-family:monospace"><span style="color:#ff4466">' + p.debt.amount.toLocaleString() + ' ' + p.debt.asset + '</span></td>' +
                '<td><div style="display:flex;align-items:center;gap:4px"><div style="width:40px;height:6px;background:#111;border-radius:3px"><div style="height:100%;width:' + Math.min(100, currentLtv / p.liqThreshold * 100) + '%;background:' + ltvColor + ';border-radius:3px"></div></div><span style="font-family:monospace;color:' + ltvColor + ';font-size:11px">' + currentLtv.toFixed(1) + '%</span></div></td>' +
                '<td style="font-family:monospace;color:' + hfColor + ';font-weight:700;font-size:14px">' + hf.toFixed(2) + '</td>' +
                '<td style="font-family:monospace"><span style="color:#ff4466">$' + liqPrice.toFixed(0) + '</span><div style="font-size:9px;color:#555">-' + priceDropPct.toFixed(0) + '% from current price</div></td>' +
                '<td style="font-family:monospace;color:#c9a227">' + p.debt.rate + '%</td></tr>';
        });
        html += '</tbody></table></div>';

        // Stress test
        html += '<div class="sol-section"><div class="sol-section-title">🧪 Stress Test - If prices drop by...</div>' +
            '<table class="sol-table"><thead><tr><th>Scenario</th>';
        this.positions.forEach(function(p) { html += '<th>' + p.protocol + '</th>'; });
        html += '</tr></thead><tbody>';
        [10, 20, 30, 40, 50].forEach(function(drop) {
            html += '<tr><td style="color:#ff4466;font-weight:600">-' + drop + '%</td>';
            self.positions.forEach(function(p) {
                var newPrice = p.collateral.price * (1 - drop / 100);
                var newCV = p.collateral.amount * newPrice;
                var newHF = (newCV * (p.liqThreshold / 100)) / p.debt.amount;
                var hfColor = newHF < 1 ? '#ff4466' : newHF < 1.3 ? '#ff8844' : newHF < 1.8 ? '#c9a227' : '#00ff88';
                var status = newHF < 1 ? '💀 LIQ' : newHF.toFixed(2);
                html += '<td style="font-family:monospace;color:' + hfColor + ';font-weight:600">' + status + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        // Tips
        html += '<div class="sol-section"><div class="sol-section-title">💡 Tips</div>' +
            '<div style="color:#aaa;font-size:12px;line-height:1.8">' +
            '<div><span style="color:#00ff88;font-weight:600">Health Factor > 2.0:</span> Safe position - low liquidation risk</div>' +
            '<div><span style="color:#c9a227;font-weight:600">Health Factor 1.3-2.0:</span> Monitor - repay if market drops</div>' +
            '<div><span style="color:#ff4466;font-weight:600">Health Factor < 1.3:</span> Danger - add collateral or repay immediately</div>' +
            '<div style="margin-top:8px;padding:8px;background:#ff446610;border:1px solid #ff446630;border-radius:6px;color:#ff4466;font-weight:600">⚠️ Liquidation = 5-15% collateral loss + fees. Always keep a safety margin!</div></div></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('debt-dashboard', DebtDashboard, 'shared', {
    icon: '🏦', name: 'Debt Dashboard', description: 'Track DeFi loans across protocols: health factor, liquidation price, stress test'
});
