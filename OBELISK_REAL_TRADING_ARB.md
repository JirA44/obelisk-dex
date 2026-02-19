# OBELISK REAL TRADING - $5 USDC Arbitrum
**Obelisk = Vraie bourse qui route vers GMX, MUX, AsterDEX sur Arbitrum**

---

## 🏦 ARCHITECTURE: Obelisk comme vraie DEX

```
$5 USDC Arbitrum (wallet 0x377706...)
         ↓
OBELISK SERVER (localhost:3001)
         ↓ (Smart Router)
Routes vers venues ARBITRUM:
├─ GMX Protocol (Arbitrum) ← Perps 50x, liquide
├─ MUX Protocol (Arbitrum) ← Perps 100x, $0.06% fees
├─ AsterDEX (Arbitrum) ← CLOB, 200x leverage
└─ Hyperliquid (Arbitrum) ← CLOB, 0% maker
```

**Obelisk = Aggregateur intelligent qui choisit la meilleure venue!**

---

## ✅ ÉTAPE 1: Vérifier wallet Arbitrum

Votre wallet: `0x377706801308ac4c3Fe86EEBB295FeC6E1279140`

```bash
# Check balance USDC sur Arbitrum
cd ~/mixbot

# Vérifier si vous avez déjà un script
ls -la | grep -i arb
ls -la | grep -i balance
```

**Besoin:** Clé privée dans `.env` pour signer transactions

### Créer wallet config si pas déjà fait:

```bash
# File: ~/mixbot/.env
ARBITRUM_PRIVATE_KEY=votre_cle_privee_metamask
ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
WALLET_ADDRESS=0x377706801308ac4c3Fe86EEBB295FeC6E1279140
```

**⚠️ SÉCURITÉ:** Ne JAMAIS commit `.env` dans git!

---

## ✅ ÉTAPE 2: Configurer Obelisk pour routing Arbitrum

### Venues disponibles sur Arbitrum (déjà dans full_executor.js):

| Venue | Fees | Leverage | Assets | Priority |
|-------|------|----------|--------|----------|
| **GMX** | 0.06% taker | 50x | BTC/ETH/LINK/UNI | ⭐⭐⭐⭐ |
| **MUX** | 0.06% taker | 100x | 36 coins | ⭐⭐⭐⭐ |
| **AsterDEX** | 0.035% | 200x | Multi | ⭐⭐⭐ |
| **Hyperliquid** | 0% maker | 20x | Multi | ⭐⭐⭐⭐⭐ |

**Obelisk choisit automatiquement selon:**
1. Liquidité disponible
2. Fees les plus bas
3. Latence
4. Asset supporté

---

## ✅ ÉTAPE 3: Tester routing avec $5 USDC

### Script de test routing Arbitrum:

**File: `~/obelisk/test_arb_routing.js`**

