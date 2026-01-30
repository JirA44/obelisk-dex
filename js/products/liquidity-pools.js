/**
 * LIQUIDITY POOLS MODULE - Obelisk DEX
 * Extended with 50+ pools across multiple DEXs
 */
const LiquidityPoolsModule = {
    pools: [
        // === STABLECOIN POOLS (Lowest IL Risk) ===
        { id: 'stable-3pool', name: 'USDC/USDT/DAI', tokens: ['USDC', 'USDT', 'DAI'], apy: 8, tvl: 500000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'stable', icon: '💵' },
        { id: 'frax-usdc', name: 'FRAX/USDC', tokens: ['FRAX', 'USDC'], apy: 12, tvl: 150000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'stable', icon: '💵' },
        { id: 'lusd-3crv', name: 'LUSD/3CRV', tokens: ['LUSD', '3CRV'], apy: 10, tvl: 80000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'stable', icon: '💵' },
        { id: 'gho-usdc', name: 'GHO/USDC', tokens: ['GHO', 'USDC'], apy: 14, tvl: 60000000, fee: 0.04, risk: 'low', dex: 'Balancer', category: 'stable', icon: '💵' },
        { id: 'crvusd-usdc', name: 'crvUSD/USDC', tokens: ['crvUSD', 'USDC'], apy: 15, tvl: 120000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'stable', icon: '💵' },
        { id: 'usde-usdc', name: 'USDe/USDC', tokens: ['USDe', 'USDC'], apy: 25, tvl: 200000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'stable', icon: '💵' },
        { id: 'pyusd-usdc', name: 'PYUSD/USDC', tokens: ['PYUSD', 'USDC'], apy: 9, tvl: 40000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'stable', icon: '💵' },

        // === ETH PAIRS ===
        { id: 'eth-usdc', name: 'ETH/USDC', tokens: ['ETH', 'USDC'], apy: 25, tvl: 150000000, fee: 0.3, risk: 'medium', dex: 'Uniswap V3', category: 'eth', icon: '⟠' },
        { id: 'eth-usdt', name: 'ETH/USDT', tokens: ['ETH', 'USDT'], apy: 22, tvl: 120000000, fee: 0.3, risk: 'medium', dex: 'Uniswap V3', category: 'eth', icon: '⟠' },
        { id: 'eth-dai', name: 'ETH/DAI', tokens: ['ETH', 'DAI'], apy: 20, tvl: 80000000, fee: 0.3, risk: 'medium', dex: 'Uniswap V3', category: 'eth', icon: '⟠' },
        { id: 'wsteth-eth', name: 'wstETH/ETH', tokens: ['wstETH', 'ETH'], apy: 6, tvl: 300000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'eth', icon: '⟠' },
        { id: 'reth-eth', name: 'rETH/ETH', tokens: ['rETH', 'ETH'], apy: 5, tvl: 200000000, fee: 0.04, risk: 'low', dex: 'Balancer', category: 'eth', icon: '⟠' },
        { id: 'cbeth-eth', name: 'cbETH/ETH', tokens: ['cbETH', 'ETH'], apy: 5.5, tvl: 150000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'eth', icon: '⟠' },

        // === BTC PAIRS ===
        { id: 'btc-eth', name: 'WBTC/ETH', tokens: ['WBTC', 'ETH'], apy: 18, tvl: 250000000, fee: 0.3, risk: 'medium', dex: 'Uniswap V3', category: 'btc', icon: '₿' },
        { id: 'btc-usdc', name: 'WBTC/USDC', tokens: ['WBTC', 'USDC'], apy: 15, tvl: 180000000, fee: 0.3, risk: 'medium', dex: 'Uniswap V3', category: 'btc', icon: '₿' },
        { id: 'tbtc-wbtc', name: 'tBTC/WBTC', tokens: ['tBTC', 'WBTC'], apy: 8, tvl: 50000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'btc', icon: '₿' },
        { id: 'cbbtc-wbtc', name: 'cbBTC/WBTC', tokens: ['cbBTC', 'WBTC'], apy: 6, tvl: 80000000, fee: 0.04, risk: 'low', dex: 'Curve', category: 'btc', icon: '₿' },

        // === ARBITRUM DEX POOLS ===
        { id: 'arb-eth', name: 'ARB/ETH', tokens: ['ARB', 'ETH'], apy: 45, tvl: 30000000, fee: 0.3, risk: 'high', dex: 'Camelot', category: 'arbitrum', icon: '🔷' },
        { id: 'arb-usdc', name: 'ARB/USDC', tokens: ['ARB', 'USDC'], apy: 40, tvl: 25000000, fee: 0.3, risk: 'high', dex: 'Uniswap V3', category: 'arbitrum', icon: '🔷' },
        { id: 'gmx-eth', name: 'GMX/ETH', tokens: ['GMX', 'ETH'], apy: 35, tvl: 20000000, fee: 0.3, risk: 'high', dex: 'Camelot', category: 'arbitrum', icon: '🟦' },
        { id: 'grail-eth', name: 'GRAIL/ETH', tokens: ['GRAIL', 'ETH'], apy: 80, tvl: 8000000, fee: 0.3, risk: 'high', dex: 'Camelot', category: 'arbitrum', icon: '⚔️' },
        { id: 'rdnt-eth', name: 'RDNT/ETH', tokens: ['RDNT', 'ETH'], apy: 50, tvl: 15000000, fee: 0.3, risk: 'high', dex: 'Camelot', category: 'arbitrum', icon: '✨' },
        { id: 'pendle-eth', name: 'PENDLE/ETH', tokens: ['PENDLE', 'ETH'], apy: 55, tvl: 12000000, fee: 0.3, risk: 'high', dex: 'Camelot', category: 'arbitrum', icon: '⚡' },

        // === OPTIMISM DEX POOLS ===
        { id: 'op-eth', name: 'OP/ETH', tokens: ['OP', 'ETH'], apy: 38, tvl: 40000000, fee: 0.3, risk: 'high', dex: 'Velodrome', category: 'optimism', icon: '🔴' },
        { id: 'op-usdc', name: 'OP/USDC', tokens: ['OP', 'USDC'], apy: 35, tvl: 30000000, fee: 0.3, risk: 'high', dex: 'Velodrome', category: 'optimism', icon: '🔴' },
        { id: 'velo-eth', name: 'VELO/ETH', tokens: ['VELO', 'ETH'], apy: 60, tvl: 15000000, fee: 0.3, risk: 'high', dex: 'Velodrome', category: 'optimism', icon: '🚴' },
        { id: 'snx-eth', name: 'SNX/ETH', tokens: ['SNX', 'ETH'], apy: 30, tvl: 25000000, fee: 0.3, risk: 'medium', dex: 'Velodrome', category: 'optimism', icon: '🟣' },

        // === SOLANA POOLS ===
        { id: 'sol-usdc', name: 'SOL/USDC', tokens: ['SOL', 'USDC'], apy: 35, tvl: 80000000, fee: 0.25, risk: 'high', dex: 'Orca', category: 'solana', icon: '◎' },
        { id: 'sol-usdt', name: 'SOL/USDT', tokens: ['SOL', 'USDT'], apy: 32, tvl: 60000000, fee: 0.25, risk: 'high', dex: 'Raydium', category: 'solana', icon: '◎' },
        { id: 'msol-sol', name: 'mSOL/SOL', tokens: ['mSOL', 'SOL'], apy: 8, tvl: 150000000, fee: 0.04, risk: 'low', dex: 'Orca', category: 'solana', icon: '◎' },
        { id: 'jitosol-sol', name: 'jitoSOL/SOL', tokens: ['jitoSOL', 'SOL'], apy: 9, tvl: 120000000, fee: 0.04, risk: 'low', dex: 'Orca', category: 'solana', icon: '◎' },
        { id: 'jup-sol', name: 'JUP/SOL', tokens: ['JUP', 'SOL'], apy: 50, tvl: 40000000, fee: 0.25, risk: 'high', dex: 'Orca', category: 'solana', icon: '🪐' },
        { id: 'bonk-sol', name: 'BONK/SOL', tokens: ['BONK', 'SOL'], apy: 120, tvl: 20000000, fee: 0.25, risk: 'extreme', dex: 'Raydium', category: 'solana', icon: '🐕' },
        { id: 'wif-sol', name: 'WIF/SOL', tokens: ['WIF', 'SOL'], apy: 150, tvl: 15000000, fee: 0.25, risk: 'extreme', dex: 'Raydium', category: 'solana', icon: '🐶' },

        // === DEFI GOVERNANCE ===
        { id: 'crv-eth', name: 'CRV/ETH', tokens: ['CRV', 'ETH'], apy: 28, tvl: 40000000, fee: 0.3, risk: 'medium', dex: 'Curve', category: 'defi', icon: '🔵' },
        { id: 'aave-eth', name: 'AAVE/ETH', tokens: ['AAVE', 'ETH'], apy: 15, tvl: 50000000, fee: 0.3, risk: 'medium', dex: 'Balancer', category: 'defi', icon: '👻' },
        { id: 'uni-eth', name: 'UNI/ETH', tokens: ['UNI', 'ETH'], apy: 18, tvl: 60000000, fee: 0.3, risk: 'medium', dex: 'Uniswap V3', category: 'defi', icon: '🦄' },
        { id: 'link-eth', name: 'LINK/ETH', tokens: ['LINK', 'ETH'], apy: 20, tvl: 80000000, fee: 0.3, risk: 'medium', dex: 'Uniswap V3', category: 'defi', icon: '⛓' },
        { id: 'mkr-eth', name: 'MKR/ETH', tokens: ['MKR', 'ETH'], apy: 12, tvl: 30000000, fee: 0.3, risk: 'medium', dex: 'Uniswap V3', category: 'defi', icon: '🔷' },
        { id: 'ldo-eth', name: 'LDO/ETH', tokens: ['LDO', 'ETH'], apy: 25, tvl: 35000000, fee: 0.3, risk: 'medium', dex: 'Balancer', category: 'defi', icon: '🔶' },

        // === MEME COINS (High Risk High Reward) ===
        { id: 'pepe-eth', name: 'PEPE/ETH', tokens: ['PEPE', 'ETH'], apy: 200, tvl: 30000000, fee: 1, risk: 'extreme', dex: 'Uniswap V3', category: 'meme', icon: '🐸' },
        { id: 'shib-eth', name: 'SHIB/ETH', tokens: ['SHIB', 'ETH'], apy: 80, tvl: 50000000, fee: 0.3, risk: 'extreme', dex: 'Uniswap V3', category: 'meme', icon: '🐕' },
        { id: 'doge-usdc', name: 'DOGE/USDC', tokens: ['DOGE', 'USDC'], apy: 60, tvl: 40000000, fee: 0.3, risk: 'high', dex: 'Uniswap V3', category: 'meme', icon: '🐕' },
        { id: 'floki-eth', name: 'FLOKI/ETH', tokens: ['FLOKI', 'ETH'], apy: 100, tvl: 15000000, fee: 0.3, risk: 'extreme', dex: 'Uniswap V3', category: 'meme', icon: '⚔️' },
    ],

    categories: {
        stable: { name: 'Stablecoin Pools', color: '#22c55e', description: 'Minimal impermanent loss' },
        eth: { name: 'ETH Pairs', color: '#627eea', description: 'Ethereum paired pools' },
        btc: { name: 'BTC Pairs', color: '#f7931a', description: 'Bitcoin paired pools' },
        arbitrum: { name: 'Arbitrum Ecosystem', color: '#28a0f0', description: 'ARB DEX pools' },
        optimism: { name: 'Optimism Ecosystem', color: '#ff0420', description: 'OP DEX pools' },
        solana: { name: 'Solana Ecosystem', color: '#14f195', description: 'SOL DEX pools' },
        defi: { name: 'DeFi Governance', color: '#8b5cf6', description: 'Protocol token pools' },
        meme: { name: 'Meme Coins', color: '#f59e0b', description: 'High risk, high reward' }
    },

    userLPs: [],

    init() {
        this.load();
        console.log('LP Module initialized - ' + this.pools.length + ' pools available');
    },

    load() {
        this.userLPs = SafeOps.getStorage('obelisk_lp', []);
    },

    save() {
        SafeOps.setStorage('obelisk_lp', this.userLPs);
    },

    addLiquidity(poolId, amount) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool || amount < 10) return { success: false, error: 'Min $10' };
        const lp = { id: 'lp-' + Date.now(), poolId, amount, startDate: Date.now(), apy: pool.apy };
        this.userLPs.push(lp);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(lp.id, pool.name + ' LP', amount, pool.apy, 'liquidity', true);
        return { success: true, lp };
    },

    removeLiquidity(lpId) {
        const idx = this.userLPs.findIndex(l => l.id === lpId);
        if (idx === -1) return { success: false };
        const lp = this.userLPs[idx];
        const days = (Date.now() - lp.startDate) / 86400000;
        const rewards = lp.amount * (lp.apy / 100) * (days / 365);
        this.userLPs.splice(idx, 1);
        this.save();
        return { success: true, amount: lp.amount, rewards };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = '<h3 style="color:#00ff88;margin-bottom:16px;">Liquidity Pools (' + this.pools.length + ' pools)</h3>';

        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catPools = this.pools.filter(p => p.category === catKey);
            if (catPools.length === 0) return;

            html += '<div style="margin-bottom:24px;">';
            html += '<h4 style="color:' + cat.color + ';margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ' + cat.color + ';">' + cat.name + ' <span style="font-size:11px;opacity:0.7;">(' + catPools.length + ' pools) - ' + cat.description + '</span></h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">';

            catPools.forEach(p => {
                const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', extreme: '#dc2626' };
                html += '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;">';
                html += '<div style="font-weight:bold;font-size:12px;margin-bottom:4px;">' + (p.icon || '') + ' ' + p.name + '</div>';
                html += '<div style="font-size:9px;color:#888;">' + p.dex + '</div>';
                html += '<div style="color:#00ff88;font-size:15px;font-weight:bold;margin:4px 0;">' + p.apy + '% APY</div>';
                html += '<div style="font-size:9px;">TVL: $' + (p.tvl / 1000000).toFixed(0) + 'M • Fee: ' + p.fee + '%</div>';
                html += '<div style="font-size:9px;color:' + riskColors[p.risk] + ';">Risk: ' + p.risk.toUpperCase() + '</div>';
                html += '<button onclick="LiquidityPoolsModule.showAddModal(\'' + p.id + '\')" style="margin-top:6px;padding:5px 10px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:10px;width:100%;">Add Liquidity</button>';
                html += '</div>';
            });

            html += '</div></div>';
        });

        el.innerHTML = html;
    },

    showAddModal(poolId) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) return;

        const existing = document.getElementById('lp-modal');
        if (existing) existing.remove();

        const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', extreme: '#dc2626' };

        const modal = document.createElement('div');
        modal.id = 'lp-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:#00ff88;margin:0 0 16px;">${pool.icon || ''} ${pool.name}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">DEX:</span>
                        <span>${pool.dex}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">APY:</span>
                        <span style="color:#00ff88;font-weight:bold;">${pool.apy}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">TVL:</span>
                        <span>$${(pool.tvl / 1000000).toFixed(0)}M</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Fee:</span>
                        <span>${pool.fee}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Risk:</span>
                        <span style="color:${riskColors[pool.risk]};font-weight:bold;">${pool.risk.toUpperCase()}</span>
                    </div>
                </div>
                ${pool.risk === 'high' || pool.risk === 'extreme' ? '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:8px;margin-bottom:16px;font-size:11px;color:#ef4444;">⚠️ High impermanent loss risk</div>' : ''}
                <div style="margin-bottom:16px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">Amount USD (min $10)</label>
                    <input type="number" id="lp-amount" min="10" placeholder="Enter amount..." style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="display:flex;gap:12px;">
                    <button onclick="document.getElementById('lp-modal').remove()" style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;">Cancel</button>
                    <button onclick="LiquidityPoolsModule.confirmAdd('${pool.id}')" style="flex:1;padding:12px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Add Liquidity</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => document.getElementById('lp-amount').focus(), 100);
    },

    confirmAdd(poolId) {
        const amount = parseFloat(document.getElementById('lp-amount').value);
        if (!amount || amount < 10) {
            alert('Minimum is $10');
            return;
        }

        const result = this.addLiquidity(poolId, amount);
        document.getElementById('lp-modal').remove();

        if (result.success) {
            const pool = this.pools.find(p => p.id === poolId);
            if (typeof showNotification === 'function') {
                showNotification('Added $' + amount + ' to ' + pool.name, 'success');
            } else {
                alert('Added $' + amount + ' to ' + pool.name);
            }
        } else {
            alert(result.error);
        }
    },

    quickAdd(poolId) {
        this.showAddModal(poolId);
    }
};

document.addEventListener('DOMContentLoaded', () => LiquidityPoolsModule.init());
