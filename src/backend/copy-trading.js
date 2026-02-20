/**
 * OBELISK Copy-Trading Leaderboard V1.1
 * PrimeXBT Covesting-style ranking system
 *
 * Features:
 * - 22 strategy managers ranked by totalYield
 * - Real-time performance tracking (simulated)
 * - Copy system: follow/unfollow managers
 * - Filters: strategy type, yield period, drawdown, followers
 * - Equity curve simulation
 * - Min copy: $1 USDC (recommended start)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'copytrading_state.json');

// ============================================
// STRATEGY MANAGER PROFILES (20 total)
// ============================================
const MANAGER_PROFILES = [
    {
        id: 'crypto_king',
        name: 'CryptoKing',
        avatar: 'CK',
        flag: '🇺🇸',
        style: 'Momentum Scalper',
        description: 'BTC/ETH momentum plays. Entry on confirmation, exit fast. 95%+ trades on top-10 coins.',
        strategies: ['Momentum', 'Breakout', 'Volume Profile'],
        timeframes: ['5m', '15m'],
        riskLevel: 'High',
        baseWinRate: 0.61,
        baseRR: 2.8,
        avgHoldTime: '5-30min',
        maxDrawdown: 12.4,
        minCopy: 1, // USD (recommended start: $1)
        fee: 20, // % performance fee
        activeFor: 847, // days
        baseROI: { daily: 1.8, monthly: 54, total: 1243 },
        tags: ['BTC', 'ETH', 'Scalping', 'Momentum'],
        verified: true,
        featured: true
    },
    {
        id: 'quant_alpha',
        name: 'QuantAlpha',
        avatar: 'QA',
        flag: '🇨🇭',
        style: 'Algorithmic HFT',
        description: 'Pure quant strategies. ML-driven signals on 50+ pairs. Zero emotion, pure data.',
        strategies: ['Machine Learning', 'Statistical Arbitrage', 'Mean Reversion'],
        timeframes: ['1m', '5m'],
        riskLevel: 'Medium',
        baseWinRate: 0.67,
        baseRR: 2.1,
        avgHoldTime: '2-15min',
        maxDrawdown: 7.8,
        minCopy: 1,
        fee: 25,
        activeFor: 1203,
        baseROI: { daily: 1.4, monthly: 42, total: 2840 },
        tags: ['Algo', 'HFT', 'ML', 'Multi-pair'],
        verified: true,
        featured: true
    },
    {
        id: 'whale_tracker',
        name: 'WhaleTracker',
        avatar: 'WT',
        flag: '🇬🇧',
        style: 'On-Chain Intelligence',
        description: 'Follows whale wallets and large OTC flows. Gets in before the crowd.',
        strategies: ['On-Chain Analysis', 'Order Flow', 'Whale Mirroring'],
        timeframes: ['1h', '4h'],
        riskLevel: 'Medium',
        baseWinRate: 0.58,
        baseRR: 3.2,
        avgHoldTime: '2h-2days',
        maxDrawdown: 15.2,
        minCopy: 1,
        fee: 20,
        activeFor: 562,
        baseROI: { daily: 1.1, monthly: 33, total: 876 },
        tags: ['On-Chain', 'Whale', 'ETH', 'DeFi'],
        verified: true,
        featured: false
    },
    {
        id: 'defi_harvester',
        name: 'DeFiHarvester',
        avatar: 'DH',
        flag: '🇩🇪',
        style: 'DeFi Yield + Perps',
        description: 'Combines DeFi yield farming with directional perp trades. Max capital efficiency.',
        strategies: ['Yield Farming', 'LP Optimization', 'Perp Hedging'],
        timeframes: ['4h', '1d'],
        riskLevel: 'Low',
        baseWinRate: 0.72,
        baseRR: 1.8,
        avgHoldTime: '1-7 days',
        maxDrawdown: 5.3,
        minCopy: 1,
        fee: 15,
        activeFor: 934,
        baseROI: { daily: 0.8, monthly: 24, total: 1560 },
        tags: ['DeFi', 'Yield', 'Low-risk', 'Arbitrum'],
        verified: true,
        featured: false
    },
    {
        id: 'sonic_speed',
        name: 'SonicSpeed',
        avatar: 'SS',
        flag: '🇯🇵',
        style: 'Sonic Chain HFT',
        description: 'Ultra-fast HFT on Sonic chain. 5000+ TPS, $0.00021/tx. Volume play specialist.',
        strategies: ['HFT', 'Market Making', 'Liquidity Provision'],
        timeframes: ['1m', '3m'],
        riskLevel: 'High',
        baseWinRate: 0.55,
        baseRR: 3.5,
        avgHoldTime: '30s-5min',
        maxDrawdown: 18.7,
        minCopy: 50,
        fee: 30,
        activeFor: 124,
        baseROI: { daily: 2.1, monthly: 63, total: 312 },
        tags: ['Sonic', 'HFT', 'Ultra-fast', 'New'],
        verified: false,
        featured: false
    },
    {
        id: 'trend_master',
        name: 'TrendMaster',
        avatar: 'TM',
        flag: '🇫🇷',
        style: 'Trend Following',
        description: 'Ichimoku + EMA system. Never fights the trend. Patient, disciplined, consistent.',
        strategies: ['Ichimoku', 'EMA Cross', 'ADX Trend'],
        timeframes: ['1h', '4h', '1d'],
        riskLevel: 'Low',
        baseWinRate: 0.64,
        baseRR: 2.5,
        avgHoldTime: '1-5 days',
        maxDrawdown: 8.1,
        minCopy: 1,
        fee: 20,
        activeFor: 1567,
        baseROI: { daily: 0.9, monthly: 27, total: 3421 },
        tags: ['Trend', 'Swing', 'EMA', 'Ichimoku'],
        verified: true,
        featured: true
    },
    {
        id: 'btc_maximalist',
        name: 'BTC Maximalist',
        avatar: 'BM',
        flag: '🇺🇸',
        style: 'Bitcoin Only',
        description: 'Pure BTC plays. On-chain metrics, halving cycles, macro. Long-term alpha.',
        strategies: ['Bitcoin Cycle', 'On-Chain Metrics', 'Macro'],
        timeframes: ['4h', '1d', '1w'],
        riskLevel: 'Medium',
        baseWinRate: 0.71,
        baseRR: 4.1,
        avgHoldTime: '3-14 days',
        maxDrawdown: 22.3,
        minCopy: 1,
        fee: 15,
        activeFor: 2103,
        baseROI: { daily: 0.7, monthly: 21, total: 5870 },
        tags: ['BTC', 'Long-term', 'Macro', 'HODL+'],
        verified: true,
        featured: false
    },
    {
        id: 'arb_king',
        name: 'ArbKing',
        avatar: 'AK',
        flag: '🇸🇬',
        style: 'Cross-Chain Arbitrage',
        description: 'Exploits price differences across Arbitrum, Sonic, Base. Near-zero risk arb plays.',
        strategies: ['Spot Arbitrage', 'Cross-Chain Arb', 'Funding Rate Arb'],
        timeframes: ['1m', '5m'],
        riskLevel: 'Low',
        baseWinRate: 0.89,
        baseRR: 1.3,
        avgHoldTime: '1-30min',
        maxDrawdown: 3.2,
        minCopy: 1,
        fee: 20,
        activeFor: 445,
        baseROI: { daily: 0.5, monthly: 15, total: 284 },
        tags: ['Arbitrage', 'Low-risk', 'Multi-chain', 'Consistent'],
        verified: true,
        featured: false
    },
    {
        id: 'degen_trader',
        name: 'DegenTrader',
        avatar: 'DT',
        flag: '🇰🇷',
        style: 'High-Risk Momentum',
        description: 'High leverage, high reward. Altcoin moonshots. Not for the faint-hearted.',
        strategies: ['Altcoin Momentum', 'Leverage Plays', 'News Trading'],
        timeframes: ['15m', '1h'],
        riskLevel: 'Very High',
        baseWinRate: 0.44,
        baseRR: 5.2,
        avgHoldTime: '1h-1day',
        maxDrawdown: 34.5,
        minCopy: 50,
        fee: 25,
        activeFor: 231,
        baseROI: { daily: 2.8, monthly: 84, total: 743 },
        tags: ['Altcoins', 'High-risk', 'YOLO', 'Moon'],
        verified: false,
        featured: false
    },
    {
        id: 'options_pro',
        name: 'OptionsPro',
        avatar: 'OP',
        flag: '🇨🇦',
        style: 'Options & Greeks',
        description: 'Crypto options specialist. Delta-neutral, volatility plays, covered calls.',
        strategies: ['Options', 'Delta Hedging', 'Volatility Trading'],
        timeframes: ['4h', '1d'],
        riskLevel: 'Medium',
        baseWinRate: 0.68,
        baseRR: 2.3,
        avgHoldTime: '1-7 days',
        maxDrawdown: 9.7,
        minCopy: 1,
        fee: 20,
        activeFor: 678,
        baseROI: { daily: 0.85, monthly: 25.5, total: 782 },
        tags: ['Options', 'Volatility', 'Delta', 'Professional'],
        verified: true,
        featured: false
    },
    {
        id: 'liquidity_ninja',
        name: 'LiquidityNinja',
        avatar: 'LN',
        flag: '🇦🇺',
        style: 'Orderbook Analysis',
        description: 'Reads orderbook like a pro. Hunts liquidity pools, stop hunts, and manipulation.',
        strategies: ['Orderbook', 'Liquidity Hunting', 'Stop Hunt'],
        timeframes: ['5m', '15m', '1h'],
        riskLevel: 'High',
        baseWinRate: 0.59,
        baseRR: 2.9,
        avgHoldTime: '30min-4h',
        maxDrawdown: 14.1,
        minCopy: 1,
        fee: 20,
        activeFor: 389,
        baseROI: { daily: 1.3, monthly: 39, total: 612 },
        tags: ['Orderbook', 'Scalping', 'Smart Money', 'Liquidity'],
        verified: true,
        featured: false
    },
    {
        id: 'solana_sniper',
        name: 'SolanaSniper',
        avatar: 'SN',
        flag: '🇧🇷',
        style: 'Solana Ecosystem',
        description: 'SOL ecosystem specialist. New listings, Drift perps, meme coin plays.',
        strategies: ['Solana DeFi', 'New Listings', 'Drift Perps'],
        timeframes: ['1m', '5m', '15m'],
        riskLevel: 'High',
        baseWinRate: 0.52,
        baseRR: 3.8,
        avgHoldTime: '15min-3h',
        maxDrawdown: 26.3,
        minCopy: 50,
        fee: 20,
        activeFor: 187,
        baseROI: { daily: 1.6, monthly: 48, total: 389 },
        tags: ['Solana', 'SOL', 'Memes', 'High-speed'],
        verified: false,
        featured: false
    },
    {
        id: 'yield_optimizer',
        name: 'YieldOptimizer',
        avatar: 'YO',
        flag: '🇳🇱',
        style: 'Yield Aggregation',
        description: 'Beefy/Spark/Vaultka-style yield stacking + perp hedging. Steady alpha.',
        strategies: ['Beefy Vaults', 'Spark Protocol', 'Yield + Hedge'],
        timeframes: ['1d', '1w'],
        riskLevel: 'Low',
        baseWinRate: 0.81,
        baseRR: 1.5,
        avgHoldTime: '1-30 days',
        maxDrawdown: 4.1,
        minCopy: 1,
        fee: 10,
        activeFor: 1124,
        baseROI: { daily: 0.45, monthly: 13.5, total: 890 },
        tags: ['Yield', 'DeFi', 'Beefy', 'Spark', 'Safe'],
        verified: true,
        featured: false
    },
    {
        id: 'macro_oracle',
        name: 'MacroOracle',
        avatar: 'MO',
        flag: '🇨🇭',
        style: 'Macro + Crypto',
        description: 'Trades crypto based on macro: Fed decisions, DXY, global liquidity cycles.',
        strategies: ['Macro Analysis', 'DXY Correlation', 'Global Liquidity'],
        timeframes: ['1d', '1w'],
        riskLevel: 'Medium',
        baseWinRate: 0.74,
        baseRR: 3.5,
        avgHoldTime: '3-21 days',
        maxDrawdown: 11.8,
        minCopy: 1,
        fee: 15,
        activeFor: 892,
        baseROI: { daily: 0.65, monthly: 19.5, total: 1234 },
        tags: ['Macro', 'BTC', 'ETH', 'Long-term'],
        verified: true,
        featured: false
    },
    {
        id: 'funding_farmer',
        name: 'FundingFarmer',
        avatar: 'FF',
        flag: '🇸🇪',
        style: 'Funding Rate Arb',
        description: 'Farms funding rates on APEX/dYdX/Hyperliquid. Delta-neutral income.',
        strategies: ['Funding Rate', 'Basis Trade', 'Delta Neutral'],
        timeframes: ['1h', '4h'],
        riskLevel: 'Low',
        baseWinRate: 0.83,
        baseRR: 1.4,
        avgHoldTime: '4h-3 days',
        maxDrawdown: 3.8,
        minCopy: 1,
        fee: 15,
        activeFor: 567,
        baseROI: { daily: 0.4, monthly: 12, total: 320 },
        tags: ['Funding', 'Arbitrage', 'Delta-neutral', 'APEX'],
        verified: true,
        featured: false
    },
    {
        id: 'altseason_pro',
        name: 'AltseasonPro',
        avatar: 'AP',
        flag: '🇮🇳',
        style: 'Altcoin Rotation',
        description: 'Rotates into alts during BTC dominance drops. Catches 10x+ moves early.',
        strategies: ['Alt Rotation', 'BTC.D Analysis', 'Sector Rotation'],
        timeframes: ['4h', '1d'],
        riskLevel: 'High',
        baseWinRate: 0.49,
        baseRR: 6.2,
        avgHoldTime: '2-14 days',
        maxDrawdown: 29.4,
        minCopy: 1,
        fee: 25,
        activeFor: 1456,
        baseROI: { daily: 1.2, monthly: 36, total: 4230 },
        tags: ['Altcoins', 'Rotation', '10x', 'Cycle'],
        verified: true,
        featured: false
    },
    {
        id: 'perp_precision',
        name: 'PerpPrecision',
        avatar: 'PP',
        flag: '🇮🇱',
        style: 'Perps Specialist',
        description: 'APEX/dYdX perpetuals. Tight SL, precise entries, never overlevered.',
        strategies: ['APEX Perps', 'CLOB Trading', 'Support/Resistance'],
        timeframes: ['15m', '1h'],
        riskLevel: 'Medium',
        baseWinRate: 0.62,
        baseRR: 2.6,
        avgHoldTime: '1h-2 days',
        maxDrawdown: 10.2,
        minCopy: 1,
        fee: 20,
        activeFor: 734,
        baseROI: { daily: 1.1, monthly: 33, total: 1120 },
        tags: ['Perps', 'APEX', 'Precision', 'Multi-venue'],
        verified: true,
        featured: false
    },
    {
        id: 'gainer_hunter',
        name: 'GainerHunter',
        avatar: 'GH',
        flag: '🇲🇽',
        style: 'CryptoRank Gainers',
        description: 'Scans top 24h gainers from CryptoRank. Buys momentum, sells into strength.',
        strategies: ['Gainers Scanner', 'Momentum', 'CryptoRank API'],
        timeframes: ['15m', '1h'],
        riskLevel: 'High',
        baseWinRate: 0.54,
        baseRR: 3.1,
        avgHoldTime: '1h-8h',
        maxDrawdown: 20.1,
        minCopy: 50,
        fee: 20,
        activeFor: 298,
        baseROI: { daily: 1.5, monthly: 45, total: 567 },
        tags: ['Gainers', 'Momentum', 'Scanner', 'Crypto'],
        verified: false,
        featured: false
    },
    {
        id: 'kyber_liquidity',
        name: 'KyberLiquidity',
        avatar: 'KL',
        flag: '🇻🇳',
        style: 'Liquidity + Routing',
        description: 'KyberSwap-style optimal routing + LP positions. Deep liquidity plays.',
        strategies: ['Elastic LP', 'Best Route', 'Fee Optimization'],
        timeframes: ['1h', '4h'],
        riskLevel: 'Low',
        baseWinRate: 0.76,
        baseRR: 1.9,
        avgHoldTime: '1-7 days',
        maxDrawdown: 6.2,
        minCopy: 1,
        fee: 15,
        activeFor: 412,
        baseROI: { daily: 0.6, monthly: 18, total: 378 },
        tags: ['KyberSwap', 'LP', 'DeFi', 'Liquidity'],
        verified: true,
        featured: false
    },
    {
        id: 'canton_quant',
        name: 'CantonQuant',
        avatar: 'CQ',
        flag: '🇨🇭',
        style: 'Institutional DeFi',
        description: 'Canton Network institutional flow analysis. Smart money positioning.',
        strategies: ['Canton Network', 'Institutional Flow', 'Smart Money'],
        timeframes: ['4h', '1d'],
        riskLevel: 'Low',
        baseWinRate: 0.78,
        baseRR: 2.2,
        avgHoldTime: '2-10 days',
        maxDrawdown: 5.7,
        minCopy: 1,
        fee: 20,
        activeFor: 156,
        baseROI: { daily: 0.55, monthly: 16.5, total: 108 },
        tags: ['Canton', 'Institutional', 'Smart Money', 'New'],
        verified: false,
        featured: false
    },
    {
        id: 'compound_compounder',
        name: 'CompoundCompounder',
        avatar: 'CC',
        flag: '🇺🇸',
        style: 'Compound Finance Yield',
        description: 'Lends on Compound Finance, auto-compounds COMP rewards + perp hedging. Delta-neutral income stacking.',
        strategies: ['Compound Finance', 'Auto-Compound', 'cToken Yield', 'Delta Neutral Hedge'],
        timeframes: ['1d', '1w'],
        riskLevel: 'Low',
        baseWinRate: 0.85,
        baseRR: 1.6,
        avgHoldTime: '7-30 days',
        maxDrawdown: 3.5,
        minCopy: 1,
        fee: 10,
        activeFor: 789,
        baseROI: { daily: 0.38, monthly: 11.4, total: 415 },
        tags: ['Compound', 'Lending', 'Yield', 'Auto-compound', 'Safe'],
        verified: true,
        featured: false
    },
    {
        id: 'bridgeswap_arb',
        name: 'BridgeSwapArb',
        avatar: 'BS',
        flag: '🇸🇬',
        style: 'Bridge + Swap Arbitrage',
        description: 'Exploits bridge inefficiencies across 15+ chains. BridgeSwap route optimizer. Near-risk-free spreads.',
        strategies: ['Bridge Arbitrage', 'Cross-Chain Swap', 'Route Optimization', 'Gas Optimization'],
        timeframes: ['5m', '15m'],
        riskLevel: 'Low',
        baseWinRate: 0.91,
        baseRR: 1.2,
        avgHoldTime: '5-60 min',
        maxDrawdown: 2.8,
        minCopy: 1,
        fee: 15,
        activeFor: 334,
        baseROI: { daily: 0.42, monthly: 12.6, total: 186 },
        tags: ['Bridge', 'Cross-chain', 'Arbitrage', 'Multi-chain', 'KyberSwap'],
        verified: true,
        featured: false
    },

    // ── MARKET MAKING ──
    {
        id: 'obelisk_mm',
        name: 'ObeliskMarketMaker',
        avatar: 'OM',
        flag: '🏛️',
        style: 'Market Making (Bid/Ask)',
        description: 'Native MM for Obelisk DEX. Posts bid/ask on 36 perp pairs. Earns spread + funding. Delta-hedged inventory.',
        strategies: ['Bid/Ask Spread', 'Inventory Management', 'Delta Hedge', 'Funding Arb'],
        timeframes: ['1m', '5m'],
        riskLevel: 'Low',
        baseWinRate: 0.88,
        baseRR: 1.4,
        avgHoldTime: '1-10 min',
        maxDrawdown: 4.1,
        minCopy: 1,
        fee: 10,
        activeFor: 245,
        baseROI: { daily: 0.55, monthly: 16.5, total: 180 },
        tags: ['Market Making', 'Obelisk', 'Spread', 'Low-risk', 'Bid/Ask'],
        verified: true,
        featured: true
    },
    {
        id: 'hyperliquid_mm',
        name: 'HyperMaker',
        avatar: 'HM',
        flag: '🇺🇸',
        style: 'Hyperliquid MM',
        description: 'Market maker on Hyperliquid CLOB. 0% maker fees. Posts tight spreads on BTC/ETH/SOL. Top-10 MM by volume.',
        strategies: ['CLOB Market Making', 'Tight Spread', 'Volume Rebate'],
        timeframes: ['1m', '3m'],
        riskLevel: 'Medium',
        baseWinRate: 0.82,
        baseRR: 1.6,
        avgHoldTime: '2-20 min',
        maxDrawdown: 6.8,
        minCopy: 1,
        fee: 15,
        activeFor: 412,
        baseROI: { daily: 0.72, monthly: 21.6, total: 423 },
        tags: ['Hyperliquid', 'MM', 'CLOB', '0% fees', 'Spread'],
        verified: true,
        featured: false
    },
    {
        id: 'apex_mm',
        name: 'APEXMaker',
        avatar: 'AM',
        flag: '🇸🇬',
        style: 'APEX Pro Market Making',
        description: 'MM on APEX Pro + Sonic. 0% maker fees both chains. Captures funding + spread on 20+ pairs.',
        strategies: ['APEX CLOB', 'Sonic MM', 'Cross-venue Spread', 'Funding Harvest'],
        timeframes: ['1m', '5m'],
        riskLevel: 'Low',
        baseWinRate: 0.85,
        baseRR: 1.5,
        avgHoldTime: '1-15 min',
        maxDrawdown: 3.9,
        minCopy: 1,
        fee: 12,
        activeFor: 321,
        baseROI: { daily: 0.62, monthly: 18.6, total: 268 },
        tags: ['APEX', 'Sonic', 'MM', '0% maker', 'Spread'],
        verified: true,
        featured: false
    },

    // ── LIQUIDITY PROVIDERS ──
    {
        id: 'usdc_usdt_lp',
        name: 'StableLPro',
        avatar: 'SL',
        flag: '🇨🇭',
        style: 'Stablecoin LP Provider',
        description: 'USDC/USDT/DAI liquidity on Uniswap V3 + Curve. Tight range, max fee capture. Near-zero IL.',
        strategies: ['Uniswap V3 LP', 'Curve LP', 'Concentrated Liquidity', 'Range Orders'],
        timeframes: ['1h', '1d'],
        riskLevel: 'Low',
        baseWinRate: 0.93,
        baseRR: 1.2,
        avgHoldTime: '1-7 days',
        maxDrawdown: 1.8,
        minCopy: 1,
        fee: 8,
        activeFor: 678,
        baseROI: { daily: 0.28, monthly: 8.4, total: 256 },
        tags: ['Stablecoin', 'LP', 'USDC', 'USDT', 'Curve', 'Safe'],
        verified: true,
        featured: true
    },
    {
        id: 'btc_eth_lp',
        name: 'BluechipLP',
        avatar: 'BL',
        flag: '🇩🇪',
        style: 'BTC/ETH Liquidity Provider',
        description: 'Concentrated LP on BTC/ETH/SOL Uniswap V3. Dynamic range rebalancing. Captures 80%+ of fees.',
        strategies: ['Uniswap V3 BTC', 'ETH/USDC LP', 'Dynamic Range', 'Auto-Rebalance'],
        timeframes: ['4h', '1d'],
        riskLevel: 'Medium',
        baseWinRate: 0.74,
        baseRR: 2.0,
        avgHoldTime: '2-14 days',
        maxDrawdown: 12.4,
        minCopy: 1,
        fee: 15,
        activeFor: 534,
        baseROI: { daily: 0.58, monthly: 17.4, total: 420 },
        tags: ['BTC', 'ETH', 'LP', 'Uniswap V3', 'Concentrated'],
        verified: true,
        featured: false
    },
    {
        id: 'vaultka_lp',
        name: 'VaultkaYield',
        avatar: 'VY',
        flag: '🇯🇵',
        style: 'Vaultka Vault Strategy',
        description: 'Deposits into Vaultka SAKE vaults. GLP + ETH exposure with auto-rebalancing. Steady yield.',
        strategies: ['Vaultka SAKE', 'GLP Vault', 'Arbitrum Yield', 'Auto-compound'],
        timeframes: ['1d', '1w'],
        riskLevel: 'Low',
        baseWinRate: 0.87,
        baseRR: 1.4,
        avgHoldTime: '7-30 days',
        maxDrawdown: 5.2,
        minCopy: 1,
        fee: 10,
        activeFor: 189,
        baseROI: { daily: 0.35, monthly: 10.5, total: 82 },
        tags: ['Vaultka', 'SAKE', 'GLP', 'Arbitrum', 'Vault'],
        verified: false,
        featured: false
    },
    {
        id: 'beefy_compounder',
        name: 'BeefyCompounder',
        avatar: 'BC',
        flag: '🇦🇺',
        style: 'Beefy Finance Auto-Compound',
        description: 'Deploys into highest-APY Beefy vaults. Auto-compounds every 2h. Covers Sonic, Arbitrum, Base.',
        strategies: ['Beefy Vaults', 'Auto-compound', 'Multi-chain Yield', 'APY Optimizer'],
        timeframes: ['1d', '1w'],
        riskLevel: 'Low',
        baseWinRate: 0.89,
        baseRR: 1.3,
        avgHoldTime: '7-60 days',
        maxDrawdown: 3.8,
        minCopy: 1,
        fee: 8,
        activeFor: 892,
        baseROI: { daily: 0.32, monthly: 9.6, total: 390 },
        tags: ['Beefy', 'Auto-compound', 'Sonic', 'Arbitrum', 'Safe'],
        verified: true,
        featured: false
    },

    // ── STABLECOINS STRATEGIES ──
    {
        id: 'stable_perp_arb',
        name: 'StablePerpArb',
        avatar: 'SP',
        flag: '🇫🇷',
        style: 'Stablecoin Perp Arbitrage',
        description: 'Goes long spot USDC on Spark, short USDC perp on Hyperliquid/APEX. Earns funding + yield spread.',
        strategies: ['Spark Lending', 'Perp Short', 'Funding Arb', 'Stablecoin Basis'],
        timeframes: ['4h', '1d'],
        riskLevel: 'Low',
        baseWinRate: 0.91,
        baseRR: 1.3,
        avgHoldTime: '1-7 days',
        maxDrawdown: 2.1,
        minCopy: 1,
        fee: 10,
        activeFor: 445,
        baseROI: { daily: 0.33, monthly: 9.9, total: 195 },
        tags: ['Stablecoin', 'Spark', 'Funding', 'Arbitrage', 'USDC'],
        verified: true,
        featured: false
    },
    {
        id: 'coindataflow_signals',
        name: 'DataFlowAlgo',
        avatar: 'DF',
        flag: '🇨🇦',
        style: 'CoinDataFlow Signal Trading',
        description: 'Algo based on CoinDataFlow metrics: exchange flows, SOPR, NVT. Pure on-chain signal trading.',
        strategies: ['Exchange Flows', 'SOPR', 'NVT Ratio', 'On-Chain Signals'],
        timeframes: ['4h', '1d'],
        riskLevel: 'Medium',
        baseWinRate: 0.63,
        baseRR: 2.8,
        avgHoldTime: '1-5 days',
        maxDrawdown: 11.2,
        minCopy: 1,
        fee: 18,
        activeFor: 267,
        baseROI: { daily: 0.88, monthly: 26.4, total: 312 },
        tags: ['On-Chain', 'CoinDataFlow', 'Signals', 'BTC', 'NVT'],
        verified: false,
        featured: false
    },
    {
        id: 'kyber_lp',
        name: 'KyberElastic',
        avatar: 'KE',
        flag: '🇻🇳',
        style: 'KyberSwap Elastic LP',
        description: 'KyberSwap Elastic liquidity provider. Proactive market making, dynamic fees, anti-IL protection.',
        strategies: ['KyberSwap Elastic', 'Dynamic Fees', 'Proactive MM', 'Anti-IL'],
        timeframes: ['1h', '4h'],
        riskLevel: 'Low',
        baseWinRate: 0.79,
        baseRR: 1.7,
        avgHoldTime: '1-7 days',
        maxDrawdown: 5.6,
        minCopy: 1,
        fee: 12,
        activeFor: 389,
        baseROI: { daily: 0.48, monthly: 14.4, total: 248 },
        tags: ['KyberSwap', 'Elastic', 'LP', 'DeFi', 'Anti-IL'],
        verified: true,
        featured: false
    }
];

// ============================================
// COPY-TRADING SERVICE
// ============================================
class CopyTradingService {
    constructor() {
        this.managers = {};
        this.copies = {}; // userId -> [managerId]
        this.initialized = false;
        this._initManagers();
    }

    _initManagers() {
        const state = this._loadState();
        const now = Date.now();

        for (const profile of MANAGER_PROFILES) {
            const saved = state.managers?.[profile.id];

            // Generate realistic equity curve
            const curve = saved?.equityCurve || this._generateEquityCurve(
                profile.activeFor,
                profile.baseROI.daily,
                profile.maxDrawdown
            );

            // Dynamic performance with small random walk
            const noise = (Math.random() - 0.49) * 0.3;
            const todayROI = profile.baseROI.daily + noise;

            this.managers[profile.id] = {
                ...profile,
                performance: {
                    totalROI: saved?.performance?.totalROI || profile.baseROI.total,
                    monthlyROI: saved?.performance?.monthlyROI || profile.baseROI.monthly,
                    weeklyROI: saved?.performance?.weeklyROI || +(profile.baseROI.monthly / 4).toFixed(2),
                    dailyROI: +todayROI.toFixed(2),
                    winRate: saved?.performance?.winRate || +(profile.baseWinRate * 100).toFixed(1),
                    totalTrades: saved?.performance?.totalTrades || Math.floor(profile.activeFor * profile.baseWinRate * 3),
                    winTrades: 0,
                    currentStreak: Math.floor(Math.random() * 8),
                    sharpe: +(profile.baseWinRate * 3.2 - profile.maxDrawdown / 20).toFixed(2),
                    maxDrawdown: profile.maxDrawdown
                },
                followers: saved?.followers || Math.floor(Math.random() * 800 + 50),
                aum: saved?.aum || Math.floor(Math.random() * 500000 + 5000), // Assets under mgmt
                equityCurve: curve,
                lastTrade: saved?.lastTrade || this._randomRecentTrade(profile),
                openPositions: saved?.openPositions || Math.floor(Math.random() * 3),
                lastUpdated: now
            };

            this.managers[profile.id].performance.winTrades = Math.floor(
                this.managers[profile.id].performance.totalTrades * profile.baseWinRate
            );
        }

        this.copies = state.copies || {};
        this.initialized = true;
    }

    _generateEquityCurve(days, dailyROI, maxDD) {
        const points = [];
        let equity = 100;
        const numPoints = Math.min(days, 90); // Max 90 data points
        const stepDays = days / numPoints;

        for (let i = 0; i <= numPoints; i++) {
            const dayPct = i / numPoints;
            // Smooth trend + realistic noise + occasional drawdown
            const trend = dailyROI * stepDays;
            const noise = (Math.random() - 0.45) * maxDD * 0.15;
            const ddEvent = Math.random() < 0.08 ? -maxDD * 0.3 * Math.random() : 0;
            equity = Math.max(50, equity * (1 + (trend + noise + ddEvent) / 100));
            points.push(+equity.toFixed(2));
        }
        return points;
    }

    _randomRecentTrade(profile) {
        const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ARB/USDT', 'SUI/USDT'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const side = Math.random() > 0.5 ? 'LONG' : 'SHORT';
        const pnlPct = Math.random() > profile.baseWinRate
            ? -(Math.random() * 2)
            : Math.random() * profile.baseRR * 1.5;
        return {
            symbol,
            side,
            pnlPct: +pnlPct.toFixed(2),
            closedAt: Date.now() - Math.floor(Math.random() * 3600000)
        };
    }

    _loadState() {
        try {
            if (fs.existsSync(STATE_FILE)) {
                return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            }
        } catch (e) {}
        return {};
    }

    _saveState() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            const state = {
                managers: {},
                copies: this.copies,
                savedAt: Date.now()
            };
            for (const [id, m] of Object.entries(this.managers)) {
                state.managers[id] = {
                    performance: m.performance,
                    followers: m.followers,
                    aum: m.aum,
                    equityCurve: m.equityCurve,
                    lastTrade: m.lastTrade,
                    openPositions: m.openPositions
                };
            }
            fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        } catch (e) {
            console.error('[CopyTrading] Save state error:', e.message);
        }
    }

    // Tick: update performance metrics (call every 30s)
    tick() {
        for (const [id, manager] of Object.entries(this.managers)) {
            const profile = MANAGER_PROFILES.find(p => p.id === id);
            if (!profile) continue;

            // Small random walk on daily ROI
            const noise = (Math.random() - 0.49) * 0.2;
            manager.performance.dailyROI = +(profile.baseROI.daily + noise).toFixed(2);

            // Occasionally update last trade
            if (Math.random() < 0.05) {
                manager.lastTrade = this._randomRecentTrade(profile);
                manager.performance.totalTrades++;
                if (Math.random() < profile.baseWinRate) {
                    manager.performance.winTrades++;
                    manager.performance.currentStreak = (manager.performance.currentStreak || 0) + 1;
                } else {
                    manager.performance.currentStreak = 0;
                }
            }

            // Update win rate
            if (manager.performance.totalTrades > 0) {
                manager.performance.winRate = +(manager.performance.winTrades / manager.performance.totalTrades * 100).toFixed(1);
            }

            manager.lastUpdated = Date.now();
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Get leaderboard sorted by criteria
     * @param {Object} opts - { sort, order, riskLevel, minROI, minFollowers, limit, offset }
     */
    getLeaderboard(opts = {}) {
        const {
            sort = 'totalROI',
            order = 'desc',
            riskLevel = null,
            minROI = 0,
            minFollowers = 0,
            verified = null,
            tags = [],
            limit = 20,
            offset = 0
        } = opts;

        let managers = Object.values(this.managers).map((m, idx) => ({
            rank: 0,
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            flag: m.flag,
            style: m.style,
            description: m.description,
            riskLevel: m.riskLevel,
            tags: m.tags,
            verified: m.verified,
            featured: m.featured,
            performance: m.performance,
            followers: m.followers,
            aum: m.aum,
            equityCurve: m.equityCurve.slice(-30), // Last 30 points for sparkline
            lastTrade: m.lastTrade,
            openPositions: m.openPositions,
            minCopy: m.minCopy,
            fee: m.fee,
            activeFor: m.activeFor,
            avgHoldTime: m.avgHoldTime
        }));

        // Filters
        if (riskLevel) managers = managers.filter(m => m.riskLevel === riskLevel);
        if (minROI > 0) managers = managers.filter(m => m.performance.totalROI >= minROI);
        if (minFollowers > 0) managers = managers.filter(m => m.followers >= minFollowers);
        if (verified !== null) managers = managers.filter(m => m.verified === verified);
        if (tags.length > 0) managers = managers.filter(m => tags.some(t => m.tags.includes(t)));

        // Sort
        const sortKey = {
            totalROI: m => m.performance.totalROI,
            monthlyROI: m => m.performance.monthlyROI,
            weeklyROI: m => m.performance.weeklyROI,
            dailyROI: m => m.performance.dailyROI,
            winRate: m => m.performance.winRate,
            followers: m => m.followers,
            aum: m => m.aum,
            maxDrawdown: m => m.performance.maxDrawdown,
            sharpe: m => m.performance.sharpe,
            trades: m => m.performance.totalTrades
        }[sort] || (m => m.performance.totalROI);

        managers.sort((a, b) => {
            const av = sortKey(a), bv = sortKey(b);
            return order === 'asc' ? av - bv : bv - av;
        });

        // Rank
        managers.forEach((m, i) => { m.rank = i + 1; });

        const total = managers.length;
        const paginated = managers.slice(offset, offset + limit);

        return { total, managers: paginated };
    }

    /**
     * Get single manager with full details
     */
    getManager(id) {
        const m = this.managers[id];
        if (!m) return null;
        return {
            ...m,
            profile: MANAGER_PROFILES.find(p => p.id === id)
        };
    }

    /**
     * Get featured managers (for homepage widget)
     */
    getFeatured() {
        return Object.values(this.managers)
            .filter(m => m.featured)
            .slice(0, 3)
            .map(m => ({
                id: m.id,
                name: m.name,
                avatar: m.avatar,
                flag: m.flag,
                totalROI: m.performance.totalROI,
                monthlyROI: m.performance.monthlyROI,
                winRate: m.performance.winRate,
                followers: m.followers,
                riskLevel: m.riskLevel,
                sparkline: m.equityCurve.slice(-15)
            }));
    }

    /**
     * Start copying a manager
     */
    startCopy(userId, managerId, amount) {
        const manager = this.managers[managerId];
        if (!manager) return { success: false, error: 'Manager not found' };
        if (amount < manager.minCopy) {
            return { success: false, error: `Minimum copy amount: $${manager.minCopy}` };
        }

        if (!this.copies[userId]) this.copies[userId] = {};
        this.copies[userId][managerId] = {
            amount,
            startedAt: Date.now(),
            startROI: manager.performance.totalROI
        };

        manager.followers++;
        manager.aum += amount;
        this._saveState();

        return {
            success: true,
            message: `Now copying ${manager.name}`,
            managerId,
            amount,
            performanceFee: `${manager.fee}%`
        };
    }

    /**
     * Stop copying a manager
     */
    stopCopy(userId, managerId) {
        const manager = this.managers[managerId];
        if (!manager) return { success: false, error: 'Manager not found' };

        const copyData = this.copies[userId]?.[managerId];
        if (!copyData) return { success: false, error: 'Not copying this manager' };

        const gainSinceStart = manager.performance.totalROI - copyData.startROI;
        const pnl = (copyData.amount * gainSinceStart) / 100;

        delete this.copies[userId][managerId];
        manager.followers = Math.max(0, manager.followers - 1);
        manager.aum = Math.max(0, manager.aum - copyData.amount);
        this._saveState();

        return {
            success: true,
            message: `Stopped copying ${manager.name}`,
            pnl: +pnl.toFixed(2),
            durationMs: Date.now() - copyData.startedAt
        };
    }

    /**
     * Get user's active copies
     */
    getMyCopies(userId) {
        const userCopies = this.copies[userId] || {};
        return Object.entries(userCopies).map(([managerId, data]) => {
            const m = this.managers[managerId];
            if (!m) return null;
            const gainSinceStart = m.performance.totalROI - data.startROI;
            return {
                managerId,
                name: m.name,
                avatar: m.avatar,
                amount: data.amount,
                startedAt: data.startedAt,
                currentROI: +gainSinceStart.toFixed(2),
                currentPnL: +(data.amount * gainSinceStart / 100).toFixed(2),
                managerTotalROI: m.performance.totalROI,
                openPositions: m.openPositions
            };
        }).filter(Boolean);
    }

    /**
     * Summary stats for the platform
     */
    getStats() {
        const all = Object.values(this.managers);
        const best = all.reduce((a, b) => a.performance.totalROI > b.performance.totalROI ? a : b);
        const totalFollowers = all.reduce((s, m) => s + m.followers, 0);
        const totalAUM = all.reduce((s, m) => s + m.aum, 0);
        const avgROI = (all.reduce((s, m) => s + m.performance.totalROI, 0) / all.length).toFixed(2);

        return {
            totalManagers: all.length,
            totalFollowers,
            totalAUM: Math.round(totalAUM),
            avgTotalROI: +avgROI,
            bestManager: { id: best.id, name: best.name, totalROI: best.performance.totalROI },
            topDailyROI: Math.max(...all.map(m => m.performance.dailyROI))
        };
    }
}

// Singleton
let instance = null;

function getCopyTradingService() {
    if (!instance) {
        instance = new CopyTradingService();
        // Auto-tick every 30 seconds
        setInterval(() => {
            instance.tick();
        }, 30000);
    }
    return instance;
}

module.exports = { getCopyTradingService, CopyTradingService };
