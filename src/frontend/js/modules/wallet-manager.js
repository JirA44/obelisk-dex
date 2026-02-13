/**
 * OBELISK Multi-Wallet Manager
 * Manages multiple wallets per user account
 */

class WalletManager {
    constructor() {
        this.apiBase = window.OBELISK_API || 'http://localhost:3001';
        this.wallets = [];
        this.primaryWallet = null;
        this.isLoading = false;
    }

    /**
     * Get authorization header
     */
    getAuthHeader() {
        const token = localStorage.getItem('obelisk_session_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Fetch all linked wallets
     */
    async fetchWallets() {
        this.isLoading = true;

        try {
            const response = await fetch(`${this.apiBase}/api/auth/wallets`, {
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wallets');
            }

            const data = await response.json();
            this.wallets = data.wallets || [];
            this.primaryWallet = this.wallets.find(w => w.isPrimary)?.address || null;

            this.emit('wallets-updated', this.wallets);
            return this.wallets;
        } catch (error) {
            console.error('[WalletManager] Fetch error:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Link a new wallet with SIWE verification
     */
    async linkWallet(walletAddress, label = null) {
        // First get nonce
        const nonceResponse = await fetch(`${this.apiBase}/api/auth/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress })
        });

        if (!nonceResponse.ok) {
            throw new Error('Failed to get nonce');
        }

        const { message, nonce } = await nonceResponse.json();

        // Sign message with the wallet
        const signature = await this.signMessage(walletAddress, message);

        // Send to backend with 2FA if needed
        const twoFactorToken = await this.get2FAToken('link_wallet');

        const response = await fetch(`${this.apiBase}/api/auth/wallets/link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...(twoFactorToken ? { 'X-2FA-Token': twoFactorToken } : {})
            },
            body: JSON.stringify({ walletAddress, signature, nonce, label })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 403 && data.challengeId) {
                // 2FA required
                return { requires2FA: true, challengeId: data.challengeId };
            }
            throw new Error(data.error || 'Failed to link wallet');
        }

        await this.fetchWallets();
        this.emit('wallet-linked', data);
        return data;
    }

    /**
     * Add watch-only wallet (for tracking compromised/cold wallets)
     */
    async addWatchOnlyWallet(walletAddress, label = 'Watch Only') {
        const response = await fetch(`${this.apiBase}/api/auth/wallets/watch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader()
            },
            body: JSON.stringify({ walletAddress, label })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to add watch-only wallet');
        }

        await this.fetchWallets();
        this.emit('wallet-added', data);
        return data;
    }

    /**
     * Unlink a wallet
     */
    async unlinkWallet(walletAddress) {
        const twoFactorToken = await this.get2FAToken('unlink_wallet');

        const response = await fetch(`${this.apiBase}/api/auth/wallets/${walletAddress}`, {
            method: 'DELETE',
            headers: {
                ...this.getAuthHeader(),
                ...(twoFactorToken ? { 'X-2FA-Token': twoFactorToken } : {})
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 403 && data.challengeId) {
                return { requires2FA: true, challengeId: data.challengeId };
            }
            throw new Error(data.error || 'Failed to unlink wallet');
        }

        await this.fetchWallets();
        this.emit('wallet-unlinked', { address: walletAddress });
        return data;
    }

    /**
     * Set primary wallet
     */
    async setPrimaryWallet(walletAddress) {
        const twoFactorToken = await this.get2FAToken('set_primary_wallet');

        const response = await fetch(`${this.apiBase}/api/auth/wallets/${walletAddress}/primary`, {
            method: 'PUT',
            headers: {
                ...this.getAuthHeader(),
                ...(twoFactorToken ? { 'X-2FA-Token': twoFactorToken } : {})
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 403 && data.challengeId) {
                return { requires2FA: true, challengeId: data.challengeId };
            }
            throw new Error(data.error || 'Failed to set primary wallet');
        }

        this.primaryWallet = walletAddress;
        await this.fetchWallets();
        this.emit('primary-wallet-changed', { address: walletAddress });
        return data;
    }

    /**
     * Get wallet audit log
     */
    async getAuditLog(limit = 50) {
        const response = await fetch(`${this.apiBase}/api/auth/wallets/audit?limit=${limit}`, {
            headers: this.getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch audit log');
        }

        const data = await response.json();
        return data.auditLog || [];
    }

    /**
     * Sign message with wallet (browser wallet integration)
     */
    async signMessage(walletAddress, message) {
        // Check for available wallet providers
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (!accounts.includes(walletAddress.toLowerCase()) &&
                    !accounts.map(a => a.toLowerCase()).includes(walletAddress.toLowerCase())) {
                    // Request to switch/connect the specific account
                    await window.ethereum.request({
                        method: 'wallet_requestPermissions',
                        params: [{ eth_accounts: {} }]
                    });
                }

                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, walletAddress]
                });

                return signature;
            } catch (error) {
                console.error('[WalletManager] Sign error:', error);
                throw new Error('Failed to sign message: ' + error.message);
            }
        }

        throw new Error('No wallet provider available');
    }

    /**
     * Get 2FA token if enabled (prompts user)
     */
    async get2FAToken(action) {
        // Check if 2FA is enabled
        if (!window.twoFactorSetup?.isEnabled) {
            return null;
        }

        // Prompt for 2FA code
        return new Promise((resolve) => {
            if (window.twoFactorSetup?.prompt2FA) {
                window.twoFactorSetup.prompt2FA(action, (token) => {
                    resolve(token);
                });
            } else {
                // Fallback to simple prompt
                const token = prompt(`Enter your 2FA code for: ${action}`);
                resolve(token);
            }
        });
    }

    /**
     * Render wallet list UI
     */
    renderWalletList(container) {
        if (!container) return;

        const html = `
            <div class="wallet-manager">
                <div class="wallet-manager-header">
                    <h3>Connected Wallets</h3>
                    <div class="wallet-manager-actions">
                        <button class="btn btn-sm btn-primary" id="addWalletBtn">
                            <span class="icon">+</span> Add Wallet
                        </button>
                        <button class="btn btn-sm btn-secondary" id="addWatchOnlyBtn">
                            <span class="icon">eye</span> Watch Only
                        </button>
                    </div>
                </div>

                <div class="wallet-list" id="walletList">
                    ${this.isLoading ? '<div class="loading">Loading wallets...</div>' : ''}
                    ${this.wallets.map(wallet => this.renderWalletItem(wallet)).join('')}
                    ${!this.isLoading && this.wallets.length === 0 ? '<div class="empty">No wallets linked</div>' : ''}
                </div>

                <div class="wallet-audit-section">
                    <button class="btn btn-sm btn-outline" id="viewAuditLogBtn">View Audit Log</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners(container);
    }

    /**
     * Render single wallet item
     */
    renderWalletItem(wallet) {
        const shortAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
        const badges = [];

        if (wallet.isPrimary) badges.push('<span class="badge primary">Primary</span>');
        if (wallet.isWatchOnly) badges.push('<span class="badge watch-only">Watch Only</span>');

        return `
            <div class="wallet-item ${wallet.isPrimary ? 'primary' : ''} ${wallet.isWatchOnly ? 'watch-only' : ''}"
                 data-address="${wallet.address}">
                <div class="wallet-info">
                    <div class="wallet-address">
                        <span class="address">${shortAddress}</span>
                        <button class="btn-copy" data-copy="${wallet.address}" title="Copy address">
                            <span class="icon">copy</span>
                        </button>
                    </div>
                    <div class="wallet-label">${wallet.label || 'Wallet'}</div>
                    <div class="wallet-badges">${badges.join('')}</div>
                </div>

                <div class="wallet-balance">
                    ${wallet.balanceSnapshot ? this.formatBalance(wallet.balanceSnapshot) : '-'}
                </div>

                <div class="wallet-actions">
                    ${!wallet.isPrimary && !wallet.isWatchOnly ? `
                        <button class="btn btn-xs btn-outline set-primary-btn" data-address="${wallet.address}">
                            Set Primary
                        </button>
                    ` : ''}
                    ${!wallet.isPrimary ? `
                        <button class="btn btn-xs btn-danger unlink-btn" data-address="${wallet.address}">
                            Remove
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Format balance snapshot
     */
    formatBalance(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') return '-';

        const entries = Object.entries(snapshot);
        if (entries.length === 0) return '-';

        return entries.slice(0, 3).map(([token, amount]) =>
            `<span class="balance-item">${parseFloat(amount).toFixed(4)} ${token}</span>`
        ).join('');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners(container) {
        // Add wallet button
        container.querySelector('#addWalletBtn')?.addEventListener('click', () => {
            this.showAddWalletModal();
        });

        // Add watch-only button
        container.querySelector('#addWatchOnlyBtn')?.addEventListener('click', () => {
            this.showWatchOnlyModal();
        });

        // View audit log
        container.querySelector('#viewAuditLogBtn')?.addEventListener('click', () => {
            this.showAuditLogModal();
        });

        // Copy buttons
        container.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const address = btn.dataset.copy;
                navigator.clipboard.writeText(address);
                this.showToast('Address copied!');
            });
        });

        // Set primary buttons
        container.querySelectorAll('.set-primary-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const address = btn.dataset.address;
                try {
                    await this.setPrimaryWallet(address);
                    this.showToast('Primary wallet updated');
                } catch (error) {
                    this.showToast(error.message, 'error');
                }
            });
        });

        // Unlink buttons
        container.querySelectorAll('.unlink-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const address = btn.dataset.address;
                if (confirm(`Remove wallet ${address.slice(0, 10)}...?`)) {
                    try {
                        await this.unlinkWallet(address);
                        this.showToast('Wallet removed');
                    } catch (error) {
                        this.showToast(error.message, 'error');
                    }
                }
            });
        });
    }

    /**
     * Show add wallet modal
     */
    showAddWalletModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal wallet-modal">
                <div class="modal-header">
                    <h3>Link New Wallet</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Connect a wallet and sign a message to link it to your account.</p>
                    <div class="form-group">
                        <label>Wallet Label (optional)</label>
                        <input type="text" id="walletLabel" placeholder="e.g., Trading Wallet" />
                    </div>
                    <button class="btn btn-primary btn-block" id="connectWalletBtn">
                        Connect Wallet
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        modal.querySelector('#connectWalletBtn').addEventListener('click', async () => {
            const label = modal.querySelector('#walletLabel').value;

            try {
                // Request wallet connection
                if (window.ethereum) {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const walletAddress = accounts[0];

                    const result = await this.linkWallet(walletAddress, label);

                    if (result.requires2FA) {
                        this.showToast('2FA verification required', 'info');
                    } else {
                        this.showToast('Wallet linked successfully!');
                        modal.remove();
                    }
                } else {
                    this.showToast('No wallet provider found', 'error');
                }
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
    }

    /**
     * Show watch-only modal
     */
    showWatchOnlyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal wallet-modal">
                <div class="modal-header">
                    <h3>Add Watch-Only Wallet</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Track a wallet's balances without needing to sign. Useful for compromised or cold storage wallets.</p>
                    <div class="form-group">
                        <label>Wallet Address</label>
                        <input type="text" id="watchAddress" placeholder="0x..." />
                    </div>
                    <div class="form-group">
                        <label>Label (optional)</label>
                        <input type="text" id="watchLabel" placeholder="e.g., Cold Storage" />
                    </div>
                    <button class="btn btn-primary btn-block" id="addWatchBtn">
                        Add Watch-Only Wallet
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        modal.querySelector('#addWatchBtn').addEventListener('click', async () => {
            const address = modal.querySelector('#watchAddress').value.trim();
            const label = modal.querySelector('#watchLabel').value || 'Watch Only';

            if (!address || !address.startsWith('0x') || address.length !== 42) {
                this.showToast('Invalid wallet address', 'error');
                return;
            }

            try {
                await this.addWatchOnlyWallet(address, label);
                this.showToast('Watch-only wallet added!');
                modal.remove();
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
    }

    /**
     * Show audit log modal
     */
    async showAuditLogModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal wallet-modal audit-modal">
                <div class="modal-header">
                    <h3>Wallet Audit Log</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="audit-log-list" id="auditLogList">
                        <div class="loading">Loading audit log...</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        try {
            const auditLog = await this.getAuditLog();
            const listEl = modal.querySelector('#auditLogList');

            if (auditLog.length === 0) {
                listEl.innerHTML = '<div class="empty">No audit entries</div>';
            } else {
                listEl.innerHTML = auditLog.map(entry => `
                    <div class="audit-entry">
                        <div class="audit-action">${entry.action}</div>
                        <div class="audit-wallet">${entry.wallet_address.slice(0, 10)}...</div>
                        <div class="audit-ip">${entry.ip_address || 'N/A'}</div>
                        <div class="audit-time">${new Date(entry.created_at * 1000).toLocaleString()}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            modal.querySelector('#auditLogList').innerHTML = `<div class="error">${error.message}</div>`;
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Event emitter
     */
    emit(event, data) {
        window.dispatchEvent(new CustomEvent(`wallet-manager:${event}`, { detail: data }));
    }
}

// Export singleton
window.walletManager = new WalletManager();
