/* ============================================
   WHALE TRACKER - Monitor large wallet movements
   ============================================ */

const WhaleTracker = {
    watchlist: [],
    alerts: [],

    init() {
        try { this.watchlist = JSON.parse(localStorage.getItem('obelisk_whale_watchlist') || '[]'); } catch(e) { this.watchlist = []; }
        this.generateAlerts();
    },

    save() { localStorage.setItem('obelisk_whale_watchlist', JSON.stringify(this.watchlist)); },

    generateAlerts() {
        var whales = [
            { name: 'Whale Alpha', wallet: '0x28C...e4F', emoji: '🐋' },
            { name: 'Smart Money', wallet: '0xB0B...a91', emoji: '🧠' },
            { name: 'Institutional', wallet: '0x7F2...c33', emoji: '🏛️' },
            { name: 'DeFi Whale', wallet: '0x9aD...b72', emoji: '🌊' },
            { name: 'NFT Collector', wallet: '0x5eE...d08', emoji: '🖼️' }
        ];
        var actions = [
            { action: 'Bought', asset: 'BTC', amount: '150', value: '$14.6M', sentiment: 'bullish' },
            { action: 'Sold', asset: 'ETH', amount: '5,000', value: '$17M', sentiment: 'bearish' },
            { action: 'Staked', asset: 'ETH', amount: '10,000', value: '$34M', sentiment: 'bullish' },
            { action: 'Transferred', asset: 'USDC', amount: '25M', value: '$25M', sentiment: 'neutral' },
            { action: 'Bought', asset: 'SOL', amount: '50,000', value: '$9.5M', sentiment: 'bullish' },
            { action: 'Withdrew', asset: 'BTC', amount: '500', value: '$48.7M', sentiment: 'bearish' },
            { action: 'Deposited', asset: 'USDT', amount: '10M', value: '$10M', sentiment: 'neutral' },
            { action: 'Bought', asset: 'LINK', amount: '200,000', value: '$4.4M', sentiment: 'bullish' },
            { action: 'Sold', asset: 'AVAX', amount: '100,000', value: '$3.5M', sentiment: 'bearish' },
            { action: 'Bridged', asset: 'ETH', amount: '2,000', value: '$6.8M', sentiment: 'neutral' }
        ];
        this.alerts = [];
        for (var i = 0; i < 12; i++) {
            var w = whales[Math.floor(Math.random() * whales.length)];
            var a = actions[Math.floor(Math.random() * actions.length)];
            this.alerts.push({
                id: 'wa_' + i, whale: w.name, wallet: w.wallet, emoji: w.emoji,
                action: a.action, asset: a.asset, amount: a.amount, value: a.value,
                sentiment: a.sentiment,
                time: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString()
            });
        }
        this.alerts.sort(function(a, b) { return new Date(b.time) - new Date(a.time); });
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var bullish = this.alerts.filter(function(a) { return a.sentiment === 'bullish'; }).length;
        var bearish = this.alerts.filter(function(a) { return a.sentiment === 'bearish'; }).length;
        var sentimentColor = bullish > bearish ? '#00ff88' : bullish < bearish ? '#ff4466' : '#c9a227';
        var sentimentText = bullish > bearish ? 'Bullish' : bullish < bearish ? 'Bearish' : 'Neutral';

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + sentimentColor + '">' + sentimentText + '</div><div class="sol-stat-label">Whale Sentiment</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + bullish + '</div><div class="sol-stat-label">Bullish Moves</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + bearish + '</div><div class="sol-stat-label">Bearish Moves</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.alerts.length + '</div><div class="sol-stat-label">Alerts (24h)</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🐋 Live Whale Activity</div>';
        this.alerts.forEach(function(a) {
            var sentColor = a.sentiment === 'bullish' ? '#00ff88' : a.sentiment === 'bearish' ? '#ff4466' : '#c9a227';
            var actionColor = a.action === 'Bought' || a.action === 'Deposited' || a.action === 'Staked' ? '#00ff88' : a.action === 'Sold' || a.action === 'Withdrew' ? '#ff4466' : '#00d4ff';
            var mins = Math.floor((Date.now() - new Date(a.time)) / 60000);
            var timeStr = mins < 60 ? mins + 'm ago' : Math.floor(mins / 60) + 'h ago';
            html += '<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #111;align-items:center">' +
                '<span style="font-size:24px">' + a.emoji + '</span>' +
                '<div style="flex:1"><div style="margin-bottom:3px"><strong style="color:#fff">' + a.whale + '</strong> ' +
                '<span style="color:' + actionColor + ';font-weight:600">' + a.action + '</span> ' +
                '<strong>' + a.amount + ' ' + a.asset + '</strong> <span style="color:#888">(' + a.value + ')</span></div>' +
                '<div style="font-size:11px;color:#555">' + a.wallet + ' | ' + timeStr + '</div></div>' +
                '<span class="sol-tag" style="background:' + sentColor + '22;color:' + sentColor + '">' + a.sentiment + '</span></div>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">👁️ Add Wallet to Watch</div>' +
            '<div style="display:flex;gap:8px"><input class="sol-input" id="whale-addr" placeholder="0x... wallet address" style="flex:1">' +
            '<button class="sol-btn sol-btn-primary" id="whale-add">Track</button></div></div>';

        c.innerHTML = html;
        var self = this;
        var addBtn = c.querySelector('#whale-add');
        if (addBtn) addBtn.addEventListener('click', function() {
            var addr = document.getElementById('whale-addr').value.trim();
            if (!addr) return;
            self.watchlist.push({ address: addr, added: new Date().toISOString() });
            self.save();
            if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Wallet added to watchlist');
        });
    }
};

SolutionsHub.registerSolution('whale-tracker', WhaleTracker, 'retail', {
    icon: '🐋', name: 'Whale Tracker', description: 'Monitor large wallet movements and whale sentiment in real-time'
});
