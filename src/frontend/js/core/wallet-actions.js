/**
 * OBELISK DEX - Wallet Actions Module
 * Handles wallet action buttons (Send, Receive, Backup, etc.)
 */

const WalletActions = {
    // Send crypto
    send() {
        const isConnected = typeof WalletConnect !== 'undefined' && WalletConnect.isConnected();

        if (!isConnected) {
            if (typeof showNotification === 'function') {
                showNotification('Please connect your wallet first', 'warning');
            }
            if (typeof WalletConnect !== 'undefined') {
                WalletConnect.showModal();
            }
            return;
        }

        // Create send modal
        this.showSendModal();
    },

    showSendModal() {
        const existingModal = document.getElementById('wallet-send-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'wallet-send-modal';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:500;display:flex;align-items:center;justify-content:center;" onclick="if(event.target===this)WalletActions.closeModal()">
                <div style="background:#1a1a2e;border-radius:16px;padding:24px;max-width:420px;width:90%;border:1px solid rgba(255,255,255,0.1);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h3 style="margin:0;color:#fff;font-size:18px;">Send Crypto</h3>
                        <button onclick="WalletActions.closeModal()" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;">&times;</button>
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="display:block;color:#888;font-size:12px;margin-bottom:6px;">Recipient Address</label>
                        <input type="text" id="send-address" placeholder="0x..." style="width:100%;padding:12px;background:#0d0d1a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="display:block;color:#888;font-size:12px;margin-bottom:6px;">Amount (USDC)</label>
                        <input type="number" id="send-amount" placeholder="0.00" min="0" step="0.01" style="width:100%;padding:12px;background:#0d0d1a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                    </div>
                    <button onclick="WalletActions.executeSend()" style="width:100%;padding:14px;background:linear-gradient(135deg,#00ff88,#00d4aa);border:none;border-radius:8px;color:#0d0d1a;font-weight:600;font-size:14px;cursor:pointer;">
                        Send
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    async executeSend() {
        const address = document.getElementById('send-address')?.value;
        const amount = parseFloat(document.getElementById('send-amount')?.value);

        if (!address || !address.startsWith('0x') || address.length !== 42) {
            showNotification('Invalid address', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            showNotification('Invalid amount', 'error');
            return;
        }

        showNotification('Sending transaction...', 'info');

        // Simulate transaction (would integrate with real wallet)
        setTimeout(() => {
            showNotification(`Sent ${amount} USDC to ${address.slice(0,6)}...${address.slice(-4)}`, 'success');
            this.closeModal();
        }, 2000);
    },

    // Private send (stealth transaction)
    sendPrivate() {
        showNotification('Private Send coming soon - requires Railgun integration', 'info');
    },

    // Receive crypto - show address QR
    receive() {
        const isConnected = typeof WalletConnect !== 'undefined' && WalletConnect.isConnected();

        if (!isConnected) {
            showNotification('Please connect your wallet first', 'warning');
            if (typeof WalletConnect !== 'undefined') {
                WalletConnect.showModal();
            }
            return;
        }

        const address = WalletConnect.getAddress ? WalletConnect.getAddress() : localStorage.getItem('wallet_address') || '0x...';

        const existingModal = document.getElementById('wallet-receive-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'wallet-receive-modal';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:500;display:flex;align-items:center;justify-content:center;" onclick="if(event.target===this)WalletActions.closeModal()">
                <div style="background:#1a1a2e;border-radius:16px;padding:24px;max-width:380px;width:90%;border:1px solid rgba(255,255,255,0.1);text-align:center;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h3 style="margin:0;color:#fff;font-size:18px;">Receive Crypto</h3>
                        <button onclick="WalletActions.closeModal()" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;">&times;</button>
                    </div>
                    <div style="background:#0d0d1a;padding:16px;border-radius:12px;margin-bottom:16px;">
                        <p style="color:#888;font-size:12px;margin:0 0 8px 0;">Your Arbitrum Address</p>
                        <p style="color:#00ff88;font-size:13px;word-break:break-all;margin:0;font-family:monospace;">${address}</p>
                    </div>
                    <button onclick="WalletActions.copyAddress('${address}')" style="width:100%;padding:12px;background:rgba(0,255,136,0.2);border:1px solid rgba(0,255,136,0.4);border-radius:8px;color:#00ff88;font-weight:600;cursor:pointer;">
                        Copy Address
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    copyAddress(address) {
        navigator.clipboard.writeText(address).then(() => {
            showNotification('Address copied to clipboard', 'success');
        }).catch(() => {
            showNotification('Failed to copy address', 'error');
        });
    },

    // Stealth address for privacy
    stealthAddress() {
        showNotification('Stealth Address feature coming soon', 'info');
    },

    // Backup wallet/keys
    backup() {
        if (typeof BackupSystem !== 'undefined' && BackupSystem.exportData) {
            BackupSystem.exportData();
        } else {
            // Fallback: export portfolio data
            const data = {
                timestamp: new Date().toISOString(),
                portfolio: localStorage.getItem('simulated_portfolio'),
                investments: localStorage.getItem('obelisk_investments'),
                settings: localStorage.getItem('obelisk_settings')
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `obelisk-backup-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            showNotification('Backup downloaded', 'success');
        }
    },

    closeModal() {
        document.getElementById('wallet-send-modal')?.remove();
        document.getElementById('wallet-receive-modal')?.remove();
    }
};

// Expose globally
window.WalletActions = WalletActions;

console.log('[WalletActions] Module loaded');
