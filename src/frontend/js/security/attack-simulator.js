/**
 * OBELISK DEX - Attack Simulator
 * Visual demonstration of security protection
 * Shows simulated attack attempts being blocked in real-time
 * FOR DEMONSTRATION PURPOSES ONLY
 */

const AttackSimulator = {
    // Simulated attack sources (fake IPs/locations)
    sources: [
        { country: '🇨🇳', name: 'China', region: 'Beijing' },
        { country: '🇷🇺', name: 'Russia', region: 'Moscow' },
        { country: '🇰🇵', name: 'North Korea', region: 'Pyongyang' },
        { country: '🇮🇷', name: 'Iran', region: 'Tehran' },
        { country: '🇳🇬', name: 'Nigeria', region: 'Lagos' },
        { country: '🇧🇷', name: 'Brazil', region: 'São Paulo' },
        { country: '🇮🇳', name: 'India', region: 'Mumbai' },
        { country: '🇺🇦', name: 'Ukraine', region: 'Kyiv' },
        { country: '🇷🇴', name: 'Romania', region: 'Bucharest' },
        { country: '🇻🇳', name: 'Vietnam', region: 'Ho Chi Minh' }
    ],

    // Attack types with details
    attacks: [
        {
            type: 'DDoS',
            icon: '🌊',
            severity: 'high',
            methods: ['SYN Flood', 'UDP Flood', 'HTTP Flood', 'Amplification Attack'],
            description: 'Distributed denial of service attempt'
        },
        {
            type: 'SQL Injection',
            icon: '💉',
            severity: 'critical',
            methods: ['Union-based', 'Blind SQL', 'Time-based', 'Out-of-band'],
            description: 'Database exploitation attempt'
        },
        {
            type: 'XSS',
            icon: '📜',
            severity: 'medium',
            methods: ['Stored XSS', 'Reflected XSS', 'DOM-based XSS'],
            description: 'Cross-site scripting attempt'
        },
        {
            type: 'Brute Force',
            icon: '🔐',
            severity: 'medium',
            methods: ['Password spray', 'Credential stuffing', 'Dictionary attack'],
            description: 'Authentication bypass attempt'
        },
        {
            type: 'Reentrancy',
            icon: '🔄',
            severity: 'critical',
            methods: ['Single-function', 'Cross-function', 'Cross-contract'],
            description: 'Smart contract exploit attempt'
        },
        {
            type: 'Flash Loan',
            icon: '⚡',
            severity: 'critical',
            methods: ['Price manipulation', 'Collateral drain', 'Governance attack'],
            description: 'DeFi flash loan attack'
        },
        {
            type: 'Front-Running',
            icon: '🏃',
            severity: 'high',
            methods: ['Sandwich attack', 'Displacement', 'Insertion'],
            description: 'MEV exploitation attempt'
        },
        {
            type: 'Oracle Manipulation',
            icon: '🔮',
            severity: 'critical',
            methods: ['Spot price attack', 'TWAP manipulation', 'Multi-oracle attack'],
            description: 'Price oracle manipulation'
        },
        {
            type: 'Phishing',
            icon: '🎣',
            severity: 'medium',
            methods: ['Fake dApp', 'Malicious approval', 'Signature exploit'],
            description: 'Social engineering attempt'
        },
        {
            type: 'API Abuse',
            icon: '🔌',
            severity: 'low',
            methods: ['Rate limit bypass', 'Endpoint enumeration', 'Parameter tampering'],
            description: 'API exploitation attempt'
        }
    ],

    // Stats
    stats: {
        totalBlocked: 147832,
        last24h: 3421,
        lastHour: 287,
        avgResponseTime: 0.3, // ms
        activeThreats: 0
    },

    // Running state
    running: false,
    speed: 'normal', // slow, normal, fast, demo

    // Initialize
    init() {
        this.loadStats();
        console.log('[AttackSimulator] Initialized');
    },

    // Load persisted stats
    loadStats() {
        const saved = localStorage.getItem('obelisk_attack_stats');
        if (saved) {
            try {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            } catch (e) {}
        }
    },

    // Save stats
    saveStats() {
        localStorage.setItem('obelisk_attack_stats', JSON.stringify(this.stats));
    },

    // Start simulation
    start(speed = 'normal') {
        if (this.running) return;
        this.running = true;
        this.speed = speed;

        const intervals = {
            slow: 10000,
            normal: 5000,
            fast: 2000,
            demo: 800
        };

        this.interval = setInterval(() => {
            this.simulateAttack();
        }, intervals[speed] || 5000);

        console.log(`[AttackSimulator] Started (${speed} mode)`);
    },

    // Stop simulation
    stop() {
        this.running = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        console.log('[AttackSimulator] Stopped');
    },

    // Generate fake IP
    generateIP() {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    },

    // Simulate single attack
    simulateAttack() {
        const source = this.sources[Math.floor(Math.random() * this.sources.length)];
        const attack = this.attacks[Math.floor(Math.random() * this.attacks.length)];
        const method = attack.methods[Math.floor(Math.random() * attack.methods.length)];

        const event = {
            timestamp: new Date().toISOString(),
            source: {
                ip: this.generateIP(),
                country: source.country,
                countryName: source.name,
                region: source.region
            },
            attack: {
                type: attack.type,
                icon: attack.icon,
                method: method,
                severity: attack.severity,
                description: attack.description
            },
            result: 'BLOCKED',
            responseTime: (Math.random() * 0.5 + 0.1).toFixed(2) + 'ms'
        };

        // Update stats
        this.stats.totalBlocked++;
        this.stats.last24h++;
        this.stats.lastHour++;
        this.stats.avgResponseTime = ((this.stats.avgResponseTime * 99 + parseFloat(event.responseTime)) / 100).toFixed(2);
        this.saveStats();

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('attack-blocked', { detail: event }));

        // Show notification
        this.showAttackNotification(event);

        return event;
    },

    // Show attack blocked notification
    showAttackNotification(event) {
        // Remove old notifications if too many
        const existing = document.querySelectorAll('.attack-notification');
        if (existing.length >= 3) {
            existing[0].remove();
        }

        const notif = document.createElement('div');
        notif.className = 'attack-notification';
        notif.innerHTML = `
            <div class="attack-notif-header">
                <span class="attack-notif-icon">${event.attack.icon}</span>
                <span class="attack-notif-type">${event.attack.type}</span>
                <span class="attack-notif-status">BLOCKED</span>
            </div>
            <div class="attack-notif-details">
                <span class="attack-method">${event.attack.method}</span>
                <span class="attack-source">${event.source.country} ${event.source.ip}</span>
            </div>
            <div class="attack-notif-footer">
                <span class="attack-time">${event.responseTime}</span>
                <span class="attack-severity ${event.attack.severity}">${event.attack.severity.toUpperCase()}</span>
            </div>
        `;

        document.body.appendChild(notif);

        // Animate in
        setTimeout(() => notif.classList.add('visible'), 10);

        // Remove after delay
        setTimeout(() => {
            notif.classList.remove('visible');
            setTimeout(() => notif.remove(), 300);
        }, 4000);
    },

    // Create live attack feed panel
    createAttackFeed(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="attack-feed">
                <div class="attack-feed-header">
                    <h3>🛡️ Live Attack Feed</h3>
                    <div class="feed-controls">
                        <button onclick="AttackSimulator.start('demo')" class="feed-btn">▶ Start Demo</button>
                        <button onclick="AttackSimulator.stop()" class="feed-btn">⏹ Stop</button>
                    </div>
                </div>
                <div class="attack-feed-stats">
                    <div class="feed-stat">
                        <span class="feed-stat-value" id="attack-total">${this.formatNumber(this.stats.totalBlocked)}</span>
                        <span class="feed-stat-label">Total Blocked</span>
                    </div>
                    <div class="feed-stat">
                        <span class="feed-stat-value" id="attack-24h">${this.formatNumber(this.stats.last24h)}</span>
                        <span class="feed-stat-label">Last 24h</span>
                    </div>
                    <div class="feed-stat">
                        <span class="feed-stat-value" id="attack-response">${this.stats.avgResponseTime}ms</span>
                        <span class="feed-stat-label">Avg Response</span>
                    </div>
                </div>
                <div class="attack-feed-list" id="attack-feed-list">
                    <div class="feed-empty">Click "Start Demo" to simulate attacks</div>
                </div>
            </div>
        `;

        // Listen for attack events
        window.addEventListener('attack-blocked', (e) => {
            this.addToFeed(e.detail);
        });
    },

    // Add attack to feed
    addToFeed(event) {
        const list = document.getElementById('attack-feed-list');
        if (!list) return;

        // Remove empty message
        const empty = list.querySelector('.feed-empty');
        if (empty) empty.remove();

        // Create feed item
        const item = document.createElement('div');
        item.className = 'feed-item new';
        item.innerHTML = `
            <span class="feed-icon">${event.attack.icon}</span>
            <div class="feed-info">
                <span class="feed-type">${event.attack.type}</span>
                <span class="feed-method">${event.attack.method}</span>
            </div>
            <div class="feed-source">
                <span class="feed-country">${event.source.country}</span>
                <span class="feed-ip">${event.source.ip}</span>
            </div>
            <span class="feed-result blocked">✓</span>
        `;

        // Insert at top
        list.insertBefore(item, list.firstChild);

        // Remove new class after animation
        setTimeout(() => item.classList.remove('new'), 500);

        // Keep only last 20 items
        while (list.children.length > 20) {
            list.lastChild.remove();
        }

        // Update stats display
        const totalEl = document.getElementById('attack-total');
        const hourEl = document.getElementById('attack-24h');
        if (totalEl) totalEl.textContent = this.formatNumber(this.stats.totalBlocked);
        if (hourEl) hourEl.textContent = this.formatNumber(this.stats.last24h);
    },

    // Format number
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },

    // Get stats for display
    getStats() {
        return this.stats;
    }
};

// CSS for attack notifications and feed
const attackStyles = document.createElement('style');
attackStyles.textContent = `
    .attack-notification {
        position: fixed;
        right: 20px;
        background: rgba(5, 15, 10, 0.98);
        border: 1px solid #00ff88;
        border-left: 4px solid #00ff88;
        border-radius: 8px;
        padding: 12px 16px;
        width: 320px;
        z-index: 10001;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 0 30px rgba(0, 255, 136, 0.2);
    }

    .attack-notification:nth-of-type(1) { bottom: 20px; }
    .attack-notification:nth-of-type(2) { bottom: 130px; }
    .attack-notification:nth-of-type(3) { bottom: 240px; }

    .attack-notification.visible {
        transform: translateX(0);
    }

    .attack-notif-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }

    .attack-notif-icon {
        font-size: 1.3rem;
    }

    .attack-notif-type {
        color: #fff;
        font-weight: 600;
        font-size: 0.9rem;
        flex: 1;
    }

    .attack-notif-status {
        background: #00ff88;
        color: #000;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.65rem;
        font-weight: 700;
    }

    .attack-notif-details {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #888;
        margin-bottom: 6px;
    }

    .attack-notif-footer {
        display: flex;
        justify-content: space-between;
        font-size: 0.7rem;
    }

    .attack-time {
        color: #00d4ff;
    }

    .attack-severity {
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: 600;
    }

    .attack-severity.low { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
    .attack-severity.medium { background: rgba(255, 170, 0, 0.2); color: #ffaa00; }
    .attack-severity.high { background: rgba(255, 100, 100, 0.2); color: #ff6464; }
    .attack-severity.critical { background: rgba(255, 0, 0, 0.2); color: #ff0000; }

    /* Attack Feed Panel */
    .attack-feed {
        background: rgba(5, 10, 15, 0.95);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 16px;
        overflow: hidden;
    }

    .attack-feed-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: rgba(0, 255, 136, 0.1);
        border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }

    .attack-feed-header h3 {
        color: #00ff88;
        margin: 0;
        font-size: 1rem;
    }

    .feed-controls {
        display: flex;
        gap: 8px;
    }

    .feed-btn {
        padding: 6px 12px;
        background: rgba(0, 255, 136, 0.15);
        border: 1px solid rgba(0, 255, 136, 0.4);
        border-radius: 6px;
        color: #00ff88;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .feed-btn:hover {
        background: rgba(0, 255, 136, 0.25);
    }

    .attack-feed-stats {
        display: flex;
        justify-content: space-around;
        padding: 16px;
        border-bottom: 1px solid rgba(0, 255, 136, 0.1);
    }

    .feed-stat {
        text-align: center;
    }

    .feed-stat-value {
        display: block;
        font-size: 1.4rem;
        font-weight: 700;
        color: #00d4ff;
        font-family: 'JetBrains Mono', monospace;
    }

    .feed-stat-label {
        font-size: 0.65rem;
        color: #888;
        text-transform: uppercase;
    }

    .attack-feed-list {
        max-height: 300px;
        overflow-y: auto;
        padding: 8px;
    }

    .feed-empty {
        text-align: center;
        color: #666;
        padding: 40px 20px;
        font-size: 0.85rem;
    }

    .feed-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: rgba(0, 20, 10, 0.5);
        border-radius: 8px;
        margin-bottom: 6px;
        border: 1px solid transparent;
        transition: all 0.3s;
    }

    .feed-item.new {
        background: rgba(0, 255, 136, 0.15);
        border-color: rgba(0, 255, 136, 0.3);
    }

    .feed-icon {
        font-size: 1.2rem;
    }

    .feed-info {
        flex: 1;
    }

    .feed-type {
        display: block;
        color: #fff;
        font-weight: 600;
        font-size: 0.8rem;
    }

    .feed-method {
        font-size: 0.7rem;
        color: #888;
    }

    .feed-source {
        text-align: right;
    }

    .feed-country {
        display: block;
        font-size: 1rem;
    }

    .feed-ip {
        font-size: 0.65rem;
        color: #666;
        font-family: 'JetBrains Mono', monospace;
    }

    .feed-result.blocked {
        color: #00ff88;
        font-weight: 700;
        font-size: 1.2rem;
    }
`;
document.head.appendChild(attackStyles);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AttackSimulator.init();
});

window.AttackSimulator = AttackSimulator;
