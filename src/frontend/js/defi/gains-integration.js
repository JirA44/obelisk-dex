// ===============================================================================
// OBELISK DEX - GAINS NETWORK (gTrade) INTEGRATION (Arbitrum)
// Real perpetual trading with up to 150x leverage - Crypto, Forex, Stocks
// V1.0 - Initial implementation
// ===============================================================================

const GainsIntegration = {
    // Gains Network Arbitrum Contracts
    contracts: {
        // Main Diamond Contract (all trading functions)
        diamond: '0xFF162c694eAA571f685030649814282eA457f169',
        // Collateral Vaults
        gUSDC: '0xd3443ee1e91aF28e5FB858Fbd0D72A63bA8046E0',
        gDAI: '0xd85E038593d7A098614721EaE955EC2022B9B91B',
        gETH: '0x5977A9682D7AF81D347CFc338c61692163a2784C',
        // GNS Token
        gns: '0x18c11FD286C5EC11c3b683Caa813B77f5163A122',
        // Base Tokens
        USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
    },

    // Chain ID
    chainId: 42161, // Arbitrum One

    // ABI fragments for trading
    abi: {
        diamond: [
            // Open Trade
            'function openTrade((address trader, uint32 pairIndex, uint256 index, uint256 initialPosToken, uint256 positionSizeUsd, uint256 openPrice, bool buy, uint24 leverage, uint256 tp, uint256 sl, uint256 __placeholder) t, uint16 maxSlippageP, address referrer) external',
            // Close Trade
            'function closeTradeMarket(uint32 index) external',
            // Update Stop Loss
            'function updateSl(uint32 index, uint64 newSl) external',
            // Update Take Profit
            'function updateTp(uint32 index, uint64 newTp) external',
            // Get Open Trades
            'function getTrades(address trader) external view returns (tuple(address trader, uint32 pairIndex, uint256 index, uint256 initialPosToken, uint256 positionSizeUsd, uint256 openPrice, bool buy, uint24 leverage, uint256 tp, uint256 sl, uint256 __placeholder)[])',
            // Get Trade Info
            'function getTradeInfo(address trader, uint32 index) external view returns (tuple(uint256 createdBlock, uint256 tpLastUpdatedBlock, uint256 slLastUpdatedBlock, uint16 maxSlippageP, uint48 lastOiUpdateTs, uint48 collateralPriceUsd, uint8 collateralIndex, uint8 __placeholder))',
        ],
        erc20: [
            'function approve(address spender, uint256 amount) external returns (bool)',
            'function allowance(address owner, address spender) external view returns (uint256)',
            'function balanceOf(address account) external view returns (uint256)',
            'function decimals() external view returns (uint8)',
            'function deposit(uint256 assets, address receiver) external returns (uint256)',
            'function withdraw(uint256 assets, address receiver, address owner) external returns (uint256)'
        ]
    },

    // Supported pairs by category
    // Note: pairIndex values must match gTrade's on-chain configuration
    pairs: {
        crypto: {
            'BTC/USD': 0,
            'ETH/USD': 1,
            'LINK/USD': 2,
            'DOGE/USD': 3,
            'MATIC/USD': 4,
            'ADA/USD': 5,
            'SOL/USD': 6,
            'BNB/USD': 7,
            'XRP/USD': 8,
            'AVAX/USD': 9,
            'UNI/USD': 10,
            'ATOM/USD': 11,
            'NEAR/USD': 12,
            'LTC/USD': 13,
            'ARB/USD': 14,
            'OP/USD': 15,
            'DOT/USD': 16,
            'TRX/USD': 17,
            'SHIB/USD': 18,
            'APE/USD': 19,
            'FIL/USD': 20,
            'LDO/USD': 21,
            'AAVE/USD': 22,
            'CRV/USD': 23,
            'MKR/USD': 24,
            'PEPE/USD': 25,
            'WIF/USD': 26,
            'BONK/USD': 27,
            'SUI/USD': 28,
            'SEI/USD': 29,
        },
        forex: {
            'EUR/USD': 30,
            'GBP/USD': 31,
            'USD/JPY': 32,
            'USD/CHF': 33,
            'AUD/USD': 34,
            'USD/CAD': 35,
            'NZD/USD': 36,
            'EUR/GBP': 37,
            'EUR/JPY': 38,
            'GBP/JPY': 39,
        },
        stocks: {
            'AAPL/USD': 40,
            'AMZN/USD': 41,
            'GOOGL/USD': 42,
            'META/USD': 43,
            'MSFT/USD': 44,
            'NVDA/USD': 45,
            'TSLA/USD': 46,
            'NFLX/USD': 47,
            'AMD/USD': 48,
            'COIN/USD': 49,
        },
        commodities: {
            'XAU/USD': 50, // Gold
            'XAG/USD': 51, // Silver
            'WTIUSD': 52,  // Oil WTI
        }
    },

    // Leverage limits by asset type
    leverageLimits: {
        crypto: { min: 2, max: 150 },
        forex: { min: 2, max: 1000 },
        stocks: { min: 2, max: 50 },
        commodities: { min: 2, max: 100 }
    },

    // Current stats
    stats: {
        openInterest: 0,
        volume24h: 0,
        trades24h: 0,
        fees: 0.08 // 0.08% fee
    },

    // Active trades cache
    activeTrades: [],

    /**
     * Initialize Gains integration
     */
    async init() {
        console.log('[GAINS] Initializing Gains Network integration...');

        if (typeof ethers === 'undefined') {
            console.error('[GAINS] ethers.js not loaded');
            return false;
        }

        await this.fetchStats();
        console.log('[GAINS] Integration ready');
        console.log('[GAINS] Supported pairs:', this.getTotalPairs());
        return true;
    },

    /**
     * Get read-only provider
     */
    getProvider() {
        return new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
    },

    /**
     * Get signer for transactions
     */
    async getSigner() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('No wallet connected');
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        return await provider.getSigner();
    },

    /**
     * Fetch current stats from Gains
     */
    async fetchStats() {
        try {
            // In production, fetch from Gains backend API
            // For now, use static estimates
            this.stats = {
                openInterest: 45000000,  // $45M
                volume24h: 120000000,    // $120M
                trades24h: 8500,
                fees: 0.08
            };
            return this.stats;
        } catch (err) {
            console.error('[GAINS] Error fetching stats:', err);
            return this.stats;
        }
    },

    /**
     * Get total supported pairs count
     */
    getTotalPairs() {
        return Object.values(this.pairs).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
    },

    /**
     * Get pair index from symbol
     */
    getPairIndex(symbol) {
        for (const category of Object.values(this.pairs)) {
            if (category[symbol] !== undefined) {
                return category[symbol];
            }
        }
        // Try without /USD suffix
        const withUsd = symbol.includes('/') ? symbol : `${symbol}/USD`;
        for (const category of Object.values(this.pairs)) {
            if (category[withUsd] !== undefined) {
                return category[withUsd];
            }
        }
        return null;
    },

    /**
     * Get asset category for leverage limits
     */
    getAssetCategory(symbol) {
        for (const [category, pairs] of Object.entries(this.pairs)) {
            const sym = symbol.includes('/') ? symbol : `${symbol}/USD`;
            if (pairs[sym] !== undefined) {
                return category;
            }
        }
        return 'crypto'; // Default
    },

    /**
     * Get current market price
     */
    async getPrice(symbol) {
        try {
            // Map to Binance symbol format
            let binanceSymbol = symbol.replace('/USD', 'USDT').replace('/', '');

            // Handle forex/stocks differently
            if (this.pairs.forex[symbol + '/USD'] !== undefined ||
                this.pairs.forex[symbol] !== undefined) {
                // Use forex API or static price for now
                return this.getForexPrice(symbol);
            }

            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);
            const data = await res.json();
            return parseFloat(data.price);
        } catch (e) {
            console.error('[GAINS] Price fetch error:', e);
            return null;
        }
    },

    /**
     * Get forex price (simplified)
     */
    async getForexPrice(symbol) {
        // Static forex prices - in production use real forex API
        const forexPrices = {
            'EUR/USD': 1.085,
            'GBP/USD': 1.27,
            'USD/JPY': 150.5,
            'USD/CHF': 0.89,
            'AUD/USD': 0.65,
            'USD/CAD': 1.36,
            'XAU/USD': 2650,
            'XAG/USD': 31.5
        };
        return forexPrices[symbol] || 1;
    },

    /**
     * Deposit USDC to gUSDC vault (required before trading)
     */
    async depositCollateral(amount, collateralType = 'USDC') {
        console.log(`[GAINS] Depositing ${amount} ${collateralType}...`);

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            const tokenAddress = this.contracts[collateralType];
            const vaultAddress = this.contracts[`g${collateralType}`];

            if (!tokenAddress || !vaultAddress) {
                throw new Error(`Invalid collateral type: ${collateralType}`);
            }

            const decimals = collateralType === 'USDC' ? 6 : 18;
            const amountWei = ethers.parseUnits(amount.toString(), decimals);

            // Check balance
            const token = new ethers.Contract(tokenAddress, this.abi.erc20, signer);
            const balance = await token.balanceOf(userAddress);

            if (balance < amountWei) {
                throw new Error(`Insufficient ${collateralType}. Have: ${ethers.formatUnits(balance, decimals)}`);
            }

            // Approve vault
            const allowance = await token.allowance(userAddress, vaultAddress);
            if (allowance < amountWei) {
                console.log('[GAINS] Approving collateral...');
                const approveTx = await token.approve(vaultAddress, ethers.MaxUint256);
                await approveTx.wait();
            }

            // Deposit to vault
            const vault = new ethers.Contract(vaultAddress, this.abi.erc20, signer);
            console.log('[GAINS] Depositing to vault...');
            const tx = await vault.deposit(amountWei, userAddress);
            const receipt = await tx.wait();

            console.log('[GAINS] Deposit successful! TX:', receipt.hash);

            return {
                success: true,
                txHash: receipt.hash,
                amount: amount,
                collateral: collateralType,
                message: `Deposited ${amount} ${collateralType} to gTrade vault`
            };

        } catch (err) {
            console.error('[GAINS] Deposit error:', err);
            return {
                success: false,
                error: err.message || 'Deposit failed'
            };
        }
    },

    /**
     * Open a leveraged trade
     * @param {Object} params - Trade parameters
     * @param {string} params.pair - Trading pair (e.g., 'BTC/USD', 'EUR/USD')
     * @param {boolean} params.isLong - Long (true) or Short (false)
     * @param {number} params.collateral - Collateral amount in USD
     * @param {number} params.leverage - Leverage (2-150 for crypto, up to 1000 for forex)
     * @param {number} params.tp - Take profit price (optional)
     * @param {number} params.sl - Stop loss price (optional)
     */
    async openTrade(params) {
        const { pair, isLong, collateral, leverage, tp = 0, sl = 0 } = params;

        console.log(`[GAINS] Opening ${isLong ? 'LONG' : 'SHORT'} ${pair} @ ${leverage}x with $${collateral} collateral`);

        try {
            const signer = await this.getSigner();
            const userAddress = await signer.getAddress();

            // Get pair index
            const pairIndex = this.getPairIndex(pair);
            if (pairIndex === null) {
                throw new Error(`Unsupported pair: ${pair}`);
            }

            // Validate leverage
            const category = this.getAssetCategory(pair);
            const limits = this.leverageLimits[category];
            if (leverage < limits.min || leverage > limits.max) {
                throw new Error(`Leverage must be ${limits.min}-${limits.max}x for ${category}`);
            }

            // Get current price
            const currentPrice = await this.getPrice(pair);
            if (!currentPrice) {
                throw new Error('Could not fetch price');
            }

            // Calculate position size
            const positionSizeUsd = collateral * leverage;

            // Create trade struct
            const tradeStruct = {
                trader: userAddress,
                pairIndex: pairIndex,
                index: 0, // Auto-assigned
                initialPosToken: 0, // Auto-calculated
                positionSizeUsd: ethers.parseUnits(positionSizeUsd.toFixed(2), 18),
                openPrice: ethers.parseUnits(currentPrice.toFixed(8), 10),
                buy: isLong,
                leverage: leverage * 1000, // Leverage in 0.001 units
                tp: tp > 0 ? ethers.parseUnits(tp.toFixed(8), 10) : 0,
                sl: sl > 0 ? ethers.parseUnits(sl.toFixed(8), 10) : 0,
                __placeholder: 0
            };

            // Execute trade
            const diamond = new ethers.Contract(
                this.contracts.diamond,
                this.abi.diamond,
                signer
            );

            const maxSlippageP = 100; // 1% max slippage (in 0.01% units)
            const referrer = ethers.ZeroAddress;

            console.log('[GAINS] Submitting trade...');
            const tx = await diamond.openTrade(tradeStruct, maxSlippageP, referrer, {
                gasLimit: 1500000
            });

            const receipt = await tx.wait();
            console.log('[GAINS] Trade opened! TX:', receipt.hash);

            // Calculate fee
            const fee = positionSizeUsd * (this.stats.fees / 100);

            return {
                success: true,
                txHash: receipt.hash,
                trade: {
                    pair,
                    pairIndex,
                    side: isLong ? 'LONG' : 'SHORT',
                    collateral,
                    leverage,
                    positionSize: positionSizeUsd,
                    entryPrice: currentPrice,
                    tp,
                    sl,
                    fee
                },
                message: `Opened ${isLong ? 'LONG' : 'SHORT'} ${pair} $${positionSizeUsd.toFixed(0)} @ ${leverage}x`
            };

        } catch (err) {
            console.error('[GAINS] Open trade error:', err);
            return {
                success: false,
                error: err.message || 'Failed to open trade'
            };
        }
    },

    /**
     * Close a trade at market price
     * @param {number} tradeIndex - Index of the trade to close
     */
    async closeTrade(tradeIndex) {
        console.log(`[GAINS] Closing trade #${tradeIndex}...`);

        try {
            const signer = await this.getSigner();

            const diamond = new ethers.Contract(
                this.contracts.diamond,
                this.abi.diamond,
                signer
            );

            const tx = await diamond.closeTradeMarket(tradeIndex, {
                gasLimit: 1000000
            });

            const receipt = await tx.wait();
            console.log('[GAINS] Trade closed! TX:', receipt.hash);

            return {
                success: true,
                txHash: receipt.hash,
                tradeIndex,
                message: `Trade #${tradeIndex} closed at market`
            };

        } catch (err) {
            console.error('[GAINS] Close trade error:', err);
            return {
                success: false,
                error: err.message || 'Failed to close trade'
            };
        }
    },

    /**
     * Update stop loss
     */
    async updateStopLoss(tradeIndex, newSl) {
        try {
            const signer = await this.getSigner();
            const diamond = new ethers.Contract(this.contracts.diamond, this.abi.diamond, signer);

            const slPrice = ethers.parseUnits(newSl.toFixed(8), 10);
            const tx = await diamond.updateSl(tradeIndex, slPrice);
            const receipt = await tx.wait();

            return {
                success: true,
                txHash: receipt.hash,
                message: `Stop loss updated to ${newSl}`
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    /**
     * Update take profit
     */
    async updateTakeProfit(tradeIndex, newTp) {
        try {
            const signer = await this.getSigner();
            const diamond = new ethers.Contract(this.contracts.diamond, this.abi.diamond, signer);

            const tpPrice = ethers.parseUnits(newTp.toFixed(8), 10);
            const tx = await diamond.updateTp(tradeIndex, tpPrice);
            const receipt = await tx.wait();

            return {
                success: true,
                txHash: receipt.hash,
                message: `Take profit updated to ${newTp}`
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    /**
     * Get user's open trades
     */
    async getUserTrades(userAddress = null) {
        try {
            const signer = await this.getSigner();
            const address = userAddress || await signer.getAddress();

            const provider = this.getProvider();
            const diamond = new ethers.Contract(this.contracts.diamond, this.abi.diamond, provider);

            const trades = await diamond.getTrades(address);

            // Map to readable format
            const formattedTrades = trades.map((trade, i) => {
                const positionSize = Number(ethers.formatUnits(trade.positionSizeUsd, 18));
                const leverage = trade.leverage / 1000;
                const collateral = positionSize / leverage;

                return {
                    index: i,
                    pairIndex: trade.pairIndex,
                    pair: this.getPairSymbol(trade.pairIndex),
                    side: trade.buy ? 'LONG' : 'SHORT',
                    positionSize,
                    leverage,
                    collateral,
                    entryPrice: Number(ethers.formatUnits(trade.openPrice, 10)),
                    tp: Number(ethers.formatUnits(trade.tp, 10)),
                    sl: Number(ethers.formatUnits(trade.sl, 10))
                };
            }).filter(t => t.positionSize > 0);

            this.activeTrades = formattedTrades;

            return {
                success: true,
                count: formattedTrades.length,
                trades: formattedTrades
            };

        } catch (err) {
            console.error('[GAINS] Get trades error:', err);
            return { success: false, error: err.message, trades: [] };
        }
    },

    /**
     * Get pair symbol from index
     */
    getPairSymbol(pairIndex) {
        for (const [category, pairs] of Object.entries(this.pairs)) {
            for (const [symbol, index] of Object.entries(pairs)) {
                if (index === pairIndex) return symbol;
            }
        }
        return `PAIR_${pairIndex}`;
    },

    /**
     * Calculate estimated liquidation price
     */
    calculateLiquidationPrice(entryPrice, isLong, leverage) {
        // Liquidation at ~90% loss of margin
        const liqPercent = 0.9 / leverage;
        if (isLong) {
            return entryPrice * (1 - liqPercent);
        } else {
            return entryPrice * (1 + liqPercent);
        }
    },

    /**
     * Calculate PnL for a trade
     */
    calculatePnL(entryPrice, currentPrice, isLong, leverage, collateral) {
        const priceChange = (currentPrice - entryPrice) / entryPrice;
        const pnlPercent = isLong ? priceChange * leverage : -priceChange * leverage;
        const pnlUsd = collateral * pnlPercent;

        return {
            pnlPercent: pnlPercent * 100,
            pnlUsd,
            roi: pnlPercent * 100
        };
    },

    /**
     * Get estimated trading fee
     */
    getEstimatedFee(positionSize) {
        return positionSize * (this.stats.fees / 100);
    },

    /**
     * Get all available pairs as flat array
     */
    getAllPairs() {
        const allPairs = [];
        for (const [category, pairs] of Object.entries(this.pairs)) {
            for (const symbol of Object.keys(pairs)) {
                allPairs.push({ symbol, category, index: pairs[symbol] });
            }
        }
        return allPairs;
    }
};

// Auto-init when DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        GainsIntegration.init();
    });
}

// Export for Node.js and browser
if (typeof window !== 'undefined') {
    window.GainsIntegration = GainsIntegration;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GainsIntegration };
}

console.log('[GAINS] Gains Network module loaded');
