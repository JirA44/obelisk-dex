/**
 * LENDING/BORROWING MODULE
 * Extended version with 40+ lending markets
 */
const LendingModule = {
    markets: [
        // === STABLECOIN MARKETS (High LTV) ===
        { id: 'usdc-lend', asset: 'USDC', supplyAPY: 8, borrowAPY: 12, ltv: 85, available: 50000000, protocol: 'Aave', category: 'stable', icon: '💵' },
        { id: 'usdt-lend', asset: 'USDT', supplyAPY: 7.5, borrowAPY: 11, ltv: 85, available: 45000000, protocol: 'Aave', category: 'stable', icon: '💵' },
        { id: 'dai-lend', asset: 'DAI', supplyAPY: 7, borrowAPY: 10, ltv: 80, available: 30000000, protocol: 'Aave', category: 'stable', icon: '💵' },
        { id: 'frax-lend', asset: 'FRAX', supplyAPY: 8.5, borrowAPY: 12.5, ltv: 80, available: 15000000, protocol: 'Fraxlend', category: 'stable', icon: '💵' },
        { id: 'lusd-lend', asset: 'LUSD', supplyAPY: 6, borrowAPY: 9, ltv: 80, available: 10000000, protocol: 'Liquity', category: 'stable', icon: '💵' },
        { id: 'gho-lend', asset: 'GHO', supplyAPY: 9, borrowAPY: 13, ltv: 80, available: 20000000, protocol: 'Aave', category: 'stable', icon: '💵' },
        { id: 'crvusd-lend', asset: 'crvUSD', supplyAPY: 10, borrowAPY: 14, ltv: 80, available: 25000000, protocol: 'Curve', category: 'stable', icon: '💵' },
        { id: 'usde-lend', asset: 'USDe', supplyAPY: 15, borrowAPY: 20, ltv: 75, available: 30000000, protocol: 'Morpho', category: 'stable', icon: '💵' },

        // === BLUE CHIP CRYPTO ===
        { id: 'eth-lend', asset: 'ETH', supplyAPY: 3, borrowAPY: 5, ltv: 80, available: 20000, protocol: 'Aave', category: 'bluechip', icon: '⟠' },
        { id: 'wbtc-lend', asset: 'WBTC', supplyAPY: 2, borrowAPY: 4, ltv: 75, available: 500, protocol: 'Aave', category: 'bluechip', icon: '₿' },
        { id: 'steth-lend', asset: 'stETH', supplyAPY: 4, borrowAPY: 6, ltv: 75, available: 15000, protocol: 'Aave', category: 'bluechip', icon: '⟠' },
        { id: 'wsteth-lend', asset: 'wstETH', supplyAPY: 3.5, borrowAPY: 5.5, ltv: 80, available: 12000, protocol: 'Aave', category: 'bluechip', icon: '⟠' },
        { id: 'reth-lend', asset: 'rETH', supplyAPY: 3.2, borrowAPY: 5.2, ltv: 75, available: 8000, protocol: 'Aave', category: 'bluechip', icon: '🚀' },
        { id: 'cbeth-lend', asset: 'cbETH', supplyAPY: 3, borrowAPY: 5, ltv: 75, available: 10000, protocol: 'Compound', category: 'bluechip', icon: '🔵' },

        // === DEFI TOKENS ===
        { id: 'link-lend', asset: 'LINK', supplyAPY: 5, borrowAPY: 8, ltv: 70, available: 500000, protocol: 'Aave', category: 'defi', icon: '⛓' },
        { id: 'aave-lend', asset: 'AAVE', supplyAPY: 4, borrowAPY: 7, ltv: 65, available: 50000, protocol: 'Aave', category: 'defi', icon: '👻' },
        { id: 'crv-lend', asset: 'CRV', supplyAPY: 8, borrowAPY: 12, ltv: 55, available: 2000000, protocol: 'Aave', category: 'defi', icon: '🔵' },
        { id: 'mkr-lend', asset: 'MKR', supplyAPY: 3, borrowAPY: 6, ltv: 60, available: 5000, protocol: 'Aave', category: 'defi', icon: '🔷' },
        { id: 'uni-lend', asset: 'UNI', supplyAPY: 4, borrowAPY: 7, ltv: 65, available: 200000, protocol: 'Aave', category: 'defi', icon: '🦄' },
        { id: 'snx-lend', asset: 'SNX', supplyAPY: 6, borrowAPY: 10, ltv: 50, available: 500000, protocol: 'Aave', category: 'defi', icon: '🟣' },
        { id: 'comp-lend', asset: 'COMP', supplyAPY: 3.5, borrowAPY: 6.5, ltv: 60, available: 30000, protocol: 'Compound', category: 'defi', icon: '🟢' },
        { id: 'ldo-lend', asset: 'LDO', supplyAPY: 5, borrowAPY: 9, ltv: 55, available: 1000000, protocol: 'Aave', category: 'defi', icon: '🔶' },

        // === LAYER 2 TOKENS ===
        { id: 'arb-lend', asset: 'ARB', supplyAPY: 10, borrowAPY: 15, ltv: 60, available: 5000000, protocol: 'Aave', category: 'layer2', icon: '🔷' },
        { id: 'op-lend', asset: 'OP', supplyAPY: 8, borrowAPY: 12, ltv: 60, available: 3000000, protocol: 'Aave', category: 'layer2', icon: '🔴' },
        { id: 'matic-lend', asset: 'MATIC', supplyAPY: 6, borrowAPY: 10, ltv: 65, available: 10000000, protocol: 'Aave', category: 'layer2', icon: '🟣' },
        { id: 'strk-lend', asset: 'STRK', supplyAPY: 12, borrowAPY: 18, ltv: 50, available: 2000000, protocol: 'StarkNet', category: 'layer2', icon: '⬛' },
        { id: 'zk-lend', asset: 'ZK', supplyAPY: 15, borrowAPY: 22, ltv: 45, available: 1500000, protocol: 'zkSync', category: 'layer2', icon: '💠' },
        { id: 'mnt-lend', asset: 'MNT', supplyAPY: 9, borrowAPY: 14, ltv: 55, available: 4000000, protocol: 'Mantle', category: 'layer2', icon: '🟢' },

        // === SOLANA ECOSYSTEM ===
        { id: 'sol-lend', asset: 'SOL', supplyAPY: 5, borrowAPY: 8, ltv: 70, available: 100000, protocol: 'Kamino', category: 'solana', icon: '◎' },
        { id: 'msol-lend', asset: 'mSOL', supplyAPY: 6, borrowAPY: 9, ltv: 70, available: 50000, protocol: 'Kamino', category: 'solana', icon: '◎' },
        { id: 'jitosol-lend', asset: 'jitoSOL', supplyAPY: 6.5, borrowAPY: 9.5, ltv: 70, available: 40000, protocol: 'Kamino', category: 'solana', icon: '◎' },
        { id: 'jup-lend', asset: 'JUP', supplyAPY: 10, borrowAPY: 15, ltv: 50, available: 5000000, protocol: 'Kamino', category: 'solana', icon: '🪐' },
        { id: 'ray-lend', asset: 'RAY', supplyAPY: 12, borrowAPY: 18, ltv: 45, available: 2000000, protocol: 'Solend', category: 'solana', icon: '💎' },

        // === ALTERNATIVE L1s ===
        { id: 'avax-lend', asset: 'AVAX', supplyAPY: 4, borrowAPY: 7, ltv: 70, available: 200000, protocol: 'Aave', category: 'alt-l1', icon: '🔺' },
        { id: 'atom-lend', asset: 'ATOM', supplyAPY: 5, borrowAPY: 8, ltv: 65, available: 150000, protocol: 'Cosmos', category: 'alt-l1', icon: '⚛️' },
        { id: 'dot-lend', asset: 'DOT', supplyAPY: 6, borrowAPY: 9, ltv: 60, available: 500000, protocol: 'Polkadot', category: 'alt-l1', icon: '🔴' },
        { id: 'near-lend', asset: 'NEAR', supplyAPY: 7, borrowAPY: 11, ltv: 55, available: 1000000, protocol: 'Burrow', category: 'alt-l1', icon: '🌐' },
        { id: 'sui-lend', asset: 'SUI', supplyAPY: 8, borrowAPY: 12, ltv: 55, available: 2000000, protocol: 'Scallop', category: 'alt-l1', icon: '💧' },
        { id: 'apt-lend', asset: 'APT', supplyAPY: 6, borrowAPY: 10, ltv: 55, available: 800000, protocol: 'Aptos', category: 'alt-l1', icon: '🔷' },
    ],

    categories: {
        stable: { name: 'Stablecoin Markets', color: '#22c55e', description: 'High LTV, stable rates' },
        bluechip: { name: 'Blue Chip Crypto', color: '#3b82f6', description: 'ETH/BTC collateral' },
        defi: { name: 'DeFi Governance', color: '#8b5cf6', description: 'Protocol tokens' },
        layer2: { name: 'Layer 2 Tokens', color: '#f59e0b', description: 'L2 native tokens' },
        solana: { name: 'Solana Ecosystem', color: '#14f195', description: 'SOL & SPL tokens' },
        'alt-l1': { name: 'Alternative L1s', color: '#ec4899', description: 'Other blockchains' }
    },

    supplies: [],
    borrows: [],

    init() {
        this.load();
        console.log('Lending Module initialized - ' + this.markets.length + ' markets available');
    },

    load() {
        this.supplies = SafeOps.getStorage('obelisk_lending_supply', []);
        this.borrows = SafeOps.getStorage('obelisk_lending_borrow', []);
    },

    save() {
        SafeOps.setStorage('obelisk_lending_supply', this.supplies);
        SafeOps.setStorage('obelisk_lending_borrow', this.borrows);
    },

    supply(marketId, amount) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market || amount < 10) return { success: false, error: 'Min $10' };
        const sup = { id: 'sup-' + Date.now(), marketId, amount, startDate: Date.now(), apy: market.supplyAPY };
        this.supplies.push(sup);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(sup.id, market.asset + ' Supply', amount, market.supplyAPY, 'lending', true);
        return { success: true, supply: sup };
    },

    borrow(marketId, amount, collateralAmount) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market) return { success: false, error: 'Market not found' };
        const maxBorrow = collateralAmount * (market.ltv / 100);
        if (amount > maxBorrow) return { success: false, error: 'Max borrow: $' + maxBorrow.toFixed(2) };
        const loan = { id: 'brw-' + Date.now(), marketId, amount, collateral: collateralAmount, startDate: Date.now(), apy: market.borrowAPY };
        this.borrows.push(loan);
        this.save();
        return { success: true, loan };
    },

    repay(loanId, amount) {
        const idx = this.borrows.findIndex(b => b.id === loanId);
        if (idx === -1) return { success: false };
        const loan = this.borrows[idx];
        const days = (Date.now() - loan.startDate) / 86400000;
        const interest = loan.amount * (loan.apy / 100) * (days / 365);
        const totalOwed = loan.amount + interest;
        if (amount >= totalOwed) {
            this.borrows.splice(idx, 1);
            this.save();
            return { success: true, collateralReturned: loan.collateral };
        }
        loan.amount -= (amount - interest);
        this.save();
        return { success: true, remaining: loan.amount };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = '<h3 style="color:#00ff88;margin-bottom:16px;">Lending Markets (' + this.markets.length + ' assets)</h3>';

        // Render by category
        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catMarkets = this.markets.filter(m => m.category === catKey);
            if (catMarkets.length === 0) return;

            html += '<div style="margin-bottom:24px;">';
            html += '<h4 style="color:' + cat.color + ';margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ' + cat.color + ';">' + cat.name + ' <span style="font-size:11px;opacity:0.7;">(' + catMarkets.length + ' markets) - ' + cat.description + '</span></h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">';

            catMarkets.forEach(m => {
                html += '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;">';
                html += '<div style="font-weight:bold;font-size:14px;margin-bottom:6px;">' + (m.icon || '') + ' ' + m.asset + '</div>';
                html += '<div style="font-size:10px;color:#888;">' + m.protocol + '</div>';
                html += '<div style="display:flex;justify-content:space-between;margin:6px 0;">';
                html += '<span style="color:#00ff88;font-size:12px;">Supply: ' + m.supplyAPY + '%</span>';
                html += '<span style="color:#f59e0b;font-size:12px;">Borrow: ' + m.borrowAPY + '%</span>';
                html += '</div>';
                html += '<div style="font-size:10px;color:#888;">LTV: ' + m.ltv + '%</div>';
                html += '<div style="display:flex;gap:6px;margin-top:8px;">';
                html += '<button onclick="LendingModule.showSupplyModal(\'' + m.id + '\')" style="flex:1;padding:6px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:10px;">Supply</button>';
                html += '<button onclick="LendingModule.showBorrowModal(\'' + m.id + '\')" style="flex:1;padding:6px;background:#f59e0b;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:10px;">Borrow</button>';
                html += '</div>';
                html += '</div>';
            });

            html += '</div></div>';
        });

        el.innerHTML = html;
    },

    showSupplyModal(marketId) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market) return;

        // Use InvestHelper for dual mode (Simulated/Real)
        // Lending risk based on LTV and APY
        const riskLevel = market.ltv > 80 ? 2 : (market.supplyAPY > 10 ? 3 : 2);
        if (typeof InvestHelper !== 'undefined') {
            InvestHelper.show({
                name: market.asset + ' Supply (' + market.protocol + ')',
                id: market.id,
                apy: market.supplyAPY,
                minInvest: 10,
                fee: 0,
                risk: riskLevel,
                icon: market.icon || '🏦',
                onInvest: (amount, mode) => {
                    this.executeSupply(market, amount, mode);
                }
            });
        } else {
            this.showSimpleSupplyModal(marketId);
        }
    },

    executeSupply(market, amount, mode) {
        if (mode === 'simulated') {
            const result = this.supply(market.id, amount);
            if (!result.success && typeof showNotification === 'function') {
                showNotification(result.error, 'error');
            }
        } else {
            // Real mode - would integrate with actual lending protocols
            if (typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected()) {
                console.log('[LENDING] Real supply:', amount, market.asset);
                if (typeof showNotification === 'function') {
                    showNotification('Real supply submitted for $' + amount + ' ' + market.asset, 'success');
                }
            }
        }
    },

    showSimpleSupplyModal(marketId) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market) return;

        const existing = document.getElementById('lending-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'lending-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:500;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:#00ff88;margin:0 0 16px;">${market.icon || ''} Supply ${market.asset}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Supply APY:</span>
                        <span style="color:#00ff88;font-weight:bold;">${market.supplyAPY}%</span>
                    </div>
                </div>
                <div style="margin-bottom:16px;">
                    <input type="number" id="supply-amount" min="10" placeholder="${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Entrez le montant...' : 'Enter amount...'}" style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="background:linear-gradient(135deg,rgba(0,212,170,0.1),rgba(0,212,170,0.05));border:1px solid rgba(0,212,170,0.3);border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="color:#00d4aa;font-size:11px;font-weight:600;text-align:center;margin-bottom:8px;">📥 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Fournir' : 'Supply'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="LendingModule.confirmSupply('${market.id}',true)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">🎮 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'SIMULÉ' : 'SIMULATED'}</button>
                        <button onclick="LendingModule.confirmSupply('${market.id}',false)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#00d4aa,#00a884);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">💎 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'RÉEL' : 'REAL'}</button>
                    </div>
                </div>
                <div style="background:linear-gradient(135deg,rgba(255,159,67,0.1),rgba(255,159,67,0.05));border:1px solid rgba(255,159,67,0.3);border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="color:#ff9f43;font-size:11px;font-weight:600;text-align:center;margin-bottom:8px;">📤 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Retirer' : 'Withdraw'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="LendingModule.confirmWithdrawSupply('${market.id}',true)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,rgba(168,85,247,0.3),rgba(168,85,247,0.2));border:1px solid rgba(168,85,247,0.5);color:#ddd;font-size:11px;font-weight:600;cursor:pointer;">🎮 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'SIMULÉ' : 'SIMULATED'}</button>
                        <button onclick="LendingModule.confirmWithdrawSupply('${market.id}',false)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,rgba(0,212,170,0.3),rgba(0,212,170,0.2));border:1px solid rgba(0,212,170,0.5);color:#ddd;font-size:11px;font-weight:600;cursor:pointer;">💎 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'RÉEL' : 'REAL'}</button>
                    </div>
                </div>
                <button onclick="document.getElementById('lending-modal').remove()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#aaa;cursor:pointer;">${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Annuler' : 'Cancel'}</button>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => document.getElementById('supply-amount').focus(), 100);
    },

    confirmSupply(marketId, isSimulated = true) {
        const amount = parseFloat(document.getElementById('supply-amount').value);
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        if (!amount || amount < 10) {
            alert(isFr ? 'Minimum: $10' : 'Minimum supply is $10');
            return;
        }

        if (!isSimulated) {
            const walletConnected = (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) ||
                                    (typeof WalletConnect !== 'undefined' && WalletConnect.connected);
            if (!walletConnected) {
                if (typeof showNotification === 'function') {
                    showNotification(isFr ? 'Connectez votre wallet pour fournir en réel' : 'Connect wallet to supply real funds', 'warning');
                }
                return;
            }
        }

        const result = this.supply(marketId, amount, isSimulated);
        document.getElementById('lending-modal').remove();

        if (result.success) {
            const market = this.markets.find(m => m.id === marketId);
            const modeText = isSimulated ? '🎮' : '💎';
            if (typeof showNotification === 'function') {
                showNotification(modeText + ' ' + (isFr ? 'Fourni $' : 'Supplied $') + amount + ' ' + market.asset, 'success');
            }
        } else {
            alert(result.error || (isFr ? 'Échec' : 'Supply failed'));
        }
    },

    showBorrowModal(marketId) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market) return;

        const existing = document.getElementById('lending-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'lending-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:500;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:#f59e0b;margin:0 0 16px;">${market.icon || ''} Borrow ${market.asset}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Protocol:</span>
                        <span>${market.protocol}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Borrow APY:</span>
                        <span style="color:#f59e0b;font-weight:bold;">${market.borrowAPY}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Max LTV:</span>
                        <span>${market.ltv}%</span>
                    </div>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">Collateral Amount (USD)</label>
                    <input type="number" id="collateral-amount" min="10" placeholder="Enter collateral..." style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;color:#888;margin-bottom:6px;font-size:12px;">Borrow Amount (Max: <span id="max-borrow">-</span>)</label>
                    <input type="number" id="borrow-amount" min="10" placeholder="Enter amount..." style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:8px;margin-bottom:16px;font-size:11px;color:#ef4444;">
                    ⚠️ ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'L\'emprunt nécessite un collatéral. Si le LTV dépasse ' + market.ltv + '%, votre position sera liquidée.' : 'Borrowing requires collateral. If LTV exceeds ' + market.ltv + '%, your position may be liquidated.'}
                </div>
                <div style="background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.05));border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="color:#f59e0b;font-size:11px;font-weight:600;text-align:center;margin-bottom:8px;">💰 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Emprunter' : 'Borrow'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="LendingModule.confirmBorrow('${market.id}',true)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">🎮 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'SIMULÉ' : 'SIMULATED'}</button>
                        <button onclick="LendingModule.confirmBorrow('${market.id}',false)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">💎 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'RÉEL' : 'REAL'}</button>
                    </div>
                </div>
                <div style="background:linear-gradient(135deg,rgba(34,197,94,0.1),rgba(34,197,94,0.05));border:1px solid rgba(34,197,94,0.3);border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="color:#22c55e;font-size:11px;font-weight:600;text-align:center;margin-bottom:8px;">💸 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Rembourser' : 'Repay'}</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="LendingModule.confirmRepay('${market.id}',true)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,rgba(168,85,247,0.3),rgba(168,85,247,0.2));border:1px solid rgba(168,85,247,0.5);color:#ddd;font-size:11px;font-weight:600;cursor:pointer;">🎮 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'SIMULÉ' : 'SIMULATED'}</button>
                        <button onclick="LendingModule.confirmRepay('${market.id}',false)" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,rgba(34,197,94,0.3),rgba(34,197,94,0.2));border:1px solid rgba(34,197,94,0.5);color:#ddd;font-size:11px;font-weight:600;cursor:pointer;">💎 ${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'RÉEL' : 'REAL'}</button>
                    </div>
                </div>
                <button onclick="document.getElementById('lending-modal').remove()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#aaa;cursor:pointer;">${typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Annuler' : 'Cancel'}</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Update max borrow when collateral changes
        const collateralInput = document.getElementById('collateral-amount');
        collateralInput.addEventListener('input', () => {
            const collateral = parseFloat(collateralInput.value) || 0;
            const maxBorrow = collateral * (market.ltv / 100);
            document.getElementById('max-borrow').textContent = '$' + maxBorrow.toFixed(2);
        });

        setTimeout(() => collateralInput.focus(), 100);
    },

    confirmBorrow(marketId, isSimulated = true) {
        const market = this.markets.find(m => m.id === marketId);
        const collateral = parseFloat(document.getElementById('collateral-amount').value);
        const amount = parseFloat(document.getElementById('borrow-amount').value);
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        if (!collateral || collateral < 10) {
            alert(isFr ? 'Collatéral minimum: $10' : 'Minimum collateral is $10');
            return;
        }

        const maxBorrow = collateral * (market.ltv / 100);
        if (!amount || amount > maxBorrow) {
            alert((isFr ? 'Emprunt maximum: $' : 'Maximum borrow is $') + maxBorrow.toFixed(2));
            return;
        }

        if (!isSimulated) {
            const walletConnected = (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) ||
                                    (typeof WalletConnect !== 'undefined' && WalletConnect.connected);
            if (!walletConnected) {
                if (typeof showNotification === 'function') {
                    showNotification(isFr ? 'Connectez votre wallet pour emprunter en réel' : 'Connect wallet to borrow real funds', 'warning');
                }
                return;
            }
        }

        const result = this.borrow(marketId, amount, collateral, isSimulated);
        document.getElementById('lending-modal').remove();

        if (result.success) {
            const modeText = isSimulated ? '🎮' : '💎';
            if (typeof showNotification === 'function') {
                showNotification(modeText + ' ' + (isFr ? 'Emprunté $' : 'Borrowed $') + amount + ' ' + market.asset, 'success');
            }
        } else {
            alert(result.error || (isFr ? 'Emprunt échoué' : 'Borrow failed'));
        }
    },

    quickSupply(marketId) {
        this.showSupplyModal(marketId);
    },

    quickBorrow(marketId) {
        this.showBorrowModal(marketId);
    },

    confirmWithdrawSupply(marketId, isSimulated = true) {
        const market = this.markets.find(m => m.id === marketId);
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        // Find user's supply in this market
        const supply = this.supplies.find(s => s.marketId === marketId);
        if (!supply) {
            if (typeof showNotification === 'function') {
                showNotification(isFr ? 'Aucun dépôt trouvé pour ce marché' : 'No supply found for this market', 'warning');
            }
            return;
        }

        if (!isSimulated) {
            const walletConnected = (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) ||
                                    (typeof WalletConnect !== 'undefined' && WalletConnect.connected);
            if (!walletConnected) {
                if (typeof showNotification === 'function') {
                    showNotification(isFr ? 'Connectez votre wallet pour retirer en réel' : 'Connect wallet to withdraw real funds', 'warning');
                }
                return;
            }
        }

        // Calculate interest
        const days = (Date.now() - supply.startDate) / 86400000;
        const interest = supply.amount * (supply.apy / 100) * (days / 365);
        const totalAmount = supply.amount + interest;

        // Remove from supplies
        const idx = this.supplies.findIndex(s => s.id === supply.id);
        if (idx !== -1) {
            this.supplies.splice(idx, 1);
            this.save();
        }

        const modal = document.getElementById('lending-modal');
        if (modal) modal.remove();

        const modeText = isSimulated ? '🎮' : '💎';
        if (typeof showNotification === 'function') {
            showNotification(modeText + ' ' + (isFr ? 'Retiré $' : 'Withdrawn $') + totalAmount.toFixed(2) + ' ' + market.asset, 'success');
        }
        // Update SimulatedPortfolio if exists
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.removeInvestment) {
            SimulatedPortfolio.removeInvestment(supply.id);
        }
    },

    confirmRepay(marketId, isSimulated = true) {
        const market = this.markets.find(m => m.id === marketId);
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        // Find user's borrow in this market
        const borrow = this.borrows.find(b => b.marketId === marketId);
        if (!borrow) {
            if (typeof showNotification === 'function') {
                showNotification(isFr ? 'Aucun emprunt trouvé pour ce marché' : 'No borrow found for this market', 'warning');
            }
            return;
        }

        if (!isSimulated) {
            const walletConnected = (typeof WalletManager !== 'undefined' && WalletManager.isUnlocked) ||
                                    (typeof WalletConnect !== 'undefined' && WalletConnect.connected);
            if (!walletConnected) {
                if (typeof showNotification === 'function') {
                    showNotification(isFr ? 'Connectez votre wallet pour rembourser en réel' : 'Connect wallet to repay real funds', 'warning');
                }
                return;
            }
        }

        // Calculate interest owed
        const days = (Date.now() - borrow.startDate) / 86400000;
        const interest = borrow.amount * (borrow.apy / 100) * (days / 365);
        const totalOwed = borrow.amount + interest;

        // Repay full amount
        const result = this.repay(borrow.id, totalOwed);
        const modal = document.getElementById('lending-modal');
        if (modal) modal.remove();

        if (result.success) {
            const modeText = isSimulated ? '🎮' : '💎';
            if (typeof showNotification === 'function') {
                showNotification(modeText + ' ' + (isFr ? 'Remboursé $' : 'Repaid $') + totalOwed.toFixed(2) + ' ' + market.asset, 'success');
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification(isFr ? 'Remboursement échoué' : 'Repayment failed', 'error');
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => LendingModule.init());
