/**
 * OBELISK DEX - Real Trading Integration
 * Connects to Hyperliquid for actual trading
 *
 * Flow:
 * 1. User connects wallet (MetaMask/WalletConnect)
 * 2. User deposits USDC to Hyperliquid (Arbitrum)
 * 3. Trading via signed messages (EIP-712)
 */

const RealTrading = {
    // Hyperliquid API endpoints
    HL_API: 'https://api.hyperliquid.xyz',
    HL_WS: 'wss://api.hyperliquid.xyz/ws',

    // Arbitrum USDC for deposits
    ARBITRUM_USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    HYPERLIQUID_BRIDGE: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',

    // State
    connected: false,
    address: null,
    hlBalance: null,
    positions: [],
    orders: [],

    // WebSocket
    ws: null,
    subscriptions: new Set(),

    /**
     * Initialize real trading
     */
    async init() {
        console.log('[RealTrading] Initializing...');

        // Check if wallet is connected
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.address = accounts[0];
                await this.loadHyperliquidData();
            }
        }

        // Listen for wallet connection
        window.addEventListener('wallet-connected', async (e) => {
            this.address = e.detail.address;
            await this.loadHyperliquidData();
        });

        console.log('[RealTrading] Ready');
    },

    /**
     * Load user's Hyperliquid data
     */
    async loadHyperliquidData() {
        if (!this.address) return;

        try {
            // Get clearinghouse state (balances, positions)
            const state = await this.hlRequest('info', {
                type: 'clearinghouseState',
                user: this.address
            });

            if (state) {
                this.hlBalance = {
                    equity: parseFloat(state.marginSummary?.accountValue || 0),
                    available: parseFloat(state.withdrawable || 0),
                    margin: parseFloat(state.marginSummary?.totalMarginUsed || 0)
                };

                this.positions = (state.assetPositions || [])
                    .filter(p => parseFloat(p.position?.szi) !== 0)
                    .map(p => ({
                        coin: p.position.coin,
                        size: parseFloat(p.position.szi),
                        entryPrice: parseFloat(p.position.entryPx),
                        unrealizedPnl: parseFloat(p.position.unrealizedPnl),
                        leverage: parseFloat(p.position.leverage?.value || 1)
                    }));

                this.connected = true;
                this.updateUI();

                console.log('[RealTrading] Loaded:', {
                    balance: this.hlBalance,
                    positions: this.positions.length
                });
            }
        } catch (e) {
            console.error('[RealTrading] Failed to load data:', e);
        }
    },

    /**
     * Make Hyperliquid API request
     */
    async hlRequest(endpoint, body) {
        const url = `${this.HL_API}/${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return response.json();
    },

    /**
     * Get all markets
     */
    async getMarkets() {
        const meta = await this.hlRequest('info', { type: 'meta' });
        return meta.universe || [];
    },

    /**
     * Get current prices
     */
    async getPrices() {
        const mids = await this.hlRequest('info', { type: 'allMids' });
        return mids;
    },

    /**
     * Place a real order on Hyperliquid
     * Requires wallet signature
     */
    async placeOrder(params) {
        const { coin, isBuy, size, price, orderType = 'limit', reduceOnly = false } = params;

        if (!this.address) {
            throw new Error('Wallet not connected');
        }

        // Build order action
        const timestamp = Date.now();
        const order = {
            a: this.getCoinIndex(coin),
            b: isBuy,
            p: price.toString(),
            s: size.toString(),
            r: reduceOnly,
            t: orderType === 'limit' ? { limit: { tif: 'Gtc' } } : { trigger: { triggerPx: price.toString(), isMarket: true, tpsl: 'tp' } }
        };

        const action = {
            type: 'order',
            orders: [order],
            grouping: 'na'
        };

        // Create EIP-712 signature
        const signature = await this.signAction(action, timestamp);

        // Submit to Hyperliquid
        const result = await this.hlRequest('exchange', {
            action,
            nonce: timestamp,
            signature,
            vaultAddress: null
        });

        return result;
    },

    /**
     * Sign action with EIP-712
     */
    async signAction(action, timestamp) {
        const domain = {
            name: 'Exchange',
            version: '1',
            chainId: 1337, // Hyperliquid L1
            verifyingContract: '0x0000000000000000000000000000000000000000'
        };

        const types = {
            Agent: [
                { name: 'source', type: 'string' },
                { name: 'connectionId', type: 'bytes32' }
            ]
        };

        // For browser, use eth_signTypedData_v4
        const message = {
            source: 'a]',
            connectionId: this.hashAction(action, timestamp)
        };

        const msgParams = JSON.stringify({
            domain,
            message,
            primaryType: 'Agent',
            types
        });

        const signature = await window.ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [this.address, msgParams]
        });

        return { r: signature.slice(0, 66), s: '0x' + signature.slice(66, 130), v: parseInt(signature.slice(130, 132), 16) };
    },

    /**
     * Hash action for signing
     */
    hashAction(action, timestamp) {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(action) + timestamp);
        // Simple hash - in production use keccak256
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data[i];
            hash = hash & hash;
        }
        return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
    },

    /**
     * Get coin index for Hyperliquid
     */
    getCoinIndex(coin) {
        const coins = ['BTC', 'ETH', 'SOL', 'ARB', 'DOGE', 'INJ', 'SUI', 'SEI', 'OP', 'AVAX', 'APT', 'LINK'];
        return coins.indexOf(coin.replace('-PERP', '').replace('/USDC', ''));
    },

    /**
     * Cancel order
     */
    async cancelOrder(coin, orderId) {
        const timestamp = Date.now();
        const action = {
            type: 'cancel',
            cancels: [{ a: this.getCoinIndex(coin), o: orderId }]
        };

        const signature = await this.signAction(action, timestamp);

        return this.hlRequest('exchange', {
            action,
            nonce: timestamp,
            signature,
            vaultAddress: null
        });
    },

    /**
     * Close position
     */
    async closePosition(coin) {
        const position = this.positions.find(p => p.coin === coin);
        if (!position) throw new Error('Position not found');

        // Get current price
        const prices = await this.getPrices();
        const price = parseFloat(prices[coin]);

        // Place opposite order to close
        return this.placeOrder({
            coin,
            isBuy: position.size < 0, // If short, buy to close
            size: Math.abs(position.size),
            price: position.size > 0 ? price * 0.99 : price * 1.01, // Slight slippage
            orderType: 'limit',
            reduceOnly: true
        });
    },

    /**
     * Subscribe to WebSocket updates
     */
    subscribeToUpdates() {
        if (this.ws) return;

        this.ws = new WebSocket(this.HL_WS);

        this.ws.onopen = () => {
            console.log('[RealTrading] WebSocket connected');

            // Subscribe to user updates
            if (this.address) {
                this.ws.send(JSON.stringify({
                    method: 'subscribe',
                    subscription: { type: 'userEvents', user: this.address }
                }));
            }

            // Subscribe to all mids
            this.ws.send(JSON.stringify({
                method: 'subscribe',
                subscription: { type: 'allMids' }
            }));
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWsMessage(data);
        };

        this.ws.onclose = () => {
            console.log('[RealTrading] WebSocket disconnected');
            this.ws = null;
            // Reconnect after 5s
            setTimeout(() => this.subscribeToUpdates(), 5000);
        };
    },

    /**
     * Handle WebSocket message
     */
    handleWsMessage(data) {
        if (data.channel === 'allMids') {
            window.dispatchEvent(new CustomEvent('prices-update', { detail: data.data }));
        } else if (data.channel === 'userEvents') {
            this.loadHyperliquidData(); // Refresh state
            window.dispatchEvent(new CustomEvent('user-update', { detail: data.data }));
        }
    },

    /**
     * Update UI with real data
     */
    updateUI() {
        // Update balance display
        const balanceEl = document.getElementById('hl-balance');
        if (balanceEl && this.hlBalance) {
            balanceEl.textContent = '$' + this.hlBalance.equity.toFixed(2);
        }

        // Update available
        const availableEl = document.getElementById('hl-available');
        if (availableEl && this.hlBalance) {
            availableEl.textContent = '$' + this.hlBalance.available.toFixed(2);
        }

        // Update positions count
        const posCountEl = document.getElementById('positions-count');
        if (posCountEl) {
            posCountEl.textContent = this.positions.length;
        }

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('hl-data-loaded', {
            detail: {
                balance: this.hlBalance,
                positions: this.positions,
                connected: this.connected
            }
        }));
    },

    /**
     * Check if user has Hyperliquid account
     */
    async checkAccount() {
        if (!this.address) return { hasAccount: false };

        try {
            const state = await this.hlRequest('info', {
                type: 'clearinghouseState',
                user: this.address
            });

            return {
                hasAccount: true,
                balance: parseFloat(state.marginSummary?.accountValue || 0)
            };
        } catch (e) {
            return { hasAccount: false };
        }
    },

    /**
     * Get deposit instructions
     */
    getDepositInstructions() {
        return {
            network: 'Arbitrum One',
            token: 'USDC',
            address: this.HYPERLIQUID_BRIDGE,
            minDeposit: 10,
            steps: [
                '1. Switch to Arbitrum network in your wallet',
                '2. Ensure you have USDC on Arbitrum',
                '3. Go to app.hyperliquid.xyz and deposit',
                '4. Your funds will appear in Obelisk automatically'
            ]
        };
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    RealTrading.init();
});

// Export
window.RealTrading = RealTrading;
