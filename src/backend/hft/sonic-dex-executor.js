/**
 * SONIC DEX EXECUTOR v2.0
 * Real on-chain swaps — LONG + SHORT — via Sonic DEX
 *
 * Capital: native S tokens (no USDC bridge needed)
 *   Setup: S → wrap half to wS → swap half wS → USDC
 *   Result: wS pool (for SHORT exits) + USDC pool (for LONG entries)
 *
 * Flow:
 *   LONG  signal  → USDC → wS  (buy Sonic)
 *   CLOSE LONG    → wS → USDC  (sell back)
 *   SHORT signal  → wS → USDC  (sell Sonic)
 *   CLOSE SHORT   → USDC → wS  (buy back)
 *
 * Pair mapping:
 *   BTC/USDC → wS  (best liquidity on Sonic DEX)
 *   ETH/USDC → wS  (WETH liquidity shallow — use wS)
 *   SOL/USDC → wS  (natural proxy for Sonic L1 token)
 *
 * DEX: Odos V3 aggregator → best price across all Sonic DEXes
 *   Fallback: Equalizer V2, Metropolis, ShadowDEX V2
 *
 * Gas: ~$0.00021/batch (Multicall3)
 * Version: 2.0 | Date: 2026-02-19
 */

const { ethers } = require('ethers');
const { SonicDexRouter, ADDRESSES } = require('../executors/sonic-dex-router');

// All HFT pairs → wS (best liquidity, Sonic native)
const PAIR_TO_TOKEN = {
    'BTC/USDC': ADDRESSES.wS,
    'ETH/USDC': ADDRESSES.wS,
    'SOL/USDC': ADDRESSES.wS,
};

const wS_ABI = [
    'function deposit() payable',
    'function withdraw(uint256 wad)',
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
];
const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
];

class SonicDexExecutor {
    constructor() {
        this.router = new SonicDexRouter();
        this._positions = {};  // posId → { pair, side, token, amountToken, sizeUsd }
        this._setupDone = false;

        this.stats = {
            opens: 0, closes: 0,
            longs: 0, shorts: 0,
            totalGasUsd: 0, swapErrors: 0,
        };

        console.log('[SONIC-DEX v2] Executor initialized');
        console.log('[SONIC-DEX v2]   Flow: S → wrap wS → split USDC/wS → HFT LONG+SHORT');
        console.log('[SONIC-DEX v2]   Pairs: BTC+ETH+SOL → all routed via wS/USDC');
        console.log(`[SONIC-DEX v2]   Wallet: ${this.router.wallet?.address || 'NOT CONFIGURED'}`);

        if (!this.router.wallet) {
            console.warn('[SONIC-DEX v2] ⚠️  No wallet — set SONIC_MAINNET_PRIVATE_KEY or ARBITRUM_PRIVATE_KEY');
        }
    }

    // ─── Setup: wrap native S → split wS + USDC ─────────────────────────────

    /**
     * One-time capital setup from native S tokens
     * Wraps S → wS, then swaps half → USDC for LONG trades
     * Call on first run or when rebalancing
     */
    async setupCapital(reserveS = 2.0) {
        if (!this.router.wallet) return;

        const bal = await this._allBalances();
        console.log('\n[SONIC-DEX v2] 💰 Capital setup:');
        console.log(`  S native : ${bal.S.toFixed(4)}`);
        console.log(`  wS       : ${bal.wS.toFixed(4)}`);
        console.log(`  USDC     : $${bal.USDC.toFixed(4)}`);

        const availableS = bal.S - reserveS;
        if (availableS < 0.5) {
            console.log(`  ⚠️  Not enough S to setup (have ${bal.S.toFixed(4)}, need >${reserveS + 0.5})`);
            this._setupDone = true;
            return;
        }

        // 1. Wrap ALL available native S → wS
        const wrapAmt = availableS;
        console.log(`\n  🔄 Wrapping ${wrapAmt.toFixed(4)} S → wS...`);
        try {
            const wSContract = new ethers.Contract(ADDRESSES.wS, wS_ABI, this.router.wallet);
            const tx = await wSContract.deposit({
                value: ethers.parseEther(wrapAmt.toFixed(6)),
            });
            await tx.wait();
            console.log(`  ✅ Wrapped ${wrapAmt.toFixed(4)} S → wS | tx: ${tx.hash}`);
        } catch (e) {
            console.error(`  ❌ Wrap failed: ${e.message}`);
            this._setupDone = true;
            return;
        }

        // 2. Swap half wS → USDC (for LONG entries)
        const bal2 = await this._allBalances();
        const halfWs = bal2.wS / 2;
        if (halfWs < 0.1) { this._setupDone = true; return; }

        console.log(`  🔄 Swapping ${halfWs.toFixed(4)} wS → USDC...`);
        try {
            const amtIn = ethers.parseEther(halfWs.toFixed(6));
            const result = await this.router.executeSwap(ADDRESSES.wS, ADDRESSES.USDC, amtIn, 0.01);
            if (result.success) {
                const usdc = parseFloat(ethers.formatUnits(BigInt(result.amountOut), 6));
                console.log(`  ✅ Got $${usdc.toFixed(4)} USDC | tx: ${result.txHash}`);
            }
        } catch (e) {
            console.error(`  ❌ Swap failed: ${e.message}`);
        }

        const bal3 = await this._allBalances();
        console.log(`\n  ✅ Setup complete:`);
        console.log(`     S gas  : ${bal3.S.toFixed(4)}`);
        console.log(`     wS pool: ${bal3.wS.toFixed(4)} (for SHORT / CLOSE LONG)`);
        console.log(`     USDC   : $${bal3.USDC.toFixed(4)} (for LONG / CLOSE SHORT)`);
        const totalUsd = bal3.wS * await this._wSPrice() + bal3.USDC;
        console.log(`     Total  : ~$${totalUsd.toFixed(4)}`);

        this._setupDone = true;
    }

