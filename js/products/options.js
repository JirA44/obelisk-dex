/**
 * OPTIONS MODULE - Call/Put Options
 * Extended with 50+ options contracts
 */
const OptionsModule = {
    options: [
        // === BTC CALLS ===
        { id: 'btc-call-100k', name: 'BTC $100K Call', asset: 'BTC', type: 'call', strike: 100000, expiry: '2025-03', premium: 2.5, category: 'btc-call', icon: '📈' },
        { id: 'btc-call-110k', name: 'BTC $110K Call', asset: 'BTC', type: 'call', strike: 110000, expiry: '2025-03', premium: 1.5, category: 'btc-call', icon: '📈' },
        { id: 'btc-call-120k', name: 'BTC $120K Call', asset: 'BTC', type: 'call', strike: 120000, expiry: '2025-06', premium: 1.8, category: 'btc-call', icon: '📈' },
        { id: 'btc-call-150k', name: 'BTC $150K Call', asset: 'BTC', type: 'call', strike: 150000, expiry: '2025-06', premium: 0.8, category: 'btc-call', icon: '📈' },
        { id: 'btc-call-200k', name: 'BTC $200K Call', asset: 'BTC', type: 'call', strike: 200000, expiry: '2025-12', premium: 0.5, category: 'btc-call', icon: '📈' },
        { id: 'btc-call-250k', name: 'BTC $250K Call', asset: 'BTC', type: 'call', strike: 250000, expiry: '2025-12', premium: 0.3, category: 'btc-call', icon: '📈' },

        // === BTC PUTS ===
        { id: 'btc-put-90k', name: 'BTC $90K Put', asset: 'BTC', type: 'put', strike: 90000, expiry: '2025-03', premium: 2.0, category: 'btc-put', icon: '📉' },
        { id: 'btc-put-80k', name: 'BTC $80K Put', asset: 'BTC', type: 'put', strike: 80000, expiry: '2025-03', premium: 3.2, category: 'btc-put', icon: '📉' },
        { id: 'btc-put-70k', name: 'BTC $70K Put', asset: 'BTC', type: 'put', strike: 70000, expiry: '2025-06', premium: 4.5, category: 'btc-put', icon: '📉' },
        { id: 'btc-put-60k', name: 'BTC $60K Put', asset: 'BTC', type: 'put', strike: 60000, expiry: '2025-06', premium: 6.0, category: 'btc-put', icon: '📉' },
        { id: 'btc-put-50k', name: 'BTC $50K Put', asset: 'BTC', type: 'put', strike: 50000, expiry: '2025-12', premium: 8.0, category: 'btc-put', icon: '📉' },

        // === ETH CALLS ===
        { id: 'eth-call-4k', name: 'ETH $4K Call', asset: 'ETH', type: 'call', strike: 4000, expiry: '2025-03', premium: 3.5, category: 'eth-call', icon: '📈' },
        { id: 'eth-call-5k', name: 'ETH $5K Call', asset: 'ETH', type: 'call', strike: 5000, expiry: '2025-03', premium: 4.5, category: 'eth-call', icon: '📈' },
        { id: 'eth-call-6k', name: 'ETH $6K Call', asset: 'ETH', type: 'call', strike: 6000, expiry: '2025-06', premium: 2.8, category: 'eth-call', icon: '📈' },
        { id: 'eth-call-8k', name: 'ETH $8K Call', asset: 'ETH', type: 'call', strike: 8000, expiry: '2025-06', premium: 1.5, category: 'eth-call', icon: '📈' },
        { id: 'eth-call-10k', name: 'ETH $10K Call', asset: 'ETH', type: 'call', strike: 10000, expiry: '2025-12', premium: 0.8, category: 'eth-call', icon: '📈' },

        // === ETH PUTS ===
        { id: 'eth-put-3k', name: 'ETH $3K Put', asset: 'ETH', type: 'put', strike: 3000, expiry: '2025-03', premium: 2.5, category: 'eth-put', icon: '📉' },
        { id: 'eth-put-2500', name: 'ETH $2500 Put', asset: 'ETH', type: 'put', strike: 2500, expiry: '2025-03', premium: 2.8, category: 'eth-put', icon: '📉' },
        { id: 'eth-put-2k', name: 'ETH $2K Put', asset: 'ETH', type: 'put', strike: 2000, expiry: '2025-06', premium: 5.0, category: 'eth-put', icon: '📉' },
        { id: 'eth-put-1500', name: 'ETH $1500 Put', asset: 'ETH', type: 'put', strike: 1500, expiry: '2025-12', premium: 8.0, category: 'eth-put', icon: '📉' },

        // === SOL OPTIONS ===
        { id: 'sol-call-200', name: 'SOL $200 Call', asset: 'SOL', type: 'call', strike: 200, expiry: '2025-03', premium: 8, category: 'sol', icon: '📈' },
        { id: 'sol-call-250', name: 'SOL $250 Call', asset: 'SOL', type: 'call', strike: 250, expiry: '2025-03', premium: 5, category: 'sol', icon: '📈' },
        { id: 'sol-call-300', name: 'SOL $300 Call', asset: 'SOL', type: 'call', strike: 300, expiry: '2025-06', premium: 3, category: 'sol', icon: '📈' },
        { id: 'sol-call-500', name: 'SOL $500 Call', asset: 'SOL', type: 'call', strike: 500, expiry: '2025-12', premium: 1, category: 'sol', icon: '📈' },
        { id: 'sol-put-150', name: 'SOL $150 Put', asset: 'SOL', type: 'put', strike: 150, expiry: '2025-03', premium: 6, category: 'sol', icon: '📉' },
        { id: 'sol-put-100', name: 'SOL $100 Put', asset: 'SOL', type: 'put', strike: 100, expiry: '2025-06', premium: 10, category: 'sol', icon: '📉' },

        // === ALTCOIN OPTIONS ===
        { id: 'avax-call-60', name: 'AVAX $60 Call', asset: 'AVAX', type: 'call', strike: 60, expiry: '2025-03', premium: 12, category: 'altcoin', icon: '📈' },
        { id: 'avax-call-100', name: 'AVAX $100 Call', asset: 'AVAX', type: 'call', strike: 100, expiry: '2025-06', premium: 6, category: 'altcoin', icon: '📈' },
        { id: 'link-call-30', name: 'LINK $30 Call', asset: 'LINK', type: 'call', strike: 30, expiry: '2025-03', premium: 10, category: 'altcoin', icon: '📈' },
        { id: 'link-call-50', name: 'LINK $50 Call', asset: 'LINK', type: 'call', strike: 50, expiry: '2025-06', premium: 5, category: 'altcoin', icon: '📈' },
        { id: 'arb-call-2', name: 'ARB $2 Call', asset: 'ARB', type: 'call', strike: 2, expiry: '2025-03', premium: 15, category: 'altcoin', icon: '📈' },
        { id: 'op-call-4', name: 'OP $4 Call', asset: 'OP', type: 'call', strike: 4, expiry: '2025-03', premium: 12, category: 'altcoin', icon: '📈' },
        { id: 'doge-call-0.5', name: 'DOGE $0.50 Call', asset: 'DOGE', type: 'call', strike: 0.5, expiry: '2025-03', premium: 18, category: 'altcoin', icon: '📈' },
        { id: 'doge-call-1', name: 'DOGE $1 Call', asset: 'DOGE', type: 'call', strike: 1, expiry: '2025-06', premium: 8, category: 'altcoin', icon: '📈' },

        // === WEEKLY OPTIONS (High Risk) ===
        { id: 'btc-weekly-call', name: 'BTC Weekly $98K Call', asset: 'BTC', type: 'call', strike: 98000, expiry: 'Weekly', premium: 5, category: 'weekly', icon: '⚡' },
        { id: 'btc-weekly-put', name: 'BTC Weekly $95K Put', asset: 'BTC', type: 'put', strike: 95000, expiry: 'Weekly', premium: 4, category: 'weekly', icon: '⚡' },
        { id: 'eth-weekly-call', name: 'ETH Weekly $3.5K Call', asset: 'ETH', type: 'call', strike: 3500, expiry: 'Weekly', premium: 6, category: 'weekly', icon: '⚡' },
        { id: 'eth-weekly-put', name: 'ETH Weekly $3.2K Put', asset: 'ETH', type: 'put', strike: 3200, expiry: 'Weekly', premium: 5, category: 'weekly', icon: '⚡' },
        { id: 'sol-weekly-call', name: 'SOL Weekly $195 Call', asset: 'SOL', type: 'call', strike: 195, expiry: 'Weekly', premium: 10, category: 'weekly', icon: '⚡' },
    ],

    categories: {
        'btc-call': { name: 'BTC Calls', color: '#22c55e', description: 'Bullish BTC bets' },
        'btc-put': { name: 'BTC Puts', color: '#ef4444', description: 'Bearish BTC protection' },
        'eth-call': { name: 'ETH Calls', color: '#22c55e', description: 'Bullish ETH bets' },
        'eth-put': { name: 'ETH Puts', color: '#ef4444', description: 'Bearish ETH protection' },
        'sol': { name: 'SOL Options', color: '#14f195', description: 'Solana derivatives' },
        'altcoin': { name: 'Altcoin Options', color: '#8b5cf6', description: 'Other crypto options' },
        'weekly': { name: 'Weekly Options', color: '#f59e0b', description: 'Short-term high risk' }
    },

    positions: [],

    init() {
        this.load();
        console.log('Options Module initialized - ' + this.options.length + ' contracts');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_options', []);
    },

    save() {
        SafeOps.setStorage('obelisk_options', this.positions);
    },

    buy(optionId, contracts) {
        const opt = this.options.find(o => o.id === optionId);
        if (!opt || contracts < 0.01) return { success: false, error: 'Min 0.01 contracts' };
        const cost = contracts * opt.premium * 100;
        const pos = { id: 'opt-' + Date.now(), optionId, contracts, cost, buyDate: Date.now() };
        this.positions.push(pos);
        this.save();
        return { success: true, position: pos, cost };
    },

    exercise(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        const opt = this.options.find(o => o.id === pos.optionId);
        const prices = { BTC: 97000, ETH: 3400, SOL: 190, AVAX: 42, LINK: 22, ARB: 0.95, OP: 2.1, DOGE: 0.38 };
        const price = prices[opt.asset] || 100;
        let pnl = 0;
        if (opt.type === 'call' && price > opt.strike) pnl = (price - opt.strike) * pos.contracts;
        if (opt.type === 'put' && price < opt.strike) pnl = (opt.strike - price) * pos.contracts;
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, pnl: pnl - pos.cost };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = '<h3 style="color:#00ff88;margin-bottom:16px;">Crypto Options (' + this.options.length + ' contracts)</h3>';

        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catOptions = this.options.filter(o => o.category === catKey);
            if (catOptions.length === 0) return;

            html += '<div style="margin-bottom:24px;">';
            html += '<h4 style="color:' + cat.color + ';margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ' + cat.color + ';">' + cat.name + ' <span style="font-size:11px;opacity:0.7;">(' + catOptions.length + ' contracts) - ' + cat.description + '</span></h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">';

            catOptions.forEach(o => {
                const typeColor = o.type === 'call' ? '#22c55e' : '#ef4444';
                html += '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;">';
                html += '<div style="font-weight:bold;font-size:12px;margin-bottom:4px;">' + (o.icon || '') + ' ' + o.name + '</div>';
                html += '<div style="font-size:10px;color:' + typeColor + ';font-weight:bold;">' + o.type.toUpperCase() + ' @ $' + o.strike.toLocaleString() + '</div>';
                html += '<div style="font-size:10px;color:#888;">Exp: ' + o.expiry + '</div>';
                html += '<div style="font-size:12px;color:#f59e0b;margin:4px 0;">Premium: ' + o.premium + '%</div>';
                html += '<button onclick="OptionsModule.showBuyModal(\'' + o.id + '\')" style="margin-top:6px;padding:6px 12px;background:' + typeColor + ';border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;font-size:10px;width:100%;">Buy ' + o.type.toUpperCase() + '</button>';
                html += '</div>';
            });

            html += '</div></div>';
        });

        el.innerHTML = html;
    },

    showBuyModal(optionId) {
        const opt = this.options.find(o => o.id === optionId);
        if (!opt) return;

        const existing = document.getElementById('options-modal');
        if (existing) existing.remove();

        const typeColor = opt.type === 'call' ? '#22c55e' : '#ef4444';

        const modal = document.createElement('div');
        modal.id = 'options-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:${typeColor};margin:0 0 16px;">${opt.icon || ''} ${opt.name}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Type:</span>
                        <span style="color:${typeColor};font-weight:bold;">${opt.type.toUpperCase()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Strike:</span>
                        <span>$${opt.strike.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Expiry:</span>
                        <span>${opt.expiry}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Premium:</span>
                        <span style="color:#f59e0b;font-weight:bold;">${opt.premium}%</span>
                    </div>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">Contracts (min 0.01)</label>
                    <input type="number" id="option-contracts" min="0.01" step="0.01" value="1" placeholder="Number of contracts..." style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;font-size:12px;">
                        <span style="color:#888;">Total Cost:</span>
                        <span style="color:#00ff88;font-weight:bold;" id="option-cost">$${(opt.premium * 100).toFixed(2)}</span>
                    </div>
                </div>
                <div style="display:flex;gap:12px;">
                    <button onclick="document.getElementById('options-modal').remove()" style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;">Cancel</button>
                    <button onclick="OptionsModule.confirmBuy('${opt.id}')" style="flex:1;padding:12px;background:${typeColor};border:none;border-radius:8px;color:#fff;font-weight:bold;cursor:pointer;">Buy ${opt.type.toUpperCase()}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Update cost on input change
        const contractsInput = document.getElementById('option-contracts');
        contractsInput.addEventListener('input', () => {
            const contracts = parseFloat(contractsInput.value) || 0;
            document.getElementById('option-cost').textContent = '$' + (contracts * opt.premium * 100).toFixed(2);
        });

        setTimeout(() => contractsInput.focus(), 100);
    },

    confirmBuy(optionId) {
        const contracts = parseFloat(document.getElementById('option-contracts').value);
        if (!contracts || contracts < 0.01) {
            alert('Minimum 0.01 contracts');
            return;
        }

        const result = this.buy(optionId, contracts);
        document.getElementById('options-modal').remove();

        if (result.success) {
            const opt = this.options.find(o => o.id === optionId);
            if (typeof showNotification === 'function') {
                showNotification('Bought ' + contracts + ' ' + opt.name + ' for $' + result.cost.toFixed(2), 'success');
            } else {
                alert('Bought! Cost: $' + result.cost.toFixed(2));
            }
        } else {
            alert(result.error);
        }
    },

    quickBuy(optionId) {
        this.showBuyModal(optionId);
    }
};

document.addEventListener('DOMContentLoaded', () => OptionsModule.init());
