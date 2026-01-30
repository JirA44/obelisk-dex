/**
 * VAULTS MODULE - Auto-compound strategies
 * Extended version with 40+ vaults in categories
 */
const VaultsModule = {
    vaults: [
        // === BLUE CHIP COMPOUNDERS (Low Risk) ===
        { id: 'eth-compound', name: '⟠ ETH Compounder', token: 'ETH', apy: 15, strategy: 'Lido + Curve + Convex', risk: 'low', tvl: 12000000, category: 'bluechip', icon: '⟠' },
        { id: 'btc-yield', name: '₿ BTC Yield Max', token: 'WBTC', apy: 12, strategy: 'Aave + Compound', risk: 'low', tvl: 20000000, category: 'bluechip', icon: '₿' },
        { id: 'eth-lido-curve', name: '⟠ ETH Lido-Curve', token: 'ETH', apy: 8, strategy: 'stETH + Curve LP', risk: 'low', tvl: 45000000, category: 'bluechip', icon: '⟠' },
        { id: 'btc-cbbtc', name: '₿ cbBTC Compound', token: 'cbBTC', apy: 6, strategy: 'Coinbase + Aave', risk: 'low', tvl: 35000000, category: 'bluechip', icon: '₿' },
        { id: 'eth-reth', name: '⟠ rETH Optimizer', token: 'rETH', apy: 7, strategy: 'Rocket Pool + Balancer', risk: 'low', tvl: 28000000, category: 'bluechip', icon: '⟠' },
        { id: 'link-compound', name: '⛓ LINK Compounder', token: 'LINK', apy: 9, strategy: 'Aave + Staking', risk: 'low', tvl: 15000000, category: 'bluechip', icon: '⛓' },

        // === STABLECOIN VAULTS (Very Low Risk) ===
        { id: 'stable-max', name: '💵 Stable Maximizer', token: 'USDC', apy: 18, strategy: 'Curve + Yearn', risk: 'low', tvl: 35000000, category: 'stable', icon: '💵' },
        { id: 'usdc-aave', name: '💵 USDC Aave Auto', token: 'USDC', apy: 8, strategy: 'Aave V3 compound', risk: 'low', tvl: 80000000, category: 'stable', icon: '💵' },
        { id: 'usdt-curve', name: '💵 USDT Curve 3Pool', token: 'USDT', apy: 12, strategy: 'Curve + Convex', risk: 'low', tvl: 55000000, category: 'stable', icon: '💵' },
        { id: 'dai-yearn', name: '💵 DAI Yearn V3', token: 'DAI', apy: 10, strategy: 'Yearn multi-strat', risk: 'low', tvl: 40000000, category: 'stable', icon: '💵' },
        { id: 'frax-convex', name: '💵 FRAX Convex', token: 'FRAX', apy: 14, strategy: 'Frax + Convex', risk: 'low', tvl: 25000000, category: 'stable', icon: '💵' },
        { id: 'lusd-chicken', name: '💵 LUSD Chicken Bonds', token: 'LUSD', apy: 16, strategy: 'Liquity + bLUSD', risk: 'low', tvl: 18000000, category: 'stable', icon: '💵' },
        { id: 'gho-curve', name: '💵 GHO Maximizer', token: 'GHO', apy: 15, strategy: 'Aave GHO + Curve', risk: 'low', tvl: 22000000, category: 'stable', icon: '💵' },
        { id: 'crvusd-max', name: '💵 crvUSD Optimizer', token: 'crvUSD', apy: 20, strategy: 'Curve lending', risk: 'low', tvl: 30000000, category: 'stable', icon: '💵' },

        // === DELTA NEUTRAL STRATEGIES (Medium Risk) ===
        { id: 'delta-neutral', name: '⚖ Delta Neutral USDC', token: 'USDC', apy: 25, strategy: 'Perp hedging', risk: 'medium', tvl: 8000000, category: 'delta', icon: '⚖' },
        { id: 'delta-eth', name: '⚖ Delta Neutral ETH', token: 'ETH', apy: 30, strategy: 'ETH long/short hedge', risk: 'medium', tvl: 12000000, category: 'delta', icon: '⚖' },
        { id: 'funding-arb', name: '⚖ Funding Rate Arb', token: 'USDC', apy: 35, strategy: 'Perp funding capture', risk: 'medium', tvl: 6000000, category: 'delta', icon: '⚖' },
        { id: 'basis-trade', name: '⚖ Basis Trade Vault', token: 'USDC', apy: 28, strategy: 'Spot-futures basis', risk: 'medium', tvl: 15000000, category: 'delta', icon: '⚖' },
        { id: 'ethena-usde', name: '⚖ Ethena USDe', token: 'USDe', apy: 40, strategy: 'Delta neutral yield', risk: 'medium', tvl: 50000000, category: 'delta', icon: '⚖' },

        // === LAYER 2 VAULTS ===
        { id: 'arb-degen', name: '🔷 ARB Degen Vault', token: 'ARB', apy: 80, strategy: 'Multi-farm ARB', risk: 'high', tvl: 2000000, category: 'layer2', icon: '🔷' },
        { id: 'op-compound', name: '🔴 OP Compounder', token: 'OP', apy: 55, strategy: 'Velodrome + Extra', risk: 'medium', tvl: 5000000, category: 'layer2', icon: '🔴' },
        { id: 'strk-vault', name: '⬛ STRK Vault', token: 'STRK', apy: 65, strategy: 'StarkNet DeFi', risk: 'high', tvl: 3000000, category: 'layer2', icon: '⬛' },
        { id: 'zk-compound', name: '💠 zkSync Vault', token: 'ZK', apy: 70, strategy: 'SyncSwap + Hold', risk: 'high', tvl: 2500000, category: 'layer2', icon: '💠' },
        { id: 'mnt-vault', name: '🟢 Mantle Vault', token: 'MNT', apy: 45, strategy: 'Mantle DeFi ecosystem', risk: 'medium', tvl: 8000000, category: 'layer2', icon: '🟢' },
        { id: 'metis-vault', name: '🌙 METIS Vault', token: 'METIS', apy: 50, strategy: 'Metis staking + LP', risk: 'medium', tvl: 4000000, category: 'layer2', icon: '🌙' },

        // === SOLANA ECOSYSTEM ===
        { id: 'sol-turbo', name: '◎ SOL Turbo', token: 'SOL', apy: 45, strategy: 'Marinade + Orca', risk: 'high', tvl: 5000000, category: 'solana', icon: '◎' },
        { id: 'jito-sol', name: '◎ JitoSOL Vault', token: 'JitoSOL', apy: 35, strategy: 'Jito MEV + DeFi', risk: 'medium', tvl: 25000000, category: 'solana', icon: '◎' },
        { id: 'msol-kamino', name: '◎ mSOL Kamino', token: 'mSOL', apy: 40, strategy: 'Kamino multiply', risk: 'medium', tvl: 18000000, category: 'solana', icon: '◎' },
        { id: 'bonk-vault', name: '🐕 BONK Vault', token: 'BONK', apy: 150, strategy: 'Meme yield farming', risk: 'extreme', tvl: 3000000, category: 'solana', icon: '🐕' },
        { id: 'jup-vault', name: '🪐 JUP Vault', token: 'JUP', apy: 60, strategy: 'Jupiter perps + LP', risk: 'high', tvl: 8000000, category: 'solana', icon: '🪐' },

        // === DEFI GOVERNANCE VAULTS ===
        { id: 'crv-convex', name: '🔵 CRV Convex Max', token: 'CRV', apy: 35, strategy: 'cvxCRV compounding', risk: 'medium', tvl: 15000000, category: 'governance', icon: '🔵' },
        { id: 'aave-stake', name: '👻 AAVE Stake Vault', token: 'AAVE', apy: 12, strategy: 'stkAAVE compound', risk: 'low', tvl: 30000000, category: 'governance', icon: '👻' },
        { id: 'gmx-vault', name: '🟦 GMX Compounder', token: 'GMX', apy: 20, strategy: 'esGMX + ETH rewards', risk: 'medium', tvl: 20000000, category: 'governance', icon: '🟦' },
        { id: 'snx-vault', name: '🟣 SNX Staking Vault', token: 'SNX', apy: 25, strategy: 'SNX staking + fees', risk: 'medium', tvl: 10000000, category: 'governance', icon: '🟣' },
        { id: 'pendle-vault', name: '⚡ PENDLE Vault', token: 'PENDLE', apy: 45, strategy: 'vePENDLE + yields', risk: 'medium', tvl: 12000000, category: 'governance', icon: '⚡' },
        { id: 'ldo-vault', name: '🔶 LDO Vault', token: 'LDO', apy: 18, strategy: 'Lido governance + DeFi', risk: 'medium', tvl: 8000000, category: 'governance', icon: '🔶' },

        // === EXTREME YIELD (High Risk) ===
        { id: 'points-farm', name: '🎯 Points Maximizer', token: 'USDC', apy: 200, strategy: 'Multi-protocol points', risk: 'extreme', tvl: 5000000, category: 'extreme', icon: '🎯' },
        { id: 'leveraged-eth', name: '🚀 3x Leveraged ETH', token: 'ETH', apy: 120, strategy: 'Leveraged staking', risk: 'extreme', tvl: 3000000, category: 'extreme', icon: '🚀' },
        { id: 'meme-farm', name: '🎪 Meme Token Farm', token: 'USDC', apy: 500, strategy: 'Rotating meme yields', risk: 'extreme', tvl: 1000000, category: 'extreme', icon: '🎪' },
        { id: 'degen-sniper', name: '🎰 Degen Sniper', token: 'ETH', apy: 300, strategy: 'New token launches', risk: 'extreme', tvl: 500000, category: 'extreme', icon: '🎰' },
        { id: 'blast-gold', name: '🏆 Blast Gold Farm', token: 'USDB', apy: 180, strategy: 'Blast points + gold', risk: 'extreme', tvl: 8000000, category: 'extreme', icon: '🏆' },
    ],

    categories: {
        bluechip: { name: 'Blue Chip Compounders', color: '#3b82f6', description: 'Low risk, proven strategies' },
        stable: { name: 'Stablecoin Vaults', color: '#22c55e', description: 'Lowest risk, stable yields' },
        delta: { name: 'Delta Neutral', color: '#a855f7', description: 'Market-neutral strategies' },
        layer2: { name: 'Layer 2 Vaults', color: '#f59e0b', description: 'L2 ecosystem yields' },
        solana: { name: 'Solana Ecosystem', color: '#14f195', description: 'Solana DeFi vaults' },
        governance: { name: 'DeFi Governance', color: '#6366f1', description: 'Protocol token staking' },
        extreme: { name: 'Extreme Yield', color: '#ef4444', description: 'High risk, high reward' }
    },

    userDeposits: [],

    init() {
        this.load();
        console.log('Vaults Module initialized - ' + this.vaults.length + ' vaults available');
    },

    load() {
        this.userDeposits = SafeOps.getStorage('obelisk_vaults', []);
    },

    save() {
        SafeOps.setStorage('obelisk_vaults', this.userDeposits);
    },

    deposit(vaultId, amount) {
        const vault = this.vaults.find(v => v.id === vaultId);
        if (!vault || amount < 10) return { success: false, error: 'Min $10' };
        const dep = { id: 'vault-' + Date.now(), vaultId, amount, startDate: Date.now(), apy: vault.apy };
        this.userDeposits.push(dep);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(dep.id, vault.name, amount, vault.apy, 'vault', true);
        return { success: true, deposit: dep };
    },

    withdraw(depId) {
        const idx = this.userDeposits.findIndex(d => d.id === depId);
        if (idx === -1) return { success: false };
        const dep = this.userDeposits[idx];
        const days = (Date.now() - dep.startDate) / 86400000;
        const rewards = dep.amount * (dep.apy / 100) * (days / 365);
        this.userDeposits.splice(idx, 1);
        this.save();
        return { success: true, amount: dep.amount + rewards };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = '<h3 style="color:#00ff88;margin-bottom:16px;">Auto-Compound Vaults (' + this.vaults.length + ' strategies)</h3>';

        // Render by category
        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catVaults = this.vaults.filter(v => v.category === catKey);
            if (catVaults.length === 0) return;

            html += '<div style="margin-bottom:24px;">';
            html += '<h4 style="color:' + cat.color + ';margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ' + cat.color + ';">' + cat.name + ' <span style="font-size:11px;opacity:0.7;">(' + catVaults.length + ' vaults) - ' + cat.description + '</span></h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">';

            catVaults.forEach(v => {
                const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', extreme: '#dc2626' };
                html += '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;">';
                html += '<div style="font-weight:bold;font-size:13px;margin-bottom:6px;">' + (v.icon || '') + ' ' + v.name + '</div>';
                html += '<div style="color:#00ff88;font-size:16px;font-weight:bold;">' + v.apy + '% APY</div>';
                html += '<div style="font-size:10px;color:#888;margin:4px 0;">' + v.strategy + '</div>';
                html += '<div style="font-size:10px;">TVL: $' + (v.tvl / 1000000).toFixed(1) + 'M</div>';
                html += '<div style="font-size:10px;color:' + riskColors[v.risk] + ';">Risk: ' + v.risk.toUpperCase() + '</div>';
                html += '<button onclick="VaultsModule.showDepositModal(\'' + v.id + '\')" style="margin-top:8px;padding:6px 12px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:11px;width:100%;">Deposit</button>';
                html += '</div>';
            });

            html += '</div></div>';
        });

        el.innerHTML = html;
    },

    showDepositModal(vaultId) {
        const vault = this.vaults.find(v => v.id === vaultId);
        if (!vault) return;

        // Remove existing modal
        const existing = document.getElementById('vault-modal');
        if (existing) existing.remove();

        const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', extreme: '#dc2626' };

        const modal = document.createElement('div');
        modal.id = 'vault-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:#00ff88;margin:0 0 16px;">${vault.icon || ''} ${vault.name}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">APY:</span>
                        <span style="color:#00ff88;font-weight:bold;">${vault.apy}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Strategy:</span>
                        <span style="font-size:12px;">${vault.strategy}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Risk Level:</span>
                        <span style="color:${riskColors[vault.risk]};font-weight:bold;">${vault.risk.toUpperCase()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">TVL:</span>
                        <span>$${(vault.tvl / 1000000).toFixed(1)}M</span>
                    </div>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">Amount USD (min $10)</label>
                    <input type="number" id="vault-amount" min="10" placeholder="Enter amount..." style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="display:flex;gap:12px;">
                    <button onclick="document.getElementById('vault-modal').remove()" style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;">Cancel</button>
                    <button onclick="VaultsModule.confirmDeposit('${vault.id}')" style="flex:1;padding:12px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Deposit</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Focus input
        setTimeout(() => document.getElementById('vault-amount').focus(), 100);
    },

    confirmDeposit(vaultId) {
        const amount = parseFloat(document.getElementById('vault-amount').value);
        if (!amount || amount < 10) {
            alert('Minimum deposit is $10');
            return;
        }

        const result = this.deposit(vaultId, amount);
        document.getElementById('vault-modal').remove();

        if (result.success) {
            const vault = this.vaults.find(v => v.id === vaultId);
            if (typeof showNotification === 'function') {
                showNotification('Deposited $' + amount + ' in ' + vault.name, 'success');
            } else {
                alert('Deposited $' + amount + ' in ' + vault.name);
            }
        } else {
            alert(result.error || 'Deposit failed');
        }
    },

    quickDeposit(vaultId) {
        this.showDepositModal(vaultId);
    }
};

document.addEventListener('DOMContentLoaded', () => VaultsModule.init());
