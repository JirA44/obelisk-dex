// Patch pour ajouter les outils uniques
const fs = require('fs');

let content = fs.readFileSync('server-ultra.js', 'utf8');

// Vérifie si déjà patché
if (content.includes('UniqueTools')) {
    console.log('Already patched with unique tools!');
    process.exit(0);
}

// Ajouter l'import après les autres modules
const importPatch = `
// ===========================================
// UNIQUE TOOLS - Exclusive Features
// ===========================================
const { UniqueTools } = require('./unique-tools');
const { setupUniqueRoutes } = require('./unique-routes');
const uniqueTools = new UniqueTools();

// Setup unique tools routes
setupUniqueRoutes(app, uniqueTools, markets, pricesBySource);

// Process unique tools every 5 seconds
setInterval(() => {
    // Scan for arbitrage opportunities
    uniqueTools.scanArbitrage(pricesBySource);

    // Simulate gas price updates
    uniqueTools.recordGasPrice('ethereum', 20 + Math.random() * 30);
    uniqueTools.recordGasPrice('arbitrum', 0.1 + Math.random() * 0.2);

    // Generate AI signals for major pairs
    ['BTC/USDC', 'ETH/USDC', 'SOL/USDC'].forEach(pair => {
        if (markets[pair]) {
            const indicators = {
                price: markets[pair].price,
                volume: markets[pair].volume,
                change24h: markets[pair].change24h,
                rsi: 50 + markets[pair].change24h * 2,
                macd: { macd: markets[pair].change24h > 0 ? 1 : -1, signal: 0, histogram: markets[pair].change24h * 0.1 },
                bb: { upper: markets[pair].high, lower: markets[pair].low }
            };
            uniqueTools.generateSignal(pair, { avgVolume: markets[pair].volume * 0.8 }, indicators);
        }
    });
}, 5000);

`;

// Insérer avant "// ===========================================\n// START SERVER"
content = content.replace(
    '// ===========================================\n// START SERVER',
    importPatch + '// ===========================================\n// START SERVER'
);

// Mettre à jour le banner
const newBanner = `╔══════════════════════════════════════════════════════════════╗
║       OBELISK Ultra-Fast Trading Server v4.1                 ║
║  🔗 MULTI-SOURCE + 💰 MICRO-INVEST + 🛠️ TOOLS + ⚡ UNIQUE    ║
╠══════════════════════════════════════════════════════════════╣
║  REST API:     http://localhost:\${PORT}                         ║
║  WebSocket:    ws://localhost:\${PORT}                           ║
║  Markets:      \${Object.keys(markets).length} pairs                                  ║
╠══════════════════════════════════════════════════════════════╣
║  🎯 UNIQUE TOOLS (Exclusive):                                ║
║    /api/unique/sniper/*     - Liquidation Sniper             ║
║    /api/unique/smartmoney/* - Smart Money Tracker            ║
║    /api/unique/arbitrage    - Cross-DEX Arbitrage            ║
║    /api/unique/rug/*        - Rug Pull Detector              ║
║    /api/unique/funding      - Funding Rate Arb               ║
║    /api/unique/social/*     - Social Sentiment               ║
║    /api/unique/airdrops     - Airdrop Hunter                 ║
║    /api/unique/gas          - Gas Optimizer                  ║
║    /api/unique/stress-test  - Portfolio Stress Test          ║
║    /api/unique/signals/*    - AI Trade Signals               ║
║    /api/unique/insider/*    - Insider Activity Detector      ║
╠══════════════════════════════════════════════════════════════╣
║  TRADING TOOLS:                                              ║
║    /api/grid/*       - Grid Trading Bots                     ║
║    /api/dca/*        - DCA Automation                        ║
║    /api/copy/*       - Copy Trading                          ║
║    /api/trailing/*   - Trailing Stop Orders                  ║
╠══════════════════════════════════════════════════════════════╣
║  ANALYTICS & AUTOMATION:                                     ║
║    /api/analytics/*  - PnL, Heatmaps, Whales, Sentiment      ║
║    /api/automation/* - Bots, Alerts, Webhooks                ║
║    /api/portfolio/*  - Multi-wallet, Rebalancing, Tax        ║
╚══════════════════════════════════════════════════════════════╝`;

content = content.replace(
    /╔══════════════════════════════════════════════════════════════╗\n║       OBELISK Ultra-Fast Trading Server v4\.0[\s\S]*?╚══════════════════════════════════════════════════════════════╝/,
    newBanner
);

fs.writeFileSync('server-ultra.js', content);
console.log('Unique tools patch applied successfully!');
