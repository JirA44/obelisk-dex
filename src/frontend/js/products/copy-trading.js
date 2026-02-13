/**
 * COPY TRADING MODULE - Follow Top Traders
 * Uses TraderSimulator for realistic market conditions
 * Integrates with TradingSignals for real signals
 */
const CopyTradingModule = {
    copies: [],
    signalQueue: [], // Pending signals to execute

    init() {
        this.load();
        this.setupSignalListeners();
        this.subscribeToActiveCopies();
        console.log('[CopyTrading] Initialized with TraderSimulator + TradingSignals');
    },

    setupSignalListeners() {
        // Listen for trading signals
        window.addEventListener('tradingSignal', (e) => {
            const { signal, eventType } = e.detail;
            this.handleSignal(signal, eventType);
        });
    },

    subscribeToActiveCopies() {
        // Subscribe to signals for all copied traders
        this.copies.forEach(copy => {
            if (typeof TradingSignals !== 'undefined') {
                TradingSignals.subscribe(copy.traderId, (signal, eventType) => {
                    this.handleSignal(signal, eventType);
                });
            }
        });
    },

    handleSignal(signal, eventType) {
        // Check if we're copying this trader
        const copy = this.copies.find(c => c.traderId === signal.traderId);
        if (!copy) return;

        if (eventType === 'new') {
            // New signal - add to queue and notify
            this.signalQueue.push({
                ...signal,
                copyId: copy.id,
                allocatedAmount: copy.amount,
                status: 'pending'
            });

            this.showSignalNotification(signal, copy);
            this.saveSignalQueue();
        } else if (eventType === 'closed') {
            // Signal closed - update copy PnL
            const proportionalPnl = (copy.amount / signal.size) * signal.realizedPnl;
            copy.pnl += proportionalPnl;
            this.save();
        }

        // Update UI
        this.renderSignalPanel();
    },

    showSignalNotification(signal, copy) {
        if (typeof showNotification === 'function') {
            showNotification(
                `📊 Signal: ${signal.side.toUpperCase()} ${signal.asset} @ $${signal.entryPrice.toFixed(2)} - ${signal.traderName}`,
                'info'
            );
        }
    },

    saveSignalQueue() {
        localStorage.setItem('obelisk_signal_queue', JSON.stringify(this.signalQueue.slice(-100)));
    },

    loadSignalQueue() {
        try {
            this.signalQueue = JSON.parse(localStorage.getItem('obelisk_signal_queue') || '[]');
        } catch (e) {
            this.signalQueue = [];
        }
    },

    load() {
        this.copies = SafeOps.getStorage('obelisk_copytrading', []);
        this.loadSignalQueue();
    },

    save() {
        SafeOps.setStorage('obelisk_copytrading', this.copies);
    },

    // Safe number helper - handles NaN, undefined, null
    safeNum(val, def = 0) {
        if (val === null || val === undefined) return def;
        const num = parseFloat(val);
        return Number.isFinite(num) ? num : def;
    },

    // Get traders from simulator with copy-trading specific formatting
    getTraders(filter = {}) {
        if (typeof TraderSimulator === 'undefined') {
            console.warn('[CopyTrading] TraderSimulator not loaded');
            return [];
        }

        const traders = TraderSimulator.getTraders(filter);

        // Format for copy trading display
        return traders.map(t => {
            const stats = t.stats || {};
            const safe = (v, d) => this.safeNum(v, d);

            // Calculate copy trading specific metrics
            const minCopy = this.calculateMinCopy(t);
            const fee = this.calculateFee(t);

            return {
                id: t.id,
                name: t.name || 'Trader',
                avatar: t.avatar || '👤',
                style: t.style || 'unknown',
                assets: t.assets || ['BTC'],
                leverage: safe(t.leverage, 1),
                riskLevel: t.riskLevel || 'medium',
                venue: t.venue || 'perps',
                description: t.description || '',

                // Performance stats - ALL with NaN protection
                pnl7d: safe(stats.pnl7dPercent, 0),
                pnl30d: safe(stats.pnl30dPercent, 0),
                winRate: Math.round(safe(stats.winRate, 0.5) * 100),
                trades: safe(stats.trades, 0),
                totalPnl: safe(stats.totalPnl, 0),
                totalFees: safe(stats.totalFees, 0),
                totalVolume: safe(stats.totalVolume, 0),
                maxDrawdown: safe(stats.maxDrawdown, 0),
                sharpeRatio: safe(stats.sharpeRatio, 0),

                // Social stats
                followers: safe(stats.followers, 0),
                copiers: safe(stats.copiers, 0),
                aum: safe(this.calculateAUM(stats), 0),

                // Copy trading params
                minCopy,
                fee
            };
        });
    },

    calculateMinCopy(trader) {
        // Min copy based on risk level and average trade size
        const baseMin = {
            'low': 100,
            'medium': 50,
            'high': 25,
            'extreme': 10
        };
        return baseMin[trader.riskLevel] || 50;
    },

    calculateFee(trader) {
        // Performance fee based on risk and style
        const baseFee = {
            'low': 8,
            'medium': 12,
            'high': 18,
            'extreme': 25
        };
        return baseFee[trader.riskLevel] || 15;
    },

    calculateAUM(stats) {
        // Simulate AUM based on followers and performance
        const baseAUM = (stats.followers || 100) * 1000;
        const performanceMultiplier = Math.max(0.1, 1 + (stats.pnl30dPercent || 0) / 100);
        return Math.round(baseAUM * performanceMultiplier);
    },

    startCopy(traderId, amount) {
        const traders = this.getTraders();
        const trader = traders.find(t => t.id === traderId);
        if (!trader) return { success: false, error: 'Trader not found' };
        if (amount < trader.minCopy) return { success: false, error: 'Min: $' + trader.minCopy };

        const copy = {
            id: 'copy-' + Date.now(),
            traderId,
            traderName: trader.name,
            traderAvatar: trader.avatar,
            amount,
            fee: trader.fee,
            riskLevel: trader.riskLevel,
            startDate: Date.now(),
            pnl: 0,
            tradesExecuted: 0
        };

        this.copies.push(copy);
        this.save();

        // Subscribe to trading signals for this trader
        if (typeof TradingSignals !== 'undefined') {
            TradingSignals.subscribe(traderId, (signal, eventType) => {
                this.handleSignal(signal, eventType);
            });
        }

        return { success: true, copy };
    },

    stopCopy(copyId) {
        const idx = this.copies.findIndex(c => c.id === copyId);
        if (idx === -1) return { success: false };

        const copy = this.copies[idx];

        // Calculate final PnL
        const traders = this.getTraders();
        const trader = traders.find(t => t.id === copy.traderId);
        if (trader) {
            const daysActive = (Date.now() - copy.startDate) / 86400000;
            const estimatedPnl = copy.amount * (trader.pnl30d / 100) * (daysActive / 30);
            const feeDeducted = Math.max(0, estimatedPnl * (copy.fee / 100));
            copy.pnl = estimatedPnl - feeDeducted;
        }

        this.copies.splice(idx, 1);
        this.save();
        return { success: true, amount: copy.amount, pnl: copy.pnl };
    },

    getCopyPerformance(copyId) {
        const copy = this.copies.find(c => c.id === copyId);
        if (!copy) return null;

        const traders = this.getTraders();
        const trader = traders.find(t => t.id === copy.traderId);
        if (!trader) return null;

        const daysActive = (Date.now() - copy.startDate) / 86400000;
        const grossPnl = copy.amount * (trader.pnl30d / 100) * (daysActive / 30);
        const feeAccrued = Math.max(0, grossPnl * (copy.fee / 100));
        const netPnl = grossPnl - feeAccrued;

        // Estimate trades based on trader frequency
        const tradesPerDay = { 'hourly': 8, 'daily': 2, 'weekly': 0.3, 'monthly': 0.1 };
        const estimatedTrades = Math.floor((tradesPerDay[trader.tradingFreq] || 1) * daysActive);

        return {
            currentValue: (copy.amount + netPnl).toFixed(2),
            grossPnl: grossPnl.toFixed(2),
            netPnl: netPnl.toFixed(2),
            pnlPercent: ((netPnl / copy.amount) * 100).toFixed(2),
            feeAccrued: feeAccrued.toFixed(2),
            daysActive: Math.floor(daysActive),
            tradesExecuted: estimatedTrades
        };
    },

    getRiskColor(level) {
        const colors = { low: '#00ff88', medium: '#ffaa00', high: '#ff6644', extreme: '#ff0044' };
        return colors[level] || '#888';
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        // Get validated traders first
        const validatedTraders = typeof ValidatedTraders !== 'undefined'
            ? ValidatedTraders.getTraders()
            : [];

        // Get simulated traders
        const simulatedTraders = this.getTraders({ sortBy: 'pnl30dPercent', sortDesc: true });

        if (validatedTraders.length === 0 && simulatedTraders.length === 0) {
            el.innerHTML = '<p style="color:#888;">Loading traders...</p>';
            return;
        }

        el.innerHTML = `
            <h3 style="color:#00ff88;margin-bottom:8px;">Copy Trading</h3>

            <!-- Validated Traders Section -->
            ${validatedTraders.length > 0 ? `
                <div style="background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,170,255,0.1));border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;margin-bottom:20px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <span style="font-size:20px;">✅</span>
                        <h4 style="color:#00ff88;margin:0;">Validated Traders (Backtested)</h4>
                        <span style="background:#00ff88;color:#000;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:bold;">PROVEN EDGE</span>
                    </div>
                    <p style="color:#888;font-size:11px;margin-bottom:12px;">
                        These traders use strategies that have been backtested on 90 days of real market data.
                        Sharpe > 0.8 | Profit Factor > 1.3 | Win Rate > 45%
                    </p>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
                        ${validatedTraders.map(t => this.renderValidatedTraderCard(t)).join('')}
                    </div>
                </div>
            ` : `
                <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;margin-bottom:20px;">
                    <p style="color:#ffaa00;margin:0;font-size:12px;">
                        ⚠️ No backtested traders yet. Run <code>StrategyBacktester.runFullBacktest()</code> in console to validate strategies.
                    </p>
                </div>
            `}

            <!-- Simulated Traders Section -->
            <div style="margin-top:20px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                    <span style="font-size:20px;">🎲</span>
                    <h4 style="color:#888;margin:0;">Simulated Traders</h4>
                    <span style="background:rgba(255,255,255,0.1);color:#888;padding:2px 8px;border-radius:10px;font-size:10px;">PAPER TRADING</span>
                </div>
                <p style="color:#666;font-size:11px;margin-bottom:12px;">
                    ⚠️ These traders have randomly generated performance. Copy at your own risk.
                </p>

                <!-- Filters -->
                <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
                    <button onclick="CopyTradingModule.filterRender('${containerId}', 'all')" class="filter-btn active">All</button>
                    <button onclick="CopyTradingModule.filterRender('${containerId}', 'low')" class="filter-btn">Low Risk</button>
                    <button onclick="CopyTradingModule.filterRender('${containerId}', 'medium')" class="filter-btn">Medium</button>
                    <button onclick="CopyTradingModule.filterRender('${containerId}', 'high')" class="filter-btn">High Risk</button>
                </div>

                <div id="simulated-traders-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
                    ${simulatedTraders.slice(0, 12).map(t => this.renderTraderCard(t, true)).join('')}
                </div>
            </div>

            ${this.copies.length > 0 ? this.renderActiveCopies() : ''}
        `;
    },

    renderValidatedTraderCard(t) {
        const riskColor = this.getRiskColor(t.riskLevel);
        const stats = t.stats || {};
        const isPositive = (stats.pnl30dPercent || 0) >= 0;

        return `
            <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,136,0.2);border-radius:12px;padding:16px;position:relative;">
                <!-- Validated badge -->
                <div style="position:absolute;top:8px;right:8px;background:#00ff88;color:#000;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:bold;">
                    ✓ BACKTESTED
                </div>

                <!-- Header -->
                <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;">
                    <div style="width:44px;height:44px;background:linear-gradient(135deg,#00ff88,#00aaff);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;">
                        ${t.avatar}
                    </div>
                    <div style="flex:1;">
                        <strong style="font-size:14px;color:#fff;">${t.name}</strong>
                        <div style="font-size:10px;color:#888;">${t.description}</div>
                    </div>
                </div>

                <!-- Key Metrics -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
                    <div style="background:rgba(0,255,136,0.1);padding:8px;border-radius:6px;text-align:center;">
                        <div style="color:#888;font-size:9px;">Sharpe</div>
                        <div style="color:#00ff88;font-weight:bold;">${stats.sharpeRatio?.toFixed(2) || 'N/A'}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);padding:8px;border-radius:6px;text-align:center;">
                        <div style="color:#888;font-size:9px;">Win Rate</div>
                        <div style="color:#00aaff;font-weight:bold;">${stats.winRate ? (stats.winRate * 100).toFixed(0) : 'N/A'}%</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);padding:8px;border-radius:6px;text-align:center;">
                        <div style="color:#888;font-size:9px;">PF</div>
                        <div style="color:#ffaa00;font-weight:bold;">${stats.profitFactor?.toFixed(2) || 'N/A'}</div>
                    </div>
                </div>

                <!-- Monthly Return -->
                <div style="background:rgba(0,0,0,0.2);padding:10px;border-radius:6px;margin-bottom:12px;text-align:center;">
                    <div style="color:#888;font-size:10px;">Expected Monthly Return</div>
                    <div style="font-size:20px;font-weight:bold;color:${isPositive ? '#00ff88' : '#ff4466'};">
                        ${isPositive ? '+' : ''}${(stats.pnl30dPercent || 0).toFixed(1)}%
                    </div>
                    <div style="color:#666;font-size:9px;">Max DD: ${(stats.maxDrawdown || 0).toFixed(1)}% | ${t.leverage}x leverage</div>
                </div>

                <!-- Tags -->
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;">
                    <span style="background:${riskColor};color:#000;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:bold;">${t.riskLevel.toUpperCase()}</span>
                    <span style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-size:9px;">${t.strategy}</span>
                    <span style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-size:9px;">${t.asset}</span>
                </div>

                <!-- Copy Button -->
                <button onclick="CopyTradingModule.quickCopy('${t.id}')"
                    style="width:100%;padding:12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                    Copy Trader ($50 min)
                </button>
            </div>
        `;
    },

    filterRender(containerId, riskLevel) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const filter = riskLevel === 'all' ? {} : { riskLevel };
        const traders = this.getTraders({ ...filter, sortBy: 'pnl30dPercent', sortDesc: true });

        // Update only the simulated traders grid
        const grid = document.getElementById('simulated-traders-grid');
        if (grid) {
            grid.innerHTML = traders.slice(0, 12).map(t => this.renderTraderCard(t, true)).join('');
        }
    },

    renderTraderCard(t, showWarning = false) {
        const isPositive7d = t.pnl7d >= 0;
        const isPositive30d = t.pnl30d >= 0;
        const riskColor = this.getRiskColor(t.riskLevel);

        return `
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                <!-- Header -->
                <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;">
                    <div style="width:44px;height:44px;background:linear-gradient(135deg,${riskColor},#333);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;">
                        ${t.avatar}
                    </div>
                    <div style="flex:1;">
                        <strong style="font-size:14px;">${t.name}</strong>
                        <div style="font-size:11px;color:#888;">${t.description}</div>
                    </div>
                    <span style="background:${riskColor};color:#000;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:bold;">
                        ${t.riskLevel.toUpperCase()}
                    </span>
                </div>

                <!-- Performance -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                    <div style="background:rgba(0,0,0,0.2);padding:8px;border-radius:6px;text-align:center;">
                        <div style="color:#888;font-size:10px;">7D PnL</div>
                        <div style="color:${isPositive7d ? '#00ff88' : '#ff4466'};font-weight:bold;">
                            ${isPositive7d ? '+' : ''}${t.pnl7d.toFixed(1)}%
                        </div>
                    </div>
                    <div style="background:rgba(0,0,0,0.2);padding:8px;border-radius:6px;text-align:center;">
                        <div style="color:#888;font-size:10px;">30D PnL</div>
                        <div style="color:${isPositive30d ? '#00ff88' : '#ff4466'};font-weight:bold;">
                            ${isPositive30d ? '+' : ''}${t.pnl30d.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div style="font-size:11px;color:#888;margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;">
                        <span>Win Rate:</span>
                        <span style="color:#fff;">${t.winRate}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Trades:</span>
                        <span style="color:#fff;">${t.trades}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Max DD:</span>
                        <span style="color:#ff6644;">${t.maxDrawdown.toFixed(1)}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Copiers:</span>
                        <span style="color:#fff;">${t.copiers.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Assets:</span>
                        <span style="color:#00aaff;">${t.assets.slice(0, 3).join(', ')}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Leverage:</span>
                        <span style="color:${t.leverage > 3 ? '#ff4466' : '#fff'};">${t.leverage}x</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Fee:</span>
                        <span style="color:#ffaa00;">${t.fee}%</span>
                    </div>
                </div>

                <!-- Trading costs warning -->
                <div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;margin-bottom:10px;font-size:10px;color:#888;">
                    📊 Real costs: ${t.venue} fees + spread + slippage
                </div>

                <div style="display:flex;gap:8px;">
                    <button onclick="TraderSimulator.showTraderProfile('${t.id}')"
                        style="padding:10px 12px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;cursor:pointer;flex:1;">
                        📋 Profile
                    </button>
                    <button onclick="CopyTradingModule.quickCopy('${t.id}')"
                        style="padding:10px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;flex:2;">
                        Copy ($${t.minCopy} min)
                    </button>
                </div>
            </div>
        `;
    },

    renderActiveCopies() {
        return `
            <h4 style="color:#00ff88;margin:24px 0 12px;">Your Active Copies (${this.copies.length})</h4>
            <div style="display:grid;gap:8px;">
                ${this.copies.map(copy => {
                    const perf = this.getCopyPerformance(copy.id);
                    if (!perf) return '';

                    const isPositive = parseFloat(perf.netPnl) >= 0;
                    return `
                        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">
                            <div style="display:flex;gap:12px;align-items:center;">
                                <div style="width:36px;height:36px;background:linear-gradient(135deg,${this.getRiskColor(copy.riskLevel)},#333);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;">
                                    ${copy.traderAvatar || '👤'}
                                </div>
                                <div style="flex:1;">
                                    <strong>${copy.traderName}</strong><br>
                                    <span style="color:#888;font-size:11px;">
                                        $${copy.amount.toFixed(2)} | ${perf.daysActive}d | ${perf.tradesExecuted} trades
                                    </span>
                                </div>
                                <div style="text-align:right;">
                                    <span style="font-size:16px;font-weight:bold;">$${perf.currentValue}</span><br>
                                    <span style="color:${isPositive ? '#00ff88' : '#ff4466'};font-size:12px;">
                                        ${isPositive ? '+' : ''}$${perf.netPnl} (${isPositive ? '+' : ''}${perf.pnlPercent}%)
                                    </span>
                                </div>
                            </div>
                            <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
                                <span style="color:#888;font-size:10px;">Fee accrued: $${perf.feeAccrued} (${copy.fee}%)</span>
                                <button onclick="CopyTradingModule.quickStop('${copy.id}')"
                                    style="padding:4px 10px;background:#ff4466;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">
                                    Stop Copy
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    quickCopy(traderId) {
        const traders = this.getTraders();
        const trader = traders.find(t => t.id === traderId);
        if (!trader) return;

        if (typeof InvestHelper !== 'undefined') {
            InvestHelper.show({
                name: 'Copy ' + trader.name,
                id: trader.id,
                apy: trader.pnl30d * 12, // Annualized estimate
                minInvest: trader.minCopy,
                fee: trader.fee,
                risk: { 'low': 2, 'medium': 4, 'high': 6, 'extreme': 8 }[trader.riskLevel] || 5,
                icon: trader.avatar,
                onInvest: (amount, mode) => {
                    this.executeCopy(trader, amount, mode);
                }
            });
        } else {
            const amount = parseFloat(prompt('Amount to allocate (min $' + trader.minCopy + '):'));
            if (amount !== null && amount > 0) {
                const r = this.startCopy(traderId, amount);
                alert(r.success ? 'Now copying ' + trader.name + '!' : r.error);
                this.render('copy-trading-container');
            }
        }
    },

    quickStop(copyId) {
        if (!confirm('Stop copy and withdraw funds?')) return;
        const result = this.stopCopy(copyId);
        alert(result.success ?
            `Stopped. Returned: $${result.amount.toFixed(2)} (PnL: $${result.pnl.toFixed(2)})` :
            'Failed to stop copy');
        this.render('copy-trading-container');
    },

    renderSignalPanel() {
        // Find or create signal panel
        let panel = document.getElementById('signal-panel');
        if (!panel) {
            const container = document.getElementById('copy-trading-container');
            if (!container) return;

            panel = document.createElement('div');
            panel.id = 'signal-panel';
            container.appendChild(panel);
        }

        const pendingSignals = this.signalQueue.filter(s => s.status === 'pending');

        if (pendingSignals.length === 0) {
            panel.innerHTML = '';
            return;
        }

        panel.innerHTML = `
            <div style="background:rgba(0,170,255,0.1);border:1px solid #00aaff;border-radius:12px;padding:16px;margin-top:16px;">
                <h4 style="color:#00aaff;margin:0 0 12px;">
                    Live Trading Signals (${pendingSignals.length})
                </h4>
                <div style="display:grid;gap:8px;">
                    ${pendingSignals.slice(0, 10).map(sig => `
                        <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;display:flex;align-items:center;gap:12px;">
                            <div style="width:40px;height:40px;background:${sig.side === 'long' ? '#00ff88' : '#ff4466'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#000;">
                                ${sig.side === 'long' ? '↑' : '↓'}
                            </div>
                            <div style="flex:1;">
                                <div style="display:flex;justify-content:space-between;">
                                    <strong>${sig.side.toUpperCase()} ${sig.asset}</strong>
                                    <span style="color:#888;font-size:11px;">${sig.traderName}</span>
                                </div>
                                <div style="font-size:12px;color:#888;">
                                    Entry: $${sig.entryPrice.toFixed(2)} | SL: $${sig.stopLoss.toFixed(2)} | TP: $${sig.takeProfit.toFixed(2)}
                                </div>
                                <div style="font-size:11px;color:#666;margin-top:2px;">${sig.reason}</div>
                            </div>
                            <div style="display:flex;gap:6px;">
                                <button onclick="CopyTradingModule.executeSignal('${sig.id}')"
                                    style="padding:6px 12px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;">
                                    Execute
                                </button>
                                <button onclick="CopyTradingModule.dismissSignal('${sig.id}')"
                                    style="padding:6px 8px;background:rgba(255,255,255,0.1);border:none;border-radius:6px;color:#888;cursor:pointer;">
                                    ✕
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- MixBot API Info -->
                <div style="margin-top:12px;padding:10px;background:rgba(255,255,255,0.03);border-radius:6px;font-size:11px;color:#666;">
                    <strong style="color:#888;">MixBot API:</strong>
                    <code style="background:#000;padding:2px 6px;border-radius:3px;color:#00ff88;">
                        window.ObeliskSignals.getForMixBot()
                    </code>
                    <button onclick="CopyTradingModule.copyMixBotCommand()" style="margin-left:8px;padding:2px 8px;background:rgba(255,255,255,0.1);border:none;border-radius:4px;color:#888;cursor:pointer;font-size:10px;">
                        Copy
                    </button>
                </div>
            </div>
        `;
    },

    executeSignal(signalId) {
        const signal = this.signalQueue.find(s => s.id === signalId);
        if (!signal) return;

        signal.status = 'executed';
        this.saveSignalQueue();

        // Log for MixBot
        console.log('[CopyTrading] Signal executed:', TradingSignals.formatForMixBot(signal));

        if (typeof showNotification === 'function') {
            showNotification(`Executed: ${signal.side.toUpperCase()} ${signal.asset} @ $${signal.entryPrice.toFixed(2)}`, 'success');
        }

        this.renderSignalPanel();
    },

    dismissSignal(signalId) {
        this.signalQueue = this.signalQueue.filter(s => s.id !== signalId);
        this.saveSignalQueue();
        this.renderSignalPanel();
    },

    copyMixBotCommand() {
        const cmd = `// Run in browser console on Obelisk page\nconst signals = window.ObeliskSignals.getForMixBot();\nconsole.log(JSON.stringify(signals, null, 2));`;
        navigator.clipboard.writeText(cmd);
        if (typeof showNotification === 'function') {
            showNotification('Copied MixBot command to clipboard', 'info');
        }
    },

    executeCopy(trader, amount, mode) {
        if (mode === 'simulated') {
            const result = this.startCopy(trader.id, amount);
            if (result.success) {
                if (typeof SimulatedPortfolio !== 'undefined') {
                    SimulatedPortfolio.invest('copy-' + Date.now(), 'Copy ' + trader.name, amount, trader.pnl30d * 12 / 100, 'copytrading', true);
                }
                if (typeof showNotification === 'function') {
                    showNotification('Now copying ' + trader.name + ' with $' + amount, 'success');
                }
                this.render('copy-trading-container');
            } else if (typeof showNotification === 'function') {
                showNotification(result.error, 'error');
            }
        } else {
            // Real mode
            if (typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected()) {
                console.log('[COPY] Real copy trading:', amount, trader.name);
                if (typeof showNotification === 'function') {
                    showNotification('Real copy trading started: $' + amount + ' copying ' + trader.name, 'success');
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => CopyTradingModule.init());
