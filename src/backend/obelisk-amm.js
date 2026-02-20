/**
 * OBELISK AMM (Automated Market Maker) V1.0
 * Obelisk trade par lui-même - comme Uniswap
 *
 * Features:
 * - Constant Product AMM (x * y = k)
 * - Liquidity Pools internes
 * - Swaps sans exchange externe
 * - Fees collectées par le protocole
 */

const fs = require('fs');
const path = require('path');

class ObeliskAMM {
    constructor() {
        // Liquidity pools (pair -> {tokenA, tokenB, reserveA, reserveB, k})
        this.pools = new Map();

        // Config
        this.feeRate = 0.003;        // 0.3% swap fee (like Uniswap)
        this.protocolFee = 0.0005;   // 0.05% protocol fee
        this.minLiquidity = 100;     // Min $100 pour créer un pool

        // Stats
        this.stats = {
            totalSwaps: 0,
            totalVolume: 0,
            feesCollected: 0,
            tvl: 0
        };

        // Price oracle (pour comparaison) - defaults in case Binance fails
        this.oraclePrices = {
            BTC: 93000, ETH: 3100, SOL: 135, ARB: 0.45, LINK: 13,
            DOGE: 0.17, XRP: 2.35, ADA: 0.55, AVAX: 22, OP: 1.10,
            // Extended coins for MixBot
            AAVE: 165, CRV: 0.40, UNI: 8.50, MKR: 1500, LDO: 1.20,
            MATIC: 0.35, SUI: 2.30, APT: 5.80, NEAR: 3.50, FTM: 0.45,
            TIA: 4.20, INJ: 12.50, SEI: 0.30, PENDLE: 2.00, ENA: 0.65,
            WIF: 1.40, PEPE: 0.000008, BONK: 0.000015, JUP: 0.65,
            RENDER: 3.80, STX: 1.10, IMX: 1.25, GALA: 0.025, AXS: 4.80,
            SAND: 0.35, ENJ: 0.20, CHZ: 0.055, GMT: 0.12, APE: 0.75,
            USDC: 1, USDT: 1, DAI: 1, FDUSD: 1, USDE: 1, FRAX: 1,
            // V3.3: RWA — Gold-backed (DeFiLlama top RWA)
            PAXG: 2950,  // ~1 troy oz gold
            XAUT: 2950,  // ~1 troy oz gold (Tether Gold)
        };

        this.dataFile = path.join(__dirname, 'data', 'obelisk_amm.json');

        console.log('[OBELISK-AMM] Automated Market Maker V1.0 initialized');
    }

    async init() {
        this.loadState();
        await this.syncOraclePrices();

        // Créer pools par défaut si vides
        if (this.pools.size === 0) {
            await this.createDefaultPools();
        }

        console.log(`[OBELISK-AMM] ${this.pools.size} pools actifs`);
        console.log(`[OBELISK-AMM] TVL: $${this.calculateTVL().toFixed(2)}`);

        // Sync prices every 30s
        setInterval(() => this.syncOraclePrices(), 30000);

        return true;
    }

