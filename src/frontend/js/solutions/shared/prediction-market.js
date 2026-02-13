/* ============================================
   PREDICTION MARKET - Bet on outcomes
   ============================================ */

const PredictionMarket = {
    bets: [],

    init() {
        try { this.bets = JSON.parse(localStorage.getItem('obelisk_predictions') || '[]'); } catch(e) { this.bets = []; }
    },

    save() { localStorage.setItem('obelisk_predictions', JSON.stringify(this.bets)); },

    getMarkets() {
        return [
            { id: 'pm1', question: 'Will BTC reach $120K before July 2026?', yesPrice: 0.62, volume: '$1.2M', expires: '2026-07-01', category: 'Crypto', hot: true },
            { id: 'pm2', question: 'Will ETH flip BTC in market cap by 2027?', yesPrice: 0.08, volume: '$890K', expires: '2027-01-01', category: 'Crypto', hot: false },
            { id: 'pm3', question: 'Will the Fed cut rates in Q1 2026?', yesPrice: 0.74, volume: '$3.4M', expires: '2026-03-31', category: 'Macro', hot: true },
            { id: 'pm4', question: 'Will Solana reach $500 in 2026?', yesPrice: 0.23, volume: '$560K', expires: '2026-12-31', category: 'Crypto', hot: false },
            { id: 'pm5', question: 'Will a spot ETH ETF be approved in Asia in 2026?', yesPrice: 0.41, volume: '$750K', expires: '2026-12-31', category: 'Regulation', hot: false },
            { id: 'pm6', question: 'Will total crypto market cap exceed $5T in 2026?', yesPrice: 0.55, volume: '$2.1M', expires: '2026-12-31', category: 'Crypto', hot: true },
            { id: 'pm7', question: 'Will DeFi TVL exceed $300B by end of 2026?', yesPrice: 0.38, volume: '$420K', expires: '2026-12-31', category: 'DeFi', hot: false },
            { id: 'pm8', question: 'Will there be a major exchange hack (>$100M) in 2026?', yesPrice: 0.67, volume: '$180K', expires: '2026-12-31', category: 'Security', hot: false }
        ];
    },

    renderPriceBar(yesPrice, width) {
        var yesPct = yesPrice * 100;
        var noPct = 100 - yesPct;
        return '<div style="display:flex;height:24px;border-radius:6px;overflow:hidden;width:' + width + 'px;font-size:11px;font-weight:600">' +
            '<div style="width:' + yesPct + '%;background:#00ff8833;color:#00ff88;display:flex;align-items:center;justify-content:center">' + (yesPct >= 15 ? 'YES ' + yesPct.toFixed(0) + '¢' : '') + '</div>' +
            '<div style="width:' + noPct + '%;background:#ff446633;color:#ff4466;display:flex;align-items:center;justify-content:center">' + (noPct >= 15 ? 'NO ' + noPct.toFixed(0) + '¢' : '') + '</div></div>';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var markets = this.getMarkets();
        var self = this;
        var totalVolume = markets.reduce(function(s, m) { return s + parseFloat(m.volume.replace(/[$MK,]/g, '')) * (m.volume.includes('M') ? 1000000 : 1000); }, 0);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + markets.length + '</div><div class="sol-stat-label">Active Markets</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + (totalVolume / 1000000).toFixed(1) + 'M</div><div class="sol-stat-label">Total Volume</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.bets.length + '</div><div class="sol-stat-label">Your Positions</div></div></div>';

        var categories = ['All', 'Crypto', 'Macro', 'Regulation', 'DeFi', 'Security'];
        html += '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">';
        categories.forEach(function(cat, i) {
            html += '<button class="sol-btn sol-btn-sm ' + (i === 0 ? 'sol-btn-primary' : 'sol-btn-outline') + ' pm-filter" data-cat="' + cat + '">' + cat + '</button>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">🔮 Markets</div>';
        markets.forEach(function(m) {
            html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:12px" data-category="' + m.category + '">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">' +
                '<div style="flex:1"><strong style="color:#fff;font-size:14px">' + m.question + '</strong>' +
                (m.hot ? ' <span style="color:#ff8844;font-size:11px">🔥 HOT</span>' : '') +
                '<div style="font-size:11px;color:#555;margin-top:4px"><span class="sol-tag sol-tag-blue" style="font-size:10px">' + m.category + '</span> Expires: ' + m.expires + ' | Vol: ' + m.volume + '</div></div></div>' +
                '<div style="margin-bottom:10px">' + self.renderPriceBar(m.yesPrice, 400) + '</div>' +
                '<div style="display:flex;gap:8px">' +
                '<button class="sol-btn sol-btn-sm pm-bet" data-id="' + m.id + '" data-side="yes" style="background:#00ff8822;color:#00ff88;border:1px solid #00ff8844">Buy YES @ ' + (m.yesPrice * 100).toFixed(0) + '¢</button>' +
                '<button class="sol-btn sol-btn-sm pm-bet" data-id="' + m.id + '" data-side="no" style="background:#ff446622;color:#ff4466;border:1px solid #ff446644">Buy NO @ ' + ((1 - m.yesPrice) * 100).toFixed(0) + '¢</button>' +
                '</div></div>';
        });
        html += '</div>';

        c.innerHTML = html;
        c.querySelectorAll('.pm-bet').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var side = btn.dataset.side.toUpperCase();
                self.bets.push({ marketId: btn.dataset.id, side: side, time: new Date().toISOString() });
                self.save();
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Bought ' + side + ' position');
            });
        });
    }
};

SolutionsHub.registerSolution('prediction-market', PredictionMarket, 'shared', {
    icon: '🔮', name: 'Prediction Market', description: 'Trade on the outcome of crypto, macro, and regulatory events'
});
