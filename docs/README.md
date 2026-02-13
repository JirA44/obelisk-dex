# OBELISK DEX

Plateforme de trading décentralisée non-custodiale avec prix en temps réel et investissements passifs.

## Architecture

```
obelisk/
├── obelisk-backend/     # API Node.js + WebSocket
├── obelisk-dex/         # Frontend statique
├── docker-compose.yml   # Stack Docker complète
├── nginx.conf           # Config reverse proxy
├── Caddyfile            # Alternative simple à nginx
└── deploy.sh            # Script de déploiement
```

## Quick Start (Développement)

```bash
# Backend
cd obelisk-backend
npm install
npm start
# → http://localhost:3001

# Frontend
cd obelisk-dex
# Ouvrir index.html ou utiliser un serveur local
npx serve .
# → http://localhost:3000
```

## Déploiement Production

### Option 1: Docker (Recommandé)

```bash
# Setup initial
./deploy.sh setup

# Obtenir certificat SSL
export OBELISK_DOMAIN=votre-domaine.com
export OBELISK_EMAIL=admin@votre-domaine.com
./deploy.sh ssl

# Démarrer
./deploy.sh start

# Status
./deploy.sh status
```

### Option 2: Caddy (Simple)

```bash
# Installer Caddy
# https://caddyserver.com/docs/install

# Éditer le domaine dans Caddyfile
# Puis:
cd obelisk-backend && npm start &
caddy run --config ../Caddyfile
```

### Option 3: Manual

```bash
# Backend
cd obelisk-backend
npm ci --production
NODE_ENV=production node server-ultra.js

# Frontend: servir obelisk-dex/ avec nginx/apache
# Configurer reverse proxy pour /api/* → localhost:3001
```

## Fonctionnalités

### Trading
- 24 paires de trading (BTC, ETH, SOL, ARB, etc.)
- Order book en temps réel
- Prix multi-sources (Binance, Coinbase, Kraken)
- Frais: 0.1% par transaction

### Outils
- Grid Trading Bot
- DCA Automation
- Copy Trading
- Trailing Stop
- Arbitrage Scanner

### Investissements Passifs (Sans Perte)
- Liquid Staking (stETH, stSOL)
- Protected Vaults (90-100% capital protection)
- Fixed Income Bonds (4-12% APY)
- Auto-DCA
- 14 Combo Strategies

## API

```bash
# Health check
curl http://localhost:3001/health

# Markets
curl http://localhost:3001/api/markets

# Ticker
curl http://localhost:3001/api/ticker/BTC/USDC

# WebSocket
wscat -c ws://localhost:3001
> {"type":"subscribe","payload":{"channels":["ticker:BTC/USDC"]}}
```

Voir `obelisk-backend/API_DOCS.md` pour la documentation complète.

## Sécurité

- **Non-Custodial**: Les clés privées ne sont jamais stockées
- **SIWE Auth**: Sign-In With Ethereum
- **Rate Limiting**: 60 req/min par IP
- **Input Validation**: Protection XSS/injection

## Monitoring

```bash
# Logs
./deploy.sh logs backend

# Status
./deploy.sh status

# Health
curl https://votre-domaine.com/health
```

## Structure du Backend

| Fichier | Description |
|---------|-------------|
| `server-ultra.js` | Serveur principal, prix, WebSocket |
| `security.js` | Rate limiting, validation |
| `auth.js` | Authentification SIWE |
| `database.js` | SQLite (users, trades, balances) |
| `passive-products.js` | Staking, vaults, bonds |
| `sentry.js` | Error tracking (optionnel) |

## Configuration

Copier `.env.example` → `.env`:

```env
PORT=3001
NODE_ENV=production
ADMIN_API_KEY=your-secure-key
ALLOWED_ORIGINS=https://your-domain.com
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Tests

```bash
cd obelisk-backend
npm test           # Tous les tests
npm run test:e2e   # End-to-end
npm run test:auth  # Authentification
```

## Contribution

1. Fork le repo
2. Créer une branche (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

## License

MIT

---

**Documentation**:
- [Guide Utilisateur](USER_GUIDE.md)
- [Checklist Production](PRODUCTION_CHECKLIST.md)
- [Architecture](obelisk-backend/ARCHITECTURE.md)
- [API Docs](obelisk-backend/API_DOCS.md)
