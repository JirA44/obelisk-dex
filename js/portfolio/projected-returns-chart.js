/**
 * OBELISK DEX - Projected Returns Chart
 * Affiche les courbes de rendements projetes sur 100 ans
 */

const ProjectedReturnsChart = {
    canvas: null,
    ctx: null,

    // Periodes en annees
    periods: [1, 5, 10, 20, 30, 50, 75, 100],

    // Couleurs pour les lignes
    colors: {
        conservative: '#3b82f6',  // Bleu - 3-5% APY
        moderate: '#10b981',      // Vert - 8-12% APY
        aggressive: '#f59e0b',    // Orange - 15-25% APY
        crypto: '#8b5cf6',        // Violet - 30-50% APY
        defi: '#ec4899'           // Rose - 50-100% APY
    },

    // Strategies predefinies
    strategies: [
        { id: 'savings', name: 'Epargne (3%)', apy: 3, color: '#3b82f6', risk: 'low' },
        { id: 'staking', name: 'Staking ETH (5%)', apy: 5, color: '#627EEA', risk: 'low' },
        { id: 'lending', name: 'Lending USDC (8%)', apy: 8, color: '#2775CA', risk: 'medium' },
        { id: 'pools', name: 'LP Pools (15%)', apy: 15, color: '#10b981', risk: 'medium' },
        { id: 'vaults', name: 'Yield Vaults (25%)', apy: 25, color: '#f59e0b', risk: 'high' },
        { id: 'defi', name: 'DeFi Agressif (50%)', apy: 50, color: '#ec4899', risk: 'extreme' }
    ],

    init() {
        this.createUI();
        console.log('📈 Projected Returns Chart loaded');
    },

    /**
     * Calculer la valeur future avec interet compose
     */
    calculateCompoundInterest(principal, apy, years) {
        return principal * Math.pow(1 + apy / 100, years);
    },

    /**
     * Generer les donnees pour le graphique
     */
    generateChartData(principal, selectedStrategies) {
        const data = {};
        const years = [];

        // Generer les annees (0 a 100)
        for (let y = 0; y <= 100; y += 5) {
            years.push(y);
        }

        selectedStrategies.forEach(strategy => {
            data[strategy.id] = years.map(year => ({
                year,
                value: this.calculateCompoundInterest(principal, strategy.apy, year)
            }));
        });

        return { years, data };
    },

    createUI() {
        // Ajouter un bouton dans le portfolio pour ouvrir le graphique
        const portfolioActions = document.querySelector('.portfolio-actions') ||
                                 document.querySelector('#tab-portfolio .collapsible-panel');

        if (!portfolioActions) {
            // Creer un bouton flottant
            const btn = document.createElement('button');
            btn.id = 'btn-projections';
            btn.innerHTML = '📈 Projections 100 ans';
            btn.onclick = () => this.openModal();
            btn.style.cssText = `
                position: fixed;
                bottom: 200px;
                right: 20px;
                background: linear-gradient(135deg, #8b5cf6, #6366f1);
                color: #fff;
                border: none;
                padding: 12px 20px;
                border-radius: 30px;
                font-weight: 700;
                font-size: 13px;
                cursor: pointer;
                z-index: 8000;
                box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
            `;
            document.body.appendChild(btn);
        }
    },

    openModal() {
        let modal = document.getElementById('projections-modal');
        if (modal) { modal.remove(); return; }

        // Capital initial depuis SimulatedPortfolio ou defaut
        let initialCapital = 10000;
        if (typeof SimulatedPortfolio !== 'undefined') {
            const totals = SimulatedPortfolio.getTotalValue();
            initialCapital = totals.total > 0 ? totals.total : 10000;
        }

        modal = document.createElement('div');
        modal.id = 'projections-modal';
        modal.innerHTML = `
            <div class="projections-backdrop" onclick="ProjectedReturnsChart.closeModal()"></div>
            <div class="projections-content">
                <div class="projections-header">
                    <h2>📈 Projections de Rendement - 100 ans</h2>
                    <button type="button" class="projections-close" onclick="ProjectedReturnsChart.closeModal()">&times;</button>
                </div>

                <div class="projections-body">
                    <!-- Capital initial -->
                    <div class="projection-input-group">
                        <label>Capital Initial ($)</label>
                        <input type="number" id="projection-capital" value="${initialCapital.toFixed(0)}"
                               onchange="ProjectedReturnsChart.updateChart()">
                        <div class="quick-capitals">
                            <button onclick="ProjectedReturnsChart.setCapital(1000)">$1K</button>
                            <button onclick="ProjectedReturnsChart.setCapital(10000)">$10K</button>
                            <button onclick="ProjectedReturnsChart.setCapital(100000)">$100K</button>
                            <button onclick="ProjectedReturnsChart.setCapital(1000000)">$1M</button>
                        </div>
                    </div>

                    <!-- Selection des strategies -->
                    <div class="projection-strategies">
                        <label>Strategies a comparer:</label>
                        <div class="strategy-toggles">
                            ${this.strategies.map(s => `
                                <label class="strategy-toggle" style="--strat-color: ${s.color}">
                                    <input type="checkbox" value="${s.id}" checked
                                           onchange="ProjectedReturnsChart.updateChart()">
                                    <span class="toggle-dot" style="background: ${s.color}"></span>
                                    <span class="toggle-label">${s.name}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Graphique -->
                    <div class="projection-chart-container">
                        <canvas id="projection-canvas" width="800" height="400"></canvas>
                    </div>

                    <!-- Tableau des valeurs -->
                    <div class="projection-table-container">
                        <table class="projection-table" id="projection-table">
                            <thead>
                                <tr>
                                    <th>Strategie</th>
                                    <th>1 an</th>
                                    <th>5 ans</th>
                                    <th>10 ans</th>
                                    <th>25 ans</th>
                                    <th>50 ans</th>
                                    <th>100 ans</th>
                                </tr>
                            </thead>
                            <tbody id="projection-tbody"></tbody>
                        </table>
                    </div>

                    <!-- Avertissement -->
                    <div class="projection-warning">
                        <span>⚠️</span>
                        <p>Ces projections sont theoriques et basees sur des taux constants.
                           Les rendements reels varient. Les APY eleves comportent des risques eleves.
                           Ceci n'est pas un conseil financier.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.injectStyles();

        // Initialiser le canvas
        this.canvas = document.getElementById('projection-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Dessiner le graphique initial
        setTimeout(() => this.updateChart(), 100);
    },

    closeModal() {
        document.getElementById('projections-modal')?.remove();
    },

    setCapital(amount) {
        document.getElementById('projection-capital').value = amount;
        this.updateChart();
    },

    getSelectedStrategies() {
        const checkboxes = document.querySelectorAll('.strategy-toggle input:checked');
        const selectedIds = Array.from(checkboxes).map(cb => cb.value);
        return this.strategies.filter(s => selectedIds.includes(s.id));
    },

    updateChart() {
        const capital = parseFloat(document.getElementById('projection-capital').value) || 10000;
        const selected = this.getSelectedStrategies();

        if (selected.length === 0) return;

        const { years, data } = this.generateChartData(capital, selected);

        this.drawChart(years, data, selected, capital);
        this.updateTable(selected, capital);
    },

    drawChart(years, data, strategies, capital) {
        const canvas = this.canvas;
        const ctx = this.ctx;

        if (!canvas || !ctx) return;

        // Dimensions
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 40, right: 120, bottom: 50, left: 80 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);

        // Trouver le max pour l'echelle
        let maxValue = capital;
        strategies.forEach(s => {
            const finalValue = this.calculateCompoundInterest(capital, s.apy, 100);
            if (finalValue > maxValue) maxValue = finalValue;
        });

        // Limiter pour lisibilite (echelle log si trop grand)
        const useLogScale = maxValue > capital * 1000;

        // Fonction de mapping Y
        const mapY = (value) => {
            if (useLogScale) {
                const logMin = Math.log10(capital);
                const logMax = Math.log10(maxValue);
                const logValue = Math.log10(Math.max(value, capital));
                return padding.top + chartHeight - ((logValue - logMin) / (logMax - logMin)) * chartHeight;
            }
            return padding.top + chartHeight - (value / maxValue) * chartHeight;
        };

        // Fonction de mapping X
        const mapX = (year) => {
            return padding.left + (year / 100) * chartWidth;
        };

        // Grille
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Lignes horizontales
        const ySteps = useLogScale ? 6 : 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = padding.top + (i / ySteps) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Labels Y
            let labelValue;
            if (useLogScale) {
                const logMin = Math.log10(capital);
                const logMax = Math.log10(maxValue);
                labelValue = Math.pow(10, logMax - (i / ySteps) * (logMax - logMin));
            } else {
                labelValue = maxValue * (1 - i / ySteps);
            }

            ctx.fillStyle = '#888';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(this.formatLargeNumber(labelValue), padding.left - 10, y + 4);
        }

        // Lignes verticales (annees)
        const xLabels = [0, 10, 25, 50, 75, 100];
        xLabels.forEach(year => {
            const x = mapX(year);
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();

            // Label X
            ctx.fillStyle = '#888';
            ctx.textAlign = 'center';
            ctx.fillText(year + ' ans', x, height - padding.bottom + 20);
        });

        // Dessiner les courbes
        strategies.forEach(strategy => {
            const points = data[strategy.id];
            if (!points) return;

            ctx.strokeStyle = strategy.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            points.forEach((point, i) => {
                const x = mapX(point.year);
                const y = mapY(point.value);

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Point final avec valeur
            const lastPoint = points[points.length - 1];
            const lastX = mapX(lastPoint.year);
            const lastY = mapY(lastPoint.value);

            // Point
            ctx.beginPath();
            ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
            ctx.fillStyle = strategy.color;
            ctx.fill();

            // Label de la strategie
            ctx.fillStyle = strategy.color;
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(strategy.name.split('(')[0].trim(), lastX + 10, lastY + 4);
        });

        // Titre
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Croissance du Capital sur 100 ans (Interet Compose)', width / 2, 20);

        // Indicateur echelle
        if (useLogScale) {
            ctx.fillStyle = '#f59e0b';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Echelle logarithmique', padding.left, padding.top - 5);
        }
    },

    updateTable(strategies, capital) {
        const tbody = document.getElementById('projection-tbody');
        if (!tbody) return;

        const periods = [1, 5, 10, 25, 50, 100];

        tbody.innerHTML = strategies.map(s => {
            const values = periods.map(year => {
                const value = this.calculateCompoundInterest(capital, s.apy, year);
                return `<td style="color: ${s.color}">${this.formatLargeNumber(value)}</td>`;
            }).join('');

            return `
                <tr>
                    <td>
                        <span class="strat-dot" style="background: ${s.color}"></span>
                        ${s.name}
                    </td>
                    ${values}
                </tr>
            `;
        }).join('');
    },

    formatLargeNumber(value) {
        if (value >= 1e18) return '$' + (value / 1e18).toFixed(1) + 'Qi';  // Quintillion
        if (value >= 1e15) return '$' + (value / 1e15).toFixed(1) + 'Qa';  // Quadrillion
        if (value >= 1e12) return '$' + (value / 1e12).toFixed(1) + 'T';   // Trillion
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';     // Billion
        if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';     // Million
        if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';     // Thousand
        return '$' + value.toFixed(0);
    },

    injectStyles() {
        if (document.getElementById('projections-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'projections-styles';
        styles.textContent = `
            #projections-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10002;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .projections-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
            }

            .projections-content {
                position: relative;
                background: linear-gradient(180deg, #0a0a0f 0%, #0f1419 100%);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 20px;
                width: 95%;
                max-width: 900px;
                max-height: 90vh;
                overflow-y: auto;
            }

            .projections-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .projections-header h2 {
                margin: 0;
                font-size: 20px;
                color: #8b5cf6;
            }

            .projections-close {
                background: none;
                border: none;
                color: #888;
                font-size: 28px;
                cursor: pointer;
            }

            .projections-body {
                padding: 24px;
            }

            .projection-input-group {
                margin-bottom: 20px;
            }

            .projection-input-group label {
                display: block;
                color: #888;
                font-size: 13px;
                margin-bottom: 8px;
            }

            .projection-input-group input {
                width: 100%;
                max-width: 200px;
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: #fff;
                font-size: 18px;
                font-weight: 600;
            }

            .quick-capitals {
                display: flex;
                gap: 8px;
                margin-top: 10px;
            }

            .quick-capitals button {
                padding: 8px 16px;
                background: rgba(139, 92, 246, 0.2);
                border: 1px solid rgba(139, 92, 246, 0.4);
                border-radius: 8px;
                color: #8b5cf6;
                font-weight: 600;
                cursor: pointer;
            }

            .quick-capitals button:hover {
                background: rgba(139, 92, 246, 0.3);
            }

            .projection-strategies {
                margin-bottom: 20px;
            }

            .projection-strategies > label {
                display: block;
                color: #888;
                font-size: 13px;
                margin-bottom: 10px;
            }

            .strategy-toggles {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .strategy-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .strategy-toggle:hover {
                border-color: var(--strat-color);
            }

            .strategy-toggle input {
                display: none;
            }

            .strategy-toggle input:checked + .toggle-dot {
                box-shadow: 0 0 8px var(--strat-color);
            }

            .strategy-toggle input:checked ~ .toggle-label {
                color: #fff;
            }

            .toggle-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
            }

            .toggle-label {
                font-size: 12px;
                color: #888;
            }

            .projection-chart-container {
                background: #0a0a0f;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
                overflow-x: auto;
            }

            #projection-canvas {
                display: block;
                max-width: 100%;
            }

            .projection-table-container {
                overflow-x: auto;
                margin-bottom: 20px;
            }

            .projection-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
            }

            .projection-table th,
            .projection-table td {
                padding: 10px 12px;
                text-align: right;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .projection-table th {
                color: #888;
                font-weight: 600;
                background: rgba(255, 255, 255, 0.02);
            }

            .projection-table th:first-child,
            .projection-table td:first-child {
                text-align: left;
            }

            .projection-table td:first-child {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .strat-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .projection-warning {
                display: flex;
                gap: 12px;
                padding: 16px;
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                border-radius: 12px;
            }

            .projection-warning span {
                font-size: 20px;
            }

            .projection-warning p {
                margin: 0;
                color: #f59e0b;
                font-size: 12px;
                line-height: 1.5;
            }

            @media (max-width: 768px) {
                .projections-content {
                    max-width: 100%;
                    border-radius: 0;
                    max-height: 100vh;
                }

                #projection-canvas {
                    width: 700px;
                    height: 350px;
                }

                .projection-table {
                    font-size: 10px;
                }
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProjectedReturnsChart.init());
} else {
    setTimeout(() => ProjectedReturnsChart.init(), 500);
}

window.ProjectedReturnsChart = ProjectedReturnsChart;
