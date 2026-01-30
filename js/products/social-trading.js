/**
 * SOCIAL TRADING MODULE - Obelisk DEX
 * Follow and copy trading strategies from top performers
 */
const SocialTradingModule = {
    items: [
        { id: 'whale-hunter', name: 'Whale Hunter', avatar: 'WH', pnl7d: 28.5, pnl30d: 89.2, winRate: 68, trades: 245, followers: 12400, aum: 8500000, minFollow: 100, profitShare: 15, strategy: 'Large cap momentum', riskLevel: 'medium' },
        { id: 'degen-master', name: 'Degen Master', avatar: 'DM', pnl7d: 156.3, pnl30d: 420.8, winRate: 52, trades: 890, followers: 5600, aum: 2200000, minFollow: 25, profitShare: 25, strategy: 'High-risk altcoins', riskLevel: 'extreme' },
        { id: 'steady-eddie', name: 'Steady Eddie', avatar: 'SE', pnl7d: 3.2, pnl30d: 15.8, winRate: 88, trades: 120, followers: 28000, aum: 45000000, minFollow: 500, profitShare: 10, strategy: 'Conservative DCA', riskLevel: 'low' },
        { id: 'arb-wizard', name: 'Arb Wizard', avatar: 'AW', pnl7d: 12.4, pnl30d: 45.6, winRate: 94, trades: 1520, followers: 8900, aum: 12000000, minFollow: 200, profitShare: 20, strategy: 'DEX arbitrage', riskLevel: 'low' },
        { id: 'perp-queen', name: 'Perp Queen', avatar: 'PQ', pnl7d: 42.1, pnl30d: 125.4, winRate: 61, trades: 450, followers: 15200, aum: 18000000, minFollow: 150, profitShare: 18, strategy: 'Perpetual futures', riskLevel: 'high' },
        { id: 'nft-flipper', name: 'NFT Flipper', avatar: 'NF', pnl7d: -8.5, pnl30d: 78.9, winRate: 45, trades: 320, followers: 4200, aum: 3500000, minFollow: 50, profitShare: 22, strategy: 'NFT trading', riskLevel: 'extreme' },
        { id: 'yield-farmer', name: 'Yield Farmer Pro', avatar: 'YF', pnl7d: 5.8, pnl30d: 32.4, winRate: 82, trades: 85, followers: 19500, aum: 35000000, minFollow: 250, profitShare: 12, strategy: 'Yield optimization', riskLevel: 'medium' },
        { id: 'sol-sniper', name: 'SOL Sniper', avatar: 'SS', pnl7d: 67.2, pnl30d: 234.5, winRate: 58, trades: 680, followers: 7800, aum: 6500000, minFollow: 75, profitShare: 20, strategy: 'Solana ecosystem', riskLevel: 'high' }
    ],
    positions: [],

    init() {
        this.load();
        console.log('Social Trading Module initialized');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_social_trading', []);
    },

    save() {
        SafeOps.setStorage('obelisk_social_trading', this.positions);
    },

    invest(itemId, amount) {
        const item = this.items.find(i => i.id === itemId);
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
            strategy: item.strategy,
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
        const item = this.items.find(i => i.id === pos.traderId);
        const daysFollowing = (Date.now() - pos.startDate) / 86400000;
        const estimatedPnl = pos.allocated * (item.pnl30d / 100) * (daysFollowing / 30);
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

        const item = this.items.find(i => i.id === pos.traderId);
        if (newAmount < item.minFollow) return { success: false, error: 'Min allocation: $' + item.minFollow };

        const diff = newAmount - pos.allocated;
        pos.allocated = newAmount;
        if (diff > 0) pos.totalInvested += diff;
        this.save();

        return { success: true, newAllocation: newAmount, change: diff };
    },

    getTraderStats(traderId) {
        const item = this.items.find(i => i.id === traderId);
        if (!item) return null;

        return {
            sharpeRatio: (item.pnl30d / 30 * Math.sqrt(365) / 15).toFixed(2),
            maxDrawdown: (Math.random() * 20 + 5).toFixed(1) + '%',
            avgTradeSize: (item.aum / item.trades).toFixed(0),
            tradingFreq: (item.trades / 30).toFixed(1) + '/day',
            bestTrade: '+' + (item.pnl30d * 0.3).toFixed(1) + '%',
            worstTrade: '-' + (item.pnl30d * 0.15).toFixed(1) + '%'
        };
    },

    getPositionPerformance(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const item = this.items.find(i => i.id === pos.traderId);
        const daysFollowing = (Date.now() - pos.startDate) / 86400000;
        const estimatedPnl = pos.allocated * (item.pnl30d / 100) * (daysFollowing / 30);
        const profitShare = Math.max(0, estimatedPnl * (pos.profitShare / 100));
        const netPnl = estimatedPnl - profitShare;
        const currentValue = pos.allocated + netPnl;

        return {
            currentValue: currentValue.toFixed(2),
            pnl: netPnl.toFixed(2),
            pnlPct: ((netPnl / pos.allocated) * 100).toFixed(2),
            profitShareAccrued: profitShare.toFixed(2),
            daysFollowing: Math.floor(daysFollowing),
            tradesExecuted: Math.floor(item.trades * daysFollowing / 30)
        };
    },

    getRiskColor(level) {
        const colors = { low: '#00ff88', medium: '#ffaa00', high: '#ff6644', extreme: '#ff0044' };
        return colors[level] || '#888';
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Social Trading - Top Performers</h3>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">' +
            this.items.map(item => {
                const isPositive7d = item.pnl7d >= 0;
                const isPositive30d = item.pnl30d >= 0;
                return '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">' +
                    '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">' +
                    '<div style="width:48px;height:48px;background:linear-gradient(135deg,#00ff88,#00aaff);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#000;">' + item.avatar + '</div>' +
                    '<div style="flex:1;">' +
                    '<strong style="font-size:16px;">' + item.name + '</strong><br>' +
                    '<span style="color:#888;font-size:12px;">' + item.strategy + '</span>' +
                    '</div>' +
                    '<span style="background:' + this.getRiskColor(item.riskLevel) + ';color:#000;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;">' + item.riskLevel.toUpperCase() + '</span>' +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">' +
                    '<div style="background:rgba(0,0,0,0.2);padding:8px;border-radius:6px;text-align:center;">' +
                    '<div style="color:#888;font-size:10px;">7D PNL</div>' +
                    '<div style="color:' + (isPositive7d ? '#00ff88' : '#ff4466') + ';font-weight:bold;">' + (isPositive7d ? '+' : '') + item.pnl7d + '%</div>' +
                    '</div>' +
                    '<div style="background:rgba(0,0,0,0.2);padding:8px;border-radius:6px;text-align:center;">' +
                    '<div style="color:#888;font-size:10px;">30D PNL</div>' +
                    '<div style="color:' + (isPositive30d ? '#00ff88' : '#ff4466') + ';font-weight:bold;">' + (isPositive30d ? '+' : '') + item.pnl30d + '%</div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="font-size:12px;color:#888;margin-bottom:12px;">' +
                    '<div style="display:flex;justify-content:space-between;"><span>Win Rate:</span><span style="color:#fff;">' + item.winRate + '%</span></div>' +
                    '<div style="display:flex;justify-content:space-between;"><span>Trades:</span><span style="color:#fff;">' + item.trades + '</span></div>' +
                    '<div style="display:flex;justify-content:space-between;"><span>Followers:</span><span style="color:#fff;">' + item.followers.toLocaleString() + '</span></div>' +
                    '<div style="display:flex;justify-content:space-between;"><span>AUM:</span><span style="color:#fff;">$' + (item.aum / 1000000).toFixed(1) + 'M</span></div>' +
                    '<div style="display:flex;justify-content:space-between;"><span>Profit Share:</span><span style="color:#ffaa00;">' + item.profitShare + '%</span></div>' +
                    '</div>' +
                    '<button onclick="SocialTradingModule.quickInvest(\'' + item.id + '\')" style="padding:10px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;width:100%;">Follow ($' + item.minFollow + ' min)</button>' +
                    '</div>';
            }).join('') +
            '</div>' +
            (this.positions.length > 0 ? this.renderPositions() : '');
    },

    renderPositions() {
        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Your Active Follows (' + this.positions.length + ')</h4>' +
            '<div style="display:grid;gap:8px;">' +
            this.positions.map(pos => {
                const perf = this.getPositionPerformance(pos.id);
                const isPositive = parseFloat(perf.pnl) >= 0;
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">' +
                    '<div style="display:flex;gap:12px;align-items:center;">' +
                    '<div style="width:40px;height:40px;background:linear-gradient(135deg,#00ff88,#00aaff);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#000;font-size:12px;">' + pos.avatar + '</div>' +
                    '<div style="flex:1;">' +
                    '<strong>' + pos.traderName + '</strong><br>' +
                    '<span style="color:#888;font-size:12px;">Allocated: $' + pos.allocated.toFixed(2) + ' | ' + perf.daysFollowing + ' days | ' + perf.tradesExecuted + ' trades</span>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                    '<span style="font-size:16px;font-weight:bold;">$' + perf.currentValue + '</span><br>' +
                    '<span style="color:' + (isPositive ? '#00ff88' : '#ff4466') + ';font-size:12px;">' + (isPositive ? '+' : '') + perf.pnl + ' (' + (isPositive ? '+' : '') + perf.pnlPct + '%)</span>' +
                    '</div></div>' +
                    '<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">' +
                    '<span style="color:#888;font-size:11px;">Profit share accrued: $' + perf.profitShareAccrued + ' (' + pos.profitShare + '%)</span>' +
                    '<div style="display:flex;gap:6px;">' +
                    '<button onclick="SocialTradingModule.quickAdd(\'' + pos.id + '\')" style="padding:4px 10px;background:#00aaff;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">Add</button>' +
                    '<button onclick="SocialTradingModule.quickUnfollow(\'' + pos.id + '\')" style="padding:4px 10px;background:#ff4466;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">Unfollow</button>' +
                    '</div></div></div>';
            }).join('') +
            '</div>';
    },

    quickInvest(itemId) {
        const item = this.items.find(i => i.id === itemId);
        const amount = SafeOps.promptNumber('Allocation amount USD (min $' + item.minFollow + '):', 0, item.minFollow);
        if (!amount) return;

        const result = this.invest(itemId, amount);
        alert(result.success ? 'Now following ' + item.name + '! Profit share: ' + result.profitShare + '%' : result.error);
        if (result.success) this.render('social-trading-container');
    },

    quickAdd(posId) {
        const pos = this.positions.find(p => p.id === posId);
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