    // Create default pools with initial liquidity
    async createDefaultPools() {
        console.log('[OBELISK-AMM] Creating default liquidity pools...');

        // Initial liquidity (virtual - Obelisk provides)
        const initialPools = [
            { tokenA: 'BTC', tokenB: 'USDC', amountA: 0.5, amountB: 47500 },    // ~$95k BTC
            { tokenA: 'ETH', tokenB: 'USDC', amountA: 15, amountB: 48000 },     // ~$3200 ETH
            { tokenA: 'SOL', tokenB: 'USDC', amountA: 250, amountB: 45000 },    // ~$180 SOL
            { tokenA: 'ARB', tokenB: 'USDC', amountA: 50000, amountB: 40000 },  // ~$0.80 ARB
            { tokenA: 'LINK', tokenB: 'USDC', amountA: 2000, amountB: 40000 },  // ~$20 LINK
            { tokenA: 'DOGE', tokenB: 'USDC', amountA: 100000, amountB: 35000 },// ~$0.35 DOGE
            { tokenA: 'XRP', tokenB: 'USDC', amountA: 15000, amountB: 37500 },  // ~$2.50 XRP
            { tokenA: 'ADA', tokenB: 'USDC', amountA: 40000, amountB: 36000 },  // ~$0.90 ADA
            { tokenA: 'AVAX', tokenB: 'USDC', amountA: 1000, amountB: 35000 },  // ~$35 AVAX
            { tokenA: 'OP',   tokenB: 'USDC', amountA: 20000, amountB: 34000 },   // ~$1.70 OP
            // V3.3: RWA — Gold-backed (DeFiLlama top RWA)
            { tokenA: 'PAXG', tokenB: 'USDC', amountA: 10,    amountB: 29500 },  // 10 PAXG ~$2950/oz
            { tokenA: 'XAUT', tokenB: 'USDC', amountA: 10,    amountB: 29500 },  // 10 XAUT ~$2950/oz (Tether Gold)
            // V3.3: Stablecoin pools (USDT/USDC, DAI/USDC)
            { tokenA: 'USDT', tokenB: 'USDC', amountA: 50000, amountB: 50000 },  // $100K stable pool
            { tokenA: 'DAI',  tokenB: 'USDC', amountA: 40000, amountB: 40000 },  // $80K stable pool
            // V3.4: Depeg trading pools
            { tokenA: 'USDE',  tokenB: 'USDC', amountA: 30000, amountB: 30000 }, // Ethena synthetic $
            { tokenA: 'FDUSD', tokenB: 'USDC', amountA: 25000, amountB: 25000 }, // First Digital USD
            { tokenA: 'FRAX',  tokenB: 'USDC', amountA: 20000, amountB: 20000 }, // Frax algo-stable
        ];

        for (const pool of initialPools) {
            this.createPool(pool.tokenA, pool.tokenB, pool.amountA, pool.amountB, 'OBELISK_PROTOCOL');
        }

        this.saveState();
        console.log(`[OBELISK-AMM] Created ${initialPools.length} default pools`);
    }

    // Create a new liquidity pool
    createPool(tokenA, tokenB, amountA, amountB, provider = 'unknown') {
        const pairId = this.getPairId(tokenA, tokenB);

        if (this.pools.has(pairId)) {
            // Add to existing pool
            return this.addLiquidity(tokenA, tokenB, amountA, amountB, provider);
        }

        const pool = {
            tokenA,
            tokenB,
            reserveA: amountA,
            reserveB: amountB,
            k: amountA * amountB,  // Constant product
            lpTokens: Math.sqrt(amountA * amountB),  // LP tokens issued
            providers: { [provider]: Math.sqrt(amountA * amountB) },
            createdAt: Date.now(),
            totalSwaps: 0,
            totalVolume: 0,
            feesEarned: 0
        };

        this.pools.set(pairId, pool);
        console.log(`[OBELISK-AMM] Pool created: ${tokenA}/${tokenB} | Reserve: ${amountA} ${tokenA} + ${amountB} ${tokenB}`);

        return pool;
    }

    // Add liquidity to existing pool
    addLiquidity(tokenA, tokenB, amountA, amountB, provider) {
        const pairId = this.getPairId(tokenA, tokenB);
        const pool = this.pools.get(pairId);

        if (!pool) {
            return this.createPool(tokenA, tokenB, amountA, amountB, provider);
        }

        // Calculate LP tokens to mint (proportional)
        const lpTokensToMint = Math.min(
            (amountA / pool.reserveA) * pool.lpTokens,
            (amountB / pool.reserveB) * pool.lpTokens
        );

        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.k = pool.reserveA * pool.reserveB;
        pool.lpTokens += lpTokensToMint;
        pool.providers[provider] = (pool.providers[provider] || 0) + lpTokensToMint;

        this.saveState();
        console.log(`[OBELISK-AMM] Liquidity added: +${amountA} ${tokenA} +${amountB} ${tokenB}`);

        return { lpTokens: lpTokensToMint, pool };
    }

