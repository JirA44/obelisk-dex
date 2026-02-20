/**
 * OBELISK — Venue Assets Catalog
 * Lists all tradeable/investable assets per venue with live prices
 *
 * GET /api/venues/assets          → all venues + their assets
 * GET /api/venues/assets/:venue   → single venue assets
 * GET /api/venues/summary         → venue summary (no prices)
 */

const express = require('express');
const router  = express.Router();
const gm      = require('../services/global-markets');

// ── Venue Definitions ─────────────────────────────────────────────────────────

const VENUES = {
    // ── Obelisk Perps (internal pool $100K) ──────────────────────────────
    OBELISK_PERPS: {
        name: 'Obelisk Perps',
        type: 'perps',
        chain: 'Internal / Sonic settlement',
        fees: '0%',
        leverage: '1–50x',
        minSize: '$3',
        status: 'live',
        url: 'http://localhost:3001',
        description: 'Internal perpetuals engine with $100K USDC pool. Settles on Sonic ($0.0002/tx).',
        crypto: [
            'BTC','ETH','SOL','ARB','LINK','DOGE','XRP','ADA','AVAX','OP',
            'AAVE','CRV','UNI','MKR','LDO','MATIC','SUI','APT','NEAR',
            'TIA','INJ','WIF','PEPE','BONK','RENDER','SAND','ENJ'
        ],
        stocks: [
            '005930.KS','000660.KS','035420.KS','005380.KS','035720.KS', // Korea
            'BABA','PDD','NIO','BIDU','JD',                              // China
            'NVDA','AAPL','MSFT','AMZN','META','TSLA','TSM',            // US Tech
            'JPM','V','MA','GS',                                          // US Finance
            'LLY','JNJ','PFE',                                           // Pharma
            'INFY','HDB','IBN',                                          // India
            'PBR','VALE','ITUB',                                         // Brazil
            'ASML','SAP','NVO','TTE',                                    // EU
            'XOM','CVX','RIO','BHP',                                     // Energy
        ],
        etfs: ['SPY','QQQ','GLD','SLV','EEM','EWY'],
        commodities: ['GC=F','SI=F','CL=F'],
        indices: ['^GSPC','^IXIC','^N225','^KS11'],
    },

    // ── APEX Omni (0% maker) ─────────────────────────────────────────────
    APEX: {
        name: 'APEX Protocol',
        type: 'perps',
        chain: 'StarkEx (APEX chain)',
        fees: '0% maker / 0.05% taker',
        leverage: '1–100x',
        minSize: '$3',
        status: 'live',
        url: 'https://omni.apex.exchange',
        description: '0% maker fees. Best for HFT and high-frequency strategies.',
        crypto: [
            'BTC','ETH','SOL','ARB','DOGE','LINK','XRP','AVAX','APT','SUI',
            'NEAR','OP','MATIC','ATOM','INJ','SEI','TIA','LTC','WLD','FET',
            'PEPE','WIF','BONK','RNDR',
        ],
        stocks: [], etfs: [], commodities: [], indices: [],
    },

    // ── Sonic APEX (0% maker, Sonic chain) ───────────────────────────────
    SONIC_APEX: {
        name: 'APEX Sonic',
        type: 'perps',
        chain: 'Sonic',
        fees: '0% maker / 0.03% taker',
        leverage: '1–100x',
        minSize: '$3',
        status: 'live',
        url: 'https://sonic.apex.exchange',
        description: 'APEX on Sonic chain — ultra-fast settlement ($0.0002/tx).',
        crypto: ['BTC','ETH','SOL','ARB','AVAX','LINK','DOGE','XRP'],
        stocks: [], etfs: [], commodities: [], indices: [],
    },

    // ── AsterDEX (Binance-compatible, 35 pairs) ───────────────────────────
    ASTERDEX: {
        name: 'AsterDEX',
        type: 'perps',
        chain: 'Blast L2',
        fees: '0.01% maker / 0.035% taker',
        leverage: '1–50x',
        minSize: '$3',
        status: 'live',
        url: 'https://asterdex.com',
        description: 'Binance-compatible API. 35 pairs, good liquidity.',
        crypto: [
            // Majors
            'BTC','ETH','SOL','BNB',
            // L1s
            'AVAX','ATOM','NEAR','APT','SUI','SEI','INJ','TIA',
            // L2s
            'ARB','OP','MATIC','STX',
            // DeFi
            'LINK','UNI','AAVE','MKR','LDO','CRV','SNX',
            // Meme
            'DOGE','SHIB','PEPE','WIF','BONK',
            // Legacy
            'XRP','LTC','BCH','ETC',
            // AI
            'WLD','FET','RNDR',
        ],
        stocks: [], etfs: [], commodities: [], indices: [],
    },

    // ── Morpher (0% fees, synthetic) ──────────────────────────────────────
    MORPHER: {
        name: 'Morpher',
        type: 'synthetic',
        chain: 'Base L2 (bundler)',
        fees: '0%',
        leverage: '1–10x',
        minSize: '$1',
        status: 'errors',
        url: 'https://www.morpher.com',
        description: '0% fees synthetic trading. Stocks, forex, crypto, commodities & indices.',
        crypto: [
            'BTC','ETH','SOL','AVAX','ATOM','NEAR','APT','SUI','INJ','LINK',
            'DOGE','ARB','OP','MATIC','UNI','AAVE','XRP','LTC','PEPE','SHIB','TIA',
        ],
        stocks: ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','META','AMD','NFLX','COIN'],
        etfs: [],
        commodities: ['GOLD','SILVER','OIL','BRENT','COPPER','GAS'],
        indices: ['SPX','NDX','DJI','DAX','CAC40','FTSE100','NIKKEI','HSI'],
        notes: 'Bundler eth_estimateUserOperationGas errors — fix pending',
    },

    // ── Solana / Drift ────────────────────────────────────────────────────
    DRIFT: {
        name: 'Drift Protocol (Solana)',
        type: 'perps',
        chain: 'Solana',
        fees: '0.02–0.05%',
        leverage: '1–20x',
        minSize: '$1',
        status: 'live',
        url: 'https://app.drift.trade',
        description: 'Solana-native perps. Fast, cheap ($0.00025/tx).',
        crypto: ['BTC','ETH','SOL','ARB','DOGE','SUI'],
        stocks: [], etfs: [], commodities: [], indices: [],
    },

    // ── MUX Protocol (Arbitrum) ───────────────────────────────────────────
    MUX: {
        name: 'MUX Protocol',
        type: 'perps',
        chain: 'Arbitrum',
        fees: '0.06%',
        leverage: '1–25x',
        minSize: '$5',
        status: 'active',
        url: 'https://mux.network',
        description: 'Aggregated liquidity across GMX/APEX. Auto-routing best price.',
        crypto: ['BTC','ETH','SOL','ARB','AVAX','BNB','LINK','UNI','OP'],
        stocks: [], etfs: [], commodities: [], indices: [],
    },

    // ── Aerodrome (Base) — LP / DeFi ─────────────────────────────────────
    AERODROME: {
        name: 'Aerodrome Finance',
        type: 'lp',
        chain: 'Base',
        fees: '0%–0.3% LP spread',
        leverage: '1x',
        minSize: '$0.50',
        status: 'live',
        url: 'https://aerodrome.finance',
        description: 'Liquidity provision on Base. Earn AERO rewards + trading fees.',
        crypto: ['ETH','USDC','AERO','cbBTC','cbETH','DEGEN','BRETT','VIRTUAL'],
        stocks: [], etfs: [], commodities: [], indices: [],
        notes: 'Bridge ETH from Arbitrum. 1-click invest via /api/aerodrome/invest/1click',
    },

    // ── Lighter.xyz (0% maker CLOB) ───────────────────────────────────────
    LIGHTER: {
        name: 'Lighter.xyz',
        type: 'clob',
        chain: 'Arbitrum',
        fees: '0% maker / 0.02% taker',
        leverage: '1–20x',
        minSize: '$3',
        status: 'sig_err',
        url: 'https://lighter.xyz',
        description: 'CLOB with 0% maker fees. 20 perp pairs on Arbitrum.',
        crypto: [
            'ETH','BTC','SOL','DOGE','WIF','WLD','XRP','LINK','AVAX','NEAR',
            'DOT','SUI','POL','APT','SEI','LTC','ARB','OP','TIA',
        ],
        stocks: [], etfs: [], commodities: [], indices: [],
        notes: 'SIG ERR — regen API key at lighter.xyz portal',
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function enrichWithPrices(assets) {
    if (!assets || assets.length === 0) return [];
    const results = [];
    // Batch fetch (max 5 concurrent, from cache if available)
    const CONCUR = 8;
    for (let i = 0; i < assets.length; i += CONCUR) {
        const chunk = assets.slice(i, i + CONCUR);
        const prices = await Promise.all(chunk.map(sym => gm.getPrice(sym).catch(() => null)));
        chunk.forEach((sym, j) => {
            const p = prices[j];
            results.push({
                symbol:    sym,
                price:     p?.price     || 0,
                change24h: p?.change24h || 0,
                currency:  p?.currency  || 'USD',
                stale:     !p,
            });
        });
    }
    return results;
}

function buildVenueSummary(key, venue) {
    const totalAssets = venue.crypto.length + venue.stocks.length + venue.etfs.length +
                        venue.commodities.length + venue.indices.length;
    return {
        id:          key,
        name:        venue.name,
        type:        venue.type,
        chain:       venue.chain,
        fees:        venue.fees,
        leverage:    venue.leverage,
        minSize:     venue.minSize,
        status:      venue.status,
        description: venue.description,
        url:         venue.url,
        notes:       venue.notes || null,
        assetCount: {
            crypto:      venue.crypto.length,
            stocks:      venue.stocks.length,
            etfs:        venue.etfs.length,
            commodities: venue.commodities.length,
            indices:     venue.indices.length,
            total:       totalAssets,
        },
    };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/venues/summary — fast, no prices
router.get('/summary', (req, res) => {
    const summary = Object.entries(VENUES).map(([k, v]) => buildVenueSummary(k, v));
    res.json({ success: true, venues: summary });
});

// GET /api/venues/assets/:venue — single venue with optional prices
router.get('/assets/:venue', async (req, res) => {
    const key   = req.params.venue.toUpperCase();
    const venue = VENUES[key];
    if (!venue) {
        const keys = Object.keys(VENUES).join(', ');
        return res.status(404).json({ success: false, error: `Venue '${key}' not found. Use: ${keys}` });
    }

    const withPrices = req.query.prices !== 'false';
    const summary    = buildVenueSummary(key, venue);

    if (!withPrices) {
        return res.json({ success: true, ...summary, assets: {
            crypto: venue.crypto, stocks: venue.stocks,
            etfs: venue.etfs, commodities: venue.commodities, indices: venue.indices,
        }});
    }

    // Enrich Obelisk Perps + ETF with live prices (others: only crypto from cache)
    const [cryptoPrices, stockPrices, etfPrices] = await Promise.all([
        key === 'OBELISK_PERPS' ? enrichWithPrices(venue.crypto.slice(0, 10)) : Promise.resolve(venue.crypto.map(s => ({ symbol: s }))),
        enrichWithPrices(venue.stocks.slice(0, 15)),
        enrichWithPrices(venue.etfs),
    ]);

    res.json({
        success: true,
        ...summary,
        assets: {
            crypto:      cryptoPrices,
            stocks:      stockPrices,
            etfs:        etfPrices,
            commodities: venue.commodities.map(s => ({ symbol: s })),
            indices:     venue.indices.map(s => ({ symbol: s })),
        },
    });
});

// GET /api/venues/assets — all venues summary + Obelisk Perps full asset list
router.get('/assets', async (req, res) => {
    const summary = Object.entries(VENUES).map(([k, v]) => buildVenueSummary(k, v));

    // For Obelisk Perps, include top assets with prices
    const topStocks = VENUES.OBELISK_PERPS.stocks.slice(0, 20);
    const stockPrices = await enrichWithPrices(topStocks).catch(() => topStocks.map(s => ({ symbol: s })));

    res.json({
        success: true,
        venues: summary,
        highlight: {
            venue: 'OBELISK_PERPS',
            description: 'Obelisk Perps supports the most asset classes including global stocks',
            topStocks: stockPrices,
        },
    });
});

module.exports = router;
