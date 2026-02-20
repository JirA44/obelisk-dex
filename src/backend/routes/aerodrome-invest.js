/**
 * OBELISK - Aerodrome Finance 1-Click Invest
 * Full flow: Bridge (Arbitrum→Base) + Swap + AddLiquidity
 *
 * GET  /api/aerodrome/pools     → Real pools from DeFi Llama, TVL>=50k, sorted by APY
 * POST /api/aerodrome/invest/1click → Bridge + Swap + AddLiquidity in 1 flow
 * GET  /api/aerodrome/balances  → Wallet balances on Base + Arbitrum
 */

const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const axios = require('axios');

// ══════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════

const BASE_RPC  = 'https://mainnet.base.org';
const ARB_RPC   = 'https://arb1.arbitrum.io/rpc';

const CONTRACTS = {
    // Aerodrome Router v2 on Base
    router:         '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
    // Tokens on Base
    USDC_BASE:      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    WETH_BASE:      '0x4200000000000000000000000000000000000006',
    AERO:           '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    // Across SpokePool on Arbitrum (bridge)
    ACROSS_SPOKE:   '0xe35e9842fceaca96570b734083f4a58e8F7C5f2A',
    // USDC on Arbitrum (for USDC bridge)
    USDC_ARB:       '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    // Native ETH placeholder
    ETH:            '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
};

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)',
];

// Aerodrome v2 Router — Route struct has 4 fields: from, to, stable, factory
const ROUTER_ABI = [
    'function addLiquidity(address tokenA, address tokenB, bool stable, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
    'function swapExactETHForTokens(uint256 amountOutMin, (address from, address to, bool stable, address factory)[] calldata routes, address to, uint256 deadline) external payable returns (uint256[] memory amounts)',
    'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, (address from, address to, bool stable, address factory)[] calldata routes, address to, uint256 deadline) external returns (uint256[] memory amounts)',
    'function getAmountsOut(uint256 amountIn, (address from, address to, bool stable, address factory)[] calldata routes) external view returns (uint256[] memory amounts)',
    'function weth() external view returns (address)',
];

const POOL_ABI = [
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
    'function stable() external view returns (bool)',
    'function getReserves() external view returns (uint256 reserve0, uint256 reserve1, uint256 blockTimestampLast)',
];

const ACROSS_SPOKE_ABI = [
    'function deposit(address recipient, address originToken, uint256 amount, uint256 destinationChainId, int64 relayerFeePct, uint32 quoteTimestamp, bytes calldata message, uint256 maxCount) external payable',
];

// Approx ETH price fallback (updated via getEthPriceUSD())
const ETH_PRICE_USD = 1940;

// Aerodrome v2 factory address on Base
const AERO_FACTORY = '0x420DD381b31aEf6683db6B902084cB0FFECe40Da';

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

function getWallet(chain = 'base') {
    const pk = process.env.ARBITRUM_PRIVATE_KEY;
    if (!pk) throw new Error('ARBITRUM_PRIVATE_KEY not configured in .env');
    const rpc = chain === 'base' ? BASE_RPC : ARB_RPC;
    return new ethers.Wallet(pk, new ethers.JsonRpcProvider(rpc));
}

async function getEthPriceUSD() {
    try {
        const resp = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', { timeout: 5000 });
        return resp.data?.ethereum?.usd || ETH_PRICE_USD;
    } catch {
        return ETH_PRICE_USD;
    }
}

// ══════════════════════════════════════════════════════════════
// GET /api/aerodrome/pools
// Real pools from DeFi Llama — filtered TVL>=50k, sorted by APY
// ══════════════════════════════════════════════════════════════

