// ===============================================================================
// OBELISK - MUX PROTOCOL EXECUTOR V1.0
// Perpetual trading on MUX Protocol (Arbitrum) - Up to 100x leverage
// Uses OrderBook contract with sub-account system
// Native SL/TP via POSITION_TPSL_STRATEGY flag
// ===============================================================================
console.log('[MUX-EXEC] V1.0 LOADED');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ethers } = require('ethers');
const fs = require('fs');

// ===============================================================================
// CONFIGURATION
// ===============================================================================

const ARBITRUM_RPCS = [
    'https://arbitrum-one.public.blastapi.io',
    'https://1rpc.io/arb',
    'https://arb1.arbitrum.io/rpc',
];
const ARBITRUM_CHAIN_ID = 42161;

// MUX Protocol Contracts (Arbitrum)
const MUX_CONTRACTS = {
    OrderBook: '0xa19fD5aB6C8DCffa2A295F78a5Bb4aC543AAF5e3',
    LiquidityPool: '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633',
    Reader: '0xF64B4bD682E792e0BA78956B86F2Cee946d2E7D6',
    NativeUnwrapper: '0x675807f847A5802539B5895F9c12E55b7864b213',
    ReferralManager: '0xa68d96F26112377abdF3d6b9fcde9D54f2604C2a',
};

// MUX Asset IDs (on Arbitrum)
const MUX_ASSETS = {
    ETH: 0,
    BTC: 1,
    USDC: 2,
    USDT: 3,
    DAI: 4,
    WBTC: 5,
    ARB: 11,
    AVAX: 6,
    BNB: 7,
    FTM: 8,
    LINK: 9,
    UNI: 10,
};

// Token addresses for collateral
const MUX_TOKENS = {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
};

// Position flags (from LibOrder.sol)
const POSITION_FLAGS = {
    OPEN: 0x80,
    MARKET_ORDER: 0x40,
    WITHDRAW_ALL_IF_EMPTY: 0x20,
    TRIGGER_ORDER: 0x10,
    TPSL_STRATEGY: 0x08,
    SHOULD_REACH_MIN_PROFIT: 0x04,
};

// Leverage limits
const MUX_LEVERAGE_LIMIT = 100;

// ABIs
const ERC20_ABI = [
    'function approve(address spender, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function allowance(address owner, address spender) view returns (uint256)',
];

const MUX_ORDERBOOK_ABI = [
    'function placePositionOrder3(bytes32 subAccountId, uint96 collateralAmount, uint96 size, uint96 price, uint8 profitTokenId, uint8 flags, uint32 deadline, bytes32 referralCode, tuple(uint96 tpPrice, uint96 slPrice, uint8 tpslProfitTokenId, uint32 tpslDeadline) extra) external payable',
    'function cancelOrder(uint64 orderId) external',
    'function depositCollateral(bytes32 subAccountId, uint256 collateralAmount) external payable',
    'function withdrawAllCollateral(bytes32 subAccountId) external',
];

const MUX_READER_ABI = [
    'function getSubAccounts(bytes32[] calldata subAccountIds) external view returns (tuple(uint96 collateral, uint96 size, uint32 lastIncreasedTime, uint96 entryPrice, uint128 entryFunding)[])',
];

// Data persistence
const DATA_FILE = path.join(__dirname, 'data', 'mux_trades.json');

// ===============================================================================
// MUX EXECUTOR CLASS
// ===============================================================================

