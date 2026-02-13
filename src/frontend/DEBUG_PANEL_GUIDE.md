# Obelisk Debug Panel - Quick Reference Guide

**Location**: `C:\Users\Hugop\obelisk\obelisk-dex\debug.html`

---

## Quick Start

1. **Open debug.html** in your browser
   - File path: `file:///C:/Users/Hugop/obelisk/obelisk-dex/debug.html`
   - Or via local server: `http://localhost:8080/debug.html`

2. **Load the main app**
   - Click "Load index.html" button
   - Wait for iframe to load (green checkmark when ready)

3. **Run tests** using the buttons in each panel

---

## Test Panels

### 💳 Transaction Test Panel (Task 31)

Tests the SimulatedPortfolio deposit/withdrawal flow.

**Buttons**:
- **Test Deposit $10** - Adds $10 to virtual balance
- **Test Withdraw $5** - Withdraws $5 (shows fees)
- **Check Balance** - Displays current portfolio state
- **Test Micro Withdraw $0.50** - Tests if $1 flat fee blocks small withdrawals

**What to look for**:
- ✅ Green "✓ Deposit successful!" messages
- ✅ Balance increases match expected amounts
- ⚠️ Fee warnings on micro withdrawals
- ❌ Red error messages (investigate if seen)

**Example Output**:
```
[21:13:45] Testing deposit of $10...
[21:13:45] Initial balance: $0.00
[21:13:45] ✓ Deposit successful! New balance: $10.00
[21:13:45] Balance increased by: $10.00
```

---

### 📈 Yield Verification Panel (Task 32)

Verifies that products earn yields correctly.

**Buttons**:
- **Trace Investment Flow** - Shows the complete flow diagram
- **Check Yield Calculation** - Validates APY formulas
- **Show Accrual Log** - Displays earnings on active investments

**What to look for**:
- ✅ "Earnings calculator is ACTIVE" message
- ✅ Correct daily/monthly/yearly return calculations
- ✅ Active investments showing earnings
- ⚠️ Warnings if calculator not running

**Example Output**:
```
[21:14:30] === CHECKING YIELD CALCULATION ===
[21:14:30] Testing product: ETH Staking (stETH)
[21:14:30] APY: 4.2%
[21:14:30] Test amount: $1000
[21:14:30] Expected daily return: $0.0115
[21:14:30] Expected monthly return (30d): $3.48
[21:14:30] Expected yearly return: $42.00
```

---

### 🧪 Product Testing Suite (Task 33)

Automated testing of all investment products.

**Buttons**:
- **Run All Product Tests** - Tests ALL products (12+ products, ~60 seconds)
- **Test Staking Only** - Tests only staking products (ETH, SOL, ARB)
- **Test Vaults Only** - Tests only vault products (4 vaults)
- **Clear Results** - Clears the test log
- **Show Summary** - Displays pass/fail statistics
- **Export Results** - Downloads JSON report

**What to look for**:
- ✅ "5/5 tests passed (100%)" for each product
- ✅ High overall pass rate (80%+)
- ⚠️ Individual test failures (investigate cause)
- ❌ Category failures (may indicate broken products)

**Example Output**:
```
[21:15:00] Starting comprehensive product tests...
[21:15:00] === Testing STAKING ===
[21:15:01] Testing eth-staking...
[21:15:02] eth-staking: 5/5 tests passed (100%)
[21:15:02] Testing sol-staking...
[21:15:03] sol-staking: 5/5 tests passed (100%)
...
[21:15:45] === TEST SUMMARY ===
[21:15:45] Total Products Tested: 12
[21:15:45] Passed: 12
[21:15:45] Failed: 0
[21:15:45] Pass Rate: 100.0%
```

**Each Product Tests**:
1. Investment flow
2. Portfolio update
3. Earnings calculation
4. Time progression
5. Withdrawal

---

### 🔄 Real Investment Flow Tracer (Task 34)

Documents the flow for real (non-simulated) investments.

**Buttons**:
- **Trace Real Investment Flow** - Shows 6-step flow diagram
- **Check RealTrading State** - Inspects wallet connection and Hyperliquid data

**What to look for**:
- ✅ Flow diagram shows all 6 steps clearly
- ✅ "Connected: YES" if wallet is connected
- ✅ Hyperliquid balance if account exists
- ⚠️ "Not connected" warnings (normal if no wallet)

