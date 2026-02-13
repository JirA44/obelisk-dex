/* ============================================
   NFT PORTFOLIO - Track & value NFT holdings
   ============================================ */

const NFTPortfolio = {
    nfts: [],

    init() {
        try { this.nfts = JSON.parse(localStorage.getItem('obelisk_nft_portfolio') || '[]'); } catch(e) { this.nfts = []; }
        if (this.nfts.length === 0) this.generateNFTs();
    },

    save() { localStorage.setItem('obelisk_nft_portfolio', JSON.stringify(this.nfts)); },

    generateNFTs() {
        this.nfts = [
            { id: 'n1', name: 'CryptoPunk #7804', collection: 'CryptoPunks', image: '👾', floor: 45.2, bought: 38.0, rarity: 'Legendary', rank: 12, chain: 'Ethereum' },
            { id: 'n2', name: 'BAYC #3429', collection: 'Bored Ape YC', image: '🐵', floor: 12.8, bought: 18.5, rarity: 'Rare', rank: 1240, chain: 'Ethereum' },
            { id: 'n3', name: 'Azuki #8721', collection: 'Azuki', image: '⛩️', floor: 5.4, bought: 3.2, rarity: 'Common', rank: 4500, chain: 'Ethereum' },
            { id: 'n4', name: 'Pudgy #2190', collection: 'Pudgy Penguins', image: '🐧', floor: 8.1, bought: 2.5, rarity: 'Rare', rank: 890, chain: 'Ethereum' },
            { id: 'n5', name: 'DeGod #4521', collection: 'DeGods', image: '😈', floor: 3.8, bought: 5.0, rarity: 'Epic', rank: 320, chain: 'Solana' },
            { id: 'n6', name: 'Milady #6120', collection: 'Milady Maker', image: '👧', floor: 2.9, bought: 1.1, rarity: 'Common', rank: 3200, chain: 'Ethereum' }
        ];
    },

    getTrending() {
        return [
            { collection: 'CryptoPunks', floor: '45.2 ETH', change: '+8.5%', volume: '1,240 ETH', sales: 42, icon: '👾' },
            { collection: 'Pudgy Penguins', floor: '8.1 ETH', change: '+22.3%', volume: '890 ETH', sales: 156, icon: '🐧' },
            { collection: 'Azuki', floor: '5.4 ETH', change: '-3.2%', volume: '420 ETH', sales: 89, icon: '⛩️' },
            { collection: 'BAYC', floor: '12.8 ETH', change: '-1.5%', volume: '350 ETH', sales: 28, icon: '🐵' },
            { collection: 'Milady Maker', floor: '2.9 ETH', change: '+45.0%', volume: '1,800 ETH', sales: 320, icon: '👧' },
            { collection: 'DeGods', floor: '3.8 ETH', change: '+5.1%', volume: '210 ETH', sales: 65, icon: '😈' }
        ];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var ethPrice = 3400;
        var totalValue = 0, totalCost = 0;
        this.nfts.forEach(function(n) { totalValue += n.floor; totalCost += n.bought; });
        var pnl = totalValue - totalCost;
        var pnlPct = totalCost > 0 ? (pnl / totalCost * 100) : 0;
        var trending = this.getTrending();
        var self = this;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + totalValue.toFixed(1) + ' ETH</div><div class="sol-stat-label">Portfolio Value</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">$' + (totalValue * ethPrice / 1000).toFixed(0) + 'K</div><div class="sol-stat-label">USD Value</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (pnl >= 0 ? 'green' : 'red') + '">' + (pnl >= 0 ? '+' : '') + pnl.toFixed(1) + ' ETH</div><div class="sol-stat-label">Unrealized PnL</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.nfts.length + '</div><div class="sol-stat-label">NFTs Held</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🖼️ My Collection</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">';
        this.nfts.forEach(function(n) {
            var nPnl = n.floor - n.bought;
            var nColor = nPnl >= 0 ? '#00ff88' : '#ff4466';
            var rarityColor = n.rarity === 'Legendary' ? '#c9a227' : n.rarity === 'Epic' ? '#a855f7' : n.rarity === 'Rare' ? '#00d4ff' : '#888';
            html += '<div style="border:1px solid #1a1a1a;border-radius:12px;overflow:hidden">' +
                '<div style="height:120px;background:#111;display:flex;align-items:center;justify-content:center;font-size:56px">' + n.image + '</div>' +
                '<div style="padding:12px"><strong style="color:#fff;font-size:13px">' + n.name + '</strong>' +
                '<div style="font-size:11px;color:#555;margin-bottom:8px">' + n.collection + ' | ' + n.chain + '</div>' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#888;font-size:12px">Floor</span><span style="font-family:monospace;color:#fff">' + n.floor + ' ETH</span></div>' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#888;font-size:12px">Bought</span><span style="font-family:monospace;color:#888">' + n.bought + ' ETH</span></div>' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#888;font-size:12px">PnL</span><span style="font-family:monospace;color:' + nColor + '">' + (nPnl >= 0 ? '+' : '') + nPnl.toFixed(1) + ' ETH</span></div>' +
                '<div style="display:flex;gap:4px"><span class="sol-tag" style="background:' + rarityColor + '22;color:' + rarityColor + ';font-size:10px">' + n.rarity + '</span>' +
                '<span class="sol-tag" style="font-size:10px">Rank #' + n.rank + '</span></div></div></div>';
        });
        html += '</div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🔥 Trending Collections</div>' +
            '<table class="sol-table"><thead><tr><th>Collection</th><th>Floor</th><th>24h Change</th><th>Volume</th><th>Sales</th></tr></thead><tbody>';
        trending.forEach(function(t) {
            var changeColor = t.change.startsWith('+') ? '#00ff88' : '#ff4466';
            html += '<tr><td>' + t.icon + ' <strong>' + t.collection + '</strong></td>' +
                '<td style="font-family:monospace">' + t.floor + '</td>' +
                '<td style="font-family:monospace;color:' + changeColor + '">' + t.change + '</td>' +
                '<td style="font-family:monospace;color:#888">' + t.volume + '</td>' +
                '<td>' + t.sales + '</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('nft-portfolio', NFTPortfolio, 'retail', {
    icon: '🖼️', name: 'NFT Portfolio', description: 'Track NFT holdings with floor prices, rarity ranks, PnL, and trending collections'
});
