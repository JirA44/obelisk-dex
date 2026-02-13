/**
 * OBELISK Education Center
 * Content for complete beginners in crypto
 */

const express = require('express');
const router = express.Router();

// ===========================================
// LEARNING PATHS
// ===========================================

const LEARNING_PATHS = [
  {
    id: 'crypto-basics',
    title: 'Comprendre les Cryptos',
    description: 'Découvrez ce que sont les cryptomonnaies et comment elles fonctionnent',
    icon: '🪙',
    duration: '15 min',
    level: 'débutant',
    modules: ['what-is-crypto', 'what-is-blockchain', 'wallets-101', 'security-basics'],
  },
  {
    id: 'first-steps',
    title: 'Premiers Pas',
    description: 'Configurez votre wallet et faites votre première transaction',
    icon: '👣',
    duration: '20 min',
    level: 'débutant',
    modules: ['create-wallet', 'connect-wallet', 'first-purchase', 'send-receive'],
  },
  {
    id: 'trading-basics',
    title: 'Bases du Trading',
    description: 'Apprenez à lire les graphiques et passer vos premiers ordres',
    icon: '📈',
    duration: '25 min',
    level: 'débutant',
    modules: ['buy-sell', 'order-types', 'reading-charts', 'risk-management'],
  },
  {
    id: 'passive-income',
    title: 'Revenus Passifs',
    description: 'Gagnez des intérêts sur vos cryptos sans trader',
    icon: '💰',
    duration: '15 min',
    level: 'débutant',
    modules: ['what-is-staking', 'vaults-explained', 'apy-explained', 'choose-strategy'],
  },
  {
    id: 'defi-intro',
    title: 'Introduction à la DeFi',
    description: 'Découvrez la finance décentralisée',
    icon: '🏦',
    duration: '30 min',
    level: 'intermédiaire',
    modules: ['what-is-defi', 'liquidity-pools', 'yield-farming', 'defi-risks'],
  },
];

// ===========================================
// EDUCATIONAL MODULES
// ===========================================

