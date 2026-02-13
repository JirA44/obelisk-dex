// ===============================================================================
// OBELISK - GAINS NETWORK EXECUTOR V2.1
// Real perpetual trading on gTrade (Arbitrum) - Crypto, Forex, Stocks
// Up to 150x leverage on crypto, 1000x on forex
// V2.1: Auto SL/TP on-chain after position open
// Using official @gainsnetwork/sdk
// ===============================================================================
console.log('[GAINS-EXEC] V2.1 LOADED (Auto SL/TP)');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ethers } = require('ethers');
const fs = require('fs');

// Official Gains Network SDK
const GainsSDK = require('@gainsnetwork/sdk');

// ===============================================================================
// CONFIGURATION
// ===============================================================================

const ARBITRUM_RPCS = [
    'https://arbitrum-one.public.blastapi.io',
    'https://1rpc.io/arb',
    'https://arb1.arbitrum.io/rpc',
];

const ARBITRUM_CHAIN_ID = 42161;

// SDK Constants
const { ChainId, CollateralTypes, getContractsForChain, getContractAddressesForChain } = GainsSDK;

// Get addresses from SDK (Arbitrum + USDC collateral)
const SDK_ADDRESSES = getContractAddressesForChain(ARBITRUM_CHAIN_ID, CollateralTypes.USDC);

// Gains Network Contracts (Arbitrum) - from SDK
const GAINS_CONTRACTS = {
    Diamond: SDK_ADDRESSES.gnsMultiCollatDiamond,
    gUSDC: SDK_ADDRESSES.gToken,
    gDAI: '0xd85E038593d7A098614721EaE955EC2022B9B91B',
    gETH: '0x5977A9682D7AF81D347CFc338c61692163a2784C',
    GNS: '0x18c11FD286C5EC11c3b683Caa813B77f5163A122',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
};

// Collateral index mapping from SDK
const COLLATERAL_INDEX = {
    DAI: 1,
    ETH: 2,
    USDC: 3,
    GNS: 4
};

console.log(`[GAINS-EXEC] Diamond: ${GAINS_CONTRACTS.Diamond}`);

// Pair indexes by category
const PAIR_INDEXES = {
    // Crypto (0-29)
    'BTC': 0, 'ETH': 1, 'LINK': 2, 'DOGE': 3, 'MATIC': 4,
    'ADA': 5, 'SOL': 6, 'BNB': 7, 'XRP': 8, 'AVAX': 9,
    'UNI': 10, 'ATOM': 11, 'NEAR': 12, 'LTC': 13, 'ARB': 14,
    'OP': 15, 'DOT': 16, 'TRX': 17, 'SHIB': 18, 'APE': 19,
    'FIL': 20, 'LDO': 21, 'AAVE': 22, 'CRV': 23, 'MKR': 24,
    'PEPE': 25, 'WIF': 26, 'BONK': 27, 'SUI': 28, 'SEI': 29,
    // Forex (30-39)
    'EURUSD': 30, 'GBPUSD': 31, 'USDJPY': 32, 'USDCHF': 33,
    'AUDUSD': 34, 'USDCAD': 35, 'NZDUSD': 36, 'EURGBP': 37,
    'EURJPY': 38, 'GBPJPY': 39,
    // Stocks (40-49)
    'AAPL': 40, 'AMZN': 41, 'GOOGL': 42, 'META': 43, 'MSFT': 44,
    'NVDA': 45, 'TSLA': 46, 'NFLX': 47, 'AMD': 48, 'COIN': 49,
    // Commodities (50-52)
    'XAU': 50, 'XAG': 51, 'WTI': 52,
};

// Leverage limits by asset type
const LEVERAGE_LIMITS = {
    crypto: { min: 2, max: 150 },
    forex: { min: 2, max: 1000 },
    stocks: { min: 2, max: 50 },
    commodities: { min: 2, max: 100 }
};

// ABIs - Gains Network V9/V10 (GNSMultiCollatDiamond)
// Trade struct: (user, index, pairIndex, leverage, long, isOpen, collateralIndex, tradeType, collateralAmount, openPrice, tp, sl, isCounterTrade, positionSizeToken, __placeholder)
const GAINS_DIAMOND_ABI = [
    // OpenTrade with Trade struct
    'function openTrade(tuple(address user, uint32 index, uint16 pairIndex, uint24 leverage, bool long, bool isOpen, uint8 collateralIndex, uint8 tradeType, uint120 collateralAmount, uint64 openPrice, uint64 tp, uint64 sl, bool isCounterTrade, uint160 positionSizeToken, uint24 __placeholder) trade, uint16 maxSlippageP, address referrer) external',
    'function closeTradeMarket(uint32 index) external',
    'function updateSl(uint32 index, uint64 newSl) external',
    'function updateTp(uint32 index, uint64 newTp) external',
    'function getTrades(address trader) external view returns (tuple(address user, uint32 index, uint16 pairIndex, uint24 leverage, bool long, bool isOpen, uint8 collateralIndex, uint8 tradeType, uint120 collateralAmount, uint64 openPrice, uint64 tp, uint64 sl, bool isCounterTrade, uint160 positionSizeToken, uint24 __placeholder)[])',
    'function getCollateral(uint8 index) external view returns (tuple(address addr, bool isActive, uint8 decimals, string symbol))',
];

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function deposit(uint256 assets, address receiver) returns (uint256)',
    'function withdraw(uint256 assets, address receiver, address owner) returns (uint256)',
];

