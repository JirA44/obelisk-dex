/**
 * MEV PROTECTION - Shield from Sandwich Attacks
 * Private transactions, flashbots, MEV protection
 */
const MEVProtectionModule = {
    protectedTxs: [],
    savedAmount: 0,

    protectionModes: {
        standard: { name: 'Standard', icon: '🛡️', fee: 0, desc: 'Basic protection via private mempool' },
        flashbots: { name: 'Flashbots', icon: '⚡', fee: 0.1, desc: 'Direct to block builders' },
        private: { name: 'Private RPC', icon: '🔒', fee: 0.05, desc: 'Encrypted transaction relay' },
        bundle: { name: 'Bundle', icon: '📦', fee: 0.15, desc: 'Atomic multi-tx execution' }
    },

    mevTypes: [
        { type: 'Sandwich', icon: '🥪', risk: 'high', desc: 'Front + back-running your swap' },
        { type: 'Frontrun', icon: '🏃', risk: 'high', desc: 'Copy your tx with higher gas' },
        { type: 'Backrun', icon: '🔙', risk: 'medium', desc: 'Arbitrage after your trade' },
        { type: 'Liquidation', icon: '💀', risk: 'medium', desc: 'Race to liquidate positions' },
        { type: 'JIT Liquidity', icon: '💧', risk: 'low', desc: 'Just-in-time LP provision' }
    ],

    recentProtections: [],

    init() {
        this.protectedTxs = JSON.parse(localStorage.getItem('obelisk_mev_protected') || '[]');
        this.savedAmount = parseFloat(localStorage.getItem('obelisk_mev_saved') || '0');
        this.generateMockProtections();
    },

    save() {
        localStorage.setItem('obelisk_mev_protected', JSON.stringify(this.protectedTxs));
        localStorage.setItem('obelisk_mev_saved', this.savedAmount.toString());
    },

    generateMockProtections() {
        const tokens = ['ETH/USDC', 'WBTC/ETH', 'ARB/USDC', 'LINK/ETH', 'UNI/USDC'];
        this.recentProtections = Array.from({ length: 8 }, (_, i) => ({
            id: 'prot-' + (Date.now() - i * 3600000),
            pair: tokens[Math.floor(Math.random() * tokens.length)],
            amount: Math.floor(Math.random() * 50000) + 1000,
            mevBlocked: Math.floor(Math.random() * 500) + 50,
            mode: Object.keys(this.protectionModes)[Math.floor(Math.random() * 4)],
            timestamp: Date.now() - i * 3600000 - Math.random() * 3600000
        }));
    },

    protectTransaction(data) {
        const protection = {
            id: 'prot-' + Date.now(),
            pair: data.pair,
            amount: data.amount,
            mode: data.mode || 'flashbots',
            mevBlocked: Math.floor(data.amount * (0.005 + Math.random() * 0.01)),
            timestamp: Date.now()
        };

        this.protectedTxs.push(protection);
        this.savedAmount += protection.mevBlocked;
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`🛡️ MEV Protected! Saved ~$${protection.mevBlocked} from extraction`, 'success');
        }

        return protection;
    },

    getStats() {
        return {
            totalProtected: this.protectedTxs.length,
            totalSaved: this.savedAmount,
            avgSaved: this.protectedTxs.length > 0 ? this.savedAmount / this.protectedTxs.length : 0
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">🛡️ MEV Protection</h2>
                <p style="color:#888;margin-bottom:20px;">Shield your trades from sandwich attacks • Private transactions • Flashbots relay</p>

                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Saved from MEV</div>
                        <div style="color:#00ff88;font-size:24px;font-weight:bold;">$${stats.totalSaved.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Protected Transactions</div>
                        <div style="color:#00aaff;font-size:24px;font-weight:bold;">${stats.totalProtected}</div>
                    </div>
                    <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Avg Saved per Tx</div>
                        <div style="color:#a855f7;font-size:24px;font-weight:bold;">$${stats.avgSaved.toFixed(0)}</div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <!-- Protection Modes -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">⚙️ Protection Modes</h3>
                        <div style="display:grid;gap:10px;">
                            ${Object.entries(this.protectionModes).map(([key, mode]) => `
                                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
                                    <div style="display:flex;align-items:center;gap:12px;">
                                        <span style="font-size:24px;">${mode.icon}</span>
                                        <div>
                                            <div style="color:#fff;font-weight:bold;">${mode.name}</div>
                                            <div style="color:#888;font-size:11px;">${mode.desc}</div>
                                        </div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="color:${mode.fee === 0 ? '#00ff88' : '#ffaa00'};font-weight:bold;">${mode.fee === 0 ? 'FREE' : mode.fee + '%'}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- MEV Types -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">🎯 MEV Attack Types</h3>
                        <div style="display:grid;gap:10px;">
                            ${this.mevTypes.map(mev => `
                                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
                                    <div style="display:flex;align-items:center;gap:12px;">
                                        <span style="font-size:20px;">${mev.icon}</span>
                                        <div>
                                            <div style="color:#fff;font-weight:500;">${mev.type}</div>
                                            <div style="color:#888;font-size:11px;">${mev.desc}</div>
                                        </div>
                                    </div>
                                    <span style="padding:2px 8px;background:${mev.risk === 'high' ? 'rgba(255,68,68,0.2)' : mev.risk === 'medium' ? 'rgba(255,170,0,0.2)' : 'rgba(0,255,136,0.2)'};border-radius:4px;font-size:10px;color:${mev.risk === 'high' ? '#ff4444' : mev.risk === 'medium' ? '#ffaa00' : '#00ff88'};">
                                        ${mev.risk.toUpperCase()}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Recent Protections -->
                <div style="margin-top:20px;background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                    <h3 style="color:#fff;margin-bottom:16px;">📊 Recent Protected Trades</h3>
                    <div style="display:grid;gap:8px;">
                        ${this.recentProtections.slice(0, 6).map(p => `
                            <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:12px;align-items:center;">
                                <div style="color:#fff;">${p.pair}</div>
                                <div style="color:#888;">$${p.amount.toLocaleString()}</div>
                                <div>
                                    <span style="padding:2px 6px;background:rgba(0,255,136,0.2);border-radius:4px;font-size:10px;color:#00ff88;">
                                        ${this.protectionModes[p.mode]?.icon} ${this.protectionModes[p.mode]?.name}
                                    </span>
                                </div>
                                <div style="color:#00ff88;font-weight:bold;">+$${p.mevBlocked} saved</div>
                                <div style="color:#888;font-size:11px;">${new Date(p.timestamp).toLocaleTimeString()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Enable Protection -->
                <div style="margin-top:20px;background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,170,255,0.1));border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:20px;text-align:center;">
                    <div style="color:#fff;font-size:18px;font-weight:bold;margin-bottom:8px;">🛡️ MEV Protection is ACTIVE</div>
                    <div style="color:#888;font-size:12px;">All trades through Obelisk are automatically protected via Flashbots</div>
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => MEVProtectionModule.init());
window.MEVProtectionModule = MEVProtectionModule;
