/**
 * LEVERAGED TOKENS MODULE
 */
const LeveragedTokensModule = {
    tokens: [
        { id: 'btc2x', name: 'BTC 2x Long', base: 'BTC', leverage: 2, direction: 'long', fee: 0.1 },
        { id: 'btc3x', name: 'BTC 3x Long', base: 'BTC', leverage: 3, direction: 'long', fee: 0.15 },
        { id: 'btc2xs', name: 'BTC 2x Short', base: 'BTC', leverage: 2, direction: 'short', fee: 0.1 },
        { id: 'eth2x', name: 'ETH 2x Long', base: 'ETH', leverage: 2, direction: 'long', fee: 0.1 },
        { id: 'eth3x', name: 'ETH 3x Long', base: 'ETH', leverage: 3, direction: 'long', fee: 0.15 },
        { id: 'sol3x', name: 'SOL 3x Long', base: 'SOL', leverage: 3, direction: 'long', fee: 0.2 }
    ],
    positions: [],
    init() { this.load(); console.log('Leveraged Tokens initialized'); },
    load() { const s = localStorage.getItem('obelisk_levtokens'); if (s) this.positions = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_levtokens', JSON.stringify(this.positions)); },
    buy(tokenId, amount) {
        const token = this.tokens.find(t => t.id === tokenId);
        if (!token || amount < 10) return { success: false, error: 'Min $10' };
        const pos = { id: 'lev-' + Date.now(), tokenId, amount, entryPrice: this.getPrice(token.base), leverage: token.leverage, direction: token.direction, startDate: Date.now() };
        this.positions.push(pos);
        this.save();
        return { success: true, position: pos };
    },
    sell(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        const token = this.tokens.find(t => t.id === pos.tokenId);
        const currentPrice = this.getPrice(token.base);
        const priceChange = (currentPrice - pos.entryPrice) / pos.entryPrice;
        const pnl = pos.amount * priceChange * pos.leverage * (pos.direction === 'long' ? 1 : -1);
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, amount: pos.amount + pnl, pnl };
    },
    getPrice(base) {
        const prices = { BTC: 92000, ETH: 3200, SOL: 140 };
        return prices[base] || 100;
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3>Leveraged Tokens</h3><div class="tokens-grid">' + this.tokens.map(t => 
            '<div class="token-card ' + t.direction + '"><strong>' + t.name + '</strong><br>' + t.leverage + 'x ' + t.direction.toUpperCase() + '<br>Fee: ' + t.fee + '%<br><button onclick="LeveragedTokensModule.quickBuy(\'' + t.id + '\')">Buy</button></div>'
        ).join('') + '</div>';
    },
    quickBuy(tokenId) {
        const amount = parseFloat(prompt('Amount USD (min $10):'));
        if (amount) {
            const r = this.buy(tokenId, amount);
            alert(r.success ? 'Bought!' : r.error);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => LeveragedTokensModule.init());
