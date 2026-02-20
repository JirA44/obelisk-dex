/**
 * OBELISK STRUCTURED DERIVATIVES V1.0
 * Dérivés structurés 1:1 avec assurance contrepartie
 *
 * Concept:
 *   - Client dépose du USDC comme collatéral
 *   - Obelisk émet un dérivé représentant exactement 1 unité de l'asset X
 *   - Obelisk = contrepartie garantie (insurance fund protège le détenteur)
 *   - Le détenteur a l'exposition économique complète sans détenir l'asset réel
 *
 * Assets supportés:
 *   - Crypto: BTC, ETH, SOL, etc.
 *   - RWA Gold: PAXG, XAUT (1 unité = 1 troy oz or)
 *   - Stocks/ETFs: NVDA, AAPL, SPY, QQQ, GLD, etc.
 *   - Commodities: GC=F (gold futures), CL=F (oil), SI=F (silver)
 *
 * Produits:
 *   - OBL-{ASSET}  : dérivé standard 1:1 (ex: OBL-PAXG = 1 oz or)
 *   - OBL-{ASSET}P : dérivé protégé (downside protection 10%)
 *   - OBL-{ASSET}Y : dérivé yield (+ rendement staking/dividende)
 */

const fs   = require('fs');
const path = require('path');

// ─── CONFIG ──────────────────────────────────────────────────────────────────

// Insurance fund (Obelisk treasury backing all derivatives)
const INSURANCE_RATIO  = 0.10;  // 10% insurance sur chaque dérivé émis
const ISSUANCE_FEE     = 0.002; // 0.2% frais émission
const REDEMPTION_FEE   = 0.001; // 0.1% frais rachat
const PROTECTED_BUFFER = 0.10;  // 10% downside protection (produit P)

// Assets supportés pour les dérivés
const SUPPORTED_ASSETS = {
    // Crypto
    BTC: { name: 'Bitcoin',      category: 'crypto',   binance: 'BTCUSDT' },
    ETH: { name: 'Ethereum',     category: 'crypto',   binance: 'ETHUSDT' },
    SOL: { name: 'Solana',       category: 'crypto',   binance: 'SOLUSDT' },
    // RWA — Gold-backed
    PAXG: { name: 'Paxos Gold',  category: 'rwa_gold', binance: 'PAXGUSDT', description: '1 troy oz gold (LBMA vault, London)' },
    XAUT: { name: 'Tether Gold', category: 'rwa_gold', binance: 'XAUTUSDT', description: '1 troy oz gold (private vault, Switzerland)' },
    // Stablecoins
    USDT:  { name: 'Tether USD',          category: 'stablecoin', price: 1 },
    DAI:   { name: 'DAI',                 category: 'stablecoin', binance: 'DAIUSDT' },
    // V3.4: Stablecoins avec price action (depeg trading)
    USDE:  { name: 'Ethena USDe',         category: 'stablecoin', binance: 'USDEUSDT', description: 'Synthetic dollar Ethena — dépeg tradeable' },
    FDUSD: { name: 'First Digital USD',   category: 'stablecoin', price: 1,            description: 'Binance stablecoin — perps actifs' },
    FRAX:  { name: 'Frax Finance',        category: 'stablecoin', binance: 'FRAXUSDT', description: 'Algo-stable — price action sur depeg events' },
    // Synthetic stocks via Yahoo Finance (same feed as obelisk-perps globalSymbols)
    NVDA: { name: 'NVIDIA',      category: 'stock',    yahoo: 'NVDA' },
    AAPL: { name: 'Apple',       category: 'stock',    yahoo: 'AAPL' },
    SPY:  { name: 'S&P 500 ETF', category: 'etf',      yahoo: 'SPY'  },
    QQQ:  { name: 'Nasdaq ETF',  category: 'etf',      yahoo: 'QQQ'  },
    GLD:  { name: 'Gold ETF',    category: 'etf',      yahoo: 'GLD'  },
    'GC=F': { name: 'Gold Futures', category: 'commodity', yahoo: 'GC=F', description: '1 futures contract (~100 troy oz)' },
    'CL=F': { name: 'WTI Crude Oil',category: 'commodity', yahoo: 'CL=F' },
};

// ─── STRUCTURED DERIVATIVES ENGINE ──────────────────────────────────────────

class StructuredDerivatives {
    constructor(priceOracle) {
        this.oracle   = priceOracle;   // function(symbol) → price (USD)
        this.holdings = new Map();     // derivativeId → DerivativeHolding
        this.insuranceFund = 5000;     // $5,000 initial insurance fund (simulated)

        this.stats = {
            totalIssued:   0,
            totalRedeemed: 0,
            totalFeesCollected: 0,
            insuranceClaims: 0,
        };

        this.dataFile = path.join(__dirname, 'data', 'structured_derivatives.json');
        this.loadState();
        console.log('[DERIVATIVES] Structured Derivatives V1.0 initialized');
        console.log(`[DERIVATIVES] Insurance fund: $${this.insuranceFund.toFixed(2)} | Holdings: ${this.holdings.size}`);
    }

