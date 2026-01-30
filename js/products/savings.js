/**
 * SAVINGS ACCOUNTS MODULE - Fixed/Flexible Savings
 * Extended version with 40+ savings accounts in categories
 */
const SavingsModule = {
    accounts: [
        // === FLEXIBLE STABLECOINS (No Lock) ===
        { id: 'flex-usdc', name: '💵 USDC Flexible', token: 'USDC', apy: 5, type: 'flexible', minDeposit: 10, category: 'flex-stable', icon: '💵' },
        { id: 'flex-usdt', name: '💵 USDT Flexible', token: 'USDT', apy: 4.8, type: 'flexible', minDeposit: 10, category: 'flex-stable', icon: '💵' },
        { id: 'flex-dai', name: '💵 DAI Flexible', token: 'DAI', apy: 4.5, type: 'flexible', minDeposit: 10, category: 'flex-stable', icon: '💵' },
        { id: 'flex-frax', name: '💵 FRAX Flexible', token: 'FRAX', apy: 5.2, type: 'flexible', minDeposit: 10, category: 'flex-stable', icon: '💵' },
        { id: 'flex-lusd', name: '💵 LUSD Flexible', token: 'LUSD', apy: 4.2, type: 'flexible', minDeposit: 10, category: 'flex-stable', icon: '💵' },
        { id: 'flex-gho', name: '💵 GHO Flexible', token: 'GHO', apy: 5.5, type: 'flexible', minDeposit: 10, category: 'flex-stable', icon: '💵' },
        { id: 'flex-crvusd', name: '💵 crvUSD Flexible', token: 'crvUSD', apy: 6, type: 'flexible', minDeposit: 10, category: 'flex-stable', icon: '💵' },
        { id: 'flex-usde', name: '💵 USDe Flexible', token: 'USDe', apy: 8, type: 'flexible', minDeposit: 10, category: 'flex-stable', icon: '💵' },

        // === FLEXIBLE CRYPTO (No Lock) ===
        { id: 'flex-eth', name: '⟠ ETH Flexible', token: 'ETH', apy: 2.5, type: 'flexible', minDeposit: 0.01, category: 'flex-crypto', icon: '⟠' },
        { id: 'flex-btc', name: '₿ BTC Flexible', token: 'WBTC', apy: 1.8, type: 'flexible', minDeposit: 0.001, category: 'flex-crypto', icon: '₿' },
        { id: 'flex-sol', name: '◎ SOL Flexible', token: 'SOL', apy: 3.5, type: 'flexible', minDeposit: 0.5, category: 'flex-crypto', icon: '◎' },
        { id: 'flex-avax', name: '🔺 AVAX Flexible', token: 'AVAX', apy: 4, type: 'flexible', minDeposit: 1, category: 'flex-crypto', icon: '🔺' },
        { id: 'flex-matic', name: '🟣 MATIC Flexible', token: 'MATIC', apy: 3.2, type: 'flexible', minDeposit: 50, category: 'flex-crypto', icon: '🟣' },
        { id: 'flex-arb', name: '🔷 ARB Flexible', token: 'ARB', apy: 5, type: 'flexible', minDeposit: 50, category: 'flex-crypto', icon: '🔷' },

        // === 30-DAY FIXED ===
        { id: 'fixed-usdc-30', name: '💵 USDC 30-Day', token: 'USDC', apy: 8, type: 'fixed', lockDays: 30, minDeposit: 100, category: 'fixed-30', icon: '💵' },
        { id: 'fixed-usdt-30', name: '💵 USDT 30-Day', token: 'USDT', apy: 7.5, type: 'fixed', lockDays: 30, minDeposit: 100, category: 'fixed-30', icon: '💵' },
        { id: 'fixed-dai-30', name: '💵 DAI 30-Day', token: 'DAI', apy: 7.2, type: 'fixed', lockDays: 30, minDeposit: 100, category: 'fixed-30', icon: '💵' },
        { id: 'fixed-eth-30', name: '⟠ ETH 30-Day', token: 'ETH', apy: 4, type: 'fixed', lockDays: 30, minDeposit: 0.05, category: 'fixed-30', icon: '⟠' },
        { id: 'fixed-btc-30', name: '₿ BTC 30-Day', token: 'WBTC', apy: 3, type: 'fixed', lockDays: 30, minDeposit: 0.005, category: 'fixed-30', icon: '₿' },

        // === 90-DAY FIXED ===
        { id: 'fixed-usdc-90', name: '💵 USDC 90-Day', token: 'USDC', apy: 12, type: 'fixed', lockDays: 90, minDeposit: 100, category: 'fixed-90', icon: '💵' },
        { id: 'fixed-usdt-90', name: '💵 USDT 90-Day', token: 'USDT', apy: 11, type: 'fixed', lockDays: 90, minDeposit: 100, category: 'fixed-90', icon: '💵' },
        { id: 'fixed-dai-90', name: '💵 DAI 90-Day', token: 'DAI', apy: 10.5, type: 'fixed', lockDays: 90, minDeposit: 100, category: 'fixed-90', icon: '💵' },
        { id: 'fixed-eth-90', name: '⟠ ETH 90-Day', token: 'ETH', apy: 6, type: 'fixed', lockDays: 90, minDeposit: 0.1, category: 'fixed-90', icon: '⟠' },
        { id: 'fixed-btc-90', name: '₿ BTC 90-Day', token: 'BTC', apy: 4, type: 'fixed', lockDays: 90, minDeposit: 0.01, category: 'fixed-90', icon: '₿' },
        { id: 'fixed-sol-90', name: '◎ SOL 90-Day', token: 'SOL', apy: 8, type: 'fixed', lockDays: 90, minDeposit: 2, category: 'fixed-90', icon: '◎' },
        { id: 'fixed-avax-90', name: '🔺 AVAX 90-Day', token: 'AVAX', apy: 9, type: 'fixed', lockDays: 90, minDeposit: 5, category: 'fixed-90', icon: '🔺' },

        // === 180-DAY FIXED ===
        { id: 'fixed-usdc-180', name: '💵 USDC 180-Day', token: 'USDC', apy: 15, type: 'fixed', lockDays: 180, minDeposit: 500, category: 'fixed-180', icon: '💵' },
        { id: 'fixed-usdt-180', name: '💵 USDT 180-Day', token: 'USDT', apy: 14, type: 'fixed', lockDays: 180, minDeposit: 500, category: 'fixed-180', icon: '💵' },
        { id: 'fixed-dai-180', name: '💵 DAI 180-Day', token: 'DAI', apy: 13.5, type: 'fixed', lockDays: 180, minDeposit: 500, category: 'fixed-180', icon: '💵' },
        { id: 'fixed-eth-180', name: '⟠ ETH 180-Day', token: 'ETH', apy: 8, type: 'fixed', lockDays: 180, minDeposit: 0.2, category: 'fixed-180', icon: '⟠' },
        { id: 'fixed-btc-180', name: '₿ BTC 180-Day', token: 'BTC', apy: 5.5, type: 'fixed', lockDays: 180, minDeposit: 0.02, category: 'fixed-180', icon: '₿' },
        { id: 'fixed-sol-180', name: '◎ SOL 180-Day', token: 'SOL', apy: 11, type: 'fixed', lockDays: 180, minDeposit: 5, category: 'fixed-180', icon: '◎' },

        // === 365-DAY FIXED (HIGH YIELD) ===
        { id: 'high-yield-365', name: '💵 USDC 1-Year', token: 'USDC', apy: 20, type: 'fixed', lockDays: 365, minDeposit: 1000, category: 'fixed-365', icon: '💵' },
        { id: 'hy-usdt-365', name: '💵 USDT 1-Year', token: 'USDT', apy: 18, type: 'fixed', lockDays: 365, minDeposit: 1000, category: 'fixed-365', icon: '💵' },
        { id: 'hy-dai-365', name: '💵 DAI 1-Year', token: 'DAI', apy: 17, type: 'fixed', lockDays: 365, minDeposit: 1000, category: 'fixed-365', icon: '💵' },
        { id: 'hy-eth-365', name: '⟠ ETH 1-Year', token: 'ETH', apy: 10, type: 'fixed', lockDays: 365, minDeposit: 0.5, category: 'fixed-365', icon: '⟠' },
        { id: 'hy-btc-365', name: '₿ BTC 1-Year', token: 'BTC', apy: 7, type: 'fixed', lockDays: 365, minDeposit: 0.05, category: 'fixed-365', icon: '₿' },
        { id: 'hy-sol-365', name: '◎ SOL 1-Year', token: 'SOL', apy: 14, type: 'fixed', lockDays: 365, minDeposit: 10, category: 'fixed-365', icon: '◎' },

        // === PREMIUM SAVINGS (VIP) ===
        { id: 'vip-usdc', name: '👑 VIP USDC', token: 'USDC', apy: 25, type: 'fixed', lockDays: 365, minDeposit: 10000, category: 'premium', icon: '👑' },
        { id: 'vip-eth', name: '👑 VIP ETH', token: 'ETH', apy: 15, type: 'fixed', lockDays: 365, minDeposit: 5, category: 'premium', icon: '👑' },
        { id: 'vip-btc', name: '👑 VIP BTC', token: 'BTC', apy: 10, type: 'fixed', lockDays: 365, minDeposit: 0.5, category: 'premium', icon: '👑' },
        { id: 'whale-usdc', name: '🐋 Whale USDC', token: 'USDC', apy: 30, type: 'fixed', lockDays: 365, minDeposit: 100000, category: 'premium', icon: '🐋' },
    ],

    categories: {
        'flex-stable': { name: 'Flexible Stablecoins', color: '#22c55e', description: 'Withdraw anytime, no lock' },
        'flex-crypto': { name: 'Flexible Crypto', color: '#3b82f6', description: 'Crypto savings, no lock' },
        'fixed-30': { name: '30-Day Fixed', color: '#8b5cf6', description: 'Lock 30 days, better rates' },
        'fixed-90': { name: '90-Day Fixed', color: '#f59e0b', description: 'Lock 90 days, premium rates' },
        'fixed-180': { name: '180-Day Fixed', color: '#ec4899', description: 'Lock 6 months, high yields' },
        'fixed-365': { name: '1-Year Fixed', color: '#ef4444', description: 'Lock 1 year, maximum yields' },
        'premium': { name: 'Premium Accounts', color: '#ffd700', description: 'VIP tiers for large deposits' }
    },

    deposits: [],

    init() {
        this.load();
        console.log('Savings Module initialized - ' + this.accounts.length + ' accounts available');
    },

    load() {
        this.deposits = SafeOps.getStorage('obelisk_savings', []);
    },

    save() {
        SafeOps.setStorage('obelisk_savings', this.deposits);
    },

    deposit(accountId, amount) {
        const acc = this.accounts.find(a => a.id === accountId);
        if (!acc) return { success: false, error: 'Account not found' };
        if (amount < acc.minDeposit) return { success: false, error: 'Min: ' + acc.minDeposit + ' ' + acc.token };
        const dep = {
            id: 'sav-' + Date.now(),
            accountId,
            amount,
            startDate: Date.now(),
            unlockDate: acc.type === 'fixed' ? Date.now() + acc.lockDays * 86400000 : null,
            apy: acc.apy,
            token: acc.token
        };
        this.deposits.push(dep);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(dep.id, acc.name, amount, acc.apy, 'savings', true);
        return { success: true, deposit: dep };
    },

    withdraw(depId) {
        const idx = this.deposits.findIndex(d => d.id === depId);
        if (idx === -1) return { success: false };
        const dep = this.deposits[idx];
        if (dep.unlockDate && Date.now() < dep.unlockDate) {
            return { success: false, error: 'Locked until ' + new Date(dep.unlockDate).toLocaleDateString() };
        }
        const days = (Date.now() - dep.startDate) / 86400000;
        const interest = dep.amount * (dep.apy / 100) * (days / 365);
        this.deposits.splice(idx, 1);
        this.save();
        return { success: true, amount: dep.amount, interest };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = '<h3 style="color:#00ff88;margin-bottom:16px;">Savings Accounts (' + this.accounts.length + ' options)</h3>';

        // Render by category
        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catAccounts = this.accounts.filter(a => a.category === catKey);
            if (catAccounts.length === 0) return;

            html += '<div style="margin-bottom:24px;">';
            html += '<h4 style="color:' + cat.color + ';margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ' + cat.color + ';">' + cat.name + ' <span style="font-size:11px;opacity:0.7;">(' + catAccounts.length + ' accounts) - ' + cat.description + '</span></h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">';

            catAccounts.forEach(a => {
                html += '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;">';
                html += '<div style="font-weight:bold;font-size:13px;margin-bottom:6px;">' + (a.icon || '') + ' ' + a.name + '</div>';
                html += '<div style="color:#00ff88;font-size:16px;font-weight:bold;">' + a.apy + '% APY</div>';
                html += '<div style="font-size:10px;color:#888;margin:4px 0;">' + (a.type === 'fixed' ? 'Lock: ' + a.lockDays + ' days' : 'Flexible') + '</div>';
                html += '<div style="font-size:10px;">Min: ' + a.minDeposit + ' ' + a.token + '</div>';
                html += '<button onclick="SavingsModule.showDepositModal(\'' + a.id + '\')" style="margin-top:8px;padding:6px 12px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:11px;width:100%;">Deposit</button>';
                html += '</div>';
            });

            html += '</div></div>';
        });

        el.innerHTML = html;
    },

    showDepositModal(accountId) {
        const acc = this.accounts.find(a => a.id === accountId);
        if (!acc) return;

        // Remove existing modal
        const existing = document.getElementById('savings-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'savings-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:#00ff88;margin:0 0 16px;">${acc.icon || ''} ${acc.name}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">APY:</span>
                        <span style="color:#00ff88;font-weight:bold;">${acc.apy}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Type:</span>
                        <span>${acc.type === 'fixed' ? 'Fixed (' + acc.lockDays + ' days)' : 'Flexible'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Minimum:</span>
                        <span>${acc.minDeposit} ${acc.token}</span>
                    </div>
                    ${acc.type === 'fixed' ? '<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:8px;margin-top:8px;font-size:11px;color:#f59e0b;">⚠️ Funds locked for ' + acc.lockDays + ' days</div>' : ''}
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">Amount (min ${acc.minDeposit} ${acc.token})</label>
                    <input type="number" id="savings-amount" min="${acc.minDeposit}" placeholder="Enter amount..." style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="display:flex;gap:12px;">
                    <button onclick="document.getElementById('savings-modal').remove()" style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;">Cancel</button>
                    <button onclick="SavingsModule.confirmDeposit('${acc.id}')" style="flex:1;padding:12px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Deposit</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Focus input
        setTimeout(() => document.getElementById('savings-amount').focus(), 100);
    },

    confirmDeposit(accountId) {
        const acc = this.accounts.find(a => a.id === accountId);
        const amount = parseFloat(document.getElementById('savings-amount').value);

        if (!amount || amount < acc.minDeposit) {
            alert('Minimum deposit is ' + acc.minDeposit + ' ' + acc.token);
            return;
        }

        const result = this.deposit(accountId, amount);
        document.getElementById('savings-modal').remove();

        if (result.success) {
            if (typeof showNotification === 'function') {
                showNotification('Deposited ' + amount + ' ' + acc.token + ' in ' + acc.name, 'success');
            } else {
                alert('Deposited ' + amount + ' ' + acc.token + ' in ' + acc.name);
            }
        } else {
            alert(result.error || 'Deposit failed');
        }
    },

    quickDeposit(accountId) {
        this.showDepositModal(accountId);
    }
};

document.addEventListener('DOMContentLoaded', () => SavingsModule.init());
