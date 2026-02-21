/**
 * OBELISK COLLATERAL MANAGER V1.0 — CDP System
 * ═══════════════════════════════════════════════════════════════
 * Collateralized Debt Positions (like MakerDAO/Aave)
 *
 * Mécanisme:
 *   1. User dépose collatéral (ETH, BTC, OBK-ETH, OBK-BTC...)
 *   2. Peut emprunter jusqu'à 66% de la valeur (ratio 150%)
 *   3. Intérêts calculés en continu (5% APY de base)
 *   4. Liquidation si collat < 120% de la dette
 *
 * Assets collatéraux acceptés:
 *   ETH, WBTC, OBK-ETH, OBK-BTC, OBK-GOLD (qualité AAA)
 *   ARB, SOL, AVAX (qualité A — ratio plus conservateur)
 *
 * Assets empruntables:
 *   OBK-USD, USDC, USDT
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG COLLATÉRAUX
// ─────────────────────────────────────────────────────────────────────────────

const COLLATERAL_CONFIG = {
    // Qualité AAA — collatéraux premium
    ETH:      { quality: 'AAA', ltv: 0.75, liqThreshold: 0.82, liqPenalty: 0.05, apy: 0 },
    WBTC:     { quality: 'AAA', ltv: 0.70, liqThreshold: 0.80, liqPenalty: 0.05, apy: 0 },
    'OBK-ETH':  { quality: 'AAA', ltv: 0.72, liqThreshold: 0.80, liqPenalty: 0.05, apy: 0 },
    'OBK-BTC':  { quality: 'AAA', ltv: 0.68, liqThreshold: 0.78, liqPenalty: 0.06, apy: 0 },
    'OBK-GOLD': { quality: 'AA',  ltv: 0.65, liqThreshold: 0.78, liqPenalty: 0.07, apy: 0 },
    // Qualité A — plus volatils
    SOL:      { quality: 'A',   ltv: 0.60, liqThreshold: 0.75, liqPenalty: 0.08, apy: 0 },
    ARB:      { quality: 'A',   ltv: 0.55, liqThreshold: 0.72, liqPenalty: 0.10, apy: 0 },
    AVAX:     { quality: 'A',   ltv: 0.58, liqThreshold: 0.73, liqPenalty: 0.09, apy: 0 },
    // Stablecoins
    USDC:     { quality: 'S',   ltv: 0.90, liqThreshold: 0.95, liqPenalty: 0.02, apy: 0 },
};

// Taux d'emprunt annuels par actif (en %)
const BORROW_RATES = {
    'OBK-USD': 5.0,    // 5% APY
    USDC:       4.5,
    USDT:       4.5,
};

// ─────────────────────────────────────────────────────────────────────────────
// CDP MANAGER
// ─────────────────────────────────────────────────────────────────────────────

class CollateralManager {
    constructor() {
        this.positions      = new Map();   // positionId → CDPPosition
        this.userPositions  = new Map();   // userId → Set<positionId>
        this.txHistory      = [];
        this.totalCollateralUSD  = 0;
        this.totalBorrowedUSD    = 0;
        this.totalInterestEarned = 0;
        this.liquidationCount    = 0;

        this.prices = {
            ETH: 2650, WBTC: 96000, SOL: 135, ARB: 0.55, AVAX: 23,
            USDC: 1, USDT: 1, 'OBK-USD': 1,
            'OBK-ETH': 2650, 'OBK-BTC': 96000, 'OBK-GOLD': 2820
        };
    }

    _price(asset) { return this.prices[asset] || 1; }

    // ── Ouvrir une position CDP ───────────────────────────────────────────────
    openPosition(userId, collateralAsset, collateralAmount, borrowAsset, borrowAmount) {
        const colConfig = COLLATERAL_CONFIG[collateralAsset];
        if (!colConfig) return { success: false, error: `${collateralAsset} non accepté comme collatéral` };
        if (!BORROW_RATES[borrowAsset]) return { success: false, error: `${borrowAsset} non empruntable` };

        const colPriceUSD  = this._price(collateralAsset);
        const colValueUSD  = collateralAmount * colPriceUSD;
        const borrowPriceUSD = this._price(borrowAsset);
        const borrowValueUSD = borrowAmount * borrowPriceUSD;

        // Vérifier LTV
        const maxBorrowUSD = colValueUSD * colConfig.ltv;
        if (borrowValueUSD > maxBorrowUSD) {
            return {
                success: false,
                error:   `Borrow trop élevé. Max: $${maxBorrowUSD.toFixed(2)} (LTV ${(colConfig.ltv * 100).toFixed(0)}%)`,
                maxBorrow: maxBorrowUSD / borrowPriceUSD
            };
        }

        const positionId = crypto.randomBytes(8).toString('hex');
        const now        = Date.now();

        const position = {
            positionId,
            userId,
            collateralAsset,
            collateralAmount,
            colValueUSD,
            borrowAsset,
            borrowAmount,
            borrowValueUSD,
            interestAccrued:   0,
            interestRate:      BORROW_RATES[borrowAsset],
            ltv:               colConfig.ltv,
            liqThreshold:      colConfig.liqThreshold,
            liqPenalty:        colConfig.liqPenalty,
            quality:           colConfig.quality,
            openedAt:          now,
            lastUpdate:        now,
            status:            'ACTIVE',
            health:            colValueUSD / borrowValueUSD   // > 1 = sain
        };

        this.positions.set(positionId, position);
        if (!this.userPositions.has(userId)) this.userPositions.set(userId, new Set());
        this.userPositions.get(userId).add(positionId);

        this.totalCollateralUSD += colValueUSD;
        this.totalBorrowedUSD   += borrowValueUSD;

        this.txHistory.push({ type: 'OPEN_CDP', positionId, userId, colValueUSD, borrowValueUSD, timestamp: now });

        return {
            success:         true,
            positionId,
            collateral:      `${collateralAmount} ${collateralAsset} ($${colValueUSD.toFixed(2)})`,
            borrowed:        `${borrowAmount} ${borrowAsset} ($${borrowValueUSD.toFixed(2)})`,
            collRatio:       parseFloat((colValueUSD / borrowValueUSD * 100).toFixed(1)),
            healthFactor:    parseFloat((colValueUSD / borrowValueUSD).toFixed(3)),
            liqPrice:        parseFloat((borrowValueUSD * position.liqThreshold / collateralAmount).toFixed(4)),
            interestRate:    BORROW_RATES[borrowAsset],
            quality:         colConfig.quality
        };
    }

    // ── Ajouter du collatéral ─────────────────────────────────────────────────
    addCollateral(userId, positionId, amount) {
        const pos = this.positions.get(positionId);
        if (!pos || pos.userId !== userId) return { success: false, error: 'Position not found' };
        if (pos.status !== 'ACTIVE') return { success: false, error: 'Position not active' };

        const addedUSD = amount * this._price(pos.collateralAsset);
        pos.collateralAmount += amount;
        pos.colValueUSD      += addedUSD;
        pos.health = pos.colValueUSD / (pos.borrowValueUSD + pos.interestAccrued);
        this.totalCollateralUSD += addedUSD;

        return { success: true, positionId, addedUSD, newHealth: parseFloat(pos.health.toFixed(3)) };
    }

    // ── Repayer la dette ──────────────────────────────────────────────────────
    repay(userId, positionId, repayAmount) {
        const pos = this.positions.get(positionId);
        if (!pos || pos.userId !== userId) return { success: false, error: 'Position not found' };
        if (pos.status !== 'ACTIVE') return { success: false, error: 'Position not active' };

        const totalDebt = pos.borrowAmount + pos.interestAccrued;
        const actualRepay = Math.min(repayAmount, totalDebt);

        // Repay interest first
        const interestRepay = Math.min(actualRepay, pos.interestAccrued);
        pos.interestAccrued -= interestRepay;
        const principalRepay = actualRepay - interestRepay;
        pos.borrowAmount    -= principalRepay;
        pos.borrowValueUSD   = pos.borrowAmount * this._price(pos.borrowAsset);
        this.totalBorrowedUSD = Math.max(0, this.totalBorrowedUSD - principalRepay * this._price(pos.borrowAsset));

        if (pos.borrowAmount <= 0.000001) {
            pos.status = 'CLOSED';
            // Return collateral
            return {
                success:    true,
                positionId,
                status:     'CLOSED',
                repaid:     actualRepay,
                collateralReturned: pos.collateralAmount,
                collateralAsset:    pos.collateralAsset
            };
        }

        pos.health = pos.colValueUSD / (pos.borrowValueUSD + pos.interestAccrued);
        return {
            success:     true,
            positionId,
            repaid:      actualRepay,
            remainingDebt: parseFloat((pos.borrowAmount + pos.interestAccrued).toFixed(6)),
            newHealth:   parseFloat(pos.health.toFixed(3))
        };
    }

    // ── Accrual d'intérêts (appeler régulièrement) ───────────────────────────
    accrueInterest() {
        const secondsPerYear = 365 * 24 * 3600;
        const now = Date.now();
        let totalAccrued = 0;

        for (const pos of this.positions.values()) {
            if (pos.status !== 'ACTIVE') continue;
            const secondsElapsed = (now - pos.lastUpdate) / 1000;
            const rate           = pos.interestRate / 100 / secondsPerYear;
            const interest       = pos.borrowAmount * rate * secondsElapsed;
            pos.interestAccrued += interest;
            pos.lastUpdate       = now;
            pos.health           = pos.colValueUSD / (pos.borrowValueUSD + pos.interestAccrued);
            totalAccrued        += interest * this._price(pos.borrowAsset);
        }

        this.totalInterestEarned += totalAccrued;
        return { totalAccrued: parseFloat(totalAccrued.toFixed(6)) };
    }

    // ── Scan liquidations ─────────────────────────────────────────────────────
    checkLiquidations() {
        const liquidated = [];

        for (const pos of this.positions.values()) {
            if (pos.status !== 'ACTIVE') continue;

            // Recalculer valeurs avec prix courants
            pos.colValueUSD    = pos.collateralAmount * this._price(pos.collateralAsset);
            pos.borrowValueUSD = pos.borrowAmount * this._price(pos.borrowAsset);
            pos.health         = pos.colValueUSD / (pos.borrowValueUSD + pos.interestAccrued);

            // Seuil de liquidation dépassé?
            const currentRatio = pos.colValueUSD / (pos.borrowValueUSD + pos.interestAccrued);
            if (currentRatio < pos.liqThreshold) {
                const penalty         = pos.colValueUSD * pos.liqPenalty;
                const seizedCollateral = pos.collateralAmount * (1 - pos.liqPenalty);

                pos.status = 'LIQUIDATED';
                this.liquidationCount++;
                this.totalBorrowedUSD   = Math.max(0, this.totalBorrowedUSD - pos.borrowValueUSD);
                this.totalCollateralUSD = Math.max(0, this.totalCollateralUSD - pos.colValueUSD);

                liquidated.push({
                    positionId:    pos.positionId,
                    userId:        pos.userId,
                    collateral:    pos.collateralAsset,
                    seizedAmount:  parseFloat(seizedCollateral.toFixed(8)),
                    penalty:       parseFloat(penalty.toFixed(4)),
                    healthFactor:  parseFloat(pos.health.toFixed(3)),
                    reason:        `Health ${pos.health.toFixed(3)} < threshold ${pos.liqThreshold}`
                });
            }
        }

        return liquidated;
    }

    // ── Positions d'un user ───────────────────────────────────────────────────
    getUserPositions(userId) {
        const posIds = this.userPositions.get(userId) || new Set();
        return Array.from(posIds).map(id => {
            const p = this.positions.get(id);
            if (!p) return null;
            return {
                positionId:   p.positionId,
                status:       p.status,
                collateral:   `${p.collateralAmount.toFixed(6)} ${p.collateralAsset}`,
                colValueUSD:  parseFloat(p.colValueUSD.toFixed(2)),
                debt:         `${(p.borrowAmount + p.interestAccrued).toFixed(6)} ${p.borrowAsset}`,
                debtUSD:      parseFloat((p.borrowValueUSD + p.interestAccrued).toFixed(2)),
                healthFactor: parseFloat((p.colValueUSD / (p.borrowValueUSD + p.interestAccrued || 1)).toFixed(3)),
                interestRate: p.interestRate,
                quality:      p.quality,
                openedAt:     new Date(p.openedAt).toISOString()
            };
        }).filter(Boolean);
    }

    // ── Update prix ───────────────────────────────────────────────────────────
    updatePrice(asset, price) {
        if (this.prices.hasOwnProperty(asset)) this.prices[asset] = price;
    }

    // ── Stats globales ────────────────────────────────────────────────────────
    getStats() {
        const active = [...this.positions.values()].filter(p => p.status === 'ACTIVE');
        return {
            totalPositions:      this.positions.size,
            activePositions:     active.length,
            totalCollateralUSD:  parseFloat(this.totalCollateralUSD.toFixed(2)),
            totalBorrowedUSD:    parseFloat(this.totalBorrowedUSD.toFixed(2)),
            totalInterestEarned: parseFloat(this.totalInterestEarned.toFixed(4)),
            liquidationCount:    this.liquidationCount,
            globalHealthFactor:  this.totalBorrowedUSD > 0
                ? parseFloat((this.totalCollateralUSD / this.totalBorrowedUSD).toFixed(3))
                : null,
            averageCollRatio:    active.length > 0
                ? parseFloat((active.reduce((s, p) => s + p.health, 0) / active.length).toFixed(3))
                : null
        };
    }

    // ── Catalogue collatéraux ─────────────────────────────────────────────────
    getCollateralCatalog() {
        return Object.entries(COLLATERAL_CONFIG).map(([asset, cfg]) => ({
            asset,
            quality:       cfg.quality,
            maxLTV:        `${(cfg.ltv * 100).toFixed(0)}%`,
            liqThreshold:  `${(cfg.liqThreshold * 100).toFixed(0)}%`,
            liqPenalty:    `${(cfg.liqPenalty * 100).toFixed(0)}%`,
            price:         this._price(asset)
        }));
    }
}

module.exports = { CollateralManager, COLLATERAL_CONFIG, BORROW_RATES };
