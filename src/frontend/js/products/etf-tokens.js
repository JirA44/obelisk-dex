/**
 * ETF TOKENS MODULE - Obelisk DEX
 * Crypto ETF-like index products with automated rebalancing
 */
const ETFTokensModule = {
    items: [
        // === EXISTING ETFs ===
        { id: 'defi-blue', name: 'DeFi Blue Chip ETF', ticker: 'DEFI10', composition: ['ETH', 'BNB', 'SOL', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE', 'MKR', 'CRV'], apy: 8.5, expense: 0.5, minInvest: 50, rebalance: 'weekly', risk: 'medium', category: 'defi' },
        { id: 'btc-eco', name: 'Bitcoin Ecosystem ETF', ticker: 'BTCECO', composition: ['BTC', 'WBTC', 'STX', 'ORDI', 'RUNE'], apy: 5.2, expense: 0.3, minInvest: 100, rebalance: 'monthly', risk: 'low', category: 'bitcoin' },
        { id: 'layer1', name: 'Layer 1 Index ETF', ticker: 'L1IDX', composition: ['ETH', 'SOL', 'AVAX', 'NEAR', 'ATOM', 'DOT', 'ADA', 'SUI', 'APT', 'SEI'], apy: 12.0, expense: 0.6, minInvest: 25, rebalance: 'weekly', risk: 'medium', category: 'layer1' },
        { id: 'layer2', name: 'Layer 2 Scaling ETF', ticker: 'L2SCL', composition: ['ARB', 'OP', 'MATIC', 'IMX', 'MANTA', 'STRK'], apy: 18.5, expense: 0.8, minInvest: 25, rebalance: 'weekly', risk: 'medium-high', category: 'layer2' },
        { id: 'ai-crypto', name: 'AI & Crypto ETF', ticker: 'AICRY', composition: ['FET', 'AGIX', 'OCEAN', 'RNDR', 'TAO', 'AKT'], apy: 25.0, expense: 1.0, minInvest: 50, rebalance: 'weekly', risk: 'high', category: 'ai' },
        { id: 'gaming', name: 'Gaming & Metaverse ETF', ticker: 'GAME5', composition: ['AXS', 'SAND', 'MANA', 'GALA', 'IMX', 'ENJ', 'MAGIC'], apy: 15.0, expense: 0.7, minInvest: 25, rebalance: 'bi-weekly', risk: 'high', category: 'gaming' },
        { id: 'rwa-etf', name: 'Real World Assets ETF', ticker: 'RWATF', composition: ['ONDO', 'MKR', 'CRVUSD', 'GHO', 'FRAX'], apy: 7.5, expense: 0.4, minInvest: 100, rebalance: 'monthly', risk: 'low', category: 'rwa' },
        { id: 'yield-etf', name: 'High Yield DeFi ETF', ticker: 'HYDEF', composition: ['PENDLE', 'CVX', 'CRV', 'AURA', 'BAL', 'LDO'], apy: 35.0, expense: 1.2, minInvest: 50, rebalance: 'weekly', risk: 'high', category: 'yield' },
        { id: 'stable-etf', name: 'Stablecoin Yield ETF', ticker: 'STBYLD', composition: ['USDC', 'USDT', 'DAI', 'FRAX', 'LUSD'], apy: 6.0, expense: 0.2, minInvest: 100, rebalance: 'monthly', risk: 'very-low', category: 'stablecoins' },
        { id: 'momentum', name: 'Crypto Momentum ETF', ticker: 'CMOM', composition: ['Dynamic Top 10'], apy: 45.0, expense: 1.5, minInvest: 100, rebalance: 'daily', risk: 'very-high', category: 'momentum' },

        // === NEW ETFs (Transparence V2) ===
        {
            id: 'crypto-top10',
            name: 'Top 10 Crypto ETF',
            ticker: 'CRY10',
            icon: '🔟',
            composition: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'DOGE', 'DOT', 'LINK'],
            holdings: [
                { token: 'BTC', weight: 42 },
                { token: 'ETH', weight: 20 },
                { token: 'SOL', weight: 8 },
                { token: 'BNB', weight: 7 },
                { token: 'XRP', weight: 6 },
                { token: 'ADA', weight: 5 },
                { token: 'AVAX', weight: 4 },
                { token: 'DOGE', weight: 3 },
                { token: 'DOT', weight: 3 },
                { token: 'LINK', weight: 2 }
            ],
            apy: 10.5,
            expense: 0.30,
            minInvest: 50,
            rebalance: 'weekly',
            autoCompound: true,
            risk: 'medium',
            category: 'market-cap',
            fees: { management: 0.30, entry: 0, exit: 0, performance: 0 },
            description: 'Exposition aux 10 plus grandes cryptos par capitalisation'
        },
        {
            id: 'layer2-leaders',
            name: 'Layer 2 Leaders ETF',
            ticker: 'L2TOP',
            icon: '⚡',
            composition: ['ARB', 'OP', 'MATIC', 'STRK', 'ZK', 'MANTA'],
            holdings: [
                { token: 'ARB', weight: 30 },
                { token: 'OP', weight: 25 },
                { token: 'MATIC', weight: 20 },
                { token: 'STRK', weight: 10 },
                { token: 'ZK', weight: 10 },
                { token: 'MANTA', weight: 5 }
            ],
            apy: 18.0,
            expense: 0.50,
            minInvest: 25,
            rebalance: 'weekly',
            autoCompound: true,
            risk: 'medium-high',
            category: 'layer2',
            fees: { management: 0.50, entry: 0, exit: 0, performance: 0 },
            description: 'Les leaders du scaling Ethereum Layer 2'
        },
        {
            id: 'defi-titans',
            name: 'DeFi Titans ETF',
            ticker: 'DEFI5',
            icon: '🏛️',
            composition: ['UNI', 'AAVE', 'MKR', 'LDO', 'CRV'],
            holdings: [
                { token: 'UNI', weight: 25 },
                { token: 'AAVE', weight: 25 },
                { token: 'MKR', weight: 20 },
                { token: 'LDO', weight: 15 },
                { token: 'CRV', weight: 15 }
            ],
            apy: 15.0,
            expense: 0.45,
            minInvest: 50,
            rebalance: 'weekly',
            autoCompound: true,
            risk: 'medium',
            category: 'defi',
            fees: { management: 0.45, entry: 0, exit: 0, performance: 0 },
            description: 'Les protocoles DeFi les plus établis'
        },
        {
            id: 'ai-data-etf',
            name: 'AI & Data ETF',
            ticker: 'AIDAT',
            icon: '🤖',
            composition: ['TAO', 'FET', 'ARKM', 'OCEAN', 'RNDR'],
            holdings: [
                { token: 'TAO', weight: 30 },
                { token: 'FET', weight: 25 },
                { token: 'ARKM', weight: 15 },
                { token: 'OCEAN', weight: 15 },
                { token: 'RNDR', weight: 15 }
            ],
            apy: 25.0,
            expense: 0.75,
            minInvest: 50,
            rebalance: 'weekly',
            autoCompound: true,
            risk: 'high',
            category: 'ai',
            fees: { management: 0.75, entry: 0, exit: 0, performance: 0 },
            description: 'Intelligence artificielle et data sur blockchain'
        },
        {
            id: 'meme-index',
            name: 'Meme Index ETF',
            ticker: 'MEME5',
            icon: '🐕',
            composition: ['DOGE', 'SHIB', 'PEPE', 'WIF', 'BONK'],
            holdings: [
                { token: 'DOGE', weight: 35 },
                { token: 'SHIB', weight: 25 },
                { token: 'PEPE', weight: 20 },
                { token: 'WIF', weight: 10 },
                { token: 'BONK', weight: 10 }
            ],
            apy: 45.0,
            expense: 1.0,
            minInvest: 25,
            rebalance: 'weekly',
            autoCompound: true,
            risk: 'very-high',
            category: 'meme',
            fees: { management: 1.0, entry: 0, exit: 0, performance: 0 },
            description: '⚠️ Haute volatilité - Memecoins populaires'
        },
        {
            id: 'stablecoin-yield',
            name: 'Stablecoin Yield ETF',
            ticker: 'USDY',
            icon: '💵',
            composition: ['USDC (Aave)', 'USDT (Compound)', 'DAI (MakerDAO)'],
            holdings: [
                { token: 'USDC', weight: 40, protocol: 'Aave' },
                { token: 'USDT', weight: 30, protocol: 'Compound' },
                { token: 'DAI', weight: 30, protocol: 'MakerDAO' }
            ],
            apy: 6.0,
            expense: 0.20,
            minInvest: 100,
            rebalance: 'monthly',
            autoCompound: true,
            risk: 'very-low',
            category: 'stablecoins',
            fees: { management: 0.20, entry: 0, exit: 0, performance: 0 },
            description: 'Rendement stable sur stablecoins (protocols audités)'
        },
        {
            id: 'btc-ecosystem-v2',
            name: 'BTC Ecosystem ETF',
            ticker: 'BTCECO2',
            icon: '₿',
            composition: ['BTC', 'WBTC', 'stBTC', 'tBTC', 'SATS'],
            holdings: [
                { token: 'BTC', weight: 50 },
                { token: 'WBTC', weight: 25 },
                { token: 'stBTC', weight: 10 },
                { token: 'tBTC', weight: 10 },
                { token: 'SATS', weight: 5 }
            ],
            apy: 5.0,
            expense: 0.25,
            minInvest: 100,
            rebalance: 'monthly',
            autoCompound: true,
            risk: 'low',
            category: 'bitcoin',
            fees: { management: 0.25, entry: 0, exit: 0, performance: 0 },
            description: 'Exposition Bitcoin + wrapped + liquid staking'
        },
        {
            id: 'eth-staking',
            name: 'ETH Staking ETF',
            ticker: 'ETHSTK',
            icon: 'Ξ',
            composition: ['ETH', 'stETH', 'rETH', 'cbETH', 'frxETH'],
            holdings: [
                { token: 'ETH', weight: 30 },
                { token: 'stETH', weight: 30, protocol: 'Lido' },
                { token: 'rETH', weight: 20, protocol: 'RocketPool' },
                { token: 'cbETH', weight: 10, protocol: 'Coinbase' },
                { token: 'frxETH', weight: 10, protocol: 'Frax' }
            ],
            apy: 8.0,
            expense: 0.30,
            minInvest: 50,
            rebalance: 'weekly',
            autoCompound: true,
            risk: 'low-medium',
            category: 'staking',
            fees: { management: 0.30, entry: 0, exit: 0, performance: 0 },
            description: 'ETH + Liquid Staking Derivatives (LSDs)'
        }
    ],
    positions: [],

    init() {
        this.load();
        console.log('ETF Tokens Module initialized');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_etf_tokens', []);
    },

    save() {
        SafeOps.setStorage('obelisk_etf_tokens', this.positions);
    },

    invest(itemId, amount) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, error: 'ETF not found' };
        if (amount < item.minInvest) return { success: false, error: 'Min investment: $' + item.minInvest };

        const navPrice = this.calculateNAV(item);
        const shares = amount / navPrice;
        const annualExpense = amount * (item.expense / 100);

        const position = {
            id: 'etf-' + Date.now(),
            itemId,
            etfName: item.name,
            ticker: item.ticker,
            shares,
            avgCost: navPrice,
            totalInvested: amount,
            apy: item.apy,
            expense: item.expense,
            purchaseDate: Date.now(),
            lastRebalance: Date.now(),
            composition: item.composition,
            rebalanceFreq: item.rebalance
        };

        this.positions.push(position);
        this.save();

        if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.invest(position.id, item.name, amount, item.apy - item.expense, 'etf', true);
        }

        return { success: true, position, shares: shares.toFixed(4), navPrice: navPrice.toFixed(2) };
    },

    withdraw(posId, sharesToSell = null) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const pos = this.positions[idx];
        const item = this.items.find(i => i.id === pos.itemId);
        const currentNAV = this.calculateNAV(item);

        // Calculate gains
        const daysHeld = (Date.now() - pos.purchaseDate) / 86400000;
        const performance = (pos.apy / 100) * (daysHeld / 365);
        const adjustedNAV = currentNAV * (1 + performance);

        const sellShares = sharesToSell || pos.shares;
        if (sellShares > pos.shares) return { success: false, error: 'Not enough shares' };

        const saleValue = sellShares * adjustedNAV;
        const costBasis = sellShares * pos.avgCost;
        const gain = saleValue - costBasis;
        const expenseDeducted = saleValue * (pos.expense / 100) * (daysHeld / 365);

        if (sellShares >= pos.shares) {
            this.positions.splice(idx, 1);
        } else {
            pos.shares -= sellShares;
            pos.totalInvested -= costBasis;
        }
        this.save();

        return {
            success: true,
            sharesSold: sellShares.toFixed(4),
            saleValue: (saleValue - expenseDeducted).toFixed(2),
            gain: gain.toFixed(2),
            expenseDeducted: expenseDeducted.toFixed(2)
        };
    },

    calculateNAV(item) {
        // Simulated NAV based on composition
        const baseNAV = 100;
        const volatility = item.apy / 100 * 0.1;
        const variation = (Math.random() - 0.5) * volatility;
        return baseNAV * (1 + variation);
    },

    getPositionValue(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const item = this.items.find(i => i.id === pos.itemId);
        const currentNAV = this.calculateNAV(item);
        const daysHeld = (Date.now() - pos.purchaseDate) / 86400000;
        const performance = (pos.apy / 100) * (daysHeld / 365);
        const adjustedNAV = currentNAV * (1 + performance);
        const currentValue = pos.shares * adjustedNAV;
        const totalReturn = currentValue - pos.totalInvested;
        const returnPct = (totalReturn / pos.totalInvested) * 100;

        return {
            currentNAV: adjustedNAV.toFixed(2),
            currentValue: currentValue.toFixed(2),
            totalReturn: totalReturn.toFixed(2),
            returnPct: returnPct.toFixed(2),
            daysHeld: Math.floor(daysHeld)
        };
    },

    getTotalPortfolioValue() {
        return this.positions.reduce((sum, pos) => {
            const val = this.getPositionValue(pos.id);
            return sum + parseFloat(val.currentValue);
        }, 0);
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Crypto ETF Tokens</h3>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">' +
            this.items.map(item =>
                '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:start;">' +
                '<div><strong style="font-size:16px;">' + item.name + '</strong><br>' +
                '<span style="color:#00ff88;font-weight:bold;">' + item.ticker + '</span></div>' +
                '<span style="background:linear-gradient(135deg,#00ff88,#00aaff);color:#000;padding:4px 10px;border-radius:6px;font-weight:bold;">' + item.apy + '% APY</span>' +
                '</div>' +
                '<div style="margin:12px 0;padding:8px;background:rgba(0,0,0,0.2);border-radius:8px;">' +
                '<div style="color:#888;font-size:11px;margin-bottom:4px;">COMPOSITION:</div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:4px;">' +
                (Array.isArray(item.composition) ? item.composition.slice(0, 6).map(c =>
                    '<span style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-size:10px;">' + c + '</span>'
                ).join('') + (item.composition.length > 6 ? '<span style="color:#888;font-size:10px;">+' + (item.composition.length - 6) + '</span>' : '') : '<span style="color:#888;font-size:10px;">' + item.composition + '</span>') +
                '</div></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;color:#888;">' +
                '<span>Expense: ' + item.expense + '%</span>' +
                '<span>Rebalance: ' + item.rebalance + '</span>' +
                '</div>' +
                '<div style="color:#888;font-size:12px;margin-top:4px;">Min Investment: $' + item.minInvest + '</div>' +
                '<button onclick="ETFTokensModule.quickInvest(\'' + item.id + '\')" style="margin-top:12px;padding:10px 16px;background:linear-gradient(135deg,#00ff88,#00aaff);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;width:100%;">Invest in ' + item.ticker + '</button>' +
                '</div>'
            ).join('') +
            '</div>' +
            (this.positions.length > 0 ? this.renderPositions() : '');
    },

    renderPositions() {
        const totalValue = this.getTotalPortfolioValue();
        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Your ETF Portfolio (Total: $' + totalValue.toFixed(2) + ')</h4>' +
            '<div style="display:grid;gap:8px;">' +
            this.positions.map(pos => {
                const val = this.getPositionValue(pos.id);
                const isPositive = parseFloat(val.totalReturn) >= 0;
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<div>' +
                    '<strong>' + pos.ticker + '</strong> - ' + pos.etfName + '<br>' +
                    '<span style="color:#888;font-size:12px;">' + pos.shares.toFixed(4) + ' shares @ $' + pos.avgCost.toFixed(2) + ' avg</span>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                    '<span style="font-size:18px;font-weight:bold;">$' + val.currentValue + '</span><br>' +
                    '<span style="color:' + (isPositive ? '#00ff88' : '#ff4466') + ';font-size:12px;">' + (isPositive ? '+' : '') + val.totalReturn + ' (' + (isPositive ? '+' : '') + val.returnPct + '%)</span>' +
                    '</div></div>' +
                    '<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">' +
                    '<span style="color:#888;font-size:11px;">NAV: $' + val.currentNAV + ' | Held: ' + val.daysHeld + ' days</span>' +
                    '<div style="display:flex;gap:6px;">' +
                    '<button onclick="ETFTokensModule.quickInvest(\'' + pos.itemId + '\')" style="padding:4px 10px;background:#00aaff;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">Add</button>' +
                    '<button onclick="ETFTokensModule.quickSell(\'' + pos.id + '\')" style="padding:4px 10px;background:#ff4466;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">Sell</button>' +
                    '</div></div></div>';
            }).join('') +
            '</div>';
    },

    quickInvest(itemId) {
        const item = this.items.find(i => i.id === itemId);
        const amount = SafeOps.promptNumber('Investment amount USD (min $' + item.minInvest + '):', 0, item.minInvest);
        if (!amount) return;

        const result = this.invest(itemId, amount);
        alert(result.success ? 'Invested $' + amount + '! Received ' + result.shares + ' shares of ' + item.ticker + ' at NAV $' + result.navPrice : result.error);
        if (result.success) this.render('etf-tokens-container');
    },

    quickSell(posId) {
        const pos = this.positions.find(p => p.id === posId);
        const sellAll = confirm('Sell all ' + pos.shares.toFixed(4) + ' shares? (Cancel to specify amount)');

        let sharesToSell = null;
        if (!sellAll) {
            sharesToSell = SafeOps.promptNumber('Shares to sell (max ' + pos.shares.toFixed(4) + '):', 0, 0.0001, pos.shares);
            if (!sharesToSell) return;
        }

        const result = this.withdraw(posId, sharesToSell);
        alert(result.success ? 'Sold ' + result.sharesSold + ' shares for $' + result.saleValue + ' (Gain: $' + result.gain + ')' : result.error);
        this.render('etf-tokens-container');
    }
};

document.addEventListener('DOMContentLoaded', () => ETFTokensModule.init());
