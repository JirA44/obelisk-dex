# OBELISK DEX - Architecture Non-Custodial

## Principes de Sécurité

### 1. NON-CUSTODIAL (Non-Dépositaire)
- **Le serveur NE stocke JAMAIS les clés privées**
- **Le serveur NE peut PAS accéder aux fonds**
- Les utilisateurs gardent le contrôle total de leurs assets
- Toutes les transactions sont signées côté client

### 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      UTILISATEUR                            │
│  ┌──────────────┐                                          │
│  │ Wallet Local │ ← Clés privées JAMAIS envoyées           │
│  │ (Browser)    │                                          │
│  └──────┬───────┘                                          │
└─────────┼───────────────────────────────────────────────────┘
          │
          │ 1. Signature locale (clé privée)
          │ 2. Envoi transaction signée
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   OBELISK BACKEND                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Order Book Engine                                     │  │
│  │ - Match les ordres                                    │  │
│  │ - Vérifie les signatures                              │  │
│  │ - NE stocke PAS de clés                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ P2P Network                                           │  │
│  │ - Propage les ordres                                  │  │
│  │ - Sync entre nœuds                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │
          │ 3. Transaction validée
          ▼
┌─────────────────────────────────────────────────────────────┐
│              SMART CONTRACTS (Blockchain)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Settlement Contract                                   │  │
│  │ - Atomic swaps                                        │  │
│  │ - Escrow temporaire (smart contract, pas custody)    │  │
│  │ - Exécution automatique si conditions remplies        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3. Flux de Trading

#### Création d'ordre (Maker)
1. User signe l'ordre avec sa clé privée (local)
2. Ordre signé envoyé au backend
3. Backend vérifie la signature (sans connaître la clé)
4. Ordre ajouté à l'order book

#### Exécution d'ordre (Taker)
1. Taker signe son ordre
2. Backend match maker + taker
3. Transactions envoyées au smart contract
4. Smart contract exécute l'atomic swap
5. Fonds transférés directement wallet-to-wallet

### 4. Ce que le Backend NE FAIT PAS
- ❌ Stocker des clés privées
- ❌ Détenir des fonds
- ❌ Signer des transactions pour les users
- ❌ Avoir accès aux wallets

### 5. Ce que le Backend FAIT
- ✅ Order book matching
- ✅ Vérification de signatures
- ✅ Propagation P2P
- ✅ Statistiques et analytics
- ✅ Interface API

### 6. Avantages
- **Sécurité**: Même si le serveur est compromis, pas de vol de fonds
- **Confidentialité**: Pas d'association entre adresses
- **Décentralisation**: Les nœuds P2P peuvent fonctionner indépendamment
- **Trustless**: Pas besoin de faire confiance au serveur