    // ─── ISSUE DERIVATIVE ─────────────────────────────────────────────────────
    // Client dépose collateral USDC → reçoit un dérivé 1:1 sur l'asset
    issue(userId, asset, quantity = 1, product = 'STANDARD') {
        const assetDef = SUPPORTED_ASSETS[asset];
        if (!assetDef) {
            return { error: `Asset ${asset} not supported. Supported: ${Object.keys(SUPPORTED_ASSETS).join(', ')}` };
        }

        const price = this.getPrice(asset);
        if (!price || price <= 0) {
            return { error: `No price available for ${asset}` };
        }

        const notional = price * quantity;  // USD value
        const fee      = notional * ISSUANCE_FEE;
        const insurance= notional * INSURANCE_RATIO;
        const collateral = notional + fee;  // what client pays (fee included)

        const derivativeId = `OBL-${asset}${product === 'PROTECTED' ? 'P' : product === 'YIELD' ? 'Y' : ''}-${Date.now()}-${userId.slice(-4)}`;

        const holding = {
            id: derivativeId,
            userId,
            asset,
            product,
            quantity,
            entryPrice:  price,
            notional,
            collateral,
            fee,
            insuranceReserve: insurance,
            // Protection (only for PROTECTED product)
            protectionFloor: product === 'PROTECTED' ? price * (1 - PROTECTED_BUFFER) : null,
            issuedAt: Date.now(),
            status: 'ACTIVE',
            // Yield accrual (only for YIELD product)
            yieldRate:    product === 'YIELD' ? 0.05 : 0,  // 5% APY simulated
            yieldAccrued: 0,
        };

        this.holdings.set(derivativeId, holding);
        this.insuranceFund += insurance;
        this.stats.totalIssued++;
        this.stats.totalFeesCollected += fee;
        this.saveState();

        console.log(`[DERIVATIVES] ISSUED ${derivativeId} | ${quantity} ${asset} @ $${price.toFixed(2)} | Notional: $${notional.toFixed(2)} | Fee: $${fee.toFixed(2)}`);

        return {
            success: true,
            derivativeId,
            asset,
            product,
            quantity,
            entryPrice: price,
            notional,
            collateralPaid: collateral,
            fee,
            insuranceReserve: insurance,
            protectionFloor: holding.protectionFloor,
            description: assetDef.description || assetDef.name,
        };
    }

