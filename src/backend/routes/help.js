/**
 * OBELISK Help Center
 * Guide d'utilisation du site pour les novices
 */

const express = require('express');
const router = express.Router();

// ===========================================
// GUIDE DES FONCTIONNALITÉS
// ===========================================

const FEATURES_GUIDE = {
  // Navigation principale
  'navigation': {
    id: 'navigation',
    title: "Naviguer sur OBELISK",
    category: "bases",
    content: {
      intro: "Découvrez les différentes sections du site.",
      sections: [
        {
          title: "🏠 Dashboard (Tableau de bord)",
          description: "Votre page d'accueil personnalisée",
          details: [
            "Vue d'ensemble de votre portefeuille",
            "Résumé de vos gains/pertes",
            "Alertes et notifications importantes",
            "Accès rapide aux actions fréquentes"
          ]
        },
        {
          title: "📊 Markets (Marchés)",
          description: "Tous les actifs disponibles au trading",
          details: [
            "Liste des cryptos avec prix en temps réel",
            "Variation sur 24h (vert = hausse, rouge = baisse)",
            "Volume de trading",
            "Cliquez sur une crypto pour voir les détails"
          ]
        },
        {
          title: "💼 Portfolio",
          description: "Vos actifs et leur valeur",
          details: [
            "Liste de vos cryptos",
            "Valeur totale en euros/dollars",
            "Performance (gains/pertes)",
            "Historique des transactions"
          ]
        },
        {
          title: "📈 Trade",
          description: "Achetez et vendez des cryptos",
          details: [
            "Graphique de prix",
            "Formulaire d'achat/vente",
            "Carnet d'ordres",
            "Historique de vos trades"
          ]
        },
        {
          title: "💰 Earn (Gagner)",
          description: "Revenus passifs sans trader",
          details: [
            "Staking : bloquez vos cryptos pour gagner des intérêts",
            "Vaults : stratégies automatisées",
            "Bonds : rendement fixe garanti"
          ]
        }
      ]
    }
  },

  // Connexion wallet
  'connect-wallet': {
    id: 'connect-wallet',
    title: "Connecter son Wallet",
    category: "premiers-pas",
    content: {
      intro: "Comment connecter votre portefeuille à OBELISK.",
      steps: [
        {
          step: 1,
          title: "Cliquez sur 'Connecter Wallet'",
          description: "Bouton en haut à droite de la page",
          image: "connect-button",
          tip: "Le bouton peut aussi afficher 'Connect Wallet' en anglais"
        },
        {
          step: 2,
          title: "Choisissez votre wallet",
          description: "Sélectionnez MetaMask, WalletConnect, ou autre",
          image: "wallet-options",
          options: [
            { name: "MetaMask", desc: "Extension navigateur, le plus courant" },
            { name: "WalletConnect", desc: "Pour les wallets mobiles" },
            { name: "Coinbase Wallet", desc: "Wallet de Coinbase" },
            { name: "Rabby", desc: "Alternative sécurisée à MetaMask" }
          ]
        },
        {
          step: 3,
          title: "Approuvez la connexion",
          description: "Votre wallet affiche une demande de connexion",
          image: "approve-connection",
          warning: "Vérifiez que l'URL est bien obelisk.trading avant d'approuver"
        },
        {
          step: 4,
          title: "C'est fait !",
          description: "Votre adresse apparaît en haut à droite",
          image: "connected",
          tip: "Vous pouvez voir votre adresse abrégée (0x742d...f8fE)"
        }
      ],
      troubleshooting: [
        {
          problem: "Le bouton ne réagit pas",
          solution: "Vérifiez que votre wallet est bien installé et déverrouillé"
        },
        {
          problem: "Erreur de réseau",
          solution: "Votre wallet doit être sur le bon réseau (Ethereum, Arbitrum...)"
        },
        {
          problem: "La connexion échoue",
          solution: "Rafraîchissez la page et réessayez. Désactivez les autres extensions."
        }
      ]
    }
  },

  // Trading
  'how-to-trade': {
    id: 'how-to-trade',
    title: "Comment trader",
    category: "trading",
    content: {
      intro: "Guide étape par étape pour acheter ou vendre des cryptos.",
      steps: [
        {
          step: 1,
          title: "Choisir la paire",
          description: "Ex: BTC/USDT = échanger Bitcoin contre USDT",
          image: "select-pair",
          details: [
            "Utilisez la barre de recherche pour trouver une crypto",
            "Les paires les plus tradées sont en haut",
            "Le prix affiché est le prix actuel du marché"
          ]
        },
        {
          step: 2,
          title: "Choisir Acheter ou Vendre",
          description: "Bouton vert = Acheter, Rouge = Vendre",
          image: "buy-sell-buttons",
          explanation: {
            buy: "Vous dépensez des USDT pour obtenir du BTC",
            sell: "Vous vendez votre BTC pour obtenir des USDT"
          }
        },
        {
          step: 3,
          title: "Entrer le montant",
          description: "Combien voulez-vous acheter/vendre ?",
          image: "enter-amount",
          tips: [
            "Vous pouvez entrer un montant en crypto (ex: 0.01 BTC)",
            "Ou cliquer sur 25%, 50%, 75%, 100% de votre solde",
            "Le montant équivalent en $ s'affiche automatiquement"
          ]
        },
        {
          step: 4,
          title: "Choisir le type d'ordre",
          description: "Market (immédiat) ou Limit (à votre prix)",
          image: "order-type",
          types: [
            {
              name: "Market",
              desc: "Exécution immédiate au prix actuel",
              when: "Quand vous voulez agir vite"
            },
            {
              name: "Limit",
              desc: "Exécution uniquement à votre prix choisi",
              when: "Quand vous avez un prix cible"
            }
          ]
        },
        {
          step: 5,
          title: "Vérifier et Confirmer",
          description: "Relisez les détails avant de valider",
          image: "confirm-order",
          checklist: [
            "Montant correct ?",
            "Prix acceptable ?",
            "Frais affichés ?",
            "Stop Loss configuré ? (recommandé)"
          ]
        },
        {
          step: 6,
          title: "Approuver dans le wallet",
          description: "Votre wallet demande confirmation",
          image: "wallet-approve",
          warning: "Vérifiez le montant et les frais avant d'approuver"
        }
      ],
      video: "https://obelisk.trading/tutorials/first-trade"
    }
  },

  // Stop Loss
  'stop-loss': {
    id: 'stop-loss',
    title: "Configurer un Stop Loss",
    category: "trading",
    content: {
      intro: "Le Stop Loss vend automatiquement si le prix baisse trop. C'est votre filet de sécurité.",
      why: {
        title: "Pourquoi c'est important ?",
        reasons: [
          "Limite vos pertes automatiquement",
          "Fonctionne même quand vous dormez",
          "Évite les décisions émotionnelles",
          "Protège votre capital"
        ]
      },
      howTo: {
        title: "Comment le configurer",
        steps: [
          {
            step: 1,
            action: "Lors de l'achat, activez 'Stop Loss'",
            image: "enable-sl"
          },
          {
            step: 2,
            action: "Entrez le prix de déclenchement",
            example: "Si vous achetez BTC à 40,000$, mettez un SL à 38,000$ (5% de perte max)",
            image: "set-sl-price"
          },
          {
            step: 3,
            action: "Ou utilisez un pourcentage",
            example: "Stop Loss à -5% = vente si le prix baisse de 5%",
            image: "sl-percentage"
          }
        ]
      },
      examples: [
        {
          title: "Exemple pratique",
          scenario: "Vous achetez 0.1 ETH à 2,000$",
          stopLoss: "Vous mettez un Stop Loss à 1,900$ (-5%)",
          result: "Si ETH descend à 1,900$, vente automatique. Perte limitée à ~10$ au lieu de potentiellement plus."
        }
      ],
      tips: [
        "Ne mettez pas le SL trop serré (ex: -1%) sinon il se déclenche sur les petites fluctuations",
        "Un SL entre -3% et -10% est courant selon votre tolérance au risque",
        "Vous pouvez modifier ou annuler un SL à tout moment"
      ]
    }
  },

  // Portfolio
  'portfolio': {
    id: 'portfolio',
    title: "Comprendre son Portfolio",
    category: "portfolio",
    content: {
      intro: "Tout savoir sur la page Portfolio.",
      sections: [
        {
          title: "💰 Valeur totale",
          description: "La valeur combinée de toutes vos cryptos en euros/dollars",
          note: "Cette valeur change en temps réel avec les prix du marché"
        },
        {
          title: "📊 Répartition",
          description: "Graphique montrant la distribution de vos actifs",
          tip: "Diversifier = ne pas tout mettre dans une seule crypto"
        },
        {
          title: "📈 Performance",
          description: "Combien vous avez gagné ou perdu",
          details: [
            "PnL (Profit and Loss) = Gains - Pertes",
            "Vert = vous êtes en profit",
            "Rouge = vous êtes en perte",
            "% = variation en pourcentage"
          ]
        },
        {
          title: "📜 Historique",
          description: "Liste de toutes vos transactions passées",
          filters: ["Par date", "Par crypto", "Par type (achat/vente)"]
        }
      ],
      metrics: [
        {
          name: "Valeur initiale",
          desc: "Combien vous avez investi au total"
        },
        {
          name: "Valeur actuelle",
          desc: "Combien ça vaut maintenant"
        },
        {
          name: "PnL réalisé",
          desc: "Gains/pertes sur les trades fermés"
        },
        {
          name: "PnL non réalisé",
          desc: "Gains/pertes potentiels si vous vendiez maintenant"
        }
      ]
    }
  },

  // Alertes
  'alerts': {
    id: 'alerts',
    title: "Créer des alertes de prix",
    category: "outils",
    content: {
      intro: "Soyez notifié quand une crypto atteint un certain prix.",
      howTo: {
        steps: [
          {
            step: 1,
            action: "Allez sur la page de la crypto",
            image: "crypto-page"
          },
          {
            step: 2,
            action: "Cliquez sur l'icône cloche 🔔",
            image: "alert-icon"
          },
          {
            step: 3,
            action: "Choisissez la condition",
            options: [
              "Prix supérieur à... (pour acheter moins cher)",
              "Prix inférieur à... (pour vendre avant une chute)"
            ]
          },
          {
            step: 4,
            action: "Entrez le prix cible",
            example: "Alerte si BTC > 50,000$"
          },
          {
            step: 5,
            action: "Choisissez le mode de notification",
            options: ["Email", "Push notification", "Les deux"]
          }
        ]
      },
      useCases: [
        {
          title: "Acheter au bon moment",
          example: "ETH est à 2,500$. Je veux acheter si ça descend à 2,000$. Alerte : ETH < 2,000$"
        },
        {
          title: "Protéger ses gains",
          example: "J'ai acheté BTC à 40,000$, maintenant à 45,000$. Alerte si BTC < 43,000$ pour sécuriser mes gains."
        },
        {
          title: "Détecter un breakout",
          example: "SOL bloqué sous 100$ depuis des semaines. Alerte si SOL > 100$ pour ne pas rater la hausse."
        }
      ]
    }
  },

  // Staking
  'staking-guide': {
    id: 'staking-guide',
    title: "Comment staker ses cryptos",
    category: "earn",
    content: {
      intro: "Gagnez des récompenses en bloquant vos cryptos.",
      steps: [
        {
          step: 1,
          title: "Allez dans 'Earn' > 'Staking'",
          image: "earn-menu"
        },
        {
          step: 2,
          title: "Choisissez un pool de staking",
          description: "Comparez les APY et les conditions",
          image: "staking-pools",
          toCompare: [
            "APY (rendement annuel)",
            "Durée de blocage",
            "Montant minimum",
            "Crypto acceptée"
          ]
        },
        {
          step: 3,
          title: "Entrez le montant à staker",
          image: "stake-amount",
          tip: "Commencez petit pour tester"
        },
        {
          step: 4,
          title: "Lisez les conditions",
          image: "terms",
          important: [
            "Période de blocage (unstaking period)",
            "Risques associés",
            "Comment retirer ses fonds"
          ]
        },
        {
          step: 5,
          title: "Confirmez dans votre wallet",
          image: "confirm-stake"
        }
      ],
      earnings: {
        title: "Où voir mes gains ?",
        answer: "Dans 'Portfolio' > 'Staking', vous voyez vos positions actives et les récompenses accumulées."
      },
      unstaking: {
        title: "Comment retirer ?",
        steps: [
          "Allez dans 'Portfolio' > 'Staking'",
          "Cliquez sur 'Unstake' à côté de votre position",
          "Attendez la période de déblocage (si applicable)",
          "Vos fonds reviennent dans votre wallet"
        ]
      }
    }
  },

  // Paramètres
  'settings': {
    id: 'settings',
    title: "Les paramètres du compte",
    category: "compte",
    content: {
      intro: "Personnalisez votre expérience OBELISK.",
      sections: [
        {
          title: "👤 Profil",
          options: [
            "Nom d'affichage",
            "Email (pour les notifications)",
            "Avatar"
          ]
        },
        {
          title: "🔐 Sécurité",
          options: [
            "Activer 2FA (fortement recommandé)",
            "Sessions actives",
            "Historique des connexions"
          ]
        },
        {
          title: "🔔 Notifications",
          options: [
            "Alertes de prix",
            "Confirmations de trade",
            "Newsletters",
            "Push notifications"
          ]
        },
        {
          title: "🎨 Apparence",
          options: [
            "Thème (sombre/clair)",
            "Langue",
            "Devise d'affichage (EUR, USD...)"
          ]
        },
        {
          title: "⚙️ Trading",
          options: [
            "Mode débutant (interface simplifiée)",
            "Confirmation avant chaque trade",
            "Stop Loss par défaut"
          ]
        }
      ]
    }
  },

  // API Keys
  'api-keys': {
    id: 'api-keys',
    title: "Créer des clés API",
    category: "avancé",
    content: {
      intro: "Les clés API permettent à des applications externes de trader pour vous.",
      warning: "⚠️ Fonctionnalité avancée. Ne partagez JAMAIS vos clés API.",
      steps: [
        {
          step: 1,
          action: "Allez dans Paramètres > API Keys"
        },
        {
          step: 2,
          action: "Cliquez sur 'Créer une nouvelle clé'"
        },
        {
          step: 3,
          action: "Donnez-lui un nom descriptif",
          example: "Bot Trading Maison"
        },
        {
          step: 4,
          action: "Choisissez les permissions",
          options: ["Lecture seule", "Trading", "Retrait (dangereux)"]
        },
        {
          step: 5,
          action: "Copiez la clé générée",
          warning: "Elle ne sera plus affichée ensuite !"
        }
      ],
      security: [
        "Ne donnez que les permissions nécessaires",
        "Utilisez une IP whitelist si possible",
        "Supprimez les clés non utilisées",
        "N'activez JAMAIS les retraits sauf si absolument nécessaire"
      ]
    }
  }
};

