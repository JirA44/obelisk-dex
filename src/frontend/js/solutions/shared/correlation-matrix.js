/* ============================================
   CORRELATION MATRIX - Heatmap correlations
   ============================================ */

const CorrelationMatrix = {
    assets: ['BTC', 'ETH', 'SOL', 'AVAX', 'LINK', 'ARB', 'DOGE', 'BNB'],
    period: '30d',

    init() {
        try {
            var s = JSON.parse(localStorage.getItem('obelisk_corr_cfg') || '{}');
            if (s.period) this.period = s.period;
        } catch(e) {}
    },

    save() { localStorage.setItem('obelisk_corr_cfg', JSON.stringify({ period: this.period })); },

    generateReturns(symbol, n) {
        var seed = 0;
        for (var i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i) * (i + 1) * 37;
        var rng = function() { seed = (seed * 16807 + 7) % 2147483647; return (seed % 10000) / 10000 - 0.5; };
        var returns = [];
        for (var i = 0; i < n; i++) {
            var base = rng() * 0.04;
            // Market factor (correlated component)
            var mktSeed = i * 137 + 42;
            mktSeed = (mktSeed * 16807 + 7) % 2147483647;
            var market = ((mktSeed % 10000) / 10000 - 0.5) * 0.03;
            // BTC dominance
            var btcWeight = symbol === 'BTC' ? 0.9 : symbol === 'ETH' ? 0.75 : symbol === 'DOGE' ? 0.3 : 0.55;
            returns.push(base * (1 - btcWeight) + market * btcWeight);
        }
        return returns;
    },

    computeCorrelation(a, b) {
        var n = Math.min(a.length, b.length);
        if (n < 2) return 0;
        var sumA = 0, sumB = 0;
        for (var i = 0; i < n; i++) { sumA += a[i]; sumB += b[i]; }
        var meanA = sumA / n, meanB = sumB / n;
        var cov = 0, varA = 0, varB = 0;
        for (var i = 0; i < n; i++) {
            var da = a[i] - meanA, db = b[i] - meanB;
            cov += da * db; varA += da * da; varB += db * db;
        }
        var denom = Math.sqrt(varA * varB);
        return denom === 0 ? 0 : cov / denom;
    },

    buildMatrix() {
        var days = this.period === '7d' ? 7 : this.period === '30d' ? 30 : this.period === '90d' ? 90 : 365;
        var returns = {};
        var self = this;
        this.assets.forEach(function(a) { returns[a] = self.generateReturns(a, days); });

        var matrix = [];
        var self2 = this;
        this.assets.forEach(function(a, i) {
            var row = [];
            self2.assets.forEach(function(b, j) {
                row.push(i === j ? 1 : self2.computeCorrelation(returns[a], returns[b]));
            });
            matrix.push(row);
        });
        return matrix;
    },

    renderHeatmap(matrix, size) {
        var n = this.assets.length;
        var cellSize = Math.floor((size - 60) / n);
        var padL = 45, padT = 35;
        var w = padL + n * cellSize + 10;
        var h = padT + n * cellSize + 10;
        var svg = '<svg width="' + w + '" height="' + h + '">';

        var self = this;
        // Column headers
        this.assets.forEach(function(a, i) {
            svg += '<text x="' + (padL + i * cellSize + cellSize / 2) + '" y="' + (padT - 8) + '" text-anchor="middle" fill="#aaa" font-size="10" font-weight="600">' + a + '</text>';
        });

        matrix.forEach(function(row, i) {
            // Row label
            svg += '<text x="' + (padL - 5) + '" y="' + (padT + i * cellSize + cellSize / 2 + 3) + '" text-anchor="end" fill="#aaa" font-size="10" font-weight="600">' + self.assets[i] + '</text>';

            row.forEach(function(val, j) {
                var x = padL + j * cellSize;
                var y = padT + i * cellSize;
                var color;
                if (val >= 0) {
                    var g = Math.floor(val * 255);
                    color = 'rgb(0,' + g + ',' + Math.floor(g * 0.55) + ')';
                } else {
                    var r = Math.floor(Math.abs(val) * 255);
                    color = 'rgb(' + r + ',' + Math.floor(r * 0.2) + ',' + Math.floor(r * 0.3) + ')';
                }
                var opacity = 0.15 + Math.abs(val) * 0.75;
                svg += '<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" fill="' + color + '" opacity="' + opacity.toFixed(2) + '" stroke="#0a0a0a" stroke-width="1"/>';
                // Value text
                var textColor = Math.abs(val) > 0.5 ? '#fff' : '#888';
                svg += '<text x="' + (x + cellSize / 2) + '" y="' + (y + cellSize / 2 + 4) + '" text-anchor="middle" fill="' + textColor + '" font-size="' + (cellSize > 50 ? '11' : '9') + '" font-weight="600">' + (i === j ? '1.00' : val.toFixed(2)) + '</text>';
            });
        });

        // Legend bar
        var legY = padT + n * cellSize + 5;
        for (var l = 0; l <= 20; l++) {
            var lv = -1 + l * 0.1;
            var lx = padL + (l / 20) * (n * cellSize);
            var lc;
            if (lv >= 0) { var g = Math.floor(lv * 255); lc = 'rgb(0,' + g + ',' + Math.floor(g * 0.55) + ')'; }
            else { var r = Math.floor(Math.abs(lv) * 255); lc = 'rgb(' + r + ',' + Math.floor(r * 0.2) + ',' + Math.floor(r * 0.3) + ')'; }
            svg += '<rect x="' + lx + '" y="' + legY + '" width="' + ((n * cellSize) / 20) + '" height="6" fill="' + lc + '"/>';
        }
        svg += '<text x="' + padL + '" y="' + (legY + 16) + '" fill="#888" font-size="8">-1.0</text>';
        svg += '<text x="' + (padL + n * cellSize / 2) + '" y="' + (legY + 16) + '" text-anchor="middle" fill="#888" font-size="8">0</text>';
        svg += '<text x="' + (padL + n * cellSize) + '" y="' + (legY + 16) + '" text-anchor="end" fill="#888" font-size="8">+1.0</text>';

        svg += '</svg>';
        return svg;
    },

    findInsights(matrix) {
        var insights = [];
        var self = this;
        for (var i = 0; i < self.assets.length; i++) {
            for (var j = i + 1; j < self.assets.length; j++) {
                var val = matrix[i][j];
                if (val > 0.7) insights.push({ type: 'high-corr', a: self.assets[i], b: self.assets[j], val: val, icon: '🔴', msg: 'Highly correlated - low diversification' });
                else if (val < -0.3) insights.push({ type: 'neg-corr', a: self.assets[i], b: self.assets[j], val: val, icon: '🟢', msg: 'Anti-correlated - good for diversification' });
                else if (Math.abs(val) < 0.15) insights.push({ type: 'uncorr', a: self.assets[i], b: self.assets[j], val: val, icon: '💡', msg: 'Uncorrelated - independent' });
            }
        }
        insights.sort(function(a, b) { return Math.abs(b.val) - Math.abs(a.val); });
        return insights.slice(0, 8);
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var matrix = this.buildMatrix();
        var insights = this.findInsights(matrix);

        // Avg correlation
        var sum = 0, cnt = 0;
        for (var i = 0; i < matrix.length; i++) {
            for (var j = i + 1; j < matrix[i].length; j++) { sum += matrix[i][j]; cnt++; }
        }
        var avgCorr = cnt > 0 ? sum / cnt : 0;

        var periods = ['7d', '30d', '90d', '1y'];
        var html = '<div style="display:flex;gap:4px;margin-bottom:12px">';
        periods.forEach(function(p) {
            html += '<button class="sol-btn sol-btn-sm corr-period" data-p="' + p + '" style="' + (p === self.period ? 'background:#c9a227;color:#000' : '') + '">' + p + '</button>';
        });
        html += '</div>';

        html += '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + (avgCorr > 0.5 ? '#ff4466' : avgCorr > 0.3 ? '#c9a227' : '#00ff88') + '">' + avgCorr.toFixed(2) + '</div><div class="sol-stat-label">Avg Correlation</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.assets.length + '</div><div class="sol-stat-label">Assets</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + insights.filter(function(i) { return i.type === 'high-corr'; }).length + '</div><div class="sol-stat-label">Correlated Pairs</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + insights.filter(function(i) { return i.type === 'neg-corr'; }).length + '</div><div class="sol-stat-label">Anti-Correlated</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🔥 Correlation Matrix</div>' +
            '<div style="overflow-x:auto;padding:8px;display:flex;justify-content:center">' + this.renderHeatmap(matrix, 520) + '</div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">💡 Insights</div>';
        insights.forEach(function(ins) {
            var valColor = ins.val > 0.5 ? '#ff4466' : ins.val > 0 ? '#c9a227' : '#00ff88';
            html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #111">' +
                '<span>' + ins.icon + '</span>' +
                '<span style="min-width:100px"><strong>' + ins.a + '</strong> / <strong>' + ins.b + '</strong></span>' +
                '<span style="font-family:monospace;color:' + valColor + ';font-weight:700;min-width:50px">' + (ins.val > 0 ? '+' : '') + ins.val.toFixed(2) + '</span>' +
                '<span style="color:#888;font-size:12px">' + ins.msg + '</span></div>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">📖 Guide</div>' +
            '<div style="color:#aaa;font-size:12px;line-height:1.8">' +
            '<div><span style="color:#00ff88;font-weight:600">+0.7 to +1.0:</span> Highly correlated - move together, reduces diversification</div>' +
            '<div><span style="color:#c9a227;font-weight:600">+0.3 to +0.7:</span> Moderately correlated - similar trend</div>' +
            '<div><span style="color:#888;font-weight:600">-0.3 to +0.3:</span> Low correlation - good for diversification</div>' +
            '<div><span style="color:#ff4466;font-weight:600">-1.0 to -0.3:</span> Anti-correlated - excellent hedge</div></div></div>';

        c.innerHTML = html;
        c.querySelectorAll('.corr-period').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.period = btn.dataset.p;
                self.save();
                self.render(containerId);
            });
        });
    }
};

SolutionsHub.registerSolution('correlation-matrix', CorrelationMatrix, 'shared', {
    icon: '🔥', name: 'Correlation Matrix', description: 'Asset correlation heatmap to optimize portfolio diversification'
});
