/**
 * YIELD LOCK - Fixed Rate Guaranteed Yields
 * Lock your crypto for guaranteed fixed rates
 * Obelisk hedges risk with options
 */
const YieldLock = {
    // Available terms
    terms: [
        { days: 7, baseApy: 5, maxAmount: 10000, name: '1 Week' },
        { days: 14, baseApy: 6, maxAmount: 25000, name: '2 Weeks' },
        { days: 30, baseApy: 8, maxAmount: 50000, name: '1 Month' },
        { days: 60, baseApy: 10, maxAmount: 100000, name: '2 Months' },
        { days: 90, baseApy: 12, maxAmount: 250000, name: '3 Months' },
        { days: 180, baseApy: 15, maxAmount: 500000, name: '6 Months' },
        { days: 365, baseApy: 18, maxAmount: 1000000, name: '1 Year' }
    ],

    // Supported assets
    assets: {
        USDC: { icon: '💵', minDeposit: 100, apyBonus: 0 },
        USDT: { icon: '💲', minDeposit: 100, apyBonus: 0 },
        ETH: { icon: 'Ξ', minDeposit: 0.05, apyBonus: 1 },
        BTC: { icon: '₿', minDeposit: 0.005, apyBonus: 1.5 },
        ARB: { icon: '🔷', minDeposit: 50, apyBonus: 2 }
    },

    // User locks
    locks: [],

    // Protocol stats
    stats: {
        totalLocked: 0,
        totalPaidOut: 0,
        activeLocks: 0
    },

    init() {
        this.load();
        this.startYieldAccrual();
        console.log('[YieldLock] Initialized with', this.terms.length, 'terms');
    },

    load() {
        this.locks = JSON.parse(localStorage.getItem('obelisk_yl_locks') || '[]');
        this.stats = JSON.parse(localStorage.getItem('obelisk_yl_stats') || JSON.stringify(this.stats));
    },

    save() {
        localStorage.setItem('obelisk_yl_locks', JSON.stringify(this.locks));
        localStorage.setItem('obelisk_yl_stats', JSON.stringify(this.stats));
    },

    // Calculate APY for a specific lock
    calculateApy(asset, days, amount) {
        const term = this.terms.find(t => t.days === days);
        if (!term) return null;

        const assetInfo = this.assets[asset];
        if (!assetInfo) return null;

        let apy = term.baseApy + assetInfo.apyBonus;

        // Volume bonus
        if (amount >= 10000) apy += 0.5;
        if (amount >= 50000) apy += 0.5;
        if (amount >= 100000) apy += 1;

        // Calculate expected return
        const dailyRate = apy / 365 / 100;
        const expectedReturn = amount * dailyRate * days;

        return {
            apy,
            dailyRate,
            expectedReturn,
            maturityDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
            term: term.name
        };
    },

    // Create a new lock
    createLock(asset, amount, days) {
        const assetInfo = this.assets[asset];
        if (!assetInfo) return { success: false, error: 'Unsupported asset' };

        if (amount < assetInfo.minDeposit) {
            return { success: false, error: `Minimum deposit: ${assetInfo.minDeposit} ${asset}` };
        }

        const term = this.terms.find(t => t.days === days);
        if (!term) return { success: false, error: 'Invalid term' };

        // For demo, convert to USD value
        const usdValue = this.getUsdValue(asset, amount);
        if (usdValue > term.maxAmount) {
            return { success: false, error: `Maximum for ${term.name}: $${term.maxAmount.toLocaleString()}` };
        }

        const yieldInfo = this.calculateApy(asset, days, usdValue);

        const lock = {
            id: 'yl-' + Date.now(),
            asset,
            amount,
            usdValue,
            days,
            apy: yieldInfo.apy,
            expectedReturn: yieldInfo.expectedReturn,
            startTime: Date.now(),
            maturityTime: Date.now() + (days * 24 * 60 * 60 * 1000),
            accruedYield: 0,
            status: 'active',
            term: yieldInfo.term
        };

        this.locks.push(lock);
        this.stats.totalLocked += usdValue;
        this.stats.activeLocks++;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(
                `🔒 Locked ${amount} ${asset} for ${term.name} at ${yieldInfo.apy.toFixed(2)}% APY (Guaranteed)`,
                'success'
            );
        }

        return { success: true, lock, yieldInfo };
    },

    getUsdValue(asset, amount) {
        // Mock prices - in production, fetch from price service
        const prices = {
            USDC: 1, USDT: 1, ETH: 2500, BTC: 97000, ARB: 1.20
        };
        return amount * (prices[asset] || 1);
    },

    // Accrue yield for all active locks
    startYieldAccrual() {
        setInterval(() => {
            this.locks.filter(l => l.status === 'active').forEach(lock => {
                const elapsed = Date.now() - lock.startTime;
                const totalDuration = lock.maturityTime - lock.startTime;
                const progress = Math.min(1, elapsed / totalDuration);

                lock.accruedYield = lock.expectedReturn * progress;

                // Check if matured
                if (Date.now() >= lock.maturityTime) {
                    lock.status = 'matured';
                    this.stats.totalPaidOut += lock.expectedReturn;
                }
            });
            this.save();
        }, 10000); // Update every 10 seconds
    },

    // Withdraw a matured lock
    withdraw(lockId) {
        const idx = this.locks.findIndex(l => l.id === lockId);
        if (idx === -1) return { success: false, error: 'Lock not found' };

        const lock = this.locks[idx];

        if (lock.status === 'active' && Date.now() < lock.maturityTime) {
            return { success: false, error: 'Lock not matured yet. Early withdrawal not available.' };
        }

        const totalAmount = lock.amount + (lock.expectedReturn / this.getUsdValue(lock.asset, 1));

        lock.status = 'withdrawn';
        lock.withdrawTime = Date.now();
        this.stats.activeLocks--;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(
                `💰 Withdrawn ${totalAmount.toFixed(6)} ${lock.asset} (Principal + ${lock.expectedReturn.toFixed(2)} yield)`,
                'success'
            );
        }

        return { success: true, amount: lock.amount, yield: lock.expectedReturn, total: totalAmount };
    },

    // Emergency withdrawal with penalty
    emergencyWithdraw(lockId) {
        const idx = this.locks.findIndex(l => l.id === lockId);
        if (idx === -1) return { success: false, error: 'Lock not found' };

        const lock = this.locks[idx];
        if (lock.status !== 'active') return { success: false, error: 'Lock is not active' };

        // Penalty: lose all accrued yield + 2% of principal
        const penalty = lock.usdValue * 0.02;
        const returnAmount = lock.amount - (penalty / this.getUsdValue(lock.asset, 1));

        lock.status = 'emergency_withdrawn';
        lock.penalty = penalty;
        this.stats.activeLocks--;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(
                `⚠️ Emergency withdrawal: ${returnAmount.toFixed(6)} ${lock.asset} (2% penalty applied)`,
                'warning'
            );
        }

        return { success: true, amount: returnAmount, penalty };
    },

    getStats() {
        const activeLocks = this.locks.filter(l => l.status === 'active');
        const totalAccrued = activeLocks.reduce((sum, l) => sum + l.accruedYield, 0);
        const avgApy = activeLocks.length > 0
            ? activeLocks.reduce((sum, l) => sum + l.apy, 0) / activeLocks.length
            : 0;

        return {
            ...this.stats,
            totalAccrued,
            avgApy
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const activeLocks = this.locks.filter(l => l.status === 'active' || l.status === 'matured');

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">🔒 Yield Lock</h2>
                <p style="color:#888;margin-bottom:20px;">Guaranteed fixed rates on your crypto deposits</p>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Locked</div>
                        <div style="color:#00ff88;font-size:24px;font-weight:bold;">$${stats.totalLocked.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Active Locks</div>
                        <div style="color:#00aaff;font-size:24px;font-weight:bold;">${stats.activeLocks}</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Accrued</div>
                        <div style="color:#ffaa00;font-size:24px;font-weight:bold;">+$${stats.totalAccrued.toFixed(2)}</div>
                    </div>
                    <div style="background:rgba(136,0,255,0.1);border:1px solid rgba(136,0,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Avg APY</div>
                        <div style="color:#8800ff;font-size:24px;font-weight:bold;">${stats.avgApy.toFixed(1)}%</div>
                    </div>
                </div>

                <!-- Create Lock Form -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">🔐 Create New Lock</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;align-items:end;">
                        <div>
                            <label style="color:#888;font-size:12px;">Asset</label>
                            <select id="yl-asset" onchange="YieldLock.updatePreview()" style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                ${Object.entries(this.assets).map(([key, a]) => `
                                    <option value="${key}">${a.icon} ${key}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="color:#888;font-size:12px;">Amount</label>
                            <input type="number" id="yl-amount" placeholder="1000" min="0" onchange="YieldLock.updatePreview()"
                                   style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                        </div>
                        <div>
                            <label style="color:#888;font-size:12px;">Lock Period</label>
                            <select id="yl-term" onchange="YieldLock.updatePreview()" style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                ${this.terms.map(t => `
                                    <option value="${t.days}">${t.name} (${t.baseApy}%+ APY)</option>
                                `).join('')}
                            </select>
                        </div>
                        <button onclick="YieldLock.createLockFromUI()"
                                style="padding:12px 24px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;white-space:nowrap;">
                            🔒 Lock Funds
                        </button>
                    </div>

                    <!-- Preview -->
                    <div id="yl-preview" style="margin-top:16px;padding:16px;background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.2);border-radius:8px;display:none;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#888;">Guaranteed APY:</span>
                            <span id="yl-preview-apy" style="color:#00ff88;font-weight:bold;">--</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#888;">Expected Return:</span>
                            <span id="yl-preview-return" style="color:#ffaa00;font-weight:bold;">--</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span style="color:#888;">Maturity Date:</span>
                            <span id="yl-preview-maturity" style="color:#fff;">--</span>
                        </div>
                    </div>
                </div>

                <!-- Rate Table -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📊 Current Rates</h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="color:#888;font-size:12px;">
                                <th style="text-align:left;padding:8px;">Term</th>
                                <th style="text-align:center;padding:8px;">Base APY</th>
                                <th style="text-align:center;padding:8px;">+ ETH Bonus</th>
                                <th style="text-align:center;padding:8px;">+ BTC Bonus</th>
                                <th style="text-align:right;padding:8px;">Max Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.terms.map(t => `
                                <tr style="border-top:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:12px;color:#fff;font-weight:bold;">${t.name}</td>
                                    <td style="padding:12px;text-align:center;color:#00ff88;">${t.baseApy}%</td>
                                    <td style="padding:12px;text-align:center;color:#00aaff;">${t.baseApy + 1}%</td>
                                    <td style="padding:12px;text-align:center;color:#ffaa00;">${t.baseApy + 1.5}%</td>
                                    <td style="padding:12px;text-align:right;color:#888;">$${t.maxAmount.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Active Locks -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📋 Your Locks (${activeLocks.length})</h3>
                    ${activeLocks.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">
                            No active locks. Create a lock to start earning guaranteed yields!
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            ${activeLocks.map(lock => {
                                const progress = Math.min(100, (Date.now() - lock.startTime) / (lock.maturityTime - lock.startTime) * 100);
                                const isMatured = lock.status === 'matured';
                                const assetInfo = this.assets[lock.asset];
                                return `
                                    <div style="background:rgba(255,255,255,0.03);border:1px solid ${isMatured ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)'};border-radius:8px;padding:16px;">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                            <div>
                                                <span style="font-size:20px;">${assetInfo?.icon || '💰'}</span>
                                                <span style="font-weight:bold;color:#fff;margin-left:8px;">${lock.amount} ${lock.asset}</span>
                                                <span style="color:#00ff88;margin-left:12px;">${lock.apy.toFixed(2)}% APY</span>
                                            </div>
                                            <div>
                                                ${isMatured ? `
                                                    <button onclick="YieldLock.withdraw('${lock.id}');YieldLock.render('${containerId}')"
                                                            style="padding:8px 16px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;">
                                                        💰 Withdraw
                                                    </button>
                                                ` : `
                                                    <button onclick="YieldLock.emergencyWithdraw('${lock.id}');YieldLock.render('${containerId}')"
                                                            style="padding:8px 12px;background:rgba(255,68,68,0.2);border:1px solid rgba(255,68,68,0.4);border-radius:6px;color:#ff4444;cursor:pointer;font-size:12px;">
                                                        Emergency Exit (-2%)
                                                    </button>
                                                `}
                                            </div>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.1);border-radius:4px;height:8px;margin-bottom:8px;">
                                            <div style="background:linear-gradient(90deg,#00ff88,#00aaff);height:100%;border-radius:4px;width:${progress}%;"></div>
                                        </div>
                                        <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;">
                                            <span>Accrued: <span style="color:#00ff88;">+$${lock.accruedYield.toFixed(4)}</span></span>
                                            <span>Expected: +$${lock.expectedReturn.toFixed(2)}</span>
                                            <span>${isMatured ? '✅ MATURED' : new Date(lock.maturityTime).toLocaleDateString()}</span>
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

    updatePreview() {
        const asset = document.getElementById('yl-asset')?.value;
        const amount = parseFloat(document.getElementById('yl-amount')?.value || 0);
        const days = parseInt(document.getElementById('yl-term')?.value || 30);

        const preview = document.getElementById('yl-preview');
        if (!preview || !asset || amount <= 0) {
            if (preview) preview.style.display = 'none';
            return;
        }

        const usdValue = this.getUsdValue(asset, amount);
        const yieldInfo = this.calculateApy(asset, days, usdValue);

        if (yieldInfo) {
            preview.style.display = 'block';
            document.getElementById('yl-preview-apy').textContent = yieldInfo.apy.toFixed(2) + '% (Guaranteed)';
            document.getElementById('yl-preview-return').textContent = '+$' + yieldInfo.expectedReturn.toFixed(2);
            document.getElementById('yl-preview-maturity').textContent = yieldInfo.maturityDate.toLocaleDateString();
        }
    },

    createLockFromUI() {
        const asset = document.getElementById('yl-asset')?.value;
        const amount = parseFloat(document.getElementById('yl-amount')?.value || 0);
        const days = parseInt(document.getElementById('yl-term')?.value || 30);

        if (!asset || amount <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Please enter a valid amount', 'error');
            }
            return;
        }

        const result = this.createLock(asset, amount, days);
        if (result.success) {
            this.render('yield-lock-container');
        }
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => YieldLock.init());
window.YieldLock = YieldLock;
console.log('[YieldLock] Module loaded');
