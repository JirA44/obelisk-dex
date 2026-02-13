/**
 * OBELISK Academy Traders Module
 * Virtual scroll UI for 100k simulated traders
 */

class AcademyTraders {
    constructor() {
        this.apiBase = window.OBELISK_API || 'http://localhost:3001';
        this.traders = [];
        this.pagination = { page: 1, limit: 50, total: 0, totalPages: 0 };
        this.filters = {
            style: null,
            minWinRate: null,
            sortBy: 'total_pnl',
            sortDir: 'DESC'
        };
        this.leaderboard = [];
        this.styleStats = {};
        this.isLoading = false;

        // Virtual scroll settings
        this.rowHeight = 72;
        this.visibleRows = 15;
        this.scrollContainer = null;
    }

    /**
     * Fetch traders with current filters
     */
    async fetchTraders(page = 1) {
        this.isLoading = true;
        this.emit('loading', true);

        try {
            const params = new URLSearchParams({
                page,
                limit: this.pagination.limit,
                sortBy: this.filters.sortBy,
                sortDir: this.filters.sortDir
            });

            if (this.filters.style) params.append('style', this.filters.style);
            if (this.filters.minWinRate) params.append('minWinRate', this.filters.minWinRate);

            const response = await fetch(`${this.apiBase}/api/academy/traders?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch traders');
            }

            const data = await response.json();
            this.traders = data.traders || [];
            this.pagination = data.pagination || this.pagination;

            this.emit('traders-loaded', { traders: this.traders, pagination: this.pagination });
            return this.traders;
        } catch (error) {
            console.error('[Academy] Fetch error:', error);
            throw error;
        } finally {
            this.isLoading = false;
            this.emit('loading', false);
        }
    }

    /**
     * Fetch leaderboard (top traders)
     */
    async fetchLeaderboard(limit = 100) {
        try {
            const response = await fetch(`${this.apiBase}/api/academy/leaderboard?limit=${limit}`);

            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }

            const data = await response.json();
            this.leaderboard = data.leaderboard || [];
            return this.leaderboard;
        } catch (error) {
            console.error('[Academy] Leaderboard error:', error);
            throw error;
        }
    }

    /**
     * Fetch single trader details
     */
    async fetchTrader(traderId) {
        try {
            const response = await fetch(`${this.apiBase}/api/academy/traders/${traderId}`);

            if (!response.ok) {
                throw new Error('Trader not found');
            }

            const data = await response.json();
            return data.trader;
        } catch (error) {
            console.error('[Academy] Trader fetch error:', error);
            throw error;
        }
    }

    /**
     * Fetch stats by style
     */
    async fetchStyleStats() {
        try {
            const response = await fetch(`${this.apiBase}/api/academy/stats/styles`);

            if (!response.ok) {
                throw new Error('Failed to fetch style stats');
            }

            const data = await response.json();
            this.styleStats = data.stats || {};
            return this.styleStats;
        } catch (error) {
            console.error('[Academy] Style stats error:', error);
            throw error;
        }
    }

    /**
     * Fetch generation progress
     */
    async fetchGenerationProgress() {
        try {
            const response = await fetch(`${this.apiBase}/api/academy/generation/progress`);
            const data = await response.json();
            return data;
        } catch (error) {
            return { generated: 0, total: 100000, percent: 0 };
        }
    }

    /**
     * Trigger trader generation
     */
    async triggerGeneration() {
        try {
            const response = await fetch(`${this.apiBase}/api/academy/generation/start`, {
                method: 'POST'
            });
            return await response.json();
        } catch (error) {
            console.error('[Academy] Generation error:', error);
            throw error;
        }
    }

    /**
     * Set filter and refresh
     */
    async setFilter(key, value) {
        this.filters[key] = value;
        await this.fetchTraders(1);
    }

    /**
     * Go to page
     */
    async goToPage(page) {
        if (page < 1 || page > this.pagination.totalPages) return;
        await this.fetchTraders(page);
    }

    /**
     * Render main academy view
     */
    renderAcademyView(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="academy-traders">
                <div class="academy-header">
                    <h2>Trading Academy</h2>
                    <p class="subtitle">Learn from 100,000 simulated traders</p>
                </div>

                <div class="academy-tabs">
                    <button class="tab-btn active" data-tab="traders">All Traders</button>
                    <button class="tab-btn" data-tab="leaderboard">Leaderboard</button>
                    <button class="tab-btn" data-tab="styles">Trading Styles</button>
                </div>

                <div class="academy-content">
                    <div class="tab-content active" id="tradersTab">
                        ${this.renderTradersTab()}
                    </div>
                    <div class="tab-content" id="leaderboardTab">
                        ${this.renderLeaderboardTab()}
                    </div>
                    <div class="tab-content" id="stylesTab">
                        ${this.renderStylesTab()}
                    </div>
                </div>
            </div>
        `;

        this.attachListeners(container);
        this.initializeData();
    }

    /**
     * Render traders tab
     */
    renderTradersTab() {
        return `
            <div class="traders-filters">
                <div class="filter-group">
                    <label>Trading Style</label>
                    <select id="styleFilter">
                        <option value="">All Styles</option>
                        <option value="Scalper">Scalper</option>
                        <option value="Swing">Swing</option>
                        <option value="TrendFollower">Trend Follower</option>
                        <option value="Contrarian">Contrarian</option>
                        <option value="NewsTrader">News Trader</option>
                        <option value="Momentum">Momentum</option>
                        <option value="MeanReversion">Mean Reversion</option>
                        <option value="Breakout">Breakout</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Min Win Rate</label>
                    <select id="winRateFilter">
                        <option value="">Any</option>
                        <option value="40">40%+</option>
                        <option value="50">50%+</option>
                        <option value="60">60%+</option>
                        <option value="70">70%+</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Sort By</label>
                    <select id="sortByFilter">
                        <option value="total_pnl">Total P&L</option>
                        <option value="win_rate">Win Rate</option>
                        <option value="total_trades">Total Trades</option>
                    </select>
                </div>
            </div>

            <div class="traders-list-container">
                <div class="traders-list-header">
                    <div class="col-rank">#</div>
                    <div class="col-name">Trader</div>
                    <div class="col-style">Style</div>
                    <div class="col-winrate">Win Rate</div>
                    <div class="col-trades">Trades</div>
                    <div class="col-pnl">P&L</div>
                </div>
                <div class="traders-list" id="tradersList">
                    <div class="loading">Loading traders...</div>
                </div>
            </div>

            <div class="pagination" id="tradersPagination"></div>
        `;
    }

    /**
     * Render leaderboard tab
     */
    renderLeaderboardTab() {
        return `
            <div class="leaderboard-container">
                <div class="leaderboard-header">
                    <h3>Top 100 Traders</h3>
                    <p>Best performing simulated traders by total P&L</p>
                </div>
                <div class="leaderboard-list" id="leaderboardList">
                    <div class="loading">Loading leaderboard...</div>
                </div>
            </div>
        `;
    }

    /**
     * Render styles tab
     */
    renderStylesTab() {
        return `
            <div class="styles-container">
                <div class="styles-header">
                    <h3>Trading Styles Analysis</h3>
                    <p>Performance breakdown by trading methodology</p>
                </div>
                <div class="styles-grid" id="stylesGrid">
                    <div class="loading">Loading style statistics...</div>
                </div>
            </div>
        `;
    }

    /**
     * Render traders list
     */
    renderTradersList(traders) {
        if (!traders || traders.length === 0) {
            return '<div class="empty">No traders found</div>';
        }

        const startRank = (this.pagination.page - 1) * this.pagination.limit + 1;

        return traders.map((trader, index) => `
            <div class="trader-row" data-trader-id="${trader.id}">
                <div class="col-rank">${startRank + index}</div>
                <div class="col-name">
                    <div class="trader-avatar">${trader.avatar || '?'}</div>
                    <div class="trader-info">
                        <span class="trader-name">${trader.name}</span>
                    </div>
                </div>
                <div class="col-style">
                    <span class="style-badge ${trader.style.toLowerCase()}">${trader.style}</span>
                </div>
                <div class="col-winrate ${trader.win_rate >= 50 ? 'positive' : 'negative'}">
                    ${trader.win_rate.toFixed(1)}%
                </div>
                <div class="col-trades">${trader.total_trades}</div>
                <div class="col-pnl ${trader.total_pnl >= 0 ? 'positive' : 'negative'}">
                    ${trader.total_pnl >= 0 ? '+' : ''}$${trader.total_pnl.toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    /**
     * Render leaderboard list
     */
    renderLeaderboardList(traders) {
        if (!traders || traders.length === 0) {
            return '<div class="empty">No leaderboard data</div>';
        }

        return traders.map((trader, index) => {
            const medal = index < 3 ? ['gold', 'silver', 'bronze'][index] : '';

            return `
                <div class="leaderboard-row ${medal}" data-trader-id="${trader.id}">
                    <div class="lb-rank">
                        ${medal ? `<span class="medal ${medal}">${index + 1}</span>` : index + 1}
                    </div>
                    <div class="lb-trader">
                        <div class="trader-avatar">${trader.avatar || '?'}</div>
                        <div class="trader-details">
                            <span class="trader-name">${trader.name}</span>
                            <span class="trader-style">${trader.style}</span>
                        </div>
                    </div>
                    <div class="lb-stats">
                        <span class="stat-item">
                            <span class="label">Win Rate</span>
                            <span class="value ${trader.win_rate >= 50 ? 'positive' : ''}">${trader.win_rate.toFixed(1)}%</span>
                        </span>
                        <span class="stat-item">
                            <span class="label">Trades</span>
                            <span class="value">${trader.total_trades}</span>
                        </span>
                        <span class="stat-item">
                            <span class="label">P&L</span>
                            <span class="value ${trader.total_pnl >= 0 ? 'positive' : 'negative'}">
                                ${trader.total_pnl >= 0 ? '+' : ''}$${trader.total_pnl.toFixed(2)}
                            </span>
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render style stats grid
     */
    renderStylesGrid(stats) {
        if (!stats || Object.keys(stats).length === 0) {
            return '<div class="empty">No style data available</div>';
        }

        return Object.entries(stats).map(([style, data]) => `
            <div class="style-card">
                <div class="style-header">
                    <span class="style-badge ${style.toLowerCase()}">${style}</span>
                </div>
                <div class="style-description">${data.description}</div>
                <div class="style-stats">
                    <div class="stat">
                        <span class="stat-label">Traders</span>
                        <span class="stat-value">${data.count.toLocaleString()}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Avg Win Rate</span>
                        <span class="stat-value ${data.avgWinRate >= 50 ? 'positive' : ''}">${data.avgWinRate.toFixed(1)}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Trades</span>
                        <span class="stat-value">${data.totalTrades.toLocaleString()}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total P&L</span>
                        <span class="stat-value ${data.totalPnl >= 0 ? 'positive' : 'negative'}">
                            ${data.totalPnl >= 0 ? '+' : ''}$${data.totalPnl.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render pagination
     */
    renderPagination() {
        const { page, totalPages } = this.pagination;
        if (totalPages <= 1) return '';

        let pages = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            if (page <= 3) {
                pages = [1, 2, 3, 4, 5, '...', totalPages];
            } else if (page >= totalPages - 2) {
                pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
            }
        }

        return `
            <div class="pagination-controls">
                <button class="page-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>
                    &laquo; Prev
                </button>
                ${pages.map(p => p === '...'
                    ? '<span class="page-ellipsis">...</span>'
                    : `<button class="page-btn ${p === page ? 'active' : ''}" data-page="${p}">${p}</button>`
                ).join('')}
                <button class="page-btn" data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}>
                    Next &raquo;
                </button>
            </div>
            <div class="pagination-info">
                Page ${page} of ${totalPages.toLocaleString()} (${this.pagination.total.toLocaleString()} traders)
            </div>
        `;
    }

    /**
     * Show trader detail modal
     */
    async showTraderDetail(traderId) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay trader-modal-overlay';
        modal.innerHTML = `
            <div class="modal trader-modal">
                <div class="modal-header">
                    <h3>Trader Profile</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="loading">Loading trader details...</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        try {
            const trader = await this.fetchTrader(traderId);
            modal.querySelector('.modal-body').innerHTML = this.renderTraderDetail(trader);
        } catch (error) {
            modal.querySelector('.modal-body').innerHTML = `<div class="error">${error.message}</div>`;
        }
    }

    /**
     * Render trader detail
     */
    renderTraderDetail(trader) {
        return `
            <div class="trader-profile">
                <div class="profile-header">
                    <div class="trader-avatar large">${trader.avatar || '?'}</div>
                    <div class="profile-info">
                        <h4>${trader.name}</h4>
                        <span class="style-badge ${trader.style.toLowerCase()}">${trader.style}</span>
                    </div>
                </div>

                <div class="profile-bio">
                    <p>"${trader.bio}"</p>
                </div>

                <div class="profile-stats-grid">
                    <div class="profile-stat">
                        <span class="stat-value ${trader.win_rate >= 50 ? 'positive' : ''}">${trader.win_rate.toFixed(1)}%</span>
                        <span class="stat-label">Win Rate</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-value">${trader.total_trades}</span>
                        <span class="stat-label">Total Trades</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-value positive">${trader.wins}</span>
                        <span class="stat-label">Wins</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-value negative">${trader.losses}</span>
                        <span class="stat-label">Losses</span>
                    </div>
                    <div class="profile-stat highlight">
                        <span class="stat-value ${trader.total_pnl >= 0 ? 'positive' : 'negative'}">
                            ${trader.total_pnl >= 0 ? '+' : ''}$${trader.total_pnl.toFixed(2)}
                        </span>
                        <span class="stat-label">Total P&L</span>
                    </div>
                </div>

                <div class="profile-params">
                    <h5>Trading Parameters</h5>
                    <div class="param-row">
                        <span class="param-label">Risk per Trade</span>
                        <span class="param-value">${trader.risk_per_trade}%</span>
                    </div>
                    <div class="param-row">
                        <span class="param-label">Target R:R</span>
                        <span class="param-value">1:${trader.target_rr}</span>
                    </div>
                </div>

                <div class="profile-actions">
                    <button class="btn btn-primary" onclick="alert('Copy trading coming soon!')">
                        Copy Trader
                    </button>
                    <button class="btn btn-outline" onclick="alert('Following coming soon!')">
                        Follow
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachListeners(container) {
        // Tab switching
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const tabId = btn.dataset.tab + 'Tab';
                container.querySelector(`#${tabId}`).classList.add('active');

                // Load data for tab
                if (btn.dataset.tab === 'leaderboard' && this.leaderboard.length === 0) {
                    this.loadLeaderboard();
                } else if (btn.dataset.tab === 'styles' && Object.keys(this.styleStats).length === 0) {
                    this.loadStyleStats();
                }
            });
        });

        // Filters
        container.querySelector('#styleFilter')?.addEventListener('change', (e) => {
            this.setFilter('style', e.target.value || null);
        });

        container.querySelector('#winRateFilter')?.addEventListener('change', (e) => {
            this.setFilter('minWinRate', e.target.value || null);
        });

        container.querySelector('#sortByFilter')?.addEventListener('change', (e) => {
            this.setFilter('sortBy', e.target.value);
        });

        // Pagination clicks
        container.addEventListener('click', (e) => {
            if (e.target.matches('.page-btn') && !e.target.disabled) {
                this.goToPage(parseInt(e.target.dataset.page));
            }
        });

        // Trader row clicks
        container.addEventListener('click', (e) => {
            const row = e.target.closest('.trader-row, .leaderboard-row');
            if (row) {
                this.showTraderDetail(row.dataset.traderId);
            }
        });
    }

