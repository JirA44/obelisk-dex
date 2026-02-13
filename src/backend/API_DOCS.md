# OBELISK API Documentation v4.0

Base URL: `http://localhost:3001`

---

## Trading Tools Overview

```
GET /api/tools
```
Returns status of all modules and available endpoints.

---

## Grid Trading

### Create Grid Bot
```
POST /api/grid/create
{
  "userId": "user123",
  "pair": "BTC/USDC",
  "lowerPrice": 95000,
  "upperPrice": 105000,
  "gridLevels": 10,
  "investmentAmount": 1000,
  "type": "arithmetic"  // or "geometric"
}
```

### Get Bot Status
```
GET /api/grid/:botId
```

### Stop Bot
```
POST /api/grid/:botId/stop
```

### List User Bots
```
GET /api/grid/user/:userId
```

---

## DCA (Dollar Cost Averaging)

### Create DCA Plan
```
POST /api/dca/create
{
  "userId": "user123",
  "pair": "ETH/USDC",
  "amount": 100,
  "frequency": "daily",      // hourly, daily, weekly, monthly
  "totalPurchases": 30       // 0 = unlimited
}
```

### Get Plan Status
```
GET /api/dca/:planId
```

### Pause/Resume Plan
```
POST /api/dca/:planId/toggle
```

### List User Plans
```
GET /api/dca/user/:userId
```

---

## Copy Trading

### Register as Master Trader
```
POST /api/copy/register
{
  "userId": "user123",
  "name": "CryptoKing",
  "description": "10 years experience",
  "minCopyAmount": 100
}
```

### Start Copying
```
POST /api/copy/follow
{
  "followerId": "user456",
  "masterId": "MASTER_user123",
  "copyAmount": 500,
  "copyPercentage": 50,
  "maxLoss": 100
}
```

### Leaderboard
```
GET /api/copy/leaderboard?limit=10
```

### User Copy Stats
```
GET /api/copy/stats/:userId
```

---

## Trailing Orders

### Create Trailing Stop
```
POST /api/trailing/create
{
  "userId": "user123",
  "pair": "SOL/USDC",
  "side": "sell",           // sell = stop loss, buy = stop buy
  "quantity": 10,
  "trailingPercent": 2,
  "activationPrice": 250    // optional
}
```

### Get Order Status
```
GET /api/trailing/:orderId
```

### Cancel Order
```
DELETE /api/trailing/:orderId
```

---

## Analytics

### PnL Tracking

#### Record Trade
```
POST /api/analytics/pnl/trade
{
  "userId": "user123",
  "pair": "BTC/USDC",
  "side": "buy",
  "price": 98000,
  "quantity": 0.1,
  "fee": 2.5
}
```

#### Get PnL Summary
```
GET /api/analytics/pnl/:userId
```

#### PnL History
```
GET /api/analytics/pnl/:userId/history?period=7d
```

### Heatmaps

#### Price Heatmap
```
GET /api/analytics/heatmap/price?period=24h
```

#### Volume Heatmap
```
GET /api/analytics/heatmap/volume/:pair
```

#### Correlations Matrix
```
GET /api/analytics/correlations
```

### Whale Alerts

#### Get Recent Whales
```
GET /api/analytics/whales?limit=50&pair=BTC/USDC&minValue=100000
```

#### Whale Statistics
```
GET /api/analytics/whales/stats?period=24h
```

#### Subscribe to Alerts
```
POST /api/analytics/whales/subscribe
{
  "userId": "user123",
  "minValue": 50000,
  "pairs": ["BTC/USDC", "ETH/USDC"]
}
```

### Sentiment

#### Pair Sentiment
```
GET /api/analytics/sentiment/:pair
```

#### Fear & Greed Index
```
GET /api/analytics/fear-greed
```

#### Market Overview
```
GET /api/analytics/overview
```

---

## Automation

### Bot Templates
```
GET /api/automation/templates
```
Returns: MOMENTUM, MEAN_REVERSION, BREAKOUT, SCALPER

### Create Custom Bot
```
POST /api/automation/bot/create
{
  "userId": "user123",
  "name": "My Scalper",
  "template": "SCALPER",
  "pair": "BTC/USDC",
  "parameters": {
    "targetProfit": 0.3,
    "maxLoss": 0.5,
    "positionSize": 100
  }
}
```

### Get Bot Status
```
GET /api/automation/bot/:botId
```

### Enable/Disable Bot
```
POST /api/automation/bot/:botId/toggle
{ "enabled": true }
```