// ===========================================
// TOOLTIPS CONTEXTUELS
// ===========================================

const TOOLTIPS = {
  // Trading
  'price': "Prix actuel de l'actif sur le marché",
  'change-24h': "Variation du prix sur les dernières 24 heures",
  'volume': "Montant total échangé sur 24h. Volume élevé = actif populaire",
  'market-cap': "Valeur totale de tous les tokens en circulation",
  'buy-button': "Acheter = vous pensez que le prix va monter",
  'sell-button': "Vendre = vous échangez vos cryptos contre des stablecoins",
  'market-order': "Achat/vente immédiat au meilleur prix disponible",
  'limit-order': "Achat/vente uniquement quand le prix atteint votre cible",
  'amount-input': "Quantité à acheter ou vendre",
  'total': "Coût total de la transaction (montant × prix + frais)",
  'slippage': "Différence possible entre prix affiché et prix réel d'exécution",
  'gas-fee': "Frais payés aux mineurs/validateurs du réseau blockchain",

  // Portfolio
  'pnl': "Profit and Loss - Vos gains ou pertes totaux",
  'unrealized-pnl': "Gains/pertes si vous vendiez maintenant (non encaissés)",
  'realized-pnl': "Gains/pertes sur vos trades déjà fermés",
  'allocation': "Répartition de vos investissements entre différents actifs",
  'avg-buy-price': "Prix moyen auquel vous avez acheté cet actif",

  // Staking
  'apy': "Rendement annuel en pourcentage, intérêts composés inclus",
  'tvl': "Total Value Locked - Montant total déposé dans ce protocole",
  'lock-period': "Durée pendant laquelle vos fonds sont bloqués",
  'rewards': "Récompenses gagnées grâce au staking",

  // Sécurité
  '2fa': "Double authentification - Sécurité renforcée avec votre téléphone",
  'seed-phrase': "12-24 mots pour récupérer votre wallet. À garder SECRET",
  'private-key': "Clé secrète de votre wallet. NE JAMAIS PARTAGER",

  // Ordres
  'stop-loss': "Vend automatiquement si le prix descend sous un seuil",
  'take-profit': "Vend automatiquement quand le prix atteint votre objectif",
  'trailing-stop': "Stop Loss qui suit le prix à la hausse",
};

