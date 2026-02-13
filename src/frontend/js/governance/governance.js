const Governance = {
    proposals: [],
    userVotes: {},
    apiBase: '/api/governance',

    async init() {
        this.loadLocal();
        this.loadLocalVotes();
        await this.fetchProposals();
        console.log('[Governance] Initialized');
    },

    // Fetch proposals from backend
    async fetchProposals() {
        try {
            const res = await fetch(this.apiBase + '/proposals');
            if (res.ok) {
                this.proposals = await res.json();
                this.saveLocal();
                console.log('[Governance] Fetched', this.proposals.length, 'proposals');
            }
        } catch(e) {
            console.warn('[Governance] Backend unavailable, using local cache');
        }
    },

    // Create new proposal
    async createProposal(title, description, options = ['Yes', 'No']) {
        const proposal = {
            id: 'prop_' + Date.now(),
            title,
            description,
            options,
            votes: options.map(() => 0),
            totalVotes: 0,
            status: 'active', // active, passed, rejected, expired
            createdAt: Date.now(),
            endsAt: Date.now() + 7 * 24 * 3600 * 1000, // 7 days
            creatorAddress: this.getUserAddress()
        };

        try {
            const res = await fetch(this.apiBase + '/proposals', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(proposal)
            });
            if (res.ok) {
                const saved = await res.json();
                this.proposals.unshift(saved);
                this.saveLocal();
                console.log('[Governance] Proposal created:', saved.id);
                return saved;
            }
        } catch(e) {
            console.warn('[Governance] Backend error, storing locally');
        }

        // Fallback: local
        this.proposals.unshift(proposal);
        this.saveLocal();
        return proposal;
    },

    // Vote on a proposal
    async vote(proposalId, optionIndex) {
        // Voting power = OBL balance (or 1 if no OBL)
        const votingPower = (typeof OBLToken !== 'undefined') ?
            Math.max(1, OBLToken.userBalance + OBLToken.userStaked) : 1;

        // Prevent double voting
        if (this.userVotes[proposalId] !== undefined) {
            console.warn('[Governance] Already voted on', proposalId);
            return { error: 'Already voted' };
        }

        const userAddress = this.getUserAddress();

        try {
            const res = await fetch(this.apiBase + '/vote', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    proposalId,
                    optionIndex,
                    power: votingPower,
                    address: userAddress
                })
            });
            if (res.ok) {
                this.userVotes[proposalId] = optionIndex;
                this.saveLocalVotes();
                await this.fetchProposals(); // Refresh
                console.log('[Governance] Vote recorded:', proposalId, 'option', optionIndex, 'power', votingPower);
                return await res.json();
            }
        } catch(e) {
            console.warn('[Governance] Backend error, voting locally');
        }

        // Fallback: local
        const prop = this.proposals.find(p => p.id === proposalId);
        if (prop && prop.status === 'active') {
            prop.votes[optionIndex] += votingPower;
            prop.totalVotes += votingPower;
            this.userVotes[proposalId] = optionIndex;
            this.saveLocal();
            this.saveLocalVotes();
            console.log('[Governance] Local vote recorded');
        }
        return { success: true };
    },

    // Get voting power for current user
    getVotingPower() {
        if (typeof OBLToken !== 'undefined') {
            return Math.max(1, OBLToken.userBalance + OBLToken.userStaked);
        }
        return 1;
    },

    // Check if user has voted on a proposal
    hasVoted(proposalId) {
        return this.userVotes[proposalId] !== undefined;
    },

    // Get user's vote on a proposal
    getUserVote(proposalId) {
        return this.userVotes[proposalId];
    },

    // Get active proposals
    getActiveProposals() {
        return this.proposals.filter(p => p.status === 'active');
    },

    // Get completed proposals
    getCompletedProposals() {
        return this.proposals.filter(p => p.status !== 'active');
    },

    // Calculate vote percentages
    getVotePercentages(proposal) {
        if (proposal.totalVotes === 0) return proposal.options.map(() => 0);
        return proposal.votes.map(v => (v / proposal.totalVotes) * 100);
    },

    getUserAddress() {
        if (typeof WalletConnect !== 'undefined' && WalletConnect.account) {
            return WalletConnect.account;
        }
        return 'anonymous';
    },

    saveLocal() {
        localStorage.setItem('obelisk_governance', JSON.stringify(this.proposals));
    },

    loadLocal() {
        try {
            const data = localStorage.getItem('obelisk_governance');
            if (data) {
                this.proposals = JSON.parse(data);
            }
        } catch(e) {
            console.error('[Governance] Error loading local data:', e);
            this.proposals = [];
        }
    },

    saveLocalVotes() {
        localStorage.setItem('obelisk_votes', JSON.stringify(this.userVotes));
    },

    loadLocalVotes() {
        try {
            const data = localStorage.getItem('obelisk_votes');
            if (data) {
                this.userVotes = JSON.parse(data);
            }
        } catch(e) {
            console.error('[Governance] Error loading votes:', e);
            this.userVotes = {};
        }
    }
};

window.Governance = Governance;
