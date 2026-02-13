/**
 * SOCIAL TRADING MODULE - Obelisk DEX
 * Follow and copy trading strategies from top performers
 * Uses TraderSimulator for realistic market conditions
 */
const SocialTradingModule = {
    positions: [],

    init() {
        this.load();
        console.log('[SocialTrading] Initialized with TraderSimulator');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_social_trading', []);
    },

    save() {
        SafeOps.setStorage('obelisk_social_trading', this.positions);
    },

    // Get traders from simulator with social trading specific formatting
    getItems(filter = {}) {
        if (typeof TraderSimulator === 'undefined') {
            console.warn('[SocialTrading] TraderSimulator not loaded');
            return [];
        }

        const traders = TraderSimulator.getTraders(filter);

        // Format for social trading display
        return traders.map(t => {
            const stats = t.stats || {};

            return {
                id: t.id,
                name: t.name,
                avatar: t.avatar,
                style: t.style,
                assets: t.assets,
                leverage: t.leverage,
                riskLevel: t.riskLevel,
                venue: t.venue,
                description: t.description,
                tradingFreq: t.tradingFreq,

                // Performance
                pnl7d: stats.pnl7dPercent || 0,
                pnl30d: stats.pnl30dPercent || 0,
                winRate: Math.round((stats.winRate || 0.5) * 100),
                trades: stats.trades || 0,
                totalPnl: stats.totalPnl || 0,
                totalFees: stats.totalFees || 0,
                maxDrawdown: stats.maxDrawdown || 0,
                sharpeRatio: stats.sharpeRatio || 0,
                avgWin: stats.avgWin || 0,
                avgLoss: stats.avgLoss || 0,

                // Social
                followers: stats.followers || 0,
                copiers: stats.copiers || 0,
                aum: this.calculateAUM(stats, t.avgTradeSize),

                // Social trading params
                minFollow: this.calculateMinFollow(t),
                profitShare: this.calculateProfitShare(t)
            };
        });
    },

    calculateMinFollow(trader) {
        const baseMin = {
            'low': 250,
            'medium': 100,
            'high': 50,
            'extreme': 25
        };
        return baseMin[trader.riskLevel] || 100;
    },

    calculateProfitShare(trader) {
        // Higher risk = higher profit share potential
        const baseFee = {
            'low': 10,
            'medium': 15,
            'high': 20,
            'extreme': 25
        };
        return baseFee[trader.riskLevel] || 15;
    },

    calculateAUM(stats, avgTradeSize) {
        const followers = stats.followers || 100;
        const copiers = stats.copiers || 10;
        return Math.round((followers * 500) + (copiers * avgTradeSize * 10));
    },

    invest(itemId, amount) {
        const items = this.getItems();
        const item = items.find(i => i.id === itemId);
        if (!item) return { success: false, error: 'Trader not found' };
        if (amount < item.minFollow) return { success: false, error: 'Min allocation: $' + item.minFollow };

        // Check if already following this trader
        const existing = this.positions.find(p => p.traderId === itemId);
        if (existing) {
            existing.allocated += amount;
            existing.totalInvested += amount;
            this.save();
            return { success: true, position: existing, added: amount };
        }

        const position = {
            id: 'social-' + Date.now(),
            traderId: itemId,
            traderName: item.name,
            avatar: item.avatar,
            allocated: amount,
            totalInvested: amount,
            profitShare: item.profitShare,
            strategy: item.description,
            riskLevel: item.riskLevel,
            startDate: Date.now(),
            realizedPnl: 0,
            unrealizedPnl: 0,
            tradesExecuted: 0,
            lastSync: Date.now()
        };

        this.positions.push(position);
        this.save();

        if (typeof SimulatedPortfolio !== 'undefined') {
            const expectedReturn = item.pnl30d * 12 / 100; // Annualized
            SimulatedPortfolio.invest(position.id, 'Follow: ' + item.name, amount, expectedReturn, 'social-trading', true);
        }

        return { success: true, position, profitShare: item.profitShare };
    },

    withdraw(posId, amount = null) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const pos = this.positions[idx];
        const withdrawAmount = amount || pos.allocated;

        if (withdrawAmount > pos.allocated) return { success: false, error: 'Insufficient balance' };

        // Calculate PnL
        const items = this.getItems();
        const item = items.find(i => i.id === pos.traderId);
        const daysFollowing = (Date.now() - pos.startDate) / 86400000;
        const estimatedPnl = item ? pos.allocated * (item.pnl30d / 100) * (daysFollowing / 30) : 0;
        const profitShareDeducted = Math.max(0, estimatedPnl * (pos.profitShare / 100));
        const netPnl = estimatedPnl - profitShareDeducted;

        if (withdrawAmount >= pos.allocated) {
            this.positions.splice(idx, 1);
        } else {
            pos.allocated -= withdrawAmount;
            const pnlRatio = withdrawAmount / (pos.allocated + withdrawAmount);
            pos.realizedPnl += netPnl * pnlRatio;
        }
        this.save();

        return {
            success: true,
            withdrawn: withdrawAmount.toFixed(2),
            pnl: netPnl.toFixed(2),
            profitSharePaid: profitShareDeducted.toFixed(2)
        };
    },

    adjustAllocation(posId, newAmount) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };

        const items = this.getItems();
        const item = items.find(i => i.id === pos.traderId);
        if (!item) return { success: false, error: 'Trader not found' };
        if (newAmount < item.minFollow) return { success: false, error: 'Min allocation: $' + item.minFollow };

        const diff = newAmount - pos.allocated;
        pos.allocated = newAmount;
        if (diff > 0) pos.totalInvested += diff;
        this.save();

        return { success: true, newAllocation: newAmount, change: diff };
    },

    getTraderStats(traderId) {
        const items = this.getItems();
        const item = items.find(i => i.id === traderId);
        if (!item) return null;

        return {
            sharpeRatio: item.sharpeRatio.toFixed(2),
            maxDrawdown: item.maxDrawdown.toFixed(1) + '%',
            avgWin: '$' + item.avgWin.toFixed(2),
            avgLoss: '$' + Math.abs(item.avgLoss).toFixed(2),
            winLossRatio: item.avgLoss !== 0 ? (Math.abs(item.avgWin / item.avgLoss)).toFixed(2) : 'N/A',
            tradingFreq: item.tradingFreq,
            totalFees: '$' + item.totalFees.toFixed(2),
            venue: item.venue
        };
    },

    getPositionPerformance(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const items = this.getItems();
        const item = items.find(i => i.id === pos.traderId);
        if (!item) return null;

        const daysFollowing = (Date.now() - pos.startDate) / 86400000;
        const estimatedPnl = pos.allocated * (item.pnl30d / 100) * (daysFollowing / 30);
        const profitShare = Math.max(0, estimatedPnl * (pos.profitShare / 100));
        const netPnl = estimatedPnl - profitShare;
        const currentValue = pos.allocated + netPnl;

        // Estimate trades based on trader frequency
        const tradesPerDay = { 'hourly': 8, 'daily': 2, 'weekly': 0.3, 'monthly': 0.1 };
        const estimatedTrades = Math.floor((tradesPerDay[item.tradingFreq] || 1) * daysFollowing);

        return {
            currentValue: currentValue.toFixed(2),
            pnl: netPnl.toFixed(2),
            pnlPct: ((netPnl / pos.allocated) * 100).toFixed(2),
            profitShareAccrued: profitShare.toFixed(2),
            daysFollowing: Math.floor(daysFollowing),
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

        const items = this.getItems({ sortBy: 'pnl30dPercent', sortDesc: true });

        if (items.length === 0) {
            el.innerHTML = '<p style="color:#888;">Loading traders...</p>';
            return;
        }

        el.innerHTML = `
            <h3 style="color:#00ff88;margin-bottom:8px;">Social Trading - Top Performers</h3>
            <p style="color:#888;font-size:12px;margin-bottom:16px;">
                ${items.length} traders with realistic conditions (spreads, fees, slippage, funding)
            </p>

            <!-- Filters -->
            <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
                <button onclick="SocialTradingModule.filterRender('${containerId}', 'all')" class="filter-btn active">All</button>
                <button onclick="SocialTradingModule.filterRender('${containerId}', 'low')" class="filter-btn">Conservative</button>
                <button onclick="SocialTradingModule.filterRender('${containerId}', 'medium')" class="filter-btn">Moderate</button>
                <button onclick="SocialTradingModule.filterRender('${containerId}', 'high')" class="filter-btn">Aggressive</button>
                <button onclick="SocialTradingModule.filterRender('${containerId}', 'extreme')" class="filter-btn">Degen</button>
            </div>

            <!-- Leaderboard -->
            <div style="background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.2);border-radius:8px;padding:12px;margin-bottom:16px;">
                <div style="font-weight:bold;margin-bottom:8px;">🏆 Top 5 This Month</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    ${items.slice(0, 5).map((t, i) => `
                        <span style="background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px;font-size:11px;">
                            ${['🥇','🥈','🥉','4️⃣','5️⃣'][i]} ${t.name}
                            <span style="color:${t.pnl30d >= 0 ? '#00ff88' : '#ff4466'};">
                                ${t.pnl30d >= 0 ? '+' : ''}${t.pnl30d.toFixed(1)}%
                            </span>
                        </span>
                    `).join('')}
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;">
                ${items.slice(0, 24).map(item => this.renderItemCard(item)).join('')}
            </div>

            ${this.positions.length > 0 ? this.renderPositions() : ''}
        `;
    },

    filterRender(containerId, riskLevel) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const filter = riskLevel === 'all' ? {} : { riskLevel };
        const items = this.getItems({ ...filter, sortBy: 'pnl30dPercent', sortDesc: true });

        // Find and replace grid
        const grids = el.querySelectorAll('div[style*="grid-template"]');
        if (grids.length >= 2) {
            const grid = grids[1]; // Second grid is traders
            grid.outerHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;">
                    ${items.slice(0, 24).map(item => this.renderItemCard(item)).join('')}
                </div>
            `;
        }
    },

    renderItemCard(item) {
        const isPositive7d = item.pnl7d >= 0;
        const isPositive30d = item.pnl30d >= 0;
        const riskColor = this.getRiskColor(item.riskLevel);

        return `
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                <!-- Header -->
                <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">
                    <div style="width:48px;height:48px;background:linear-gradient(135deg,${riskColor},#333);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;">
                        ${item.avatar}
                    </div>
                    <div style="flex:1;">
                        <strong style="font-size:16px;">${item.name}</strong><br>
                        <span style="color:#888;font-size:12px;">${item.description}</span>
                    </div>
                    <span style="background:${riskColor};color:#000;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;">
                        ${item.riskLevel.toUpperCase()}
                    </span>
                </div>

                <!-- Performance Grid -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                    <div style="background:rgba(0,0,0,0.2);padding:8px;border-radius:6px;text-align:center;">
                        <div style="color:#888;font-size:10px;">7D PNL</div>
                        <div style="color:${isPositive7d ? '#00ff88' : '#ff4466'};font-weight:bold;">
                            ${isPositive7d ? '+' : ''}${item.pnl7d.toFixed(1)}%
                        </div>
                    </div>
                    <div style="background:rgba(0,0,0,0.2);padding:8px;border-radius:6px;text-align:center;">
                        <div style="color:#888;font-size:10px;">30D PNL</div>
                        <div style="color:${isPositive30d ? '#00ff88' : '#ff4466'};font-weight:bold;">
                            ${isPositive30d ? '+' : ''}${item.pnl30d.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div style="font-size:12px;color:#888;margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;">
                        <span>Win Rate:</span>
                        <span style="color:#fff;">${item.winRate}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Trades:</span>
                        <span style="color:#fff;">${item.trades}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Max DD:</span>
                        <span style="color:#ff6644;">${item.maxDrawdown.toFixed(1)}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Sharpe:</span>
                        <span style="color:${item.sharpeRatio > 1 ? '#00ff88' : '#fff'};">${item.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Followers:</span>
                        <span style="color:#fff;">${item.followers.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>AUM:</span>
                        <span style="color:#fff;">$${(item.aum / 1000000).toFixed(2)}M</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Profit Share:</span>
                        <span style="color:#ffaa00;">${item.profitShare}%</span>
                    </div>
                </div>

                <!-- Trading details -->
                <div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;margin-bottom:10px;font-size:10px;color:#888;">
                    📊 ${item.venue.toUpperCase()} | ${item.leverage}x | ${item.assets.slice(0,3).join(', ')} | Freq: ${item.tradingFreq}
                </div>

                <div style="display:flex;gap:8px;">
                    <button onclick="TraderSimulator.showTraderProfile('${item.id}')"
                        style="padding:10px 12px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;cursor:pointer;flex:1;">
                        📋 Profile
                    </button>
                    <button onclick="SocialTradingModule.quickInvest('${item.id}')"
                        style="padding:10px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;flex:2;">
                        Follow ($${item.minFollow} min)
                    </button>
                </div>
            </div>
        `;
    },

    renderPositions() {
        return `
            <h4 style="color:#00ff88;margin:24px 0 12px;">Your Active Follows (${this.positions.length})</h4>
            <div style="display:grid;gap:8px;">
                ${this.positions.map(pos => {
                    const perf = this.getPositionPerformance(pos.id);
                    if (!perf) return '';

                    const isPositive = parseFloat(perf.pnl) >= 0;
                    return `
                        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">
                            <div style="display:flex;gap:12px;align-items:center;">
                                <div style="width:40px;height:40px;background:linear-gradient(135deg,${this.getRiskColor(pos.riskLevel)},#333);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;">
                                    ${pos.avatar}
                                </div>
                                <div style="flex:1;">
                                    <strong>${pos.traderName}</strong><br>
                                    <span style="color:#888;font-size:12px;">
                                        Allocated: $${pos.allocated.toFixed(2)} | ${perf.daysFollowing} days | ${perf.tradesExecuted} trades
                                    </span>
                                </div>
                                <div style="text-align:right;">
                                    <span style="font-size:16px;font-weight:bold;">$${perf.currentValue}</span><br>
                                    <span style="color:${isPositive ? '#00ff88' : '#ff4466'};font-size:12px;">
                                        ${isPositive ? '+' : ''}$${perf.pnl} (${isPositive ? '+' : ''}${perf.pnlPct}%)
                                    </span>
                                </div>
                            </div>
                            <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
                                <span style="color:#888;font-size:11px;">Profit share accrued: $${perf.profitShareAccrued} (${pos.profitShare}%)</span>
                                <div style="display:flex;gap:6px;">
                                    <button onclick="SocialTradingModule.quickAdd('${pos.id}')"
                                        style="padding:4px 10px;background:#00aaff;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">
                                        Add
                                    </button>
                                    <button onclick="SocialTradingModule.quickUnfollow('${pos.id}')"
                                        style="padding:4px 10px;background:#ff4466;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">
                                        Unfollow
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    quickInvest(itemId) {
        const items = this.getItems();
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        if (typeof InvestHelper !== 'undefined') {
            InvestHelper.show({
                name: 'Follow ' + item.name,
                id: item.id,
                apy: item.pnl30d * 12, // Annualized
                minInvest: item.minFollow,
                fee: item.profitShare,
                risk: { 'low': 2, 'medium': 4, 'high': 6, 'extreme': 8 }[item.riskLevel] || 5,
                icon: item.avatar,
                onInvest: (amount, mode) => {
                    if (mode === 'simulated') {
                        const result = this.invest(itemId, amount);
                        if (result.success) {
                            if (typeof showNotification === 'function') {
                                showNotification('Now following ' + item.name + '!', 'success');
                            }
                            this.render('social-trading-container');
                        } else if (typeof showNotification === 'function') {
                            showNotification(result.error, 'error');
                        }
                    }
                }
            });
        } else {
            const amount = SafeOps.promptNumber('Allocation amount USD (min $' + item.minFollow + '):', 0, item.minFollow);
            if (!amount) return;

            const result = this.invest(itemId, amount);
            alert(result.success ? 'Now following ' + item.name + '! Profit share: ' + result.profitShare + '%' : result.error);
            if (result.success) this.render('social-trading-container');
        }
    },

    quickAdd(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return;

        const amount = SafeOps.promptNumber('Additional allocation USD:', 0, 1);
        if (!amount) return;

        const result = this.invest(pos.traderId, amount);
        alert(result.success ? 'Added $' + amount + ' to ' + pos.traderName : result.error);
        if (result.success) this.render('social-trading-container');
    },

    quickUnfollow(posId) {
        if (!confirm('Unfollow and withdraw all funds?')) return;
        const result = this.withdraw(posId);
        alert(result.success ? 'Withdrawn $' + result.withdrawn + ' (PnL: $' + result.pnl + ', Profit share paid: $' + result.profitSharePaid + ')' : result.error);
        this.render('social-trading-container');
    }
};

document.addEventListener('DOMContentLoaded', () => SocialTradingModule.init());
