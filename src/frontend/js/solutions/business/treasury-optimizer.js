/* ============================================
   TREASURY OPTIMIZER - Optimize idle treasury
   ============================================ */

const TreasuryOptimizer = {
    allocations: [],

    init() {
        try { this.allocations = JSON.parse(localStorage.getItem('obelisk_treasury_alloc') || '[]'); } catch(e) { this.allocations = []; }
        if (this.allocations.length === 0) {
            this.allocations = [
                { asset: 'USDC', amount: 250000, strategy: 'money-market', apy: 4.8, protocol: 'Aave V3', risk: 'Low' },
                { asset: 'USDT', amount: 150000, strategy: 'lending', apy: 5.2, protocol: 'Compound', risk: 'Low' },
                { asset: 'ETH', amount: 80, strategy: 'liquid-staking', apy: 3.6, protocol: 'Lido', risk: 'Low' },
                { asset: 'DAI', amount: 100000, strategy: 'vault', apy: 6.1, protocol: 'Yearn V3', risk: 'Medium' }
            ];
        }
    },

    save() { localStorage.setItem('obelisk_treasury_alloc', JSON.stringify(this.allocations)); },

    getOpportunities() {
        return [
            { protocol: 'Aave V3', asset: 'USDC', apy: 4.8, tvl: '$12.4B', risk: 'Low', chain: 'Ethereum', type: 'Lending' },
            { protocol: 'Compound V3', asset: 'USDC', apy: 5.2, tvl: '$3.1B', risk: 'Low', chain: 'Ethereum', type: 'Lending' },
            { protocol: 'Morpho Blue', asset: 'USDC', apy: 6.8, tvl: '$1.8B', risk: 'Medium', chain: 'Ethereum', type: 'Lending' },
            { protocol: 'Lido', asset: 'ETH', apy: 3.6, tvl: '$22B', risk: 'Low', chain: 'Ethereum', type: 'Staking' },
            { protocol: 'Rocket Pool', asset: 'ETH', apy: 3.4, tvl: '$4.2B', risk: 'Low', chain: 'Ethereum', type: 'Staking' },
            { protocol: 'Yearn V3', asset: 'DAI', apy: 6.1, tvl: '$890M', risk: 'Medium', chain: 'Ethereum', type: 'Vault' },
            { protocol: 'Pendle', asset: 'stETH', apy: 8.5, tvl: '$2.1B', risk: 'Medium', chain: 'Ethereum', type: 'Yield Trading' },
            { protocol: 'Ethena', asset: 'USDe', apy: 12.3, tvl: '$3.5B', risk: 'High', chain: 'Ethereum', type: 'Synthetic' },
            { protocol: 'Maker DSR', asset: 'DAI', apy: 5.0, tvl: '$5.8B', risk: 'Low', chain: 'Ethereum', type: 'Savings' },
            { protocol: 'Convex', asset: 'CRV LP', apy: 9.2, tvl: '$1.2B', risk: 'Medium', chain: 'Ethereum', type: 'LP Farming' }
        ];
    },

    computeStats() {
        var prices = { USDC: 1, USDT: 1, DAI: 1, ETH: 3400, USDe: 1, stETH: 3400 };
        var totalValue = 0, weightedApy = 0;
        this.allocations.forEach(function(a) {
            var val = a.amount * (prices[a.asset] || 1);
            totalValue += val;
            weightedApy += val * a.apy;
        });
        var avgApy = totalValue > 0 ? weightedApy / totalValue : 0;
        var annualYield = totalValue * avgApy / 100;
        return { totalValue: totalValue, avgApy: avgApy, annualYield: annualYield, dailyYield: annualYield / 365 };
    },

    renderDonut(allocations, size) {
        var prices = { USDC: 1, USDT: 1, DAI: 1, ETH: 3400, USDe: 1, stETH: 3400 };
        var total = 0;
        allocations.forEach(function(a) { total += a.amount * (prices[a.asset] || 1); });
        if (total === 0) return '<svg width="' + size + '" height="' + size + '"><text x="' + (size/2) + '" y="' + (size/2) + '" text-anchor="middle" fill="#555" font-size="12">No data</text></svg>';
        var colors = ['#00ff88', '#00d4ff', '#c9a227', '#ff8844', '#ff4466', '#88cc44'];
        var cx = size / 2, cy = size / 2, r = size * 0.35;
        var svg = '<svg width="' + size + '" height="' + size + '">';
        var angle = -Math.PI / 2;
        allocations.forEach(function(a, i) {
            var val = a.amount * (prices[a.asset] || 1);
            var pct = val / total;
            var sweep = pct * Math.PI * 2;
            var x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
            angle += sweep;
            var x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
            var large = sweep > Math.PI ? 1 : 0;
            svg += '<path d="M' + cx + ',' + cy + ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + r + ',' + r + ' 0 ' + large + ',1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z" fill="' + colors[i % colors.length] + '" opacity="0.8"/>';
        });
        svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.55) + '" fill="#0a0a0a"/>';
        svg += '<text x="' + cx + '" y="' + (cy - 5) + '" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">$' + (total / 1000).toFixed(0) + 'K</text>';
        svg += '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" fill="#888" font-size="10">Treasury</text>';
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var stats = this.computeStats();
        var opps = this.getOpportunities();
        var self = this;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + stats.totalValue.toLocaleString() + '</div><div class="sol-stat-label">Treasury Value</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + stats.avgApy.toFixed(1) + '%</div><div class="sol-stat-label">Weighted APY</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + stats.annualYield.toFixed(0) + '</div><div class="sol-stat-label">Annual Yield</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$' + stats.dailyYield.toFixed(0) + '/day</div><div class="sol-stat-label">Daily Yield</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Current Allocation</div>' +
            '<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap"><div>' + this.renderDonut(this.allocations, 180) + '</div><div style="flex:1">';
        var colors = ['#00ff88', '#00d4ff', '#c9a227', '#ff8844'];
        this.allocations.forEach(function(a, i) {
            html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #111">' +
                '<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + colors[i % 4] + ';margin-right:8px"></span>' + a.asset + ' (' + a.protocol + ')</span>' +
                '<span style="font-family:monospace;color:#00ff88">' + a.apy + '% APY</span></div>';
        });
        html += '</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🔍 Yield Opportunities</div>' +
            '<table class="sol-table"><thead><tr><th>Protocol</th><th>Asset</th><th>APY</th><th>TVL</th><th>Risk</th><th>Type</th><th></th></tr></thead><tbody>';
        opps.forEach(function(o) {
            var riskColor = o.risk === 'Low' ? '#00ff88' : o.risk === 'Medium' ? '#c9a227' : '#ff4466';
            html += '<tr><td><strong>' + o.protocol + '</strong></td><td>' + o.asset + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">' + o.apy + '%</td>' +
                '<td style="color:#888">' + o.tvl + '</td>' +
                '<td style="color:' + riskColor + '">' + o.risk + '</td>' +
                '<td><span class="sol-tag sol-tag-blue">' + o.type + '</span></td>' +
                '<td><button class="sol-btn sol-btn-sm sol-btn-primary alloc-btn" data-protocol="' + o.protocol + '" data-asset="' + o.asset + '" data-apy="' + o.apy + '" data-risk="' + o.risk + '">Allocate</button></td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
        c.querySelectorAll('.alloc-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Allocation request sent to ' + btn.dataset.protocol);
            });
        });
    }
};

SolutionsHub.registerSolution('treasury-optimizer', TreasuryOptimizer, 'business', {
    icon: '🏦', name: 'Treasury Optimizer', description: 'Maximize yield on idle treasury with automated allocation strategies'
});