const MODULES = {
  // Crypto Basics
  'what-is-crypto': {
    id: 'what-is-crypto',
    title: "C'est quoi une cryptomonnaie ?",
    duration: '4 min',
    content: {
      intro: "Une cryptomonnaie est une monnaie numérique qui fonctionne sans banque ni gouvernement.",
      sections: [
        {
          title: "En termes simples",
          content: "Imaginez de l'argent qui existe uniquement sur Internet, que vous pouvez envoyer à n'importe qui dans le monde en quelques secondes, sans passer par une banque.",
          icon: "💡"
        },
        {
          title: "Comment ça marche ?",
          content: "Les cryptos utilisent une technologie appelée 'blockchain' - un grand livre de comptes partagé par des milliers d'ordinateurs. Personne ne peut tricher car tout le monde vérifie.",
          icon: "⛓️"
        },
        {
          title: "Bitcoin vs les autres",
          content: "Bitcoin (BTC) est la première crypto, créée en 2009. Depuis, des milliers d'autres sont apparues : Ethereum (ETH), Solana (SOL), etc. Chacune a ses particularités.",
          icon: "₿"
        },
        {
          title: "Pourquoi ça a de la valeur ?",
          content: "Comme l'or ou l'art : parce que les gens y croient et veulent en posséder. L'offre est limitée (21 millions de Bitcoin max), ce qui peut faire monter le prix si la demande augmente.",
          icon: "💎"
        }
      ],
      keyPoints: [
        "Monnaie numérique, pas de billets physiques",
        "Fonctionne sans banque (décentralisé)",
        "Sécurisé par la cryptographie",
        "Transparent : toutes les transactions sont publiques"
      ],
      quiz: [
        {
          question: "Qui contrôle le Bitcoin ?",
          options: ["Une banque", "Un gouvernement", "Personne (décentralisé)", "Elon Musk"],
          correct: 2,
          explanation: "Bitcoin est décentralisé : aucune entité unique ne le contrôle. C'est le réseau d'utilisateurs qui le fait fonctionner."
        }
      ]
    }
  },

  'what-is-blockchain': {
    id: 'what-is-blockchain',
    title: "La Blockchain expliquée simplement",
    duration: '4 min',
    content: {
      intro: "La blockchain est la technologie qui fait fonctionner les cryptomonnaies.",
      sections: [
        {
          title: "Un registre partagé",
          content: "Imaginez un cahier où on note toutes les transactions, et dont des milliers de personnes ont une copie identique. Si quelqu'un essaie de tricher, les autres copies montrent la fraude.",
          icon: "📒"
        },
        {
          title: "Pourquoi 'blockchain' ?",
          content: "Les transactions sont groupées en 'blocs', et chaque bloc est lié au précédent comme une chaîne. D'où le nom : chaîne de blocs = blockchain.",
          icon: "🔗"
        },
        {
          title: "Impossible à falsifier",
          content: "Modifier une transaction passée nécessiterait de changer tous les blocs suivants ET de convaincre la majorité du réseau. C'est pratiquement impossible.",
          icon: "🛡️"
        }
      ],
      keyPoints: [
        "Base de données distribuée sur des milliers d'ordinateurs",
        "Chaque transaction est vérifiée par le réseau",
        "Une fois enregistrée, une transaction ne peut plus être modifiée",
        "Transparent : tout le monde peut voir l'historique"
      ]
    }
  },

  'wallets-101': {
    id: 'wallets-101',
    title: "Les Wallets (Portefeuilles)",
    duration: '4 min',
    content: {
      intro: "Un wallet crypto, c'est comme un coffre-fort numérique pour vos cryptomonnaies.",
      sections: [
        {
          title: "Ce n'est PAS une banque",
          content: "Contrairement à un compte bancaire, VOUS êtes le seul à contrôler votre wallet. Pas de service client pour récupérer un mot de passe perdu !",
          icon: "🔐"
        },
        {
          title: "Clé publique = Adresse",
          content: "Comme un numéro de compte bancaire (IBAN). Vous pouvez la partager pour recevoir des cryptos. Exemple : 0x742d35Cc6634C0532925a3b8...",
          icon: "📬"
        },
        {
          title: "Clé privée = Mot de passe ultime",
          content: "C'est ce qui prouve que le wallet vous appartient. NE LA PARTAGEZ JAMAIS ! Celui qui a la clé privée contrôle les fonds.",
          icon: "🔑"
        },
        {
          title: "Seed phrase",
          content: "12 ou 24 mots qui permettent de récupérer votre wallet si vous perdez l'accès. Notez-la sur papier, jamais en photo ou sur ordinateur.",
          icon: "📝"
        }
      ],
      keyPoints: [
        "Vous êtes votre propre banque",
        "Clé publique = pour recevoir",
        "Clé privée = ne JAMAIS partager",
        "Seed phrase = sauvegarde ultime"
      ],
      warning: "⚠️ OBELISK ne vous demandera JAMAIS votre clé privée ou seed phrase. C'est toujours une arnaque."
    }
  },

  'security-basics': {
    id: 'security-basics',
    title: "Sécurité : Les bases essentielles",
    duration: '5 min',
    content: {
      intro: "En crypto, la sécurité c'est VOUS. Voici les règles d'or.",
      sections: [
        {
          title: "🚨 Les arnaques courantes",
          content: "Faux sites, faux support client, promesses de gains garantis, 'doublez vos Bitcoin'. Si c'est trop beau pour être vrai, c'est une arnaque.",
          icon: "⚠️"
        },
        {
          title: "Vérifiez toujours l'URL",
          content: "Les arnaqueurs créent des copies de sites légitimes. Vérifiez l'adresse : obelisk.trading ≠ 0belisk.trading (avec un zéro).",
          icon: "🔍"
        },
        {
          title: "Double authentification (2FA)",
          content: "Activez le 2FA sur tous vos comptes. Préférez une app (Google Authenticator) aux SMS, qui peuvent être piratés.",
          icon: "📱"
        },
        {
          title: "Un mot de passe unique",
          content: "Utilisez un mot de passe différent et complexe pour chaque site. Un gestionnaire de mots de passe peut vous aider.",
          icon: "🔒"
        }
      ],
      keyPoints: [
        "Ne partagez JAMAIS vos clés privées",
        "Vérifiez TOUJOURS l'URL du site",
        "Activez le 2FA partout",
        "Méfiez-vous des promesses de gains garantis"
      ],
      checklist: [
        "J'ai noté ma seed phrase sur papier",
        "J'ai activé le 2FA",
        "J'utilise des mots de passe uniques",
        "Je vérifie les URLs avant de connecter mon wallet"
      ]
    }
  },

  // First Steps
  'create-wallet': {
    id: 'create-wallet',
    title: "Créer son premier wallet",
    duration: '5 min',
    content: {
      intro: "Guide pas à pas pour créer un wallet MetaMask.",
      steps: [
        {
          step: 1,
          title: "Installer MetaMask",
          content: "Allez sur metamask.io (vérifiez l'URL !) et installez l'extension pour votre navigateur.",
          image: "metamask-install"
        },
        {
          step: 2,
          title: "Créer un nouveau wallet",
          content: "Cliquez sur 'Créer un portefeuille'. Choisissez un mot de passe fort.",
          image: "metamask-create"
        },
        {
          step: 3,
          title: "Sauvegarder la seed phrase",
          content: "MetaMask vous montre 12 mots. NOTEZ-LES SUR PAPIER dans l'ordre. C'est votre seule sauvegarde !",
          image: "metamask-seed",
          warning: "Ne prenez pas de photo, ne les stockez pas sur ordinateur"
        },
        {
          step: 4,
          title: "Confirmer la seed phrase",
          content: "MetaMask vous demande de confirmer certains mots pour vérifier que vous les avez bien notés.",
          image: "metamask-confirm"
        }
      ],
      alternatives: [
        { name: "Rabby", description: "Alternative à MetaMask, plus sécurisé", url: "rabby.io" },
        { name: "Coinbase Wallet", description: "Simple pour les débutants", url: "wallet.coinbase.com" },
        { name: "Ledger", description: "Hardware wallet pour plus de sécurité", url: "ledger.com" }
      ]
    }
  },

  'buy-sell': {
    id: 'buy-sell',
    title: "Acheter et Vendre des cryptos",
    duration: '5 min',
    content: {
      intro: "Les bases pour passer vos premiers ordres sur OBELISK.",
      sections: [
        {
          title: "Acheter (Buy)",
          content: "Vous échangez des euros/dollars contre des cryptos. Si vous pensez que le prix va monter, vous achetez.",
          icon: "🟢"
        },
        {
          title: "Vendre (Sell)",
          content: "Vous échangez vos cryptos contre des euros/dollars. Si vous pensez que le prix va baisser, vous vendez.",
          icon: "🔴"
        },
        {
          title: "Les paires de trading",
          content: "BTC/USDT signifie : vous échangez du Bitcoin contre des USDT (dollar stable). Le prix indiqué est combien de USDT pour 1 BTC.",
          icon: "🔄"
        },
        {
          title: "Les frais",
          content: "OBELISK prend 0.1% par transaction + les frais du réseau blockchain (gas). Toujours vérifier avant de confirmer.",
          icon: "💸"
        }
      ],
      example: {
        title: "Exemple concret",
        content: "Vous avez 100 USDT. Bitcoin vaut 40,000 USDT. Vous achetez : 100 ÷ 40,000 = 0.0025 BTC (moins les frais)."
      }
    }
  },

  'order-types': {
    id: 'order-types',
    title: "Les types d'ordres",
    duration: '5 min',
    content: {
      intro: "Choisissez comment vous voulez acheter ou vendre.",
      types: [
        {
          name: "Ordre Market (au marché)",
          description: "Achat/vente immédiat au prix actuel",
          pros: ["Exécution instantanée", "Simple à utiliser"],
          cons: ["Prix peut varier légèrement", "Pas de contrôle sur le prix"],
          whenToUse: "Quand vous voulez agir vite et que le prix exact importe peu",
          icon: "⚡"
        },
        {
          name: "Ordre Limit (limité)",
          description: "Achat/vente uniquement à votre prix choisi",
          pros: ["Vous contrôlez le prix", "Pas de mauvaise surprise"],
          cons: ["Peut ne jamais s'exécuter", "Demande plus de patience"],
          whenToUse: "Quand vous avez un prix cible précis",
          icon: "🎯"
        },
        {
          name: "Stop Loss",
          description: "Vente automatique si le prix descend trop",
          pros: ["Limite vos pertes", "Fonctionne même si vous dormez"],
          cons: ["Peut se déclencher sur un pic temporaire"],
          whenToUse: "TOUJOURS en avoir un pour protéger votre capital",
          icon: "🛑"
        }
      ],
      tip: "💡 Conseil débutant : Commencez par les ordres Market pour vous familiariser, puis passez aux ordres Limit."
    }
  },

  'reading-charts': {
    id: 'reading-charts',
    title: "Lire un graphique de prix",
    duration: '6 min',
    content: {
      intro: "Les graphiques peuvent sembler intimidants, mais les bases sont simples.",
      sections: [
        {
          title: "Les bougies (candlesticks)",
          content: "Chaque 'bougie' représente une période (1h, 1 jour...). Vert = le prix a monté. Rouge = le prix a baissé.",
          details: "Le corps montre prix d'ouverture et fermeture. Les mèches montrent les extrêmes.",
          icon: "🕯️"
        },
        {
          title: "Le volume",
          content: "Barres en bas du graphique. Volume élevé = beaucoup de monde trade. Ça confirme la force d'un mouvement.",
          icon: "📊"
        },
        {
          title: "Support et Résistance",
          content: "Support : niveau où le prix rebondit souvent (plancher). Résistance : niveau où le prix bloque (plafond).",
          icon: "📏"
        },
        {
          title: "La tendance",
          content: "Série de hauts de plus en plus hauts = tendance haussière. L'inverse = tendance baissière. 'The trend is your friend'.",
          icon: "📈"
        }
      ],
      warning: "⚠️ L'analyse technique n'est pas une science exacte. Personne ne peut prédire le futur avec certitude."
    }
  },

  'risk-management': {
    id: 'risk-management',
    title: "Gérer les risques",
    duration: '5 min',
    content: {
      intro: "La règle #1 en trading : protéger son capital.",
      rules: [
        {
          rule: "Ne jamais investir plus que ce que vous pouvez perdre",
          explanation: "Le crypto peut perdre 50% en une journée. N'utilisez que de l'argent dont vous n'avez pas besoin.",
          icon: "💰"
        },
        {
          rule: "Diversifier",
          explanation: "Ne mettez pas tout sur une seule crypto. Répartissez sur plusieurs actifs.",
          icon: "🥧"
        },
        {
          rule: "Toujours utiliser un Stop Loss",
          explanation: "Décidez à l'avance combien vous êtes prêt à perdre. Un stop loss vend automatiquement pour limiter les dégâts.",
          icon: "🛑"
        },
        {
          rule: "Ne pas trader sous l'émotion",
          explanation: "Peur, cupidité, FOMO (peur de rater une opportunité) = mauvaises décisions. Ayez un plan et suivez-le.",
          icon: "🧘"
        },
        {
          rule: "Commencer petit",
          explanation: "Apprenez avec de petites sommes. Augmentez progressivement quand vous maîtrisez.",
          icon: "🐣"
        }
      ],
      calculator: {
        title: "Règle du 1%",
        description: "Ne risquez jamais plus de 1-2% de votre capital sur un seul trade.",
        example: "Capital : 1000€. Risque max par trade : 10-20€."
      }
    }
  },

  // Passive Income
  'what-is-staking': {
    id: 'what-is-staking',
    title: "Le Staking expliqué",
    duration: '4 min',
    content: {
      intro: "Gagnez des récompenses en 'bloquant' vos cryptos.",
      sections: [
        {
          title: "C'est quoi le staking ?",
          content: "Vous déposez vos cryptos pour aider à sécuriser un réseau blockchain. En échange, vous recevez des récompenses (comme des intérêts).",
          icon: "🥩"
        },
        {
          title: "Combien ça rapporte ?",
          content: "Entre 3% et 20% par an selon la crypto. Plus c'est élevé, plus il y a de risques.",
          icon: "📈"
        },
        {
          title: "Les risques",
          content: "Vos cryptos sont parfois bloquées pendant un certain temps. Et si le prix baisse, vos gains en staking ne compensent pas forcément.",
          icon: "⚠️"
        }
      ],
      example: {
        title: "Exemple",
        content: "Vous stakez 1 ETH à 5% APY. Après 1 an : 1.05 ETH. Mais si ETH passe de 2000€ à 1500€, vous avez quand même perdu en valeur euros."
      }
    }
  },

  'apy-explained': {
    id: 'apy-explained',
    title: "Comprendre l'APY",
    duration: '3 min',
    content: {
      intro: "APY = Annual Percentage Yield. C'est le taux de rendement annuel.",
      sections: [
        {
          title: "APY vs APR",
          content: "APR = taux simple. APY = taux avec intérêts composés (intérêts sur les intérêts). APY est toujours plus élevé.",
          icon: "🔢"
        },
        {
          title: "Attention aux APY très élevés",
          content: "100%+ APY ? Méfiez-vous. Soit c'est temporaire, soit il y a des risques cachés (smart contract, liquidité...).",
          icon: "🚨"
        },
        {
          title: "APY variable",
          content: "Les taux changent selon l'offre et la demande. Un APY de 10% aujourd'hui peut être 3% demain.",
          icon: "📉"
        }
      ],
      tip: "💡 Sur OBELISK, les produits passifs affichent des APY réalistes entre 4% et 20%."
    }
  }
};

