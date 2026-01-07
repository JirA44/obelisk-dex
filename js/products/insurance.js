/**
 * INSURANCE MODULE - Smart Contract Protection
 */
const InsuranceModule = {
    plans: [
        { id: 'sc-basic', name: 'Smart Contract Basic', coverage: 10000, premium: 2, duration: 30, protocols: ['Uniswap', 'Aave'] },
        { id: 'sc-pro', name: 'Smart Contract Pro', coverage: 50000, premium: 1.8, duration: 30, protocols: ['All DeFi'] },
        { id: 'hack-shield', name: 'Hack Shield', coverage: 100000, premium: 2.5, duration: 90, protocols: ['Exchange hacks'] },
        { id: 'rug-protect', name: 'Rug Pull Protection', coverage: 25000, premium: 5, duration: 30, protocols: ['New tokens'] },
        { id: 'bridge-safe', name: 'Bridge Insurance', coverage: 50000, premium: 3, duration: 30, protocols: ['Cross-chain bridges'] },
        { id: 'full-defi', name: 'Full DeFi Coverage', coverage: 200000, premium: 4, duration: 365, protocols: ['Everything'] }
    ],
    policies: [],
    init() { this.load(); console.log('Insurance Module initialized'); },
    load() { const s = localStorage.getItem('obelisk_insurance'); if (s) this.policies = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_insurance', JSON.stringify(this.policies)); },
    buyPolicy(planId, coverageAmount) {
        const plan = this.plans.find(p => p.id === planId);
        if (!plan) return { success: false, error: 'Plan not found' };
        if (coverageAmount > plan.coverage) return { success: false, error: 'Max coverage: $' + plan.coverage };
        const premiumCost = coverageAmount * (plan.premium / 100);
        const policy = { id: 'ins-' + Date.now(), planId, coverage: coverageAmount, premium: premiumCost, startDate: Date.now(), endDate: Date.now() + plan.duration * 86400000 };
        this.policies.push(policy);
        this.save();
        return { success: true, policy, cost: premiumCost };
    },
    claim(policyId, amount, reason) {
        const policy = this.policies.find(p => p.id === policyId);
        if (!policy) return { success: false, error: 'Policy not found' };
        if (Date.now() > policy.endDate) return { success: false, error: 'Policy expired' };
        if (amount > policy.coverage) return { success: false, error: 'Exceeds coverage' };
        // Simulate claim processing
        return { success: true, status: 'pending', message: 'Claim submitted for review' };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3>Insurance Plans</h3><div class="plans-grid">' + this.plans.map(p => 
            '<div class="plan-card"><strong>' + p.name + '</strong><br>Coverage: $' + (p.coverage/1000) + 'K<br>Premium: ' + p.premium + '%<br>Duration: ' + p.duration + ' days<br><button onclick="InsuranceModule.quickBuy(\'' + p.id + '\')">Get Covered</button></div>'
        ).join('') + '</div>';
    },
    quickBuy(planId) {
        const plan = this.plans.find(p => p.id === planId);
        const amount = parseFloat(prompt('Coverage amount (max $' + plan.coverage + '):'));
        if (amount) {
            const r = this.buyPolicy(planId, amount);
            alert(r.success ? 'Policy bought! Premium: $' + r.cost.toFixed(2) : r.error);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => InsuranceModule.init());
