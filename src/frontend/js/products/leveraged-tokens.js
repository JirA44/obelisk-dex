/**
 * LEVERAGED TOKENS MODULE
 * Extended with 40+ tokens
 */
const LeveragedTokensModule = {
    tokens: [
        // === BTC LEVERAGED ===
        { id: 'btc2x', name: 'BTC 2x Long', base: 'BTC', leverage: 2, direction: 'long', fee: 0.1, category: 'btc', icon: '📈' },
        { id: 'btc3x', name: 'BTC 3x Long', base: 'BTC', leverage: 3, direction: 'long', fee: 0.15, category: 'btc', icon: '📈' },
        { id: 'btc5x', name: 'BTC 5x Long', base: 'BTC', leverage: 5, direction: 'long', fee: 0.2, category: 'btc', icon: '🚀' },
        { id: 'btc2xs', name: 'BTC 2x Short', base: 'BTC', leverage: 2, direction: 'short', fee: 0.1, category: 'btc', icon: '📉' },
        { id: 'btc3xs', name: 'BTC 3x Short', base: 'BTC', leverage: 3, direction: 'short', fee: 0.15, category: 'btc', icon: '📉' },

        // === ETH LEVERAGED ===
        { id: 'eth2x', name: 'ETH 2x Long', base: 'ETH', leverage: 2, direction: 'long', fee: 0.1, category: 'eth', icon: '📈' },
        { id: 'eth3x', name: 'ETH 3x Long', base: 'ETH', leverage: 3, direction: 'long', fee: 0.15, category: 'eth', icon: '📈' },
        { id: 'eth5x', name: 'ETH 5x Long', base: 'ETH', leverage: 5, direction: 'long', fee: 0.2, category: 'eth', icon: '🚀' },
        { id: 'eth2xs', name: 'ETH 2x Short', base: 'ETH', leverage: 2, direction: 'short', fee: 0.1, category: 'eth', icon: '📉' },
        { id: 'eth3xs', name: 'ETH 3x Short', base: 'ETH', leverage: 3, direction: 'short', fee: 0.15, category: 'eth', icon: '📉' },

        // === SOL LEVERAGED ===
        { id: 'sol2x', name: 'SOL 2x Long', base: 'SOL', leverage: 2, direction: 'long', fee: 0.12, category: 'sol', icon: '📈' },
        { id: 'sol3x', name: 'SOL 3x Long', base: 'SOL', leverage: 3, direction: 'long', fee: 0.18, category: 'sol', icon: '📈' },
        { id: 'sol5x', name: 'SOL 5x Long', base: 'SOL', leverage: 5, direction: 'long', fee: 0.25, category: 'sol', icon: '🚀' },
        { id: 'sol2xs', name: 'SOL 2x Short', base: 'SOL', leverage: 2, direction: 'short', fee: 0.12, category: 'sol', icon: '📉' },
        { id: 'sol3xs', name: 'SOL 3x Short', base: 'SOL', leverage: 3, direction: 'short', fee: 0.18, category: 'sol', icon: '📉' },

        // === LAYER 2 TOKENS ===
        { id: 'arb2x', name: 'ARB 2x Long', base: 'ARB', leverage: 2, direction: 'long', fee: 0.15, category: 'layer2', icon: '📈' },
        { id: 'arb3x', name: 'ARB 3x Long', base: 'ARB', leverage: 3, direction: 'long', fee: 0.2, category: 'layer2', icon: '📈' },
        { id: 'op2x', name: 'OP 2x Long', base: 'OP', leverage: 2, direction: 'long', fee: 0.15, category: 'layer2', icon: '📈' },
        { id: 'op3x', name: 'OP 3x Long', base: 'OP', leverage: 3, direction: 'long', fee: 0.2, category: 'layer2', icon: '📈' },
        { id: 'matic2x', name: 'MATIC 2x Long', base: 'MATIC', leverage: 2, direction: 'long', fee: 0.12, category: 'layer2', icon: '📈' },
        { id: 'matic3x', name: 'MATIC 3x Long', base: 'MATIC', leverage: 3, direction: 'long', fee: 0.18, category: 'layer2', icon: '📈' },

        // === ALTCOINS ===
        { id: 'avax2x', name: 'AVAX 2x Long', base: 'AVAX', leverage: 2, direction: 'long', fee: 0.12, category: 'altcoin', icon: '📈' },
        { id: 'avax3x', name: 'AVAX 3x Long', base: 'AVAX', leverage: 3, direction: 'long', fee: 0.18, category: 'altcoin', icon: '📈' },
        { id: 'link2x', name: 'LINK 2x Long', base: 'LINK', leverage: 2, direction: 'long', fee: 0.12, category: 'altcoin', icon: '📈' },
        { id: 'link3x', name: 'LINK 3x Long', base: 'LINK', leverage: 3, direction: 'long', fee: 0.18, category: 'altcoin', icon: '📈' },
        { id: 'atom2x', name: 'ATOM 2x Long', base: 'ATOM', leverage: 2, direction: 'long', fee: 0.15, category: 'altcoin', icon: '📈' },
        { id: 'dot2x', name: 'DOT 2x Long', base: 'DOT', leverage: 2, direction: 'long', fee: 0.15, category: 'altcoin', icon: '📈' },
        { id: 'near2x', name: 'NEAR 2x Long', base: 'NEAR', leverage: 2, direction: 'long', fee: 0.15, category: 'altcoin', icon: '📈' },
        { id: 'sui2x', name: 'SUI 2x Long', base: 'SUI', leverage: 2, direction: 'long', fee: 0.18, category: 'altcoin', icon: '📈' },
        { id: 'apt2x', name: 'APT 2x Long', base: 'APT', leverage: 2, direction: 'long', fee: 0.18, category: 'altcoin', icon: '📈' },

        // === MEME TOKENS ===
        { id: 'doge2x', name: 'DOGE 2x Long', base: 'DOGE', leverage: 2, direction: 'long', fee: 0.2, category: 'meme', icon: '🐕' },
        { id: 'doge3x', name: 'DOGE 3x Long', base: 'DOGE', leverage: 3, direction: 'long', fee: 0.25, category: 'meme', icon: '🐕' },
        { id: 'shib2x', name: 'SHIB 2x Long', base: 'SHIB', leverage: 2, direction: 'long', fee: 0.25, category: 'meme', icon: '🐕' },
        { id: 'pepe2x', name: 'PEPE 2x Long', base: 'PEPE', leverage: 2, direction: 'long', fee: 0.3, category: 'meme', icon: '🐸' },
        { id: 'wif2x', name: 'WIF 2x Long', base: 'WIF', leverage: 2, direction: 'long', fee: 0.3, category: 'meme', icon: '🐶' },
        { id: 'bonk2x', name: 'BONK 2x Long', base: 'BONK', leverage: 2, direction: 'long', fee: 0.3, category: 'meme', icon: '🐕' },

        // === DEFI TOKENS ===
        { id: 'aave2x', name: 'AAVE 2x Long', base: 'AAVE', leverage: 2, direction: 'long', fee: 0.12, category: 'defi', icon: '👻' },
        { id: 'uni2x', name: 'UNI 2x Long', base: 'UNI', leverage: 2, direction: 'long', fee: 0.12, category: 'defi', icon: '🦄' },
        { id: 'crv2x', name: 'CRV 2x Long', base: 'CRV', leverage: 2, direction: 'long', fee: 0.15, category: 'defi', icon: '🔵' },
        { id: 'ldo2x', name: 'LDO 2x Long', base: 'LDO', leverage: 2, direction: 'long', fee: 0.15, category: 'defi', icon: '🔶' },
        { id: 'pendle2x', name: 'PENDLE 2x Long', base: 'PENDLE', leverage: 2, direction: 'long', fee: 0.18, category: 'defi', icon: '⚡' },
    ],

    categories: {
        btc: { name: 'BTC Leveraged', color: '#f7931a', description: 'Bitcoin leveraged tokens' },
        eth: { name: 'ETH Leveraged', color: '#627eea', description: 'Ethereum leveraged tokens' },
        sol: { name: 'SOL Leveraged', color: '#14f195', description: 'Solana leveraged tokens' },
        layer2: { name: 'Layer 2 Tokens', color: '#8b5cf6', description: 'L2 leveraged exposure' },
        altcoin: { name: 'Altcoin Leveraged', color: '#3b82f6', description: 'Alt L1 leverage' },
        meme: { name: 'Meme Leveraged', color: '#f59e0b', description: 'High risk meme leverage' },
        defi: { name: 'DeFi Leveraged', color: '#22c55e', description: 'DeFi governance tokens' }
    },

    positions: [],

    init() {
        this.load();
        console.log('Leveraged Tokens initialized - ' + this.tokens.length + ' tokens');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_levtokens', []);
    },

    save() {
        SafeOps.setStorage('obelisk_levtokens', this.positions);
    },

    getPrice(base) {
        const prices = {
            BTC: 97000, ETH: 3400, SOL: 190, ARB: 0.95, OP: 2.1, MATIC: 0.58,
            AVAX: 42, LINK: 22, ATOM: 10.5, DOT: 8.5, NEAR: 5.8, SUI: 4.2, APT: 12,
            DOGE: 0.38, SHIB: 0.000024, PEPE: 0.000018, WIF: 2.5, BONK: 0.000032,
            AAVE: 350, UNI: 14, CRV: 0.95, LDO: 2.2, PENDLE: 5.8
        };
        return prices[base] || 100;
    },

    buy(tokenId, amount) {
        const token = this.tokens.find(t => t.id === tokenId);
        if (!token || amount < 10) return { success: false, error: 'Min $10' };
        const pos = {
            id: 'lev-' + Date.now(),
            tokenId,
            amount,
            entryPrice: this.getPrice(token.base),
            leverage: token.leverage,
            direction: token.direction,
            startDate: Date.now()
        };
        this.positions.push(pos);
        this.save();
        return { success: true, position: pos };
    },

    sell(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        const token = this.tokens.find(t => t.id === pos.tokenId);
        const currentPrice = this.getPrice(token.base);
        const priceChange = (currentPrice - pos.entryPrice) / pos.entryPrice;
        const pnl = pos.amount * priceChange * pos.leverage * (pos.direction === 'long' ? 1 : -1);
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, amount: pos.amount + pnl, pnl };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = '<h3 style="color:#00ff88;margin-bottom:16px;">Leveraged Tokens (' + this.tokens.length + ' tokens)</h3>';

        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catTokens = this.tokens.filter(t => t.category === catKey);
            if (catTokens.length === 0) return;

            html += '<div style="margin-bottom:24px;">';
            html += '<h4 style="color:' + cat.color + ';margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ' + cat.color + ';">' + cat.name + ' <span style="font-size:11px;opacity:0.7;">(' + catTokens.length + ' tokens) - ' + cat.description + '</span></h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;">';

            catTokens.forEach(t => {
                const dirColor = t.direction === 'long' ? '#22c55e' : '#ef4444';
                html += '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;">';
                html += '<div style="font-weight:bold;font-size:12px;margin-bottom:4px;">' + (t.icon || '') + ' ' + t.name + '</div>';
                html += '<div style="display:flex;align-items:center;gap:6px;margin:6px 0;">';
                html += '<span style="background:' + dirColor + ';color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;">' + t.leverage + 'x ' + t.direction.toUpperCase() + '</span>';
                html += '</div>';
                html += '<div style="font-size:10px;color:#888;">Fee: ' + t.fee + '%</div>';
                html += '<button onclick="LeveragedTokensModule.showBuyModal(\'' + t.id + '\')" style="margin-top:6px;padding:6px 12px;background:' + dirColor + ';border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;font-size:10px;width:100%;">Buy</button>';
                html += '</div>';
            });

            html += '</div></div>';
        });

        el.innerHTML = html;
    },

    showBuyModal(tokenId) {
        const token = this.tokens.find(t => t.id === tokenId);
        if (!token) return;

        const existing = document.getElementById('levtoken-modal');
        if (existing) existing.remove();

        const dirColor = token.direction === 'long' ? '#22c55e' : '#ef4444';
        const price = this.getPrice(token.base);

        const modal = document.createElement('div');
        modal.id = 'levtoken-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:500;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:${dirColor};margin:0 0 16px;">${token.icon || ''} ${token.name}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Base Asset:</span>
                        <span>${token.base}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Current Price:</span>
                        <span style="color:#00ff88;font-weight:bold;">$${price.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Leverage:</span>
                        <span style="color:${dirColor};font-weight:bold;">${token.leverage}x ${token.direction.toUpperCase()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Daily Fee:</span>
                        <span>${token.fee}%</span>
                    </div>
                </div>
                <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:8px;margin-bottom:16px;font-size:11px;color:#ef4444;">
                    ⚠️ ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Les tokens à effet de levier peuvent perdre rapidement de la valeur' : 'Leveraged tokens can lose value rapidly due to volatility decay'}
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Montant USD (min $10)' : 'Amount USD (min $10)'}</label>
                    <input type="number" id="levtoken-amount" min="10" placeholder="${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Entrez le montant...' : 'Enter amount...'}" style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="background:linear-gradient(135deg,rgba(0,212,170,0.1),rgba(0,212,170,0.05));border:1px solid rgba(0,212,170,0.3);border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="color:#00d4aa;font-size:11px;font-weight:600;text-align:center;margin-bottom:8px;">📥 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Acheter Token' : 'Buy Token'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="LeveragedTokensModule.confirmBuy('${token.id}',true)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">🎮 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'SIMULÉ' : 'SIMULATED'}</button>
                        <button onclick="LeveragedTokensModule.confirmBuy('${token.id}',false)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#00d4aa,#00a884);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">💎 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'RÉEL' : 'REAL'}</button>
                    </div>
                </div>
                <button onclick="document.getElementById('levtoken-modal').remove()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#aaa;cursor:pointer;">${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Annuler' : 'Cancel'}</button>
            </div>
        `;
        document.body.appendChild(modal);

        setTimeout(() => document.getElementById('levtoken-amount').focus(), 100);
    },

    confirmBuy(tokenId, isSimulated = true) {
        const amount = parseFloat(document.getElementById('levtoken-amount').value);
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        if (!amount || amount < 10) {
            alert(isFr ? 'Minimum: $10' : 'Minimum is $10');
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

        const result = this.buy(tokenId, amount, isSimulated);
        document.getElementById('levtoken-modal').remove();

        if (result.success) {
            const token = this.tokens.find(t => t.id === tokenId);
            const modeText = isSimulated ? '🎮' : '💎';
            if (typeof showNotification === 'function') {
                showNotification(modeText + ' ' + (isFr ? 'Acheté $' : 'Bought $') + amount + ' ' + token.name, 'success');
            }
        } else {
            alert(result.error);
        }
    },

    quickBuy(tokenId) {
        this.showBuyModal(tokenId);
    }
};

document.addEventListener('DOMContentLoaded', () => LeveragedTokensModule.init());