### List User Bots
```
GET /api/automation/bots/:userId
```

### Price Alerts

#### Create Alert
```
POST /api/automation/alert/create
{
  "userId": "user123",
  "pair": "BTC/USDC",
  "condition": "above",     // above, below, crosses
  "price": 100000,
  "repeat": false,
  "webhook": "https://...", // optional
  "message": "BTC hit 100k!"
}
```

#### List Alerts
```
GET /api/automation/alerts/:userId
```

#### Delete Alert
```
DELETE /api/automation/alert/:alertId
```

### Webhooks

#### Register Webhook
```
POST /api/automation/webhook/register
{
  "userId": "user123",
  "name": "Discord Notifier",
  "url": "https://discord.com/api/webhooks/...",
  "events": ["trade", "alert", "whale"],
  "secret": "my-secret-key"
}
```

#### List Webhooks
```
GET /api/automation/webhooks/:userId
```

#### Toggle Webhook
```
POST /api/automation/webhook/:webhookId/toggle
{ "enabled": false }
```

### Scheduled Tasks

#### Create Task
```
POST /api/automation/task/schedule
{
  "userId": "user123",
  "name": "Daily Report",
  "action": "report",
  "schedule": "daily",      // minutely, hourly, daily, weekly, monthly
  "parameters": {}
}
```

#### List Tasks
```
GET /api/automation/tasks/:userId
```

---

## Portfolio Management

### Create Portfolio
```
POST /api/portfolio/create
{
  "userId": "user123",
  "name": "Main Portfolio"
}
```

### Get Portfolio
```
GET /api/portfolio/:portfolioId
```

### List User Portfolios
```
GET /api/portfolio/user/:userId
```

### Add Wallet
```
POST /api/portfolio/:portfolioId/wallet
{
  "address": "0x1234...5678",
  "chain": "ethereum",      // ethereum, arbitrum, polygon, solana, base
  "label": "Hot Wallet",
  "trackNFTs": false
}
```

### Sync Wallet Balances
```
POST /api/portfolio/wallet/:walletId/sync
{
  "balances": {
    "ETH": 2.5,
    "USDC": 5000
  }
}
```

### Performance History
```
GET /api/portfolio/:portfolioId/performance?period=30d
```

### Take Snapshot
```
POST /api/portfolio/:portfolioId/snapshot
```

### Auto-Rebalancing

#### Set Config
```
POST /api/portfolio/:portfolioId/rebalance/config
{
  "targetAllocation": {
    "BTC": 40,
    "ETH": 30,
    "SOL": 20,
    "USDC": 10
  },
  "threshold": 5,
  "frequency": "weekly"
}
```

#### Check if Rebalance Needed
```
GET /api/portfolio/:portfolioId/rebalance/check
```

#### Calculate Trades
```
GET /api/portfolio/:portfolioId/rebalance/calculate
```

#### Execute Rebalance
```
POST /api/portfolio/:portfolioId/rebalance/execute
{
  "trades": [...]  // from calculate endpoint
}
```

#### Rebalance History
```
GET /api/portfolio/:portfolioId/rebalance/history?limit=10
```

### Tax Reporting

#### Record Tax Event
```
POST /api/portfolio/tax/event
{
  "userId": "user123",
  "type": "trade",          // trade, airdrop, stake_reward, nft_sale
  "token": "BTC",
  "amount": 0.5,
  "costBasis": 45000,
  "proceeds": 50000,
  "txHash": "0x..."
}
```

#### Generate Tax Report
```
GET /api/portfolio/tax/:userId/:year?format=detailed
```

#### Export Tax Data
```
GET /api/portfolio/tax/:userId/:year/export?format=csv
```

#### Calculate Capital Gains
```
GET /api/portfolio/tax/:userId/gains?year=2024&method=FIFO
```

---

## Quick Examples

### Create a Grid Bot
```bash
curl -X POST http://localhost:3001/api/grid/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo","pair":"BTC/USDC","lowerPrice":90000,"upperPrice":100000,"gridLevels":10,"investmentAmount":1000}'
```

### Set Price Alert
```bash
curl -X POST http://localhost:3001/api/automation/alert/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo","pair":"BTC/USDC","condition":"above","price":100000}'
```

### Check Whale Activity
```bash
curl http://localhost:3001/api/analytics/whales/stats?period=24h
```

### Get Fear & Greed
```bash
curl http://localhost:3001/api/analytics/fear-greed
```
