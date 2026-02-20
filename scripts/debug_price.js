const https = require('https');

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
                    if (!meta || !meta.regularMarketPrice) {
                        console.log(`[${symbol}] No meta. Status: ${res.statusCode}`);
                        resolve(null); return;
                    }
                    console.log(`[${symbol}] Price: ${meta.regularMarketPrice}, Currency: ${meta.currency}`);
                    resolve({ symbol, price: meta.regularMarketPrice });
                } catch(e) {
                    console.log(`[${symbol}] Parse error: ${e.message}`);
                    resolve(null);
                }
            });
        });
        req.on('error',   (e) => { console.log(`[${symbol}] Error: ${e.message}`); resolve(null); });
        req.on('timeout', ()  => { req.destroy(); console.log(`[${symbol}] Timeout`); resolve(null); });
    });
}

async function main() {
    await yahooQuoteV8('NVDA');
    await yahooQuoteV8('005930.KS');
    await yahooQuoteV8('SPY');
}

main();
