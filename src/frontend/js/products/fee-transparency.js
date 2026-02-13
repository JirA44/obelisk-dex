/**
 * FEE TRANSPARENCY MODULE - Obelisk DEX
 * Complete fee transparency with PFOF explanation and competitor comparison
 */

const FeeTransparency = {
    // ============================================
    // ALL FEES DOCUMENTED
    // ============================================
    fees: {
        platform: {
            rate: 0.002,
            name: 'Frais plateforme',
            nameEn: 'Platform Fee',
            visible: true,
            description: 'Frais prélevés sur chaque transaction pour maintenir la plateforme',
            descriptionEn: 'Fee charged on each transaction to maintain the platform'
        },
        gas: {
            rate: 'variable',
            name: 'Frais réseau (gas)',
            nameEn: 'Network Fee (gas)',
            visible: true,
            description: 'Frais payés aux mineurs/validateurs du réseau blockchain',
            descriptionEn: 'Fee paid to blockchain network miners/validators',
            estimates: {
                ethereum: { low: 2, medium: 5, high: 15 },
                arbitrum: { low: 0.05, medium: 0.15, high: 0.50 },
                polygon: { low: 0.01, medium: 0.03, high: 0.10 },
                optimism: { low: 0.05, medium: 0.15, high: 0.40 },
                base: { low: 0.02, medium: 0.08, high: 0.25 }
            }
        },
        slippage: {
            rate: 0.005,
            name: 'Slippage max',
            nameEn: 'Max Slippage',
            visible: true,
            description: 'Différence max entre prix attendu et prix exécuté (configurable)',
            descriptionEn: 'Max difference between expected and executed price (configurable)'
        },
        dexFee: {
            rate: 0.003,
            name: 'Frais DEX (Uniswap/etc)',
            nameEn: 'DEX Fee (Uniswap/etc)',
            visible: true,
            note: 'Inclus dans le prix - va aux liquidity providers',
            noteEn: 'Included in price - goes to liquidity providers',
            description: 'Frais du protocole DEX (0.3% Uniswap V2, 0.05-1% Uniswap V3)',
            descriptionEn: 'DEX protocol fee (0.3% Uniswap V2, 0.05-1% Uniswap V3)'
        },
        priceImpact: {
            rate: 'variable',
            name: 'Impact sur le prix',
            nameEn: 'Price Impact',
            visible: true,
            description: 'Impact de votre ordre sur le prix du marché (dépend de la taille)',
            descriptionEn: 'Your order\'s impact on market price (depends on size)'
        },
        pfof: {
            rate: 0,
            name: 'Payment for Order Flow',
            nameEn: 'Payment for Order Flow',
            visible: true,
            note: 'AUCUN - Nous ne vendons pas vos ordres',
            noteEn: 'NONE - We do not sell your orders',
            description: 'Obelisk ne pratique PAS le PFOF. Vos ordres vont directement aux DEX.',
            descriptionEn: 'Obelisk does NOT practice PFOF. Your orders go directly to DEXs.'
        }
    },

    // ============================================
    // COMPETITOR COMPARISON
    // ============================================
    competitors: {
        obelisk: {
            name: 'Obelisk',
            trading: '0.2%',
            tradingNote: 'Tiers: 0.05% - 0.2%',
            withdrawal: '$0.01 - $15',
            withdrawalNote: 'Gas réseau uniquement',
            pfof: 'NON ✓',
            pfofNote: 'Ordres directs aux DEX',
            spread: '0.1%',
            spreadNote: 'Prix DEX réels',
            hiddenFees: 'Aucun',
            costPer1000: '~$3',
            highlight: true
        },
        binance: {
            name: 'Binance',
            trading: '0.1%',
            tradingNote: 'Maker/Taker, réductions BNB',
            withdrawal: '$1 - $25',
            withdrawalNote: 'Varie par crypto',
            pfof: 'Non',
            pfofNote: '-',
            spread: '0.01%',
            spreadNote: 'Très liquide',
            hiddenFees: 'Aucun connu',
            costPer1000: '~$1.10'
        },
        coinbase: {
            name: 'Coinbase',
            trading: '0.6%',
            tradingNote: 'Simple trade, moins sur Pro',
            withdrawal: 'Variable',
            withdrawalNote: 'Network fees',
            pfof: 'Non',
            pfofNote: '-',
            spread: '0.5%',
            spreadNote: 'Ajouté au prix',
            hiddenFees: 'Spread caché',
            costPer1000: '~$11'
        },
        robinhood: {
            name: 'Robinhood',
            trading: '0%',
            tradingNote: 'Gratuit apparent',
            withdrawal: 'N/A',
            withdrawalNote: 'Pas de retrait crypto',
            pfof: 'OUI ⚠️',
            pfofNote: '~$0.40/ordre vendu',
            spread: '1.5%',
            spreadNote: 'Coût caché majeur',
            hiddenFees: 'PFOF + Spread',
            costPer1000: '~$15 (caché)',
            warning: true
        },
        kraken: {
            name: 'Kraken',
            trading: '0.26%',
            tradingNote: 'Taker, 0.16% maker',
            withdrawal: '$0.5 - $10',
            withdrawalNote: 'Fixe par crypto',
            pfof: 'Non',
            pfofNote: '-',
            spread: '0.2%',
            spreadNote: 'Modéré',
            hiddenFees: 'Aucun connu',
            costPer1000: '~$4.60'
        },
        etoro: {
            name: 'eToro',
            trading: '1%',
            tradingNote: 'Spread inclus',
            withdrawal: '$5',
            withdrawalNote: 'Frais fixe',
            pfof: 'Non',
            pfofNote: 'Mais spread élevé',
            spread: '1-3%',
            spreadNote: 'Très variable',
            hiddenFees: 'Spread élevé',
            costPer1000: '~$15-30'
        }
    },

    // ============================================
    // REVENUE MODEL
    // ============================================
    revenueModel: {
        sources: [
            {
                name: 'Frais de transaction',
                percentage: '70%',
                description: '0.2% sur chaque swap/trade (tiers réduits pour membres fidèles)',
                icon: '💱'
            },
            {
                name: 'Frais de gestion ETF',
                percentage: '15%',
                description: '0.2% - 1% annuel sur les ETF crypto gérés',
                icon: '📊'
            },
            {
                name: 'Frais de staking',
                percentage: '10%',
                description: 'Part des récompenses de staking (transparent)',
                icon: '🔒'
            },
            {
                name: 'Services premium',
                percentage: '5%',
                description: 'Outils avancés, API, limites augmentées',
                icon: '⭐'
            }
        ],
        notRevenue: [
            'Vente de vos données (jamais)',
            'Payment for Order Flow (jamais)',
            'Publicités ciblées (jamais)',
            'Frais cachés (jamais)'
        ]
    },

    // ============================================
    // PFOF EXPLANATION
    // ============================================
    pfofExplanation: {
        title: 'Qu\'est-ce que le PFOF ?',
        titleEn: 'What is PFOF?',
        sections: [
            {
                heading: '📖 Définition',
                content: 'Le Payment for Order Flow (PFOF) est une pratique où les courtiers vendent les ordres de leurs clients à des market makers (Citadel, Virtu, etc.) au lieu de les envoyer directement en bourse.'
            },
            {
                heading: '⚠️ Pourquoi c\'est problématique',
                points: [
                    'Conflit d\'intérêts: Le courtier gagne plus en vendant vos ordres qu\'en vous offrant le meilleur prix',
                    'Prix moins bons: Les market makers profitent de la différence entre leur prix et le prix du marché',
                    'Manque de transparence: Vous ne savez pas combien vous "payez" vraiment',
                    'Front-running légalisé: Vos intentions de trading sont connues avant exécution'
                ]
            },
            {
                heading: '✅ L\'engagement Obelisk',
                points: [
                    'ZÉRO PFOF: Nous ne vendons jamais vos ordres',
                    'Ordres directs: Vos swaps vont directement aux DEX (Uniswap, etc.)',
                    'Meilleur prix: Vous obtenez le vrai prix du marché décentralisé',
                    'Transparence totale: Tous nos frais sont visibles AVANT chaque transaction'
                ]
            },
            {
                heading: '💰 Comment Obelisk gagne de l\'argent',
                content: 'Uniquement via des frais transparents: 0.2% par transaction (avec réductions), frais de gestion ETF, et services premium optionnels. Pas de PFOF, pas de vente de données, pas de frais cachés.'
            }
        ]
    },

    // ============================================
    // METHODS
    // ============================================

    /**
     * Calculate total cost for a trade
     */
    calculateTotalCost(amount, network = 'arbitrum', slippage = 0.005) {
        const platformFee = amount * this.fees.platform.rate;
        const gasEstimate = this.fees.gas.estimates[network]?.medium || 0.15;
        const slippageEstimate = amount * slippage;
        const dexFee = amount * this.fees.dexFee.rate;

        // Price impact estimation (0.1% for small, up to 2% for large)
        let priceImpact = 0;
        if (amount > 10000) priceImpact = amount * 0.005;
        else if (amount > 1000) priceImpact = amount * 0.002;
        else priceImpact = amount * 0.001;

        const totalCost = platformFee + gasEstimate + slippageEstimate + priceImpact;
        const netReceived = amount - totalCost;

        return {
            amount,
            platformFee: { value: platformFee, percent: this.fees.platform.rate * 100 },
            gasFee: { value: gasEstimate, network },
            slippage: { value: slippageEstimate, percent: slippage * 100 },
            dexFee: { value: dexFee, percent: this.fees.dexFee.rate * 100, note: 'Inclus dans le prix' },
            priceImpact: { value: priceImpact, percent: (priceImpact / amount) * 100 },
            pfof: { value: 0, note: 'Aucun PFOF - Meilleur prix réel' },
            totalCost,
            netReceived,
            costPercent: (totalCost / amount) * 100
        };
    },

    /**
     * Render fee breakdown for a trade
     */
    renderBreakdown(containerId, amount, network = 'arbitrum') {
        const el = document.getElementById(containerId);
        if (!el) return;

        const breakdown = this.calculateTotalCost(amount, network);

        el.innerHTML = `
            <div class="fee-breakdown-card">
                <div class="fee-breakdown-header">
                    <span class="fee-icon">📊</span>
                    <span>DÉTAIL DES COÛTS</span>
                </div>
                <div class="fee-breakdown-body">
                    <div class="fee-row fee-amount">
                        <span>Montant envoyé:</span>
                        <span class="fee-value">$${amount.toLocaleString('fr-FR', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="fee-separator"></div>
                    <div class="fee-row">
                        <span>Frais plateforme (${breakdown.platformFee.percent}%):</span>
                        <span class="fee-value negative">-$${breakdown.platformFee.value.toFixed(2)}</span>
                    </div>
                    <div class="fee-row">
                        <span>Frais réseau (${network}):</span>
                        <span class="fee-value negative">-$${breakdown.gasFee.value.toFixed(2)}</span>
                    </div>
                    <div class="fee-row">
                        <span>Slippage estimé (${breakdown.slippage.percent}%):</span>
                        <span class="fee-value negative">-$${breakdown.slippage.value.toFixed(2)}</span>
                    </div>
                    <div class="fee-row">
                        <span>Impact prix:</span>
                        <span class="fee-value negative">-$${breakdown.priceImpact.value.toFixed(2)}</span>
                    </div>
                    <div class="fee-separator"></div>
                    <div class="fee-row fee-total">
                        <span>COÛT TOTAL:</span>
                        <span class="fee-value">$${breakdown.totalCost.toFixed(2)} (${breakdown.costPercent.toFixed(2)}%)</span>
                    </div>
                    <div class="fee-row fee-net">
                        <span>Vous recevez:</span>
                        <span class="fee-value positive">~$${breakdown.netReceived.toFixed(2)}</span>
                    </div>
                    <div class="fee-pfof-notice">
                        <span class="pfof-icon">✅</span>
                        <span>Aucun PFOF - Meilleur prix réel</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render competitor comparison table
     */
    renderComparison(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const competitors = Object.values(this.competitors);

        el.innerHTML = `
            <div class="competitor-table-wrapper">
                <table class="competitor-table">
                    <thead>
                        <tr>
                            <th>Plateforme</th>
                            <th>Trading</th>
                            <th>Retrait</th>
                            <th>PFOF</th>
                            <th>Spread</th>
                            <th>Frais cachés</th>
                            <th>Coût $1000</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${competitors.map(c => `
                            <tr class="${c.highlight ? 'highlight-row' : ''} ${c.warning ? 'warning-row' : ''}">
                                <td class="competitor-name">${c.name}</td>
                                <td>
                                    <span class="main-value">${c.trading}</span>
                                    <span class="sub-note">${c.tradingNote}</span>
                                </td>
                                <td>
                                    <span class="main-value">${c.withdrawal}</span>
                                    <span class="sub-note">${c.withdrawalNote}</span>
                                </td>
                                <td class="${c.pfof.includes('OUI') ? 'pfof-yes' : 'pfof-no'}">
                                    <span class="main-value">${c.pfof}</span>
                                    <span class="sub-note">${c.pfofNote}</span>
                                </td>
                                <td>
                                    <span class="main-value">${c.spread}</span>
                                    <span class="sub-note">${c.spreadNote}</span>
                                </td>
                                <td class="${c.hiddenFees !== 'Aucun' && c.hiddenFees !== 'Aucun connu' ? 'has-hidden' : 'no-hidden'}">
                                    ${c.hiddenFees}
                                </td>
                                <td class="cost-column">${c.costPer1000}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Render revenue model
     */
    renderRevenueModel(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
            <div class="revenue-model">
                <h4>💰 Comment Obelisk gagne de l'argent</h4>
                <div class="revenue-sources">
                    ${this.revenueModel.sources.map(s => `
                        <div class="revenue-source">
                            <div class="source-header">
                                <span class="source-icon">${s.icon}</span>
                                <span class="source-name">${s.name}</span>
                                <span class="source-pct">${s.percentage}</span>
                            </div>
                            <p class="source-desc">${s.description}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="not-revenue">
                    <h5>🚫 Ce que nous ne faisons JAMAIS</h5>
                    <ul>
                        ${this.revenueModel.notRevenue.map(item => `
                            <li><span class="no-icon">✗</span> ${item}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    },

    /**
     * Render PFOF explanation
     */
    renderPFOFExplanation(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const pfof = this.pfofExplanation;

        el.innerHTML = `
            <div class="pfof-explanation">
                <h4>${pfof.title}</h4>
                ${pfof.sections.map(section => `
                    <div class="pfof-section">
                        <h5>${section.heading}</h5>
                        ${section.content ? `<p>${section.content}</p>` : ''}
                        ${section.points ? `
                            <ul>
                                ${section.points.map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render fee calculator
     */
    renderCalculator(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
            <div class="fee-calculator">
                <h4>🧮 Calculateur de Frais</h4>
                <div class="calc-inputs">
                    <div class="calc-group">
                        <label for="calc-amount">Montant ($)</label>
                        <input type="number" id="calc-amount" value="1000" min="1" step="100">
                    </div>
                    <div class="calc-group">
                        <label for="calc-network">Réseau</label>
                        <select id="calc-network">
                            <option value="arbitrum" selected>Arbitrum (rapide, pas cher)</option>
                            <option value="ethereum">Ethereum (cher)</option>
                            <option value="polygon">Polygon</option>
                            <option value="optimism">Optimism</option>
                            <option value="base">Base</option>
                        </select>
                    </div>
                    <div class="calc-group">
                        <label for="calc-slippage">Slippage (%)</label>
                        <select id="calc-slippage">
                            <option value="0.001">0.1% (strict)</option>
                            <option value="0.005" selected>0.5% (standard)</option>
                            <option value="0.01">1% (relâché)</option>
                        </select>
                    </div>
                </div>
                <button class="btn-calculate" onclick="FeeTransparency.updateCalculator()">Calculer</button>
                <div id="calc-result" class="calc-result"></div>
            </div>
        `;

        // Initial calculation
        this.updateCalculator();
    },

    updateCalculator() {
        const amount = parseFloat(document.getElementById('calc-amount')?.value) || 1000;
        const network = document.getElementById('calc-network')?.value || 'arbitrum';
        const slippage = parseFloat(document.getElementById('calc-slippage')?.value) || 0.005;

        this.renderBreakdown('calc-result', amount, network);
    },

    /**
     * Render all fees in a detailed list
     */
    renderFeesList(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
            <div class="fees-list">
                <h4>📋 Tous les Frais (Détaillés)</h4>
                ${Object.entries(this.fees).map(([key, fee]) => `
                    <div class="fee-item ${fee.rate === 0 ? 'fee-zero' : ''}">
                        <div class="fee-item-header">
                            <span class="fee-name">${fee.name}</span>
                            <span class="fee-rate ${fee.rate === 0 ? 'rate-zero' : ''}">
                                ${fee.rate === 0 ? '0% ✓' : (fee.rate === 'variable' ? 'Variable' : (fee.rate * 100).toFixed(1) + '%')}
                            </span>
                        </div>
                        <p class="fee-description">${fee.description}</p>
                        ${fee.note ? `<p class="fee-note">💡 ${fee.note}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render full transparency page
     */
    renderFullPage(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
            <div class="transparency-page">
                <div class="transparency-header">
                    <h2>🔍 Transparence des Frais</h2>
                    <p class="transparency-subtitle">Obelisk croit en une transparence totale. Aucun frais caché, aucun PFOF.</p>
                </div>

                <div class="transparency-grid">
                    <div class="transparency-section">
                        <div id="revenue-model-container"></div>
                    </div>

                    <div class="transparency-section">
                        <div id="fees-list-container"></div>
                    </div>

                    <div class="transparency-section full-width">
                        <div id="pfof-explanation-container"></div>
                    </div>

                    <div class="transparency-section full-width">
                        <h4>⚔️ Comparatif avec la Concurrence</h4>
                        <div id="comparison-container"></div>
                    </div>

                    <div class="transparency-section">
                        <div id="calculator-container"></div>
                    </div>
                </div>
            </div>
        `;

        // Render all sub-sections
        this.renderRevenueModel('revenue-model-container');
        this.renderFeesList('fees-list-container');
        this.renderPFOFExplanation('pfof-explanation-container');
        this.renderComparison('comparison-container');
        this.renderCalculator('calculator-container');
    },

    init() {
        console.log('[FeeTransparency] Module initialized');
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => FeeTransparency.init());

// Export
if (typeof window !== 'undefined') {
    window.FeeTransparency = FeeTransparency;
}
