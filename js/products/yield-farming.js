/**
 * YIELD FARMING MODULE - Multi-Protocol Farming
 * Extended version with 45+ farming opportunities
 */
const YieldFarmingModule = {
    farms: [
        // === STABLECOIN FARMS (Low Risk) ===
        { id: 'curve-3pool', name: '🔵 Curve 3Pool', protocol: 'Curve', apy: 15, rewards: ['CRV', 'CVX'], risk: 'low', tvl: 500000000, category: 'stable', icon: '🔵' },
        { id: 'curve-fraxusdc', name: '🔵 Curve FRAX-USDC', protocol: 'Curve', apy: 18, rewards: ['CRV', 'FXS'], risk: 'low', tvl: 200000000, category: 'stable', icon: '🔵' },
        { id: 'aave-v3-usdc', name: '👻 Aave V3 USDC', protocol: 'Aave', apy: 8, rewards: ['AAVE'], risk: 'low', tvl: 800000000, category: 'stable', icon: '👻' },
        { id: 'compound-usdc', name: '🟢 Compound USDC', protocol: 'Compound', apy: 6, rewards: ['COMP'], risk: 'low', tvl: 600000000, category: 'stable', icon: '🟢' },
        { id: 'yearn-usdc', name: '🔷 Yearn USDC Vault', protocol: 'Yearn', apy: 12, rewards: ['YFI'], risk: 'low', tvl: 150000000, category: 'stable', icon: '🔷' },
        { id: 'convex-crvusd', name: '⚪ Convex crvUSD', protocol: 'Convex', apy: 20, rewards: ['CVX', 'CRV'], risk: 'low', tvl: 180000000, category: 'stable', icon: '⚪' },
        { id: 'gho-stability', name: '👻 GHO Stability Module', protocol: 'Aave', apy: 10, rewards: ['AAVE', 'GHO'], risk: 'low', tvl: 120000000, category: 'stable', icon: '👻' },

        // === ETH/BTC FARMS (Medium Risk) ===
        { id: 'convex-eth', name: '⚪ Convex stETH', protocol: 'Convex', apy: 25, rewards: ['CVX', 'CRV', 'LDO'], risk: 'medium', tvl: 200000000, category: 'bluechip', icon: '⚪' },
        { id: 'lido-steth', name: '🔶 Lido stETH', protocol: 'Lido', apy: 4.5, rewards: ['stETH'], risk: 'low', tvl: 2000000000, category: 'bluechip', icon: '🔶' },
        { id: 'rocket-reth', name: '🚀 Rocket Pool rETH', protocol: 'Rocket Pool', apy: 4.2, rewards: ['rETH'], risk: 'low', tvl: 800000000, category: 'bluechip', icon: '🚀' },
        { id: 'balancer-weth', name: '⚡ Balancer wETH-wstETH', protocol: 'Balancer', apy: 8, rewards: ['BAL', 'AURA'], risk: 'low', tvl: 300000000, category: 'bluechip', icon: '⚡' },
        { id: 'curve-wbtc', name: '🔵 Curve WBTC', protocol: 'Curve', apy: 6, rewards: ['CRV'], risk: 'low', tvl: 250000000, category: 'bluechip', icon: '🔵' },
        { id: 'badger-btc', name: '🦡 Badger WBTC', protocol: 'Badger', apy: 10, rewards: ['BADGER', 'DIGG'], risk: 'medium', tvl: 80000000, category: 'bluechip', icon: '🦡' },

        // === ARBITRUM FARMS ===
        { id: 'gmx-glp', name: '🟦 GMX GLP', protocol: 'GMX', apy: 35, rewards: ['ETH', 'esGMX'], risk: 'medium', tvl: 400000000, category: 'arbitrum', icon: '🟦' },
        { id: 'camelot-arb', name: '⚔️ Camelot ARB-ETH', protocol: 'Camelot', apy: 45, rewards: ['GRAIL', 'xGRAIL'], risk: 'medium', tvl: 50000000, category: 'arbitrum', icon: '⚔️' },
        { id: 'radiant-arb', name: '✨ Radiant ARB', protocol: 'Radiant', apy: 30, rewards: ['RDNT'], risk: 'medium', tvl: 100000000, category: 'arbitrum', icon: '✨' },
        { id: 'jones-glp', name: '🎭 Jones jGLP', protocol: 'Jones DAO', apy: 50, rewards: ['JONES'], risk: 'high', tvl: 30000000, category: 'arbitrum', icon: '🎭' },
        { id: 'dopex-arb', name: '🔴 Dopex ARB', protocol: 'Dopex', apy: 40, rewards: ['DPX', 'rDPX'], risk: 'high', tvl: 25000000, category: 'arbitrum', icon: '🔴' },
        { id: 'vela-vlp', name: '⭐ Vela VLP', protocol: 'Vela', apy: 55, rewards: ['VELA', 'eVELA'], risk: 'high', tvl: 20000000, category: 'arbitrum', icon: '⭐' },

        // === OPTIMISM FARMS ===
        { id: 'velodrome-eth', name: '🔴 Velodrome ETH-OP', protocol: 'Velodrome', apy: 40, rewards: ['VELO'], risk: 'medium', tvl: 150000000, category: 'optimism', icon: '🔴' },
        { id: 'beethoven-op', name: '🎼 Beethoven X OP', protocol: 'Beethoven', apy: 35, rewards: ['BEETS'], risk: 'medium', tvl: 40000000, category: 'optimism', icon: '🎼' },
        { id: 'synthetix-op', name: '🟣 Synthetix sUSD', protocol: 'Synthetix', apy: 20, rewards: ['SNX', 'OP'], risk: 'medium', tvl: 200000000, category: 'optimism', icon: '🟣' },
        { id: 'aave-op', name: '👻 Aave V3 OP', protocol: 'Aave', apy: 12, rewards: ['AAVE', 'OP'], risk: 'low', tvl: 300000000, category: 'optimism', icon: '👻' },

        // === RESTAKING & EIGENLAYER ===
        { id: 'eigen-restake', name: '🟠 EigenLayer Restake', protocol: 'EigenLayer', apy: 60, rewards: ['EIGEN', 'Points'], risk: 'high', tvl: 300000000, category: 'restaking', icon: '🟠' },
        { id: 'ether-fi', name: '🌊 Ether.fi eETH', protocol: 'Ether.fi', apy: 55, rewards: ['ETHFI', 'Points'], risk: 'medium', tvl: 500000000, category: 'restaking', icon: '🌊' },
        { id: 'renzo-ezeth', name: '🔮 Renzo ezETH', protocol: 'Renzo', apy: 50, rewards: ['REZ', 'Points'], risk: 'medium', tvl: 400000000, category: 'restaking', icon: '🔮' },
        { id: 'kelp-rseth', name: '🌿 Kelp rsETH', protocol: 'Kelp DAO', apy: 45, rewards: ['KEP', 'Points'], risk: 'medium', tvl: 200000000, category: 'restaking', icon: '🌿' },
        { id: 'puffer-pufeth', name: '🐡 Puffer pufETH', protocol: 'Puffer', apy: 52, rewards: ['PUFFER', 'Points'], risk: 'medium', tvl: 250000000, category: 'restaking', icon: '🐡' },

        // === PENDLE YIELDS ===
        { id: 'pendle-pt', name: '⚡ Pendle PT-stETH', protocol: 'Pendle', apy: 45, rewards: ['PENDLE'], risk: 'medium', tvl: 100000000, category: 'pendle', icon: '⚡' },
        { id: 'pendle-ezeth', name: '⚡ Pendle PT-ezETH', protocol: 'Pendle', apy: 65, rewards: ['PENDLE', 'Points'], risk: 'medium', tvl: 80000000, category: 'pendle', icon: '⚡' },
        { id: 'pendle-usde', name: '⚡ Pendle PT-USDe', protocol: 'Pendle', apy: 80, rewards: ['PENDLE', 'ENA'], risk: 'medium', tvl: 150000000, category: 'pendle', icon: '⚡' },
        { id: 'pendle-eeth', name: '⚡ Pendle PT-eETH', protocol: 'Pendle', apy: 58, rewards: ['PENDLE', 'ETHFI'], risk: 'medium', tvl: 90000000, category: 'pendle', icon: '⚡' },

        // === SOLANA FARMS ===
        { id: 'marinade-msol', name: '◎ Marinade mSOL', protocol: 'Marinade', apy: 8, rewards: ['MNDE'], risk: 'low', tvl: 800000000, category: 'solana', icon: '◎' },
        { id: 'jito-jitosol', name: '◎ Jito jitoSOL', protocol: 'Jito', apy: 10, rewards: ['JTO', 'MEV'], risk: 'low', tvl: 600000000, category: 'solana', icon: '◎' },
        { id: 'orca-whirlpool', name: '🐋 Orca Whirlpools', protocol: 'Orca', apy: 35, rewards: ['ORCA'], risk: 'medium', tvl: 150000000, category: 'solana', icon: '🐋' },
        { id: 'raydium-ray', name: '💎 Raydium RAY-SOL', protocol: 'Raydium', apy: 40, rewards: ['RAY'], risk: 'medium', tvl: 80000000, category: 'solana', icon: '💎' },
        { id: 'kamino-sol', name: '🏛️ Kamino SOL Multiply', protocol: 'Kamino', apy: 50, rewards: ['KMNO'], risk: 'high', tvl: 200000000, category: 'solana', icon: '🏛️' },
        { id: 'jupiter-jlp', name: '🪐 Jupiter JLP', protocol: 'Jupiter', apy: 45, rewards: ['JUP'], risk: 'medium', tvl: 300000000, category: 'solana', icon: '🪐' },

        // === POINTS & AIRDROPS ===
        { id: 'blast-gold', name: '🏆 Blast Gold Points', protocol: 'Blast', apy: 100, rewards: ['GOLD', 'Points'], risk: 'high', tvl: 150000000, category: 'points', icon: '🏆' },
        { id: 'scroll-session', name: '📜 Scroll Session', protocol: 'Scroll', apy: 80, rewards: ['Marks', 'Points'], risk: 'high', tvl: 100000000, category: 'points', icon: '📜' },
        { id: 'zksync-rewards', name: '💠 zkSync Ignite', protocol: 'zkSync', apy: 70, rewards: ['ZK', 'Points'], risk: 'high', tvl: 200000000, category: 'points', icon: '💠' },
        { id: 'linea-surge', name: '🌊 Linea Surge', protocol: 'Linea', apy: 90, rewards: ['LXP', 'Points'], risk: 'high', tvl: 80000000, category: 'points', icon: '🌊' },
        { id: 'mode-season', name: '🟡 Mode Season', protocol: 'Mode', apy: 75, rewards: ['MODE', 'Points'], risk: 'high', tvl: 60000000, category: 'points', icon: '🟡' },
    ],

    categories: {
        stable: { name: 'Stablecoin Farms', color: '#22c55e', description: 'Lowest risk, proven protocols' },
        bluechip: { name: 'Blue Chip Farms', color: '#3b82f6', description: 'ETH/BTC farming' },
        arbitrum: { name: 'Arbitrum Ecosystem', color: '#28a0f0', description: 'ARB native farms' },
        optimism: { name: 'Optimism Ecosystem', color: '#ff0420', description: 'OP native farms' },
        restaking: { name: 'Restaking & LRTs', color: '#a855f7', description: 'EigenLayer ecosystem' },
        pendle: { name: 'Pendle Yields', color: '#10b981', description: 'Fixed yield strategies' },
        solana: { name: 'Solana Farms', color: '#14f195', description: 'Solana DeFi' },
        points: { name: 'Points & Airdrops', color: '#f59e0b', description: 'Airdrop farming' }
    },

    positions: [],

    init() {
        this.load();
        console.log('Yield Farming initialized - ' + this.farms.length + ' farms available');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_farming', []);
    },

    save() {
        SafeOps.setStorage('obelisk_farming', this.positions);
    },

    deposit(farmId, amount) {
        const farm = this.farms.find(f => f.id === farmId);
        if (!farm || amount < 10) return { success: false, error: 'Min $10' };
        const pos = { id: 'farm-' + Date.now(), farmId, amount, startDate: Date.now(), apy: farm.apy, rewards: farm.rewards };
        this.positions.push(pos);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(pos.id, farm.name, amount, farm.apy, 'farming', true);
        return { success: true, position: pos };
    },

    harvest(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false };
        const days = (Date.now() - pos.startDate) / 86400000;
        const rewards = pos.amount * (pos.apy / 100) * (days / 365);
        pos.startDate = Date.now();
        this.save();
        return { success: true, rewards, tokens: pos.rewards };
    },

    withdraw(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false };
        const pos = this.positions[idx];
        const days = (Date.now() - pos.startDate) / 86400000;
        const rewards = pos.amount * (pos.apy / 100) * (days / 365);
        this.positions.splice(idx, 1);
        this.save();
        return { success: true, amount: pos.amount, rewards };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = '<h3 style="color:#00ff88;margin-bottom:16px;">Yield Farming (' + this.farms.length + ' opportunities)</h3>';

        // Render by category
        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catFarms = this.farms.filter(f => f.category === catKey);
            if (catFarms.length === 0) return;

            html += '<div style="margin-bottom:24px;">';
            html += '<h4 style="color:' + cat.color + ';margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ' + cat.color + ';">' + cat.name + ' <span style="font-size:11px;opacity:0.7;">(' + catFarms.length + ' farms) - ' + cat.description + '</span></h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">';

            catFarms.forEach(f => {
                const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
                html += '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;">';
                html += '<div style="font-weight:bold;font-size:13px;margin-bottom:6px;">' + (f.icon || '') + ' ' + f.name + '</div>';
                html += '<div style="font-size:10px;color:#888;">' + f.protocol + '</div>';
                html += '<div style="color:#00ff88;font-size:16px;font-weight:bold;margin:4px 0;">' + f.apy + '% APY</div>';
                html += '<div style="font-size:10px;color:#888;">Rewards: ' + f.rewards.join(', ') + '</div>';
                html += '<div style="font-size:10px;">TVL: $' + (f.tvl / 1000000000).toFixed(2) + 'B</div>';
                html += '<div style="font-size:10px;color:' + riskColors[f.risk] + ';">Risk: ' + f.risk.toUpperCase() + '</div>';
                html += '<button onclick="YieldFarmingModule.showFarmModal(\'' + f.id + '\')" style="margin-top:8px;padding:6px 12px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:11px;width:100%;">Farm</button>';
                html += '</div>';
            });

            html += '</div></div>';
        });

        el.innerHTML = html;
    },

    showFarmModal(farmId) {
        const farm = this.farms.find(f => f.id === farmId);
        if (!farm) return;

        const existing = document.getElementById('farm-modal');
        if (existing) existing.remove();

        const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

        const modal = document.createElement('div');
        modal.id = 'farm-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:#00ff88;margin:0 0 16px;">${farm.icon || ''} ${farm.name}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Protocol:</span>
                        <span>${farm.protocol}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">APY:</span>
                        <span style="color:#00ff88;font-weight:bold;">${farm.apy}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Rewards:</span>
                        <span>${farm.rewards.join(', ')}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Risk Level:</span>
                        <span style="color:${riskColors[farm.risk]};font-weight:bold;">${farm.risk.toUpperCase()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">TVL:</span>
                        <span>$${(farm.tvl / 1000000).toFixed(0)}M</span>
                    </div>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">Amount USD (min $10)</label>
                    <input type="number" id="farm-amount" min="10" placeholder="Enter amount..." style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="display:flex;gap:12px;">
                    <button onclick="document.getElementById('farm-modal').remove()" style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;cursor:pointer;">Cancel</button>
                    <button onclick="YieldFarmingModule.confirmFarm('${farm.id}')" style="flex:1;padding:12px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Start Farming</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        setTimeout(() => document.getElementById('farm-amount').focus(), 100);
    },

    confirmFarm(farmId) {
        const amount = parseFloat(document.getElementById('farm-amount').value);
        if (!amount || amount < 10) {
            alert('Minimum deposit is $10');
            return;
        }

        const result = this.deposit(farmId, amount);
        document.getElementById('farm-modal').remove();

        if (result.success) {
            const farm = this.farms.find(f => f.id === farmId);
            if (typeof showNotification === 'function') {
                showNotification('Started farming $' + amount + ' in ' + farm.name, 'success');
            } else {
                alert('Started farming $' + amount + ' in ' + farm.name);
            }
        } else {
            alert(result.error || 'Farm failed');
        }
    },

    quickDeposit(farmId) {
        this.showFarmModal(farmId);
    }
};

document.addEventListener('DOMContentLoaded', () => YieldFarmingModule.init());