// ===========================================
// GLOSSARY
// ===========================================

const GLOSSARY = [
  { term: "Altcoin", definition: "Toute crypto autre que Bitcoin. Exemples : Ethereum, Solana, Cardano.", category: "bases" },
  { term: "APY", definition: "Annual Percentage Yield - Rendement annuel en pourcentage, incluant les intérêts composés.", category: "finance" },
  { term: "Bear Market", definition: "Marché baissier. Période prolongée où les prix descendent.", category: "trading" },
  { term: "Blockchain", definition: "Technologie de registre distribué qui enregistre toutes les transactions de façon sécurisée et transparente.", category: "bases" },
  { term: "Bridge", definition: "Service pour transférer des cryptos d'une blockchain à une autre.", category: "defi" },
  { term: "Bull Market", definition: "Marché haussier. Période prolongée où les prix montent.", category: "trading" },
  { term: "CEX", definition: "Centralized Exchange - Plateforme d'échange centralisée comme Binance ou Coinbase.", category: "trading" },
  { term: "DeFi", definition: "Decentralized Finance - Services financiers sans intermédiaires, basés sur des smart contracts.", category: "defi" },
  { term: "DEX", definition: "Decentralized Exchange - Plateforme d'échange décentralisée comme Uniswap ou OBELISK.", category: "trading" },
  { term: "DYOR", definition: "Do Your Own Research - Faites vos propres recherches avant d'investir.", category: "culture" },
  { term: "FOMO", definition: "Fear Of Missing Out - Peur de rater une opportunité. Peut mener à de mauvaises décisions.", category: "culture" },
  { term: "FUD", definition: "Fear, Uncertainty, Doubt - Informations négatives (vraies ou fausses) qui font peur.", category: "culture" },
  { term: "Gas", definition: "Frais payés pour effectuer des transactions sur une blockchain.", category: "bases" },
  { term: "HODL", definition: "Hold On for Dear Life - Stratégie de garder ses cryptos à long terme sans vendre.", category: "culture" },
  { term: "Impermanent Loss", definition: "Perte temporaire subie en fournissant de la liquidité dans un pool DeFi.", category: "defi" },
  { term: "Leverage", definition: "Effet de levier - Emprunter pour augmenter la taille de sa position (très risqué).", category: "trading" },
  { term: "Liquidity", definition: "Liquidité - Facilité avec laquelle on peut acheter/vendre sans affecter le prix.", category: "trading" },
  { term: "LP", definition: "Liquidity Provider - Personne qui dépose des fonds dans un pool de liquidité.", category: "defi" },
  { term: "Market Cap", definition: "Capitalisation boursière = Prix × Nombre de tokens en circulation.", category: "finance" },
  { term: "NFT", definition: "Non-Fungible Token - Token unique représentant un objet numérique (art, collectible...).", category: "bases" },
  { term: "Private Key", definition: "Clé privée - Code secret qui prouve que vous possédez un wallet. NE JAMAIS PARTAGER.", category: "sécurité" },
  { term: "Seed Phrase", definition: "12-24 mots pour récupérer un wallet. À garder en lieu sûr, hors ligne.", category: "sécurité" },
  { term: "Slippage", definition: "Différence entre le prix attendu et le prix réel d'une transaction.", category: "trading" },
  { term: "Smart Contract", definition: "Programme autonome sur la blockchain qui exécute des actions automatiquement.", category: "defi" },
  { term: "Stablecoin", definition: "Crypto dont la valeur est stable (souvent 1$ = 1 token). Exemples : USDT, USDC.", category: "bases" },
  { term: "Staking", definition: "Bloquer ses cryptos pour aider à sécuriser un réseau et gagner des récompenses.", category: "defi" },
  { term: "Token", definition: "Unité de valeur sur une blockchain. Peut représenter une monnaie, un droit de vote, etc.", category: "bases" },
  { term: "TVL", definition: "Total Value Locked - Valeur totale déposée dans un protocole DeFi.", category: "defi" },
  { term: "Wallet", definition: "Portefeuille numérique pour stocker, envoyer et recevoir des cryptos.", category: "bases" },
  { term: "Whale", definition: "Baleine - Personne ou entité possédant une très grande quantité de cryptos.", category: "culture" },
  { term: "Yield", definition: "Rendement - Gains générés par un investissement.", category: "finance" },
];

