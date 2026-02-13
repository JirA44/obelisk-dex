/**
 * OBELISK DEX - Portfolio Performance Chart
 * Affiche le graphique de performance historique du portfolio
 */

const PortfolioPerformanceChart = {
    canvas: null,
    ctx: null,

    // Historique des valeurs (timestamp, value)
    history: [],
    maxHistoryPoints: 100,

    // Configuration
    config: {
        updateInterval: 5000,
        lineColor: '#00ff88',
        gradientTop: 'rgba(0, 255, 136, 0.3)',
        gradientBottom: 'rgba(0, 255, 136, 0)',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#888'
    },

    init() {
        this.loadHistory();
        this.injectStyles();
        this.createChartContainer();
        this.startTracking();
        console.log('[PortfolioChart] Initialized');
    },

    loadHistory() {
        try {
            const saved = localStorage.getItem('obelisk_portfolio_history');
            if (saved) {
                this.history = JSON.parse(saved);
                if (this.history.length > this.maxHistoryPoints) {
                    this.history = this.history.slice(-this.maxHistoryPoints);
                }
            }
        } catch (e) {
            this.history = [];
        }
    },

    saveHistory() {
        try {
            localStorage.setItem('obelisk_portfolio_history', JSON.stringify(this.history));
        } catch (e) {}
    },

    createChartContainer() {
        // Vérifier si déjà créé
        if (document.getElementById('perf-chart-wrapper')) return;

        // Trouver où insérer le graphique - priorité à la zone dédiée
        const targets = [
            document.getElementById('portfolio-chart-area'),
            document.getElementById('portfolio-chart-container'),
            document.querySelector('.portfolio-chart'),
            document.querySelector('.panel-portfolio-chart .panel-content'),
            document.querySelector('.portfolio-sidebar'),
            document.querySelector('.portfolio-section')
        ];

        let container = null;
        for (const target of targets) {
            if (target) {
                container = target;
                break;
            }
        }

        if (!container) {
            console.warn('[PortfolioChart] No container found');
            return;
        }

        // Créer le wrapper du graphique
        const wrapper = document.createElement('div');
        wrapper.id = 'perf-chart-wrapper';
        wrapper.innerHTML = `
            <div class="perf-chart-box">
                <div class="perf-chart-header">
                    <span class="perf-chart-title">📈 Performance <span style="font-size:10px;color:#f59e0b;font-weight:normal;">(simulée)</span></span>
                    <div class="perf-chart-stats">
                        <span class="perf-total" id="perf-total-display">$0.00</span>
                        <span class="perf-change" id="perf-change-display">+$0.00</span>
                    </div>
                </div>
                <canvas id="portfolio-perf-canvas" width="400" height="120"></canvas>
                <div class="perf-chart-legend">
                    <button class="perf-btn active" data-period="all">Tout</button>
                    <button class="perf-btn" data-period="1h">1H</button>
                    <button class="perf-btn" data-period="24h">24H</button>
                    <button class="perf-btn" data-period="7d">7J</button>
                </div>
            </div>
        `;

        // Insérer dans le container (appendChild si zone dédiée, sinon au début)
        if (container.id === 'portfolio-chart-area') {
            container.appendChild(wrapper);
        } else {
            container.insertBefore(wrapper, container.firstChild);
        }

        // Init canvas
        this.canvas = document.getElementById('portfolio-perf-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        // Event listeners
        wrapper.querySelectorAll('.perf-btn').forEach(btn => {
            btn.onclick = (e) => {
                wrapper.querySelectorAll('.perf-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.draw(e.target.dataset.period);
            };
        });

        this.draw();
    },

    resizeCanvas() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = Math.min(parent.offsetWidth - 24, 500);
            this.canvas.height = 120;
        }
        this.draw();
    },

    startTracking() {
        this.recordValue();
        setInterval(() => {
            this.recordValue();
            this.draw();
        }, this.config.updateInterval);
    },

    recordValue() {
        if (typeof SimulatedPortfolio === 'undefined') return;

        const totals = SimulatedPortfolio.getTotalValue();
        const timestamp = Date.now();

        this.history.push({
            t: timestamp,
            v: totals.total,
            e: totals.earnings
        });

        if (this.history.length > this.maxHistoryPoints) {
            this.history.shift();
        }

        this.saveHistory();
        this.updateHeader(totals);
    },

    updateHeader(totals) {
        const totalEl = document.getElementById('perf-total-display');
        const changeEl = document.getElementById('perf-change-display');

        if (totalEl) {
            totalEl.textContent = '$' + this.formatAmount(totals.total);
        }

        if (changeEl && this.history.length >= 2) {
            const first = this.history[0].v;
            const current = totals.total;
            const change = current - first;
            const pct = first > 0 ? ((change / first) * 100).toFixed(1) : 0;

            if (change >= 0) {
                changeEl.textContent = `+$${this.formatAmount(change)} (+${pct}%)`;
                changeEl.className = 'perf-change positive';
            } else {
                changeEl.textContent = `-$${this.formatAmount(Math.abs(change))} (${pct}%)`;
                changeEl.className = 'perf-change negative';
            }
        }
    },

    draw(period = 'all') {
        if (!this.ctx || !this.canvas) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = { top: 10, right: 10, bottom: 20, left: 45 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.5)';
        this.ctx.fillRect(0, 0, width, height);

        let data = this.getFilteredData(period);

        if (data.length < 2) {
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('En attente de données...', width / 2, height / 2);
            return;
        }

        const values = data.map(d => d.v);
        let minValue = Math.min(...values);
        let maxValue = Math.max(...values);
        const range = maxValue - minValue || 1;
        minValue -= range * 0.1;
        maxValue += range * 0.1;

        this.drawGrid(padding, chartWidth, chartHeight, minValue, maxValue);
        this.drawLine(data, padding, chartWidth, chartHeight, minValue, maxValue);
    },

    getFilteredData(period) {
        const now = Date.now();
        let cutoff = 0;

        switch (period) {
            case '1h': cutoff = now - 60 * 60 * 1000; break;
            case '24h': cutoff = now - 24 * 60 * 60 * 1000; break;
            case '7d': cutoff = now - 7 * 24 * 60 * 60 * 1000; break;
            default: return this.history;
        }

        return this.history.filter(d => d.t >= cutoff);
    },

    drawGrid(padding, chartWidth, chartHeight, minValue, maxValue) {
        const ctx = this.ctx;
        ctx.strokeStyle = this.config.gridColor;
        ctx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (i / 4) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();

            const value = maxValue - (i / 4) * (maxValue - minValue);
            ctx.fillStyle = this.config.textColor;
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('$' + this.formatAmount(value), padding.left - 5, y + 3);
        }
    },

    drawLine(data, padding, chartWidth, chartHeight, minValue, maxValue) {
        const ctx = this.ctx;

        const points = data.map((d, i) => ({
            x: padding.left + (i / (data.length - 1)) * chartWidth,
            y: padding.top + ((maxValue - d.v) / (maxValue - minValue)) * chartHeight
        }));

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, this.config.gradientTop);
        gradient.addColorStop(1, this.config.gradientBottom);

        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartHeight);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = this.config.lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // End point
        const last = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.config.lineColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    },

    formatAmount(value) {
        if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
        return value.toFixed(2);
    },

    injectStyles() {
        if (document.getElementById('perf-chart-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'perf-chart-styles';
        styles.textContent = `
            #perf-chart-wrapper {
                margin-bottom: 16px;
            }

            .perf-chart-box {
                background: linear-gradient(145deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
                border: 1px solid rgba(0, 255, 136, 0.2);
                border-radius: 12px;
                padding: 16px;
            }

            .perf-chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .perf-chart-title {
                font-size: 14px;
                font-weight: 600;
                color: #fff;
            }

            .perf-chart-stats {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .perf-total {
                font-size: 18px;
                font-weight: 700;
                color: #fff;
            }

            .perf-change {
                font-size: 12px;
                font-weight: 600;
                padding: 4px 10px;
                border-radius: 6px;
            }

            .perf-change.positive {
                background: rgba(0, 255, 136, 0.15);
                color: #00ff88;
            }

            .perf-change.negative {
                background: rgba(255, 68, 68, 0.15);
                color: #ff4444;
            }

            #portfolio-perf-canvas {
                display: block;
                width: 100%;
                border-radius: 8px;
            }

            .perf-chart-legend {
                display: flex;
                justify-content: center;
                gap: 8px;
                margin-top: 12px;
            }

            .perf-btn {
                padding: 6px 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid transparent;
                border-radius: 6px;
                color: #888;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .perf-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .perf-btn.active {
                background: rgba(0, 255, 136, 0.15);
                border-color: rgba(0, 255, 136, 0.3);
                color: #00ff88;
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init avec délai
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => PortfolioPerformanceChart.init(), 1500);
});

if (document.readyState !== 'loading') {
    setTimeout(() => PortfolioPerformanceChart.init(), 1500);
}

window.PortfolioPerformanceChart = PortfolioPerformanceChart;
