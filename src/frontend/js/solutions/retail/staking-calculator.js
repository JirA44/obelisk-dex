/* ============================================
   STAKING CALCULATOR - Compare staking rewards
   ============================================ */

const StakingCalculator = {
    amount: 10000,
    duration: 12,

    init() {
        try {
            var s = JSON.parse(localStorage.getItem('obelisk_stk_calc') || '{}');
            if (s.amount) this.amount = s.amount;
            if (s.duration) this.duration = s.duration;
        } catch(e) {}
    },

    save() { localStorage.setItem('obelisk_stk_calc', JSON.stringify({ amount: this.amount, duration: this.duration })); },

    getStakingOptions() {
        return [
            { asset: 'ETH', protocol: 'Lido (stETH)', apy: 3.6, minStake: 0, lockup: 'None', risk: 'Low', chain: 'Ethereum', type: 'Liquid', validator: false },
            { asset: 'ETH', protocol: 'Rocket Pool', apy: 3.4, minStake: 0.01, lockup: 'None', risk: 'Low', chain: 'Ethereum', type: 'Liquid', validator: false },
            { asset: 'ETH', protocol: 'Coinbase cbETH', apy: 3.2, minStake: 0, lockup: 'None', risk: 'Low', chain: 'Ethereum', type: 'Liquid', validator: false },
            { asset: 'ETH', protocol: 'Native Staking', apy: 3.8, minStake: 32, lockup: 'Variable', risk: 'Low', chain: 'Ethereum', type: 'Native', validator: true },
            { asset: 'SOL', protocol: 'Marinade', apy: 6.8, minStake: 0.01, lockup: 'None', risk: 'Low', chain: 'Solana', type: 'Liquid', validator: false },
            { asset: 'SOL', protocol: 'Jito', apy: 7.2, minStake: 0.01, lockup: 'None', risk: 'Low', chain: 'Solana', type: 'Liquid + MEV', validator: false },
            { asset: 'SOL', protocol: 'Native Staking', apy: 6.5, minStake: 1, lockup: '~2 days', risk: 'Low', chain: 'Solana', type: 'Native', validator: true },
            { asset: 'AVAX', protocol: 'BenQi sAVAX', apy: 5.4, minStake: 0, lockup: 'None', risk: 'Low', chain: 'Avalanche', type: 'Liquid', validator: false },
            { asset: 'ATOM', protocol: 'Cosmos Hub', apy: 14.2, minStake: 0.01, lockup: '21 days', risk: 'Medium', chain: 'Cosmos', type: 'Native', validator: true },
            { asset: 'DOT', protocol: 'Polkadot', apy: 12.0, minStake: 10, lockup: '28 days', risk: 'Medium', chain: 'Polkadot', type: 'Native', validator: true },
            { asset: 'ADA', protocol: 'Cardano', apy: 3.5, minStake: 2, lockup: 'None', risk: 'Low', chain: 'Cardano', type: 'Native', validator: true },
            { asset: 'NEAR', protocol: 'Meta Pool', apy: 8.5, minStake: 0.01, lockup: 'None', risk: 'Low', chain: 'Near', type: 'Liquid', validator: false },
            { asset: 'TIA', protocol: 'Milky Way', apy: 9.8, minStake: 0.01, lockup: 'None', risk: 'Medium', chain: 'Celestia', type: 'Liquid', validator: false },
            { asset: 'MATIC', protocol: 'Lido stMATIC', apy: 4.8, minStake: 0, lockup: 'None', risk: 'Low', chain: 'Polygon', type: 'Liquid', validator: false }
        ];
    },

    calcRewards(principal, apy, months, compound) {
        if (compound) {
            var periods = months;
            var rate = apy / 100 / 12;
            var final_ = principal * Math.pow(1 + rate, periods);
            return { finalValue: final_, rewards: final_ - principal, effectiveApy: ((final_ / principal) - 1) * (12 / months) * 100 };
        }
        var rewards = principal * (apy / 100) * (months / 12);
        return { finalValue: principal + rewards, rewards: rewards, effectiveApy: apy };
    },

    renderComparisonChart(options, amount, months, w, h) {
        var padL = 100, padR = 50, padT = 15, padB = 5;
        var chartW = w - padL - padR;
        var barH = Math.min(22, (h / options.length) - 4);
        var maxReward = 1;
        var self = this;
        options.forEach(function(o) {
            var r = self.calcRewards(amount, o.apy, months, true);
            if (r.rewards > maxReward) maxReward = r.rewards;
        });

        var svg = '<svg width="' + w + '" height="' + h + '">';
        options.forEach(function(o, i) {
            var y = padT + i * (barH + 4);
            var r = self.calcRewards(amount, o.apy, months, true);
            var barW = (r.rewards / maxReward) * chartW;
            var color = o.apy >= 8 ? '#00ff88' : o.apy >= 5 ? '#c9a227' : '#00d4ff';
            svg += '<rect x="' + padL + '" y="' + y + '" width="' + Math.max(2, barW) + '" height="' + barH + '" fill="' + color + '" opacity="0.6" rx="3"/>';
            svg += '<text x="' + (padL - 5) + '" y="' + (y + barH / 2 + 4) + '" text-anchor="end" fill="#aaa" font-size="10">' + o.asset + ' ' + o.protocol.split(' ')[0] + '</text>';
            svg += '<text x="' + (padL + barW + 5) + '" y="' + (y + barH / 2 + 3) + '" fill="' + color + '" font-size="10" font-weight="600">$' + r.rewards.toFixed(0) + ' (' + o.apy + '%)</text>';
        });
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var options = this.getStakingOptions();

        // Best options
        var sortedByApy = options.slice().sort(function(a, b) { return b.apy - a.apy; });
        var best = sortedByApy[0];
        var bestLiquid = sortedByApy.filter(function(o) { return o.type.indexOf('Liquid') >= 0; })[0];
        var bestEth = options.filter(function(o) { return o.asset === 'ETH'; }).sort(function(a, b) { return b.apy - a.apy; })[0];

        var html = '<div class="sol-section" style="margin-bottom:12px"><div class="sol-section-title">⚙️ Settings</div>' +
            '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:end">' +
            '<div><label style="color:#888;font-size:11px;display:block;margin-bottom:2px">Amount ($)</label>' +
            '<input type="number" id="stk-amount" value="' + this.amount + '" step="100" min="10" style="width:120px;padding:6px 8px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-family:monospace;font-size:13px"/></div>' +
            '<div><label style="color:#888;font-size:11px;display:block;margin-bottom:2px">Duration (months)</label>' +
            '<input type="number" id="stk-dur" value="' + this.duration + '" step="1" min="1" max="120" style="width:80px;padding:6px 8px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-family:monospace;font-size:13px"/></div>' +
            '<button class="sol-btn sol-btn-primary" id="stk-calc">Calculate</button></div></div>';

        var r = this.calcRewards(this.amount, best.apy, this.duration, true);
        html += '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + r.rewards.toFixed(0) + '</div><div class="sol-stat-label">Best Reward (' + best.asset + ')</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + best.apy + '%</div><div class="sol-stat-label">Best APY</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + options.length + '</div><div class="sol-stat-label">Options</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + (bestLiquid ? bestLiquid.apy : 0) + '%</div><div class="sol-stat-label">Best Liquid</div></div></div>';

        // Comparison chart
        html += '<div class="sol-section"><div class="sol-section-title">📊 Rewards Comparison (' + this.duration + ' months, $' + this.amount.toLocaleString() + ')</div>' +
            '<div style="overflow-x:auto">' + this.renderComparisonChart(sortedByApy.slice(0, 10), this.amount, this.duration, 600, sortedByApy.slice(0, 10).length * 26 + 20) + '</div></div>';

        // Full table
        html += '<div class="sol-section"><div class="sol-section-title">📋 All Options</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Protocol</th><th>APY</th><th>Reward (' + this.duration + 'm)</th><th>Type</th><th>Lockup</th><th>Risk</th><th>Chain</th></tr></thead><tbody>';
        sortedByApy.forEach(function(o) {
            var rewards = self.calcRewards(self.amount, o.apy, self.duration, true);
            var riskColor = o.risk === 'Low' ? '#00ff88' : o.risk === 'Medium' ? '#c9a227' : '#ff4466';
            html += '<tr><td><strong>' + o.asset + '</strong></td>' +
                '<td>' + o.protocol + '</td>' +
                '<td style="font-family:monospace;color:#00ff88;font-weight:600">' + o.apy + '%</td>' +
                '<td style="font-family:monospace;color:#c9a227">+$' + rewards.rewards.toFixed(0) + '</td>' +
                '<td><span class="sol-tag sol-tag-blue" style="font-size:10px">' + o.type + '</span></td>' +
                '<td style="color:#888;font-size:11px">' + o.lockup + '</td>' +
                '<td style="color:' + riskColor + ';font-size:11px">' + o.risk + '</td>' +
                '<td style="color:#555;font-size:11px">' + o.chain + '</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;

        c.querySelector('#stk-calc').addEventListener('click', function() {
            var amt = parseFloat(c.querySelector('#stk-amount').value);
            var dur = parseInt(c.querySelector('#stk-dur').value);
            if (!isNaN(amt) && amt > 0) self.amount = amt;
            if (!isNaN(dur) && dur > 0) self.duration = dur;
            self.save();
            self.render(containerId);
        });
    }
};

SolutionsHub.registerSolution('staking-calculator', StakingCalculator, 'retail', {
    icon: '🥩', name: 'Staking Calculator', description: 'Compare staking rewards across protocols with compound interest projection'
});
