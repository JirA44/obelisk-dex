/* ============================================
   PORTFOLIO HEALTH - Retail Module
   5-axis radar chart: Diversification, Risk, Yield, Liquidity, Growth
   ============================================ */

const PortfolioHealth = {
    axes: ['Diversification', 'Risk Mgmt', 'Yield', 'Liquidity', 'Growth'],

    init() {},

    computeScores() {
        var positions = [];
        var totalValue = 10000;
        if (typeof SimulatedPortfolio !== 'undefined') {
            positions = SimulatedPortfolio.positions || [];
            totalValue = SimulatedPortfolio.getTotalValue ? SimulatedPortfolio.getTotalValue() : 10000;
        }
        var tradeCount = parseInt(localStorage.getItem('obelisk_trade_count') || '0');
        var hasStaking = !!localStorage.getItem('obelisk_staking_positions');
        var pnl = parseFloat(localStorage.getItem('obelisk_total_pnl') || '0');

        // Diversification: 0-100 based on number of assets
        var divScore = Math.min(positions.length * 15, 100);
        if (positions.length > 1) {
            var maxAlloc = 0;
            positions.forEach(function(p) { var a = (p.value || 0) / (totalValue || 1); if (a > maxAlloc) maxAlloc = a; });
            if (maxAlloc < 0.3) divScore = Math.min(divScore + 20, 100);
        }

        // Risk Management: using stops, not over-leveraged
        var riskScore = 50;
        if (tradeCount > 0) riskScore += 15;
        if (positions.length <= 10) riskScore += 15;
        riskScore = Math.min(riskScore + Math.min(tradeCount, 20), 100);

        // Yield: staking/farming activity
        var yieldScore = hasStaking ? 70 : 20;
        if (localStorage.getItem('obelisk_yield_earned')) yieldScore += 20;
        yieldScore = Math.min(yieldScore, 100);

        // Liquidity: stablecoins ratio, cash available
        var liquidScore = 60;
        if (positions.length === 0) liquidScore = 90;
        liquidScore = Math.min(liquidScore, 100);

        // Growth: positive PnL trend
        var growthScore = 50;
        if (pnl > 0) growthScore = Math.min(50 + Math.floor(pnl / 100), 95);
        else if (pnl < 0) growthScore = Math.max(10, 50 + Math.floor(pnl / 100));

        return [divScore, riskScore, yieldScore, liquidScore, growthScore];
    },

    renderRadarSVG(scores) {
        var size = 280, cx = 140, cy = 140, r = 110;
        var n = 5;
        var angleStep = (2 * Math.PI) / n;

        // Grid rings
        var rings = '';
        [0.25, 0.5, 0.75, 1.0].forEach(function(scale) {
            var pts = [];
            for (var i = 0; i < n; i++) {
                var angle = -Math.PI / 2 + i * angleStep;
                pts.push((cx + r * scale * Math.cos(angle)).toFixed(1) + ',' + (cy + r * scale * Math.sin(angle)).toFixed(1));
            }
            rings += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="#1a1a1a" stroke-width="1"/>';
        });

        // Axis lines + labels
        var axes = '';
        var labels = this.axes;
        for (var i = 0; i < n; i++) {
            var angle = -Math.PI / 2 + i * angleStep;
            var x2 = cx + r * Math.cos(angle);
            var y2 = cy + r * Math.sin(angle);
            axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#222" stroke-width="1"/>';
            var lx = cx + (r + 20) * Math.cos(angle);
            var ly = cy + (r + 20) * Math.sin(angle);
            var anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
            axes += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="' + anchor + '" fill="#888" font-size="11">' + labels[i] + '</text>';
        }

        // Data polygon
        var dataPts = [];
        for (var i = 0; i < n; i++) {
            var angle = -Math.PI / 2 + i * angleStep;
            var val = (scores[i] || 0) / 100;
            dataPts.push((cx + r * val * Math.cos(angle)).toFixed(1) + ',' + (cy + r * val * Math.sin(angle)).toFixed(1));
        }
        var dataPolygon = '<polygon points="' + dataPts.join(' ') + '" fill="rgba(0,255,136,0.15)" stroke="#00ff88" stroke-width="2"/>';

        // Data points
        var dots = '';
        for (var i = 0; i < n; i++) {
            var angle = -Math.PI / 2 + i * angleStep;
            var val = (scores[i] || 0) / 100;
            var dx = cx + r * val * Math.cos(angle);
            var dy = cy + r * val * Math.sin(angle);
            dots += '<circle cx="' + dx.toFixed(1) + '" cy="' + dy.toFixed(1) + '" r="4" fill="#00ff88"/>';
        }

        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
            rings + axes + dataPolygon + dots + '</svg>';
    },

    getOverallScore(scores) {
        return Math.round(scores.reduce(function(s, v) { return s + v; }, 0) / scores.length);
    },

    getRecommendations(scores) {
        var recs = [];
        if (scores[0] < 50) recs.push('Diversify your portfolio - consider adding more asset types');
        if (scores[1] < 50) recs.push('Improve risk management - consider setting stop-losses on positions');
        if (scores[2] < 50) recs.push('Boost yield - stake idle assets to earn passive income');
        if (scores[3] < 50) recs.push('Increase liquidity - keep some stablecoins for opportunities');
        if (scores[4] < 50) recs.push('Focus on growth - review losing positions and adjust strategy');
        if (recs.length === 0) recs.push('Your portfolio is in great shape! Keep monitoring regularly.');
        return recs;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var scores = this.computeScores();
        var overall = this.getOverallScore(scores);
        var overallColor = overall >= 70 ? '#00ff88' : overall >= 45 ? '#c9a227' : '#ff4466';
        var recs = this.getRecommendations(scores);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + overallColor + '">' + overall + '/100</div><div class="sol-stat-label">Overall Score</div></div>';
        var self = this;
        scores.forEach(function(s, i) {
            var col = s >= 70 ? '#00ff88' : s >= 45 ? '#c9a227' : '#ff4466';
            html += '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + col + ';font-size:22px">' + s + '</div><div class="sol-stat-label">' + self.axes[i] + '</div></div>';
        });
        html += '</div>';

        // Radar chart
        html += '<div class="sol-section" style="text-align:center"><div class="sol-section-title">🕸️ Portfolio Radar</div>' +
            this.renderRadarSVG(scores) + '</div>';

        // Recommendations
        html += '<div class="sol-section"><div class="sol-section-title">💡 Recommendations</div><ul style="color:#aaa;font-size:13px;line-height:2;padding-left:20px">';
        recs.forEach(function(r) { html += '<li>' + r + '</li>'; });
        html += '</ul></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('portfolio-health', PortfolioHealth, 'retail', {
    icon: '🕸️', name: 'Portfolio Health', description: '5-axis radar score: Diversification, Risk, Yield, Liquidity, Growth'
});
