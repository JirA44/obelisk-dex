/* ============================================
   ACCOUNTING EXPORT - Business Module
   Export transactions in QuickBooks/Xero CSV format
   ============================================ */

const AccountingExport = {
    init() {},

    getTransactions() {
        // Aggregate from multiple sources
        var txs = [];
        try {
            var trades = JSON.parse(localStorage.getItem('obelisk_trade_history') || '[]');
            trades.forEach(function(t) {
                txs.push({ date: t.date || t.timestamp, type: 'Trade', desc: (t.side || 'buy') + ' ' + (t.pair || t.asset || ''), amount: t.total || t.amount || 0, fee: t.fee || 0, category: 'Trading' });
            });
        } catch (e) {}

        try {
            var expenses = JSON.parse(localStorage.getItem('obelisk_expenses') || '[]');
            expenses.forEach(function(e) {
                txs.push({ date: e.date, type: 'Expense', desc: e.note || e.category, amount: -e.amount, fee: 0, category: e.category || 'Other' });
            });
        } catch (e) {}

        try {
            var payHistory = JSON.parse(localStorage.getItem('obelisk_payroll_history') || '[]');
            payHistory.forEach(function(p) {
                p.payments.forEach(function(pay) {
                    txs.push({ date: p.date, type: 'Payroll', desc: 'Payment to ' + pay.name, amount: -pay.amount, fee: 0, category: 'Payroll' });
                });
            });
        } catch (e) {}

        // Add demo data if empty
        if (txs.length === 0) {
            txs = [
                { date: '2026-02-01', type: 'Trade', desc: 'Buy 0.5 BTC', amount: 48750, fee: 12.50, category: 'Trading' },
                { date: '2026-02-02', type: 'Trade', desc: 'Sell 2 ETH', amount: -6800, fee: 8.00, category: 'Trading' },
                { date: '2026-02-03', type: 'Expense', desc: 'Gas fees', amount: -15.40, fee: 0, category: 'Gas Fees' },
                { date: '2026-02-05', type: 'Payroll', desc: 'Payment to Alice', amount: -5000, fee: 0, category: 'Payroll' },
                { date: '2026-02-06', type: 'Deposit', desc: 'USDC deposit', amount: 10000, fee: 0, category: 'Deposit' }
            ];
        }

        return txs.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    },

    exportCSV(format) {
        var txs = this.getTransactions();
        var csv = '';

        if (format === 'quickbooks') {
            csv = 'Date,Transaction Type,Description,Amount,Fee,Category,Account\n';
            txs.forEach(function(t) {
                csv += [
                    new Date(t.date).toLocaleDateString('en-US'),
                    t.type,
                    '"' + (t.desc || '').replace(/"/g, '""') + '"',
                    t.amount.toFixed(2),
                    (t.fee || 0).toFixed(2),
                    t.category || '',
                    'Crypto Wallet'
                ].join(',') + '\n';
            });
        } else {
            // Xero format
            csv = '*Date,*Amount,Description,Reference,Account Code,Tax Type\n';
            txs.forEach(function(t) {
                csv += [
                    new Date(t.date).toLocaleDateString('en-GB'),
                    t.amount.toFixed(2),
                    '"' + (t.desc || '').replace(/"/g, '""') + '"',
                    t.type,
                    '200',
                    'TAX001'
                ].join(',') + '\n';
            });
        }

        var blob = new Blob([csv], { type: 'text/csv' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'obelisk_' + format + '_export_' + new Date().toISOString().split('T')[0] + '.csv';
        a.click();
        if (typeof ObeliskToast !== 'undefined') ObeliskToast.success(format + ' CSV exported');
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var txs = this.getTransactions();
        var totalIn = 0, totalOut = 0, totalFees = 0;
        txs.forEach(function(t) {
            if (t.amount >= 0) totalIn += t.amount;
            else totalOut += Math.abs(t.amount);
            totalFees += (t.fee || 0);
        });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + totalIn.toLocaleString(undefined, {maximumFractionDigits:2}) + '</div><div class="sol-stat-label">Total Inflow</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">$' + totalOut.toLocaleString(undefined, {maximumFractionDigits:2}) + '</div><div class="sol-stat-label">Total Outflow</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + txs.length + '</div><div class="sol-stat-label">Transactions</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value gold">$' + totalFees.toLocaleString(undefined, {maximumFractionDigits:2}) + '</div><div class="sol-stat-label">Total Fees</div></div>' +
            '</div>';

        // Export buttons
        html += '<div class="sol-section"><div class="sol-section-title">📤 Export Options</div>' +
            '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
            '<button class="sol-btn sol-btn-primary" id="export-quickbooks" style="padding:12px 24px">' +
            '<span style="font-size:18px;margin-right:8px">📗</span>QuickBooks CSV</button>' +
            '<button class="sol-btn sol-btn-cyan" id="export-xero" style="padding:12px 24px">' +
            '<span style="font-size:18px;margin-right:8px">📘</span>Xero CSV</button>' +
            '</div></div>';

        // Transaction preview
        html += '<div class="sol-section"><div class="sol-section-title">📋 Transaction Preview (' + txs.length + ')</div>' +
            '<table class="sol-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Fee</th><th>Category</th></tr></thead><tbody>';
        txs.slice(0, 30).forEach(function(t) {
            var amtColor = t.amount >= 0 ? '#00ff88' : '#ff4466';
            html += '<tr><td style="color:#888">' + new Date(t.date).toLocaleDateString() + '</td>' +
                '<td><span class="sol-tag sol-tag-gray">' + t.type + '</span></td>' +
                '<td style="font-size:13px">' + t.desc + '</td>' +
                '<td style="font-family:monospace;color:' + amtColor + '">' + (t.amount >= 0 ? '+' : '') + '$' + t.amount.toFixed(2) + '</td>' +
                '<td style="font-family:monospace;color:#666">$' + (t.fee || 0).toFixed(2) + '</td>' +
                '<td style="color:#888">' + (t.category || '-') + '</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
        this.bindEvents(c);
    },

    bindEvents(container) {
        var self = this;
        var qbBtn = container.querySelector('#export-quickbooks');
        if (qbBtn) qbBtn.addEventListener('click', function() { self.exportCSV('quickbooks'); });
        var xeroBtn = container.querySelector('#export-xero');
        if (xeroBtn) xeroBtn.addEventListener('click', function() { self.exportCSV('xero'); });
    }
};

SolutionsHub.registerSolution('accounting-export', AccountingExport, 'business', {
    icon: '📤', name: 'Accounting Export', description: 'Export transactions in QuickBooks or Xero format for your accountant'
});
