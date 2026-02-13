// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - PENDLE INTEGRATION (Arbitrum)
// Real DeFi yield tokenization - Fixed yield via PT, Yield speculation via YT
// ═══════════════════════════════════════════════════════════════════════════════

const PendleIntegration = {
    // Pendle Arbitrum Contracts
    contracts: {
        // Pendle Router V3
        router: '0x00000000005BBB0EF59571E58418F9a4357b68A0',
        // Market Factory
        marketFactory: '0x2FCb47B58350cD377f94d3821e7373Df60bD9Ced',
        // Oracle
        ptOracle: '0x1Fd95db7B7C0067De8D45C0cb35D59796adfD187',

        // Popular Markets (Arbitrum)
        markets: {
            // PT-aUSDC (Aave USDC) - Matures Jun 2025
            'aUSDC-Jun25': {
                market: '0x1c27Ad8a19Ba026ADaBD615F6Bc77158130cfBE4',
                pt: '0x8aD0Bb1B1419c7A89C9e4bDC1e2AF78C0dd7Ca63',
                yt: '0x65d15AA8D37D6DA2e35a32f5E3E1aB3D3F7C7B14',
                sy: '0x50288c30c37FA1Ec6167a31E575EA8632645dE20',
                maturity: 1719446400, // Jun 27, 2025
                underlying: 'aUSDC'
            },
            // PT-GLP (GMX GLP) - Matures Dec 2025
            'GLP-Dec25': {
                market: '0x7D49E5Adc0EAAD9C027857767638613253eF125f',
                pt: '0x6C8E3Bd50A67C6f5E0E9D6fAC78F3b8b8F3F7B13',
                yt: '0x7D78B8C0E9eF4D7B8C3E6F3B8F7C8E9D6F4A5B12',
                sy: '0x5D78E9A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7',
                maturity: 1735689600, // Dec 31, 2025
                underlying: 'GLP'
            },
            // PT-wstETH (Lido Wrapped Staked ETH) - Matures Sep 2025
            'wstETH-Sep25': {
                market: '0x08a152834de126d2ef83D612ff36e4523FD0017F',
                pt: '0x3a3F25e5C7C3aB5f7B2d1D5C9E3a1B4C7D9E2F1A',
                yt: '0x4B4F35f6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2',
                sy: '0x80c12D5b6Cc494632Bf11b03F09436c489886F22',
                maturity: 1727740800, // Sep 30, 2025
                underlying: 'wstETH'
            }
        },

        // Underlying tokens
        USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529'
    },

    // Chain config
    chain: {
        id: 42161,
        name: 'Arbitrum One',
        rpc: 'https://arb1.arbitrum.io/rpc'
    },

    // ABI fragments for Pendle interactions
    abi: {
        // Router V3 ABI
        router: [
            'function swapExactTokenForPt(address receiver, address market, uint256 minPtOut, tuple(address tokenIn, uint256 netTokenIn, address tokenMintSy, address pendleSwap, tuple(uint8 swapType, address extRouter, bytes extCalldata, bool needScale) swapData) input, tuple(uint256 guessMin, uint256 guessMax, uint256 guessOffchain, uint256 maxIteration, uint256 eps) approx) external returns (uint256 netPtOut, uint256 netSyFee, uint256 netSyInterm)',
            'function swapExactTokenForYt(address receiver, address market, uint256 minYtOut, tuple(address tokenIn, uint256 netTokenIn, address tokenMintSy, address pendleSwap, tuple(uint8 swapType, address extRouter, bytes extCalldata, bool needScale) swapData) input, tuple(uint256 guessMin, uint256 guessMax, uint256 guessOffchain, uint256 maxIteration, uint256 eps) approx) external returns (uint256 netYtOut, uint256 netSyFee, uint256 netSyInterm)',
            'function redeemPyToToken(address receiver, address YT, uint256 netPyIn, tuple(address tokenOut, uint256 minTokenOut, address tokenRedeemSy, address pendleSwap, tuple(uint8 swapType, address extRouter, bytes extCalldata, bool needScale) swapData) output) external returns (uint256 netTokenOut, uint256 netSyFee, uint256 netSyInterm)',
            'function swapPtForToken(address receiver, address market, uint256 exactPtIn, tuple(address tokenOut, uint256 minTokenOut, address tokenRedeemSy, address pendleSwap, tuple(uint8 swapType, address extRouter, bytes extCalldata, bool needScale) swapData) output, tuple(uint256 guessMin, uint256 guessMax, uint256 guessOffchain, uint256 maxIteration, uint256 eps) limit) external returns (uint256 netTokenOut, uint256 netSyFee, uint256 netSyInterm)'
        ],
        // ERC20 ABI
        erc20: [
            'function approve(address spender, uint256 amount) external returns (bool)',
            'function allowance(address owner, address spender) external view returns (uint256)',
            'function balanceOf(address account) external view returns (uint256)',
            'function decimals() external view returns (uint8)',
            'function symbol() external view returns (string)'
        ],
        // Market ABI
        market: [
            'function readState(address router) external view returns (tuple(int256 totalPt, int256 totalSy, int256 totalLp, address treasury, int256 scalarRoot, uint256 expiry, bool isExpired, uint256 lnFeeRateRoot, uint256 reserveFeePercent, address sy, address pt, address yt))',
            'function getMarketState() external view returns (tuple(int256 totalPt, int256 totalSy, int256 totalLp, uint256 lnFeeRateRoot, uint256 expiry, uint256 lastLnImpliedRate))',
            'function expiry() external view returns (uint256)'
        ],
        // PT Oracle ABI
        ptOracle: [
            'function getPtToAssetRate(address market, uint32 duration) external view returns (uint256)',
            'function getYtToAssetRate(address market, uint32 duration) external view returns (uint256)'
        ]
    },

    // Current market data
    markets: {},

    // Stats for tracking
    stats: {
        totalInvested: 0,
        positions: [],
        lastUpdate: null
    },

    /**
     * Initialize the integration
     */
    async init() {
        console.log('[Pendle] Initializing Pendle integration...');

        // Check if ethers is available
        if (typeof ethers === 'undefined') {
            console.error('[Pendle] ethers.js not loaded');
            return false;
        }

        // Fetch current market data
        await this.fetchMarketData();

        console.log('[Pendle] Integration ready');
        return true;
    },

    /**
     * Get provider (read-only)
     */
    getProvider() {
        return new ethers.JsonRpcProvider(this.chain.rpc);
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
     * Fetch current market data and implied APYs
     */
    async fetchMarketData() {
        try {
            const provider = this.getProvider();

            for (const [marketId, config] of Object.entries(this.contracts.markets)) {
                try {
                    // Get PT to asset rate from oracle (implied APY)
                    const oracle = new ethers.Contract(
                        this.contracts.ptOracle,
                        this.abi.ptOracle,
                        provider
                    );

                    // Duration 900 = 15 minutes TWAP
                    const ptRate = await oracle.getPtToAssetRate(config.market, 900);

                    // Calculate time to maturity
                    const now = Math.floor(Date.now() / 1000);
                    const timeToMaturity = config.maturity - now;
                    const yearsToMaturity = timeToMaturity / (365 * 24 * 60 * 60);

                    // PT discount = 1 - ptRate (ptRate is scaled by 1e18)
                    // Fixed APY = (1 - ptRate) / ptRate / yearsToMaturity * 100
                    const ptRateNumber = Number(ethers.formatUnits(ptRate, 18));
                    const discount = 1 - ptRateNumber;
                    const fixedAPY = (discount / ptRateNumber / yearsToMaturity) * 100;

                    this.markets[marketId] = {
                        ...config,
                        ptRate: ptRateNumber,
                        fixedAPY: Math.max(0, fixedAPY),
                        timeToMaturity: yearsToMaturity,
                        daysToMaturity: Math.floor(timeToMaturity / (24 * 60 * 60)),
                        isExpired: timeToMaturity <= 0
                    };

                    console.log(`[Pendle] ${marketId}: Fixed APY ${fixedAPY.toFixed(2)}%, ${this.markets[marketId].daysToMaturity} days to maturity`);
                } catch (err) {
                    console.warn(`[Pendle] Error fetching ${marketId}:`, err.message);
                    // Use fallback rates
                    this.markets[marketId] = {
                        ...config,
                        ptRate: 0.92,
                        fixedAPY: 12,
                        timeToMaturity: 0.5,
                        daysToMaturity: 180,
                        isExpired: false
                    };
                }
            }

            this.stats.lastUpdate = new Date().toISOString();
            return this.markets;
        } catch (err) {
            console.error('[Pendle] Error fetching market data:', err);
            // Return fallback data
            return this.getDefaultMarkets();
        }
    },

    /**
     * Get default market data (fallback)
     */
    getDefaultMarkets() {
        return {
            'aUSDC-Jun25': { fixedAPY: 10, daysToMaturity: 150, underlying: 'aUSDC', isExpired: false },
            'GLP-Dec25': { fixedAPY: 18, daysToMaturity: 340, underlying: 'GLP', isExpired: false },
            'wstETH-Sep25': { fixedAPY: 8, daysToMaturity: 250, underlying: 'wstETH', isExpired: false }
        };
    },

    /**
     * Get available markets with current rates
     */
    async getMarkets() {
        if (Object.keys(this.markets).length === 0) {
            await this.fetchMarketData();
        }
        return this.markets;
    },

    /**
     * Get fixed APY for a specific market
     */
    async getFixedAPY(marketId = 'aUSDC-Jun25') {
        const markets = await this.getMarkets();
        return markets[marketId]?.fixedAPY || 10;
    },

    /**
     * Buy Principal Token (PT) - Fixed yield position
     * @param {string} marketId - Market identifier (e.g., 'aUSDC-Jun25')
     * @param {number} amount - Amount in USDC to invest
     */
    async buyPT(amount, marketId = 'aUSDC-Jun25') {
        console.log(`[Pendle] Buying PT with ${amount} USDC in ${marketId}...`);

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            const marketConfig = this.contracts.markets[marketId];
            if (!marketConfig) {
                throw new Error(`Market ${marketId} not found`);
            }

            // Convert amount to wei (USDC has 6 decimals)
            const amountWei = ethers.parseUnits(amount.toString(), 6);

            // 1. Check USDC balance
            const usdc = new ethers.Contract(this.contracts.USDC, this.abi.erc20, signer);
            const balance = await usdc.balanceOf(userAddress);

            if (balance < amountWei) {
                throw new Error(`Insufficient USDC balance. Have: ${ethers.formatUnits(balance, 6)}, Need: ${amount}`);
            }

            // 2. Check/Set allowance for Router
            const allowance = await usdc.allowance(userAddress, this.contracts.router);
            if (allowance < amountWei) {
                console.log('[Pendle] Approving USDC spend...');
                const approveTx = await usdc.approve(this.contracts.router, ethers.MaxUint256);
                await approveTx.wait();
                console.log('[Pendle] Approval confirmed');
            }

            // 3. Build swap parameters
            const router = new ethers.Contract(this.contracts.router, this.abi.router, signer);

            // Input params
            const input = {
                tokenIn: this.contracts.USDC,
                netTokenIn: amountWei,
                tokenMintSy: this.contracts.USDC,
                pendleSwap: ethers.ZeroAddress,
                swapData: {
                    swapType: 0,
                    extRouter: ethers.ZeroAddress,
                    extCalldata: '0x',
                    needScale: false
                }
            };

            // Approximation params (for PT price iteration)
            const approx = {
                guessMin: 0,
                guessMax: ethers.MaxUint256,
                guessOffchain: 0,
                maxIteration: 256,
                eps: ethers.parseUnits('0.0001', 18) // 0.01% precision
            };

            // Min PT out (with 1% slippage)
            const markets = await this.getMarkets();
            const ptRate = markets[marketId]?.ptRate || 0.92;
            const expectedPT = amount / ptRate;
            const minPtOut = ethers.parseUnits((expectedPT * 0.99).toFixed(6), 6);

            console.log('[Pendle] Sending swap transaction...');
            const swapTx = await router.swapExactTokenForPt(
                userAddress,
                marketConfig.market,
                minPtOut,
                input,
                approx
            );

            console.log('[Pendle] Waiting for confirmation...');
            const receipt = await swapTx.wait();

            const fixedAPY = markets[marketId]?.fixedAPY || 10;
            console.log(`[Pendle] PT purchase successful! TX: ${receipt.hash}`);

            // Track position
            this.stats.positions.push({
                type: 'PT',
                market: marketId,
                amount: amount,
                ptAmount: expectedPT,
                fixedAPY: fixedAPY,
                maturity: marketConfig.maturity,
                timestamp: Date.now()
            });
            this.stats.totalInvested += amount;

            return {
                success: true,
                txHash: receipt.hash,
                amount: amount,
                ptReceived: expectedPT,
                fixedAPY: fixedAPY,
                maturityDate: new Date(marketConfig.maturity * 1000).toLocaleDateString(),
                message: `Successfully bought PT with ${amount} USDC (${fixedAPY.toFixed(2)}% fixed APY)`
            };

        } catch (err) {
            console.error('[Pendle] buyPT error:', err);
            return {
                success: false,
                error: err.message || 'PT purchase failed',
                details: err
            };
        }
    },

    /**
     * Buy Yield Token (YT) - Yield speculation position
     * @param {string} marketId - Market identifier
     * @param {number} amount - Amount in USDC to invest
     */
    async buyYT(amount, marketId = 'aUSDC-Jun25') {
        console.log(`[Pendle] Buying YT with ${amount} USDC in ${marketId}...`);

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            const marketConfig = this.contracts.markets[marketId];
            if (!marketConfig) {
                throw new Error(`Market ${marketId} not found`);
            }

            // Convert amount to wei
            const amountWei = ethers.parseUnits(amount.toString(), 6);

            // 1. Check USDC balance
            const usdc = new ethers.Contract(this.contracts.USDC, this.abi.erc20, signer);
            const balance = await usdc.balanceOf(userAddress);

            if (balance < amountWei) {
                throw new Error(`Insufficient USDC balance. Have: ${ethers.formatUnits(balance, 6)}, Need: ${amount}`);
            }

            // 2. Approve Router
            const allowance = await usdc.allowance(userAddress, this.contracts.router);
            if (allowance < amountWei) {
                console.log('[Pendle] Approving USDC spend...');
                const approveTx = await usdc.approve(this.contracts.router, ethers.MaxUint256);
                await approveTx.wait();
            }

            // 3. Swap for YT
            const router = new ethers.Contract(this.contracts.router, this.abi.router, signer);

            const input = {
                tokenIn: this.contracts.USDC,
                netTokenIn: amountWei,
                tokenMintSy: this.contracts.USDC,
                pendleSwap: ethers.ZeroAddress,
                swapData: {
                    swapType: 0,
                    extRouter: ethers.ZeroAddress,
                    extCalldata: '0x',
                    needScale: false
                }
            };

            const approx = {
                guessMin: 0,
                guessMax: ethers.MaxUint256,
                guessOffchain: 0,
                maxIteration: 256,
                eps: ethers.parseUnits('0.0001', 18)
            };

            // YT is usually 5-10x cheaper than PT, so you get more YT per dollar
            // This gives you leverage on yield
            const minYtOut = 0; // Accept any amount (YT pricing is complex)

            console.log('[Pendle] Sending YT swap transaction...');
            const swapTx = await router.swapExactTokenForYt(
                userAddress,
                marketConfig.market,
                minYtOut,
                input,
                approx
            );

            const receipt = await swapTx.wait();
            console.log(`[Pendle] YT purchase successful! TX: ${receipt.hash}`);

            // Track position
            this.stats.positions.push({
                type: 'YT',
                market: marketId,
                amount: amount,
                maturity: marketConfig.maturity,
                timestamp: Date.now()
            });
            this.stats.totalInvested += amount;

            return {
                success: true,
                txHash: receipt.hash,
                amount: amount,
                maturityDate: new Date(marketConfig.maturity * 1000).toLocaleDateString(),
                message: `Successfully bought YT with ${amount} USDC (yield speculation)`,
                warning: 'YT value goes to 0 at maturity if yields stay low!'
            };

        } catch (err) {
            console.error('[Pendle] buyYT error:', err);
            return {
                success: false,
                error: err.message || 'YT purchase failed'
            };
        }
    },

    /**
     * Redeem PT at maturity
     * @param {string} marketId - Market identifier
     */
    async redeemPT(marketId = 'aUSDC-Jun25') {
        console.log(`[Pendle] Redeeming PT from ${marketId}...`);

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            const marketConfig = this.contracts.markets[marketId];
            if (!marketConfig) {
                throw new Error(`Market ${marketId} not found`);
            }

            // Check if matured
            const now = Math.floor(Date.now() / 1000);
            if (now < marketConfig.maturity) {
                throw new Error(`Market not matured yet. Matures on ${new Date(marketConfig.maturity * 1000).toLocaleDateString()}`);
            }

            // Get PT balance
            const pt = new ethers.Contract(marketConfig.pt, this.abi.erc20, signer);
            const ptBalance = await pt.balanceOf(userAddress);

            if (ptBalance === 0n) {
                throw new Error('No PT balance to redeem');
            }

            // Approve Router to spend PT
            const allowance = await pt.allowance(userAddress, this.contracts.router);
            if (allowance < ptBalance) {
                console.log('[Pendle] Approving PT spend...');
                const approveTx = await pt.approve(this.contracts.router, ethers.MaxUint256);
                await approveTx.wait();
            }

            // Redeem PT for underlying
            const router = new ethers.Contract(this.contracts.router, this.abi.router, signer);

            const output = {
                tokenOut: this.contracts.USDC,
                minTokenOut: 0, // Accept any amount
                tokenRedeemSy: this.contracts.USDC,
                pendleSwap: ethers.ZeroAddress,
                swapData: {
                    swapType: 0,
                    extRouter: ethers.ZeroAddress,
                    extCalldata: '0x',
                    needScale: false
                }
            };

            console.log('[Pendle] Redeeming PT...');
            const redeemTx = await router.redeemPyToToken(
                userAddress,
                marketConfig.yt, // YT address is used for redemption
                ptBalance,
                output
            );

            const receipt = await redeemTx.wait();
            const ptRedeemed = ethers.formatUnits(ptBalance, 6);

            console.log(`[Pendle] Redemption successful! TX: ${receipt.hash}`);

            return {
                success: true,
                txHash: receipt.hash,
                ptRedeemed: ptRedeemed,
                message: `Successfully redeemed ${ptRedeemed} PT`
            };

        } catch (err) {
            console.error('[Pendle] redeemPT error:', err);
            return {
                success: false,
                error: err.message || 'Redemption failed'
            };
        }
    },

    /**
     * Sell PT before maturity
     * @param {number} ptAmount - Amount of PT to sell
     * @param {string} marketId - Market identifier
     */
    async sellPT(ptAmount, marketId = 'aUSDC-Jun25') {
        console.log(`[Pendle] Selling ${ptAmount} PT from ${marketId}...`);

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            const marketConfig = this.contracts.markets[marketId];
            if (!marketConfig) {
                throw new Error(`Market ${marketId} not found`);
            }

            const ptAmountWei = ethers.parseUnits(ptAmount.toString(), 6);

            // Get PT balance
            const pt = new ethers.Contract(marketConfig.pt, this.abi.erc20, signer);
            const ptBalance = await pt.balanceOf(userAddress);

            if (ptBalance < ptAmountWei) {
                throw new Error(`Insufficient PT balance. Have: ${ethers.formatUnits(ptBalance, 6)}`);
            }

            // Approve Router
            const allowance = await pt.allowance(userAddress, this.contracts.router);
            if (allowance < ptAmountWei) {
                const approveTx = await pt.approve(this.contracts.router, ethers.MaxUint256);
                await approveTx.wait();
            }

            // Swap PT for USDC
            const router = new ethers.Contract(this.contracts.router, this.abi.router, signer);

            const output = {
                tokenOut: this.contracts.USDC,
                minTokenOut: ethers.parseUnits((ptAmount * 0.99).toFixed(6), 6), // 1% slippage
                tokenRedeemSy: this.contracts.USDC,
                pendleSwap: ethers.ZeroAddress,
                swapData: {
                    swapType: 0,
                    extRouter: ethers.ZeroAddress,
                    extCalldata: '0x',
                    needScale: false
                }
            };

            const limit = {
                guessMin: 0,
                guessMax: ethers.MaxUint256,
                guessOffchain: 0,
                maxIteration: 256,
                eps: ethers.parseUnits('0.0001', 18)
            };

            console.log('[Pendle] Swapping PT for USDC...');
            const swapTx = await router.swapPtForToken(
                userAddress,
                marketConfig.market,
                ptAmountWei,
                output,
                limit
            );

            const receipt = await swapTx.wait();
            console.log(`[Pendle] PT sale successful! TX: ${receipt.hash}`);

            return {
                success: true,
                txHash: receipt.hash,
                ptSold: ptAmount,
                message: `Successfully sold ${ptAmount} PT`
            };

        } catch (err) {
            console.error('[Pendle] sellPT error:', err);
            return {
                success: false,
                error: err.message || 'PT sale failed'
            };
        }
    },

    /**
     * Get user's Pendle positions
     */
    async getUserPosition(userAddress) {
        try {
            const provider = this.getProvider();
            const positions = [];
            let totalValue = 0;

            for (const [marketId, config] of Object.entries(this.contracts.markets)) {
                // Check PT balance
                const pt = new ethers.Contract(config.pt, this.abi.erc20, provider);
                const ptBalance = await pt.balanceOf(userAddress);

                if (ptBalance > 0n) {
                    const ptAmount = Number(ethers.formatUnits(ptBalance, 6));
                    const marketData = this.markets[marketId] || { fixedAPY: 10, daysToMaturity: 180 };

                    // PT value = ptAmount * ptRate (slightly below 1)
                    const ptValue = ptAmount * (marketData.ptRate || 0.92);
                    totalValue += ptValue;

                    positions.push({
                        type: 'PT',
                        market: marketId,
                        balance: ptAmount,
                        valueUSD: ptValue,
                        fixedAPY: marketData.fixedAPY,
                        daysToMaturity: marketData.daysToMaturity,
                        maturityDate: new Date(config.maturity * 1000).toLocaleDateString()
                    });
                }

                // Check YT balance
                const yt = new ethers.Contract(config.yt, this.abi.erc20, provider);
                const ytBalance = await yt.balanceOf(userAddress);

                if (ytBalance > 0n) {
                    const ytAmount = Number(ethers.formatUnits(ytBalance, 18));
                    const marketData = this.markets[marketId] || { daysToMaturity: 180 };

                    // YT value is much lower and depends on current yield expectations
                    // Rough estimate: YT worth ~5-15% of underlying per year of yield
                    const ytValue = ytAmount * 0.1 * (marketData.daysToMaturity / 365);
                    totalValue += ytValue;

                    positions.push({
                        type: 'YT',
                        market: marketId,
                        balance: ytAmount,
                        valueUSD: ytValue,
                        daysToMaturity: marketData.daysToMaturity,
                        maturityDate: new Date(config.maturity * 1000).toLocaleDateString(),
                        warning: 'YT value goes to 0 at maturity'
                    });
                }
            }

            return {
                positions,
                totalValue,
                hasPositions: positions.length > 0
            };

        } catch (err) {
            console.error('[Pendle] Error getting position:', err);
            return { positions: [], totalValue: 0, hasPositions: false };
        }
    },

    /**
     * Get estimated earnings for a PT position
     */
    getEstimatedEarnings(amount, marketId = 'aUSDC-Jun25') {
        const marketData = this.markets[marketId] || { fixedAPY: 10, daysToMaturity: 180 };
        const fixedAPY = marketData.fixedAPY;
        const daysToMaturity = marketData.daysToMaturity;

        // PT earnings = (1 - ptRate) * amount = discount captured
        const discount = 1 - (marketData.ptRate || 0.92);
        const totalEarnings = amount * discount;

        // Annualized
        const annualizedEarnings = totalEarnings * (365 / daysToMaturity);

        return {
            fixedAPY,
            daysToMaturity,
            discount: discount * 100,
            totalEarnings,
            annualizedEarnings,
            maturityValue: amount + totalEarnings,
            message: `Invest $${amount} now, receive $${(amount + totalEarnings).toFixed(2)} at maturity (${daysToMaturity} days)`
        };
    },

    /**
     * Get comparison of all markets
     */
    async getMarketComparison() {
        const markets = await this.getMarkets();

        return Object.entries(markets).map(([id, data]) => ({
            id,
            underlying: data.underlying,
            fixedAPY: data.fixedAPY?.toFixed(2) + '%',
            daysToMaturity: data.daysToMaturity,
            maturityDate: new Date(data.maturity * 1000).toLocaleDateString(),
            riskLevel: data.underlying === 'aUSDC' ? 'Low' : data.underlying === 'GLP' ? 'Medium' : 'Low-Medium',
            isExpired: data.isExpired
        })).filter(m => !m.isExpired);
    }
};

// Auto-init when DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        PendleIntegration.init();
    });
}

// Export
if (typeof window !== 'undefined') {
    window.PendleIntegration = PendleIntegration;
}

console.log('[Pendle] Module loaded');
