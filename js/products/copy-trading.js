/**
 * COPY TRADING MODULE - Follow Top Traders
 */
const CopyTradingModule = {
    traders: [
        { id: 'whale-alpha', name: 'Whale Alpha', pnl30d: 45.2, winRate: 72, followers: 15420, aum: 25000000, minCopy: 100, fee: 10 },
        { id: 'degen-king', name: 'Degen King', pnl30d: 120.5, winRate: 58, followers: 8900, aum: 8000000, minCopy: 50, fee: 20 },
        { id: 'steady-gains', name: 'Steady Gains', pnl30d: 12.3, winRate: 85, followers: 32000, aum: 50000000, minCopy: 500, fee: 5 },
        { id: 'sol-master', name: 'SOL Master', pnl30d: 89.7, winRate: 65, followers: 5600, aum: 12000000, minCopy: 200, fee: 15 },
        { id: 'btc-maxi', name: 'BTC Maximalist', pnl30d: 28.4, winRate: 78, followers: 22000, aum: 100000000, minCopy: 1000, fee: 8 },
        { id: 'arb-hunter', name: 'Arb Hunter', pnl30d: 35.6, winRate: 92, followers: 4200, aum: 5000000, minCopy: 100, fee: 25 }
    ],
    copies: [],
    init() { this.load(); console.log('Copy Trading initialized'); },
    load() { const s = localStorage.getItem('obelisk_copytrading'); if (s) this.copies = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_copytrading', JSON.stringify(this.copies)); },
    startCopy(traderId, amount) {
        const trader = this.traders.find(t => t.id === traderId);
        if (!trader) return { success: false, error: 'Trader not found' };
        if (amount < trader.minCopy) return { success: false, error: 'Min: $' + trader.minCopy };
        const copy = { id: 'copy-' + Date.now(), traderId, traderName: trader.name, amount, startDate: Date.now(), pnl: 0 };
        this.copies.push(copy);
        this.save();
        return { success: true, copy };
    },
    stopCopy(copyId) {
        const idx = this.copies.findIndex(c => c.id === copyId);
        if (idx === -1) return { success: false };
        const copy = this.copies[idx];
        this.copies.splice(idx, 1);
        this.save();
        return { success: true, amount: copy.amount, pnl: copy.pnl };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Copy Trading</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.traders.map(t => 
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + t.name + '</strong><br>30d PnL: <span class="' + (t.pnl30d > 0 ? 'green' : 'red') + '">+' + t.pnl30d + '%</span><br>Win Rate: ' + t.winRate + '%<br>Followers: ' + t.followers.toLocaleString() + '<br>Fee: ' + t.fee + '%<br><button onclick="CopyTradingModule.quickCopy(\'' + t.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Copy</button></div>'
        ).join('') + '</div>';
    },
    quickCopy(traderId) {
        const trader = this.traders.find(t => t.id === traderId);
        const amount = parseFloat(prompt('Amount to allocate (min $' + trader.minCopy + '):'));
        if (amount) { const r = this.startCopy(traderId, amount); alert(r.success ? 'Now copying ' + trader.name + '!' : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => CopyTradingModule.init());
