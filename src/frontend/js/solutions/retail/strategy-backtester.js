/* ============================================
   STRATEGY BACKTESTER - Test trading strategies
   ============================================ */

const StrategyBacktester = {
    results: null,

    init() {},

    runBacktest(params) {
        var days = parseInt(params.period) || 90;
        var capital = parseFloat(params.capital) || 10000;
        var strategy = params.strategy;
        var asset = params.asset;

        var prices = [];
        var p = strategy === 'momentum' ? 95000 : 97500;
        for (var i = 0; i < days; i++) {
            p *= (1 + (Math.random() - 0.48) * 0.03);
            prices.push(p);
        }

        var balance = capital;
        var position = 0;
        var trades = [];
        var equity = [capital];
        var wins = 0, losses = 0;

        for (var i = 1; i < prices.length; i++) {
            var signal = null;
            if (strategy === 'sma-cross') {
                if (i >= 20) {
                    var sma10 = prices.slice(i - 10, i).reduce(function(a, b) { return a + b; }, 0) / 10;
                    var sma20 = prices.slice(i - 20, i).reduce(function(a, b) { return a + b; }, 0) / 20;
                    if (sma10 > sma20 && position === 0) signal = 'buy';
                    else if (sma10 < sma20 && position > 0) signal = 'sell';
                }
            } else if (strategy === 'momentum') {
                if (i >= 5) {
                    var change5 = (prices[i] - prices[i - 5]) / prices[i - 5];
                    if (change5 > 0.02 && position === 0) signal = 'buy';
                    else if (change5 < -0.01 && position > 0) signal = 'sell';
                }
            } else if (strategy === 'mean-reversion') {
                if (i >= 20) {
                    var avg = prices.slice(i - 20, i).reduce(function(a, b) { return a + b; }, 0) / 20;
                    var dev = (prices[i] - avg) / avg;
                    if (dev < -0.02 && position === 0) signal = 'buy';
                    else if (dev > 0.02 && position > 0) signal = 'sell';
                }
            } else { // DCA
                if (i % 7 === 0 && balance > capital * 0.1) {
                    var buyAmt = capital * 0.05;
                    position += buyAmt / prices[i];
                    balance -= buyAmt;
                    trades.push({ day: i, side: 'buy', price: prices[i], amount: buyAmt });
                }
            }

            if (signal === 'buy' && balance > 100) {
                var buySize = balance * 0.95;
                position = buySize / prices[i];
                balance -= buySize;
                trades.push({ day: i, side: 'buy', price: prices[i], amount: buySize });
            } else if (signal === 'sell' && position > 0) {
                var sellValue = position * prices[i];
                var pnl = sellValue - (trades.length > 0 ? trades[trades.length - 1].amount : capital);
                if (pnl > 0) wins++; else losses++;
                balance += sellValue;
                position = 0;
                trades.push({ day: i, side: 'sell', price: prices[i], amount: sellValue });
            }
            equity.push(balance + position * prices[i]);
        }

        var finalValue = balance + position * prices[prices.length - 1];
        var totalReturn = ((finalValue - capital) / capital) * 100;
        var maxDD = 0, peak = equity[0];
        equity.forEach(function(v) { if (v > peak) peak = v; var dd = (v - peak) / peak * 100; if (dd < maxDD) maxDD = dd; });

        return {
            strategy: strategy, asset: asset, period: days, capital: capital,
            finalValue: finalValue, totalReturn: totalReturn, trades: trades.length,
            wins: wins, losses: losses, winRate: wins + losses > 0 ? (wins / (wins + losses) * 100) : 0,
            maxDrawdown: maxDD, equity: equity, sharpe: totalReturn > 0 ? (totalReturn / Math.abs(maxDD || 1)).toFixed(2) : 0
        };
    },

    renderEquitySVG(equity, width, height) {
        if (equity.length < 2) return '';
        var min = Math.min.apply(null, equity), max = Math.max.apply(null, equity);
        var range = max - min || 1;
        var points = equity.map(function(v, i) {
            return ((i / (equity.length - 1)) * width).toFixed(1) + ',' + (height - ((v - min) / range) * (height - 10)).toFixed(1);
        }).join(' ');
        var lastVal = equity[equity.length - 1];
        var color = lastVal >= equity[0] ? '#00ff88' : '#ff4466';
        return '<svg width="' + width + '" height="' + height + '"><polyline points="' + points + '" fill="none" stroke="' + color + '" stroke-width="2"/></svg>';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var html = '<div class="sol-section"><div class="sol-section-title">🧪 Configure Backtest</div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Strategy</label>' +
            '<select class="sol-select sol-input" id="bt-strategy"><option value="sma-cross">SMA Crossover (10/20)</option><option value="momentum">Momentum (5-day)</option><option value="mean-reversion">Mean Reversion</option><option value="dca">DCA (Weekly)</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Asset</label>' +
            '<select class="sol-select sol-input" id="bt-asset"><option>BTC</option><option>ETH</option><option>SOL</option></select></div></div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Period (days)</label>' +
            '<select class="sol-select sol-input" id="bt-period"><option value="30">30 days</option><option value="90" selected>90 days</option><option value="180">180 days</option><option value="365">1 year</option></select></div>' +
            '<div class="sol-form-group"><label class="sol-label">Starting Capital ($)</label><input type="number" class="sol-input" id="bt-capital" value="10000"></div></div>' +
            '<button class="sol-btn sol-btn-primary" id="bt-run" style="margin-top:8px">Run Backtest</button></div>';

        html += '<div id="bt-results"></div>';

        c.innerHTML = html;
        var self = this;
        c.querySelector('#bt-run').addEventListener('click', function() {
            var result = self.runBacktest({
                strategy: document.getElementById('bt-strategy').value,
                asset: document.getElementById('bt-asset').value,
                period: document.getElementById('bt-period').value,
                capital: document.getElementById('bt-capital').value
            });
            self.renderResults(document.getElementById('bt-results'), result);
        });
    },

    renderResults(container, r) {
        var retColor = r.totalReturn >= 0 ? '#00ff88' : '#ff4466';
        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + retColor + '">' + (r.totalReturn >= 0 ? '+' : '') + r.totalReturn.toFixed(1) + '%</div><div class="sol-stat-label">Total Return</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + r.finalValue.toFixed(0) + '</div><div class="sol-stat-label">Final Value</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + r.trades + '</div><div class="sol-stat-label">Trades</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + r.winRate.toFixed(0) + '%</div><div class="sol-stat-label">Win Rate</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + r.maxDrawdown.toFixed(1) + '%</div><div class="sol-stat-label">Max Drawdown</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">📈 Equity Curve</div>' +
            '<div style="padding:10px 0">' + this.renderEquitySVG(r.equity, 600, 150) + '</div></div>';

        container.innerHTML = html;
    }
};

SolutionsHub.registerSolution('strategy-backtester', StrategyBacktester, 'retail', {
    icon: '🧪', name: 'Strategy Backtester', description: 'Test trading strategies on historical data before risking real capital'
});
