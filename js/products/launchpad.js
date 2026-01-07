/**
 * LAUNCHPAD MODULE - IDO/ICO Platform
 */
const LaunchpadModule = {
    projects: [
        { id: 'defi-ai', name: 'DeFi AI Protocol', ticker: 'DFAI', price: 0.05, raised: 2500000, hardcap: 5000000, minAlloc: 100, maxAlloc: 5000, status: 'live', tge: '2025-02-15' },
        { id: 'quantum-chain', name: 'Quantum Chain', ticker: 'QNTM', price: 0.12, raised: 8000000, hardcap: 10000000, minAlloc: 250, maxAlloc: 10000, status: 'live', tge: '2025-01-30' },
        { id: 'meta-gaming', name: 'MetaGaming Hub', ticker: 'MGH', price: 0.03, raised: 1200000, hardcap: 3000000, minAlloc: 50, maxAlloc: 2000, status: 'upcoming', tge: '2025-03-01' },
        { id: 'green-nft', name: 'GreenNFT Marketplace', ticker: 'GNFT', price: 0.08, raised: 4000000, hardcap: 4000000, minAlloc: 100, maxAlloc: 3000, status: 'filled', tge: '2025-02-01' },
        { id: 'layer3-net', name: 'Layer3 Network', ticker: 'L3N', price: 0.25, raised: 0, hardcap: 15000000, minAlloc: 500, maxAlloc: 25000, status: 'upcoming', tge: '2025-04-01' },
        { id: 'social-fi', name: 'SocialFi Platform', ticker: 'SOFI', price: 0.02, raised: 500000, hardcap: 2000000, minAlloc: 25, maxAlloc: 1000, status: 'live', tge: '2025-02-20' }
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