// ===========================================
// MESSAGES D'ERREUR EXPLIQUÉS
// ===========================================

const ERROR_EXPLANATIONS = {
  'insufficient-balance': {
    title: "Solde insuffisant",
    explanation: "Vous n'avez pas assez de fonds pour cette transaction.",
    solutions: [
      "Vérifiez votre solde disponible",
      "Réduisez le montant de la transaction",
      "Déposez plus de fonds dans votre wallet"
    ]
  },
  'slippage-too-high': {
    title: "Slippage trop élevé",
    explanation: "Le prix a trop bougé entre le moment où vous avez cliqué et l'exécution.",
    solutions: [
      "Réessayez avec un slippage toléré plus élevé (ex: 1% au lieu de 0.5%)",
      "Tradez un montant plus petit",
      "Attendez que le marché soit plus stable"
    ]
  },
  'transaction-rejected': {
    title: "Transaction rejetée",
    explanation: "Vous avez refusé la transaction dans votre wallet.",
    solutions: [
      "Si c'était voulu, pas de problème",
      "Si non, réessayez et approuvez dans votre wallet"
    ]
  },
  'network-error': {
    title: "Erreur réseau",
    explanation: "Problème de connexion avec la blockchain.",
    solutions: [
      "Vérifiez votre connexion internet",
      "Le réseau peut être congestionné, réessayez plus tard",
      "Essayez de changer de RPC dans votre wallet"
    ]
  },
  'gas-estimation-failed': {
    title: "Estimation du gas échouée",
    explanation: "Impossible de calculer les frais de transaction.",
    solutions: [
      "La transaction pourrait échouer, vérifiez les paramètres",
      "Vérifiez que vous avez assez d'ETH pour le gas",
      "Réessayez dans quelques minutes"
    ]
  },
  'price-impact-too-high': {
    title: "Impact sur le prix trop élevé",
    explanation: "Votre ordre est si gros qu'il ferait bouger le prix significativement.",
    solutions: [
      "Divisez votre ordre en plusieurs petits ordres",
      "Utilisez un ordre limit au lieu de market",
      "Tradez sur une paire avec plus de liquidité"
    ]
  }
};

