/**
 * VAULTS MODULE - Auto-compound strategies
 */
const VaultsModule = {
    vaults: [
        { id: 'eth-compound', name: 'ETH Compounder', token: 'ETH', apy: 15, strategy: 'Lido + Curve + Convex', risk: 'medium', tvl: 12000000 },
        { id: 'btc-yield', name: 'BTC Yield Max', token: 'WBTC', apy: 12, strategy: 'Aave + Compound', risk: 'low', tvl: 20000000 },
        { id: 'stable-max', name: 'Stable Maximizer', token: 'USDC', apy: 18, strategy: 'Curve + Yearn', risk: 'low', tvl: 35000000 },
        { id: 'delta-neutral', name: 'Delta Neutral', token: 'USDC', apy: 25, strategy: 'Perp hedging', risk: 'medium', tvl: 8000000 },
        { id: 'sol-turbo', name: 'SOL Turbo', token: 'SOL', apy: 45, strategy: 'Marinade + Orca', risk: 'high', tvl: 5000000 },
        { id: 'arb-degen', name: 'ARB Degen Vault', token: 'ARB', apy: 80, strategy: 'Multi-farm', risk: 'extreme', tvl: 2000000 }
    ],
    userDeposits: [],
    init() { this.load(); console.log('Vaults Module initialized'); },
    load() { const s = localStorage.getItem('obelisk_vaults'); if (s) this.userDeposits = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_vaults', JSON.stringify(this.userDeposits)); },
    deposit(vaultId, amount) {
        const vault = this.vaults.find(v => v.id === vaultId);
        if (!vault || amount < 10) return { success: false, error: 'Min $10' };
        const dep = { id: 'vault-' + Date.now(), vaultId, amount, startDate: Date.now(), apy: vault.apy };
        this.userDeposits.push(dep);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(dep.id, vault.name, amount, vault.apy, 'vault', true);
        return { success: true, deposit: dep };
    },
    withdraw(depId) {
        const idx = this.userDeposits.findIndex(d => d.id === depId);
        if (idx === -1) return { success: false };
        const dep = this.userDeposits[idx];
        const days = (Date.now() - dep.startDate) / 86400000;
        const rewards = dep.amount * (dep.apy / 100) * (days / 365);
        this.userDeposits.splice(idx, 1);
        this.save();
        return { success: true, amount: dep.amount + rewards };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3>Auto-Compound Vaults</h3><div class="vaults-grid">' + this.vaults.map(v => 
            '<div class="vault-card ' + v.risk + '"><strong>' + v.name + '</strong><br>' + v.apy + '% APY<br>' + v.strategy + '<br>TVL: $' + (v.tvl/1000000).toFixed(1) + 'M<br><button onclick="VaultsModule.quickDeposit(\'' + v.id + '\')">Deposit</button></div>'
        ).join('') + '</div>';
    },
    quickDeposit(vaultId) {
        const vault = this.vaults.find(v => v.id === vaultId);
        const amount = parseFloat(prompt('Amount to deposit (min $10):'));
        if (amount) {
            const r = this.deposit(vaultId, amount);
            alert(r.success ? 'Deposited!' : r.error);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => VaultsModule.init());
