# OBL Token - Phase 6 Implementation

## Overview

The OBL (Obelisk Token) is the native token of the Obelisk DEX platform. This implementation includes:

- **Token Economics**: 100M total supply with strategic distribution
- **Staking System**: Earn APY rewards with multiple lock periods
- **Fee Discounts**: Tiered discount system based on OBL holdings
- **Price Tracking**: Real-time price simulation with historical data
- **Backend API**: Full REST API for token data and operations

## Files Created

### 1. Frontend Module
**Location**: `C:\Users\Hugop\obelisk\obelisk-dex\js\products\obl-token.js`

Main OBL Token module with:
- Token information and tokenomics
- Staking operations (stake/unstake)
- Fee discount calculation
- UI rendering (dashboard, charts, cards)
- State persistence (localStorage)
- Backend synchronization

### 2. Backend API
**Location**: `C:\Users\Hugop\obelisk\obelisk-backend\obl-token-tracker.js`

Express router providing:
- `/api/obl/info` - Comprehensive token information
- `/api/obl/price` - Current price
- `/api/obl/price-history` - Historical price data
- `/api/obl/stake` - Update staking stats
- `/api/obl/unstake` - Handle unstake events
- `/api/obl/staking-stats` - Global staking statistics
- `/api/obl/distribution` - Token distribution data
- `/api/obl/stats` - Complete dashboard statistics

### 3. Fee Config Integration
**Location**: `C:\Users\Hugop\obelisk\obelisk-dex\js\products\fee-config.js` (modified)

Added methods:
- `getOBLDiscount()` - Get user's OBL discount percentage
- `calculateFeeWithOBL()` - Calculate fees with OBL discount applied
- `getFeeDisplayTextWithOBL()` - Display text with discount info

### 4. Demo Page
**Location**: `C:\Users\Hugop\obelisk\obelisk-dex\obl-token-demo.html`

Interactive demo showing:
- Full OBL token dashboard
- Testing controls (add balance, calculate fees)
- Backend connection status
- Live staking interface

## Token Economics

### Distribution (100M Total Supply)

| Allocation | Percentage | Amount | Vesting |
|------------|-----------|--------|---------|
| Community | 40% | 40M OBL | Rewards & staking |
| Treasury | 20% | 20M OBL | DAO controlled |
| Liquidity | 15% | 15M OBL | DEX pools |
| Team | 15% | 15M OBL | 2-year vesting |
| Investors | 10% | 10M OBL | 1-year cliff |

### Staking System

**Base APY**: 12%

**Lock Periods & Multipliers**:
- 30 days: 1.0x multiplier → 12% APY
- 90 days: 1.5x multiplier → 18% APY
- 180 days: 2.0x multiplier → 24% APY
- 365 days: 3.0x multiplier → 36% APY

**Minimum Stake**: 100 OBL

### Fee Discount Tiers

| Tier | Min OBL | Discount | Color |
|------|---------|----------|-------|
| Bronze | 100 | 10% | #CD7F32 |
| Silver | 1,000 | 25% | #C0C0C0 |
| Gold | 10,000 | 50% | #FFD700 |
| Platinum | 100,000 | 75% | #E5E4E2 |

## API Documentation

### Get Token Info
```bash
GET http://localhost:3001/api/obl/info
```

Response:
```json
{
  "success": true,
  "token": {
    "name": "Obelisk Token",
    "symbol": "OBL",
    "decimals": 18,
    "totalSupply": 100000000,
    "circulatingSupply": 0,
    "contract": null,
    "chain": "arbitrum",
    "chainId": 42161
  },
  "price": 0.10,
  "marketCap": 10000000,
  "volume24h": 250000,
  "totalStaked": 0,
  "totalStakers": 0,
  "stakingAPY": 12.0,
  "launched": false
}
```

### Get Current Price
```bash
GET http://localhost:3001/api/obl/price
```

### Get Price History
```bash
GET http://localhost:3001/api/obl/price-history?limit=100&from=1706400000000
```

