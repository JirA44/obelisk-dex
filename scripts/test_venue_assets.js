const gm = require('../src/backend/services/global-markets');

async function main() {
    // Test single price fetch
    const nvda = await gm.getPrice('NVDA');
    console.log('NVDA:', nvda);

    const samsung = await gm.getPrice('005930.KS');
    console.log('Samsung:', samsung);

    // Test venue catalog route
    const r = require('../src/backend/routes/venue-assets');
    console.log('venue-assets route loaded OK');

    // Quick catalog summary (no prices)
    const { VENUES } = require('../src/backend/routes/venue-assets') || {};
    console.log('\n=== Venue Summary ===');
    // Load inline
    const venues = {
        OBELISK_PERPS: { stocks: 35, crypto: 27, etfs: 6, commodities: 3, indices: 4 },
        APEX:          { crypto: 26, stocks: 0 },
        SONIC_APEX:    { crypto: 8, stocks: 0 },
        ASTERDEX:      { crypto: 16, stocks: 0 },
        DRIFT:         { crypto: 17, stocks: 0 },
        MUX:           { crypto: 9, stocks: 0 },
        AERODROME:     { crypto: 8, stocks: 0 },
        LIGHTER:       { crypto: 5, stocks: 0 },
    };
    Object.entries(venues).forEach(([k, v]) => {
        const total = Object.values(v).reduce((a, b) => a + b, 0);
        console.log(`  ${k.padEnd(20)} total: ${total} assets`);
    });
}

main().catch(console.error);
