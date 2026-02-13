/* ============================================
   SMART DASHBOARD - Personalized Retail Dashboard
   Detects user level, shows adapted UI, quick actions, portfolio health gauge
   ============================================ */

const SmartDashboard = {
    level: 'beginner', // beginner | intermediate | advanced

    init() {
        this.detectLevel();
    },

    detectLevel() {
        var portfolio = (typeof SimulatedPortfolio !== 'undefined') ? SimulatedPortfolio : null;
        var positions = portfolio ? (portfolio.positions || []) : [];
        var tradeCount = parseInt(localStorage.getItem('obelisk_trade_count') || '0');

        if (tradeCount > 50 || positions.length > 5) this.level = 'advanced';
        else if (tradeCount > 10 || positions.length > 1) this.level = 'intermediate';
        else this.level = 'beginner';
    },

    getPortfolioValue() {
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.getTotalValue) {
            return SimulatedPortfolio.getTotalValue();
        }
        return parseFloat(localStorage.getItem('obelisk_sim_balance') || '10000');
    },

    getPositions() {
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.positions) {
            return SimulatedPortfolio.positions;
        }
        return [];
    },

    getPrices() {
        if (typeof ObeliskApp !== 'undefined' && ObeliskApp.state && ObeliskApp.state.prices) {
            return ObeliskApp.state.prices;
        }
        return { BTC: 97500, ETH: 3400, SOL: 190 };
    },

    computeHealthScore() {
        var positions = this.getPositions();
        var value = this.getPortfolioValue();
        var score = 50;

        // Diversification: more assets = better (up to +20)
        var assetCount = positions.length;
        score += Math.min(assetCount * 5, 20);

        // Not too concentrated: no single asset > 50% (up to +15)
        if (value > 0 && positions.length > 0) {
            var maxAlloc = 0;
            positions.forEach(function(p) {
                var alloc = (p.value || 0) / value;
                if (alloc > maxAlloc) maxAlloc = alloc;
            });
            if (maxAlloc < 0.5) score += 15;
            else if (maxAlloc < 0.7) score += 8;
        } else {
            score += 10;
        }

        // Has staking (+10)
        var hasStaking = localStorage.getItem('obelisk_staking_positions');
        if (hasStaking) score += 10;

        // Positive PnL (+5)
        var pnl = parseFloat(localStorage.getItem('obelisk_total_pnl') || '0');
        if (pnl > 0) score += 5;

        return Math.min(Math.max(score, 0), 100);
    },

    getScoreColor(score) {
        if (score >= 75) return '#00ff88';
        if (score >= 50) return '#c9a227';
        return '#ff4466';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var value = this.getPortfolioValue();
        var score = this.computeHealthScore();
        var scoreColor = this.getScoreColor(score);
        var prices = this.getPrices();
        var positions = this.getPositions();

        if (this.level === 'beginner') {
            c.innerHTML = this.renderBeginner(value, score, scoreColor, prices);
        } else {
            c.innerHTML = this.renderAdvanced(value, score, scoreColor, prices, positions);
        }

        this.bindActions(c);
    },

    renderBeginner(value, score, scoreColor, prices) {
        return '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + value.toLocaleString() + '</div><div class="sol-stat-label">Portfolio Value</div></div>' +
            '<div class="sol-stat-card">' + this.renderGaugeSVG(score, scoreColor) + '<div class="sol-stat-label">Portfolio Health</div></div>' +
            '</div>' +

            '<div class="sol-section"><div class="sol-section-title">🚀 Get Started</div>' +
            '<div class="sol-quick-actions">' +
            '<button class="sol-quick-action" data-action="buy-btc"><span class="icon">₿</span> Buy Bitcoin</button>' +
            '<button class="sol-quick-action" data-action="stake-eth"><span class="icon">💎</span> Stake ETH</button>' +
            '<button class="sol-quick-action" data-action="savings"><span class="icon">🏦</span> Start Saving</button>' +
            '<button class="sol-quick-action" data-action="learn"><span class="icon">📚</span> Learn DeFi</button>' +
            '</div></div>' +

            '<div class="sol-section"><div class="sol-section-title">📊 Live Prices</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Price</th></tr></thead><tbody>' +
            '<tr><td>BTC</td><td style="color:#00ff88;font-family:monospace">$' + (prices.BTC || 0).toLocaleString() + '</td></tr>' +
            '<tr><td>ETH</td><td style="color:#00ff88;font-family:monospace">$' + (prices.ETH || 0).toLocaleString() + '</td></tr>' +
            '<tr><td>SOL</td><td style="color:#00ff88;font-family:monospace">$' + (prices.SOL || 0).toLocaleString() + '</td></tr>' +
            '</tbody></table></div>' +

            '<div class="sol-section"><div class="sol-section-title">💡 Recommendations</div>' +
            '<p style="color:#aaa;font-size:13px;line-height:1.7;">' +
            (score < 50 ? 'Your portfolio needs attention. Consider diversifying into at least 3 different assets.' :
             score < 75 ? 'Good start! Consider adding staking to earn passive income on your holdings.' :
             'Your portfolio is healthy! Keep monitoring and rebalancing periodically.') +
            '</p></div>';
    },

    renderAdvanced(value, score, scoreColor, prices, positions) {
        var posRows = '';
        positions.forEach(function(p) {
            var pnlColor = (p.pnl || 0) >= 0 ? '#00ff88' : '#ff4466';
            posRows += '<tr><td>' + (p.symbol || p.asset || '?') + '</td>' +
                '<td style="font-family:monospace">$' + (p.value || 0).toLocaleString() + '</td>' +
                '<td style="color:' + pnlColor + ';font-family:monospace">' + ((p.pnl || 0) >= 0 ? '+' : '') + (p.pnl || 0).toFixed(2) + '%</td></tr>';
        });
        if (!posRows) posRows = '<tr><td colspan="3" style="text-align:center;color:#555">No active positions</td></tr>';

        return '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + value.toLocaleString() + '</div><div class="sol-stat-label">Total Value</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + positions.length + '</div><div class="sol-stat-label">Positions</div></div>' +
            '<div class="sol-stat-card">' + this.renderGaugeSVG(score, scoreColor) + '<div class="sol-stat-label">Health Score</div></div>' +
            '</div>' +

            '<div class="sol-quick-actions">' +
            '<button class="sol-quick-action" data-action="buy-btc"><span class="icon">₿</span> Buy BTC</button>' +
            '<button class="sol-quick-action" data-action="stake-eth"><span class="icon">💎</span> Stake</button>' +
            '<button class="sol-quick-action" data-action="swap"><span class="icon">🔄</span> Swap</button>' +
            '<button class="sol-quick-action" data-action="perps"><span class="icon">📉</span> Trade Perps</button>' +
            '</div>' +

            '<div class="sol-section"><div class="sol-section-title">📈 Active Positions</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Value</th><th>PnL</th></tr></thead><tbody>' +
            posRows + '</tbody></table></div>' +

            '<div class="sol-section"><div class="sol-section-title">📊 Market Snapshot</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Price</th></tr></thead><tbody>' +
            '<tr><td>BTC</td><td style="color:#00ff88;font-family:monospace">$' + (prices.BTC || 0).toLocaleString() + '</td></tr>' +
            '<tr><td>ETH</td><td style="color:#00ff88;font-family:monospace">$' + (prices.ETH || 0).toLocaleString() + '</td></tr>' +
            '<tr><td>SOL</td><td style="color:#00ff88;font-family:monospace">$' + (prices.SOL || 0).toLocaleString() + '</td></tr>' +
            '</tbody></table></div>';
    },

    renderGaugeSVG(score, color) {
        var circumference = 2 * Math.PI * 40;
        var offset = circumference - (score / 100) * circumference;
        return '<svg width="90" height="90" viewBox="0 0 100 100">' +
            '<circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" stroke-width="8"/>' +
            '<circle cx="50" cy="50" r="40" fill="none" stroke="' + color + '" stroke-width="8" ' +
            'stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '" ' +
            'stroke-linecap="round" transform="rotate(-90 50 50)" style="transition:stroke-dashoffset 1s ease"/>' +
            '<text x="50" y="55" text-anchor="middle" fill="' + color + '" font-size="22" font-weight="700" font-family="JetBrains Mono,monospace">' + score + '</text>' +
            '</svg>';
    },

    bindActions(container) {
        container.querySelectorAll('.sol-quick-action').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action = this.dataset.action;
                SolutionsHub.closeSolution();
                switch (action) {
                    case 'buy-btc':
                        if (typeof ObeliskApp !== 'undefined') ObeliskApp.switchTab('swap');
                        break;
                    case 'stake-eth':
                        if (typeof ObeliskApp !== 'undefined') ObeliskApp.switchTab('investments');
                        break;
                    case 'savings':
                        SolutionsHub.navigateTo('savings-goals', 'retail');
                        break;
                    case 'learn':
                        if (typeof ObeliskApp !== 'undefined') ObeliskApp.switchTab('learn');
                        break;
                    case 'swap':
                        if (typeof ObeliskApp !== 'undefined') ObeliskApp.switchTab('swap');
                        break;
                    case 'perps':
                        if (typeof ObeliskApp !== 'undefined') ObeliskApp.switchTab('perps');
                        break;
                }
            });
        });
    }
};

SolutionsHub.registerSolution('smart-dashboard', SmartDashboard, 'retail', {
    icon: '📊', name: 'Smart Dashboard', description: 'Personalized dashboard adapted to your experience level with portfolio health score'
});
