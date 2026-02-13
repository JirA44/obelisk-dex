# Obelisk V2.1 - Phase 7: Governance System

## Overview

The Governance system allows OBL token holders to participate in decision-making for the Obelisk platform through proposals and voting.

## Files Created

### Frontend
- `C:\Users\Hugop\obelisk\obelisk-dex\js\governance\governance.js` - Core governance logic
- `C:\Users\Hugop\obelisk\obelisk-dex\js\governance\governance-ui.js` - UI rendering and interaction

### Backend
- `C:\Users\Hugop\obelisk\obelisk-backend\governance-backend.js` - Express router for governance API

### Integration
- Updated `C:\Users\Hugop\obelisk\obelisk-backend\server.js` - Added governance router
- Updated `C:\Users\Hugop\obelisk\obelisk-dex\index.html` - Added governance tab and scripts
- Updated `C:\Users\Hugop\obelisk\obelisk-dex\js\core\app.js` - Added governance initialization

## Features

### Voting System
- **Voting Power**: Based on OBL token balance (liquid + staked)
- **Proposal Creation**: Requires minimum 1000 OBL
- **Voting Period**: 7 days default
- **Proposal Status**: Active, Passed, Rejected, Expired

### API Endpoints

#### GET /api/governance/proposals
Returns all proposals with current vote counts

#### POST /api/governance/proposals
Create a new proposal
```json
{
  "title": "Proposal title",
  "description": "Detailed description",
  "options": ["Yes", "No"],
  "endsAt": 1738368000000
}
```

#### POST /api/governance/vote
Cast a vote on a proposal
```json
{
  "proposalId": "prop_123",
  "optionIndex": 0,
  "power": 1500,
  "address": "0x..."
}
```

#### GET /api/governance/stats
Get governance statistics (total proposals, active count, etc.)

#### GET /api/governance/proposal/:id
Get details of a specific proposal

## Frontend Usage

### JavaScript API

```javascript
// Initialize governance
await Governance.init();
GovernanceUI.init('governance-section');

// Create a proposal
const proposal = await Governance.createProposal(
  'Reduce trading fees',
  'Proposal to reduce trading fees from 0.3% to 0.2%',
  ['Yes', 'No']
);

// Vote on a proposal
await Governance.vote('prop_123', 0); // Vote for option 0 (Yes)

// Check voting power
const power = Governance.getVotingPower();

// Check if already voted
const hasVoted = Governance.hasVoted('prop_123');

// Get active proposals
const activeProposals = Governance.getActiveProposals();
```

### UI Components

The Governance UI automatically renders:
- Voting power display (shows OBL balance)
- Active proposals with progress bars
- Completed proposals with results
- Vote buttons (disabled after voting)
- Create proposal modal

## Data Storage

### Backend
- Data persisted to `C:\Users\Hugop\obelisk\obelisk-backend\data\governance.json`
- Automatic expiry checking every 5 minutes

### Frontend
- Proposals cached in `localStorage` as `obelisk_governance`
- User votes cached as `obelisk_votes`
- Offline-first architecture with backend sync

## Security Features

1. **Double-Vote Prevention**: Users can only vote once per proposal
2. **Voting Power Cap**: Maximum 1,000,000 OBL per vote to prevent abuse
3. **Address Tracking**: Votes tied to wallet address or IP
4. **Minimum Balance**: 1000 OBL required to create proposals
5. **Status Validation**: Only active proposals accept votes

## Testing

### Start Backend
```bash
cd C:\Users\Hugop\obelisk\obelisk-backend
pm2 restart obelisk
```

### Deploy Frontend
```bash
cd C:\Users\Hugop\obelisk\obelisk-dex
npx wrangler pages deploy . --project-name=obelisk-dex --commit-dirty=true
```

### Test API
```bash
# Get proposals
curl http://localhost:3001/api/governance/proposals

# Get stats
curl http://localhost:3001/api/governance/stats

# Create proposal (POST)
curl -X POST http://localhost:3001/api/governance/proposals \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Proposal","description":"Testing governance"}'
```

## UI Navigation

1. Go to Obelisk DEX
2. Click **Learn** menu → **Governance**
3. View active proposals
4. Connect wallet (voting power = OBL balance)
5. Vote on proposals or create new ones

## Future Enhancements

- [ ] Proposal categories (Protocol, Treasury, Partnerships)
- [ ] Delegation system (delegate voting power)
- [ ] Quadratic voting
- [ ] Time-locked voting (require tokens to be locked)
- [ ] Proposal discussion threads
- [ ] On-chain voting (smart contract integration)
- [ ] Snapshot voting integration
- [ ] Multi-choice proposals (more than 2 options)
- [ ] Minimum quorum requirements
- [ ] Proposal deposit/bond system

## Notes

- Governance is currently in **simulation mode** (no on-chain execution)
- Votes are weighted by OBL token balance
- Proposals auto-close after 7 days
- First option winning = "Passed", otherwise "Rejected"
- Backend persists all data to JSON file
- Frontend works offline with local cache
