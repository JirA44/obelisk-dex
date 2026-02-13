/**
 * OBELISK DEX - Portfolio Analytics Dashboard
 * Advanced analytics with charts, risk breakdown, and performance metrics
 * Integrates with SimulatedPortfolio, PnLStats, and PortfolioPerformanceChart
 */

const PortfolioAnalytics = {
    // Category colors
    categoryColors: {
        staking: '#00ff88',
        vaults: '#00aaff',
        bonds: '#8a2be2',
        lending: '#ff6b35',
        savings: '#ffd700',
        indexFunds: '#ff1493',
        yieldFarming: '#00ffcc',
        copyTrading: '#ff4444',
        perps: '#ff8800',
        fixedIncome: '#66ccff',
        derivatives: '#cc66ff',
        etfTokens: '#33ff99',
        combos: '#ffaa00'
    },

    // Risk level colors
    riskColors: {
        'very-low': '#00ff88',
        'low': '#00ffcc',
        'medium': '#ffd700',
        'high': '#ff8800',
        'very-high': '#ff4444'
    },

    // Snapshot storage
    snapshots: [],
    maxSnapshots: 720, // 30 days at hourly rate

    // Dashboard state
    isCollapsed: false,
    snapshotInterval: null,

    /**
     * Initialize the analytics module
     */
    init() {
        this.loadSnapshots();
        this.injectStyles();
        this.createDashboard();
        this.startSnapshotScheduler();
        this.startAutoRefresh();
        console.log('[PortfolioAnalytics] Initialized with', this.snapshots.length, 'snapshots');
    },

    /**
     * Load historical snapshots from localStorage
     */
    loadSnapshots() {
        try {
            const saved = localStorage.getItem('obelisk_analytics_snapshots');
            if (saved) {
                this.snapshots = JSON.parse(saved);
                // Cleanup old snapshots
                if (this.snapshots.length > this.maxSnapshots) {
                    this.snapshots = this.snapshots.slice(-this.maxSnapshots);
                    this.saveSnapshots();
                }
            }
        } catch (e) {
            console.warn('[PortfolioAnalytics] Failed to load snapshots:', e);
            this.snapshots = [];
        }
    },

    /**
     * Save snapshots to localStorage
     */
    saveSnapshots() {
        try {
            localStorage.setItem('obelisk_analytics_snapshots', JSON.stringify(this.snapshots));
        } catch (e) {
            console.warn('[PortfolioAnalytics] Failed to save snapshots');
        }
    },

    /**
     * Take a snapshot of current portfolio state
     */
    takeSnapshot() {
        if (typeof SimulatedPortfolio === 'undefined') return;

        const totals = SimulatedPortfolio.getTotalValue();
        const investments = SimulatedPortfolio.portfolio.investments || [];

        const snapshot = {
            timestamp: Date.now(),
            totalValue: totals.total,
            invested: totals.invested,
            earnings: totals.earnings,
            investmentCount: investments.length,
            categoryBreakdown: this.getCategoryBreakdown(investments),
            riskScore: this.calculateRiskScore(investments)
        };

        this.snapshots.push(snapshot);

        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
        }

        this.saveSnapshots();
        console.log('[PortfolioAnalytics] Snapshot taken:', snapshot);
    },

    /**
     * Start automatic snapshot scheduler (every hour)
     */
    startSnapshotScheduler() {
        // Take immediate snapshot
        this.takeSnapshot();

        // Schedule hourly snapshots
        this.snapshotInterval = setInterval(() => {
            this.takeSnapshot();
        }, 3600000); // 1 hour
    },

    /**
     * Start auto-refresh for charts (every 30 seconds)
     */
    startAutoRefresh() {
        setInterval(() => {
            this.refreshAllCharts();
        }, 30000);
    },

    /**
     * Refresh all charts and displays
     */
    refreshAllCharts() {
        const dashboardEl = document.getElementById('analytics-dashboard');
        if (!dashboardEl || dashboardEl.classList.contains('collapsed')) return;

        this.drawAllocationPieChart('allocation-pie-canvas');
        this.drawPnLChart('pnl-chart-canvas', 'daily');
        this.renderCategoryReturns('category-returns-container');
        this.renderRiskBreakdown('risk-breakdown-container');
        this.renderTopPerformers('top-performers-container');
    },

    /**
     * Get category breakdown from investments
     */
    getCategoryBreakdown(investments) {
        const breakdown = {};
        investments.forEach(inv => {
            const category = inv.category || 'other';
            if (!breakdown[category]) {
                breakdown[category] = 0;
            }
            breakdown[category] += inv.amount || 0;
        });
        return breakdown;
    },

    /**
     * Calculate overall risk score
     */
    calculateRiskScore(investments) {
        if (investments.length === 0) return 0;

        const riskValues = {
            'very-low': 1,
            'low': 2,
            'medium': 3,
            'high': 4,
            'very-high': 5
        };

        let totalRisk = 0;
        let totalWeight = 0;

        investments.forEach(inv => {
            const risk = inv.risk || 'medium';
            const amount = inv.amount || 0;
            totalRisk += riskValues[risk] * amount;
            totalWeight += amount;
        });

        return totalWeight > 0 ? totalRisk / totalWeight : 3;
    },

    /**
     * Draw allocation pie chart on canvas
     */
    drawAllocationPieChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (typeof SimulatedPortfolio === 'undefined') {
            this.drawNoDataMessage(ctx, width, height, 'No portfolio data');
            return;
        }

        const investments = SimulatedPortfolio.portfolio.investments || [];
        if (investments.length === 0) {
            this.drawNoDataMessage(ctx, width, height, 'No investments yet');
            return;
        }

        // Calculate category totals
        const categoryTotals = {};
        let total = 0;

        investments.forEach(inv => {
            const category = inv.category || 'other';
            const amount = inv.amount || 0;
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            total += amount;
        });

        if (total === 0) {
            this.drawNoDataMessage(ctx, width, height, 'No allocations');
            return;
        }

        // Draw pie slices
        let currentAngle = -Math.PI / 2;

        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const sliceAngle = (amount / total) * Math.PI * 2;
            const color = this.categoryColors[category] || '#666666';

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Draw border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Draw center circle (donut effect)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0d1117';
        ctx.fill();

        // Draw total in center
        ctx.fillStyle = '#c9d1d9';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$' + this.formatAmount(total), centerX, centerY);
    },

    /**
     * Draw PnL over time chart
     */
    drawPnLChart(canvasId, period = 'daily') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(10, 10, 15, 0.5)';
        ctx.fillRect(0, 0, width, height);

        if (typeof PnLStats === 'undefined' || !PnLStats.history) {
            this.drawNoDataMessage(ctx, width, height, 'No PnL data');
            return;
        }

        let data = this.filterPnLByPeriod(PnLStats.history, period);

        if (data.length < 2) {
            this.drawNoDataMessage(ctx, width, height, 'Insufficient data');
            return;
        }

        // Extract values
        const values = data.map(d => d.dailyPnl || 0);
        let minValue = Math.min(...values, 0);
        let maxValue = Math.max(...values, 0);
        const range = maxValue - minValue || 1;
        minValue -= range * 0.1;
        maxValue += range * 0.1;

        // Draw grid and axes
        this.drawPnLGrid(ctx, padding, chartWidth, chartHeight, minValue, maxValue);

        // Draw PnL line
        this.drawPnLLine(ctx, data, padding, chartWidth, chartHeight, minValue, maxValue);
    },

    /**
     * Filter PnL history by period
     */
    filterPnLByPeriod(history, period) {
        const now = Date.now();
        let cutoffDate;

        switch (period) {
            case 'daily':
                cutoffDate = new Date(now - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                break;
            case 'weekly':
                cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                break;
            case 'monthly':
                cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                break;
            default:
                return history;
        }

        return history.filter(h => h.date >= cutoffDate);
    },

    /**
     * Draw PnL chart grid
     */
    drawPnLGrid(ctx, padding, chartWidth, chartHeight, minValue, maxValue) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (i / 5) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();

            // Y-axis labels
            const value = maxValue - (i / 5) * (maxValue - minValue);
            ctx.fillStyle = '#888';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('$' + this.formatAmount(value), padding.left - 5, y + 3);
        }

        // Zero line (if applicable)
        if (minValue < 0 && maxValue > 0) {
            const zeroY = padding.top + ((maxValue - 0) / (maxValue - minValue)) * chartHeight;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(padding.left, zeroY);
            ctx.lineTo(padding.left + chartWidth, zeroY);
            ctx.stroke();
        }
    },

    /**
     * Draw PnL line chart
     */
    drawPnLLine(ctx, data, padding, chartWidth, chartHeight, minValue, maxValue) {
        const points = data.map((d, i) => {
            const value = d.dailyPnl || 0;
            return {
                x: padding.left + (i / (data.length - 1)) * chartWidth,
                y: padding.top + ((maxValue - value) / (maxValue - minValue)) * chartHeight,
                value: value
            };
        });

        // Determine if mostly positive or negative
        const avgValue = data.reduce((sum, d) => sum + (d.dailyPnl || 0), 0) / data.length;
        const isPositive = avgValue >= 0;
        const lineColor = isPositive ? '#00ff88' : '#ff4444';
        const gradientTop = isPositive ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
        const gradientBottom = isPositive ? 'rgba(0, 255, 136, 0)' : 'rgba(255, 68, 68, 0)';

        // Draw filled area
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, gradientTop);
        gradient.addColorStop(1, gradientBottom);

        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartHeight);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = lineColor;
            ctx.fill();
        });
    },

    /**
     * Get returns by category
     */
    getCategoryReturns() {
        if (typeof SimulatedPortfolio === 'undefined') return [];

        const investments = SimulatedPortfolio.portfolio.investments || [];
        const categoryData = {};

        investments.forEach(inv => {
            const category = inv.category || 'other';
            if (!categoryData[category]) {
                categoryData[category] = {
                    category: category,
                    totalInvested: 0,
                    totalEarnings: 0,
                    count: 0
                };
            }

            categoryData[category].totalInvested += inv.amount || 0;
            categoryData[category].totalEarnings += inv.earned || 0;
            categoryData[category].count += 1;
        });

        return Object.values(categoryData).map(cat => ({
            ...cat,
            roi: cat.totalInvested > 0 ? (cat.totalEarnings / cat.totalInvested * 100) : 0
        })).sort((a, b) => b.totalEarnings - a.totalEarnings);
    },

    /**
     * Render category returns as horizontal bar chart
     */
    renderCategoryReturns(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const returns = this.getCategoryReturns();

        if (returns.length === 0) {
            container.innerHTML = '<div class="analytics-no-data">No category data</div>';
            return;
        }

        const maxEarnings = Math.max(...returns.map(r => r.totalEarnings));

        const html = returns.map(cat => {
            const barWidth = maxEarnings > 0 ? (cat.totalEarnings / maxEarnings * 100) : 0;
            const color = this.categoryColors[cat.category] || '#666';
            const roiClass = cat.roi >= 0 ? 'positive' : 'negative';

            return `
                <div class="category-return-row">
                    <div class="category-label" style="color: ${color}">
                        ${this.formatCategoryName(cat.category)}
                    </div>
                    <div class="category-bar-container">
                        <div class="category-bar" style="width: ${barWidth}%; background: ${color}"></div>
                    </div>
                    <div class="category-value">
                        <span class="category-earnings">$${this.formatAmount(cat.totalEarnings)}</span>
                        <span class="category-roi ${roiClass}">${cat.roi.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    },

    /**
     * Get overall risk score
     */
    getRiskScore() {
        if (typeof SimulatedPortfolio === 'undefined') return { score: 0, level: 'medium' };

        const investments = SimulatedPortfolio.portfolio.investments || [];
        const score = this.calculateRiskScore(investments);

        let level;
        if (score < 1.5) level = 'very-low';
        else if (score < 2.5) level = 'low';
        else if (score < 3.5) level = 'medium';
        else if (score < 4.5) level = 'high';
        else level = 'very-high';

        return { score, level };
    },

    /**
     * Render risk breakdown
     */
    renderRiskBreakdown(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (typeof SimulatedPortfolio === 'undefined') {
            container.innerHTML = '<div class="analytics-no-data">No portfolio data</div>';
            return;
        }

        const investments = SimulatedPortfolio.portfolio.investments || [];

        if (investments.length === 0) {
            container.innerHTML = '<div class="analytics-no-data">No investments yet</div>';
            return;
        }

        // Calculate risk distribution
        const riskDist = {};
        let total = 0;

        investments.forEach(inv => {
            const risk = inv.risk || 'medium';
            const amount = inv.amount || 0;
            riskDist[risk] = (riskDist[risk] || 0) + amount;
            total += amount;
        });

        const { score, level } = this.getRiskScore();

        const html = `
            <div class="risk-score-display">
                <div class="risk-score-label">Overall Risk Score</div>
                <div class="risk-score-value" style="color: ${this.riskColors[level]}">
                    ${score.toFixed(1)} / 5.0
                </div>
                <div class="risk-level-badge" style="background: ${this.riskColors[level]}">
                    ${level.toUpperCase().replace('-', ' ')}
                </div>
            </div>
            <div class="risk-distribution">
                ${Object.entries(riskDist).map(([risk, amount]) => {
                    const pct = total > 0 ? (amount / total * 100) : 0;
                    const color = this.riskColors[risk] || '#666';
                    return `
                        <div class="risk-dist-row">
                            <div class="risk-dist-label" style="color: ${color}">
                                ${risk.replace('-', ' ')}
                            </div>
                            <div class="risk-dist-bar-container">
                                <div class="risk-dist-bar" style="width: ${pct}%; background: ${color}"></div>
                            </div>
                            <div class="risk-dist-pct">${pct.toFixed(1)}%</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Get top performing investments
     */
    getTopPerformers(n = 5) {
        if (typeof SimulatedPortfolio === 'undefined') return [];

        const investments = SimulatedPortfolio.portfolio.investments || [];

        return investments
            .map(inv => ({
                ...inv,
                roi: inv.amount > 0 ? ((inv.earned || 0) / inv.amount * 100) : 0
            }))
            .sort((a, b) => b.roi - a.roi)
            .slice(0, n);
    },

    /**
     * Render top performers list
     */
    renderTopPerformers(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const topPerformers = this.getTopPerformers(5);

        if (topPerformers.length === 0) {
            container.innerHTML = '<div class="analytics-no-data">No investments to rank</div>';
            return;
        }

        const html = topPerformers.map((inv, index) => {
            const color = this.categoryColors[inv.category] || '#666';
            const roiClass = inv.roi >= 0 ? 'positive' : 'negative';
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

            return `
                <div class="top-performer-row">
                    <div class="performer-rank">${medal} #${index + 1}</div>
                    <div class="performer-info">
                        <div class="performer-name">${inv.name || 'Unnamed'}</div>
                        <div class="performer-category" style="color: ${color}">
                            ${this.formatCategoryName(inv.category)}
                        </div>
                    </div>
                    <div class="performer-stats">
                        <div class="performer-earned">+$${this.formatAmount(inv.earned || 0)}</div>
                        <div class="performer-roi ${roiClass}">${inv.roi >= 0 ? '+' : ''}${inv.roi.toFixed(2)}%</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    },

    /**
     * Create the full dashboard HTML
     */
    createDashboardHTML() {
        return `
            <div class="analytics-header">
                <span class="analytics-title">📊 Advanced Analytics</span>
                <button class="analytics-toggle" id="analytics-toggle-btn">
                    ${this.isCollapsed ? '▼' : '▲'}
                </button>
            </div>
            <div class="analytics-content ${this.isCollapsed ? 'collapsed' : ''}">
                <!-- Allocation Pie Chart -->
                <div class="analytics-section">
                    <div class="analytics-section-header">
                        <span class="analytics-section-title">Portfolio Allocation</span>
                    </div>
                    <div class="analytics-chart-container">
                        <canvas id="allocation-pie-canvas" width="300" height="300"></canvas>
                        <div id="allocation-legend" class="allocation-legend"></div>
                    </div>
                </div>

                <!-- PnL Over Time Chart -->
                <div class="analytics-section">
                    <div class="analytics-section-header">
                        <span class="analytics-section-title">PnL Over Time</span>
                        <div class="pnl-period-selector">
                            <button class="pnl-period-btn active" data-period="daily">Daily</button>
                            <button class="pnl-period-btn" data-period="weekly">Weekly</button>
                            <button class="pnl-period-btn" data-period="monthly">Monthly</button>
                        </div>
                    </div>
                    <canvas id="pnl-chart-canvas" width="600" height="250"></canvas>
                </div>

                <!-- Category Returns -->
                <div class="analytics-section">
                    <div class="analytics-section-header">
                        <span class="analytics-section-title">Returns by Category</span>
                    </div>
                    <div id="category-returns-container" class="category-returns"></div>
                </div>

                <!-- Risk Breakdown -->
                <div class="analytics-section">
                    <div class="analytics-section-header">
                        <span class="analytics-section-title">Risk Analysis</span>
                    </div>
                    <div id="risk-breakdown-container" class="risk-breakdown"></div>
                </div>

                <!-- Top Performers -->
                <div class="analytics-section">
                    <div class="analytics-section-header">
                        <span class="analytics-section-title">Top Performers</span>
                    </div>
                    <div id="top-performers-container" class="top-performers"></div>
                </div>
            </div>
        `;
    },

    /**
     * Create and inject the dashboard
     */
    createDashboard() {
        // Check if already exists
        if (document.getElementById('analytics-dashboard')) return;

        // Find insertion point - look for portfolio-related containers
        const targets = [
            document.getElementById('portfolio-analytics-area'),
            document.querySelector('.portfolio-analytics'),
            document.querySelector('.portfolio-section'),
            document.querySelector('.panel-portfolio .panel-content'),
            document.querySelector('.portfolio-sidebar'),
            document.getElementById('portfolio-panel')
        ];

        let container = null;
        for (const target of targets) {
            if (target) {
                container = target;
                break;
            }
        }

        if (!container) {
            console.warn('[PortfolioAnalytics] No suitable container found');
            // Try creating in body as fallback
            container = document.body;
        }

        // Create dashboard element
        const dashboard = document.createElement('div');
        dashboard.id = 'analytics-dashboard';
        dashboard.className = 'analytics-dashboard';
        dashboard.innerHTML = this.createDashboardHTML();

        // Insert into DOM
        if (container === document.body) {
            container.appendChild(dashboard);
        } else {
            container.appendChild(dashboard);
        }

        // Setup event listeners
        this.setupEventListeners();

        // Initial render
        requestAnimationFrame(() => {
            this.refreshAllCharts();
            this.renderAllocationLegend();
        });
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle button
        const toggleBtn = document.getElementById('analytics-toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                this.isCollapsed = !this.isCollapsed;
                const content = document.querySelector('.analytics-content');
                if (content) {
                    content.classList.toggle('collapsed');
                }
                toggleBtn.textContent = this.isCollapsed ? '▼' : '▲';
            };
        }

        // PnL period selector
        document.querySelectorAll('.pnl-period-btn').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.pnl-period-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.drawPnLChart('pnl-chart-canvas', e.target.dataset.period);
            };
        });
    },

    /**
     * Render allocation legend
     */
    renderAllocationLegend() {
        const legendEl = document.getElementById('allocation-legend');
        if (!legendEl || typeof SimulatedPortfolio === 'undefined') return;

        const investments = SimulatedPortfolio.portfolio.investments || [];
        const categoryTotals = {};
        let total = 0;

        investments.forEach(inv => {
            const category = inv.category || 'other';
            const amount = inv.amount || 0;
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            total += amount;
        });

        const html = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
                const pct = total > 0 ? (amount / total * 100) : 0;
                const color = this.categoryColors[category] || '#666';
                return `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${color}"></div>
                        <div class="legend-label">${this.formatCategoryName(category)}</div>
                        <div class="legend-value">${pct.toFixed(1)}%</div>
                    </div>
                `;
            }).join('');

        legendEl.innerHTML = html || '<div class="analytics-no-data">No allocations</div>';
    },

    /**
     * Draw "no data" message on canvas
     */
    drawNoDataMessage(ctx, width, height, message) {
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, width / 2, height / 2);
    },

    /**
     * Format category name for display
     */
    formatCategoryName(category) {
        return category
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    },

    /**
     * Format amount for display
     */
    formatAmount(value) {
        if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(2) + 'M';
        if (Math.abs(value) >= 1000) return (value / 1000).toFixed(2) + 'K';
        return value.toFixed(2);
    },

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('portfolio-analytics-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'portfolio-analytics-styles';
        styles.textContent = `
            .analytics-dashboard {
                background: linear-gradient(145deg, rgba(13, 17, 23, 0.95), rgba(22, 27, 34, 0.9));
                border: 1px solid #30363d;
                border-radius: 12px;
                padding: 20px;
                margin: 16px 0;
            }

            .analytics-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 1px solid #30363d;
            }

            .analytics-title {
                font-size: 16px;
                font-weight: 700;
                color: #c9d1d9;
            }

            .analytics-toggle {
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 6px;
                padding: 6px 12px;
                color: #00ff88;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .analytics-toggle:hover {
                background: rgba(0, 255, 136, 0.2);
            }

            .analytics-content {
                max-height: 3000px;
                overflow: hidden;
                transition: max-height 0.3s ease-in-out;
            }

            .analytics-content.collapsed {
                max-height: 0;
            }

            .analytics-section {
                background: rgba(22, 27, 34, 0.5);
                border: 1px solid #30363d;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
            }

            .analytics-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .analytics-section-title {
                font-size: 13px;
                font-weight: 600;
                color: #00ff88;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .pnl-period-selector {
                display: flex;
                gap: 6px;
            }

            .pnl-period-btn {
                padding: 4px 10px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid transparent;
                border-radius: 4px;
                color: #888;
                font-size: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .pnl-period-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #c9d1d9;
            }

            .pnl-period-btn.active {
                background: rgba(0, 255, 136, 0.15);
                border-color: rgba(0, 255, 136, 0.3);
                color: #00ff88;
            }

            .analytics-chart-container {
                display: flex;
                align-items: center;
                justify-content: space-around;
                gap: 20px;
            }

            #allocation-pie-canvas {
                display: block;
            }

            .allocation-legend {
                flex: 1;
                max-width: 250px;
            }

            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .legend-item:last-child {
                border-bottom: none;
            }

            .legend-color {
                width: 12px;
                height: 12px;
                border-radius: 3px;
                flex-shrink: 0;
            }

            .legend-label {
                flex: 1;
                font-size: 11px;
                color: #c9d1d9;
            }

            .legend-value {
                font-size: 11px;
                font-weight: 600;
                color: #00ff88;
            }

            #pnl-chart-canvas {
                display: block;
                width: 100%;
                max-width: 100%;
                border-radius: 6px;
            }

            .category-returns {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .category-return-row {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .category-label {
                width: 120px;
                font-size: 11px;
                font-weight: 600;
                flex-shrink: 0;
            }

            .category-bar-container {
                flex: 1;
                height: 20px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                overflow: hidden;
            }

            .category-bar {
                height: 100%;
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .category-value {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 120px;
                justify-content: flex-end;
            }

            .category-earnings {
                font-size: 11px;
                color: #c9d1d9;
            }

            .category-roi {
                font-size: 10px;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 3px;
            }

            .category-roi.positive {
                background: rgba(0, 255, 136, 0.15);
                color: #00ff88;
            }

            .category-roi.negative {
                background: rgba(255, 68, 68, 0.15);
                color: #ff4444;
            }

            .risk-breakdown {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .risk-score-display {
                text-align: center;
                padding: 16px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
            }

            .risk-score-label {
                font-size: 11px;
                color: #888;
                margin-bottom: 8px;
            }

            .risk-score-value {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .risk-level-badge {
                display: inline-block;
                padding: 6px 14px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
                color: #000;
            }

            .risk-distribution {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .risk-dist-row {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .risk-dist-label {
                width: 100px;
                font-size: 11px;
                font-weight: 600;
                flex-shrink: 0;
                text-transform: capitalize;
            }

            .risk-dist-bar-container {
                flex: 1;
                height: 16px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                overflow: hidden;
            }

            .risk-dist-bar {
                height: 100%;
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .risk-dist-pct {
                font-size: 11px;
                color: #c9d1d9;
                min-width: 50px;
                text-align: right;
            }

            .top-performers {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .top-performer-row {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                transition: all 0.2s;
            }

            .top-performer-row:hover {
                background: rgba(0, 0, 0, 0.5);
                transform: translateX(4px);
            }

            .performer-rank {
                font-size: 14px;
                font-weight: 700;
                color: #888;
                min-width: 50px;
            }

            .performer-info {
                flex: 1;
            }

            .performer-name {
                font-size: 12px;
                font-weight: 600;
                color: #c9d1d9;
                margin-bottom: 2px;
            }

            .performer-category {
                font-size: 10px;
                font-weight: 500;
            }

            .performer-stats {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 2px;
            }

            .performer-earned {
                font-size: 13px;
                font-weight: 700;
                color: #00ff88;
            }

            .performer-roi {
                font-size: 10px;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 3px;
            }

            .performer-roi.positive {
                background: rgba(0, 255, 136, 0.15);
                color: #00ff88;
            }

            .performer-roi.negative {
                background: rgba(255, 68, 68, 0.15);
                color: #ff4444;
            }

            .analytics-no-data {
                text-align: center;
                padding: 24px;
                color: #666;
                font-size: 12px;
            }

            @media (max-width: 768px) {
                .analytics-chart-container {
                    flex-direction: column;
                }

                .allocation-legend {
                    max-width: 100%;
                }

                .category-return-row {
                    flex-wrap: wrap;
                }

                .category-label {
                    width: 100%;
                }

                .category-bar-container {
                    min-width: 200px;
                }
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-initialize with dependency check
function initPortfolioAnalytics(attempt) {
    attempt = attempt || 0;
    if (typeof SimulatedPortfolio !== 'undefined' && typeof PnLStats !== 'undefined') {
        PortfolioAnalytics.init();
    } else if (attempt < 10) {
        setTimeout(() => initPortfolioAnalytics(attempt + 1), 500);
    } else {
        console.warn('[PortfolioAnalytics] Dependencies not loaded, initializing anyway');
        PortfolioAnalytics.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => initPortfolioAnalytics(0), 500);
    });
} else {
    setTimeout(() => initPortfolioAnalytics(0), 500);
}

// Export to window
window.PortfolioAnalytics = PortfolioAnalytics;

console.log('[PortfolioAnalytics] Module loaded');
