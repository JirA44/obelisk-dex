// Patch: Add "What is Obelisk" section to index.html
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// CSS to add
const newCSS = `
        /* What is Obelisk Section */
        .what-is-obelisk {
            padding: 80px 0;
        }

        .about-content {
            margin-top: 40px;
        }

        .about-description {
            max-width: 900px;
            margin: 0 auto 50px;
            text-align: center;
        }

        .about-description p {
            font-size: 18px;
            line-height: 1.8;
            color: var(--text-dim);
            margin-bottom: 16px;
        }

        .about-description strong {
            color: var(--text);
        }

        .specialties-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }

        .specialty-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 28px;
            transition: all 0.3s;
        }

        .specialty-card:hover {
            border-color: var(--primary);
            transform: translateY(-4px);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
        }

        .specialty-icon {
            font-size: 36px;
            margin-bottom: 16px;
        }

        .specialty-card h3 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 10px;
            color: var(--text);
        }

        .specialty-card p {
            color: var(--text-dim);
            line-height: 1.6;
            font-size: 15px;
        }

        @media (max-width: 768px) {
            .specialties-grid {
                grid-template-columns: 1fr;
            }
            .about-description p {
                font-size: 16px;
            }
        }

        /* Features Section */`;

// HTML section to add
const newSection = `
        <!-- What is Obelisk Section -->
        <section class="what-is-obelisk" id="about" aria-labelledby="about-title">
            <h2 class="section-title" id="about-title">What is <span style="background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">OBELISK</span>?</h2>
            <p class="section-subtitle" id="about-subtitle">The next-generation decentralized exchange built for the quantum computing era</p>

            <div class="about-content">
                <div class="about-description">
                    <p id="about-desc-1"><strong>OBELISK</strong> is a <strong>non-custodial decentralized exchange (DEX)</strong> that combines the power of multiple liquidity sources with military-grade post-quantum cryptography. Unlike traditional exchanges, we never hold your funds - you always maintain complete control of your assets.</p>
                    <p id="about-desc-2">We aggregate real-time prices from <strong>Hyperliquid, dYdX, Uniswap, Binance, Coinbase</strong> and <strong>Kraken</strong> to give you the best execution across <strong>600+ trading pairs</strong>.</p>
                </div>

                <div class="specialties-grid">
                    <div class="specialty-card">
                        <div class="specialty-icon">🛡️</div>
                        <h3 id="spec-pq-title">Post-Quantum Security</h3>
                        <p id="spec-pq-desc">First DEX using CRYSTALS-Kyber & Dilithium algorithms. Your assets are protected against future quantum computer attacks.</p>
                    </div>

                    <div class="specialty-card">
                        <div class="specialty-icon">⚡</div>
                        <h3 id="spec-multi-title">Multi-Source Aggregator</h3>
                        <p id="spec-multi-desc">Real-time prices from 6 major sources. Best execution guaranteed with millisecond updates.</p>
                    </div>

                    <div class="specialty-card">
                        <div class="specialty-icon">🎯</div>
                        <h3 id="spec-tools-title">Exclusive Pro Tools</h3>
                        <p id="spec-tools-desc">Liquidation Sniper, Smart Money Tracker, Rug Pull Detector, Cross-DEX Arbitrage, Funding Rate Arb, AI Trade Signals.</p>
                    </div>

                    <div class="specialty-card">
                        <div class="specialty-icon">💎</div>
                        <h3 id="spec-passive-title">Risk-Free Passive Products</h3>
                        <p id="spec-passive-desc">Staking, Protected Vaults, Fixed Bonds (4-12% APY), Index Baskets, Yield Optimizer - 14 combo strategies available.</p>
                    </div>

                    <div class="specialty-card">
                        <div class="specialty-icon">🔐</div>
                        <h3 id="spec-custody-title">100% Self-Custody</h3>
                        <p id="spec-custody-desc">Your keys, your crypto. We never store private keys. Connect your wallet, trade securely, withdraw anytime.</p>
                    </div>

                    <div class="specialty-card">
                        <div class="specialty-icon">📊</div>
                        <h3 id="spec-trading-title">Pro Trading Features</h3>
                        <p id="spec-trading-desc">Up to 100x leverage, Grid Bots, DCA Automation, Copy Trading, Trailing Stops, Whale Tracking, PnL Analytics.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="live-time"`;

// Translations to add
const newTranslations = `
                // About Section translations
                aboutTitle: 'What is <span style="background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">OBELISK</span>?',
                aboutSubtitle: 'The next-generation decentralized exchange built for the quantum computing era',
                aboutDesc1: '<strong>OBELISK</strong> is a <strong>non-custodial decentralized exchange (DEX)</strong> that combines the power of multiple liquidity sources with military-grade post-quantum cryptography. Unlike traditional exchanges, we never hold your funds - you always maintain complete control of your assets.',
                aboutDesc2: 'We aggregate real-time prices from <strong>Hyperliquid, dYdX, Uniswap, Binance, Coinbase</strong> and <strong>Kraken</strong> to give you the best execution across <strong>600+ trading pairs</strong>.',
                specPqTitle: 'Post-Quantum Security',
                specPqDesc: 'First DEX using CRYSTALS-Kyber & Dilithium algorithms. Your assets are protected against future quantum computer attacks.',
                specMultiTitle: 'Multi-Source Aggregator',
                specMultiDesc: 'Real-time prices from 6 major sources. Best execution guaranteed with millisecond updates.',
                specToolsTitle: 'Exclusive Pro Tools',
                specToolsDesc: 'Liquidation Sniper, Smart Money Tracker, Rug Pull Detector, Cross-DEX Arbitrage, Funding Rate Arb, AI Trade Signals.',
                specPassiveTitle: 'Risk-Free Passive Products',
                specPassiveDesc: 'Staking, Protected Vaults, Fixed Bonds (4-12% APY), Index Baskets, Yield Optimizer - 14 combo strategies available.',
                specCustodyTitle: '100% Self-Custody',
                specCustodyDesc: 'Your keys, your crypto. We never store private keys. Connect your wallet, trade securely, withdraw anytime.',
                specTradingTitle: 'Pro Trading Features',
                specTradingDesc: 'Up to 100x leverage, Grid Bots, DCA Automation, Copy Trading, Trailing Stops, Whale Tracking, PnL Analytics.',`;

// Check if already patched
if (html.includes('what-is-obelisk')) {
    console.log('Already patched!');
    process.exit(0);
}

// Apply CSS patch
html = html.replace(
    '/* Features Section */',
    newCSS
);

// Apply HTML section patch
html = html.replace(
    '<section class="live-time"',
    newSection
);

// Save
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Patch applied successfully!');
console.log('Added: What is Obelisk section with 6 specialty cards');
