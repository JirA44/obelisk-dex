/* ============================================
   OTC DESK - Institutional Module
   Request for Quote (RFQ) with 30s timer
   ============================================ */

const OTCDesk = {
    quotes: [],
    history: [],

    init() {
        try { this.history = JSON.parse(localStorage.getItem('obelisk_otc_history') || '[]'); }
        catch (e) { this.history = []; }
    },

    requestQuote(asset, side, amount) {
        var prices = { BTC: 97500, ETH: 3400, SOL: 190, AVAX: 35, LINK: 22, ARB: 1.8 };
        var basePrice = prices[asset] || 100;
        var spread = side === 'buy' ? 1.002 : 0.998; // 0.2% spread
        var quotePrice = basePrice * spread;

        var quote = {
            id: 'Q-' + Date.now().toString(36).toUpperCase(),
            asset: asset,
            side: side,
            amount: parseFloat(amount),
            price: quotePrice,
            total: quotePrice * parseFloat(amount),
            expiresAt: Date.now() + 30000,
            status: 'active'
        };
        this.quotes.push(quote);
        return quote;
    },

    acceptQuote(id) {
        var q = this.quotes.find(function(q_) { return q_.id === id; });
        if (!q || q.status !== 'active') return null;
        if (Date.now() > q.expiresAt) { q.status = 'expired'; return null; }
        q.status = 'filled';
        this.history.unshift({ ...q, filledAt: new Date().toISOString() });
        localStorage.setItem('obelisk_otc_history', JSON.stringify(this.history));
        return q;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value gold">' + this.history.length + '</div><div class="sol-stat-label">Trades Filled</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">0.2%</div><div class="sol-stat-label">Spread</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$0</div><div class="sol-stat-label">Min Size</div></div>' +
            '</div>';

        // RFQ Form
        html += '<div class="sol-section"><div class="sol-section-title">📋 Request for Quote</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Asset</label>' +
            '<select class="sol-select sol-input" id="otc-asset"><option>BTC</option><option>ETH</option><option>SOL</option><option>AVAX</option><option>LINK</option><option>ARB</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Side</label>' +
            '<select class="sol-select sol-input" id="otc-side"><option value="buy">Buy</option><option value="sell">Sell</option></select></div></div>' +
            '<div class="sol-form-group"><label class="sol-label">Amount</label>' +
            '<input type="number" class="sol-input" id="otc-amount" step="any" placeholder="e.g. 10"></div>' +
            '<button class="sol-btn sol-btn-gold" id="otc-rfq" style="margin-top:8px">Get Quote</button></div>';

        // Active quote area
        html += '<div id="otc-quote-area"></div>';

        // History
        html += '<div class="sol-section"><div class="sol-section-title">📜 Trade History</div>';
        if (this.history.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No OTC trades yet</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>ID</th><th>Asset</th><th>Side</th><th>Amount</th><th>Price</th><th>Total</th><th>Time</th></tr></thead><tbody>';
            this.history.slice(0, 10).forEach(function(t) {
                html += '<tr><td style="font-family:monospace;font-size:11px">' + t.id + '</td>' +
                    '<td><strong>' + t.asset + '</strong></td>' +
                    '<td><span class="sol-tag ' + (t.side === 'buy' ? 'sol-tag-green' : 'sol-tag-red') + '">' + t.side + '</span></td>' +
                    '<td style="font-family:monospace">' + t.amount + '</td>' +
                    '<td style="font-family:monospace">$' + t.price.toLocaleString(undefined, {maximumFractionDigits:2}) + '</td>' +
                    '<td style="font-family:monospace;color:#c9a227">$' + t.total.toLocaleString(undefined, {maximumFractionDigits:2}) + '</td>' +
                    '<td style="color:#666">' + new Date(t.filledAt).toLocaleString() + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        c.innerHTML = html;
        this.bindEvents(c);
    },

    showQuote(container, quote) {
        var area = container.querySelector('#otc-quote-area');
        if (!area) return;
        var self = this;

        function updateTimer() {
            var remaining = Math.max(0, quote.expiresAt - Date.now());
            var secs = Math.ceil(remaining / 1000);
            var timerEl = document.getElementById('otc-timer');
            if (!timerEl) return;
            if (remaining <= 0) {
                quote.status = 'expired';
                area.innerHTML = '<div class="sol-section" style="border-color:#ff4466;text-align:center;padding:20px"><span style="color:#ff4466;font-size:18px">Quote expired. Request a new one.</span></div>';
                return;
            }
            timerEl.textContent = secs + 's';
            timerEl.style.color = secs <= 10 ? '#ff4466' : '#c9a227';
            requestAnimationFrame(updateTimer);
        }

        area.innerHTML = '<div class="sol-section" style="border-color:#c9a227">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
            '<div class="sol-section-title" style="margin:0">💰 Quote ' + quote.id + '</div>' +
            '<div style="font-size:24px;font-weight:700;font-family:monospace" id="otc-timer">30s</div></div>' +
            '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + quote.side.toUpperCase() + '</div><div class="sol-stat-label">Side</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + quote.amount + ' ' + quote.asset + '</div><div class="sol-stat-label">Amount</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value gold">$' + quote.price.toLocaleString(undefined, {maximumFractionDigits:2}) + '</div><div class="sol-stat-label">Price</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">$' + quote.total.toLocaleString(undefined, {maximumFractionDigits:2}) + '</div><div class="sol-stat-label">Total</div></div>' +
            '</div>' +
            '<div style="text-align:center;margin-top:12px">' +
            '<button class="sol-btn sol-btn-gold" id="otc-accept" style="padding:12px 40px;font-size:15px">Accept Quote</button>' +
            '</div></div>';

        requestAnimationFrame(updateTimer);

        var acceptBtn = document.getElementById('otc-accept');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', function() {
                var filled = self.acceptQuote(quote.id);
                if (filled) {
                    area.innerHTML = '<div class="sol-section" style="border-color:#00ff88;text-align:center;padding:20px"><span style="color:#00ff88;font-size:18px">Trade filled! ' + filled.amount + ' ' + filled.asset + ' @ $' + filled.price.toLocaleString(undefined, {maximumFractionDigits:2}) + '</span></div>';
                    if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('OTC trade filled: $' + filled.total.toLocaleString());
                } else {
                    area.innerHTML = '<div class="sol-section" style="border-color:#ff4466;text-align:center;padding:20px"><span style="color:#ff4466;font-size:18px">Quote expired or invalid</span></div>';
                }
            });
        }
    },

    bindEvents(container) {
        var self = this;
        var rfqBtn = container.querySelector('#otc-rfq');
        if (rfqBtn) {
            rfqBtn.addEventListener('click', function() {
                var asset = document.getElementById('otc-asset').value;
                var side = document.getElementById('otc-side').value;
                var amount = document.getElementById('otc-amount').value;
                if (!amount || parseFloat(amount) <= 0) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Enter an amount'); return; }
                var quote = self.requestQuote(asset, side, amount);
                self.showQuote(container, quote);
            });
        }
    }
};

SolutionsHub.registerSolution('otc-desk', OTCDesk, 'institutional', {
    icon: '🏦', name: 'OTC Desk', description: 'Request for Quote (RFQ) system for large block trades with 30s timer'
});