class MuxExecutor {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.initialized = false;
        this.stats = { orders: 0, filled: 0, failed: 0, volume: 0 };
        this.activeTrades = [];
    }

    async init() {
        try {
            const privateKey = process.env.PRIVATE_KEY;
            if (!privateKey) {
                console.log('[MUX-EXEC] No private key, simulation mode');
                return false;
            }

            for (const rpc of ARBITRUM_RPCS) {
                try {
                    this.provider = new ethers.JsonRpcProvider(rpc, undefined, { staticNetwork: true });
                    this.wallet = new ethers.Wallet(privateKey, this.provider);

                    const network = await Promise.race([
                        this.provider.getNetwork(),
                        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
                    ]);

                    if (Number(network.chainId) === ARBITRUM_CHAIN_ID) {
                        console.log(`[MUX-EXEC] Connected via ${rpc.slice(8, 35)}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!this.provider) {
                console.log('[MUX-EXEC] All RPCs failed');
                return false;
            }

            const balance = await this.provider.getBalance(this.wallet.address);
            console.log(`[MUX-EXEC] Wallet: ${this.wallet.address}`);
            console.log(`[MUX-EXEC] ETH Balance: ${parseFloat(ethers.formatEther(balance)).toFixed(4)} ETH`);

            this.loadTrades();
            this.initialized = true;
            return true;

        } catch (err) {
            console.error('[MUX-EXEC] Init error:', err.message);
            return false;
        }
    }

    /**
     * Generate sub-account ID for MUX
     * subAccountId = keccak256(abi.encodePacked(userAddress, collateralId, assetId, isLong))
     */
    getSubAccountId(assetId, collateralId, isLong) {
        return ethers.keccak256(
            ethers.solidityPacked(
                ['address', 'uint8', 'uint8', 'bool'],
                [this.wallet.address, collateralId, assetId, isLong]
            )
        );
    }

    // ===============================================================================
    // TRADING
    // ===============================================================================

    async openPosition(order) {
        this.stats.orders++;

        if (!this.initialized) {
            return this.simulateOrder(order, 'OPEN');
        }

        try {
            const { coin, side, size, leverage = 10, tp = 0, sl = 0 } = order;
            const isLong = side.toLowerCase() === 'buy' || side.toLowerCase() === 'long';

            // Get asset ID
            const assetId = MUX_ASSETS[coin.toUpperCase()];
            if (assetId === undefined) {
                console.log(`[MUX-EXEC] Unsupported asset: ${coin}`);
                return this.simulateOrder(order, 'UNSUPPORTED');
            }

            // Clamp leverage
            const clampedLev = Math.min(leverage, MUX_LEVERAGE_LIMIT);

            // Calculate collateral
            const collateral = size / clampedLev;
            const collateralWei = ethers.parseUnits(collateral.toFixed(6), 6); // USDC 6 decimals

            // Check USDC balance
            const usdc = new ethers.Contract(MUX_TOKENS.USDC, ERC20_ABI, this.wallet);
            const usdcBalance = await usdc.balanceOf(this.wallet.address);
            if (usdcBalance < collateralWei) {
                return {
                    success: false,
                    error: `Insufficient USDC. Need $${collateral.toFixed(2)}, have $${ethers.formatUnits(usdcBalance, 6)}`,
                    simulated: true
                };
            }

            // Approve USDC for OrderBook
            const allowance = await usdc.allowance(this.wallet.address, MUX_CONTRACTS.OrderBook);
            if (allowance < collateralWei) {
                console.log(`[MUX-EXEC] Approving USDC for OrderBook...`);
                const approveTx = await usdc.approve(MUX_CONTRACTS.OrderBook, ethers.MaxUint256);
                await approveTx.wait();
            }

            // Get price
            const price = await this.getPrice(coin);
            if (!price) {
                return { success: false, error: 'Could not get price', simulated: true };
            }

            // Build sub-account ID
            const collateralId = MUX_ASSETS.USDC;
            const subAccountId = this.getSubAccountId(assetId, collateralId, isLong);

            // Build flags
            let flags = POSITION_FLAGS.OPEN | POSITION_FLAGS.MARKET_ORDER | POSITION_FLAGS.WITHDRAW_ALL_IF_EMPTY;
            if (tp > 0 || sl > 0) {
                flags |= POSITION_FLAGS.TPSL_STRATEGY;
            }

            // Size in 18 decimals
            const sizeWei = ethers.parseUnits((size / price).toFixed(18), 18);

            // TP/SL extra params
            const tpPrice = tp > 0 ? ethers.parseUnits(tp.toString(), 18) : 0n;
            const slPrice = sl > 0 ? ethers.parseUnits(sl.toString(), 18) : 0n;
            const deadline = Math.floor(Date.now() / 10000) + 8640; // 24h in 10s increments

            const extra = {
                tpPrice,
                slPrice,
                tpslProfitTokenId: collateralId,
                tpslDeadline: deadline,
            };

            console.log(`[MUX-EXEC] Opening ${isLong ? 'LONG' : 'SHORT'} ${coin} $${size} @ ${clampedLev}x${tp ? ' TP=$' + tp : ''}${sl ? ' SL=$' + sl : ''}`);

            const orderBook = new ethers.Contract(MUX_CONTRACTS.OrderBook, MUX_ORDERBOOK_ABI, this.wallet);

            // Execution fee in ETH
            const executionFee = ethers.parseEther('0.003');

            const tx = await orderBook.placePositionOrder3(
                subAccountId,
                collateralWei,
                sizeWei,
                0, // price = 0 for market orders
                collateralId, // profitTokenId
                flags,
                deadline,
                ethers.ZeroHash, // referralCode
                extra,
                { value: executionFee, gasLimit: 1500000 }
            );

            console.log(`[MUX-EXEC] TX submitted: ${tx.hash}`);
            const receipt = await tx.wait();

            this.stats.filled++;
            this.stats.volume += size;

            const trade = {
                id: `MUX_${Date.now()}`,
                txHash: receipt.hash,
                coin,
                assetId,
                subAccountId,
                side: isLong ? 'LONG' : 'SHORT',
                size,
                leverage: clampedLev,
                collateral,
                entryPrice: price,
                tp, sl,
                openedAt: Date.now(),
                status: 'open'
            };

            this.activeTrades.push(trade);
            this.saveTrades();

            return {
                success: true,
                order: {
                    id: trade.id,
                    txHash: receipt.hash,
                    coin,
                    side: trade.side,
                    size,
                    leverage: clampedLev,
                    collateral,
                    executionPrice: price,
                    tp, sl,
                    tpSet: tp > 0,
                    slSet: sl > 0,
                    status: 'submitted',
                    filledAt: Date.now(),
                    gasUsed: receipt.gasUsed.toString(),
                },
                simulated: false,
                route: 'MUX_ARBITRUM',
                fee: size * 0.0006 // 0.06% fee
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[MUX-EXEC] Open error:', err.message);
            return this.simulateOrder(order, 'OPEN');
        }
    }

    async closePosition(order) {
        this.stats.orders++;

        if (!this.initialized) {
            return this.simulateOrder(order, 'CLOSE');
        }

        try {
            const { coin, side, size } = order;
            const isLong = side.toLowerCase() === 'long' || side.toLowerCase() === 'buy';

            const assetId = MUX_ASSETS[coin.toUpperCase()];
            if (assetId === undefined) {
                return this.simulateOrder(order, 'CLOSE_UNSUPPORTED');
            }

            const price = await this.getPrice(coin);
            if (!price) {
                return { success: false, error: 'Could not get price', simulated: true };
            }

            const collateralId = MUX_ASSETS.USDC;
            const subAccountId = this.getSubAccountId(assetId, collateralId, isLong);

            // Close = no POSITION_OPEN flag + MARKET_ORDER
            const flags = POSITION_FLAGS.MARKET_ORDER | POSITION_FLAGS.WITHDRAW_ALL_IF_EMPTY;

            const sizeWei = ethers.parseUnits((size / price).toFixed(18), 18);
            const deadline = Math.floor(Date.now() / 10000) + 8640;

            const emptyExtra = {
                tpPrice: 0n,
                slPrice: 0n,
                tpslProfitTokenId: 0,
                tpslDeadline: 0,
            };

            console.log(`[MUX-EXEC] Closing ${isLong ? 'LONG' : 'SHORT'} ${coin} $${size}`);

            const orderBook = new ethers.Contract(MUX_CONTRACTS.OrderBook, MUX_ORDERBOOK_ABI, this.wallet);
            const executionFee = ethers.parseEther('0.003');

            const tx = await orderBook.placePositionOrder3(
                subAccountId,
                0, // no additional collateral
                sizeWei,
                0, // market price
                collateralId,
                flags,
                deadline,
                ethers.ZeroHash,
                emptyExtra,
                { value: executionFee, gasLimit: 1500000 }
            );

            const receipt = await tx.wait();
            this.stats.filled++;

            // Update local trade
            const trade = this.activeTrades.find(t => t.coin === coin && t.status === 'open');
            if (trade) {
                trade.status = 'closed';
                trade.closedAt = Date.now();
                this.saveTrades();
            }

            return {
                success: true,
                order: {
                    id: `CLOSE_MUX_${Date.now()}`,
                    txHash: receipt.hash,
                    coin,
                    side: `CLOSE_${isLong ? 'LONG' : 'SHORT'}`,
                    size,
                    executionPrice: price,
                    status: 'submitted',
                    filledAt: Date.now(),
                },
                simulated: false,
                route: 'MUX_ARBITRUM_CLOSE'
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[MUX-EXEC] Close error:', err.message);
            return this.simulateOrder(order, 'CLOSE');
        }
    }

    async getPositions(address = null) {
        const walletAddress = address || this.wallet?.address;
        if (!walletAddress) return { success: false, positions: [] };

        try {
            const reader = new ethers.Contract(MUX_CONTRACTS.Reader, MUX_READER_ABI, this.provider);

            // Query sub-accounts for common assets (both long/short)
            const subAccountIds = [];
            const subAccountMeta = [];

            for (const [coin, assetId] of Object.entries(MUX_ASSETS)) {
                if (coin === 'USDC' || coin === 'USDT' || coin === 'DAI') continue;
                for (const isLong of [true, false]) {
                    const subId = ethers.keccak256(
                        ethers.solidityPacked(
                            ['address', 'uint8', 'uint8', 'bool'],
                            [walletAddress, MUX_ASSETS.USDC, assetId, isLong]
                        )
                    );
                    subAccountIds.push(subId);
                    subAccountMeta.push({ coin, assetId, isLong });
                }
            }

            const rawAccounts = await reader.getSubAccounts(subAccountIds);

            const positions = [];
            rawAccounts.forEach((acc, i) => {
                const sizeVal = Number(ethers.formatUnits(acc.size, 18));
                if (sizeVal > 0) {
                    const meta = subAccountMeta[i];
                    const entryPrice = Number(ethers.formatUnits(acc.entryPrice, 18));
                    const collateral = Number(ethers.formatUnits(acc.collateral, 6));

                    positions.push({
                        coin: meta.coin,
                        side: meta.isLong ? 'LONG' : 'SHORT',
                        size: sizeVal,
                        sizeUsd: (sizeVal * entryPrice).toFixed(2),
                        entryPrice,
                        collateral,
                        leverage: collateral > 0 ? ((sizeVal * entryPrice) / collateral).toFixed(1) : '0',
                        venue: 'mux'
                    });
                }
            });

            return { success: true, wallet: walletAddress, count: positions.length, positions };

        } catch (err) {
            console.error('[MUX-EXEC] getPositions error:', err.message);
            return { success: false, error: err.message, positions: [] };
        }
    }

    // ===============================================================================
    // HELPERS
    // ===============================================================================

    async getPrice(coin) {
        try {
            const normalized = coin.toUpperCase();
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${normalized}USDT`);
            const data = await res.json();
            return parseFloat(data.price);
        } catch (e) {
            return null;
        }
    }

    async execute(order) {
        const { type, action, pair, side, size, leverage } = order;
        if (type === 'close' || action === 'close') {
            return await this.closePosition({
                coin: pair?.replace('/USD', '').replace('-PERP', '').replace('/USDC', '') || order.coin,
                side: order.positionSide || side || 'long',
                size: size || order.quantity,
            });
        }
        return await this.openPosition({
            coin: pair?.replace('/USD', '').replace('-PERP', '').replace('/USDC', '') || order.coin,
            side: side || 'long',
            size: size || order.quantity || 50,
            leverage: leverage || 10,
            tp: order.tp || 0,
            sl: order.sl || 0,
        });
    }

    simulateOrder(order, type) {
        const { coin, side, size = 50, leverage = 10 } = order;
        return {
            success: true,
            order: {
                id: `SIM_MUX_${type}_${Date.now()}`,
                coin: coin || 'ETH',
                side: side || 'LONG',
                size, leverage,
                executionPrice: 3200,
                status: 'simulated',
                filledAt: Date.now(),
            },
            simulated: true,
            route: `SIMULATED_MUX_${type}`,
            fee: size * 0.0006
        };
    }

    loadTrades() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                this.activeTrades = data.trades || [];
                this.stats = { ...this.stats, ...data.stats };
            }
        } catch (e) {}
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
        } catch (e) {}
    }

    getStats() {
        return {
            initialized: this.initialized,
            wallet: this.wallet?.address || null,
            activeTrades: this.activeTrades.filter(t => t.status === 'open').length,
            supportedAssets: Object.keys(MUX_ASSETS).filter(a => !['USDC', 'USDT', 'DAI'].includes(a)),
            maxLeverage: MUX_LEVERAGE_LIMIT,
            ...this.stats
        };
    }

    getSupportedPairs() {
        const tradeable = Object.keys(MUX_ASSETS).filter(a => !['USDC', 'USDT', 'DAI', 'WBTC'].includes(a));
        return {
            pairs: tradeable,
            count: tradeable.length,
            maxLeverage: MUX_LEVERAGE_LIMIT,
            fees: { open: '0.06%', close: '0.06%' }
        };
    }
}

module.exports = { MuxExecutor, MUX_CONTRACTS, MUX_ASSETS };
