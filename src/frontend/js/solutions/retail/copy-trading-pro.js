/* ============================================
   COPY TRADING PRO - Follow top traders
   ============================================ */

const CopyTradingPro = {
    following: [],
    traders: [],

    init() {
        try { this.following = JSON.parse(localStorage.getItem('obelisk_copy_following') || '[]'); } catch(e) { this.following = []; }
        this.generateTraders();
    },

    save() { localStorage.setItem('obelisk_copy_following', JSON.stringify(this.following)); },

    generateTraders() {
        this.traders = [
            { id: 't1', name: 'CryptoKing', avatar: '👑', winRate: 72, pnl30d: 28.5, trades30d: 156, followers: 2340, risk: 'Medium', style: 'Swing', sharpe: 1.8, maxDD: -8.2, description: 'Macro-driven swing trader focusing on BTC & ETH' },
            { id: 't2', name: 'AlgoMaster', avatar: '🤖', winRate: 68, pnl30d: 15.2, trades30d: 890, followers: 1560, risk: 'Low', style: 'Algo', sharpe: 2.1, maxDD: -4.5, description: 'Algorithmic mean-reversion strategies across all pairs' },
            { id: 't3', name: 'DeFiWhale', avatar: '🐋', winRate: 64, pnl30d: 42.1, trades30d: 45, followers: 890, risk: 'High', style: 'DeFi', sharpe: 1.4, maxDD: -15.3, description: 'High-conviction DeFi yield plays and token launches' },
            { id: 't4', name: 'ScalpQueen', avatar: '⚡', winRate: 81, pnl30d: 8.9, trades30d: 1250, followers: 3100, risk: 'Low', style: 'Scalp', sharpe: 2.5, maxDD: -2.1, description: 'Ultra-fast scalping with tight risk management' },
            { id: 't5', name: 'AltHunter', avatar: '🎯', winRate: 58, pnl30d: 65.3, trades30d: 78, followers: 560, risk: 'Very High', style: 'Altcoins', sharpe: 0.9, maxDD: -22.0, description: 'Early altcoin entries and moonshot plays' },
            { id: 't6', name: 'ValueInvestor', avatar: '📊', winRate: 75, pnl30d: 12.4, trades30d: 12, followers: 4200, risk: 'Low', style: 'Value', sharpe: 1.9, maxDD: -5.8, description: 'Long-term value accumulation with DCA approach' },
            { id: 't7', name: 'PerpsKing', avatar: '📉', winRate: 62, pnl30d: 35.7, trades30d: 320, followers: 1800, risk: 'High', style: 'Perps', sharpe: 1.3, maxDD: -12.0, description: 'Leveraged perpetuals with funding rate arbitrage' },
            { id: 't8', name: 'YieldFarmer', avatar: '🌾', winRate: 88, pnl30d: 18.6, trades30d: 35, followers: 950, risk: 'Medium', style: 'Yield', sharpe: 2.0, maxDD: -6.4, description: 'Optimized yield farming across multiple protocols' }
        ];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + this.traders.length + '</div><div class="sol-stat-label">Top Traders</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + this.following.length + '</div><div class="sol-stat-label">Following</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🏆 Leaderboard</div>';
        this.traders.sort(function(a, b) { return b.pnl30d - a.pnl30d; });
        this.traders.forEach(function(t, idx) {
            var isFollowing = self.following.includes(t.id);
            var riskColor = t.risk === 'Low' ? '#00ff88' : t.risk === 'Medium' ? '#c9a227' : t.risk === 'High' ? '#ff8844' : '#ff4466';
            html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:12px;' + (isFollowing ? 'border-color:#00ff8844;background:rgba(0,255,136,0.02)' : '') + '">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
                '<div style="display:flex;align-items:center;gap:12px">' +
                '<span style="font-size:28px">' + t.avatar + '</span>' +
                '<div><strong style="color:#fff;font-size:15px">' + t.name + '</strong>' +
                '<div style="font-size:11px;color:#666">' + t.description + '</div></div></div>' +
                '<button class="sol-btn sol-btn-sm ' + (isFollowing ? 'sol-btn-danger' : 'sol-btn-primary') + ' copy-toggle" data-id="' + t.id + '">' + (isFollowing ? 'Unfollow' : 'Copy') + '</button></div>' +
                '<div class="sol-stats-row" style="margin-bottom:0">' +
                '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value green" style="font-size:16px">+' + t.pnl30d + '%</div><div class="sol-stat-label">30d PnL</div></div>' +
                '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:16px">' + t.winRate + '%</div><div class="sol-stat-label">Win Rate</div></div>' +
                '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:16px">' + t.sharpe.toFixed(1) + '</div><div class="sol-stat-label">Sharpe</div></div>' +
                '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:16px;color:' + riskColor + '">' + t.risk + '</div><div class="sol-stat-label">Risk</div></div>' +
                '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:16px">' + t.followers.toLocaleString() + '</div><div class="sol-stat-label">Followers</div></div>' +
                '</div></div>';
        });
        html += '</div>';

        c.innerHTML = html;
        c.querySelectorAll('.copy-toggle').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = btn.dataset.id;
                if (self.following.includes(id)) {
                    self.following = self.following.filter(function(f) { return f !== id; });
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.info('Unfollowed trader');
                } else {
                    self.following.push(id);
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Now copying this trader!');
                }
                self.save();
                self.render('solution-body');
            });
        });
    }
};

SolutionsHub.registerSolution('copy-trading-pro', CopyTradingPro, 'retail', {
    icon: '👥', name: 'Copy Trading', description: 'Follow and automatically copy the trades of top-performing traders'
});
