/* ============================================
   CLIENT PORTAL - White-label client management
   ============================================ */

const ClientPortal = {
    clients: [],

    init() {
        try { this.clients = JSON.parse(localStorage.getItem('obelisk_clients') || '[]'); } catch(e) { this.clients = []; }
        if (this.clients.length === 0) {
            this.clients = [
                { id: 'c1', name: 'Acme Corp', email: 'finance@acme.co', wallet: '0xAbc...123', aum: 250000, pnl30d: 8.5, status: 'active', plan: 'Premium', joined: '2025-06-15', lastActive: '2h ago' },
                { id: 'c2', name: 'BlockVentures', email: 'ops@blockv.io', wallet: '0xDef...456', aum: 120000, pnl30d: -2.1, status: 'active', plan: 'Standard', joined: '2025-09-01', lastActive: '1d ago' },
                { id: 'c3', name: 'CryptoFund Alpha', email: 'admin@cfalpha.com', wallet: '0x789...abc', aum: 890000, pnl30d: 12.3, status: 'active', plan: 'Enterprise', joined: '2025-03-20', lastActive: '15m ago' },
                { id: 'c4', name: 'DeFi Labs', email: 'team@defilabs.xyz', wallet: '0xFed...987', aum: 45000, pnl30d: 5.7, status: 'onboarding', plan: 'Standard', joined: '2026-01-10', lastActive: '3d ago' },
                { id: 'c5', name: 'Nexus Capital', email: 'treasury@nexus.vc', wallet: '0xCba...654', aum: 1500000, pnl30d: 15.8, status: 'active', plan: 'Enterprise', joined: '2024-11-05', lastActive: '30m ago' }
            ];
        }
    },

    save() { localStorage.setItem('obelisk_clients', JSON.stringify(this.clients)); },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var totalAum = this.clients.reduce(function(s, cl) { return s + cl.aum; }, 0);
        var activeCount = this.clients.filter(function(cl) { return cl.status === 'active'; }).length;
        var avgPnl = this.clients.reduce(function(s, cl) { return s + cl.pnl30d; }, 0) / this.clients.length;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + (totalAum / 1000000).toFixed(2) + 'M</div><div class="sol-stat-label">Total AUM</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + this.clients.length + '</div><div class="sol-stat-label">Total Clients</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + activeCount + '</div><div class="sol-stat-label">Active</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (avgPnl >= 0 ? 'green' : 'red') + '">' + (avgPnl >= 0 ? '+' : '') + avgPnl.toFixed(1) + '%</div><div class="sol-stat-label">Avg 30d PnL</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">👥 Client Directory</div>' +
            '<table class="sol-table"><thead><tr><th>Client</th><th>Plan</th><th>AUM</th><th>30d PnL</th><th>Status</th><th>Last Active</th><th>Actions</th></tr></thead><tbody>';
        this.clients.sort(function(a, b) { return b.aum - a.aum; });
        this.clients.forEach(function(cl) {
            var pnlColor = cl.pnl30d >= 0 ? '#00ff88' : '#ff4466';
            var statusTag = cl.status === 'active' ? 'sol-tag-green' : 'sol-tag-yellow';
            var planColor = cl.plan === 'Enterprise' ? '#c9a227' : cl.plan === 'Premium' ? '#00d4ff' : '#888';
            html += '<tr><td><strong style="color:#fff">' + cl.name + '</strong><div style="font-size:10px;color:#555">' + cl.email + '</div></td>' +
                '<td><span style="color:' + planColor + ';font-weight:600;font-size:12px">' + cl.plan + '</span></td>' +
                '<td style="font-family:monospace">$' + cl.aum.toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:' + pnlColor + '">' + (cl.pnl30d >= 0 ? '+' : '') + cl.pnl30d + '%</td>' +
                '<td><span class="sol-tag ' + statusTag + '">' + cl.status + '</span></td>' +
                '<td style="color:#888;font-size:12px">' + cl.lastActive + '</td>' +
                '<td><button class="sol-btn sol-btn-sm sol-btn-outline client-view" data-id="' + cl.id + '">View</button></td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📊 Revenue by Plan</div>';
        var plans = { Standard: 0, Premium: 0, Enterprise: 0 };
        this.clients.forEach(function(cl) { plans[cl.plan] = (plans[cl.plan] || 0) + 1; });
        var fees = { Standard: 0.5, Premium: 0.3, Enterprise: 0.15 };
        Object.keys(plans).forEach(function(plan) {
            var count = plans[plan];
            var planClients = self.clients.filter(function(cl) { return cl.plan === plan; });
            var planAum = planClients.reduce(function(s, cl) { return s + cl.aum; }, 0);
            var revenue = planAum * fees[plan] / 100;
            var planColor = plan === 'Enterprise' ? '#c9a227' : plan === 'Premium' ? '#00d4ff' : '#888';
            html += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #111">' +
                '<span style="color:' + planColor + ';font-weight:600">' + plan + ' <span style="color:#555">(' + count + ' clients)</span></span>' +
                '<div><span style="color:#888;font-size:12px">AUM: $' + planAum.toLocaleString() + '</span>' +
                '<span style="color:#00ff88;font-family:monospace;margin-left:16px">$' + revenue.toFixed(0) + '/mo fee</span></div></div>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">➕ Onboard Client</div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Company Name</label><input class="sol-input" id="cp-name" placeholder="Company name"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Email</label><input class="sol-input" id="cp-email" placeholder="contact@company.com"></div></div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Wallet</label><input class="sol-input" id="cp-wallet" placeholder="0x..."></div>' +
            '<div class="sol-form-group"><label class="sol-label">Plan</label><select class="sol-select sol-input" id="cp-plan"><option>Standard</option><option>Premium</option><option>Enterprise</option></select></div></div>' +
            '<button class="sol-btn sol-btn-primary" id="cp-create" style="margin-top:8px">Send Invitation</button></div>';

        c.innerHTML = html;
        c.querySelectorAll('.client-view').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.info('Client detail view opening...');
            });
        });
        var createBtn = c.querySelector('#cp-create');
        if (createBtn) createBtn.addEventListener('click', function() {
            var name = document.getElementById('cp-name').value.trim();
            if (!name) return;
            if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Invitation sent to ' + name);
        });
    }
};

SolutionsHub.registerSolution('client-portal', ClientPortal, 'business', {
    icon: '🏢', name: 'Client Portal', description: 'White-label client management with AUM tracking and tiered billing'
});
