/**
 * FIXED INCOME MODULE - Obelisk DEX
 * Fixed-term deposits with guaranteed returns
 */
const FixedIncomeModule = {
    items: [
        { id: 'usdc-30d', name: 'USDC 30-Day Fixed', token: 'USDC', termDays: 30, apy: 8.5, minDeposit: 100, maxDeposit: 1000000, risk: 'low', earlyWithdrawPenalty: 50 },
        { id: 'usdc-60d', name: 'USDC 60-Day Fixed', token: 'USDC', termDays: 60, apy: 10.2, minDeposit: 100, maxDeposit: 1000000, risk: 'low', earlyWithdrawPenalty: 40 },
        { id: 'usdc-90d', name: 'USDC 90-Day Fixed', token: 'USDC', termDays: 90, apy: 12.5, minDeposit: 100, maxDeposit: 1000000, risk: 'low', earlyWithdrawPenalty: 30 },
        { id: 'dai-30d', name: 'DAI 30-Day Fixed', token: 'DAI', termDays: 30, apy: 7.8, minDeposit: 100, maxDeposit: 500000, risk: 'low', earlyWithdrawPenalty: 50 },
        { id: 'dai-60d', name: 'DAI 60-Day Fixed', token: 'DAI', termDays: 60, apy: 9.5, minDeposit: 100, maxDeposit: 500000, risk: 'low', earlyWithdrawPenalty: 40 },
        { id: 'dai-90d', name: 'DAI 90-Day Fixed', token: 'DAI', termDays: 90, apy: 11.8, minDeposit: 100, maxDeposit: 500000, risk: 'low', earlyWithdrawPenalty: 30 },
        { id: 'eth-30d', name: 'ETH 30-Day Fixed', token: 'ETH', termDays: 30, apy: 5.5, minDeposit: 0.05, maxDeposit: 1000, risk: 'medium', earlyWithdrawPenalty: 60 },
        { id: 'eth-90d', name: 'ETH 90-Day Fixed', token: 'ETH', termDays: 90, apy: 8.2, minDeposit: 0.05, maxDeposit: 1000, risk: 'medium', earlyWithdrawPenalty: 40 },
        { id: 'btc-60d', name: 'BTC 60-Day Fixed', token: 'BTC', termDays: 60, apy: 4.5, minDeposit: 0.001, maxDeposit: 100, risk: 'medium', earlyWithdrawPenalty: 50 },
        { id: 'btc-90d', name: 'BTC 90-Day Fixed', token: 'BTC', termDays: 90, apy: 6.0, minDeposit: 0.001, maxDeposit: 100, risk: 'medium', earlyWithdrawPenalty: 40 }
    ],
    positions: [],

    init() {
        this.load();
        console.log('Fixed Income Module initialized');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_fixed_income', []);
    },

    save() {
        SafeOps.setStorage('obelisk_fixed_income', this.positions);
    },

    invest(itemId, amount) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, error: 'Product not found' };
        if (amount < item.minDeposit) return { success: false, error: 'Min deposit: ' + item.minDeposit + ' ' + item.token };
        if (amount > item.maxDeposit) return { success: false, error: 'Max deposit: ' + item.maxDeposit + ' ' + item.token };

        const maturityDate = Date.now() + (item.termDays * 86400000);
        const expectedReturn = amount * (item.apy / 100) * (item.termDays / 365);

        const position = {
            id: 'fixed-' + Date.now(),
            itemId,
            productName: item.name,
            token: item.token,
            amount,
            apy: item.apy,
            termDays: item.termDays,
            startDate: Date.now(),
            maturityDate,
            expectedReturn,
            earlyWithdrawPenalty: item.earlyWithdrawPenalty,
            status: 'active'
        };

        this.positions.push(position);
        this.save();

        if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.invest(position.id, item.name, amount, item.apy, 'fixed-income', false);
        }

        return { success: true, position, expectedReturn: expectedReturn.toFixed(4) };
    },

    withdraw(posId, forceEarly = false) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const pos = this.positions[idx];
        const now = Date.now();
        const isMatured = now >= pos.maturityDate;

        if (!isMatured && !forceEarly) {
            const daysLeft = Math.ceil((pos.maturityDate - now) / 86400000);
            return { success: false, error: 'Not matured. ' + daysLeft + ' days left. Use early withdraw.' };
        }

        let returnAmount, penalty = 0;

        if (isMatured) {
            // Full return with interest
            returnAmount = pos.amount + pos.expectedReturn;
        } else {
            // Early withdrawal with penalty
            const daysHeld = (now - pos.startDate) / 86400000;
            const earnedInterest = pos.amount * (pos.apy / 100) * (daysHeld / 365);
            penalty = earnedInterest * (pos.earlyWithdrawPenalty / 100);
            returnAmount = pos.amount + earnedInterest - penalty;
        }

        this.positions.splice(idx, 1);
        this.save();

        return {
            success: true,
            amount: returnAmount.toFixed(4),
            penalty: penalty.toFixed(4),
            isEarly: !isMatured
        };
    },

    getPositionStatus(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const now = Date.now();
        const daysHeld = (now - pos.startDate) / 86400000;
        const daysRemaining = Math.max(0, Math.ceil((pos.maturityDate - now) / 86400000));
        const progress = Math.min(100, (daysHeld / pos.termDays) * 100);
        const accruedInterest = pos.amount * (pos.apy / 100) * (daysHeld / 365);
        const isMatured = now >= pos.maturityDate;

        return {
            daysHeld: Math.floor(daysHeld),
            daysRemaining,
            progress: progress.toFixed(1),
            accruedInterest: accruedInterest.toFixed(4),
            isMatured,
            currentValue: (pos.amount + accruedInterest).toFixed(4)
        };
    },

    getTotalDeposited() {
        return this.positions.reduce((sum, p) => sum + p.amount, 0);
    },

    getTotalExpectedReturns() {
        return this.positions.reduce((sum, p) => sum + p.expectedReturn, 0);
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const groupedByTerm = {};
        this.items.forEach(item => {
            const key = item.termDays + '-day';
            if (!groupedByTerm[key]) groupedByTerm[key] = [];
            groupedByTerm[key].push(item);
        });

        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Fixed Income Products</h3>' +
            Object.entries(groupedByTerm).map(([term, items]) =>
                '<h4 style="color:#888;margin:16px 0 8px;">' + term.toUpperCase() + ' TERMS</h4>' +
                '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' +
                items.map(item =>
                    '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">' +
                    '<strong>' + item.name + '</strong><br>' +
                    '<span style="color:#00ff88;font-size:20px;">' + item.apy + '% APY</span><br>' +
                    '<span style="color:#888;">Term:</span> ' + item.termDays + ' days<br>' +
                    '<span style="color:#888;">Min:</span> ' + item.minDeposit + ' ' + item.token + '<br>' +
                    '<span style="color:#888;">Early Penalty:</span> ' + item.earlyWithdrawPenalty + '%<br>' +
                    '<button onclick="FixedIncomeModule.quickInvest(\'' + item.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;width:100%;">Deposit</button>' +
                    '</div>'
                ).join('') +
                '</div>'
            ).join('') +
            (this.positions.length > 0 ? this.renderPositions() : '');
    },

    renderPositions() {
        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Your Fixed Deposits (' + this.positions.length + ')</h4>' +
            '<div style="display:grid;gap:8px;">' +
            this.positions.map(pos => {
                const status = this.getPositionStatus(pos.id);
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<div><strong>' + pos.productName + '</strong><br>' +
                    '<span style="color:#888;font-size:12px;">Deposited: ' + pos.amount + ' ' + pos.token + ' | APY: ' + pos.apy + '%</span></div>' +
                    '<div style="text-align:right;">' +
                    '<span style="color:' + (status.isMatured ? '#00ff88' : '#ffaa00') + ';">' + (status.isMatured ? 'MATURED' : status.daysRemaining + ' days left') + '</span><br>' +
                    '<span style="color:#888;font-size:12px;">Accrued: ' + status.accruedInterest + ' ' + pos.token + '</span></div>' +
                    '</div>' +
                    '<div style="margin-top:8px;background:rgba(255,255,255,0.1);border-radius:4px;height:6px;">' +
                    '<div style="background:#00ff88;height:100%;border-radius:4px;width:' + status.progress + '%;"></div></div>' +
                    '<div style="margin-top:8px;display:flex;gap:8px;">' +
                    (status.isMatured ?
                        '<button onclick="FixedIncomeModule.quickWithdraw(\'' + pos.id + '\')" style="flex:1;padding:6px 12px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;">Withdraw + Interest</button>' :
                        '<button onclick="FixedIncomeModule.quickEarlyWithdraw(\'' + pos.id + '\')" style="flex:1;padding:6px 12px;background:#ff8800;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;">Early Withdraw (' + pos.earlyWithdrawPenalty + '% penalty)</button>'
                    ) +
                    '</div></div>';
            }).join('') +
            '</div>';
    },

    quickInvest(itemId) {
        const item = this.items.find(i => i.id === itemId);
        const amount = SafeOps.promptNumber('Amount to deposit (' + item.minDeposit + '-' + item.maxDeposit + ' ' + item.token + '):', 0, item.minDeposit, item.maxDeposit);
        if (!amount) return;

        const result = this.invest(itemId, amount);
        alert(result.success ? 'Deposited! Expected return: ' + result.expectedReturn + ' ' + item.token : result.error);
        if (result.success) this.render('fixed-income-container');
    },

    quickWithdraw(posId) {
        const result = this.withdraw(posId);
        alert(result.success ? 'Withdrawn: ' + result.amount : result.error);
        this.render('fixed-income-container');
    },

    quickEarlyWithdraw(posId) {
        if (!confirm('Early withdrawal will incur a penalty. Continue?')) return;
        const result = this.withdraw(posId, true);
        alert(result.success ? 'Withdrawn: ' + result.amount + ' (Penalty: ' + result.penalty + ')' : result.error);
        this.render('fixed-income-container');
    }
};

document.addEventListener('DOMContentLoaded', () => FixedIncomeModule.init());
