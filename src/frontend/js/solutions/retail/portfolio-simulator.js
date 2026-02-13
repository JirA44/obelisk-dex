/* ============================================
   PORTFOLIO SIMULATOR - Monte Carlo simulation
   ============================================ */

const PortfolioSimulator = {
    init() {},

    runSimulation(params) {
        var capital = parseFloat(params.capital) || 10000;
        var years = parseInt(params.years) || 5;
        var allocation = params.allocation || { crypto: 40, stocks: 30, bonds: 20, cash: 10 };
        var numSims = 200;
        var days = years * 252;

        var assetParams = {
            crypto: { mu: 0.0004, sigma: 0.035 },
            stocks: { mu: 0.0003, sigma: 0.012 },
            bonds: { mu: 0.00015, sigma: 0.004 },
            cash: { mu: 0.00012, sigma: 0.0002 }
        };

        var simulations = [];
        var finalValues = [];
        for (var s = 0; s < numSims; s++) {
            var equity = [capital];
            var val = capital;
            for (var d = 1; d < days; d++) {
                var dailyReturn = 0;
                Object.keys(allocation).forEach(function(asset) {
                    var w = allocation[asset] / 100;
                    var p = assetParams[asset];
                    var z = (Math.random() + Math.random() + Math.random() - 1.5) * 2;
                    dailyReturn += w * (p.mu + p.sigma * z);
                });
                val *= (1 + dailyReturn);
                if (d % 5 === 0) equity.push(val);
            }
            simulations.push(equity);
            finalValues.push(val);
        }

        finalValues.sort(function(a, b) { return a - b; });
        var p10 = finalValues[Math.floor(numSims * 0.1)];
        var p50 = finalValues[Math.floor(numSims * 0.5)];
        var p90 = finalValues[Math.floor(numSims * 0.9)];
        var mean = finalValues.reduce(function(s, v) { return s + v; }, 0) / numSims;
        var cagr = (Math.pow(p50 / capital, 1 / years) - 1) * 100;

        return { simulations: simulations, finalValues: finalValues, p10: p10, p50: p50, p90: p90, mean: mean, cagr: cagr, capital: capital, years: years };
    },

    renderFanChart(result, width, height) {
        var sims = result.simulations;
        var maxLen = Math.max.apply(null, sims.map(function(s) { return s.length; }));
        var allVals = [];
        sims.forEach(function(s) { s.forEach(function(v) { allVals.push(v); }); });
        var minVal = Math.min.apply(null, allVals) * 0.95;
        var maxVal = Math.max.apply(null, allVals) * 1.05;
        var range = maxVal - minVal || 1;

        var svg = '<svg width="' + width + '" height="' + height + '">';

        // Draw percentile bands
        var percentiles = [10, 25, 50, 75, 90];
        var bands = [];
        for (var t = 0; t < maxLen; t++) {
            var vals = [];
            sims.forEach(function(s) { if (s[t] !== undefined) vals.push(s[t]); });
            vals.sort(function(a, b) { return a - b; });
            var row = {};
            percentiles.forEach(function(p) { row['p' + p] = vals[Math.floor(vals.length * p / 100)] || vals[vals.length - 1]; });
            bands.push(row);
        }

        // P10-P90 band
        var pathTop = '', pathBot = '';
        bands.forEach(function(b, i) {
            var x = (i / (maxLen - 1)) * width;
            var y90 = height - ((b.p90 - minVal) / range) * height;
            var y10 = height - ((b.p10 - minVal) / range) * height;
            pathTop += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y90.toFixed(1);
            pathBot += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y10.toFixed(1);
        });
        var revBot = '';
        bands.slice().reverse().forEach(function(b, i) {
            var x = ((bands.length - 1 - i) / (maxLen - 1)) * width;
            var y10 = height - ((b.p10 - minVal) / range) * height;
            revBot += 'L' + x.toFixed(1) + ',' + y10.toFixed(1);
        });
        svg += '<path d="' + pathTop + revBot + ' Z" fill="#00d4ff" opacity="0.1"/>';

        // P25-P75 band
        var p25Path = '', p75Rev = '';
        bands.forEach(function(b, i) {
            var x = (i / (maxLen - 1)) * width;
            var y75 = height - ((b.p75 - minVal) / range) * height;
            p25Path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y75.toFixed(1);
        });
        bands.slice().reverse().forEach(function(b, i) {
            var x = ((bands.length - 1 - i) / (maxLen - 1)) * width;
            var y25 = height - ((b.p25 - minVal) / range) * height;
            p75Rev += 'L' + x.toFixed(1) + ',' + y25.toFixed(1);
        });
        svg += '<path d="' + p25Path + p75Rev + ' Z" fill="#00d4ff" opacity="0.15"/>';

        // Median line
        var medianPath = '';
        bands.forEach(function(b, i) {
            var x = (i / (maxLen - 1)) * width;
            var y = height - ((b.p50 - minVal) / range) * height;
            medianPath += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        svg += '<path d="' + medianPath + '" fill="none" stroke="#00d4ff" stroke-width="2.5"/>';

        // Start line
        var startY = height - ((result.capital - minVal) / range) * height;
        svg += '<line x1="0" y1="' + startY + '" x2="' + width + '" y2="' + startY + '" stroke="#333" stroke-width="1" stroke-dasharray="4,4"/>';
        svg += '<text x="' + (width - 5) + '" y="' + (startY - 4) + '" text-anchor="end" fill="#555" font-size="9">$' + (result.capital / 1000).toFixed(0) + 'K start</text>';
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;

        var html = '<div class="sol-section"><div class="sol-section-title">⚙️ Simulation Parameters</div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Starting Capital ($)</label><input class="sol-input" id="sim-capital" type="number" value="10000"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Time Horizon</label><select class="sol-select sol-input" id="sim-years"><option value="1">1 Year</option><option value="3">3 Years</option><option value="5" selected>5 Years</option><option value="10">10 Years</option></select></div></div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Crypto %</label><input class="sol-input" id="sim-crypto" type="number" value="40" min="0" max="100"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Stocks %</label><input class="sol-input" id="sim-stocks" type="number" value="30" min="0" max="100"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Bonds %</label><input class="sol-input" id="sim-bonds" type="number" value="20" min="0" max="100"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Cash %</label><input class="sol-input" id="sim-cash" type="number" value="10" min="0" max="100"></div></div>' +
            '<button class="sol-btn sol-btn-primary" id="sim-run" style="margin-top:8px">Run 200 Simulations</button></div>';

        html += '<div id="sim-results"></div>';
        c.innerHTML = html;

        c.querySelector('#sim-run').addEventListener('click', function() {
            var r = self.runSimulation({
                capital: document.getElementById('sim-capital').value,
                years: document.getElementById('sim-years').value,
                allocation: {
                    crypto: parseInt(document.getElementById('sim-crypto').value) || 0,
                    stocks: parseInt(document.getElementById('sim-stocks').value) || 0,
                    bonds: parseInt(document.getElementById('sim-bonds').value) || 0,
                    cash: parseInt(document.getElementById('sim-cash').value) || 0
                }
            });

            var rhtml = '<div class="sol-stats-row">' +
                '<div class="sol-stat-card"><div class="sol-stat-value red">$' + r.p10.toFixed(0) + '</div><div class="sol-stat-label">Worst 10%</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value cyan">$' + r.p50.toFixed(0) + '</div><div class="sol-stat-label">Median</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value green">$' + r.p90.toFixed(0) + '</div><div class="sol-stat-label">Best 10%</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value">' + r.cagr.toFixed(1) + '%</div><div class="sol-stat-label">Median CAGR</div></div></div>';

            rhtml += '<div class="sol-section"><div class="sol-section-title">📊 Monte Carlo Fan Chart (' + r.years + ' years, 200 simulations)</div>' +
                '<div style="padding:10px 0">' + self.renderFanChart(r, 580, 200) + '</div>' +
                '<div style="display:flex;gap:16px;justify-content:center;font-size:11px">' +
                '<span><span style="display:inline-block;width:20px;height:8px;background:#00d4ff22;border:1px solid #00d4ff44;margin-right:4px"></span>10th-90th pct</span>' +
                '<span><span style="display:inline-block;width:20px;height:8px;background:#00d4ff44;margin-right:4px"></span>25th-75th pct</span>' +
                '<span><span style="display:inline-block;width:20px;height:2px;background:#00d4ff;margin-right:4px;vertical-align:middle"></span>Median</span></div></div>';

            rhtml += '<div class="sol-section"><div class="sol-section-title">📈 Outcome Distribution</div>' +
                '<div style="color:#aaa;font-size:13px;line-height:1.8">' +
                '<div>Probability of profit: <strong style="color:#00ff88">' + (r.finalValues.filter(function(v) { return v > r.capital; }).length / r.finalValues.length * 100).toFixed(0) + '%</strong></div>' +
                '<div>Probability of 2x: <strong style="color:#00d4ff">' + (r.finalValues.filter(function(v) { return v > r.capital * 2; }).length / r.finalValues.length * 100).toFixed(0) + '%</strong></div>' +
                '<div>Probability of loss >50%: <strong style="color:#ff4466">' + (r.finalValues.filter(function(v) { return v < r.capital * 0.5; }).length / r.finalValues.length * 100).toFixed(0) + '%</strong></div>' +
                '<div>Expected value: <strong>$' + r.mean.toFixed(0) + '</strong> (' + ((r.mean / r.capital - 1) * 100).toFixed(0) + '% return)</div></div></div>';

            document.getElementById('sim-results').innerHTML = rhtml;
        });
    }
};

SolutionsHub.registerSolution('portfolio-simulator', PortfolioSimulator, 'retail', {
    icon: '🎲', name: 'Portfolio Simulator', description: 'Monte Carlo simulation with 200 scenarios - visualize risk/reward probabilities'
});