    /**
     * Initialize data
     */
    async initializeData() {
        try {
            await this.fetchTraders(1);
            this.updateTradersUI();
        } catch (error) {
            console.error('[Academy] Init error:', error);
        }
    }

    /**
     * Update traders UI
     */
    updateTradersUI() {
        const listEl = document.getElementById('tradersList');
        const paginationEl = document.getElementById('tradersPagination');

        if (listEl) {
            listEl.innerHTML = this.renderTradersList(this.traders);
        }

        if (paginationEl) {
            paginationEl.innerHTML = this.renderPagination();
        }
    }

    /**
     * Load leaderboard
     */
    async loadLeaderboard() {
        const listEl = document.getElementById('leaderboardList');
        if (!listEl) return;

        listEl.innerHTML = '<div class="loading">Loading leaderboard...</div>';

        try {
            await this.fetchLeaderboard();
            listEl.innerHTML = this.renderLeaderboardList(this.leaderboard);
        } catch (error) {
            listEl.innerHTML = `<div class="error">${error.message}</div>`;
        }
    }

    /**
     * Load style stats
     */
    async loadStyleStats() {
        const gridEl = document.getElementById('stylesGrid');
        if (!gridEl) return;

        gridEl.innerHTML = '<div class="loading">Loading style statistics...</div>';

        try {
            await this.fetchStyleStats();
            gridEl.innerHTML = this.renderStylesGrid(this.styleStats);
        } catch (error) {
            gridEl.innerHTML = `<div class="error">${error.message}</div>`;
        }
    }

    /**
     * Event emitter
     */
    emit(event, data) {
        window.dispatchEvent(new CustomEvent(`academy:${event}`, { detail: data }));
    }
}

// Export singleton
window.academyTraders = new AcademyTraders();
