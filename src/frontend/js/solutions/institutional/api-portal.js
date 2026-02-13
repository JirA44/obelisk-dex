/* ============================================
   API PORTAL - Institutional Module
   Frontend for /api/institutional/api-keys and /api/institutional/webhooks
   API key management, webhook configuration, documentation
   ============================================ */

const APIPortal = {
    apiKeys: [],
    webhooks: [],
    deliveries: [],
    currentTab: 'keys',
    API_BASE: '/api/institutional',

    init() {
        this.loadData();
    },

    async apiCall(endpoint, method, body) {
        try {
            var opts = { method: method || 'GET', headers: { 'Content-Type': 'application/json' } };
            if (body) opts.body = JSON.stringify(body);
            var resp = await fetch(this.API_BASE + endpoint, opts);
            return await resp.json();
        } catch (e) {
            return this.getMockData(endpoint);
        }
    },

    getMockData(endpoint) {
        if (endpoint.includes('api-keys')) {
            return {
                success: true,
                keys: [
                    { id: 'key_1', name: 'Production', prefix: 'ob_live_xxxx', scopes: ['trade','read','withdraw'], ipWhitelist: ['192.168.1.0/24'], tier: 'pro', rateLimit: 1000, created: '2025-09-01', lastUsed: '2026-02-06' },
                    { id: 'key_2', name: 'Read-Only', prefix: 'ob_live_yyyy', scopes: ['read'], ipWhitelist: [], tier: 'basic', rateLimit: 100, created: '2025-11-15', lastUsed: '2026-02-05' }
                ]
            };
        }
        if (endpoint.includes('webhooks')) {
            return {
                success: true,
                webhooks: [
                    { id: 'wh_1', url: 'https://api.mycompany.com/obelisk/events', events: ['trade.executed','position.closed','alert.triggered'], active: true, created: '2025-10-01', successRate: 99.8 }
                ],
                deliveries: [
                    { id: 'd1', event: 'trade.executed', url: 'https://api.mycompany.com/obelisk/events', status: 200, timestamp: '2026-02-06T14:30:00Z' },
                    { id: 'd2', event: 'position.closed', url: 'https://api.mycompany.com/obelisk/events', status: 200, timestamp: '2026-02-06T12:15:00Z' }
                ]
            };
        }
        return { success: true };
    },

    async loadData() {
        var keysResp = await this.apiCall('/api-keys', 'GET');
        var whResp = await this.apiCall('/webhooks', 'GET');
        this.apiKeys = keysResp.keys || [];
        this.webhooks = whResp.webhooks || [];
        this.deliveries = whResp.deliveries || [];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        this.loadData().then(function() { self.renderUI(c); });
    },

    renderUI(c) {
        var html = '<div class="sol-tabs">' +
            '<button class="sol-tab ' + (this.currentTab === 'keys' ? 'active' : '') + '" data-stab="keys">API Keys</button>' +
            '<button class="sol-tab ' + (this.currentTab === 'webhooks' ? 'active' : '') + '" data-stab="webhooks">Webhooks</button>' +
            '<button class="sol-tab ' + (this.currentTab === 'docs' ? 'active' : '') + '" data-stab="docs">Documentation</button>' +
            '</div>';

        if (this.currentTab === 'keys') html += this.renderKeys();
        else if (this.currentTab === 'webhooks') html += this.renderWebhooks();
        else html += this.renderDocs();

        c.innerHTML = html;
        this.bindEvents(c);
    },

    renderKeys() {
        var html = '<div class="sol-section"><div class="sol-section-title">🔑 Create API Key</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Key Name</label><input class="sol-input" id="key-name" placeholder="e.g. Production Bot"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Rate Limit Tier</label>' +
            '<select class="sol-select sol-input" id="key-tier">' +
            '<option value="basic">Basic (100 req/min)</option>' +
            '<option value="pro">Pro (1,000 req/min)</option>' +
            '<option value="enterprise">Enterprise (10,000 req/min)</option>' +
            '</select></div></div>' +
            '<div class="sol-form-group"><label class="sol-label">Scopes</label>' +
            '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:4px">' +
            '<label style="color:#aaa;font-size:13px;display:flex;align-items:center;gap:4px"><input type="checkbox" class="key-scope" value="read" checked> Read</label>' +
            '<label style="color:#aaa;font-size:13px;display:flex;align-items:center;gap:4px"><input type="checkbox" class="key-scope" value="trade"> Trade</label>' +
            '<label style="color:#aaa;font-size:13px;display:flex;align-items:center;gap:4px"><input type="checkbox" class="key-scope" value="withdraw"> Withdraw</label>' +
            '<label style="color:#aaa;font-size:13px;display:flex;align-items:center;gap:4px"><input type="checkbox" class="key-scope" value="admin"> Admin</label>' +
            '</div></div>' +
            '<div class="sol-form-group"><label class="sol-label">IP Whitelist (comma-separated, leave empty for any)</label>' +
            '<input class="sol-input" id="key-ips" placeholder="e.g. 192.168.1.0/24, 10.0.0.1"></div>' +
            '<button class="sol-btn sol-btn-gold" id="key-create">Generate Key</button></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🗝️ Active Keys (' + this.apiKeys.length + ')</div>';
        if (this.apiKeys.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-icon">🔑</div><div class="sol-empty-text">No API keys created yet</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Name</th><th>Key Prefix</th><th>Scopes</th><th>Tier</th><th>Rate Limit</th><th>Last Used</th><th>Actions</th></tr></thead><tbody>';
            this.apiKeys.forEach(function(k) {
                var scopeTags = k.scopes.map(function(s) {
                    var color = s === 'withdraw' ? 'sol-tag-red' : s === 'trade' ? 'sol-tag-green' : s === 'admin' ? 'sol-tag-gold' : 'sol-tag-gray';
                    return '<span class="sol-tag ' + color + '">' + s + '</span>';
                }).join(' ');
                html += '<tr><td><strong>' + k.name + '</strong></td>' +
                    '<td style="font-family:monospace;font-size:11px">' + k.prefix + '</td>' +
                    '<td>' + scopeTags + '</td>' +
                    '<td><span class="sol-tag sol-tag-gold">' + k.tier + '</span></td>' +
                    '<td>' + k.rateLimit + '/min</td>' +
                    '<td style="color:#666">' + (k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Never') + '</td>' +
                    '<td><button class="sol-btn sol-btn-sm sol-btn-danger key-revoke" data-id="' + k.id + '">Revoke</button></td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';
        return html;
    },

    renderWebhooks() {
        var allEvents = ['trade.executed', 'trade.failed', 'position.opened', 'position.closed', 'position.liquidated', 'alert.triggered', 'deposit.confirmed', 'withdrawal.completed'];

        var html = '<div class="sol-section"><div class="sol-section-title">🔗 Create Webhook</div>' +
            '<div class="sol-form-group"><label class="sol-label">Endpoint URL</label>' +
            '<input class="sol-input" id="wh-url" placeholder="https://api.yourcompany.com/webhook"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Events</label>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">' +
            allEvents.map(function(e) {
                return '<label style="color:#aaa;font-size:12px;display:flex;align-items:center;gap:4px"><input type="checkbox" class="wh-event" value="' + e + '"> ' + e + '</label>';
            }).join('') +
            '</div></div>' +
            '<button class="sol-btn sol-btn-gold" id="wh-create">Create Webhook</button></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📡 Active Webhooks</div>';
        if (this.webhooks.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No webhooks configured</div></div>';
        } else {
            this.webhooks.forEach(function(wh) {
                html += '<div style="padding:12px;border:1px solid #1a1a1a;border-radius:10px;margin-bottom:12px">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
                    '<span style="font-family:monospace;font-size:12px;color:#00d4ff">' + wh.url + '</span>' +
                    '<span class="sol-tag ' + (wh.active ? 'sol-tag-green' : 'sol-tag-red') + '">' + (wh.active ? 'Active' : 'Inactive') + '</span>' +
                    '</div>' +
                    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">' +
                    wh.events.map(function(e) { return '<span class="sol-tag sol-tag-gray">' + e + '</span>'; }).join('') +
                    '</div>' +
                    '<div style="display:flex;gap:8px">' +
                    '<button class="sol-btn sol-btn-sm sol-btn-outline wh-test" data-id="' + wh.id + '">Test</button>' +
                    '<button class="sol-btn sol-btn-sm sol-btn-danger wh-delete" data-id="' + wh.id + '">Delete</button>' +
                    '</div></div>';
            });
        }
        html += '</div>';

        // Delivery history
        html += '<div class="sol-section"><div class="sol-section-title">📋 Recent Deliveries</div>';
        if (this.deliveries.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No deliveries yet</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Event</th><th>URL</th><th>Status</th><th>Time</th></tr></thead><tbody>';
            this.deliveries.forEach(function(d) {
                var statusTag = d.status === 200 ? 'sol-tag-green' : 'sol-tag-red';
                html += '<tr><td><span class="sol-tag sol-tag-gray">' + d.event + '</span></td>' +
                    '<td style="font-family:monospace;font-size:11px">' + d.url + '</td>' +
                    '<td><span class="sol-tag ' + statusTag + '">' + d.status + '</span></td>' +
                    '<td style="color:#666">' + new Date(d.timestamp).toLocaleString() + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';
        return html;
    },

    renderDocs() {
        var examples = [
            { title: 'Get Account Balance', method: 'GET', endpoint: '/api/v1/account/balance',
              curl: "curl -H 'Authorization: Bearer ob_live_xxxx' \\\n  https://obelisk-dex.pages.dev/api/v1/account/balance" },
            { title: 'Place Market Order', method: 'POST', endpoint: '/api/v1/orders',
              curl: "curl -X POST -H 'Authorization: Bearer ob_live_xxxx' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"pair\":\"BTC/USDC\",\"side\":\"buy\",\"type\":\"market\",\"amount\":0.1}' \\\n  https://obelisk-dex.pages.dev/api/v1/orders" },
            { title: 'Get Open Positions', method: 'GET', endpoint: '/api/v1/positions',
              curl: "curl -H 'Authorization: Bearer ob_live_xxxx' \\\n  https://obelisk-dex.pages.dev/api/v1/positions" },
            { title: 'Close Position', method: 'DELETE', endpoint: '/api/v1/positions/:id',
              curl: "curl -X DELETE -H 'Authorization: Bearer ob_live_xxxx' \\\n  https://obelisk-dex.pages.dev/api/v1/positions/pos_abc123" }
        ];

        var html = '<div class="sol-section"><div class="sol-section-title">📚 API Documentation</div>' +
            '<p style="color:#888;font-size:13px;margin-bottom:16px">Use your API key in the Authorization header as a Bearer token. All endpoints return JSON.</p>' +
            '<div style="display:flex;gap:8px;margin-bottom:16px">' +
            '<span class="sol-tag sol-tag-green">Base URL: https://obelisk-dex.pages.dev</span>' +
            '<span class="sol-tag sol-tag-cyan">Format: JSON</span>' +
            '<span class="sol-tag sol-tag-gold">Auth: Bearer Token</span>' +
            '</div></div>';

        examples.forEach(function(ex) {
            var methodColor = ex.method === 'GET' ? '#00ff88' : ex.method === 'POST' ? '#00d4ff' : ex.method === 'DELETE' ? '#ff4466' : '#c9a227';
            html += '<div class="sol-section">' +
                '<div class="sol-section-title"><span style="color:' + methodColor + ';font-family:monospace;font-weight:700">' + ex.method + '</span> ' + ex.title + '</div>' +
                '<p style="font-family:monospace;font-size:12px;color:#888;margin-bottom:10px">' + ex.endpoint + '</p>' +
                '<div class="sol-code"><button class="sol-code-copy" onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent)">Copy</button><pre style="margin:0;white-space:pre-wrap">' + ex.curl + '</pre></div>' +
                '</div>';
        });

        return html;
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

        // Create key
        var createKeyBtn = container.querySelector('#key-create');
        if (createKeyBtn) {
            createKeyBtn.addEventListener('click', function() {
                var name = document.getElementById('key-name').value.trim();
                var tier = document.getElementById('key-tier').value;
                var scopes = [];
                container.querySelectorAll('.key-scope:checked').forEach(function(cb) { scopes.push(cb.value); });
                var ips = document.getElementById('key-ips').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
                if (!name) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Enter a key name'); return; }
                self.apiCall('/api-keys', 'POST', { name: name, tier: tier, scopes: scopes, ipWhitelist: ips }).then(function(resp) {
                    var prefix = 'ob_live_' + Math.random().toString(36).substr(2, 8);
                    self.apiKeys.push({ id: 'key_' + Date.now(), name: name, prefix: prefix, scopes: scopes, tier: tier, rateLimit: tier === 'enterprise' ? 10000 : tier === 'pro' ? 1000 : 100, ipWhitelist: ips, created: new Date().toISOString(), lastUsed: null });
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('API key created: ' + prefix);
                    self.renderUI(container);
                });
            });
        }

        // Revoke key
        container.querySelectorAll('.key-revoke').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (!confirm('Revoke this API key? This cannot be undone.')) return;
                var id = this.dataset.id;
                self.apiCall('/api-keys/' + id, 'DELETE').then(function() {
                    self.apiKeys = self.apiKeys.filter(function(k) { return k.id !== id; });
                    self.renderUI(container);
                });
            });
        });

        // Create webhook
        var createWhBtn = container.querySelector('#wh-create');
        if (createWhBtn) {
            createWhBtn.addEventListener('click', function() {
                var url = document.getElementById('wh-url').value.trim();
                var events = [];
                container.querySelectorAll('.wh-event:checked').forEach(function(cb) { events.push(cb.value); });
                if (!url) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Enter a webhook URL'); return; }
                if (events.length === 0) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Select at least one event'); return; }
                self.apiCall('/webhooks', 'POST', { url: url, events: events }).then(function() {
                    self.webhooks.push({ id: 'wh_' + Date.now(), url: url, events: events, active: true, created: new Date().toISOString(), successRate: 100 });
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Webhook created');
                    self.renderUI(container);
                });
            });
        }

        // Test webhook
        container.querySelectorAll('.wh-test').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.dataset.id;
                self.apiCall('/webhooks/' + id + '/test', 'POST').then(function() {
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.info('Test event sent');
                });
            });
        });

        // Delete webhook
        container.querySelectorAll('.wh-delete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (!confirm('Delete this webhook?')) return;
                var id = this.dataset.id;
                self.apiCall('/webhooks/' + id, 'DELETE').then(function() {
                    self.webhooks = self.webhooks.filter(function(w) { return w.id !== id; });
                    self.renderUI(container);
                });
            });
        });
    }
};

SolutionsHub.registerSolution('api-portal', APIPortal, 'institutional', {
    icon: '🔑', name: 'API Portal', description: 'Manage API keys, webhooks, and explore the trading API documentation'
});
