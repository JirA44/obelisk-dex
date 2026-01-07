/**
 * SAVINGS ACCOUNTS MODULE - Fixed/Flexible Savings
 */
const SavingsModule = {
    accounts: [
        { id: 'flex-usdc', name: 'USDC Flexible', token: 'USDC', apy: 5, type: 'flexible', minDeposit: 10 },
        { id: 'flex-usdt', name: 'USDT Flexible', token: 'USDT', apy: 4.8, type: 'flexible', minDeposit: 10 },
        { id: 'fixed-usdc-30', name: 'USDC 30-Day Fixed', token: 'USDC', apy: 8, type: 'fixed', lockDays: 30, minDeposit: 100 },
        { id: 'fixed-usdc-90', name: 'USDC 90-Day Fixed', token: 'USDC', apy: 12, type: 'fixed', lockDays: 90, minDeposit: 100 },
        { id: 'fixed-usdc-180', name: 'USDC 180-Day Fixed', token: 'USDC', apy: 15, type: 'fixed', lockDays: 180, minDeposit: 500 },
        { id: 'fixed-eth-90', name: 'ETH 90-Day Fixed', token: 'ETH', apy: 6, type: 'fixed', lockDays: 90, minDeposit: 0.1 },
        { id: 'fixed-btc-90', name: 'BTC 90-Day Fixed', token: 'BTC', apy: 4, type: 'fixed', lockDays: 90, minDeposit: 0.01 },
        { id: 'high-yield-365', name: 'High Yield 1 Year', token: 'USDC', apy: 20, type: 'fixed', lockDays: 365, minDeposit: 1000 }
    ],
    deposits: [],
    init() { this.load(); console.log('Savings Module initialized'); },
    load() { const s = localStorage.getItem('obelisk_savings'); if (s) this.deposits = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_savings', JSON.stringify(this.deposits)); },
    deposit(accountId, amount) {
        const acc = this.accounts.find(a => a.id === accountId);
        if (!acc) return { success: false, error: 'Account not found' };
        if (amount < acc.minDeposit) return { success: false, error: 'Min: ' + acc.minDeposit + ' ' + acc.token };
        const dep = { id: 'sav-' + Date.now(), accountId, amount, startDate: Date.now(), unlockDate: acc.type === 'fixed' ? Date.now() + acc.lockDays * 86400000 : null, apy: acc.apy, token: acc.token };
        this.deposits.push(dep);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(dep.id, acc.name, amount, acc.apy, 'savings', true);
        return { success: true, deposit: dep };
    },
    withdraw(depId) {
        const idx = this.deposits.findIndex(d => d.id === depId);
        if (idx === -1) return { success: false };
        const dep = this.deposits[idx];
        if (dep.unlockDate && Date.now() < dep.unlockDate) return { success: false, error: 'Locked until ' + new Date(dep.unlockDate).toLocaleDateString() };
        const days = (Date.now() - dep.startDate) / 86400000;
        const interest = dep.amount * (dep.apy / 100) * (days / 365);
        this.deposits.splice(idx, 1);
        this.save();
        return { success: true, amount: dep.amount, interest };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3>Savings Accounts</h3><div class="savings-grid">' + this.accounts.map(a => 
            '<div class="savings-card ' + a.type + '"><strong>' + a.name + '</strong><br>' + a.apy + '% APY<br>' + (a.type === 'fixed' ? 'Lock: ' + a.lockDays + ' days' : 'Flexible') + '<br>Min: ' + a.minDeposit + ' ' + a.token + '<br><button onclick="SavingsModule.quickDeposit(\'' + a.id + '\')">Deposit</button></div>'
        ).join('') + '</div>';
    },
    quickDeposit(accountId) {
        const acc = this.accounts.find(a => a.id === accountId);
        const amount = parseFloat(prompt('Amount (min ' + acc.minDeposit + ' ' + acc.token + '):'));
        if (amount) { const r = this.deposit(accountId, amount); alert(r.success ? 'Deposited!' : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => SavingsModule.init());
