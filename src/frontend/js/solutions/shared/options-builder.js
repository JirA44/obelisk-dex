/* ============================================
   OPTIONS BUILDER - Visual options strategy builder
   ============================================ */

const OptionsBuilder = {
    legs: [],

    init() {
        try { this.legs = JSON.parse(localStorage.getItem('obelisk_options_legs') || '[]'); } catch(e) { this.legs = []; }
    },

    save() { localStorage.setItem('obelisk_options_legs', JSON.stringify(this.legs)); },

    getChainData() {
        var strikes = [90000, 92500, 95000, 97500, 100000, 102500, 105000, 107500, 110000];
        var spot = 97500;
        return strikes.map(function(k) {
            var otm = Math.abs(k - spot) / spot;
            var baseIV = 0.55 + otm * 0.8 + (k < spot ? 0.05 : 0);
            var callPrice = Math.max(0.001, (spot - k + spot * baseIV * 0.08) * (k <= spot ? 1 : 0.3));
            var putPrice = Math.max(0.001, (k - spot + spot * baseIV * 0.08) * (k >= spot ? 1 : 0.3));
            return {
                strike: k, callBid: Math.max(0, callPrice * 0.95).toFixed(0), callAsk: (callPrice * 1.05).toFixed(0),
                putBid: Math.max(0, putPrice * 0.95).toFixed(0), putAsk: (putPrice * 1.05).toFixed(0),
                iv: (baseIV * 100).toFixed(1), delta: ((spot - k) / spot + 0.5).toFixed(2),
                volume: Math.floor(Math.random() * 500 + 50), oi: Math.floor(Math.random() * 2000 + 200)
            };
        });
    },

    getPresets() {
        return [
            { name: 'Bull Call Spread', legs: [{ type: 'call', side: 'buy', strike: 97500 }, { type: 'call', side: 'sell', strike: 102500 }] },
            { name: 'Bear Put Spread', legs: [{ type: 'put', side: 'buy', strike: 97500 }, { type: 'put', side: 'sell', strike: 92500 }] },
            { name: 'Iron Condor', legs: [{ type: 'put', side: 'sell', strike: 92500 }, { type: 'put', side: 'buy', strike: 90000 }, { type: 'call', side: 'sell', strike: 105000 }, { type: 'call', side: 'buy', strike: 107500 }] },
            { name: 'Long Straddle', legs: [{ type: 'call', side: 'buy', strike: 97500 }, { type: 'put', side: 'buy', strike: 97500 }] },
            { name: 'Covered Call', legs: [{ type: 'spot', side: 'buy', strike: 97500 }, { type: 'call', side: 'sell', strike: 102500 }] }
        ];
    },

    renderPayoffSVG(legs, chain, width, height) {
        if (legs.length === 0) return '<div style="text-align:center;color:#555;padding:20px">Add legs to see payoff diagram</div>';
        var spot = 97500;
        var minStrike = 85000, maxStrike = 115000;
        var points = [];
        for (var price = minStrike; price <= maxStrike; price += 500) {
            var pnl = 0;
            legs.forEach(function(leg) {
                var mult = leg.side === 'buy' ? 1 : -1;
                var strike = leg.strike;
                var chainRow = chain.find(function(c) { return c.strike === strike; });
                if (!chainRow) return;
                if (leg.type === 'call') {
                    var premium = parseFloat(leg.side === 'buy' ? chainRow.callAsk : chainRow.callBid);
                    var payoff = Math.max(0, price - strike);
                    pnl += mult * (payoff - premium);
                } else if (leg.type === 'put') {
                    var premium = parseFloat(leg.side === 'buy' ? chainRow.putAsk : chainRow.putBid);
                    var payoff = Math.max(0, strike - price);
                    pnl += mult * (payoff - premium);
                } else if (leg.type === 'spot') {
                    pnl += mult * (price - spot);
                }
            });
            points.push({ price: price, pnl: pnl });
        }
        var minPnl = Math.min.apply(null, points.map(function(p) { return p.pnl; }));
        var maxPnl = Math.max.apply(null, points.map(function(p) { return p.pnl; }));
        var range = maxPnl - minPnl || 1;
        var svg = '<svg width="' + width + '" height="' + height + '">';
        var zeroY = height - 10 - ((0 - minPnl) / range) * (height - 20);
        svg += '<line x1="0" y1="' + zeroY + '" x2="' + width + '" y2="' + zeroY + '" stroke="#333" stroke-width="1" stroke-dasharray="4,4"/>';
        var pathD = '';
        points.forEach(function(p, i) {
            var x = ((p.price - minStrike) / (maxStrike - minStrike)) * width;
            var y = height - 10 - ((p.pnl - minPnl) / range) * (height - 20);
            pathD += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        svg += '<path d="' + pathD + '" fill="none" stroke="#00d4ff" stroke-width="2.5"/>';
        // Fill profit/loss areas
        var fillPath = pathD + ' L' + width + ',' + zeroY + ' L0,' + zeroY + ' Z';
        svg += '<path d="' + pathD + ' L' + width + ',' + zeroY + ' L0,' + zeroY + ' Z" fill="#00ff8811"/>';
        svg += '<text x="5" y="' + (zeroY - 4) + '" fill="#555" font-size="9">$0</text>';
        svg += '<text x="5" y="12" fill="#00ff88" font-size="9">+$' + (maxPnl / 1000).toFixed(1) + 'K</text>';
        svg += '<text x="5" y="' + (height - 2) + '" fill="#ff4466" font-size="9">-$' + (Math.abs(minPnl) / 1000).toFixed(1) + 'K</text>';
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var chain = this.getChainData();
        var presets = this.getPresets();
        var self = this;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">BTC</div><div class="sol-stat-label">Underlying</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$97,500</div><div class="sol-stat-label">Spot Price</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.legs.length + '</div><div class="sol-stat-label">Strategy Legs</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📋 Strategy Presets</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">';
        presets.forEach(function(p, i) {
            html += '<button class="sol-btn sol-btn-sm sol-btn-outline preset-btn" data-idx="' + i + '">' + p.name + '</button>';
        });
        html += '</div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📈 Payoff Diagram</div>' +
            '<div style="padding:10px 0">' + this.renderPayoffSVG(this.legs, chain, 580, 180) + '</div></div>';

        if (this.legs.length > 0) {
            html += '<div class="sol-section"><div class="sol-section-title">🦵 Strategy Legs</div>' +
                '<table class="sol-table"><thead><tr><th>Type</th><th>Side</th><th>Strike</th><th></th></tr></thead><tbody>';
            this.legs.forEach(function(leg, i) {
                var sideTag = leg.side === 'buy' ? 'sol-tag-green' : 'sol-tag-red';
                html += '<tr><td>' + leg.type.toUpperCase() + '</td>' +
                    '<td><span class="sol-tag ' + sideTag + '">' + leg.side.toUpperCase() + '</span></td>' +
                    '<td style="font-family:monospace">$' + leg.strike.toLocaleString() + '</td>' +
                    '<td><button class="sol-btn sol-btn-sm sol-btn-danger leg-remove" data-idx="' + i + '">Remove</button></td></tr>';
            });
            html += '</tbody></table>' +
                '<button class="sol-btn sol-btn-danger sol-btn-sm" id="opt-clear" style="margin-top:8px">Clear All</button></div>';
        }

        html += '<div class="sol-section"><div class="sol-section-title">📊 Options Chain (BTC)</div>' +
            '<table class="sol-table"><thead><tr><th>Call Bid</th><th>Call Ask</th><th>IV</th><th>Strike</th><th>Put Bid</th><th>Put Ask</th><th>OI</th></tr></thead><tbody>';
        chain.forEach(function(row) {
            var isATM = row.strike === 97500;
            var style = isATM ? 'background:rgba(0,212,255,0.05);font-weight:600' : '';
            html += '<tr style="' + style + '"><td style="font-family:monospace;color:#00ff88;cursor:pointer" class="chain-click" data-type="call" data-side="buy" data-strike="' + row.strike + '">' + row.callBid + '</td>' +
                '<td style="font-family:monospace;color:#00ff88;cursor:pointer" class="chain-click" data-type="call" data-side="sell" data-strike="' + row.strike + '">' + row.callAsk + '</td>' +
                '<td style="font-family:monospace;color:#888">' + row.iv + '%</td>' +
                '<td style="font-family:monospace;font-weight:700;color:' + (isATM ? '#00d4ff' : '#fff') + '">$' + row.strike.toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:#ff4466;cursor:pointer" class="chain-click" data-type="put" data-side="buy" data-strike="' + row.strike + '">' + row.putBid + '</td>' +
                '<td style="font-family:monospace;color:#ff4466;cursor:pointer" class="chain-click" data-type="put" data-side="sell" data-strike="' + row.strike + '">' + row.putAsk + '</td>' +
                '<td style="font-family:monospace;color:#555">' + row.oi + '</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;

        c.querySelectorAll('.preset-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.legs = JSON.parse(JSON.stringify(presets[parseInt(btn.dataset.idx)].legs));
                self.save();
                self.render('solution-body');
            });
        });
        c.querySelectorAll('.chain-click').forEach(function(td) {
            td.addEventListener('click', function() {
                self.legs.push({ type: td.dataset.type, side: td.dataset.side, strike: parseInt(td.dataset.strike) });
                self.save();
                self.render('solution-body');
            });
        });
        c.querySelectorAll('.leg-remove').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.legs.splice(parseInt(btn.dataset.idx), 1);
                self.save();
                self.render('solution-body');
            });
        });
        var clearBtn = c.querySelector('#opt-clear');
        if (clearBtn) clearBtn.addEventListener('click', function() {
            self.legs = [];
            self.save();
            self.render('solution-body');
        });
    }
};

SolutionsHub.registerSolution('options-builder', OptionsBuilder, 'shared', {
    icon: '🎯', name: 'Options Builder', description: 'Visual options strategy builder with payoff diagrams and preset strategies'
});
