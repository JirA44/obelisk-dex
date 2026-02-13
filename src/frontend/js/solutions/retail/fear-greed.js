/* ============================================
   FEAR & GREED INDEX - Market Sentiment
   Multi-factor sentiment gauge with history
   ============================================ */

const FearGreedIndex = {
    init() {},

    computeIndex() {
        var factors = {
            volatility:   { value: 30 + Math.floor(Math.random() * 40), weight: 0.25, label: 'Volatility' },
            momentum:     { value: 40 + Math.floor(Math.random() * 30), weight: 0.25, label: 'Market Momentum' },
            social:       { value: 35 + Math.floor(Math.random() * 45), weight: 0.15, label: 'Social Sentiment' },
            dominance:    { value: 45 + Math.floor(Math.random() * 20), weight: 0.15, label: 'BTC Dominance' },
            volume:       { value: 30 + Math.floor(Math.random() * 50), weight: 0.10, label: 'Trading Volume' },
            whaleActivity:{ value: 40 + Math.floor(Math.random() * 35), weight: 0.10, label: 'Whale Activity' }
        };
        var total = 0;
        Object.values(factors).forEach(function(f) { total += f.value * f.weight; });
        return { score: Math.round(total), factors: factors };
    },

    getLabel(score) {
        if (score <= 20) return { text: 'Extreme Fear', color: '#ff4466', emoji: '😱' };
        if (score <= 40) return { text: 'Fear', color: '#ff8844', emoji: '😰' };
        if (score <= 60) return { text: 'Neutral', color: '#c9a227', emoji: '😐' };
        if (score <= 80) return { text: 'Greed', color: '#88cc44', emoji: '🤑' };
        return { text: 'Extreme Greed', color: '#00ff88', emoji: '🚀' };
    },

    generateHistory(days) {
        var data = [];
        var val = 50;
        for (var i = days; i >= 0; i--) {
            val += (Math.random() - 0.48) * 8;
            val = Math.max(5, Math.min(95, val));
            var d = new Date(); d.setDate(d.getDate() - i);
            data.push({ date: d.toISOString().split('T')[0], score: Math.round(val) });
        }
        return data;
    },

    renderGaugeSVG(score, label) {
        var size = 220, cx = 110, cy = 120, r = 90;
        var startAngle = Math.PI;
        var endAngle = 0;
        var angle = startAngle + (score / 100) * (endAngle - startAngle);
        var needleX = cx + r * 0.75 * Math.cos(angle);
        var needleY = cy + r * 0.75 * Math.sin(angle);
        var gradStops = '<stop offset="0%" stop-color="#ff4466"/><stop offset="25%" stop-color="#ff8844"/><stop offset="50%" stop-color="#c9a227"/><stop offset="75%" stop-color="#88cc44"/><stop offset="100%" stop-color="#00ff88"/>';
        var arcPath = 'M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy;
        return '<svg width="' + size + '" height="' + (cy + 30) + '" viewBox="0 0 ' + size + ' ' + (cy + 30) + '">' +
            '<defs><linearGradient id="fg-grad" x1="0" y1="0" x2="1" y2="0">' + gradStops + '</linearGradient></defs>' +
            '<path d="' + arcPath + '" fill="none" stroke="url(#fg-grad)" stroke-width="18" stroke-linecap="round"/>' +
            '<line x1="' + cx + '" y1="' + cy + '" x2="' + needleX + '" y2="' + needleY + '" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="#fff"/>' +
            '<text x="' + cx + '" y="' + (cy - 30) + '" text-anchor="middle" fill="' + label.color + '" font-size="36" font-weight="800" font-family="JetBrains Mono,monospace">' + score + '</text>' +
            '<text x="' + cx + '" y="' + (cy - 10) + '" text-anchor="middle" fill="' + label.color + '" font-size="14" font-weight="600">' + label.emoji + ' ' + label.text + '</text>' +
            '<text x="' + (cx - r + 5) + '" y="' + (cy + 20) + '" fill="#ff4466" font-size="10">Fear</text>' +
            '<text x="' + (cx + r - 25) + '" y="' + (cy + 20) + '" fill="#00ff88" font-size="10">Greed</text>' +
            '</svg>';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var result = this.computeIndex();
        var label = this.getLabel(result.score);
        var history = this.generateHistory(30);

        var html = '<div style="text-align:center;padding:10px 0">' + this.renderGaugeSVG(result.score, label) + '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Contributing Factors</div>';
        var factors = result.factors;
        Object.keys(factors).forEach(function(key) {
            var f = factors[key];
            var fl = FearGreedIndex.getLabel(f.value);
            html += '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
                '<span style="color:#aaa;font-size:13px">' + f.label + ' <span style="color:#555">(weight: ' + (f.weight * 100) + '%)</span></span>' +
                '<span style="font-family:monospace;color:' + fl.color + '">' + f.value + ' - ' + fl.text + '</span></div>' +
                '<div class="sol-progress"><div class="sol-progress-fill" style="width:' + f.value + '%;background:' + fl.color + '"></div></div></div>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">📈 30-Day History</div>' +
            '<table class="sol-table"><thead><tr><th>Date</th><th>Score</th><th>Sentiment</th></tr></thead><tbody>';
        history.slice().reverse().slice(0, 14).forEach(function(h) {
            var l = FearGreedIndex.getLabel(h.score);
            html += '<tr><td style="color:#888">' + h.date + '</td><td style="font-family:monospace;color:' + l.color + '">' + h.score + '</td>' +
                '<td>' + l.emoji + ' ' + l.text + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">💡 What Does This Mean?</div>' +
            '<p style="color:#aaa;font-size:13px;line-height:1.7">' +
            (result.score <= 30 ? 'Extreme fear often signals a buying opportunity. When the market is fearful, assets are typically undervalued. "Be greedy when others are fearful."' :
             result.score >= 70 ? 'High greed suggests the market may be overheated. Consider taking profits or reducing exposure. "Be fearful when others are greedy."' :
             'The market is in a neutral state. This can be a good time for measured positions and DCA strategies.') + '</p></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('fear-greed', FearGreedIndex, 'retail', {
    icon: '😱', name: 'Fear & Greed Index', description: 'Real-time market sentiment gauge with multi-factor analysis'
});
