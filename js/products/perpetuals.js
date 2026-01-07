/**
 * PERPETUALS MODULE - Perpetual Futures Trading
 */
const PerpetualsModule = {
    markets: [
        { id: 'btc-perp', symbol: 'BTC-PERP', price: 92000, fundingRate: 0.01, openInterest: 500000000, maxLeverage: 100 },
        { id: 'eth-perp', symbol: 'ETH-PERP', price: 3200, fundingRate: 0.008, openInterest: 200000000, maxLeverage: 100 },
        { id: 'sol-perp', symbol: 'SOL-PERP', price: 140, fundingRate: 0.015, openInterest: 50000000, maxLeverage: 50 },
        { id: 'avax-perp', symbol: 'AVAX-PERP', price: 35, fundingRate: 0.012, openInterest: 20000000, maxLeverage: 50 },
        { id: 'arb-perp', symbol: 'ARB-PERP', price: 0.8, fundingRate: 0.02, openInterest: 15000000, maxLeverage: 25 },
        { id: 'doge-perp', symbol: 'DOGE-PERP', price: 0.32, fundingRate: 0.025, openInterest: 30000000, maxLeverage: 25 }
    ],
    positions: [],
    init() { this.load(); console.log('Perpetuals initialized'); },
    load() { this.positions = SafeOps.getStorage('obelisk_perps', []); },
    save() { SafeOps.setStorage('obelisk_perps', this.positions); },
    openPosition(marketId, side, size, leverage) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market) return { success: false, error: 'Market not found' };
        if (leverage > market.maxLeverage) return { success: false, error: 'Max leverage: ' + market.maxLeverage + 'x' };
        const margin = size / leverage;
        const pos = { id: 'perp-' + Date.now(), marketId, symbol: market.symbol, side, size, leverage, margin, entryPrice: market.price, openTime: Date.now() };
        this.positions.push(pos);
        this.save();
        return { success: true, position: pos };
    },
    closePosition(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        const market = this.markets.find(m => m.id === pos.marketId);
        const priceDiff = market.price - pos.entryPrice;
        const pnl = (pos.side === 'long' ? priceDiff : -priceDiff) / pos.entryPrice * pos.size;
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, pnl, margin: pos.margin };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Perpetual Futures</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.markets.map(m => 
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + m.symbol + '</strong><br>$' + m.price.toLocaleString() + '<br>Funding: ' + m.fundingRate + '%<br>Max: ' + m.maxLeverage + 'x<br><button onclick="PerpetualsModule.quickTrade(\'' + m.id + '\',\'long\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Long</button> <button onclick="PerpetualsModule.quickTrade(\'' + m.id + '\',\'short\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Short</button></div>'
        ).join('') + '</div>';
    },
    quickTrade(marketId, side) {
        const size = SafeOps.promptNumber('Position size USD:');
        const leverage = parseFloat(prompt('Leverage (1-100):'));
        if (size && leverage) { const r = this.openPosition(marketId, side, size, leverage); alert(r.success ? 'Position opened!' : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => PerpetualsModule.init());
