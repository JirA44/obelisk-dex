/**
 * SONIC DEX ROUTER - Multi-DEX Liquidity Router
 * Routes swaps across all major Sonic chain DEXes for best price
 *
 * Supported DEXes:
 *   - ShadowDEX CL  (Uniswap V3 fork)         0x5543c617...
 *   - ShadowDEX V2  (Solidly fork)             0x1D368773...
 *   - SwapX         (Algebra V4 CLAMM)         0xE6E9F79e...
 *   - Beets         (Balancer V2)              0xBA122222...
 *   - Equalizer V2  (Solidly fork)             0x7635cD59...
 *   - Metropolis    (Trader Joe LB DLMM)       0x67803fe6...
 *   - Odos V3       (Aggregator API)           api.odos.xyz ✅ LIVE
 *
 * Status: Equalizer/Metropolis/ShadowV2 = on-chain quotes
 *         SwapX/ShadowCL = no liquidity on USDC/wS pair (skipped)
 *         Odos = best aggregated route (API, all DEXes)
 *
 * Chain: Sonic Mainnet (ID 146)
 * Version: 1.1 | Date: 2026-02-19
 */

const { ethers } = require('ethers');

// ─── SONIC MAINNET ADDRESSES ─────────────────────────────────────────────────

const NATIVE = '0x0000000000000000000000000000000000000000'; // Native S token

const ADDRESSES = {
    // Native tokens
    S:    NATIVE,                                        // Native Sonic (gas token)
    wS:   '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', // Wrapped Sonic
    WETH: '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b',
    USDC: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
    USDT: '0x6047828dc181963ba44974801ff68e538da5eaf9',

    // ShadowDEX (UniV3 CL)
    SHADOW_CL_ROUTER:  '0x5543c6176feb9b4b179078205d7c29eea2e2d695',
    SHADOW_CL_QUOTER:  '0x219b7ADebc0935a3eC889a148c6924D51A07535A',
    SHADOW_CL_FACTORY: '0xcD2d0637c94fe77C2896BbCBB174cefFb08DE6d7',

    // ShadowDEX V2 (Solidly)
    SHADOW_V2_ROUTER:  '0x1D368773735ee1E678950B7A97bcA2CafB330CDc',
    SHADOW_V2_FACTORY: '0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8',

    // SwapX (Algebra V4)
    SWAPX_ROUTER:      '0xE6E9F79e551Dd3FAeF8aBe035896fc65A9eEB26c',
    SWAPX_QUOTER:      '0xd74a9Bd1C98B2CbaB5823107eb2BE9C474bEe09A',
    SWAPX_FACTORY:     '0x8121a3F8c4176E9765deEa0B95FA2BDfD3016794',

    // Beets (Balancer V2)
    BEETS_VAULT:       '0xBA12222222228d8Ba445958a75a0704d566BF2C8',

    // Equalizer V2 (Solidly)
    EQUALIZER_ROUTER:  '0x7635cD591CFE965bE8beC60Da6eA69b6dcD27e4b',
    EQUALIZER_FACTORY: '0xDDD9845Ba0D8f38d3045f804f67A1a8B9A528FcC',

    // Metropolis (Trader Joe LB DLMM)
    METRO_LB_ROUTER:   '0x67803fe6d76409640efDC9b7ABcD2c6c2E7cBa48',
    METRO_LB_QUOTER:   '0x56eaa884F29620fD6914827AaAE9Ee6a5C383149',
    METRO_V2_ROUTER:   '0x95a7e403d7cF20F675fF9273D66e94d35ba49fA3',

    // Odos aggregator (fallback)
    ODOS_ROUTER:       '0x0D05a7D3448512B78fa8A9e46c4872C88C4a0D05',
};

// Common fee tiers for ShadowDEX CL (in hundredths of a bip)
const SHADOW_FEES = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%

// ─── ABIs (minimal) ──────────────────────────────────────────────────────────

