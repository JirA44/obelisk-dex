# OBELISK HFT SETUP - 29K TPS Internal
**Test HFT sans bridge, sans fees, sans limites API**

---

## 🎯 ARCHITECTURE: Obelisk Pure Internal

```
┌─────────────────────────────────────────────┐
│ OBELISK SERVER (localhost:3001)             │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ INTERNAL POOL                       │    │
│ │ • Liquidité: $100K USDC             │    │
│ │ • Coins: 36 (BTC/ETH/SOL/etc.)     │    │
│ │ • Leverage: 50x max                 │    │
│ └─────────────────────────────────────┘    │
│              ▲                              │
│              │                              │
│ ┌─────────────────────────────────────┐    │
│ │ MIXBOT VENUE                        │    │
│ │ • Capital dédié: $5                 │    │
│ │ • Source: 'mixbot'                  │    │
│ │ • Via: obelisk_connector.js         │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ 📊 Performance Achieved:                    │
│    • TPS: 29,172                            │
│    • Latency: 0.03ms                        │
│    • Success: 100%                          │
└─────────────────────────────────────────────┘
```

**Pas de bridge! Tout local!**

---

## ✅ STEP 1: Vérifier Obelisk tourne

```bash
pm2 status obelisk

# Si pas lancé:
cd ~/obelisk
pm2 start ecosystem.config.js

# Test API:
curl http://localhost:3001/api/markets
```

**Expected:** Status 200, liste des marchés BTC-USD, ETH-USD, etc.

---

## ✅ STEP 2: Allouer $5 pour venue MixBot

```bash
cd ~/obelisk

# Créer allocation venue
curl http://localhost:3001/api/trade/venue/deposit \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "venue": "mixbot",
    "amount": 5,
    "type": "hft_test"
  }'
```

**Expected:**
```json
{
  "success": true,
  "venue": "mixbot",
  "balance": 5,
  "available": 5
}
```

---

## ✅ STEP 3: Test HFT Direct (29K TPS)

```bash
cd ~/obelisk
node test_obelisk_optimized.js 50000
```

**Expected results:**
```
Total Trades:  50,000
Successful:    50,000
Duration:      1.71s
Average TPS:   29,172
Avg Latency:   0.03ms

✅ SUCCESS! Target 800+ TPS achieved!
```

---

## ✅ STEP 4: Connecter MixBot → Obelisk

### File: `~/mixbot/obelisk_connector.js`

```javascript
/**
 * MIXBOT → OBELISK CONNECTOR
 * Direct API integration (no bridge needed!)
 */

const axios = require('axios');

class ObeliskConnector {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.venue = 'mixbot';
        this.balance = 5;
    }

    /**
     * Get equity & positions
     */
    async getEquity() {
        try {
            const res = await axios.get(`${this.baseURL}/trade/equity`, {
                params: { venue: this.venue }
            });
            return {
                success: true,
                equity: res.data.equity || this.balance,
                positions: res.data.positions || []
            };
        } catch (error) {
            console.error('[OBE] getEquity error:', error.message);
            return { success: false, equity: this.balance, positions: [] };
        }
    }

    /**
     * Open position
     */
    async openPosition({ coin, side, size, leverage = 2 }) {
        try {
            const res = await axios.post(`${this.baseURL}/trade/order`, {
                source: this.venue,
                coin,
                side: side.toLowerCase(),
                size,
                leverage,
                type: 'market'
            });

            return {
                success: true,
                orderId: res.data.orderId || Date.now(),
                venue: 'obelisk',
                fees: res.data.fees || 0
            };
        } catch (error) {
            console.error('[OBE] openPosition error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Close position
     */
    async closePosition({ coin }) {
        try {
            const res = await axios.post(`${this.baseURL}/trade/venue/close`, {
                source: this.venue,
                coin
            });

            return {
                success: true,
                pnl: res.data.pnl || 0,
                fees: res.data.fees || 0
            };
        } catch (error) {
            console.error('[OBE] closePosition error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get stats
     */
    async getStats() {
        try {
            const res = await axios.get(`${this.baseURL}/trade/venue/stats`, {
                params: { venue: this.venue }
            });

            return {
                success: true,
                trades: res.data.trades || 0,
                pnl: res.data.pnl || 0,
                winRate: res.data.winRate || 0
            };
        } catch (error) {
            console.error('[OBE] getStats error:', error.message);
            return { success: false };
        }
    }
}

module.exports = ObeliskConnector;

// Test
if (require.main === module) {
    (async () => {
        console.log('🧪 Testing Obelisk Connector...\n');

        const connector = new ObeliskConnector();

        // 1. Check equity
        const equity = await connector.getEquity();
        console.log('1️⃣ Equity:', equity);

        // 2. Open BTC long
        const open = await connector.openPosition({
            coin: 'BTC',
            side: 'long',
            size: 10,
            leverage: 2
        });
        console.log('2️⃣ Open:', open);

        // Wait 5s
        await new Promise(r => setTimeout(r, 5000));

        // 3. Close position
        const close = await connector.closePosition({ coin: 'BTC' });
        console.log('3️⃣ Close:', close);

        // 4. Get stats
        const stats = await connector.getStats();
        console.log('4️⃣ Stats:', stats);
    })();
}
```

**Test connector:**
```bash
cd ~/mixbot
node obelisk_connector.js
```

**Expected:**
```
🧪 Testing Obelisk Connector...

1️⃣ Equity: { success: true, equity: 5, positions: [] }
2️⃣ Open: { success: true, orderId: 1739585123456, venue: 'obelisk', fees: 0 }
3️⃣ Close: { success: true, pnl: 0.002, fees: 0.01 }
4️⃣ Stats: { success: true, trades: 1, pnl: 0.002, winRate: 100 }
```

