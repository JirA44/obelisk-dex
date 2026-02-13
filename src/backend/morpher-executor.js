// ===============================================================================
// OBELISK - MORPHER EXECUTOR V1.0
// Trading on Morpher Protocol (Sidechain Chain ID 21)
// 800+ markets: Crypto, Stocks, Forex, Commodities, Indices
// Zero fees, up to 10x leverage, oracle-based execution
// ===============================================================================
console.log('[MORPHER-EXEC] V1.0 LOADED');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ethers } = require('ethers');
const fs = require('fs');

// ===============================================================================
// CONFIGURATION
// ===============================================================================

const MORPHER_SIDECHAIN_RPC = 'https://sidechain.morpher.com';
const MORPHER_CHAIN_ID = 21;

// Morpher Sidechain Contracts
const MORPHER_CONTRACTS = {
    Token: '0xC44628734a9432a3DAA302E11AfbdFa8361424A5',
    State: '0xB4881186b9E52F8BD6EC5F19708450cE57b24370',
    Oracle: '0x434C8915D68f98F956A6Fd5d7e0cA6a2b6516590',
    TradeEngine: '0x9de9773A77a9b51330736E73429622CC32F51926',
};

// Market IDs - Morpher uses keccak256 hashes of market names
// These are the most commonly traded markets
const MORPHER_MARKETS = {
    // Crypto
    BTC: ethers.id('CRYPTO_BTC'),
    ETH: ethers.id('CRYPTO_ETH'),
    SOL: ethers.id('CRYPTO_SOL'),
    XRP: ethers.id('CRYPTO_XRP'),
    ADA: ethers.id('CRYPTO_ADA'),
    DOGE: ethers.id('CRYPTO_DOGE'),
    DOT: ethers.id('CRYPTO_DOT'),
    LINK: ethers.id('CRYPTO_LINK'),
    AVAX: ethers.id('CRYPTO_AVAX'),
    MATIC: ethers.id('CRYPTO_MATIC'),
    UNI: ethers.id('CRYPTO_UNI'),
    AAVE: ethers.id('CRYPTO_AAVE'),
    ARB: ethers.id('CRYPTO_ARB'),
    OP: ethers.id('CRYPTO_OP'),
    // Stocks
    AAPL: ethers.id('STOCK_AAPL'),
    GOOGL: ethers.id('STOCK_GOOGL'),
    AMZN: ethers.id('STOCK_AMZN'),
    TSLA: ethers.id('STOCK_TSLA'),
    MSFT: ethers.id('STOCK_MSFT'),
    NVDA: ethers.id('STOCK_NVDA'),
    META: ethers.id('STOCK_META'),
    NFLX: ethers.id('STOCK_NFLX'),
    AMD: ethers.id('STOCK_AMD'),
    // Forex
    EURUSD: ethers.id('FOREX_EURUSD'),
    GBPUSD: ethers.id('FOREX_GBPUSD'),
    USDJPY: ethers.id('FOREX_USDJPY'),
    // Commodities
    XAU: ethers.id('COMMODITY_GOLD'),
    XAG: ethers.id('COMMODITY_SILVER'),
    WTI: ethers.id('COMMODITY_OIL'),
};

const MAX_LEVERAGE = 10;

// ABIs
const MORPHER_TOKEN_ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
];

const MORPHER_ORACLE_ABI = [
    'function createOrder(bytes32 marketId, uint256 closeSharesAmount, uint256 openMPHTokenAmount, bool tradeDirection, uint256 orderLeverage, uint256 stopLoss, uint256 takeProfit) external',
];

const MORPHER_STATE_ABI = [
    'function getPosition(address user, bytes32 marketId) view returns (uint256 averagePrice, uint256 averageSpread, uint256 averageLeverage, uint256 longShares, uint256 shortShares, uint256 meanEntryPrice, uint256 meanEntrySpread, uint256 meanEntryLeverage, uint256 liquidationPrice, uint256 liquidationTimestamp)',
];

// Data persistence
const DATA_FILE = path.join(__dirname, 'data', 'morpher_trades.json');

// ===============================================================================
// MORPHER EXECUTOR CLASS
// ===============================================================================

