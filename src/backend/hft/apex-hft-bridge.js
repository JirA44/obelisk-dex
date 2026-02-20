/**
 * APEX HFT BRIDGE
 * Wraps ApexConnector (mixbot) for use by SonicHFTEngine
 *
 * Pair mapping:  'BTC/USDC' → 'BTCUSDT'
 * Leverage:      1x (HFT rule: toujours 1x)
 * Venue:         APEX Omni (omni.apex.exchange) — 0% maker
 */

const path = require('path');
// Absolute path — mixbot adjacent to obelisk under C:\Users\Hugop
const APEX_CONNECTOR_PATH = path.join('C:', 'Users', 'Hugop', 'mixbot', 'connectors', 'apex_connector');
const { ApexConnector } = require(APEX_CONNECTOR_PATH);

// Pair map: Obelisk format → APEX format
const PAIR_MAP = {
    'BTC/USDC': 'BTCUSDT',
    'ETH/USDC': 'ETHUSDT',
    'SOL/USDC': 'SOLUSDT',
};

class ApexHFTBridge {
    constructor() {
        this.connector = new ApexConnector({
            apiKey:      process.env.APEX_API_KEY,
            apiSecret:   process.env.APEX_API_SECRET,
            passphrase:  process.env.APEX_PASSPHRASE,
            accountId:   process.env.APEX_ACCOUNT_ID,
            omnikey:     process.env.APEX_OMNIKEY,
            maxTradeSize:  5,
            maxExposure:   25,   // 5 pairs × $5
            maxPositions:  5,
        });
        this.ready = false;
        this._initPromise = null;
    }

    _toApexMarket(pair) {
        return PAIR_MAP[pair] || null;
    }

    async ensureReady() {
        if (this.ready) return true;
        if (!this._initPromise) {
            this._initPromise = this.connector.initialize().then(ok => {
                this.ready = !!ok;
                if (ok) console.log('[APEX-HFT] Bridge ready ✅');
                else    console.warn('[APEX-HFT] Bridge init failed ❌ (connector returned false)');
                return this.ready;
            }).catch(err => {
                console.error('[APEX-HFT] Bridge init error:', err.message);
                return false;
            });
        }
        return this._initPromise;
    }

    async open(pair, side, sizeUsd) {
        if (!await this.ensureReady()) return null;
        const market = this._toApexMarket(pair);
        if (!market) { console.warn(`[APEX-HFT] Unknown pair: ${pair}`); return null; }
        const direction = side === 'long' ? 'LONG' : 'SHORT';
        const result = await this.connector.openPosition(market, direction, sizeUsd, 1); // 1x leverage
        if (result?.success) {
            console.log(`[APEX-HFT] ✅ ${direction} ${market} $${sizeUsd} @ ~$${result.price?.toFixed(2)}`);
        }
        return result;
    }

    async close(pair) {
        if (!await this.ensureReady()) return null;
        const market = this._toApexMarket(pair);
        if (!market) return null;
        const result = await this.connector.closePosition(market);
        if (result?.success) {
            console.log(`[APEX-HFT] ✅ CLOSE ${market}`);
        }
        return result;
    }

    async getEquity() {
        if (!await this.ensureReady()) return null;
        const info = await this.connector.getAccountInfo();
        return info?.equity ?? null;
    }
}

module.exports = ApexHFTBridge;
