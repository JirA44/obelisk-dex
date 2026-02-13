/* ============================================
   INVOICE GENERATOR - Business Module
   Create crypto invoices with QR code and export
   ============================================ */

const InvoiceGenerator = {
    invoices: [],

    init() {
        this.load();
    },

    load() {
        try { this.invoices = JSON.parse(localStorage.getItem('obelisk_invoices') || '[]'); }
        catch (e) { this.invoices = []; }
    },

    save() {
        localStorage.setItem('obelisk_invoices', JSON.stringify(this.invoices));
    },

    createInvoice(data) {
        var inv = {
            id: 'INV-' + Date.now().toString(36).toUpperCase(),
            from: data.from || 'My Organization',
            to: data.to || '',
            wallet: data.wallet || '',
            items: data.items || [],
            currency: data.currency || 'USDC',
            network: data.network || 'Arbitrum',
            tax: parseFloat(data.tax) || 0,
            notes: data.notes || '',
            status: 'pending',
            created: new Date().toISOString(),
            dueDate: data.dueDate || ''
        };
        inv.subtotal = inv.items.reduce(function(s, i) { return s + (i.qty * i.price); }, 0);
        inv.taxAmount = inv.subtotal * (inv.tax / 100);
        inv.total = inv.subtotal + inv.taxAmount;
        this.invoices.unshift(inv);
        this.save();
        return inv;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var html = '<div class="sol-tabs">' +
            '<button class="sol-tab active" data-stab="create">Create Invoice</button>' +
            '<button class="sol-tab" data-stab="list">My Invoices (' + this.invoices.length + ')</button>' +
            '</div>' +
            '<div id="invoice-tab-content"></div>';

        c.innerHTML = html;
        this.renderCreateForm(c.querySelector('#invoice-tab-content'));
        this.bindTabEvents(c);
    },

    renderCreateForm(container) {
        var html = '<div class="sol-section"><div class="sol-section-title">📝 Invoice Details</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">From (Your Organization)</label><input class="sol-input" id="inv-from" value="My Organization"></div>' +
            '<div class="sol-form-group"><label class="sol-label">To (Client)</label><input class="sol-input" id="inv-to" placeholder="Client name"></div></div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Payment Wallet</label><input class="sol-input" id="inv-wallet" placeholder="0x..."></div>' +
            '<div class="sol-form-group"><label class="sol-label">Currency</label>' +
            '<select class="sol-select sol-input" id="inv-currency"><option>USDC</option><option>USDT</option><option>ETH</option><option>BTC</option><option>DAI</option></select></div></div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Network</label>' +
            '<select class="sol-select sol-input" id="inv-network"><option>Arbitrum</option><option>Ethereum</option><option>Polygon</option><option>Base</option><option>Optimism</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Due Date</label><input type="date" class="sol-input" id="inv-due" style="color-scheme:dark"></div></div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Tax Rate (%)</label><input type="number" class="sol-input" id="inv-tax" value="0" step="any"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Notes</label><input class="sol-input" id="inv-notes" placeholder="Optional notes"></div></div>' +
            '</div>';

        // Line items
        html += '<div class="sol-section"><div class="sol-section-title">📋 Line Items</div>' +
            '<div id="inv-items"><div class="sol-form-row inv-item-row">' +
            '<div class="sol-form-group" style="flex:2"><label class="sol-label">Description</label><input class="sol-input inv-item-desc" placeholder="Service description"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Qty</label><input type="number" class="sol-input inv-item-qty" value="1" min="1"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Price ($)</label><input type="number" class="sol-input inv-item-price" step="any" placeholder="0.00"></div>' +
            '</div></div>' +
            '<button class="sol-btn sol-btn-sm sol-btn-outline" id="inv-add-item" style="margin-top:8px">+ Add Item</button></div>';

        html += '<div style="text-align:center;margin-top:20px"><button class="sol-btn sol-btn-cyan" id="inv-generate" style="padding:12px 40px;font-size:15px">Generate Invoice</button></div>';

        container.innerHTML = html;
        this.bindFormEvents(container);
    },

    renderInvoiceList(container) {
        if (this.invoices.length === 0) {
            container.innerHTML = '<div class="sol-empty"><div class="sol-empty-icon">📄</div><div class="sol-empty-text">No invoices yet</div></div>';
            return;
        }

        var html = '<table class="sol-table"><thead><tr><th>ID</th><th>To</th><th>Total</th><th>Currency</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
        this.invoices.forEach(function(inv) {
            var statusTag = inv.status === 'paid' ? 'sol-tag-green' : inv.status === 'overdue' ? 'sol-tag-red' : 'sol-tag-gold';
            html += '<tr><td style="font-family:monospace;font-size:12px">' + inv.id + '</td>' +
                '<td>' + inv.to + '</td>' +
                '<td style="font-family:monospace;color:#00d4ff">$' + inv.total.toFixed(2) + '</td>' +
                '<td>' + inv.currency + '</td>' +
                '<td><span class="sol-tag ' + statusTag + '">' + inv.status + '</span></td>' +
                '<td style="color:#666">' + new Date(inv.created).toLocaleDateString() + '</td>' +
                '<td><button class="sol-btn sol-btn-sm sol-btn-outline inv-view" data-id="' + inv.id + '">View</button></td></tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        var self = this;
        container.querySelectorAll('.inv-view').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var inv = self.invoices.find(function(i) { return i.id === btn.dataset.id; });
                if (inv) self.renderInvoicePreview(container, inv);
            });
        });
    },

    renderInvoicePreview(container, inv) {
        var qrData = inv.currency + ':' + inv.wallet + '?amount=' + inv.total;
        var qrPlaceholder = '<div style="width:120px;height:120px;background:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#000;font-size:10px;text-align:center;padding:8px">QR: ' + qrData.substring(0, 30) + '...</div>';

        var html = '<div style="background:#111;border:1px solid #222;border-radius:14px;padding:30px;max-width:700px;margin:0 auto">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:30px">' +
            '<div><h2 style="color:#00d4ff;margin:0 0 4px 0">INVOICE</h2><span style="color:#888;font-family:monospace">' + inv.id + '</span></div>' +
            qrPlaceholder + '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">' +
            '<div><div style="color:#666;font-size:11px;text-transform:uppercase;margin-bottom:4px">From</div><div style="color:#fff">' + inv.from + '</div></div>' +
            '<div><div style="color:#666;font-size:11px;text-transform:uppercase;margin-bottom:4px">To</div><div style="color:#fff">' + inv.to + '</div></div>' +
            '<div><div style="color:#666;font-size:11px;text-transform:uppercase;margin-bottom:4px">Payment Address</div><div style="font-family:monospace;font-size:11px;color:#00ff88;word-break:break-all">' + inv.wallet + '</div></div>' +
            '<div><div style="color:#666;font-size:11px;text-transform:uppercase;margin-bottom:4px">Due Date</div><div style="color:#fff">' + (inv.dueDate || 'N/A') + '</div></div></div>' +
            '<table class="sol-table"><thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>';
        inv.items.forEach(function(item) {
            html += '<tr><td>' + item.desc + '</td><td>' + item.qty + '</td><td style="font-family:monospace">$' + item.price.toFixed(2) + '</td><td style="font-family:monospace">$' + (item.qty * item.price).toFixed(2) + '</td></tr>';
        });
        html += '</tbody></table>' +
            '<div style="text-align:right;margin-top:16px;padding-top:16px;border-top:1px solid #222">' +
            '<div style="color:#888;margin-bottom:4px">Subtotal: $' + inv.subtotal.toFixed(2) + '</div>' +
            (inv.taxAmount > 0 ? '<div style="color:#888;margin-bottom:4px">Tax (' + inv.tax + '%): $' + inv.taxAmount.toFixed(2) + '</div>' : '') +
            '<div style="font-size:20px;color:#00d4ff;font-weight:700;font-family:monospace">Total: $' + inv.total.toFixed(2) + ' ' + inv.currency + '</div>' +
            '<div style="color:#555;font-size:11px;margin-top:4px">Network: ' + inv.network + '</div></div>' +
            (inv.notes ? '<div style="color:#666;font-size:12px;margin-top:16px;padding-top:12px;border-top:1px solid #1a1a1a">Notes: ' + inv.notes + '</div>' : '') +
            '</div>' +
            '<div style="text-align:center;margin-top:16px"><button class="sol-btn sol-btn-outline" id="inv-back">Back to List</button></div>';

        container.innerHTML = html;
        var self = this;
        container.querySelector('#inv-back').addEventListener('click', function() {
            self.renderInvoiceList(container);
        });
    },

    bindTabEvents(container) {
        var self = this;
        container.querySelectorAll('.sol-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                container.querySelectorAll('.sol-tab').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                var tab = this.dataset.stab;
                var content = container.querySelector('#invoice-tab-content');
                if (tab === 'create') self.renderCreateForm(content);
                else self.renderInvoiceList(content);
            });
        });
    },

    bindFormEvents(container) {
        var self = this;

        // Add item row
        var addItem = container.querySelector('#inv-add-item');
        if (addItem) {
            addItem.addEventListener('click', function() {
                var items = container.querySelector('#inv-items');
                var row = document.createElement('div');
                row.className = 'sol-form-row inv-item-row';
                row.style.marginTop = '8px';
                row.innerHTML = '<div class="sol-form-group" style="flex:2"><input class="sol-input inv-item-desc" placeholder="Description"></div>' +
                    '<div class="sol-form-group"><input type="number" class="sol-input inv-item-qty" value="1" min="1"></div>' +
                    '<div class="sol-form-group"><input type="number" class="sol-input inv-item-price" step="any" placeholder="0.00"></div>';
                items.appendChild(row);
            });
        }

        // Generate
        var genBtn = container.querySelector('#inv-generate');
        if (genBtn) {
            genBtn.addEventListener('click', function() {
                var items = [];
                container.querySelectorAll('.inv-item-row').forEach(function(row) {
                    var desc = row.querySelector('.inv-item-desc').value.trim();
                    var qty = parseInt(row.querySelector('.inv-item-qty').value) || 1;
                    var price = parseFloat(row.querySelector('.inv-item-price').value) || 0;
                    if (desc && price > 0) items.push({ desc: desc, qty: qty, price: price });
                });
                if (items.length === 0) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Add at least one item'); return; }
                var inv = self.createInvoice({
                    from: document.getElementById('inv-from').value,
                    to: document.getElementById('inv-to').value,
                    wallet: document.getElementById('inv-wallet').value,
                    currency: document.getElementById('inv-currency').value,
                    network: document.getElementById('inv-network').value,
                    dueDate: document.getElementById('inv-due').value,
                    tax: document.getElementById('inv-tax').value,
                    notes: document.getElementById('inv-notes').value,
                    items: items
                });
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Invoice ' + inv.id + ' created!');
                // Switch to list and preview
                var content = container.querySelector('#invoice-tab-content') || container;
                self.renderInvoicePreview(content, inv);
            });
        }
    }
};

SolutionsHub.registerSolution('invoice-generator', InvoiceGenerator, 'business', {
    icon: '🧾', name: 'Invoice Generator', description: 'Create professional crypto invoices with QR codes and payment tracking'
});
