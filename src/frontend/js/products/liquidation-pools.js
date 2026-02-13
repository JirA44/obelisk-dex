/**
 * LIQUIDATION POOLS MODULE - Obelisk DEX
 * Participate in protocol liquidations and earn rewards
 */
const LiquidationPoolsModule = {
    items: [
        { id: 'aave-liq', name: 'Aave Liquidation Pool', protocol: 'Aave V3', chain: 'Ethereum', bonus: 5, minDeposit: 500, avgLiqSize: 25000, dailyLiqs: 45, successRate: 94, risk: 'low' },
        { id: 'compound-liq', name: 'Compound Liquidation', protocol: 'Compound V3', chain: 'Ethereum', bonus: 4, minDeposit: 500, avgLiqSize: 18000, dailyLiqs: 32, successRate: 92, risk: 'low' },
        { id: 'maker-liq', name: 'MakerDAO Vault Keeper', protocol: 'MakerDAO', chain: 'Ethereum', bonus: 13, minDeposit: 1000, avgLiqSize: 50000, dailyLiqs: 15, successRate: 88, risk: 'medium' },
        { id: 'gmx-liq', name: 'GMX Liquidations', protocol: 'GMX', chain: 'Arbitrum', bonus: 8, minDeposit: 300, avgLiqSize: 8000, dailyLiqs: 120, successRate: 96, risk: 'medium' },
        { id: 'perp-liq', name: 'Perpetual Liquidator', protocol: 'Multiple Perps', chain: 'Multi-chain', bonus: 10, minDeposit: 500, avgLiqSize: 12000, dailyLiqs: 85, successRate: 91, risk: 'high' },
        { id: 'nft-liq', name: 'NFT Lending Liquidator', protocol: 'BendDAO/NFTfi', chain: 'Ethereum', bonus: 15, minDeposit: 2000, avgLiqSize: 35000, dailyLiqs: 8, successRate: 78, risk: 'high' },
        { id: 'defi-liq', name: 'DeFi Protocol Keeper', protocol: 'Various', chain: 'Ethereum', bonus: 6, minDeposit: 1000, avgLiqSize: 20000, dailyLiqs: 60, successRate: 93, risk: 'medium' },
        { id: 'stablecoin-liq', name: 'Stablecoin CDP Keeper', protocol: 'Liquity/GHO', chain: 'Ethereum', bonus: 10, minDeposit: 500, avgLiqSize: 15000, dailyLiqs: 25, successRate: 95, risk: 'low' }
    ],
    positions: [],
    liquidationHistory: [],

    init() {
        this.load();
        this.startLiquidationMonitor();
        console.log('Liquidation Pools Module initialized');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_liquidation_pools', []);
        this.liquidationHistory = SafeOps.getStorage('obelisk_liquidation_history', []);
    },

    save() {
        SafeOps.setStorage('obelisk_liquidation_pools', this.positions);
        SafeOps.setStorage('obelisk_liquidation_history', this.liquidationHistory);
    },

    invest(itemId, amount) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, error: 'Pool not found' };
        if (amount < item.minDeposit) return { success: false, error: 'Min deposit: $' + item.minDeposit };

        // Check for existing position
        const existing = this.positions.find(p => p.poolId === itemId);
        if (existing) {
            existing.deposited += amount;
            existing.availableCapital += amount;
            this.save();
            return { success: true, position: existing, added: amount };
        }

        const position = {
            id: 'liq-' + Date.now(),
            poolId: itemId,
            poolName: item.name,
            protocol: item.protocol,
            chain: item.chain,
            bonus: item.bonus,
            deposited: amount,
            availableCapital: amount,
            lockedCapital: 0,
            startDate: Date.now(),
            totalLiquidations: 0,
            successfulLiqs: 0,
            totalProfit: 0,
            totalGasCost: 0,
            pendingLiquidations: [],
            risk: item.risk,
            autoLiquidate: true,
            maxLiqSize: amount * 0.5 // Max 50% of capital per liquidation
        };

        this.positions.push(position);
        this.save();

        if (typeof SimulatedPortfolio !== 'undefined') {
            const estimatedApy = (item.avgLiqSize * (item.bonus / 100) * item.dailyLiqs * 365) / 1000000 * 100;
            SimulatedPortfolio.invest(position.id, item.name, amount, Math.min(estimatedApy, 100), 'liquidation', false);
        }

        return { success: true, position };
    },

    withdraw(posId, amount = null) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const pos = this.positions[idx];

        if (pos.lockedCapital > 0) {
            return { success: false, error: 'Capital locked in pending liquidations. Wait for completion.' };
        }

        const withdrawAmount = amount || pos.availableCapital;
        if (withdrawAmount > pos.availableCapital) return { success: false, error: 'Insufficient available capital' };

        const profit = pos.totalProfit - pos.totalGasCost;
        const profitPct = (profit / pos.deposited) * 100;

        if (withdrawAmount >= pos.availableCapital && pos.pendingLiquidations.length === 0) {
            this.positions.splice(idx, 1);
        } else {
            pos.availableCapital -= withdrawAmount;
            pos.deposited -= withdrawAmount;
        }
        this.save();

        return {
            success: true,
            withdrawn: withdrawAmount.toFixed(2),
            profit: profit.toFixed(2),
            profitPct: profitPct.toFixed(2),
            totalLiquidations: pos.totalLiquidations,
            successRate: pos.totalLiquidations > 0 ? ((pos.successfulLiqs / pos.totalLiquidations) * 100).toFixed(1) : 0
        };
    },

    executeLiquidation(posId, targetAddress, debtAmount) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };

        const item = this.items.find(i => i.id === pos.poolId);
        if (debtAmount > pos.maxLiqSize) return { success: false, error: 'Exceeds max liquidation size' };
        if (debtAmount > pos.availableCapital) return { success: false, error: 'Insufficient capital' };

        // Lock capital
        pos.availableCapital -= debtAmount;
        pos.lockedCapital += debtAmount;

        // Simulate execution
        const isSuccessful = Math.random() * 100 < item.successRate;
        const gasCost = 50 + Math.random() * 150; // $50-$200 gas
        let profit = 0;
        let collateralReceived = 0;

        if (isSuccessful) {
            const bonusVariance = (Math.random() - 0.5) * 0.3; // +/- 15% variance on bonus
            const effectiveBonus = item.bonus * (1 + bonusVariance);
            profit = debtAmount * (effectiveBonus / 100);
            collateralReceived = debtAmount + profit;
            pos.successfulLiqs++;
        }

        pos.totalLiquidations++;
        pos.totalProfit += profit;
        pos.totalGasCost += gasCost;

        // Return capital
        pos.lockedCapital -= debtAmount;
        if (isSuccessful) {
            pos.availableCapital += collateralReceived;
        } else {
            pos.availableCapital += debtAmount; // Failed, capital returned minus gas
        }

        // Log liquidation
        const liqRecord = {
            posId,
            timestamp: Date.now(),
            target: targetAddress,
            debtAmount,
            success: isSuccessful,
            profit: isSuccessful ? profit.toFixed(2) : '0',
            gasCost: gasCost.toFixed(2),
            collateralReceived: isSuccessful ? collateralReceived.toFixed(2) : '0'
        };
        this.liquidationHistory.push(liqRecord);
        if (this.liquidationHistory.length > 100) {
            this.liquidationHistory = this.liquidationHistory.slice(-100);
        }

        this.save();

        return {
            success: true,
            executed: isSuccessful,
            profit: profit.toFixed(2),
            gasCost: gasCost.toFixed(2),
            collateralReceived: collateralReceived.toFixed(2)
        };
    },

    startLiquidationMonitor() {
        // Simulate finding liquidation opportunities
        setInterval(() => {
            this.positions.forEach(pos => {
                if (pos.autoLiquidate && pos.availableCapital > 100 && Math.random() > 0.8) {
                    const item = this.items.find(i => i.id === pos.poolId);
                    const liqSize = Math.min(
                        item.avgLiqSize * (0.5 + Math.random()),
                        pos.maxLiqSize,
                        pos.availableCapital
                    );
                    const target = '0x' + Math.random().toString(16).slice(2, 10) + '...';
                    this.executeLiquidation(pos.id, target, liqSize);
                }
            });
        }, 30000);
    },

    toggleAutoLiquidate(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };

        pos.autoLiquidate = !pos.autoLiquidate;
        this.save();

        return { success: true, autoLiquidate: pos.autoLiquidate };
    },

    setMaxLiqSize(posId, maxSize) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };
        if (maxSize > pos.availableCapital) return { success: false, error: 'Cannot exceed available capital' };

        pos.maxLiqSize = maxSize;
        this.save();

        return { success: true, maxLiqSize: maxSize };
    },

    getPositionStats(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const daysActive = (Date.now() - pos.startDate) / 86400000;
        const netProfit = pos.totalProfit - pos.totalGasCost;
        const successRate = pos.totalLiquidations > 0 ? (pos.successfulLiqs / pos.totalLiquidations) * 100 : 0;
        const totalValue = pos.availableCapital + pos.lockedCapital;
        const roi = (netProfit / pos.deposited) * 100;
        const dailyAvgProfit = daysActive > 0 ? netProfit / daysActive : 0;
        const projectedApy = (dailyAvgProfit * 365 / pos.deposited) * 100;

        return {
            totalValue: totalValue.toFixed(2),
            availableCapital: pos.availableCapital.toFixed(2),
            lockedCapital: pos.lockedCapital.toFixed(2),
            netProfit: netProfit.toFixed(2),
            roi: roi.toFixed(2),
            projectedApy: Math.min(projectedApy, 500).toFixed(1),
            totalLiquidations: pos.totalLiquidations,
            successRate: successRate.toFixed(1),
            totalGasCost: pos.totalGasCost.toFixed(2),
            daysActive: Math.floor(daysActive)
        };
    },

    getRiskColor(risk) {
        const colors = { low: '#00ff88', medium: '#ffaa00', high: '#ff6644' };
        return colors[risk] || '#888';
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Liquidation Pools</h3>' +
            '<div style="background:rgba(255,136,0,0.1);border:1px solid #ff8800;border-radius:8px;padding:12px;margin-bottom:16px;">' +
            '<strong style="color:#ff8800;">How it works:</strong> Deposit capital to participate in protocol liquidations. When undercollateralized positions are found, your capital is used to repay debt and receive collateral at a bonus.' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">' +
            this.items.map(item =>
                '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">' +
                '<div><strong style="font-size:16px;">' + item.name + '</strong><br>' +
                '<span style="color:#888;font-size:11px;">' + item.protocol + ' | ' + item.chain + '</span></div>' +
                '<span style="background:' + this.getRiskColor(item.risk) + ';color:#000;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;">' + item.risk.toUpperCase() + '</span>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">' +
                '<div style="background:rgba(0,0,0,0.2);padding:10px;border-radius:8px;text-align:center;">' +
                '<div style="color:#888;font-size:10px;">BONUS</div>' +
                '<div style="color:#00ff88;font-size:24px;font-weight:bold;">' + item.bonus + '%</div>' +
                '</div>' +
                '<div style="background:rgba(0,0,0,0.2);padding:10px;border-radius:8px;text-align:center;">' +
                '<div style="color:#888;font-size:10px;">SUCCESS RATE</div>' +
                '<div style="color:#00ff88;font-size:24px;font-weight:bold;">' + item.successRate + '%</div>' +
                '</div>' +
                '</div>' +
                '<div style="font-size:12px;color:#888;margin-bottom:12px;">' +
                '<div style="display:flex;justify-content:space-between;"><span>Avg Liquidation:</span><span style="color:#fff;">$' + item.avgLiqSize.toLocaleString() + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;"><span>Daily Volume:</span><span style="color:#fff;">~' + item.dailyLiqs + ' liquidations</span></div>' +
                '<div style="display:flex;justify-content:space-between;"><span>Min Deposit:</span><span style="color:#fff;">$' + item.minDeposit + '</span></div>' +
                '</div>' +
                '<button onclick="LiquidationPoolsModule.quickInvest(\'' + item.id + '\')" style="padding:10px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;width:100%;">Join Pool</button>' +
                '</div>'
            ).join('') +
            '</div>' +
            (this.positions.length > 0 ? this.renderPositions() : '') +
            (this.liquidationHistory.length > 0 ? this.renderHistory() : '');
    },

    renderPositions() {
        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Your Liquidation Positions (' + this.positions.length + ')</h4>' +
            '<div style="display:grid;gap:8px;">' +
            this.positions.map(pos => {
                const stats = this.getPositionStats(pos.id);
                const isPositive = parseFloat(stats.netProfit) >= 0;
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
                    '<div><strong>' + pos.poolName + '</strong><br>' +
                    '<span style="color:#888;font-size:12px;">' + pos.protocol + ' | ' + pos.chain + '</span></div>' +
                    '<div style="text-align:right;">' +
                    '<span style="font-size:18px;font-weight:bold;">$' + stats.totalValue + '</span><br>' +
                    '<span style="color:' + (isPositive ? '#00ff88' : '#ff4466') + ';font-size:12px;">' + (isPositive ? '+' : '') + '$' + stats.netProfit + ' (' + stats.roi + '%)</span>' +
                    '</div></div>' +
                    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px;font-size:11px;text-align:center;">' +
                    '<div><span style="color:#888;">Available</span><br><span style="color:#00ff88;">$' + stats.availableCapital + '</span></div>' +
                    '<div><span style="color:#888;">Locked</span><br><span style="color:#ffaa00;">$' + stats.lockedCapital + '</span></div>' +
                    '<div><span style="color:#888;">Liquidations</span><br><span style="color:#fff;">' + stats.totalLiquidations + '</span></div>' +
                    '<div><span style="color:#888;">Success</span><br><span style="color:#fff;">' + stats.successRate + '%</span></div>' +
                    '</div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:11px;color:#888;">' +
                    '<span>Projected APY: <span style="color:#00ff88;">' + stats.projectedApy + '%</span></span>' +
                    '<span>Gas spent: <span style="color:#ff4466;">$' + stats.totalGasCost + '</span></span>' +
                    '<span>Active: <span style="color:#fff;">' + stats.daysActive + ' days</span></span>' +
                    '</div>' +
                    '<div style="display:flex;gap:8px;">' +
                    '<button onclick="LiquidationPoolsModule.quickInvest(\'' + pos.poolId + '\')" style="flex:1;padding:8px 12px;background:#00aaff;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;">Add Capital</button>' +
                    '<button onclick="LiquidationPoolsModule.quickToggle(\'' + pos.id + '\')" style="padding:8px 12px;background:' + (pos.autoLiquidate ? '#00ff88' : 'rgba(255,255,255,0.1)') + ';border:none;border-radius:6px;color:' + (pos.autoLiquidate ? '#000' : '#888') + ';font-weight:bold;cursor:pointer;">' + (pos.autoLiquidate ? 'Auto: ON' : 'Auto: OFF') + '</button>' +
                    '<button onclick="LiquidationPoolsModule.quickWithdraw(\'' + pos.id + '\')" style="padding:8px 12px;background:#ff4466;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;">Withdraw</button>' +
                    '</div></div>';
            }).join('') +
            '</div>';
    },

    renderHistory() {
        const recent = this.liquidationHistory.slice(-6).reverse();
        return '<h4 style="color:#888;margin:20px 0 8px;">Recent Liquidations</h4>' +
            '<div style="font-size:11px;font-family:monospace;">' +
            recent.map(liq => {
                const time = new Date(liq.timestamp).toLocaleTimeString();
                return '<div style="padding:6px 10px;background:rgba(0,0,0,0.2);margin-bottom:2px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">' +
                    '<span style="color:#888;">' + time + '</span>' +
                    '<span>' + liq.target + '</span>' +
                    '<span style="color:' + (liq.success ? '#00ff88' : '#ff4466') + ';">' + (liq.success ? 'SUCCESS' : 'FAILED') + '</span>' +
                    '<span>Debt: $' + parseFloat(liq.debtAmount).toFixed(0) + '</span>' +
                    '<span style="color:' + (liq.success ? '#00ff88' : '#888') + ';">+$' + liq.profit + '</span>' +
                    '<span style="color:#ff8800;">Gas: $' + liq.gasCost + '</span>' +
                    '</div>';
            }).join('') +
            '</div>';
    },

    quickInvest(itemId) {
        const item = this.items.find(i => i.id === itemId);
        const amount = SafeOps.promptNumber('Deposit amount USD (min $' + item.minDeposit + '):', 0, item.minDeposit);
        if (!amount) return;

        const result = this.invest(itemId, amount);
        alert(result.success ? 'Deposited $' + amount + ' into ' + item.name + '!' : result.error);
        if (result.success) this.render('liquidation-pools-container');
    },

    quickToggle(posId) {
        const result = this.toggleAutoLiquidate(posId);
        alert(result.success ? 'Auto-liquidate: ' + (result.autoLiquidate ? 'ENABLED' : 'DISABLED') : result.error);
        this.render('liquidation-pools-container');
    },

    quickWithdraw(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (pos.lockedCapital > 0) {
            alert('Cannot withdraw: $' + pos.lockedCapital.toFixed(2) + ' locked in pending liquidations');
            return;
        }
        if (!confirm('Withdraw all available capital?')) return;

        const result = this.withdraw(posId);
        alert(result.success
            ? 'Withdrawn $' + result.withdrawn + '! Net profit: $' + result.profit + ' (' + result.profitPct + '%). ' + result.totalLiquidations + ' liquidations at ' + result.successRate + '% success'
            : result.error);
        this.render('liquidation-pools-container');
    }
};

document.addEventListener('DOMContentLoaded', () => LiquidationPoolsModule.init());
