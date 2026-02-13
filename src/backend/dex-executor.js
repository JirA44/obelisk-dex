// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK - DEX EXECUTOR V1.5 - MULTI-MARKET EDITION
// Real execution on GMX Perpetuals + DEX Spot (OpenOcean aggregator)
// V1.4: Implemented closeGmxPosition with GMX V2 MarketDecrease orders
// V1.5: Extended GMX V2 markets (13 coins) + getGmxPositions() method
// ═══════════════════════════════════════════════════════════════════════════════
console.log('[DEX-EXEC] V1.5 MULTI-MARKET EDITION LOADED');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { ethers } = require('ethers');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// Multiple RPCs for redundancy (no API key needed)
const ARBITRUM_RPCS = [
    'https://arbitrum-one.public.blastapi.io',    // BlastAPI public
    'https://1rpc.io/arb',                        // 1RPC
    'https://arb1.arbitrum.io/rpc',               // Official
];
const ARBITRUM_RPC = ARBITRUM_RPCS[0];  // Primary
const ARBITRUM_CHAIN_ID = 42161;

// Token addresses on Arbitrum (V1.2.2 - Extended for MixBot fallback)
const TOKENS = {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    ETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    BTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',   // Alias WBTC
    ARB: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    LINK: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
    UNI: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
    GMX: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    AAVE: '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196',
    LDO: '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60',
    CRV: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978',
    PENDLE: '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8',
    RDNT: '0x3082CC23568eA640225c2467653dB90e9250AaA0',
    GRT: '0x9623063377AD1B27544C965cCd7342f7EA7e88C7',
    MAGIC: '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
    DPX: '0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55',
    GRAIL: '0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8',
};

// GMX V2 Contracts (Arbitrum)
const GMX_CONTRACTS = {
    Router: '0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6',
    ExchangeRouter: '0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8',
    OrderVault: '0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5',
    DataStore: '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8',
    Reader: '0xf60becbba223EEA9495Da3f606753867eC10d139',
};

// GMX V2 Markets (Arbitrum) - Extended for MixBot coins
// Source: https://docs.gmx.io/docs/api/contracts-v2/
const GMX_MARKETS = {
    BTC: '0x47c031236e19d024b42f8AE6780E44A573170703',
    ETH: '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336',
    ARB: '0xC25cEf6061Cf5dE5eb761b50E4743c1F5D7E5407',
    SOL: '0x09400D9DB990D5ed3f35D7be61DfAEB900Af03C9',
    LINK: '0x7f1fa204bb700853D36994DA19F830b6Ad18455C',
    DOGE: '0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4',
    AVAX: '0xD9535bB5f58A1a75032416F2dFe7880C30575a41',
    UNI: '0xc7Abb2C5f3BF3CEB389dF0Eecd6120D451170B50',
    AAVE: '0xf7F6718Cf69967203740cCb431F6bDBff1E0FB68',
    OP: '0x4fDd333FF9cA409df2aFDB6D2d20eFb9D7d1F8d7',
    NEAR: '0x63Dc80EE90F26363B3FCD609007CC9e14c8991BE',
    ATOM: '0x248C35760068cE009a13076D573ed3497A47bCD4',
    XRP: '0x0CCB4fAa6f1F1B30911619f1184082aB4E25813c',
};

// Uniswap V3 Router (Arbitrum)
const UNISWAP_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

// 1inch Aggregator (Arbitrum)
const ONEINCH_ROUTER = '0x1111111254EEB25477B68fb85Ed929f73A960582';

// ABIs (minimal)
const ERC20_ABI = [
    'function approve(address spender, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function allowance(address owner, address spender) view returns (uint256)',
];

const UNISWAP_ROUTER_ABI = [
    'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
];

const GMX_EXCHANGE_ROUTER_ABI = [
    'function createOrder((address[] addresses, uint256[] numbers, uint8 orderType, uint8 decreasePositionSwapType, bool isLong, bool shouldUnwrapNativeToken, bytes32 referralCode)) external payable returns (bytes32)',
    'function sendWnt(address receiver, uint256 amount) external payable',
    'function sendTokens(address token, address receiver, uint256 amount) external payable',
];