### Update Staking Stats
```bash
POST http://localhost:3001/api/obl/stake
Content-Type: application/json

{
  "totalStaked": 1000000,
  "totalStakers": 150
}
```

### Get Staking Statistics
```bash
GET http://localhost:3001/api/obl/staking-stats
```

Response:
```json
{
  "success": true,
  "totalStaked": 1000000,
  "totalStakers": 150,
  "stakingAPY": 12.0,
  "stakingRatio": 0.01,
  "stakingRatioPercent": "1.00%",
  "totalRewardsPerDay": 328.77,
  "avgStakePerStaker": 6666.67
}
```

## Frontend Usage

### Initialize OBL Token

```javascript
// Auto-initialized on page load
// Access via window.OBLToken

// Check if loaded
if (typeof OBLToken !== 'undefined') {
    console.log('OBL Token loaded');
}
```

### Check Fee Discount

```javascript
// Get user's discount percentage
const discount = OBLToken.getFeeDiscount(OBLToken.userBalance);
console.log(`Discount: ${(discount * 100).toFixed(0)}%`);

// Get current tier
const tier = OBLToken.getCurrentTier();
if (tier) {
    console.log(`Tier: ${tier.label}`);
}
```

### Stake OBL

```javascript
// Stake 1000 OBL for 90 days
const result = OBLToken.stake(1000, 90);

if (result.success) {
    console.log('Staked successfully!');
    console.log('Stake ID:', result.stake.id);
} else {
    console.error('Error:', result.error);
}
```

### Unstake OBL

```javascript
// Unstake by stake ID
const result = OBLToken.unstake(stakeId);

if (result.success) {
    console.log(`Received ${result.total} OBL`);
    console.log(`Principal: ${result.amount}`);
    console.log(`Rewards: ${result.rewards}`);
} else {
    console.error('Error:', result.error);
}
```

### Calculate Fees with OBL Discount

```javascript
// Calculate fee for $1000 transaction
const fee = FeeConfig.calculateFeeWithOBL(1000);

console.log(`Fee: $${fee.feeAmount.toFixed(4)}`);
console.log(`OBL Discount: ${fee.oblDiscountPercent}`);
console.log(`Saved: $${fee.savedAmount.toFixed(4)}`);

if (fee.oblTier) {
    console.log(`Tier: ${fee.oblTier.label}`);
}
```

### Render Dashboard

```javascript
// Render full dashboard to a container
OBLToken.renderDashboard('container-id');

// Render compact token card
const cardHtml = OBLToken.renderTokenCard();
document.getElementById('sidebar').innerHTML = cardHtml;
```

## Testing

### 1. Start Backend Server

```bash
cd C:\Users\Hugop\obelisk\obelisk-backend
pm2 restart obelisk
# OR
node server.js
```

Verify server is running on `http://localhost:3001`

### 2. Open Demo Page

```bash
# Using Python HTTP server
cd C:\Users\Hugop\obelisk\obelisk-dex
python -m http.server 8080
```

Open `http://localhost:8080/obl-token-demo.html`

### 3. Test Features

1. **Check Status**: Verify all modules loaded (green checkmarks)
2. **Add Balance**: Click "Add Test Balance" to add 1000 OBL
3. **View Dashboard**: Dashboard should show your balance and tier
4. **Stake Tokens**: Enter amount and lock period, click "Stake OBL"
5. **Calculate Fees**: Test fee calculation with OBL discount
6. **Unstake**: Wait for lock period to end, then unstake

### 4. Testing with Console

Open browser console (F12) and try:

```javascript
// Add test balance
OBLToken.addBalance(10000);

// Check fee discount
const discount = OBLToken.getFeeDiscount(OBLToken.userBalance);
console.log('Discount:', discount);

// Calculate fee
const fee = FeeConfig.calculateFeeWithOBL(5000);
console.log('Fee details:', fee);

// Stake tokens
const stake = OBLToken.stake(5000, 90);
console.log('Stake result:', stake);

// Check rewards
const rewards = OBLToken.getStakingRewards();
console.log('Pending rewards:', rewards);
```

