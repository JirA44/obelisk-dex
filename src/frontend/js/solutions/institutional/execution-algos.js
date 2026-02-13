/* ============================================
   EXECUTION ALGOS - Institutional Module
   TWAP, VWAP, Iceberg algorithmic execution
   ============================================ */

const ExecutionAlgos = {
    activeAlgos: [],
    history: [],

    init() {
        try { this.history = JSON.parse(localStorage.getItem('obelisk_algo_exec_history') || '[]'); }
        catch (e) { this.history = []; }
    },

    save() {
        localStorage.setItem('obelisk_algo_exec_history', JSON.stringify(this.history));
    },

    startAlgo(params) {
        var algo = {
            id: 'ALGO-' + Date.now().toString(36).toUpperCase(),
            type: params.type,
            asset: params.asset,
            side: params.side,
            totalAmount: parseFloat(params.amount),
            executedAmount: 0,
            slices: parseInt(params.slices) || 10,
            duration: parseInt(params.duration) || 60,
            displaySize: params.type === 'iceberg' ? parseFloat(params.displaySize) || 1 : null,
            startTime: Date.now(),
            status: 'running',
            fills: []
        };

        this.activeAlgos.push(algo);
        this.simulateExecution(algo);
        return algo;
    },

    simulateExecution(algo) {
        var self = this;
        var sliceSize = algo.totalAmount / algo.slices;
        var interval = (algo.duration * 1000) / algo.slices;
        var prices = { BTC: 97500, ETH: 3400, SOL: 190, AVAX: 35, LINK: 22, ARB: 1.8 };
        var basePrice = prices[algo.asset] || 100;
        var sliceIndex = 0;

        var timer = setInterval(function() {
            if (sliceIndex >= algo.slices || algo.status === 'cancelled') {
                clearInterval(timer);
                if (algo.status !== 'cancelled') algo.status = 'completed';
                self.history.unshift({
                    id: algo.id,
                    type: algo.type,
                    asset: algo.asset,
                    side: algo.side,
                    totalAmount: algo.totalAmount,
                    executedAmount: algo.executedAmount,
                    avgPrice: algo.fills.length > 0 ? algo.fills.reduce(function(s, f) { return s + f.price; }, 0) / algo.fills.length : 0,
                    slices: algo.fills.length,
                    status: algo.status,
                    completedAt: new Date().toISOString()
                });
                self.save();
                // Refresh if panel open
                var body = document.getElementById('solution-body');
                if (body && SolutionsHub.activeModule && SolutionsHub.activeModule.id === 'execution-algos') {
                    self.render('solution-body');
                }
                return;
            }

            var slippage = (Math.random() - 0.5) * basePrice * 0.002;
            var fillPrice = basePrice + slippage;
            algo.executedAmount += sliceSize;
            algo.fills.push({ price: fillPrice, amount: sliceSize, time: new Date().toISOString() });
            sliceIndex++;
        }, Math.min(interval, 3000));
    },

    cancelAlgo(id) {
        var algo = this.activeAlgos.find(function(a) { return a.id === id; });
        if (algo) algo.status = 'cancelled';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var running = this.activeAlgos.filter(function(a) { return a.status === 'running'; });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value gold">' + running.length + '</div><div class="sol-stat-label">Running Algos</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.history.length + '</div><div class="sol-stat-label">Completed</div></div>' +
            '</div>';

        // New algo form
        html += '<div class="sol-section"><div class="sol-section-title">🚀 Launch Algorithm</div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Algorithm</label>' +
            '<select class="sol-select sol-input" id="algo-type">' +
            '<option value="twap">TWAP (Time-Weighted)</option>' +
            '<option value="vwap">VWAP (Volume-Weighted)</option>' +
            '<option value="iceberg">Iceberg</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Asset</label>' +
            '<select class="sol-select sol-input" id="algo-asset"><option>BTC</option><option>ETH</option><option>SOL</option><option>AVAX</option><option>LINK</option><option>ARB</option></select></div></div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Side</label>' +
            '<select class="sol-select sol-input" id="algo-side"><option value="buy">Buy</option><option value="sell">Sell</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Total Amount</label>' +
            '<input type="number" class="sol-input" id="algo-amount" step="any" placeholder="e.g. 10"></div></div>' +
            '<div class="sol-form-row">' +
            '<div class="sol-form-group"><label class="sol-label">Slices</label>' +
            '<input type="number" class="sol-input" id="algo-slices" value="10" min="2" max="100"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Duration (seconds)</label>' +
            '<input type="number" class="sol-input" id="algo-duration" value="60" min="10"></div></div>' +
            '<div class="sol-form-group" id="algo-iceberg-field" style="display:none"><label class="sol-label">Display Size (Iceberg)</label>' +
            '<input type="number" class="sol-input" id="algo-display" step="any" placeholder="Visible order size"></div>' +
            '<button class="sol-btn sol-btn-gold" id="algo-launch" style="margin-top:8px">Launch Algorithm</button></div>';

        // Active algos
        if (running.length > 0) {
            html += '<div class="sol-section"><div class="sol-section-title">🔄 Running (' + running.length + ')</div>';
            running.forEach(function(a) {
                var pct = (a.executedAmount / a.totalAmount) * 100;
                html += '<div style="padding:12px;border:1px solid #333;border-radius:10px;margin-bottom:10px">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
                    '<span><strong style="color:#c9a227">' + a.type.toUpperCase() + '</strong> ' + a.side + ' ' + a.totalAmount + ' ' + a.asset + '</span>' +
                    '<button class="sol-btn sol-btn-sm sol-btn-danger algo-cancel" data-id="' + a.id + '">Cancel</button></div>' +
                    '<div class="sol-progress"><div class="sol-progress-fill gold" style="width:' + pct + '%"></div></div>' +
                    '<div style="font-size:11px;color:#666;margin-top:4px">' + a.fills.length + '/' + a.slices + ' slices | ' + pct.toFixed(1) + '% executed</div></div>';
            });
            html += '</div>';
        }

        // History
        html += '<div class="sol-section"><div class="sol-section-title">📜 Execution History</div>';
        if (this.history.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No completed executions yet</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>ID</th><th>Type</th><th>Asset</th><th>Side</th><th>Amount</th><th>Avg Price</th><th>Slices</th><th>Status</th></tr></thead><tbody>';
            this.history.slice(0, 10).forEach(function(h) {
                var statusTag = h.status === 'completed' ? 'sol-tag-green' : 'sol-tag-red';
                html += '<tr><td style="font-family:monospace;font-size:11px">' + h.id + '</td>' +
                    '<td><span class="sol-tag sol-tag-gold">' + h.type.toUpperCase() + '</span></td>' +
                    '<td><strong>' + h.asset + '</strong></td>' +
                    '<td><span class="sol-tag ' + (h.side === 'buy' ? 'sol-tag-green' : 'sol-tag-red') + '">' + h.side + '</span></td>' +
                    '<td style="font-family:monospace">' + h.executedAmount.toFixed(4) + '</td>' +
                    '<td style="font-family:monospace">$' + h.avgPrice.toLocaleString(undefined, {maximumFractionDigits:2}) + '</td>' +
                    '<td>' + h.slices + '</td>' +
                    '<td><span class="sol-tag ' + statusTag + '">' + h.status + '</span></td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        // Algo descriptions
        html += '<div class="sol-section"><div class="sol-section-title">📚 Algorithm Types</div>' +
            '<table class="sol-table"><tbody>' +
            '<tr><td><strong>TWAP</strong></td><td style="color:#aaa">Time-Weighted Average Price. Splits the order into equal slices executed at regular time intervals.</td></tr>' +
            '<tr><td><strong>VWAP</strong></td><td style="color:#aaa">Volume-Weighted Average Price. Executes more during high-volume periods, less during low-volume.</td></tr>' +
            '<tr><td><strong>Iceberg</strong></td><td style="color:#aaa">Shows only a small portion of the total order. Hidden quantity replenishes as visible fills.</td></tr>' +
            '</tbody></table></div>';

        c.innerHTML = html;
        this.bindEvents(c);
    },

    bindEvents(container) {
        var self = this;

        // Toggle iceberg field
        var typeSelect = container.querySelector('#algo-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', function() {
                var iceField = container.querySelector('#algo-iceberg-field');
                if (iceField) iceField.style.display = this.value === 'iceberg' ? 'block' : 'none';
            });
        }

        // Launch
        var launchBtn = container.querySelector('#algo-launch');
        if (launchBtn) {
            launchBtn.addEventListener('click', function() {
                var amount = document.getElementById('algo-amount').value;
                if (!amount || parseFloat(amount) <= 0) { if (typeof ObeliskToast !== 'undefined') ObeliskToast.error('Enter an amount'); return; }
                var algo = self.startAlgo({
                    type: document.getElementById('algo-type').value,
                    asset: document.getElementById('algo-asset').value,
                    side: document.getElementById('algo-side').value,
                    amount: amount,
                    slices: document.getElementById('algo-slices').value,
                    duration: document.getElementById('algo-duration').value,
                    displaySize: document.getElementById('algo-display') ? document.getElementById('algo-display').value : null
                });
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Algorithm ' + algo.id + ' launched!');
                self.render('solution-body');
            });
        }

        // Cancel
        container.querySelectorAll('.algo-cancel').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.cancelAlgo(this.dataset.id);
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.info('Algorithm cancelled');
                self.render('solution-body');
            });
        });
    }
};

SolutionsHub.registerSolution('execution-algos', ExecutionAlgos, 'institutional', {
    icon: '🤖', name: 'Execution Algos', description: 'TWAP, VWAP and Iceberg algorithmic order execution'
});
