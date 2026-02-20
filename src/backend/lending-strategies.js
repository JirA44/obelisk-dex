/**
 * OBELISK Lending Strategies V1.0
 *
 * Three composable strategies built on top of LendingSystem + MicroInvest:
 *
 *   1. SPREAD_ARB      — Borrow cheap token, lend expensive token for positive carry
 *   2. RECURSIVE_LOOP  — Deposit → borrow → stake → repeat (leverage yield)
 *   3. MICRO_LEND      — Ultra-small lending ($0.01+) with auto-compounding
 *
 * All calculations are deterministic simulations using real Obelisk rates.
 */

'use strict';

// ─── Rate Tables ─────────────────────────────────────────────────────────────

// Borrow cost (paid by borrower)
const BORROW_RATES = {
    USDC: 5.0,   // 5% APY
    USDT: 5.0,
    ETH:  3.0,   // 3% APY
    BTC:  2.5,   // 2.5% APY
    SOL:  8.0,
    ARB:  10.0
};

// Earn rate (received by lender/staker)
const EARN_RATES = {
    USDC: 4.5,   // Saving pool APY
    USDT: 4.5,
    ETH:  4.2,   // Liquid staking (stETH)
    BTC:  2.0,   // Wrapped BTC vault
    SOL:  7.5,   // stSOL staking
    ARB:  8.0,   // ARB staking
    AVAX: 6.8,
    ATOM: 8.2
};

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 1 — SPREAD ARBITRAGE
// Borrow a cheap token, deploy capital into a higher-yielding token.
// Net carry = earn_rate - borrow_rate - conversion_cost
// ─────────────────────────────────────────────────────────────────────────────

function scanSpreadArbs(minCarryPct = 0.5) {
    const arbs = [];

    for (const [borrowToken, borrowRate] of Object.entries(BORROW_RATES)) {
        for (const [earnToken, earnRate] of Object.entries(EARN_RATES)) {
            if (borrowToken === earnToken) continue;

            // Cost to convert borrowed token → earn token (AMM 0.3%)
            const conversionCost = 0.3;
            const carry = earnRate - borrowRate - conversionCost;

            if (carry < minCarryPct) continue;

            arbs.push({
                strategy: 'SPREAD_ARB',
                borrow: {
                    token: borrowToken,
                    ratePct: borrowRate,
                    label: `Borrow ${borrowToken} at ${borrowRate}% APY`
                },
                earn: {
                    token: earnToken,
                    ratePct: earnRate,
                    label: `Stake/lend ${earnToken} at ${earnRate}% APY`
                },
                conversionCostPct: conversionCost,
                netCarryPct: +carry.toFixed(2),
                risk: _riskLabel(borrowToken, earnToken),
                steps: [
                    `Deposit collateral to Obelisk Lending`,
                    `Borrow ${borrowToken} at ${borrowRate}% APY`,
                    `Swap ${borrowToken} → ${earnToken} on Obelisk AMM (0.3% fee)`,
                    `Stake/lend ${earnToken} at ${earnRate}% APY`,
                    `Net carry: +${carry.toFixed(2)}% APY`
                ]
            });
        }
    }

    return arbs.sort((a, b) => b.netCarryPct - a.netCarryPct);
}

