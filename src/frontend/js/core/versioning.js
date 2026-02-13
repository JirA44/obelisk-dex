// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - VERSIONING SYSTEM
// Version tracking, changelog, and documentation
// ═══════════════════════════════════════════════════════════════════════════════

const VersioningSystem = {
    // Current version
    current: {
        major: 2,
        minor: 30,
        patch: 0,
        build: 'stable',
        date: '2026-01-27',
        codename: 'Obelisk V2.1'
    },

    // Version history (most recent first)
    history: [
        {
            version: '2.30.0',
            date: '2026-01-27',
            codename: 'Obelisk V2.1',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Phase 1: Debug test panel with transaction tester, yield verification, automated product tester (13 categories), real investment flow tracer' },
                { type: 'feature', description: 'Phase 2: Portfolio Analytics Dashboard - Canvas-based pie charts, PnL over time, returns by category, risk breakdown, top performers, daily snapshots' },
                { type: 'feature', description: 'Phase 3: Multi-Chain Support - ChainManager for Arbitrum/Optimism/Base/Ethereum/Polygon, Aave V3 multi-chain, Velodrome + Aerodrome protocols' },
                { type: 'feature', description: 'Phase 4: Cross-Chain Swaps - LI.FI integration, quote/execute/status tracking, backend proxy router' },
                { type: 'feature', description: 'Phase 5: Fiat On-Ramp - MoonPay/Transak SDK embed, webhook handlers, simulation fallback' },
                { type: 'feature', description: 'Phase 6: OBL Native Token - Staking (30/90/180/365 days, 12-36% APY), fee discounts (10-75%), token dashboard, backend tracker' },
                { type: 'feature', description: 'Phase 7: Governance - Proposal creation, OBL-weighted voting, backend storage, governance UI' },
                { type: 'improvement', description: 'New backend routes: /api/cross-chain, /api/obl, /api/governance' },
                { type: 'improvement', description: '12 new files, 7 modified files across frontend and backend' }
            ]
        },
        {
            version: '2.29.0',
            date: '2026-01-14',
            codename: 'Cosmic Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 30 new staking products: Cosmos (ATOM, OSMO, INJ, SEI, KAVA), Polkadot (DOT, KSM, ASTR, GLMR, ACA), NFT Infra (BLUR, LOOKS, X2Y2, SUDO, RARI), Gaming (GALA, IMX, RON, BEAM, PIXEL), Infrastructure (GRT, FIL, AR, STORJ, POKT), Insurance (NXM, INSR, EASE, UNO, COVER)' },
                { type: 'feature', description: 'Added 28 new liquidity pools: Cosmos (ATOM, OSMO, INJ, SEI, KAVA), Polkadot (DOT, KSM, ASTR, GLMR, ACA), NFT (BLUR, LOOKS, X2Y2, SUDO, RARI), Gaming (GALA, IMX, RON, BEAM, PIXEL), Infra (GRT, FIL, AR, STORJ, POKT), Insurance (NXM, INSR, UNO)' },
                { type: 'improvement', description: 'Total products now 3115+' },
                { type: 'improvement', description: 'Total staking now 750+' },
                { type: 'improvement', description: 'Total pools now 780+' }
            ]
        },
        {
            version: '2.28.0',
            date: '2026-01-14',
            codename: 'Hyper Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 30 new staking products: Perp DEX (HYPE, VRTX, AEVO, DRIFT, KWENTA), Yield (PENDLE, AURA, BTRFLY, JONES, DPX), LRT (ETHFI, PUFFER, REZ, KELP, SWELL), Real Yield (GMX, GNS, GRAIL, VELA, HMX), Intent (COW, ACX, HOP, SOCKET, LIFI), Launchpad (SFUND, DAO, POLS, PAID, PRIME)' },
                { type: 'feature', description: 'Added 29 new liquidity pools: Perp DEX (HYPE, VRTX, AEVO, DRIFT, KWENTA), Yield (PENDLE, AURA, BTRFLY, JONES, DPX), LRT (ETHFI, PUFFER, REZ, KELP, SWELL), Real Yield (GMX, GNS, GRAIL, VELA, HMX), Intent (COW, ACX, HOP, SOCKET), Launchpad (SFUND, DAO, POLS, PRIME)' },
                { type: 'improvement', description: 'Total products now 3057+' },
                { type: 'improvement', description: 'Total staking now 720+' },
                { type: 'improvement', description: 'Total pools now 752+' }
            ]
        },
        {
            version: '2.27.0',
            date: '2026-01-13',
            codename: 'Ultra Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 30 new staking products: AI Agents (AI16Z, VIRTUAL, AIXBT, GRIFFAIN, ZEREBRO), Memecoins (PEPE, WIF, BONK, FLOKI, SHIB), DEX Tokens (JOE, CAKE, SUSHI, VELO, AERO), L2 Native (STRK, BLAST, MODE, SCROLL, ZK), Privacy (XMR, ZEC, SCRT, ROSE, NYM), Payments (XLM, XRP, LTC, BCH, CELO)' },
                { type: 'feature', description: 'Added 28 new liquidity pools: AI agents (AI16Z, VIRTUAL, AIXBT, GRIFFAIN, ZEREBRO), Memecoins (PEPE, WIF, BONK, FLOKI, SHIB), DEX (JOE, CAKE, SUSHI, VELO, AERO), L2 (STRK, BLAST, MODE, SCROLL, ZK), Privacy (SCRT, ROSE, NYM), Payments (XLM, XRP, CELO)' },
                { type: 'improvement', description: 'Total products now 2998+' },
                { type: 'improvement', description: 'Total staking now 690+' },
                { type: 'improvement', description: 'Total pools now 723+' }
            ]
        },
        {
            version: '2.26.0',
            date: '2026-01-13',
            codename: 'Mega Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 30 new staking products: DePIN (HNT, MOBILE, THETA, DIMO, IOTX), Social (DEGEN, LENS, GAL, MASK, AUDIO), Gaming L2 (BEAM, XAI, MYRIA, PRIME, MAGIC), RWA (ONDO, MPL, TRU, CFG, GFI), Modular (MANTA, ALT, DYM, SAGA, FUEL), Messaging (AXL, ZETA, W, ZRO, LINK CCIP)' },
                { type: 'feature', description: 'Added 24 new liquidity pools matching new staking tokens' },
                { type: 'improvement', description: 'Total products now 2940+' },
                { type: 'improvement', description: 'Total staking now 660+' },
                { type: 'improvement', description: 'Total pools now 695+' }
            ]
        },
        {
            version: '2.25.2',
            date: '2026-01-13',
            codename: 'Kilo UX',
            type: 'fix',
            changes: [
                { type: 'critical', description: 'Fixed syntax error in investment-products.js (missing array bracket for pools)' },
                { type: 'verify', description: 'Full syntax verification of all 109 JS files - all pass' }
            ]
        },
        {
            version: '2.25.1',
            date: '2026-01-13',
            codename: 'Kilo UX',
            type: 'fix',
            changes: [
                { type: 'fix', description: 'Fixed all hardcoded French text in 5 files (ui-banking, investments-ui, portfolio-positions-list, simulated-portfolio, fiat-onramp)' },
                { type: 'improvement', description: 'Added 30+ new translation keys for complete i18n coverage (EN/FR/ES/DE)' },
                { type: 'fix', description: 'All UI now properly uses I18n translation system' }
            ]
        },
        {
            version: '2.25.0',
            date: '2026-01-13',
            codename: 'Kilo UX',
            type: 'feature',
            changes: [
                { type: 'feature', description: 'Added product sorting: Sort by APY, TVL, Min Investment, Risk' },
                { type: 'feature', description: 'Sort direction toggle (ascending/descending) with visual indicators' },
                { type: 'improvement', description: 'Fixed language mixing: All UI text now properly translated (EN/FR/ES/DE)' },
                { type: 'improvement', description: 'Added 20+ new translation keys for consistent localization' },
                { type: 'ui', description: 'New sort controls bar with responsive design' }
            ]
        },
        {
            version: '2.24.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (TAO, RNDR, FET, OCEAN, AGIX AI/ML + ZK, STRK, POL, LINEA, SCROLL zkEVM + ARB, OP, METIS, BOBA, MNT rollups + MKR, COMP, UNI, AAVE, CRV DeFi blue chips + LQTY, FXS, SPELL, PRISMA, crvUSD stablecoins + PUFFER, KELP, REZ, SWELL, ETHFI restaking + SUI, APT, NEAR, ALGO, HBAR L1s)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (AI pools TAO, RNDR, FET, OCEAN, AGIX + ZK pools ZK, STRK, POL, LINEA, SCROLL + rollup pools ARB, OP, METIS, BOBA, MNT + DeFi pools MKR, COMP, UNI, AAVE, CRV + stablecoin pools LQTY, FXS, SPELL, PRISMA, crvUSD + restaking pools PUFFER, KELP, REZ, SWELL, ETHFI + L1 pools SUI, APT, NEAR, ALGO, HBAR)' },
                { type: 'improvement', description: 'Total products now 2835+' },
                { type: 'improvement', description: 'Total staking now 625+' },
                { type: 'improvement', description: 'Total pools now 670+' }
            ]
        },        {
            version: '2.23.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (RUNE, BADGER, tBTC, sBTC, WBTC Bitcoin DeFi + ATOM, OSMO, INJ, SEI, KAVA Cosmos + DOT, KSM, ASTR, GLMR, PARA Polkadot + IMX, GALA, FLOW, APE, RON NFT gaming + FIL, AR, STORJ, BLZ, AKT storage + ENS, WLD, ID, GAL, CYBER identity + RBN, JONES, GLP, sGLP, plvGLP structured)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (BTC DeFi pools RUNE, BADGER, tBTC, sBTC, WBTC + Cosmos pools ATOM, OSMO, INJ, SEI, KAVA + Polkadot pools DOT, KSM, ASTR, GLMR, PARA + NFT gaming pools IMX, GALA, FLOW, APE, RON + storage pools FIL, AR, STORJ, BLZ, AKT + identity pools ENS, WLD, ID, GAL, CYBER + structured pools RBN, JONES, GLP, sGLP, plvGLP)' },
                { type: 'improvement', description: 'Total products now 2765+' },
                { type: 'improvement', description: 'Total staking now 590+' },
                { type: 'improvement', description: 'Total pools now 635+' }
            ]
        },        {
            version: '2.22.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (TIA, EIGEN, AVAIL, MANTA, NIL data availability + SAFE, BICO, STACK, PIM, ZERO account abstraction + LDO, RPL, SWISE, SD, ANKR liquid staking + ZRO, W, AXL, ZETA, CCIP interop + 1INCH, PSP, ODOS, OOE, KNC aggregators + YFI, FARM, BIFI, PICKLE, IDLE yield + SNX, CAP, LVL, MUX, HMX perps)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (DA pools TIA, EIGEN, AVAIL, MANTA, NIL + AA pools SAFE, BICO, STACK, PIM, ZERO + LSD pools LDO, RPL, SWISE, SD, ANKR + interop pools ZRO, W, AXL, ZETA, LINK + aggregator pools 1INCH, PSP, ODOS, OOE, KNC + yield pools YFI, FARM, BIFI, PICKLE, IDLE + perp pools SNX, CAP, LVL, MUX, HMX)' },
                { type: 'improvement', description: 'Total products now 2695+' },
                { type: 'improvement', description: 'Total staking now 555+' },
                { type: 'improvement', description: 'Total pools now 600+' }
            ]
        },        {
            version: '2.21.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (ACX, HOP, STG, SYN, CELR bridges + APX, AEVO, KWENTA, PERP, DYDX perp DEX L2 + PRIME, SFUND, DAO, POLS, PAID launchpads + ROSE, SCRT, NYM, IRON, AZERO privacy + BAND, API3, UMA, PYTH, DIA oracles + wNXM, INSR, USF, EASE, ARMOR insurance + EDEN, ROOK, COW, FOLD, FLB MEV)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (bridge pools ACX, HOP, STG, SYN, CELR + perp DEX pools APX, AEVO, KWENTA, PERP, DYDX + launchpad pools PRIME, SFUND, DAO, POLS, PAID + privacy pools ROSE, SCRT, NYM, IRON, AZERO + oracle pools BAND, API3, UMA, PYTH, DIA + insurance pools wNXM, INSR, USF, EASE, ARMOR + MEV pools EDEN, ROOK, COW, FOLD, FLB)' },
                { type: 'improvement', description: 'Total products now 2625+' },
                { type: 'improvement', description: 'Total staking now 520+' },
                { type: 'improvement', description: 'Total pools now 565+' }
            ]
        },        {
            version: '2.20.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (GMX, GNS, VELO, THE, GRAIL real yield DEX + UNIBOT, BANANA, MAESTRO Telegram bots + TON, NOT, DOGS, CATI, HMSTR TON ecosystem + JOE, CAKE, SUSHI, QUICK, KNC DEX governance + ONDO, RSR, EUL RWA + SPELL, ALCX, FXS, CRV, CVX DeFi infra + LYRA, PREMIA, DPX, RDPX options)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (real yield DEX pools GMX, GNS, VELO, THE, GRAIL + Telegram bot pools UNIBOT, BANANA, MAESTRO + TON ecosystem pools TON, NOT, DOGS, CATI, HMSTR + DEX governance pools JOE, CAKE, SUSHI, QUICK, KNC + RWA pools ONDO, RSR, EUL + DeFi infra pools SPELL, ALCX, FXS, CRV, CVX + options pools LYRA, PREMIA, DPX, RDPX)' },
                { type: 'improvement', description: 'Total products now 2555+' },
                { type: 'improvement', description: 'Total staking now 485+' },
                { type: 'improvement', description: 'Total pools now 530+' }
            ]
        },
        {
            version: '2.19.0',
            date: '2026-01-13',
            codename: 'Peta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (GMT, SWEAT, AXS, MANA, SAND consumer apps + BLUR, SUDO, LOOKS, MAGIC NFT infra + AUDIO, XCAD, VRA entertainment + CHZ, SANTOS, BAR, PSG, JUV sports + BEAM, ILV, GODS, YGG, MC gaming + AERO, EXTRA, BRETT, DEGEN, TOSHI Base + POPCAT, MEW, WEN, BOME, SLERF Solana memes)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (consumer app pools GMT, SWEAT, AXS, MANA, SAND + NFT pools BLUR, SUDO, LOOKS, MAGIC + entertainment pools AUDIO, XCAD, VRA + sports pools CHZ, SANTOS, BAR, PSG, JUV + gaming pools BEAM, ILV, GODS, YGG, MC + Base pools AERO, EXTRA, BRETT, DEGEN, TOSHI + Solana meme pools POPCAT, MEW, WEN, BOME, SLERF)' },
                { type: 'feature', description: 'Added 26 new vaults (Metaverse Land, Move-to-Earn, Axie Ecosystem + NFT Marketplace, Blur Bidding, Treasure DAO + Music NFT, Creator Economy + Fan Token, Football Clubs + AAA Gaming, Guild, Illuvium, BEAM + Base DeFi, Aerodrome, Base Memes, Farcaster + Sol Cat Memes, Sol Degen, BOME + Multi-Chain, Consumer Apps)' },
                { type: 'feature', description: 'Added 18 new combos (Metaverse, Move-to-Earn, Axie + NFT Markets, Treasure + Music Creator + Sports Fan, Football Clubs + AAA Gaming, Guild + Base DeFi, Base Memes, Farcaster + Solana Cats, Sol Degen + Multi-Chain Memes, Consumer Apps)' },
                { type: 'improvement', description: 'Total products now 2485+' },
                { type: 'improvement', description: 'Total staking now 450+' },
                { type: 'improvement', description: 'Total pools now 495+' },
                { type: 'improvement', description: 'Total vaults now 265+' },
                { type: 'improvement', description: 'Total combos now 215+' }
            ]
        },
        {
            version: '2.18.0',
            date: '2026-01-13',
            codename: 'Tera Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (ezETH, rsETH, weETH, pufETH, swETH liquid restaking + HYPE, VRTX, APEX, RBX, BLUE perp DEX + LINEA, SCROLL, TAIKO, MANTA, MODE ZK L2s + PYTH V2, W, TNSR, KMNO, PRCL Solana + DYM, SAGA, ALT, AVAIL, OMNI modular + PARTI, SOCKET, LIFI, JUMP intent + VIRTUAL, AI16Z, GRIFF, ZEREBRO, ARC AI agents)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (LRT pools ezETH, rsETH, weETH, pufETH, swETH + perp DEX pools HYPE, VRTX, APEX, RBX, BLUE + ZK L2 pools LINEA, SCROLL, TAIKO, MANTA, MODE + Solana pools PYTH, W, TNSR, KMNO, PRCL + modular pools DYM, SAGA, ALT, AVAIL, OMNI + intent pools PARTI, SOCKET, LIFI, JUMP + AI agent pools VIRTUAL, AI16Z, GRIFF, ZEREBRO, ARC)' },
                { type: 'feature', description: 'Added 35 new lending markets (LRT lending ezETH, rsETH, weETH, pufETH, swETH + perp DEX lending HYPE, VRTX, APEX, BLUE + ZK L2 lending LINEA, SCROLL, TAIKO, MANTA, MODE + Solana lending PYTH, W, TNSR, KMNO + modular lending DYM, SAGA, ALT, AVAIL, OMNI + intent lending PARTI, SOCKET, LIFI + AI lending VIRTUAL, AI16Z, GRIFF, ZEREBRO, ARC)' },
                { type: 'feature', description: 'Added 40 new savings products (LRT savings ezETH, rsETH, weETH, pufETH, swETH + perp DEX savings HYPE, VRTX, APEX + ZK L2 savings LINEA, SCROLL, TAIKO, MANTA, MODE + Solana savings PYTH, W, TNSR, KMNO + modular savings DYM, SAGA, ALT, AVAIL, OMNI + AI savings VIRTUAL, AI16Z, GRIFF, ZEREBRO, ARC + locked 90d-365d + basket savings LRT, ZK L2, Perp DEX, Modular, AI Agents)' },
                { type: 'improvement', description: 'Total products now 2370+' },
                { type: 'improvement', description: 'Total staking now 415+' },
                { type: 'improvement', description: 'Total pools now 460+' },
                { type: 'improvement', description: 'Total lending now 240+' },
                { type: 'improvement', description: 'Total savings now 185+' }
            ]
        },
        {
            version: '2.17.0',
            date: '2026-01-13',
            codename: 'Giga Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (DIMO, HONEY, RENDER, GRASS, GEOD DePIN + MPL, CFG, GFI, POLYX, RIO RWA + FRIEND, LENS, DESO, RLY, GAL social + POLY, GNO, REP, UMA, TRB prediction + COW, FLB, BLK, EDEN MEV + DYDX, STRD, NTRN, AKT, KUJI, MARS Cosmos + STX, RUNES, ORDI, SATS, ALEX Bitcoin L2)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (DePIN pools DIMO, HONEY, RENDER, GRASS, GEOD + RWA pools MPL, CFG, GFI, POLYX, RIO + social pools FRIEND, LENS, DESO, RLY, GAL + prediction pools GNO, REP, UMA, TRB + MEV pools COW, EDEN + Cosmos pools DYDX, STRD, NTRN, AKT, KUJI, MARS + Bitcoin L2 pools STX, ORDI, SATS, ALEX, RUNES)' },
                { type: 'feature', description: 'Added 35 new vaults (DePIN Infrastructure, Render GPU, Grass Bandwidth, GEODNET Location, DIMO Vehicle + RWA Credit, Maple Lending, Centrifuge RWA, Goldfinch Credit + SocialFi Aggregator, Lens Social, Galxe Credential + Prediction Markets, Gnosis Chain, Oracle Aggregator + Cosmos DeFi Hub, dYdX Perp, Stride LST, Neutron DeFi, Akash Compute, Kujira FINv, Mars Lending + Bitcoin L2, STX PoX, Ordinals, ALEX Bitcoin DeFi, Runes + MEV Protection, CoW Solver)' },
                { type: 'feature', description: 'Added 20 new combos (DePIN Network, GPU Compute, Bandwidth Mining + RWA Credit, Institutional Credit + SocialFi, Creator Yield + Prediction Oracle, Oracle Reporter + Cosmos Hub, dYdX Perp, Neutron DeFi, Akash Cloud, Kujira Whale + Bitcoin L2, Ordinals, ALEX DeFi + MEV Protected)' },
                { type: 'feature', description: 'Added 25 new index funds (DePIN Infrastructure, GPU Compute, Bandwidth Network, Vehicle Data + RWA Credit, Institutional Credit, Security Tokens + SocialFi Protocols, Creator Economy, Credential Networks + Prediction Markets, Oracle Networks, Data Reporting + Cosmos DeFi, Cosmos Infrastructure, dYdX Ecosystem, Akash Cloud + Bitcoin DeFi, Ordinals BRC-20, Stacks Ecosystem + MEV Protection, Interoperability, Storage Compute + Privacy Tokens + Exchange Tokens)' },
                { type: 'improvement', description: 'Total products now 2225+' },
                { type: 'improvement', description: 'Total staking now 380+' },
                { type: 'improvement', description: 'Total pools now 425+' },
                { type: 'improvement', description: 'Total vaults now 230+' },
                { type: 'improvement', description: 'Total combos now 195+' },
                { type: 'improvement', description: 'Total index funds now 240+' }
            ]
        },
        {
            version: '2.16.0',
            date: '2026-01-13',
            codename: 'Bronto Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (ZEC, DASH, SCRT, ROSE, KEEP privacy + RUNE, AXL, SYN, STG, W, ACROSS cross-chain + FIL, AR, STORJ, SC, THETA, TFUEL storage + APT, SUI, SEI, CETUS, NAVI Move L1 + MORPHO, ETHFI, PUFFER, REZ, KELP, BLAST restaking + BNB, OKB, GT, MX, HT exchange)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (ZEC, DASH, SCRT, ROSE, KEEP privacy pools + RUNE, AXL, SYN, STG, W, ACROSS cross-chain + FIL, AR, STORJ, SC, THETA, TFUEL storage + APT, SUI, SEI, CETUS, NAVI Move L1 + MORPHO, ETHFI, PUFFER, REZ, KELP, BLAST restaking + BNB, OKB, GT, MX, HT exchange)' },
                { type: 'feature', description: 'Added 33 new savings products (ZEC, DASH, SCRT, ROSE privacy + RUNE, AXL, STG, W cross-chain + FIL, AR, THETA storage + APT, SUI, SEI Move L1 + MORPHO, ETHFI, PUFFER, BLAST restaking + BNB, OKB exchange + locked 90d-365d + basket savings Privacy, Bridge, Storage, Move L1, Restaking, CEX)' },
                { type: 'feature', description: 'Added 31 new lending markets (ZEC, DASH, SCRT, ROSE privacy + RUNE, AXL, STG, W cross-chain + FIL, AR, THETA storage + APT, SUI, SEI, CETUS Move L1 + MORPHO, ETHFI, PUFFER, BLAST restaking + BNB, OKB, GT exchange + TAO, FET, AGIX, WLD AI + GALA, IMX, RON, PRIME gaming)' },
                { type: 'improvement', description: 'Total products now 2075+' },
                { type: 'improvement', description: 'Total staking now 345+' },
                { type: 'improvement', description: 'Total pools now 390+' },
                { type: 'improvement', description: 'Total savings now 145+' },
                { type: 'improvement', description: 'Total lending now 205+' }
            ]
        },
        {
            version: '2.15.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (TAO, FET, AGIX, OCEAN, NOS, ATH, GPU, WLD AI tokens + GALA, IMX, RON, BEAM, PRIME, XAI, PIXEL, PORTAL gaming + CRV, CVX, BAL, AURA, FXS, YFI, COMP, SNX, RPL DeFi governance + QNT, API3, FLR, SGB, HNT, MOBILE, IOTX infrastructure)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (AI pools TAO, FET, AGIX, OCEAN, NOS, ATH, GPU, WLD + gaming pools GALA, IMX, RON, BEAM, PRIME, XAI, PIXEL, PORTAL + DeFi governance pools CRV, CVX, BAL, AURA, FXS, YFI, COMP, SNX, RPL + infrastructure pools QNT, API3, FLR, SGB, HNT, MOBILE, IOTX)' },
                { type: 'feature', description: 'Added 35 new vaults (AI vaults TAO, ASI Alliance, GPU Compute, Worldcoin, Akash + gaming vaults IMX, Ronin, GALA, PRIME, BEAM, PIXEL + DeFi governance vaults Curve Convex, Balancer Aura, Frax Convex, Yearn veYFI, SNX Optimism, Compound III + infrastructure vaults Helium, 5G Mobile, IoTeX, Flare + LST vaults stETH LRT, rETH Rocket, JitoSOL, mSOL + emerging vaults EigenLayer, Celestia, Starknet, zkSync, TON, Ondo, Pyth)' },
                { type: 'feature', description: 'Added 30 new combos (AI Supercluster, GPU Compute, Worldcoin + gaming Gaming Metaverse, Prime Gaming, Ronin Axie + DeFi governance Curve Wars, Balancer Aura, Synthetix Perps, Yearn + infrastructure Helium DePIN, IoTeX MachineFi, Flare Oracle + LST ETH LSD, SOL LSD + emerging Restaking, Modular, ZK Tech, TON Telegram, RWA + oracles Oracle Network, Quant Enterprise + cross-chain Solana DeFi, Arbitrum DeFi, OP Superchain, Base Chain)' },
                { type: 'improvement', description: 'Total products now 1940+' },
                { type: 'improvement', description: 'Total staking now 310+' },
                { type: 'improvement', description: 'Total pools now 355+' },
                { type: 'improvement', description: 'Total vaults now 195+' },
                { type: 'improvement', description: 'Total combos now 175+' }
            ]
        },
        {
            version: '2.14.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (FLOKI, BABYDOGE, BONK, WIF, PEPE, SHIB, DOGE, MOG, BRETT, POPCAT meme coins + PENDLE, VELO, AERO, GRAIL, THALES, LYRA, KWENTA, VELA, MUX, HMX, LVL, VRTX, DRIFT perp DEX + JUP, RAY, ORCA, MNDE, JTO, TNSR, KMNO, PRCL, CLOUD, ZEX, IO Solana DeFi)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (meme coin pools FLOKI, BABYDOGE, BONK, WIF, PEPE, SHIB, DOGE, MOG, BRETT, POPCAT + perp DEX pools + Solana DeFi pools JUP, RAY, ORCA, MNDE, JTO, TNSR, KMNO, PRCL, CLOUD, ZEX, IO)' },
                { type: 'feature', description: 'Added 35 new index funds (Dog Memes, Cat Memes, Frog Memes, Base Memes, Solana Memes + Perp DEX Leaders, Yield Trading, DeFi Options, Arbitrum Perps, Optimism DeFi + Solana DeFi Leaders, Solana Yield, New Projects, NFT DeFi, Gaming + Multi-Chain DeFi, Bridge, DEX Aggregators, Oracle Networks, Global LST + Restaking, RWA, AI Compute, SocialFi, Modular, ZK Tech, Bitcoin L2, Telegram, Gaming Infra, Data Availability)' },
                { type: 'feature', description: 'Added 30 new lending markets (FLOKI, BONK, WIF, PEPE, SHIB, DOGE meme lending + PENDLE, VELO, AERO, GRAIL, THALES, LYRA, KWENTA, DRIFT perp DEX + JUP, RAY, ORCA, MNDE, JTO, TNSR, IO Solana + EIGEN, ONDO, TIA, STRK, ZK, TON, STX, RNDR, AKT, PYTH emerging)' },
                { type: 'improvement', description: 'Total products now 1805+' },
                { type: 'improvement', description: 'Total staking now 275+' },
                { type: 'improvement', description: 'Total pools now 320+' },
                { type: 'improvement', description: 'Total index funds now 190+' },
                { type: 'improvement', description: 'Total lending now 175+' }
            ]
        },
        {
            version: '2.13.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (BAKE, ALPHA, REEF, DODO, HARD, XVS, ALPACA, BANANA, BURGER, EPS, MDX, BIFI, BUNNY, AUTO, BELT, NRV, SXP V2, RAMP, LIT, SFP, BTCST, BSCPAD, C98, TWT, MATH, POLS, FRONT, MIR, BAR, PSG, JUV, ATM, CITY, ACM)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (BAKE, ALPHA, REEF, DODO, XVS, ALPACA, BANANA, BURGER, EPS, MDX, BIFI, AUTO, C98, TWT, SFP, POLS, FRONT, LIT, BAR, PSG, JUV, CITY, ACM, CHZ, SANTOS, LAZIO, PORTO, OG, NAVI, ALPINE, ASR, INTER, GAL)' },
                { type: 'feature', description: 'Added 35 new vaults (PancakeSwap CAKE, Alpaca BUSD, Venus VAI, Biswap BSW, Belt 4Belt, Ellipsis 3EPS, MDEX, Nerve 3NRV, Wault WEX, ACryptoS, AutoFarm, Growing, Swamp, Goose, Kebab, TenFi, Value, Dopple, Space, JetFuel, Polaris, PinkSale, DxSale, Unicrypt, Team Finance, Mudra, BabySwap, KnightSwap, Koala, Panda, HyperJump, CafeSwap, SushiSwap BNB, JulSwap)' },
                { type: 'feature', description: 'Added 30 new combos (BSC DeFi, Alpaca Leverage, Venus Lending, ApeSwap, Beefy BSC, Fan Token, Esports, Wallet Tokens, Launchpad, AutoFarm, MDEX, Biswap, Ellipsis, BabySwap, DODO, Reef, Alpha, Value DeFi, Locker, Nerve, Belt, Wault, Swamp, Mirror, Frontier, Litentry, RAMP, SafePal)' },
                { type: 'improvement', description: 'Total products now 1670+' },
                { type: 'improvement', description: 'Total staking now 240+' },
                { type: 'improvement', description: 'Total pools now 285+' },
                { type: 'improvement', description: 'Total vaults now 160+' },
                { type: 'improvement', description: 'Total combos now 145+' }
            ]
        },
        {
            version: '2.12.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new staking products (FTM, EOS, XLM, TRX, WAVES, ONT, ICX, LSK, XNO, IOST, WAXP, FLUX, SYS, KMD, DCR, DGB, RVN, STX, ORDI, RATS, SATS, TURBO, PEOPLE, JASMY, LOOM, ANKR, SXP, CHR, PUNDIX, SPELL, JOE, QUICK, CREAM)' },
                { type: 'feature', description: 'Added 35 new liquidity pools (FTM, EOS, XLM, TRX, WAVES, ONT, ICX, LSK, XNO, IOST, WAXP, FLUX, SYS, KMD, DCR, DGB, RVN, STX, ORDI, RATS, SATS, TURBO, PEOPLE, JASMY, LOOM, ANKR, SXP, CHR, PUNDIX, SPELL, JOE, QUICK, CREAM, MBOX)' },
                { type: 'feature', description: 'Added 35 new lending markets (FTM, EOS, XLM, TRX, WAVES, ONT, ICX, LSK, XNO, IOST, WAXP, FLUX, SYS, KMD, DCR, DGB, RVN, STX, ORDI, RATS, SATS, TURBO, PEOPLE, JASMY, LOOM, ANKR, SXP, CHR, PUNDIX, SPELL, JOE, QUICK, CREAM, MBOX)' },
                { type: 'feature', description: 'Added 30 new savings products (FTM, EOS, XLM, TRX, WAVES, ONT, ICX, LSK, XNO, IOST, WAXP, FLUX, SYS, KMD, DCR, STX, ORDI, JASMY, ANKR, SPELL, JOE, QUICK, locked variants, basket products)' },
                { type: 'improvement', description: 'Total products now 1535+' },
                { type: 'improvement', description: 'Total staking now 205+' },
                { type: 'improvement', description: 'Total pools now 250+' },
                { type: 'improvement', description: 'Total lending now 145+' },
                { type: 'improvement', description: 'Total savings now 95+' }
            ]
        },
        {
            version: '2.11.0',
            date: '2026-01-13',
            codename: 'Quetta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 40 new staking products (HBAR, ALGO, XTZ, FLOW, EGLD, KDA, VET, ICP, NEO, QTUM, ZIL, ROSE, CELO, ONE, KAVA, MINA, etc.)' },
                { type: 'feature', description: 'Added 40 new liquidity pools (HBAR, ALGO, XTZ, FLOW, EGLD, KDA, VET, ICP, NEO, ZIL, ROSE, CELO, KAVA, MINA, GLMR, MOVR, ASTR, etc.)' },
                { type: 'feature', description: 'Added 30 new vaults (DefiEdge, ICHI, Tokemak, Angle, Gyroscope, Inverse, Yield Yak, Beefy, Harvest, Pickle, Vesper, Badger, Balancer bb, Aura, mStable, Euler, Gearbox, Silo, Fluid, Spark, etc.)' },
                { type: 'feature', description: 'Added 30 new index funds (Polkadot, Hedera, Algorand, VeChain, ICP, MultiversX, Tezos, Zilliqa, Kava, Celo, Mina, Casper, DePIN, Web3 Social, Music, Account Abstraction, Prediction Markets, DAO, Cross-Chain DEX, etc.)' },
                { type: 'improvement', description: 'Total products now 1400+' },
                { type: 'improvement', description: 'Total staking now 170+' },
                { type: 'improvement', description: 'Total pools now 215+' },
                { type: 'improvement', description: 'Total vaults now 125+' },
                { type: 'improvement', description: 'Total index funds now 155+' }
            ]
        },
        {
            version: '2.10.0',
            date: '2026-01-13',
            codename: 'Peta Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 42 new vaults (Sommelier, Arrakis, Gamma, Bunni, Ribbon, Opyn, Dopex, Jones, Rage, Umami, LRT vaults, Solv BTC, Overnight, StakeDAO, etc.)' },
                { type: 'feature', description: 'Added 35 new lending markets (ZRO, ARKM, CYBER, RDNT, MAGIC, LDO, cbETH, swETH, gaming tokens, perp DEX tokens, L2 tokens, etc.)' },
                { type: 'feature', description: 'Added 35 new combos (Sommelier, Options, Delta Neutral, LRT, Jones DAO, Dopex, Gaming, zkSync, Manta, Radiant, LayerZero, etc.)' },
                { type: 'improvement', description: 'Total products now 1260+' },
                { type: 'improvement', description: 'Total vaults now 95+' },
                { type: 'improvement', description: 'Total lending now 110+' },
                { type: 'improvement', description: 'Total combos now 115+' }
            ]
        },
        {
            version: '2.9.1',
            date: '2026-01-13',
            codename: 'Tera Expansion',
            type: 'minor',
            changes: [
                { type: 'feature', description: 'Added 47 new index funds (LayerZero Bridges, ETH Staking, DeFi Derivatives, Privacy Tech, Social Tokens, Oracle, Data Storage, Compute, Cosmos Hub, Restaking, etc.)' },
                { type: 'improvement', description: 'Total products now 1150+' },
                { type: 'improvement', description: 'Total index funds now 125+' }
            ]
        },
        {
            version: '2.9.0',
            date: '2026-01-13',
            codename: 'Tera Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 43 new staking products (ZRO, ARKM, CYBER, ID, RDNT, MAGIC, LDO, RPL, gaming tokens, perp DEX tokens, NFT tokens, RWA tokens)' },
                { type: 'feature', description: 'Added 41 new liquidity pools (ZRO, ARKM, CYBER, ID, RDNT, MAGIC, gaming pools, AI pools, infrastructure pools)' },
                { type: 'improvement', description: 'Total products now 1100+' },
                { type: 'improvement', description: 'Total staking now 130+' },
                { type: 'improvement', description: 'Total pools now 135+' }
            ]
        },
        {
            version: '2.8.0',
            date: '2026-01-13',
            codename: 'Giga Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 35 new lending markets (MODE, BLAST, SCROLL, TAIKO, ZETA, REZ, PUFFER, HNT, AKT, RUNE, KUJI, NTRN, memes, gaming, etc.)' },
                { type: 'feature', description: 'Added 35 new savings products (MODE, BLAST, SCROLL, TAIKO, ZETA, HNT, AKT, RUNE, stablecoins, locked periods, etc.)' },
                { type: 'feature', description: 'Added 31 new combos (Blast, Scroll, Mode, Linea, Helium, THORChain, Kujira, AI, Gaming, DePIN, RWA, etc.)' },
                { type: 'improvement', description: 'Total products now 1000+' },
                { type: 'improvement', description: 'Total lending markets now 75+' },
                { type: 'improvement', description: 'Total savings now 70+' },
                { type: 'improvement', description: 'Total combos now 80+' }
            ]
        },
        {
            version: '2.7.2',
            date: '2026-01-13',
            codename: 'Ultra Expansion',
            type: 'minor',
            changes: [
                { type: 'feature', description: 'Added 20 new staking products (STRK, ZK, MANTA, DYM, W, PYTH, JUP, EIGEN, ENA, GMX, VELO, AERO, etc.)' },
                { type: 'feature', description: 'Added 20 new liquidity pools (STRK, ZK, MANTA, DYM, JUP, EIGEN, ENA, PENDLE, GMX, VELO, AERO, etc.)' },
                { type: 'feature', description: 'Added 21 new index funds (ZK Chains, New L2s, Airdrop, Base, Perp DEX, ve-Token, LRT, Meme indices, etc.)' },
                { type: 'improvement', description: 'Total products now 500+' },
                { type: 'improvement', description: 'Total staking now 85+' },
                { type: 'improvement', description: 'Total pools now 90+' },
                { type: 'improvement', description: 'Total index funds now 75+' }
            ]
        },
        {
            version: '2.7.1',
            date: '2026-01-13',
            codename: 'Mega Expansion II',
            type: 'minor',
            changes: [
                { type: 'feature', description: 'Added 20 new vaults (Swell, Renzo, Pendle PT/YT/LP, GMX GLP/GM, Hyperliquid HLP, Jupiter JLP, dYdX, etc.)' },
                { type: 'feature', description: 'Added 18 new lending markets (PENDLE, dYdX, JUP, PYTH, STRK, BLUR, WLD, ENA, ETHFI, TON, KAS, etc.)' },
                { type: 'feature', description: 'Added 18 new savings products (APT, INJ, TIA, NEAR, FTM, STRK, JUP, locked periods)' },
                { type: 'feature', description: 'Added 15 new combos (ZK Rollup, EigenLayer Maxi, Pendle Yield, GMX, NEAR, Aptos, L2 DeFi, etc.)' },
                { type: 'improvement', description: 'Total products now 450+' },
                { type: 'improvement', description: 'Total vaults now 70+' },
                { type: 'improvement', description: 'Total combos now 47+' },
                { type: 'improvement', description: 'Total lending markets now 55+' }
            ]
        },
        {
            version: '2.7.0',
            date: '2026-01-13',
            codename: 'Mega Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 24 new staking products (JitoSOL, mSOL, frxETH, TON, KSM, ICP, etc.)' },
                { type: 'feature', description: 'Added 30 new liquidity pools (TON, DYM, KAS, JTO, stablecoins, DeFi blue chips)' },
                { type: 'feature', description: 'Added 25 new vaults (Morpho, Yearn, Beefy, Convex, EigenLayer restaking)' },
                { type: 'feature', description: 'Added 18 new lending markets (SEI, INJ, TIA, stETH, GHO, crvUSD, etc.)' },
                { type: 'feature', description: 'Added 14 new savings products (ARB, OP, ATOM, SUI, SEI, TON, etc.)' },
                { type: 'feature', description: 'Added 12 new combos (TON, Base, Airdrop Farmer, Modular Chains, etc.)' },
                { type: 'feature', description: 'Added 20 new index funds (TON, Infrastructure, Bridge, NFT, Social, etc.)' },
                { type: 'feature', description: 'Learn module now fully translated to French (i18n support)' },
                { type: 'improvement', description: 'Total products now 350+' },
                { type: 'improvement', description: 'Total index funds now 35+' },
                { type: 'improvement', description: 'Total combos now 32+' }
            ]
        },
        {
            version: '2.6.0',
            date: '2026-01-13',
            codename: 'Expansion II',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added 25+ new liquidity pools (SUI, SEI, APT, TIA, STRK, BONK, etc.)' },
                { type: 'feature', description: 'Added 15 new vaults (Hyperliquid, Jupiter LP, LRT Optimizer, etc.)' },
                { type: 'feature', description: 'Added 14 new staking products (SUI, APT, SEI, INJ, TIA, OSMO, etc.)' },
                { type: 'feature', description: 'Added 10 new lending markets (ARB, OP, SUI, APT, FRAX, etc.)' },
                { type: 'feature', description: 'Added 10 new savings products (USDe, sUSDe, PYUSD, etc.)' },
                { type: 'feature', description: 'Added 10 new combos (Cosmos, RWA, Gaming, New L1s, Perps, etc.)' },
                { type: 'feature', description: 'Added 10 new index funds (Meme, Gaming, Privacy, ZK, etc.)' },
                { type: 'fix', description: 'Fixed animation switching with event delegation' },
                { type: 'fix', description: 'Fixed background images z-index' },
                { type: 'fix', description: 'Added missing French translations for colors' },
                { type: 'improvement', description: 'Total products now 200+' }
            ]
        },
        {
            version: '2.5.0',
            date: '2026-01-09',
            codename: 'Galaxy',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Added Galaxy theme with planets, stars, nebulas, asteroids' },
                { type: 'feature', description: 'Added Ocean theme with fish, bubbles, seaweed, light rays' },
                { type: 'feature', description: 'Added UI Verifier module for comprehensive diagnostics' },
                { type: 'feature', description: 'Added Versioning system with full changelog' },
                { type: 'feature', description: 'Added Backup system for user data' },
                { type: 'fix', description: 'Fixed combo modal overflow - now scrollable' },
                { type: 'fix', description: 'Fixed Settings tab display issues' },
                { type: 'fix', description: 'Fixed Learn tab display issues' },
                { type: 'improvement', description: 'Expanded combos to 82+ products' }
            ]
        },
        {
            version: '2.4.0',
            date: '2026-01-08',
            codename: 'Expansion',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Expanded all investment modules to 40+ products each' },
                { type: 'feature', description: 'Added Bonds module (45 products)' },
                { type: 'feature', description: 'Added Copy Trading module (45 traders)' },
                { type: 'feature', description: 'Added Insurance module (40 policies)' },
                { type: 'feature', description: 'Added Launchpad module (40 projects)' },
                { type: 'feature', description: 'Added Predictions module (45 markets)' },
                { type: 'feature', description: 'Added Structured Products module (40 products)' },
                { type: 'feature', description: 'Added RWA module (45 assets)' },
                { type: 'feature', description: 'Added NFT Staking module (40 collections)' },
                { type: 'feature', description: 'Added Lottery module (25 pools)' },
                { type: 'feature', description: 'Added Algo Strategies module (45 strategies)' },
                { type: 'feature', description: 'Added Social Trading module (45 features)' },
                { type: 'feature', description: 'Added Flash Loans module (40 pools)' }
            ]
        },
        {
            version: '2.3.0',
            date: '2026-01-07',
            codename: 'Themes',
            type: 'minor',
            changes: [
                { type: 'feature', description: 'Added Avatar bioluminescent theme' },
                { type: 'feature', description: 'Added Halo Forerunner theme' },
                { type: 'feature', description: 'Added Matrix theme with color options' },
                { type: 'feature', description: 'Added Particles theme' },
                { type: 'improvement', description: 'Theme persistence in localStorage' }
            ]
        },
        {
            version: '2.2.0',
            date: '2026-01-06',
            codename: 'Security',
            type: 'minor',
            changes: [
                { type: 'feature', description: 'Added post-quantum cryptography (Kyber, Dilithium)' },
                { type: 'feature', description: 'Added 10 security modules' },
                { type: 'feature', description: 'Added circuit breaker protection' },
                { type: 'feature', description: 'Added anomaly detection' },
                { type: 'security', description: 'Zero-day shield protection' }
            ]
        },
        {
            version: '2.1.0',
            date: '2026-01-05',
            codename: 'Trading',
            type: 'minor',
            changes: [
                { type: 'feature', description: 'Added real-time price updates from multiple sources' },
                { type: 'feature', description: 'Added TradingView chart integration' },
                { type: 'feature', description: 'Added Obelisk native chart option' },
                { type: 'feature', description: 'Added demo trading mode' },
                { type: 'improvement', description: 'Improved orderbook display' }
            ]
        },
        {
            version: '2.0.0',
            date: '2026-01-01',
            codename: 'Genesis',
            type: 'major',
            changes: [
                { type: 'feature', description: 'Initial public release' },
                { type: 'feature', description: 'Non-custodial wallet creation' },
                { type: 'feature', description: 'Simulated portfolio system' },
                { type: 'feature', description: 'Investment products (Staking, Vaults, Lending)' },
                { type: 'feature', description: 'Multi-language support (EN, FR, ES, DE, JP, KO, ZH)' }
            ]
        }
    ],

    // Get current version string
    getVersion() {
        const v = this.current;
        return `v${v.major}.${v.minor}.${v.patch}`;
    },

    // Get full version info
    getFullVersion() {
        const v = this.current;
        return `v${v.major}.${v.minor}.${v.patch}-${v.build} "${v.codename}" (${v.date})`;
    },

    // Get changelog for specific version
    getChangelog(version) {
        return this.history.find(h => h.version === version);
    },

    // Get all changes of a specific type
    getChangesByType(type) {
        const changes = [];
        this.history.forEach(release => {
            release.changes.forEach(change => {
                if (change.type === type) {
                    changes.push({
                        version: release.version,
                        date: release.date,
                        description: change.description
                    });
                }
            });
        });
        return changes;
    },

    // Generate HTML changelog
    generateChangelogHTML() {
        let html = `
            <div class="changelog-container">
                <h2>Obelisk DEX Changelog</h2>
                <p class="current-version">Current: ${this.getFullVersion()}</p>
        `;

        this.history.forEach(release => {
            const typeColors = {
                feature: '#00ff88',
                fix: '#ff6464',
                improvement: '#4a9eff',
                security: '#a855f7'
            };

            html += `
                <div class="changelog-release">
                    <div class="release-header">
                        <h3>v${release.version} - "${release.codename}"</h3>
                        <span class="release-date">${release.date}</span>
                        <span class="release-type ${release.type}">${release.type.toUpperCase()}</span>
                    </div>
                    <ul class="release-changes">
            `;

            release.changes.forEach(change => {
                const color = typeColors[change.type] || '#888';
                html += `<li><span class="change-type" style="color:${color}">[${change.type.toUpperCase()}]</span> ${change.description}</li>`;
            });

            html += `</ul></div>`;
        });

        html += `</div>`;
        return html;
    },

    // Show version modal
    showVersionModal() {
        const existing = document.getElementById('version-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'version-modal';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:500;display:flex;align-items:center;justify-content:center;" onclick="if(event.target===this)this.remove()">
                <div style="background:linear-gradient(135deg,#0a0a1e,#1a1040);border:2px solid #8a2be2;border-radius:16px;max-width:700px;max-height:80vh;overflow-y:auto;padding:24px;margin:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="margin:0;color:#00ff88;">Obelisk DEX</h2>
                        <button onclick="this.closest('#version-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">×</button>
                    </div>
                    <div style="text-align:center;padding:20px;background:rgba(0,255,136,0.1);border-radius:12px;margin-bottom:20px;">
                        <div style="font-size:32px;font-weight:bold;color:#00ff88;">${this.getVersion()}</div>
                        <div style="color:#888;margin-top:8px;">"${this.current.codename}" - ${this.current.date}</div>
                    </div>
                    <h3 style="color:#fff;border-bottom:1px solid #333;padding-bottom:8px;">Changelog</h3>
                    ${this.history.map(release => `
                        <div style="margin-bottom:20px;padding:15px;background:rgba(255,255,255,0.03);border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <span style="color:#00ff88;font-weight:bold;">v${release.version}</span>
                                <span style="color:#888;font-size:12px;">${release.date}</span>
                            </div>
                            <ul style="margin:0;padding-left:20px;color:#ccc;font-size:13px;">
                                ${release.changes.slice(0, 5).map(c => `
                                    <li style="margin-bottom:4px;">
                                        <span style="color:${c.type === 'feature' ? '#00ff88' : c.type === 'fix' ? '#ff6464' : '#4a9eff'}">[${c.type}]</span>
                                        ${c.description}
                                    </li>
                                `).join('')}
                                ${release.changes.length > 5 ? `<li style="color:#888">...and ${release.changes.length - 5} more</li>` : ''}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Check for updates (simulated)
    checkForUpdates() {
        console.log('[VERSIONING] Checking for updates...');
        // In a real app, this would make an API call
        return {
            hasUpdate: false,
            currentVersion: this.getVersion(),
            latestVersion: this.getVersion(),
            message: 'You are running the latest version!'
        };
    },

    // Initialize version display in footer
    init() {
        const versionElement = document.querySelector('.footer-version');
        if (versionElement) {
            versionElement.textContent = this.getVersion();
            versionElement.style.cursor = 'pointer';
            versionElement.onclick = () => this.showVersionModal();
        }

        console.log(`[VERSIONING] Obelisk DEX ${this.getFullVersion()}`);
    }
};

// Initialize on load
window.addEventListener('load', () => {
    VersioningSystem.init();
});

// Expose globally
window.VersioningSystem = VersioningSystem;
console.log('[VERSIONING] Module loaded');
