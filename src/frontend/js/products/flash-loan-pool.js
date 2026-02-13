/**
 * FLASH LOAN ARBITRAGE POOL
 * Deposit funds to earn from flash loan arbitrage opportunities
 * System executes arbitrage automatically, profits shared 70/30
 */
const FlashLoanPool = {
    // Pool state
    pool: {
        totalDeposits: 0,
        availableLiquidity: 0,
        utilizationRate: 0,
        totalProfits: 0,
        totalArbitrages: 0
    },

    // User deposits
    deposits: [],

    // Arbitrage history
    arbitrageHistory: [],

    // Config
    config: {
        minDeposit: 100,
        depositFee: 0.1, // 0.1%
        withdrawFee: 0.2, // 0.2%
        profitShare: 70, // 70% to depositors
        platformShare: 30, // 30% to platform
        minArbitrageProfit: 0.1, // Min 0.1% profit to execute
        maxFlashLoanPercent: 50 // Use max 50% of pool per loan
    },

    // Supported DEX pairs for arbitrage
    dexPairs: [
        { name: 'Uniswap ↔ Sushiswap', pair: 'ETH/USDC', avgSpread: 0.15 },
        { name: 'Uniswap ↔ Curve', pair: 'USDC/USDT', avgSpread: 0.05 },
        { name: 'Balancer ↔ Uniswap', pair: 'WBTC/ETH', avgSpread: 0.12 },
        { name: 'Camelot ↔ Uniswap', pair: 'ARB/ETH', avgSpread: 0.25 },
        { name: '1inch ↔ 0x', pair: 'LINK/ETH', avgSpread: 0.18 }
    ],

    init() {
        this.load();
        this.startArbitrageSimulation();
        console.log('[FlashLoanPool] Initialized');
    },

    load() {
        this.deposits = JSON.parse(localStorage.getItem('obelisk_flp_deposits') || '[]');
        this.pool = JSON.parse(localStorage.getItem('obelisk_flp_pool') || JSON.stringify(this.pool));
        this.arbitrageHistory = JSON.parse(localStorage.getItem('obelisk_flp_history') || '[]');
    },

    save() {
        localStorage.setItem('obelisk_flp_deposits', JSON.stringify(this.deposits));
        localStorage.setItem('obelisk_flp_pool', JSON.stringify(this.pool));
        localStorage.setItem('obelisk_flp_history', JSON.stringify(this.arbitrageHistory));
    },

    // Calculate pool metrics
    updatePoolMetrics() {
        this.pool.totalDeposits = this.deposits.reduce((sum, d) => sum + d.amount, 0);
        this.pool.availableLiquidity = this.pool.totalDeposits; // Simplified
    },

    // Deposit into pool
    deposit(amount) {
        if (amount < this.config.minDeposit) {
            return { success: false, error: `Minimum deposit: $${this.config.minDeposit}` };
        }

        const fee = amount * (this.config.depositFee / 100);
        const netAmount = amount - fee;

        const deposit = {
            id: 'flp-' + Date.now(),
            amount: netAmount,
            originalAmount: amount,
            fee,
            depositTime: Date.now(),
            earnedProfits: 0,
            pendingProfits: 0,
            sharePercent: 0 // Calculated dynamically
        };

        this.deposits.push(deposit);
        this.updatePoolMetrics();
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`💧 Deposited $${netAmount.toFixed(2)} into Flash Loan Pool (fee: $${fee.toFixed(2)})`, 'success');
        }

        return { success: true, deposit };
    },

    // Withdraw from pool
    withdraw(depositId) {
        const idx = this.deposits.findIndex(d => d.id === depositId);
        if (idx === -1) return { success: false, error: 'Deposit not found' };

        const deposit = this.deposits[idx];
        const totalAmount = deposit.amount + deposit.earnedProfits + deposit.pendingProfits;
        const fee = totalAmount * (this.config.withdrawFee / 100);
        const netAmount = totalAmount - fee;

        this.deposits.splice(idx, 1);
        this.updatePoolMetrics();
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`💰 Withdrew $${netAmount.toFixed(2)} from pool (profits: $${(deposit.earnedProfits + deposit.pendingProfits).toFixed(2)})`, 'success');
        }

        return { success: true, amount: netAmount, profits: deposit.earnedProfits + deposit.pendingProfits };
    },

    // Simulate arbitrage opportunities
    startArbitrageSimulation() {
        setInterval(() => {
            // Random chance of finding arbitrage opportunity
            if (Math.random() < 0.3 && this.pool.totalDeposits > 0) { // 30% chance every interval
                this.executeArbitrage();
            }
        }, 15000); // Check every 15 seconds
    },

    executeArbitrage() {
        // Pick a random DEX pair
        const pair = this.dexPairs[Math.floor(Math.random() * this.dexPairs.length)];

        // Calculate opportunity
        const spreadVariation = (Math.random() - 0.3) * pair.avgSpread;
        const actualSpread = pair.avgSpread + spreadVariation;

        if (actualSpread < this.config.minArbitrageProfit) {
            return; // Not profitable enough
        }

        // Calculate loan amount (up to 50% of pool)
        const maxLoan = this.pool.totalDeposits * (this.config.maxFlashLoanPercent / 100);
        const loanAmount = Math.min(maxLoan, 10000 + Math.random() * 50000); // $10k-$60k loans

        // Calculate profit
        const grossProfit = loanAmount * (actualSpread / 100);
        const gasCost = 2 + Math.random() * 5; // $2-$7 gas
        const netProfit = grossProfit - gasCost;

        if (netProfit <= 0) return;

        // Distribute profits
        const depositorShare = netProfit * (this.config.profitShare / 100);
        const platformShare = netProfit * (this.config.platformShare / 100);

        // Distribute to depositors proportionally
        this.deposits.forEach(d => {
            const share = d.amount / this.pool.totalDeposits;
            d.pendingProfits += depositorShare * share;
        });

        // Record arbitrage
        const arb = {
            id: 'arb-' + Date.now(),
            timestamp: Date.now(),
            pair: pair.pair,
            route: pair.name,
            loanAmount,
            spread: actualSpread,
            grossProfit,
            gasCost,
            netProfit,
            depositorShare,
            platformShare,
            status: 'completed'
        };

        this.arbitrageHistory.unshift(arb);
        if (this.arbitrageHistory.length > 100) {
            this.arbitrageHistory = this.arbitrageHistory.slice(0, 100);
        }

        this.pool.totalProfits += netProfit;
        this.pool.totalArbitrages++;

        this.save();

        // Notification for significant arbitrage
        if (netProfit > 10) {
            if (typeof showNotification === 'function') {
                showNotification(`⚡ Arbitrage executed: ${pair.name} | +$${netProfit.toFixed(2)} profit`, 'success');
            }
        }
    },

    // Claim pending profits
    claimProfits(depositId) {
        const deposit = this.deposits.find(d => d.id === depositId);
        if (!deposit) return { success: false, error: 'Deposit not found' };

        const claimed = deposit.pendingProfits;
        deposit.earnedProfits += claimed;
        deposit.pendingProfits = 0;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`💰 Claimed $${claimed.toFixed(4)} in arbitrage profits`, 'success');
        }

        return { success: true, amount: claimed };
    },

    getStats() {
        const totalPending = this.deposits.reduce((sum, d) => sum + d.pendingProfits, 0);
        const totalEarned = this.deposits.reduce((sum, d) => sum + d.earnedProfits, 0);

        // Calculate APY based on recent performance
        const recentArbs = this.arbitrageHistory.filter(a => a.timestamp > Date.now() - 24 * 60 * 60 * 1000);
        const dailyProfit = recentArbs.reduce((sum, a) => sum + a.depositorShare, 0);
        const estimatedApy = this.pool.totalDeposits > 0
            ? (dailyProfit / this.pool.totalDeposits) * 365 * 100
            : 0;

        return {
            ...this.pool,
            totalPending,
            totalEarned,
            depositorCount: this.deposits.length,
            estimatedApy,
            last24hProfit: dailyProfit,
            last24hArbitrages: recentArbs.length
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const recentArbs = this.arbitrageHistory.slice(0, 10);

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">⚡ Flash Loan Arbitrage Pool</h2>
                <p style="color:#888;margin-bottom:20px;">Deposit to earn from automated DEX arbitrage. Profits shared 70/30.</p>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Pool TVL</div>
                        <div style="color:#00ff88;font-size:20px;font-weight:bold;">$${stats.totalDeposits.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Est. APY</div>
                        <div style="color:#00aaff;font-size:20px;font-weight:bold;">${stats.estimatedApy.toFixed(1)}%</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">24h Profit</div>
                        <div style="color:#ffaa00;font-size:20px;font-weight:bold;">+$${stats.last24hProfit.toFixed(2)}</div>
                    </div>
                    <div style="background:rgba(136,0,255,0.1);border:1px solid rgba(136,0,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">24h Arbs</div>
                        <div style="color:#8800ff;font-size:20px;font-weight:bold;">${stats.last24hArbitrages}</div>
                    </div>
                    <div style="background:rgba(255,68,136,0.1);border:1px solid rgba(255,68,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Arbs</div>
                        <div style="color:#ff4488;font-size:20px;font-weight:bold;">${stats.totalArbitrages}</div>
                    </div>
                </div>

                <!-- Deposit Form -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">💧 Deposit to Pool</h3>
                    <div style="display:flex;gap:12px;align-items:end;">
                        <div style="flex:1;">
                            <label style="color:#888;font-size:12px;">Amount (USDC)</label>
                            <input type="number" id="flp-deposit-amount" placeholder="1000" min="${this.config.minDeposit}"
                                   style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                        </div>
                        <button onclick="FlashLoanPool.depositFromUI()"
                                style="padding:12px 24px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                            Deposit & Earn
                        </button>
                    </div>
                    <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:#888;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                            <span>Deposit Fee:</span><span>${this.config.depositFee}%</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                            <span>Withdraw Fee:</span><span>${this.config.withdrawFee}%</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span>Your Profit Share:</span><span style="color:#00ff88;">${this.config.profitShare}%</span>
                        </div>
                    </div>
                </div>

                <!-- Arbitrage Routes -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">🔄 Active Arbitrage Routes</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
                        ${this.dexPairs.map(pair => `
                            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">
                                <div style="font-weight:bold;color:#fff;font-size:13px;margin-bottom:4px;">${pair.name}</div>
                                <div style="color:#888;font-size:11px;">${pair.pair}</div>
                                <div style="color:#00ff88;font-size:14px;margin-top:8px;">~${pair.avgSpread}% spread</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Your Deposits -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <h3 style="color:#fff;margin-bottom:16px;">💰 Your Deposits (${this.deposits.length})</h3>
                    ${this.deposits.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">
                            No deposits yet. Add liquidity to start earning from arbitrage!
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            ${this.deposits.map(d => {
                                const totalValue = d.amount + d.earnedProfits + d.pendingProfits;
                                const profitPercent = ((d.earnedProfits + d.pendingProfits) / d.amount * 100).toFixed(2);
                                return `
                                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
                                        <div>
                                            <div style="font-weight:bold;color:#fff;">$${d.amount.toFixed(2)} deposited</div>
                                            <div style="font-size:12px;color:#888;margin-top:4px;">
                                                Earned: <span style="color:#00ff88;">+$${d.earnedProfits.toFixed(4)}</span> |
                                                Pending: <span style="color:#ffaa00;">+$${d.pendingProfits.toFixed(4)}</span>
                                            </div>
                                            <div style="font-size:11px;color:#666;margin-top:2px;">
                                                Total: $${totalValue.toFixed(4)} (+${profitPercent}%)
                                            </div>
                                        </div>
                                        <div style="display:flex;gap:8px;">
                                            ${d.pendingProfits > 0.001 ? `
                                                <button onclick="FlashLoanPool.claimProfits('${d.id}');FlashLoanPool.render('${containerId}')"
                                                        style="padding:8px 12px;background:rgba(0,255,136,0.2);border:1px solid rgba(0,255,136,0.4);border-radius:6px;color:#00ff88;cursor:pointer;font-size:12px;">
                                                    Claim $${d.pendingProfits.toFixed(4)}
                                                </button>
                                            ` : ''}
                                            <button onclick="FlashLoanPool.withdraw('${d.id}');FlashLoanPool.render('${containerId}')"
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

                <!-- Recent Arbitrages -->
                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📜 Recent Arbitrages</h3>
                    ${recentArbs.length === 0 ? `
                        <div style="text-align:center;padding:20px;color:#888;">
                            No arbitrages yet. Deposit liquidity to enable arbitrage execution.
                        </div>
                    ` : `
                        <div style="max-height:300px;overflow-y:auto;">
                            ${recentArbs.map(arb => `
                                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;">
                                    <div>
                                        <span style="color:#fff;">${arb.route}</span>
                                        <span style="color:#888;margin-left:8px;">${arb.pair}</span>
                                    </div>
                                    <div style="text-align:right;">
                                        <span style="color:#00ff88;font-weight:bold;">+$${arb.netProfit.toFixed(4)}</span>
                                        <span style="color:#666;margin-left:8px;">${new Date(arb.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    depositFromUI() {
        const amount = parseFloat(document.getElementById('flp-deposit-amount')?.value || 0);
        if (amount < this.config.minDeposit) {
            if (typeof showNotification === 'function') {
                showNotification(`Minimum deposit: $${this.config.minDeposit}`, 'error');
            }
            return;
        }

        const result = this.deposit(amount);
        if (result.success) {
            this.render('flash-loan-pool-container');
        }
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => FlashLoanPool.init());
window.FlashLoanPool = FlashLoanPool;
console.log('[FlashLoanPool] Module loaded');