// Data persistence
const DATA_FILE = path.join(__dirname, 'data', 'gains_trades.json');

// ===============================================================================
// GAINS EXECUTOR CLASS
// ===============================================================================

class GainsExecutor {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.initialized = false;
        this.stats = { orders: 0, filled: 0, failed: 0, volume: 0, pnl: 0 };
        this.activeTrades = [];
        this.sdkContracts = null; // SDK contracts reference
    }

    async init() {
        try {
            const privateKey = process.env.PRIVATE_KEY;

            if (!privateKey) {
                console.log('[GAINS-EXEC] No private key, simulation mode');
                return false;
            }

            // Try multiple RPCs
            for (const rpc of ARBITRUM_RPCS) {
                try {
                    console.log(`[GAINS-EXEC] Trying RPC: ${rpc.slice(0, 40)}...`);
                    this.provider = new ethers.JsonRpcProvider(rpc, undefined, { staticNetwork: true });
                    this.wallet = new ethers.Wallet(privateKey, this.provider);

                    const network = await Promise.race([
                        this.provider.getNetwork(),
                        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
                    ]);

                    if (Number(network.chainId) === ARBITRUM_CHAIN_ID) {
                        console.log(`[GAINS-EXEC] Connected via ${rpc.slice(8, 35)}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!this.provider) {
                console.log('[GAINS-EXEC] All RPCs failed');
                return false;
            }

            const balance = await this.provider.getBalance(this.wallet.address);
            console.log(`[GAINS-EXEC] Wallet: ${this.wallet.address}`);
            console.log(`[GAINS-EXEC] ETH Balance: ${parseFloat(ethers.formatEther(balance)).toFixed(4)} ETH`);

            // Check USDC balance
            const usdc = new ethers.Contract(GAINS_CONTRACTS.USDC, ERC20_ABI, this.provider);
            const usdcBalance = await usdc.balanceOf(this.wallet.address);
            console.log(`[GAINS-EXEC] USDC Balance: $${parseFloat(ethers.formatUnits(usdcBalance, 6)).toFixed(2)}`);

            // Initialize SDK contracts (uses ethers v5 internally)
            try {
                // SDK requires ethers v5 provider/signer - use SDK's bundled ethers
                const ethersV5 = require('@gainsnetwork/sdk/node_modules/ethers');
                const v5Provider = new ethersV5.providers.JsonRpcProvider(ARBITRUM_RPCS[0]);
                const v5Wallet = new ethersV5.Wallet(privateKey, v5Provider);
                this.sdkContracts = getContractsForChain(ARBITRUM_CHAIN_ID, v5Wallet, CollateralTypes.USDC);
                console.log(`[GAINS-EXEC] SDK contracts initialized (ethers v5)`);
            } catch (sdkErr) {
                console.log(`[GAINS-EXEC] SDK contracts unavailable: ${sdkErr.message}`);
            }

            // Load saved trades
            this.loadTrades();

            this.initialized = true;
            return true;

        } catch (err) {
            console.error('[GAINS-EXEC] Init error:', err.message);
            return false;
        }
    }

    // ===============================================================================
    // COLLATERAL MANAGEMENT
    // ===============================================================================

    async depositToVault(amount, collateral = 'USDC') {
        if (!this.initialized) {
            return { success: false, error: 'Not initialized', simulated: true };
        }

        try {
            const tokenAddress = GAINS_CONTRACTS[collateral];
            const vaultAddress = GAINS_CONTRACTS[`g${collateral}`];
            const decimals = collateral === 'USDC' ? 6 : 18;
            const amountWei = ethers.parseUnits(amount.toString(), decimals);

            const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.wallet);
            const vault = new ethers.Contract(vaultAddress, ERC20_ABI, this.wallet);

            // Check balance
            const balance = await token.balanceOf(this.wallet.address);
            if (balance < amountWei) {
                return {
                    success: false,
                    error: `Insufficient ${collateral}. Have: $${ethers.formatUnits(balance, decimals)}`
                };
            }

            // Approve
            const allowance = await token.allowance(this.wallet.address, vaultAddress);
            if (allowance < amountWei) {
                console.log(`[GAINS-EXEC] Approving ${collateral}...`);
                const approveTx = await token.approve(vaultAddress, ethers.MaxUint256);
                await approveTx.wait();
            }

            // Deposit
            console.log(`[GAINS-EXEC] Depositing $${amount} to g${collateral} vault...`);
            const tx = await vault.deposit(amountWei, this.wallet.address);
            const receipt = await tx.wait();

            console.log(`[GAINS-EXEC] Deposited! TX: ${receipt.hash}`);

            return {
                success: true,
                txHash: receipt.hash,
                amount,
                vault: `g${collateral}`
            };

        } catch (err) {
            console.error('[GAINS-EXEC] Deposit error:', err.message);
            return { success: false, error: err.message };
        }
    }

    // Request withdrawal from gUSDC vault (epoch-based system)
    async requestWithdraw(shares, collateral = 'USDC') {
        if (!this.initialized) {
            return { success: false, error: 'Not initialized' };
        }

        try {
            const vaultAddress = GAINS_CONTRACTS[`g${collateral}`];
            const decimals = collateral === 'USDC' ? 6 : 18;
            const sharesAmount = ethers.parseUnits(shares.toString(), decimals);

            // Gains Network gToken vault ABI
            const GTOKEN_ABI = [
                'function balanceOf(address) view returns (uint256)',
                'function makeWithdrawRequest(uint256 shares, address owner)',
                'function cancelWithdrawRequest(uint256 shares, address owner, uint256 unlockEpoch)',
                'function withdrawRequests(address, uint256) view returns (uint256)',
                'function currentEpoch() view returns (uint256)',
                'function currentEpochStart() view returns (uint256)',
                'function epochDuration() view returns (uint256)',
                'function withdrawEpochsTimelock() view returns (uint256)',
                'function maxRedeem(address owner) view returns (uint256)',
                'function redeem(uint256 shares, address receiver, address owner) returns (uint256)'
            ];

            const vault = new ethers.Contract(vaultAddress, GTOKEN_ABI, this.wallet);

            // Get current balance
            const balance = await vault.balanceOf(this.wallet.address);
            console.log(`[GAINS-EXEC] g${collateral} balance: ${ethers.formatUnits(balance, decimals)}`);

            if (balance < sharesAmount) {
                return { success: false, error: `Insufficient shares. Have: ${ethers.formatUnits(balance, decimals)}, need: ${shares}` };
            }

            // Get epoch info
            const currentEpoch = await vault.currentEpoch();
            const timelock = await vault.withdrawEpochsTimelock();
            const unlockEpoch = Number(currentEpoch) + Number(timelock);

            console.log(`[GAINS-EXEC] Current epoch: ${currentEpoch}, timelock: ${timelock}, unlock at epoch: ${unlockEpoch}`);

            // Make withdraw request
            console.log(`[GAINS-EXEC] Requesting withdraw of ${shares} shares...`);
            const tx = await vault.makeWithdrawRequest(sharesAmount, this.wallet.address);
            const receipt = await tx.wait();

            console.log(`[GAINS-EXEC] Withdraw request submitted! TX: ${receipt.hash}`);

            return {
                success: true,
                txHash: receipt.hash,
                sharesRequested: shares,
                currentEpoch: Number(currentEpoch),
                unlockEpoch,
                estimatedWaitDays: Number(timelock) * 3, // 3 days per epoch
                message: `Request submitted. Can redeem after epoch ${unlockEpoch} (~${Number(timelock) * 3} days)`
            };

        } catch (err) {
            console.error('[GAINS-EXEC] Withdraw request error:', err.message);
            return { success: false, error: err.message };
        }
    }

    // Execute withdrawal after timelock (redeem shares for assets)
    async executeWithdraw(collateral = 'USDC') {
        if (!this.initialized) {
            return { success: false, error: 'Not initialized' };
        }

        try {
            const vaultAddress = GAINS_CONTRACTS[`g${collateral}`];
            const decimals = collateral === 'USDC' ? 6 : 18;

            const GTOKEN_ABI = [
                'function balanceOf(address) view returns (uint256)',
                'function maxRedeem(address owner) view returns (uint256)',
                'function redeem(uint256 shares, address receiver, address owner) returns (uint256)',
                'function previewRedeem(uint256 shares) view returns (uint256)',
                'function currentEpoch() view returns (uint256)'
            ];

            const vault = new ethers.Contract(vaultAddress, GTOKEN_ABI, this.wallet);

            // Check max redeemable (shows matured withdrawal requests)
            const maxRedeemable = await vault.maxRedeem(this.wallet.address);
            console.log(`[GAINS-EXEC] Max redeemable: ${ethers.formatUnits(maxRedeemable, decimals)}`);

            if (maxRedeemable === 0n) {
                const currentEpoch = await vault.currentEpoch();
                return {
                    success: false,
                    error: 'No matured withdrawal requests. Either make a request first or wait for timelock.',
                    currentEpoch: Number(currentEpoch)
                };
            }

            // Preview assets to receive
            const assetsToReceive = await vault.previewRedeem(maxRedeemable);
            console.log(`[GAINS-EXEC] Will receive: $${ethers.formatUnits(assetsToReceive, decimals)} ${collateral}`);

            // Redeem all available shares
            console.log(`[GAINS-EXEC] Redeeming ${ethers.formatUnits(maxRedeemable, decimals)} shares...`);
            const tx = await vault.redeem(maxRedeemable, this.wallet.address, this.wallet.address);
            const receipt = await tx.wait();

            console.log(`[GAINS-EXEC] Redeemed! TX: ${receipt.hash}`);

            return {
                success: true,
                txHash: receipt.hash,
                sharesRedeemed: ethers.formatUnits(maxRedeemable, decimals),
                assetsReceived: ethers.formatUnits(assetsToReceive, decimals),
                vault: `g${collateral}`
            };

        } catch (err) {
            console.error('[GAINS-EXEC] Withdraw error:', err.message);
            return { success: false, error: err.message };
        }
    }

    // Check withdrawal status
    async getWithdrawStatus(collateral = 'USDC') {
        try {
            const vaultAddress = GAINS_CONTRACTS[`g${collateral}`];
            const decimals = collateral === 'USDC' ? 6 : 18;

            const GTOKEN_ABI = [
                'function balanceOf(address) view returns (uint256)',
                'function maxRedeem(address owner) view returns (uint256)',
                'function currentEpoch() view returns (uint256)',
                'function currentEpochStart() view returns (uint256)',
                'function withdrawEpochsTimelock() view returns (uint256)',
                'function convertToAssets(uint256 shares) view returns (uint256)'
            ];

            const provider = this.provider || new ethers.JsonRpcProvider('https://arbitrum-one.public.blastapi.io');
            const vault = new ethers.Contract(vaultAddress, GTOKEN_ABI, provider);

            const [balance, maxRedeemable, currentEpoch, epochStart, timelock] = await Promise.all([
                vault.balanceOf(this.wallet?.address || '0x377706801308ac4c3Fe86EEBB295FeC6E1279140'),
                vault.maxRedeem(this.wallet?.address || '0x377706801308ac4c3Fe86EEBB295FeC6E1279140'),
                vault.currentEpoch(),
                vault.currentEpochStart(),
                vault.withdrawEpochsTimelock()
            ]);

            const balanceValue = await vault.convertToAssets(balance);

            return {
                shares: ethers.formatUnits(balance, decimals),
                value: ethers.formatUnits(balanceValue, decimals),
                maxRedeemable: ethers.formatUnits(maxRedeemable, decimals),
                canRedeem: maxRedeemable > 0n,
                currentEpoch: Number(currentEpoch),
                epochStartTimestamp: Number(epochStart),
                timelockEpochs: Number(timelock),
                timelockDays: Number(timelock) * 3
            };

        } catch (err) {
            return { error: err.message };
        }
    }

    // Legacy: Withdraw from gUSDC vault (now calls executeWithdraw)
    async withdrawFromVault(amount, collateral = 'USDC') {
        console.log('[GAINS-EXEC] Note: Gains vaults use epoch-based withdrawals');
        console.log('[GAINS-EXEC] Checking if any withdrawal requests have matured...');
        return await this.executeWithdraw(collateral);
    }

    // ===============================================================================
    // TRADING
    // ===============================================================================

    async openPosition(order) {
        this.stats.orders++;
        console.log(`[GAINS-EXEC] openPosition called:`, JSON.stringify(order));
        console.log(`[GAINS-EXEC] initialized: ${this.initialized}, wallet: ${this.wallet?.address}`);

        if (!this.initialized) {
            console.log(`[GAINS-EXEC] Not initialized, simulating`);
            return this.simulateOrder(order, 'OPEN');
        }

        try {
            const { coin, side, size, leverage = 10, tp = 0, sl = 0 } = order;
            console.log(`[GAINS-EXEC] Parsed: coin=${coin}, side=${side}, size=${size}, leverage=${leverage}`);
            const isLong = side.toLowerCase() === 'buy' || side.toLowerCase() === 'long';

            // Get pair index
            const pairIndex = this.getPairIndex(coin);
            if (pairIndex === null) {
                console.log(`[GAINS-EXEC] Unsupported pair: ${coin}, simulating`);
                return this.simulateOrder(order, 'UNSUPPORTED');
            }

            // Validate leverage
            const category = this.getAssetCategory(pairIndex);
            const limits = LEVERAGE_LIMITS[category];
            const clampedLev = Math.max(limits.min, Math.min(leverage, limits.max));

            if (leverage !== clampedLev) {
                console.log(`[GAINS-EXEC] Leverage adjusted: ${leverage}x -> ${clampedLev}x (${category} limit)`);
            }

            // Get current price
            const price = await this.getPrice(coin);
            if (!price) {
                return { success: false, error: 'Could not get price', simulated: true };
            }

            // Calculate collateral needed
            const collateral = size / clampedLev;
            const positionSizeUsd = size;

            console.log(`[GAINS-EXEC] Opening ${isLong ? 'LONG' : 'SHORT'} ${coin} $${positionSizeUsd} @ ${clampedLev}x (collateral: $${collateral.toFixed(2)})`);

            const diamond = new ethers.Contract(GAINS_CONTRACTS.Diamond, GAINS_DIAMOND_ABI, this.wallet);
            const usdc = new ethers.Contract(GAINS_CONTRACTS.USDC, ERC20_ABI, this.wallet);

            // Gains uses USDC directly as collateral (collateralIndex = 1 for USDC)
            const collateralWei = ethers.parseUnits(collateral.toFixed(2), 6);

            // Check USDC balance
            const usdcBalance = await usdc.balanceOf(this.wallet.address);
            if (usdcBalance < collateralWei) {
                console.log(`[GAINS-EXEC] Insufficient USDC: have ${ethers.formatUnits(usdcBalance, 6)}, need ${collateral.toFixed(2)}`);
                return this.simulateOrder(order, 'INSUFFICIENT_USDC');
            }

            // Check/set approval for Diamond contract
            const allowance = await usdc.allowance(this.wallet.address, GAINS_CONTRACTS.Diamond);
            if (allowance < collateralWei) {
                console.log(`[GAINS-EXEC] Approving USDC for Diamond...`);
                const approveTx = await usdc.approve(GAINS_CONTRACTS.Diamond, ethers.MaxUint256);
                await approveTx.wait();
                console.log(`[GAINS-EXEC] USDC approved`);
            }

            // V9/V10 openTrade with Trade struct
            // Leverage is scaled 1e3 (10x = 10000)
            const leverageScaled = clampedLev * 1000;

            // CollateralIndex: 0 = DAI, 1 = USDC, 2 = WETH
            const collateralIndex = 1; // USDC

            // TradeType: 0 = MARKET, 1 = LIMIT, 2 = STOP
            const tradeType = 0;

            // TP/SL in price format (1e10 precision)
            const tpScaled = tp > 0 ? BigInt(Math.floor(tp * 1e10)) : 0n;
            const slScaled = sl > 0 ? BigInt(Math.floor(sl * 1e10)) : 0n;

            // Build Trade struct
            const tradeStruct = {
                user: this.wallet.address,
                index: 0,                       // Will be assigned by contract
                pairIndex: pairIndex,           // From PAIR_INDEXES (ETH=1, BTC=0, etc.)
                leverage: leverageScaled,       // 10x = 10000
                long: isLong,
                isOpen: true,
                collateralIndex: collateralIndex,
                tradeType: tradeType,           // 0 = MARKET
                collateralAmount: collateralWei,
                openPrice: 0,                   // Will be set by oracle
                tp: tpScaled,
                sl: slScaled,
                isCounterTrade: false,
                positionSizeToken: 0,           // Will be calculated
                __placeholder: 0
            };

            const maxSlippageP = 100;           // 1% = 100 (1e2 precision)
            const referrer = ethers.ZeroAddress;

            console.log(`[GAINS-EXEC] Calling openTrade with struct:`, JSON.stringify(tradeStruct, (k, v) => typeof v === 'bigint' ? v.toString() : v));

            const tx = await diamond.openTrade(
                tradeStruct,
                maxSlippageP,
                referrer,
                { gasLimit: 2000000 }
            );

            console.log(`[GAINS-EXEC] TX submitted: ${tx.hash}`);
            const receipt = await tx.wait();

            this.stats.filled++;
            this.stats.volume += positionSizeUsd;

            // V2.1: Extract tradeIndex from receipt events for SL/TP updates
            let tradeIndex = null;
            try {
                // Parse logs to find the trade index assigned by the contract
                for (const log of receipt.logs) {
                    // TradeOpened event or similar - tradeIndex is typically in topics/data
                    if (log.topics && log.topics.length >= 3) {
                        // The trade index is often the second indexed param
                        const possibleIndex = parseInt(log.topics[2], 16);
                        if (!isNaN(possibleIndex) && possibleIndex < 1000) {
                            tradeIndex = possibleIndex;
                            break;
                        }
                    }
                }
                if (tradeIndex === null) {
                    // Fallback: query current trades to find the latest
                    const positions = await this.getPositions();
                    if (positions.success && positions.positions.length > 0) {
                        const lastTrade = positions.positions[positions.positions.length - 1];
                        tradeIndex = lastTrade.index;
                    }
                }
            } catch (parseErr) {
                console.log(`[GAINS-EXEC] Could not extract tradeIndex: ${parseErr.message}`);
            }

            // V2.1: Auto-set TP/SL on-chain if provided and we have tradeIndex
            let tpResult = null, slResult = null;
            if (tradeIndex !== null) {
                if (tp > 0) {
                    tpResult = await this.updateTakeProfit(tradeIndex, tp);
                    console.log(`[GAINS-EXEC] Auto TP ${tpResult.success ? 'SET' : 'FAILED'}: $${tp} (index=${tradeIndex})`);
                }
                if (sl > 0) {
                    slResult = await this.updateStopLoss(tradeIndex, sl);
                    console.log(`[GAINS-EXEC] Auto SL ${slResult.success ? 'SET' : 'FAILED'}: $${sl} (index=${tradeIndex})`);
                }
            } else if (tp > 0 || sl > 0) {
                console.log(`[GAINS-EXEC] Warning: TP/SL requested but tradeIndex unknown - TP/SL set in openTrade struct`);
            }

            // Save trade locally
            const trade = {
                id: `GAINS_${Date.now()}`,
                txHash: receipt.hash,
                coin,
                pairIndex,
                tradeIndex,
                side: isLong ? 'LONG' : 'SHORT',
                size: positionSizeUsd,
                leverage: clampedLev,
                collateral,
                entryPrice: price,
                tp,
                sl,
                tpSet: tpResult?.success || (tp > 0), // TP was in the struct at minimum
                slSet: slResult?.success || (sl > 0),
                openedAt: Date.now(),
                status: 'open'
            };

            this.activeTrades.push(trade);
            this.saveTrades();

            const fee = positionSizeUsd * 0.0008; // 0.08% fee

            return {
                success: true,
                order: {
                    id: trade.id,
                    txHash: receipt.hash,
                    coin,
                    tradeIndex,
                    side: trade.side,
                    size: positionSizeUsd,
                    leverage: clampedLev,
                    collateral,
                    executionPrice: price,
                    tp,
                    sl,
                    tpSet: trade.tpSet,
                    slSet: trade.slSet,
                    status: 'open',
                    filledAt: Date.now(),
                    gasUsed: receipt.gasUsed.toString(),
                },
                simulated: false,
                route: 'GAINS_ARBITRUM',
                fee
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[GAINS-EXEC] Open error:', err.message);
            console.error('[GAINS-EXEC] Full error:', err);
            return this.simulateOrder(order, 'OPEN');
        }
    }

    async closePosition(order) {
        this.stats.orders++;

        if (!this.initialized) {
            return this.simulateOrder(order, 'CLOSE');
        }

        try {
            const { tradeIndex, coin } = order;

            console.log(`[GAINS-EXEC] Closing trade #${tradeIndex} (${coin})...`);

            const diamond = new ethers.Contract(GAINS_CONTRACTS.Diamond, GAINS_DIAMOND_ABI, this.wallet);

            const tx = await diamond.closeTradeMarket(tradeIndex, {
                gasLimit: 1000000
            });

            console.log(`[GAINS-EXEC] Close TX: ${tx.hash}`);
            const receipt = await tx.wait();

            this.stats.filled++;

            // Update local trade
            const trade = this.activeTrades.find(t => t.pairIndex === tradeIndex);
            if (trade) {
                trade.status = 'closed';
                trade.closedAt = Date.now();
                this.saveTrades();
            }

            return {
                success: true,
                order: {
                    id: `CLOSE_${Date.now()}`,
                    txHash: receipt.hash,
                    tradeIndex,
                    coin,
                    status: 'closed',
                    filledAt: Date.now(),
                },
                simulated: false,
                route: 'GAINS_ARBITRUM_CLOSE'
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[GAINS-EXEC] Close error:', err.message);
            return this.simulateOrder(order, 'CLOSE');
        }
    }

    async updateStopLoss(tradeIndex, newSl) {
        if (!this.initialized) return { success: false, error: 'Not initialized' };

        try {
            const diamond = new ethers.Contract(GAINS_CONTRACTS.Diamond, GAINS_DIAMOND_ABI, this.wallet);
            const slPrice = ethers.parseUnits(newSl.toFixed(8), 10);

            const tx = await diamond.updateSl(tradeIndex, slPrice);
            const receipt = await tx.wait();

            return { success: true, txHash: receipt.hash };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async updateTakeProfit(tradeIndex, newTp) {
        if (!this.initialized) return { success: false, error: 'Not initialized' };

        try {
            const diamond = new ethers.Contract(GAINS_CONTRACTS.Diamond, GAINS_DIAMOND_ABI, this.wallet);
            const tpPrice = ethers.parseUnits(newTp.toFixed(8), 10);

            const tx = await diamond.updateTp(tradeIndex, tpPrice);
            const receipt = await tx.wait();

            return { success: true, txHash: receipt.hash };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // ===============================================================================
    // POSITION READING
    // ===============================================================================

    async getPositions(address = null) {
        const walletAddress = address || this.wallet?.address;
        if (!walletAddress) return { success: false, positions: [] };

        try {
            const diamond = new ethers.Contract(
                GAINS_CONTRACTS.Diamond,
                GAINS_DIAMOND_ABI,
                this.provider || new ethers.JsonRpcProvider(ARBITRUM_RPCS[0])
            );

            const rawTrades = await diamond.getTrades(walletAddress);

            const positions = rawTrades.map((trade, i) => {
                const positionSize = Number(ethers.formatUnits(trade.positionSizeUsd, 18));
                const leverage = trade.leverage / 1000;
                const collateral = positionSize / leverage;

                return {
                    index: i,
                    pairIndex: trade.pairIndex,
                    coin: this.getCoinFromIndex(trade.pairIndex),
                    side: trade.buy ? 'LONG' : 'SHORT',
                    positionSize,
                    leverage,
                    collateral,
                    entryPrice: Number(ethers.formatUnits(trade.openPrice, 10)),
                    tp: Number(ethers.formatUnits(trade.tp, 10)),
                    sl: Number(ethers.formatUnits(trade.sl, 10))
                };
            }).filter(p => p.positionSize > 0);

            return {
                success: true,
                wallet: walletAddress,
                count: positions.length,
                positions
            };

        } catch (err) {
            console.error('[GAINS-EXEC] getPositions error:', err.message);
            return { success: false, error: err.message, positions: [] };
        }
    }

    /**
     * Get positions using SDK with comprehensive fee data
     * Returns enriched trade data with borrowing fees, funding fees, PnL
     */
    async getPositionsSDK(address = null) {
        const walletAddress = address || this.wallet?.address;
        if (!walletAddress || !this.sdkContracts) {
            return this.getPositions(address); // Fallback to basic method
        }

        try {
            const { fetchOpenPairTrades } = GainsSDK;

            const tradeContainers = await fetchOpenPairTrades(this.sdkContracts, {
                traders: [walletAddress],
                batchSize: 50,
                includeLimits: true,
                includeUIRealizedPnlData: true
            });

            const positions = tradeContainers.map(container => {
                const { trade, tradeInfo, liquidationParams, tradeFeesData } = container;

                return {
                    index: trade.index,
                    pairIndex: trade.pairIndex,
                    coin: this.getCoinFromIndex(trade.pairIndex),
                    side: trade.long ? 'LONG' : 'SHORT',
                    positionSize: trade.collateralAmount * trade.leverage,
                    leverage: trade.leverage,
                    collateral: trade.collateralAmount,
                    entryPrice: trade.openPrice,
                    tp: trade.tp,
                    sl: trade.sl,
                    tradeType: trade.tradeType, // 0=MARKET, 1=LIMIT, 2=STOP
                    isCounterTrade: trade.isCounterTrade,
                    // Enhanced data from SDK
                    createdBlock: tradeInfo.createdBlock,
                    collateralPriceUsd: tradeInfo.collateralPriceUsd,
                    maxSlippageP: tradeInfo.maxSlippageP,
                    // Fee data
                    realizedTradingFees: tradeFeesData?.realizedTradingFeesCollateral || 0,
                    realizedPnl: tradeFeesData?.realizedPnlCollateral || 0,
                    // Liquidation
                    liqPrice: liquidationParams?.liqPrice || 0
                };
            });

            return {
                success: true,
                wallet: walletAddress,
                count: positions.length,
                positions,
                sdkEnhanced: true
            };

        } catch (err) {
            console.error('[GAINS-EXEC] getPositionsSDK error:', err.message);
            // Fallback to basic method
            return this.getPositions(address);
        }
    }

    // ===============================================================================
    // UNIFIED EXECUTE
    // ===============================================================================

    async execute(order) {
        const { type, action, pair, side, quantity, size, leverage } = order;

        // Handle close
        if (type === 'close' || action === 'close') {
            return await this.closePosition({
                tradeIndex: order.tradeIndex || 0,
                coin: pair?.replace('/USD', '').replace('-PERP', '') || order.coin
            });
        }

        // Default: open position
        return await this.openPosition({
            coin: pair?.replace('/USD', '').replace('-PERP', '').replace('/USDC', '') || order.coin,
            side: side || 'long',
            size: size || quantity || 50,
            leverage: leverage || 10,
            tp: order.tp || 0,
            sl: order.sl || 0
        });
    }

    // ===============================================================================
    // HELPERS
    // ===============================================================================

    getPairIndex(coin) {
        const normalized = coin.toUpperCase().replace('/USD', '').replace('-PERP', '').replace('/USDC', '');
        return PAIR_INDEXES[normalized] !== undefined ? PAIR_INDEXES[normalized] : null;
    }

    getCoinFromIndex(index) {
        for (const [coin, idx] of Object.entries(PAIR_INDEXES)) {
            if (idx === index) return coin;
        }
        return `PAIR_${index}`;
    }

    getAssetCategory(pairIndex) {
        if (pairIndex >= 0 && pairIndex <= 29) return 'crypto';
        if (pairIndex >= 30 && pairIndex <= 39) return 'forex';
        if (pairIndex >= 40 && pairIndex <= 49) return 'stocks';
        if (pairIndex >= 50 && pairIndex <= 52) return 'commodities';
        return 'crypto';
    }

    async getPrice(coin) {
        try {
            const normalized = coin.toUpperCase().replace('/USD', '');
            const pairIndex = PAIR_INDEXES[normalized];

            // Forex prices
            if (pairIndex >= 30 && pairIndex <= 39) {
                const forexPrices = {
                    30: 1.085, 31: 1.27, 32: 150.5, 33: 0.89,
                    34: 0.65, 35: 1.36, 36: 0.62, 37: 0.855,
                    38: 163.2, 39: 191.1
                };
                return forexPrices[pairIndex] || 1;
            }

            // Commodities
            if (pairIndex >= 50) {
                const commodityPrices = { 50: 2650, 51: 31.5, 52: 75 };
                return commodityPrices[pairIndex] || 1;
            }

            // Crypto via Binance
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${normalized}USDT`);
            const data = await res.json();
            return parseFloat(data.price);
        } catch (e) {
            return null;
        }
    }

    simulateOrder(order, type) {
        const { coin, side, size = 50, leverage = 10 } = order;
        const isLong = side?.toLowerCase() === 'buy' || side?.toLowerCase() === 'long';

        return {
            success: true,
            order: {
                id: `SIM_GAINS_${type}_${Date.now()}`,
                coin: coin || 'BTC',
                side: isLong ? 'LONG' : 'SHORT',
                size: size,
                leverage,
                executionPrice: 95000,
                status: 'simulated',
                filledAt: Date.now(),
            },
            simulated: true,
            route: `SIMULATED_GAINS_${type}`,
            fee: size * 0.0008
        };
    }

    // Persistence
    loadTrades() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                this.activeTrades = data.trades || [];
                this.stats = { ...this.stats, ...data.stats };
            }
        } catch (e) {
            console.log('[GAINS-EXEC] No saved trades found');
        }
    }

    saveTrades() {
        try {
            const dir = path.dirname(DATA_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(DATA_FILE, JSON.stringify({
                trades: this.activeTrades,
                stats: this.stats,
                savedAt: new Date().toISOString()
            }, null, 2));
        } catch (e) {
            console.error('[GAINS-EXEC] Save error:', e.message);
        }
    }

    getStats() {
        return {
            initialized: this.initialized,
            wallet: this.wallet?.address || null,
            activeTrades: this.activeTrades.filter(t => t.status === 'open').length,
            ...this.stats,
            supportedPairs: Object.keys(PAIR_INDEXES).length
        };
    }

    getSupportedPairs() {
        return {
            pairs: PAIR_INDEXES,
            count: Object.keys(PAIR_INDEXES).length,
            categories: {
                crypto: Object.entries(PAIR_INDEXES).filter(([k, v]) => v <= 29).map(([k]) => k),
                forex: Object.entries(PAIR_INDEXES).filter(([k, v]) => v >= 30 && v <= 39).map(([k]) => k),
                stocks: Object.entries(PAIR_INDEXES).filter(([k, v]) => v >= 40 && v <= 49).map(([k]) => k),
                commodities: Object.entries(PAIR_INDEXES).filter(([k, v]) => v >= 50).map(([k]) => k),
            },
            leverageLimits: LEVERAGE_LIMITS
        };
    }

    async getBalances() {
        if (!this.initialized || !this.wallet) {
            return { usdc: 0, eth: 0, gusdc: 0, initialized: false };
        }

        try {
            const usdc = new ethers.Contract(GAINS_CONTRACTS.USDC, ERC20_ABI, this.provider);
            const gusdc = new ethers.Contract(GAINS_CONTRACTS.gUSDC, ERC20_ABI, this.provider);

            const [usdcBal, gusdcBal, ethBal] = await Promise.all([
                usdc.balanceOf(this.wallet.address),
                gusdc.balanceOf(this.wallet.address),
                this.provider.getBalance(this.wallet.address)
            ]);

            return {
                usdc: Number(ethers.formatUnits(usdcBal, 6)),
                gusdc: Number(ethers.formatUnits(gusdcBal, 6)),
                eth: Number(ethers.formatEther(ethBal)),
                wallet: this.wallet.address,
                initialized: true
            };
        } catch (err) {
            return { usdc: 0, eth: 0, gusdc: 0, error: err.message };
        }
    }
}

module.exports = {
    GainsExecutor,
    GAINS_CONTRACTS,
    PAIR_INDEXES,
    LEVERAGE_LIMITS,
    COLLATERAL_INDEX,
    SDK_ADDRESSES,
    GainsSDK,
    VERSION: '2.1.0'
};