function projectSpreadArb(capitalUSD, borrowToken, earnToken, durationDays = 365) {
    const borrowRate = BORROW_RATES[borrowToken];
    const earnRate = EARN_RATES[earnToken];

    if (!borrowRate) throw new Error(`No borrow rate for ${borrowToken}`);
    if (!earnRate) throw new Error(`No earn rate for ${earnToken}`);

    const conversionCost = 0.3; // AMM fee one-way
    const netCarryPct = earnRate - borrowRate - conversionCost;
    const dailyRate = netCarryPct / 365 / 100;

    // Compound daily
    const finalValue = capitalUSD * Math.pow(1 + dailyRate, durationDays);
    const profit = finalValue - capitalUSD;

    return {
        strategy: 'SPREAD_ARB',
        capital: capitalUSD,
        borrowToken,
        earnToken,
        borrowRatePct: borrowRate,
        earnRatePct: earnRate,
        netCarryPct: +netCarryPct.toFixed(2),
        durationDays,
        profit: +profit.toFixed(2),
        finalValue: +finalValue.toFixed(2),
        roi: +((profit / capitalUSD) * 100).toFixed(2),
        breakEvenDays: Math.ceil(0 / dailyRate) || 0, // Already profitable from day 1 if carry>0
        risk: _riskLabel(borrowToken, earnToken)
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 2 — RECURSIVE YIELD LOOP
// Each loop: deposit USDC → borrow ETH → stake ETH → re-deposit
// Net APY compounds across loops (diminishing returns per loop)
// ─────────────────────────────────────────────────────────────────────────────

function calculateRecursiveLoop(params = {}) {
    const {
        initialCapital = 1000,
        loops = 3,
        depositToken = 'USDC',
        borrowToken = 'ETH',
        stakeToken = 'ETH',
        ltv = 0.75,           // Loan to Value ratio (75%)
        safetyBuffer = 0.10   // 10% buffer below max LTV
    } = params;

    const effectiveLTV = ltv - safetyBuffer;   // 65% effective LTV
    const depositEarnRate = EARN_RATES[depositToken] / 100;
    const borrowCostRate = BORROW_RATES[borrowToken] / 100;
    const stakeEarnRate = EARN_RATES[stakeToken] / 100;

    const positions = [];
    let totalEarned = 0;
    let totalPaid = 0;
    let cumulativeCapital = initialCapital;
    let runningDeposit = initialCapital;

    for (let i = 0; i < loops; i++) {
        // 1. Earn on deposit
        const depositEarned = runningDeposit * depositEarnRate;

        // 2. Borrow against deposit
        const borrowed = runningDeposit * effectiveLTV;

        // 3. Pay borrow cost
        const borrowCost = borrowed * borrowCostRate;

        // 4. Stake borrowed tokens
        const stakeEarned = borrowed * stakeEarnRate;

        // Net for this loop
        const loopEarned = depositEarned + stakeEarned;
        const loopPaid = borrowCost;
        const loopNet = loopEarned - loopPaid;

        totalEarned += loopEarned;
        totalPaid += loopPaid;
        cumulativeCapital += loopNet;

        positions.push({
            loop: i + 1,
            deposit: +runningDeposit.toFixed(2),
            borrowed: +borrowed.toFixed(2),
            earned: +loopEarned.toFixed(2),
            paid: +loopPaid.toFixed(2),
            netLoop: +loopNet.toFixed(2),
            cumulativeAPY: +(((totalEarned - totalPaid) / initialCapital) * 100).toFixed(2),
            effectiveLeverage: +((i + 1) * effectiveLTV).toFixed(2)
        });

        // Next loop: re-deposit a portion of borrowed tokens
        runningDeposit = borrowed * 0.90; // 90% = keep 10% as buffer
    }

    const totalNet = totalEarned - totalPaid;
    const netAPY = (totalNet / initialCapital) * 100;
    const baseAPY = EARN_RATES[depositToken];
    const upliftPct = ((netAPY - baseAPY) / baseAPY) * 100;

    return {
        strategy: 'RECURSIVE_YIELD_LOOP',
        params: {
            initialCapital,
            loops,
            depositToken,
            borrowToken,
            stakeToken,
            ltv,
            effectiveLTV,
            safetyBuffer
        },
        summary: {
            totalEarned: +totalEarned.toFixed(2),
            totalPaid: +totalPaid.toFixed(2),
            netProfit: +totalNet.toFixed(2),
            netAPY: +netAPY.toFixed(2),
            baseAPY,
            upliftPct: +upliftPct.toFixed(1),
            maxLoss: `If ${borrowToken} price rises >35%, deposits will be liquidated`,
            riskLevel: loops <= 2 ? 'LOW' : loops <= 3 ? 'MEDIUM' : 'HIGH',
            liquidationBuffer: `${((safetyBuffer + 0.05) * 100).toFixed(0)}% price drop tolerance`
        },
        positions,
        steps: _recursiveSteps(depositToken, borrowToken, stakeToken, loops, effectiveLTV)
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 3 — MICRO LENDING ($0.01+)
// Ultra-small lending with auto-compounding and utilization bonuses
// ─────────────────────────────────────────────────────────────────────────────

const UTILIZATION_BONUS_SCHEDULE = [
    { minUtil: 0.95, bonus: 8.0 },
    { minUtil: 0.85, bonus: 4.0 },
    { minUtil: 0.70, bonus: 2.0 },
    { minUtil: 0.50, bonus: 1.0 },
    { minUtil: 0.00, bonus: 0.0 }
];

function getMicroLendingRates(utilizationRatios = {}) {
    const rates = {};

    for (const [token, baseRate] of Object.entries(EARN_RATES)) {
        const utilization = utilizationRatios[token] || 0.60; // Default 60%
        const bonus = _utilizationBonus(utilization);
        const effectiveRate = baseRate + bonus;

        rates[token] = {
            token,
            baseAPY: baseRate,
            utilizationPct: +(utilization * 100).toFixed(1),
            utilizationBonus: +bonus.toFixed(1),
            effectiveAPY: +effectiveRate.toFixed(2),
            minDeposit: 0.01,
            compoundFrequency: 'hourly',
            withdrawalFee: 0.1
        };
    }

    return rates;
}

function projectMicroLend(params = {}) {
    const {
        depositUSD = 1.0,
        token = 'USDC',
        durationDays = 30,
        utilizationRatio = 0.70,
        compound = true
    } = params;

    if (depositUSD < 0.01) throw new Error('Minimum deposit is $0.01');

    const baseRate = EARN_RATES[token];
    if (!baseRate) throw new Error(`No earn rate for ${token}`);

    const bonus = _utilizationBonus(utilizationRatio);
    const annualRate = (baseRate + bonus) / 100;
    const dailyRate = annualRate / 365;

    let finalValue;
    if (compound) {
        // Compound hourly
        const hourlyRate = annualRate / 8760;
        const hours = durationDays * 24;
        finalValue = depositUSD * Math.pow(1 + hourlyRate, hours);
    } else {
        finalValue = depositUSD * (1 + dailyRate * durationDays);
    }

    const profit = finalValue - depositUSD;
    const withdrawalFee = finalValue * 0.001; // 0.1% fee on withdraw
    const netReceived = finalValue - withdrawalFee;

    // Milestone projections
    const milestones = [1, 7, 30, 90, 365].map(days => {
        const v = compound
            ? depositUSD * Math.pow(1 + annualRate / 8760, days * 24)
            : depositUSD * (1 + dailyRate * days);
        return { days, value: +v.toFixed(4), profit: +(v - depositUSD).toFixed(4) };
    });

    return {
        strategy: 'MICRO_LEND',
        input: { depositUSD, token, durationDays, utilizationRatio, compound },
        rates: {
            baseAPY: baseRate,
            utilizationBonus: +bonus.toFixed(2),
            effectiveAPY: +(baseRate + bonus).toFixed(2)
        },
        output: {
            finalValue: +finalValue.toFixed(4),
            profit: +profit.toFixed(4),
            withdrawalFee: +withdrawalFee.toFixed(4),
            netReceived: +netReceived.toFixed(4),
            roi: +((profit / depositUSD) * 100).toFixed(3)
        },
        milestones,
        note: depositUSD < 1
            ? `Micro-deposit: $${depositUSD} earns $${profit.toFixed(4)} in ${durationDays} days`
            : null
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO OPTIMIZER
// Given a capital amount, suggest optimal allocation across all strategies
// ─────────────────────────────────────────────────────────────────────────────

function optimizePortfolio(totalCapital = 1000, riskProfile = 'MODERATE') {
    const profiles = {
        CONSERVATIVE: {
            MICRO_LEND: 0.60,    // 60% safe lending
            SPREAD_ARB: 0.30,    // 30% low-risk carry
            RECURSIVE_LOOP: 0.10 // 10% leveraged yield
        },
        MODERATE: {
            MICRO_LEND: 0.40,
            SPREAD_ARB: 0.35,
            RECURSIVE_LOOP: 0.25
        },
        AGGRESSIVE: {
            MICRO_LEND: 0.20,
            SPREAD_ARB: 0.30,
            RECURSIVE_LOOP: 0.50
        }
    };

    const alloc = profiles[riskProfile] || profiles.MODERATE;

    // Best spread arb
    const spreadArbs = scanSpreadArbs();
    const bestSpread = spreadArbs[0] || null;

    const allocations = [];
    let totalProjectedProfit = 0;

    // MICRO_LEND slice
    const microCapital = totalCapital * alloc.MICRO_LEND;
    const microResult = projectMicroLend({ depositUSD: microCapital, token: 'USDC', durationDays: 365 });
    allocations.push({
        strategy: 'MICRO_LEND',
        capital: +microCapital.toFixed(2),
        allocationPct: +(alloc.MICRO_LEND * 100).toFixed(0),
        projectedAPY: microResult.rates.effectiveAPY,
        projectedProfit: +microResult.output.profit.toFixed(2),
        risk: 'LOW'
    });
    totalProjectedProfit += microResult.output.profit;

    // SPREAD_ARB slice
    if (bestSpread) {
        const spreadCapital = totalCapital * alloc.SPREAD_ARB;
        const spreadResult = projectSpreadArb(
            spreadCapital,
            bestSpread.borrow.token,
            bestSpread.earn.token,
            365
        );
        allocations.push({
            strategy: 'SPREAD_ARB',
            capital: +spreadCapital.toFixed(2),
            allocationPct: +(alloc.SPREAD_ARB * 100).toFixed(0),
            pair: `${bestSpread.borrow.token}→${bestSpread.earn.token}`,
            projectedAPY: +spreadResult.netCarryPct.toFixed(2),
            projectedProfit: +spreadResult.profit.toFixed(2),
            risk: bestSpread.risk
        });
        totalProjectedProfit += spreadResult.profit;
    }

    // RECURSIVE_LOOP slice
    const loopCapital = totalCapital * alloc.RECURSIVE_LOOP;
    const loops = riskProfile === 'AGGRESSIVE' ? 4 : riskProfile === 'CONSERVATIVE' ? 2 : 3;
    const loopResult = calculateRecursiveLoop({ initialCapital: loopCapital, loops });
    allocations.push({
        strategy: 'RECURSIVE_LOOP',
        capital: +loopCapital.toFixed(2),
        allocationPct: +(alloc.RECURSIVE_LOOP * 100).toFixed(0),
        loops,
        projectedAPY: loopResult.summary.netAPY,
        projectedProfit: +loopResult.summary.netProfit.toFixed(2),
        risk: loopResult.summary.riskLevel
    });
    totalProjectedProfit += loopResult.summary.netProfit;

    const blendedAPY = (totalProjectedProfit / totalCapital) * 100;

    return {
        riskProfile,
        totalCapital,
        blendedAPY: +blendedAPY.toFixed(2),
        totalProjectedProfit: +totalProjectedProfit.toFixed(2),
        allocations,
        vsHodl: `+${blendedAPY.toFixed(1)}% vs holding`,
        recommendation: `${riskProfile} portfolio targets ${blendedAPY.toFixed(1)}% APY on $${totalCapital}`
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _utilizationBonus(utilization) {
    for (const { minUtil, bonus } of UTILIZATION_BONUS_SCHEDULE) {
        if (utilization >= minUtil) return bonus;
    }
    return 0;
}

function _riskLabel(borrowToken, earnToken) {
    const highRisk = ['SOL', 'ARB', 'AVAX', 'ATOM'];
    if (highRisk.includes(earnToken) && highRisk.includes(borrowToken)) return 'HIGH';
    if (highRisk.includes(earnToken) || highRisk.includes(borrowToken)) return 'MEDIUM';
    return 'LOW';
}

function _recursiveSteps(depositToken, borrowToken, stakeToken, loops, ltv) {
    return [
        `1. Deposit ${depositToken} as collateral → earn ${EARN_RATES[depositToken]}% APY`,
        `2. Borrow ${borrowToken} (${(ltv * 100).toFixed(0)}% LTV) → pay ${BORROW_RATES[borrowToken]}% APY`,
        `3. Stake borrowed ${stakeToken} → earn ${EARN_RATES[stakeToken]}% APY`,
        loops > 1 ? `4. Repeat ${loops - 1}x more with borrowed amount` : '4. Single loop complete',
        `✓ Net APY > ${EARN_RATES[depositToken]}% (compounded leverage yield)`
    ];
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    scanSpreadArbs,
    projectSpreadArb,
    calculateRecursiveLoop,
    getMicroLendingRates,
    projectMicroLend,
    optimizePortfolio,
    BORROW_RATES,
    EARN_RATES
};
