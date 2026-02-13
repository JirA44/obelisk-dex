/* ============================================
   DAO GOVERNANCE - Vote on proposals
   ============================================ */

const DAOGovernance = {
    votes: [],

    init() {
        try { this.votes = JSON.parse(localStorage.getItem('obelisk_dao_votes') || '[]'); } catch(e) { this.votes = []; }
    },

    save() { localStorage.setItem('obelisk_dao_votes', JSON.stringify(this.votes)); },

    getProposals() {
        return [
            { id: 'p1', title: 'OBK-12: Increase staking rewards to 8% APY', author: '0x377...140', status: 'active', votesFor: 2400000, votesAgainst: 800000, quorum: 5000000, endsIn: '2d 14h', category: 'Treasury' },
            { id: 'p2', title: 'OBK-11: Add SOL/USDC perpetuals market', author: '0xA8c...b21', status: 'active', votesFor: 1800000, votesAgainst: 200000, quorum: 3000000, endsIn: '4d 8h', category: 'Product' },
            { id: 'p3', title: 'OBK-10: Deploy on Base L2', author: '0x5eF...d03', status: 'active', votesFor: 3200000, votesAgainst: 1500000, quorum: 5000000, endsIn: '12h', category: 'Infrastructure' },
            { id: 'p4', title: 'OBK-9: Fee reduction from 0.1% to 0.08%', author: '0xB0B...a91', status: 'passed', votesFor: 4500000, votesAgainst: 500000, quorum: 3000000, endsIn: '-', category: 'Fees' },
            { id: 'p5', title: 'OBK-8: Community grants program ($500K)', author: '0x7F2...c33', status: 'passed', votesFor: 3800000, votesAgainst: 1200000, quorum: 3000000, endsIn: '-', category: 'Treasury' },
            { id: 'p6', title: 'OBK-7: Partnership with Chainlink CCIP', author: '0x9aD...b72', status: 'defeated', votesFor: 1200000, votesAgainst: 2800000, quorum: 3000000, endsIn: '-', category: 'Partnership' },
            { id: 'p7', title: 'OBK-13: Launch governance token buyback program', author: '0x377...140', status: 'pending', votesFor: 0, votesAgainst: 0, quorum: 5000000, endsIn: 'Starts in 3d', category: 'Treasury' }
        ];
    },

    renderVoteBar(votesFor, votesAgainst, quorum, width) {
        var total = votesFor + votesAgainst;
        var forPct = total > 0 ? (votesFor / total * 100) : 50;
        var quorumPct = quorum > 0 ? Math.min(100, (total / quorum * 100)) : 0;
        return '<div style="margin:8px 0"><div style="display:flex;height:20px;border-radius:4px;overflow:hidden;width:' + width + 'px">' +
            '<div style="width:' + forPct + '%;background:#00ff88;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000">' + (forPct > 15 ? forPct.toFixed(0) + '% FOR' : '') + '</div>' +
            '<div style="width:' + (100 - forPct) + '%;background:#ff4466;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff">' + (100 - forPct > 15 ? (100 - forPct).toFixed(0) + '% AGAINST' : '') + '</div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:10px;color:#555;margin-top:2px"><span>Quorum: ' + quorumPct.toFixed(0) + '%</span><span>' + (total / 1000000).toFixed(1) + 'M / ' + (quorum / 1000000).toFixed(0) + 'M needed</span></div></div>';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var proposals = this.getProposals();
        var self = this;
        var active = proposals.filter(function(p) { return p.status === 'active'; });
        var passed = proposals.filter(function(p) { return p.status === 'passed'; });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + active.length + '</div><div class="sol-stat-label">Active Votes</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + passed.length + '</div><div class="sol-stat-label">Passed</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + proposals.length + '</div><div class="sol-stat-label">Total Proposals</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + self.votes.length + '</div><div class="sol-stat-label">Your Votes</div></div></div>';

        proposals.forEach(function(p) {
            var statusColor = p.status === 'active' ? '#00d4ff' : p.status === 'passed' ? '#00ff88' : p.status === 'defeated' ? '#ff4466' : '#888';
            var hasVoted = self.votes.find(function(v) { return v.id === p.id; });

            html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:12px;' + (p.status === 'active' ? 'border-color:#00d4ff22' : '') + '">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">' +
                '<div><strong style="color:#fff;font-size:14px">' + p.title + '</strong>' +
                '<div style="font-size:11px;color:#555;margin-top:3px">By ' + p.author + ' | <span class="sol-tag sol-tag-blue" style="font-size:10px">' + p.category + '</span></div></div>' +
                '<div style="text-align:right"><span class="sol-tag" style="background:' + statusColor + '22;color:' + statusColor + '">' + p.status.toUpperCase() + '</span>' +
                (p.endsIn !== '-' ? '<div style="font-size:11px;color:#888;margin-top:4px">' + p.endsIn + '</div>' : '') + '</div></div>';

            if (p.votesFor + p.votesAgainst > 0 || p.status === 'active') {
                html += self.renderVoteBar(p.votesFor, p.votesAgainst, p.quorum, 500);
            }

            if (p.status === 'active' && !hasVoted) {
                html += '<div style="display:flex;gap:8px;margin-top:8px">' +
                    '<button class="sol-btn sol-btn-sm dao-vote" data-id="' + p.id + '" data-vote="for" style="background:#00ff8822;color:#00ff88;border:1px solid #00ff8844">Vote FOR</button>' +
                    '<button class="sol-btn sol-btn-sm dao-vote" data-id="' + p.id + '" data-vote="against" style="background:#ff446622;color:#ff4466;border:1px solid #ff446644">Vote AGAINST</button>' +
                    '<button class="sol-btn sol-btn-sm sol-btn-outline dao-vote" data-id="' + p.id + '" data-vote="abstain">Abstain</button></div>';
            } else if (hasVoted) {
                html += '<div style="font-size:12px;color:#888;margin-top:6px">You voted: <strong style="color:' + (hasVoted.vote === 'for' ? '#00ff88' : hasVoted.vote === 'against' ? '#ff4466' : '#888') + '">' + hasVoted.vote.toUpperCase() + '</strong></div>';
            }
            html += '</div>';
        });

        c.innerHTML = html;
        c.querySelectorAll('.dao-vote').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.votes.push({ id: btn.dataset.id, vote: btn.dataset.vote, time: new Date().toISOString() });
                self.save();
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Vote cast: ' + btn.dataset.vote.toUpperCase());
                self.render('solution-body');
            });
        });
    }
};

SolutionsHub.registerSolution('dao-governance', DAOGovernance, 'shared', {
    icon: '🏛️', name: 'DAO Governance', description: 'Vote on protocol proposals, delegate voting power, and track governance activity'
});
