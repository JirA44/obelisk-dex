// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - COMBOS MODULE
// Investment combo products with auto-allocation
// ═══════════════════════════════════════════════════════════════════════════════

const CombosModule = {
    combos: [],
    selectedCombo: null,

    // Combo definitions (static data - no API needed)
    comboData: [
        {
            id: 'CONSERVATIVE_YIELD',
            name: 'Conservative Yield',
            icon: '🛡️',
            description: 'Maximum security with stable returns',
            riskLevel: 'Low',
            expectedApy: '5-12%',
            capitalProtection: '95%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDC Staking', percent: 40, color: '#00d4aa', apy: '4-6%', maxLoss: 2 },
                { product: 'Treasury Bonds', percent: 35, color: '#4a9eff', apy: '5-8%', maxLoss: 3 },
                { product: 'Stable Vault', percent: 25, color: '#9966ff', apy: '6-10%', maxLoss: 5 }
            ]
        },
        {
            id: 'BLUE_CHIP_COMBO',
            name: 'Blue Chip Combo',
            icon: '💎',
            description: 'Focus on BTC & ETH with yield optimization',
            riskLevel: 'Medium',
            expectedApy: '15-25%',
            capitalProtection: '80%',
            minInvestment: 250,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Staking', percent: 35, color: '#627eea', apy: '8-12%', maxLoss: 15 },
                { product: 'BTC/ETH Vault', percent: 30, color: '#f7931a', apy: '15-25%', maxLoss: 25 },
                { product: 'DCA Mix', percent: 25, color: '#00d4aa', apy: '10-20%', maxLoss: 20 },
                { product: 'Bonds', percent: 10, color: '#4a9eff', apy: '5-8%', maxLoss: 5 }
            ]
        },
        {
            id: 'GROWTH_PORTFOLIO',
            name: 'Growth Portfolio',
            icon: '📈',
            description: 'Balanced growth with diversified altcoins',
            riskLevel: 'Medium',
            expectedApy: '20-35%',
            capitalProtection: '70%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'L1 Staking', percent: 30, color: '#00d4aa', apy: '12-18%', maxLoss: 20 },
                { product: 'DeFi Vault', percent: 25, color: '#ff6b9d', apy: '20-35%', maxLoss: 35 },
                { product: 'Altcoin DCA', percent: 25, color: '#ffaa00', apy: '25-50%', maxLoss: 40 },
                { product: 'LP Farming', percent: 20, color: '#9966ff', apy: '15-30%', maxLoss: 30 }
            ]
        },
        {
            id: 'DEGEN_MAX',
            name: 'Degen Max',
            icon: '🚀',
            description: 'High risk, high reward strategies',
            riskLevel: 'High',
            expectedApy: '40-80%',
            capitalProtection: '50%',
            minInvestment: 1000,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Leverage Vault', percent: 35, color: '#ff6464', apy: '50-100%', maxLoss: 60 },
                { product: 'Meme DCA', percent: 25, color: '#ffaa00', apy: '40-80%', maxLoss: 70 },
                { product: 'New Listings', percent: 25, color: '#00ff88', apy: '30-60%', maxLoss: 50 },
                { product: 'Arbitrage', percent: 15, color: '#4a9eff', apy: '20-40%', maxLoss: 25 }
            ]
        },
        {
            id: 'PASSIVE_INCOME',
            name: 'Passive Income',
            icon: '💰',
            description: 'Steady yield from staking and lending',
            riskLevel: 'Low',
            expectedApy: '8-15%',
            capitalProtection: '90%',
            minInvestment: 200,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Multi-Chain Staking', percent: 50, color: '#00d4aa', apy: '6-10%', maxLoss: 8 },
                { product: 'Lending Protocol', percent: 30, color: '#4a9eff', apy: '8-12%', maxLoss: 10 },
                { product: 'Stable LP', percent: 20, color: '#9966ff', apy: '10-15%', maxLoss: 12 }
            ]
        },
        {
            id: 'AI_QUANT',
            name: 'AI Quant Strategy',
            icon: '🤖',
            description: 'AI-driven market neutral strategies',
            riskLevel: 'Medium',
            expectedApy: '25-40%',
            capitalProtection: '75%',
            minInvestment: 500,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Grid Trading', percent: 30, color: '#00d4aa', apy: '20-35%', maxLoss: 20 },
                { product: 'Mean Reversion', percent: 25, color: '#627eea', apy: '25-40%', maxLoss: 25 },
                { product: 'Momentum', percent: 25, color: '#ffaa00', apy: '30-50%', maxLoss: 35 },
                { product: 'Arbitrage', percent: 20, color: '#ff6b9d', apy: '15-25%', maxLoss: 15 }
            ]
        },
        {
            id: 'STABLECOIN_FORTRESS',
            name: 'Stablecoin Fortress',
            icon: '🏰',
            description: 'Ultra-safe stablecoin yields across protocols',
            riskLevel: 'Low',
            expectedApy: '6-10%',
            capitalProtection: '99%',
            minInvestment: 50,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDC Lending', percent: 40, color: '#2775ca', apy: '5-8%', maxLoss: 1 },
                { product: 'USDT Staking', percent: 30, color: '#26a17b', apy: '4-7%', maxLoss: 1 },
                { product: 'DAI Savings', percent: 30, color: '#f5ac37', apy: '6-10%', maxLoss: 2 }
            ]
        },
        {
            id: 'ETH_MAXIMALIST',
            name: 'ETH Maximalist',
            icon: '💠',
            description: '100% Ethereum ecosystem exposure',
            riskLevel: 'Medium',
            expectedApy: '12-20%',
            capitalProtection: '75%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Staking (Lido)', percent: 40, color: '#00a3ff', apy: '4-5%', maxLoss: 20 },
                { product: 'ETH/stETH LP', percent: 30, color: '#627eea', apy: '8-15%', maxLoss: 15 },
                { product: 'ETH Options Vault', percent: 30, color: '#8c8dfc', apy: '15-25%', maxLoss: 30 }
            ]
        },
        {
            id: 'BTC_HODLER',
            name: 'BTC HODLer Plus',
            icon: '🪙',
            description: 'Bitcoin-focused yield with wrapped BTC',
            riskLevel: 'Medium',
            expectedApy: '8-15%',
            capitalProtection: '80%',
            minInvestment: 500,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'WBTC Lending', percent: 50, color: '#f7931a', apy: '3-6%', maxLoss: 25 },
                { product: 'BTC/ETH LP', percent: 30, color: '#627eea', apy: '10-18%', maxLoss: 20 },
                { product: 'BTC Covered Calls', percent: 20, color: '#ff9500', apy: '15-25%', maxLoss: 15 }
            ]
        },
        {
            id: 'SOLANA_SPEED',
            name: 'Solana Speed',
            icon: '⚡',
            description: 'High-performance Solana DeFi strategies',
            riskLevel: 'Medium',
            expectedApy: '18-30%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'SOL Staking', percent: 35, color: '#9945ff', apy: '7-9%', maxLoss: 25 },
                { product: 'Marinade Finance', percent: 25, color: '#00d18c', apy: '8-12%', maxLoss: 20 },
                { product: 'Raydium Farms', percent: 25, color: '#2dd4bf', apy: '25-40%', maxLoss: 35 },
                { product: 'Jupiter Perps', percent: 15, color: '#c7f284', apy: '30-50%', maxLoss: 40 }
            ]
        },
        {
            id: 'DEFI_BLUE_CHIP',
            name: 'DeFi Blue Chips',
            icon: '🔷',
            description: 'Top DeFi protocols with proven track record',
            riskLevel: 'Medium',
            expectedApy: '15-25%',
            capitalProtection: '75%',
            minInvestment: 300,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'AAVE Staking', percent: 30, color: '#b6509e', apy: '8-12%', maxLoss: 20 },
                { product: 'UNI LP', percent: 25, color: '#ff007a', apy: '15-25%', maxLoss: 25 },
                { product: 'CRV/CVX', percent: 25, color: '#0033ad', apy: '20-35%', maxLoss: 30 },
                { product: 'MKR Vault', percent: 20, color: '#1aab9b', apy: '10-18%', maxLoss: 20 }
            ]
        },
        {
            id: 'LAYER2_EXPLORER',
            name: 'Layer 2 Explorer',
            icon: '🌉',
            description: 'Arbitrum, Optimism, Base ecosystem',
            riskLevel: 'Medium',
            expectedApy: '20-35%',
            capitalProtection: '70%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ARB Staking', percent: 30, color: '#28a0f0', apy: '10-15%', maxLoss: 30 },
                { product: 'OP Rewards', percent: 25, color: '#ff0420', apy: '15-25%', maxLoss: 30 },
                { product: 'Base LP', percent: 25, color: '#0052ff', apy: '20-35%', maxLoss: 35 },
                { product: 'GMX/GLP', percent: 20, color: '#4fa8e3', apy: '25-40%', maxLoss: 25 }
            ]
        },
        {
            id: 'REAL_YIELD',
            name: 'Real Yield',
            icon: '💵',
            description: 'Protocols with real revenue sharing',
            riskLevel: 'Medium',
            expectedApy: '12-22%',
            capitalProtection: '80%',
            minInvestment: 250,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'GMX Staking', percent: 35, color: '#4fa8e3', apy: '15-25%', maxLoss: 25 },
                { product: 'GNS Staking', percent: 25, color: '#3ee6c4', apy: '10-20%', maxLoss: 30 },
                { product: 'RDNT Lending', percent: 20, color: '#00d395', apy: '12-18%', maxLoss: 25 },
                { product: 'Gains Network', percent: 20, color: '#00b897', apy: '15-25%', maxLoss: 30 }
            ]
        },
        {
            id: 'LIQUID_STAKING',
            name: 'Liquid Staking Pro',
            icon: '💧',
            description: 'LST tokens across multiple chains',
            riskLevel: 'Low',
            expectedApy: '8-14%',
            capitalProtection: '90%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'stETH (Lido)', percent: 35, color: '#00a3ff', apy: '4-5%', maxLoss: 10 },
                { product: 'rETH (Rocket)', percent: 25, color: '#ff7043', apy: '4-5%', maxLoss: 10 },
                { product: 'cbETH (Coinbase)', percent: 20, color: '#0052ff', apy: '4-5%', maxLoss: 8 },
                { product: 'mSOL (Marinade)', percent: 20, color: '#00d18c', apy: '7-9%', maxLoss: 15 }
            ]
        },
        {
            id: 'PERPETUAL_TRADER',
            name: 'Perpetual Trader',
            icon: '📊',
            description: 'Funding rate arbitrage and perp strategies',
            riskLevel: 'High',
            expectedApy: '30-60%',
            capitalProtection: '60%',
            minInvestment: 500,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Funding Arb', percent: 40, color: '#00ff88', apy: '20-40%', maxLoss: 30 },
                { product: 'Delta Neutral', percent: 30, color: '#4a9eff', apy: '25-45%', maxLoss: 35 },
                { product: 'Basis Trade', percent: 30, color: '#ff6b9d', apy: '35-60%', maxLoss: 40 }
            ]
        },
        {
            id: 'NFT_YIELD',
            name: 'NFT Yield Hunter',
            icon: '🖼️',
            description: 'NFT staking and lending protocols',
            riskLevel: 'High',
            expectedApy: '25-50%',
            capitalProtection: '50%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'NFT Lending', percent: 40, color: '#e040fb', apy: '20-40%', maxLoss: 50 },
                { product: 'Blur Farming', percent: 35, color: '#ff6f00', apy: '30-60%', maxLoss: 60 },
                { product: 'NFT Index', percent: 25, color: '#7c4dff', apy: '15-35%', maxLoss: 40 }
            ]
        },
        {
            id: 'MEME_CASINO',
            name: 'Meme Casino',
            icon: '🎰',
            description: 'High-risk meme coin exposure',
            riskLevel: 'High',
            expectedApy: '50-200%',
            capitalProtection: '30%',
            minInvestment: 50,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'PEPE/DOGE LP', percent: 35, color: '#00ff00', apy: '50-150%', maxLoss: 80 },
                { product: 'SHIB Staking', percent: 30, color: '#ffa409', apy: '30-80%', maxLoss: 70 },
                { product: 'New Memes DCA', percent: 35, color: '#ff69b4', apy: '100-300%', maxLoss: 90 }
            ]
        },
        {
            id: 'RWA_INCOME',
            name: 'RWA Income',
            icon: '🏛️',
            description: 'Real World Asset backed yields',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '95%',
            minInvestment: 1000,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'US Treasury (ONDO)', percent: 40, color: '#1e3a8a', apy: '4-5%', maxLoss: 2 },
                { product: 'Corp Bonds', percent: 30, color: '#059669', apy: '6-8%', maxLoss: 5 },
                { product: 'Real Estate', percent: 30, color: '#dc2626', apy: '8-12%', maxLoss: 10 }
            ]
        },
        {
            id: 'AIRDROP_FARMER',
            name: 'Airdrop Farmer',
            icon: '🪂',
            description: 'Position for upcoming protocol airdrops',
            riskLevel: 'Medium',
            expectedApy: '20-100%',
            capitalProtection: '70%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'LayerZero Bridge', percent: 30, color: '#6366f1', apy: '5-50%', maxLoss: 30 },
                { product: 'zkSync Activity', percent: 25, color: '#8b5cf6', apy: '10-80%', maxLoss: 25 },
                { product: 'Scroll Usage', percent: 25, color: '#fcd34d', apy: '10-70%', maxLoss: 25 },
                { product: 'Linea DeFi', percent: 20, color: '#60a5fa', apy: '15-60%', maxLoss: 30 }
            ]
        },
        {
            id: 'PRIVACY_SHIELD',
            name: 'Privacy Shield',
            icon: '🛡️',
            description: 'Privacy-focused assets and protocols',
            riskLevel: 'Medium',
            expectedApy: '10-18%',
            capitalProtection: '75%',
            minInvestment: 300,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Secret Network', percent: 35, color: '#1b1b1b', apy: '8-15%', maxLoss: 30 },
                { product: 'Aztec Protocol', percent: 35, color: '#5c2d91', apy: '10-20%', maxLoss: 25 },
                { product: 'Tornado Cash Alt', percent: 30, color: '#2dd4bf', apy: '12-20%', maxLoss: 30 }
            ]
        },
        {
            id: 'CROSS_CHAIN_ARB',
            name: 'Cross-Chain Arb',
            icon: '🔀',
            description: 'Multi-chain arbitrage opportunities',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '80%',
            minInvestment: 500,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Bridge Arb', percent: 35, color: '#00d4aa', apy: '10-25%', maxLoss: 20 },
                { product: 'DEX Arb', percent: 35, color: '#ff6b9d', apy: '15-30%', maxLoss: 25 },
                { product: 'CEX-DEX Arb', percent: 30, color: '#4a9eff', apy: '20-35%', maxLoss: 20 }
            ]
        },
        {
            id: 'GAMING_GUILD',
            name: 'Gaming Guild',
            icon: '🎮',
            description: 'GameFi and P2E token exposure',
            riskLevel: 'High',
            expectedApy: '25-60%',
            capitalProtection: '55%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'IMX Staking', percent: 30, color: '#00bfff', apy: '15-30%', maxLoss: 50 },
                { product: 'GALA Farm', percent: 25, color: '#00d4aa', apy: '20-40%', maxLoss: 60 },
                { product: 'MAGIC/Treasure', percent: 25, color: '#e31837', apy: '25-50%', maxLoss: 55 },
                { product: 'PRIME Gaming', percent: 20, color: '#9333ea', apy: '30-60%', maxLoss: 60 }
            ]
        },
        {
            id: 'PENSION_PLAN',
            name: 'Crypto Pension',
            icon: '👴',
            description: 'Long-term wealth preservation',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '95%',
            minInvestment: 1000,
            rebalanceFrequency: 'Quarterly',
            allocation: [
                { product: 'BTC Hold', percent: 30, color: '#f7931a', apy: '0%', maxLoss: 30 },
                { product: 'ETH Staking', percent: 30, color: '#627eea', apy: '4-5%', maxLoss: 25 },
                { product: 'Stables Yield', percent: 40, color: '#26a17b', apy: '5-8%', maxLoss: 2 }
            ]
        },
        {
            id: 'AI_TOKENS',
            name: 'AI Revolution',
            icon: '🧠',
            description: 'Artificial Intelligence crypto projects',
            riskLevel: 'High',
            expectedApy: '30-80%',
            capitalProtection: '50%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'FET Staking', percent: 30, color: '#1d1d47', apy: '15-30%', maxLoss: 50 },
                { product: 'RNDR Hold', percent: 25, color: '#cc0000', apy: '20-50%', maxLoss: 55 },
                { product: 'AGIX Farm', percent: 25, color: '#6c5ce7', apy: '25-60%', maxLoss: 60 },
                { product: 'TAO Staking', percent: 20, color: '#00ff88', apy: '30-80%', maxLoss: 65 }
            ]
        },
        {
            id: 'VALIDATOR_PRO',
            name: 'Validator Pro',
            icon: '🔐',
            description: 'Professional validator node rewards',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '92%',
            minInvestment: 5000,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'ETH Validator', percent: 40, color: '#627eea', apy: '4-5%', maxLoss: 10 },
                { product: 'SOL Validator', percent: 30, color: '#9945ff', apy: '7-8%', maxLoss: 15 },
                { product: 'ATOM Validator', percent: 30, color: '#2e3148', apy: '10-15%', maxLoss: 12 }
            ]
        },
        {
            id: 'OPTIONS_SELLER',
            name: 'Options Seller',
            icon: '📉',
            description: 'Covered calls and puts strategies',
            riskLevel: 'Medium',
            expectedApy: '20-40%',
            capitalProtection: '70%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC Covered Calls', percent: 40, color: '#f7931a', apy: '15-30%', maxLoss: 30 },
                { product: 'ETH Put Selling', percent: 35, color: '#627eea', apy: '20-40%', maxLoss: 35 },
                { product: 'Straddle Farm', percent: 25, color: '#ff6b9d', apy: '25-50%', maxLoss: 40 }
            ]
        },
        {
            id: 'COSMOS_ECOSYSTEM',
            name: 'Cosmos Hub',
            icon: '⚛️',
            description: 'Inter-blockchain communication yields',
            riskLevel: 'Medium',
            expectedApy: '15-25%',
            capitalProtection: '75%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ATOM Staking', percent: 35, color: '#2e3148', apy: '12-18%', maxLoss: 25 },
                { product: 'OSMO LP', percent: 30, color: '#5e12a0', apy: '15-30%', maxLoss: 30 },
                { product: 'JUNO Staking', percent: 20, color: '#f0827d', apy: '10-20%', maxLoss: 35 },
                { product: 'STARS Farm', percent: 15, color: '#ec4899', apy: '20-35%', maxLoss: 40 }
            ]
        },
        {
            id: 'INSURANCE_BACKED',
            name: 'Insurance Backed',
            icon: '🔒',
            description: 'DeFi insurance protected yields',
            riskLevel: 'Low',
            expectedApy: '4-8%',
            capitalProtection: '98%',
            minInvestment: 500,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Nexus Mutual', percent: 40, color: '#1aab9b', apy: '3-6%', maxLoss: 2 },
                { product: 'InsurAce Pool', percent: 30, color: '#ff6b00', apy: '4-8%', maxLoss: 3 },
                { product: 'Unslashed', percent: 30, color: '#6366f1', apy: '5-10%', maxLoss: 4 }
            ]
        }
