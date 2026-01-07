/**
 * INDEX FUNDS MODULE - Crypto Index Investing
 */
const IndexFundsModule = {
    funds: [
        { id: 'defi-10', name: 'DeFi Top 10', ticker: 'DFI10', assets: ['UNI', 'AAVE', 'MKR', 'CRV', 'COMP', 'SNX', 'YFI', 'SUSHI', 'LDO', 'GMX'], apy: 8, fee: 0.5, tvl: 150000000, minInvest: 100 },
        { id: 'layer1-5', name: 'Layer 1 Top 5', ticker: 'L1-5', assets: ['ETH', 'SOL', 'AVAX', 'ADA', 'DOT'], apy: 12, fee: 0.3, tvl: 500000000, minInvest: 50 },
        { id: 'metaverse', name: 'Metaverse Index', ticker: 'MVI', assets: ['MANA', 'SAND', 'AXS', 'ENJ', 'GALA'], apy: 15, fee: 0.8, tvl: 25000000, minInvest: 25 },
        { id: 'blue-chip', name: 'Crypto Blue Chip', ticker: 'CBC', assets: ['BTC', 'ETH'], weights: [60, 40], apy: 5, fee: 0.2, tvl: 1000000000, minInvest: 100 },
        { id: 'ai-crypto', name: 'AI & Data Index', ticker: 'AIDX', assets: ['FET', 'AGIX', 'OCEAN', 'GRT', 'RNDR'], apy: 20, fee: 1.0, tvl: 80000000, minInvest: 50 },
        { id: 'privacy', name: 'Privacy Coins', ticker: 'PRIV', assets: ['XMR', 'ZEC', 'SCRT', 'DUSK'], apy: 6, fee: 0.5, tvl: 30000000, minInvest: 100 },
        { id: 'gaming', name: 'GameFi Index', ticker: 'GAMI', assets: ['AXS', 'IMX', 'GALA', 'MAGIC', 'PRIME'], apy: 18, fee: 0.8, tvl: 60000000, minInvest: 25 },
        { id: 'rwa-index', name: 'Real World Assets', ticker: 'RWAI', assets: ['ONDO', 'MPL', 'CFG', 'GFI'], apy: 10, fee: 0.6, tvl: 200000000, minInvest: 500 }
    ],
    holdings: [],
    init() { this.load(); console.log('Index Funds initialized'); },
    load() { this.holdings = SafeOps.getStorage('obelisk_indexfunds', []); },
    save() { SafeOps.setStorage('obelisk_indexfunds', this.holdings); },
    invest(fundId, amount) {
        const fund = this.funds.find(f => f.id === fundId);
        if (!fund) return { success: false, error: 'Fund not found' };
        if (amount < fund.minInvest) return { success: false, error: 'Min: $' + fund.minInvest };
        const shares = amount / this.getSharePrice(fundId);
        const holding = { id: 'idx-' + Date.now(), fundId, ticker: fund.ticker, amount, shares, buyDate: Date.now(), apy: fund.apy };
        this.holdings.push(holding);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(holding.id, fund.name, amount, fund.apy, 'index', true);
        return { success: true, holding, shares };
    },
    redeem(holdingId) {
        const idx = this.holdings.findIndex(h => h.id === holdingId);
        if (idx === -1) return { success: false };
        const holding = this.holdings[idx];
        const fund = this.funds.find(f => f.id === holding.fundId);
        const days = (Date.now() - holding.buyDate) / 86400000;
        const returns = holding.amount * (holding.apy / 100) * (days / 365);
        const fee = holding.amount * (fund.fee / 100);
        this.holdings.splice(idx, 1);
        this.save();
        return { success: true, principal: holding.amount, returns, fee, net: holding.amount + returns - fee };
    },
    getSharePrice(fundId) { return 100 + Math.random() * 10; },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Index Funds</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.funds.map(f =>
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + f.name + '</strong> ($' + f.ticker + ')<br>Assets: ' + f.assets.slice(0, 3).join(', ') + '...<br>APY: ' + f.apy + '% | Fee: ' + f.fee + '%<br>TVL: $' + (f.tvl/1000000).toFixed(0) + 'M<br>Min: $' + f.minInvest + '<br><button onclick="IndexFundsModule.quickInvest(\'' + f.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Invest</button></div>'
        ).join('') + '</div>';
    },
    quickInvest(fundId) {
        const fund = this.funds.find(f => f.id === fundId);
        const amount = parseFloat(prompt('Amount (min $' + fund.minInvest + '):'));
        if (amount !== null && amount > 0) { const r = this.invest(fundId, amount); alert(r.success ? 'Invested in ' + fund.name + '!' : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => IndexFundsModule.init());