// ===========================================
// ROUTES
// ===========================================

/**
 * GET /api/help/features
 * Liste des guides de fonctionnalités
 */
router.get('/features', (req, res) => {
  const features = Object.values(FEATURES_GUIDE).map(f => ({
    id: f.id,
    title: f.title,
    category: f.category,
  }));

  const categories = [...new Set(features.map(f => f.category))];

  res.json({ features, categories });
});

/**
 * GET /api/help/features/:id
 * Guide détaillé d'une fonctionnalité
 */
router.get('/features/:id', (req, res) => {
  const feature = FEATURES_GUIDE[req.params.id];
  if (!feature) {
    return res.status(404).json({ error: 'Guide non trouvé' });
  }
  res.json(feature);
});

/**
 * GET /api/help/tooltips
 * Tous les tooltips
 */
router.get('/tooltips', (req, res) => {
  res.json({ tooltips: TOOLTIPS });
});

/**
 * GET /api/help/tooltip/:key
 * Un tooltip spécifique
 */
router.get('/tooltip/:key', (req, res) => {
  const tooltip = TOOLTIPS[req.params.key];
  if (!tooltip) {
    return res.status(404).json({ error: 'Tooltip non trouvé' });
  }
  res.json({ key: req.params.key, text: tooltip });
});

