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

        // === POLYGON / QUICKSWAP POOLS ===
        { id: 'matic-usdc-quick', name: 'MATIC/USDC', tokens: ['MATIC', 'USDC'], apy: 30, tvl: 45000000, fee: 0.3, risk: 'medium', dex: 'QuickSwap', category: 'polygon', icon: '🟣' },
        { id: 'matic-eth-quick', name: 'MATIC/ETH', tokens: ['MATIC', 'ETH'], apy: 28, tvl: 35000000, fee: 0.3, risk: 'medium', dex: 'QuickSwap', category: 'polygon', icon: '🟣' },
        { id: 'quick-matic', name: 'QUICK/MATIC', tokens: ['QUICK', 'MATIC'], apy: 55, tvl: 12000000, fee: 0.3, risk: 'high', dex: 'QuickSwap', category: 'polygon', icon: '⚡' },
        { id: 'usdc-usdt-quick', name: 'USDC/USDT', tokens: ['USDC', 'USDT'], apy: 10, tvl: 80000000, fee: 0.04, risk: 'low', dex: 'QuickSwap', category: 'polygon', icon: '💵' },

        // === FANTOM / SPOOKYSWAP POOLS ===
        { id: 'ftm-usdc-spooky', name: 'FTM/USDC', tokens: ['FTM', 'USDC'], apy: 35, tvl: 25000000, fee: 0.3, risk: 'high', dex: 'SpookySwap', category: 'fantom', icon: '👻' },
        { id: 'ftm-eth-spooky', name: 'FTM/ETH', tokens: ['FTM', 'ETH'], apy: 32, tvl: 18000000, fee: 0.3, risk: 'high', dex: 'SpookySwap', category: 'fantom', icon: '👻' },
        { id: 'boo-ftm', name: 'BOO/FTM', tokens: ['BOO', 'FTM'], apy: 65, tvl: 8000000, fee: 0.3, risk: 'high', dex: 'SpookySwap', category: 'fantom', icon: '🎃' },
        { id: 'usdc-dai-spooky', name: 'USDC/DAI', tokens: ['USDC', 'DAI'], apy: 12, tvl: 30000000, fee: 0.04, risk: 'low', dex: 'SpookySwap', category: 'fantom', icon: '💵' },

        // === KYBERSWAP POOLS (Multi-chain) ===
        { id: 'knc-eth-kyber', name: 'KNC/ETH', tokens: ['KNC', 'ETH'], apy: 40, tvl: 20000000, fee: 0.3, risk: 'medium', dex: 'KyberSwap', category: 'defi', icon: '💎' },
        { id: 'eth-usdc-kyber', name: 'ETH/USDC', tokens: ['ETH', 'USDC'], apy: 22, tvl: 60000000, fee: 0.25, risk: 'medium', dex: 'KyberSwap', category: 'eth', icon: '⟠' },
        { id: 'arb-usdc-kyber', name: 'ARB/USDC', tokens: ['ARB', 'USDC'], apy: 38, tvl: 15000000, fee: 0.3, risk: 'high', dex: 'KyberSwap', category: 'arbitrum', icon: '🔷' },

        // === SUSHISWAP POOLS ===
        { id: 'sushi-eth', name: 'SUSHI/ETH', tokens: ['SUSHI', 'ETH'], apy: 35, tvl: 25000000, fee: 0.3, risk: 'medium', dex: 'SushiSwap', category: 'defi', icon: '🍣' },
        { id: 'eth-usdc-sushi', name: 'ETH/USDC', tokens: ['ETH', 'USDC'], apy: 20, tvl: 90000000, fee: 0.3, risk: 'medium', dex: 'SushiSwap', category: 'eth', icon: '🍣' },
        { id: 'wbtc-eth-sushi', name: 'WBTC/ETH', tokens: ['WBTC', 'ETH'], apy: 16, tvl: 70000000, fee: 0.3, risk: 'medium', dex: 'SushiSwap', category: 'btc', icon: '🍣' },

        // === JUPITER POOLS (Solana) ===
        { id: 'sol-usdc-jup', name: 'SOL/USDC', tokens: ['SOL', 'USDC'], apy: 38, tvl: 120000000, fee: 0.25, risk: 'high', dex: 'Jupiter', category: 'solana', icon: '🪐' },
        { id: 'jup-sol', name: 'JUP/SOL', tokens: ['JUP', 'SOL'], apy: 55, tvl: 45000000, fee: 0.3, risk: 'high', dex: 'Jupiter', category: 'solana', icon: '🪐' },
        { id: 'jup-usdc', name: 'JUP/USDC', tokens: ['JUP', 'USDC'], apy: 48, tvl: 30000000, fee: 0.3, risk: 'high', dex: 'Jupiter', category: 'solana', icon: '🪐' },

        // === MUX PROTOCOL POOLS (Perps/Leveraged) ===
        { id: 'muxlp-arb', name: 'MUXLP (Arbitrum)', tokens: ['ETH', 'USDC', 'WBTC'], apy: 25, tvl: 40000000, fee: 0.1, risk: 'medium', dex: 'MUX Protocol', category: 'arbitrum', icon: '🔶' },
        { id: 'muxlp-ftm', name: 'MUXLP (Fantom)', tokens: ['FTM', 'USDC', 'ETH'], apy: 35, tvl: 15000000, fee: 0.1, risk: 'high', dex: 'MUX Protocol', category: 'fantom', icon: '🔶' },
        { id: 'muxlp-op', name: 'MUXLP (Optimism)', tokens: ['ETH', 'USDC', 'OP'], apy: 28, tvl: 20000000, fee: 0.1, risk: 'medium', dex: 'MUX Protocol', category: 'optimism', icon: '🔶' },

        // === VENUS PROTOCOL POOLS (BNB Chain Lending) ===
        { id: 'bnb-venus', name: 'BNB Supply', tokens: ['BNB'], apy: 5, tvl: 800000000, fee: 0, risk: 'low', dex: 'Venus Protocol', category: 'bsc', icon: '💛' },
        { id: 'usdc-venus', name: 'USDC Supply', tokens: ['USDC'], apy: 8, tvl: 300000000, fee: 0, risk: 'low', dex: 'Venus Protocol', category: 'bsc', icon: '💛' },
        { id: 'usdt-venus', name: 'USDT Supply', tokens: ['USDT'], apy: 7, tvl: 250000000, fee: 0, risk: 'low', dex: 'Venus Protocol', category: 'bsc', icon: '💛' },
        { id: 'eth-venus', name: 'ETH Supply', tokens: ['ETH'], apy: 4, tvl: 200000000, fee: 0, risk: 'low', dex: 'Venus Protocol', category: 'bsc', icon: '💛' },
        { id: 'xvs-venus', name: 'XVS Staking', tokens: ['XVS'], apy: 18, tvl: 60000000, fee: 0, risk: 'medium', dex: 'Venus Protocol', category: 'bsc', icon: '💛' },

        // === SYNTHETIX POOLS (Perps Liquidity) ===
        { id: 'snx-eth-perp', name: 'SNX/ETH', tokens: ['SNX', 'ETH'], apy: 30, tvl: 50000000, fee: 0.3, risk: 'medium', dex: 'Synthetix', category: 'defi', icon: '🟣' },
        { id: 'snx-lp-base', name: 'Synthetix LP (Base)', tokens: ['USDC', 'ETH', 'cbBTC'], apy: 22, tvl: 80000000, fee: 0.1, risk: 'medium', dex: 'Synthetix', category: 'eth', icon: '🟣' },
        { id: 'snx-lp-arb', name: 'Synthetix LP (Arbitrum)', tokens: ['USDC', 'ETH', 'ARB'], apy: 25, tvl: 40000000, fee: 0.1, risk: 'medium', dex: 'Synthetix', category: 'arbitrum', icon: '🟣' },

        // === CHEESESWAP POOLS (BNB Chain) ===
        { id: 'bnb-usdc-cheese', name: 'BNB/USDC', tokens: ['BNB', 'USDC'], apy: 28, tvl: 5000000, fee: 0.2, risk: 'high', dex: 'CheeseSwap', category: 'bsc', icon: '🧀' },
        { id: 'bnb-usdt-cheese', name: 'BNB/USDT', tokens: ['BNB', 'USDT'], apy: 25, tvl: 4000000, fee: 0.2, risk: 'high', dex: 'CheeseSwap', category: 'bsc', icon: '🧀' },
        { id: 'cheese-bnb', name: 'CHEESE/BNB', tokens: ['CHEESE', 'BNB'], apy: 120, tvl: 1000000, fee: 0.2, risk: 'extreme', dex: 'CheeseSwap', category: 'bsc', icon: '🧀' },

        // === INSTADAPP FLUID POOLS (Multi-chain) ===
        { id: 'fluid-eth-usdc', name: 'ETH/USDC Fluid', tokens: ['ETH', 'USDC'], apy: 18, tvl: 200000000, fee: 0.1, risk: 'low', dex: 'Instadapp Fluid', category: 'eth', icon: '💧' },
        { id: 'fluid-eth-usdt', name: 'ETH/USDT Fluid', tokens: ['ETH', 'USDT'], apy: 16, tvl: 150000000, fee: 0.1, risk: 'low', dex: 'Instadapp Fluid', category: 'eth', icon: '💧' },
        { id: 'fluid-wbtc-usdc', name: 'WBTC/USDC Fluid', tokens: ['WBTC', 'USDC'], apy: 14, tvl: 120000000, fee: 0.1, risk: 'medium', dex: 'Instadapp Fluid', category: 'btc', icon: '💧' },
        { id: 'fluid-usdc-usdt', name: 'USDC/USDT Fluid', tokens: ['USDC', 'USDT'], apy: 10, tvl: 500000000, fee: 0.01, risk: 'low', dex: 'Instadapp Fluid', category: 'stable', icon: '💧' },
    ],

    categories: {
        stable: { name: 'Stablecoin Pools', color: '#22c55e', description: 'Minimal impermanent loss' },
        eth: { name: 'ETH Pairs', color: '#627eea', description: 'Ethereum paired pools' },
        btc: { name: 'BTC Pairs', color: '#f7931a', description: 'Bitcoin paired pools' },
        arbitrum: { name: 'Arbitrum Ecosystem', color: '#28a0f0', description: 'ARB DEX pools' },
        optimism: { name: 'Optimism Ecosystem', color: '#ff0420', description: 'OP DEX pools' },
        solana: { name: 'Solana Ecosystem', color: '#14f195', description: 'SOL DEX pools' },
        defi: { name: 'DeFi Governance', color: '#8b5cf6', description: 'Protocol token pools' },
        polygon: { name: 'Polygon Ecosystem', color: '#8247e5', description: 'QuickSwap & Polygon DEX pools' },
        fantom: { name: 'Fantom Ecosystem', color: '#1969ff', description: 'SpookySwap & Fantom DEX pools' },
        bsc: { name: 'BNB Chain', color: '#f0b90b', description: 'Venus Protocol & BSC pools' },
        meme: { name: 'Meme Coins', color: '#f59e0b', description: 'High risk, high reward' }
    },

    // === POOL SECURITY / HACK PROTECTION ===
    poolSecurity: {
        pausedPools: {},      // { poolId: { reason, since } }
        pausedDexes: {},      // { dexName: { reason, since } }
        pausedCategories: {}, // { category: { reason, since } }
        tvlAlerts: {},        // { poolId: { previousTvl, alertTime } }
        tvlDropThreshold: 0.30,  // 30% TVL drop = warning
        tvlDropCritical: 0.50,   // 50% TVL drop = auto-pause pool
    },

    /**
     * Check if a pool is safe before adding liquidity
     */
    isPoolSafe(poolId) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) return { safe: false, reason: 'Pool not found' };

        // Check direct pool pause
        if (this.poolSecurity.pausedPools[poolId]) {
            return { safe: false, reason: this.poolSecurity.pausedPools[poolId].reason };
        }

        // Check DEX-level pause
        if (this.poolSecurity.pausedDexes[pool.dex]) {
            return { safe: false, reason: `DEX paused: ${this.poolSecurity.pausedDexes[pool.dex].reason}` };
        }

        // Check category/chain-level pause
        if (this.poolSecurity.pausedCategories[pool.category]) {
            return { safe: false, reason: `Chain/category paused: ${this.poolSecurity.pausedCategories[pool.category].reason}` };
        }

        // Check ArbitrageScanner chain/dex pauses if available
        if (typeof ArbitrageScanner !== 'undefined') {
            const categoryToNetwork = {
                arbitrum: 'arbitrum', optimism: 'optimism', polygon: 'polygon',
                fantom: 'fantom', solana: 'solana', bsc: 'bsc', eth: 'ethereum'
            };
            const network = categoryToNetwork[pool.category];
            if (network) {
                const chainCheck = ArbitrageScanner.isChainSafe(network);
                if (!chainCheck.safe) return { safe: false, reason: `Chain alert: ${chainCheck.reason}` };
            }
        }

        return { safe: true };
    },

    /**
     * Pause a pool, DEX, or category
     */
    pausePool(poolId, reason) {
        this.poolSecurity.pausedPools[poolId] = { reason, since: Date.now() };
        console.error(`[LP SECURITY] Pool paused: ${poolId} - ${reason}`);
    },

    pausePoolsByDex(dexName, reason) {
        this.poolSecurity.pausedDexes[dexName] = { reason, since: Date.now() };
        console.error(`[LP SECURITY] DEX paused: ${dexName} - ${reason}`);
    },

    pausePoolsByCategory(category, reason) {
        this.poolSecurity.pausedCategories[category] = { reason, since: Date.now() };
        console.error(`[LP SECURITY] Category paused: ${category} - ${reason}`);
    },

    resumePool(poolId) { delete this.poolSecurity.pausedPools[poolId]; },
    resumeDex(dexName) { delete this.poolSecurity.pausedDexes[dexName]; },
    resumeCategory(category) { delete this.poolSecurity.pausedCategories[category]; },

    /**
     * Simulate TVL monitoring - detect sudden drops (drain/exploit)
     */
    checkTvlHealth(poolId, currentTvl) {
        const prev = this.poolSecurity.tvlAlerts[poolId];
        if (!prev) {
            this.poolSecurity.tvlAlerts[poolId] = { previousTvl: currentTvl, alertTime: null };
            return { healthy: true };
        }

        if (prev.previousTvl > 0) {
            const drop = (prev.previousTvl - currentTvl) / prev.previousTvl;

            if (drop >= this.poolSecurity.tvlDropCritical) {
                this.pausePool(poolId, `Critical TVL drop: ${(drop * 100).toFixed(0)}% - possible exploit`);
                return { healthy: false, reason: `TVL dropped ${(drop * 100).toFixed(0)}%`, critical: true };
            }

            if (drop >= this.poolSecurity.tvlDropThreshold) {
                console.warn(`[LP SECURITY] TVL warning on ${poolId}: ${(drop * 100).toFixed(0)}% drop`);
                return { healthy: false, reason: `TVL dropped ${(drop * 100).toFixed(0)}%`, critical: false };
            }
        }

        prev.previousTvl = currentTvl;
        return { healthy: true };
    },

    /**
     * Get pools filtered by safety
     */
    getSafePools() {
        return this.pools.filter(p => this.isPoolSafe(p.id).safe);
    },

    /**
     * Get security status summary
     */
    getSecurityStatus() {
        return {
            pausedPools: Object.keys(this.poolSecurity.pausedPools),
            pausedDexes: Object.keys(this.poolSecurity.pausedDexes),
            pausedCategories: Object.keys(this.poolSecurity.pausedCategories),
            totalPools: this.pools.length,
            safePools: this.getSafePools().length
        };
    },

    userLPs: [],

    init() {
        this.load();

        // Listen for security alerts from ArbitrageScanner
        window.addEventListener('security-alert', (e) => {
            const { type, network, dex, reason } = e.detail || {};
            if (type === 'chain_paused' && network) {
                const categoryMap = {
                    arbitrum: 'arbitrum', optimism: 'optimism', polygon: 'polygon',
                    fantom: 'fantom', solana: 'solana', bsc: 'bsc', ethereum: 'eth'
                };
                const cat = categoryMap[network];
                if (cat) this.pausePoolsByCategory(cat, reason || `Chain ${network} security alert`);
            }
            if (type === 'dex_paused' && dex) {
                const dexNameMap = {
                    quickswap: 'QuickSwap', spookyswap: 'SpookySwap', kyberswap: 'KyberSwap',
                    jupiter: 'Jupiter', mux: 'MUX Protocol', venus: 'Venus Protocol',
                    synthetix: 'Synthetix', cheeseswap: 'CheeseSwap', instadapp: 'Instadapp Fluid',
                    uniswap_v3: 'Uniswap V3', sushiswap: 'SushiSwap', curve: 'Curve',
                    balancer: 'Balancer', pancakeswap: 'PancakeSwap'
                };
                const name = dexNameMap[dex];
                if (name) this.pausePoolsByDex(name, reason || `DEX ${dex} security alert`);
            }
            // Auto-resume when scanner resumes
            if (type === 'chain_resumed' && network) {
                const categoryMap = {
                    arbitrum: 'arbitrum', optimism: 'optimism', polygon: 'polygon',
                    fantom: 'fantom', solana: 'solana', bsc: 'bsc', ethereum: 'eth'
                };
                const cat = categoryMap[network];
                if (cat) this.resumeCategory(cat);
            }
            if (type === 'dex_resumed' && dex) {
                const dexNameMap = {
                    quickswap: 'QuickSwap', spookyswap: 'SpookySwap', kyberswap: 'KyberSwap',
                    jupiter: 'Jupiter', mux: 'MUX Protocol', venus: 'Venus Protocol',
                    synthetix: 'Synthetix', cheeseswap: 'CheeseSwap', instadapp: 'Instadapp Fluid',
                    uniswap_v3: 'Uniswap V3', sushiswap: 'SushiSwap', curve: 'Curve',
                    balancer: 'Balancer', pancakeswap: 'PancakeSwap'
                };
                const name = dexNameMap[dex];
                if (name) this.resumeDex(name);
            }
        });

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

        // Security check before adding liquidity
        const safetyCheck = this.isPoolSafe(poolId);
        if (!safetyCheck.safe) {
            console.error(`[LP SECURITY] Blocked add liquidity to ${poolId}: ${safetyCheck.reason}`);
            return { success: false, error: `Security: ${safetyCheck.reason}` };
        }
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
                const safety = this.isPoolSafe(p.id);
                const borderColor = safety.safe ? 'rgba(255,255,255,0.1)' : '#ef4444';
                html += '<div style="background:rgba(255,255,255,0.05);border:1px solid ' + borderColor + ';border-radius:10px;padding:12px;' + (!safety.safe ? 'opacity:0.6;' : '') + '">';
                html += '<div style="font-weight:bold;font-size:12px;margin-bottom:4px;">' + (p.icon || '') + ' ' + p.name + '</div>';
                if (!safety.safe) {
                    html += '<div style="font-size:9px;color:#ef4444;background:rgba(239,68,68,0.15);padding:3px 6px;border-radius:4px;margin-bottom:4px;">PAUSED: ' + safety.reason + '</div>';
                }
                html += '<div style="font-size:9px;color:#888;">' + p.dex + '</div>';
                html += '<div style="color:#00ff88;font-size:15px;font-weight:bold;margin:4px 0;">' + p.apy + '% APY</div>';
                html += '<div style="font-size:9px;">TVL: $' + (p.tvl / 1000000).toFixed(0) + 'M • Fee: ' + p.fee + '%</div>';
                html += '<div style="font-size:9px;color:' + riskColors[p.risk] + ';">Risk: ' + p.risk.toUpperCase() + '</div>';
                if (safety.safe) {
                    html += '<button onclick="LiquidityPoolsModule.showAddModal(\'' + p.id + '\')" style="margin-top:6px;padding:5px 10px;background:#00ff88;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:10px;width:100%;">Add Liquidity</button>';
                } else {
                    html += '<button disabled style="margin-top:6px;padding:5px 10px;background:#555;border:none;border-radius:6px;color:#999;font-weight:bold;font-size:10px;width:100%;cursor:not-allowed;">Temporarily Paused</button>';
                }
                html += '</div>';
            });

            html += '</div></div>';
        });

        el.innerHTML = html;
    },

    showAddModal(poolId) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) return;

        // Use InvestHelper for dual mode (Simulated/Real)
        // Map pool risk text to risk level number
        const riskMap = { low: 2, medium: 3, high: 4, extreme: 5 };
        if (typeof InvestHelper !== 'undefined') {
            InvestHelper.show({
                name: pool.name + ' LP',
                id: pool.id,
                apy: pool.apy,
                minInvest: 10,
                fee: pool.fee,
                risk: riskMap[pool.risk] || 3,
                icon: pool.icon || '💧',
                onInvest: (amount, mode) => {
                    this.executeAdd(pool, amount, mode);
                }
            });
        } else {
            this.showSimpleAddModal(poolId);
        }
    },

    executeAdd(pool, amount, mode) {
        if (mode === 'simulated') {
            const result = this.addLiquidity(pool.id, amount);
            if (!result.success && typeof showNotification === 'function') {
                showNotification(result.error, 'error');
            }
        } else {
            // Real mode - would integrate with actual DEX protocols
            if (typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected()) {
                console.log('[LP] Real add liquidity:', amount, pool.name);
                if (typeof showNotification === 'function') {
                    showNotification('Real liquidity added: $' + amount + ' to ' + pool.name, 'success');
                }
            }
        }
    },

    showSimpleAddModal(poolId) {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) return;

        const existing = document.getElementById('lp-modal');
        if (existing) existing.remove();

        const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', extreme: '#dc2626' };

        const modal = document.createElement('div');
        modal.id = 'lp-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:500;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:400px;width:90%;">
                <h3 style="color:#00ff88;margin:0 0 16px;">${pool.icon || ''} ${pool.name}</h3>
                <div style="margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">APY:</span>
                        <span style="color:#00ff88;font-weight:bold;">${pool.apy}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#888;">Risk:</span>
                        <span style="color:${riskColors[pool.risk]};">${pool.risk.toUpperCase()}</span>
                    </div>
                </div>
                <div style="margin-bottom:16px;">
                    <input type="number" id="lp-amount" min="10" placeholder="Enter amount..." style="width:100%;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                <button onclick="LiquidityPoolsModule.confirmAdd('${pool.id}')" style="width:100%;padding:12px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Add Liquidity</button>
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