,
        {
            id: "YIELD_MAXIMIZER",
            name: "Yield Maximizer",
            icon: "💹",
            description: "Maximum yield across all protocols",
            riskLevel: "High",
            expectedApy: "40-100%",
            capitalProtection: "50%",
            minInvestment: 500,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "Leveraged Farming", percent: 40, color: "#ff6464", apy: "50-120%", maxLoss: 60 },
                { product: "Options Premium", percent: 30, color: "#ffaa00", apy: "30-80%", maxLoss: 40 },
                { product: "Perp Funding", percent: 30, color: "#00ff88", apy: "25-60%", maxLoss: 35 }
            ]
        },
        {
            id: "SMART_DCA",
            name: "Smart DCA",
            icon: "📅",
            description: "Automated dollar cost averaging",
            riskLevel: "Medium",
            expectedApy: "15-40%",
            capitalProtection: "70%",
            minInvestment: 100,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "BTC Weekly DCA", percent: 40, color: "#f7931a", apy: "10-30%", maxLoss: 35 },
                { product: "ETH Weekly DCA", percent: 35, color: "#627eea", apy: "12-35%", maxLoss: 30 },
                { product: "Altcoin DCA", percent: 25, color: "#00d4aa", apy: "20-50%", maxLoss: 45 }
            ]
        },
        {
            id: "GRID_TRADER",
            name: "Grid Trader Pro",
            icon: "📊",
            description: "Automated grid trading strategies",
            riskLevel: "Medium",
            expectedApy: "20-45%",
            capitalProtection: "75%",
            minInvestment: 300,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "BTC Grid", percent: 40, color: "#f7931a", apy: "15-35%", maxLoss: 25 },
                { product: "ETH Grid", percent: 35, color: "#627eea", apy: "18-40%", maxLoss: 28 },
                { product: "Range Trading", percent: 25, color: "#ff6b9d", apy: "25-50%", maxLoss: 30 }
            ]
        },
        {
            id: "STAKING_KING",
            name: "Staking Kingdom",
            icon: "👑",
            description: "Best staking yields across chains",
            riskLevel: "Low",
            expectedApy: "8-18%",
            capitalProtection: "90%",
            minInvestment: 100,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "ETH 2.0 Staking", percent: 30, color: "#627eea", apy: "4-5%", maxLoss: 10 },
                { product: "SOL Staking", percent: 25, color: "#9945ff", apy: "7-9%", maxLoss: 15 },
                { product: "ATOM Staking", percent: 25, color: "#2e3148", apy: "12-18%", maxLoss: 15 },
                { product: "DOT Staking", percent: 20, color: "#e6007a", apy: "10-15%", maxLoss: 18 }
            ]
        },
        {
            id: "LP_MASTER",
            name: "LP Master",
            icon: "🌊",
            description: "Liquidity provision optimization",
            riskLevel: "Medium",
            expectedApy: "15-35%",
            capitalProtection: "75%",
            minInvestment: 250,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Stable-Stable LP", percent: 35, color: "#26a17b", apy: "8-15%", maxLoss: 5 },
                { product: "ETH-USDC LP", percent: 30, color: "#627eea", apy: "15-30%", maxLoss: 25 },
                { product: "Concentrated LP", percent: 35, color: "#ff007a", apy: "25-50%", maxLoss: 35 }
            ]
        },
        {
            id: "ARBITRAGE_BOT",
            name: "Arbitrage Hunter",
            icon: "🎯",
            description: "Cross-exchange arbitrage",
            riskLevel: "Low",
            expectedApy: "10-25%",
            capitalProtection: "95%",
            minInvestment: 1000,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "CEX-DEX Arb", percent: 40, color: "#00d4aa", apy: "8-20%", maxLoss: 5 },
                { product: "Triangular Arb", percent: 35, color: "#4a9eff", apy: "10-25%", maxLoss: 8 },
                { product: "Flash Arb", percent: 25, color: "#ff6b9d", apy: "15-30%", maxLoss: 10 }
            ]
        },
        {
            id: "MARKET_NEUTRAL",
            name: "Market Neutral",
            icon: "⚖️",
            description: "Delta-neutral strategies",
            riskLevel: "Low",
            expectedApy: "12-25%",
            capitalProtection: "90%",
            minInvestment: 500,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "Cash & Carry", percent: 40, color: "#00ff88", apy: "10-20%", maxLoss: 8 },
                { product: "Basis Trade", percent: 35, color: "#4a9eff", apy: "12-25%", maxLoss: 10 },
                { product: "Funding Arb", percent: 25, color: "#ffaa00", apy: "15-30%", maxLoss: 12 }
            ]
        },
        {
            id: "EMERGING_CHAINS",
            name: "Emerging Chains",
            icon: "🌱",
            description: "New L1/L2 ecosystem exposure",
            riskLevel: "High",
            expectedApy: "30-80%",
            capitalProtection: "55%",
            minInvestment: 200,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Sui Ecosystem", percent: 25, color: "#6fbcf0", apy: "25-60%", maxLoss: 50 },
                { product: "Aptos DeFi", percent: 25, color: "#2dd4bf", apy: "20-50%", maxLoss: 45 },
                { product: "Sei Network", percent: 25, color: "#ff6b6b", apy: "30-70%", maxLoss: 55 },
                { product: "Monad Prep", percent: 25, color: "#a855f7", apy: "40-100%", maxLoss: 60 }
            ]
        },
        {
            id: "BTC_DEFI",
            name: "Bitcoin DeFi",
            icon: "₿",
            description: "Bitcoin L2 and DeFi",
            riskLevel: "Medium",
            expectedApy: "12-30%",
            capitalProtection: "75%",
            minInvestment: 500,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Lightning LP", percent: 30, color: "#f7931a", apy: "8-15%", maxLoss: 20 },
                { product: "Stacks STX", percent: 25, color: "#5546ff", apy: "10-20%", maxLoss: 30 },
                { product: "RGB Assets", percent: 25, color: "#00d4aa", apy: "15-30%", maxLoss: 35 },
                { product: "Ordinals Yield", percent: 20, color: "#ff6b9d", apy: "20-40%", maxLoss: 40 }
            ]
        },
        {
            id: "DEPIN_INFRA",
            name: "DePIN Infrastructure",
            icon: "🔌",
            description: "Decentralized physical infrastructure",
            riskLevel: "Medium",
            expectedApy: "15-40%",
            capitalProtection: "70%",
            minInvestment: 300,
            rebalanceFrequency: "Monthly",
            allocation: [
                { product: "Filecoin Storage", percent: 30, color: "#0090ff", apy: "10-25%", maxLoss: 30 },
                { product: "Helium IoT", percent: 25, color: "#474dff", apy: "12-30%", maxLoss: 35 },
                { product: "Render GPU", percent: 25, color: "#cc0000", apy: "20-45%", maxLoss: 40 },
                { product: "Akash Compute", percent: 20, color: "#ff4444", apy: "15-35%", maxLoss: 35 }
            ]
        },
        {
            id: "WHALE_PORTFOLIO",
            name: "Whale Portfolio",
            icon: "🐋",
            description: "For high net worth investors",
            riskLevel: "Medium",
            expectedApy: "18-35%",
            capitalProtection: "80%",
            minInvestment: 10000,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "BTC Institutional", percent: 35, color: "#f7931a", apy: "10-20%", maxLoss: 25 },
                { product: "ETH Prime", percent: 30, color: "#627eea", apy: "12-25%", maxLoss: 20 },
                { product: "Private Deals", percent: 20, color: "#a855f7", apy: "30-50%", maxLoss: 35 },
                { product: "OTC Desk", percent: 15, color: "#00d4aa", apy: "25-40%", maxLoss: 30 }
            ]
        },
        {
            id: "MICRO_STARTER",
            name: "Micro Starter",
            icon: "🌟",
            description: "Perfect for beginners with small capital",
            riskLevel: "Low",
            expectedApy: "6-12%",
            capitalProtection: "95%",
            minInvestment: 10,
            rebalanceFrequency: "Monthly",
            allocation: [
                { product: "USDC Earn", percent: 50, color: "#2775ca", apy: "5-8%", maxLoss: 2 },
                { product: "BTC Sats Stack", percent: 30, color: "#f7931a", apy: "0%", maxLoss: 30 },
                { product: "Learn & Earn", percent: 20, color: "#00ff88", apy: "10-20%", maxLoss: 5 }
            ]
        },
        {
            id: "DIVIDEND_HUNTER",
            name: "Dividend Hunter",
            icon: "💸",
            description: "High dividend yield tokens",
            riskLevel: "Medium",
            expectedApy: "20-45%",
            capitalProtection: "70%",
            minInvestment: 500,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Real Yield Tokens", percent: 40, color: "#00ff88", apy: "15-30%", maxLoss: 30 },
                { product: "Revenue Share", percent: 35, color: "#4a9eff", apy: "20-40%", maxLoss: 35 },
                { product: "Buyback Tokens", percent: 25, color: "#ff6b9d", apy: "25-50%", maxLoss: 40 }
            ]
        },
        {
            id: "METAVERSE_LAND",
            name: "Metaverse Land",
            icon: "🏝️",
            description: "Virtual real estate investment",
            riskLevel: "High",
            expectedApy: "25-80%",
            capitalProtection: "40%",
            minInvestment: 200,
            rebalanceFrequency: "Monthly",
            allocation: [
                { product: "Decentraland LAND", percent: 35, color: "#ff2d55", apy: "20-60%", maxLoss: 70 },
                { product: "Sandbox LAND", percent: 35, color: "#00adef", apy: "25-70%", maxLoss: 65 },
                { product: "Otherside Deeds", percent: 30, color: "#6c5ce7", apy: "30-100%", maxLoss: 75 }
            ]
        },
        {
            id: "SPORTS_FAN",
            name: "Sports Fan Token",
            icon: "⚽",
            description: "Sports and fan tokens portfolio",
            riskLevel: "High",
            expectedApy: "20-60%",
            capitalProtection: "50%",
            minInvestment: 100,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Soccer Tokens", percent: 40, color: "#00ff88", apy: "15-50%", maxLoss: 60 },
                { product: "NBA Top Shot", percent: 30, color: "#ff6b00", apy: "20-60%", maxLoss: 55 },
                { product: "F1 Tokens", percent: 30, color: "#e10600", apy: "25-70%", maxLoss: 65 }
            ]
        },
        {'id':'WHALE_PORTFOLIO','name':'Whale Portfolio','icon':'🐋','description':'High-value institutional grade portfolio','riskLevel':'Low','expectedApy':'8-15%','capitalProtection':'90%','minInvestment':10000,'rebalanceFrequency':'Monthly','allocation':[{'product':'Blue Chip BTC','percent':40,'color':'#f7931a','apy':'5-12%','maxLoss':15},{'product':'Institutional ETH','percent':30,'color':'#627eea','apy':'6-14%','maxLoss':18},{'product':'Treasury Bonds','percent':20,'color':'#00d4aa','apy':'4-8%','maxLoss':5},{'product':'Gold Token','percent':10,'color':'#ffd700','apy':'3-6%','maxLoss':8}]},
        {'id':'MICRO_STARTER','name':'Micro Starter Pack','icon':'🌱','description':'Perfect for beginners with small capital','riskLevel':'Low','expectedApy':'5-12%','capitalProtection':'85%','minInvestment':10,'rebalanceFrequency':'Weekly','allocation':[{'product':'Stable Savings','percent':50,'color':'#00d4aa','apy':'4-8%','maxLoss':5},{'product':'BTC Fraction','percent':30,'color':'#f7931a','apy':'5-15%','maxLoss':20},{'product':'ETH Fraction','percent':20,'color':'#627eea','apy':'6-16%','maxLoss':22}]},
        {'id':'ASIA_FOCUS','name':'Asia Crypto Focus','icon':'🏯','description':'Asian blockchain projects and exchanges','riskLevel':'Medium','expectedApy':'15-35%','capitalProtection':'65%','minInvestment':200,'rebalanceFrequency':'Weekly','allocation':[{'product':'BNB Chain','percent':35,'color':'#f3ba2f','apy':'10-25%','maxLoss':35},{'product':'NEO Ecosystem','percent':25,'color':'#00e599','apy':'12-30%','maxLoss':40},{'product':'Klaytn','percent':20,'color':'#ff6b6b','apy':'15-35%','maxLoss':45},{'product':'Tron DeFi','percent':20,'color':'#eb0029','apy':'18-40%','maxLoss':50}]},
        {'id':'EURO_DEFI','name':'Euro DeFi Bundle','icon':'🇪🇺','description':'European-compliant DeFi protocols','riskLevel':'Medium','expectedApy':'10-22%','capitalProtection':'75%','minInvestment':500,'rebalanceFrequency':'Monthly','allocation':[{'product':'Staked EURS','percent':40,'color':'#0052b4','apy':'5-10%','maxLoss':10},{'product':'Aave Europe','percent':30,'color':'#b6509e','apy':'8-18%','maxLoss':25},{'product':'Compound EU','percent':30,'color':'#00d395','apy':'10-20%','maxLoss':30}]},
        {'id':'LATAM_YIELD','name':'LatAm Yield Hunter','icon':'🌎','description':'Latin American crypto opportunities','riskLevel':'High','expectedApy':'25-50%','capitalProtection':'50%','minInvestment':150,'rebalanceFrequency':'Weekly','allocation':[{'product':'Brazil DeFi','percent':35,'color':'#009c3b','apy':'20-45%','maxLoss':50},{'product':'Mexico Tokens','percent':35,'color':'#ce1126','apy':'22-48%','maxLoss':55},{'product':'Argentina Stable','percent':30,'color':'#74acdf','apy':'30-60%','maxLoss':40}]},
        {'id':'MEMECOIN_SAFE','name':'Meme Coin Hedged','icon':'🐕','description':'Meme exposure with stablecoin hedge','riskLevel':'Medium-High','expectedApy':'30-80%','capitalProtection':'60%','minInvestment':50,'rebalanceFrequency':'Daily','allocation':[{'product':'Top Memes','percent':40,'color':'#ff9500','apy':'50-150%','maxLoss':70},{'product':'Stable Hedge','percent':40,'color':'#00d4aa','apy':'5-10%','maxLoss':5},{'product':'Blue Chip','percent':20,'color':'#627eea','apy':'8-15%','maxLoss':20}]},
        {'id':'INSTITUTIONAL','name':'Institutional Grade','icon':'🏛️','description':'Bank-grade crypto investment strategy','riskLevel':'Very Low','expectedApy':'6-10%','capitalProtection':'95%','minInvestment':25000,'rebalanceFrequency':'Quarterly','allocation':[{'product':'Custody BTC','percent':35,'color':'#f7931a','apy':'4-8%','maxLoss':10},{'product':'Custody ETH','percent':25,'color':'#627eea','apy':'5-9%','maxLoss':12},{'product':'Treasury','percent':30,'color':'#00d4aa','apy':'4-6%','maxLoss':3},{'product':'Insurance Pool','percent':10,'color':'#9b59b6','apy':'3-5%','maxLoss':2}]},
        {'id':'STUDENT_SAVER','name':'Student Saver','icon':'📚','description':'Low-risk growth for student budgets','riskLevel':'Low','expectedApy':'6-14%','capitalProtection':'80%','minInvestment':25,'rebalanceFrequency':'Monthly','allocation':[{'product':'Stable Earn','percent':60,'color':'#00d4aa','apy':'5-10%','maxLoss':8},{'product':'BTC Learn','percent':25,'color':'#f7931a','apy':'6-18%','maxLoss':25},{'product':'ETH Learn','percent':15,'color':'#627eea','apy':'7-20%','maxLoss':28}]},
        {'id':'TRADER_ACTIVE','name':'Active Trader','icon':'📊','description':'For experienced traders seeking alpha','riskLevel':'High','expectedApy':'35-80%','capitalProtection':'40%','minInvestment':1000,'rebalanceFrequency':'Daily','allocation':[{'product':'Perp Trading','percent':40,'color':'#ff6b6b','apy':'40-100%','maxLoss':60},{'product':'Options Play','percent':30,'color':'#a855f7','apy':'50-120%','maxLoss':70},{'product':'Spot Swing','percent':30,'color':'#3b82f6','apy':'25-60%','maxLoss':40}]},
        {'id':'HODL_FOREVER','name':'HODL Forever','icon':'💎','description':'Long-term accumulation strategy','riskLevel':'Medium','expectedApy':'12-25%','capitalProtection':'70%','minInvestment':500,'rebalanceFrequency':'Yearly','allocation':[{'product':'BTC Stack','percent':50,'color':'#f7931a','apy':'10-20%','maxLoss':30},{'product':'ETH Stack','percent':35,'color':'#627eea','apy':'12-25%','maxLoss':35},{'product':'SOL Stack','percent':15,'color':'#00ffa3','apy':'15-35%','maxLoss':45}]},
        {'id':'DIVIDEND_HUNTER','name':'Dividend Hunter','icon':'💰','description':'Yield-generating token portfolio','riskLevel':'Medium','expectedApy':'15-30%','capitalProtection':'70%','minInvestment':300,'rebalanceFrequency':'Weekly','allocation':[{'product':'Staking Rewards','percent':40,'color':'#00d4aa','apy':'10-20%','maxLoss':20},{'product':'LP Farming','percent':35,'color':'#ff6b6b','apy':'20-40%','maxLoss':35},{'product':'Revenue Share','percent':25,'color':'#a855f7','apy':'15-35%','maxLoss':30}]},
        {'id':'TECH_INNOVATOR','name':'Tech Innovator','icon':'🚀','description':'Cutting-edge blockchain technology','riskLevel':'High','expectedApy':'30-70%','capitalProtection':'45%','minInvestment':250,'rebalanceFrequency':'Weekly','allocation':[{'product':'ZK Rollups','percent':30,'color':'#6366f1','apy':'30-70%','maxLoss':55},{'product':'AI Tokens','percent':30,'color':'#22c55e','apy':'40-90%','maxLoss':60},{'product':'Modular Chains','percent':25,'color':'#f59e0b','apy':'25-60%','maxLoss':50},{'product':'Privacy Tech','percent':15,'color':'#8b5cf6','apy':'20-50%','maxLoss':45}]},
        {'id':'CARBON_NEUTRAL','name':'Carbon Neutral','icon':'🌿','description':'Eco-friendly blockchain investments','riskLevel':'Medium','expectedApy':'10-25%','capitalProtection':'70%','minInvestment':200,'rebalanceFrequency':'Monthly','allocation':[{'product':'Carbon Credits','percent':35,'color':'#22c55e','apy':'8-20%','maxLoss':25},{'product':'Green PoS','percent':35,'color':'#10b981','apy':'10-25%','maxLoss':30},{'product':'Regen Finance','percent':30,'color':'#059669','apy':'12-30%','maxLoss':35}]},
        {'id':'METAVERSE_LAND','name':'Metaverse Landowner','icon':'🏠','description':'Virtual real estate portfolio','riskLevel':'High','expectedApy':'25-60%','capitalProtection':'45%','minInvestment':500,'rebalanceFrequency':'Monthly','allocation':[{'product':'Decentraland','percent':30,'color':'#ff2d55','apy':'20-50%','maxLoss':55},{'product':'Sandbox','percent':30,'color':'#00b4e6','apy':'25-60%','maxLoss':60},{'product':'Otherside','percent':25,'color':'#6c5ce7','apy':'30-70%','maxLoss':65},{'product':'Somnium','percent':15,'color':'#9b59b6','apy':'35-80%','maxLoss':70}]},

        // ═══════════════════════════════════════════════════════════════
        // MEGA COMBOS - Combos of Combos (Meta-Portfolios)
        // ═══════════════════════════════════════════════════════════════
        {'id':'MEGA_BALANCED','name':'🌟 MEGA Balanced','icon':'⚖️','description':'Ultimate diversification: combines 4 combos for perfect balance','riskLevel':'Medium','expectedApy':'15-30%','capitalProtection':'75%','minInvestment':1000,'rebalanceFrequency':'Weekly','isMegaCombo':true,'allocation':[{'product':'Conservative Yield Combo','percent':30,'color':'#00d4aa','apy':'5-12%','maxLoss':10},{'product':'Blue Chip Combo','percent':30,'color':'#627eea','apy':'15-25%','maxLoss':25},{'product':'Growth Portfolio Combo','percent':25,'color':'#f7931a','apy':'18-35%','maxLoss':30},{'product':'Dividend Hunter Combo','percent':15,'color':'#a855f7','apy':'15-30%','maxLoss':25}]},
        {'id':'MEGA_AGGRESSIVE','name':'🔥 MEGA Aggressive','icon':'🚀','description':'Maximum returns: combines high-yield combos','riskLevel':'Very High','expectedApy':'50-120%','capitalProtection':'30%','minInvestment':2000,'rebalanceFrequency':'Daily','isMegaCombo':true,'allocation':[{'product':'Degen Paradise Combo','percent':35,'color':'#ff6b6b','apy':'80-200%','maxLoss':80},{'product':'Tech Innovator Combo','percent':25,'color':'#6366f1','apy':'30-70%','maxLoss':55},{'product':'Active Trader Combo','percent':25,'color':'#f59e0b','apy':'35-80%','maxLoss':60},{'product':'Memecoin Hedged Combo','percent':15,'color':'#ff9500','apy':'30-80%','maxLoss':50}]},
        {'id':'MEGA_INCOME','name':'💵 MEGA Income','icon':'🏦','description':'Passive income maximizer: yield-focused combos','riskLevel':'Low-Medium','expectedApy':'12-25%','capitalProtection':'80%','minInvestment':5000,'rebalanceFrequency':'Monthly','isMegaCombo':true,'allocation':[{'product':'Dividend Hunter Combo','percent':35,'color':'#00d4aa','apy':'15-30%','maxLoss':25},{'product':'Conservative Yield Combo','percent':30,'color':'#4a9eff','apy':'5-12%','maxLoss':10},{'product':'Institutional Grade Combo','percent':20,'color':'#9b59b6','apy':'6-10%','maxLoss':8},{'product':'Staking Rewards Combo','percent':15,'color':'#22c55e','apy':'10-20%','maxLoss':15}]},
        {'id':'MEGA_GLOBAL','name':'🌍 MEGA Global','icon':'🗺️','description':'Worldwide exposure: regional combos combined','riskLevel':'Medium','expectedApy':'20-40%','capitalProtection':'60%','minInvestment':3000,'rebalanceFrequency':'Weekly','isMegaCombo':true,'allocation':[{'product':'Asia Focus Combo','percent':30,'color':'#f3ba2f','apy':'15-35%','maxLoss':40},{'product':'Euro DeFi Combo','percent':25,'color':'#0052b4','apy':'10-22%','maxLoss':25},{'product':'LatAm Yield Combo','percent':25,'color':'#009c3b','apy':'25-50%','maxLoss':45},{'product':'Blue Chip Combo','percent':20,'color':'#627eea','apy':'15-25%','maxLoss':25}]},
        {'id':'MEGA_FUTURE','name':'🔮 MEGA Future','icon':'🤖','description':'Next-gen tech: AI, ZK, and emerging tech combos','riskLevel':'High','expectedApy':'35-75%','capitalProtection':'40%','minInvestment':2500,'rebalanceFrequency':'Weekly','isMegaCombo':true,'allocation':[{'product':'Tech Innovator Combo','percent':35,'color':'#6366f1','apy':'30-70%','maxLoss':55},{'product':'AI & Data Combo','percent':30,'color':'#22c55e','apy':'40-90%','maxLoss':60},{'product':'DePIN Infra Combo','percent':20,'color':'#f59e0b','apy':'25-55%','maxLoss':50},{'product':'Emerging Chains Combo','percent':15,'color':'#8b5cf6','apy':'30-65%','maxLoss':55}]},

        // ═══════════════════════════════════════════════════════════════
        // NEW THEMED COMBOS
        // ═══════════════════════════════════════════════════════════════
        {'id':'RETIREMENT_PLAN','name':'Retirement Plan','icon':'🏖️','description':'Long-term wealth building for retirement','riskLevel':'Low','expectedApy':'8-15%','capitalProtection':'90%','minInvestment':1000,'rebalanceFrequency':'Quarterly','allocation':[{'product':'Treasury Bonds','percent':40,'color':'#00d4aa','apy':'5-8%','maxLoss':5},{'product':'BTC Accumulator','percent':30,'color':'#f7931a','apy':'8-18%','maxLoss':20},{'product':'ETH Staking','percent':20,'color':'#627eea','apy':'10-15%','maxLoss':18},{'product':'Gold Token','percent':10,'color':'#ffd700','apy':'3-8%','maxLoss':10}]},
        {'id':'WEEKEND_WARRIOR','name':'Weekend Warrior','icon':'⚔️','description':'High-action weekend trading strategy','riskLevel':'Very High','expectedApy':'40-100%','capitalProtection':'25%','minInvestment':200,'rebalanceFrequency':'Weekly','allocation':[{'product':'Leverage Trades','percent':40,'color':'#ff6b6b','apy':'60-150%','maxLoss':80},{'product':'Meme Plays','percent':30,'color':'#ff9500','apy':'50-200%','maxLoss':85},{'product':'Arbitrage Bot','percent':30,'color':'#3b82f6','apy':'20-50%','maxLoss':30}]},
        {'id':'NIGHT_OWL','name':'Night Owl Asia','icon':'🦉','description':'Trade Asian market hours (midnight-8am UTC)','riskLevel':'Medium-High','expectedApy':'25-50%','capitalProtection':'55%','minInvestment':500,'rebalanceFrequency':'Daily','allocation':[{'product':'Asian Tokens','percent':40,'color':'#f3ba2f','apy':'20-45%','maxLoss':45},{'product':'Korean DeFi','percent':30,'color':'#00d4aa','apy':'25-50%','maxLoss':50},{'product':'Japan Tech','percent':30,'color':'#ff6b6b','apy':'30-60%','maxLoss':55}]},
        {'id':'GAMING_GUILD','name':'Gaming Guild','icon':'🎮','description':'Play-to-earn and gaming token portfolio','riskLevel':'High','expectedApy':'30-70%','capitalProtection':'40%','minInvestment':150,'rebalanceFrequency':'Weekly','allocation':[{'product':'Axie Infinity','percent':25,'color':'#00b4e6','apy':'25-60%','maxLoss':55},{'product':'Gala Games','percent':25,'color':'#ff6b6b','apy':'30-70%','maxLoss':60},{'product':'Immutable X','percent':25,'color':'#6366f1','apy':'35-75%','maxLoss':65},{'product':'Yield Guild','percent':25,'color':'#22c55e','apy':'20-50%','maxLoss':50}]},
        {'id':'MUSIC_NFT','name':'Music & NFT','icon':'🎵','description':'Music tokens and audio NFT investments','riskLevel':'High','expectedApy':'25-60%','capitalProtection':'45%','minInvestment':100,'rebalanceFrequency':'Weekly','allocation':[{'product':'Audius','percent':35,'color':'#cc00ff','apy':'20-50%','maxLoss':55},{'product':'Royal.io Pool','percent':30,'color':'#ff6b6b','apy':'25-60%','maxLoss':60},{'product':'Sound.xyz','percent':35,'color':'#00d4aa','apy':'30-70%','maxLoss':65}]},
        {'id':'REAL_WORLD','name':'Real World Assets','icon':'🏢','description':'Tokenized real-world assets (RWA)','riskLevel':'Low-Medium','expectedApy':'8-18%','capitalProtection':'85%','minInvestment':1000,'rebalanceFrequency':'Monthly','allocation':[{'product':'Real Estate Tokens','percent':35,'color':'#00d4aa','apy':'6-12%','maxLoss':15},{'product':'Commodity Tokens','percent':30,'color':'#ffd700','apy':'5-10%','maxLoss':12},{'product':'Invoice Financing','percent':20,'color':'#3b82f6','apy':'10-18%','maxLoss':20},{'product':'Art Tokens','percent':15,'color':'#a855f7','apy':'15-25%','maxLoss':30}]},
        {'id':'PRIVACY_FOCUSED','name':'Privacy Focused','icon':'🔒','description':'Privacy coins and anonymous DeFi','riskLevel':'Medium-High','expectedApy':'20-45%','capitalProtection':'55%','minInvestment':300,'rebalanceFrequency':'Weekly','allocation':[{'product':'Monero Pool','percent':30,'color':'#ff6600','apy':'15-35%','maxLoss':45},{'product':'Zcash Staking','percent':25,'color':'#f4b728','apy':'12-30%','maxLoss':40},{'product':'Secret Network','percent':25,'color':'#1b1b1b','apy':'18-40%','maxLoss':50},{'product':'Tornado Alt','percent':20,'color':'#00d4aa','apy':'25-55%','maxLoss':55}]},
        {'id':'ORACLE_NETWORK','name':'Oracle Networks','icon':'🔮','description':'Blockchain oracle and data providers','riskLevel':'Medium','expectedApy':'15-35%','capitalProtection':'65%','minInvestment':250,'rebalanceFrequency':'Weekly','allocation':[{'product':'Chainlink','percent':40,'color':'#375bd2','apy':'10-25%','maxLoss':30},{'product':'Band Protocol','percent':25,'color':'#4520ff','apy':'15-35%','maxLoss':40},{'product':'API3','percent':20,'color':'#00d4aa','apy':'18-40%','maxLoss':45},{'product':'Pyth Network','percent':15,'color':'#7c3aed','apy':'20-45%','maxLoss':50}]},
        {'id':'BRIDGE_MASTER','name':'Bridge Master','icon':'🌉','description':'Cross-chain bridge tokens and protocols','riskLevel':'Medium-High','expectedApy':'20-45%','capitalProtection':'55%','minInvestment':400,'rebalanceFrequency':'Weekly','allocation':[{'product':'Stargate','percent':30,'color':'#6366f1','apy':'18-40%','maxLoss':45},{'product':'LayerZero','percent':30,'color':'#00d4aa','apy':'20-45%','maxLoss':50},{'product':'Wormhole','percent':25,'color':'#ff6b6b','apy':'22-50%','maxLoss':55},{'product':'Synapse','percent':15,'color':'#a855f7','apy':'25-55%','maxLoss':60}]},
        {'id':'DEX_LIQUIDITY','name':'DEX Liquidity Pro','icon':'💧','description':'Concentrated liquidity across top DEXes','riskLevel':'Medium-High','expectedApy':'25-55%','capitalProtection':'50%','minInvestment':500,'rebalanceFrequency':'Daily','allocation':[{'product':'Uniswap V3 LP','percent':35,'color':'#ff007a','apy':'20-50%','maxLoss':40},{'product':'Curve Finance','percent':30,'color':'#0033ad','apy':'15-35%','maxLoss':30},{'product':'Balancer','percent':20,'color':'#1e1e1e','apy':'18-45%','maxLoss':45},{'product':'Velodrome','percent':15,'color':'#00d4aa','apy':'30-60%','maxLoss':55}]}
    ],

    // ═══════════════════════════════════════════════════════════════
    // COMBO GENERATOR - Creates infinite recursive combos
    // ═══════════════════════════════════════════════════════════════
    generateUltraCombos() {
        const ultraCombos = [];
        const icons = ['💎', '🔥', '⚡', '🌟', '🚀', '💫', '🌈', '🎯', '👑', '🏆'];
        const prefixes = ['ULTRA', 'HYPER', 'INFINITY', 'QUANTUM', 'OMEGA', 'APEX', 'PRIME', 'ELITE'];
        const risks = ['Low', 'Medium', 'High', 'Very High'];
        const colors = ['#ff6b6b', '#00d4aa', '#627eea', '#f7931a', '#a855f7', '#22c55e', '#3b82f6', '#f59e0b'];

        // Generate ULTRA combos (combo x combo x combo)
        for (let i = 0; i < 10; i++) {
            const prefix = prefixes[i % prefixes.length];
            const icon = icons[i % icons.length];
            const risk = risks[Math.floor(Math.random() * risks.length)];
            const baseApy = 20 + i * 10;
            const protection = Math.max(20, 90 - i * 8);

            ultraCombos.push({
                id: `${prefix}_COMBO_X${i + 1}`,
                name: `${icon} ${prefix} Combo X${i + 1}`,
                icon: icon,
                description: `Level ${i + 1} recursive combo - ${prefix.toLowerCase()} diversification`,
                riskLevel: risk,
                expectedApy: `${baseApy}-${baseApy * 2}%`,
                capitalProtection: `${protection}%`,
                minInvestment: 500 * (i + 1),
                rebalanceFrequency: i < 3 ? 'Monthly' : (i < 6 ? 'Weekly' : 'Daily'),
                isUltraCombo: true,
                comboLevel: i + 1,
                allocation: this.generateRandomAllocation(3 + Math.floor(i / 2), colors)
            });
        }

        return ultraCombos;
    },

    generateRandomAllocation(count, colors) {
        const products = [
            'MEGA Balanced', 'MEGA Aggressive', 'MEGA Income', 'MEGA Global', 'MEGA Future',
            'Blue Chip', 'Growth Portfolio', 'Conservative Yield', 'Degen Paradise', 'Tech Innovator',
            'Dividend Hunter', 'HODL Forever', 'Active Trader', 'Institutional Grade', 'Real World Assets'
        ];
        const allocation = [];
        let remaining = 100;

        for (let i = 0; i < count && remaining > 0; i++) {
            const isLast = i === count - 1;
            const percent = isLast ? remaining : Math.floor(remaining / (count - i) * (0.8 + Math.random() * 0.4));
            remaining -= percent;

            allocation.push({
                product: products[Math.floor(Math.random() * products.length)] + ' Combo',
                percent: percent,
                color: colors[i % colors.length],
                apy: `${10 + i * 5}-${30 + i * 10}%`,
                maxLoss: 20 + i * 8
            });
        }

        return allocation;
    },

    init() {
        // Translate UI when language changes
        if (typeof I18n !== 'undefined') {
            document.addEventListener('languageChanged', () => this.render());
        }
        // Add generated ultra combos
        this.combos = [...this.comboData, ...this.generateUltraCombos()];
        this.render();
        this.bindEvents();
        console.log('[Combos] Module initialized with', this.combos.length, 'combos (including generated)');
    },

    render(filter = 'all') {
        const grid = document.getElementById('combosGrid');
        if (!grid) return;

        const filtered = filter === 'all'
            ? this.combos
            : this.combos.filter(c => c.riskLevel === filter || c.riskLevel.includes(filter));

        grid.innerHTML = filtered.map(combo => this.renderComboCard(combo)).join('');
    },

    renderComboCard(combo) {
        const riskColors = {
            'Low': '#00ff88',
            'Medium': '#ffaa00',
            'High': '#ff6464'
        };
        const riskColor = riskColors[combo.riskLevel] || '#888';

        return `
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;" data-id="${combo.id}" style="
                background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                border: 1px solid #333;
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s ease;
                cursor: pointer;
            " onmouseover="this.style.borderColor='#00d4aa';this.style.transform='translateY(-4px)'"
               onmouseout="this.style.borderColor='#333';this.style.transform='translateY(0)'">

                <!-- Header -->
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                    <span style="font-size:2rem;">${combo.icon}</span>
                    <div>
                        <h3 style="color:#fff;margin:0;font-size:1.2rem;">${combo.name}</h3>
                        <span style="color:${riskColor};font-size:0.85rem;border:1px solid ${riskColor};padding:2px 8px;border-radius:12px;">${combo.riskLevel} Risk</span>
                    </div>
                </div>

                <p style="color:#888;font-size:0.9rem;margin-bottom:16px;">${combo.description}</p>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
                    <div style="text-align:center;">
                        <div style="color:#00ff88;font-size:1.1rem;font-weight:600;">${combo.expectedApy}</div>
                        <div style="color:#666;font-size:0.75rem;">APY</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#4a9eff;font-size:1.1rem;font-weight:600;">${combo.capitalProtection}</div>
                        <div style="color:#666;font-size:0.75rem;">Protection</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#fff;font-size:1.1rem;font-weight:600;">$${combo.minInvestment}</div>
                        <div style="color:#666;font-size:0.75rem;">Minimum</div>
                    </div>
                </div>

                <!-- Allocation Bar -->
                <div style="margin-bottom:16px;">
                    <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;">
                        ${combo.allocation.map(a => `<div style="width:${a.percent}%;background:${a.color};"></div>`).join('')}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                        ${combo.allocation.map(a => `
                            <span style="font-size:0.7rem;color:#888;">
                                <span style="color:${a.color};">●</span> ${a.product} ${a.percent}%
                            </span>
                        `).join('')}
                    </div>
                </div>

                <!-- Actions -->
                <div style="display:flex;gap:10px;">
                    <button onclick="CombosModule.openInvestModal('${combo.id}')" style="
                        flex:1;
                        padding:12px;
                        border-radius:8px;
                        border:none;
                        background:linear-gradient(135deg,#00d4aa,#00a884);
                        color:#fff;
                        font-weight:600;
                        cursor:pointer;
                        transition:opacity 0.2s;
                    " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        Investir
                    </button>
                    <button onclick="CombosModule.showDetails('${combo.id}')" style="
                        padding:12px 16px;
                        border-radius:8px;
                        border:1px solid #333;
                        background:transparent;
                        color:#888;
                        cursor:pointer;
                        transition:all 0.2s;
                    " onmouseover="this.style.borderColor='#00d4aa';this.style.color='#00d4aa'"
                       onmouseout="this.style.borderColor='#333';this.style.color='#888'">
                        Détails
                    </button>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.combo-filter, [data-risk]').forEach(btn => {
            if (btn.closest('#comboFilters')) {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.combo-filter').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const risk = e.target.dataset.risk;
                    this.render(risk);
                });
            }
        });

        // Amount input change
        const amountInput = document.getElementById('comboInvestAmount');
        if (amountInput) {
            amountInput.addEventListener('input', () => this.updatePreview());
        }
    },

    openInvestModal(comboId) {
        this.selectedCombo = this.combos.find(c => c.id === comboId);
        if (!this.selectedCombo) return;

        const modal = document.getElementById('comboInvestModal');
        const title = document.getElementById('modalComboTitle');
        const amountInput = document.getElementById('comboInvestAmount');

        const lang = (typeof I18n !== 'undefined') ? I18n.currentLang : 'en';
        const investIn = lang === 'fr' ? 'Investir dans' : lang === 'es' ? 'Invertir en' : lang === 'de' ? 'Investieren in' : 'Invest in';
        title.textContent = investIn + ' ' + this.selectedCombo.name;
        amountInput.value = this.selectedCombo.minInvestment;
        modal.style.display = 'flex';

        this.updatePreview();
    },

    closeModal() {
        const modal = document.getElementById('comboInvestModal');
        if (modal) modal.style.display = 'none';
        this.selectedCombo = null;
    },

    updatePreview() {
        const preview = document.getElementById('comboInvestPreview');
        const amountInput = document.getElementById('comboInvestAmount');
        if (!preview || !amountInput || !this.selectedCombo) return;

        const amount = parseFloat(amountInput.value) || 0;
        const combo = this.selectedCombo;

        if (amount < combo.minInvestment) {
            preview.innerHTML = `<p style="color:#ff6464;text-align:center;">Minimum: ${combo.minInvestment}</p>`;
            return;
        }

        const apyMin = parseFloat(combo.expectedApy.split('-')[0]);
        const apyMax = parseFloat(combo.expectedApy.split('-')[1] || apyMin);
        const yearlyMin = (amount * apyMin / 100);
        const yearlyMax = (amount * apyMax / 100);

        // Protection et perte potentielle
        const protectionPercent = parseFloat(combo.capitalProtection);
        const maxLossPercent = 100 - protectionPercent;
        const protectedAmount = amount * protectionPercent / 100;
        const maxLossAmount = amount * maxLossPercent / 100;

        // Scénarios
        const bestCase = amount + yearlyMax;
        const expectedCase = amount + (yearlyMin + yearlyMax) / 2;
        const worstCase = protectedAmount;

        preview.innerHTML = `
            <!-- Scénarios -->
            <div style="margin-bottom:15px;">
                <div style="color:#888;font-size:0.75rem;margin-bottom:8px;text-transform:uppercase;">${(typeof I18n !== 'undefined' ? I18n.t('annual_yield_estimate') : 'Projection à 1 an')}</div>

                <!-- Best case -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#00ff88;">🚀 ${(typeof I18n !== 'undefined' ? I18n.t('optimistic_case') : 'Optimiste')}</span>
                    <span style="color:#00ff88;font-weight:600;">$${bestCase.toFixed(0)} <span style="font-size:0.8rem;">(+${apyMax}%)</span></span>
                </div>

                <!-- Expected -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#ffaa00;">📊 ${(typeof I18n !== 'undefined' ? I18n.t('average_case') : 'Moyen')}</span>
                    <span style="color:#ffaa00;font-weight:600;">$${expectedCase.toFixed(0)} <span style="font-size:0.8rem;">(+${((apyMin + apyMax) / 2).toFixed(0)}%)</span></span>
                </div>

                <!-- Worst case -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
                    <span style="color:#ff6464;">⚠️ ${(typeof I18n !== 'undefined' ? I18n.t('worst_case') : 'Pire cas')}</span>
                    <span style="color:#ff6464;font-weight:600;">$${worstCase.toFixed(0)} <span style="font-size:0.8rem;">(-${maxLossPercent}%)</span></span>
                </div>
            </div>

            <!-- Résumé risque/rendement -->
            <div style="background:#0a0a15;border-radius:8px;padding:12px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;text-align:center;">
                    <div>
                        <div style="color:#00ff88;font-size:1.2rem;font-weight:700;">+$${yearlyMin.toFixed(0)} à +$${yearlyMax.toFixed(0)}</div>
                        <div style="color:#666;font-size:0.7rem;" data-i18n="potential_gain">Gain potentiel / an</div>
                    </div>
                    <div>
                        <div style="color:#ff6464;font-size:1.2rem;font-weight:700;">-$${maxLossAmount.toFixed(0)} max</div>
                        <div style="color:#666;font-size:0.7rem;">${(typeof I18n !== 'undefined' ? I18n.t('max_risk') : 'Perte max')} (-${maxLossPercent}%)</div>
                    </div>
                </div>
            </div>

            <!-- Barre protection -->
            <div style="background:linear-gradient(90deg,#00d4aa33 ${protectionPercent}%,#ff646433 ${protectionPercent}%);border-radius:6px;padding:10px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;">
                    <span>🛡️ Protégé: <strong style="color:#00d4aa;">$${protectedAmount.toFixed(0)}</strong></span>
                    <span>⚡ Risque: <strong style="color:#ff6464;">$${maxLossAmount.toFixed(0)}</strong></span>
                </div>
            </div>

            <!-- Allocation détaillée avec gains/pertes -->
            <details style="color:#888;font-size:0.8rem;" open>
                <summary style="cursor:pointer;font-weight:600;margin-bottom:10px;">📊 ${(typeof I18n !== 'undefined' ? I18n.t('allocation') : 'Détail par produit')}</summary>
                <div style="margin-top:8px;">
                    <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;font-size:0.75rem;padding-bottom:6px;border-bottom:1px solid #333;margin-bottom:6px;">
                        <span>${(typeof I18n !== 'undefined' ? I18n.t('product') : 'Produit')}</span>
                        <span style="text-align:right;">${(typeof I18n !== 'undefined' ? I18n.t('invested') : 'Investi')}</span>
                        <span style="text-align:right;color:#00ff88;">${(typeof I18n !== 'undefined' ? I18n.t('max_gain') : 'Gain max')}</span>
                        <span style="text-align:right;color:#ff6464;">${(typeof I18n !== 'undefined' ? I18n.t('max_loss') : 'Perte max')}</span>
                    </div>
                    ${combo.allocation.map(a => {
                        const invested = amount * a.percent / 100;
                        const apyMax = parseFloat((a.apy || '10-20%').split('-')[1]);
                        const maxGain = invested * apyMax / 100;
                        const maxLossAmt = invested * (a.maxLoss || 20) / 100;
                        return `
                        <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;padding:6px 0;border-bottom:1px solid #222;">
                            <span style="color:${a.color};">● ${a.product}</span>
                            <span style="text-align:right;color:#fff;">$${invested.toFixed(0)}</span>
                            <span style="text-align:right;color:#00ff88;">+$${maxGain.toFixed(0)}</span>
                            <span style="text-align:right;color:#ff6464;">-$${maxLossAmt.toFixed(0)}</span>
                        </div>`;
                    }).join('')}
                    <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;padding:8px 0;font-weight:600;border-top:1px solid #444;margin-top:4px;">
                        <span>TOTAL</span>
                        <span style="text-align:right;color:#fff;">$${amount.toFixed(0)}</span>
                        <span style="text-align:right;color:#00ff88;">+$${yearlyMax.toFixed(0)}</span>
                        <span style="text-align:right;color:#ff6464;">-$${maxLossAmount.toFixed(0)}</span>
                    </div>
                </div>
            </details>
        `;
    },

    // Open buy with card modal
    openBuyWithCard() {
        if (!this.selectedCombo) return;
        const amountInput = document.getElementById('comboInvestAmount');
        const amount = parseFloat(amountInput?.value) || 0;

        if (typeof FiatOnRamp !== 'undefined') {
            FiatOnRamp.showModal(amount);
        } else {
            alert('Module de paiement non disponible');
        }
    },

    async executeInvest() {
        const amountInput = document.getElementById('comboInvestAmount');
        const amount = parseFloat(amountInput?.value) || 0;

        if (!this.selectedCombo || amount < this.selectedCombo.minInvestment) {
            alert((typeof I18n !== 'undefined' ? I18n.t('amount') : 'Montant') + ' insuffisant');
            return;
        }

        // Enregistrer dans SimulatedPortfolio
        console.log("[Combos] Investing", amount, "in", this.selectedCombo.name);

        if (typeof SimulatedPortfolio !== "undefined") {
            const apyStr = this.selectedCombo.expectedApy || "10-15%";
            const apyMatch = apyStr.match(/([0-9]+)/);
            const apy = apyMatch ? parseFloat(apyMatch[1]) : 10;
            const result = SimulatedPortfolio.invest("combo-" + this.selectedCombo.id, this.selectedCombo.name, amount, apy, "combo", true, null);
            if (!result.success) {
                if (typeof showNotification === "function") { showNotification(result.error || "Solde insuffisant", "error"); }
                else { alert(result.error || "Solde insuffisant"); }
                return;
            }
            if (typeof showNotification === "function") { showNotification("🎮 $" + amount + " investi dans " + this.selectedCombo.name + " (" + apy + "% APY)", "success"); }
        } else {
            alert("✅ Investment OK! Combo: " + this.selectedCombo.name + " Amount: $" + amount);
        }

        this.closeModal();
    },

    showDetails(comboId) {
        const combo = this.combos.find(c => c.id === comboId);
        if (!combo) return;

        alert(
            `${combo.icon} ${combo.name}\n\n` +
            `📊 APY Attendu: ${combo.expectedApy}\n` +
            `🛡️ Protection: ${combo.capitalProtection}\n` +
            `💰 Minimum: $${combo.minInvestment}\n` +
            `🔄 Rééquilibrage: ${combo.rebalanceFrequency}\n\n` +
            `📈 Allocation:\n` +
            combo.allocation.map(a => `  • ${a.product}: ${a.percent}%`).join('\n')
        );
    }
};

// Global functions for onclick handlers
function closeComboModal() {
    CombosModule.closeModal();
}

function executeComboInvest() {
    CombosModule.executeInvest();
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Only init if on combos tab or when tab is shown
    if (document.getElementById('combosGrid')) {
        CombosModule.init();
    }
});

// Also init when tab is activated
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-tab="combos"]')) {
        setTimeout(() => CombosModule.init(), 100);
    }
});
