/**
 * OBELISK EXECUTOR
 * Trades via Obelisk Perps internal engine → Sonic blockchain settlement
 *
 * Flow: sonic-hft signal
 *   → open(pair, side, sizeUsd)
 *   → POST /api/perps/open  (Obelisk perps pool $100K)
 *   → auto-queued to Sonic settlement batcher (Multicall3, $0.00021/batch)
 *
 * Interface: open(pair, side, sizeUsd) / close(pair) — same as ApexHFTBridge
 */

const http = require('http');

const USER_ID  = 'sonic-hft';
const OBE_HOST = 'localhost';
const OBE_PORT = 3001;

function post(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const opts = {
            hostname: OBE_HOST,
            port:     OBE_PORT,
            path,
            method:   'POST',
            headers:  {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        };
        const req = http.request(opts, res => {
            let raw = '';
            res.on('data', d => raw += d);
            res.on('end', () => {
                try { resolve(JSON.parse(raw)); }
                catch { resolve({ success: false, raw }); }
            });
        });
        req.setTimeout(5000, () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

class ObeliskExecutor {
    constructor() {
        console.log('[OBE-EXEC] Obelisk Executor ready');
        console.log('[OBE-EXEC]   Flow: HFT signal → Obelisk perps → Sonic settlement');
    }

    /** 'BTC/USDC' → 'BTC' */
    _coin(pair) { return pair.split('/')[0]; }

    /**
     * Open a position on Obelisk internal perps
     * @param {string} pair  - 'BTC/USDC'
     * @param {string} side  - 'long' | 'short'
     * @param {number} sizeUsd
     */
    async open(pair, side, sizeUsd) {
        const coin = this._coin(pair);
        try {
            const result = await post('/api/perps/open', {
                coin,
                side:     side === 'long' ? 'long' : 'short',
                size:     sizeUsd,
                leverage: 1,        // HFT rule: always 1x
                userId:   USER_ID,
                source:   'sonic-hft',
            });

            if (result.success) {
                const pos = result.position;
                console.log(`[OBE-EXEC] ✅ OPEN ${side.toUpperCase()} ${coin} $${sizeUsd} @ ${pos?.entryPrice} | sl=${pos?.sl} tp=${pos?.tp} | id=${pos?.id}`);
            } else {
                console.warn(`[OBE-EXEC] ❌ OPEN ${coin} failed: ${result.error}`);
            }
            return result;
        } catch (e) {
            console.warn(`[OBE-EXEC] OPEN error: ${e.message}`);
            return null;
        }
    }

    /**
     * Close all positions for a given pair
     * @param {string} pair - 'BTC/USDC'
     */
    async close(pair) {
        const coin = this._coin(pair);
        try {
            const result = await post('/api/perps/close', {
                coin,
                userId: USER_ID,
            });

            if (result.success) {
                const pnl = typeof result.pnl === 'number' ? result.pnl.toFixed(4) : '?';
                console.log(`[OBE-EXEC] ✅ CLOSE ${coin} pnl=$${pnl}`);
            } else {
                console.warn(`[OBE-EXEC] ❌ CLOSE ${coin} failed: ${result.error}`);
            }
            return result;
        } catch (e) {
            console.warn(`[OBE-EXEC] CLOSE error: ${e.message}`);
            return null;
        }
    }
}

module.exports = ObeliskExecutor;
