/**
 * CRYPTO INHERITANCE - Dead Man's Switch
 * Secure crypto transfer to heirs after inactivity
 */
const CryptoInheritanceModule = {
    plans: [],
    activityLog: [],

    init() {
        this.plans = JSON.parse(localStorage.getItem('obelisk_inheritance_plans') || '[]');
        this.activityLog = JSON.parse(localStorage.getItem('obelisk_inheritance_activity') || '[]');
        this.recordActivity('page_view');
    },

    save() {
        localStorage.setItem('obelisk_inheritance_plans', JSON.stringify(this.plans));
        localStorage.setItem('obelisk_inheritance_activity', JSON.stringify(this.activityLog));
    },

    recordActivity(type) {
        this.activityLog.push({ type, timestamp: Date.now() });
        if (this.activityLog.length > 100) this.activityLog = this.activityLog.slice(-50);
        this.save();
    },

    createPlan(data) {
        const plan = {
            id: 'inherit-' + Date.now(),
            name: data.name,
            beneficiaries: data.beneficiaries || [],
            inactivityPeriod: data.inactivityPeriod || 365, // days
            assets: data.assets || [],
            totalValue: data.totalValue || 0,
            message: data.message || '',
            isActive: true,
            createdAt: Date.now(),
            lastActivity: Date.now()
        };

        this.plans.push(plan);
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`📜 Inheritance plan "${data.name}" created`, 'success');
        }

        return plan;
    },

    addBeneficiary(planId, beneficiary) {
        const plan = this.plans.find(p => p.id === planId);
        if (!plan) return;

        plan.beneficiaries.push({
            id: 'ben-' + Date.now(),
            name: beneficiary.name,
            wallet: beneficiary.wallet,
            email: beneficiary.email || '',
            share: beneficiary.share || 100,
            addedAt: Date.now()
        });

        this.save();
    },

    getLastActivity() {
        if (this.activityLog.length === 0) return null;
        return this.activityLog[this.activityLog.length - 1].timestamp;
    },

    getDaysUntilTrigger(plan) {
        const lastActivity = this.getLastActivity() || plan.lastActivity;
        const daysSinceActivity = Math.floor((Date.now() - lastActivity) / 86400000);
        return Math.max(0, plan.inactivityPeriod - daysSinceActivity);
    },

    confirmAlive() {
        this.recordActivity('confirm_alive');
        this.plans.forEach(p => p.lastActivity = Date.now());
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`✅ Activity confirmed - all inheritance timers reset`, 'success');
        }
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const lastActivity = this.getLastActivity();
        const daysSince = lastActivity ? Math.floor((Date.now() - lastActivity) / 86400000) : 0;

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">📜 Crypto Inheritance</h2>
                <p style="color:#888;margin-bottom:20px;">Dead man's switch • Secure transfer to heirs • Peace of mind</p>

                <!-- Activity Status -->
                <div style="background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,170,255,0.1));border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="color:#888;font-size:12px;">Last Activity</div>
                        <div style="color:#fff;font-size:18px;font-weight:bold;">${daysSince} days ago</div>
                        <div style="color:#888;font-size:11px;">${lastActivity ? new Date(lastActivity).toLocaleString() : 'No activity recorded'}</div>
                    </div>
                    <button onclick="CryptoInheritanceModule.confirmAlive();CryptoInheritanceModule.render('${containerId}')"
                            style="padding:12px 24px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">
                        ✅ I'm Still Here
                    </button>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <!-- Create Plan -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">➕ Create Inheritance Plan</h3>
                        <div style="display:grid;gap:12px;">
                            <div>
                                <label style="color:#888;font-size:12px;">Plan Name</label>
                                <input type="text" id="inherit-name" placeholder="My Crypto Legacy"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Beneficiary Name</label>
                                <input type="text" id="inherit-ben-name" placeholder="John Doe"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Beneficiary Wallet</label>
                                <input type="text" id="inherit-ben-wallet" placeholder="0x..."
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Inactivity Period (days)</label>
                                <select id="inherit-period" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                    <option value="90">90 days (3 months)</option>
                                    <option value="180">180 days (6 months)</option>
                                    <option value="365" selected>365 days (1 year)</option>
                                    <option value="730">730 days (2 years)</option>
                                </select>
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Message to Beneficiary</label>
                                <textarea id="inherit-message" placeholder="Dear family..."
                                          style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;min-height:60px;resize:vertical;"></textarea>
                            </div>
                            <button onclick="CryptoInheritanceModule.createFromUI('${containerId}')"
                                    style="padding:12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                                Create Plan
                            </button>
                        </div>
                    </div>

                    <!-- Active Plans -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📋 Active Plans (${this.plans.length})</h3>
                        ${this.plans.length === 0 ? `
                            <div style="text-align:center;padding:40px;color:#888;">
                                <div style="font-size:48px;margin-bottom:16px;">📜</div>
                                <div>No inheritance plans yet</div>
                                <div style="font-size:12px;margin-top:8px;">Create a plan to protect your crypto legacy</div>
                            </div>
                        ` : `
                            <div style="display:grid;gap:12px;">
                                ${this.plans.map(plan => {
                                    const daysLeft = this.getDaysUntilTrigger(plan);
                                    const urgency = daysLeft < 30 ? 'high' : daysLeft < 90 ? 'medium' : 'low';
                                    return `
                                        <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;border-left:3px solid ${urgency === 'high' ? '#ff4444' : urgency === 'medium' ? '#ffaa00' : '#00ff88'};">
                                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                                                <div style="color:#fff;font-weight:bold;">${plan.name}</div>
                                                <span style="padding:2px 8px;background:${plan.isActive ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.2)'};border-radius:4px;font-size:10px;color:${plan.isActive ? '#00ff88' : '#ff4444'};">
                                                    ${plan.isActive ? 'ACTIVE' : 'PAUSED'}
                                                </span>
                                            </div>
                                            <div style="color:#888;font-size:12px;margin-bottom:8px;">
                                                ${plan.beneficiaries.length} beneficiar${plan.beneficiaries.length === 1 ? 'y' : 'ies'}
                                            </div>
                                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                                <div>
                                                    <div style="color:#888;font-size:10px;">Time until trigger</div>
                                                    <div style="color:${urgency === 'high' ? '#ff4444' : urgency === 'medium' ? '#ffaa00' : '#00ff88'};font-weight:bold;">
                                                        ${daysLeft} days
                                                    </div>
                                                </div>
                                                <div style="background:rgba(255,255,255,0.1);border-radius:4px;height:8px;width:100px;overflow:hidden;">
                                                    <div style="background:${urgency === 'high' ? '#ff4444' : urgency === 'medium' ? '#ffaa00' : '#00ff88'};height:100%;width:${Math.min(100, (daysLeft / plan.inactivityPeriod) * 100)}%;"></div>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>
                </div>

                <!-- Security Notice -->
                <div style="margin-top:20px;background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:24px;">⚠️</span>
                        <div>
                            <div style="color:#ffaa00;font-weight:bold;">Important Security Notice</div>
                            <div style="color:#888;font-size:12px;">Confirm your activity regularly to prevent automatic transfer. Set up email notifications for reminders.</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    createFromUI(containerId) {
        const name = document.getElementById('inherit-name')?.value || 'My Plan';
        const benName = document.getElementById('inherit-ben-name')?.value;
        const benWallet = document.getElementById('inherit-ben-wallet')?.value;
        const period = parseInt(document.getElementById('inherit-period')?.value || 365);
        const message = document.getElementById('inherit-message')?.value || '';

        if (!benName || !benWallet) {
            if (typeof showNotification === 'function') showNotification('Please fill beneficiary details', 'error');
            return;
        }

        const plan = this.createPlan({
            name,
            inactivityPeriod: period,
            message,
            beneficiaries: [{
                id: 'ben-' + Date.now(),
                name: benName,
                wallet: benWallet,
                share: 100
            }]
        });

        this.render(containerId);
    }
};

document.addEventListener('DOMContentLoaded', () => CryptoInheritanceModule.init());
window.CryptoInheritanceModule = CryptoInheritanceModule;