// ===========================================
// FAQ
// ===========================================

const FAQ = [
  {
    category: "Premiers pas",
    questions: [
      {
        q: "C'est quoi OBELISK ?",
        a: "OBELISK est une plateforme de trading de cryptomonnaies décentralisée. Vous gardez le contrôle de vos fonds à tout moment - nous ne stockons jamais vos cryptos."
      },
      {
        q: "Combien faut-il pour commencer ?",
        a: "Vous pouvez commencer avec n'importe quel montant. Même 10€ suffisent pour apprendre. L'important est de ne jamais investir plus que ce que vous pouvez vous permettre de perdre."
      },
      {
        q: "Est-ce que je peux perdre de l'argent ?",
        a: "Oui, absolument. Les cryptos sont très volatiles - les prix peuvent monter ou descendre de 10-50% en quelques jours. N'investissez que ce que vous êtes prêt à perdre entièrement."
      },
      {
        q: "C'est légal ?",
        a: "Oui, le trading de cryptomonnaies est légal dans la plupart des pays. Cependant, vous devez déclarer vos gains aux impôts. Renseignez-vous sur la fiscalité crypto de votre pays."
      }
    ]
  },
  {
    category: "Sécurité",
    questions: [
      {
        q: "OBELISK peut-il voler mes cryptos ?",
        a: "Non. OBELISK est non-custodial : vos cryptos restent dans VOTRE wallet. Nous n'avons jamais accès à vos clés privées. Vous seul contrôlez vos fonds."
      },
      {
        q: "Que faire si je perds ma seed phrase ?",
        a: "Si vous perdez votre seed phrase ET l'accès à votre wallet, vos fonds sont perdus pour toujours. Personne ne peut les récupérer. C'est pourquoi il est crucial de la sauvegarder correctement."
      },
      {
        q: "Comment reconnaître une arnaque ?",
        a: "Méfiez-vous de : promesses de gains garantis, demandes de clés privées/seed phrase, sites avec des URLs suspectes, messages non sollicités proposant des 'opportunités', tokens gratuits à réclamer."
      }
    ]
  },
  {
    category: "Trading",
    questions: [
      {
        q: "Quels sont les frais ?",
        a: "OBELISK prend 0.1% par transaction. S'ajoutent les frais de réseau (gas) qui varient selon la blockchain et la congestion."
      },
      {
        q: "Quelle crypto acheter ?",
        a: "Nous ne donnons pas de conseils financiers. Faites vos propres recherches (DYOR). Les débutants commencent souvent par Bitcoin ou Ethereum car ce sont les plus établis."
      },
      {
        q: "C'est quoi un bon moment pour acheter ?",
        a: "Personne ne peut prédire le marché. Une stratégie populaire est le DCA (Dollar Cost Averaging) : investir un montant fixe régulièrement plutôt que tout d'un coup."
      }
    ]
  },
  {
    category: "Revenus passifs",
    questions: [
      {
        q: "Le staking est-il sans risque ?",
        a: "Non. Risques : baisse du prix de la crypto stakée, bugs dans les smart contracts, période de blocage pendant laquelle vous ne pouvez pas vendre."
      },
      {
        q: "Comment les APY sont-ils possibles ?",
        a: "Les rendements viennent de : récompenses des blockchains, frais de trading des DEX, intérêts des prêts. Les APY très élevés sont souvent temporaires ou risqués."
      }
    ]
  }
];