    // SWAP - The core function
    async swap(tokenIn, tokenOut, amountIn, userId = 'default', minAmountOut = 0) {
        const pairId = this.getPairId(tokenIn, tokenOut);
        const pool = this.pools.get(pairId);

        if (!pool) {
            return { success: false, error: `No pool for ${tokenIn}/${tokenOut}` };
        }

        // Determine direction
        const isAtoB = pool.tokenA === tokenIn;
        const reserveIn = isAtoB ? pool.reserveA : pool.reserveB;
        const reserveOut = isAtoB ? pool.reserveB : pool.reserveA;

        // Calculate output using constant product formula
        // (reserveIn + amountIn) * (reserveOut - amountOut) = k
        // amountOut = reserveOut - k / (reserveIn + amountIn)
        const amountInWithFee = amountIn * (1 - this.feeRate);
        const amountOut = reserveOut - (pool.k / (reserveIn + amountInWithFee));

        if (amountOut <= 0) {
            return { success: false, error: 'Insufficient liquidity' };
        }

        if (amountOut < minAmountOut) {
            return { success: false, error: `Slippage too high. Got ${amountOut.toFixed(6)}, min ${minAmountOut}` };
        }

        // Calculate price impact
        const priceImpact = amountOut / reserveOut;

        if (priceImpact > 0.1) {  // > 10% price impact
            return { success: false, error: `Price impact too high: ${(priceImpact * 100).toFixed(2)}%` };
        }

        // Execute swap
        if (isAtoB) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }

        // Update k (it grows slightly due to fees)
        pool.k = pool.reserveA * pool.reserveB;

        // Track fees
        const feeAmount = amountIn * this.feeRate;
        const protocolFeeAmount = amountIn * this.protocolFee;
        pool.feesEarned += feeAmount;
        this.stats.feesCollected += protocolFeeAmount;

        // Update stats
        pool.totalSwaps++;
        pool.totalVolume += amountIn * (this.oraclePrices[tokenIn] || 1);
        this.stats.totalSwaps++;
        this.stats.totalVolume += amountIn * (this.oraclePrices[tokenIn] || 1);

        // Calculate execution price
        const executionPrice = amountIn / amountOut;

        this.saveState();

        console.log(`[OBELISK-AMM] SWAP: ${amountIn.toFixed(6)} ${tokenIn} → ${amountOut.toFixed(6)} ${tokenOut} @ ${executionPrice.toFixed(6)}`);

