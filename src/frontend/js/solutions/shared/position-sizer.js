/* ============================================
   POSITION SIZER - Position Size Calculator
   Kelly Criterion + Risk-based sizing
   ============================================ */

const PositionSizer = {
    config: { balance: 10000, riskPct: 2, winRate: 55, avgWin: 3, avgLoss: 2, leverage: 1 },

    init() {
        try {
            var s = JSON.parse(localStorage.getItem('obelisk_pos_sizer') || '{}');
            if (s.balance) Object.assign(this.config, s);
        } catch(e) {}
    },

    save() { localStorage.setItem('obelisk_pos_sizer', JSON.stringify(this.config)); },

    calcKelly(winRate, avgWin, avgLoss) {
        var p = winRate / 100;
        var q = 1 - p;
        var b = avgWin / Math.max(0.01, avgLoss);
        var kelly = (p * b - q) / b;
        return Math.max(0, Math.min(1, kelly));
    },

    calcFixedRisk(balance, riskPct, stopLossPct) {
        var riskAmount = balance * (riskPct / 100);
        var positionSize = riskAmount / (stopLossPct / 100);
        return { riskAmount: riskAmount, positionSize: positionSize, stopLossPct: stopLossPct };
    },

    renderKellyGauge(kelly, halfKelly, size) {
        var cx = size / 2, cy = size * 0.6, r = size * 0.4;
        var svg = '<svg width="' + size + '" height="' + (size * 0.7) + '">';

        // Background arc
        var startAngle = Math.PI;
        var endAngle = 0;
        var x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
        var x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
        svg += '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + r + ',' + r + ' 0 1,1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + '" fill="none" stroke="#1a1a1a" stroke-width="12" stroke-linecap="round"/>';

        // Colored arc zones
        var zones = [
            { from: 0, to: 0.1, color: '#00ff88' },
            { from: 0.1, to: 0.25, color: '#88cc44' },
            { from: 0.25, to: 0.5, color: '#c9a227' },
            { from: 0.5, to: 0.75, color: '#ff8844' },
            { from: 0.75, to: 1, color: '#ff4466' }
        ];
        zones.forEach(function(z) {
            var a1 = Math.PI - z.from * Math.PI;
            var a2 = Math.PI - z.to * Math.PI;
            var ax1 = cx + r * Math.cos(a1), ay1 = cy + r * Math.sin(a1);
            var ax2 = cx + r * Math.cos(a2), ay2 = cy + r * Math.sin(a2);
            svg += '<path d="M' + ax1.toFixed(1) + ',' + ay1.toFixed(1) + ' A' + r + ',' + r + ' 0 0,1 ' + ax2.toFixed(1) + ',' + ay2.toFixed(1) + '" fill="none" stroke="' + z.color + '" stroke-width="12" stroke-linecap="butt" opacity="0.3"/>';
        });

        // Needle (Kelly)
        var kellyAngle = Math.PI - Math.min(1, kelly) * Math.PI;
        var nx = cx + (r - 15) * Math.cos(kellyAngle);
        var ny = cy + (r - 15) * Math.sin(kellyAngle);
        svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="#ff4466" stroke-width="2.5" stroke-linecap="round"/>';
        svg += '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="#ff4466"/>';

        // Half-Kelly marker
        var hkAngle = Math.PI - Math.min(1, halfKelly) * Math.PI;
        var hx = cx + (r + 8) * Math.cos(hkAngle);
        var hy = cy + (r + 8) * Math.sin(hkAngle);
        svg += '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="4" fill="#00ff88" stroke="#000" stroke-width="1"/>';

        // Labels
        svg += '<text x="' + cx + '" y="' + (cy - 15) + '" text-anchor="middle" fill="#fff" font-size="18" font-weight="800">' + (kelly * 100).toFixed(1) + '%</text>';
        svg += '<text x="' + cx + '" y="' + (cy + 2) + '" text-anchor="middle" fill="#888" font-size="9">Full Kelly</text>';
        svg += '<text x="' + (cx - r - 5) + '" y="' + (cy + 15) + '" fill="#555" font-size="8">0%</text>';
        svg += '<text x="' + (cx + r + 5) + '" y="' + (cy + 15) + '" fill="#555" font-size="8" text-anchor="end">100%</text>';
        svg += '<text x="' + cx + '" y="' + (cy + 25) + '" text-anchor="middle" fill="#00ff88" font-size="10" font-weight="600">Half Kelly: ' + (halfKelly * 100).toFixed(1) + '%</text>';

        svg += '</svg>';
        return svg;
    },

    renderRiskTable(balance, leverage) {
        var stops = [0.5, 1, 1.5, 2, 3, 5, 8, 10];
        var risks = [0.5, 1, 1.5, 2, 3, 5];
        var html = '<div style="overflow-x:auto"><table class="sol-table"><thead><tr><th>SL \\ Risk</th>';
        risks.forEach(function(r) { html += '<th>' + r + '%</th>'; });
        html += '</tr></thead><tbody>';
        stops.forEach(function(sl) {
            html += '<tr><td style="font-weight:600;color:#c9a227">' + sl + '%</td>';
            risks.forEach(function(r) {
                var size = (balance * (r / 100)) / (sl / 100) * leverage;
                var sizeStr = size >= 1000000 ? (size / 1000000).toFixed(1) + 'M' : size >= 1000 ? (size / 1000).toFixed(1) + 'K' : size.toFixed(0);
                var highlight = Math.abs(r - 2) < 0.01 && Math.abs(sl - 2) < 0.01;
                html += '<td style="font-family:monospace;color:' + (size > balance * 3 ? '#ff4466' : size > balance ? '#c9a227' : '#00ff88') + ';' + (highlight ? 'background:#c9a22720;font-weight:700' : '') + '">$' + sizeStr + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        return html;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var cfg = this.config;

        var kelly = this.calcKelly(cfg.winRate, cfg.avgWin, cfg.avgLoss);
        var halfKelly = kelly / 2;
        var kellySize = cfg.balance * kelly;
        var halfKellySize = cfg.balance * halfKelly;
        var fixedRisk = this.calcFixedRisk(cfg.balance, cfg.riskPct, 2);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + cfg.balance.toLocaleString() + '</div><div class="sol-stat-label">Capital</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + (halfKelly * 100).toFixed(1) + '%</div><div class="sol-stat-label">Half Kelly</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + halfKellySize.toFixed(0) + '</div><div class="sol-stat-label">Optimal Size</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$' + fixedRisk.riskAmount.toFixed(0) + '</div><div class="sol-stat-label">Risk (' + cfg.riskPct + '%)</div></div></div>';

        // Config inputs
        html += '<div class="sol-section"><div class="sol-section-title">⚙️ Parameters</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;padding:8px 0">';
        var fields = [
            { key: 'balance', label: 'Capital ($)', step: 100, min: 100 },
            { key: 'riskPct', label: 'Risk/Trade (%)', step: 0.5, min: 0.1 },
            { key: 'winRate', label: 'Win Rate (%)', step: 1, min: 1 },
            { key: 'avgWin', label: 'Avg Win (%)', step: 0.5, min: 0.1 },
            { key: 'avgLoss', label: 'Avg Loss (%)', step: 0.5, min: 0.1 },
            { key: 'leverage', label: 'Leverage (x)', step: 1, min: 1 }
        ];
        fields.forEach(function(f) {
            html += '<div><label style="color:#888;font-size:11px;display:block;margin-bottom:2px">' + f.label + '</label>' +
                '<input type="number" class="sizer-input" data-key="' + f.key + '" value="' + cfg[f.key] + '" step="' + f.step + '" min="' + f.min + '" style="width:100%;padding:6px 8px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-family:monospace;font-size:13px"/></div>';
        });
        html += '</div></div>';

        // Kelly gauge
        html += '<div class="sol-section"><div class="sol-section-title">🎯 Kelly Criterion</div>' +
            '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center">' +
            '<div>' + this.renderKellyGauge(kelly, halfKelly, 250) + '</div>' +
            '<div style="flex:1;min-width:200px">' +
            '<div style="padding:6px 0;border-bottom:1px solid #111;display:flex;justify-content:space-between"><span style="color:#888">Full Kelly</span><span style="font-family:monospace;color:#ff4466;font-weight:700">' + (kelly * 100).toFixed(1) + '% = $' + kellySize.toFixed(0) + '</span></div>' +
            '<div style="padding:6px 0;border-bottom:1px solid #111;display:flex;justify-content:space-between"><span style="color:#888">Half Kelly (recommended)</span><span style="font-family:monospace;color:#00ff88;font-weight:700">' + (halfKelly * 100).toFixed(1) + '% = $' + halfKellySize.toFixed(0) + '</span></div>' +
            '<div style="padding:6px 0;border-bottom:1px solid #111;display:flex;justify-content:space-between"><span style="color:#888">Quarter Kelly (conservative)</span><span style="font-family:monospace;color:#00d4ff;font-weight:700">' + (kelly * 25).toFixed(1) + '% = $' + (kellySize / 4).toFixed(0) + '</span></div>' +
            '<div style="padding:6px 0;display:flex;justify-content:space-between"><span style="color:#888">Fixed Risk (' + cfg.riskPct + '%)</span><span style="font-family:monospace;font-weight:700">$' + fixedRisk.riskAmount.toFixed(0) + ' → pos $' + fixedRisk.positionSize.toFixed(0) + '</span></div>' +
            '<div style="margin-top:10px;padding:8px;background:#c9a22710;border:1px solid #c9a22730;border-radius:6px;color:#c9a227;font-size:11px">⚠️ Full Kelly maximizes growth but increases variance. Half Kelly is the professional standard.</div>' +
            '</div></div></div>';

        // Risk/SL matrix table
        html += '<div class="sol-section"><div class="sol-section-title">📊 Position Size Matrix (Stop Loss vs Risk)</div>' +
            this.renderRiskTable(cfg.balance, cfg.leverage) + '</div>';

        // Quick scenarios
        html += '<div class="sol-section"><div class="sol-section-title">🎮 Quick Scenarios</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">';
        var scenarios = [
            { label: 'Scalp', entry: 100, sl: 0.3, tp: 0.6 },
            { label: 'Day Trade', entry: 100, sl: 1, tp: 2 },
            { label: 'Swing', entry: 100, sl: 3, tp: 9 },
            { label: 'Position', entry: 100, sl: 8, tp: 24 }
        ];
        scenarios.forEach(function(s) {
            var pos = (cfg.balance * (cfg.riskPct / 100)) / (s.sl / 100);
            var rr = s.tp / s.sl;
            html += '<div style="flex:1;min-width:120px;background:#111;border:1px solid #222;border-radius:8px;padding:10px;text-align:center">' +
                '<div style="color:#fff;font-weight:700;font-size:13px;margin-bottom:6px">' + s.label + '</div>' +
                '<div style="color:#888;font-size:10px">SL: ' + s.sl + '% / TP: ' + s.tp + '%</div>' +
                '<div style="color:#00ff88;font-family:monospace;font-weight:700;font-size:15px;margin:4px 0">$' + (pos >= 1000 ? (pos / 1000).toFixed(1) + 'K' : pos.toFixed(0)) + '</div>' +
                '<div style="color:#c9a227;font-size:10px">R:R = 1:' + rr.toFixed(1) + '</div></div>';
        });
        html += '</div></div>';

        c.innerHTML = html;

        // Input handlers
        c.querySelectorAll('.sizer-input').forEach(function(inp) {
            inp.addEventListener('change', function() {
                var val = parseFloat(inp.value);
                if (!isNaN(val) && val > 0) {
                    self.config[inp.dataset.key] = val;
                    self.save();
                    self.render(containerId);
                }
            });
        });
    }
};

SolutionsHub.registerSolution('position-sizer', PositionSizer, 'shared', {
    icon: '🎯', name: 'Position Sizer', description: 'Calculate optimal position size with Kelly Criterion and risk management'
});