/**
 * GET /api/help/errors
 * Explications des erreurs
 */
router.get('/errors', (req, res) => {
  res.json({ errors: ERROR_EXPLANATIONS });
});

/**
 * GET /api/help/error/:code
 * Explication d'une erreur spécifique
 */
router.get('/error/:code', (req, res) => {
  const error = ERROR_EXPLANATIONS[req.params.code];
  if (!error) {
    return res.json({
      title: "Erreur inconnue",
      explanation: "Une erreur inattendue s'est produite.",
      solutions: [
        "Rafraîchissez la page",
        "Réessayez dans quelques instants",
        "Contactez le support si le problème persiste"
      ]
    });
  }
  res.json(error);
});

/**
 * GET /api/help/search
 * Recherche dans l'aide
 */
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.json({ results: [] });
  }

  const query = q.toLowerCase();
  const results = [];

  // Chercher dans les features
  Object.values(FEATURES_GUIDE).forEach(feature => {
    if (feature.title.toLowerCase().includes(query) ||
        JSON.stringify(feature.content).toLowerCase().includes(query)) {
      results.push({
        type: 'feature',
        id: feature.id,
        title: feature.title,
        category: feature.category,
        url: `/help/features/${feature.id}`
      });
    }
  });

  // Chercher dans les tooltips
  Object.entries(TOOLTIPS).forEach(([key, value]) => {
    if (key.includes(query) || value.toLowerCase().includes(query)) {
      results.push({
        type: 'tooltip',
        id: key,
        title: key.replace(/-/g, ' '),
        preview: value,
      });
    }
  });

  res.json({
    query: q,
    results: results.slice(0, 10),
    total: results.length
  });
});