## Data Persistence

### Frontend (localStorage)
- Key: `obl_token_state`
- Stores: user balance, staked amount, active stakes

### Backend (JSON file)
- File: `C:\Users\Hugop\obelisk\obelisk-backend\data\obl_token.json`
- Stores: price, market data, global staking stats
- Auto-backup: Hourly (last 24 backups kept)

## Price Simulation

The backend simulates realistic price movement:
- Updates every 60 seconds
- Random fluctuation: -0.5% to +0.7% (slight upward bias)
- Minimum price: $0.01
- Starting price: $0.10
- Price history: Last 1000 data points (~16 hours)

## Integration with Obelisk DEX

The OBL token integrates seamlessly with the existing Obelisk DEX platform:

1. **Fee Discounts**: Automatically applied to all trading fees
2. **Staking Rewards**: Distributed from community allocation
3. **Governance**: Future DAO integration (planned)
4. **Liquidity Mining**: Earn OBL by providing liquidity (planned)

## Future Enhancements

### Smart Contract Deployment
- Deploy ERC-20 contract on Arbitrum
- Update `token.contract` address
- Connect wallet for real transactions

### Advanced Features
- DAO governance voting
- NFT staking (boost multipliers)
- Liquidity mining rewards
- Cross-chain bridge
- Referral program

### UI Improvements
- Real-time price charts (Chart.js/D3.js)
- Transaction history
- Leaderboard (top stakers)
- Mobile responsive design

## Troubleshooting

### Backend Not Connecting
```bash
# Check if server is running
pm2 status

# Check logs
pm2 logs obelisk

# Restart server
pm2 restart obelisk
```

### OBL Module Not Loading
- Verify `obl-token.js` is in correct path
- Check browser console for errors
- Ensure FeeConfig is loaded first

### State Not Persisting
- Check localStorage is enabled
- Clear cache and reload: `Ctrl+Shift+R`
- Check backend file permissions

### Staking Issues
- Verify minimum stake amount (100 OBL)
- Check sufficient balance
- Ensure valid lock period selected

## File Structure

```
C:\Users\Hugop\obelisk\
├── obelisk-dex\
│   ├── js\
│   │   └── products\
│   │       ├── obl-token.js          (NEW)
│   │       └── fee-config.js         (MODIFIED)
│   └── obl-token-demo.html           (NEW)
│
└── obelisk-backend\
    ├── obl-token-tracker.js          (NEW)
    ├── server.js                     (MODIFIED)
    └── data\
        ├── obl_token.json            (AUTO-CREATED)
        └── backups\                  (AUTO-CREATED)
            └── obl_token_*.json      (HOURLY BACKUPS)
```

## Deployment

### Production Checklist

- [ ] Deploy smart contract on Arbitrum
- [ ] Update `token.contract` address
- [ ] Configure production backend URL
- [ ] Enable HTTPS/WSS
- [ ] Set up monitoring (Sentry)
- [ ] Configure rate limiting
- [ ] Add authentication for admin endpoints
- [ ] Set up database (PostgreSQL)
- [ ] Enable CORS for production domain
- [ ] Configure CDN for static assets

### Environment Variables

```bash
# Backend (.env)
OBL_INITIAL_PRICE=0.10
OBL_CONTRACT_ADDRESS=0x...
OBL_CHAIN_ID=42161
OBL_ENABLE_PRICE_SIMULATION=true
OBL_BACKUP_INTERVAL=3600000
```

## Support

For issues or questions:
- GitHub: [anthropics/claude-code/issues](https://github.com/anthropics/claude-code/issues)
- Documentation: See `CLAUDE.md` for project structure

---

**Status**: ✅ Phase 6 Complete - OBL Token Implemented

**Version**: V2.1.0

**Date**: 2026-01-27
