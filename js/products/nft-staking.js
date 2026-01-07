/**
 * NFT STAKING MODULE
 */
const NFTStakingModule = {
    collections: [
        { id: 'bayc', name: 'BAYC Staking', collection: 'Bored Ape YC', apy: 8, minFloor: 30, token: 'APE' },
        { id: 'punks', name: 'CryptoPunks', collection: 'CryptoPunks', apy: 5, minFloor: 50, token: 'ETH' },
        { id: 'azuki', name: 'Azuki Staking', collection: 'Azuki', apy: 12, minFloor: 8, token: 'BEAN' },
        { id: 'doodles', name: 'Doodles', collection: 'Doodles', apy: 15, minFloor: 3, token: 'ETH' },
        { id: 'pudgy', name: 'Pudgy Penguins', collection: 'Pudgy Penguins', apy: 18, minFloor: 10, token: 'ETH' },
        { id: 'degods', name: 'DeGods', collection: 'DeGods', apy: 20, minFloor: 5, token: 'SOL' }
    ],
    stakedNFTs: [],
    init() { this.load(); console.log('NFT Staking initialized'); },
    load() { this.stakedNFTs = SafeOps.getStorage('obelisk_nftstaking', []); },
    save() { SafeOps.setStorage('obelisk_nftstaking', this.stakedNFTs); },
    stakeNFT(collectionId, nftValue) {
        const col = this.collections.find(c => c.id === collectionId);
        if (!col) return { success: false, error: 'Collection not found' };
        const stake = { id: 'nft-' + Date.now(), collectionId, value: nftValue, startDate: Date.now(), apy: col.apy, rewardToken: col.token };
        this.stakedNFTs.push(stake);
        this.save();
        if (typeof SimulatedPortfolio !== 'undefined') SimulatedPortfolio.invest(stake.id, col.name, nftValue * 1000, col.apy, 'nft-staking', true);
        return { success: true, stake };
    },
    unstakeNFT(stakeId) {
        const idx = this.stakedNFTs.findIndex(s => s.id === stakeId);
        if (idx === -1) return { success: false };
        const stake = this.stakedNFTs[idx];
        const days = (Date.now() - stake.startDate) / 86400000;
        const rewards = stake.value * 1000 * (stake.apy / 100) * (days / 365);
        this.stakedNFTs.splice(idx, 1);
        this.save();
        return { success: true, rewards, token: stake.rewardToken };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">NFT Staking</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.collections.map(c => 
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + c.name + '</strong><br>' + c.apy + '% APY in ' + c.token + '<br>Floor: ' + c.minFloor + ' ETH<br><button onclick="NFTStakingModule.quickStake(\'' + c.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Stake NFT</button></div>'
        ).join('') + '</div>';
    },
    quickStake(collectionId) {
        const col = this.collections.find(c => c.id === collectionId);
        const value = parseFloat(prompt('NFT value in ETH (floor: ' + col.minFloor + '):'));
        if (value) {
            const r = this.stakeNFT(collectionId, value);
            alert(r.success ? 'NFT Staked!' : r.error);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => NFTStakingModule.init());
