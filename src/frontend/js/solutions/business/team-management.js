/* ============================================
   TEAM MANAGEMENT - Business Module
   Frontend for backend /api/institutional/org/* routes
   CRUD organization, members, invites, roles, limits
   ============================================ */

const TeamManagement = {
    org: null,
    members: [],
    invites: [],
    currentTab: 'members',
    API_BASE: '/api/institutional/org',

    init() {
        this.loadOrg();
    },

    async apiCall(endpoint, method, body) {
        try {
            var opts = { method: method || 'GET', headers: { 'Content-Type': 'application/json' } };
            if (body) opts.body = JSON.stringify(body);
            var resp = await fetch(this.API_BASE + endpoint, opts);
            return await resp.json();
        } catch (e) {
            console.warn('[TeamMgmt] API error:', e.message);
            return this.getMockData(endpoint, method);
        }
    },

    getMockData(endpoint, method) {
        // Demo data when backend not available
        if (endpoint === '' || endpoint === '/') {
            return {
                success: true,
                org: { id: 'org_demo', name: 'My Organization', plan: 'business', created: '2025-06-15' }
            };
        }
        if (endpoint === '/members') {
            return {
                success: true,
                members: [
                    { id: 'm1', wallet: '0x377...9140', role: 'owner', name: 'Hugo', joinedAt: '2025-06-15', limits: { maxCapital: 50000, maxLoss: 5000, maxPositions: 10 } },
                    { id: 'm2', wallet: '0xabc...def0', role: 'trader', name: 'Alice', joinedAt: '2025-08-01', limits: { maxCapital: 10000, maxLoss: 1000, maxPositions: 5 } }
                ]
            };
        }
        if (endpoint === '/invites') {
            return { success: true, invites: [] };
        }
        return { success: true };
    },

    async loadOrg() {
        var orgResp = await this.apiCall('', 'GET');
        var membersResp = await this.apiCall('/members', 'GET');
        var invitesResp = await this.apiCall('/invites', 'GET');

        this.org = orgResp.org || null;
        this.members = (membersResp.members || []);
        this.invites = (invitesResp.invites || []);
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;

        // Load data then render
        this.loadOrg().then(function() {
            self.renderUI(c);
        });
    },

    renderUI(c) {
        var self = this;
        var html = '';

        // Org info
        if (this.org) {
            html += '<div class="sol-stats-row">' +
                '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + (this.org.name || 'My Org') + '</div><div class="sol-stat-label">Organization</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value">' + this.members.length + '</div><div class="sol-stat-label">Members</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value">' + this.invites.length + '</div><div class="sol-stat-label">Pending Invites</div></div>' +
                '<div class="sol-stat-card"><div class="sol-stat-value"><span class="sol-tag sol-tag-cyan">' + (this.org.plan || 'business') + '</span></div><div class="sol-stat-label">Plan</div></div>' +
                '</div>';
        }

        // Tabs
        html += '<div class="sol-tabs">' +
            '<button class="sol-tab ' + (this.currentTab === 'members' ? 'active' : '') + '" data-stab="members">Members</button>' +
            '<button class="sol-tab ' + (this.currentTab === 'invites' ? 'active' : '') + '" data-stab="invites">Invites</button>' +
            '<button class="sol-tab ' + (this.currentTab === 'settings' ? 'active' : '') + '" data-stab="settings">Org Settings</button>' +
            '</div>';

        // Tab content
        if (this.currentTab === 'members') {
            html += this.renderMembers();
        } else if (this.currentTab === 'invites') {
            html += this.renderInvites();
        } else {
            html += this.renderOrgSettings();
        }

        c.innerHTML = html;
        this.bindEvents(c);
    },

    renderMembers() {
        var html = '<div class="sol-section"><div class="sol-section-title">👥 Team Members</div>';
        if (this.members.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-icon">👤</div><div class="sol-empty-text">No members yet</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Name</th><th>Wallet</th><th>Role</th><th>Max Capital</th><th>Max Loss</th><th>Max Positions</th><th>Actions</th></tr></thead><tbody>';
            this.members.forEach(function(m) {
                var roleColor = m.role === 'owner' ? 'sol-tag-gold' : m.role === 'admin' ? 'sol-tag-cyan' : m.role === 'trader' ? 'sol-tag-green' : 'sol-tag-gray';
                var limits = m.limits || {};
                html += '<tr>' +
                    '<td><strong>' + (m.name || 'Unknown') + '</strong></td>' +
                    '<td style="font-family:monospace;font-size:11px">' + (m.wallet || '-') + '</td>' +
                    '<td><span class="sol-tag ' + roleColor + '">' + m.role + '</span></td>' +
                    '<td style="font-family:monospace">$' + (limits.maxCapital || 0).toLocaleString() + '</td>' +
                    '<td style="font-family:monospace">$' + (limits.maxLoss || 0).toLocaleString() + '</td>' +
                    '<td>' + (limits.maxPositions || '-') + '</td>' +
                    '<td>' + (m.role !== 'owner' ? '<button class="sol-btn sol-btn-sm sol-btn-outline member-edit" data-id="' + m.id + '">Edit</button> <button class="sol-btn sol-btn-sm sol-btn-danger member-remove" data-id="' + m.id + '">Remove</button>' : '<span class="sol-tag sol-tag-gold">Owner</span>') + '</td>' +
                    '</tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';
        return html;
    },

    renderInvites() {
        var html = '<div class="sol-section"><div class="sol-section-title">📨 Invite New Member</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Wallet Address</label>' +
            '<input type="text" class="sol-input" id="invite-wallet" placeholder="0x..."></div>' +
            '<div class="sol-form-group"><label class="sol-label">Role</label>' +
            '<select class="sol-select sol-input" id="invite-role">' +
            '<option value="trader">Trader</option><option value="viewer">Viewer</option><option value="admin">Admin</option>' +
            '</select></div>' +
            '</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Max Capital ($)</label><input type="number" class="sol-input" id="invite-maxcap" value="10000"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Max Loss ($)</label><input type="number" class="sol-input" id="invite-maxloss" value="1000"></div>' +
            '</div>' +
            '<button class="sol-btn sol-btn-cyan" id="invite-send">Send Invite</button></div>';

        html += '<div class="sol-section"><div class="sol-section-title">⏳ Pending Invites</div>';
        if (this.invites.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No pending invites</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Wallet</th><th>Role</th><th>Sent</th><th>Actions</th></tr></thead><tbody>';
            this.invites.forEach(function(inv) {
                html += '<tr><td style="font-family:monospace">' + inv.wallet + '</td>' +
                    '<td><span class="sol-tag sol-tag-cyan">' + inv.role + '</span></td>' +
                    '<td style="color:#666">' + new Date(inv.sentAt).toLocaleDateString() + '</td>' +
                    '<td><button class="sol-btn sol-btn-sm sol-btn-danger invite-cancel" data-id="' + inv.id + '">Cancel</button></td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';
        return html;
    },

    renderOrgSettings() {
        var name = this.org ? this.org.name : '';
        return '<div class="sol-section"><div class="sol-section-title">⚙️ Organization Settings</div>' +
            '<div class="sol-form-group"><label class="sol-label">Organization Name</label>' +
            '<input type="text" class="sol-input" id="org-name" value="' + name + '"></div>' +
            '<button class="sol-btn sol-btn-cyan" id="org-save">Save Changes</button>' +
            '</div>' +
            '<div class="sol-section"><div class="sol-section-title" style="color:#ff4466">⚠️ Danger Zone</div>' +
            '<p style="color:#888;font-size:13px;margin-bottom:12px">Deleting your organization is permanent and cannot be undone.</p>' +
            '<button class="sol-btn sol-btn-danger" id="org-delete">Delete Organization</button></div>';
    },

    bindEvents(container) {
        var self = this;

        // Tab switching
        container.querySelectorAll('.sol-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.currentTab = this.dataset.stab;
                self.renderUI(container);
            });
        });

        // Send invite
        var inviteBtn = container.querySelector('#invite-send');
        if (inviteBtn) {
            inviteBtn.addEventListener('click', function() {
                var wallet = document.getElementById('invite-wallet').value.trim();
                var role = document.getElementById('invite-role').value;
                var maxCap = document.getElementById('invite-maxcap').value;
                var maxLoss = document.getElementById('invite-maxloss').value;
                if (!wallet) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Enter a wallet address'); return; }
                self.apiCall('/invites', 'POST', { wallet: wallet, role: role, limits: { maxCapital: +maxCap, maxLoss: +maxLoss } }).then(function() {
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Invite sent!');
                    self.invites.push({ id: Date.now().toString(), wallet: wallet, role: role, sentAt: new Date().toISOString() });
                    self.renderUI(container);
                });
            });
        }

        // Cancel invite
        container.querySelectorAll('.invite-cancel').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.dataset.id;
                self.apiCall('/invites/' + id, 'DELETE').then(function() {
                    self.invites = self.invites.filter(function(i) { return i.id !== id; });
                    self.renderUI(container);
                });
            });
        });

        // Remove member
        container.querySelectorAll('.member-remove').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (!confirm('Remove this member?')) return;
                var id = this.dataset.id;
                self.apiCall('/members/' + id, 'DELETE').then(function() {
                    self.members = self.members.filter(function(m) { return m.id !== id; });
                    self.renderUI(container);
                });
            });
        });

        // Save org
        var saveBtn = container.querySelector('#org-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                var name = document.getElementById('org-name').value.trim();
                if (!name) return;
                self.apiCall('', 'PUT', { name: name }).then(function() {
                    if (self.org) self.org.name = name;
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Organization updated');
                    self.renderUI(container);
                });
            });
        }
    }
};

SolutionsHub.registerSolution('team-management', TeamManagement, 'business', {
    icon: '👥', name: 'Team Management', description: 'Manage your organization, invite members, set roles and trading limits'
});
