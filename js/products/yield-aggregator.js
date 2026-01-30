/**
 * YIELD AGGREGATOR MODULE - Obelisk DEX
 * Auto-compound yields across multiple protocols
 */
const YieldAggregatorModule = {
    items: [
        { id: 'stable-max', name: 'Stablecoin Maximizer', tokens: ['USDC', 'USDT', 'DAI'], protocols: ['Aave', 'Compound', 'Yearn'], baseApy: 8.5, boostApy: 12.5, autoCompound: true, harvestFreq: '4h', minDeposit: 100, risk: 'low' },
        { id: 'eth-yield', name: 'ETH Yield Optimizer', tokens: ['ETH', 'stETH', 'rETH'], protocols: ['Lido', 'Rocket Pool', 'Curve'], baseApy: 5.2, boostApy: 9.8, autoCompound: true, harvestFreq: '6h', minDeposit: 0.05, risk: 'low' },
        { id: 'btc-yield', name: 'BTC Yield Hunter', tokens: ['WBTC', 'tBTC'], protocols: ['Aave', 'Maker', 'Curve'], baseApy: 3.5, boostApy: 7.2, autoCompound: true, harvestFreq: '12h', minDeposit: 0.001, risk: 'medium' },
        { id: 'defi-blue', name: 'DeFi Blue Chip', tokens: ['AAVE', 'UNI', 'MKR', 'LINK'], protocols: ['Native Staking', 'LP Farms'], baseApy: 12.0, boostApy: 25.0, autoCompound: true, harvestFreq: '8h', minDeposit: 50, risk: 'medium' },
        { id: 'lp-optimizer', name: 'LP Optimizer', tokens: ['LP Tokens'], protocols: ['Uniswap', 'Curve', 'Balancer'], baseApy: 15.0, boostApy: 45.0, autoCompound: true, harvestFreq: '2h', minDeposit: 100, risk: 'high' },
        { id: 'multi-chain', name: 'Multi-Chain Yield', chains: ['Ethereum', 'Arbitrum', 'Optimism', 'Polygon'], protocols: ['Cross-chain'], baseApy: 18.0, boostApy: 35.0, autoCompound: true, harvestFreq: '4h', minDeposit: 200, risk: 'medium' },
        { id: 'leverage-yield', name: 'Leveraged Yield', strategy: 'Recursive borrowing', protocols: ['Aave', 'Compound'], baseApy: 25.0, boostApy: 65.0, autoCompound: true, harvestFreq: '1h', minDeposit: 500, risk: 'high' },
        { id: 'delta-neutral', name: 'Delta Neutral Farm', strategy: 'Perp hedged', protocols: ['GMX', 'Hyperliquid'], baseApy: 20.0, boostApy: 40.0, autoCompound: true, harvestFreq: '4h', minDeposit: 300, risk: 'medium' }
    ],
    positions: [],
    harvestHistory: [],

    init() {
        this.load();
        this.startAutoCompounding();
        console.log('Yield Aggregator Module initialized');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_yield_aggregator', []);
        this.harvestHistory = SafeOps.getStorage('obelisk_harvest_history', []);
    },

    save() {
        SafeOps.setStorage('obelisk_yield_aggregator', this.positions);
        SafeOps.setStorage('obelisk_harvest_history', this.harvestHistory);
    },

    invest(itemId, amount) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, error: 'Strategy not found' };
        if (amount < item.minDeposit) return { success: false, error: 'Min deposit: ' + item.minDeposit };

        // Check for existing position
        const existing = this.positions.find(p => p.strategyId === itemId);
        if (existing) {
            existing.deposited += amount;
            existing.principal += amount;
            this.save();
            return { success: true, position: existing, added: amount };
        }

        const position = {
            id: 'yield-' + Date.now(),
            strategyId: itemId,
            strategyName: item.name,
            deposited: amount,
            principal: amount,
            currentValue: amount,
            tokens: item.tokens || [],
            protocols: item.protocols,
            baseApy: item.baseApy,
            boostApy: item.boostApy,
            currentApy: item.baseApy,
            harvestFreq: item.harvestFreq,
            risk: item.risk,
            startDate: Date.now(),
            lastHarvest: Date.now(),
            totalHarvested: 0,
            compoundedRewards: 0,
            harvestCount: 0,
            autoCompound: item.autoCompound
        };

        this.positions.push(position);
        this.save();

        if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.invest(position.id, item.name, amount, item.boostApy, 'yield-aggregator', true);
        }

        return { success: true, position };
    },

    withdraw(posId, amount = null) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const pos = this.positions[idx];

        // Calculate final value with pending rewards
        this.harvestRewards(posId);

        const withdrawAmount = amount || pos.currentValue;
        if (withdrawAmount > pos.currentValue) return { success: false, error: 'Insufficient balance' };

        const profit = pos.currentValue - pos.principal;
        const profitPct = (profit / pos.principal) * 100;

        if (withdrawAmount >= pos.currentValue) {
            this.positions.splice(idx, 1);
        } else {
            const ratio = withdrawAmount / pos.currentValue;
            pos.currentValue -= withdrawAmount;
            pos.deposited -= withdrawAmount * (pos.deposited / pos.currentValue);
        }
        this.save();

        return {
            success: true,
            withdrawn: withdrawAmount.toFixed(2),
            profit: profit.toFixed(2),
            profitPct: profitPct.toFixed(2),
            totalHarvested: pos.totalHarvested.toFixed(2),
            harvestCount: pos.harvestCount
        };
    },

    harvestRewards(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };

        const now = Date.now();
        const hoursSinceHarvest = (now - pos.lastHarvest) / 3600000;

        // Calculate rewards based on APY
        const currentApy = this.calculateCurrentApy(pos);
        const hourlyRate = currentApy / 100 / 8760;
        const rewards = pos.currentValue * hourlyRate * hoursSinceHarvest;

        if (rewards < 0.01) {
            return { success: false, error: 'Pending rewards too small' };
        }

        // Update position
        pos.totalHarvested += rewards;
        pos.harvestCount++;
        pos.lastHarvest = now;
        pos.currentApy = currentApy;

        if (pos.autoCompound) {
            pos.currentValue += rewards;
            pos.compoundedRewards += rewards;
        }

        // Log harvest
        this.harvestHistory.push({
            posId,
            timestamp: now,
            rewards: rewards.toFixed(4),
            compounded: pos.autoCompound,
            newValue: pos.currentValue.toFixed(2)
        });
        if (this.harvestHistory.length > 100) {
            this.harvestHistory = this.harvestHistory.slice(-100);
        }

        this.save();

        return {
            success: true,
            rewards: rewards.toFixed(4),
            compounded: pos.autoCompound,
            newValue: pos.currentValue.toFixed(2)
        };
    },

    calculateCurrentApy(pos) {
        // APY varies based on protocol conditions
        const baseApy = pos.baseApy;
        const boostApy = pos.boostApy;
        const variance = (Math.random() - 0.5) * 0.2; // +/- 10%
        const currentApy = baseApy + (boostApy - baseApy) * (0.5 + variance);
        return Math.max(baseApy * 0.8, Math.min(boostApy * 1.1, currentApy));
    },

    toggleAutoCompound(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };

        pos.autoCompound = !pos.autoCompound;
        this.save();

        return { success: true, autoCompound: pos.autoCompound };
    },

    startAutoCompounding() {
        // Simulate auto-harvest every minute
        setInterval(() => {
            this.positions.forEach(pos => {
                if (pos.autoCompound) {
                    const hoursSinceHarvest = (Date.now() - pos.lastHarvest) / 3600000;
                    const harvestHours = parseInt(pos.harvestFreq);
                    if (hoursSinceHarvest >= harvestHours / 60) { // Accelerated for demo
                        this.harvestRewards(pos.id);
                    }
                }
            });
        }, 60000);
    },

    getPositionStats(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const daysActive = (Date.now() - pos.startDate) / 86400000;
        const profit = pos.currentValue - pos.principal;
        const profitPct = (profit / pos.principal) * 100;
        const dailyYield = daysActive > 0 ? profit / daysActive : 0;
        const pendingHours = (Date.now() - pos.lastHarvest) / 3600000;
        const pendingRewards = pos.currentValue * (pos.currentApy / 100 / 8760) * pendingHours;

        return {
            currentValue: pos.currentValue.toFixed(2),
            profit: profit.toFixed(2),
            profitPct: profitPct.toFixed(2),
            dailyYield: dailyYield.toFixed(2),
            currentApy: pos.currentApy.toFixed(2),
            pendingRewards: pendingRewards.toFixed(4),
            totalHarvested: pos.totalHarvested.toFixed(2),
            harvestCount: pos.harvestCount,
            daysActive: Math.floor(daysActive)
        };
    },

    getTotalValue() {
        return this.positions.reduce((sum, p) => sum + p.currentValue, 0);
    },

    getRiskColor(risk) {
        const colors = { low: '#00ff88', medium: '#ffaa00', high: '#ff6644' };
        return colors[risk] || '#888';
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const totalValue = this.getTotalValue();

        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Yield Aggregator - Auto-Compound</h3>' +
            (totalValue > 0 ? '<div style="background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,170,255,0.1));border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;margin-bottom:16px;text-align:center;">' +
            '<div style="color:#888;font-size:12px;">TOTAL AGGREGATED VALUE</div>' +
            '<div style="color:#00ff88;font-size:32px;font-weight:bold;">$' + totalValue.toFixed(2) + '</div>' +
            '</div>' : '') +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">' +
            this.items.map(item =>
                '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">' +
                '<div><strong style="font-size:16px;">' + item.name + '</strong><br>' +
                '<span style="color:#888;font-size:11px;">' + item.protocols.join(' + ') + '</span></div>' +
                '<span style="background:' + this.getRiskColor(item.risk) + ';color:#000;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;">' + item.risk.toUpperCase() + '</span>' +
                '</div>' +
                '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
                '<div style="flex:1;background:rgba(0,0,0,0.2);padding:10px;border-radius:8px;text-align:center;">' +
                '<div style="color:#888;font-size:10px;">BASE APY</div>' +
                '<div style="color:#fff;font-size:18px;font-weight:bold;">' + item.baseApy + '%</div>' +
                '</div>' +
                '<div style="flex:1;background:rgba(0,255,136,0.1);padding:10px;border-radius:8px;text-align:center;">' +
                '<div style="color:#888;font-size:10px;">BOOSTED APY</div>' +
                '<div style="color:#00ff88;font-size:18px;font-weight:bold;">' + item.boostApy + '%</div>' +
                '</div>' +
                '</div>' +
                '<div style="font-size:12px;color:#888;margin-bottom:12px;">' +
                (item.tokens ? '<div>Tokens: <span style="color:#fff;">' + item.tokens.join(', ') + '</span></div>' : '') +
                (item.chains ? '<div>Chains: <span style="color:#fff;">' + item.chains.join(', ') + '</span></div>' : '') +
                (item.strategy ? '<div>Strategy: <span style="color:#fff;">' + item.strategy + '</span></div>' : '') +
                '<div>Auto-Harvest: <span style="color:#fff;">' + item.harvestFreq + '</span></div>' +
                '<div>Min Deposit: <span style="color:#fff;">$' + item.minDeposit + '</span></div>' +
                '</div>' +
                '<button onclick="YieldAggregatorModule.quickInvest(\'' + item.id + '\')" style="padding:10px 16px;background:linear-gradient(135deg,#00ff88,#00aaff);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;width:100%;">Start Compounding</button>' +
                '</div>'
            ).join('') +
            '</div>' +
            (this.positions.length > 0 ? this.renderPositions() : '');
    },

    renderPositions() {
        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Your Yield Positions (' + this.positions.length + ')</h4>' +
            '<div style="display:grid;gap:8px;">' +
            this.positions.map(pos => {
                const stats = this.getPositionStats(pos.id);
                const isPositive = parseFloat(stats.profit) >= 0;
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
                    '<div><strong>' + pos.strategyName + '</strong><br>' +
                    '<span style="color:#888;font-size:12px;">Principal: $' + pos.principal.toFixed(2) + ' | ' + stats.daysActive + ' days</span></div>' +
                    '<div style="text-align:right;">' +
                    '<span style="font-size:20px;font-weight:bold;">$' + stats.currentValue + '</span><br>' +
                    '<span style="color:' + (isPositive ? '#00ff88' : '#ff4466') + ';font-size:12px;">' + (isPositive ? '+' : '') + stats.profit + ' (' + (isPositive ? '+' : '') + stats.profitPct + '%)</span>' +
                    '</div></div>' +
                    '<div style="display:flex;gap:16px;font-size:11px;color:#888;margin-bottom:10px;">' +
                    '<span>APY: <span style="color:#00ff88;">' + stats.currentApy + '%</span></span>' +
                    '<span>Harvests: <span style="color:#fff;">' + stats.harvestCount + '</span></span>' +
                    '<span>Total Harvested: <span style="color:#fff;">$' + stats.totalHarvested + '</span></span>' +
                    '<span>Pending: <span style="color:#ffaa00;">$' + stats.pendingRewards + '</span></span>' +
                    '</div>' +
                    '<div style="display:flex;gap:8px;">' +
                    '<button onclick="YieldAggregatorModule.quickHarvest(\'' + pos.id + '\')" style="flex:1;padding:8px 12px;background:#ffaa00;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;">Harvest Now</button>' +
                    '<button onclick="YieldAggregatorModule.quickToggle(\'' + pos.id + '\')" style="padding:8px 12px;background:' + (pos.autoCompound ? '#00ff88' : 'rgba(255,255,255,0.1)') + ';border:none;border-radius:6px;color:' + (pos.autoCompound ? '#000' : '#888') + ';font-weight:bold;cursor:pointer;">' + (pos.autoCompound ? 'Auto: ON' : 'Auto: OFF') + '</button>' +
                    '<button onclick="YieldAggregatorModule.quickWithdraw(\'' + pos.id + '\')" style="padding:8px 12px;background:#ff4466;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;">Withdraw</button>' +
                    '</div></div>';
            }).join('') +
            '</div>';
    },

    quickInvest(itemId) {
        const item = this.items.find(i => i.id === itemId);
        const amount = SafeOps.promptNumber('Deposit amount (min $' + item.minDeposit + '):', 0, item.minDeposit);
        if (!amount) return;

        const result = this.invest(itemId, amount);
        alert(result.success ? 'Deposited $' + amount + ' into ' + item.name + '! Auto-compounding enabled.' : result.error);
        if (result.success) this.render('yield-aggregator-container');
    },

    quickHarvest(posId) {
        const result = this.harvestRewards(posId);
        alert(result.success ? 'Harvested $' + result.rewards + (result.compounded ? ' (compounded)' : '') : result.error);
        if (result.success) this.render('yield-aggregator-container');
    },

    quickToggle(posId) {
        const result = this.toggleAutoCompound(posId);
        alert(result.success ? 'Auto-compound: ' + (result.autoCompound ? 'ENABLED' : 'DISABLED') : result.error);
        this.render('yield-aggregator-container');
    },

    quickWithdraw(posId) {
        if (!confirm('Withdraw all funds?')) return;
        const result = this.withdraw(posId);
        alert(result.success
            ? 'Withdrawn $' + result.withdrawn + '! Profit: $' + result.profit + ' (' + result.profitPct + '%). ' + result.harvestCount + ' harvests totaling $' + result.totalHarvested
            : result.error);
        this.render('yield-aggregator-container');
    }
};

document.addEventListener('DOMContentLoaded', () => YieldAggregatorModule.init());
