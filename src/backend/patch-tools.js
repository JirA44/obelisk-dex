// Script to patch server-ultra.js with new tools
const fs = require('fs');

const patchCode = `
// ===========================================
// NEW MODULES - Advanced Trading Tools
// ===========================================
const { AdvancedTrading } = require('./advanced-trading');
const { AnalyticsEngine } = require('./analytics-engine');
const { AutomationEngine } = require('./automation-engine');
const { PortfolioManager } = require('./portfolio-manager');
const { setupToolsRoutes } = require('./tools-routes');

const advancedTrading = new AdvancedTrading();
const analyticsEngine = new AnalyticsEngine();
const automationEngine = new AutomationEngine();
const portfolioManager = new PortfolioManager();

// Setup all advanced tools routes
setupToolsRoutes(app, {
    advancedTrading,
    analytics: analyticsEngine,
    automation: automationEngine,
    portfolio: portfolioManager
}, markets);

// Process automation every second
setInterval(() => {
    const previousPrices = {};
    Object.entries(markets).forEach(([pair, data]) => {
        previousPrices[pair] = data.price;
    });

    // Process all trading tools
    advancedTrading.processAll(markets);
    automationEngine.processAll(markets, previousPrices);

    // Update analytics
    Object.entries(markets).forEach(([pair, data]) => {
        analyticsEngine.updatePriceHeatmap(pair, data.price, data.change24h);
        analyticsEngine.updateVolumeHeatmap(pair, data.volume, 0);
    });
}, 1000);

`;

const newBanner = `
╔══════════════════════════════════════════════════════════════╗
║       OBELISK Ultra-Fast Trading Server v4.0                 ║
║  🔗 MULTI-SOURCE + 💰 MICRO-INVEST + 🛠️ ADVANCED TOOLS       ║
╠══════════════════════════════════════════════════════════════╣
║  REST API:     http://localhost:\${PORT}                         ║
║  WebSocket:    ws://localhost:\${PORT}                           ║
║  Markets:      \${Object.keys(markets).length} pairs                                  ║
╠══════════════════════════════════════════════════════════════╣
║  TRADING TOOLS:                                              ║
║    /api/grid/*       - Grid Trading Bots                     ║
║    /api/dca/*        - DCA Automation                        ║
║    /api/copy/*       - Copy Trading                          ║
║    /api/trailing/*   - Trailing Stop Orders                  ║
╠══════════════════════════════════════════════════════════════╣
║  ANALYTICS:                                                  ║
║    /api/analytics/pnl/*      - PnL Tracking                  ║
║    /api/analytics/heatmap/*  - Price/Volume Heatmaps         ║
║    /api/analytics/whales/*   - Whale Alerts                  ║
║    /api/analytics/sentiment/* - Market Sentiment             ║
╠══════════════════════════════════════════════════════════════╣
║  AUTOMATION:                                                 ║
║    /api/automation/bot/*     - Custom Trading Bots           ║
║    /api/automation/alert/*   - Price Alerts                  ║
║    /api/automation/webhook/* - Webhooks                      ║
╠══════════════════════════════════════════════════════════════╣
║  PORTFOLIO:                                                  ║
║    /api/portfolio/*          - Multi-wallet Tracking         ║
║    /api/portfolio/rebalance/* - Auto-Rebalancing             ║
║    /api/portfolio/tax/*      - Tax Reports                   ║
╚══════════════════════════════════════════════════════════════╝
`;

let content = fs.readFileSync('server-ultra.js', 'utf8');

// Check if already patched
if (content.includes('AdvancedTrading')) {
    console.log('Already patched!');
    process.exit(0);
}

// Insert patch before START SERVER section
content = content.replace(
    '// ===========================================\n// START SERVER',
    patchCode + '// ===========================================\n// START SERVER'
);

// Update banner
content = content.replace(
    /╔══════════════════════════════════════════════════════════════╗\n║       OBELISK Ultra-Fast Trading Server v3\.1[\s\S]*?╚══════════════════════════════════════════════════════════════╝/,
    newBanner.trim()
);

fs.writeFileSync('server-ultra.js', content);
console.log('Patch applied successfully!');