// ===========================================
// ROUTES
// ===========================================

/**
 * GET /api/education/paths
 * Liste des parcours d'apprentissage
 */
router.get('/paths', (req, res) => {
  res.json({
    paths: LEARNING_PATHS,
    total: LEARNING_PATHS.length,
  });
});

/**
 * GET /api/education/paths/:pathId
 * Détail d'un parcours
 */
router.get('/paths/:pathId', (req, res) => {
  const path = LEARNING_PATHS.find(p => p.id === req.params.pathId);
  if (!path) {
    return res.status(404).json({ error: 'Parcours non trouvé' });
  }

  // Include full module content
  const modules = path.modules.map(moduleId => MODULES[moduleId]).filter(Boolean);

  res.json({
    ...path,
    modules,
  });
});

/**
 * GET /api/education/modules/:moduleId
 * Contenu d'un module
 */
router.get('/modules/:moduleId', (req, res) => {
  const module = MODULES[req.params.moduleId];
  if (!module) {
    return res.status(404).json({ error: 'Module non trouvé' });
  }
  res.json(module);
});

/**
 * GET /api/education/glossary
 * Glossaire des termes crypto
 */
router.get('/glossary', (req, res) => {
  const { category, search } = req.query;

  let terms = [...GLOSSARY];

  if (category) {
    terms = terms.filter(t => t.category === category);
  }

  if (search) {
    const s = search.toLowerCase();
    terms = terms.filter(t =>
      t.term.toLowerCase().includes(s) ||
      t.definition.toLowerCase().includes(s)
    );
  }

  // Sort alphabetically
  terms.sort((a, b) => a.term.localeCompare(b.term));

  const categories = [...new Set(GLOSSARY.map(t => t.category))];

  res.json({
    terms,
    total: terms.length,
    categories,
  });
});

