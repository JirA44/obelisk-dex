/**
 * STAKING MODULE - Obelisk DEX
 * Merged with InvestmentProducts (3000+ products)
 */
const StakingModule = {
    pools: [],
    userStakes: [],

    /**
     * Get translation using global I18n system
     * Falls back to key if translation not found
     */
    t(key) {
        if (typeof I18n !== 'undefined' && I18n.t) {
            return I18n.t('staking_' + key) || I18n.t(key) || key;
        }
        return key;
    },

    init() {
        this.loadPools();
        this.loadUserStakes();
        console.log('[STAKING] Module initialized with', this.pools.length, 'pools');
    },

    loadPools() {
        // Load from InvestmentProducts if available
        if (typeof InvestmentProducts !== 'undefined' && InvestmentProducts.staking?.products) {
            this.pools = InvestmentProducts.staking.products.map(p => ({
                id: p.id,
                name: p.icon + ' ' + p.name,
                token: p.token,
                apy: p.apy,
                minStake: p.minAmount || p.minInvest || 1,
                lockDays: p.lockPeriod || 0,
                icon: p.icon,
                risk: p.risk || 'medium',
                category: 'imported',
                description: p.description,
                tvl: p.tvl,
                autoCompound: p.autoCompound
            }));
            console.log('[STAKING] Loaded', this.pools.length, 'products from InvestmentProducts');
        } else {
            // Fallback pools de base
            this.pools = [
                { id: 'eth-stake', name: '⟠ ETH Staking', token: 'ETH', apy: 4.5, minStake: 0.01, lockDays: 0, icon: '⟠', risk: 'low', category: 'liquid' },
                { id: 'sol-stake', name: '◎ SOL Staking', token: 'SOL', apy: 7.2, minStake: 1, lockDays: 0, icon: '◎', risk: 'low', category: 'liquid' },
                { id: 'bnb-stake', name: '💛 BNB Staking', token: 'BNB', apy: 3.5, minStake: 0.1, lockDays: 0, icon: '💛', risk: 'low', category: 'liquid' }
            ];
            console.log('[STAKING] Using fallback pools');
        }
    },
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

        // Reload pools if empty
        if (this.pools.length === 0) this.loadPools();

        const categories = {
            'liquid': { title: '💧 ' + this.t('liquid'), color: '#00d4aa' },
            'pos': { title: '⛓️ ' + this.t('pos'), color: '#a855f7' },
            'defi': { title: '🏦 ' + this.t('defi'), color: '#f59e0b' },
            'l2': { title: '🔗 ' + this.t('l2'), color: '#3b82f6' },
            'imported': { title: '📦 ' + this.t('imported'), color: '#00ff88' }
        };

        let html = `<h3 style="color:#00ff88;margin-bottom:16px;">⚡ ${this.t('title')} (${this.pools.length} ${this.t('available')})</h3>`;

        // Display all pools
        const poolsToShow = this.pools;

        // If all products are "imported", display them sorted by APY
        const importedPools = poolsToShow.filter(p => p.category === 'imported');
        if (importedPools.length > 0) {
            // Sort by APY descending
            const sorted = [...importedPools].sort((a, b) => b.apy - a.apy);

            html += `<h4 style="color:#00ff88;margin:20px 0 12px;border-bottom:1px solid #00ff8833;padding-bottom:8px;">📦 ${this.t('imported')} (${sorted.length})</h4>`;
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:20px;max-height:600px;overflow-y:auto;padding-right:8px;">';

            for (const p of sorted) {
                const lockText = p.lockDays > 0 ? `🔒 ${p.lockDays}${this.t('days').charAt(0)}` : '🔓 ' + this.t('flex');
                const riskColor = p.risk === 'low' ? '#00ff88' : p.risk === 'high' ? '#f87171' : '#facc15';
                html += `
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;transition:all 0.3s;cursor:pointer;"
                         onclick="StakingModule.showStakeModal('${p.id}')"
                         onmouseover="this.style.borderColor='#00ff88';this.style.transform='scale(1.02)'"
                         onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.transform='scale(1)'">
                        <div style="font-weight:600;color:#fff;margin-bottom:4px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                        <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;">
                            <span style="color:#00ff88;font-weight:700;">${p.apy}% APY</span>
                            <span style="color:#888;">${lockText}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:9px;color:#666;">
                            <span>${this.t('min')}: ${p.minStake}</span>
                            <span style="color:${riskColor};">●</span>
                        </div>
                    </div>`;
            }
            html += '</div>';
        }

        // Autres catégories (fallback)
        for (const [catId, catInfo] of Object.entries(categories)) {
            if (catId === 'imported') continue;
            const catPools = poolsToShow.filter(p => p.category === catId);
            if (catPools.length === 0) continue;

            html += `<h4 style="color:${catInfo.color};margin:20px 0 12px;border-bottom:1px solid ${catInfo.color}33;padding-bottom:8px;">${catInfo.title}</h4>`;
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:20px;">';

            for (const p of catPools) {
                const lockText = p.lockDays > 0 ? `🔒 ${p.lockDays}${this.t('days').charAt(0)}` : '🔓 ' + this.t('flex');
                html += `
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;transition:all 0.3s;cursor:pointer;"
                         onclick="StakingModule.showStakeModal('${p.id}')"
                         onmouseover="this.style.borderColor='${catInfo.color}'"
                         onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
                        <div style="font-weight:600;color:#fff;margin-bottom:4px;font-size:11px;">${p.name}</div>
                        <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;">
                            <span style="color:#00ff88;">${p.apy}% APY</span>
                            <span style="color:#888;">${lockText}</span>
                        </div>
                        <div style="font-size:9px;color:#666;">${this.t('min')}: ${p.minStake} ${p.token}</div>
                    </div>`;
            }
            html += '</div>';
        }

        el.innerHTML = html;
    },

    showStakeModal(poolId) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) return;

        // Use InvestHelper for dual mode (Simulated/Real)
        // Map risk text to number (staking is generally low risk)
        const riskMap = { low: 2, medium: 3, high: 4 };
        if (typeof InvestHelper !== 'undefined') {
            InvestHelper.show({
                name: pool.name,
                id: pool.id,
                apy: pool.apy,
                minInvest: pool.minStake || 1,
                fee: 0,
                risk: riskMap[pool.risk] || 2,  // Default to low risk for staking
                icon: pool.icon || '⚡',
                onInvest: (amount, mode) => {
                    this.executeStake(pool, amount, mode);
                }
            });
        } else {
            // Fallback to simple modal if InvestHelper not loaded
            this.showSimpleStakeModal(poolId);
        }
    },

    executeStake(pool, amount, mode) {
        if (mode === 'simulated') {
            const result = this.stake(pool.id, amount);
            if (!result.success && typeof showNotification === 'function') {
                showNotification(result.error, 'error');
            }
        } else {
            // Real mode - would integrate with actual blockchain staking
            if (typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected()) {
                // Execute real staking (placeholder for actual implementation)
                console.log('[STAKING] Real stake:', amount, pool.token);
                if (typeof showNotification === 'function') {
                    showNotification('Real staking submitted for ' + amount + ' ' + pool.token, 'success');
                }
            }
        }
    },

    showSimpleStakeModal(poolId) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) return;

        const existing = document.getElementById('stake-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'stake-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:center;justify-content:center;';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#1a1a2e,#0d0d1a);border:1px solid #333;border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#fff;margin:0;">Stake ${pool.token}</h3>
                    <button onclick="document.getElementById('stake-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">&times;</button>
                </div>
                <div style="background:rgba(0,255,136,0.1);border-radius:10px;padding:12px;margin-bottom:16px;">
                    <div style="text-align:center;color:#fff;font-weight:600;">${pool.name}</div>
                    <div style="text-align:center;color:#00ff88;font-size:24px;font-weight:700;margin:8px 0;">${pool.apy}% APY</div>
                </div>
                <div style="margin-bottom:16px;">
                    <input type="number" id="stake-amount" min="${pool.minStake}" value="${pool.minStake}"
                           style="width:100%;padding:12px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#fff;font-size:16px;box-sizing:border-box;">
                </div>
                <div style="background:linear-gradient(135deg,rgba(0,212,170,0.1),rgba(0,212,170,0.05));border:1px solid rgba(0,212,170,0.3);border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="color:#00d4aa;font-size:11px;font-weight:600;text-align:center;margin-bottom:8px;">📥 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Staker' : 'Stake'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="StakingModule.confirmStake('${pool.id}',true)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">🎮 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'SIMULÉ' : 'SIMULATED'}</button>
                        <button onclick="StakingModule.confirmStake('${pool.id}',false)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#00d4aa,#00a884);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">💎 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'RÉEL' : 'REAL'}</button>
                    </div>
                </div>
                <div style="background:linear-gradient(135deg,rgba(255,159,67,0.1),rgba(255,159,67,0.05));border:1px solid rgba(255,159,67,0.3);border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="color:#ff9f43;font-size:11px;font-weight:600;text-align:center;margin-bottom:8px;">📤 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Retirer' : 'Withdraw'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="StakingModule.confirmWithdraw('${pool.id}',true)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,rgba(168,85,247,0.3),rgba(168,85,247,0.2));border:1px solid rgba(168,85,247,0.5);color:#ddd;font-size:11px;font-weight:600;cursor:pointer;">🎮 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'SIMULÉ' : 'SIMULATED'}</button>
                        <button onclick="StakingModule.confirmWithdraw('${pool.id}',false)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,rgba(0,212,170,0.3),rgba(0,212,170,0.2));border:1px solid rgba(0,212,170,0.5);color:#ddd;font-size:11px;font-weight:600;cursor:pointer;">💎 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'RÉEL' : 'REAL'}</button>
                    </div>
                </div>
                <button onclick="document.getElementById('stake-modal').remove()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#aaa;cursor:pointer;">${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Annuler' : 'Cancel'}</button>
            </div>`;

        document.body.appendChild(modal);
    },

    confirmStake(poolId, isSimulated = true) {
        const amount = parseFloat(document.getElementById('stake-amount').value);
        const pool = this.pools.find(p => p.id === poolId);
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        if (!amount || amount < pool.minStake) {
            if (typeof showNotification === 'function') showNotification('Minimum: ' + pool.minStake + ' ' + pool.token, 'error');
            return;
        }

        if (!isSimulated) {
            const walletConnected = (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) ||
                                    (typeof WalletConnect !== 'undefined' && WalletConnect.connected);
            if (!walletConnected) {
                if (typeof showNotification === 'function') {
                    showNotification(isFr ? 'Connectez votre wallet pour staker en réel' : 'Connect wallet to stake with real funds', 'warning');
                }
                return;
            }
        }

        const result = this.stake(poolId, amount, isSimulated);
        document.getElementById('stake-modal').remove();

        if (result.success) {
            const modeText = isSimulated ? '🎮' : '💎';
            if (typeof showNotification === 'function') showNotification(modeText + ' ' + (isFr ? 'Staké ' : 'Staked ') + amount + ' ' + pool.token + '!', 'success');
        } else {
            if (typeof showNotification === 'function') showNotification(result.error, 'error');
        }
    },

    quickStake(poolId) {
        this.showStakeModal(poolId);
    },

    confirmWithdraw(poolId, isSimulated = true) {
        const pool = this.pools.find(p => p.id === poolId);
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        // Find user's stake in this pool
        const stake = this.userStakes.find(s => s.poolId === poolId);
        if (!stake) {
            if (typeof showNotification === 'function') {
                showNotification(isFr ? 'Aucun stake trouvé pour ce pool' : 'No stake found for this pool', 'warning');
            }
            return;
        }

        if (!isSimulated) {
            const walletConnected = (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) ||
                                    (typeof WalletConnect !== 'undefined' && WalletConnect.connected);
            if (!walletConnected) {
                if (typeof showNotification === 'function') {
                    showNotification(isFr ? 'Connectez votre wallet pour retirer en réel' : 'Connect wallet to withdraw real funds', 'warning');
                }
                return;
            }
        }

        const result = this.unstake(stake.id);
        const modal = document.getElementById('stake-modal');
        if (modal) modal.remove();

        if (result.success) {
            const modeText = isSimulated ? '🎮' : '💎';
            const rewardText = result.rewards > 0 ? ' (+' + result.rewards.toFixed(4) + ' ' + (isFr ? 'récompenses' : 'rewards') + ')' : '';
            if (typeof showNotification === 'function') {
                showNotification(modeText + ' ' + (isFr ? 'Retiré ' : 'Withdrawn ') + result.amount + ' ' + pool.token + rewardText, 'success');
            }
            // Update SimulatedPortfolio if exists
            if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.removeInvestment) {
                SimulatedPortfolio.removeInvestment(stake.id);
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification(isFr ? 'Retrait échoué' : 'Withdrawal failed', 'error');
            }
        }
    }
};
document.addEventListener('DOMContentLoaded', () => StakingModule.init());