**Example Output**:
```
[21:16:00] === REAL INVESTMENT FLOW DIAGRAM ===
[21:16:00] [1] User connects wallet
[21:16:00]     → MetaMask/WalletConnect popup
[21:16:00]     → User approves connection
[21:16:00]     → Address stored in RealTrading.address
[21:16:00] [2] User clicks "Invest with Real Funds"
...
[21:16:00] [6] UI update
[21:16:00]     → WebSocket receives update
[21:16:00]     → Portfolio refreshes automatically
[21:16:00]     → User sees new investment
```

---

## Color Coding

- **🟢 Green (#00ff88)** - Success, OK, passed tests
- **🔵 Blue (#00aaff)** - Info, neutral messages
- **🟡 Orange (#ffaa00)** - Warnings, potential issues
- **🔴 Red (#ff4466)** - Errors, failed tests

---

## Common Issues & Solutions

### "ERROR: SimulatedPortfolio not accessible"
**Solution**: Click "Load index.html" button first

### "ERROR: ProductTester not loaded in iframe"
**Solution**: Ensure index.html has loaded completely (wait 2-3 seconds)

### "WARNING: Earnings calculator may not be running"
**Solution**: Check if any investments are active. Calculator starts when first investment is made.

### "Fee applied: $1.00" on micro withdrawal
**Solution**: This is expected behavior. Flat fees may block very small withdrawals.

### Tests fail with "Investment not found"
**Solution**: Ensure sufficient balance before testing. Use "Test Deposit $10" first.

---

## Test Workflow Examples

### Basic Flow Test
1. Click "Load index.html"
2. Click "Test Deposit $10"
3. Click "Check Balance" (should show $10.00)
4. Click "Test Withdraw $5"
5. Click "Check Balance" (should show ~$4.00-$4.50 after fees)

### Yield Verification Flow
1. Click "Load index.html"
2. Click "Trace Investment Flow" (see the flow diagram)
3. Click "Check Yield Calculation" (verify formulas)
4. Go to main app and create an investment
5. Click "Show Accrual Log" (see your investment earnings)

### Comprehensive Product Test
1. Click "Load index.html"
2. Wait 3 seconds for app to initialize
3. Click "Run All Product Tests"
4. Wait 60 seconds for all tests to complete
5. Click "Show Summary" (see statistics)
6. Click "Export Results" (download JSON report)

### Real Trading Inspection
1. Click "Load index.html"
2. Connect wallet in main app (if available)
3. Click "Check RealTrading State" (see connection status)
4. Click "Trace Real Investment Flow" (see flow diagram)

---

## Exporting Test Results

**Format**: JSON
**Contents**:
- Test results for each product
- Pass/fail status for each of 5 tests
- Timestamps
- Error messages (if any)

**Example Export**:
```json
[
  {
    "productId": "eth-staking",
    "category": "staking",
    "timestamp": 1738012345678,
    "tests": {
      "investment": { "success": true, ... },
      "portfolioUpdate": { "success": true, ... },
      "earnings": { "success": true, ... },
      "timeProgression": { "success": true, ... },
      "withdrawal": { "success": true, ... }
    },
    "passed": 5,
    "failed": 0,
    "errors": []
  },
  ...
]
```

---

## Advanced Usage

### Testing Specific Product
Open browser console while on debug.html:
```javascript
const tester = document.getElementById('preview').contentWindow.ProductTester;
await tester.testProductById('eth-staking');
```

### Manual Balance Check
```javascript
const portfolio = document.getElementById('preview').contentWindow.SimulatedPortfolio;
console.log(portfolio.getBalance());
```

### Check Specific Investment
```javascript
const portfolio = document.getElementById('preview').contentWindow.SimulatedPortfolio;
console.log(portfolio.portfolio.investments);
```

---

## Keyboard Shortcuts

Currently in debug.html:
- (None - all interactions via buttons)

In main app (index.html):
- **S** - Open Investment Simulator
- **ESC** - Close Investment Simulator

---

## Panel Limitations

1. **Requires iframe** - Tests operate on iframe-loaded index.html
2. **No auto-refresh** - Reload page to reset state
3. **Local storage** - Tests may affect localStorage data
4. **Simulated only** - Transaction tests use virtual balance
5. **Real trading** - Requires actual wallet connection

---

## Tips

- Always click "Load index.html" before running tests
- Wait 2-3 seconds after loading before running tests
- Use "Clear Results" to declutter the test log
- Export results before closing browser (data is lost on reload)
- Run "Check Balance" between transaction tests to verify state

---

## Support

For issues or bugs:
1. Check browser console for errors (F12)
2. Verify all script files are loaded
3. Test in different browser (Chrome, Firefox, Edge)
4. Check OBELISK_V2.1_PHASE1_COMPLETE.md for details

---

*Last Updated: 2026-01-27*
*Version: 2.1 Phase 1*
