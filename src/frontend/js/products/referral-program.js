/**
 * REFERRAL PROGRAM - Earn by Referring
 * Multi-tier referrals, commission tracking, leaderboard
 */
const ReferralProgramModule = {
    referrals: [],
    earnings: [],
    userCode: null,

    tiers: {
        bronze: { name: 'Bronze', icon: '🥉', minRefs: 0, commission: 10 },
        silver: { name: 'Silver', icon: '🥈', minRefs: 5, commission: 15 },
        gold: { name: 'Gold', icon: '🥇', minRefs: 20, commission: 20 },
        platinum: { name: 'Platinum', icon: '💎', minRefs: 50, commission: 25 },
        diamond: { name: 'Diamond', icon: '👑', minRefs: 100, commission: 30 }
    },

    leaderboard: [
        { name: 'CryptoKing', refs: 234, earned: 12450, tier: 'diamond' },
        { name: 'DeFiMaster', refs: 156, earned: 8920, tier: 'diamond' },
        { name: 'YieldHunter', refs: 89, earned: 5340, tier: 'platinum' },
        { name: 'AlphaSeeker', refs: 67, earned: 3890, tier: 'platinum' },
        { name: 'TokenWizard', refs: 45, earned: 2650, tier: 'gold' }
    ],

    init() {
        this.referrals = JSON.parse(localStorage.getItem('obelisk_referrals') || '[]');
        this.earnings = JSON.parse(localStorage.getItem('obelisk_ref_earnings') || '[]');
        this.userCode = localStorage.getItem('obelisk_ref_code') || this.generateCode();
    },

    save() {
        localStorage.setItem('obelisk_referrals', JSON.stringify(this.referrals));
        localStorage.setItem('obelisk_ref_earnings', JSON.stringify(this.earnings));
        localStorage.setItem('obelisk_ref_code', this.userCode);
    },

    generateCode() {
        const code = 'OBL' + Math.random().toString(36).substring(2, 8).toUpperCase();
        this.userCode = code;
        this.save();
        return code;
    },

    addReferral() {
        const names = ['Alex', 'Jordan', 'Sam', 'Morgan', 'Taylor', 'Casey', 'Riley', 'Quinn'];
        const referral = {
            id: 'ref-' + Date.now(),
            name: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000),
            joinedAt: Date.now(),
            volume: Math.floor(Math.random() * 10000) + 500,
            commission: 0
        };

        referral.commission = referral.volume * this.getCurrentTier().commission / 100 / 10;

        this.referrals.push(referral);
        this.earnings.push({
            type: 'referral',
            amount: referral.commission,
            from: referral.name,
            timestamp: Date.now()
        });

        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`🎉 New referral: ${referral.name} - Earned $${referral.commission.toFixed(2)}`, 'success');
        }
    },

    getCurrentTier() {
        const refCount = this.referrals.length;
        let currentTier = this.tiers.bronze;

        Object.values(this.tiers).forEach(tier => {
            if (refCount >= tier.minRefs) {
                currentTier = tier;
            }
        });

        return currentTier;
    },

    getNextTier() {
        const refCount = this.referrals.length;
        const tiers = Object.values(this.tiers);

        for (let i = 0; i < tiers.length; i++) {
            if (refCount < tiers[i].minRefs) {
                return tiers[i];
            }
        }
        return null;
    },

    getStats() {
        const totalEarned = this.earnings.reduce((sum, e) => sum + e.amount, 0);
        const thisMonth = this.earnings.filter(e => {
            const date = new Date(e.timestamp);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).reduce((sum, e) => sum + e.amount, 0);

        return {
            totalReferrals: this.referrals.length,
            totalEarned,
            thisMonth,
            currentTier: this.getCurrentTier()
        };
    },

    copyCode() {
        navigator.clipboard.writeText(`https://obelisk-dex.pages.dev?ref=${this.userCode}`);
        if (typeof showNotification === 'function') {
            showNotification('📋 Referral link copied!', 'success');
        }
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const nextTier = this.getNextTier();
        const refsToNext = nextTier ? nextTier.minRefs - stats.totalReferrals : 0;

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">🤝 Referral Program</h2>
                <p style="color:#888;margin-bottom:20px;">Invite friends • Earn commission • Climb the leaderboard</p>

                <!-- Referral Code -->
                <div style="background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,170,255,0.1));border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="color:#888;font-size:12px;">Your Referral Code</div>
                            <div style="color:#00ff88;font-size:28px;font-weight:bold;font-family:monospace;">${this.userCode}</div>
                        </div>
                        <button onclick="ReferralProgramModule.copyCode()"
                                style="padding:12px 24px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">
                            📋 Copy Link
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Referrals</div>
                        <div style="color:#00ff88;font-size:24px;font-weight:bold;">${stats.totalReferrals}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Earned</div>
                        <div style="color:#00aaff;font-size:24px;font-weight:bold;">$${stats.totalEarned.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">This Month</div>
                        <div style="color:#a855f7;font-size:24px;font-weight:bold;">$${stats.thisMonth.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Current Tier</div>
                        <div style="color:#ffaa00;font-size:24px;font-weight:bold;">${stats.currentTier.icon}</div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <!-- Tiers -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">🏆 Commission Tiers</h3>
                        <div style="display:grid;gap:10px;">
                            ${Object.entries(this.tiers).map(([key, tier]) => {
                                const isCurrentTier = tier.name === stats.currentTier.name;
                                return `
                                    <div style="background:${isCurrentTier ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)'};border:${isCurrentTier ? '2px solid #00ff88' : '1px solid transparent'};border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
                                        <div style="display:flex;align-items:center;gap:10px;">
                                            <span style="font-size:24px;">${tier.icon}</span>
                                            <div>
                                                <div style="color:#fff;font-weight:bold;">${tier.name}</div>
                                                <div style="color:#888;font-size:11px;">${tier.minRefs}+ referrals</div>
                                            </div>
                                        </div>
                                        <div style="color:#00ff88;font-weight:bold;font-size:18px;">${tier.commission}%</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        ${nextTier ? `
                            <div style="margin-top:16px;padding:12px;background:rgba(255,170,0,0.1);border-radius:8px;text-align:center;">
                                <div style="color:#ffaa00;font-size:12px;">
                                    ${refsToNext} more referrals to reach ${nextTier.icon} ${nextTier.name} (${nextTier.commission}%)
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Leaderboard -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📊 Top Referrers</h3>
                        <div style="display:grid;gap:8px;">
                            ${this.leaderboard.map((user, i) => `
                                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;">
                                    <div style="display:flex;align-items:center;gap:10px;">
                                        <span style="color:${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#888'};font-size:16px;font-weight:bold;width:24px;">
                                            ${i < 3 ? ['🥇', '🥈', '🥉'][i] : '#' + (i + 1)}
                                        </span>
                                        <div>
                                            <div style="color:#fff;font-weight:500;">${user.name}</div>
                                            <div style="color:#888;font-size:11px;">${user.refs} refs</div>
                                        </div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="color:#00ff88;font-weight:bold;">$${user.earned.toLocaleString()}</div>
                                        <div style="font-size:12px;">${this.tiers[user.tier]?.icon}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Recent Referrals -->
                <div style="margin-top:20px;background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h3 style="color:#fff;margin:0;">👥 Your Referrals (${this.referrals.length})</h3>
                        <button onclick="ReferralProgramModule.addReferral();ReferralProgramModule.render('${containerId}')"
                                style="padding:8px 16px;background:rgba(0,255,136,0.2);border:1px solid rgba(0,255,136,0.4);border-radius:6px;color:#00ff88;cursor:pointer;font-size:12px;">
                            + Simulate Referral
                        </button>
                    </div>
                    ${this.referrals.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">
                            <div style="font-size:48px;margin-bottom:16px;">👥</div>
                            <div>No referrals yet</div>
                            <div style="font-size:12px;margin-top:8px;">Share your link to start earning!</div>
                        </div>
                    ` : `
                        <div style="display:grid;gap:8px;max-height:200px;overflow-y:auto;">
                            ${this.referrals.slice().reverse().map(ref => `
                                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="color:#fff;">${ref.name}</div>
                                        <div style="color:#888;font-size:11px;">${new Date(ref.joinedAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="color:#00ff88;font-weight:bold;">+$${ref.commission.toFixed(2)}</div>
                                        <div style="color:#888;font-size:11px;">Vol: $${ref.volume.toLocaleString()}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => ReferralProgramModule.init());
window.ReferralProgramModule = ReferralProgramModule;
