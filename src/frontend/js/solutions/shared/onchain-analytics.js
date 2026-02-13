/* ============================================
   ON-CHAIN ANALYTICS - Blockchain data insights
   ============================================ */

const OnchainAnalytics = {
    init() {},

    getMetrics() {
        return {
            btc: {
                activeAddresses: 920000 + Math.floor(Math.random() * 80000),
                hashRate: '680 EH/s',
                txCount24h: 450000 + Math.floor(Math.random() * 50000),
                avgFee: '$2.45',
                mempoolSize: '12.4 MB',
                exchangeInflow: '$340M',
                exchangeOutflow: '$420M',
                netFlow: '-$80M',
                nvtRatio: 42.5,
                puellMultiple: 1.15,
                sopr: 1.02
            },
            eth: {
                activeAddresses: 550000 + Math.floor(Math.random() * 50000),
                gasPrice: '18 gwei',
                txCount24h: 1200000 + Math.floor(Math.random() * 100000),
                burnedFees: '1,240 ETH',
                stakingRate: '28.5%',
                validatorCount: '940,000',
                exchangeInflow: '$180M',
                exchangeOutflow: '$210M',
                netFlow: '-$30M'
            }
        };
    },

    getTopContracts() {
        return [
            { name: 'Uniswap V3', address: '0x1F98...B44c', calls24h: 125000, gas: '8.2%', category: 'DEX' },
            { name: 'Tether', address: '0xdAC1...1eC7', calls24h: 98000, gas: '6.1%', category: 'Stablecoin' },
            { name: 'OpenSea', address: '0x00000...D530', calls24h: 45000, gas: '3.8%', category: 'NFT' },
            { name: 'Aave V3', address: '0x87870...8Ae5', calls24h: 32000, gas: '2.9%', category: 'Lending' },
            { name: 'Lido', address: '0xae7a...4bE5', calls24h: 28000, gas: '2.4%', category: 'Staking' },
            { name: 'Chainlink', address: '0x5147...9Ae7', calls24h: 22000, gas: '1.8%', category: 'Oracle' }
        ];
    },

    renderFlowChart(inflow, outflow, width, height) {
        var maxVal = Math.max(inflow, outflow) || 1;
        var inflowW = (inflow / maxVal) * (width / 2 - 40);
        var outflowW = (outflow / maxVal) * (width / 2 - 40);
        var svg = '<svg width="' + width + '" height="' + height + '">';
        var cx = width / 2;
        svg += '<rect x="' + (cx - inflowW - 5) + '" y="10" width="' + inflowW + '" height="25" fill="#ff4466" rx="4" opacity="0.7"/>';
        svg += '<text x="' + (cx - inflowW - 10) + '" y="27" text-anchor="end" fill="#ff4466" font-size="11" font-family="monospace">$' + inflow + 'M IN</text>';
        svg += '<rect x="' + (cx + 5) + '" y="10" width="' + outflowW + '" height="25" fill="#00ff88" rx="4" opacity="0.7"/>';
        svg += '<text x="' + (cx + outflowW + 10) + '" y="27" text-anchor="start" fill="#00ff88" font-size="11" font-family="monospace">$' + outflow + 'M OUT</text>';
        svg += '<rect x="' + (cx - 2) + '" y="5" width="4" height="35" fill="#333" rx="2"/>';
        svg += '<text x="' + cx + '" y="60" text-anchor="middle" fill="#888" font-size="10">Exchange Net Flow</text>';
        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var metrics = this.getMetrics();
        var contracts = this.getTopContracts();

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + (metrics.btc.activeAddresses / 1000).toFixed(0) + 'K</div><div class="sol-stat-label">BTC Active Addr</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + metrics.btc.hashRate + '</div><div class="sol-stat-label">Hash Rate</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + metrics.btc.netFlow + '</div><div class="sol-stat-label">BTC Net Flow</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + metrics.btc.sopr + '</div><div class="sol-stat-label">SOPR</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🔗 BTC Exchange Flows</div>' +
            '<div style="padding:10px 0;text-align:center">' + this.renderFlowChart(340, 420, 500, 70) + '</div>' +
            '<div class="sol-stats-row">' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px">' + metrics.btc.nvtRatio + '</div><div class="sol-stat-label">NVT Ratio</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px">' + metrics.btc.puellMultiple + '</div><div class="sol-stat-label">Puell Multiple</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px">' + (metrics.btc.txCount24h / 1000).toFixed(0) + 'K</div><div class="sol-stat-label">Txs (24h)</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px">' + metrics.btc.avgFee + '</div><div class="sol-stat-label">Avg Fee</div></div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">⛓️ Ethereum Metrics</div>' +
            '<div class="sol-stats-row">' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px">' + (metrics.eth.activeAddresses / 1000).toFixed(0) + 'K</div><div class="sol-stat-label">Active Addr</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px;color:#c9a227">' + metrics.eth.gasPrice + '</div><div class="sol-stat-label">Gas Price</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px;color:#ff8844">' + metrics.eth.burnedFees + '</div><div class="sol-stat-label">Burned (24h)</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px;color:#00d4ff">' + metrics.eth.stakingRate + '</div><div class="sol-stat-label">Staking Rate</div></div>' +
            '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:14px">' + metrics.eth.validatorCount + '</div><div class="sol-stat-label">Validators</div></div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Top Gas Consumers</div>' +
            '<table class="sol-table"><thead><tr><th>Contract</th><th>Category</th><th>24h Calls</th><th>Gas Share</th></tr></thead><tbody>';
        contracts.forEach(function(ct) {
            html += '<tr><td><strong>' + ct.name + '</strong><div style="font-size:10px;color:#555;font-family:monospace">' + ct.address + '</div></td>' +
                '<td><span class="sol-tag sol-tag-blue">' + ct.category + '</span></td>' +
                '<td style="font-family:monospace">' + ct.calls24h.toLocaleString() + '</td>' +
                '<td><div style="display:flex;align-items:center;gap:6px"><div class="sol-progress" style="width:60px;height:4px"><div class="sol-progress-fill" style="width:' + (parseFloat(ct.gas) * 10) + '%"></div></div><span style="font-size:12px;color:#888">' + ct.gas + '</span></div></td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">💡 On-Chain Signal</div>' +
            '<p style="color:#aaa;font-size:13px;line-height:1.7">';
        if (metrics.btc.sopr > 1) {
            html += '<span style="color:#00ff88;font-weight:600">Bullish Signal:</span> SOPR above 1.0 indicates holders are selling at profit. Net exchange outflow suggests accumulation. NVT at ' + metrics.btc.nvtRatio + ' is within normal range.';
        } else {
            html += '<span style="color:#ff4466;font-weight:600">Caution:</span> SOPR below 1.0 indicates holders selling at loss. Monitor for capitulation or reversal signals.';
        }
        html += '</p></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('onchain-analytics', OnchainAnalytics, 'shared', {
    icon: '🔗', name: 'On-Chain Analytics', description: 'Deep blockchain data: exchange flows, NVT, SOPR, gas analytics, and smart money tracking'
});