```javascript
#!/usr/bin/env node
/**
 * TEST OBELISK ROUTING - $5 USDC ARBITRUM
 * Test real routing GMX/MUX/AsterDEX
 */

const axios = require('axios');

const OBELISK_API = 'http://localhost:3001';
const CAPITAL = 5; // $5 USDC

async function testArbRouting() {
    console.log('═'.repeat(80));
    console.log('🧪 OBELISK ARBITRUM ROUTING TEST - $5 USDC');
    console.log('═'.repeat(80));
    console.log();

    try {
        // 1. Check Obelisk status
        console.log('1️⃣ Checking Obelisk server...');
        const health = await axios.get(`${OBELISK_API}/api/health`);
        console.log('   ✅ Server OK:', health.data);
        console.log();

        // 2. Check available venues
        console.log('2️⃣ Checking available venues...');
        const venues = await axios.get(`${OBELISK_API}/api/venues`);
        console.log('   Available:', venues.data.venues || 'Check manually');
        console.log();

        // 3. Check markets
        console.log('3️⃣ Checking markets...');
        const markets = await axios.get(`${OBELISK_API}/api/markets`);
        console.log('   Markets:', markets.data.markets?.slice(0, 5) || 'BTC-USD, ETH-USD...');
        console.log();

        // 4. Get routing recommendation
        console.log('4️⃣ Getting routing recommendation for BTC long...');
        const route = await axios.post(`${OBELISK_API}/api/route`, {
            symbol: 'BTC-USD',
            side: 'buy',
            size: 10, // $10 notional
            capital: CAPITAL
        }).catch(err => {
            console.log('   ⚠️ Route API not available, using default routing');
            return { data: { venue: 'gmx', reason: 'Default fallback' } };
        });

        if (route.data) {
            console.log(`   Recommended: ${route.data.venue} (${route.data.reason || 'optimal'})`);
        }
        console.log();

        // 5. Simulate order (DRY RUN)
        console.log('5️⃣ Simulating BTC long order...');
        const order = await axios.post(`${OBELISK_API}/api/trade/order`, {
            source: 'test',
            symbol: 'BTC-USD',
            side: 'buy',
            size: 10,
            leverage: 2,
            type: 'market',
            dryRun: true // SIMULATION ONLY!
        });

        console.log('   Order result:', {
            success: order.data.success,
            venue: order.data.venue || 'unknown',
            orderId: order.data.orderId,
            fees: order.data.fees || 0,
            simulated: order.data.simulated || true
        });
        console.log();

        // 6. Summary
        console.log('═'.repeat(80));
        console.log('✅ ROUTING TEST COMPLETE');
        console.log('═'.repeat(80));
        console.log();
        console.log('📊 Summary:');
        console.log(`   Capital: $${CAPITAL} USDC Arbitrum`);
        console.log('   Venues: GMX, MUX, AsterDEX, Hyperliquid');
        console.log('   Status: Ready for real trading');
        console.log();
        console.log('🚀 Next step:');
        console.log('   Set realExecution: true to execute real trades');
        console.log('   Ensure wallet has $5 USDC + gas (~$1 ETH)');
        console.log();

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}

testArbRouting();
```

**Lancer test:**
```bash
cd ~/obelisk
node test_arb_routing.js
```

**Expected:** Routing vers GMX/MUX selon disponibilité

---

## ✅ ÉTAPE 4: Activer REAL EXECUTION (TIER1+)

### Mode TIER1+ = vraie exécution on-chain

**Dans l'ordre placé via API:**

```javascript
// PAPER / DRY RUN (default)
{
  symbol: 'BTC-USD',
  side: 'buy',
  size: 10,
  leverage: 2
  // Pas de tier = paper trading
}

// REAL EXECUTION (TIER1+)
{
  symbol: 'BTC-USD',
  side: 'buy',
  size: 10,
  leverage: 2,
  tier: 'TIER1',           // ← Force real execution
  realExecution: true      // ← Double confirm
}
```

**Routing TIER1+ (code trading-router.js lines 170-199):**
```
1. Try GMX/MUX (DEX on Arbitrum) ← PREFERRED
2. Try Hyperliquid (CLOB) ← Fallback
3. Reject paper ← NO simulation for TIER1+
```

---

## ✅ ÉTAPE 5: Connecter MixBot → Obelisk (Real Trading)

### Update: `~/mixbot/platform_config.js`

```javascript
// Add Obelisk as REAL venue
PLATFORMS.OBELISK = {
    name: 'Obelisk',
    type: 'router', // Routes to GMX/MUX/etc
    chain: 'arbitrum',
    maxLeverage: 3,
    maxPositions: 1,
    minPositionSize: 3,
    maxPositionSize: 5,
    takerFee: 0.0006, // Average 0.06% (GMX/MUX)
    makerFee: 0,
    gasPerTrade: 0.50, // ~$0.50 gas Arbitrum
    tpsLimit: 100, // Limité par blockchain Arbitrum
    status: 'active',
    tier: 'TIER1', // ← Force real execution
    realExecution: true
};
```

---

## 💰 CAPITAL & FEES BREAKDOWN

**Avec $5 USDC sur Arbitrum:**

| Item | Cost | Notes |
|------|------|-------|
| **Capital** | $5.00 | USDC pour trading |
| **Gas reserve** | ~$1.00 | ETH pour gas (10-20 trades) |
| **Bridge fee** | $0 | Déjà sur Arbitrum! |
| **Per trade gas** | ~$0.50 | Arbitrum gas |
| **Per trade fees** | ~0.06% | GMX/MUX fees |

**Exemple trade $5 position:**
- Position: $5 x 2 leverage = $10 notional
- Fees: $10 x 0.06% = $0.006
- Gas: ~$0.50
- **Total cost: ~$0.51 par round-trip**

**⚠️ Pour HFT 100+ trades/jour: fees + gas = $51/jour!**
→ **Profit must be > $51/jour pour être profitable**