const ABI = {
    ERC20: [
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)',
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
    ],

    // ShadowDEX CL — Uniswap V3 style
    SHADOW_CL_QUOTER: [
        'function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
    ],
    SHADOW_CL_ROUTER: [
        'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut)',
    ],

    // SwapX — Algebra V4 style
    SWAPX_QUOTER: [
        'function quoteExactInputSingle(address tokenIn, address tokenOut, uint256 amountIn, uint160 limitSqrtPrice) external returns (uint256 amountOut, uint16 fee)',
    ],
    SWAPX_ROUTER: [
        'function exactInputSingle((address tokenIn, address tokenOut, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 limitSqrtPrice) params) external returns (uint256 amountOut)',
    ],

    // Beets — Balancer V2 Vault
    BEETS_VAULT: [
        'function queryBatchSwap(uint8 kind, (bytes32 poolId, uint256 assetInIndex, uint256 assetOutIndex, uint256 amount, bytes userData)[] swaps, address[] assets, (address sender, bool fromInternalBalance, address payable recipient, bool toInternalBalance) funds) external returns (int256[] memory)',
        'function swap((bytes32 poolId, uint8 kind, address assetIn, address assetOut, uint256 amount, bytes userData) singleSwap, (address sender, bool fromInternalBalance, address payable recipient, bool toInternalBalance) funds, uint256 limit, uint256 deadline) external payable returns (uint256 amountCalculated)',
    ],

    // Equalizer V2 — Solidly style
    EQUALIZER_ROUTER: [
        'function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) external view returns (uint256 amount, bool stable)',
        'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, (address from, address to, bool stable)[] routes, address to, uint256 deadline) external returns (uint256[] amounts)',
    ],

    // ShadowDEX V2 — Solidly style (same signature as Equalizer)
    SHADOW_V2_ROUTER: [
        'function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) external view returns (uint256 amount, bool stable)',
        'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, (address from, address to, bool stable)[] routes, address to, uint256 deadline) external returns (uint256[] amounts)',
    ],

    // Metropolis — Trader Joe LB Quoter
    METRO_LB_QUOTER: [
        'function findBestPathFromAmountIn((address[] route, address[] pairs, uint256[] binSteps, uint8[] versions, uint256[] amounts, uint256[] virtualAmountsWithoutSlippage, uint256[] fees) path, uint128 amountIn) external view returns ((address[] route, address[] pairs, uint256[] binSteps, uint8[] versions, uint256[] amounts, uint256[] virtualAmountsWithoutSlippage, uint256[] fees) result)',
    ],
    METRO_LB_ROUTER: [
        'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMinRecieved, (address[] tokenPath, address[] pairBinSteps, uint8[] versions) path, address to, uint256 deadline) external returns (uint256 amountOut)',
    ],
    METRO_V2_ROUTER: [
        'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) external returns (uint256[] amounts)',
        'function getAmountsOut(uint256 amountIn, address[] path) external view returns (uint256[] amounts)',
    ],
};

// ─── MAIN CLASS ──────────────────────────────────────────────────────────────

class SonicDexRouter {
    constructor(config = {}) {
        this.rpc = config.rpc || 'https://rpc.soniclabs.com';
        this.provider = new ethers.JsonRpcProvider(this.rpc);
        this.wallet = null;

        const pk = config.privateKey
            || process.env.SONIC_MAINNET_PRIVATE_KEY
            || process.env.ARBITRUM_PRIVATE_KEY;

        if (pk) {
            try {
                this.wallet = new ethers.Wallet(pk, this.provider);
                console.log('✅ SonicDexRouter: wallet', this.wallet.address);
            } catch (e) {
                console.warn('⚠️  SonicDexRouter: wallet init failed:', e.message);
            }
        }

        this.defaultSlippage = config.slippage || 0.005; // 0.5%
        this.stats = {
            totalSwaps: 0,
            byDex: { shadow_cl: 0, shadow_v2: 0, swapx: 0, beets: 0, equalizer: 0, metropolis: 0, odos: 0 },
            totalVolumeUsd: 0,
            errors: 0,
        };

        this._initContracts();
    }

