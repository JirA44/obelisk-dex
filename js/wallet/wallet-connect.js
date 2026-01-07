// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - EXTERNAL WALLET CONNECTION
// MetaMask, WalletConnect, Coinbase Wallet, Rabby, etc.
// ═══════════════════════════════════════════════════════════════════════════════

const WalletConnect = {
    // Supported wallets
    wallets: [
        {
            id: 'metamask',
            name: 'MetaMask',
            icon: '🦊',
            color: '#f6851b',
            detect: () => typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
            deepLink: 'https://metamask.app.link/dapp/' + window.location.host
        },
        {
            id: 'coinbase',
            name: 'Coinbase Wallet',
            icon: '🔵',
            color: '#0052ff',
            detect: () => typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet,
            deepLink: 'https://go.cb-w.com/dapp?cb_url=' + encodeURIComponent(window.location.href)
        },
        {
            id: 'rabby',
            name: 'Rabby',
            icon: '🐰',
            color: '#8697ff',
            detect: () => typeof window.ethereum !== 'undefined' && window.ethereum.isRabby
        },
        {
            id: 'trust',
            name: 'Trust Wallet',
            icon: '🛡️',
            color: '#3375bb',
            detect: () => typeof window.ethereum !== 'undefined' && window.ethereum.isTrust
        },
        {
            id: 'walletconnect',
            name: 'WalletConnect',
            icon: '🔗',
            color: '#3b99fc',
            detect: () => true // Always available via QR
        }
    ],

    // State
    connected: false,
    address: null,
    chainId: null,
    balance: null,
    provider: null,

    // Supported chains
    chains: {
        1: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' },
        137: { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
        42161: { name: 'Arbitrum', symbol: 'ETH', explorer: 'https://arbiscan.io' },
        10: { name: 'Optimism', symbol: 'ETH', explorer: 'https://optimistic.etherscan.io' },
        8453: { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org' },
        56: { name: 'BNB Chain', symbol: 'BNB', explorer: 'https://bscscan.com' },
        43114: { name: 'Avalanche', symbol: 'AVAX', explorer: 'https://snowtrace.io' }
    },

    init() {
        // Check if already connected
        this.checkConnection();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.address = accounts[0];
                    this.updateUI();
                    this.getBalance();
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                this.chainId = parseInt(chainId, 16);
                this.updateUI();
                this.getBalance();
            });
        }

        console.log('[WalletConnect] Initialized');
    },

    // Check existing connection
    async checkConnection() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    this.address = accounts[0];
                    this.chainId = parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
                    this.connected = true;
                    this.provider = window.ethereum;

                    // Dispatch wallet-connected event for real trading
                    window.dispatchEvent(new CustomEvent('wallet-connected', {
                        detail: { address: this.address, chainId: this.chainId }
                    }));

                    await this.getBalance();
                    this.updateUI();
                }
            } catch (e) {
                console.log('[WalletConnect] No existing connection');
            }
        }
    },

    // Show wallet selection modal
    showModal() {
        let modal = document.getElementById('walletConnectModal');
        if (!modal) {
            this.createModal();
            modal = document.getElementById('walletConnectModal');
        }
        modal.style.display = 'flex';
        this.renderWalletList();
    },

    // Create modal
    createModal() {
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        const modalHTML = `
            <div id="walletConnectModal" class="modal" style="
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                z-index: 10000;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                    border: 1px solid #333;
                    border-radius: 20px;
                    width: 95%;
                    max-width: 420px;
                    overflow: hidden;
                ">
                    <!-- Header -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20px 24px;
                        border-bottom: 1px solid #333;
                    ">
                        <h2 style="color:#fff;margin:0;font-size:1.2rem;">
                            🔗 ${isFr ? 'Connecter un Wallet' : 'Connect Wallet'}
                        </h2>
                        <button onclick="WalletConnect.closeModal()" style="
                            background: none;
                            border: none;
                            color: #888;
                            font-size: 24px;
                            cursor: pointer;
                        ">&times;</button>
                    </div>

                    <!-- Wallet List -->
                    <div id="walletList" style="padding: 16px;"></div>

                    <!-- Footer -->
                    <div style="padding: 16px 24px; border-top: 1px solid #222; text-align: center;">
                        <p style="color:#666;font-size:0.8rem;margin:0;">
                            ${isFr ? 'En connectant, vous acceptez nos' : 'By connecting, you agree to our'}
                            <a href="#" style="color:#4a9eff;">Terms</a>
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // Render wallet options
    renderWalletList() {
        const list = document.getElementById('walletList');
        if (!list) return;

        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        list.innerHTML = this.wallets.map(wallet => {
            const isDetected = wallet.detect();
            const statusText = isDetected
                ? (isFr ? 'Détecté' : 'Detected')
                : (wallet.id === 'walletconnect' ? 'QR Code' : (isFr ? 'Non installé' : 'Not installed'));

            return `
                <button onclick="WalletConnect.connect('${wallet.id}')" style="
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px;
                    margin-bottom: 8px;
                    border-radius: 12px;
                    border: 1px solid #333;
                    background: #0a0a15;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='${wallet.color}';this.style.background='${wallet.color}15'"
                   onmouseout="this.style.borderColor='#333';this.style.background='#0a0a15'">
                    <span style="font-size: 2rem;">${wallet.icon}</span>
                    <div style="flex:1;text-align:left;">
                        <div style="color:#fff;font-weight:600;">${wallet.name}</div>
                        <div style="color:${isDetected ? '#00ff88' : '#888'};font-size:0.8rem;">
                            ${isDetected ? '✓ ' : ''}${statusText}
                        </div>
                    </div>
                    <span style="color:#888;">→</span>
                </button>
            `;
        }).join('');
    },

    // Connect to wallet
    async connect(walletId) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (!wallet) return;

        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        try {
            if (walletId === 'walletconnect') {
                // Show WalletConnect QR simulation
                this.showWalletConnectQR();
                return;
            }

            // Check if wallet is available
            if (!window.ethereum) {
                // Redirect to install or deep link
                if (wallet.deepLink) {
                    window.open(wallet.deepLink, '_blank');
                } else {
                    alert(isFr
                        ? `${wallet.name} n'est pas installé. Veuillez l'installer d'abord.`
                        : `${wallet.name} is not installed. Please install it first.`
                    );
                }
                return;
            }

            // Request accounts
            this.showConnecting(wallet.name);

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length > 0) {
                this.address = accounts[0];
                this.chainId = parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
                this.connected = true;
                this.provider = window.ethereum;

                // Dispatch wallet-connected event for real trading
                window.dispatchEvent(new CustomEvent('wallet-connected', {
                    detail: { address: this.address, chainId: this.chainId }
                }));

                await this.getBalance();
                this.updateUI();
                this.closeModal();

                // Show success notification
                this.showNotification(
                    isFr ? '✅ Wallet connecté!' : '✅ Wallet connected!',
                    'success'
                );

                // Update app state
                if (typeof ObeliskApp !== 'undefined') {
                    ObeliskApp.state.walletConnected = true;
                    ObeliskApp.state.walletAddress = this.address;
                }
            }
        } catch (error) {
            console.error('[WalletConnect] Error:', error);

            if (error.code === 4001) {
                this.showNotification(
                    isFr ? 'Connexion refusée par l\'utilisateur' : 'Connection rejected by user',
                    'error'
                );
            } else {
                this.showNotification(
                    isFr ? 'Erreur de connexion' : 'Connection error',
                    'error'
                );
            }

            this.hideConnecting();
        }
    },

    // Show connecting state
    showConnecting(walletName) {
        const list = document.getElementById('walletList');
        if (list) {
            list.innerHTML = `
                <div style="text-align:center;padding:40px;">
                    <div style="font-size:3rem;margin-bottom:16px;animation:pulse 1.5s infinite;">🔄</div>
                    <p style="color:#fff;margin-bottom:8px;">Connecting to ${walletName}...</p>
                    <p style="color:#888;font-size:0.85rem;">Please approve in your wallet</p>
                </div>
            `;
        }
    },

    hideConnecting() {
        this.renderWalletList();
    },

    // Show WalletConnect QR
    showWalletConnectQR() {
        const list = document.getElementById('walletList');
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        if (list) {
            // Generate a fake QR code pattern (real implementation would use WalletConnect SDK)
            const qrPattern = this.generateQRPattern();

            list.innerHTML = `
                <div style="text-align:center;padding:20px;">
                    <p style="color:#fff;margin-bottom:16px;">
                        ${isFr ? 'Scannez avec votre wallet mobile' : 'Scan with your mobile wallet'}
                    </p>

                    <!-- QR Code -->
                    <div style="
                        background: #fff;
                        padding: 16px;
                        border-radius: 12px;
                        display: inline-block;
                        margin-bottom: 16px;
                    ">
                        <div style="
                            width: 180px;
                            height: 180px;
                            display: grid;
                            grid-template-columns: repeat(15, 1fr);
                            gap: 1px;
                        ">
                            ${qrPattern}
                        </div>
                    </div>

                    <p style="color:#888;font-size:0.8rem;margin-bottom:16px;">
                        ${isFr ? 'Compatible avec 300+ wallets' : 'Compatible with 300+ wallets'}
                    </p>

                    <button onclick="WalletConnect.renderWalletList()" style="
                        background: none;
                        border: 1px solid #333;
                        color: #888;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                    ">← ${isFr ? 'Retour' : 'Back'}</button>

                    <p style="color:#666;font-size:0.75rem;margin-top:16px;">
                        ⚠️ ${isFr ? 'Demo - Intégration WalletConnect SDK requise pour production' : 'Demo - WalletConnect SDK integration required for production'}
                    </p>
                </div>
            `;
        }
    },

    // Generate QR pattern (visual only)
    generateQRPattern() {
        let html = '';
        for (let i = 0; i < 225; i++) {
            const isCorner = (i < 45 && (i % 15 < 7)) || // Top-left
                           (i < 45 && (i % 15 > 7)) ||   // Top-right
                           (i > 180 && (i % 15 < 7));    // Bottom-left

            const isFilled = isCorner || Math.random() > 0.5;
            html += `<div style="background:${isFilled ? '#000' : '#fff'};"></div>`;
        }
        return html;
    },

    // Get balance
    async getBalance() {
        if (!this.address || !this.provider) return;

        try {
            const balance = await this.provider.request({
                method: 'eth_getBalance',
                params: [this.address, 'latest']
            });

            this.balance = parseInt(balance, 16) / 1e18;
        } catch (e) {
            console.error('[WalletConnect] Balance error:', e);
        }
    },

    // Disconnect
    disconnect() {
        this.connected = false;
        this.address = null;
        this.chainId = null;
        this.balance = null;

        // Update app state
        if (typeof ObeliskApp !== 'undefined') {
            ObeliskApp.state.walletConnected = false;
            ObeliskApp.state.walletAddress = null;
        }

        this.updateUI();

        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');
        this.showNotification(
            isFr ? 'Wallet déconnecté' : 'Wallet disconnected',
            'info'
        );
    },

    // Update UI
    updateUI() {
        // Update connect button in header
        const connectBtn = document.querySelector('.btn-connect, #btn-connect');
        if (connectBtn) {
            if (this.connected && this.address) {
                const shortAddr = this.address.slice(0, 6) + '...' + this.address.slice(-4);
                const chain = this.chains[this.chainId];
                const chainName = chain ? chain.name : 'Unknown';

                connectBtn.innerHTML = `
                    <span style="color:#00ff88;">●</span>
                    ${shortAddr}
                    <span style="font-size:0.7rem;opacity:0.7;margin-left:4px;">${chainName}</span>
                `;
                connectBtn.onclick = () => this.showAccountModal();
            } else {
                const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');
                connectBtn.textContent = isFr ? 'Connecter' : 'Connect';
                connectBtn.onclick = () => this.showModal();
            }
        }

        // Update wallet tab if exists
        const walletBalance = document.getElementById('walletExternalBalance');
        if (walletBalance && this.balance !== null) {
            const chain = this.chains[this.chainId] || { symbol: 'ETH' };
            walletBalance.textContent = `${this.balance.toFixed(4)} ${chain.symbol}`;
        }
    },

    // Show account modal (when connected)
    showAccountModal() {
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');
        const chain = this.chains[this.chainId] || { name: 'Unknown', symbol: 'ETH', explorer: '#' };

        let modal = document.getElementById('walletConnectModal');
        if (!modal) {
            this.createModal();
            modal = document.getElementById('walletConnectModal');
        }

        const list = document.getElementById('walletList');
        if (list) {
            list.innerHTML = `
                <div style="text-align:center;padding:20px;">
                    <!-- Address -->
                    <div style="
                        background: #0a0a15;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 16px;
                    ">
                        <div style="font-size:2.5rem;margin-bottom:12px;">🦊</div>
                        <div style="color:#fff;font-size:1.1rem;font-weight:600;word-break:break-all;">
                            ${this.address}
                        </div>
                        <div style="color:#888;font-size:0.85rem;margin-top:8px;">
                            ${chain.name} • ${this.balance?.toFixed(4) || '0'} ${chain.symbol}
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                        <button onclick="WalletConnect.copyAddress()" style="
                            padding: 12px;
                            border-radius: 10px;
                            border: 1px solid #333;
                            background: #0a0a15;
                            color: #fff;
                            cursor: pointer;
                        ">📋 ${isFr ? 'Copier' : 'Copy'}</button>

                        <button onclick="window.open('${chain.explorer}/address/${this.address}', '_blank')" style="
                            padding: 12px;
                            border-radius: 10px;
                            border: 1px solid #333;
                            background: #0a0a15;
                            color: #fff;
                            cursor: pointer;
                        ">🔍 Explorer</button>
                    </div>

                    <!-- Disconnect -->
                    <button onclick="WalletConnect.disconnect();WalletConnect.closeModal()" style="
                        width: 100%;
                        padding: 14px;
                        border-radius: 10px;
                        border: none;
                        background: #ff646420;
                        color: #ff6464;
                        font-weight: 600;
                        cursor: pointer;
                    ">🔌 ${isFr ? 'Déconnecter' : 'Disconnect'}</button>
                </div>
            `;
        }

        modal.style.display = 'flex';
    },

    // Copy address
    copyAddress() {
        if (this.address) {
            navigator.clipboard.writeText(this.address);
            const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');
            this.showNotification(
                isFr ? '📋 Adresse copiée!' : '📋 Address copied!',
                'success'
            );
        }
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('walletConnectModal');
        if (modal) modal.style.display = 'none';
    },

    // Show notification
    showNotification(message, type = 'info') {
        const colors = {
            error: '#ff6464',
            success: '#00ff88',
            info: '#4a9eff'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]}20;
            border: 1px solid ${colors[type]};
            color: ${colors[type]};
            padding: 14px 20px;
            border-radius: 10px;
            font-weight: 500;
            z-index: 100001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Switch chain
    async switchChain(chainId) {
        if (!this.provider) return;

        const hexChainId = '0x' + chainId.toString(16);

        try {
            await this.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }]
            });
        } catch (error) {
            // Chain not added, try to add it
            if (error.code === 4902) {
                const chain = this.chains[chainId];
                if (chain) {
                    // Would need chain params here for adding
                    console.log('[WalletConnect] Chain needs to be added:', chain.name);
                }
            }
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    WalletConnect.init();
});

// CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);

window.WalletConnect = WalletConnect;
