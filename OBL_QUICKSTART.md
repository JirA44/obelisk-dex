# OBL Token - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Start the Backend (30 seconds)

```bash
cd C:\Users\Hugop\obelisk\obelisk-backend
pm2 restart obelisk
```

**OR** if not using PM2:
```bash
node server.js
```

Expected output:
```
╔═══════════════════════════════════════════════════╗
║           OBELISK Backend Server v1.0             ║
╠═══════════════════════════════════════════════════╣
║  REST API:    http://localhost:3001              ║
║  WebSocket:   ws://localhost:3001                ║
╚═══════════════════════════════════════════════════╝

[OBL Token Tracker] Initialized
[OBL Token] Current Price: $0.1000
```

### Step 2: Open Demo Page (30 seconds)

```bash
cd C:\Users\Hugop\obelisk\obelisk-dex
python -m http.server 8080
```

Open browser: `http://localhost:8080/obl-token-demo.html`

### Step 3: Test Features (2 minutes)

#### 3.1 Check Status
Look for green checkmarks:
- ✓ Backend: Connected
- ✓ OBL Module: Loaded
- ✓ Fee Config: Loaded

#### 3.2 Add Test Balance
1. Enter amount: `10000`
2. Click "Add Test Balance"
3. See your balance update in dashboard

#### 3.3 Check Fee Discount
1. Enter transaction amount: `5000`
2. Click "Calculate Fee with OBL Discount"
3. See fee comparison with/without OBL

Your tier: **Gold** (50% discount)
- Without OBL: $10.00 fee
- With OBL: $5.00 fee
- **You save: $5.00!**

#### 3.4 Stake Tokens
1. Enter amount: `5000`
2. Select lock period: `90 days (1.5x - 18% APY)`
3. Click "Stake OBL"
4. See active stake appear below

#### 3.5 Watch Rewards Grow
- Rewards accumulate in real-time
- Unstake button appears when lock period ends
- Can have multiple active stakes

---

## 🧪 Quick API Test

### Test All Endpoints
```bash
node C:\Users\Hugop\obelisk\test_obl_integration.js
```

Expected: All tests pass with ✓ SUCCESS

### Test Individual Endpoint
```bash
curl http://localhost:3001/api/obl/info
```

Expected:
```json
{
  "success": true,
  "token": {
    "name": "Obelisk Token",
    "symbol": "OBL",
    "price": 0.10,
    ...
  }
}
```

---

## 🎮 Browser Console Tests

Open browser console (F12) on demo page:

```javascript
// 1. Check module loaded
OBLToken
// Should show object with all properties

// 2. Add balance
OBLToken.addBalance(50000);
// Balance: 50,000 OBL → Platinum tier (75% discount)

// 3. Check fee discount
FeeConfig.calculateFeeWithOBL(10000);
// Shows fee with 75% discount

// 4. Stake tokens
OBLToken.stake(20000, 365);
// 1 year lock → 3x multiplier → 36% APY

// 5. Check rewards
OBLToken.getStakingRewards();
// Shows accumulated rewards

// 6. Get current tier
OBLToken.getCurrentTier();
// Shows: { label: 'Platinum', discount: 0.75, ... }
```

---

## 📊 Tier Progression Example

### Start: 0 OBL
- Tier: None
- Discount: 0%
- Fee on $1000: $2.00

### Add 100 OBL (Bronze)
```javascript
OBLToken.addBalance(100);
```
- Tier: Bronze 🥉
- Discount: 10%
- Fee on $1000: $1.80
- **Saved: $0.20**

### Add 900 OBL → 1000 total (Silver)
```javascript
OBLToken.addBalance(900);
```
- Tier: Silver 🥈
- Discount: 25%
- Fee on $1000: $1.50
- **Saved: $0.50**

### Add 9000 OBL → 10,000 total (Gold)
```javascript
OBLToken.addBalance(9000);
```
- Tier: Gold 🥇
- Discount: 50%
- Fee on $1000: $1.00
- **Saved: $1.00**

### Add 90,000 OBL → 100,000 total (Platinum)
```javascript
OBLToken.addBalance(90000);
```
- Tier: Platinum 💎
- Discount: 75%
- Fee on $1000: $0.50
- **Saved: $1.50**

---

## 💰 Staking ROI Calculator

### Example: Stake 10,000 OBL

