/* ============================================
   CROSS-CHAIN BRIDGE - Bridge assets across chains
   ============================================ */

const CrossChainBridge = {
    history: [],

    init() {
        try { this.history = JSON.parse(localStorage.getItem('obelisk_bridge_history') || '[]'); } catch(e) { this.history = []; }
    },

    save() { localStorage.setItem('obelisk_bridge_history', JSON.stringify(this.history)); },

    getChains() {
        return [
            { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA', gasPrice: '18 gwei', speed: '~12 min' },
            { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', color: '#28A0F0', gasPrice: '0.1 gwei', speed: '~1 min' },
            { id: 'optimism', name: 'Optimism', icon: '🔴', color: '#FF0420', gasPrice: '0.05 gwei', speed: '~2 min' },
            { id: 'polygon', name: 'Polygon', icon: '🟣', color: '#8247E5', gasPrice: '30 gwei', speed: '~5 min' },
            { id: 'base', name: 'Base', icon: '🔷', color: '#0052FF', gasPrice: '0.02 gwei', speed: '~2 min' },
            { id: 'avalanche', name: 'Avalanche', icon: '🔺', color: '#E84142', gasPrice: '25 nAVAX', speed: '~3 min' },
            { id: 'bsc', name: 'BNB Chain', icon: '🟡', color: '#F0B90B', gasPrice: '3 gwei', speed: '~3 min' },
            { id: 'solana', name: 'Solana', icon: '🟢', color: '#9945FF', gasPrice: '0.00025 SOL', speed: '~1 min' }
        ];
    },

    getRoutes(from, to, asset, amount) {
        var routes = [
            { provider: 'Stargate', fee: 0.06, time: '2-5 min', gas: '$0.45', rating: 4.8 },
            { provider: 'Across', fee: 0.04, time: '1-3 min', gas: '$0.32', rating: 4.6 },
            { provider: 'Hop Protocol', fee: 0.08, time: '5-10 min', gas: '$0.55', rating: 4.5 },
            { provider: 'Synapse', fee: 0.07, time: '3-8 min', gas: '$0.48', rating: 4.4 },
            { provider: 'Celer cBridge', fee: 0.05, time: '2-5 min', gas: '$0.40', rating: 4.3 }
        ];
        return routes.map(function(r) {
            var feeAmt = amount * r.fee / 100;
            var receive = amount - feeAmt;
            return {
                provider: r.provider, fee: r.fee + '%', feeUsd: '$' + feeAmt.toFixed(2),
                receive: receive.toFixed(2), time: r.time, gas: r.gas, rating: r.rating,
                total: '$' + (feeAmt + parseFloat(r.gas.replace('$', ''))).toFixed(2)
            };
        });
    },

    getRecentBridges() {
        return [
            { id: 'b1', from: 'Ethereum', to: 'Arbitrum', asset: 'USDC', amount: '$5,000', status: 'completed', time: '2h ago', txHash: '0xabc...123', provider: 'Stargate' },
            { id: 'b2', from: 'Arbitrum', to: 'Base', asset: 'ETH', amount: '2.5 ETH', status: 'completed', time: '5h ago', txHash: '0xdef...456', provider: 'Across' },
            { id: 'b3', from: 'Polygon', to: 'Ethereum', asset: 'USDC', amount: '$12,000', status: 'pending', time: '15m ago', txHash: '0x789...abc', provider: 'Hop' },
            { id: 'b4', from: 'Ethereum', to: 'Optimism', asset: 'DAI', amount: '$3,000', status: 'completed', time: '1d ago', txHash: '0xcba...654', provider: 'Synapse' }
        ];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var chains = this.getChains();
        var recent = this.getRecentBridges();
        var self = this;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + chains.length + '</div><div class="sol-stat-label">Chains</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">5</div><div class="sol-stat-label">Bridge Providers</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + recent.length + '</div><div class="sol-stat-label">Recent Bridges</div></div></div>';

        // Bridge form
        html += '<div class="sol-section"><div class="sol-section-title">🌉 Bridge Assets</div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">From Chain</label>' +
            '<select class="sol-select sol-input" id="br-from">';
        chains.forEach(function(ch) { html += '<option value="' + ch.id + '">' + ch.icon + ' ' + ch.name + '</option>'; });
        html += '</select></div><div class="sol-form-group" style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px"><span style="font-size:20px;color:#555">→</span></div>' +
            '<div class="sol-form-group"><label class="sol-label">To Chain</label>' +
            '<select class="sol-select sol-input" id="br-to">';
        chains.forEach(function(ch, i) { html += '<option value="' + ch.id + '"' + (i === 1 ? ' selected' : '') + '>' + ch.icon + ' ' + ch.name + '</option>'; });
        html += '</select></div></div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Asset</label>' +
            '<select class="sol-select sol-input" id="br-asset"><option>USDC</option><option>USDT</option><option>ETH</option><option>DAI</option><option>WBTC</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Amount</label><input class="sol-input" id="br-amount" type="number" value="1000" placeholder="Amount"></div></div>' +
            '<button class="sol-btn sol-btn-primary" id="br-find" style="margin-top:8px">Find Best Route</button></div>';

        html += '<div id="br-routes"></div>';

        // Supported chains
        html += '<div class="sol-section"><div class="sol-section-title">⛓️ Supported Chains</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">';
        chains.forEach(function(ch) {
            html += '<div style="padding:12px;border:1px solid #1a1a1a;border-radius:8px;display:flex;align-items:center;gap:10px">' +
                '<span style="font-size:24px">' + ch.icon + '</span>' +
                '<div><strong style="color:#fff;font-size:13px">' + ch.name + '</strong>' +
                '<div style="font-size:10px;color:#555">Gas: ' + ch.gasPrice + ' | ' + ch.speed + '</div></div></div>';
        });
        html += '</div></div>';

        // Recent bridges
        html += '<div class="sol-section"><div class="sol-section-title">📋 Recent Bridges</div>' +
            '<table class="sol-table"><thead><tr><th>Route</th><th>Asset</th><th>Amount</th><th>Provider</th><th>Status</th><th>Time</th></tr></thead><tbody>';
        recent.forEach(function(b) {
            var statusTag = b.status === 'completed' ? 'sol-tag-green' : 'sol-tag-yellow';
            html += '<tr><td style="font-size:12px">' + b.from + ' → ' + b.to + '</td>' +
                '<td>' + b.asset + '</td>' +
                '<td style="font-family:monospace">' + b.amount + '</td>' +
                '<td style="color:#888">' + b.provider + '</td>' +
                '<td><span class="sol-tag ' + statusTag + '">' + b.status + '</span></td>' +
                '<td style="color:#555;font-size:12px">' + b.time + '</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;

        var findBtn = c.querySelector('#br-find');
        if (findBtn) findBtn.addEventListener('click', function() {
            var amount = parseFloat(document.getElementById('br-amount').value) || 1000;
            var routes = self.getRoutes(
                document.getElementById('br-from').value,
                document.getElementById('br-to').value,
                document.getElementById('br-asset').value,
                amount
            );
            var routeHtml = '<div class="sol-section"><div class="sol-section-title">🛤️ Available Routes (sorted by cost)</div>';
            routes.sort(function(a, b) { return parseFloat(a.total.replace('$', '')) - parseFloat(b.total.replace('$', '')); });
            routes.forEach(function(r, i) {
                var isBest = i === 0;
                routeHtml += '<div style="padding:14px;border:1px solid ' + (isBest ? '#00ff8844' : '#1a1a1a') + ';border-radius:10px;margin-bottom:8px;' + (isBest ? 'background:rgba(0,255,136,0.02)' : '') + '">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center">' +
                    '<div><strong style="color:#fff">' + r.provider + '</strong>' + (isBest ? ' <span style="color:#00ff88;font-size:11px">BEST</span>' : '') +
                    '<div style="font-size:11px;color:#555">Time: ' + r.time + ' | Rating: ' + r.rating + '/5</div></div>' +
                    '<div style="text-align:right"><div style="font-family:monospace;color:#00ff88;font-size:15px">' + r.receive + ' receive</div>' +
                    '<div style="font-size:11px;color:#888">Fee: ' + r.feeUsd + ' + Gas: ' + r.gas + ' = <span style="color:#c9a227">' + r.total + '</span></div></div></div>' +
                    '<button class="sol-btn sol-btn-sm ' + (isBest ? 'sol-btn-primary' : 'sol-btn-outline') + ' br-execute" style="margin-top:8px">Bridge via ' + r.provider + '</button></div>';
            });
            routeHtml += '</div>';
            document.getElementById('br-routes').innerHTML = routeHtml;
            document.querySelectorAll('.br-execute').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Bridge transaction submitted!');
                });
            });
        });
    }
};

SolutionsHub.registerSolution('cross-chain-bridge', CrossChainBridge, 'shared', {
    icon: '🌉', name: 'Cross-Chain Bridge', description: 'Bridge assets across 8+ chains with best route aggregation and fee comparison'
});
