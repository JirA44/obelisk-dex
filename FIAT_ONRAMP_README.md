# Obelisk V2.1 - Fiat On-Ramp Integration

## Overview

Phase 5 implementation adds **MoonPay** and **Transak** integration for fiat-to-crypto purchases directly within Obelisk. Users can buy crypto with credit/debit cards, bank transfers, Apple Pay, and Google Pay.

## Features

- **Multiple Payment Providers**:
  - MoonPay (sandbox and production)
  - Transak (staging and production)
  - Simulation mode (for testing without real providers)

- **Payment Methods**:
  - Credit/Debit Cards (Visa, Mastercard)
  - Apple Pay & Google Pay
  - Bank Transfers (SEPA)

- **Supported Currencies**:
  - Fiat: EUR, USD, GBP, CHF
  - Crypto: USDC, ETH, BTC, SOL, MATIC, ARB

- **Webhook Integration**:
  - Real-time transaction updates
  - Secure signature verification
  - Persistent transaction storage
  - WebSocket broadcasting to frontend

## Architecture

```
Frontend (fiat-onramp.js)
    ├── Simulation Mode (default)
    ├── MoonPay Widget (iframe integration)
    └── Transak Widget (iframe integration)

Backend (fiat-webhooks.js)
    ├── POST /api/webhooks/moonpay
    ├── POST /api/webhooks/transak
    ├── GET /api/fiat/transactions
    ├── GET /api/fiat/transactions/:id
    └── GET /api/fiat/stats

Data Storage
    └── data/fiat_transactions.json
```

## Installation

### 1. Backend Setup

The fiat webhook module is already integrated into the Obelisk backend. Make sure you have the required dependencies:

```bash
cd obelisk-backend
npm install express crypto
```

### 2. Environment Variables

Add to `obelisk-backend/.env`:

```env
# MoonPay Configuration
MOONPAY_API_KEY=pk_test_YOUR_API_KEY
MOONPAY_SECRET_KEY=sk_test_YOUR_SECRET_KEY
MOONPAY_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Transak Configuration
TRANSAK_API_KEY=YOUR_API_KEY
TRANSAK_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

### 3. Get API Keys

#### MoonPay
1. Sign up at https://www.moonpay.com/dashboard/sign_up
2. Create a sandbox account for testing
3. Get your API keys from Settings > API Keys
4. Configure webhook URL: `https://your-domain.com/api/webhooks/moonpay`

#### Transak
1. Sign up at https://transak.com/
2. Get staging credentials for testing
3. Configure webhook URL: `https://your-domain.com/api/webhooks/transak`

## Usage

### Frontend Integration

```javascript
// Initialize and configure
FiatOnRamp.configure({
    moonpayApiKey: 'pk_test_...',
    transakApiKey: 'YOUR_API_KEY',
    provider: 'moonpay', // 'moonpay' | 'transak' | 'simulation'
    moonpayLive: false,  // Use sandbox for testing
    transakLive: false   // Use staging for testing
});

// Set user's wallet address (required for providers)
ObeliskApp.state.account = '0x377706801308ac4c3Fe86EEBB295FeC6E1279140';

// Register callback for completed payments
FiatOnRamp.onPaymentComplete((result) => {
    console.log('Payment completed:', result);
    // Update user balance, show notification, etc.
});

// Open the fiat on-ramp modal
FiatOnRamp.showModal(100); // Optional: preset amount in EUR

// Or directly open a provider widget
FiatOnRamp.openMoonPayWidget({
    currencyCode: 'usdc',
    walletAddress: '0x377706801308ac4c3Fe86EEBB295FeC6E1279140',
    baseCurrencyAmount: 100,
    baseCurrencyCode: 'eur'
});

FiatOnRamp.openTransakWidget({
    cryptoCurrencyCode: 'USDC',
    walletAddress: '0x377706801308ac4c3Fe86EEBB295FeC6E1279140',
    fiatAmount: 100,
    fiatCurrency: 'EUR',
    network: 'arbitrum'
});
```

