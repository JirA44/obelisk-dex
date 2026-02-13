/**
 * AIRDROP HUNTER - Track & Claim Airdrops
 * Monitor eligible airdrops and claim automatically
 */
const AirdropHunterModule = {
    claimedAirdrops: [],

    airdrops: [
        { id: 'arb-s2', name: 'Arbitrum S2', icon: '🔵', token: 'ARB', status: 'upcoming', estimatedValue: 500, eligibility: 85, claimDate: '2026-Q2' },
        { id: 'zksync', name: 'zkSync Era', icon: '⚡', token: 'ZK', status: 'live', estimatedValue: 1200, eligibility: 92, claimDate: 'Now' },
        { id: 'layerzero', name: 'LayerZero', icon: '🌐', token: 'ZRO', status: 'upcoming', estimatedValue: 800, eligibility: 78, claimDate: '2026-Q1' },
        { id: 'scroll', name: 'Scroll', icon: '📜', token: 'SCROLL', status: 'live', estimatedValue: 650, eligibility: 88, claimDate: 'Now' },
        { id: 'linea', name: 'Linea', icon: '🟢', token: 'LINEA', status: 'upcoming', estimatedValue: 400, eligibility: 65, claimDate: '2026-Q2' },
        { id: 'starknet-s2', name: 'Starknet S2', icon: '⭐', token: 'STRK', status: 'confirmed', estimatedValue: 950, eligibility: 71, claimDate: '2026-03' },
        { id: 'base', name: 'Base Network', icon: '🔷', token: 'BASE', status: 'speculative', estimatedValue: 2000, eligibility: 45, claimDate: 'TBD' },
        { id: 'blast-s2', name: 'Blast S2', icon: '💥', token: 'BLAST', status: 'confirmed', estimatedValue: 350, eligibility: 82, claimDate: '2026-02' }
    ],

    tasks: [
        { protocol: 'zkSync Era', task: 'Bridge 0.1 ETH', points: 100, completed: false },
        { protocol: 'zkSync Era', task: 'Swap on SyncSwap', points: 50, completed: true },
        { protocol: 'Scroll', task: 'Mint NFT on Scroll', points: 75, completed: false },
        { protocol: 'LayerZero', task: 'Bridge via Stargate', points: 150, completed: true },
        { protocol: 'Linea', task: 'Provide liquidity', points: 200, completed: false }
    ],

    init() {
        this.claimedAirdrops = JSON.parse(localStorage.getItem('obelisk_claimed_airdrops') || '[]');
    },

    save() {
        localStorage.setItem('obelisk_claimed_airdrops', JSON.stringify(this.claimedAirdrops));
    },

    claimAirdrop(airdropId) {
        const airdrop = this.airdrops.find(a => a.id === airdropId);
        if (!airdrop || airdrop.status !== 'live') return;

        this.claimedAirdrops.push({
            id: airdropId,
            name: airdrop.name,
            value: airdrop.estimatedValue,
            claimedAt: Date.now()
        });
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`🎁 Claimed ${airdrop.name}: ~$${airdrop.estimatedValue} (simulated)`, 'success');
        }
    },

    completeTask(index) {
        this.tasks[index].completed = true;
        if (typeof showNotification === 'function') {
            showNotification(`✅ Task completed: +${this.tasks[index].points} points`, 'success');
        }
    },

    getStats() {
        const totalClaimed = this.claimedAirdrops.reduce((sum, a) => sum + a.value, 0);
        const liveCount = this.airdrops.filter(a => a.status === 'live').length;
        const upcomingCount = this.airdrops.filter(a => a.status === 'upcoming' || a.status === 'confirmed').length;
        const totalPoints = this.tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);

        return { totalClaimed, liveCount, upcomingCount, totalPoints };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const statusColors = {
            live: '#00ff88',
            upcoming: '#ffaa00',
            confirmed: '#00aaff',
            speculative: '#888'
        };

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">🎁 Airdrop Hunter</h2>
                <p style="color:#888;margin-bottom:20px;">Track airdrops • Complete tasks • Maximize eligibility • Auto-claim</p>

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Claimed</div>
                        <div style="color:#00ff88;font-size:20px;font-weight:bold;">$${stats.totalClaimed}</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Live Airdrops</div>
                        <div style="color:#ffaa00;font-size:20px;font-weight:bold;">${stats.liveCount}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Upcoming</div>
                        <div style="color:#00aaff;font-size:20px;font-weight:bold;">${stats.upcomingCount}</div>
                    </div>
                    <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Points Earned</div>
                        <div style="color:#a855f7;font-size:20px;font-weight:bold;">${stats.totalPoints}</div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
                    <!-- Airdrops List -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📋 Airdrop Tracker</h3>
                        <div style="display:grid;gap:10px;">
                            ${this.airdrops.map(airdrop => {
                                const isClaimed = this.claimedAirdrops.some(c => c.id === airdrop.id);
                                return `
                                    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;display:grid;grid-template-columns:auto 1fr auto auto auto;gap:16px;align-items:center;">
                                        <span style="font-size:24px;">${airdrop.icon}</span>
                                        <div>
                                            <div style="color:#fff;font-weight:bold;">${airdrop.name}</div>
                                            <div style="color:#888;font-size:11px;">${airdrop.token}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <span style="padding:2px 8px;background:${statusColors[airdrop.status]}22;border-radius:4px;font-size:10px;color:${statusColors[airdrop.status]};">
                                                ${airdrop.status.toUpperCase()}
                                            </span>
                                            <div style="color:#888;font-size:10px;margin-top:2px;">${airdrop.claimDate}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <div style="color:#888;font-size:10px;">Est. Value</div>
                                            <div style="color:#00ff88;font-weight:bold;">~$${airdrop.estimatedValue}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <div style="color:#888;font-size:10px;">Eligibility</div>
                                            <div style="color:${airdrop.eligibility > 75 ? '#00ff88' : airdrop.eligibility > 50 ? '#ffaa00' : '#ff4444'};font-weight:bold;">${airdrop.eligibility}%</div>
                                        </div>
                                        ${airdrop.status === 'live' && !isClaimed ? `
                                            <button onclick="AirdropHunterModule.claimAirdrop('${airdrop.id}');AirdropHunterModule.render('${containerId}')"
                                                    style="padding:6px 12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:11px;">
                                                Claim
                                            </button>
                                        ` : isClaimed ? `
                                            <span style="color:#00ff88;font-size:11px;">✓ Claimed</span>
                                        ` : `
                                            <span style="color:#888;font-size:11px;">-</span>
                                        `}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Tasks -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">✅ Farming Tasks</h3>
                        <div style="display:grid;gap:8px;">
                            ${this.tasks.map((task, i) => `
                                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="color:#fff;font-size:12px;">${task.task}</div>
                                        <div style="color:#888;font-size:10px;">${task.protocol} • +${task.points}pts</div>
                                    </div>
                                    ${task.completed ? `
                                        <span style="color:#00ff88;">✓</span>
                                    ` : `
                                        <button onclick="AirdropHunterModule.completeTask(${i});AirdropHunterModule.render('${containerId}')"
                                                style="padding:4px 8px;background:rgba(0,255,136,0.2);border:1px solid rgba(0,255,136,0.4);border-radius:4px;color:#00ff88;cursor:pointer;font-size:10px;">
                                            Do
                                        </button>
                                    `}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => AirdropHunterModule.init());
window.AirdropHunterModule = AirdropHunterModule;
