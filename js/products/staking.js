/**
 * STAKING MODULE - Obelisk DEX
 */
const StakingModule = {
    pools: [
        // === LIQUID STAKING (No Lock) ===
        { id: 'eth-stake', name: '⟠ ETH Staking', token: 'ETH', apy: 4.5, minStake: 0.01, lockDays: 0, icon: '⟠', risk: 'low', category: 'liquid' },
        { id: 'steth-stake', name: '🔷 stETH Lido', token: 'stETH', apy: 4.2, minStake: 0.01, lockDays: 0, icon: '🔷', risk: 'low', category: 'liquid' },
        { id: 'reth-stake', name: '🚀 rETH Rocket', token: 'rETH', apy: 4.8, minStake: 0.01, lockDays: 0, icon: '🚀', risk: 'low', category: 'liquid' },
        { id: 'cbeth-stake', name: '🔵 cbETH Coinbase', token: 'cbETH', apy: 4.0, minStake: 0.01, lockDays: 0, icon: '🔵', risk: 'low', category: 'liquid' },
        { id: 'sol-stake', name: '◎ SOL Staking', token: 'SOL', apy: 7.2, minStake: 1, lockDays: 0, icon: '◎', risk: 'low', category: 'liquid' },
        { id: 'msol-stake', name: '🌊 mSOL Marinade', token: 'mSOL', apy: 7.5, minStake: 1, lockDays: 0, icon: '🌊', risk: 'low', category: 'liquid' },
        { id: 'bnb-stake', name: '💛 BNB Staking', token: 'BNB', apy: 3.5, minStake: 0.1, lockDays: 0, icon: '💛', risk: 'low', category: 'liquid' },
        { id: 'matic-stake', name: '💜 MATIC Staking', token: 'MATIC', apy: 5.8, minStake: 100, lockDays: 0, icon: '💜', risk: 'low', category: 'liquid' },

        // === PROOF OF STAKE CHAINS ===
        { id: 'avax-stake', name: '🔺 AVAX Staking', token: 'AVAX', apy: 8.5, minStake: 1, lockDays: 14, icon: '🔺', risk: 'low', category: 'pos' },
        { id: 'atom-stake', name: '⚛️ ATOM Cosmos', token: 'ATOM', apy: 12.5, minStake: 5, lockDays: 21, icon: '⚛️', risk: 'medium', category: 'pos' },
        { id: 'dot-stake', name: '⬡ DOT Polkadot', token: 'DOT', apy: 14.0, minStake: 10, lockDays: 28, icon: '⬡', risk: 'medium', category: 'pos' },
        { id: 'ada-stake', name: '💙 ADA Cardano', token: 'ADA', apy: 4.5, minStake: 10, lockDays: 0, icon: '💙', risk: 'low', category: 'pos' },
        { id: 'near-stake', name: '🌐 NEAR Protocol', token: 'NEAR', apy: 9.5, minStake: 1, lockDays: 0, icon: '🌐', risk: 'medium', category: 'pos' },
        { id: 'ftm-stake', name: '👻 FTM Fantom', token: 'FTM', apy: 6.0, minStake: 1, lockDays: 14, icon: '👻', risk: 'medium', category: 'pos' },
        { id: 'algo-stake', name: '⬢ ALGO Algorand', token: 'ALGO', apy: 5.5, minStake: 1, lockDays: 0, icon: '⬢', risk: 'low', category: 'pos' },
        { id: 'one-stake', name: '🎯 ONE Harmony', token: 'ONE', apy: 9.0, minStake: 100, lockDays: 7, icon: '🎯', risk: 'medium', category: 'pos' },
        { id: 'xtz-stake', name: '🥨 XTZ Tezos', token: 'XTZ', apy: 5.0, minStake: 1, lockDays: 0, icon: '🥨', risk: 'low', category: 'pos' },
        { id: 'icp-stake', name: '∞ ICP Internet Computer', token: 'ICP', apy: 8.0, minStake: 1, lockDays: 180, icon: '∞', risk: 'medium', category: 'pos' },
        { id: 'apt-stake', name: '🟣 APT Aptos', token: 'APT', apy: 7.0, minStake: 1, lockDays: 0, icon: '🟣', risk: 'medium', category: 'pos' },
        { id: 'sui-stake', name: '💧 SUI Network', token: 'SUI', apy: 4.0, minStake: 1, lockDays: 0, icon: '💧', risk: 'medium', category: 'pos' },
        { id: 'sei-stake', name: '🌊 SEI Network', token: 'SEI', apy: 5.0, minStake: 10, lockDays: 21, icon: '🌊', risk: 'medium', category: 'pos' },

        // === DEFI GOVERNANCE STAKING ===
        { id: 'aave-stake', name: '👻 AAVE Safety', token: 'AAVE', apy: 6.5, minStake: 1, lockDays: 10, icon: '👻', risk: 'medium', category: 'defi' },
        { id: 'crv-stake', name: '🌀 veCRV Curve', token: 'CRV', apy: 15.0, minStake: 100, lockDays: 365, icon: '🌀', risk: 'medium', category: 'defi' },
        { id: 'gmx-stake', name: '🔵 GMX Staking', token: 'GMX', apy: 12.0, minStake: 1, lockDays: 0, icon: '🔵', risk: 'medium', category: 'defi' },
        { id: 'snx-stake', name: '⚡ SNX Synthetix', token: 'SNX', apy: 18.0, minStake: 50, lockDays: 7, icon: '⚡', risk: 'high', category: 'defi' },
        { id: 'ldo-stake', name: '🏛️ LDO Lido', token: 'LDO', apy: 5.0, minStake: 10, lockDays: 0, icon: '🏛️', risk: 'medium', category: 'defi' },
        { id: 'comp-stake', name: '🟢 COMP Compound', token: 'COMP', apy: 3.5, minStake: 1, lockDays: 0, icon: '🟢', risk: 'low', category: 'defi' },
        { id: 'mkr-stake', name: '🏦 MKR Maker', token: 'MKR', apy: 8.0, minStake: 0.1, lockDays: 0, icon: '🏦', risk: 'medium', category: 'defi' },
        { id: 'uni-stake', name: '🦄 UNI Uniswap', token: 'UNI', apy: 4.0, minStake: 10, lockDays: 0, icon: '🦄', risk: 'low', category: 'defi' },
        { id: 'sushi-stake', name: '🍣 xSUSHI', token: 'SUSHI', apy: 10.0, minStake: 10, lockDays: 0, icon: '🍣', risk: 'medium', category: 'defi' },
        { id: 'bal-stake', name: '⚖️ veBAL Balancer', token: 'BAL', apy: 12.0, minStake: 10, lockDays: 365, icon: '⚖️', risk: 'medium', category: 'defi' },
        { id: 'pendle-stake', name: '🎭 vePENDLE', token: 'PENDLE', apy: 25.0, minStake: 100, lockDays: 730, icon: '🎭', risk: 'high', category: 'defi' },

        // === LAYER 2 STAKING ===
        { id: 'arb-stake', name: '🔷 ARB Arbitrum', token: 'ARB', apy: 8.0, minStake: 100, lockDays: 0, icon: '🔷', risk: 'medium', category: 'l2' },
        { id: 'op-stake', name: '🔴 OP Optimism', token: 'OP', apy: 7.0, minStake: 50, lockDays: 0, icon: '🔴', risk: 'medium', category: 'l2' },
        { id: 'strk-stake', name: '⚡ STRK Starknet', token: 'STRK', apy: 10.0, minStake: 100, lockDays: 21, icon: '⚡', risk: 'high', category: 'l2' },
        { id: 'zk-stake', name: '🔐 ZK zkSync', token: 'ZK', apy: 12.0, minStake: 100, lockDays: 14, icon: '🔐', risk: 'high', category: 'l2' },
        { id: 'mnt-stake', name: '🏔️ MNT Mantle', token: 'MNT', apy: 6.0, minStake: 100, lockDays: 0, icon: '🏔️', risk: 'medium', category: 'l2' },
        { id: 'metis-stake', name: '🌿 METIS', token: 'METIS', apy: 15.0, minStake: 1, lockDays: 7, icon: '🌿', risk: 'medium', category: 'l2' }
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

        const categories = {
            'liquid': { title: '💧 Liquid Staking (No Lock)', color: '#00d4aa' },
            'pos': { title: '⛓️ Proof of Stake Chains', color: '#a855f7' },
            'defi': { title: '🏦 DeFi Governance', color: '#f59e0b' },
            'l2': { title: '🔗 Layer 2 Networks', color: '#3b82f6' }
        };

        let html = `<h3 style="color:#00ff88;margin-bottom:16px;">⚡ Staking Pools (${this.pools.length} available)</h3>`;

        for (const [catId, catInfo] of Object.entries(categories)) {
            const catPools = this.pools.filter(p => p.category === catId);
            if (catPools.length === 0) continue;

            html += `<h4 style="color:${catInfo.color};margin:20px 0 12px;border-bottom:1px solid ${catInfo.color}33;padding-bottom:8px;">${catInfo.title}</h4>`;
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:20px;">';

            for (const p of catPools) {
                const lockText = p.lockDays > 0 ? `🔒 ${p.lockDays}d` : '🔓 Flex';
                html += `
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;transition:all 0.3s;"
                         onmouseover="this.style.borderColor='${catInfo.color}'"
                         onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
                        <div style="font-weight:600;color:#fff;margin-bottom:4px;font-size:12px;">${p.name}</div>
                        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px;">
                            <span style="color:#00ff88;">${p.apy}% APY</span>
                            <span style="color:#888;">${lockText}</span>
                        </div>
                        <div style="font-size:10px;color:#666;margin-bottom:8px;">Min: ${p.minStake} ${p.token}</div>
                        <button onclick="StakingModule.showStakeModal('${p.id}')" style="width:100%;padding:6px;background:linear-gradient(135deg,${catInfo.color},${catInfo.color}88);border:none;border-radius:6px;color:#000;font-weight:600;cursor:pointer;font-size:10px;">Stake</button>
                    </div>`;
            }
            html += '</div>';
        }

        el.innerHTML = html;
    },

    showStakeModal(poolId) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) return;

        const existing = document.getElementById('stake-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'stake-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        const lockInfo = pool.lockDays > 0 ? `<div style="color:#f59e0b;font-size:11px;margin-top:8px;">🔒 Lock period: ${pool.lockDays} days</div>` : '';

        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#1a1a2e,#0d0d1a);border:1px solid #333;border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#fff;margin:0;">Stake ${pool.token}</h3>
                    <button onclick="document.getElementById('stake-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">&times;</button>
                </div>
                <div style="background:rgba(0,255,136,0.1);border-radius:10px;padding:12px;margin-bottom:16px;">
                    <div style="font-size:18px;text-align:center;margin-bottom:8px;">${pool.icon}</div>
                    <div style="text-align:center;color:#fff;font-weight:600;">${pool.name}</div>
                    <div style="text-align:center;color:#00ff88;font-size:24px;font-weight:700;margin:8px 0;">${pool.apy}% APY</div>
                    ${lockInfo}
                </div>
                <div style="margin-bottom:16px;">
                    <label style="color:#888;font-size:12px;display:block;margin-bottom:6px;">Amount (${pool.token})</label>
                    <input type="number" id="stake-amount" min="${pool.minStake}" value="${pool.minStake}"
                           style="width:100%;padding:12px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#fff;font-size:16px;box-sizing:border-box;">
                    <div style="color:#666;font-size:10px;margin-top:4px;">Minimum: ${pool.minStake} ${pool.token}</div>
                </div>
                <div style="display:flex;gap:10px;">
                    <button onclick="document.getElementById('stake-modal').remove()"
                            style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;cursor:pointer;">Cancel</button>
                    <button onclick="StakingModule.confirmStake('${pool.id}')"
                            style="flex:2;padding:12px;background:linear-gradient(135deg,#00ff88,#00d4aa);border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">Stake Now</button>
                </div>
            </div>`;

        document.body.appendChild(modal);
    },

    confirmStake(poolId) {
        const amount = parseFloat(document.getElementById('stake-amount').value);
        const pool = this.pools.find(p => p.id === poolId);

        if (!amount || amount < pool.minStake) {
            if (typeof showNotification === 'function') showNotification('Minimum: ' + pool.minStake + ' ' + pool.token, 'error');
            return;
        }

        const result = this.stake(poolId, amount);
        document.getElementById('stake-modal').remove();

        if (result.success) {
            if (typeof showNotification === 'function') showNotification('Staked ' + amount + ' ' + pool.token + '!', 'success');
        } else {
            if (typeof showNotification === 'function') showNotification(result.error, 'error');
        }
    },

    quickStake(poolId) {
        this.showStakeModal(poolId);
    }
};
document.addEventListener('DOMContentLoaded', () => StakingModule.init());
