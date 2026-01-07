# Obelisk DEX

## Structure du projet

```
js/
├── core/           # App principale, config, i18n, animations
│   ├── app.js
│   ├── config.js
│   ├── i18n.js
│   └── ...
├── ui/             # Composants UI (auth, user accounts)
├── wallet/         # Wallet, crypto, post-quantum
│   ├── wallet.js
│   ├── wallet-connect.js
│   ├── crypto-utils.js
│   └── post-quantum.js
├── trading/        # Trading, prix, arbitrage
│   ├── trading-ui-real.js
│   ├── prices.js
│   ├── hyperliquid.js
│   └── uniswap.js
├── products/       # Produits (bonds, combos, fiat)
│   ├── bonds.js
│   ├── combos.js
│   └── fiat-onramp.js
├── portfolio/      # Gestion portfolio, simulations
│   ├── simulated-portfolio.js
│   ├── investment-simulator.js
│   └── leaderboard.js
└── utils/          # Outils, AI, sécurité
    ├── ai-advisor.js
    ├── security-audit.js
    └── learn.js
```

## Déploiement
```bash
npx wrangler pages deploy . --project-name=obelisk-dex
```

## URLs
- Production: https://master.obelisk-dex.pages.dev