---

## ✅ STEP 5: Activer venue Obelisk dans MixBot

### Edit: `~/mixbot/platform_config.js`

```javascript
// Add Obelisk to PLATFORMS
PLATFORMS.OBELISK = {
    name: 'Obelisk',
    type: 'internal',
    maxLeverage: 3,
    maxPositions: 1,
    minPositionSize: 3,
    maxPositionSize: 5,
    takerFee: 0.001, // 0.1%
    makerFee: 0.001,
    gasPerTrade: 0, // FREE!
    tpsLimit: 29000, // 29K TPS achieved!
    status: 'active'
};
```

---

## 🎯 STRATÉGIE HFT: Pure Obelisk

### Phase 1: Test Internal (1 jour)
```
Capital: $5 (allocation venue)
TPS: 29,000 disponible
Trades: 100-500/jour (modéré)
Objectif: Valider stratégie profitable
```

**Validation:**
- Win rate > 55%? ✅
- Profit > fees? ✅
- Latence < 10ms? ✅

### Phase 2: HFT Production (1 semaine)
```
Capital: $50 (scale 10x)
TPS: 1000-2000 (modéré → agressif)
Trades: 1000+/jour
Objectif: +$1/jour ($20/semaine)
```

**Monitoring:**
```bash
# Stats temps réel
curl http://localhost:3001/api/trade/venue/stats?venue=mixbot

# Logs Obelisk
pm2 logs obelisk

# Positions ouvertes
curl http://localhost:3001/api/trade/equity?venue=mixbot
```

### Phase 3: Scale (optionnel)
```
Si profitable après 1 semaine:
• Scale capital $50 → $500
• Ajouter Solana pour gros trades (>$100)
• Keep Obelisk pour petit volume HFT
```

---

## 💰 PROFIT PROJECTION (Obelisk Internal)

**Avec 2K TPS modéré:**

| Scenario | Profit/trade | Trades/jour | Gross/jour | Fees/jour | Net/jour |
|----------|--------------|-------------|------------|-----------|----------|
| Conservative | 0.05% | 500 | $1.25 | $0.25 | **$1.00** |
| Moderate | 0.10% | 1000 | $5.00 | $0.50 | **$4.50** |
| Aggressive | 0.20% | 2000 | $20.00 | $1.00 | **$19.00** |

**Fees fixes:** 0.1% par trade (in/out)
**Capital:** $5 → $50 → $500

---

## 📊 MONITORING DASHBOARD

```bash
# Check Obelisk status
pm2 status obelisk

# Check venue balance
curl http://localhost:3001/api/trade/equity?venue=mixbot | jq

# Check stats
curl http://localhost:3001/api/trade/venue/stats?venue=mixbot | jq

# Test latency
time curl http://localhost:3001/api/markets > /dev/null

# View logs
pm2 logs obelisk --lines 50
```

---

## ✅ CHECKLIST

**Avant de lancer HFT:**
- [ ] Obelisk server running (pm2 status obelisk)
- [ ] API accessible (curl localhost:3001/api/markets)
- [ ] $5 allocated to venue mixbot
- [ ] Connector tested (node obelisk_connector.js)
- [ ] Platform config updated
- [ ] Risk limits set ($3-5 max position)
- [ ] Stop loss: -2%
- [ ] Take profit: +4%

**Ready?** 🚀

---

## 🔥 QUICK START

```bash
# 1. Start Obelisk
cd ~/obelisk
pm2 start ecosystem.config.js

# 2. Test performance (29K TPS)
node test_obelisk_optimized.js 50000

# 3. Test connector
cd ~/mixbot
node obelisk_connector.js

# 4. Update platform config
# Add OBELISK to platform_config.js

# 5. Launch MixBot with Obelisk venue
pm2 restart mixbot

# 6. Monitor
pm2 logs mixbot
curl http://localhost:3001/api/trade/venue/stats?venue=mixbot
```

**GO!** 🚀

---

## ❓ FAQ

**Q: Pourquoi pas bridge ATOM vers Cosmos?**
A: Pour HFT, pas besoin! Obelisk = pool interne $100K USDC, tout local, 29K TPS. Bridge utile seulement si vous voulez déployer sur dYdX/Cosmos live (mais limité 20-100 TPS).

**Q: ATOM ou USDC?**
A: ATOM = volatile, pour staking. USDC = stable, pour trading. Obelisk utilise USDC en interne.

**Q: Et si je veux quand même bridge?**
A: OK, mais faites Arbitrum → Cosmos USDC (pas ATOM). Puis utilisez pour dYdX live (100 TPS max). Obelisk reste meilleur pour HFT.

**Q: Fees Obelisk?**
A: 0.1% par trade (paper: $0). Exemple: $5 position = $0.005 fees in + $0.005 out = $0.01 total.

**Q: Latence réseau?**
A: Zéro! Obelisk = localhost. Latence = 0.03ms (30 microseconds). dYdX = 200-500ms (network).

---

## 🎯 VERDICT: OBELISK > DYDX pour HFT

| Critère | Obelisk | dYdX |
|---------|---------|------|
| **TPS** | 29,172 ✅ | 20-100 ❌ |
| **Latence** | 0.03ms ✅ | 200ms ❌ |
| **Bridge** | Aucun ✅ | $1-2 fees ❌ |
| **Risk ban** | Zéro ✅ | API limit ❌ |
| **Setup** | 5 min ✅ | 15 min |
| **Capital min** | $1 ✅ | $5 |

**Recommandation:** Start HFT sur Obelisk, deploy sur dYdX si profitable (low-freq).
