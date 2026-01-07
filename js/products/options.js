/**
 * OPTIONS MODULE - Call/Put Options
 */
const OptionsModule = {
    options: [
        { id: 'btc-call-100k', name: 'BTC $100K Call', asset: 'BTC', type: 'call', strike: 100000, expiry: '2025-03', premium: 2.5 },
        { id: 'btc-call-120k', name: 'BTC $120K Call', asset: 'BTC', type: 'call', strike: 120000, expiry: '2025-06', premium: 1.8 },
        { id: 'btc-put-80k', name: 'BTC $80K Put', asset: 'BTC', type: 'put', strike: 80000, expiry: '2025-03', premium: 3.2 },
        { id: 'eth-call-5k', name: 'ETH $5K Call', asset: 'ETH', type: 'call', strike: 5000, expiry: '2025-03', premium: 4.5 },
        { id: 'eth-put-2500', name: 'ETH $2500 Put', asset: 'ETH', type: 'put', strike: 2500, expiry: '2025-03', premium: 2.8 },
        { id: 'sol-call-200', name: 'SOL $200 Call', asset: 'SOL', type: 'call', strike: 200, expiry: '2025-03', premium: 8 }
    ],
    positions: [],
    init() { this.load(); console.log('Options Module initialized'); },
    load() { const s = localStorage.getItem('obelisk_options'); if (s) this.positions = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_options', JSON.stringify(this.positions)); },
    buy(optionId, contracts) {
        const opt = this.options.find(o => o.id === optionId);
        if (!opt || contracts < 0.01) return { success: false, error: 'Min 0.01 contracts' };
        const cost = contracts * opt.premium * 100;
        const pos = { id: 'opt-' + Date.now(), optionId, contracts, cost, buyDate: Date.now() };
        this.positions.push(pos);
        this.save();
        return { success: true, position: pos, cost };
    },
    exercise(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        const opt = this.options.find(o => o.id === pos.optionId);
        const price = { BTC: 92000, ETH: 3200, SOL: 140 }[opt.asset];
        let pnl = 0;
        if (opt.type === 'call' && price > opt.strike) pnl = (price - opt.strike) * pos.contracts;
        if (opt.type === 'put' && price < opt.strike) pnl = (opt.strike - price) * pos.contracts;
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, pnl: pnl - pos.cost };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3>Crypto Options</h3><div class="options-grid">' + this.options.map(o => 
            '<div class="option-card ' + o.type + '"><strong>' + o.name + '</strong><br>' + o.type.toUpperCase() + ' @ $' + o.strike + '<br>Exp: ' + o.expiry + '<br>Premium: ' + o.premium + '%<br><button onclick="OptionsModule.quickBuy(\'' + o.id + '\')">Buy</button></div>'
        ).join('') + '</div>';
    },
    quickBuy(optionId) {
        const contracts = parseFloat(prompt('Contracts (min 0.01):'));
        if (contracts) {
            const r = this.buy(optionId, contracts);
            alert(r.success ? 'Bought! Cost: $' + r.cost.toFixed(2) : r.error);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => OptionsModule.init());
