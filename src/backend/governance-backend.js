const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, 'data', 'governance.json');

let proposals = [];
let votes = {}; // { proposalId: { address: optionIndex } }

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
            proposals = data.proposals || [];
            votes = data.votes || {};
            console.log('[Governance Backend] Loaded', proposals.length, 'proposals');
        } else {
            proposals = [];
            votes = {};
            console.log('[Governance Backend] No data file found, starting fresh');
        }
    } catch(e) {
        console.error('[Governance Backend] Error loading data:', e);
        proposals = [];
        votes = {};
    }
}

function saveData() {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify({ proposals, votes }, null, 2));
        console.log('[Governance Backend] Data saved');
    } catch(e) {
        console.error('[Governance Backend] Error saving data:', e);
    }
}

// Check and update expired proposals
function checkExpired() {
    const now = Date.now();
    let updated = false;

    proposals.forEach(p => {
        if (p.status === 'active' && p.endsAt < now) {
            // Determine result
            const maxVotes = Math.max(...p.votes);
            const winnerIdx = p.votes.indexOf(maxVotes);

            // Mark as passed if first option (usually "Yes") wins, otherwise rejected
            p.status = winnerIdx === 0 && maxVotes > 0 ? 'passed' : 'rejected';
            p.result = p.options[winnerIdx];
            p.endedAt = now;
            updated = true;
            console.log('[Governance Backend] Proposal', p.id, 'ended:', p.status);
        }
    });

    if (updated) {
        saveData();
    }
}

// GET /api/governance/proposals
router.get('/proposals', (req, res) => {
    checkExpired();
    res.json(proposals);
});

// POST /api/governance/proposals
router.post('/proposals', (req, res) => {
    const { title, description, options, creatorAddress, endsAt } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description required' });
    }

    const proposal = {
        id: 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: title.trim().substring(0, 200), // Max 200 chars
        description: description.trim().substring(0, 1000), // Max 1000 chars
        options: options || ['Yes', 'No'],
        votes: (options || ['Yes', 'No']).map(() => 0),
        totalVotes: 0,
        status: 'active',
        createdAt: Date.now(),
        endsAt: endsAt || (Date.now() + 7 * 86400000), // Default 7 days
        creatorAddress: creatorAddress || 'anonymous'
    };

    proposals.unshift(proposal);
    saveData();

    console.log('[Governance Backend] New proposal created:', proposal.id);
    res.json(proposal);
});

// POST /api/governance/vote
router.post('/vote', (req, res) => {
    const { proposalId, optionIndex, power, address } = req.body;

    // Find proposal
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
    }

    // Check if voting is still active
    if (proposal.status !== 'active') {
        return res.status(400).json({ error: 'Voting has ended' });
    }

    if (Date.now() > proposal.endsAt) {
        proposal.status = 'expired';
        saveData();
        return res.status(400).json({ error: 'Voting period has expired' });
    }

    // Check valid option
    if (optionIndex < 0 || optionIndex >= proposal.options.length) {
        return res.status(400).json({ error: 'Invalid option index' });
    }

    // Determine voter address (use IP as fallback)
    const voterAddr = address || req.ip || req.connection.remoteAddress || 'unknown';

    // Initialize votes object for this proposal if needed
    if (!votes[proposalId]) {
        votes[proposalId] = {};
    }

    // Check if already voted
    if (votes[proposalId][voterAddr] !== undefined) {
        return res.status(400).json({ error: 'Already voted on this proposal' });
    }

    // Cap voting power to prevent abuse
    const votePower = Math.min(Math.max(1, power || 1), 1000000);

    // Record vote
    proposal.votes[optionIndex] = (proposal.votes[optionIndex] || 0) + votePower;
    proposal.totalVotes += votePower;
    votes[proposalId][voterAddr] = optionIndex;

    saveData();

    console.log('[Governance Backend] Vote recorded:', proposalId, 'option', optionIndex, 'power', votePower);
    res.json({ success: true, proposal });
});

// DELETE /api/governance/proposals/:id (admin only - for testing)
router.delete('/proposals/:id', (req, res) => {
    const { id } = req.params;
    const index = proposals.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Proposal not found' });
    }

    proposals.splice(index, 1);
    delete votes[id];
    saveData();

    console.log('[Governance Backend] Proposal deleted:', id);
    res.json({ success: true });
});

// GET /api/governance/stats
router.get('/stats', (req, res) => {
    checkExpired();

    const stats = {
        totalProposals: proposals.length,
        activeProposals: proposals.filter(p => p.status === 'active').length,
        passedProposals: proposals.filter(p => p.status === 'passed').length,
        rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
        totalVotes: proposals.reduce((sum, p) => sum + p.totalVotes, 0),
        uniqueVoters: Object.keys(votes).reduce((sum, propId) => {
            return sum + Object.keys(votes[propId]).length;
        }, 0)
    };

    res.json(stats);
});

// GET /api/governance/proposal/:id
router.get('/proposal/:id', (req, res) => {
    const { id } = req.params;
    const proposal = proposals.find(p => p.id === id);

    if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
    }

    checkExpired();
    res.json(proposal);
});

// Initialize
loadData();

// Check for expired proposals every 5 minutes
setInterval(() => {
    checkExpired();
}, 300000);

console.log('[Governance Backend] Router initialized');

module.exports = router;
