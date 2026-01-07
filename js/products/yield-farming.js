/**
 * YIELD FARMING MODULE - Multi-Protocol Farming
 */
const YieldFarmingModule = {
    farms: [
        { id: 'curve-3pool', name: 'Curve 3Pool', protocol: 'Curve', apy: 15, rewards: ['CRV', 'CVX'], risk: 'low', tvl: 500000000 },
        { id: 'convex-eth', name: 'Convex ETH', protocol: 'Convex', apy: 25, rewards: ['CVX', 'CRV'], risk: 'medium', tvl: 200000000 },
        { id: 'aave-v3', name: 'Aave V3 USDC', protocol: 'Aave', apy: 8, rewards: ['AAVE'], risk: 'low', tvl: 800000000 },
        { id: 'gmx-glp', name: 'GMX GLP', protocol: 'GMX', apy: 35, rewards: ['ETH', 'esGMX'], risk: 'medium', tvl: 400000000 },
        { id: 'pendle-pt', name: 'Pendle PT-stETH', protocol: 'Pendle', apy: 45, rewards: ['PENDLE'], risk: 'medium', tvl: 100000000 },
        { id: 'eigen-restake', name: 'EigenLayer Restake', protocol: 'EigenLayer', apy: 60, rewards: ['EIGEN', 'Points'], risk: 'high', tvl: 300000000 },
        { id: 'blast-gold', name: 'Blast Gold Points', protocol: 'Blast', apy: 100, rewards: ['GOLD', 'Points'], risk: 'high', tvl: 150000000 },
        { id: 'lido-steth', name: 'Lido stETH', protocol: 'Lido', apy: 4.5, rewards: ['stETH'], risk: 'low', tvl: 2000000000 }
    ],
    positions: [],
    init() { this.load(); console.log('Yield Farming initialized'); },
    load() { const s = localStorage.getItem('obelisk_farming'); if (s) this.positions = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_farming', JSON.stringify(this.positions)); },
    deposit(farmId, amount) {
        const farm = this.farms.find(f => f.id === farmId);
        if (!farm || amount < 10) return { success: false, error: 'Min $10' };
        const pos = { id: 'farm-' + Date.now(), farmId, amount, startDate: Date.now(), apy: farm.apy, rewards: farm.rewards };
        this.positions.push(pos);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(pos.id, farm.name, amount, farm.apy, 'farming', true);
        return { success: true, position: pos };
    },
    harvest(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false };
        const days = (Date.now() - pos.startDate) / 86400000;
        const rewards = pos.amount * (pos.apy / 100) * (days / 365);
        pos.startDate = Date.now(); // Reset harvest timer
        this.save();
        return { success: true, rewards, tokens: pos.rewards };
    },
    withdraw(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        const days = (Date.now() - pos.startDate) / 86400000;
        const rewards = pos.amount * (pos.apy / 100) * (days / 365);
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, amount: pos.amount, rewards };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Yield Farming</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.farms.map(f => 
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + f.name + '</strong><br>' + f.protocol + '<br>' + f.apy + '% APY<br>Rewards: ' + f.rewards.join(', ') + '<br>TVL: $' + (f.tvl/1000000000).toFixed(2) + 'B<br><button onclick="YieldFarmingModule.quickDeposit(\'' + f.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Farm</button></div>'
        ).join('') + '</div>';
    },
    quickDeposit(farmId) {
        const amount = parseFloat(prompt('Amount USD (min $10):'));
        if (amount) {
            const r = this.deposit(farmId, amount);
            alert(r.success ? 'Farming started!' : r.error);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => YieldFarmingModule.init());
