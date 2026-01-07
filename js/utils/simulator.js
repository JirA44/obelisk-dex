/**
 * Obelisk DEX - User Activity Simulator
 * Simulates realistic trading activity for demo purposes
 */

const DemoSimulator = {
    // Simulation state
    isRunning: false,
    intervals: [],

    // Demo users
    demoUsers: [
        { name: 'whale_trader', avatar: '🐋', style: 'aggressive' },
        { name: 'hodler_42', avatar: '💎', style: 'conservative' },
        { name: 'degen_ape', avatar: '🦍', style: 'degen' },
        { name: 'smart_money', avatar: '🧠', style: 'smart' },
        { name: 'bot_9000', avatar: '🤖', style: 'bot' },
        { name: 'newbie_trader', avatar: '🐣', style: 'random' }
    ],

    // Simulated positions
    positions: [],
    orders: [],
    tradeHistory: [],

    /**
     * Start the simulation
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        console.log('🎮 Demo Simulator Started');
        this.showNotification('Mode Démo activé - Activité simulée', 'info');

        // Add demo indicator
        this.addDemoIndicator();

        // Start all simulations
        this.startTradeSimulation();
        this.startOrderbookActivity();
        this.startPositionSimulation();
        this.startNotificationSimulation();
        this.startPriceFluctuation();
        this.startUIInteractions();
    },

    /**
     * Stop the simulation
     */
    stop() {
        this.isRunning = false;
        this.intervals.forEach(id => clearInterval(id));
        this.intervals = [];

        // Remove demo indicator
        const indicator = document.getElementById('demo-indicator');
        if (indicator) indicator.remove();

        console.log('🎮 Demo Simulator Stopped');
        this.showNotification('Mode Démo désactivé', 'info');
    },

    /**
     * Toggle simulation
     */
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    },

    /**
     * Add demo mode indicator
     */
    addDemoIndicator() {
        if (document.getElementById('demo-indicator')) return;

        const indicator = document.createElement('div');
        indicator.id = 'demo-indicator';
        indicator.innerHTML = `
            <span class="demo-dot"></span>
            <span>MODE DÉMO</span>
            <button onclick="DemoSimulator.stop()" title="Arrêter">✕</button>
        `;
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff6b35, #f7931a);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 9000;
            box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
            animation: pulse 2s infinite;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4); }
                50% { box-shadow: 0 4px 30px rgba(255, 107, 53, 0.6); }
            }
            .demo-dot {
                width: 8px;
                height: 8px;
                background: #00ff88;
                border-radius: 50%;
                animation: blink 1s infinite;
            }
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
            #demo-indicator button {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 10px;
            }
            #demo-indicator button:hover {
                background: rgba(255,255,255,0.4);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(indicator);
    },

    /**
     * Simulate trades appearing in real-time
     */
    startTradeSimulation() {
        const simulate = () => {
            if (!this.isRunning) return;

            const user = this.randomUser();
            const pair = this.randomPair();
            const side = Math.random() > 0.5 ? 'long' : 'short';
            const size = this.randomSize(user.style);
            const price = this.getCurrentPrice(pair);
            const leverage = this.randomLeverage(user.style);

            const trade = {
                id: Date.now(),
                user,
                pair,
                side,
                size,
                price,
                leverage,
                timestamp: new Date()
            };

            this.tradeHistory.unshift(trade);
            if (this.tradeHistory.length > 50) this.tradeHistory.pop();

            // Show trade in UI
            this.showTradePopup(trade);
            this.updateRecentTrades();
        };

        // Random interval between 2-8 seconds
        const scheduleNext = () => {
            if (!this.isRunning) return;
            const delay = 2000 + Math.random() * 6000;
            const id = setTimeout(() => {
                simulate();
                scheduleNext();
            }, delay);
            this.intervals.push(id);
        };

        scheduleNext();
    },

    /**
     * Simulate orderbook activity
     */
    startOrderbookActivity() {
        const id = setInterval(() => {
            if (!this.isRunning) return;

            // Add random orders to orderbook
            const asksContainer = document.getElementById('orderbook-asks');
            const bidsContainer = document.getElementById('orderbook-bids');

            if (asksContainer && bidsContainer) {
                // Flash random rows
                const rows = document.querySelectorAll('.ob-row');
                if (rows.length > 0) {
                    const randomRow = rows[Math.floor(Math.random() * rows.length)];
                    randomRow.style.background = 'rgba(0, 240, 255, 0.1)';
                    setTimeout(() => {
                        randomRow.style.background = '';
                    }, 300);
                }
            }
        }, 500);

        this.intervals.push(id);
    },

    /**
     * Simulate positions opening/closing
     */
    startPositionSimulation() {
        const id = setInterval(() => {
            if (!this.isRunning) return;

            // Randomly open or close positions
            if (Math.random() > 0.7) {
                if (this.positions.length < 5 && Math.random() > 0.4) {
                    // Open new position
                    const pos = this.createRandomPosition();
                    this.positions.push(pos);
                    this.updatePositionsDisplay();
                    this.showNotification(`Position ouverte: ${pos.side.toUpperCase()} ${pos.pair}`, 'success');
                } else if (this.positions.length > 0) {
                    // Close random position
                    const idx = Math.floor(Math.random() * this.positions.length);
                    const closed = this.positions.splice(idx, 1)[0];
                    const pnl = (Math.random() - 0.4) * closed.size * 0.1;
                    this.updatePositionsDisplay();
                    this.showNotification(
                        `Position fermée: ${closed.pair} | PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
                        pnl >= 0 ? 'success' : 'error'
                    );
                }
            }
        }, 8000);

        this.intervals.push(id);
    },

    /**
     * Simulate notifications from other traders
     */
    startNotificationSimulation() {
        const messages = [
            { text: '🐋 Whale Alert: 500 BTC moved to exchange', type: 'warning' },
            { text: '📈 BTC breaks $98,000 resistance!', type: 'success' },
            { text: '🔥 ETH Gas fees at 3-month low', type: 'info' },
            { text: '⚡ New ATH for SOL: $245.50', type: 'success' },
            { text: '📊 Liquidation cascade: $45M in 1 hour', type: 'warning' },
            { text: '🎯 Smart money accumulating ARB', type: 'info' },
            { text: '💰 Funding rate positive: shorts paying longs', type: 'info' },
            { text: '🚀 Volume spike detected on DOGE', type: 'warning' }
        ];

        const id = setInterval(() => {
            if (!this.isRunning) return;

            if (Math.random() > 0.6) {
                const msg = messages[Math.floor(Math.random() * messages.length)];
                this.showNotification(msg.text, msg.type);
            }
        }, 15000);

        this.intervals.push(id);
    },

    /**
     * Simulate price fluctuations
     */
    startPriceFluctuation() {
        const id = setInterval(() => {
            if (!this.isRunning) return;

            const priceEl = document.getElementById('current-price');
            const changeEl = document.getElementById('price-change');

            if (priceEl) {
                const currentText = priceEl.textContent.replace(/[$,]/g, '');
                const current = parseFloat(currentText) || 97234.50;
                const change = (Math.random() - 0.48) * 50; // Slight upward bias
                const newPrice = current + change;

                priceEl.textContent = '$' + newPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
                priceEl.className = `pair-price ${change >= 0 ? 'positive' : 'negative'}`;

                // Flash effect
                priceEl.style.textShadow = change >= 0 ? '0 0 10px #00ff88' : '0 0 10px #ff4757';
                setTimeout(() => { priceEl.style.textShadow = ''; }, 200);
            }

            if (changeEl) {
                const currentChange = parseFloat(changeEl.textContent) || 2.34;
                const delta = (Math.random() - 0.48) * 0.1;
                const newChange = currentChange + delta;
                changeEl.textContent = `${newChange >= 0 ? '+' : ''}${newChange.toFixed(2)}%`;
                changeEl.className = `pair-change ${newChange >= 0 ? 'positive' : 'negative'}`;
            }
        }, 1000);

        this.intervals.push(id);
    },

    /**
     * Simulate UI interactions (clicks, hovers)
     */
    startUIInteractions() {
        const actions = [
            () => this.simulateTabSwitch(),
            () => this.simulateLeverageChange(),
            () => this.simulateOrderTypeChange(),
            () => this.simulateInputTyping(),
            () => this.simulateSideSwitch()
        ];

        const id = setInterval(() => {
            if (!this.isRunning) return;

            if (Math.random() > 0.5) {
                const action = actions[Math.floor(Math.random() * actions.length)];
                action();
            }
        }, 5000);

        this.intervals.push(id);
    },

    /**
     * Simulate tab switching
     */
    simulateTabSwitch() {
        const tabs = ['trade', 'swap', 'portfolio'];
        const randomTab = tabs[Math.floor(Math.random() * tabs.length)];

        const tabBtn = document.querySelector(`[data-tab="${randomTab}"]`);
        if (tabBtn) {
            this.highlightElement(tabBtn);
            // Don't actually switch to avoid disrupting user
        }
    },

    /**
     * Simulate leverage change
     */
    simulateLeverageChange() {
        const slider = document.getElementById('leverage-slider');
        const valueEl = document.getElementById('leverage-value');

        if (slider && valueEl) {
            const levers = [1, 5, 10, 20, 25, 50];
            const newLev = levers[Math.floor(Math.random() * levers.length)];

            // Animate slider
            const startVal = parseInt(slider.value);
            const steps = 10;
            let step = 0;

            const animate = setInterval(() => {
                step++;
                const progress = step / steps;
                const currentVal = Math.round(startVal + (newLev - startVal) * progress);
                slider.value = currentVal;
                valueEl.textContent = currentVal + 'x';

                if (step >= steps) {
                    clearInterval(animate);
                }
            }, 30);

            this.highlightElement(slider.parentElement);
        }
    },

    /**
     * Simulate order type change
     */
    simulateOrderTypeChange() {
        const types = ['Market', 'Limit', 'Stop'];
        const randomType = types[Math.floor(Math.random() * types.length)];

        document.querySelectorAll('.type-btn').forEach(btn => {
            if (btn.textContent === randomType) {
                this.highlightElement(btn);
            }
        });
    },

    /**
     * Simulate input typing
     */
    simulateInputTyping() {
        const orderSize = document.getElementById('order-size');
        if (orderSize) {
            const sizes = [100, 250, 500, 1000, 2500, 5000, 10000];
            const targetSize = sizes[Math.floor(Math.random() * sizes.length)];

            orderSize.value = '';
            let typed = '';
            const digits = targetSize.toString().split('');

            digits.forEach((digit, i) => {
                setTimeout(() => {
                    typed += digit;
                    orderSize.value = typed;
                    this.highlightElement(orderSize);
                }, i * 100);
            });
        }
    },

    /**
     * Simulate side switch (Long/Short)
     */
    simulateSideSwitch() {
        const sides = document.querySelectorAll('.order-tab');
        if (sides.length > 0) {
            const randomSide = sides[Math.floor(Math.random() * sides.length)];
            this.highlightElement(randomSide);
        }
    },

    /**
     * Highlight element with animation
     */
    highlightElement(el) {
        if (!el) return;

        el.style.transition = 'all 0.3s ease';
        el.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.6)';
        el.style.transform = 'scale(1.02)';

        setTimeout(() => {
            el.style.boxShadow = '';
            el.style.transform = '';
        }, 500);
    },

    /**
     * Show trade popup
     */
    showTradePopup(trade) {
        const popup = document.createElement('div');
        popup.className = 'trade-popup';
        popup.innerHTML = `
            <span class="trade-user">${trade.user.avatar} ${trade.user.name}</span>
            <span class="trade-action ${trade.side}">${trade.side.toUpperCase()}</span>
            <span class="trade-details">${trade.pair} | $${trade.size.toLocaleString()} @ ${trade.leverage}x</span>
        `;

        popup.style.cssText = `
            position: fixed;
            bottom: ${80 + Math.random() * 100}px;
            right: 20px;
            background: var(--bg-card, #1a1a2e);
            border: 1px solid ${trade.side === 'long' ? '#00ff88' : '#ff4757'};
            border-radius: 12px;
            padding: 12px 16px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            z-index: 1000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 3s forwards;
            font-size: 13px;
        `;

        // Add animation styles if not exists
        if (!document.getElementById('trade-popup-styles')) {
            const style = document.createElement('style');
            style.id = 'trade-popup-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    to { opacity: 0; transform: translateX(20px); }
                }
                .trade-popup .trade-user { color: #888; font-size: 11px; }
                .trade-popup .trade-action { font-weight: 700; }
                .trade-popup .trade-action.long { color: #00ff88; }
                .trade-popup .trade-action.short { color: #ff4757; }
                .trade-popup .trade-details { color: #ccc; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 3500);
    },

    /**
     * Update recent trades display
     */
    updateRecentTrades() {
        // Update trade counter if exists
        const historyTab = document.querySelector('.pos-tab:nth-child(3)');
        if (historyTab) {
            historyTab.textContent = `History (${this.tradeHistory.length})`;
        }
    },

    /**
     * Update positions display
     */
    updatePositionsDisplay() {
        const posTab = document.querySelector('.pos-tab:first-child');
        if (posTab) {
            posTab.textContent = `Positions (${this.positions.length})`;
        }

        const container = document.querySelector('.positions-table');
        if (container && this.positions.length > 0) {
            container.innerHTML = this.positions.map(pos => `
                <div class="position-row" style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span class="${pos.side === 'long' ? 'positive' : 'negative'}">${pos.side.toUpperCase()} ${pos.pair}</span>
                    <span>$${pos.size.toLocaleString()}</span>
                    <span>${pos.leverage}x</span>
                    <span class="${pos.pnl >= 0 ? 'positive' : 'negative'}">${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toFixed(2)}</span>
                </div>
            `).join('');
        } else if (container) {
            container.innerHTML = '<div class="positions-empty"><span>No open positions</span></div>';
        }
    },

    /**
     * Create random position
     */
    createRandomPosition() {
        const pairs = ['BTC', 'ETH', 'SOL', 'ARB', 'DOGE'];
        return {
            id: Date.now(),
            pair: pairs[Math.floor(Math.random() * pairs.length)],
            side: Math.random() > 0.5 ? 'long' : 'short',
            size: [500, 1000, 2500, 5000, 10000][Math.floor(Math.random() * 5)],
            leverage: [5, 10, 20, 25][Math.floor(Math.random() * 4)],
            entryPrice: 97000 + Math.random() * 1000,
            pnl: (Math.random() - 0.4) * 500
        };
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (window.ObeliskApp?.showNotification) {
            window.ObeliskApp.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    },

    // Helper methods
    randomUser() {
        return this.demoUsers[Math.floor(Math.random() * this.demoUsers.length)];
    },

    randomPair() {
        const pairs = ['BTC', 'ETH', 'SOL', 'ARB', 'DOGE', 'AVAX', 'MATIC'];
        return pairs[Math.floor(Math.random() * pairs.length)];
    },

    randomSize(style) {
        const ranges = {
            aggressive: [5000, 50000],
            conservative: [500, 2000],
            degen: [10000, 100000],
            smart: [2000, 10000],
            bot: [100, 1000],
            random: [500, 5000]
        };
        const [min, max] = ranges[style] || ranges.random;
        return Math.floor(min + Math.random() * (max - min));
    },

    randomLeverage(style) {
        const ranges = {
            aggressive: [10, 50],
            conservative: [1, 5],
            degen: [25, 100],
            smart: [5, 15],
            bot: [1, 10],
            random: [1, 25]
        };
        const [min, max] = ranges[style] || ranges.random;
        return Math.floor(min + Math.random() * (max - min));
    },

    getCurrentPrice(pair) {
        const basePrices = {
            BTC: 97234,
            ETH: 3456,
            SOL: 178,
            ARB: 1.23,
            DOGE: 0.38,
            AVAX: 42,
            MATIC: 0.89
        };
        const base = basePrices[pair] || 100;
        return base * (0.99 + Math.random() * 0.02);
    }
};

// Keyboard shortcut to toggle demo mode
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+D to toggle demo
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        DemoSimulator.toggle();
    }
});

// Export
window.DemoSimulator = DemoSimulator;

console.log('💡 Demo Simulator loaded. Press Ctrl+Shift+D or call DemoSimulator.start() to activate.');

