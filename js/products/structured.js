/**
 * STRUCTURED PRODUCTS MODULE - Complex Financial Products
 */
const StructuredModule = {
    products: [
        { id: 'btc-shark-fin', name: 'BTC Shark Fin', type: 'principal-protected', baseAPY: 5, bonusAPY: 50, knockoutPrice: 110000, duration: 30, minInvest: 1000 },
        { id: 'eth-dual-invest', name: 'ETH Dual Investment', type: 'dual-currency', baseAPY: 15, strikePrice: 3500, duration: 7, minInvest: 500 },
        { id: 'btc-snowball', name: 'BTC Snowball', type: 'autocall', baseAPY: 25, knockinLevel: 0.7, knockoutLevel: 1.05, duration: 90, minInvest: 5000 },
        { id: 'range-accrual', name: 'BTC Range Accrual', type: 'range', baseAPY: 30, lowerBound: 85000, upperBound: 100000, duration: 14, minInvest: 1000 },
        { id: 'eth-twin-win', name: 'ETH Twin Win', type: 'twin-win', baseAPY: 20, barrier: 0.8, duration: 30, minInvest: 2000 },
        { id: 'multi-asset', name: 'Crypto Basket Note', type: 'basket', assets: ['BTC', 'ETH', 'SOL'], baseAPY: 12, duration: 60, minInvest: 500 }
    ],
    positions: [],
    init() { this.load(); console.log('Structured Products initialized'); },
    load() { const s = localStorage.getItem('obelisk_structured'); if (s) this.positions = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_structured', JSON.stringify(this.positions)); },
    invest(productId, amount) {
        const prod = this.products.find(p => p.id === productId);
        if (!prod) return { success: false, error: 'Product not found' };
        if (amount < prod.minInvest) return { success: false, error: 'Min: $' + prod.minInvest };
        const pos = { id: 'str-' + Date.now(), productId, amount, startDate: Date.now(), maturityDate: Date.now() + prod.duration * 86400000, baseAPY: prod.baseAPY };
        this.positions.push(pos);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(pos.id, prod.name, amount, prod.baseAPY, 'structured', true);
        return { success: true, position: pos };
    },
    redeem(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        if (Date.now() < pos.maturityDate) return { success: false, error: 'Not matured yet' };
        const prod = this.products.find(p => p.id === pos.productId);
        const days = (Date.now() - pos.startDate) / 86400000;
        const returns = pos.amount * (pos.baseAPY / 100) * (days / 365);
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, principal: pos.amount, returns };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3>Structured Products</h3><div class="structured-grid">' + this.products.map(p => 
            '<div class="structured-card"><strong>' + p.name + '</strong><br>Type: ' + p.type + '<br>Base APY: ' + p.baseAPY + '%' + (p.bonusAPY ? ' (up to ' + p.bonusAPY + '%)' : '') + '<br>Duration: ' + p.duration + ' days<br>Min: $' + p.minInvest + '<br><button onclick="StructuredModule.quickInvest(\'' + p.id + '\')">Invest</button></div>'
        ).join('') + '</div>';
    },
    quickInvest(productId) {
        const prod = this.products.find(p => p.id === productId);
        const amount = parseFloat(prompt('Amount (min $' + prod.minInvest + '):'));
        if (amount) { const r = this.invest(productId, amount); alert(r.success ? 'Invested!' : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => StructuredModule.init());
