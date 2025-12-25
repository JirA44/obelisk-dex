/**
 * Obelisk DEX - Deposit & Withdraw Module
 *
 * Handles deposits and withdrawals for trading on Hyperliquid.
 * Supports direct deposits from connected wallets.
 */

const DepositWithdraw = {
    // Supported networks with their configurations
    NETWORKS: {
        ARBITRUM: {
            name: 'Arbitrum One',
            chainId: 42161,
            icon: '🔵',
            bridge: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
            usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            rpc: 'https://arb1.arbitrum.io/rpc',
            explorer: 'https://arbiscan.io',
            gasEstimate: 0.50,
            depositTime: '~1 min'
        },
        ETHEREUM: {
            name: 'Ethereum',
            chainId: 1,
            icon: '⟠',
            bridge: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
            usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            rpc: 'https://eth.llamarpc.com',
            explorer: 'https://etherscan.io',
            gasEstimate: 5.00,
            depositTime: '~10 min'
        },
        BASE: {
            name: 'Base',
            chainId: 8453,
            icon: '🔷',
            bridge: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
            usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            rpc: 'https://mainnet.base.org',
            explorer: 'https://basescan.org',
            gasEstimate: 0.10,
            depositTime: '~1 min'
        },
        POLYGON: {
            name: 'Polygon',
            chainId: 137,
            icon: '🟣',
            bridge: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
            usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
            rpc: 'https://polygon-rpc.com',
            explorer: 'https://polygonscan.com',
            gasEstimate: 0.05,
            depositTime: '~2 min'
        },
        OPTIMISM: {
            name: 'Optimism',
            chainId: 10,
            icon: '🔴',
            bridge: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
            usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
            rpc: 'https://mainnet.optimism.io',
            explorer: 'https://optimistic.etherscan.io',
            gasEstimate: 0.20,
            depositTime: '~1 min'
        },
        BSC: {
            name: 'BNB Chain',
            chainId: 56,
            icon: '🟡',
            bridge: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
            usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            rpc: 'https://bsc-dataseed.binance.org',
            explorer: 'https://bscscan.com',
            gasEstimate: 0.15,
            depositTime: '~3 min'
        },
        SOLANA: {
            name: 'Solana',
            chainId: 'solana',
            icon: '◎',
            usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC SPL token
            rpc: 'https://api.mainnet-beta.solana.com',
            explorer: 'https://solscan.io',
            gasEstimate: 0.001, // ~0.001 SOL
            depositTime: '~30 sec',
            isNonEVM: true
        }
    },

    // Currently selected network
    selectedNetwork: 'ARBITRUM',

    // Legacy compatibility
    CONTRACTS: {
        ARBITRUM: {
            bridge: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
            usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
        }
    },

    // Minimum deposit amounts
    MIN_DEPOSIT: {
        USDC: 0.1,
        ETH: 0.0001
    },

    // Fee structure
    FEES: {
        deposit: 0,
        withdraw: 1
    },

    // Transaction history
    history: [],

    /**
     * Initialize deposit/withdraw module
     */
    async init() {
        console.log('Initializing Deposit/Withdraw module...');
        await this.loadHistory();
    },

    /**
     * Select network for deposit
     */
    selectNetwork(networkKey) {
        if (!this.NETWORKS[networkKey]) return;

        this.selectedNetwork = networkKey;
        const network = this.NETWORKS[networkKey];

        // Update UI buttons
        document.querySelectorAll('.network-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.network === networkKey);
        });

        // Update gas fee display
        const gasFeeEl = document.getElementById('deposit-gas-fee');
        if (gasFeeEl) {
            gasFeeEl.textContent = `~$${network.gasEstimate.toFixed(2)}`;
        }

        // Try to switch MetaMask network
        this.switchMetaMaskNetwork(networkKey);

        console.log(`[DEPOSIT] Selected network: ${network.name}`);
    },

    /**
     * Switch MetaMask to selected network
     */
    async switchMetaMaskNetwork(networkKey) {
        if (!window.ethereum) return;

        const network = this.NETWORKS[networkKey];
        const chainIdHex = '0x' + network.chainId.toString(16);

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }]
            });
        } catch (error) {
            // If network not added, try to add it
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: chainIdHex,
                            chainName: network.name,
                            rpcUrls: [network.rpc],
                            blockExplorerUrls: [network.explorer],
                            nativeCurrency: {
                                name: networkKey === 'BSC' ? 'BNB' : 'ETH',
                                symbol: networkKey === 'BSC' ? 'BNB' : 'ETH',
                                decimals: 18
                            }
                        }]
                    });
                } catch (addError) {
                    console.error('Failed to add network:', addError);
                }
            }
        }
    },

    /**
     * Get current network config
     */
    getCurrentNetwork() {
        return this.NETWORKS[this.selectedNetwork];
    },

    /**
     * Get USDC balance on Arbitrum
     */
    async getUSDCBalance(address) {
        return await UniswapAPI.getTokenBalance(address, 'USDC');
    },

    /**
     * Get ETH balance on Arbitrum
     */
    async getETHBalance(address) {
        return await UniswapAPI.getTokenBalance(address, 'ETH');
    },

    /**
     * Get Hyperliquid account balance
     */
    async getHyperliquidBalance(address) {
        const accountInfo = await HyperliquidAPI.getAccountInfo(address);
        return accountInfo.accountValue;
    },

    /**
     * Deposit USDC to Hyperliquid
     */
    async depositUSDC(wallet, amount) {
        if (!wallet || !wallet.address) {
            throw new Error('Wallet not connected');
        }

        if (amount < this.MIN_DEPOSIT.USDC) {
            throw new Error(`Minimum deposit is ${this.MIN_DEPOSIT.USDC} USDC`);
        }

        // Check USDC balance
        const balance = await this.getUSDCBalance(wallet.address);
        if (balance < amount) {
            throw new Error(`Insufficient USDC balance. You have ${balance.toFixed(2)} USDC`);
        }

        try {
            // Step 1: Approve USDC spending
            const approvalResult = await this.approveUSDC(wallet, amount);
            if (!approvalResult.success && approvalResult.message !== 'Already approved') {
                throw new Error('Approval failed: ' + approvalResult.message);
            }

            // Step 2: Call deposit function on Hyperliquid bridge
            const depositResult = await this.executeDeposit(wallet, amount);

            // Record transaction
            this.recordTransaction({
                type: 'deposit',
                asset: 'USDC',
                amount: amount,
                txHash: depositResult.txHash,
                status: 'pending',
                timestamp: Date.now()
            });

            return {
                success: true,
                txHash: depositResult.txHash,
                message: `Depositing ${amount} USDC to Hyperliquid...`
            };
        } catch (e) {
            throw new Error('Deposit failed: ' + e.message);
        }
    },

    /**
     * Approve USDC for bridge contract
     */
    async approveUSDC(wallet, amount) {
        const usdcAddress = this.CONTRACTS.ARBITRUM.usdc;
        const bridgeAddress = this.CONTRACTS.ARBITRUM.bridge;

        // Check current allowance
        const currentAllowance = await UniswapAPI.checkAllowance('USDC', wallet.address, bridgeAddress);
        if (currentAllowance >= amount) {
            return { success: true, message: 'Already approved' };
        }

        // Approve max amount
        return await UniswapAPI.approveToken('USDC', bridgeAddress, amount, wallet);
    },

    /**
     * Execute deposit transaction
     */
    async executeDeposit(wallet, amount) {
        const bridgeAddress = this.CONTRACTS.ARBITRUM.bridge;
        const amountWei = BigInt(Math.floor(amount * 1e6)).toString(16);

        // Deposit function selector: deposit(uint64 amount)
        const data = '0x' + 'b6b55f25' + amountWei.padStart(64, '0');

        if (wallet.type === 'metamask' && window.ethereum) {
            try {
                const txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: wallet.address,
                        to: bridgeAddress,
                        data: data,
                        gas: '0x30D40' // 200,000 gas
                    }]
                });

                return { success: true, txHash };
            } catch (e) {
                throw new Error(e.message);
            }
        }

        throw new Error('MetaMask required for deposits');
    },

    /**
     * Withdraw USDC from Hyperliquid
     */
    async withdrawUSDC(wallet, amount) {
        if (!wallet || !wallet.address) {
            throw new Error('Wallet not connected');
        }

        if (amount <= this.FEES.withdraw) {
            throw new Error(`Amount must be greater than $${this.FEES.withdraw} fee`);
        }

        // Check Hyperliquid balance
        const hlBalance = await this.getHyperliquidBalance(wallet.address);
        if (hlBalance < amount) {
            throw new Error(`Insufficient balance on Hyperliquid. You have ${hlBalance.toFixed(2)} USDC`);
        }

        try {
            // Request withdrawal through Hyperliquid API
            const withdrawResult = await this.executeWithdraw(wallet, amount);

            // Record transaction
            this.recordTransaction({
                type: 'withdraw',
                asset: 'USDC',
                amount: amount - this.FEES.withdraw,
                fee: this.FEES.withdraw,
                status: 'pending',
                timestamp: Date.now()
            });

            return {
                success: true,
                message: `Withdrawing ${amount - this.FEES.withdraw} USDC (after $${this.FEES.withdraw} fee)...`
            };
        } catch (e) {
            throw new Error('Withdrawal failed: ' + e.message);
        }
    },

    /**
     * Execute withdrawal on Hyperliquid
     */
    async executeWithdraw(wallet, amount) {
        // Hyperliquid withdrawal requires signing
        // This is a simplified version - full implementation needs EIP-712 signing

        const action = {
            type: 'withdraw3',
            hyperliquidChain: 'Mainnet',
            signatureChainId: '0xa4b1', // Arbitrum
            destination: wallet.address,
            amount: (amount * 1e6).toString(),
            time: Date.now()
        };

        // For MetaMask signing
        if (wallet.type === 'metamask' && window.ethereum) {
            // Create typed data for EIP-712 signing
            const typedData = {
                types: {
                    EIP712Domain: [
                        { name: 'name', type: 'string' },
                        { name: 'version', type: 'string' },
                        { name: 'chainId', type: 'uint256' },
                        { name: 'verifyingContract', type: 'address' }
                    ],
                    'HyperliquidTransaction:Withdraw': [
                        { name: 'hyperliquidChain', type: 'string' },
                        { name: 'destination', type: 'string' },
                        { name: 'amount', type: 'string' },
                        { name: 'time', type: 'uint64' }
                    ]
                },
                primaryType: 'HyperliquidTransaction:Withdraw',
                domain: {
                    name: 'HyperliquidSignTransaction',
                    version: '1',
                    chainId: 42161,
                    verifyingContract: '0x0000000000000000000000000000000000000000'
                },
                message: action
            };

            try {
                const signature = await window.ethereum.request({
                    method: 'eth_signTypedData_v4',
                    params: [wallet.address, JSON.stringify(typedData)]
                });

                // Submit to Hyperliquid
                const response = await fetch('https://api.hyperliquid.xyz/exchange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: action,
                        nonce: Date.now(),
                        signature: signature
                    })
                });

                const result = await response.json();
                if (result.status === 'ok') {
                    return { success: true };
                } else {
                    throw new Error(result.response || 'Withdrawal failed');
                }
            } catch (e) {
                throw new Error(e.message);
            }
        }

        throw new Error('MetaMask required for withdrawals');
    },

    /**
     * Get transaction history
     */
    async loadHistory() {
        try {
            const saved = localStorage.getItem('obelisk_tx_history');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    },

    /**
     * Record transaction
     */
    recordTransaction(tx) {
        this.history.unshift(tx);
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        localStorage.setItem('obelisk_tx_history', JSON.stringify(this.history));
    },

    /**
     * Get recent transactions
     */
    getRecentTransactions(limit = 10) {
        return this.history.slice(0, limit);
    },

    /**
     * Check if address has sufficient USDC for deposit
     */
    async canDeposit(address, amount) {
        const balance = await this.getUSDCBalance(address);
        return {
            canDeposit: balance >= amount,
            balance: balance,
            required: amount,
            shortfall: Math.max(0, amount - balance)
        };
    },

    /**
     * Estimate gas for deposit
     */
    async estimateDepositGas() {
        const gasPrice = await UniswapAPI.getGasPrice();
        const gasLimit = 200000;
        const gasCostETH = (gasLimit * gasPrice) / 1e9;
        const ethPrice = PriceService.getPrice('ETH') || 3500;
        return {
            gasLimit,
            gasPrice,
            gasCostETH,
            gasCostUSD: gasCostETH * ethPrice
        };
    },

    /**
     * Format status for display
     */
    formatStatus(status) {
        const statusMap = {
            pending: { text: 'Pending', class: 'warning' },
            confirmed: { text: 'Confirmed', class: 'success' },
            failed: { text: 'Failed', class: 'danger' }
        };
        return statusMap[status] || { text: status, class: '' };
    }
};

// Export
window.DepositWithdraw = DepositWithdraw;
