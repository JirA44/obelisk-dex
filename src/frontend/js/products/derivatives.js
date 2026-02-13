/**
 * DERIVATIVES MODULE - Advanced Financial Instruments
 */
const DerivativesModule = {
    instruments: [
        { id: 'btc-futures-q1', name: 'BTC Futures Q1 2025', type: 'futures', underlying: 'BTC', expiry: '2025-03-31', price: 95000, contractSize: 0.01, margin: 10 },
        { id: 'eth-futures-q1', name: 'ETH Futures Q1 2025', type: 'futures', underlying: 'ETH', expiry: '2025-03-31', price: 3400, contractSize: 0.1, margin: 10 },
        { id: 'btc-inverse', name: 'BTC Inverse Perp', type: 'inverse', underlying: 'BTC', fundingRate: 0.01, maxLev: 100 },
        { id: 'eth-inverse', name: 'ETH Inverse Perp', type: 'inverse', underlying: 'ETH', fundingRate: 0.008, maxLev: 50 },
        { id: 'btc-volatility', name: 'BTC Volatility Index', type: 'volatility', underlying: 'BVOL', price: 65, contractSize: 1 },
        { id: 'crypto-fear', name: 'Crypto Fear & Greed', type: 'sentiment', underlying: 'CFGI', price: 45, range: [0, 100] },
        { id: 'btc-spread', name: 'BTC Calendar Spread', type: 'spread', legs: ['Q1', 'Q2'], spread: 2500, margin: 5 },
        { id: 'eth-basis', name: 'ETH Basis Trade', type: 'basis', spot: 3200, futures: 3400, apr: 18.75 }
    ],
    positions: [],
    init() { this.load(); console.log('Derivatives initialized'); },
    load() { this.positions = SafeOps.getStorage('obelisk_derivatives', []); },
    save() { SafeOps.setStorage('obelisk_derivatives', this.positions); },
    openPosition(instrumentId, side, contracts, leverage = 1) {
        const inst = this.instruments.find(i => i.id === instrumentId);
        if (!inst) return { success: false, error: 'Instrument not found' };
        const notional = contracts * inst.contractSize * inst.price;
        const marginReq = notional / leverage;
        const pos = { id: 'deriv-' + Date.now(), instrumentId, type: inst.type, side, contracts, leverage, margin: marginReq, entryPrice: inst.price, openTime: Date.now() };
        this.positions.push(pos);
        this.save();
        return { success: true, position: pos };
    },
    closePosition(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        const inst = this.instruments.find(i => i.id === pos.instrumentId);
        const priceDiff = inst.price - pos.entryPrice;
        const pnl = (pos.side === 'long' ? priceDiff : -priceDiff) * pos.contracts * inst.contractSize;
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, pnl, margin: pos.margin };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Derivatives</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.instruments.map(i =>
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + i.name + '</strong><br>Type: ' + i.type.toUpperCase() + '<br>' + (i.expiry ? 'Expiry: ' + i.expiry : 'Perpetual') + '<br>Price: $' + i.price.toLocaleString() + '<br><button onclick="DerivativesModule.quickTrade(\'' + i.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Trade</button></div>'
        ).join('') + '</div>';
    },
    quickTrade(instrumentId) {
        const inst = this.instruments.find(i => i.id === instrumentId);
        const side = prompt('Side (long/short):');
        const contracts = SafeOps.promptNumber('Contracts:');
        if (side && contracts) { const r = this.openPosition(instrumentId, side, contracts); alert(r.success ? 'Position opened!' : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => DerivativesModule.init());