// GMX V2 Reader ABI (for getAccountPositions)
const GMX_READER_ABI = [
    'function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) view returns (tuple(bytes32 key, address market, address collateralToken, uint256 sizeInUsd, uint256 sizeInTokens, uint256 collateralAmount, uint256 borrowingFactor, uint256 fundingFeeAmountPerSize, uint256 longTokenClaimableFundingAmountPerSize, uint256 shortTokenClaimableFundingAmountPerSize, uint256 increasedAtBlock, uint256 decreasedAtBlock, bool isLong)[])',
];

// ═══════════════════════════════════════════════════════════════════════════════
// DEX EXECUTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class DexExecutor {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.initialized = false;
        this.stats = { orders: 0, filled: 0, failed: 0, volume: 0 };
    }

    async init() {
        try {
            const privateKey = process.env.PRIVATE_KEY;

            if (!privateKey) {
                console.log('[DEX-EXEC] No private key, simulation mode');
                return false;
            }

            // V1.2.1: Try multiple RPCs for reliability
            for (const rpc of ARBITRUM_RPCS) {
                try {
                    console.log(`[DEX-EXEC] Trying RPC: ${rpc.slice(0, 40)}...`);
                    this.provider = new ethers.JsonRpcProvider(rpc, undefined, { staticNetwork: true });
                    this.wallet = new ethers.Wallet(privateKey, this.provider);

                    // Quick connection test (5s timeout)
                    const network = await Promise.race([
                        this.provider.getNetwork(),
                        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
                    ]);

                    if (Number(network.chainId) === ARBITRUM_CHAIN_ID) {
                        console.log(`[DEX-EXEC] Connected via ${rpc.slice(8, 35)}`);
                        break;
                    }
                } catch (e) {
                    console.log(`[DEX-EXEC] RPC failed: ${e.message}`);
                    continue;
                }
            }

            if (!this.provider) {
                console.log('[DEX-EXEC] All RPCs failed');
                return false;
            }

            const balance = await this.provider.getBalance(this.wallet.address);
            const ethBalance = parseFloat(ethers.formatEther(balance));

            console.log(`[DEX-EXEC] Connected to Arbitrum`);
            console.log(`[DEX-EXEC] Wallet: ${this.wallet.address}`);
            console.log(`[DEX-EXEC] ETH Balance: ${ethBalance.toFixed(4)} ETH`);

            // Check USDC balance
            const usdcContract = new ethers.Contract(TOKENS.USDC, ERC20_ABI, this.provider);
            const usdcBalance = await usdcContract.balanceOf(this.wallet.address);
            const usdcDecimals = await usdcContract.decimals();
            const usdcAmount = parseFloat(ethers.formatUnits(usdcBalance, usdcDecimals));
            console.log(`[DEX-EXEC] USDC Balance: $${usdcAmount.toFixed(2)}`);

            if (ethBalance < 0.001) {
                console.log('[DEX-EXEC] Warning: Low ETH for gas');
            }

            this.initialized = true;
            return true;
        } catch (err) {
            console.error('[DEX-EXEC] Init error:', err.message);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SPOT SWAP (Uniswap V3)
    // ═══════════════════════════════════════════════════════════════════════════

    async swapSpot(order) {
        this.stats.orders++;

        if (!this.initialized) {
            return this.simulateOrder(order, 'SPOT');
        }

        try {
            const { tokenIn, tokenOut, amountIn, slippage = 0.5 } = order;

            // V1.1: Minimum swap amount check (DEXes reject tiny swaps)
            const MIN_SWAP_USD = 1;  // $1 minimum for real DEX swaps
            console.log(`[DEX-EXEC] swapSpot: ${amountIn} ${tokenIn} -> ${tokenOut}`);

            const tokenInAddress = TOKENS[tokenIn] || tokenIn;
            const tokenOutAddress = TOKENS[tokenOut] || tokenOut;

            if (!tokenInAddress || !tokenOutAddress) {
                return { success: false, error: 'Unknown token', simulated: true };
            }

            // Get token contracts
            const tokenInContract = new ethers.Contract(tokenInAddress, ERC20_ABI, this.wallet);
            const decimalsIn = Number(await tokenInContract.decimals());
            // V1.2.1: Truncate to correct decimals to avoid NUMERIC_FAULT
            const truncatedAmount = Math.floor(amountIn * Math.pow(10, decimalsIn)) / Math.pow(10, decimalsIn);
            const amountInWei = ethers.parseUnits(truncatedAmount.toString(), decimalsIn);

            // V1.3: Check balance and AUTO SCALE-DOWN if insufficient
            const balance = await tokenInContract.balanceOf(this.wallet.address);
            const balanceHuman = Number(ethers.formatUnits(balance, decimalsIn));
            let finalAmount = truncatedAmount;
            let scaledDown = false;

            if (balance < amountInWei) {
                // V1.3: Scale down to 95% of available balance (keep 5% buffer)
                const maxAvailable = balanceHuman * 0.95;

                if (maxAvailable < MIN_SWAP_USD) {
                    console.log(`[DEX-EXEC] Balance too low: $${balanceHuman.toFixed(2)} < $${MIN_SWAP_USD} minimum`);
                    return {
                        success: false,
                        error: `Insufficient ${tokenIn} balance (need $${MIN_SWAP_USD} min, have $${balanceHuman.toFixed(2)})`,
                        simulated: true,
                        route: 'INSUFFICIENT_BALANCE'
                    };
                }

                console.log(`[DEX-EXEC] ⚠️ SCALE-DOWN: $${truncatedAmount.toFixed(2)} -> $${maxAvailable.toFixed(2)} (balance: $${balanceHuman.toFixed(2)})`);
                finalAmount = Math.floor(maxAvailable * Math.pow(10, decimalsIn)) / Math.pow(10, decimalsIn);
                scaledDown = true;
            }

            const finalAmountWei = ethers.parseUnits(finalAmount.toString(), decimalsIn);

            // V1.2.2: Check approval FIRST before getting quote (nonce issue fix)
            // OpenOcean router address on Arbitrum (from API response)
            const OPENOCEAN_ROUTER = '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64';
            const allowance = await tokenInContract.allowance(this.wallet.address, OPENOCEAN_ROUTER);
            if (allowance < finalAmountWei) {
                console.log(`[DEX-EXEC] Approving ${tokenIn} for OpenOcean...`);
                const approveTx = await tokenInContract.approve(OPENOCEAN_ROUTER, ethers.MaxUint256);
                await approveTx.wait();
                console.log(`[DEX-EXEC] Approved`);
            }

            // V1.3: Get quote with final (possibly scaled) amount
            console.log(`[DEX-EXEC] Getting OpenOcean quote: ${finalAmount} ${tokenIn} -> ${tokenOut}${scaledDown ? ' (SCALED)' : ''}`);
            const quote = await this.getOpenOceanQuote(tokenInAddress, tokenOutAddress, finalAmount.toString(), decimalsIn);

            if (!quote || !quote.outAmount) {
                console.log(`[DEX-EXEC] No OpenOcean route found, simulating`);
                return this.simulateOrder({ tokenIn, tokenOut, amountIn, side: 'buy' }, 'SPOT');
            }

            // V1.2.1: Log raw response for debugging
            console.log(`[DEX-EXEC] Raw quote: inAmount=${quote.inAmount} inDecimals=${quote.inToken?.decimals} outAmount=${quote.outAmount}`);
            const srcAmt = parseFloat(quote.inAmount) / Math.pow(10, quote.inToken?.decimals || decimalsIn);
            const destAmt = parseFloat(quote.outAmount) / Math.pow(10, quote.outToken?.decimals || 18);
            console.log(`[DEX-EXEC] Quote: ${srcAmt.toFixed(6)} ${tokenIn} -> ${destAmt.toFixed(6)} ${tokenOut}`);

            // Execute via OpenOcean
            return await this.executeOpenOceanSwap(quote);

        } catch (err) {
            this.stats.failed++;
            console.error('[DEX-EXEC] Swap error:', err.message);
            return this.simulateOrder(order, 'SPOT');
        }
    }

    // V1.2: Use OpenOcean API (more reliable than Paraswap which returns 403)
    async getOpenOceanQuote(fromToken, toToken, amount, decimals = 6) {
        try {
            const url = `https://open-api.openocean.finance/v3/${ARBITRUM_CHAIN_ID}/swap_quote?inTokenAddress=${fromToken}&outTokenAddress=${toToken}&amount=${amount}&slippage=1&gasPrice=0.1&account=${this.wallet.address}`;
            console.log(`[DEX-EXEC] OpenOcean quote request...`);
            const res = await fetch(url);
            if (!res.ok) {
                console.log(`[DEX-EXEC] OpenOcean status: ${res.status}`);
                return null;
            }
            const data = await res.json();
            if (data.code !== 200 || !data.data) {
                console.log(`[DEX-EXEC] OpenOcean error: ${data.error || 'no data'}`);
                return null;
            }
            return data.data;
        } catch (e) {
            console.log('[DEX-EXEC] OpenOcean quote error:', e.message);
            return null;
        }
    }

    async executeOpenOceanSwap(quote) {
        try {
            // OpenOcean returns tx data directly in the quote
            if (!quote.to || !quote.data) {
                throw new Error('No transaction data in quote');
            }

            console.log(`[DEX-EXEC] Executing swap: ${quote.inToken.symbol} -> ${quote.outToken.symbol}`);

            // Execute transaction
            const tx = await this.wallet.sendTransaction({
                to: quote.to,
                data: quote.data,
                value: quote.value || 0,
                gasLimit: Math.min(quote.estimatedGas * 1.5, 2000000), // Cap gas limit
            });

            console.log(`[DEX-EXEC] 🔥 OpenOcean tx: ${tx.hash}`);
            const receipt = await tx.wait();

            this.stats.filled++;
            const srcAmount = parseFloat(quote.inAmount) / Math.pow(10, quote.inToken.decimals);
            const destAmount = parseFloat(quote.outAmount) / Math.pow(10, quote.outToken.decimals);
            this.stats.volume += srcAmount;

            console.log(`[DEX-EXEC] ✅ REAL TRADE: ${srcAmount.toFixed(4)} ${quote.inToken.symbol} -> ${destAmount.toFixed(4)} ${quote.outToken.symbol}`);

            return {
                success: true,
                order: {
                    id: tx.hash,
                    executionPrice: destAmount / srcAmount,
                    quantity: srcAmount,
                    amountOut: destAmount,
                    status: 'filled',
                    filledAt: Date.now(),
                    gasUsed: receipt.gasUsed.toString(),
                },
                simulated: false,
                route: 'OPENOCEAN_ARBITRUM',
                fee: parseFloat(receipt.gasUsed) * 0.0001
            };
        } catch (err) {
            console.error('[DEX-EXEC] OpenOcean execution error:', err.message);
            throw err;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GMX PERPETUALS
    // ═══════════════════════════════════════════════════════════════════════════

    async openGmxPosition(order) {
        this.stats.orders++;

        if (!this.initialized) {
            return this.simulateOrder(order, 'GMX_PERP');
        }

        try {
            const { coin, side, size, leverage = 2 } = order;
            const isLong = side.toLowerCase() === 'buy' || side.toLowerCase() === 'long';

            // V1.5: Get market address from GMX_MARKETS (supports 13 coins)
            const market = GMX_MARKETS[coin.toUpperCase()];

            if (!market) {
                console.log(`[DEX-EXEC] GMX market not available for ${coin}, simulating`);
                return this.simulateOrder(order, 'GMX_PERP_UNSUPPORTED');
            }

            console.log(`[DEX-EXEC] GMX V2 market for ${coin}: ${market.slice(0, 10)}...`);

            // Calculate collateral needed (size / leverage in USDC)
            const collateralUsd = size / leverage;
            const collateralWei = ethers.parseUnits(collateralUsd.toFixed(6), 6);

            // Check USDC balance
            const usdcContract = new ethers.Contract(TOKENS.USDC, ERC20_ABI, this.wallet);
            const balance = await usdcContract.balanceOf(this.wallet.address);

            if (balance < collateralWei) {
                return {
                    success: false,
                    error: `Insufficient USDC. Need $${collateralUsd.toFixed(2)}, have $${ethers.formatUnits(balance, 6)}`,
                    simulated: true,
                    route: 'INSUFFICIENT_BALANCE'
                };
            }

            // Approve USDC for GMX
            const allowance = await usdcContract.allowance(this.wallet.address, GMX_CONTRACTS.Router);
            if (allowance < collateralWei) {
                console.log(`[DEX-EXEC] Approving USDC for GMX...`);
                const approveTx = await usdcContract.approve(GMX_CONTRACTS.Router, ethers.MaxUint256);
                await approveTx.wait();
            }

            // Get current price from GMX
            const price = await this.getGmxPrice(coin);
            if (!price) {
                return { success: false, error: 'Could not get price', simulated: true };
            }

            // Create market order
            console.log(`[DEX-EXEC] Opening GMX ${isLong ? 'LONG' : 'SHORT'} ${coin} $${size} @ ${leverage}x`);

            const exchangeRouter = new ethers.Contract(
                GMX_CONTRACTS.ExchangeRouter,
                GMX_EXCHANGE_ROUTER_ABI,
                this.wallet
            );

            // GMX V2 order structure
            const orderParams = {
                addresses: [
                    market,                    // market
                    TOKENS.USDC,              // initialCollateralToken
                    ethers.ZeroAddress,       // swapPath (none)
                ],
                numbers: [
                    collateralWei,            // initialCollateralDeltaAmount
                    ethers.parseUnits(size.toString(), 30), // sizeDeltaUsd (30 decimals)
                    ethers.parseUnits(price.toString(), 30), // triggerPrice
                    ethers.parseUnits((price * (isLong ? 1.01 : 0.99)).toString(), 30), // acceptablePrice (1% slippage)
                    300000,                   // executionFee (in wei)
                    0,                        // callbackGasLimit
                    0,                        // minOutputAmount
                ],
                orderType: 2,                 // MarketIncrease
                decreasePositionSwapType: 0,
                isLong,
                shouldUnwrapNativeToken: false,
                referralCode: ethers.ZeroHash,
            };

            // Execution fee in ETH
            const executionFee = ethers.parseEther('0.001');

            const tx = await exchangeRouter.createOrder(orderParams, {
                value: executionFee,
                gasLimit: 1000000
            });

            console.log(`[DEX-EXEC] GMX order tx: ${tx.hash}`);
            const receipt = await tx.wait();

            this.stats.filled++;
            this.stats.volume += size;

            return {
                success: true,
                order: {
                    id: tx.hash,
                    coin,
                    side: isLong ? 'LONG' : 'SHORT',
                    size,
                    leverage,
                    executionPrice: price,
                    collateral: collateralUsd,
                    status: 'submitted', // GMX orders are executed by keepers
                    filledAt: Date.now(),
                    gasUsed: receipt.gasUsed.toString(),
                },
                simulated: false,
                route: 'GMX_V2_ARBITRUM',
                fee: parseFloat(ethers.formatEther(executionFee))
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[DEX-EXEC] GMX error:', err.message);
            return this.simulateOrder(order, 'GMX_PERP');
        }
    }

    async getGmxPrice(coin) {
        try {
            // Use Binance for price (GMX uses Chainlink, close enough)
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
            const data = await res.json();
            return parseFloat(data.price);
        } catch (e) {
            return null;
        }
    }

    async closeGmxPosition(order) {
        this.stats.orders++;

        if (!this.initialized) {
            return this.simulateOrder(order, 'GMX_CLOSE');
        }

        try {
            const { coin, side, size } = order;
            // For close: if original position was LONG, we close LONG
            const isLong = side.toLowerCase() === 'long' || side.toLowerCase() === 'buy';

            // V1.5: Get market address from GMX_MARKETS (supports 13 coins)
            const market = GMX_MARKETS[coin.toUpperCase()];

            if (!market) {
                console.log(`[DEX-EXEC] GMX market not available for ${coin}, simulating close`);
                return this.simulateOrder(order, 'GMX_CLOSE_UNSUPPORTED');
            }

            // Get current price
            const price = await this.getGmxPrice(coin);
            if (!price) {
                return { success: false, error: 'Could not get price', simulated: true };
            }

            console.log(`[DEX-EXEC] Closing GMX ${isLong ? 'LONG' : 'SHORT'} ${coin} $${size}`);

            const exchangeRouter = new ethers.Contract(
                GMX_CONTRACTS.ExchangeRouter,
                GMX_EXCHANGE_ROUTER_ABI,
                this.wallet
            );

            // GMX V2 decrease order structure
            // orderType 4 = MarketDecrease (close position)
            const orderParams = {
                addresses: [
                    market,                    // market
                    TOKENS.USDC,              // initialCollateralToken (receive USDC)
                    ethers.ZeroAddress,       // swapPath (none)
                ],
                numbers: [
                    0,                        // initialCollateralDeltaAmount (0 = withdraw all remaining)
                    ethers.parseUnits(size.toString(), 30), // sizeDeltaUsd (30 decimals)
                    ethers.parseUnits(price.toString(), 30), // triggerPrice
                    // acceptablePrice: for LONG close we accept lower, for SHORT close we accept higher
                    ethers.parseUnits((price * (isLong ? 0.99 : 1.01)).toString(), 30),
                    300000,                   // executionFee (in wei)
                    0,                        // callbackGasLimit
                    0,                        // minOutputAmount
                ],
                orderType: 4,                 // MarketDecrease (close position)
                decreasePositionSwapType: 0,  // NoSwap (receive in collateral token)
                isLong,
                shouldUnwrapNativeToken: false,
                referralCode: ethers.ZeroHash,
            };

            // Execution fee in ETH
            const executionFee = ethers.parseEther('0.001');

            const tx = await exchangeRouter.createOrder(orderParams, {
                value: executionFee,
                gasLimit: 1000000
            });

            console.log(`[DEX-EXEC] GMX close tx: ${tx.hash}`);
            const receipt = await tx.wait();

            this.stats.filled++;
            this.stats.volume += size;

            return {
                success: true,
                order: {
                    id: tx.hash,
                    coin,
                    side: `CLOSE_${isLong ? 'LONG' : 'SHORT'}`,
                    size,
                    executionPrice: price,
                    status: 'submitted', // GMX orders are executed by keepers
                    filledAt: Date.now(),
                    gasUsed: receipt.gasUsed.toString(),
                },
                simulated: false,
                route: 'GMX_V2_ARBITRUM_CLOSE',
                fee: parseFloat(ethers.formatEther(executionFee))
            };

        } catch (err) {
            this.stats.failed++;
            console.error('[DEX-EXEC] GMX close error:', err.message);
            return this.simulateOrder(order, 'GMX_CLOSE');
        }
    }

    // V1.5: Get GMX positions for a wallet address
    async getGmxPositions(address = null) {
        const walletAddress = address || this.wallet?.address;

        if (!walletAddress) {
            return { success: false, error: 'No wallet address', positions: [] };
        }

        if (!this.provider) {
            return { success: false, error: 'Provider not initialized', positions: [] };
        }

        try {
            const reader = new ethers.Contract(
                GMX_CONTRACTS.Reader,
                GMX_READER_ABI,
                this.provider
            );

            // Get all positions for the account (start=0, end=100)
            const rawPositions = await reader.getAccountPositions(
                GMX_CONTRACTS.DataStore,
                walletAddress,
                0,
                100
            );

            // Map market addresses to coin symbols
            const marketToCoin = {};
            for (const [coin, addr] of Object.entries(GMX_MARKETS)) {
                marketToCoin[addr.toLowerCase()] = coin;
            }

            const positions = rawPositions.map(pos => {
                const coin = marketToCoin[pos.market.toLowerCase()] || 'UNKNOWN';
                const sizeUsd = Number(ethers.formatUnits(pos.sizeInUsd, 30)); // 30 decimals
                const collateralUsd = Number(ethers.formatUnits(pos.collateralAmount, 6)); // USDC 6 decimals
                const leverage = collateralUsd > 0 ? sizeUsd / collateralUsd : 0;

                return {
                    key: pos.key,
                    coin,
                    market: pos.market,
                    isLong: pos.isLong,
                    side: pos.isLong ? 'LONG' : 'SHORT',
                    sizeUsd: sizeUsd.toFixed(2),
                    collateralUsd: collateralUsd.toFixed(2),
                    leverage: leverage.toFixed(1),
                    sizeInTokens: pos.sizeInTokens.toString(),
                    increasedAtBlock: pos.increasedAtBlock.toString(),
                };
            }).filter(p => parseFloat(p.sizeUsd) > 0); // Only return active positions

            console.log(`[DEX-EXEC] Found ${positions.length} GMX positions for ${walletAddress.slice(0, 10)}...`);

            return {
                success: true,
                wallet: walletAddress,
                count: positions.length,
                positions,
                supportedMarkets: Object.keys(GMX_MARKETS),
            };

        } catch (err) {
            console.error('[DEX-EXEC] getGmxPositions error:', err.message);
            return { success: false, error: err.message, positions: [] };
        }
    }

    // V1.5: Get list of supported GMX markets
    getSupportedMarkets() {
        return {
            markets: Object.keys(GMX_MARKETS),
            count: Object.keys(GMX_MARKETS).length,
            addresses: GMX_MARKETS,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UNIFIED EXECUTE
    // ═══════════════════════════════════════════════════════════════════════════

    async execute(order) {
        const { type, pair, side, quantity, size, leverage, action } = order;

        // V1.4: Handle position close orders
        const isClose = type === 'close' || action === 'close' || side === 'close';
        if (isClose) {
            console.log(`[DEX-EXEC] CLOSE order detected - routing to closeGmxPosition`);
            return await this.closeGmxPosition({
                coin: pair?.replace('-PERP', '').replace('/USDC', '').replace('/USDT', '') || order.coin,
                side: order.positionSide || order.originalSide || 'long', // Original position direction
                size: size || quantity,
            });
        }

        // V1.3.1: PERP orders go to GMX, NOT spot swap!
        // Bug fix: type='perp' was being overridden by pair.includes('/')
        const isPerp = type === 'perp' || (leverage && leverage > 1);

        if (isPerp) {
            // Perpetual via GMX (NOT spot swap!)
            console.log(`[DEX-EXEC] PERP order detected (lev=${leverage}) - routing to GMX, NOT spot`);
            return await this.openGmxPosition({
                coin: pair?.replace('-PERP', '').replace('/USDC', '').replace('/USDT', '') || order.coin,
                side,
                size: size || quantity,
                leverage: leverage || 2,
            });
        }

        // Spot swap (only for type='spot' and leverage=1)
        if (type === 'spot' || pair?.includes('/')) {
            // Spot swap
            const [tokenIn, tokenOut] = side === 'buy'
                ? ['USDC', pair?.split('/')[0] || order.coin]
                : [pair?.split('/')[0] || order.coin, 'USDC'];

            // V1.1: For BUY (USDC->TOKEN), use size (USD amount)
            // For SELL (TOKEN->USDC), use quantity (token amount)
            const amountIn = side === 'buy' ? (size || quantity) : (quantity || size);

            return await this.swapSpot({
                tokenIn,
                tokenOut,
                amountIn,
            });
        }

        // Fallback: simulate if nothing matches
        console.log(`[DEX-EXEC] Unknown order type, simulating`);
        return this.simulateOrder(order, 'UNKNOWN');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SIMULATION
    // ═══════════════════════════════════════════════════════════════════════════

    simulateOrder(order, type) {
        const { pair, side, quantity, size, coin } = order;
        const asset = coin || pair?.split('/')[0] || 'BTC';

        const estimatedPrices = {
            'BTC': 95000, 'ETH': 3200, 'SOL': 180, 'ARB': 0.8,
            'LINK': 20, 'UNI': 12, 'GMX': 30
        };
        const price = estimatedPrices[asset] || 1;
        const amount = quantity || size || 1;

        return {
            success: true,
            order: {
                id: `SIM_${type}_${Date.now()}`,
                executionPrice: price * (side === 'buy' ? 1.001 : 0.999),
                quantity: amount,
                status: 'simulated',
                filledAt: Date.now(),
            },
            simulated: true,
            route: `SIMULATED_${type}`,
            fee: amount * price * 0.001
        };
    }

    getStats() {
        return {
            initialized: this.initialized,
            wallet: this.wallet?.address || null,
            ...this.stats
        };
    }

    // V1.3: Get current balances for MixBot fallback sizing
    async getBalances() {
        if (!this.initialized || !this.wallet) {
            return { usdc: 0, eth: 0, initialized: false };
        }

        try {
            const usdcContract = new ethers.Contract(TOKENS.USDC, ERC20_ABI, this.wallet);
            const usdcBalance = await usdcContract.balanceOf(this.wallet.address);
            const ethBalance = await this.provider.getBalance(this.wallet.address);

            return {
                usdc: Number(ethers.formatUnits(usdcBalance, 6)),
                eth: Number(ethers.formatEther(ethBalance)),
                wallet: this.wallet.address,
                initialized: true
            };
        } catch (err) {
            console.error('[DEX-EXEC] Balance check error:', err.message);
            return { usdc: 0, eth: 0, initialized: true, error: err.message };
        }
    }
}

module.exports = { DexExecutor, TOKENS, GMX_CONTRACTS, GMX_MARKETS };