    // ─── Open ────────────────────────────────────────────────────────────────

    async open(pair, side, sizeUsd) {
        if (!this._setupDone) await this.setupCapital();

        const bal = await this._allBalances();
        const isLong  = side === 'long';

        // LONG: USDC → wS
        if (isLong) {
            if (bal.USDC < sizeUsd * 0.98) {
                console.warn(`[SONIC-DEX v2] ⚡ LONG skip: USDC $${bal.USDC.toFixed(4)} < $${sizeUsd}`);
                return { success: false, reason: 'insufficient_usdc' };
            }
            return this._swap(pair, side, ADDRESSES.USDC, ADDRESSES.wS, sizeUsd, 6);
        }

        // SHORT: wS → USDC
        const wSPrice = await this._wSPrice();
        const wSNeeded = sizeUsd / wSPrice;
        if (bal.wS < wSNeeded * 0.98) {
            console.warn(`[SONIC-DEX v2] ⚡ SHORT skip: wS ${bal.wS.toFixed(4)} < ${wSNeeded.toFixed(4)} needed`);
            return { success: false, reason: 'insufficient_wS' };
        }
        const wsAmtUsd = Math.min(sizeUsd, bal.wS * wSPrice * 0.95);
        return this._swap(pair, side, ADDRESSES.wS, ADDRESSES.USDC, wsAmtUsd / wSPrice, 18, true);
    }

    // ─── Close ───────────────────────────────────────────────────────────────

    async close(pair) {
        const openPos = Object.entries(this._positions).filter(([, p]) => p.pair === pair);
        if (!openPos.length) return { success: true, pnl: 0 };

        let totalPnl = 0;
        for (const [posId, pos] of openPos) {
            const isLong = pos.side === 'long';
            // Reverse: LONG close = sell wS → USDC; SHORT close = buy wS ← USDC
            const [tokenIn, tokenOut, decimalsIn] = isLong
                ? [ADDRESSES.wS, ADDRESSES.USDC, 18]
                : [ADDRESSES.USDC, ADDRESSES.wS, 6];

            const bal = await this._allBalances();
            const avail = isLong ? bal.wS : bal.USDC;
            const closeAmt = Math.min(pos.amountToken, avail * 0.99);
            if (closeAmt <= 0) { delete this._positions[posId]; continue; }

            const amtIn = isLong
                ? ethers.parseEther(closeAmt.toFixed(8))
                : ethers.parseUnits(closeAmt.toFixed(4), 6);

            try {
                const result = await this.router.executeSwap(tokenIn, tokenOut, amtIn, 0.01);
                if (result.success) {
                    const received = isLong
                        ? parseFloat(ethers.formatUnits(BigInt(result.amountOut), 6))
                        : parseFloat(ethers.formatEther(BigInt(result.amountOut)));
                    const pnl = isLong
                        ? received - pos.sizeUsd
                        : (pos.amountToken - received) * (await this._wSPrice());
                    totalPnl += pnl;
                    const side = pos.side.toUpperCase();
                    console.log(`[SONIC-DEX v2] ✅ CLOSE ${side} ${pair} pnl=$${pnl.toFixed(4)} | tx: ${result.txHash}`);
                    this.stats.closes++;
                    this.stats.totalGasUsd += parseFloat(result.gasCostUsd || 0);
                }
            } catch (e) {
                console.error(`[SONIC-DEX v2] CLOSE error: ${e.message}`);
                this.stats.swapErrors++;
            }
            delete this._positions[posId];
        }
        return { success: true, pnl: totalPnl };
    }

    // ─── Internal swap ───────────────────────────────────────────────────────

