/**
 * AUTO REBALANCER - Portfolio Rebalancing
 * Maintain target allocations automatically
 */
const AutoRebalancerModule = {
    portfolios: [],
    rebalances: [],

    presets: {
        conservative: { name: 'Conservative', icon: '🛡️', allocation: { BTC: 50, ETH: 30, USDC: 20 } },
        balanced: { name: 'Balanced', icon: '⚖️', allocation: { BTC: 35, ETH: 35, SOL: 15, USDC: 15 } },
        aggressive: { name: 'Aggressive', icon: '🚀', allocation: { ETH: 40, SOL: 25, ARB: 20, LINK: 15 } },
        degen: { name: 'Degen', icon: '🎰', allocation: { SOL: 30, ARB: 25, PEPE: 25, WIF: 20 } }
    },

    assets: {
        BTC: { price: 97000, icon: '₿' },
        ETH: { price: 2650, icon: 'Ξ' },
        SOL: { price: 125, icon: '◎' },
        ARB: { price: 0.85, icon: '🔵' },
        LINK: { price: 18, icon: '⬡' },
        USDC: { price: 1, icon: '💵' },
        PEPE: { price: 0.000012, icon: '🐸' },
        WIF: { price: 1.8, icon: '🐕' }
    },

    init() {
        this.portfolios = JSON.parse(localStorage.getItem('obelisk_rebalance_portfolios') || '[]');
        this.rebalances = JSON.parse(localStorage.getItem('obelisk_rebalances') || '[]');
    },

    save() {
        localStorage.setItem('obelisk_rebalance_portfolios', JSON.stringify(this.portfolios));
        localStorage.setItem('obelisk_rebalances', JSON.stringify(this.rebalances));
    },

    createPortfolio(data) {
        const portfolio = {
            id: 'port-' + Date.now(),
            name: data.name,
            preset: data.preset,
            targetAllocation: data.allocation || this.presets[data.preset]?.allocation || {},
            currentHoldings: {},
            totalValue: data.initialValue || 10000,
            threshold: data.threshold || 5, // Rebalance when off by 5%
            frequency: data.frequency || 'weekly',
            lastRebalance: null,
            createdAt: Date.now()
        };

        // Initialize holdings based on target
        Object.entries(portfolio.targetAllocation).forEach(([asset, pct]) => {
            const value = portfolio.totalValue * pct / 100;
            portfolio.currentHoldings[asset] = value / this.assets[asset].price;
        });

        this.portfolios.push(portfolio);
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`📊 Portfolio "${data.name}" created with $${portfolio.totalValue}`, 'success');
        }

        return portfolio;
    },

    calculateDrift(portfolio) {
        let totalValue = 0;
        const currentAllocation = {};

        Object.entries(portfolio.currentHoldings).forEach(([asset, amount]) => {
            const value = amount * this.assets[asset].price;
            totalValue += value;
            currentAllocation[asset] = value;
        });

        const drift = {};
        let maxDrift = 0;

        Object.entries(portfolio.targetAllocation).forEach(([asset, targetPct]) => {
            const currentPct = (currentAllocation[asset] || 0) / totalValue * 100;
            drift[asset] = {
                target: targetPct,
                current: currentPct,
                diff: currentPct - targetPct
            };
            maxDrift = Math.max(maxDrift, Math.abs(drift[asset].diff));
        });

        return { drift, maxDrift, totalValue };
    },

    rebalance(portfolioId) {
        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        if (!portfolio) return;

        const { drift, totalValue } = this.calculateDrift(portfolio);
        const trades = [];

        Object.entries(portfolio.targetAllocation).forEach(([asset, targetPct]) => {
            const targetValue = totalValue * targetPct / 100;
            const currentValue = (portfolio.currentHoldings[asset] || 0) * this.assets[asset].price;
            const diff = targetValue - currentValue;

            if (Math.abs(diff) > 10) {
                trades.push({
                    asset,
                    action: diff > 0 ? 'BUY' : 'SELL',
                    amount: Math.abs(diff) / this.assets[asset].price,
                    value: Math.abs(diff)
                });
                portfolio.currentHoldings[asset] = targetValue / this.assets[asset].price;
            }
        });

        portfolio.totalValue = totalValue;
        portfolio.lastRebalance = Date.now();

        this.rebalances.push({
            id: 'reb-' + Date.now(),
            portfolioId,
            trades,
            timestamp: Date.now()
        });

        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`✅ Portfolio rebalanced: ${trades.length} trades executed`, 'success');
        }
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">⚖️ Auto Rebalancer</h2>
                <p style="color:#888;margin-bottom:20px;">Maintain target allocations • Automatic rebalancing • Risk management</p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <!-- Create Portfolio -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">➕ Create Portfolio</h3>
                        <div style="display:grid;gap:12px;">
                            <div>
                                <label style="color:#888;font-size:12px;">Portfolio Name</label>
                                <input type="text" id="rebal-name" placeholder="My Portfolio"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Strategy Preset</label>
                                <select id="rebal-preset" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                    ${Object.entries(this.presets).map(([key, preset]) => `
                                        <option value="${key}">${preset.icon} ${preset.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Initial Value (USD)</label>
                                <input type="number" id="rebal-value" placeholder="10000" value="10000"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Rebalance Threshold</label>
                                <select id="rebal-threshold" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                    <option value="3">3% drift</option>
                                    <option value="5" selected>5% drift</option>
                                    <option value="10">10% drift</option>
                                </select>
                            </div>
                            <button onclick="AutoRebalancerModule.createFromUI('${containerId}')"
                                    style="padding:12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                                Create Portfolio
                            </button>
                        </div>
                    </div>

                    <!-- Presets -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📋 Strategy Presets</h3>
                        <div style="display:grid;gap:12px;">
                            ${Object.entries(this.presets).map(([key, preset]) => `
                                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;">
                                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                                        <span style="font-size:20px;">${preset.icon}</span>
                                        <span style="color:#fff;font-weight:bold;">${preset.name}</span>
                                    </div>
                                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                                        ${Object.entries(preset.allocation).map(([asset, pct]) => `
                                            <span style="padding:2px 8px;background:rgba(0,255,136,0.2);border-radius:4px;font-size:11px;color:#00ff88;">
                                                ${this.assets[asset]?.icon || ''} ${asset} ${pct}%
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Active Portfolios -->
                <div style="margin-top:20px;background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📊 Active Portfolios (${this.portfolios.length})</h3>
                    ${this.portfolios.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">
                            <div style="font-size:48px;margin-bottom:16px;">⚖️</div>
                            <div>No portfolios yet</div>
                        </div>
                    ` : `
                        <div style="display:grid;gap:16px;">
                            ${this.portfolios.map(portfolio => {
                                const { drift, maxDrift, totalValue } = this.calculateDrift(portfolio);
                                const needsRebalance = maxDrift > portfolio.threshold;
                                return `
                                    <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;border-left:3px solid ${needsRebalance ? '#ffaa00' : '#00ff88'};">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                            <div>
                                                <div style="color:#fff;font-weight:bold;font-size:16px;">${portfolio.name}</div>
                                                <div style="color:#888;font-size:12px;">${this.presets[portfolio.preset]?.icon || ''} ${this.presets[portfolio.preset]?.name || 'Custom'}</div>
                                            </div>
                                            <div style="text-align:right;">
                                                <div style="color:#00ff88;font-size:20px;font-weight:bold;">$${totalValue.toFixed(0)}</div>
                                                <div style="color:${needsRebalance ? '#ffaa00' : '#888'};font-size:11px;">
                                                    Max drift: ${maxDrift.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div style="display:grid;grid-template-columns:repeat(${Object.keys(portfolio.targetAllocation).length},1fr);gap:8px;margin-bottom:12px;">
                                            ${Object.entries(drift).map(([asset, data]) => `
                                                <div style="text-align:center;">
                                                    <div style="color:#888;font-size:10px;">${asset}</div>
                                                    <div style="color:#fff;font-weight:bold;">${data.current.toFixed(1)}%</div>
                                                    <div style="color:${Math.abs(data.diff) > portfolio.threshold ? '#ffaa00' : '#888'};font-size:10px;">
                                                        (${data.diff > 0 ? '+' : ''}${data.diff.toFixed(1)}%)
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                        <button onclick="AutoRebalancerModule.rebalance('${portfolio.id}');AutoRebalancerModule.render('${containerId}')"
                                                style="width:100%;padding:10px;background:${needsRebalance ? 'linear-gradient(135deg,#ffaa00,#ff8800)' : 'rgba(0,255,136,0.2)'};border:${needsRebalance ? 'none' : '1px solid rgba(0,255,136,0.4)'};border-radius:8px;color:${needsRebalance ? '#000' : '#00ff88'};font-weight:bold;cursor:pointer;">
                                            ${needsRebalance ? '⚠️ Rebalance Now' : '✓ Balanced'}
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

    createFromUI(containerId) {
        const name = document.getElementById('rebal-name')?.value || 'My Portfolio';
        const preset = document.getElementById('rebal-preset')?.value || 'balanced';
        const initialValue = parseFloat(document.getElementById('rebal-value')?.value || 10000);
        const threshold = parseInt(document.getElementById('rebal-threshold')?.value || 5);

        this.createPortfolio({
            name,
            preset,
            allocation: this.presets[preset]?.allocation,
            initialValue,
            threshold
        });

        this.render(containerId);
    }
};

document.addEventListener('DOMContentLoaded', () => AutoRebalancerModule.init());
window.AutoRebalancerModule = AutoRebalancerModule;