/**
 * GET /api/education/glossary/:term
 * Définition d'un terme
 */
router.get('/glossary/:term', (req, res) => {
  const term = GLOSSARY.find(t =>
    t.term.toLowerCase() === req.params.term.toLowerCase()
  );

  if (!term) {
    return res.status(404).json({ error: 'Terme non trouvé' });
  }

  res.json(term);
});

/**
 * GET /api/education/faq
 * Questions fréquentes
 */
router.get('/faq', (req, res) => {
  const { category } = req.query;

  let faqs = [...FAQ];

  if (category) {
    faqs = faqs.filter(f => f.category.toLowerCase() === category.toLowerCase());
  }

  res.json({
    faq: faqs,
    categories: FAQ.map(f => f.category),
  });
});

/**
 * GET /api/education/quick-start
 * Guide de démarrage rapide
 */
router.get('/quick-start', (req, res) => {
  res.json({
    title: "Démarrage rapide",
    steps: [
      {
        step: 1,
        title: "Créez un wallet",
        description: "Installez MetaMask ou un autre wallet",
        action: "Voir le guide",
        link: "/education/modules/create-wallet",
        icon: "👛"
      },
      {
        step: 2,
        title: "Connectez-vous",
        description: "Connectez votre wallet à OBELISK",
        action: "Connecter",
        link: "/connect",
        icon: "🔗"
      },
      {
        step: 3,
        title: "Déposez des fonds",
        description: "Transférez des cryptos vers votre wallet",
        action: "Guide dépôt",
        link: "/education/modules/first-deposit",
        icon: "💰"
      },
      {
        step: 4,
        title: "Votre premier trade",
        description: "Achetez votre première crypto",
        action: "Commencer",
        link: "/trade",
        icon: "🚀"
      }
    ],
    tips: [
      "Commencez avec un petit montant pour apprendre",
      "Lisez les modules sur la sécurité avant tout",
      "N'investissez que ce que vous pouvez perdre"
    ]
  });
});

