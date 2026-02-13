/* ============================================
   AIRDROP TRACKER - Track & claim airdrops
   ============================================ */

const AirdropTracker = {
    claimed: [],

    init() {
        try { this.claimed = JSON.parse(localStorage.getItem('obelisk_airdrops_claimed') || '[]'); } catch(e) { this.claimed = []; }
    },

    save() { localStorage.setItem('obelisk_airdrops_claimed', JSON.stringify(this.claimed)); },

    getAirdrops() {
        return [
            { id: 'ad1', project: 'LayerZero V2', ticker: 'ZRO', icon: '🌀', status: 'claimable', value: '$420', tokens: '180 ZRO', deadline: '2026-03-15', chain: 'Ethereum', criteria: 'Bridge usage > 5 txs', eligible: true },
            { id: 'ad2', project: 'zkSync Era', ticker: 'ZK', icon: '🔒', status: 'claimable', value: '$850', tokens: '2,500 ZK', deadline: '2026-04-01', chain: 'zkSync', criteria: '10+ interactions + $1K volume', eligible: true },
            { id: 'ad3', project: 'Scroll', ticker: 'SCR', icon: '📜', status: 'upcoming', value: 'TBD', tokens: 'TBD', deadline: 'Q2 2026', chain: 'Scroll', criteria: 'Bridge + deploy contract', eligible: true },
            { id: 'ad4', project: 'Starknet S2', ticker: 'STRK', icon: '⚡', status: 'upcoming', value: 'TBD', tokens: 'TBD', deadline: 'Q2 2026', chain: 'Starknet', criteria: 'Protocol activity', eligible: false },
            { id: 'ad5', project: 'Eigenlayer', ticker: 'EIGEN', icon: '🔷', status: 'claimable', value: '$1,200', tokens: '450 EIGEN', deadline: '2026-02-28', chain: 'Ethereum', criteria: 'Restaking > 1 ETH', eligible: true },
            { id: 'ad6', project: 'Monad', ticker: 'MON', icon: '🟣', status: 'farming', value: 'Est. $300-2K', tokens: 'TBD', deadline: 'TBD', chain: 'Monad', criteria: 'Testnet activity', eligible: true },
            { id: 'ad7', project: 'Berachain', ticker: 'BERA', icon: '🐻', status: 'farming', value: 'Est. $500-3K', tokens: 'TBD', deadline: 'TBD', chain: 'Berachain', criteria: 'Testnet + social', eligible: true },
            { id: 'ad8', project: 'Hyperlane', ticker: 'HYP', icon: '🛤️', status: 'farming', value: 'Est. $200-1K', tokens: 'TBD', deadline: 'TBD', chain: 'Multi', criteria: 'Cross-chain messaging', eligible: false },
            { id: 'ad9', project: 'Ambient Finance', ticker: 'AMB', icon: '💧', status: 'ended', value: '$620', tokens: '1,800 AMB', deadline: 'Ended', chain: 'Ethereum', criteria: 'LP + swap activity', eligible: true },
            { id: 'ad10', project: 'Blast S2', ticker: 'BLAST', icon: '💥', status: 'ended', value: '$180', tokens: '5,000 BLAST', deadline: 'Ended', chain: 'Blast', criteria: 'TVL + points', eligible: true }
        ];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var airdrops = this.getAirdrops();
        var self = this;
        var claimable = airdrops.filter(function(a) { return a.status === 'claimable' && a.eligible; });
        var totalClaimable = 0;
        claimable.forEach(function(a) { totalClaimable += parseFloat(a.value.replace(/[$,]/g, '')) || 0; });
        var farming = airdrops.filter(function(a) { return a.status === 'farming'; });
        var eligible = airdrops.filter(function(a) { return a.eligible; });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + totalClaimable.toLocaleString() + '</div><div class="sol-stat-label">Claimable Now</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + claimable.length + '</div><div class="sol-stat-label">Ready to Claim</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + farming.length + '</div><div class="sol-stat-label">Farming</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + eligible.length + '/' + airdrops.length + '</div><div class="sol-stat-label">Eligible</div></div></div>';

        var tabs = [{ id: 'claimable', label: 'Claimable', icon: '✅' }, { id: 'farming', label: 'Farming', icon: '🌱' }, { id: 'upcoming', label: 'Upcoming', icon: '📅' }, { id: 'ended', label: 'Ended', icon: '⏰' }];
        html += '<div style="display:flex;gap:8px;margin-bottom:16px">';
        tabs.forEach(function(tab, i) {
            html += '<button class="sol-btn sol-btn-sm ' + (i === 0 ? 'sol-btn-primary' : 'sol-btn-outline') + ' ad-tab" data-tab="' + tab.id + '">' + tab.icon + ' ' + tab.label + '</button>';
        });
        html += '</div>';

        tabs.forEach(function(tab) {
            var filtered = airdrops.filter(function(a) { return a.status === tab.id; });
            html += '<div class="ad-section" data-group="' + tab.id + '" style="' + (tab.id !== 'claimable' ? 'display:none' : '') + '">';
            if (filtered.length === 0) {
                html += '<div class="sol-empty"><div class="sol-empty-icon">📭</div><div class="sol-empty-text">No ' + tab.label.toLowerCase() + ' airdrops</div></div>';
            }
            filtered.forEach(function(ad) {
                var isClaimed = self.claimed.includes(ad.id);
                var statusColor = ad.status === 'claimable' ? '#00ff88' : ad.status === 'farming' ? '#c9a227' : ad.status === 'upcoming' ? '#00d4ff' : '#555';
                html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:10px;' + (ad.status === 'claimable' && ad.eligible ? 'border-color:#00ff8833;background:rgba(0,255,136,0.02)' : '') + '">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
                    '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:28px">' + ad.icon + '</span>' +
                    '<div><strong style="color:#fff;font-size:15px">' + ad.project + '</strong> <span style="color:#888">$' + ad.ticker + '</span>' +
                    '<div style="font-size:11px;color:#555">' + ad.chain + ' | ' + ad.criteria + '</div></div></div>' +
                    '<div style="text-align:right">';
                if (ad.value !== 'TBD') {
                    html += '<div style="font-family:monospace;color:#00ff88;font-size:16px;font-weight:700">' + ad.value + '</div>';
                }
                html += '<div style="font-size:11px;color:#888">' + ad.tokens + '</div></div></div>';

                html += '<div style="display:flex;justify-content:space-between;align-items:center">' +
                    '<div style="display:flex;gap:8px">' +
                    '<span class="sol-tag" style="background:' + statusColor + '22;color:' + statusColor + '">' + ad.status + '</span>' +
                    '<span class="sol-tag ' + (ad.eligible ? 'sol-tag-green' : 'sol-tag-red') + '">' + (ad.eligible ? 'Eligible' : 'Not Eligible') + '</span>' +
                    (ad.deadline !== 'TBD' && ad.deadline !== 'Ended' ? '<span style="font-size:11px;color:#888">Deadline: ' + ad.deadline + '</span>' : '') +
                    '</div>';
                if (ad.status === 'claimable' && ad.eligible && !isClaimed) {
                    html += '<button class="sol-btn sol-btn-sm sol-btn-primary ad-claim" data-id="' + ad.id + '">Claim Now</button>';
                } else if (isClaimed) {
                    html += '<span style="color:#00ff88;font-size:12px">Claimed ✓</span>';
                } else if (ad.status === 'farming') {
                    html += '<button class="sol-btn sol-btn-sm sol-btn-outline">View Tasks</button>';
                }
                html += '</div></div>';
            });
            html += '</div>';
        });

        c.innerHTML = html;
        c.querySelectorAll('.ad-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                c.querySelectorAll('.ad-tab').forEach(function(b) { b.classList.remove('sol-btn-primary'); b.classList.add('sol-btn-outline'); });
                btn.classList.remove('sol-btn-outline'); btn.classList.add('sol-btn-primary');
                c.querySelectorAll('.ad-section').forEach(function(sec) { sec.style.display = sec.dataset.group === btn.dataset.tab ? '' : 'none'; });
            });
        });
        c.querySelectorAll('.ad-claim').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.claimed.push(btn.dataset.id);
                self.save();
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Airdrop claimed successfully!');
                self.render('solution-body');
            });
        });
    }
};

SolutionsHub.registerSolution('airdrop-tracker', AirdropTracker, 'retail', {
    icon: '🪂', name: 'Airdrop Tracker', description: 'Track eligible airdrops, farming opportunities, and claim deadlines'
});
