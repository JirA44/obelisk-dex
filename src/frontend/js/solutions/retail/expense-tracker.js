/* ============================================
   EXPENSE TRACKER - Retail Module
   Track spending by category with donut chart
   ============================================ */

const ExpenseTracker = {
    expenses: [],
    categories: [
        { id: 'trading', name: 'Trading Fees', color: '#00ff88' },
        { id: 'gas', name: 'Gas Fees', color: '#627eea' },
        { id: 'subscription', name: 'Subscriptions', color: '#00d4ff' },
        { id: 'transfer', name: 'Transfers', color: '#c9a227' },
        { id: 'other', name: 'Other', color: '#888' }
    ],

    init() {
        this.load();
    },

    load() {
        try { this.expenses = JSON.parse(localStorage.getItem('obelisk_expenses') || '[]'); }
        catch (e) { this.expenses = []; }
    },

    save() {
        localStorage.setItem('obelisk_expenses', JSON.stringify(this.expenses));
    },

    addExpense(category, amount, note) {
        this.expenses.push({
            id: Date.now().toString(36),
            category: category,
            amount: parseFloat(amount),
            note: note || '',
            date: new Date().toISOString()
        });
        this.save();
    },

    removeExpense(id) {
        this.expenses = this.expenses.filter(function(e) { return e.id !== id; });
        this.save();
    },

    getTotalsByCategory() {
        var totals = {};
        var self = this;
        this.categories.forEach(function(cat) { totals[cat.id] = 0; });
        this.expenses.forEach(function(e) { totals[e.category] = (totals[e.category] || 0) + e.amount; });
        return totals;
    },

    renderDonutSVG(totals) {
        var total = 0;
        var self = this;
        this.categories.forEach(function(cat) { total += totals[cat.id] || 0; });
        if (total === 0) return '<div class="sol-empty"><div class="sol-empty-icon">📊</div><div class="sol-empty-text">No expenses to chart</div></div>';

        var size = 160, cx = 80, cy = 80, r = 55;
        var circumference = 2 * Math.PI * r;
        var offset = 0;
        var segments = '';
        this.categories.forEach(function(cat) {
            var val = totals[cat.id] || 0;
            if (val === 0) return;
            var pct = val / total;
            var dashLen = pct * circumference;
            segments += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + cat.color + '" stroke-width="20" ' +
                'stroke-dasharray="' + dashLen + ' ' + (circumference - dashLen) + '" stroke-dashoffset="' + (-offset) + '" ' +
                'transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
            offset += dashLen;
        });

        var legend = '<div class="sol-donut-legend">';
        this.categories.forEach(function(cat) {
            var val = totals[cat.id] || 0;
            if (val === 0) return;
            legend += '<div class="sol-donut-legend-item"><div class="sol-donut-legend-dot" style="background:' + cat.color + '"></div>' +
                cat.name + ': $' + val.toFixed(2) + ' (' + ((val / total) * 100).toFixed(0) + '%)</div>';
        });
        legend += '</div>';

        return '<div class="sol-donut-container"><svg width="' + size + '" height="' + size + '">' + segments +
            '<text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" fill="#fff" font-size="18" font-weight="700" font-family="JetBrains Mono,monospace">$' + total.toFixed(0) + '</text></svg>' + legend + '</div>';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var totals = this.getTotalsByCategory();
        var total = 0;
        this.categories.forEach(function(cat) { total += totals[cat.id] || 0; });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">$' + total.toFixed(2) + '</div><div class="sol-stat-label">Total Expenses</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.expenses.length + '</div><div class="sol-stat-label">Transactions</div></div>' +
            '</div>';

        // Donut
        html += '<div class="sol-section"><div class="sol-section-title">📊 By Category</div>' + this.renderDonutSVG(totals) + '</div>';

        // Add expense form
        html += '<div class="sol-section"><div class="sol-section-title">➕ Add Expense</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Category</label>' +
            '<select class="sol-select sol-input" id="exp-cat">' +
            this.categories.map(function(cat) { return '<option value="' + cat.id + '">' + cat.name + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Amount ($)</label><input type="number" class="sol-input" id="exp-amount" step="any" placeholder="0.00"></div></div>' +
            '<div class="sol-form-group"><label class="sol-label">Note (optional)</label><input class="sol-input" id="exp-note" placeholder="Description"></div>' +
            '<button class="sol-btn sol-btn-primary" id="exp-add">Add Expense</button></div>';

        // Recent expenses
        html += '<div class="sol-section"><div class="sol-section-title">📜 Recent</div>';
        if (this.expenses.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No expenses recorded</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th><th></th></tr></thead><tbody>';
            var self = this;
            this.expenses.slice().reverse().slice(0, 20).forEach(function(e) {
                var cat = self.categories.find(function(c_) { return c_.id === e.category; });
                html += '<tr><td style="color:#666;font-size:12px">' + new Date(e.date).toLocaleDateString() + '</td>' +
                    '<td><span style="color:' + (cat ? cat.color : '#888') + '">' + (cat ? cat.name : e.category) + '</span></td>' +
                    '<td style="font-family:monospace;color:#ff4466">-$' + e.amount.toFixed(2) + '</td>' +
                    '<td style="color:#888">' + (e.note || '-') + '</td>' +
                    '<td><button class="sol-btn sol-btn-sm sol-btn-danger exp-del" data-id="' + e.id + '">X</button></td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        c.innerHTML = html;
        this.bindEvents(c);
    },

    bindEvents(container) {
        var self = this;
        var addBtn = container.querySelector('#exp-add');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                var cat = document.getElementById('exp-cat').value;
                var amount = document.getElementById('exp-amount').value;
                var note = document.getElementById('exp-note').value;
                if (!amount || parseFloat(amount) <= 0) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Enter an amount'); return; }
                self.addExpense(cat, amount, note);
                self.render('solution-body');
            });
        }
        container.querySelectorAll('.exp-del').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.removeExpense(this.dataset.id);
                self.render('solution-body');
            });
        });
    }
};

SolutionsHub.registerSolution('expense-tracker', ExpenseTracker, 'retail', {
    icon: '💸', name: 'Expense Tracker', description: 'Track your crypto expenses by category with visual breakdowns'
});
