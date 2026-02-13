/* ============================================
   DCA BOT - Automated Dollar Cost Averaging
   Schedule recurring buys on any asset
   ============================================ */

const DCABot = {
    plans: [],
    history: [],

    init() {
        try {
            this.plans = JSON.parse(localStorage.getItem('obelisk_dca_plans') || '[]');
            this.history = JSON.parse(localStorage.getItem('obelisk_dca_history') || '[]');
        } catch(e) { this.plans = []; this.history = []; }
        this.simulateExecutions();
    },

    save() {
        localStorage.setItem('obelisk_dca_plans', JSON.stringify(this.plans));
        localStorage.setItem('obelisk_dca_history', JSON.stringify(this.history));
    },

    getPrices() {
        if (typeof ObeliskApp !== 'undefined' && ObeliskApp.state && ObeliskApp.state.prices) return ObeliskApp.state.prices;
        return { BTC: 97500, ETH: 3400, SOL: 190, AVAX: 35, LINK: 22, ARB: 1.8, AAVE: 280, UNI: 12 };
    },

    createPlan(asset, amount, frequency) {
        var plan = {
            id: 'DCA-' + Date.now().toString(36).toUpperCase(),
            asset: asset,
            amount: parseFloat(amount),
            frequency: frequency,
            active: true,
            totalInvested: 0,
            totalBought: 0,
            avgPrice: 0,
            executions: 0,
            created: new Date().toISOString(),
            nextExecution: this.getNextExecution(frequency)
        };
        this.plans.push(plan);
        this.save();
        return plan;
    },

    getNextExecution(freq) {
        var d = new Date();
        if (freq === 'daily') d.setDate(d.getDate() + 1);
        else if (freq === 'weekly') d.setDate(d.getDate() + 7);
        else if (freq === 'biweekly') d.setDate(d.getDate() + 14);
        else d.setMonth(d.getMonth() + 1);
        return d.toISOString();
    },

    simulateExecutions() {
        var prices = this.getPrices();
        var self = this;
        this.plans.forEach(function(p) {
            if (!p.active) return;
            var now = new Date();
            if (new Date(p.nextExecution) <= now) {
                var price = prices[p.asset] || 100;
                var bought = p.amount / price;
                p.totalInvested += p.amount;
                p.totalBought += bought;
                p.avgPrice = p.totalInvested / p.totalBought;
                p.executions++;
                p.nextExecution = self.getNextExecution(p.frequency);
                self.history.unshift({
                    planId: p.id, asset: p.asset, amount: p.amount,
                    price: price, bought: bought, date: now.toISOString()
                });
            }
        });
        this.save();
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var prices = this.getPrices();
        var assets = Object.keys(prices);
        var activePlans = this.plans.filter(function(p) { return p.active; });
        var totalMonthly = activePlans.reduce(function(s, p) {
            var mult = p.frequency === 'daily' ? 30 : p.frequency === 'weekly' ? 4.3 : p.frequency === 'biweekly' ? 2.15 : 1;
            return s + p.amount * mult;
        }, 0);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + activePlans.length + '</div><div class="sol-stat-label">Active Plans</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">$' + totalMonthly.toFixed(0) + '</div><div class="sol-stat-label">Monthly Investment</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.history.length + '</div><div class="sol-stat-label">Executions</div></div>' +
            '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">➕ New DCA Plan</div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Asset</label>' +
            '<select class="sol-select sol-input" id="dca-asset">' + assets.map(function(a) { return '<option value="' + a + '">' + a + ' ($' + prices[a].toLocaleString() + ')</option>'; }).join('') + '</select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Amount per buy ($)</label><input type="number" class="sol-input" id="dca-amount" placeholder="100" step="any"></div></div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Frequency</label>' +
            '<select class="sol-select sol-input" id="dca-freq"><option value="daily">Daily</option><option value="weekly" selected>Weekly</option><option value="biweekly">Bi-weekly</option><option value="monthly">Monthly</option></select></div>' +
            '<div class="sol-form-group" style="display:flex;align-items:flex-end"><button class="sol-btn sol-btn-primary" id="dca-create" style="width:100%">Create DCA Plan</button></div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📋 Active Plans</div>';
        if (activePlans.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-icon">🤖</div><div class="sol-empty-text">No DCA plans yet. Create one above!</div></div>';
        } else {
            activePlans.forEach(function(p) {
                var currentPrice = prices[p.asset] || 0;
                var currentValue = p.totalBought * currentPrice;
                var pnl = currentValue - p.totalInvested;
                var pnlPct = p.totalInvested > 0 ? (pnl / p.totalInvested) * 100 : 0;
                var pnlColor = pnl >= 0 ? '#00ff88' : '#ff4466';
                html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:12px">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
                    '<div><strong style="color:#fff;font-size:16px">' + p.asset + '</strong> <span class="sol-tag sol-tag-cyan">' + p.frequency + '</span> <span style="color:#888;font-size:12px">$' + p.amount + '/buy</span></div>' +
                    '<button class="sol-btn sol-btn-sm sol-btn-danger dca-stop" data-id="' + p.id + '">Stop</button></div>' +
                    '<div class="sol-stats-row" style="margin-bottom:8px">' +
                    '<div class="sol-stat-card" style="padding:10px"><div class="sol-stat-value" style="font-size:18px">$' + p.totalInvested.toFixed(0) + '</div><div class="sol-stat-label">Invested</div></div>' +
                    '<div class="sol-stat-card" style="padding:10px"><div class="sol-stat-value" style="font-size:18px">' + p.totalBought.toFixed(6) + '</div><div class="sol-stat-label">' + p.asset + ' Bought</div></div>' +
                    '<div class="sol-stat-card" style="padding:10px"><div class="sol-stat-value" style="font-size:18px;color:' + pnlColor + '">' + (pnl >= 0 ? '+' : '') + pnlPct.toFixed(1) + '%</div><div class="sol-stat-label">PnL</div></div>' +
                    '</div><div style="font-size:11px;color:#555">Avg price: $' + (p.avgPrice || 0).toFixed(2) + ' | Executions: ' + p.executions + ' | Next: ' + new Date(p.nextExecution).toLocaleDateString() + '</div></div>';
            });
        }
        html += '</div>';

        if (this.history.length > 0) {
            html += '<div class="sol-section"><div class="sol-section-title">📜 Recent Executions</div>' +
                '<table class="sol-table"><thead><tr><th>Date</th><th>Asset</th><th>Spent</th><th>Price</th><th>Bought</th></tr></thead><tbody>';
            this.history.slice(0, 15).forEach(function(h) {
                html += '<tr><td style="color:#666">' + new Date(h.date).toLocaleDateString() + '</td><td><strong>' + h.asset + '</strong></td>' +
                    '<td style="font-family:monospace">$' + h.amount.toFixed(2) + '</td><td style="font-family:monospace">$' + h.price.toLocaleString() + '</td>' +
                    '<td style="font-family:monospace;color:#00ff88">' + h.bought.toFixed(6) + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }

        c.innerHTML = html;
        var self = this;
        var createBtn = c.querySelector('#dca-create');
        if (createBtn) createBtn.addEventListener('click', function() {
            var asset = document.getElementById('dca-asset').value;
            var amount = document.getElementById('dca-amount').value;
            var freq = document.getElementById('dca-freq').value;
            if (!amount || parseFloat(amount) <= 0) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Enter an amount'); return; }
            self.createPlan(asset, amount, freq);
            if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('DCA plan created!');
            self.render('solution-body');
        });
        c.querySelectorAll('.dca-stop').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var plan = self.plans.find(function(p) { return p.id === btn.dataset.id; });
                if (plan) { plan.active = false; self.save(); self.render('solution-body'); }
            });
        });
    }
};

SolutionsHub.registerSolution('dca-bot', DCABot, 'retail', {
    icon: '🤖', name: 'DCA Bot', description: 'Automate recurring buys — daily, weekly or monthly dollar cost averaging'
});
