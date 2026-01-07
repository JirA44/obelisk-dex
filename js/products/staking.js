/**
 * STAKING MODULE - Obelisk DEX
 */
const StakingModule = {
    pools: [
        { id: 'eth-stake', name: 'ETH Staking', token: 'ETH', apy: 4.5, minStake: 0.01, lockDays: 0, icon: 'E', risk: 'low' },
        { id: 'sol-stake', name: 'SOL Staking', token: 'SOL', apy: 7.2, minStake: 1, lockDays: 0, icon: 'S', risk: 'low' },
        { id: 'avax-stake', name: 'AVAX Staking', token: 'AVAX', apy: 8.5, minStake: 1, lockDays: 14, icon: 'A', risk: 'low' },
        { id: 'matic-stake', name: 'MATIC Staking', token: 'MATIC', apy: 5.8, minStake: 100, lockDays: 0, icon: 'M', risk: 'low' },
        { id: 'atom-stake', name: 'ATOM Staking', token: 'ATOM', apy: 12.5, minStake: 5, lockDays: 21, icon: 'C', risk: 'medium' },
        { id: 'dot-stake', name: 'DOT Staking', token: 'DOT', apy: 14.0, minStake: 10, lockDays: 28, icon: 'D', risk: 'medium' }
    ],
    userStakes: [],
    init() { this.loadUserStakes(); console.log('Staking Module initialized'); },
    loadUserStakes() { this.userStakes = SafeOps.getStorage('obelisk_staking', []); },
    saveUserStakes() { SafeOps.setStorage('obelisk_staking', this.userStakes); },
    stake(poolId, amount) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) return { success: false, error: 'Pool not found' };
        if (amount < pool.minStake) return { success: false, error: 'Min: ' + pool.minStake };
        const stake = { id: 'stk-' + Date.now(), poolId, amount, startDate: Date.now(), apy: pool.apy };
        this.userStakes.push(stake);
        this.saveUserStakes();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(stake.id, pool.name, amount, pool.apy, 'staking', true);
        return { success: true, stake };
    },
    unstake(stakeId) {
        const idx = this.userStakes.findIndex(s => s.id === stakeId);
        if (idx === -1) return { success: false };
        const stake = this.userStakes[idx];
        const days = (Date.now() - stake.startDate) / 86400000;
        const rewards = stake.amount * (stake.apy / 100) * (days / 365);
        this.userStakes.splice(idx, 1);
        this.saveUserStakes();
        return { success: true, amount: stake.amount, rewards };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Staking Pools</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">' + this.pools.map(p => 
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + p.icon + ' ' + p.name + '</strong><br>' + p.apy + '% APY<br>Min: ' + p.minStake + ' ' + p.token + '<br><button onclick="StakingModule.quickStake(\'' + p.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Stake</button></div>'
        ).join('') + '</div>';
    },
    quickStake(poolId) {
        const pool = this.pools.find(p => p.id === poolId);
        const amount = parseFloat(prompt('Amount to stake (min ' + pool.minStake + '):'));
        if (amount) {
            const r = this.stake(poolId, amount);
            alert(r.success ? 'Staked!' : r.error);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => StakingModule.init());
