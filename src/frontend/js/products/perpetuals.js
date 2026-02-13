/**
 * PERPETUALS MODULE - Perpetual Futures Trading
 * Extended with 45+ markets
 */
const PerpetualsModule = {
    markets: [
        // === MAJOR CRYPTOS ===
        { id: 'btc-perp', symbol: 'BTC-PERP', price: 97000, fundingRate: 0.01, openInterest: 5000000000, maxLeverage: 100, category: 'major', icon: '₿' },
        { id: 'eth-perp', symbol: 'ETH-PERP', price: 3400, fundingRate: 0.008, openInterest: 2000000000, maxLeverage: 100, category: 'major', icon: '⟠' },
        { id: 'sol-perp', symbol: 'SOL-PERP', price: 190, fundingRate: 0.015, openInterest: 500000000, maxLeverage: 50, category: 'major', icon: '◎' },
        { id: 'xrp-perp', symbol: 'XRP-PERP', price: 2.3, fundingRate: 0.02, openInterest: 300000000, maxLeverage: 50, category: 'major', icon: '💧' },
        { id: 'bnb-perp', symbol: 'BNB-PERP', price: 680, fundingRate: 0.01, openInterest: 400000000, maxLeverage: 50, category: 'major', icon: '🔶' },
        { id: 'ada-perp', symbol: 'ADA-PERP', price: 0.95, fundingRate: 0.012, openInterest: 150000000, maxLeverage: 50, category: 'major', icon: '💙' },

        // === LAYER 1s ===
        { id: 'avax-perp', symbol: 'AVAX-PERP', price: 42, fundingRate: 0.012, openInterest: 200000000, maxLeverage: 50, category: 'layer1', icon: '🔺' },
        { id: 'dot-perp', symbol: 'DOT-PERP', price: 8.5, fundingRate: 0.015, openInterest: 100000000, maxLeverage: 50, category: 'layer1', icon: '🔴' },
        { id: 'atom-perp', symbol: 'ATOM-PERP', price: 10.5, fundingRate: 0.012, openInterest: 80000000, maxLeverage: 50, category: 'layer1', icon: '⚛️' },
        { id: 'near-perp', symbol: 'NEAR-PERP', price: 5.8, fundingRate: 0.018, openInterest: 60000000, maxLeverage: 25, category: 'layer1', icon: '🌐' },
        { id: 'sui-perp', symbol: 'SUI-PERP', price: 4.2, fundingRate: 0.025, openInterest: 150000000, maxLeverage: 25, category: 'layer1', icon: '💧' },
        { id: 'apt-perp', symbol: 'APT-PERP', price: 12, fundingRate: 0.02, openInterest: 80000000, maxLeverage: 25, category: 'layer1', icon: '🔷' },
        { id: 'sei-perp', symbol: 'SEI-PERP', price: 0.52, fundingRate: 0.03, openInterest: 40000000, maxLeverage: 25, category: 'layer1', icon: '🌊' },
        { id: 'inj-perp', symbol: 'INJ-PERP', price: 28, fundingRate: 0.02, openInterest: 50000000, maxLeverage: 25, category: 'layer1', icon: '💉' },

        // === LAYER 2s ===
        { id: 'arb-perp', symbol: 'ARB-PERP', price: 0.95, fundingRate: 0.02, openInterest: 150000000, maxLeverage: 25, category: 'layer2', icon: '🔷' },
        { id: 'op-perp', symbol: 'OP-PERP', price: 2.1, fundingRate: 0.018, openInterest: 100000000, maxLeverage: 25, category: 'layer2', icon: '🔴' },
        { id: 'matic-perp', symbol: 'MATIC-PERP', price: 0.58, fundingRate: 0.015, openInterest: 120000000, maxLeverage: 50, category: 'layer2', icon: '🟣' },
        { id: 'strk-perp', symbol: 'STRK-PERP', price: 0.65, fundingRate: 0.03, openInterest: 30000000, maxLeverage: 20, category: 'layer2', icon: '⬛' },
        { id: 'zk-perp', symbol: 'ZK-PERP', price: 0.22, fundingRate: 0.035, openInterest: 25000000, maxLeverage: 20, category: 'layer2', icon: '💠' },

        // === DEFI TOKENS ===
        { id: 'link-perp', symbol: 'LINK-PERP', price: 22, fundingRate: 0.015, openInterest: 200000000, maxLeverage: 50, category: 'defi', icon: '⛓' },
        { id: 'aave-perp', symbol: 'AAVE-PERP', price: 350, fundingRate: 0.012, openInterest: 80000000, maxLeverage: 25, category: 'defi', icon: '👻' },
        { id: 'uni-perp', symbol: 'UNI-PERP', price: 14, fundingRate: 0.015, openInterest: 60000000, maxLeverage: 25, category: 'defi', icon: '🦄' },
        { id: 'mkr-perp', symbol: 'MKR-PERP', price: 1800, fundingRate: 0.01, openInterest: 40000000, maxLeverage: 25, category: 'defi', icon: '🔷' },
        { id: 'crv-perp', symbol: 'CRV-PERP', price: 0.95, fundingRate: 0.025, openInterest: 30000000, maxLeverage: 20, category: 'defi', icon: '🔵' },
        { id: 'ldo-perp', symbol: 'LDO-PERP', price: 2.2, fundingRate: 0.02, openInterest: 50000000, maxLeverage: 25, category: 'defi', icon: '🔶' },
        { id: 'snx-perp', symbol: 'SNX-PERP', price: 3.5, fundingRate: 0.022, openInterest: 25000000, maxLeverage: 20, category: 'defi', icon: '🟣' },
        { id: 'pendle-perp', symbol: 'PENDLE-PERP', price: 5.8, fundingRate: 0.03, openInterest: 40000000, maxLeverage: 20, category: 'defi', icon: '⚡' },

        // === MEME COINS ===
        { id: 'doge-perp', symbol: 'DOGE-PERP', price: 0.38, fundingRate: 0.025, openInterest: 300000000, maxLeverage: 25, category: 'meme', icon: '🐕' },
        { id: 'shib-perp', symbol: 'SHIB-PERP', price: 0.000024, fundingRate: 0.03, openInterest: 100000000, maxLeverage: 25, category: 'meme', icon: '🐕' },
        { id: 'pepe-perp', symbol: 'PEPE-PERP', price: 0.000018, fundingRate: 0.05, openInterest: 150000000, maxLeverage: 20, category: 'meme', icon: '🐸' },
        { id: 'wif-perp', symbol: 'WIF-PERP', price: 2.5, fundingRate: 0.06, openInterest: 80000000, maxLeverage: 20, category: 'meme', icon: '🐶' },
        { id: 'bonk-perp', symbol: 'BONK-PERP', price: 0.000032, fundingRate: 0.05, openInterest: 50000000, maxLeverage: 20, category: 'meme', icon: '🐕' },
        { id: 'floki-perp', symbol: 'FLOKI-PERP', price: 0.00018, fundingRate: 0.04, openInterest: 30000000, maxLeverage: 20, category: 'meme', icon: '⚔️' },

        // === AI & GAMING ===
        { id: 'render-perp', symbol: 'RENDER-PERP', price: 8.5, fundingRate: 0.025, openInterest: 60000000, maxLeverage: 20, category: 'ai', icon: '🎨' },
        { id: 'fet-perp', symbol: 'FET-PERP', price: 1.8, fundingRate: 0.03, openInterest: 40000000, maxLeverage: 20, category: 'ai', icon: '🤖' },
        { id: 'rndr-perp', symbol: 'TAO-PERP', price: 480, fundingRate: 0.025, openInterest: 50000000, maxLeverage: 20, category: 'ai', icon: '🧠' },
        { id: 'ar-perp', symbol: 'AR-PERP', price: 18, fundingRate: 0.02, openInterest: 30000000, maxLeverage: 20, category: 'ai', icon: '💾' },
        { id: 'imx-perp', symbol: 'IMX-PERP', price: 1.8, fundingRate: 0.025, openInterest: 35000000, maxLeverage: 20, category: 'ai', icon: '🎮' },
        { id: 'gala-perp', symbol: 'GALA-PERP', price: 0.045, fundingRate: 0.03, openInterest: 25000000, maxLeverage: 20, category: 'ai', icon: '🎮' },

        // === FOREX & COMMODITIES ===
        { id: 'eur-perp', symbol: 'EUR-PERP', price: 1.08, fundingRate: 0.001, openInterest: 100000000, maxLeverage: 100, category: 'forex', icon: '💶' },
        { id: 'gbp-perp', symbol: 'GBP-PERP', price: 1.26, fundingRate: 0.001, openInterest: 80000000, maxLeverage: 100, category: 'forex', icon: '💷' },
        { id: 'gold-perp', symbol: 'XAU-PERP', price: 2650, fundingRate: 0.002, openInterest: 200000000, maxLeverage: 50, category: 'forex', icon: '🥇' },
        { id: 'silver-perp', symbol: 'XAG-PERP', price: 31, fundingRate: 0.003, openInterest: 50000000, maxLeverage: 50, category: 'forex', icon: '🥈' },
    ],

    categories: {
        major: { name: 'Major Cryptos', color: '#f7931a', description: 'BTC, ETH, SOL...' },
        layer1: { name: 'Layer 1 Chains', color: '#3b82f6', description: 'Alt L1 blockchains' },
        layer2: { name: 'Layer 2 Tokens', color: '#8b5cf6', description: 'Scaling solutions' },
        defi: { name: 'DeFi Tokens', color: '#22c55e', description: 'Protocol governance' },
        meme: { name: 'Meme Coins', color: '#f59e0b', description: 'High volatility' },
        ai: { name: 'AI & Gaming', color: '#ec4899', description: 'AI narrative tokens' },
        forex: { name: 'Forex & Commodities', color: '#6366f1', description: 'Traditional assets' }
    },

    positions: [],

    init() {
        this.load();
        console.log('Perpetuals initialized - ' + this.markets.length + ' markets');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_perps', []);
    },

    save() {
        SafeOps.setStorage('obelisk_perps', this.positions);
    },

    openPosition(marketId, side, size, leverage) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market) return { success: false, error: 'Market not found' };
        if (leverage > market.maxLeverage) return { success: false, error: 'Max leverage: ' + market.maxLeverage + 'x' };
        const margin = size / leverage;
        const pos = { id: 'perp-' + Date.now(), marketId, symbol: market.symbol, side, size, leverage, margin, entryPrice: market.price, openTime: Date.now() };
        this.positions.push(pos);
        this.save();
        return { success: true, position: pos };
    },

    closePosition(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        const market = this.markets.find(m => m.id === pos.marketId);
        const priceDiff = market.price - pos.entryPrice;
        const pnl = (pos.side === 'long' ? priceDiff : -priceDiff) / pos.entryPrice * pos.size;
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, pnl, margin: pos.margin };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = '<h3 style="color:#00ff88;margin-bottom:16px;">Perpetual Futures (' + this.markets.length + ' markets)</h3>';

        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catMarkets = this.markets.filter(m => m.category === catKey);
            if (catMarkets.length === 0) return;

            html += '<div style="margin-bottom:24px;">';
            html += '<h4 style="color:' + cat.color + ';margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ' + cat.color + ';">' + cat.name + ' <span style="font-size:11px;opacity:0.7;">(' + catMarkets.length + ' markets) - ' + cat.description + '</span></h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">';

            catMarkets.forEach(m => {
                const fundingColor = m.fundingRate > 0.02 ? '#ef4444' : m.fundingRate > 0.01 ? '#f59e0b' : '#22c55e';
                html += '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;">';
                html += '<div style="font-weight:bold;font-size:13px;margin-bottom:4px;">' + (m.icon || '') + ' ' + m.symbol + '</div>';
                html += '<div style="color:#00ff88;font-size:14px;font-weight:bold;">$' + m.price.toLocaleString() + '</div>';
                html += '<div style="font-size:10px;color:' + fundingColor + ';">Funding: ' + m.fundingRate + '%</div>';
                html += '<div style="font-size:10px;color:#888;">Max: ' + m.maxLeverage + 'x</div>';
                html += '<div style="display:flex;gap:4px;margin-top:8px;">';
                html += '<button onclick="PerpetualsModule.showTradeModal(\'' + m.id + '\',\'long\')" style="flex:1;padding:6px;background:#22c55e;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;font-size:10px;">Long</button>';
                html += '<button onclick="PerpetualsModule.showTradeModal(\'' + m.id + '\',\'short\')" style="flex:1;padding:6px;background:#ef4444;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;font-size:10px;">Short</button>';
                html += '</div>';
                html += '</div>';
            });

            html += '</div></div>';
        });

        el.innerHTML = html;
    },

    showTradeModal(marketId, side) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market) return;

        const existing = document.getElementById('perp-modal');
        if (existing) existing.remove();

        const sideColor = side === 'long' ? '#22c55e' : '#ef4444';

        const modal = document.createElement('div');
        modal.id = 'perp-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:500;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:${sideColor};margin:0 0 16px;">${market.icon || ''} ${side.toUpperCase()} ${market.symbol}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Price:</span>
                        <span style="color:#00ff88;font-weight:bold;">$${market.price.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Funding Rate:</span>
                        <span>${market.fundingRate}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Max Leverage:</span>
                        <span>${market.maxLeverage}x</span>
                    </div>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">Position Size (USD)</label>
                    <input type="number" id="perp-size" min="10" placeholder="Enter size..." style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">Leverage (1-${market.maxLeverage}x)</label>
                    <input type="range" id="perp-leverage" min="1" max="${market.maxLeverage}" value="10" style="width:100%;">
                    <div style="text-align:center;color:#00ff88;font-weight:bold;" id="leverage-display">10x</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;margin-bottom:16px;font-size:12px;">
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#888;">Margin Required:</span>
                        <span id="margin-display">-</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#888;">Liquidation Price:</span>
                        <span id="liq-display">-</span>
                    </div>
                </div>
                <div style="background:linear-gradient(135deg,rgba(0,212,170,0.1),rgba(0,212,170,0.05));border:1px solid rgba(0,212,170,0.3);border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="color:#00d4aa;font-size:11px;font-weight:600;text-align:center;margin-bottom:8px;">📥 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Ouvrir Position' : 'Open Position'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="PerpetualsModule.confirmTrade('${market.id}','${side}',true)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">🎮 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'SIMULÉ' : 'SIMULATED'}</button>
                        <button onclick="PerpetualsModule.confirmTrade('${market.id}','${side}',false)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#00d4aa,#00a884);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">💎 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'RÉEL' : 'REAL'}</button>
                    </div>
                </div>
                <button onclick="document.getElementById('perp-modal').remove()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#aaa;cursor:pointer;">${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Annuler' : 'Cancel'}</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Update displays
        const leverageSlider = document.getElementById('perp-leverage');
        const sizeInput = document.getElementById('perp-size');

        const updateDisplays = () => {
            const lev = parseInt(leverageSlider.value);
            const size = parseFloat(sizeInput.value) || 0;
            document.getElementById('leverage-display').textContent = lev + 'x';
            document.getElementById('margin-display').textContent = size > 0 ? '$' + (size / lev).toFixed(2) : '-';
            const liqMove = 100 / lev;
            document.getElementById('liq-display').textContent = size > 0 ? (side === 'long' ? '-' : '+') + liqMove.toFixed(1) + '%' : '-';
        };

        leverageSlider.addEventListener('input', updateDisplays);
        sizeInput.addEventListener('input', updateDisplays);

        setTimeout(() => sizeInput.focus(), 100);
    },

    confirmTrade(marketId, side, isSimulated = true) {
        const size = parseFloat(document.getElementById('perp-size').value);
        const leverage = parseInt(document.getElementById('perp-leverage').value);
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        if (!size || size < 10) {
            alert(isFr ? 'Taille minimum: $10' : 'Minimum size is $10');
            return;
        }

        // Check wallet for real trades
        if (!isSimulated) {
            const walletConnected = (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) ||
                                    (typeof WalletConnect !== 'undefined' && WalletConnect.connected);
            if (!walletConnected) {
                if (typeof showNotification === 'function') {
                    showNotification(isFr ? 'Connectez votre wallet pour trader en réel' : 'Connect wallet to trade with real funds', 'warning');
                }
                return;
            }
        }

        const result = this.openPosition(marketId, side, size, leverage, isSimulated);
        document.getElementById('perp-modal').remove();

        if (result.success) {
            const market = this.markets.find(m => m.id === marketId);
            const modeText = isSimulated ? '🎮' : '💎';
            if (typeof showNotification === 'function') {
                showNotification(modeText + ' ' + (isFr ? 'Position ouverte: ' : 'Opened ') + side.toUpperCase() + ' ' + market.symbol + ' $' + size + ' @ ' + leverage + 'x', 'success');
            }
        } else {
            alert(result.error);
        }
    },

    quickTrade(marketId, side) {
        this.showTradeModal(marketId, side);
    }
};

document.addEventListener('DOMContentLoaded', () => PerpetualsModule.init());
