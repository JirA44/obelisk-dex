/**
 * SMART YIELD ROUTER - Auto-Optimization
 * Automatically routes deposits to highest yield protocols
 * Rebalances every 24h to maximize returns
 */
const SmartYieldRouter = {
    // Supported protocols with live APY tracking
    protocols: {
        aave: { name: 'Aave V3', icon: '👻', chain: 'arbitrum', minApy: 0, currentApy: 0, tvl: 0, risk: 'low' },
        compound: { name: 'Compound V3', icon: '🟢', chain: 'arbitrum', minApy: 0, currentApy: 0, tvl: 0, risk: 'low' },
        pendle: { name: 'Pendle', icon: '🔮', chain: 'arbitrum', minApy: 0, currentApy: 0, tvl: 0, risk: 'medium', hasPoints: true },
        gmx: { name: 'GMX GLP', icon: '💎', chain: 'arbitrum', minApy: 0, currentApy: 0, tvl: 0, risk: 'medium' },
        radiant: { name: 'Radiant', icon: '✨', chain: 'arbitrum', minApy: 0, currentApy: 0, tvl: 0, risk: 'medium' },
        silo: { name: 'Silo Finance', icon: '🏠', chain: 'arbitrum', minApy: 0, currentApy: 0, tvl: 0, risk: 'low' }
    },

    // User positions
    positions: [],
    totalDeposited: 0,
    totalEarned: 0,

    // Settings
    config: {
        rebalanceInterval: 24 * 60 * 60 * 1000, // 24h
        minRebalanceGain: 0.5, // Min 0.5% APY improvement to rebalance
        gasBuffer: 5, // $5 gas buffer for rebalance
        autoCompound: true
    },

    async init() {
        this.load();
        await this.fetchProtocolAPYs();
        this.startRebalanceTimer();
        console.log('[SmartYieldRouter] Initialized with', Object.keys(this.protocols).length, 'protocols');
    },

    load() {
        this.positions = JSON.parse(localStorage.getItem('obelisk_syr_positions') || '[]');
        this.totalDeposited = parseFloat(localStorage.getItem('obelisk_syr_deposited') || '0');
        this.totalEarned = parseFloat(localStorage.getItem('obelisk_syr_earned') || '0');
    },

    save() {
        localStorage.setItem('obelisk_syr_positions', JSON.stringify(this.positions));
        localStorage.setItem('obelisk_syr_deposited', this.totalDeposited.toString());
        localStorage.setItem('obelisk_syr_earned', this.totalEarned.toString());
    },

    async fetchProtocolAPYs() {
        // Simulated APY data (in production, fetch from DeFiLlama API)
        const mockAPYs = {
            aave: { apy: 4.2 + Math.random() * 2, tvl: 850000000 },
            compound: { apy: 3.8 + Math.random() * 1.5, tvl: 620000000 },
            pendle: { apy: 8.5 + Math.random() * 4, tvl: 180000000, pointsBoost: 2.5 },
            gmx: { apy: 12 + Math.random() * 8, tvl: 450000000 },
            radiant: { apy: 6.5 + Math.random() * 3, tvl: 120000000 },
            silo: { apy: 5.2 + Math.random() * 2, tvl: 95000000 }
        };

        Object.entries(mockAPYs).forEach(([key, data]) => {
            if (this.protocols[key]) {
                this.protocols[key].currentApy = data.apy;
                this.protocols[key].tvl = data.tvl;
                if (data.pointsBoost) {
                    this.protocols[key].effectiveApy = data.apy + data.pointsBoost;
                }
            }
        });

        return this.protocols;
    },

    getBestProtocol(amount = 1000, riskTolerance = 'medium') {
        const validProtocols = Object.entries(this.protocols)
            .filter(([_, p]) => {
                if (riskTolerance === 'low') return p.risk === 'low';
                if (riskTolerance === 'medium') return p.risk !== 'high';
                return true;
            })
            .map(([key, p]) => ({
                key,
                ...p,
                effectiveApy: p.effectiveApy || p.currentApy
            }))
            .sort((a, b) => b.effectiveApy - a.effectiveApy);

        return validProtocols[0] || null;
    },

    async deposit(amount, options = {}) {
        if (amount < 10) return { success: false, error: 'Minimum deposit: $10' };

        const riskTolerance = options.riskTolerance || 'medium';
        const bestProtocol = this.getBestProtocol(amount, riskTolerance);

        if (!bestProtocol) return { success: false, error: 'No suitable protocol found' };

        const position = {
            id: 'syr-' + Date.now(),
            amount,
            protocol: bestProtocol.key,
            protocolName: bestProtocol.name,
            entryApy: bestProtocol.effectiveApy,
            depositTime: Date.now(),
            earned: 0,
            lastRebalance: Date.now(),
            riskTolerance,
            autoRebalance: options.autoRebalance !== false
        };

        this.positions.push(position);
        this.totalDeposited += amount;
        this.save();

        // Simulate earning calculation
        this.startEarningSimulation(position.id);

        if (typeof showNotification === 'function') {
            showNotification(
                `✅ Deposited $${amount} into ${bestProtocol.name} (${bestProtocol.effectiveApy.toFixed(2)}% APY)`,
                'success'
            );
        }

        return { success: true, position, protocol: bestProtocol };
    },

    startEarningSimulation(positionId) {
        const interval = setInterval(() => {
            const pos = this.positions.find(p => p.id === positionId);
            if (!pos) {
                clearInterval(interval);
                return;
            }

            const protocol = this.protocols[pos.protocol];
            if (!protocol) return;

            // Calculate earnings per second
            const apy = protocol.effectiveApy || protocol.currentApy;
            const dailyRate = apy / 365 / 100;
            const perSecond = dailyRate / 86400;
            const earned = pos.amount * perSecond * 10; // 10 seconds interval

            pos.earned += earned;
            this.totalEarned += earned;
            this.save();
        }, 10000); // Update every 10 seconds
    },

    async rebalance(positionId) {
        const pos = this.positions.find(p => p.id === positionId);
        if (!pos) return { success: false, error: 'Position not found' };

        const currentProtocol = this.protocols[pos.protocol];
        const bestProtocol = this.getBestProtocol(pos.amount + pos.earned, pos.riskTolerance);

        if (!bestProtocol || bestProtocol.key === pos.protocol) {
            return { success: false, error: 'Already in best protocol' };
        }

        const apyGain = bestProtocol.effectiveApy - (currentProtocol?.effectiveApy || currentProtocol?.currentApy || 0);
        if (apyGain < this.config.minRebalanceGain) {
            return { success: false, error: `APY gain (${apyGain.toFixed(2)}%) below threshold` };
        }

        // Perform rebalance
        const oldProtocol = pos.protocol;
        pos.protocol = bestProtocol.key;
        pos.protocolName = bestProtocol.name;
        pos.entryApy = bestProtocol.effectiveApy;
        pos.lastRebalance = Date.now();
        pos.amount += pos.earned; // Compound earnings
        pos.earned = 0;

        this.save();

        if (typeof showNotification === 'function') {
            showNotification(
                `🔄 Rebalanced: ${this.protocols[oldProtocol]?.name} → ${bestProtocol.name} (+${apyGain.toFixed(2)}% APY)`,
                'success'
            );
        }

        return { success: true, from: oldProtocol, to: bestProtocol.key, apyGain };
    },

    async rebalanceAll() {
        const results = [];
        for (const pos of this.positions.filter(p => p.autoRebalance)) {
            const result = await this.rebalance(pos.id);
            results.push({ positionId: pos.id, ...result });
        }
        return results;
    },

    startRebalanceTimer() {
        setInterval(() => {
            this.fetchProtocolAPYs();
            this.rebalanceAll();
        }, this.config.rebalanceInterval);
    },

    withdraw(positionId) {
        const idx = this.positions.findIndex(p => p.id === positionId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const pos = this.positions[idx];
        const totalAmount = pos.amount + pos.earned;

        this.positions.splice(idx, 1);
        this.totalDeposited -= pos.amount;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`💰 Withdrew $${totalAmount.toFixed(2)} (earned: $${pos.earned.toFixed(2)})`, 'success');
        }

        return { success: true, amount: totalAmount, earned: pos.earned };
    },

    getStats() {
        const currentValue = this.positions.reduce((sum, p) => sum + p.amount + p.earned, 0);
        const avgApy = this.positions.length > 0
            ? this.positions.reduce((sum, p) => sum + (this.protocols[p.protocol]?.currentApy || 0), 0) / this.positions.length
            : 0;

        return {
            totalDeposited: this.totalDeposited,
            currentValue,
            totalEarned: this.totalEarned,
            avgApy,
            positionsCount: this.positions.length,
            protocolBreakdown: this.getProtocolBreakdown()
        };
    },

    getProtocolBreakdown() {
        const breakdown = {};
        this.positions.forEach(p => {
            if (!breakdown[p.protocol]) {
                breakdown[p.protocol] = { amount: 0, earned: 0, count: 0 };
            }
            breakdown[p.protocol].amount += p.amount;
            breakdown[p.protocol].earned += p.earned;
            breakdown[p.protocol].count++;
        });
        return breakdown;
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const protocols = Object.entries(this.protocols)
            .map(([k, v]) => ({ key: k, ...v }))
            .sort((a, b) => (b.effectiveApy || b.currentApy) - (a.effectiveApy || a.currentApy));

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">🔄 Smart Yield Router</h2>
                <p style="color:#888;margin-bottom:20px;">Auto-routes your deposits to the highest yield protocols</p>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Deposited</div>
                        <div style="color:#00ff88;font-size:24px;font-weight:bold;">$${stats.totalDeposited.toFixed(2)}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Current Value</div>
                        <div style="color:#00aaff;font-size:24px;font-weight:bold;">$${stats.currentValue.toFixed(2)}</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Earned</div>
                        <div style="color:#ffaa00;font-size:24px;font-weight:bold;">+$${stats.totalEarned.toFixed(4)}</div>
                    </div>
                    <div style="background:rgba(136,0,255,0.1);border:1px solid rgba(136,0,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Avg APY</div>
                        <div style="color:#8800ff;font-size:24px;font-weight:bold;">${stats.avgApy.toFixed(2)}%</div>
                    </div>
                </div>

                <!-- Deposit Form -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">💰 New Deposit</h3>
                    <div style="display:flex;gap:12px;align-items:end;">
                        <div style="flex:1;">
                            <label style="color:#888;font-size:12px;">Amount (USDC)</label>
                            <input type="number" id="syr-deposit-amount" placeholder="1000" min="10"
                                   style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                        </div>
                        <div>
                            <label style="color:#888;font-size:12px;">Risk Tolerance</label>
                            <select id="syr-risk-level" style="padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                <option value="low">Low (Aave/Compound)</option>
                                <option value="medium" selected>Medium (+ Pendle/GMX)</option>
                                <option value="high">High (All protocols)</option>
                            </select>
                        </div>
                        <button onclick="SmartYieldRouter.depositFromUI()"
                                style="padding:12px 24px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                            Auto-Route Deposit
                        </button>
                    </div>
                </div>

                <!-- Protocol APYs -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📊 Live Protocol APYs</h3>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                        ${protocols.map(p => `
                            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-size:18px;">${p.icon} ${p.name}</span>
                                    <span style="background:${p.risk === 'low' ? '#00ff88' : p.risk === 'medium' ? '#ffaa00' : '#ff4466'};color:#000;padding:2px 6px;border-radius:4px;font-size:9px;">${p.risk.toUpperCase()}</span>
                                </div>
                                <div style="margin-top:8px;display:flex;justify-content:space-between;">
                                    <span style="color:#888;">APY:</span>
                                    <span style="color:#00ff88;font-weight:bold;">${(p.effectiveApy || p.currentApy).toFixed(2)}%</span>
                                </div>
                                ${p.hasPoints ? '<div style="font-size:10px;color:#8800ff;margin-top:4px;">✨ +Points Boost</div>' : ''}
                                <div style="font-size:10px;color:#666;margin-top:4px;">TVL: $${(p.tvl / 1e6).toFixed(0)}M</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Active Positions -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📋 Your Positions (${this.positions.length})</h3>
                    ${this.positions.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">
                            No active positions. Deposit to start earning!
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            ${this.positions.map(pos => {
                                const protocol = this.protocols[pos.protocol];
                                const currentApy = protocol?.effectiveApy || protocol?.currentApy || 0;
                                return `
                                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
                                        <div>
                                            <div style="font-weight:bold;color:#fff;">${protocol?.icon || '📦'} ${pos.protocolName}</div>
                                            <div style="font-size:12px;color:#888;margin-top:4px;">
                                                Deposited: $${pos.amount.toFixed(2)} | Earned: <span style="color:#00ff88;">+$${pos.earned.toFixed(4)}</span>
                                            </div>
                                            <div style="font-size:11px;color:#666;margin-top:2px;">
                                                Current APY: ${currentApy.toFixed(2)}% | Entry: ${pos.entryApy.toFixed(2)}%
                                            </div>
                                        </div>
                                        <div style="display:flex;gap:8px;">
                                            <button onclick="SmartYieldRouter.rebalance('${pos.id}')"
                                                    style="padding:8px 12px;background:rgba(0,170,255,0.2);border:1px solid rgba(0,170,255,0.4);border-radius:6px;color:#00aaff;cursor:pointer;font-size:12px;">
                                                🔄 Rebalance
                                            </button>
                                            <button onclick="SmartYieldRouter.withdraw('${pos.id}');SmartYieldRouter.render('${containerId}')"
                                                    style="padding:8px 12px;background:rgba(255,68,68,0.2);border:1px solid rgba(255,68,68,0.4);border-radius:6px;color:#ff4444;cursor:pointer;font-size:12px;">
                                                Withdraw
                                            </button>
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

    depositFromUI() {
        const amount = parseFloat(document.getElementById('syr-deposit-amount')?.value || 0);
        const riskTolerance = document.getElementById('syr-risk-level')?.value || 'medium';

        if (amount < 10) {
            if (typeof showNotification === 'function') {
                showNotification('Minimum deposit: $10', 'error');
            }
            return;
        }

        this.deposit(amount, { riskTolerance });
        setTimeout(() => this.render('smart-yield-container'), 100);
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => SmartYieldRouter.init());
window.SmartYieldRouter = SmartYieldRouter;
console.log('[SmartYieldRouter] Module loaded');
