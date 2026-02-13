# Obelisk V2.1 - Fiat On-Ramp Quick Start

## Setup (5 minutes)

### 1. Backend Setup

```bash
cd obelisk-backend

# Run setup script
node setup-fiat-onramp.js

# The backend is already updated in both server.js and server-ultra.js
# Just restart the backend:
pm2 restart obelisk
# Or if not using PM2:
npm start
```

### 2. Test the Integration

```bash
# Run automated tests
node test-fiat-webhooks.js

# Should show all tests passing ✅
```

### 3. Try the Example Page

Open `obelisk-dex/fiat-onramp-example.html` in your browser:

```bash
cd obelisk-dex

# Option 1: Open directly in browser
start fiat-onramp-example.html

# Option 2: Serve with http-server
npx http-server -p 8080
# Then visit: http://localhost:8080/fiat-onramp-example.html
```

## Quick Test (No API Keys Needed)

The system works in **simulation mode** by default!

1. Open the example page
2. Click "Use Simulation Mode (Default)"
3. Click "Open Fiat On-Ramp Modal"
4. Fill in the card form:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Name: Your name
5. Click "Payer" button
6. See simulated success!

## Production Setup (When Ready)

### Get API Keys

**MoonPay** (Recommended):
1. Sign up: https://www.moonpay.com/dashboard/sign_up
2. Get sandbox keys for testing
3. Add to `.env`:
   ```env
   MOONPAY_API_KEY=pk_test_YOUR_KEY
   MOONPAY_WEBHOOK_SECRET=whsec_YOUR_SECRET
   ```

**Transak** (Alternative):
1. Sign up: https://transak.com/
2. Get staging keys for testing
3. Add to `.env`:
   ```env
   TRANSAK_API_KEY=YOUR_KEY
   TRANSAK_WEBHOOK_SECRET=YOUR_SECRET
   ```

### Configure in Frontend

```javascript
// In your main app initialization
FiatOnRamp.configure({
    moonpayApiKey: 'pk_test_...',  // From .env
    provider: 'moonpay',
    moonpayLive: false  // true for production
});
```

## Integration into Main Obelisk App

### Simple Integration (3 lines)

```html
<!-- 1. Include the module -->
<script src="js/products/fiat-onramp.js"></script>

<script>
// 2. Configure on page load
FiatOnRamp.configure({ provider: 'simulation' });

// 3. Add button anywhere
</script>

<button onclick="FiatOnRamp.showModal()">💳 Add Funds</button>
```

### With Callback

```javascript
// Register callback for completed payments
FiatOnRamp.onPaymentComplete((result) => {
    console.log('Payment completed!', result);
    // Refresh user balance
    refreshBalance();
    // Show notification
    showNotification('Funds added successfully!');
});
```

## File Structure

```
obelisk/
├── obelisk-backend/
│   ├── fiat-webhooks.js          ✨ NEW - Webhook handler
│   ├── server.js                 ✅ UPDATED - Added fiat routes
│   ├── server-ultra.js           ✅ UPDATED - Added fiat routes
│   ├── setup-fiat-onramp.js      ✨ NEW - Setup script
│   ├── test-fiat-webhooks.js     ✨ NEW - Test script
│   └── data/
│       └── fiat_transactions.json ✨ NEW - Transaction storage
│
├── obelisk-dex/
│   ├── js/products/
│   │   └── fiat-onramp.js        ✅ UPDATED - Added providers
│   └── fiat-onramp-example.html  ✨ NEW - Test page
│
└── Documentation/
    ├── FIAT_ONRAMP_README.md     ✨ NEW - Full documentation
    ├── INTEGRATION_GUIDE.md      ✨ NEW - Integration guide
    ├── PHASE5_SUMMARY.md         ✨ NEW - Implementation summary
    └── QUICK_START.md            ✨ NEW - This file
```

## API Endpoints

Once backend is running on port 3001:

```bash
# Get transactions
curl http://localhost:3001/api/fiat/transactions

# Get statistics
curl http://localhost:3001/api/fiat/stats

# Simulate MoonPay webhook
curl -X POST http://localhost:3001/api/webhooks/moonpay \
  -H "Content-Type: application/json" \
  -d '{"id":"test_123","type":"transactionCompleted","status":"completed",...}'
```

## Common Issues

### Backend Returns 404 for /api/fiat/*

**Solution**: Make sure you're running the updated server:
```bash
cd obelisk-backend
pm2 restart obelisk
# Or
npm start
```

The integration is in **both** `server.js` and `server-ultra.js`.

### Widget Won't Open

**Solution**: Check if API key is configured:
```javascript
const status = FiatOnRamp.getProviderStatus();
console.log(status);
// Should show: { configured: true, ... }
```

### Simulation Works, But Providers Don't

**Solution**: This is normal! Providers need:
1. Valid API keys in `.env`
2. Wallet address set: `ObeliskApp.state.account = '0x...'`
3. Configuration: `FiatOnRamp.configure({ moonpayApiKey: '...' })`

## Next Steps

1. ✅ Test simulation mode
2. ✅ Get sandbox/staging API keys
3. ✅ Test with real providers (sandbox)
4. ✅ Integrate into main Obelisk UI
5. ✅ Get production API keys
6. ✅ Deploy to production

## Documentation

- **Full Docs**: `FIAT_ONRAMP_README.md`
- **Integration**: `INTEGRATION_GUIDE.md`
- **Summary**: `PHASE5_SUMMARY.md`

## Support

Having issues? Check:

1. Backend logs: `pm2 logs obelisk`
2. Browser console: F12 > Console
3. Test script: `node test-fiat-webhooks.js`
4. Documentation: Read the full `FIAT_ONRAMP_README.md`

---

**Status**: ✅ Phase 5 Complete
**Version**: Obelisk V2.1
**Date**: January 27, 2026
