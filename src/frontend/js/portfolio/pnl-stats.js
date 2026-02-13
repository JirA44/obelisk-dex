/**
 * OBELISK DEX - PnL Statistics
 * Affiche PnL total cumulé + moyennes par période
 */

const PnLStats = {
    // Historique des PnL (stocké en localStorage)
    history: [],

    init() {
        this.loadHistory();
        this.createStatsPanel();
        this.startTracking();
        console.log('[PnLStats] Initialized');
    },

    loadHistory() {
        try {
            const saved = localStorage.getItem('obelisk_pnl_history');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (e) {
            this.history = [];
        }
    },

    saveHistory() {
        try {
            // Garder max 365 jours d'historique
            if (this.history.length > 365) {
                this.history = this.history.slice(-365);
            }
            localStorage.setItem('obelisk_pnl_history', JSON.stringify(this.history));
        } catch (e) {
            console.warn('[PnLStats] Failed to save history');
        }
    },

    // Enregistrer le PnL quotidien
    recordDailyPnL() {
        if (typeof SimulatedPortfolio === 'undefined') return;

        const today = new Date().toISOString().split('T')[0];
        const totals = SimulatedPortfolio.getTotalValue();
        const earnings = totals.earnings || 0;

        // Trouver l'entrée d'aujourd'hui ou créer une nouvelle
        const todayEntry = this.history.find(h => h.date === today);

        if (todayEntry) {
            todayEntry.pnl = earnings;
            todayEntry.total = totals.total;
        } else {
            // Calculer le PnL du jour (différence avec hier)
            const yesterday = this.history[this.history.length - 1];
            const dailyPnl = yesterday ? earnings - yesterday.pnl : earnings;

            this.history.push({
                date: today,
                pnl: earnings,        // PnL cumulé total
                dailyPnl: dailyPnl,   // PnL du jour
                total: totals.total
            });
        }

        this.saveHistory();
        this.updateDisplay();
    },

    // Calculer les statistiques
    calculateStats() {
        const now = new Date();
        const totals = typeof SimulatedPortfolio !== 'undefined'
            ? SimulatedPortfolio.getTotalValue()
            : { earnings: 0, total: 0, invested: 0 };

        // PnL total cumulé
        const totalPnL = totals.earnings || 0;

        // Filtrer par période
        const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const yearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const last24h = this.history.filter(h => h.date >= dayAgo);
        const lastWeek = this.history.filter(h => h.date >= weekAgo);
        const lastMonth = this.history.filter(h => h.date >= monthAgo);
        const lastYear = this.history.filter(h => h.date >= yearAgo);

        // Calculer PnL par période
        const calcPeriodPnL = (entries) => {
            if (entries.length < 2) return 0;
            return entries[entries.length - 1].pnl - entries[0].pnl;
        };

        // Calculer moyenne quotidienne
        const calcAvgDaily = (entries) => {
            if (entries.length === 0) return 0;
            const dailyPnLs = entries.map(e => e.dailyPnl || 0);
            return dailyPnLs.reduce((a, b) => a + b, 0) / dailyPnLs.length;
        };

        return {
            total: totalPnL,
            invested: totals.invested || 0,
            portfolioValue: totals.total || 0,

            // PnL par période
            daily: last24h.length > 0 ? (last24h[last24h.length - 1]?.dailyPnl || 0) : 0,
            weekly: calcPeriodPnL(lastWeek),
            monthly: calcPeriodPnL(lastMonth),
            yearly: calcPeriodPnL(lastYear),

            // Moyennes
            avgDaily: calcAvgDaily(lastMonth),  // Moyenne sur 30 jours
            avgWeekly: calcAvgDaily(lastMonth) * 7,
            avgMonthly: calcAvgDaily(lastYear.length > 0 ? lastYear : lastMonth) * 30,
            avgYearly: calcAvgDaily(lastYear.length > 0 ? lastYear : lastMonth) * 365,

            // ROI
            roi: totals.invested > 0 ? (totalPnL / totals.invested * 100) : 0,

            // Jours trackés
            daysTracked: this.history.length
        };
    },

    createStatsPanel() {
        // Vérifier si déjà créé
        if (document.getElementById('pnl-stats-panel')) return;

        // Trouver le conteneur du portfolio - priorité à la zone dédiée
        const portfolioSection = document.getElementById('portfolio-pnl-area') ||
            document.querySelector('.portfolio-summary, .portfolio-stats, #portfolio-panel');

        if (!portfolioSection) {
            // Créer un panneau flottant si pas de section portfolio
            setTimeout(() => this.createFloatingPanel(), 1000);
            return;
        }

        // Ajouter dans le conteneur
        const panel = document.createElement('div');
        panel.id = 'pnl-stats-panel';
        panel.innerHTML = this.renderStats();
        portfolioSection.appendChild(panel);
    },

    createFloatingPanel() {
        // Vérifier si la sidebar portfolio existe
        const sidebar = document.querySelector('.portfolio-sidebar, .sidebar-portfolio');

        if (sidebar) {
            const panel = document.createElement('div');
            panel.id = 'pnl-stats-panel';
            panel.innerHTML = this.renderStats();
            sidebar.appendChild(panel);
        } else {
            // Créer dans le header du portfolio si possible
            const portfolioHeader = document.querySelector('.panel-portfolio .panel-header, .portfolio-header');
            if (portfolioHeader) {
                const panel = document.createElement('div');
                panel.id = 'pnl-stats-panel';
                panel.style.marginTop = '16px';
                panel.innerHTML = this.renderStats();
                portfolioHeader.parentNode.insertBefore(panel, portfolioHeader.nextSibling);
            }
        }

        this.injectStyles();
    },

    renderStats() {
        const stats = this.calculateStats();
        const formatPnL = (val) => {
            const sign = val >= 0 ? '+' : '';
            return `${sign}$${Math.abs(val).toFixed(2)}`;
        };
        const formatPct = (val) => {
            const sign = val >= 0 ? '+' : '';
            return `${sign}${val.toFixed(2)}%`;
        };
        const colorClass = (val) => val >= 0 ? 'positive' : 'negative';

        return `
            <div class="pnl-stats-container">
                <div class="pnl-stats-header">
                    <span class="pnl-title">📊 Statistiques PnL</span>
                    <span class="pnl-days">${stats.daysTracked}j trackés</span>
                </div>

                <!-- PnL Total -->
                <div class="pnl-total-row">
                    <div class="pnl-total-label">PnL Total Cumulé</div>
                    <div class="pnl-total-value ${colorClass(stats.total)}">${formatPnL(stats.total)}</div>
                    <div class="pnl-roi ${colorClass(stats.roi)}">${formatPct(stats.roi)} ROI</div>
                </div>

                <!-- Grid PnL par période -->
                <div class="pnl-grid">
                    <div class="pnl-period">
                        <div class="pnl-period-label">Aujourd'hui</div>
                        <div class="pnl-period-value ${colorClass(stats.daily)}">${formatPnL(stats.daily)}</div>
                    </div>
                    <div class="pnl-period">
                        <div class="pnl-period-label">7 jours</div>
                        <div class="pnl-period-value ${colorClass(stats.weekly)}">${formatPnL(stats.weekly)}</div>
                    </div>
                    <div class="pnl-period">
                        <div class="pnl-period-label">30 jours</div>
                        <div class="pnl-period-value ${colorClass(stats.monthly)}">${formatPnL(stats.monthly)}</div>
                    </div>
                    <div class="pnl-period">
                        <div class="pnl-period-label">365 jours</div>
                        <div class="pnl-period-value ${colorClass(stats.yearly)}">${formatPnL(stats.yearly)}</div>
                    </div>
                </div>

                <!-- Moyennes -->
                <div class="pnl-averages">
                    <div class="pnl-avg-header">Moyennes estimées</div>
                    <div class="pnl-avg-grid">
                        <div class="pnl-avg">
                            <span class="pnl-avg-label">/jour</span>
                            <span class="pnl-avg-value ${colorClass(stats.avgDaily)}">${formatPnL(stats.avgDaily)}</span>
                        </div>
                        <div class="pnl-avg">
                            <span class="pnl-avg-label">/sem</span>
                            <span class="pnl-avg-value ${colorClass(stats.avgWeekly)}">${formatPnL(stats.avgWeekly)}</span>
                        </div>
                        <div class="pnl-avg">
                            <span class="pnl-avg-label">/mois</span>
                            <span class="pnl-avg-value ${colorClass(stats.avgMonthly)}">${formatPnL(stats.avgMonthly)}</span>
                        </div>
                        <div class="pnl-avg">
                            <span class="pnl-avg-label">/an</span>
                            <span class="pnl-avg-value ${colorClass(stats.avgYearly)}">${formatPnL(stats.avgYearly)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    updateDisplay() {
        const panel = document.getElementById('pnl-stats-panel');
        if (panel) {
            panel.innerHTML = this.renderStats();
        }
    },

    startTracking() {
        // Enregistrer immédiatement
        this.recordDailyPnL();

        // Mettre à jour toutes les minutes
        setInterval(() => {
            this.recordDailyPnL();
        }, 60000);

        // Observer les changements de SimulatedPortfolio
        if (typeof SimulatedPortfolio !== 'undefined') {
            const originalInvest = SimulatedPortfolio.invest;
            const originalWithdraw = SimulatedPortfolio.withdraw;

            if (originalInvest) {
                SimulatedPortfolio.invest = (...args) => {
                    const result = originalInvest.apply(SimulatedPortfolio, args);
                    setTimeout(() => this.recordDailyPnL(), 100);
                    return result;
                };
            }

            if (originalWithdraw) {
                SimulatedPortfolio.withdraw = (...args) => {
                    const result = originalWithdraw.apply(SimulatedPortfolio, args);
                    setTimeout(() => this.recordDailyPnL(), 100);
                    return result;
                };
            }
        }
    },

    injectStyles() {
        if (document.getElementById('pnl-stats-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'pnl-stats-styles';
        styles.textContent = `
            .pnl-stats-container {
                background: linear-gradient(145deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                padding: 16px;
                margin: 12px 0;
            }

            .pnl-stats-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }

            .pnl-title {
                font-size: 13px;
                font-weight: 600;
                color: #fff;
            }

            .pnl-days {
                font-size: 10px;
                color: #666;
                background: rgba(255,255,255,0.05);
                padding: 3px 8px;
                border-radius: 4px;
            }

            .pnl-total-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding: 12px;
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
            }

            .pnl-total-label {
                color: #888;
                font-size: 11px;
                flex: 1;
            }

            .pnl-total-value {
                font-size: 20px;
                font-weight: 700;
            }

            .pnl-total-value.positive { color: #00ff88; }
            .pnl-total-value.negative { color: #ff4444; }

            .pnl-roi {
                font-size: 12px;
                font-weight: 600;
                padding: 4px 10px;
                border-radius: 6px;
            }

            .pnl-roi.positive {
                background: rgba(0,255,136,0.15);
                color: #00ff88;
            }

            .pnl-roi.negative {
                background: rgba(255,68,68,0.15);
                color: #ff4444;
            }

            .pnl-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                margin-bottom: 16px;
            }

            .pnl-period {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 8px;
                padding: 10px 8px;
                text-align: center;
            }

            .pnl-period-label {
                font-size: 10px;
                color: #666;
                margin-bottom: 4px;
            }

            .pnl-period-value {
                font-size: 13px;
                font-weight: 600;
            }

            .pnl-period-value.positive { color: #00ff88; }
            .pnl-period-value.negative { color: #ff4444; }

            .pnl-averages {
                background: rgba(0,170,255,0.05);
                border: 1px solid rgba(0,170,255,0.1);
                border-radius: 8px;
                padding: 12px;
            }

            .pnl-avg-header {
                font-size: 10px;
                color: #00aaff;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
            }

            .pnl-avg-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }

            .pnl-avg {
                text-align: center;
            }

            .pnl-avg-label {
                display: block;
                font-size: 9px;
                color: #666;
                margin-bottom: 2px;
            }

            .pnl-avg-value {
                font-size: 12px;
                font-weight: 600;
            }

            .pnl-avg-value.positive { color: #00ff88; }
            .pnl-avg-value.negative { color: #ff4444; }

            @media (max-width: 480px) {
                .pnl-grid, .pnl-avg-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PnLStats.injectStyles();
        setTimeout(() => PnLStats.init(), 1500);
    });
} else {
    PnLStats.injectStyles();
    setTimeout(() => PnLStats.init(), 1500);
}

window.PnLStats = PnLStats;

console.log('[PnLStats] Module loaded');
