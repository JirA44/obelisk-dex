/**
 * VOLATILITY HARVESTER - Structured Products
 * Range-bound yield products that harvest volatility
 * High yield if price stays in range, capital converted if exits
 */
const VolatilityHarvester = {
    // Active products
    products: [],

    // Predefined strategies
    strategies: [
        {
            id: 'btc-range-narrow',
            name: 'BTC Tight Range',
            asset: 'BTC',
            icon: '₿',
            rangePercent: 5, // ±5% from current price
            baseApy: 25,
            duration: 7,
            risk: 'high'
        },
        {
            id: 'btc-range-medium',
            name: 'BTC Medium Range',
            asset: 'BTC',
            icon: '₿',
            rangePercent: 10, // ±10%
            baseApy: 15,
            duration: 14,
            risk: 'medium'
        },
        {
            id: 'btc-range-wide',
            name: 'BTC Wide Range',
            asset: 'BTC',
            icon: '₿',
            rangePercent: 20, // ±20%
            baseApy: 8,
            duration: 30,
            risk: 'low'
        },
        {
            id: 'eth-range-narrow',
            name: 'ETH Tight Range',
            asset: 'ETH',
            icon: 'Ξ',
            rangePercent: 7,
            baseApy: 22,
            duration: 7,
            risk: 'high'
        },
        {
            id: 'eth-range-medium',
            name: 'ETH Medium Range',
            asset: 'ETH',
            icon: 'Ξ',
            rangePercent: 15,
            baseApy: 12,
            duration: 14,
            risk: 'medium'
        },
        {
            id: 'sol-range',
            name: 'SOL Range Play',
            asset: 'SOL',
            icon: '◎',
            rangePercent: 12,
            baseApy: 30,
            duration: 7,
            risk: 'high'
        }
    ],

    // User positions
    positions: [],

    // Stats
    stats: {
        totalDeposited: 0,
        totalYieldPaid: 0,
        totalConverted: 0,
        winRate: 0,
        positionsCount: 0
    },

    // Mock prices
    prices: {
        BTC: 97000,
        ETH: 2650,
        SOL: 180
    },

    init() {
        this.load();
        this.startPriceSimulation();
        this.startPositionMonitor();
        console.log('[VolatilityHarvester] Initialized with', this.strategies.length, 'strategies');
    },

    load() {
        this.positions = JSON.parse(localStorage.getItem('obelisk_vh_positions') || '[]');
        this.stats = JSON.parse(localStorage.getItem('obelisk_vh_stats') || JSON.stringify(this.stats));
    },

    save() {
        localStorage.setItem('obelisk_vh_positions', JSON.stringify(this.positions));
        localStorage.setItem('obelisk_vh_stats', JSON.stringify(this.stats));
    },

    // Simulate price movements
    startPriceSimulation() {
        setInterval(() => {
            Object.keys(this.prices).forEach(asset => {
                // Random walk with mean reversion
                const change = (Math.random() - 0.5) * 0.002; // ±0.1%
                this.prices[asset] *= (1 + change);
            });
        }, 5000);
    },

    getCurrentPrice(asset) {
        // Try real price service first
        if (typeof PriceService !== 'undefined' && PriceService.getPrice) {
            const realPrice = PriceService.getPrice(asset);
            if (realPrice) return realPrice;
        }
        return this.prices[asset] || 0;
    },

    // Calculate range for a strategy
    calculateRange(strategyId, entryPrice = null) {
        const strategy = this.strategies.find(s => s.id === strategyId);
        if (!strategy) return null;

        const currentPrice = entryPrice || this.getCurrentPrice(strategy.asset);
        const rangeMultiplier = strategy.rangePercent / 100;

        return {
            strategy,
            currentPrice,
            lowerBound: currentPrice * (1 - rangeMultiplier),
            upperBound: currentPrice * (1 + rangeMultiplier),
            rangePercent: strategy.rangePercent,
            apy: strategy.baseApy,
            duration: strategy.duration
        };
    },

    // Create a new position
    createPosition(strategyId, amount) {
        if (amount < 100) return { success: false, error: 'Minimum: $100' };

        const range = this.calculateRange(strategyId);
        if (!range) return { success: false, error: 'Invalid strategy' };

        const strategy = range.strategy;
        const expectedYield = amount * (strategy.baseApy / 100) * (strategy.duration / 365);

        const position = {
            id: 'vh-' + Date.now(),
            strategyId,
            strategyName: strategy.name,
            asset: strategy.asset,
            icon: strategy.icon,
            amount,
            entryPrice: range.currentPrice,
            lowerBound: range.lowerBound,
            upperBound: range.upperBound,
            apy: strategy.baseApy,
            expectedYield,
            duration: strategy.duration,
            startTime: Date.now(),
            endTime: Date.now() + (strategy.duration * 24 * 60 * 60 * 1000),
            status: 'active',
            accruedYield: 0,
            exitedRange: false,
            exitPrice: null,
            exitTime: null
        };

        this.positions.push(position);
        this.stats.totalDeposited += amount;
        this.stats.positionsCount++;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(
                `🎯 Created ${strategy.name}: $${amount} | Range: $${range.lowerBound.toFixed(0)}-$${range.upperBound.toFixed(0)} | ${strategy.baseApy}% APY`,
                'success'
            );
        }

        return { success: true, position, range };
    },

    // Monitor all positions
    startPositionMonitor() {
        setInterval(() => {
            this.positions.filter(p => p.status === 'active').forEach(pos => {
                const currentPrice = this.getCurrentPrice(pos.asset);

                // Check if price exited range
                if (currentPrice < pos.lowerBound || currentPrice > pos.upperBound) {
                    if (!pos.exitedRange) {
                        pos.exitedRange = true;
                        pos.exitPrice = currentPrice;
                        pos.exitTime = Date.now();
                        this.handleRangeExit(pos);
                    }
                }

                // Accrue yield if still in range
                if (!pos.exitedRange) {
                    const elapsed = Date.now() - pos.startTime;
                    const totalDuration = pos.endTime - pos.startTime;
                    const progress = Math.min(1, elapsed / totalDuration);
                    pos.accruedYield = pos.expectedYield * progress;
                }

                // Check if matured
                if (Date.now() >= pos.endTime && pos.status === 'active') {
                    this.handleMaturity(pos);
                }
            });
            this.save();
        }, 5000);
    },

    handleRangeExit(position) {
        // Price exited range - convert capital at boundary price
        const exitDirection = position.exitPrice < position.lowerBound ? 'below' : 'above';
        const conversionPrice = exitDirection === 'below' ? position.lowerBound : position.upperBound;

        // Partial yield based on time in range
        const timeInRange = position.exitTime - position.startTime;
        const totalTime = position.endTime - position.startTime;
        const partialYield = position.expectedYield * (timeInRange / totalTime) * 0.5; // 50% of pro-rata yield

        position.finalYield = partialYield;
        position.conversionPrice = conversionPrice;
        position.convertedAmount = position.amount / conversionPrice; // Convert to asset
        position.status = 'converted';

        this.stats.totalConverted += position.amount;

        if (typeof showNotification === 'function') {
            showNotification(
                `⚠️ ${position.strategyName} exited range ${exitDirection}. Capital converted to ${position.convertedAmount.toFixed(6)} ${position.asset}`,
                'warning'
            );
        }
    },

    handleMaturity(position) {
        if (position.exitedRange) return;

        // Position stayed in range - full yield paid
        position.finalYield = position.expectedYield;
        position.status = 'matured';

        this.stats.totalYieldPaid += position.expectedYield;
        this.updateWinRate();

        if (typeof showNotification === 'function') {
            showNotification(
                `✅ ${position.strategyName} matured! Earned $${position.expectedYield.toFixed(2)} (${position.apy}% APY)`,
                'success'
            );
        }
    },

    updateWinRate() {
        const completed = this.positions.filter(p => p.status === 'matured' || p.status === 'converted');
        const wins = completed.filter(p => p.status === 'matured').length;
        this.stats.winRate = completed.length > 0 ? (wins / completed.length * 100) : 0;
    },

    // Withdraw a completed position
    withdraw(positionId) {
        const idx = this.positions.findIndex(p => p.id === positionId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const position = this.positions[idx];
        if (position.status === 'active') {
            return { success: false, error: 'Position still active' };
        }

        let withdrawAmount, asset;
        if (position.status === 'matured') {
            // Return principal + yield in USDC
            withdrawAmount = position.amount + position.finalYield;
            asset = 'USDC';
        } else {
            // Return converted asset amount
            withdrawAmount = position.convertedAmount;
            asset = position.asset;
        }

        position.status = 'withdrawn';
        position.withdrawTime = Date.now();
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`💰 Withdrawn ${withdrawAmount.toFixed(4)} ${asset}`, 'success');
        }

        return { success: true, amount: withdrawAmount, asset };
    },

    getStats() {
        const activePositions = this.positions.filter(p => p.status === 'active');
        const totalActive = activePositions.reduce((sum, p) => sum + p.amount, 0);
        const totalAccrued = activePositions.reduce((sum, p) => sum + p.accruedYield, 0);

        return {
            ...this.stats,
            activePositions: activePositions.length,
            totalActive,
            totalAccrued
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const activePositions = this.positions.filter(p => p.status === 'active' || p.status === 'matured' || p.status === 'converted');

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">📊 Volatility Harvester</h2>
                <p style="color:#888;margin-bottom:20px;">Earn high yields if price stays in range. Capital converts if it exits.</p>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Active Value</div>
                        <div style="color:#00ff88;font-size:20px;font-weight:bold;">$${stats.totalActive.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Accrued Yield</div>
                        <div style="color:#00aaff;font-size:20px;font-weight:bold;">+$${stats.totalAccrued.toFixed(2)}</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Yield Paid</div>
                        <div style="color:#ffaa00;font-size:20px;font-weight:bold;">$${stats.totalYieldPaid.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(255,68,68,0.1);border:1px solid rgba(255,68,68,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Converted</div>
                        <div style="color:#ff4444;font-size:20px;font-weight:bold;">$${stats.totalConverted.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(136,0,255,0.1);border:1px solid rgba(136,0,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Win Rate</div>
                        <div style="color:#8800ff;font-size:20px;font-weight:bold;">${stats.winRate.toFixed(0)}%</div>
                    </div>
                </div>

                <!-- Live Prices -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;margin-bottom:24px;">
                    <div style="display:flex;gap:24px;justify-content:center;">
                        ${Object.entries(this.prices).map(([asset, price]) => `
                            <div style="text-align:center;">
                                <div style="color:#888;font-size:11px;">${asset}</div>
                                <div style="color:#fff;font-size:18px;font-weight:bold;">$${price.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Strategies -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">🎯 Available Strategies</h3>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                        ${this.strategies.map(s => {
                            const range = this.calculateRange(s.id);
                            const riskColor = s.risk === 'low' ? '#00ff88' : s.risk === 'medium' ? '#ffaa00' : '#ff4444';
                            return `
                                <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                        <span style="font-size:24px;">${s.icon}</span>
                                        <span style="background:${riskColor};color:#000;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;">${s.risk.toUpperCase()}</span>
                                    </div>
                                    <div style="font-weight:bold;color:#fff;margin-bottom:4px;">${s.name}</div>
                                    <div style="color:#00ff88;font-size:24px;font-weight:bold;margin-bottom:8px;">${s.baseApy}% APY</div>
                                    <div style="color:#888;font-size:11px;margin-bottom:4px;">
                                        Range: ±${s.rangePercent}% (${s.duration} days)
                                    </div>
                                    <div style="color:#666;font-size:10px;margin-bottom:12px;">
                                        $${range?.lowerBound.toFixed(0)} - $${range?.upperBound.toFixed(0)}
                                    </div>
                                    <div style="display:flex;gap:8px;">
                                        <input type="number" id="vh-amount-${s.id}" placeholder="1000" min="100"
                                               style="flex:1;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;">
                                        <button onclick="VolatilityHarvester.createFromUI('${s.id}')"
                                                style="padding:8px 16px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:12px;">
                                            Enter
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Active Positions -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📋 Your Positions (${activePositions.length})</h3>
                    ${activePositions.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">
                            No positions yet. Select a strategy above to start harvesting volatility!
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            ${activePositions.map(pos => {
                                const currentPrice = this.getCurrentPrice(pos.asset);
                                const priceInRange = currentPrice >= pos.lowerBound && currentPrice <= pos.upperBound;
                                const progress = Math.min(100, (Date.now() - pos.startTime) / (pos.endTime - pos.startTime) * 100);

                                return `
                                    <div style="background:rgba(255,255,255,0.03);border:1px solid ${pos.status === 'matured' ? 'rgba(0,255,136,0.4)' : pos.status === 'converted' ? 'rgba(255,68,68,0.4)' : 'rgba(255,255,255,0.1)'};border-radius:8px;padding:16px;">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                            <div>
                                                <span style="font-size:18px;">${pos.icon}</span>
                                                <span style="font-weight:bold;color:#fff;margin-left:8px;">${pos.strategyName}</span>
                                                <span style="color:#00ff88;margin-left:12px;">$${pos.amount}</span>
                                            </div>
                                            <div style="text-align:right;">
                                                ${pos.status === 'active' ? `
                                                    <div style="color:${priceInRange ? '#00ff88' : '#ff4444'};font-weight:bold;">
                                                        ${priceInRange ? '✅ IN RANGE' : '⚠️ OUT OF RANGE'}
                                                    </div>
                                                ` : pos.status === 'matured' ? `
                                                    <div style="color:#00ff88;font-weight:bold;">✅ MATURED</div>
                                                ` : `
                                                    <div style="color:#ff4444;font-weight:bold;">🔄 CONVERTED</div>
                                                `}
                                            </div>
                                        </div>

                                        <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:8px;">
                                            <span>Range: $${pos.lowerBound.toFixed(0)} - $${pos.upperBound.toFixed(0)}</span>
                                            <span>Current: $${currentPrice.toFixed(0)}</span>
                                            <span>APY: ${pos.apy}%</span>
                                        </div>

                                        ${pos.status === 'active' ? `
                                            <div style="background:rgba(255,255,255,0.1);border-radius:4px;height:6px;margin-bottom:8px;">
                                                <div style="background:${priceInRange ? 'linear-gradient(90deg,#00ff88,#00aaff)' : '#ff4444'};height:100%;border-radius:4px;width:${progress}%;"></div>
                                            </div>
                                            <div style="display:flex;justify-content:space-between;font-size:11px;color:#888;">
                                                <span>Accrued: <span style="color:#00ff88;">+$${pos.accruedYield.toFixed(4)}</span></span>
                                                <span>Expected: +$${pos.expectedYield.toFixed(2)}</span>
                                            </div>
                                        ` : `
                                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                                <div style="font-size:12px;">
                                                    ${pos.status === 'matured' ? `
                                                        <span style="color:#00ff88;">Earned: +$${pos.finalYield.toFixed(2)}</span>
                                                    ` : `
                                                        <span style="color:#888;">Converted to ${pos.convertedAmount.toFixed(6)} ${pos.asset}</span>
                                                    `}
                                                </div>
                                                <button onclick="VolatilityHarvester.withdraw('${pos.id}');VolatilityHarvester.render('${containerId}')"
                                                        style="padding:8px 16px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:12px;">
                                                    Withdraw
                                                </button>
                                            </div>
                                        `}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    createFromUI(strategyId) {
        const amount = parseFloat(document.getElementById(`vh-amount-${strategyId}`)?.value || 0);
        if (amount < 100) {
            if (typeof showNotification === 'function') {
                showNotification('Minimum: $100', 'error');
            }
            return;
        }

        const result = this.createPosition(strategyId, amount);
        if (result.success) {
            this.render('volatility-harvester-container');
        }
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => VolatilityHarvester.init());
window.VolatilityHarvester = VolatilityHarvester;
console.log('[VolatilityHarvester] Module loaded');