    _initContracts() {
        const p = this.provider;

        // Quoters (read-only)
        this.shadowClQuoter   = new ethers.Contract(ADDRESSES.SHADOW_CL_QUOTER,  ABI.SHADOW_CL_QUOTER,  p);
        this.swapxQuoter      = new ethers.Contract(ADDRESSES.SWAPX_QUOTER,      ABI.SWAPX_QUOTER,      p);
        this.equalizerRouter  = new ethers.Contract(ADDRESSES.EQUALIZER_ROUTER,  ABI.EQUALIZER_ROUTER,  p);
        this.shadowV2Router   = new ethers.Contract(ADDRESSES.SHADOW_V2_ROUTER,  ABI.SHADOW_V2_ROUTER,  p);
        this.metroV2Router    = new ethers.Contract(ADDRESSES.METRO_V2_ROUTER,   ABI.METRO_V2_ROUTER,   p);
        this.beetsVault       = new ethers.Contract(ADDRESSES.BEETS_VAULT,       ABI.BEETS_VAULT,       p);
    }

    _signerContracts() {
        if (!this.wallet) throw new Error('Wallet not configured — set SONIC_MAINNET_PRIVATE_KEY');
        const w = this.wallet;
        return {
            shadowClRouter:  new ethers.Contract(ADDRESSES.SHADOW_CL_ROUTER,  ABI.SHADOW_CL_ROUTER,  w),
            swapxRouter:     new ethers.Contract(ADDRESSES.SWAPX_ROUTER,      ABI.SWAPX_ROUTER,      w),
            shadowV2Router:  new ethers.Contract(ADDRESSES.SHADOW_V2_ROUTER,  ABI.SHADOW_V2_ROUTER,  w),
            equalizerRouter: new ethers.Contract(ADDRESSES.EQUALIZER_ROUTER,  ABI.EQUALIZER_ROUTER,  w),
            metroV2Router:   new ethers.Contract(ADDRESSES.METRO_V2_ROUTER,   ABI.METRO_V2_ROUTER,   w),
            metroLbRouter:   new ethers.Contract(ADDRESSES.METRO_LB_ROUTER,   ABI.METRO_LB_ROUTER,   w),
            beetsVault:      new ethers.Contract(ADDRESSES.BEETS_VAULT,       ABI.BEETS_VAULT,       w),
        };
    }

    // ─── QUOTE: Get best price from all DEXes ────────────────────────────────

    /**
     * Get quotes from all DEXes and return the best
     * @param {string} tokenIn  - Token address to sell
     * @param {string} tokenOut - Token address to buy
     * @param {bigint} amountIn - Amount in (token units)
     * @returns {object} Best quote with dex, amountOut, and all quotes
     */
    async getBestQuote(tokenIn, tokenOut, amountIn) {
        const quotes = await Promise.allSettled([
            this._quoteShadowCL(tokenIn, tokenOut, amountIn),
            this._quoteShadowV2(tokenIn, tokenOut, amountIn),
            this._quoteSwapX(tokenIn, tokenOut, amountIn),
            this._quoteEqualizer(tokenIn, tokenOut, amountIn),
            this._quoteMetroV2(tokenIn, tokenOut, amountIn),
            this._quoteOdos(tokenIn, tokenOut, amountIn),
        ]);

        const results = quotes
            .filter(r => r.status === 'fulfilled' && r.value && r.value.amountOut > 0n)
            .map(r => r.value)
            .sort((a, b) => (b.amountOut > a.amountOut ? 1 : -1));

        if (results.length === 0) {
            return { success: false, error: 'No liquidity found on any Sonic DEX', quotes: [] };
        }

        const best = results[0];
        return {
            success: true,
            best,
            allQuotes: results,
            savingsBps: results.length > 1
                ? Number((best.amountOut - results[results.length - 1].amountOut) * 10000n / best.amountOut)
                : 0,
        };
    }

    // ShadowDEX CL — try all fee tiers, return best
    async _quoteShadowCL(tokenIn, tokenOut, amountIn) {
        const results = await Promise.allSettled(
            SHADOW_FEES.map(fee =>
                this.shadowClQuoter.quoteExactInputSingle.staticCall({
                    tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96: 0n,
                })
            )
        );

        let best = { amountOut: 0n, fee: null };
        for (let i = 0; i < results.length; i++) {
            if (results[i].status === 'fulfilled') {
                const out = results[i].value[0]; // amountOut
                if (out > best.amountOut) best = { amountOut: out, fee: SHADOW_FEES[i] };
            }
        }

        if (best.amountOut === 0n) return null;
        return { dex: 'shadow_cl', amountOut: best.amountOut, fee: best.fee, tokenIn, tokenOut, amountIn };
    }

