/**
 * STRUCTURED PRODUCTS MODULE - Complex Financial Products
 */
const StructuredModule = {
    products: [
        // === Principal Protected Notes ===
        { id: 'btc-shark-fin', name: 'BTC Shark Fin', type: 'principal-protected', baseAPY: 5, bonusAPY: 50, knockoutPrice: 110000, duration: 30, minInvest: 1000, description: 'Capital protected + bonus if BTC stays below knockout' },
        { id: 'eth-shark-fin', name: 'ETH Shark Fin', type: 'principal-protected', baseAPY: 4, bonusAPY: 45, knockoutPrice: 4500, duration: 30, minInvest: 500, description: 'Capital protected + bonus if ETH stays below knockout' },
        { id: 'sol-shark-fin', name: 'SOL Shark Fin', type: 'principal-protected', baseAPY: 6, bonusAPY: 60, knockoutPrice: 300, duration: 14, minInvest: 250, description: 'Capital protected + bonus if SOL stays below knockout' },
        { id: 'btc-ppn-bullish', name: 'BTC Principal Protected (Bullish)', type: 'principal-protected', baseAPY: 2, bonusAPY: 80, knockoutPrice: 120000, duration: 60, minInvest: 2000, description: '100% capital protection + 80% upside participation' },
        { id: 'eth-ppn-bearish', name: 'ETH Principal Protected (Bearish)', type: 'principal-protected', baseAPY: 3, bonusAPY: 40, knockoutPrice: 2800, direction: 'bearish', duration: 30, minInvest: 1000, description: 'Capital protected + bonus if ETH drops' },

        // === Dual Currency Products ===
        { id: 'eth-dual-invest', name: 'ETH Dual Investment', type: 'dual-currency', baseAPY: 15, strikePrice: 3500, duration: 7, minInvest: 500, description: 'High yield, may receive ETH or USDC at maturity' },
        { id: 'btc-dual-invest', name: 'BTC Dual Investment', type: 'dual-currency', baseAPY: 12, strikePrice: 100000, duration: 7, minInvest: 1000, description: 'High yield, may receive BTC or USDC at maturity' },
        { id: 'sol-dual-invest', name: 'SOL Dual Investment', type: 'dual-currency', baseAPY: 25, strikePrice: 250, duration: 3, minInvest: 200, description: 'High yield, may receive SOL or USDC at maturity' },
        { id: 'arb-dual-invest', name: 'ARB Dual Investment', type: 'dual-currency', baseAPY: 35, strikePrice: 1.5, duration: 7, minInvest: 100, description: 'High yield, may receive ARB or USDC at maturity' },
        { id: 'link-dual-invest', name: 'LINK Dual Investment', type: 'dual-currency', baseAPY: 28, strikePrice: 25, duration: 7, minInvest: 150, description: 'High yield, may receive LINK or USDC at maturity' },

        // === Accumulator Products ===
        { id: 'btc-accumulator', name: 'BTC Accumulator', type: 'accumulator', baseAPY: 8, discountRate: 5, knockoutLevel: 1.1, duration: 30, minInvest: 2000, description: 'DCA with 5% discount, auto-knockout at +10%' },
        { id: 'eth-accumulator', name: 'ETH Accumulator', type: 'accumulator', baseAPY: 10, discountRate: 7, knockoutLevel: 1.15, duration: 30, minInvest: 1000, description: 'DCA with 7% discount, auto-knockout at +15%' },
        { id: 'sol-accumulator', name: 'SOL Accumulator', type: 'accumulator', baseAPY: 15, discountRate: 10, knockoutLevel: 1.2, duration: 14, minInvest: 500, description: 'DCA with 10% discount, auto-knockout at +20%' },
        { id: 'multi-accumulator', name: 'Multi-Asset Accumulator', type: 'accumulator', assets: ['BTC', 'ETH', 'SOL'], baseAPY: 12, discountRate: 8, knockoutLevel: 1.12, duration: 30, minInvest: 1500, description: 'Diversified DCA with 8% discount' },

        // === Autocallables & Snowballs ===
        { id: 'btc-snowball', name: 'BTC Snowball', type: 'autocall', baseAPY: 25, knockinLevel: 0.7, knockoutLevel: 1.05, duration: 90, minInvest: 5000, description: 'High yield autocallable with knock-in protection' },
        { id: 'eth-snowball', name: 'ETH Snowball', type: 'autocall', baseAPY: 30, knockinLevel: 0.65, knockoutLevel: 1.08, duration: 60, minInvest: 3000, description: 'High yield autocallable with knock-in protection' },
        { id: 'crypto-phoenix', name: 'Crypto Phoenix', type: 'autocall', baseAPY: 35, knockinLevel: 0.6, knockoutLevel: 1.1, duration: 90, minInvest: 5000, couponFreq: 'monthly', description: 'Monthly coupons + autocall feature' },

        // === Range Products ===
        { id: 'range-accrual', name: 'BTC Range Accrual', type: 'range', baseAPY: 30, lowerBound: 85000, upperBound: 100000, duration: 14, minInvest: 1000, description: 'Earn yield while BTC stays in range' },
        { id: 'eth-range-accrual', name: 'ETH Range Accrual', type: 'range', baseAPY: 35, lowerBound: 3200, upperBound: 4000, duration: 14, minInvest: 500, description: 'Earn yield while ETH stays in range' },
        { id: 'btc-digital-range', name: 'BTC Digital Range', type: 'range', baseAPY: 45, lowerBound: 90000, upperBound: 105000, duration: 7, minInvest: 1000, description: 'All-or-nothing: max yield if BTC in range at expiry' },

        // === Twin Win & Bonus Products ===
        { id: 'eth-twin-win', name: 'ETH Twin Win', type: 'twin-win', baseAPY: 20, barrier: 0.8, duration: 30, minInvest: 2000, description: 'Profit from both up and down moves' },
        { id: 'btc-twin-win', name: 'BTC Twin Win', type: 'twin-win', baseAPY: 18, barrier: 0.75, duration: 30, minInvest: 3000, description: 'Profit from both up and down moves' },
        { id: 'btc-bonus-cert', name: 'BTC Bonus Certificate', type: 'bonus', baseAPY: 0, bonusLevel: 1.15, barrierLevel: 0.7, duration: 60, minInvest: 2000, description: '15% bonus if barrier not breached' },

        // === Basket & Multi-Asset Products ===
        { id: 'multi-asset', name: 'Crypto Basket Note', type: 'basket', assets: ['BTC', 'ETH', 'SOL'], baseAPY: 12, duration: 60, minInvest: 500, description: 'Diversified exposure to top 3 cryptos' },
        { id: 'defi-basket', name: 'DeFi Leaders Basket', type: 'basket', assets: ['AAVE', 'UNI', 'MKR', 'CRV'], baseAPY: 18, duration: 30, minInvest: 500, description: 'Diversified DeFi blue-chip exposure' },
        { id: 'l2-basket', name: 'L2 Ecosystem Basket', type: 'basket', assets: ['ARB', 'OP', 'STRK', 'MANTA'], baseAPY: 22, duration: 30, minInvest: 300, description: 'Layer 2 ecosystem exposure' },
        { id: 'ai-basket', name: 'AI Tokens Basket', type: 'basket', assets: ['FET', 'RENDER', 'TAO', 'ARKM', 'WLD'], baseAPY: 28, duration: 30, minInvest: 250, description: 'AI & compute tokens exposure' },

        // === Yield Enhancement Products ===
        { id: 'btc-reverse-conv', name: 'BTC Reverse Convertible', type: 'reverse-convertible', baseAPY: 40, strikePrice: 90000, duration: 14, minInvest: 2000, description: 'High yield, may receive BTC if price drops' },
        { id: 'eth-reverse-conv', name: 'ETH Reverse Convertible', type: 'reverse-convertible', baseAPY: 45, strikePrice: 3200, duration: 14, minInvest: 1000, description: 'High yield, may receive ETH if price drops' },
        { id: 'stablecoin-boost', name: 'Stablecoin Yield Boost', type: 'yield-boost', baseAPY: 15, underlyingAsset: 'USDC', strategy: 'covered-call', duration: 7, minInvest: 500, description: 'Enhanced stablecoin yield via options' }
    ],
    positions: [],
    init() { this.load(); console.log('Structured Products initialized'); },
    load() { this.positions = SafeOps.getStorage('obelisk_structured', []); },
    save() { SafeOps.setStorage('obelisk_structured', this.positions); },
    invest(productId, amount) {
        const prod = this.products.find(p => p.id === productId);
        if (!prod) return { success: false, error: 'Product not found' };
        if (amount < prod.minInvest) return { success: false, error: 'Min: $' + prod.minInvest };
        const pos = { id: 'str-' + Date.now(), productId, amount, startDate: Date.now(), maturityDate: Date.now() + prod.duration * 86400000, baseAPY: prod.baseAPY };
        this.positions.push(pos);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(pos.id, prod.name, amount, prod.baseAPY, 'structured', true);
        return { success: true, position: pos };
    },
    redeem(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        if (Date.now() < pos.maturityDate) return { success: false, error: 'Not matured yet' };
        const prod = this.products.find(p => p.id === pos.productId);
        const days = (Date.now() - pos.startDate) / 86400000;
        const returns = pos.amount * (pos.baseAPY / 100) * (days / 365);
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, principal: pos.amount, returns };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Structured Products</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.products.map(p => 
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + p.name + '</strong><br>Type: ' + p.type + '<br>Base APY: ' + p.baseAPY + '%' + (p.bonusAPY ? ' (up to ' + p.bonusAPY + '%)' : '') + '<br>Duration: ' + p.duration + ' days<br>Min: $' + p.minInvest + '<br><button onclick="StructuredModule.quickInvest(\'' + p.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Invest</button></div>'
        ).join('') + '</div>';
    },
    quickInvest(productId) {
        const prod = this.products.find(p => p.id === productId);
        const amount = parseFloat(prompt('Amount (min $' + prod.minInvest + '):'));
        if (amount !== null && amount > 0) { const r = this.invest(productId, amount); alert(r.success ? 'Invested!' : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => StructuredModule.init());
