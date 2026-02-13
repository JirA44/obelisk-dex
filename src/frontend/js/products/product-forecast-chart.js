/**
 * OBELISK DEX - Product Forecast Charts
 * Ajoute des mini-graphiques de prevision 12 mois a chaque produit
 * Affiche Min / Moyen / Max
 */

const ProductForecastChart = {
    /**
     * Configuration par defaut
     */
    config: {
        months: 12,
        volatilityFactor: {
            low: 0.05,      // +/- 5%
            medium: 0.12,   // +/- 12%
            high: 0.25,     // +/- 25%
            'very-high': 0.40  // +/- 40%
        }
    },

    /**
     * Initialiser les graphiques
     */
    init() {
        // Observer les changements dans le DOM pour ajouter les graphiques
        this.observeProducts();
        // Ajouter aux produits existants
        setTimeout(() => this.addChartsToAllProducts(), 1000);
        console.log('[ForecastChart] Initialized');
    },

    /**
     * Observer les nouveaux produits ajoutes au DOM
     */
    observeProducts() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const cards = node.querySelectorAll ? node.querySelectorAll('.product-card') : [];
                        cards.forEach(card => this.addChartToCard(card));
                        if (node.classList && node.classList.contains('product-card')) {
                            this.addChartToCard(node);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    },

    /**
     * Ajouter des graphiques a tous les produits existants
     */
    addChartsToAllProducts() {
        document.querySelectorAll('.product-card').forEach(card => {
            this.addChartToCard(card);
        });
    },

    /**
     * Ajouter un graphique a une carte de produit
     */
    addChartToCard(card) {
        // Eviter les doublons
        if (card.querySelector('.forecast-chart-container')) return;

        // Extraire les informations du produit
        const apyEl = card.querySelector('.apy-value');
        const riskEl = card.querySelector('.risk-badge');

        if (!apyEl) return;

        const apy = parseFloat(apyEl.textContent) || 5;
        let risk = 'medium';
        if (riskEl) {
            const riskText = riskEl.textContent.toLowerCase();
            if (riskText.includes('very') || riskText.includes('très')) risk = 'very-high';
            else if (riskText.includes('high') || riskText.includes('élevé') || riskText.includes('eleve')) risk = 'high';
            else if (riskText.includes('low') || riskText.includes('faible') || riskText.includes('bas')) risk = 'low';
        }

        // Generer les donnees de prevision
        const forecast = this.generateForecast(1000, apy, risk);

        // Creer le conteneur du graphique
        const container = document.createElement('div');
        container.className = 'forecast-chart-container';
        container.innerHTML = this.renderChart(forecast, apy);

        // Inserer avant le bouton d'investissement
        const btnInvest = card.querySelector('.btn-invest');
        if (btnInvest) {
            btnInvest.parentNode.insertBefore(container, btnInvest);
        } else {
            card.appendChild(container);
        }
    },

    /**
     * Generer les donnees de prevision pour 12 mois
     */
    generateForecast(principal, apy, risk) {
        const months = this.config.months;
        const monthlyRate = apy / 100 / 12;
        const volatility = this.config.volatilityFactor[risk] || 0.12;

        const data = [];

        for (let m = 0; m <= months; m++) {
            // Valeur moyenne (interet compose)
            const mean = principal * Math.pow(1 + monthlyRate, m);

            // Variation basee sur le risque et le temps
            const timeVariation = Math.sqrt(m / 12); // Variation augmente avec le temps
            const variation = mean * volatility * timeVariation;

            data.push({
                month: m,
                mean: mean,
                min: Math.max(principal * 0.5, mean - variation),
                max: mean + variation
            });
        }

        return data;
    },

    /**
     * Render le mini-graphique SVG
     */
    renderChart(data, apy) {
        const width = 200;
        const height = 60;
        const padding = { top: 5, right: 5, bottom: 15, left: 5 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Calculer les echelles
        const minY = Math.min(...data.map(d => d.min));
        const maxY = Math.max(...data.map(d => d.max));
        const range = maxY - minY || 1;

        const scaleX = (m) => padding.left + (m / 12) * chartWidth;
        const scaleY = (v) => padding.top + ((maxY - v) / range) * chartHeight;

        // Creer les chemins
        const minPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.min)}`).join(' ');
        const meanPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.mean)}`).join(' ');
        const maxPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.max)}`).join(' ');

        // Zone entre min et max
        const areaPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.month)} ${scaleY(d.max)}`).join(' ')
            + data.slice().reverse().map((d) => `L ${scaleX(d.month)} ${scaleY(d.min)}`).join(' ')
            + ' Z';

        // Valeurs finales
        const finalMean = data[data.length - 1].mean;
        const finalMin = data[data.length - 1].min;
        const finalMax = data[data.length - 1].max;
        const gain = ((finalMean - 1000) / 1000 * 100).toFixed(1);

        return `
            <div class="forecast-chart">
                <div class="forecast-header">
                    <span class="forecast-title">Prévision 12 mois</span>
                    <span class="forecast-gain">+${gain}%</span>
                </div>
                <svg viewBox="0 0 ${width} ${height}" class="forecast-svg">
                    <defs>
                        <linearGradient id="forecast-gradient-${apy}" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="rgba(0, 255, 136, 0.3)" />
                            <stop offset="100%" stop-color="rgba(0, 255, 136, 0)" />
                        </linearGradient>
                    </defs>
                    <!-- Zone min-max -->
                    <path d="${areaPath}" fill="url(#forecast-gradient-${apy})" />
                    <!-- Ligne max -->
                    <path d="${maxPath}" fill="none" stroke="rgba(0, 255, 136, 0.3)" stroke-width="1" stroke-dasharray="2,2" />
                    <!-- Ligne min -->
                    <path d="${minPath}" fill="none" stroke="rgba(255, 100, 100, 0.3)" stroke-width="1" stroke-dasharray="2,2" />
                    <!-- Ligne moyenne -->
                    <path d="${meanPath}" fill="none" stroke="#00ff88" stroke-width="2" />
                    <!-- Point final -->
                    <circle cx="${scaleX(12)}" cy="${scaleY(finalMean)}" r="3" fill="#00ff88" />
                </svg>
                <div class="forecast-legend">
                    <div class="forecast-stat max">
                        <span class="stat-label">Max</span>
                        <span class="stat-value">$${this.formatAmount(finalMax)}</span>
                    </div>
                    <div class="forecast-stat mean">
                        <span class="stat-label">Moy</span>
                        <span class="stat-value">$${this.formatAmount(finalMean)}</span>
                    </div>
                    <div class="forecast-stat min">
                        <span class="stat-label">Min</span>
                        <span class="stat-value">$${this.formatAmount(finalMin)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Formater les montants
     */
    formatAmount(value) {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
        return value.toFixed(0);
    },

    /**
     * Injecter les styles
     */
    injectStyles() {
        if (document.getElementById('forecast-chart-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'forecast-chart-styles';
        styles.textContent = `
            .forecast-chart-container {
                margin: 12px 0;
                padding: 10px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .forecast-chart {
                width: 100%;
            }

            .forecast-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;
            }

            .forecast-title {
                font-size: 10px;
                color: #888;
                text-transform: uppercase;
            }

            .forecast-gain {
                font-size: 12px;
                font-weight: 700;
                color: #00ff88;
                background: rgba(0, 255, 136, 0.15);
                padding: 2px 8px;
                border-radius: 4px;
            }

            .forecast-svg {
                display: block;
                width: 100%;
                height: 60px;
            }

            .forecast-legend {
                display: flex;
                justify-content: space-around;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }

            .forecast-stat {
                text-align: center;
            }

            .forecast-stat .stat-label {
                display: block;
                font-size: 9px;
                color: #666;
                text-transform: uppercase;
                margin-bottom: 2px;
            }

            .forecast-stat .stat-value {
                font-size: 11px;
                font-weight: 600;
            }

            .forecast-stat.max .stat-value {
                color: rgba(0, 255, 136, 0.8);
            }

            .forecast-stat.mean .stat-value {
                color: #00ff88;
            }

            .forecast-stat.min .stat-value {
                color: rgba(255, 100, 100, 0.8);
            }

            /* Responsive */
            @media (max-width: 480px) {
                .forecast-legend {
                    gap: 5px;
                }
                .forecast-stat .stat-value {
                    font-size: 10px;
                }
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ProductForecastChart.injectStyles();
        ProductForecastChart.init();
    });
} else {
    ProductForecastChart.injectStyles();
    ProductForecastChart.init();
}

window.ProductForecastChart = ProductForecastChart;

console.log('[ForecastChart] Module loaded');
