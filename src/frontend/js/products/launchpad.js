/**
 * LAUNCHPAD MODULE - IDO/ICO Platform
 */
const LaunchpadModule = {
    projects: [
        // Original 6 projects
        { id: 'defi-ai', name: 'DeFi AI Protocol', ticker: 'DFAI', price: 0.05, raised: 2500000, hardcap: 5000000, minAlloc: 100, maxAlloc: 5000, status: 'live', tge: '2025-02-15' },
        { id: 'quantum-chain', name: 'Quantum Chain', ticker: 'QNTM', price: 0.12, raised: 8000000, hardcap: 10000000, minAlloc: 250, maxAlloc: 10000, status: 'live', tge: '2025-01-30' },
        { id: 'meta-gaming', name: 'MetaGaming Hub', ticker: 'MGH', price: 0.03, raised: 1200000, hardcap: 3000000, minAlloc: 50, maxAlloc: 2000, status: 'upcoming', tge: '2025-03-01' },
        { id: 'green-nft', name: 'GreenNFT Marketplace', ticker: 'GNFT', price: 0.08, raised: 4000000, hardcap: 4000000, minAlloc: 100, maxAlloc: 3000, status: 'filled', tge: '2025-02-01' },
        { id: 'layer3-net', name: 'Layer3 Network', ticker: 'L3N', price: 0.25, raised: 0, hardcap: 15000000, minAlloc: 500, maxAlloc: 25000, status: 'upcoming', tge: '2025-04-01' },
        { id: 'social-fi', name: 'SocialFi Platform', ticker: 'SOFI', price: 0.02, raised: 500000, hardcap: 2000000, minAlloc: 25, maxAlloc: 1000, status: 'live', tge: '2025-02-20' },

        // DeFi Protocols & DEXs
        { id: 'nexus-swap', name: 'NexusSwap DEX', ticker: 'NXSW', price: 0.15, raised: 6500000, hardcap: 8000000, minAlloc: 200, maxAlloc: 8000, status: 'live', tge: '2025-02-10' },
        { id: 'yield-matrix', name: 'YieldMatrix Finance', ticker: 'YMAX', price: 0.04, raised: 3200000, hardcap: 6000000, minAlloc: 100, maxAlloc: 4000, status: 'live', tge: '2025-02-25' },
        { id: 'lend-verse', name: 'LendVerse Protocol', ticker: 'LENV', price: 0.08, raised: 4500000, hardcap: 7000000, minAlloc: 150, maxAlloc: 6000, status: 'live', tge: '2025-03-05' },
        { id: 'perp-dex', name: 'PerpDEX Perpetuals', ticker: 'PERP', price: 0.20, raised: 12000000, hardcap: 12000000, minAlloc: 500, maxAlloc: 15000, status: 'filled', tge: '2025-01-25' },
        { id: 'liquid-staking', name: 'LiquidStake Protocol', ticker: 'LSTK', price: 0.06, raised: 2800000, hardcap: 5000000, minAlloc: 100, maxAlloc: 3500, status: 'live', tge: '2025-03-10' },
        { id: 'vault-finance', name: 'VaultFi Aggregator', ticker: 'VAFI', price: 0.03, raised: 1500000, hardcap: 4000000, minAlloc: 50, maxAlloc: 2500, status: 'live', tge: '2025-03-15' },
        { id: 'stable-swap', name: 'StableSwap Exchange', ticker: 'STBS', price: 0.10, raised: 0, hardcap: 8000000, minAlloc: 200, maxAlloc: 7000, status: 'upcoming', tge: '2025-04-15' },

        // Gaming & Metaverse
        { id: 'pixel-realms', name: 'PixelRealms Metaverse', ticker: 'PIXR', price: 0.02, raised: 1800000, hardcap: 4000000, minAlloc: 50, maxAlloc: 2000, status: 'live', tge: '2025-02-28' },
        { id: 'battle-verse', name: 'BattleVerse Gaming', ticker: 'BTVS', price: 0.05, raised: 3500000, hardcap: 5000000, minAlloc: 75, maxAlloc: 3000, status: 'live', tge: '2025-03-01' },
        { id: 'racing-chain', name: 'RacingChain P2E', ticker: 'RACE', price: 0.04, raised: 2000000, hardcap: 3500000, minAlloc: 50, maxAlloc: 2000, status: 'live', tge: '2025-03-08' },
        { id: 'rpg-worlds', name: 'RPG Worlds Online', ticker: 'RPGW', price: 0.08, raised: 0, hardcap: 6000000, minAlloc: 100, maxAlloc: 4000, status: 'upcoming', tge: '2025-04-20' },
        { id: 'esports-dao', name: 'eSports DAO', ticker: 'ESPD', price: 0.06, raised: 4200000, hardcap: 4500000, minAlloc: 100, maxAlloc: 3500, status: 'live', tge: '2025-02-18' },
        { id: 'virtual-lands', name: 'VirtualLands World', ticker: 'VLAN', price: 0.12, raised: 7500000, hardcap: 10000000, minAlloc: 250, maxAlloc: 8000, status: 'live', tge: '2025-03-12' },

        // NFT & Social Platforms
        { id: 'art-block', name: 'ArtBlock Collective', ticker: 'ARTB', price: 0.07, raised: 2800000, hardcap: 3500000, minAlloc: 100, maxAlloc: 2500, status: 'live', tge: '2025-02-22' },
        { id: 'music-nft', name: 'MusicNFT Platform', ticker: 'MNFT', price: 0.03, raised: 1200000, hardcap: 2500000, minAlloc: 50, maxAlloc: 1500, status: 'live', tge: '2025-03-05' },
        { id: 'creator-fi', name: 'CreatorFi Network', ticker: 'CRFI', price: 0.04, raised: 1800000, hardcap: 3000000, minAlloc: 75, maxAlloc: 2000, status: 'live', tge: '2025-03-10' },
        { id: 'fan-token', name: 'FanToken Hub', ticker: 'FANT', price: 0.02, raised: 900000, hardcap: 2000000, minAlloc: 25, maxAlloc: 1000, status: 'live', tge: '2025-03-15' },
        { id: 'social-graph', name: 'SocialGraph Protocol', ticker: 'SGPH', price: 0.05, raised: 0, hardcap: 4000000, minAlloc: 100, maxAlloc: 3000, status: 'upcoming', tge: '2025-04-25' },

        // Infrastructure & Layer 2s
        { id: 'hyper-layer', name: 'HyperLayer L2', ticker: 'HYPL', price: 0.30, raised: 15000000, hardcap: 20000000, minAlloc: 500, maxAlloc: 20000, status: 'live', tge: '2025-02-08' },
        { id: 'bridge-x', name: 'BridgeX Cross-Chain', ticker: 'BRDX', price: 0.18, raised: 9000000, hardcap: 12000000, minAlloc: 300, maxAlloc: 10000, status: 'live', tge: '2025-02-12' },
        { id: 'oracle-mesh', name: 'OracleMesh Network', ticker: 'ORCM', price: 0.08, raised: 5500000, hardcap: 8000000, minAlloc: 150, maxAlloc: 6000, status: 'live', tge: '2025-02-20' },
        { id: 'data-layer', name: 'DataLayer Protocol', ticker: 'DLAY', price: 0.06, raised: 3800000, hardcap: 6000000, minAlloc: 100, maxAlloc: 4000, status: 'live', tge: '2025-03-01' },
        { id: 'modular-chain', name: 'ModularChain', ticker: 'MODC', price: 0.22, raised: 0, hardcap: 15000000, minAlloc: 400, maxAlloc: 15000, status: 'upcoming', tge: '2025-05-01' },
        { id: 'rollup-net', name: 'RollupNet Protocol', ticker: 'RLUP', price: 0.14, raised: 7200000, hardcap: 10000000, minAlloc: 250, maxAlloc: 8000, status: 'live', tge: '2025-03-08' },

        // AI & Machine Learning
        { id: 'neural-chain', name: 'NeuralChain AI', ticker: 'NRAI', price: 0.10, raised: 6000000, hardcap: 8000000, minAlloc: 200, maxAlloc: 6000, status: 'live', tge: '2025-02-15' },
        { id: 'ml-compute', name: 'ML Compute Network', ticker: 'MLCN', price: 0.08, raised: 4500000, hardcap: 7000000, minAlloc: 150, maxAlloc: 5000, status: 'live', tge: '2025-02-25' },
        { id: 'ai-agents', name: 'AI Agents Protocol', ticker: 'AIAG', price: 0.12, raised: 8500000, hardcap: 10000000, minAlloc: 250, maxAlloc: 8000, status: 'live', tge: '2025-02-18' },
        { id: 'data-oracle', name: 'DataOracle AI', ticker: 'DOAI', price: 0.06, raised: 3200000, hardcap: 5000000, minAlloc: 100, maxAlloc: 3500, status: 'live', tge: '2025-03-05' },
        { id: 'gpu-net', name: 'GPUNet Compute', ticker: 'GPUN', price: 0.15, raised: 0, hardcap: 12000000, minAlloc: 300, maxAlloc: 10000, status: 'upcoming', tge: '2025-04-30' },

        // Real World Assets (RWA)
        { id: 'real-estate-fi', name: 'RealEstateFi', ticker: 'REFI', price: 0.25, raised: 10000000, hardcap: 15000000, minAlloc: 500, maxAlloc: 15000, status: 'live', tge: '2025-02-10' },
        { id: 'commodity-token', name: 'CommodityToken', ticker: 'CMDT', price: 0.15, raised: 7500000, hardcap: 10000000, minAlloc: 300, maxAlloc: 8000, status: 'live', tge: '2025-02-20' },
        { id: 'carbon-credit', name: 'CarbonCredit Chain', ticker: 'CARB', price: 0.08, raised: 4000000, hardcap: 6000000, minAlloc: 150, maxAlloc: 5000, status: 'live', tge: '2025-03-01' },
        { id: 'treasury-yield', name: 'TreasuryYield Protocol', ticker: 'TYLD', price: 0.20, raised: 0, hardcap: 20000000, minAlloc: 1000, maxAlloc: 25000, status: 'upcoming', tge: '2025-05-15' },
        { id: 'equity-dex', name: 'EquityDEX', ticker: 'EQDX', price: 0.12, raised: 6500000, hardcap: 8000000, minAlloc: 250, maxAlloc: 6000, status: 'live', tge: '2025-03-10' },

        // Privacy & Security
        { id: 'privacy-layer', name: 'PrivacyLayer Protocol', ticker: 'PVLY', price: 0.10, raised: 5000000, hardcap: 7000000, minAlloc: 200, maxAlloc: 5000, status: 'live', tge: '2025-02-22' },
        { id: 'zero-proof', name: 'ZeroProof Network', ticker: 'ZPRF', price: 0.08, raised: 4200000, hardcap: 6000000, minAlloc: 150, maxAlloc: 4500, status: 'live', tge: '2025-03-01' },
        { id: 'anon-swap', name: 'AnonSwap DEX', ticker: 'ANSW', price: 0.06, raised: 2800000, hardcap: 4000000, minAlloc: 100, maxAlloc: 3000, status: 'live', tge: '2025-03-08' },
        { id: 'shield-fi', name: 'ShieldFi Security', ticker: 'SHFI', price: 0.04, raised: 0, hardcap: 3500000, minAlloc: 75, maxAlloc: 2500, status: 'upcoming', tge: '2025-05-01' },

        // Cross-Chain & Interoperability
        { id: 'omni-bridge', name: 'OmniBridge Protocol', ticker: 'OMNI', price: 0.16, raised: 8000000, hardcap: 12000000, minAlloc: 300, maxAlloc: 10000, status: 'live', tge: '2025-02-15' },
        { id: 'chain-link-x', name: 'ChainLinkX Interop', ticker: 'CLKX', price: 0.12, raised: 6000000, hardcap: 8000000, minAlloc: 200, maxAlloc: 6000, status: 'live', tge: '2025-02-25' },
        { id: 'multi-vm', name: 'MultiVM Chain', ticker: 'MVMC', price: 0.20, raised: 10000000, hardcap: 15000000, minAlloc: 400, maxAlloc: 12000, status: 'live', tge: '2025-03-05' },
        { id: 'cosmos-hub-x', name: 'CosmosHubX', ticker: 'CSMX', price: 0.18, raised: 0, hardcap: 18000000, minAlloc: 500, maxAlloc: 15000, status: 'upcoming', tge: '2025-05-20' }
    ],
    participations: [],
    init() { this.load(); console.log('Launchpad Module initialized'); },
    load() { this.participations = SafeOps.getStorage('obelisk_launchpad', []); },
    save() { SafeOps.setStorage('obelisk_launchpad', this.participations); },
    participate(projectId, amount) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return { success: false, error: 'Project not found' };
        if (project.status !== 'live') return { success: false, error: 'Sale not active' };
        if (amount < project.minAlloc) return { success: false, error: 'Min: $' + project.minAlloc };
        if (amount > project.maxAlloc) return { success: false, error: 'Max: $' + project.maxAlloc };
        const tokens = amount / project.price;
        const part = { id: 'ido-' + Date.now(), projectId, amount, tokens, ticker: project.ticker, date: Date.now() };
        this.participations.push(part);
        this.save();
        return { success: true, participation: part, tokens };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Token Launchpad</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.projects.map(p =>
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + p.name + '</strong> ($' + p.ticker + ')<br>Price: $' + p.price + '<br>Raised: $' + (p.raised/1000000).toFixed(1) + 'M / $' + (p.hardcap/1000000).toFixed(1) + 'M<br>TGE: ' + p.tge + '<br>Status: ' + p.status.toUpperCase() + '<br>' + (p.status === 'live' ? '<button onclick="LaunchpadModule.quickJoin(\'' + p.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Participate</button>' : '') + '</div>'
        ).join('') + '</div>';
    },
    quickJoin(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        const amount = parseFloat(prompt('Amount USD ($' + project.minAlloc + '-$' + project.maxAlloc + '):'));
        if (amount !== null && amount > 0) { const r = this.participate(projectId, amount); alert(r.success ? 'Success! You get ' + r.tokens.toFixed(0) + ' ' + project.ticker : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => LaunchpadModule.init());
