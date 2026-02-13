/* ============================================
   PORTFOLIO REBALANCER - Auto-rebalance tool
   Define target allocations, get trade suggestions
   ============================================ */

const PortfolioRebalancer = {
    targets: [],

    init() {
        try { this.targets = JSON.parse(localStorage.getItem('obelisk_rebalance_targets') || '[]'); } catch(e) { this.targets = []; }
        if (this.targets.length === 0) {
            this.targets = [
                { asset: 'BTC', targetPct: 40 }, { asset: 'ETH', targetPct: 30 },
                { asset: 'SOL', targetPct: 15 }, { asset: 'USDC', targetPct: 15 }
            ];
        }
    },

    save() { localStorage.setItem('obelisk_rebalance_targets', JSON.stringify(this.targets)); },

    getPrices() {
        if (typeof ObeliskApp !== 'undefined' && ObeliskApp.state && ObeliskApp.state.prices) return ObeliskApp.state.prices;
        return { BTC: 97500, ETH: 3400, SOL: 190, USDC: 1, AVAX: 35, LINK: 22, ARB: 1.8 };
    },

    computeRebalance(totalValue) {
        var prices = this.getPrices();
        var trades = [];
        var self = this;
        this.targets.forEach(function(t) {
            var targetValue = (t.targetPct / 100) * totalValue;
            var currentValue = (t.currentPct != null ? t.currentPct : t.targetPct) / 100 * totalValue;
            var diff = targetValue - currentValue;
            var price = prices[t.asset] || 1;
            if (Math.abs(diff) > 1) {
                trades.push({
                    asset: t.asset, side: diff > 0 ? 'BUY' : 'SELL',
                    amount: Math.abs(diff / price), valueUsd: Math.abs(diff),
                    fromPct: (t.currentPct != null ? t.currentPct : t.targetPct), toPct: t.targetPct
                });
            }
        });
        return trades;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var prices = this.getPrices();
        var totalValue = parseFloat(localStorage.getItem('obelisk_sim_balance') || '10000');

        // Simulate current allocations (drifted from target)
        var self = this;
        this.targets.forEach(function(t) {
            t.currentPct = Math.max(0, t.targetPct + (Math.random() - 0.5) * 15);
        });
        var totalPct = this.targets.reduce(function(s, t) { return s + t.currentPct; }, 0);
        this.targets.forEach(function(t) { t.currentPct = (t.currentPct / totalPct) * 100; });

        var trades = this.computeRebalance(totalValue);
        var drifts = this.targets.map(function(t) { return Math.abs(t.currentPct - t.targetPct); });
        var maxDrift = drifts.length > 0 ? Math.max.apply(null, drifts) : 0;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + totalValue.toLocaleString() + '</div><div class="sol-stat-label">Portfolio Value</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (maxDrift > 5 ? 'red' : 'green') + '">' + maxDrift.toFixed(1) + '%</div><div class="sol-stat-label">Max Drift</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + trades.length + '</div><div class="sol-stat-label">Trades Needed</div></div></div>';

        // Target allocation editor
        html += '<div class="sol-section"><div class="sol-section-title">🎯 Target Allocation</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Target %</th><th>Current %</th><th>Drift</th><th>Target Value</th></tr></thead><tbody>';
        this.targets.forEach(function(t) {
            var drift = t.currentPct - t.targetPct;
            var driftColor = Math.abs(drift) > 5 ? '#ff4466' : Math.abs(drift) > 2 ? '#c9a227' : '#00ff88';
            var targetVal = (t.targetPct / 100) * totalValue;
            html += '<tr><td><strong>' + t.asset + '</strong></td>' +
                '<td style="font-family:monospace;color:#00d4ff">' + t.targetPct + '%</td>' +
                '<td style="font-family:monospace">' + t.currentPct.toFixed(1) + '%</td>' +
                '<td style="font-family:monospace;color:' + driftColor + '">' + (drift >= 0 ? '+' : '') + drift.toFixed(1) + '%</td>' +
                '<td style="font-family:monospace;color:#888">$' + targetVal.toFixed(0) + '</td></tr>';
        });
        html += '</tbody></table></div>';

        // Suggested trades
        html += '<div class="sol-section"><div class="sol-section-title">📋 Rebalance Trades</div>';
        if (trades.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-icon">✅</div><div class="sol-empty-text">Portfolio is balanced! No trades needed.</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Action</th><th>Asset</th><th>Amount</th><th>Value</th><th>Allocation Change</th></tr></thead><tbody>';
            trades.forEach(function(t) {
                var sideTag = t.side === 'BUY' ? 'sol-tag-green' : 'sol-tag-red';
                html += '<tr><td><span class="sol-tag ' + sideTag + '">' + t.side + '</span></td>' +
                    '<td><strong>' + t.asset + '</strong></td>' +
                    '<td style="font-family:monospace">' + t.amount.toFixed(4) + '</td>' +
                    '<td style="font-family:monospace">$' + t.valueUsd.toFixed(2) + '</td>' +
                    '<td style="font-family:monospace;color:#888">' + t.fromPct.toFixed(1) + '% → ' + t.toPct + '%</td></tr>';
            });
            html += '</tbody></table>';
            html += '<div style="text-align:center;margin-top:16px"><button class="sol-btn sol-btn-primary" id="rebal-exec">Execute Rebalance</button></div>';
        }
        html += '</div>';

        c.innerHTML = html;
        var execBtn = c.querySelector('#rebal-exec');
        if (execBtn) execBtn.addEventListener('click', function() {
            if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Rebalance executed! Portfolio aligned to targets.');
            self.targets.forEach(function(t) { t.currentPct = t.targetPct; });
            self.render('solution-body');
        });
    }
};

SolutionsHub.registerSolution('portfolio-rebalancer', PortfolioRebalancer, 'retail', {
    icon: '⚖️', name: 'Portfolio Rebalancer', description: 'Define target allocations and get automated rebalancing suggestions'
});
