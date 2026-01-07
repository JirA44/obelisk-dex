/**
 * LENDING/BORROWING MODULE
 */
const LendingModule = {
    markets: [
        { id: 'usdc-lend', asset: 'USDC', supplyAPY: 8, borrowAPY: 12, ltv: 80, available: 50000000 },
        { id: 'eth-lend', asset: 'ETH', supplyAPY: 3, borrowAPY: 5, ltv: 75, available: 20000 },
        { id: 'btc-lend', asset: 'WBTC', supplyAPY: 2, borrowAPY: 4, ltv: 70, available: 500 },
        { id: 'dai-lend', asset: 'DAI', supplyAPY: 7, borrowAPY: 10, ltv: 80, available: 30000000 },
        { id: 'sol-lend', asset: 'SOL', supplyAPY: 5, borrowAPY: 8, ltv: 65, available: 100000 },
        { id: 'arb-lend', asset: 'ARB', supplyAPY: 10, borrowAPY: 15, ltv: 60, available: 5000000 }
    ],
    supplies: [],
    borrows: [],
    init() { this.load(); console.log('Lending Module initialized'); },
    load() { 
        this.supplies = SafeOps.getStorage('obelisk_lending_supply', []);
        const b = localStorage.getItem('obelisk_lending_borrow'); if (b) this.borrows = JSON.parse(b);
    },
    save() { 
        SafeOps.setStorage('obelisk_lending_supply', this.supplies);
        SafeOps.setStorage('obelisk_lending_borrow', this.borrows);
    },
    supply(marketId, amount) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market || amount < 10) return { success: false, error: 'Min $10' };
        const sup = { id: 'sup-' + Date.now(), marketId, amount, startDate: Date.now(), apy: market.supplyAPY };
        this.supplies.push(sup);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(sup.id, market.asset + ' Supply', amount, market.supplyAPY, 'lending', true);
        return { success: true, supply: sup };
    },
    borrow(marketId, amount, collateralAmount) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market) return { success: false, error: 'Market not found' };
        const maxBorrow = collateralAmount * (market.ltv / 100);
        if (amount > maxBorrow) return { success: false, error: 'Max borrow: $' + maxBorrow.toFixed(2) };
        const loan = { id: 'brw-' + Date.now(), marketId, amount, collateral: collateralAmount, startDate: Date.now(), apy: market.borrowAPY };
        this.borrows.push(loan);
        this.save();
        return { success: true, loan };
    },
    repay(loanId, amount) {
        const idx = this.borrows.findIndex(b => b.id === loanId);
        if (idx === -1) return { success: false };
        const loan = this.borrows[idx];
        const days = (Date.now() - loan.startDate) / 86400000;
        const interest = loan.amount * (loan.apy / 100) * (days / 365);
        const totalOwed = loan.amount + interest;
        if (amount >= totalOwed) {
            this.borrows.splice(idx, 1);
            this.save();
            return { success: true, collateralReturned: loan.collateral };
        }
        loan.amount -= (amount - interest);
        this.save();
        return { success: true, remaining: loan.amount };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Lending Markets</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.markets.map(m => 
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + m.asset + '</strong><br>Supply: ' + m.supplyAPY + '% APY<br>Borrow: ' + m.borrowAPY + '% APY<br>LTV: ' + m.ltv + '%<br><button onclick="LendingModule.quickSupply(\'' + m.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Supply</button> <button onclick="LendingModule.quickBorrow(\'' + m.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Borrow</button></div>'
        ).join('') + '</div>';
    },
    quickSupply(marketId) {
        const amount = parseFloat(prompt('Amount to supply (min $10):'));
        if (amount !== null && amount > 0) { const r = this.supply(marketId, amount); alert(r.success ? 'Supplied!' : r.error); }
    },
    quickBorrow(marketId) {
        const collateral = SafeOps.promptNumber('Collateral amount USD:');
        const amount = SafeOps.promptNumber('Amount to borrow:');
        if (collateral && amount) { const r = this.borrow(marketId, amount, collateral); alert(r.success ? 'Borrowed!' : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => LendingModule.init());
