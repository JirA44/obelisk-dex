/**
 * REAL WORLD ASSETS MODULE - Tokenized Real Assets
 */
const RWAModule = {
    assets: [
        { id: 'us-treasury', name: 'US Treasury Bonds', ticker: 'USTB', type: 'bonds', apy: 4.5, minInvest: 1000, tvl: 500000000, issuer: 'Ondo Finance' },
        { id: 'real-estate-ny', name: 'NYC Real Estate Fund', ticker: 'NYRE', type: 'real-estate', apy: 8, minInvest: 5000, tvl: 150000000, location: 'New York' },
        { id: 'real-estate-dubai', name: 'Dubai Property Token', ticker: 'DBPT', type: 'real-estate', apy: 12, minInvest: 2500, tvl: 80000000, location: 'Dubai' },
        { id: 'gold-token', name: 'Tokenized Gold', ticker: 'TGLD', type: 'commodity', apy: 0, minInvest: 100, tvl: 1000000000, backing: '1:1 Physical Gold' },
        { id: 'silver-token', name: 'Tokenized Silver', ticker: 'TSLV', type: 'commodity', apy: 0, minInvest: 50, tvl: 200000000, backing: '1:1 Physical Silver' },
        { id: 'corp-bonds', name: 'Corporate Bonds AAA', ticker: 'CBND', type: 'bonds', apy: 6, minInvest: 2000, tvl: 300000000, rating: 'AAA' },
        { id: 'carbon-credits', name: 'Carbon Credits', ticker: 'CO2T', type: 'environmental', apy: 5, minInvest: 100, tvl: 50000000, certified: 'Verra' },
        { id: 'art-fund', name: 'Fine Art Index', ticker: 'ARTX', type: 'collectibles', apy: 10, minInvest: 10000, tvl: 25000000, curator: 'Masterworks' },
        { id: 'invoice-finance', name: 'Invoice Financing', ticker: 'INVF', type: 'receivables', apy: 9, minInvest: 500, tvl: 120000000, avgDuration: 60 },
        { id: 'wine-fund', name: 'Fine Wine Collection', ticker: 'WINE', type: 'collectibles', apy: 7, minInvest: 1000, tvl: 15000000, vintage: '2015-2020' }
    ],
    holdings: [],
    init() { this.load(); console.log('RWA Module initialized'); },
    load() { this.holdings = SafeOps.getStorage('obelisk_rwa', []); },
    save() { SafeOps.setStorage('obelisk_rwa', this.holdings); },
    invest(assetId, amount) {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return { success: false, error: 'Asset not found' };
        if (amount < asset.minInvest) return { success: false, error: 'Min: $' + asset.minInvest };
        const holding = { id: 'rwa-' + Date.now(), assetId, ticker: asset.ticker, type: asset.type, amount, buyDate: Date.now(), apy: asset.apy };
        this.holdings.push(holding);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(holding.id, asset.name, amount, asset.apy, 'rwa', true);
        return { success: true, holding };
    },
    redeem(holdingId) {
        const idx = this.holdings.findIndex(h => h.id === holdingId);
        if (idx === -1) return { success: false };
        const holding = this.holdings[idx];
        const days = (Date.now() - holding.buyDate) / 86400000;
        const returns = holding.amount * (holding.apy / 100) * (days / 365);
        this.holdings.splice(idx, 1);
        this.save();
        return { success: true, principal: holding.amount, returns };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Real World Assets</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.assets.map(a =>
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + a.name + '</strong> ($' + a.ticker + ')<br>Type: ' + a.type + '<br>APY: ' + a.apy + '%<br>TVL: $' + (a.tvl/1000000).toFixed(0) + 'M<br>Min: $' + a.minInvest.toLocaleString() + '<br><button onclick="RWAModule.quickInvest(\'' + a.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Invest</button></div>'
        ).join('') + '</div>';
    },
    quickInvest(assetId) {
        const asset = this.assets.find(a => a.id === assetId);
        const amount = parseFloat(prompt('Amount (min $' + asset.minInvest.toLocaleString() + '):'));
        if (amount !== null && amount > 0) { const r = this.invest(assetId, amount); alert(r.success ? 'Invested in ' + asset.name + '!' : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => RWAModule.init());
