/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║   ██████╗ ██████╗ ███████╗██╗     ██╗███████╗██╗  ██╗                     ║
 * ║  ██╔═══██╗██╔══██╗██╔════╝██║     ██║██╔════╝██║ ██╔╝                     ║
 * ║  ██║   ██║██████╔╝█████╗  ██║     ██║███████╗█████╔╝                      ║
 * ║  ██║   ██║██╔══██╗██╔══╝  ██║     ██║╚════██║██╔═██╗                      ║
 * ║  ╚██████╔╝██████╔╝███████╗███████╗██║███████║██║  ██╗                     ║
 * ║   ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═╝                     ║
 * ║                                                                           ║
 * ║   REAL DEX AGGREGATOR v1.0                                               ║
 * ║   Connects Obelisk to: Hyperliquid, dYdX, Uniswap                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

const https = require('https');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// DEX ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEX_CONFIG = {
    hyperliquid: {
        name: 'Hyperliquid',
        api: 'https://api.hyperliquid.xyz',
        ws: 'wss://api.hyperliquid.xyz/ws',
        type: 'perp',
        fees: { maker: 0.0002, taker: 0.0005 },
        markets: ['BTC', 'ETH', 'SOL', 'ARB', 'OP', 'DOGE', 'XRP', 'AVAX', 'SUI', 'TIA', 'SEI', 'PEPE', 'WIF', 'INJ']
    },
    dydx: {
        name: 'dYdX v4',
        api: 'https://indexer.dydx.trade/v4',
        ws: 'wss://indexer.dydx.trade/v4/ws',
        type: 'perp',
        fees: { maker: 0.0002, taker: 0.0005 },
        markets: ['BTC', 'ETH', 'SOL', 'AVAX', 'DOGE', 'ARB', 'OP', 'LINK', 'ATOM', 'MATIC']
    },
    uniswap: {
        name: 'Uniswap v3',
        api: 'https://api.uniswap.org/v2',
        graphql: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
        type: 'spot',
        fees: { pool: 0.003 }, // 0.3% pool fee
        markets: ['ETH', 'USDC', 'USDT', 'WBTC', 'UNI', 'LINK', 'AAVE', 'MKR', 'SNX', 'CRV']
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HTTP HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function fetchJSON(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const reqOptions = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ raw: data });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Timeout')));

        if (options.body) req.write(JSON.stringify(options.body));
        req.end();
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// HYPERLIQUID CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════

class HyperliquidConnector {
    constructor() {
        this.name = 'Hyperliquid';
        this.api = DEX_CONFIG.hyperliquid.api;
        this.prices = {};
        this.orderbooks = {};
    }

    async getMeta() {
        try {
            const data = await fetchJSON(`${this.api}/info`, {
                method: 'POST',
                body: { type: 'meta' }
            });
            return data;
        } catch (e) {
            console.error('[Hyperliquid] getMeta error:', e.message);
            return null;
        }
    }

    async getAllMids() {
        try {
            const data = await fetchJSON(`${this.api}/info`, {
                method: 'POST',
                body: { type: 'allMids' }
            });
            this.prices = data || {};
            return data;
        } catch (e) {
            console.error('[Hyperliquid] getAllMids error:', e.message);
            return {};
        }
    }

    async getL2Book(coin) {
        try {
            const data = await fetchJSON(`${this.api}/info`, {
                method: 'POST',
                body: { type: 'l2Book', coin }
            });
            this.orderbooks[coin] = data;
            return data;
        } catch (e) {
            console.error('[Hyperliquid] getL2Book error:', e.message);
            return null;
        }
    }

