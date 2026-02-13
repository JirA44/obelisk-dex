# Obelisk - Crypto Banking Platform

**Version**: 2.1.0
**Repository**: https://github.com/JirA44/obelisk-dex
**UI**: https://obelisk-dex.pages.dev
**API**: http://localhost:3001

---

## 📁 Project Structure

```
obelisk/
├── docs/                      # 📚 Documentation
│   ├── ARCHITECTURE.md
│   ├── INTEGRATION_GUIDE.md
│   └── ... (all documentation)
│
├── src/
│   ├── backend/               # 🔧 Backend API (Node.js)
│   │   ├── server-ultra.js    # Main server
│   │   ├── obelisk-perps.js   # Perpetuals engine
│   │   ├── obelisk-amm.js     # AMM engine
│   │   └── ... (services, executors)
│   │
│   ├── frontend/              # 🎨 Web UI
│   │   ├── index.html
│   │   ├── trade.html
│   │   └── ... (pages)
│   │
│   ├── executors/             # 🚀 Trading executors
│   │   ├── full_executor.js   # Multi-venue executor
│   │   ├── dryrun_executor.js # Dry-run mode
│   │   └── secure_connector.js
│   │
│   └── integration/           # 🔗 MixBot integration
│       ├── integration.js
│       └── prices.js
│
├── scripts/                   # 🛠️ Utility scripts
│   ├── verify-display.js
│   └── test-governance.js
│
└── tests/                     # ✅ Tests
    └── archived/              # Old test results
```

---

## 🚀 Quick Start

### Development

```bash
# Start server (via PM2)
pm2 start src/backend/server-ultra.js --name obelisk

# View logs
pm2 logs obelisk

# Restart
pm2 restart obelisk
```

### Production

```bash
# Deploy frontend to Cloudflare Pages
cd src/frontend
npx wrangler pages deploy . --project-name=obelisk-dex --commit-dirty=true
```

---

## 🏗️ Architecture

### Backend API (Port 3001)

| Module | Description |
|--------|-------------|
| **server-ultra.js** | Main API server |
| **obelisk-perps.js** | Perpetuals engine ($100K pool, 36 coins, 50x leverage) |
| **obelisk-amm.js** | AMM (10 pools, $545K TVL virtual) |
| **trading-router.js** | Smart router (GMX/HYP/Gains/MUX) |
| **venue-capital.js** | MixBot venue ($5 capital tracking) |
| **passive-products.js** | Staking, vaults, bonds, DCA, index, yield, insurance |

### MixBot Integration

Obelisk serves as a **trading venue** for MixBot:
- **Capital**: $5 dedicated
- **Execution**: Via internal perpetuals engine
- **API**: `/api/trade/*` endpoints

**Connector**: `mixbot/obelisk_connector.js` → `localhost:3001/api/trade/*`

**Endpoints**:
- `GET /api/trade/equity?venue=mixbot` - Equity & positions
- `POST /api/trade/order` (source=mixbot) - Place order
- `POST /api/trade/venue/close` - Close position
- `GET /api/trade/venue/stats` - Stats

---

## 📚 Documentation

See `docs/` directory:
- [Architecture](docs/ARCHITECTURE.md)
- [Integration Guide](docs/INTEGRATION_GUIDE.md)
- [API Documentation](docs/API_DOCS.md)
- [Governance](docs/GOVERNANCE_README.md)
- [OBL Token](docs/OBL_TOKEN_README.md)

---

## 🔧 Configuration

**Environment**: `src/backend/.env`

```env
JWT_SECRET=your_secret_here
DATABASE_URL=./obelisk.db
PORT=3001
```

---

## 📊 Features

### Perpetuals Engine
- **Pool**: $100K USDC virtual
- **Coins**: 36 supported
- **Leverage**: Up to 50x
- **Fees**: 0.1% (competitive)

### AMM
- **Pools**: 10 active pools
- **TVL**: $545K virtual
- **Routing**: Smart path finding

### Passive Products
- Staking (OBL token)
- Vaults (yield farming)
- Bonds (fixed returns)
- DCA (dollar-cost averaging)
- Index funds
- Yield aggregator
- Insurance pools

---

## 🎯 Wallet

**Address**: `0x377706801308ac4c3Fe86EEBB295FeC6E1279140`
**Chain**: Arbitrum One (42161)
**Shared with**: MixBot

---

## 📈 Status

**PM2 Service**: `obelisk`
**Uptime**: Check with `pm2 status obelisk`
**API Health**: `curl http://localhost:3001/api/health`

---

## 🔄 Migration Note

**Date**: 2026-02-13
**Reorganization**: Flattened git structure, moved to monorepo
**Backup**: Branch `backup-before-reorganization-20260213`
