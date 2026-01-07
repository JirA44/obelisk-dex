/**
 * OBELISK DEX - Swap Enhancements
 * Ajoute le selecteur de blockchain et ameliore le bouton Connect
 */

const SwapEnhancements = {
    networks: [
        { id: 'ethereum', name: 'Ethereum', icon: '🔷', chainId: 1, color: '#627EEA' },
        { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', chainId: 42161, color: '#28A0F0' },
        { id: 'polygon', name: 'Polygon', icon: '🟣', chainId: 137, color: '#8247E5' },
        { id: 'optimism', name: 'Optimism', icon: '🔴', chainId: 10, color: '#FF0420' },
        { id: 'base', name: 'Base', icon: '🔵', chainId: 8453, color: '#0052FF' },
        { id: 'bsc', name: 'BNB Chain', icon: '🟡', chainId: 56, color: '#F3BA2F' },
        { id: 'avalanche', name: 'Avalanche', icon: '🔺', chainId: 43114, color: '#E84142' }
    ],

    currentNetwork: 'ethereum',

    init() {
        this.addNetworkSelector();
        this.enhanceSwapButton();
        this.injectStyles();
        console.log('🔄 Swap Enhancements loaded');
    },

    addNetworkSelector() {
        const swapHeader = document.querySelector('.swap-header');
        if (!swapHeader) return;

        // Verifier si deja ajoute
        if (document.getElementById('swap-network-selector')) return;

        // Ajouter le selecteur avant le bouton settings
        const settingsBtn = swapHeader.querySelector('.btn-settings');
        if (settingsBtn) {
            const networkBtn = document.createElement('button');
            networkBtn.type = 'button';
            networkBtn.id = 'swap-network-selector';
            networkBtn.className = 'network-selector-btn';
            networkBtn.onclick = () => this.openNetworkModal();
            networkBtn.innerHTML = `
                <span class="network-icon">🔷</span>
                <span class="network-name">Ethereum</span>
                <span class="dropdown-arrow">▼</span>
            `;
            settingsBtn.parentNode.insertBefore(networkBtn, settingsBtn);
        }
    },

    enhanceSwapButton() {
        const btnSwap = document.getElementById('btn-swap');
        if (!btnSwap) return;

        // Remplacer le click handler pour ouvrir le wallet connect
        const originalClick = btnSwap.onclick;
        btnSwap.onclick = async (e) => {
            // Verifier si wallet connecte
            const isConnected = (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) ||
                               (typeof window.walletAddress !== 'undefined' && window.walletAddress) ||
                               (typeof WalletConnect !== 'undefined' && WalletConnect.connected);

            if (!isConnected) {
                // Ouvrir directement le modal wallet
                if (typeof WalletConnect !== 'undefined' && WalletConnect.openModal) {
                    WalletConnect.openModal();
                } else if (document.querySelector('.wallet-modal')) {
                    document.querySelector('.wallet-modal').style.display = 'flex';
                } else {
                    // Fallback: essayer MetaMask
                    try {
                        if (window.ethereum) {
                            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                            if (accounts.length > 0) {
                                window.walletAddress = accounts[0];
                                btnSwap.disabled = false;
                                btnSwap.textContent = 'Swap';
                                if (typeof showNotification === 'function') {
                                    showNotification('Wallet connecte!', 'success');
                                }
                            }
                        } else {
                            if (typeof showNotification === 'function') {
                                showNotification('Installez MetaMask ou un wallet Web3', 'warning');
                            }
                        }
                    } catch (err) {
                        console.error('Wallet connect error:', err);
                    }
                }
                return;
            }

            // Si connecte, executer le swap normal
            if (typeof originalClick === 'function') {
                originalClick.call(btnSwap, e);
            } else if (typeof App !== 'undefined' && App.executeSwap) {
                App.executeSwap();
            }
        };
    },

    openNetworkModal() {
        let modal = document.getElementById('network-modal');
        if (modal) { modal.remove(); return; }

        modal = document.createElement('div');
        modal.id = 'network-modal';
        modal.innerHTML = `
            <div class="network-modal-backdrop" onclick="SwapEnhancements.closeNetworkModal()"></div>
            <div class="network-modal-content">
                <div class="network-modal-header">
                    <h3>Selectionnez un reseau</h3>
                    <button type="button" class="network-modal-close" onclick="SwapEnhancements.closeNetworkModal()">&times;</button>
                </div>
                <div class="network-modal-list">
                    ${this.networks.map(n => `
                        <button type="button" class="network-option ${n.id === this.currentNetwork ? 'active' : ''}"
                                onclick="SwapEnhancements.selectNetwork('${n.id}')"
                                style="--network-color: ${n.color}">
                            <span class="network-option-icon">${n.icon}</span>
                            <span class="network-option-name">${n.name}</span>
                            ${n.id === this.currentNetwork ? '<span class="network-check">✓</span>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    closeNetworkModal() {
        document.getElementById('network-modal')?.remove();
    },

    async selectNetwork(networkId) {
        const network = this.networks.find(n => n.id === networkId);
        if (!network) return;

        this.currentNetwork = networkId;

        // Mettre a jour le bouton
        const btn = document.getElementById('swap-network-selector');
        if (btn) {
            btn.querySelector('.network-icon').textContent = network.icon;
            btn.querySelector('.network-name').textContent = network.name;
        }

        // Essayer de changer le reseau dans MetaMask
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + network.chainId.toString(16) }]
                });
                if (typeof showNotification === 'function') {
                    showNotification(`Reseau: ${network.name}`, 'success');
                }
            } catch (err) {
                // Reseau non ajoute, proposer de l'ajouter
                if (err.code === 4902) {
                    if (typeof showNotification === 'function') {
                        showNotification(`Ajoutez ${network.name} a votre wallet`, 'warning');
                    }
                }
            }
        }

        this.closeNetworkModal();
    },

    injectStyles() {
        if (document.getElementById('swap-enhancements-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'swap-enhancements-styles';
        styles.textContent = `
            .network-selector-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #fff;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                margin-right: 8px;
            }

            .network-selector-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(0, 255, 136, 0.3);
            }

            .network-selector-btn .network-icon {
                font-size: 16px;
            }

            .network-selector-btn .dropdown-arrow {
                font-size: 10px;
                color: #888;
            }

            #network-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .network-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
            }

            .network-modal-content {
                position: relative;
                background: #0a0a0f;
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 16px;
                width: 90%;
                max-width: 400px;
                max-height: 80vh;
                overflow: hidden;
            }

            .network-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .network-modal-header h3 {
                margin: 0;
                font-size: 16px;
                color: #fff;
            }

            .network-modal-close {
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
            }

            .network-modal-list {
                padding: 16px;
                max-height: 400px;
                overflow-y: auto;
            }

            .network-option {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 14px 16px;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                color: #fff;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 8px;
            }

            .network-option:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: var(--network-color, rgba(0, 255, 136, 0.3));
            }

            .network-option.active {
                background: rgba(0, 255, 136, 0.1);
                border-color: #00ff88;
            }

            .network-option-icon {
                font-size: 24px;
            }

            .network-option-name {
                flex: 1;
                font-weight: 500;
            }

            .network-check {
                color: #00ff88;
                font-size: 18px;
            }

            /* Ameliorer le header swap pour aligner les elements */
            .swap-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            }

            .swap-header h2 {
                margin: 0;
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SwapEnhancements.init());
} else {
    setTimeout(() => SwapEnhancements.init(), 300);
}

window.SwapEnhancements = SwapEnhancements;
