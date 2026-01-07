/**
 * OBELISK DEX - Real Trading UI
 * Integrates with RealTrading for actual Hyperliquid orders
 */

const TradingUIReal = {
    currentPair: 'BTC',
    currentSide: 'long',
    currentOrderType: 'limit',
    leverage: 1,

    init() {
        console.log('[TradingUI] Initializing real trading UI...');

        // Listen for wallet connection
        window.addEventListener('wallet-connected', () => this.onWalletConnected());
        window.addEventListener('hl-data-loaded', (e) => this.updateBalances(e.detail));
        window.addEventListener('prices-update', (e) => this.updatePrices(e.detail));

        // Setup form handlers
        this.setupOrderForm();
        this.setupPairSelector();

        // Check initial connection
        if (WalletConnect && WalletConnect.connected) {
            this.onWalletConnected();
        }
    },

    onWalletConnected() {
        console.log('[TradingUI] Wallet connected, loading Hyperliquid data...');

        // Show real balance section
        const realBalanceSection = document.getElementById('real-balance-section');
        if (realBalanceSection) {
            realBalanceSection.style.display = 'block';
        }

        // Load Hyperliquid data
        if (window.RealTrading) {
            RealTrading.loadHyperliquidData();
            RealTrading.subscribeToUpdates();
        }

        // Update UI
        this.showRealTradingMode();
    },

    showRealTradingMode() {
        // Add real trading indicator
        const indicator = document.createElement('div');
        indicator.id = 'real-trading-indicator';
        indicator.innerHTML = `
            <style>
                #real-trading-indicator {
                    position: fixed;
                    top: 70px;
                    right: 20px;
                    background: linear-gradient(135deg, #00ff88 0%, #00aa55 100%);
                    color: #000;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 12px;
                    z-index: 9998;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
                }
                #real-trading-indicator .dot {
                    width: 8px;
                    height: 8px;
                    background: #000;
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
            </style>
            <span class="dot"></span>
            <span>REAL TRADING - HYPERLIQUID</span>
        `;

        // Remove demo indicator if exists
        const demoIndicator = document.getElementById('demo-indicator');
        if (demoIndicator) demoIndicator.remove();

        // Add real indicator
        if (!document.getElementById('real-trading-indicator')) {
            document.body.appendChild(indicator);
        }
    },

    updateBalances(data) {
        if (!data || !data.balance) return;

        // Update equity
        const equityEl = document.getElementById('account-equity');
        if (equityEl) {
            equityEl.textContent = '$' + data.balance.equity.toLocaleString('en-US', { minimumFractionDigits: 2 });
        }

        // Update available margin
        const availableEl = document.getElementById('available-margin');
        if (availableEl) {
            availableEl.textContent = '$' + data.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 });
        }

        // Update positions
        this.updatePositions(data.positions);
    },

    updatePositions(positions) {
        const container = document.getElementById('positions-list');
        if (!container) return;

        if (!positions || positions.length === 0) {
            container.innerHTML = '<div class="no-positions">No open positions</div>';
            return;
        }

        container.innerHTML = positions.map(pos => `
            <div class="position-row ${pos.size > 0 ? 'long' : 'short'}">
                <div class="position-info">
                    <span class="position-coin">${pos.coin}</span>
                    <span class="position-side">${pos.size > 0 ? 'LONG' : 'SHORT'}</span>
                    <span class="position-size">${Math.abs(pos.size).toFixed(4)}</span>
                </div>
                <div class="position-pnl ${pos.unrealizedPnl >= 0 ? 'positive' : 'negative'}">
                    ${pos.unrealizedPnl >= 0 ? '+' : ''}$${pos.unrealizedPnl.toFixed(2)}
                </div>
                <button class="btn-close-position" onclick="TradingUIReal.closePosition('${pos.coin}')">
                    Close
                </button>
            </div>
        `).join('');
    },

    updatePrices(prices) {
        // Update current pair price
        const priceEl = document.getElementById('current-price');
        if (priceEl && prices[this.currentPair]) {
            const price = parseFloat(prices[this.currentPair]);
            priceEl.textContent = '$' + price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: price > 100 ? 2 : 4
            });
        }
    },

    setupOrderForm() {
        const form = document.getElementById('order-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitOrder();
        });

        // Side buttons
        document.querySelectorAll('[data-side]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentSide = btn.dataset.side;
                document.querySelectorAll('[data-side]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Order type buttons
        document.querySelectorAll('[data-order-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentOrderType = btn.dataset.orderType;
                document.querySelectorAll('[data-order-type]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show/hide limit price input
                const limitPriceGroup = document.getElementById('limit-price-group');
                if (limitPriceGroup) {
                    limitPriceGroup.style.display = this.currentOrderType === 'limit' ? 'block' : 'none';
                }
            });
        });

        // Leverage slider
        const leverageSlider = document.getElementById('leverage-slider');
        if (leverageSlider) {
            leverageSlider.addEventListener('input', (e) => {
                this.leverage = parseInt(e.target.value);
                const leverageDisplay = document.getElementById('leverage-display');
                if (leverageDisplay) {
                    leverageDisplay.textContent = this.leverage + 'x';
                }
            });
        }
    },

    setupPairSelector() {
        document.querySelectorAll('[data-pair]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPair = btn.dataset.pair;
                document.querySelectorAll('[data-pair]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update price display
                const pairDisplay = document.getElementById('current-pair-display');
                if (pairDisplay) {
                    pairDisplay.textContent = this.currentPair + '-PERP';
                }
            });
        });
    },

    async submitOrder() {
        if (!window.RealTrading || !RealTrading.connected) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }

        const sizeInput = document.getElementById('order-size');
        const priceInput = document.getElementById('order-price');

        if (!sizeInput || !sizeInput.value) {
            this.showNotification('Please enter order size', 'error');
            return;
        }

        const size = parseFloat(sizeInput.value);
        let price;

        if (this.currentOrderType === 'limit') {
            if (!priceInput || !priceInput.value) {
                this.showNotification('Please enter limit price', 'error');
                return;
            }
            price = parseFloat(priceInput.value);
        } else {
            // Market order - use current price with slippage
            const prices = await RealTrading.getPrices();
            const currentPrice = parseFloat(prices[this.currentPair]);
            price = this.currentSide === 'long'
                ? currentPrice * 1.005  // 0.5% slippage for buy
                : currentPrice * 0.995; // 0.5% slippage for sell
        }

        // Show confirmation modal
        const confirmed = await this.showConfirmation({
            pair: this.currentPair,
            side: this.currentSide,
            size,
            price,
            leverage: this.leverage,
            orderType: this.currentOrderType
        });

        if (!confirmed) return;

        // Submit order
        try {
            this.showNotification('Signing order...', 'info');

            const result = await RealTrading.placeOrder({
                coin: this.currentPair,
                isBuy: this.currentSide === 'long',
                size: size,
                price: price,
                orderType: this.currentOrderType
            });

            if (result.status === 'ok') {
                this.showNotification('Order placed successfully!', 'success');
                sizeInput.value = '';
                if (priceInput) priceInput.value = '';
            } else {
                this.showNotification('Order failed: ' + (result.response || 'Unknown error'), 'error');
            }
        } catch (e) {
            console.error('[TradingUI] Order error:', e);
            this.showNotification('Order failed: ' + e.message, 'error');
        }
    },

    async closePosition(coin) {
        if (!window.RealTrading) return;

        const confirmed = confirm(`Close your ${coin} position?`);
        if (!confirmed) return;

        try {
            this.showNotification('Closing position...', 'info');
            const result = await RealTrading.closePosition(coin);

            if (result.status === 'ok') {
                this.showNotification('Position closed!', 'success');
            } else {
                this.showNotification('Failed to close: ' + result.response, 'error');
            }
        } catch (e) {
            this.showNotification('Error: ' + e.message, 'error');
        }
    },

    showConfirmation(order) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'order-confirm-modal';
            modal.innerHTML = `
                <style>
                    .order-confirm-modal {
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                    }
                    .order-confirm-content {
                        background: #12121a;
                        border: 1px solid #2a2a3a;
                        border-radius: 16px;
                        padding: 24px;
                        max-width: 400px;
                        width: 90%;
                    }
                    .order-confirm-title {
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 16px;
                        color: ${order.side === 'long' ? '#00ff88' : '#ff4466'};
                    }
                    .order-confirm-details {
                        background: #0a0a0f;
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 16px;
                    }
                    .order-confirm-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        font-size: 14px;
                    }
                    .order-confirm-row:last-child { margin-bottom: 0; }
                    .order-confirm-label { color: #888; }
                    .order-confirm-value { color: #fff; font-weight: 500; }
                    .order-confirm-warning {
                        background: rgba(255,170,0,0.1);
                        border: 1px solid rgba(255,170,0,0.3);
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 16px;
                        font-size: 12px;
                        color: #ffaa00;
                    }
                    .order-confirm-buttons {
                        display: flex;
                        gap: 12px;
                    }
                    .order-confirm-buttons button {
                        flex: 1;
                        padding: 12px;
                        border-radius: 8px;
                        border: none;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .btn-cancel {
                        background: #2a2a3a;
                        color: #fff;
                    }
                    .btn-confirm {
                        background: ${order.side === 'long' ? '#00ff88' : '#ff4466'};
                        color: #000;
                    }
                </style>
                <div class="order-confirm-content">
                    <div class="order-confirm-title">
                        Confirm ${order.side.toUpperCase()} Order
                    </div>
                    <div class="order-confirm-details">
                        <div class="order-confirm-row">
                            <span class="order-confirm-label">Pair</span>
                            <span class="order-confirm-value">${order.pair}-PERP</span>
                        </div>
                        <div class="order-confirm-row">
                            <span class="order-confirm-label">Side</span>
                            <span class="order-confirm-value" style="color:${order.side === 'long' ? '#00ff88' : '#ff4466'}">${order.side.toUpperCase()}</span>
                        </div>
                        <div class="order-confirm-row">
                            <span class="order-confirm-label">Size</span>
                            <span class="order-confirm-value">${order.size}</span>
                        </div>
                        <div class="order-confirm-row">
                            <span class="order-confirm-label">Price</span>
                            <span class="order-confirm-value">$${order.price.toFixed(2)}</span>
                        </div>
                        <div class="order-confirm-row">
                            <span class="order-confirm-label">Leverage</span>
                            <span class="order-confirm-value">${order.leverage}x</span>
                        </div>
                        <div class="order-confirm-row">
                            <span class="order-confirm-label">Type</span>
                            <span class="order-confirm-value">${order.orderType.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="order-confirm-warning">
                        ⚠️ This is a REAL order on Hyperliquid. You will be signing with your wallet. Make sure you understand the risks.
                    </div>
                    <div class="order-confirm-buttons">
                        <button class="btn-cancel" id="btn-order-cancel">Cancel</button>
                        <button class="btn-confirm" id="btn-order-confirm">Confirm & Sign</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('btn-order-cancel').onclick = () => {
                modal.remove();
                resolve(false);
            };

            document.getElementById('btn-order-confirm').onclick = () => {
                modal.remove();
                resolve(true);
            };

            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            };
        });
    },

    showNotification(message, type = 'info') {
        const colors = {
            info: '#00aaff',
            success: '#00ff88',
            error: '#ff4466',
            warning: '#ffaa00'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: ${colors[type]};
            color: ${type === 'warning' || type === 'success' ? '#000' : '#fff'};
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10001;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    TradingUIReal.init();
});

// Export
window.TradingUIReal = TradingUIReal;
