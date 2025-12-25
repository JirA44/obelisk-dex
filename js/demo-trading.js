/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║   OBELISK DEMO TRADING - Paper Trading Mode                              ║
 * ║   Simulated trades with virtual balance                                   ║
 * ║   Real prices from Hyperliquid + dYdX                                    ║
 * ║   Version: 2.1.0 - Collapsible panel                                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

const DemoTrading = {
    // Demo account state
    account: {
        balance: 10000,          // Starting virtual balance ($10,000)
        initialBalance: 10000,
        positions: [],
        orders: [],
        history: [],
        pnl: 0,
        winRate: 0,
        totalTrades: 0,
        wins: 0,
        losses: 0
    },

    // Settings
    settings: {
        maxLeverage: 20,
        defaultLeverage: 5,
        minOrderSize: 10,
        fees: 0.0005  // 0.05% per trade
    },

    // API
    apiUrl: 'https://obelisk-api-real.hugo-padilla-pro.workers.dev',

    /**
     * Initialize demo trading
     */
    init() {
        console.log('🎮 [DEMO] Initializing Paper Trading Mode...');

        // Load saved state from localStorage
        this.loadState();

        // Add demo panel to UI
        this.createDemoPanel();

        // Update positions with live prices
        this.startPositionUpdater();

        console.log(`🎮 [DEMO] Ready! Balance: $${this.account.balance.toFixed(2)}`);
    },

    /**
     * Save/Load state from localStorage
     */
    saveState() {
        localStorage.setItem('obelisk_demo_account', JSON.stringify(this.account));
    },

    loadState() {
        const saved = localStorage.getItem('obelisk_demo_account');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.account = { ...this.account, ...parsed };
                console.log('🎮 [DEMO] Loaded saved account');
            } catch (e) {
                console.log('🎮 [DEMO] Starting fresh account');
            }
        }
    },

    resetAccount() {
        this.account = {
            balance: 10000,
            initialBalance: 10000,
            positions: [],
            orders: [],
            history: [],
            pnl: 0,
            winRate: 0,
            totalTrades: 0,
            wins: 0,
            losses: 0
        };
        this.saveState();
        this.updatePanel();
        console.log('🎮 [DEMO] Account reset to $10,000');
    },

    /**
     * Place a demo order
     */
    async placeOrder(pair, side, size, leverage = 5) {
        const coin = pair.replace('/USDC', '').replace('-USD', '');

        // Get real price from multiple sources
        let price;

        // Try RealtimePrices first (fastest)
        if (typeof RealtimePrices !== 'undefined' && RealtimePrices.getPrice) {
            price = RealtimePrices.getPrice(coin);
        }

        // Try local backend
        if (!price) {
            try {
                const res = await fetch(`http://localhost:3001/api/ticker/${coin}`);
                const data = await res.json();
                price = data.price;
            } catch (e) {}
        }

        // Try Obelisk API
        if (!price) {
            try {
                const res = await fetch(`${this.apiUrl}/api/ticker/${coin}`);
                const data = await res.json();
                price = data.price;
            } catch (e) {}
        }

        // Fallback simulated prices for demo
        if (!price) {
            const simulatedPrices = {
                'BTC': 104500 + Math.random() * 500,
                'ETH': 3900 + Math.random() * 50,
                'SOL': 220 + Math.random() * 5,
                'DOGE': 0.42 + Math.random() * 0.02
            };
            price = simulatedPrices[coin] || 100;
            console.log(`[DEMO] Using simulated price for ${coin}: $${price.toFixed(2)}`);
        }

        if (!price) {
            this.showNotification('❌ Prix non disponible', 'error');
            return null;
        }

        // Validate order
        if (size < this.settings.minOrderSize) {
            this.showNotification(`❌ Minimum: $${this.settings.minOrderSize}`, 'error');
            return null;
        }

        const margin = size / leverage;
        if (margin > this.account.balance) {
            this.showNotification('❌ Balance insuffisante', 'error');
            return null;
        }

        // Calculate fees
        const fee = size * this.settings.fees;

        // Create position
        const position = {
            id: 'POS_' + Date.now(),
            coin,
            pair,
            side,
            size,
            leverage,
            entryPrice: price,
            currentPrice: price,
            margin,
            pnl: 0,
            pnlPercent: 0,
            fee,
            timestamp: Date.now(),
            status: 'open'
        };

        // Deduct margin + fee from balance
        this.account.balance -= (margin + fee);
        this.account.positions.push(position);

        // Save and update UI
        this.saveState();
        this.updatePanel();

        // Log to history
        this.account.history.unshift({
            type: 'open',
            ...position,
            time: new Date().toLocaleTimeString()
        });

        this.showNotification(
            `✅ ${side.toUpperCase()} ${coin} @ $${price.toFixed(2)} (${leverage}x)`,
            'success'
        );

        console.log(`🎮 [DEMO] Opened ${side} ${coin}: $${size} @ ${leverage}x`);

        return position;
    },

    /**
     * Close a position
     */
    async closePosition(positionId) {
        const posIndex = this.account.positions.findIndex(p => p.id === positionId);
        if (posIndex === -1) return null;

        const position = this.account.positions[posIndex];

        // Get current price
        let currentPrice;
        try {
            const res = await fetch(`${this.apiUrl}/api/ticker/${position.coin}`);
            const data = await res.json();
            currentPrice = data.price;
        } catch (e) {
            if (typeof RealtimePrices !== 'undefined') {
                currentPrice = RealtimePrices.getPrice(position.coin);
            }
        }

        if (!currentPrice) currentPrice = position.currentPrice;

        // Calculate PnL
        let pnl;
        if (position.side === 'long') {
            pnl = ((currentPrice - position.entryPrice) / position.entryPrice) * position.size;
        } else {
            pnl = ((position.entryPrice - currentPrice) / position.entryPrice) * position.size;
        }

        // Apply leverage to PnL
        pnl = pnl * position.leverage;

        // Deduct closing fee
        const closeFee = position.size * this.settings.fees;
        pnl -= closeFee;

        // Return margin + PnL to balance
        this.account.balance += position.margin + pnl;
        this.account.pnl += pnl;
        this.account.totalTrades++;

        if (pnl > 0) {
            this.account.wins++;
        } else {
            this.account.losses++;
        }

        this.account.winRate = (this.account.wins / this.account.totalTrades * 100).toFixed(1);

        // Remove position
        this.account.positions.splice(posIndex, 1);

        // Add to history
        this.account.history.unshift({
            type: 'close',
            ...position,
            closePrice: currentPrice,
            pnl,
            time: new Date().toLocaleTimeString()
        });

        this.saveState();
        this.updatePanel();

        const pnlStr = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
        this.showNotification(
            `📊 Fermé ${position.coin}: ${pnlStr}`,
            pnl >= 0 ? 'success' : 'error'
        );

        console.log(`🎮 [DEMO] Closed ${position.coin}: ${pnlStr}`);

        return { position, pnl, currentPrice };
    },

    /**
     * Update positions with live prices
     */
    startPositionUpdater() {
        setInterval(async () => {
            if (this.account.positions.length === 0) return;

            for (const pos of this.account.positions) {
                try {
                    // Get live price from multiple sources
                    let price;

                    // RealtimePrices first
                    if (typeof RealtimePrices !== 'undefined' && RealtimePrices.getPrice) {
                        price = RealtimePrices.getPrice(pos.coin);
                    }

                    // Try local backend
                    if (!price) {
                        try {
                            const res = await fetch(`http://localhost:3001/api/ticker/${pos.coin}`);
                            const data = await res.json();
                            price = data.price;
                        } catch (e) {}
                    }

                    // Simulate price movement for demo
                    if (!price) {
                        // Add small random movement to entry price
                        const movement = (Math.random() - 0.5) * 0.002; // ±0.1%
                        price = pos.entryPrice * (1 + movement);
                    }

                    if (price) {
                        pos.currentPrice = price;

                        // Calculate unrealized PnL
                        if (pos.side === 'long') {
                            pos.pnl = ((price - pos.entryPrice) / pos.entryPrice) * pos.size * pos.leverage;
                        } else {
                            pos.pnl = ((pos.entryPrice - price) / pos.entryPrice) * pos.size * pos.leverage;
                        }

                        pos.pnlPercent = (pos.pnl / pos.margin * 100).toFixed(2);
                    }
                } catch (e) {
                    // Silent fail
                }
            }

            this.updatePanel();
            this.saveState();
        }, 1000);
    },

    // Panel state
    panelCollapsed: false,

    /**
     * Create demo trading panel UI
     */
    createDemoPanel() {
        // Load collapsed state
        this.panelCollapsed = localStorage.getItem('obelisk_demo_collapsed') === 'true';

        const panel = document.createElement('div');
        panel.id = 'demo-trading-panel';
        panel.innerHTML = `
            <style>
                #demo-trading-panel {
                    position: fixed;
                    top: 280px;
                    left: 20px;
                    width: 300px;
                    background: linear-gradient(135deg, #0a0a1a 0%, #1a1040 100%);
                    border: 2px solid #ffaa00;
                    border-radius: 12px;
                    padding: 16px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    z-index: 1001;
                    box-shadow: 0 8px 32px rgba(255, 170, 0, 0.3);
                    transition: all 0.3s ease;
                    cursor: default;
                }
                #demo-trading-panel.collapsed {
                    width: auto;
                    padding: 8px 12px;
                }
                #demo-trading-panel.collapsed .demo-content {
                    display: none;
                }
                #demo-trading-panel.collapsed .demo-header {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }
                .demo-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #4a2c8a;
                    cursor: move;
                }
                .demo-toggle-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid #ffaa00;
                    color: #ffaa00;
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 8px;
                    transition: all 0.2s;
                }
                .demo-toggle-btn:hover {
                    background: #ffaa00;
                    color: #000;
                }
                .demo-header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .demo-header-right {
                    display: flex;
                    align-items: center;
                }
                .demo-badge {
                    background: linear-gradient(135deg, #ffaa00, #ff6600);
                    color: #000;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-weight: bold;
                    font-size: 10px;
                }
                .demo-balance {
                    font-size: 20px;
                    font-weight: bold;
                    color: #fff;
                    margin: 8px 0;
                }
                .demo-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin: 12px 0;
                }
                .demo-stat {
                    background: rgba(0,0,0,0.3);
                    padding: 8px;
                    border-radius: 6px;
                }
                .demo-stat-label {
                    color: #888;
                    font-size: 9px;
                }
                .demo-stat-value {
                    color: #fff;
                    font-size: 13px;
                    font-weight: bold;
                }
                .demo-positions {
                    max-height: 150px;
                    overflow-y: auto;
                    margin-top: 12px;
                }
                .demo-position {
                    background: rgba(0,0,0,0.3);
                    padding: 8px;
                    border-radius: 6px;
                    margin-bottom: 6px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .pos-info {
                    display: flex;
                    flex-direction: column;
                }
                .pos-coin {
                    font-weight: bold;
                    color: #fff;
                }
                .pos-details {
                    color: #888;
                    font-size: 9px;
                }
                .pos-pnl {
                    font-weight: bold;
                }
                .pos-pnl.positive { color: #00ff88; }
                .pos-pnl.negative { color: #ff4444; }
                .demo-btn {
                    background: linear-gradient(135deg, #00aaff, #8a2be2);
                    border: none;
                    color: #fff;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 10px;
                    margin-top: 4px;
                }
                .demo-btn:hover {
                    opacity: 0.9;
                }
                .demo-btn.close {
                    background: #ff4444;
                    padding: 4px 8px;
                    font-size: 9px;
                }
                .demo-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }
                .demo-btn.long { background: #00ff88; color: #000; }
                .demo-btn.short { background: #ff4444; }
                .demo-quick-trade {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #4a2c8a;
                }
            </style>

            <div class="demo-header" id="demo-header">
                <div class="demo-header-left">
                    <span class="demo-badge">🎮 DEMO</span>
                    <span id="demo-mini-balance" style="color:#fff;font-weight:bold;display:none;">$10,000</span>
                </div>
                <div class="demo-header-right">
                    <button class="demo-btn" onclick="DemoTrading.resetAccount()">Reset</button>
                    <button class="demo-toggle-btn" id="demo-toggle-btn" onclick="DemoTrading.togglePanel()" title="Réduire/Agrandir">−</button>
                </div>
            </div>

            <div class="demo-content">
            <div class="demo-balance" id="demo-balance">$10,000.00</div>

            <div class="demo-stats">
                <div class="demo-stat">
                    <div class="demo-stat-label">PnL Total</div>
                    <div class="demo-stat-value" id="demo-pnl">$0.00</div>
                </div>
                <div class="demo-stat">
                    <div class="demo-stat-label">Win Rate</div>
                    <div class="demo-stat-value" id="demo-winrate">0%</div>
                </div>
                <div class="demo-stat">
                    <div class="demo-stat-label">Trades</div>
                    <div class="demo-stat-value" id="demo-trades">0</div>
                </div>
                <div class="demo-stat">
                    <div class="demo-stat-label">Positions</div>
                    <div class="demo-stat-value" id="demo-pos-count">0</div>
                </div>
            </div>

            <div class="demo-positions" id="demo-positions">
                <div style="color: #888; text-align: center; padding: 20px;">
                    Aucune position ouverte
                </div>
            </div>

            <div class="demo-quick-trade">
                <button class="demo-btn long" onclick="DemoTrading.quickTrade('long')">⬆️ LONG BTC</button>
                <button class="demo-btn short" onclick="DemoTrading.quickTrade('short')">⬇️ SHORT BTC</button>
            </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Apply collapsed state
        if (this.panelCollapsed) {
            panel.classList.add('collapsed');
            document.getElementById('demo-toggle-btn').textContent = '+';
            document.getElementById('demo-mini-balance').style.display = 'inline';
        }

        // Make panel draggable
        this.makeDraggable(panel);

        this.updatePanel();
    },

    /**
     * Toggle panel collapsed state
     */
    togglePanel() {
        const panel = document.getElementById('demo-trading-panel');
        const btn = document.getElementById('demo-toggle-btn');
        const miniBalance = document.getElementById('demo-mini-balance');

        this.panelCollapsed = !this.panelCollapsed;

        if (this.panelCollapsed) {
            panel.classList.add('collapsed');
            btn.textContent = '+';
            miniBalance.style.display = 'inline';
            miniBalance.textContent = '$' + this.account.balance.toFixed(0);
        } else {
            panel.classList.remove('collapsed');
            btn.textContent = '−';
            miniBalance.style.display = 'none';
        }

        localStorage.setItem('obelisk_demo_collapsed', this.panelCollapsed);
    },

    /**
     * Make panel draggable
     */
    makeDraggable(panel) {
        const header = document.getElementById('demo-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = panel.offsetLeft;
            startTop = panel.offsetTop;
            panel.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            panel.style.left = (startLeft + dx) + 'px';
            panel.style.top = (startTop + dy) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                panel.style.transition = 'all 0.3s ease';
            }
        });
    },

    /**
     * Quick trade button
     */
    async quickTrade(side) {
        await this.placeOrder('BTC/USDC', side, 100, 5);
    },

    /**
     * Update panel UI
     */
    updatePanel() {
        const balanceEl = document.getElementById('demo-balance');
        const pnlEl = document.getElementById('demo-pnl');
        const winrateEl = document.getElementById('demo-winrate');
        const tradesEl = document.getElementById('demo-trades');
        const posCountEl = document.getElementById('demo-pos-count');
        const positionsEl = document.getElementById('demo-positions');

        if (balanceEl) {
            balanceEl.textContent = `$${this.account.balance.toFixed(2)}`;
            balanceEl.style.color = this.account.balance >= this.account.initialBalance ? '#00ff88' : '#ff4444';
        }

        // Update mini balance when collapsed
        const miniBalance = document.getElementById('demo-mini-balance');
        if (miniBalance && this.panelCollapsed) {
            miniBalance.textContent = '$' + this.account.balance.toFixed(0);
            miniBalance.style.color = this.account.balance >= this.account.initialBalance ? '#00ff88' : '#ff4444';
        }

        if (pnlEl) {
            const pnl = this.account.pnl;
            pnlEl.textContent = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
            pnlEl.style.color = pnl >= 0 ? '#00ff88' : '#ff4444';
        }

        if (winrateEl) winrateEl.textContent = `${this.account.winRate}%`;
        if (tradesEl) tradesEl.textContent = this.account.totalTrades;
        if (posCountEl) posCountEl.textContent = this.account.positions.length;

        if (positionsEl) {
            if (this.account.positions.length === 0) {
                positionsEl.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">Aucune position ouverte</div>';
            } else {
                positionsEl.innerHTML = this.account.positions.map(pos => {
                    const pnlClass = pos.pnl >= 0 ? 'positive' : 'negative';
                    const pnlStr = pos.pnl >= 0 ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`;
                    const arrow = pos.side === 'long' ? '⬆️' : '⬇️';

                    return `
                        <div class="demo-position">
                            <div class="pos-info">
                                <span class="pos-coin">${arrow} ${pos.coin}</span>
                                <span class="pos-details">$${pos.size} @ ${pos.leverage}x | Entry: $${pos.entryPrice.toFixed(2)}</span>
                            </div>
                            <div>
                                <div class="pos-pnl ${pnlClass}">${pnlStr}</div>
                                <button class="demo-btn close" onclick="DemoTrading.closePosition('${pos.id}')">Fermer</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        let notif = document.getElementById('demo-notification');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'demo-notification';
            notif.style.cssText = `
                position: fixed;
                top: 60px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                z-index: 10001;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(notif);
        }

        notif.textContent = message;
        notif.style.background = type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#00aaff';
        notif.style.color = type === 'success' ? '#000' : '#fff';
        notif.style.opacity = '1';

        setTimeout(() => {
            notif.style.opacity = '0';
        }, 3000);
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DemoTrading.init());
} else {
    DemoTrading.init();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DemoTrading;
}
