# Fiat On-Ramp Integration Guide

## Quick Start - Integrating into Main Obelisk App

### Step 1: Include the Module

Add to your main HTML file (e.g., `index.html`):

```html
<!-- Add before closing </body> tag -->
<script src="js/products/fiat-onramp.js"></script>
```

### Step 2: Configure on App Initialization

In your main app initialization code:

```javascript
// After wallet connection is established
document.addEventListener('DOMContentLoaded', () => {
    // ... your existing init code ...

    // Configure fiat on-ramp
    if (typeof FiatOnRamp !== 'undefined') {
        FiatOnRamp.configure({
            provider: 'simulation', // Start with simulation
            // Later add real providers:
            // moonpayApiKey: 'pk_test_...',
            // transakApiKey: '...',
            // provider: 'moonpay'
        });

        // Register payment completion callback
        FiatOnRamp.onPaymentComplete((result) => {
            console.log('[Obelisk] Fiat purchase completed:', result);

            // Update user balance
            if (result.status === 'completed') {
                // Refresh balance from blockchain or backend
                refreshUserBalance();

                // Show success notification
                showNotification(
                    'Funds added successfully! Your USDC will arrive shortly.',
                    'success'
                );

                // Optionally redirect to Combos page
                // navigateTo('/combos');
            }
        });
    }
});
```

### Step 3: Add Buy Button to UI

Add a "Buy Crypto" button to your app's navigation or wallet section:

```html
<!-- Example: In wallet dropdown or main nav -->
<button onclick="FiatOnRamp.showModal()" class="btn-buy-crypto">
    💳 Buy Crypto
</button>
```

Or with custom styling:

```html
<button onclick="openFiatOnRamp()" class="obelisk-buy-button">
    <span class="icon">💳</span>
    <span>Add Funds</span>
</button>

<script>
function openFiatOnRamp() {
    // Optional: check if wallet connected
    if (!ObeliskApp.state.account) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }

    // Open with preset amount (optional)
    FiatOnRamp.showModal(100); // 100 EUR default
}
</script>
```

### Step 4: Add to Wallet Page

Example integration in wallet/portfolio page:

```html
<div class="balance-section">
    <div class="balance-display">
        <h3>Total Balance</h3>
        <div class="amount">$1,234.56</div>
    </div>

    <div class="action-buttons">
        <button class="btn btn-primary" onclick="FiatOnRamp.showModal()">
            💳 Add Funds
        </button>
        <button class="btn btn-secondary" onclick="openWithdraw()">
            🏦 Withdraw
        </button>
    </div>
</div>
```

### Step 5: Integration with Combos

When user wants to invest in a Combo but has insufficient balance:

```javascript
function investInCombo(comboId, amount) {
    const userBalance = getUserBalance();

    if (userBalance < amount) {
        const shortfall = amount - userBalance;

        // Show confirmation dialog
        const confirm = showConfirmDialog(
            `Insufficient Balance`,
            `You need ${shortfall} USDC more to invest in this Combo. Would you like to add funds?`,
            [
                { text: 'Add Funds', action: 'buy', primary: true },
                { text: 'Cancel', action: 'cancel' }
            ]
        );

        if (confirm === 'buy') {
            // Open fiat on-ramp with preset amount
            FiatOnRamp.showModal(Math.ceil(shortfall));

            // Register one-time callback to complete investment
            FiatOnRamp.onPaymentComplete((result) => {
                if (result.status === 'completed') {
                    // Retry investment after funds arrive
                    setTimeout(() => {
                        investInCombo(comboId, amount);
                    }, 2000);
                }
            });
        }
    } else {
        // Proceed with investment
        executeInvestment(comboId, amount);
    }
}
```

## Advanced Usage

### Custom Provider Selection

Allow users to choose their preferred payment provider:

```javascript
// In settings page
function savePaymentPreference(provider) {
    localStorage.setItem('preferredPaymentProvider', provider);

    FiatOnRamp.configure({
        provider: provider, // 'moonpay' | 'transak' | 'simulation'
        moonpayApiKey: getMoonPayKey(),
        transakApiKey: getTransakKey()
    });
}

// On app init
const preferredProvider = localStorage.getItem('preferredPaymentProvider') || 'simulation';
FiatOnRamp.configure({ provider: preferredProvider });
```

### Transaction History

Show user's fiat purchase history:

```javascript
async function loadFiatTransactions() {
    const wallet = ObeliskApp.state.account;

    const response = await fetch(
        `${API_URL}/api/fiat/transactions?wallet=${wallet}&limit=50`
    );

    const data = await response.json();

    // Display transactions in UI
    displayTransactionHistory(data.transactions);
}

function displayTransactionHistory(transactions) {
    const container = document.getElementById('transaction-history');

    transactions.forEach(tx => {
        const item = createTransactionCard({
            provider: tx.provider,
            amount: `${tx.baseCurrencyAmount} ${tx.baseCurrency}`,
            crypto: `${tx.quoteCurrencyAmount} ${tx.cryptoCurrency}`,
            status: tx.status,
            date: new Date(tx.createdAt).toLocaleDateString()
        });

        container.appendChild(item);
    });
}
```

