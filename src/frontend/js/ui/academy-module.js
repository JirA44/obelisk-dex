/**
 * OBELISK Trading Academy Module
 * Simulated traders for education + copy trading
 */

const AcademyModule = {
    apiUrl: 'http://localhost:3001/api/academy',
    traders: [],
    leaderboard: [],
    feed: [],
    following: [],
    copyTradeEnabled: false,
    copyTradeConfig: {
        maxSize: 10, // Max $10 per trade
        riskPercent: 1, // 1% of portfolio
        autoExecute: false // Manual confirmation by default
    },
    currentQuiz: null,
    notificationQueue: [],
    pollInterval: null,

    /**
     * Initialize the Academy module
     */
    async init() {
        console.log('[ACADEMY] Initializing...');

        // Load saved preferences
        this.loadPreferences();

        // Initial data fetch
        await this.loadTraders();
        await this.loadLeaderboard();
        await this.loadFeed();

        // Setup event listeners
        this.setupEventListeners();

        // Start polling for live feed
        this.startPolling();

        // Render initial UI
        this.render();

        console.log('[ACADEMY] Initialized successfully');
    },

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        try {
            const prefs = localStorage.getItem('academy_preferences');
            if (prefs) {
                const parsed = JSON.parse(prefs);
                this.following = parsed.following || [];
                this.copyTradeEnabled = parsed.copyTradeEnabled || false;
                this.copyTradeConfig = { ...this.copyTradeConfig, ...parsed.copyTradeConfig };
            }
        } catch (e) {
            console.warn('[ACADEMY] Could not load preferences:', e);
        }
    },

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem('academy_preferences', JSON.stringify({
                following: this.following,
                copyTradeEnabled: this.copyTradeEnabled,
                copyTradeConfig: this.copyTradeConfig
            }));
        } catch (e) {
            console.warn('[ACADEMY] Could not save preferences:', e);
        }
    },

    /**
     * Load traders from API
     */
    async loadTraders() {
        try {
            const res = await fetch(`${this.apiUrl}/traders`);
            const data = await res.json();
            if (data.success) {
                this.traders = data.traders;
            }
        } catch (e) {
            console.error('[ACADEMY] Failed to load traders:', e);
        }
    },

    /**
     * Load leaderboard
     */
    async loadLeaderboard() {
        try {
            const res = await fetch(`${this.apiUrl}/leaderboard`);
            const data = await res.json();
            if (data.success) {
                this.leaderboard = data.leaderboard;
            }
        } catch (e) {
            console.error('[ACADEMY] Failed to load leaderboard:', e);
        }
    },

    /**
     * Load live feed
     */
    async loadFeed() {
        try {
            const res = await fetch(`${this.apiUrl}/feed?limit=30`);
            const data = await res.json();
            if (data.success) {
                const oldFeed = this.feed;
                this.feed = data.feed;

                // Check for new trades
                if (oldFeed.length > 0) {
                    const newTrades = this.feed.filter(f =>
                        !oldFeed.find(o => o.id === f.id)
                    );

                    // Show notifications for new trades from followed traders
                    newTrades.forEach(trade => {
                        if (this.following.includes(trade.traderId)) {
                            this.showNotification(trade);
                        }
                    });
                }
            }
        } catch (e) {
            console.error('[ACADEMY] Failed to load feed:', e);
        }
    },

    /**
     * Load quiz question
     */
    async loadQuiz() {
        try {
            const res = await fetch(`${this.apiUrl}/quiz`);
            const data = await res.json();
            if (data.success) {
                this.currentQuiz = data.quiz;
                this.renderQuiz();
            }
        } catch (e) {
            console.error('[ACADEMY] Failed to load quiz:', e);
        }
    },

    /**
     * Follow/unfollow a trader
     */
    async toggleFollow(traderId) {
        const isFollowing = this.following.includes(traderId);

        try {
            if (isFollowing) {
                const res = await fetch(`${this.apiUrl}/follow/${traderId}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    this.following = this.following.filter(id => id !== traderId);
                }
            } else {
                const res = await fetch(`${this.apiUrl}/follow/${traderId}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    this.following.push(traderId);
                }
            }

            this.savePreferences();
            this.renderTraders();
        } catch (e) {
            console.error('[ACADEMY] Follow toggle failed:', e);
        }
    },

    /**
     * Toggle copy trade for a trader
     */
    toggleCopyTrade(traderId) {
        const btn = document.querySelector(`.btn-copy-trade[data-trader="${traderId}"]`);
        if (btn) {
            btn.classList.toggle('active');
        }

        // In production, this would save to backend and trigger auto-execution
        console.log(`[ACADEMY] Copy trade ${btn?.classList.contains('active') ? 'enabled' : 'disabled'} for ${traderId}`);
    },

    /**
     * Show notification for a trade
     */
    showNotification(trade) {
        const container = document.getElementById('academy-notifications');
        if (!container) return;

        const trader = this.traders.find(t => t.id === trade.traderId);
        if (!trader) return;

        const notifId = `notif-${Date.now()}`;
        const isBuy = trade.direction === 'LONG';

        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.id = notifId;
        notif.innerHTML = `
            <div class="notification-header">
                <div class="notification-trader">
                    <div class="notification-avatar">${trader.avatar}</div>
                    <span class="notification-name">${trader.name}</span>
                </div>
                <button class="notification-close" onclick="AcademyModule.closeNotification('${notifId}')">&times;</button>
            </div>
            <div class="notification-body">
                <span class="${isBuy ? 'buy' : 'sell'}">${isBuy ? 'LONG' : 'SHORT'}</span>
                <span class="symbol">${trade.symbol}</span>
                @ $${trade.entryPrice?.toFixed(2) || '?'}
            </div>
            <div class="notification-reason">"${trade.explanation || 'Trade executed'}"</div>
            <div class="notification-actions">
                <button class="btn-notification copy" onclick="AcademyModule.copyTrade('${trade.id}')">Copy Trade</button>
                <button class="btn-notification view" onclick="AcademyModule.viewTrader('${trade.traderId}')">View Profile</button>
            </div>
        `;

        container.insertBefore(notif, container.firstChild);

        // Auto-close after 15 seconds
        setTimeout(() => this.closeNotification(notifId), 15000);

        // Play sound if enabled
        this.playNotificationSound();
    },

    /**
     * Close notification
     */
    closeNotification(notifId) {
        const notif = document.getElementById(notifId);
        if (notif) {
            notif.classList.add('closing');
            setTimeout(() => notif.remove(), 300);
        }
    },

    /**
     * Play notification sound
     */
    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR0ML5vM4NKMQwwvqunc3as7C0O07+TXnSsJX8Lk4NKfJgVrz+Dd0qQqA3XX4dvSpy8EfN3i2tKuOQF+4OLZ0rQ/AHzi4tjSuEQAeeTi19K7Rw==');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        } catch (e) {}
    },

    /**
     * Copy a specific trade
     */
    copyTrade(tradeId) {
        const trade = this.feed.find(t => t.id === tradeId);
        if (!trade) return;

        console.log('[ACADEMY] Copy trade requested:', trade);

        // In production: send to trading router
        // fetch('/api/trade/order', { method: 'POST', body: JSON.stringify({...}) })

        alert(`Trade copie! ${trade.direction} ${trade.symbol}\n\nNote: En mode demo, les trades ne sont pas executes reellement.`);
    },

    /**
     * View trader profile
     */
    viewTrader(traderId) {
        // Scroll to trader card
        const card = document.querySelector(`.trader-card[data-trader="${traderId}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = 'highlight 1s ease';
            }, 10);
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.academy-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // Copy trade toggle
        const copyToggle = document.getElementById('copy-trade-toggle');
        if (copyToggle) {
            copyToggle.addEventListener('change', (e) => {
                this.copyTradeEnabled = e.target.checked;
                this.savePreferences();
            });
        }

        // Config inputs
        document.querySelectorAll('.config-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.dataset.config;
                this.copyTradeConfig[key] = parseFloat(e.target.value) || e.target.value;
                this.savePreferences();
            });
        });
    },

    /**
     * Switch between sections
     */
    switchSection(section) {
        document.querySelectorAll('.academy-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.academy-tab[data-section="${section}"]`)?.classList.add('active');

        document.querySelectorAll('.academy-section').forEach(s => s.style.display = 'none');
        document.getElementById(`academy-${section}`)?.style.display = 'block';

        if (section === 'quiz') {
            this.loadQuiz();
        }
    },

    /**
     * Start polling for updates
     */
    startPolling() {
        this.pollInterval = setInterval(() => {
            this.loadFeed();
            this.loadLeaderboard();
        }, 30000); // Every 30 seconds
    },

    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    },

    /**
     * Render all UI
     */
    render() {
        this.renderTraders();
        this.renderLeaderboard();
        this.renderFeed();
    },

    /**
     * Render traders grid
     */
    renderTraders() {
        const container = document.getElementById('traders-grid');
        if (!container) return;

        container.innerHTML = this.traders.map(trader => `
            <div class="trader-card ${trader.hasOpenPosition ? 'trading' : ''}" data-trader="${trader.id}">
                <div class="trader-avatar">${trader.avatar}</div>
                <div class="trader-name">${trader.name}</div>
                <div class="trader-style">${trader.style}</div>
                <div class="trader-description">${trader.description}</div>

                <div class="trader-stats">
                    <div class="trader-stat">
                        <div class="trader-stat-value">${(trader.winRate * 100).toFixed(0)}%</div>
                        <div class="trader-stat-label">Win Rate</div>
                    </div>
                    <div class="trader-stat">
                        <div class="trader-stat-value">${trader.targetRR}:1</div>
                        <div class="trader-stat-label">R:R</div>
                    </div>
                    <div class="trader-stat">
                        <div class="trader-stat-value ${trader.stats?.totalPnl >= 0 ? 'positive' : 'negative'}">
                            ${trader.stats?.totalPnl >= 0 ? '+' : ''}$${trader.stats?.totalPnl?.toFixed(2) || '0.00'}
                        </div>
                        <div class="trader-stat-label">PnL</div>
                    </div>
                </div>

                <div class="trader-indicators">
                    ${trader.indicators?.map(i => `<span class="trader-indicator">${i}</span>`).join('')}
                </div>

                <div class="trader-actions">
                    <button class="btn-follow ${this.following.includes(trader.id) ? 'following' : ''}"
                            onclick="AcademyModule.toggleFollow('${trader.id}')">
                        ${this.following.includes(trader.id) ? 'Following' : 'Follow'}
                    </button>
                    <button class="btn-copy-trade" data-trader="${trader.id}"
                            onclick="AcademyModule.toggleCopyTrade('${trader.id}')">
                        Copy
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Render leaderboard
     */
    renderLeaderboard() {
        const container = document.getElementById('leaderboard-table');
        if (!container) return;

        container.innerHTML = `
            <div class="leaderboard-row header">
                <div>Rank</div>
                <div>Trader</div>
                <div>PnL</div>
                <div>WR</div>
                <div>Trades</div>
                <div>Streak</div>
            </div>
            ${this.leaderboard.map((trader, i) => `
                <div class="leaderboard-row">
                    <div class="leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">
                        ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>
                    <div class="leaderboard-trader">
                        <div class="leaderboard-avatar">${trader.name.charAt(0)}</div>
                        <div>
                            <div class="leaderboard-name">${trader.name}</div>
                            <div class="leaderboard-style">${trader.style}</div>
                        </div>
                    </div>
                    <div class="leaderboard-pnl ${trader.totalPnl >= 0 ? 'positive' : 'negative'}">
                        ${trader.totalPnl >= 0 ? '+' : ''}$${trader.totalPnl?.toFixed(2) || '0.00'}
                    </div>
                    <div class="leaderboard-wr">${trader.winRate}%</div>
                    <div class="leaderboard-trades">${trader.totalTrades}</div>
                    <div class="leaderboard-streak">
                        ${trader.streak > 0 ? `<span class="streak-fire">🔥${trader.streak}</span>` :
                          trader.streak < 0 ? `<span class="streak-ice">❄️${Math.abs(trader.streak)}</span>` : '-'}
                    </div>
                </div>
            `).join('')}
        `;
    },

    /**
     * Render live feed
     */
    renderFeed() {
        const container = document.getElementById('live-feed-list');
        if (!container) return;

        container.innerHTML = this.feed.map(trade => {
            const isBuy = trade.direction === 'LONG';
            const isClosed = trade.status === 'closed';

            return `
                <div class="feed-item ${isBuy ? 'buy' : 'sell'}">
                    <div class="feed-avatar">${trade.traderName?.charAt(0) || '?'}</div>
                    <div class="feed-content">
                        <div class="feed-trader">${trade.traderName || 'Unknown'}</div>
                        <div class="feed-action">
                            <span class="${isBuy ? 'buy' : 'sell'}">${isBuy ? 'LONG' : 'SHORT'}</span>
                            <span class="symbol">${trade.symbol}</span>
                            @ $${trade.entryPrice?.toFixed(2) || '?'}
                            ${isClosed ? `→ $${trade.exitPrice?.toFixed(2) || '?'}` : ''}
                        </div>
                        ${trade.explanation ? `<div class="feed-explanation">"${trade.explanation}"</div>` : ''}
                    </div>
                    ${isClosed ? `
                        <div class="feed-pnl ${trade.pnlPercent >= 0 ? 'positive' : 'negative'}">
                            ${trade.pnlPercent >= 0 ? '+' : ''}${trade.pnlPercent?.toFixed(2) || '0'}%
                        </div>
                    ` : ''}
                    <div class="feed-time">${this.formatTime(trade.closedAt || trade.openedAt)}</div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render quiz
     */
    renderQuiz() {
        const container = document.getElementById('quiz-content');
        if (!container || !this.currentQuiz) return;

        container.innerHTML = `
            <div class="quiz-question">${this.currentQuiz.question}</div>
            <div class="quiz-options">
                ${this.currentQuiz.options.map(opt => `
                    <button class="quiz-option" data-answer="${opt.id}"
                            onclick="AcademyModule.answerQuiz('${opt.id}')">
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
            <div id="quiz-result" style="display:none"></div>
            <div class="quiz-actions">
                <button class="btn-next-quiz" onclick="AcademyModule.loadQuiz()" style="display:none" id="btn-next-quiz">
                    Next Question
                </button>
            </div>
        `;
    },

    /**
     * Answer quiz
     */
    answerQuiz(answer) {
        if (!this.currentQuiz) return;

        const correct = answer === this.currentQuiz.correctAnswer;

        // Highlight options
        document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.disabled = true;
            if (opt.dataset.answer === this.currentQuiz.correctAnswer) {
                opt.classList.add('correct');
            } else if (opt.dataset.answer === answer && !correct) {
                opt.classList.add('wrong');
            }
        });

        // Show result
        const resultDiv = document.getElementById('quiz-result');
        resultDiv.style.display = 'block';
        resultDiv.className = `quiz-result ${correct ? 'correct' : 'wrong'}`;
        resultDiv.innerHTML = `
            <strong>${correct ? 'Correct!' : 'Incorrect!'}</strong>
            <div class="quiz-explanation">${this.currentQuiz.explanation}</div>
        `;

        // Show next button
        document.getElementById('btn-next-quiz').style.display = 'inline-block';
    },

    /**
     * Format timestamp
     */
    formatTime(timestamp) {
        if (!timestamp) return '';
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);

        if (mins < 1) return 'now';
        if (mins < 60) return `${mins}m`;
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('tab-academy')) {
            AcademyModule.init();
        }
    });
} else {
    if (document.getElementById('tab-academy')) {
        AcademyModule.init();
    }
}

// Expose globally
window.AcademyModule = AcademyModule;