router.get('/pools', async (req, res) => {
    try {
        const minTvl  = parseFloat(req.query.minTvl)  || 50000;
        const limit   = parseInt(req.query.limit)      || 30;
        const stable  = req.query.stable; // 'true' | 'false' | undefined

        const resp = await axios.get('https://yields.llama.fi/pools', { timeout: 12000 });

        let pools = resp.data.data.filter(p =>
            (p.project || '').toLowerCase().includes('aerodrome') &&
            p.chain === 'Base' &&
            (p.tvlUsd || 0) >= minTvl &&
            p.apy != null &&
            p.status !== 'dead'
        );

        if (stable === 'true')  pools = pools.filter(p => p.poolMeta?.includes('stable'));
        if (stable === 'false') pools = pools.filter(p => !p.poolMeta?.includes('stable'));

        pools = pools
            .sort((a, b) => (b.apy || 0) - (a.apy || 0))
            .slice(0, limit)
            .map((p, i) => ({
                rank:         i + 1,
                poolId:       p.pool,
                symbol:       p.symbol,
                tvlUsd:       Math.round(p.tvlUsd || 0),
                apy:          parseFloat((p.apy || 0).toFixed(2)),
                apyBase:      parseFloat((p.apyBase || 0).toFixed(2)),
                apyReward:    parseFloat((p.apyReward || 0).toFixed(2)),
                stable:       !!(p.poolMeta?.includes('stable') || p.poolMeta?.includes('stable')),
                ilRisk:       p.ilRisk || 'no',
                rewardTokens: p.rewardTokens || [],
                tokens:       p.underlyingTokens || [],
                project:      p.project, // aerodrome-v1 | aerodrome-slipstream
                baseLink:     `https://aerodrome.finance/liquidity`,
            }));

        res.json({ success: true, count: pools.length, minTvl, pools });
    } catch (err) {
        console.error('[Aerodrome] pools fetch error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════
// GET /api/aerodrome/balances
// Wallet balances on Base and Arbitrum
// ══════════════════════════════════════════════════════════════

router.get('/balances', async (req, res) => {
    try {
        const baseWallet = getWallet('base');
        const arbWallet  = getWallet('arb');
        const ethPrice   = await getEthPriceUSD();

        const [baseEth, arbEth, baseUsdc] = await Promise.all([
            baseWallet.provider.getBalance(baseWallet.address),
            arbWallet.provider.getBalance(arbWallet.address),
            new ethers.Contract(CONTRACTS.USDC_BASE, ERC20_ABI, baseWallet).balanceOf(baseWallet.address),
        ]);

        const baseEthFloat = parseFloat(ethers.formatEther(baseEth));
        const arbEthFloat  = parseFloat(ethers.formatEther(arbEth));
        const baseUsdcFloat = parseFloat(ethers.formatUnits(baseUsdc, 6));

        res.json({
            success: true,
            wallet: baseWallet.address,
            base: {
                ETH:      baseEthFloat.toFixed(6),
                ETH_USD:  (baseEthFloat * ethPrice).toFixed(2),
                USDC:     baseUsdcFloat.toFixed(2),
                total_USD: (baseEthFloat * ethPrice + baseUsdcFloat).toFixed(2),
            },
            arbitrum: {
                ETH:      arbEthFloat.toFixed(6),
                ETH_USD:  (arbEthFloat * ethPrice).toFixed(2),
            },
            ethPrice,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════
// POST /api/aerodrome/invest/1click
// Full flow: Check → Bridge? → Swap → AddLiquidity
// Body: { token0, token1, stable, symbol, amountUSD, simulate }
// (token addresses come from DeFi Llama pool.tokens array)
// ══════════════════════════════════════════════════════════════

router.post('/invest/1click', async (req, res) => {
    const {
        token0,
        token1,
        stable = false,
        symbol = 'TOKEN0/TOKEN1',
        amountUSD = 1,
        simulate = false,
    } = req.body;

    if (!token0 || !token1) return res.status(400).json({ success: false, error: 'token0 and token1 required' });
    if (amountUSD < 0.5)    return res.status(400).json({ success: false, error: 'Minimum $0.50' });

    const steps = [];
    const log = (step, name, status, data = {}, tx = null) => {
        const entry = { step, name, status, ...data };
        if (tx) entry.tx = tx;
        steps.push(entry);
        console.log(`[Aerodrome 1-click] Step ${step}: ${name} → ${status}`);
    };

    try {
        const ethPrice   = await getEthPriceUSD();
        const baseWallet = getWallet('base');
        const arbWallet  = getWallet('arb');

        // ─────────────────────────────────────────────────────
        // STEP 1: Check balances
        // ─────────────────────────────────────────────────────
        const [baseEth, arbEth, baseUsdc] = await Promise.all([
            baseWallet.provider.getBalance(baseWallet.address),
            arbWallet.provider.getBalance(arbWallet.address),
            new ethers.Contract(CONTRACTS.USDC_BASE, ERC20_ABI, baseWallet).balanceOf(baseWallet.address),
        ]);

        const baseEthUSD  = parseFloat(ethers.formatEther(baseEth)) * ethPrice;
        const arbEthUSD   = parseFloat(ethers.formatEther(arbEth)) * ethPrice;
        const baseUsdcUSD = parseFloat(ethers.formatUnits(baseUsdc, 6));
        const baseTotalUSD = baseEthUSD + baseUsdcUSD;

        log(1, 'Balance Check', 'ok', {
            base_ETH_USD: baseEthUSD.toFixed(2),
            base_USDC: baseUsdcUSD.toFixed(2),
            base_total_USD: baseTotalUSD.toFixed(2),
            arb_ETH_USD: arbEthUSD.toFixed(2),
        });

        // ─────────────────────────────────────────────────────
        // STEP 2: Bridge Arbitrum→Base if needed
        // ─────────────────────────────────────────────────────
        const GAS_RESERVE_USD = 0.50; // Keep $0.50 for gas on Base
        const needsBase = amountUSD + GAS_RESERVE_USD;

        if (baseTotalUSD < needsBase) {
            const shortfall = needsBase - baseTotalUSD;
            const bridgeETH = shortfall / ethPrice;

            if (!simulate && arbEthUSD < shortfall + 1.0) { // +$1 for Arbitrum gas + Across fee
                return res.json({
                    success: false,
                    error: `Insufficient funds. Need $${needsBase.toFixed(2)} on Base. Have $${baseTotalUSD.toFixed(2)} on Base and $${arbEthUSD.toFixed(2)} on Arbitrum.`,
                    steps,
                });
            }

            log(2, 'Bridge Arbitrum→Base (Across Protocol)', simulate ? 'simulated' : 'pending', {
                bridging_USD: shortfall.toFixed(2),
                bridging_ETH: bridgeETH.toFixed(6),
                from: 'Arbitrum',
                to: 'Base',
                protocol: 'Across',
                eta: '60-120s',
            });

            if (!simulate) {
                const bridgeResult = await bridgeViaAcross(arbWallet, ethers.parseEther(bridgeETH.toFixed(6)));
                if (!bridgeResult.success) {
                    steps[steps.length - 1].status = 'failed';
                    steps[steps.length - 1].error = bridgeResult.error;
                    return res.json({ success: false, error: 'Bridge failed: ' + bridgeResult.error, steps });
                }
                steps[steps.length - 1].status = 'ok';
                steps[steps.length - 1].tx = bridgeResult.hash;

                // Wait for bridge (poll Base balance, max 3 min)
                log('2b', 'Waiting bridge confirmation', 'pending', { eta: '60-120s' });
                const bridged = await waitForBalance(baseWallet, needsBase, ethPrice, 180000);
                steps[steps.length - 1].status = bridged ? 'ok' : 'timeout';
                if (!bridged) return res.json({ success: false, error: 'Bridge timeout (>3min). Retry invest.', steps });
            }
        } else {
            log(2, 'Bridge Check', 'skipped', { reason: `Enough on Base ($${baseTotalUSD.toFixed(2)})` });
        }

        // ─────────────────────────────────────────────────────
        // STEP 3: Confirm token info (from DeFi Llama params)
        // ─────────────────────────────────────────────────────
        const isStable = stable;

        // Get token symbols on-chain
        let sym0 = symbol.split('-')[0] || 'TOKEN0';
        let sym1 = symbol.split('-')[1] || 'TOKEN1';
        try {
            const t0 = new ethers.Contract(token0, ERC20_ABI, baseWallet);
            const t1 = new ethers.Contract(token1, ERC20_ABI, baseWallet);
            [sym0, sym1] = await Promise.all([t0.symbol(), t1.symbol()]);
        } catch {}

        log(3, 'Pool Info', 'ok', {
            token0: sym0,
            token0_addr: token0,
            token1: sym1,
            token1_addr: token1,
            stable: isStable,
        });

        // ─────────────────────────────────────────────────────
        // STEP 4: Swap ETH → token0 + token1 (50% / 50%)
        // ─────────────────────────────────────────────────────
        const halfETH = ethers.parseEther(((amountUSD / 2) / ethPrice).toFixed(8));
        const deadline = Math.floor(Date.now() / 1000) + 600;
        let amount0Got = 0n, amount1Got = 0n;

        if (simulate) {
            log(4, `Swap ETH→${sym0} + ETH→${sym1} (50/50)`, 'simulated', {
                each_USD: (amountUSD / 2).toFixed(2),
                each_ETH: ethers.formatEther(halfETH),
            });
        } else {
            const router = new ethers.Contract(CONTRACTS.router, ROUTER_ABI, baseWallet);
            const isWETH0 = token0.toLowerCase() === CONTRACTS.WETH_BASE.toLowerCase();
            const isWETH1 = token1.toLowerCase() === CONTRACTS.WETH_BASE.toLowerCase();

            // Swap ETH → token0
            if (!isWETH0) {
                const tx0 = await router.swapExactETHForTokens(
                    0,
                    [{ from: CONTRACTS.WETH_BASE, to: token0, stable: false, factory: AERO_FACTORY }],
                    baseWallet.address,
                    deadline,
                    { value: halfETH, gasLimit: 500000n }
                );
                const r0 = await tx0.wait();
                amount0Got = await new ethers.Contract(token0, ERC20_ABI, baseWallet).balanceOf(baseWallet.address);
                log(4, `Swap ETH→${sym0}`, 'ok', {}, r0.hash);
            } else {
                amount0Got = halfETH; // WETH = ETH
            }

            // Swap ETH → token1
            if (!isWETH1) {
                const tx1 = await router.swapExactETHForTokens(
                    0,
                    [{ from: CONTRACTS.WETH_BASE, to: token1, stable: false, factory: AERO_FACTORY }],
                    baseWallet.address,
                    deadline,
                    { value: halfETH, gasLimit: 500000n }
                );
                const r1 = await tx1.wait();
                amount1Got = await new ethers.Contract(token1, ERC20_ABI, baseWallet).balanceOf(baseWallet.address);
                log('4b', `Swap ETH→${sym1}`, 'ok', {}, r1.hash);
            } else {
                amount1Got = halfETH;
            }
        }

        // ─────────────────────────────────────────────────────
        // STEP 5: Add Liquidity to Aerodrome
        // ─────────────────────────────────────────────────────
        let lpTxHash = null;

        if (simulate) {
            log(5, `Add Liquidity ${sym0}/${sym1}`, 'simulated', {
                amount_USD: amountUSD,
                token0: sym0,
                token1: sym1,
                stable: isStable,
            });
        } else {
            const router     = new ethers.Contract(CONTRACTS.router, ROUTER_ABI, baseWallet);
            const t0contract = new ethers.Contract(token0, ERC20_ABI, baseWallet);
            const t1contract = new ethers.Contract(token1, ERC20_ABI, baseWallet);

            const bal0 = await t0contract.balanceOf(baseWallet.address);
            const bal1 = await t1contract.balanceOf(baseWallet.address);

            // Approve router for both tokens
            if (bal0 > 0n) await (await t0contract.approve(CONTRACTS.router, bal0, { gasLimit: 100000n })).wait();
            if (bal1 > 0n) await (await t1contract.approve(CONTRACTS.router, bal1, { gasLimit: 100000n })).wait();

            const isWETH0 = token0.toLowerCase() === CONTRACTS.WETH_BASE.toLowerCase();
            const isWETH1 = token1.toLowerCase() === CONTRACTS.WETH_BASE.toLowerCase();

            // Use 90% of balance to avoid dust issues
            const use0 = bal0 * 90n / 100n;
            const use1 = bal1 * 90n / 100n;

            let lpTx;
            if (isWETH0 || isWETH1) {
                // One token is ETH — use addLiquidityETH (or native ETH approach)
                // For simplicity, wrap ETH and use addLiquidity with WETH
                lpTx = await router.addLiquidity(
                    token0, token1, isStable,
                    use0, use1, 0n, 0n,
                    baseWallet.address, deadline,
                    { gasLimit: 800000n, value: (isWETH0 ? use0 : use1) }
                );
            } else {
                lpTx = await router.addLiquidity(
                    token0, token1, isStable,
                    use0, use1, 0n, 0n,
                    baseWallet.address, deadline,
                    { gasLimit: 800000n }
                );
            }

            const lpReceipt = await lpTx.wait();
            lpTxHash = lpReceipt.hash;

            log(5, `Add Liquidity ${sym0}/${sym1}`, 'ok', {
                amount_USD: amountUSD,
                token0: sym0,
                token1: sym1,
                gasCost_USD: ((Number(lpReceipt.gasUsed) * 0.001) / 1e9 * ethPrice).toFixed(4),
            }, lpTxHash);
        }

        // ─────────────────────────────────────────────────────
        // DONE
        // ─────────────────────────────────────────────────────
        res.json({
            success: true,
            simulate,
            invested_USD: amountUSD,
            pair: `${sym0}/${sym1}`,
            stable: isStable,
            wallet: baseWallet.address,
            basescan: lpTxHash ? `https://basescan.org/tx/${lpTxHash}` : null,
            steps,
            message: simulate
                ? `[SIMULATED] $${amountUSD} would be invested in ${sym0}/${sym1} Aerodrome pool`
                : `$${amountUSD} invested in ${sym0}/${sym1} on Aerodrome Finance!`,
        });

    } catch (err) {
        console.error('[Aerodrome 1-click] Error:', err.message);
        res.json({ success: false, error: err.message, steps });
    }
});

// ══════════════════════════════════════════════════════════════
// BRIDGE via Across Protocol (Arbitrum→Base)
// ══════════════════════════════════════════════════════════════

async function bridgeViaAcross(arbWallet, ethAmount) {
    try {
        // Get Across suggested fees
        const feesResp = await axios.get('https://app.across.to/api/suggested-fees', {
            params: {
                token: CONTRACTS.ETH,
                destinationChainId: 8453,   // Base
                originChainId: 42161,        // Arbitrum
                amount: ethAmount.toString(),
                skipAmountLimit: true,
            },
            timeout: 10000,
        });

        const { relayFeePct, timestamp } = feesResp.data;
        console.log(`[Across] relayFeePct=${relayFeePct}, timestamp=${timestamp}`);

        const spokePool = new ethers.Contract(CONTRACTS.ACROSS_SPOKE, ACROSS_SPOKE_ABI, arbWallet);

        const tx = await spokePool.deposit(
            arbWallet.address,          // recipient on Base
            CONTRACTS.ETH,              // native ETH
            ethAmount,                  // amount
            8453n,                      // destinationChainId
            BigInt(relayFeePct),        // relayerFeePct
            timestamp,                  // quoteTimestamp
            '0x',                       // message
            ethers.MaxUint256,          // maxCount
            {
                value: ethAmount,
                gasLimit: 200000n,
            }
        );

        const receipt = await tx.wait();
        return { success: true, hash: receipt.hash };
    } catch (err) {
        console.error('[Across bridge] Error:', err.message);
        return { success: false, error: err.message };
    }
}

// Poll Base ETH balance until it reaches target USD or timeout
async function waitForBalance(wallet, targetUSD, ethPrice, timeoutMs = 180000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const bal = await wallet.provider.getBalance(wallet.address);
        const balUSD = parseFloat(ethers.formatEther(bal)) * ethPrice;
        if (balUSD >= targetUSD * 0.95) return true;
        await new Promise(r => setTimeout(r, 10000)); // poll every 10s
    }
    return false;
}

module.exports = router;