| Lock Period | Multiplier | APY | 1 Year Rewards |
|-------------|-----------|-----|----------------|
| 30 days | 1.0x | 12% | 1,200 OBL |
| 90 days | 1.5x | 18% | 1,800 OBL |
| 180 days | 2.0x | 24% | 2,400 OBL |
| 365 days | 3.0x | 36% | 3,600 OBL |

**Best strategy**: 365-day lock for 3x rewards!

At $0.10/OBL:
- 10,000 OBL stake = $1,000
- 3,600 OBL rewards/year = $360
- **36% APY!**

---

## 🎯 Common Use Cases

### 1. Reduce Trading Fees
**Goal**: Pay less fees on trades

**Solution**:
1. Buy/earn 10,000 OBL
2. Hold in wallet (no staking required)
3. Get Gold tier → 50% fee discount
4. Trade freely with half the fees!

### 2. Maximize Staking Returns
**Goal**: Earn maximum APY

**Solution**:
1. Acquire 100,000+ OBL
2. Stake for 365 days
3. Get 36% APY + 75% fee discount
4. Compound rewards by re-staking

### 3. Balance Liquidity & Rewards
**Goal**: Earn rewards but keep some liquid

**Solution**:
1. Stake 50% for 365 days (max APY)
2. Stake 25% for 90 days (medium)
3. Keep 25% unstaked (fee discount + liquid)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port is free
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <PID> /F

# Restart
node server.js
```

### Demo page shows errors
1. Check browser console (F12)
2. Verify backend is running: `http://localhost:3001/api/obl/info`
3. Hard refresh: `Ctrl+Shift+R`
4. Clear localStorage: `localStorage.clear()`

### Modules not loading
1. Check file paths are correct
2. Verify files exist:
   - `js/products/obl-token.js`
   - `js/products/fee-config.js`
3. Check for JavaScript errors in console

### State not saving
1. Check localStorage is enabled
2. Try manual save: `OBLToken.saveState()`
3. Check browser storage: DevTools → Application → Local Storage

---

## 📱 Integration Example

### Add to Your HTML

```html
<!-- Load modules -->
<script src="js/products/fee-config.js"></script>
<script src="js/products/obl-token.js"></script>

<!-- Show token card in sidebar -->
<div id="sidebar">
    <script>
        document.getElementById('sidebar').innerHTML = OBLToken.renderTokenCard();
    </script>
</div>

<!-- Show full dashboard on dedicated page -->
<div id="token-page">
    <script>
        OBLToken.renderDashboard('token-page');
    </script>
</div>
```

### Calculate Fees with Discount

```javascript
// Before transaction
const amount = 1000; // $1000 trade
const fee = FeeConfig.calculateFeeWithOBL(amount);

// Show user
alert(`
Transaction: $${amount}
Fee: $${fee.feeAmount.toFixed(2)} (${fee.displayPercent})
${fee.oblDiscount > 0 ?
  `OBL Discount: ${fee.oblDiscountPercent} - You save $${fee.savedAmount.toFixed(2)}!` :
  'Hold OBL to reduce fees!'
}
You receive: $${fee.netAmount.toFixed(2)}
`);
```

---

## 🎓 Next Steps

1. ✅ **Complete Quick Start** (you're here!)
2. 📖 **Read Full Docs**: `OBL_TOKEN_README.md`
3. 🔍 **Review Code**: `js/products/obl-token.js`
4. 🧪 **Run Tests**: `test_obl_integration.js`
5. 🎨 **Customize UI**: Edit demo page
6. 🚀 **Deploy**: Follow deployment checklist

---

## 📞 Need Help?

- **Full Documentation**: `OBL_TOKEN_README.md`
- **Implementation Summary**: `OBL_IMPLEMENTATION_SUMMARY.md`
- **Project Docs**: `CLAUDE.md`
- **Backend API**: http://localhost:3001/api/obl/info

---

## ⚡ Quick Commands Cheat Sheet

```bash
# Backend
pm2 restart obelisk          # Restart server
pm2 logs obelisk             # View logs
node server.js               # Run directly

# Frontend
python -m http.server 8080   # Serve files

# Testing
node test_obl_integration.js # Test API
curl localhost:3001/api/obl/info  # Quick check

# Browser Console
OBLToken.addBalance(1000)    # Add test balance
OBLToken.stake(500, 90)      # Stake tokens
FeeConfig.calculateFeeWithOBL(1000)  # Calculate fee
```

---

**Ready to go! 🚀**

Start with Step 1 and you'll have OBL Token running in 3 minutes!
