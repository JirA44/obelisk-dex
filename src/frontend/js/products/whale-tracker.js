/**
 * WHALE TRACKER - Copy Smart Money
 * Track and copy whale wallet movements
 */
const WhaleTrackerModule = {
    trackedWallets: [],
    alerts: [],

    mockWhales: [
        { address: '0x28C6c06298d514Db089934071355E5743bf21d60', name: 'Binance Hot', icon: '🐋', totalValue: 2400000000, activity: 'high' },
        { address: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549', name: 'Jump Trading', icon: '🦈', totalValue: 890000000, activity: 'medium' },
        { address: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', name: 'Genesis Trading', icon: '🐳', totalValue: 650000000, activity: 'high' },
        { address: '0x8103683202aa8DA10536036EDef04CDd865C225E', name: 'Alameda (RIP)', icon: '💀', totalValue: 12000000, activity: 'low' },
        { address: '0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296', name: 'Paradigm', icon: '🔮', totalValue: 780000000, activity: 'medium' },
        { address: '0x1B3cB81E51011b549d78bf720b0d924ac763A7C2', name: 'a]6z Wallet', icon: '🅰️', totalValue: 450000000, activity: 'high' }
    ],

    recentTrades: [],

    init() {
        this.trackedWallets = JSON.parse(localStorage.getItem('obelisk_whale_tracked') || '[]');
        this.generateMockTrades();
    },

    save() {
        localStorage.setItem('obelisk_whale_tracked', JSON.stringify(this.trackedWallets));
    },

    generateMockTrades() {
        const tokens = ['ETH', 'BTC', 'SOL', 'ARB', 'OP', 'LINK', 'AAVE', 'UNI', 'PEPE', 'WIF'];
        const actions = ['BUY', 'SELL', 'TRANSFER'];

        this.recentTrades = this.mockWhales.flatMap(whale => {
            const numTrades = Math.floor(Math.random() * 3) + 1;
            return Array.from({ length: numTrades }, () => ({
                whale: whale.name,
                whaleIcon: whale.icon,
                address: whale.address,
                action: actions[Math.floor(Math.random() * actions.length)],
                token: tokens[Math.floor(Math.random() * tokens.length)],
                amount: Math.floor(Math.random() * 10000000) + 100000,
                timestamp: Date.now() - Math.floor(Math.random() * 86400000)
            }));
        }).sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
    },

    trackWallet(address) {
        const whale = this.mockWhales.find(w => w.address === address);
        if (!whale) return;

        if (!this.trackedWallets.includes(address)) {
            this.trackedWallets.push(address);
            this.save();
            if (typeof showNotification === 'function') {
                showNotification(`🐋 Now tracking ${whale.name}`, 'success');
            }
        }
    },

    untrackWallet(address) {
        this.trackedWallets = this.trackedWallets.filter(w => w !== address);
        this.save();
    },

    copyTrade(trade) {
        if (typeof showNotification === 'function') {
            showNotification(`📋 Copying trade: ${trade.action} ${trade.token} (simulated)`, 'info');
        }
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">🐋 Whale Tracker</h2>
                <p style="color:#888;margin-bottom:20px;">Track smart money • Copy whale trades • Get alerts on big moves</p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <!-- Whale List -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">🦈 Top Whales</h3>
                        <div style="display:grid;gap:12px;">
                            ${this.mockWhales.map(whale => {
                                const isTracked = this.trackedWallets.includes(whale.address);
                                return `
                                    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
                                        <div style="display:flex;align-items:center;gap:12px;">
                                            <span style="font-size:24px;">${whale.icon}</span>
                                            <div>
                                                <div style="color:#fff;font-weight:bold;">${whale.name}</div>
                                                <div style="color:#888;font-size:11px;font-family:monospace;">${whale.address.slice(0, 8)}...${whale.address.slice(-6)}</div>
                                            </div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="color:#00ff88;font-weight:bold;">$${(whale.totalValue / 1e9).toFixed(2)}B</div>
                                            <div style="color:${whale.activity === 'high' ? '#00ff88' : whale.activity === 'medium' ? '#ffaa00' : '#888'};font-size:11px;">
                                                ${whale.activity.toUpperCase()} activity
                                            </div>
                                        </div>
                                        <button onclick="WhaleTrackerModule.${isTracked ? 'untrackWallet' : 'trackWallet'}('${whale.address}');WhaleTrackerModule.render('${containerId}')"
                                                style="padding:6px 12px;background:${isTracked ? 'rgba(255,68,68,0.2)' : 'rgba(0,255,136,0.2)'};border:1px solid ${isTracked ? 'rgba(255,68,68,0.4)' : 'rgba(0,255,136,0.4)'};border-radius:6px;color:${isTracked ? '#ff4444' : '#00ff88'};cursor:pointer;font-size:11px;">
                                            ${isTracked ? '🔕 Untrack' : '🔔 Track'}
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Recent Trades -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📊 Recent Whale Moves</h3>
                        <div style="max-height:400px;overflow-y:auto;">
                            ${this.recentTrades.map(trade => `
                                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <span>${trade.whaleIcon}</span>
                                        <div>
                                            <div style="color:#fff;font-size:13px;">${trade.whale}</div>
                                            <div style="color:#888;font-size:11px;">${new Date(trade.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                    <div style="text-align:center;">
                                        <span style="padding:2px 8px;background:${trade.action === 'BUY' ? 'rgba(0,255,136,0.2)' : trade.action === 'SELL' ? 'rgba(255,68,68,0.2)' : 'rgba(0,170,255,0.2)'};border-radius:4px;font-size:11px;color:${trade.action === 'BUY' ? '#00ff88' : trade.action === 'SELL' ? '#ff4444' : '#00aaff'};">
                                            ${trade.action}
                                        </span>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="color:#fff;font-weight:bold;">${trade.token}</div>
                                        <div style="color:#888;font-size:11px;">$${(trade.amount / 1e6).toFixed(2)}M</div>
                                    </div>
                                    <button onclick="WhaleTrackerModule.copyTrade(${JSON.stringify(trade).replace(/"/g, '&quot;')})"
                                            style="padding:4px 8px;background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.4);border-radius:4px;color:#a855f7;cursor:pointer;font-size:10px;">
                                        Copy
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Tracked Stats -->
                <div style="margin-top:20px;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;display:flex;justify-content:space-around;">
                    <div style="text-align:center;">
                        <div style="color:#888;font-size:12px;">Tracked Wallets</div>
                        <div style="color:#00ff88;font-size:20px;font-weight:bold;">${this.trackedWallets.length}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#888;font-size:12px;">Alerts Today</div>
                        <div style="color:#ffaa00;font-size:20px;font-weight:bold;">${Math.floor(Math.random() * 12) + 3}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#888;font-size:12px;">Copy Win Rate</div>
                        <div style="color:#00aaff;font-size:20px;font-weight:bold;">67%</div>
                    </div>
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => WhaleTrackerModule.init());
window.WhaleTrackerModule = WhaleTrackerModule;
