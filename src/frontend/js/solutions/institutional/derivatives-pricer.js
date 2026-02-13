/* ============================================
   DERIVATIVES PRICER - Black-Scholes + Greeks
   ============================================ */

const DerivativesPricer = {
    params: { spot: 97500, strike: 100000, tte: 30, vol: 65, rate: 5, type: 'call' },

    init() {
        try {
            var s = JSON.parse(localStorage.getItem('obelisk_deriv') || '{}');
            if (s.spot) Object.assign(this.params, s);
        } catch(e) {}
    },

    save() { localStorage.setItem('obelisk_deriv', JSON.stringify(this.params)); },

    // Standard normal CDF approximation
    normCDF(x) {
        var a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        var sign = x < 0 ? -1 : 1;
        x = Math.abs(x) / Math.sqrt(2);
        var t = 1.0 / (1.0 + p * x);
        var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return 0.5 * (1.0 + sign * y);
    },

    normPDF(x) {
        return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    },

    blackScholes(S, K, T, sigma, r, type) {
        if (T <= 0) {
            var intrinsic = type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S);
            return { price: intrinsic, delta: type === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0, rho: 0 };
        }
        var sqrtT = Math.sqrt(T);
        var d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * sqrtT);
        var d2 = d1 - sigma * sqrtT;

        var price, delta;
        if (type === 'call') {
            price = S * this.normCDF(d1) - K * Math.exp(-r * T) * this.normCDF(d2);
            delta = this.normCDF(d1);
        } else {
            price = K * Math.exp(-r * T) * this.normCDF(-d2) - S * this.normCDF(-d1);
            delta = this.normCDF(d1) - 1;
        }

        var gamma = this.normPDF(d1) / (S * sigma * sqrtT);
        var theta = (-(S * this.normPDF(d1) * sigma) / (2 * sqrtT) - r * K * Math.exp(-r * T) * (type === 'call' ? this.normCDF(d2) : this.normCDF(-d2))) / 365;
        var vega = S * sqrtT * this.normPDF(d1) / 100;
        var rho = (type === 'call' ? 1 : -1) * K * T * Math.exp(-r * T) * (type === 'call' ? this.normCDF(d2) : this.normCDF(-d2)) / 100;

        return { price: price, delta: delta, gamma: gamma, theta: theta, vega: vega, rho: rho, d1: d1, d2: d2 };
    },

    renderPayoff(S, K, premium, type, w, h) {
        var padL = 50, padR = 10, padT = 15, padB = 25;
        var chartW = w - padL - padR, chartH = h - padT - padB;
        var minS = K * 0.7, maxS = K * 1.3;
        var points = [];
        var maxPnl = -Infinity, minPnl = Infinity;

        for (var i = 0; i <= 100; i++) {
            var s = minS + (i / 100) * (maxS - minS);
            var pnl;
            if (type === 'call') pnl = Math.max(0, s - K) - premium;
            else pnl = Math.max(0, K - s) - premium;
            points.push({ s: s, pnl: pnl });
            if (pnl > maxPnl) maxPnl = pnl;
            if (pnl < minPnl) minPnl = pnl;
        }

        var range = Math.max(Math.abs(maxPnl), Math.abs(minPnl));
        if (range === 0) range = 1;
        var toX = function(s) { return padL + ((s - minS) / (maxS - minS)) * chartW; };
        var toY = function(pnl) { return padT + chartH / 2 - (pnl / range) * (chartH / 2 - 5); };

        var svg = '<svg width="' + w + '" height="' + h + '">';

        // Zero line
        svg += '<line x1="' + padL + '" y1="' + toY(0) + '" x2="' + (w - padR) + '" y2="' + toY(0) + '" stroke="#333" stroke-width="1"/>';

        // Strike line
        svg += '<line x1="' + toX(K) + '" y1="' + padT + '" x2="' + toX(K) + '" y2="' + (h - padB) + '" stroke="#c9a227" stroke-width="1" stroke-dasharray="4,4"/>';
        svg += '<text x="' + toX(K) + '" y="' + (h - 8) + '" text-anchor="middle" fill="#c9a227" font-size="9">Strike</text>';

        // Spot line
        svg += '<line x1="' + toX(S) + '" y1="' + padT + '" x2="' + toX(S) + '" y2="' + (h - padB) + '" stroke="#00d4ff" stroke-width="1" stroke-dasharray="2,2"/>';
        svg += '<text x="' + toX(S) + '" y="' + (padT - 3) + '" text-anchor="middle" fill="#00d4ff" font-size="9">Spot</text>';

        // Payoff line
        var path = '', areaProfit = '', areaLoss = '';
        points.forEach(function(p, i) {
            var x = toX(p.s), y = toY(p.pnl);
            path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        svg += '<path d="' + path + '" fill="none" stroke="#fff" stroke-width="2"/>';

        // Fill profit area
        var profitPath = '';
        var inProfit = false;
        points.forEach(function(p, i) {
            var x = toX(p.s), y = toY(p.pnl), y0 = toY(0);
            if (p.pnl > 0) {
                if (!inProfit) { profitPath += 'M' + x.toFixed(1) + ',' + y0.toFixed(1); inProfit = true; }
                profitPath += 'L' + x.toFixed(1) + ',' + y.toFixed(1);
            } else if (inProfit) {
                profitPath += 'L' + x.toFixed(1) + ',' + y0.toFixed(1) + 'Z';
                inProfit = false;
            }
        });
        if (inProfit) profitPath += 'L' + toX(points[points.length-1].s).toFixed(1) + ',' + toY(0).toFixed(1) + 'Z';
        if (profitPath) svg += '<path d="' + profitPath + '" fill="#00ff88" opacity="0.15"/>';

        // Breakeven
        var be = type === 'call' ? K + premium : K - premium;
        if (be >= minS && be <= maxS) {
            svg += '<circle cx="' + toX(be) + '" cy="' + toY(0) + '" r="4" fill="#fff" stroke="#000" stroke-width="1"/>';
            svg += '<text x="' + toX(be) + '" y="' + (toY(0) + 14) + '" text-anchor="middle" fill="#fff" font-size="8">BE: $' + be.toFixed(0) + '</text>';
        }

        // Max loss label
        svg += '<text x="' + padL + '" y="' + (toY(-premium) - 3) + '" fill="#ff4466" font-size="8">Max Loss: -$' + premium.toFixed(0) + '</text>';

        svg += '</svg>';
        return svg;
    },

    renderGreeksRadar(greeks, size) {
        var axes = [
            { key: 'delta', label: 'Delta', max: 1 },
            { key: 'gamma', label: 'Gamma', max: 0.001 },
            { key: 'vega', label: 'Vega', max: 500 },
            { key: 'theta', label: 'Theta', max: 50 },
            { key: 'rho', label: 'Rho', max: 100 }
        ];
        var cx = size / 2, cy = size / 2, r = size * 0.35;
        var svg = '<svg width="' + size + '" height="' + size + '">';

        // Background
        for (var ring = 1; ring <= 4; ring++) {
            var rr = (ring / 4) * r;
            var ringPath = '';
            axes.forEach(function(a, i) {
                var angle = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
                ringPath += (i === 0 ? 'M' : 'L') + (cx + rr * Math.cos(angle)).toFixed(1) + ',' + (cy + rr * Math.sin(angle)).toFixed(1);
            });
            ringPath += 'Z';
            svg += '<path d="' + ringPath + '" fill="none" stroke="#1a1a1a" stroke-width="1"/>';
        }

        // Axes + labels
        axes.forEach(function(a, i) {
            var angle = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
            var x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
            svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#222" stroke-width="1"/>';
            var lx = cx + (r + 18) * Math.cos(angle), ly = cy + (r + 18) * Math.sin(angle);
            svg += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" text-anchor="middle" fill="#aaa" font-size="10">' + a.label + '</text>';
        });

        // Data
        var dataPath = '';
        axes.forEach(function(a, i) {
            var val = Math.min(1, Math.abs(greeks[a.key]) / a.max);
            var angle = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
            var x = cx + val * r * Math.cos(angle), y = cy + val * r * Math.sin(angle);
            dataPath += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        dataPath += 'Z';
        svg += '<path d="' + dataPath + '" fill="#00d4ff" opacity="0.2" stroke="#00d4ff" stroke-width="1.5"/>';

        axes.forEach(function(a, i) {
            var val = Math.min(1, Math.abs(greeks[a.key]) / a.max);
            var angle = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
            var x = cx + val * r * Math.cos(angle), y = cy + val * r * Math.sin(angle);
            svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3" fill="#00d4ff"/>';
        });

        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var p = this.params;
        var T = p.tte / 365;
        var sigma = p.vol / 100;
        var r = p.rate / 100;

        var result = this.blackScholes(p.spot, p.strike, T, sigma, r, p.type);
        var otherType = p.type === 'call' ? 'put' : 'call';
        var other = this.blackScholes(p.spot, p.strike, T, sigma, r, otherType);

        var itm = p.type === 'call' ? p.spot > p.strike : p.spot < p.strike;
        var moneyness = p.type === 'call' ? ((p.spot - p.strike) / p.strike * 100) : ((p.strike - p.spot) / p.strike * 100);
        var intrinsic = p.type === 'call' ? Math.max(0, p.spot - p.strike) : Math.max(0, p.strike - p.spot);
        var timeValue = result.price - intrinsic;

        // Inputs
        var html = '<div class="sol-section"><div class="sol-section-title">⚙️ Option Parameters</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">';
        var fields = [
            { key: 'spot', label: 'Spot ($)', step: 100 },
            { key: 'strike', label: 'Strike ($)', step: 100 },
            { key: 'tte', label: 'Days', step: 1 },
            { key: 'vol', label: 'IV (%)', step: 1 },
            { key: 'rate', label: 'Rate (%)', step: 0.5 }
        ];
        fields.forEach(function(f) {
            html += '<div><label style="color:#888;font-size:10px;display:block;margin-bottom:2px">' + f.label + '</label>' +
                '<input type="number" class="deriv-input" data-key="' + f.key + '" value="' + p[f.key] + '" step="' + f.step + '" style="width:100%;padding:5px 6px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-family:monospace;font-size:12px"/></div>';
        });
        html += '<div><label style="color:#888;font-size:10px;display:block;margin-bottom:2px">Type</label>' +
            '<div style="display:flex;gap:4px"><button class="sol-btn sol-btn-sm deriv-type" data-t="call" style="flex:1;' + (p.type === 'call' ? 'background:#00ff88;color:#000' : '') + '">CALL</button>' +
            '<button class="sol-btn sol-btn-sm deriv-type" data-t="put" style="flex:1;' + (p.type === 'put' ? 'background:#ff4466;color:#000' : '') + '">PUT</button></div></div>';
        html += '</div></div>';

        // Results
        var typeColor = p.type === 'call' ? '#00ff88' : '#ff4466';
        html += '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + typeColor + '">$' + result.price.toFixed(2) + '</div><div class="sol-stat-label">' + p.type.toUpperCase() + ' Premium</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + result.delta.toFixed(4) + '</div><div class="sol-stat-label">Delta</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + (itm ? '#00ff88' : '#ff4466') + '">' + (itm ? 'ITM' : 'OTM') + '</div><div class="sol-stat-label">' + moneyness.toFixed(2) + '%</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + result.theta.toFixed(2) + '</div><div class="sol-stat-label">Theta/day</div></div></div>';

        // Payoff + Greeks radar
        html += '<div style="display:flex;gap:12px;flex-wrap:wrap">';
        html += '<div class="sol-section" style="flex:1;min-width:300px"><div class="sol-section-title">📈 Payoff at Expiration</div>' +
            '<div style="overflow-x:auto">' + this.renderPayoff(p.spot, p.strike, result.price, p.type, 380, 200) + '</div></div>';
        html += '<div class="sol-section" style="flex:0 0 200px"><div class="sol-section-title">🎯 Greeks</div>' +
            this.renderGreeksRadar(result, 200) + '</div>';
        html += '</div>';

        // Greeks detail
        html += '<div class="sol-section"><div class="sol-section-title">📊 Greeks Detail</div>' +
            '<table class="sol-table"><thead><tr><th>Greek</th><th>' + p.type.toUpperCase() + '</th><th>' + otherType.toUpperCase() + '</th><th>Description</th></tr></thead><tbody>';
        var greekRows = [
            { name: 'Delta', call: result.delta.toFixed(4), put: other.delta.toFixed(4), desc: 'Sensitivity to underlying price' },
            { name: 'Gamma', call: result.gamma.toFixed(6), put: other.gamma.toFixed(6), desc: 'Rate of change of delta' },
            { name: 'Theta', call: result.theta.toFixed(4), put: other.theta.toFixed(4), desc: 'Time decay per day' },
            { name: 'Vega', call: result.vega.toFixed(4), put: other.vega.toFixed(4), desc: 'Sensitivity to implied volatility' },
            { name: 'Rho', call: result.rho.toFixed(4), put: other.rho.toFixed(4), desc: 'Sensitivity to interest rate' }
        ];
        greekRows.forEach(function(g) {
            html += '<tr><td><strong>' + g.name + '</strong></td>' +
                '<td style="font-family:monospace;color:#00d4ff">' + g.call + '</td>' +
                '<td style="font-family:monospace;color:#888">' + g.put + '</td>' +
                '<td style="color:#888;font-size:11px">' + g.desc + '</td></tr>';
        });
        html += '</tbody></table></div>';

        // Price breakdown
        html += '<div class="sol-section"><div class="sol-section-title">💰 Price Breakdown</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<div style="flex:1;min-width:140px;text-align:center;background:#111;border-radius:8px;padding:10px"><div style="color:#c9a227;font-size:18px;font-weight:700">$' + intrinsic.toFixed(2) + '</div><div style="color:#888;font-size:11px">Intrinsic Value</div></div>' +
            '<div style="flex:0;display:flex;align-items:center;color:#555;font-size:18px">+</div>' +
            '<div style="flex:1;min-width:140px;text-align:center;background:#111;border-radius:8px;padding:10px"><div style="color:#00d4ff;font-size:18px;font-weight:700">$' + Math.max(0, timeValue).toFixed(2) + '</div><div style="color:#888;font-size:11px">Time Value</div></div>' +
            '<div style="flex:0;display:flex;align-items:center;color:#555;font-size:18px">=</div>' +
            '<div style="flex:1;min-width:140px;text-align:center;background:#111;border:1px solid ' + typeColor + '30;border-radius:8px;padding:10px"><div style="color:' + typeColor + ';font-size:18px;font-weight:700">$' + result.price.toFixed(2) + '</div><div style="color:#888;font-size:11px">Total Premium</div></div></div></div>';

        c.innerHTML = html;

        // Event handlers
        c.querySelectorAll('.deriv-input').forEach(function(inp) {
            inp.addEventListener('change', function() {
                var val = parseFloat(inp.value);
                if (!isNaN(val) && val >= 0) { self.params[inp.dataset.key] = val; self.save(); self.render(containerId); }
            });
        });
        c.querySelectorAll('.deriv-type').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.params.type = btn.dataset.t;
                self.save();
                self.render(containerId);
            });
        });
    }
};

SolutionsHub.registerSolution('derivatives-pricer', DerivativesPricer, 'institutional', {
    icon: '📐', name: 'Derivatives Pricer', description: 'Black-Scholes calculator with Greeks, payoff diagram and options price breakdown'
});
