/* ============================================
   PAYROLL UI - Business Module
   Interface for crypto payroll (wraps CryptoPayroll if available)
   ============================================ */

const PayrollUI = {
    employees: [],
    payHistory: [],

    init() {
        this.load();
    },

    load() {
        try {
            this.employees = JSON.parse(localStorage.getItem('obelisk_payroll_employees') || '[]');
            this.payHistory = JSON.parse(localStorage.getItem('obelisk_payroll_history') || '[]');
        } catch (e) { this.employees = []; this.payHistory = []; }
    },

    save() {
        localStorage.setItem('obelisk_payroll_employees', JSON.stringify(this.employees));
        localStorage.setItem('obelisk_payroll_history', JSON.stringify(this.payHistory));
    },

    addEmployee(data) {
        this.employees.push({
            id: Date.now().toString(36),
            name: data.name,
            wallet: data.wallet,
            salary: parseFloat(data.salary),
            currency: data.currency || 'USDC',
            frequency: data.frequency || 'monthly',
            active: true
        });
        this.save();
    },

    removeEmployee(id) {
        this.employees = this.employees.filter(function(e) { return e.id !== id; });
        this.save();
    },

    runPayroll() {
        var self = this;
        var active = this.employees.filter(function(e) { return e.active; });
        var total = active.reduce(function(s, e) { return s + e.salary; }, 0);
        var batch = {
            id: 'PAY-' + Date.now().toString(36).toUpperCase(),
            date: new Date().toISOString(),
            payments: active.map(function(e) {
                return { name: e.name, wallet: e.wallet, amount: e.salary, currency: e.currency, status: 'sent' };
            }),
            total: total,
            status: 'completed'
        };
        this.payHistory.unshift(batch);
        this.save();
        return batch;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var activeCount = this.employees.filter(function(e) { return e.active; }).length;
        var monthlyTotal = this.employees.filter(function(e) { return e.active; }).reduce(function(s, e) { return s + e.salary; }, 0);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + activeCount + '</div><div class="sol-stat-label">Employees</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + monthlyTotal.toLocaleString() + '</div><div class="sol-stat-label">Monthly Payroll</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.payHistory.length + '</div><div class="sol-stat-label">Payments Made</div></div>' +
            '</div>';

        // Add employee
        html += '<div class="sol-section"><div class="sol-section-title">➕ Add Employee</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Name</label><input class="sol-input" id="pay-name" placeholder="Employee name"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Wallet</label><input class="sol-input" id="pay-wallet" placeholder="0x..."></div></div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Salary ($)</label><input type="number" class="sol-input" id="pay-salary" step="any" placeholder="5000"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Currency</label>' +
            '<select class="sol-select sol-input" id="pay-currency"><option>USDC</option><option>USDT</option><option>ETH</option><option>DAI</option></select></div></div>' +
            '<button class="sol-btn sol-btn-cyan" id="pay-add">Add Employee</button></div>';

        // Employee list
        html += '<div class="sol-section"><div class="sol-section-title">👥 Employees</div>';
        if (this.employees.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No employees added yet</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Name</th><th>Wallet</th><th>Salary</th><th>Currency</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            this.employees.forEach(function(e) {
                html += '<tr><td><strong>' + e.name + '</strong></td>' +
                    '<td style="font-family:monospace;font-size:11px">' + e.wallet + '</td>' +
                    '<td style="font-family:monospace;color:#00ff88">$' + e.salary.toLocaleString() + '</td>' +
                    '<td>' + e.currency + '</td>' +
                    '<td><span class="sol-tag ' + (e.active ? 'sol-tag-green' : 'sol-tag-gray') + '">' + (e.active ? 'Active' : 'Inactive') + '</span></td>' +
                    '<td><button class="sol-btn sol-btn-sm sol-btn-danger pay-remove" data-id="' + e.id + '">Remove</button></td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        // Run payroll button
        if (activeCount > 0) {
            html += '<div style="text-align:center;margin:20px 0">' +
                '<button class="sol-btn sol-btn-primary" id="pay-run" style="padding:12px 40px;font-size:15px">Run Payroll ($' + monthlyTotal.toLocaleString() + ')</button></div>';
        }

        // Payment history
        html += '<div class="sol-section"><div class="sol-section-title">📜 Payment History</div>';
        if (this.payHistory.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No payments yet</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Batch ID</th><th>Date</th><th>Employees</th><th>Total</th><th>Status</th></tr></thead><tbody>';
            this.payHistory.slice(0, 10).forEach(function(p) {
                html += '<tr><td style="font-family:monospace;font-size:12px">' + p.id + '</td>' +
                    '<td style="color:#888">' + new Date(p.date).toLocaleDateString() + '</td>' +
                    '<td>' + p.payments.length + '</td>' +
                    '<td style="font-family:monospace;color:#00ff88">$' + p.total.toLocaleString() + '</td>' +
                    '<td><span class="sol-tag sol-tag-green">' + p.status + '</span></td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        c.innerHTML = html;
        this.bindEvents(c);
    },

    bindEvents(container) {
        var self = this;

        var addBtn = container.querySelector('#pay-add');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                var name = document.getElementById('pay-name').value.trim();
                var wallet = document.getElementById('pay-wallet').value.trim();
                var salary = document.getElementById('pay-salary').value;
                var currency = document.getElementById('pay-currency').value;
                if (!name || !wallet || !salary) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Fill in all fields'); return; }
                self.addEmployee({ name: name, wallet: wallet, salary: salary, currency: currency });
                self.render('solution-body');
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Employee added');
            });
        }

        container.querySelectorAll('.pay-remove').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (!confirm('Remove this employee?')) return;
                self.removeEmployee(this.dataset.id);
                self.render('solution-body');
            });
        });

        var runBtn = container.querySelector('#pay-run');
        if (runBtn) {
            runBtn.addEventListener('click', function() {
                if (!confirm('Execute payroll for all active employees?')) return;
                var batch = self.runPayroll();
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Payroll ' + batch.id + ' executed! $' + batch.total.toLocaleString() + ' sent');
                self.render('solution-body');
            });
        }
    }
};

SolutionsHub.registerSolution('payroll-ui', PayrollUI, 'business', {
    icon: '💳', name: 'Crypto Payroll', description: 'Pay your team in crypto - manage employees, salaries and batch payments'
});
