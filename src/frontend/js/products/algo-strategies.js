/**
 * ALGO STRATEGIES MODULE - Obelisk DEX
 * Algorithmic trading bots with automated execution
 */
const AlgoStrategiesModule = {
    items: [
        { id: 'grid-btc', name: 'BTC Grid Bot', type: 'grid', asset: 'BTC', apy: 25, minInvest: 500, gridLevels: 20, priceRange: '80K-120K', risk: 'medium', status: 'active' },
        { id: 'grid-eth', name: 'ETH Grid Bot', type: 'grid', asset: 'ETH', apy: 30, minInvest: 200, gridLevels: 25, priceRange: '2.5K-5K', risk: 'medium', status: 'active' },
        { id: 'dca-blue', name: 'Blue Chip DCA', type: 'dca', assets: ['BTC', 'ETH', 'SOL'], apy: 15, minInvest: 100, frequency: 'daily', risk: 'low', status: 'active' },
        { id: 'momentum', name: 'Momentum Hunter', type: 'momentum', assets: 'Top 20', apy: 45, minInvest: 250, lookback: '7 days', risk: 'high', status: 'active' },
        { id: 'mean-rev', name: 'Mean Reversion', type: 'mean-reversion', assets: 'Majors', apy: 35, minInvest: 300, threshold: '2 std', risk: 'medium', status: 'active' },
        { id: 'arb-dex', name: 'DEX Arbitrage Bot', type: 'arbitrage', chains: ['ETH', 'ARB', 'OP'], apy: 55, minInvest: 1000, minSpread: '0.5%', risk: 'low', status: 'active' },
        { id: 'funding-arb', name: 'Funding Rate Arb', type: 'funding', exchanges: ['Binance', 'Hyperliquid'], apy: 40, minInvest: 500, minRate: '0.02%', risk: 'low', status: 'active' },
        { id: 'breakout', name: 'Breakout Trader', type: 'breakout', timeframes: ['4H', '1D'], apy: 60, minInvest: 300, confirmations: 2, risk: 'high', status: 'active' },
        { id: 'scalper', name: 'Micro Scalper', type: 'scalping', asset: 'BTC', apy: 80, minInvest: 500, tradesPerDay: 50, risk: 'extreme', status: 'active' },
        { id: 'smart-rebal', name: 'Smart Rebalancer', type: 'rebalancing', assets: 'Custom', apy: 20, minInvest: 1000, rebalanceThreshold: '5%', risk: 'low', status: 'active' },
        // Micro-capital strategies ($5-$20) for L2 chains (low fees)
        { id: 'micro-dca-5', name: 'Micro DCA $5', type: 'dca', assets: ['ETH', 'BTC'], apy: 12, minInvest: 5, frequency: 'weekly', risk: 'low', status: 'active', chain: 'Optimism', description: 'DCA hebdomadaire sur Optimism - frais < $0.01' },
        { id: 'micro-grid-10', name: 'Micro Grid $10', type: 'grid', asset: 'ETH', apy: 18, minInvest: 10, gridLevels: 5, priceRange: 'auto', risk: 'medium', status: 'active', chain: 'Base', description: 'Grid bot miniature sur Base - frais quasi nuls' },
        { id: 'micro-arb-20', name: 'L2 Micro Arb $20', type: 'arbitrage', chains: ['OP', 'BASE', 'ARB'], apy: 25, minInvest: 20, minSpread: '0.3%', risk: 'medium', status: 'active', chain: 'Multi-L2', description: 'Arbitrage cross-L2 entre Optimism, Base et Arbitrum' },
        { id: 'micro-scalp-5', name: 'Base Scalper $5', type: 'scalping', asset: 'ETH', apy: 30, minInvest: 5, tradesPerDay: 10, risk: 'high', status: 'active', chain: 'Base', description: 'Scalping haute fréquence sur Base - frais 1000x moins chers' },
        { id: 'micro-momentum-10', name: 'OP Momentum $10', type: 'momentum', assets: 'Top 10 L2', apy: 22, minInvest: 10, lookback: '24h', risk: 'medium', status: 'active', chain: 'Optimism', description: 'Suivi de tendance sur les tokens Optimism les plus actifs' }
    ],
    positions: [],
    botLogs: [],

    init() {
        this.load();
        console.log('Algo Strategies Module initialized');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_algo_strategies', []);
        this.botLogs = SafeOps.getStorage('obelisk_algo_logs', []);
    },

    save() {
        SafeOps.setStorage('obelisk_algo_strategies', this.positions);
        SafeOps.setStorage('obelisk_algo_logs', this.botLogs);
    },

    invest(itemId, amount, customParams = {}) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, error: 'Strategy not found' };
        if (amount < item.minInvest) return { success: false, error: 'Min investment: $' + item.minInvest };

        const position = {
            id: 'algo-' + Date.now(),
            strategyId: itemId,
            strategyName: item.name,
            type: item.type,
            allocated: amount,
            totalInvested: amount,
            expectedApy: item.apy,
            risk: item.risk,
            params: { ...customParams },
            startDate: Date.now(),
            status: 'running',
            trades: 0,
            wins: 0,
            losses: 0,
            realizedPnl: 0,
            unrealizedPnl: 0,
            fees: 0,
            lastTradeTime: null
        };

        this.positions.push(position);
        this.addLog(position.id, 'Bot started with $' + amount + ' allocation');
        this.save();

        if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.invest(position.id, item.name, amount, item.apy, 'algo-trading', true);
        }

        return { success: true, position };
    },

    withdraw(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const pos = this.positions[idx];

        // Calculate final PnL
        const daysRunning = (Date.now() - pos.startDate) / 86400000;
        const estimatedPnl = pos.allocated * (pos.expectedApy / 100) * (daysRunning / 365);
        const volatilityAdjust = (Math.random() - 0.5) * 0.3; // +/- 15% variance
        const actualPnl = estimatedPnl * (1 + volatilityAdjust);
        const fees = pos.trades * 0.5; // $0.50 per trade
        const netPnl = actualPnl - fees;
        const totalReturn = pos.allocated + netPnl;

        this.addLog(pos.id, 'Bot stopped. Final PnL: $' + netPnl.toFixed(2));
        this.positions.splice(idx, 1);
        this.save();

        return {
            success: true,
            totalReturn: totalReturn.toFixed(2),
            pnl: netPnl.toFixed(2),
            trades: pos.trades,
            winRate: pos.trades > 0 ? ((pos.wins / pos.trades) * 100).toFixed(1) : 0,
            fees: fees.toFixed(2)
        };
    },

    pauseBot(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };
        if (pos.status === 'paused') return { success: false, error: 'Already paused' };

        pos.status = 'paused';
        this.addLog(pos.id, 'Bot paused');
        this.save();

        return { success: true, status: 'paused' };
    },

    resumeBot(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };
        if (pos.status === 'running') return { success: false, error: 'Already running' };

        pos.status = 'running';
        this.addLog(pos.id, 'Bot resumed');
        this.save();

        return { success: true, status: 'running' };
    },

    adjustAllocation(posId, newAmount) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };

        const item = this.items.find(i => i.id === pos.strategyId);
        if (newAmount < item.minInvest) return { success: false, error: 'Min: $' + item.minInvest };

        const diff = newAmount - pos.allocated;
        pos.allocated = newAmount;
        if (diff > 0) pos.totalInvested += diff;
        this.addLog(pos.id, 'Allocation adjusted: ' + (diff >= 0 ? '+' : '') + diff.toFixed(2));
        this.save();

        return { success: true, newAllocation: newAmount, change: diff };
    },

    addLog(posId, message) {
        this.botLogs.push({
            posId,
            timestamp: Date.now(),
            message
        });
        // Keep last 100 logs
        if (this.botLogs.length > 100) {
            this.botLogs = this.botLogs.slice(-100);
        }
    },

    getLogs(posId, limit = 10) {
        return this.botLogs
            .filter(log => log.posId === posId)
            .slice(-limit)
            .map(log => ({
                time: new Date(log.timestamp).toLocaleTimeString(),
                message: log.message
            }));
    },

    simulateTrades(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos || pos.status !== 'running') return;

        // Simulate trade execution
        const isWin = Math.random() > 0.4; // 60% win rate
        const tradeSize = pos.allocated * 0.1;
        const pnl = tradeSize * (isWin ? 0.02 : -0.01); // 2% win, 1% loss

        pos.trades++;
        if (isWin) pos.wins++;
        else pos.losses++;
        pos.realizedPnl += pnl;
        pos.lastTradeTime = Date.now();

        this.addLog(pos.id, (isWin ? 'WIN' : 'LOSS') + ': ' + (pnl >= 0 ? '+' : '') + pnl.toFixed(2));
        this.save();
    },

    getBotPerformance(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const daysRunning = (Date.now() - pos.startDate) / 86400000;
        const estimatedPnl = pos.allocated * (pos.expectedApy / 100) * (daysRunning / 365);
        const winRate = pos.trades > 0 ? (pos.wins / pos.trades) * 100 : 0;
        const currentValue = pos.allocated + estimatedPnl;

        return {
            currentValue: currentValue.toFixed(2),
            pnl: estimatedPnl.toFixed(2),
            pnlPct: ((estimatedPnl / pos.allocated) * 100).toFixed(2),
            trades: pos.trades,
            winRate: winRate.toFixed(1),
            daysRunning: Math.floor(daysRunning),
            status: pos.status
        };
    },

    getRiskColor(risk) {
        const colors = { low: '#00ff88', medium: '#ffaa00', high: '#ff6644', extreme: '#ff0044' };
        return colors[risk] || '#888';
    },

    getTypeIcon(type) {
        const icons = {
            grid: 'G', dca: 'D', momentum: 'M', 'mean-reversion': 'R',
            arbitrage: 'A', funding: 'F', breakout: 'B', scalping: 'S', rebalancing: 'RB'
        };
        return icons[type] || '?';
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Algorithmic Trading Strategies</h3>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">' +
            this.items.map(item =>
                '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">' +
                '<div style="display:flex;gap:10px;align-items:center;">' +
                '<div style="width:40px;height:40px;background:linear-gradient(135deg,#00ff88,#00aaff);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#000;">' + this.getTypeIcon(item.type) + '</div>' +
                '<div><strong>' + item.name + '</strong><br><span style="color:#888;font-size:11px;">' + item.type.toUpperCase() + '</span></div>' +
                '</div>' +
                '<span style="background:' + this.getRiskColor(item.risk) + ';color:#000;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;">' + item.risk.toUpperCase() + '</span>' +
                '</div>' +
                '<div style="background:rgba(0,0,0,0.2);padding:10px;border-radius:8px;margin-bottom:12px;text-align:center;">' +
                '<div style="color:#00ff88;font-size:28px;font-weight:bold;">' + item.apy + '%</div>' +
                '<div style="color:#888;font-size:11px;">Expected APY</div>' +
                '</div>' +
                '<div style="font-size:12px;color:#888;margin-bottom:12px;">' +
                (item.asset ? '<div>Asset: <span style="color:#fff;">' + item.asset + '</span></div>' : '') +
                (item.assets ? '<div>Assets: <span style="color:#fff;">' + (Array.isArray(item.assets) ? item.assets.join(', ') : item.assets) + '</span></div>' : '') +
                (item.gridLevels ? '<div>Grid Levels: <span style="color:#fff;">' + item.gridLevels + '</span></div>' : '') +
                (item.priceRange ? '<div>Range: <span style="color:#fff;">' + item.priceRange + '</span></div>' : '') +
                (item.frequency ? '<div>Frequency: <span style="color:#fff;">' + item.frequency + '</span></div>' : '') +
                (item.chains ? '<div>Chains: <span style="color:#fff;">' + item.chains.join(', ') + '</span></div>' : '') +
                '<div>Min Investment: <span style="color:#fff;">$' + item.minInvest + '</span></div>' +
                '</div>' +
                '<button onclick="AlgoStrategiesModule.quickInvest(\'' + item.id + '\')" style="padding:10px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;width:100%;">Start Bot</button>' +
                '</div>'
            ).join('') +
            '</div>' +
            (this.positions.length > 0 ? this.renderPositions() : '');
    },

    renderPositions() {
        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Active Bots (' + this.positions.length + ')</h4>' +
            '<div style="display:grid;gap:8px;">' +
            this.positions.map(pos => {
                const perf = this.getBotPerformance(pos.id);
                const isPositive = parseFloat(perf.pnl) >= 0;
                const isRunning = pos.status === 'running';
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<div style="display:flex;gap:10px;align-items:center;">' +
                    '<div style="width:36px;height:36px;background:' + (isRunning ? 'linear-gradient(135deg,#00ff88,#00aaff)' : 'rgba(255,255,255,0.1)') + ';border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:' + (isRunning ? '#000' : '#888') + ';font-size:12px;">' + this.getTypeIcon(pos.type) + '</div>' +
                    '<div><strong>' + pos.strategyName + '</strong><br>' +
                    '<span style="color:#888;font-size:11px;">$' + pos.allocated.toFixed(2) + ' | ' + perf.daysRunning + ' days | ' + perf.trades + ' trades</span></div>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                    '<span style="font-size:16px;font-weight:bold;">$' + perf.currentValue + '</span><br>' +
                    '<span style="color:' + (isPositive ? '#00ff88' : '#ff4466') + ';font-size:12px;">' + (isPositive ? '+' : '') + perf.pnl + ' (' + (isPositive ? '+' : '') + perf.pnlPct + '%)</span>' +
                    '</div></div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<div style="display:flex;gap:12px;font-size:11px;color:#888;">' +
                    '<span>Win Rate: <span style="color:#fff;">' + perf.winRate + '%</span></span>' +
                    '<span>Status: <span style="color:' + (isRunning ? '#00ff88' : '#ffaa00') + ';">' + perf.status.toUpperCase() + '</span></span>' +
                    '</div>' +
                    '<div style="display:flex;gap:6px;">' +
                    (isRunning ?
                        '<button onclick="AlgoStrategiesModule.quickPause(\'' + pos.id + '\')" style="padding:4px 10px;background:#ffaa00;border:none;border-radius:4px;color:#000;font-size:11px;cursor:pointer;">Pause</button>' :
                        '<button onclick="AlgoStrategiesModule.quickResume(\'' + pos.id + '\')" style="padding:4px 10px;background:#00ff88;border:none;border-radius:4px;color:#000;font-size:11px;cursor:pointer;">Resume</button>'
                    ) +
                    '<button onclick="AlgoStrategiesModule.quickStop(\'' + pos.id + '\')" style="padding:4px 10px;background:#ff4466;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">Stop</button>' +
                    '</div></div>' +
                    '<div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;font-family:monospace;font-size:10px;color:#888;max-height:60px;overflow-y:auto;">' +
                    this.getLogs(pos.id, 3).map(log => '<div>' + log.time + ' - ' + log.message + '</div>').join('') +
                    '</div></div>';
            }).join('') +
            '</div>';
    },

    quickInvest(itemId) {
        const item = this.items.find(i => i.id === itemId);
        const amount = SafeOps.promptNumber('Bot allocation USD (min $' + item.minInvest + '):', 0, item.minInvest);
        if (!amount) return;

        const result = this.invest(itemId, amount);
        alert(result.success ? item.name + ' started with $' + amount + '!' : result.error);
        if (result.success) this.render('algo-strategies-container');
    },

    quickPause(posId) {
        const result = this.pauseBot(posId);
        alert(result.success ? 'Bot paused' : result.error);
        this.render('algo-strategies-container');
    },

    quickResume(posId) {
        const result = this.resumeBot(posId);
        alert(result.success ? 'Bot resumed' : result.error);
        this.render('algo-strategies-container');
    },

    quickStop(posId) {
        if (!confirm('Stop bot and withdraw funds?')) return;
        const result = this.withdraw(posId);
        alert(result.success ? 'Bot stopped. Return: $' + result.totalReturn + ' (PnL: $' + result.pnl + ', ' + result.trades + ' trades, ' + result.winRate + '% win rate)' : result.error);
        this.render('algo-strategies-container');
    },

    // =============================================
    // AUTO-TRADING SYSTEM
    // =============================================
    autoTradingEnabled: false,
    autoTradingStrategies: [],

    toggleAutoTrading() {
        this.autoTradingEnabled = !this.autoTradingEnabled;
        localStorage.setItem('obelisk_auto_trading', this.autoTradingEnabled ? 'true' : 'false');
        if (this.autoTradingEnabled) {
            this.startAutoTrading();
        } else {
            this.stopAutoTrading();
        }
    },

    startAutoTrading() {
        const savedStrategies = SafeOps.getStorage('obelisk_auto_strategies', ['micro-dca-5', 'micro-grid-10']);
        this.autoTradingStrategies = savedStrategies;
        console.log('[AutoTrading] Started with strategies:', savedStrategies);
        // Auto-invest in selected strategies if not already running
        savedStrategies.forEach(stratId => {
            const alreadyRunning = this.positions.find(p => p.strategyId === stratId && p.status === 'running');
            if (!alreadyRunning) {
                const strat = this.items.find(i => i.id === stratId);
                if (strat) {
                    this.invest(stratId, strat.minInvest);
                }
            }
        });
    },

    stopAutoTrading() {
        console.log('[AutoTrading] Stopped');
    },

    setAutoStrategies(strategyIds) {
        this.autoTradingStrategies = strategyIds;
        SafeOps.setStorage('obelisk_auto_strategies', strategyIds);
    },

    renderAutoTradingPanel() {
        const enabled = this.autoTradingEnabled;
        const microStrategies = this.items.filter(s => s.minInvest <= 20);
        return `
            <div style="background:linear-gradient(145deg,#1a1a2e,#0d0d1a);border:1px solid ${enabled ? '#00ff88' : '#333'};border-radius:16px;padding:20px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="color:#fff;margin:0;">🤖 Auto-Trading</h3>
                    <label style="position:relative;display:inline-block;width:50px;height:26px;cursor:pointer;">
                        <input type="checkbox" ${enabled ? 'checked' : ''} onchange="AlgoStrategiesModule.toggleAutoTrading()" style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;top:0;left:0;right:0;bottom:0;background:${enabled ? '#00ff88' : '#333'};border-radius:13px;transition:0.3s;">
                            <span style="position:absolute;height:20px;width:20px;left:${enabled ? '27px' : '3px'};bottom:3px;background:#fff;border-radius:50%;transition:0.3s;"></span>
                        </span>
                    </label>
                </div>
                <p style="color:#888;font-size:0.85rem;margin-bottom:12px;">Activez le trading automatique avec des stratégies micro-capital ($5-$20) sur les L2 à faibles frais.</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
                    ${microStrategies.map(s => `
                        <div style="background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.2);border-radius:8px;padding:10px;font-size:0.8rem;">
                            <div style="color:#fff;font-weight:600;">${s.name}</div>
                            <div style="color:#888;">Min: $${s.minInvest} | APY: ${s.apy}% | ${s.chain || 'Multi'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => AlgoStrategiesModule.init());
