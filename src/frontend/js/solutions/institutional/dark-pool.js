/* ============================================
   DARK POOL - Anonymous large-block trading
   ============================================ */

const DarkPool = {
    orders: [],

    init() {
        try { this.orders = JSON.parse(localStorage.getItem('obelisk_darkpool_orders') || '[]'); } catch(e) { this.orders = []; }
        if (this.orders.length === 0) this.generateOrders();
    },

    save() { localStorage.setItem('obelisk_darkpool_orders', JSON.stringify(this.orders)); },

    generateOrders() {
        this.orders = [
            { id: 'dp1', side: 'BUY', asset: 'BTC', size: '250 BTC', notional: '$24.4M', filled: 62, avgPrice: '$97,480', status: 'active', created: '45m ago' },
            { id: 'dp2', side: 'SELL', asset: 'ETH', size: '15,000 ETH', notional: '$51M', filled: 100, avgPrice: '$3,401', status: 'completed', created: '2h ago' },
            { id: 'dp3', side: 'BUY', asset: 'SOL', size: '100,000 SOL', notional: '$19M', filled: 28, avgPrice: '$189.50', status: 'active', created: '1h ago' },
            { id: 'dp4', side: 'SELL', asset: 'BTC', size: '500 BTC', notional: '$48.7M', filled: 0, avgPrice: '-', status: 'pending', created: '5m ago' }
        ];
    },

    getPoolStats() {
        return {
            volume24h: '$284M', matches24h: 47, avgSize: '$6.04M',
            participants: 23, bestBid: { asset: 'BTC', size: '150 BTC', price: '$97,520' },
            bestAsk: { asset: 'BTC', size: '200 BTC', price: '$97,580' },
            spread: '0.06%', depth: '$182M'
        };
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var stats = this.getPoolStats();
        var self = this;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + stats.volume24h + '</div><div class="sol-stat-label">24h Volume</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + stats.matches24h + '</div><div class="sol-stat-label">Matches</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + stats.avgSize + '</div><div class="sol-stat-label">Avg Block Size</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + stats.spread + '</div><div class="sol-stat-label">Spread</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Pool Depth</div>' +
            '<div class="sol-stats-row">' +
            '<div class="sol-stat-card" style="border-color:#00ff8833"><div style="font-size:11px;color:#888;margin-bottom:4px">Best Bid</div>' +
            '<div style="color:#00ff88;font-family:monospace;font-size:16px;font-weight:700">' + stats.bestBid.price + '</div>' +
            '<div style="font-size:11px;color:#555">' + stats.bestBid.size + '</div></div>' +
            '<div class="sol-stat-card" style="border-color:#ff446633"><div style="font-size:11px;color:#888;margin-bottom:4px">Best Ask</div>' +
            '<div style="color:#ff4466;font-family:monospace;font-size:16px;font-weight:700">' + stats.bestAsk.price + '</div>' +
            '<div style="font-size:11px;color:#555">' + stats.bestAsk.size + '</div></div>' +
            '<div class="sol-stat-card"><div style="font-size:11px;color:#888;margin-bottom:4px">Total Depth</div>' +
            '<div style="color:#00d4ff;font-family:monospace;font-size:16px;font-weight:700">' + stats.depth + '</div>' +
            '<div style="font-size:11px;color:#555">' + stats.participants + ' participants</div></div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📋 My Block Orders</div>' +
            '<table class="sol-table"><thead><tr><th>Side</th><th>Asset</th><th>Size</th><th>Notional</th><th>Filled</th><th>Avg Price</th><th>Status</th></tr></thead><tbody>';
        this.orders.forEach(function(o) {
            var sideTag = o.side === 'BUY' ? 'sol-tag-green' : 'sol-tag-red';
            var statusTag = o.status === 'completed' ? 'sol-tag-green' : o.status === 'active' ? 'sol-tag-blue' : 'sol-tag-yellow';
            html += '<tr><td><span class="sol-tag ' + sideTag + '">' + o.side + '</span></td>' +
                '<td><strong>' + o.asset + '</strong></td>' +
                '<td style="font-family:monospace">' + o.size + '</td>' +
                '<td style="font-family:monospace;color:#888">' + o.notional + '</td>' +
                '<td><div style="display:flex;align-items:center;gap:6px"><div class="sol-progress" style="width:60px;height:4px"><div class="sol-progress-fill" style="width:' + o.filled + '%"></div></div><span style="font-size:12px;color:#888">' + o.filled + '%</span></div></td>' +
                '<td style="font-family:monospace">' + o.avgPrice + '</td>' +
                '<td><span class="sol-tag ' + statusTag + '">' + o.status + '</span></td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🆕 Submit Block Order</div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Side</label>' +
            '<select class="sol-select sol-input" id="dp-side"><option>BUY</option><option>SELL</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Asset</label>' +
            '<select class="sol-select sol-input" id="dp-asset"><option>BTC</option><option>ETH</option><option>SOL</option></select></div></div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Quantity</label><input class="sol-input" id="dp-qty" type="number" placeholder="e.g. 100"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Limit Price (optional)</label><input class="sol-input" id="dp-price" type="number" placeholder="Market if empty"></div></div>' +
            '<div style="margin-top:4px;font-size:11px;color:#555">Block orders are matched anonymously. Minimum size: $500K notional.</div>' +
            '<button class="sol-btn sol-btn-primary" id="dp-submit" style="margin-top:8px">Submit to Dark Pool</button></div>';

        c.innerHTML = html;
        var submitBtn = c.querySelector('#dp-submit');
        if (submitBtn) submitBtn.addEventListener('click', function() {
            var qty = document.getElementById('dp-qty').value;
            if (!qty) return;
            if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Block order submitted to dark pool');
        });
    }
};

SolutionsHub.registerSolution('dark-pool', DarkPool, 'institutional', {
    icon: '🌑', name: 'Dark Pool', description: 'Anonymous large-block trading with zero market impact and institutional-grade matching'
});
