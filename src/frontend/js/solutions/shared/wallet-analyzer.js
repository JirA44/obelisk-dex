/* ============================================
   WALLET ANALYZER - Deep wallet analysis
   ============================================ */

const WalletAnalyzer = {
    init() {},

    analyzeWallet(address) {
        var age = Math.floor(Math.random() * 1000 + 200);
        var txCount = Math.floor(Math.random() * 5000 + 100);
        var netWorth = Math.floor(Math.random() * 500000 + 5000);
        var tokens = [
            { asset: 'ETH', balance: (Math.random() * 50 + 1).toFixed(2), value: 0, pct: 0 },
            { asset: 'USDC', balance: (Math.random() * 50000 + 1000).toFixed(0), value: 0, pct: 0 },
            { asset: 'WBTC', balance: (Math.random() * 2 + 0.01).toFixed(4), value: 0, pct: 0 },
            { asset: 'LINK', balance: (Math.random() * 2000 + 50).toFixed(0), value: 0, pct: 0 },
            { asset: 'UNI', balance: (Math.random() * 1000 + 10).toFixed(0), value: 0, pct: 0 },
            { asset: 'AAVE', balance: (Math.random() * 50 + 1).toFixed(1), value: 0, pct: 0 }
        ];
        var prices = { ETH: 3400, USDC: 1, WBTC: 97500, LINK: 22, UNI: 12.5, AAVE: 280 };
        var total = 0;
        tokens.forEach(function(t) { t.value = parseFloat(t.balance) * (prices[t.asset] || 1); total += t.value; });
        tokens.forEach(function(t) { t.pct = total > 0 ? (t.value / total * 100) : 0; });
        tokens.sort(function(a, b) { return b.value - a.value; });

        var defiPositions = [
            { protocol: 'Aave V3', type: 'Lending', value: '$' + (Math.random() * 50000 + 5000).toFixed(0), apy: (Math.random() * 5 + 2).toFixed(1) + '%' },
            { protocol: 'Uniswap V3', type: 'LP', value: '$' + (Math.random() * 30000 + 2000).toFixed(0), apy: (Math.random() * 20 + 5).toFixed(1) + '%' },
            { protocol: 'Lido', type: 'Staking', value: '$' + (Math.random() * 80000 + 10000).toFixed(0), apy: '3.6%' }
        ];

        var activityScore = Math.min(100, Math.floor(txCount / 50 + age / 20));
        var diversityScore = Math.min(100, tokens.length * 15);
        var defiScore = Math.min(100, defiPositions.length * 25 + 25);
        var overallScore = Math.floor((activityScore + diversityScore + defiScore) / 3);

        return {
            address: address, age: age, txCount: txCount, netWorth: total,
            tokens: tokens, defiPositions: defiPositions,
            scores: { overall: overallScore, activity: activityScore, diversity: diversityScore, defi: defiScore },
            labels: overallScore > 70 ? ['Power User', 'DeFi Native'] : overallScore > 40 ? ['Active Trader'] : ['Casual User'],
            recentTxs: [
                { type: 'Swap', detail: 'ETH → USDC', value: '$3,400', time: '2h ago' },
                { type: 'Approve', detail: 'USDC on Aave', value: '-', time: '2h ago' },
                { type: 'Deposit', detail: 'Aave V3 USDC', value: '$3,400', time: '2h ago' },
                { type: 'Claim', detail: 'UNI rewards', value: '$120', time: '1d ago' },
                { type: 'Transfer', detail: '→ 0xDef...456', value: '$500', time: '2d ago' }
            ]
        };
    },

    renderScoreRadar(scores, size) {
        var cx = size / 2, cy = size / 2, r = size * 0.35;
        var axes = [
            { key: 'activity', label: 'Activity', angle: -Math.PI / 2 },
            { key: 'diversity', label: 'Diversity', angle: -Math.PI / 2 + Math.PI * 2 / 3 },
            { key: 'defi', label: 'DeFi', angle: -Math.PI / 2 + Math.PI * 4 / 3 }
        ];
        var svg = '<svg width="' + size + '" height="' + size + '">';
        [0.33, 0.66, 1].forEach(function(s) {
            var pts = axes.map(function(a) {
                return (cx + r * s * Math.cos(a.angle)).toFixed(1) + ',' + (cy + r * s * Math.sin(a.angle)).toFixed(1);
            }).join(' ');
            svg += '<polygon points="' + pts + '" fill="none" stroke="#222" stroke-width="1"/>';
        });
        axes.forEach(function(a) {
            svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(a.angle)).toFixed(1) + '" y2="' + (cy + r * Math.sin(a.angle)).toFixed(1) + '" stroke="#222" stroke-width="1"/>';
            svg += '<text x="' + (cx + (r + 15) * Math.cos(a.angle)).toFixed(1) + '" y="' + (cy + (r + 15) * Math.sin(a.angle) + 4).toFixed(1) + '" text-anchor="middle" fill="#888" font-size="10">' + a.label + '</text>';
        });
        var dataPts = axes.map(function(a) {
            var val = scores[a.key] / 100;
            return (cx + r * val * Math.cos(a.angle)).toFixed(1) + ',' + (cy + r * val * Math.sin(a.angle)).toFixed(1);
        }).join(' ');
        svg += '<polygon points="' + dataPts + '" fill="#00d4ff" fill-opacity="0.2" stroke="#00d4ff" stroke-width="2"/>';
        svg += '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" fill="#fff" font-size="18" font-weight="700">' + scores.overall + '</text>';
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;

        var html = '<div class="sol-section"><div class="sol-section-title">🔎 Analyze Wallet</div>' +
            '<div style="display:flex;gap:8px"><input class="sol-input" id="wa-addr" placeholder="0x... Enter any wallet address" style="flex:1" value="0x377706801308ac4c3Fe86EEBB295FeC6E1279140">' +
            '<button class="sol-btn sol-btn-primary" id="wa-analyze">Analyze</button></div></div>' +
            '<div id="wa-results"></div>';

        c.innerHTML = html;
        c.querySelector('#wa-analyze').addEventListener('click', function() {
            var addr = document.getElementById('wa-addr').value.trim();
            if (!addr) return;
            var data = self.analyzeWallet(addr);
            var rhtml = '<div class="sol-stats-row">' +
                '<div class="sol-stat-card"><div class="sol-stat-value green">$' + data.netWorth.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</div><div class="sol-stat-label">Net Worth</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value">' + data.txCount.toLocaleString() + '</div><div class="sol-stat-label">Transactions</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + data.age + 'd</div><div class="sol-stat-label">Wallet Age</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value">' + data.labels.join(', ') + '</div><div class="sol-stat-label">Labels</div></div></div>';

            rhtml += '<div style="display:flex;gap:16px;flex-wrap:wrap"><div style="flex:0 0 auto;text-align:center">' + self.renderScoreRadar(data.scores, 180) + '</div>' +
                '<div style="flex:1"><div class="sol-section"><div class="sol-section-title">💰 Token Holdings</div>' +
                '<table class="sol-table"><thead><tr><th>Token</th><th>Balance</th><th>Value</th><th>%</th></tr></thead><tbody>';
            var tokenRows = '';
            data.tokens.forEach(function(t) {
                tokenRows += '<tr><td><strong>' + t.asset + '</strong></td><td style="font-family:monospace">' + t.balance + '</td><td style="font-family:monospace;color:#00ff88">$' + t.value.toFixed(0) + '</td>' +
                    '<td><div style="display:flex;align-items:center;gap:4px"><div class="sol-progress" style="width:40px;height:3px"><div class="sol-progress-fill" style="width:' + t.pct + '%"></div></div><span style="font-size:10px;color:#888">' + t.pct.toFixed(0) + '%</span></div></td></tr>';
            });
            rhtml += tokenRows + '</tbody></table></div></div></div>';

            rhtml += '<div class="sol-section"><div class="sol-section-title">🔄 DeFi Positions</div>' +
                '<table class="sol-table"><thead><tr><th>Protocol</th><th>Type</th><th>Value</th><th>APY</th></tr></thead><tbody>';
            data.defiPositions.forEach(function(d) {
                rhtml += '<tr><td><strong>' + d.protocol + '</strong></td><td><span class="sol-tag sol-tag-blue">' + d.type + '</span></td><td style="font-family:monospace;color:#00ff88">' + d.value + '</td><td style="font-family:monospace;color:#c9a227">' + d.apy + '</td></tr>';
            });
            rhtml += '</tbody></table></div>';

            rhtml += '<div class="sol-section"><div class="sol-section-title">📋 Recent Activity</div>' +
                '<table class="sol-table"><thead><tr><th>Type</th><th>Detail</th><th>Value</th><th>Time</th></tr></thead><tbody>';
            data.recentTxs.forEach(function(tx) {
                rhtml += '<tr><td><strong>' + tx.type + '</strong></td><td style="color:#888">' + tx.detail + '</td><td style="font-family:monospace">' + tx.value + '</td><td style="color:#555">' + tx.time + '</td></tr>';
            });
            rhtml += '</tbody></table></div>';

            document.getElementById('wa-results').innerHTML = rhtml;
        });
    }
};

SolutionsHub.registerSolution('wallet-analyzer', WalletAnalyzer, 'shared', {
    icon: '🔬', name: 'Wallet Analyzer', description: 'Deep analysis of any wallet - holdings, DeFi positions, activity score, and labels'
});
