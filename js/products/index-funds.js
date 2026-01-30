/**
 * INDEX FUNDS MODULE - Crypto Index Investing
 */
const IndexFundsModule = {
    funds: [
        // === TOP MARKET CAP INDEXES ===
        { id: 'top-3', name: '🥇 Crypto Top 3', ticker: 'TOP3', assets: ['BTC', 'ETH', 'BNB'], apy: 6, fee: 0.15, tvl: 2500000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-4', name: '🏆 Crypto Top 4', ticker: 'TOP4', assets: ['BTC', 'ETH', 'BNB', 'SOL'], apy: 7, fee: 0.18, tvl: 2200000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-5', name: '⭐ Crypto Top 5', ticker: 'TOP5', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'], apy: 8, fee: 0.2, tvl: 2000000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-6', name: '💎 Crypto Top 6', ticker: 'TOP6', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA'], apy: 8.5, fee: 0.22, tvl: 1800000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-7', name: '🔷 Crypto Top 7', ticker: 'TOP7', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE'], apy: 9, fee: 0.25, tvl: 1600000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-8', name: '🌟 Crypto Top 8', ticker: 'TOP8', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX'], apy: 9.5, fee: 0.28, tvl: 1400000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-9', name: '💫 Crypto Top 9', ticker: 'TOP9', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT'], apy: 10, fee: 0.3, tvl: 1200000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-10', name: '🔟 Crypto Top 10', ticker: 'TOP10', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK'], apy: 10.5, fee: 0.3, tvl: 1000000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-12', name: '🚀 Crypto Top 12', ticker: 'TOP12', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI'], apy: 11, fee: 0.35, tvl: 900000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-15', name: '🎯 Crypto Top 15', ticker: 'TOP15', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC', 'ETC'], apy: 12, fee: 0.4, tvl: 800000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-16', name: '🌐 Crypto Top 16', ticker: 'TOP16', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC', 'ETC', 'XLM'], apy: 12.5, fee: 0.42, tvl: 750000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-18', name: '📈 Crypto Top 18', ticker: 'TOP18', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC', 'ETC', 'XLM', 'NEAR', 'ICP'], apy: 13, fee: 0.45, tvl: 700000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-20', name: '🏅 Crypto Top 20', ticker: 'TOP20', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC', 'ETC', 'XLM', 'NEAR', 'ICP', 'APT', 'FIL'], apy: 14, fee: 0.5, tvl: 650000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-25', name: '💰 Crypto Top 25', ticker: 'TOP25', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC', 'ETC', 'XLM', 'NEAR', 'ICP', 'APT', 'FIL', 'ARB', 'OP', 'VET', 'HBAR', 'ALGO'], apy: 15, fee: 0.55, tvl: 550000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-30', name: '🌍 Crypto Top 30', ticker: 'TOP30', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC', 'ETC', 'XLM', 'NEAR', 'ICP', 'APT', 'FIL', 'ARB', 'OP', 'VET', 'HBAR', 'ALGO', 'QNT', 'AAVE', 'MKR', 'GRT', 'SNX'], apy: 16, fee: 0.6, tvl: 450000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-50', name: '🌟 Crypto Top 50', ticker: 'TOP50', assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', '+40 more'], apy: 18, fee: 0.7, tvl: 350000000, minInvest: 50, category: 'market-cap' },
        { id: 'top-100', name: '🎖️ Crypto Top 100', ticker: 'TOP100', assets: ['Top 100 by market cap'], apy: 20, fee: 0.8, tvl: 250000000, minInvest: 25, category: 'market-cap' },

        // === SECTOR INDEXES ===
        { id: 'defi-10', name: '🏦 DeFi Top 10', ticker: 'DFI10', assets: ['UNI', 'AAVE', 'MKR', 'CRV', 'COMP', 'SNX', 'YFI', 'SUSHI', 'LDO', 'GMX'], apy: 12, fee: 0.5, tvl: 150000000, minInvest: 100, category: 'sector' },
        { id: 'layer1-5', name: '⛓️ Layer 1 Top 5', ticker: 'L1-5', assets: ['ETH', 'SOL', 'AVAX', 'ADA', 'DOT'], apy: 10, fee: 0.3, tvl: 500000000, minInvest: 50, category: 'sector' },
        { id: 'layer2-5', name: '🔗 Layer 2 Top 5', ticker: 'L2-5', assets: ['ARB', 'OP', 'MATIC', 'IMX', 'METIS'], apy: 15, fee: 0.4, tvl: 200000000, minInvest: 50, category: 'sector' },
        { id: 'ai-crypto', name: '🤖 AI & Data Index', ticker: 'AIDX', assets: ['FET', 'AGIX', 'OCEAN', 'GRT', 'RNDR', 'TAO', 'ARKM'], apy: 25, fee: 1.0, tvl: 80000000, minInvest: 50, category: 'sector' },
        { id: 'gaming', name: '🎮 GameFi Index', ticker: 'GAMI', assets: ['AXS', 'IMX', 'GALA', 'MAGIC', 'PRIME', 'BEAM'], apy: 18, fee: 0.8, tvl: 60000000, minInvest: 25, category: 'sector' },
        { id: 'metaverse', name: '🌐 Metaverse Index', ticker: 'MVI', assets: ['MANA', 'SAND', 'AXS', 'ENJ', 'GALA', 'HIGH'], apy: 15, fee: 0.8, tvl: 25000000, minInvest: 25, category: 'sector' },
        { id: 'privacy', name: '🔒 Privacy Coins', ticker: 'PRIV', assets: ['XMR', 'ZEC', 'SCRT', 'DUSK', 'ROSE'], apy: 8, fee: 0.5, tvl: 30000000, minInvest: 100, category: 'sector' },
        { id: 'rwa-index', name: '🏢 Real World Assets', ticker: 'RWAI', assets: ['ONDO', 'MPL', 'CFG', 'GFI', 'CPOOL'], apy: 10, fee: 0.6, tvl: 200000000, minInvest: 500, category: 'sector' },
        { id: 'meme-index', name: '🐕 Meme Index', ticker: 'MEME', assets: ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF'], apy: 30, fee: 1.5, tvl: 100000000, minInvest: 10, category: 'sector' },
        { id: 'oracle', name: '🔮 Oracle Index', ticker: 'ORCL', assets: ['LINK', 'BAND', 'API3', 'DIA', 'PYTH'], apy: 12, fee: 0.5, tvl: 120000000, minInvest: 50, category: 'sector' },
        { id: 'storage', name: '💾 Storage Index', ticker: 'STOR', assets: ['FIL', 'AR', 'STORJ', 'BTT', 'SC'], apy: 14, fee: 0.6, tvl: 80000000, minInvest: 50, category: 'sector' },

        // === STRATEGY INDEXES ===
        { id: 'blue-chip', name: '💎 Blue Chip', ticker: 'BLUE', assets: ['BTC', 'ETH'], weights: [60, 40], apy: 5, fee: 0.2, tvl: 1000000000, minInvest: 100, category: 'strategy' },
        { id: 'yield-kings', name: '👑 Yield Kings', ticker: 'YIELD', assets: ['LDO', 'RPL', 'FXS', 'CVX', 'AURA'], apy: 22, fee: 0.8, tvl: 150000000, minInvest: 100, category: 'strategy' },
        { id: 'momentum', name: '📈 Momentum Play', ticker: 'MOMO', assets: ['Dynamic - Top performers'], apy: 35, fee: 1.2, tvl: 50000000, minInvest: 100, category: 'strategy' },
        { id: 'stablecoin', name: '💵 Stablecoin Yield', ticker: 'STBL', assets: ['USDC', 'USDT', 'DAI', 'FRAX'], apy: 8, fee: 0.1, tvl: 500000000, minInvest: 100, category: 'strategy' }
    ],
    holdings: [],
    init() { this.load(); console.log('Index Funds initialized'); },
    load() { this.holdings = SafeOps.getStorage('obelisk_indexfunds', []); },
    save() { SafeOps.setStorage('obelisk_indexfunds', this.holdings); },
    invest(fundId, amount) {
        const fund = this.funds.find(f => f.id === fundId);
        if (!fund) return { success: false, error: 'Fund not found' };
        if (amount < fund.minInvest) return { success: false, error: 'Min: $' + fund.minInvest };
        const shares = amount / this.getSharePrice(fundId);
        const holding = { id: 'idx-' + Date.now(), fundId, ticker: fund.ticker, amount, shares, buyDate: Date.now(), apy: fund.apy };
        this.holdings.push(holding);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(holding.id, fund.name, amount, fund.apy, 'index', true);
        return { success: true, holding, shares };
    },
    redeem(holdingId) {
        const idx = this.holdings.findIndex(h => h.id === holdingId);
        if (idx === -1) return { success: false };
        const holding = this.holdings[idx];
        const fund = this.funds.find(f => f.id === holding.fundId);
        const days = (Date.now() - holding.buyDate) / 86400000;
        const returns = holding.amount * (holding.apy / 100) * (days / 365);
        const fee = holding.amount * (fund.fee / 100);
        this.holdings.splice(idx, 1);
        this.save();
        return { success: true, principal: holding.amount, returns, fee, net: holding.amount + returns - fee };
    },
    getSharePrice(fundId) { return 100 + Math.random() * 10; },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const categories = {
            'market-cap': { title: '📊 Top Market Cap Indexes', color: '#00d4aa' },
            'sector': { title: '🏭 Sector Indexes', color: '#a855f7' },
            'strategy': { title: '📈 Strategy Indexes', color: '#f59e0b' }
        };

        let html = '<h3 style="color:#00ff88;margin-bottom:16px;">🏛️ Index Funds ('+this.funds.length+' available)</h3>';

        for (const [catId, catInfo] of Object.entries(categories)) {
            const catFunds = this.funds.filter(f => f.category === catId);
            if (catFunds.length === 0) continue;

            html += `<h4 style="color:${catInfo.color};margin:20px 0 12px;border-bottom:1px solid ${catInfo.color}33;padding-bottom:8px;">${catInfo.title}</h4>`;
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:20px;">';

            for (const f of catFunds) {
                const assetsDisplay = Array.isArray(f.assets) ? f.assets.slice(0, 4).join(', ') + (f.assets.length > 4 ? '...' : '') : f.assets;
                html += `
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;transition:all 0.3s;"
                         onmouseover="this.style.borderColor='${catInfo.color}';this.style.transform='translateY(-2px)'"
                         onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.transform='translateY(0)'">
                        <div style="font-weight:600;color:#fff;margin-bottom:6px;">${f.name}</div>
                        <div style="font-size:11px;color:#888;margin-bottom:8px;">$${f.ticker} • ${assetsDisplay}</div>
                        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px;">
                            <span style="color:#00ff88;">APY ${f.apy}%</span>
                            <span style="color:#888;">Fee ${f.fee}%</span>
                        </div>
                        <div style="font-size:10px;color:#666;margin-bottom:8px;">TVL: $${(f.tvl/1000000).toFixed(0)}M • Min: $${f.minInvest}</div>
                        <button onclick="IndexFundsModule.showInvestModal('${f.id}')" style="width:100%;padding:8px;background:linear-gradient(135deg,${catInfo.color},${catInfo.color}88);border:none;border-radius:6px;color:#000;font-weight:600;cursor:pointer;font-size:11px;">Invest</button>
                    </div>`;
            }
            html += '</div>';
        }

        el.innerHTML = html;
    },

    showInvestModal(fundId) {
        const fund = this.funds.find(f => f.id === fundId);
        if (!fund) return;

        // Remove existing modal
        const existing = document.getElementById('index-invest-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'index-invest-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#1a1a2e,#0d0d1a);border:1px solid #333;border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#fff;margin:0;">Invest in ${fund.name}</h3>
                    <button onclick="document.getElementById('index-invest-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">&times;</button>
                </div>
                <div style="background:rgba(0,255,136,0.1);border-radius:10px;padding:12px;margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Ticker</span><span style="color:#00d4aa;font-weight:600;">$${fund.ticker}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">APY</span><span style="color:#00ff88;font-weight:600;">${fund.apy}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Fee</span><span style="color:#f59e0b;">${fund.fee}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#888;">Min Investment</span><span style="color:#fff;">$${fund.minInvest}</span>
                    </div>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="color:#888;font-size:12px;display:block;margin-bottom:6px;">Amount (USD)</label>
                    <input type="number" id="index-invest-amount" min="${fund.minInvest}" value="${fund.minInvest}"
                           style="width:100%;padding:12px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#fff;font-size:16px;box-sizing:border-box;"
                           oninput="document.getElementById('index-est-return').textContent = '$' + (parseFloat(this.value||0) * ${fund.apy} / 100).toFixed(2)">
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;margin-bottom:16px;display:flex;justify-content:space-between;">
                    <span style="color:#888;">Est. Yearly Return</span>
                    <span id="index-est-return" style="color:#00ff88;font-weight:600;">$${(fund.minInvest * fund.apy / 100).toFixed(2)}</span>
                </div>
                <div style="display:flex;gap:10px;">
                    <button onclick="document.getElementById('index-invest-modal').remove()"
                            style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;cursor:pointer;">Cancel</button>
                    <button onclick="IndexFundsModule.confirmInvest('${fund.id}')"
                            style="flex:2;padding:12px;background:linear-gradient(135deg,#00ff88,#00d4aa);border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">Invest Now</button>
                </div>
            </div>`;

        document.body.appendChild(modal);
    },

    confirmInvest(fundId) {
        const amount = parseFloat(document.getElementById('index-invest-amount').value);
        const fund = this.funds.find(f => f.id === fundId);

        if (!amount || amount < fund.minInvest) {
            if (typeof showNotification === 'function') {
                showNotification('Minimum investment: $' + fund.minInvest, 'error');
            } else {
                alert('Minimum: $' + fund.minInvest);
            }
            return;
        }

        const result = this.invest(fundId, amount);
        document.getElementById('index-invest-modal').remove();

        if (result.success) {
            if (typeof showNotification === 'function') {
                showNotification('Invested $' + amount + ' in ' + fund.name + '!', 'success');
            } else {
                alert('Invested $' + amount + ' in ' + fund.name + '!');
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification(result.error, 'error');
            } else {
                alert(result.error);
            }
        }
    },

    quickInvest(fundId) {
        this.showInvestModal(fundId);
    }
};
document.addEventListener('DOMContentLoaded', () => IndexFundsModule.init());
