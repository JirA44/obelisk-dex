/* ============================================
   IMPERMANENT LOSS CALCULATOR - LP risk tool
   ============================================ */

const ImpermanentLossCalc = {
    init() {},

    calculateIL(priceChange) {
        var r = 1 + priceChange / 100;
        var il = 2 * Math.sqrt(r) / (1 + r) - 1;
        return il * 100;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;

        var html = '<div class="sol-section"><div class="sol-section-title">⚙️ Calculate Impermanent Loss</div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Initial Deposit ($)</label><input class="sol-input" id="il-deposit" type="number" value="10000"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Token A (base)</label><select class="sol-select sol-input" id="il-tokenA"><option>ETH</option><option>BTC</option><option>SOL</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Token B (quote)</label><select class="sol-select sol-input" id="il-tokenB"><option>USDC</option><option>USDT</option><option>DAI</option></select></div></div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Price Change Token A (%)</label><input class="sol-input" id="il-change" type="number" value="50" step="5"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Pool Fee APY (%)</label><input class="sol-input" id="il-fee" type="number" value="25" step="1"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Days in Pool</label><input class="sol-input" id="il-days" type="number" value="365"></div></div>' +
            '<button class="sol-btn sol-btn-primary" id="il-calc" style="margin-top:8px">Calculate</button></div>';

        // Pre-computed IL chart
        html += '<div class="sol-section"><div class="sol-section-title">📈 Impermanent Loss Curve</div>' +
            '<div style="padding:10px 0">' + this.renderILCurve(580, 200) + '</div>' +
            '<div style="text-align:center;font-size:11px;color:#555">X-axis: Price change of Token A | Y-axis: Impermanent loss %</div></div>';

        // Reference table
        html += '<div class="sol-section"><div class="sol-section-title">📊 IL Reference Table</div>' +
            '<table class="sol-table"><thead><tr><th>Price Change</th><th>Impermanent Loss</th><th>Break-even APY Needed</th></tr></thead><tbody>';
        [10, 25, 50, 75, 100, 200, 300, 500].forEach(function(pct) {
            var il = self.calculateIL(pct);
            var ilNeg = self.calculateIL(-pct / 2);
            var breakeven = Math.abs(il) * 365 / 30;
            html += '<tr><td style="font-family:monospace;color:#00d4ff">+' + pct + '%</td>' +
                '<td style="font-family:monospace;color:#ff4466">' + il.toFixed(2) + '%</td>' +
                '<td style="font-family:monospace;color:#c9a227">' + breakeven.toFixed(1) + '% (30d)</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div id="il-results"></div>';

        c.innerHTML = html;
        c.querySelector('#il-calc').addEventListener('click', function() {
            var deposit = parseFloat(document.getElementById('il-deposit').value) || 10000;
            var change = parseFloat(document.getElementById('il-change').value) || 0;
            var feeApy = parseFloat(document.getElementById('il-fee').value) || 0;
            var days = parseFloat(document.getElementById('il-days').value) || 365;
            var il = self.calculateIL(change);
            var ilUsd = deposit * Math.abs(il) / 100;
            var feeEarned = deposit * feeApy / 100 * days / 365;
            var netResult = feeEarned - ilUsd;
            var lpValue = deposit * (1 + il / 100);
            var holdValue = deposit * (1 + change / 200);

            var r = '<div class="sol-stats-row">' +
                '<div class="sol-stat-card"><div class="sol-stat-value red">' + il.toFixed(2) + '%</div><div class="sol-stat-label">Impermanent Loss</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value red">-$' + ilUsd.toFixed(0) + '</div><div class="sol-stat-label">IL in USD</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value green">+$' + feeEarned.toFixed(0) + '</div><div class="sol-stat-label">Fee Earnings</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value ' + (netResult >= 0 ? 'green' : 'red') + '">' + (netResult >= 0 ? '+' : '') + '$' + netResult.toFixed(0) + '</div><div class="sol-stat-label">Net Result</div></div></div>';
            r += '<div class="sol-section"><div class="sol-section-title">📋 Comparison</div>' +
                '<div style="display:flex;gap:16px">' +
                '<div style="flex:1;padding:16px;border:1px solid #1a1a1a;border-radius:10px;text-align:center"><div style="color:#888;font-size:12px;margin-bottom:8px">LP Position</div><div style="font-family:monospace;font-size:20px;color:#00d4ff">$' + lpValue.toFixed(0) + '</div><div style="font-size:11px;color:#555">+ $' + feeEarned.toFixed(0) + ' fees</div><div style="font-family:monospace;font-size:14px;color:' + (lpValue + feeEarned >= deposit ? '#00ff88' : '#ff4466') + ';margin-top:4px">= $' + (lpValue + feeEarned).toFixed(0) + '</div></div>' +
                '<div style="flex:1;padding:16px;border:1px solid #1a1a1a;border-radius:10px;text-align:center"><div style="color:#888;font-size:12px;margin-bottom:8px">Just HODL</div><div style="font-family:monospace;font-size:20px;color:#fff">$' + holdValue.toFixed(0) + '</div><div style="font-size:11px;color:#555">50/50 hold</div><div style="font-family:monospace;font-size:14px;color:' + (holdValue >= deposit ? '#00ff88' : '#ff4466') + ';margin-top:4px">' + (holdValue >= deposit ? '+' : '') + '$' + (holdValue - deposit).toFixed(0) + '</div></div></div></div>';

            document.getElementById('il-results').innerHTML = r;
        });
    },

    renderILCurve(width, height) {
        var self = this;
        var svg = '<svg width="' + width + '" height="' + height + '">';
        var points = [];
        for (var pct = -80; pct <= 500; pct += 5) {
            var il = this.calculateIL(pct);
            points.push({ x: pct, y: il });
        }
        var minY = Math.min.apply(null, points.map(function(p) { return p.y; }));
        var maxY = Math.max.apply(null, points.map(function(p) { return p.y; }));
        if (maxY < 0) maxY = 0;
        var rangeY = maxY - minY || 1;
        var path = '';
        points.forEach(function(p, i) {
            var x = ((p.x + 80) / 580) * width;
            var y = height - 10 - ((p.y - minY) / rangeY) * (height - 20);
            path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        // Zero line
        var zeroY = height - 10 - ((0 - minY) / rangeY) * (height - 20);
        svg += '<line x1="0" y1="' + zeroY + '" x2="' + width + '" y2="' + zeroY + '" stroke="#333" stroke-width="1"/>';
        svg += '<path d="' + path + '" fill="none" stroke="#ff4466" stroke-width="2"/>';
        // Labels
        [0, 100, 200, 300, 400, 500].forEach(function(pct) {
            var x = ((pct + 80) / 580) * width;
            svg += '<text x="' + x + '" y="' + (height - 1) + '" text-anchor="middle" fill="#555" font-size="9">' + (pct >= 0 ? '+' : '') + pct + '%</text>';
        });
        [-5, -10, -20, -25].forEach(function(il) {
            var y = height - 10 - ((il - minY) / rangeY) * (height - 20);
            svg += '<text x="' + (width - 3) + '" y="' + (y - 2) + '" text-anchor="end" fill="#ff4466" font-size="9">' + il + '%</text>';
            svg += '<line x1="0" y1="' + y + '" x2="' + width + '" y2="' + y + '" stroke="#221111" stroke-width="0.5"/>';
        });
        svg += '</svg>';
        return svg;
    }
};

SolutionsHub.registerSolution('impermanent-loss-calc', ImpermanentLossCalc, 'shared', {
    icon: '📉', name: 'IL Calculator', description: 'Calculate impermanent loss for LP positions with fee break-even analysis'
});
