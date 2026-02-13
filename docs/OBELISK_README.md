# Obelisk - Banque Privee d'Investissement

Plateforme personnelle de gestion de patrimoine crypto. Centralise tous vos investissements, suit vos portefeuilles en temps reel, et offre des outils de trading avances.

**Version**: 2.0.0
**Dossier**: `C:\Users\Hugop\obelisk\`
**Interface**: https://obelisk-dex.pages.dev
**Serveur local**: http://localhost:3001
**Wallet**: `0x377706801308ac4c3Fe86EEBB295FeC6E1279140`

## Commandes Rapides

```bash
# Serveur (PM2)
pm2 start obelisk-backend/server-ultra.js --name obelisk
pm2 restart obelisk
pm2 logs obelisk

# Deployer interface
cd obelisk-dex && npx wrangler pages deploy . --project-name=obelisk-dex --commit-dirty=true

# Verifier etat
powershell -Command "Invoke-RestMethod http://localhost:3001/api/health"
```

## Architecture

| Composant | Dossier | Description |
|-----------|---------|-------------|
| Serveur | `obelisk-backend/` | API Node.js + WebSocket |
| Interface | `obelisk-dex/` | Application web statique |

## Fonctionnalites

- **Suivi de portefeuille** - 3000+ produits agreges en temps reel
- **Prix multi-sources** - Binance, Coinbase, Kraken, Hyperliquid, dYdX
- **24+ paires de trading** - BTC, ETH, SOL, ARB, etc.
- **Outils de trading** - Grid Trading, DCA automatique, Copy Trading
- **Staking & Coffres** - Rendements passifs 4-12% APY
- **Indices crypto** - Top Index pour suivre le marche

## API Health Endpoints

| Route | Description |
|-------|-------------|
| `/api/health` | Etat basique |
| `/api/health/detailed` | Etat complet + metriques |
| `/api/health/metrics` | Metriques Prometheus |
| `/api/health/alerts` | Alertes actives |

## Integrations DeFi Reelles

| Module | Protocole | Chain | APY |
|--------|-----------|-------|-----|
| Aave V3 | Lending USDC | Arbitrum | 3-8% |
| GMX GLP | Real Yield | Arbitrum | 15-30% |
| Aerodrome | LP ve(3,3) | Base | 20-50% |

### Classement par Risque

| Risque | Protocoles | APY Range |
|--------|------------|-----------|
| 1/5 | Aave USDC/DAI | 3-8% |
| 2/5 | Pendle Fixed, Compound | 8-15% |
| 3/5 | GMX GLP, Aerodrome LP | 15-50% |
| 4/5 | GMX Leverage, Pendle YT | -50% a +500% |
| 5/5 | Meme LP | -90% a +1000% |

### Portfolios Recommandes

| Profil | Allocation |
|--------|------------|
| Conservative | 70% Aave + 30% Pendle Fixed |
| Moderate | 40% Aave + 35% GMX + 25% Pendle |
| Aggressive | 40% GMX + 30% Aerodrome + 20% Pendle YT + 10% Aave |

## Smart Contracts

### Aave V3 (Arbitrum)
- Pool: `0x794a61358D6845594F94dc1DB02A252b5b4814aD`
- DataProvider: `0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654`
- USDC: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`

### GMX (Arbitrum)
- GLP Manager: `0x3963FfC9dff443c2A94f21b129D429891E32ec18`
- Reward Router V2: `0xB95DB5B167D75e6d04227CfFFA61069348d271F5`

### Aerodrome (Base)
- Router: `0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43`
- Voter: `0x16613524e02ad97eDfeF371bC883F2F5d6C480A5`

## Backup

```bash
xcopy /E /I /Y "C:\Users\Hugop\obelisk" "C:\Users\Hugop\kDrive2\obelisk_backup_%date:~-4%%date:~3,2%%date:~0,2%"
```
