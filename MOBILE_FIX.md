# Fix Obelisk inaccessible sur iPhone

## Problème
Site inaccessible sur iPhone (Chrome/Brave) : "Impossible de trouver l'IP"

## URL correcte
```
https://obelisk-dex.pages.dev
```

## Solutions

### 1. Safari (recommandé)
- Utiliser Safari au lieu de Chrome/Brave sur iOS
- Safari gère mieux les certificats Cloudflare

### 2. Vider cache DNS iPhone
**Réglages → Wi-Fi → (i) → Configurer DNS → Manuel**
```
DNS 1: 1.1.1.1
DNS 2: 8.8.8.8
```

### 3. Mode Avion
1. Activer mode Avion (10 sec)
2. Désactiver
3. Réessayer

### 4. Vider cache navigateur
**Chrome/Brave → Réglages → Confidentialité → Effacer données**
- Cocher : Cache + Cookies
- Effacer

### 5. Connexion 4G/5G
- Désactiver Wi-Fi
- Utiliser données mobiles
- Si ça marche → problème DNS du Wi-Fi

### 6. URL alternative (si rien ne marche)
```
https://b04102a7.obelisk-dex.pages.dev
```

## Vérification
Si ça fonctionne :
- ✅ Page d'accueil "Obelisk DEX - Votre Banque Privée"
- ✅ Bouton "🚀 Essayer Gratuitement"

## Contact
Si rien ne fonctionne : business@obelisk-dex.com
