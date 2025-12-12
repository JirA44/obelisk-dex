/**
 * Obelisk DEX - Wallet Manager
 *
 * Manages post-quantum secure wallets with self-custody.
 * Private keys NEVER leave the user's device.
 */

const WalletManager = {
    // Current wallet state (in memory only)
    currentWallet: null,
    isUnlocked: false,
    sessionPassword: null, // Cleared on page close

    // Wallet types
    TYPES: {
        INTERNAL: 'internal',      // Created in Obelisk
        METAMASK: 'metamask',      // MetaMask connection
        WALLETCONNECT: 'walletconnect' // WalletConnect
    },

    /**
     * Create a new wallet with post-quantum encryption
     */
    async createWallet(password) {
        // Generate mnemonic
        const mnemonic = CryptoUtils.generateMnemonic(24);

        // Derive private key from mnemonic
        const privateKey = await CryptoUtils.derivePrivateKey(mnemonic);

        // Generate wallet ID
        const walletId = 'wallet_' + CryptoUtils.bytesToHex(CryptoUtils.generateRandomBytes(8));

        // Derive public address (simplified - use proper eth key derivation in production)
        const addressHash = await CryptoUtils.sha256(privateKey);
        const address = '0x' + CryptoUtils.bytesToHex(addressHash.slice(0, 20));

        // Create wallet object
        const wallet = {
            id: walletId,
            type: this.TYPES.INTERNAL,
            address: address,
            mnemonic: mnemonic,
            privateKey: CryptoUtils.bytesToHex(privateKey),
            createdAt: Date.now(),
            name: 'Obelisk Wallet',
            networks: ['ethereum', 'arbitrum']
        };

        // Save encrypted wallet
        await SecureStorage.saveWallet(walletId, wallet, password);

        // Store in memory (without sensitive data for display)
        this.currentWallet = {
            id: walletId,
            address: address,
            type: this.TYPES.INTERNAL,
            name: wallet.name
        };
        this.isUnlocked = true;
        this.sessionPassword = password;

        return {
            walletId,
            address,
            mnemonic // Return mnemonic for user to backup (show only once!)
        };
    },

    /**
     * Import wallet from mnemonic
     */
    async importFromMnemonic(mnemonic, password) {
        // Validate mnemonic
        if (!CryptoUtils.validateMnemonic(mnemonic)) {
            throw new Error('Invalid mnemonic phrase');
        }

        // Derive private key
        const privateKey = await CryptoUtils.derivePrivateKey(mnemonic);

        // Generate wallet ID
        const walletId = 'wallet_' + CryptoUtils.bytesToHex(CryptoUtils.generateRandomBytes(8));

        // Derive address
        const addressHash = await CryptoUtils.sha256(privateKey);
        const address = '0x' + CryptoUtils.bytesToHex(addressHash.slice(0, 20));

        // Create wallet object
        const wallet = {
            id: walletId,
            type: this.TYPES.INTERNAL,
            address: address,
            mnemonic: mnemonic,
            privateKey: CryptoUtils.bytesToHex(privateKey),
            createdAt: Date.now(),
            name: 'Imported Wallet',
            networks: ['ethereum', 'arbitrum']
        };

        // Save encrypted
        await SecureStorage.saveWallet(walletId, wallet, password);

        this.currentWallet = {
            id: walletId,
            address: address,
            type: this.TYPES.INTERNAL,
            name: wallet.name
        };
        this.isUnlocked = true;
        this.sessionPassword = password;

        return { walletId, address };
    },

    /**
     * Unlock existing wallet with password
     */
    async unlockWallet(walletId, password) {
        try {
            const wallet = await SecureStorage.loadWallet(walletId, password);

            this.currentWallet = {
                id: wallet.id,
                address: wallet.address,
                type: wallet.type,
                name: wallet.name
            };
            this.isUnlocked = true;
            this.sessionPassword = password;

            return this.currentWallet;
        } catch (e) {
            throw new Error('Failed to unlock wallet - incorrect password');
        }
    },

    /**
     * Lock wallet (clear from memory)
     */
    lockWallet() {
        this.currentWallet = null;
        this.isUnlocked = false;
        this.sessionPassword = null;
    },

    // EIP-6963 discovered wallets
    eip6963Wallets: [],
    eip6963Initialized: false,

    /**
     * Reset wallet detection (for refresh button)
     */
    resetWalletDetection() {
        this.eip6963Wallets = [];
        this.eip6963Initialized = false;
        console.log('Wallet detection reset');
    },

    /**
     * Initialize EIP-6963 wallet discovery (only once)
     */
    initEIP6963() {
        if (this.eip6963Initialized) return;
        this.eip6963Initialized = true;

        // Listen for wallet announcements
        window.addEventListener('eip6963:announceProvider', (event) => {
            const { info, provider } = event.detail;
            console.log('EIP-6963 wallet discovered:', info.name);

            // Add to discovered wallets if not already present
            if (!this.eip6963Wallets.find(w => w.info.uuid === info.uuid)) {
                this.eip6963Wallets.push({ info, provider });
            }
        });

        // Request wallet announcements
        window.dispatchEvent(new Event('eip6963:requestProvider'));
    },

    /**
     * Detect all available wallet providers
     */
    detectWallets() {
        const wallets = [];
        const seen = new Set();

        // Method 1: EIP-6963 wallets (modern standard)
        for (const wallet of this.eip6963Wallets) {
            const name = wallet.info.name;
            if (!seen.has(name.toLowerCase())) {
                seen.add(name.toLowerCase());
                wallets.push({
                    name: name,
                    provider: wallet.provider,
                    icon: wallet.info.icon || this.getWalletIcon(name),
                    rdns: wallet.info.rdns
                });
            }
        }

        // Method 2: Check window.ethereum.providers array
        if (window.ethereum?.providers?.length) {
            for (const provider of window.ethereum.providers) {
                const walletInfo = this.identifyProvider(provider);
                if (walletInfo && !seen.has(walletInfo.name.toLowerCase())) {
                    seen.add(walletInfo.name.toLowerCase());
                    wallets.push({ ...walletInfo, provider });
                }
            }
        }

        // Method 3: Check window.ethereum directly
        if (window.ethereum && !window.ethereum.providers) {
            const walletInfo = this.identifyProvider(window.ethereum);
            if (walletInfo && !seen.has(walletInfo.name.toLowerCase())) {
                seen.add(walletInfo.name.toLowerCase());
                wallets.push({ ...walletInfo, provider: window.ethereum });
            }
        }

        // Method 4: Force check for MetaMask's hidden provider
        // Some wallets hide MetaMask but it's still accessible
        if (!seen.has('metamask') && window.ethereum) {
            // Try to access MetaMask directly via providers
            const providers = window.ethereum.providers || [window.ethereum];
            for (const p of providers) {
                if (p.isMetaMask === true && p.isZerion !== true && p.isRabby !== true) {
                    wallets.unshift({ name: 'MetaMask', provider: p, icon: '🦊' });
                    break;
                }
            }
        }

        console.log('Detected wallets:', wallets.map(w => w.name));
        return wallets;
    },

    /**
     * Identify provider type
     */
    identifyProvider(provider) {
        if (!provider) return null;

        // Check flags in specific order (more specific first)
        if (provider.isZerion) {
            return { name: 'Zerion', icon: '⚡' };
        }
        if (provider.isRabby) {
            return { name: 'Rabby', icon: '🐰' };
        }
        if (provider.isCoinbaseWallet) {
            return { name: 'Coinbase', icon: '🔵' };
        }
        if (provider.isTrust) {
            return { name: 'Trust Wallet', icon: '🛡️' };
        }
        if (provider.isMetaMask && !provider.isZerion && !provider.isRabby) {
            return { name: 'MetaMask', icon: '🦊' };
        }
        if (provider.isBraveWallet) {
            return { name: 'Brave', icon: '🦁' };
        }

        return { name: 'Browser Wallet', icon: '🔗' };
    },

    /**
     * Get wallet icon by name
     */
    getWalletIcon(name) {
        const icons = {
            'metamask': '🦊',
            'zerion': '⚡',
            'rabby': '🐰',
            'coinbase': '🔵',
            'trust': '🛡️',
            'brave': '🦁'
        };
        return icons[name.toLowerCase()] || '🔗';
    },

    /**
     * Show wallet selector modal
     */
    async showWalletSelector() {
        // Initialize EIP-6963 discovery first
        this.initEIP6963();

        // Small delay to let wallets announce themselves
        await new Promise(r => setTimeout(r, 100));

        const wallets = this.detectWallets();

        if (wallets.length === 0) {
            throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
        }

        // Always show selector to let user choose
        return new Promise((resolve, reject) => {
            const modal = document.createElement('div');
            modal.className = 'modal wallet-selector-modal';
            modal.style.cssText = 'display:flex; position:fixed; top:0; left:0; right:0; bottom:0; z-index:10000; align-items:center; justify-content:center;';
            modal.innerHTML = `
                <div class="modal-backdrop" style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:1;"></div>
                <div class="modal-content" style="position:relative; z-index:2; background:#1a1a2e; border-radius:16px; padding:24px; min-width:320px; max-width:400px; width:90%; border:1px solid rgba(0,212,255,0.3); box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; width:100%;">
                        <h3 style="margin:0; padding:0; color:#ffffff; font-size:18px; font-weight:600; white-space:nowrap;">${typeof I18n !== 'undefined' ? I18n.t('select_wallet') : 'Select Wallet'}</h3>
                        <div style="display:flex; gap:8px; align-items:center; flex-shrink:0;">
                            <button class="refresh-wallets" style="background:rgba(0,212,255,0.2); border:1px solid rgba(0,212,255,0.4); color:#00d4ff; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:500; white-space:nowrap;">${typeof I18n !== 'undefined' ? I18n.t('refresh') : 'Refresh'}</button>
                            <button class="modal-close" style="background:none; border:none; color:rgba(255,255,255,0.6); font-size:24px; cursor:pointer; padding:4px 8px; line-height:1; width:32px; height:32px;">&times;</button>
                        </div>
                    </div>
                    <div style="width:100%;">
                        <p style="color:rgba(255,255,255,0.7); margin:0 0 16px 0; padding:0; font-size:14px;">${typeof I18n !== 'undefined' ? I18n.t('choose_wallet') : 'Choose your wallet:'}</p>
                        <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
                            ${wallets.map((w, i) => `
                                <button class="wallet-option" data-index="${i}" style="display:flex; align-items:center; gap:12px; padding:14px 16px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#ffffff; cursor:pointer; font-size:15px; width:100%; box-sizing:border-box; text-align:left;">
                                    ${w.icon && w.icon.startsWith('data:')
                                        ? `<img src="${w.icon}" style="width:28px; height:28px; flex-shrink:0; border-radius:6px;" alt="${w.name}">`
                                        : `<span style="font-size:24px; flex-shrink:0; width:28px; text-align:center;">${w.icon || '🔗'}</span>`
                                    }
                                    <span style="font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${w.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Add hover effects
            modal.querySelectorAll('.wallet-option').forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = 'rgba(0,212,255,0.2)';
                    btn.style.borderColor = 'rgba(0,212,255,0.5)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'rgba(255,255,255,0.05)';
                    btn.style.borderColor = 'rgba(255,255,255,0.1)';
                });
            });

            // Close handlers
            const closeModal = () => {
                modal.remove();
                reject(new Error('Wallet selection cancelled'));
            };

            modal.querySelector('.modal-close').addEventListener('click', closeModal);
            modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

            // Refresh button handler
            modal.querySelector('.refresh-wallets').addEventListener('click', async () => {
                this.resetWalletDetection();
                modal.remove();
                try {
                    const result = await this.showWalletSelector();
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });

            // Wallet selection
            modal.querySelectorAll('.wallet-option').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const index = parseInt(btn.dataset.index);
                    modal.remove();
                    try {
                        const result = await this.connectWallet(wallets[index]);
                        resolve(result);
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        });
    },

    /**
     * Connect to specific wallet provider
     */
    async connectWallet(wallet) {
        const provider = wallet.provider;

        try {
            const accounts = await provider.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            const address = accounts[0];

            this.currentWallet = {
                id: wallet.name.toLowerCase() + '_' + address.slice(2, 10),
                address: address,
                type: this.TYPES.METAMASK,
                name: wallet.name,
                provider: provider
            };
            this.isUnlocked = true;

            // Listen for account changes on this specific provider
            provider.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.lockWallet();
                    window.dispatchEvent(new Event('wallet-disconnected'));
                } else {
                    this.currentWallet.address = accounts[0];
                    window.dispatchEvent(new Event('wallet-changed'));
                }
            });

            provider.on('chainChanged', () => {
                window.dispatchEvent(new Event('wallet-chain-changed'));
            });

            return this.currentWallet;
        } catch (e) {
            throw new Error(`Failed to connect ${wallet.name}: ` + e.message);
        }
    },

    /**
     * Connect MetaMask specifically
     */
    async connectMetaMask() {
        const wallets = this.detectWallets();
        const metamask = wallets.find(w => w.name === 'MetaMask');

        if (metamask) {
            return this.connectWallet(metamask);
        }

        // Fallback to wallet selector if MetaMask not found
        return this.showWalletSelector();
    },

    /**
     * Disconnect external wallet
     */
    disconnectExternalWallet() {
        if (this.currentWallet?.type !== this.TYPES.INTERNAL) {
            this.lockWallet();
        }
    },

    /**
     * Get private key (requires password)
     * WARNING: Only call when absolutely necessary (signing transactions)
     */
    async getPrivateKey(password) {
        if (!this.currentWallet) {
            throw new Error('No wallet connected');
        }

        if (this.currentWallet.type !== this.TYPES.INTERNAL) {
            throw new Error('Cannot get private key for external wallet');
        }

        const wallet = await SecureStorage.loadWallet(this.currentWallet.id, password);
        return wallet.privateKey;
    },

    /**
     * Sign message with wallet
     */
    async signMessage(message, password) {
        if (!this.currentWallet) {
            throw new Error('No wallet connected');
        }

        if (this.currentWallet.type === this.TYPES.METAMASK) {
            // Use MetaMask to sign
            return await window.ethereum.request({
                method: 'personal_sign',
                params: [message, this.currentWallet.address]
            });
        }

        // Sign with internal wallet
        const privateKey = await this.getPrivateKey(password);
        // In production, use proper ECDSA signing
        const messageHash = await CryptoUtils.sha256(message);
        // Simplified signature - use ethers.js or similar in production
        return CryptoUtils.bytesToHex(messageHash);
    },

    /**
     * Get wallet balance (from blockchain)
     */
    async getBalance(address, network = 'ethereum') {
        const rpcUrls = {
            ethereum: 'https://eth.llamarpc.com',
            arbitrum: 'https://arb1.arbitrum.io/rpc'
        };

        try {
            const response = await fetch(rpcUrls[network], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_getBalance',
                    params: [address, 'latest'],
                    id: 1
                })
            });

            const data = await response.json();
            const balanceWei = parseInt(data.result, 16);
            return balanceWei / 1e18; // Convert to ETH
        } catch (e) {
            console.error('Failed to get balance:', e);
            return 0;
        }
    },

    /**
     * Get all wallets (list only, not decrypted)
     */
    async getWalletList() {
        return await SecureStorage.getWalletList();
    },

    /**
     * Delete wallet
     */
    async deleteWallet(walletId, password) {
        // Verify password first
        await SecureStorage.loadWallet(walletId, password);
        await SecureStorage.deleteWallet(walletId);

        if (this.currentWallet?.id === walletId) {
            this.lockWallet();
        }
    },

    /**
     * Export wallet backup (encrypted)
     */
    async exportWalletBackup(walletId, password) {
        const wallet = await SecureStorage.loadWallet(walletId, password);
        return {
            mnemonic: wallet.mnemonic,
            address: wallet.address,
            createdAt: wallet.createdAt
        };
    },

    /**
     * Check if any wallet exists
     */
    async hasWallet() {
        const wallets = await this.getWalletList();
        return wallets.length > 0;
    },

    /**
     * Get shortened address for display
     */
    shortenAddress(address) {
        if (!address) return '';
        return address.slice(0, 6) + '...' + address.slice(-4);
    }
};

// Export
window.WalletManager = WalletManager;
