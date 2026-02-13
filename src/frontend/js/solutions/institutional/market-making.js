/* ============================================
   MARKET MAKING - Automated market making suite
   ============================================ */

const MarketMaking = {
    bots: [],

    init() {
        try { this.bots = JSON.parse(localStorage.getItem('obelisk_mm_bots') || '[]'); } catch(e) { this.bots = []; }
        if (this.bots.length === 0) {
            this.bots = [
                { id: 'mm1', pair: 'BTC/USDC', strategy: 'Grid', spread: 0.05, depth: '$2.4M', pnl24h: 1250, volume24h: 18500000, fills: 342, status: 'running', uptime: '14d 6h' },
                { id: 'mm2', pair: 'ETH/USDC', strategy: 'Avellaneda-Stoikov', spread: 0.08, depth: '$1.8M', pnl24h: 890, volume24h: 12300000, fills: 215, status: 'running', uptime: '14d 6h' },
                { id: 'mm3', pair: 'SOL/USDC', strategy: 'Grid', spread: 0.12, depth: '$800K', pnl24h: -120, volume24h: 4500000, fills: 156, status: 'running', uptime: '3d 12h' },
                { id: 'mm4', pair: 'ARB/USDC', strategy: 'Constant Spread', spread: 0.15, depth: '$400K', pnl24h: 340, volume24h: 2100000, fills: 89, status: 'paused', uptime: '0d' }
            ];
        }
    },

    save() { localStorage.setItem('obelisk_mm_bots', JSON.stringify(this.bots)); },

    getAggregateStats() {
        var totalPnl = 0, totalVolume = 0, totalFills = 0;
        this.bots.forEach(function(b) {
            if (b.status === 'running') {
                totalPnl += b.pnl24h;
                totalVolume += b.volume24h;
                totalFills += b.fills;
            }
        });
        return { pnl24h: totalPnl, volume24h: totalVolume, fills24h: totalFills, activeBots: this.bots.filter(function(b) { return b.status === 'running'; }).length };
    },

    renderOrderBook(width, height) {
        var svg = '<svg width="' + width + '" height="' + height + '">';
        var midY = height / 2;
        for (var i = 0; i < 8; i++) {
            var bidW = (0.9 - i * 0.08) * width / 2;
            var askW = (0.85 - i * 0.07) * width / 2;
            var y = i * (height / 8);
            svg += '<rect x="' + (width / 2 - bidW) + '" y="' + y + '" width="' + bidW + '" height="' + (height / 8 - 2) + '" fill="#00ff88" opacity="' + Math.max(0.06, 0.3 - i * 0.03) + '" rx="2"/>';
            svg += '<rect x="' + (width / 2) + '" y="' + y + '" width="' + askW + '" height="' + (height / 8 - 2) + '" fill="#ff4466" opacity="' + Math.max(0.06, 0.3 - i * 0.03) + '" rx="2"/>';
        }
        svg += '<line x1="' + (width / 2) + '" y1="0" x2="' + (width / 2) + '" y2="' + height + '" stroke="#333" stroke-width="1" stroke-dasharray="3,3"/>';
        svg += '<text x="' + (width / 4) + '" y="' + (height - 5) + '" text-anchor="middle" fill="#00ff88" font-size="10">BIDS</text>';
        svg += '<text x="' + (width * 3 / 4) + '" y="' + (height - 5) + '" text-anchor="middle" fill="#ff4466" font-size="10">ASKS</text>';
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var stats = this.getAggregateStats();
        var self = this;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (stats.pnl24h >= 0 ? 'green' : 'red') + '">$' + stats.pnl24h.toLocaleString() + '</div><div class="sol-stat-label">24h PnL</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">$' + (stats.volume24h / 1000000).toFixed(1) + 'M</div><div class="sol-stat-label">24h Volume</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + stats.fills24h + '</div><div class="sol-stat-label">24h Fills</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + stats.activeBots + '</div><div class="sol-stat-label">Active Bots</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Aggregated Order Book</div>' +
            '<div style="padding:10px 0;text-align:center">' + this.renderOrderBook(500, 120) + '</div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🤖 Market Making Bots</div>';
        this.bots.forEach(function(b) {
            var pnlColor = b.pnl24h >= 0 ? '#00ff88' : '#ff4466';
            var statusColor = b.status === 'running' ? '#00ff88' : '#c9a227';
            html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:12px;' + (b.status === 'running' ? 'border-color:#00ff8822' : '') + '">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
                '<div><strong style="color:#fff;font-size:15px">' + b.pair + '</strong>' +
                '<span style="color:#888;font-size:12px;margin-left:8px">' + b.strategy + '</span></div>' +
                '<div style="display:flex;gap:8px;align-items:center"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + statusColor + '"></span>' +
                '<button class="sol-btn sol-btn-sm ' + (b.status === 'running' ? 'sol-btn-danger' : 'sol-btn-primary') + ' mm-toggle" data-id="' + b.id + '">' + (b.status === 'running' ? 'Stop' : 'Start') + '</button></div></div>' +
                '<div class="sol-stats-row" style="margin-bottom:0">' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px;color:' + pnlColor + '">' + (b.pnl24h >= 0 ? '+$' : '-$') + Math.abs(b.pnl24h) + '</div><div class="sol-stat-label">24h PnL</div></div>' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px">' + b.spread + '%</div><div class="sol-stat-label">Spread</div></div>' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px">' + b.depth + '</div><div class="sol-stat-label">Depth</div></div>' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px">' + b.fills + '</div><div class="sol-stat-label">Fills</div></div>' +
                '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px;color:#888">' + b.uptime + '</div><div class="sol-stat-label">Uptime</div></div>' +
                '</div></div>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">➕ Deploy New Bot</div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Trading Pair</label>' +
            '<select class="sol-select sol-input" id="mm-pair"><option>BTC/USDC</option><option>ETH/USDC</option><option>SOL/USDC</option><option>ARB/USDC</option><option>LINK/USDC</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Strategy</label>' +
            '<select class="sol-select sol-input" id="mm-strat"><option>Grid</option><option>Avellaneda-Stoikov</option><option>Constant Spread</option><option>Inventory-Based</option></select></div></div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Target Spread (%)</label><input class="sol-input" id="mm-spread" type="number" step="0.01" value="0.10"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Capital ($)</label><input class="sol-input" id="mm-capital" type="number" value="100000"></div></div>' +
            '<button class="sol-btn sol-btn-primary" id="mm-deploy" style="margin-top:8px">Deploy Bot</button></div>';

        c.innerHTML = html;
        c.querySelectorAll('.mm-toggle').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var bot = self.bots.find(function(b) { return b.id === btn.dataset.id; });
                if (bot) {
                    bot.status = bot.status === 'running' ? 'paused' : 'running';
                    self.save();
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.info('Bot ' + (bot.status === 'running' ? 'started' : 'stopped'));
                    self.render('solution-body');
                }
            });
        });
        var deployBtn = c.querySelector('#mm-deploy');
        if (deployBtn) deployBtn.addEventListener('click', function() {
            if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Market making bot deployed');
        });
    }
};

SolutionsHub.registerSolution('market-making', MarketMaking, 'institutional', {
    icon: '📈', name: 'Market Making', description: 'Automated market making with grid, Avellaneda-Stoikov, and inventory-based strategies'
});
