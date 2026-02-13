/**
 * TOKEN VESTING - Create Vesting Schedules
 * Team tokens, investor allocations, cliff & linear vesting
 */
const TokenVestingModule = {
    vestingPlans: [],

    vestingTypes: {
        linear: { name: 'Linear', icon: '📈', desc: 'Unlock gradually over time' },
        cliff: { name: 'Cliff + Linear', icon: '🏔️', desc: 'Wait period then gradual unlock' },
        milestone: { name: 'Milestone', icon: '🎯', desc: 'Unlock at specific milestones' },
        instant: { name: 'Instant Unlock', icon: '⚡', desc: 'Full unlock at end date' }
    },

    init() {
        this.vestingPlans = JSON.parse(localStorage.getItem('obelisk_vesting_plans') || '[]');
    },

    save() {
        localStorage.setItem('obelisk_vesting_plans', JSON.stringify(this.vestingPlans));
    },

    createPlan(data) {
        const plan = {
            id: 'vest-' + Date.now(),
            name: data.name,
            token: data.token,
            totalAmount: data.totalAmount,
            vestingType: data.vestingType || 'linear',
            startDate: data.startDate || Date.now(),
            cliffMonths: data.cliffMonths || 0,
            vestingMonths: data.vestingMonths || 24,
            beneficiaries: data.beneficiaries || [],
            claimed: 0,
            createdAt: Date.now()
        };

        this.vestingPlans.push(plan);
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`📜 Vesting plan "${data.name}" created`, 'success');
        }

        return plan;
    },

    addBeneficiary(planId, beneficiary) {
        const plan = this.vestingPlans.find(p => p.id === planId);
        if (!plan) return;

        plan.beneficiaries.push({
            id: 'ben-' + Date.now(),
            name: beneficiary.name,
            wallet: beneficiary.wallet,
            allocation: beneficiary.allocation,
            claimed: 0
        });

        this.save();
    },

    calculateVested(plan) {
        const now = Date.now();
        const startDate = plan.startDate;
        const cliffEnd = startDate + (plan.cliffMonths * 30 * 86400000);
        const vestingEnd = cliffEnd + (plan.vestingMonths * 30 * 86400000);

        if (now < cliffEnd) return 0;
        if (now >= vestingEnd) return plan.totalAmount;

        const vestingDuration = vestingEnd - cliffEnd;
        const elapsed = now - cliffEnd;
        return (elapsed / vestingDuration) * plan.totalAmount;
    },

    claim(planId, beneficiaryId) {
        const plan = this.vestingPlans.find(p => p.id === planId);
        if (!plan) return;

        const ben = plan.beneficiaries.find(b => b.id === beneficiaryId);
        if (!ben) return;

        const totalVested = this.calculateVested(plan);
        const benVested = (totalVested * ben.allocation / 100) - ben.claimed;

        if (benVested <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Nothing to claim yet', 'info');
            }
            return;
        }

        ben.claimed += benVested;
        plan.claimed += benVested;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`✅ Claimed ${benVested.toFixed(2)} ${plan.token}`, 'success');
        }
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">📜 Token Vesting</h2>
                <p style="color:#888;margin-bottom:20px;">Create vesting schedules • Team allocations • Investor tokens • Cliff & linear unlock</p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <!-- Create Plan -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">➕ Create Vesting Plan</h3>
                        <div style="display:grid;gap:12px;">
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div>
                                    <label style="color:#888;font-size:12px;">Plan Name</label>
                                    <input type="text" id="vest-name" placeholder="Team Tokens"
                                           style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                </div>
                                <div>
                                    <label style="color:#888;font-size:12px;">Token Symbol</label>
                                    <input type="text" id="vest-token" placeholder="OBL"
                                           style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                </div>
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Total Amount</label>
                                <input type="number" id="vest-amount" placeholder="1000000"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Vesting Type</label>
                                <select id="vest-type" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                    ${Object.entries(this.vestingTypes).map(([key, type]) => `
                                        <option value="${key}">${type.icon} ${type.name} - ${type.desc}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div>
                                    <label style="color:#888;font-size:12px;">Cliff (months)</label>
                                    <input type="number" id="vest-cliff" placeholder="12" value="12"
                                           style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                </div>
                                <div>
                                    <label style="color:#888;font-size:12px;">Vesting (months)</label>
                                    <input type="number" id="vest-months" placeholder="24" value="24"
                                           style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                </div>
                            </div>
                            <button onclick="TokenVestingModule.createFromUI('${containerId}')"
                                    style="padding:12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                                Create Plan
                            </button>
                        </div>
                    </div>

                    <!-- Vesting Types -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📊 Vesting Types</h3>
                        <div style="display:grid;gap:12px;">
                            ${Object.entries(this.vestingTypes).map(([key, type]) => `
                                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;display:flex;align-items:center;gap:12px;">
                                    <span style="font-size:28px;">${type.icon}</span>
                                    <div>
                                        <div style="color:#fff;font-weight:bold;">${type.name}</div>
                                        <div style="color:#888;font-size:12px;">${type.desc}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div style="margin-top:16px;padding:12px;background:rgba(0,255,136,0.1);border-radius:8px;">
                            <div style="color:#00ff88;font-weight:bold;margin-bottom:4px;">💡 Common Schedules</div>
                            <div style="color:#888;font-size:12px;line-height:1.6;">
                                • Team: 12mo cliff + 36mo linear<br>
                                • Investors: 6mo cliff + 24mo linear<br>
                                • Advisors: 6mo cliff + 18mo linear<br>
                                • Community: No cliff, 12mo linear
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Plans -->
                <div style="margin-top:20px;background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📋 Active Vesting Plans (${this.vestingPlans.length})</h3>
                    ${this.vestingPlans.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">
                            <div style="font-size:48px;margin-bottom:16px;">📜</div>
                            <div>No vesting plans yet</div>
                        </div>
                    ` : `
                        <div style="display:grid;gap:16px;">
                            ${this.vestingPlans.map(plan => {
                                const vested = this.calculateVested(plan);
                                const vestedPct = (vested / plan.totalAmount * 100);
                                const claimable = vested - plan.claimed;
                                const now = Date.now();
                                const cliffEnd = plan.startDate + (plan.cliffMonths * 30 * 86400000);
                                const inCliff = now < cliffEnd;

                                return `
                                    <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                            <div>
                                                <div style="color:#fff;font-weight:bold;font-size:16px;">${plan.name}</div>
                                                <div style="color:#888;font-size:12px;">${this.vestingTypes[plan.vestingType]?.icon} ${plan.token} • ${plan.cliffMonths}mo cliff + ${plan.vestingMonths}mo vesting</div>
                                            </div>
                                            <div style="text-align:right;">
                                                <div style="color:#00ff88;font-size:18px;font-weight:bold;">${plan.totalAmount.toLocaleString()} ${plan.token}</div>
                                                <div style="color:#888;font-size:11px;">${vestedPct.toFixed(1)}% vested</div>
                                            </div>
                                        </div>

                                        <!-- Progress bar -->
                                        <div style="background:rgba(255,255,255,0.1);border-radius:8px;height:24px;overflow:hidden;margin-bottom:12px;position:relative;">
                                            <div style="background:${inCliff ? '#ffaa00' : 'linear-gradient(90deg,#00ff88,#00cc66)'};height:100%;width:${vestedPct}%;transition:width 0.3s;"></div>
                                            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:11px;font-weight:bold;">
                                                ${inCliff ? `🏔️ Cliff ends ${new Date(cliffEnd).toLocaleDateString()}` : `${vestedPct.toFixed(1)}% Unlocked`}
                                            </div>
                                        </div>

                                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center;">
                                            <div style="background:rgba(0,255,136,0.1);border-radius:8px;padding:10px;">
                                                <div style="color:#888;font-size:10px;">Total</div>
                                                <div style="color:#fff;font-weight:bold;">${plan.totalAmount.toLocaleString()}</div>
                                            </div>
                                            <div style="background:rgba(0,170,255,0.1);border-radius:8px;padding:10px;">
                                                <div style="color:#888;font-size:10px;">Claimed</div>
                                                <div style="color:#00aaff;font-weight:bold;">${plan.claimed.toLocaleString()}</div>
                                            </div>
                                            <div style="background:rgba(255,170,0,0.1);border-radius:8px;padding:10px;">
                                                <div style="color:#888;font-size:10px;">Claimable</div>
                                                <div style="color:#ffaa00;font-weight:bold;">${claimable.toFixed(2)}</div>
                                            </div>
                                        </div>
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
        const name = document.getElementById('vest-name')?.value || 'Team Tokens';
        const token = document.getElementById('vest-token')?.value || 'TOKEN';
        const totalAmount = parseFloat(document.getElementById('vest-amount')?.value || 1000000);
        const vestingType = document.getElementById('vest-type')?.value || 'cliff';
        const cliffMonths = parseInt(document.getElementById('vest-cliff')?.value || 12);
        const vestingMonths = parseInt(document.getElementById('vest-months')?.value || 24);

        this.createPlan({
            name,
            token,
            totalAmount,
            vestingType,
            cliffMonths,
            vestingMonths
        });

        this.render(containerId);
    }
};

document.addEventListener('DOMContentLoaded', () => TokenVestingModule.init());
window.TokenVestingModule = TokenVestingModule;
