/* ============================================
   TOKEN SCREENER - Filter & discover tokens
   ============================================ */

const TokenScreener = {
    init() {},

    getTokens() {
        return [
            { name: 'Bitcoin', ticker: 'BTC', price: 97500, change24h: 2.1, change7d: 5.8, mcap: 1920000, volume: 45000, fdv: 2050000, holders: 48000000, category: 'L1', chain: 'Bitcoin' },
            { name: 'Ethereum', ticker: 'ETH', price: 3400, change24h: -0.8, change7d: 3.2, mcap: 410000, volume: 18000, fdv: 410000, holders: 120000000, category: 'L1', chain: 'Ethereum' },
            { name: 'Solana', ticker: 'SOL', price: 190, change24h: 4.5, change7d: 12.1, mcap: 88000, volume: 8500, fdv: 112000, holders: 5000000, category: 'L1', chain: 'Solana' },
            { name: 'Avalanche', ticker: 'AVAX', price: 35, change24h: 1.2, change7d: -2.4, mcap: 14000, volume: 1200, fdv: 25000, holders: 2100000, category: 'L1', chain: 'Avalanche' },
            { name: 'Arbitrum', ticker: 'ARB', price: 1.80, change24h: -1.5, change7d: 8.3, mcap: 6800, volume: 890, fdv: 18000, holders: 1800000, category: 'L2', chain: 'Arbitrum' },
            { name: 'Chainlink', ticker: 'LINK', price: 22, change24h: 3.8, change7d: 15.2, mcap: 13800, volume: 2100, fdv: 22000, holders: 3200000, category: 'Oracle', chain: 'Multi' },
            { name: 'Aave', ticker: 'AAVE', price: 280, change24h: 5.2, change7d: 18.5, mcap: 4200, volume: 680, fdv: 4500, holders: 450000, category: 'DeFi', chain: 'Multi' },
            { name: 'Uniswap', ticker: 'UNI', price: 12.50, change24h: -2.1, change7d: 1.8, mcap: 9400, volume: 520, fdv: 12500, holders: 1200000, category: 'DEX', chain: 'Multi' },
            { name: 'Lido', ticker: 'LDO', price: 2.80, change24h: 1.8, change7d: 6.4, mcap: 2500, volume: 340, fdv: 2800, holders: 280000, category: 'Staking', chain: 'Ethereum' },
            { name: 'Pendle', ticker: 'PENDLE', price: 5.20, change24h: 8.5, change7d: 25.3, mcap: 820, volume: 450, fdv: 1400, holders: 150000, category: 'DeFi', chain: 'Multi' },
            { name: 'Render', ticker: 'RNDR', price: 8.50, change24h: 6.2, change7d: 22.0, mcap: 4300, volume: 780, fdv: 5100, holders: 380000, category: 'AI', chain: 'Multi' },
            { name: 'Injective', ticker: 'INJ', price: 28, change24h: -3.2, change7d: -5.1, mcap: 2800, volume: 420, fdv: 2800, holders: 220000, category: 'L1', chain: 'Injective' },
            { name: 'Celestia', ticker: 'TIA', price: 12, change24h: 2.8, change7d: 9.5, mcap: 2400, volume: 380, fdv: 12000, holders: 180000, category: 'Modular', chain: 'Celestia' },
            { name: 'Sui', ticker: 'SUI', price: 1.80, change24h: 7.2, change7d: 28.5, mcap: 5400, volume: 1200, fdv: 18000, holders: 450000, category: 'L1', chain: 'Sui' },
            { name: 'Eigenlayer', ticker: 'EIGEN', price: 4.50, change24h: -0.5, change7d: 2.1, mcap: 1800, volume: 290, fdv: 7500, holders: 120000, category: 'Restaking', chain: 'Ethereum' }
        ];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var tokens = this.getTokens();
        var self = this;
        var sortKey = 'mcap', sortDir = -1;

        var categories = ['All'];
        tokens.forEach(function(t) { if (categories.indexOf(t.category) === -1) categories.push(t.category); });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + tokens.length + '</div><div class="sol-stat-label">Tokens</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + tokens.filter(function(t) { return t.change24h > 0; }).length + '</div><div class="sol-stat-label">Gainers</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + tokens.filter(function(t) { return t.change24h < 0; }).length + '</div><div class="sol-stat-label">Losers</div></div></div>';

        html += '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">';
        categories.forEach(function(cat, i) {
            html += '<button class="sol-btn sol-btn-sm ' + (i === 0 ? 'sol-btn-primary' : 'sol-btn-outline') + ' ts-filter" data-cat="' + cat + '">' + cat + '</button>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Token Screener</div>' +
            '<table class="sol-table" id="ts-table"><thead><tr>' +
            '<th>#</th><th>Token</th><th class="ts-sort" data-key="price" style="cursor:pointer">Price ↕</th>' +
            '<th class="ts-sort" data-key="change24h" style="cursor:pointer">24h ↕</th>' +
            '<th class="ts-sort" data-key="change7d" style="cursor:pointer">7d ↕</th>' +
            '<th class="ts-sort" data-key="mcap" style="cursor:pointer">MCap ↕</th>' +
            '<th class="ts-sort" data-key="volume" style="cursor:pointer">Vol 24h ↕</th>' +
            '<th>Category</th></tr></thead><tbody id="ts-body"></tbody></table></div>';

        c.innerHTML = html;

        function renderTable(filter) {
            var filtered = filter === 'All' ? tokens : tokens.filter(function(t) { return t.category === filter; });
            filtered.sort(function(a, b) { return (b[sortKey] - a[sortKey]) * sortDir; });
            var tbody = '';
            filtered.forEach(function(t, i) {
                var c24 = t.change24h >= 0 ? '#00ff88' : '#ff4466';
                var c7d = t.change7d >= 0 ? '#00ff88' : '#ff4466';
                tbody += '<tr><td style="color:#555">' + (i + 1) + '</td>' +
                    '<td><strong style="color:#fff">' + t.ticker + '</strong><div style="font-size:10px;color:#555">' + t.name + '</div></td>' +
                    '<td style="font-family:monospace">$' + t.price.toLocaleString() + '</td>' +
                    '<td style="font-family:monospace;color:' + c24 + '">' + (t.change24h >= 0 ? '+' : '') + t.change24h.toFixed(1) + '%</td>' +
                    '<td style="font-family:monospace;color:' + c7d + '">' + (t.change7d >= 0 ? '+' : '') + t.change7d.toFixed(1) + '%</td>' +
                    '<td style="font-family:monospace">$' + (t.mcap / 1000).toFixed(0) + 'B</td>' +
                    '<td style="font-family:monospace;color:#888">$' + (t.volume).toLocaleString() + 'M</td>' +
                    '<td><span class="sol-tag sol-tag-blue" style="font-size:10px">' + t.category + '</span></td></tr>';
            });
            document.getElementById('ts-body').innerHTML = tbody;
        }

        var currentFilter = 'All';
        renderTable(currentFilter);

        c.querySelectorAll('.ts-filter').forEach(function(btn) {
            btn.addEventListener('click', function() {
                c.querySelectorAll('.ts-filter').forEach(function(b) { b.classList.remove('sol-btn-primary'); b.classList.add('sol-btn-outline'); });
                btn.classList.remove('sol-btn-outline'); btn.classList.add('sol-btn-primary');
                currentFilter = btn.dataset.cat;
                renderTable(currentFilter);
            });
        });
        c.querySelectorAll('.ts-sort').forEach(function(th) {
            th.addEventListener('click', function() {
                if (sortKey === th.dataset.key) sortDir *= -1;
                else { sortKey = th.dataset.key; sortDir = -1; }
                renderTable(currentFilter);
            });
        });
    }
};

SolutionsHub.registerSolution('token-screener', TokenScreener, 'shared', {
    icon: '🔍', name: 'Token Screener', description: 'Filter and discover tokens by price, market cap, volume, category, and performance'
});