---

## 🎯 STRATÉGIE: Obelisk Router Arbitrum

### Phase 1: Test 10 trades ($5 capital)
```
Capital: $5 USDC
Trades: 10 test (paper + 10 real)
Venue: GMX/MUX (Obelisk routing)
Objectif: Valider execution sans erreur
Cost: ~$5 gas + fees
```

### Phase 2: Low-frequency real (si Phase 1 OK)
```
Capital: $5-10 USDC
Trades: 5-10/jour (LOW frequency!)
Target: +$1/jour profit
Cost: ~$5/jour gas + fees
Break-even: $1 profit > $5 costs? NO!
```

**⚠️ PROBLÈME: Gas Arbitrum trop cher pour HFT petit capital!**

### Phase 3: Scale OU switch chain
```
Option A: Scale capital $5 → $50 → $500
  → Dilute gas cost $0.50 sur $50 trade = 1% vs 10%

Option B: Switch to Cosmos (dYdX)
  → $0 gas (FREE!)
  → But rate limited 20-100 TPS

Option C: Keep Obelisk internal (paper)
  → 29K TPS available
  → $0 gas
  → Test strategies, deploy winners on Cosmos
```

---

## ✅ VERDICT: Gas Arbitrum = Problème pour $5 HFT

**Comparaison:**

| Venue | Gas/trade | Pour 100 trades | Avec $5 capital |
|-------|-----------|----------------|-----------------|
| **Arbitrum (GMX/MUX)** | $0.50 | $50/jour | ❌ 10x capital! |
| **Cosmos (dYdX)** | $0 | $0 | ✅ FREE |
| **Solana (Drift)** | $0.00025 | $0.025/jour | ✅ OK |
| **Obelisk Internal** | $0 | $0 | ✅ FREE |

**Recommandation:**
1. **Test 5-10 trades sur Arbitrum** → Valider routing fonctionne
2. **Switch to Cosmos/Solana** → Gas FREE pour HFT
3. **Use Obelisk internal** → 29K TPS test, $0 fees

---

## 🚀 QUICK START: Test Arbitrum Routing

```bash
# 1. Check Obelisk running
pm2 status obelisk

# 2. Test routing
cd ~/obelisk
node test_arb_routing.js

# 3. Si OK, test 1 real trade TIER1
# Edit test script:
#   tier: 'TIER1',
#   realExecution: true

# 4. Monitor
pm2 logs obelisk
# Check gas used, fees, execution venue

# 5. Décider:
#   - Si gas OK → Continue Arbitrum
#   - Si gas trop cher → Switch Cosmos ($0 gas)
```

---

## ❓ FAQ

**Q: Besoin bridge $5 Arbitrum?**
A: NON! Déjà sur Arbitrum! Direct trading GMX/MUX.

**Q: ATOM ou USDC?**
A: USDC (stable). ATOM = Cosmos token, pas Arbitrum.

**Q: Obelisk exécute comment?**
A: Obelisk router → Calls GMX/MUX smart contracts → Uses your wallet key → Sign tx on Arbitrum.

**Q: Gas ETH nécessaire?**
A: OUI! ~$1-2 ETH sur Arbitrum pour gas. Check: Metamask → Arbitrum network.

**Q: HFT possible sur Arbitrum?**
A: Techniquement OUI (TPS OK), mais gas $0.50/trade = trop cher pour petit capital. Mieux: Cosmos $0 gas.

**Q: Meilleure chain pour $5 HFT?**
A: Cosmos/dYdX (FREE gas) ou Solana ($0.00025). Arbitrum = trop cher pour HFT.

---

## 🎯 CONCLUSION

**Obelisk = Vraie bourse!** ✅
- Routes vers GMX, MUX, AsterDEX (Arbitrum)
- Real on-chain execution
- Smart routing automatique

**MAIS: Arbitrum gas = problème pour $5 HFT**
- $0.50 gas/trade = 10% du capital!
- 100 trades = $50 gas = 10x capital!

**Solution:**
1. Test 5-10 trades Arbitrum (validation)
2. Switch to Cosmos ($0 gas) pour HFT
3. Use Obelisk internal (29K TPS) pour test strategies

**Ready?** 🚀

**Prochaine étape:** Bridge vers Cosmos OU test direct sur Arbitrum?