/**
 * GET /api/help/shortcuts
 * Raccourcis clavier
 */
router.get('/shortcuts', (req, res) => {
  res.json({
    shortcuts: [
      { keys: ['Ctrl', 'K'], action: "Rechercher une crypto" },
      { keys: ['Ctrl', 'B'], action: "Acheter" },
      { keys: ['Ctrl', 'S'], action: "Vendre" },
      { keys: ['Escape'], action: "Fermer le popup" },
      { keys: ['?'], action: "Afficher l'aide" },
      { keys: ['D'], action: "Aller au Dashboard" },
      { keys: ['M'], action: "Aller aux Markets" },
      { keys: ['P'], action: "Aller au Portfolio" },
      { keys: ['T'], action: "Aller au Trade" },
    ]
  });
});

/**
 * GET /api/help/contact
 * Options de contact support
 */
router.get('/contact', (req, res) => {
  res.json({
    options: [
      {
        type: "email",
        value: "support@obelisk.trading",
        description: "Réponse sous 24-48h"
      },
      {
        type: "discord",
        value: "https://discord.gg/obelisk",
        description: "Communauté et support en direct"
      },
      {
        type: "twitter",
        value: "@ObeliskDEX",
        description: "Annonces et support rapide"
      },
      {
        type: "docs",
        value: "https://docs.obelisk.trading",
        description: "Documentation complète"
      }
    ],
    hours: "Support disponible 7j/7, réponse plus rapide en semaine"
  });
});

/**
 * GET /api/help/videos
 * Tutoriels vidéo
 */
router.get('/videos', (req, res) => {
  res.json({
    videos: [
      {
        id: "getting-started",
        title: "Premiers pas sur OBELISK",
        duration: "5:30",
        thumbnail: "/thumbnails/getting-started.jpg",
        url: "https://youtube.com/watch?v=xxx",
        category: "débutant"
      },
      {
        id: "first-trade",
        title: "Votre premier trade",
        duration: "4:15",
        thumbnail: "/thumbnails/first-trade.jpg",
        url: "https://youtube.com/watch?v=xxx",
        category: "débutant"
      },
      {
        id: "stop-loss",
        title: "Configurer un Stop Loss",
        duration: "3:45",
        thumbnail: "/thumbnails/stop-loss.jpg",
        url: "https://youtube.com/watch?v=xxx",
        category: "trading"
      },
      {
        id: "staking-101",
        title: "Le staking expliqué",
        duration: "6:00",
        thumbnail: "/thumbnails/staking.jpg",
        url: "https://youtube.com/watch?v=xxx",
        category: "earn"
      },
      {
        id: "security-tips",
        title: "Sécuriser son compte",
        duration: "4:30",
        thumbnail: "/thumbnails/security.jpg",
        url: "https://youtube.com/watch?v=xxx",
        category: "sécurité"
      }
    ]
  });
});

/**
 * GET /api/help/checklist
 * Checklist pour nouveaux utilisateurs
 */
router.get('/checklist', (req, res) => {
  res.json({
    title: "Checklist nouveau trader",
    items: [
      { id: "wallet", label: "✅ J'ai créé un wallet (MetaMask ou autre)", required: true },
      { id: "backup", label: "✅ J'ai sauvegardé ma seed phrase sur papier", required: true },
      { id: "connected", label: "✅ J'ai connecté mon wallet à OBELISK", required: true },
      { id: "security", label: "✅ J'ai lu le guide de sécurité", required: true },
      { id: "terms", label: "✅ J'ai accepté les conditions d'utilisation", required: true },
      { id: "risk", label: "✅ Je comprends que je peux perdre de l'argent", required: true },
      { id: "2fa", label: "🔒 J'ai activé la double authentification", required: false },
      { id: "small-start", label: "💡 Je commence avec un petit montant", required: false },
      { id: "stop-loss", label: "🛑 J'utilise des Stop Loss", required: false }
    ]
  });
});

module.exports = router;
