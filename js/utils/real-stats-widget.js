/**
 * OBELISK Real Stats Widget
 * Displays real-time visitor, user, and volume statistics
 */

const RealStatsWidget = {
    API_URL: 'https://retrieve-velvet-percent-classic.trycloudflare.com',
    stats: null,
    updateInterval: null,

    async init() {
        console.log('[RealStats] Initializing...');
        await this.fetchStats();
        this.render();
        // Update every 30 seconds
        this.updateInterval = setInterval(() => this.fetchStats(), 30000);
        // Track this visit
        this.trackVisit();
    },

    async fetchStats() {
        try {
            const response = await fetch(`${this.API_URL}/api/stats`);
            if (response.ok) {
                this.stats = await response.json();
                this.updateDisplay();
            }
        } catch (e) {
            console.error('[RealStats] Error fetching stats:', e);
        }
    },

    async trackVisit() {
        // The API tracks visits automatically, but we can also track wallet connections
        const wallet = localStorage.getItem('obelisk_wallet');
        if (wallet) {
            try {
                await fetch(`${this.API_URL}/api/stats/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wallet, type: 'retail' })
                });
            } catch (e) {}
        }
    },

    async registerUser(walletAddress, type = 'retail') {
        try {
            const response = await fetch(`${this.API_URL}/api/stats/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: walletAddress, type })
            });
            const result = await response.json();
            if (result.isNew) {
                console.log('[RealStats] New user registered!');
                this.showNotification('Welcome to Obelisk!', 'success');
            }
            // Refresh stats
            await this.fetchStats();
            return result;
        } catch (e) {
            console.error('[RealStats] Error registering user:', e);
            return { success: false };
        }
    },

    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },

    render() {
        // Create stats bar if it doesn't exist
        let statsBar = document.getElementById('real-stats-bar');
        if (!statsBar) {
            statsBar = document.createElement('div');
            statsBar.id = 'real-stats-bar';
            statsBar.innerHTML = `
                <style>
                    #real-stats-bar {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,1) 100%);
                        border-top: 1px solid rgba(0,255,136,0.2);
                        padding: 8px 20px;
                        display: flex;
                        justify-content: center;
                        gap: 40px;
                        font-family: 'Inter', sans-serif;
                        font-size: 12px;
                        z-index: 9999;
                        backdrop-filter: blur(10px);
                    }
                    .stat-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: #888;
                    }
                    .stat-item .label {
                        color: #666;
                        text-transform: uppercase;
                        font-size: 10px;
                        letter-spacing: 0.5px;
                    }
                    .stat-item .value {
                        color: #00ff88;
                        font-weight: 600;
                        font-family: 'JetBrains Mono', monospace;
                    }
                    .stat-item .value.users {
                        color: #00aaff;
                    }
                    .stat-item .value.volume {
                        color: #ffd700;
                    }
                    .stat-item .live-dot {
                        width: 6px;
                        height: 6px;
                        background: #00ff88;
                        border-radius: 50%;
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                    .stat-item.real-badge {
                        background: rgba(0,255,136,0.1);
                        padding: 4px 10px;
                        border-radius: 12px;
                        border: 1px solid rgba(0,255,136,0.3);
                    }
                    .stat-item.real-badge .label {
                        color: #00ff88;
                    }
                </style>
                <div class="stat-item real-badge">
                    <span class="live-dot"></span>
                    <span class="label">LIVE DATA</span>
                </div>
                <div class="stat-item">
                    <span class="label">Visitors</span>
                    <span class="value" id="stat-visitors">-</span>
                </div>
                <div class="stat-item">
                    <span class="label">Today</span>
                    <span class="value" id="stat-visitors-today">-</span>
                </div>
                <div class="stat-item">
                    <span class="label">Users</span>
                    <span class="value users" id="stat-users">-</span>
                </div>
                <div class="stat-item">
                    <span class="label">Volume</span>
                    <span class="value volume" id="stat-volume">$-</span>
                </div>
            `;
            document.body.appendChild(statsBar);
            // Add padding to body so content isn't hidden
            document.body.style.paddingBottom = '50px';
        }
    },

    updateDisplay() {
        if (!this.stats) return;

        const visitorsEl = document.getElementById('stat-visitors');
        const visitorsTodayEl = document.getElementById('stat-visitors-today');
        const usersEl = document.getElementById('stat-users');
        const volumeEl = document.getElementById('stat-volume');

        if (visitorsEl) visitorsEl.textContent = this.formatNumber(this.stats.visitors?.total || 0);
        if (visitorsTodayEl) visitorsTodayEl.textContent = this.formatNumber(this.stats.visitors?.today || 0);
        if (usersEl) usersEl.textContent = this.formatNumber(this.stats.users?.total || 0);
        if (volumeEl) volumeEl.textContent = '$' + this.formatNumber(this.stats.volume?.total || 0);
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(0,255,136,0.9)' : 'rgba(0,170,255,0.9)'};
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    },

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        const statsBar = document.getElementById('real-stats-bar');
        if (statsBar) statsBar.remove();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RealStatsWidget.init());
} else {
    RealStatsWidget.init();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.RealStatsWidget = RealStatsWidget;
}
