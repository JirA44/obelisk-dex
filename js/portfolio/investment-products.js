// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - INVESTMENT PRODUCTS
// Complete suite: Staking, Pools, Vaults, Lending, Savings, Index Funds
// ═══════════════════════════════════════════════════════════════════════════════

const InvestmentProducts = {
    // ═══════════════════════════════════════════════════════════════════════════
    // STAKING PRODUCTS
    // ═══════════════════════════════════════════════════════════════════════════
    staking: {
        products: [
            {
                id: 'eth-staking',
                name: 'ETH 2.0 Staking',
                token: 'ETH',
                icon: '⟠',
                apy: 4.2,
                minAmount: 0.01,
                lockPeriod: 0, // Flexible
                tvl: 2450000000,
                risk: 'low',
                description: 'Stake ETH to secure the network and earn rewards',
                rewards: 'ETH',
                autoCompound: true
            },
            {
                id: 'sol-staking',
                name: 'Solana Staking',
                token: 'SOL',
                icon: '◎',
                apy: 7.1,
                minAmount: 0.1,
                lockPeriod: 0,
                tvl: 890000000,
                risk: 'low',
                description: 'Delegate SOL to validators and earn staking rewards',
                rewards: 'SOL',
                autoCompound: true
            },
            {
                id: 'atom-staking',
                name: 'Cosmos Staking',
                token: 'ATOM',
                icon: '⚛',
                apy: 12.5,
                minAmount: 1,
                lockPeriod: 21, // 21 days unbonding
                tvl: 340000000,
                risk: 'low',
                description: 'Stake ATOM with 21-day unbonding period',
                rewards: 'ATOM',
                autoCompound: false
            },
            {
                id: 'dot-staking',
                name: 'Polkadot Staking',
                token: 'DOT',
                icon: '●',
                apy: 11.8,
                minAmount: 10,
                lockPeriod: 28,
                tvl: 520000000,
                risk: 'low',
                description: 'Nominate validators on Polkadot',
                rewards: 'DOT',
                autoCompound: false
            },
            {
                id: 'avax-staking',
                name: 'Avalanche Staking',
                token: 'AVAX',
                icon: '🔺',
                apy: 8.3,
                minAmount: 0.5,
                lockPeriod: 14,
                tvl: 280000000,
                risk: 'low',
                description: 'Delegate AVAX to validators',
                rewards: 'AVAX',
                autoCompound: true
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LIQUIDITY POOLS
    // ═══════════════════════════════════════════════════════════════════════════
    pools: {
        products: [
            {
                id: 'eth-usdc-pool',
                name: 'ETH/USDC',
                tokens: ['ETH', 'USDC'],
                icons: ['⟠', '$'],
                apy: 18.5,
                apr: 15.2,
                feeApr: 12.1,
                rewardApr: 3.1,
                tvl: 890000000,
                volume24h: 125000000,
                fee: 0.3,
                risk: 'medium',
                impermanentLoss: 'Medium exposure to IL',
                protocol: 'Uniswap V3'
            },
            {
                id: 'btc-eth-pool',
                name: 'WBTC/ETH',
                tokens: ['WBTC', 'ETH'],
                icons: ['₿', '⟠'],
                apy: 12.3,
                apr: 10.5,
                feeApr: 8.2,
                rewardApr: 2.3,
                tvl: 560000000,
                volume24h: 78000000,
                fee: 0.3,
                risk: 'medium',
                impermanentLoss: 'Low IL (correlated assets)',
                protocol: 'Uniswap V3'
            },
            {
                id: 'usdc-usdt-pool',
                name: 'USDC/USDT',
                tokens: ['USDC', 'USDT'],
                icons: ['$', '₮'],
                apy: 8.2,
                apr: 7.8,
                feeApr: 7.8,
                rewardApr: 0,
                tvl: 1200000000,
                volume24h: 450000000,
                fee: 0.01,
                risk: 'low',
                impermanentLoss: 'Negligible (stablecoins)',
                protocol: 'Curve'
            },
            {
                id: 'sol-usdc-pool',
                name: 'SOL/USDC',
                tokens: ['SOL', 'USDC'],
                icons: ['◎', '$'],
                apy: 32.5,
                apr: 28.1,
                feeApr: 18.5,
                rewardApr: 9.6,
                tvl: 340000000,
                volume24h: 89000000,
                fee: 0.25,
                risk: 'medium-high',
                impermanentLoss: 'High exposure to IL',
                protocol: 'Raydium'
            },
            {
                id: 'eth-steth-pool',
                name: 'ETH/stETH',
                tokens: ['ETH', 'stETH'],
                icons: ['⟠', '⟠'],
                apy: 5.8,
                apr: 5.5,
                feeApr: 1.2,
                rewardApr: 4.3,
                tvl: 2100000000,
                volume24h: 35000000,
                fee: 0.04,
                risk: 'low',
                impermanentLoss: 'Minimal (pegged assets)',
                protocol: 'Curve'
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // VAULTS (Automated Strategies)
    // ═══════════════════════════════════════════════════════════════════════════
    vaults: {
        products: [
            {
                id: 'eth-yield-max',
                name: 'ETH Yield Maximizer',
                token: 'ETH',
                icon: '⟠',
                apy: 15.8,
                tvl: 180000000,
                risk: 'medium',
                strategy: 'Leveraged staking + LP rewards',
                protocols: ['Lido', 'Aave', 'Curve'],
                autoCompound: true,
                harvestFreq: '4 hours',
                performanceFee: 10,
                depositFee: 0,
                withdrawFee: 0.1
            },
            {
                id: 'stable-optimizer',
                name: 'Stablecoin Optimizer',
                token: 'USDC',
                icon: '$',
                apy: 12.4,
                tvl: 450000000,
                risk: 'low',
                strategy: 'Best rate lending + LP farming',
                protocols: ['Aave', 'Compound', 'Curve'],
                autoCompound: true,
                harvestFreq: '1 hour',
                performanceFee: 8,
                depositFee: 0,
                withdrawFee: 0
            },
            {
                id: 'btc-hodl-yield',
                name: 'BTC HODL Yield',
                token: 'WBTC',
                icon: '₿',
                apy: 8.2,
                tvl: 290000000,
                risk: 'low-medium',
                strategy: 'Lending optimization + covered calls',
                protocols: ['Aave', 'GMX'],
                autoCompound: true,
                harvestFreq: '6 hours',
                performanceFee: 12,
                depositFee: 0,
                withdrawFee: 0.05
            },
            {
                id: 'delta-neutral',
                name: 'Delta Neutral Yield',
                token: 'USDC',
                icon: '⚖️',
                apy: 25.5,
                tvl: 120000000,
                risk: 'medium',
                strategy: 'Funding rate arbitrage + hedged LP',
                protocols: ['GMX', 'Hyperliquid', 'Aave'],
                autoCompound: true,
                harvestFreq: '30 min',
                performanceFee: 15,
                depositFee: 0,
                withdrawFee: 0.2
            },
            {
                id: 'high-yield-degen',
                name: 'High Yield Degen',
                token: 'ETH',
                icon: '🔥',
                apy: 85.0,
                tvl: 45000000,
                risk: 'high',
                strategy: 'New protocol farming + leverage',
                protocols: ['Various DeFi'],
                autoCompound: true,
                harvestFreq: '15 min',
                performanceFee: 20,
                depositFee: 0,
                withdrawFee: 0.5
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LENDING
    // ═══════════════════════════════════════════════════════════════════════════
    lending: {
        products: [
            {
                id: 'lend-eth',
                name: 'Lend ETH',
                token: 'ETH',
                icon: '⟠',
                supplyApy: 3.2,
                borrowApy: 4.8,
                utilization: 68,
                totalSupply: 890000000,
                totalBorrow: 605200000,
                collateralFactor: 0.82,
                liquidationThreshold: 0.86,
                risk: 'low'
            },
            {
                id: 'lend-usdc',
                name: 'Lend USDC',
                token: 'USDC',
                icon: '$',
                supplyApy: 8.5,
                borrowApy: 10.2,
                utilization: 78,
                totalSupply: 2100000000,
                totalBorrow: 1638000000,
                collateralFactor: 0.85,
                liquidationThreshold: 0.88,
                risk: 'low'
            },
            {
                id: 'lend-wbtc',
                name: 'Lend WBTC',
                token: 'WBTC',
                icon: '₿',
                supplyApy: 1.8,
                borrowApy: 3.5,
                utilization: 45,
                totalSupply: 450000000,
                totalBorrow: 202500000,
                collateralFactor: 0.75,
                liquidationThreshold: 0.80,
                risk: 'low'
            },
            {
                id: 'lend-sol',
                name: 'Lend SOL',
                token: 'SOL',
                icon: '◎',
                supplyApy: 5.2,
                borrowApy: 7.8,
                utilization: 62,
                totalSupply: 180000000,
                totalBorrow: 111600000,
                collateralFactor: 0.70,
                liquidationThreshold: 0.75,
                risk: 'medium'
            },
            {
                id: 'lend-dai',
                name: 'Lend DAI',
                token: 'DAI',
                icon: '◈',
                supplyApy: 7.8,
                borrowApy: 9.5,
                utilization: 72,
                totalSupply: 890000000,
                totalBorrow: 640800000,
                collateralFactor: 0.83,
                liquidationThreshold: 0.87,
                risk: 'low'
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SAVINGS ACCOUNTS
    // ═══════════════════════════════════════════════════════════════════════════
    savings: {
        products: [
            {
                id: 'flex-savings-usdc',
                name: 'Flexible USDC',
                token: 'USDC',
                icon: '$',
                apy: 4.5,
                minDeposit: 1,
                lockPeriod: 0,
                withdrawalFee: 0,
                insurance: true,
                tvl: 560000000,
                risk: 'very-low',
                description: 'Withdraw anytime, no fees'
            },
            {
                id: 'flex-savings-eth',
                name: 'Flexible ETH',
                token: 'ETH',
                icon: '⟠',
                apy: 2.8,
                minDeposit: 0.001,
                lockPeriod: 0,
                withdrawalFee: 0,
                insurance: true,
                tvl: 320000000,
                risk: 'very-low',
                description: 'Earn on your ETH with flexibility'
            },
            {
                id: 'locked-30d-usdc',
                name: '30-Day USDC',
                token: 'USDC',
                icon: '$',
                apy: 6.2,
                minDeposit: 100,
                lockPeriod: 30,
                withdrawalFee: 1,
                insurance: true,
                tvl: 280000000,
                risk: 'very-low',
                description: 'Lock for 30 days, higher yield'
            },
            {
                id: 'locked-90d-usdc',
                name: '90-Day USDC',
                token: 'USDC',
                icon: '$',
                apy: 8.5,
                minDeposit: 500,
                lockPeriod: 90,
                withdrawalFee: 2,
                insurance: true,
                tvl: 180000000,
                risk: 'very-low',
                description: 'Best rate for 90-day lock'
            },
            {
                id: 'locked-365d-btc',
                name: '1-Year BTC',
                token: 'WBTC',
                icon: '₿',
                apy: 5.2,
                minDeposit: 0.001,
                lockPeriod: 365,
                withdrawalFee: 3,
                insurance: true,
                tvl: 120000000,
                risk: 'low',
                description: 'Long-term BTC savings'
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // INDEX FUNDS
    // ═══════════════════════════════════════════════════════════════════════════
    indexFunds: {
        products: [
            {
                id: 'top10-index',
                name: 'Crypto Top 10',
                symbol: 'TOP10',
                icon: '📊',
                price: 145.32,
                change24h: 2.8,
                aum: 890000000,
                holdings: [
                    { token: 'BTC', weight: 45 },
                    { token: 'ETH', weight: 25 },
                    { token: 'SOL', weight: 8 },
                    { token: 'BNB', weight: 6 },
                    { token: 'XRP', weight: 5 },
                    { token: 'ADA', weight: 4 },
                    { token: 'AVAX', weight: 3 },
                    { token: 'DOT', weight: 2 },
                    { token: 'MATIC', weight: 1 },
                    { token: 'LINK', weight: 1 }
                ],
                managementFee: 0.5,
                rebalanceFreq: 'Monthly',
                risk: 'medium',
                description: 'Top 10 cryptocurrencies by market cap'
            },
            {
                id: 'defi-index',
                name: 'DeFi Leaders',
                symbol: 'DEFI',
                icon: '🏦',
                price: 89.45,
                change24h: 4.2,
                aum: 340000000,
                holdings: [
                    { token: 'AAVE', weight: 20 },
                    { token: 'UNI', weight: 18 },
                    { token: 'MKR', weight: 15 },
                    { token: 'CRV', weight: 12 },
                    { token: 'COMP', weight: 10 },
                    { token: 'SNX', weight: 8 },
                    { token: 'LDO', weight: 7 },
                    { token: 'SUSHI', weight: 5 },
                    { token: 'YFI', weight: 3 },
                    { token: '1INCH', weight: 2 }
                ],
                managementFee: 0.75,
                rebalanceFreq: 'Weekly',
                risk: 'medium-high',
                description: 'Leading DeFi protocol tokens'
            },
            {
                id: 'layer2-index',
                name: 'Layer 2 Index',
                symbol: 'L2IDX',
                icon: '⚡',
                price: 52.18,
                change24h: 5.8,
                aum: 180000000,
                holdings: [
                    { token: 'ARB', weight: 30 },
                    { token: 'OP', weight: 25 },
                    { token: 'MATIC', weight: 20 },
                    { token: 'IMX', weight: 10 },
                    { token: 'METIS', weight: 8 },
                    { token: 'BOBA', weight: 4 },
                    { token: 'ZKS', weight: 3 }
                ],
                managementFee: 0.6,
                rebalanceFreq: 'Bi-weekly',
                risk: 'high',
                description: 'Ethereum Layer 2 scaling solutions'
            },
            {
                id: 'ai-index',
                name: 'AI & Compute',
                symbol: 'AIDX',
                icon: '🤖',
                price: 78.90,
                change24h: 8.5,
                aum: 220000000,
                holdings: [
                    { token: 'RNDR', weight: 25 },
                    { token: 'FET', weight: 20 },
                    { token: 'AGIX', weight: 18 },
                    { token: 'OCEAN', weight: 15 },
                    { token: 'TAO', weight: 12 },
                    { token: 'AKT', weight: 10 }
                ],
                managementFee: 0.8,
                rebalanceFreq: 'Weekly',
                risk: 'high',
                description: 'AI and decentralized compute tokens'
            },
            {
                id: 'stables-index',
                name: 'Stable Yield',
                symbol: 'STBL',
                icon: '💵',
                price: 100.12,
                change24h: 0.01,
                aum: 650000000,
                holdings: [
                    { token: 'USDC', weight: 35 },
                    { token: 'USDT', weight: 30 },
                    { token: 'DAI', weight: 20 },
                    { token: 'FRAX', weight: 10 },
                    { token: 'LUSD', weight: 5 }
                ],
                managementFee: 0.25,
                rebalanceFreq: 'Daily',
                risk: 'very-low',
                description: 'Diversified stablecoin yield'
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    formatTVL(value) {
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
    },

    getRiskColor(risk) {
        const colors = {
            'very-low': '#00ff88',
            'low': '#4ade80',
            'low-medium': '#a3e635',
            'medium': '#facc15',
            'medium-high': '#fb923c',
            'high': '#f87171'
        };
        return colors[risk] || '#888';
    },

    getRiskLabel(risk, lang = 'en') {
        const labels = {
            en: {
                'very-low': 'Very Low',
                'low': 'Low',
                'low-medium': 'Low-Medium',
                'medium': 'Medium',
                'medium-high': 'Medium-High',
                'high': 'High'
            },
            fr: {
                'very-low': 'Très Faible',
                'low': 'Faible',
                'low-medium': 'Faible-Moyen',
                'medium': 'Moyen',
                'medium-high': 'Moyen-Élevé',
                'high': 'Élevé'
            }
        };
        return (labels[lang] || labels.en)[risk] || risk;
    },

    // Calculate projected returns
    calculateReturns(amount, apy, days) {
        const dailyRate = apy / 100 / 365;
        return amount * Math.pow(1 + dailyRate, days) - amount;
    }
};

window.InvestmentProducts = InvestmentProducts;
console.log('📦 Investment Products loaded');
