// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - MULTI-CHAIN MANAGER
// Handles chain switching, balance tracking, and cross-chain operations
// ═══════════════════════════════════════════════════════════════════════════════

const ChainManager = {
    // ═══════════════════════════════════════════════════════════════════════════
    // CHAIN DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════════════

    chains: {
        42161: {
            chainId: 42161,
            name: 'Arbitrum One',
            shortName: 'arbitrum',
            icon: '🔵',
            rpc: 'https://arb1.arbitrum.io/rpc',
            explorer: 'https://arbiscan.io',
            nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
            },
            tokens: {
                USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
            },
            blockTime: 0.25, // 250ms
            avgGasPrice: 0.1, // gwei
            primary: true
        },
        10: {
            chainId: 10,
            name: 'Optimism',
            shortName: 'optimism',
            icon: '🔴',
            rpc: 'https://mainnet.optimism.io',
            explorer: 'https://optimistic.etherscan.io',
            nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
            },
            tokens: {
                USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
                WETH: '0x4200000000000000000000000000000000000006'
            },
            blockTime: 2, // 2s
            avgGasPrice: 0.001 // gwei
        },
        8453: {
            chainId: 8453,
            name: 'Base',
            shortName: 'base',
            icon: '🔷',
            rpc: 'https://mainnet.base.org',
            explorer: 'https://basescan.org',
            nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
            },
            tokens: {
                USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                WETH: '0x4200000000000000000000000000000000000006'
            },
            blockTime: 2, // 2s
            avgGasPrice: 0.001 // gwei
        },
        1: {
            chainId: 1,
            name: 'Ethereum',
            shortName: 'ethereum',
            icon: '⬜',
            rpc: 'https://eth.llamarpc.com',
            explorer: 'https://etherscan.io',
            nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
            },
            tokens: {
                USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
            },
            blockTime: 12, // 12s
            avgGasPrice: 20 // gwei
        },
        137: {
            chainId: 137,
            name: 'Polygon',
            shortName: 'polygon',
            icon: '🟣',
            rpc: 'https://polygon-rpc.com',
            explorer: 'https://polygonscan.com',
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            },
            tokens: {
                USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
            },
            blockTime: 2, // 2s
            avgGasPrice: 50 // gwei
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════

    currentChainId: 42161, // Default to Arbitrum
    balances: {}, // { chainId: { native: 0, usdc: 0, weth: 0 } }
    listeners: [], // Chain change callbacks
    providers: {}, // Cached providers

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Initialize ChainManager
     */
    async init() {
        console.log('[ChainManager] Initializing multi-chain support...');

        // Detect current chain if wallet connected
        await this.detectCurrentChain();

        // Set up wallet listeners
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('chainChanged', (chainIdHex) => {
                const chainId = parseInt(chainIdHex, 16);
                this.handleChainChanged(chainId);
            });
        }

        console.log('[ChainManager] Initialized on chain:', this.currentChainId, this.chains[this.currentChainId]?.name);
        return true;
    },

    /**
     * Detect current chain from wallet
     */
    async detectCurrentChain() {
        if (typeof window.ethereum === 'undefined') {
            console.log('[ChainManager] No wallet detected, defaulting to Arbitrum');
            return;
        }

        try {
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);

            if (this.isChainSupported(chainId)) {
                this.currentChainId = chainId;
            } else {
                console.warn('[ChainManager] Unsupported chain:', chainId, '- defaulting to Arbitrum');
            }
        } catch (err) {
            console.error('[ChainManager] Error detecting chain:', err);
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CHAIN OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get current chain ID
     */
    getCurrentChain() {
        return this.currentChainId;
    },

    /**
     * Get chain info by ID
     */
    getChainInfo(chainId) {
        return this.chains[chainId] || null;
    },

    /**
     * Check if chain is supported
     */
    isChainSupported(chainId) {
        return this.chains.hasOwnProperty(chainId);
    },

    /**
     * Get all supported chains
     */
    getSupportedChains() {
        return Object.values(this.chains);
    },

    /**
     * Switch to a different chain
     */
    async switchChain(chainId) {
        console.log('[ChainManager] Switching to chain:', chainId);

        if (!this.isChainSupported(chainId)) {
            throw new Error(`Chain ${chainId} is not supported`);
        }

        if (typeof window.ethereum === 'undefined') {
            throw new Error('No wallet connected');
        }

        const chain = this.chains[chainId];
        const chainIdHex = '0x' + chainId.toString(16);

        try {
            // Try to switch
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }]
            });

            this.currentChainId = chainId;
            console.log('[ChainManager] Switched to', chain.name);
            return true;

        } catch (switchErr) {
            // Chain not added yet, try to add it
            if (switchErr.code === 4902) {
                console.log('[ChainManager] Chain not added, adding now...');
                return await this.addChain(chainId);
            } else {
                throw switchErr;
            }
        }
    },

    /**
     * Add chain to wallet
     */
    async addChain(chainId) {
        if (!this.isChainSupported(chainId)) {
            throw new Error(`Chain ${chainId} is not supported`);
        }

        const chain = this.chains[chainId];
        const chainIdHex = '0x' + chainId.toString(16);

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: chainIdHex,
                    chainName: chain.name,
                    nativeCurrency: chain.nativeCurrency,
                    rpcUrls: [chain.rpc],
                    blockExplorerUrls: [chain.explorer]
                }]
            });

            this.currentChainId = chainId;
            console.log('[ChainManager] Added and switched to', chain.name);
            return true;

        } catch (err) {
            console.error('[ChainManager] Error adding chain:', err);
            throw err;
        }
    },

    /**
     * Handle chain changed event
     */
    handleChainChanged(chainId) {
        console.log('[ChainManager] Chain changed to:', chainId);

        if (this.isChainSupported(chainId)) {
            this.currentChainId = chainId;
            this.updateChainDisplay();

            // Notify listeners
            this.listeners.forEach(callback => {
                try {
                    callback(chainId, this.chains[chainId]);
                } catch (err) {
                    console.error('[ChainManager] Listener error:', err);
                }
            });
        } else {
            console.warn('[ChainManager] Unsupported chain:', chainId);
        }
    },

    /**
     * Register chain change listener
     */
    onChainChanged(callback) {
        this.listeners.push(callback);
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PROVIDER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get provider for a chain (read-only)
     */
    getProvider(chainId) {
        if (!this.isChainSupported(chainId)) {
            throw new Error(`Chain ${chainId} not supported`);
        }

        // Return cached provider if available
        if (this.providers[chainId]) {
            return this.providers[chainId];
        }

        // Create new provider
        const chain = this.chains[chainId];
        const provider = new ethers.JsonRpcProvider(chain.rpc);
        this.providers[chainId] = provider;

        return provider;
    },

    /**
     * Get signer for current chain
     */
    async getSigner() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('No wallet connected');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        return await provider.getSigner();
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // BALANCE TRACKING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get balance for a specific chain
     */
    async getBalance(chainId, address) {
        if (!this.isChainSupported(chainId)) {
            return { native: 0, usdc: 0, weth: 0 };
        }

        try {
            const provider = this.getProvider(chainId);
            const chain = this.chains[chainId];

            // ERC20 ABI
            const erc20Abi = [
                'function balanceOf(address) view returns (uint256)',
                'function decimals() view returns (uint8)'
            ];

            // Get native balance
            const nativeBalanceWei = await provider.getBalance(address);
            const nativeBalance = Number(ethers.formatEther(nativeBalanceWei));

            // Get USDC balance
            const usdcContract = new ethers.Contract(chain.tokens.USDC, erc20Abi, provider);
            const usdcBalanceWei = await usdcContract.balanceOf(address);
            const usdcBalance = Number(ethers.formatUnits(usdcBalanceWei, 6));

            // Get WETH balance
            const wethContract = new ethers.Contract(chain.tokens.WETH, erc20Abi, provider);
            const wethBalanceWei = await wethContract.balanceOf(address);
            const wethBalance = Number(ethers.formatEther(wethBalanceWei));

            const balances = {
                native: nativeBalance,
                usdc: usdcBalance,
                weth: wethBalance,
                chainId: chainId,
                chainName: chain.name
            };

            // Cache balances
            this.balances[chainId] = balances;

            return balances;

        } catch (err) {
            console.error(`[ChainManager] Error fetching balance for chain ${chainId}:`, err);
            return { native: 0, usdc: 0, weth: 0, chainId, error: err.message };
        }
    },

    /**
     * Get balances across all chains
     */
    async getAllBalances(address) {
        console.log('[ChainManager] Fetching balances across all chains...');

        const chainIds = Object.keys(this.chains).map(id => parseInt(id));
        const promises = chainIds.map(chainId => this.getBalance(chainId, address));

        const results = await Promise.all(promises);

        // Calculate totals
        let totalNative = 0;
        let totalUsdc = 0;
        let totalWeth = 0;

        results.forEach(result => {
            totalNative += result.native || 0;
            totalUsdc += result.usdc || 0;
            totalWeth += result.weth || 0;
        });

        return {
            chains: results,
            totals: {
                native: totalNative,
                usdc: totalUsdc,
                weth: totalWeth
            }
        };
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // UI COMPONENTS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Render chain selector dropdown
     */
    renderChainSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[ChainManager] Container not found:', containerId);
            return;
        }

        const currentChain = this.chains[this.currentChainId];

        let html = `
            <div class="chain-selector">
                <label>Network:</label>
                <select id="chain-select" onchange="ChainManager.onChainSelectChange(this.value)">
        `;

        Object.values(this.chains).forEach(chain => {
            const selected = chain.chainId === this.currentChainId ? 'selected' : '';
            html += `
                <option value="${chain.chainId}" ${selected}>
                    ${chain.icon} ${chain.name}
                </option>
            `;
        });

        html += `
                </select>
                <button onclick="ChainManager.switchToSelected()" class="btn-primary">Switch</button>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Handle chain select change
     */
    onChainSelectChange(chainIdStr) {
        // Just store the selection, don't switch yet
        this.selectedChainId = parseInt(chainIdStr);
    },

    /**
     * Switch to selected chain
     */
    async switchToSelected() {
        if (!this.selectedChainId) {
            return;
        }

        try {
            await this.switchChain(this.selectedChainId);
            this.updateChainDisplay();
        } catch (err) {
            console.error('[ChainManager] Switch failed:', err);
            alert('Failed to switch chain: ' + err.message);
        }
    },

    /**
     * Update chain display
     */
    updateChainDisplay() {
        const chain = this.chains[this.currentChainId];

        // Update any elements with class 'current-chain'
        const elements = document.querySelectorAll('.current-chain');
        elements.forEach(el => {
            el.textContent = `${chain.icon} ${chain.name}`;
        });

        // Update chain selector if it exists
        const select = document.getElementById('chain-select');
        if (select) {
            select.value = this.currentChainId;
        }

        console.log('[ChainManager] Display updated to', chain.name);
    },

    /**
     * Render balance summary across chains
     */
    renderBalanceSummary(containerId, balanceData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = `
            <div class="balance-summary">
                <h3>Multi-Chain Balances</h3>
                <div class="total-balance">
                    <div>Total USDC: <strong>$${balanceData.totals.usdc.toFixed(2)}</strong></div>
                    <div>Total ETH: <strong>${balanceData.totals.native.toFixed(4)} ETH</strong></div>
                </div>
                <div class="chain-balances">
        `;

        balanceData.chains.forEach(chainBalance => {
            const chain = this.chains[chainBalance.chainId];
            if (!chain) return;

            html += `
                <div class="chain-balance-item">
                    <div class="chain-name">${chain.icon} ${chain.name}</div>
                    <div class="balance-row">
                        <span>USDC: $${chainBalance.usdc.toFixed(2)}</span>
                        <span>ETH: ${chainBalance.native.toFixed(4)}</span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
};

// Export to window
if (typeof window !== 'undefined') {
    window.ChainManager = ChainManager;
}

console.log('[ChainManager] Module loaded - supporting', Object.keys(ChainManager.chains).length, 'chains');
