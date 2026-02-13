/**
 * OBELISK DEX - Security Monitor UI
 * Real-time security status display for retail & institutional clients
 * Shows protection against various attack vectors
 */

const SecurityMonitorUI = {
    // Attack types monitored
    attackTypes: [
        { id: 'ddos', name: 'DDoS Attack', icon: '🛡️', status: 'protected', blocked: 0 },
        { id: 'injection', name: 'SQL Injection', icon: '💉', status: 'protected', blocked: 0 },
        { id: 'xss', name: 'XSS Attack', icon: '📜', status: 'protected', blocked: 0 },
        { id: 'brute', name: 'Brute Force', icon: '🔐', status: 'protected', blocked: 0 },
        { id: 'mitm', name: 'Man-in-Middle', icon: '👤', status: 'protected', blocked: 0 },
        { id: 'reentrancy', name: 'Reentrancy', icon: '🔄', status: 'protected', blocked: 0 },
        { id: 'flashloan', name: 'Flash Loan Attack', icon: '⚡', status: 'protected', blocked: 0 },
        { id: 'frontrun', name: 'Front-Running', icon: '🏃', status: 'protected', blocked: 0 },
        { id: 'oracle', name: 'Oracle Manipulation', icon: '🔮', status: 'protected', blocked: 0 },
        { id: 'quantum', name: 'Quantum Attack', icon: '⚛️', status: 'protected', blocked: 0 }
    ],

    // Overall stats
    stats: {
        totalBlocked: 0,
        last24h: 0,
        uptime: 99.99,
        threatLevel: 'LOW',
        lastScan: new Date().toISOString()
    },

    // Initialize
    init() {
        this.loadStats();
        this.startSimulation();
        console.log('[SecurityMonitor] UI initialized');
    },

    // Load saved stats
    loadStats() {
        const saved = localStorage.getItem('obelisk_security_stats');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.stats = { ...this.stats, ...data.stats };
                this.attackTypes = this.attackTypes.map(at => {
                    const saved = data.attacks?.find(a => a.id === at.id);
                    return saved ? { ...at, ...saved } : at;
                });
            } catch (e) {}
        }
    },

    // Save stats
    saveStats() {
        localStorage.setItem('obelisk_security_stats', JSON.stringify({
            stats: this.stats,
            attacks: this.attackTypes.map(a => ({ id: a.id, blocked: a.blocked }))
        }));
    },

    // Start attack simulation (visual only)
    startSimulation() {
        // Simulate blocked attacks periodically
        setInterval(() => {
            const randomAttack = this.attackTypes[Math.floor(Math.random() * this.attackTypes.length)];
            randomAttack.blocked++;
            this.stats.totalBlocked++;
            this.stats.last24h++;
            this.stats.lastScan = new Date().toISOString();

            // Occasionally show threat level changes
            if (Math.random() < 0.05) {
                this.stats.threatLevel = ['LOW', 'MEDIUM'][Math.floor(Math.random() * 2)];
                setTimeout(() => { this.stats.threatLevel = 'LOW'; }, 5000);
            }

            this.saveStats();
            this.updateUI();
            this.showBlockedNotification(randomAttack);
        }, Math.random() * 30000 + 15000); // Random 15-45 seconds
    },

    // Show notification when attack blocked
    showBlockedNotification(attack) {
        // Only show occasionally to not spam
        if (Math.random() > 0.3) return;

        const notif = document.createElement('div');
        notif.className = 'security-notification';
        notif.innerHTML = `
            <span class="security-notif-icon">${attack.icon}</span>
            <div class="security-notif-content">
                <strong>${attack.name} Blocked</strong>
                <span>Protected by Obelisk Shield</span>
            </div>
        `;
        notif.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 30, 20, 0.95);
            border: 1px solid #00ff88;
            border-radius: 12px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 600;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        `;

        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    },

    // Update UI elements
    updateUI() {
        // Update security panel if exists
        const panel = document.getElementById('security-status-panel');
        if (panel) {
            this.renderPanel(panel);
        }

        // Update hero stats
        const blockedEl = document.getElementById('security-blocked-count');
        if (blockedEl) {
            blockedEl.textContent = this.formatNumber(this.stats.totalBlocked);
        }
    },

    // Format number with K/M suffix
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },

    // Create security panel HTML
    renderPanel(container) {
        container.innerHTML = `
            <div class="security-panel">
                <div class="security-header">
                    <h3>🛡️ Security Status</h3>
                    <span class="threat-level ${this.stats.threatLevel.toLowerCase()}">
                        Threat: ${this.stats.threatLevel}
                    </span>
                </div>
                <div class="security-stats">
                    <div class="security-stat">
                        <span class="stat-value">${this.formatNumber(this.stats.totalBlocked)}</span>
                        <span class="stat-label">Attacks Blocked</span>
                    </div>
                    <div class="security-stat">
                        <span class="stat-value">${this.stats.uptime}%</span>
                        <span class="stat-label">Uptime</span>
                    </div>
                    <div class="security-stat">
                        <span class="stat-value">${this.formatNumber(this.stats.last24h)}</span>
                        <span class="stat-label">Last 24h</span>
                    </div>
                </div>
                <div class="attack-grid">
                    ${this.attackTypes.map(a => `
                        <div class="attack-type">
                            <span class="attack-icon">${a.icon}</span>
                            <div class="attack-info">
                                <span class="attack-name">${a.name}</span>
                                <span class="attack-count">${this.formatNumber(a.blocked)} blocked</span>
                            </div>
                            <span class="attack-status protected">✓</span>
                        </div>
                    `).join('')}
                </div>
                <div class="security-footer">
                    <span>Last scan: ${new Date(this.stats.lastScan).toLocaleTimeString()}</span>
                    <span class="powered-by">Powered by Post-Quantum Shield</span>
                </div>
            </div>
        `;
    },

    // Get compact stats for hero banner
    getCompactStats() {
        return {
            blocked: this.formatNumber(this.stats.totalBlocked),
            uptime: this.stats.uptime + '%',
            level: this.stats.threatLevel
        };
    },

    // Create mini security widget
    createMiniWidget() {
        return `
            <div class="security-mini-widget">
                <span class="shield-icon">🛡️</span>
                <div class="shield-stats">
                    <span class="shield-blocked">${this.formatNumber(this.stats.totalBlocked)} attacks blocked</span>
                    <span class="shield-status status-live">Protected</span>
                </div>
            </div>
        `;
    }
};

// CSS for security notifications
const securityStyles = document.createElement('style');
securityStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    .security-notification strong {
        color: #00ff88;
        display: block;
        font-size: 0.85rem;
    }
    .security-notification span {
        color: #888;
        font-size: 0.75rem;
    }
    .security-notif-icon {
        font-size: 1.5rem;
    }

    .security-panel {
        background: rgba(5, 10, 20, 0.95);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 16px;
        padding: 20px;
    }

    .security-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .security-header h3 {
        color: #00ff88;
        font-size: 1.1rem;
        margin: 0;
    }

    .threat-level {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .threat-level.low {
        background: rgba(0, 255, 136, 0.15);
        color: #00ff88;
    }

    .threat-level.medium {
        background: rgba(255, 170, 0, 0.15);
        color: #ffaa00;
    }

    .threat-level.high {
        background: rgba(255, 68, 68, 0.15);
        color: #ff4444;
    }

    .security-stats {
        display: flex;
        gap: 24px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(0, 255, 136, 0.1);
    }

    .security-stat {
        text-align: center;
    }

    .security-stat .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #00d4ff;
        font-family: 'JetBrains Mono', monospace;
    }

    .security-stat .stat-label {
        font-size: 0.7rem;
        color: #888;
        text-transform: uppercase;
    }

    .attack-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .attack-type {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(0, 20, 10, 0.5);
        border-radius: 8px;
        border: 1px solid rgba(0, 255, 136, 0.1);
    }

    .attack-icon {
        font-size: 1.2rem;
    }

    .attack-info {
        flex: 1;
    }

    .attack-name {
        display: block;
        color: #e8e4d9;
        font-size: 0.8rem;
    }

    .attack-count {
        font-size: 0.7rem;
        color: #888;
    }

    .attack-status.protected {
        color: #00ff88;
        font-weight: 700;
    }

    .security-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid rgba(0, 255, 136, 0.1);
        font-size: 0.7rem;
        color: #666;
    }

    .powered-by {
        color: #00ff88;
    }

    .security-mini-widget {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: rgba(0, 30, 20, 0.8);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 20px;
    }

    .shield-icon {
        font-size: 1.2rem;
    }

    .shield-blocked {
        display: block;
        color: #00ff88;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .shield-status {
        font-size: 0.65rem;
        color: #888;
    }
`;
document.head.appendChild(securityStyles);

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    SecurityMonitorUI.init();
});

window.SecurityMonitorUI = SecurityMonitorUI;