### Check Provider Status

```javascript
const status = FiatOnRamp.getProviderStatus();
console.log(status);
// {
//   activeProvider: 'moonpay',
//   moonpay: { configured: true, isLive: false },
//   transak: { configured: true, isLive: false }
// }
```

## Backend API

### Get Transactions

```bash
# Get all transactions
GET http://localhost:3001/api/fiat/transactions

# Filter by provider
GET http://localhost:3001/api/fiat/transactions?provider=moonpay

# Filter by wallet
GET http://localhost:3001/api/fiat/transactions?wallet=0x377706801308ac4c3Fe86EEBB295FeC6E1279140

# Limit results
GET http://localhost:3001/api/fiat/transactions?limit=20
```

Response:
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "transactions": [
    {
      "id": "mp_123456",
      "provider": "moonpay",
      "status": "completed",
      "cryptoCurrency": "usdc",
      "baseCurrency": "eur",
      "baseCurrencyAmount": 100,
      "quoteCurrencyAmount": 95.5,
      "walletAddress": "0x377706801308ac4c3Fe86EEBB295FeC6E1279140",
      "createdAt": "2026-01-27T12:00:00Z"
    }
  ]
}
```

### Get Single Transaction

```bash
GET http://localhost:3001/api/fiat/transactions/:id
```

### Get Statistics

```bash
GET http://localhost:3001/api/fiat/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "totalTransactions": 42,
    "byProvider": {
      "moonpay": 25,
      "transak": 17
    },
    "byStatus": {
      "completed": 35,
      "pending": 5,
      "failed": 2
    },
    "last24h": 8,
    "totalVolume": {
      "usd": 4250.50
    }
  }
}
```

## Webhook Integration

### MoonPay Webhooks

MoonPay sends webhooks for transaction events:

- `transactionCreated` - New transaction initiated
- `transactionUpdated` - Transaction status changed
- `transactionCompleted` - Transaction successfully completed
- `transactionFailed` - Transaction failed

The webhook handler:
1. Verifies HMAC-SHA256 signature
2. Stores transaction in `data/fiat_transactions.json`
3. Broadcasts update via WebSocket to connected clients
4. Returns 200 OK

### Transak Webhooks

Transak sends webhooks for order events:

- `ORDER_CREATED` - New order created
- `ORDER_PROCESSING` - Order being processed
- `ORDER_COMPLETED` - Order successfully completed
- `ORDER_FAILED` - Order failed
- `ORDER_CANCELLED` - Order cancelled by user

### Testing Webhooks Locally

Use the example HTML file or curl:

```bash
# Test MoonPay webhook
curl -X POST http://localhost:3001/api/webhooks/moonpay \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_123",
    "type": "transactionCompleted",
    "status": "completed",
    "cryptoCurrency": "usdc",
    "baseCurrency": "eur",
    "baseCurrencyAmount": 100,
    "quoteCurrencyAmount": 95.5,
    "walletAddress": "0x377706801308ac4c3Fe86EEBB295FeC6E1279140"
  }'

# Test Transak webhook
curl -X POST http://localhost:3001/api/webhooks/transak \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "ORDER_COMPLETED",
    "data": {
      "id": "test_123",
      "status": "COMPLETED",
      "cryptocurrency": "USDC",
      "fiatCurrency": "EUR",
      "fiatAmount": 100,
      "cryptoAmount": 95.5,
      "walletAddress": "0x377706801308ac4c3Fe86EEBB295FeC6E1279140",
      "network": "arbitrum"
    }
  }'
```

## Testing

### 1. Start Backend

```bash
cd obelisk-backend
npm start
# Or with PM2
pm2 restart obelisk
```

### 2. Open Example Page

```bash
cd obelisk-dex
# Open fiat-onramp-example.html in browser
# Or serve with http-server
npx http-server -p 8080
```

Navigate to `http://localhost:8080/fiat-onramp-example.html`

