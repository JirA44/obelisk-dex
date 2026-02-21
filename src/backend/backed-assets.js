/**
 * OBELISK BACKED ASSETS V1.0
 * ═══════════════════════════════════════════════════════════════
 * Actifs tokenisés 1:1 adossés à des collatéraux réels/DeFi
 *
 * Types:
 *   OBK-USD  — Backed par USDC/USDT (stablecoin)
 *   OBK-BTC  — Backed par wBTC/BTCB
 *   OBK-GOLD — Backed par PAXG (or tokenisé)
 *   OBK-EUR  — Backed par EURS/EURC
 *   OBK-SPX  — Backed par index S&P 500 synthétique
 *   OBK-ETH  — Backed par stETH/wETH
 *
 * Mécanisme:
 *   1. User dépose collatéral (ex: USDC)
 *   2. Reçoit l'OBK-token 1:1 (+ rendement)
 *   3. Peut échanger, staker ou utiliser comme collatéral CDP
 *   4. Peut redeem en tout temps (unlock collatéral)
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// CATALOGUE DES BACKED ASSETS
// ─────────────────────────────────────────────────────────────────────────────

const BACKED_ASSETS = {
    'OBK-USD': {
        name:           'Obelisk Dollar',
        symbol:         'OBK-USD',
        category:       'stablecoin',
        peg:            1.00,               // 1 OBK-USD = $1.00
        backingAssets:  ['USDC', 'USDT'],   // Actifs de couverture acceptés
        ratio:          1.00,               // Ratio 1:1
        apy:            4.5,                // Rendement généré sur la réserve
        minDeposit:     1,                  // $1 minimum
        fee:            0.05,               // 0.05% frais de mint/redeem
        description:    'Dollar synthétique 1:1 USDC, rendement 4.5% APY',
        totalMinted:    0,
        totalReserve:   0,
        utilization:    0
    },
    'OBK-BTC': {
        name:           'Obelisk Bitcoin',
        symbol:         'OBK-BTC',
        category:       'crypto-backed',
        peg:            null,               // Prix flottant = prix BTC
        backingAssets:  ['WBTC', 'BTCB'],
        ratio:          1.00,
        apy:            1.8,
        minDeposit:     0.0001,             // ~$10 au cours actuel
        fee:            0.10,
        description:    'Bitcoin tokenisé 1:1 sur Obelisk, rendement 1.8% APY',
        totalMinted:    0,
        totalReserve:   0,
        utilization:    0
    },
    'OBK-GOLD': {
        name:           'Obelisk Gold',
        symbol:         'OBK-GOLD',
        category:       'commodity-backed',
        peg:            null,               // Prix = prix or
        backingAssets:  ['PAXG', 'XAUT'],
        ratio:          1.00,               // 1 OBK-GOLD = 1 fine troy ounce
        apy:            0.8,
        minDeposit:     0.001,             // ~$2
        fee:            0.15,
        description:    'Or tokenisé 1:1 via PAXG, protection inflation',
        totalMinted:    0,
        totalReserve:   0,
        utilization:    0
    },
    'OBK-EUR': {
        name:           'Obelisk Euro',
        symbol:         'OBK-EUR',
        category:       'stablecoin',
        peg:            1.08,               // ~1.08 USD par EUR (taux live)
        backingAssets:  ['EURS', 'EURC'],
        ratio:          1.00,
        apy:            3.2,
        minDeposit:     1,
        fee:            0.05,
        description:    'Euro synthétique 1:1 EURC, rendement 3.2% APY',
        totalMinted:    0,
        totalReserve:   0,
        utilization:    0
    },
    'OBK-SPX': {
        name:           'Obelisk S&P 500',
        symbol:         'OBK-SPX',
        category:       'index-backed',
        peg:            null,               // Prix = S&P 500 / 10 (synthétique)
        backingAssets:  ['USDC'],           // Backed par USDC + perps synthétiques
        ratio:          0.10,               // 1 OBK-SPX = 1/10 du S&P 500
        apy:            0,                  // Rendement = performance S&P 500
        minDeposit:     5,
        fee:            0.20,
        description:    'Exposition S&P 500 via synthétique, 0 dividendes, pur prix',
        totalMinted:    0,
        totalReserve:   0,
        utilization:    0
    },
    'OBK-ETH': {
        name:           'Obelisk Ether',
        symbol:         'OBK-ETH',
        category:       'crypto-backed',
        peg:            null,
        backingAssets:  ['WETH', 'stETH'],
        ratio:          1.00,
        apy:            4.2,                // stETH yield passthrough
        minDeposit:     0.001,
        fee:            0.08,
        description:    'ETH tokenisé 1:1 avec rendement staking 4.2% APY',
        totalMinted:    0,
        totalReserve:   0,
        utilization:    0
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// BACKED ASSETS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

class BackedAssetsManager {
    constructor() {
        this.assets   = JSON.parse(JSON.stringify(BACKED_ASSETS));   // Deep copy
        this.holdings = new Map();     // userId → { symbol → { amount, deposited, earnedYield, mintedAt } }
        this.txHistory = [];
        this.totalFeesCollected = 0;
        this.prices = {                // Prix de référence (mis à jour live)
            USDC: 1.00, USDT: 1.00,
            WBTC: 96000, BTCB: 96000,
            PAXG: 2820, XAUT: 2820,
            EURS: 1.08, EURC: 1.08,
            WETH: 2650, stETH: 2650,
            SPX:  5950  // S&P 500 index
        };
    }

    // ── Prix d'un OBK token en USD ────────────────────────────────────────────
    getPrice(symbol) {
        const asset = this.assets[symbol];
        if (!asset) return null;
        if (asset.peg) return asset.peg;
        // Prix dynamique basé sur le backing asset
        const backingPrice = this.prices[asset.backingAssets[0]] || 1;
        if (symbol === 'OBK-SPX') return this.prices.SPX * 0.1;
        return backingPrice * asset.ratio;
    }

    // ── Mint: déposer collatéral → recevoir OBK token ─────────────────────────
    mint(userId, symbol, backingAmount, backingAsset) {
        const asset = this.assets[symbol];
        if (!asset) return { success: false, error: `Unknown asset: ${symbol}` };
        if (!asset.backingAssets.includes(backingAsset)) {
            return { success: false, error: `${backingAsset} not accepted for ${symbol}` };
        }

        const backingPrice  = this.prices[backingAsset] || 1;
        const tokenPrice    = this.getPrice(symbol);
        const usdValue      = backingAmount * backingPrice;
        const tokenAmount   = usdValue / tokenPrice;
        const feeAmt        = tokenAmount * (asset.fee / 100);
        const netAmount     = tokenAmount - feeAmt;

        if (usdValue < asset.minDeposit) {
            return { success: false, error: `Minimum deposit: $${asset.minDeposit}` };
        }

        // Mettre à jour réserves
        asset.totalMinted  += netAmount;
        asset.totalReserve += backingAmount;
        this.totalFeesCollected += feeAmt * tokenPrice;

        // Enregistrer holding
        if (!this.holdings.has(userId)) this.holdings.set(userId, {});
        const h = this.holdings.get(userId);
        if (!h[symbol]) h[symbol] = { amount: 0, depositedUSD: 0, earnedYield: 0, mintedAt: Date.now() };
        h[symbol].amount       += netAmount;
        h[symbol].depositedUSD += usdValue;

        const txId = crypto.randomBytes(8).toString('hex');
        this.txHistory.push({ txId, type: 'MINT', userId, symbol, backingAmount, backingAsset, tokenAmount: netAmount, fee: feeAmt, timestamp: Date.now() });

        return {
            success:        true,
            txId,
            minted:         parseFloat(netAmount.toFixed(8)),
            fee:            parseFloat(feeAmt.toFixed(8)),
            symbol,
            backingAsset,
            backingAmount,
            usdValue:       parseFloat(usdValue.toFixed(2))
        };
    }

    // ── Redeem: brûler OBK token → récupérer collatéral ──────────────────────
    redeem(userId, symbol, tokenAmount) {
        const asset = this.assets[symbol];
        if (!asset) return { success: false, error: `Unknown asset: ${symbol}` };
        const h = this.holdings.get(userId)?.[symbol];
        if (!h || h.amount < tokenAmount) {
            return { success: false, error: 'Insufficient balance' };
        }

        const tokenPrice    = this.getPrice(symbol);
        const usdValue      = tokenAmount * tokenPrice;
        const feeAmt        = tokenAmount * (asset.fee / 100);
        const netReturn     = tokenAmount - feeAmt;
        const backingAsset  = asset.backingAssets[0];
        const backingPrice  = this.prices[backingAsset] || 1;
        const backingReturn = (netReturn * tokenPrice) / backingPrice;

        // Mettre à jour
        h.amount         -= tokenAmount;
        asset.totalMinted  = Math.max(0, asset.totalMinted - tokenAmount);
        asset.totalReserve = Math.max(0, asset.totalReserve - backingReturn);
        this.totalFeesCollected += feeAmt * tokenPrice;

        const txId = crypto.randomBytes(8).toString('hex');
        this.txHistory.push({ txId, type: 'REDEEM', userId, symbol, tokenAmount, backingReturn, backingAsset, fee: feeAmt, timestamp: Date.now() });

        return {
            success:        true,
            txId,
            burned:         tokenAmount,
            returned:       parseFloat(backingReturn.toFixed(8)),
            backingAsset,
            usdValue:       parseFloat(usdValue.toFixed(2)),
            fee:            parseFloat(feeAmt.toFixed(8))
        };
    }

    // ── Accrual de rendement (appeler 1x/jour en prod) ───────────────────────
    accrueYield() {
        const dailyRate = (apy) => apy / 100 / 365;
        let totalAccrued = 0;

        for (const [, userHoldings] of this.holdings) {
            for (const [symbol, h] of Object.entries(userHoldings)) {
                const asset = this.assets[symbol];
                if (!asset || asset.apy === 0) continue;
                const yieldAmount = h.amount * dailyRate(asset.apy);
                h.amount       += yieldAmount;
                h.earnedYield  += yieldAmount;
                totalAccrued   += yieldAmount * this.getPrice(symbol);
            }
        }

        return { totalAccrued: parseFloat(totalAccrued.toFixed(4)) };
    }

    // ── Balance d'un user ─────────────────────────────────────────────────────
    getBalance(userId) {
        const h = this.holdings.get(userId) || {};
        const result = {};
        let totalUSD = 0;
        for (const [symbol, data] of Object.entries(h)) {
            const price   = this.getPrice(symbol);
            const usdVal  = data.amount * price;
            totalUSD     += usdVal;
            result[symbol] = {
                amount:       parseFloat(data.amount.toFixed(8)),
                usdValue:     parseFloat(usdVal.toFixed(2)),
                earnedYield:  parseFloat(data.earnedYield.toFixed(8)),
                price
            };
        }
        return { holdings: result, totalUSD: parseFloat(totalUSD.toFixed(2)) };
    }

    // ── Catalogue public ──────────────────────────────────────────────────────
    getCatalog() {
        return Object.entries(this.assets).map(([symbol, a]) => ({
            symbol,
            name:         a.name,
            category:     a.category,
            price:        this.getPrice(symbol),
            apy:          a.apy,
            description:  a.description,
            backingAssets: a.backingAssets,
            fee:          a.fee,
            minDeposit:   a.minDeposit,
            totalMinted:  parseFloat(a.totalMinted.toFixed(4)),
            totalReserve: parseFloat(a.totalReserve.toFixed(4)),
            ratio:        a.ratio
        }));
    }

    // ── Update prix live ──────────────────────────────────────────────────────
    updatePrice(asset, price) {
        if (this.prices.hasOwnProperty(asset)) this.prices[asset] = price;
    }

    getStats() {
        const tvl = Object.values(this.assets).reduce((sum, a) => {
            const price = this.prices[a.backingAssets[0]] || 1;
            return sum + a.totalReserve * price;
        }, 0);
        return {
            totalAssetsTypes: Object.keys(this.assets).length,
            totalTVL:         parseFloat(tvl.toFixed(2)),
            totalFeesCollected: parseFloat(this.totalFeesCollected.toFixed(4)),
            txCount:          this.txHistory.length
        };
    }
}

module.exports = { BackedAssetsManager, BACKED_ASSETS };
