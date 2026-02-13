/**
 * PRODUCTS LOADER - Auto-merge with InvestmentProducts (3000+ products)
 * Automatically loads products into all modules
 */

(function() {
    'use strict';

    console.log('[PRODUCTS-LOADER] Initializing...');

    function waitForProducts(callback, maxTries = 50) {
        let tries = 0;
        const check = () => {
            tries++;
            if (typeof InvestmentProducts !== 'undefined') {
                callback();
            } else if (tries < maxTries) {
                setTimeout(check, 100);
            } else {
                console.warn('[PRODUCTS-LOADER] InvestmentProducts not found after', maxTries, 'tries');
            }
        };
        check();
    }

    waitForProducts(() => {
        console.log('[PRODUCTS-LOADER] InvestmentProducts found, loading into modules...');

        // Module to InvestmentProducts category mapping
        const moduleMapping = {
            StakingModule: { source: 'staking', targetProp: 'pools', transform: stakingTransform },
            VaultsModule: { source: 'vaults', targetProp: 'vaults', transform: vaultsTransform },
            LiquidityPoolsModule: { source: 'pools', targetProp: 'pools', transform: poolsTransform },
            LendingModule: { source: 'lending', targetProp: 'markets', transform: lendingTransform },
            SavingsModule: { source: 'savings', targetProp: 'products', transform: savingsTransform },
            CombosModule: { source: 'combos', targetProp: 'combos', transform: combosTransform },
            IndexFundsModule: { source: 'indexFunds', targetProp: 'funds', transform: indexTransform }
        };

        // Transformers
        function stakingTransform(p) {
            return {
                id: p.id,
                name: (p.icon || '') + ' ' + p.name,
                token: p.token,
                apy: p.apy || 0,
                minStake: p.minAmount || p.minInvest || 1,
                lockDays: p.lockPeriod || 0,
                icon: p.icon || '🔒',
                risk: p.risk || 'medium',
                category: 'imported',
                description: p.description,
                tvl: p.tvl,
                autoCompound: p.autoCompound
            };
        }

        function vaultsTransform(p) {
            return {
                id: p.id,
                name: (p.icon || '') + ' ' + p.name,
                token: p.token || 'USDC',
                apy: p.apy || 0,
                strategy: p.strategy || p.description || 'Auto-compound',
                risk: p.risk || 'medium',
                tvl: p.tvl || 0,
                category: 'imported',
                icon: p.icon || '🏛️',
                minDeposit: p.minInvest || 1
            };
        }

        function poolsTransform(p) {
            return {
                id: p.id,
                name: p.name,
                tokens: p.tokens || [p.token, 'USDC'],
                apy: p.apy || 0,
                tvl: p.tvl || 0,
                fee: p.fee || 0.3,
                risk: p.risk || 'medium',
                dex: p.dex || 'Obelisk',
                category: 'imported',
                icon: p.icon || '💧'
            };
        }

        function lendingTransform(p) {
            return {
                id: p.id,
                name: (p.icon || '') + ' ' + p.name,
                token: p.token,
                supplyApy: p.supplyApy || p.apy || 0,
                borrowApy: p.borrowApy || (p.apy * 1.5) || 0,
                totalSupply: p.totalSupply || p.tvl || 0,
                utilization: p.utilization || 0.7,
                collateralFactor: p.collateralFactor || 0.75,
                category: 'imported',
                icon: p.icon || '🏦'
            };
        }

        function savingsTransform(p) {
            return {
                id: p.id,
                name: (p.icon || '') + ' ' + p.name,
                token: p.token || 'USDC',
                apy: p.apy || 0,
                minDeposit: p.minInvest || 1,
                lockDays: p.lockPeriod || 0,
                category: 'imported',
                icon: p.icon || '💰',
                description: p.description
            };
        }

        function combosTransform(p) {
            return {
                id: p.id,
                name: p.name,
                icon: p.icon || '🎯',
                description: p.description,
                riskLevel: p.riskLevel || p.risk || 'Medium',
                expectedApy: p.expectedApy || p.apy + '%',
                capitalProtection: p.capitalProtection || '80%',
                minInvestment: p.minInvestment || p.minInvest || 100,
                allocation: p.allocation || []
            };
        }

        function indexTransform(p) {
            return {
                id: p.id,
                name: p.name,
                symbol: p.symbol || p.token,
                icon: p.icon || '📊',
                price: p.price || 100,
                change24h: p.change24h || 0,
                aum: p.aum || p.tvl || 0,
                holdings: p.holdings || [],
                category: 'imported'
            };
        }

        // Load into each module
        let totalLoaded = 0;
        for (const [moduleName, config] of Object.entries(moduleMapping)) {
            const module = window[moduleName];
            const source = InvestmentProducts[config.source];

            if (module && source && source.products) {
                const products = source.products.map(config.transform);

                // Merge with existing products (avoid duplicates)
                const existingIds = new Set((module[config.targetProp] || []).map(p => p.id));
                const newProducts = products.filter(p => !existingIds.has(p.id));

                module[config.targetProp] = [...(module[config.targetProp] || []), ...newProducts];

                console.log(`[PRODUCTS-LOADER] ${moduleName}: +${newProducts.length} products (total: ${module[config.targetProp].length})`);
                totalLoaded += newProducts.length;
            }
        }

        console.log(`[PRODUCTS-LOADER] Total: ${totalLoaded} products loaded into modules`);
    });

})();
