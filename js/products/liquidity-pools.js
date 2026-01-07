/**
 * LIQUIDITY POOLS MODULE - Obelisk DEX
 */
const LiquidityPoolsModule = {
    pools: [
        { id: 'eth-usdc', name: 'ETH/USDC', tokens: ['ETH', 'USDC'], apy: 25, tvl: 15000000, fee: 0.3, risk: 'medium' },
        { id: 'btc-eth', name: 'BTC/ETH', tokens: ['BTC', 'ETH'], apy: 18, tvl: 25000000, fee: 0.3, risk: 'medium' },
        { id: 'sol-usdc', name: 'SOL/USDC', tokens: ['SOL', 'USDC'], apy: 35, tvl: 8000000, fee: 0.3, risk: 'high' },
        { id: 'avax-usdc', name: 'AVAX/USDC', tokens: ['AVAX', 'USDC'], apy: 32, tvl: 5000000, fee: 0.3, risk: 'high' },
        { id: 'stable-3pool', name: 'USDC/USDT/DAI', tokens: ['USDC', 'USDT', 'DAI'], apy: 8, tvl: 50000000, fee: 0.04, risk: 'low' },
        { id: 'arb-eth', name: 'ARB/ETH', tokens: ['ARB', 'ETH'], apy: 45, tvl: 3000000, fee: 0.3, risk: 'high' }
    ],
    userLPs: [],
    init() { this.load(); console.log('LP Module initialized'); },
    load() { const s = localStorage.getItem('obelisk_lp'); if (s) this.userLPs = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_lp', JSON.stringify(this.userLPs)); },
    addLiquidity(poolId, amount) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool || amount < 10) return { success: false, error: 'Min $10' };
        const lp = { id: 'lp-' + Date.now(), poolId, amount, startDate: Date.now(), apy: pool.apy };
        this.userLPs.push(lp);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(lp.id, pool.name + ' LP', amount, pool.apy, 'liquidity', true);
        return { success: true, lp };
    },
    removeLiquidity(lpId) {
        const idx = this.userLPs.findIndex(l => l.id === lpId);
        if (idx === -1) return { success: false };
        const lp = this.userLPs[idx];
        const days = (Date.now() - lp.startDate) / 86400000;
        const rewards = lp.amount * (lp.apy / 100) * (days / 365);
        this.userLPs.splice(idx, 1);
        this.save();
        return { success: true, amount: lp.amount, rewards };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3>Liquidity Pools</h3><div class="pools-grid">' + this.pools.map(p => 
            '<div class="pool-card ' + p.risk + '"><strong>' + p.name + '</strong><br>' + p.apy + '% APY<br>TVL: $' + (p.tvl/1000000).toFixed(1) + 'M<br>Fee: ' + p.fee + '%<br><button onclick="LiquidityPoolsModule.quickAdd(\'' + p.id + '\')">Add Liquidity</button></div>'
        ).join('') + '</div>';
    },
    quickAdd(poolId) {
        const pool = this.pools.find(p => p.id === poolId);
        const amount = parseFloat(prompt('Amount USD (min $10):'));
        if (amount) {
            const r = this.addLiquidity(poolId, amount);
            alert(r.success ? 'LP added!' : r.error);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => LiquidityPoolsModule.init());
