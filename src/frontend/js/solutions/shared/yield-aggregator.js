/* ============================================
   YIELD AGGREGATOR - Auto-compound best yields
   ============================================ */

const YieldAggregator = {
    vaults: [],

    init() {
        try { this.vaults = JSON.parse(localStorage.getItem('obelisk_yield_vaults') || '[]'); } catch(e) { this.vaults = []; }
    },

    save() { localStorage.setItem('obelisk_yield_vaults', JSON.stringify(this.vaults)); },

    getVaults() {
        return [
            { id: 'yv1', name: 'Stablecoin Max', asset: 'USDC', protocol: 'Multi', apy: 8.2, apyBase: 5.1, apyReward: 3.1, tvl: '$42M', strategy: 'Aave→Morpho rotation', risk: 'Low', autoCompound: true, chain: 'Ethereum' },
            { id: 'yv2', name: 'ETH Yield', asset: 'ETH', protocol: 'Multi', apy: 5.8, apyBase: 3.6, apyReward: 2.2, tvl: '$28M', strategy: 'Lido stETH + Pendle PT', risk: 'Low', autoCompound: true, chain: 'Ethereum' },
            { id: 'yv3', name: 'BTC Earn', asset: 'WBTC', protocol: 'Multi', apy: 3.2, apyBase: 1.8, apyReward: 1.4, tvl: '$15M', strategy: 'Aave lending + CRV rewards', risk: 'Low', autoCompound: true, chain: 'Ethereum' },
            { id: 'yv4', name: 'DeFi Alpha', asset: 'Mixed', protocol: 'Multi', apy: 18.5, apyBase: 8.2, apyReward: 10.3, tvl: '$8.5M', strategy: 'Concentrated LP + farming', risk: 'Medium', autoCompound: true, chain: 'Arbitrum' },
            { id: 'yv5', name: 'Delta Neutral', asset: 'USDC', protocol: 'Multi', apy: 25.4, apyBase: 12.0, apyReward: 13.4, tvl: '$5.2M', strategy: 'Ethena sUSDe + hedge', risk: 'Medium', autoCompound: true, chain: 'Ethereum' },
            { id: 'yv6', name: 'SOL Turbo', asset: 'SOL', protocol: 'Multi', apy: 12.8, apyBase: 7.5, apyReward: 5.3, tvl: '$18M', strategy: 'mSOL + Marinade rewards', risk: 'Low', autoCompound: true, chain: 'Solana' },
            { id: 'yv7', name: 'Leverage Farm', asset: 'ETH', protocol: 'Multi', apy: 35.2, apyBase: 15.0, apyReward: 20.2, tvl: '$3.1M', strategy: 'Recursive Aave + loop', risk: 'High', autoCompound: true, chain: 'Arbitrum' },
            { id: 'yv8', name: 'RWA Yield', asset: 'USDC', protocol: 'Multi', apy: 6.5, apyBase: 6.5, apyReward: 0, tvl: '$120M', strategy: 'Tokenized T-bills', risk: 'Very Low', autoCompound: false, chain: 'Ethereum' }
        ];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var vaults = this.getVaults();
        var self = this;
        var totalTvl = 0;
        vaults.forEach(function(v) { totalTvl += parseFloat(v.tvl.replace(/[$MBK,]/g, '')) * (v.tvl.includes('B') ? 1000 : 1); });
        var bestApy = Math.max.apply(null, vaults.map(function(v) { return v.apy; }));
        var deposited = this.vaults.length;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + bestApy + '%</div><div class="sol-stat-label">Best APY</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + vaults.length + '</div><div class="sol-stat-label">Active Vaults</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$' + totalTvl.toFixed(0) + 'M</div><div class="sol-stat-label">Total TVL</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + deposited + '</div><div class="sol-stat-label">Your Deposits</div></div></div>';

        var filters = ['All', 'Low Risk', 'Medium Risk', 'High Yield'];
        html += '<div style="display:flex;gap:8px;margin-bottom:16px">';
        filters.forEach(function(f, i) {
            html += '<button class="sol-btn sol-btn-sm ' + (i === 0 ? 'sol-btn-primary' : 'sol-btn-outline') + '">' + f + '</button>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">🏦 Yield Vaults</div>';
        vaults.forEach(function(v) {
            var riskColor = v.risk === 'Very Low' ? '#00ff88' : v.risk === 'Low' ? '#00ff88' : v.risk === 'Medium' ? '#c9a227' : '#ff4466';
            var isDeposited = self.vaults.includes(v.id);
            html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:10px;' + (isDeposited ? 'border-color:#00ff8833;background:rgba(0,255,136,0.02)' : '') + '">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
                '<div><strong style="color:#fff;font-size:15px">' + v.name + '</strong>' +
                '<div style="font-size:11px;color:#555">' + v.strategy + ' | ' + v.chain + '</div></div>' +
                '<div style="text-align:right"><div style="font-family:monospace;color:#00ff88;font-size:20px;font-weight:700">' + v.apy + '% <span style="font-size:11px;color:#888">APY</span></div></div></div>';

            html += '<div class="sol-stats-row" style="margin-bottom:8px">' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:13px">' + v.asset + '</div><div class="sol-stat-label">Asset</div></div>' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:13px;color:#00d4ff">' + v.apyBase + '%</div><div class="sol-stat-label">Base APY</div></div>' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:13px;color:#c9a227">' + v.apyReward + '%</div><div class="sol-stat-label">Reward APY</div></div>' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:13px">' + v.tvl + '</div><div class="sol-stat-label">TVL</div></div>' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:13px;color:' + riskColor + '">' + v.risk + '</div><div class="sol-stat-label">Risk</div></div></div>';

            html += '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<div style="display:flex;gap:6px">' +
                (v.autoCompound ? '<span class="sol-tag sol-tag-green" style="font-size:10px">Auto-Compound</span>' : '') +
                '</div>' +
                '<button class="sol-btn sol-btn-sm ' + (isDeposited ? 'sol-btn-danger' : 'sol-btn-primary') + ' yv-deposit" data-id="' + v.id + '">' + (isDeposited ? 'Withdraw' : 'Deposit') + '</button></div></div>';
        });
        html += '</div>';

        c.innerHTML = html;
        c.querySelectorAll('.yv-deposit').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = btn.dataset.id;
                if (self.vaults.includes(id)) {
                    self.vaults = self.vaults.filter(function(v) { return v !== id; });
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.info('Withdrawn from vault');
                } else {
                    self.vaults.push(id);
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Deposited into vault');
                }
                self.save();
                self.render('solution-body');
            });
        });
    }
};

SolutionsHub.registerSolution('yield-aggregator', YieldAggregator, 'shared', {
    icon: '🌾', name: 'Yield Aggregator', description: 'Auto-compounding vaults with optimized DeFi yield strategies across protocols'
});
