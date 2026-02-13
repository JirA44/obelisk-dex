/* ============================================
   SMART MONEY FLOW - Track institutional flows
   ============================================ */

const SmartMoneyFlow = {
    init() {},

    getFlows() {
        return {
            topAccumulating: [
                { token: 'ETH', wallets: 42, netBuy: '$28.5M', avgEntry: '$3,380', conviction: 'Very High', change7d: '+15%' },
                { token: 'LINK', wallets: 35, netBuy: '$12.2M', avgEntry: '$21.50', conviction: 'High', change7d: '+28%' },
                { token: 'AAVE', wallets: 28, netBuy: '$8.4M', avgEntry: '$275', conviction: 'High', change7d: '+22%' },
                { token: 'PENDLE', wallets: 24, netBuy: '$5.1M', avgEntry: '$5.05', conviction: 'Medium', change7d: '+35%' },
                { token: 'SUI', wallets: 18, netBuy: '$4.8M', avgEntry: '$1.75', conviction: 'Medium', change7d: '+18%' }
            ],
            topDistributing: [
                { token: 'DOGE', wallets: 38, netSell: '$15.8M', avgExit: '$0.32', conviction: 'High', change7d: '-8%' },
                { token: 'SHIB', wallets: 25, netSell: '$8.2M', avgExit: '$0.000024', conviction: 'Medium', change7d: '-12%' },
                { token: 'SOL', wallets: 15, netSell: '$6.5M', avgExit: '$192', conviction: 'Low', change7d: '-3%' }
            ],
            wallets: [
                { address: '0x28C...e4F', label: 'Galaxy Digital', balance: '$245M', topHoldings: 'BTC, ETH, SOL', lastAction: 'Bought 1,200 ETH', time: '4h ago', pnl7d: '+$4.2M' },
                { address: '0xB0B...a91', label: 'Jump Trading', balance: '$189M', topHoldings: 'ETH, LINK, AAVE', lastAction: 'Sold 50K DOGE', time: '6h ago', pnl7d: '+$1.8M' },
                { address: '0x7F2...c33', label: 'Paradigm Fund', balance: '$520M', topHoldings: 'ETH, UNI, COMP', lastAction: 'Deposited 5K ETH to Lido', time: '12h ago', pnl7d: '+$8.5M' },
                { address: '0x9aD...b72', label: 'Wintermute', balance: '$340M', topHoldings: 'ETH, USDC, ARB', lastAction: 'Bought 500K PENDLE', time: '1d ago', pnl7d: '+$2.1M' },
                { address: '0x5eE...d08', label: 'a16z Crypto', balance: '$890M', topHoldings: 'ETH, SOL, SUI', lastAction: 'Staked 10K SOL', time: '2d ago', pnl7d: '+$12.4M' },
                { address: '0xC1D...f56', label: 'Three Arrows (Remnant)', balance: '$12M', topHoldings: 'ETH, USDC', lastAction: 'Sold 200 ETH', time: '3d ago', pnl7d: '-$400K' }
            ]
        };
    },

    renderFlowBars(accumulating, distributing, width) {
        var maxVal = Math.max(
            Math.max.apply(null, accumulating.map(function(a) { return parseFloat(a.netBuy.replace(/[$M]/g, '')); })),
            Math.max.apply(null, distributing.map(function(d) { return parseFloat(d.netSell.replace(/[$M]/g, '')); }))
        );
        var svg = '<svg width="' + width + '" height="' + ((accumulating.length + distributing.length) * 28 + 30) + '">';
        var y = 5;
        svg += '<text x="5" y="' + y + '" fill="#00ff88" font-size="11" font-weight="600">ACCUMULATING</text>';
        y += 14;
        accumulating.forEach(function(a) {
            var val = parseFloat(a.netBuy.replace(/[$M]/g, ''));
            var w = (val / maxVal) * (width - 100);
            svg += '<text x="5" y="' + (y + 14) + '" fill="#fff" font-size="11" font-weight="600">' + a.token + '</text>';
            svg += '<rect x="60" y="' + (y + 3) + '" width="' + w + '" height="14" fill="#00ff88" opacity="0.5" rx="3"/>';
            svg += '<text x="' + (65 + w) + '" y="' + (y + 14) + '" fill="#00ff88" font-size="10">' + a.netBuy + '</text>';
            y += 24;
        });
        y += 10;
        svg += '<text x="5" y="' + y + '" fill="#ff4466" font-size="11" font-weight="600">DISTRIBUTING</text>';
        y += 14;
        distributing.forEach(function(d) {
            var val = parseFloat(d.netSell.replace(/[$M]/g, ''));
            var w = (val / maxVal) * (width - 100);
            svg += '<text x="5" y="' + (y + 14) + '" fill="#fff" font-size="11" font-weight="600">' + d.token + '</text>';
            svg += '<rect x="60" y="' + (y + 3) + '" width="' + w + '" height="14" fill="#ff4466" opacity="0.5" rx="3"/>';
            svg += '<text x="' + (65 + w) + '" y="' + (y + 14) + '" fill="#ff4466" font-size="10">' + d.netSell + '</text>';
            y += 24;
        });
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var data = this.getFlows();
        var totalAccum = 0, totalDist = 0;
        data.topAccumulating.forEach(function(a) { totalAccum += parseFloat(a.netBuy.replace(/[$M]/g, '')); });
        data.topDistributing.forEach(function(d) { totalDist += parseFloat(d.netSell.replace(/[$M]/g, '')); });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + totalAccum.toFixed(0) + 'M</div><div class="sol-stat-label">Net Accumulation</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">$' + totalDist.toFixed(0) + 'M</div><div class="sol-stat-label">Net Distribution</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (totalAccum > totalDist ? 'green' : 'red') + '">' + (totalAccum > totalDist ? 'Bullish' : 'Bearish') + '</div><div class="sol-stat-label">Smart Money Signal</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + data.wallets.length + '</div><div class="sol-stat-label">Tracked Wallets</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Smart Money Flows (7d)</div>' +
            '<div style="padding:10px 0">' + this.renderFlowBars(data.topAccumulating, data.topDistributing, 560) + '</div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🟢 Top Accumulating</div>' +
            '<table class="sol-table"><thead><tr><th>Token</th><th>Smart Wallets</th><th>Net Buy</th><th>Avg Entry</th><th>Conviction</th><th>7d Price</th></tr></thead><tbody>';
        data.topAccumulating.forEach(function(a) {
            var convColor = a.conviction === 'Very High' ? '#00ff88' : a.conviction === 'High' ? '#88cc44' : '#c9a227';
            html += '<tr><td><strong>' + a.token + '</strong></td><td style="font-family:monospace;color:#00d4ff">' + a.wallets + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">' + a.netBuy + '</td>' +
                '<td style="font-family:monospace">' + a.avgEntry + '</td>' +
                '<td style="color:' + convColor + ';font-weight:600;font-size:12px">' + a.conviction + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">' + a.change7d + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🏛️ Tracked Wallets</div>';
        data.wallets.forEach(function(w) {
            var pnlColor = w.pnl7d.startsWith('+') ? '#00ff88' : '#ff4466';
            html += '<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #111;align-items:center">' +
                '<div style="width:40px;height:40px;background:#111;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:#00d4ff;font-weight:700">' + w.label.charAt(0) + '</div>' +
                '<div style="flex:1"><div style="display:flex;justify-content:space-between"><strong style="color:#fff">' + w.label + '</strong>' +
                '<span style="font-family:monospace;color:' + pnlColor + '">' + w.pnl7d + ' (7d)</span></div>' +
                '<div style="font-size:11px;color:#555">' + w.address + ' | Balance: ' + w.balance + '</div>' +
                '<div style="font-size:11px;color:#888;margin-top:2px">' + w.lastAction + ' <span style="color:#555">' + w.time + '</span></div></div></div>';
        });
        html += '</div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('smart-money-flow', SmartMoneyFlow, 'institutional', {
    icon: '🧠', name: 'Smart Money Flow', description: 'Track institutional wallet accumulation, distribution, and conviction signals'
});