        return {
            success: true,
            order: {
                id: `OBE_SWAP_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                tokenIn,
                tokenOut,
                amountIn,
                amountOut,
                executionPrice,
                priceImpact: priceImpact * 100,
                fee: feeAmount,
                status: 'filled',
                filledAt: Date.now()
            },
            route: 'OBELISK_AMM',
            simulated: false  // REAL execution within Obelisk
        };
    }

    // Quote - get expected output without executing
    getQuote(tokenIn, tokenOut, amountIn) {
        const pairId = this.getPairId(tokenIn, tokenOut);
        const pool = this.pools.get(pairId);

        if (!pool) {
            return { error: `No pool for ${tokenIn}/${tokenOut}` };
        }

        const isAtoB = pool.tokenA === tokenIn;
        const reserveIn = isAtoB ? pool.reserveA : pool.reserveB;
        const reserveOut = isAtoB ? pool.reserveB : pool.reserveA;

        const amountInWithFee = amountIn * (1 - this.feeRate);
        const amountOut = reserveOut - (pool.k / (reserveIn + amountInWithFee));
        const priceImpact = amountOut / reserveOut;
        const executionPrice = amountIn / amountOut;

        // Compare with oracle price
        const oraclePrice = this.oraclePrices[tokenIn] && this.oraclePrices[tokenOut]
            ? this.oraclePrices[tokenIn] / this.oraclePrices[tokenOut]
            : null;

        return {
            amountIn,
            amountOut,
            executionPrice,
            priceImpact: priceImpact * 100,
            fee: amountIn * this.feeRate,
            oraclePrice,
            slippageFromOracle: oraclePrice ? ((executionPrice - oraclePrice) / oraclePrice * 100) : null
        };
    }

    // Get pool info
    getPool(tokenA, tokenB) {
        const pairId = this.getPairId(tokenA, tokenB);
        const pool = this.pools.get(pairId);

        if (!pool) return null;

        const priceAinB = pool.reserveB / pool.reserveA;
        const priceBinA = pool.reserveA / pool.reserveB;

        return {
            pair: pairId,
            tokenA: pool.tokenA,
            tokenB: pool.tokenB,
            reserveA_simule: pool.reserveA,
            reserveB_simule: pool.reserveB,
            priceAinB,
            priceBinA,
            tvlSimule: this.calculatePoolTVL(pool),
            type: 'PAPER_POOL',
            lpTokens: pool.lpTokens,
            totalSwaps: pool.totalSwaps,
            feesEarned_simule: pool.feesEarned,
            apy_simule: this.calculateAPY(pool)
        };
    }

    // Get all pools
    getAllPools() {
        const pools = [];
        this.pools.forEach((pool, pairId) => {
            pools.push(this.getPool(pool.tokenA, pool.tokenB));
        });
        return pools.sort((a, b) => b.tvl - a.tvl);
    }

    // Calculate TVL
    calculateTVL() {
        let tvl = 0;
        this.pools.forEach(pool => {
            tvl += this.calculatePoolTVL(pool);
        });
        this.stats.tvl = tvl;
        return tvl;
    }

    calculatePoolTVL(pool) {
        const priceA = this.oraclePrices[pool.tokenA] || 1;
        const priceB = this.oraclePrices[pool.tokenB] || 1;
        return (pool.reserveA * priceA) + (pool.reserveB * priceB);
    }

    calculateAPY(pool) {
        // Estimate APY from fees
        const poolAge = (Date.now() - pool.createdAt) / (24 * 60 * 60 * 1000); // Days
        if (poolAge < 1) return 0;

        const tvl = this.calculatePoolTVL(pool);
        const dailyFees = pool.feesEarned / poolAge;
        const yearlyFees = dailyFees * 365;

        return tvl > 0 ? (yearlyFees / tvl * 100) : 0;
    }

    // Sync oracle prices from Binance
    async syncOraclePrices() {
        try {
            const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ARBUSDT', 'LINKUSDT', 'DOGEUSDT', 'XRPUSDT', 'ADAUSDT', 'AVAXUSDT', 'OPUSDT',
                             'PAXGUSDT', 'XAUTUSDT', 'DAIUSDT', 'USDEUSDT', 'FRAXUSDT'];  // V3.3: RWA gold + stables
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbols)}`);
            const data = await res.json();

            data.forEach(t => {
                const coin = t.symbol.replace('USDT', '');
                this.oraclePrices[coin] = parseFloat(t.price);
            });

            this.oraclePrices['USDC'] = 1;
            this.oraclePrices['USDT'] = 1;
            this.oraclePrices['DAI']  = 1;
            this.oraclePrices['FDUSD'] = 1;
        } catch (e) {
            console.log('[OBELISK-AMM] Oracle sync error:', e.message);
        }
    }

    // Helper to get consistent pair ID
    getPairId(tokenA, tokenB) {
        // Always put the "base" token first for consistency
        const bases = ['BTC', 'ETH', 'SOL', 'PAXG', 'XAUT'];
        if (bases.includes(tokenB) && !bases.includes(tokenA)) {
            return `${tokenB}/${tokenA}`;
        }
        if (tokenB === 'USDC' || tokenB === 'USDT') {
            return `${tokenA}/${tokenB}`;
        }
        return [tokenA, tokenB].sort().join('/');
    }

    // Get stats
    getStats() {
        return {
            ...this.stats,
            tvlSimule: this.calculateTVL(),  // Clarifier que c'est simulé
            tvlLabel: 'TVL SIMULÉ (liquidité virtuelle)',
            pools: this.pools.size,
            type: 'PAPER_TRADING',
            oraclePrices: this.oraclePrices
        };
    }

    // Persistence
    loadState() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
                if (data.pools) {
                    this.pools = new Map(data.pools);
                }
                this.stats = data.stats || this.stats;
            }
        } catch (e) {
            console.log('[OBELISK-AMM] Could not load state');
        }
    }

    saveState() {
        try {
            const dir = path.dirname(this.dataFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(this.dataFile, JSON.stringify({
                pools: Array.from(this.pools.entries()),
                stats: this.stats,
                savedAt: new Date().toISOString()
            }, null, 2));
        } catch (e) {
            // Silent fail
        }
    }
}

module.exports = { ObeliskAMM };
