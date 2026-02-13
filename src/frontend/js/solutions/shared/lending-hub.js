/* ============================================
   LENDING HUB - Borrow & Lend aggregator
   ============================================ */

const LendingHub = {
    positions: [],

    init() {
        try { this.positions = JSON.parse(localStorage.getItem('obelisk_lending') || '[]'); } catch(e) { this.positions = []; }
    },

    save() { localStorage.setItem('obelisk_lending', JSON.stringify(this.positions)); },

    getProtocols() {
        return [
            { name: 'Aave V3', chain: 'Ethereum', tvl: '$12.4B', markets: [
                { asset: 'USDC', supplyApy: 4.8, borrowApy: 5.9, available: '$2.1B', ltv: 80 },
                { asset: 'ETH', supplyApy: 2.1, borrowApy: 3.2, available: '$4.5B', ltv: 82.5 },
                { asset: 'WBTC', supplyApy: 0.8, borrowApy: 1.5, available: '$1.8B', ltv: 73 }
            ]},
            { name: 'Compound V3', chain: 'Ethereum', tvl: '$3.1B', markets: [
                { asset: 'USDC', supplyApy: 5.2, borrowApy: 6.1, available: '$890M', ltv: 78 },
                { asset: 'ETH', supplyApy: 1.9, borrowApy: 2.8, available: '$1.2B', ltv: 80 }
            ]},
            { name: 'Morpho Blue', chain: 'Ethereum', tvl: '$1.8B', markets: [
                { asset: 'USDC', supplyApy: 6.8, borrowApy: 7.5, available: '$450M', ltv: 86 },
                { asset: 'DAI', supplyApy: 5.5, borrowApy: 6.2, available: '$320M', ltv: 80 }
            ]},
            { name: 'Radiant V2', chain: 'Arbitrum', tvl: '$520M', markets: [
                { asset: 'USDC', supplyApy: 7.2, borrowApy: 8.1, available: '$180M', ltv: 75 },
                { asset: 'ETH', supplyApy: 3.5, borrowApy: 4.8, available: '$120M', ltv: 78 }
            ]}
        ];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var protocols = this.getProtocols();
        var self = this;

        var allMarkets = [];
        protocols.forEach(function(p) {
            p.markets.forEach(function(m) {
                allMarkets.push({ protocol: p.name, chain: p.chain, asset: m.asset, supplyApy: m.supplyApy, borrowApy: m.borrowApy, available: m.available, ltv: m.ltv });
            });
        });

        var bestSupply = allMarkets.reduce(function(best, m) { return m.supplyApy > best.supplyApy ? m : best; }, allMarkets[0]);
        var bestBorrow = allMarkets.reduce(function(best, m) { return m.borrowApy < best.borrowApy ? m : best; }, allMarkets[0]);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + protocols.length + '</div><div class="sol-stat-label">Protocols</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + bestSupply.supplyApy + '% on ' + bestSupply.asset + '</div><div class="sol-stat-label">Best Supply APY</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + bestBorrow.borrowApy + '% on ' + bestBorrow.asset + '</div><div class="sol-stat-label">Cheapest Borrow</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.positions.length + '</div><div class="sol-stat-label">Your Positions</div></div></div>';

        html += '<div style="display:flex;gap:8px;margin-bottom:16px"><button class="sol-btn sol-btn-sm sol-btn-primary lh-tab active" data-tab="supply">Supply</button>' +
            '<button class="sol-btn sol-btn-sm sol-btn-outline lh-tab" data-tab="borrow">Borrow</button>' +
            '<button class="sol-btn sol-btn-sm sol-btn-outline lh-tab" data-tab="compare">Compare All</button></div>';

        // Supply view
        html += '<div id="lh-supply" class="sol-section"><div class="sol-section-title">💰 Best Supply Rates</div>' +
            '<table class="sol-table"><thead><tr><th>Protocol</th><th>Asset</th><th>Supply APY</th><th>Available</th><th>LTV</th><th></th></tr></thead><tbody>';
        allMarkets.sort(function(a, b) { return b.supplyApy - a.supplyApy; });
        allMarkets.forEach(function(m) {
            html += '<tr><td><strong>' + m.protocol + '</strong><div style="font-size:10px;color:#555">' + m.chain + '</div></td>' +
                '<td>' + m.asset + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">' + m.supplyApy + '%</td>' +
                '<td style="font-family:monospace;color:#888">' + m.available + '</td>' +
                '<td style="font-family:monospace">' + m.ltv + '%</td>' +
                '<td><button class="sol-btn sol-btn-sm sol-btn-primary lh-supply-btn">Supply</button></td></tr>';
        });
        html += '</tbody></table></div>';

        // Borrow view
        html += '<div id="lh-borrow" class="sol-section" style="display:none"><div class="sol-section-title">🏦 Best Borrow Rates</div>' +
            '<table class="sol-table"><thead><tr><th>Protocol</th><th>Asset</th><th>Borrow APY</th><th>Available</th><th>LTV</th><th></th></tr></thead><tbody>';
        allMarkets.sort(function(a, b) { return a.borrowApy - b.borrowApy; });
        allMarkets.forEach(function(m) {
            html += '<tr><td><strong>' + m.protocol + '</strong><div style="font-size:10px;color:#555">' + m.chain + '</div></td>' +
                '<td>' + m.asset + '</td>' +
                '<td style="font-family:monospace;color:#ff8844">' + m.borrowApy + '%</td>' +
                '<td style="font-family:monospace;color:#888">' + m.available + '</td>' +
                '<td style="font-family:monospace">' + m.ltv + '%</td>' +
                '<td><button class="sol-btn sol-btn-sm sol-btn-outline">Borrow</button></td></tr>';
        });
        html += '</tbody></table></div>';

        // Compare view
        html += '<div id="lh-compare" class="sol-section" style="display:none"><div class="sol-section-title">📊 Rate Comparison</div>';
        var assets = ['USDC', 'ETH'];
        assets.forEach(function(asset) {
            html += '<div style="margin-bottom:16px"><strong style="color:#fff">' + asset + '</strong>';
            var assetMarkets = allMarkets.filter(function(m) { return m.asset === asset; });
            assetMarkets.forEach(function(m) {
                html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #111">' +
                    '<span style="color:#888">' + m.protocol + '</span>' +
                    '<div><span style="color:#00ff88;font-family:monospace;margin-right:16px">Supply: ' + m.supplyApy + '%</span>' +
                    '<span style="color:#ff8844;font-family:monospace">Borrow: ' + m.borrowApy + '%</span></div></div>';
            });
            html += '</div>';
        });
        html += '</div>';

        c.innerHTML = html;
        c.querySelectorAll('.lh-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                c.querySelectorAll('.lh-tab').forEach(function(b) { b.classList.remove('sol-btn-primary'); b.classList.add('sol-btn-outline'); });
                btn.classList.remove('sol-btn-outline'); btn.classList.add('sol-btn-primary');
                var tab = btn.dataset.tab;
                ['supply', 'borrow', 'compare'].forEach(function(t) {
                    var el = document.getElementById('lh-' + t);
                    if (el) el.style.display = t === tab ? '' : 'none';
                });
            });
        });
        c.querySelectorAll('.lh-supply-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Supply position opened');
            });
        });
    }
};

SolutionsHub.registerSolution('lending-hub', LendingHub, 'shared', {
    icon: '🏦', name: 'Lending Hub', description: 'Aggregated lending rates across protocols - find the best supply and borrow APYs'
});
