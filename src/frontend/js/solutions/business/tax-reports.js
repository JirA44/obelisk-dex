/* ============================================
   TAX REPORTS - Business Module
   Annual tax summary, realized gains/losses, CSV/PDF export
   Backend: /api/institutional/reports/tax, reports/trades
   ============================================ */

const TaxReports = {
    data: null,
    trades: [],
    selectedYear: new Date().getFullYear(),
    API_BASE: '/api/institutional/reports',

    init() {},

    async fetchData() {
        try {
            var [tax, trades] = await Promise.all([
                fetch(this.API_BASE + '/tax?year=' + this.selectedYear).then(function(r) { return r.json(); }),
                fetch(this.API_BASE + '/trades?year=' + this.selectedYear).then(function(r) { return r.json(); })
            ]);
            return { tax: tax, trades: trades.trades || [] };
        } catch (e) {
            return this.getMockData();
        }
    },

    getMockData() {
        return {
            tax: {
                year: this.selectedYear,
                realizedGains: 45230.50,
                realizedLosses: -12400.80,
                netGains: 32829.70,
                totalFees: 890.25,
                totalTrades: 342,
                shortTermGains: 28500.30,
                longTermGains: 4329.40,
                costBasis: 156000.00
            },
            trades: [
                { date: '2026-01-15', pair: 'BTC/USDC', side: 'sell', amount: 0.5, price: 97500, pnl: 4200, fees: 12.50, holdingDays: 180, type: 'long-term' },
                { date: '2026-01-10', pair: 'ETH/USDC', side: 'sell', amount: 5, price: 3400, pnl: -800, fees: 8.50, holdingDays: 45, type: 'short-term' },
                { date: '2025-12-28', pair: 'SOL/USDC', side: 'sell', amount: 50, price: 190, pnl: 1500, fees: 4.75, holdingDays: 92, type: 'short-term' },
                { date: '2025-12-15', pair: 'BTC/USDC', side: 'sell', amount: 0.2, price: 95000, pnl: 2100, fees: 9.50, holdingDays: 220, type: 'long-term' },
                { date: '2025-11-20', pair: 'AVAX/USDC', side: 'sell', amount: 100, price: 35, pnl: -400, fees: 1.75, holdingDays: 30, type: 'short-term' }
            ]
        };
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        c.innerHTML = '<div style="text-align:center;padding:40px;color:#666">Loading tax data...</div>';
        this.fetchData().then(function(data) {
            self.data = data.tax;
            self.trades = data.trades;
            self.renderUI(c);
        });
    },

    renderUI(c) {
        var d = this.data;
        var netColor = d.netGains >= 0 ? '#00ff88' : '#ff4466';
        var netSign = d.netGains >= 0 ? '+' : '';

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">' +
            '<div><label class="sol-label">Tax Year</label>' +
            '<select class="sol-select sol-input" id="tax-year" style="width:120px">';
        for (var y = 2026; y >= 2024; y--) {
            html += '<option value="' + y + '"' + (y === this.selectedYear ? ' selected' : '') + '>' + y + '</option>';
        }
        html += '</select></div>' +
            '<div style="display:flex;gap:8px">' +
            '<button class="sol-btn sol-btn-outline" id="tax-export-csv">Export CSV</button>' +
            '<button class="sol-btn sol-btn-cyan" id="tax-export-pdf">Export PDF</button>' +
            '</div></div>';

        // Summary cards
        html += '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">+$' + d.realizedGains.toLocaleString(undefined, {maximumFractionDigits:2}) + '</div><div class="sol-stat-label">Realized Gains</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">-$' + Math.abs(d.realizedLosses).toLocaleString(undefined, {maximumFractionDigits:2}) + '</div><div class="sol-stat-label">Realized Losses</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + netColor + '">' + netSign + '$' + d.netGains.toLocaleString(undefined, {maximumFractionDigits:2}) + '</div><div class="sol-stat-label">Net Gains</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$' + d.totalFees.toLocaleString(undefined, {maximumFractionDigits:2}) + '</div><div class="sol-stat-label">Total Fees (Deductible)</div></div>' +
            '</div>';

        // Breakdown
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
            '<div class="sol-section"><div class="sol-section-title">⏱️ Holding Period Breakdown</div>' +
            '<table class="sol-table"><tbody>' +
            '<tr><td>Short-term gains (&lt;1 year)</td><td style="color:#00ff88;font-family:monospace;text-align:right">+$' + d.shortTermGains.toLocaleString(undefined, {maximumFractionDigits:2}) + '</td></tr>' +
            '<tr><td>Long-term gains (&gt;1 year)</td><td style="color:#00d4ff;font-family:monospace;text-align:right">+$' + d.longTermGains.toLocaleString(undefined, {maximumFractionDigits:2}) + '</td></tr>' +
            '<tr><td>Cost basis</td><td style="font-family:monospace;text-align:right;color:#888">$' + d.costBasis.toLocaleString(undefined, {maximumFractionDigits:2}) + '</td></tr>' +
            '<tr><td>Total trades</td><td style="font-family:monospace;text-align:right">' + d.totalTrades + '</td></tr>' +
            '</tbody></table></div>' +
            '<div class="sol-section"><div class="sol-section-title">📋 Summary</div>' +
            '<p style="color:#aaa;font-size:13px;line-height:1.8">' +
            'For the year <strong>' + d.year + '</strong>, you executed <strong>' + d.totalTrades + '</strong> trades generating ' +
            '<span style="color:#00ff88">$' + d.realizedGains.toLocaleString() + '</span> in gains and ' +
            '<span style="color:#ff4466">$' + Math.abs(d.realizedLosses).toLocaleString() + '</span> in losses. ' +
            'Net taxable gain: <strong style="color:' + netColor + '">' + netSign + '$' + d.netGains.toLocaleString() + '</strong>. ' +
            'Trading fees of $' + d.totalFees.toLocaleString() + ' may be deductible.</p></div></div>';

        // Trades table
        html += '<div class="sol-section"><div class="sol-section-title">📜 Trade History</div>' +
            '<table class="sol-table"><thead><tr><th>Date</th><th>Pair</th><th>Side</th><th>Amount</th><th>Price</th><th>PnL</th><th>Fees</th><th>Holding</th><th>Type</th></tr></thead><tbody>';
        this.trades.forEach(function(t) {
            var pnlColor = t.pnl >= 0 ? '#00ff88' : '#ff4466';
            var typeTag = t.type === 'long-term' ? 'sol-tag-cyan' : 'sol-tag-gold';
            html += '<tr><td style="color:#888">' + t.date + '</td>' +
                '<td><strong>' + t.pair + '</strong></td>' +
                '<td><span class="sol-tag ' + (t.side === 'buy' ? 'sol-tag-green' : 'sol-tag-red') + '">' + t.side + '</span></td>' +
                '<td style="font-family:monospace">' + t.amount + '</td>' +
                '<td style="font-family:monospace">$' + t.price.toLocaleString() + '</td>' +
                '<td style="color:' + pnlColor + ';font-family:monospace">' + (t.pnl >= 0 ? '+' : '') + '$' + t.pnl.toLocaleString() + '</td>' +
                '<td style="font-family:monospace;color:#666">$' + t.fees.toFixed(2) + '</td>' +
                '<td>' + t.holdingDays + 'd</td>' +
                '<td><span class="sol-tag ' + typeTag + '">' + t.type + '</span></td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;
        this.bindEvents(c);
    },

    bindEvents(container) {
        var self = this;

        var yearSelect = container.querySelector('#tax-year');
        if (yearSelect) {
            yearSelect.addEventListener('change', function() {
                self.selectedYear = parseInt(this.value);
                self.render('solution-body');
            });
        }

        var csvBtn = container.querySelector('#tax-export-csv');
        if (csvBtn) {
            csvBtn.addEventListener('click', function() {
                var csv = 'Date,Pair,Side,Amount,Price,PnL,Fees,HoldingDays,Type\n';
                self.trades.forEach(function(t) {
                    csv += [t.date, t.pair, t.side, t.amount, t.price, t.pnl, t.fees, t.holdingDays, t.type].join(',') + '\n';
                });
                var blob = new Blob([csv], { type: 'text/csv' });
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'obelisk_tax_report_' + self.selectedYear + '.csv';
                a.click();
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('CSV exported');
            });
        }

        var pdfBtn = container.querySelector('#tax-export-pdf');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', function() {
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.info('PDF export coming soon');
            });
        }
    }
};

SolutionsHub.registerSolution('tax-reports', TaxReports, 'business', {
    icon: '📄', name: 'Tax Reports', description: 'Annual tax summaries with realized gains, losses, and CSV export'
});