class MorpherExecutor {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.initialized = false;
        this.stats = { orders: 0, filled: 0, failed: 0, volume: 0 };
        this.activeTrades = [];
    }

    async init() {
        try {
            // Morpher uses its own private key (sidechain)
            const privateKey = process.env.MORPHER_PRIVATE_KEY || process.env.PRIVATE_KEY;
            if (!privateKey || privateKey === 'CHANGE_ME') {
                console.log('[MORPHER-EXEC] No private key configured, simulation mode');
                return false;
            }

            try {
                this.provider = new ethers.JsonRpcProvider(MORPHER_SIDECHAIN_RPC, undefined, { staticNetwork: true });
                this.wallet = new ethers.Wallet(privateKey, this.provider);

                const network = await Promise.race([
                    this.provider.getNetwork(),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
                ]);

                console.log(`[MORPHER-EXEC] Connected to Morpher Sidechain (Chain ${Number(network.chainId)})`);
            } catch (e) {
                console.log(`[MORPHER-EXEC] Sidechain connection failed: ${e.message}`);
                return false;
            }

            // Check MPH balance
            const token = new ethers.Contract(MORPHER_CONTRACTS.Token, MORPHER_TOKEN_ABI, this.provider);
            const balance = await token.balanceOf(this.wallet.address);
            const mphBalance = parseFloat(ethers.formatEther(balance));
            console.log(`[MORPHER-EXEC] Wallet: ${this.wallet.address}`);
            console.log(`[MORPHER-EXEC] MPH Balance: ${mphBalance.toFixed(2)} MPH`);

            this.loadTrades();
            this.initialized = true;
            return true;

        } catch (err) {
            console.error('[MORPHER-EXEC] Init error:', err.message);
            return false;
        }
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
            const { coin, side, size, leverage = 1, tp = 0, sl = 0 } = order;
            const isLong = side.toLowerCase() === 'buy' || side.toLowerCase() === 'long';

            // Get market ID
            const marketId = MORPHER_MARKETS[coin.toUpperCase()];
            if (!marketId) {
                console.log(`[MORPHER-EXEC] Unsupported market: ${coin}`);
                return this.simulateOrder(order, 'UNSUPPORTED');
            }

            // Clamp leverage
            const clampedLev = Math.min(leverage, MAX_LEVERAGE);

            // Get price
            const price = await this.getPrice(coin);
            if (!price) {
                return { success: false, error: 'Could not get price', simulated: true };
            }

            // Calculate MPH amount needed (size in USD / MPH price)
            // For now we use size directly as MPH amount
            const mphAmount = ethers.parseEther(size.toString());

            // Check MPH balance
            const token = new ethers.Contract(MORPHER_CONTRACTS.Token, MORPHER_TOKEN_ABI, this.wallet);
            const balance = await token.balanceOf(this.wallet.address);
            if (balance < mphAmount) {
                return {
                    success: false,
                    error: `Insufficient MPH. Need ${size}, have ${ethers.formatEther(balance)}`,
                    simulated: true
                };
            }

            // Convert SL/TP to Morpher precision (1e8)
            const slScaled = sl > 0 ? ethers.parseUnits(sl.toFixed(8), 8) : 0n;
            const tpScaled = tp > 0 ? ethers.parseUnits(tp.toFixed(8), 8) : 0n;
            const leverageScaled = ethers.parseUnits(clampedLev.toString(), 8);

            console.log(`[MORPHER-EXEC] Opening ${isLong ? 'LONG' : 'SHORT'} ${coin} ${size} MPH @ ${clampedLev}x${tp ? ' TP=$' + tp : ''}${sl ? ' SL=$' + sl : ''}`);

            const oracle = new ethers.Contract(MORPHER_CONTRACTS.Oracle, MORPHER_ORACLE_ABI, this.wallet);

            // createOrder: marketId, closeShares(0=open), openAmount, direction, leverage, sl, tp
            const tx = await oracle.createOrder(
                marketId,
                0,                    // closeSharesAmount = 0 for opening
                mphAmount,            // openMPHTokenAmount
                isLong,               // tradeDirection (true=long)
                leverageScaled,       // orderLeverage (1e8 precision)
                slScaled,             // stopLoss
                tpScaled,             // takeProfit
                { gasLimit: 500000 }  // Sidechain gas is free
            );

            console.log(`[MORPHER-EXEC] TX submitted: ${tx.hash}`);
            const receipt = await tx.wait();

            this.stats.filled++;
            this.stats.volume += size;

            const trade = {
                id: `MORPHER_${Date.now()}`,
                txHash: receipt.hash,
                coin,
                marketId,
                side: isLong ? 'LONG' : 'SHORT',
                size,
                leverage: clampedLev,
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
                    executionPrice: price,
                    tp, sl,
                    tpSet: tp > 0,
                    slSet: sl > 0,
                    status: 'submitted',
                    filledAt: Date.now(),
                    gasUsed: receipt.gasUsed.toString(),
                },
                simulated: false,
                route: 'MORPHER_SIDECHAIN',
                fee: 0 // Zero fees!
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[MORPHER-EXEC] Open error:', err.message);
            return this.simulateOrder(order, 'OPEN');
        }
    }

    async closePosition(order) {
        this.stats.orders++;

        if (!this.initialized) {
            return this.simulateOrder(order, 'CLOSE');
        }

        try {
            const { coin, side } = order;
            const isLong = side.toLowerCase() === 'long' || side.toLowerCase() === 'buy';

            const marketId = MORPHER_MARKETS[coin.toUpperCase()];
            if (!marketId) {
                return this.simulateOrder(order, 'CLOSE_UNSUPPORTED');
            }

            // Get current position to know shares amount
            const state = new ethers.Contract(MORPHER_CONTRACTS.State, MORPHER_STATE_ABI, this.provider);
            const position = await state.getPosition(this.wallet.address, marketId);

            const shares = isLong ? position.longShares : position.shortShares;
            if (shares === 0n) {
                return { success: false, error: 'No position to close', simulated: true };
            }

            const price = await this.getPrice(coin);

            console.log(`[MORPHER-EXEC] Closing ${isLong ? 'LONG' : 'SHORT'} ${coin} (${ethers.formatEther(shares)} shares)`);

            const oracle = new ethers.Contract(MORPHER_CONTRACTS.Oracle, MORPHER_ORACLE_ABI, this.wallet);

            // createOrder with closeShares > 0 and openAmount = 0
            const tx = await oracle.createOrder(
                marketId,
                shares,      // closeSharesAmount (close all)
                0,            // openMPHTokenAmount = 0 for closing
                isLong,       // same direction
                ethers.parseUnits('1', 8), // leverage doesn't matter for close
                0, 0,         // no SL/TP for close
                { gasLimit: 500000 }
            );

            const receipt = await tx.wait();
            this.stats.filled++;

            const trade = this.activeTrades.find(t => t.coin === coin && t.status === 'open');
            if (trade) {
                trade.status = 'closed';
                trade.closedAt = Date.now();
                this.saveTrades();
            }

            return {
                success: true,
                order: {
                    id: `CLOSE_MORPHER_${Date.now()}`,
                    txHash: receipt.hash,
                    coin,
                    side: `CLOSE_${isLong ? 'LONG' : 'SHORT'}`,
                    executionPrice: price,
                    status: 'submitted',
                    filledAt: Date.now(),
                },
                simulated: false,
                route: 'MORPHER_SIDECHAIN_CLOSE',
                fee: 0
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[MORPHER-EXEC] Close error:', err.message);
            return this.simulateOrder(order, 'CLOSE');
        }
    }

    async getPositions(address = null) {
        const walletAddress = address || this.wallet?.address;
        if (!walletAddress) return { success: false, positions: [] };

        try {
            const state = new ethers.Contract(
                MORPHER_CONTRACTS.State,
                MORPHER_STATE_ABI,
                this.provider || new ethers.JsonRpcProvider(MORPHER_SIDECHAIN_RPC)
            );

            const positions = [];
            for (const [coin, marketId] of Object.entries(MORPHER_MARKETS)) {
                try {
                    const pos = await state.getPosition(walletAddress, marketId);
                    const longShares = Number(ethers.formatEther(pos.longShares));
                    const shortShares = Number(ethers.formatEther(pos.shortShares));

                    if (longShares > 0) {
                        positions.push({
                            coin, marketId,
                            side: 'LONG',
                            shares: longShares,
                            entryPrice: Number(ethers.formatUnits(pos.meanEntryPrice, 8)),
                            leverage: Number(ethers.formatUnits(pos.meanEntryLeverage, 8)),
                            liquidationPrice: Number(ethers.formatUnits(pos.liquidationPrice, 8)),
                            venue: 'morpher'
                        });
                    }
                    if (shortShares > 0) {
                        positions.push({
                            coin, marketId,
                            side: 'SHORT',
                            shares: shortShares,
                            entryPrice: Number(ethers.formatUnits(pos.meanEntryPrice, 8)),
                            leverage: Number(ethers.formatUnits(pos.meanEntryLeverage, 8)),
                            liquidationPrice: Number(ethers.formatUnits(pos.liquidationPrice, 8)),
                            venue: 'morpher'
                        });
                    }
                } catch (e) {
                    // Market might not exist or have errors
                }
            }

            return { success: true, wallet: walletAddress, count: positions.length, positions };

        } catch (err) {
            console.error('[MORPHER-EXEC] getPositions error:', err.message);
            return { success: false, error: err.message, positions: [] };
        }
    }

    // ===============================================================================
    // HELPERS
    // ===============================================================================

    async getPrice(coin) {
        try {
            const normalized = coin.toUpperCase();
            // Stocks: use different API
            if (['AAPL', 'GOOGL', 'AMZN', 'TSLA', 'MSFT', 'NVDA', 'META', 'NFLX', 'AMD'].includes(normalized)) {
                // Approximate stock prices (would need real API)
                const stockPrices = {
                    AAPL: 230, GOOGL: 185, AMZN: 210, TSLA: 390, MSFT: 450,
                    NVDA: 850, META: 580, NFLX: 720, AMD: 170,
                };
                return stockPrices[normalized] || 100;
            }
            // Forex
            if (['EURUSD', 'GBPUSD', 'USDJPY'].includes(normalized)) {
                const fxPrices = { EURUSD: 1.085, GBPUSD: 1.27, USDJPY: 150.5 };
                return fxPrices[normalized] || 1;
            }
            // Commodities
            if (['XAU', 'XAG', 'WTI'].includes(normalized)) {
                const commodityPrices = { XAU: 2650, XAG: 31.5, WTI: 75 };
                return commodityPrices[normalized] || 1;
            }
            // Crypto via Binance
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${normalized}USDT`);
            const data = await res.json();
            return parseFloat(data.price);
        } catch (e) {
            return null;
        }
    }

    async execute(order) {
        const { type, action } = order;
        if (type === 'close' || action === 'close') {
            return await this.closePosition(order);
        }
        return await this.openPosition(order);
    }

    simulateOrder(order, type) {
        const { coin, side, size = 50, leverage = 1 } = order;
        return {
            success: true,
            order: {
                id: `SIM_MORPHER_${type}_${Date.now()}`,
                coin: coin || 'BTC',
                side: side || 'LONG',
                size, leverage,
                executionPrice: 95000,
                status: 'simulated',
                filledAt: Date.now(),
            },
            simulated: true,
            route: `SIMULATED_MORPHER_${type}`,
            fee: 0
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
            chain: 'Morpher Sidechain (21)',
            activeTrades: this.activeTrades.filter(t => t.status === 'open').length,
            supportedMarkets: Object.keys(MORPHER_MARKETS).length,
            maxLeverage: MAX_LEVERAGE,
            fees: '0% (zero fees)',
            ...this.stats
        };
    }

    getSupportedPairs() {
        const crypto = Object.keys(MORPHER_MARKETS).filter(k => !['AAPL', 'GOOGL', 'AMZN', 'TSLA', 'MSFT', 'NVDA', 'META', 'NFLX', 'AMD', 'EURUSD', 'GBPUSD', 'USDJPY', 'XAU', 'XAG', 'WTI'].includes(k));
        const stocks = ['AAPL', 'GOOGL', 'AMZN', 'TSLA', 'MSFT', 'NVDA', 'META', 'NFLX', 'AMD'];
        const forex = ['EURUSD', 'GBPUSD', 'USDJPY'];
        const commodities = ['XAU', 'XAG', 'WTI'];
        return {
            count: Object.keys(MORPHER_MARKETS).length,
            categories: { crypto, stocks, forex, commodities },
            maxLeverage: MAX_LEVERAGE,
            fees: '0%'
        };
    }
}

module.exports = { MorpherExecutor, MORPHER_CONTRACTS, MORPHER_MARKETS };