### WebSocket Real-time Updates

Listen for transaction updates via WebSocket:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
    // Subscribe to fiat transaction updates
    ws.send(JSON.stringify({
        type: 'subscribe',
        payload: {
            channels: ['fiat:transaction']
        }
    }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'fiat_transaction') {
        const tx = message.transaction;

        // Show notification
        if (tx.status === 'completed') {
            showNotification(
                `Purchase completed! ${tx.quoteCurrencyAmount} ${tx.cryptoCurrency} added to your wallet.`,
                'success'
            );

            // Refresh balance
            refreshUserBalance();
        }
    }
};
```

### Direct Widget Integration

For advanced use cases, directly open provider widgets:

```javascript
// Quick buy button for specific amounts
function quickBuy(amount, currency) {
    FiatOnRamp.openMoonPayWidget({
        currencyCode: 'usdc',
        walletAddress: ObeliskApp.state.account,
        baseCurrencyAmount: amount,
        baseCurrencyCode: currency.toLowerCase()
    });
}

// Example: Quick buy buttons
<button onclick="quickBuy(50, 'EUR')">Buy €50 USDC</button>
<button onclick="quickBuy(100, 'EUR')">Buy €100 USDC</button>
<button onclick="quickBuy(500, 'EUR')">Buy €500 USDC</button>
```

## UI/UX Best Practices

### 1. Clear Call-to-Action

```html
<!-- Good: Clear and inviting -->
<div class="empty-wallet-state">
    <div class="icon">💳</div>
    <h3>Get Started with Crypto</h3>
    <p>Add funds to your wallet to start investing in Combos</p>
    <button class="btn-large btn-primary" onclick="FiatOnRamp.showModal()">
        Add Funds with Card
    </button>
    <p class="text-small">Supports Visa, Mastercard, Apple Pay & more</p>
</div>
```

### 2. Show Supported Payment Methods

```javascript
const paymentMethods = FiatOnRamp.paymentMethods.map(m => m.icon).join(' ');
// Display: 💳 🍎 🔵 🏦
```

### 3. Display Fees Transparently

```javascript
// Show fee calculation before user clicks
const calc = FiatOnRamp.calculateReceived(100, 'EUR', 'USDC');

// Display:
// You pay: €100
// Fee: -€2.90 (2.9%)
// You receive: ~95.5 USDC
```

### 4. Loading States

```javascript
FiatOnRamp.onPaymentComplete((result) => {
    if (result.status === 'completed') {
        showLoadingToast('Processing your payment...');

        // Wait for funds to arrive (usually 1-5 minutes)
        const checkBalance = setInterval(async () => {
            const newBalance = await fetchBalance();

            if (newBalance > previousBalance) {
                clearInterval(checkBalance);
                hideLoadingToast();
                showSuccessToast('Funds received!');
                refreshUI();
            }
        }, 5000);

        // Timeout after 10 minutes
        setTimeout(() => {
            clearInterval(checkBalance);
            hideLoadingToast();
            showInfoToast('Payment may take a few more minutes to arrive');
        }, 600000);
    }
});
```

## Testing Checklist

- [ ] Simulation mode works without API keys
- [ ] MoonPay sandbox opens and closes correctly
- [ ] Transak staging opens and closes correctly
- [ ] Wallet address is passed correctly to providers
- [ ] Payment completion callback fires
- [ ] Webhook endpoints receive and process events
- [ ] Transaction history displays correctly
- [ ] WebSocket updates work in real-time
- [ ] Error handling for missing wallet
- [ ] Error handling for missing API keys
- [ ] Mobile responsive design
- [ ] Cross-browser compatibility

## Production Checklist

- [ ] MoonPay production API key configured
- [ ] Transak production API key configured
- [ ] Webhook URLs configured in provider dashboards
- [ ] HTTPS enabled on all endpoints
- [ ] Webhook signature verification enabled
- [ ] Rate limiting on webhook endpoints
- [ ] Transaction storage backup system
- [ ] Monitoring and alerts for failed transactions
- [ ] User notification system for completed purchases
- [ ] Terms of service and privacy policy updated
- [ ] KYC/AML compliance reviewed
- [ ] Fee disclosure prominent in UI

## Support

If you encounter issues during integration:

1. Check browser console for errors
2. Verify backend is running (`pm2 status`)
3. Check backend logs (`pm2 logs obelisk`)
4. Test with simulation mode first
5. Verify API keys are correct
6. Check webhook signature verification

For detailed documentation, see `FIAT_ONRAMP_README.md`
