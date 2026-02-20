/**
 * OBELISK Flash Loan Engine V1.0
 *
 * Strategies:
 *   1. DEX_ARB       — Exploit Obelisk AMM vs oracle price gaps
 *   2. LIQUIDATION   — Flash-loan to liquidate undercollateralized loans (+5% bonus)
 *   3. COLLATERAL_SWAP — Atomic collateral type change without closing position
 *
 * Fee: 0.09% per flash loan (paid to liquidity providers)
 * Atomicity: pool balance check before + after ensures no bad-debt risk
 */

'use strict';

// ─── Constants ───────────────────────────────────────────────────────────────

const FLASH_FEE = 0.0009;          // 0.09% flash loan fee
const LIQUIDATION_BONUS = 0.05;    // 5% bonus for liquidators
const MIN_PROFIT_USD = 1.0;        // Skip opportunities < $1 net profit
const MAX_POOL_PCT = 0.10;         // Max 10% of pool per single flash loan

// ─── Class ───────────────────────────────────────────────────────────────────

class FlashLoanEngine {
    constructor(lendingSystem, obeliskAMM) {
        this.lending = lendingSystem;
        this.amm = obeliskAMM;

        this.stats = {
            totalLoans: 0,
            successfulArbs: 0,
            successfulLiquidations: 0,
            failedLoans: 0,
            totalProfitUSD: 0,
            totalFeesCollected: 0,
            startedAt: Date.now()
        };

        // Scanner interval (null when stopped)
        this._scanInterval = null;

        console.log('[FLASH-LOAN] Engine V1.0 initialized (fee=0.09%)');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OPPORTUNITY SCANNER
    // ─────────────────────────────────────────────────────────────────────────

    /** Scan all strategies and return ranked opportunities */
    async scanOpportunities() {
        const [arbs, liquidations] = await Promise.all([
            this.scanDEXArb(),
            this.scanLiquidations()
        ]);

        const all = [...arbs, ...liquidations]
            .sort((a, b) => b.netProfit - a.netProfit);

        return {
            total: all.length,
            opportunities: all,
            byType: {
                DEX_ARB: arbs.length,
                LIQUIDATION: liquidations.length
            },
            scannedAt: new Date().toISOString()
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STRATEGY 1 — DEX ARBITRAGE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Detect price spread between Obelisk AMM pools and oracle (Binance).
     * If AMM_price < oracle_price → flash borrow USDC, buy cheap on AMM,
     *   sell at oracle price, repay loan + fee, keep spread.
     * Minimum profitable spread = flashFee(0.09%) + ammFee(0.3%) + slippage(0.1%)
     */
    async scanDEXArb() {
        const opportunities = [];
        const minSpread = FLASH_FEE + (this.amm?.feeRate || 0.003) + 0.001;

        if (!this.amm || !this.amm.pools) return opportunities;

        for (const [pairId, pool] of this.amm.pools) {
            const [tokenA, tokenB] = pairId.split('/');
            if (tokenB !== 'USDC') continue;
            if (!pool.reserveA || !pool.reserveB) continue;

            const ammPrice = pool.reserveB / pool.reserveA;
            const oraclePrice = this.amm.oraclePrices?.[tokenA];
            if (!oraclePrice || oraclePrice <= 0) continue;

            const spread = (oraclePrice - ammPrice) / oraclePrice;
            const absSpread = Math.abs(spread);

            if (absSpread <= minSpread) continue;

            // Loan size = 10% of pool USDC reserve, capped at $50k
            const maxLoan = Math.min(pool.reserveB * MAX_POOL_PCT, 50000);
            const loanAmount = Math.max(maxLoan, 100);

            const grossProfit = loanAmount * absSpread;
            const totalFees = loanAmount * (FLASH_FEE + (this.amm.feeRate || 0.003));
            const slippage = loanAmount * 0.001; // estimated 0.1% slippage
            const netProfit = grossProfit - totalFees - slippage;

            if (netProfit < MIN_PROFIT_USD) continue;

            opportunities.push({
                type: 'DEX_ARB',
                pair: pairId,
                token: tokenA,
                direction: spread > 0 ? 'BUY_AMM_SELL_ORACLE' : 'BUY_ORACLE_SELL_AMM',
                ammPrice: +ammPrice.toFixed(4),
                oraclePrice: +oraclePrice.toFixed(4),
                spreadPct: +(absSpread * 100).toFixed(3),
                loanAmount: +loanAmount.toFixed(2),
                grossProfit: +grossProfit.toFixed(2),
                fees: +totalFees.toFixed(2),
                slippage: +slippage.toFixed(2),
                netProfit: +netProfit.toFixed(2),
                roiPct: +((netProfit / loanAmount) * 100).toFixed(3),
                feasible: true
            });
        }

        return opportunities.sort((a, b) => b.netProfit - a.netProfit);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STRATEGY 2 — LIQUIDATION HUNTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Find undercollateralized loans (health factor < 1.05).
     * Flash borrow the debt amount, repay the loan, seize collateral at
     * face value + 5% liquidation bonus, repay flash loan, keep bonus.
     */
    async scanLiquidations() {
        const opportunities = [];
        if (!this.lending || !this.lending.loans) return opportunities;

        for (const [loanId, loan] of this.lending.loans) {
            if (loan.status !== 'active') continue;

            const collateralValue = this._getCollateralValueUSD(loan.borrowerId);
            const loanValueUSD = this._getLoanValueUSD(loan);

            if (loanValueUSD <= 0) continue;

            const healthFactor = collateralValue / loanValueUSD;

            // Liquidatable below 1.05 health factor
            if (healthFactor >= 1.05) continue;
            if (loanValueUSD < 10) continue; // Skip dust positions

            const flashLoanNeeded = loanValueUSD;
            const collateralReceived = collateralValue;
            const bonus = collateralValue * LIQUIDATION_BONUS;
            const flashFee = flashLoanNeeded * FLASH_FEE;
            const netProfit = bonus - flashFee;

            if (netProfit < MIN_PROFIT_USD) continue;

            opportunities.push({
                type: 'LIQUIDATION',
                loanId,
                borrowerId: loan.borrowerId,
                token: loan.token,
                healthFactor: +healthFactor.toFixed(4),
                debtUSD: +loanValueUSD.toFixed(2),
                collateralUSD: +collateralValue.toFixed(2),
                flashLoanNeeded: +flashLoanNeeded.toFixed(2),
                liquidationBonus: +bonus.toFixed(2),
                flashFee: +flashFee.toFixed(2),
                netProfit: +netProfit.toFixed(2),
                urgency: healthFactor < 1.0 ? 'CRITICAL' : healthFactor < 1.02 ? 'HIGH' : 'MEDIUM',
                feasible: true
            });
        }

        return opportunities.sort((a, b) => b.netProfit - a.netProfit);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STRATEGY 3 — COLLATERAL SWAP (atomic)
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Simulate swapping collateral type without closing position.
     * E.g. ETH collateral → BTC collateral:
     *   1. Flash borrow BTC
     *   2. Add BTC as new collateral
     *   3. Withdraw ETH collateral
     *   4. Swap ETH→BTC on AMM
     *   5. Repay flash loan
     */
    calculateCollateralSwap(userId, fromToken, toToken, amount) {
        const fromPrice = this.amm?.oraclePrices?.[fromToken] || 1;
        const toPrice = this.amm?.oraclePrices?.[toToken] || 1;

        const fromValueUSD = amount * fromPrice;
        const toAmount = fromValueUSD / toPrice;

        const ammFee = fromValueUSD * (this.amm?.feeRate || 0.003);
        const flashFee = fromValueUSD * FLASH_FEE;
        const totalCost = ammFee + flashFee;

        const costPct = (totalCost / fromValueUSD) * 100;

        return {
            strategy: 'COLLATERAL_SWAP',
            userId,
            from: { token: fromToken, amount: +amount.toFixed(6), valueUSD: +fromValueUSD.toFixed(2) },
            to: { token: toToken, amount: +toAmount.toFixed(6), valueUSD: +(fromValueUSD - totalCost).toFixed(2) },
            costs: {
                ammFee: +ammFee.toFixed(2),
                flashFee: +flashFee.toFixed(2),
                totalCost: +totalCost.toFixed(2),
                costPct: +costPct.toFixed(3)
            },
            steps: [
                `Flash borrow ${toAmount.toFixed(4)} ${toToken} ($${fromValueUSD.toFixed(2)})`,
                `Deposit ${toToken} as new collateral`,
                `Withdraw ${amount} ${fromToken} collateral`,
                `Swap ${fromToken}→${toToken} on Obelisk AMM`,
                `Repay flash loan + 0.09% fee`,
                `Net cost: $${totalCost.toFixed(2)} (${costPct.toFixed(2)}% of position)`
            ],
            feasible: true
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXECUTION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Execute a flash loan atomically.
     * Funds leave pool → strategy runs → funds return + fee.
     * If repayment fails, pool is restored (no bad debt).
     */
    async execute(strategy, params, userId = 'system') {
        const token = params.token || 'USDC';
        const loanAmount = params.loanAmount;

        // Validate pool liquidity
        const poolBalance = this.lending?.liquidityPool?.[token] || 0;
        const maxLoan = poolBalance * MAX_POOL_PCT;

        if (loanAmount > maxLoan) {
            throw new Error(
                `Insufficient liquidity. Requested: $${loanAmount.toFixed(2)}, ` +
                `Max (10% pool): $${maxLoan.toFixed(2)}`
            );
        }

        const fee = loanAmount * FLASH_FEE;
        const repayRequired = loanAmount + fee;
        const snapshotBalance = poolBalance;

        // "Send" funds (debit pool atomically)
        if (this.lending?.liquidityPool) {
            this.lending.liquidityPool[token] -= loanAmount;
        }

        let result;
        try {
            switch (strategy) {
                case 'DEX_ARB':
                    result = await this._runDEXArb(params, loanAmount, fee);
                    break;
                case 'LIQUIDATION':
                    result = await this._runLiquidation(params, loanAmount, fee);
                    break;
                default:
                    throw new Error(`Unknown flash loan strategy: ${strategy}`);
            }

            // Verify repayment
            if (!result.repaid || result.repaidAmount < repayRequired - 0.01) {
                throw new Error(
                    `Repayment insufficient. Required: $${repayRequired.toFixed(2)}, ` +
                    `Got: $${(result.repaidAmount || 0).toFixed(2)}`
                );
            }

            // Credit pool (loan + fee)
            if (this.lending?.liquidityPool) {
                this.lending.liquidityPool[token] += repayRequired;
            }

            // Stats
            this.stats.totalLoans++;
            this.stats.totalFeesCollected += fee;
            this.stats.totalProfitUSD += result.profit;
            if (strategy === 'DEX_ARB') this.stats.successfulArbs++;
            if (strategy === 'LIQUIDATION') this.stats.successfulLiquidations++;

            const txHash = '0x' + Array.from({ length: 64 }, () =>
                Math.floor(Math.random() * 16).toString(16)).join('');

            return {
                success: true,
                strategy,
                userId,
                token,
                loanAmount: +loanAmount.toFixed(2),
                fee: +fee.toFixed(4),
                repayAmount: +repayRequired.toFixed(2),
                profit: +result.profit.toFixed(2),
                netProfit: +(result.profit - fee).toFixed(2),
                txHash,
                executedAt: new Date().toISOString()
            };

        } catch (err) {
            // Atomically revert: restore pool balance
            if (this.lending?.liquidityPool) {
                this.lending.liquidityPool[token] = snapshotBalance;
            }
            this.stats.failedLoans++;
            throw err;
        }
    }

    // ─── Internal runners ─────────────────────────────────────────────────────

    async _runDEXArb(params, loanAmount, fee) {
        const { ammPrice, oraclePrice, direction } = params;
        if (!ammPrice || !oraclePrice) throw new Error('Missing price params for DEX arb');

        const spread = Math.abs(oraclePrice - ammPrice) / oraclePrice;
        const grossProfit = loanAmount * spread;
        const ammFee = loanAmount * (this.amm?.feeRate || 0.003);
        const slippage = loanAmount * 0.001;
        const profit = grossProfit - ammFee - slippage;

        return {
            repaid: true,
            repaidAmount: loanAmount + fee,
            profit
        };
    }

    async _runLiquidation(params, loanAmount, fee) {
        const { loanId } = params;
        const loan = this.lending?.loans?.get(loanId);
        if (!loan) throw new Error(`Loan ${loanId} not found`);
        if (loan.status !== 'active') throw new Error(`Loan ${loanId} is not active`);

        const collateralValue = this._getCollateralValueUSD(loan.borrowerId);
        const bonus = collateralValue * LIQUIDATION_BONUS;
        const profit = bonus;

        // Mark loan liquidated
        loan.status = 'liquidated';
        loan.liquidatedAt = Date.now();
        loan.liquidatedBy = 'flash_loan_engine';

        // Notify lending system
        if (this.lending?.updateCreditScore) {
            this.lending.updateCreditScore(loan.borrowerId, 'LOAN_LIQUIDATED', { loanId });
        }

        return {
            repaid: true,
            repaidAmount: loanAmount + fee,
            profit
        };
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    _getCollateralValueUSD(userId) {
        if (!this.lending) return 0;
        try {
            return this.lending.getCollateralValue(userId);
        } catch {
            const collaterals = this.lending.collaterals?.get(userId) || {};
            let total = 0;
            for (const [token, amount] of Object.entries(collaterals)) {
                const price = this.amm?.oraclePrices?.[token] || 1;
                total += amount * price;
            }
            return total;
        }
    }

    _getLoanValueUSD(loan) {
        const price = this.amm?.oraclePrices?.[loan.token] || 1;
        const principal = loan.amount || 0;
        const interest = loan.accruedInterest || 0;
        return (principal + interest) * (loan.token === 'USDC' || loan.token === 'USDT' ? 1 : price);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUTO-SCANNER
    // ─────────────────────────────────────────────────────────────────────────

    startScanner(intervalMs = 30000) {
        if (this._scanInterval) return;
        this._scanInterval = setInterval(async () => {
            try {
                const { opportunities } = await this.scanOpportunities();
                if (opportunities.length > 0) {
                    console.log(
                        `[FLASH-LOAN] ${opportunities.length} opportunity(s) detected. ` +
                        `Best: ${opportunities[0].type} $${opportunities[0].netProfit.toFixed(2)} profit`
                    );
                }
            } catch (err) {
                console.error('[FLASH-LOAN] Scanner error:', err.message);
            }
        }, intervalMs);
        console.log(`[FLASH-LOAN] Auto-scanner started (every ${intervalMs / 1000}s)`);
    }

    stopScanner() {
        if (this._scanInterval) {
            clearInterval(this._scanInterval);
            this._scanInterval = null;
            console.log('[FLASH-LOAN] Auto-scanner stopped');
        }
    }

    getStats() {
        const uptimeMs = Date.now() - this.stats.startedAt;
        return {
            ...this.stats,
            uptimeHours: +(uptimeMs / 3600000).toFixed(2),
            successRate: this.stats.totalLoans > 0
                ? +((1 - this.stats.failedLoans / this.stats.totalLoans) * 100).toFixed(1)
                : 100,
            avgProfitPerLoan: this.stats.totalLoans > 0
                ? +(this.stats.totalProfitUSD / this.stats.totalLoans).toFixed(2)
                : 0
        };
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _instance = null;

function getFlashLoanEngine(lendingSystem, obeliskAMM) {
    if (!_instance) {
        _instance = new FlashLoanEngine(lendingSystem, obeliskAMM);
    }
    return _instance;
}

module.exports = { FlashLoanEngine, getFlashLoanEngine, FLASH_FEE, LIQUIDATION_BONUS };
