/**
 * DCA VAULT - Dollar Cost Average Automation
 * Automated recurring purchases to smooth volatility
 */
const DCAVaultModule = {
    plans: [],
    executions: [],

    frequencies: {
        hourly: { name: 'Hourly', ms: 3600000, icon: '⏰' },
        daily: { name: 'Daily', ms: 86400000, icon: '📅' },
        weekly: { name: 'Weekly', ms: 604800000, icon: '📆' },
        biweekly: { name: 'Bi-weekly', ms: 1209600000, icon: '🗓️' },
        monthly: { name: 'Monthly', ms: 2592000000, icon: '📋' }
    },

    assets: [
        { symbol: 'BTC', name: 'Bitcoin', icon: '₿', price: 97000 },
        { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', price: 2650 },
        { symbol: 'SOL', name: 'Solana', icon: '◎', price: 125 },
        { symbol: 'ARB', name: 'Arbitrum', icon: '🔵', price: 0.85 },
        { symbol: 'LINK', name: 'Chainlink', icon: '⬡', price: 18 },
        { symbol: 'AAVE', name: 'Aave', icon: '👻', price: 185 }
    ],

    init() {
        this.plans = JSON.parse(localStorage.getItem('obelisk_dca_plans') || '[]');
        this.executions = JSON.parse(localStorage.getItem('obelisk_dca_executions') || '[]');
        this.startScheduler();
    },

    save() {
        localStorage.setItem('obelisk_dca_plans', JSON.stringify(this.plans));
        localStorage.setItem('obelisk_dca_executions', JSON.stringify(this.executions));
    },

    createPlan(data) {
        const plan = {
            id: 'dca-' + Date.now(),
            asset: data.asset,
            amount: data.amount,
            frequency: data.frequency,
            startDate: data.startDate || Date.now(),
            endDate: data.endDate || null,
            totalInvested: 0,
            totalAcquired: 0,
            executionCount: 0,
            nextExecution: data.startDate || Date.now(),
            isActive: true,
            createdAt: Date.now()
        };

        this.plans.push(plan);
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`📊 DCA Plan created: $${data.amount} in ${data.asset} ${this.frequencies[data.frequency]?.name}`, 'success');
        }

        return plan;
    },

    executeDCA(planId) {
        const plan = this.plans.find(p => p.id === planId);
        if (!plan || !plan.isActive) return;

        const asset = this.assets.find(a => a.symbol === plan.asset);
        const price = asset ? asset.price * (0.98 + Math.random() * 0.04) : 100;
        const acquired = plan.amount / price;

        const execution = {
            id: 'exec-' + Date.now(),
            planId,
            asset: plan.asset,
            amount: plan.amount,
            price,
            acquired,
            timestamp: Date.now()
        };

        this.executions.push(execution);
        plan.totalInvested += plan.amount;
        plan.totalAcquired += acquired;
        plan.executionCount++;
        plan.nextExecution = Date.now() + this.frequencies[plan.frequency].ms;

        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`✅ DCA executed: ${acquired.toFixed(6)} ${plan.asset} @ $${price.toFixed(2)}`, 'success');
        }
    },

    startScheduler() {
        setInterval(() => {
            const now = Date.now();
            this.plans.filter(p => p.isActive && p.nextExecution <= now).forEach(plan => {
                this.executeDCA(plan.id);
            });
        }, 60000);
    },

    getStats() {
        const activePlans = this.plans.filter(p => p.isActive).length;
        const totalInvested = this.plans.reduce((sum, p) => sum + p.totalInvested, 0);
        const totalExecutions = this.executions.length;

        return { activePlans, totalInvested, totalExecutions };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">📊 DCA Vault</h2>
                <p style="color:#888;margin-bottom:20px;">Automated Dollar Cost Averaging • Reduce volatility risk • Set & forget</p>

                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Active Plans</div>
                        <div style="color:#00ff88;font-size:24px;font-weight:bold;">${stats.activePlans}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Invested</div>
                        <div style="color:#00aaff;font-size:24px;font-weight:bold;">$${stats.totalInvested.toLocaleString()}</div>
                    </div>
                    <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Executions</div>
                        <div style="color:#a855f7;font-size:24px;font-weight:bold;">${stats.totalExecutions}</div>
                    </div>
                </div>

                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">➕ Create DCA Plan</h3>
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;align-items:end;">
                        <div>
                            <label style="color:#888;font-size:12px;">Asset</label>
                            <select id="dca-asset" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                ${this.assets.map(a => `<option value="${a.symbol}">${a.icon} ${a.symbol}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="color:#888;font-size:12px;">Amount (USD)</label>
                            <input type="number" id="dca-amount" placeholder="100" value="100"
                                   style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                        </div>
                        <div>
                            <label style="color:#888;font-size:12px;">Frequency</label>
                            <select id="dca-frequency" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                ${Object.entries(this.frequencies).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('')}
                            </select>
                        </div>
                        <button onclick="DCAVaultModule.createFromUI()"
                                style="padding:10px 20px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                            Create Plan
                        </button>
                    </div>
                </div>

                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📋 Active Plans</h3>
                    ${this.plans.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">No DCA plans yet</div>
                    ` : `
                        <div style="display:grid;gap:12px;">
                            ${this.plans.filter(p => p.isActive).map(p => {
                                const asset = this.assets.find(a => a.symbol === p.asset);
                                const avgPrice = p.executionCount > 0 ? p.totalInvested / p.totalAcquired : 0;
                                const currentValue = p.totalAcquired * (asset?.price || 0);
                                const pnl = currentValue - p.totalInvested;
                                return `
                                    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
                                        <div>
                                            <div style="color:#fff;font-weight:bold;">${asset?.icon || ''} ${p.asset}</div>
                                            <div style="color:#888;font-size:12px;">$${p.amount} ${this.frequencies[p.frequency]?.name}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <div style="color:#888;font-size:11px;">Invested</div>
                                            <div style="color:#fff;">$${p.totalInvested.toFixed(0)}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <div style="color:#888;font-size:11px;">Acquired</div>
                                            <div style="color:#fff;">${p.totalAcquired.toFixed(4)}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <div style="color:#888;font-size:11px;">Avg Price</div>
                                            <div style="color:#fff;">$${avgPrice.toFixed(2)}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <div style="color:#888;font-size:11px;">P&L</div>
                                            <div style="color:${pnl >= 0 ? '#00ff88' : '#ff4444'};">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</div>
                                        </div>
                                        <button onclick="DCAVaultModule.executeDCA('${p.id}');DCAVaultModule.render('${containerId}')"
                                                style="padding:6px 12px;background:rgba(0,255,136,0.2);border:1px solid rgba(0,255,136,0.4);border-radius:6px;color:#00ff88;cursor:pointer;font-size:11px;">
                                            Execute Now
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

    createFromUI() {
        const asset = document.getElementById('dca-asset')?.value;
        const amount = parseFloat(document.getElementById('dca-amount')?.value || 100);
        const frequency = document.getElementById('dca-frequency')?.value || 'weekly';

        this.createPlan({ asset, amount, frequency });
        this.render('product-modal-content');
    }
};

document.addEventListener('DOMContentLoaded', () => DCAVaultModule.init());
window.DCAVaultModule = DCAVaultModule;
