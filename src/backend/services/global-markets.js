/**
 * GLOBAL MARKETS — Stock/ETF/Commodity Price Feed
 * Uses Yahoo Finance unofficial API (no key needed) + fallback cache
 *
 * Supports: Korean stocks (KRX), US stocks, ETFs, commodities
 * Update interval: 30s during market hours
 */

const https = require('https');

// ── Yahoo Finance v8 chart API (no auth needed) ───────────────────────────────
function yahooQuoteV8(symbol) {
    return new Promise((resolve) => {
        const opts = {
            hostname: 'query1.finance.yahoo.com',
            path:     `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`,
            headers:  { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': '*/*' },
            timeout:  8000,
        };
        let d = '';
        const req = https.get(opts, res => {
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const j    = JSON.parse(d);
                    const meta = j.chart?.result?.[0]?.meta;
                    if (!meta || !meta.regularMarketPrice) { resolve(null); return; }
                    const closes = j.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
                    const prev   = closes.filter(Boolean).slice(-2)[0] || meta.regularMarketPrice;
                    const chgPct = prev ? ((meta.regularMarketPrice - prev) / prev) * 100 : 0;
                    resolve({
                        symbol,
                        price:     meta.regularMarketPrice,
                        change24h: chgPct,
                        volume:    meta.regularMarketVolume || 0,
                        marketCap: meta.marketCap || 0,
                        high:      meta.regularMarketDayHigh || meta.regularMarketPrice,
                        low:       meta.regularMarketDayLow  || meta.regularMarketPrice,
                        open:      meta.regularMarketOpen    || meta.regularMarketPrice,
                        currency:  meta.currency || 'USD',
                        exchange:  meta.exchangeName || '',
                    });
                } catch { resolve(null); }
            });
        });
        req.on('error',   () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

// Batch fetch (parallel with concurrency limit)
async function yahooQuote(symbols) {
    const syms    = Array.isArray(symbols) ? symbols : [symbols];
    const CONCUR  = 5; // max parallel requests
    const results = [];
    for (let i = 0; i < syms.length; i += CONCUR) {
        const chunk = syms.slice(i, i + CONCUR);
        const batch = await Promise.all(chunk.map(yahooQuoteV8));
        results.push(...batch.filter(Boolean));
    }
    return results;
}

// ── Asset Catalog ─────────────────────────────────────────────────────────────

const ASSETS = {
    // ── Korean Stocks (KRX) ───────────────────────────────────────────────
    KR: {
        name: 'South Korea',
        flag: '🇰🇷',
        assets: [
            { symbol: '005930.KS', name: 'Samsung Electronics',  sector: 'Tech',     color: '#1428A0' },
            { symbol: '000660.KS', name: 'SK Hynix',             sector: 'Chips',    color: '#EC2B28' },
            { symbol: '035420.KS', name: 'NAVER',                sector: 'Internet', color: '#03C75A' },
            { symbol: '005380.KS', name: 'Hyundai Motor',        sector: 'Auto',     color: '#002C5F' },
            { symbol: '035720.KS', name: 'Kakao',                sector: 'Tech',     color: '#FAE100' },
            { symbol: '373220.KS', name: 'LG Energy Solution',   sector: 'Battery',  color: '#A50034' },
            { symbol: '066570.KS', name: 'LG Electronics',       sector: 'Consumer', color: '#A50034' },
            { symbol: '207940.KS', name: 'Samsung Biologics',    sector: 'Pharma',   color: '#0072CE' },
            { symbol: '051910.KS', name: 'LG Chem',              sector: 'Chemical', color: '#A50034' },
            { symbol: '006400.KS', name: 'Samsung SDI',          sector: 'Battery',  color: '#1428A0' },
        ],
    },

    // ── US Tech (Cheapest to trade synthetically) ─────────────────────────
    US_TECH: {
        name: 'US Tech',
        flag: '🇺🇸',
        assets: [
            { symbol: 'NVDA',  name: 'NVIDIA',      sector: 'Chips',   color: '#76b900' },
            { symbol: 'AAPL',  name: 'Apple',        sector: 'Tech',    color: '#555' },
            { symbol: 'MSFT',  name: 'Microsoft',    sector: 'Tech',    color: '#0078d4' },
            { symbol: 'AMZN',  name: 'Amazon',       sector: 'E-Com',   color: '#ff9900' },
            { symbol: 'GOOGL', name: 'Alphabet',     sector: 'Tech',    color: '#4285f4' },
            { symbol: 'META',  name: 'Meta',         sector: 'Social',  color: '#0082fb' },
            { symbol: 'TSM',   name: 'TSMC',         sector: 'Chips',   color: '#c80000' },
            { symbol: 'TSLA',  name: 'Tesla',        sector: 'Auto',    color: '#cc0000' },
        ],
    },

    // ── ETFs (Cheapest to hold synthetically) ─────────────────────────────
    ETF: {
        name: 'ETFs',
        flag: '📊',
        assets: [
            { symbol: 'SPY',  name: 'S&P 500 ETF',       sector: 'Index',  color: '#0052cc' },
            { symbol: 'QQQ',  name: 'Nasdaq 100 ETF',    sector: 'Index',  color: '#00a3cc' },
            { symbol: 'VT',   name: 'World ETF',         sector: 'Index',  color: '#007755' },
            { symbol: 'GLD',  name: 'Gold ETF',          sector: 'Metals', color: '#ffd700' },
            { symbol: 'SLV',  name: 'Silver ETF',        sector: 'Metals', color: '#c0c0c0' },
            { symbol: 'EEM',  name: 'Emerging Markets',  sector: 'Index',  color: '#ff6600' },
            { symbol: 'EWY',  name: 'Korea ETF (EWY)',   sector: 'Korea',  color: '#1428A0' },
            { symbol: 'KWEB', name: 'China Internet',    sector: 'China',  color: '#ff0000' },
        ],
    },

    // ── Commodities ───────────────────────────────────────────────────────
    COMMODITIES: {
        name: 'Commodities',
        flag: '🛢️',
        assets: [
            { symbol: 'GC=F',  name: 'Gold Futures',     sector: 'Metals',   color: '#ffd700' },
            { symbol: 'SI=F',  name: 'Silver Futures',   sector: 'Metals',   color: '#c0c0c0' },
            { symbol: 'CL=F',  name: 'Oil WTI',          sector: 'Energy',   color: '#333' },
            { symbol: 'NG=F',  name: 'Natural Gas',      sector: 'Energy',   color: '#0066cc' },
            { symbol: 'HG=F',  name: 'Copper',           sector: 'Metals',   color: '#b87333' },
        ],
    },

    // ── Japanese Stocks ───────────────────────────────────────────────────
    JP: {
        name: 'Japan',
        flag: '🇯🇵',
        assets: [
            { symbol: '7203.T',  name: 'Toyota Motor',    sector: 'Auto',   color: '#EB0A1E' },
            { symbol: '6758.T',  name: 'Sony Group',      sector: 'Tech',   color: '#000' },
            { symbol: '9984.T',  name: 'SoftBank Group',  sector: 'VC',     color: '#ff0000' },
            { symbol: '6861.T',  name: 'Keyence',         sector: 'Sensors',color: '#003087' },
            { symbol: '7974.T',  name: 'Nintendo',        sector: 'Gaming', color: '#E60012' },
        ],
    },

    // ── European Stocks ───────────────────────────────────────────────────
    EU: {
        name: 'Europe',
        flag: '🇪🇺',
        assets: [
            { symbol: 'ASML',   name: 'ASML',           sector: 'Chips',  color: '#00a9e0' },
            { symbol: 'LVMHF',  name: 'LVMH',           sector: 'Luxury', color: '#c8a96e' },
            { symbol: 'SAP',    name: 'SAP',            sector: 'SaaS',   color: '#0070f2' },
            { symbol: 'NVO',    name: 'Novo Nordisk',   sector: 'Pharma', color: '#005ad2' },
            { symbol: 'SHEL',   name: 'Shell',          sector: 'Energy', color: '#e41e0a' },
        ],
    },
};

// ── Price Cache ───────────────────────────────────────────────────────────────

const CACHE = {
    prices: {},     // symbol → { price, change24h, volume, marketCap, ts }
    lastFetch: 0,
    TTL_MS: 30000,  // 30s cache
};

async function refreshPrices(category = null) {
    const now = Date.now();
    if (now - CACHE.lastFetch < CACHE.TTL_MS && !category) return;

    const cats = category ? [ASSETS[category]].filter(Boolean) : Object.values(ASSETS);
    const allSymbols = cats.flatMap(c => c.assets.map(a => a.symbol));

    // Yahoo Finance limit: ~100 symbols per request
    const CHUNK = 80;
    for (let i = 0; i < allSymbols.length; i += CHUNK) {
        const chunk = allSymbols.slice(i, i + CHUNK);
        const results = await yahooQuote(chunk);
        for (const q of results) {
            // v8 returns already-mapped fields: price, change24h, volume, marketCap...
            CACHE.prices[q.symbol] = {
                price:     q.price     || 0,
                change24h: q.change24h || 0,
                volume:    q.volume    || 0,
                marketCap: q.marketCap || 0,
                high:      q.high      || 0,
                low:       q.low       || 0,
                open:      q.open      || 0,
                currency:  q.currency  || 'USD',
                exchange:  q.exchange  || '',
                ts:        now,
                source:    'yahoo_v8',
            };
        }
    }

    CACHE.lastFetch = now;
    console.log(`[GlobalMarkets] Refreshed ${Object.keys(CACHE.prices).length} prices`);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get all assets for a category with live prices
 * @param {string} category - key of ASSETS (e.g. 'KR', 'US_TECH', 'ETF', etc.)
 * @param {boolean} forceRefresh
 */
async function getCategory(category, forceRefresh = false) {
    if (forceRefresh) CACHE.lastFetch = 0;
    await refreshPrices(category);

    const cat = ASSETS[category];
    if (!cat) return null;

    return {
        name:   cat.name,
        flag:   cat.flag,
        assets: cat.assets.map(a => {
            const p = CACHE.prices[a.symbol] || {};
            return {
                ...a,
                price:     p.price    || 0,
                change24h: p.change24h || 0,
                volume:    p.volume   || 0,
                marketCap: p.marketCap || 0,
                high:      p.high     || 0,
                low:       p.low      || 0,
                stale:     !p.ts || (Date.now() - p.ts > 120000),
            };
        }),
    };
}

/**
 * Get all categories
 */
async function getAll(forceRefresh = false) {
    if (forceRefresh) CACHE.lastFetch = 0;
    await refreshPrices();
    return Object.fromEntries(
        Object.entries(ASSETS).map(([key, cat]) => [
            key,
            {
                name:   cat.name,
                flag:   cat.flag,
                assets: cat.assets.map(a => {
                    const p = CACHE.prices[a.symbol] || {};
                    return {
                        ...a,
                        price:     p.price    || 0,
                        change24h: p.change24h || 0,
                        stale:     !p.ts || (Date.now() - p.ts > 120000),
                    };
                }),
            },
        ])
    );
}

/**
 * Get single symbol price
 */
async function getPrice(symbol) {
    if (!CACHE.prices[symbol] || Date.now() - (CACHE.prices[symbol]?.ts || 0) > CACHE.TTL_MS) {
        const results = await yahooQuote(symbol);
        if (results[0]) {
            const q = results[0];
            CACHE.prices[symbol] = {
                price:    q.regularMarketPrice || 0,
                change24h: q.regularMarketChangePercent || 0,
                volume:   q.regularMarketVolume || 0,
                marketCap: q.marketCap || 0,
                ts:       Date.now(),
            };
        }
    }
    return CACHE.prices[symbol] || null;
}

module.exports = { getCategory, getAll, getPrice, ASSETS, CACHE };