### 3. Test Scenarios

1. **Simulation Mode** (default):
   - Open modal and fill card details
   - Use test card: `4242 4242 4242 4242`
   - Completes instantly with simulated success

2. **MoonPay Sandbox**:
   - Configure with sandbox API key
   - Opens MoonPay widget in iframe
   - Use test card from MoonPay docs
   - Receives postMessage events

3. **Transak Staging**:
   - Configure with staging API key
   - Opens Transak widget in iframe
   - Test payment flow
   - Webhook updates stored

4. **Backend API**:
   - Test transaction endpoints
   - Simulate webhooks
   - Check WebSocket broadcasts

## Security

### Signature Verification

Both MoonPay and Transak webhooks are verified using HMAC signatures:

- **MoonPay**: HMAC-SHA256 in `moonpay-signature` header
- **Transak**: HMAC-SHA256 in `x-signature` header

If webhook secrets are not configured, verification is skipped (dev mode only).

### Best Practices

1. **Never expose API keys** in frontend code
2. **Always verify signatures** on webhook endpoints
3. **Use HTTPS** in production for webhook URLs
4. **Validate wallet addresses** before initiating purchases
5. **Rate limit** webhook endpoints to prevent abuse
6. **Store secrets** in environment variables, never in code

## Production Deployment

### 1. Configure Webhook URLs

Set your production webhook URLs in provider dashboards:

```
MoonPay: https://your-domain.com/api/webhooks/moonpay
Transak: https://your-domain.com/api/webhooks/transak
```

### 2. Environment Variables

Update `.env` with production keys:

```env
MOONPAY_API_KEY=pk_live_YOUR_PRODUCTION_KEY
MOONPAY_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_SECRET
TRANSAK_API_KEY=YOUR_PRODUCTION_KEY
TRANSAK_WEBHOOK_SECRET=YOUR_PRODUCTION_SECRET
```

### 3. Enable Live Mode

```javascript
FiatOnRamp.configure({
    moonpayApiKey: process.env.MOONPAY_API_KEY,
    transakApiKey: process.env.TRANSAK_API_KEY,
    provider: 'moonpay',
    moonpayLive: true,  // Use production
    transakLive: true   // Use production
});
```

### 4. SSL/HTTPS Required

Both MoonPay and Transak require HTTPS for:
- Widget embedding
- Webhook endpoints

Make sure your Obelisk deployment uses SSL certificates.

## Fees

### MoonPay
- Credit/Debit Card: ~4.5% + network fees
- Bank Transfer: ~1% + network fees
- Minimum: $20 USD equivalent

### Transak
- Credit/Debit Card: ~4-5% + network fees
- Bank Transfer: ~0.5-1% + network fees
- Minimum: $30 USD equivalent

Fees vary by payment method, currency, and region.

## Troubleshooting

### Widget Not Opening

- Check if API key is configured
- Verify wallet address is set
- Check browser console for errors
- Ensure not blocking iframes/popups

### Webhook Not Receiving Events

- Verify webhook URL is accessible (use ngrok for local testing)
- Check webhook secret matches provider dashboard
- Look for signature verification errors in logs
- Ensure endpoint returns 200 OK quickly

### Transactions Not Appearing

- Check `data/fiat_transactions.json` exists and has write permissions
- Verify backend is running and accessible
- Check browser network tab for API errors
- Look at backend logs for webhook processing errors

## Support

- **MoonPay Docs**: https://docs.moonpay.com/
- **Transak Docs**: https://docs.transak.com/
- **Obelisk Issues**: Create issue in repo

## Future Enhancements

- [ ] Support more payment providers (Ramp, Wyre)
- [ ] Add KYC status tracking
- [ ] Implement transaction limits and velocity checks
- [ ] Add email notifications for completed purchases
- [ ] Support more cryptocurrencies and networks
- [ ] Add recurring payment scheduling
- [ ] Integrate with Obelisk Combos for automatic investment
