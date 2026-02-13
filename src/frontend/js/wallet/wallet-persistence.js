/**
 * OBELISK DEX - Wallet Persistence
 * Automatically restores wallet state on page load
 */

const WalletPersistence = {
    init() {
        this.restoreWalletState();
        this.listenForChanges();
        console.log('💾 Wallet Persistence loaded');
    },

    /**
     * Restore wallet state from localStorage
     */
    async restoreWalletState() {
        // 1. Check if Obelisk wallet exists
        const savedObeliskWallet = localStorage.getItem('obelisk_wallet');
        if (savedObeliskWallet) {
            try {
                const wallet = JSON.parse(savedObeliskWallet);
                console.log('💾 Found saved Obelisk wallet:', wallet.address);

                // IMPORTANT: Update ALL global variables
                window.walletAddress = wallet.address;
                window.isWalletConnected = true;

                // Update WalletManager
                if (typeof WalletManager !== 'undefined') {
                    WalletManager.isUnlocked = true;
                    WalletManager.currentWallet = { address: wallet.address };
                }

                // Update WalletConnect
                if (typeof WalletConnect !== 'undefined') {
                    WalletConnect.address = wallet.address;
                    WalletConnect.connected = true;
                }

                // Update l'UI
                this.updateUIConnected(wallet.address, 'obelisk');

                // Emit events
                window.dispatchEvent(new CustomEvent('wallet-restored', {
                    detail: { address: wallet.address, type: 'obelisk' }
                }));
                window.dispatchEvent(new CustomEvent('wallet-connected', {
                    detail: { address: wallet.address }
                }));
            } catch (e) {
                console.error('Failed to restore Obelisk wallet:', e);
            }
        }

        // 2. Check if MetaMask was connected
        if (window.ethereum) {
            try {
                // Check if already authorized (without popup)
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                });

                if (accounts && accounts.length > 0) {
                    const address = accounts[0];
                    console.log('💾 Found connected MetaMask:', address);

                    // Save for reference
                    localStorage.setItem('metamask_connected', address);
                    window.walletAddress = address;

                    // Update l'UI
                    this.updateUIConnected(address, 'metamask');

                    // Update WalletConnect si disponible
                    if (typeof WalletConnect !== 'undefined') {
                        WalletConnect.address = address;
                        WalletConnect.connected = true;
                        WalletConnect.walletType = 'metamask';
                    }

                    // Emit event
                    window.dispatchEvent(new CustomEvent('wallet-connected', {
                        detail: { address, type: 'metamask' }
                    }));
                }
            } catch (e) {
                console.log('MetaMask not available or not connected');
            }
        }

        // 3. Check last WalletConnect session
        const wcConnected = localStorage.getItem('walletconnect_connected');
        if (wcConnected && !window.walletAddress) {
            try {
                const data = JSON.parse(wcConnected);
                if (data.address) {
                    console.log('💾 Found WalletConnect session:', data.address);
                    this.updateUIConnected(data.address, 'walletconnect');
                }
            } catch (e) {}
        }
    },

    /**
     * Mettre a jour l'UI pour montrer wallet connecte
     */
    updateUIConnected(address, type) {
        const shortAddr = address.substring(0, 6) + '...' + address.substring(address.length - 4);

        // Cacher "wallet-empty", montrer "wallet-connected"
        const walletEmpty = document.getElementById('wallet-empty');
        const walletConnected = document.getElementById('wallet-connected');

        if (walletEmpty) walletEmpty.style.display = 'none';
        if (walletConnected) walletConnected.style.display = 'block';

        // Update l'adresse affichee
        const addrEl = document.getElementById('wallet-address');
        if (addrEl) addrEl.textContent = shortAddr;

        // Update le bouton Connect
        const btnConnect = document.getElementById('btn-connect-wallet');
        if (btnConnect) {
            const icon = type === 'obelisk' ? '🛡️' : (type === 'metamask' ? '🦊' : '🔗');
            btnConnect.innerHTML = `<span class="btn-icon">${icon}</span><span>${shortAddr}</span>`;
        }

        // Enable swap/trade buttons
        const btnSwap = document.getElementById('btn-swap');
        if (btnSwap) {
            btnSwap.disabled = false;
            btnSwap.textContent = 'Swap';
        }

        const btnPlaceOrder = document.getElementById('btn-place-order');
        if (btnPlaceOrder) {
            btnPlaceOrder.disabled = false;
        }

        // Update global variables
        window.walletAddress = address;
        window.walletType = type;

        // Ajouter indicateur visuel
        this.showConnectionIndicator(type, shortAddr);
    },

    /**
     * Display connection indicator
     */
    showConnectionIndicator(type, address) {
        // Supprimer l'ancien indicateur
        document.getElementById('wallet-indicator')?.remove();

        const indicator = document.createElement('div');
        indicator.id = 'wallet-indicator';

        const icons = {
            obelisk: '🛡️',
            metamask: '🦊',
            walletconnect: '🔗'
        };

        const colors = {
            obelisk: '#00ff88',
            metamask: '#f6851b',
            walletconnect: '#3b99fc'
        };

        indicator.innerHTML = `
            <span class="indicator-icon">${icons[type] || '🔗'}</span>
            <span class="indicator-addr">${address}</span>
            <span class="indicator-status">Connecte</span>
        `;
        indicator.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid ${colors[type] || '#00ff88'};
            border-radius: 20px;
            padding: 6px 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #fff;
            z-index: 9000;
        `;

        // Status indicator style
        const style = document.createElement('style');
        style.textContent = `
            #wallet-indicator .indicator-icon { font-size: 14px; }
            #wallet-indicator .indicator-addr { color: ${colors[type] || '#00ff88'}; font-family: monospace; }
            #wallet-indicator .indicator-status {
                background: rgba(0, 255, 136, 0.2);
                color: #00ff88;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(indicator);
    },

    /**
     * Ecouter les changements de compte MetaMask
     */
    listenForChanges() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    // Deconnecte
                    localStorage.removeItem('metamask_connected');
                    window.walletAddress = null;
                    document.getElementById('wallet-indicator')?.remove();

                    // Remettre l'UI en etat deconnecte
                    const walletEmpty = document.getElementById('wallet-empty');
                    const walletConnected = document.getElementById('wallet-connected');
                    if (walletEmpty) walletEmpty.style.display = 'block';
                    if (walletConnected) walletConnected.style.display = 'none';

                    if (typeof showNotification === 'function') {
                        showNotification('Wallet deconnecte', 'info');
                    }
                } else {
                    // Nouveau compte
                    const newAddress = accounts[0];
                    localStorage.setItem('metamask_connected', newAddress);
                    this.updateUIConnected(newAddress, 'metamask');

                    if (typeof showNotification === 'function') {
                        showNotification('Compte change: ' + newAddress.substring(0, 10) + '...', 'info');
                    }
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                console.log('Chain changed to:', chainId);
                // Optional: reload page or update UI
            });
        }
    },

    /**
     * Save connection state
     */
    saveConnection(address, type) {
        if (type === 'metamask') {
            localStorage.setItem('metamask_connected', address);
        } else if (type === 'walletconnect') {
            localStorage.setItem('walletconnect_connected', JSON.stringify({
                address,
                timestamp: Date.now()
            }));
        }
        // obelisk_wallet est gere par wallet-creation-flow.js
    },

    /**
     * Clear all connections
     */
    clearAllConnections() {
        localStorage.removeItem('obelisk_wallet');
        localStorage.removeItem('metamask_connected');
        localStorage.removeItem('walletconnect_connected');
        window.walletAddress = null;
        document.getElementById('wallet-indicator')?.remove();
    }
};

// Auto-init with delay to let other modules load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => WalletPersistence.init(), 500);
    });
} else {
    setTimeout(() => WalletPersistence.init(), 500);
}

window.WalletPersistence = WalletPersistence;
