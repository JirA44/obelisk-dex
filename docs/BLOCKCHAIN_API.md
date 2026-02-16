# Obelisk V3 TURBO - Blockchain Settlement API

**Version**: 3.0
**Date**: 2026-02-17

## Table of Contents

1. [Overview](#overview)
2. [Supported Chains](#supported-chains)
3. [API Endpoints](#api-endpoints)
4. [Smart Account Features](#smart-account-features)
5. [Examples](#examples)
6. [Dashboard](#dashboard)

---

## Overview

Obelisk V3 TURBO provides multi-chain blockchain settlement with Smart Account support for ultra-low-cost, high-throughput trading operations.

### Key Features

- ✅ **Multi-Chain Support** (Arbitrum, Base, Optimism, Sonic, Solana, Cosmos)
- ✅ **Smart Account Batch Transactions** (80% gas savings!)
- ✅ **Auto-Fallback** (if real settlement fails, falls back to simulation)
- ✅ **Real-Time Dashboard** (track gas savings and performance)
- ✅ **MetaMask Compatible** (works with your existing wallet)

### Gas Cost Comparison

| Chain | Single Settlement | Batch (10 trades) | Savings |
|-------|-------------------|-------------------|---------|
| **Sonic** | $0.00105 | ~$0.00021/trade | 80% |
| **Arbitrum** | $0.001267 | **$0.000253/trade** | **80%** |
| **Base** | ~$0.01 | ~$0.002/trade | 80% |
| **Optimism** | ~$0.02 | ~$0.004/trade | 80% |
| **Solana** | $0.00025 | N/A | - |
| **Cosmos** | $0.001 | N/A | - |

---

## Supported Chains

### EVM Chains (Smart Account Compatible)

| Chain | RPC | Chain ID | Explorer | Status |
|-------|-----|----------|----------|--------|
| **Arbitrum** | `https://arb1.arbitrum.io/rpc` | 42161 | https://arbiscan.io | ✅ LIVE |
| **Sonic** | `https://rpc.soniclabs.com` | 146 | https://sonicscan.org | ✅ LIVE |
| **Base** | `https://mainnet.base.org` | 8453 | https://basescan.org | ✅ Ready |
| **Optimism** | `https://mainnet.optimism.io` | 10 | https://optimistic.etherscan.io | ✅ Ready |

### Non-EVM Chains

| Chain | RPC | Network | Explorer | Status |
|-------|-----|---------|----------|--------|
| **Solana** | `https://api.mainnet-beta.solana.com` | Mainnet | https://solscan.io | ✅ Ready |
| **Cosmos** | `https://cosmos-rpc.polkachu.com` | Testnet | https://mintscan.io | ⚠️ Testnet |

---

## API Endpoints

Base URL: `https://obelisk-dex.pages.dev/api/blockchain`

### 1. Single Settlement

**POST** `/settle`

Settle a single trade on blockchain.

**Request Body:**
```json
{
  "trade": {
    "symbol": "BTC-USD",
    "side": "LONG",
    "size": 5,
    "price": 50000,
    "timestamp": 1771284036222
  },
  "chain": "ARBITRUM"  // Optional: ARBITRUM, BASE, OPTIMISM, SONIC, SOLANA, COSMOS
}
```

**Response:**
```json
{
  "success": true,
  "chain": "Arbitrum One",
  "chainKey": "ARBITRUM",
  "txHash": "0x67db99ef1b34b13dadfdcaef20ed6fe9e23928ddecbce2a80ca1306e26751857",
  "gasCost": 0.001267,
  "latency": 2747,
  "blockTime": 0.25,
  "explorer": "https://arbiscan.io/tx/0x67db..."
}
```

---

### 2. Batch Settlement (SMART ACCOUNT)

**POST** `/batch`

Settle multiple trades in a single transaction. **Requires Smart Account for 80% gas savings!**

**Request Body:**
```json
{
  "trades": [
    {
      "symbol": "BTC-USD",
      "side": "LONG",
      "size": 5,
      "price": 50000,
      "timestamp": 1771284036222
    },
    {
      "symbol": "ETH-USD",
      "side": "LONG",
      "size": 10,
      "price": 3000,
      "timestamp": 1771284036223
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "batchSize": 2,
  "results": [
    {
      "success": true,
      "txHash": "0x1a8c3f...",
      "gasCost": 0.000253,
      "gasSaved": 0.001014,
      "batch": true,
      "batchSize": 2,
      "batchIndex": 0
    },
    {
      "success": true,
      "txHash": "0x1a8c3f...",
      "gasCost": 0.000253,
      "gasSaved": 0.001014,
      "batch": true,
      "batchSize": 2,
      "batchIndex": 1
    }
  ],
  "summary": {
    "totalCost": "0.000506",
    "totalSaved": "0.002028",
    "avgCostPerTrade": "0.000253",
    "savingsPercent": "80.0%"
  }
}
```

---

### 3. List Supported Chains

**GET** `/chains`

Get list of all supported blockchains with their specs.

**Response:**
```json
{
  "success": true,
  "count": 6,
  "chains": [
    {
      "key": "SOLANA",
      "name": "Solana",
      "chainId": "mainnet-beta",
      "maxTPS": 65000,
      "avgBlockTime": "0.4s",
      "avgGasCost": "$0.00025",
      "finality": "instant",
      "priority": 1
    },
    {
      "key": "ARBITRUM",
      "name": "Arbitrum One",
      "chainId": 42161,
      "maxTPS": 40000,
      "avgBlockTime": "0.25s",
      "avgGasCost": "$0.02000",
      "finality": "optimistic",
      "priority": 5
    }
  ]
}
```

---

### 4. Settlement Statistics

**GET** `/stats`

Get settlement engine statistics.

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalSettlements": 6,
    "totalGasCost": "$0.0025",
    "avgGasPerSettlement": "$0.000422",
    "strategy": "CHEAPEST_FIRST"
  },
  "byChain": [
    {
      "chain": "Arbitrum One",
      "settlements": 6,
      "trades": 6,
      "gasCost": "$0.0025",
      "avgLatency": "2747ms",
      "errors": 0,
      "efficiency": "1.0x"
    }
  ],
  "smartAccountExecutor": {
    "mode": "MAINNET",
    "wallet": "0x377706801308ac4c3Fe86EEBB295FeC6E1279140",
    "settlements": 6,
    "totalGasCost": "$0.002532",
    "successRate": "100.00%"
  }
}
```

---

### 5. Get Wallet Balance

**GET** `/balance/:chain`

Get wallet balance on specific chain.

**Parameters:**
- `:chain` - Chain name (ARBITRUM, BASE, OPTIMISM, SONIC, SOLANA, COSMOS)

**Response:**
```json
{
  "success": true,
  "chain": "ARBITRUM",
  "balance": 0.003929,
  "unit": "ETH"
}
```

---

### 6. Smart Account Status

**GET** `/smart-account/status`

Check if Smart Account is enabled for your wallet.

**Response:**
```json
{
  "success": true,
  "enabled": true,
  "network": "Arbitrum One",
  "wallet": "0x377706801308ac4c3Fe86EEBB295FeC6E1279140",
  "stats": {
    "totalSettlements": 6,
    "batchSettlements": 1,
    "totalGasSaved": "$0.005064",
    "efficiency": "200.0% saved via batching"
  }
}
```

---

### 7. Smart Account Upgrade Guide

**GET** `/smart-account/upgrade-guide`

Get instructions to upgrade your wallet to Smart Account.

**Response:**
```json
{
  "success": true,
  "guide": {
    "title": "Upgrade to Smart Account",
    "description": "Enable batch transactions and gas abstraction",
    "steps": [
      "Open MetaMask (v12.17.0+)",
      "Go to a supported dApp on Base/Arbitrum/Optimism",
      "When prompted, click 'Upgrade to Smart Account'",
      "Confirm the one-time upgrade transaction",
      "Your account will now have Smart Account features!"
    ],
    "supportedChains": ["Base", "Arbitrum", "Optimism"],
    "benefits": [
      "Batch transactions (80% gas savings)",
      "Pay gas in USDC instead of ETH",
      "Sponsored transactions (gasless)",
      "Social recovery",
      "Multi-sig support"
    ]
  }
}
```

---

## Smart Account Features

### What is a Smart Account?

MetaMask Smart Accounts (EIP-7702) allow your regular wallet to delegate certain operations to a smart contract, enabling:

1. **Batch Transactions** - Execute multiple operations in one tx (80% gas savings!)
2. **Gas Abstraction** - Pay fees in USDC instead of ETH
3. **Sponsored Transactions** - Obelisk can pay fees for you
4. **Social Recovery** - Recover account without seed phrase
5. **Multi-Sig** - Require multiple approvals for large transactions

### How to Enable

1. Open MetaMask (v12.17.0+)
2. Visit a supported dApp (Uniswap, etc.) on Arbitrum/Base/Optimism
3. When prompted, click "Upgrade to Smart Account"
4. Confirm the one-time transaction (~$0.50 gas)
5. Done! Your wallet now has superpowers 🚀

### Batch Settlement Example

**Without Smart Account:**
- 10 trades = 10 transactions
- Cost: 10 × $0.001267 = **$0.01267**
- Time: ~27 seconds (10 × 2.7s)

**With Smart Account:**
- 10 trades = 1 batch transaction
- Cost: **$0.00253** (80% savings!)
- Time: ~2.7 seconds (1 transaction)

---

## Dashboard

### Access Dashboard

**JSON Data:**
```
GET https://obelisk-dex.pages.dev/api/blockchain/dashboard
```

**HTML Dashboard:**
```
GET https://obelisk-dex.pages.dev/api/blockchain/dashboard/html
```

### Dashboard Features

- 📊 Real-time settlement statistics
- ⛓️ Multi-chain comparison
- 💰 Gas savings analysis (batch vs individual)
- 💡 Recommendations for optimization
- 📈 Historical charts (24h data)

---

## Examples

### Example 1: Single Settlement (cURL)

```bash
curl -X POST https://obelisk-dex.pages.dev/api/blockchain/settle \
  -H "Content-Type: application/json" \
  -d '{
    "trade": {
      "symbol": "BTC-USD",
      "side": "LONG",
      "size": 5,
      "price": 50000,
      "timestamp": 1771284036222
    },
    "chain": "SONIC"
  }'
```

### Example 2: Batch Settlement (JavaScript)

```javascript
const response = await fetch('https://obelisk-dex.pages.dev/api/blockchain/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trades: [
      { symbol: 'BTC-USD', side: 'LONG', size: 5, price: 50000, timestamp: Date.now() },
      { symbol: 'ETH-USD', side: 'LONG', size: 10, price: 3000, timestamp: Date.now() },
      { symbol: 'SOL-USD', side: 'SHORT', size: 20, price: 200, timestamp: Date.now() }
    ]
  })
});

const result = await response.json();
console.log('Batch settlement saved:', result.summary.totalSaved);
```

### Example 3: Auto-Batching (Python)

```python
import requests
import time

# Collect trades for 10 seconds
trades = []
start_time = time.time()

while time.time() - start_time < 10:
    trade = get_next_trade()  # Your trade logic
    trades.append(trade)

# Batch settle all at once
response = requests.post(
    'https://obelisk-dex.pages.dev/api/blockchain/batch',
    json={'trades': trades}
)

result = response.json()
print(f"Batched {len(trades)} trades")
print(f"Saved: ${result['summary']['totalSaved']}")
print(f"Savings: {result['summary']['savingsPercent']}")
```

---

## Rate Limits

- **Single Settlement**: 100 requests/minute
- **Batch Settlement**: 20 requests/minute (recommended: batch more trades per request)
- **Dashboard**: No limit (cached 1 minute)

---

## Support

- **Documentation**: https://github.com/JirA44/obelisk-dex
- **Issues**: https://github.com/JirA44/obelisk-dex/issues
- **Discord**: [Coming soon]

---

**Obelisk V3 TURBO** - Multi-Chain Settlement Engine
© 2026 - MIT License
