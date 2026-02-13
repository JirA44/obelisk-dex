/* ============================================
   GAS OPTIMIZER - Find cheapest time to transact
   ============================================ */

const GasOptimizer = {
    init() {},

    getGasData() {
        var hours = [];
        for (var i = 0; i < 24; i++) {
            var base = 18 + Math.sin(i / 24 * Math.PI * 2 - Math.PI / 2) * 12;
            hours.push({ hour: i, gas: Math.max(5, Math.round(base + (Math.random() - 0.5) * 8)), label: (i < 10 ? '0' : '') + i + ':00' });
        }
        return hours;
    },

    getChainGas() {
        return [
            { chain: 'Ethereum', icon: '⟠', gas: '18 gwei', usd: '$2.45', speed: '12s', congestion: 42 },
            { chain: 'Arbitrum', icon: '🔵', gas: '0.1 gwei', usd: '$0.03', speed: '0.3s', congestion: 15 },
            { chain: 'Optimism', icon: '🔴', gas: '0.05 gwei', usd: '$0.02', speed: '2s', congestion: 12 },
            { chain: 'Base', icon: '🔷', gas: '0.02 gwei', usd: '$0.01', speed: '2s', congestion: 8 },
            { chain: 'Polygon', icon: '🟣', gas: '30 gwei', usd: '$0.01', speed: '2s', congestion: 25 },
            { chain: 'BSC', icon: '🟡', gas: '3 gwei', usd: '$0.08', speed: '3s', congestion: 18 },
            { chain: 'Avalanche', icon: '🔺', gas: '25 nAVAX', usd: '$0.05', speed: '1s', congestion: 14 },
            { chain: 'Solana', icon: '🟢', gas: '0.00025 SOL', usd: '$0.002', speed: '0.4s', congestion: 20 }
        ];
    },

    getTxEstimates(gasGwei) {
        var base = gasGwei * 21000 / 1e9 * 3400;
        return [
            { action: 'ETH Transfer', gas: 21000, cost: '$' + (base).toFixed(2) },
            { action: 'ERC-20 Transfer', gas: 65000, cost: '$' + (base * 65000 / 21000).toFixed(2) },
            { action: 'Uniswap Swap', gas: 150000, cost: '$' + (base * 150000 / 21000).toFixed(2) },
            { action: 'NFT Mint', gas: 120000, cost: '$' + (base * 120000 / 21000).toFixed(2) },
            { action: 'Aave Deposit', gas: 250000, cost: '$' + (base * 250000 / 21000).toFixed(2) },
            { action: 'Contract Deploy', gas: 1500000, cost: '$' + (base * 1500000 / 21000).toFixed(2) }
        ];
    },

    renderHourlyChart(data, width, height) {
        var maxGas = Math.max.apply(null, data.map(function(d) { return d.gas; }));
        var barW = Math.floor(width / 24) - 2;
        var svg = '<svg width="' + width + '" height="' + (height + 20) + '">';
        var now = new Date().getHours();
        data.forEach(function(d, i) {
            var h = (d.gas / maxGas) * (height - 10);
            var x = i * (barW + 2);
            var color = d.gas <= 12 ? '#00ff88' : d.gas <= 20 ? '#c9a227' : d.gas <= 30 ? '#ff8844' : '#ff4466';
            var opacity = i === now ? '1' : '0.6';
            svg += '<rect x="' + x + '" y="' + (height - h) + '" width="' + barW + '" height="' + h + '" fill="' + color + '" rx="2" opacity="' + opacity + '"/>';
            if (i % 4 === 0) svg += '<text x="' + (x + barW / 2) + '" y="' + (height + 14) + '" text-anchor="middle" fill="#555" font-size="9">' + d.label + '</text>';
        });
        svg += '<line x1="' + (now * (barW + 2)) + '" y1="0" x2="' + (now * (barW + 2)) + '" y2="' + height + '" stroke="#00d4ff" stroke-width="1.5" stroke-dasharray="3,3"/>';
        svg += '<text x="' + (now * (barW + 2) + 4) + '" y="10" fill="#00d4ff" font-size="9">NOW</text>';
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var hourly = this.getGasData();
        var chains = this.getChainGas();
        var current = hourly[new Date().getHours()];
        var cheapest = hourly.reduce(function(min, d) { return d.gas < min.gas ? d : min; }, hourly[0]);
        var txEstimates = this.getTxEstimates(current.gas);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (current.gas <= 15 ? 'green' : current.gas <= 25 ? '' : 'red') + ' " style="color:' + (current.gas <= 15 ? '#00ff88' : current.gas <= 25 ? '#c9a227' : '#ff4466') + '">' + current.gas + ' gwei</div><div class="sol-stat-label">Current Gas</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + cheapest.gas + ' gwei</div><div class="sol-stat-label">24h Low</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + cheapest.label + '</div><div class="sol-stat-label">Cheapest Hour</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + (current.gas <= 15 ? '🟢 Low' : current.gas <= 25 ? '🟡 Medium' : '🔴 High') + '</div><div class="sol-stat-label">Congestion</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">⏰ 24h Gas Price Forecast (ETH Mainnet)</div>' +
            '<div style="padding:10px 0">' + this.renderHourlyChart(hourly, 580, 120) + '</div>' +
            '<div style="display:flex;gap:12px;justify-content:center;font-size:11px">' +
            '<span><span style="color:#00ff88">■</span> Low (&lt;12)</span>' +
            '<span><span style="color:#c9a227">■</span> Medium (12-20)</span>' +
            '<span><span style="color:#ff8844">■</span> High (20-30)</span>' +
            '<span><span style="color:#ff4466">■</span> Very High (&gt;30)</span></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">💰 Transaction Cost Estimates (Current Gas)</div>' +
            '<table class="sol-table"><thead><tr><th>Action</th><th>Gas Units</th><th>Est. Cost</th></tr></thead><tbody>';
        txEstimates.forEach(function(tx) {
            html += '<tr><td><strong>' + tx.action + '</strong></td><td style="font-family:monospace;color:#888">' + tx.gas.toLocaleString() + '</td><td style="font-family:monospace;color:#00ff88">' + tx.cost + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">⛓️ Cross-Chain Gas Comparison</div>' +
            '<table class="sol-table"><thead><tr><th>Chain</th><th>Gas Price</th><th>Transfer Cost</th><th>Block Time</th><th>Congestion</th></tr></thead><tbody>';
        chains.forEach(function(ch) {
            var congColor = ch.congestion < 20 ? '#00ff88' : ch.congestion < 35 ? '#c9a227' : '#ff4466';
            html += '<tr><td>' + ch.icon + ' <strong>' + ch.chain + '</strong></td>' +
                '<td style="font-family:monospace">' + ch.gas + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">' + ch.usd + '</td>' +
                '<td style="color:#888">' + ch.speed + '</td>' +
                '<td><div style="display:flex;align-items:center;gap:6px"><div class="sol-progress" style="width:50px;height:4px"><div class="sol-progress-fill" style="width:' + ch.congestion + '%;background:' + congColor + '"></div></div><span style="font-size:11px;color:' + congColor + '">' + ch.congestion + '%</span></div></td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('gas-optimizer', GasOptimizer, 'retail', {
    icon: '⛽', name: 'Gas Optimizer', description: 'Find the cheapest time to transact with 24h gas forecasts and cross-chain comparison'
});
