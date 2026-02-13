/**
 * GAS OPTIMIZER - Save on Transaction Fees
 * Batch transactions, gas timing, optimal routes
 */
const GasOptimizerModule = {
    pendingTxs: [],
    batches: [],
    totalSaved: 0,

    gasLevels: {
        slow: { name: 'Slow', icon: '🐢', multiplier: 0.8, time: '~10 min' },
        standard: { name: 'Standard', icon: '🚶', multiplier: 1.0, time: '~3 min' },
        fast: { name: 'Fast', icon: '🚀', multiplier: 1.3, time: '~1 min' },
        instant: { name: 'Instant', icon: '⚡', multiplier: 1.8, time: '~15 sec' }
    },

    currentGas: {
        base: 25,
        priority: 2,
        eth: 2650
    },

    init() {
        this.pendingTxs = JSON.parse(localStorage.getItem('obelisk_pending_txs') || '[]');
        this.batches = JSON.parse(localStorage.getItem('obelisk_gas_batches') || '[]');
        this.totalSaved = parseFloat(localStorage.getItem('obelisk_gas_saved') || '0');
        this.updateGasPrice();
    },

    save() {
        localStorage.setItem('obelisk_pending_txs', JSON.stringify(this.pendingTxs));
        localStorage.setItem('obelisk_gas_batches', JSON.stringify(this.batches));
        localStorage.setItem('obelisk_gas_saved', this.totalSaved.toString());
    },

    updateGasPrice() {
        // Simulate gas price fluctuation
        this.currentGas.base = Math.floor(15 + Math.random() * 30);
        this.currentGas.priority = Math.floor(1 + Math.random() * 5);
    },

    addTransaction(tx) {
        this.pendingTxs.push({
            id: 'tx-' + Date.now(),
            type: tx.type,
            description: tx.description,
            estimatedGas: tx.gas || 21000,
            addedAt: Date.now()
        });
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`📥 Transaction queued for batching`, 'info');
        }
    },

    executeBatch() {
        if (this.pendingTxs.length === 0) return;

        const individualGas = this.pendingTxs.reduce((sum, tx) => sum + tx.estimatedGas, 0);
        const batchedGas = Math.floor(individualGas * 0.6); // 40% savings
        const gasSaved = individualGas - batchedGas;
        const usdSaved = (gasSaved * this.currentGas.base * 1e-9 * this.currentGas.eth);

        const batch = {
            id: 'batch-' + Date.now(),
            txCount: this.pendingTxs.length,
            individualGas,
            batchedGas,
            gasSaved,
            usdSaved,
            timestamp: Date.now()
        };

        this.batches.push(batch);
        this.totalSaved += usdSaved;
        this.pendingTxs = [];
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`✅ Batch executed! Saved $${usdSaved.toFixed(2)} in gas`, 'success');
        }
    },

    getOptimalTime() {
        const hour = new Date().getHours();
        if (hour >= 2 && hour < 8) return { status: 'optimal', desc: 'Low activity period' };
        if (hour >= 14 && hour < 18) return { status: 'high', desc: 'US market hours' };
        return { status: 'medium', desc: 'Normal activity' };
    },

    getStats() {
        return {
            pendingCount: this.pendingTxs.length,
            batchCount: this.batches.length,
            totalSaved: this.totalSaved,
            currentGas: this.currentGas.base
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const optimalTime = this.getOptimalTime();

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">⛽ Gas Optimizer</h2>
                <p style="color:#888;margin-bottom:20px;">Batch transactions • Optimal timing • Save up to 40% on gas</p>

                <!-- Current Gas -->
                <div style="background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,170,255,0.1));border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;text-align:center;">
                        <div>
                            <div style="color:#888;font-size:11px;">Base Fee</div>
                            <div style="color:#fff;font-size:24px;font-weight:bold;">${this.currentGas.base} gwei</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:11px;">Priority Fee</div>
                            <div style="color:#fff;font-size:24px;font-weight:bold;">${this.currentGas.priority} gwei</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:11px;">Network Status</div>
                            <div style="color:${optimalTime.status === 'optimal' ? '#00ff88' : optimalTime.status === 'high' ? '#ff4444' : '#ffaa00'};font-size:24px;font-weight:bold;">
                                ${optimalTime.status.toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:11px;">Total Saved</div>
                            <div style="color:#00ff88;font-size:24px;font-weight:bold;">$${stats.totalSaved.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <!-- Gas Levels -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">⚡ Gas Speeds</h3>
                        <div style="display:grid;gap:10px;">
                            ${Object.entries(this.gasLevels).map(([key, level]) => {
                                const totalGas = Math.floor((this.currentGas.base + this.currentGas.priority) * level.multiplier);
                                const cost = (totalGas * 21000 * 1e-9 * this.currentGas.eth).toFixed(2);
                                return `
                                    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
                                        <div style="display:flex;align-items:center;gap:10px;">
                                            <span style="font-size:20px;">${level.icon}</span>
                                            <div>
                                                <div style="color:#fff;font-weight:500;">${level.name}</div>
                                                <div style="color:#888;font-size:11px;">${level.time}</div>
                                            </div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="color:#fff;font-weight:bold;">${totalGas} gwei</div>
                                            <div style="color:#888;font-size:11px;">~$${cost}/tx</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Pending Batch -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📦 Pending Batch (${stats.pendingCount})</h3>
                        ${this.pendingTxs.length === 0 ? `
                            <div style="text-align:center;padding:30px;color:#888;">
                                <div style="font-size:32px;margin-bottom:12px;">📦</div>
                                <div>No pending transactions</div>
                                <div style="font-size:12px;margin-top:8px;">Add transactions to batch for savings</div>
                            </div>
                        ` : `
                            <div style="display:grid;gap:8px;margin-bottom:16px;">
                                ${this.pendingTxs.map(tx => `
                                    <div style="background:rgba(255,255,255,0.05);border-radius:6px;padding:10px;display:flex;justify-content:space-between;align-items:center;">
                                        <div style="color:#fff;font-size:13px;">${tx.description}</div>
                                        <div style="color:#888;font-size:11px;">${tx.estimatedGas.toLocaleString()} gas</div>
                                    </div>
                                `).join('')}
                            </div>
                            <div style="background:rgba(0,255,136,0.1);border-radius:8px;padding:12px;margin-bottom:12px;">
                                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                                    <span style="color:#888;">Individual gas:</span>
                                    <span style="color:#ff4444;">${this.pendingTxs.reduce((s, t) => s + t.estimatedGas, 0).toLocaleString()}</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;">
                                    <span style="color:#888;">Batched gas:</span>
                                    <span style="color:#00ff88;">${Math.floor(this.pendingTxs.reduce((s, t) => s + t.estimatedGas, 0) * 0.6).toLocaleString()} (40% off)</span>
                                </div>
                            </div>
                            <button onclick="GasOptimizerModule.executeBatch();GasOptimizerModule.render('${containerId}')"
                                    style="width:100%;padding:12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                                Execute Batch
                            </button>
                        `}
                    </div>
                </div>

                <!-- Quick Add -->
                <div style="margin-top:20px;background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">➕ Quick Add Transactions</h3>
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                        ${[
                            { type: 'swap', desc: 'Token Swap', gas: 150000 },
                            { type: 'approve', desc: 'Token Approve', gas: 45000 },
                            { type: 'transfer', desc: 'ETH Transfer', gas: 21000 },
                            { type: 'stake', desc: 'Stake Tokens', gas: 120000 },
                            { type: 'claim', desc: 'Claim Rewards', gas: 80000 },
                            { type: 'bridge', desc: 'Bridge Assets', gas: 200000 },
                            { type: 'mint', desc: 'Mint NFT', gas: 180000 },
                            { type: 'lp', desc: 'Add Liquidity', gas: 250000 }
                        ].map(tx => `
                            <button onclick="GasOptimizerModule.addTransaction({type:'${tx.type}',description:'${tx.desc}',gas:${tx.gas}});GasOptimizerModule.render('${containerId}')"
                                    style="padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;text-align:left;">
                                <div style="font-weight:500;">${tx.desc}</div>
                                <div style="color:#888;font-size:11px;">${tx.gas.toLocaleString()} gas</div>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Tips -->
                <div style="margin-top:20px;background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;">
                    <div style="color:#ffaa00;font-weight:bold;margin-bottom:8px;">💡 Gas Saving Tips</div>
                    <ul style="color:#888;font-size:12px;margin:0;padding-left:20px;">
                        <li>Best times: 2-8 AM UTC (lowest gas)</li>
                        <li>Batch multiple approvals together</li>
                        <li>Use EIP-1559 for predictable fees</li>
                        <li>Set gas limit 10% above estimate</li>
                    </ul>
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => GasOptimizerModule.init());
window.GasOptimizerModule = GasOptimizerModule;
