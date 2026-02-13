// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - GMX/GLP INTEGRATION (Arbitrum)
// Real yield from perpetual trading fees
// ═══════════════════════════════════════════════════════════════════════════════

const GMXIntegration = {
    // GMX Arbitrum Contracts
    contracts: {
        // GLP Token
        glp: '0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258',
        // Fee GLP (staked GLP that earns fees)
        fsGLP: '0x1aDDD80E6039594eE970E5872D247bf0414C8903',
        // GLP Manager (for minting/redeeming GLP)
        glpManager: '0x3963FfC9dff443c2A94f21b129D429891E32ec18',
        // Reward Router (for staking/claiming)
        rewardRouter: '0xA906F338CB21815cBc4Bc87ace9e68c87eF8d8F1',
        // GLP Reward Router V2
        rewardRouterV2: '0xB95DB5B167D75e6d04227CfFFA61069348d271F5',
        // Vault (for prices)
        vault: '0x489ee077994B6658eAfA855C308275EAd8097C4A',
        // Tokens
        USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        USDCe: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    },

    // ABI fragments
    abi: {
        rewardRouter: [
            'function mintAndStakeGlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minGlp) external returns (uint256)',
            'function unstakeAndRedeemGlp(address _tokenOut, uint256 _glpAmount, uint256 _minOut, address _receiver) external returns (uint256)',
            'function claimFees() external',
            'function claimEsGmx() external',
            'function compound() external'
        ],
        glpManager: [
            'function getPrice(bool _maximise) external view returns (uint256)',
            'function getAum(bool _maximise) external view returns (uint256)',
            'function getAumInUsdg(bool _maximise) external view returns (uint256)'
        ],
        erc20: [
            'function approve(address spender, uint256 amount) external returns (bool)',
            'function allowance(address owner, address spender) external view returns (uint256)',
            'function balanceOf(address account) external view returns (uint256)',
            'function decimals() external view returns (uint8)'
        ],
        fsGLP: [
            'function balanceOf(address account) external view returns (uint256)',
            'function claimable(address account) external view returns (uint256)'
        ]
    },

    // Current stats
    stats: {
        glpPrice: 0,
        aum: 0,
        apr: 0  // ETH + esGMX rewards
    },

    /**
     * Initialize GMX integration
     */
    async init() {
        console.log('[GMX] Initializing GMX/GLP integration...');

        if (typeof ethers === 'undefined') {
            console.error('[GMX] ethers.js not loaded');
            return false;
        }

        await this.fetchStats();
        console.log('[GMX] Integration ready');
        return true;
    },

    /**
     * Get provider
     */
    getProvider() {
        return new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
    },

    /**
     * Get signer
     */
    async getSigner() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('No wallet connected');
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        return await provider.getSigner();
    },

    /**
     * Fetch current GLP stats
     */
    async fetchStats() {
        try {
            const provider = this.getProvider();

            // Get GLP price from manager
            const glpManager = new ethers.Contract(
                this.contracts.glpManager,
                this.abi.glpManager,
                provider
            );

            const price = await glpManager.getPrice(false); // Use min price
            this.stats.glpPrice = Number(ethers.formatUnits(price, 30));

            const aum = await glpManager.getAum(false);
            this.stats.aum = Number(ethers.formatUnits(aum, 30));

            // APR is typically 15-25% (ETH fees + esGMX)
            // This would need to be fetched from GMX stats API for real-time
            this.stats.apr = 18; // Conservative estimate

            console.log('[GMX] GLP Price:', this.stats.glpPrice.toFixed(4));
            console.log('[GMX] AUM:', (this.stats.aum / 1e9).toFixed(2), 'B');
            console.log('[GMX] Estimated APR:', this.stats.apr + '%');

            return this.stats;
        } catch (err) {
            console.error('[GMX] Error fetching stats:', err);
            this.stats.glpPrice = 1.0;
            this.stats.apr = 18;
            return this.stats;
        }
    },

    /**
     * Get user's GLP position
     */
    async getUserPosition(userAddress) {
        try {
            const provider = this.getProvider();

            // Get staked GLP balance (fsGLP)
            const fsGLP = new ethers.Contract(this.contracts.fsGLP, this.abi.fsGLP, provider);
            const stakedBalance = await fsGLP.balanceOf(userAddress);
            const stakedGLP = Number(ethers.formatUnits(stakedBalance, 18));

            // Calculate USD value
            const usdValue = stakedGLP * this.stats.glpPrice;

            // Get claimable rewards
            let claimableETH = 0;
            try {
                const claimable = await fsGLP.claimable(userAddress);
                claimableETH = Number(ethers.formatUnits(claimable, 18));
            } catch (e) {
                // Some versions don't have claimable
            }

            return {
                stakedGLP: stakedGLP,
                usdValue: usdValue,
                claimableETH: claimableETH,
                apr: this.stats.apr
            };
        } catch (err) {
            console.error('[GMX] Error getting position:', err);
            return { stakedGLP: 0, usdValue: 0, claimableETH: 0, apr: 0 };
        }
    },

    /**
     * Buy and stake GLP with USDC
     * @param {number} amount - USDC amount to convert to GLP
     */
    async buyAndStakeGLP(amount) {
        console.log('[GMX] Buying', amount, 'USDC worth of GLP...');

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            const amountWei = ethers.parseUnits(amount.toString(), 6);

            // 1. Check USDC balance
            const usdc = new ethers.Contract(this.contracts.USDCe, this.abi.erc20, signer);
            const balance = await usdc.balanceOf(userAddress);

            if (balance < amountWei) {
                // Try native USDC
                const usdcNative = new ethers.Contract(this.contracts.USDC, this.abi.erc20, signer);
                const balanceNative = await usdcNative.balanceOf(userAddress);
                if (balanceNative < amountWei) {
                    throw new Error(`Insufficient USDC. Have: ${ethers.formatUnits(balance, 6)}`);
                }
            }

            // 2. Approve GLP Manager
            const allowance = await usdc.allowance(userAddress, this.contracts.glpManager);
            if (allowance < amountWei) {
                console.log('[GMX] Approving USDC...');
                const approveTx = await usdc.approve(this.contracts.glpManager, ethers.MaxUint256);
                await approveTx.wait();
            }

            // 3. Mint and stake GLP
            const rewardRouter = new ethers.Contract(
                this.contracts.rewardRouterV2,
                this.abi.rewardRouter,
                signer
            );

            // Calculate min GLP (with 1% slippage)
            const expectedGLP = amount / this.stats.glpPrice;
            const minGLP = ethers.parseUnits((expectedGLP * 0.99).toFixed(18), 18);
            const minUSDG = ethers.parseUnits((amount * 0.99).toFixed(18), 18);

            console.log('[GMX] Minting GLP...');
            const tx = await rewardRouter.mintAndStakeGlp(
                this.contracts.USDCe,
                amountWei,
                minUSDG,
                minGLP
            );

            const receipt = await tx.wait();
            console.log('[GMX] GLP purchase successful! TX:', receipt.hash);

            return {
                success: true,
                txHash: receipt.hash,
                amount: amount,
                expectedGLP: expectedGLP,
                apr: this.stats.apr,
                message: `Staked ~${expectedGLP.toFixed(2)} GLP (${this.stats.apr}% APR)`
            };

        } catch (err) {
            console.error('[GMX] Buy GLP error:', err);
            return {
                success: false,
                error: err.message || 'Failed to buy GLP'
            };
        }
    },

    /**
     * Unstake and sell GLP for USDC
     */
    async sellGLP(glpAmount, tokenOut = 'USDC') {
        console.log('[GMX] Selling', glpAmount, 'GLP...');

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            const tokenAddress = tokenOut === 'USDC' ? this.contracts.USDC : this.contracts.USDCe;
            const glpWei = ethers.parseUnits(glpAmount.toString(), 18);

            // Calculate min USDC out (with 1% slippage)
            const expectedUSDC = glpAmount * this.stats.glpPrice;
            const minOut = ethers.parseUnits((expectedUSDC * 0.99).toFixed(6), 6);

            const rewardRouter = new ethers.Contract(
                this.contracts.rewardRouterV2,
                this.abi.rewardRouter,
                signer
            );

            console.log('[GMX] Unstaking and redeeming...');
            const tx = await rewardRouter.unstakeAndRedeemGlp(
                tokenAddress,
                glpWei,
                minOut,
                userAddress
            );

            const receipt = await tx.wait();
            console.log('[GMX] Sell successful! TX:', receipt.hash);

            return {
                success: true,
                txHash: receipt.hash,
                glpSold: glpAmount,
                usdcReceived: expectedUSDC,
                message: `Received ~${expectedUSDC.toFixed(2)} USDC`
            };

        } catch (err) {
            console.error('[GMX] Sell GLP error:', err);
            return {
                success: false,
                error: err.message || 'Failed to sell GLP'
            };
        }
    },

    /**
     * Claim ETH rewards
     */
    async claimRewards() {
        try {
            const signer = await this.getSigner();
            const rewardRouter = new ethers.Contract(
                this.contracts.rewardRouterV2,
                this.abi.rewardRouter,
                signer
            );

            console.log('[GMX] Claiming rewards...');
            const tx = await rewardRouter.claimFees();
            const receipt = await tx.wait();

            return {
                success: true,
                txHash: receipt.hash,
                message: 'Rewards claimed successfully'
            };
        } catch (err) {
            console.error('[GMX] Claim error:', err);
            return { success: false, error: err.message };
        }
    },

    /**
     * Compound rewards (reinvest esGMX)
     */
    async compoundRewards() {
        try {
            const signer = await this.getSigner();
            const rewardRouter = new ethers.Contract(
                this.contracts.rewardRouterV2,
                this.abi.rewardRouter,
                signer
            );

            console.log('[GMX] Compounding rewards...');
            const tx = await rewardRouter.compound();
            const receipt = await tx.wait();

            return {
                success: true,
                txHash: receipt.hash,
                message: 'Rewards compounded'
            };
        } catch (err) {
            console.error('[GMX] Compound error:', err);
            return { success: false, error: err.message };
        }
    },

    /**
     * Get estimated earnings
     */
    getEstimatedEarnings(amount, days = 365) {
        const apr = this.stats.apr || 18;
        const dailyRate = apr / 365 / 100;
        return {
            daily: amount * dailyRate,
            weekly: amount * dailyRate * 7,
            monthly: amount * dailyRate * 30,
            yearly: amount * dailyRate * days,
            apr: apr
        };
    }
};

// Auto-init
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        GMXIntegration.init();
    });
}

if (typeof window !== 'undefined') {
    window.GMXIntegration = GMXIntegration;
}

console.log('[GMX] Module loaded');
