// Quick APEX bridge connectivity test
require('dotenv').config();
const ApexHFTBridge = require('./src/backend/hft/apex-hft-bridge');

const b = new ApexHFTBridge();
console.log('[TEST] APEX bridge init...');
console.log('[TEST] API Key:', process.env.APEX_API_KEY ? process.env.APEX_API_KEY.slice(0,8) + '...' : 'MISSING');

b.ensureReady().then(ok => {
    console.log('[TEST] Bridge ready:', ok);
    if (!ok) { process.exit(1); }
    return b.getEquity();
}).then(eq => {
    console.log('[TEST] Equity: $' + eq);
    process.exit(0);
}).catch(e => {
    console.error('[TEST] Error:', e.message);
    process.exit(1);
});

setTimeout(() => { console.log('[TEST] Timeout (12s)'); process.exit(1); }, 12000);