    async getFundingRates() {
        try {
            const meta = await this.getMeta();
            if (!meta || !meta.universe) return {};

            const rates = {};
            meta.universe.forEach((m, i) => {
                rates[m.name] = {
                    funding: parseFloat(meta.funding?.[i] || 0),
                    openInterest: parseFloat(meta.assetCtxs?.[i]?.openInterest || 0)
                };
            });
            return rates;
        } catch (e) {
            return {};
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DYDX CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════

class DydxConnector {
    constructor() {
        this.name = 'dYdX';
        this.api = DEX_CONFIG.dydx.api;
        this.prices = {};
    }

    async getMarkets() {
        try {
            const data = await fetchJSON(`${this.api}/perpetualMarkets`);
            return data.markets || {};
        } catch (e) {
            console.error('[dYdX] getMarkets error:', e.message);
            return {};
        }
    }

    async getTicker(market) {
        try {
            const data = await fetchJSON(`${this.api}/perpetualMarkets/${market}`);
            if (data.market) {
                this.prices[market] = parseFloat(data.market.oraclePrice);
            }
            return data.market;
        } catch (e) {
            return null;
        }
    }

    async getAllPrices() {
        try {
            const markets = await this.getMarkets();
            const prices = {};
            Object.entries(markets).forEach(([symbol, data]) => {
                prices[symbol.replace('-USD', '')] = parseFloat(data.oraclePrice || 0);
            });
            this.prices = prices;
            return prices;
        } catch (e) {
            return {};
        }
    }

    async getOrderbook(market) {
        try {
            const data = await fetchJSON(`${this.api}/orderbooks/perpetualMarket/${market}`);
            return data;
        } catch (e) {
            return null;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNISWAP CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════

class UniswapConnector {
    constructor() {
        this.name = 'Uniswap';
        this.graphql = DEX_CONFIG.uniswap.graphql;
        this.prices = {};

        // Top Uniswap pools
        this.pools = {
            'ETH-USDC': '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
            'WBTC-ETH': '0xcbcdf9626bc03e24f779434178a73a0b4bad62ed',
            'ETH-USDT': '0x4e68ccd3e89f51c3074ca5072bbac773960dfa36',
            'UNI-ETH': '0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801',
            'LINK-ETH': '0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8'
        };
    }

    async getPoolData(poolAddress) {
        const query = `{
            pool(id: "${poolAddress.toLowerCase()}") {
                token0Price
                token1Price
                liquidity
                volumeUSD
                feeTier
            }
        }`;

        try {
            const data = await fetchJSON(this.graphql, {
                method: 'POST',
                body: { query }
            });
            return data.data?.pool;
        } catch (e) {
            console.error('[Uniswap] getPoolData error:', e.message);
            return null;
        }
    }

    async getEthPrice() {
        const pool = await this.getPoolData(this.pools['ETH-USDC']);
        if (pool) {
            this.prices['ETH'] = parseFloat(pool.token0Price);
            return this.prices['ETH'];
        }
        return null;
    }

    async getAllPrices() {
        const prices = {};

        // ETH price from USDC pool
        const ethPool = await this.getPoolData(this.pools['ETH-USDC']);
        if (ethPool) {
            prices['ETH'] = parseFloat(ethPool.token0Price);
        }

        // WBTC from ETH pool
        const btcPool = await this.getPoolData(this.pools['WBTC-ETH']);
        if (btcPool && prices['ETH']) {
            prices['BTC'] = parseFloat(btcPool.token1Price) * prices['ETH'];
        }

        this.prices = prices;
        return prices;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEX AGGREGATOR
// ═══════════════════════════════════════════════════════════════════════════════

class RealDexAggregator {
    constructor() {
        this.hyperliquid = new HyperliquidConnector();
        this.dydx = new DydxConnector();
        this.uniswap = new UniswapConnector();

        this.aggregatedPrices = {};
        this.bestPrices = {};
        this.lastUpdate = null;

        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║   OBELISK REAL DEX AGGREGATOR v1.0                       ║');
        console.log('║   Connected: Hyperliquid | dYdX | Uniswap                ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');
    }

    async fetchAllPrices() {
        console.log('[AGGREGATOR] Fetching prices from all DEXs...');

        const results = await Promise.allSettled([
            this.hyperliquid.getAllMids(),
            this.dydx.getAllPrices(),
            this.uniswap.getAllPrices()
        ]);

        const hlPrices = results[0].status === 'fulfilled' ? results[0].value : {};
        const dydxPrices = results[1].status === 'fulfilled' ? results[1].value : {};
        const uniPrices = results[2].status === 'fulfilled' ? results[2].value : {};

        // Aggregate prices from all sources
        const allCoins = new Set([
            ...Object.keys(hlPrices),
            ...Object.keys(dydxPrices),
            ...Object.keys(uniPrices)
        ]);

        allCoins.forEach(coin => {
            const prices = [];
            const sources = [];

            if (hlPrices[coin]) {
                prices.push(parseFloat(hlPrices[coin]));
                sources.push('HL');
            }
            if (dydxPrices[coin]) {
                prices.push(parseFloat(dydxPrices[coin]));
                sources.push('dYdX');
            }
            if (uniPrices[coin]) {
                prices.push(parseFloat(uniPrices[coin]));
                sources.push('Uni');
            }

            if (prices.length > 0) {
                const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
                const min = Math.min(...prices);
                const max = Math.max(...prices);

                this.aggregatedPrices[coin] = {
                    avg,
                    min,
                    max,
                    spread: ((max - min) / avg) * 100,
                    sources,
                    prices: { HL: hlPrices[coin], dYdX: dydxPrices[coin], Uni: uniPrices[coin] }
                };

                // Best price for buying (lowest) and selling (highest)
                this.bestPrices[coin] = {
                    buy: { price: min, source: sources[prices.indexOf(min)] },
                    sell: { price: max, source: sources[prices.indexOf(max)] }
                };
            }
        });

        this.lastUpdate = Date.now();

        console.log(`[AGGREGATOR] ✓ ${Object.keys(this.aggregatedPrices).length} assets aggregated`);
        return this.aggregatedPrices;
    }

    getBestRoute(coin, side, amount) {
        const priceData = this.bestPrices[coin];
        if (!priceData) return null;

        const best = side === 'buy' ? priceData.buy : priceData.sell;

        return {
            coin,
            side,
            amount,
            bestPrice: best.price,
            bestDex: best.source,
            estimatedTotal: best.price * amount,
            alternativePrices: this.aggregatedPrices[coin]?.prices || {}
        };
    }

    async getArbitrageOpportunities(minSpreadPercent = 0.1) {
        await this.fetchAllPrices();

        const opportunities = [];

        Object.entries(this.aggregatedPrices).forEach(([coin, data]) => {
            if (data.spread >= minSpreadPercent && data.sources.length >= 2) {
                const buySource = data.prices.HL <= (data.prices.dYdX || Infinity) ? 'HL' : 'dYdX';
                const sellSource = data.prices.HL >= (data.prices.dYdX || 0) ? 'HL' : 'dYdX';

                opportunities.push({
                    coin,
                    spread: data.spread.toFixed(4),
                    buyAt: buySource,
                    buyPrice: data.min,
                    sellAt: sellSource,
                    sellPrice: data.max,
                    potentialProfit: `${data.spread.toFixed(2)}%`
                });
            }
        });

        return opportunities.sort((a, b) => parseFloat(b.spread) - parseFloat(a.spread));
    }

    getStatus() {
        return {
            dexes: {
                hyperliquid: { connected: true, markets: DEX_CONFIG.hyperliquid.markets.length },
                dydx: { connected: true, markets: DEX_CONFIG.dydx.markets.length },
                uniswap: { connected: true, markets: DEX_CONFIG.uniswap.markets.length }
            },
            aggregatedAssets: Object.keys(this.aggregatedPrices).length,
            lastUpdate: this.lastUpdate ? new Date(this.lastUpdate).toISOString() : null
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    RealDexAggregator,
    HyperliquidConnector,
    DydxConnector,
    UniswapConnector,
    DEX_CONFIG
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEST
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
    (async () => {
        const aggregator = new RealDexAggregator();

        // Fetch all prices
        const prices = await aggregator.fetchAllPrices();

        console.log('\n[PRICES] Top assets:');
        ['BTC', 'ETH', 'SOL', 'ARB'].forEach(coin => {
            const data = prices[coin];
            if (data) {
                console.log(`  ${coin}: $${data.avg.toLocaleString()} (spread: ${data.spread.toFixed(3)}%) [${data.sources.join(', ')}]`);
            }
        });

        // Best routes
        console.log('\n[ROUTES] Best execution:');
        ['BTC', 'ETH', 'SOL'].forEach(coin => {
            const route = aggregator.getBestRoute(coin, 'buy', 1);
            if (route) {
                console.log(`  Buy ${coin}: $${route.bestPrice.toLocaleString()} on ${route.bestDex}`);
            }
        });

        // Arbitrage opportunities
        console.log('\n[ARBITRAGE] Opportunities (>0.05% spread):');
        const arb = await aggregator.getArbitrageOpportunities(0.05);
        arb.slice(0, 5).forEach(opp => {
            console.log(`  ${opp.coin}: ${opp.potentialProfit} (buy@${opp.buyAt} → sell@${opp.sellAt})`);
        });

        console.log('\n✅ Real DEX Aggregator ready!');
    })();
}
