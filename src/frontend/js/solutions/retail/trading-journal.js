/* ============================================
   TRADING JOURNAL - Log trades + emotions
   ============================================ */

const TradingJournal = {
    entries: [],
    filter: 'all',

    init() {
        try { this.entries = JSON.parse(localStorage.getItem('obelisk_journal') || '[]'); } catch(e) { this.entries = []; }
        if (this.entries.length === 0) this.generateSamples();
    },

    save() { localStorage.setItem('obelisk_journal', JSON.stringify(this.entries)); },

    generateSamples() {
        var seed = 99;
        var rng = function() { seed = (seed * 16807 + 7) % 2147483647; return (seed % 1000) / 1000; };
        var pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'LINK/USDT', 'DOGE/USDT'];
        var strategies = ['Breakout', 'Support/Resistance', 'RSI Divergence', 'MA Cross', 'Scalp', 'News Trade'];
        var emotions = ['confident', 'neutral', 'anxious', 'fomo', 'disciplined', 'impulsive'];
        var tags = ['trend', 'reversal', 'breakout', 'range', 'momentum', 'mean-reversion'];

        for (var i = 0; i < 25; i++) {
            var date = new Date(Date.now() - (25 - i) * 86400000 * (1 + rng()));
            var pair = pairs[Math.floor(rng() * pairs.length)];
            var side = rng() > 0.5 ? 'LONG' : 'SHORT';
            var entry = 1000 + rng() * 99000;
            var pnlPct = (rng() - 0.42) * 8;
            var pnlUsd = pnlPct * (50 + rng() * 200) / 100;

            this.entries.push({
                id: Date.now() + i,
                date: date.toISOString().split('T')[0],
                pair: pair,
                side: side,
                entry: entry,
                exit: entry * (1 + pnlPct / 100),
                pnlPct: pnlPct,
                pnlUsd: pnlUsd,
                strategy: strategies[Math.floor(rng() * strategies.length)],
                emotion: emotions[Math.floor(rng() * emotions.length)],
                tags: [tags[Math.floor(rng() * tags.length)]],
                notes: '',
                rating: Math.floor(1 + rng() * 5)
            });
        }
        this.save();
    },

    getStats() {
        var entries = this.entries;
        if (entries.length === 0) return { total: 0, wins: 0, losses: 0, winRate: 0, totalPnl: 0, avgWin: 0, avgLoss: 0, bestTrade: 0, worstTrade: 0, profitFactor: 0, avgRating: 0 };
        var wins = 0, losses = 0, totalPnl = 0, winSum = 0, lossSum = 0, best = -Infinity, worst = Infinity, ratingSum = 0;
        entries.forEach(function(e) {
            totalPnl += e.pnlUsd;
            ratingSum += e.rating;
            if (e.pnlUsd >= 0) { wins++; winSum += e.pnlUsd; if (e.pnlUsd > best) best = e.pnlUsd; }
            else { losses++; lossSum += Math.abs(e.pnlUsd); if (e.pnlUsd < worst) worst = e.pnlUsd; }
        });
        return {
            total: entries.length, wins: wins, losses: losses,
            winRate: entries.length > 0 ? (wins / entries.length * 100) : 0,
            totalPnl: totalPnl,
            avgWin: wins > 0 ? winSum / wins : 0,
            avgLoss: losses > 0 ? lossSum / losses : 0,
            bestTrade: best === -Infinity ? 0 : best,
            worstTrade: worst === Infinity ? 0 : worst,
            profitFactor: lossSum > 0 ? winSum / lossSum : winSum > 0 ? 999 : 0,
            avgRating: entries.length > 0 ? ratingSum / entries.length : 0
        };
    },

    getEmotionStats() {
        var emo = {};
        this.entries.forEach(function(e) {
            if (!emo[e.emotion]) emo[e.emotion] = { count: 0, pnl: 0, wins: 0 };
            emo[e.emotion].count++;
            emo[e.emotion].pnl += e.pnlUsd;
            if (e.pnlUsd >= 0) emo[e.emotion].wins++;
        });
        return emo;
    },

    getStrategyStats() {
        var strats = {};
        this.entries.forEach(function(e) {
            if (!strats[e.strategy]) strats[e.strategy] = { count: 0, pnl: 0, wins: 0 };
            strats[e.strategy].count++;
            strats[e.strategy].pnl += e.pnlUsd;
            if (e.pnlUsd >= 0) strats[e.strategy].wins++;
        });
        return strats;
    },

    renderEmotionChart(emotionStats, w, h) {
        var keys = Object.keys(emotionStats);
        if (keys.length === 0) return '';
        var padL = 80, padR = 10, padT = 10, padB = 5;
        var chartH = h - padT - padB;
        var barH = Math.min(22, (chartH / keys.length) - 4);
        var maxAbs = 1;
        keys.forEach(function(k) { var a = Math.abs(emotionStats[k].pnl); if (a > maxAbs) maxAbs = a; });

        var svg = '<svg width="' + w + '" height="' + h + '">';
        var mid = padL + (w - padL - padR) / 2;
        svg += '<line x1="' + mid + '" y1="' + padT + '" x2="' + mid + '" y2="' + (h - padB) + '" stroke="#333" stroke-width="1"/>';

        var emoIcons = { confident: '😎', neutral: '😐', anxious: '😰', fomo: '🤑', disciplined: '🧘', impulsive: '⚡' };

        keys.forEach(function(k, i) {
            var y = padT + i * (barH + 4);
            var val = emotionStats[k].pnl;
            var barW = (Math.abs(val) / maxAbs) * ((w - padL - padR) / 2 - 10);
            var color = val >= 0 ? '#00ff88' : '#ff4466';
            var x = val >= 0 ? mid : mid - barW;
            svg += '<rect x="' + x + '" y="' + y + '" width="' + Math.max(2, barW) + '" height="' + barH + '" fill="' + color + '" opacity="0.6" rx="3"/>';
            svg += '<text x="' + (padL - 5) + '" y="' + (y + barH / 2 + 4) + '" text-anchor="end" fill="#aaa" font-size="10">' + (emoIcons[k] || '') + ' ' + k + '</text>';
            svg += '<text x="' + (val >= 0 ? mid + barW + 4 : mid - barW - 4) + '" y="' + (y + barH / 2 + 3) + '" text-anchor="' + (val >= 0 ? 'start' : 'end') + '" fill="' + color + '" font-size="9" font-weight="600">' + (val >= 0 ? '+' : '') + '$' + val.toFixed(0) + '</text>';
        });
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var stats = this.getStats();
        var emoStats = this.getEmotionStats();
        var stratStats = this.getStrategyStats();

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (stats.totalPnl >= 0 ? 'green' : 'red') + '">' + (stats.totalPnl >= 0 ? '+' : '') + '$' + stats.totalPnl.toFixed(0) + '</div><div class="sol-stat-label">PnL Total</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + stats.winRate.toFixed(0) + '%</div><div class="sol-stat-label">Win Rate (' + stats.wins + 'W/' + stats.losses + 'L)</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + stats.profitFactor.toFixed(2) + '</div><div class="sol-stat-label">Profit Factor</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + stats.total + '</div><div class="sol-stat-label">Total Trades</div></div></div>';

        html += '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">+$' + stats.avgWin.toFixed(0) + '</div><div class="sol-stat-label">Avg Win</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">-$' + stats.avgLoss.toFixed(0) + '</div><div class="sol-stat-label">Avg Loss</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">+$' + stats.bestTrade.toFixed(0) + '</div><div class="sol-stat-label">Best Trade</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">$' + stats.worstTrade.toFixed(0) + '</div><div class="sol-stat-label">Worst Trade</div></div></div>';

        // Emotion analysis
        html += '<div class="sol-section"><div class="sol-section-title">🧠 Emotion Analysis</div>' +
            '<div style="overflow-x:auto">' + this.renderEmotionChart(emoStats, 580, Object.keys(emoStats).length * 28 + 15) + '</div></div>';

        // Strategy breakdown
        html += '<div class="sol-section"><div class="sol-section-title">📊 Performance by Strategy</div>' +
            '<table class="sol-table"><thead><tr><th>Strategy</th><th>Trades</th><th>Win Rate</th><th>PnL</th></tr></thead><tbody>';
        Object.keys(stratStats).forEach(function(k) {
            var s = stratStats[k];
            var wr = s.count > 0 ? (s.wins / s.count * 100) : 0;
            html += '<tr><td><strong>' + k + '</strong></td>' +
                '<td style="font-family:monospace">' + s.count + '</td>' +
                '<td style="color:' + (wr >= 55 ? '#00ff88' : wr >= 45 ? '#c9a227' : '#ff4466') + ';font-family:monospace">' + wr.toFixed(0) + '%</td>' +
                '<td style="font-family:monospace;color:' + (s.pnl >= 0 ? '#00ff88' : '#ff4466') + ';font-weight:600">' + (s.pnl >= 0 ? '+' : '') + '$' + s.pnl.toFixed(0) + '</td></tr>';
        });
        html += '</tbody></table></div>';

        // Recent trades
        var emoIcons = { confident: '😎', neutral: '😐', anxious: '😰', fomo: '🤑', disciplined: '🧘', impulsive: '⚡' };
        html += '<div class="sol-section"><div class="sol-section-title">📋 Trade Journal</div>' +
            '<table class="sol-table"><thead><tr><th>Date</th><th>Pair</th><th>Side</th><th>PnL</th><th>Strategy</th><th>Emotion</th><th>Rating</th></tr></thead><tbody>';
        this.entries.slice().reverse().slice(0, 20).forEach(function(e) {
            var sideClass = e.side === 'LONG' ? 'sol-tag-green' : 'sol-tag-red';
            var pnlColor = e.pnlUsd >= 0 ? '#00ff88' : '#ff4466';
            var stars = '';
            for (var s = 0; s < 5; s++) stars += s < e.rating ? '★' : '☆';
            html += '<tr><td style="color:#888;font-size:11px">' + e.date + '</td>' +
                '<td><strong>' + e.pair + '</strong></td>' +
                '<td><span class="sol-tag ' + sideClass + '" style="font-size:10px">' + e.side + '</span></td>' +
                '<td style="font-family:monospace;color:' + pnlColor + ';font-weight:600">' + (e.pnlUsd >= 0 ? '+' : '') + '$' + e.pnlUsd.toFixed(2) + '<div style="font-size:9px;color:#555">' + (e.pnlPct >= 0 ? '+' : '') + e.pnlPct.toFixed(2) + '%</div></td>' +
                '<td><span class="sol-tag sol-tag-blue" style="font-size:10px">' + e.strategy + '</span></td>' +
                '<td style="font-size:14px" title="' + e.emotion + '">' + (emoIcons[e.emotion] || '❓') + '</td>' +
                '<td style="color:#c9a227;font-size:11px;letter-spacing:-1px">' + stars + '</td></tr>';
        });
        html += '</tbody></table></div>';

        // Tips
        var bestEmo = '', bestEmoPnl = -Infinity;
        Object.keys(emoStats).forEach(function(k) { if (emoStats[k].pnl > bestEmoPnl) { bestEmoPnl = emoStats[k].pnl; bestEmo = k; } });
        var worstEmo = '', worstEmoPnl = Infinity;
        Object.keys(emoStats).forEach(function(k) { if (emoStats[k].pnl < worstEmoPnl) { worstEmoPnl = emoStats[k].pnl; worstEmo = k; } });

        html += '<div class="sol-section"><div class="sol-section-title">💡 Insights</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">';
        if (bestEmo) html += '<div style="flex:1;min-width:200px;background:#00ff8810;border:1px solid #00ff8830;border-radius:8px;padding:10px"><div style="color:#00ff88;font-weight:700;font-size:12px">Best emotion: ' + (emoIcons[bestEmo] || '') + ' ' + bestEmo + '</div><div style="color:#888;font-size:11px;margin-top:4px">PnL: +$' + bestEmoPnl.toFixed(0) + ' - Trade more often in this state</div></div>';
        if (worstEmo && worstEmoPnl < 0) html += '<div style="flex:1;min-width:200px;background:#ff446610;border:1px solid #ff446630;border-radius:8px;padding:10px"><div style="color:#ff4466;font-weight:700;font-size:12px">Worst emotion: ' + (emoIcons[worstEmo] || '') + ' ' + worstEmo + '</div><div style="color:#888;font-size:11px;margin-top:4px">PnL: $' + worstEmoPnl.toFixed(0) + ' - Avoid trading in this state</div></div>';
        html += '</div></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('trading-journal', TradingJournal, 'retail', {
    icon: '📓', name: 'Trading Journal', description: 'Trade journal with emotion tracking, strategy analysis, and detailed performance breakdown'
});
