// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - LIVE TRADER LEADERBOARD
// Real-time ranking of top traders
// ═══════════════════════════════════════════════════════════════════════════════

const LeaderboardModule = {
    traders: [],
    updateInterval: null,
    container: null,

    // Simulated trader data (would be from API in production)
    traderNames: [
        { name: 'CryptoWhale', avatar: '🐋', tier: 'diamond' },
        { name: 'DeFiKing', avatar: '👑', tier: 'diamond' },
        { name: 'AlphaHunter', avatar: '🎯', tier: 'platinum' },
        { name: 'MoonBoi', avatar: '🌙', tier: 'platinum' },
        { name: 'DiamondHands', avatar: '💎', tier: 'gold' },
        { name: 'TradingBot3000', avatar: '🤖', tier: 'gold' },
        { name: 'SatoshiFan', avatar: '₿', tier: 'gold' },
        { name: 'ETHMaxi', avatar: '⟠', tier: 'silver' },
        { name: 'AltSeason', avatar: '🚀', tier: 'silver' },
        { name: 'YieldFarmer', avatar: '🌾', tier: 'silver' },
        { name: 'LiquidityPro', avatar: '💧', tier: 'silver' },
        { name: 'ArbitrageKing', avatar: '⚡', tier: 'bronze' },
        { name: 'SwingTrader', avatar: '📈', tier: 'bronze' },
        { name: 'ScalpMaster', avatar: '🔪', tier: 'bronze' },
        { name: 'HODLer2024', avatar: '🦍', tier: 'bronze' },
        { name: 'DegenApe', avatar: '🦧', tier: 'bronze' },
        { name: 'SmartMoney', avatar: '🧠', tier: 'bronze' },
        { name: 'ChartWizard', avatar: '📊', tier: 'bronze' },
        { name: 'OnChainDev', avatar: '⛓️', tier: 'bronze' },
        { name: 'NFTFliper', avatar: '🖼️', tier: 'bronze' },
    ],

    init(containerId = 'leaderboardContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.log('[Leaderboard] Container not found, creating...');
            this.createContainer();
        }

        this.generateTraders();
        this.render();
        this.startLiveUpdates();

        console.log('[Leaderboard] Initialized with', this.traders.length, 'traders');
    },

    createContainer() {
        // Find trade tab and add leaderboard
        const tradeTab = document.getElementById('tab-trade');
        if (!tradeTab) return;

        const leaderboardHTML = `
            <div id="leaderboardContainer" class="leaderboard-panel" style="
                background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                border: 1px solid #333;
                border-radius: 16px;
                padding: 20px;
                margin-top: 20px;
            "></div>
        `;

        tradeTab.insertAdjacentHTML('beforeend', leaderboardHTML);
        this.container = document.getElementById('leaderboardContainer');
    },

    generateTraders() {
        this.traders = this.traderNames.map((t, i) => ({
            id: i + 1,
            name: t.name,
            avatar: t.avatar,
            tier: t.tier,
            address: this.generateAddress(),
            pnl24h: this.randomPnL(t.tier),
            pnl7d: 0,
            pnlTotal: 0,
            winRate: this.randomWinRate(t.tier),
            trades24h: Math.floor(Math.random() * 50) + 5,
            volume24h: this.randomVolume(t.tier),
            streak: Math.floor(Math.random() * 10),
            lastTrade: Date.now() - Math.random() * 3600000,
            isLive: Math.random() > 0.3,
        }));

        // Calculate 7d and total PnL
        this.traders.forEach(t => {
            t.pnl7d = t.pnl24h * (3 + Math.random() * 4);
            t.pnlTotal = t.pnl7d * (2 + Math.random() * 5);
        });

        this.sortTraders();
    },

    randomPnL(tier) {
        const ranges = {
            diamond: [5000, 50000],
            platinum: [1000, 10000],
            gold: [200, 3000],
            silver: [50, 500],
            bronze: [-100, 300],
        };
        const [min, max] = ranges[tier] || [0, 100];
        return min + Math.random() * (max - min);
    },

    randomWinRate(tier) {
        const ranges = {
            diamond: [75, 95],
            platinum: [65, 85],
            gold: [55, 75],
            silver: [45, 65],
            bronze: [35, 55],
        };
        const [min, max] = ranges[tier] || [40, 60];
        return min + Math.random() * (max - min);
    },

    randomVolume(tier) {
        const multipliers = {
            diamond: 500000,
            platinum: 100000,
            gold: 25000,
            silver: 5000,
            bronze: 1000,
        };
        return Math.random() * (multipliers[tier] || 1000);
    },

    generateAddress() {
        const chars = '0123456789abcdef';
        let addr = '0x';
        for (let i = 0; i < 6; i++) addr += chars[Math.floor(Math.random() * 16)];
        addr += '...';
        for (let i = 0; i < 4; i++) addr += chars[Math.floor(Math.random() * 16)];
        return addr;
    },

    sortTraders() {
        this.traders.sort((a, b) => b.pnl24h - a.pnl24h);
        this.traders.forEach((t, i) => t.rank = i + 1);
    },

    updateLive() {
        this.traders.forEach(t => {
            // Random PnL changes
            const change = (Math.random() - 0.45) * t.pnl24h * 0.02;
            t.pnl24h += change;

            // Random trade activity
            if (Math.random() > 0.8) {
                t.trades24h++;
                t.lastTrade = Date.now();
                t.isLive = true;

                // Win/loss
                if (Math.random() < t.winRate / 100) {
                    t.streak++;
                } else {
                    t.streak = 0;
                }
            }

            // Toggle live status
            if (Math.random() > 0.95) {
                t.isLive = !t.isLive;
            }
        });

        this.sortTraders();
        this.render();
    },

    startLiveUpdates() {
        this.updateInterval = setInterval(() => this.updateLive(), 3000);
    },

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    },

    formatPnL(value) {
        const absVal = Math.abs(value);
        if (absVal >= 1000000) return (value / 1000000).toFixed(2) + 'M';
        if (absVal >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toFixed(0);
    },

    formatVolume(value) {
        if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M';
        if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K';
        return '$' + value.toFixed(0);
    },

    timeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return seconds + 's ago';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        return Math.floor(seconds / 3600) + 'h ago';
    },

    getTierColor(tier) {
        const colors = {
            diamond: '#b9f2ff',
            platinum: '#e5e4e2',
            gold: '#ffd700',
            silver: '#c0c0c0',
            bronze: '#cd7f32',
        };
        return colors[tier] || '#888';
    },

    getTierBadge(tier) {
        const badges = {
            diamond: '💠',
            platinum: '🏆',
            gold: '🥇',
            silver: '🥈',
            bronze: '🥉',
        };
        return badges[tier] || '';
    },

    render() {
        if (!this.container) return;

        const topTraders = this.traders.slice(0, 15);

        this.container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <div>
                    <h3 style="color:#fff;margin:0;font-size:1.3rem;">🏆 ${(typeof I18n !== 'undefined' ? I18n.t('top_traders_live') : 'Top Traders Live')}</h3>
                    <p style="color:#888;margin:4px 0 0 0;font-size:0.85rem;">${(typeof I18n !== 'undefined' ? I18n.t('live_ranking') : 'Classement en temps réel')}</p>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="width:8px;height:8px;background:#00ff88;border-radius:50%;animation:pulse 2s infinite;"></span>
                    <span style="color:#00ff88;font-size:0.85rem;">${(typeof I18n !== 'undefined' ? I18n.t('live') : 'LIVE')}</span>
                </div>
            </div>

            <!-- Top 3 Podium -->
            <div style="display:flex;justify-content:center;gap:15px;margin-bottom:25px;">
                ${this.renderPodium(topTraders.slice(0, 3))}
            </div>

            <!-- Leaderboard Table -->
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
                    <thead>
                        <tr style="color:#888;text-align:left;border-bottom:1px solid #333;">
                            <th style="padding:10px 5px;width:50px;">#</th>
                            <th style="padding:10px 5px;">${(typeof I18n !== 'undefined' ? I18n.t('trader') : 'Trader')}</th>
                            <th style="padding:10px 5px;text-align:right;">${(typeof I18n !== 'undefined' ? I18n.t('pnl_24h') : 'PnL 24h')}</th>
                            <th style="padding:10px 5px;text-align:right;">${(typeof I18n !== 'undefined' ? I18n.t('win_rate') : 'Win Rate')}</th>
                            <th style="padding:10px 5px;text-align:right;">${(typeof I18n !== 'undefined' ? I18n.t('volume') : 'Volume')}</th>
                            <th style="padding:10px 5px;text-align:center;">${(typeof I18n !== 'undefined' ? I18n.t('streak') : 'Streak')}</th>
                            <th style="padding:10px 5px;text-align:right;">${(typeof I18n !== 'undefined' ? I18n.t('status') : 'Status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topTraders.map((t, i) => this.renderRow(t, i)).join('')}
                    </tbody>
                </table>
            </div>

            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .trader-row:hover {
                    background: #ffffff08 !important;
                }
                .rank-change-up { color: #00ff88; }
                .rank-change-down { color: #ff6464; }
            </style>
        `;
    },

    renderPodium(top3) {
        if (top3.length < 3) return '';

        const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
        const heights = ['120px', '150px', '100px'];
        const positions = ['🥈', '🥇', '🥉'];

        return podiumOrder.map((t, i) => `
            <div style="text-align:center;width:100px;">
                <div style="font-size:2rem;margin-bottom:5px;">${t.avatar}</div>
                <div style="color:#fff;font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.name}</div>
                <div style="color:${t.pnl24h >= 0 ? '#00ff88' : '#ff6464'};font-weight:700;font-size:1.1rem;">
                    ${t.pnl24h >= 0 ? '+' : ''}$${this.formatPnL(t.pnl24h)}
                </div>
                <div style="
                    background: linear-gradient(180deg, ${i === 1 ? '#ffd700' : i === 0 ? '#c0c0c0' : '#cd7f32'}, #333);
                    height: ${heights[i]};
                    border-radius: 8px 8px 0 0;
                    margin-top: 10px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 10px;
                    font-size: 1.5rem;
                ">${positions[i]}</div>
            </div>
        `).join('');
    },

    renderRow(trader, index) {
        const pnlColor = trader.pnl24h >= 0 ? '#00ff88' : '#ff6464';
        const pnlSign = trader.pnl24h >= 0 ? '+' : '';
        const isTop3 = index < 3;
        const bgColor = isTop3 ? '#ffffff05' : 'transparent';

        return `
            <tr class="trader-row" style="border-bottom:1px solid #222;background:${bgColor};transition:background 0.2s;">
                <td style="padding:12px 5px;">
                    <span style="
                        display:inline-flex;
                        align-items:center;
                        justify-content:center;
                        width:28px;
                        height:28px;
                        border-radius:50%;
                        background:${isTop3 ? 'linear-gradient(135deg,#ffd700,#ff8c00)' : '#333'};
                        color:${isTop3 ? '#000' : '#fff'};
                        font-weight:700;
                        font-size:0.85rem;
                    ">${trader.rank}</span>
                </td>
                <td style="padding:12px 5px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:1.5rem;">${trader.avatar}</span>
                        <div>
                            <div style="color:#fff;font-weight:500;">
                                ${trader.name}
                                <span style="color:${this.getTierColor(trader.tier)};font-size:0.8rem;margin-left:5px;">${this.getTierBadge(trader.tier)}</span>
                            </div>
                            <div style="color:#666;font-size:0.75rem;">${trader.address}</div>
                        </div>
                    </div>
                </td>
                <td style="padding:12px 5px;text-align:right;">
                    <div style="color:${pnlColor};font-weight:600;">${pnlSign}$${this.formatPnLSafeOps.percentage(trader.pnl24h)}<, div>
                    <div style="color:#666;font-size:0.75rem;">${pnlSign}${((trader.pnl24h / 10000)).toFixed(1)}%</div>
                </td>
                <td style="padding:12px 5px;text-align:right;">
                    <div style="color:${trader.winRate >= 60 ? '#00ff88' : trader.winRate >= 50 ? '#ffaa00' : '#ff6464'};">
                        ${trader.winRate.toFixed(1)}%
                    </div>
                    <div style="color:#666;font-size:0.75rem;">${trader.trades24h} ${(typeof I18n !== 'undefined' ? I18n.t('trades') : 'trades')}</div>
                </td>
                <td style="padding:12px 5px;text-align:right;color:#888;">
                    ${this.formatVolume(trader.volume24h)}
                </td>
                <td style="padding:12px 5px;text-align:center;">
                    ${trader.streak > 0 ? `<span style="color:#00ff88;">🔥${trader.streak}</span>` : '-'}
                </td>
                <td style="padding:12px 5px;text-align:right;">
                    ${trader.isLive ? `
                        <span style="display:inline-flex;align-items:center;gap:5px;color:#00ff88;font-size:0.8rem;">
                            <span style="width:6px;height:6px;background:#00ff88;border-radius:50%;animation:pulse 1.5s infinite;"></span>
                            Live
                        </span>
                    ` : `
                        <span style="color:#666;font-size:0.8rem;">${this.timeAgo(trader.lastTrade)}</span>
                    `}
                </td>
            </tr>
        `;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize when trade tab is shown or after a delay
    setTimeout(() => {
        if (document.getElementById('tab-trade')) {
            LeaderboardModule.init();
        }
    }, 1000);
});

// Also init when trade tab is clicked
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-tab="trade"]')) {
        setTimeout(() => LeaderboardModule.init(), 100);
    }
});
