/**
 * GOVERNANCE STAKING MODULE - Obelisk DEX
 * Stake governance tokens for voting power and rewards
 */
const GovernanceStakingModule = {
    items: [
        { id: 'obelisk-gov', name: 'Obelisk DAO', token: 'OBL', baseApy: 15, voteMultiplier: 1, lockOptions: [0, 30, 90, 180, 365], maxBoost: 2.5, minStake: 100, totalStaked: 45000000 },
        { id: 'aave-gov', name: 'Aave Governance', token: 'AAVE', baseApy: 8, voteMultiplier: 1, lockOptions: [0, 30, 90], maxBoost: 1.5, minStake: 1, totalStaked: 12000000 },
        { id: 'uni-gov', name: 'Uniswap Governance', token: 'UNI', baseApy: 5, voteMultiplier: 1, lockOptions: [0, 30], maxBoost: 1.2, minStake: 10, totalStaked: 85000000 },
        { id: 'mkr-gov', name: 'MakerDAO', token: 'MKR', baseApy: 6, voteMultiplier: 1, lockOptions: [0, 90, 180], maxBoost: 2.0, minStake: 0.1, totalStaked: 450000 },
        { id: 'crv-gov', name: 'Curve DAO', token: 'CRV', baseApy: 12, voteMultiplier: 1, lockOptions: [90, 180, 365, 730], maxBoost: 4.0, minStake: 100, totalStaked: 500000000 },
        { id: 'bal-gov', name: 'Balancer Governance', token: 'BAL', baseApy: 10, voteMultiplier: 1, lockOptions: [0, 30, 90, 180], maxBoost: 2.0, minStake: 10, totalStaked: 25000000 },
        { id: 'comp-gov', name: 'Compound Governance', token: 'COMP', baseApy: 4, voteMultiplier: 1, lockOptions: [0], maxBoost: 1.0, minStake: 1, totalStaked: 2500000 },
        { id: 'arb-gov', name: 'Arbitrum DAO', token: 'ARB', baseApy: 8, voteMultiplier: 1, lockOptions: [0, 30, 90], maxBoost: 1.5, minStake: 100, totalStaked: 1200000000 }
    ],
    positions: [],
    proposals: [],

    init() {
        this.load();
        this.generateProposals();
        console.log('Governance Staking Module initialized');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_governance_staking', []);
    },

    save() {
        SafeOps.setStorage('obelisk_governance_staking', this.positions);
    },

    invest(itemId, amount, lockDays = 0) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, error: 'Token not found' };
        if (amount < item.minStake) return { success: false, error: 'Min stake: ' + item.minStake + ' ' + item.token };
        if (!item.lockOptions.includes(lockDays)) return { success: false, error: 'Invalid lock period' };

        const boostMultiplier = this.calculateBoost(item, lockDays);
        const effectiveApy = item.baseApy * boostMultiplier;
        const votingPower = amount * boostMultiplier;
        const unlockDate = lockDays > 0 ? Date.now() + (lockDays * 86400000) : null;

        const position = {
            id: 'gov-' + Date.now(),
            daoId: itemId,
            daoName: item.name,
            token: item.token,
            amount,
            lockDays,
            unlockDate,
            boostMultiplier,
            effectiveApy,
            votingPower,
            startDate: Date.now(),
            rewardsEarned: 0,
            rewardsClaimed: 0,
            votesParticipated: 0,
            delegatedTo: null
        };

        this.positions.push(position);
        this.save();

        if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.invest(position.id, item.name, amount, effectiveApy, 'governance', lockDays > 0);
        }

        return { success: true, position, votingPower: votingPower.toFixed(2), effectiveApy: effectiveApy.toFixed(2) };
    },

    withdraw(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const pos = this.positions[idx];
        const now = Date.now();

        if (pos.unlockDate && now < pos.unlockDate) {
            const daysRemaining = Math.ceil((pos.unlockDate - now) / 86400000);
            return { success: false, error: 'Locked for ' + daysRemaining + ' more days' };
        }

        // Calculate final rewards
        const daysStaked = (now - pos.startDate) / 86400000;
        const pendingRewards = pos.amount * (pos.effectiveApy / 100) * (daysStaked / 365);
        const totalRewards = pos.rewardsEarned + pendingRewards;
        const unclaimedRewards = totalRewards - pos.rewardsClaimed;

        this.positions.splice(idx, 1);
        this.save();

        return {
            success: true,
            amount: pos.amount,
            token: pos.token,
            rewards: unclaimedRewards.toFixed(4),
            votesParticipated: pos.votesParticipated
        };
    },

    claimRewards(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };

        const now = Date.now();
        const daysStaked = (now - pos.startDate) / 86400000;
        const pendingRewards = pos.amount * (pos.effectiveApy / 100) * (daysStaked / 365);
        const totalRewards = pos.rewardsEarned + pendingRewards;
        const claimable = totalRewards - pos.rewardsClaimed;

        if (claimable < 0.01) {
            return { success: false, error: 'No rewards to claim' };
        }

        pos.rewardsEarned = totalRewards;
        pos.rewardsClaimed = totalRewards;
        this.save();

        return { success: true, claimed: claimable.toFixed(4), token: pos.token };
    },

    delegate(posId, delegateTo) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };

        pos.delegatedTo = delegateTo;
        this.save();

        return { success: true, delegatedTo, votingPower: pos.votingPower.toFixed(2) };
    },

    vote(posId, proposalId, choice) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };
        if (pos.delegatedTo) return { success: false, error: 'Voting power delegated' };

        const proposal = this.proposals.find(p => p.id === proposalId && p.daoId === pos.daoId);
        if (!proposal) return { success: false, error: 'Proposal not found' };
        if (proposal.status !== 'active') return { success: false, error: 'Voting ended' };

        // Record vote
        if (choice === 'for') proposal.votesFor += pos.votingPower;
        else if (choice === 'against') proposal.votesAgainst += pos.votingPower;
        else proposal.abstain += pos.votingPower;

        pos.votesParticipated++;
        this.save();

        return { success: true, votingPower: pos.votingPower.toFixed(2), choice };
    },

    calculateBoost(item, lockDays) {
        if (lockDays === 0) return 1;
        const maxLock = Math.max(...item.lockOptions);
        const lockRatio = lockDays / maxLock;
        return 1 + (item.maxBoost - 1) * lockRatio;
    },

    generateProposals() {
        this.proposals = [
            { id: 'prop-1', daoId: 'obelisk-gov', title: 'Increase staking rewards by 20%', status: 'active', votesFor: 15000000, votesAgainst: 5000000, abstain: 2000000, endDate: Date.now() + 86400000 * 3 },
            { id: 'prop-2', daoId: 'obelisk-gov', title: 'Treasury diversification proposal', status: 'active', votesFor: 8000000, votesAgainst: 12000000, abstain: 500000, endDate: Date.now() + 86400000 * 5 },
            { id: 'prop-3', daoId: 'aave-gov', title: 'Add new collateral type', status: 'active', votesFor: 3500000, votesAgainst: 1200000, abstain: 300000, endDate: Date.now() + 86400000 * 2 },
            { id: 'prop-4', daoId: 'crv-gov', title: 'Gauge weight adjustment', status: 'active', votesFor: 150000000, votesAgainst: 50000000, abstain: 10000000, endDate: Date.now() + 86400000 * 7 }
        ];
    },

    getPositionStats(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const now = Date.now();
        const daysStaked = (now - pos.startDate) / 86400000;
        const pendingRewards = pos.amount * (pos.effectiveApy / 100) * (daysStaked / 365);
        const totalRewards = pos.rewardsEarned + pendingRewards;
        const claimable = totalRewards - pos.rewardsClaimed;
        const isLocked = pos.unlockDate && now < pos.unlockDate;
        const daysRemaining = isLocked ? Math.ceil((pos.unlockDate - now) / 86400000) : 0;

        return {
            daysStaked: Math.floor(daysStaked),
            pendingRewards: claimable.toFixed(4),
            totalEarned: totalRewards.toFixed(4),
            isLocked,
            daysRemaining,
            votingPower: pos.votingPower.toFixed(2)
        };
    },

    getActiveProposals(daoId) {
        return this.proposals.filter(p => p.daoId === daoId && p.status === 'active');
    },

    getTotalVotingPower(daoId) {
        return this.positions
            .filter(p => p.daoId === daoId && !p.delegatedTo)
            .reduce((sum, p) => sum + p.votingPower, 0);
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Governance Staking</h3>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">' +
            this.items.map(item => {
                const userPower = this.getTotalVotingPower(item.id);
                return '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">' +
                    '<div><strong style="font-size:16px;">' + item.name + '</strong><br>' +
                    '<span style="color:#00ff88;font-weight:bold;">' + item.token + '</span></div>' +
                    '<div style="text-align:right;">' +
                    '<span style="color:#00ff88;font-size:20px;font-weight:bold;">' + item.baseApy + '%</span><br>' +
                    '<span style="color:#888;font-size:10px;">up to ' + (item.baseApy * item.maxBoost).toFixed(1) + '%</span>' +
                    '</div></div>' +
                    '<div style="background:rgba(0,0,0,0.2);padding:10px;border-radius:8px;margin-bottom:12px;">' +
                    '<div style="display:flex;justify-content:space-between;font-size:12px;color:#888;">' +
                    '<span>Lock Options:</span>' +
                    '<span style="color:#fff;">' + item.lockOptions.map(d => d === 0 ? 'Flexible' : d + 'd').join(', ') + '</span>' +
                    '</div>' +
                    '<div style="display:flex;justify-content:space-between;font-size:12px;color:#888;">' +
                    '<span>Max Boost:</span>' +
                    '<span style="color:#00ff88;">' + item.maxBoost + 'x</span>' +
                    '</div>' +
                    '<div style="display:flex;justify-content:space-between;font-size:12px;color:#888;">' +
                    '<span>Total Staked:</span>' +
                    '<span style="color:#fff;">' + (item.totalStaked / 1000000).toFixed(1) + 'M ' + item.token + '</span>' +
                    '</div>' +
                    '</div>' +
                    (userPower > 0 ? '<div style="background:rgba(0,255,136,0.1);padding:8px;border-radius:6px;margin-bottom:12px;text-align:center;">' +
                    '<span style="color:#888;font-size:11px;">Your Voting Power:</span> ' +
                    '<span style="color:#00ff88;font-weight:bold;">' + userPower.toFixed(2) + '</span></div>' : '') +
                    '<div style="font-size:12px;color:#888;margin-bottom:12px;">Min Stake: ' + item.minStake + ' ' + item.token + '</div>' +
                    '<button onclick="GovernanceStakingModule.quickInvest(\'' + item.id + '\')" style="padding:10px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;width:100%;">Stake ' + item.token + '</button>' +
                    '</div>';
            }).join('') +
            '</div>' +
            (this.positions.length > 0 ? this.renderPositions() : '') +
            this.renderProposals();
    },

    renderPositions() {
        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Your Governance Positions (' + this.positions.length + ')</h4>' +
            '<div style="display:grid;gap:8px;">' +
            this.positions.map(pos => {
                const stats = this.getPositionStats(pos.id);
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
                    '<div><strong>' + pos.daoName + '</strong><br>' +
                    '<span style="color:#888;font-size:12px;">' + pos.amount.toFixed(2) + ' ' + pos.token + ' | ' + pos.effectiveApy.toFixed(1) + '% APY</span></div>' +
                    '<div style="text-align:right;">' +
                    '<span style="font-size:14px;">Vote Power: <span style="color:#00ff88;font-weight:bold;">' + stats.votingPower + '</span></span><br>' +
                    '<span style="color:#888;font-size:12px;">' + pos.boostMultiplier.toFixed(2) + 'x boost</span>' +
                    '</div></div>' +
                    '<div style="display:flex;gap:16px;font-size:11px;color:#888;margin-bottom:10px;">' +
                    '<span>Staked: <span style="color:#fff;">' + stats.daysStaked + ' days</span></span>' +
                    '<span>Pending: <span style="color:#ffaa00;">' + stats.pendingRewards + ' ' + pos.token + '</span></span>' +
                    '<span>Votes: <span style="color:#fff;">' + pos.votesParticipated + '</span></span>' +
                    (stats.isLocked ? '<span style="color:#ff8800;">Locked: ' + stats.daysRemaining + ' days</span>' : '<span style="color:#00ff88;">Unlocked</span>') +
                    '</div>' +
                    '<div style="display:flex;gap:8px;">' +
                    '<button onclick="GovernanceStakingModule.quickClaim(\'' + pos.id + '\')" style="flex:1;padding:8px 12px;background:#ffaa00;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;">Claim</button>' +
                    '<button onclick="GovernanceStakingModule.quickVote(\'' + pos.id + '\')" style="flex:1;padding:8px 12px;background:#00aaff;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;">Vote</button>' +
                    (!stats.isLocked ? '<button onclick="GovernanceStakingModule.quickWithdraw(\'' + pos.id + '\')" style="padding:8px 12px;background:#ff4466;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;">Unstake</button>' : '') +
                    '</div></div>';
            }).join('') +
            '</div>';
    },

    renderProposals() {
        const activeProposals = this.proposals.filter(p => p.status === 'active');
        if (activeProposals.length === 0) return '';

        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Active Proposals</h4>' +
            '<div style="display:grid;gap:8px;">' +
            activeProposals.slice(0, 4).map(prop => {
                const totalVotes = prop.votesFor + prop.votesAgainst + prop.abstain;
                const forPct = totalVotes > 0 ? (prop.votesFor / totalVotes * 100).toFixed(1) : 0;
                const againstPct = totalVotes > 0 ? (prop.votesAgainst / totalVotes * 100).toFixed(1) : 0;
                const daysLeft = Math.ceil((prop.endDate - Date.now()) / 86400000);
                const item = this.items.find(i => i.id === prop.daoId);

                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">' +
                    '<div><strong>' + prop.title + '</strong><br>' +
                    '<span style="color:#888;font-size:11px;">' + item.name + ' | Ends in ' + daysLeft + ' days</span></div>' +
                    '</div>' +
                    '<div style="margin-bottom:8px;">' +
                    '<div style="display:flex;justify-content:space-between;font-size:11px;color:#888;margin-bottom:4px;">' +
                    '<span style="color:#00ff88;">For: ' + forPct + '%</span>' +
                    '<span style="color:#ff4466;">Against: ' + againstPct + '%</span>' +
                    '</div>' +
                    '<div style="background:rgba(255,68,102,0.3);height:8px;border-radius:4px;">' +
                    '<div style="background:#00ff88;height:100%;border-radius:4px;width:' + forPct + '%;"></div>' +
                    '</div></div></div>';
            }).join('') +
            '</div>';
    },

    quickInvest(itemId) {
        const item = this.items.find(i => i.id === itemId);
        const amount = SafeOps.promptNumber('Amount to stake (min ' + item.minStake + ' ' + item.token + '):', 0, item.minStake);
        if (!amount) return;

        const lockOptions = item.lockOptions.map(d => d === 0 ? 'Flexible (0)' : d + ' days').join(', ');
        const lockDays = SafeOps.promptNumber('Lock period in days (' + lockOptions + '):', 0, 0);
        if (lockDays === null) return;

        const result = this.invest(itemId, amount, lockDays);
        alert(result.success
            ? 'Staked ' + amount + ' ' + item.token + '! Voting power: ' + result.votingPower + ', APY: ' + result.effectiveApy + '%'
            : result.error);
        if (result.success) this.render('governance-staking-container');
    },

    quickClaim(posId) {
        const result = this.claimRewards(posId);
        alert(result.success ? 'Claimed ' + result.claimed + ' ' + result.token : result.error);
        if (result.success) this.render('governance-staking-container');
    },

    quickVote(posId) {
        const pos = this.positions.find(p => p.id === posId);
        const proposals = this.getActiveProposals(pos.daoId);
        if (proposals.length === 0) {
            alert('No active proposals for this DAO');
            return;
        }

        const proposalList = proposals.map((p, i) => (i + 1) + '. ' + p.title).join('\n');
        const choice = SafeOps.promptNumber('Select proposal:\n' + proposalList, 1, 1, proposals.length);
        if (!choice) return;

        const voteChoice = prompt('Vote: for, against, or abstain?');
        if (!voteChoice || !['for', 'against', 'abstain'].includes(voteChoice.toLowerCase())) {
            alert('Invalid vote choice');
            return;
        }

        const result = this.vote(posId, proposals[choice - 1].id, voteChoice.toLowerCase());
        alert(result.success ? 'Voted ' + result.choice + ' with ' + result.votingPower + ' voting power!' : result.error);
        this.render('governance-staking-container');
    },

    quickWithdraw(posId) {
        if (!confirm('Unstake and withdraw?')) return;
        const result = this.withdraw(posId);
        alert(result.success
            ? 'Unstaked ' + result.amount + ' ' + result.token + '! Rewards: ' + result.rewards + ' ' + result.token
            : result.error);
        this.render('governance-staking-container');
    }
};

document.addEventListener('DOMContentLoaded', () => GovernanceStakingModule.init());
