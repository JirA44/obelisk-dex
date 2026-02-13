# OBELISK - Setup Firebase & Cloudflare

Guide rapide pour configurer Firebase Auth et Cloudflare.

## Firebase Setup (5 minutes)

### 1. Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer "Add project"
3. Nommer le projet (ex: "obelisk-prod")
4. Désactiver Google Analytics (optionnel)
5. Créer le projet

### 2. Activer Authentication

1. Dans le menu gauche: **Build > Authentication**
2. Cliquer "Get started"
3. Onglet "Sign-in method", activer:
   - **Email/Password** ✅
   - **Google** ✅ (configurer OAuth)
   - **Twitter** ✅ (nécessite API keys Twitter)
   - **GitHub** ✅ (nécessite OAuth app GitHub)

### 3. Configuration Frontend

1. **Project Settings > General > Your apps**
2. Cliquer l'icône Web `</>`
3. Nommer l'app, cliquer Register
4. Copier le `firebaseConfig`
5. Coller dans `obelisk-dex/js/firebase-auth.js`:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "obelisk-prod.firebaseapp.com",
    projectId: "obelisk-prod",
    // ... reste de la config
};
```

### 4. Configuration Backend

1. **Project Settings > Service accounts**
2. Cliquer "Generate new private key"
3. Sauvegarder le fichier JSON
4. Dans `.env`:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

Ou pour les déploiements cloud:

```env
FIREBASE_PROJECT_ID=obelisk-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@obelisk-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 5. Migration DB

```bash
cd obelisk-backend
sqlite3 obelisk.db < migrations/001_add_firebase_auth.sql
```

### 6. Installer les dépendances

```bash
npm install firebase-admin
```

### 7. Tester

1. Ouvrir le frontend
2. Cliquer "Sign In"
3. Créer un compte avec email ou Google
4. Vérifier dans Firebase Console > Authentication > Users

---

## Cloudflare Setup (10 minutes)

### Option A: Cloudflare Pages (Frontend)

1. Aller sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Pages > Create a project**
3. Connecter votre repo Git
4. Configurer le build:
   - Build command: (laisser vide, fichiers statiques)
   - Build output directory: `obelisk-dex`
5. Deploy!

Les fichiers `_headers` et `_redirects` sont automatiquement utilisés.

**Domaine custom:**
1. Pages > votre projet > Custom domains
2. Ajouter votre domaine
3. Cloudflare gère le SSL automatiquement

### Option B: Cloudflare Workers (API)

#### Installation Wrangler

```bash
npm install -g wrangler
wrangler login
```

#### Configuration

Éditer `wrangler.toml`:

```toml
name = "obelisk-api"
account_id = "your-account-id"  # Dashboard > Overview > Account ID
```

#### Secrets

```bash
wrangler secret put ADMIN_API_KEY
# Entrer votre clé admin

wrangler secret put FIREBASE_PROJECT_ID
# Entrer votre project ID
```

#### Deploy

```bash
wrangler publish
```

#### Domaine custom

1. Workers > votre worker > Triggers
2. Add Custom Domain
3. Entrer `api.votre-domaine.com`

### Option C: Full Stack avec Cloudflare

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (DNS + CDN)   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐       ┌──────────▼──────────┐
    │  Cloudflare Pages │       │  Cloudflare Workers │
    │    (Frontend)     │       │      (API)          │
    │   obelisk-dex/    │       │   worker.js         │
    └───────────────────┘       └──────────┬──────────┘
                                           │
                                ┌──────────▼──────────┐
                                │   Backend Server    │
                                │   (Railway/Render)  │
                                │   server-ultra.js   │
                                └─────────────────────┘
```

---

## Architecture Recommandée

### Production

| Composant | Service | URL |
|-----------|---------|-----|
| Frontend | Cloudflare Pages | obelisk.io |
| API Proxy | Cloudflare Workers | api.obelisk.io |
| Backend | Railway/Render | (interne) |
| Auth | Firebase | (SDK) |
| DB | SQLite → PostgreSQL | (interne) |

### Avantages

- **Cloudflare Pages**: CDN global, SSL auto, preview deploys
- **Cloudflare Workers**: Edge computing, rate limiting, caching
- **Firebase Auth**: Multi-provider, sécurisé, gratuit jusqu'à 50k users/mois
- **Railway/Render**: Backend Node.js managé, auto-scaling

---

## Commandes Utiles

```bash
# Cloudflare
wrangler dev                    # Dev local
wrangler publish                # Deploy Worker
wrangler tail                   # Logs en temps réel
wrangler secret list            # Voir les secrets

# Firebase
firebase deploy --only hosting  # Deploy frontend
firebase auth:export users.json # Export users
```

---

## Coûts Estimés

| Service | Gratuit | Payant |
|---------|---------|--------|
| Cloudflare Pages | Illimité | - |
| Cloudflare Workers | 100k req/jour | $5/mois (10M req) |
| Firebase Auth | 50k users/mois | $0.0055/user après |
| Railway | $5 crédit/mois | $0.01/GB-hour |
| Render | 750h/mois | $7/mois |

**Estimation pour 10k users actifs: ~$15-25/mois**

---

## Checklist Finale

- [ ] Firebase project créé
- [ ] Email/Password activé
- [ ] Google OAuth configuré
- [ ] Service account téléchargé
- [ ] `.env` configuré avec Firebase
- [ ] `firebase-auth.js` configuré
- [ ] Migration DB exécutée
- [ ] Cloudflare Pages connecté au repo
- [ ] Domaine custom configuré
- [ ] Workers déployé (optionnel)
- [ ] Test login email
- [ ] Test login Google
- [ ] Test connexion wallet

---

*Setup time: ~30 minutes*
