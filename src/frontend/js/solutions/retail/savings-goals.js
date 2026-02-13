/* ============================================
   SAVINGS GOALS - Retail Module
   Visual savings targets with progress bars and projections
   ============================================ */

const SavingsGoals = {
    goals: [],

    init() {
        this.load();
    },

    load() {
        try {
            this.goals = JSON.parse(localStorage.getItem('obelisk_savings_goals') || '[]');
        } catch (e) { this.goals = []; }
    },

    save() {
        localStorage.setItem('obelisk_savings_goals', JSON.stringify(this.goals));
    },

    getPrices() {
        if (typeof ObeliskApp !== 'undefined' && ObeliskApp.state && ObeliskApp.state.prices) return ObeliskApp.state.prices;
        return { BTC: 97500, ETH: 3400, SOL: 190 };
    },

    addGoal(asset, targetAmount, deadline) {
        this.goals.push({
            id: Date.now().toString(36),
            asset: asset.toUpperCase(),
            targetAmount: parseFloat(targetAmount),
            currentAmount: 0,
            deadline: deadline,
            deposits: [],
            created: new Date().toISOString(),
            completed: false
        });
        this.save();
    },

    deposit(goalId, amount) {
        var goal = this.goals.find(function(g) { return g.id === goalId; });
        if (!goal) return;
        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) return;
        goal.currentAmount += amount;
        goal.deposits.push({ amount: amount, date: new Date().toISOString() });
        if (goal.currentAmount >= goal.targetAmount) {
            goal.completed = true;
            this.celebrate();
        }
        this.save();
    },

    removeGoal(id) {
        this.goals = this.goals.filter(function(g) { return g.id !== id; });
        this.save();
    },

    getProjection(goal) {
        if (goal.deposits.length < 2) return null;
        var totalDeposited = goal.deposits.reduce(function(s, d) { return s + d.amount; }, 0);
        var firstDate = new Date(goal.deposits[0].date);
        var lastDate = new Date(goal.deposits[goal.deposits.length - 1].date);
        var daysDiff = Math.max((lastDate - firstDate) / (1000 * 60 * 60 * 24), 1);
        var ratePerDay = totalDeposited / daysDiff;
        var remaining = goal.targetAmount - goal.currentAmount;
        if (ratePerDay <= 0) return null;
        var daysToComplete = remaining / ratePerDay;
        var projectedDate = new Date();
        projectedDate.setDate(projectedDate.getDate() + Math.ceil(daysToComplete));
        return projectedDate;
    },

    celebrate() {
        if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Goal reached! Congratulations!');
        // Confetti
        var colors = ['#00ff88', '#00d4ff', '#c9a227', '#ff4466', '#fff'];
        for (var i = 0; i < 40; i++) {
            var conf = document.createElement('div');
            conf.className = 'sol-confetti';
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.background = colors[Math.floor(Math.random() * colors.length)];
            conf.style.animationDelay = (Math.random() * 2) + 's';
            conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            document.body.appendChild(conf);
            setTimeout(function() { conf.remove(); }, 5000);
        }
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var prices = this.getPrices();
        var assets = Object.keys(prices);

        var html = '<div class="sol-section"><div class="sol-section-title">🎯 Create Savings Goal</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Asset</label>' +
            '<select class="sol-select sol-input" id="goal-asset">' +
            assets.map(function(a) { return '<option value="' + a + '">' + a + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Target Amount</label>' +
            '<input type="number" class="sol-input" id="goal-amount" placeholder="e.g. 1.0" step="any"></div>' +
            '</div>' +
            '<div class="sol-form-group"><label class="sol-label">Deadline</label>' +
            '<input type="date" class="sol-input" id="goal-deadline" style="color-scheme:dark"></div>' +
            '<button class="sol-btn sol-btn-primary" id="goal-add">Create Goal</button></div>';

        // Active goals
        var active = this.goals.filter(function(g) { return !g.completed; });
        var completed = this.goals.filter(function(g) { return g.completed; });

        html += '<div class="sol-section"><div class="sol-section-title">📈 Active Goals (' + active.length + ')</div>';
        if (active.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-icon">🎯</div><div class="sol-empty-text">No active goals. Create one above!</div></div>';
        } else {
            active.forEach(function(g) {
                var pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                var priceUsd = prices[g.asset] || 0;
                var valueUsd = g.currentAmount * priceUsd;
                var targetUsd = g.targetAmount * priceUsd;
                var projection = SavingsGoals.getProjection(g);
                var projText = projection ? 'Estimated completion: ' + projection.toLocaleDateString() : 'Add more deposits to see projection';
                var deadlineText = g.deadline ? 'Deadline: ' + new Date(g.deadline).toLocaleDateString() : '';

                html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:12px">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
                    '<div><strong style="color:#fff;font-size:16px">' + g.targetAmount + ' ' + g.asset + '</strong>' +
                    '<span style="color:#666;font-size:12px;margin-left:8px">($' + targetUsd.toLocaleString(undefined, {maximumFractionDigits:0}) + ')</span></div>' +
                    '<button class="sol-btn sol-btn-sm sol-btn-danger goal-delete" data-id="' + g.id + '">Delete</button>' +
                    '</div>' +
                    '<div class="sol-progress" style="margin-bottom:8px"><div class="sol-progress-fill green" style="width:' + pct + '%"></div></div>' +
                    '<div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:10px">' +
                    '<span>' + g.currentAmount.toFixed(4) + ' / ' + g.targetAmount + ' ' + g.asset + ' (' + pct.toFixed(1) + '%)</span>' +
                    '<span>' + deadlineText + '</span></div>' +
                    '<div style="font-size:11px;color:#555;margin-bottom:10px">' + projText + '</div>' +
                    '<div style="display:flex;gap:8px;align-items:center">' +
                    '<input type="number" class="sol-input goal-deposit-input" data-id="' + g.id + '" placeholder="Amount" step="any" style="max-width:150px">' +
                    '<button class="sol-btn sol-btn-sm sol-btn-primary goal-deposit" data-id="' + g.id + '">Deposit</button></div>' +
                    '</div>';
            });
        }
        html += '</div>';

        // Completed goals
        if (completed.length > 0) {
            html += '<div class="sol-section"><div class="sol-section-title">✅ Completed Goals (' + completed.length + ')</div>';
            completed.forEach(function(g) {
                html += '<div style="padding:12px;border:1px solid #1a3a1a;border-radius:10px;margin-bottom:8px;background:rgba(0,255,136,0.03)">' +
                    '<strong style="color:#00ff88">' + g.targetAmount + ' ' + g.asset + '</strong>' +
                    '<span style="color:#666;font-size:12px;margin-left:8px">Completed!</span>' +
                    '</div>';
            });
            html += '</div>';
        }

        c.innerHTML = html;
        this.bindEvents(c);
    },

    bindEvents(container) {
        var self = this;

        var addBtn = container.querySelector('#goal-add');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                var asset = document.getElementById('goal-asset').value;
                var amount = document.getElementById('goal-amount').value;
                var deadline = document.getElementById('goal-deadline').value;
                if (!amount || parseFloat(amount) <= 0) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Enter a valid amount'); return; }
                self.addGoal(asset, amount, deadline);
                self.render('solution-body');
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Goal created!');
            });
        }

        container.querySelectorAll('.goal-deposit').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.dataset.id;
                var input = container.querySelector('.goal-deposit-input[data-id="' + id + '"]');
                if (!input || !input.value) return;
                self.deposit(id, input.value);
                self.render('solution-body');
            });
        });

        container.querySelectorAll('.goal-delete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.removeGoal(this.dataset.id);
                self.render('solution-body');
            });
        });
    }
};

SolutionsHub.registerSolution('savings-goals', SavingsGoals, 'retail', {
    icon: '🎯', name: 'Savings Goals', description: 'Set savings targets with visual progress tracking and completion projections'
});