    // ─── REDEEM DERIVATIVE ────────────────────────────────────────────────────
    // Client rachète son dérivé → reçoit la valeur actuelle en USDC
    redeem(derivativeId) {
        const holding = this.holdings.get(derivativeId);
        if (!holding) return { error: `Derivative ${derivativeId} not found` };
        if (holding.status !== 'ACTIVE') return { error: `Derivative ${derivativeId} is ${holding.status}` };

        const currentPrice = this.getPrice(holding.asset);
        if (!currentPrice) return { error: `Cannot get current price for ${holding.asset}` };

        let redeemPrice = currentPrice;

        // Protection: floor price si produit PROTECTED
        if (holding.product === 'PROTECTED' && holding.protectionFloor) {
            if (currentPrice < holding.protectionFloor) {
                // Insurance fund couvre la différence
                const shortfall = (holding.protectionFloor - currentPrice) * holding.quantity;
                if (this.insuranceFund >= shortfall) {
                    this.insuranceFund -= shortfall;
                    this.stats.insuranceClaims++;
                    redeemPrice = holding.protectionFloor;
                    console.log(`[DERIVATIVES] INSURANCE CLAIM: ${derivativeId} | Shortfall: $${shortfall.toFixed(2)} covered`);
                }
            }
        }

        // Yield accrual si produit YIELD
        let yieldPayout = 0;
        if (holding.product === 'YIELD') {
            const daysHeld = (Date.now() - holding.issuedAt) / (1000 * 86400);
            yieldPayout = holding.notional * holding.yieldRate * (daysHeld / 365);
            holding.yieldAccrued = yieldPayout;
        }

        const redeemValue = redeemPrice * holding.quantity;
        const redeemFee   = redeemValue * REDEMPTION_FEE;
        const payout      = redeemValue - redeemFee + yieldPayout;
        const pnl         = payout - holding.collateral;

        holding.status       = 'REDEEMED';
        holding.redeemedAt   = Date.now();
        holding.exitPrice    = redeemPrice;
        holding.payout       = payout;
        holding.pnl          = pnl;

        this.stats.totalRedeemed++;
        this.stats.totalFeesCollected += redeemFee;
        // Return insurance reserve to fund (minus what was claimed)
        this.insuranceFund += holding.insuranceReserve;
        this.saveState();

        console.log(`[DERIVATIVES] REDEEMED ${derivativeId} | Exit: $${redeemPrice.toFixed(2)} | Payout: $${payout.toFixed(2)} | PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);

        return {
            success: true,
            derivativeId,
            asset: holding.asset,
            quantity: holding.quantity,
            entryPrice: holding.entryPrice,
            exitPrice:  redeemPrice,
            redeemValue,
            redeemFee,
            yieldPayout,
            payout,
            pnl,
            pnlPct: ((pnl / holding.collateral) * 100).toFixed(2) + '%',
        };
    }

    // ─── MARK TO MARKET ───────────────────────────────────────────────────────
    markToMarket(derivativeId) {
        const holding = this.holdings.get(derivativeId);
        if (!holding || holding.status !== 'ACTIVE') return null;

        const currentPrice = this.getPrice(holding.asset);
        if (!currentPrice) return null;

        const currentValue = currentPrice * holding.quantity;
        const unrealizedPnl = currentValue - holding.notional;
        const unrealizedPnlPct = (unrealizedPnl / holding.notional * 100).toFixed(2);
        const daysHeld = ((Date.now() - holding.issuedAt) / (1000 * 86400)).toFixed(1);

        // Yield accrual
        let yieldAccrued = 0;
        if (holding.product === 'YIELD') {
            yieldAccrued = holding.notional * holding.yieldRate * (parseFloat(daysHeld) / 365);
        }

        return {
            derivativeId,
            asset:         holding.asset,
            product:       holding.product,
            quantity:      holding.quantity,
            entryPrice:    holding.entryPrice,
            currentPrice,
            currentValue,
            unrealizedPnl,
            unrealizedPnlPct: unrealizedPnlPct + '%',
            protectionFloor:  holding.protectionFloor,
            yieldAccrued,
            daysHeld,
            insuranceCovered: holding.product === 'PROTECTED',
        };
    }

    // ─── LIST USER HOLDINGS ───────────────────────────────────────────────────
    getUserHoldings(userId) {
        const active = [];
        for (const [id, h] of this.holdings) {
            if (h.userId === userId && h.status === 'ACTIVE') {
                active.push(this.markToMarket(id));
            }
        }
        return active.filter(Boolean);
    }

    // ─── CATALOG ──────────────────────────────────────────────────────────────
    getCatalog() {
        const catalog = [];
        for (const [symbol, def] of Object.entries(SUPPORTED_ASSETS)) {
            const price = this.getPrice(symbol);
            catalog.push({
                symbol,
                name:     def.name,
                category: def.category,
                price:    price || null,
                products: [
                    { id: 'STANDARD',  name: `OBL-${symbol}`,  description: '1:1 dérivé pur', fee: `${ISSUANCE_FEE*100}%` },
                    { id: 'PROTECTED', name: `OBL-${symbol}P`, description: `Protection plancher -${PROTECTED_BUFFER*100}%`, fee: `${ISSUANCE_FEE*100}%` },
                    { id: 'YIELD',     name: `OBL-${symbol}Y`, description: '+ 5% APY simulated yield', fee: `${ISSUANCE_FEE*100}%` },
                ],
                description: def.description || '',
            });
        }
        return catalog.sort((a, b) => {
            const order = { rwa_gold: 0, stablecoin: 1, etf: 2, commodity: 3, crypto: 4, stock: 5 };
            return (order[a.category] || 9) - (order[b.category] || 9);
        });
    }

    // ─── PRICE ORACLE ────────────────────────────────────────────────────────
    getPrice(symbol) {
        if (typeof this.oracle === 'function') {
            const p = this.oracle(symbol);
            if (p && p > 0) return p;
        }
        // Fallback defaults
        const defaults = { USDT: 1, USDC: 1, DAI: 1, FDUSD: 1, PAXG: 2950, XAUT: 2950 };
        return defaults[symbol] || null;
    }

    // ─── PERSIST ──────────────────────────────────────────────────────────────
    saveState() {
        try {
            const dir = path.dirname(this.dataFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const data = {
                insuranceFund: this.insuranceFund,
                stats: this.stats,
                holdings: Object.fromEntries(this.holdings),
            };
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
        } catch (e) { /* silent */ }
    }

    loadState() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
                if (data.insuranceFund) this.insuranceFund = data.insuranceFund;
                if (data.stats)         this.stats         = data.stats;
                if (data.holdings) {
                    for (const [k, v] of Object.entries(data.holdings)) {
                        this.holdings.set(k, v);
                    }
                }
            }
        } catch (e) { /* fresh start */ }
    }

    getInsuranceFund() {
        return {
            balance:    this.insuranceFund,
            totalDerivatives: this.stats.totalIssued - this.stats.totalRedeemed,
            coverageRatio: INSURANCE_RATIO,
            stats: this.stats,
        };
    }
}

module.exports = { StructuredDerivatives, SUPPORTED_ASSETS };