    // ShadowDEX V2 — Solidly stable + volatile
    async _quoteShadowV2(tokenIn, tokenOut, amountIn) {
        try {
            const [amountOut] = await this.shadowV2Router.getAmountOut(amountIn, tokenIn, tokenOut);
            if (!amountOut || amountOut === 0n) return null;
            return { dex: 'shadow_v2', amountOut, tokenIn, tokenOut, amountIn };
        } catch { return null; }
    }

    // SwapX — Algebra V4
    async _quoteSwapX(tokenIn, tokenOut, amountIn) {
        try {
            const [amountOut] = await this.swapxQuoter.quoteExactInputSingle(
                tokenIn, tokenOut, amountIn, 0n
            );
            if (!amountOut || amountOut === 0n) return null;
            return { dex: 'swapx', amountOut, tokenIn, tokenOut, amountIn };
        } catch { return null; }
    }

    // Equalizer — Solidly
    async _quoteEqualizer(tokenIn, tokenOut, amountIn) {
        try {
            const [amountOut] = await this.equalizerRouter.getAmountOut(amountIn, tokenIn, tokenOut);
            if (!amountOut || amountOut === 0n) return null;
            return { dex: 'equalizer', amountOut, tokenIn, tokenOut, amountIn };
        } catch { return null; }
    }

    // Metropolis V2 — standard AMM
    async _quoteMetroV2(tokenIn, tokenOut, amountIn) {
        try {
            const amounts = await this.metroV2Router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
            const amountOut = amounts[1];
            if (!amountOut || amountOut === 0n) return null;
            return { dex: 'metropolis', amountOut, tokenIn, tokenOut, amountIn };
        } catch { return null; }
    }

