// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - AAVE V3 INTEGRATION (Arbitrum)
// Real DeFi lending/borrowing integration
// ═══════════════════════════════════════════════════════════════════════════════

const AaveIntegration = {
    // Multi-chain configuration
    chainConfigs: {
        // Arbitrum (42161)
        42161: {
            pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
            dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
            aUSDC: '0x724dc807b04555b71ed48a6896b6F41593b8C637',
            aUSDCn: '0x48A29E756CC1C085530F6eB8944c0F2fE4BB0109',
            aWETH: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
            aDAI: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE',
            USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            USDCe: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
            WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            rpc: 'https://arb1.arbitrum.io/rpc'
        },
        // Optimism (10)
        10: {
            pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
            USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
            WETH: '0x4200000000000000000000000000000000000006',
            rpc: 'https://mainnet.optimism.io'
        },
        // Base (8453)
        8453: {
            pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
            USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            rpc: 'https://mainnet.base.org'
        }
    },

    // Aave V3 Arbitrum Contracts (backward compatibility)
    contracts: {
        // Aave V3 Pool (main contract for supply/withdraw)
        pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        // Aave V3 Pool Data Provider
        dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
        // aTokens (interest-bearing tokens)
        aUSDC: '0x724dc807b04555b71ed48a6896b6F41593b8C637',
        aUSDCn: '0x48A29E756CC1C085530F6eB8944c0F2fE4BB0109', // Native USDC
        aWETH: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
        aDAI: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE',
        // Underlying tokens
        USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Native USDC
        USDCe: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // Bridged USDC.e
        WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
    },

    // ABI fragments for Aave interactions
    abi: {
        // Pool ABI
        pool: [
            'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
            'function withdraw(address asset, uint256 amount, address to) external returns (uint256)',
            'function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)'
        ],
        // ERC20 ABI
        erc20: [
            'function approve(address spender, uint256 amount) external returns (bool)',
            'function allowance(address owner, address spender) external view returns (uint256)',
            'function balanceOf(address account) external view returns (uint256)',
            'function decimals() external view returns (uint8)'
        ],
        // Data Provider ABI
        dataProvider: [
            'function getUserReserveData(address asset, address user) external view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)',
            'function getReserveData(address asset) external view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)'
        ]
    },

    // Current APY rates (updated from on-chain)
    rates: {
        USDC: { supply: 0, borrow: 0 },
        WETH: { supply: 0, borrow: 0 },
        DAI: { supply: 0, borrow: 0 }
    },

    /**
     * Initialize the integration
     */
    async init() {
        console.log('[Aave] Initializing Aave V3 integration...');

        // Check if ethers is available
        if (typeof ethers === 'undefined') {
            console.error('[Aave] ethers.js not loaded');
            return false;
        }

        // Fetch current rates
        await this.fetchRates();

        console.log('[Aave] Integration ready');
        return true;
    },

    /**
     * Get contracts for a specific chain
     */
    getContractsForChain(chainId) {
        const config = this.chainConfigs[chainId];
        if (!config) {
            throw new Error(`Aave not supported on chain ${chainId}`);
        }
        return config;
    },

    /**
     * Get provider (read-only)
     * @param {number} chainId - Optional chain ID, defaults to current chain
     */
    getProvider(chainId = null) {
        // If no chainId specified, use current chain from ChainManager or default to Arbitrum
        if (!chainId) {
            chainId = (typeof ChainManager !== 'undefined' && ChainManager.getCurrentChain())
                ? ChainManager.getCurrentChain()
                : 42161;
        }

        const config = this.getContractsForChain(chainId);
        const rpcUrl = config.rpc || 'https://arb1.arbitrum.io/rpc';
        return new ethers.JsonRpcProvider(rpcUrl);
    },

    /**
     * Get signer (for transactions)
     */
    async getSigner() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('No wallet connected');
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        return await provider.getSigner();
    },

    /**
     * Fetch current APY rates from Aave
     */
    async fetchRates() {
        try {
            const provider = this.getProvider();
            const dataProvider = new ethers.Contract(
                this.contracts.dataProvider,
                this.abi.dataProvider,
                provider
            );

            // Fetch USDC rates
            const usdcData = await dataProvider.getReserveData(this.contracts.USDC);
            // liquidityRate is in RAY (27 decimals), convert to APY %
            const usdcSupplyRate = Number(usdcData.liquidityRate) / 1e27 * 100;
            this.rates.USDC.supply = usdcSupplyRate;

            console.log('[Aave] Current USDC Supply APY:', usdcSupplyRate.toFixed(2) + '%');

            return this.rates;
        } catch (err) {
            console.error('[Aave] Error fetching rates:', err);
            // Use fallback rates
            this.rates.USDC.supply = 4.5;
            return this.rates;
        }
    },

    /**
     * Get user's Aave position
     */
    async getUserPosition(userAddress) {
        try {
            const provider = this.getProvider();

            // Get aToken balance (supplied amount + interest)
            const aUSDC = new ethers.Contract(this.contracts.aUSDCn, this.abi.erc20, provider);
            const aTokenBalance = await aUSDC.balanceOf(userAddress);
            const decimals = await aUSDC.decimals();

            const suppliedAmount = Number(ethers.formatUnits(aTokenBalance, decimals));

            // Get account data from pool
            const pool = new ethers.Contract(this.contracts.pool, this.abi.pool, provider);
            const accountData = await pool.getUserAccountData(userAddress);

            return {
                supplied: suppliedAmount,
                totalCollateralUSD: Number(ethers.formatUnits(accountData.totalCollateralBase, 8)),
                totalDebtUSD: Number(ethers.formatUnits(accountData.totalDebtBase, 8)),
                healthFactor: Number(ethers.formatUnits(accountData.healthFactor, 18)),
                apy: this.rates.USDC.supply
            };
        } catch (err) {
            console.error('[Aave] Error getting position:', err);
            return { supplied: 0, totalCollateralUSD: 0, totalDebtUSD: 0, healthFactor: 0, apy: 0 };
        }
    },

    /**
     * Supply USDC to Aave (earn interest)
     * @param {number} amount - Amount in USDC (human readable, e.g., 100 for $100)
     * @returns {object} - Transaction result
     */
    async supplyUSDC(amount) {
        console.log('[Aave] Supplying', amount, 'USDC to Aave...');

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            // Convert amount to wei (USDC has 6 decimals)
            const amountWei = ethers.parseUnits(amount.toString(), 6);

            // 1. Check USDC balance
            const usdc = new ethers.Contract(this.contracts.USDC, this.abi.erc20, signer);
            const balance = await usdc.balanceOf(userAddress);

            if (balance < amountWei) {
                throw new Error(`Insufficient USDC balance. Have: ${ethers.formatUnits(balance, 6)}, Need: ${amount}`);
            }

            // 2. Check/Set allowance
            const allowance = await usdc.allowance(userAddress, this.contracts.pool);
            if (allowance < amountWei) {
                console.log('[Aave] Approving USDC spend...');
                const approveTx = await usdc.approve(this.contracts.pool, ethers.MaxUint256);
                await approveTx.wait();
                console.log('[Aave] Approval confirmed');
            }

            // 3. Supply to Aave
            const pool = new ethers.Contract(this.contracts.pool, this.abi.pool, signer);
            console.log('[Aave] Sending supply transaction...');
            const supplyTx = await pool.supply(
                this.contracts.USDC,  // asset
                amountWei,            // amount
                userAddress,          // onBehalfOf
                0                     // referralCode
            );

            console.log('[Aave] Waiting for confirmation...');
            const receipt = await supplyTx.wait();

            console.log('[Aave] Supply successful! TX:', receipt.hash);

            return {
                success: true,
                txHash: receipt.hash,
                amount: amount,
                apy: this.rates.USDC.supply,
                message: `Successfully supplied ${amount} USDC to Aave (${this.rates.USDC.supply.toFixed(2)}% APY)`
            };

        } catch (err) {
            console.error('[Aave] Supply error:', err);
            return {
                success: false,
                error: err.message || 'Supply failed',
                details: err
            };
        }
    },

    /**
     * Withdraw USDC from Aave
     * @param {number} amount - Amount in USDC to withdraw (or 'max' for all)
     */
    async withdrawUSDC(amount) {
        console.log('[Aave] Withdrawing', amount, 'USDC from Aave...');

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            // Get current position
            const position = await this.getUserPosition(userAddress);

            // Determine amount to withdraw
            let amountWei;
            if (amount === 'max' || amount >= position.supplied) {
                amountWei = ethers.MaxUint256; // Withdraw all
                amount = position.supplied;
            } else {
                amountWei = ethers.parseUnits(amount.toString(), 6);
            }

            // Withdraw from Aave
            const pool = new ethers.Contract(this.contracts.pool, this.abi.pool, signer);
            console.log('[Aave] Sending withdraw transaction...');
            const withdrawTx = await pool.withdraw(
                this.contracts.USDC,
                amountWei,
                userAddress
            );

            console.log('[Aave] Waiting for confirmation...');
            const receipt = await withdrawTx.wait();

            console.log('[Aave] Withdraw successful! TX:', receipt.hash);

            return {
                success: true,
                txHash: receipt.hash,
                amount: amount,
                message: `Successfully withdrew ${amount.toFixed(2)} USDC from Aave`
            };

        } catch (err) {
            console.error('[Aave] Withdraw error:', err);
            return {
                success: false,
                error: err.message || 'Withdraw failed'
            };
        }
    },

    /**
     * Get estimated earnings for an amount
     */
    getEstimatedEarnings(amount, days = 365) {
        const apy = this.rates.USDC.supply || 4.5;
        const dailyRate = apy / 365 / 100;
        const earnings = amount * dailyRate * days;
        return {
            daily: amount * dailyRate,
            weekly: amount * dailyRate * 7,
            monthly: amount * dailyRate * 30,
            yearly: earnings,
            apy: apy
        };
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // MULTI-CHAIN METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Supply USDC to Aave on a specific chain
     * @param {number} chainId - Target chain ID
     * @param {string} asset - Asset symbol ('USDC', 'WETH', etc)
     * @param {number} amount - Amount in human readable format
     */
    async supplyOnChain(chainId, asset, amount) {
        console.log(`[Aave] Supplying ${amount} ${asset} on chain ${chainId}...`);

        // Check if we're on the right chain
        const currentChain = typeof ChainManager !== 'undefined'
            ? ChainManager.getCurrentChain()
            : null;

        if (currentChain !== chainId) {
            // Try to switch to the target chain
            if (typeof ChainManager !== 'undefined') {
                console.log(`[Aave] Switching from chain ${currentChain} to ${chainId}...`);
                await ChainManager.switchChain(chainId);
            } else {
                throw new Error(`Must be on chain ${chainId} to supply. Current chain: ${currentChain}`);
            }
        }

        try {
            const config = this.getContractsForChain(chainId);
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            // Get token address
            const tokenAddress = config[asset];
            if (!tokenAddress) {
                throw new Error(`${asset} not supported on chain ${chainId}`);
            }

            // Determine decimals
            const decimals = asset === 'USDC' ? 6 : 18;
            const amountWei = ethers.parseUnits(amount.toString(), decimals);

            // 1. Check balance
            const token = new ethers.Contract(tokenAddress, this.abi.erc20, signer);
            const balance = await token.balanceOf(userAddress);

            if (balance < amountWei) {
                throw new Error(`Insufficient ${asset} balance. Have: ${ethers.formatUnits(balance, decimals)}, Need: ${amount}`);
            }

            // 2. Check/Set allowance
            const allowance = await token.allowance(userAddress, config.pool);
            if (allowance < amountWei) {
                console.log(`[Aave] Approving ${asset} spend...`);
                const approveTx = await token.approve(config.pool, ethers.MaxUint256);
                await approveTx.wait();
                console.log('[Aave] Approval confirmed');
            }

            // 3. Supply to Aave
            const pool = new ethers.Contract(config.pool, this.abi.pool, signer);
            console.log('[Aave] Sending supply transaction...');
            const supplyTx = await pool.supply(
                tokenAddress,
                amountWei,
                userAddress,
                0
            );

            console.log('[Aave] Waiting for confirmation...');
            const receipt = await supplyTx.wait();

            console.log('[Aave] Supply successful! TX:', receipt.hash);

            return {
                success: true,
                txHash: receipt.hash,
                chainId: chainId,
                asset: asset,
                amount: amount,
                message: `Successfully supplied ${amount} ${asset} to Aave on chain ${chainId}`
            };

        } catch (err) {
            console.error('[Aave] Supply error:', err);
            return {
                success: false,
                error: err.message || 'Supply failed',
                chainId: chainId,
                details: err
            };
        }
    },

    /**
     * Withdraw from Aave on a specific chain
     * @param {number} chainId - Target chain ID
     * @param {string} asset - Asset symbol ('USDC', 'WETH', etc)
     * @param {number} amount - Amount to withdraw (or 'max')
     */
    async withdrawFromChain(chainId, asset, amount) {
        console.log(`[Aave] Withdrawing ${amount} ${asset} from chain ${chainId}...`);

        // Check if we're on the right chain
        const currentChain = typeof ChainManager !== 'undefined'
            ? ChainManager.getCurrentChain()
            : null;

        if (currentChain !== chainId) {
            // Try to switch to the target chain
            if (typeof ChainManager !== 'undefined') {
                console.log(`[Aave] Switching from chain ${currentChain} to ${chainId}...`);
                await ChainManager.switchChain(chainId);
            } else {
                throw new Error(`Must be on chain ${chainId} to withdraw. Current chain: ${currentChain}`);
            }
        }

        try {
            const config = this.getContractsForChain(chainId);
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            // Get token address
            const tokenAddress = config[asset];
            if (!tokenAddress) {
                throw new Error(`${asset} not supported on chain ${chainId}`);
            }

            // Determine decimals and amount
            const decimals = asset === 'USDC' ? 6 : 18;
            let amountWei;

            if (amount === 'max') {
                amountWei = ethers.MaxUint256;
            } else {
                amountWei = ethers.parseUnits(amount.toString(), decimals);
            }

            // Withdraw from Aave
            const pool = new ethers.Contract(config.pool, this.abi.pool, signer);
            console.log('[Aave] Sending withdraw transaction...');
            const withdrawTx = await pool.withdraw(
                tokenAddress,
                amountWei,
                userAddress
            );

            console.log('[Aave] Waiting for confirmation...');
            const receipt = await withdrawTx.wait();

            console.log('[Aave] Withdraw successful! TX:', receipt.hash);

            return {
                success: true,
                txHash: receipt.hash,
                chainId: chainId,
                asset: asset,
                amount: amount,
                message: `Successfully withdrew ${amount} ${asset} from Aave on chain ${chainId}`
            };

        } catch (err) {
            console.error('[Aave] Withdraw error:', err);
            return {
                success: false,
                error: err.message || 'Withdraw failed',
                chainId: chainId,
                details: err
            };
        }
    },

    /**
     * Get supported chains for Aave
     */
    getSupportedChains() {
        return Object.keys(this.chainConfigs).map(id => parseInt(id));
    },

    /**
     * Check if Aave is available on a chain
     */
    isChainSupported(chainId) {
        return this.chainConfigs.hasOwnProperty(chainId);
    }
};

// Auto-init when DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        AaveIntegration.init();
    });
}

// Export
if (typeof window !== 'undefined') {
    window.AaveIntegration = AaveIntegration;
}

console.log('[Aave] Module loaded with multi-chain support:', Object.keys(AaveIntegration.chainConfigs).length, 'chains');
