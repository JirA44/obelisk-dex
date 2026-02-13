// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - INVESTMENT PRODUCTS
// Complete suite: Staking, Pools, Vaults, Lending, Savings, Index Funds
// ═══════════════════════════════════════════════════════════════════════════════

const InvestmentProducts = {
    // ═══════════════════════════════════════════════════════════════════════════
    // STAKING PRODUCTS (12 products)
    // ═══════════════════════════════════════════════════════════════════════════
    staking: {
        products: [
            { id: 'eth-staking', name: 'ETH 2.0 Staking', token: 'ETH', icon: '⟠', apy: 4.5, minAmount: 0.001, minInvest: 1, lockPeriod: 0, tvl: 2450000000, risk: 'low', description: 'Stake ETH to secure the Ethereum network and earn passive rewards', rewards: 'ETH', autoCompound: true },
            { id: 'sol-staking', name: 'SOL Staking', token: 'SOL', icon: '◎', apy: 7.0, minAmount: 0.01, minInvest: 1, lockPeriod: 0, tvl: 890000000, risk: 'low', description: 'Delegate SOL to validators and earn staking rewards', rewards: 'SOL', autoCompound: true },
            { id: 'dot-staking', name: 'DOT Staking', token: 'DOT', icon: '●', apy: 12.0, minAmount: 1, minInvest: 1, lockPeriod: 28, tvl: 520000000, risk: 'low', description: 'Nominate validators on Polkadot with 28-day unbonding', rewards: 'DOT', autoCompound: false },
            { id: 'atom-staking', name: 'ATOM Staking', token: 'ATOM', icon: '⚛', apy: 15.0, minAmount: 0.5, minInvest: 1, lockPeriod: 21, tvl: 340000000, risk: 'low', description: 'Stake ATOM in Cosmos with 21-day unbonding', rewards: 'ATOM', autoCompound: false },
            { id: 'ada-staking', name: 'ADA Staking', token: 'ADA', icon: '₳', apy: 5.0, minAmount: 1, minInvest: 1, lockPeriod: 0, tvl: 620000000, risk: 'low', description: 'Delegate ADA to stake pools with no lock-up', rewards: 'ADA', autoCompound: true },
            { id: 'avax-staking', name: 'AVAX Staking', token: 'AVAX', icon: '🔺', apy: 8.0, minAmount: 0.1, minInvest: 1, lockPeriod: 14, tvl: 280000000, risk: 'low', description: 'Delegate AVAX to validators', rewards: 'AVAX', autoCompound: true },
            { id: 'near-staking', name: 'NEAR Staking', token: 'NEAR', icon: 'N', apy: 10.0, minAmount: 0.1, minInvest: 1, lockPeriod: 2, tvl: 180000000, risk: 'low', description: 'Stake NEAR with fast 2-day unbonding', rewards: 'NEAR', autoCompound: true },
            { id: 'matic-staking', name: 'MATIC Staking', token: 'MATIC', icon: '⬡', apy: 6.5, minAmount: 1, minInvest: 1, lockPeriod: 0, tvl: 420000000, risk: 'low', description: 'Stake MATIC to secure Polygon', rewards: 'MATIC', autoCompound: true },
            { id: 'bnb-staking', name: 'BNB Staking', token: 'BNB', icon: '⬢', apy: 3.5, minAmount: 0.01, minInvest: 1, lockPeriod: 7, tvl: 980000000, risk: 'low', description: 'Stake BNB on BSC validators', rewards: 'BNB', autoCompound: true },
            { id: 'ftm-staking', name: 'FTM Staking', token: 'FTM', icon: '👻', apy: 11.0, minAmount: 1, minInvest: 1, lockPeriod: 7, tvl: 95000000, risk: 'medium', description: 'Stake FTM on Fantom Opera', rewards: 'FTM', autoCompound: true },
            { id: 'algo-staking', name: 'ALGO Staking', token: 'ALGO', icon: '◇', apy: 5.5, minAmount: 1, minInvest: 1, lockPeriod: 0, tvl: 150000000, risk: 'low', description: 'Participate in Algorand governance', rewards: 'ALGO', autoCompound: true },
            { id: 'xtz-staking', name: 'XTZ Staking', token: 'XTZ', icon: 'ꜩ', apy: 6.0, minAmount: 1, minInvest: 1, lockPeriod: 0, tvl: 220000000, risk: 'low', description: 'Delegate XTZ to Tezos bakers', rewards: 'XTZ', autoCompound: true },
            // === NEW STAKING BATCH ===
            { id: 'sui-staking', name: 'SUI Staking', token: 'SUI', icon: '💧', apy: 4.2, minAmount: 1, minInvest: 1, lockPeriod: 0, tvl: 450000000, risk: 'low', description: 'Stake SUI on validators', rewards: 'SUI', autoCompound: true },
            { id: 'apt-staking', name: 'APT Staking', token: 'APT', icon: '🔷', apy: 7.0, minAmount: 1, minInvest: 1, lockPeriod: 0, tvl: 380000000, risk: 'low', description: 'Stake APT on Aptos validators', rewards: 'APT', autoCompound: true },
            { id: 'sei-staking', name: 'SEI Staking', token: 'SEI', icon: '🌊', apy: 5.5, minAmount: 1, minInvest: 1, lockPeriod: 21, tvl: 180000000, risk: 'low', description: 'Stake SEI with 21-day unbond', rewards: 'SEI', autoCompound: true },
            { id: 'inj-staking', name: 'INJ Staking', token: 'INJ', icon: '💉', apy: 15.0, minAmount: 0.1, minInvest: 1, lockPeriod: 21, tvl: 320000000, risk: 'low', description: 'Stake INJ on Injective', rewards: 'INJ', autoCompound: true },
            { id: 'tia-staking', name: 'TIA Staking', token: 'TIA', icon: '✨', apy: 12.0, minAmount: 1, minInvest: 1, lockPeriod: 21, tvl: 250000000, risk: 'low', description: 'Stake TIA on Celestia', rewards: 'TIA', autoCompound: true },
            { id: 'osmo-staking', name: 'OSMO Staking', token: 'OSMO', icon: '🌊', apy: 10.0, minAmount: 1, minInvest: 1, lockPeriod: 14, tvl: 180000000, risk: 'low', description: 'Stake OSMO on Osmosis', rewards: 'OSMO', autoCompound: true },
            { id: 'stx-staking', name: 'STX Stacking', token: 'STX', icon: '📦', apy: 8.0, minAmount: 100, minInvest: 50, lockPeriod: 14, tvl: 420000000, risk: 'low', description: 'Stack STX to earn BTC', rewards: 'BTC', autoCompound: false },
            { id: 'rpl-staking', name: 'RPL Node Staking', token: 'RPL', icon: '🚀', apy: 8.5, minAmount: 10, minInvest: 100, lockPeriod: 0, tvl: 180000000, risk: 'medium', description: 'Run Rocket Pool node', rewards: 'RPL+ETH', autoCompound: false },
            { id: 'ldo-staking', name: 'stETH Staking', token: 'stETH', icon: '🔵', apy: 4.0, minAmount: 0.01, minInvest: 1, lockPeriod: 0, tvl: 8500000000, risk: 'low', description: 'Liquid staking via Lido', rewards: 'stETH', autoCompound: true },
            { id: 'cbeth-staking', name: 'cbETH Staking', token: 'cbETH', icon: '🔷', apy: 3.8, minAmount: 0.01, minInvest: 1, lockPeriod: 0, tvl: 2800000000, risk: 'low', description: 'Liquid staking via Coinbase', rewards: 'cbETH', autoCompound: true },
            { id: 'reth-staking', name: 'rETH Staking', token: 'rETH', icon: '🚀', apy: 4.2, minAmount: 0.01, minInvest: 1, lockPeriod: 0, tvl: 1200000000, risk: 'low', description: 'Rocket Pool liquid staking', rewards: 'rETH', autoCompound: true },
            { id: 'mina-staking', name: 'MINA Staking', token: 'MINA', icon: 'M', apy: 12.0, minAmount: 1, minInvest: 1, lockPeriod: 0, tvl: 95000000, risk: 'low', description: 'Delegate MINA to block producers', rewards: 'MINA', autoCompound: true },
            { id: 'hbar-staking', name: 'HBAR Staking', token: 'HBAR', icon: 'ℏ', apy: 6.5, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 280000000, risk: 'low', description: 'Native HBAR staking', rewards: 'HBAR', autoCompound: true },
            { id: 'egld-staking', name: 'EGLD Staking', token: 'EGLD', icon: '⚡', apy: 8.0, minAmount: 1, minInvest: 50, lockPeriod: 10, tvl: 220000000, risk: 'low', description: 'Stake EGLD on MultiversX', rewards: 'EGLD', autoCompound: true },
            // === STAKING BATCH 2 ===
            { id: 'kas-staking', name: 'KAS Staking', token: 'KAS', icon: '🔷', apy: 0, minAmount: 1, minInvest: 1, lockPeriod: 0, tvl: 180000000, risk: 'medium', description: 'Hold KAS (PoW - no staking)', rewards: 'KAS', autoCompound: false },
            { id: 'jito-staking', name: 'JitoSOL Staking', token: 'JitoSOL', icon: '🟢', apy: 7.5, minAmount: 0.1, minInvest: 1, lockPeriod: 0, tvl: 950000000, risk: 'low', description: 'Jito liquid staking + MEV rewards', rewards: 'JitoSOL', autoCompound: true },
            { id: 'msol-staking', name: 'mSOL Staking', token: 'mSOL', icon: '🌊', apy: 6.8, minAmount: 0.1, minInvest: 1, lockPeriod: 0, tvl: 780000000, risk: 'low', description: 'Marinade liquid staking SOL', rewards: 'mSOL', autoCompound: true },
            { id: 'frxeth-staking', name: 'frxETH Staking', token: 'frxETH', icon: 'F', apy: 5.2, minAmount: 0.01, minInvest: 1, lockPeriod: 0, tvl: 450000000, risk: 'low', description: 'Frax liquid ETH staking', rewards: 'sfrxETH', autoCompound: true },
            { id: 'sweth-staking', name: 'swETH Staking', token: 'swETH', icon: '🟣', apy: 4.5, minAmount: 0.01, minInvest: 1, lockPeriod: 0, tvl: 320000000, risk: 'low', description: 'Swell liquid ETH staking', rewards: 'swETH', autoCompound: true },
            { id: 'oeth-staking', name: 'OETH Staking', token: 'OETH', icon: '🔵', apy: 5.8, minAmount: 0.01, minInvest: 1, lockPeriod: 0, tvl: 280000000, risk: 'low', description: 'Origin ETH yield token', rewards: 'OETH', autoCompound: true },
            { id: 'dym-staking', name: 'DYM Staking', token: 'DYM', icon: '🌀', apy: 18.0, minAmount: 1, minInvest: 1, lockPeriod: 21, tvl: 85000000, risk: 'medium', description: 'Stake DYM on Dymension', rewards: 'DYM', autoCompound: true },
            { id: 'astr-staking', name: 'ASTR Staking', token: 'ASTR', icon: '⭐', apy: 12.0, minAmount: 100, minInvest: 5, lockPeriod: 10, tvl: 95000000, risk: 'medium', description: 'Stake ASTR on Astar', rewards: 'ASTR', autoCompound: true },
            { id: 'glmr-staking', name: 'GLMR Staking', token: 'GLMR', icon: '🌙', apy: 8.5, minAmount: 100, minInvest: 5, lockPeriod: 14, tvl: 65000000, risk: 'medium', description: 'Delegate GLMR on Moonbeam', rewards: 'GLMR', autoCompound: true },
            { id: 'movr-staking', name: 'MOVR Staking', token: 'MOVR', icon: '🔴', apy: 10.0, minAmount: 1, minInvest: 10, lockPeriod: 14, tvl: 45000000, risk: 'medium', description: 'Delegate MOVR on Moonriver', rewards: 'MOVR', autoCompound: true },
            { id: 'ksm-staking', name: 'KSM Staking', token: 'KSM', icon: '🎨', apy: 15.0, minAmount: 0.1, minInvest: 10, lockPeriod: 7, tvl: 280000000, risk: 'medium', description: 'Nominate KSM on Kusama', rewards: 'KSM', autoCompound: false },
            { id: 'ton-staking', name: 'TON Staking', token: 'TON', icon: '💎', apy: 4.5, minAmount: 1, minInvest: 5, lockPeriod: 0, tvl: 450000000, risk: 'low', description: 'Stake TON on validators', rewards: 'TON', autoCompound: true },
            { id: 'rose-staking', name: 'ROSE Staking', token: 'ROSE', icon: '🌹', apy: 6.0, minAmount: 100, minInvest: 5, lockPeriod: 14, tvl: 85000000, risk: 'medium', description: 'Stake ROSE on Oasis', rewards: 'ROSE', autoCompound: true },
            { id: 'kava-staking', name: 'KAVA Staking', token: 'KAVA', icon: '🔥', apy: 20.0, minAmount: 1, minInvest: 5, lockPeriod: 21, tvl: 120000000, risk: 'medium', description: 'Stake KAVA on validators', rewards: 'KAVA', autoCompound: true },
            { id: 'cro-staking', name: 'CRO Staking', token: 'CRO', icon: '🔷', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 28, tvl: 250000000, risk: 'low', description: 'Stake CRO on Cronos', rewards: 'CRO', autoCompound: true },
            { id: 'one-staking', name: 'ONE Staking', token: 'ONE', icon: '1️⃣', apy: 8.0, minAmount: 100, minInvest: 5, lockPeriod: 7, tvl: 75000000, risk: 'medium', description: 'Stake ONE on Harmony', rewards: 'ONE', autoCompound: true },
            { id: 'celo-staking', name: 'CELO Staking', token: 'CELO', icon: '🟢', apy: 5.5, minAmount: 1, minInvest: 5, lockPeriod: 3, tvl: 95000000, risk: 'low', description: 'Stake CELO on validators', rewards: 'CELO', autoCompound: true },
            { id: 'flow-staking', name: 'FLOW Staking', token: 'FLOW', icon: '🌊', apy: 7.0, minAmount: 1, minInvest: 10, lockPeriod: 14, tvl: 180000000, risk: 'medium', description: 'Stake FLOW on Dapper', rewards: 'FLOW', autoCompound: true },
            { id: 'icp-staking', name: 'ICP Staking', token: 'ICP', icon: '♾️', apy: 12.0, minAmount: 1, minInvest: 20, lockPeriod: 180, tvl: 420000000, risk: 'medium', description: 'Stake ICP on Internet Computer', rewards: 'ICP', autoCompound: false },
            { id: 'fil-staking', name: 'FIL Staking', token: 'FIL', icon: '📁', apy: 8.0, minAmount: 1, minInvest: 10, lockPeriod: 0, tvl: 280000000, risk: 'medium', description: 'FIL storage provider rewards', rewards: 'FIL', autoCompound: false },
            { id: 'ar-staking', name: 'AR Staking', token: 'AR', icon: '📦', apy: 5.0, minAmount: 0.1, minInvest: 20, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Arweave mining rewards', rewards: 'AR', autoCompound: false },
            { id: 'theta-staking', name: 'THETA Staking', token: 'THETA', icon: '📺', apy: 3.5, minAmount: 1000, minInvest: 50, lockPeriod: 0, tvl: 420000000, risk: 'medium', description: 'Stake THETA as Guardian', rewards: 'TFUEL', autoCompound: false },
            { id: 'vet-staking', name: 'VET Staking', token: 'VET', icon: '✔️', apy: 2.5, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 180000000, risk: 'medium', description: 'Hold VET to earn VTHO', rewards: 'VTHO', autoCompound: false },
            // === STAKING BATCH 3 ===
            { id: 'zil-staking', name: 'ZIL Staking', token: 'ZIL', icon: '💠', apy: 12.0, minAmount: 100, minInvest: 5, lockPeriod: 14, tvl: 85000000, risk: 'medium', description: 'Stake ZIL on Zilliqa', rewards: 'ZIL', autoCompound: true },
            { id: 'neo-staking', name: 'NEO Staking', token: 'NEO', icon: '🟢', apy: 3.0, minAmount: 1, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Hold NEO to earn GAS', rewards: 'GAS', autoCompound: false },
            { id: 'ont-staking', name: 'ONT Staking', token: 'ONT', icon: '⬡', apy: 5.0, minAmount: 1, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Stake ONT on Ontology', rewards: 'ONG', autoCompound: false },
            { id: 'qtum-staking', name: 'QTUM Staking', token: 'QTUM', icon: 'Q', apy: 6.0, minAmount: 1, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Stake QTUM as super staker', rewards: 'QTUM', autoCompound: true },
            { id: 'waves-staking', name: 'WAVES Staking', token: 'WAVES', icon: '🌊', apy: 5.0, minAmount: 1, minInvest: 10, lockPeriod: 0, tvl: 75000000, risk: 'medium', description: 'Lease WAVES to nodes', rewards: 'WAVES', autoCompound: true },
            { id: 'xdc-staking', name: 'XDC Staking', token: 'XDC', icon: 'X', apy: 8.0, minAmount: 10000, minInvest: 50, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Stake XDC on XinFin', rewards: 'XDC', autoCompound: true },
            { id: 'iotx-staking', name: 'IOTX Staking', token: 'IOTX', icon: '📡', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Stake IOTX on IoTeX', rewards: 'IOTX', autoCompound: true },
            { id: 'lunc-staking', name: 'LUNC Staking', token: 'LUNC', icon: '🌙', apy: 15.0, minAmount: 10000, minInvest: 5, lockPeriod: 21, tvl: 45000000, risk: 'high', description: 'Stake LUNC Classic', rewards: 'LUNC', autoCompound: true },
            { id: 'axs-staking', name: 'AXS Staking', token: 'AXS', icon: '🎮', apy: 35.0, minAmount: 1, minInvest: 10, lockPeriod: 90, tvl: 125000000, risk: 'medium', description: 'Stake AXS on Axie', rewards: 'AXS', autoCompound: true },
            { id: 'sand-staking', name: 'SAND Staking', token: 'SAND', icon: '🏖️', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Stake SAND in Sandbox', rewards: 'SAND', autoCompound: true },
            { id: 'gala-staking', name: 'GALA Staking', token: 'GALA', icon: '🎲', apy: 8.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'high', description: 'Stake GALA nodes', rewards: 'GALA', autoCompound: true },
            { id: 'enj-staking', name: 'ENJ Staking', token: 'ENJ', icon: '⚔️', apy: 5.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Stake ENJ on Enjin', rewards: 'ENJ', autoCompound: true },
            { id: 'audio-staking', name: 'AUDIO Staking', token: 'AUDIO', icon: '🎵', apy: 18.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Stake AUDIO on Audius', rewards: 'AUDIO', autoCompound: true },
            { id: 'livepeer-staking', name: 'LPT Staking', token: 'LPT', icon: '📺', apy: 15.0, minAmount: 1, minInvest: 50, lockPeriod: 7, tvl: 95000000, risk: 'medium', description: 'Delegate LPT to orchestrators', rewards: 'LPT+ETH', autoCompound: false },
            { id: 'grt-staking', name: 'GRT Delegation', token: 'GRT', icon: '📊', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 28, tvl: 185000000, risk: 'medium', description: 'Delegate GRT to indexers', rewards: 'GRT', autoCompound: true },
            { id: 'ens-staking', name: 'ENS Staking', token: 'ENS', icon: '🔤', apy: 0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'ENS governance (no yield)', rewards: 'ENS', autoCompound: false },
            { id: 'blur-staking', name: 'BLUR Staking', token: 'BLUR', icon: '🟠', apy: 25.0, minAmount: 100, minInvest: 10, lockPeriod: 180, tvl: 65000000, risk: 'high', description: 'Stake BLUR for rewards', rewards: 'BLUR', autoCompound: true },
            { id: 'ape-staking', name: 'APE Staking', token: 'APE', icon: '🦍', apy: 8.0, minAmount: 1, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Stake APE in ecosystem', rewards: 'APE', autoCompound: true },
            { id: 'chz-staking', name: 'CHZ Staking', token: 'CHZ', icon: '⚽', apy: 6.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Stake CHZ on Chiliz', rewards: 'CHZ', autoCompound: true },
            { id: 'imx-staking', name: 'IMX Staking', token: 'IMX', icon: '🎮', apy: 12.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Stake IMX on Immutable', rewards: 'IMX', autoCompound: true },
            // === STAKING BATCH 4 ===
            { id: 'strk-staking', name: 'STRK Staking', token: 'STRK', icon: '⚡', apy: 8.5, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Stake STRK on StarkNet', rewards: 'STRK', autoCompound: true },
            { id: 'zk-staking', name: 'ZK Staking', token: 'ZK', icon: '🔐', apy: 10.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Stake ZK on zkSync', rewards: 'ZK', autoCompound: true },
            { id: 'manta-staking', name: 'MANTA Staking', token: 'MANTA', icon: '🐋', apy: 12.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 45000000, risk: 'medium-high', description: 'Stake MANTA on Manta Pacific', rewards: 'MANTA', autoCompound: true },
            { id: 'dym-staking', name: 'DYM Staking', token: 'DYM', icon: '🌀', apy: 15.0, minAmount: 50, minInvest: 10, lockPeriod: 21, tvl: 35000000, risk: 'medium-high', description: 'Stake DYM on Dymension', rewards: 'DYM', autoCompound: false },
            { id: 'alt-staking', name: 'ALT Staking', token: 'ALT', icon: '🔷', apy: 8.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'medium', description: 'Stake ALT on AltLayer', rewards: 'ALT', autoCompound: true },
            { id: 'w-staking', name: 'W Staking', token: 'W', icon: '🌉', apy: 6.5, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Stake Wormhole W tokens', rewards: 'W', autoCompound: true },
            { id: 'pyth-staking', name: 'PYTH Staking', token: 'PYTH', icon: '🐍', apy: 5.0, minAmount: 500, minInvest: 20, lockPeriod: 7, tvl: 180000000, risk: 'low-medium', description: 'Stake PYTH oracle tokens', rewards: 'PYTH', autoCompound: false },
            { id: 'jup-staking', name: 'JUP Staking', token: 'JUP', icon: '🪐', apy: 8.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 245000000, risk: 'low-medium', description: 'Stake JUP on Jupiter', rewards: 'JUP', autoCompound: true },
            { id: 'ethfi-staking', name: 'ETHFI Staking', token: 'ETHFI', icon: '🔷', apy: 10.0, minAmount: 50, minInvest: 15, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Stake ETHFI for rewards', rewards: 'ETHFI', autoCompound: true },
            { id: 'eigen-staking', name: 'EIGEN Staking', token: 'EIGEN', icon: '🔄', apy: 5.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 350000000, risk: 'low-medium', description: 'Stake EIGEN tokens', rewards: 'EIGEN', autoCompound: false },
            { id: 'ena-staking', name: 'ENA Staking', token: 'ENA', icon: 'E', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 7, tvl: 125000000, risk: 'medium', description: 'Stake ENA on Ethena', rewards: 'ENA', autoCompound: true },
            { id: 'pendle-staking', name: 'PENDLE Staking', token: 'PENDLE', icon: '📈', apy: 15.0, minAmount: 50, minInvest: 15, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Stake vePENDLE for rewards', rewards: 'PENDLE', autoCompound: false },
            { id: 'ondo-staking', name: 'ONDO Staking', token: 'ONDO', icon: '🏛️', apy: 6.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 75000000, risk: 'low-medium', description: 'Stake ONDO RWA tokens', rewards: 'ONDO', autoCompound: true },
            { id: 'blur-staking', name: 'BLUR Staking', token: 'BLUR', icon: '🎨', apy: 8.0, minAmount: 500, minInvest: 15, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Stake BLUR for rewards', rewards: 'BLUR', autoCompound: true },
            { id: 'gmx-staking', name: 'GMX Staking', token: 'GMX', icon: '🔷', apy: 18.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Stake GMX for esGMX + ETH', rewards: 'esGMX+ETH', autoCompound: false },
            { id: 'rdnt-staking', name: 'RDNT Staking', token: 'RDNT', icon: '✨', apy: 25.0, minAmount: 500, minInvest: 15, lockPeriod: 90, tvl: 35000000, risk: 'medium-high', description: 'Lock RDNT for dLP rewards', rewards: 'RDNT', autoCompound: false },
            { id: 'grail-staking', name: 'GRAIL Staking', token: 'GRAIL', icon: '🏆', apy: 35.0, minAmount: 0.1, minInvest: 50, lockPeriod: 0, tvl: 25000000, risk: 'high', description: 'Stake xGRAIL for dividends', rewards: 'ETH', autoCompound: false },
            { id: 'velo-staking', name: 'VELO Staking', token: 'VELO', icon: '🔴', apy: 28.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Lock veVELO for bribes', rewards: 'VELO', autoCompound: false },
            { id: 'aero-staking', name: 'AERO Staking', token: 'AERO', icon: '🔵', apy: 22.0, minAmount: 500, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Lock veAERO on Base', rewards: 'AERO', autoCompound: false },
            { id: 'kas-staking', name: 'KAS Staking', token: 'KAS', icon: '⛏️', apy: 0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'medium', description: 'Run Kaspa node (PoW)', rewards: 'KAS', autoCompound: false },
            // === STAKING BATCH 5 - MEGA ===
            { id: 'mode-staking', name: 'MODE Staking', token: 'MODE', icon: '🟡', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'high', description: 'Stake MODE on Mode Network', rewards: 'MODE', autoCompound: true },
            { id: 'blast-staking', name: 'BLAST Staking', token: 'BLAST', icon: '💥', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'high', description: 'Stake BLAST tokens', rewards: 'BLAST', autoCompound: true },
            { id: 'scroll-staking', name: 'SCROLL Staking', token: 'SCR', icon: '📜', apy: 10.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 35000000, risk: 'medium-high', description: 'Stake SCR on Scroll', rewards: 'SCR', autoCompound: true },
            { id: 'taiko-staking', name: 'TAIKO Staking', token: 'TAIKO', icon: '🥁', apy: 8.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'Stake TAIKO tokens', rewards: 'TAIKO', autoCompound: true },
            { id: 'zeta-staking', name: 'ZETA Staking', token: 'ZETA', icon: 'Z', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 14, tvl: 45000000, risk: 'medium', description: 'Stake ZETA on ZetaChain', rewards: 'ZETA', autoCompound: false },
            { id: 'rez-staking', name: 'REZ Staking', token: 'REZ', icon: '🔮', apy: 18.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium-high', description: 'Stake Renzo REZ tokens', rewards: 'REZ', autoCompound: true },
            { id: 'puffer-staking', name: 'PUFFER Staking', token: 'PUFFER', icon: '🐡', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium-high', description: 'Stake Puffer tokens', rewards: 'PUFFER', autoCompound: true },
            { id: 'omni-staking', name: 'OMNI Staking', token: 'OMNI', icon: '🌐', apy: 8.0, minAmount: 10, minInvest: 20, lockPeriod: 21, tvl: 35000000, risk: 'medium', description: 'Stake OMNI for rewards', rewards: 'OMNI', autoCompound: false },
            { id: 'saga-staking', name: 'SAGA Staking', token: 'SAGA', icon: '📖', apy: 10.0, minAmount: 50, minInvest: 15, lockPeriod: 21, tvl: 28000000, risk: 'medium', description: 'Stake SAGA tokens', rewards: 'SAGA', autoCompound: false },
            { id: 'tnsr-staking', name: 'TNSR Staking', token: 'TNSR', icon: '🎨', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'medium-high', description: 'Stake Tensor NFT tokens', rewards: 'TNSR', autoCompound: true },
            { id: 'kmno-staking', name: 'KMNO Staking', token: 'KMNO', icon: '🎰', apy: 20.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 12000000, risk: 'high', description: 'Stake Kamino tokens', rewards: 'KMNO', autoCompound: true },
            { id: 'parcl-staking', name: 'PARCL Staking', token: 'PARCL', icon: '🏠', apy: 15.0, minAmount: 500, minInvest: 10, lockPeriod: 0, tvl: 8000000, risk: 'high', description: 'Stake Parcl real estate', rewards: 'PARCL', autoCompound: true },
            { id: 'wen-staking', name: 'WEN Staking', token: 'WEN', icon: '📝', apy: 0, minAmount: 100000, minInvest: 5, lockPeriod: 0, tvl: 5000000, risk: 'high', description: 'Hold WEN meme token', rewards: 'WEN', autoCompound: false },
            { id: 'myro-staking', name: 'MYRO Staking', token: 'MYRO', icon: '🐕', apy: 0, minAmount: 10000, minInvest: 5, lockPeriod: 0, tvl: 8000000, risk: 'high', description: 'Hold MYRO meme token', rewards: 'MYRO', autoCompound: false },
            { id: 'orca-staking', name: 'ORCA Staking', token: 'ORCA', icon: '🐋', apy: 8.0, minAmount: 10, minInvest: 15, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Stake ORCA DEX tokens', rewards: 'ORCA', autoCompound: true },
            { id: 'ray-staking', name: 'RAY Staking', token: 'RAY', icon: '☀️', apy: 10.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Stake Raydium RAY', rewards: 'RAY', autoCompound: true },
            { id: 'mngo-staking', name: 'MNGO Staking', token: 'MNGO', icon: '🥭', apy: 5.0, minAmount: 100, minInvest: 5, lockPeriod: 0, tvl: 18000000, risk: 'medium', description: 'Stake Mango MNGO', rewards: 'MNGO', autoCompound: true },
            { id: 'hnt-staking', name: 'HNT Staking', token: 'HNT', icon: '📡', apy: 6.5, minAmount: 1, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Stake Helium HNT', rewards: 'HNT', autoCompound: false },
            { id: 'mobile-staking', name: 'MOBILE Staking', token: 'MOBILE', icon: '📱', apy: 8.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Stake Helium MOBILE', rewards: 'MOBILE', autoCompound: false },
            { id: 'iot-staking', name: 'IOT Staking', token: 'IOT', icon: '🌐', apy: 7.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'Stake Helium IOT', rewards: 'IOT', autoCompound: false },
            { id: 'akt-staking', name: 'AKT Staking', token: 'AKT', icon: '☁️', apy: 15.0, minAmount: 10, minInvest: 15, lockPeriod: 21, tvl: 85000000, risk: 'medium', description: 'Stake Akash AKT', rewards: 'AKT', autoCompound: false },
            { id: 'rune-staking', name: 'RUNE Staking', token: 'RUNE', icon: '⚡', apy: 8.0, minAmount: 1, minInvest: 25, lockPeriod: 0, tvl: 245000000, risk: 'medium', description: 'Provide RUNE liquidity', rewards: 'RUNE', autoCompound: false },
            { id: 'cacao-staking', name: 'CACAO Staking', token: 'CACAO', icon: '🍫', apy: 12.0, minAmount: 10, minInvest: 15, lockPeriod: 0, tvl: 35000000, risk: 'medium-high', description: 'Stake Maya CACAO', rewards: 'CACAO', autoCompound: false },
            { id: 'kuji-staking', name: 'KUJI Staking', token: 'KUJI', icon: '🐋', apy: 8.0, minAmount: 10, minInvest: 15, lockPeriod: 14, tvl: 45000000, risk: 'medium', description: 'Stake Kujira KUJI', rewards: 'KUJI', autoCompound: false },
            { id: 'ntrn-staking', name: 'NTRN Staking', token: 'NTRN', icon: '⚛️', apy: 10.0, minAmount: 50, minInvest: 10, lockPeriod: 21, tvl: 65000000, risk: 'medium', description: 'Stake Neutron NTRN', rewards: 'NTRN', autoCompound: false },
            { id: 'strd-staking', name: 'STRD Staking', token: 'STRD', icon: '🏃', apy: 12.0, minAmount: 10, minInvest: 15, lockPeriod: 14, tvl: 28000000, risk: 'medium', description: 'Stake Stride STRD', rewards: 'STRD', autoCompound: false },
            { id: 'mars-staking', name: 'MARS Staking', token: 'MARS', icon: '🔴', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium-high', description: 'Stake Mars Protocol', rewards: 'MARS', autoCompound: true },
            { id: 'astro-staking', name: 'ASTRO Staking', token: 'ASTRO', icon: '🚀', apy: 18.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Stake Astroport ASTRO', rewards: 'ASTRO', autoCompound: true },
            { id: 'whale-staking', name: 'WHALE Staking', token: 'WHALE', icon: '🐳', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium', description: 'Stake White Whale', rewards: 'WHALE', autoCompound: true },
            { id: 'lvn-staking', name: 'LVN Staking', token: 'LVN', icon: '🔷', apy: 25.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 12000000, risk: 'high', description: 'Stake Levana LVN', rewards: 'LVN', autoCompound: true },
            { id: 'degen-staking', name: 'DEGEN Staking', token: 'DEGEN', icon: '🎩', apy: 0, minAmount: 1000, minInvest: 5, lockPeriod: 0, tvl: 15000000, risk: 'high', description: 'Hold DEGEN on Base', rewards: 'DEGEN', autoCompound: false },
            { id: 'brett-staking', name: 'BRETT Staking', token: 'BRETT', icon: '🔵', apy: 0, minAmount: 1000, minInvest: 5, lockPeriod: 0, tvl: 25000000, risk: 'high', description: 'Hold BRETT meme token', rewards: 'BRETT', autoCompound: false },
            { id: 'toshi-staking', name: 'TOSHI Staking', token: 'TOSHI', icon: '🐱', apy: 0, minAmount: 10000, minInvest: 5, lockPeriod: 0, tvl: 8000000, risk: 'high', description: 'Hold TOSHI on Base', rewards: 'TOSHI', autoCompound: false },
            // === STAKING BATCH 6 - ULTRA ===
            { id: 'zro-staking', name: 'ZRO Staking', token: 'ZRO', icon: '0️⃣', apy: 12.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'LayerZero governance staking', rewards: 'ZRO', autoCompound: true },
            { id: 'arkm-staking', name: 'ARKM Staking', token: 'ARKM', icon: '🔍', apy: 15.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium-high', description: 'Arkham Intelligence staking', rewards: 'ARKM', autoCompound: true },
            { id: 'cyber-staking', name: 'CYBER Staking', token: 'CYBER', icon: '🌐', apy: 18.0, minAmount: 5, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'CyberConnect social staking', rewards: 'CYBER', autoCompound: true },
            { id: 'id-staking', name: 'ID Staking', token: 'ID', icon: '🪪', apy: 22.0, minAmount: 100, minInvest: 5, lockPeriod: 0, tvl: 35000000, risk: 'medium-high', description: 'SPACE ID domain staking', rewards: 'ID', autoCompound: true },
            { id: 'rdnt-staking', name: 'RDNT Staking', token: 'RDNT', icon: '☀️', apy: 25.0, minAmount: 100, minInvest: 10, lockPeriod: 90, tvl: 65000000, risk: 'medium', description: 'Radiant Capital dLP staking', rewards: 'RDNT', autoCompound: true },
            { id: 'magic-staking', name: 'MAGIC Staking', token: 'MAGIC', icon: '✨', apy: 15.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 42000000, risk: 'medium', description: 'Treasure DAO gaming staking', rewards: 'MAGIC', autoCompound: true },
            { id: 'ldo-staking', name: 'LDO Staking', token: 'LDO', icon: '🔷', apy: 5.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'low-medium', description: 'Lido DAO governance staking', rewards: 'LDO', autoCompound: false },
            { id: 'rpl-staking', name: 'RPL Staking', token: 'RPL', icon: '🚀', apy: 6.5, minAmount: 1, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'low-medium', description: 'Rocket Pool node operator', rewards: 'RPL', autoCompound: true },
            { id: 'swise-staking', name: 'SWISE Staking', token: 'SWISE', icon: '🦉', apy: 8.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'StakeWise governance staking', rewards: 'SWISE', autoCompound: true },
            { id: 'cbeth-staking', name: 'cbETH Staking', token: 'cbETH', icon: '🔵', apy: 3.5, minAmount: 0.01, minInvest: 50, lockPeriod: 0, tvl: 450000000, risk: 'very-low', description: 'Coinbase wrapped staked ETH', rewards: 'ETH', autoCompound: true },
            { id: 'sweth-staking', name: 'swETH Staking', token: 'swETH', icon: '🌊', apy: 4.2, minAmount: 0.01, minInvest: 50, lockPeriod: 0, tvl: 285000000, risk: 'low', description: 'Swell Network liquid staking', rewards: 'swETH', autoCompound: true },
            { id: 'oeth-staking', name: 'OETH Staking', token: 'OETH', icon: '🔵', apy: 5.5, minAmount: 0.01, minInvest: 50, lockPeriod: 0, tvl: 145000000, risk: 'low', description: 'Origin Ether yield', rewards: 'OETH', autoCompound: true },
            { id: 'ankr-staking', name: 'ANKR Staking', token: 'ANKR', icon: '⚓', apy: 8.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Ankr Network staking', rewards: 'ANKR', autoCompound: true },
            { id: 'ssv-staking', name: 'SSV Staking', token: 'SSV', icon: '🔐', apy: 10.0, minAmount: 1, minInvest: 20, lockPeriod: 0, tvl: 75000000, risk: 'medium', description: 'SSV Network DVT staking', rewards: 'SSV', autoCompound: true },
            { id: 'xai-staking', name: 'XAI Staking', token: 'XAI', icon: '🎮', apy: 35.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 42000000, risk: 'high', description: 'Xai gaming L3 staking', rewards: 'XAI', autoCompound: true },
            { id: 'prime-staking', name: 'PRIME Staking', token: 'PRIME', icon: '⬛', apy: 18.0, minAmount: 1, minInvest: 20, lockPeriod: 0, tvl: 65000000, risk: 'medium-high', description: 'Echelon Prime gaming', rewards: 'PRIME', autoCompound: true },
            { id: 'gala-staking', name: 'GALA Staking', token: 'GALA', icon: '🎰', apy: 12.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Gala Games node staking', rewards: 'GALA', autoCompound: true },
            { id: 'ilv-staking', name: 'ILV Staking', token: 'ILV', icon: '🎮', apy: 22.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 38000000, risk: 'medium-high', description: 'Illuvium gaming staking', rewards: 'ILV', autoCompound: true },
            { id: 'super-staking', name: 'SUPER Staking', token: 'SUPER', icon: '⚡', apy: 28.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'high', description: 'SuperVerse gaming staking', rewards: 'SUPER', autoCompound: true },
            { id: 'beam-staking', name: 'BEAM Staking', token: 'BEAM', icon: '🎮', apy: 15.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 48000000, risk: 'medium', description: 'Beam gaming subnet staking', rewards: 'BEAM', autoCompound: true },
            { id: 'ron-staking', name: 'RON Staking', token: 'RON', icon: '🎮', apy: 12.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Ronin Network staking', rewards: 'RON', autoCompound: true },
            { id: 'pixel-staking', name: 'PIXEL Staking', token: 'PIXEL', icon: '🎮', apy: 45.0, minAmount: 500, minInvest: 5, lockPeriod: 0, tvl: 28000000, risk: 'high', description: 'Pixels game staking', rewards: 'PIXEL', autoCompound: true },
            { id: 'portal-staking', name: 'PORTAL Staking', token: 'PORTAL', icon: '🌀', apy: 35.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 32000000, risk: 'high', description: 'Portal gaming staking', rewards: 'PORTAL', autoCompound: true },
            { id: 'woo-staking', name: 'WOO Staking', token: 'WOO', icon: '🔵', apy: 8.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'low-medium', description: 'WOO Network staking', rewards: 'WOO', autoCompound: true },
            { id: 'dodo-staking', name: 'DODO Staking', token: 'DODO', icon: '🦤', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'DODO DEX staking', rewards: 'DODO', autoCompound: true },
            { id: 'joe-staking', name: 'JOE Staking', token: 'JOE', icon: '☕', apy: 15.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Trader Joe staking', rewards: 'JOE', autoCompound: true },
            { id: 'sushi-staking', name: 'SUSHI Staking', token: 'SUSHI', icon: '🍣', apy: 8.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'low-medium', description: 'SushiSwap xSUSHI staking', rewards: 'SUSHI', autoCompound: true },
            { id: 'bal-staking', name: 'BAL Staking', token: 'BAL', icon: '⚖️', apy: 6.0, minAmount: 1, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'low-medium', description: 'Balancer veBAL staking', rewards: 'BAL', autoCompound: false },
            { id: '1inch-staking', name: '1INCH Staking', token: '1INCH', icon: '🦄', apy: 5.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'low-medium', description: '1inch DAO staking', rewards: '1INCH', autoCompound: true },
            { id: 'snx-staking', name: 'SNX Staking', token: 'SNX', icon: '⚫', apy: 18.0, minAmount: 10, minInvest: 20, lockPeriod: 7, tvl: 145000000, risk: 'medium', description: 'Synthetix staking rewards', rewards: 'SNX', autoCompound: true },
            { id: 'perp-staking', name: 'PERP Staking', token: 'PERP', icon: '📊', apy: 12.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 38000000, risk: 'medium', description: 'Perpetual Protocol staking', rewards: 'PERP', autoCompound: true },
            { id: 'dydx-staking', name: 'DYDX Staking', token: 'DYDX', icon: '📈', apy: 15.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'dYdX chain staking', rewards: 'DYDX', autoCompound: true },
            { id: 'mux-staking', name: 'MUX Staking', token: 'MUX', icon: '🔷', apy: 25.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium-high', description: 'MUX Protocol staking', rewards: 'MUX', autoCompound: true },
            { id: 'gns-staking', name: 'GNS Staking', token: 'GNS', icon: '💎', apy: 20.0, minAmount: 5, minInvest: 20, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Gains Network staking', rewards: 'GNS', autoCompound: true },
            { id: 'kwenta-staking', name: 'KWENTA Staking', token: 'KWENTA', icon: '📊', apy: 22.0, minAmount: 0.5, minInvest: 50, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'Kwenta derivatives staking', rewards: 'KWENTA', autoCompound: true },
            { id: 'lyra-staking', name: 'LYRA Staking', token: 'LYRA', icon: '🎵', apy: 18.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium-high', description: 'Lyra options staking', rewards: 'LYRA', autoCompound: true },
            { id: 'premia-staking', name: 'PREMIA Staking', token: 'PREMIA', icon: '💎', apy: 25.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'high', description: 'Premia options staking', rewards: 'PREMIA', autoCompound: true },
            { id: 'blur-staking', name: 'BLUR Staking', token: 'BLUR', icon: '🎨', apy: 0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Blur NFT marketplace', rewards: 'BLUR', autoCompound: false },
            { id: 'looks-staking', name: 'LOOKS Staking', token: 'LOOKS', icon: '👀', apy: 35.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'high', description: 'LooksRare NFT staking', rewards: 'LOOKS', autoCompound: true },
            { id: 'x2y2-staking', name: 'X2Y2 Staking', token: 'X2Y2', icon: '🔲', apy: 28.0, minAmount: 500, minInvest: 10, lockPeriod: 0, tvl: 12000000, risk: 'high', description: 'X2Y2 NFT marketplace staking', rewards: 'X2Y2', autoCompound: true },
            { id: 'ondo-staking', name: 'ONDO Staking', token: 'ONDO', icon: '🏛️', apy: 8.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'low-medium', description: 'Ondo Finance RWA staking', rewards: 'ONDO', autoCompound: true },
            { id: 'cfg-staking', name: 'CFG Staking', token: 'CFG', icon: '🌀', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Centrifuge RWA staking', rewards: 'CFG', autoCompound: true },
            // === STAKING BATCH 7 - MEGA ULTRA ===
            { id: 'hbar-staking', name: 'HBAR Staking', token: 'HBAR', icon: 'ℏ', apy: 6.5, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 285000000, risk: 'low-medium', description: 'Hedera network staking', rewards: 'HBAR', autoCompound: true },
            { id: 'algo-staking', name: 'ALGO Staking', token: 'ALGO', icon: '⬡', apy: 5.5, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 195000000, risk: 'low-medium', description: 'Algorand staking', rewards: 'ALGO', autoCompound: true },
            { id: 'xtz-staking', name: 'XTZ Staking', token: 'XTZ', icon: 'ꜩ', apy: 5.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 175000000, risk: 'low-medium', description: 'Tezos baking', rewards: 'XTZ', autoCompound: true },
            { id: 'flow-staking', name: 'FLOW Staking', token: 'FLOW', icon: '🌊', apy: 8.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Flow network staking', rewards: 'FLOW', autoCompound: true },
            { id: 'egld-staking', name: 'EGLD Staking', token: 'EGLD', icon: '⚡', apy: 10.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'MultiversX staking', rewards: 'EGLD', autoCompound: true },
            { id: 'kda-staking', name: 'KDA Staking', token: 'KDA', icon: '🔗', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Kadena staking', rewards: 'KDA', autoCompound: true },
            { id: 'vet-staking', name: 'VET Staking', token: 'VET', icon: '✔️', apy: 3.5, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'low-medium', description: 'VeChain staking', rewards: 'VTHO', autoCompound: false },
            { id: 'icp-staking', name: 'ICP Staking', token: 'ICP', icon: '∞', apy: 8.0, minAmount: 1, minInvest: 50, lockPeriod: 180, tvl: 185000000, risk: 'medium', description: 'Internet Computer neurons', rewards: 'ICP', autoCompound: true },
            { id: 'neo-staking', name: 'NEO Staking', token: 'NEO', icon: '💚', apy: 4.5, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 85000000, risk: 'low-medium', description: 'NEO gas generation', rewards: 'GAS', autoCompound: false },
            { id: 'qtum-staking', name: 'QTUM Staking', token: 'QTUM', icon: '🔷', apy: 6.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Qtum staking', rewards: 'QTUM', autoCompound: true },
            { id: 'zil-staking', name: 'ZIL Staking', token: 'ZIL', icon: '💎', apy: 12.5, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Zilliqa staking', rewards: 'ZIL', autoCompound: true },
            { id: 'rose-staking', name: 'ROSE Staking', token: 'ROSE', icon: '🌹', apy: 8.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 75000000, risk: 'medium', description: 'Oasis Network staking', rewards: 'ROSE', autoCompound: true },
            { id: 'celo-staking', name: 'CELO Staking', token: 'CELO', icon: '🟢', apy: 6.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 65000000, risk: 'low-medium', description: 'Celo staking', rewards: 'CELO', autoCompound: true },
            { id: 'one-staking', name: 'ONE Staking', token: 'ONE', icon: '1️⃣', apy: 9.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 48000000, risk: 'medium', description: 'Harmony staking', rewards: 'ONE', autoCompound: true },
            { id: 'kava-staking', name: 'KAVA Staking', token: 'KAVA', icon: '🔴', apy: 18.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Kava chain staking', rewards: 'KAVA', autoCompound: true },
            { id: 'mina-staking', name: 'MINA Staking', token: 'MINA', icon: '⚙️', apy: 12.0, minAmount: 1, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Mina Protocol staking', rewards: 'MINA', autoCompound: true },
            { id: 'ckb-staking', name: 'CKB Staking', token: 'CKB', icon: '🔓', apy: 3.5, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 38000000, risk: 'medium', description: 'Nervos Network staking', rewards: 'CKB', autoCompound: true },
            { id: 'glmr-staking', name: 'GLMR Staking', token: 'GLMR', icon: '🌙', apy: 14.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Moonbeam staking', rewards: 'GLMR', autoCompound: true },
            { id: 'movr-staking', name: 'MOVR Staking', token: 'MOVR', icon: '🚀', apy: 18.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'Moonriver staking', rewards: 'MOVR', autoCompound: true },
            { id: 'astr-staking', name: 'ASTR Staking', token: 'ASTR', icon: '⭐', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Astar Network staking', rewards: 'ASTR', autoCompound: true },
            { id: 'aca-staking', name: 'ACA Staking', token: 'ACA', icon: '🔴', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Acala staking', rewards: 'ACA', autoCompound: true },
            { id: 'pha-staking', name: 'PHA Staking', token: 'PHA', icon: '🔒', apy: 16.0, minAmount: 500, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'Phala Network staking', rewards: 'PHA', autoCompound: true },
            { id: 'lit-staking', name: 'LIT Staking', token: 'LIT', icon: '🔥', apy: 14.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium', description: 'Litentry staking', rewards: 'LIT', autoCompound: true },
            { id: 'clv-staking', name: 'CLV Staking', token: 'CLV', icon: '🍀', apy: 18.0, minAmount: 500, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium-high', description: 'Clover staking', rewards: 'CLV', autoCompound: true },
            { id: 'cspr-staking', name: 'CSPR Staking', token: 'CSPR', icon: '👻', apy: 10.0, minAmount: 500, minInvest: 10, lockPeriod: 0, tvl: 75000000, risk: 'medium', description: 'Casper Network staking', rewards: 'CSPR', autoCompound: true },
            { id: 'xdc-staking', name: 'XDC Staking', token: 'XDC', icon: '🔵', apy: 8.5, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'XDC Network staking', rewards: 'XDC', autoCompound: true },
            { id: 'iotx-staking', name: 'IOTX Staking', token: 'IOTX', icon: '📡', apy: 11.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 48000000, risk: 'medium', description: 'IoTeX staking', rewards: 'IOTX', autoCompound: true },
            { id: 'scrt-staking', name: 'SCRT Staking', token: 'SCRT', icon: '🤫', apy: 22.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium-high', description: 'Secret Network staking', rewards: 'SCRT', autoCompound: true },
            { id: 'band-staking', name: 'BAND Staking', token: 'BAND', icon: '📊', apy: 14.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 42000000, risk: 'medium', description: 'Band Protocol staking', rewards: 'BAND', autoCompound: true },
            { id: 'ocean-staking', name: 'OCEAN Staking', token: 'OCEAN', icon: '🌊', apy: 8.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Ocean Protocol staking', rewards: 'OCEAN', autoCompound: true },
            { id: 'storj-staking', name: 'STORJ Staking', token: 'STORJ', icon: '💾', apy: 6.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 38000000, risk: 'medium', description: 'Storj storage staking', rewards: 'STORJ', autoCompound: true },
            { id: 'sia-staking', name: 'SC Staking', token: 'SC', icon: '☁️', apy: 5.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'Siacoin storage staking', rewards: 'SC', autoCompound: true },
            { id: 'audio-staking', name: 'AUDIO Staking', token: 'AUDIO', icon: '🎵', apy: 18.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 32000000, risk: 'medium-high', description: 'Audius music staking', rewards: 'AUDIO', autoCompound: true },
            { id: 'rss3-staking', name: 'RSS3 Staking', token: 'RSS3', icon: '📡', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium-high', description: 'RSS3 social staking', rewards: 'RSS3', autoCompound: true },
            { id: 'mask-staking', name: 'MASK Staking', token: 'MASK', icon: '🎭', apy: 12.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Mask Network staking', rewards: 'MASK', autoCompound: true },
            { id: 'gal-staking', name: 'GAL Staking', token: 'GAL', icon: '🌌', apy: 10.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 42000000, risk: 'medium', description: 'Galxe staking', rewards: 'GAL', autoCompound: true },
            { id: 'hook-staking', name: 'HOOK Staking', token: 'HOOK', icon: '🪝', apy: 14.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'Hooked Protocol staking', rewards: 'HOOK', autoCompound: true },
            { id: 'edu-staking', name: 'EDU Staking', token: 'EDU', icon: '📚', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Open Campus staking', rewards: 'EDU', autoCompound: true },
            { id: 'api3-staking', name: 'API3 Staking', token: 'API3', icon: '🔌', apy: 8.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 48000000, risk: 'medium', description: 'API3 oracle staking', rewards: 'API3', autoCompound: true },
            { id: 'uma-staking', name: 'UMA Staking', token: 'UMA', icon: '🔮', apy: 15.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 38000000, risk: 'medium', description: 'UMA oracle staking', rewards: 'UMA', autoCompound: true },
            // === STAKING BATCH 8 - EXA ULTRA ===
            { id: 'ftm-staking', name: 'FTM Staking', token: 'FTM', icon: '👻', apy: 4.5, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'low-medium', description: 'Fantom staking', rewards: 'FTM', autoCompound: true },
            { id: 'eos-staking', name: 'EOS Staking', token: 'EOS', icon: '🔷', apy: 3.2, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 145000000, risk: 'low-medium', description: 'EOS REX staking', rewards: 'EOS', autoCompound: true },
            { id: 'xlm-staking', name: 'XLM Staking', token: 'XLM', icon: '✨', apy: 4.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'low-medium', description: 'Stellar lumens staking', rewards: 'XLM', autoCompound: true },
            { id: 'trx-staking', name: 'TRX Staking', token: 'TRX', icon: '🔺', apy: 5.5, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 195000000, risk: 'low-medium', description: 'Tron staking', rewards: 'TRX', autoCompound: true },
            { id: 'waves-staking', name: 'WAVES Staking', token: 'WAVES', icon: '🌊', apy: 6.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Waves staking', rewards: 'WAVES', autoCompound: true },
            { id: 'ont-staking', name: 'ONT Staking', token: 'ONT', icon: '🔷', apy: 5.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Ontology staking', rewards: 'ONG', autoCompound: false },
            { id: 'icx-staking', name: 'ICX Staking', token: 'ICX', icon: '🔶', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 38000000, risk: 'medium', description: 'ICON staking', rewards: 'ICX', autoCompound: true },
            { id: 'lsk-staking', name: 'LSK Staking', token: 'LSK', icon: '💎', apy: 8.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Lisk staking', rewards: 'LSK', autoCompound: true },
            { id: 'nano-staking', name: 'XNO Staking', token: 'XNO', icon: '⚡', apy: 0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'low', description: 'Nano representative staking', rewards: 'XNO', autoCompound: false },
            { id: 'iost-staking', name: 'IOST Staking', token: 'IOST', icon: '🌐', apy: 12.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium-high', description: 'IOST staking', rewards: 'IOST', autoCompound: true },
            { id: 'wax-staking', name: 'WAXP Staking', token: 'WAXP', icon: '🎮', apy: 8.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'WAX staking', rewards: 'WAXP', autoCompound: true },
            { id: 'flux-staking', name: 'FLUX Staking', token: 'FLUX', icon: '⚡', apy: 10.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Flux node staking', rewards: 'FLUX', autoCompound: true },
            { id: 'sys-staking', name: 'SYS Staking', token: 'SYS', icon: '🔷', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'Syscoin staking', rewards: 'SYS', autoCompound: true },
            { id: 'kmd-staking', name: 'KMD Staking', token: 'KMD', icon: '🐉', apy: 5.5, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 32000000, risk: 'medium', description: 'Komodo staking', rewards: 'KMD', autoCompound: true },
            { id: 'dcr-staking', name: 'DCR Staking', token: 'DCR', icon: '⚙️', apy: 8.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Decred staking', rewards: 'DCR', autoCompound: true },
            { id: 'dgb-staking', name: 'DGB Staking', token: 'DGB', icon: '🔵', apy: 4.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium', description: 'DigiByte staking', rewards: 'DGB', autoCompound: true },
            { id: 'rvn-staking', name: 'RVN Staking', token: 'RVN', icon: '🦅', apy: 0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'medium', description: 'Ravencoin mining', rewards: 'RVN', autoCompound: false },
            { id: 'fio-staking', name: 'FIO Staking', token: 'FIO', icon: '📧', apy: 25.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 12000000, risk: 'medium-high', description: 'FIO Protocol staking', rewards: 'FIO', autoCompound: true },
            { id: 'stx-staking', name: 'STX Staking', token: 'STX', icon: '📚', apy: 8.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Stacks stacking', rewards: 'BTC', autoCompound: false },
            { id: 'ordi-staking', name: 'ORDI Staking', token: 'ORDI', icon: '🟠', apy: 0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 85000000, risk: 'high', description: 'Ordinals staking', rewards: 'ORDI', autoCompound: false },
            { id: 'rats-staking', name: 'RATS Staking', token: 'RATS', icon: '🐀', apy: 15.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'high', description: 'Bitcoin RATS staking', rewards: 'RATS', autoCompound: true },
            { id: 'sats-staking', name: 'SATS Staking', token: 'SATS', icon: '₿', apy: 12.0, minAmount: 100000, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'high', description: 'Ordinals SATS staking', rewards: 'SATS', autoCompound: true },
            { id: 'turbo-staking', name: 'TURBO Staking', token: 'TURBO', icon: '🐸', apy: 0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'high', description: 'Turbo meme token', rewards: 'TURBO', autoCompound: false },
            { id: 'people-staking', name: 'PEOPLE Staking', token: 'PEOPLE', icon: '👥', apy: 8.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'ConstitutionDAO staking', rewards: 'PEOPLE', autoCompound: true },
            { id: 'jasmy-staking', name: 'JASMY Staking', token: 'JASMY', icon: '🇯🇵', apy: 12.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium-high', description: 'JasmyCoin staking', rewards: 'JASMY', autoCompound: true },
            { id: 'loom-staking', name: 'LOOM Staking', token: 'LOOM', icon: '🧵', apy: 15.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium-high', description: 'Loom Network staking', rewards: 'LOOM', autoCompound: true },
            { id: 'ankr-staking', name: 'ANKR Staking', token: 'ANKR', icon: '⚓', apy: 8.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Ankr staking', rewards: 'ANKR', autoCompound: true },
            { id: 'sxp-staking', name: 'SXP Staking', token: 'SXP', icon: '💳', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'Solar staking', rewards: 'SXP', autoCompound: true },
            { id: 'chr-staking', name: 'CHR Staking', token: 'CHR', icon: '🔗', apy: 12.0, minAmount: 500, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium', description: 'Chromia staking', rewards: 'CHR', autoCompound: true },
            { id: 'pundix-staking', name: 'PUNDIX Staking', token: 'PUNDIX', icon: '📱', apy: 15.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 18000000, risk: 'medium-high', description: 'Pundi X staking', rewards: 'PUNDIX', autoCompound: true },
            { id: 'spell-staking', name: 'SPELL Staking', token: 'SPELL', icon: '🧙', apy: 45.0, minAmount: 100000, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'high', description: 'Spell Token staking', rewards: 'SPELL', autoCompound: true },
            { id: 'joe-staking', name: 'JOE Staking', token: 'JOE', icon: '🔺', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 38000000, risk: 'medium', description: 'Trader Joe staking', rewards: 'JOE', autoCompound: true },
            { id: 'quick-staking', name: 'QUICK Staking', token: 'QUICK', icon: '⚡', apy: 18.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'QuickSwap staking', rewards: 'QUICK', autoCompound: true },
            { id: 'cream-staking', name: 'CREAM Staking', token: 'CREAM', icon: '🍦', apy: 8.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 15000000, risk: 'medium-high', description: 'Cream Finance staking', rewards: 'CREAM', autoCompound: true },
            // === STAKING BATCH 9 - YOTTA EXPANSION ===
            { id: 'bake-staking', name: 'BAKE Staking', token: 'BAKE', icon: '🥯', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium', description: 'BakerySwap staking', rewards: 'BAKE', autoCompound: true },
            { id: 'alpha-staking', name: 'ALPHA Staking', token: 'ALPHA', icon: 'α', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Alpha Venture staking', rewards: 'ALPHA', autoCompound: true },
            { id: 'reef-staking', name: 'REEF Staking', token: 'REEF', icon: '🐠', apy: 18.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium-high', description: 'Reef Finance staking', rewards: 'REEF', autoCompound: true },
            { id: 'dodo-staking', name: 'DODO Staking', token: 'DODO', icon: '🦤', apy: 14.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'DODO Exchange staking', rewards: 'DODO', autoCompound: true },
            { id: 'hard-staking', name: 'HARD Staking', token: 'HARD', icon: '💎', apy: 20.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'medium-high', description: 'HARD Protocol staking', rewards: 'HARD', autoCompound: true },
            { id: 'xvs-staking', name: 'XVS Staking', token: 'XVS', icon: '🔶', apy: 8.5, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Venus Protocol staking', rewards: 'XVS', autoCompound: true },
            { id: 'alpaca-staking', name: 'ALPACA Staking', token: 'ALPACA', icon: '🦙', apy: 22.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 32000000, risk: 'medium', description: 'Alpaca Finance staking', rewards: 'ALPACA', autoCompound: true },
            { id: 'banana-staking', name: 'BANANA Staking', token: 'BANANA', icon: '🍌', apy: 25.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'medium-high', description: 'ApeSwap staking', rewards: 'BANANA', autoCompound: true },
            { id: 'burger-staking', name: 'BURGER Staking', token: 'BURGER', icon: '🍔', apy: 18.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 12000000, risk: 'medium-high', description: 'BurgerSwap staking', rewards: 'BURGER', autoCompound: true },
            { id: 'eps-staking', name: 'EPS Staking', token: 'EPS', icon: 'ε', apy: 16.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium', description: 'Ellipsis Finance staking', rewards: 'EPS', autoCompound: true },
            { id: 'mdx-staking', name: 'MDX Staking', token: 'MDX', icon: '🔷', apy: 20.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium', description: 'MDEX staking', rewards: 'MDX', autoCompound: true },
            { id: 'bifi-staking', name: 'BIFI Staking', token: 'BIFI', icon: '🐮', apy: 8.0, minAmount: 0.1, minInvest: 50, lockPeriod: 0, tvl: 45000000, risk: 'low-medium', description: 'Beefy Finance staking', rewards: 'BIFI', autoCompound: true },
            { id: 'bunny-staking', name: 'BUNNY Staking', token: 'BUNNY', icon: '🐰', apy: 15.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium', description: 'Pancake Bunny staking', rewards: 'BUNNY', autoCompound: true },
            { id: 'auto-staking', name: 'AUTO Staking', token: 'AUTO', icon: '🤖', apy: 12.0, minAmount: 0.5, minInvest: 50, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'AutoFarm staking', rewards: 'AUTO', autoCompound: true },
            { id: 'belt-staking', name: 'BELT Staking', token: 'BELT', icon: '🔗', apy: 10.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'medium', description: 'Belt Finance staking', rewards: 'BELT', autoCompound: true },
            { id: 'nerve-staking', name: 'NRV Staking', token: 'NRV', icon: '⚡', apy: 25.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 8000000, risk: 'medium-high', description: 'Nerve Finance staking', rewards: 'NRV', autoCompound: true },
            { id: 'swipe-staking', name: 'SXP Staking V2', token: 'SXP', icon: '💳', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 30, tvl: 35000000, risk: 'low-medium', description: 'Swipe locked staking', rewards: 'SXP', autoCompound: true },
            { id: 'ramp-staking', name: 'RAMP Staking', token: 'RAMP', icon: '🛤️', apy: 18.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 12000000, risk: 'medium', description: 'RAMP DeFi staking', rewards: 'RAMP', autoCompound: true },
            { id: 'lit-staking', name: 'LIT Staking', token: 'LIT', icon: '🔥', apy: 22.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'medium-high', description: 'Litentry staking', rewards: 'LIT', autoCompound: true },
            { id: 'sfp-staking', name: 'SFP Staking', token: 'SFP', icon: '🔐', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'SafePal staking', rewards: 'SFP', autoCompound: true },
            { id: 'btcst-staking', name: 'BTCST Staking', token: 'BTCST', icon: '₿', apy: 6.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 42000000, risk: 'low-medium', description: 'Bitcoin Standard staking', rewards: 'BTCST', autoCompound: true },
            { id: 'bscpad-staking', name: 'BSCPAD Staking', token: 'BSCPAD', icon: '🚀', apy: 35.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'high', description: 'BSCPad launchpad staking', rewards: 'BSCPAD', autoCompound: true },
            { id: 'c98-staking', name: 'C98 Staking', token: 'C98', icon: '👛', apy: 15.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Coin98 wallet staking', rewards: 'C98', autoCompound: true },
            { id: 'twt-staking', name: 'TWT Staking', token: 'TWT', icon: '💎', apy: 8.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'low-medium', description: 'Trust Wallet staking', rewards: 'TWT', autoCompound: true },
            { id: 'math-staking', name: 'MATH Staking', token: 'MATH', icon: '🔢', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium', description: 'Math Wallet staking', rewards: 'MATH', autoCompound: true },
            { id: 'pols-staking', name: 'POLS Staking', token: 'POLS', icon: '🔮', apy: 28.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium-high', description: 'Polkastarter staking', rewards: 'POLS', autoCompound: true },
            { id: 'front-staking', name: 'FRONT Staking', token: 'FRONT', icon: '🎯', apy: 18.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'medium', description: 'Frontier staking', rewards: 'FRONT', autoCompound: true },
            { id: 'mir-staking', name: 'MIR Staking', token: 'MIR', icon: '🪞', apy: 15.0, minAmount: 20, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'Mirror Protocol staking', rewards: 'MIR', autoCompound: true },
            { id: 'bar-staking', name: 'BAR Staking', token: 'BAR', icon: '⚽', apy: 10.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium', description: 'FC Barcelona fan token staking', rewards: 'BAR', autoCompound: true },
            { id: 'psg-staking', name: 'PSG Staking', token: 'PSG', icon: '⚽', apy: 10.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'medium', description: 'Paris SG fan token staking', rewards: 'PSG', autoCompound: true },
            { id: 'juv-staking', name: 'JUV Staking', token: 'JUV', icon: '⚽', apy: 10.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 12000000, risk: 'medium', description: 'Juventus fan token staking', rewards: 'JUV', autoCompound: true },
            { id: 'atm-staking', name: 'ATM Staking', token: 'ATM', icon: '⚽', apy: 10.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 12000000, risk: 'medium', description: 'Atletico Madrid fan token staking', rewards: 'ATM', autoCompound: true },
            { id: 'city-staking', name: 'CITY Staking', token: 'CITY', icon: '⚽', apy: 10.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium', description: 'Man City fan token staking', rewards: 'CITY', autoCompound: true },
            { id: 'acm-staking', name: 'ACM Staking', token: 'ACM', icon: '⚽', apy: 10.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 10000000, risk: 'medium', description: 'AC Milan fan token staking', rewards: 'ACM', autoCompound: true },
            // === STAKING BATCH 10 - RONNA EXPANSION ===
            { id: 'floki-staking', name: 'FLOKI Staking', token: 'FLOKI', icon: '🐕', apy: 25.0, minAmount: 100000, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'high', description: 'Floki Inu staking', rewards: 'FLOKI', autoCompound: true },
            { id: 'babydoge-staking', name: 'BabyDoge Staking', token: 'BABYDOGE', icon: '🐶', apy: 35.0, minAmount: 1000000000, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'high', description: 'BabyDoge staking', rewards: 'BABYDOGE', autoCompound: true },
            { id: 'bonk-staking', name: 'BONK Staking', token: 'BONK', icon: '🐕', apy: 28.0, minAmount: 1000000, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'high', description: 'Bonk staking on Solana', rewards: 'BONK', autoCompound: true },
            { id: 'wif-staking', name: 'WIF Staking', token: 'WIF', icon: '🎩', apy: 22.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'high', description: 'Dogwifhat staking', rewards: 'WIF', autoCompound: true },
            { id: 'pepe-staking', name: 'PEPE Staking', token: 'PEPE', icon: '🐸', apy: 32.0, minAmount: 10000000, minInvest: 10, lockPeriod: 0, tvl: 245000000, risk: 'high', description: 'Pepe token staking', rewards: 'PEPE', autoCompound: true },
            { id: 'shib-staking', name: 'SHIB Staking', token: 'SHIB', icon: '🐕', apy: 8.0, minAmount: 1000000, minInvest: 10, lockPeriod: 0, tvl: 385000000, risk: 'medium-high', description: 'Shiba Inu staking', rewards: 'SHIB', autoCompound: true },
            { id: 'doge-staking', name: 'DOGE Staking', token: 'DOGE', icon: '🐕', apy: 5.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Dogecoin staking', rewards: 'DOGE', autoCompound: true },
            { id: 'mog-staking', name: 'MOG Staking', token: 'MOG', icon: '😎', apy: 45.0, minAmount: 100000, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'high', description: 'Mog Coin staking', rewards: 'MOG', autoCompound: true },
            { id: 'brett-staking', name: 'BRETT Staking', token: 'BRETT', icon: '🔵', apy: 38.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'high', description: 'Brett on Base staking', rewards: 'BRETT', autoCompound: true },
            { id: 'popcat-staking', name: 'POPCAT Staking', token: 'POPCAT', icon: '🐱', apy: 42.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 42000000, risk: 'high', description: 'Popcat staking', rewards: 'POPCAT', autoCompound: true },
            { id: 'pendle-staking', name: 'PENDLE Staking', token: 'PENDLE', icon: '📈', apy: 15.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Pendle Finance staking', rewards: 'PENDLE', autoCompound: true },
            { id: 'velo-staking', name: 'VELO Staking', token: 'VELO', icon: '🔴', apy: 35.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Velodrome staking', rewards: 'VELO', autoCompound: true },
            { id: 'aero-staking', name: 'AERO Staking', token: 'AERO', icon: '✈️', apy: 42.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Aerodrome staking', rewards: 'AERO', autoCompound: true },
            { id: 'grail-staking', name: 'GRAIL Staking', token: 'GRAIL', icon: '🏆', apy: 28.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Camelot GRAIL staking', rewards: 'GRAIL', autoCompound: true },
            { id: 'thales-staking', name: 'THALES Staking', token: 'THALES', icon: '🎯', apy: 22.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'medium', description: 'Thales Protocol staking', rewards: 'THALES', autoCompound: true },
            { id: 'lyra-staking', name: 'LYRA Staking', token: 'LYRA', icon: '🎵', apy: 18.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium', description: 'Lyra options staking', rewards: 'LYRA', autoCompound: true },
            { id: 'kwenta-staking', name: 'KWENTA Staking', token: 'KWENTA', icon: '📊', apy: 25.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Kwenta staking', rewards: 'KWENTA', autoCompound: true },
            { id: 'vela-staking', name: 'VELA Staking', token: 'VELA', icon: '⛵', apy: 32.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 22000000, risk: 'medium-high', description: 'Vela Exchange staking', rewards: 'VELA', autoCompound: true },
            { id: 'mux-staking', name: 'MUX Staking', token: 'MUX', icon: '🔀', apy: 28.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 18000000, risk: 'medium', description: 'MUX Protocol staking', rewards: 'MUX', autoCompound: true },
            { id: 'hmx-staking', name: 'HMX Staking', token: 'HMX', icon: '💎', apy: 35.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 15000000, risk: 'medium-high', description: 'HMX staking', rewards: 'HMX', autoCompound: true },
            { id: 'level-staking', name: 'LVL Staking', token: 'LVL', icon: '📶', apy: 45.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 12000000, risk: 'medium-high', description: 'Level Finance staking', rewards: 'LVL', autoCompound: true },
            { id: 'vertex-staking', name: 'VRTX Staking', token: 'VRTX', icon: '🔺', apy: 22.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Vertex Protocol staking', rewards: 'VRTX', autoCompound: true },
            { id: 'drift-staking', name: 'DRIFT Staking', token: 'DRIFT', icon: '🌊', apy: 28.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Drift Protocol staking', rewards: 'DRIFT', autoCompound: true },
            { id: 'jupiter-staking', name: 'JUP Staking', token: 'JUP', icon: '🪐', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Jupiter staking', rewards: 'JUP', autoCompound: true },
            { id: 'raydium-staking', name: 'RAY Staking', token: 'RAY', icon: '☀️', apy: 18.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Raydium staking', rewards: 'RAY', autoCompound: true },
            { id: 'orca-staking', name: 'ORCA Staking', token: 'ORCA', icon: '🐋', apy: 15.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Orca staking', rewards: 'ORCA', autoCompound: true },
            { id: 'marinade-staking', name: 'MNDE Staking', token: 'MNDE', icon: '🥩', apy: 22.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Marinade staking', rewards: 'MNDE', autoCompound: true },
            { id: 'jito-staking', name: 'JTO Staking', token: 'JTO', icon: '⚡', apy: 8.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'low-medium', description: 'Jito staking', rewards: 'JTO', autoCompound: true },
            { id: 'tensor-staking', name: 'TNSR Staking', token: 'TNSR', icon: '🖼️', apy: 18.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Tensor NFT staking', rewards: 'TNSR', autoCompound: true },
            { id: 'kamino-staking', name: 'KMNO Staking', token: 'KMNO', icon: '🔷', apy: 25.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Kamino Finance staking', rewards: 'KMNO', autoCompound: true },
            { id: 'parcl-staking', name: 'PRCL Staking', token: 'PRCL', icon: '🏠', apy: 32.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'medium-high', description: 'Parcl real estate staking', rewards: 'PRCL', autoCompound: true },
            { id: 'sanctum-staking', name: 'CLOUD Staking', token: 'CLOUD', icon: '☁️', apy: 28.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Sanctum staking', rewards: 'CLOUD', autoCompound: true },
            { id: 'zeta-staking', name: 'ZEX Staking', token: 'ZEX', icon: 'Ζ', apy: 35.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'Zeta Markets staking', rewards: 'ZEX', autoCompound: true },
            { id: 'io-staking', name: 'IO Staking', token: 'IO', icon: '🖥️', apy: 22.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'io.net compute staking', rewards: 'IO', autoCompound: true },
            // === STAKING BATCH 11 - QUETTA EXPANSION ===
            // AI & GPU Tokens
            { id: 'tao-staking', name: 'TAO Staking', token: 'TAO', icon: '🧠', apy: 18.0, minAmount: 0.1, minInvest: 50, lockPeriod: 0, tvl: 285000000, risk: 'medium-high', description: 'Bittensor subnet staking', rewards: 'TAO', autoCompound: true },
            { id: 'fet-staking', name: 'FET Staking', token: 'FET', icon: '🤖', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Fetch.ai staking', rewards: 'FET', autoCompound: true },
            { id: 'agix-staking', name: 'AGIX Staking', token: 'AGIX', icon: '🧠', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'SingularityNET staking', rewards: 'AGIX', autoCompound: true },
            { id: 'ocean-staking', name: 'OCEAN Staking', token: 'OCEAN', icon: '🌊', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Ocean Protocol staking', rewards: 'OCEAN', autoCompound: true },
            { id: 'nos-staking', name: 'NOS Staking', token: 'NOS', icon: '☁️', apy: 25.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium-high', description: 'Nosana compute staking', rewards: 'NOS', autoCompound: true },
            { id: 'ath-staking', name: 'ATH Staking', token: 'ATH', icon: '🎮', apy: 28.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'high', description: 'Aethir GPU staking', rewards: 'ATH', autoCompound: true },
            { id: 'gpu-staking', name: 'GPU Staking', token: 'GPU', icon: '🖥️', apy: 35.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'high', description: 'NodeAI GPU staking', rewards: 'GPU', autoCompound: true },
            { id: 'wld-staking', name: 'WLD Staking', token: 'WLD', icon: '🌐', apy: 8.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Worldcoin staking', rewards: 'WLD', autoCompound: true },
            // Gaming & Metaverse Tokens
            { id: 'gala-staking', name: 'GALA Staking', token: 'GALA', icon: '🎮', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Gala Games staking', rewards: 'GALA', autoCompound: true },
            { id: 'imx-staking', name: 'IMX Staking', token: 'IMX', icon: '🎮', apy: 12.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Immutable X staking', rewards: 'IMX', autoCompound: true },
            { id: 'ronin-staking', name: 'RON Staking', token: 'RON', icon: '⚔️', apy: 14.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 225000000, risk: 'medium', description: 'Ronin Network staking', rewards: 'RON', autoCompound: true },
            { id: 'beam-staking', name: 'BEAM Staking', token: 'BEAM', icon: '🎮', apy: 18.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Beam gaming staking', rewards: 'BEAM', autoCompound: true },
            { id: 'prime-staking', name: 'PRIME Staking', token: 'PRIME', icon: '🎮', apy: 22.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 145000000, risk: 'medium-high', description: 'Echelon Prime staking', rewards: 'PRIME', autoCompound: true },
            { id: 'xai-staking', name: 'XAI Staking', token: 'XAI', icon: '🎮', apy: 25.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium-high', description: 'XAI gaming staking', rewards: 'XAI', autoCompound: true },
            { id: 'pixel-staking', name: 'PIXEL Staking', token: 'PIXEL', icon: '🎮', apy: 20.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'Pixels game staking', rewards: 'PIXEL', autoCompound: true },
            { id: 'portal-staking', name: 'PORTAL Staking', token: 'PORTAL', icon: '🌀', apy: 28.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 42000000, risk: 'high', description: 'Portal gaming staking', rewards: 'PORTAL', autoCompound: true },
            // DeFi Governance Tokens
            { id: 'crv-staking', name: 'CRV Staking', token: 'CRV', icon: '🔄', apy: 8.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 385000000, risk: 'medium', description: 'Curve veCRV staking', rewards: 'CRV+3CRV', autoCompound: false },
            { id: 'cvx-staking', name: 'CVX Staking', token: 'CVX', icon: '🔒', apy: 12.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Convex vlCVX staking', rewards: 'CVX+cvxCRV', autoCompound: true },
            { id: 'bal-staking', name: 'BAL Staking', token: 'BAL', icon: '⚖️', apy: 10.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Balancer veBAL staking', rewards: 'BAL+bb-a-USD', autoCompound: false },
            { id: 'aura-staking', name: 'AURA Staking', token: 'AURA', icon: '✨', apy: 15.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Aura Finance staking', rewards: 'AURA+auraBAL', autoCompound: true },
            { id: 'fxs-staking', name: 'FXS Staking', token: 'FXS', icon: 'F', apy: 10.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Frax veFXS staking', rewards: 'FXS+FRAX', autoCompound: false },
            { id: 'yfi-staking', name: 'YFI Staking', token: 'YFI', icon: '💙', apy: 8.0, minAmount: 0.01, minInvest: 100, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Yearn veYFI staking', rewards: 'YFI+dYFI', autoCompound: false },
            { id: 'comp-staking', name: 'COMP Staking', token: 'COMP', icon: '🏛️', apy: 5.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 165000000, risk: 'low-medium', description: 'Compound governance', rewards: 'COMP', autoCompound: true },
            { id: 'snx-staking', name: 'SNX Staking', token: 'SNX', icon: '🔷', apy: 18.0, minAmount: 50, minInvest: 10, lockPeriod: 7, tvl: 225000000, risk: 'medium', description: 'Synthetix staking', rewards: 'SNX+sUSD', autoCompound: false },
            { id: 'rpl-staking', name: 'RPL Staking', token: 'RPL', icon: '🚀', apy: 7.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Rocket Pool staking', rewards: 'RPL', autoCompound: true },
            // Infrastructure Tokens
            { id: 'qnt-staking', name: 'QNT Staking', token: 'QNT', icon: '🔗', apy: 5.0, minAmount: 1, minInvest: 100, lockPeriod: 0, tvl: 145000000, risk: 'low-medium', description: 'Quant gateway staking', rewards: 'QNT', autoCompound: true },
            { id: 'api3-staking', name: 'API3 Staking', token: 'API3', icon: '📡', apy: 12.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'API3 DAO staking', rewards: 'API3', autoCompound: true },
            { id: 'flr-staking', name: 'FLR Staking', token: 'FLR', icon: '⚡', apy: 10.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Flare delegation', rewards: 'FLR', autoCompound: true },
            { id: 'sgb-staking', name: 'SGB Staking', token: 'SGB', icon: '🐦', apy: 8.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Songbird delegation', rewards: 'SGB', autoCompound: true },
            { id: 'hnt-staking', name: 'HNT Staking', token: 'HNT', icon: '📡', apy: 6.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Helium staking', rewards: 'HNT', autoCompound: true },
            { id: 'mobile-staking', name: 'MOBILE Staking', token: 'MOBILE', icon: '📱', apy: 15.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium-high', description: 'Helium Mobile staking', rewards: 'MOBILE', autoCompound: true },
            { id: 'iotx-staking', name: 'IOTX Staking', token: 'IOTX', icon: '🔌', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'IoTeX staking', rewards: 'IOTX', autoCompound: true },
            // === STAKING BATCH 12 - BRONTO EXPANSION ===
            // Privacy & Security Tokens
            { id: 'zec-staking', name: 'ZEC Staking', token: 'ZEC', icon: '🔒', apy: 4.0, minAmount: 0.1, minInvest: 50, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Zcash shielded staking', rewards: 'ZEC', autoCompound: true },
            { id: 'dash-staking', name: 'DASH Staking', token: 'DASH', icon: '💨', apy: 6.0, minAmount: 0.1, minInvest: 50, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Dash masternode rewards', rewards: 'DASH', autoCompound: true },
            { id: 'scrt-staking', name: 'SCRT Staking', token: 'SCRT', icon: '🤫', apy: 22.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium-high', description: 'Secret Network privacy', rewards: 'SCRT', autoCompound: true },
            { id: 'rose-staking', name: 'ROSE Staking', token: 'ROSE', icon: '🌹', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Oasis Network staking', rewards: 'ROSE', autoCompound: true },
            { id: 'keep-staking', name: 'KEEP Staking', token: 'KEEP', icon: '🔐', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 25000000, risk: 'medium-high', description: 'Keep Network staking', rewards: 'KEEP', autoCompound: true },
            // Cross-Chain & Bridge Tokens
            { id: 'rune-staking', name: 'RUNE Staking', token: 'RUNE', icon: '⚡', apy: 8.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'THORChain LP staking', rewards: 'RUNE', autoCompound: true },
            { id: 'axl-staking', name: 'AXL Staking', token: 'AXL', icon: '🌐', apy: 12.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Axelar cross-chain staking', rewards: 'AXL', autoCompound: true },
            { id: 'syn-staking', name: 'SYN Staking', token: 'SYN', icon: '🔗', apy: 15.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'Synapse bridge staking', rewards: 'SYN', autoCompound: true },
            { id: 'stg-staking', name: 'STG Staking', token: 'STG', icon: '⭐', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Stargate veSTG staking', rewards: 'STG', autoCompound: false },
            { id: 'w-staking', name: 'W Staking', token: 'W', icon: '🪱', apy: 8.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Wormhole staking', rewards: 'W', autoCompound: true },
            { id: 'across-staking', name: 'ACROSS Staking', token: 'ACROSS', icon: '🌉', apy: 18.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'medium-high', description: 'Across Protocol staking', rewards: 'ACROSS+ACX', autoCompound: true },
            // Storage & Compute Tokens
            { id: 'fil-staking', name: 'FIL Staking', token: 'FIL', icon: '📁', apy: 8.0, minAmount: 1, minInvest: 20, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Filecoin storage staking', rewards: 'FIL', autoCompound: true },
            { id: 'ar-staking', name: 'AR Staking', token: 'AR', icon: '📦', apy: 5.0, minAmount: 1, minInvest: 30, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Arweave permanent storage', rewards: 'AR', autoCompound: true },
            { id: 'storj-staking', name: 'STORJ Staking', token: 'STORJ', icon: '☁️', apy: 12.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Storj storage staking', rewards: 'STORJ', autoCompound: true },
            { id: 'sc-staking', name: 'SC Staking', token: 'SC', icon: '💾', apy: 6.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Siacoin storage', rewards: 'SC', autoCompound: true },
            { id: 'theta-staking', name: 'THETA Staking', token: 'THETA', icon: '📺', apy: 5.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Theta Network staking', rewards: 'THETA+TFUEL', autoCompound: false },
            { id: 'tfuel-staking', name: 'TFUEL Staking', token: 'TFUEL', icon: '⛽', apy: 8.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Theta Fuel staking', rewards: 'TFUEL', autoCompound: true },
            // Move-Based & New L1 Tokens
            { id: 'apt-staking', name: 'APT Staking', token: 'APT', icon: '🔷', apy: 7.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Aptos staking', rewards: 'APT', autoCompound: true },
            { id: 'sui-staking', name: 'SUI Staking', token: 'SUI', icon: '💧', apy: 4.5, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 345000000, risk: 'medium', description: 'Sui Network staking', rewards: 'SUI', autoCompound: true },
            { id: 'sei-staking', name: 'SEI Staking', token: 'SEI', icon: '🌊', apy: 6.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Sei Network staking', rewards: 'SEI', autoCompound: true },
            { id: 'cetus-staking', name: 'CETUS Staking', token: 'CETUS', icon: '🐋', apy: 25.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'Cetus DEX staking', rewards: 'CETUS', autoCompound: true },
            { id: 'navi-staking', name: 'NAVI Staking', token: 'NAVI', icon: '🧭', apy: 22.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'medium-high', description: 'NAVI Protocol staking', rewards: 'NAVI', autoCompound: true },
            // New DeFi & Real Yield
            { id: 'morpho-staking', name: 'MORPHO Staking', token: 'MORPHO', icon: '🦋', apy: 15.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Morpho lending optimizer', rewards: 'MORPHO', autoCompound: true },
            { id: 'ethfi-staking', name: 'ETHFI Staking', token: 'ETHFI', icon: '⟠', apy: 18.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'ether.fi liquid restaking', rewards: 'ETHFI', autoCompound: true },
            { id: 'puffer-staking', name: 'PUFFER Staking', token: 'PUFFER', icon: '🐡', apy: 20.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'medium-high', description: 'Puffer Finance LRT', rewards: 'PUFFER', autoCompound: true },
            { id: 'renzo-staking', name: 'REZ Staking', token: 'REZ', icon: '🔄', apy: 22.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'medium-high', description: 'Renzo restaking', rewards: 'REZ', autoCompound: true },
            { id: 'kelp-staking', name: 'KELP Staking', token: 'rsETH', icon: '🌿', apy: 8.0, minAmount: 0.01, minInvest: 50, lockPeriod: 0, tvl: 145000000, risk: 'low-medium', description: 'Kelp DAO restaking', rewards: 'rsETH', autoCompound: true },
            { id: 'blast-staking', name: 'BLAST Staking', token: 'BLAST', icon: '💥', apy: 25.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'medium-high', description: 'Blast L2 staking', rewards: 'BLAST', autoCompound: true },
            // Exchange & Utility Tokens
            { id: 'bnb-staking', name: 'BNB Staking', token: 'BNB', icon: '💛', apy: 3.0, minAmount: 0.1, minInvest: 50, lockPeriod: 0, tvl: 485000000, risk: 'low-medium', description: 'BNB Chain staking', rewards: 'BNB', autoCompound: true },
            { id: 'okb-staking', name: 'OKB Staking', token: 'OKB', icon: '🔵', apy: 5.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'OKX staking', rewards: 'OKB', autoCompound: true },
            { id: 'gt-staking', name: 'GT Staking', token: 'GT', icon: '🟢', apy: 8.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Gate.io token staking', rewards: 'GT', autoCompound: true },
            { id: 'mx-staking', name: 'MX Staking', token: 'MX', icon: '🟣', apy: 10.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'MEXC token staking', rewards: 'MX', autoCompound: true },
            { id: 'ht-staking', name: 'HT Staking', token: 'HT', icon: '🔴', apy: 6.0, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Huobi Token staking', rewards: 'HT', autoCompound: true },

            // === STAKING BATCH 13 - GIGA EXPANSION ===
            // DePIN & IoT Tokens
            { id: 'dimo-staking', name: 'DIMO Staking', token: 'DIMO', icon: '🚗', apy: 18.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 45000000, risk: 'medium-high', description: 'DIMO vehicle data network', rewards: 'DIMO', autoCompound: true },
            { id: 'hivemapper-staking', name: 'HONEY Staking', token: 'HONEY', icon: '🗺️', apy: 22.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 28000000, risk: 'high', description: 'Hivemapper mapping rewards', rewards: 'HONEY', autoCompound: true },
            { id: 'render-staking', name: 'RENDER Staking', token: 'RENDER', icon: '🎨', apy: 8.5, minAmount: 5, minInvest: 50, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Render network GPU staking', rewards: 'RENDER', autoCompound: true },
            { id: 'grass-staking', name: 'GRASS Staking', token: 'GRASS', icon: '🌱', apy: 35.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'high', description: 'Grass bandwidth network', rewards: 'GRASS', autoCompound: true },
            { id: 'geodnet-staking', name: 'GEOD Staking', token: 'GEOD', icon: '🛰️', apy: 25.0, minAmount: 50, minInvest: 15, lockPeriod: 0, tvl: 18000000, risk: 'high', description: 'GEODNET location network', rewards: 'GEOD', autoCompound: true },

            // RWA & Tokenization Tokens
            { id: 'maple-staking', name: 'MPL Staking', token: 'MPL', icon: '🍁', apy: 12.0, minAmount: 5, minInvest: 50, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Maple Finance lending', rewards: 'MPL', autoCompound: true },
            { id: 'centrifuge-staking', name: 'CFG Staking', token: 'CFG', icon: '🌀', apy: 10.0, minAmount: 50, minInvest: 25, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'Centrifuge RWA protocol', rewards: 'CFG', autoCompound: true },
            { id: 'goldfinch-staking', name: 'GFI Staking', token: 'GFI', icon: '🐦', apy: 15.0, minAmount: 10, minInvest: 30, lockPeriod: 0, tvl: 42000000, risk: 'medium-high', description: 'Goldfinch credit protocol', rewards: 'GFI', autoCompound: true },
            { id: 'polymesh-staking', name: 'POLYX Staking', token: 'POLYX', icon: '🔷', apy: 8.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Polymesh security tokens', rewards: 'POLYX', autoCompound: true },
            { id: 'realio-staking', name: 'RIO Staking', token: 'RIO', icon: '🏢', apy: 14.0, minAmount: 25, minInvest: 25, lockPeriod: 0, tvl: 22000000, risk: 'medium-high', description: 'Realio asset tokenization', rewards: 'RIO', autoCompound: true },

            // Social & Creator Tokens
            { id: 'friend-staking', name: 'FRIEND Staking', token: 'FRIEND', icon: '👥', apy: 45.0, minAmount: 10, minInvest: 10, lockPeriod: 0, tvl: 35000000, risk: 'high', description: 'Friend.tech social staking', rewards: 'FRIEND', autoCompound: true },
            { id: 'lens-staking', name: 'LENS Staking', token: 'LENS', icon: '🔍', apy: 15.0, minAmount: 25, minInvest: 25, lockPeriod: 0, tvl: 85000000, risk: 'medium-high', description: 'Lens Protocol social', rewards: 'LENS', autoCompound: true },
            { id: 'deso-staking', name: 'DESO Staking', token: 'DESO', icon: '📱', apy: 8.0, minAmount: 5, minInvest: 30, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'DeSo blockchain social', rewards: 'DESO', autoCompound: true },
            { id: 'rally-staking', name: 'RLY Staking', token: 'RLY', icon: '🎭', apy: 12.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'Rally creator coins', rewards: 'RLY', autoCompound: true },
            { id: 'galxe-staking', name: 'GAL Staking', token: 'GAL', icon: '🌌', apy: 10.0, minAmount: 20, minInvest: 25, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Galxe credential network', rewards: 'GAL', autoCompound: true },

            // Prediction & Information Markets
            { id: 'polymarket-staking', name: 'POLY Staking', token: 'POLY', icon: '🎲', apy: 18.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 95000000, risk: 'medium-high', description: 'Polymarket prediction', rewards: 'POLY', autoCompound: true },
            { id: 'gnosis-staking', name: 'GNO Staking', token: 'GNO', icon: '🦉', apy: 5.0, minAmount: 0.5, minInvest: 100, lockPeriod: 0, tvl: 285000000, risk: 'low-medium', description: 'Gnosis Chain validation', rewards: 'GNO', autoCompound: true },
            { id: 'augur-staking', name: 'REP Staking', token: 'REP', icon: '🔮', apy: 7.0, minAmount: 5, minInvest: 40, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Augur reporting rewards', rewards: 'REP', autoCompound: true },
            { id: 'uma-staking', name: 'UMA Staking', token: 'UMA', icon: '🔔', apy: 15.0, minAmount: 10, minInvest: 30, lockPeriod: 0, tvl: 75000000, risk: 'medium', description: 'UMA oracle voting', rewards: 'UMA', autoCompound: true },
            { id: 'tellor-staking', name: 'TRB Staking', token: 'TRB', icon: '📊', apy: 12.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Tellor oracle staking', rewards: 'TRB', autoCompound: true },

            // MEV & Infrastructure Tokens
            { id: 'cow-staking', name: 'COW Staking', token: 'COW', icon: '🐄', apy: 8.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 55000000, risk: 'medium', description: 'CoW Protocol MEV protection', rewards: 'COW', autoCompound: true },
            { id: 'flashbots-staking', name: 'FLB Staking', token: 'FLB', icon: '⚡', apy: 20.0, minAmount: 25, minInvest: 30, lockPeriod: 0, tvl: 42000000, risk: 'medium-high', description: 'Flashbots MEV distribution', rewards: 'FLB', autoCompound: true },
            { id: 'blocknative-staking', name: 'BLK Staking', token: 'BLK', icon: '🧱', apy: 15.0, minAmount: 50, minInvest: 25, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'Blocknative mempool', rewards: 'BLK', autoCompound: true },
            { id: 'eden-staking', name: 'EDEN Staking', token: 'EDEN', icon: '🌳', apy: 12.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 18000000, risk: 'medium', description: 'Eden Network priority', rewards: 'EDEN', autoCompound: true },

            // Cosmos Ecosystem Tokens
            { id: 'dydx-staking', name: 'DYDX Staking', token: 'DYDX', icon: '📈', apy: 12.0, minAmount: 10, minInvest: 50, lockPeriod: 0, tvl: 425000000, risk: 'medium', description: 'dYdX chain validation', rewards: 'DYDX', autoCompound: true },
            { id: 'stride-staking', name: 'STRD Staking', token: 'STRD', icon: '🏃', apy: 18.0, minAmount: 25, minInvest: 25, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Stride liquid staking', rewards: 'STRD', autoCompound: true },
            { id: 'neutron-staking', name: 'NTRN Staking', token: 'NTRN', icon: '⚛️', apy: 15.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Neutron smart contracts', rewards: 'NTRN', autoCompound: true },
            { id: 'akash-staking', name: 'AKT Staking', token: 'AKT', icon: '☁️', apy: 20.0, minAmount: 25, minInvest: 25, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Akash cloud compute', rewards: 'AKT', autoCompound: true },
            { id: 'kujira-staking', name: 'KUJI Staking', token: 'KUJI', icon: '🐋', apy: 14.0, minAmount: 10, minInvest: 30, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Kujira DeFi hub', rewards: 'KUJI', autoCompound: true },
            { id: 'mars-staking', name: 'MARS Staking', token: 'MARS', icon: '🔴', apy: 22.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 42000000, risk: 'medium-high', description: 'Mars Protocol lending', rewards: 'MARS', autoCompound: true },

            // Ordinals & Bitcoin Layer2
            { id: 'stx-v2-staking', name: 'STX PoX', token: 'STX', icon: '📦', apy: 10.0, minAmount: 50, minInvest: 50, lockPeriod: 14, tvl: 285000000, risk: 'medium', description: 'Stacks proof of transfer', rewards: 'BTC', autoCompound: false },
            { id: 'runes-staking', name: 'RUNES Staking', token: 'RUNES', icon: '🪨', apy: 35.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'high', description: 'Bitcoin Runes staking', rewards: 'RUNES', autoCompound: true },
            { id: 'brc20-staking', name: 'ORDI Staking', token: 'ORDI', icon: '🟡', apy: 15.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 125000000, risk: 'high', description: 'BRC-20 ORDI staking', rewards: 'ORDI', autoCompound: true },
            { id: 'sats-staking', name: 'SATS Staking', token: 'SATS', icon: '⚡', apy: 25.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 85000000, risk: 'high', description: 'BRC-20 1000SATS staking', rewards: 'SATS', autoCompound: true },
            { id: 'alex-staking', name: 'ALEX Staking', token: 'ALEX', icon: '🔶', apy: 18.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'ALEX Bitcoin DeFi', rewards: 'ALEX', autoCompound: true },

            // === STAKING BATCH 14 - TERA EXPANSION ===
            // Liquid Restaking Tokens
            { id: 'ezeth-staking', name: 'ezETH Staking', token: 'ezETH', icon: '🔄', apy: 8.0, minAmount: 0.01, minInvest: 50, lockPeriod: 0, tvl: 485000000, risk: 'low-medium', description: 'Renzo liquid restaking', rewards: 'ezETH', autoCompound: true },
            { id: 'rseth-staking', name: 'rsETH Staking', token: 'rsETH', icon: '♻️', apy: 7.5, minAmount: 0.01, minInvest: 50, lockPeriod: 0, tvl: 325000000, risk: 'low-medium', description: 'KelpDAO liquid restaking', rewards: 'rsETH', autoCompound: true },
            { id: 'weeth-staking', name: 'weETH Staking', token: 'weETH', icon: '🔥', apy: 7.0, minAmount: 0.01, minInvest: 50, lockPeriod: 0, tvl: 685000000, risk: 'low-medium', description: 'ether.fi wrapped staked ETH', rewards: 'weETH', autoCompound: true },
            { id: 'pufeth-staking', name: 'pufETH Staking', token: 'pufETH', icon: '🐡', apy: 8.5, minAmount: 0.01, minInvest: 50, lockPeriod: 0, tvl: 225000000, risk: 'low-medium', description: 'Puffer liquid restaking', rewards: 'pufETH', autoCompound: true },
            { id: 'sweth-staking', name: 'swETH Staking', token: 'swETH', icon: '🌊', apy: 6.5, minAmount: 0.01, minInvest: 50, lockPeriod: 0, tvl: 185000000, risk: 'low-medium', description: 'Swell liquid staking', rewards: 'swETH', autoCompound: true },

            // Perpetual DEX Governance
            { id: 'hyperliquid-staking', name: 'HYPE Staking', token: 'HYPE', icon: '💎', apy: 25.0, minAmount: 10, minInvest: 50, lockPeriod: 0, tvl: 385000000, risk: 'medium-high', description: 'Hyperliquid governance', rewards: 'HYPE', autoCompound: true },
            { id: 'vertex-staking', name: 'VRTX Staking', token: 'VRTX', icon: '📐', apy: 22.0, minAmount: 50, minInvest: 25, lockPeriod: 0, tvl: 95000000, risk: 'medium-high', description: 'Vertex Protocol staking', rewards: 'VRTX', autoCompound: true },
            { id: 'apex-staking', name: 'APEX Staking', token: 'APEX', icon: '🔺', apy: 18.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 65000000, risk: 'medium-high', description: 'ApeX Protocol staking', rewards: 'APEX', autoCompound: true },
            { id: 'rabbitx-staking', name: 'RBX Staking', token: 'RBX', icon: '🐰', apy: 28.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 42000000, risk: 'high', description: 'RabbitX Protocol staking', rewards: 'RBX', autoCompound: true },
            { id: 'bluefin-staking', name: 'BLUE Staking', token: 'BLUE', icon: '🐋', apy: 20.0, minAmount: 50, minInvest: 25, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'Bluefin Exchange staking', rewards: 'BLUE', autoCompound: true },

            // ZK & Privacy L2s
            { id: 'linea-staking', name: 'LINEA Staking', token: 'LINEA', icon: '📏', apy: 15.0, minAmount: 50, minInvest: 25, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Linea L2 staking', rewards: 'LINEA', autoCompound: true },
            { id: 'scroll-staking', name: 'SCROLL Staking', token: 'SCROLL', icon: '📜', apy: 18.0, minAmount: 50, minInvest: 25, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Scroll zkEVM staking', rewards: 'SCROLL', autoCompound: true },
            { id: 'taiko-staking', name: 'TAIKO Staking', token: 'TAIKO', icon: '🥁', apy: 22.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 85000000, risk: 'medium-high', description: 'Taiko L2 staking', rewards: 'TAIKO', autoCompound: true },
            { id: 'manta-staking', name: 'MANTA Staking', token: 'MANTA', icon: '🦈', apy: 16.0, minAmount: 25, minInvest: 25, lockPeriod: 0, tvl: 165000000, risk: 'medium', description: 'Manta Network staking', rewards: 'MANTA', autoCompound: true },
            { id: 'mode-staking', name: 'MODE Staking', token: 'MODE', icon: '🎵', apy: 25.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 75000000, risk: 'medium-high', description: 'Mode Network staking', rewards: 'MODE', autoCompound: true },

            // Solana Ecosystem New
            { id: 'pyth-v2-staking', name: 'PYTH V2 Staking', token: 'PYTH', icon: '🐍', apy: 12.0, minAmount: 100, minInvest: 25, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Pyth Network oracle', rewards: 'PYTH', autoCompound: true },
            { id: 'wormhole-staking', name: 'W Staking', token: 'W', icon: '🕳️', apy: 15.0, minAmount: 50, minInvest: 25, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Wormhole bridge staking', rewards: 'W', autoCompound: true },
            { id: 'tensor-staking', name: 'TNSR Staking', token: 'TNSR', icon: '🎨', apy: 18.0, minAmount: 25, minInvest: 20, lockPeriod: 0, tvl: 95000000, risk: 'medium-high', description: 'Tensor NFT marketplace', rewards: 'TNSR', autoCompound: true },
            { id: 'kamino-staking', name: 'KMNO Staking', token: 'KMNO', icon: '🎯', apy: 22.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'medium-high', description: 'Kamino Finance staking', rewards: 'KMNO', autoCompound: true },
            { id: 'parcl-staking', name: 'PRCL Staking', token: 'PRCL', icon: '🏘️', apy: 28.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 55000000, risk: 'high', description: 'Parcl real estate perps', rewards: 'PRCL', autoCompound: true },

            // Appchain & Modular
            { id: 'dymension-staking', name: 'DYM Staking', token: 'DYM', icon: '🎡', apy: 20.0, minAmount: 25, minInvest: 25, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Dymension rollapp hub', rewards: 'DYM', autoCompound: true },
            { id: 'saga-staking', name: 'SAGA Staking', token: 'SAGA', icon: '📖', apy: 18.0, minAmount: 50, minInvest: 25, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Saga chainlet protocol', rewards: 'SAGA', autoCompound: true },
            { id: 'altlayer-staking', name: 'ALT Staking', token: 'ALT', icon: '🔧', apy: 22.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'medium-high', description: 'AltLayer rollups', rewards: 'ALT', autoCompound: true },
            { id: 'avail-staking', name: 'AVAIL Staking', token: 'AVAIL', icon: '📊', apy: 25.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 95000000, risk: 'medium-high', description: 'Avail DA layer', rewards: 'AVAIL', autoCompound: true },
            { id: 'omni-staking', name: 'OMNI Staking', token: 'OMNI', icon: '🌀', apy: 20.0, minAmount: 25, minInvest: 25, lockPeriod: 0, tvl: 75000000, risk: 'medium', description: 'Omni Network interop', rewards: 'OMNI', autoCompound: true },

            // Intent & Chain Abstraction
            { id: 'particle-staking', name: 'PARTI Staking', token: 'PARTI', icon: '⚛️', apy: 30.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 65000000, risk: 'high', description: 'Particle chain abstraction', rewards: 'PARTI', autoCompound: true },
            { id: 'socket-staking', name: 'SOCKET Staking', token: 'SOCKET', icon: '🔌', apy: 25.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'Socket interoperability', rewards: 'SOCKET', autoCompound: true },
            { id: 'lifi-staking', name: 'LIFI Staking', token: 'LIFI', icon: '🌉', apy: 22.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 45000000, risk: 'medium-high', description: 'LI.FI bridge aggregator', rewards: 'LIFI', autoCompound: true },
            { id: 'jumper-staking', name: 'JUMP Staking', token: 'JUMP', icon: '🦘', apy: 28.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 35000000, risk: 'high', description: 'Jumper Exchange staking', rewards: 'JUMP', autoCompound: true },

            // AI Agents & Automation
            { id: 'virtuals-staking', name: 'VIRTUAL Staking', token: 'VIRTUAL', icon: '🤖', apy: 45.0, minAmount: 50, minInvest: 15, lockPeriod: 0, tvl: 185000000, risk: 'high', description: 'Virtuals AI agents', rewards: 'VIRTUAL', autoCompound: true },
            { id: 'ai16z-staking', name: 'AI16Z Staking', token: 'AI16Z', icon: '🧠', apy: 55.0, minAmount: 25, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'high', description: 'AI16Z DAO staking', rewards: 'AI16Z', autoCompound: true },
            { id: 'griffain-staking', name: 'GRIFF Staking', token: 'GRIFF', icon: '🦅', apy: 50.0, minAmount: 50, minInvest: 10, lockPeriod: 0, tvl: 65000000, risk: 'high', description: 'Griffain AI agents', rewards: 'GRIFF', autoCompound: true },
            { id: 'zerebro-staking', name: 'ZEREBRO Staking', token: 'ZEREBRO', icon: '🧬', apy: 48.0, minAmount: 100, minInvest: 10, lockPeriod: 0, tvl: 45000000, risk: 'high', description: 'Zerebro AI staking', rewards: 'ZEREBRO', autoCompound: true },
            { id: 'arc-staking', name: 'ARC Staking', token: 'ARC', icon: '⚡', apy: 42.0, minAmount: 50, minInvest: 15, lockPeriod: 0, tvl: 55000000, risk: 'high', description: 'Arc AI framework', rewards: 'ARC', autoCompound: true },

            // === STAKING BATCH 15 - PETA EXPANSION ===
            // Consumer Apps & Move-to-Earn
            { id: 'gmt-staking', name: 'GMT Staking', token: 'GMT', icon: '👟', apy: 12.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'STEPN governance token', rewards: 'GMT', autoCompound: true },
            { id: 'sweat-staking', name: 'SWEAT Staking', token: 'SWEAT', icon: '💧', apy: 15.0, minAmount: 500, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Sweat Economy staking', rewards: 'SWEAT', autoCompound: true },
            { id: 'axs-staking', name: 'AXS Staking', token: 'AXS', icon: '⚔️', apy: 35.0, minAmount: 5, minInvest: 25, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'Axie Infinity governance', rewards: 'AXS', autoCompound: true },
            { id: 'mana-staking', name: 'MANA Staking', token: 'MANA', icon: '🌐', apy: 8.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 225000000, risk: 'medium', description: 'Decentraland governance', rewards: 'MANA', autoCompound: true },
            { id: 'sand-staking', name: 'SAND Staking', token: 'SAND', icon: '🏖️', apy: 10.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 195000000, risk: 'medium', description: 'The Sandbox staking', rewards: 'SAND', autoCompound: true },

            // NFT Infrastructure
            { id: 'blur-staking', name: 'BLUR Staking', token: 'BLUR', icon: '🟠', apy: 18.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 325000000, risk: 'medium-high', description: 'Blur NFT marketplace', rewards: 'BLUR', autoCompound: true },
            { id: 'sudo-staking', name: 'SUDO Staking', token: 'SUDO', icon: '🔄', apy: 22.0, minAmount: 10, minInvest: 30, lockPeriod: 0, tvl: 85000000, risk: 'medium-high', description: 'Sudoswap AMM', rewards: 'SUDO', autoCompound: true },
            { id: 'looks-staking', name: 'LOOKS Staking', token: 'LOOKS', icon: '👀', apy: 25.0, minAmount: 100, minInvest: 15, lockPeriod: 0, tvl: 65000000, risk: 'medium-high', description: 'LooksRare staking', rewards: 'LOOKS', autoCompound: true },
            { id: 'magic-staking', name: 'MAGIC Staking', token: 'MAGIC', icon: '✨', apy: 28.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium-high', description: 'Treasure DAO staking', rewards: 'MAGIC', autoCompound: true },

            // Music & Entertainment
            { id: 'audio-staking', name: 'AUDIO Staking', token: 'AUDIO', icon: '🎵', apy: 14.0, minAmount: 200, minInvest: 15, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Audius music platform', rewards: 'AUDIO', autoCompound: true },
            { id: 'xcad-staking', name: 'XCAD Staking', token: 'XCAD', icon: '📺', apy: 20.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'XCAD creator economy', rewards: 'XCAD', autoCompound: true },
            { id: 'vra-staking', name: 'VRA Staking', token: 'VRA', icon: '🎬', apy: 18.0, minAmount: 1000, minInvest: 15, lockPeriod: 0, tvl: 75000000, risk: 'medium', description: 'Verasity video platform', rewards: 'VRA', autoCompound: true },

            // Sports Fan Tokens
            { id: 'chz-staking', name: 'CHZ Staking', token: 'CHZ', icon: '⚽', apy: 12.0, minAmount: 500, minInvest: 20, lockPeriod: 0, tvl: 385000000, risk: 'medium', description: 'Chiliz sports platform', rewards: 'CHZ', autoCompound: true },
            { id: 'santos-staking', name: 'SANTOS Staking', token: 'SANTOS', icon: '🇧🇷', apy: 8.0, minAmount: 10, minInvest: 25, lockPeriod: 0, tvl: 35000000, risk: 'medium', description: 'Santos FC fan token', rewards: 'SANTOS', autoCompound: true },
            { id: 'bar-staking', name: 'BAR Staking', token: 'BAR', icon: '🔵🔴', apy: 6.0, minAmount: 5, minInvest: 30, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'FC Barcelona fan token', rewards: 'BAR', autoCompound: true },
            { id: 'psg-staking', name: 'PSG Staking', token: 'PSG', icon: '🔵', apy: 5.5, minAmount: 5, minInvest: 30, lockPeriod: 0, tvl: 42000000, risk: 'medium', description: 'Paris Saint-Germain token', rewards: 'PSG', autoCompound: true },
            { id: 'juv-staking', name: 'JUV Staking', token: 'JUV', icon: '⚫⚪', apy: 5.0, minAmount: 5, minInvest: 30, lockPeriod: 0, tvl: 38000000, risk: 'medium', description: 'Juventus fan token', rewards: 'JUV', autoCompound: true },

            // Gaming Infrastructure
            { id: 'beam-staking', name: 'BEAM Staking', token: 'BEAM', icon: '🎮', apy: 35.0, minAmount: 200, minInvest: 15, lockPeriod: 0, tvl: 165000000, risk: 'medium-high', description: 'Merit Circle gaming', rewards: 'BEAM', autoCompound: true },
            { id: 'ilv-staking', name: 'ILV Staking', token: 'ILV', icon: '🎯', apy: 25.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 125000000, risk: 'medium-high', description: 'Illuvium gaming', rewards: 'ILV', autoCompound: true },
            { id: 'gods-staking', name: 'GODS Staking', token: 'GODS', icon: '⚡', apy: 22.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 45000000, risk: 'medium-high', description: 'Gods Unchained staking', rewards: 'GODS', autoCompound: true },
            { id: 'ygg-staking', name: 'YGG Staking', token: 'YGG', icon: '🏴‍☠️', apy: 18.0, minAmount: 50, minInvest: 25, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Yield Guild Gaming', rewards: 'YGG', autoCompound: true },
            { id: 'mc-staking', name: 'MC Staking', token: 'MC', icon: '⭐', apy: 20.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 85000000, risk: 'medium-high', description: 'Merit Circle staking', rewards: 'MC', autoCompound: true },

            // Base Ecosystem
            { id: 'aero-staking', name: 'AERO Staking', token: 'AERO', icon: '✈️', apy: 32.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 425000000, risk: 'medium', description: 'Aerodrome Finance', rewards: 'AERO', autoCompound: true },
            { id: 'extra-staking', name: 'EXTRA Staking', token: 'EXTRA', icon: '🌟', apy: 45.0, minAmount: 200, minInvest: 15, lockPeriod: 0, tvl: 85000000, risk: 'medium-high', description: 'Extra Finance Base', rewards: 'EXTRA', autoCompound: true },
            { id: 'brett-staking', name: 'BRETT Staking', token: 'BRETT', icon: '🐸', apy: 55.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 265000000, risk: 'high', description: 'Brett Base meme', rewards: 'BRETT', autoCompound: true },
            { id: 'degen-staking', name: 'DEGEN Staking', token: 'DEGEN', icon: '🎰', apy: 65.0, minAmount: 5000, minInvest: 10, lockPeriod: 0, tvl: 145000000, risk: 'high', description: 'Degen Farcaster token', rewards: 'DEGEN', autoCompound: true },
            { id: 'toshi-staking', name: 'TOSHI Staking', token: 'TOSHI', icon: '🐱', apy: 48.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'high', description: 'Toshi Base cat meme', rewards: 'TOSHI', autoCompound: true },

            // New Solana Memes
            { id: 'popcat-staking', name: 'POPCAT Staking', token: 'POPCAT', icon: '😺', apy: 75.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 225000000, risk: 'high', description: 'Popcat Solana meme', rewards: 'POPCAT', autoCompound: true },
            { id: 'mew-staking', name: 'MEW Staking', token: 'MEW', icon: '🐈', apy: 85.0, minAmount: 50000, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'high', description: 'Cat in a dogs world', rewards: 'MEW', autoCompound: true },
            { id: 'wen-staking', name: 'WEN Staking', token: 'WEN', icon: '🔜', apy: 70.0, minAmount: 100000, minInvest: 5, lockPeriod: 0, tvl: 125000000, risk: 'high', description: 'Wen Solana meme', rewards: 'WEN', autoCompound: true },
            { id: 'bome-staking', name: 'BOME Staking', token: 'BOME', icon: '📖', apy: 80.0, minAmount: 50000, minInvest: 10, lockPeriod: 0, tvl: 285000000, risk: 'high', description: 'Book of Meme', rewards: 'BOME', autoCompound: true },
            { id: 'slerf-staking', name: 'SLERF Staking', token: 'SLERF', icon: '🦥', apy: 90.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 95000000, risk: 'high', description: 'Slerf sloth meme', rewards: 'SLERF', autoCompound: true },

            // === STAKING BATCH 16 - EXA EXPANSION ===
            // Real Yield DEX Tokens
            { id: 'gmx-staking', name: 'GMX Staking', token: 'GMX', icon: '📈', apy: 15.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'GMX real yield', rewards: 'esGMX + ETH', autoCompound: true },
            { id: 'gns-staking', name: 'GNS Staking', token: 'GNS', icon: '📊', apy: 18.0, minAmount: 10, minInvest: 30, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'gTrade staking', rewards: 'DAI', autoCompound: true },
            { id: 'velo-staking', name: 'VELO Staking', token: 'VELO', icon: '🔴', apy: 45.0, minAmount: 500, minInvest: 20, lockPeriod: 0, tvl: 265000000, risk: 'medium', description: 'Velodrome veVELO', rewards: 'VELO', autoCompound: true },
            { id: 'thena-staking', name: 'THE Staking', token: 'THE', icon: '🟣', apy: 55.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'medium-high', description: 'Thena veTHE', rewards: 'THE', autoCompound: true },
            { id: 'camelot-staking', name: 'GRAIL Staking', token: 'GRAIL', icon: '🏆', apy: 25.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Camelot xGRAIL', rewards: 'GRAIL', autoCompound: true },

            // Telegram Bot Tokens
            { id: 'unibot-staking', name: 'UNIBOT Staking', token: 'UNIBOT', icon: '🤖', apy: 35.0, minAmount: 5, minInvest: 50, lockPeriod: 0, tvl: 85000000, risk: 'medium-high', description: 'Unibot revenue share', rewards: 'ETH', autoCompound: true },
            { id: 'banana-staking', name: 'BANANA Staking', token: 'BANANA', icon: '🍌', apy: 28.0, minAmount: 5, minInvest: 40, lockPeriod: 0, tvl: 145000000, risk: 'medium-high', description: 'Banana Gun bot', rewards: 'ETH', autoCompound: true },
            { id: 'maestro-staking', name: 'MAESTRO Staking', token: 'MAESTRO', icon: '🎭', apy: 32.0, minAmount: 10, minInvest: 30, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'Maestro sniper bot', rewards: 'ETH', autoCompound: true },

            // TON Ecosystem
            { id: 'ton-staking', name: 'TON Staking', token: 'TON', icon: '💎', apy: 5.5, minAmount: 10, minInvest: 20, lockPeriod: 0, tvl: 1250000000, risk: 'low-medium', description: 'Toncoin staking', rewards: 'TON', autoCompound: true },
            { id: 'not-staking', name: 'NOT Staking', token: 'NOT', icon: '🎮', apy: 45.0, minAmount: 10000, minInvest: 10, lockPeriod: 0, tvl: 285000000, risk: 'high', description: 'Notcoin staking', rewards: 'NOT', autoCompound: true },
            { id: 'dogs-staking', name: 'DOGS Staking', token: 'DOGS', icon: '🐕', apy: 55.0, minAmount: 50000, minInvest: 10, lockPeriod: 0, tvl: 165000000, risk: 'high', description: 'Dogs meme token', rewards: 'DOGS', autoCompound: true },
            { id: 'cati-staking', name: 'CATI Staking', token: 'CATI', icon: '🐱', apy: 65.0, minAmount: 1000, minInvest: 10, lockPeriod: 0, tvl: 125000000, risk: 'high', description: 'Catizen staking', rewards: 'CATI', autoCompound: true },
            { id: 'hmstr-staking', name: 'HMSTR Staking', token: 'HMSTR', icon: '🐹', apy: 75.0, minAmount: 100000, minInvest: 10, lockPeriod: 0, tvl: 185000000, risk: 'high', description: 'Hamster Kombat', rewards: 'HMSTR', autoCompound: true },

            // DEX Governance Tokens
            { id: 'joe-staking', name: 'JOE Staking', token: 'JOE', icon: '🦫', apy: 22.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Trader Joe sJOE', rewards: 'USDC', autoCompound: true },
            { id: 'cake-staking', name: 'CAKE Staking', token: 'CAKE', icon: '🥞', apy: 8.0, minAmount: 10, minInvest: 15, lockPeriod: 0, tvl: 425000000, risk: 'low-medium', description: 'PancakeSwap veCAKE', rewards: 'CAKE', autoCompound: true },
            { id: 'sushi-staking', name: 'SUSHI Staking', token: 'SUSHI', icon: '🍣', apy: 12.0, minAmount: 50, minInvest: 15, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'SushiSwap xSUSHI', rewards: 'SUSHI', autoCompound: true },
            { id: 'quick-staking', name: 'QUICK Staking', token: 'QUICK', icon: '⚡', apy: 18.0, minAmount: 5, minInvest: 25, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'QuickSwap dQUICK', rewards: 'QUICK', autoCompound: true },
            { id: 'knc-staking', name: 'KNC Staking', token: 'KNC', icon: '💚', apy: 15.0, minAmount: 50, minInvest: 20, lockPeriod: 0, tvl: 125000000, risk: 'medium', description: 'Kyber Network', rewards: 'KNC', autoCompound: true },

            // RWA Tokens NEW
            { id: 'ondo-staking', name: 'ONDO Staking', token: 'ONDO', icon: '🏛️', apy: 8.0, minAmount: 100, minInvest: 50, lockPeriod: 0, tvl: 385000000, risk: 'low-medium', description: 'Ondo Finance RWA', rewards: 'ONDO', autoCompound: true },
            { id: 'rsr-staking', name: 'RSR Staking', token: 'RSR', icon: '📈', apy: 12.0, minAmount: 1000, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Reserve Rights', rewards: 'RSR', autoCompound: true },
            { id: 'eul-staking', name: 'EUL Staking', token: 'EUL', icon: '🏦', apy: 15.0, minAmount: 50, minInvest: 30, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Euler Finance', rewards: 'EUL', autoCompound: true },

            // DeFi Infrastructure
            { id: 'spell-staking', name: 'SPELL Staking', token: 'SPELL', icon: '✨', apy: 25.0, minAmount: 10000, minInvest: 15, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'Abracadabra MIM', rewards: 'SPELL', autoCompound: true },
            { id: 'alcx-staking', name: 'ALCX Staking', token: 'ALCX', icon: '⚗️', apy: 20.0, minAmount: 5, minInvest: 50, lockPeriod: 0, tvl: 45000000, risk: 'medium', description: 'Alchemix self-repaying', rewards: 'ALCX', autoCompound: true },
            { id: 'fxs-staking', name: 'FXS Staking', token: 'FXS', icon: '🅕', apy: 18.0, minAmount: 10, minInvest: 30, lockPeriod: 0, tvl: 165000000, risk: 'medium', description: 'Frax veFXS', rewards: 'FXS', autoCompound: true },
            { id: 'crv-staking', name: 'CRV Staking', token: 'CRV', icon: '🔵', apy: 12.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'Curve veCRV', rewards: 'CRV + 3CRV', autoCompound: true },
            { id: 'cvx-staking', name: 'CVX Staking', token: 'CVX', icon: '⬛', apy: 22.0, minAmount: 10, minInvest: 25, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Convex vlCVX', rewards: 'CVX + CRV', autoCompound: true },

            // Options & Derivatives
            { id: 'lyra-staking', name: 'LYRA Staking', token: 'LYRA', icon: '🎵', apy: 28.0, minAmount: 500, minInvest: 20, lockPeriod: 0, tvl: 35000000, risk: 'medium-high', description: 'Lyra options', rewards: 'LYRA', autoCompound: true },
            { id: 'premia-staking', name: 'PREMIA Staking', token: 'PREMIA', icon: '💎', apy: 32.0, minAmount: 100, minInvest: 25, lockPeriod: 0, tvl: 28000000, risk: 'medium-high', description: 'Premia vxPREMIA', rewards: 'PREMIA', autoCompound: true },
            { id: 'dopex-staking', name: 'DPX Staking', token: 'DPX', icon: '🔷', apy: 25.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 42000000, risk: 'medium-high', description: 'Dopex options', rewards: 'DPX', autoCompound: true },
            { id: 'rdpx-staking', name: 'RDPX Staking', token: 'RDPX', icon: '🔴', apy: 35.0, minAmount: 5, minInvest: 30, lockPeriod: 0, tvl: 25000000, risk: 'high', description: 'Dopex rebate token', rewards: 'RDPX', autoCompound: true },

            // === STAKING BATCH 17 - ZETTA EXPANSION ===
            // Cross-Chain Bridge Tokens
            { id: 'across-staking', name: 'ACX Staking', token: 'ACX', icon: '🌉', apy: 22.0, minAmount: 100, minInvest: 25, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Across Protocol bridge', rewards: 'ACX', autoCompound: true },
            { id: 'hop-staking', name: 'HOP Staking', token: 'HOP', icon: '🐰', apy: 18.0, minAmount: 500, minInvest: 20, lockPeriod: 0, tvl: 65000000, risk: 'medium', description: 'Hop Protocol bridge', rewards: 'HOP', autoCompound: true },
            { id: 'stargate-staking', name: 'STG Staking', token: 'STG', icon: '⭐', apy: 25.0, minAmount: 200, minInvest: 25, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Stargate veSTG', rewards: 'STG', autoCompound: true },
            { id: 'synapse-staking', name: 'SYN Staking', token: 'SYN', icon: '🧠', apy: 20.0, minAmount: 300, minInvest: 20, lockPeriod: 0, tvl: 75000000, risk: 'medium', description: 'Synapse bridge', rewards: 'SYN', autoCompound: true },
            { id: 'celer-staking', name: 'CELR Staking', token: 'CELR', icon: '🔗', apy: 15.0, minAmount: 1000, minInvest: 15, lockPeriod: 0, tvl: 125000000, risk: 'low-medium', description: 'Celer Network', rewards: 'CELR', autoCompound: true },
            // Perpetual DEX Layer 2
            { id: 'apollox-staking', name: 'APX Staking', token: 'APX', icon: '🚀', apy: 35.0, minAmount: 500, minInvest: 25, lockPeriod: 0, tvl: 85000000, risk: 'medium-high', description: 'ApolloX perps', rewards: 'APX', autoCompound: true },
            { id: 'aevo-staking', name: 'AEVO Staking', token: 'AEVO', icon: '📐', apy: 28.0, minAmount: 50, minInvest: 30, lockPeriod: 0, tvl: 165000000, risk: 'medium', description: 'Aevo options DEX', rewards: 'AEVO', autoCompound: true },
            { id: 'kwenta-staking', name: 'KWENTA Staking', token: 'KWENTA', icon: '🟡', apy: 32.0, minAmount: 1, minInvest: 50, lockPeriod: 0, tvl: 55000000, risk: 'medium-high', description: 'Kwenta perps', rewards: 'KWENTA', autoCompound: true },
            { id: 'perp-staking', name: 'PERP Staking', token: 'PERP', icon: '📊', apy: 24.0, minAmount: 100, minInvest: 25, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Perpetual Protocol', rewards: 'PERP', autoCompound: true },
            { id: 'dydx-staking', name: 'DYDX Staking', token: 'DYDX', icon: '📈', apy: 18.0, minAmount: 50, minInvest: 40, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'dYdX governance', rewards: 'DYDX', autoCompound: true },
            // Launchpad Tokens
            { id: 'prime-staking', name: 'PRIME Staking', token: 'PRIME', icon: '🎮', apy: 45.0, minAmount: 10, minInvest: 50, lockPeriod: 30, tvl: 185000000, risk: 'medium-high', description: 'Echelon Prime gaming', rewards: 'PRIME', autoCompound: true },
            { id: 'sfund-staking', name: 'SFUND Staking', token: 'SFUND', icon: '🌱', apy: 55.0, minAmount: 50, minInvest: 30, lockPeriod: 30, tvl: 45000000, risk: 'high', description: 'Seedify launchpad', rewards: 'SFUND', autoCompound: true },
            { id: 'dao-staking', name: 'DAO Staking', token: 'DAO', icon: '🏛️', apy: 40.0, minAmount: 100, minInvest: 25, lockPeriod: 14, tvl: 65000000, risk: 'medium-high', description: 'DAO Maker launchpad', rewards: 'DAO', autoCompound: true },
            { id: 'pols-staking', name: 'POLS Staking', token: 'POLS', icon: '🔶', apy: 35.0, minAmount: 250, minInvest: 25, lockPeriod: 7, tvl: 55000000, risk: 'medium-high', description: 'Polkastarter IDO', rewards: 'POLS', autoCompound: true },
            { id: 'paid-staking', name: 'PAID Staking', token: 'PAID', icon: '💳', apy: 30.0, minAmount: 500, minInvest: 20, lockPeriod: 7, tvl: 25000000, risk: 'medium-high', description: 'PAID Network', rewards: 'PAID', autoCompound: true },
            // Privacy and Confidential Computing
            { id: 'oasis-staking', name: 'ROSE Staking', token: 'ROSE', icon: '🌹', apy: 12.0, minAmount: 500, minInvest: 25, lockPeriod: 14, tvl: 285000000, risk: 'medium', description: 'Oasis Network privacy', rewards: 'ROSE', autoCompound: true },
            { id: 'secret-staking', name: 'SCRT Staking', token: 'SCRT', icon: '🤫', apy: 18.0, minAmount: 100, minInvest: 25, lockPeriod: 21, tvl: 145000000, risk: 'medium', description: 'Secret Network', rewards: 'SCRT', autoCompound: true },
            { id: 'nym-staking', name: 'NYM Staking', token: 'NYM', icon: '👤', apy: 22.0, minAmount: 500, minInvest: 20, lockPeriod: 14, tvl: 65000000, risk: 'medium', description: 'Nym mixnet privacy', rewards: 'NYM', autoCompound: true },
            { id: 'iron-staking', name: 'IRON Staking', token: 'IRON', icon: '🔒', apy: 25.0, minAmount: 200, minInvest: 20, lockPeriod: 7, tvl: 35000000, risk: 'medium-high', description: 'Iron Fish privacy', rewards: 'IRON', autoCompound: true },
            { id: 'azero-staking', name: 'AZERO Staking', token: 'AZERO', icon: '🅰️', apy: 14.0, minAmount: 100, minInvest: 30, lockPeriod: 14, tvl: 195000000, risk: 'medium', description: 'Aleph Zero privacy L1', rewards: 'AZERO', autoCompound: true },
            // Oracle Networks
            { id: 'band-staking', name: 'BAND Staking', token: 'BAND', icon: '📡', apy: 14.0, minAmount: 50, minInvest: 25, lockPeriod: 21, tvl: 95000000, risk: 'medium', description: 'Band Protocol oracle', rewards: 'BAND', autoCompound: true },
            { id: 'api3-staking', name: 'API3 Staking', token: 'API3', icon: '🔌', apy: 18.0, minAmount: 100, minInvest: 30, lockPeriod: 7, tvl: 125000000, risk: 'medium', description: 'API3 first-party oracles', rewards: 'API3', autoCompound: true },
            { id: 'uma-staking', name: 'UMA Staking', token: 'UMA', icon: '🔮', apy: 22.0, minAmount: 25, minInvest: 40, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'UMA optimistic oracle', rewards: 'UMA', autoCompound: true },
            { id: 'pyth-staking', name: 'PYTH Staking', token: 'PYTH', icon: '🐍', apy: 12.0, minAmount: 500, minInvest: 25, lockPeriod: 7, tvl: 385000000, risk: 'low-medium', description: 'Pyth Network oracle', rewards: 'PYTH', autoCompound: true },
            { id: 'dia-staking', name: 'DIA Staking', token: 'DIA', icon: '💎', apy: 16.0, minAmount: 200, minInvest: 20, lockPeriod: 14, tvl: 45000000, risk: 'medium', description: 'DIA oracle platform', rewards: 'DIA', autoCompound: true },
            // DeFi Insurance
            { id: 'nexus-staking', name: 'wNXM Staking', token: 'wNXM', icon: '🛡️', apy: 8.0, minAmount: 5, minInvest: 100, lockPeriod: 90, tvl: 285000000, risk: 'low-medium', description: 'Nexus Mutual insurance', rewards: 'wNXM', autoCompound: true },
            { id: 'insr-staking', name: 'INSR Staking', token: 'INSR', icon: '🔐', apy: 25.0, minAmount: 1000, minInvest: 20, lockPeriod: 30, tvl: 35000000, risk: 'medium-high', description: 'InsurAce protocol', rewards: 'INSR', autoCompound: true },
            { id: 'unslashed-staking', name: 'USF Staking', token: 'USF', icon: '⚔️', apy: 28.0, minAmount: 500, minInvest: 25, lockPeriod: 14, tvl: 25000000, risk: 'high', description: 'Unslashed Finance', rewards: 'USF', autoCompound: true },
            { id: 'ease-staking', name: 'EASE Staking', token: 'EASE', icon: '😌', apy: 20.0, minAmount: 1000, minInvest: 15, lockPeriod: 30, tvl: 45000000, risk: 'medium', description: 'Ease DeFi coverage', rewards: 'EASE', autoCompound: true },
            { id: 'armor-staking', name: 'ARMOR Staking', token: 'ARMOR', icon: '🛡️', apy: 35.0, minAmount: 2000, minInvest: 15, lockPeriod: 7, tvl: 15000000, risk: 'high', description: 'Armor.Fi coverage', rewards: 'ARMOR', autoCompound: true },
            // MEV Infrastructure
            { id: 'eden-staking', name: 'EDEN Staking', token: 'EDEN', icon: '🌳', apy: 28.0, minAmount: 500, minInvest: 20, lockPeriod: 7, tvl: 35000000, risk: 'medium-high', description: 'Eden Network MEV', rewards: 'EDEN', autoCompound: true },
            { id: 'rook-staking', name: 'ROOK Staking', token: 'ROOK', icon: '♜', apy: 22.0, minAmount: 5, minInvest: 50, lockPeriod: 0, tvl: 25000000, risk: 'medium-high', description: 'KeeperDAO MEV', rewards: 'ROOK', autoCompound: true },
            { id: 'cow-staking', name: 'COW Staking', token: 'COW', icon: '🐮', apy: 15.0, minAmount: 200, minInvest: 25, lockPeriod: 7, tvl: 145000000, risk: 'medium', description: 'CoW Protocol solver', rewards: 'COW', autoCompound: true },
            { id: 'manifold-staking', name: 'FOLD Staking', token: 'FOLD', icon: '📄', apy: 32.0, minAmount: 100, minInvest: 30, lockPeriod: 14, tvl: 25000000, risk: 'high', description: 'Manifold Finance MEV', rewards: 'FOLD', autoCompound: true },
            { id: 'flashbots-staking', name: 'FLB Staking', token: 'FLB', icon: '⚡', apy: 25.0, minAmount: 50, minInvest: 40, lockPeriod: 30, tvl: 85000000, risk: 'medium-high', description: 'Flashbots protection', rewards: 'FLB', autoCompound: true },

            // === STAKING BATCH 18 - YOTTA EXPANSION ===
            // Data Availability Layer
            { id: 'tia-staking', name: 'TIA Staking', token: 'TIA', icon: '🌌', apy: 14.0, minAmount: 50, minInvest: 40, lockPeriod: 21, tvl: 485000000, risk: 'medium', description: 'Celestia DA staking', rewards: 'TIA', autoCompound: true },
            { id: 'eigen-staking', name: 'EIGEN Staking', token: 'EIGEN', icon: '🔷', apy: 12.0, minAmount: 10, minInvest: 50, lockPeriod: 7, tvl: 685000000, risk: 'medium', description: 'EigenLayer restaking', rewards: 'EIGEN', autoCompound: true },
            { id: 'avail-staking', name: 'AVAIL Staking', token: 'AVAIL', icon: '📊', apy: 18.0, minAmount: 200, minInvest: 25, lockPeriod: 14, tvl: 145000000, risk: 'medium', description: 'Avail DA network', rewards: 'AVAIL', autoCompound: true },
            { id: 'manta-staking', name: 'MANTA Staking', token: 'MANTA', icon: '🐋', apy: 22.0, minAmount: 100, minInvest: 30, lockPeriod: 7, tvl: 185000000, risk: 'medium', description: 'Manta Network DA', rewards: 'MANTA', autoCompound: true },
            { id: 'nil-staking', name: 'NIL Staking', token: 'NIL', icon: '⭕', apy: 25.0, minAmount: 500, minInvest: 20, lockPeriod: 14, tvl: 65000000, risk: 'medium-high', description: 'Nil Foundation zkDA', rewards: 'NIL', autoCompound: true },
            // Account Abstraction
            { id: 'safe-staking', name: 'SAFE Staking', token: 'SAFE', icon: '🔐', apy: 15.0, minAmount: 100, minInvest: 35, lockPeriod: 30, tvl: 285000000, risk: 'low-medium', description: 'Safe wallet governance', rewards: 'SAFE', autoCompound: true },
            { id: 'bico-staking', name: 'BICO Staking', token: 'BICO', icon: '🔄', apy: 22.0, minAmount: 200, minInvest: 25, lockPeriod: 14, tvl: 95000000, risk: 'medium', description: 'Biconomy AA infra', rewards: 'BICO', autoCompound: true },
            { id: 'stackup-staking', name: 'STACK Staking', token: 'STACK', icon: '📚', apy: 28.0, minAmount: 500, minInvest: 20, lockPeriod: 7, tvl: 45000000, risk: 'medium-high', description: 'Stackup bundler', rewards: 'STACK', autoCompound: true },
            { id: 'pimlico-staking', name: 'PIM Staking', token: 'PIM', icon: '🎩', apy: 32.0, minAmount: 300, minInvest: 25, lockPeriod: 14, tvl: 35000000, risk: 'medium-high', description: 'Pimlico paymaster', rewards: 'PIM', autoCompound: true },
            { id: 'zerodev-staking', name: 'ZERO Staking', token: 'ZERO', icon: '0️⃣', apy: 35.0, minAmount: 200, minInvest: 20, lockPeriod: 7, tvl: 28000000, risk: 'high', description: 'ZeroDev smart accounts', rewards: 'ZERO', autoCompound: true },
            // Liquid Staking Derivatives
            { id: 'ldo-staking', name: 'LDO Staking', token: 'LDO', icon: '🌊', apy: 8.0, minAmount: 50, minInvest: 40, lockPeriod: 0, tvl: 685000000, risk: 'low-medium', description: 'Lido DAO governance', rewards: 'LDO', autoCompound: true },
            { id: 'rpl-staking', name: 'RPL Staking', token: 'RPL', icon: '🚀', apy: 10.0, minAmount: 10, minInvest: 60, lockPeriod: 0, tvl: 385000000, risk: 'low-medium', description: 'Rocket Pool node', rewards: 'RPL', autoCompound: true },
            { id: 'swise-staking', name: 'SWISE Staking', token: 'SWISE', icon: '🦉', apy: 15.0, minAmount: 500, minInvest: 20, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'StakeWise v3', rewards: 'SWISE', autoCompound: true },
            { id: 'sd-staking', name: 'SD Staking', token: 'SD', icon: '💎', apy: 18.0, minAmount: 200, minInvest: 25, lockPeriod: 7, tvl: 95000000, risk: 'medium', description: 'Stader Labs', rewards: 'SD', autoCompound: true },
            { id: 'ankr-staking', name: 'ANKR Staking', token: 'ANKR', icon: '⚓', apy: 12.0, minAmount: 1000, minInvest: 15, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Ankr liquid staking', rewards: 'ANKR', autoCompound: true },
            // Layer 0 / Interoperability
            { id: 'zro-staking', name: 'ZRO Staking', token: 'ZRO', icon: '🔗', apy: 15.0, minAmount: 100, minInvest: 40, lockPeriod: 14, tvl: 485000000, risk: 'medium', description: 'LayerZero v2', rewards: 'ZRO', autoCompound: true },
            { id: 'w-staking', name: 'W Staking', token: 'W', icon: '🪱', apy: 12.0, minAmount: 200, minInvest: 30, lockPeriod: 7, tvl: 385000000, risk: 'medium', description: 'Wormhole bridge', rewards: 'W', autoCompound: true },
            { id: 'axl-staking', name: 'AXL Staking', token: 'AXL', icon: '🔄', apy: 18.0, minAmount: 150, minInvest: 25, lockPeriod: 14, tvl: 245000000, risk: 'medium', description: 'Axelar network', rewards: 'AXL', autoCompound: true },
            { id: 'zeta-staking', name: 'ZETA Staking', token: 'ZETA', icon: 'Ζ', apy: 22.0, minAmount: 200, minInvest: 25, lockPeriod: 7, tvl: 165000000, risk: 'medium', description: 'ZetaChain omnichain', rewards: 'ZETA', autoCompound: true },
            { id: 'ccip-staking', name: 'CCIP Staking', token: 'LINK', icon: '⛓️', apy: 8.0, minAmount: 50, minInvest: 50, lockPeriod: 30, tvl: 585000000, risk: 'low-medium', description: 'Chainlink CCIP', rewards: 'LINK', autoCompound: true },
            // DEX Aggregators
            { id: '1inch-staking', name: '1INCH Staking', token: '1INCH', icon: '🦄', apy: 12.0, minAmount: 200, minInvest: 25, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: '1inch Fusion+', rewards: '1INCH', autoCompound: true },
            { id: 'psp-staking', name: 'PSP Staking', token: 'PSP', icon: '🦜', apy: 18.0, minAmount: 500, minInvest: 20, lockPeriod: 14, tvl: 95000000, risk: 'medium', description: 'ParaSwap DAO', rewards: 'PSP', autoCompound: true },
            { id: 'odos-staking', name: 'ODOS Staking', token: 'ODOS', icon: '🛤️', apy: 25.0, minAmount: 300, minInvest: 25, lockPeriod: 7, tvl: 65000000, risk: 'medium-high', description: 'Odos aggregator', rewards: 'ODOS', autoCompound: true },
            { id: 'openocean-staking', name: 'OOE Staking', token: 'OOE', icon: '🌊', apy: 22.0, minAmount: 1000, minInvest: 15, lockPeriod: 14, tvl: 45000000, risk: 'medium', description: 'OpenOcean DEX', rewards: 'OOE', autoCompound: true },
            { id: 'kyber-staking', name: 'KNC Staking', token: 'KNC', icon: '💎', apy: 15.0, minAmount: 100, minInvest: 30, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'KyberSwap elastic', rewards: 'KNC', autoCompound: true },
            // Yield Aggregators
            { id: 'yfi-staking', name: 'YFI Staking', token: 'YFI', icon: '🏦', apy: 8.0, minAmount: 0.01, minInvest: 200, lockPeriod: 7, tvl: 385000000, risk: 'low-medium', description: 'Yearn v3 vaults', rewards: 'YFI', autoCompound: true },
            { id: 'farm-staking', name: 'FARM Staking', token: 'FARM', icon: '🌾', apy: 25.0, minAmount: 5, minInvest: 40, lockPeriod: 7, tvl: 65000000, risk: 'medium-high', description: 'Harvest Finance', rewards: 'FARM', autoCompound: true },
            { id: 'bifi-staking', name: 'BIFI Staking', token: 'BIFI', icon: '🐄', apy: 18.0, minAmount: 0.5, minInvest: 50, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Beefy vaults', rewards: 'BIFI', autoCompound: true },
            { id: 'pickle-staking', name: 'PICKLE Staking', token: 'PICKLE', icon: '🥒', apy: 35.0, minAmount: 10, minInvest: 25, lockPeriod: 14, tvl: 25000000, risk: 'high', description: 'Pickle Finance', rewards: 'PICKLE', autoCompound: true },
            { id: 'idle-staking', name: 'IDLE Staking', token: 'IDLE', icon: '💤', apy: 15.0, minAmount: 100, minInvest: 20, lockPeriod: 7, tvl: 55000000, risk: 'medium', description: 'Idle Finance', rewards: 'IDLE', autoCompound: true },
            // Perpetual Protocols (New)
            { id: 'snx-staking', name: 'SNX Staking', token: 'SNX', icon: '🔮', apy: 22.0, minAmount: 50, minInvest: 30, lockPeriod: 7, tvl: 385000000, risk: 'medium', description: 'Synthetix v3', rewards: 'SNX + sUSD', autoCompound: true },
            { id: 'cap-staking', name: 'CAP Staking', token: 'CAP', icon: '🧢', apy: 28.0, minAmount: 100, minInvest: 25, lockPeriod: 14, tvl: 45000000, risk: 'medium-high', description: 'Cap Finance perps', rewards: 'CAP', autoCompound: true },
            { id: 'level-staking', name: 'LVL Staking', token: 'LVL', icon: '📈', apy: 35.0, minAmount: 200, minInvest: 20, lockPeriod: 7, tvl: 65000000, risk: 'medium-high', description: 'Level Finance', rewards: 'LVL', autoCompound: true },
            { id: 'mux-staking', name: 'MUX Staking', token: 'MUX', icon: '🎛️', apy: 32.0, minAmount: 500, minInvest: 20, lockPeriod: 14, tvl: 55000000, risk: 'medium-high', description: 'MUX Protocol', rewards: 'MUX', autoCompound: true },
            { id: 'hmx-staking', name: 'HMX Staking', token: 'HMX', icon: '🔥', apy: 42.0, minAmount: 300, minInvest: 25, lockPeriod: 7, tvl: 35000000, risk: 'high', description: 'HMX perpetuals', rewards: 'HMX', autoCompound: true },

            // === STAKING BATCH 19 - RONNA EXPANSION ===
            // Bitcoin DeFi
            { id: 'rune-staking', name: 'RUNE Staking', token: 'RUNE', icon: '⚡', apy: 12.0, minAmount: 50, minInvest: 50, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'THORChain LP bonding', rewards: 'RUNE', autoCompound: true },
            { id: 'badger-staking', name: 'BADGER Staking', token: 'BADGER', icon: '🦡', apy: 18.0, minAmount: 25, minInvest: 30, lockPeriod: 7, tvl: 95000000, risk: 'medium', description: 'BadgerDAO BTC vaults', rewards: 'BADGER', autoCompound: true },
            { id: 'tbtc-staking', name: 'tBTC Staking', token: 'tBTC', icon: '₿', apy: 8.0, minAmount: 0.01, minInvest: 100, lockPeriod: 0, tvl: 285000000, risk: 'low-medium', description: 'Threshold BTC bridge', rewards: 'T', autoCompound: true },
            { id: 'sbtc-staking', name: 'sBTC Staking', token: 'sBTC', icon: '🔶', apy: 10.0, minAmount: 0.01, minInvest: 100, lockPeriod: 14, tvl: 185000000, risk: 'medium', description: 'Stacks BTC yield', rewards: 'STX', autoCompound: true },
            { id: 'wbtc-staking', name: 'WBTC Staking', token: 'WBTC', icon: '🟠', apy: 5.0, minAmount: 0.01, minInvest: 150, lockPeriod: 0, tvl: 685000000, risk: 'low', description: 'Wrapped BTC lending', rewards: 'WBTC', autoCompound: true },
            // Cosmos Ecosystem
            { id: 'atom-staking', name: 'ATOM Staking', token: 'ATOM', icon: '⚛️', apy: 18.0, minAmount: 10, minInvest: 30, lockPeriod: 21, tvl: 485000000, risk: 'medium', description: 'Cosmos Hub staking', rewards: 'ATOM', autoCompound: true },
            { id: 'osmo-staking', name: 'OSMO Staking', token: 'OSMO', icon: '🧪', apy: 22.0, minAmount: 50, minInvest: 25, lockPeriod: 14, tvl: 285000000, risk: 'medium', description: 'Osmosis DEX staking', rewards: 'OSMO', autoCompound: true },
            { id: 'inj-staking', name: 'INJ Staking', token: 'INJ', icon: '💉', apy: 15.0, minAmount: 5, minInvest: 40, lockPeriod: 21, tvl: 385000000, risk: 'medium', description: 'Injective staking', rewards: 'INJ', autoCompound: true },
            { id: 'sei-staking', name: 'SEI Staking', token: 'SEI', icon: '🌊', apy: 12.0, minAmount: 100, minInvest: 25, lockPeriod: 21, tvl: 245000000, risk: 'medium', description: 'Sei Network staking', rewards: 'SEI', autoCompound: true },
            { id: 'kava-staking', name: 'KAVA Staking', token: 'KAVA', icon: '🔴', apy: 20.0, minAmount: 50, minInvest: 25, lockPeriod: 21, tvl: 185000000, risk: 'medium', description: 'Kava DeFi hub', rewards: 'KAVA', autoCompound: true },
            // Polkadot Ecosystem
            { id: 'dot-staking', name: 'DOT Staking', token: 'DOT', icon: '⬡', apy: 14.0, minAmount: 10, minInvest: 35, lockPeriod: 28, tvl: 685000000, risk: 'medium', description: 'Polkadot NPoS', rewards: 'DOT', autoCompound: true },
            { id: 'ksm-staking', name: 'KSM Staking', token: 'KSM', icon: '🐦', apy: 18.0, minAmount: 1, minInvest: 50, lockPeriod: 7, tvl: 185000000, risk: 'medium', description: 'Kusama canary', rewards: 'KSM', autoCompound: true },
            { id: 'astr-staking', name: 'ASTR Staking', token: 'ASTR', icon: '⭐', apy: 15.0, minAmount: 500, minInvest: 20, lockPeriod: 10, tvl: 145000000, risk: 'medium', description: 'Astar dApp staking', rewards: 'ASTR', autoCompound: true },
            { id: 'glmr-staking', name: 'GLMR Staking', token: 'GLMR', icon: '🌙', apy: 12.0, minAmount: 100, minInvest: 25, lockPeriod: 14, tvl: 125000000, risk: 'medium', description: 'Moonbeam staking', rewards: 'GLMR', autoCompound: true },
            { id: 'para-staking', name: 'PARA Staking', token: 'PARA', icon: '🪂', apy: 22.0, minAmount: 1000, minInvest: 15, lockPeriod: 7, tvl: 45000000, risk: 'medium-high', description: 'Parallel Finance', rewards: 'PARA', autoCompound: true },
            // NFT Gaming Infrastructure
            { id: 'imx-staking', name: 'IMX Staking', token: 'IMX', icon: '🎮', apy: 10.0, minAmount: 100, minInvest: 30, lockPeriod: 0, tvl: 385000000, risk: 'medium', description: 'Immutable X gaming', rewards: 'IMX', autoCompound: true },
            { id: 'gala-staking', name: 'GALA Staking', token: 'GALA', icon: '🎰', apy: 25.0, minAmount: 1000, minInvest: 15, lockPeriod: 7, tvl: 145000000, risk: 'medium-high', description: 'Gala Games nodes', rewards: 'GALA', autoCompound: true },
            { id: 'flow-staking', name: 'FLOW Staking', token: 'FLOW', icon: '🌀', apy: 8.0, minAmount: 50, minInvest: 40, lockPeriod: 14, tvl: 285000000, risk: 'medium', description: 'Flow blockchain', rewards: 'FLOW', autoCompound: true },
            { id: 'ape-staking', name: 'APE Staking', token: 'APE', icon: '🦧', apy: 12.0, minAmount: 25, minInvest: 30, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'ApeCoin staking', rewards: 'APE', autoCompound: true },
            { id: 'ronin-staking', name: 'RON Staking', token: 'RON', icon: '⚔️', apy: 15.0, minAmount: 100, minInvest: 25, lockPeriod: 7, tvl: 245000000, risk: 'medium', description: 'Ronin validators', rewards: 'RON', autoCompound: true },
            // Storage & Compute
            { id: 'fil-staking', name: 'FIL Staking', token: 'FIL', icon: '📁', apy: 15.0, minAmount: 10, minInvest: 40, lockPeriod: 180, tvl: 385000000, risk: 'medium', description: 'Filecoin storage', rewards: 'FIL', autoCompound: true },
            { id: 'ar-staking', name: 'AR Staking', token: 'AR', icon: '🏛️', apy: 8.0, minAmount: 5, minInvest: 60, lockPeriod: 0, tvl: 285000000, risk: 'low-medium', description: 'Arweave permaweb', rewards: 'AR', autoCompound: true },
            { id: 'storj-staking', name: 'STORJ Staking', token: 'STORJ', icon: '☁️', apy: 12.0, minAmount: 200, minInvest: 20, lockPeriod: 30, tvl: 95000000, risk: 'medium', description: 'Storj node operator', rewards: 'STORJ', autoCompound: true },
            { id: 'blz-staking', name: 'BLZ Staking', token: 'BLZ', icon: '🔥', apy: 18.0, minAmount: 500, minInvest: 15, lockPeriod: 14, tvl: 45000000, risk: 'medium', description: 'Bluzelle validators', rewards: 'BLZ', autoCompound: true },
            { id: 'akt-staking', name: 'AKT Staking', token: 'AKT', icon: '☁️', apy: 20.0, minAmount: 50, minInvest: 30, lockPeriod: 21, tvl: 145000000, risk: 'medium', description: 'Akash compute', rewards: 'AKT', autoCompound: true },
            // Identity & Reputation
            { id: 'ens-staking', name: 'ENS Staking', token: 'ENS', icon: '🏷️', apy: 5.0, minAmount: 5, minInvest: 80, lockPeriod: 0, tvl: 385000000, risk: 'low', description: 'ENS DAO governance', rewards: 'ENS', autoCompound: true },
            { id: 'wld-staking', name: 'WLD Staking', token: 'WLD', icon: '🌍', apy: 15.0, minAmount: 50, minInvest: 30, lockPeriod: 7, tvl: 285000000, risk: 'medium', description: 'Worldcoin identity', rewards: 'WLD', autoCompound: true },
            { id: 'id-staking', name: 'ID Staking', token: 'ID', icon: '🆔', apy: 18.0, minAmount: 500, minInvest: 20, lockPeriod: 14, tvl: 95000000, risk: 'medium', description: 'SPACE ID domains', rewards: 'ID', autoCompound: true },
            { id: 'gal-staking', name: 'GAL Staking', token: 'GAL', icon: '🎖️', apy: 12.0, minAmount: 100, minInvest: 25, lockPeriod: 7, tvl: 145000000, risk: 'medium', description: 'Galxe credentials', rewards: 'GAL', autoCompound: true },
            { id: 'cyber-staking', name: 'CYBER Staking', token: 'CYBER', icon: '🤖', apy: 22.0, minAmount: 10, minInvest: 40, lockPeriod: 14, tvl: 85000000, risk: 'medium', description: 'CyberConnect social', rewards: 'CYBER', autoCompound: true },
            // Structured Products
            { id: 'rbn-staking', name: 'RBN Staking', token: 'RBN', icon: '🎀', apy: 25.0, minAmount: 500, minInvest: 20, lockPeriod: 7, tvl: 65000000, risk: 'medium-high', description: 'Ribbon Finance DOV', rewards: 'RBN', autoCompound: true },
            { id: 'jones-staking', name: 'JONES Staking', token: 'JONES', icon: '🎯', apy: 35.0, minAmount: 100, minInvest: 25, lockPeriod: 14, tvl: 45000000, risk: 'high', description: 'Jones DAO options', rewards: 'JONES', autoCompound: true },
            { id: 'glp-staking', name: 'GLP Staking', token: 'GLP', icon: '📊', apy: 20.0, minAmount: 100, minInvest: 50, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'GMX liquidity token', rewards: 'ETH + esGMX', autoCompound: true },
            { id: 'sglp-staking', name: 'sGLP Staking', token: 'sGLP', icon: '📈', apy: 25.0, minAmount: 100, minInvest: 50, lockPeriod: 7, tvl: 185000000, risk: 'medium', description: 'Staked GLP wrapper', rewards: 'sGLP', autoCompound: true },
            { id: 'plvglp-staking', name: 'plvGLP Staking', token: 'plvGLP', icon: '💎', apy: 30.0, minAmount: 100, minInvest: 40, lockPeriod: 14, tvl: 95000000, risk: 'medium-high', description: 'Plutus vaulted GLP', rewards: 'PLS', autoCompound: true },

            // === STAKING BATCH 20 - QUETTA EXPANSION ===
            // AI & Machine Learning
            { id: 'tao-staking', name: 'TAO Staking', token: 'TAO', icon: '🧠', apy: 18.0, minAmount: 0.5, minInvest: 100, lockPeriod: 7, tvl: 485000000, risk: 'medium', description: 'Bittensor subnet', rewards: 'TAO', autoCompound: true },
            { id: 'rndr-staking', name: 'RNDR Staking', token: 'RNDR', icon: '🎨', apy: 12.0, minAmount: 50, minInvest: 40, lockPeriod: 0, tvl: 385000000, risk: 'medium', description: 'Render GPU network', rewards: 'RNDR', autoCompound: true },
            { id: 'fet-staking', name: 'FET Staking', token: 'FET', icon: '🤖', apy: 15.0, minAmount: 200, minInvest: 25, lockPeriod: 21, tvl: 285000000, risk: 'medium', description: 'Fetch.ai agents', rewards: 'FET', autoCompound: true },
            { id: 'ocean-staking', name: 'OCEAN Staking', token: 'OCEAN', icon: '🌊', apy: 18.0, minAmount: 500, minInvest: 20, lockPeriod: 14, tvl: 145000000, risk: 'medium', description: 'Ocean data market', rewards: 'OCEAN', autoCompound: true },
            { id: 'agix-staking', name: 'AGIX Staking', token: 'AGIX', icon: '🔮', apy: 22.0, minAmount: 1000, minInvest: 15, lockPeriod: 30, tvl: 185000000, risk: 'medium', description: 'SingularityNET AI', rewards: 'AGIX', autoCompound: true },
            // ZK Layer 2 Tokens
            { id: 'zk-staking', name: 'ZK Staking', token: 'ZK', icon: '🔐', apy: 12.0, minAmount: 500, minInvest: 25, lockPeriod: 14, tvl: 385000000, risk: 'medium', description: 'zkSync Era token', rewards: 'ZK', autoCompound: true },
            { id: 'strk-staking', name: 'STRK Staking', token: 'STRK', icon: '⚡', apy: 10.0, minAmount: 100, minInvest: 35, lockPeriod: 21, tvl: 485000000, risk: 'medium', description: 'Starknet token', rewards: 'STRK', autoCompound: true },
            { id: 'matic-staking', name: 'POL Staking', token: 'POL', icon: '💜', apy: 8.0, minAmount: 200, minInvest: 25, lockPeriod: 0, tvl: 685000000, risk: 'low-medium', description: 'Polygon validators', rewards: 'POL', autoCompound: true },
            { id: 'linea-staking', name: 'LINEA Staking', token: 'LINEA', icon: '📐', apy: 15.0, minAmount: 500, minInvest: 20, lockPeriod: 14, tvl: 185000000, risk: 'medium', description: 'Linea zkEVM', rewards: 'LINEA', autoCompound: true },
            { id: 'scroll-staking', name: 'SCROLL Staking', token: 'SCROLL', icon: '📜', apy: 18.0, minAmount: 300, minInvest: 25, lockPeriod: 7, tvl: 145000000, risk: 'medium', description: 'Scroll zkEVM', rewards: 'SCROLL', autoCompound: true },
            // Rollup Infrastructure
            { id: 'arb-staking', name: 'ARB Staking', token: 'ARB', icon: '🔵', apy: 8.0, minAmount: 200, minInvest: 30, lockPeriod: 0, tvl: 585000000, risk: 'low-medium', description: 'Arbitrum DAO', rewards: 'ARB', autoCompound: true },
            { id: 'op-staking', name: 'OP Staking', token: 'OP', icon: '🔴', apy: 6.0, minAmount: 100, minInvest: 35, lockPeriod: 0, tvl: 485000000, risk: 'low-medium', description: 'Optimism Collective', rewards: 'OP', autoCompound: true },
            { id: 'metis-staking', name: 'METIS Staking', token: 'METIS', icon: '🟢', apy: 15.0, minAmount: 5, minInvest: 60, lockPeriod: 7, tvl: 145000000, risk: 'medium', description: 'Metis sequencer', rewards: 'METIS', autoCompound: true },
            { id: 'boba-staking', name: 'BOBA Staking', token: 'BOBA', icon: '🧋', apy: 22.0, minAmount: 500, minInvest: 20, lockPeriod: 14, tvl: 45000000, risk: 'medium-high', description: 'Boba Network', rewards: 'BOBA', autoCompound: true },
            { id: 'mnt-staking', name: 'MNT Staking', token: 'MNT', icon: '🏔️', apy: 10.0, minAmount: 100, minInvest: 30, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Mantle Network', rewards: 'MNT', autoCompound: true },
            // DeFi Blue Chips
            { id: 'mkr-staking', name: 'MKR Staking', token: 'MKR', icon: '🏛️', apy: 8.0, minAmount: 0.1, minInvest: 150, lockPeriod: 0, tvl: 685000000, risk: 'low', description: 'MakerDAO governance', rewards: 'MKR', autoCompound: true },
            { id: 'comp-staking', name: 'COMP Staking', token: 'COMP', icon: '🏦', apy: 5.0, minAmount: 1, minInvest: 80, lockPeriod: 0, tvl: 385000000, risk: 'low', description: 'Compound governance', rewards: 'COMP', autoCompound: true },
            { id: 'uni-staking', name: 'UNI Staking', token: 'UNI', icon: '🦄', apy: 5.0, minAmount: 20, minInvest: 40, lockPeriod: 0, tvl: 485000000, risk: 'low', description: 'Uniswap governance', rewards: 'UNI', autoCompound: true },
            { id: 'aave-staking', name: 'AAVE Staking', token: 'AAVE', icon: '👻', apy: 6.0, minAmount: 1, minInvest: 100, lockPeriod: 10, tvl: 585000000, risk: 'low', description: 'Aave safety module', rewards: 'AAVE', autoCompound: true },
            { id: 'crv-v2-staking', name: 'CRV V2 Staking', token: 'CRV', icon: '🔵', apy: 15.0, minAmount: 500, minInvest: 20, lockPeriod: 0, tvl: 385000000, risk: 'medium', description: 'Curve veCRV boost', rewards: 'CRV + 3CRV', autoCompound: true },
            // Stablecoin Protocols
            { id: 'lusd-staking', name: 'LUSD Staking', token: 'LQTY', icon: '💎', apy: 25.0, minAmount: 100, minInvest: 25, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'Liquity stability', rewards: 'LQTY + ETH', autoCompound: true },
            { id: 'frax-staking', name: 'FXS V2 Staking', token: 'FXS', icon: '🔷', apy: 20.0, minAmount: 25, minInvest: 35, lockPeriod: 7, tvl: 185000000, risk: 'medium', description: 'Frax veFXS v2', rewards: 'FXS', autoCompound: true },
            { id: 'mim-staking', name: 'SPELL V2 Staking', token: 'SPELL', icon: '✨', apy: 28.0, minAmount: 10000, minInvest: 15, lockPeriod: 0, tvl: 65000000, risk: 'medium-high', description: 'Abracadabra sSPELL', rewards: 'SPELL', autoCompound: true },
            { id: 'prisma-staking', name: 'PRISMA Staking', token: 'PRISMA', icon: '🔺', apy: 35.0, minAmount: 500, minInvest: 20, lockPeriod: 14, tvl: 95000000, risk: 'medium-high', description: 'Prisma mkUSD', rewards: 'PRISMA', autoCompound: true },
            { id: 'crvusd-staking', name: 'crvUSD Staking', token: 'CRV', icon: '💵', apy: 18.0, minAmount: 1000, minInvest: 20, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Curve crvUSD rewards', rewards: 'CRV', autoCompound: true },
            // Liquid Restaking Tokens
            { id: 'puffer-staking', name: 'PUFFER Staking', token: 'PUFFER', icon: '🐡', apy: 15.0, minAmount: 500, minInvest: 25, lockPeriod: 7, tvl: 185000000, risk: 'medium', description: 'Puffer restaking', rewards: 'PUFFER', autoCompound: true },
            { id: 'kelp-staking', name: 'KELP Staking', token: 'KELP', icon: '🌿', apy: 18.0, minAmount: 300, minInvest: 25, lockPeriod: 14, tvl: 145000000, risk: 'medium', description: 'Kelp DAO rsETH', rewards: 'KELP', autoCompound: true },
            { id: 'renzo-staking', name: 'REZ Staking', token: 'REZ', icon: '🔄', apy: 20.0, minAmount: 500, minInvest: 20, lockPeriod: 7, tvl: 195000000, risk: 'medium', description: 'Renzo ezETH', rewards: 'REZ', autoCompound: true },
            { id: 'swell-staking', name: 'SWELL Staking', token: 'SWELL', icon: '🌊', apy: 22.0, minAmount: 400, minInvest: 25, lockPeriod: 14, tvl: 165000000, risk: 'medium', description: 'Swell swETH', rewards: 'SWELL', autoCompound: true },
            { id: 'etherfi-staking', name: 'ETHFI Staking', token: 'ETHFI', icon: '🔥', apy: 15.0, minAmount: 100, minInvest: 35, lockPeriod: 7, tvl: 285000000, risk: 'medium', description: 'ether.fi weETH', rewards: 'ETHFI', autoCompound: true },
            // Emerging L1s
            { id: 'sui-staking', name: 'SUI Staking', token: 'SUI', icon: '💧', apy: 4.0, minAmount: 100, minInvest: 30, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'Sui validators', rewards: 'SUI', autoCompound: true },
            { id: 'apt-staking', name: 'APT Staking', token: 'APT', icon: '🅰️', apy: 7.0, minAmount: 10, minInvest: 50, lockPeriod: 0, tvl: 385000000, risk: 'medium', description: 'Aptos validators', rewards: 'APT', autoCompound: true },
            { id: 'near-staking', name: 'NEAR Staking', token: 'NEAR', icon: '🌐', apy: 10.0, minAmount: 50, minInvest: 30, lockPeriod: 2, tvl: 385000000, risk: 'medium', description: 'NEAR validators', rewards: 'NEAR', autoCompound: true },
            { id: 'algo-staking', name: 'ALGO Staking', token: 'ALGO', icon: '🔷', apy: 6.0, minAmount: 100, minInvest: 25, lockPeriod: 0, tvl: 285000000, risk: 'low-medium', description: 'Algorand governance', rewards: 'ALGO', autoCompound: true },
            { id: 'hbar-staking', name: 'HBAR Staking', token: 'HBAR', icon: 'ℏ', apy: 5.0, minAmount: 1000, minInvest: 20, lockPeriod: 0, tvl: 385000000, risk: 'low-medium', description: 'Hedera staking', rewards: 'HBAR', autoCompound: true },
            // ══════ BATCH 21: DePIN + Social + Gaming L2 + RWA + Modular + Messaging + Prediction ══════
            // DePIN (Decentralized Physical Infrastructure)
            { id: 'hnt-staking', name: 'HNT Staking', token: 'HNT', icon: '📡', apy: 6.5, minAmount: 10, minInvest: 50, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'Helium network staking', rewards: 'HNT', autoCompound: true },
            { id: 'mobile-staking', name: 'MOBILE Staking', token: 'MOBILE', icon: '📱', apy: 12.0, minAmount: 10000, minInvest: 25, lockPeriod: 0, tvl: 185000000, risk: 'medium-high', description: 'Helium Mobile rewards', rewards: 'MOBILE', autoCompound: true },
            { id: 'theta-staking', name: 'THETA Staking', token: 'THETA', icon: '🎬', apy: 4.0, minAmount: 1000, minInvest: 40, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Theta edge nodes', rewards: 'TFUEL', autoCompound: false },
            { id: 'dimo-staking', name: 'DIMO Staking', token: 'DIMO', icon: '🚗', apy: 18.0, minAmount: 100, minInvest: 30, lockPeriod: 90, tvl: 125000000, risk: 'medium-high', description: 'Vehicle data network', rewards: 'DIMO', autoCompound: true },
            { id: 'iotx-staking', name: 'IOTX Staking', token: 'IOTX', icon: '🌐', apy: 8.0, minAmount: 100, minInvest: 20, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'IoTeX network staking', rewards: 'IOTX', autoCompound: true },
            // Social Tokens
            { id: 'degen-staking', name: 'DEGEN Staking', token: 'DEGEN', icon: '🎩', apy: 25.0, minAmount: 10000, minInvest: 20, lockPeriod: 7, tvl: 95000000, risk: 'high', description: 'Farcaster tipping token', rewards: 'DEGEN', autoCompound: true },
            { id: 'lens-staking', name: 'LENS Staking', token: 'LENS', icon: '🌿', apy: 15.0, minAmount: 100, minInvest: 50, lockPeriod: 30, tvl: 145000000, risk: 'medium-high', description: 'Lens Protocol governance', rewards: 'LENS', autoCompound: true },
            { id: 'gal-staking', name: 'GAL Staking', token: 'GAL', icon: '🌌', apy: 12.0, minAmount: 100, minInvest: 35, lockPeriod: 14, tvl: 125000000, risk: 'medium', description: 'Galxe credential network', rewards: 'GAL', autoCompound: true },
            { id: 'mask-staking', name: 'MASK Staking', token: 'MASK', icon: '🎭', apy: 10.0, minAmount: 50, minInvest: 40, lockPeriod: 7, tvl: 95000000, risk: 'medium', description: 'Mask Network Web3 bridge', rewards: 'MASK', autoCompound: true },
            { id: 'audio-staking', name: 'AUDIO Staking', token: 'AUDIO', icon: '🎵', apy: 8.0, minAmount: 500, minInvest: 25, lockPeriod: 0, tvl: 85000000, risk: 'medium', description: 'Audius music streaming', rewards: 'AUDIO', autoCompound: true },
            // Gaming L2s
            { id: 'beam-staking', name: 'BEAM Staking', token: 'BEAM', icon: '🎮', apy: 15.0, minAmount: 1000, minInvest: 30, lockPeriod: 14, tvl: 285000000, risk: 'medium-high', description: 'Merit Circle gaming chain', rewards: 'BEAM', autoCompound: true },
            { id: 'xai-staking', name: 'XAI Staking', token: 'XAI', icon: '⚔️', apy: 18.0, minAmount: 100, minInvest: 35, lockPeriod: 30, tvl: 185000000, risk: 'medium-high', description: 'Arbitrum gaming L3', rewards: 'XAI', autoCompound: true },
            { id: 'myria-staking', name: 'MYRIA Staking', token: 'MYRIA', icon: '🏰', apy: 20.0, minAmount: 5000, minInvest: 25, lockPeriod: 30, tvl: 95000000, risk: 'high', description: 'Myria gaming L2', rewards: 'MYRIA', autoCompound: true },
            { id: 'prime-staking', name: 'PRIME Staking', token: 'PRIME', icon: '🎯', apy: 12.0, minAmount: 10, minInvest: 100, lockPeriod: 90, tvl: 245000000, risk: 'medium', description: 'Echelon Prime gaming', rewards: 'PRIME', autoCompound: false },
            { id: 'magic-staking', name: 'MAGIC Staking', token: 'MAGIC', icon: '✨', apy: 22.0, minAmount: 100, minInvest: 40, lockPeriod: 14, tvl: 185000000, risk: 'medium-high', description: 'Treasure DAO gaming', rewards: 'MAGIC', autoCompound: true },
            // RWA Tokenization
            { id: 'ondo-staking', name: 'ONDO Staking', token: 'ONDO', icon: '🏛️', apy: 8.0, minAmount: 100, minInvest: 100, lockPeriod: 30, tvl: 485000000, risk: 'low-medium', description: 'Real world assets protocol', rewards: 'ONDO', autoCompound: true },
            { id: 'mpl-staking', name: 'MPL Staking', token: 'MPL', icon: '🍁', apy: 10.0, minAmount: 10, minInvest: 150, lockPeriod: 90, tvl: 285000000, risk: 'medium', description: 'Maple Finance lending', rewards: 'MPL', autoCompound: false },
            { id: 'tru-staking', name: 'TRU Staking', token: 'TRU', icon: '💎', apy: 12.0, minAmount: 1000, minInvest: 50, lockPeriod: 30, tvl: 185000000, risk: 'medium', description: 'TrueFi uncollateral lending', rewards: 'TRU', autoCompound: true },
            { id: 'cfg-staking', name: 'CFG Staking', token: 'CFG', icon: '🔗', apy: 9.0, minAmount: 500, minInvest: 40, lockPeriod: 21, tvl: 145000000, risk: 'medium', description: 'Centrifuge real assets', rewards: 'CFG', autoCompound: true },
            { id: 'gfi-staking', name: 'GFI Staking', token: 'GFI', icon: '🐦', apy: 11.0, minAmount: 100, minInvest: 75, lockPeriod: 90, tvl: 195000000, risk: 'medium', description: 'Goldfinch credit protocol', rewards: 'GFI', autoCompound: false },
            // Modular Blockchain
            { id: 'manta-staking', name: 'MANTA Staking', token: 'MANTA', icon: '🐙', apy: 14.0, minAmount: 100, minInvest: 40, lockPeriod: 14, tvl: 385000000, risk: 'medium', description: 'Manta Pacific L2', rewards: 'MANTA', autoCompound: true },
            { id: 'alt-staking', name: 'ALT Staking', token: 'ALT', icon: '🔺', apy: 16.0, minAmount: 500, minInvest: 35, lockPeriod: 21, tvl: 285000000, risk: 'medium-high', description: 'AltLayer restaked rollups', rewards: 'ALT', autoCompound: true },
            { id: 'dym-staking', name: 'DYM Staking', token: 'DYM', icon: '🎡', apy: 18.0, minAmount: 100, minInvest: 50, lockPeriod: 21, tvl: 245000000, risk: 'medium-high', description: 'Dymension RollApps', rewards: 'DYM', autoCompound: true },
            { id: 'saga-staking', name: 'SAGA Staking', token: 'SAGA', icon: '📜', apy: 15.0, minAmount: 100, minInvest: 45, lockPeriod: 14, tvl: 185000000, risk: 'medium-high', description: 'Saga chainlets', rewards: 'SAGA', autoCompound: true },
            { id: 'fuel-staking', name: 'FUEL Staking', token: 'FUEL', icon: '⛽', apy: 20.0, minAmount: 500, minInvest: 40, lockPeriod: 30, tvl: 195000000, risk: 'high', description: 'Fuel modular execution', rewards: 'FUEL', autoCompound: true },
            // Cross-chain Messaging
            { id: 'axl-staking', name: 'AXL Staking', token: 'AXL', icon: '🌉', apy: 10.0, minAmount: 100, minInvest: 35, lockPeriod: 7, tvl: 385000000, risk: 'medium', description: 'Axelar cross-chain', rewards: 'AXL', autoCompound: true },
            { id: 'zeta-staking', name: 'ZETA Staking', token: 'ZETA', icon: 'Ζ', apy: 12.0, minAmount: 100, minInvest: 30, lockPeriod: 14, tvl: 285000000, risk: 'medium', description: 'ZetaChain omnichain', rewards: 'ZETA', autoCompound: true },
            { id: 'w-staking', name: 'W Staking', token: 'W', icon: '🌀', apy: 8.0, minAmount: 500, minInvest: 50, lockPeriod: 21, tvl: 485000000, risk: 'medium', description: 'Wormhole bridge token', rewards: 'W', autoCompound: true },
            { id: 'lz-staking', name: 'ZRO Staking', token: 'ZRO', icon: '0️⃣', apy: 6.0, minAmount: 50, minInvest: 75, lockPeriod: 14, tvl: 585000000, risk: 'low-medium', description: 'LayerZero messaging', rewards: 'ZRO', autoCompound: true },
            { id: 'link-ccip-staking', name: 'LINK CCIP', token: 'LINK', icon: '🔗', apy: 5.5, minAmount: 100, minInvest: 100, lockPeriod: 0, tvl: 785000000, risk: 'low', description: 'Chainlink CCIP nodes', rewards: 'LINK', autoCompound: true },
            // ══════ BATCH 22: AI Agents + Memecoins + DEX Tokens + L2 Native + Privacy + Payments ══════
            // AI Agents & Autonomous
            { id: 'ai16z-staking', name: 'AI16Z Staking', token: 'AI16Z', icon: '🤖', apy: 35.0, minAmount: 100, minInvest: 50, lockPeriod: 14, tvl: 285000000, risk: 'high', description: 'AI agent framework token', rewards: 'AI16Z', autoCompound: true },
            { id: 'virtual-staking', name: 'VIRTUAL Staking', token: 'VIRTUAL', icon: '👾', apy: 28.0, minAmount: 500, minInvest: 40, lockPeriod: 7, tvl: 385000000, risk: 'high', description: 'Virtuals Protocol agents', rewards: 'VIRTUAL', autoCompound: true },
            { id: 'aixbt-staking', name: 'AIXBT Staking', token: 'AIXBT', icon: '📊', apy: 40.0, minAmount: 1000, minInvest: 30, lockPeriod: 7, tvl: 145000000, risk: 'high', description: 'AI trading agent', rewards: 'AIXBT', autoCompound: true },
            { id: 'griffain-staking', name: 'GRIFFAIN Staking', token: 'GRIFFAIN', icon: '🦅', apy: 45.0, minAmount: 5000, minInvest: 25, lockPeriod: 14, tvl: 95000000, risk: 'high', description: 'Solana AI agent', rewards: 'GRIFFAIN', autoCompound: true },
            { id: 'zerebro-staking', name: 'ZEREBRO Staking', token: 'ZEREBRO', icon: '🧠', apy: 50.0, minAmount: 1000, minInvest: 20, lockPeriod: 7, tvl: 125000000, risk: 'high', description: 'Autonomous AI agent', rewards: 'ZEREBRO', autoCompound: true },
            // Top Memecoins
            { id: 'pepe-staking', name: 'PEPE Staking', token: 'PEPE', icon: '🐸', apy: 15.0, minAmount: 1000000, minInvest: 20, lockPeriod: 0, tvl: 485000000, risk: 'high', description: 'Pepe memecoin staking', rewards: 'PEPE', autoCompound: true },
            { id: 'wif-staking', name: 'WIF Staking', token: 'WIF', icon: '🐕', apy: 18.0, minAmount: 100, minInvest: 25, lockPeriod: 0, tvl: 385000000, risk: 'high', description: 'Dogwifhat Solana meme', rewards: 'WIF', autoCompound: true },
            { id: 'bonk-staking', name: 'BONK Staking', token: 'BONK', icon: '🦴', apy: 12.0, minAmount: 10000000, minInvest: 15, lockPeriod: 0, tvl: 285000000, risk: 'high', description: 'Bonk Solana meme', rewards: 'BONK', autoCompound: true },
            { id: 'floki-staking', name: 'FLOKI Staking', token: 'FLOKI', icon: '⚔️', apy: 10.0, minAmount: 100000, minInvest: 20, lockPeriod: 30, tvl: 245000000, risk: 'high', description: 'Floki ecosystem', rewards: 'FLOKI', autoCompound: true },
            { id: 'shib-staking', name: 'SHIB Staking', token: 'SHIB', icon: '🐕‍🦺', apy: 5.0, minAmount: 10000000, minInvest: 25, lockPeriod: 0, tvl: 585000000, risk: 'medium-high', description: 'Shiba Inu staking', rewards: 'SHIB', autoCompound: true },
            // DEX Native Tokens
            { id: 'joe-staking', name: 'JOE Staking', token: 'JOE', icon: '🦜', apy: 18.0, minAmount: 100, minInvest: 30, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Trader Joe Avalanche', rewards: 'JOE', autoCompound: true },
            { id: 'cake-staking', name: 'CAKE Staking', token: 'CAKE', icon: '🥞', apy: 12.0, minAmount: 10, minInvest: 25, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'PancakeSwap staking', rewards: 'CAKE', autoCompound: true },
            { id: 'sushi-staking', name: 'SUSHI Staking', token: 'SUSHI', icon: '🍣', apy: 8.0, minAmount: 50, minInvest: 30, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'SushiSwap xSUSHI', rewards: 'SUSHI', autoCompound: true },
            { id: 'velo-staking', name: 'VELO Staking', token: 'VELO', icon: '🚴', apy: 22.0, minAmount: 1000, minInvest: 25, lockPeriod: 7, tvl: 285000000, risk: 'medium', description: 'Velodrome Optimism', rewards: 'VELO', autoCompound: true },
            { id: 'aero-staking', name: 'AERO Staking', token: 'AERO', icon: '✈️', apy: 25.0, minAmount: 500, minInvest: 30, lockPeriod: 7, tvl: 385000000, risk: 'medium', description: 'Aerodrome Base', rewards: 'AERO', autoCompound: true },
            // L2 Native Tokens
            { id: 'strk-staking', name: 'STRK Staking', token: 'STRK', icon: '⚡', apy: 8.0, minAmount: 100, minInvest: 50, lockPeriod: 21, tvl: 485000000, risk: 'medium', description: 'Starknet staking', rewards: 'STRK', autoCompound: true },
            { id: 'blast-staking', name: 'BLAST Staking', token: 'BLAST', icon: '💥', apy: 15.0, minAmount: 500, minInvest: 35, lockPeriod: 14, tvl: 385000000, risk: 'medium-high', description: 'Blast L2 native yield', rewards: 'BLAST', autoCompound: true },
            { id: 'mode-staking', name: 'MODE Staking', token: 'MODE', icon: '🎵', apy: 18.0, minAmount: 1000, minInvest: 25, lockPeriod: 14, tvl: 185000000, risk: 'medium-high', description: 'Mode Network L2', rewards: 'MODE', autoCompound: true },
            { id: 'scroll-staking', name: 'SCROLL Staking', token: 'SCROLL', icon: '📜', apy: 12.0, minAmount: 100, minInvest: 40, lockPeriod: 21, tvl: 285000000, risk: 'medium', description: 'Scroll zkEVM', rewards: 'SCROLL', autoCompound: true },
            { id: 'zksync-staking', name: 'ZK Staking', token: 'ZK', icon: '🔐', apy: 10.0, minAmount: 500, minInvest: 45, lockPeriod: 14, tvl: 585000000, risk: 'medium', description: 'zkSync Era token', rewards: 'ZK', autoCompound: true },
            // Privacy Coins
            { id: 'xmr-staking', name: 'XMR Staking', token: 'XMR', icon: '🔒', apy: 0, minAmount: 0.1, minInvest: 100, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Monero (PoW - hold only)', rewards: 'XMR', autoCompound: false },
            { id: 'zec-staking', name: 'ZEC Staking', token: 'ZEC', icon: '🛡️', apy: 0, minAmount: 0.5, minInvest: 75, lockPeriod: 0, tvl: 185000000, risk: 'medium', description: 'Zcash (PoW - hold only)', rewards: 'ZEC', autoCompound: false },
            { id: 'scrt-staking', name: 'SCRT Staking', token: 'SCRT', icon: '🤫', apy: 20.0, minAmount: 100, minInvest: 30, lockPeriod: 21, tvl: 95000000, risk: 'medium', description: 'Secret Network privacy', rewards: 'SCRT', autoCompound: true },
            { id: 'oasis-staking', name: 'ROSE Staking', token: 'ROSE', icon: '🌹', apy: 8.0, minAmount: 100, minInvest: 25, lockPeriod: 14, tvl: 185000000, risk: 'medium', description: 'Oasis Network privacy', rewards: 'ROSE', autoCompound: true },
            { id: 'nym-staking', name: 'NYM Staking', token: 'NYM', icon: '👤', apy: 15.0, minAmount: 500, minInvest: 35, lockPeriod: 14, tvl: 75000000, risk: 'medium-high', description: 'Nym mixnet privacy', rewards: 'NYM', autoCompound: true },
            // Payment Tokens
            { id: 'xlm-staking', name: 'XLM Staking', token: 'XLM', icon: '✨', apy: 4.0, minAmount: 1000, minInvest: 25, lockPeriod: 0, tvl: 485000000, risk: 'low', description: 'Stellar Lumens', rewards: 'XLM', autoCompound: true },
            { id: 'xrp-staking', name: 'XRP Staking', token: 'XRP', icon: '💧', apy: 3.0, minAmount: 500, minInvest: 50, lockPeriod: 0, tvl: 785000000, risk: 'low', description: 'Ripple staking', rewards: 'XRP', autoCompound: true },
            { id: 'ltc-staking', name: 'LTC Staking', token: 'LTC', icon: 'Ł', apy: 0, minAmount: 0.5, minInvest: 75, lockPeriod: 0, tvl: 385000000, risk: 'low', description: 'Litecoin (PoW - hold)', rewards: 'LTC', autoCompound: false },
            { id: 'bch-staking', name: 'BCH Staking', token: 'BCH', icon: '💚', apy: 0, minAmount: 0.1, minInvest: 100, lockPeriod: 0, tvl: 285000000, risk: 'low', description: 'Bitcoin Cash (PoW)', rewards: 'BCH', autoCompound: false },
            { id: 'celo-staking', name: 'CELO Staking', token: 'CELO', icon: '🌍', apy: 6.0, minAmount: 100, minInvest: 30, lockPeriod: 3, tvl: 185000000, risk: 'low-medium', description: 'Celo mobile payments', rewards: 'CELO', autoCompound: true },
            // ══════ BATCH 23: Perp DEX + Yield + LRT + Real Yield + Intent + Launchpad ══════
            // Perpetual DEX Tokens
            { id: 'hype-staking', name: 'HYPE Staking', token: 'HYPE', icon: '🔥', apy: 35.0, minAmount: 100, minInvest: 50, lockPeriod: 14, tvl: 485000000, risk: 'medium-high', description: 'Hyperliquid DEX token', rewards: 'HYPE', autoCompound: true },
            { id: 'vrtx-staking', name: 'VRTX Staking', token: 'VRTX', icon: '📐', apy: 28.0, minAmount: 500, minInvest: 40, lockPeriod: 7, tvl: 185000000, risk: 'medium-high', description: 'Vertex Protocol', rewards: 'VRTX', autoCompound: true },
            { id: 'aevo-staking', name: 'AEVO Staking', token: 'AEVO', icon: '🎯', apy: 22.0, minAmount: 100, minInvest: 45, lockPeriod: 14, tvl: 245000000, risk: 'medium', description: 'Aevo options DEX', rewards: 'AEVO', autoCompound: true },
            { id: 'drift-staking', name: 'DRIFT Staking', token: 'DRIFT', icon: '🌊', apy: 32.0, minAmount: 500, minInvest: 35, lockPeriod: 7, tvl: 145000000, risk: 'medium-high', description: 'Drift Protocol Solana', rewards: 'DRIFT', autoCompound: true },
            { id: 'kwenta-staking', name: 'KWENTA Staking', token: 'KWENTA', icon: '⚡', apy: 25.0, minAmount: 10, minInvest: 75, lockPeriod: 14, tvl: 95000000, risk: 'medium', description: 'Kwenta Synthetix perps', rewards: 'KWENTA', autoCompound: true },
            // Yield Protocol Tokens
            { id: 'pendle-staking', name: 'PENDLE Staking', token: 'PENDLE', icon: '⏳', apy: 18.0, minAmount: 50, minInvest: 50, lockPeriod: 7, tvl: 385000000, risk: 'medium', description: 'Pendle yield trading', rewards: 'PENDLE', autoCompound: true },
            { id: 'aura-staking', name: 'AURA Staking', token: 'AURA', icon: '✨', apy: 22.0, minAmount: 100, minInvest: 40, lockPeriod: 14, tvl: 185000000, risk: 'medium', description: 'Aura Balancer booster', rewards: 'AURA', autoCompound: true },
            { id: 'btrfly-staking', name: 'BTRFLY Staking', token: 'BTRFLY', icon: '🦋', apy: 28.0, minAmount: 1, minInvest: 100, lockPeriod: 14, tvl: 95000000, risk: 'medium-high', description: 'Redacted Cartel', rewards: 'BTRFLY', autoCompound: true },
            { id: 'jones-staking', name: 'JONES Staking', token: 'JONES', icon: '🎰', apy: 35.0, minAmount: 50, minInvest: 35, lockPeriod: 7, tvl: 75000000, risk: 'medium-high', description: 'Jones DAO vaults', rewards: 'JONES', autoCompound: true },
            { id: 'dpx-staking', name: 'DPX Staking', token: 'DPX', icon: '💎', apy: 15.0, minAmount: 1, minInvest: 150, lockPeriod: 30, tvl: 65000000, risk: 'medium', description: 'Dopex options', rewards: 'DPX', autoCompound: true },
            // Liquid Restaking Tokens (LRT)
            { id: 'ethfi-staking', name: 'ETHFI Staking', token: 'ETHFI', icon: '🔷', apy: 12.0, minAmount: 100, minInvest: 50, lockPeriod: 14, tvl: 385000000, risk: 'medium', description: 'ether.fi governance', rewards: 'ETHFI', autoCompound: true },
            { id: 'puffer-staking', name: 'PUFFER Staking', token: 'PUFFER', icon: '🐡', apy: 15.0, minAmount: 500, minInvest: 35, lockPeriod: 7, tvl: 245000000, risk: 'medium', description: 'Puffer Finance LRT', rewards: 'PUFFER', autoCompound: true },
            { id: 'rez-staking', name: 'REZ Staking', token: 'REZ', icon: '🔄', apy: 18.0, minAmount: 1000, minInvest: 30, lockPeriod: 14, tvl: 185000000, risk: 'medium-high', description: 'Renzo restaking', rewards: 'REZ', autoCompound: true },
            { id: 'kelp-staking', name: 'KELP Staking', token: 'KELP', icon: '🌿', apy: 20.0, minAmount: 500, minInvest: 25, lockPeriod: 7, tvl: 145000000, risk: 'medium-high', description: 'KelpDAO rsETH', rewards: 'KELP', autoCompound: true },
            { id: 'swell-staking', name: 'SWELL Staking', token: 'SWELL', icon: '🌊', apy: 16.0, minAmount: 1000, minInvest: 35, lockPeriod: 14, tvl: 195000000, risk: 'medium', description: 'Swell Network LRT', rewards: 'SWELL', autoCompound: true },
            // Real Yield Protocols
            { id: 'gmx-staking', name: 'GMX Staking', token: 'GMX', icon: '🔵', apy: 12.0, minAmount: 5, minInvest: 100, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'GMX esGMX + ETH/AVAX', rewards: 'GMX+ETH', autoCompound: false },
            { id: 'gns-staking', name: 'GNS Staking', token: 'GNS', icon: '💹', apy: 15.0, minAmount: 50, minInvest: 50, lockPeriod: 0, tvl: 145000000, risk: 'medium', description: 'gTrade real yield', rewards: 'GNS+DAI', autoCompound: false },
            { id: 'grail-staking', name: 'GRAIL Staking', token: 'GRAIL', icon: '🏆', apy: 25.0, minAmount: 1, minInvest: 150, lockPeriod: 14, tvl: 95000000, risk: 'medium-high', description: 'Camelot xGRAIL', rewards: 'GRAIL', autoCompound: true },
            { id: 'vela-staking', name: 'VELA Staking', token: 'VELA', icon: '⛵', apy: 20.0, minAmount: 100, minInvest: 40, lockPeriod: 7, tvl: 65000000, risk: 'medium-high', description: 'Vela Exchange', rewards: 'VELA+USDC', autoCompound: false },
            { id: 'hmx-staking', name: 'HMX Staking', token: 'HMX', icon: '🎮', apy: 28.0, minAmount: 500, minInvest: 30, lockPeriod: 14, tvl: 55000000, risk: 'medium-high', description: 'HMX Protocol', rewards: 'HMX', autoCompound: true },
            // Intent & Solver Protocols
            { id: 'cow-staking', name: 'COW Staking', token: 'COW', icon: '🐄', apy: 8.0, minAmount: 500, minInvest: 30, lockPeriod: 7, tvl: 145000000, risk: 'medium', description: 'CoW Protocol solver', rewards: 'COW', autoCompound: true },
            { id: 'across-staking', name: 'ACX Staking', token: 'ACX', icon: '🌉', apy: 15.0, minAmount: 500, minInvest: 35, lockPeriod: 14, tvl: 95000000, risk: 'medium', description: 'Across bridge staking', rewards: 'ACX', autoCompound: true },
            { id: 'hop-staking', name: 'HOP Staking', token: 'HOP', icon: '🐰', apy: 12.0, minAmount: 1000, minInvest: 25, lockPeriod: 7, tvl: 75000000, risk: 'medium', description: 'Hop Protocol bridge', rewards: 'HOP', autoCompound: true },
            { id: 'socket-staking', name: 'SOCKET Staking', token: 'SOCKET', icon: '🔌', apy: 18.0, minAmount: 5000, minInvest: 20, lockPeriod: 14, tvl: 55000000, risk: 'medium-high', description: 'Socket interop layer', rewards: 'SOCKET', autoCompound: true },
            { id: 'lifi-staking', name: 'LIFI Staking', token: 'LIFI', icon: '🔗', apy: 20.0, minAmount: 1000, minInvest: 25, lockPeriod: 7, tvl: 45000000, risk: 'medium-high', description: 'LI.FI aggregator', rewards: 'LIFI', autoCompound: true },
            // Launchpad Tokens
            { id: 'sfund-staking', name: 'SFUND Staking', token: 'SFUND', icon: '🚀', apy: 25.0, minAmount: 100, minInvest: 50, lockPeriod: 30, tvl: 85000000, risk: 'medium-high', description: 'Seedify launchpad', rewards: 'SFUND', autoCompound: true },
            { id: 'dao-staking', name: 'DAO Staking', token: 'DAO', icon: '🏛️', apy: 18.0, minAmount: 500, minInvest: 40, lockPeriod: 14, tvl: 65000000, risk: 'medium', description: 'DAO Maker IDO', rewards: 'DAO', autoCompound: true },
            { id: 'pols-staking', name: 'POLS Staking', token: 'POLS', icon: '⭐', apy: 15.0, minAmount: 250, minInvest: 35, lockPeriod: 7, tvl: 55000000, risk: 'medium', description: 'Polkastarter IDO', rewards: 'POLS', autoCompound: true },
            { id: 'paid-staking', name: 'PAID Staking', token: 'PAID', icon: '💳', apy: 12.0, minAmount: 1000, minInvest: 25, lockPeriod: 14, tvl: 35000000, risk: 'medium', description: 'PAID Network launch', rewards: 'PAID', autoCompound: true },
            { id: 'prime-staking', name: 'PRIME Staking', token: 'PRIME', icon: '🎮', apy: 10.0, minAmount: 10, minInvest: 100, lockPeriod: 30, tvl: 285000000, risk: 'medium', description: 'Echelon Prime gaming', rewards: 'PRIME', autoCompound: true },
            // ══════ BATCH 24: Cosmos + Polkadot + NFT + Gaming + Infrastructure + Insurance ══════
            // Cosmos Ecosystem
            { id: 'atom-staking', name: 'ATOM Staking', token: 'ATOM', icon: '⚛️', apy: 18.0, minAmount: 10, minInvest: 50, lockPeriod: 21, tvl: 1850000000, risk: 'medium', description: 'Cosmos Hub staking', rewards: 'ATOM', autoCompound: true },
            { id: 'osmo-staking', name: 'OSMO Staking', token: 'OSMO', icon: '🧪', apy: 12.0, minAmount: 50, minInvest: 35, lockPeriod: 14, tvl: 485000000, risk: 'medium', description: 'Osmosis DEX token', rewards: 'OSMO', autoCompound: true },
            { id: 'inj-staking', name: 'INJ Staking', token: 'INJ', icon: '💉', apy: 15.0, minAmount: 10, minInvest: 75, lockPeriod: 21, tvl: 785000000, risk: 'medium', description: 'Injective Protocol', rewards: 'INJ', autoCompound: true },
            { id: 'sei-staking', name: 'SEI Staking', token: 'SEI', icon: '🌊', apy: 8.0, minAmount: 100, minInvest: 40, lockPeriod: 21, tvl: 585000000, risk: 'medium', description: 'Sei Network L1', rewards: 'SEI', autoCompound: true },
            { id: 'kava-staking', name: 'KAVA Staking', token: 'KAVA', icon: '🔶', apy: 20.0, minAmount: 50, minInvest: 30, lockPeriod: 21, tvl: 285000000, risk: 'medium', description: 'Kava DeFi hub', rewards: 'KAVA', autoCompound: true },
            // Polkadot Ecosystem
            { id: 'dot-staking', name: 'DOT Staking', token: 'DOT', icon: '⬡', apy: 14.0, minAmount: 10, minInvest: 50, lockPeriod: 28, tvl: 2850000000, risk: 'medium', description: 'Polkadot relay chain', rewards: 'DOT', autoCompound: true },
            { id: 'ksm-staking', name: 'KSM Staking', token: 'KSM', icon: '🦜', apy: 18.0, minAmount: 1, minInvest: 75, lockPeriod: 7, tvl: 485000000, risk: 'medium-high', description: 'Kusama canary network', rewards: 'KSM', autoCompound: true },
            { id: 'astr-staking', name: 'ASTR Staking', token: 'ASTR', icon: '⭐', apy: 12.0, minAmount: 500, minInvest: 25, lockPeriod: 10, tvl: 185000000, risk: 'medium', description: 'Astar Network dApps', rewards: 'ASTR', autoCompound: true },
            { id: 'glmr-staking', name: 'GLMR Staking', token: 'GLMR', icon: '🌙', apy: 10.0, minAmount: 100, minInvest: 30, lockPeriod: 14, tvl: 145000000, risk: 'medium', description: 'Moonbeam EVM', rewards: 'GLMR', autoCompound: true },
            { id: 'aca-staking', name: 'ACA Staking', token: 'ACA', icon: '🔷', apy: 15.0, minAmount: 200, minInvest: 25, lockPeriod: 7, tvl: 95000000, risk: 'medium', description: 'Acala DeFi hub', rewards: 'ACA', autoCompound: true },
            // NFT Infrastructure
            { id: 'blur-staking', name: 'BLUR Staking', token: 'BLUR', icon: '🌫️', apy: 25.0, minAmount: 500, minInvest: 35, lockPeriod: 0, tvl: 285000000, risk: 'medium-high', description: 'Blur NFT marketplace', rewards: 'BLUR', autoCompound: true },
            { id: 'looks-staking', name: 'LOOKS Staking', token: 'LOOKS', icon: '👀', apy: 35.0, minAmount: 1000, minInvest: 25, lockPeriod: 0, tvl: 145000000, risk: 'high', description: 'LooksRare marketplace', rewards: 'LOOKS+WETH', autoCompound: false },
            { id: 'x2y2-staking', name: 'X2Y2 Staking', token: 'X2Y2', icon: '✖️', apy: 40.0, minAmount: 5000, minInvest: 20, lockPeriod: 0, tvl: 55000000, risk: 'high', description: 'X2Y2 marketplace', rewards: 'X2Y2+WETH', autoCompound: false },
            { id: 'sudo-staking', name: 'SUDO Staking', token: 'SUDO', icon: '🔲', apy: 18.0, minAmount: 100, minInvest: 40, lockPeriod: 14, tvl: 75000000, risk: 'medium-high', description: 'Sudoswap AMM NFT', rewards: 'SUDO', autoCompound: true },
            { id: 'rari-staking', name: 'RARI Staking', token: 'RARI', icon: '🎨', apy: 12.0, minAmount: 10, minInvest: 50, lockPeriod: 7, tvl: 45000000, risk: 'medium', description: 'Rarible DAO token', rewards: 'RARI', autoCompound: true },
            // Gaming Tokens
            { id: 'gala-staking', name: 'GALA Staking', token: 'GALA', icon: '🎮', apy: 8.0, minAmount: 5000, minInvest: 25, lockPeriod: 0, tvl: 385000000, risk: 'medium-high', description: 'Gala Games ecosystem', rewards: 'GALA', autoCompound: true },
            { id: 'imx-staking', name: 'IMX Staking', token: 'IMX', icon: '💎', apy: 6.0, minAmount: 100, minInvest: 50, lockPeriod: 14, tvl: 585000000, risk: 'medium', description: 'ImmutableX NFT L2', rewards: 'IMX', autoCompound: true },
            { id: 'ron-staking', name: 'RON Staking', token: 'RON', icon: '⚔️', apy: 12.0, minAmount: 100, minInvest: 40, lockPeriod: 7, tvl: 385000000, risk: 'medium', description: 'Ronin Axie chain', rewards: 'RON', autoCompound: true },
            { id: 'beam-staking', name: 'BEAM Staking', token: 'BEAM', icon: '🕹️', apy: 15.0, minAmount: 1000, minInvest: 30, lockPeriod: 14, tvl: 185000000, risk: 'medium-high', description: 'Beam gaming chain', rewards: 'BEAM', autoCompound: true },
            { id: 'pixel-staking', name: 'PIXEL Staking', token: 'PIXEL', icon: '👾', apy: 22.0, minAmount: 500, minInvest: 25, lockPeriod: 7, tvl: 95000000, risk: 'high', description: 'Pixels game token', rewards: 'PIXEL', autoCompound: true },
            // Infrastructure Tokens
            { id: 'grt-staking', name: 'GRT Staking', token: 'GRT', icon: '📊', apy: 10.0, minAmount: 1000, minInvest: 25, lockPeriod: 28, tvl: 585000000, risk: 'medium', description: 'The Graph indexing', rewards: 'GRT', autoCompound: true },
            { id: 'fil-staking', name: 'FIL Staking', token: 'FIL', icon: '📁', apy: 8.0, minAmount: 10, minInvest: 50, lockPeriod: 0, tvl: 485000000, risk: 'medium', description: 'Filecoin storage', rewards: 'FIL', autoCompound: true },
            { id: 'ar-staking', name: 'AR Staking', token: 'AR', icon: '🗄️', apy: 5.0, minAmount: 5, minInvest: 75, lockPeriod: 0, tvl: 285000000, risk: 'medium', description: 'Arweave permanent', rewards: 'AR', autoCompound: true },
            { id: 'storj-staking', name: 'STORJ Staking', token: 'STORJ', icon: '☁️', apy: 8.0, minAmount: 500, minInvest: 30, lockPeriod: 0, tvl: 95000000, risk: 'medium', description: 'Storj cloud storage', rewards: 'STORJ', autoCompound: true },
            { id: 'pokt-staking', name: 'POKT Staking', token: 'POKT', icon: '🔌', apy: 25.0, minAmount: 100, minInvest: 35, lockPeriod: 21, tvl: 145000000, risk: 'medium-high', description: 'Pocket Network RPC', rewards: 'POKT', autoCompound: true },
            // Insurance Protocols
            { id: 'nxm-staking', name: 'NXM Staking', token: 'NXM', icon: '🛡️', apy: 8.0, minAmount: 1, minInvest: 200, lockPeriod: 90, tvl: 285000000, risk: 'low-medium', description: 'Nexus Mutual cover', rewards: 'NXM', autoCompound: true },
            { id: 'insr-staking', name: 'INSR Staking', token: 'INSR', icon: '🏥', apy: 15.0, minAmount: 1000, minInvest: 30, lockPeriod: 30, tvl: 45000000, risk: 'medium', description: 'InsurAce protocol', rewards: 'INSR', autoCompound: true },
            { id: 'ease-staking', name: 'EASE Staking', token: 'EASE', icon: '🔒', apy: 12.0, minAmount: 5000, minInvest: 25, lockPeriod: 14, tvl: 35000000, risk: 'medium', description: 'Ease DeFi cover', rewards: 'EASE', autoCompound: true },
            { id: 'uno-staking', name: 'UNO Staking', token: 'UNO', icon: '☂️', apy: 18.0, minAmount: 500, minInvest: 35, lockPeriod: 21, tvl: 55000000, risk: 'medium-high', description: 'Uno Re reinsurance', rewards: 'UNO', autoCompound: true },
            { id: 'cover-staking', name: 'COVER Staking', token: 'COVER', icon: '🏠', apy: 10.0, minAmount: 10, minInvest: 50, lockPeriod: 7, tvl: 25000000, risk: 'medium', description: 'Cover Protocol', rewards: 'COVER', autoCompound: true }
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
            },
            {
                id: 'arb-eth-pool',
                name: 'ARB/ETH',
                tokens: ['ARB', 'ETH'],
                icons: ['🔵', '⟠'],
                apy: 45.2,
                apr: 38.5,
                feeApr: 18.5,
                rewardApr: 20.0,
                tvl: 180000000,
                volume24h: 52000000,
                fee: 0.3,
                risk: 'high',
                impermanentLoss: 'High IL risk',
                protocol: 'Camelot'
            },
            {
                id: 'gmx-eth-pool',
                name: 'GMX/ETH',
                tokens: ['GMX', 'ETH'],
                icons: ['🔷', '⟠'],
                apy: 38.5,
                apr: 32.1,
                feeApr: 12.1,
                rewardApr: 20.0,
                tvl: 95000000,
                volume24h: 28000000,
                fee: 0.3,
                risk: 'medium-high',
                impermanentLoss: 'High IL risk',
                protocol: 'Camelot'
            },
            {
                id: 'link-eth-pool',
                name: 'LINK/ETH',
                tokens: ['LINK', 'ETH'],
                icons: ['🔗', '⟠'],
                apy: 22.8,
                apr: 19.5,
                feeApr: 9.5,
                rewardApr: 10.0,
                tvl: 145000000,
                volume24h: 35000000,
                fee: 0.3,
                risk: 'medium',
                impermanentLoss: 'Medium IL',
                protocol: 'Uniswap V3'
            },
            {
                id: 'pepe-eth-pool',
                name: 'PEPE/ETH',
                tokens: ['PEPE', 'ETH'],
                icons: ['🐸', '⟠'],
                apy: 185.5,
                apr: 142.0,
                feeApr: 82.0,
                rewardApr: 60.0,
                tvl: 45000000,
                volume24h: 125000000,
                fee: 1.0,
                risk: 'high',
                impermanentLoss: 'Extreme IL risk - Meme',
                protocol: 'Uniswap V3'
            },
            {
                id: 'wif-sol-pool',
                name: 'WIF/SOL',
                tokens: ['WIF', 'SOL'],
                icons: ['🐕', '◎'],
                apy: 220.0,
                apr: 180.0,
                feeApr: 120.0,
                rewardApr: 60.0,
                tvl: 28000000,
                volume24h: 85000000,
                fee: 1.0,
                risk: 'high',
                impermanentLoss: 'Extreme IL - Meme',
                protocol: 'Raydium'
            },
            {
                id: 'jup-usdc-pool',
                name: 'JUP/USDC',
                tokens: ['JUP', 'USDC'],
                icons: ['🪐', '$'],
                apy: 65.0,
                apr: 52.0,
                feeApr: 32.0,
                rewardApr: 20.0,
                tvl: 85000000,
                volume24h: 42000000,
                fee: 0.3,
                risk: 'medium-high',
                impermanentLoss: 'High IL',
                protocol: 'Orca'
            },
            {
                id: 'ondo-usdc-pool',
                name: 'ONDO/USDC',
                tokens: ['ONDO', 'USDC'],
                icons: ['🏛️', '$'],
                apy: 42.5,
                apr: 35.0,
                feeApr: 15.0,
                rewardApr: 20.0,
                tvl: 65000000,
                volume24h: 18000000,
                fee: 0.3,
                risk: 'medium',
                impermanentLoss: 'Medium IL',
                protocol: 'Uniswap V3'
            },
            {
                id: 'pendle-eth-pool',
                name: 'PENDLE/ETH',
                tokens: ['PENDLE', 'ETH'],
                icons: ['⚡', '⟠'],
                apy: 55.0,
                apr: 45.0,
                feeApr: 25.0,
                rewardApr: 20.0,
                tvl: 72000000,
                volume24h: 22000000,
                fee: 0.3,
                risk: 'medium-high',
                impermanentLoss: 'High IL',
                protocol: 'Balancer'
            },
            {
                id: 'mkr-dai-pool',
                name: 'MKR/DAI',
                tokens: ['MKR', 'DAI'],
                icons: ['Ⓜ️', '◈'],
                apy: 18.5,
                apr: 15.2,
                feeApr: 10.2,
                rewardApr: 5.0,
                tvl: 120000000,
                volume24h: 15000000,
                fee: 0.3,
                risk: 'medium',
                impermanentLoss: 'Medium IL',
                protocol: 'Uniswap V3'
            },
            // === NEW POOLS BATCH ===
            { id: 'avax-usdc-pool', name: 'AVAX/USDC', tokens: ['AVAX', 'USDC'], icons: ['🔺', '$'], apy: 28.5, apr: 24.0, feeApr: 14.0, rewardApr: 10.0, tvl: 95000000, volume24h: 32000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Trader Joe' },
            { id: 'matic-eth-pool', name: 'MATIC/ETH', tokens: ['MATIC', 'ETH'], icons: ['⬡', '⟠'], apy: 24.2, apr: 20.5, feeApr: 12.5, rewardApr: 8.0, tvl: 180000000, volume24h: 45000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Quickswap' },
            { id: 'atom-osmo-pool', name: 'ATOM/OSMO', tokens: ['ATOM', 'OSMO'], icons: ['⚛', '🌊'], apy: 35.0, apr: 30.0, feeApr: 10.0, rewardApr: 20.0, tvl: 120000000, volume24h: 28000000, fee: 0.2, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'sui-usdc-pool', name: 'SUI/USDC', tokens: ['SUI', 'USDC'], icons: ['💧', '$'], apy: 85.0, apr: 72.0, feeApr: 42.0, rewardApr: 30.0, tvl: 45000000, volume24h: 65000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Cetus' },
            { id: 'apt-usdc-pool', name: 'APT/USDC', tokens: ['APT', 'USDC'], icons: ['🔷', '$'], apy: 48.5, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 68000000, volume24h: 38000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Pancake' },
            { id: 'sei-usdc-pool', name: 'SEI/USDC', tokens: ['SEI', 'USDC'], icons: ['🌊', '$'], apy: 95.0, apr: 82.0, feeApr: 52.0, rewardApr: 30.0, tvl: 35000000, volume24h: 48000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Astroport' },
            { id: 'inj-usdt-pool', name: 'INJ/USDT', tokens: ['INJ', 'USDT'], icons: ['💉', '₮'], apy: 52.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 55000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Helix' },
            { id: 'tia-usdc-pool', name: 'TIA/USDC', tokens: ['TIA', 'USDC'], icons: ['✨', '$'], apy: 125.0, apr: 105.0, feeApr: 55.0, rewardApr: 50.0, tvl: 28000000, volume24h: 42000000, fee: 0.3, risk: 'high', impermanentLoss: 'Extreme IL', protocol: 'Osmosis' },
            { id: 'stx-usdc-pool', name: 'STX/USDC', tokens: ['STX', 'USDC'], icons: ['📦', '$'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 42000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Velar' },
            { id: 'rune-eth-pool', name: 'RUNE/ETH', tokens: ['RUNE', 'ETH'], icons: ['⚔️', '⟠'], apy: 42.5, apr: 36.0, feeApr: 21.0, rewardApr: 15.0, tvl: 85000000, volume24h: 32000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Thorchain' },
            { id: 'ldo-eth-pool', name: 'LDO/ETH', tokens: ['LDO', 'ETH'], icons: ['🔵', '⟠'], apy: 32.0, apr: 27.0, feeApr: 15.0, rewardApr: 12.0, tvl: 95000000, volume24h: 25000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'crv-eth-pool', name: 'CRV/ETH', tokens: ['CRV', 'ETH'], icons: ['🔴', '⟠'], apy: 28.5, apr: 24.0, feeApr: 12.0, rewardApr: 12.0, tvl: 125000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            { id: 'aave-eth-pool', name: 'AAVE/ETH', tokens: ['AAVE', 'ETH'], icons: ['👻', '⟠'], apy: 22.0, apr: 18.5, feeApr: 10.5, rewardApr: 8.0, tvl: 145000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'uni-eth-pool', name: 'UNI/ETH', tokens: ['UNI', 'ETH'], icons: ['🦄', '⟠'], apy: 25.0, apr: 21.0, feeApr: 13.0, rewardApr: 8.0, tvl: 165000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'snx-eth-pool', name: 'SNX/ETH', tokens: ['SNX', 'ETH'], icons: ['⚡', '⟠'], apy: 35.0, apr: 30.0, feeApr: 15.0, rewardApr: 15.0, tvl: 65000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Velodrome' },
            { id: 'op-eth-pool', name: 'OP/ETH', tokens: ['OP', 'ETH'], icons: ['🔴', '⟠'], apy: 38.5, apr: 32.0, feeApr: 17.0, rewardApr: 15.0, tvl: 125000000, volume24h: 45000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Velodrome' },
            { id: 'blur-eth-pool', name: 'BLUR/ETH', tokens: ['BLUR', 'ETH'], icons: ['🟠', '⟠'], apy: 65.0, apr: 55.0, feeApr: 35.0, rewardApr: 20.0, tvl: 38000000, volume24h: 28000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'bonk-sol-pool', name: 'BONK/SOL', tokens: ['BONK', 'SOL'], icons: ['🐕', '◎'], apy: 180.0, apr: 150.0, feeApr: 100.0, rewardApr: 50.0, tvl: 22000000, volume24h: 75000000, fee: 1.0, risk: 'high', impermanentLoss: 'Extreme IL - Meme', protocol: 'Raydium' },
            { id: 'pyth-usdc-pool', name: 'PYTH/USDC', tokens: ['PYTH', 'USDC'], icons: ['🔮', '$'], apy: 55.0, apr: 46.0, feeApr: 26.0, rewardApr: 20.0, tvl: 48000000, volume24h: 32000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Orca' },
            { id: 'fet-eth-pool', name: 'FET/ETH', tokens: ['FET', 'ETH'], icons: ['🤖', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 52000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'rndr-eth-pool', name: 'RNDR/ETH', tokens: ['RNDR', 'ETH'], icons: ['🎨', '⟠'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 68000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'manta-eth-pool', name: 'MANTA/ETH', tokens: ['MANTA', 'ETH'], icons: ['🐋', '⟠'], apy: 72.0, apr: 62.0, feeApr: 32.0, rewardApr: 30.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Quickswap' },
            { id: 'zeta-eth-pool', name: 'ZETA/ETH', tokens: ['ZETA', 'ETH'], icons: ['⚡', '⟠'], apy: 85.0, apr: 72.0, feeApr: 42.0, rewardApr: 30.0, tvl: 25000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'strk-eth-pool', name: 'STRK/ETH', tokens: ['STRK', 'ETH'], icons: ['⚡', '⟠'], apy: 95.0, apr: 82.0, feeApr: 45.0, rewardApr: 37.0, tvl: 28000000, volume24h: 35000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Jediswap' },
            // === POOLS BATCH 2 ===
            { id: 'ton-usdt-pool', name: 'TON/USDT', tokens: ['TON', 'USDT'], icons: ['💎', '₮'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 85000000, volume24h: 42000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'STON.fi' },
            { id: 'dym-usdc-pool', name: 'DYM/USDC', tokens: ['DYM', 'USDC'], icons: ['🌀', '$'], apy: 120.0, apr: 98.0, feeApr: 48.0, rewardApr: 50.0, tvl: 18000000, volume24h: 25000000, fee: 0.3, risk: 'high', impermanentLoss: 'Extreme IL', protocol: 'Osmosis' },
            { id: 'kas-usdt-pool', name: 'KAS/USDT', tokens: ['KAS', 'USDT'], icons: ['🔷', '₮'], apy: 85.0, apr: 72.0, feeApr: 52.0, rewardApr: 20.0, tvl: 22000000, volume24h: 45000000, fee: 0.5, risk: 'high', impermanentLoss: 'High IL', protocol: 'MEXC' },
            { id: 'jto-sol-pool', name: 'JTO/SOL', tokens: ['JTO', 'SOL'], icons: ['🟠', '◎'], apy: 75.0, apr: 62.0, feeApr: 35.0, rewardApr: 27.0, tvl: 32000000, volume24h: 28000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Orca' },
            { id: 'jup-sol-pool', name: 'JUP/SOL', tokens: ['JUP', 'SOL'], icons: ['🪐', '◎'], apy: 58.0, apr: 48.0, feeApr: 28.0, rewardApr: 20.0, tvl: 95000000, volume24h: 55000000, fee: 0.25, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Orca' },
            { id: 'w-usdc-pool', name: 'W/USDC', tokens: ['W', 'USDC'], icons: ['🪱', '$'], apy: 145.0, apr: 120.0, feeApr: 70.0, rewardApr: 50.0, tvl: 25000000, volume24h: 48000000, fee: 0.3, risk: 'high', impermanentLoss: 'Extreme IL', protocol: 'Raydium' },
            { id: 'ethfi-eth-pool', name: 'ETHFI/ETH', tokens: ['ETHFI', 'ETH'], icons: ['🔷', '⟠'], apy: 82.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Balancer' },
            { id: 'ena-usde-pool', name: 'ENA/USDe', tokens: ['ENA', 'USDe'], icons: ['E', 'E'], apy: 95.0, apr: 78.0, feeApr: 38.0, rewardApr: 40.0, tvl: 42000000, volume24h: 32000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Curve' },
            { id: 'alt-eth-pool', name: 'ALT/ETH', tokens: ['ALT', 'ETH'], icons: ['A', '⟠'], apy: 68.0, apr: 55.0, feeApr: 30.0, rewardApr: 25.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'pixel-usdc-pool', name: 'PIXEL/USDC', tokens: ['PIXEL', 'USDC'], icons: ['🟣', '$'], apy: 125.0, apr: 105.0, feeApr: 55.0, rewardApr: 50.0, tvl: 18000000, volume24h: 28000000, fee: 0.3, risk: 'high', impermanentLoss: 'Extreme IL', protocol: 'Raydium' },
            { id: 'portal-eth-pool', name: 'PORTAL/ETH', tokens: ['PORTAL', 'ETH'], icons: ['🌀', '⟠'], apy: 88.0, apr: 72.0, feeApr: 42.0, rewardApr: 30.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'steth-wsteth-pool', name: 'stETH/wstETH', tokens: ['stETH', 'wstETH'], icons: ['⟠', '⟠'], apy: 3.5, apr: 3.2, feeApr: 0.8, rewardApr: 2.4, tvl: 580000000, volume24h: 15000000, fee: 0.01, risk: 'very-low', impermanentLoss: 'Minimal', protocol: 'Curve' },
            { id: 'frxeth-eth-pool', name: 'frxETH/ETH', tokens: ['frxETH', 'ETH'], icons: ['F', '⟠'], apy: 6.2, apr: 5.8, feeApr: 2.0, rewardApr: 3.8, tvl: 320000000, volume24h: 25000000, fee: 0.04, risk: 'low', impermanentLoss: 'Minimal', protocol: 'Curve' },
            { id: 'reth-weth-pool', name: 'rETH/WETH', tokens: ['rETH', 'WETH'], icons: ['🚀', '⟠'], apy: 5.5, apr: 5.2, feeApr: 1.8, rewardApr: 3.4, tvl: 280000000, volume24h: 18000000, fee: 0.04, risk: 'low', impermanentLoss: 'Minimal', protocol: 'Balancer' },
            { id: 'dai-usdc-pool', name: 'DAI/USDC', tokens: ['DAI', 'USDC'], icons: ['◈', '$'], apy: 6.5, apr: 6.2, feeApr: 6.2, rewardApr: 0, tvl: 450000000, volume24h: 125000000, fee: 0.01, risk: 'very-low', impermanentLoss: 'Negligible', protocol: 'Curve' },
            { id: 'frax-usdc-pool', name: 'FRAX/USDC', tokens: ['FRAX', 'USDC'], icons: ['F', '$'], apy: 7.2, apr: 6.8, feeApr: 5.8, rewardApr: 1.0, tvl: 380000000, volume24h: 95000000, fee: 0.01, risk: 'very-low', impermanentLoss: 'Negligible', protocol: 'Curve' },
            { id: 'lusd-3pool', name: 'LUSD/3Pool', tokens: ['LUSD', '3Pool'], icons: ['L', '$'], apy: 8.5, apr: 8.0, feeApr: 4.5, rewardApr: 3.5, tvl: 125000000, volume24h: 35000000, fee: 0.04, risk: 'low', impermanentLoss: 'Minimal', protocol: 'Curve' },
            { id: 'mkr-eth-pool', name: 'MKR/ETH', tokens: ['MKR', 'ETH'], icons: ['Ⓜ️', '⟠'], apy: 18.5, apr: 15.0, feeApr: 10.0, rewardApr: 5.0, tvl: 85000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'comp-eth-pool', name: 'COMP/ETH', tokens: ['COMP', 'ETH'], icons: ['🟢', '⟠'], apy: 22.0, apr: 18.5, feeApr: 10.5, rewardApr: 8.0, tvl: 55000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'yfi-eth-pool', name: 'YFI/ETH', tokens: ['YFI', 'ETH'], icons: ['🔵', '⟠'], apy: 15.0, apr: 12.5, feeApr: 8.0, rewardApr: 4.5, tvl: 42000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Sushi' },
            { id: 'bal-eth-pool', name: 'BAL/ETH', tokens: ['BAL', 'ETH'], icons: ['⚖️', '⟠'], apy: 28.0, apr: 24.0, feeApr: 12.0, rewardApr: 12.0, tvl: 68000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: '1inch-eth-pool', name: '1INCH/ETH', tokens: ['1INCH', 'ETH'], icons: ['🦄', '⟠'], apy: 25.0, apr: 21.0, feeApr: 12.0, rewardApr: 9.0, tvl: 45000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: '1inch' },
            { id: 'dydx-usdc-pool', name: 'DYDX/USDC', tokens: ['DYDX', 'USDC'], icons: ['📊', '$'], apy: 35.0, apr: 29.0, feeApr: 17.0, rewardApr: 12.0, tvl: 58000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'gns-eth-pool', name: 'GNS/ETH', tokens: ['GNS', 'ETH'], icons: ['📈', '⟠'], apy: 45.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 32000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'rdnt-eth-pool', name: 'RDNT/ETH', tokens: ['RDNT', 'ETH'], icons: ['☀️', '⟠'], apy: 52.0, apr: 44.0, feeApr: 24.0, rewardApr: 20.0, tvl: 28000000, volume24h: 15000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'magic-eth-pool', name: 'MAGIC/ETH', tokens: ['MAGIC', 'ETH'], icons: ['✨', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 42000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Sushi' },
            { id: 'grail-eth-pool', name: 'GRAIL/ETH', tokens: ['GRAIL', 'ETH'], icons: ['🏆', '⟠'], apy: 65.0, apr: 55.0, feeApr: 30.0, rewardApr: 25.0, tvl: 25000000, volume24h: 12000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'joe-avax-pool', name: 'JOE/AVAX', tokens: ['JOE', 'AVAX'], icons: ['🔺', '🔺'], apy: 55.0, apr: 46.0, feeApr: 26.0, rewardApr: 20.0, tvl: 35000000, volume24h: 18000000, fee: 0.25, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Trader Joe' },
            { id: 'png-avax-pool', name: 'PNG/AVAX', tokens: ['PNG', 'AVAX'], icons: ['🐧', '🔺'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 25000000, volume24h: 12000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Pangolin' },
            // === POOLS BATCH 3 ===
            { id: 'floki-eth-pool', name: 'FLOKI/ETH', tokens: ['FLOKI', 'ETH'], icons: ['🐕', '⟠'], apy: 145.0, apr: 120.0, feeApr: 75.0, rewardApr: 45.0, tvl: 18000000, volume24h: 55000000, fee: 1.0, risk: 'high', impermanentLoss: 'Extreme IL - Meme', protocol: 'Uniswap V3' },
            { id: 'shib-eth-pool', name: 'SHIB/ETH', tokens: ['SHIB', 'ETH'], icons: ['🐕', '⟠'], apy: 85.0, apr: 70.0, feeApr: 45.0, rewardApr: 25.0, tvl: 45000000, volume24h: 85000000, fee: 0.3, risk: 'high', impermanentLoss: 'Extreme IL - Meme', protocol: 'ShibaSwap' },
            { id: 'doge-usdt-pool', name: 'DOGE/USDT', tokens: ['DOGE', 'USDT'], icons: ['🐕', '₮'], apy: 35.0, apr: 28.0, feeApr: 18.0, rewardApr: 10.0, tvl: 65000000, volume24h: 125000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Binance' },
            { id: 'xrp-usdt-pool', name: 'XRP/USDT', tokens: ['XRP', 'USDT'], icons: ['X', '₮'], apy: 18.0, apr: 15.0, feeApr: 12.0, rewardApr: 3.0, tvl: 125000000, volume24h: 250000000, fee: 0.2, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Gate.io' },
            { id: 'ada-usdt-pool', name: 'ADA/USDT', tokens: ['ADA', 'USDT'], icons: ['₳', '₮'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 85000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Minswap' },
            { id: 'near-usdc-pool', name: 'NEAR/USDC', tokens: ['NEAR', 'USDC'], icons: ['N', '$'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Ref Finance' },
            { id: 'ftm-usdc-pool', name: 'FTM/USDC', tokens: ['FTM', 'USDC'], icons: ['👻', '$'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'SpookySwap' },
            { id: 'hbar-usdc-pool', name: 'HBAR/USDC', tokens: ['HBAR', 'USDC'], icons: ['ℏ', '$'], apy: 28.0, apr: 23.0, feeApr: 15.0, rewardApr: 8.0, tvl: 45000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SaucerSwap' },
            { id: 'algo-usdc-pool', name: 'ALGO/USDC', tokens: ['ALGO', 'USDC'], icons: ['◇', '$'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 55000000, volume24h: 25000000, fee: 0.25, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Tinyman' },
            { id: 'xtz-usdt-pool', name: 'XTZ/USDT', tokens: ['XTZ', 'USDT'], icons: ['ꜩ', '₮'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 35000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Plenty' },
            { id: 'egld-usdc-pool', name: 'EGLD/USDC', tokens: ['EGLD', 'USDC'], icons: ['⚡', '$'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 42000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Maiar' },
            { id: 'kava-usdt-pool', name: 'KAVA/USDT', tokens: ['KAVA', 'USDT'], icons: ['🔥', '₮'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 28000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Kava Swap' },
            { id: 'rose-usdt-pool', name: 'ROSE/USDT', tokens: ['ROSE', 'USDT'], icons: ['🌹', '₮'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 22000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Oasis' },
            { id: 'celo-usdc-pool', name: 'CELO/USDC', tokens: ['CELO', 'USDC'], icons: ['🟢', '$'], apy: 28.0, apr: 23.0, feeApr: 13.0, rewardApr: 10.0, tvl: 32000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Ubeswap' },
            { id: 'icp-usdt-pool', name: 'ICP/USDT', tokens: ['ICP', 'USDT'], icons: ['♾️', '₮'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 48000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'ICPSwap' },
            { id: 'axs-eth-pool', name: 'AXS/ETH', tokens: ['AXS', 'ETH'], icons: ['🎮', '⟠'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'sand-eth-pool', name: 'SAND/ETH', tokens: ['SAND', 'ETH'], icons: ['🏖️', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'mana-eth-pool', name: 'MANA/ETH', tokens: ['MANA', 'ETH'], icons: ['🌐', '⟠'], apy: 32.0, apr: 26.0, feeApr: 15.0, rewardApr: 11.0, tvl: 25000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'gala-eth-pool', name: 'GALA/ETH', tokens: ['GALA', 'ETH'], icons: ['🎲', '⟠'], apy: 55.0, apr: 45.0, feeApr: 28.0, rewardApr: 17.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'imx-eth-pool', name: 'IMX/ETH', tokens: ['IMX', 'ETH'], icons: ['🎮', '⟠'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 38000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            // === POOLS BATCH 4 ===
            { id: 'strk-eth-pool', name: 'STRK/ETH', tokens: ['STRK', 'ETH'], icons: ['⚡', '⟠'], apy: 75.0, apr: 62.0, feeApr: 25.0, rewardApr: 37.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Ekubo' },
            { id: 'zk-eth-pool', name: 'ZK/ETH', tokens: ['ZK', 'ETH'], icons: ['🔐', '⟠'], apy: 55.0, apr: 45.0, feeApr: 20.0, rewardApr: 25.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'SyncSwap' },
            { id: 'manta-eth-pool', name: 'MANTA/ETH', tokens: ['MANTA', 'ETH'], icons: ['🐋', '⟠'], apy: 65.0, apr: 52.0, feeApr: 22.0, rewardApr: 30.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Aperture' },
            { id: 'dym-usdc-pool', name: 'DYM/USDC', tokens: ['DYM', 'USDC'], icons: ['🌀', '$'], apy: 120.0, apr: 95.0, feeApr: 35.0, rewardApr: 60.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Dymension DEX' },
            { id: 'pyth-usdc-pool', name: 'PYTH/USDC', tokens: ['PYTH', 'USDC'], icons: ['🐍', '$'], apy: 55.0, apr: 42.0, feeApr: 18.0, rewardApr: 24.0, tvl: 45000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Jupiter' },
            { id: 'jup-sol-pool', name: 'JUP/SOL', tokens: ['JUP', 'SOL'], icons: ['🪐', '◎'], apy: 48.0, apr: 38.0, feeApr: 18.0, rewardApr: 20.0, tvl: 85000000, volume24h: 55000000, fee: 0.25, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Orca' },
            { id: 'ethfi-eth-pool', name: 'ETHFI/ETH', tokens: ['ETHFI', 'ETH'], icons: ['🔷', '⟠'], apy: 42.0, apr: 35.0, feeApr: 15.0, rewardApr: 20.0, tvl: 32000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'eigen-eth-pool', name: 'EIGEN/ETH', tokens: ['EIGEN', 'ETH'], icons: ['🔄', '⟠'], apy: 35.0, apr: 28.0, feeApr: 12.0, rewardApr: 16.0, tvl: 125000000, volume24h: 75000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ena-usde-pool', name: 'ENA/USDe', tokens: ['ENA', 'USDe'], icons: ['E', 'E'], apy: 85.0, apr: 68.0, feeApr: 28.0, rewardApr: 40.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Curve' },
            { id: 'pendle-eth-pool', name: 'PENDLE/ETH', tokens: ['PENDLE', 'ETH'], icons: ['📈', '⟠'], apy: 55.0, apr: 45.0, feeApr: 20.0, rewardApr: 25.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Balancer' },
            { id: 'ondo-usdc-pool', name: 'ONDO/USDC', tokens: ['ONDO', 'USDC'], icons: ['🏛️', '$'], apy: 42.0, apr: 35.0, feeApr: 15.0, rewardApr: 20.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'gmx-eth-pool', name: 'GMX/ETH', tokens: ['GMX', 'ETH'], icons: ['🔷', '⟠'], apy: 38.0, apr: 32.0, feeApr: 14.0, rewardApr: 18.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'rdnt-eth-pool', name: 'RDNT/ETH', tokens: ['RDNT', 'ETH'], icons: ['✨', '⟠'], apy: 85.0, apr: 68.0, feeApr: 25.0, rewardApr: 43.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'grail-eth-pool', name: 'GRAIL/ETH', tokens: ['GRAIL', 'ETH'], icons: ['🏆', '⟠'], apy: 125.0, apr: 95.0, feeApr: 35.0, rewardApr: 60.0, tvl: 12000000, volume24h: 8000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Camelot' },
            { id: 'velo-usdc-pool', name: 'VELO/USDC', tokens: ['VELO', 'USDC'], icons: ['🔴', '$'], apy: 95.0, apr: 75.0, feeApr: 28.0, rewardApr: 47.0, tvl: 25000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Velodrome' },
            { id: 'aero-usdc-pool', name: 'AERO/USDC', tokens: ['AERO', 'USDC'], icons: ['🔵', '$'], apy: 88.0, apr: 72.0, feeApr: 28.0, rewardApr: 44.0, tvl: 45000000, volume24h: 32000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Aerodrome' },
            { id: 'wld-eth-pool', name: 'WLD/ETH', tokens: ['WLD', 'ETH'], icons: ['🌐', '⟠'], apy: 62.0, apr: 48.0, feeApr: 22.0, rewardApr: 26.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'w-eth-pool', name: 'W/ETH', tokens: ['W', 'ETH'], icons: ['🌉', '⟠'], apy: 42.0, apr: 35.0, feeApr: 15.0, rewardApr: 20.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'stg-eth-pool', name: 'STG/ETH', tokens: ['STG', 'ETH'], icons: ['🌟', '⟠'], apy: 35.0, apr: 28.0, feeApr: 12.0, rewardApr: 16.0, tvl: 32000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'usde-usdc-pool', name: 'USDe/USDC', tokens: ['USDe', 'USDC'], icons: ['E', '$'], apy: 12.0, apr: 10.0, feeApr: 5.0, rewardApr: 5.0, tvl: 185000000, volume24h: 95000000, fee: 0.01, risk: 'very-low', impermanentLoss: 'Minimal IL', protocol: 'Curve' },
            // === POOLS BATCH 5 - MEGA ===
            { id: 'mode-eth-pool', name: 'MODE/ETH', tokens: ['MODE', 'ETH'], icons: ['🟡', '⟠'], apy: 85.0, apr: 68.0, feeApr: 25.0, rewardApr: 43.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Kim Exchange' },
            { id: 'blast-eth-pool', name: 'BLAST/ETH', tokens: ['BLAST', 'ETH'], icons: ['💥', '⟠'], apy: 75.0, apr: 62.0, feeApr: 28.0, rewardApr: 34.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Thruster' },
            { id: 'scroll-eth-pool', name: 'SCR/ETH', tokens: ['SCR', 'ETH'], icons: ['📜', '⟠'], apy: 65.0, apr: 52.0, feeApr: 22.0, rewardApr: 30.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Nuri' },
            { id: 'taiko-eth-pool', name: 'TAIKO/ETH', tokens: ['TAIKO', 'ETH'], icons: ['🥁', '⟠'], apy: 55.0, apr: 45.0, feeApr: 20.0, rewardApr: 25.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Henjin' },
            { id: 'zeta-eth-pool', name: 'ZETA/ETH', tokens: ['ZETA', 'ETH'], icons: ['Z', '⟠'], apy: 58.0, apr: 48.0, feeApr: 22.0, rewardApr: 26.0, tvl: 25000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Eddy Finance' },
            { id: 'omni-eth-pool', name: 'OMNI/ETH', tokens: ['OMNI', 'ETH'], icons: ['🌐', '⟠'], apy: 45.0, apr: 38.0, feeApr: 18.0, rewardApr: 20.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'saga-usdc-pool', name: 'SAGA/USDC', tokens: ['SAGA', 'USDC'], icons: ['📖', '$'], apy: 62.0, apr: 50.0, feeApr: 22.0, rewardApr: 28.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Osmosis' },
            { id: 'tnsr-sol-pool', name: 'TNSR/SOL', tokens: ['TNSR', 'SOL'], icons: ['🎨', '◎'], apy: 72.0, apr: 58.0, feeApr: 28.0, rewardApr: 30.0, tvl: 12000000, volume24h: 8000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'kmno-sol-pool', name: 'KMNO/SOL', tokens: ['KMNO', 'SOL'], icons: ['🎰', '◎'], apy: 95.0, apr: 78.0, feeApr: 32.0, rewardApr: 46.0, tvl: 8000000, volume24h: 5000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Kamino' },
            { id: 'orca-sol-pool', name: 'ORCA/SOL', tokens: ['ORCA', 'SOL'], icons: ['🐋', '◎'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 35000000, volume24h: 25000000, fee: 0.25, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Orca' },
            { id: 'ray-sol-pool', name: 'RAY/SOL', tokens: ['RAY', 'SOL'], icons: ['☀️', '◎'], apy: 45.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 42000000, volume24h: 32000000, fee: 0.25, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Raydium' },
            { id: 'hnt-sol-pool', name: 'HNT/SOL', tokens: ['HNT', 'SOL'], icons: ['📡', '◎'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 45000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Orca' },
            { id: 'akt-atom-pool', name: 'AKT/ATOM', tokens: ['AKT', 'ATOM'], icons: ['☁️', '⚛'], apy: 55.0, apr: 45.0, feeApr: 20.0, rewardApr: 25.0, tvl: 25000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Osmosis' },
            { id: 'rune-btc-pool', name: 'RUNE/BTC', tokens: ['RUNE', 'BTC'], icons: ['⚡', '₿'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'THORChain' },
            { id: 'kuji-usk-pool', name: 'KUJI/USK', tokens: ['KUJI', 'USK'], icons: ['🐋', '$'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Kujira' },
            { id: 'ntrn-atom-pool', name: 'NTRN/ATOM', tokens: ['NTRN', 'ATOM'], icons: ['⚛️', '⚛'], apy: 52.0, apr: 42.0, feeApr: 20.0, rewardApr: 22.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Astroport' },
            { id: 'astro-luna-pool', name: 'ASTRO/LUNA', tokens: ['ASTRO', 'LUNA'], icons: ['🚀', '🌙'], apy: 65.0, apr: 52.0, feeApr: 25.0, rewardApr: 27.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Astroport' },
            { id: 'degen-eth-pool', name: 'DEGEN/ETH', tokens: ['DEGEN', 'ETH'], icons: ['🎩', '⟠'], apy: 125.0, apr: 98.0, feeApr: 45.0, rewardApr: 53.0, tvl: 12000000, volume24h: 15000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Aerodrome' },
            { id: 'brett-eth-pool', name: 'BRETT/ETH', tokens: ['BRETT', 'ETH'], icons: ['🔵', '⟠'], apy: 95.0, apr: 78.0, feeApr: 38.0, rewardApr: 40.0, tvl: 18000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Aerodrome' },
            { id: 'wif-sol-pool', name: 'WIF/SOL', tokens: ['WIF', 'SOL'], icons: ['🐕', '◎'], apy: 145.0, apr: 115.0, feeApr: 55.0, rewardApr: 60.0, tvl: 45000000, volume24h: 85000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'bonk-sol-pool', name: 'BONK/SOL', tokens: ['BONK', 'SOL'], icons: ['🐕', '◎'], apy: 85.0, apr: 68.0, feeApr: 35.0, rewardApr: 33.0, tvl: 55000000, volume24h: 65000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Orca' },
            { id: 'popcat-sol-pool', name: 'POPCAT/SOL', tokens: ['POPCAT', 'SOL'], icons: ['🐱', '◎'], apy: 165.0, apr: 130.0, feeApr: 65.0, rewardApr: 65.0, tvl: 22000000, volume24h: 35000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'mew-sol-pool', name: 'MEW/SOL', tokens: ['MEW', 'SOL'], icons: ['😺', '◎'], apy: 135.0, apr: 108.0, feeApr: 52.0, rewardApr: 56.0, tvl: 18000000, volume24h: 28000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'pepe-weth-pool', name: 'PEPE/WETH', tokens: ['PEPE', 'WETH'], icons: ['🐸', '⟠'], apy: 75.0, apr: 62.0, feeApr: 32.0, rewardApr: 30.0, tvl: 125000000, volume24h: 185000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'floki-weth-pool', name: 'FLOKI/WETH', tokens: ['FLOKI', 'WETH'], icons: ['🐕', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 45000000, volume24h: 55000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'turbo-weth-pool', name: 'TURBO/WETH', tokens: ['TURBO', 'WETH'], icons: ['🐸', '⟠'], apy: 95.0, apr: 78.0, feeApr: 40.0, rewardApr: 38.0, tvl: 15000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'mog-weth-pool', name: 'MOG/WETH', tokens: ['MOG', 'WETH'], icons: ['😎', '⟠'], apy: 115.0, apr: 92.0, feeApr: 48.0, rewardApr: 44.0, tvl: 12000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'cvx-eth-pool', name: 'CVX/ETH', tokens: ['CVX', 'ETH'], icons: ['🔶', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 65000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            { id: 'fxs-eth-pool', name: 'FXS/ETH', tokens: ['FXS', 'ETH'], icons: ['F', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            { id: 'angle-eth-pool', name: 'ANGLE/ETH', tokens: ['ANGLE', 'ETH'], icons: ['📐', '⟠'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Balancer' },
            { id: 'bal-eth-pool', name: 'BAL/ETH', tokens: ['BAL', 'ETH'], icons: ['⚖️', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 55000000, volume24h: 32000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'prime-eth-pool', name: 'PRIME/ETH', tokens: ['PRIME', 'ETH'], icons: ['🎮', '⟠'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 25000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'olas-eth-pool', name: 'OLAS/ETH', tokens: ['OLAS', 'ETH'], icons: ['🤖', '⟠'], apy: 48.0, apr: 40.0, feeApr: 20.0, rewardApr: 20.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Balancer' },
            // === POOLS BATCH 6 - ULTRA ===
            { id: 'zro-eth-pool', name: 'ZRO/ETH', tokens: ['ZRO', 'ETH'], icons: ['0️⃣', '⟠'], apy: 65.0, apr: 52.0, feeApr: 28.0, rewardApr: 24.0, tvl: 45000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'arkm-eth-pool', name: 'ARKM/ETH', tokens: ['ARKM', 'ETH'], icons: ['🔍', '⟠'], apy: 72.0, apr: 58.0, feeApr: 32.0, rewardApr: 26.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'cyber-eth-pool', name: 'CYBER/ETH', tokens: ['CYBER', 'ETH'], icons: ['🌐', '⟠'], apy: 85.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'id-bnb-pool', name: 'ID/BNB', tokens: ['ID', 'BNB'], icons: ['🪪', '💛'], apy: 92.0, apr: 75.0, feeApr: 42.0, rewardApr: 33.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'PancakeSwap' },
            { id: 'rdnt-eth-pool', name: 'RDNT/ETH', tokens: ['RDNT', 'ETH'], icons: ['☀️', '⟠'], apy: 78.0, apr: 62.0, feeApr: 35.0, rewardApr: 27.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'magic-eth-pool', name: 'MAGIC/ETH', tokens: ['MAGIC', 'ETH'], icons: ['✨', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 32000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'ldo-eth-pool', name: 'LDO/ETH', tokens: ['LDO', 'ETH'], icons: ['🔷', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            { id: 'rpl-eth-pool', name: 'RPL/ETH', tokens: ['RPL', 'ETH'], icons: ['🚀', '⟠'], apy: 25.0, apr: 20.0, feeApr: 10.0, rewardApr: 10.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'ssv-eth-pool', name: 'SSV/ETH', tokens: ['SSV', 'ETH'], icons: ['🔐', '⟠'], apy: 48.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'xai-arb-pool', name: 'XAI/ARB', tokens: ['XAI', 'ARB'], icons: ['🎮', '🔵'], apy: 115.0, apr: 92.0, feeApr: 48.0, rewardApr: 44.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Camelot' },
            { id: 'gala-eth-pool', name: 'GALA/ETH', tokens: ['GALA', 'ETH'], icons: ['🎰', '⟠'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 42000000, volume24h: 32000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'ilv-eth-pool', name: 'ILV/ETH', tokens: ['ILV', 'ETH'], icons: ['🎮', '⟠'], apy: 68.0, apr: 55.0, feeApr: 28.0, rewardApr: 27.0, tvl: 25000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Sushiswap' },
            { id: 'beam-avax-pool', name: 'BEAM/AVAX', tokens: ['BEAM', 'AVAX'], icons: ['🎮', '🔺'], apy: 62.0, apr: 50.0, feeApr: 25.0, rewardApr: 25.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Trader Joe' },
            { id: 'ron-eth-pool', name: 'RON/ETH', tokens: ['RON', 'ETH'], icons: ['🎮', '⟠'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 55000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Katana' },
            { id: 'pixel-sol-pool', name: 'PIXEL/SOL', tokens: ['PIXEL', 'SOL'], icons: ['🎮', '◎'], apy: 135.0, apr: 108.0, feeApr: 55.0, rewardApr: 53.0, tvl: 15000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'portal-eth-pool', name: 'PORTAL/ETH', tokens: ['PORTAL', 'ETH'], icons: ['🌀', '⟠'], apy: 95.0, apr: 78.0, feeApr: 42.0, rewardApr: 36.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'woo-eth-pool', name: 'WOO/ETH', tokens: ['WOO', 'ETH'], icons: ['🔵', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 45000000, volume24h: 32000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'dodo-usdc-pool', name: 'DODO/USDC', tokens: ['DODO', 'USDC'], icons: ['🦤', '$'], apy: 48.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'DODO' },
            { id: 'joe-avax-pool', name: 'JOE/AVAX', tokens: ['JOE', 'AVAX'], icons: ['☕', '🔺'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 35000000, volume24h: 28000000, fee: 0.25, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Trader Joe' },
            { id: 'sushi-eth-pool', name: 'SUSHI/ETH', tokens: ['SUSHI', 'ETH'], icons: ['🍣', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Sushiswap' },
            { id: '1inch-eth-pool', name: '1INCH/ETH', tokens: ['1INCH', 'ETH'], icons: ['🦄', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'snx-eth-pool', name: 'SNX/ETH', tokens: ['SNX', 'ETH'], icons: ['⚫', '⟠'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 65000000, volume24h: 45000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            { id: 'perp-usdc-pool', name: 'PERP/USDC', tokens: ['PERP', 'USDC'], icons: ['📊', '$'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'gns-dai-pool', name: 'GNS/DAI', tokens: ['GNS', 'DAI'], icons: ['💎', '◈'], apy: 62.0, apr: 50.0, feeApr: 28.0, rewardApr: 22.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'blur-eth-pool', name: 'BLUR/ETH', tokens: ['BLUR', 'ETH'], icons: ['🎨', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 55000000, volume24h: 42000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'looks-eth-pool', name: 'LOOKS/ETH', tokens: ['LOOKS', 'ETH'], icons: ['👀', '⟠'], apy: 85.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Sushiswap' },
            { id: 'ondo-usdc-pool', name: 'ONDO/USDC', tokens: ['ONDO', 'USDC'], icons: ['🏛️', '$'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 65000000, volume24h: 45000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'cfg-eth-pool', name: 'CFG/ETH', tokens: ['CFG', 'ETH'], icons: ['🌀', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Balancer' },
            { id: 'fet-eth-pool', name: 'FET/ETH', tokens: ['FET', 'ETH'], icons: ['🤖', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 48000000, volume24h: 38000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'rndr-eth-pool', name: 'RNDR/ETH', tokens: ['RNDR', 'ETH'], icons: ['🎨', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 55000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'agix-eth-pool', name: 'AGIX/ETH', tokens: ['AGIX', 'ETH'], icons: ['🤖', '⟠'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 32000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'ocean-eth-pool', name: 'OCEAN/ETH', tokens: ['OCEAN', 'ETH'], icons: ['🌊', '⟠'], apy: 48.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'ar-eth-pool', name: 'AR/ETH', tokens: ['AR', 'ETH'], icons: ['📦', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 35000000, volume24h: 25000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'fil-eth-pool', name: 'FIL/ETH', tokens: ['FIL', 'ETH'], icons: ['📁', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 65000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'theta-eth-pool', name: 'THETA/ETH', tokens: ['THETA', 'ETH'], icons: ['θ', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'axs-eth-pool', name: 'AXS/ETH', tokens: ['AXS', 'ETH'], icons: ['⚔️', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 48000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Sushiswap' },
            { id: 'sand-eth-pool', name: 'SAND/ETH', tokens: ['SAND', 'ETH'], icons: ['🏖️', '⟠'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 38000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Sushiswap' },
            { id: 'mana-eth-pool', name: 'MANA/ETH', tokens: ['MANA', 'ETH'], icons: ['🌐', '⟠'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 35000000, volume24h: 25000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'imx-eth-pool', name: 'IMX/ETH', tokens: ['IMX', 'ETH'], icons: ['X', '⟠'], apy: 45.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 42000000, volume24h: 32000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'apt-usdc-pool', name: 'APT/USDC', tokens: ['APT', 'USDC'], icons: ['🔷', '$'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 65000000, volume24h: 55000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Thala' },
            // === POOLS BATCH 7 - MEGA ULTRA ===
            { id: 'hbar-usdc-pool', name: 'HBAR/USDC', tokens: ['HBAR', 'USDC'], icons: ['ℏ', '$'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 85000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Saucerswap' },
            { id: 'algo-usdc-pool', name: 'ALGO/USDC', tokens: ['ALGO', 'USDC'], icons: ['⬡', '$'], apy: 25.0, apr: 20.0, feeApr: 10.0, rewardApr: 10.0, tvl: 75000000, volume24h: 55000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Medium IL', protocol: 'Tinyman' },
            { id: 'xtz-usdt-pool', name: 'XTZ/USDT', tokens: ['XTZ', 'USDT'], icons: ['ꜩ', '₮'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 55000000, volume24h: 42000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Medium IL', protocol: 'Plenty' },
            { id: 'flow-usdc-pool', name: 'FLOW/USDC', tokens: ['FLOW', 'USDC'], icons: ['🌊', '$'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 48000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Increment' },
            { id: 'egld-usdc-pool', name: 'EGLD/USDC', tokens: ['EGLD', 'USDC'], icons: ['⚡', '$'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 65000000, volume24h: 52000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'xExchange' },
            { id: 'kda-usdc-pool', name: 'KDA/USDC', tokens: ['KDA', 'USDC'], icons: ['🔗', '$'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Kaddex' },
            { id: 'vet-usdt-pool', name: 'VET/USDT', tokens: ['VET', 'USDT'], icons: ['✔️', '₮'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 42000000, volume24h: 32000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Medium IL', protocol: 'Vexchange' },
            { id: 'icp-usdc-pool', name: 'ICP/USDC', tokens: ['ICP', 'USDC'], icons: ['∞', '$'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 58000000, volume24h: 45000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'ICPSwap' },
            { id: 'neo-usdt-pool', name: 'NEO/USDT', tokens: ['NEO', 'USDT'], icons: ['💚', '₮'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 38000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Flamingo' },
            { id: 'zil-usdt-pool', name: 'ZIL/USDT', tokens: ['ZIL', 'USDT'], icons: ['💎', '₮'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Zilswap' },
            { id: 'rose-eth-pool', name: 'ROSE/ETH', tokens: ['ROSE', 'ETH'], icons: ['🌹', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 32000000, volume24h: 25000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'YuzuSwap' },
            { id: 'celo-usdc-pool', name: 'CELO/USDC', tokens: ['CELO', 'USDC'], icons: ['🟢', '$'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Medium IL', protocol: 'Ubeswap' },
            { id: 'one-usdc-pool', name: 'ONE/USDC', tokens: ['ONE', 'USDC'], icons: ['1️⃣', '$'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 25000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'SushiSwap' },
            { id: 'kava-usdt-pool', name: 'KAVA/USDT', tokens: ['KAVA', 'USDT'], icons: ['🔴', '₮'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 42000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Equilibre' },
            { id: 'mina-usdc-pool', name: 'MINA/USDC', tokens: ['MINA', 'USDC'], icons: ['⚙️', '$'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 38000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Lumina' },
            { id: 'glmr-usdc-pool', name: 'GLMR/USDC', tokens: ['GLMR', 'USDC'], icons: ['🌙', '$'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 32000000, volume24h: 25000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Stellaswap' },
            { id: 'movr-usdc-pool', name: 'MOVR/USDC', tokens: ['MOVR', 'USDC'], icons: ['🚀', '$'], apy: 58.0, apr: 48.0, feeApr: 25.0, rewardApr: 23.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Solarbeam' },
            { id: 'astr-usdc-pool', name: 'ASTR/USDC', tokens: ['ASTR', 'USDC'], icons: ['⭐', '$'], apy: 48.0, apr: 40.0, feeApr: 20.0, rewardApr: 20.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'ArthSwap' },
            { id: 'aca-usdc-pool', name: 'ACA/USDC', tokens: ['ACA', 'USDC'], icons: ['🔴', '$'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Acala Swap' },
            { id: 'cspr-usdt-pool', name: 'CSPR/USDT', tokens: ['CSPR', 'USDT'], icons: ['👻', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'CasperSwap' },
            { id: 'xdc-usdt-pool', name: 'XDC/USDT', tokens: ['XDC', 'USDT'], icons: ['🔵', '₮'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 32000000, volume24h: 25000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'XSwap' },
            { id: 'iotx-usdt-pool', name: 'IOTX/USDT', tokens: ['IOTX', 'USDT'], icons: ['📡', '₮'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 25000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'mimo' },
            { id: 'scrt-usdt-pool', name: 'SCRT/USDT', tokens: ['SCRT', 'USDT'], icons: ['🤫', '₮'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'SecretSwap' },
            { id: 'band-eth-pool', name: 'BAND/ETH', tokens: ['BAND', 'ETH'], icons: ['📊', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ocean-eth-pool', name: 'OCEAN/ETH', tokens: ['OCEAN', 'ETH'], icons: ['🌊', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'storj-eth-pool', name: 'STORJ/ETH', tokens: ['STORJ', 'ETH'], icons: ['💾', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'audio-eth-pool', name: 'AUDIO/ETH', tokens: ['AUDIO', 'ETH'], icons: ['🎵', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'mask-eth-pool', name: 'MASK/ETH', tokens: ['MASK', 'ETH'], icons: ['🎭', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'gal-eth-pool', name: 'GAL/ETH', tokens: ['GAL', 'ETH'], icons: ['🌌', '⟠'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'hook-usdt-pool', name: 'HOOK/USDT', tokens: ['HOOK', 'USDT'], icons: ['🪝', '₮'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'PancakeSwap' },
            { id: 'edu-usdt-pool', name: 'EDU/USDT', tokens: ['EDU', 'USDT'], icons: ['📚', '₮'], apy: 48.0, apr: 40.0, feeApr: 20.0, rewardApr: 20.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'api3-eth-pool', name: 'API3/ETH', tokens: ['API3', 'ETH'], icons: ['🔌', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 25000000, volume24h: 20000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'uma-eth-pool', name: 'UMA/ETH', tokens: ['UMA', 'ETH'], icons: ['🔮', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'bico-eth-pool', name: 'BICO/ETH', tokens: ['BICO', 'ETH'], icons: ['🔵', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'celr-eth-pool', name: 'CELR/ETH', tokens: ['CELR', 'ETH'], icons: ['🌐', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ctk-eth-pool', name: 'CTK/ETH', tokens: ['CTK', 'ETH'], icons: ['🛡️', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'req-eth-pool', name: 'REQ/ETH', tokens: ['REQ', 'ETH'], icons: ['📋', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 12000000, volume24h: 10000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'trb-eth-pool', name: 'TRB/ETH', tokens: ['TRB', 'ETH'], icons: ['💚', '⟠'], apy: 52.0, apr: 42.0, feeApr: 25.0, rewardApr: 17.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'nkn-eth-pool', name: 'NKN/ETH', tokens: ['NKN', 'ETH'], icons: ['🌐', '⟠'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // === POOLS BATCH 8 - ZETTA EXPANSION ===
            { id: 'ftm-usdc-pool', name: 'FTM/USDC', tokens: ['FTM', 'USDC'], icons: ['👻', '$'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 85000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SpookySwap' },
            { id: 'eos-usdt-pool', name: 'EOS/USDT', tokens: ['EOS', 'USDT'], icons: ['🔷', '₮'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 55000000, volume24h: 42000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Medium IL', protocol: 'Defibox' },
            { id: 'xlm-usdc-pool', name: 'XLM/USDC', tokens: ['XLM', 'USDC'], icons: ['✨', '$'], apy: 25.0, apr: 20.0, feeApr: 10.0, rewardApr: 10.0, tvl: 48000000, volume24h: 35000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Medium IL', protocol: 'StellarX' },
            { id: 'trx-usdt-pool', name: 'TRX/USDT', tokens: ['TRX', 'USDT'], icons: ['🔺', '₮'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 125000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SunSwap' },
            { id: 'waves-usdt-pool', name: 'WAVES/USDT', tokens: ['WAVES', 'USDT'], icons: ['🌊', '₮'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Swop.fi' },
            { id: 'ont-usdt-pool', name: 'ONT/USDT', tokens: ['ONT', 'USDT'], icons: ['🔵', '₮'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Wing Finance' },
            { id: 'icx-usdt-pool', name: 'ICX/USDT', tokens: ['ICX', 'USDT'], icons: ['⬡', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balanced' },
            { id: 'lsk-usdt-pool', name: 'LSK/USDT', tokens: ['LSK', 'USDT'], icons: ['💎', '₮'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'LiskDEX' },
            { id: 'xno-usdc-pool', name: 'XNO/USDC', tokens: ['XNO', 'USDC'], icons: ['💵', '$'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 12000000, volume24h: 10000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Nanswap' },
            { id: 'iost-usdt-pool', name: 'IOST/USDT', tokens: ['IOST', 'USDT'], icons: ['🔶', '₮'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'IOSTSwap' },
            { id: 'waxp-usdt-pool', name: 'WAXP/USDT', tokens: ['WAXP', 'USDT'], icons: ['🟠', '₮'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Alcor' },
            { id: 'flux-usdt-pool', name: 'FLUX/USDT', tokens: ['FLUX', 'USDT'], icons: ['⚡', '₮'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'FluxSwap' },
            { id: 'sys-usdt-pool', name: 'SYS/USDT', tokens: ['SYS', 'USDT'], icons: ['🔷', '₮'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Pegasys' },
            { id: 'kmd-usdt-pool', name: 'KMD/USDT', tokens: ['KMD', 'USDT'], icons: ['🐉', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 12000000, volume24h: 10000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'AtomicDEX' },
            { id: 'dcr-usdt-pool', name: 'DCR/USDT', tokens: ['DCR', 'USDT'], icons: ['🔵', '₮'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'DCRDEX' },
            { id: 'dgb-usdt-pool', name: 'DGB/USDT', tokens: ['DGB', 'USDT'], icons: ['💙', '₮'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 8000000, volume24h: 6000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'XeggeX' },
            { id: 'rvn-usdt-pool', name: 'RVN/USDT', tokens: ['RVN', 'USDT'], icons: ['🐦', '₮'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 10000000, volume24h: 8000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'TradeOgre' },
            { id: 'stx-usdc-pool', name: 'STX/USDC', tokens: ['STX', 'USDC'], icons: ['📦', '$'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 65000000, volume24h: 52000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'ALEX' },
            { id: 'ordi-usdt-pool', name: 'ORDI/USDT', tokens: ['ORDI', 'USDT'], icons: ['🟡', '₮'], apy: 68.0, apr: 55.0, feeApr: 30.0, rewardApr: 25.0, tvl: 85000000, volume24h: 75000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'OKX DEX' },
            { id: 'rats-usdt-pool', name: 'RATS/USDT', tokens: ['RATS', 'USDT'], icons: ['🐀', '₮'], apy: 75.0, apr: 62.0, feeApr: 35.0, rewardApr: 27.0, tvl: 45000000, volume24h: 42000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'MEXC DEX' },
            { id: 'sats-usdt-pool', name: 'SATS/USDT', tokens: ['SATS', 'USDT'], icons: ['⚡', '₮'], apy: 72.0, apr: 58.0, feeApr: 32.0, rewardApr: 26.0, tvl: 55000000, volume24h: 48000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Gate DEX' },
            { id: 'turbo-eth-pool', name: 'TURBO/ETH', tokens: ['TURBO', 'ETH'], icons: ['🐸', '⟠'], apy: 85.0, apr: 70.0, feeApr: 40.0, rewardApr: 30.0, tvl: 32000000, volume24h: 28000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'people-usdt-pool', name: 'PEOPLE/USDT', tokens: ['PEOPLE', 'USDT'], icons: ['👥', '₮'], apy: 58.0, apr: 48.0, feeApr: 25.0, rewardApr: 23.0, tvl: 42000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'SushiSwap' },
            { id: 'jasmy-usdt-pool', name: 'JASMY/USDT', tokens: ['JASMY', 'USDT'], icons: ['📱', '₮'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'loom-eth-pool', name: 'LOOM/ETH', tokens: ['LOOM', 'ETH'], icons: ['🔗', '⟠'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 12000000, volume24h: 10000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ankr-eth-pool', name: 'ANKR/ETH', tokens: ['ANKR', 'ETH'], icons: ['⚓', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'sxp-usdt-pool', name: 'SXP/USDT', tokens: ['SXP', 'USDT'], icons: ['💳', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'chr-eth-pool', name: 'CHR/ETH', tokens: ['CHR', 'ETH'], icons: ['🎮', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Chromia DEX' },
            { id: 'pundix-eth-pool', name: 'PUNDIX/ETH', tokens: ['PUNDIX', 'ETH'], icons: ['💰', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'spell-eth-pool', name: 'SPELL/ETH', tokens: ['SPELL', 'ETH'], icons: ['🪄', '⟠'], apy: 62.0, apr: 50.0, feeApr: 28.0, rewardApr: 22.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'SushiSwap' },
            { id: 'joe-avax-pool', name: 'JOE/AVAX', tokens: ['JOE', 'AVAX'], icons: ['🔴', '🔺'], apy: 58.0, apr: 48.0, feeApr: 25.0, rewardApr: 23.0, tvl: 42000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Trader Joe' },
            { id: 'quick-matic-pool', name: 'QUICK/MATIC', tokens: ['QUICK', 'MATIC'], icons: ['⚡', '💜'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'QuickSwap' },
            { id: 'cream-eth-pool', name: 'CREAM/ETH', tokens: ['CREAM', 'ETH'], icons: ['🍦', '⟠'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'mbox-bnb-pool', name: 'MBOX/BNB', tokens: ['MBOX', 'BNB'], icons: ['📦', '💛'], apy: 65.0, apr: 52.0, feeApr: 28.0, rewardApr: 24.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'PancakeSwap' },
            // === POOLS BATCH 9 - YOTTA EXPANSION ===
            { id: 'bake-bnb-pool', name: 'BAKE/BNB', tokens: ['BAKE', 'BNB'], icons: ['🥯', '💛'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'BakerySwap' },
            { id: 'alpha-eth-pool', name: 'ALPHA/ETH', tokens: ['ALPHA', 'ETH'], icons: ['α', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'reef-usdt-pool', name: 'REEF/USDT', tokens: ['REEF', 'USDT'], icons: ['🐠', '₮'], apy: 58.0, apr: 48.0, feeApr: 25.0, rewardApr: 23.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'ReefSwap' },
            { id: 'dodo-usdt-pool', name: 'DODO/USDT', tokens: ['DODO', 'USDT'], icons: ['🦤', '₮'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'DODO' },
            { id: 'xvs-bnb-pool', name: 'XVS/BNB', tokens: ['XVS', 'BNB'], icons: ['🔶', '💛'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 65000000, volume24h: 52000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'alpaca-bnb-pool', name: 'ALPACA/BNB', tokens: ['ALPACA', 'BNB'], icons: ['🦙', '💛'], apy: 62.0, apr: 50.0, feeApr: 28.0, rewardApr: 22.0, tvl: 32000000, volume24h: 25000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Alpaca Finance' },
            { id: 'banana-bnb-pool', name: 'BANANA/BNB', tokens: ['BANANA', 'BNB'], icons: ['🍌', '💛'], apy: 72.0, apr: 58.0, feeApr: 32.0, rewardApr: 26.0, tvl: 25000000, volume24h: 20000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'ApeSwap' },
            { id: 'burger-bnb-pool', name: 'BURGER/BNB', tokens: ['BURGER', 'BNB'], icons: ['🍔', '💛'], apy: 58.0, apr: 48.0, feeApr: 25.0, rewardApr: 23.0, tvl: 12000000, volume24h: 10000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'BurgerSwap' },
            { id: 'eps-bnb-pool', name: 'EPS/BNB', tokens: ['EPS', 'BNB'], icons: ['ε', '💛'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Ellipsis' },
            { id: 'mdx-bnb-pool', name: 'MDX/BNB', tokens: ['MDX', 'BNB'], icons: ['🔷', '💛'], apy: 65.0, apr: 52.0, feeApr: 28.0, rewardApr: 24.0, tvl: 22000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'MDEX' },
            { id: 'bifi-eth-pool', name: 'BIFI/ETH', tokens: ['BIFI', 'ETH'], icons: ['🐮', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 45000000, volume24h: 35000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Medium IL', protocol: 'SushiSwap' },
            { id: 'auto-bnb-pool', name: 'AUTO/BNB', tokens: ['AUTO', 'BNB'], icons: ['🤖', '💛'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'c98-bnb-pool', name: 'C98/BNB', tokens: ['C98', 'BNB'], icons: ['👛', '💛'], apy: 52.0, apr: 42.0, feeApr: 22.0, rewardApr: 20.0, tvl: 45000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'twt-bnb-pool', name: 'TWT/BNB', tokens: ['TWT', 'BNB'], icons: ['💎', '💛'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 65000000, volume24h: 52000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'sfp-bnb-pool', name: 'SFP/BNB', tokens: ['SFP', 'BNB'], icons: ['🔐', '💛'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'pols-eth-pool', name: 'POLS/ETH', tokens: ['POLS', 'ETH'], icons: ['🔮', '⟠'], apy: 68.0, apr: 55.0, feeApr: 30.0, rewardApr: 25.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'front-eth-pool', name: 'FRONT/ETH', tokens: ['FRONT', 'ETH'], icons: ['🎯', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'lit-eth-pool', name: 'LIT/ETH', tokens: ['LIT', 'ETH'], icons: ['🔥', '⟠'], apy: 62.0, apr: 50.0, feeApr: 28.0, rewardApr: 22.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'bar-usdt-pool', name: 'BAR/USDT', tokens: ['BAR', 'USDT'], icons: ['⚽', '₮'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'psg-usdt-pool', name: 'PSG/USDT', tokens: ['PSG', 'USDT'], icons: ['⚽', '₮'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'juv-usdt-pool', name: 'JUV/USDT', tokens: ['JUV', 'USDT'], icons: ['⚽', '₮'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 12000000, volume24h: 10000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'city-usdt-pool', name: 'CITY/USDT', tokens: ['CITY', 'USDT'], icons: ['⚽', '₮'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'acm-usdt-pool', name: 'ACM/USDT', tokens: ['ACM', 'USDT'], icons: ['⚽', '₮'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 10000000, volume24h: 8000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'chz-usdt-pool', name: 'CHZ/USDT', tokens: ['CHZ', 'USDT'], icons: ['🏟️', '₮'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 85000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'santos-usdt-pool', name: 'SANTOS/USDT', tokens: ['SANTOS', 'USDT'], icons: ['⚽', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 12000000, volume24h: 10000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'lazio-usdt-pool', name: 'LAZIO/USDT', tokens: ['LAZIO', 'USDT'], icons: ['⚽', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 8000000, volume24h: 6000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'porto-usdt-pool', name: 'PORTO/USDT', tokens: ['PORTO', 'USDT'], icons: ['⚽', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 8000000, volume24h: 6000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'og-usdt-pool', name: 'OG/USDT', tokens: ['OG', 'USDT'], icons: ['🎮', '₮'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 8000000, volume24h: 6000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'navi-usdt-pool', name: 'NAVI/USDT', tokens: ['NAVI', 'USDT'], icons: ['🎮', '₮'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 5000000, volume24h: 4000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Chiliz' },
            { id: 'alpine-usdt-pool', name: 'ALPINE/USDT', tokens: ['ALPINE', 'USDT'], icons: ['🏎️', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 12000000, volume24h: 10000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'asr-usdt-pool', name: 'ASR/USDT', tokens: ['ASR', 'USDT'], icons: ['⚽', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 8000000, volume24h: 6000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'inter-usdt-pool', name: 'INTER/USDT', tokens: ['INTER', 'USDT'], icons: ['⚽', '₮'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 10000000, volume24h: 8000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'gal-usdt-pool', name: 'GAL/USDT', tokens: ['GAL', 'USDT'], icons: ['⚽', '₮'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 15000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            // === POOLS BATCH 10 - RONNA EXPANSION ===
            // Meme Coin Pools
            { id: 'floki-usdt-pool', name: 'FLOKI/USDT', tokens: ['FLOKI', 'USDT'], icons: ['🐕', '₮'], apy: 85.0, apr: 70.0, feeApr: 35.0, rewardApr: 35.0, tvl: 45000000, volume24h: 120000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'PancakeSwap' },
            { id: 'babydoge-usdt-pool', name: 'BABYDOGE/USDT', tokens: ['BABYDOGE', 'USDT'], icons: ['🐶', '₮'], apy: 120.0, apr: 95.0, feeApr: 50.0, rewardApr: 45.0, tvl: 28000000, volume24h: 85000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'PancakeSwap' },
            { id: 'bonk-sol-pool', name: 'BONK/SOL', tokens: ['BONK', 'SOL'], icons: ['🐕', '◎'], apy: 95.0, apr: 78.0, feeApr: 40.0, rewardApr: 38.0, tvl: 85000000, volume24h: 150000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'wif-sol-pool', name: 'WIF/SOL', tokens: ['WIF', 'SOL'], icons: ['🐕', '◎'], apy: 110.0, apr: 88.0, feeApr: 45.0, rewardApr: 43.0, tvl: 95000000, volume24h: 180000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'pepe-eth-pool', name: 'PEPE/ETH', tokens: ['PEPE', 'ETH'], icons: ['🐸', '⟠'], apy: 75.0, apr: 62.0, feeApr: 32.0, rewardApr: 30.0, tvl: 120000000, volume24h: 250000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'shib-eth-pool', name: 'SHIB/ETH', tokens: ['SHIB', 'ETH'], icons: ['🐕', '⟠'], apy: 45.0, apr: 38.0, feeApr: 20.0, rewardApr: 18.0, tvl: 180000000, volume24h: 320000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'ShibaSwap' },
            { id: 'doge-usdt-pool', name: 'DOGE/USDT', tokens: ['DOGE', 'USDT'], icons: ['🐕', '₮'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 280000000, volume24h: 450000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'mog-eth-pool', name: 'MOG/ETH', tokens: ['MOG', 'ETH'], icons: ['😎', '⟠'], apy: 150.0, apr: 120.0, feeApr: 65.0, rewardApr: 55.0, tvl: 25000000, volume24h: 80000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'brett-eth-pool', name: 'BRETT/ETH', tokens: ['BRETT', 'ETH'], icons: ['🧢', '⟠'], apy: 180.0, apr: 145.0, feeApr: 75.0, rewardApr: 70.0, tvl: 35000000, volume24h: 95000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'popcat-sol-pool', name: 'POPCAT/SOL', tokens: ['POPCAT', 'SOL'], icons: ['🐱', '◎'], apy: 200.0, apr: 160.0, feeApr: 85.0, rewardApr: 75.0, tvl: 18000000, volume24h: 65000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            // Perp DEX Token Pools
            { id: 'pendle-eth-pool', name: 'PENDLE/ETH', tokens: ['PENDLE', 'ETH'], icons: ['📊', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'velo-eth-pool', name: 'VELO/ETH', tokens: ['VELO', 'ETH'], icons: ['🚴', '⟠'], apy: 65.0, apr: 52.0, feeApr: 28.0, rewardApr: 24.0, tvl: 120000000, volume24h: 85000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Velodrome' },
            { id: 'aero-eth-pool', name: 'AERO/ETH', tokens: ['AERO', 'ETH'], icons: ['✈️', '⟠'], apy: 72.0, apr: 58.0, feeApr: 32.0, rewardApr: 26.0, tvl: 95000000, volume24h: 75000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Aerodrome' },
            { id: 'grail-eth-pool', name: 'GRAIL/ETH', tokens: ['GRAIL', 'ETH'], icons: ['🏆', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 35000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'thales-eth-pool', name: 'THALES/ETH', tokens: ['THALES', 'ETH'], icons: ['🎯', '⟠'], apy: 58.0, apr: 48.0, feeApr: 26.0, rewardApr: 22.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'lyra-eth-pool', name: 'LYRA/ETH', tokens: ['LYRA', 'ETH'], icons: ['🎵', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'kwenta-eth-pool', name: 'KWENTA/ETH', tokens: ['KWENTA', 'ETH'], icons: ['📈', '⟠'], apy: 62.0, apr: 50.0, feeApr: 28.0, rewardApr: 22.0, tvl: 28000000, volume24h: 20000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Velodrome' },
            { id: 'vela-eth-pool', name: 'VELA/ETH', tokens: ['VELA', 'ETH'], icons: ['⚡', '⟠'], apy: 68.0, apr: 55.0, feeApr: 30.0, rewardApr: 25.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'mux-eth-pool', name: 'MUX/ETH', tokens: ['MUX', 'ETH'], icons: ['🔄', '⟠'], apy: 75.0, apr: 60.0, feeApr: 35.0, rewardApr: 25.0, tvl: 12000000, volume24h: 8000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'hmx-arb-pool', name: 'HMX/ARB', tokens: ['HMX', 'ARB'], icons: ['📊', '🔵'], apy: 82.0, apr: 65.0, feeApr: 38.0, rewardApr: 27.0, tvl: 8000000, volume24h: 5000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'lvl-bnb-pool', name: 'LVL/BNB', tokens: ['LVL', 'BNB'], icons: ['📈', '💛'], apy: 88.0, apr: 70.0, feeApr: 40.0, rewardApr: 30.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'PancakeSwap' },
            { id: 'vrtx-arb-pool', name: 'VRTX/ARB', tokens: ['VRTX', 'ARB'], icons: ['🔺', '🔵'], apy: 78.0, apr: 62.0, feeApr: 35.0, rewardApr: 27.0, tvl: 10000000, volume24h: 7000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'drift-sol-pool', name: 'DRIFT/SOL', tokens: ['DRIFT', 'SOL'], icons: ['🌊', '◎'], apy: 72.0, apr: 58.0, feeApr: 32.0, rewardApr: 26.0, tvl: 25000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            // Solana DeFi Pools
            { id: 'jup-sol-pool', name: 'JUP/SOL', tokens: ['JUP', 'SOL'], icons: ['🪐', '◎'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 180000000, volume24h: 150000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Raydium' },
            { id: 'ray-sol-pool', name: 'RAY/SOL', tokens: ['RAY', 'SOL'], icons: ['☀️', '◎'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 85000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Raydium' },
            { id: 'orca-sol-pool', name: 'ORCA/SOL', tokens: ['ORCA', 'SOL'], icons: ['🐋', '◎'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 65000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Orca' },
            { id: 'mnde-sol-pool', name: 'MNDE/SOL', tokens: ['MNDE', 'SOL'], icons: ['🔮', '◎'], apy: 62.0, apr: 50.0, feeApr: 28.0, rewardApr: 22.0, tvl: 35000000, volume24h: 25000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Raydium' },
            { id: 'jto-sol-pool', name: 'JTO/SOL', tokens: ['JTO', 'SOL'], icons: ['🎯', '◎'], apy: 58.0, apr: 48.0, feeApr: 26.0, rewardApr: 22.0, tvl: 95000000, volume24h: 75000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Raydium' },
            { id: 'tnsr-sol-pool', name: 'TNSR/SOL', tokens: ['TNSR', 'SOL'], icons: ['🎨', '◎'], apy: 68.0, apr: 55.0, feeApr: 30.0, rewardApr: 25.0, tvl: 42000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Raydium' },
            { id: 'kmno-sol-pool', name: 'KMNO/SOL', tokens: ['KMNO', 'SOL'], icons: ['🎰', '◎'], apy: 72.0, apr: 58.0, feeApr: 32.0, rewardApr: 26.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'prcl-sol-pool', name: 'PRCL/SOL', tokens: ['PRCL', 'SOL'], icons: ['📦', '◎'], apy: 78.0, apr: 62.0, feeApr: 35.0, rewardApr: 27.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'cloud-sol-pool', name: 'CLOUD/SOL', tokens: ['CLOUD', 'SOL'], icons: ['☁️', '◎'], apy: 85.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 12000000, volume24h: 10000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'zex-sol-pool', name: 'ZEX/SOL', tokens: ['ZEX', 'SOL'], icons: ['⚡', '◎'], apy: 92.0, apr: 75.0, feeApr: 42.0, rewardApr: 33.0, tvl: 8000000, volume24h: 6000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'io-sol-pool', name: 'IO/SOL', tokens: ['IO', 'SOL'], icons: ['💻', '◎'], apy: 65.0, apr: 52.0, feeApr: 28.0, rewardApr: 24.0, tvl: 55000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Raydium' },
            // === POOLS BATCH 11 - QUETTA EXPANSION ===
            // AI & GPU Token Pools
            { id: 'tao-eth-pool', name: 'TAO/ETH', tokens: ['TAO', 'ETH'], icons: ['🧠', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'fet-eth-pool', name: 'FET/ETH', tokens: ['FET', 'ETH'], icons: ['🤖', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'agix-eth-pool', name: 'AGIX/ETH', tokens: ['AGIX', 'ETH'], icons: ['🧠', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 65000000, volume24h: 45000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ocean-eth-pool', name: 'OCEAN/ETH', tokens: ['OCEAN', 'ETH'], icons: ['🌊', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'nos-sol-pool', name: 'NOS/SOL', tokens: ['NOS', 'SOL'], icons: ['☁️', '◎'], apy: 75.0, apr: 60.0, feeApr: 35.0, rewardApr: 25.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'ath-eth-pool', name: 'ATH/ETH', tokens: ['ATH', 'ETH'], icons: ['🎮', '⟠'], apy: 85.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'gpu-eth-pool', name: 'GPU/ETH', tokens: ['GPU', 'ETH'], icons: ['🖥️', '⟠'], apy: 120.0, apr: 95.0, feeApr: 50.0, rewardApr: 45.0, tvl: 18000000, volume24h: 15000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'wld-eth-pool', name: 'WLD/ETH', tokens: ['WLD', 'ETH'], icons: ['🌐', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Gaming & Metaverse Token Pools
            { id: 'gala-eth-pool', name: 'GALA/ETH', tokens: ['GALA', 'ETH'], icons: ['🎮', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 85000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'imx-eth-pool', name: 'IMX/ETH', tokens: ['IMX', 'ETH'], icons: ['🎮', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 125000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ron-eth-pool', name: 'RON/ETH', tokens: ['RON', 'ETH'], icons: ['⚔️', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 145000000, volume24h: 115000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Katana' },
            { id: 'beam-eth-pool', name: 'BEAM/ETH', tokens: ['BEAM', 'ETH'], icons: ['🎮', '⟠'], apy: 58.0, apr: 48.0, feeApr: 26.0, rewardApr: 22.0, tvl: 55000000, volume24h: 42000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Beam Swap' },
            { id: 'prime-eth-pool', name: 'PRIME/ETH', tokens: ['PRIME', 'ETH'], icons: ['🎮', '⟠'], apy: 68.0, apr: 55.0, feeApr: 30.0, rewardApr: 25.0, tvl: 95000000, volume24h: 75000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'xai-arb-pool', name: 'XAI/ARB', tokens: ['XAI', 'ARB'], icons: ['🎮', '🔵'], apy: 75.0, apr: 60.0, feeApr: 35.0, rewardApr: 25.0, tvl: 42000000, volume24h: 32000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'pixel-sol-pool', name: 'PIXEL/SOL', tokens: ['PIXEL', 'SOL'], icons: ['🎮', '◎'], apy: 65.0, apr: 52.0, feeApr: 28.0, rewardApr: 24.0, tvl: 35000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'portal-eth-pool', name: 'PORTAL/ETH', tokens: ['PORTAL', 'ETH'], icons: ['🌀', '⟠'], apy: 85.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 28000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            // DeFi Governance Token Pools
            { id: 'crv-eth-pool', name: 'CRV/ETH', tokens: ['CRV', 'ETH'], icons: ['🔄', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            { id: 'cvx-eth-pool', name: 'CVX/ETH', tokens: ['CVX', 'ETH'], icons: ['🔒', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            { id: 'bal-eth-pool', name: 'BAL/ETH', tokens: ['BAL', 'ETH'], icons: ['⚖️', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'aura-eth-pool', name: 'AURA/ETH', tokens: ['AURA', 'ETH'], icons: ['✨', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'fxs-eth-pool', name: 'FXS/ETH', tokens: ['FXS', 'ETH'], icons: ['F', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 75000000, volume24h: 52000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Fraxswap' },
            { id: 'yfi-eth-pool', name: 'YFI/ETH', tokens: ['YFI', 'ETH'], icons: ['💙', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SushiSwap' },
            { id: 'comp-eth-pool', name: 'COMP/ETH', tokens: ['COMP', 'ETH'], icons: ['🏛️', '⟠'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'snx-eth-pool', name: 'SNX/ETH', tokens: ['SNX', 'ETH'], icons: ['🔷', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 115000000, volume24h: 85000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Velodrome' },
            { id: 'rpl-eth-pool', name: 'RPL/ETH', tokens: ['RPL', 'ETH'], icons: ['🚀', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Infrastructure Token Pools
            { id: 'qnt-eth-pool', name: 'QNT/ETH', tokens: ['QNT', 'ETH'], icons: ['🔗', '⟠'], apy: 18.0, apr: 15.0, feeApr: 8.0, rewardApr: 7.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'api3-eth-pool', name: 'API3/ETH', tokens: ['API3', 'ETH'], icons: ['📡', '⟠'], apy: 42.0, apr: 35.0, feeApr: 18.0, rewardApr: 17.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'flr-usdt-pool', name: 'FLR/USDT', tokens: ['FLR', 'USDT'], icons: ['⚡', '₮'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Pangolin' },
            { id: 'sgb-usdt-pool', name: 'SGB/USDT', tokens: ['SGB', 'USDT'], icons: ['🐦', '₮'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Pangolin' },
            { id: 'hnt-sol-pool', name: 'HNT/SOL', tokens: ['HNT', 'SOL'], icons: ['📡', '◎'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Orca' },
            { id: 'mobile-sol-pool', name: 'MOBILE/SOL', tokens: ['MOBILE', 'SOL'], icons: ['📱', '◎'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Orca' },
            { id: 'iotx-eth-pool', name: 'IOTX/ETH', tokens: ['IOTX', 'ETH'], icons: ['🔌', '⟠'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 65000000, volume24h: 45000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // === POOLS BATCH 12 - BRONTO EXPANSION ===
            // Privacy & Security Token Pools
            { id: 'zec-btc-pool', name: 'ZEC/BTC', tokens: ['ZEC', 'BTC'], icons: ['🔒', '₿'], apy: 15.0, apr: 12.0, feeApr: 7.0, rewardApr: 5.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'THORChain' },
            { id: 'dash-btc-pool', name: 'DASH/BTC', tokens: ['DASH', 'BTC'], icons: ['💨', '₿'], apy: 18.0, apr: 15.0, feeApr: 9.0, rewardApr: 6.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'THORChain' },
            { id: 'scrt-atom-pool', name: 'SCRT/ATOM', tokens: ['SCRT', 'ATOM'], icons: ['🤫', '⚛️'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Shade' },
            { id: 'rose-eth-pool', name: 'ROSE/ETH', tokens: ['ROSE', 'ETH'], icons: ['🌹', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'keep-eth-pool', name: 'KEEP/ETH', tokens: ['KEEP', 'ETH'], icons: ['🔑', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // Cross-Chain & Bridge Token Pools
            { id: 'rune-btc-pool', name: 'RUNE/BTC', tokens: ['RUNE', 'BTC'], icons: ['⚡', '₿'], apy: 45.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'THORChain' },
            { id: 'axl-usdc-pool', name: 'AXL/USDC', tokens: ['AXL', 'USDC'], icons: ['🌐', '💵'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 72000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'syn-eth-pool', name: 'SYN/ETH', tokens: ['SYN', 'ETH'], icons: ['🔗', '⟠'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 58000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'stg-eth-pool', name: 'STG/ETH', tokens: ['STG', 'ETH'], icons: ['⭐', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Stargate' },
            { id: 'w-eth-pool', name: 'W/ETH', tokens: ['W', 'ETH'], icons: ['🕳️', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'across-eth-pool', name: 'ACROSS/ETH', tokens: ['ACROSS', 'ETH'], icons: ['🌉', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // Storage & Compute Token Pools
            { id: 'fil-eth-pool', name: 'FIL/ETH', tokens: ['FIL', 'ETH'], icons: ['📁', '⟠'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ar-usdc-pool', name: 'AR/USDC', tokens: ['AR', 'USDC'], icons: ['🏛️', '💵'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'storj-eth-pool', name: 'STORJ/ETH', tokens: ['STORJ', 'ETH'], icons: ['☁️', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'sc-btc-pool', name: 'SC/BTC', tokens: ['SC', 'BTC'], icons: ['💾', '₿'], apy: 25.0, apr: 20.0, feeApr: 11.0, rewardApr: 9.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'TraderJoe' },
            { id: 'theta-eth-pool', name: 'THETA/ETH', tokens: ['THETA', 'ETH'], icons: ['📺', '⟠'], apy: 20.0, apr: 16.0, feeApr: 9.0, rewardApr: 7.0, tvl: 125000000, volume24h: 82000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'tfuel-theta-pool', name: 'TFUEL/THETA', tokens: ['TFUEL', 'THETA'], icons: ['⛽', '📺'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 45000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'ThetaSwap' },

            // Move-Based & New L1 Token Pools
            { id: 'apt-usdc-pool', name: 'APT/USDC', tokens: ['APT', 'USDC'], icons: ['🔷', '💵'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 195000000, volume24h: 135000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'sui-usdc-pool', name: 'SUI/USDC', tokens: ['SUI', 'USDC'], icons: ['💧', '💵'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 285000000, volume24h: 195000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Cetus' },
            { id: 'sei-usdc-pool', name: 'SEI/USDC', tokens: ['SEI', 'USDC'], icons: ['🌊', '💵'], apy: 45.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Astroport' },
            { id: 'cetus-sui-pool', name: 'CETUS/SUI', tokens: ['CETUS', 'SUI'], icons: ['🐋', '💧'], apy: 65.0, apr: 55.0, feeApr: 30.0, rewardApr: 25.0, tvl: 75000000, volume24h: 52000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Cetus' },
            { id: 'navi-sui-pool', name: 'NAVI/SUI', tokens: ['NAVI', 'SUI'], icons: ['🧭', '💧'], apy: 72.0, apr: 60.0, feeApr: 35.0, rewardApr: 25.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Cetus' },

            // New DeFi & Restaking Token Pools
            { id: 'morpho-eth-pool', name: 'MORPHO/ETH', tokens: ['MORPHO', 'ETH'], icons: ['🦋', '⟠'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 85000000, volume24h: 58000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'ethfi-eth-pool', name: 'ETHFI/ETH', tokens: ['ETHFI', 'ETH'], icons: ['🔥', '⟠'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 125000000, volume24h: 82000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'puffer-eth-pool', name: 'PUFFER/ETH', tokens: ['PUFFER', 'ETH'], icons: ['🐡', '⟠'], apy: 62.0, apr: 52.0, feeApr: 28.0, rewardApr: 24.0, tvl: 65000000, volume24h: 45000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'rez-eth-pool', name: 'REZ/ETH', tokens: ['REZ', 'ETH'], icons: ['♻️', '⟠'], apy: 75.0, apr: 62.0, feeApr: 35.0, rewardApr: 27.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'kelp-eth-pool', name: 'KELP/ETH', tokens: ['KELP', 'ETH'], icons: ['🌿', '⟠'], apy: 58.0, apr: 48.0, feeApr: 26.0, rewardApr: 22.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'blast-eth-pool', name: 'BLAST/ETH', tokens: ['BLAST', 'ETH'], icons: ['💥', '⟠'], apy: 85.0, apr: 70.0, feeApr: 40.0, rewardApr: 30.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Thruster' },

            // Exchange & Utility Token Pools
            { id: 'bnb-usdt-pool', name: 'BNB/USDT', tokens: ['BNB', 'USDT'], icons: ['💛', '₮'], apy: 12.0, apr: 9.5, feeApr: 5.5, rewardApr: 4.0, tvl: 850000000, volume24h: 580000000, fee: 0.3, risk: 'low', impermanentLoss: 'Low IL', protocol: 'PancakeSwap' },
            { id: 'okb-usdt-pool', name: 'OKB/USDT', tokens: ['OKB', 'USDT'], icons: ['🔵', '₮'], apy: 15.0, apr: 12.0, feeApr: 7.0, rewardApr: 5.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'OKX DEX' },
            { id: 'gt-usdt-pool', name: 'GT/USDT', tokens: ['GT', 'USDT'], icons: ['🟢', '₮'], apy: 18.0, apr: 14.0, feeApr: 8.0, rewardApr: 6.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'Gate.io DEX' },
            { id: 'mx-usdt-pool', name: 'MX/USDT', tokens: ['MX', 'USDT'], icons: ['Ⓜ️', '₮'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'MEXC DEX' },
            { id: 'ht-usdt-pool', name: 'HT/USDT', tokens: ['HT', 'USDT'], icons: ['🔶', '₮'], apy: 16.0, apr: 13.0, feeApr: 7.5, rewardApr: 5.5, tvl: 72000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'HECO' },

            // === POOLS BATCH 13 - GIGA EXPANSION ===
            // DePIN & IoT Token Pools
            { id: 'dimo-eth-pool', name: 'DIMO/ETH', tokens: ['DIMO', 'ETH'], icons: ['🚗', '⟠'], apy: 45.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'honey-sol-pool', name: 'HONEY/SOL', tokens: ['HONEY', 'SOL'], icons: ['🗺️', '◎'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Orca' },
            { id: 'render-eth-pool', name: 'RENDER/ETH', tokens: ['RENDER', 'ETH'], icons: ['🎨', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'grass-sol-pool', name: 'GRASS/SOL', tokens: ['GRASS', 'SOL'], icons: ['🌱', '◎'], apy: 85.0, apr: 70.0, feeApr: 40.0, rewardApr: 30.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'geod-sol-pool', name: 'GEOD/SOL', tokens: ['GEOD', 'SOL'], icons: ['🛰️', '◎'], apy: 65.0, apr: 55.0, feeApr: 30.0, rewardApr: 25.0, tvl: 12000000, volume24h: 8000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Raydium' },

            // RWA Token Pools
            { id: 'mpl-eth-pool', name: 'MPL/ETH', tokens: ['MPL', 'ETH'], icons: ['🍁', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'cfg-eth-pool', name: 'CFG/ETH', tokens: ['CFG', 'ETH'], icons: ['🌀', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'gfi-usdc-pool', name: 'GFI/USDC', tokens: ['GFI', 'USDC'], icons: ['🐦', '💵'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'polyx-usdt-pool', name: 'POLYX/USDT', tokens: ['POLYX', 'USDT'], icons: ['🔷', '₮'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'PancakeSwap' },
            { id: 'rio-eth-pool', name: 'RIO/ETH', tokens: ['RIO', 'ETH'], icons: ['🏢', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // Social Token Pools
            { id: 'friend-eth-pool', name: 'FRIEND/ETH', tokens: ['FRIEND', 'ETH'], icons: ['👥', '⟠'], apy: 95.0, apr: 80.0, feeApr: 45.0, rewardApr: 35.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Base DEX' },
            { id: 'lens-matic-pool', name: 'LENS/MATIC', tokens: ['LENS', 'MATIC'], icons: ['🔍', '⬡'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'QuickSwap' },
            { id: 'deso-usdc-pool', name: 'DESO/USDC', tokens: ['DESO', 'USDC'], icons: ['📱', '💵'], apy: 25.0, apr: 20.0, feeApr: 11.0, rewardApr: 9.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'rly-eth-pool', name: 'RLY/ETH', tokens: ['RLY', 'ETH'], icons: ['🎭', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'gal-bnb-pool', name: 'GAL/BNB', tokens: ['GAL', 'BNB'], icons: ['🌌', '💛'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 52000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },

            // Prediction Market Pools
            { id: 'gno-eth-pool', name: 'GNO/ETH', tokens: ['GNO', 'ETH'], icons: ['🦉', '⟠'], apy: 18.0, apr: 14.0, feeApr: 8.0, rewardApr: 6.0, tvl: 225000000, volume24h: 150000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Balancer' },
            { id: 'rep-eth-pool', name: 'REP/ETH', tokens: ['REP', 'ETH'], icons: ['🔮', '⟠'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'uma-eth-pool', name: 'UMA/ETH', tokens: ['UMA', 'ETH'], icons: ['🔔', '⟠'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 58000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'trb-eth-pool', name: 'TRB/ETH', tokens: ['TRB', 'ETH'], icons: ['📊', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // MEV & Infrastructure Pools
            { id: 'cow-eth-pool', name: 'COW/ETH', tokens: ['COW', 'ETH'], icons: ['🐄', '⟠'], apy: 25.0, apr: 20.0, feeApr: 11.0, rewardApr: 9.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'CoW Swap' },
            { id: 'eden-eth-pool', name: 'EDEN/ETH', tokens: ['EDEN', 'ETH'], icons: ['🌳', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // Cosmos Ecosystem Pools
            { id: 'dydx-usdc-pool', name: 'DYDX/USDC', tokens: ['DYDX', 'USDC'], icons: ['📈', '💵'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 345000000, volume24h: 225000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'dYdX' },
            { id: 'strd-atom-pool', name: 'STRD/ATOM', tokens: ['STRD', 'ATOM'], icons: ['🏃', '⚛️'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'ntrn-atom-pool', name: 'NTRN/ATOM', tokens: ['NTRN', 'ATOM'], icons: ['⚛️', '⚛️'], apy: 38.0, apr: 32.0, feeApr: 18.0, rewardApr: 14.0, tvl: 115000000, volume24h: 75000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Astroport' },
            { id: 'akt-usdc-pool', name: 'AKT/USDC', tokens: ['AKT', 'USDC'], icons: ['☁️', '💵'], apy: 48.0, apr: 40.0, feeApr: 22.0, rewardApr: 18.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'kuji-usdc-pool', name: 'KUJI/USDC', tokens: ['KUJI', 'USDC'], icons: ['🐋', '💵'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 52000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Kujira' },
            { id: 'mars-osmo-pool', name: 'MARS/OSMO', tokens: ['MARS', 'OSMO'], icons: ['🔴', '🌀'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Osmosis' },

            // Bitcoin L2 & Ordinals Pools
            { id: 'stx-btc-pool', name: 'STX/BTC', tokens: ['STX', 'BTC'], icons: ['📦', '₿'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 225000000, volume24h: 150000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'ALEX' },
            { id: 'ordi-btc-pool', name: 'ORDI/BTC', tokens: ['ORDI', 'BTC'], icons: ['🟡', '₿'], apy: 35.0, apr: 28.0, feeApr: 15.0, rewardApr: 13.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'ALEX' },
            { id: 'sats-btc-pool', name: 'SATS/BTC', tokens: ['SATS', 'BTC'], icons: ['⚡', '₿'], apy: 55.0, apr: 45.0, feeApr: 25.0, rewardApr: 20.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'ALEX' },
            { id: 'alex-stx-pool', name: 'ALEX/STX', tokens: ['ALEX', 'STX'], icons: ['🔶', '📦'], apy: 42.0, apr: 35.0, feeApr: 20.0, rewardApr: 15.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'ALEX' },
            { id: 'runes-btc-pool', name: 'RUNES/BTC', tokens: ['RUNES', 'BTC'], icons: ['🪨', '₿'], apy: 75.0, apr: 62.0, feeApr: 35.0, rewardApr: 27.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'ALEX' },

            // === POOLS BATCH 14 - TERA EXPANSION ===
            // Liquid Restaking Token Pools
            { id: 'ezeth-eth-pool', name: 'ezETH/ETH', tokens: ['ezETH', 'ETH'], icons: ['🔄', '⟠'], apy: 18.0, apr: 14.0, feeApr: 8.0, rewardApr: 6.0, tvl: 485000000, volume24h: 320000000, fee: 0.05, risk: 'low', impermanentLoss: 'Very Low IL', protocol: 'Balancer' },
            { id: 'rseth-eth-pool', name: 'rsETH/ETH', tokens: ['rsETH', 'ETH'], icons: ['♻️', '⟠'], apy: 16.5, apr: 13.0, feeApr: 7.5, rewardApr: 5.5, tvl: 325000000, volume24h: 215000000, fee: 0.05, risk: 'low', impermanentLoss: 'Very Low IL', protocol: 'Balancer' },
            { id: 'weeth-eth-pool', name: 'weETH/ETH', tokens: ['weETH', 'ETH'], icons: ['🌊', '⟠'], apy: 17.0, apr: 13.5, feeApr: 7.8, rewardApr: 5.7, tvl: 625000000, volume24h: 410000000, fee: 0.05, risk: 'low', impermanentLoss: 'Very Low IL', protocol: 'Balancer' },
            { id: 'pufeth-eth-pool', name: 'pufETH/ETH', tokens: ['pufETH', 'ETH'], icons: ['🐡', '⟠'], apy: 19.0, apr: 15.0, feeApr: 8.5, rewardApr: 6.5, tvl: 185000000, volume24h: 125000000, fee: 0.05, risk: 'low', impermanentLoss: 'Very Low IL', protocol: 'Balancer' },
            { id: 'sweth-eth-pool', name: 'swETH/ETH', tokens: ['swETH', 'ETH'], icons: ['💧', '⟠'], apy: 15.5, apr: 12.0, feeApr: 7.0, rewardApr: 5.0, tvl: 295000000, volume24h: 195000000, fee: 0.05, risk: 'low', impermanentLoss: 'Very Low IL', protocol: 'Balancer' },

            // Perpetual DEX Governance Pools
            { id: 'hype-usdc-pool', name: 'HYPE/USDC', tokens: ['HYPE', 'USDC'], icons: ['🚀', '💵'], apy: 65.0, apr: 52.0, feeApr: 30.0, rewardApr: 22.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Hyperliquid' },
            { id: 'vrtx-usdc-pool', name: 'VRTX/USDC', tokens: ['VRTX', 'USDC'], icons: ['🔺', '💵'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Vertex' },
            { id: 'apex-usdc-pool', name: 'APEX/USDC', tokens: ['APEX', 'USDC'], icons: ['🔼', '💵'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'ApeX Pro' },
            { id: 'rbx-eth-pool', name: 'RBX/ETH', tokens: ['RBX', 'ETH'], icons: ['📦', '⟠'], apy: 55.0, apr: 44.0, feeApr: 25.0, rewardApr: 19.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'blue-usdc-pool', name: 'BLUE/USDC', tokens: ['BLUE', 'USDC'], icons: ['🔵', '💵'], apy: 38.0, apr: 30.0, feeApr: 17.0, rewardApr: 13.0, tvl: 52000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Bluefin' },

            // ZK & Privacy L2 Pools
            { id: 'linea-eth-pool', name: 'LINEA/ETH', tokens: ['LINEA', 'ETH'], icons: ['📐', '⟠'], apy: 45.0, apr: 36.0, feeApr: 20.0, rewardApr: 16.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SyncSwap' },
            { id: 'scroll-eth-pool', name: 'SCROLL/ETH', tokens: ['SCROLL', 'ETH'], icons: ['📜', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Ambient' },
            { id: 'taiko-eth-pool', name: 'TAIKO/ETH', tokens: ['TAIKO', 'ETH'], icons: ['🥁', '⟠'], apy: 58.0, apr: 46.0, feeApr: 26.0, rewardApr: 20.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'manta-eth-pool', name: 'MANTA/ETH', tokens: ['MANTA', 'ETH'], icons: ['🐋', '⟠'], apy: 42.0, apr: 34.0, feeApr: 19.0, rewardApr: 15.0, tvl: 165000000, volume24h: 110000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Quickswap' },
            { id: 'mode-eth-pool', name: 'MODE/ETH', tokens: ['MODE', 'ETH'], icons: ['🎮', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Velodrome' },

            // Solana Ecosystem New Pools
            { id: 'pyth-sol-pool', name: 'PYTH/SOL', tokens: ['PYTH', 'SOL'], icons: ['🐍', '◎'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 285000000, volume24h: 190000000, fee: 0.25, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Orca' },
            { id: 'w-sol-pool', name: 'W/SOL', tokens: ['W', 'SOL'], icons: ['🌉', '◎'], apy: 55.0, apr: 44.0, feeApr: 25.0, rewardApr: 19.0, tvl: 425000000, volume24h: 285000000, fee: 0.25, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'tnsr-sol-pool', name: 'TNSR/SOL', tokens: ['TNSR', 'SOL'], icons: ['🎯', '◎'], apy: 62.0, apr: 50.0, feeApr: 28.0, rewardApr: 22.0, tvl: 145000000, volume24h: 95000000, fee: 0.25, risk: 'high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'kmno-sol-pool', name: 'KMNO/SOL', tokens: ['KMNO', 'SOL'], icons: ['🎰', '◎'], apy: 72.0, apr: 58.0, feeApr: 33.0, rewardApr: 25.0, tvl: 185000000, volume24h: 125000000, fee: 0.25, risk: 'high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'prcl-sol-pool', name: 'PRCL/SOL', tokens: ['PRCL', 'SOL'], icons: ['📦', '◎'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 65000000, volume24h: 42000000, fee: 0.25, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Orca' },

            // Appchain & Modular Pools
            { id: 'dym-usdc-pool', name: 'DYM/USDC', tokens: ['DYM', 'USDC'], icons: ['🔮', '💵'], apy: 45.0, apr: 36.0, feeApr: 20.0, rewardApr: 16.0, tvl: 165000000, volume24h: 110000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'saga-usdc-pool', name: 'SAGA/USDC', tokens: ['SAGA', 'USDC'], icons: ['📖', '💵'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Osmosis' },
            { id: 'alt-eth-pool', name: 'ALT/ETH', tokens: ['ALT', 'ETH'], icons: ['🔷', '⟠'], apy: 58.0, apr: 46.0, feeApr: 26.0, rewardApr: 20.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'avail-usdc-pool', name: 'AVAIL/USDC', tokens: ['AVAIL', 'USDC'], icons: ['✅', '💵'], apy: 65.0, apr: 52.0, feeApr: 30.0, rewardApr: 22.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'omni-eth-pool', name: 'OMNI/ETH', tokens: ['OMNI', 'ETH'], icons: ['🌐', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // Intent & Chain Abstraction Pools
            { id: 'parti-usdc-pool', name: 'PARTI/USDC', tokens: ['PARTI', 'USDC'], icons: ['🎉', '💵'], apy: 72.0, apr: 58.0, feeApr: 33.0, rewardApr: 25.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Particle' },
            { id: 'socket-eth-pool', name: 'SOCKET/ETH', tokens: ['SOCKET', 'ETH'], icons: ['🔌', '⟠'], apy: 45.0, apr: 36.0, feeApr: 20.0, rewardApr: 16.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'lifi-eth-pool', name: 'LIFI/ETH', tokens: ['LIFI', 'ETH'], icons: ['🔗', '⟠'], apy: 38.0, apr: 30.0, feeApr: 17.0, rewardApr: 13.0, tvl: 52000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'jump-sol-pool', name: 'JUMP/SOL', tokens: ['JUMP', 'SOL'], icons: ['🦘', '◎'], apy: 55.0, apr: 44.0, feeApr: 25.0, rewardApr: 19.0, tvl: 42000000, volume24h: 28000000, fee: 0.25, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Raydium' },

            // AI Agents & Automation Pools
            { id: 'virtual-eth-pool', name: 'VIRTUAL/ETH', tokens: ['VIRTUAL', 'ETH'], icons: ['🤖', '⟠'], apy: 85.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 285000000, volume24h: 190000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'ai16z-sol-pool', name: 'AI16Z/SOL', tokens: ['AI16Z', 'SOL'], icons: ['🧠', '◎'], apy: 125.0, apr: 100.0, feeApr: 55.0, rewardApr: 45.0, tvl: 165000000, volume24h: 110000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'griff-sol-pool', name: 'GRIFF/SOL', tokens: ['GRIFF', 'SOL'], icons: ['🦅', '◎'], apy: 95.0, apr: 76.0, feeApr: 42.0, rewardApr: 34.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'zerebro-sol-pool', name: 'ZEREBRO/SOL', tokens: ['ZEREBRO', 'SOL'], icons: ['🧬', '◎'], apy: 145.0, apr: 116.0, feeApr: 65.0, rewardApr: 51.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'arc-eth-pool', name: 'ARC/ETH', tokens: ['ARC', 'ETH'], icons: ['⚡', '⟠'], apy: 78.0, apr: 62.0, feeApr: 35.0, rewardApr: 27.0, tvl: 75000000, volume24h: 50000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },

            // === POOLS BATCH 15 - PETA EXPANSION ===
            // Consumer Apps & Move-to-Earn Pools
            { id: 'gmt-usdc-pool', name: 'GMT/USDC', tokens: ['GMT', 'USDC'], icons: ['👟', '💵'], apy: 25.0, apr: 20.0, feeApr: 11.0, rewardApr: 9.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Raydium' },
            { id: 'sweat-usdc-pool', name: 'SWEAT/USDC', tokens: ['SWEAT', 'USDC'], icons: ['💧', '💵'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 75000000, volume24h: 50000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'NEAR' },
            { id: 'axs-eth-pool', name: 'AXS/ETH', tokens: ['AXS', 'ETH'], icons: ['⚔️', '⟠'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 285000000, volume24h: 195000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'mana-eth-pool', name: 'MANA/ETH', tokens: ['MANA', 'ETH'], icons: ['🌐', '⟠'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'sand-eth-pool', name: 'SAND/ETH', tokens: ['SAND', 'ETH'], icons: ['🏖️', '⟠'], apy: 25.0, apr: 20.0, feeApr: 11.0, rewardApr: 9.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // NFT Infrastructure Pools
            { id: 'blur-eth-pool', name: 'BLUR/ETH', tokens: ['BLUR', 'ETH'], icons: ['🟠', '⟠'], apy: 42.0, apr: 34.0, feeApr: 19.0, rewardApr: 15.0, tvl: 195000000, volume24h: 135000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'sudo-eth-pool', name: 'SUDO/ETH', tokens: ['SUDO', 'ETH'], icons: ['🔄', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'looks-eth-pool', name: 'LOOKS/ETH', tokens: ['LOOKS', 'ETH'], icons: ['👀', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'magic-eth-pool', name: 'MAGIC/ETH', tokens: ['MAGIC', 'ETH'], icons: ['✨', '⟠'], apy: 55.0, apr: 44.0, feeApr: 25.0, rewardApr: 19.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Arbitrum' },

            // Music & Entertainment Pools
            { id: 'audio-eth-pool', name: 'AUDIO/ETH', tokens: ['AUDIO', 'ETH'], icons: ['🎵', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'xcad-eth-pool', name: 'XCAD/ETH', tokens: ['XCAD', 'ETH'], icons: ['📺', '⟠'], apy: 45.0, apr: 36.0, feeApr: 20.0, rewardApr: 16.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'vra-eth-pool', name: 'VRA/ETH', tokens: ['VRA', 'ETH'], icons: ['🎬', '⟠'], apy: 38.0, apr: 30.0, feeApr: 17.0, rewardApr: 13.0, tvl: 45000000, volume24h: 30000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // Sports Fan Token Pools
            { id: 'chz-usdc-pool', name: 'CHZ/USDC', tokens: ['CHZ', 'USDC'], icons: ['⚽', '💵'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 225000000, volume24h: 155000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'santos-chz-pool', name: 'SANTOS/CHZ', tokens: ['SANTOS', 'CHZ'], icons: ['🇧🇷', '⚽'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'bar-chz-pool', name: 'BAR/CHZ', tokens: ['BAR', 'CHZ'], icons: ['🔵🔴', '⚽'], apy: 18.0, apr: 14.0, feeApr: 8.0, rewardApr: 6.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'psg-chz-pool', name: 'PSG/CHZ', tokens: ['PSG', 'CHZ'], icons: ['🔵', '⚽'], apy: 16.0, apr: 13.0, feeApr: 7.0, rewardApr: 6.0, tvl: 25000000, volume24h: 16000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },
            { id: 'juv-chz-pool', name: 'JUV/CHZ', tokens: ['JUV', 'CHZ'], icons: ['⚫⚪', '⚽'], apy: 15.0, apr: 12.0, feeApr: 7.0, rewardApr: 5.0, tvl: 22000000, volume24h: 14000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Chiliz' },

            // Gaming Infrastructure Pools
            { id: 'beam-eth-pool', name: 'BEAM/ETH', tokens: ['BEAM', 'ETH'], icons: ['🎮', '⟠'], apy: 65.0, apr: 52.0, feeApr: 30.0, rewardApr: 22.0, tvl: 105000000, volume24h: 72000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'ilv-eth-pool', name: 'ILV/ETH', tokens: ['ILV', 'ETH'], icons: ['🎯', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 75000000, volume24h: 52000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'gods-eth-pool', name: 'GODS/ETH', tokens: ['GODS', 'ETH'], icons: ['⚡', '⟠'], apy: 45.0, apr: 36.0, feeApr: 20.0, rewardApr: 16.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'ygg-eth-pool', name: 'YGG/ETH', tokens: ['YGG', 'ETH'], icons: ['🏴‍☠️', '⟠'], apy: 38.0, apr: 30.0, feeApr: 17.0, rewardApr: 13.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'mc-eth-pool', name: 'MC/ETH', tokens: ['MC', 'ETH'], icons: ['⭐', '⟠'], apy: 42.0, apr: 34.0, feeApr: 19.0, rewardApr: 15.0, tvl: 52000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },

            // Base Ecosystem Pools
            { id: 'aero-eth-pool', name: 'AERO/ETH', tokens: ['AERO', 'ETH'], icons: ['✈️', '⟠'], apy: 58.0, apr: 46.0, feeApr: 26.0, rewardApr: 20.0, tvl: 265000000, volume24h: 185000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Aerodrome' },
            { id: 'extra-eth-pool', name: 'EXTRA/ETH', tokens: ['EXTRA', 'ETH'], icons: ['🌟', '⟠'], apy: 75.0, apr: 60.0, feeApr: 34.0, rewardApr: 26.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Aerodrome' },
            { id: 'brett-eth-pool', name: 'BRETT/ETH', tokens: ['BRETT', 'ETH'], icons: ['🐸', '⟠'], apy: 95.0, apr: 76.0, feeApr: 42.0, rewardApr: 34.0, tvl: 165000000, volume24h: 115000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Aerodrome' },
            { id: 'degen-eth-pool', name: 'DEGEN/ETH', tokens: ['DEGEN', 'ETH'], icons: ['🎰', '⟠'], apy: 115.0, apr: 92.0, feeApr: 52.0, rewardApr: 40.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Aerodrome' },
            { id: 'toshi-eth-pool', name: 'TOSHI/ETH', tokens: ['TOSHI', 'ETH'], icons: ['🐱', '⟠'], apy: 85.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 62000000, volume24h: 42000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Aerodrome' },

            // New Solana Meme Pools
            { id: 'popcat-sol-pool', name: 'POPCAT/SOL', tokens: ['POPCAT', 'SOL'], icons: ['😺', '◎'], apy: 125.0, apr: 100.0, feeApr: 55.0, rewardApr: 45.0, tvl: 145000000, volume24h: 100000000, fee: 0.25, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'mew-sol-pool', name: 'MEW/SOL', tokens: ['MEW', 'SOL'], icons: ['🐈', '◎'], apy: 145.0, apr: 116.0, feeApr: 65.0, rewardApr: 51.0, tvl: 115000000, volume24h: 80000000, fee: 0.25, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'wen-sol-pool', name: 'WEN/SOL', tokens: ['WEN', 'SOL'], icons: ['🔜', '◎'], apy: 115.0, apr: 92.0, feeApr: 52.0, rewardApr: 40.0, tvl: 75000000, volume24h: 52000000, fee: 0.25, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'bome-sol-pool', name: 'BOME/SOL', tokens: ['BOME', 'SOL'], icons: ['📖', '◎'], apy: 135.0, apr: 108.0, feeApr: 60.0, rewardApr: 48.0, tvl: 185000000, volume24h: 125000000, fee: 0.25, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'slerf-sol-pool', name: 'SLERF/SOL', tokens: ['SLERF', 'SOL'], icons: ['🦥', '◎'], apy: 155.0, apr: 124.0, feeApr: 70.0, rewardApr: 54.0, tvl: 65000000, volume24h: 45000000, fee: 0.25, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },

            // === POOLS BATCH 16 - EXA EXPANSION ===
            // Real Yield DEX Pools
            { id: 'gmx-eth-pool', name: 'GMX/ETH', tokens: ['GMX', 'ETH'], icons: ['📈', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 295000000, volume24h: 195000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'gns-dai-pool', name: 'GNS/DAI', tokens: ['GNS', 'DAI'], icons: ['📊', '◈'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 85000000, volume24h: 58000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Polygon' },
            { id: 'velo-usdc-pool', name: 'VELO/USDC', tokens: ['VELO', 'USDC'], icons: ['🔴', '💵'], apy: 65.0, apr: 52.0, feeApr: 30.0, rewardApr: 22.0, tvl: 165000000, volume24h: 115000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Velodrome' },
            { id: 'the-usdc-pool', name: 'THE/USDC', tokens: ['THE', 'USDC'], icons: ['🟣', '💵'], apy: 78.0, apr: 62.0, feeApr: 35.0, rewardApr: 27.0, tvl: 75000000, volume24h: 52000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Thena' },
            { id: 'grail-eth-pool', name: 'GRAIL/ETH', tokens: ['GRAIL', 'ETH'], icons: ['🏆', '⟠'], apy: 45.0, apr: 36.0, feeApr: 20.0, rewardApr: 16.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Camelot' },

            // Telegram Bot Token Pools
            { id: 'unibot-eth-pool', name: 'UNIBOT/ETH', tokens: ['UNIBOT', 'ETH'], icons: ['🤖', '⟠'], apy: 55.0, apr: 44.0, feeApr: 25.0, rewardApr: 19.0, tvl: 52000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'banana-eth-pool', name: 'BANANA/ETH', tokens: ['BANANA', 'ETH'], icons: ['🍌', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 85000000, volume24h: 58000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'maestro-eth-pool', name: 'MAESTRO/ETH', tokens: ['MAESTRO', 'ETH'], icons: ['🎭', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },

            // TON Ecosystem Pools
            { id: 'ton-usdt-pool', name: 'TON/USDT', tokens: ['TON', 'USDT'], icons: ['💎', '₮'], apy: 15.0, apr: 12.0, feeApr: 7.0, rewardApr: 5.0, tvl: 685000000, volume24h: 450000000, fee: 0.1, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'STONfi' },
            { id: 'not-ton-pool', name: 'NOT/TON', tokens: ['NOT', 'TON'], icons: ['🎮', '💎'], apy: 75.0, apr: 60.0, feeApr: 34.0, rewardApr: 26.0, tvl: 165000000, volume24h: 115000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'STONfi' },
            { id: 'dogs-ton-pool', name: 'DOGS/TON', tokens: ['DOGS', 'TON'], icons: ['🐕', '💎'], apy: 85.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'STONfi' },
            { id: 'cati-ton-pool', name: 'CATI/TON', tokens: ['CATI', 'TON'], icons: ['🐱', '💎'], apy: 95.0, apr: 76.0, feeApr: 42.0, rewardApr: 34.0, tvl: 75000000, volume24h: 52000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'STONfi' },
            { id: 'hmstr-ton-pool', name: 'HMSTR/TON', tokens: ['HMSTR', 'TON'], icons: ['🐹', '💎'], apy: 115.0, apr: 92.0, feeApr: 52.0, rewardApr: 40.0, tvl: 105000000, volume24h: 72000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'STONfi' },

            // DEX Governance Pools
            { id: 'joe-avax-pool', name: 'JOE/AVAX', tokens: ['JOE', 'AVAX'], icons: ['🦫', '🔺'], apy: 42.0, apr: 34.0, feeApr: 19.0, rewardApr: 15.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Trader Joe' },
            { id: 'cake-bnb-pool', name: 'CAKE/BNB', tokens: ['CAKE', 'BNB'], icons: ['🥞', '💛'], apy: 22.0, apr: 18.0, feeApr: 10.0, rewardApr: 8.0, tvl: 265000000, volume24h: 175000000, fee: 0.25, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'PancakeSwap' },
            { id: 'sushi-eth-pool', name: 'SUSHI/ETH', tokens: ['SUSHI', 'ETH'], icons: ['🍣', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 115000000, volume24h: 78000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Sushi' },
            { id: 'quick-matic-pool', name: 'QUICK/MATIC', tokens: ['QUICK', 'MATIC'], icons: ['⚡', '⬡'], apy: 38.0, apr: 30.0, feeApr: 17.0, rewardApr: 13.0, tvl: 38000000, volume24h: 26000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'QuickSwap' },
            { id: 'knc-eth-pool', name: 'KNC/ETH', tokens: ['KNC', 'ETH'], icons: ['💚', '⟠'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 75000000, volume24h: 52000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Kyber' },

            // RWA Token Pools
            { id: 'ondo-usdc-pool', name: 'ONDO/USDC', tokens: ['ONDO', 'USDC'], icons: ['🏛️', '💵'], apy: 18.0, apr: 14.0, feeApr: 8.0, rewardApr: 6.0, tvl: 225000000, volume24h: 155000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'rsr-eth-pool', name: 'RSR/ETH', tokens: ['RSR', 'ETH'], icons: ['📈', '⟠'], apy: 28.0, apr: 22.0, feeApr: 12.0, rewardApr: 10.0, tvl: 85000000, volume24h: 58000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'eul-eth-pool', name: 'EUL/ETH', tokens: ['EUL', 'ETH'], icons: ['🏦', '⟠'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 38000000, volume24h: 26000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },

            // DeFi Infrastructure Pools
            { id: 'spell-eth-pool', name: 'SPELL/ETH', tokens: ['SPELL', 'ETH'], icons: ['✨', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Sushi' },
            { id: 'alcx-eth-pool', name: 'ALCX/ETH', tokens: ['ALCX', 'ETH'], icons: ['⚗️', '⟠'], apy: 38.0, apr: 30.0, feeApr: 17.0, rewardApr: 13.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Sushi' },
            { id: 'fxs-frax-pool', name: 'FXS/FRAX', tokens: ['FXS', 'FRAX'], icons: ['🅕', 'F'], apy: 32.0, apr: 26.0, feeApr: 14.0, rewardApr: 12.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'Fraxswap' },
            { id: 'crv-eth-pool', name: 'CRV/ETH', tokens: ['CRV', 'ETH'], icons: ['🔵', '⟠'], apy: 25.0, apr: 20.0, feeApr: 11.0, rewardApr: 9.0, tvl: 285000000, volume24h: 195000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            { id: 'cvx-eth-pool', name: 'CVX/ETH', tokens: ['CVX', 'ETH'], icons: ['⬛', '⟠'], apy: 38.0, apr: 30.0, feeApr: 17.0, rewardApr: 13.0, tvl: 165000000, volume24h: 115000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },

            // Options & Derivatives Pools
            { id: 'lyra-eth-pool', name: 'LYRA/ETH', tokens: ['LYRA', 'ETH'], icons: ['🎵', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 22000000, volume24h: 15000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'premia-eth-pool', name: 'PREMIA/ETH', tokens: ['PREMIA', 'ETH'], icons: ['💎', '⟠'], apy: 58.0, apr: 46.0, feeApr: 26.0, rewardApr: 20.0, tvl: 18000000, volume24h: 12000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Arbitrum' },
            { id: 'dpx-eth-pool', name: 'DPX/ETH', tokens: ['DPX', 'ETH'], icons: ['🔷', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 25000000, volume24h: 17000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Sushi' },
            { id: 'rdpx-eth-pool', name: 'RDPX/ETH', tokens: ['RDPX', 'ETH'], icons: ['🔴', '⟠'], apy: 65.0, apr: 52.0, feeApr: 30.0, rewardApr: 22.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Sushi' },

            // === POOLS BATCH 17 - ZETTA EXPANSION ===
            // Cross-Chain Bridge Pools
            { id: 'acx-eth-pool', name: 'ACX/ETH', tokens: ['ACX', 'ETH'], icons: ['🌉', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'hop-eth-pool', name: 'HOP/ETH', tokens: ['HOP', 'ETH'], icons: ['🐰', '⟠'], apy: 32.0, apr: 25.0, feeApr: 15.0, rewardApr: 10.0, tvl: 38000000, volume24h: 25000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'stg-eth-pool', name: 'STG/ETH', tokens: ['STG', 'ETH'], icons: ['⭐', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Stargate' },
            { id: 'syn-eth-pool', name: 'SYN/ETH', tokens: ['SYN', 'ETH'], icons: ['🧠', '⟠'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 42000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Synapse' },
            { id: 'celr-eth-pool', name: 'CELR/ETH', tokens: ['CELR', 'ETH'], icons: ['🔗', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            // Perpetual DEX Pools
            { id: 'apx-bnb-pool', name: 'APX/BNB', tokens: ['APX', 'BNB'], icons: ['🚀', '🔶'], apy: 55.0, apr: 44.0, feeApr: 26.0, rewardApr: 18.0, tvl: 48000000, volume24h: 32000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'PancakeSwap' },
            { id: 'aevo-eth-pool', name: 'AEVO/ETH', tokens: ['AEVO', 'ETH'], icons: ['📐', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 85000000, volume24h: 58000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'kwenta-eth-pool', name: 'KWENTA/ETH', tokens: ['KWENTA', 'ETH'], icons: ['🟡', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Velodrome' },
            { id: 'perp-usdc-pool', name: 'PERP/USDC', tokens: ['PERP', 'USDC'], icons: ['📊', '$'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'dydx-usdc-pool', name: 'DYDX/USDC', tokens: ['DYDX', 'USDC'], icons: ['📈', '$'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Launchpad Pools
            { id: 'prime-eth-pool', name: 'PRIME/ETH', tokens: ['PRIME', 'ETH'], icons: ['🎮', '⟠'], apy: 65.0, apr: 52.0, feeApr: 30.0, rewardApr: 22.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'sfund-bnb-pool', name: 'SFUND/BNB', tokens: ['SFUND', 'BNB'], icons: ['🌱', '🔶'], apy: 75.0, apr: 60.0, feeApr: 35.0, rewardApr: 25.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'PancakeSwap' },
            { id: 'dao-eth-pool', name: 'DAO/ETH', tokens: ['DAO', 'ETH'], icons: ['🏛️', '⟠'], apy: 58.0, apr: 46.0, feeApr: 28.0, rewardApr: 18.0, tvl: 38000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'pols-eth-pool', name: 'POLS/ETH', tokens: ['POLS', 'ETH'], icons: ['🔶', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'paid-eth-pool', name: 'PAID/ETH', tokens: ['PAID', 'ETH'], icons: ['💳', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            // Privacy Token Pools
            { id: 'rose-eth-pool', name: 'ROSE/ETH', tokens: ['ROSE', 'ETH'], icons: ['🌹', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'scrt-atom-pool', name: 'SCRT/ATOM', tokens: ['SCRT', 'ATOM'], icons: ['🤫', '⚛️'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'nym-eth-pool', name: 'NYM/ETH', tokens: ['NYM', 'ETH'], icons: ['👤', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 35000000, volume24h: 24000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'iron-eth-pool', name: 'IRON/ETH', tokens: ['IRON', 'ETH'], icons: ['🔒', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 20000000, volume24h: 14000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'azero-usdc-pool', name: 'AZERO/USDC', tokens: ['AZERO', 'USDC'], icons: ['🅰️', '$'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 98000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Aleph Zero DEX' },
            // Oracle Token Pools
            { id: 'band-eth-pool', name: 'BAND/ETH', tokens: ['BAND', 'ETH'], icons: ['📡', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 55000000, volume24h: 38000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'api3-eth-pool', name: 'API3/ETH', tokens: ['API3', 'ETH'], icons: ['🔌', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'uma-eth-pool', name: 'UMA/ETH', tokens: ['UMA', 'ETH'], icons: ['🔮', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'pyth-sol-pool', name: 'PYTH/SOL', tokens: ['PYTH', 'SOL'], icons: ['🐍', '◎'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Raydium' },
            { id: 'dia-eth-pool', name: 'DIA/ETH', tokens: ['DIA', 'ETH'], icons: ['💎', '⟠'], apy: 30.0, apr: 24.0, feeApr: 14.0, rewardApr: 10.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // DeFi Insurance Pools
            { id: 'wnxm-eth-pool', name: 'wNXM/ETH', tokens: ['wNXM', 'ETH'], icons: ['🛡️', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'insr-eth-pool', name: 'INSR/ETH', tokens: ['INSR', 'ETH'], icons: ['🔐', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 20000000, volume24h: 14000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'usf-eth-pool', name: 'USF/ETH', tokens: ['USF', 'ETH'], icons: ['⚔️', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'ease-eth-pool', name: 'EASE/ETH', tokens: ['EASE', 'ETH'], icons: ['😌', '⟠'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'armor-eth-pool', name: 'ARMOR/ETH', tokens: ['ARMOR', 'ETH'], icons: ['🛡️', '⟠'], apy: 55.0, apr: 44.0, feeApr: 26.0, rewardApr: 18.0, tvl: 10000000, volume24h: 7000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            // MEV Infrastructure Pools
            { id: 'eden-eth-pool', name: 'EDEN/ETH', tokens: ['EDEN', 'ETH'], icons: ['🌳', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 20000000, volume24h: 14000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'rook-eth-pool', name: 'ROOK/ETH', tokens: ['ROOK', 'ETH'], icons: ['♜', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'cow-eth-pool', name: 'COW/ETH', tokens: ['COW', 'ETH'], icons: ['🐮', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'CoW Protocol' },
            { id: 'fold-eth-pool', name: 'FOLD/ETH', tokens: ['FOLD', 'ETH'], icons: ['📄', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'flb-eth-pool', name: 'FLB/ETH', tokens: ['FLB', 'ETH'], icons: ['⚡', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 45000000, volume24h: 30000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },

            // === POOLS BATCH 18 - YOTTA EXPANSION ===
            // Data Availability Pools
            { id: 'tia-usdc-pool', name: 'TIA/USDC', tokens: ['TIA', 'USDC'], icons: ['🌌', '$'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'eigen-eth-pool', name: 'EIGEN/ETH', tokens: ['EIGEN', 'ETH'], icons: ['🔷', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 345000000, volume24h: 225000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'avail-eth-pool', name: 'AVAIL/ETH', tokens: ['AVAIL', 'ETH'], icons: ['📊', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'manta-eth-pool', name: 'MANTA/ETH', tokens: ['MANTA', 'ETH'], icons: ['🐋', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Manta DEX' },
            { id: 'nil-eth-pool', name: 'NIL/ETH', tokens: ['NIL', 'ETH'], icons: ['⭕', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 35000000, volume24h: 24000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            // Account Abstraction Pools
            { id: 'safe-eth-pool', name: 'SAFE/ETH', tokens: ['SAFE', 'ETH'], icons: ['🔐', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'CoW Protocol' },
            { id: 'bico-eth-pool', name: 'BICO/ETH', tokens: ['BICO', 'ETH'], icons: ['🔄', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'stack-eth-pool', name: 'STACK/ETH', tokens: ['STACK', 'ETH'], icons: ['📚', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'pim-eth-pool', name: 'PIM/ETH', tokens: ['PIM', 'ETH'], icons: ['🎩', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 20000000, volume24h: 14000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'zero-eth-pool', name: 'ZERO/ETH', tokens: ['ZERO', 'ETH'], icons: ['0️⃣', '⟠'], apy: 58.0, apr: 46.0, feeApr: 26.0, rewardApr: 20.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            // Liquid Staking Pools
            { id: 'ldo-eth-pool', name: 'LDO/ETH', tokens: ['LDO', 'ETH'], icons: ['🌊', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 345000000, volume24h: 225000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Curve' },
            { id: 'rpl-eth-pool', name: 'RPL/ETH', tokens: ['RPL', 'ETH'], icons: ['🚀', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Balancer' },
            { id: 'swise-eth-pool', name: 'SWISE/ETH', tokens: ['SWISE', 'ETH'], icons: ['🦉', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'sd-eth-pool', name: 'SD/ETH', tokens: ['SD', 'ETH'], icons: ['💎', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ankr-eth-pool', name: 'ANKR/ETH', tokens: ['ANKR', 'ETH'], icons: ['⚓', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Layer 0 / Interop Pools
            { id: 'zro-eth-pool', name: 'ZRO/ETH', tokens: ['ZRO', 'ETH'], icons: ['🔗', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Stargate' },
            { id: 'w-sol-pool', name: 'W/SOL', tokens: ['W', 'SOL'], icons: ['🪱', '◎'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Raydium' },
            { id: 'axl-eth-pool', name: 'AXL/ETH', tokens: ['AXL', 'ETH'], icons: ['🔄', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 125000000, volume24h: 82000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'zeta-eth-pool', name: 'ZETA/ETH', tokens: ['ZETA', 'ETH'], icons: ['Ζ', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'ZetaSwap' },
            { id: 'ccip-eth-pool', name: 'LINK/ETH', tokens: ['LINK', 'ETH'], icons: ['⛓️', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 295000000, volume24h: 195000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            // DEX Aggregator Pools
            { id: '1inch-eth-pool', name: '1INCH/ETH', tokens: ['1INCH', 'ETH'], icons: ['🦄', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: '1inch' },
            { id: 'psp-eth-pool', name: 'PSP/ETH', tokens: ['PSP', 'ETH'], icons: ['🦜', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'ParaSwap' },
            { id: 'odos-eth-pool', name: 'ODOS/ETH', tokens: ['ODOS', 'ETH'], icons: ['🛤️', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 35000000, volume24h: 24000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Odos' },
            { id: 'ooe-usdc-pool', name: 'OOE/USDC', tokens: ['OOE', 'USDC'], icons: ['🌊', '$'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'OpenOcean' },
            { id: 'knc-eth-pool', name: 'KNC/ETH', tokens: ['KNC', 'ETH'], icons: ['💎', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'KyberSwap' },
            // Yield Aggregator Pools
            { id: 'yfi-eth-pool', name: 'YFI/ETH', tokens: ['YFI', 'ETH'], icons: ['🏦', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Curve' },
            { id: 'farm-eth-pool', name: 'FARM/ETH', tokens: ['FARM', 'ETH'], icons: ['🌾', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 35000000, volume24h: 24000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'bifi-eth-pool', name: 'BIFI/ETH', tokens: ['BIFI', 'ETH'], icons: ['🐄', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Beefy' },
            { id: 'pickle-eth-pool', name: 'PICKLE/ETH', tokens: ['PICKLE', 'ETH'], icons: ['🥒', '⟠'], apy: 55.0, apr: 44.0, feeApr: 26.0, rewardApr: 18.0, tvl: 15000000, volume24h: 10000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'idle-eth-pool', name: 'IDLE/ETH', tokens: ['IDLE', 'ETH'], icons: ['💤', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Perpetual Protocol Pools
            { id: 'snx-eth-pool', name: 'SNX/ETH', tokens: ['SNX', 'ETH'], icons: ['🔮', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Velodrome' },
            { id: 'cap-eth-pool', name: 'CAP/ETH', tokens: ['CAP', 'ETH'], icons: ['🧢', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Arbitrum' },
            { id: 'lvl-bnb-pool', name: 'LVL/BNB', tokens: ['LVL', 'BNB'], icons: ['📈', '🔶'], apy: 55.0, apr: 44.0, feeApr: 26.0, rewardApr: 18.0, tvl: 38000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'PancakeSwap' },
            { id: 'mux-eth-pool', name: 'MUX/ETH', tokens: ['MUX', 'ETH'], icons: ['🎛️', '⟠'], apy: 52.0, apr: 42.0, feeApr: 24.0, rewardApr: 18.0, tvl: 32000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Arbitrum' },
            { id: 'hmx-eth-pool', name: 'HMX/ETH', tokens: ['HMX', 'ETH'], icons: ['🔥', '⟠'], apy: 65.0, apr: 52.0, feeApr: 30.0, rewardApr: 22.0, tvl: 20000000, volume24h: 14000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Arbitrum' },

            // === POOLS BATCH 19 - RONNA EXPANSION ===
            // Bitcoin DeFi Pools
            { id: 'rune-eth-pool', name: 'RUNE/ETH', tokens: ['RUNE', 'ETH'], icons: ['⚡', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'THORSwap' },
            { id: 'badger-wbtc-pool', name: 'BADGER/WBTC', tokens: ['BADGER', 'WBTC'], icons: ['🦡', '🟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'tbtc-wbtc-pool', name: 'tBTC/WBTC', tokens: ['tBTC', 'WBTC'], icons: ['₿', '🟠'], apy: 15.0, apr: 12.0, feeApr: 8.0, rewardApr: 4.0, tvl: 145000000, volume24h: 95000000, fee: 0.05, risk: 'low-medium', impermanentLoss: 'Very Low IL', protocol: 'Curve' },
            { id: 'sbtc-stx-pool', name: 'sBTC/STX', tokens: ['sBTC', 'STX'], icons: ['🔶', '📊'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Velar' },
            { id: 'wbtc-eth-pool', name: 'WBTC/ETH', tokens: ['WBTC', 'ETH'], icons: ['🟠', '⟠'], apy: 12.0, apr: 10.0, feeApr: 8.0, rewardApr: 2.0, tvl: 345000000, volume24h: 225000000, fee: 0.3, risk: 'low', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            // Cosmos Ecosystem Pools
            { id: 'atom-osmo-pool', name: 'ATOM/OSMO', tokens: ['ATOM', 'OSMO'], icons: ['⚛️', '🧪'], apy: 35.0, apr: 28.0, feeApr: 18.0, rewardApr: 10.0, tvl: 145000000, volume24h: 95000000, fee: 0.2, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'osmo-usdc-pool', name: 'OSMO/USDC', tokens: ['OSMO', 'USDC'], icons: ['🧪', '$'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 125000000, volume24h: 82000000, fee: 0.2, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'inj-usdt-pool', name: 'INJ/USDT', tokens: ['INJ', 'USDT'], icons: ['💉', '$'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Helix' },
            { id: 'sei-usdc-pool', name: 'SEI/USDC', tokens: ['SEI', 'USDC'], icons: ['🌊', '$'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 125000000, volume24h: 82000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Astroport' },
            { id: 'kava-usdt-pool', name: 'KAVA/USDT', tokens: ['KAVA', 'USDT'], icons: ['🔴', '$'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Kava Swap' },
            // Polkadot Ecosystem Pools
            { id: 'dot-usdt-pool', name: 'DOT/USDT', tokens: ['DOT', 'USDT'], icons: ['⬡', '$'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 345000000, volume24h: 225000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'HydraDX' },
            { id: 'ksm-usdt-pool', name: 'KSM/USDT', tokens: ['KSM', 'USDT'], icons: ['🐦', '$'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Karura' },
            { id: 'astr-eth-pool', name: 'ASTR/ETH', tokens: ['ASTR', 'ETH'], icons: ['⭐', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'ArthSwap' },
            { id: 'glmr-usdc-pool', name: 'GLMR/USDC', tokens: ['GLMR', 'USDC'], icons: ['🌙', '$'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'StellaSwap' },
            { id: 'para-dot-pool', name: 'PARA/DOT', tokens: ['PARA', 'DOT'], icons: ['🪂', '⬡'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Parallel' },
            // NFT Gaming Pools
            { id: 'imx-eth-pool', name: 'IMX/ETH', tokens: ['IMX', 'ETH'], icons: ['🎮', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'gala-eth-pool', name: 'GALA/ETH', tokens: ['GALA', 'ETH'], icons: ['🎰', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'flow-usdc-pool', name: 'FLOW/USDC', tokens: ['FLOW', 'USDC'], icons: ['🌀', '$'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'IncrementFi' },
            { id: 'ape-eth-pool', name: 'APE/ETH', tokens: ['APE', 'ETH'], icons: ['🦧', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ron-weth-pool', name: 'RON/WETH', tokens: ['RON', 'WETH'], icons: ['⚔️', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 125000000, volume24h: 82000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Katana' },
            // Storage & Compute Pools
            { id: 'fil-eth-pool', name: 'FIL/ETH', tokens: ['FIL', 'ETH'], icons: ['📁', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ar-eth-pool', name: 'AR/ETH', tokens: ['AR', 'ETH'], icons: ['🏛️', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'storj-usdc-pool', name: 'STORJ/USDC', tokens: ['STORJ', 'USDC'], icons: ['☁️', '$'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'blz-eth-pool', name: 'BLZ/ETH', tokens: ['BLZ', 'ETH'], icons: ['🔥', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'akt-atom-pool', name: 'AKT/ATOM', tokens: ['AKT', 'ATOM'], icons: ['☁️', '⚛️'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 75000000, volume24h: 48000000, fee: 0.2, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            // Identity & Reputation Pools
            { id: 'ens-eth-pool', name: 'ENS/ETH', tokens: ['ENS', 'ETH'], icons: ['🏷️', '⟠'], apy: 12.0, apr: 10.0, feeApr: 8.0, rewardApr: 2.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'low', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'wld-usdc-pool', name: 'WLD/USDC', tokens: ['WLD', 'USDC'], icons: ['🌍', '$'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'id-bnb-pool', name: 'ID/BNB', tokens: ['ID', 'BNB'], icons: ['🆔', '🔶'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'gal-eth-pool', name: 'GAL/ETH', tokens: ['GAL', 'ETH'], icons: ['🎖️', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'cyber-eth-pool', name: 'CYBER/ETH', tokens: ['CYBER', 'ETH'], icons: ['🤖', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 45000000, volume24h: 30000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Structured Products Pools
            { id: 'rbn-eth-pool', name: 'RBN/ETH', tokens: ['RBN', 'ETH'], icons: ['🎀', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 38000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Balancer' },
            { id: 'jones-eth-pool', name: 'JONES/ETH', tokens: ['JONES', 'ETH'], icons: ['🎯', '⟠'], apy: 55.0, apr: 44.0, feeApr: 26.0, rewardApr: 18.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'glp-usdc-pool', name: 'GLP/USDC', tokens: ['GLP', 'USDC'], icons: ['📊', '$'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 245000000, volume24h: 165000000, fee: 0.1, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'GMX' },
            { id: 'sglp-eth-pool', name: 'sGLP/ETH', tokens: ['sGLP', 'ETH'], icons: ['📈', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Arbitrum' },
            { id: 'plvglp-eth-pool', name: 'plvGLP/ETH', tokens: ['plvGLP', 'ETH'], icons: ['💎', '⟠'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Plutus' },

            // === POOLS BATCH 20 - QUETTA EXPANSION ===
            // AI & ML Pools
            { id: 'tao-eth-pool', name: 'TAO/ETH', tokens: ['TAO', 'ETH'], icons: ['🧠', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'rndr-eth-pool', name: 'RNDR/ETH', tokens: ['RNDR', 'ETH'], icons: ['🎨', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'fet-eth-pool', name: 'FET/ETH', tokens: ['FET', 'ETH'], icons: ['🤖', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ocean-eth-pool', name: 'OCEAN/ETH', tokens: ['OCEAN', 'ETH'], icons: ['🌊', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'agix-eth-pool', name: 'AGIX/ETH', tokens: ['AGIX', 'ETH'], icons: ['🔮', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // ZK L2 Pools
            { id: 'zk-eth-pool', name: 'ZK/ETH', tokens: ['ZK', 'ETH'], icons: ['🔐', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'zkSync' },
            { id: 'strk-eth-pool', name: 'STRK/ETH', tokens: ['STRK', 'ETH'], icons: ['⚡', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Ekubo' },
            { id: 'pol-eth-pool', name: 'POL/ETH', tokens: ['POL', 'ETH'], icons: ['💜', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 345000000, volume24h: 225000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'QuickSwap' },
            { id: 'linea-eth-pool', name: 'LINEA/ETH', tokens: ['LINEA', 'ETH'], icons: ['📐', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Linea DEX' },
            { id: 'scroll-eth-pool', name: 'SCROLL/ETH', tokens: ['SCROLL', 'ETH'], icons: ['📜', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Ambient' },
            // Rollup Infrastructure Pools
            { id: 'arb-eth-pool', name: 'ARB/ETH', tokens: ['ARB', 'ETH'], icons: ['🔵', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 295000000, volume24h: 195000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Camelot' },
            { id: 'op-eth-pool', name: 'OP/ETH', tokens: ['OP', 'ETH'], icons: ['🔴', '⟠'], apy: 15.0, apr: 12.0, feeApr: 8.0, rewardApr: 4.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Velodrome' },
            { id: 'metis-eth-pool', name: 'METIS/ETH', tokens: ['METIS', 'ETH'], icons: ['🟢', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Netswap' },
            { id: 'boba-eth-pool', name: 'BOBA/ETH', tokens: ['BOBA', 'ETH'], icons: ['🧋', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'OolongSwap' },
            { id: 'mnt-eth-pool', name: 'MNT/ETH', tokens: ['MNT', 'ETH'], icons: ['🏔️', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Agni' },
            // DeFi Blue Chip Pools
            { id: 'mkr-eth-pool', name: 'MKR/ETH', tokens: ['MKR', 'ETH'], icons: ['🏛️', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 345000000, volume24h: 225000000, fee: 0.3, risk: 'low', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'comp-eth-pool', name: 'COMP/ETH', tokens: ['COMP', 'ETH'], icons: ['🏦', '⟠'], apy: 12.0, apr: 10.0, feeApr: 8.0, rewardApr: 2.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'low', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'uni-eth-pool', name: 'UNI/ETH', tokens: ['UNI', 'ETH'], icons: ['🦄', '⟠'], apy: 12.0, apr: 10.0, feeApr: 8.0, rewardApr: 2.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'low', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'aave-eth-pool', name: 'AAVE/ETH', tokens: ['AAVE', 'ETH'], icons: ['👻', '⟠'], apy: 15.0, apr: 12.0, feeApr: 8.0, rewardApr: 4.0, tvl: 295000000, volume24h: 195000000, fee: 0.3, risk: 'low', impermanentLoss: 'Low IL', protocol: 'Balancer' },
            { id: 'crv-eth-v2-pool', name: 'CRV/ETH V2', tokens: ['CRV', 'ETH'], icons: ['🔵', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            // Stablecoin Protocol Pools
            { id: 'lqty-eth-pool', name: 'LQTY/ETH', tokens: ['LQTY', 'ETH'], icons: ['💎', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'fxs-frax-pool', name: 'FXS/FRAX', tokens: ['FXS', 'FRAX'], icons: ['🔷', '💵'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'Fraxswap' },
            { id: 'spell-mim-pool', name: 'SPELL/MIM', tokens: ['SPELL', 'MIM'], icons: ['✨', '💰'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 38000000, volume24h: 25000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            { id: 'prisma-eth-pool', name: 'PRISMA/ETH', tokens: ['PRISMA', 'ETH'], icons: ['🔺', '⟠'], apy: 55.0, apr: 44.0, feeApr: 26.0, rewardApr: 18.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Curve' },
            { id: 'crvusd-usdc-pool', name: 'crvUSD/USDC', tokens: ['crvUSD', 'USDC'], icons: ['💵', '$'], apy: 8.0, apr: 6.0, feeApr: 4.0, rewardApr: 2.0, tvl: 145000000, volume24h: 95000000, fee: 0.04, risk: 'very-low', impermanentLoss: 'Very Low IL', protocol: 'Curve' },
            // Liquid Restaking Pools
            { id: 'puffer-eth-pool', name: 'PUFFER/ETH', tokens: ['PUFFER', 'ETH'], icons: ['🐡', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'kelp-eth-pool', name: 'KELP/ETH', tokens: ['KELP', 'ETH'], icons: ['🌿', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'rez-eth-pool', name: 'REZ/ETH', tokens: ['REZ', 'ETH'], icons: ['🔄', '⟠'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 98000000, volume24h: 65000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'swell-eth-pool', name: 'SWELL/ETH', tokens: ['SWELL', 'ETH'], icons: ['🌊', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Maverick' },
            { id: 'ethfi-eth-pool', name: 'ETHFI/ETH', tokens: ['ETHFI', 'ETH'], icons: ['🔥', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Pendle' },
            // Emerging L1 Pools
            { id: 'sui-usdc-pool', name: 'SUI/USDC', tokens: ['SUI', 'USDC'], icons: ['💧', '$'], apy: 12.0, apr: 10.0, feeApr: 8.0, rewardApr: 2.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Cetus' },
            { id: 'apt-usdc-pool', name: 'APT/USDC', tokens: ['APT', 'USDC'], icons: ['🅰️', '$'], apy: 15.0, apr: 12.0, feeApr: 8.0, rewardApr: 4.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'near-usdc-pool', name: 'NEAR/USDC', tokens: ['NEAR', 'USDC'], icons: ['🌐', '$'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Ref Finance' },
            { id: 'algo-usdc-pool', name: 'ALGO/USDC', tokens: ['ALGO', 'USDC'], icons: ['🔷', '$'], apy: 15.0, apr: 12.0, feeApr: 8.0, rewardApr: 4.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Tinyman' },
            { id: 'hbar-usdc-pool', name: 'HBAR/USDC', tokens: ['HBAR', 'USDC'], icons: ['ℏ', '$'], apy: 12.0, apr: 10.0, feeApr: 8.0, rewardApr: 2.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'SaucerSwap' },
            // ══════ BATCH 21 POOLS: DePIN + Social + Gaming + RWA + Modular + Messaging ══════
            // DePIN Pools
            { id: 'hnt-usdc-pool', name: 'HNT/USDC', tokens: ['HNT', 'USDC'], icons: ['📡', '$'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Orca' },
            { id: 'theta-usdc-pool', name: 'THETA/USDC', tokens: ['THETA', 'USDC'], icons: ['🎬', '$'], apy: 15.0, apr: 12.0, feeApr: 8.0, rewardApr: 4.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'iotx-usdc-pool', name: 'IOTX/USDC', tokens: ['IOTX', 'USDC'], icons: ['🌐', '$'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'mimo' },
            { id: 'dimo-eth-pool', name: 'DIMO/ETH', tokens: ['DIMO', 'ETH'], icons: ['🚗', '⟠'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 45000000, volume24h: 28000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            // Social Pools
            { id: 'degen-eth-pool', name: 'DEGEN/ETH', tokens: ['DEGEN', 'ETH'], icons: ['🎩', '⟠'], apy: 45.0, apr: 36.0, feeApr: 22.0, rewardApr: 14.0, tvl: 55000000, volume24h: 42000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Aerodrome' },
            { id: 'lens-matic-pool', name: 'LENS/MATIC', tokens: ['LENS', 'MATIC'], icons: ['🌿', '⬡'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'QuickSwap' },
            { id: 'audio-usdc-pool', name: 'AUDIO/USDC', tokens: ['AUDIO', 'USDC'], icons: ['🎵', '$'], apy: 20.0, apr: 16.0, feeApr: 10.0, rewardApr: 6.0, tvl: 45000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'mask-eth-pool', name: 'MASK/ETH', tokens: ['MASK', 'ETH'], icons: ['🎭', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Gaming L2 Pools
            { id: 'beam-eth-pool', name: 'BEAM/ETH', tokens: ['BEAM', 'ETH'], icons: ['🎮', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 95000000, volume24h: 65000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'xai-eth-pool', name: 'XAI/ETH', tokens: ['XAI', 'ETH'], icons: ['⚔️', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Camelot' },
            { id: 'magic-eth-pool', name: 'MAGIC/ETH', tokens: ['MAGIC', 'ETH'], icons: ['✨', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Camelot' },
            { id: 'prime-eth-pool', name: 'PRIME/ETH', tokens: ['PRIME', 'ETH'], icons: ['🎯', '⟠'], apy: 25.0, apr: 20.0, feeApr: 12.0, rewardApr: 8.0, tvl: 125000000, volume24h: 82000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // RWA Pools
            { id: 'ondo-usdc-pool', name: 'ONDO/USDC', tokens: ['ONDO', 'USDC'], icons: ['🏛️', '$'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'mpl-usdc-pool', name: 'MPL/USDC', tokens: ['MPL', 'USDC'], icons: ['🍁', '$'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'cfg-usdc-pool', name: 'CFG/USDC', tokens: ['CFG', 'USDC'], icons: ['🔗', '$'], apy: 20.0, apr: 16.0, feeApr: 10.0, rewardApr: 6.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Curve' },
            // Modular Pools
            { id: 'manta-eth-pool', name: 'MANTA/ETH', tokens: ['MANTA', 'ETH'], icons: ['🐙', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Quickswap' },
            { id: 'dym-usdc-pool', name: 'DYM/USDC', tokens: ['DYM', 'USDC'], icons: ['🎡', '$'], apy: 35.0, apr: 28.0, feeApr: 16.0, rewardApr: 12.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'alt-eth-pool', name: 'ALT/ETH', tokens: ['ALT', 'ETH'], icons: ['🔺', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 115000000, volume24h: 75000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'saga-usdc-pool', name: 'SAGA/USDC', tokens: ['SAGA', 'USDC'], icons: ['📜', '$'], apy: 30.0, apr: 24.0, feeApr: 14.0, rewardApr: 10.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            // Messaging Pools
            { id: 'axl-usdc-pool', name: 'AXL/USDC', tokens: ['AXL', 'USDC'], icons: ['🌉', '$'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'zeta-eth-pool', name: 'ZETA/ETH', tokens: ['ZETA', 'ETH'], icons: ['Ζ', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 115000000, volume24h: 75000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'w-eth-pool', name: 'W/ETH', tokens: ['W', 'ETH'], icons: ['🌀', '⟠'], apy: 20.0, apr: 16.0, feeApr: 10.0, rewardApr: 6.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'zro-usdc-pool', name: 'ZRO/USDC', tokens: ['ZRO', 'USDC'], icons: ['0️⃣', '$'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            // ══════ BATCH 22 POOLS: AI Agents + Memecoins + DEX + L2 + Privacy + Payments ══════
            // AI Agents Pools
            { id: 'ai16z-sol-pool', name: 'AI16Z/SOL', tokens: ['AI16Z', 'SOL'], icons: ['🤖', '◎'], apy: 85.0, apr: 68.0, feeApr: 38.0, rewardApr: 30.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'virtual-eth-pool', name: 'VIRTUAL/ETH', tokens: ['VIRTUAL', 'ETH'], icons: ['👾', '⟠'], apy: 75.0, apr: 60.0, feeApr: 35.0, rewardApr: 25.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'aixbt-usdc-pool', name: 'AIXBT/USDC', tokens: ['AIXBT', 'USDC'], icons: ['📊', '$'], apy: 95.0, apr: 76.0, feeApr: 42.0, rewardApr: 34.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'griffain-sol-pool', name: 'GRIFFAIN/SOL', tokens: ['GRIFFAIN', 'SOL'], icons: ['🦅', '◎'], apy: 110.0, apr: 88.0, feeApr: 48.0, rewardApr: 40.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'zerebro-usdc-pool', name: 'ZEREBRO/USDC', tokens: ['ZEREBRO', 'USDC'], icons: ['🧠', '$'], apy: 120.0, apr: 96.0, feeApr: 52.0, rewardApr: 44.0, tvl: 65000000, volume24h: 42000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            // Memecoin Pools
            { id: 'pepe-eth-pool', name: 'PEPE/ETH', tokens: ['PEPE', 'ETH'], icons: ['🐸', '⟠'], apy: 45.0, apr: 36.0, feeApr: 24.0, rewardApr: 12.0, tvl: 285000000, volume24h: 195000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Uniswap V3' },
            { id: 'wif-sol-pool', name: 'WIF/SOL', tokens: ['WIF', 'SOL'], icons: ['🐕', '◎'], apy: 55.0, apr: 44.0, feeApr: 28.0, rewardApr: 16.0, tvl: 225000000, volume24h: 155000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'bonk-sol-pool', name: 'BONK/SOL', tokens: ['BONK', 'SOL'], icons: ['🦴', '◎'], apy: 40.0, apr: 32.0, feeApr: 22.0, rewardApr: 10.0, tvl: 165000000, volume24h: 110000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'Raydium' },
            { id: 'floki-eth-pool', name: 'FLOKI/ETH', tokens: ['FLOKI', 'ETH'], icons: ['⚔️', '⟠'], apy: 35.0, apr: 28.0, feeApr: 18.0, rewardApr: 10.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'shib-eth-pool', name: 'SHIB/ETH', tokens: ['SHIB', 'ETH'], icons: ['🐕‍🦺', '⟠'], apy: 25.0, apr: 20.0, feeApr: 14.0, rewardApr: 6.0, tvl: 385000000, volume24h: 265000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'ShibaSwap' },
            // DEX Native Pools
            { id: 'joe-avax-pool', name: 'JOE/AVAX', tokens: ['JOE', 'AVAX'], icons: ['🦜', '🔺'], apy: 42.0, apr: 34.0, feeApr: 22.0, rewardApr: 12.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Trader Joe' },
            { id: 'cake-bnb-pool', name: 'CAKE/BNB', tokens: ['CAKE', 'BNB'], icons: ['🥞', '🟡'], apy: 28.0, apr: 22.0, feeApr: 15.0, rewardApr: 7.0, tvl: 285000000, volume24h: 195000000, fee: 0.25, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'PancakeSwap' },
            { id: 'sushi-eth-pool', name: 'SUSHI/ETH', tokens: ['SUSHI', 'ETH'], icons: ['🍣', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SushiSwap' },
            { id: 'velo-op-pool', name: 'VELO/OP', tokens: ['VELO', 'OP'], icons: ['🚴', '🔴'], apy: 48.0, apr: 38.0, feeApr: 22.0, rewardApr: 16.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Velodrome' },
            { id: 'aero-usdc-pool', name: 'AERO/USDC', tokens: ['AERO', 'USDC'], icons: ['✈️', '$'], apy: 52.0, apr: 42.0, feeApr: 26.0, rewardApr: 16.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Aerodrome' },
            // L2 Native Pools
            { id: 'strk-eth-pool', name: 'STRK/ETH', tokens: ['STRK', 'ETH'], icons: ['⚡', '⟠'], apy: 25.0, apr: 20.0, feeApr: 14.0, rewardApr: 6.0, tvl: 285000000, volume24h: 185000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Jediswap' },
            { id: 'blast-eth-pool', name: 'BLAST/ETH', tokens: ['BLAST', 'ETH'], icons: ['💥', '⟠'], apy: 38.0, apr: 30.0, feeApr: 20.0, rewardApr: 10.0, tvl: 195000000, volume24h: 125000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Thruster' },
            { id: 'mode-eth-pool', name: 'MODE/ETH', tokens: ['MODE', 'ETH'], icons: ['🎵', '⟠'], apy: 42.0, apr: 34.0, feeApr: 22.0, rewardApr: 12.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Kim Exchange' },
            { id: 'scroll-eth-pool', name: 'SCROLL/ETH', tokens: ['SCROLL', 'ETH'], icons: ['📜', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SyncSwap' },
            { id: 'zk-eth-pool', name: 'ZK/ETH', tokens: ['ZK', 'ETH'], icons: ['🔐', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 285000000, volume24h: 185000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SyncSwap' },
            // Privacy Pools
            { id: 'scrt-usdc-pool', name: 'SCRT/USDC', tokens: ['SCRT', 'USDC'], icons: ['🤫', '$'], apy: 35.0, apr: 28.0, feeApr: 18.0, rewardApr: 10.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SecretSwap' },
            { id: 'rose-usdc-pool', name: 'ROSE/USDC', tokens: ['ROSE', 'USDC'], icons: ['🌹', '$'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 85000000, volume24h: 55000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'YuzuSwap' },
            { id: 'nym-eth-pool', name: 'NYM/ETH', tokens: ['NYM', 'ETH'], icons: ['👤', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Payment Pools
            { id: 'xlm-usdc-pool', name: 'XLM/USDC', tokens: ['XLM', 'USDC'], icons: ['✨', '$'], apy: 12.0, apr: 10.0, feeApr: 8.0, rewardApr: 2.0, tvl: 245000000, volume24h: 165000000, fee: 0.3, risk: 'low', impermanentLoss: 'Low IL', protocol: 'StellarX' },
            { id: 'xrp-usdc-pool', name: 'XRP/USDC', tokens: ['XRP', 'USDC'], icons: ['💧', '$'], apy: 10.0, apr: 8.0, feeApr: 6.0, rewardApr: 2.0, tvl: 385000000, volume24h: 265000000, fee: 0.3, risk: 'low', impermanentLoss: 'Low IL', protocol: 'XRPL AMM' },
            { id: 'celo-usdc-pool', name: 'CELO/USDC', tokens: ['CELO', 'USDC'], icons: ['🌍', '$'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Medium IL', protocol: 'Ubeswap' },
            // ══════ BATCH 23 POOLS: Perp DEX + Yield + LRT + Real Yield + Intent + Launchpad ══════
            // Perpetual DEX Pools
            { id: 'hype-usdc-pool', name: 'HYPE/USDC', tokens: ['HYPE', 'USDC'], icons: ['🔥', '$'], apy: 65.0, apr: 52.0, feeApr: 32.0, rewardApr: 20.0, tvl: 285000000, volume24h: 195000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Hyperliquid' },
            { id: 'vrtx-eth-pool', name: 'VRTX/ETH', tokens: ['VRTX', 'ETH'], icons: ['📐', '⟠'], apy: 55.0, apr: 44.0, feeApr: 28.0, rewardApr: 16.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Camelot' },
            { id: 'aevo-usdc-pool', name: 'AEVO/USDC', tokens: ['AEVO', 'USDC'], icons: ['🎯', '$'], apy: 45.0, apr: 36.0, feeApr: 24.0, rewardApr: 12.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'drift-sol-pool', name: 'DRIFT/SOL', tokens: ['DRIFT', 'SOL'], icons: ['🌊', '◎'], apy: 62.0, apr: 50.0, feeApr: 30.0, rewardApr: 20.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Raydium' },
            { id: 'kwenta-eth-pool', name: 'KWENTA/ETH', tokens: ['KWENTA', 'ETH'], icons: ['⚡', '⟠'], apy: 48.0, apr: 38.0, feeApr: 24.0, rewardApr: 14.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Velodrome' },
            // Yield Protocol Pools
            { id: 'pendle-eth-pool', name: 'PENDLE/ETH', tokens: ['PENDLE', 'ETH'], icons: ['⏳', '⟠'], apy: 35.0, apr: 28.0, feeApr: 18.0, rewardApr: 10.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'aura-eth-pool', name: 'AURA/ETH', tokens: ['AURA', 'ETH'], icons: ['✨', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'btrfly-eth-pool', name: 'BTRFLY/ETH', tokens: ['BTRFLY', 'ETH'], icons: ['🦋', '⟠'], apy: 55.0, apr: 44.0, feeApr: 28.0, rewardApr: 16.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'jones-eth-pool', name: 'JONES/ETH', tokens: ['JONES', 'ETH'], icons: ['🎰', '⟠'], apy: 65.0, apr: 52.0, feeApr: 32.0, rewardApr: 20.0, tvl: 45000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'dpx-eth-pool', name: 'DPX/ETH', tokens: ['DPX', 'ETH'], icons: ['💎', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'SushiSwap' },
            // LRT Pools
            { id: 'ethfi-eth-pool', name: 'ETHFI/ETH', tokens: ['ETHFI', 'ETH'], icons: ['🔷', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'Balancer' },
            { id: 'puffer-eth-pool', name: 'PUFFER/ETH', tokens: ['PUFFER', 'ETH'], icons: ['🐡', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 125000000, volume24h: 85000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'Uniswap V3' },
            { id: 'rez-eth-pool', name: 'REZ/ETH', tokens: ['REZ', 'ETH'], icons: ['🔄', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'kelp-eth-pool', name: 'KELP/ETH', tokens: ['KELP', 'ETH'], icons: ['🌿', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'swell-eth-pool', name: 'SWELL/ETH', tokens: ['SWELL', 'ETH'], icons: ['🌊', '⟠'], apy: 35.0, apr: 28.0, feeApr: 18.0, rewardApr: 10.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Low IL', protocol: 'Balancer' },
            // Real Yield Pools
            { id: 'gmx-eth-pool', name: 'GMX/ETH', tokens: ['GMX', 'ETH'], icons: ['🔵', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 285000000, volume24h: 195000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'gns-dai-pool', name: 'GNS/DAI', tokens: ['GNS', 'DAI'], icons: ['💹', '◈'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Quickswap' },
            { id: 'grail-eth-pool', name: 'GRAIL/ETH', tokens: ['GRAIL', 'ETH'], icons: ['🏆', '⟠'], apy: 52.0, apr: 42.0, feeApr: 26.0, rewardApr: 16.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Camelot' },
            { id: 'vela-usdc-pool', name: 'VELA/USDC', tokens: ['VELA', 'USDC'], icons: ['⛵', '$'], apy: 45.0, apr: 36.0, feeApr: 22.0, rewardApr: 14.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Camelot' },
            { id: 'hmx-usdc-pool', name: 'HMX/USDC', tokens: ['HMX', 'USDC'], icons: ['🎮', '$'], apy: 58.0, apr: 46.0, feeApr: 28.0, rewardApr: 18.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Camelot' },
            // Intent & Solver Pools
            { id: 'cow-eth-pool', name: 'COW/ETH', tokens: ['COW', 'ETH'], icons: ['🐄', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Balancer' },
            { id: 'acx-eth-pool', name: 'ACX/ETH', tokens: ['ACX', 'ETH'], icons: ['🌉', '⟠'], apy: 35.0, apr: 28.0, feeApr: 18.0, rewardApr: 10.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'hop-eth-pool', name: 'HOP/ETH', tokens: ['HOP', 'ETH'], icons: ['🐰', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 45000000, volume24h: 28000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'socket-eth-pool', name: 'SOCKET/ETH', tokens: ['SOCKET', 'ETH'], icons: ['🔌', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Launchpad Pools
            { id: 'sfund-bnb-pool', name: 'SFUND/BNB', tokens: ['SFUND', 'BNB'], icons: ['🚀', '🟡'], apy: 48.0, apr: 38.0, feeApr: 24.0, rewardApr: 14.0, tvl: 45000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'PancakeSwap' },
            { id: 'dao-eth-pool', name: 'DAO/ETH', tokens: ['DAO', 'ETH'], icons: ['🏛️', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'pols-eth-pool', name: 'POLS/ETH', tokens: ['POLS', 'ETH'], icons: ['⭐', '⟠'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'prime-eth-pool', name: 'PRIME/ETH', tokens: ['PRIME', 'ETH'], icons: ['🎮', '⟠'], apy: 25.0, apr: 20.0, feeApr: 14.0, rewardApr: 6.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // ══════ BATCH 24 POOLS: Cosmos + Polkadot + NFT + Gaming + Infrastructure + Insurance ══════
            // Cosmos Ecosystem Pools
            { id: 'atom-usdc-pool', name: 'ATOM/USDC', tokens: ['ATOM', 'USDC'], icons: ['⚛️', '$'], apy: 25.0, apr: 20.0, feeApr: 14.0, rewardApr: 6.0, tvl: 485000000, volume24h: 325000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'osmo-usdc-pool', name: 'OSMO/USDC', tokens: ['OSMO', 'USDC'], icons: ['🧪', '$'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Osmosis' },
            { id: 'inj-usdt-pool', name: 'INJ/USDT', tokens: ['INJ', 'USDT'], icons: ['💉', '₮'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 285000000, volume24h: 195000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Helix' },
            { id: 'sei-usdc-pool', name: 'SEI/USDC', tokens: ['SEI', 'USDC'], icons: ['🌊', '$'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 225000000, volume24h: 155000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Astroport' },
            { id: 'kava-usdc-pool', name: 'KAVA/USDC', tokens: ['KAVA', 'USDC'], icons: ['🔶', '$'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Kava Swap' },
            // Polkadot Ecosystem Pools
            { id: 'dot-usdc-pool', name: 'DOT/USDC', tokens: ['DOT', 'USDC'], icons: ['⬡', '$'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 585000000, volume24h: 395000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'HydraDX' },
            { id: 'ksm-usdc-pool', name: 'KSM/USDC', tokens: ['KSM', 'USDC'], icons: ['🦜', '$'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Karura' },
            { id: 'astr-eth-pool', name: 'ASTR/ETH', tokens: ['ASTR', 'ETH'], icons: ['⭐', '⟠'], apy: 25.0, apr: 20.0, feeApr: 14.0, rewardApr: 6.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'ArthSwap' },
            { id: 'glmr-usdc-pool', name: 'GLMR/USDC', tokens: ['GLMR', 'USDC'], icons: ['🌙', '$'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Beamswap' },
            { id: 'aca-usdc-pool', name: 'ACA/USDC', tokens: ['ACA', 'USDC'], icons: ['🔷', '$'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Acala DEX' },
            // NFT Infrastructure Pools
            { id: 'blur-eth-pool', name: 'BLUR/ETH', tokens: ['BLUR', 'ETH'], icons: ['🌫️', '⟠'], apy: 45.0, apr: 36.0, feeApr: 22.0, rewardApr: 14.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'looks-weth-pool', name: 'LOOKS/WETH', tokens: ['LOOKS', 'WETH'], icons: ['👀', '⟠'], apy: 55.0, apr: 44.0, feeApr: 28.0, rewardApr: 16.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'LooksRare' },
            { id: 'x2y2-weth-pool', name: 'X2Y2/WETH', tokens: ['X2Y2', 'WETH'], icons: ['✖️', '⟠'], apy: 62.0, apr: 50.0, feeApr: 32.0, rewardApr: 18.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'high', impermanentLoss: 'Very High IL', protocol: 'X2Y2' },
            { id: 'sudo-eth-pool', name: 'SUDO/ETH', tokens: ['SUDO', 'ETH'], icons: ['🔲', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 45000000, volume24h: 28000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'rari-eth-pool', name: 'RARI/ETH', tokens: ['RARI', 'ETH'], icons: ['🎨', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Gaming Pools
            { id: 'gala-eth-pool', name: 'GALA/ETH', tokens: ['GALA', 'ETH'], icons: ['🎮', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            { id: 'imx-eth-pool', name: 'IMX/ETH', tokens: ['IMX', 'ETH'], icons: ['💎', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 285000000, volume24h: 195000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ron-weth-pool', name: 'RON/WETH', tokens: ['RON', 'WETH'], icons: ['⚔️', '⟠'], apy: 28.0, apr: 22.0, feeApr: 14.0, rewardApr: 8.0, tvl: 185000000, volume24h: 125000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Katana' },
            { id: 'beam-eth-pool', name: 'BEAM/ETH', tokens: ['BEAM', 'ETH'], icons: ['🕹️', '⟠'], apy: 35.0, apr: 28.0, feeApr: 18.0, rewardApr: 10.0, tvl: 95000000, volume24h: 62000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Beam Swap' },
            { id: 'pixel-eth-pool', name: 'PIXEL/ETH', tokens: ['PIXEL', 'ETH'], icons: ['👾', '⟠'], apy: 45.0, apr: 36.0, feeApr: 22.0, rewardApr: 14.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'high', impermanentLoss: 'High IL', protocol: 'Uniswap V3' },
            // Infrastructure Pools
            { id: 'grt-eth-pool', name: 'GRT/ETH', tokens: ['GRT', 'ETH'], icons: ['📊', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 285000000, volume24h: 195000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'fil-usdc-pool', name: 'FIL/USDC', tokens: ['FIL', 'USDC'], icons: ['📁', '$'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 225000000, volume24h: 155000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'ar-usdc-pool', name: 'AR/USDC', tokens: ['AR', 'USDC'], icons: ['🗄️', '$'], apy: 15.0, apr: 12.0, feeApr: 8.0, rewardApr: 4.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'storj-eth-pool', name: 'STORJ/ETH', tokens: ['STORJ', 'ETH'], icons: ['☁️', '⟠'], apy: 22.0, apr: 18.0, feeApr: 12.0, rewardApr: 6.0, tvl: 55000000, volume24h: 35000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'pokt-eth-pool', name: 'POKT/ETH', tokens: ['POKT', 'ETH'], icons: ['🔌', '⟠'], apy: 42.0, apr: 34.0, feeApr: 20.0, rewardApr: 14.0, tvl: 75000000, volume24h: 48000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            // Insurance Pools
            { id: 'nxm-eth-pool', name: 'NXM/ETH', tokens: ['NXM', 'ETH'], icons: ['🛡️', '⟠'], apy: 18.0, apr: 14.0, feeApr: 10.0, rewardApr: 4.0, tvl: 145000000, volume24h: 95000000, fee: 0.3, risk: 'low-medium', impermanentLoss: 'Low IL', protocol: 'Balancer' },
            { id: 'insr-usdc-pool', name: 'INSR/USDC', tokens: ['INSR', 'USDC'], icons: ['🏥', '$'], apy: 32.0, apr: 26.0, feeApr: 16.0, rewardApr: 10.0, tvl: 28000000, volume24h: 18000000, fee: 0.3, risk: 'medium', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' },
            { id: 'uno-eth-pool', name: 'UNO/ETH', tokens: ['UNO', 'ETH'], icons: ['☂️', '⟠'], apy: 38.0, apr: 30.0, feeApr: 18.0, rewardApr: 12.0, tvl: 35000000, volume24h: 22000000, fee: 0.3, risk: 'medium-high', impermanentLoss: 'Medium IL', protocol: 'Uniswap V3' }
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
            },
            {
                id: 'arb-yield-boost',
                name: 'ARB Yield Booster',
                token: 'ARB',
                icon: '🔵',
                apy: 42.5,
                tvl: 85000000,
                risk: 'medium-high',
                strategy: 'GMX + Camelot LP + Incentives',
                protocols: ['GMX', 'Camelot', 'Radiant'],
                autoCompound: true,
                harvestFreq: '2 hours',
                performanceFee: 12,
                depositFee: 0,
                withdrawFee: 0.15
            },
            {
                id: 'sol-turbo',
                name: 'SOL Turbo Vault',
                token: 'SOL',
                icon: '◎',
                apy: 55.0,
                tvl: 120000000,
                risk: 'high',
                strategy: 'Marinade + Raydium + JLP',
                protocols: ['Marinade', 'Raydium', 'Jupiter'],
                autoCompound: true,
                harvestFreq: '1 hour',
                performanceFee: 15,
                depositFee: 0,
                withdrawFee: 0.2
            },
            {
                id: 'pendle-pt-optimizer',
                name: 'Pendle PT Optimizer',
                token: 'USDC',
                icon: '⚡',
                apy: 28.0,
                tvl: 95000000,
                risk: 'medium',
                strategy: 'Principal tokens + yield trading',
                protocols: ['Pendle', 'Aave'],
                autoCompound: true,
                harvestFreq: 'Daily',
                performanceFee: 10,
                depositFee: 0,
                withdrawFee: 0.1
            },
            {
                id: 'gmx-glp-max',
                name: 'GLP Maximizer',
                token: 'GLP',
                icon: '💎',
                apy: 35.0,
                tvl: 280000000,
                risk: 'medium',
                strategy: 'GLP + ETH rewards compounding',
                protocols: ['GMX', 'Umami'],
                autoCompound: true,
                harvestFreq: '30 min',
                performanceFee: 10,
                depositFee: 0,
                withdrawFee: 0.1
            },
            {
                id: 'meme-hunter',
                name: 'Meme Hunter Vault',
                token: 'ETH',
                icon: '🐸',
                apy: 250.0,
                tvl: 15000000,
                risk: 'high',
                strategy: 'Trending meme tokens + Quick exit',
                protocols: ['Uniswap', 'Various DEX'],
                autoCompound: true,
                harvestFreq: '5 min',
                performanceFee: 25,
                depositFee: 0,
                withdrawFee: 1.0
            },
            {
                id: 'rwa-yield',
                name: 'RWA Yield Vault',
                token: 'USDC',
                icon: '🏢',
                apy: 9.5,
                tvl: 180000000,
                risk: 'low',
                strategy: 'Tokenized treasuries + RWA protocols',
                protocols: ['Ondo', 'Maple', 'Centrifuge'],
                autoCompound: true,
                harvestFreq: 'Daily',
                performanceFee: 5,
                depositFee: 0,
                withdrawFee: 0
            },
            {
                id: 'lrt-optimizer',
                name: 'LRT Optimizer',
                token: 'ETH',
                icon: '🔄',
                apy: 18.5,
                tvl: 320000000,
                risk: 'medium',
                strategy: 'Liquid restaking + Points farming',
                protocols: ['EigenLayer', 'Renzo', 'Puffer'],
                autoCompound: true,
                harvestFreq: '4 hours',
                performanceFee: 10,
                depositFee: 0,
                withdrawFee: 0.1
            },
            // === NEW VAULTS BATCH ===
            { id: 'sui-yield', name: 'SUI Yield Vault', token: 'SUI', icon: '💧', apy: 45.0, tvl: 65000000, risk: 'high', strategy: 'Cetus LP + Scallop lending', protocols: ['Cetus', 'Scallop'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.2 },
            { id: 'apt-optimizer', name: 'APT Optimizer', token: 'APT', icon: '🔷', apy: 32.0, tvl: 85000000, risk: 'medium-high', strategy: 'Pancake LP + Lending', protocols: ['Pancakeswap', 'Aries'], autoCompound: true, harvestFreq: '3 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.15 },
            { id: 'avax-turbo', name: 'AVAX Turbo Vault', token: 'AVAX', icon: '🔺', apy: 28.0, tvl: 95000000, risk: 'medium', strategy: 'Trader Joe + Benqi lending', protocols: ['Trader Joe', 'Benqi'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'cosmos-hub', name: 'Cosmos Hub Vault', token: 'ATOM', icon: '⚛', apy: 22.0, tvl: 120000000, risk: 'medium', strategy: 'Osmosis LP + Staking', protocols: ['Osmosis', 'Stride'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0.1 },
            { id: 'base-maximizer', name: 'Base Chain Maximizer', token: 'ETH', icon: '🔵', apy: 35.0, tvl: 75000000, risk: 'medium-high', strategy: 'Aerodrome LP + Seamless', protocols: ['Aerodrome', 'Seamless'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.15 },
            { id: 'sei-turbo', name: 'SEI Turbo Vault', token: 'SEI', icon: '🌊', apy: 65.0, tvl: 35000000, risk: 'high', strategy: 'Astroport LP + Staking', protocols: ['Astroport', 'Kryptonite'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 15, depositFee: 0, withdrawFee: 0.25 },
            { id: 'polygon-yield', name: 'Polygon Yield Vault', token: 'MATIC', icon: '⬡', apy: 18.0, tvl: 145000000, risk: 'medium', strategy: 'Quickswap + Aave', protocols: ['Quickswap', 'Aave'], autoCompound: true, harvestFreq: '3 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0.1 },
            { id: 'btc-yield-plus', name: 'BTC Yield Plus', token: 'WBTC', icon: '₿', apy: 12.0, tvl: 220000000, risk: 'low-medium', strategy: 'Curve + Aave leverage', protocols: ['Curve', 'Aave'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0.05 },
            { id: 'op-superchain', name: 'OP Superchain Vault', token: 'OP', icon: '🔴', apy: 42.0, tvl: 65000000, risk: 'medium-high', strategy: 'Velodrome + Sonne', protocols: ['Velodrome', 'Sonne', 'Extra'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.15 },
            { id: 'stables-curve', name: 'Curve 3Pool Max', token: 'USDC', icon: '🔵', apy: 15.0, tvl: 380000000, risk: 'low', strategy: 'Curve 3pool + Convex boost', protocols: ['Curve', 'Convex'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 6, depositFee: 0, withdrawFee: 0 },
            { id: 'frax-amo', name: 'FRAX AMO Vault', token: 'FRAX', icon: 'F', apy: 18.0, tvl: 125000000, risk: 'low-medium', strategy: 'Fraxlend + Curve AMO', protocols: ['Fraxlend', 'Curve', 'Convex'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'inj-perp-vault', name: 'INJ Perp Yield', token: 'INJ', icon: '💉', apy: 55.0, tvl: 42000000, risk: 'high', strategy: 'Helix perps + Staking', protocols: ['Helix', 'Neptune'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'link-oracle', name: 'LINK Oracle Vault', token: 'LINK', icon: '🔗', apy: 15.0, tvl: 95000000, risk: 'medium', strategy: 'Aave + Staking rewards', protocols: ['Aave', 'Chainlink'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0.1 },
            { id: 'jlp-vault', name: 'Jupiter LP Vault', token: 'USDC', icon: '🪐', apy: 38.0, tvl: 180000000, risk: 'medium', strategy: 'Jupiter perps liquidity', protocols: ['Jupiter'], autoCompound: true, harvestFreq: '30 min', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'hyperliquid-vault', name: 'Hyperliquid Vault', token: 'USDC', icon: '⚡', apy: 28.0, tvl: 250000000, risk: 'medium', strategy: 'HLP vault + Points', protocols: ['Hyperliquid'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            // === VAULTS BATCH 2 ===
            { id: 'drift-vault', name: 'Drift Protocol Vault', token: 'USDC', icon: '🌊', apy: 32.0, tvl: 85000000, risk: 'medium', strategy: 'Drift perps + Insurance', protocols: ['Drift'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'vertex-vault', name: 'Vertex Edge Vault', token: 'USDC', icon: '📐', apy: 25.0, tvl: 65000000, risk: 'medium', strategy: 'Vertex maker vault', protocols: ['Vertex'], autoCompound: true, harvestFreq: '30 min', performanceFee: 12, depositFee: 0, withdrawFee: 0.15 },
            { id: 'morpho-eth', name: 'Morpho ETH Optimizer', token: 'ETH', icon: '🦋', apy: 8.5, tvl: 420000000, risk: 'low', strategy: 'Morpho P2P lending optimization', protocols: ['Morpho', 'Aave'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 5, depositFee: 0, withdrawFee: 0 },
            { id: 'morpho-usdc', name: 'Morpho USDC Optimizer', token: 'USDC', icon: '🦋', apy: 12.0, tvl: 580000000, risk: 'low', strategy: 'Morpho P2P stablecoin', protocols: ['Morpho', 'Compound'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 5, depositFee: 0, withdrawFee: 0 },
            { id: 'yearn-eth', name: 'Yearn ETH v3', token: 'ETH', icon: '🔵', apy: 12.0, tvl: 320000000, risk: 'medium', strategy: 'Multi-strategy ETH yield', protocols: ['Yearn'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'yearn-dai', name: 'Yearn DAI v3', token: 'DAI', icon: '🔵', apy: 10.5, tvl: 280000000, risk: 'low', strategy: 'Multi-strategy DAI yield', protocols: ['Yearn'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'beefy-eth-arb', name: 'Beefy ETH Arbitrum', token: 'ETH', icon: '🐮', apy: 18.0, tvl: 145000000, risk: 'medium', strategy: 'Best Arbitrum ETH farms', protocols: ['Beefy'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 4.5, depositFee: 0, withdrawFee: 0 },
            { id: 'beefy-btc', name: 'Beefy BTC Maximizer', token: 'WBTC', icon: '🐮', apy: 8.0, tvl: 180000000, risk: 'low-medium', strategy: 'Cross-chain BTC yield', protocols: ['Beefy'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 4.5, depositFee: 0, withdrawFee: 0 },
            { id: 'convex-cvxcrv', name: 'Convex cvxCRV Vault', token: 'cvxCRV', icon: '🔺', apy: 22.0, tvl: 185000000, risk: 'medium', strategy: 'CRV + CVX emissions', protocols: ['Convex', 'Curve'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'convex-frax', name: 'Convex FRAX Vault', token: 'FRAX', icon: '🔺', apy: 18.0, tvl: 125000000, risk: 'low', strategy: 'FRAX base pool + boost', protocols: ['Convex', 'Frax'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'sommelier-turbo', name: 'Sommelier Turbo ETH', token: 'ETH', icon: '🍷', apy: 25.0, tvl: 95000000, risk: 'medium-high', strategy: 'Leveraged ETH staking', protocols: ['Sommelier'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.2 },
            { id: 'sommelier-steth', name: 'Sommelier stETH Yield', token: 'stETH', icon: '🍷', apy: 15.0, tvl: 145000000, risk: 'medium', strategy: 'stETH yield optimization', protocols: ['Sommelier', 'Lido'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0.1 },
            { id: 'kamino-sol', name: 'Kamino SOL Multiply', token: 'SOL', icon: '🔷', apy: 28.0, tvl: 85000000, risk: 'medium-high', strategy: 'Leveraged SOL staking', protocols: ['Kamino', 'Marinade'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 10, depositFee: 0, withdrawFee: 0.15 },
            { id: 'kamino-usdc', name: 'Kamino USDC Vault', token: 'USDC', icon: '🔷', apy: 15.0, tvl: 120000000, risk: 'low', strategy: 'Kamino lending optimization', protocols: ['Kamino'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'maker-dsr', name: 'Maker DSR Vault', token: 'DAI', icon: 'Ⓜ️', apy: 8.0, tvl: 850000000, risk: 'very-low', strategy: 'DAI Savings Rate', protocols: ['MakerDAO'], autoCompound: false, harvestFreq: 'Continuous', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'spark-sdai', name: 'Spark sDAI Vault', token: 'sDAI', icon: '✨', apy: 8.5, tvl: 650000000, risk: 'very-low', strategy: 'Enhanced DAI savings', protocols: ['Spark', 'MakerDAO'], autoCompound: true, harvestFreq: 'Continuous', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'gearbox-eth', name: 'Gearbox ETH Leverage', token: 'ETH', icon: '⚙️', apy: 35.0, tvl: 55000000, risk: 'high', strategy: 'Leveraged ETH strategies', protocols: ['Gearbox'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 15, depositFee: 0, withdrawFee: 0.25 },
            { id: 'notional-eth', name: 'Notional Fixed ETH', token: 'ETH', icon: '📊', apy: 6.5, tvl: 75000000, risk: 'low', strategy: 'Fixed rate ETH lending', protocols: ['Notional'], autoCompound: false, harvestFreq: 'Maturity', performanceFee: 5, depositFee: 0, withdrawFee: 0.1 },
            { id: 'sturdy-eth', name: 'Sturdy ETH Vault', token: 'ETH', icon: '🏗️', apy: 14.0, tvl: 45000000, risk: 'medium', strategy: 'Interest-free borrowing yield', protocols: ['Sturdy'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'eigenlayer-restake', name: 'EigenLayer Restaking', token: 'ETH', icon: '🔄', apy: 8.0, tvl: 2500000000, risk: 'medium', strategy: 'Native restaking + Points', protocols: ['EigenLayer'], autoCompound: false, harvestFreq: 'Variable', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'renzo-ezeth', name: 'Renzo ezETH Vault', token: 'ezETH', icon: '🟢', apy: 12.0, tvl: 850000000, risk: 'medium', strategy: 'LRT restaking + Points', protocols: ['Renzo', 'EigenLayer'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'etherfi-eeth', name: 'EtherFi eETH Vault', token: 'eETH', icon: '🔷', apy: 10.5, tvl: 1200000000, risk: 'medium', strategy: 'Liquid restaking + Points', protocols: ['EtherFi', 'EigenLayer'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'puffer-pufeth', name: 'Puffer pufETH Vault', token: 'pufETH', icon: '🐡', apy: 11.0, tvl: 450000000, risk: 'medium', strategy: 'Native restaking + AVS', protocols: ['Puffer', 'EigenLayer'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'kelp-rseth', name: 'Kelp rsETH Vault', token: 'rsETH', icon: '🌿', apy: 9.5, tvl: 380000000, risk: 'medium', strategy: 'Multi-LST restaking', protocols: ['Kelp', 'EigenLayer'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0.1 },
            // === VAULTS BATCH 3 ===
            { id: 'swell-sweth', name: 'Swell swETH Vault', token: 'swETH', icon: '🌊', apy: 8.5, tvl: 280000000, risk: 'medium', strategy: 'Liquid staking + Points', protocols: ['Swell', 'EigenLayer'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'renzo-ezeth', name: 'Renzo ezETH Vault', token: 'ezETH', icon: '🔷', apy: 10.0, tvl: 520000000, risk: 'medium', strategy: 'Restaking optimizer', protocols: ['Renzo', 'EigenLayer'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'eigenpie-msteth', name: 'Eigenpie mstETH Vault', token: 'mstETH', icon: '🥧', apy: 9.0, tvl: 180000000, risk: 'medium', strategy: 'Multi-LST aggregation', protocols: ['Eigenpie', 'EigenLayer'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0.1 },
            { id: 'stader-ethx', name: 'Stader ETHx Vault', token: 'ETHx', icon: '⭐', apy: 7.5, tvl: 320000000, risk: 'low-medium', strategy: 'Multi-pool staking', protocols: ['Stader'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'origin-oeth', name: 'Origin OETH Vault', token: 'OETH', icon: '🔵', apy: 6.8, tvl: 250000000, risk: 'low-medium', strategy: 'Yield aggregation', protocols: ['Origin'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0 },
            { id: 'sommelier-eth', name: 'Sommelier Real Yield ETH', token: 'ETH', icon: '🍷', apy: 12.5, tvl: 85000000, risk: 'medium', strategy: 'Active DeFi yield', protocols: ['Sommelier'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 20, depositFee: 0, withdrawFee: 0.5 },
            { id: 'sommelier-usdc', name: 'Sommelier Turbo USDC', token: 'USDC', icon: '🍷', apy: 15.0, tvl: 65000000, risk: 'medium', strategy: 'Leveraged stablecoin', protocols: ['Sommelier'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 20, depositFee: 0, withdrawFee: 0.5 },
            { id: 'pendle-pt-eth', name: 'Pendle PT-ETH Vault', token: 'PT-stETH', icon: '📈', apy: 18.0, tvl: 320000000, risk: 'medium', strategy: 'Fixed yield trading', protocols: ['Pendle'], autoCompound: false, harvestFreq: 'Manual', performanceFee: 0, depositFee: 0, withdrawFee: 0.1 },
            { id: 'pendle-yt-eth', name: 'Pendle YT-ETH Vault', token: 'YT-stETH', icon: '📊', apy: 45.0, tvl: 85000000, risk: 'high', strategy: 'Yield speculation', protocols: ['Pendle'], autoCompound: false, harvestFreq: 'Manual', performanceFee: 0, depositFee: 0, withdrawFee: 0.1 },
            { id: 'pendle-lp', name: 'Pendle LP Vault', token: 'PENDLE-LP', icon: '💧', apy: 25.0, tvl: 145000000, risk: 'medium-high', strategy: 'Yield LP providing', protocols: ['Pendle'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.2 },
            { id: 'gmx-glp', name: 'GMX GLP Vault', token: 'GLP', icon: '🔷', apy: 22.0, tvl: 280000000, risk: 'medium', strategy: 'Perp LP vault', protocols: ['GMX'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0.1, withdrawFee: 0.1 },
            { id: 'gmx-gm-eth', name: 'GMX GM-ETH Vault', token: 'GM-ETH', icon: '⟠', apy: 18.5, tvl: 180000000, risk: 'medium', strategy: 'ETH market LP', protocols: ['GMX V2'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'gmx-gm-btc', name: 'GMX GM-BTC Vault', token: 'GM-BTC', icon: '₿', apy: 15.5, tvl: 150000000, risk: 'medium', strategy: 'BTC market LP', protocols: ['GMX V2'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'gains-dai', name: 'Gains Network DAI', token: 'gDAI', icon: '📈', apy: 12.0, tvl: 95000000, risk: 'medium', strategy: 'Trading LP vault', protocols: ['Gains'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'hyperliquid-hlp', name: 'Hyperliquid HLP Vault', token: 'HLP', icon: '🔵', apy: 35.0, tvl: 450000000, risk: 'medium-high', strategy: 'Perp DEX LP', protocols: ['Hyperliquid'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'jupiter-jlp', name: 'Jupiter JLP Vault', token: 'JLP', icon: '🪐', apy: 28.0, tvl: 380000000, risk: 'medium', strategy: 'Solana perp LP', protocols: ['Jupiter'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'drift-insurance', name: 'Drift Insurance Fund', token: 'USDC', icon: '⚓', apy: 15.0, tvl: 65000000, risk: 'medium', strategy: 'Insurance staking', protocols: ['Drift'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'vertex-vlp', name: 'Vertex VLP Vault', token: 'VLP', icon: '📐', apy: 20.0, tvl: 45000000, risk: 'medium', strategy: 'Arbitrum perp LP', protocols: ['Vertex'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'dydx-staking', name: 'dYdX Staking Vault', token: 'dYdX', icon: '📊', apy: 18.0, tvl: 280000000, risk: 'low-medium', strategy: 'Protocol staking', protocols: ['dYdX'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 5, depositFee: 0, withdrawFee: 0 },
            // === VAULTS BATCH 4 - MEGA ===
            { id: 'kamino-usdc', name: 'Kamino USDC Vault', token: 'USDC', icon: '🎰', apy: 15.0, tvl: 125000000, risk: 'low-medium', strategy: 'Lending optimization', protocols: ['Kamino'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'kamino-sol', name: 'Kamino SOL Vault', token: 'SOL', icon: '🎰', apy: 12.0, tvl: 95000000, risk: 'low-medium', strategy: 'Lending optimization', protocols: ['Kamino'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'marginfi-usdc', name: 'Marginfi USDC Vault', token: 'USDC', icon: '📊', apy: 14.0, tvl: 85000000, risk: 'low-medium', strategy: 'Lending yield', protocols: ['Marginfi'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'fluid-eth', name: 'Fluid ETH Vault', token: 'ETH', icon: '💧', apy: 8.5, tvl: 320000000, risk: 'low', strategy: 'Smart lending', protocols: ['Fluid'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'fluid-usdc', name: 'Fluid USDC Vault', token: 'USDC', icon: '💧', apy: 10.0, tvl: 280000000, risk: 'low', strategy: 'Smart lending', protocols: ['Fluid'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'euler-eth', name: 'Euler ETH Vault', token: 'ETH', icon: 'E', apy: 7.5, tvl: 185000000, risk: 'low-medium', strategy: 'Modular lending', protocols: ['Euler V2'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'euler-usdc', name: 'Euler USDC Vault', token: 'USDC', icon: 'E', apy: 9.0, tvl: 145000000, risk: 'low-medium', strategy: 'Modular lending', protocols: ['Euler V2'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'spark-dai', name: 'Spark DAI Vault', token: 'DAI', icon: '✨', apy: 8.0, tvl: 450000000, risk: 'low', strategy: 'MakerDAO yield', protocols: ['Spark'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 5, depositFee: 0, withdrawFee: 0 },
            { id: 'ajna-eth', name: 'Ajna ETH Vault', token: 'ETH', icon: '🔵', apy: 6.5, tvl: 65000000, risk: 'low-medium', strategy: 'Permissionless lending', protocols: ['Ajna'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'gearbox-eth', name: 'Gearbox ETH Vault', token: 'ETH', icon: '⚙️', apy: 12.0, tvl: 85000000, risk: 'medium', strategy: 'Leveraged yield', protocols: ['Gearbox'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'gearbox-usdc', name: 'Gearbox USDC Vault', token: 'USDC', icon: '⚙️', apy: 15.0, tvl: 75000000, risk: 'medium', strategy: 'Leveraged yield', protocols: ['Gearbox'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'conic-crvusd', name: 'Conic crvUSD Vault', token: 'crvUSD', icon: '🔴', apy: 18.0, tvl: 55000000, risk: 'medium', strategy: 'Omnipool strategy', protocols: ['Conic', 'Curve'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'mellow-wsteth', name: 'Mellow wstETH Vault', token: 'wstETH', icon: '🟡', apy: 8.0, tvl: 145000000, risk: 'low-medium', strategy: 'LRT aggregation', protocols: ['Mellow', 'Symbiotic'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'symbiotic-eth', name: 'Symbiotic ETH Vault', token: 'ETH', icon: '🔗', apy: 7.5, tvl: 185000000, risk: 'medium', strategy: 'Restaking', protocols: ['Symbiotic'], autoCompound: false, harvestFreq: 'Variable', performanceFee: 0, depositFee: 0, withdrawFee: 0.1 },
            { id: 'karak-eth', name: 'Karak ETH Vault', token: 'ETH', icon: '🛡️', apy: 8.0, tvl: 125000000, risk: 'medium', strategy: 'Universal restaking', protocols: ['Karak'], autoCompound: false, harvestFreq: 'Variable', performanceFee: 0, depositFee: 0, withdrawFee: 0.1 },
            { id: 'blast-eth-yield', name: 'Blast Native ETH', token: 'ETH', icon: '💥', apy: 4.0, tvl: 850000000, risk: 'low', strategy: 'Native yield', protocols: ['Blast'], autoCompound: true, harvestFreq: 'Auto', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'blast-usdb', name: 'Blast USDB Vault', token: 'USDB', icon: '💥', apy: 5.0, tvl: 450000000, risk: 'low', strategy: 'Native yield', protocols: ['Blast'], autoCompound: true, harvestFreq: 'Auto', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'juice-eth', name: 'Juice ETH Vault', token: 'ETH', icon: '🍊', apy: 25.0, tvl: 35000000, risk: 'high', strategy: 'Points farming', protocols: ['Juice Finance', 'Blast'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 20, depositFee: 0, withdrawFee: 0.2 },
            { id: 'thruster-lp', name: 'Thruster LP Vault', token: 'THRUST-LP', icon: '🚀', apy: 45.0, tvl: 25000000, risk: 'high', strategy: 'DEX LP farming', protocols: ['Thruster'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'ambient-eth', name: 'Ambient ETH Vault', token: 'ETH', icon: '🌊', apy: 15.0, tvl: 45000000, risk: 'medium', strategy: 'Concentrated LP', protocols: ['Ambient'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'fenix-lp', name: 'Fenix LP Vault', token: 'FNX-LP', icon: '🔥', apy: 55.0, tvl: 18000000, risk: 'high', strategy: 'DEX LP + bribes', protocols: ['Fenix'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'silo-eth', name: 'Silo ETH Vault', token: 'ETH', icon: '🏠', apy: 8.0, tvl: 65000000, risk: 'low-medium', strategy: 'Isolated lending', protocols: ['Silo'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'silo-arb', name: 'Silo ARB Vault', token: 'ARB', icon: '🏠', apy: 15.0, tvl: 35000000, risk: 'medium', strategy: 'Isolated lending', protocols: ['Silo'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'radiant-dlp', name: 'Radiant dLP Vault', token: 'RDNT-dLP', icon: '✨', apy: 35.0, tvl: 28000000, risk: 'medium-high', strategy: 'Dynamic LP staking', protocols: ['Radiant'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'camelot-xgrail', name: 'Camelot xGRAIL Vault', token: 'xGRAIL', icon: '🏆', apy: 40.0, tvl: 22000000, risk: 'high', strategy: 'Dividends + plugins', protocols: ['Camelot'], autoCompound: false, harvestFreq: 'Manual', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'jones-jusdc', name: 'Jones jUSDC Vault', token: 'jUSDC', icon: '🃏', apy: 18.0, tvl: 35000000, risk: 'medium', strategy: 'Options yield', protocols: ['Jones DAO'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.5 },
            { id: 'jones-jeth', name: 'Jones jETH Vault', token: 'jETH', icon: '🃏', apy: 15.0, tvl: 28000000, risk: 'medium', strategy: 'Options yield', protocols: ['Jones DAO'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.5 },
            { id: 'plutus-pls', name: 'Plutus PLS Vault', token: 'PLS', icon: '💜', apy: 22.0, tvl: 18000000, risk: 'medium-high', strategy: 'Governance aggregation', protocols: ['Plutus'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'umami-glp', name: 'Umami GLP Vault', token: 'GLP', icon: '🍣', apy: 25.0, tvl: 25000000, risk: 'medium', strategy: 'Delta neutral GLP', protocols: ['Umami'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'vaultka-eth', name: 'Vaultka ETH Vault', token: 'ETH', icon: '🏦', apy: 18.0, tvl: 35000000, risk: 'medium', strategy: 'Multi-strategy', protocols: ['Vaultka'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'steakhouse-usdc', name: 'Steakhouse USDC', token: 'USDC', icon: '🥩', apy: 12.0, tvl: 85000000, risk: 'low-medium', strategy: 'RWA yield', protocols: ['Steakhouse'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 're7-usdc', name: 'Re7 USDC Vault', token: 'USDC', icon: '7️⃣', apy: 14.0, tvl: 55000000, risk: 'low-medium', strategy: 'Curated lending', protocols: ['Re7 Labs', 'Morpho'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'gauntlet-usdc', name: 'Gauntlet USDC Vault', token: 'USDC', icon: '🛡️', apy: 11.0, tvl: 125000000, risk: 'low', strategy: 'Risk-optimized', protocols: ['Gauntlet', 'Morpho'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            // === VAULTS BATCH 5 - ULTRA ===
            { id: 'sommelier-eth', name: 'Sommelier ETH Vault', token: 'ETH', icon: '🍷', apy: 18.0, tvl: 145000000, risk: 'medium', strategy: 'Multi-strategy yield', protocols: ['Sommelier'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'sommelier-usdc', name: 'Sommelier USDC Vault', token: 'USDC', icon: '🍷', apy: 15.0, tvl: 185000000, risk: 'low-medium', strategy: 'Real yield farming', protocols: ['Sommelier'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'arrakis-eth-usdc', name: 'Arrakis ETH/USDC', token: 'LP', icon: '🏛️', apy: 25.0, tvl: 95000000, risk: 'medium', strategy: 'Concentrated liquidity', protocols: ['Arrakis', 'Uniswap V3'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'arrakis-wbtc-eth', name: 'Arrakis WBTC/ETH', token: 'LP', icon: '🏛️', apy: 18.0, tvl: 75000000, risk: 'medium', strategy: 'Concentrated liquidity', protocols: ['Arrakis', 'Uniswap V3'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'gamma-eth-usdc', name: 'Gamma ETH/USDC', token: 'LP', icon: '📊', apy: 22.0, tvl: 65000000, risk: 'medium', strategy: 'Active LP management', protocols: ['Gamma', 'Uniswap V3'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'bunni-eth-usdc', name: 'Bunni ETH/USDC', token: 'LP', icon: '🐰', apy: 28.0, tvl: 45000000, risk: 'medium-high', strategy: 'veToken LP boost', protocols: ['Bunni', 'Uniswap V3'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'sturdy-eth', name: 'Sturdy ETH Vault', token: 'ETH', icon: '🔧', apy: 12.0, tvl: 55000000, risk: 'low-medium', strategy: 'Isolated lending', protocols: ['Sturdy'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'notional-usdc', name: 'Notional USDC Vault', token: 'USDC', icon: '📝', apy: 9.0, tvl: 85000000, risk: 'low', strategy: 'Fixed rate lending', protocols: ['Notional'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'exactly-usdc', name: 'Exactly USDC Vault', token: 'USDC', icon: '⚖️', apy: 11.0, tvl: 65000000, risk: 'low', strategy: 'Fixed/variable rates', protocols: ['Exactly'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'idle-best-yield', name: 'Idle Best Yield', token: 'USDC', icon: '💤', apy: 8.5, tvl: 95000000, risk: 'low', strategy: 'Rate optimization', protocols: ['Idle', 'Aave', 'Compound'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'ribbon-eth-covered', name: 'Ribbon ETH Covered Call', token: 'ETH', icon: '🎀', apy: 25.0, tvl: 55000000, risk: 'medium-high', strategy: 'Options selling', protocols: ['Ribbon'], autoCompound: true, harvestFreq: 'Weekly', performanceFee: 20, depositFee: 0, withdrawFee: 0.5 },
            { id: 'ribbon-eth-put', name: 'Ribbon ETH Put Selling', token: 'USDC', icon: '🎀', apy: 18.0, tvl: 45000000, risk: 'medium', strategy: 'Put options selling', protocols: ['Ribbon'], autoCompound: true, harvestFreq: 'Weekly', performanceFee: 20, depositFee: 0, withdrawFee: 0.5 },
            { id: 'opyn-crab', name: 'Opyn Crab Strategy', token: 'ETH', icon: '🦀', apy: 15.0, tvl: 35000000, risk: 'medium', strategy: 'Squeeth arbitrage', protocols: ['Opyn'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.3 },
            { id: 'opyn-zen-bull', name: 'Opyn Zen Bull', token: 'ETH', icon: '🐂', apy: 22.0, tvl: 28000000, risk: 'medium-high', strategy: 'Leveraged ETH', protocols: ['Opyn'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.3 },
            { id: 'polynomial-eth', name: 'Polynomial ETH Vault', token: 'ETH', icon: '📐', apy: 28.0, tvl: 22000000, risk: 'medium-high', strategy: 'Delta neutral options', protocols: ['Polynomial', 'Lyra'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 18, depositFee: 0, withdrawFee: 0.2 },
            { id: 'dopex-eth-atlantic', name: 'Dopex ETH Atlantic', token: 'ETH', icon: '🔷', apy: 35.0, tvl: 18000000, risk: 'high', strategy: 'Atlantic options', protocols: ['Dopex'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 20, depositFee: 0, withdrawFee: 0.5 },
            { id: 'jones-jglp', name: 'Jones jGLP Vault', token: 'GLP', icon: '🃏', apy: 32.0, tvl: 45000000, risk: 'medium-high', strategy: 'Leveraged GLP', protocols: ['Jones DAO', 'GMX'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.5 },
            { id: 'jones-jusdc', name: 'Jones jUSDC Vault', token: 'USDC', icon: '🃏', apy: 18.0, tvl: 55000000, risk: 'medium', strategy: 'GLP delta hedged', protocols: ['Jones DAO', 'GMX'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.3 },
            { id: 'rage-eth', name: 'Rage Trade ETH Vault', token: 'ETH', icon: '😤', apy: 22.0, tvl: 35000000, risk: 'medium', strategy: 'Delta neutral GLP', protocols: ['Rage Trade', 'GMX'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'umami-gmusdc', name: 'Umami gmUSDC Vault', token: 'USDC', icon: '🍣', apy: 20.0, tvl: 28000000, risk: 'medium', strategy: 'GM vault yield', protocols: ['Umami', 'GMX V2'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'umami-gmeth', name: 'Umami gmETH Vault', token: 'ETH', icon: '🍣', apy: 18.0, tvl: 32000000, risk: 'medium', strategy: 'GM vault yield', protocols: ['Umami', 'GMX V2'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'dolomite-eth', name: 'Dolomite ETH Vault', token: 'ETH', icon: '🪨', apy: 8.0, tvl: 45000000, risk: 'low', strategy: 'Margin lending', protocols: ['Dolomite'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'lodestar-usdc', name: 'Lodestar USDC Vault', token: 'USDC', icon: '⭐', apy: 12.0, tvl: 35000000, risk: 'low-medium', strategy: 'Lending optimization', protocols: ['Lodestar'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'vaultka-glp', name: 'Vaultka GLP Vault', token: 'GLP', icon: '🏦', apy: 28.0, tvl: 25000000, risk: 'medium-high', strategy: 'Leveraged GLP yield', protocols: ['Vaultka', 'GMX'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.3 },
            { id: 'abracadabra-magicglp', name: 'Abracadabra magicGLP', token: 'GLP', icon: '✨', apy: 35.0, tvl: 22000000, risk: 'high', strategy: 'Autocompounding GLP', protocols: ['Abracadabra', 'GMX'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 18, depositFee: 0, withdrawFee: 0.5 },
            { id: 'gravita-eth', name: 'Gravita ETH Vault', token: 'ETH', icon: '⬇️', apy: 8.0, tvl: 65000000, risk: 'low', strategy: 'Stablecoin minting', protocols: ['Gravita'], autoCompound: false, harvestFreq: 'N/A', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'prisma-mkusd', name: 'Prisma mkUSD Vault', token: 'mkUSD', icon: '💎', apy: 15.0, tvl: 45000000, risk: 'low-medium', strategy: 'LST CDP yield', protocols: ['Prisma'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'liquity-lusd', name: 'Liquity LUSD Stability', token: 'LUSD', icon: '🐔', apy: 8.0, tvl: 125000000, risk: 'low', strategy: 'Stability pool', protocols: ['Liquity'], autoCompound: false, harvestFreq: 'N/A', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'fx-protocol-fxusd', name: 'f(x) fxUSD Vault', token: 'fxUSD', icon: '📈', apy: 12.0, tvl: 35000000, risk: 'low-medium', strategy: 'Leveraged stETH', protocols: ['f(x) Protocol'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'yieldnest-yneth', name: 'YieldNest ynETH', token: 'ETH', icon: '🪺', apy: 6.5, tvl: 85000000, risk: 'low', strategy: 'Diversified restaking', protocols: ['YieldNest'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'mellow-steakhouse', name: 'Mellow Steakhouse LRT', token: 'ETH', icon: '🥩', apy: 8.0, tvl: 95000000, risk: 'low', strategy: 'Curated restaking', protocols: ['Mellow', 'Symbiotic'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'inception-ineth', name: 'Inception inETH', token: 'ETH', icon: '🌀', apy: 7.5, tvl: 65000000, risk: 'low', strategy: 'LRT aggregation', protocols: ['Inception'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'bedrock-unieth', name: 'Bedrock uniETH', token: 'ETH', icon: '🪨', apy: 7.0, tvl: 75000000, risk: 'low', strategy: 'Universal LRT', protocols: ['Bedrock'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'solv-btc', name: 'Solv SolvBTC Vault', token: 'WBTC', icon: '🔶', apy: 5.0, tvl: 185000000, risk: 'low', strategy: 'BTC yield', protocols: ['Solv Protocol'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'affine-eth', name: 'Affine ETH Vault', token: 'ETH', icon: '🔷', apy: 15.0, tvl: 35000000, risk: 'medium', strategy: 'Multi-protocol yield', protocols: ['Affine'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'overnight-usdplus', name: 'Overnight USD+', token: 'USD+', icon: '🌙', apy: 10.0, tvl: 125000000, risk: 'low', strategy: 'Delta neutral yield', protocols: ['Overnight'], autoCompound: true, harvestFreq: 'Daily', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'overnight-ethplus', name: 'Overnight ETH+', token: 'ETH+', icon: '🌙', apy: 8.0, tvl: 65000000, risk: 'low', strategy: 'Delta neutral ETH', protocols: ['Overnight'], autoCompound: true, harvestFreq: 'Daily', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'origin-ousd', name: 'Origin OUSD Vault', token: 'OUSD', icon: '⚪', apy: 6.0, tvl: 95000000, risk: 'low', strategy: 'Stablecoin yield', protocols: ['Origin'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'amphor-eth', name: 'Amphor ETH Vault', token: 'ETH', icon: '⚡', apy: 12.0, tvl: 28000000, risk: 'medium', strategy: 'Cross-chain yield', protocols: ['Amphor'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'stakedao-sdcrv', name: 'StakeDAO sdCRV', token: 'CRV', icon: '🔴', apy: 22.0, tvl: 55000000, risk: 'medium', strategy: 'Boosted CRV yield', protocols: ['StakeDAO'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'stakedao-sdbal', name: 'StakeDAO sdBAL', token: 'BAL', icon: '🔴', apy: 18.0, tvl: 35000000, risk: 'medium', strategy: 'Boosted BAL yield', protocols: ['StakeDAO'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            // === VAULTS BATCH 6 - MEGA ULTRA ===
            { id: 'defiedge-eth-usdc', name: 'DefiEdge ETH/USDC', token: 'LP', icon: '📐', apy: 28.0, tvl: 45000000, risk: 'medium', strategy: 'Active range management', protocols: ['DefiEdge', 'Uniswap V3'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'ichi-eth-vault', name: 'ICHI oneETH Vault', token: 'ETH', icon: '🔵', apy: 18.0, tvl: 35000000, risk: 'medium', strategy: 'Single-sided LP', protocols: ['ICHI'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'tokemak-eth', name: 'Tokemak ETH Reactor', token: 'ETH', icon: '⚛️', apy: 8.0, tvl: 85000000, risk: 'low', strategy: 'Liquidity direction', protocols: ['Tokemak'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'angle-ageur', name: 'Angle agEUR Vault', token: 'agEUR', icon: '📐', apy: 6.0, tvl: 65000000, risk: 'low', strategy: 'Euro stablecoin yield', protocols: ['Angle'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'gyroscope-gyd', name: 'Gyroscope GYD Vault', token: 'GYD', icon: '🌀', apy: 8.0, tvl: 42000000, risk: 'low', strategy: 'All-weather stable', protocols: ['Gyroscope'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'inverse-dola', name: 'Inverse DOLA Vault', token: 'DOLA', icon: '💵', apy: 12.0, tvl: 55000000, risk: 'low-medium', strategy: 'DOLA lending yield', protocols: ['Inverse Finance'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'yieldyak-avax', name: 'Yield Yak AVAX', token: 'AVAX', icon: '🐃', apy: 12.0, tvl: 75000000, risk: 'low-medium', strategy: 'Avalanche yield optimizer', protocols: ['Yield Yak'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'beefy-eth-lsd', name: 'Beefy ETH LSD Vault', token: 'ETH', icon: '🐄', apy: 8.0, tvl: 125000000, risk: 'low', strategy: 'Auto-compounding LSD', protocols: ['Beefy'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 4.5, depositFee: 0, withdrawFee: 0 },
            { id: 'harvest-usdc', name: 'Harvest USDC Vault', token: 'USDC', icon: '🌾', apy: 12.0, tvl: 95000000, risk: 'low', strategy: 'Multi-protocol farming', protocols: ['Harvest'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'pickle-eth', name: 'Pickle ETH Jar', token: 'ETH', icon: '🥒', apy: 10.0, tvl: 48000000, risk: 'low-medium', strategy: 'Strategy rotation', protocols: ['Pickle Finance'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'vesper-eth', name: 'Vesper ETH Pool', token: 'ETH', icon: '💎', apy: 6.0, tvl: 85000000, risk: 'low', strategy: 'Conservative yield', protocols: ['Vesper'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0 },
            { id: 'badger-btc', name: 'Badger BTC Vault', token: 'WBTC', icon: '🦡', apy: 5.0, tvl: 145000000, risk: 'low', strategy: 'BTC optimization', protocols: ['Badger'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'balancer-bb-usd', name: 'Balancer bb-a-USD', token: 'USDC', icon: '⚖️', apy: 8.0, tvl: 185000000, risk: 'very-low', strategy: 'Boosted stablecoin', protocols: ['Balancer', 'Aave'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'aura-bal-eth', name: 'Aura BAL/ETH BPT', token: 'BPT', icon: '🔮', apy: 25.0, tvl: 65000000, risk: 'medium', strategy: 'Boosted BAL rewards', protocols: ['Aura', 'Balancer'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'mstable-musd', name: 'mStable mUSD Save', token: 'mUSD', icon: '📦', apy: 6.0, tvl: 55000000, risk: 'very-low', strategy: 'Stablecoin basket', protocols: ['mStable'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'euler-usdc', name: 'Euler USDC Vault', token: 'USDC', icon: '🔢', apy: 10.0, tvl: 145000000, risk: 'low', strategy: 'Optimized lending', protocols: ['Euler'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'gearbox-eth', name: 'Gearbox ETH Vault', token: 'ETH', icon: '⚙️', apy: 12.0, tvl: 85000000, risk: 'low-medium', strategy: 'Leveraged farming', protocols: ['Gearbox'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'silo-eth', name: 'Silo ETH Vault', token: 'ETH', icon: '🏛️', apy: 8.0, tvl: 65000000, risk: 'low', strategy: 'Isolated lending', protocols: ['Silo'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'fluid-usdc', name: 'Fluid USDC Vault', token: 'USDC', icon: '💧', apy: 15.0, tvl: 95000000, risk: 'low-medium', strategy: 'Smart lending', protocols: ['Fluid'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'spark-dai', name: 'Spark sDAI Vault', token: 'DAI', icon: '✨', apy: 8.0, tvl: 450000000, risk: 'very-low', strategy: 'DAI savings rate', protocols: ['Spark'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 0, depositFee: 0, withdrawFee: 0 },
            { id: 'asymmetry-afeth', name: 'Asymmetry afETH', token: 'ETH', icon: '🔀', apy: 10.0, tvl: 55000000, risk: 'low-medium', strategy: 'Diversified LSD', protocols: ['Asymmetry'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0.1 },
            { id: 'dinero-dpxeth', name: 'Dinero pxETH', token: 'ETH', icon: '💰', apy: 6.0, tvl: 85000000, risk: 'low', strategy: 'Pirex ETH staking', protocols: ['Dinero', 'Redacted'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'chronos-vlp', name: 'Chronos vLP Vault', token: 'LP', icon: '⏱️', apy: 35.0, tvl: 28000000, risk: 'medium-high', strategy: 'veChronos boosted', protocols: ['Chronos'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'lynex-vlp', name: 'Lynex vLP Vault', token: 'LP', icon: '🔷', apy: 42.0, tvl: 35000000, risk: 'medium-high', strategy: 'veLynex boosted', protocols: ['Lynex'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'ramses-vlp', name: 'Ramses vLP Vault', token: 'LP', icon: '👑', apy: 38.0, tvl: 32000000, risk: 'medium-high', strategy: 'veRamses boosted', protocols: ['Ramses'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'thena-vlp', name: 'Thena vLP Vault', token: 'LP', icon: '💜', apy: 45.0, tvl: 42000000, risk: 'medium-high', strategy: 'veTHE boosted', protocols: ['Thena'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'camelot-xlp', name: 'Camelot xLP Vault', token: 'LP', icon: '⚔️', apy: 32.0, tvl: 65000000, risk: 'medium', strategy: 'xGRAIL boosted', protocols: ['Camelot'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'maverick-ma', name: 'Maverick MA Vault', token: 'LP', icon: '🎯', apy: 28.0, tvl: 48000000, risk: 'medium', strategy: 'Mode A liquidity', protocols: ['Maverick'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'merchant-eth', name: 'Merchant ETH Vault', token: 'ETH', icon: '🏪', apy: 15.0, tvl: 35000000, risk: 'medium', strategy: 'Multi-strategy', protocols: ['Merchant Moe'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            // === VAULTS BATCH 7 - YOTTA EXPANSION ===
            { id: 'pancake-cake-vault', name: 'PancakeSwap CAKE', token: 'CAKE', icon: '🥞', apy: 45.0, tvl: 285000000, risk: 'medium', strategy: 'Auto-compounding CAKE', protocols: ['PancakeSwap'], autoCompound: true, harvestFreq: '1 hour', performanceFee: 2, depositFee: 0, withdrawFee: 0 },
            { id: 'alpaca-busd-vault', name: 'Alpaca BUSD Vault', token: 'BUSD', icon: '🦙', apy: 18.0, tvl: 85000000, risk: 'low-medium', strategy: 'Leveraged lending', protocols: ['Alpaca Finance'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 9, depositFee: 0, withdrawFee: 0 },
            { id: 'venus-vai-vault', name: 'Venus VAI Vault', token: 'VAI', icon: '🔶', apy: 12.0, tvl: 45000000, risk: 'low', strategy: 'VAI yield optimization', protocols: ['Venus'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'biswap-bsw-vault', name: 'Biswap BSW Vault', token: 'BSW', icon: '🔄', apy: 55.0, tvl: 35000000, risk: 'medium-high', strategy: 'BSW staking rewards', protocols: ['Biswap'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 5, depositFee: 0, withdrawFee: 0 },
            { id: 'belt-4belt-vault', name: 'Belt 4Belt Vault', token: 'BUSD', icon: '🔗', apy: 8.0, tvl: 65000000, risk: 'low', strategy: 'Stablecoin belt', protocols: ['Belt Finance'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'ellipsis-3eps-vault', name: 'Ellipsis 3EPS Vault', token: 'BUSD', icon: 'ε', apy: 10.0, tvl: 55000000, risk: 'low', strategy: '3pool stablecoin', protocols: ['Ellipsis'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'mdex-mdx-vault', name: 'MDEX MDX Vault', token: 'MDX', icon: '🔷', apy: 35.0, tvl: 28000000, risk: 'medium', strategy: 'MDX boardroom', protocols: ['MDEX'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'nerve-3nrv-vault', name: 'Nerve 3NRV Vault', token: 'BUSD', icon: '⚡', apy: 15.0, tvl: 18000000, risk: 'low-medium', strategy: 'Stablecoin 3pool', protocols: ['Nerve Finance'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'wault-wex-vault', name: 'Wault WEX Vault', token: 'WEX', icon: '🏦', apy: 28.0, tvl: 12000000, risk: 'medium-high', strategy: 'WEX staking', protocols: ['WaultSwap'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'acryptos-acs-vault', name: 'ACryptoS ACS Vault', token: 'ACS', icon: '🔐', apy: 25.0, tvl: 22000000, risk: 'medium', strategy: 'ACS farming', protocols: ['ACryptoS'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 5.5, depositFee: 0, withdrawFee: 0.1 },
            { id: 'autofarm-auto-vault', name: 'AutoFarm AUTO Vault', token: 'AUTO', icon: '🤖', apy: 18.0, tvl: 35000000, risk: 'medium', strategy: 'AUTO staking', protocols: ['AutoFarm'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 4.5, depositFee: 0, withdrawFee: 0 },
            { id: 'growing-grw-vault', name: 'Growing GRW Vault', token: 'GRW', icon: '🌱', apy: 42.0, tvl: 8000000, risk: 'high', strategy: 'GRW staking rewards', protocols: ['Growing.fi'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'swamp-swamp-vault', name: 'Swamp SWAMP Vault', token: 'SWAMP', icon: '🐊', apy: 32.0, tvl: 6000000, risk: 'medium-high', strategy: 'SWAMP rewards', protocols: ['SwampFinance'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'goose-egg-vault', name: 'Goose EGG Vault', token: 'EGG', icon: '🥚', apy: 38.0, tvl: 5000000, risk: 'high', strategy: 'EGG farming', protocols: ['GooseFinance'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'kebab-kebab-vault', name: 'Kebab KEBAB Vault', token: 'KEBAB', icon: '🥙', apy: 45.0, tvl: 4000000, risk: 'high', strategy: 'KEBAB staking', protocols: ['KebabFinance'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'ten-tenfi-vault', name: 'TEN TenFi Vault', token: 'TENFI', icon: '🔟', apy: 35.0, tvl: 8000000, risk: 'medium-high', strategy: 'TENFI staking', protocols: ['TenFinance'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'value-vbswap-vault', name: 'Value vBSWAP Vault', token: 'vBSWAP', icon: '💎', apy: 28.0, tvl: 12000000, risk: 'medium', strategy: 'vBSWAP rewards', protocols: ['ValueDeFi'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'dopple-dop-vault', name: 'Dopple DOP Vault', token: 'DOP', icon: '2️⃣', apy: 22.0, tvl: 15000000, risk: 'medium', strategy: 'DOP staking', protocols: ['Dopple'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'space-space-vault', name: 'Space SPACE Vault', token: 'SPACE', icon: '🚀', apy: 55.0, tvl: 10000000, risk: 'high', strategy: 'SPACE farming', protocols: ['SpaceFarm'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'jetfuel-fuel-vault', name: 'JetFuel FUEL Vault', token: 'FUEL', icon: '✈️', apy: 48.0, tvl: 8000000, risk: 'high', strategy: 'FUEL staking', protocols: ['JetFuel'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'polaris-polar-vault', name: 'Polaris POLAR Vault', token: 'POLAR', icon: '⭐', apy: 65.0, tvl: 6000000, risk: 'high', strategy: 'POLAR staking', protocols: ['Polaris'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 18, depositFee: 0, withdrawFee: 0.3 },
            { id: 'pinksale-pink-vault', name: 'PinkSale PINK Vault', token: 'PINK', icon: '🎀', apy: 42.0, tvl: 15000000, risk: 'medium-high', strategy: 'PINK staking', protocols: ['PinkSale'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'dxsale-sale-vault', name: 'DxSale SALE Vault', token: 'SALE', icon: '💰', apy: 38.0, tvl: 12000000, risk: 'medium-high', strategy: 'SALE staking', protocols: ['DxSale'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'unicrypt-uncx-vault', name: 'Unicrypt UNCX Vault', token: 'UNCX', icon: '🔒', apy: 25.0, tvl: 28000000, risk: 'medium', strategy: 'UNCX fee sharing', protocols: ['Unicrypt'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'team-finance-tf-vault', name: 'Team Finance Vault', token: 'TF', icon: '👥', apy: 22.0, tvl: 18000000, risk: 'medium', strategy: 'TF staking', protocols: ['Team Finance'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'mudra-mudra-vault', name: 'Mudra MUDRA Vault', token: 'MUDRA', icon: '🤲', apy: 35.0, tvl: 8000000, risk: 'medium-high', strategy: 'MUDRA staking', protocols: ['Mudra'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'baby-baby-vault', name: 'BabySwap BABY Vault', token: 'BABY', icon: '👶', apy: 48.0, tvl: 22000000, risk: 'medium-high', strategy: 'BABY staking', protocols: ['BabySwap'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'knightswap-knight-vault', name: 'KnightSwap KNIGHT', token: 'KNIGHT', icon: '⚔️', apy: 52.0, tvl: 12000000, risk: 'medium-high', strategy: 'KNIGHT staking', protocols: ['KnightSwap'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'koala-lyptus-vault', name: 'Koala LYPTUS Vault', token: 'LYPTUS', icon: '🐨', apy: 42.0, tvl: 5000000, risk: 'high', strategy: 'LYPTUS farming', protocols: ['KoalaDefi'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'panda-bamboo-vault', name: 'PandaSwap BAMBOO', token: 'BAMBOO', icon: '🐼', apy: 38.0, tvl: 8000000, risk: 'medium-high', strategy: 'BAMBOO staking', protocols: ['PandaSwap'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'hyperjump-ori-vault', name: 'HyperJump ORI Vault', token: 'ORI', icon: '🌌', apy: 45.0, tvl: 6000000, risk: 'high', strategy: 'ORI staking', protocols: ['HyperJump'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.2 },
            { id: 'cafeswap-brew-vault', name: 'CafeSwap BREW Vault', token: 'BREW', icon: '☕', apy: 35.0, tvl: 5000000, risk: 'medium-high', strategy: 'BREW farming', protocols: ['CafeSwap'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'sushi-bnb-vault', name: 'SushiSwap BNB Vault', token: 'BNB', icon: '🍣', apy: 15.0, tvl: 85000000, risk: 'low-medium', strategy: 'SushiSwap farms', protocols: ['SushiSwap'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 9, depositFee: 0, withdrawFee: 0 },
            { id: 'julswap-jul-vault', name: 'JulSwap JUL Vault', token: 'JUL', icon: '🌹', apy: 28.0, tvl: 4000000, risk: 'medium-high', strategy: 'JUL staking', protocols: ['JulSwap'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            // === VAULTS BATCH 8 - QUETTA EXPANSION ===
            // AI & GPU Token Vaults
            { id: 'tao-yield-vault', name: 'TAO Yield Vault', token: 'TAO', icon: '🧠', apy: 25.0, tvl: 145000000, risk: 'medium-high', strategy: 'Subnet delegation + rewards', protocols: ['Bittensor'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'fet-agix-ocean-vault', name: 'ASI Alliance Vault', token: 'FET', icon: '🤖', apy: 18.0, tvl: 95000000, risk: 'medium', strategy: 'ASI token basket', protocols: ['Fetch.ai', 'SingularityNET', 'Ocean'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'rndr-io-vault', name: 'GPU Compute Vault', token: 'RNDR', icon: '🖥️', apy: 22.0, tvl: 85000000, risk: 'medium', strategy: 'GPU rendering rewards', protocols: ['Render', 'io.net'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'wld-stake-vault', name: 'Worldcoin Vault', token: 'WLD', icon: '🌐', apy: 12.0, tvl: 125000000, risk: 'medium', strategy: 'WLD optimized staking', protocols: ['Worldcoin'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'akash-compute-vault', name: 'Akash Compute Vault', token: 'AKT', icon: '☁️', apy: 28.0, tvl: 55000000, risk: 'medium', strategy: 'Provider staking + rewards', protocols: ['Akash'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            // Gaming Token Vaults
            { id: 'imx-gaming-vault', name: 'IMX Gaming Vault', token: 'IMX', icon: '🎮', apy: 18.0, tvl: 125000000, risk: 'medium', strategy: 'Gaming ecosystem yield', protocols: ['Immutable X'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'ronin-axie-vault', name: 'Ronin Axie Vault', token: 'RON', icon: '⚔️', apy: 22.0, tvl: 145000000, risk: 'medium', strategy: 'RON staking + farms', protocols: ['Ronin', 'Katana'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'gala-games-vault', name: 'GALA Games Vault', token: 'GALA', icon: '🎮', apy: 25.0, tvl: 85000000, risk: 'medium-high', strategy: 'GALA node rewards', protocols: ['Gala Games'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'prime-gaming-vault', name: 'PRIME Gaming Vault', token: 'PRIME', icon: '🎮', apy: 35.0, tvl: 95000000, risk: 'medium-high', strategy: 'Echelon rewards', protocols: ['Parallel', 'Echelon'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'beam-gaming-vault', name: 'BEAM Gaming Vault', token: 'BEAM', icon: '🎮', apy: 28.0, tvl: 55000000, risk: 'medium-high', strategy: 'Merit Circle ecosystem', protocols: ['Beam'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'pixel-vault', name: 'PIXEL Yield Vault', token: 'PIXEL', icon: '🎮', apy: 32.0, tvl: 42000000, risk: 'medium-high', strategy: 'Pixels game rewards', protocols: ['Pixels'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            // DeFi Governance Vaults
            { id: 'crv-cvx-vault', name: 'Curve Convex Vault', token: 'CRV', icon: '🔄', apy: 15.0, tvl: 285000000, risk: 'medium', strategy: 'cvxCRV + bribe harvesting', protocols: ['Curve', 'Convex'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'bal-aura-vault', name: 'Balancer Aura Vault', token: 'BAL', icon: '⚖️', apy: 18.0, tvl: 125000000, risk: 'medium', strategy: 'auraBAL + bribes', protocols: ['Balancer', 'Aura'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'fxs-cvxfxs-vault', name: 'Frax Convex Vault', token: 'FXS', icon: 'F', apy: 20.0, tvl: 85000000, risk: 'medium', strategy: 'cvxFXS + FRAX yield', protocols: ['Frax', 'Convex'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'yfi-veyfi-vault', name: 'Yearn veYFI Vault', token: 'YFI', icon: '💙', apy: 12.0, tvl: 125000000, risk: 'medium', strategy: 'veYFI governance + fees', protocols: ['Yearn'], autoCompound: false, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'snx-optimism-vault', name: 'SNX Optimism Vault', token: 'SNX', icon: '🔷', apy: 28.0, tvl: 145000000, risk: 'medium', strategy: 'Synthetix staking + sUSD', protocols: ['Synthetix', 'Kwenta'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'comp-compound-vault', name: 'Compound III Vault', token: 'COMP', icon: '🏛️', apy: 8.0, tvl: 95000000, risk: 'low-medium', strategy: 'Compound III optimizer', protocols: ['Compound'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            // Infrastructure & DePIN Vaults
            { id: 'hnt-helium-vault', name: 'Helium HNT Vault', token: 'HNT', icon: '📡', apy: 12.0, tvl: 125000000, risk: 'medium', strategy: 'HNT delegation', protocols: ['Helium'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'mobile-5g-vault', name: 'Helium 5G Vault', token: 'MOBILE', icon: '📱', apy: 25.0, tvl: 35000000, risk: 'medium-high', strategy: '5G network rewards', protocols: ['Helium Mobile'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'iotx-machinefi-vault', name: 'IoTeX MachineFi Vault', token: 'IOTX', icon: '🔌', apy: 18.0, tvl: 75000000, risk: 'medium', strategy: 'MachineFi staking', protocols: ['IoTeX'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'flr-ftso-vault', name: 'Flare FTSO Vault', token: 'FLR', icon: '⚡', apy: 15.0, tvl: 65000000, risk: 'medium', strategy: 'FTSO delegation rewards', protocols: ['Flare'], autoCompound: true, harvestFreq: '168 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            // Liquid Staking Derivative Vaults
            { id: 'steth-lrt-vault', name: 'stETH LRT Vault', token: 'stETH', icon: '⟠', apy: 8.0, tvl: 485000000, risk: 'low-medium', strategy: 'LRT restaking + rewards', protocols: ['Lido', 'EigenLayer'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'reth-rocket-vault', name: 'rETH Rocket Vault', token: 'rETH', icon: '🚀', apy: 6.5, tvl: 285000000, risk: 'low-medium', strategy: 'Rocket Pool + DeFi', protocols: ['Rocket Pool', 'Aave'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'jitosol-defi-vault', name: 'JitoSOL DeFi Vault', token: 'JitoSOL', icon: '◎', apy: 12.0, tvl: 185000000, risk: 'low-medium', strategy: 'Jito MEV + Solana DeFi', protocols: ['Jito', 'Kamino'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'msol-marinade-vault', name: 'mSOL Marinade Vault', token: 'mSOL', icon: '◎', apy: 10.0, tvl: 145000000, risk: 'low-medium', strategy: 'Marinade + farms', protocols: ['Marinade', 'Raydium'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            // Emerging Sector Vaults
            { id: 'eigen-restaking-vault', name: 'EigenLayer Vault', token: 'EIGEN', icon: '🔄', apy: 15.0, tvl: 185000000, risk: 'medium', strategy: 'Restaking rewards', protocols: ['EigenLayer'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'tia-celestia-vault', name: 'Celestia TIA Vault', token: 'TIA', icon: '🌙', apy: 18.0, tvl: 145000000, risk: 'medium', strategy: 'DA staking', protocols: ['Celestia'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'strk-starknet-vault', name: 'Starknet Vault', token: 'STRK', icon: '⚡', apy: 15.0, tvl: 95000000, risk: 'medium', strategy: 'Starknet staking', protocols: ['Starknet'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'zk-zksync-vault', name: 'zkSync Vault', token: 'ZK', icon: '🔐', apy: 12.0, tvl: 125000000, risk: 'medium', strategy: 'ZK token staking', protocols: ['zkSync'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'ton-staking-vault', name: 'TON Staking Vault', token: 'TON', icon: '✈️', apy: 10.0, tvl: 245000000, risk: 'medium', strategy: 'TON validator staking', protocols: ['TON'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'ondo-rwa-vault', name: 'Ondo RWA Vault', token: 'ONDO', icon: '🏦', apy: 8.0, tvl: 185000000, risk: 'low-medium', strategy: 'RWA yield optimization', protocols: ['Ondo'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'pyth-oracle-vault', name: 'Pyth Oracle Vault', token: 'PYTH', icon: '🐍', apy: 12.0, tvl: 95000000, risk: 'medium', strategy: 'Oracle staking', protocols: ['Pyth'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },

            // === VAULTS BATCH 9 - GIGA EXPANSION ===
            // DePIN Infrastructure Vaults
            { id: 'depin-infra-vault', name: 'DePIN Infrastructure', token: 'MULTI', icon: '🌐', apy: 28.0, tvl: 85000000, risk: 'medium-high', strategy: 'Multi-DePIN yield aggregation', protocols: ['DIMO', 'Hivemapper', 'Helium'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'render-gpu-vault', name: 'Render GPU Vault', token: 'RENDER', icon: '🎨', apy: 15.0, tvl: 145000000, risk: 'medium', strategy: 'GPU compute staking', protocols: ['Render'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'grass-bandwidth-vault', name: 'Grass Bandwidth', token: 'GRASS', icon: '🌱', apy: 45.0, tvl: 95000000, risk: 'high', strategy: 'Bandwidth mining rewards', protocols: ['Grass'], autoCompound: true, harvestFreq: '6 hours', performanceFee: 20, depositFee: 0, withdrawFee: 0.2 },
            { id: 'geodnet-location-vault', name: 'GEODNET Location', token: 'GEOD', icon: '🛰️', apy: 35.0, tvl: 15000000, risk: 'high', strategy: 'Location data rewards', protocols: ['GEODNET'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'dimo-vehicle-vault', name: 'DIMO Vehicle Data', token: 'DIMO', icon: '🚗', apy: 25.0, tvl: 35000000, risk: 'medium-high', strategy: 'Vehicle data staking', protocols: ['DIMO'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },

            // RWA & Credit Vaults
            { id: 'rwa-credit-vault', name: 'RWA Credit Vault', token: 'MULTI', icon: '🏦', apy: 12.0, tvl: 125000000, risk: 'low-medium', strategy: 'RWA credit yield', protocols: ['Maple', 'Goldfinch', 'Centrifuge'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'maple-lending-vault', name: 'Maple Lending', token: 'MPL', icon: '🍁', apy: 15.0, tvl: 65000000, risk: 'medium', strategy: 'Institutional lending', protocols: ['Maple'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'centrifuge-rwa-vault', name: 'Centrifuge RWA', token: 'CFG', icon: '🌀', apy: 12.0, tvl: 42000000, risk: 'medium', strategy: 'Asset tokenization', protocols: ['Centrifuge'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'goldfinch-credit-vault', name: 'Goldfinch Credit', token: 'GFI', icon: '🐦', apy: 18.0, tvl: 32000000, risk: 'medium-high', strategy: 'Global credit lending', protocols: ['Goldfinch'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'polymesh-security-vault', name: 'Polymesh Security', token: 'POLYX', icon: '🔷', apy: 10.0, tvl: 95000000, risk: 'medium', strategy: 'Security token staking', protocols: ['Polymesh'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },

            // Social & Creator Vaults
            { id: 'socialfi-vault', name: 'SocialFi Aggregator', token: 'MULTI', icon: '👥', apy: 35.0, tvl: 55000000, risk: 'high', strategy: 'Social token farming', protocols: ['Lens', 'Friend.tech', 'Galxe'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 18, depositFee: 0, withdrawFee: 0.2 },
            { id: 'lens-social-vault', name: 'Lens Social Vault', token: 'LENS', icon: '🔍', apy: 22.0, tvl: 65000000, risk: 'medium-high', strategy: 'Lens Protocol staking', protocols: ['Lens'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'galxe-credential-vault', name: 'Galxe Credential', token: 'GAL', icon: '🌌', apy: 15.0, tvl: 52000000, risk: 'medium', strategy: 'Credential network staking', protocols: ['Galxe'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'creator-economy-vault', name: 'Creator Economy', token: 'MULTI', icon: '🎭', apy: 28.0, tvl: 35000000, risk: 'medium-high', strategy: 'Creator token diversified', protocols: ['Rally', 'DeSo'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },

            // Prediction & Oracle Vaults
            { id: 'prediction-market-vault', name: 'Prediction Markets', token: 'MULTI', icon: '🎲', apy: 18.0, tvl: 85000000, risk: 'medium', strategy: 'Prediction market liquidity', protocols: ['Gnosis', 'Polymarket'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'gnosis-chain-vault', name: 'Gnosis Chain Vault', token: 'GNO', icon: '🦉', apy: 8.0, tvl: 225000000, risk: 'low-medium', strategy: 'GNO staking + prediction fees', protocols: ['Gnosis'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'oracle-aggregator-vault', name: 'Oracle Aggregator', token: 'MULTI', icon: '🔔', apy: 15.0, tvl: 75000000, risk: 'medium', strategy: 'Multi-oracle staking', protocols: ['UMA', 'Tellor', 'API3'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'uma-optimistic-vault', name: 'UMA Optimistic', token: 'UMA', icon: '🔔', apy: 18.0, tvl: 58000000, risk: 'medium', strategy: 'Optimistic oracle voting', protocols: ['UMA'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'tellor-reporter-vault', name: 'Tellor Reporter', token: 'TRB', icon: '📊', apy: 16.0, tvl: 35000000, risk: 'medium', strategy: 'Data reporting staking', protocols: ['Tellor'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },

            // Cosmos DeFi Vaults
            { id: 'cosmos-defi-vault', name: 'Cosmos DeFi Hub', token: 'MULTI', icon: '⚛️', apy: 22.0, tvl: 185000000, risk: 'medium', strategy: 'Multi-Cosmos yield', protocols: ['Osmosis', 'Stride', 'Mars'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'dydx-perp-vault', name: 'dYdX Perp Vault', token: 'DYDX', icon: '📈', apy: 18.0, tvl: 345000000, risk: 'medium', strategy: 'dYdX chain staking', protocols: ['dYdX'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'stride-lst-vault', name: 'Stride LST Vault', token: 'STRD', icon: '🏃', apy: 25.0, tvl: 65000000, risk: 'medium', strategy: 'Stride liquid staking aggregation', protocols: ['Stride'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'neutron-defi-vault', name: 'Neutron DeFi', token: 'NTRN', icon: '⚛️', apy: 22.0, tvl: 115000000, risk: 'medium', strategy: 'Neutron DeFi optimization', protocols: ['Neutron', 'Astroport'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'akash-compute-vault', name: 'Akash Compute', token: 'AKT', icon: '☁️', apy: 28.0, tvl: 145000000, risk: 'medium', strategy: 'Cloud compute staking', protocols: ['Akash'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'kujira-finv-vault', name: 'Kujira FINv', token: 'KUJI', icon: '🐋', apy: 20.0, tvl: 52000000, risk: 'medium', strategy: 'Kujira DeFi hub yield', protocols: ['Kujira', 'FIN'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'mars-lending-vault', name: 'Mars Lending', token: 'MARS', icon: '🔴', apy: 30.0, tvl: 32000000, risk: 'medium-high', strategy: 'Mars Protocol lending', protocols: ['Mars'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },

            // Bitcoin L2 & Ordinals Vaults
            { id: 'btc-l2-vault', name: 'Bitcoin L2 Vault', token: 'MULTI', icon: '₿', apy: 18.0, tvl: 225000000, risk: 'medium', strategy: 'BTC L2 yield aggregation', protocols: ['Stacks', 'ALEX'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'stx-pox-vault', name: 'STX PoX Vault', token: 'STX', icon: '📦', apy: 12.0, tvl: 225000000, risk: 'medium', strategy: 'Proof of Transfer BTC yield', protocols: ['Stacks'], autoCompound: false, harvestFreq: '14 days', performanceFee: 5, depositFee: 0, withdrawFee: 0 },
            { id: 'ordinals-vault', name: 'Ordinals Yield', token: 'MULTI', icon: '🟡', apy: 35.0, tvl: 95000000, risk: 'high', strategy: 'BRC-20 token staking', protocols: ['ALEX', 'Unisat'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 18, depositFee: 0, withdrawFee: 0.2 },
            { id: 'alex-btc-vault', name: 'ALEX Bitcoin DeFi', token: 'ALEX', icon: '🔶', apy: 25.0, tvl: 42000000, risk: 'medium-high', strategy: 'Bitcoin DeFi yield', protocols: ['ALEX'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'runes-vault', name: 'Bitcoin Runes', token: 'RUNES', icon: '🪨', apy: 45.0, tvl: 35000000, risk: 'high', strategy: 'Runes token farming', protocols: ['ALEX'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 20, depositFee: 0, withdrawFee: 0.2 },

            // MEV Protection Vaults
            { id: 'mev-protection-vault', name: 'MEV Protection', token: 'MULTI', icon: '🐄', apy: 12.0, tvl: 65000000, risk: 'low-medium', strategy: 'MEV-protected execution', protocols: ['CoW', 'Eden'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },
            { id: 'cow-solver-vault', name: 'CoW Solver Vault', token: 'COW', icon: '🐄', apy: 12.0, tvl: 42000000, risk: 'medium', strategy: 'CoW Protocol solver rewards', protocols: ['CoW'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },

            // === VAULTS BATCH 10 - PETA EXPANSION ===
            // Consumer Apps & Metaverse Vaults
            { id: 'metaverse-land-vault', name: 'Metaverse Land', token: 'MULTI', icon: '🌐', apy: 18.0, tvl: 125000000, risk: 'medium', strategy: 'Virtual land yield aggregation', protocols: ['Decentraland', 'Sandbox'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0.1 },
            { id: 'move2earn-vault', name: 'Move-to-Earn', token: 'MULTI', icon: '👟', apy: 22.0, tvl: 95000000, risk: 'medium', strategy: 'M2E token aggregation', protocols: ['STEPN', 'Sweat'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'axie-ecosystem-vault', name: 'Axie Ecosystem', token: 'AXS', icon: '⚔️', apy: 28.0, tvl: 185000000, risk: 'medium', strategy: 'AXS staking + RON rewards', protocols: ['Ronin'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },

            // NFT Infrastructure Vaults
            { id: 'nft-marketplace-vault', name: 'NFT Marketplace', token: 'MULTI', icon: '🖼️', apy: 25.0, tvl: 145000000, risk: 'medium-high', strategy: 'NFT marketplace fees', protocols: ['Blur', 'LooksRare', 'Sudoswap'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'blur-bidding-vault', name: 'Blur Bidding', token: 'BLUR', icon: '🟠', apy: 32.0, tvl: 125000000, risk: 'medium-high', strategy: 'Blur bid pool rewards', protocols: ['Blur'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'treasure-dao-vault', name: 'Treasure DAO', token: 'MAGIC', icon: '✨', apy: 35.0, tvl: 95000000, risk: 'medium-high', strategy: 'MAGIC staking + gaming', protocols: ['Treasure'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },

            // Entertainment & Media Vaults
            { id: 'music-nft-vault', name: 'Music NFT Yield', token: 'AUDIO', icon: '🎵', apy: 20.0, tvl: 55000000, risk: 'medium', strategy: 'Music platform rewards', protocols: ['Audius'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'creator-economy-vault', name: 'Creator Economy', token: 'MULTI', icon: '📺', apy: 28.0, tvl: 45000000, risk: 'medium-high', strategy: 'Creator token aggregation', protocols: ['XCAD', 'Verasity'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },

            // Sports & Fan Token Vaults
            { id: 'fan-token-vault', name: 'Fan Token Yield', token: 'CHZ', icon: '⚽', apy: 15.0, tvl: 165000000, risk: 'medium', strategy: 'Multi-fan token staking', protocols: ['Chiliz', 'Socios'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'football-clubs-vault', name: 'Football Clubs', token: 'MULTI', icon: '⚽', apy: 12.0, tvl: 85000000, risk: 'medium', strategy: 'Top football fan tokens', protocols: ['BAR', 'PSG', 'JUV'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 8, depositFee: 0, withdrawFee: 0 },

            // Gaming Infrastructure Vaults
            { id: 'aaa-gaming-vault', name: 'AAA Gaming', token: 'MULTI', icon: '🎮', apy: 35.0, tvl: 125000000, risk: 'medium-high', strategy: 'Top gaming token aggregation', protocols: ['Illuvium', 'BEAM', 'GODS'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 15, depositFee: 0, withdrawFee: 0.1 },
            { id: 'guild-yield-vault', name: 'Guild Yield', token: 'YGG', icon: '🏴‍☠️', apy: 25.0, tvl: 65000000, risk: 'medium', strategy: 'Gaming guild staking', protocols: ['YGG', 'Merit Circle'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },
            { id: 'illuvium-yield-vault', name: 'Illuvium Yield', token: 'ILV', icon: '🎯', apy: 30.0, tvl: 75000000, risk: 'medium-high', strategy: 'ILV staking rewards', protocols: ['Illuvium'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'beam-gaming-vault', name: 'BEAM Gaming', token: 'BEAM', icon: '🎮', apy: 42.0, tvl: 105000000, risk: 'medium-high', strategy: 'Merit Circle ecosystem', protocols: ['BEAM', 'Sphere'], autoCompound: true, harvestFreq: '12 hours', performanceFee: 12, depositFee: 0, withdrawFee: 0 },

            // Base Ecosystem Vaults
            { id: 'base-defi-vault', name: 'Base DeFi Hub', token: 'ETH', icon: '🔵', apy: 28.0, tvl: 225000000, risk: 'medium', strategy: 'Base chain yield aggregation', protocols: ['Aerodrome', 'Extra'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'aerodrome-lp-vault', name: 'Aerodrome LP', token: 'AERO', icon: '✈️', apy: 45.0, tvl: 165000000, risk: 'medium', strategy: 'Aerodrome LP optimization', protocols: ['Aerodrome'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 },
            { id: 'base-meme-vault', name: 'Base Memes', token: 'MULTI', icon: '🐸', apy: 85.0, tvl: 95000000, risk: 'high', strategy: 'Base meme token farming', protocols: ['Brett', 'Degen', 'Toshi'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 20, depositFee: 0, withdrawFee: 0.2 },
            { id: 'farcaster-yield-vault', name: 'Farcaster Yield', token: 'DEGEN', icon: '🎰', apy: 75.0, tvl: 75000000, risk: 'high', strategy: 'Farcaster ecosystem tokens', protocols: ['Degen', 'Higher'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 18, depositFee: 0, withdrawFee: 0.1 },

            // Solana Meme Vaults
            { id: 'sol-cat-meme-vault', name: 'Solana Cat Memes', token: 'MULTI', icon: '🐈', apy: 125.0, tvl: 145000000, risk: 'high', strategy: 'Cat meme aggregation', protocols: ['Popcat', 'MEW'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 22, depositFee: 0, withdrawFee: 0.2 },
            { id: 'sol-meme-degen-vault', name: 'Sol Meme Degen', token: 'MULTI', icon: '🚀', apy: 150.0, tvl: 185000000, risk: 'high', strategy: 'High-yield Solana memes', protocols: ['BOME', 'Slerf', 'WEN'], autoCompound: true, harvestFreq: '2 hours', performanceFee: 25, depositFee: 0, withdrawFee: 0.3 },
            { id: 'bome-yield-vault', name: 'BOME Yield', token: 'BOME', icon: '📖', apy: 95.0, tvl: 125000000, risk: 'high', strategy: 'Book of Meme staking', protocols: ['Raydium'], autoCompound: true, harvestFreq: '8 hours', performanceFee: 18, depositFee: 0, withdrawFee: 0.1 },

            // Cross-Chain & Multi-Strategy
            { id: 'multi-chain-meme-vault', name: 'Multi-Chain Memes', token: 'MULTI', icon: '🌈', apy: 110.0, tvl: 165000000, risk: 'high', strategy: 'Cross-chain meme aggregation', protocols: ['Base', 'Solana', 'Ethereum'], autoCompound: true, harvestFreq: '4 hours', performanceFee: 22, depositFee: 0, withdrawFee: 0.2 },
            { id: 'consumer-apps-vault', name: 'Consumer Apps', token: 'MULTI', icon: '📱', apy: 22.0, tvl: 115000000, risk: 'medium', strategy: 'Consumer app token mix', protocols: ['GMT', 'AXS', 'CHZ'], autoCompound: true, harvestFreq: '24 hours', performanceFee: 10, depositFee: 0, withdrawFee: 0 }
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
            },
            // === NEW LENDING BATCH ===
            { id: 'lend-avax', name: 'Lend AVAX', token: 'AVAX', icon: '🔺', supplyApy: 4.5, borrowApy: 6.8, utilization: 58, totalSupply: 280000000, totalBorrow: 162400000, collateralFactor: 0.70, liquidationThreshold: 0.75, risk: 'medium' },
            { id: 'lend-matic', name: 'Lend MATIC', token: 'MATIC', icon: '⬡', supplyApy: 3.8, borrowApy: 5.5, utilization: 52, totalSupply: 320000000, totalBorrow: 166400000, collateralFactor: 0.72, liquidationThreshold: 0.78, risk: 'low' },
            { id: 'lend-link', name: 'Lend LINK', token: 'LINK', icon: '🔗', supplyApy: 2.5, borrowApy: 4.2, utilization: 48, totalSupply: 180000000, totalBorrow: 86400000, collateralFactor: 0.75, liquidationThreshold: 0.80, risk: 'low' },
            { id: 'lend-uni', name: 'Lend UNI', token: 'UNI', icon: '🦄', supplyApy: 2.2, borrowApy: 3.8, utilization: 42, totalSupply: 145000000, totalBorrow: 60900000, collateralFactor: 0.70, liquidationThreshold: 0.75, risk: 'medium' },
            { id: 'lend-aave', name: 'Lend AAVE', token: 'AAVE', icon: '👻', supplyApy: 1.8, borrowApy: 3.2, utilization: 38, totalSupply: 220000000, totalBorrow: 83600000, collateralFactor: 0.68, liquidationThreshold: 0.73, risk: 'medium' },
            { id: 'lend-arb', name: 'Lend ARB', token: 'ARB', icon: '🔵', supplyApy: 5.5, borrowApy: 8.2, utilization: 65, totalSupply: 150000000, totalBorrow: 97500000, collateralFactor: 0.65, liquidationThreshold: 0.70, risk: 'medium' },
            { id: 'lend-op', name: 'Lend OP', token: 'OP', icon: '🔴', supplyApy: 4.8, borrowApy: 7.5, utilization: 60, totalSupply: 125000000, totalBorrow: 75000000, collateralFactor: 0.65, liquidationThreshold: 0.70, risk: 'medium' },
            { id: 'lend-frax', name: 'Lend FRAX', token: 'FRAX', icon: 'F', supplyApy: 6.5, borrowApy: 8.0, utilization: 75, totalSupply: 450000000, totalBorrow: 337500000, collateralFactor: 0.80, liquidationThreshold: 0.85, risk: 'low' },
            { id: 'lend-sui', name: 'Lend SUI', token: 'SUI', icon: '💧', supplyApy: 8.5, borrowApy: 12.0, utilization: 70, totalSupply: 95000000, totalBorrow: 66500000, collateralFactor: 0.60, liquidationThreshold: 0.65, risk: 'medium-high' },
            { id: 'lend-apt', name: 'Lend APT', token: 'APT', icon: '🔷', supplyApy: 6.2, borrowApy: 9.5, utilization: 58, totalSupply: 120000000, totalBorrow: 69600000, collateralFactor: 0.62, liquidationThreshold: 0.68, risk: 'medium' },
            // === LENDING BATCH 2 ===
            { id: 'lend-sei', name: 'Lend SEI', token: 'SEI', icon: '🌊', supplyApy: 7.5, borrowApy: 11.0, utilization: 62, totalSupply: 85000000, totalBorrow: 52700000, collateralFactor: 0.58, liquidationThreshold: 0.65, risk: 'medium-high' },
            { id: 'lend-inj', name: 'Lend INJ', token: 'INJ', icon: '💉', supplyApy: 6.0, borrowApy: 9.0, utilization: 55, totalSupply: 95000000, totalBorrow: 52250000, collateralFactor: 0.60, liquidationThreshold: 0.68, risk: 'medium' },
            { id: 'lend-tia', name: 'Lend TIA', token: 'TIA', icon: '✨', supplyApy: 9.0, borrowApy: 13.5, utilization: 68, totalSupply: 65000000, totalBorrow: 44200000, collateralFactor: 0.55, liquidationThreshold: 0.62, risk: 'medium-high' },
            { id: 'lend-atom', name: 'Lend ATOM', token: 'ATOM', icon: '⚛', supplyApy: 5.0, borrowApy: 7.5, utilization: 52, totalSupply: 180000000, totalBorrow: 93600000, collateralFactor: 0.65, liquidationThreshold: 0.72, risk: 'medium' },
            { id: 'lend-dot', name: 'Lend DOT', token: 'DOT', icon: '●', supplyApy: 4.5, borrowApy: 7.0, utilization: 48, totalSupply: 145000000, totalBorrow: 69600000, collateralFactor: 0.62, liquidationThreshold: 0.70, risk: 'medium' },
            { id: 'lend-steth', name: 'Lend stETH', token: 'stETH', icon: '⟠', supplyApy: 2.8, borrowApy: 4.2, utilization: 42, totalSupply: 850000000, totalBorrow: 357000000, collateralFactor: 0.78, liquidationThreshold: 0.83, risk: 'low' },
            { id: 'lend-reth', name: 'Lend rETH', token: 'rETH', icon: '🚀', supplyApy: 2.5, borrowApy: 3.8, utilization: 38, totalSupply: 420000000, totalBorrow: 159600000, collateralFactor: 0.75, liquidationThreshold: 0.80, risk: 'low' },
            { id: 'lend-cbeth', name: 'Lend cbETH', token: 'cbETH', icon: '🔷', supplyApy: 2.2, borrowApy: 3.5, utilization: 35, totalSupply: 380000000, totalBorrow: 133000000, collateralFactor: 0.75, liquidationThreshold: 0.80, risk: 'low' },
            { id: 'lend-mkr', name: 'Lend MKR', token: 'MKR', icon: 'Ⓜ️', supplyApy: 1.5, borrowApy: 3.0, utilization: 32, totalSupply: 95000000, totalBorrow: 30400000, collateralFactor: 0.60, liquidationThreshold: 0.68, risk: 'medium' },
            { id: 'lend-crv', name: 'Lend CRV', token: 'CRV', icon: '🔴', supplyApy: 3.8, borrowApy: 6.5, utilization: 55, totalSupply: 125000000, totalBorrow: 68750000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-ldo', name: 'Lend LDO', token: 'LDO', icon: '🔵', supplyApy: 2.8, borrowApy: 5.0, utilization: 45, totalSupply: 145000000, totalBorrow: 65250000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'medium' },
            { id: 'lend-snx', name: 'Lend SNX', token: 'SNX', icon: '⚡', supplyApy: 4.2, borrowApy: 7.2, utilization: 52, totalSupply: 85000000, totalBorrow: 44200000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-gmx', name: 'Lend GMX', token: 'GMX', icon: '🔷', supplyApy: 3.5, borrowApy: 6.0, utilization: 48, totalSupply: 65000000, totalBorrow: 31200000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'medium' },
            { id: 'lend-near', name: 'Lend NEAR', token: 'NEAR', icon: 'N', supplyApy: 5.5, borrowApy: 8.5, utilization: 58, totalSupply: 95000000, totalBorrow: 55100000, collateralFactor: 0.60, liquidationThreshold: 0.70, risk: 'medium' },
            { id: 'lend-ftm', name: 'Lend FTM', token: 'FTM', icon: '👻', supplyApy: 6.0, borrowApy: 9.5, utilization: 62, totalSupply: 75000000, totalBorrow: 46500000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium-high' },
            { id: 'lend-usde', name: 'Lend USDe', token: 'USDe', icon: 'E', supplyApy: 12.0, borrowApy: 15.0, utilization: 78, totalSupply: 450000000, totalBorrow: 351000000, collateralFactor: 0.75, liquidationThreshold: 0.82, risk: 'low-medium' },
            { id: 'lend-gho', name: 'Lend GHO', token: 'GHO', icon: '👻', supplyApy: 5.5, borrowApy: 3.5, utilization: 65, totalSupply: 280000000, totalBorrow: 182000000, collateralFactor: 0.0, liquidationThreshold: 0.0, risk: 'low' },
            { id: 'lend-crvusd', name: 'Lend crvUSD', token: 'crvUSD', icon: '🔴', supplyApy: 6.0, borrowApy: 4.5, utilization: 72, totalSupply: 350000000, totalBorrow: 252000000, collateralFactor: 0.0, liquidationThreshold: 0.0, risk: 'low' },
            // === LENDING BATCH 3 ===
            { id: 'lend-pendle', name: 'Lend PENDLE', token: 'PENDLE', icon: '📈', supplyApy: 4.5, borrowApy: 7.5, utilization: 55, totalSupply: 75000000, totalBorrow: 41250000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-dydx', name: 'Lend dYdX', token: 'DYDX', icon: '📊', supplyApy: 3.8, borrowApy: 6.2, utilization: 48, totalSupply: 85000000, totalBorrow: 40800000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'medium' },
            { id: 'lend-jup', name: 'Lend JUP', token: 'JUP', icon: '🪐', supplyApy: 5.5, borrowApy: 9.0, utilization: 58, totalSupply: 65000000, totalBorrow: 37700000, collateralFactor: 0.55, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-pyth', name: 'Lend PYTH', token: 'PYTH', icon: '🐍', supplyApy: 4.2, borrowApy: 7.0, utilization: 52, totalSupply: 55000000, totalBorrow: 28600000, collateralFactor: 0.52, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-strk', name: 'Lend STRK', token: 'STRK', icon: '⚡', supplyApy: 8.0, borrowApy: 12.5, utilization: 65, totalSupply: 45000000, totalBorrow: 29250000, collateralFactor: 0.50, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-arb', name: 'Lend ARB', token: 'ARB', icon: '🔵', supplyApy: 5.5, borrowApy: 8.2, utilization: 62, totalSupply: 145000000, totalBorrow: 89900000, collateralFactor: 0.62, liquidationThreshold: 0.70, risk: 'medium' },
            { id: 'lend-blur', name: 'Lend BLUR', token: 'BLUR', icon: '🎨', supplyApy: 6.5, borrowApy: 10.0, utilization: 55, totalSupply: 35000000, totalBorrow: 19250000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-ape', name: 'Lend APE', token: 'APE', icon: '🦍', supplyApy: 3.5, borrowApy: 6.5, utilization: 42, totalSupply: 65000000, totalBorrow: 27300000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-wld', name: 'Lend WLD', token: 'WLD', icon: '🌐', supplyApy: 7.5, borrowApy: 11.5, utilization: 60, totalSupply: 42000000, totalBorrow: 25200000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-ena', name: 'Lend ENA', token: 'ENA', icon: 'E', supplyApy: 8.5, borrowApy: 13.0, utilization: 68, totalSupply: 55000000, totalBorrow: 37400000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium-high' },
            { id: 'lend-ethfi', name: 'Lend ETHFI', token: 'ETHFI', icon: '🔷', supplyApy: 6.0, borrowApy: 9.5, utilization: 58, totalSupply: 48000000, totalBorrow: 27840000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-ton', name: 'Lend TON', token: 'TON', icon: '💎', supplyApy: 4.0, borrowApy: 6.5, utilization: 52, totalSupply: 125000000, totalBorrow: 65000000, collateralFactor: 0.60, liquidationThreshold: 0.70, risk: 'medium' },
            { id: 'lend-kas', name: 'Lend KAS', token: 'KAS', icon: '⛏️', supplyApy: 5.0, borrowApy: 8.0, utilization: 55, totalSupply: 35000000, totalBorrow: 19250000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-rndr', name: 'Lend RNDR', token: 'RNDR', icon: '🎨', supplyApy: 3.2, borrowApy: 5.5, utilization: 45, totalSupply: 85000000, totalBorrow: 38250000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-fet', name: 'Lend FET', token: 'FET', icon: '🤖', supplyApy: 4.0, borrowApy: 7.0, utilization: 52, totalSupply: 65000000, totalBorrow: 33800000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-grt', name: 'Lend GRT', token: 'GRT', icon: '📊', supplyApy: 2.8, borrowApy: 5.0, utilization: 42, totalSupply: 95000000, totalBorrow: 39900000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'low-medium' },
            { id: 'lend-ens', name: 'Lend ENS', token: 'ENS', icon: '🔤', supplyApy: 2.5, borrowApy: 4.5, utilization: 38, totalSupply: 55000000, totalBorrow: 20900000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'low-medium' },
            { id: 'lend-fil', name: 'Lend FIL', token: 'FIL', icon: '📁', supplyApy: 4.5, borrowApy: 7.5, utilization: 55, totalSupply: 125000000, totalBorrow: 68750000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            // === LENDING BATCH 4 - MEGA ===
            { id: 'lend-mode', name: 'Lend MODE', token: 'MODE', icon: '🟢', supplyApy: 12.0, borrowApy: 18.0, utilization: 72, totalSupply: 25000000, totalBorrow: 18000000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'high' },
            { id: 'lend-blast', name: 'Lend BLAST', token: 'BLAST', icon: '💥', supplyApy: 15.0, borrowApy: 22.0, utilization: 75, totalSupply: 35000000, totalBorrow: 26250000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'high' },
            { id: 'lend-scroll', name: 'Lend SCROLL', token: 'SCROLL', icon: '📜', supplyApy: 10.0, borrowApy: 15.0, utilization: 68, totalSupply: 28000000, totalBorrow: 19040000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-taiko', name: 'Lend TAIKO', token: 'TAIKO', icon: '🥁', supplyApy: 14.0, borrowApy: 20.0, utilization: 70, totalSupply: 18000000, totalBorrow: 12600000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'high' },
            { id: 'lend-zeta', name: 'Lend ZETA', token: 'ZETA', icon: 'Ζ', supplyApy: 11.0, borrowApy: 16.0, utilization: 65, totalSupply: 22000000, totalBorrow: 14300000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-rez', name: 'Lend REZ', token: 'REZ', icon: '♦️', supplyApy: 18.0, borrowApy: 28.0, utilization: 78, totalSupply: 15000000, totalBorrow: 11700000, collateralFactor: 0.38, liquidationThreshold: 0.48, risk: 'high' },
            { id: 'lend-puffer', name: 'Lend PUFFER', token: 'PUFFER', icon: '🐡', supplyApy: 8.0, borrowApy: 12.0, utilization: 60, totalSupply: 45000000, totalBorrow: 27000000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-omni', name: 'Lend OMNI', token: 'OMNI', icon: '🌐', supplyApy: 9.0, borrowApy: 14.0, utilization: 62, totalSupply: 32000000, totalBorrow: 19840000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-saga', name: 'Lend SAGA', token: 'SAGA', icon: '📖', supplyApy: 10.0, borrowApy: 15.0, utilization: 58, totalSupply: 20000000, totalBorrow: 11600000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-tnsr', name: 'Lend TNSR', token: 'TNSR', icon: '🧊', supplyApy: 12.0, borrowApy: 18.0, utilization: 65, totalSupply: 18000000, totalBorrow: 11700000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'high' },
            { id: 'lend-hnt', name: 'Lend HNT', token: 'HNT', icon: '📡', supplyApy: 6.0, borrowApy: 9.5, utilization: 52, totalSupply: 55000000, totalBorrow: 28600000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-akt', name: 'Lend AKT', token: 'AKT', icon: '☁️', supplyApy: 8.0, borrowApy: 12.5, utilization: 58, totalSupply: 38000000, totalBorrow: 22040000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-rune', name: 'Lend RUNE', token: 'RUNE', icon: '⚡', supplyApy: 5.5, borrowApy: 8.5, utilization: 48, totalSupply: 85000000, totalBorrow: 40800000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-kuji', name: 'Lend KUJI', token: 'KUJI', icon: '🐋', supplyApy: 7.0, borrowApy: 11.0, utilization: 55, totalSupply: 28000000, totalBorrow: 15400000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-ntrn', name: 'Lend NTRN', token: 'NTRN', icon: '⚛️', supplyApy: 9.5, borrowApy: 14.5, utilization: 62, totalSupply: 32000000, totalBorrow: 19840000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-strd', name: 'Lend STRD', token: 'STRD', icon: '🚶', supplyApy: 8.5, borrowApy: 13.0, utilization: 58, totalSupply: 25000000, totalBorrow: 14500000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-astro', name: 'Lend ASTRO', token: 'ASTRO', icon: '🚀', supplyApy: 7.5, borrowApy: 11.5, utilization: 55, totalSupply: 35000000, totalBorrow: 19250000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-whale', name: 'Lend WHALE', token: 'WHALE', icon: '🐳', supplyApy: 6.5, borrowApy: 10.0, utilization: 52, totalSupply: 22000000, totalBorrow: 11440000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-orca', name: 'Lend ORCA', token: 'ORCA', icon: '🐋', supplyApy: 4.5, borrowApy: 7.5, utilization: 48, totalSupply: 45000000, totalBorrow: 21600000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'low-medium' },
            { id: 'lend-ray', name: 'Lend RAY', token: 'RAY', icon: '☀️', supplyApy: 5.0, borrowApy: 8.0, utilization: 50, totalSupply: 58000000, totalBorrow: 29000000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-mngo', name: 'Lend MNGO', token: 'MNGO', icon: '🥭', supplyApy: 8.0, borrowApy: 12.5, utilization: 58, totalSupply: 18000000, totalBorrow: 10440000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-degen', name: 'Lend DEGEN', token: 'DEGEN', icon: '🎩', supplyApy: 25.0, borrowApy: 40.0, utilization: 80, totalSupply: 12000000, totalBorrow: 9600000, collateralFactor: 0.35, liquidationThreshold: 0.45, risk: 'high' },
            { id: 'lend-brett', name: 'Lend BRETT', token: 'BRETT', icon: '🔵', supplyApy: 20.0, borrowApy: 32.0, utilization: 75, totalSupply: 15000000, totalBorrow: 11250000, collateralFactor: 0.38, liquidationThreshold: 0.48, risk: 'high' },
            { id: 'lend-wif', name: 'Lend WIF', token: 'WIF', icon: '🐕', supplyApy: 22.0, borrowApy: 35.0, utilization: 78, totalSupply: 25000000, totalBorrow: 19500000, collateralFactor: 0.35, liquidationThreshold: 0.45, risk: 'high' },
            { id: 'lend-bonk', name: 'Lend BONK', token: 'BONK', icon: '🦴', supplyApy: 18.0, borrowApy: 28.0, utilization: 72, totalSupply: 28000000, totalBorrow: 20160000, collateralFactor: 0.38, liquidationThreshold: 0.48, risk: 'high' },
            { id: 'lend-pepe', name: 'Lend PEPE', token: 'PEPE', icon: '🐸', supplyApy: 15.0, borrowApy: 24.0, utilization: 70, totalSupply: 35000000, totalBorrow: 24500000, collateralFactor: 0.40, liquidationThreshold: 0.50, risk: 'high' },
            { id: 'lend-shib', name: 'Lend SHIB', token: 'SHIB', icon: '🐕', supplyApy: 8.0, borrowApy: 12.0, utilization: 55, totalSupply: 85000000, totalBorrow: 46750000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-floki', name: 'Lend FLOKI', token: 'FLOKI', icon: '⚔️', supplyApy: 12.0, borrowApy: 18.0, utilization: 62, totalSupply: 22000000, totalBorrow: 13640000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'high' },
            { id: 'lend-ar', name: 'Lend AR', token: 'AR', icon: '📦', supplyApy: 4.0, borrowApy: 6.5, utilization: 45, totalSupply: 65000000, totalBorrow: 29250000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-theta', name: 'Lend THETA', token: 'THETA', icon: 'θ', supplyApy: 3.5, borrowApy: 5.8, utilization: 42, totalSupply: 75000000, totalBorrow: 31500000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'low-medium' },
            { id: 'lend-axs', name: 'Lend AXS', token: 'AXS', icon: '⚔️', supplyApy: 4.5, borrowApy: 7.2, utilization: 48, totalSupply: 45000000, totalBorrow: 21600000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-sand', name: 'Lend SAND', token: 'SAND', icon: '🏖️', supplyApy: 5.0, borrowApy: 8.0, utilization: 50, totalSupply: 55000000, totalBorrow: 27500000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-mana', name: 'Lend MANA', token: 'MANA', icon: '🌐', supplyApy: 4.2, borrowApy: 6.8, utilization: 46, totalSupply: 48000000, totalBorrow: 22080000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-ape', name: 'Lend APE', token: 'APE', icon: '🦍', supplyApy: 5.5, borrowApy: 8.5, utilization: 52, totalSupply: 65000000, totalBorrow: 33800000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-imx', name: 'Lend IMX', token: 'IMX', icon: 'X', supplyApy: 6.0, borrowApy: 9.5, utilization: 55, totalSupply: 42000000, totalBorrow: 23100000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            // === LENDING BATCH 5 - ULTRA ===
            { id: 'lend-zro', name: 'Lend ZRO', token: 'ZRO', icon: '0️⃣', supplyApy: 8.5, borrowApy: 13.0, utilization: 62, totalSupply: 45000000, totalBorrow: 27900000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-arkm', name: 'Lend ARKM', token: 'ARKM', icon: '🔍', supplyApy: 9.0, borrowApy: 14.0, utilization: 65, totalSupply: 28000000, totalBorrow: 18200000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-cyber', name: 'Lend CYBER', token: 'CYBER', icon: '🌐', supplyApy: 7.5, borrowApy: 11.5, utilization: 58, totalSupply: 32000000, totalBorrow: 18560000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-rdnt', name: 'Lend RDNT', token: 'RDNT', icon: '✨', supplyApy: 12.0, borrowApy: 18.0, utilization: 70, totalSupply: 55000000, totalBorrow: 38500000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-magic', name: 'Lend MAGIC', token: 'MAGIC', icon: '🪄', supplyApy: 6.5, borrowApy: 10.0, utilization: 55, totalSupply: 42000000, totalBorrow: 23100000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-ldo', name: 'Lend LDO', token: 'LDO', icon: '🔷', supplyApy: 4.0, borrowApy: 6.5, utilization: 48, totalSupply: 95000000, totalBorrow: 45600000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'low-medium' },
            { id: 'lend-rpl', name: 'Lend RPL', token: 'RPL', icon: '🚀', supplyApy: 3.5, borrowApy: 5.8, utilization: 45, totalSupply: 75000000, totalBorrow: 33750000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'low-medium' },
            { id: 'lend-ssv', name: 'Lend SSV', token: 'SSV', icon: '🔐', supplyApy: 5.0, borrowApy: 8.0, utilization: 52, totalSupply: 38000000, totalBorrow: 19760000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-cbeth', name: 'Lend cbETH', token: 'cbETH', icon: '🔵', supplyApy: 2.5, borrowApy: 4.2, utilization: 40, totalSupply: 180000000, totalBorrow: 72000000, collateralFactor: 0.78, liquidationThreshold: 0.83, risk: 'low' },
            { id: 'lend-sweth', name: 'Lend swETH', token: 'swETH', icon: '💧', supplyApy: 2.8, borrowApy: 4.5, utilization: 42, totalSupply: 145000000, totalBorrow: 60900000, collateralFactor: 0.75, liquidationThreshold: 0.80, risk: 'low' },
            { id: 'lend-oeth', name: 'Lend OETH', token: 'OETH', icon: '⭕', supplyApy: 3.0, borrowApy: 4.8, utilization: 44, totalSupply: 120000000, totalBorrow: 52800000, collateralFactor: 0.72, liquidationThreshold: 0.78, risk: 'low' },
            { id: 'lend-xai', name: 'Lend XAI', token: 'XAI', icon: '🎮', supplyApy: 10.0, borrowApy: 15.0, utilization: 68, totalSupply: 22000000, totalBorrow: 14960000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-prime', name: 'Lend PRIME', token: 'PRIME', icon: '👾', supplyApy: 8.0, borrowApy: 12.5, utilization: 60, totalSupply: 35000000, totalBorrow: 21000000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-gala', name: 'Lend GALA', token: 'GALA', icon: '🎲', supplyApy: 7.0, borrowApy: 11.0, utilization: 58, totalSupply: 48000000, totalBorrow: 27840000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-ilv', name: 'Lend ILV', token: 'ILV', icon: '🏰', supplyApy: 5.5, borrowApy: 8.5, utilization: 52, totalSupply: 32000000, totalBorrow: 16640000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-beam', name: 'Lend BEAM', token: 'BEAM', icon: '🔦', supplyApy: 9.0, borrowApy: 14.0, utilization: 65, totalSupply: 28000000, totalBorrow: 18200000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-pixel', name: 'Lend PIXEL', token: 'PIXEL', icon: '🎨', supplyApy: 12.0, borrowApy: 18.0, utilization: 70, totalSupply: 18000000, totalBorrow: 12600000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'high' },
            { id: 'lend-woo', name: 'Lend WOO', token: 'WOO', icon: '🦉', supplyApy: 5.0, borrowApy: 8.0, utilization: 50, totalSupply: 65000000, totalBorrow: 32500000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-sushi', name: 'Lend SUSHI', token: 'SUSHI', icon: '🍣', supplyApy: 4.5, borrowApy: 7.2, utilization: 48, totalSupply: 58000000, totalBorrow: 27840000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'low-medium' },
            { id: 'lend-bal', name: 'Lend BAL', token: 'BAL', icon: '⚖️', supplyApy: 3.8, borrowApy: 6.2, utilization: 45, totalSupply: 72000000, totalBorrow: 32400000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'low-medium' },
            { id: 'lend-1inch', name: 'Lend 1INCH', token: '1INCH', icon: '🦄', supplyApy: 4.2, borrowApy: 6.8, utilization: 46, totalSupply: 55000000, totalBorrow: 25300000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'low-medium' },
            { id: 'lend-snx', name: 'Lend SNX', token: 'SNX', icon: '💫', supplyApy: 5.5, borrowApy: 8.5, utilization: 52, totalSupply: 85000000, totalBorrow: 44200000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-perp', name: 'Lend PERP', token: 'PERP', icon: '📊', supplyApy: 6.0, borrowApy: 9.5, utilization: 55, totalSupply: 42000000, totalBorrow: 23100000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-mux', name: 'Lend MUX', token: 'MUX', icon: '🔀', supplyApy: 8.5, borrowApy: 13.0, utilization: 62, totalSupply: 25000000, totalBorrow: 15500000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-gns', name: 'Lend GNS', token: 'GNS', icon: '📈', supplyApy: 7.0, borrowApy: 11.0, utilization: 58, totalSupply: 38000000, totalBorrow: 22040000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-blur', name: 'Lend BLUR', token: 'BLUR', icon: '🖼️', supplyApy: 10.0, borrowApy: 15.0, utilization: 65, totalSupply: 35000000, totalBorrow: 22750000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-looks', name: 'Lend LOOKS', token: 'LOOKS', icon: '👀', supplyApy: 8.0, borrowApy: 12.5, utilization: 60, totalSupply: 28000000, totalBorrow: 16800000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-ondo', name: 'Lend ONDO', token: 'ONDO', icon: '🏛️', supplyApy: 4.0, borrowApy: 6.5, utilization: 45, totalSupply: 85000000, totalBorrow: 38250000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'low-medium' },
            { id: 'lend-eigen', name: 'Lend EIGEN', token: 'EIGEN', icon: '🔷', supplyApy: 6.5, borrowApy: 10.0, utilization: 55, totalSupply: 120000000, totalBorrow: 66000000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-pyth', name: 'Lend PYTH', token: 'PYTH', icon: '🐍', supplyApy: 7.0, borrowApy: 11.0, utilization: 58, totalSupply: 75000000, totalBorrow: 43500000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-w', name: 'Lend W', token: 'W', icon: '🌉', supplyApy: 9.5, borrowApy: 14.5, utilization: 65, totalSupply: 45000000, totalBorrow: 29250000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-alt', name: 'Lend ALT', token: 'ALT', icon: '⚡', supplyApy: 11.0, borrowApy: 17.0, utilization: 68, totalSupply: 32000000, totalBorrow: 21760000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-manta', name: 'Lend MANTA', token: 'MANTA', icon: '🐙', supplyApy: 8.0, borrowApy: 12.5, utilization: 60, totalSupply: 55000000, totalBorrow: 33000000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-metis', name: 'Lend METIS', token: 'METIS', icon: '🟩', supplyApy: 5.5, borrowApy: 8.5, utilization: 52, totalSupply: 48000000, totalBorrow: 24960000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-zk', name: 'Lend ZK', token: 'ZK', icon: '🔒', supplyApy: 10.0, borrowApy: 15.0, utilization: 65, totalSupply: 42000000, totalBorrow: 27300000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            // === LENDING BATCH 6 - ZETTA EXPANSION ===
            { id: 'lend-ftm', name: 'Lend FTM', token: 'FTM', icon: '👻', supplyApy: 5.5, borrowApy: 8.5, utilization: 52, totalSupply: 85000000, totalBorrow: 44200000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-eos', name: 'Lend EOS', token: 'EOS', icon: '🔷', supplyApy: 4.0, borrowApy: 6.5, utilization: 48, totalSupply: 55000000, totalBorrow: 26400000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'low-medium' },
            { id: 'lend-xlm', name: 'Lend XLM', token: 'XLM', icon: '✨', supplyApy: 3.5, borrowApy: 5.8, utilization: 45, totalSupply: 65000000, totalBorrow: 29250000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'low-medium' },
            { id: 'lend-trx', name: 'Lend TRX', token: 'TRX', icon: '🔺', supplyApy: 4.5, borrowApy: 7.2, utilization: 50, totalSupply: 125000000, totalBorrow: 62500000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'low-medium' },
            { id: 'lend-waves', name: 'Lend WAVES', token: 'WAVES', icon: '🌊', supplyApy: 7.0, borrowApy: 11.0, utilization: 58, totalSupply: 28000000, totalBorrow: 16240000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-ont', name: 'Lend ONT', token: 'ONT', icon: '🔵', supplyApy: 5.0, borrowApy: 8.0, utilization: 52, totalSupply: 22000000, totalBorrow: 11440000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-icx', name: 'Lend ICX', token: 'ICX', icon: '⬡', supplyApy: 6.0, borrowApy: 9.5, utilization: 55, totalSupply: 18000000, totalBorrow: 9900000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-lsk', name: 'Lend LSK', token: 'LSK', icon: '💎', supplyApy: 5.5, borrowApy: 8.5, utilization: 52, totalSupply: 15000000, totalBorrow: 7800000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-xno', name: 'Lend XNO', token: 'XNO', icon: '💵', supplyApy: 8.0, borrowApy: 12.5, utilization: 60, totalSupply: 12000000, totalBorrow: 7200000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-iost', name: 'Lend IOST', token: 'IOST', icon: '🔶', supplyApy: 9.0, borrowApy: 14.0, utilization: 65, totalSupply: 18000000, totalBorrow: 11700000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-waxp', name: 'Lend WAXP', token: 'WAXP', icon: '🟠', supplyApy: 6.5, borrowApy: 10.0, utilization: 55, totalSupply: 22000000, totalBorrow: 12100000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-flux', name: 'Lend FLUX', token: 'FLUX', icon: '⚡', supplyApy: 8.5, borrowApy: 13.0, utilization: 62, totalSupply: 28000000, totalBorrow: 17360000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-sys', name: 'Lend SYS', token: 'SYS', icon: '🔷', supplyApy: 7.0, borrowApy: 11.0, utilization: 58, totalSupply: 18000000, totalBorrow: 10440000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-kmd', name: 'Lend KMD', token: 'KMD', icon: '🐉', supplyApy: 6.0, borrowApy: 9.5, utilization: 55, totalSupply: 12000000, totalBorrow: 6600000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-dcr', name: 'Lend DCR', token: 'DCR', icon: '🔵', supplyApy: 4.5, borrowApy: 7.2, utilization: 48, totalSupply: 15000000, totalBorrow: 7200000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'low-medium' },
            { id: 'lend-dgb', name: 'Lend DGB', token: 'DGB', icon: '💙', supplyApy: 7.5, borrowApy: 11.5, utilization: 58, totalSupply: 8000000, totalBorrow: 4640000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-rvn', name: 'Lend RVN', token: 'RVN', icon: '🐦', supplyApy: 9.0, borrowApy: 14.0, utilization: 62, totalSupply: 10000000, totalBorrow: 6200000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-stx', name: 'Lend STX', token: 'STX', icon: '📦', supplyApy: 5.5, borrowApy: 8.5, utilization: 52, totalSupply: 65000000, totalBorrow: 33800000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-ordi', name: 'Lend ORDI', token: 'ORDI', icon: '🟡', supplyApy: 12.0, borrowApy: 18.0, utilization: 70, totalSupply: 85000000, totalBorrow: 59500000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'high' },
            { id: 'lend-rats', name: 'Lend RATS', token: 'RATS', icon: '🐀', supplyApy: 15.0, borrowApy: 22.0, utilization: 72, totalSupply: 45000000, totalBorrow: 32400000, collateralFactor: 0.40, liquidationThreshold: 0.50, risk: 'high' },
            { id: 'lend-sats', name: 'Lend SATS', token: 'SATS', icon: '⚡', supplyApy: 14.0, borrowApy: 20.0, utilization: 70, totalSupply: 55000000, totalBorrow: 38500000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'high' },
            { id: 'lend-turbo', name: 'Lend TURBO', token: 'TURBO', icon: '🐸', supplyApy: 18.0, borrowApy: 25.0, utilization: 75, totalSupply: 32000000, totalBorrow: 24000000, collateralFactor: 0.38, liquidationThreshold: 0.48, risk: 'high' },
            { id: 'lend-people', name: 'Lend PEOPLE', token: 'PEOPLE', icon: '👥', supplyApy: 10.0, borrowApy: 15.0, utilization: 65, totalSupply: 42000000, totalBorrow: 27300000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-jasmy', name: 'Lend JASMY', token: 'JASMY', icon: '📱', supplyApy: 9.0, borrowApy: 14.0, utilization: 62, totalSupply: 35000000, totalBorrow: 21700000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-loom', name: 'Lend LOOM', token: 'LOOM', icon: '🔗', supplyApy: 7.0, borrowApy: 11.0, utilization: 58, totalSupply: 12000000, totalBorrow: 6960000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-ankr', name: 'Lend ANKR', token: 'ANKR', icon: '⚓', supplyApy: 5.0, borrowApy: 8.0, utilization: 52, totalSupply: 28000000, totalBorrow: 14560000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-sxp', name: 'Lend SXP', token: 'SXP', icon: '💳', supplyApy: 6.0, borrowApy: 9.5, utilization: 55, totalSupply: 22000000, totalBorrow: 12100000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-chr', name: 'Lend CHR', token: 'CHR', icon: '🎮', supplyApy: 8.5, borrowApy: 13.0, utilization: 62, totalSupply: 18000000, totalBorrow: 11160000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-pundix', name: 'Lend PUNDIX', token: 'PUNDIX', icon: '💰', supplyApy: 7.5, borrowApy: 11.5, utilization: 58, totalSupply: 15000000, totalBorrow: 8700000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-spell', name: 'Lend SPELL', token: 'SPELL', icon: '🪄', supplyApy: 11.0, borrowApy: 17.0, utilization: 68, totalSupply: 35000000, totalBorrow: 23800000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-joe', name: 'Lend JOE', token: 'JOE', icon: '🔴', supplyApy: 9.5, borrowApy: 14.5, utilization: 65, totalSupply: 42000000, totalBorrow: 27300000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-quick', name: 'Lend QUICK', token: 'QUICK', icon: '⚡', supplyApy: 8.0, borrowApy: 12.5, utilization: 60, totalSupply: 28000000, totalBorrow: 16800000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-cream', name: 'Lend CREAM', token: 'CREAM', icon: '🍦', supplyApy: 6.5, borrowApy: 10.0, utilization: 55, totalSupply: 18000000, totalBorrow: 9900000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-mbox', name: 'Lend MBOX', token: 'MBOX', icon: '📦', supplyApy: 10.0, borrowApy: 15.0, utilization: 65, totalSupply: 22000000, totalBorrow: 14300000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            // === LENDING BATCH 7 - RONNA EXPANSION ===
            // Meme Coin Lending
            { id: 'lend-floki', name: 'Lend FLOKI', token: 'FLOKI', icon: '🐕', supplyApy: 18.0, borrowApy: 28.0, utilization: 72, totalSupply: 85000000, totalBorrow: 61200000, collateralFactor: 0.35, liquidationThreshold: 0.45, risk: 'high' },
            { id: 'lend-bonk', name: 'Lend BONK', token: 'BONK', icon: '🐕', supplyApy: 22.0, borrowApy: 35.0, utilization: 75, totalSupply: 125000000, totalBorrow: 93750000, collateralFactor: 0.30, liquidationThreshold: 0.40, risk: 'high' },
            { id: 'lend-wif', name: 'Lend WIF', token: 'WIF', icon: '🐕', supplyApy: 25.0, borrowApy: 40.0, utilization: 78, totalSupply: 95000000, totalBorrow: 74100000, collateralFactor: 0.28, liquidationThreshold: 0.38, risk: 'high' },
            { id: 'lend-pepe', name: 'Lend PEPE', token: 'PEPE', icon: '🐸', supplyApy: 15.0, borrowApy: 25.0, utilization: 70, totalSupply: 150000000, totalBorrow: 105000000, collateralFactor: 0.35, liquidationThreshold: 0.45, risk: 'high' },
            { id: 'lend-shib', name: 'Lend SHIB', token: 'SHIB', icon: '🐕', supplyApy: 10.0, borrowApy: 18.0, utilization: 65, totalSupply: 220000000, totalBorrow: 143000000, collateralFactor: 0.40, liquidationThreshold: 0.50, risk: 'medium-high' },
            { id: 'lend-doge', name: 'Lend DOGE', token: 'DOGE', icon: '🐕', supplyApy: 6.0, borrowApy: 11.0, utilization: 58, totalSupply: 350000000, totalBorrow: 203000000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            // Perp DEX Token Lending
            { id: 'lend-pendle', name: 'Lend PENDLE', token: 'PENDLE', icon: '📊', supplyApy: 8.5, borrowApy: 14.0, utilization: 62, totalSupply: 95000000, totalBorrow: 58900000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-velo', name: 'Lend VELO', token: 'VELO', icon: '🚴', supplyApy: 12.0, borrowApy: 19.0, utilization: 68, totalSupply: 145000000, totalBorrow: 98600000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-aero', name: 'Lend AERO', token: 'AERO', icon: '✈️', supplyApy: 14.0, borrowApy: 22.0, utilization: 70, totalSupply: 115000000, totalBorrow: 80500000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-grail', name: 'Lend GRAIL', token: 'GRAIL', icon: '🏆', supplyApy: 10.0, borrowApy: 16.0, utilization: 65, totalSupply: 45000000, totalBorrow: 29250000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium-high' },
            { id: 'lend-thales', name: 'Lend THALES', token: 'THALES', icon: '🎯', supplyApy: 11.0, borrowApy: 17.5, utilization: 66, totalSupply: 25000000, totalBorrow: 16500000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-lyra', name: 'Lend LYRA', token: 'LYRA', icon: '🎵', supplyApy: 9.5, borrowApy: 15.0, utilization: 63, totalSupply: 32000000, totalBorrow: 20160000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium-high' },
            { id: 'lend-kwenta', name: 'Lend KWENTA', token: 'KWENTA', icon: '📈', supplyApy: 12.5, borrowApy: 20.0, utilization: 68, totalSupply: 38000000, totalBorrow: 25840000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-drift', name: 'Lend DRIFT', token: 'DRIFT', icon: '🌊', supplyApy: 13.0, borrowApy: 21.0, utilization: 70, totalSupply: 35000000, totalBorrow: 24500000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            // Solana DeFi Token Lending
            { id: 'lend-jup', name: 'Lend JUP', token: 'JUP', icon: '🪐', supplyApy: 7.5, borrowApy: 12.5, utilization: 60, totalSupply: 185000000, totalBorrow: 111000000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-ray', name: 'Lend RAY', token: 'RAY', icon: '☀️', supplyApy: 8.0, borrowApy: 13.0, utilization: 62, totalSupply: 95000000, totalBorrow: 58900000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-orca', name: 'Lend ORCA', token: 'ORCA', icon: '🐋', supplyApy: 9.0, borrowApy: 14.5, utilization: 64, totalSupply: 75000000, totalBorrow: 48000000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-mnde', name: 'Lend MNDE', token: 'MNDE', icon: '🔮', supplyApy: 11.0, borrowApy: 17.5, utilization: 66, totalSupply: 45000000, totalBorrow: 29700000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-jto', name: 'Lend JTO', token: 'JTO', icon: '🎯', supplyApy: 8.5, borrowApy: 14.0, utilization: 62, totalSupply: 125000000, totalBorrow: 77500000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-tnsr', name: 'Lend TNSR', token: 'TNSR', icon: '🎨', supplyApy: 12.0, borrowApy: 19.0, utilization: 68, totalSupply: 55000000, totalBorrow: 37400000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-io', name: 'Lend IO', token: 'IO', icon: '💻', supplyApy: 10.5, borrowApy: 17.0, utilization: 65, totalSupply: 65000000, totalBorrow: 42250000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            // Emerging Sector Lending
            { id: 'lend-eigen', name: 'Lend EIGEN', token: 'EIGEN', icon: '🔄', supplyApy: 9.0, borrowApy: 15.0, utilization: 64, totalSupply: 145000000, totalBorrow: 92800000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-ondo', name: 'Lend ONDO', token: 'ONDO', icon: '🏦', supplyApy: 7.0, borrowApy: 11.5, utilization: 58, totalSupply: 95000000, totalBorrow: 55100000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-tia', name: 'Lend TIA', token: 'TIA', icon: '🌙', supplyApy: 11.5, borrowApy: 18.5, utilization: 67, totalSupply: 125000000, totalBorrow: 83750000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-strk', name: 'Lend STRK', token: 'STRK', icon: '⚡', supplyApy: 10.0, borrowApy: 16.0, utilization: 65, totalSupply: 85000000, totalBorrow: 55250000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-zk', name: 'Lend ZK', token: 'ZK', icon: '🔐', supplyApy: 8.5, borrowApy: 14.0, utilization: 62, totalSupply: 115000000, totalBorrow: 71300000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-ton', name: 'Lend TON', token: 'TON', icon: '✈️', supplyApy: 6.5, borrowApy: 11.0, utilization: 56, totalSupply: 185000000, totalBorrow: 103600000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-stx', name: 'Lend STX', token: 'STX', icon: '₿', supplyApy: 9.5, borrowApy: 15.5, utilization: 64, totalSupply: 95000000, totalBorrow: 60800000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-rndr', name: 'Lend RNDR', token: 'RNDR', icon: '🖥️', supplyApy: 8.0, borrowApy: 13.0, utilization: 60, totalSupply: 145000000, totalBorrow: 87000000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-akt', name: 'Lend AKT', token: 'AKT', icon: '☁️', supplyApy: 10.5, borrowApy: 17.0, utilization: 66, totalSupply: 55000000, totalBorrow: 36300000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-pyth', name: 'Lend PYTH', token: 'PYTH', icon: '🐍', supplyApy: 9.0, borrowApy: 14.5, utilization: 63, totalSupply: 165000000, totalBorrow: 103950000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            // === LENDING BATCH 8 - BRONTO EXPANSION ===
            // Privacy & Security Token Lending
            { id: 'lend-zec', name: 'Lend ZEC', token: 'ZEC', icon: '🔒', supplyApy: 4.5, borrowApy: 8.0, utilization: 52, totalSupply: 65000000, totalBorrow: 33800000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-dash', name: 'Lend DASH', token: 'DASH', icon: '💨', supplyApy: 5.5, borrowApy: 9.5, utilization: 55, totalSupply: 48000000, totalBorrow: 26400000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-scrt', name: 'Lend SCRT', token: 'SCRT', icon: '🤫', supplyApy: 12.0, borrowApy: 19.0, utilization: 68, totalSupply: 22000000, totalBorrow: 14960000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-rose', name: 'Lend ROSE', token: 'ROSE', icon: '🌹', supplyApy: 9.0, borrowApy: 14.5, utilization: 62, totalSupply: 35000000, totalBorrow: 21700000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            // Cross-Chain & Bridge Token Lending
            { id: 'lend-rune', name: 'Lend RUNE', token: 'RUNE', icon: '⚡', supplyApy: 7.5, borrowApy: 12.5, utilization: 58, totalSupply: 145000000, totalBorrow: 84100000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-axl', name: 'Lend AXL', token: 'AXL', icon: '🌐', supplyApy: 8.0, borrowApy: 13.0, utilization: 60, totalSupply: 55000000, totalBorrow: 33000000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-stg', name: 'Lend STG', token: 'STG', icon: '⭐', supplyApy: 9.5, borrowApy: 15.0, utilization: 64, totalSupply: 95000000, totalBorrow: 60800000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-w', name: 'Lend W', token: 'W', icon: '🕳️', supplyApy: 14.0, borrowApy: 22.0, utilization: 70, totalSupply: 72000000, totalBorrow: 50400000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'medium-high' },
            // Storage & Compute Token Lending
            { id: 'lend-fil', name: 'Lend FIL', token: 'FIL', icon: '📁', supplyApy: 5.0, borrowApy: 9.0, utilization: 54, totalSupply: 145000000, totalBorrow: 78300000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-ar', name: 'Lend AR', token: 'AR', icon: '🏛️', supplyApy: 6.5, borrowApy: 11.0, utilization: 58, totalSupply: 85000000, totalBorrow: 49300000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-theta', name: 'Lend THETA', token: 'THETA', icon: '📺', supplyApy: 4.0, borrowApy: 7.5, utilization: 50, totalSupply: 125000000, totalBorrow: 62500000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'low-medium' },
            // Move-Based L1 Token Lending
            { id: 'lend-apt', name: 'Lend APT', token: 'APT', icon: '🔷', supplyApy: 6.0, borrowApy: 10.0, utilization: 56, totalSupply: 195000000, totalBorrow: 109200000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-sui', name: 'Lend SUI', token: 'SUI', icon: '💧', supplyApy: 5.5, borrowApy: 9.5, utilization: 54, totalSupply: 285000000, totalBorrow: 153900000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-sei', name: 'Lend SEI', token: 'SEI', icon: '🌊', supplyApy: 8.5, borrowApy: 14.0, utilization: 62, totalSupply: 145000000, totalBorrow: 89900000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-cetus', name: 'Lend CETUS', token: 'CETUS', icon: '🐋', supplyApy: 15.0, borrowApy: 24.0, utilization: 72, totalSupply: 42000000, totalBorrow: 30240000, collateralFactor: 0.40, liquidationThreshold: 0.50, risk: 'medium-high' },
            // New DeFi & Restaking Token Lending
            { id: 'lend-morpho', name: 'Lend MORPHO', token: 'MORPHO', icon: '🦋', supplyApy: 11.0, borrowApy: 18.0, utilization: 66, totalSupply: 65000000, totalBorrow: 42900000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-ethfi', name: 'Lend ETHFI', token: 'ETHFI', icon: '🔥', supplyApy: 9.5, borrowApy: 15.5, utilization: 64, totalSupply: 95000000, totalBorrow: 60800000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-puffer', name: 'Lend PUFFER', token: 'PUFFER', icon: '🐡', supplyApy: 14.0, borrowApy: 22.0, utilization: 70, totalSupply: 48000000, totalBorrow: 33600000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'medium-high' },
            { id: 'lend-blast', name: 'Lend BLAST', token: 'BLAST', icon: '💥', supplyApy: 18.0, borrowApy: 28.0, utilization: 75, totalSupply: 145000000, totalBorrow: 108750000, collateralFactor: 0.38, liquidationThreshold: 0.48, risk: 'high' },
            // Exchange & Utility Token Lending
            { id: 'lend-bnb', name: 'Lend BNB', token: 'BNB', icon: '💛', supplyApy: 3.5, borrowApy: 6.5, utilization: 48, totalSupply: 650000000, totalBorrow: 312000000, collateralFactor: 0.70, liquidationThreshold: 0.80, risk: 'low' },
            { id: 'lend-okb', name: 'Lend OKB', token: 'OKB', icon: '🔵', supplyApy: 4.5, borrowApy: 8.0, utilization: 52, totalSupply: 185000000, totalBorrow: 96200000, collateralFactor: 0.62, liquidationThreshold: 0.72, risk: 'low-medium' },
            { id: 'lend-gt', name: 'Lend GT', token: 'GT', icon: '🟢', supplyApy: 5.5, borrowApy: 9.5, utilization: 55, totalSupply: 95000000, totalBorrow: 52250000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'medium' },
            // AI & GPU Token Lending
            { id: 'lend-tao', name: 'Lend TAO', token: 'TAO', icon: '🧠', supplyApy: 10.0, borrowApy: 16.0, utilization: 65, totalSupply: 225000000, totalBorrow: 146250000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-fet', name: 'Lend FET', token: 'FET', icon: '🤖', supplyApy: 8.5, borrowApy: 14.0, utilization: 62, totalSupply: 165000000, totalBorrow: 102300000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-agix', name: 'Lend AGIX', token: 'AGIX', icon: '🔮', supplyApy: 9.0, borrowApy: 14.5, utilization: 63, totalSupply: 95000000, totalBorrow: 59850000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium' },
            { id: 'lend-wld', name: 'Lend WLD', token: 'WLD', icon: '🌍', supplyApy: 12.0, borrowApy: 19.0, utilization: 68, totalSupply: 145000000, totalBorrow: 98600000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            // Gaming Token Lending
            { id: 'lend-gala', name: 'Lend GALA', token: 'GALA', icon: '🎮', supplyApy: 11.0, borrowApy: 17.5, utilization: 66, totalSupply: 125000000, totalBorrow: 82500000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'medium-high' },
            { id: 'lend-imx', name: 'Lend IMX', token: 'IMX', icon: '🎲', supplyApy: 8.0, borrowApy: 13.0, utilization: 60, totalSupply: 185000000, totalBorrow: 111000000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-ron', name: 'Lend RON', token: 'RON', icon: '⚔️', supplyApy: 9.5, borrowApy: 15.0, utilization: 64, totalSupply: 125000000, totalBorrow: 80000000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-prime', name: 'Lend PRIME', token: 'PRIME', icon: '🎯', supplyApy: 13.0, borrowApy: 20.5, utilization: 69, totalSupply: 65000000, totalBorrow: 44850000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'medium-high' },

            // === LENDING BATCH 9 - TERA EXPANSION ===
            // Liquid Restaking Token Lending
            { id: 'lend-ezeth', name: 'Lend ezETH', token: 'ezETH', icon: '🔄', supplyApy: 5.5, borrowApy: 9.0, utilization: 58, totalSupply: 485000000, totalBorrow: 281300000, collateralFactor: 0.78, liquidationThreshold: 0.85, risk: 'low' },
            { id: 'lend-rseth', name: 'Lend rsETH', token: 'rsETH', icon: '♻️', supplyApy: 5.0, borrowApy: 8.5, utilization: 55, totalSupply: 325000000, totalBorrow: 178750000, collateralFactor: 0.76, liquidationThreshold: 0.83, risk: 'low' },
            { id: 'lend-weeth', name: 'Lend weETH', token: 'weETH', icon: '🌊', supplyApy: 5.2, borrowApy: 8.8, utilization: 56, totalSupply: 625000000, totalBorrow: 350000000, collateralFactor: 0.80, liquidationThreshold: 0.87, risk: 'low' },
            { id: 'lend-pufeth', name: 'Lend pufETH', token: 'pufETH', icon: '🐡', supplyApy: 6.0, borrowApy: 10.0, utilization: 60, totalSupply: 185000000, totalBorrow: 111000000, collateralFactor: 0.72, liquidationThreshold: 0.80, risk: 'low-medium' },
            { id: 'lend-sweth', name: 'Lend swETH', token: 'swETH', icon: '💧', supplyApy: 4.8, borrowApy: 8.2, utilization: 54, totalSupply: 295000000, totalBorrow: 159300000, collateralFactor: 0.75, liquidationThreshold: 0.82, risk: 'low' },

            // Perpetual DEX Governance Lending
            { id: 'lend-hype', name: 'Lend HYPE', token: 'HYPE', icon: '🚀', supplyApy: 15.0, borrowApy: 24.0, utilization: 72, totalSupply: 245000000, totalBorrow: 176400000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'high' },
            { id: 'lend-vrtx', name: 'Lend VRTX', token: 'VRTX', icon: '🔺', supplyApy: 12.0, borrowApy: 19.0, utilization: 68, totalSupply: 125000000, totalBorrow: 85000000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-apex', name: 'Lend APEX', token: 'APEX', icon: '🔼', supplyApy: 11.0, borrowApy: 17.5, utilization: 66, totalSupply: 85000000, totalBorrow: 56100000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium-high' },
            { id: 'lend-blue', name: 'Lend BLUE', token: 'BLUE', icon: '🔵', supplyApy: 9.5, borrowApy: 15.0, utilization: 64, totalSupply: 52000000, totalBorrow: 33280000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },

            // ZK & Privacy L2 Lending
            { id: 'lend-linea', name: 'Lend LINEA', token: 'LINEA', icon: '📐', supplyApy: 10.0, borrowApy: 16.0, utilization: 65, totalSupply: 185000000, totalBorrow: 120250000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-scroll', name: 'Lend SCROLL', token: 'SCROLL', icon: '📜', supplyApy: 11.0, borrowApy: 17.5, utilization: 66, totalSupply: 145000000, totalBorrow: 95700000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium' },
            { id: 'lend-taiko', name: 'Lend TAIKO', token: 'TAIKO', icon: '🥁', supplyApy: 12.5, borrowApy: 19.5, utilization: 68, totalSupply: 125000000, totalBorrow: 85000000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-manta', name: 'Lend MANTA', token: 'MANTA', icon: '🐋', supplyApy: 9.0, borrowApy: 14.5, utilization: 63, totalSupply: 165000000, totalBorrow: 103950000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-mode', name: 'Lend MODE', token: 'MODE', icon: '🎮', supplyApy: 10.5, borrowApy: 16.5, utilization: 66, totalSupply: 95000000, totalBorrow: 62700000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },

            // Solana Ecosystem New Lending
            { id: 'lend-pyth', name: 'Lend PYTH', token: 'PYTH', icon: '🐍', supplyApy: 7.5, borrowApy: 12.0, utilization: 62, totalSupply: 285000000, totalBorrow: 176700000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'medium' },
            { id: 'lend-w', name: 'Lend W', token: 'W', icon: '🌉', supplyApy: 10.0, borrowApy: 16.0, utilization: 65, totalSupply: 425000000, totalBorrow: 276250000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-tnsr', name: 'Lend TNSR', token: 'TNSR', icon: '🎯', supplyApy: 12.0, borrowApy: 19.0, utilization: 68, totalSupply: 145000000, totalBorrow: 98600000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-kmno', name: 'Lend KMNO', token: 'KMNO', icon: '🎰', supplyApy: 14.0, borrowApy: 22.0, utilization: 70, totalSupply: 185000000, totalBorrow: 129500000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'high' },

            // Appchain & Modular Lending
            { id: 'lend-dym', name: 'Lend DYM', token: 'DYM', icon: '🔮', supplyApy: 9.0, borrowApy: 14.5, utilization: 63, totalSupply: 165000000, totalBorrow: 103950000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-saga', name: 'Lend SAGA', token: 'SAGA', icon: '📖', supplyApy: 10.5, borrowApy: 16.5, utilization: 66, totalSupply: 125000000, totalBorrow: 82500000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },
            { id: 'lend-alt', name: 'Lend ALT', token: 'ALT', icon: '🔷', supplyApy: 11.0, borrowApy: 17.5, utilization: 66, totalSupply: 185000000, totalBorrow: 122100000, collateralFactor: 0.50, liquidationThreshold: 0.60, risk: 'medium-high' },
            { id: 'lend-avail', name: 'Lend AVAIL', token: 'AVAIL', icon: '✅', supplyApy: 13.0, borrowApy: 20.5, utilization: 69, totalSupply: 145000000, totalBorrow: 100050000, collateralFactor: 0.48, liquidationThreshold: 0.58, risk: 'medium-high' },
            { id: 'lend-omni', name: 'Lend OMNI', token: 'OMNI', icon: '🌐', supplyApy: 9.5, borrowApy: 15.0, utilization: 64, totalSupply: 95000000, totalBorrow: 60800000, collateralFactor: 0.52, liquidationThreshold: 0.62, risk: 'medium' },

            // Intent & Chain Abstraction Lending
            { id: 'lend-parti', name: 'Lend PARTI', token: 'PARTI', icon: '🎉', supplyApy: 14.0, borrowApy: 22.0, utilization: 70, totalSupply: 85000000, totalBorrow: 59500000, collateralFactor: 0.45, liquidationThreshold: 0.55, risk: 'high' },
            { id: 'lend-socket', name: 'Lend SOCKET', token: 'SOCKET', icon: '🔌', supplyApy: 9.0, borrowApy: 14.5, utilization: 63, totalSupply: 65000000, totalBorrow: 40950000, collateralFactor: 0.55, liquidationThreshold: 0.65, risk: 'medium' },
            { id: 'lend-lifi', name: 'Lend LIFI', token: 'LIFI', icon: '🔗', supplyApy: 8.0, borrowApy: 13.0, utilization: 60, totalSupply: 52000000, totalBorrow: 31200000, collateralFactor: 0.58, liquidationThreshold: 0.68, risk: 'medium' },

            // AI Agents & Automation Lending
            { id: 'lend-virtual', name: 'Lend VIRTUAL', token: 'VIRTUAL', icon: '🤖', supplyApy: 18.0, borrowApy: 28.0, utilization: 75, totalSupply: 285000000, totalBorrow: 213750000, collateralFactor: 0.40, liquidationThreshold: 0.50, risk: 'high' },
            { id: 'lend-ai16z', name: 'Lend AI16Z', token: 'AI16Z', icon: '🧠', supplyApy: 25.0, borrowApy: 38.0, utilization: 78, totalSupply: 165000000, totalBorrow: 128700000, collateralFactor: 0.35, liquidationThreshold: 0.45, risk: 'high' },
            { id: 'lend-griff', name: 'Lend GRIFF', token: 'GRIFF', icon: '🦅', supplyApy: 20.0, borrowApy: 31.0, utilization: 76, totalSupply: 125000000, totalBorrow: 95000000, collateralFactor: 0.38, liquidationThreshold: 0.48, risk: 'high' },
            { id: 'lend-zerebro', name: 'Lend ZEREBRO', token: 'ZEREBRO', icon: '🧬', supplyApy: 28.0, borrowApy: 42.0, utilization: 80, totalSupply: 95000000, totalBorrow: 76000000, collateralFactor: 0.32, liquidationThreshold: 0.42, risk: 'high' },
            { id: 'lend-arc', name: 'Lend ARC', token: 'ARC', icon: '⚡', supplyApy: 16.0, borrowApy: 25.0, utilization: 74, totalSupply: 75000000, totalBorrow: 55500000, collateralFactor: 0.42, liquidationThreshold: 0.52, risk: 'high' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SAVINGS ACCOUNTS
    // ═══════════════════════════════════════════════════════════════════════════
    savings: {
        products: [
            { id: 'flex-savings-usdc', name: 'Flexible USDC', token: 'USDC', icon: '$', apy: 3.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 560000000, risk: 'very-low', description: 'Flexible USDC savings - withdraw anytime' },
            { id: 'locked-30d-usdt', name: 'Locked USDT 30d', token: 'USDT', icon: '₮', apy: 5.0, minDeposit: 1, minInvest: 1, lockPeriod: 30, withdrawalFee: 1, insurance: true, tvl: 280000000, risk: 'very-low', description: 'Lock USDT for 30 days' },
            { id: 'locked-90d-usdc', name: 'Locked USDC 90d', token: 'USDC', icon: '$', apy: 7.0, minDeposit: 1, minInvest: 1, lockPeriod: 90, withdrawalFee: 2, insurance: true, tvl: 180000000, risk: 'very-low', description: 'Best rate for 90-day lock' },
            { id: 'dai-savings', name: 'DAI Savings', token: 'DAI', icon: '◈', apy: 4.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 320000000, risk: 'very-low', description: 'Earn yield on DAI flexibly' },
            { id: 'flex-savings-eth', name: 'Flexible ETH', token: 'ETH', icon: '⟠', apy: 2.8, minDeposit: 0.001, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 320000000, risk: 'very-low', description: 'Earn on ETH with flexibility' },
            { id: 'locked-60d-usdc', name: 'Locked USDC 60d', token: 'USDC', icon: '$', apy: 6.0, minDeposit: 1, minInvest: 1, lockPeriod: 60, withdrawalFee: 1.5, insurance: true, tvl: 220000000, risk: 'very-low', description: 'Medium-term USDC lock' },
            { id: 'locked-180d-usdt', name: 'Locked USDT 180d', token: 'USDT', icon: '₮', apy: 8.5, minDeposit: 1, minInvest: 1, lockPeriod: 180, withdrawalFee: 2.5, insurance: true, tvl: 150000000, risk: 'low', description: 'High yield 6-month USDT' },
            { id: 'locked-365d-btc', name: '1-Year BTC', token: 'WBTC', icon: '₿', apy: 5.2, minDeposit: 0.001, minInvest: 1, lockPeriod: 365, withdrawalFee: 3, insurance: true, tvl: 120000000, risk: 'low', description: 'Long-term BTC savings' },
            { id: 'frax-savings', name: 'FRAX Savings', token: 'FRAX', icon: 'F', apy: 4.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 85000000, risk: 'low', description: 'Yield on FRAX stablecoin' },
            { id: 'lusd-savings', name: 'LUSD Savings', token: 'LUSD', icon: 'L', apy: 5.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 65000000, risk: 'low', description: 'Liquity stablecoin savings' },
            // === NEW SAVINGS BATCH ===
            { id: 'pyusd-savings', name: 'PYUSD Savings', token: 'PYUSD', icon: 'P', apy: 5.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 95000000, risk: 'very-low', description: 'PayPal USD stablecoin savings' },
            { id: 'usde-savings', name: 'USDe Savings', token: 'USDe', icon: 'E', apy: 15.0, minDeposit: 1, minInvest: 1, lockPeriod: 7, withdrawalFee: 0, insurance: false, tvl: 450000000, risk: 'low', description: 'Ethena synthetic dollar high yield' },
            { id: 'susde-savings', name: 'sUSDe Staking', token: 'sUSDe', icon: 'sE', apy: 25.0, minDeposit: 1, minInvest: 1, lockPeriod: 7, withdrawalFee: 0, insurance: false, tvl: 380000000, risk: 'low-medium', description: 'Staked USDe maximum yield' },
            { id: 'gusd-savings', name: 'GUSD Savings', token: 'GUSD', icon: 'G', apy: 3.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 45000000, risk: 'very-low', description: 'Gemini Dollar savings' },
            { id: 'tusd-savings', name: 'TUSD Savings', token: 'TUSD', icon: 'T', apy: 4.2, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 55000000, risk: 'very-low', description: 'TrueUSD flexible savings' },
            { id: 'locked-7d-usdc', name: 'Locked USDC 7d', token: 'USDC', icon: '$', apy: 4.0, minDeposit: 1, minInvest: 1, lockPeriod: 7, withdrawalFee: 0.5, insurance: true, tvl: 320000000, risk: 'very-low', description: 'Short-term USDC lock' },
            { id: 'locked-14d-usdt', name: 'Locked USDT 14d', token: 'USDT', icon: '₮', apy: 4.5, minDeposit: 1, minInvest: 1, lockPeriod: 14, withdrawalFee: 0.75, insurance: true, tvl: 280000000, risk: 'very-low', description: 'Two-week USDT lock' },
            { id: 'sol-savings', name: 'Flexible SOL', token: 'SOL', icon: '◎', apy: 3.5, minDeposit: 0.1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 145000000, risk: 'low', description: 'Earn on SOL flexibly' },
            { id: 'avax-savings', name: 'Flexible AVAX', token: 'AVAX', icon: '🔺', apy: 4.0, minDeposit: 0.1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 85000000, risk: 'low', description: 'Earn on AVAX flexibly' },
            { id: 'matic-savings', name: 'Flexible MATIC', token: 'MATIC', icon: '⬡', apy: 3.2, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 75000000, risk: 'low', description: 'Earn on MATIC flexibly' },
            // === SAVINGS BATCH 2 ===
            { id: 'arb-savings', name: 'Flexible ARB', token: 'ARB', icon: '🔵', apy: 4.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 65000000, risk: 'low', description: 'Earn on ARB flexibly' },
            { id: 'op-savings', name: 'Flexible OP', token: 'OP', icon: '🔴', apy: 4.2, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 55000000, risk: 'low', description: 'Earn on OP flexibly' },
            { id: 'atom-savings', name: 'Flexible ATOM', token: 'ATOM', icon: '⚛', apy: 5.0, minDeposit: 0.5, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 85000000, risk: 'low', description: 'Earn on ATOM flexibly' },
            { id: 'dot-savings', name: 'Flexible DOT', token: 'DOT', icon: '●', apy: 4.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 75000000, risk: 'low', description: 'Earn on DOT flexibly' },
            { id: 'link-savings', name: 'Flexible LINK', token: 'LINK', icon: '🔗', apy: 3.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 95000000, risk: 'low', description: 'Earn on LINK flexibly' },
            { id: 'locked-120d-usdc', name: 'Locked USDC 120d', token: 'USDC', icon: '$', apy: 7.5, minDeposit: 1, minInvest: 1, lockPeriod: 120, withdrawalFee: 2, insurance: true, tvl: 145000000, risk: 'very-low', description: '4-month USDC lock' },
            { id: 'locked-240d-usdt', name: 'Locked USDT 240d', token: 'USDT', icon: '₮', apy: 9.0, minDeposit: 1, minInvest: 1, lockPeriod: 240, withdrawalFee: 2.5, insurance: true, tvl: 95000000, risk: 'very-low', description: '8-month USDT high yield' },
            { id: 'locked-365d-eth', name: '1-Year ETH', token: 'ETH', icon: '⟠', apy: 5.5, minDeposit: 0.01, minInvest: 1, lockPeriod: 365, withdrawalFee: 3, insurance: true, tvl: 180000000, risk: 'low', description: 'Long-term ETH savings' },
            { id: 'usdt-ultra', name: 'USDT Ultra Yield', token: 'USDT', icon: '₮', apy: 12.0, minDeposit: 100, minInvest: 100, lockPeriod: 90, withdrawalFee: 1.5, insurance: false, tvl: 120000000, risk: 'low-medium', description: 'Enhanced USDT yield' },
            { id: 'eth-boost', name: 'ETH Boost Savings', token: 'ETH', icon: '⟠', apy: 6.0, minDeposit: 0.1, minInvest: 10, lockPeriod: 30, withdrawalFee: 0.5, insurance: false, tvl: 95000000, risk: 'low', description: 'Boosted ETH savings' },
            { id: 'btc-premium', name: 'BTC Premium Savings', token: 'WBTC', icon: '₿', apy: 4.0, minDeposit: 0.01, minInvest: 50, lockPeriod: 60, withdrawalFee: 1, insurance: true, tvl: 145000000, risk: 'low', description: 'Premium BTC savings' },
            { id: 'sui-savings', name: 'Flexible SUI', token: 'SUI', icon: '💧', apy: 5.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 45000000, risk: 'low-medium', description: 'Earn on SUI flexibly' },
            { id: 'sei-savings', name: 'Flexible SEI', token: 'SEI', icon: '🌊', apy: 6.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 35000000, risk: 'low-medium', description: 'Earn on SEI flexibly' },
            { id: 'ton-savings', name: 'Flexible TON', token: 'TON', icon: '💎', apy: 4.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 85000000, risk: 'low', description: 'Earn on TON flexibly' },
            // === SAVINGS BATCH 3 ===
            { id: 'apt-savings', name: 'Flexible APT', token: 'APT', icon: '🔷', apy: 5.0, minDeposit: 0.5, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 55000000, risk: 'low-medium', description: 'Earn on APT flexibly' },
            { id: 'inj-savings', name: 'Flexible INJ', token: 'INJ', icon: '💉', apy: 5.5, minDeposit: 0.5, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 42000000, risk: 'low-medium', description: 'Earn on INJ flexibly' },
            { id: 'tia-savings', name: 'Flexible TIA', token: 'TIA', icon: '✨', apy: 6.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 35000000, risk: 'low-medium', description: 'Earn on TIA flexibly' },
            { id: 'near-savings', name: 'Flexible NEAR', token: 'NEAR', icon: 'N', apy: 5.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 65000000, risk: 'low', description: 'Earn on NEAR flexibly' },
            { id: 'ftm-savings', name: 'Flexible FTM', token: 'FTM', icon: '👻', apy: 4.8, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 35000000, risk: 'low-medium', description: 'Earn on FTM flexibly' },
            { id: 'locked-7d-eth', name: 'Locked ETH 7d', token: 'ETH', icon: '⟠', apy: 3.5, minDeposit: 0.01, minInvest: 1, lockPeriod: 7, withdrawalFee: 0.5, insurance: true, tvl: 145000000, risk: 'very-low', description: 'Short-term ETH lock' },
            { id: 'locked-30d-eth', name: 'Locked ETH 30d', token: 'ETH', icon: '⟠', apy: 4.5, minDeposit: 0.01, minInvest: 1, lockPeriod: 30, withdrawalFee: 1, insurance: true, tvl: 185000000, risk: 'very-low', description: 'Monthly ETH lock' },
            { id: 'locked-60d-btc', name: 'Locked BTC 60d', token: 'WBTC', icon: '₿', apy: 3.8, minDeposit: 0.001, minInvest: 1, lockPeriod: 60, withdrawalFee: 1.5, insurance: true, tvl: 95000000, risk: 'very-low', description: '2-month BTC lock' },
            { id: 'strk-savings', name: 'Flexible STRK', token: 'STRK', icon: '⚡', apy: 7.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 25000000, risk: 'medium', description: 'Earn on STRK flexibly' },
            { id: 'jup-savings', name: 'Flexible JUP', token: 'JUP', icon: '🪐', apy: 4.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 45000000, risk: 'low-medium', description: 'Earn on JUP flexibly' },
            { id: 'pendle-savings', name: 'Flexible PENDLE', token: 'PENDLE', icon: '📈', apy: 5.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 38000000, risk: 'low-medium', description: 'Earn on PENDLE flexibly' },
            { id: 'locked-90d-sol', name: 'Locked SOL 90d', token: 'SOL', icon: '◎', apy: 6.5, minDeposit: 0.1, minInvest: 1, lockPeriod: 90, withdrawalFee: 2, insurance: true, tvl: 85000000, risk: 'low', description: '3-month SOL lock' },
            { id: 'locked-180d-eth', name: 'Locked ETH 180d', token: 'ETH', icon: '⟠', apy: 5.8, minDeposit: 0.05, minInvest: 10, lockPeriod: 180, withdrawalFee: 2, insurance: true, tvl: 145000000, risk: 'low', description: '6-month ETH lock' },
            { id: 'gmx-savings', name: 'Flexible GMX', token: 'GMX', icon: '🔷', apy: 4.0, minDeposit: 0.1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 28000000, risk: 'low-medium', description: 'Earn on GMX flexibly' },
            { id: 'mkr-savings', name: 'Flexible MKR', token: 'MKR', icon: 'Ⓜ️', apy: 2.5, minDeposit: 0.01, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 45000000, risk: 'low', description: 'Earn on MKR flexibly' },
            { id: 'uni-savings', name: 'Flexible UNI', token: 'UNI', icon: '🦄', apy: 2.8, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 75000000, risk: 'low', description: 'Earn on UNI flexibly' },
            { id: 'aave-savings', name: 'Flexible AAVE', token: 'AAVE', icon: '👻', apy: 3.0, minDeposit: 0.1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 65000000, risk: 'low', description: 'Earn on AAVE flexibly' },
            { id: 'dydx-savings', name: 'Flexible dYdX', token: 'DYDX', icon: '📊', apy: 4.2, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 42000000, risk: 'low-medium', description: 'Earn on dYdX flexibly' },
            // === SAVINGS BATCH 4 - MEGA ===
            { id: 'mode-savings', name: 'Flexible MODE', token: 'MODE', icon: '🟢', apy: 8.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 15000000, risk: 'medium', description: 'Earn on MODE flexibly' },
            { id: 'blast-savings', name: 'Flexible BLAST', token: 'BLAST', icon: '💥', apy: 12.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 25000000, risk: 'medium-high', description: 'Earn native yield on BLAST' },
            { id: 'scroll-savings', name: 'Flexible SCROLL', token: 'SCROLL', icon: '📜', apy: 6.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 18000000, risk: 'medium', description: 'Earn on SCROLL flexibly' },
            { id: 'taiko-savings', name: 'Flexible TAIKO', token: 'TAIKO', icon: '🥁', apy: 9.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 12000000, risk: 'medium-high', description: 'Earn on TAIKO flexibly' },
            { id: 'zeta-savings', name: 'Flexible ZETA', token: 'ZETA', icon: 'Ζ', apy: 7.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 14000000, risk: 'medium', description: 'Earn on ZETA flexibly' },
            { id: 'rez-savings', name: 'Flexible REZ', token: 'REZ', icon: '♦️', apy: 15.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 8000000, risk: 'high', description: 'High yield REZ savings' },
            { id: 'puffer-savings', name: 'Flexible PUFFER', token: 'PUFFER', icon: '🐡', apy: 5.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 22000000, risk: 'low-medium', description: 'Earn on PUFFER flexibly' },
            { id: 'omni-savings', name: 'Flexible OMNI', token: 'OMNI', icon: '🌐', apy: 6.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 16000000, risk: 'medium', description: 'Earn on OMNI flexibly' },
            { id: 'saga-savings', name: 'Flexible SAGA', token: 'SAGA', icon: '📖', apy: 7.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 11000000, risk: 'medium', description: 'Earn on SAGA flexibly' },
            { id: 'hnt-savings', name: 'Flexible HNT', token: 'HNT', icon: '📡', apy: 4.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 28000000, risk: 'low-medium', description: 'Earn on Helium flexibly' },
            { id: 'akt-savings', name: 'Flexible AKT', token: 'AKT', icon: '☁️', apy: 5.8, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 18000000, risk: 'medium', description: 'Earn on Akash flexibly' },
            { id: 'rune-savings', name: 'Flexible RUNE', token: 'RUNE', icon: '⚡', apy: 4.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 45000000, risk: 'low-medium', description: 'Earn on THORChain flexibly' },
            { id: 'kuji-savings', name: 'Flexible KUJI', token: 'KUJI', icon: '🐋', apy: 5.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 15000000, risk: 'medium', description: 'Earn on Kujira flexibly' },
            { id: 'ntrn-savings', name: 'Flexible NTRN', token: 'NTRN', icon: '⚛️', apy: 6.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 18000000, risk: 'medium', description: 'Earn on Neutron flexibly' },
            { id: 'astro-savings', name: 'Flexible ASTRO', token: 'ASTRO', icon: '🚀', apy: 5.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 22000000, risk: 'low-medium', description: 'Earn on Astroport flexibly' },
            { id: 'whale-savings', name: 'Flexible WHALE', token: 'WHALE', icon: '🐳', apy: 4.8, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 12000000, risk: 'medium', description: 'Earn on White Whale flexibly' },
            { id: 'orca-savings', name: 'Flexible ORCA', token: 'ORCA', icon: '🐋', apy: 3.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 25000000, risk: 'low', description: 'Earn on Orca flexibly' },
            { id: 'ray-savings', name: 'Flexible RAY', token: 'RAY', icon: '☀️', apy: 4.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 32000000, risk: 'low-medium', description: 'Earn on Raydium flexibly' },
            { id: 'locked-90d-arb', name: 'Locked ARB 90d', token: 'ARB', icon: '🔵', apy: 7.5, minDeposit: 10, minInvest: 10, lockPeriod: 90, withdrawalFee: 2, insurance: false, tvl: 65000000, risk: 'low-medium', description: '3-month ARB lock' },
            { id: 'locked-90d-op', name: 'Locked OP 90d', token: 'OP', icon: '🔴', apy: 7.0, minDeposit: 10, minInvest: 10, lockPeriod: 90, withdrawalFee: 2, insurance: false, tvl: 55000000, risk: 'low-medium', description: '3-month OP lock' },
            { id: 'locked-180d-sol', name: 'Locked SOL 180d', token: 'SOL', icon: '◎', apy: 8.5, minDeposit: 0.5, minInvest: 10, lockPeriod: 180, withdrawalFee: 2.5, insurance: true, tvl: 125000000, risk: 'low', description: '6-month SOL lock' },
            { id: 'locked-365d-eth', name: 'Locked ETH 365d', token: 'ETH', icon: '⟠', apy: 7.0, minDeposit: 0.1, minInvest: 50, lockPeriod: 365, withdrawalFee: 3, insurance: true, tvl: 185000000, risk: 'low', description: '1-year ETH lock' },
            { id: 'usde-savings', name: 'Flexible USDe', token: 'USDe', icon: 'E', apy: 15.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 145000000, risk: 'low-medium', description: 'Ethena USDe flexible savings' },
            { id: 'susde-savings', name: 'Staked sUSDe', token: 'sUSDe', icon: 'sE', apy: 25.0, minDeposit: 1, minInvest: 1, lockPeriod: 7, withdrawalFee: 0, insurance: false, tvl: 185000000, risk: 'low-medium', description: 'Staked USDe with higher yield' },
            { id: 'gho-savings', name: 'Flexible GHO', token: 'GHO', icon: '👻', apy: 6.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 95000000, risk: 'low', description: 'Aave GHO stablecoin savings' },
            { id: 'crvusd-savings', name: 'Flexible crvUSD', token: 'crvUSD', icon: '🔴', apy: 8.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 75000000, risk: 'low', description: 'Curve USD savings' },
            { id: 'lusd-savings', name: 'Flexible LUSD', token: 'LUSD', icon: '🐔', apy: 5.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 65000000, risk: 'very-low', description: 'Liquity USD savings' },
            { id: 'pyusd-savings', name: 'Flexible PYUSD', token: 'PYUSD', icon: '💵', apy: 4.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 125000000, risk: 'very-low', description: 'PayPal USD savings' },
            { id: 'eurc-savings', name: 'Flexible EURC', token: 'EURC', icon: '€', apy: 4.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 85000000, risk: 'very-low', description: 'Euro stablecoin savings' },
            { id: 'link-savings', name: 'Flexible LINK', token: 'LINK', icon: '🔗', apy: 2.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 85000000, risk: 'low', description: 'Earn on LINK flexibly' },
            { id: 'wbtc-savings', name: 'Flexible WBTC', token: 'WBTC', icon: '₿', apy: 2.0, minDeposit: 0.001, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 225000000, risk: 'very-low', description: 'Earn on wrapped BTC' },
            { id: 'avax-savings', name: 'Flexible AVAX', token: 'AVAX', icon: '🔺', apy: 3.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 75000000, risk: 'low', description: 'Earn on AVAX flexibly' },
            { id: 'bnb-savings', name: 'Flexible BNB', token: 'BNB', icon: '💛', apy: 2.8, minDeposit: 0.1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 145000000, risk: 'low', description: 'Earn on BNB flexibly' },
            { id: 'dot-savings', name: 'Flexible DOT', token: 'DOT', icon: '●', apy: 8.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 55000000, risk: 'low-medium', description: 'Earn on DOT flexibly' },
            // === SAVINGS BATCH 5 - ZETTA EXPANSION ===
            { id: 'ftm-savings', name: 'Flexible FTM', token: 'FTM', icon: '👻', apy: 4.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 55000000, risk: 'low-medium', description: 'Earn on Fantom flexibly' },
            { id: 'eos-savings', name: 'Flexible EOS', token: 'EOS', icon: '🔷', apy: 3.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 45000000, risk: 'low-medium', description: 'Earn on EOS flexibly' },
            { id: 'xlm-savings', name: 'Flexible XLM', token: 'XLM', icon: '✨', apy: 3.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 65000000, risk: 'low', description: 'Earn on Stellar flexibly' },
            { id: 'trx-savings', name: 'Flexible TRX', token: 'TRX', icon: '🔺', apy: 4.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 85000000, risk: 'low-medium', description: 'Earn on TRON flexibly' },
            { id: 'waves-savings', name: 'Flexible WAVES', token: 'WAVES', icon: '🌊', apy: 6.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 22000000, risk: 'medium', description: 'Earn on WAVES flexibly' },
            { id: 'ont-savings', name: 'Flexible ONT', token: 'ONT', icon: '🔵', apy: 4.2, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 18000000, risk: 'medium', description: 'Earn on Ontology flexibly' },
            { id: 'icx-savings', name: 'Flexible ICX', token: 'ICX', icon: '⬡', apy: 5.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 15000000, risk: 'medium', description: 'Earn on ICON flexibly' },
            { id: 'lsk-savings', name: 'Flexible LSK', token: 'LSK', icon: '💎', apy: 4.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 12000000, risk: 'medium', description: 'Earn on Lisk flexibly' },
            { id: 'xno-savings', name: 'Flexible XNO', token: 'XNO', icon: '💵', apy: 6.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 8000000, risk: 'medium', description: 'Earn on Nano flexibly' },
            { id: 'iost-savings', name: 'Flexible IOST', token: 'IOST', icon: '🔶', apy: 7.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 12000000, risk: 'medium-high', description: 'Earn on IOST flexibly' },
            { id: 'waxp-savings', name: 'Flexible WAXP', token: 'WAXP', icon: '🟠', apy: 5.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 15000000, risk: 'medium', description: 'Earn on WAX flexibly' },
            { id: 'flux-savings', name: 'Flexible FLUX', token: 'FLUX', icon: '⚡', apy: 7.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 18000000, risk: 'medium', description: 'Earn on Flux flexibly' },
            { id: 'sys-savings', name: 'Flexible SYS', token: 'SYS', icon: '🔷', apy: 6.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 12000000, risk: 'medium', description: 'Earn on Syscoin flexibly' },
            { id: 'kmd-savings', name: 'Flexible KMD', token: 'KMD', icon: '🐉', apy: 5.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 8000000, risk: 'medium', description: 'Earn on Komodo flexibly' },
            { id: 'dcr-savings', name: 'Flexible DCR', token: 'DCR', icon: '🔵', apy: 3.8, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 10000000, risk: 'low-medium', description: 'Earn on Decred flexibly' },
            { id: 'stx-savings', name: 'Flexible STX', token: 'STX', icon: '📦', apy: 5.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 45000000, risk: 'medium', description: 'Earn on Stacks flexibly' },
            { id: 'ordi-savings', name: 'Flexible ORDI', token: 'ORDI', icon: '🟡', apy: 10.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 55000000, risk: 'high', description: 'Earn on ORDI flexibly' },
            { id: 'jasmy-savings', name: 'Flexible JASMY', token: 'JASMY', icon: '📱', apy: 7.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 25000000, risk: 'medium-high', description: 'Earn on JasmyCoin flexibly' },
            { id: 'ankr-savings', name: 'Flexible ANKR', token: 'ANKR', icon: '⚓', apy: 4.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 18000000, risk: 'medium', description: 'Earn on Ankr flexibly' },
            { id: 'spell-savings', name: 'Flexible SPELL', token: 'SPELL', icon: '🪄', apy: 9.0, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 22000000, risk: 'medium-high', description: 'Earn on SPELL flexibly' },
            { id: 'joe-savings', name: 'Flexible JOE', token: 'JOE', icon: '🔴', apy: 7.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 28000000, risk: 'medium', description: 'Earn on Trader Joe flexibly' },
            { id: 'quick-savings', name: 'Flexible QUICK', token: 'QUICK', icon: '⚡', apy: 6.5, minDeposit: 1, minInvest: 1, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 18000000, risk: 'medium', description: 'Earn on QuickSwap flexibly' },
            { id: 'locked-60d-ftm', name: 'Locked FTM 60d', token: 'FTM', icon: '👻', apy: 7.0, minDeposit: 10, minInvest: 10, lockPeriod: 60, withdrawalFee: 1.5, insurance: false, tvl: 35000000, risk: 'low-medium', description: '2-month FTM lock' },
            { id: 'locked-90d-trx', name: 'Locked TRX 90d', token: 'TRX', icon: '🔺', apy: 7.5, minDeposit: 50, minInvest: 10, lockPeriod: 90, withdrawalFee: 2, insurance: false, tvl: 55000000, risk: 'low-medium', description: '3-month TRX lock' },
            { id: 'locked-180d-stx', name: 'Locked STX 180d', token: 'STX', icon: '📦', apy: 10.0, minDeposit: 10, minInvest: 10, lockPeriod: 180, withdrawalFee: 2.5, insurance: false, tvl: 42000000, risk: 'medium', description: '6-month STX lock' },
            { id: 'locked-365d-usdc', name: 'Locked USDC 365d', token: 'USDC', icon: '$', apy: 10.0, minDeposit: 100, minInvest: 100, lockPeriod: 365, withdrawalFee: 3, insurance: true, tvl: 225000000, risk: 'very-low', description: '1-year USDC maximum yield' },
            { id: 'meme-savings', name: 'Meme Basket Savings', token: 'MULTI', icon: '🐸', apy: 12.0, minDeposit: 10, minInvest: 10, lockPeriod: 0, withdrawalFee: 0.5, insurance: false, tvl: 35000000, risk: 'high', description: 'Diversified meme token yield' },
            { id: 'l2-savings', name: 'L2 Token Savings', token: 'MULTI', icon: '⚡', apy: 6.5, minDeposit: 10, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 65000000, risk: 'medium', description: 'Multi-L2 token yield basket' },
            { id: 'defi-blue-savings', name: 'DeFi Blue Chip', token: 'MULTI', icon: '🔵', apy: 4.5, minDeposit: 50, minInvest: 50, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 145000000, risk: 'low', description: 'Top DeFi tokens yield' },

            // === SAVINGS BATCH 6 - BRONTO EXPANSION ===
            // Privacy Token Savings
            { id: 'zec-savings', name: 'Flexible ZEC', token: 'ZEC', icon: '🔒', apy: 3.5, minDeposit: 0.01, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 65000000, risk: 'medium', description: 'Earn on Zcash flexibly' },
            { id: 'dash-savings', name: 'Flexible DASH', token: 'DASH', icon: '💨', apy: 5.5, minDeposit: 0.1, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 48000000, risk: 'medium', description: 'Earn on Dash flexibly' },
            { id: 'scrt-savings', name: 'Flexible SCRT', token: 'SCRT', icon: '🤫', apy: 15.0, minDeposit: 1, minInvest: 5, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 22000000, risk: 'medium', description: 'Earn on Secret Network flexibly' },
            { id: 'rose-savings', name: 'Flexible ROSE', token: 'ROSE', icon: '🌹', apy: 10.0, minDeposit: 10, minInvest: 5, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 35000000, risk: 'medium', description: 'Earn on Oasis flexibly' },

            // Cross-Chain Token Savings
            { id: 'rune-savings', name: 'Flexible RUNE', token: 'RUNE', icon: '⚡', apy: 8.0, minDeposit: 1, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 125000000, risk: 'medium', description: 'Earn on THORChain flexibly' },
            { id: 'axl-savings', name: 'Flexible AXL', token: 'AXL', icon: '🌐', apy: 6.5, minDeposit: 5, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 55000000, risk: 'medium', description: 'Earn on Axelar flexibly' },
            { id: 'stg-savings', name: 'Flexible STG', token: 'STG', icon: '⭐', apy: 8.0, minDeposit: 10, minInvest: 5, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 95000000, risk: 'medium', description: 'Earn on Stargate flexibly' },
            { id: 'w-savings', name: 'Flexible W', token: 'W', icon: '🕳️', apy: 12.0, minDeposit: 5, minInvest: 5, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 72000000, risk: 'medium-high', description: 'Earn on Wormhole flexibly' },

            // Storage Token Savings
            { id: 'fil-savings', name: 'Flexible FIL', token: 'FIL', icon: '📁', apy: 5.0, minDeposit: 1, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 115000000, risk: 'medium', description: 'Earn on Filecoin flexibly' },
            { id: 'ar-savings', name: 'Flexible AR', token: 'AR', icon: '🏛️', apy: 6.0, minDeposit: 0.1, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 65000000, risk: 'medium', description: 'Earn on Arweave flexibly' },
            { id: 'theta-savings', name: 'Flexible THETA', token: 'THETA', icon: '📺', apy: 4.5, minDeposit: 1, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 95000000, risk: 'medium', description: 'Earn on Theta flexibly' },

            // Move-Based L1 Savings
            { id: 'apt-savings', name: 'Flexible APT', token: 'APT', icon: '🔷', apy: 7.0, minDeposit: 1, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 155000000, risk: 'medium', description: 'Earn on Aptos flexibly' },
            { id: 'sui-savings', name: 'Flexible SUI', token: 'SUI', icon: '💧', apy: 5.5, minDeposit: 1, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 225000000, risk: 'medium', description: 'Earn on Sui flexibly' },
            { id: 'sei-savings', name: 'Flexible SEI', token: 'SEI', icon: '🌊', apy: 8.5, minDeposit: 10, minInvest: 5, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 115000000, risk: 'medium', description: 'Earn on Sei flexibly' },

            // New DeFi & Restaking Savings
            { id: 'morpho-savings', name: 'Flexible MORPHO', token: 'MORPHO', icon: '🦋', apy: 10.0, minDeposit: 5, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 65000000, risk: 'medium-high', description: 'Earn on Morpho flexibly' },
            { id: 'ethfi-savings', name: 'Flexible ETHFI', token: 'ETHFI', icon: '🔥', apy: 8.0, minDeposit: 5, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 95000000, risk: 'medium', description: 'Earn on ether.fi flexibly' },
            { id: 'puffer-savings', name: 'Flexible PUFFER', token: 'PUFFER', icon: '🐡', apy: 12.0, minDeposit: 10, minInvest: 5, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 48000000, risk: 'medium-high', description: 'Earn on Puffer flexibly' },
            { id: 'blast-savings', name: 'Flexible BLAST', token: 'BLAST', icon: '💥', apy: 15.0, minDeposit: 10, minInvest: 5, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 145000000, risk: 'high', description: 'Earn on Blast flexibly' },

            // Exchange Token Savings
            { id: 'bnb-savings', name: 'Flexible BNB', token: 'BNB', icon: '💛', apy: 3.5, minDeposit: 0.01, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: true, tvl: 650000000, risk: 'low', description: 'Earn on BNB flexibly' },
            { id: 'okb-savings', name: 'Flexible OKB', token: 'OKB', icon: '🔵', apy: 4.5, minDeposit: 0.1, minInvest: 10, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 145000000, risk: 'low-medium', description: 'Earn on OKB flexibly' },

            // Locked Premium Savings
            { id: 'locked-90d-apt', name: 'Locked APT 90d', token: 'APT', icon: '🔷', apy: 12.0, minDeposit: 5, minInvest: 50, lockPeriod: 90, withdrawalFee: 2, insurance: false, tvl: 85000000, risk: 'medium', description: '3-month APT lock' },
            { id: 'locked-90d-sui', name: 'Locked SUI 90d', token: 'SUI', icon: '💧', apy: 10.0, minDeposit: 10, minInvest: 50, lockPeriod: 90, withdrawalFee: 2, insurance: false, tvl: 125000000, risk: 'medium', description: '3-month SUI lock' },
            { id: 'locked-180d-rune', name: 'Locked RUNE 180d', token: 'RUNE', icon: '⚡', apy: 15.0, minDeposit: 5, minInvest: 50, lockPeriod: 180, withdrawalFee: 2.5, insurance: false, tvl: 72000000, risk: 'medium', description: '6-month RUNE lock' },
            { id: 'locked-180d-blast', name: 'Locked BLAST 180d', token: 'BLAST', icon: '💥', apy: 25.0, minDeposit: 50, minInvest: 25, lockPeriod: 180, withdrawalFee: 2.5, insurance: false, tvl: 95000000, risk: 'high', description: '6-month BLAST maximum yield' },
            { id: 'locked-365d-bnb', name: 'Locked BNB 365d', token: 'BNB', icon: '💛', apy: 8.0, minDeposit: 0.1, minInvest: 100, lockPeriod: 365, withdrawalFee: 3, insurance: true, tvl: 285000000, risk: 'low', description: '1-year BNB premium' },

            // Basket Savings
            { id: 'privacy-savings', name: 'Privacy Basket', token: 'MULTI', icon: '🔐', apy: 6.5, minDeposit: 20, minInvest: 20, lockPeriod: 0, withdrawalFee: 0.3, insurance: false, tvl: 42000000, risk: 'medium', description: 'ZEC, DASH, SCRT, ROSE blend' },
            { id: 'bridge-savings', name: 'Bridge Basket', token: 'MULTI', icon: '🌉', apy: 9.0, minDeposit: 20, minInvest: 20, lockPeriod: 0, withdrawalFee: 0.3, insurance: false, tvl: 75000000, risk: 'medium', description: 'RUNE, AXL, STG, W blend' },
            { id: 'storage-savings', name: 'Storage Basket', token: 'MULTI', icon: '💾', apy: 5.5, minDeposit: 20, minInvest: 20, lockPeriod: 0, withdrawalFee: 0.3, insurance: false, tvl: 55000000, risk: 'medium', description: 'FIL, AR, THETA blend' },
            { id: 'move-l1-savings', name: 'Move L1 Basket', token: 'MULTI', icon: '🚀', apy: 7.5, minDeposit: 20, minInvest: 20, lockPeriod: 0, withdrawalFee: 0.3, insurance: false, tvl: 125000000, risk: 'medium', description: 'APT, SUI, SEI blend' },
            { id: 'restaking-savings', name: 'Restaking Basket', token: 'MULTI', icon: '♻️', apy: 12.0, minDeposit: 20, minInvest: 20, lockPeriod: 0, withdrawalFee: 0.3, insurance: false, tvl: 85000000, risk: 'medium-high', description: 'ETHFI, PUFFER, REZ blend' },
            { id: 'cex-savings', name: 'CEX Token Basket', token: 'MULTI', icon: '🏦', apy: 4.0, minDeposit: 50, minInvest: 50, lockPeriod: 0, withdrawalFee: 0.2, insurance: false, tvl: 185000000, risk: 'low-medium', description: 'BNB, OKB, GT blend' },

            // === SAVINGS BATCH 7 - TERA EXPANSION ===
            // Liquid Restaking Token Savings
            { id: 'ezeth-savings', name: 'Flexible ezETH', token: 'ezETH', icon: '🔄', apy: 6.5, minDeposit: 0.01, minInvest: 50, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 285000000, risk: 'low-medium', description: 'Renzo liquid restaking yield' },
            { id: 'rseth-savings', name: 'Flexible rsETH', token: 'rsETH', icon: '♻️', apy: 6.0, minDeposit: 0.01, minInvest: 50, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 195000000, risk: 'low-medium', description: 'KelpDAO restaking yield' },
            { id: 'weeth-savings', name: 'Flexible weETH', token: 'weETH', icon: '🌊', apy: 5.8, minDeposit: 0.01, minInvest: 50, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 385000000, risk: 'low', description: 'ether.fi wrapped staking' },
            { id: 'pufeth-savings', name: 'Flexible pufETH', token: 'pufETH', icon: '🐡', apy: 7.0, minDeposit: 0.01, minInvest: 50, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 115000000, risk: 'low-medium', description: 'Puffer liquid restaking' },
            { id: 'sweth-savings', name: 'Flexible swETH', token: 'swETH', icon: '💧', apy: 5.5, minDeposit: 0.01, minInvest: 50, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 175000000, risk: 'low', description: 'Swell liquid staking' },

            // Perpetual DEX Governance Savings
            { id: 'hype-savings', name: 'Flexible HYPE', token: 'HYPE', icon: '🚀', apy: 12.0, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 145000000, risk: 'medium-high', description: 'Hyperliquid governance' },
            { id: 'vrtx-savings', name: 'Flexible VRTX', token: 'VRTX', icon: '🔺', apy: 9.5, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 75000000, risk: 'medium', description: 'Vertex protocol yield' },
            { id: 'apex-savings', name: 'Flexible APEX', token: 'APEX', icon: '🔼', apy: 8.5, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 52000000, risk: 'medium', description: 'ApeX Pro rewards' },

            // ZK L2 Savings
            { id: 'linea-savings', name: 'Flexible LINEA', token: 'LINEA', icon: '📐', apy: 7.5, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 115000000, risk: 'medium', description: 'Linea L2 savings' },
            { id: 'scroll-savings', name: 'Flexible SCROLL', token: 'SCROLL', icon: '📜', apy: 8.0, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 85000000, risk: 'medium', description: 'Scroll zkEVM yield' },
            { id: 'taiko-savings', name: 'Flexible TAIKO', token: 'TAIKO', icon: '🥁', apy: 9.0, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 75000000, risk: 'medium', description: 'Taiko based rollup' },
            { id: 'manta-savings', name: 'Flexible MANTA', token: 'MANTA', icon: '🐋', apy: 7.0, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 95000000, risk: 'medium', description: 'Manta network savings' },
            { id: 'mode-savings', name: 'Flexible MODE', token: 'MODE', icon: '🎮', apy: 8.5, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 55000000, risk: 'medium', description: 'Mode network yield' },

            // Solana Ecosystem Savings
            { id: 'pyth-savings', name: 'Flexible PYTH', token: 'PYTH', icon: '🐍', apy: 6.0, minDeposit: 1, minInvest: 15, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 165000000, risk: 'low-medium', description: 'Pyth oracle staking' },
            { id: 'w-savings', name: 'Flexible W', token: 'W', icon: '🌉', apy: 8.5, minDeposit: 1, minInvest: 15, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 245000000, risk: 'medium', description: 'Wormhole bridge yield' },
            { id: 'tnsr-savings', name: 'Flexible TNSR', token: 'TNSR', icon: '🎯', apy: 10.0, minDeposit: 1, minInvest: 15, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 85000000, risk: 'medium-high', description: 'Tensor NFT marketplace' },
            { id: 'kmno-savings', name: 'Flexible KMNO', token: 'KMNO', icon: '🎰', apy: 12.0, minDeposit: 1, minInvest: 15, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 105000000, risk: 'high', description: 'Kamino DeFi yield' },

            // Appchain & Modular Savings
            { id: 'dym-savings', name: 'Flexible DYM', token: 'DYM', icon: '🔮', apy: 7.5, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 95000000, risk: 'medium', description: 'Dymension rollapp hub' },
            { id: 'saga-savings', name: 'Flexible SAGA', token: 'SAGA', icon: '📖', apy: 8.5, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 75000000, risk: 'medium', description: 'Saga chainlet yield' },
            { id: 'alt-savings', name: 'Flexible ALT', token: 'ALT', icon: '🔷', apy: 9.0, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 105000000, risk: 'medium', description: 'AltLayer restaked rollups' },
            { id: 'avail-savings', name: 'Flexible AVAIL', token: 'AVAIL', icon: '✅', apy: 10.5, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 85000000, risk: 'medium-high', description: 'Avail DA layer' },
            { id: 'omni-savings', name: 'Flexible OMNI', token: 'OMNI', icon: '🌐', apy: 7.5, minDeposit: 1, minInvest: 20, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 55000000, risk: 'medium', description: 'Omni interop layer' },

            // AI Agents Savings
            { id: 'virtual-savings', name: 'Flexible VIRTUAL', token: 'VIRTUAL', icon: '🤖', apy: 15.0, minDeposit: 1, minInvest: 25, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 165000000, risk: 'high', description: 'Virtuals AI agents' },
            { id: 'ai16z-savings', name: 'Flexible AI16Z', token: 'AI16Z', icon: '🧠', apy: 22.0, minDeposit: 1, minInvest: 25, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 95000000, risk: 'high', description: 'AI16Z agent framework' },
            { id: 'griff-savings', name: 'Flexible GRIFF', token: 'GRIFF', icon: '🦅', apy: 18.0, minDeposit: 1, minInvest: 25, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 75000000, risk: 'high', description: 'Griffain AI agents' },
            { id: 'zerebro-savings', name: 'Flexible ZEREBRO', token: 'ZEREBRO', icon: '🧬', apy: 25.0, minDeposit: 1, minInvest: 25, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 55000000, risk: 'high', description: 'Zerebro autonomous AI' },
            { id: 'arc-savings', name: 'Flexible ARC', token: 'ARC', icon: '⚡', apy: 14.0, minDeposit: 1, minInvest: 25, lockPeriod: 0, withdrawalFee: 0, insurance: false, tvl: 45000000, risk: 'high', description: 'Arc AI infrastructure' },

            // Tera Locked Savings
            { id: 'locked-90d-ezeth', name: 'Locked ezETH 90d', token: 'ezETH', icon: '🔄', apy: 10.0, minDeposit: 0.1, minInvest: 100, lockPeriod: 90, withdrawalFee: 2, insurance: false, tvl: 145000000, risk: 'low-medium', description: '90-day restaking boost' },
            { id: 'locked-180d-weeth', name: 'Locked weETH 180d', token: 'weETH', icon: '🌊', apy: 12.0, minDeposit: 0.1, minInvest: 100, lockPeriod: 180, withdrawalFee: 2.5, insurance: false, tvl: 185000000, risk: 'low-medium', description: '6-month restaking premium' },
            { id: 'locked-365d-hype', name: 'Locked HYPE 365d', token: 'HYPE', icon: '🚀', apy: 25.0, minDeposit: 10, minInvest: 200, lockPeriod: 365, withdrawalFee: 3, insurance: false, tvl: 65000000, risk: 'high', description: '1-year Hyperliquid lock' },

            // Tera Basket Savings
            { id: 'lrt-basket', name: 'LRT Basket', token: 'MULTI', icon: '🔄', apy: 8.0, minDeposit: 50, minInvest: 50, lockPeriod: 0, withdrawalFee: 0.3, insurance: false, tvl: 125000000, risk: 'low-medium', description: 'ezETH, rsETH, weETH, pufETH blend' },
            { id: 'zk-l2-basket', name: 'ZK L2 Basket', token: 'MULTI', icon: '📐', apy: 9.5, minDeposit: 30, minInvest: 30, lockPeriod: 0, withdrawalFee: 0.3, insurance: false, tvl: 85000000, risk: 'medium', description: 'LINEA, SCROLL, TAIKO, MANTA blend' },
            { id: 'perp-dex-basket', name: 'Perp DEX Basket', token: 'MULTI', icon: '📈', apy: 12.0, minDeposit: 30, minInvest: 30, lockPeriod: 0, withdrawalFee: 0.3, insurance: false, tvl: 95000000, risk: 'medium-high', description: 'HYPE, VRTX, APEX, BLUE blend' },
            { id: 'modular-basket', name: 'Modular Basket', token: 'MULTI', icon: '🧱', apy: 10.0, minDeposit: 30, minInvest: 30, lockPeriod: 0, withdrawalFee: 0.3, insurance: false, tvl: 75000000, risk: 'medium', description: 'DYM, SAGA, ALT, AVAIL, OMNI blend' },
            { id: 'ai-agents-basket', name: 'AI Agents Basket', token: 'MULTI', icon: '🤖', apy: 20.0, minDeposit: 50, minInvest: 50, lockPeriod: 0, withdrawalFee: 0.5, insurance: false, tvl: 65000000, risk: 'high', description: 'VIRTUAL, AI16Z, GRIFF, ZEREBRO, ARC blend' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // COMBOS - Combined Investment Strategies
    // ═══════════════════════════════════════════════════════════════════════════
    combos: {
        products: [
            {
                id: 'balanced-growth',
                name: 'Balanced Growth Combo',
                icon: '⚖️',
                targetApy: 15.5,
                tvl: 250000000,
                risk: 'medium',
                minInvest: 100,
                allocation: [
                    { product: 'ETH Staking', type: 'staking', weight: 30, apy: 4.5 },
                    { product: 'Stable Optimizer', type: 'vault', weight: 25, apy: 12.4 },
                    { product: 'ETH/USDC Pool', type: 'pool', weight: 25, apy: 18.5 },
                    { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }
                ],
                description: 'Diversified strategy balancing growth and stability'
            },
            {
                id: 'yield-maximizer',
                name: 'Yield Maximizer Combo',
                icon: '🚀',
                targetApy: 45.0,
                tvl: 85000000,
                risk: 'high',
                minInvest: 250,
                allocation: [
                    { product: 'High Yield Degen', type: 'vault', weight: 30, apy: 85.0 },
                    { product: 'SOL/USDC Pool', type: 'pool', weight: 25, apy: 32.5 },
                    { product: 'Delta Neutral', type: 'vault', weight: 25, apy: 25.5 },
                    { product: 'ARB Yield Boost', type: 'vault', weight: 20, apy: 42.5 }
                ],
                description: 'Maximum yield strategy for risk-tolerant investors'
            },
            {
                id: 'safe-haven',
                name: 'Safe Haven Combo',
                icon: '🛡️',
                targetApy: 6.5,
                tvl: 450000000,
                risk: 'very-low',
                minInvest: 50,
                allocation: [
                    { product: 'USDC/USDT Pool', type: 'pool', weight: 35, apy: 8.2 },
                    { product: 'Locked USDC 90d', type: 'savings', weight: 30, apy: 7.0 },
                    { product: 'DAI Savings', type: 'savings', weight: 20, apy: 4.0 },
                    { product: 'RWA Yield', type: 'vault', weight: 15, apy: 9.5 }
                ],
                description: 'Capital preservation with stable yields'
            },
            {
                id: 'eth-maxi',
                name: 'ETH Maximalist Combo',
                icon: '⟠',
                targetApy: 12.8,
                tvl: 320000000,
                risk: 'medium',
                minInvest: 100,
                allocation: [
                    { product: 'ETH 2.0 Staking', type: 'staking', weight: 35, apy: 4.5 },
                    { product: 'ETH Yield Max', type: 'vault', weight: 25, apy: 15.8 },
                    { product: 'LRT Optimizer', type: 'vault', weight: 25, apy: 18.5 },
                    { product: 'ETH/stETH Pool', type: 'pool', weight: 15, apy: 5.8 }
                ],
                description: 'All-in on Ethereum ecosystem yield'
            },
            {
                id: 'sol-ecosystem',
                name: 'Solana Ecosystem Combo',
                icon: '◎',
                targetApy: 28.5,
                tvl: 145000000,
                risk: 'medium-high',
                minInvest: 100,
                allocation: [
                    { product: 'SOL Staking', type: 'staking', weight: 30, apy: 7.0 },
                    { product: 'SOL/USDC Pool', type: 'pool', weight: 30, apy: 32.5 },
                    { product: 'SOL Turbo Vault', type: 'vault', weight: 25, apy: 55.0 },
                    { product: 'JUP/USDC Pool', type: 'pool', weight: 15, apy: 65.0 }
                ],
                description: 'Capture Solana ecosystem growth'
            },
            {
                id: 'defi-blue-chip',
                name: 'DeFi Blue Chip Combo',
                icon: '💎',
                targetApy: 18.2,
                tvl: 180000000,
                risk: 'medium',
                minInvest: 150,
                allocation: [
                    { product: 'GLP Maximizer', type: 'vault', weight: 30, apy: 35.0 },
                    { product: 'LINK/ETH Pool', type: 'pool', weight: 25, apy: 22.8 },
                    { product: 'MKR/DAI Pool', type: 'pool', weight: 25, apy: 18.5 },
                    { product: 'Lend USDC', type: 'lending', weight: 20, apy: 8.5 }
                ],
                description: 'Established DeFi protocols for sustainable yield'
            },
            {
                id: 'layer2-play',
                name: 'Layer 2 Play Combo',
                icon: '⚡',
                targetApy: 38.5,
                tvl: 95000000,
                risk: 'high',
                minInvest: 200,
                allocation: [
                    { product: 'ARB/ETH Pool', type: 'pool', weight: 35, apy: 45.2 },
                    { product: 'ARB Yield Booster', type: 'vault', weight: 30, apy: 42.5 },
                    { product: 'PENDLE/ETH Pool', type: 'pool', weight: 20, apy: 55.0 },
                    { product: 'Pendle PT Optimizer', type: 'vault', weight: 15, apy: 28.0 }
                ],
                description: 'Bet on L2 scaling narrative'
            },
            {
                id: 'meme-degen',
                name: 'Meme Degen Combo',
                icon: '🐸',
                targetApy: 150.0,
                tvl: 25000000,
                risk: 'high',
                minInvest: 50,
                allocation: [
                    { product: 'Meme Hunter Vault', type: 'vault', weight: 35, apy: 250.0 },
                    { product: 'PEPE/ETH Pool', type: 'pool', weight: 30, apy: 185.5 },
                    { product: 'WIF/SOL Pool', type: 'pool', weight: 25, apy: 220.0 },
                    { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }
                ],
                description: 'High-risk meme token exposure with safety net'
            },
            {
                id: 'passive-income',
                name: 'Passive Income Combo',
                icon: '💰',
                targetApy: 9.5,
                tvl: 380000000,
                risk: 'low',
                minInvest: 100,
                allocation: [
                    { product: 'ETH 2.0 Staking', type: 'staking', weight: 25, apy: 4.5 },
                    { product: 'ADA Staking', type: 'staking', weight: 20, apy: 5.0 },
                    { product: 'Stable Optimizer', type: 'vault', weight: 30, apy: 12.4 },
                    { product: 'DAI Savings', type: 'savings', weight: 25, apy: 4.0 }
                ],
                description: 'Set and forget passive yield strategy'
            },
            {
                id: 'ai-narrative',
                name: 'AI Narrative Combo',
                icon: '🤖',
                targetApy: 35.0,
                tvl: 65000000,
                risk: 'high',
                minInvest: 150,
                allocation: [
                    { product: 'AI & Compute Index', type: 'index', weight: 40, apy: 25.0 },
                    { product: 'High Yield Degen', type: 'vault', weight: 25, apy: 85.0 },
                    { product: 'SOL Turbo Vault', type: 'vault', weight: 20, apy: 55.0 },
                    { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }
                ],
                description: 'Capture AI/crypto narrative with smart allocation'
            },
            // === NEW COMBOS BATCH ===
            { id: 'cosmos-ecosystem', name: 'Cosmos Ecosystem Combo', icon: '⚛', targetApy: 18.0, tvl: 85000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'ATOM Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'OSMO Staking', type: 'staking', weight: 25, apy: 10.0 }, { product: 'ATOM/OSMO Pool', type: 'pool', weight: 25, apy: 35.0 }, { product: 'TIA Staking', type: 'staking', weight: 20, apy: 12.0 }], description: 'Full Cosmos IBC ecosystem exposure' },
            { id: 'rwa-focused', name: 'RWA Focused Combo', icon: '🏢', targetApy: 12.0, tvl: 120000000, risk: 'low', minInvest: 500, allocation: [{ product: 'RWA Yield Vault', type: 'vault', weight: 35, apy: 9.5 }, { product: 'ONDO/USDC Pool', type: 'pool', weight: 25, apy: 42.5 }, { product: 'Locked USDC 90d', type: 'savings', weight: 25, apy: 7.0 }, { product: 'DAI Savings', type: 'savings', weight: 15, apy: 4.0 }], description: 'Real World Assets tokenized exposure' },
            { id: 'gaming-metaverse', name: 'Gaming & Metaverse Combo', icon: '🎮', targetApy: 42.0, tvl: 45000000, risk: 'high', minInvest: 100, allocation: [{ product: 'IMX/ETH Pool', type: 'pool', weight: 35, apy: 55.0 }, { product: 'BLUR/ETH Pool', type: 'pool', weight: 30, apy: 65.0 }, { product: 'High Yield Degen', type: 'vault', weight: 20, apy: 85.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'NFT and Gaming sector play' },
            { id: 'new-chains', name: 'New L1s Combo', icon: '🌟', targetApy: 55.0, tvl: 35000000, risk: 'high', minInvest: 150, allocation: [{ product: 'SUI/USDC Pool', type: 'pool', weight: 30, apy: 85.0 }, { product: 'SEI/USDC Pool', type: 'pool', weight: 25, apy: 95.0 }, { product: 'APT/USDC Pool', type: 'pool', weight: 25, apy: 48.5 }, { product: 'TIA/USDC Pool', type: 'pool', weight: 20, apy: 125.0 }], description: 'New generation L1 blockchains' },
            { id: 'stablecoin-yield', name: 'Stablecoin Yield Max', icon: '💵', targetApy: 12.0, tvl: 280000000, risk: 'very-low', minInvest: 100, allocation: [{ product: 'sUSDe Staking', type: 'savings', weight: 30, apy: 25.0 }, { product: 'Curve 3Pool Max', type: 'vault', weight: 30, apy: 15.0 }, { product: 'USDC/USDT Pool', type: 'pool', weight: 25, apy: 8.2 }, { product: 'Locked USDC 90d', type: 'savings', weight: 15, apy: 7.0 }], description: 'Maximum stablecoin yield with low risk' },
            { id: 'bitcoin-maximizer', name: 'BTC Maximizer Combo', icon: '₿', targetApy: 8.5, tvl: 180000000, risk: 'low-medium', minInvest: 200, allocation: [{ product: 'BTC Yield Plus', type: 'vault', weight: 35, apy: 12.0 }, { product: 'WBTC/ETH Pool', type: 'pool', weight: 30, apy: 12.3 }, { product: '1-Year BTC', type: 'savings', weight: 20, apy: 5.2 }, { product: 'STX Stacking', type: 'staking', weight: 15, apy: 8.0 }], description: 'Bitcoin-focused yield strategy' },
            { id: 'perpetuals-play', name: 'Perps Liquidity Combo', icon: '📈', targetApy: 32.0, tvl: 95000000, risk: 'medium', minInvest: 250, allocation: [{ product: 'Jupiter LP Vault', type: 'vault', weight: 35, apy: 38.0 }, { product: 'Hyperliquid Vault', type: 'vault', weight: 30, apy: 28.0 }, { product: 'GLP Maximizer', type: 'vault', weight: 25, apy: 35.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Perpetual DEX liquidity provision' },
            { id: 'liquid-staking', name: 'Liquid Staking Combo', icon: '💎', targetApy: 8.0, tvl: 320000000, risk: 'low', minInvest: 100, allocation: [{ product: 'stETH Staking', type: 'staking', weight: 35, apy: 4.0 }, { product: 'rETH Staking', type: 'staking', weight: 25, apy: 4.2 }, { product: 'LRT Optimizer', type: 'vault', weight: 25, apy: 18.5 }, { product: 'cbETH Staking', type: 'staking', weight: 15, apy: 3.8 }], description: 'Diversified liquid staking exposure' },
            { id: 'oracle-infra', name: 'Oracle & Infra Combo', icon: '🔮', targetApy: 22.0, tvl: 65000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'LINK Oracle Vault', type: 'vault', weight: 35, apy: 15.0 }, { product: 'PYTH/USDC Pool', type: 'pool', weight: 30, apy: 55.0 }, { product: 'LINK/ETH Pool', type: 'pool', weight: 25, apy: 22.8 }, { product: 'LINK Staking', type: 'staking', weight: 10, apy: 5.0 }], description: 'Oracle and infrastructure tokens' },
            { id: 'injective-play', name: 'Injective Ecosystem', icon: '💉', targetApy: 45.0, tvl: 42000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'INJ Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'INJ/USDT Pool', type: 'pool', weight: 30, apy: 52.0 }, { product: 'INJ Perp Yield', type: 'vault', weight: 25, apy: 55.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Full Injective Protocol exposure' },
            // === COMBOS BATCH 2 ===
            { id: 'ton-ecosystem', name: 'TON Ecosystem Combo', icon: '💎', targetApy: 18.0, tvl: 55000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'TON Staking', type: 'staking', weight: 40, apy: 4.5 }, { product: 'TON/USDT Pool', type: 'pool', weight: 35, apy: 42.0 }, { product: 'TON Savings', type: 'savings', weight: 25, apy: 4.0 }], description: 'Telegram ecosystem exposure' },
            { id: 'base-defi', name: 'Base DeFi Combo', icon: '🔵', targetApy: 28.0, tvl: 45000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'Base Maximizer', type: 'vault', weight: 40, apy: 35.0 }, { product: 'ETH Yield Max', type: 'vault', weight: 30, apy: 15.8 }, { product: 'USDC Savings', type: 'savings', weight: 30, apy: 3.0 }], description: 'Coinbase L2 ecosystem' },
            { id: 'privacy-focused', name: 'Privacy Focused Combo', icon: '🔒', targetApy: 15.0, tvl: 28000000, risk: 'medium-high', minInvest: 200, allocation: [{ product: 'Privacy Index', type: 'index', weight: 50, apy: 8.0 }, { product: 'ETH Staking', type: 'staking', weight: 30, apy: 4.5 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Privacy-preserving assets' },
            { id: 'dex-native', name: 'DEX Native Tokens', icon: '🦄', targetApy: 25.0, tvl: 65000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'UNI/ETH Pool', type: 'pool', weight: 30, apy: 25.0 }, { product: 'CRV/ETH Pool', type: 'pool', weight: 25, apy: 28.5 }, { product: 'BAL/ETH Pool', type: 'pool', weight: 25, apy: 28.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'DEX governance tokens' },
            { id: 'airdrop-farmer', name: 'Airdrop Farmer Combo', icon: '🪂', targetApy: 35.0, tvl: 35000000, risk: 'high', minInvest: 500, allocation: [{ product: 'EigenLayer Restaking', type: 'vault', weight: 30, apy: 8.0 }, { product: 'Renzo ezETH Vault', type: 'vault', weight: 25, apy: 12.0 }, { product: 'EtherFi eETH Vault', type: 'vault', weight: 25, apy: 10.5 }, { product: 'Puffer pufETH Vault', type: 'vault', weight: 20, apy: 11.0 }], description: 'Points farming + potential airdrops' },
            { id: 'real-yield', name: 'Real Yield Combo', icon: '💵', targetApy: 15.0, tvl: 125000000, risk: 'low-medium', minInvest: 200, allocation: [{ product: 'GLP Maximizer', type: 'vault', weight: 35, apy: 35.0 }, { product: 'Jupiter LP Vault', type: 'vault', weight: 25, apy: 38.0 }, { product: 'ETH/stETH Pool', type: 'pool', weight: 20, apy: 5.8 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Protocol revenue share yield' },
            { id: 'modular-chains', name: 'Modular Chains Combo', icon: '🧱', targetApy: 65.0, tvl: 25000000, risk: 'high', minInvest: 200, allocation: [{ product: 'TIA Staking', type: 'staking', weight: 35, apy: 12.0 }, { product: 'TIA/USDC Pool', type: 'pool', weight: 30, apy: 125.0 }, { product: 'DYM/USDC Pool', type: 'pool', weight: 20, apy: 120.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Celestia + Dymension ecosystem' },
            { id: 'avax-ecosystem', name: 'Avalanche Ecosystem', icon: '🔺', targetApy: 22.0, tvl: 75000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'AVAX Staking', type: 'staking', weight: 35, apy: 8.0 }, { product: 'AVAX/USDC Pool', type: 'pool', weight: 30, apy: 28.5 }, { product: 'AVAX Turbo Vault', type: 'vault', weight: 20, apy: 28.0 }, { product: 'AVAX Savings', type: 'savings', weight: 15, apy: 4.0 }], description: 'Full Avalanche ecosystem' },
            { id: 'stablecoin-diversified', name: 'Stablecoin Diversified', icon: '🏦', targetApy: 8.5, tvl: 450000000, risk: 'very-low', minInvest: 50, allocation: [{ product: 'USDC/USDT Pool', type: 'pool', weight: 25, apy: 8.2 }, { product: 'DAI/USDC Pool', type: 'pool', weight: 25, apy: 6.5 }, { product: 'FRAX/USDC Pool', type: 'pool', weight: 25, apy: 7.2 }, { product: 'USDC Savings', type: 'savings', weight: 25, apy: 3.0 }], description: 'Multi-stablecoin diversification' },
            { id: 'polkadot-ecosystem', name: 'Polkadot Ecosystem', icon: '●', targetApy: 15.0, tvl: 45000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'DOT Staking', type: 'staking', weight: 45, apy: 12.0 }, { product: 'KSM Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'DOT Savings', type: 'savings', weight: 25, apy: 4.5 }], description: 'Polkadot + Kusama exposure' },
            { id: 'lending-optimizer', name: 'Lending Optimizer Combo', icon: '🏛️', targetApy: 10.0, tvl: 180000000, risk: 'low', minInvest: 100, allocation: [{ product: 'Morpho USDC Optimizer', type: 'vault', weight: 35, apy: 12.0 }, { product: 'Morpho ETH Optimizer', type: 'vault', weight: 25, apy: 8.5 }, { product: 'Lend USDC', type: 'lending', weight: 25, apy: 8.5 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Optimized lending yields' },
            { id: 'mev-maximizer', name: 'MEV Maximizer Combo', icon: '⚡', targetApy: 12.0, tvl: 85000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'JitoSOL Staking', type: 'staking', weight: 40, apy: 7.5 }, { product: 'SOL Staking', type: 'staking', weight: 30, apy: 7.0 }, { product: 'SOL Turbo Vault', type: 'vault', weight: 30, apy: 55.0 }], description: 'MEV-boosted staking yields' },
            // === COMBOS BATCH 3 ===
            { id: 'zk-rollup', name: 'ZK Rollup Combo', icon: '🔐', targetApy: 48.0, tvl: 32000000, risk: 'high', minInvest: 200, allocation: [{ product: 'STRK/ETH Pool', type: 'pool', weight: 35, apy: 75.0 }, { product: 'ZK/ETH Pool', type: 'pool', weight: 30, apy: 55.0 }, { product: 'MANTA/ETH Pool', type: 'pool', weight: 20, apy: 65.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Zero-knowledge rollup exposure' },
            { id: 'eigenlayer-maxi', name: 'EigenLayer Maxi Combo', icon: '🔄', targetApy: 15.0, tvl: 145000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'EigenLayer Restaking', type: 'vault', weight: 30, apy: 8.0 }, { product: 'Renzo ezETH Vault', type: 'vault', weight: 25, apy: 12.0 }, { product: 'EtherFi eETH Vault', type: 'vault', weight: 25, apy: 10.5 }, { product: 'Kelp rsETH Vault', type: 'vault', weight: 20, apy: 9.5 }], description: 'Maximum restaking exposure' },
            { id: 'pendle-yield', name: 'Pendle Yield Combo', icon: '📊', targetApy: 28.0, tvl: 85000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'Pendle PT-ETH Vault', type: 'vault', weight: 35, apy: 18.0 }, { product: 'Pendle LP Vault', type: 'vault', weight: 30, apy: 25.0 }, { product: 'PENDLE/ETH Pool', type: 'pool', weight: 20, apy: 55.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Yield tokenization strategy' },
            { id: 'gmx-ecosystem', name: 'GMX Ecosystem Combo', icon: '🔷', targetApy: 22.0, tvl: 95000000, risk: 'medium', minInvest: 200, allocation: [{ product: 'GMX GLP Vault', type: 'vault', weight: 40, apy: 22.0 }, { product: 'GMX GM-ETH Vault', type: 'vault', weight: 30, apy: 18.5 }, { product: 'GMX GM-BTC Vault', type: 'vault', weight: 30, apy: 15.5 }], description: 'Full GMX v1 + v2 exposure' },
            { id: 'near-ecosystem', name: 'NEAR Ecosystem Combo', icon: '🌈', targetApy: 20.0, tvl: 45000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'NEAR Staking', type: 'staking', weight: 40, apy: 9.5 }, { product: 'NEAR/USDC Pool', type: 'pool', weight: 35, apy: 38.5 }, { product: 'NEAR Savings', type: 'savings', weight: 25, apy: 5.5 }], description: 'NEAR Protocol ecosystem' },
            { id: 'aptos-ecosystem', name: 'Aptos Ecosystem Combo', icon: '🔷', targetApy: 32.0, tvl: 38000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'APT Staking', type: 'staking', weight: 35, apy: 7.0 }, { product: 'APT/USDC Pool', type: 'pool', weight: 35, apy: 48.5 }, { product: 'APT Yield Vault', type: 'vault', weight: 30, apy: 35.0 }], description: 'Aptos Move chain ecosystem' },
            { id: 'arbitrum-defi', name: 'Arbitrum DeFi Combo', icon: '🔵', targetApy: 35.0, tvl: 125000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'ARB/ETH Pool', type: 'pool', weight: 30, apy: 45.2 }, { product: 'GMX GLP Vault', type: 'vault', weight: 25, apy: 22.0 }, { product: 'ARB Yield Booster', type: 'vault', weight: 25, apy: 42.5 }, { product: 'ARB Savings', type: 'savings', weight: 20, apy: 4.5 }], description: 'Arbitrum native DeFi' },
            { id: 'optimism-defi', name: 'Optimism DeFi Combo', icon: '🔴', targetApy: 30.0, tvl: 85000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'OP/ETH Pool', type: 'pool', weight: 35, apy: 38.0 }, { product: 'Velo/USDC Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'OP Savings', type: 'savings', weight: 20, apy: 4.2 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Optimism native DeFi' },
            { id: 'bnb-defi', name: 'BNB Chain DeFi Combo', icon: '💛', targetApy: 18.0, tvl: 165000000, risk: 'low-medium', minInvest: 50, allocation: [{ product: 'BNB Staking', type: 'staking', weight: 35, apy: 3.5 }, { product: 'BNB/USDT Pool', type: 'pool', weight: 30, apy: 18.5 }, { product: 'CAKE Yield Vault', type: 'vault', weight: 20, apy: 45.0 }, { product: 'USDT Savings', type: 'savings', weight: 15, apy: 5.0 }], description: 'Binance Smart Chain ecosystem' },
            { id: 'fantom-ecosystem', name: 'Fantom Ecosystem Combo', icon: '👻', targetApy: 38.0, tvl: 28000000, risk: 'high', minInvest: 100, allocation: [{ product: 'FTM Staking', type: 'staking', weight: 30, apy: 12.0 }, { product: 'FTM/USDC Pool', type: 'pool', weight: 35, apy: 55.0 }, { product: 'FTM Savings', type: 'savings', weight: 20, apy: 6.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Fantom Opera ecosystem' },
            { id: 'usde-maximizer', name: 'USDe Maximizer Combo', icon: '💰', targetApy: 22.0, tvl: 185000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'sUSDe Staking', type: 'savings', weight: 40, apy: 25.0 }, { product: 'USDe Savings', type: 'savings', weight: 30, apy: 15.0 }, { product: 'USDe/USDC Pool', type: 'pool', weight: 30, apy: 12.0 }], description: 'Ethena USDe yield optimization' },
            { id: 'cross-chain', name: 'Cross-Chain Combo', icon: '🌉', targetApy: 25.0, tvl: 55000000, risk: 'medium-high', minInvest: 200, allocation: [{ product: 'W/ETH Pool', type: 'pool', weight: 35, apy: 42.0 }, { product: 'STG/ETH Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'LINK Oracle Vault', type: 'vault', weight: 20, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Bridge and interoperability tokens' },
            { id: 'convex-curve', name: 'Convex-Curve Combo', icon: '🔴', targetApy: 18.0, tvl: 145000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'Convex CRV Max', type: 'vault', weight: 40, apy: 22.0 }, { product: 'Curve 3Pool Max', type: 'vault', weight: 30, apy: 15.0 }, { product: 'CRV/ETH Pool', type: 'pool', weight: 20, apy: 28.5 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Curve Wars yield strategy' },
            { id: 'defi-bluechip', name: 'DeFi Blue Chip Combo', icon: '💎', targetApy: 12.0, tvl: 280000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'UNI/ETH Pool', type: 'pool', weight: 25, apy: 25.0 }, { product: 'AAVE Staking', type: 'staking', weight: 25, apy: 6.5 }, { product: 'MKR/ETH Pool', type: 'pool', weight: 25, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 25, apy: 3.0 }], description: 'Established DeFi protocols' },
            { id: 'solana-defi', name: 'Solana DeFi Max Combo', icon: '◎', targetApy: 45.0, tvl: 95000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'Jupiter JLP Vault', type: 'vault', weight: 35, apy: 28.0 }, { product: 'SOL Turbo Vault', type: 'vault', weight: 25, apy: 55.0 }, { product: 'JitoSOL Staking', type: 'staking', weight: 25, apy: 7.5 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Maximum Solana DeFi exposure' },
            // === COMBOS BATCH 4 - MEGA ===
            { id: 'blast-ecosystem', name: 'Blast Ecosystem Combo', icon: '💥', targetApy: 55.0, tvl: 45000000, risk: 'high', minInvest: 200, allocation: [{ product: 'BLAST/ETH Pool', type: 'pool', weight: 35, apy: 85.0 }, { product: 'BLAST Native Vault', type: 'vault', weight: 30, apy: 45.0 }, { product: 'BLAST Savings', type: 'savings', weight: 20, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Full Blast L2 ecosystem' },
            { id: 'scroll-ecosystem', name: 'Scroll Ecosystem Combo', icon: '📜', targetApy: 42.0, tvl: 35000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'SCROLL/ETH Pool', type: 'pool', weight: 35, apy: 62.0 }, { product: 'Scroll Native Vault', type: 'vault', weight: 30, apy: 35.0 }, { product: 'SCROLL Savings', type: 'savings', weight: 20, apy: 6.5 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Scroll zkEVM ecosystem' },
            { id: 'mode-ecosystem', name: 'Mode Ecosystem Combo', icon: '🟢', targetApy: 50.0, tvl: 28000000, risk: 'high', minInvest: 200, allocation: [{ product: 'MODE/ETH Pool', type: 'pool', weight: 40, apy: 75.0 }, { product: 'Mode Native Vault', type: 'vault', weight: 30, apy: 42.0 }, { product: 'MODE Savings', type: 'savings', weight: 30, apy: 8.5 }], description: 'Mode Network ecosystem' },
            { id: 'linea-ecosystem', name: 'Linea Ecosystem Combo', icon: '⚡', targetApy: 38.0, tvl: 42000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'Linea Native Vault', type: 'vault', weight: 40, apy: 35.0 }, { product: 'ETH/USDC Pool', type: 'pool', weight: 35, apy: 45.0 }, { product: 'ETH Savings', type: 'savings', weight: 25, apy: 2.8 }], description: 'Linea zkEVM by Consensys' },
            { id: 'helium-ecosystem', name: 'Helium IoT Combo', icon: '📡', targetApy: 25.0, tvl: 32000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'HNT Staking', type: 'staking', weight: 40, apy: 8.0 }, { product: 'MOBILE Staking', type: 'staking', weight: 25, apy: 35.0 }, { product: 'IOT Staking', type: 'staking', weight: 20, apy: 28.0 }, { product: 'HNT Savings', type: 'savings', weight: 15, apy: 4.5 }], description: 'Helium decentralized wireless' },
            { id: 'thorchain-ecosystem', name: 'THORChain Combo', icon: '⚡', targetApy: 28.0, tvl: 65000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'RUNE Staking', type: 'staking', weight: 45, apy: 15.0 }, { product: 'RUNE/ETH Pool', type: 'pool', weight: 30, apy: 45.0 }, { product: 'RUNE Savings', type: 'savings', weight: 25, apy: 4.0 }], description: 'Cross-chain liquidity' },
            { id: 'kujira-ecosystem', name: 'Kujira Ecosystem Combo', icon: '🐋', targetApy: 22.0, tvl: 25000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'KUJI Staking', type: 'staking', weight: 40, apy: 12.0 }, { product: 'USK Vault', type: 'vault', weight: 30, apy: 18.0 }, { product: 'KUJI Savings', type: 'savings', weight: 30, apy: 5.5 }], description: 'Kujira Cosmos ecosystem' },
            { id: 'akash-cloud', name: 'Akash Cloud Combo', icon: '☁️', targetApy: 25.0, tvl: 28000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'AKT Staking', type: 'staking', weight: 50, apy: 18.0 }, { product: 'AKT/ATOM Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'AKT Savings', type: 'savings', weight: 20, apy: 5.8 }], description: 'Decentralized cloud computing' },
            { id: 'meme-degen', name: 'Meme Degen Combo', icon: '🎰', targetApy: 85.0, tvl: 35000000, risk: 'high', minInvest: 50, allocation: [{ product: 'DEGEN/ETH Pool', type: 'pool', weight: 25, apy: 120.0 }, { product: 'WIF/SOL Pool', type: 'pool', weight: 25, apy: 95.0 }, { product: 'BONK/SOL Pool', type: 'pool', weight: 25, apy: 85.0 }, { product: 'PEPE/ETH Pool', type: 'pool', weight: 25, apy: 75.0 }], description: 'High-risk meme exposure' },
            { id: 'lrt-maximizer', name: 'LRT Maximizer Combo', icon: '🔄', targetApy: 18.0, tvl: 185000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'EigenLayer Restaking', type: 'vault', weight: 30, apy: 8.0 }, { product: 'Renzo ezETH Vault', type: 'vault', weight: 25, apy: 12.0 }, { product: 'Puffer pufETH Vault', type: 'vault', weight: 25, apy: 10.0 }, { product: 'Kelp rsETH Vault', type: 'vault', weight: 20, apy: 9.5 }], description: 'Liquid Restaking Tokens' },
            { id: 'points-meta', name: 'Points Meta Combo', icon: '✨', targetApy: 35.0, tvl: 125000000, risk: 'medium-high', minInvest: 200, allocation: [{ product: 'EigenLayer Points', type: 'vault', weight: 30, apy: 8.0 }, { product: 'Blast Points', type: 'vault', weight: 25, apy: 45.0 }, { product: 'Mode Points', type: 'vault', weight: 25, apy: 42.0 }, { product: 'Scroll Points', type: 'vault', weight: 20, apy: 35.0 }], description: 'Airdrop points farming' },
            { id: 'ai-tokens', name: 'AI Tokens Combo', icon: '🤖', targetApy: 32.0, tvl: 55000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'FET/ETH Pool', type: 'pool', weight: 30, apy: 45.0 }, { product: 'RNDR/ETH Pool', type: 'pool', weight: 25, apy: 38.0 }, { product: 'AKT Staking', type: 'staking', weight: 25, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'AI infrastructure tokens' },
            { id: 'gaming-tokens', name: 'GameFi Combo', icon: '🎮', targetApy: 28.0, tvl: 42000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'IMX/ETH Pool', type: 'pool', weight: 30, apy: 38.0 }, { product: 'AXS Staking', type: 'staking', weight: 25, apy: 25.0 }, { product: 'SAND/ETH Pool', type: 'pool', weight: 25, apy: 32.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Gaming and metaverse' },
            { id: 'depin-combo', name: 'DePIN Combo', icon: '📡', targetApy: 30.0, tvl: 38000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'HNT Staking', type: 'staking', weight: 30, apy: 8.0 }, { product: 'RNDR/ETH Pool', type: 'pool', weight: 25, apy: 38.0 }, { product: 'FIL Lending', type: 'lending', weight: 25, apy: 4.5 }, { product: 'AR Lending', type: 'lending', weight: 20, apy: 4.0 }], description: 'Decentralized infrastructure' },
            { id: 'stablecoin-yield', name: 'Stablecoin Yield Max', icon: '💰', targetApy: 18.0, tvl: 350000000, risk: 'low', minInvest: 50, allocation: [{ product: 'sUSDe Savings', type: 'savings', weight: 35, apy: 25.0 }, { product: 'USDC/USDT Pool', type: 'pool', weight: 25, apy: 8.2 }, { product: 'crvUSD Savings', type: 'savings', weight: 20, apy: 8.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Maximum stablecoin yield' },
            { id: 'eth-lsd-max', name: 'ETH LSD Maximum', icon: '⟠', targetApy: 12.0, tvl: 280000000, risk: 'low', minInvest: 100, allocation: [{ product: 'stETH Staking', type: 'staking', weight: 35, apy: 4.0 }, { product: 'rETH Staking', type: 'staking', weight: 25, apy: 3.8 }, { product: 'frxETH Vault', type: 'vault', weight: 25, apy: 6.5 }, { product: 'cbETH Staking', type: 'staking', weight: 15, apy: 3.5 }], description: 'ETH liquid staking' },
            { id: 'btc-yield', name: 'BTC Yield Combo', icon: '₿', targetApy: 8.0, tvl: 185000000, risk: 'low', minInvest: 100, allocation: [{ product: 'WBTC Lending', type: 'lending', weight: 40, apy: 3.5 }, { product: 'WBTC/ETH Pool', type: 'pool', weight: 30, apy: 12.0 }, { product: 'WBTC Savings', type: 'savings', weight: 30, apy: 2.0 }], description: 'Bitcoin yield generation' },
            { id: 'perp-dex', name: 'Perp DEX Combo', icon: '📊', targetApy: 32.0, tvl: 85000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'GMX GLP Vault', type: 'vault', weight: 35, apy: 22.0 }, { product: 'Jupiter JLP Vault', type: 'vault', weight: 30, apy: 28.0 }, { product: 'Hyperliquid HLP Vault', type: 'vault', weight: 20, apy: 35.0 }, { product: 'dYdX Savings', type: 'savings', weight: 15, apy: 4.2 }], description: 'Perpetual DEX exposure' },
            { id: 've-defi', name: 've-DeFi Combo', icon: '🔒', targetApy: 28.0, tvl: 95000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'CRV/ETH Pool', type: 'pool', weight: 30, apy: 28.5 }, { product: 'Convex CRV Max', type: 'vault', weight: 30, apy: 22.0 }, { product: 'VELO/USDC Pool', type: 'pool', weight: 25, apy: 35.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 've-tokenomics exposure' },
            { id: 'cosmos-defi', name: 'Cosmos DeFi Combo', icon: '⚛️', targetApy: 22.0, tvl: 55000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'ATOM Staking', type: 'staking', weight: 35, apy: 15.0 }, { product: 'OSMO Staking', type: 'staking', weight: 25, apy: 12.0 }, { product: 'NTRN Savings', type: 'savings', weight: 20, apy: 6.5 }, { product: 'KUJI Savings', type: 'savings', weight: 20, apy: 5.5 }], description: 'Cosmos ecosystem DeFi' },
            { id: 'rwa-yield', name: 'RWA Yield Combo', icon: '🏛️', targetApy: 10.0, tvl: 145000000, risk: 'low', minInvest: 100, allocation: [{ product: 'Steakhouse USDC', type: 'vault', weight: 35, apy: 12.0 }, { product: 'MKR/ETH Pool', type: 'pool', weight: 25, apy: 15.0 }, { product: 'ONDO Savings', type: 'savings', weight: 25, apy: 5.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Real World Assets yield' },
            { id: 'new-l1', name: 'New L1 Combo', icon: '🔷', targetApy: 35.0, tvl: 48000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'SUI Staking', type: 'staking', weight: 30, apy: 4.5 }, { product: 'SEI Staking', type: 'staking', weight: 25, apy: 5.0 }, { product: 'APT Staking', type: 'staking', weight: 25, apy: 7.0 }, { product: 'INJ Staking', type: 'staking', weight: 20, apy: 15.0 }], description: 'New Layer 1 chains' },
            { id: 'oracle-infra', name: 'Oracle Infrastructure', icon: '🔗', targetApy: 15.0, tvl: 75000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'LINK Staking', type: 'staking', weight: 40, apy: 5.5 }, { product: 'PYTH Staking', type: 'staking', weight: 30, apy: 8.0 }, { product: 'LINK Savings', type: 'savings', weight: 30, apy: 2.5 }], description: 'Oracle providers' },
            { id: 'privacy-coins', name: 'Privacy Combo', icon: '🔐', targetApy: 12.0, tvl: 25000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'ZEC/ETH Pool', type: 'pool', weight: 40, apy: 18.0 }, { product: 'XMR Savings', type: 'savings', weight: 35, apy: 5.0 }, { product: 'USDC Savings', type: 'savings', weight: 25, apy: 3.0 }], description: 'Privacy-focused assets' },
            { id: 'bridge-tokens', name: 'Bridge Tokens Combo', icon: '🌉', targetApy: 35.0, tvl: 42000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'W/ETH Pool', type: 'pool', weight: 35, apy: 42.0 }, { product: 'STG/ETH Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'ACROSS/ETH Pool', type: 'pool', weight: 20, apy: 38.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Cross-chain bridges' },
            { id: 'base-native', name: 'Base Native Combo', icon: '🔵', targetApy: 45.0, tvl: 65000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'AERO/USDC Pool', type: 'pool', weight: 40, apy: 58.0 }, { product: 'DEGEN/ETH Pool', type: 'pool', weight: 30, apy: 85.0 }, { product: 'BRETT/ETH Pool', type: 'pool', weight: 20, apy: 65.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Base ecosystem native' },
            { id: 'arb-native', name: 'Arbitrum Native Combo', icon: '🔵', targetApy: 38.0, tvl: 95000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'ARB/ETH Pool', type: 'pool', weight: 30, apy: 45.2 }, { product: 'GMX GLP Vault', type: 'vault', weight: 25, apy: 22.0 }, { product: 'GRAIL/ETH Pool', type: 'pool', weight: 25, apy: 55.0 }, { product: 'ARB Savings', type: 'savings', weight: 20, apy: 4.5 }], description: 'Arbitrum native protocols' },
            { id: 'op-native', name: 'Optimism Native Combo', icon: '🔴', targetApy: 35.0, tvl: 75000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'OP/ETH Pool', type: 'pool', weight: 30, apy: 38.0 }, { product: 'VELO/USDC Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'OP Savings', type: 'savings', weight: 25, apy: 4.2 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Optimism native protocols' },
            { id: 'polygon-native', name: 'Polygon Native Combo', icon: '⬡', targetApy: 25.0, tvl: 85000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'MATIC Staking', type: 'staking', weight: 35, apy: 5.0 }, { product: 'MATIC/ETH Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'MATIC Savings', type: 'savings', weight: 20, apy: 3.8 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Polygon ecosystem' },
            { id: 'avax-native', name: 'Avalanche Native Combo', icon: '🔺', targetApy: 22.0, tvl: 68000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'AVAX Staking', type: 'staking', weight: 35, apy: 8.0 }, { product: 'AVAX/USDC Pool', type: 'pool', weight: 30, apy: 32.0 }, { product: 'AVAX Savings', type: 'savings', weight: 20, apy: 3.5 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Avalanche ecosystem' },
            // === COMBOS BATCH 5 - ULTRA ===
            { id: 'sommelier-strategies', name: 'Sommelier Strategies', icon: '🍷', targetApy: 22.0, tvl: 85000000, risk: 'medium', minInvest: 200, allocation: [{ product: 'Sommelier ETH Vault', type: 'vault', weight: 35, apy: 18.0 }, { product: 'Sommelier USDC Vault', type: 'vault', weight: 30, apy: 15.0 }, { product: 'ETH Staking', type: 'staking', weight: 20, apy: 4.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Sommelier managed vaults' },
            { id: 'options-vault', name: 'Options Vault Combo', icon: '🎀', targetApy: 28.0, tvl: 65000000, risk: 'medium-high', minInvest: 300, allocation: [{ product: 'Ribbon ETH Covered Call', type: 'vault', weight: 30, apy: 25.0 }, { product: 'Ribbon ETH Put Sell', type: 'vault', weight: 25, apy: 22.0 }, { product: 'Opyn Crab Strategy', type: 'vault', weight: 25, apy: 18.0 }, { product: 'ETH Staking', type: 'staking', weight: 20, apy: 4.0 }], description: 'Options strategies' },
            { id: 'delta-neutral', name: 'Delta Neutral Combo', icon: '⚖️', targetApy: 15.0, tvl: 95000000, risk: 'low-medium', minInvest: 250, allocation: [{ product: 'Polynomial Delta Neutral', type: 'vault', weight: 35, apy: 12.0 }, { product: 'Rage Delta Neutral', type: 'vault', weight: 30, apy: 15.0 }, { product: 'Umami Delta Neutral', type: 'vault', weight: 20, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Market neutral yields' },
            { id: 'lrt-restaking', name: 'LRT Restaking Max', icon: '🔄', targetApy: 16.0, tvl: 245000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'YieldNest ynETH', type: 'vault', weight: 25, apy: 12.0 }, { product: 'Mellow rsETH', type: 'vault', weight: 25, apy: 11.0 }, { product: 'Inception inETH', type: 'vault', weight: 25, apy: 13.0 }, { product: 'Bedrock uniETH', type: 'vault', weight: 25, apy: 10.5 }], description: 'LRT restaking diversified' },
            { id: 'jones-dao', name: 'Jones DAO Combo', icon: '🃏', targetApy: 35.0, tvl: 45000000, risk: 'medium-high', minInvest: 200, allocation: [{ product: 'Jones jGLP Vault', type: 'vault', weight: 40, apy: 35.0 }, { product: 'Jones jUSDC Vault', type: 'vault', weight: 30, apy: 25.0 }, { product: 'GMX Staking', type: 'staking', weight: 20, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Jones DAO strategies' },
            { id: 'concentrated-lp', name: 'Concentrated LP Combo', icon: '🏛️', targetApy: 42.0, tvl: 75000000, risk: 'medium-high', minInvest: 200, allocation: [{ product: 'Arrakis ETH/USDC', type: 'vault', weight: 35, apy: 25.0 }, { product: 'Gamma ETH/USDC', type: 'vault', weight: 30, apy: 28.0 }, { product: 'Bunni WBTC/ETH', type: 'vault', weight: 20, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Concentrated liquidity' },
            { id: 'dopex-options', name: 'Dopex Options Combo', icon: '🐲', targetApy: 45.0, tvl: 28000000, risk: 'high', minInvest: 300, allocation: [{ product: 'Dopex Atlantic ETH', type: 'vault', weight: 35, apy: 55.0 }, { product: 'Dopex Atlantic ARB', type: 'vault', weight: 30, apy: 48.0 }, { product: 'Dopex rDPX Vault', type: 'vault', weight: 20, apy: 35.0 }, { product: 'ETH Staking', type: 'staking', weight: 15, apy: 4.0 }], description: 'Dopex options vaults' },
            { id: 'leveraged-glp', name: 'Leveraged GLP Combo', icon: '📈', targetApy: 55.0, tvl: 35000000, risk: 'high', minInvest: 250, allocation: [{ product: 'Jones jGLP Vault', type: 'vault', weight: 40, apy: 35.0 }, { product: 'Rage GLP Vault', type: 'vault', weight: 30, apy: 28.0 }, { product: 'Umami GLP Vault', type: 'vault', weight: 20, apy: 25.0 }, { product: 'GMX Staking', type: 'staking', weight: 10, apy: 12.0 }], description: 'Leveraged GLP exposure' },
            { id: 'btc-yield-max', name: 'BTC Yield Maximum', icon: '₿', targetApy: 12.0, tvl: 145000000, risk: 'low-medium', minInvest: 200, allocation: [{ product: 'Solv BTC Vault', type: 'vault', weight: 35, apy: 8.0 }, { product: 'WBTC/ETH Pool', type: 'pool', weight: 25, apy: 12.0 }, { product: 'WBTC Lending', type: 'lending', weight: 25, apy: 3.5 }, { product: 'WBTC Savings', type: 'savings', weight: 15, apy: 2.5 }], description: 'Maximum BTC yield' },
            { id: 'overnight-stable', name: 'Overnight Stables', icon: '🌙', targetApy: 10.0, tvl: 185000000, risk: 'low', minInvest: 100, allocation: [{ product: 'Overnight USD+', type: 'vault', weight: 40, apy: 8.0 }, { product: 'Overnight ETH+', type: 'vault', weight: 30, apy: 6.5 }, { product: 'USDC Savings', type: 'savings', weight: 30, apy: 3.0 }], description: 'Overnight Finance' },
            { id: 'stakedao-boost', name: 'StakeDAO Boost', icon: '🏛️', targetApy: 25.0, tvl: 55000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'StakeDAO CRV', type: 'vault', weight: 35, apy: 28.0 }, { product: 'StakeDAO FXS', type: 'vault', weight: 30, apy: 22.0 }, { product: 'CRV/ETH Pool', type: 'pool', weight: 20, apy: 28.5 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'StakeDAO boosted' },
            { id: 'frax-ecosystem', name: 'Frax Ecosystem', icon: 'F', targetApy: 18.0, tvl: 125000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'frxETH Vault', type: 'vault', weight: 35, apy: 6.5 }, { product: 'FRAX/USDC Pool', type: 'pool', weight: 25, apy: 12.0 }, { product: 'FXS Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'FRAX Savings', type: 'savings', weight: 15, apy: 4.5 }], description: 'Frax Finance ecosystem' },
            { id: 'liquity-ecosystem', name: 'Liquity Ecosystem', icon: 'L', targetApy: 15.0, tvl: 85000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'LQTY Staking', type: 'staking', weight: 35, apy: 12.0 }, { product: 'LUSD Savings', type: 'savings', weight: 30, apy: 5.5 }, { product: 'LUSD/USDC Pool', type: 'pool', weight: 20, apy: 8.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Liquity Protocol' },
            { id: 'abracadabra-magic', name: 'Abracadabra Magic', icon: '🧙', targetApy: 35.0, tvl: 45000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'Abracadabra MIM Vault', type: 'vault', weight: 40, apy: 35.0 }, { product: 'MIM/USDC Pool', type: 'pool', weight: 30, apy: 28.0 }, { product: 'SPELL Staking', type: 'staking', weight: 20, apy: 45.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Abracadabra yields' },
            { id: 'zro-layerzero', name: 'LayerZero Ecosystem', icon: '0️⃣', targetApy: 28.0, tvl: 65000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'ZRO Staking', type: 'staking', weight: 35, apy: 12.0 }, { product: 'ZRO/ETH Pool', type: 'pool', weight: 30, apy: 48.0 }, { product: 'STG Staking', type: 'staking', weight: 20, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'LayerZero protocol' },
            { id: 'eigen-restaking', name: 'Eigen Restaking', icon: '🔷', targetApy: 12.0, tvl: 285000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'EIGEN Staking', type: 'staking', weight: 40, apy: 8.0 }, { product: 'EigenLayer Restaking', type: 'vault', weight: 30, apy: 8.0 }, { product: 'Renzo ezETH Vault', type: 'vault', weight: 20, apy: 12.0 }, { product: 'ETH Staking', type: 'staking', weight: 10, apy: 4.0 }], description: 'EigenLayer ecosystem' },
            { id: 'pyth-oracle', name: 'Pyth Oracle Combo', icon: '🐍', targetApy: 20.0, tvl: 48000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'PYTH Staking', type: 'staking', weight: 40, apy: 12.0 }, { product: 'PYTH/SOL Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'SOL Staking', type: 'staking', weight: 20, apy: 7.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Pyth Network oracle' },
            { id: 'wormhole-bridge', name: 'Wormhole Bridge', icon: '🌉', targetApy: 32.0, tvl: 55000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'W/ETH Pool', type: 'pool', weight: 35, apy: 42.0 }, { product: 'W Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'Portal Bridge LP', type: 'pool', weight: 20, apy: 38.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Wormhole ecosystem' },
            { id: 'alt-layer', name: 'AltLayer Combo', icon: '⚡', targetApy: 38.0, tvl: 32000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'ALT Staking', type: 'staking', weight: 35, apy: 18.0 }, { product: 'ALT/ETH Pool', type: 'pool', weight: 35, apy: 55.0 }, { product: 'ETH Staking', type: 'staking', weight: 20, apy: 4.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'AltLayer rollups' },
            { id: 'manta-ecosystem', name: 'Manta Ecosystem', icon: '🐙', targetApy: 35.0, tvl: 42000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'MANTA Staking', type: 'staking', weight: 35, apy: 12.0 }, { product: 'MANTA/ETH Pool', type: 'pool', weight: 35, apy: 52.0 }, { product: 'Manta Native Vault', type: 'vault', weight: 20, apy: 28.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Manta Pacific L2' },
            { id: 'zksync-native', name: 'zkSync Native', icon: '🔒', targetApy: 42.0, tvl: 58000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'ZK/ETH Pool', type: 'pool', weight: 40, apy: 55.0 }, { product: 'ZK Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'zkSync Native Vault', type: 'vault', weight: 20, apy: 32.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'zkSync Era ecosystem' },
            { id: 'metis-native', name: 'Metis Native', icon: '🟩', targetApy: 28.0, tvl: 35000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'METIS Staking', type: 'staking', weight: 40, apy: 12.0 }, { product: 'METIS/ETH Pool', type: 'pool', weight: 30, apy: 38.0 }, { product: 'Metis Native Vault', type: 'vault', weight: 20, apy: 25.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Metis L2 ecosystem' },
            { id: 'rdnt-radiant', name: 'Radiant Capital', icon: '✨', targetApy: 48.0, tvl: 55000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'RDNT Staking', type: 'staking', weight: 40, apy: 45.0 }, { product: 'RDNT/ETH Pool', type: 'pool', weight: 30, apy: 62.0 }, { product: 'Radiant Lending', type: 'lending', weight: 20, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Radiant omnichain' },
            { id: 'magic-treasure', name: 'Treasure DAO', icon: '🪄', targetApy: 25.0, tvl: 38000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'MAGIC Staking', type: 'staking', weight: 40, apy: 18.0 }, { product: 'MAGIC/ETH Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'Treasure Vault', type: 'vault', weight: 20, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Treasure ecosystem' },
            { id: 'xai-gaming', name: 'XAI Gaming Combo', icon: '🎮', targetApy: 38.0, tvl: 28000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'XAI Staking', type: 'staking', weight: 40, apy: 25.0 }, { product: 'XAI/ETH Pool', type: 'pool', weight: 30, apy: 55.0 }, { product: 'PRIME Staking', type: 'staking', weight: 20, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Web3 gaming tokens' },
            { id: 'prime-echelon', name: 'Echelon Prime', icon: '👾', targetApy: 30.0, tvl: 32000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'PRIME Staking', type: 'staking', weight: 45, apy: 18.0 }, { product: 'PRIME/ETH Pool', type: 'pool', weight: 30, apy: 48.0 }, { product: 'Gaming Index', type: 'vault', weight: 15, apy: 25.0 }, { product: 'ETH Staking', type: 'staking', weight: 10, apy: 4.0 }], description: 'Echelon Prime gaming' },
            { id: 'gala-gaming', name: 'GALA Gaming', icon: '🎲', targetApy: 28.0, tvl: 35000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'GALA Staking', type: 'staking', weight: 40, apy: 15.0 }, { product: 'GALA/ETH Pool', type: 'pool', weight: 30, apy: 42.0 }, { product: 'Gaming Index', type: 'vault', weight: 20, apy: 25.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'GALA Games ecosystem' },
            { id: 'ilv-gaming', name: 'Illuvium Combo', icon: '🏰', targetApy: 25.0, tvl: 28000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'ILV Staking', type: 'staking', weight: 45, apy: 18.0 }, { product: 'ILV/ETH Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'Gaming Index', type: 'vault', weight: 15, apy: 25.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Illuvium gaming' },
            { id: 'perp-delta', name: 'Perp Delta Neutral', icon: '📊', targetApy: 18.0, tvl: 125000000, risk: 'low-medium', minInvest: 200, allocation: [{ product: 'Hyperliquid HLP', type: 'vault', weight: 35, apy: 35.0 }, { product: 'GMX GLP Vault', type: 'vault', weight: 25, apy: 22.0 }, { product: 'Jupiter JLP Vault', type: 'vault', weight: 25, apy: 28.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Perp DEX delta neutral' },
            { id: 'snx-perps', name: 'Synthetix Perps', icon: '💫', targetApy: 28.0, tvl: 65000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'SNX Staking', type: 'staking', weight: 40, apy: 18.0 }, { product: 'SNX/ETH Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'Kwenta Vault', type: 'vault', weight: 20, apy: 25.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Synthetix ecosystem' },
            { id: 'dydx-perps', name: 'dYdX Perps Combo', icon: '📊', targetApy: 22.0, tvl: 75000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'DYDX Staking', type: 'staking', weight: 45, apy: 15.0 }, { product: 'DYDX/ETH Pool', type: 'pool', weight: 30, apy: 32.0 }, { product: 'dYdX Savings', type: 'savings', weight: 25, apy: 4.2 }], description: 'dYdX exchange' },
            { id: 'blur-nft', name: 'Blur NFT Combo', icon: '🖼️', targetApy: 35.0, tvl: 42000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'BLUR Staking', type: 'staking', weight: 40, apy: 25.0 }, { product: 'BLUR/ETH Pool', type: 'pool', weight: 35, apy: 48.0 }, { product: 'NFT Index', type: 'vault', weight: 15, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Blur NFT marketplace' },
            { id: 'ondo-rwa', name: 'Ondo RWA Combo', icon: '🏛️', targetApy: 12.0, tvl: 185000000, risk: 'low', minInvest: 100, allocation: [{ product: 'ONDO Staking', type: 'staking', weight: 35, apy: 8.0 }, { product: 'OUSG Vault', type: 'vault', weight: 30, apy: 5.0 }, { product: 'USDY Savings', type: 'savings', weight: 25, apy: 5.2 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Ondo tokenized assets' },
            // === COMBOS BATCH 6 - YOTTA EXPANSION ===
            { id: 'bsc-defi', name: 'BSC DeFi Combo', icon: '💛', targetApy: 42.0, tvl: 125000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'CAKE Staking', type: 'staking', weight: 30, apy: 45.0 }, { product: 'CAKE/BNB Pool', type: 'pool', weight: 30, apy: 55.0 }, { product: 'XVS Staking', type: 'staking', weight: 25, apy: 8.5 }, { product: 'BUSD Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'BSC top DeFi protocols' },
            { id: 'alpaca-leverage', name: 'Alpaca Leverage', icon: '🦙', targetApy: 35.0, tvl: 65000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'ALPACA Staking', type: 'staking', weight: 35, apy: 22.0 }, { product: 'Alpaca BUSD Vault', type: 'vault', weight: 30, apy: 18.0 }, { product: 'ALPACA/BNB Pool', type: 'pool', weight: 25, apy: 62.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Alpaca leveraged farming' },
            { id: 'venus-lending', name: 'Venus Lending', icon: '🔶', targetApy: 18.0, tvl: 145000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'XVS Staking', type: 'staking', weight: 35, apy: 8.5 }, { product: 'Venus USDC Lending', type: 'lending', weight: 30, apy: 8.0 }, { product: 'XVS/BNB Pool', type: 'pool', weight: 20, apy: 38.0 }, { product: 'BUSD Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Venus Protocol' },
            { id: 'banana-ape', name: 'ApeSwap Combo', icon: '🍌', targetApy: 52.0, tvl: 35000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'BANANA Staking', type: 'staking', weight: 40, apy: 25.0 }, { product: 'BANANA/BNB Pool', type: 'pool', weight: 35, apy: 72.0 }, { product: 'ApeSwap Vault', type: 'vault', weight: 15, apy: 55.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'ApeSwap ecosystem' },
            { id: 'beefy-bsc', name: 'Beefy BSC Combo', icon: '🐮', targetApy: 25.0, tvl: 85000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'BIFI Staking', type: 'staking', weight: 30, apy: 8.0 }, { product: 'Beefy CAKE Vault', type: 'vault', weight: 35, apy: 45.0 }, { product: 'BIFI/ETH Pool', type: 'pool', weight: 20, apy: 35.0 }, { product: 'BUSD Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Beefy Finance BSC' },
            { id: 'fan-token', name: 'Fan Token Combo', icon: '⚽', targetApy: 22.0, tvl: 55000000, risk: 'medium', minInvest: 50, allocation: [{ product: 'CHZ Staking', type: 'staking', weight: 25, apy: 8.0 }, { product: 'BAR Staking', type: 'staking', weight: 20, apy: 10.0 }, { product: 'PSG Staking', type: 'staking', weight: 20, apy: 10.0 }, { product: 'CHZ/USDT Pool', type: 'pool', weight: 20, apy: 32.0 }, { product: 'USDT Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Sports fan tokens' },
            { id: 'esports-gaming', name: 'Esports Gaming', icon: '🎮', targetApy: 28.0, tvl: 25000000, risk: 'medium-high', minInvest: 50, allocation: [{ product: 'OG Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'NAVI Staking', type: 'staking', weight: 30, apy: 18.0 }, { product: 'OG/USDT Pool', type: 'pool', weight: 25, apy: 45.0 }, { product: 'USDT Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Esports fan tokens' },
            { id: 'wallet-tokens', name: 'Wallet Token Combo', icon: '👛', targetApy: 18.0, tvl: 85000000, risk: 'low-medium', minInvest: 50, allocation: [{ product: 'TWT Staking', type: 'staking', weight: 30, apy: 8.0 }, { product: 'SFP Staking', type: 'staking', weight: 25, apy: 12.0 }, { product: 'C98 Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'TWT/BNB Pool', type: 'pool', weight: 20, apy: 35.0 }], description: 'Crypto wallet tokens' },
            { id: 'launchpad-tokens', name: 'Launchpad Combo', icon: '🚀', targetApy: 45.0, tvl: 45000000, risk: 'high', minInvest: 100, allocation: [{ product: 'BSCPAD Staking', type: 'staking', weight: 30, apy: 35.0 }, { product: 'POLS Staking', type: 'staking', weight: 30, apy: 28.0 }, { product: 'POLS/ETH Pool', type: 'pool', weight: 25, apy: 68.0 }, { product: 'USDT Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'IDO launchpad tokens' },
            { id: 'auto-farm', name: 'AutoFarm Combo', icon: '🤖', targetApy: 22.0, tvl: 55000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'AUTO Staking', type: 'staking', weight: 35, apy: 12.0 }, { product: 'AutoFarm Vault', type: 'vault', weight: 35, apy: 18.0 }, { product: 'AUTO/BNB Pool', type: 'pool', weight: 20, apy: 42.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'AutoFarm ecosystem' },
            { id: 'mdex-combo', name: 'MDEX Combo', icon: '🔷', targetApy: 38.0, tvl: 35000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'MDX Staking', type: 'staking', weight: 35, apy: 20.0 }, { product: 'MDEX Vault', type: 'vault', weight: 30, apy: 35.0 }, { product: 'MDX/BNB Pool', type: 'pool', weight: 25, apy: 65.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'MDEX exchange' },
            { id: 'biswap-combo', name: 'Biswap Combo', icon: '🔄', targetApy: 48.0, tvl: 42000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'BSW Staking', type: 'staking', weight: 35, apy: 35.0 }, { product: 'Biswap Vault', type: 'vault', weight: 30, apy: 55.0 }, { product: 'BSW/BNB Pool', type: 'pool', weight: 25, apy: 68.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Biswap exchange' },
            { id: 'ellipsis-combo', name: 'Ellipsis Combo', icon: 'ε', targetApy: 25.0, tvl: 48000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'EPS Staking', type: 'staking', weight: 35, apy: 16.0 }, { product: 'Ellipsis Vault', type: 'vault', weight: 30, apy: 10.0 }, { product: 'EPS/BNB Pool', type: 'pool', weight: 20, apy: 52.0 }, { product: 'BUSD Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Ellipsis Finance' },
            { id: 'baby-combo', name: 'BabySwap Combo', icon: '👶', targetApy: 42.0, tvl: 28000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'BABY Staking', type: 'staking', weight: 40, apy: 35.0 }, { product: 'BabySwap Vault', type: 'vault', weight: 30, apy: 48.0 }, { product: 'BABY/BNB Pool', type: 'pool', weight: 20, apy: 55.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'BabySwap ecosystem' },
            { id: 'dodo-combo', name: 'DODO Combo', icon: '🦤', targetApy: 28.0, tvl: 45000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'DODO Staking', type: 'staking', weight: 35, apy: 14.0 }, { product: 'DODO/USDT Pool', type: 'pool', weight: 35, apy: 48.0 }, { product: 'DODO Vault', type: 'vault', weight: 20, apy: 22.0 }, { product: 'USDT Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'DODO Exchange' },
            { id: 'reef-combo', name: 'Reef Combo', icon: '🐠', targetApy: 35.0, tvl: 22000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'REEF Staking', type: 'staking', weight: 40, apy: 18.0 }, { product: 'REEF/USDT Pool', type: 'pool', weight: 35, apy: 58.0 }, { product: 'Reef Vault', type: 'vault', weight: 15, apy: 25.0 }, { product: 'USDT Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Reef Finance' },
            { id: 'alpha-combo', name: 'Alpha Venture', icon: 'α', targetApy: 25.0, tvl: 55000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'ALPHA Staking', type: 'staking', weight: 40, apy: 12.0 }, { product: 'ALPHA/ETH Pool', type: 'pool', weight: 30, apy: 42.0 }, { product: 'Alpha Vault', type: 'vault', weight: 20, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Alpha Venture DAO' },
            { id: 'value-defi', name: 'Value DeFi', icon: '💎', targetApy: 32.0, tvl: 25000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'Value vBSWAP', type: 'vault', weight: 40, apy: 28.0 }, { product: 'Value Vault', type: 'vault', weight: 30, apy: 35.0 }, { product: 'VALUE/BNB Pool', type: 'pool', weight: 20, apy: 45.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Value DeFi protocol' },
            { id: 'locker-combo', name: 'Token Locker Combo', icon: '🔒', targetApy: 22.0, tvl: 48000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'UNCX Staking', type: 'staking', weight: 35, apy: 25.0 }, { product: 'Team Finance Vault', type: 'vault', weight: 30, apy: 22.0 }, { product: 'UNCX/ETH Pool', type: 'pool', weight: 20, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Token locking protocols' },
            { id: 'nerve-combo', name: 'Nerve Finance', icon: '⚡', targetApy: 28.0, tvl: 18000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'NRV Staking', type: 'staking', weight: 35, apy: 25.0 }, { product: 'Nerve Vault', type: 'vault', weight: 35, apy: 15.0 }, { product: 'NRV/BNB Pool', type: 'pool', weight: 20, apy: 55.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Nerve stablecoin' },
            { id: 'belt-combo', name: 'Belt Finance', icon: '🔗', targetApy: 15.0, tvl: 55000000, risk: 'low-medium', minInvest: 100, allocation: [{ product: 'BELT Staking', type: 'staking', weight: 35, apy: 10.0 }, { product: 'Belt 4Belt Vault', type: 'vault', weight: 35, apy: 8.0 }, { product: 'BELT/BNB Pool', type: 'pool', weight: 20, apy: 35.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Belt stable AMM' },
            { id: 'wault-combo', name: 'Wault Finance', icon: '🏦', targetApy: 32.0, tvl: 15000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'WEX Staking', type: 'staking', weight: 40, apy: 28.0 }, { product: 'Wault Vault', type: 'vault', weight: 30, apy: 28.0 }, { product: 'WEX/BNB Pool', type: 'pool', weight: 20, apy: 55.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Wault Finance' },
            { id: 'swamp-combo', name: 'Swamp Finance', icon: '🐊', targetApy: 35.0, tvl: 8000000, risk: 'medium-high', minInvest: 50, allocation: [{ product: 'SWAMP Staking', type: 'staking', weight: 40, apy: 32.0 }, { product: 'Swamp Vault', type: 'vault', weight: 30, apy: 32.0 }, { product: 'SWAMP/BNB Pool', type: 'pool', weight: 20, apy: 48.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Swamp Finance' },
            { id: 'mirror-combo', name: 'Mirror Protocol', icon: '🪞', targetApy: 25.0, tvl: 35000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'MIR Staking', type: 'staking', weight: 40, apy: 15.0 }, { product: 'Mirror Vault', type: 'vault', weight: 30, apy: 18.0 }, { product: 'MIR/UST Pool', type: 'pool', weight: 20, apy: 42.0 }, { product: 'UST Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Mirror Protocol' },
            { id: 'frontier-combo', name: 'Frontier Combo', icon: '🎯', targetApy: 28.0, tvl: 18000000, risk: 'medium', minInvest: 50, allocation: [{ product: 'FRONT Staking', type: 'staking', weight: 40, apy: 18.0 }, { product: 'FRONT/ETH Pool', type: 'pool', weight: 35, apy: 55.0 }, { product: 'Frontier Vault', type: 'vault', weight: 15, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Frontier DeFi' },
            { id: 'litentry-combo', name: 'Litentry Combo', icon: '🔥', targetApy: 32.0, tvl: 15000000, risk: 'medium-high', minInvest: 50, allocation: [{ product: 'LIT Staking', type: 'staking', weight: 40, apy: 22.0 }, { product: 'LIT/ETH Pool', type: 'pool', weight: 35, apy: 62.0 }, { product: 'Litentry Vault', type: 'vault', weight: 15, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Litentry identity' },
            { id: 'ramp-combo', name: 'RAMP DeFi', icon: '🛤️', targetApy: 28.0, tvl: 15000000, risk: 'medium', minInvest: 50, allocation: [{ product: 'RAMP Staking', type: 'staking', weight: 40, apy: 18.0 }, { product: 'RAMP/ETH Pool', type: 'pool', weight: 30, apy: 45.0 }, { product: 'RAMP Vault', type: 'vault', weight: 20, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'RAMP DeFi protocol' },
            { id: 'safemoon-combo', name: 'SafePal Combo', icon: '🔐', targetApy: 22.0, tvl: 35000000, risk: 'medium', minInvest: 50, allocation: [{ product: 'SFP Staking', type: 'staking', weight: 40, apy: 12.0 }, { product: 'SFP/BNB Pool', type: 'pool', weight: 30, apy: 42.0 }, { product: 'SafePal Vault', type: 'vault', weight: 20, apy: 18.0 }, { product: 'BUSD Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'SafePal wallet' },
            // === COMBOS BATCH 7 - QUETTA EXPANSION ===
            // AI Token Combos
            { id: 'ai-supercluster', name: 'AI Supercluster', icon: '🧠', targetApy: 22.0, tvl: 185000000, risk: 'medium-high', minInvest: 200, allocation: [{ product: 'TAO Staking', type: 'staking', weight: 25, apy: 18.0 }, { product: 'FET Staking', type: 'staking', weight: 20, apy: 12.0 }, { product: 'AGIX Staking', type: 'staking', weight: 20, apy: 15.0 }, { product: 'RNDR Staking', type: 'staking', weight: 20, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'AI token portfolio' },
            { id: 'gpu-compute', name: 'GPU Compute Combo', icon: '🖥️', targetApy: 28.0, tvl: 95000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'RNDR Staking', type: 'staking', weight: 30, apy: 12.0 }, { product: 'AKT Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'IO Staking', type: 'staking', weight: 25, apy: 22.0 }, { product: 'GPU Compute Vault', type: 'vault', weight: 10, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Decentralized compute' },
            { id: 'worldcoin-combo', name: 'Worldcoin Combo', icon: '🌐', targetApy: 15.0, tvl: 125000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'WLD Staking', type: 'staking', weight: 40, apy: 8.0 }, { product: 'WLD/ETH Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'Worldcoin Vault', type: 'vault', weight: 20, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Worldcoin ecosystem' },
            // Gaming Token Combos
            { id: 'gaming-metaverse', name: 'Gaming Metaverse', icon: '🎮', targetApy: 25.0, tvl: 145000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'IMX Staking', type: 'staking', weight: 25, apy: 12.0 }, { product: 'RON Staking', type: 'staking', weight: 25, apy: 14.0 }, { product: 'GALA Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'BEAM Staking', type: 'staking', weight: 15, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Gaming tokens' },
            { id: 'prime-gaming', name: 'Prime Gaming', icon: '🎮', targetApy: 32.0, tvl: 85000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'PRIME Staking', type: 'staking', weight: 35, apy: 22.0 }, { product: 'PRIME/ETH Pool', type: 'pool', weight: 30, apy: 68.0 }, { product: 'PRIME Gaming Vault', type: 'vault', weight: 25, apy: 35.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Echelon Prime' },
            { id: 'ronin-axie', name: 'Ronin Axie Combo', icon: '⚔️', targetApy: 28.0, tvl: 125000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'RON Staking', type: 'staking', weight: 35, apy: 14.0 }, { product: 'RON/ETH Pool', type: 'pool', weight: 30, apy: 48.0 }, { product: 'Ronin Axie Vault', type: 'vault', weight: 25, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Ronin gaming' },
            // DeFi Governance Combos
            { id: 'curve-wars', name: 'Curve Wars', icon: '🔄', targetApy: 18.0, tvl: 285000000, risk: 'medium', minInvest: 200, allocation: [{ product: 'CRV Staking', type: 'staking', weight: 30, apy: 8.0 }, { product: 'CVX Staking', type: 'staking', weight: 30, apy: 12.0 }, { product: 'Curve Convex Vault', type: 'vault', weight: 30, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'CRV/CVX combo' },
            { id: 'balancer-aura', name: 'Balancer Aura', icon: '⚖️', targetApy: 20.0, tvl: 145000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'BAL Staking', type: 'staking', weight: 35, apy: 10.0 }, { product: 'AURA Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'Balancer Aura Vault', type: 'vault', weight: 25, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'BAL/AURA combo' },
            { id: 'synthetix-perps', name: 'Synthetix Perps', icon: '🔷', targetApy: 28.0, tvl: 145000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'SNX Staking', type: 'staking', weight: 35, apy: 18.0 }, { product: 'KWENTA Staking', type: 'staking', weight: 25, apy: 12.5 }, { product: 'SNX Optimism Vault', type: 'vault', weight: 30, apy: 28.0 }, { product: 'sUSD Savings', type: 'savings', weight: 10, apy: 5.0 }], description: 'Synthetix + Kwenta' },
            { id: 'yearn-ecosystem', name: 'Yearn Ecosystem', icon: '💙', targetApy: 15.0, tvl: 185000000, risk: 'medium', minInvest: 500, allocation: [{ product: 'YFI Staking', type: 'staking', weight: 40, apy: 8.0 }, { product: 'YFI/ETH Pool', type: 'pool', weight: 25, apy: 25.0 }, { product: 'Yearn veYFI Vault', type: 'vault', weight: 25, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Yearn Finance' },
            // Infrastructure & DePIN Combos
            { id: 'helium-depin', name: 'Helium DePIN', icon: '📡', targetApy: 18.0, tvl: 125000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'HNT Staking', type: 'staking', weight: 40, apy: 6.0 }, { product: 'MOBILE Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'Helium HNT Vault', type: 'vault', weight: 20, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Helium network' },
            { id: 'iotex-machinefi', name: 'IoTeX MachineFi', icon: '🔌', targetApy: 20.0, tvl: 75000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'IOTX Staking', type: 'staking', weight: 35, apy: 10.0 }, { product: 'IOTX/ETH Pool', type: 'pool', weight: 30, apy: 38.0 }, { product: 'IoTeX MachineFi Vault', type: 'vault', weight: 25, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'IoT + DeFi' },
            { id: 'flare-oracle', name: 'Flare Oracle', icon: '⚡', targetApy: 15.0, tvl: 65000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'FLR Staking', type: 'staking', weight: 35, apy: 10.0 }, { product: 'FLR/USDT Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'Flare FTSO Vault', type: 'vault', weight: 25, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Flare Network' },
            // Liquid Staking Combos
            { id: 'eth-lsd', name: 'ETH LSD Combo', icon: '⟠', targetApy: 10.0, tvl: 485000000, risk: 'low-medium', minInvest: 500, allocation: [{ product: 'stETH LRT Vault', type: 'vault', weight: 40, apy: 8.0 }, { product: 'rETH Rocket Vault', type: 'vault', weight: 30, apy: 6.5 }, { product: 'RPL Staking', type: 'staking', weight: 20, apy: 7.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'ETH liquid staking' },
            { id: 'sol-lsd', name: 'SOL LSD Combo', icon: '◎', targetApy: 12.0, tvl: 285000000, risk: 'low-medium', minInvest: 200, allocation: [{ product: 'JitoSOL DeFi Vault', type: 'vault', weight: 40, apy: 12.0 }, { product: 'mSOL Marinade Vault', type: 'vault', weight: 35, apy: 10.0 }, { product: 'JTO Staking', type: 'staking', weight: 15, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Solana liquid staking' },
            // Emerging Sector Combos
            { id: 'restaking-combo', name: 'Restaking Combo', icon: '🔄', targetApy: 18.0, tvl: 185000000, risk: 'medium', minInvest: 300, allocation: [{ product: 'EIGEN Staking', type: 'staking', weight: 40, apy: 15.0 }, { product: 'EigenLayer Vault', type: 'vault', weight: 35, apy: 15.0 }, { product: 'stETH LRT Vault', type: 'vault', weight: 15, apy: 8.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'EigenLayer restaking' },
            { id: 'modular-blockchain', name: 'Modular Chains', icon: '🧱', targetApy: 20.0, tvl: 145000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'TIA Staking', type: 'staking', weight: 35, apy: 18.0 }, { product: 'Celestia TIA Vault', type: 'vault', weight: 30, apy: 18.0 }, { product: 'STRK Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Modular blockchains' },
            { id: 'zk-technology', name: 'ZK Technology', icon: '🔐', targetApy: 15.0, tvl: 125000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'ZK Staking', type: 'staking', weight: 35, apy: 12.0 }, { product: 'STRK Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'zkSync Vault', type: 'vault', weight: 25, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Zero knowledge' },
            { id: 'ton-telegram', name: 'TON Telegram', icon: '✈️', targetApy: 15.0, tvl: 245000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'TON Staking', type: 'staking', weight: 40, apy: 10.0 }, { product: 'TON Staking Vault', type: 'vault', weight: 35, apy: 10.0 }, { product: 'NOT Staking', type: 'staking', weight: 15, apy: 25.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'TON ecosystem' },
            { id: 'rwa-tokenization', name: 'RWA Tokenization', icon: '🏠', targetApy: 12.0, tvl: 185000000, risk: 'low-medium', minInvest: 200, allocation: [{ product: 'ONDO Staking', type: 'staking', weight: 40, apy: 8.0 }, { product: 'Ondo RWA Vault', type: 'vault', weight: 35, apy: 8.0 }, { product: 'PRCL Staking', type: 'staking', weight: 15, apy: 32.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Real world assets' },
            // Oracle & Data Combos
            { id: 'oracle-network', name: 'Oracle Network', icon: '🔮', targetApy: 12.0, tvl: 165000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'LINK Staking', type: 'staking', weight: 35, apy: 4.5 }, { product: 'PYTH Staking', type: 'staking', weight: 30, apy: 12.0 }, { product: 'API3 Staking', type: 'staking', weight: 25, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Oracle providers' },
            { id: 'quant-enterprise', name: 'Quant Enterprise', icon: '🔗', targetApy: 8.0, tvl: 145000000, risk: 'low-medium', minInvest: 500, allocation: [{ product: 'QNT Staking', type: 'staking', weight: 50, apy: 5.0 }, { product: 'QNT/ETH Pool', type: 'pool', weight: 30, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Enterprise blockchain' },
            // Cross-Chain Combos
            { id: 'solana-defi-max', name: 'Solana DeFi Max', icon: '◎', targetApy: 22.0, tvl: 185000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'JUP Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'RAY Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'JUP/SOL Pool', type: 'pool', weight: 25, apy: 55.0 }, { product: 'JitoSOL DeFi Vault', type: 'vault', weight: 15, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Solana DeFi' },
            { id: 'arbitrum-defi', name: 'Arbitrum DeFi', icon: '🔵', targetApy: 25.0, tvl: 145000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'GMX Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'GRAIL Staking', type: 'staking', weight: 25, apy: 18.0 }, { product: 'ARB/ETH Pool', type: 'pool', weight: 25, apy: 42.0 }, { product: 'GLP Vault', type: 'vault', weight: 10, apy: 25.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Arbitrum ecosystem' },
            { id: 'optimism-superchain', name: 'OP Superchain', icon: '🔴', targetApy: 22.0, tvl: 125000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'OP Staking', type: 'staking', weight: 30, apy: 8.0 }, { product: 'VELO Staking', type: 'staking', weight: 25, apy: 18.0 }, { product: 'SNX Staking', type: 'staking', weight: 25, apy: 18.0 }, { product: 'Velodrome Vault', type: 'vault', weight: 10, apy: 28.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Optimism ecosystem' },
            { id: 'base-chain', name: 'Base Chain', icon: '🔵', targetApy: 28.0, tvl: 95000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'AERO Staking', type: 'staking', weight: 35, apy: 20.0 }, { product: 'AERO/ETH Pool', type: 'pool', weight: 30, apy: 72.0 }, { product: 'Aerodrome Vault', type: 'vault', weight: 25, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Base ecosystem' },

            // === COMBOS BATCH 8 - GIGA EXPANSION ===
            // DePIN Combos
            { id: 'depin-network', name: 'DePIN Network', icon: '🌐', targetApy: 32.0, tvl: 65000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'RENDER Staking', type: 'staking', weight: 25, apy: 8.5 }, { product: 'GRASS Staking', type: 'staking', weight: 25, apy: 35.0 }, { product: 'DIMO Staking', type: 'staking', weight: 20, apy: 18.0 }, { product: 'DePIN Infrastructure Vault', type: 'vault', weight: 20, apy: 28.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'DePIN infrastructure' },
            { id: 'gpu-compute', name: 'GPU Compute', icon: '🎨', targetApy: 18.0, tvl: 95000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'RENDER Staking', type: 'staking', weight: 40, apy: 8.5 }, { product: 'RENDER/ETH Pool', type: 'pool', weight: 30, apy: 28.0 }, { product: 'Render GPU Vault', type: 'vault', weight: 20, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'GPU compute network' },
            { id: 'bandwidth-mining', name: 'Bandwidth Mining', icon: '🌱', targetApy: 45.0, tvl: 55000000, risk: 'high', minInvest: 50, allocation: [{ product: 'GRASS Staking', type: 'staking', weight: 40, apy: 35.0 }, { product: 'GRASS/SOL Pool', type: 'pool', weight: 30, apy: 85.0 }, { product: 'Grass Bandwidth Vault', type: 'vault', weight: 20, apy: 45.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Bandwidth monetization' },

            // RWA Combos
            { id: 'rwa-credit', name: 'RWA Credit', icon: '🏦', targetApy: 14.0, tvl: 85000000, risk: 'low-medium', minInvest: 250, allocation: [{ product: 'ONDO Staking', type: 'staking', weight: 25, apy: 8.0 }, { product: 'MPL Staking', type: 'staking', weight: 25, apy: 12.0 }, { product: 'RWA Credit Vault', type: 'vault', weight: 30, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Real world assets' },
            { id: 'institutional-credit', name: 'Institutional Credit', icon: '🍁', targetApy: 16.0, tvl: 65000000, risk: 'medium', minInvest: 500, allocation: [{ product: 'MPL Staking', type: 'staking', weight: 30, apy: 12.0 }, { product: 'GFI Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'Maple Lending Vault', type: 'vault', weight: 25, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Institutional lending' },

            // Social & Creator Combos
            { id: 'socialfi-combo', name: 'SocialFi Combo', icon: '👥', targetApy: 28.0, tvl: 45000000, risk: 'high', minInvest: 100, allocation: [{ product: 'LENS Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'GAL Staking', type: 'staking', weight: 25, apy: 10.0 }, { product: 'SocialFi Aggregator Vault', type: 'vault', weight: 30, apy: 35.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Social token yield' },
            { id: 'creator-yield', name: 'Creator Yield', icon: '🎭', targetApy: 22.0, tvl: 25000000, risk: 'medium-high', minInvest: 75, allocation: [{ product: 'RLY Staking', type: 'staking', weight: 30, apy: 12.0 }, { product: 'DESO Staking', type: 'staking', weight: 25, apy: 8.0 }, { product: 'Creator Economy Vault', type: 'vault', weight: 30, apy: 28.0 }, { product: 'USDC Savings', type: 'savings', weight: 15, apy: 3.0 }], description: 'Creator economy' },

            // Prediction & Oracle Combos
            { id: 'prediction-oracle', name: 'Prediction Oracle', icon: '🔮', targetApy: 14.0, tvl: 75000000, risk: 'medium', minInvest: 150, allocation: [{ product: 'GNO Staking', type: 'staking', weight: 30, apy: 5.0 }, { product: 'UMA Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'Prediction Markets Vault', type: 'vault', weight: 25, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Prediction markets' },
            { id: 'oracle-reporter', name: 'Oracle Reporter', icon: '📊', targetApy: 16.0, tvl: 55000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'TRB Staking', type: 'staking', weight: 30, apy: 12.0 }, { product: 'UMA Staking', type: 'staking', weight: 25, apy: 15.0 }, { product: 'Oracle Aggregator Vault', type: 'vault', weight: 25, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Oracle data reporting' },

            // Cosmos DeFi Combos
            { id: 'cosmos-hub', name: 'Cosmos Hub', icon: '⚛️', targetApy: 22.0, tvl: 125000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'ATOM Staking', type: 'staking', weight: 30, apy: 18.0 }, { product: 'STRD Staking', type: 'staking', weight: 25, apy: 18.0 }, { product: 'Cosmos DeFi Vault', type: 'vault', weight: 25, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 20, apy: 3.0 }], description: 'Cosmos ecosystem' },
            { id: 'dydx-perp', name: 'dYdX Perp', icon: '📈', targetApy: 18.0, tvl: 185000000, risk: 'medium', minInvest: 200, allocation: [{ product: 'DYDX Staking', type: 'staking', weight: 40, apy: 12.0 }, { product: 'DYDX/USDC Pool', type: 'pool', weight: 30, apy: 28.0 }, { product: 'dYdX Perp Vault', type: 'vault', weight: 20, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'dYdX derivatives' },
            { id: 'neutron-defi', name: 'Neutron DeFi', icon: '⚛️', targetApy: 25.0, tvl: 85000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'NTRN Staking', type: 'staking', weight: 35, apy: 15.0 }, { product: 'NTRN/ATOM Pool', type: 'pool', weight: 30, apy: 38.0 }, { product: 'Neutron DeFi Vault', type: 'vault', weight: 25, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Neutron smart contracts' },
            { id: 'akash-cloud', name: 'Akash Cloud', icon: '☁️', targetApy: 28.0, tvl: 95000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'AKT Staking', type: 'staking', weight: 40, apy: 20.0 }, { product: 'AKT/USDC Pool', type: 'pool', weight: 30, apy: 48.0 }, { product: 'Akash Compute Vault', type: 'vault', weight: 20, apy: 28.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Decentralized cloud' },
            { id: 'kujira-whale', name: 'Kujira Whale', icon: '🐋', targetApy: 22.0, tvl: 42000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'KUJI Staking', type: 'staking', weight: 40, apy: 14.0 }, { product: 'KUJI/USDC Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'Kujira FINv Vault', type: 'vault', weight: 20, apy: 20.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Kujira DeFi hub' },

            // Bitcoin L2 Combos
            { id: 'btc-l2-combo', name: 'Bitcoin L2', icon: '₿', targetApy: 18.0, tvl: 145000000, risk: 'medium', minInvest: 200, allocation: [{ product: 'STX PoX', type: 'staking', weight: 35, apy: 10.0 }, { product: 'STX/BTC Pool', type: 'pool', weight: 30, apy: 22.0 }, { product: 'Bitcoin L2 Vault', type: 'vault', weight: 25, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Bitcoin Layer 2' },
            { id: 'ordinals-combo', name: 'Ordinals Combo', icon: '🟡', targetApy: 35.0, tvl: 65000000, risk: 'high', minInvest: 100, allocation: [{ product: 'ORDI Staking', type: 'staking', weight: 30, apy: 15.0 }, { product: 'ORDI/BTC Pool', type: 'pool', weight: 30, apy: 35.0 }, { product: 'Ordinals Yield Vault', type: 'vault', weight: 30, apy: 35.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'BRC-20 yield' },
            { id: 'alex-defi', name: 'ALEX DeFi', icon: '🔶', targetApy: 25.0, tvl: 35000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'ALEX Staking', type: 'staking', weight: 35, apy: 18.0 }, { product: 'ALEX/STX Pool', type: 'pool', weight: 30, apy: 42.0 }, { product: 'ALEX Bitcoin DeFi Vault', type: 'vault', weight: 25, apy: 25.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Bitcoin DeFi' },

            // MEV Protection Combos
            { id: 'mev-protected', name: 'MEV Protected', icon: '🐄', targetApy: 12.0, tvl: 55000000, risk: 'low-medium', minInvest: 500, allocation: [{ product: 'COW Staking', type: 'staking', weight: 35, apy: 8.0 }, { product: 'COW/ETH Pool', type: 'pool', weight: 30, apy: 25.0 }, { product: 'MEV Protection Vault', type: 'vault', weight: 25, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'MEV-protected yield' },

            // === COMBOS BATCH 9 - PETA EXPANSION ===
            // Consumer Apps Combos
            { id: 'metaverse-combo', name: 'Metaverse Yield', icon: '🌐', targetApy: 18.0, tvl: 95000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'MANA Staking', type: 'staking', weight: 30, apy: 8.0 }, { product: 'SAND/ETH Pool', type: 'pool', weight: 30, apy: 25.0 }, { product: 'Metaverse Land Vault', type: 'vault', weight: 30, apy: 18.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Virtual world yield' },
            { id: 'move2earn-combo', name: 'Move-to-Earn', icon: '👟', targetApy: 22.0, tvl: 75000000, risk: 'medium', minInvest: 50, allocation: [{ product: 'GMT Staking', type: 'staking', weight: 35, apy: 12.0 }, { product: 'GMT/USDC Pool', type: 'pool', weight: 30, apy: 25.0 }, { product: 'Move-to-Earn Vault', type: 'vault', weight: 25, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Exercise-to-earn' },
            { id: 'axie-ecosystem-combo', name: 'Axie Ecosystem', icon: '⚔️', targetApy: 28.0, tvl: 125000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'AXS Staking', type: 'staking', weight: 40, apy: 35.0 }, { product: 'AXS/ETH Pool', type: 'pool', weight: 25, apy: 35.0 }, { product: 'Axie Ecosystem Vault', type: 'vault', weight: 25, apy: 28.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Play-to-earn gaming' },

            // NFT Infrastructure Combos
            { id: 'nft-marketplace-combo', name: 'NFT Markets', icon: '🖼️', targetApy: 32.0, tvl: 95000000, risk: 'medium-high', minInvest: 150, allocation: [{ product: 'BLUR Staking', type: 'staking', weight: 35, apy: 18.0 }, { product: 'BLUR/ETH Pool', type: 'pool', weight: 30, apy: 42.0 }, { product: 'NFT Marketplace Vault', type: 'vault', weight: 25, apy: 25.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'NFT marketplace yield' },
            { id: 'treasure-gaming', name: 'Treasure Gaming', icon: '✨', targetApy: 35.0, tvl: 65000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'MAGIC Staking', type: 'staking', weight: 40, apy: 28.0 }, { product: 'MAGIC/ETH Pool', type: 'pool', weight: 30, apy: 55.0 }, { product: 'Treasure DAO Vault', type: 'vault', weight: 20, apy: 35.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Gaming NFT ecosystem' },

            // Entertainment Combos
            { id: 'music-creator', name: 'Music Creator', icon: '🎵', targetApy: 20.0, tvl: 35000000, risk: 'medium', minInvest: 50, allocation: [{ product: 'AUDIO Staking', type: 'staking', weight: 40, apy: 14.0 }, { product: 'AUDIO/ETH Pool', type: 'pool', weight: 30, apy: 32.0 }, { product: 'Music NFT Vault', type: 'vault', weight: 20, apy: 20.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Music platform yield' },

            // Sports Fan Token Combos
            { id: 'sports-fan-combo', name: 'Sports Fan', icon: '⚽', targetApy: 15.0, tvl: 115000000, risk: 'medium', minInvest: 50, allocation: [{ product: 'CHZ Staking', type: 'staking', weight: 40, apy: 12.0 }, { product: 'CHZ/USDC Pool', type: 'pool', weight: 30, apy: 28.0 }, { product: 'Fan Token Vault', type: 'vault', weight: 20, apy: 15.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Sports fan tokens' },
            { id: 'football-clubs-combo', name: 'Football Clubs', icon: '⚽', targetApy: 12.0, tvl: 55000000, risk: 'medium', minInvest: 75, allocation: [{ product: 'BAR Staking', type: 'staking', weight: 30, apy: 6.0 }, { product: 'PSG/CHZ Pool', type: 'pool', weight: 30, apy: 16.0 }, { product: 'Football Clubs Vault', type: 'vault', weight: 30, apy: 12.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Top football clubs' },

            // Gaming Infrastructure Combos
            { id: 'aaa-gaming-combo', name: 'AAA Gaming', icon: '🎮', targetApy: 35.0, tvl: 85000000, risk: 'medium-high', minInvest: 100, allocation: [{ product: 'BEAM Staking', type: 'staking', weight: 35, apy: 35.0 }, { product: 'ILV/ETH Pool', type: 'pool', weight: 30, apy: 48.0 }, { product: 'AAA Gaming Vault', type: 'vault', weight: 25, apy: 35.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Premium gaming tokens' },
            { id: 'guild-gaming', name: 'Guild Gaming', icon: '🏴‍☠️', targetApy: 25.0, tvl: 45000000, risk: 'medium', minInvest: 75, allocation: [{ product: 'YGG Staking', type: 'staking', weight: 40, apy: 18.0 }, { product: 'YGG/ETH Pool', type: 'pool', weight: 30, apy: 38.0 }, { product: 'Guild Yield Vault', type: 'vault', weight: 20, apy: 25.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Gaming guilds' },

            // Base Ecosystem Combos
            { id: 'base-defi-combo', name: 'Base DeFi', icon: '🔵', targetApy: 35.0, tvl: 145000000, risk: 'medium', minInvest: 100, allocation: [{ product: 'AERO Staking', type: 'staking', weight: 35, apy: 32.0 }, { product: 'AERO/ETH Pool', type: 'pool', weight: 30, apy: 58.0 }, { product: 'Base DeFi Vault', type: 'vault', weight: 25, apy: 28.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Base chain yield' },
            { id: 'base-meme-combo', name: 'Base Memes', icon: '🐸', targetApy: 85.0, tvl: 75000000, risk: 'high', minInvest: 50, allocation: [{ product: 'BRETT Staking', type: 'staking', weight: 30, apy: 55.0 }, { product: 'BRETT/ETH Pool', type: 'pool', weight: 30, apy: 95.0 }, { product: 'Base Memes Vault', type: 'vault', weight: 30, apy: 85.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Base meme coins' },
            { id: 'farcaster-combo', name: 'Farcaster Yield', icon: '🎰', targetApy: 75.0, tvl: 55000000, risk: 'high', minInvest: 50, allocation: [{ product: 'DEGEN Staking', type: 'staking', weight: 35, apy: 65.0 }, { product: 'DEGEN/ETH Pool', type: 'pool', weight: 30, apy: 115.0 }, { product: 'Farcaster Vault', type: 'vault', weight: 25, apy: 75.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Farcaster ecosystem' },

            // Solana Meme Combos
            { id: 'sol-cat-meme-combo', name: 'Solana Cats', icon: '🐈', targetApy: 125.0, tvl: 95000000, risk: 'high', minInvest: 25, allocation: [{ product: 'POPCAT Staking', type: 'staking', weight: 30, apy: 75.0 }, { product: 'MEW/SOL Pool', type: 'pool', weight: 30, apy: 145.0 }, { product: 'Sol Cat Memes Vault', type: 'vault', weight: 30, apy: 125.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Solana cat memes' },
            { id: 'sol-degen-meme-combo', name: 'Sol Degen', icon: '🚀', targetApy: 150.0, tvl: 125000000, risk: 'high', minInvest: 25, allocation: [{ product: 'BOME Staking', type: 'staking', weight: 30, apy: 80.0 }, { product: 'BOME/SOL Pool', type: 'pool', weight: 30, apy: 135.0 }, { product: 'Sol Meme Degen Vault', type: 'vault', weight: 30, apy: 150.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'High-risk Solana memes' },

            // Multi-Chain Combos
            { id: 'multi-meme-combo', name: 'Multi-Chain Memes', icon: '🌈', targetApy: 110.0, tvl: 105000000, risk: 'high', minInvest: 50, allocation: [{ product: 'BRETT Staking', type: 'staking', weight: 25, apy: 55.0 }, { product: 'BOME/SOL Pool', type: 'pool', weight: 25, apy: 135.0 }, { product: 'Multi-Chain Meme Vault', type: 'vault', weight: 40, apy: 110.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Cross-chain memes' },
            { id: 'consumer-apps-combo', name: 'Consumer Apps', icon: '📱', targetApy: 22.0, tvl: 75000000, risk: 'medium', minInvest: 75, allocation: [{ product: 'GMT Staking', type: 'staking', weight: 25, apy: 12.0 }, { product: 'AXS/ETH Pool', type: 'pool', weight: 25, apy: 35.0 }, { product: 'CHZ Staking', type: 'staking', weight: 20, apy: 12.0 }, { product: 'Consumer Apps Vault', type: 'vault', weight: 20, apy: 22.0 }, { product: 'USDC Savings', type: 'savings', weight: 10, apy: 3.0 }], description: 'Consumer app tokens' }
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
            },
            // === NEW INDEX FUNDS BATCH ===
            { id: 'meme-index', name: 'Meme Index', symbol: 'MEME', icon: '🐸', price: 42.50, change24h: 15.2, aum: 85000000, holdings: [{ token: 'DOGE', weight: 25 }, { token: 'SHIB', weight: 20 }, { token: 'PEPE', weight: 20 }, { token: 'WIF', weight: 15 }, { token: 'BONK', weight: 12 }, { token: 'FLOKI', weight: 8 }], managementFee: 1.0, rebalanceFreq: 'Weekly', risk: 'high', description: 'Top meme coins by market cap' },
            { id: 'gaming-index', name: 'Gaming Index', symbol: 'GAME', icon: '🎮', price: 35.80, change24h: 5.5, aum: 120000000, holdings: [{ token: 'IMX', weight: 25 }, { token: 'GALA', weight: 20 }, { token: 'AXS', weight: 18 }, { token: 'SAND', weight: 15 }, { token: 'ENJ', weight: 12 }, { token: 'MANA', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Gaming and metaverse tokens' },
            { id: 'privacy-index', name: 'Privacy Index', symbol: 'PRIV', icon: '🔒', price: 68.20, change24h: 3.2, aum: 65000000, holdings: [{ token: 'XMR', weight: 40 }, { token: 'ZEC', weight: 25 }, { token: 'SCRT', weight: 20 }, { token: 'DASH', weight: 15 }], managementFee: 0.6, rebalanceFreq: 'Monthly', risk: 'medium-high', description: 'Privacy-focused cryptocurrencies' },
            { id: 'cosmos-index', name: 'Cosmos Ecosystem', symbol: 'COSM', icon: '⚛', price: 28.50, change24h: 4.8, aum: 95000000, holdings: [{ token: 'ATOM', weight: 30 }, { token: 'OSMO', weight: 20 }, { token: 'INJ', weight: 18 }, { token: 'TIA', weight: 15 }, { token: 'SEI', weight: 10 }, { token: 'DYDX', weight: 7 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium', description: 'IBC ecosystem tokens' },
            { id: 'solana-index', name: 'Solana Ecosystem', symbol: 'SOLIX', icon: '◎', price: 85.40, change24h: 6.2, aum: 180000000, holdings: [{ token: 'SOL', weight: 40 }, { token: 'JUP', weight: 18 }, { token: 'PYTH', weight: 15 }, { token: 'RAY', weight: 12 }, { token: 'ORCA', weight: 10 }, { token: 'MNGO', weight: 5 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Solana DeFi ecosystem' },
            { id: 'rwa-index', name: 'RWA Index', symbol: 'RWAI', icon: '🏢', price: 112.30, change24h: 1.5, aum: 245000000, holdings: [{ token: 'ONDO', weight: 20 }, { token: 'MKR', weight: 15 }, { token: 'PENDLE', weight: 12 }, { token: 'MPL', weight: 10 }, { token: 'CFG', weight: 8 }, { token: 'CPOOL', weight: 8 }, { token: 'GFI', weight: 7 }, { token: 'TRU', weight: 7 }, { token: 'FACTR', weight: 7 }, { token: 'RIO', weight: 6 }], managementFee: 0.5, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Real World Asset protocols - tokenized assets' },
            { id: 'rwa-treasuries', name: 'RWA Treasuries', symbol: 'TRSY', icon: '🏛️', price: 101.50, change24h: 0.2, aum: 380000000, holdings: [{ token: 'USDY', weight: 25 }, { token: 'USDM', weight: 20 }, { token: 'STBT', weight: 18 }, { token: 'TBILL', weight: 15 }, { token: 'OUSG', weight: 12 }, { token: 'BUIDL', weight: 10 }], managementFee: 0.25, rebalanceFreq: 'Weekly', risk: 'very-low', description: 'Tokenized US Treasury bonds - stable yield' },
            { id: 'rwa-realestate', name: 'RWA Real Estate', symbol: 'RWRE', icon: '🏠', price: 85.40, change24h: 0.8, aum: 95000000, holdings: [{ token: 'RET', weight: 25 }, { token: 'LAND', weight: 20 }, { token: 'PRO', weight: 18 }, { token: 'LABS', weight: 15 }, { token: 'ELYSIA', weight: 12 }, { token: 'REIT', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Tokenized real estate and property' },
            { id: 'rwa-commodities', name: 'RWA Commodities', symbol: 'CMDTY', icon: '🛢️', price: 78.20, change24h: 1.2, aum: 120000000, holdings: [{ token: 'PAXG', weight: 30 }, { token: 'XAUT', weight: 25 }, { token: 'DGX', weight: 15 }, { token: 'SLVT', weight: 12 }, { token: 'OILX', weight: 10 }, { token: 'COFT', weight: 8 }], managementFee: 0.45, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Tokenized gold, silver, oil and commodities' },
            { id: 'rwa-credit', name: 'RWA Private Credit', symbol: 'CRDT', icon: '💳', price: 105.80, change24h: 0.5, aum: 185000000, holdings: [{ token: 'MPL', weight: 25 }, { token: 'GFI', weight: 22 }, { token: 'CPOOL', weight: 20 }, { token: 'TRU', weight: 18 }, { token: 'FACTR', weight: 15 }], managementFee: 0.55, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Private credit and lending protocols' },
            { id: 'rwa-bonds', name: 'RWA Corporate Bonds', symbol: 'BOND', icon: '📜', price: 98.60, change24h: 0.3, aum: 145000000, holdings: [{ token: 'BOND', weight: 30 }, { token: 'CORP', weight: 25 }, { token: 'INVG', weight: 20 }, { token: 'HYLD', weight: 15 }, { token: 'MUNI', weight: 10 }], managementFee: 0.4, rebalanceFreq: 'Monthly', risk: 'low-medium', description: 'Tokenized corporate and municipal bonds' },
            { id: 'perps-index', name: 'Perps DEX Index', symbol: 'PERP', icon: '📈', price: 55.60, change24h: 7.8, aum: 110000000, holdings: [{ token: 'GMX', weight: 30 }, { token: 'DYDX', weight: 25 }, { token: 'SNX', weight: 20 }, { token: 'GNS', weight: 15 }, { token: 'VELO', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Perpetual DEX governance tokens' },
            { id: 'oracle-index', name: 'Oracle Index', symbol: 'ORAC', icon: '🔮', price: 42.80, change24h: 2.9, aum: 85000000, holdings: [{ token: 'LINK', weight: 45 }, { token: 'PYTH', weight: 25 }, { token: 'API3', weight: 15 }, { token: 'BAND', weight: 10 }, { token: 'TRB', weight: 5 }], managementFee: 0.55, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Blockchain oracle protocols' },
            { id: 'lsd-index', name: 'Liquid Staking Index', symbol: 'LSDI', icon: '💧', price: 125.40, change24h: 1.8, aum: 280000000, holdings: [{ token: 'LDO', weight: 35 }, { token: 'RPL', weight: 25 }, { token: 'FXS', weight: 18 }, { token: 'SWISE', weight: 12 }, { token: 'SD', weight: 10 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Liquid staking protocols' },
            { id: 'zk-index', name: 'ZK Rollup Index', symbol: 'ZKDX', icon: '🔐', price: 38.90, change24h: 9.5, aum: 75000000, holdings: [{ token: 'STRK', weight: 30 }, { token: 'ZK', weight: 25 }, { token: 'MANTA', weight: 20 }, { token: 'IMX', weight: 15 }, { token: 'ZETA', weight: 10 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'Zero-knowledge rollup tokens' },
            // === INDEX FUNDS BATCH 2 ===
            { id: 'ton-index', name: 'TON Ecosystem Index', symbol: 'TONX', icon: '💎', price: 28.50, change24h: 4.2, aum: 65000000, holdings: [{ token: 'TON', weight: 60 }, { token: 'NOT', weight: 20 }, { token: 'DOGS', weight: 15 }, { token: 'CATI', weight: 5 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Telegram/TON ecosystem tokens' },
            { id: 'infra-index', name: 'Infrastructure Index', symbol: 'INFRA', icon: '🏗️', price: 62.40, change24h: 2.1, aum: 120000000, holdings: [{ token: 'FIL', weight: 25 }, { token: 'AR', weight: 20 }, { token: 'GRT', weight: 20 }, { token: 'LPT', weight: 15 }, { token: 'STORJ', weight: 10 }, { token: 'POKT', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Decentralized infrastructure' },
            { id: 'bridge-index', name: 'Bridge & Interop Index', symbol: 'BRDG', icon: '🌉', price: 45.20, change24h: 3.8, aum: 55000000, holdings: [{ token: 'W', weight: 30 }, { token: 'AXL', weight: 25 }, { token: 'STG', weight: 20 }, { token: 'CCIP', weight: 15 }, { token: 'HOP', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Cross-chain bridge tokens' },
            { id: 'nft-index', name: 'NFT Infrastructure', symbol: 'NFTX', icon: '🖼️', price: 32.80, change24h: 5.5, aum: 45000000, holdings: [{ token: 'BLUR', weight: 30 }, { token: 'LOOKS', weight: 20 }, { token: 'X2Y2', weight: 15 }, { token: 'APE', weight: 20 }, { token: 'RARI', weight: 15 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'NFT marketplace tokens' },
            { id: 'social-index', name: 'Social Fi Index', symbol: 'SOCL', icon: '👥', price: 18.90, change24h: 8.2, aum: 35000000, holdings: [{ token: 'DESO', weight: 25 }, { token: 'LENS', weight: 25 }, { token: 'CYBER', weight: 20 }, { token: 'FCAST', weight: 15 }, { token: 'FRIEND', weight: 15 }], managementFee: 0.85, rebalanceFreq: 'Weekly', risk: 'high', description: 'Decentralized social tokens' },
            { id: 'move-index', name: 'Move Languages Index', symbol: 'MOVE', icon: '🔷', price: 52.30, change24h: 6.8, aum: 85000000, holdings: [{ token: 'APT', weight: 40 }, { token: 'SUI', weight: 40 }, { token: 'MOVR', weight: 20 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Move-based blockchains' },
            { id: 'eth-killers-index', name: 'ETH Alternatives', symbol: 'ALTS', icon: '⚔️', price: 78.90, change24h: 4.5, aum: 145000000, holdings: [{ token: 'SOL', weight: 30 }, { token: 'AVAX', weight: 20 }, { token: 'ADA', weight: 15 }, { token: 'NEAR', weight: 15 }, { token: 'FTM', weight: 10 }, { token: 'EGLD', weight: 10 }], managementFee: 0.55, rebalanceFreq: 'Monthly', risk: 'medium-high', description: 'Alternative L1 blockchains' },
            { id: 'real-yield-index', name: 'Real Yield Index', symbol: 'RYLD', icon: '💰', price: 95.20, change24h: 1.2, aum: 180000000, holdings: [{ token: 'GMX', weight: 25 }, { token: 'GNS', weight: 20 }, { token: 'RDNT', weight: 18 }, { token: 'VELO', weight: 17 }, { token: 'GRAIL', weight: 12 }, { token: 'SUSHI', weight: 8 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Protocols with real revenue' },
            { id: 'restaking-index', name: 'Restaking Index', symbol: 'RSTK', icon: '🔄', price: 42.50, change24h: 5.8, aum: 95000000, holdings: [{ token: 'ETHFI', weight: 30 }, { token: 'EIGEN', weight: 30 }, { token: 'REZ', weight: 20 }, { token: 'PUFFER', weight: 20 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'EigenLayer ecosystem tokens' },
            { id: 'lending-index', name: 'Lending Protocols', symbol: 'LEND', icon: '🏦', price: 68.40, change24h: 2.4, aum: 165000000, holdings: [{ token: 'AAVE', weight: 35 }, { token: 'COMP', weight: 20 }, { token: 'MKR', weight: 20 }, { token: 'MORPHO', weight: 15 }, { token: 'RDNT', weight: 10 }], managementFee: 0.5, rebalanceFreq: 'Monthly', risk: 'medium', description: 'DeFi lending protocols' },
            { id: 'modular-index', name: 'Modular Blockchain', symbol: 'MODUL', icon: '🧱', price: 35.80, change24h: 12.5, aum: 45000000, holdings: [{ token: 'TIA', weight: 40 }, { token: 'DYM', weight: 30 }, { token: 'MANTA', weight: 20 }, { token: 'ALT', weight: 10 }], managementFee: 0.85, rebalanceFreq: 'Weekly', risk: 'high', description: 'Modular blockchain tokens' },
            { id: 'perpetual-index', name: 'Perpetuals Index', symbol: 'PERPS', icon: '📊', price: 58.90, change24h: 6.2, aum: 125000000, holdings: [{ token: 'DYDX', weight: 30 }, { token: 'GMX', weight: 25 }, { token: 'GNS', weight: 20 }, { token: 'VRTX', weight: 15 }, { token: 'DRIFT', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Perpetual trading protocols' },
            { id: 'btc-ecosystem', name: 'Bitcoin Ecosystem', symbol: 'BTCFI', icon: '₿', price: 125.60, change24h: 3.2, aum: 220000000, holdings: [{ token: 'STX', weight: 35 }, { token: 'ORDI', weight: 25 }, { token: 'SATS', weight: 20 }, { token: 'RUNE', weight: 20 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'high', description: 'Bitcoin DeFi ecosystem' },
            { id: 'yield-aggregator', name: 'Yield Aggregators', symbol: 'YLDX', icon: '🔧', price: 48.20, change24h: 2.8, aum: 85000000, holdings: [{ token: 'YFI', weight: 35 }, { token: 'CVX', weight: 30 }, { token: 'BIFI', weight: 20 }, { token: 'ALPACA', weight: 15 }], managementFee: 0.55, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Yield farming aggregators' },
            { id: 'insurance-index', name: 'DeFi Insurance', symbol: 'INSR', icon: '🛡️', price: 22.40, change24h: 1.5, aum: 32000000, holdings: [{ token: 'NXM', weight: 40 }, { token: 'INSR', weight: 25 }, { token: 'COVER', weight: 20 }, { token: 'UNO', weight: 15 }], managementFee: 0.65, rebalanceFreq: 'Monthly', risk: 'medium', description: 'DeFi insurance protocols' },
            { id: 'data-index', name: 'Data & Analytics', symbol: 'DATA', icon: '📈', price: 38.60, change24h: 4.2, aum: 58000000, holdings: [{ token: 'GRT', weight: 35 }, { token: 'OCEAN', weight: 25 }, { token: 'API3', weight: 20 }, { token: 'DIA', weight: 20 }], managementFee: 0.6, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Blockchain data protocols' },
            { id: 'identity-index', name: 'Identity & Auth', symbol: 'IDNT', icon: '🔑', price: 15.80, change24h: 3.5, aum: 25000000, holdings: [{ token: 'ENS', weight: 40 }, { token: 'WLD', weight: 30 }, { token: 'SPACE', weight: 15 }, { token: 'LIT', weight: 15 }], managementFee: 0.7, rebalanceFreq: 'Monthly', risk: 'medium-high', description: 'Digital identity tokens' },
            { id: 'cross-chain', name: 'Cross-Chain Index', symbol: 'CROSS', icon: '🔗', price: 52.90, change24h: 5.8, aum: 72000000, holdings: [{ token: 'ATOM', weight: 25 }, { token: 'DOT', weight: 25 }, { token: 'RUNE', weight: 20 }, { token: 'AXL', weight: 15 }, { token: 'ZRO', weight: 15 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Interoperability tokens' },
            { id: 'gaming-metaverse-index', name: 'Gaming + Metaverse', symbol: 'GMVS', icon: '🎮', price: 28.40, change24h: 7.2, aum: 95000000, holdings: [{ token: 'IMX', weight: 25 }, { token: 'GALA', weight: 20 }, { token: 'SAND', weight: 15 }, { token: 'AXS', weight: 15 }, { token: 'MANA', weight: 15 }, { token: 'ENJ', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Gaming and metaverse tokens' },
            { id: 'trading-index', name: 'Trading Platforms', symbol: 'TRDX', icon: '💹', price: 72.30, change24h: 3.8, aum: 135000000, holdings: [{ token: 'UNI', weight: 30 }, { token: 'DYDX', weight: 25 }, { token: 'JUP', weight: 20 }, { token: '1INCH', weight: 15 }, { token: 'SUSHI', weight: 10 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'DEX and trading protocols' },
            // === INDEX FUNDS BATCH 3 - MEGA EXPANSION ===
            { id: 'depin-index', name: 'DePIN Index', symbol: 'DEPIN', icon: '📡', price: 45.60, change24h: 8.2, aum: 78000000, holdings: [{ token: 'HNT', weight: 25 }, { token: 'RNDR', weight: 20 }, { token: 'FIL', weight: 18 }, { token: 'AR', weight: 15 }, { token: 'IOTX', weight: 12 }, { token: 'MOBILE', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Decentralized Physical Infrastructure' },
            { id: 'fan-token-index', name: 'Fan Tokens Index', symbol: 'FANS', icon: '⚽', price: 18.40, change24h: 2.5, aum: 35000000, holdings: [{ token: 'CHZ', weight: 40 }, { token: 'BAR', weight: 15 }, { token: 'PSG', weight: 15 }, { token: 'JUV', weight: 10 }, { token: 'ACM', weight: 10 }, { token: 'ATM', weight: 10 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'Sports and entertainment fan tokens' },
            { id: 'payments-index', name: 'Payments Index', symbol: 'PAYX', icon: '💸', price: 62.80, change24h: 1.8, aum: 145000000, holdings: [{ token: 'XRP', weight: 30 }, { token: 'XLM', weight: 25 }, { token: 'HBAR', weight: 20 }, { token: 'ALGO', weight: 15 }, { token: 'XDC', weight: 10 }], managementFee: 0.45, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Payment-focused cryptocurrencies' },
            { id: 'dao-index', name: 'DAO Governance', symbol: 'DAOX', icon: '🗳️', price: 38.20, change24h: 3.5, aum: 55000000, holdings: [{ token: 'UNI', weight: 25 }, { token: 'AAVE', weight: 22 }, { token: 'CRV', weight: 18 }, { token: 'ENS', weight: 15 }, { token: 'SAFE', weight: 12 }, { token: 'ARB', weight: 8 }], managementFee: 0.55, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Major DAO governance tokens' },
            { id: 'scaling-index', name: 'Scaling Solutions', symbol: 'SCALE', icon: '📈', price: 55.90, change24h: 5.2, aum: 125000000, holdings: [{ token: 'MATIC', weight: 25 }, { token: 'ARB', weight: 22 }, { token: 'OP', weight: 20 }, { token: 'STRK', weight: 15 }, { token: 'MANTA', weight: 10 }, { token: 'METIS', weight: 8 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'L2 and scaling solutions' },
            { id: 'smart-contract-index', name: 'Smart Contracts', symbol: 'SMRT', icon: '📜', price: 125.40, change24h: 2.8, aum: 320000000, holdings: [{ token: 'ETH', weight: 40 }, { token: 'SOL', weight: 20 }, { token: 'ADA', weight: 12 }, { token: 'AVAX', weight: 10 }, { token: 'DOT', weight: 10 }, { token: 'NEAR', weight: 8 }], managementFee: 0.4, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Leading smart contract platforms' },
            { id: 'exchange-index', name: 'Exchange Tokens', symbol: 'CEXX', icon: '🏛️', price: 88.50, change24h: 1.5, aum: 185000000, holdings: [{ token: 'BNB', weight: 45 }, { token: 'OKB', weight: 20 }, { token: 'CRO', weight: 15 }, { token: 'KCS', weight: 12 }, { token: 'GT', weight: 8 }], managementFee: 0.5, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Centralized exchange tokens' },
            { id: 'stablecoin-yield-index', name: 'Stablecoin Yield', symbol: 'SYLD', icon: '💰', price: 102.80, change24h: 0.1, aum: 420000000, holdings: [{ token: 'USDe', weight: 30 }, { token: 'sDAI', weight: 25 }, { token: 'crvUSD', weight: 20 }, { token: 'GHO', weight: 15 }, { token: 'FRAX', weight: 10 }], managementFee: 0.3, rebalanceFreq: 'Daily', risk: 'low', description: 'Yield-bearing stablecoins' },
            { id: 'low-cap-gems', name: 'Low Cap Gems', symbol: 'GEMS', icon: '💎', price: 22.40, change24h: 12.5, aum: 25000000, holdings: [{ token: 'OLAS', weight: 20 }, { token: 'PRIME', weight: 18 }, { token: 'MOG', weight: 15 }, { token: 'PEPE2', weight: 15 }, { token: 'TURBO', weight: 12 }, { token: 'LADYS', weight: 10 }, { token: 'BITCOIN', weight: 10 }], managementFee: 1.0, rebalanceFreq: 'Weekly', risk: 'high', description: 'High potential low market cap tokens' },
            { id: 'blue-chip-defi', name: 'Blue Chip DeFi', symbol: 'BLUE', icon: '🔷', price: 95.60, change24h: 2.2, aum: 280000000, holdings: [{ token: 'UNI', weight: 20 }, { token: 'AAVE', weight: 18 }, { token: 'MKR', weight: 16 }, { token: 'LDO', weight: 14 }, { token: 'CRV', weight: 12 }, { token: 'COMP', weight: 10 }, { token: 'SNX', weight: 10 }], managementFee: 0.45, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Established DeFi protocols' },
            { id: 'eth-ecosystem-index', name: 'Ethereum Ecosystem', symbol: 'ETHX', icon: '⟠', price: 142.30, change24h: 3.1, aum: 380000000, holdings: [{ token: 'LDO', weight: 22 }, { token: 'UNI', weight: 18 }, { token: 'AAVE', weight: 15 }, { token: 'ENS', weight: 12 }, { token: 'RPL', weight: 10 }, { token: 'CRV', weight: 8 }, { token: 'MKR', weight: 8 }, { token: 'BLUR', weight: 7 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Top Ethereum ecosystem tokens' },
            { id: 'narrative-index', name: 'Hot Narratives', symbol: 'NARR', icon: '🔥', price: 35.80, change24h: 15.2, aum: 45000000, holdings: [{ token: 'WLD', weight: 20 }, { token: 'TIA', weight: 18 }, { token: 'ETHFI', weight: 15 }, { token: 'ENA', weight: 15 }, { token: 'JUP', weight: 12 }, { token: 'W', weight: 10 }, { token: 'STRK', weight: 10 }], managementFee: 0.9, rebalanceFreq: 'Weekly', risk: 'high', description: 'Trending narrative tokens' },
            { id: 'pow-index', name: 'Proof of Work', symbol: 'POWX', icon: '⛏️', price: 185.60, change24h: 2.5, aum: 520000000, holdings: [{ token: 'BTC', weight: 60 }, { token: 'LTC', weight: 15 }, { token: 'KAS', weight: 10 }, { token: 'DOGE', weight: 8 }, { token: 'ETC', weight: 7 }], managementFee: 0.35, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Proof of Work cryptocurrencies' },
            { id: 'asia-index', name: 'Asia Crypto Index', symbol: 'ASIA', icon: '🌏', price: 58.90, change24h: 4.8, aum: 95000000, holdings: [{ token: 'TON', weight: 25 }, { token: 'VET', weight: 20 }, { token: 'NEO', weight: 18 }, { token: 'ONT', weight: 15 }, { token: 'QTUM', weight: 12 }, { token: 'ZIL', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Asian blockchain projects' },
            { id: 'european-index', name: 'Euro Crypto Index', symbol: 'EURO', icon: '🇪🇺', price: 72.40, change24h: 2.1, aum: 75000000, holdings: [{ token: 'IOTA', weight: 25 }, { token: 'AAVE', weight: 22 }, { token: 'EWT', weight: 18 }, { token: 'OCEAN', weight: 15 }, { token: 'AGIX', weight: 12 }, { token: 'LRC', weight: 8 }], managementFee: 0.6, rebalanceFreq: 'Monthly', risk: 'medium', description: 'European blockchain projects' },
            { id: 'green-crypto-index', name: 'Green Crypto', symbol: 'GREEN', icon: '🌱', price: 42.60, change24h: 1.8, aum: 55000000, holdings: [{ token: 'ALGO', weight: 25 }, { token: 'XTZ', weight: 22 }, { token: 'HBAR', weight: 20 }, { token: 'CHIA', weight: 15 }, { token: 'CELO', weight: 10 }, { token: 'FLOW', weight: 8 }], managementFee: 0.55, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Environmentally friendly blockchains' },
            { id: 'web3-index', name: 'Web3 Index', symbol: 'WEB3', icon: '🌐', price: 68.90, change24h: 5.5, aum: 145000000, holdings: [{ token: 'FIL', weight: 20 }, { token: 'GRT', weight: 18 }, { token: 'AR', weight: 16 }, { token: 'LPT', weight: 14 }, { token: 'BAT', weight: 12 }, { token: 'STORJ', weight: 10 }, { token: 'SC', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Decentralized web infrastructure' },
            { id: 'institutional-index', name: 'Institutional Grade', symbol: 'INST', icon: '🏦', price: 158.40, change24h: 1.2, aum: 650000000, holdings: [{ token: 'BTC', weight: 50 }, { token: 'ETH', weight: 35 }, { token: 'SOL', weight: 8 }, { token: 'LINK', weight: 4 }, { token: 'AAVE', weight: 3 }], managementFee: 0.25, rebalanceFreq: 'Monthly', risk: 'low-medium', description: 'Institutional-grade crypto assets' },
            { id: 'momentum-index', name: 'Momentum Index', symbol: 'MOMO', icon: '🚀', price: 48.20, change24h: 18.5, aum: 35000000, holdings: [{ token: 'PEPE', weight: 20 }, { token: 'WIF', weight: 18 }, { token: 'BONK', weight: 15 }, { token: 'FLOKI', weight: 15 }, { token: 'SHIB', weight: 12 }, { token: 'DOGE', weight: 10 }, { token: 'TURBO', weight: 10 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'High momentum meme tokens' },
            { id: 'dividend-index', name: 'Dividend Yield', symbol: 'DIVD', icon: '💵', price: 85.60, change24h: 0.8, aum: 175000000, holdings: [{ token: 'GMX', weight: 25 }, { token: 'GNS', weight: 22 }, { token: 'SUSHI', weight: 18 }, { token: 'SNX', weight: 15 }, { token: 'VELO', weight: 12 }, { token: 'GRAIL', weight: 8 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Revenue-sharing DeFi tokens' },
            // === INDEX FUNDS BATCH 4 ===
            { id: 'zk-chains-index', name: 'ZK Chains Index', symbol: 'ZKCH', icon: '🔐', price: 42.80, change24h: 8.5, aum: 65000000, holdings: [{ token: 'STRK', weight: 30 }, { token: 'ZK', weight: 25 }, { token: 'MANTA', weight: 20 }, { token: 'ZETA', weight: 15 }, { token: 'TAIKO', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Zero-knowledge L2 chains' },
            { id: 'new-l2-index', name: 'New L2s Index', symbol: 'NL2X', icon: '⚡', price: 38.50, change24h: 12.2, aum: 55000000, holdings: [{ token: 'STRK', weight: 25 }, { token: 'MANTA', weight: 20 }, { token: 'BLAST', weight: 20 }, { token: 'MODE', weight: 18 }, { token: 'SCROLL', weight: 17 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: '2024-2025 L2 launches' },
            { id: 'rollup-index', name: 'Rollup Tech Index', symbol: 'ROLL', icon: '📜', price: 58.20, change24h: 6.8, aum: 85000000, holdings: [{ token: 'ARB', weight: 25 }, { token: 'OP', weight: 22 }, { token: 'STRK', weight: 18 }, { token: 'ZK', weight: 15 }, { token: 'METIS', weight: 12 }, { token: 'BOBA', weight: 8 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Rollup technology leaders' },
            { id: 'airdrop-index', name: 'Airdrop Tokens', symbol: 'DROP', icon: '🪂', price: 28.40, change24h: 15.5, aum: 35000000, holdings: [{ token: 'JUP', weight: 22 }, { token: 'W', weight: 18 }, { token: 'STRK', weight: 16 }, { token: 'ZK', weight: 14 }, { token: 'EIGEN', weight: 12 }, { token: 'ETHFI', weight: 10 }, { token: 'ENA', weight: 8 }], managementFee: 0.85, rebalanceFreq: 'Weekly', risk: 'high', description: 'Major 2024-2025 airdrops' },
            { id: 'base-index', name: 'Base Ecosystem', symbol: 'BASE', icon: '🔵', price: 35.60, change24h: 7.2, aum: 45000000, holdings: [{ token: 'AERO', weight: 35 }, { token: 'BRETT', weight: 20 }, { token: 'DEGEN', weight: 18 }, { token: 'TOSHI', weight: 15 }, { token: 'HIGHER', weight: 12 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Coinbase Base L2 tokens' },
            { id: 'perp-dex-index', name: 'Perp DEX Index', symbol: 'PDEX', icon: '📊', price: 62.40, change24h: 4.5, aum: 125000000, holdings: [{ token: 'DYDX', weight: 28 }, { token: 'GMX', weight: 24 }, { token: 'GNS', weight: 18 }, { token: 'SNX', weight: 15 }, { token: 'VRTX', weight: 10 }, { token: 'DRIFT', weight: 5 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Perpetual DEX protocols' },
            { id: 've-token-index', name: 've-Token Index', symbol: 'VETX', icon: '🔒', price: 48.90, change24h: 3.2, aum: 75000000, holdings: [{ token: 'CRV', weight: 28 }, { token: 'VELO', weight: 22 }, { token: 'AERO', weight: 18 }, { token: 'BAL', weight: 15 }, { token: 'PENDLE', weight: 10 }, { token: 'ANGLE', weight: 7 }], managementFee: 0.55, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Vote-escrowed token protocols' },
            { id: 'points-meta-index', name: 'Points Meta Index', symbol: 'PNTS', icon: '⭐', price: 32.80, change24h: 18.5, aum: 28000000, holdings: [{ token: 'ETHFI', weight: 25 }, { token: 'ENA', weight: 22 }, { token: 'EIGEN', weight: 20 }, { token: 'REZ', weight: 18 }, { token: 'PUFFER', weight: 15 }], managementFee: 0.9, rebalanceFreq: 'Weekly', risk: 'high', description: 'Points farming protocols' },
            { id: 'ethena-index', name: 'Ethena Ecosystem', symbol: 'ETNA', icon: 'E', price: 45.20, change24h: 5.8, aum: 95000000, holdings: [{ token: 'ENA', weight: 50 }, { token: 'USDe', weight: 30 }, { token: 'sUSDe', weight: 20 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Ethena protocol ecosystem' },
            { id: 'lrt-index', name: 'LRT Index', symbol: 'LRTX', icon: '🔄', price: 52.60, change24h: 4.2, aum: 145000000, holdings: [{ token: 'ETHFI', weight: 28 }, { token: 'EIGEN', weight: 25 }, { token: 'REZ', weight: 18 }, { token: 'PUFFER', weight: 15 }, { token: 'KELP', weight: 14 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Liquid restaking tokens' },
            { id: 'defi-2024-index', name: 'DeFi 2024 Stars', symbol: 'DF24', icon: '🌟', price: 38.90, change24h: 9.5, aum: 55000000, holdings: [{ token: 'PENDLE', weight: 22 }, { token: 'ENA', weight: 20 }, { token: 'ETHFI', weight: 18 }, { token: 'JUP', weight: 16 }, { token: 'EIGEN', weight: 14 }, { token: 'W', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Top DeFi performers 2024' },
            { id: 'solana-meme-index', name: 'Solana Memes', symbol: 'SOLM', icon: '🐕', price: 22.40, change24h: 25.5, aum: 32000000, holdings: [{ token: 'WIF', weight: 30 }, { token: 'BONK', weight: 28 }, { token: 'POPCAT', weight: 18 }, { token: 'MEW', weight: 14 }, { token: 'BOME', weight: 10 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Solana meme tokens' },
            { id: 'eth-meme-index', name: 'ETH Memes', symbol: 'ETHM', icon: '🐸', price: 18.60, change24h: 22.8, aum: 25000000, holdings: [{ token: 'PEPE', weight: 35 }, { token: 'FLOKI', weight: 25 }, { token: 'SHIB', weight: 20 }, { token: 'MOG', weight: 12 }, { token: 'TURBO', weight: 8 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Ethereum meme tokens' },
            { id: 'cat-meme-index', name: 'Cat Memes', symbol: 'CATS', icon: '🐱', price: 8.50, change24h: 35.2, aum: 12000000, holdings: [{ token: 'POPCAT', weight: 35 }, { token: 'MEW', weight: 30 }, { token: 'MOG', weight: 20 }, { token: 'CATI', weight: 15 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Cat-themed meme tokens' },
            { id: 'dog-meme-index', name: 'Dog Memes', symbol: 'DOGS', icon: '🐕', price: 15.80, change24h: 18.5, aum: 45000000, holdings: [{ token: 'DOGE', weight: 30 }, { token: 'SHIB', weight: 25 }, { token: 'WIF', weight: 20 }, { token: 'BONK', weight: 15 }, { token: 'FLOKI', weight: 10 }], managementFee: 0.9, rebalanceFreq: 'Daily', risk: 'high', description: 'Dog-themed meme tokens' },
            { id: 'high-beta-index', name: 'High Beta Index', symbol: 'BETA', icon: '📈', price: 42.30, change24h: 12.8, aum: 35000000, holdings: [{ token: 'PEPE', weight: 18 }, { token: 'WIF', weight: 16 }, { token: 'STRK', weight: 14 }, { token: 'TIA', weight: 14 }, { token: 'JUP', weight: 12 }, { token: 'ENA', weight: 12 }, { token: 'ETHFI', weight: 8 }, { token: 'DYM', weight: 6 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'High volatility tokens' },
            { id: 'stablecoin-protocol-index', name: 'Stablecoin Protocols', symbol: 'STBL', icon: '🏛️', price: 75.40, change24h: 1.2, aum: 185000000, holdings: [{ token: 'MKR', weight: 30 }, { token: 'FXS', weight: 22 }, { token: 'LQTY', weight: 18 }, { token: 'SPELL', weight: 12 }, { token: 'CRV', weight: 10 }, { token: 'ANGLE', weight: 8 }], managementFee: 0.5, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Stablecoin issuers/protocols' },
            { id: 'storage-index', name: 'Storage Index', symbol: 'STOR', icon: '💾', price: 38.60, change24h: 3.5, aum: 65000000, holdings: [{ token: 'FIL', weight: 35 }, { token: 'AR', weight: 30 }, { token: 'STORJ', weight: 18 }, { token: 'SC', weight: 12 }, { token: 'BLZ', weight: 5 }], managementFee: 0.55, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Decentralized storage' },
            { id: 'compute-index', name: 'Compute Index', symbol: 'COMP', icon: '🖥️', price: 65.80, change24h: 6.8, aum: 95000000, holdings: [{ token: 'RNDR', weight: 32 }, { token: 'AKT', weight: 25 }, { token: 'GLM', weight: 18 }, { token: 'FLUX', weight: 15 }, { token: 'NKN', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Decentralized compute' },
            { id: 'video-streaming-index', name: 'Video & Streaming', symbol: 'VIDX', icon: '📺', price: 28.40, change24h: 4.2, aum: 35000000, holdings: [{ token: 'LPT', weight: 40 }, { token: 'THETA', weight: 30 }, { token: 'VRA', weight: 18 }, { token: 'AIOZ', weight: 12 }], managementFee: 0.65, rebalanceFreq: 'Monthly', risk: 'medium-high', description: 'Video/streaming infrastructure' },
            // === INDEX FUNDS BATCH 5 - MEGA ===
            { id: 'blast-index', name: 'Blast Ecosystem', symbol: 'BLST', icon: '💥', price: 32.40, change24h: 15.5, aum: 35000000, holdings: [{ token: 'BLAST', weight: 40 }, { token: 'JUICE', weight: 20 }, { token: 'ORBIT', weight: 15 }, { token: 'PACMAN', weight: 15 }, { token: 'SSS', weight: 10 }], managementFee: 0.85, rebalanceFreq: 'Weekly', risk: 'high', description: 'Blast L2 ecosystem' },
            { id: 'scroll-index', name: 'Scroll Ecosystem', symbol: 'SCRL', icon: '📜', price: 28.60, change24h: 12.2, aum: 28000000, holdings: [{ token: 'SCR', weight: 50 }, { token: 'NURI', weight: 25 }, { token: 'TOKAN', weight: 15 }, { token: 'AMBIENT', weight: 10 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'Scroll zkEVM tokens' },
            { id: 'mode-index', name: 'Mode Ecosystem', symbol: 'MODX', icon: '🟡', price: 22.80, change24h: 18.5, aum: 18000000, holdings: [{ token: 'MODE', weight: 50 }, { token: 'KIM', weight: 25 }, { token: 'IONIC', weight: 15 }, { token: 'VELO', weight: 10 }], managementFee: 0.85, rebalanceFreq: 'Weekly', risk: 'high', description: 'Mode Network tokens' },
            { id: 'linea-index', name: 'Linea Ecosystem', symbol: 'LINX', icon: '🔵', price: 18.40, change24h: 8.5, aum: 22000000, holdings: [{ token: 'LINEA', weight: 50 }, { token: 'FOXY', weight: 20 }, { token: 'LYNX', weight: 18 }, { token: 'NILE', weight: 12 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'Linea L2 tokens' },
            { id: 'helium-index', name: 'Helium Ecosystem', symbol: 'HLMX', icon: '📡', price: 45.60, change24h: 3.2, aum: 85000000, holdings: [{ token: 'HNT', weight: 50 }, { token: 'MOBILE', weight: 30 }, { token: 'IOT', weight: 20 }], managementFee: 0.55, rebalanceFreq: 'Monthly', risk: 'medium', description: 'Helium DePIN ecosystem' },
            { id: 'cosmos-defi-index', name: 'Cosmos DeFi', symbol: 'CDEF', icon: '⚛', price: 38.90, change24h: 5.8, aum: 65000000, holdings: [{ token: 'OSMO', weight: 25 }, { token: 'ASTRO', weight: 20 }, { token: 'MARS', weight: 18 }, { token: 'WHALE', weight: 15 }, { token: 'KUJI', weight: 12 }, { token: 'LVN', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Cosmos DeFi protocols' },
            { id: 'thorchain-index', name: 'THORChain Ecosystem', symbol: 'THOR', icon: '⚡', price: 68.40, change24h: 4.5, aum: 95000000, holdings: [{ token: 'RUNE', weight: 60 }, { token: 'CACAO', weight: 25 }, { token: 'TGT', weight: 15 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'THORChain ecosystem' },
            { id: 'arbitrum-native-index', name: 'Arbitrum Native', symbol: 'ARBX', icon: '🔵', price: 52.30, change24h: 6.2, aum: 145000000, holdings: [{ token: 'ARB', weight: 30 }, { token: 'GMX', weight: 22 }, { token: 'GRAIL', weight: 15 }, { token: 'RDNT', weight: 12 }, { token: 'GNS', weight: 11 }, { token: 'VRTX', weight: 10 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Arbitrum native protocols' },
            { id: 'optimism-native-index', name: 'Optimism Native', symbol: 'OPNX', icon: '🔴', price: 42.60, change24h: 5.5, aum: 95000000, holdings: [{ token: 'OP', weight: 35 }, { token: 'VELO', weight: 25 }, { token: 'SNX', weight: 20 }, { token: 'THALES', weight: 12 }, { token: 'LYRA', weight: 8 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Optimism native protocols' },
            { id: 'base-native-index', name: 'Base Native', symbol: 'BSNX', icon: '🔵', price: 35.80, change24h: 8.8, aum: 75000000, holdings: [{ token: 'AERO', weight: 35 }, { token: 'BRETT', weight: 20 }, { token: 'DEGEN', weight: 18 }, { token: 'TOSHI', weight: 15 }, { token: 'NORMIE', weight: 12 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Base native tokens' },
            { id: 'solana-meme-v2', name: 'Solana Memes V2', symbol: 'SLM2', icon: '🐕', price: 15.20, change24h: 28.5, aum: 25000000, holdings: [{ token: 'WIF', weight: 25 }, { token: 'POPCAT', weight: 22 }, { token: 'MEW', weight: 20 }, { token: 'BOME', weight: 18 }, { token: 'SLERF', weight: 15 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Hot Solana meme tokens' },
            { id: 'ai-agents-index', name: 'AI Agents Index', symbol: 'AIAG', icon: '🤖', price: 48.90, change24h: 12.5, aum: 55000000, holdings: [{ token: 'VIRTUAL', weight: 25 }, { token: 'AI16Z', weight: 22 }, { token: 'OLAS', weight: 18 }, { token: 'GRIFFAIN', weight: 15 }, { token: 'ELIZA', weight: 10 }, { token: 'ZEREBRO', weight: 10 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'AI agent tokens' },
            { id: 'gamefi-index', name: 'GameFi Index', symbol: 'GMFI', icon: '🎮', price: 28.40, change24h: 6.5, aum: 65000000, holdings: [{ token: 'PRIME', weight: 25 }, { token: 'IMX', weight: 22 }, { token: 'GALA', weight: 18 }, { token: 'BEAM', weight: 15 }, { token: 'RON', weight: 12 }, { token: 'PYR', weight: 8 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'GameFi tokens' },
            { id: 'nft-blue-chip', name: 'NFT Blue Chips', symbol: 'NFTB', icon: '🖼️', price: 35.60, change24h: 4.2, aum: 45000000, holdings: [{ token: 'APE', weight: 30 }, { token: 'BLUR', weight: 25 }, { token: 'LOOKS', weight: 18 }, { token: 'RARI', weight: 15 }, { token: 'NFTX', weight: 12 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'NFT marketplace tokens' },
            { id: 'defi-options-index', name: 'DeFi Options', symbol: 'OPTX', icon: '📊', price: 42.80, change24h: 5.8, aum: 55000000, holdings: [{ token: 'LYRA', weight: 25 }, { token: 'DOPEX', weight: 22 }, { token: 'PREMIA', weight: 20 }, { token: 'HEGIC', weight: 18 }, { token: 'SIREN', weight: 15 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'DeFi options protocols' },
            { id: 'prediction-markets-index', name: 'Prediction Markets', symbol: 'PRED', icon: '🎰', price: 28.90, change24h: 8.5, aum: 35000000, holdings: [{ token: 'GNO', weight: 35 }, { token: 'AZUR', weight: 25 }, { token: 'OMEN', weight: 22 }, { token: 'SEER', weight: 18 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Prediction market tokens' },
            { id: 'real-world-yield', name: 'RWA Yield Index', symbol: 'RWYL', icon: '💵', price: 108.40, change24h: 0.8, aum: 285000000, holdings: [{ token: 'USDY', weight: 25 }, { token: 'USDM', weight: 22 }, { token: 'STBT', weight: 20 }, { token: 'BUIDL', weight: 18 }, { token: 'OUSG', weight: 15 }], managementFee: 0.35, rebalanceFreq: 'Weekly', risk: 'very-low', description: 'Tokenized yield assets' },
            { id: 'perpetual-governance', name: 'Perp Governance', symbol: 'PGOV', icon: '🗳️', price: 55.60, change24h: 4.5, aum: 85000000, holdings: [{ token: 'GMX', weight: 28 }, { token: 'GNS', weight: 24 }, { token: 'DYDX', weight: 22 }, { token: 'VRTX', weight: 15 }, { token: 'DRIFT', weight: 11 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Perp protocol governance' },
            { id: 'stable-yield-max', name: 'Stable Yield Max', symbol: 'SYMAX', icon: '💰', price: 105.20, change24h: 0.1, aum: 350000000, holdings: [{ token: 'sUSDe', weight: 30 }, { token: 'sDAI', weight: 25 }, { token: 'GHO', weight: 20 }, { token: 'crvUSD', weight: 15 }, { token: 'FRAX', weight: 10 }], managementFee: 0.3, rebalanceFreq: 'Daily', risk: 'low', description: 'Max yield stablecoins' },
            { id: 'dex-aggregator-index', name: 'DEX Aggregators', symbol: 'DAGG', icon: '🔄', price: 42.30, change24h: 3.8, aum: 75000000, holdings: [{ token: '1INCH', weight: 30 }, { token: 'COW', weight: 25 }, { token: 'PARA', weight: 20 }, { token: 'ODOS', weight: 15 }, { token: 'DODO', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'DEX aggregator tokens' },
            { id: 'leveraged-tokens-index', name: 'Leveraged Token Index', symbol: 'LEVX', icon: '📈', price: 58.90, change24h: 8.5, aum: 45000000, holdings: [{ token: 'DYDX', weight: 30 }, { token: 'SNX', weight: 25 }, { token: 'GMX', weight: 22 }, { token: 'GNS', weight: 15 }, { token: 'MUX', weight: 8 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Leverage protocol tokens' },
            { id: 'depin-v2-index', name: 'DePIN V2 Index', symbol: 'DPN2', icon: '📡', price: 52.40, change24h: 9.2, aum: 65000000, holdings: [{ token: 'RNDR', weight: 22 }, { token: 'HNT', weight: 20 }, { token: 'AKT', weight: 18 }, { token: 'IOTX', weight: 15 }, { token: 'DIMO', weight: 13 }, { token: 'HONEY', weight: 12 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'DePIN V2 tokens' },
            { id: 'layer-zero-index', name: 'LayerZero Ecosystem', symbol: 'LZ0X', icon: '🌐', price: 38.60, change24h: 5.5, aum: 55000000, holdings: [{ token: 'ZRO', weight: 40 }, { token: 'STG', weight: 25 }, { token: 'RDNT', weight: 20 }, { token: 'CAKE', weight: 15 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'LayerZero powered tokens' },
            { id: 'polygon-index', name: 'Polygon Ecosystem', symbol: 'POLX', icon: '⬡', price: 48.20, change24h: 4.2, aum: 125000000, holdings: [{ token: 'MATIC', weight: 35 }, { token: 'QUICK', weight: 20 }, { token: 'AAVEGOTCHI', weight: 18 }, { token: 'SAND', weight: 15 }, { token: 'REVV', weight: 12 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Polygon ecosystem' },
            { id: 'bnb-defi-index', name: 'BNB DeFi Index', symbol: 'BNBX', icon: '💛', price: 82.40, change24h: 2.8, aum: 185000000, holdings: [{ token: 'CAKE', weight: 30 }, { token: 'XVS', weight: 22 }, { token: 'ALPACA', weight: 18 }, { token: 'BIFI', weight: 15 }, { token: 'THE', weight: 15 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'BNB Chain DeFi' },
            { id: 'fantom-index', name: 'Fantom Ecosystem', symbol: 'FTMX', icon: '👻', price: 28.90, change24h: 6.8, aum: 45000000, holdings: [{ token: 'FTM', weight: 40 }, { token: 'EQUAL', weight: 22 }, { token: 'BEETS', weight: 18 }, { token: 'BOO', weight: 12 }, { token: 'SCREAM', weight: 8 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Fantom ecosystem' },
            { id: 'avax-defi-index', name: 'Avalanche DeFi', symbol: 'AVXD', icon: '🔺', price: 55.60, change24h: 4.5, aum: 95000000, holdings: [{ token: 'AVAX', weight: 35 }, { token: 'JOE', weight: 22 }, { token: 'GMX', weight: 18 }, { token: 'BENQI', weight: 15 }, { token: 'XAVA', weight: 10 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Avalanche DeFi' },
            { id: 'telegram-index', name: 'Telegram Ecosystem', symbol: 'TGRAM', icon: '✈️', price: 32.40, change24h: 7.5, aum: 55000000, holdings: [{ token: 'TON', weight: 45 }, { token: 'NOT', weight: 22 }, { token: 'DOGS', weight: 18 }, { token: 'CATI', weight: 15 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Telegram/TON ecosystem' },
            { id: 'frog-meme-index', name: 'Frog Memes', symbol: 'FROG', icon: '🐸', price: 12.40, change24h: 22.5, aum: 18000000, holdings: [{ token: 'PEPE', weight: 45 }, { token: 'TURBO', weight: 25 }, { token: 'PEPECOIN', weight: 18 }, { token: 'FROG', weight: 12 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Frog-themed memes' },
            { id: 'newly-listed-index', name: 'Newly Listed', symbol: 'NEWX', icon: '🆕', price: 28.80, change24h: 25.5, aum: 22000000, holdings: [{ token: 'HYPE', weight: 25 }, { token: 'ME', weight: 22 }, { token: 'USUAL', weight: 20 }, { token: 'MOVE', weight: 18 }, { token: 'VANA', weight: 15 }], managementFee: 1.0, rebalanceFreq: 'Weekly', risk: 'high', description: 'Recently listed tokens' },
            // === INDEX FUNDS BATCH 6 - ULTRA ===
            { id: 'layerzero-bridges-index', name: 'LayerZero Bridges', symbol: 'LZBR', icon: '🌉', price: 42.50, change24h: 6.8, aum: 65000000, holdings: [{ token: 'ZRO', weight: 35 }, { token: 'STG', weight: 25 }, { token: 'W', weight: 20 }, { token: 'ACROSS', weight: 12 }, { token: 'HOP', weight: 8 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Cross-chain bridge tokens' },
            { id: 'eth-staking-index', name: 'ETH Staking Providers', symbol: 'ETHSP', icon: '⟠', price: 125.40, change24h: 1.2, aum: 450000000, holdings: [{ token: 'LDO', weight: 35 }, { token: 'RPL', weight: 25 }, { token: 'SSV', weight: 18 }, { token: 'SWISE', weight: 12 }, { token: 'ANKR', weight: 10 }], managementFee: 0.45, rebalanceFreq: 'Weekly', risk: 'low-medium', description: 'ETH liquid staking providers' },
            { id: 'defi-derivatives-index', name: 'DeFi Derivatives', symbol: 'DFDV', icon: '📊', price: 58.90, change24h: 7.5, aum: 95000000, holdings: [{ token: 'SNX', weight: 25 }, { token: 'GMX', weight: 22 }, { token: 'DYDX', weight: 20 }, { token: 'GNS', weight: 15 }, { token: 'PERP', weight: 10 }, { token: 'MUX', weight: 8 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Derivatives protocols' },
            { id: 'privacy-tech-index', name: 'Privacy Tech', symbol: 'PRIV', icon: '🔒', price: 38.20, change24h: 3.5, aum: 35000000, holdings: [{ token: 'ZEC', weight: 30 }, { token: 'SCRT', weight: 25 }, { token: 'OASIS', weight: 20 }, { token: 'NYM', weight: 15 }, { token: 'AZTEC', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Privacy blockchain tokens' },
            { id: 'social-tokens-index', name: 'Social Tokens', symbol: 'SOCL', icon: '👥', price: 32.60, change24h: 12.5, aum: 42000000, holdings: [{ token: 'CYBER', weight: 28 }, { token: 'LENS', weight: 25 }, { token: 'ID', weight: 20 }, { token: 'ENS', weight: 15 }, { token: 'GTC', weight: 12 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Social/identity tokens' },
            { id: 'oracle-index', name: 'Oracle Networks', symbol: 'ORCL', icon: '🔗', price: 68.40, change24h: 2.8, aum: 185000000, holdings: [{ token: 'LINK', weight: 45 }, { token: 'PYTH', weight: 25 }, { token: 'API3', weight: 15 }, { token: 'BAND', weight: 10 }, { token: 'UMA', weight: 5 }], managementFee: 0.45, rebalanceFreq: 'Weekly', risk: 'low-medium', description: 'Oracle infrastructure' },
            { id: 'data-storage-index', name: 'Data Storage', symbol: 'DATA', icon: '💾', price: 45.80, change24h: 4.2, aum: 75000000, holdings: [{ token: 'FIL', weight: 35 }, { token: 'AR', weight: 30 }, { token: 'STORJ', weight: 18 }, { token: 'BLZ', weight: 10 }, { token: 'CRUST', weight: 7 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Decentralized storage' },
            { id: 'compute-index', name: 'Compute Networks', symbol: 'COMP', icon: '💻', price: 52.30, change24h: 8.5, aum: 65000000, holdings: [{ token: 'RNDR', weight: 30 }, { token: 'AKT', weight: 28 }, { token: 'GLM', weight: 18 }, { token: 'NOS', weight: 14 }, { token: 'PHB', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Decentralized compute' },
            { id: 'cosmos-hub-index', name: 'Cosmos Hub', symbol: 'CSMH', icon: '⚛️', price: 78.60, change24h: 3.8, aum: 145000000, holdings: [{ token: 'ATOM', weight: 40 }, { token: 'OSMO', weight: 20 }, { token: 'INJ', weight: 15 }, { token: 'TIA', weight: 15 }, { token: 'NTRN', weight: 10 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Top Cosmos chains' },
            { id: 'restaking-index', name: 'Restaking Index', symbol: 'RSTK', icon: '🔄', price: 48.90, change24h: 5.5, aum: 125000000, holdings: [{ token: 'EIGEN', weight: 35 }, { token: 'ETHFI', weight: 22 }, { token: 'REZ', weight: 18 }, { token: 'PUFFER', weight: 15 }, { token: 'ALT', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'EigenLayer ecosystem' },
            { id: 'yield-tokens-index', name: 'Yield Tokens', symbol: 'YLDX', icon: '📈', price: 42.30, change24h: 2.5, aum: 95000000, holdings: [{ token: 'PENDLE', weight: 30 }, { token: 'CVX', weight: 25 }, { token: 'SD', weight: 18 }, { token: 'FXS', weight: 15 }, { token: 'ANGLE', weight: 12 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Yield optimization tokens' },
            { id: 'zk-provers-index', name: 'ZK Provers', symbol: 'ZKPV', icon: '🔐', price: 35.60, change24h: 15.5, aum: 45000000, holdings: [{ token: 'STRK', weight: 30 }, { token: 'ZK', weight: 28 }, { token: 'MANTA', weight: 20 }, { token: 'TAIKO', weight: 12 }, { token: 'SCROLL', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'ZK rollup tokens' },
            { id: 'dex-native-index', name: 'DEX Native Tokens', symbol: 'DEXN', icon: '🔁', price: 55.40, change24h: 4.8, aum: 125000000, holdings: [{ token: 'UNI', weight: 25 }, { token: 'SUSHI', weight: 18 }, { token: 'CRV', weight: 18 }, { token: 'BAL', weight: 15 }, { token: 'JOE', weight: 12 }, { token: 'CAKE', weight: 12 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Major DEX tokens' },
            { id: 'gaming-l3-index', name: 'Gaming L3s', symbol: 'GL3X', icon: '🎮', price: 28.90, change24h: 18.5, aum: 38000000, holdings: [{ token: 'XAI', weight: 30 }, { token: 'RON', weight: 25 }, { token: 'BEAM', weight: 22 }, { token: 'PYR', weight: 13 }, { token: 'MAGIC', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Gaming Layer 3s' },
            { id: 'move-chains-index', name: 'Move Chains', symbol: 'MOVE', icon: '🔷', price: 62.40, change24h: 8.2, aum: 85000000, holdings: [{ token: 'APT', weight: 45 }, { token: 'SUI', weight: 45 }, { token: 'MOVE', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Move language chains' },
            { id: 'modular-chains-index', name: 'Modular Chains', symbol: 'MODL', icon: '🧩', price: 48.20, change24h: 12.5, aum: 65000000, holdings: [{ token: 'TIA', weight: 35 }, { token: 'DYM', weight: 25 }, { token: 'MANTA', weight: 18 }, { token: 'ALT', weight: 12 }, { token: 'SAGA', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Modular blockchain tokens' },
            { id: 'dog-memes-v2-index', name: 'Dog Memes V2', symbol: 'DOG2', icon: '🐕', price: 18.40, change24h: 32.5, aum: 28000000, holdings: [{ token: 'WIF', weight: 30 }, { token: 'SHIB', weight: 25 }, { token: 'FLOKI', weight: 20 }, { token: 'DOGE', weight: 15 }, { token: 'BONK', weight: 10 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Top dog meme tokens' },
            { id: 'cat-memes-index', name: 'Cat Memes', symbol: 'CATX', icon: '🐱', price: 12.80, change24h: 28.5, aum: 18000000, holdings: [{ token: 'POPCAT', weight: 35 }, { token: 'MEW', weight: 30 }, { token: 'TOSHI', weight: 20 }, { token: 'MOCHI', weight: 15 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Cat meme tokens' },
            { id: 'ai-compute-index', name: 'AI Compute', symbol: 'AICX', icon: '🤖', price: 72.40, change24h: 9.5, aum: 95000000, holdings: [{ token: 'RNDR', weight: 30 }, { token: 'FET', weight: 25 }, { token: 'AGIX', weight: 18 }, { token: 'OCEAN', weight: 15 }, { token: 'TAO', weight: 12 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'AI compute tokens' },
            { id: 'perp-lp-index', name: 'Perp LP Tokens', symbol: 'PLPX', icon: '💰', price: 95.60, change24h: 1.8, aum: 185000000, holdings: [{ token: 'GLP', weight: 35 }, { token: 'JLP', weight: 30 }, { token: 'HLP', weight: 20 }, { token: 'gDAI', weight: 15 }], managementFee: 0.4, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Perp DEX LP tokens' },
            { id: 'liquid-staking-index', name: 'Liquid Staking', symbol: 'LSTX', icon: '💧', price: 108.20, change24h: 0.8, aum: 450000000, holdings: [{ token: 'stETH', weight: 45 }, { token: 'rETH', weight: 20 }, { token: 'cbETH', weight: 15 }, { token: 'frxETH', weight: 12 }, { token: 'swETH', weight: 8 }], managementFee: 0.35, rebalanceFreq: 'Weekly', risk: 'low', description: 'ETH liquid staking tokens' },
            { id: 'rwa-protocols-index', name: 'RWA Protocols', symbol: 'RWAP', icon: '🏛️', price: 68.40, change24h: 2.5, aum: 145000000, holdings: [{ token: 'ONDO', weight: 30 }, { token: 'CFG', weight: 25 }, { token: 'MPL', weight: 18 }, { token: 'GFI', weight: 15 }, { token: 'RIO', weight: 12 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'RWA protocol tokens' },
            { id: 'insurance-index', name: 'DeFi Insurance', symbol: 'INSX', icon: '🛡️', price: 35.80, change24h: 3.2, aum: 45000000, holdings: [{ token: 'NXM', weight: 40 }, { token: 'COVER', weight: 25 }, { token: 'ARMOR', weight: 20 }, { token: 'INSR', weight: 15 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium', description: 'DeFi insurance protocols' },
            { id: 'lending-blue-chip-index', name: 'Lending Blue Chips', symbol: 'LNDB', icon: '🏦', price: 85.60, change24h: 2.2, aum: 285000000, holdings: [{ token: 'AAVE', weight: 40 }, { token: 'COMP', weight: 25 }, { token: 'MKR', weight: 20 }, { token: 'MORPHO', weight: 15 }], managementFee: 0.45, rebalanceFreq: 'Weekly', risk: 'low-medium', description: 'Top lending protocols' },
            { id: 'solana-defi-index', name: 'Solana DeFi', symbol: 'SOLD', icon: '◎', price: 58.90, change24h: 8.5, aum: 95000000, holdings: [{ token: 'JUP', weight: 28 }, { token: 'RAY', weight: 22 }, { token: 'ORCA', weight: 18 }, { token: 'MNGO', weight: 15 }, { token: 'DRIFT', weight: 10 }, { token: 'KMNO', weight: 7 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Solana DeFi protocols' },
            { id: 'cbdc-alternatives-index', name: 'CBDC Alternatives', symbol: 'CBDA', icon: '💵', price: 102.40, change24h: 0.5, aum: 225000000, holdings: [{ token: 'USDC', weight: 30 }, { token: 'DAI', weight: 25 }, { token: 'FRAX', weight: 20 }, { token: 'LUSD', weight: 15 }, { token: 'GHO', weight: 10 }], managementFee: 0.25, rebalanceFreq: 'Weekly', risk: 'very-low', description: 'Decentralized stablecoins' },
            { id: 'nft-infrastructure-index', name: 'NFT Infrastructure', symbol: 'NFTI', icon: '🖼️', price: 42.80, change24h: 6.5, aum: 55000000, holdings: [{ token: 'IMX', weight: 30 }, { token: 'BLUR', weight: 25 }, { token: 'RARE', weight: 18 }, { token: 'SUDO', weight: 15 }, { token: 'NFTX', weight: 12 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'NFT marketplace infrastructure' },
            { id: 'aptos-ecosystem-index', name: 'Aptos Ecosystem', symbol: 'APTX', icon: '🔷', price: 38.60, change24h: 9.8, aum: 45000000, holdings: [{ token: 'APT', weight: 50 }, { token: 'THALA', weight: 20 }, { token: 'GUI', weight: 15 }, { token: 'CELL', weight: 15 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Aptos native tokens' },
            { id: 'sui-ecosystem-index', name: 'Sui Ecosystem', symbol: 'SUIX', icon: '💧', price: 35.40, change24h: 11.5, aum: 42000000, holdings: [{ token: 'SUI', weight: 55 }, { token: 'CETUS', weight: 20 }, { token: 'NAVI', weight: 15 }, { token: 'SCA', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Sui native tokens' },
            { id: 'sei-ecosystem-index', name: 'Sei Ecosystem', symbol: 'SEIX', icon: '🌊', price: 28.90, change24h: 8.5, aum: 35000000, holdings: [{ token: 'SEI', weight: 60 }, { token: 'SEILOR', weight: 20 }, { token: 'KRYPTONITE', weight: 12 }, { token: 'SILO', weight: 8 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Sei native tokens' },
            { id: 'injective-ecosystem-index', name: 'Injective Ecosystem', symbol: 'INJX', icon: '💉', price: 52.40, change24h: 6.2, aum: 65000000, holdings: [{ token: 'INJ', weight: 55 }, { token: 'KIRA', weight: 18 }, { token: 'HDRO', weight: 15 }, { token: 'ZIG', weight: 12 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Injective native tokens' },
            { id: 'eth-killers-v2-index', name: 'ETH Killers V2', symbol: 'ETHK', icon: '⚔️', price: 62.80, change24h: 5.5, aum: 125000000, holdings: [{ token: 'SOL', weight: 35 }, { token: 'AVAX', weight: 20 }, { token: 'NEAR', weight: 15 }, { token: 'APT', weight: 12 }, { token: 'SUI', weight: 10 }, { token: 'SEI', weight: 8 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Alt L1 competitors' },
            { id: 'gaming-guilds-index', name: 'Gaming Guilds', symbol: 'GGLD', icon: '⚔️', price: 22.40, change24h: 12.5, aum: 28000000, holdings: [{ token: 'YGG', weight: 35 }, { token: 'MC', weight: 25 }, { token: 'GGG', weight: 20 }, { token: 'GUILD', weight: 12 }, { token: 'LOKA', weight: 8 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'Gaming guild tokens' },
            { id: 've-tokenomics-index', name: 've-Tokenomics', symbol: 'VETX', icon: '🔒', price: 48.60, change24h: 3.8, aum: 85000000, holdings: [{ token: 'CRV', weight: 30 }, { token: 'BAL', weight: 22 }, { token: 'FXS', weight: 18 }, { token: 'VELO', weight: 15 }, { token: 'AERO', weight: 15 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'vote-escrow tokens' },
            { id: 'mev-protection-index', name: 'MEV Protection', symbol: 'MEVX', icon: '🛡️', price: 35.20, change24h: 5.5, aum: 42000000, holdings: [{ token: 'COW', weight: 35 }, { token: 'EDEN', weight: 25 }, { token: 'ROOK', weight: 22 }, { token: 'ARCH', weight: 18 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'MEV protection protocols' },
            { id: 'high-yield-stable-index', name: 'High Yield Stables', symbol: 'HYSX', icon: '💸', price: 112.40, change24h: 0.2, aum: 385000000, holdings: [{ token: 'sUSDe', weight: 40 }, { token: 'sDAI', weight: 25 }, { token: 'USDe', weight: 20 }, { token: 'crvUSD', weight: 15 }], managementFee: 0.3, rebalanceFreq: 'Daily', risk: 'low', description: 'Highest yield stablecoins' },
            { id: 'interoperability-index', name: 'Interoperability', symbol: 'INTR', icon: '🔗', price: 42.80, change24h: 4.8, aum: 75000000, holdings: [{ token: 'ATOM', weight: 25 }, { token: 'DOT', weight: 22 }, { token: 'ZRO', weight: 18 }, { token: 'AXL', weight: 18 }, { token: 'CCIP', weight: 17 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Cross-chain tokens' },
            { id: 'perpetual-yield-index', name: 'Perpetual Yield', symbol: 'PYLD', icon: '♾️', price: 88.60, change24h: 1.5, aum: 165000000, holdings: [{ token: 'GLP', weight: 30 }, { token: 'JLP', weight: 28 }, { token: 'HLP', weight: 22 }, { token: 'gDAI', weight: 12 }, { token: 'MLP', weight: 8 }], managementFee: 0.4, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Perp LP yield tokens' },
            { id: 'staking-derivatives-index', name: 'Staking Derivatives', symbol: 'SDVX', icon: '🎯', price: 68.90, change24h: 2.8, aum: 145000000, holdings: [{ token: 'stETH', weight: 35 }, { token: 'rETH', weight: 22 }, { token: 'JitoSOL', weight: 18 }, { token: 'mSOL', weight: 15 }, { token: 'ankrETH', weight: 10 }], managementFee: 0.4, rebalanceFreq: 'Weekly', risk: 'low-medium', description: 'Liquid staking derivatives' },
            { id: 'emerging-l2-index', name: 'Emerging L2s', symbol: 'EML2', icon: '🚀', price: 28.40, change24h: 18.5, aum: 35000000, holdings: [{ token: 'ZETA', weight: 22 }, { token: 'METIS', weight: 20 }, { token: 'BOBA', weight: 18 }, { token: 'MOVR', weight: 15 }, { token: 'CANTO', weight: 13 }, { token: 'KROMA', weight: 12 }], managementFee: 0.85, rebalanceFreq: 'Weekly', risk: 'high', description: 'Emerging Layer 2s' },
            { id: 'token-sale-platforms-index', name: 'Token Sale Platforms', symbol: 'TSPL', icon: '🎪', price: 38.20, change24h: 8.5, aum: 48000000, holdings: [{ token: 'PRIME', weight: 30 }, { token: 'DAO', weight: 25 }, { token: 'FJORD', weight: 20 }, { token: 'POLS', weight: 15 }, { token: 'PAID', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Launchpad tokens' },
            { id: 'real-yield-index', name: 'Real Yield DeFi', symbol: 'RYLD', icon: '💎', price: 75.40, change24h: 3.2, aum: 125000000, holdings: [{ token: 'GMX', weight: 28 }, { token: 'GNS', weight: 24 }, { token: 'RDNT', weight: 18 }, { token: 'GRAIL', weight: 15 }, { token: 'PENDLE', weight: 15 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Real yield protocols' },
            { id: 'base-memes-index', name: 'Base Memes', symbol: 'BSMM', icon: '🔵', price: 15.80, change24h: 35.5, aum: 22000000, holdings: [{ token: 'BRETT', weight: 30 }, { token: 'DEGEN', weight: 28 }, { token: 'TOSHI', weight: 22 }, { token: 'NORMIE', weight: 12 }, { token: 'MFER', weight: 8 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Base chain memes' },
            { id: 'btc-ecosystem-index', name: 'BTC Ecosystem', symbol: 'BTCX', icon: '₿', price: 145.60, change24h: 2.2, aum: 285000000, holdings: [{ token: 'WBTC', weight: 40 }, { token: 'STX', weight: 22 }, { token: 'ORDI', weight: 15 }, { token: 'SATS', weight: 13 }, { token: 'RUNES', weight: 10 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Bitcoin ecosystem tokens' },
            { id: 'cross-margin-index', name: 'Cross-Margin DEXs', symbol: 'CMGN', icon: '📊', price: 52.80, change24h: 6.8, aum: 75000000, holdings: [{ token: 'GMX', weight: 30 }, { token: 'DYDX', weight: 25 }, { token: 'GNS', weight: 20 }, { token: 'VRTX', weight: 15 }, { token: 'AEVO', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Cross-margin trading' },
            { id: 'gas-tokens-index', name: 'Gas Tokens', symbol: 'GASX', icon: '⛽', price: 88.40, change24h: 3.5, aum: 185000000, holdings: [{ token: 'ETH', weight: 35 }, { token: 'MATIC', weight: 18 }, { token: 'AVAX', weight: 15 }, { token: 'FTM', weight: 12 }, { token: 'ARB', weight: 10 }, { token: 'OP', weight: 10 }], managementFee: 0.45, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Major gas tokens' },
            // === INDEX FUNDS BATCH 7 - MEGA ULTRA ===
            { id: 'polkadot-ecosystem-index', name: 'Polkadot Ecosystem', symbol: 'DOTX', icon: '●', price: 52.40, change24h: 5.2, aum: 125000000, holdings: [{ token: 'DOT', weight: 40 }, { token: 'GLMR', weight: 18 }, { token: 'ASTR', weight: 15 }, { token: 'ACA', weight: 14 }, { token: 'PHA', weight: 13 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Polkadot parachains' },
            { id: 'hedera-ecosystem-index', name: 'Hedera Ecosystem', symbol: 'HBRX', icon: 'ℏ', price: 38.60, change24h: 4.8, aum: 85000000, holdings: [{ token: 'HBAR', weight: 60 }, { token: 'SAUCE', weight: 18 }, { token: 'HST', weight: 12 }, { token: 'PACK', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Hedera native tokens' },
            { id: 'algorand-ecosystem-index', name: 'Algorand Ecosystem', symbol: 'ALGX', icon: '⬡', price: 32.80, change24h: 3.5, aum: 65000000, holdings: [{ token: 'ALGO', weight: 55 }, { token: 'TINY', weight: 18 }, { token: 'VEST', weight: 15 }, { token: 'GARD', weight: 12 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Algorand native tokens' },
            { id: 'vechain-ecosystem-index', name: 'VeChain Ecosystem', symbol: 'VETX', icon: '✔️', price: 28.40, change24h: 4.2, aum: 45000000, holdings: [{ token: 'VET', weight: 65 }, { token: 'VTHO', weight: 20 }, { token: 'SHA', weight: 15 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium', description: 'VeChain ecosystem' },
            { id: 'internet-computer-index', name: 'Internet Computer', symbol: 'ICPX', icon: '∞', price: 45.60, change24h: 6.5, aum: 75000000, holdings: [{ token: 'ICP', weight: 70 }, { token: 'SNS1', weight: 15 }, { token: 'OGY', weight: 15 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'ICP ecosystem tokens' },
            { id: 'multiversx-ecosystem-index', name: 'MultiversX Ecosystem', symbol: 'EGDX', icon: '⚡', price: 42.30, change24h: 7.8, aum: 55000000, holdings: [{ token: 'EGLD', weight: 55 }, { token: 'MEX', weight: 18 }, { token: 'LKMEX', weight: 15 }, { token: 'RIDE', weight: 12 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'MultiversX native tokens' },
            { id: 'tezos-ecosystem-index', name: 'Tezos Ecosystem', symbol: 'XTZX', icon: 'ꜩ', price: 35.20, change24h: 3.8, aum: 48000000, holdings: [{ token: 'XTZ', weight: 60 }, { token: 'PLENTY', weight: 18 }, { token: 'CTEZ', weight: 12 }, { token: 'UNO', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Tezos native tokens' },
            { id: 'zilliqa-ecosystem-index', name: 'Zilliqa Ecosystem', symbol: 'ZILX', icon: '💎', price: 22.40, change24h: 5.5, aum: 28000000, holdings: [{ token: 'ZIL', weight: 65 }, { token: 'GZIL', weight: 18 }, { token: 'XCAD', weight: 17 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Zilliqa native tokens' },
            { id: 'kava-ecosystem-index', name: 'Kava Ecosystem', symbol: 'KAVX', icon: '🔴', price: 38.90, change24h: 8.2, aum: 42000000, holdings: [{ token: 'KAVA', weight: 55 }, { token: 'HARD', weight: 20 }, { token: 'SWP', weight: 15 }, { token: 'USDX', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Kava native tokens' },
            { id: 'celo-ecosystem-index', name: 'Celo Ecosystem', symbol: 'CELX', icon: '🟢', price: 32.60, change24h: 4.5, aum: 38000000, holdings: [{ token: 'CELO', weight: 55 }, { token: 'cUSD', weight: 20 }, { token: 'cEUR', weight: 15 }, { token: 'MENTO', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Celo native tokens' },
            { id: 'mina-ecosystem-index', name: 'Mina Ecosystem', symbol: 'MINX', icon: '⚙️', price: 28.80, change24h: 6.8, aum: 35000000, holdings: [{ token: 'MINA', weight: 80 }, { token: 'ZKAPP', weight: 20 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Mina Protocol ecosystem' },
            { id: 'casper-ecosystem-index', name: 'Casper Ecosystem', symbol: 'CSPX', icon: '👻', price: 25.40, change24h: 5.2, aum: 28000000, holdings: [{ token: 'CSPR', weight: 75 }, { token: 'CASPADOGS', weight: 15 }, { token: 'CSPS', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Casper native tokens' },
            { id: 'depin-infrastructure-index', name: 'DePIN Infrastructure', symbol: 'DPNX', icon: '📡', price: 58.40, change24h: 7.5, aum: 95000000, holdings: [{ token: 'HNT', weight: 25 }, { token: 'IOTX', weight: 20 }, { token: 'MOBILE', weight: 18 }, { token: 'IOT', weight: 15 }, { token: 'DIMO', weight: 12 }, { token: 'WIFI', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Physical infrastructure' },
            { id: 'web3-social-index', name: 'Web3 Social', symbol: 'W3SX', icon: '👥', price: 42.60, change24h: 12.5, aum: 55000000, holdings: [{ token: 'CYBER', weight: 25 }, { token: 'MASK', weight: 22 }, { token: 'GAL', weight: 20 }, { token: 'RSS3', weight: 18 }, { token: 'HOOK', weight: 15 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Social protocols' },
            { id: 'education-tokens-index', name: 'Education Tokens', symbol: 'EDUX', icon: '📚', price: 28.90, change24h: 8.5, aum: 32000000, holdings: [{ token: 'EDU', weight: 40 }, { token: 'HOOK', weight: 30 }, { token: 'TWT', weight: 20 }, { token: 'STEPN', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Learn-to-earn tokens' },
            { id: 'music-nft-index', name: 'Music & Audio', symbol: 'MUSX', icon: '🎵', price: 35.40, change24h: 9.8, aum: 38000000, holdings: [{ token: 'AUDIO', weight: 45 }, { token: 'SOUND', weight: 28 }, { token: 'ROCKI', weight: 17 }, { token: 'JAM', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Music NFT platforms' },
            { id: 'account-abstraction-index', name: 'Account Abstraction', symbol: 'AABX', icon: '🔐', price: 48.60, change24h: 6.2, aum: 65000000, holdings: [{ token: 'BICO', weight: 35 }, { token: 'SAFE', weight: 30 }, { token: 'INST', weight: 20 }, { token: 'AAC', weight: 15 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Smart wallet tokens' },
            { id: 'prediction-markets-index', name: 'Prediction Markets', symbol: 'PRDX', icon: '🎯', price: 32.80, change24h: 15.5, aum: 42000000, holdings: [{ token: 'POLY', weight: 35 }, { token: 'GNO', weight: 30 }, { token: 'AZURO', weight: 20 }, { token: 'SX', weight: 15 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Prediction market tokens' },
            { id: 'dao-governance-index', name: 'DAO Governance', symbol: 'DAOX', icon: '🗳️', price: 55.40, change24h: 3.8, aum: 85000000, holdings: [{ token: 'UNI', weight: 25 }, { token: 'AAVE', weight: 22 }, { token: 'MKR', weight: 20 }, { token: 'ARB', weight: 18 }, { token: 'ENS', weight: 15 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Top DAO tokens' },
            { id: 'identity-verification-index', name: 'Identity & KYC', symbol: 'IDKX', icon: '🪪', price: 38.20, change24h: 5.5, aum: 48000000, holdings: [{ token: 'WLD', weight: 35 }, { token: 'ID', weight: 30 }, { token: 'CIVIC', weight: 20 }, { token: 'CHEQ', weight: 15 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Digital identity' },
            { id: 'cross-chain-dex-index', name: 'Cross-Chain DEXs', symbol: 'CCDX', icon: '🔄', price: 42.80, change24h: 7.2, aum: 65000000, holdings: [{ token: 'RUNE', weight: 30 }, { token: 'STG', weight: 25 }, { token: 'SYN', weight: 20 }, { token: 'HOP', weight: 15 }, { token: 'ACROSS', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Cross-chain trading' },
            { id: 'nft-gaming-index', name: 'NFT Gaming', symbol: 'NFTG', icon: '🎮', price: 28.60, change24h: 18.5, aum: 38000000, holdings: [{ token: 'IMX', weight: 25 }, { token: 'GALA', weight: 22 }, { token: 'ILV', weight: 18 }, { token: 'PRIME', weight: 18 }, { token: 'SUPER', weight: 17 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'NFT gaming tokens' },
            { id: 'security-audit-index', name: 'Security & Audit', symbol: 'SECX', icon: '🛡️', price: 35.40, change24h: 4.2, aum: 32000000, holdings: [{ token: 'CTK', weight: 35 }, { token: 'SAFE', weight: 30 }, { token: 'ARMOR', weight: 20 }, { token: 'NXM', weight: 15 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Security protocols' },
            { id: 'synthetic-assets-index', name: 'Synthetic Assets', symbol: 'SYNX', icon: '🎭', price: 48.90, change24h: 5.8, aum: 75000000, holdings: [{ token: 'SNX', weight: 35 }, { token: 'KWENTA', weight: 25 }, { token: 'LYRA', weight: 20 }, { token: 'THALES', weight: 12 }, { token: 'LINA', weight: 8 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Synthetic protocols' },
            { id: 'option-protocols-index', name: 'Options Protocols', symbol: 'OPTX', icon: '📈', price: 42.30, change24h: 8.5, aum: 55000000, holdings: [{ token: 'LYRA', weight: 28 }, { token: 'PREMIA', weight: 25 }, { token: 'DPX', weight: 22 }, { token: 'OPYN', weight: 15 }, { token: 'JONES', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'DeFi options' },
            { id: 'treasury-management-index', name: 'Treasury Tokens', symbol: 'TRSX', icon: '🏛️', price: 62.40, change24h: 2.5, aum: 95000000, holdings: [{ token: 'OHM', weight: 30 }, { token: 'CVX', weight: 25 }, { token: 'vlAURA', weight: 20 }, { token: 'BTRFLY', weight: 15 }, { token: 'TOKE', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Protocol treasuries' },
            { id: 'layer0-protocols-index', name: 'Layer 0 Protocols', symbol: 'L0PX', icon: '🌐', price: 75.60, change24h: 4.8, aum: 145000000, holdings: [{ token: 'DOT', weight: 30 }, { token: 'ATOM', weight: 28 }, { token: 'ZRO', weight: 22 }, { token: 'AXL', weight: 12 }, { token: 'CCIP', weight: 8 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Interoperability layer' },
            { id: 'rollup-aggregators-index', name: 'Rollup Aggregators', symbol: 'ROLX', icon: '🔗', price: 38.90, change24h: 12.5, aum: 48000000, holdings: [{ token: 'ALT', weight: 30 }, { token: 'DYMENSION', weight: 25 }, { token: 'SAGA', weight: 22 }, { token: 'FUEL', weight: 13 }, { token: 'INIT', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Rollup infrastructure' },
            { id: 'intent-protocols-index', name: 'Intent Protocols', symbol: 'INTX', icon: '🎯', price: 32.40, change24h: 18.5, aum: 35000000, holdings: [{ token: 'COW', weight: 35 }, { token: 'ACROSS', weight: 28 }, { token: '1INCH', weight: 22 }, { token: 'ANOMA', weight: 15 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'Intent-based protocols' },
            // === INDEX FUNDS BATCH 8 - RONNA EXPANSION ===
            // Meme Coin Index Funds
            { id: 'doge-memes-index', name: 'Dog Meme Coins', symbol: 'DOGX', icon: '🐕', price: 28.50, change24h: 25.5, aum: 125000000, holdings: [{ token: 'DOGE', weight: 35 }, { token: 'SHIB', weight: 25 }, { token: 'FLOKI', weight: 18 }, { token: 'BONK', weight: 12 }, { token: 'WIF', weight: 10 }], managementFee: 0.9, rebalanceFreq: 'Daily', risk: 'high', description: 'Dog-themed meme coins' },
            { id: 'cat-memes-index', name: 'Cat Meme Coins', symbol: 'CATX', icon: '🐱', price: 15.80, change24h: 35.5, aum: 45000000, holdings: [{ token: 'POPCAT', weight: 35 }, { token: 'MEW', weight: 25 }, { token: 'CAT', weight: 20 }, { token: 'KITTY', weight: 12 }, { token: 'TCAT', weight: 8 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Cat-themed meme coins' },
            { id: 'frog-memes-index', name: 'Frog Meme Coins', symbol: 'FRGX', icon: '🐸', price: 22.40, change24h: 42.5, aum: 85000000, holdings: [{ token: 'PEPE', weight: 55 }, { token: 'FROGGER', weight: 20 }, { token: 'WOJAK', weight: 15 }, { token: 'TURBO', weight: 10 }], managementFee: 0.95, rebalanceFreq: 'Daily', risk: 'high', description: 'Frog-themed meme coins' },
            { id: 'base-meme-elite-index', name: 'Base Meme Elite', symbol: 'BMEX', icon: '🔵', price: 18.60, change24h: 38.5, aum: 55000000, holdings: [{ token: 'BRETT', weight: 30 }, { token: 'DEGEN', weight: 28 }, { token: 'TOSHI', weight: 22 }, { token: 'NORMIE', weight: 12 }, { token: 'HIGHER', weight: 8 }], managementFee: 1.0, rebalanceFreq: 'Daily', risk: 'high', description: 'Top Base memes' },
            { id: 'solana-meme-index', name: 'Solana Meme Coins', symbol: 'SOLM', icon: '◎', price: 32.40, change24h: 28.5, aum: 145000000, holdings: [{ token: 'BONK', weight: 28 }, { token: 'WIF', weight: 25 }, { token: 'POPCAT', weight: 20 }, { token: 'BOME', weight: 15 }, { token: 'SLERF', weight: 12 }], managementFee: 0.9, rebalanceFreq: 'Daily', risk: 'high', description: 'Solana meme ecosystem' },
            // Perp DEX Index Funds
            { id: 'perp-dex-leaders-index', name: 'Perp DEX Leaders', symbol: 'PDXL', icon: '📊', price: 68.40, change24h: 8.5, aum: 185000000, holdings: [{ token: 'GMX', weight: 25 }, { token: 'DYDX', weight: 22 }, { token: 'GNS', weight: 18 }, { token: 'PENDLE', weight: 15 }, { token: 'VRTX', weight: 12 }, { token: 'AEVO', weight: 8 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Top perp protocols' },
            { id: 'yield-trading-index', name: 'Yield Trading', symbol: 'YTRX', icon: '📈', price: 55.80, change24h: 6.2, aum: 125000000, holdings: [{ token: 'PENDLE', weight: 35 }, { token: 'AURA', weight: 22 }, { token: 'BTRFLY', weight: 18 }, { token: 'JONES', weight: 15 }, { token: 'DPX', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Yield derivative tokens' },
            { id: 'defi-options-index', name: 'DeFi Options Elite', symbol: 'DOPX', icon: '⚙️', price: 42.60, change24h: 9.8, aum: 75000000, holdings: [{ token: 'LYRA', weight: 28 }, { token: 'THALES', weight: 25 }, { token: 'PREMIA', weight: 22 }, { token: 'KWENTA', weight: 15 }, { token: 'OPYN', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Options protocols' },
            { id: 'arbitrum-perps-index', name: 'Arbitrum Perps', symbol: 'ARBP', icon: '🔵', price: 48.90, change24h: 7.5, aum: 95000000, holdings: [{ token: 'GMX', weight: 30 }, { token: 'GRAIL', weight: 22 }, { token: 'VELA', weight: 18 }, { token: 'HMX', weight: 15 }, { token: 'MUX', weight: 15 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Arbitrum perp ecosystem' },
            { id: 'optimism-defi-index', name: 'Optimism DeFi', symbol: 'OPDF', icon: '🔴', price: 52.40, change24h: 6.8, aum: 85000000, holdings: [{ token: 'OP', weight: 30 }, { token: 'VELO', weight: 25 }, { token: 'SNX', weight: 20 }, { token: 'KWENTA', weight: 15 }, { token: 'THALES', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Optimism DeFi tokens' },
            // Solana DeFi Index Funds
            { id: 'solana-defi-leaders-index', name: 'Solana DeFi Leaders', symbol: 'SDFL', icon: '◎', price: 72.40, change24h: 9.2, aum: 225000000, holdings: [{ token: 'JUP', weight: 28 }, { token: 'RAY', weight: 20 }, { token: 'JTO', weight: 18 }, { token: 'ORCA', weight: 15 }, { token: 'MNDE', weight: 12 }, { token: 'DRIFT', weight: 7 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Top Solana DeFi' },
            { id: 'solana-yield-index', name: 'Solana Yield', symbol: 'SYLD', icon: '◎', price: 58.60, change24h: 5.8, aum: 145000000, holdings: [{ token: 'JitoSOL', weight: 30 }, { token: 'mSOL', weight: 28 }, { token: 'bSOL', weight: 18 }, { token: 'LST', weight: 14 }, { token: 'INF', weight: 10 }], managementFee: 0.45, rebalanceFreq: 'Weekly', risk: 'low-medium', description: 'Solana liquid staking' },
            { id: 'solana-new-projects-index', name: 'Solana New Projects', symbol: 'SNPX', icon: '◎', price: 38.40, change24h: 15.5, aum: 65000000, holdings: [{ token: 'TNSR', weight: 25 }, { token: 'KMNO', weight: 22 }, { token: 'PRCL', weight: 18 }, { token: 'CLOUD', weight: 15 }, { token: 'ZEX', weight: 12 }, { token: 'IO', weight: 8 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'Emerging Solana projects' },
            { id: 'solana-nft-defi-index', name: 'Solana NFT DeFi', symbol: 'SNFT', icon: '🎨', price: 28.90, change24h: 12.5, aum: 48000000, holdings: [{ token: 'TNSR', weight: 35 }, { token: 'ME', weight: 28 }, { token: 'DUST', weight: 20 }, { token: 'FIDA', weight: 17 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Solana NFT protocols' },
            { id: 'solana-gaming-index', name: 'Solana Gaming', symbol: 'SGMX', icon: '🎮', price: 22.60, change24h: 18.5, aum: 35000000, holdings: [{ token: 'ATLAS', weight: 35 }, { token: 'POLIS', weight: 28 }, { token: 'AURORY', weight: 20 }, { token: 'HONEY', weight: 17 }], managementFee: 0.8, rebalanceFreq: 'Weekly', risk: 'high', description: 'Solana gaming tokens' },
            // Cross-Chain Index Funds
            { id: 'multi-chain-defi-index', name: 'Multi-Chain DeFi', symbol: 'MCDX', icon: '🔗', price: 85.40, change24h: 4.5, aum: 285000000, holdings: [{ token: 'UNI', weight: 18 }, { token: 'AAVE', weight: 16 }, { token: 'GMX', weight: 14 }, { token: 'JUP', weight: 12 }, { token: 'CAKE', weight: 10 }, { token: 'RAY', weight: 10 }, { token: 'VELO', weight: 10 }, { token: 'PENDLE', weight: 10 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Top DeFi across chains' },
            { id: 'bridge-tokens-index', name: 'Bridge Tokens', symbol: 'BRDX', icon: '🌉', price: 48.60, change24h: 7.2, aum: 95000000, holdings: [{ token: 'ZRO', weight: 28 }, { token: 'STG', weight: 22 }, { token: 'W', weight: 18 }, { token: 'ACROSS', weight: 15 }, { token: 'SYN', weight: 10 }, { token: 'HOP', weight: 7 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Cross-chain bridges' },
            { id: 'dex-aggregators-index', name: 'DEX Aggregators', symbol: 'DAGX', icon: '🔄', price: 52.80, change24h: 5.5, aum: 125000000, holdings: [{ token: '1INCH', weight: 30 }, { token: 'COW', weight: 25 }, { token: 'JUP', weight: 22 }, { token: 'DODO', weight: 13 }, { token: 'PARA', weight: 10 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'DEX aggregator tokens' },
            { id: 'oracle-network-index', name: 'Oracle Networks', symbol: 'ORCX', icon: '🔮', price: 68.40, change24h: 3.8, aum: 185000000, holdings: [{ token: 'LINK', weight: 45 }, { token: 'PYTH', weight: 25 }, { token: 'API3', weight: 15 }, { token: 'BAND', weight: 10 }, { token: 'UMA', weight: 5 }], managementFee: 0.45, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Oracle providers' },
            { id: 'liquid-staking-global-index', name: 'Global Liquid Staking', symbol: 'GLSX', icon: '💧', price: 92.40, change24h: 2.5, aum: 350000000, holdings: [{ token: 'LDO', weight: 28 }, { token: 'RPL', weight: 18 }, { token: 'JitoSOL', weight: 16 }, { token: 'mSOL', weight: 14 }, { token: 'SWISE', weight: 12 }, { token: 'ankrETH', weight: 12 }], managementFee: 0.4, rebalanceFreq: 'Weekly', risk: 'low-medium', description: 'LST across chains' },
            // Emerging Sectors Index Funds
            { id: 'restaking-index', name: 'Restaking Protocols', symbol: 'RSTX', icon: '🔄', price: 48.60, change24h: 12.5, aum: 125000000, holdings: [{ token: 'EIGEN', weight: 40 }, { token: 'REZ', weight: 25 }, { token: 'PUFFER', weight: 18 }, { token: 'RSTK', weight: 17 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'EigenLayer ecosystem' },
            { id: 'rwa-tokenization-index', name: 'RWA Tokenization', symbol: 'RWAX', icon: '🏠', price: 55.40, change24h: 6.8, aum: 145000000, holdings: [{ token: 'ONDO', weight: 30 }, { token: 'RIO', weight: 22 }, { token: 'MPL', weight: 18 }, { token: 'CFG', weight: 15 }, { token: 'GFI', weight: 15 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Real world assets' },
            { id: 'ai-compute-index', name: 'AI Compute', symbol: 'AICX', icon: '🤖', price: 72.80, change24h: 15.5, aum: 185000000, holdings: [{ token: 'RNDR', weight: 28 }, { token: 'AKT', weight: 22 }, { token: 'IO', weight: 18 }, { token: 'TAO', weight: 15 }, { token: 'GPU', weight: 10 }, { token: 'NOS', weight: 7 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Decentralized GPU' },
            { id: 'social-fi-index', name: 'SocialFi', symbol: 'SOFX', icon: '👥', price: 35.60, change24h: 18.5, aum: 65000000, holdings: [{ token: 'FRIEND', weight: 30 }, { token: 'CYBER', weight: 25 }, { token: 'MASK', weight: 20 }, { token: 'GAL', weight: 15 }, { token: 'RSS3', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Social tokens' },
            { id: 'modular-blockchain-index', name: 'Modular Blockchains', symbol: 'MODX', icon: '🧱', price: 42.80, change24h: 22.5, aum: 85000000, holdings: [{ token: 'TIA', weight: 35 }, { token: 'ALT', weight: 25 }, { token: 'DYMENSION', weight: 18 }, { token: 'SAGA', weight: 12 }, { token: 'AVAIL', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Modular architecture' },
            { id: 'zk-technology-index', name: 'ZK Technology', symbol: 'ZKXP', icon: '🔐', price: 58.40, change24h: 8.5, aum: 155000000, holdings: [{ token: 'ZK', weight: 30 }, { token: 'STRK', weight: 25 }, { token: 'MANTA', weight: 18 }, { token: 'TAIKO', weight: 15 }, { token: 'SCROLL', weight: 12 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Zero knowledge tokens' },
            { id: 'bitcoin-l2-index', name: 'Bitcoin L2', symbol: 'BL2X', icon: '₿', price: 38.90, change24h: 15.5, aum: 95000000, holdings: [{ token: 'STX', weight: 35 }, { token: 'ORDI', weight: 25 }, { token: 'SATS', weight: 18 }, { token: 'RUNES', weight: 12 }, { token: 'ALEX', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Bitcoin Layer 2s' },
            { id: 'telegram-ecosystem-index', name: 'Telegram Ecosystem', symbol: 'TGMX', icon: '✈️', price: 45.60, change24h: 12.5, aum: 145000000, holdings: [{ token: 'TON', weight: 45 }, { token: 'NOT', weight: 25 }, { token: 'DOGS', weight: 15 }, { token: 'CATI', weight: 10 }, { token: 'HMSTR', weight: 5 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'TON ecosystem' },
            { id: 'gaming-infrastructure-index', name: 'Gaming Infrastructure', symbol: 'GINX', icon: '🎮', price: 52.40, change24h: 10.5, aum: 125000000, holdings: [{ token: 'IMX', weight: 28 }, { token: 'RONIN', weight: 22 }, { token: 'BEAM', weight: 18 }, { token: 'PRIME', weight: 15 }, { token: 'XAI', weight: 10 }, { token: 'MYRIA', weight: 7 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Gaming L2s & infra' },
            { id: 'data-availability-index', name: 'Data Availability', symbol: 'DAVX', icon: '💾', price: 35.80, change24h: 18.5, aum: 75000000, holdings: [{ token: 'TIA', weight: 40 }, { token: 'AVAIL', weight: 28 }, { token: 'NEAR', weight: 18 }, { token: 'EIP4844', weight: 14 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'DA layer tokens' },

            // === INDEX FUNDS BATCH 9 - GIGA EXPANSION ===
            // DePIN Index Funds
            { id: 'depin-infrastructure-index', name: 'DePIN Infrastructure', symbol: 'DPIX', icon: '🌐', price: 42.50, change24h: 15.5, aum: 125000000, holdings: [{ token: 'RENDER', weight: 25 }, { token: 'GRASS', weight: 20 }, { token: 'DIMO', weight: 18 }, { token: 'HONEY', weight: 15 }, { token: 'GEOD', weight: 12 }, { token: 'HNT', weight: 10 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'DePIN network tokens' },
            { id: 'gpu-compute-index', name: 'GPU Compute', symbol: 'GPUX', icon: '🎨', price: 58.40, change24h: 12.8, aum: 185000000, holdings: [{ token: 'RENDER', weight: 35 }, { token: 'AKT', weight: 25 }, { token: 'IO', weight: 18 }, { token: 'GPU', weight: 12 }, { token: 'NOS', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium', description: 'GPU compute network' },
            { id: 'bandwidth-network-index', name: 'Bandwidth Network', symbol: 'BNWX', icon: '🌱', price: 35.80, change24h: 28.5, aum: 75000000, holdings: [{ token: 'GRASS', weight: 45 }, { token: 'HNT', weight: 25 }, { token: 'MOBILE', weight: 18 }, { token: 'WIFI', weight: 12 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Bandwidth & connectivity' },
            { id: 'vehicle-data-index', name: 'Vehicle Data', symbol: 'VDAX', icon: '🚗', price: 28.60, change24h: 18.5, aum: 45000000, holdings: [{ token: 'DIMO', weight: 50 }, { token: 'HONEY', weight: 30 }, { token: 'GEOD', weight: 20 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Vehicle & location data' },

            // RWA & Credit Index Funds
            { id: 'rwa-credit-index', name: 'RWA Credit', symbol: 'RWCX', icon: '🏦', price: 62.40, change24h: 5.5, aum: 165000000, holdings: [{ token: 'ONDO', weight: 28 }, { token: 'MPL', weight: 22 }, { token: 'CFG', weight: 18 }, { token: 'GFI', weight: 15 }, { token: 'RIO', weight: 10 }, { token: 'POLYX', weight: 7 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'low-medium', description: 'RWA credit protocols' },
            { id: 'institutional-credit-index', name: 'Institutional Credit', symbol: 'ICIX', icon: '🍁', price: 48.90, change24h: 4.2, aum: 95000000, holdings: [{ token: 'MPL', weight: 35 }, { token: 'GFI', weight: 28 }, { token: 'CFG', weight: 20 }, { token: 'RIO', weight: 17 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Institutional lending' },
            { id: 'security-token-index', name: 'Security Tokens', symbol: 'SECX', icon: '🔷', price: 55.20, change24h: 3.8, aum: 85000000, holdings: [{ token: 'POLYX', weight: 45 }, { token: 'RIO', weight: 30 }, { token: 'INX', weight: 25 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Security token platforms' },

            // Social & Creator Index Funds
            { id: 'socialfi-protocol-index', name: 'SocialFi Protocols', symbol: 'SFPX', icon: '👥', price: 32.40, change24h: 22.5, aum: 65000000, holdings: [{ token: 'LENS', weight: 30 }, { token: 'GAL', weight: 25 }, { token: 'FRIEND', weight: 20 }, { token: 'DESO', weight: 15 }, { token: 'RLY', weight: 10 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'Social protocol tokens' },
            { id: 'creator-economy-index', name: 'Creator Economy', symbol: 'CREX', icon: '🎭', price: 25.80, change24h: 18.5, aum: 42000000, holdings: [{ token: 'RLY', weight: 35 }, { token: 'DESO', weight: 28 }, { token: 'MASK', weight: 20 }, { token: 'RSS3', weight: 17 }], managementFee: 0.7, rebalanceFreq: 'Weekly', risk: 'high', description: 'Creator tokens' },
            { id: 'credential-network-index', name: 'Credential Networks', symbol: 'CRDX', icon: '🌌', price: 38.60, change24h: 12.5, aum: 55000000, holdings: [{ token: 'GAL', weight: 40 }, { token: 'ENS', weight: 28 }, { token: 'POAP', weight: 18 }, { token: 'GITCOIN', weight: 14 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Web3 identity' },

            // Prediction & Oracle Index Funds
            { id: 'prediction-market-index', name: 'Prediction Markets', symbol: 'PRDX', icon: '🎲', price: 45.60, change24h: 8.5, aum: 95000000, holdings: [{ token: 'GNO', weight: 35 }, { token: 'POLY', weight: 25 }, { token: 'REP', weight: 22 }, { token: 'AZURO', weight: 18 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Prediction markets' },
            { id: 'oracle-network-index', name: 'Oracle Networks', symbol: 'ORCX', icon: '🔔', price: 52.80, change24h: 6.2, aum: 145000000, holdings: [{ token: 'LINK', weight: 30 }, { token: 'PYTH', weight: 22 }, { token: 'UMA', weight: 18 }, { token: 'TRB', weight: 15 }, { token: 'API3', weight: 15 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Oracle providers' },
            { id: 'data-reporting-index', name: 'Data Reporting', symbol: 'DRPX', icon: '📊', price: 38.40, change24h: 9.5, aum: 65000000, holdings: [{ token: 'TRB', weight: 35 }, { token: 'UMA', weight: 28 }, { token: 'REP', weight: 22 }, { token: 'DIA', weight: 15 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Data oracles' },

            // Cosmos Ecosystem Index Funds
            { id: 'cosmos-defi-index', name: 'Cosmos DeFi', symbol: 'CDFX', icon: '⚛️', price: 48.90, change24h: 10.5, aum: 185000000, holdings: [{ token: 'ATOM', weight: 25 }, { token: 'OSMO', weight: 20 }, { token: 'DYDX', weight: 18 }, { token: 'NTRN', weight: 15 }, { token: 'STRD', weight: 12 }, { token: 'MARS', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Cosmos DeFi ecosystem' },
            { id: 'cosmos-infrastructure-index', name: 'Cosmos Infrastructure', symbol: 'CIFX', icon: '🏃', price: 42.60, change24h: 12.8, aum: 125000000, holdings: [{ token: 'AKT', weight: 30 }, { token: 'STRD', weight: 25 }, { token: 'KUJI', weight: 20 }, { token: 'MARS', weight: 15 }, { token: 'NTRN', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Cosmos infra tokens' },
            { id: 'dydx-ecosystem-index', name: 'dYdX Ecosystem', symbol: 'DYDX', icon: '📈', price: 55.40, change24h: 8.5, aum: 225000000, holdings: [{ token: 'DYDX', weight: 60 }, { token: 'ATOM', weight: 20 }, { token: 'OSMO', weight: 12 }, { token: 'NTRN', weight: 8 }], managementFee: 0.5, rebalanceFreq: 'Weekly', risk: 'medium', description: 'dYdX perp ecosystem' },
            { id: 'akash-cloud-index', name: 'Akash Cloud', symbol: 'AKCX', icon: '☁️', price: 38.80, change24h: 15.5, aum: 95000000, holdings: [{ token: 'AKT', weight: 55 }, { token: 'RENDER', weight: 25 }, { token: 'IO', weight: 12 }, { token: 'GPU', weight: 8 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Decentralized cloud' },

            // Bitcoin L2 & Ordinals Index Funds
            { id: 'bitcoin-defi-index', name: 'Bitcoin DeFi', symbol: 'BTDX', icon: '₿', price: 65.40, change24h: 12.5, aum: 285000000, holdings: [{ token: 'STX', weight: 35 }, { token: 'ORDI', weight: 22 }, { token: 'ALEX', weight: 18 }, { token: 'SATS', weight: 15 }, { token: 'RUNES', weight: 10 }], managementFee: 0.65, rebalanceFreq: 'Weekly', risk: 'high', description: 'Bitcoin DeFi ecosystem' },
            { id: 'ordinals-brc20-index', name: 'Ordinals BRC-20', symbol: 'BRCX', icon: '🟡', price: 42.80, change24h: 25.5, aum: 125000000, holdings: [{ token: 'ORDI', weight: 40 }, { token: 'SATS', weight: 28 }, { token: 'RUNES', weight: 18 }, { token: 'RATS', weight: 14 }], managementFee: 0.75, rebalanceFreq: 'Weekly', risk: 'high', description: 'BRC-20 tokens' },
            { id: 'stacks-ecosystem-index', name: 'Stacks Ecosystem', symbol: 'STEX', icon: '📦', price: 35.60, change24h: 15.8, aum: 145000000, holdings: [{ token: 'STX', weight: 50 }, { token: 'ALEX', weight: 25 }, { token: 'VELAR', weight: 15 }, { token: 'WELSH', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium-high', description: 'Stacks L2 ecosystem' },

            // MEV & Infrastructure Index Funds
            { id: 'mev-protection-index', name: 'MEV Protection', symbol: 'MEVX', icon: '🐄', price: 48.60, change24h: 6.5, aum: 85000000, holdings: [{ token: 'COW', weight: 40 }, { token: 'EDEN', weight: 25 }, { token: 'ROOK', weight: 20 }, { token: 'MANIFOLD', weight: 15 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'MEV protection protocols' },
            { id: 'interoperability-index', name: 'Interoperability', symbol: 'INTX', icon: '🌉', price: 52.40, change24h: 8.8, aum: 165000000, holdings: [{ token: 'RUNE', weight: 25 }, { token: 'AXL', weight: 22 }, { token: 'STG', weight: 20 }, { token: 'W', weight: 18 }, { token: 'ACROSS', weight: 15 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Cross-chain bridges' },
            { id: 'storage-compute-index', name: 'Storage & Compute', symbol: 'STCX', icon: '💾', price: 45.80, change24h: 7.5, aum: 125000000, holdings: [{ token: 'FIL', weight: 28 }, { token: 'AR', weight: 22 }, { token: 'THETA', weight: 18 }, { token: 'STORJ', weight: 17 }, { token: 'SC', weight: 15 }], managementFee: 0.55, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Decentralized storage' },

            // Privacy & Security Index Funds
            { id: 'privacy-tokens-index', name: 'Privacy Tokens', symbol: 'PRVX', icon: '🔒', price: 38.40, change24h: 5.8, aum: 95000000, holdings: [{ token: 'ZEC', weight: 30 }, { token: 'DASH', weight: 25 }, { token: 'SCRT', weight: 20 }, { token: 'ROSE', weight: 15 }, { token: 'KEEP', weight: 10 }], managementFee: 0.6, rebalanceFreq: 'Weekly', risk: 'medium', description: 'Privacy-focused tokens' },

            // Exchange Token Index Funds
            { id: 'exchange-token-index', name: 'Exchange Tokens', symbol: 'CEXX', icon: '🏛️', price: 72.80, change24h: 3.2, aum: 425000000, holdings: [{ token: 'BNB', weight: 45 }, { token: 'OKB', weight: 22 }, { token: 'GT', weight: 15 }, { token: 'MX', weight: 10 }, { token: 'HT', weight: 8 }], managementFee: 0.45, rebalanceFreq: 'Weekly', risk: 'low-medium', description: 'CEX native tokens' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // STRUCTURED PRODUCTS (Leveraged Tokens, Options, Perps)
    // ═══════════════════════════════════════════════════════════════════════════
    structured: {
        products: [
            // Leveraged Tokens (Long)
            { id: 'btc-3x-long', name: 'BTC 3x Long', token: 'BTC3L', icon: '📈', leverage: 3, direction: 'long', underlying: 'BTC', fundingRate: -0.03, dailyRebalance: true, tvl: 850000000, risk: 'high', description: 'Triple leveraged Bitcoin long exposure' },
            { id: 'eth-3x-long', name: 'ETH 3x Long', token: 'ETH3L', icon: '📈', leverage: 3, direction: 'long', underlying: 'ETH', fundingRate: -0.025, dailyRebalance: true, tvl: 620000000, risk: 'high', description: 'Triple leveraged Ethereum long exposure' },
            { id: 'sol-3x-long', name: 'SOL 3x Long', token: 'SOL3L', icon: '📈', leverage: 3, direction: 'long', underlying: 'SOL', fundingRate: -0.04, dailyRebalance: true, tvl: 180000000, risk: 'high', description: 'Triple leveraged Solana long exposure' },
            { id: 'bnb-2x-long', name: 'BNB 2x Long', token: 'BNB2L', icon: '📈', leverage: 2, direction: 'long', underlying: 'BNB', fundingRate: -0.02, dailyRebalance: true, tvl: 95000000, risk: 'medium-high', description: 'Double leveraged BNB long exposure' },
            { id: 'avax-3x-long', name: 'AVAX 3x Long', token: 'AVAX3L', icon: '📈', leverage: 3, direction: 'long', underlying: 'AVAX', fundingRate: -0.035, dailyRebalance: true, tvl: 45000000, risk: 'high', description: 'Triple leveraged Avalanche long' },

            // Leveraged Tokens (Short)
            { id: 'btc-3x-short', name: 'BTC 3x Short', token: 'BTC3S', icon: '📉', leverage: 3, direction: 'short', underlying: 'BTC', fundingRate: 0.02, dailyRebalance: true, tvl: 420000000, risk: 'high', description: 'Triple leveraged Bitcoin short exposure' },
            { id: 'eth-3x-short', name: 'ETH 3x Short', token: 'ETH3S', icon: '📉', leverage: 3, direction: 'short', underlying: 'ETH', fundingRate: 0.015, dailyRebalance: true, tvl: 280000000, risk: 'high', description: 'Triple leveraged Ethereum short exposure' },
            { id: 'sol-2x-short', name: 'SOL 2x Short', token: 'SOL2S', icon: '📉', leverage: 2, direction: 'short', underlying: 'SOL', fundingRate: 0.025, dailyRebalance: true, tvl: 85000000, risk: 'medium-high', description: 'Double leveraged Solana short exposure' },

            // Volatility Products
            { id: 'btc-vol-token', name: 'BTC Volatility', token: 'BVOL', icon: '〰️', leverage: 1, direction: 'volatility', underlying: 'BTC', fundingRate: -0.01, dailyRebalance: true, tvl: 125000000, risk: 'high', description: 'Track Bitcoin volatility index' },
            { id: 'eth-vol-token', name: 'ETH Volatility', token: 'EVOL', icon: '〰️', leverage: 1, direction: 'volatility', underlying: 'ETH', fundingRate: -0.01, dailyRebalance: true, tvl: 85000000, risk: 'high', description: 'Track Ethereum volatility index' },
            { id: 'defi-vol-token', name: 'DeFi Volatility', token: 'DVOL', icon: '〰️', leverage: 1, direction: 'volatility', underlying: 'DEFI', fundingRate: -0.015, dailyRebalance: true, tvl: 45000000, risk: 'high', description: 'Track DeFi sector volatility' },

            // Inverse Tokens
            { id: 'btc-inverse', name: 'BTC Inverse', token: 'iBTC', icon: '🔄', leverage: 1, direction: 'short', underlying: 'BTC', fundingRate: 0.01, dailyRebalance: true, tvl: 320000000, risk: 'medium-high', description: 'Inverse Bitcoin exposure without leverage' },
            { id: 'eth-inverse', name: 'ETH Inverse', token: 'iETH', icon: '🔄', leverage: 1, direction: 'short', underlying: 'ETH', fundingRate: 0.01, dailyRebalance: true, tvl: 180000000, risk: 'medium-high', description: 'Inverse Ethereum exposure without leverage' },

            // Range Tokens
            { id: 'btc-range-50-70k', name: 'BTC 50-70K Range', token: 'BTC50-70', icon: '📊', type: 'range', underlying: 'BTC', lowerBound: 50000, upperBound: 70000, expiry: '2026-03', tvl: 65000000, risk: 'medium', description: 'Earn if BTC stays in 50K-70K range' },
            { id: 'eth-range-2500-4000', name: 'ETH 2.5-4K Range', token: 'ETH25-40', icon: '📊', type: 'range', underlying: 'ETH', lowerBound: 2500, upperBound: 4000, expiry: '2026-03', tvl: 42000000, risk: 'medium', description: 'Earn if ETH stays in 2.5K-4K range' },

            // Principal Protected Notes
            { id: 'btc-ppn-12m', name: 'BTC 12M Protected', token: 'BTCPPN', icon: '🛡️', type: 'ppn', underlying: 'BTC', protection: 100, upside: 60, duration: 365, minInvest: 1000, tvl: 185000000, risk: 'low-medium', description: '100% principal protected, 60% upside cap' },
            { id: 'eth-ppn-6m', name: 'ETH 6M Protected', token: 'ETHPPN', icon: '🛡️', type: 'ppn', underlying: 'ETH', protection: 100, upside: 40, duration: 180, minInvest: 500, tvl: 95000000, risk: 'low-medium', description: '100% principal protected, 40% upside cap' },
            { id: 'sol-ppn-3m', name: 'SOL 3M Protected', token: 'SOLPPN', icon: '🛡️', type: 'ppn', underlying: 'SOL', protection: 90, upside: 80, duration: 90, minInvest: 250, tvl: 35000000, risk: 'medium', description: '90% principal protected, 80% upside cap' },

            // Dual Currency Products
            { id: 'btc-usdc-dual', name: 'BTC/USDC Dual', token: 'BTCDUAL', icon: '💱', type: 'dual', base: 'BTC', quote: 'USDC', strike: 65000, direction: 'sell-high', apy: 45, duration: 7, minInvest: 0.01, tvl: 280000000, risk: 'medium', description: 'Sell BTC at 65K or earn 45% APY' },
            { id: 'eth-usdc-dual', name: 'ETH/USDC Dual', token: 'ETHDUAL', icon: '💱', type: 'dual', base: 'ETH', quote: 'USDC', strike: 3500, direction: 'sell-high', apy: 38, duration: 7, minInvest: 0.1, tvl: 185000000, risk: 'medium', description: 'Sell ETH at 3.5K or earn 38% APY' },
            { id: 'sol-usdc-dual', name: 'SOL/USDC Dual', token: 'SOLDUAL', icon: '💱', type: 'dual', base: 'SOL', quote: 'USDC', strike: 180, direction: 'sell-high', apy: 55, duration: 7, minInvest: 1, tvl: 65000000, risk: 'medium-high', description: 'Sell SOL at 180 or earn 55% APY' },
            { id: 'usdc-btc-dual', name: 'USDC/BTC Dual', token: 'USDCDUAL', icon: '💱', type: 'dual', base: 'USDC', quote: 'BTC', strike: 58000, direction: 'buy-low', apy: 42, duration: 7, minInvest: 100, tvl: 145000000, risk: 'medium', description: 'Buy BTC at 58K or earn 42% APY' },

            // Shark Fin Products
            { id: 'btc-sharkfin-bull', name: 'BTC Bull Shark Fin', token: 'BTCSHK', icon: '🦈', type: 'sharkfin', underlying: 'BTC', direction: 'bull', knockOut: 75000, baseApy: 8, maxApy: 85, duration: 14, minInvest: 100, tvl: 125000000, risk: 'medium', description: 'Earn up to 85% if BTC rises but stays below 75K' },
            { id: 'eth-sharkfin-bull', name: 'ETH Bull Shark Fin', token: 'ETHSHK', icon: '🦈', type: 'sharkfin', underlying: 'ETH', direction: 'bull', knockOut: 4500, baseApy: 6, maxApy: 75, duration: 14, minInvest: 50, tvl: 85000000, risk: 'medium', description: 'Earn up to 75% if ETH rises but stays below 4.5K' },
            { id: 'btc-sharkfin-bear', name: 'BTC Bear Shark Fin', token: 'BTCSHKB', icon: '🦈', type: 'sharkfin', underlying: 'BTC', direction: 'bear', knockOut: 45000, baseApy: 8, maxApy: 90, duration: 14, minInvest: 100, tvl: 65000000, risk: 'medium-high', description: 'Earn up to 90% if BTC falls but stays above 45K' },

            // Accumulator Products
            { id: 'btc-dca-weekly', name: 'BTC Weekly DCA', token: 'BTCDCA', icon: '📅', type: 'accumulator', underlying: 'BTC', frequency: 'weekly', discount: 3, knockOut: 80000, duration: 90, minInvest: 100, tvl: 95000000, risk: 'low-medium', description: 'Accumulate BTC at 3% discount weekly' },
            { id: 'eth-dca-daily', name: 'ETH Daily DCA', token: 'ETHDCA', icon: '📅', type: 'accumulator', underlying: 'ETH', frequency: 'daily', discount: 2, knockOut: 5000, duration: 30, minInvest: 50, tvl: 65000000, risk: 'low-medium', description: 'Accumulate ETH at 2% discount daily' },

            // Fixed Rate Products
            { id: 'usdc-fixed-30d', name: 'USDC 30D Fixed', token: 'USDC30F', icon: '🔒', type: 'fixed', underlying: 'USDC', apy: 12, duration: 30, minInvest: 100, tvl: 520000000, risk: 'low', description: 'Fixed 12% APY for 30 days' },
            { id: 'usdc-fixed-90d', name: 'USDC 90D Fixed', token: 'USDC90F', icon: '🔒', type: 'fixed', underlying: 'USDC', apy: 15, duration: 90, minInvest: 100, tvl: 380000000, risk: 'low', description: 'Fixed 15% APY for 90 days' },
            { id: 'usdc-fixed-180d', name: 'USDC 180D Fixed', token: 'USDC180F', icon: '🔒', type: 'fixed', underlying: 'USDC', apy: 18, duration: 180, minInvest: 500, tvl: 280000000, risk: 'low', description: 'Fixed 18% APY for 180 days' },
            { id: 'usdt-fixed-365d', name: 'USDT 1Y Fixed', token: 'USDT1YF', icon: '🔒', type: 'fixed', underlying: 'USDT', apy: 22, duration: 365, minInvest: 1000, tvl: 450000000, risk: 'low-medium', description: 'Fixed 22% APY for 1 year' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // NFT FINANCE (Fractionalized, Lending, Renting)
    // ═══════════════════════════════════════════════════════════════════════════
    nftFinance: {
        products: [
            // Fractionalized Blue Chips
            { id: 'frac-bayc', name: 'Fractional BAYC', token: 'fBAYC', icon: '🦍', collection: 'Bored Ape Yacht Club', floor: 28.5, fractions: 10000, pricePerFraction: 0.00285, tvl: 85000000, apy: 5.2, risk: 'high', description: 'Own a piece of BAYC #8817' },
            { id: 'frac-punk', name: 'Fractional CryptoPunk', token: 'fPUNK', icon: '👾', collection: 'CryptoPunks', floor: 52.0, fractions: 10000, pricePerFraction: 0.0052, tvl: 156000000, apy: 4.8, risk: 'high', description: 'Own a piece of Punk #5822' },
            { id: 'frac-azuki', name: 'Fractional Azuki', token: 'fAZUKI', icon: '🎌', collection: 'Azuki', floor: 8.5, fractions: 5000, pricePerFraction: 0.0017, tvl: 25500000, apy: 6.5, risk: 'high', description: 'Own a piece of Azuki #9605' },
            { id: 'frac-mayc', name: 'Fractional MAYC', token: 'fMAYC', icon: '🧟', collection: 'Mutant Ape Yacht Club', floor: 4.2, fractions: 5000, pricePerFraction: 0.00084, tvl: 12600000, apy: 7.2, risk: 'high', description: 'Own a piece of MAYC #8662' },
            { id: 'frac-pudgy', name: 'Fractional Pudgy', token: 'fPUDGY', icon: '🐧', collection: 'Pudgy Penguins', floor: 12.5, fractions: 5000, pricePerFraction: 0.0025, tvl: 37500000, apy: 8.5, risk: 'high', description: 'Own a piece of Pudgy #6529' },
            { id: 'frac-doodles', name: 'Fractional Doodles', token: 'fDOOD', icon: '🌈', collection: 'Doodles', floor: 3.8, fractions: 5000, pricePerFraction: 0.00076, tvl: 11400000, apy: 9.2, risk: 'high', description: 'Own a piece of Doodle #8888' },
            { id: 'frac-milady', name: 'Fractional Milady', token: 'fMILADY', icon: '👩', collection: 'Milady', floor: 4.5, fractions: 5000, pricePerFraction: 0.0009, tvl: 13500000, apy: 12.5, risk: 'high', description: 'Own a piece of Milady #4269' },

            // NFT Index Tokens
            { id: 'nft-bluechip-index', name: 'Blue Chip NFT Index', token: 'BCNFT', icon: '💎', type: 'index', holdings: ['BAYC', 'CryptoPunks', 'Azuki', 'MAYC', 'Doodles'], tvl: 95000000, apy: 0, risk: 'high', description: 'Diversified top 5 NFT collections' },
            { id: 'nft-gaming-index', name: 'Gaming NFT Index', token: 'GNFT', icon: '🎮', type: 'index', holdings: ['Loot', 'Wolf Game', 'Parallel', 'Illuvium', 'Gods Unchained'], tvl: 25000000, apy: 0, risk: 'high', description: 'Top gaming NFT collections' },
            { id: 'nft-art-index', name: 'Art NFT Index', token: 'ANFT', icon: '🎨', type: 'index', holdings: ['Art Blocks', 'SuperRare', 'Foundation', 'Async Art', 'KnownOrigin'], tvl: 18000000, apy: 0, risk: 'high', description: 'Digital art collections' },

            // NFT Lending Pools
            { id: 'nft-lend-bayc', name: 'BAYC Lending Pool', token: 'BAYC-LP', icon: '🦍', collection: 'BAYC', maxLTV: 40, interestRate: 25, floorPrice: 28.5, availableLiquidity: 850, risk: 'high', description: 'Borrow against your BAYC' },
            { id: 'nft-lend-punk', name: 'Punk Lending Pool', token: 'PUNK-LP', icon: '👾', collection: 'CryptoPunks', maxLTV: 45, interestRate: 22, floorPrice: 52.0, availableLiquidity: 1250, risk: 'high', description: 'Borrow against your CryptoPunk' },
            { id: 'nft-lend-azuki', name: 'Azuki Lending Pool', token: 'AZUKI-LP', icon: '🎌', collection: 'Azuki', maxLTV: 35, interestRate: 28, floorPrice: 8.5, availableLiquidity: 420, risk: 'high', description: 'Borrow against your Azuki' },
            { id: 'nft-lend-pudgy', name: 'Pudgy Lending Pool', token: 'PUDGY-LP', icon: '🐧', collection: 'Pudgy Penguins', maxLTV: 35, interestRate: 30, floorPrice: 12.5, availableLiquidity: 380, risk: 'high', description: 'Borrow against your Pudgy' },
            { id: 'nft-lend-omni', name: 'Omni NFT Lending', token: 'OMNI-LP', icon: '🔮', collection: 'Multi-Collection', maxLTV: 30, interestRate: 35, floorPrice: 0, availableLiquidity: 2500, risk: 'high', description: 'Lend against any supported NFT' },

            // NFT Rental Pools
            { id: 'nft-rent-gaming', name: 'Gaming NFT Rentals', token: 'RENT-G', icon: '🎮', type: 'rental', categories: ['Gaming', 'Play-to-Earn'], avgDailyRate: 0.02, utilization: 78, tvl: 8500000, risk: 'medium-high', description: 'Rent gaming NFTs for P2E' },
            { id: 'nft-rent-pfp', name: 'PFP NFT Rentals', token: 'RENT-P', icon: '🖼️', type: 'rental', categories: ['PFP', 'Social'], avgDailyRate: 0.05, utilization: 45, tvl: 5200000, risk: 'medium-high', description: 'Rent blue chip PFPs' },
            { id: 'nft-rent-virtual', name: 'Virtual Land Rentals', token: 'RENT-L', icon: '🏝️', type: 'rental', categories: ['Metaverse', 'Land'], avgDailyRate: 0.08, utilization: 62, tvl: 12500000, risk: 'medium-high', description: 'Rent metaverse land parcels' },

            // NFT Yield Products
            { id: 'nft-yield-bayc', name: 'BAYC Yield Vault', token: 'yBAYC', icon: '🦍', collection: 'BAYC', strategy: 'Rental + Staking', apy: 15.5, minNFTs: 1, tvl: 42000000, risk: 'high', description: 'Earn yield on your BAYC through rentals' },
            { id: 'nft-yield-punk', name: 'Punk Yield Vault', token: 'yPUNK', icon: '👾', collection: 'CryptoPunks', strategy: 'Lending + Collateral', apy: 12.8, minNFTs: 1, tvl: 65000000, risk: 'high', description: 'Generate yield from Punk lending' },
            { id: 'nft-yield-gaming', name: 'Gaming NFT Yield', token: 'yGAME', icon: '🎮', collection: 'Gaming', strategy: 'Rental + Rewards', apy: 45.0, minNFTs: 1, tvl: 18000000, risk: 'high', description: 'P2E revenue sharing from gaming NFTs' },

            // NFT Options
            { id: 'nft-call-bayc', name: 'BAYC Call Option', token: 'BAYC-C', icon: '📈', collection: 'BAYC', type: 'call', strike: 32, premium: 2.5, expiry: '2026-02', risk: 'high', description: 'Right to buy BAYC at 32 ETH' },
            { id: 'nft-put-bayc', name: 'BAYC Put Option', token: 'BAYC-P', icon: '📉', collection: 'BAYC', type: 'put', strike: 25, premium: 1.8, expiry: '2026-02', risk: 'high', description: 'Right to sell BAYC at 25 ETH' },
            { id: 'nft-call-punk', name: 'Punk Call Option', token: 'PUNK-C', icon: '📈', collection: 'CryptoPunks', type: 'call', strike: 60, premium: 4.5, expiry: '2026-02', risk: 'high', description: 'Right to buy Punk at 60 ETH' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVATIVES & OPTIONS (Vaults, Strategies)
    // ═══════════════════════════════════════════════════════════════════════════
    derivatives: {
        products: [
            // Covered Call Vaults
            { id: 'cc-eth-weekly', name: 'ETH Weekly Covered Call', token: 'ccETH', icon: '📞', underlying: 'ETH', strategy: 'covered-call', delta: -0.10, strike: '10% OTM', expiry: 'Weekly', apy: 35, tvl: 185000000, risk: 'medium', description: 'Sell weekly ETH calls for premium' },
            { id: 'cc-btc-weekly', name: 'BTC Weekly Covered Call', token: 'ccBTC', icon: '📞', underlying: 'BTC', strategy: 'covered-call', delta: -0.10, strike: '10% OTM', expiry: 'Weekly', apy: 28, tvl: 320000000, risk: 'medium', description: 'Sell weekly BTC calls for premium' },
            { id: 'cc-sol-weekly', name: 'SOL Weekly Covered Call', token: 'ccSOL', icon: '📞', underlying: 'SOL', strategy: 'covered-call', delta: -0.15, strike: '15% OTM', expiry: 'Weekly', apy: 55, tvl: 65000000, risk: 'medium-high', description: 'Sell weekly SOL calls for premium' },
            { id: 'cc-avax-biweekly', name: 'AVAX Bi-Weekly CC', token: 'ccAVAX', icon: '📞', underlying: 'AVAX', strategy: 'covered-call', delta: -0.12, strike: '12% OTM', expiry: 'Bi-Weekly', apy: 42, tvl: 28000000, risk: 'medium-high', description: 'Sell bi-weekly AVAX calls' },

            // Cash Secured Put Vaults
            { id: 'csp-eth-weekly', name: 'ETH Weekly Cash Put', token: 'cspETH', icon: '📥', underlying: 'ETH', strategy: 'cash-secured-put', delta: 0.15, strike: '15% OTM', expiry: 'Weekly', apy: 32, tvl: 145000000, risk: 'medium', description: 'Sell weekly ETH puts for premium' },
            { id: 'csp-btc-weekly', name: 'BTC Weekly Cash Put', token: 'cspBTC', icon: '📥', underlying: 'BTC', strategy: 'cash-secured-put', delta: 0.12, strike: '12% OTM', expiry: 'Weekly', apy: 25, tvl: 285000000, risk: 'medium', description: 'Sell weekly BTC puts for premium' },
            { id: 'csp-sol-weekly', name: 'SOL Weekly Cash Put', token: 'cspSOL', icon: '📥', underlying: 'SOL', strategy: 'cash-secured-put', delta: 0.18, strike: '18% OTM', expiry: 'Weekly', apy: 48, tvl: 52000000, risk: 'medium-high', description: 'Sell weekly SOL puts for premium' },

            // Straddle Vaults
            { id: 'straddle-eth', name: 'ETH Straddle Vault', token: 'strETH', icon: '📊', underlying: 'ETH', strategy: 'short-straddle', delta: 0, apy: 65, tvl: 42000000, risk: 'high', description: 'Profit from low ETH volatility' },
            { id: 'straddle-btc', name: 'BTC Straddle Vault', token: 'strBTC', icon: '📊', underlying: 'BTC', strategy: 'short-straddle', delta: 0, apy: 52, tvl: 85000000, risk: 'high', description: 'Profit from low BTC volatility' },

            // Strangle Vaults
            { id: 'strangle-eth', name: 'ETH Strangle Vault', token: 'stgETH', icon: '🔗', underlying: 'ETH', strategy: 'short-strangle', delta: 0, width: '15%', apy: 75, tvl: 35000000, risk: 'high', description: 'Sell OTM calls and puts on ETH' },
            { id: 'strangle-btc', name: 'BTC Strangle Vault', token: 'stgBTC', icon: '🔗', underlying: 'BTC', strategy: 'short-strangle', delta: 0, width: '12%', apy: 58, tvl: 65000000, risk: 'high', description: 'Sell OTM calls and puts on BTC' },

            // Iron Condor Vaults
            { id: 'condor-eth', name: 'ETH Iron Condor', token: 'icETH', icon: '🦅', underlying: 'ETH', strategy: 'iron-condor', delta: 0, innerWidth: '8%', outerWidth: '15%', apy: 45, tvl: 28000000, risk: 'medium-high', description: 'Limited risk range-bound ETH strategy' },
            { id: 'condor-btc', name: 'BTC Iron Condor', token: 'icBTC', icon: '🦅', underlying: 'BTC', strategy: 'iron-condor', delta: 0, innerWidth: '6%', outerWidth: '12%', apy: 38, tvl: 52000000, risk: 'medium-high', description: 'Limited risk range-bound BTC strategy' },

            // Butterfly Spreads
            { id: 'butterfly-eth', name: 'ETH Butterfly', token: 'bfETH', icon: '🦋', underlying: 'ETH', strategy: 'butterfly', centerStrike: 'ATM', wings: '10%', apy: 85, tvl: 18000000, risk: 'high', description: 'Profit from ETH staying near current price' },
            { id: 'butterfly-btc', name: 'BTC Butterfly', token: 'bfBTC', icon: '🦋', underlying: 'BTC', strategy: 'butterfly', centerStrike: 'ATM', wings: '8%', apy: 72, tvl: 32000000, risk: 'high', description: 'Profit from BTC staying near current price' },

            // Calendar Spreads
            { id: 'calendar-eth', name: 'ETH Calendar Spread', token: 'calETH', icon: '📅', underlying: 'ETH', strategy: 'calendar', nearExpiry: '1W', farExpiry: '4W', apy: 55, tvl: 22000000, risk: 'medium-high', description: 'Profit from ETH time decay differential' },
            { id: 'calendar-btc', name: 'BTC Calendar Spread', token: 'calBTC', icon: '📅', underlying: 'BTC', strategy: 'calendar', nearExpiry: '1W', farExpiry: '4W', apy: 42, tvl: 38000000, risk: 'medium-high', description: 'Profit from BTC time decay differential' },

            // Volatility Arbitrage
            { id: 'vol-arb-eth', name: 'ETH Vol Arb', token: 'vaETH', icon: '📈', underlying: 'ETH', strategy: 'vol-arbitrage', ivTarget: 'Underpriced', apy: 28, tvl: 45000000, risk: 'medium', description: 'Exploit ETH implied vs realized vol difference' },
            { id: 'vol-arb-btc', name: 'BTC Vol Arb', token: 'vaBTC', icon: '📈', underlying: 'BTC', strategy: 'vol-arbitrage', ivTarget: 'Underpriced', apy: 22, tvl: 78000000, risk: 'medium', description: 'Exploit BTC implied vs realized vol difference' },

            // Basis Trade Vaults
            { id: 'basis-eth', name: 'ETH Basis Trade', token: 'bETH', icon: '⚖️', underlying: 'ETH', strategy: 'basis-trade', spotPerp: true, apy: 18, tvl: 185000000, risk: 'low-medium', description: 'Capture ETH spot-perp basis spread' },
            { id: 'basis-btc', name: 'BTC Basis Trade', token: 'bBTC', icon: '⚖️', underlying: 'BTC', strategy: 'basis-trade', spotPerp: true, apy: 15, tvl: 320000000, risk: 'low-medium', description: 'Capture BTC spot-perp basis spread' },
            { id: 'basis-sol', name: 'SOL Basis Trade', token: 'bSOL', icon: '⚖️', underlying: 'SOL', strategy: 'basis-trade', spotPerp: true, apy: 25, tvl: 65000000, risk: 'low-medium', description: 'Capture SOL spot-perp basis spread' },

            // Funding Rate Vaults
            { id: 'funding-eth', name: 'ETH Funding Vault', token: 'fETH', icon: '💰', underlying: 'ETH', strategy: 'funding-arbitrage', avgFunding: 0.015, apy: 22, tvl: 145000000, risk: 'low-medium', description: 'Capture ETH perpetual funding rates' },
            { id: 'funding-btc', name: 'BTC Funding Vault', token: 'fBTC', icon: '💰', underlying: 'BTC', strategy: 'funding-arbitrage', avgFunding: 0.012, apy: 18, tvl: 280000000, risk: 'low-medium', description: 'Capture BTC perpetual funding rates' },
            { id: 'funding-multi', name: 'Multi-Asset Funding', token: 'fMULTI', icon: '💰', underlying: 'Multi', strategy: 'funding-arbitrage', avgFunding: 0.02, apy: 28, tvl: 95000000, risk: 'medium', description: 'Rotate funding across multiple assets' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CROSS-CHAIN PRODUCTS (Bridge Yields, Omnichain)
    // ═══════════════════════════════════════════════════════════════════════════
    crossChain: {
        products: [
            // Bridge Liquidity Pools
            { id: 'bridge-eth-arb', name: 'ETH→Arbitrum Bridge LP', token: 'bETH-ARB', icon: '🌉', route: 'Ethereum→Arbitrum', asset: 'ETH', apy: 8.5, tvl: 285000000, bridgeFee: 0.05, avgTime: '10 min', risk: 'low-medium', description: 'Provide liquidity for ETH bridging to Arbitrum' },
            { id: 'bridge-eth-op', name: 'ETH→Optimism Bridge LP', token: 'bETH-OP', icon: '🌉', route: 'Ethereum→Optimism', asset: 'ETH', apy: 7.8, tvl: 195000000, bridgeFee: 0.04, avgTime: '10 min', risk: 'low-medium', description: 'Provide liquidity for ETH bridging to Optimism' },
            { id: 'bridge-eth-base', name: 'ETH→Base Bridge LP', token: 'bETH-BASE', icon: '🌉', route: 'Ethereum→Base', asset: 'ETH', apy: 9.2, tvl: 145000000, bridgeFee: 0.03, avgTime: '10 min', risk: 'low-medium', description: 'Provide liquidity for ETH bridging to Base' },
            { id: 'bridge-usdc-arb', name: 'USDC→Arbitrum Bridge LP', token: 'bUSDC-ARB', icon: '🌉', route: 'Ethereum→Arbitrum', asset: 'USDC', apy: 12.5, tvl: 420000000, bridgeFee: 0.08, avgTime: '5 min', risk: 'low', description: 'USDC bridging liquidity to Arbitrum' },
            { id: 'bridge-usdc-sol', name: 'USDC→Solana Bridge LP', token: 'bUSDC-SOL', icon: '🌉', route: 'Ethereum→Solana', asset: 'USDC', apy: 15.0, tvl: 185000000, bridgeFee: 0.12, avgTime: '2 min', risk: 'medium', description: 'USDC bridging liquidity to Solana' },
            { id: 'bridge-usdt-bsc', name: 'USDT→BSC Bridge LP', token: 'bUSDT-BSC', icon: '🌉', route: 'Ethereum→BSC', asset: 'USDT', apy: 10.5, tvl: 320000000, bridgeFee: 0.06, avgTime: '15 min', risk: 'low-medium', description: 'USDT bridging liquidity to BSC' },

            // Omnichain Vaults
            { id: 'omni-eth-yield', name: 'Omnichain ETH Yield', token: 'oETH', icon: '🌐', chains: ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon'], asset: 'ETH', apy: 6.5, tvl: 520000000, risk: 'low-medium', description: 'Optimal ETH yield across 5 chains' },
            { id: 'omni-usdc-yield', name: 'Omnichain USDC Yield', token: 'oUSDC', icon: '🌐', chains: ['Ethereum', 'Arbitrum', 'Optimism', 'Polygon', 'Avalanche'], asset: 'USDC', apy: 15.0, tvl: 850000000, risk: 'low', description: 'Best USDC yields across chains' },
            { id: 'omni-stables', name: 'Omnichain Stables', token: 'oSTAB', icon: '🌐', chains: ['Ethereum', 'Arbitrum', 'BSC', 'Avalanche', 'Solana'], asset: 'Multi-Stable', apy: 18.0, tvl: 380000000, risk: 'low-medium', description: 'Rotate stables across chains for best yield' },
            { id: 'omni-btc-yield', name: 'Omnichain BTC Yield', token: 'oBTC', icon: '🌐', chains: ['Ethereum', 'Arbitrum', 'Optimism', 'BSC'], asset: 'WBTC', apy: 4.5, tvl: 285000000, risk: 'low-medium', description: 'Cross-chain BTC yield optimization' },

            // Chain-Specific Yield Aggregators
            { id: 'yield-arb-all', name: 'Arbitrum Yield Max', token: 'yARB', icon: '🔵', chains: ['Arbitrum'], protocols: ['GMX', 'Radiant', 'Camelot', 'Gains'], apy: 22.0, tvl: 145000000, risk: 'medium', description: 'Best yields across Arbitrum protocols' },
            { id: 'yield-op-all', name: 'Optimism Yield Max', token: 'yOP', icon: '🔴', chains: ['Optimism'], protocols: ['Velodrome', 'Synthetix', 'Aave', 'Sonne'], apy: 18.5, tvl: 95000000, risk: 'medium', description: 'Best yields across Optimism protocols' },
            { id: 'yield-base-all', name: 'Base Yield Max', token: 'yBASE', icon: '🔵', chains: ['Base'], protocols: ['Aerodrome', 'Moonwell', 'Seamless', 'Extra'], apy: 25.0, tvl: 65000000, risk: 'medium', description: 'Best yields across Base protocols' },
            { id: 'yield-sol-all', name: 'Solana Yield Max', token: 'ySOL', icon: '🟣', chains: ['Solana'], protocols: ['Marinade', 'Jupiter', 'Kamino', 'Marginfi'], apy: 28.0, tvl: 185000000, risk: 'medium', description: 'Best yields across Solana protocols' },

            // Cross-Chain Arbitrage
            { id: 'arb-eth-chains', name: 'ETH Cross-Chain Arb', token: 'arbETH', icon: '⚡', chains: ['Ethereum', 'Arbitrum', 'Optimism', 'Base'], strategy: 'price-arbitrage', apy: 12.0, tvl: 85000000, risk: 'medium', description: 'Exploit ETH price differences across L2s' },
            { id: 'arb-usdc-chains', name: 'USDC Cross-Chain Arb', token: 'arbUSDC', icon: '⚡', chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Avalanche'], strategy: 'price-arbitrage', apy: 8.5, tvl: 145000000, risk: 'low-medium', description: 'Exploit USDC price differences across chains' },
            { id: 'arb-yield-chains', name: 'Yield Arbitrage', token: 'arbYIELD', icon: '⚡', chains: ['Multi'], strategy: 'yield-arbitrage', apy: 18.0, tvl: 65000000, risk: 'medium', description: 'Capture yield differentials across chains' },

            // Interoperability Tokens
            { id: 'lz-staking', name: 'LayerZero Staking', token: 'ZRO', icon: '🔗', protocol: 'LayerZero', apy: 8.0, tvl: 285000000, risk: 'medium', description: 'Stake ZRO for cross-chain rewards' },
            { id: 'axl-staking', name: 'Axelar Staking', token: 'AXL', icon: '🔗', protocol: 'Axelar', apy: 12.0, tvl: 125000000, risk: 'medium', description: 'Stake AXL for interchain security' },
            { id: 'wormhole-staking', name: 'Wormhole Staking', token: 'W', icon: '🌀', protocol: 'Wormhole', apy: 6.5, tvl: 185000000, risk: 'medium', description: 'Stake W for bridge governance' },
            { id: 'ccip-staking', name: 'Chainlink CCIP', token: 'LINK', icon: '🔷', protocol: 'Chainlink CCIP', apy: 5.5, tvl: 520000000, risk: 'low-medium', description: 'LINK staking for CCIP security' },

            // Multi-Chain Index Products
            { id: 'l2-index', name: 'L2 Ecosystem Index', token: 'L2X', icon: '📊', chains: ['Arbitrum', 'Optimism', 'Base', 'zkSync', 'Starknet'], holdings: ['ARB', 'OP', 'STRK', 'ZK', 'MANTA'], apy: 0, tvl: 95000000, risk: 'medium', description: 'Diversified L2 token exposure' },
            { id: 'cosmos-index', name: 'Cosmos Ecosystem Index', token: 'COSMX', icon: '⚛️', chains: ['Cosmos Hub', 'Osmosis', 'Injective', 'Celestia'], holdings: ['ATOM', 'OSMO', 'INJ', 'TIA', 'SEI'], apy: 0, tvl: 75000000, risk: 'medium', description: 'Diversified Cosmos ecosystem' },
            { id: 'bridge-index', name: 'Bridge Token Index', token: 'BRIX', icon: '🌉', protocols: ['LayerZero', 'Axelar', 'Wormhole', 'Chainlink'], holdings: ['ZRO', 'AXL', 'W', 'LINK'], apy: 0, tvl: 45000000, risk: 'medium', description: 'Cross-chain infrastructure index' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // INSURANCE PRODUCTS (DeFi Coverage, Protocol Protection)
    // ═══════════════════════════════════════════════════════════════════════════
    insurance: {
        products: [
            // Smart Contract Coverage
            { id: 'cover-aave', name: 'Aave Protocol Cover', token: 'cvAAVE', icon: '🛡️', protocol: 'Aave', coverageType: 'smart-contract', maxCoverage: 10000000, premiumRate: 2.5, capacityUsed: 65, tvl: 85000000, risk: 'low', description: 'Coverage against Aave smart contract exploits' },
            { id: 'cover-compound', name: 'Compound Protocol Cover', token: 'cvCOMP', icon: '🛡️', protocol: 'Compound', coverageType: 'smart-contract', maxCoverage: 8000000, premiumRate: 2.8, capacityUsed: 55, tvl: 65000000, risk: 'low', description: 'Coverage against Compound exploits' },
            { id: 'cover-uniswap', name: 'Uniswap Protocol Cover', token: 'cvUNI', icon: '🛡️', protocol: 'Uniswap', coverageType: 'smart-contract', maxCoverage: 15000000, premiumRate: 2.2, capacityUsed: 72, tvl: 120000000, risk: 'low', description: 'Coverage against Uniswap V3 exploits' },
            { id: 'cover-curve', name: 'Curve Protocol Cover', token: 'cvCRV', icon: '🛡️', protocol: 'Curve', coverageType: 'smart-contract', maxCoverage: 12000000, premiumRate: 3.0, capacityUsed: 68, tvl: 95000000, risk: 'low-medium', description: 'Coverage against Curve exploits' },
            { id: 'cover-gmx', name: 'GMX Protocol Cover', token: 'cvGMX', icon: '🛡️', protocol: 'GMX', coverageType: 'smart-contract', maxCoverage: 5000000, premiumRate: 4.5, capacityUsed: 45, tvl: 35000000, risk: 'medium', description: 'Coverage against GMX exploits' },
            { id: 'cover-lido', name: 'Lido Protocol Cover', token: 'cvLIDO', icon: '🛡️', protocol: 'Lido', coverageType: 'smart-contract', maxCoverage: 20000000, premiumRate: 2.0, capacityUsed: 78, tvl: 185000000, risk: 'low', description: 'Coverage against Lido staking risks' },
            { id: 'cover-eigenlayer', name: 'EigenLayer Cover', token: 'cvEIGEN', icon: '🛡️', protocol: 'EigenLayer', coverageType: 'smart-contract', maxCoverage: 8000000, premiumRate: 5.0, capacityUsed: 35, tvl: 45000000, risk: 'medium', description: 'Coverage against restaking risks' },

            // Stablecoin Depeg Coverage
            { id: 'cover-usdt-depeg', name: 'USDT Depeg Cover', token: 'cvUSDT', icon: '💵', asset: 'USDT', coverageType: 'depeg', triggerPrice: 0.95, maxCoverage: 50000000, premiumRate: 1.5, capacityUsed: 82, tvl: 320000000, risk: 'very-low', description: 'Coverage if USDT depegs below $0.95' },
            { id: 'cover-usdc-depeg', name: 'USDC Depeg Cover', token: 'cvUSDC', icon: '💵', asset: 'USDC', coverageType: 'depeg', triggerPrice: 0.95, maxCoverage: 50000000, premiumRate: 1.2, capacityUsed: 75, tvl: 285000000, risk: 'very-low', description: 'Coverage if USDC depegs below $0.95' },
            { id: 'cover-dai-depeg', name: 'DAI Depeg Cover', token: 'cvDAI', icon: '💵', asset: 'DAI', coverageType: 'depeg', triggerPrice: 0.95, maxCoverage: 30000000, premiumRate: 1.8, capacityUsed: 58, tvl: 125000000, risk: 'low', description: 'Coverage if DAI depegs below $0.95' },
            { id: 'cover-frax-depeg', name: 'FRAX Depeg Cover', token: 'cvFRAX', icon: '💵', asset: 'FRAX', coverageType: 'depeg', triggerPrice: 0.95, maxCoverage: 15000000, premiumRate: 2.5, capacityUsed: 42, tvl: 55000000, risk: 'low-medium', description: 'Coverage if FRAX depegs below $0.95' },
            { id: 'cover-usde-depeg', name: 'USDe Depeg Cover', token: 'cvUSDE', icon: '💵', asset: 'USDe', coverageType: 'depeg', triggerPrice: 0.95, maxCoverage: 10000000, premiumRate: 4.0, capacityUsed: 28, tvl: 35000000, risk: 'medium', description: 'Coverage if USDe depegs below $0.95' },

            // Slashing Coverage
            { id: 'cover-eth-slash', name: 'ETH Slashing Cover', token: 'cvSLASH', icon: '⚡', asset: 'stETH', coverageType: 'slashing', maxCoverage: 25000000, premiumRate: 0.8, capacityUsed: 45, tvl: 145000000, risk: 'very-low', description: 'Coverage against ETH validator slashing' },
            { id: 'cover-eigenlayer-slash', name: 'Restaking Slash Cover', token: 'cvRESTAKE', icon: '⚡', asset: 'EIGEN', coverageType: 'slashing', maxCoverage: 10000000, premiumRate: 3.5, capacityUsed: 25, tvl: 35000000, risk: 'medium', description: 'Coverage against restaking slashing' },

            // Bridge Coverage
            { id: 'cover-bridge-general', name: 'Bridge Exploit Cover', token: 'cvBRIDGE', icon: '🌉', coverageType: 'bridge', bridges: ['Multichain', 'Wormhole', 'LayerZero', 'Stargate'], maxCoverage: 5000000, premiumRate: 8.0, capacityUsed: 38, tvl: 28000000, risk: 'medium-high', description: 'Coverage against bridge exploits' },
            { id: 'cover-layerzero', name: 'LayerZero Cover', token: 'cvLZ', icon: '🔗', bridge: 'LayerZero', coverageType: 'bridge', maxCoverage: 8000000, premiumRate: 5.5, capacityUsed: 42, tvl: 45000000, risk: 'medium', description: 'Coverage against LayerZero exploits' },
            { id: 'cover-wormhole', name: 'Wormhole Cover', token: 'cvWH', icon: '🌀', bridge: 'Wormhole', coverageType: 'bridge', maxCoverage: 6000000, premiumRate: 6.0, capacityUsed: 35, tvl: 35000000, risk: 'medium', description: 'Coverage against Wormhole exploits' },

            // Oracle Coverage
            { id: 'cover-chainlink', name: 'Chainlink Oracle Cover', token: 'cvLINK', icon: '🔮', oracle: 'Chainlink', coverageType: 'oracle', maxCoverage: 15000000, premiumRate: 1.5, capacityUsed: 55, tvl: 85000000, risk: 'very-low', description: 'Coverage against oracle manipulation' },
            { id: 'cover-pyth', name: 'Pyth Oracle Cover', token: 'cvPYTH', icon: '🔮', oracle: 'Pyth', coverageType: 'oracle', maxCoverage: 8000000, premiumRate: 2.5, capacityUsed: 38, tvl: 42000000, risk: 'low', description: 'Coverage against Pyth oracle issues' },

            // Rug Pull Coverage
            { id: 'cover-rug-new', name: 'New Token Rug Cover', token: 'cvRUG', icon: '🚨', coverageType: 'rug-pull', launchAge: '<30 days', maxCoverage: 1000000, premiumRate: 15.0, capacityUsed: 22, tvl: 12000000, risk: 'high', description: 'Coverage for new token investments' },
            { id: 'cover-rug-meme', name: 'Memecoin Rug Cover', token: 'cvMEME', icon: '🐕', coverageType: 'rug-pull', category: 'Memecoins', maxCoverage: 500000, premiumRate: 25.0, capacityUsed: 18, tvl: 8000000, risk: 'high', description: 'Coverage for memecoin investments' },

            // Yield Coverage
            { id: 'cover-yield-apy', name: 'Yield Guarantee', token: 'cvYIELD', icon: '📈', coverageType: 'yield-guarantee', minAPY: 5, maxCoverage: 5000000, premiumRate: 3.0, capacityUsed: 48, tvl: 35000000, risk: 'medium', description: 'Guarantee minimum 5% APY on deposits' },

            // Bundled Coverage
            { id: 'cover-defi-bundle', name: 'DeFi All-Risk Bundle', token: 'cvALL', icon: '🛡️', coverageType: 'bundle', includes: ['smart-contract', 'depeg', 'oracle'], maxCoverage: 25000000, premiumRate: 4.5, capacityUsed: 62, tvl: 185000000, risk: 'low-medium', description: 'Comprehensive DeFi coverage bundle' },
            { id: 'cover-lsd-bundle', name: 'Liquid Staking Bundle', token: 'cvLSD', icon: '🛡️', coverageType: 'bundle', includes: ['slashing', 'smart-contract', 'depeg'], maxCoverage: 15000000, premiumRate: 3.2, capacityUsed: 55, tvl: 95000000, risk: 'low', description: 'Complete liquid staking coverage' },

            // Underwriting Pools (Earn Premiums)
            { id: 'underwrite-general', name: 'General Underwriting', token: 'uwGEN', icon: '💰', type: 'underwriting', expectedAPY: 12, utilizationRate: 58, tvl: 285000000, risk: 'medium-high', description: 'Provide capital to underwrite claims' },
            { id: 'underwrite-stables', name: 'Stablecoin Underwriting', token: 'uwSTAB', icon: '💰', type: 'underwriting', expectedAPY: 8, utilizationRate: 72, tvl: 420000000, risk: 'medium', description: 'Underwrite stablecoin depeg risk' },
            { id: 'underwrite-protocol', name: 'Protocol Underwriting', token: 'uwPRO', icon: '💰', type: 'underwriting', expectedAPY: 15, utilizationRate: 45, tvl: 145000000, risk: 'medium-high', description: 'Underwrite smart contract risks' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LAUNCHPAD PRODUCTS (IDO, Fair Launch, Pre-Sale)
    // ═══════════════════════════════════════════════════════════════════════════
    launchpad: {
        products: [
            // Active IDOs
            { id: 'ido-aiprotocol', name: 'AI Protocol IDO', token: 'AIP', icon: '🤖', status: 'active', category: 'AI', totalRaise: 5000000, tokenPrice: 0.15, fdv: 150000000, vestingCliff: 30, vestingPeriod: 365, endDate: '2026-01-21', minAlloc: 100, maxAlloc: 5000, participants: 12500, risk: 'high', description: 'AI-powered DeFi protocol' },
            { id: 'ido-zkgaming', name: 'zkGaming IDO', token: 'ZKG', icon: '🎮', status: 'active', category: 'Gaming', totalRaise: 3000000, tokenPrice: 0.08, fdv: 80000000, vestingCliff: 14, vestingPeriod: 180, endDate: '2026-01-18', minAlloc: 50, maxAlloc: 2500, participants: 8200, risk: 'high', description: 'Zero-knowledge gaming platform' },
            { id: 'ido-depin-net', name: 'DePIN Network IDO', token: 'DPIN', icon: '📡', status: 'active', category: 'DePIN', totalRaise: 8000000, tokenPrice: 0.25, fdv: 250000000, vestingCliff: 60, vestingPeriod: 540, endDate: '2026-01-25', minAlloc: 200, maxAlloc: 10000, participants: 15800, risk: 'high', description: 'Decentralized infrastructure network' },

            // Upcoming IDOs
            { id: 'ido-socialfi', name: 'SocialFi Hub', token: 'SOCIAL', icon: '💬', status: 'upcoming', category: 'SocialFi', totalRaise: 4000000, tokenPrice: 0.12, fdv: 120000000, vestingCliff: 30, vestingPeriod: 270, startDate: '2026-01-28', minAlloc: 100, maxAlloc: 4000, registered: 22500, risk: 'high', description: 'Decentralized social platform' },
            { id: 'ido-rwa-chain', name: 'RWA Chain', token: 'RWAC', icon: '🏛️', status: 'upcoming', category: 'RWA', totalRaise: 12000000, tokenPrice: 0.50, fdv: 500000000, vestingCliff: 90, vestingPeriod: 720, startDate: '2026-02-01', minAlloc: 500, maxAlloc: 25000, registered: 35200, risk: 'medium-high', description: 'Real world asset tokenization chain' },
            { id: 'ido-modular-da', name: 'Modular DA Layer', token: 'MODA', icon: '🧩', status: 'upcoming', category: 'Infrastructure', totalRaise: 6000000, tokenPrice: 0.20, fdv: 200000000, vestingCliff: 45, vestingPeriod: 365, startDate: '2026-02-05', minAlloc: 150, maxAlloc: 6000, registered: 18900, risk: 'high', description: 'Modular data availability solution' },

            // Completed IDOs (with ROI)
            { id: 'ido-pepe2', name: 'Pepe 2.0', token: 'PEPE2', icon: '🐸', status: 'completed', category: 'Memecoin', totalRaise: 2000000, tokenPrice: 0.00001, currentPrice: 0.00045, roi: 4400, vestingComplete: true, participants: 45000, risk: 'high', description: 'Community memecoin relaunch' },
            { id: 'ido-zkbridge', name: 'ZK Bridge', token: 'ZKB', icon: '🌉', status: 'completed', category: 'Infrastructure', totalRaise: 10000000, tokenPrice: 0.35, currentPrice: 0.82, roi: 134, vestingComplete: false, vestingRemaining: 45, participants: 28500, risk: 'medium', description: 'Zero-knowledge bridge protocol' },
            { id: 'ido-aitrader', name: 'AI Trader', token: 'AIT', icon: '📈', status: 'completed', category: 'AI', totalRaise: 5000000, tokenPrice: 0.10, currentPrice: 0.38, roi: 280, vestingComplete: false, vestingRemaining: 120, participants: 18200, risk: 'high', description: 'AI-powered trading bot platform' },

            // Fair Launches
            { id: 'fair-memegpt', name: 'MemeGPT Fair Launch', token: 'MGPT', icon: '🎭', type: 'fair-launch', status: 'active', category: 'AI+Meme', initialLiquidity: 500000, lockPeriod: 365, launchPrice: 0.0001, currentPrice: 0.00025, holders: 8500, risk: 'high', description: 'AI meme generator token' },
            { id: 'fair-basedogs', name: 'BaseDogs Fair Launch', token: 'BDOG', icon: '🐕', type: 'fair-launch', status: 'active', category: 'Memecoin', initialLiquidity: 250000, lockPeriod: 180, launchPrice: 0.00005, currentPrice: 0.00018, holders: 12800, risk: 'high', description: 'Base chain dog memecoin' },
            { id: 'fair-zkcat', name: 'zkCat Fair Launch', token: 'ZKCAT', icon: '🐱', type: 'fair-launch', status: 'upcoming', category: 'Memecoin', initialLiquidity: 300000, lockPeriod: 365, launchDate: '2026-01-20', risk: 'high', description: 'zkSync cat memecoin' },

            // Private Rounds
            { id: 'private-infratoken', name: 'InfraToken Seed', token: 'INFRA', icon: '🏗️', type: 'private', status: 'active', category: 'Infrastructure', raise: 15000000, valuation: 100000000, vestingCliff: 180, vestingPeriod: 1095, minInvest: 50000, accreditedOnly: true, risk: 'high', description: 'Infrastructure protocol seed round' },
            { id: 'private-aiagent', name: 'AI Agent Series A', token: 'AIAG', icon: '🤖', type: 'private', status: 'active', category: 'AI', raise: 25000000, valuation: 250000000, vestingCliff: 90, vestingPeriod: 730, minInvest: 100000, accreditedOnly: true, risk: 'medium-high', description: 'AI agent framework Series A' },

            // Staking for Allocation
            { id: 'stake-tier-bronze', name: 'Bronze Tier Staking', token: 'OBELISK', icon: '🥉', tier: 'bronze', requiredStake: 1000, allocationMultiplier: 1, benefits: ['Base allocation', 'Public pools'], apy: 5, tvl: 25000000, risk: 'low-medium', description: 'Stake 1000 OBELISK for Bronze tier' },
            { id: 'stake-tier-silver', name: 'Silver Tier Staking', token: 'OBELISK', icon: '🥈', tier: 'silver', requiredStake: 5000, allocationMultiplier: 2.5, benefits: ['2.5x allocation', 'Early access', 'Reduced fees'], apy: 8, tvl: 45000000, risk: 'low-medium', description: 'Stake 5000 OBELISK for Silver tier' },
            { id: 'stake-tier-gold', name: 'Gold Tier Staking', token: 'OBELISK', icon: '🥇', tier: 'gold', requiredStake: 25000, allocationMultiplier: 5, benefits: ['5x allocation', 'Guaranteed allocation', 'Private rounds access'], apy: 12, tvl: 85000000, risk: 'low-medium', description: 'Stake 25000 OBELISK for Gold tier' },
            { id: 'stake-tier-diamond', name: 'Diamond Tier Staking', token: 'OBELISK', icon: '💎', tier: 'diamond', requiredStake: 100000, allocationMultiplier: 10, benefits: ['10x allocation', 'Seed rounds access', 'Advisory roles', 'Revenue share'], apy: 18, tvl: 125000000, risk: 'low-medium', description: 'Stake 100000 OBELISK for Diamond tier' },

            // Launchpad Pools
            { id: 'lp-ido-fund', name: 'IDO Investment Fund', token: 'IDOF', icon: '🚀', type: 'fund', strategy: 'Diversified IDO participation', holdings: 25, avgROI: 185, successRate: 72, minInvest: 500, tvl: 35000000, risk: 'high', description: 'Managed fund investing in top IDOs' },
            { id: 'lp-seed-fund', name: 'Seed Round Fund', token: 'SEEDF', icon: '🌱', type: 'fund', strategy: 'Early stage investments', holdings: 15, avgROI: 520, successRate: 45, minInvest: 10000, tvl: 65000000, risk: 'high', description: 'VC-style seed round investments' },
            { id: 'lp-meme-fund', name: 'Memecoin Launch Fund', token: 'MEMEF', icon: '🎭', type: 'fund', strategy: 'Fair launch participation', holdings: 50, avgROI: 850, successRate: 25, minInvest: 100, tvl: 8000000, risk: 'high', description: 'High-risk memecoin launches' }
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
        // Use I18n system if available
        const riskKeys = {
            'very-low': 'risk_very_low',
            'low': 'risk_low',
            'low-medium': 'risk_low_medium',
            'medium': 'risk_medium',
            'medium-high': 'risk_medium_high',
            'high': 'risk_high',
            'very-high': 'risk_very_high'
        };
        const key = riskKeys[risk];
        if (key && typeof I18n !== 'undefined' && I18n.t) {
            const translated = I18n.t(key);
            if (translated !== key) return translated;
        }
        // Fallback labels
        const labels = {
            en: {
                'very-low': 'Very Low',
                'low': 'Low',
                'low-medium': 'Low-Medium',
                'medium': 'Medium',
                'medium-high': 'Medium-High',
                'high': 'High',
                'very-high': 'Very High'
            },
            fr: {
                'very-low': 'Très Faible',
                'low': 'Faible',
                'low-medium': 'Faible-Moyen',
                'medium': 'Moyen',
                'medium-high': 'Moyen-Élevé',
                'high': 'Élevé',
                'very-high': 'Très Élevé'
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