/**
 * GET /api/education/beginner-mode
 * Configuration pour le mode débutant de l'UI
 */
router.get('/beginner-mode', (req, res) => {
  res.json({
    enabled: true,
    features: {
      simplifiedUI: true,
      hideAdvancedOrders: true,
      hideMargin: true,
      hideLeverage: true,
      showTooltips: true,
      showEducationLinks: true,
      confirmBeforeTrade: true,
      maxOrderSize: 100, // USD max pour débutants
      requireStopLoss: true,
    },
    warnings: {
      beforeTrade: "Rappel : Le trading comporte des risques. N'investissez que ce que vous pouvez perdre.",
      largeOrder: "Cette transaction représente plus de 10% de votre portefeuille. Êtes-vous sûr ?",
      volatileAsset: "Cet actif est très volatil. Son prix peut changer rapidement.",
    },
    tooltips: {
      buy: "Acheter = vous pensez que le prix va monter",
      sell: "Vendre = vous pensez que le prix va baisser",
      market: "Ordre au marché = achat/vente immédiat au prix actuel",
      limit: "Ordre limité = achat/vente uniquement à votre prix choisi",
      stopLoss: "Stop Loss = vente automatique si le prix descend trop (pour limiter les pertes)",
    }
  });
});

module.exports = router;
