/**
 * OBELISK DEX - Learning Center / Centre d'Apprentissage
 * Guide complet pour optimiser ses revenus de manière sûre
 */

const LearningCenter = {
    // Progression de l'utilisateur
    progress: {
        completedLessons: [],
        currentLevel: 'beginner',
        xp: 0,
        badges: []
    },

    // Niveaux
    levels: {
        beginner: { name: 'Débutant', icon: '🌱', minXp: 0, color: '#00ff88' },
        intermediate: { name: 'Intermédiaire', icon: '📈', minXp: 500, color: '#00aaff' },
        advanced: { name: 'Avancé', icon: '🎯', minXp: 1500, color: '#a855f7' },
        expert: { name: 'Expert', icon: '👑', minXp: 3000, color: '#ffd700' }
    },

    // Cours disponibles
    courses: [
        {
            id: 'basics',
            title: 'Les Bases de l\'Investissement',
            icon: '📚',
            level: 'beginner',
            duration: '15 min',
            xp: 100,
            lessons: [
                {
                    id: 'basics-1',
                    title: 'Comprendre le risque vs rendement',
                    content: `
                        <h3>🎯 Règle fondamentale</h3>
                        <p><strong>Plus le rendement promis est élevé, plus le risque est élevé.</strong></p>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p>Si quelqu'un promet 100%/an sans risque, c'est une arnaque. Toujours.</p>
                        </div>

                        <h4>Échelle de risque réaliste</h4>
                        <table class="learn-table">
                            <tr><th>Rendement</th><th>Risque</th><th>Exemple</th></tr>
                            <tr><td>3-5%</td><td>Très faible</td><td>Stablecoins, Épargne</td></tr>
                            <tr><td>5-15%</td><td>Faible</td><td>Staking ETH, Lending</td></tr>
                            <tr><td>15-30%</td><td>Moyen</td><td>LP Pools, DeFi</td></tr>
                            <tr><td>30-50%</td><td>Élevé</td><td>Trading actif</td></tr>
                            <tr><td>50%+</td><td>Très élevé</td><td>Leverage, Memecoins</td></tr>
                        </table>

                        <h4>💡 Conseil clé</h4>
                        <p>Commence toujours par des produits à faible risque pour apprendre, puis diversifie progressivement.</p>
                    `
                },
                {
                    id: 'basics-2',
                    title: 'La diversification',
                    content: `
                        <h3>🥚 Ne mets pas tous tes œufs dans le même panier</h3>

                        <div class="comparison-box">
                            <div class="bad">
                                <h4>❌ Mauvais exemple</h4>
                                <p>100% dans un seul produit</p>
                                <p class="result negative">Si ça baisse de 50% → Tu perds 50%</p>
                            </div>
                            <div class="good">
                                <h4>✅ Bon exemple</h4>
                                <p>25% dans 4 produits différents</p>
                                <p class="result positive">Si un baisse de 50% → Tu perds seulement 12.5%</p>
                            </div>
                        </div>

                        <h4>Règle de diversification</h4>
                        <ul>
                            <li><strong>Minimum 3-4 produits</strong> différents</li>
                            <li><strong>Mix de risques</strong>: stable + modéré + croissance</li>
                            <li><strong>Maximum 25%</strong> dans un seul produit</li>
                            <li><strong>Toujours garder du cash</strong> (10-20%) pour les opportunités</li>
                        </ul>
                    `
                },
                {
                    id: 'basics-3',
                    title: 'Comprendre l\'APY',
                    content: `
                        <h3>📊 APY = Annual Percentage Yield</h3>
                        <p>C'est le rendement annuel en pourcentage, avec les intérêts composés.</p>

                        <h4>Exemple concret</h4>
                        <div class="example-box">
                            <p>Tu investis <strong>$1,000</strong> à <strong>10% APY</strong></p>
                            <table class="learn-table">
                                <tr><th>Après</th><th>Capital</th><th>Gain</th></tr>
                                <tr><td>1 mois</td><td>$1,008</td><td>+$8</td></tr>
                                <tr><td>6 mois</td><td>$1,049</td><td>+$49</td></tr>
                                <tr><td>1 an</td><td>$1,100</td><td>+$100</td></tr>
                                <tr><td>5 ans</td><td>$1,610</td><td>+$610</td></tr>
                            </table>
                        </div>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Grâce aux intérêts composés, ton argent travaille pour toi. Plus tu laisses longtemps, plus ça s'accumule!</p>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'strategies',
            title: 'Stratégies d\'Investissement',
            icon: '🎯',
            level: 'beginner',
            duration: '20 min',
            xp: 150,
            lessons: [
                {
                    id: 'strat-1',
                    title: 'La stratégie DCA',
                    content: `
                        <h3>📅 DCA = Dollar Cost Averaging</h3>
                        <p>Investir un montant fixe à intervalles réguliers, peu importe le prix.</p>

                        <h4>Pourquoi c'est efficace?</h4>
                        <div class="comparison-box">
                            <div class="bad">
                                <h4>❌ Investir tout d'un coup</h4>
                                <p>Tu achètes $1000 quand le prix est haut</p>
                                <p>Le prix baisse → Tu es en perte</p>
                            </div>
                            <div class="good">
                                <h4>✅ DCA sur 10 semaines</h4>
                                <p>Tu achètes $100 chaque semaine</p>
                                <p>Prix haut ou bas → Tu moyennes ton coût</p>
                            </div>
                        </div>

                        <h4>Comment appliquer le DCA</h4>
                        <ol>
                            <li>Choisis un montant fixe (ex: $50/semaine)</li>
                            <li>Choisis un jour fixe (ex: chaque lundi)</li>
                            <li>Investis automatiquement, sans regarder le prix</li>
                            <li>Continue pendant au moins 6-12 mois</li>
                        </ol>

                        <div class="info-box success">
                            <span class="icon">✅</span>
                            <p>Le DCA élimine l'émotion de l'investissement. Tu n'as plus besoin de "timer" le marché!</p>
                        </div>
                    `
                },
                {
                    id: 'strat-2',
                    title: 'Portefeuille équilibré',
                    content: `
                        <h3>⚖️ L'équilibre parfait</h3>
                        <p>Un portefeuille bien construit combine sécurité et croissance.</p>

                        <h4>Modèle recommandé pour débutants</h4>
                        <div class="portfolio-model">
                            <div class="allocation-bar">
                                <div class="segment safe" style="width:50%">50% Safe</div>
                                <div class="segment moderate" style="width:30%">30% Modéré</div>
                                <div class="segment growth" style="width:15%">15% Croissance</div>
                                <div class="segment cash" style="width:5%">5%</div>
                            </div>
                        </div>

                        <table class="learn-table">
                            <tr><th>Catégorie</th><th>%</th><th>Produits suggérés</th><th>APY</th></tr>
                            <tr><td>🛡️ Safe</td><td>50%</td><td>Stablecoin Fortress, USDC Lending</td><td>5-10%</td></tr>
                            <tr><td>📊 Modéré</td><td>30%</td><td>ETH Staking, Blue Chip Combo</td><td>10-20%</td></tr>
                            <tr><td>🚀 Croissance</td><td>15%</td><td>Growth Portfolio, LP Pools</td><td>20-35%</td></tr>
                            <tr><td>💵 Cash</td><td>5%</td><td>Garder disponible</td><td>0%</td></tr>
                        </table>

                        <h4>Rendement estimé de ce portefeuille</h4>
                        <p class="highlight-text">~12-15% APY avec un risque maîtrisé</p>
                    `
                },
                {
                    id: 'strat-3',
                    title: 'Prendre ses profits',
                    content: `
                        <h3>💰 Savoir quand encaisser</h3>
                        <p>Un gain n'est réel que quand tu l'as retiré!</p>

                        <h4>La règle du Take Profit</h4>
                        <div class="rule-box">
                            <p>Quand ton investissement fait <strong>+20% ou plus</strong>:</p>
                            <ol>
                                <li>Retire 25-50% des gains</li>
                                <li>Laisse le reste continuer à travailler</li>
                                <li>Répète à chaque palier de +20%</li>
                            </ol>
                        </div>

                        <h4>Exemple pratique</h4>
                        <div class="example-box">
                            <p>Tu investis $1000, ça monte à $1200 (+20%)</p>
                            <ul>
                                <li>Retire $100 (50% du gain de $200)</li>
                                <li>Laisse $1100 investis</li>
                                <li>Tu as sécurisé $100 de profit réel</li>
                            </ul>
                        </div>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p>L'erreur #1: être trop gourmand et attendre "encore un peu plus". Le marché peut retourner à tout moment!</p>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'portfolios',
            title: 'Portefeuilles Recommandés',
            icon: '💼',
            level: 'intermediate',
            duration: '15 min',
            xp: 200,
            lessons: [
                {
                    id: 'port-1',
                    title: 'Portefeuille Prudent',
                    content: `
                        <h3>🛡️ Pour ceux qui veulent dormir tranquille</h3>
                        <p>Idéal pour: Débutants, épargne de précaution, aversion au risque</p>

                        <div class="portfolio-card safe">
                            <h4>Allocation</h4>
                            <ul class="allocation-list">
                                <li><span class="pct">40%</span> Stablecoin Fortress <span class="apy">6-10% APY</span></li>
                                <li><span class="pct">30%</span> USDC Lending (Aave) <span class="apy">4-8% APY</span></li>
                                <li><span class="pct">20%</span> Conservative Yield <span class="apy">5-12% APY</span></li>
                                <li><span class="pct">10%</span> Cash <span class="apy">0%</span></li>
                            </ul>

                            <div class="portfolio-stats">
                                <div class="stat">
                                    <span class="label">Rendement estimé</span>
                                    <span class="value positive">6-9% /an</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Risque de perte max</span>
                                    <span class="value safe">~5%</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Capital protégé</span>
                                    <span class="value safe">~95%</span>
                                </div>
                            </div>
                        </div>

                        <h4>Simulation sur $10,000</h4>
                        <table class="learn-table">
                            <tr><th>Durée</th><th>Capital</th><th>Gain</th></tr>
                            <tr><td>1 an</td><td>$10,750</td><td>+$750</td></tr>
                            <tr><td>3 ans</td><td>$12,400</td><td>+$2,400</td></tr>
                            <tr><td>5 ans</td><td>$14,300</td><td>+$4,300</td></tr>
                        </table>
                    `
                },
                {
                    id: 'port-2',
                    title: 'Portefeuille Équilibré',
                    content: `
                        <h3>⚖️ Le meilleur des deux mondes</h3>
                        <p>Idéal pour: Investisseurs avec 1-2 ans d'expérience</p>

                        <div class="portfolio-card balanced">
                            <h4>Allocation</h4>
                            <ul class="allocation-list">
                                <li><span class="pct">30%</span> Stablecoin Fortress <span class="apy">6-10% APY</span></li>
                                <li><span class="pct">25%</span> Blue Chip Combo <span class="apy">15-25% APY</span></li>
                                <li><span class="pct">25%</span> ETH Staking <span class="apy">4-5% + prix</span></li>
                                <li><span class="pct">15%</span> GMX GLP <span class="apy">15-30% APY</span></li>
                                <li><span class="pct">5%</span> Cash <span class="apy">0%</span></li>
                            </ul>

                            <div class="portfolio-stats">
                                <div class="stat">
                                    <span class="label">Rendement estimé</span>
                                    <span class="value positive">12-18% /an</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Risque de perte max</span>
                                    <span class="value moderate">~15%</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Capital protégé</span>
                                    <span class="value moderate">~85%</span>
                                </div>
                            </div>
                        </div>

                        <h4>Simulation sur $10,000</h4>
                        <table class="learn-table">
                            <tr><th>Durée</th><th>Capital</th><th>Gain</th></tr>
                            <tr><td>1 an</td><td>$11,500</td><td>+$1,500</td></tr>
                            <tr><td>3 ans</td><td>$15,200</td><td>+$5,200</td></tr>
                            <tr><td>5 ans</td><td>$20,100</td><td>+$10,100</td></tr>
                        </table>
                    `
                },
                {
                    id: 'port-3',
                    title: 'Portefeuille Croissance',
                    content: `
                        <h3>🚀 Pour maximiser les gains</h3>
                        <p>Idéal pour: Investisseurs expérimentés, horizon long terme, tolérance au risque</p>

                        <div class="portfolio-card growth">
                            <h4>Allocation</h4>
                            <ul class="allocation-list">
                                <li><span class="pct">25%</span> Growth Portfolio <span class="apy">20-35% APY</span></li>
                                <li><span class="pct">25%</span> AI Quant Strategy <span class="apy">25-40% APY</span></li>
                                <li><span class="pct">20%</span> Blue Chip Combo <span class="apy">15-25% APY</span></li>
                                <li><span class="pct">20%</span> LP Pools <span class="apy">20-50% APY</span></li>
                                <li><span class="pct">10%</span> Stablecoin Fortress <span class="apy">6-10% APY</span></li>
                            </ul>

                            <div class="portfolio-stats">
                                <div class="stat">
                                    <span class="label">Rendement estimé</span>
                                    <span class="value positive">20-30% /an</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Risque de perte max</span>
                                    <span class="value risky">~30%</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Capital protégé</span>
                                    <span class="value risky">~70%</span>
                                </div>
                            </div>
                        </div>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p>Ce portefeuille peut perdre 20-30% en période de baisse. Ne l'utilise qu'avec de l'argent que tu peux te permettre de perdre!</p>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'mistakes',
            title: 'Erreurs à Éviter',
            icon: '🚫',
            level: 'beginner',
            duration: '10 min',
            xp: 100,
            lessons: [
                {
                    id: 'err-1',
                    title: 'Les 5 erreurs fatales',
                    content: `
                        <h3>🚫 Ce qui fait perdre de l'argent</h3>

                        <div class="error-card">
                            <h4>1. Investir plus qu'on peut perdre</h4>
                            <p class="error-desc">Ne jamais investir l'argent du loyer, des factures ou des urgences.</p>
                            <p class="solution">✅ Solution: Investis uniquement ton épargne "plaisir"</p>
                        </div>

                        <div class="error-card">
                            <h4>2. FOMO (Fear Of Missing Out)</h4>
                            <p class="error-desc">Acheter parce que "tout le monde achète" ou "ça monte".</p>
                            <p class="solution">✅ Solution: Suis ton plan, ignore le bruit</p>
                        </div>

                        <div class="error-card">
                            <h4>3. Pas de diversification</h4>
                            <p class="error-desc">Tout mettre dans un seul produit ou une seule crypto.</p>
                            <p class="solution">✅ Solution: Minimum 4 produits différents</p>
                        </div>

                        <div class="error-card">
                            <h4>4. Paniquer lors des baisses</h4>
                            <p class="error-desc">Vendre en panique quand le marché baisse.</p>
                            <p class="solution">✅ Solution: Les baisses sont des opportunités d'achat</p>
                        </div>

                        <div class="error-card">
                            <h4>5. Croire aux rendements "garantis"</h4>
                            <p class="error-desc">Tomber dans les arnaques qui promettent 1%/jour.</p>
                            <p class="solution">✅ Solution: Si c'est trop beau, c'est faux</p>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'defi-guide',
            title: 'Guide DeFi Complet',
            icon: '🏦',
            level: 'intermediate',
            duration: '25 min',
            xp: 250,
            lessons: [
                {
                    id: 'defi-1',
                    title: 'Qu\'est-ce que la DeFi?',
                    content: `
                        <h3>🏦 Finance Décentralisée</h3>
                        <p>La DeFi permet de faire de la finance (prêts, épargne, trading) sans banque, directement sur la blockchain.</p>

                        <h4>Avantages</h4>
                        <ul>
                            <li>✅ Pas d'intermédiaire (banque)</li>
                            <li>✅ Rendements souvent supérieurs</li>
                            <li>✅ Accessible 24/7 partout dans le monde</li>
                            <li>✅ Transparent (tout est vérifiable)</li>
                        </ul>

                        <h4>Risques</h4>
                        <ul>
                            <li>⚠️ Bugs dans les smart contracts</li>
                            <li>⚠️ Volatilité des cryptos</li>
                            <li>⚠️ Pas de protection si tu fais une erreur</li>
                            <li>⚠️ Frais de gas (transactions)</li>
                        </ul>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Obelisk simplifie la DeFi: tu profites des rendements sans la complexité technique!</p>
                        </div>
                    `
                },
                {
                    id: 'defi-2',
                    title: 'Les protocoles utilisés',
                    content: `
                        <h3>🔗 Protocoles de confiance</h3>
                        <p>Obelisk utilise uniquement des protocoles audités et éprouvés.</p>

                        <div class="protocol-card">
                            <h4>Aave V3</h4>
                            <p class="protocol-desc">Leader du lending/borrowing</p>
                            <ul>
                                <li>TVL: $10+ milliards</li>
                                <li>Audits: 10+</li>
                                <li>En production depuis: 2020</li>
                                <li>Rendement: 3-8% sur stables</li>
                            </ul>
                        </div>

                        <div class="protocol-card">
                            <h4>GMX</h4>
                            <p class="protocol-desc">Trading perpetuals décentralisé</p>
                            <ul>
                                <li>TVL: $500+ millions</li>
                                <li>GLP yield: 15-30%</li>
                                <li>Real yield (pas d'inflation)</li>
                            </ul>
                        </div>

                        <div class="protocol-card">
                            <h4>Lido</h4>
                            <p class="protocol-desc">Staking ETH liquide</p>
                            <ul>
                                <li>TVL: $20+ milliards</li>
                                <li>Rendement: 4-5%</li>
                                <li>Token: stETH</li>
                            </ul>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'security-emergency',
            title: 'Sécurité & Système d\'Urgence',
            icon: '🆘',
            level: 'beginner',
            duration: '10 min',
            xp: 150,
            lessons: [
                {
                    id: 'security-1',
                    title: 'Le bouton d\'urgence - C\'est quoi ?',
                    content: \`
                        <h3>🆘 Protection contre les situations extrêmes</h3>
                        <p>Obelisk intègre un <strong>système d'urgence anti-coercition</strong> pour vous protéger dans des situations dangereuses.</p>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p><strong>Ce système est conçu pour les situations graves :</strong> enlèvement, séquestration, vol sous la menace, ou toute situation où vous êtes forcé d'accéder à votre compte.</p>
                        </div>

                        <h4>🔴 Le bouton SOS</h4>
                        <p>Vous verrez un bouton rouge <strong>🆘 SOS</strong> en bas à droite de l'écran. C'est votre bouton d'urgence.</p>

                        <h4>Comment l'activer ?</h4>
                        <ul>
                            <li><strong>Maintenir appuyé 3 secondes</strong> (évite les erreurs)</li>
                            <li>Ou raccourci clavier: <code>Ctrl + Shift + E</code></li>
                        </ul>

                        <h4>Que se passe-t-il à l'activation ?</h4>
                        <ol>
                            <li>🔒 Votre compte est <strong>verrouillé pendant 24h</strong></li>
                            <li>📧 Vos <strong>contacts d'urgence sont alertés</strong></li>
                            <li>🚫 <strong>Aucune transaction</strong> n'est possible</li>
                            <li>⏰ Si non annulé en 24h = confirmation du danger</li>
                        </ol>
                    \`
                },
                {
                    id: 'security-2',
                    title: 'Configuration initiale',
                    content: \`
                        <h3>⚙️ Configurer votre sécurité AVANT une urgence</h3>
                        <p>Prenez 5 minutes pour configurer le système maintenant. En cas d'urgence, ce sera trop tard.</p>

                        <h4>1️⃣ Ajouter des contacts d'urgence</h4>
                        <p>Cliquez sur le bouton SOS (sans maintenir) pour accéder aux paramètres.</p>
                        <ul>
                            <li>Ajoutez <strong>2-3 personnes de confiance</strong></li>
                            <li>Famille proche, ami(e) fiable, avocat...</li>
                            <li>Incluez leur <strong>email ET téléphone</strong></li>
                        </ul>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Prévenez vos contacts qu'ils sont enregistrés. Expliquez-leur quoi faire s'ils reçoivent une alerte.</p>
                        </div>

                        <h4>2️⃣ Créer vos questions de sécurité</h4>
                        <p>Ces questions seront posées pour vérifier que vous êtes vraiment libre.</p>
                        <ul>
                            <li>Choisissez des questions <strong>personnelles et secrètes</strong></li>
                            <li>Réponses que <strong>VOUS SEUL</strong> connaissez</li>
                            <li>Minimum 2 questions requises</li>
                        </ul>

                        <h4>Exemples de bonnes questions</h4>
                        <table class="learn-table">
                            <tr><th>✅ Bonne question</th><th>❌ Mauvaise question</th></tr>
                            <tr><td>Nom de mon doudou d'enfance</td><td>Nom de mon chien (visible sur réseaux)</td></tr>
                            <tr><td>Surnom donné par ma grand-mère</td><td>Ville de naissance (sur carte d'identité)</td></tr>
                            <tr><td>Premier mot de passe que j'ai créé</td><td>Date d'anniversaire</td></tr>
                        </table>
                    \`
                },
                {
                    id: 'security-3',
                    title: 'Les deux codes secrets',
                    content: \`
                        <h3>🔐 Code RÉEL vs Code DURESS</h3>
                        <p>Lors de l'activation, vous recevrez <strong>DEUX codes</strong> à mémoriser.</p>

                        <div class="comparison-box">
                            <div class="good">
                                <h4>✅ CODE RÉEL</h4>
                                <p>À utiliser quand vous êtes <strong>vraiment libre</strong></p>
                                <p>Débloque le compte après vérification complète</p>
                            </div>
                            <div class="bad">
                                <h4>🚨 CODE DURESS</h4>
                                <p>À utiliser si vous êtes <strong>sous contrainte</strong></p>
                                <p>Semble débloquer, mais envoie une <strong>alerte silencieuse</strong> à vos contacts</p>
                            </div>
                        </div>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p><strong>Le code duress finit toujours par 00.</strong> Utilisez-le si quelqu'un vous force à débloquer. Le compte semblera normal mais vos contacts sauront que vous êtes en danger.</p>
                        </div>

                        <h4>Comment retenir les codes ?</h4>
                        <ul>
                            <li>Notez-les dans un endroit <strong>sécurisé et secret</strong></li>
                            <li>Pas dans votre téléphone (peut être consulté sous la menace)</li>
                            <li>Coffre-fort, chez un proche, ou mémorisé</li>
                        </ul>
                    \`
                },
                {
                    id: 'security-4',
                    title: 'Vérification en 3 étapes',
                    content: \`
                        <h3>🔓 Comment débloquer en sécurité</h3>
                        <p>Pour garantir que vous êtes vraiment libre, le déblocage nécessite <strong>3 étapes de vérification</strong>.</p>

                        <h4>Étape 1️⃣ : Code d'annulation</h4>
                        <p>Entrez votre code à 6 chiffres. Vous avez <strong>3 tentatives maximum</strong>.</p>

                        <h4>Étape 2️⃣ : Questions de sécurité</h4>
                        <p>Répondez à 2 de vos questions personnelles. Seul vous connaissez les réponses.</p>

                        <h4>Étape 3️⃣ : Délai de 30 minutes</h4>
                        <p>Un délai de sécurité de <strong>30 minutes</strong> commence.</p>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Pendant ces 30 minutes, vos contacts sont notifiés. S'ils ne peuvent pas vous joindre, ils peuvent intervenir ou alerter les autorités.</p>
                        </div>

                        <h4>Pourquoi ce délai ?</h4>
                        <ul>
                            <li>Un kidnappeur pourrait vous forcer à débloquer</li>
                            <li>Le délai donne du temps à vos proches pour agir</li>
                            <li>Vous pouvez annuler à tout moment pendant le délai</li>
                        </ul>
                    \`
                },
                {
                    id: 'security-5',
                    title: 'Que faire en cas d\'urgence',
                    content: \`
                        <h3>🚨 Procédure en situation de danger</h3>

                        <h4>Si vous êtes LIBRE et voulez débloquer</h4>
                        <ol>
                            <li>Cliquez sur le bouton verrouillé (🔒)</li>
                            <li>Entrez votre <strong>CODE RÉEL</strong></li>
                            <li>Répondez aux questions de sécurité</li>
                            <li>Attendez 30 minutes</li>
                            <li>Compte débloqué ✅</li>
                        </ol>

                        <h4>Si vous êtes SOUS CONTRAINTE</h4>
                        <ol>
                            <li>Faites semblant de coopérer</li>
                            <li>Entrez le <strong>CODE DURESS</strong> (finit par 00)</li>
                            <li>Le compte semble débloqué pour l'agresseur</li>
                            <li>Vos contacts reçoivent une alerte silencieuse 🚨</li>
                        </ol>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p><strong>Si les 24h passent sans annulation</strong>, vos contacts recevront une alerte finale confirmant que vous êtes probablement en danger. Ils devront contacter les autorités.</p>
                        </div>

                        <h4>Instructions pour vos contacts d'urgence</h4>
                        <p>Partagez ces instructions avec vos contacts :</p>
                        <ul>
                            <li>Si alerte reçue → Essayer de me joindre immédiatement</li>
                            <li>Si pas de réponse → Contacter mes proches</li>
                            <li>Si toujours pas de nouvelles → Alerter la police</li>
                            <li>Si alerte "DURESS" → Je suis en danger, intervenir discrètement</li>
                        </ul>
                    \`
                },
                {
                    id: 'security-6',
                    title: 'Bonnes pratiques de sécurité',
                    content: \`
                        <h3>🛡️ Sécuriser vos crypto au quotidien</h3>

                        <h4>Règles d'or</h4>
                        <ul>
                            <li>🔒 <strong>Ne révélez JAMAIS</strong> vos montants à des inconnus</li>
                            <li>📱 <strong>Pas de crypto</strong> visible sur votre téléphone en public</li>
                            <li>🗣️ <strong>Discrétion</strong> sur les réseaux sociaux</li>
                            <li>📍 <strong>Variez vos lieux</strong> pour accéder à vos comptes</li>
                        </ul>

                        <h4>Signes de danger</h4>
                        <table class="learn-table">
                            <tr><th>Situation</th><th>Action</th></tr>
                            <tr><td>Quelqu'un vous suit après avoir parlé de crypto</td><td>Activez le mode urgence préventif</td></tr>
                            <tr><td>Menaces reçues</td><td>Prévenez vos contacts + police</td></tr>
                            <tr><td>Demande forcée d'accès</td><td>Utilisez le code DURESS</td></tr>
                        </table>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p><strong>Le meilleur système de sécurité est celui qu'on n'a jamais besoin d'utiliser.</strong> Soyez discret sur vos investissements crypto.</p>
                        </div>

                        <h4>Test du système</h4>
                        <p>Une fois configuré, faites un <strong>test complet</strong> avec vos contacts pour vous assurer que tout fonctionne :</p>
                        <ol>
                            <li>Activez le mode urgence (en situation normale)</li>
                            <li>Vérifiez que vos contacts reçoivent l'alerte</li>
                            <li>Déverrouillez avec le code réel</li>
                            <li>Confirmez que tout est rentré dans l'ordre</li>
                        </ol>
                    \`
                }
            ]
        },
        // === ADVANCED COURSES ===
        {
            id: 'technical-analysis',
            title: 'Analyse Technique',
            icon: '📊',
            level: 'advanced',
            duration: '45 min',
            xp: 350,
            lessons: [
                {
                    id: 'ta-1',
                    title: 'Lire les graphiques (Charts)',
                    content: `
                        <h3>📊 Les fondamentaux des graphiques</h3>
                        <p>Un graphique représente l'évolution du prix d'un actif dans le temps. C'est l'outil principal de l'analyste technique.</p>

                        <h4>Types de graphiques</h4>
                        <table class="learn-table">
                            <tr><th>Type</th><th>Description</th><th>Usage</th></tr>
                            <tr><td>Ligne</td><td>Relie les prix de clôture</td><td>Vision générale</td></tr>
                            <tr><td>Bougies (Candlestick)</td><td>Montre Open, High, Low, Close</td><td>Le plus utilisé</td></tr>
                            <tr><td>Barres (OHLC)</td><td>Similaire aux bougies</td><td>Trading pro</td></tr>
                            <tr><td>Heikin-Ashi</td><td>Bougies lissées</td><td>Identifier les tendances</td></tr>
                        </table>

                        <h4>Anatomie d'une bougie japonaise</h4>
                        <div class="info-box tip">
                            <span class="icon">🕯️</span>
                            <p><strong>Bougie verte (haussière):</strong> Le prix a monté. Bas = ouverture, Haut = clôture.<br>
                            <strong>Bougie rouge (baissière):</strong> Le prix a baissé. Haut = ouverture, Bas = clôture.<br>
                            Les mèches montrent les extrêmes (high/low).</p>
                        </div>

                        <h4>Volumes</h4>
                        <p>Les volumes indiquent le nombre de transactions. Un mouvement avec fort volume est plus significatif.</p>
                        <ul>
                            <li>📈 Prix monte + Volume élevé = Tendance forte</li>
                            <li>📈 Prix monte + Volume faible = Méfiance, possible retournement</li>
                            <li>📉 Prix baisse + Volume élevé = Panique/Capitulation</li>
                        </ul>
                    `
                },
                {
                    id: 'ta-2',
                    title: 'Indicateurs techniques',
                    content: `
                        <h3>📈 Les indicateurs essentiels</h3>
                        <p>Les indicateurs transforment les données de prix en signaux visuels pour aider à prendre des décisions.</p>

                        <h4>Moyennes Mobiles (MA)</h4>
                        <div class="protocol-card">
                            <h4>SMA & EMA</h4>
                            <ul>
                                <li><strong>SMA (Simple)</strong>: Moyenne des X derniers prix</li>
                                <li><strong>EMA (Exponentielle)</strong>: Plus de poids aux prix récents</li>
                                <li><strong>Usage</strong>: MA50 et MA200 pour tendance long terme</li>
                                <li><strong>Signal</strong>: Prix au-dessus = haussier, en-dessous = baissier</li>
                            </ul>
                        </div>

                        <h4>RSI (Relative Strength Index)</h4>
                        <table class="learn-table">
                            <tr><th>Valeur RSI</th><th>Signal</th><th>Action suggérée</th></tr>
                            <tr><td>> 70</td><td>Surachat</td><td>Possible correction à venir</td></tr>
                            <tr><td>30-70</td><td>Neutre</td><td>Suivre la tendance</td></tr>
                            <tr><td>< 30</td><td>Survente</td><td>Possible rebond à venir</td></tr>
                        </table>

                        <h4>MACD (Moving Average Convergence Divergence)</h4>
                        <ul>
                            <li>Croisement MACD au-dessus de Signal = Signal d'achat</li>
                            <li>Croisement MACD en-dessous de Signal = Signal de vente</li>
                            <li>Histogramme positif = Momentum haussier</li>
                        </ul>

                        <h4>Bollinger Bands</h4>
                        <p>Bandes autour du prix qui s'élargissent avec la volatilité.</p>
                        <ul>
                            <li>Prix touche bande haute = Possible retournement baissier</li>
                            <li>Prix touche bande basse = Possible retournement haussier</li>
                            <li>Squeeze (bandes serrées) = Explosion de volatilité à venir</li>
                        </ul>
                    `
                },
                {
                    id: 'ta-3',
                    title: 'Patterns graphiques',
                    content: `
                        <h3>🔄 Les figures chartistes</h3>
                        <p>Les patterns sont des formations récurrentes qui suggèrent la direction future du prix.</p>

                        <h4>Patterns de continuation</h4>
                        <div class="comparison-box">
                            <div class="good">
                                <h4>📊 Triangle ascendant</h4>
                                <p>Résistance horizontale + supports ascendants</p>
                                <p class="result positive">→ Breakout haussier probable</p>
                            </div>
                            <div class="good">
                                <h4>📊 Flag / Pennant</h4>
                                <p>Consolidation après mouvement fort</p>
                                <p class="result positive">→ Continuation du mouvement</p>
                            </div>
                        </div>

                        <h4>Patterns de retournement</h4>
                        <table class="learn-table">
                            <tr><th>Pattern</th><th>Apparaît</th><th>Signal</th></tr>
                            <tr><td>Double Top (M)</td><td>Après hausse</td><td>Retournement baissier</td></tr>
                            <tr><td>Double Bottom (W)</td><td>Après baisse</td><td>Retournement haussier</td></tr>
                            <tr><td>Head & Shoulders</td><td>Après hausse</td><td>Retournement baissier</td></tr>
                            <tr><td>Inverse H&S</td><td>Après baisse</td><td>Retournement haussier</td></tr>
                        </table>

                        <h4>Chandeliers japonais clés</h4>
                        <ul>
                            <li><strong>Doji:</strong> Indécision, possible retournement</li>
                            <li><strong>Marteau (Hammer):</strong> Retournement haussier après baisse</li>
                            <li><strong>Étoile filante:</strong> Retournement baissier après hausse</li>
                            <li><strong>Engulfing:</strong> Grande bougie qui "avale" la précédente = signal fort</li>
                        </ul>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p>Les patterns ne sont pas des garanties! Ils indiquent des probabilités. Toujours confirmer avec d'autres indicateurs et le contexte général.</p>
                        </div>
                    `
                },
                {
                    id: 'ta-4',
                    title: 'Timeframes & Multi-TF',
                    content: `
                        <h3>⏰ L'importance des timeframes</h3>
                        <p>Un même actif peut être haussier sur un timeframe et baissier sur un autre. Le multi-timeframe réconcilie ces vues.</p>

                        <h4>Timeframes courants</h4>
                        <table class="learn-table">
                            <tr><th>TF</th><th>Usage</th><th>Type de trader</th></tr>
                            <tr><td>1m, 5m</td><td>Scalping</td><td>Day trader</td></tr>
                            <tr><td>15m, 1h</td><td>Intraday</td><td>Day/Swing trader</td></tr>
                            <tr><td>4h, Daily</td><td>Swing trading</td><td>Swing trader</td></tr>
                            <tr><td>Weekly, Monthly</td><td>Position trading</td><td>Investisseur</td></tr>
                        </table>

                        <h4>Analyse Multi-Timeframe (MTF)</h4>
                        <div class="rule-box" style="background: rgba(0,170,255,0.1); padding: 16px; border-radius: 10px; margin: 16px 0;">
                            <p><strong>Règle des 3 timeframes:</strong></p>
                            <ol>
                                <li><strong>TF supérieur:</strong> Identifie la tendance principale</li>
                                <li><strong>TF intermédiaire:</strong> Trouve le setup d'entrée</li>
                                <li><strong>TF inférieur:</strong> Time l'entrée précise</li>
                            </ol>
                        </div>

                        <h4>Exemple pratique</h4>
                        <div class="example-box">
                            <p><strong>Pour du swing trading:</strong></p>
                            <ul>
                                <li>Daily: BTC en tendance haussière (prix > MA50)</li>
                                <li>4H: Pullback vers un support (RSI ~40)</li>
                                <li>1H: Bougie de retournement haussier = ENTRÉE</li>
                            </ul>
                        </div>

                        <div class="info-box success">
                            <span class="icon">✅</span>
                            <p>Toujours trader dans le sens de la tendance du TF supérieur. Cela augmente significativement le taux de réussite!</p>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'risk-management',
            title: 'Gestion du Risque',
            icon: '🛡️',
            level: 'advanced',
            duration: '30 min',
            xp: 300,
            lessons: [
                {
                    id: 'rm-1',
                    title: 'Position Sizing',
                    content: `
                        <h3>📏 La taille de position optimale</h3>
                        <p>Le position sizing détermine combien risquer sur chaque trade. C'est LA clé de la survie en trading.</p>

                        <h4>La règle du 1-2%</h4>
                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p><strong>Ne jamais risquer plus de 1-2% du capital sur un seul trade.</strong><br>
                            Avec un capital de $10,000, le risque max par trade = $100-200.</p>
                        </div>

                        <h4>Calcul de la taille de position</h4>
                        <div class="example-box">
                            <p><strong>Formule:</strong></p>
                            <p style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px;">
                            Taille Position = (Capital × % Risque) ÷ (Entry - Stop Loss)
                            </p>
                            <p><strong>Exemple:</strong><br>
                            Capital: $10,000 | Risque: 1% ($100)<br>
                            Entry: $100 | Stop Loss: $95 (risque $5 par unité)<br>
                            → Position = $100 ÷ $5 = 20 unités maximum</p>
                        </div>

                        <h4>Adapter selon le contexte</h4>
                        <table class="learn-table">
                            <tr><th>Situation</th><th>Risque suggéré</th></tr>
                            <tr><td>Setup A+ (très confiant)</td><td>2%</td></tr>
                            <tr><td>Setup standard</td><td>1%</td></tr>
                            <tr><td>Marché incertain</td><td>0.5%</td></tr>
                            <tr><td>Série de pertes</td><td>0.25% (réduire)</td></tr>
                        </table>
                    `
                },
                {
                    id: 'rm-2',
                    title: 'Stop-Loss & Take-Profit',
                    content: `
                        <h3>🎯 Gérer ses sorties</h3>
                        <p>L'entrée est importante, mais c'est la sortie qui détermine le profit ou la perte.</p>

                        <h4>Types de Stop-Loss</h4>
                        <ul>
                            <li><strong>Stop fixe:</strong> Prix défini à l'avance (ex: -5%)</li>
                            <li><strong>Stop technique:</strong> Sous un support ou une structure</li>
                            <li><strong>Trailing stop:</strong> Suit le prix à distance fixe</li>
                            <li><strong>Stop mental:</strong> Dangereux! À éviter.</li>
                        </ul>

                        <h4>Ratio Risque/Récompense (R:R)</h4>
                        <div class="comparison-box">
                            <div class="bad">
                                <h4>❌ Mauvais R:R (1:1)</h4>
                                <p>Risque $100 pour gagner $100</p>
                                <p>Tu dois avoir 50%+ de winrate</p>
                            </div>
                            <div class="good">
                                <h4>✅ Bon R:R (1:2 ou 1:3)</h4>
                                <p>Risque $100 pour gagner $200-300</p>
                                <p>Rentable même avec 40% de winrate</p>
                            </div>
                        </div>

                        <h4>Stratégies de Take-Profit</h4>
                        <table class="learn-table">
                            <tr><th>Stratégie</th><th>Description</th></tr>
                            <tr><td>TP fixe</td><td>Sortie complète à un niveau</td></tr>
                            <tr><td>Scaling out</td><td>50% à TP1, 50% à TP2</td></tr>
                            <tr><td>Trailing TP</td><td>Suivre le prix, sortir sur retournement</td></tr>
                            <tr><td>Break-even</td><td>Déplacer SL à l'entrée après +1R</td></tr>
                        </table>

                        <div class="info-box success">
                            <span class="icon">💡</span>
                            <p>Toujours placer le stop AVANT d'entrer en position. Pas après!</p>
                        </div>
                    `
                },
                {
                    id: 'rm-3',
                    title: 'Théorie du Portfolio',
                    content: `
                        <h3>📊 Diversification avancée</h3>
                        <p>Un portfolio bien construit réduit le risque global sans sacrifier le rendement.</p>

                        <h4>Corrélation entre actifs</h4>
                        <p>La corrélation mesure comment deux actifs bougent ensemble.</p>
                        <table class="learn-table">
                            <tr><th>Corrélation</th><th>Signification</th><th>Exemple</th></tr>
                            <tr><td>+1.0</td><td>Bougent identiquement</td><td>BTC et marché crypto</td></tr>
                            <tr><td>0</td><td>Indépendants</td><td>Crypto et obligations</td></tr>
                            <tr><td>-1.0</td><td>Opposés</td><td>Actions vs Or (parfois)</td></tr>
                        </table>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Diversifier avec des actifs corrélés à +0.9 ne réduit presque pas le risque! Cherche des actifs avec corrélation < 0.5.</p>
                        </div>

                        <h4>Allocation crypto typique</h4>
                        <ul>
                            <li><strong>40-50%</strong> BTC/ETH (blue chips, corrélés)</li>
                            <li><strong>20-30%</strong> Altcoins L1 (SOL, AVAX...)</li>
                            <li><strong>10-20%</strong> DeFi / Thématiques</li>
                            <li><strong>10-20%</strong> Stablecoins (réserve)</li>
                        </ul>

                        <h4>Rebalancing</h4>
                        <p>Rééquilibrer périodiquement pour maintenir les allocations cibles.</p>
                        <ul>
                            <li>Si BTC passe de 40% à 60% → Vendre pour revenir à 40%</li>
                            <li>Fréquence: mensuelle ou trimestrielle</li>
                            <li>Seuil: rebalancer si écart > 5-10%</li>
                        </ul>
                    `
                }
            ]
        },
        {
            id: 'defi-advanced',
            title: 'DeFi Avancé',
            icon: '🏗️',
            level: 'advanced',
            duration: '60 min',
            xp: 400,
            lessons: [
                {
                    id: 'defi-adv-1',
                    title: 'Lending & Borrowing avancé',
                    content: `
                        <h3>🏦 Stratégies de lending</h3>
                        <p>Le lending DeFi offre des opportunités bien au-delà du simple dépôt.</p>

                        <h4>Lending récursif (Looping)</h4>
                        <div class="example-box">
                            <p><strong>Comment ça marche:</strong></p>
                            <ol>
                                <li>Dépose $1000 USDC sur Aave (gagne 5%)</li>
                                <li>Emprunte $700 USDC contre ton collatéral</li>
                                <li>Redépose les $700 (gagne 5% sur $1700 total)</li>
                                <li>Répète... jusqu'à 3-4x le rendement initial</li>
                            </ol>
                            <p style="color: #ffaa00;">⚠️ Risque: Si le taux d'emprunt dépasse le taux de supply, tu perds!</p>
                        </div>

                        <h4>Health Factor & Liquidation</h4>
                        <table class="learn-table">
                            <tr><th>Health Factor</th><th>Statut</th><th>Action</th></tr>
                            <tr><td>> 2.0</td><td>Safe</td><td>Peux emprunter plus</td></tr>
                            <tr><td>1.5 - 2.0</td><td>Attention</td><td>Surveiller</td></tr>
                            <tr><td>1.0 - 1.5</td><td>Danger</td><td>Rembourser ou ajouter collatéral</td></tr>
                            <tr><td>< 1.0</td><td>Liquidation</td><td>Position fermée avec pénalité</td></tr>
                        </table>

                        <h4>Protocoles avancés</h4>
                        <ul>
                            <li><strong>Morpho:</strong> Matching P2P pour meilleurs taux</li>
                            <li><strong>Euler:</strong> Lending avec leverage intégré</li>
                            <li><strong>Silo:</strong> Marchés isolés (risque compartimenté)</li>
                        </ul>
                    `
                },
                {
                    id: 'defi-adv-2',
                    title: 'Liquidity Providing (LP)',
                    content: `
                        <h3>💧 Devenir fournisseur de liquidité</h3>
                        <p>Les LPs gagnent des frais en fournissant de la liquidité aux DEX.</p>

                        <h4>Comment ça marche</h4>
                        <ul>
                            <li>Tu déposes 2 tokens en paire (ex: ETH + USDC)</li>
                            <li>Les traders utilisent ta liquidité pour swap</li>
                            <li>Tu gagnes une part des frais de trading (0.05% à 1%)</li>
                            <li>Tu reçois un token LP représentant ta position</li>
                        </ul>

                        <h4>AMM v2 vs v3</h4>
                        <div class="comparison-box">
                            <div class="bad">
                                <h4>Uniswap V2</h4>
                                <p>Liquidité sur tout le range (0 à ∞)</p>
                                <p>Simple mais capital inefficace</p>
                            </div>
                            <div class="good">
                                <h4>Uniswap V3</h4>
                                <p>Liquidité concentrée (range choisi)</p>
                                <p>Jusqu'à 4000x plus efficace!</p>
                            </div>
                        </div>

                        <h4>Stratégies de range</h4>
                        <table class="learn-table">
                            <tr><th>Range</th><th>APY</th><th>Risque</th><th>Gestion</th></tr>
                            <tr><td>Étroit (±5%)</td><td>Très élevé</td><td>Out-of-range fréquent</td><td>Actif</td></tr>
                            <tr><td>Moyen (±20%)</td><td>Élevé</td><td>Équilibré</td><td>Hebdo</td></tr>
                            <tr><td>Large (±50%)</td><td>Modéré</td><td>Rarement out-of-range</td><td>Passif</td></tr>
                        </table>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Utilise des gestionnaires de liquidité comme Gamma ou Arrakis pour automatiser la gestion des ranges.</p>
                        </div>
                    `
                },
                {
                    id: 'defi-adv-3',
                    title: 'Yield Farming & Composabilité',
                    content: `
                        <h3>🌾 Stratégies de yield farming</h3>
                        <p>Le yield farming combine plusieurs protocoles pour maximiser les rendements.</p>

                        <h4>Sources de yield</h4>
                        <ul>
                            <li><strong>Trading fees:</strong> Frais des swaps (réel, durable)</li>
                            <li><strong>Emissions:</strong> Tokens offerts (inflation, moins durable)</li>
                            <li><strong>Bribes:</strong> Incitations pour votes (ve tokenomics)</li>
                            <li><strong>Points/Airdrops:</strong> Spéculatif mais potentiel élevé</li>
                        </ul>

                        <h4>Stratégie composée type</h4>
                        <div class="example-box">
                            <p><strong>Farming ETH avec leverage:</strong></p>
                            <ol>
                                <li>Dépose stETH sur Aave (~4% + points)</li>
                                <li>Emprunte ETH contre stETH</li>
                                <li>Stake l'ETH emprunté en stETH</li>
                                <li>Répète 2-3x → ~12-15% APY + points</li>
                            </ol>
                        </div>

                        <h4>Yield Aggregators</h4>
                        <table class="learn-table">
                            <tr><th>Protocole</th><th>Stratégie</th><th>APY typique</th></tr>
                            <tr><td>Yearn</td><td>Auto-compound + optimisation</td><td>5-20%</td></tr>
                            <tr><td>Beefy</td><td>Multi-chain, auto-compound</td><td>10-100%</td></tr>
                            <tr><td>Convex</td><td>Boost Curve + bribes</td><td>10-50%</td></tr>
                            <tr><td>Pendle</td><td>Yield trading (PT/YT)</td><td>Variable</td></tr>
                        </table>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p>APY élevé = risque élevé. Toujours vérifier: TVL, audits, âge du protocole, source du yield.</p>
                        </div>
                    `
                },
                {
                    id: 'defi-adv-4',
                    title: 'Impermanent Loss expliqué',
                    content: `
                        <h3>📉 L'Impermanent Loss (IL)</h3>
                        <p>L'IL est la perte subie par un LP quand le prix des tokens diverge.</p>

                        <h4>Comment ça arrive</h4>
                        <p>Quand tu fournis de la liquidité, l'AMM rebalance automatiquement ta position:</p>
                        <ul>
                            <li>Si ETH monte → L'AMM vend ton ETH pour maintenir le ratio</li>
                            <li>Si ETH baisse → L'AMM achète de l'ETH</li>
                            <li>Résultat: Tu as moins du token qui a performé</li>
                        </ul>

                        <h4>Calcul de l'IL</h4>
                        <table class="learn-table">
                            <tr><th>Changement de prix</th><th>IL (Uniswap V2)</th><th>IL (V3 ±10%)</th></tr>
                            <tr><td>±25%</td><td>0.6%</td><td>~2%</td></tr>
                            <tr><td>±50%</td><td>2.0%</td><td>~8%</td></tr>
                            <tr><td>±100% (2x)</td><td>5.7%</td><td>~25%</td></tr>
                            <tr><td>±300% (4x)</td><td>20.0%</td><td>100% (out of range)</td></tr>
                        </table>

                        <h4>Quand l'IL devient "permanent"</h4>
                        <div class="error-card">
                            <h4>L'IL est réalisé si:</h4>
                            <p>Tu retires ta liquidité alors que le prix a divergé. Si le prix revient au niveau initial, l'IL disparaît.</p>
                        </div>

                        <h4>Stratégies pour minimiser l'IL</h4>
                        <ul>
                            <li>✅ Paires de stablecoins (USDC/USDT): IL quasi-nul</li>
                            <li>✅ Paires corrélées (stETH/ETH): IL faible</li>
                            <li>✅ Ranges larges en V3: Moins d'IL mais moins de fees</li>
                            <li>✅ Farming à haut APY: Compense l'IL</li>
                        </ul>
                    `
                }
            ]
        },
        {
            id: 'onchain-analysis',
            title: 'Analyse On-Chain',
            icon: '🔗',
            level: 'advanced',
            duration: '40 min',
            xp: 350,
            lessons: [
                {
                    id: 'oc-1',
                    title: 'Whale Tracking',
                    content: `
                        <h3>🐋 Suivre les baleines</h3>
                        <p>Les whales (gros porteurs) peuvent influencer le marché. Suivre leurs mouvements donne un avantage.</p>

                        <h4>Où trouver les infos</h4>
                        <ul>
                            <li><strong>Arkham Intelligence:</strong> Identifie les wallets des institutions</li>
                            <li><strong>Nansen:</strong> Labels + alertes whale</li>
                            <li><strong>Whale Alert:</strong> Gros transferts en temps réel</li>
                            <li><strong>DeBank:</strong> Portfolios des wallets</li>
                        </ul>

                        <h4>Signaux à surveiller</h4>
                        <table class="learn-table">
                            <tr><th>Mouvement</th><th>Interprétation</th><th>Signal</th></tr>
                            <tr><td>Whale dépose sur exchange</td><td>Prépare à vendre</td><td>🔴 Bearish</td></tr>
                            <tr><td>Whale retire de l'exchange</td><td>Accumulation long terme</td><td>🟢 Bullish</td></tr>
                            <tr><td>Whale achète un altcoin</td><td>Confiance dans le projet</td><td>🟢 Bullish</td></tr>
                            <tr><td>Whale stablecoin sur wallet</td><td>Attend une opportunité</td><td>🟡 Attente</td></tr>
                        </table>

                        <h4>Limites</h4>
                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p>Les whales savent qu'elles sont surveillées. Elles peuvent:<br>
                            • Utiliser plusieurs wallets<br>
                            • Faire des faux mouvements<br>
                            • Passer par des OTC (hors-chain)</p>
                        </div>
                    `
                },
                {
                    id: 'oc-2',
                    title: 'TVL & Métriques DeFi',
                    content: `
                        <h3>📊 Total Value Locked (TVL)</h3>
                        <p>Le TVL représente la valeur totale des actifs déposés dans un protocole DeFi.</p>

                        <h4>Interpréter le TVL</h4>
                        <ul>
                            <li><strong>TVL élevé:</strong> Confiance des utilisateurs, liquidité profonde</li>
                            <li><strong>TVL croissant:</strong> Adoption en hausse, souvent bullish pour le token</li>
                            <li><strong>TVL en baisse:</strong> Fuite des capitaux, attention!</li>
                        </ul>

                        <h4>Métriques clés par protocole</h4>
                        <table class="learn-table">
                            <tr><th>Type</th><th>Métrique</th><th>Ce qu'elle indique</th></tr>
                            <tr><td>DEX</td><td>Volume / TVL</td><td>Efficacité du capital</td></tr>
                            <tr><td>Lending</td><td>Utilization rate</td><td>Demande d'emprunt</td></tr>
                            <tr><td>Perps</td><td>Open Interest</td><td>Positions ouvertes</td></tr>
                            <tr><td>Tout</td><td>Revenue / TVL</td><td>Rendement réel généré</td></tr>
                        </table>

                        <h4>Outils</h4>
                        <ul>
                            <li><strong>DefiLlama:</strong> TVL de tous les protocoles</li>
                            <li><strong>Token Terminal:</strong> Revenus et métriques financières</li>
                            <li><strong>Dune Analytics:</strong> Dashboards personnalisés</li>
                        </ul>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Compare toujours TVL en ETH ou BTC, pas en USD. Un TVL stable en USD peut cacher une fuite si le marché monte.</p>
                        </div>
                    `
                },
                {
                    id: 'oc-3',
                    title: 'Flows & Exchange Data',
                    content: `
                        <h3>💸 Flux d'exchange</h3>
                        <p>Les mouvements vers et depuis les exchanges révèlent les intentions des investisseurs.</p>

                        <h4>Exchange Inflow/Outflow</h4>
                        <div class="comparison-box">
                            <div class="bad">
                                <h4>📥 Inflow (vers exchange)</h4>
                                <p>Les gens déposent pour vendre</p>
                                <p class="result negative">→ Pression vendeuse à venir</p>
                            </div>
                            <div class="good">
                                <h4>📤 Outflow (hors exchange)</h4>
                                <p>Les gens retirent pour HODL</p>
                                <p class="result positive">→ Moins d'offre sur le marché</p>
                            </div>
                        </div>

                        <h4>Autres métriques d'exchange</h4>
                        <table class="learn-table">
                            <tr><th>Métrique</th><th>Signification</th></tr>
                            <tr><td>Exchange Reserve</td><td>Stock total sur les CEX</td></tr>
                            <tr><td>Funding Rate</td><td>Coût du leverage (+ = longs paient)</td></tr>
                            <tr><td>Open Interest</td><td>Valeur des positions ouvertes</td></tr>
                            <tr><td>Long/Short Ratio</td><td>Sentiment des traders</td></tr>
                        </table>

                        <h4>Signaux combinés</h4>
                        <ul>
                            <li>🟢 <strong>Bullish:</strong> Outflow + Funding négatif + OI bas</li>
                            <li>🔴 <strong>Bearish:</strong> Inflow + Funding très positif + OI haut</li>
                            <li>⚠️ <strong>Danger:</strong> Funding > 0.1% = Squeeze probable</li>
                        </ul>
                    `
                },
                {
                    id: 'oc-4',
                    title: 'Sentiment & Social',
                    content: `
                        <h3>📱 Analyse du sentiment</h3>
                        <p>Le sentiment du marché influence les prix à court terme.</p>

                        <h4>Fear & Greed Index</h4>
                        <table class="learn-table">
                            <tr><th>Score</th><th>Sentiment</th><th>Historiquement...</th></tr>
                            <tr><td>0-25</td><td>Extreme Fear</td><td>Opportunité d'achat</td></tr>
                            <tr><td>25-45</td><td>Fear</td><td>Prudence, accumulation possible</td></tr>
                            <tr><td>45-55</td><td>Neutral</td><td>Marché indécis</td></tr>
                            <tr><td>55-75</td><td>Greed</td><td>Momentum haussier</td></tr>
                            <tr><td>75-100</td><td>Extreme Greed</td><td>Sommet proche, prudence</td></tr>
                        </table>

                        <h4>Métriques sociales</h4>
                        <ul>
                            <li><strong>Social Volume:</strong> Mentions sur Twitter/Reddit</li>
                            <li><strong>Social Dominance:</strong> Part des discussions</li>
                            <li><strong>Dev Activity:</strong> Commits GitHub (santé du projet)</li>
                            <li><strong>Search Trends:</strong> Google Trends pour "Bitcoin"</li>
                        </ul>

                        <h4>Contrarian thinking</h4>
                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p><strong>"Be fearful when others are greedy, and greedy when others are fearful."</strong> - Warren Buffett<br><br>
                            Quand tout le monde est euphorique (shills partout, FOMO), c'est souvent proche du top. Quand tout le monde capitule (FUD, désespoir), c'est souvent proche du bottom.</p>
                        </div>

                        <h4>Outils de sentiment</h4>
                        <ul>
                            <li><strong>Alternative.me:</strong> Fear & Greed Index</li>
                            <li><strong>LunarCrush:</strong> Social metrics</li>
                            <li><strong>Santiment:</strong> On-chain + social combined</li>
                        </ul>
                    `
                }
            ]
        },
        {
            id: 'trading-psychology',
            title: 'Psychologie du Trading',
            icon: '🧠',
            level: 'intermediate',
            duration: '25 min',
            xp: 250,
            lessons: [
                {
                    id: 'psy-1',
                    title: 'FOMO & FUD',
                    content: `
                        <h3>😰 Les émotions qui tuent les portfolios</h3>
                        <p>Les deux plus grandes menaces pour un trader ne sont pas techniques, mais émotionnelles.</p>

                        <h4>FOMO (Fear Of Missing Out)</h4>
                        <div class="error-card">
                            <h4>Symptômes</h4>
                            <ul>
                                <li>Acheter après une grosse hausse "parce que ça continue de monter"</li>
                                <li>Entrer sans plan parce que "tout le monde gagne"</li>
                                <li>Augmenter la taille de position par excitation</li>
                            </ul>
                            <p class="solution">✅ Solution: Si tu n'avais pas prévu ce trade hier, ne le fais pas aujourd'hui.</p>
                        </div>

                        <h4>FUD (Fear, Uncertainty, Doubt)</h4>
                        <div class="error-card">
                            <h4>Symptômes</h4>
                            <ul>
                                <li>Vendre en panique lors d'une baisse</li>
                                <li>Croire chaque news négative sans vérifier</li>
                                <li>Sortir d'une position gagnante trop tôt</li>
                            </ul>
                            <p class="solution">✅ Solution: Définis ton stop-loss à l'avance et respecte-le. Ignore le bruit.</p>
                        </div>

                        <h4>Le cycle émotionnel du marché</h4>
                        <p>Euphorie → Anxiété → Déni → Panique → Capitulation → Dépression → Espoir → Optimisme → (Euphorie)</p>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Les meilleurs trades se font quand tu as le moins envie de les faire (acheter dans la panique, vendre dans l'euphorie).</p>
                        </div>
                    `
                },
                {
                    id: 'psy-2',
                    title: 'Discipline & Plan de trading',
                    content: `
                        <h3>📋 Le plan de trading</h3>
                        <p>Un plan de trading écrit élimine les décisions émotionnelles.</p>

                        <h4>Éléments du plan</h4>
                        <ul>
                            <li><strong>Règles d'entrée:</strong> Quels signaux pour entrer?</li>
                            <li><strong>Règles de sortie:</strong> TP et SL définis à l'avance</li>
                            <li><strong>Position sizing:</strong> Combien risquer par trade?</li>
                            <li><strong>Horaires:</strong> Quand trader? Quand ne pas trader?</li>
                            <li><strong>Nombre de trades:</strong> Max trades par jour/semaine</li>
                        </ul>

                        <h4>Exemple de plan simple</h4>
                        <div class="example-box">
                            <p><strong>Mon Plan de Trading:</strong></p>
                            <ul>
                                <li>✅ Entrée: RSI < 30 + support + volume</li>
                                <li>✅ Stop: 2% sous l'entrée</li>
                                <li>✅ Target: R:R minimum 1:2</li>
                                <li>✅ Risque: Max 1% du capital par trade</li>
                                <li>✅ Max: 3 trades par jour</li>
                                <li>❌ Pas de trading le lundi matin ou vendredi soir</li>
                                <li>❌ Stop après 2 pertes consécutives (pause 24h)</li>
                            </ul>
                        </div>

                        <h4>Discipline = Exécution</h4>
                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p>Un plan moyen exécuté avec discipline bat toujours un excellent plan ignoré. La différence entre les traders rentables et les autres? L'exécution.</p>
                        </div>
                    `
                },
                {
                    id: 'psy-3',
                    title: 'Journal de trading',
                    content: `
                        <h3>📓 Le journal: ta meilleure arme</h3>
                        <p>Le journal de trading transforme tes erreurs en leçons et tes succès en systèmes.</p>

                        <h4>Que noter pour chaque trade</h4>
                        <table class="learn-table">
                            <tr><th>Catégorie</th><th>Éléments</th></tr>
                            <tr><td>Technique</td><td>Entry, Exit, SL, TP, P&L, R:R réel</td></tr>
                            <tr><td>Contexte</td><td>Setup, timeframe, indicateurs utilisés</td></tr>
                            <tr><td>Exécution</td><td>As-tu suivi ton plan? Écarts?</td></tr>
                            <tr><td>Émotions</td><td>Comment te sentais-tu? Stress? FOMO?</td></tr>
                            <tr><td>Leçons</td><td>Que ferais-tu différemment?</td></tr>
                        </table>

                        <h4>Analyse hebdomadaire</h4>
                        <ul>
                            <li>Winrate de la semaine</li>
                            <li>R:R moyen</li>
                            <li>Meilleur et pire trade (pourquoi?)</li>
                            <li>Règles violées</li>
                            <li>Patterns récurrents (erreurs ou succès)</li>
                        </ul>

                        <h4>Outils de journaling</h4>
                        <ul>
                            <li><strong>Notion/Excel:</strong> Simple et personnalisable</li>
                            <li><strong>TraderSync:</strong> Journal dédié avec analytics</li>
                            <li><strong>Tradervue:</strong> Import automatique des trades</li>
                        </ul>

                        <div class="info-box success">
                            <span class="icon">✅</span>
                            <p>Après 50-100 trades journalisés, des patterns émergent. Tu découvriras TES forces et faiblesses spécifiques.</p>
                        </div>
                    `
                },
                {
                    id: 'psy-4',
                    title: 'Biais cognitifs',
                    content: `
                        <h3>🧠 Les pièges mentaux</h3>
                        <p>Notre cerveau est câblé pour nous tromper en trading. Connaître ces biais aide à les éviter.</p>

                        <h4>Biais principaux</h4>
                        <div class="error-card">
                            <h4>1. Biais de confirmation</h4>
                            <p>Chercher uniquement les infos qui confirment notre opinion.</p>
                            <p class="solution">✅ Cherche activement les arguments CONTRE ta position.</p>
                        </div>

                        <div class="error-card">
                            <h4>2. Aversion à la perte</h4>
                            <p>Tenir les perdants trop longtemps, couper les gagnants trop tôt.</p>
                            <p class="solution">✅ Définis SL et TP à l'avance et ne les modifie pas.</p>
                        </div>

                        <div class="error-card">
                            <h4>3. Effet de disposition</h4>
                            <p>Vendre les gagnants et garder les perdants (inverse de ce qu'il faut).</p>
                            <p class="solution">✅ Laisse courir les gains, coupe les pertes vite.</p>
                        </div>

                        <div class="error-card">
                            <h4>4. Overtrading</h4>
                            <p>Trader trop souvent, par ennui ou pour "récupérer" une perte.</p>
                            <p class="solution">✅ Fixe un nombre max de trades par jour.</p>
                        </div>

                        <div class="error-card">
                            <h4>5. Revenge trading</h4>
                            <p>Prendre un trade impulsif après une perte pour "se refaire".</p>
                            <p class="solution">✅ Après une perte, prends une pause obligatoire.</p>
                        </div>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Le meilleur moment pour évaluer tes décisions de trading: 24h après, quand l'émotion est retombée.</p>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'macro-crypto',
            title: 'Macro & Crypto',
            icon: '🌍',
            level: 'advanced',
            duration: '35 min',
            xp: 300,
            lessons: [
                {
                    id: 'macro-1',
                    title: 'La Fed et les taux d\'intérêt',
                    content: `
                        <h3>🏦 La Federal Reserve</h3>
                        <p>La Fed (banque centrale US) influence tous les marchés, crypto inclus.</p>

                        <h4>Impact des taux d'intérêt</h4>
                        <div class="comparison-box">
                            <div class="bad">
                                <h4>📈 Taux en hausse</h4>
                                <p>L'argent "sans risque" rapporte plus</p>
                                <p>Les investisseurs quittent les actifs risqués</p>
                                <p class="result negative">→ Bearish pour crypto</p>
                            </div>
                            <div class="good">
                                <h4>📉 Taux en baisse</h4>
                                <p>Épargne traditionnelle rapporte peu</p>
                                <p>Recherche de rendement → actifs risqués</p>
                                <p class="result positive">→ Bullish pour crypto</p>
                            </div>
                        </div>

                        <h4>Événements clés à suivre</h4>
                        <table class="learn-table">
                            <tr><th>Événement</th><th>Fréquence</th><th>Impact</th></tr>
                            <tr><td>FOMC Meeting</td><td>8x par an</td><td>Décision sur les taux</td></tr>
                            <tr><td>Fed Minutes</td><td>3 sem après FOMC</td><td>Détails des discussions</td></tr>
                            <tr><td>Jackson Hole</td><td>Annuel (août)</td><td>Discours du président Fed</td></tr>
                            <tr><td>CPI (Inflation)</td><td>Mensuel</td><td>Influence la politique Fed</td></tr>
                            <tr><td>NFP (Emploi)</td><td>Mensuel</td><td>Santé économique</td></tr>
                        </table>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p>Les jours de FOMC et CPI sont très volatils. Évite de prendre des positions importantes juste avant ces annonces.</p>
                        </div>
                    `
                },
                {
                    id: 'macro-2',
                    title: 'Corrélations crypto',
                    content: `
                        <h3>📊 Bitcoin et les autres marchés</h3>
                        <p>Les corrélations entre crypto et marchés traditionnels évoluent selon les conditions de marché.</p>

                        <h4>Corrélations historiques</h4>
                        <table class="learn-table">
                            <tr><th>Actif</th><th>Corrélation avec BTC</th><th>Notes</th></tr>
                            <tr><td>Nasdaq</td><td>0.5 - 0.8</td><td>Forte depuis 2020</td></tr>
                            <tr><td>S&P 500</td><td>0.4 - 0.7</td><td>Modérée à forte</td></tr>
                            <tr><td>Or</td><td>-0.2 à 0.3</td><td>Variable, parfois inverse</td></tr>
                            <tr><td>DXY (Dollar)</td><td>-0.5 à -0.8</td><td>Généralement inverse</td></tr>
                            <tr><td>Obligations</td><td>Variable</td><td>Dépend du régime de taux</td></tr>
                        </table>

                        <h4>Le DXY (Dollar Index)</h4>
                        <ul>
                            <li><strong>DXY monte:</strong> Dollar fort → Bearish crypto</li>
                            <li><strong>DXY baisse:</strong> Dollar faible → Bullish crypto</li>
                            <li>Corrélation inverse la plus fiable historiquement</li>
                        </ul>

                        <h4>Régimes de marché</h4>
                        <div class="example-box">
                            <p><strong>Risk-On (appétit pour le risque):</strong></p>
                            <ul>
                                <li>Actions tech ↑, Crypto ↑, Or ↓, USD ↓</li>
                            </ul>
                            <p><strong>Risk-Off (aversion au risque):</strong></p>
                            <ul>
                                <li>Actions ↓, Crypto ↓, Or ↑, USD ↑, Obligations ↑</li>
                            </ul>
                        </div>

                        <div class="info-box tip">
                            <span class="icon">💡</span>
                            <p>Surveille le DXY et le Nasdaq. Si les deux vont contre BTC, le mouvement a plus de chances de continuer.</p>
                        </div>
                    `
                },
                {
                    id: 'macro-3',
                    title: 'Cycles crypto',
                    content: `
                        <h3>🔄 Les cycles du marché crypto</h3>
                        <p>Le marché crypto suit des cycles liés au halving Bitcoin et aux conditions macro.</p>

                        <h4>Le cycle du halving</h4>
                        <table class="learn-table">
                            <tr><th>Phase</th><th>Durée</th><th>Caractéristiques</th></tr>
                            <tr><td>Accumulation</td><td>12-18 mois</td><td>Post-bear, prix bas, peu d'intérêt</td></tr>
                            <tr><td>Halving</td><td>Événement</td><td>Réduction de l'offre nouvelle</td></tr>
                            <tr><td>Bull Run</td><td>12-18 mois</td><td>Hausse progressive puis parabolique</td></tr>
                            <tr><td>Distribution</td><td>3-6 mois</td><td>Euphorie, tops locaux, volatilité</td></tr>
                            <tr><td>Bear Market</td><td>12-18 mois</td><td>Chute 80%+, capitulation</td></tr>
                        </table>

                        <h4>Historique des cycles</h4>
                        <ul>
                            <li><strong>2012:</strong> Halving → Top fin 2013 (~$1,100)</li>
                            <li><strong>2016:</strong> Halving → Top fin 2017 (~$20,000)</li>
                            <li><strong>2020:</strong> Halving → Top fin 2021 (~$69,000)</li>
                            <li><strong>2024:</strong> Halving → Top prévu 2025?</li>
                        </ul>

                        <div class="info-box warning">
                            <span class="icon">⚠️</span>
                            <p>Les cycles passés ne garantissent pas les futurs! Chaque cycle est influencé par des facteurs macro différents (adoption institutionnelle, régulation, innovation).</p>
                        </div>

                        <h4>Indicateurs de cycle</h4>
                        <ul>
                            <li><strong>MVRV:</strong> Market Value / Realized Value (>3.5 = top zone)</li>
                            <li><strong>NUPL:</strong> Net Unrealized Profit/Loss (>0.75 = euphorie)</li>
                            <li><strong>Pi Cycle Top:</strong> Croisement de MAs spécifiques</li>
                            <li><strong>Stock-to-Flow:</strong> Modèle basé sur la rareté</li>
                        </ul>
                    `
                },
                {
                    id: 'macro-4',
                    title: 'Calendrier économique',
                    content: `
                        <h3>📅 Événements à ne pas manquer</h3>
                        <p>Certains événements économiques provoquent une volatilité extrême. Anticipe-les.</p>

                        <h4>Calendrier mensuel type</h4>
                        <table class="learn-table">
                            <tr><th>Jour</th><th>Événement</th><th>Impact</th></tr>
                            <tr><td>1er vendredi</td><td>NFP (emploi US)</td><td>🔴 Très élevé</td></tr>
                            <tr><td>~10-15</td><td>CPI (inflation US)</td><td>🔴 Très élevé</td></tr>
                            <tr><td>~15</td><td>Retail Sales</td><td>🟡 Modéré</td></tr>
                            <tr><td>Variable</td><td>FOMC Meeting</td><td>🔴 Très élevé</td></tr>
                            <tr><td>Fin mois</td><td>GDP (PIB)</td><td>🟡 Modéré</td></tr>
                        </table>

                        <h4>Événements crypto-spécifiques</h4>
                        <ul>
                            <li><strong>Options/Futures expiry:</strong> Dernier vendredi du mois (volatilité)</li>
                            <li><strong>Token unlocks:</strong> Déblocage de tokens (pression vendeuse)</li>
                            <li><strong>Hard forks/Upgrades:</strong> Ethereum upgrades, etc.</li>
                            <li><strong>Décisions SEC/régulateurs:</strong> ETF approvals, lawsuits</li>
                        </ul>

                        <h4>Stratégies autour des événements</h4>
                        <div class="comparison-box">
                            <div class="bad">
                                <h4>❌ À éviter</h4>
                                <ul>
                                    <li>Garder des positions leveraged</li>
                                    <li>Ouvrir des trades juste avant</li>
                                    <li>Ignorer le calendrier</li>
                                </ul>
                            </div>
                            <div class="good">
                                <h4>✅ Bonnes pratiques</h4>
                                <ul>
                                    <li>Réduire l'exposition avant</li>
                                    <li>Attendre 15-30 min après l'annonce</li>
                                    <li>Utiliser des straddles (options)</li>
                                </ul>
                            </div>
                        </div>

                        <h4>Outils de calendrier</h4>
                        <ul>
                            <li><strong>ForexFactory:</strong> Calendrier économique complet</li>
                            <li><strong>Investing.com:</strong> Calendrier + prévisions</li>
                            <li><strong>CoinGlass:</strong> Options expiry + liquidations</li>
                        </ul>
                    `
                }
            ]
        }
    ],

    // Badges disponibles
    badges: [
        { id: 'first-lesson', name: 'Premier Pas', icon: '🎓', desc: 'Compléter ta première leçon' },
        { id: 'basics-complete', name: 'Fondations Solides', icon: '🏗️', desc: 'Terminer le cours Bases' },
        { id: 'all-strategies', name: 'Stratège', icon: '🎯', desc: 'Maîtriser toutes les stratégies' },
        { id: 'first-invest', name: 'Investisseur', icon: '💰', desc: 'Faire ton premier investissement' },
        { id: 'diversified', name: 'Diversifié', icon: '🌈', desc: 'Avoir 4+ produits différents' },
        { id: 'profit-taker', name: 'Profit Taker', icon: '🎉', desc: 'Prendre tes premiers profits' },
        { id: 'security-aware', name: 'Sécurité Maîtrisée', icon: '🛡️', desc: 'Terminer le cours sécurité' },
        // Advanced course badges
        { id: 'technical-analyst', name: 'Analyste Technique', icon: '📊', desc: 'Terminer le cours Analyse Technique' },
        { id: 'risk-master', name: 'Maître du Risque', icon: '⚖️', desc: 'Terminer le cours Gestion du Risque' },
        { id: 'defi-expert', name: 'Expert DeFi', icon: '🏗️', desc: 'Terminer le cours DeFi Avancé' },
        { id: 'onchain-detective', name: 'Détective On-Chain', icon: '🔗', desc: 'Terminer le cours Analyse On-Chain' },
        { id: 'zen-trader', name: 'Trader Zen', icon: '🧘', desc: 'Terminer le cours Psychologie du Trading' },
        { id: 'macro-guru', name: 'Guru Macro', icon: '🌍', desc: 'Terminer le cours Macro & Crypto' },
        { id: 'complete-education', name: 'Éducation Complète', icon: '👑', desc: 'Terminer tous les cours' }
    ],

    init() {
        this.loadProgress();
        console.log('[LearningCenter] Initialized');
    },

    loadProgress() {
        try {
            const saved = localStorage.getItem('obelisk_learning_progress');
            if (saved) {
                this.progress = JSON.parse(saved);
            }
        } catch (e) {}
    },

    saveProgress() {
        try {
            localStorage.setItem('obelisk_learning_progress', JSON.stringify(this.progress));
        } catch (e) {}
    },

    /**
     * Ouvrir directement un cours spécifique
     */
    openCourse(courseId) {
        this.open();
        // Délai pour que le modal soit chargé
        setTimeout(() => {
            this.showCourse(courseId);
        }, 100);
    },

    /**
     * Ouvrir le centre d'apprentissage
     */
    open() {
        const modal = document.createElement('div');
        modal.className = 'learning-modal-overlay';
        modal.id = 'learning-center-modal';
        modal.innerHTML = `
            <div class="learning-modal">
                <div class="learning-sidebar">
                    <div class="sidebar-header">
                        <h2>📚 Apprentissage</h2>
                        <div class="user-level">
                            <span class="level-icon">${this.levels[this.progress.currentLevel].icon}</span>
                            <span class="level-name">${this.levels[this.progress.currentLevel].name}</span>
                        </div>
                        <div class="xp-bar">
                            <div class="xp-fill" style="width: ${this.getXpProgress()}%"></div>
                        </div>
                        <span class="xp-text">${this.progress.xp} XP</span>
                    </div>
                    <nav class="course-nav">
                        ${this.courses.map(course => `
                            <div class="course-nav-item ${this.isCourseComplete(course.id) ? 'complete' : ''}"
                                 onclick="LearningCenter.showCourse('${course.id}')">
                                <span class="course-icon">${course.icon}</span>
                                <span class="course-title">${course.title}</span>
                                ${this.isCourseComplete(course.id) ? '<span class="complete-badge">✓</span>' : ''}
                            </div>
                        `).join('')}
                    </nav>
                    <div class="sidebar-footer">
                        <button class="btn-close-learning" onclick="document.getElementById('learning-center-modal').remove()">
                            Fermer
                        </button>
                    </div>
                </div>
                <div class="learning-content" id="learning-content">
                    ${this.renderWelcome()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.injectStyles();
    },

    renderWelcome() {
        const completedCount = this.progress.completedLessons.length;
        const totalLessons = this.courses.reduce((sum, c) => sum + c.lessons.length, 0);

        return `
            <div class="welcome-screen">
                <h1>👋 Bienvenue dans le Centre d'Apprentissage</h1>
                <p>Apprends à optimiser tes investissements de manière sûre et efficace.</p>

                <div class="progress-overview">
                    <div class="progress-stat">
                        <span class="stat-value">${completedCount}/${totalLessons}</span>
                        <span class="stat-label">Leçons complétées</span>
                    </div>
                    <div class="progress-stat">
                        <span class="stat-value">${this.progress.xp}</span>
                        <span class="stat-label">XP gagnés</span>
                    </div>
                    <div class="progress-stat">
                        <span class="stat-value">${this.progress.badges.length}</span>
                        <span class="stat-label">Badges obtenus</span>
                    </div>
                </div>

                <h2>📖 Parcours recommandé</h2>
                <div class="recommended-path">
                    ${this.courses.slice(0, 3).map((course, i) => `
                        <div class="path-item" onclick="LearningCenter.showCourse('${course.id}')">
                            <span class="path-number">${i + 1}</span>
                            <span class="path-icon">${course.icon}</span>
                            <div class="path-info">
                                <span class="path-title">${course.title}</span>
                                <span class="path-meta">${course.duration} • ${course.xp} XP</span>
                            </div>
                            <span class="path-arrow">→</span>
                        </div>
                    `).join('')}
                </div>

                <h2>🏆 Tes Badges</h2>
                <div class="badges-grid">
                    ${this.badges.map(badge => `
                        <div class="badge-item ${this.progress.badges.includes(badge.id) ? 'earned' : 'locked'}">
                            <span class="badge-icon">${badge.icon}</span>
                            <span class="badge-name">${badge.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    showCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        const content = document.getElementById('learning-content');
        content.innerHTML = `
            <div class="course-view">
                <div class="course-header">
                    <span class="course-icon-large">${course.icon}</span>
                    <div>
                        <h1>${course.title}</h1>
                        <p class="course-meta">${course.duration} • ${course.xp} XP • ${course.lessons.length} leçons</p>
                    </div>
                </div>

                <div class="lessons-list">
                    ${course.lessons.map((lesson, i) => `
                        <div class="lesson-item ${this.progress.completedLessons.includes(lesson.id) ? 'complete' : ''}"
                             onclick="LearningCenter.showLesson('${courseId}', '${lesson.id}')">
                            <span class="lesson-number">${i + 1}</span>
                            <span class="lesson-title">${lesson.title}</span>
                            ${this.progress.completedLessons.includes(lesson.id) ? '<span class="check">✓</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    showLesson(courseId, lessonId) {
        const course = this.courses.find(c => c.id === courseId);
        const lesson = course?.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
        const nextLesson = course.lessons[lessonIndex + 1];
        const prevLesson = course.lessons[lessonIndex - 1];

        const content = document.getElementById('learning-content');
        content.innerHTML = `
            <div class="lesson-view">
                <div class="lesson-header">
                    <button class="btn-back" onclick="LearningCenter.showCourse('${courseId}')">← Retour</button>
                    <h1>${lesson.title}</h1>
                </div>

                <div class="lesson-content">
                    ${lesson.content}
                </div>

                <div class="lesson-actions">
                    ${prevLesson ? `
                        <button class="btn-prev" onclick="LearningCenter.showLesson('${courseId}', '${prevLesson.id}')">
                            ← ${prevLesson.title}
                        </button>
                    ` : '<div></div>'}

                    <button class="btn-complete" onclick="LearningCenter.completeLesson('${courseId}', '${lessonId}')">
                        ${this.progress.completedLessons.includes(lessonId) ? '✓ Complété' : 'Marquer comme complété'}
                    </button>

                    ${nextLesson ? `
                        <button class="btn-next" onclick="LearningCenter.showLesson('${courseId}', '${nextLesson.id}')">
                            ${nextLesson.title} →
                        </button>
                    ` : '<div></div>'}
                </div>
            </div>
        `;
    },

    completeLesson(courseId, lessonId) {
        if (this.progress.completedLessons.includes(lessonId)) return;

        const course = this.courses.find(c => c.id === courseId);
        const xpPerLesson = Math.floor(course.xp / course.lessons.length);

        this.progress.completedLessons.push(lessonId);
        this.progress.xp += xpPerLesson;

        // Check for badge
        if (this.progress.completedLessons.length === 1) {
            this.awardBadge('first-lesson');
        }

        // Check if course complete
        const courseComplete = course.lessons.every(l => this.progress.completedLessons.includes(l.id));
        if (courseComplete && courseId === 'basics') {
            this.awardBadge('basics-complete');
        }

        // Update level
        this.updateLevel();
        this.saveProgress();

        // Refresh view
        this.showLesson(courseId, lessonId);

        if (typeof showNotification === 'function') {
            showNotification(`+${xpPerLesson} XP! Leçon complétée`, 'success');
        }
    },

    awardBadge(badgeId) {
        if (this.progress.badges.includes(badgeId)) return;

        const badge = this.badges.find(b => b.id === badgeId);
        this.progress.badges.push(badgeId);
        this.saveProgress();

        if (typeof showNotification === 'function' && badge) {
            showNotification(`🏆 Badge débloqué: ${badge.icon} ${badge.name}`, 'success');
        }
    },

    updateLevel() {
        const xp = this.progress.xp;
        if (xp >= 3000) this.progress.currentLevel = 'expert';
        else if (xp >= 1500) this.progress.currentLevel = 'advanced';
        else if (xp >= 500) this.progress.currentLevel = 'intermediate';
        else this.progress.currentLevel = 'beginner';
    },

    getXpProgress() {
        const currentLevel = this.levels[this.progress.currentLevel];
        const levels = Object.values(this.levels);
        const currentIndex = levels.findIndex(l => l.name === currentLevel.name);
        const nextLevel = levels[currentIndex + 1];

        if (!nextLevel) return 100;

        const xpInLevel = this.progress.xp - currentLevel.minXp;
        const xpNeeded = nextLevel.minXp - currentLevel.minXp;
        return Math.min(100, (xpInLevel / xpNeeded) * 100);
    },

    isCourseComplete(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        return course?.lessons.every(l => this.progress.completedLessons.includes(l.id));
    },

    injectStyles() {
        if (document.getElementById('learning-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'learning-styles';
        styles.textContent = `
            .learning-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                z-index: 500;
                display: flex;
            }

            .learning-modal {
                display: flex;
                width: 100%;
                height: 100%;
            }

            .learning-sidebar {
                width: 280px;
                background: linear-gradient(180deg, #1a1a2e, #0f0f1a);
                border-right: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                flex-direction: column;
            }

            .sidebar-header {
                padding: 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .sidebar-header h2 {
                margin: 0 0 16px 0;
                color: #fff;
            }

            .user-level {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }

            .level-icon {
                font-size: 24px;
            }

            .level-name {
                font-weight: 600;
                color: #00ff88;
            }

            .xp-bar {
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
            }

            .xp-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ff88, #00aaff);
                transition: width 0.3s;
            }

            .xp-text {
                font-size: 12px;
                color: #888;
                margin-top: 4px;
            }

            .course-nav {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
            }

            .course-nav-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 8px;
            }

            .course-nav-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .course-nav-item.complete {
                background: rgba(0, 255, 136, 0.1);
            }

            .course-icon {
                font-size: 20px;
            }

            .course-title {
                flex: 1;
                font-size: 13px;
                color: #ccc;
            }

            .complete-badge {
                color: #00ff88;
            }

            .sidebar-footer {
                padding: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .btn-close-learning {
                width: 100%;
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 8px;
                color: #fff;
                cursor: pointer;
            }

            .learning-content {
                flex: 1;
                overflow-y: auto;
                padding: 40px;
            }

            .welcome-screen h1 {
                color: #fff;
                margin-bottom: 8px;
            }

            .welcome-screen > p {
                color: #888;
                margin-bottom: 32px;
            }

            .progress-overview {
                display: flex;
                gap: 24px;
                margin-bottom: 40px;
            }

            .progress-stat {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px 30px;
                text-align: center;
            }

            .stat-value {
                display: block;
                font-size: 32px;
                font-weight: 700;
                color: #00ff88;
            }

            .stat-label {
                font-size: 12px;
                color: #888;
            }

            .welcome-screen h2 {
                color: #fff;
                font-size: 18px;
                margin: 32px 0 16px 0;
            }

            .recommended-path {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .path-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px 20px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .path-item:hover {
                background: rgba(255, 255, 255, 0.06);
                border-color: #00ff88;
            }

            .path-number {
                width: 28px;
                height: 28px;
                background: linear-gradient(135deg, #00ff88, #00aaff);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                color: #000;
            }

            .path-icon {
                font-size: 24px;
            }

            .path-info {
                flex: 1;
            }

            .path-title {
                display: block;
                font-weight: 600;
                color: #fff;
            }

            .path-meta {
                font-size: 12px;
                color: #888;
            }

            .path-arrow {
                color: #888;
            }

            .badges-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
            }

            .badge-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                padding: 16px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                min-width: 100px;
            }

            .badge-item.locked {
                opacity: 0.4;
                filter: grayscale(1);
            }

            .badge-item.earned {
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
            }

            .badge-icon {
                font-size: 28px;
            }

            .badge-name {
                font-size: 11px;
                color: #888;
                text-align: center;
            }

            /* Course View */
            .course-view .course-header {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 32px;
            }

            .course-icon-large {
                font-size: 48px;
            }

            .course-view h1 {
                color: #fff;
                margin: 0;
            }

            .course-meta {
                color: #888;
                margin: 4px 0 0 0;
            }

            .lessons-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .lesson-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px 20px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .lesson-item:hover {
                background: rgba(255, 255, 255, 0.06);
            }

            .lesson-item.complete {
                background: rgba(0, 255, 136, 0.05);
                border-color: rgba(0, 255, 136, 0.2);
            }

            .lesson-number {
                width: 28px;
                height: 28px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #888;
            }

            .lesson-item.complete .lesson-number {
                background: #00ff88;
                color: #000;
            }

            .lesson-title {
                flex: 1;
                color: #fff;
            }

            .check {
                color: #00ff88;
            }

            /* Lesson View */
            .lesson-view .lesson-header {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 32px;
            }

            .btn-back {
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 8px;
                color: #fff;
                cursor: pointer;
            }

            .lesson-view h1 {
                color: #fff;
                margin: 0;
            }

            .lesson-content {
                background: rgba(255, 255, 255, 0.02);
                border-radius: 16px;
                padding: 32px;
                margin-bottom: 24px;
            }

            .lesson-content h3 {
                color: #00ff88;
                margin-top: 0;
            }

            .lesson-content h4 {
                color: #fff;
                margin-top: 24px;
            }

            .lesson-content p {
                color: #ccc;
                line-height: 1.7;
            }

            .lesson-content ul, .lesson-content ol {
                color: #ccc;
                padding-left: 24px;
            }

            .lesson-content li {
                margin-bottom: 8px;
            }

            .learn-table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
            }

            .learn-table th, .learn-table td {
                padding: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                text-align: left;
            }

            .learn-table th {
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
            }

            .learn-table td {
                color: #ccc;
            }

            .info-box {
                display: flex;
                gap: 12px;
                padding: 16px;
                border-radius: 10px;
                margin: 16px 0;
            }

            .info-box.warning {
                background: rgba(255, 170, 0, 0.1);
                border: 1px solid rgba(255, 170, 0, 0.3);
            }

            .info-box.tip {
                background: rgba(0, 170, 255, 0.1);
                border: 1px solid rgba(0, 170, 255, 0.3);
            }

            .info-box.success {
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
            }

            .info-box .icon {
                font-size: 20px;
            }

            .info-box p {
                margin: 0;
                flex: 1;
            }

            .comparison-box {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin: 16px 0;
            }

            .comparison-box .bad {
                background: rgba(255, 68, 68, 0.1);
                border: 1px solid rgba(255, 68, 68, 0.3);
                border-radius: 10px;
                padding: 16px;
            }

            .comparison-box .good {
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 10px;
                padding: 16px;
            }

            .comparison-box h4 {
                margin: 0 0 8px 0;
            }

            .comparison-box p {
                margin: 4px 0;
                font-size: 13px;
            }

            .result {
                font-weight: 600;
                margin-top: 8px !important;
            }

            .result.negative {
                color: #ff4444;
            }

            .result.positive {
                color: #00ff88;
            }

            .example-box {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 16px;
                margin: 16px 0;
            }

            .portfolio-model {
                margin: 16px 0;
            }

            .allocation-bar {
                display: flex;
                height: 32px;
                border-radius: 8px;
                overflow: hidden;
            }

            .segment {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 600;
                color: #000;
            }

            .segment.safe { background: #00ff88; }
            .segment.moderate { background: #00aaff; }
            .segment.growth { background: #a855f7; }
            .segment.cash { background: #888; }

            .highlight-text {
                font-size: 24px;
                font-weight: 700;
                color: #00ff88;
                text-align: center;
                margin: 16px 0;
            }

            .portfolio-card {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 16px;
                padding: 24px;
                margin: 16px 0;
            }

            .portfolio-card.safe {
                border: 2px solid rgba(0, 255, 136, 0.3);
            }

            .portfolio-card.balanced {
                border: 2px solid rgba(0, 170, 255, 0.3);
            }

            .portfolio-card.growth {
                border: 2px solid rgba(168, 85, 247, 0.3);
            }

            .allocation-list {
                list-style: none;
                padding: 0;
                margin: 0 0 20px 0;
            }

            .allocation-list li {
                display: flex;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .allocation-list .pct {
                width: 50px;
                font-weight: 700;
                color: #fff;
            }

            .allocation-list .apy {
                margin-left: auto;
                color: #00ff88;
                font-size: 12px;
            }

            .portfolio-stats {
                display: flex;
                gap: 16px;
            }

            .portfolio-stats .stat {
                flex: 1;
                text-align: center;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }

            .portfolio-stats .label {
                display: block;
                font-size: 11px;
                color: #888;
                margin-bottom: 4px;
            }

            .portfolio-stats .value {
                font-size: 16px;
                font-weight: 700;
            }

            .portfolio-stats .value.positive { color: #00ff88; }
            .portfolio-stats .value.safe { color: #00ff88; }
            .portfolio-stats .value.moderate { color: #ffaa00; }
            .portfolio-stats .value.risky { color: #ff6464; }

            .error-card {
                background: rgba(255, 68, 68, 0.1);
                border: 1px solid rgba(255, 68, 68, 0.2);
                border-radius: 10px;
                padding: 16px;
                margin: 12px 0;
            }

            .error-card h4 {
                color: #ff6464;
                margin: 0 0 8px 0;
            }

            .error-desc {
                color: #ccc;
                margin: 0 0 8px 0;
            }

            .solution {
                color: #00ff88;
                margin: 0;
                font-size: 13px;
            }

            .protocol-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 16px;
                margin: 12px 0;
            }

            .protocol-card h4 {
                color: #00aaff;
                margin: 0 0 4px 0;
            }

            .protocol-desc {
                color: #888;
                font-size: 12px;
                margin: 0 0 12px 0;
            }

            .protocol-card ul {
                margin: 0;
                padding-left: 20px;
            }

            .lesson-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
            }

            .btn-prev, .btn-next {
                padding: 12px 20px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 8px;
                color: #fff;
                cursor: pointer;
                font-size: 13px;
            }

            .btn-complete {
                padding: 14px 28px;
                background: linear-gradient(135deg, #00ff88, #00aa55);
                border: none;
                border-radius: 10px;
                color: #000;
                font-weight: 700;
                cursor: pointer;
            }

            @media (max-width: 768px) {
                .learning-modal {
                    flex-direction: column;
                }

                .learning-sidebar {
                    width: 100%;
                    height: auto;
                    max-height: 200px;
                }

                .comparison-box {
                    grid-template-columns: 1fr;
                }

                .portfolio-stats {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => LearningCenter.init());
if (document.readyState !== 'loading') LearningCenter.init();

window.LearningCenter = LearningCenter;
console.log('[LearningCenter] Module loaded');
