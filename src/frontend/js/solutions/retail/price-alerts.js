/* ============================================
   PRICE ALERTS - Retail Module
   Create alerts on asset prices with browser notifications
   ============================================ */

const PriceAlerts = {
    alerts: [],
    history: [],
    checkInterval: null,

    init() {
        this.load();
        this.startMonitoring();
    },

    load() {
        try {
            this.alerts = JSON.parse(localStorage.getItem('obelisk_price_alerts') || '[]');
            this.history = JSON.parse(localStorage.getItem('obelisk_price_alerts_history') || '[]');
        } catch (e) { this.alerts = []; this.history = []; }
    },

    save() {
        localStorage.setItem('obelisk_price_alerts', JSON.stringify(this.alerts));
        localStorage.setItem('obelisk_price_alerts_history', JSON.stringify(this.history));
    },

    getPrices() {
        if (typeof ObeliskApp !== 'undefined' && ObeliskApp.state && ObeliskApp.state.prices) {
            return ObeliskApp.state.prices;
        }
        return { BTC: 97500, ETH: 3400, SOL: 190, AVAX: 35, LINK: 22, ARB: 1.8 };
    },

    addAlert(asset, condition, price) {
        this.alerts.push({
            id: Date.now().toString(36),
            asset: asset.toUpperCase(),
            condition: condition, // 'above' | 'below'
            price: parseFloat(price),
            active: true,
            created: new Date().toISOString()
        });
        this.save();
    },

    removeAlert(id) {
        this.alerts = this.alerts.filter(function(a) { return a.id !== id; });
        this.save();
    },

    toggleAlert(id) {
        var alert = this.alerts.find(function(a) { return a.id === id; });
        if (alert) { alert.active = !alert.active; this.save(); }
    },

    startMonitoring() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        var self = this;
        this.checkInterval = setInterval(function() { self.checkAlerts(); }, 5000);
    },

    checkAlerts() {
        var prices = this.getPrices();
        var triggered = [];
        var self = this;

        this.alerts.forEach(function(alert) {
            if (!alert.active) return;
            var currentPrice = prices[alert.asset];
            if (!currentPrice) return;

            var triggered_ = false;
            if (alert.condition === 'above' && currentPrice >= alert.price) triggered_ = true;
            if (alert.condition === 'below' && currentPrice <= alert.price) triggered_ = true;

            if (triggered_) {
                triggered.push(alert);
                alert.active = false;
                self.history.unshift({
                    asset: alert.asset,
                    condition: alert.condition,
                    targetPrice: alert.price,
                    actualPrice: currentPrice,
                    triggeredAt: new Date().toISOString()
                });
            }
        });

        if (triggered.length > 0) {
            this.save();
            triggered.forEach(function(a) {
                var msg = a.asset + ' is now ' + a.condition + ' $' + a.price.toLocaleString() + '!';
                // Toast
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.info(msg);
                // Browser notification
                if (Notification.permission === 'granted') {
                    new Notification('Obelisk Price Alert', { body: msg, icon: '🔔' });
                }
            });
            // Re-render if panel is open
            var body = document.getElementById('solution-body');
            if (body && SolutionsHub.activeModule && SolutionsHub.activeModule.id === 'price-alerts') {
                this.render('solution-body');
            }
        }
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var prices = this.getPrices();
        var assets = Object.keys(prices);

        // Request notification permission
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        var activeAlerts = this.alerts.filter(function(a) { return a.active; });
        var inactiveAlerts = this.alerts.filter(function(a) { return !a.active; });

        var html = '' +
            '<div class="sol-section">' +
            '<div class="sol-section-title">➕ New Alert</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Asset</label>' +
            '<select class="sol-select sol-input" id="alert-asset">' +
            assets.map(function(a) { return '<option value="' + a + '">' + a + ' ($' + prices[a].toLocaleString() + ')</option>'; }).join('') +
            '</select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Condition</label>' +
            '<select class="sol-select sol-input" id="alert-condition">' +
            '<option value="above">Goes above</option>' +
            '<option value="below">Goes below</option>' +
            '</select></div>' +
            '</div>' +
            '<div class="sol-form-group"><label class="sol-label">Target Price ($)</label>' +
            '<input type="number" class="sol-input" id="alert-price" placeholder="e.g. 100000" step="any"></div>' +
            '<button class="sol-btn sol-btn-primary" id="alert-add">Create Alert</button>' +
            '</div>' +

            '<div class="sol-section"><div class="sol-section-title">🔔 Active Alerts (' + activeAlerts.length + ')</div>';

        if (activeAlerts.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-icon">🔕</div><div class="sol-empty-text">No active alerts</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Asset</th><th>Condition</th><th>Target</th><th>Actions</th></tr></thead><tbody>';
            activeAlerts.forEach(function(a) {
                html += '<tr><td><strong>' + a.asset + '</strong></td>' +
                    '<td><span class="sol-tag ' + (a.condition === 'above' ? 'sol-tag-green' : 'sol-tag-red') + '">' + a.condition + '</span></td>' +
                    '<td style="font-family:monospace">$' + a.price.toLocaleString() + '</td>' +
                    '<td><button class="sol-btn sol-btn-sm sol-btn-danger alert-delete" data-id="' + a.id + '">Delete</button></td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        // History
        html += '<div class="sol-section"><div class="sol-section-title">📜 Triggered History</div>';
        if (this.history.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No alerts triggered yet</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Asset</th><th>Condition</th><th>Target</th><th>Actual</th><th>Time</th></tr></thead><tbody>';
            this.history.slice(0, 20).forEach(function(h) {
                html += '<tr><td>' + h.asset + '</td>' +
                    '<td>' + h.condition + '</td>' +
                    '<td style="font-family:monospace">$' + h.targetPrice.toLocaleString() + '</td>' +
                    '<td style="font-family:monospace;color:#00ff88">$' + h.actualPrice.toLocaleString() + '</td>' +
                    '<td style="color:#666">' + new Date(h.triggeredAt).toLocaleString() + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        c.innerHTML = html;
        this.bindEvents(c);
    },

    bindEvents(container) {
        var self = this;
        var addBtn = container.querySelector('#alert-add');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                var asset = document.getElementById('alert-asset').value;
                var condition = document.getElementById('alert-condition').value;
                var price = document.getElementById('alert-price').value;
                if (!price || isNaN(price) || parseFloat(price) <= 0) {
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Enter a valid price');
                    return;
                }
                self.addAlert(asset, condition, price);
                self.render('solution-body');
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Alert created!');
            });
        }
        container.querySelectorAll('.alert-delete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.removeAlert(this.dataset.id);
                self.render('solution-body');
            });
        });
    }
};

SolutionsHub.registerSolution('price-alerts', PriceAlerts, 'retail', {
    icon: '🔔', name: 'Price Alerts', description: 'Get notified when assets hit your target prices'
});