    async _swap(pair, side, tokenIn, tokenOut, amount, decimalsIn, isWSAmount = false) {
        const label = side === 'long' ? 'LONG (USDC→wS)' : 'SHORT (wS→USDC)';
        console.log(`[SONIC-DEX v2] 🔄 ${label} ${pair} $${isWSAmount ? (amount * await this._wSPrice()).toFixed(4) : amount.toFixed(4)}...`);

        try {
            const amtIn = decimalsIn === 18
                ? ethers.parseEther(amount.toFixed(8))
                : ethers.parseUnits(amount.toFixed(4), decimalsIn);

            const result = await this.router.executeSwap(tokenIn, tokenOut, amtIn, 0.01);
            if (!result.success) { this.stats.swapErrors++; return { success: false }; }

            const outDecimals = tokenOut === ADDRESSES.USDC ? 6 : 18;
            const amountOut = parseFloat(ethers.formatUnits(BigInt(result.amountOut), outDecimals));
            const sizeUsd = side === 'long' ? amount : amountOut;

            const posId = `sdex_${pair.replace('/', '_')}_${side}_${Date.now()}`;
            this._positions[posId] = {
                pair, side, token: tokenOut,
                amountToken: amountOut,
                sizeUsd,
                dex: result.dex, txHash: result.txHash,
            };

            this.stats.opens++;
            side === 'long' ? this.stats.longs++ : this.stats.shorts++;
            this.stats.totalGasUsd += parseFloat(result.gasCostUsd || 0);

            const price = side === 'long' ? amount / amountOut : amountOut / amount;
            console.log(`[SONIC-DEX v2] ✅ OPEN ${side.toUpperCase()} ${pair} | ${amountOut.toFixed(4)} out @ $${price.toFixed(5)} | DEX: ${result.dex}`);
            console.log(`[SONIC-DEX v2]    🔗 ${result.explorer}`);

            return { success: true, posId, amountOut, dex: result.dex, txHash: result.txHash };
        } catch (e) {
            console.error(`[SONIC-DEX v2] OPEN error: ${e.message}`);
            this.stats.swapErrors++;
            return { success: false, error: e.message };
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    async _wSPrice() {
        try {
            // Quote 1 wS → USDC
            const q = await this.router.getBestQuote(
                ADDRESSES.wS, ADDRESSES.USDC, ethers.parseEther('1')
            );
            if (q.success) return parseFloat(ethers.formatUnits(q.best.amountOut, 6));
        } catch {}
        return 0.049; // fallback
    }

    async _getBalance(token, decimals) {
        if (!this.router.wallet) return 0;
        try {
            const c = new ethers.Contract(token, ERC20_ABI, this.router.provider);
            const b = await c.balanceOf(this.router.wallet.address);
            return parseFloat(ethers.formatUnits(b, decimals));
        } catch { return 0; }
    }

    async _allBalances() {
        if (!this.router.wallet) return { S: 0, wS: 0, USDC: 0, WETH: 0 };
        const [sNative, wS, USDC, WETH] = await Promise.all([
            this.router.provider.getBalance(this.router.wallet.address).then(b => parseFloat(ethers.formatEther(b))),
            this._getBalance(ADDRESSES.wS, 18),
            this._getBalance(ADDRESSES.USDC, 6),
            this._getBalance(ADDRESSES.WETH, 18),
        ]);
        return { S: sNative, wS, USDC, WETH };
    }

    async checkReady() {
        const bal = await this._allBalances();
        const wSPrice = await this._wSPrice();
        const totalUsd = bal.S * wSPrice + bal.wS * wSPrice + bal.USDC;

        console.log('[SONIC-DEX v2] Balance check:');
        console.log(`  S (gas+trade) : ${bal.S.toFixed(4)} (~$${(bal.S * wSPrice).toFixed(4)})`);
        console.log(`  wS            : ${bal.wS.toFixed(4)} (~$${(bal.wS * wSPrice).toFixed(4)})`);
        console.log(`  USDC          : $${bal.USDC.toFixed(4)}`);
        console.log(`  Total         : ~$${totalUsd.toFixed(4)}`);

        const ready = (bal.S + bal.wS) * wSPrice + bal.USDC >= 0.50;
        return {
            ready,
            reason: ready ? 'OK' : `Need ≥$0.50 total (have $${totalUsd.toFixed(4)})`,
            balances: { ...bal, totalUsd, wSPrice },
            setup: this._setupDone,
        };
    }

    getStats() {
        return {
            ...this.stats,
            openPositions: Object.keys(this._positions).length,
            openList: Object.values(this._positions).map(p =>
                `${p.side.toUpperCase()} ${p.pair} $${p.sizeUsd.toFixed(2)}`
            ),
        };
    }
}

module.exports = SonicDexExecutor;
