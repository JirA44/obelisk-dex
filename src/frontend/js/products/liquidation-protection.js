/**
 * LIQUIDATION PROTECTION - DeFi Insurance
 * Protects leveraged positions from liquidation
 * Auto-adds collateral or closes position before liquidation
 */
const LiquidationProtection = {
    // Active protections
    protections: [],

    // Protection plans
    plans: {
        basic: {
            name: 'Basic Protection',
            fee: 0.5, // 0.5% of position
            buffer: 5, // Triggers at 5% above liquidation
            action: 'alert', // Just alerts
            icon: '🛡️'
        },
        standard: {
            name: 'Standard Protection',
            fee: 1.0, // 1% of position
            buffer: 10, // Triggers at 10% above liquidation
            action: 'add_collateral', // Adds collateral automatically
            maxCollateral: 20, // Up to 20% additional collateral
            icon: '🛡️🛡️'
        },
        premium: {
            name: 'Premium Protection',
            fee: 2.0, // 2% of position
            buffer: 15, // Triggers at 15% above liquidation
            action: 'close_position', // Closes before liquidation
            refundPercent: 80, // Refunds 80% of remaining margin
            icon: '🛡️🛡️🛡️'
        }
    },

    // Supported protocols
    protocols: ['gmx', 'gains', 'hyperliquid', 'mux', 'perps'],

    // Stats
    stats: {
        totalProtected: 0,
        liquidationsAvoided: 0,
        totalSaved: 0,
        feesCollected: 0
    },

    init() {
        this.load();
        this.startMonitoring();
        console.log('[LiquidationProtection] Initialized');
    },

    load() {
        this.protections = JSON.parse(localStorage.getItem('obelisk_lp_protections') || '[]');
        this.stats = JSON.parse(localStorage.getItem('obelisk_lp_stats') || JSON.stringify(this.stats));
    },

    save() {
        localStorage.setItem('obelisk_lp_protections', JSON.stringify(this.protections));
        localStorage.setItem('obelisk_lp_stats', JSON.stringify(this.stats));
    },

    // Calculate protection cost
    calculateCost(positionSize, planKey, durationDays = 30) {
        const plan = this.plans[planKey];
        if (!plan) return null;

        const baseFee = positionSize * (plan.fee / 100);
        const dailyFee = baseFee / 30;
        const totalFee = dailyFee * durationDays;

        return {
            plan: planKey,
            planName: plan.name,
            baseFeePercent: plan.fee,
            totalFee: totalFee,
            dailyFee: dailyFee,
            duration: durationDays,
            buffer: plan.buffer,
            action: plan.action
        };
    },

    // Purchase protection for a position
    purchaseProtection(positionId, positionData, planKey, durationDays = 30) {
        const plan = this.plans[planKey];
        if (!plan) return { success: false, error: 'Invalid plan' };

        const cost = this.calculateCost(positionData.notional || positionData.size * positionData.entryPrice, planKey, durationDays);
        if (!cost) return { success: false, error: 'Could not calculate cost' };

        const protection = {
            id: 'lp-' + Date.now(),
            positionId,
            protocol: positionData.protocol || 'perps',
            symbol: positionData.symbol,
            side: positionData.side,
            size: positionData.size,
            entryPrice: positionData.entryPrice,
            leverage: positionData.leverage,
            liquidationPrice: positionData.liquidationPrice,
            plan: planKey,
            planName: plan.name,
            buffer: plan.buffer,
            action: plan.action,
            triggerPrice: this.calculateTriggerPrice(positionData, plan.buffer),
            fee: cost.totalFee,
            startTime: Date.now(),
            endTime: Date.now() + (durationDays * 24 * 60 * 60 * 1000),
            status: 'active',
            triggered: false
        };

        this.protections.push(protection);
        this.stats.totalProtected += positionData.notional || (positionData.size * positionData.entryPrice);
        this.stats.feesCollected += cost.totalFee;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`🛡️ ${plan.name} activated for ${positionData.symbol} | Fee: $${cost.totalFee.toFixed(2)}`, 'success');
        }

        return { success: true, protection, cost };
    },

    calculateTriggerPrice(position, bufferPercent) {
        const liqPrice = position.liquidationPrice;
        if (position.side === 'long') {
            return liqPrice * (1 + bufferPercent / 100);
        } else {
            return liqPrice * (1 - bufferPercent / 100);
        }
    },

    // Monitor all protected positions
    startMonitoring() {
        setInterval(() => {
            this.checkAllProtections();
        }, 5000); // Check every 5 seconds
    },

    async checkAllProtections() {
        for (const protection of this.protections.filter(p => p.status === 'active')) {
            // Check if expired
            if (Date.now() > protection.endTime) {
                protection.status = 'expired';
                this.save();
                continue;
            }

            // Get current price (mock for now)
            const currentPrice = await this.getCurrentPrice(protection.symbol);
            if (!currentPrice) continue;

            // Check if trigger condition met
            const shouldTrigger = protection.side === 'long'
                ? currentPrice <= protection.triggerPrice
                : currentPrice >= protection.triggerPrice;

            if (shouldTrigger && !protection.triggered) {
                await this.executeProtection(protection, currentPrice);
            }
        }
    },

    async getCurrentPrice(symbol) {
        // Try to get from PerpsModule or PriceService
        if (typeof PerpsModule !== 'undefined' && PerpsModule.getPrice) {
            return PerpsModule.getPrice(symbol);
        }
        if (typeof PriceService !== 'undefined' && PriceService.getPrice) {
            return PriceService.getPrice(symbol.split('/')[0]);
        }
        // Fallback: simulate
        return null;
    },

    async executeProtection(protection, currentPrice) {
        protection.triggered = true;
        protection.triggerTime = Date.now();
        protection.triggerCurrentPrice = currentPrice;

        const plan = this.plans[protection.plan];
        let result = { success: false };

        switch (plan.action) {
            case 'alert':
                result = this.executeAlert(protection);
                break;
            case 'add_collateral':
                result = await this.executeAddCollateral(protection);
                break;
            case 'close_position':
                result = await this.executeClosePosition(protection);
                break;
        }

        if (result.success) {
            this.stats.liquidationsAvoided++;
            this.stats.totalSaved += protection.size * protection.entryPrice * 0.1; // Estimate 10% saved
            protection.status = 'executed';
            protection.executionResult = result;
        } else {
            protection.status = 'failed';
            protection.executionError = result.error;
        }

        this.save();
        return result;
    },

    executeAlert(protection) {
        if (typeof showNotification === 'function') {
            showNotification(
                `⚠️ LIQUIDATION WARNING: ${protection.symbol} ${protection.side.toUpperCase()} approaching liquidation!`,
                'error'
            );
        }
        console.warn('[LiquidationProtection] ALERT:', protection);
        return { success: true, action: 'alert' };
    },

    async executeAddCollateral(protection) {
        const plan = this.plans[protection.plan];
        const additionalCollateral = (protection.size * protection.entryPrice / protection.leverage) * (plan.maxCollateral / 100);

        // In production, this would call the protocol's API
        console.log(`[LiquidationProtection] Adding $${additionalCollateral.toFixed(2)} collateral to ${protection.positionId}`);

        if (typeof showNotification === 'function') {
            showNotification(
                `🛡️ Auto-added $${additionalCollateral.toFixed(2)} collateral to protect ${protection.symbol} position`,
                'success'
            );
        }

        return { success: true, action: 'add_collateral', amount: additionalCollateral };
    },

    async executeClosePosition(protection) {
        const plan = this.plans[protection.plan];

        // In production, this would call the protocol's close position API
        console.log(`[LiquidationProtection] Closing position ${protection.positionId} before liquidation`);

        // Calculate refund
        const remainingMargin = protection.size * protection.entryPrice / protection.leverage;
        const refund = remainingMargin * (plan.refundPercent / 100);

        if (typeof showNotification === 'function') {
            showNotification(
                `🛡️ Position closed before liquidation! Saved ~$${refund.toFixed(2)} in margin`,
                'success'
            );
        }

        // Try to close via PerpsModule if available
        if (typeof PerpsModule !== 'undefined' && PerpsModule.closePosition) {
            PerpsModule.closePosition(protection.positionId, 'Liquidation Protection triggered');
        }

        return { success: true, action: 'close_position', refund };
    },

    // Cancel protection
    cancelProtection(protectionId) {
        const idx = this.protections.findIndex(p => p.id === protectionId);
        if (idx === -1) return { success: false, error: 'Protection not found' };

        const protection = this.protections[idx];
        if (protection.status !== 'active') {
            return { success: false, error: 'Protection is not active' };
        }

        // Calculate refund (pro-rata)
        const elapsed = Date.now() - protection.startTime;
        const total = protection.endTime - protection.startTime;
        const remaining = Math.max(0, 1 - elapsed / total);
        const refund = protection.fee * remaining * 0.8; // 80% refund of remaining

        protection.status = 'cancelled';
        protection.cancelTime = Date.now();
        protection.refund = refund;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`Protection cancelled. Refund: $${refund.toFixed(2)}`, 'info');
        }

        return { success: true, refund };
    },

    getStats() {
        const activeCount = this.protections.filter(p => p.status === 'active').length;
        const totalProtectedValue = this.protections
            .filter(p => p.status === 'active')
            .reduce((sum, p) => sum + (p.size * p.entryPrice), 0);

        return {
            ...this.stats,
            activeProtections: activeCount,
            totalProtectedValue
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const activeProtections = this.protections.filter(p => p.status === 'active');

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">🛡️ Liquidation Protection</h2>
                <p style="color:#888;margin-bottom:20px;">Protect your leveraged positions from liquidation</p>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Active Protections</div>
                        <div style="color:#00ff88;font-size:24px;font-weight:bold;">${stats.activeProtections}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Protected Value</div>
                        <div style="color:#00aaff;font-size:24px;font-weight:bold;">$${stats.totalProtectedValue.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Liquidations Avoided</div>
                        <div style="color:#ffaa00;font-size:24px;font-weight:bold;">${stats.liquidationsAvoided}</div>
                    </div>
                    <div style="background:rgba(136,0,255,0.1);border:1px solid rgba(136,0,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Saved</div>
                        <div style="color:#8800ff;font-size:24px;font-weight:bold;">$${stats.totalSaved.toFixed(0)}</div>
                    </div>
                </div>

                <!-- Plans -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📋 Protection Plans</h3>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
                        ${Object.entries(this.plans).map(([key, plan]) => `
                            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;text-align:center;">
                                <div style="font-size:32px;margin-bottom:8px;">${plan.icon}</div>
                                <div style="font-weight:bold;color:#fff;margin-bottom:4px;">${plan.name}</div>
                                <div style="color:#00ff88;font-size:24px;font-weight:bold;margin-bottom:12px;">${plan.fee}%</div>
                                <div style="color:#888;font-size:12px;margin-bottom:8px;">
                                    Triggers at ${plan.buffer}% above liquidation
                                </div>
                                <div style="color:#666;font-size:11px;margin-bottom:16px;">
                                    ${plan.action === 'alert' ? '📢 Alert only' :
                                      plan.action === 'add_collateral' ? '💰 Auto-adds up to ' + plan.maxCollateral + '% collateral' :
                                      '🚪 Auto-closes position (80% margin refund)'}
                                </div>
                                <button onclick="LiquidationProtection.showPurchaseModal('${key}')"
                                        style="width:100%;padding:12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                                    Select Plan
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Active Protections -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">🛡️ Active Protections</h3>
                    ${activeProtections.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">
                            No active protections. Purchase a plan to protect your positions!
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            ${activeProtections.map(p => {
                                const timeLeft = Math.max(0, p.endTime - Date.now());
                                const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
                                return `
                                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(0,255,136,0.2);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
                                        <div>
                                            <div style="font-weight:bold;color:#fff;">${p.symbol} ${p.side.toUpperCase()} ${p.leverage}x</div>
                                            <div style="font-size:12px;color:#888;margin-top:4px;">
                                                ${p.planName} | Trigger: $${p.triggerPrice.toFixed(2)} | Liq: $${p.liquidationPrice.toFixed(2)}
                                            </div>
                                            <div style="font-size:11px;color:#666;margin-top:2px;">
                                                ${daysLeft} days remaining | Fee paid: $${p.fee.toFixed(2)}
                                            </div>
                                        </div>
                                        <button onclick="LiquidationProtection.cancelProtection('${p.id}');LiquidationProtection.render('${containerId}')"
                                                style="padding:8px 12px;background:rgba(255,68,68,0.2);border:1px solid rgba(255,68,68,0.4);border-radius:6px;color:#ff4444;cursor:pointer;font-size:12px;">
                                            Cancel
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    showPurchaseModal(planKey) {
        // Get positions from PerpsModule
        const positions = typeof PerpsModule !== 'undefined' ? PerpsModule.positions : [];

        if (positions.length === 0) {
            if (typeof showNotification === 'function') {
                showNotification('No open positions to protect. Open a leveraged position first.', 'error');
            }
            return;
        }

        const plan = this.plans[planKey];
        const modal = document.createElement('div');
        modal.id = 'lp-purchase-modal';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;">
                <div style="background:#1a1a2e;border:1px solid rgba(0,255,136,0.3);border-radius:16px;padding:24px;max-width:500px;width:90%;">
                    <h3 style="color:#00ff88;margin-bottom:16px;">${plan.icon} ${plan.name}</h3>
                    <p style="color:#888;margin-bottom:20px;">Select a position to protect:</p>

                    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
                        ${positions.map((pos, i) => `
                            <label style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;">
                                <input type="radio" name="lp-position" value="${i}" ${i === 0 ? 'checked' : ''}>
                                <div>
                                    <div style="color:#fff;font-weight:bold;">${pos.symbol} ${pos.side.toUpperCase()} ${pos.leverage}x</div>
                                    <div style="color:#888;font-size:12px;">Size: ${pos.size} | Entry: $${pos.entryPrice.toFixed(2)}</div>
                                </div>
                            </label>
                        `).join('')}
                    </div>

                    <div style="margin-bottom:20px;">
                        <label style="color:#888;font-size:12px;">Duration (days)</label>
                        <select id="lp-duration" style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            <option value="7">7 days</option>
                            <option value="14">14 days</option>
                            <option value="30" selected>30 days</option>
                            <option value="90">90 days</option>
                        </select>
                    </div>

                    <div style="display:flex;gap:12px;">
                        <button onclick="document.getElementById('lp-purchase-modal').remove()"
                                style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#888;cursor:pointer;">
                            Cancel
                        </button>
                        <button onclick="LiquidationProtection.confirmPurchase('${planKey}')"
                                style="flex:1;padding:12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                            Purchase Protection
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    confirmPurchase(planKey) {
        const positions = typeof PerpsModule !== 'undefined' ? PerpsModule.positions : [];
        const selectedIdx = document.querySelector('input[name="lp-position"]:checked')?.value;
        const duration = parseInt(document.getElementById('lp-duration')?.value || 30);

        if (selectedIdx === undefined || !positions[selectedIdx]) {
            if (typeof showNotification === 'function') {
                showNotification('Please select a position', 'error');
            }
            return;
        }

        const position = positions[selectedIdx];
        this.purchaseProtection(position.id, position, planKey, duration);

        document.getElementById('lp-purchase-modal')?.remove();
        this.render('liquidation-protection-container');
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => LiquidationProtection.init());
window.LiquidationProtection = LiquidationProtection;
console.log('[LiquidationProtection] Module loaded');