    // Odos aggregator — best route across all Sonic DEXes (API-based)
    async _quoteOdos(tokenIn, tokenOut, amountIn, slippage = 0.5) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch('https://api.odos.xyz/sor/quote/v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chainId: 146,
                    inputTokens: [{ tokenAddress: tokenIn, amount: amountIn.toString() }],
                    outputTokens: [{ tokenAddress: tokenOut, proportion: 1 }],
                    slippageLimitPercent: slippage,
                    userAddr: this.wallet?.address || '0x377706801308ac4c3Fe86EEBB295FeC6E1279140',
                    compact: true,
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            const data = await res.json();
            if (!data.outAmounts?.[0]) return null;
            const amountOut = BigInt(data.outAmounts[0]);
            if (amountOut === 0n) return null;
            // Store pathId for execution
            return { dex: 'odos', amountOut, tokenIn, tokenOut, amountIn, pathId: data.pathId };
        } catch { return null; }
    }

    // ─── EXECUTE SWAP ────────────────────────────────────────────────────────

    /**
     * Execute a swap on the best DEX
     * @param {string} tokenIn   - Token to sell (address)
     * @param {string} tokenOut  - Token to buy (address)
     * @param {bigint} amountIn  - Amount in (token units, BigInt)
     * @param {number} slippage  - Max slippage e.g. 0.005 = 0.5%
     * @returns {object} Swap result
     */
    async executeSwap(tokenIn, tokenOut, amountIn, slippage) {
        if (!this.wallet) throw new Error('Wallet not configured');

        slippage = slippage ?? this.defaultSlippage;

        // 1. Get best quote
        const q = await this.getBestQuote(tokenIn, tokenOut, amountIn);
        if (!q.success) throw new Error(q.error);

        const { dex, amountOut, fee, pathId } = q.best;
        const amountOutMin = amountOut * BigInt(Math.floor((1 - slippage) * 10000)) / 10000n;
        const startTime = Date.now();

        // If Odos won, use Odos execute path (supports native S + best aggregation)
        if (dex === 'odos') {
            return this._executeOdos(pathId, tokenIn, amountIn, amountOut, amountOutMin, startTime);
        }

        // 2. Approve token spend (ERC20 only)
        if (tokenIn !== NATIVE) {
            await this._ensureApproval(tokenIn, this._routerAddress(dex), amountIn);
        }

        // 3. Execute on chosen DEX
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 120); // 2 min
        const contracts = this._signerContracts();

        let tx, receipt;

        switch (dex) {
            case 'shadow_cl':
                tx = await contracts.shadowClRouter.exactInputSingle({
                    tokenIn, tokenOut, fee,
                    recipient: this.wallet.address,
                    amountIn, amountOutMinimum: amountOutMin,
                    sqrtPriceLimitX96: 0n,
                });
                break;

            case 'shadow_v2':
                tx = await contracts.shadowV2Router.swapExactTokensForTokens(
                    amountIn, amountOutMin,
                    [{ from: tokenIn, to: tokenOut, stable: false }],
                    this.wallet.address, deadline
                );
                break;

            case 'swapx':
                tx = await contracts.swapxRouter.exactInputSingle({
                    tokenIn, tokenOut,
                    recipient: this.wallet.address,
                    deadline, amountIn, amountOutMinimum: amountOutMin,
                    limitSqrtPrice: 0n,
                });
                break;

            case 'equalizer':
                tx = await contracts.equalizerRouter.swapExactTokensForTokens(
                    amountIn, amountOutMin,
                    [{ from: tokenIn, to: tokenOut, stable: false }],
                    this.wallet.address, deadline
                );
                break;

            case 'metropolis':
                tx = await contracts.metroV2Router.swapExactTokensForTokens(
                    amountIn, amountOutMin,
                    [tokenIn, tokenOut],
                    this.wallet.address, deadline
                );
                break;

            default:
                throw new Error(`Unknown DEX: ${dex}`);
        }

        receipt = await tx.wait();
        const latency = Date.now() - startTime;

        // Gas cost
        const gasUsed = receipt.gasUsed;
        const gasPrice = receipt.gasPrice || tx.gasPrice;
        const gasCostS = parseFloat(ethers.formatEther(gasUsed * gasPrice));
        const gasCostUsd = gasCostS * 0.049106;

        this.stats.totalSwaps++;
        this.stats.byDex[dex] = (this.stats.byDex[dex] || 0) + 1;

        console.log(`✅ Swap via ${dex}: ${amountIn} → ~${amountOut} | gas $${gasCostUsd.toFixed(6)} | ${latency}ms`);

        return {
            success: true,
            dex,
            txHash: receipt.hash,
            tokenIn, tokenOut,
            amountIn: amountIn.toString(),
            amountOut: amountOut.toString(),
            amountOutMin: amountOutMin.toString(),
            gasCostUsd: gasCostUsd.toFixed(6),
            latencyMs: latency,
            blockNumber: receipt.blockNumber,
            explorer: `https://sonicscan.org/tx/${receipt.hash}`,
            allQuotes: q.allQuotes.map(r => ({
                dex: r.dex,
                amountOut: r.amountOut.toString(),
            })),
        };
    }

    // ─── ODOS EXECUTE ────────────────────────────────────────────────────────

    async _executeOdos(pathId, tokenIn, amountIn, amountOut, amountOutMin, startTime) {
        // 1. Approve Odos router if ERC20
        if (tokenIn !== NATIVE) {
            await this._ensureApproval(tokenIn, ADDRESSES.ODOS_ROUTER, amountIn);
        }

        // 2. Assemble transaction
        const assembleRes = await fetch('https://api.odos.xyz/sor/assemble', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pathId,
                userAddr: this.wallet.address,
                simulate: false,
            }),
        });
        const assembled = await assembleRes.json();
        if (!assembled.transaction) throw new Error(`Odos assemble failed: ${JSON.stringify(assembled).slice(0, 200)}`);

        // 3. Send tx immediately (no extra estimateGas to avoid pathId expiry)
        const txReq = assembled.transaction;
        const rawGas = Number(txReq.gas || 0);
        const gasLimit = rawGas > 10000
            ? BigInt(Math.ceil(rawGas * 1.3))  // Odos gas estimate + 30% buffer
            : 450000n;                           // fallback when simulation failed

        const tx = await this.wallet.sendTransaction({
            to:    txReq.to,
            data:  txReq.data,
            value: BigInt(txReq.value || 0),
            gasLimit,
        });
        const receipt = await tx.wait();
        const latency = Date.now() - startTime;

        const gasUsed = receipt.gasUsed;
        const gasPrice = receipt.gasPrice || tx.gasPrice;
        const gasCostS = parseFloat(ethers.formatEther(gasUsed * gasPrice));
        const gasCostUsd = gasCostS * 0.049106;

        this.stats.totalSwaps++;
        this.stats.byDex.odos = (this.stats.byDex.odos || 0) + 1;

        console.log(`✅ Odos swap: ${amountIn} → ~${amountOut} | gas $${gasCostUsd.toFixed(6)} | ${latency}ms`);

        return {
            success: true,
            dex: 'odos',
            txHash: receipt.hash,
            tokenIn, tokenOut: null, // tokenOut resolved by Odos
            amountIn: amountIn.toString(),
            amountOut: amountOut.toString(),
            amountOutMin: amountOutMin.toString(),
            gasCostUsd: gasCostUsd.toFixed(6),
            latencyMs: latency,
            blockNumber: receipt.blockNumber,
            explorer: `https://sonicscan.org/tx/${receipt.hash}`,
        };
    }

    // ─── APPROVE ERC20 ───────────────────────────────────────────────────────

    async _ensureApproval(token, spender, amount) {
        const erc20 = new ethers.Contract(token, ABI.ERC20, this.wallet);
        const allowance = await erc20.allowance(this.wallet.address, spender);
        if (allowance >= amount) return; // already approved

        console.log(`   ⏳ Approving ${token} for ${spender}...`);
        const tx = await erc20.approve(spender, ethers.MaxUint256);
        await tx.wait();
        console.log(`   ✅ Approved`);
    }

    _routerAddress(dex) {
        const map = {
            shadow_cl:  ADDRESSES.SHADOW_CL_ROUTER,
            shadow_v2:  ADDRESSES.SHADOW_V2_ROUTER,
            swapx:      ADDRESSES.SWAPX_ROUTER,
            equalizer:  ADDRESSES.EQUALIZER_ROUTER,
            metropolis: ADDRESSES.METRO_V2_ROUTER,
            beets:      ADDRESSES.BEETS_VAULT,
        };
        return map[dex] || null;
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    /**
     * Quick quote in human-readable format
     * @param {string} tokenInSymbol  - e.g. 'USDC'
     * @param {string} tokenOutSymbol - e.g. 'wS'
     * @param {number} amountIn       - Human-readable amount (e.g. 10 USDC)
     */
    async quoteHuman(tokenInSymbol, tokenOutSymbol, amountIn) {
        const tokenInAddr  = ADDRESSES[tokenInSymbol];
        const tokenOutAddr = ADDRESSES[tokenOutSymbol];

        if (!tokenInAddr)  throw new Error(`Unknown token: ${tokenInSymbol}`);
        if (!tokenOutAddr) throw new Error(`Unknown token: ${tokenOutSymbol}`);

        // Native S has 18 decimals (no contract needed)
        const getNativeDecimals = (addr) => addr === NATIVE ? Promise.resolve(18n) :
            new ethers.Contract(addr, ABI.ERC20, this.provider).decimals();

        const [decIn, decOut] = await Promise.all([
            getNativeDecimals(tokenInAddr),
            getNativeDecimals(tokenOutAddr),
        ]);

        const amountInBig = ethers.parseUnits(amountIn.toString(), decIn);
        const result = await this.getBestQuote(tokenInAddr, tokenOutAddr, amountInBig);

        if (!result.success) return result;

        const humanOut = ethers.formatUnits(result.best.amountOut, decOut);
        return {
            ...result,
            human: {
                tokenIn: tokenInSymbol,
                tokenOut: tokenOutSymbol,
                amountIn: amountIn.toString(),
                amountOut: parseFloat(humanOut).toFixed(6),
                bestDex: result.best.dex,
                allQuotes: result.allQuotes.map(q => ({
                    dex: q.dex,
                    amountOut: parseFloat(ethers.formatUnits(q.amountOut, decOut)).toFixed(6),
                })),
            },
        };
    }

    getStats() {
        return {
            totalSwaps: this.stats.totalSwaps,
            byDex: this.stats.byDex,
            errors: this.stats.errors,
            wallet: this.wallet?.address || null,
            supportedDexes: ['shadow_cl', 'shadow_v2', 'swapx', 'equalizer', 'metropolis', 'odos'],
            tokenAliases: Object.keys(ADDRESSES).filter(k => !k.includes('_')),
        };
    }
}

module.exports = { SonicDexRouter, ADDRESSES };
