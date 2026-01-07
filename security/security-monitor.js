/**
 * OBELISK DEX - REAL-TIME SECURITY MONITOR
 * Central security dashboard and threat detection system
 */

const SecurityMonitor = {
    // Configuration
    config: {
        alertRetentionMs: 3600000,      // 1 hour
        healthCheckIntervalMs: 5000,    // 5 seconds
        metricsWindowMs: 300000,        // 5 minutes
        criticalAlertThreshold: 3,      // Trigger lockdown after 3 critical alerts
        enableNotifications: true,
        webhookUrl: null                // Optional webhook for external alerts
    },

    // State
    state: {
        isMonitoring: false,
        securityLevel: 'NORMAL',        // NORMAL, ELEVATED, HIGH, CRITICAL
        alerts: [],
        metrics: {
            window: [],
            totalTransactions: 0,
            blockedTransactions: 0,
            suspiciousActivities: 0,
            attackAttempts: 0
        },
        components: {
            quantumShield: { status: 'unknown', lastCheck: null },
            contractGuards: { status: 'unknown', lastCheck: null },
            circuitBreaker: { status: 'unknown', lastCheck: null },
            oracleSecurity: { status: 'unknown', lastCheck: null }
        },
        threatIntelligence: {
            knownAttackers: new Set(),
            suspiciousPatterns: [],
            recentThreats: []
        }
    },

    /**
     * Initialize Security Monitor
     */
    async init() {
        console.log('[SecurityMonitor] Initializing real-time security monitoring...');

        this.state.isMonitoring = true;

        // Start health checks
        this.healthCheckInterval = setInterval(
            () => this.runHealthCheck(),
            this.config.healthCheckIntervalMs
        );

        // Start metrics collection
        this.metricsInterval = setInterval(
            () => this.collectMetrics(),
            60000 // Every minute
        );

        // Set up event listeners
        this.setupEventListeners();

        // Initial health check
        await this.runHealthCheck();

        console.log('[SecurityMonitor] Ready - Real-time monitoring active');
        return true;
    },

    /**
     * Set up event listeners for security events
     */
    setupEventListeners() {
        if (typeof window === 'undefined') return;

        // Circuit breaker events
        window.addEventListener('obelisk-halt', (e) => {
            this.handleSecurityEvent('TRADING_HALTED', e.detail, 'CRITICAL');
        });

        window.addEventListener('obelisk-alert', (e) => {
            this.handleSecurityEvent('CIRCUIT_BREAKER_ALERT', e.detail, e.detail.severity);
        });

        // Oracle events
        window.addEventListener('obelisk-oracle-alert', (e) => {
            this.handleSecurityEvent('ORACLE_ALERT', e.detail, e.detail.severity);
        });

        console.log('[SecurityMonitor] Event listeners configured');
    },

    // ============================================
    // HEALTH CHECKS
    // ============================================

    /**
     * Run comprehensive health check
     */
    async runHealthCheck() {
        const results = {
            timestamp: Date.now(),
            components: {}
        };

        // Check Quantum Shield
        if (typeof window !== 'undefined' && window.QuantumShield) {
            try {
                const status = window.QuantumShield.getSecurityStatus();
                results.components.quantumShield = {
                    status: status.quantumReady ? 'healthy' : 'degraded',
                    keyAgeHours: status.keyStatus?.keyAgeHours,
                    rotationNeeded: status.keyStatus?.rotationNeeded
                };
            } catch (e) {
                results.components.quantumShield = { status: 'error', error: e.message };
            }
        } else {
            results.components.quantumShield = { status: 'not_loaded' };
        }

        // Check Contract Guards
        if (typeof window !== 'undefined' && window.ContractGuards) {
            results.components.contractGuards = { status: 'healthy' };
        } else {
            results.components.contractGuards = { status: 'not_loaded' };
        }

        // Check Circuit Breaker
        if (typeof window !== 'undefined' && window.CircuitBreaker) {
            try {
                const status = window.CircuitBreaker.getStatus();
                results.components.circuitBreaker = {
                    status: status.isHalted ? 'halted' : 'healthy',
                    warningLevel: status.warningLevel,
                    haltsTriggered: status.statistics?.haltsTriggered
                };
            } catch (e) {
                results.components.circuitBreaker = { status: 'error', error: e.message };
            }
        } else {
            results.components.circuitBreaker = { status: 'not_loaded' };
        }

        // Check Oracle Security
        if (typeof window !== 'undefined' && window.OracleSecurity) {
            try {
                const status = window.OracleSecurity.getStatus();
                results.components.oracleSecurity = {
                    status: status.healthy ? 'healthy' : 'degraded',
                    assetsMonitored: status.assetsMonitored,
                    manipulationAttempts: status.statistics?.manipulationAttempts
                };
            } catch (e) {
                results.components.oracleSecurity = { status: 'error', error: e.message };
            }
        } else {
            results.components.oracleSecurity = { status: 'not_loaded' };
        }

        // Update component states
        this.state.components = results.components;

        // Calculate overall security level
        this.updateSecurityLevel(results);

        return results;
    },

    /**
     * Update overall security level based on health check
     */
    updateSecurityLevel(healthCheck) {
        const components = Object.values(healthCheck.components);
        const errors = components.filter(c => c.status === 'error').length;
        const degraded = components.filter(c => c.status === 'degraded').length;
        const halted = components.filter(c => c.status === 'halted').length;
        const notLoaded = components.filter(c => c.status === 'not_loaded').length;

        // Check recent critical alerts
        const recentCritical = this.state.alerts.filter(
            a => a.severity === 'CRITICAL' && Date.now() - a.timestamp < 300000
        ).length;

        let newLevel = 'NORMAL';

        if (errors > 0 || halted > 0 || recentCritical >= this.config.criticalAlertThreshold) {
            newLevel = 'CRITICAL';
        } else if (degraded > 0 || recentCritical > 0) {
            newLevel = 'HIGH';
        } else if (notLoaded > 1) {
            newLevel = 'ELEVATED';
        }

        if (newLevel !== this.state.securityLevel) {
            this.handleSecurityLevelChange(this.state.securityLevel, newLevel);
            this.state.securityLevel = newLevel;
        }
    },

    /**
     * Handle security level changes
     */
    handleSecurityLevelChange(oldLevel, newLevel) {
        console.log(`[SecurityMonitor] Security level: ${oldLevel} -> ${newLevel}`);

        this.addAlert({
            type: 'SECURITY_LEVEL_CHANGE',
            severity: newLevel === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
            message: `Security level changed from ${oldLevel} to ${newLevel}`,
            oldLevel,
            newLevel
        });

        // Emit event for UI
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('obelisk-security-level', {
                detail: { oldLevel, newLevel }
            }));
        }

        // Trigger webhook if critical
        if (newLevel === 'CRITICAL' && this.config.webhookUrl) {
            this.sendWebhook({
                event: 'SECURITY_CRITICAL',
                message: 'Security level is CRITICAL',
                timestamp: Date.now()
            });
        }
    },

    // ============================================
    // ALERT HANDLING
    // ============================================

    /**
     * Handle incoming security event
     */
    handleSecurityEvent(type, data, severity = 'INFO') {
        console.log(`[SecurityMonitor] Security event: ${type} (${severity})`);

        const alert = {
            id: this.generateAlertId(),
            type,
            severity,
            data,
            timestamp: Date.now(),
            acknowledged: false
        };

        this.addAlert(alert);

        // Update metrics
        if (severity === 'CRITICAL' || severity === 'HIGH') {
            this.state.metrics.suspiciousActivities++;
        }

        // Check for attack patterns
        this.checkAttackPatterns(alert);
    },

    /**
     * Add alert to the system
     */
    addAlert(alert) {
        alert.id = alert.id || this.generateAlertId();
        alert.timestamp = alert.timestamp || Date.now();

        this.state.alerts.unshift(alert);

        // Clean old alerts
        const cutoff = Date.now() - this.config.alertRetentionMs;
        this.state.alerts = this.state.alerts.filter(a => a.timestamp > cutoff);

        // Limit array size
        if (this.state.alerts.length > 500) {
            this.state.alerts = this.state.alerts.slice(0, 500);
        }

        // Browser notification
        if (this.config.enableNotifications && alert.severity === 'CRITICAL') {
            this.showNotification(alert);
        }
    },

    /**
     * Show browser notification for critical alerts
     */
    showNotification(alert) {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('OBELISK Security Alert', {
                    body: alert.message || alert.type,
                    icon: '/favicon.ico',
                    tag: alert.id
                });
            }
        }
    },

    // ============================================
    // THREAT DETECTION
    // ============================================

    /**
     * Check for attack patterns
     */
    checkAttackPatterns(alert) {
        // Get recent alerts
        const recentAlerts = this.state.alerts.filter(
            a => Date.now() - a.timestamp < 60000 // Last minute
        );

        // Pattern: Multiple manipulation attempts
        const manipulationAlerts = recentAlerts.filter(
            a => a.type === 'MANIPULATION_DETECTED' || a.type === 'ORACLE_ALERT'
        );

        if (manipulationAlerts.length >= 3) {
            this.state.metrics.attackAttempts++;
            this.addAlert({
                type: 'ATTACK_PATTERN_DETECTED',
                severity: 'CRITICAL',
                message: 'Multiple oracle manipulation attempts detected - possible coordinated attack',
                pattern: 'ORACLE_MANIPULATION',
                alertCount: manipulationAlerts.length
            });
        }

        // Pattern: Rapid transaction attempts
        const blockedTxAlerts = recentAlerts.filter(
            a => a.type === 'TRANSACTION_BLOCKED'
        );

        if (blockedTxAlerts.length >= 5) {
            this.state.metrics.attackAttempts++;
            this.addAlert({
                type: 'ATTACK_PATTERN_DETECTED',
                severity: 'HIGH',
                message: 'Multiple blocked transactions - possible brute force or DoS attempt',
                pattern: 'TRANSACTION_FLOOD',
                alertCount: blockedTxAlerts.length
            });
        }

        // Pattern: Reentrancy attempts
        const reentrancyAlerts = recentAlerts.filter(
            a => a.data?.risk === 'REENTRANCY_DETECTED'
        );

        if (reentrancyAlerts.length >= 2) {
            this.state.metrics.attackAttempts++;
            this.addAlert({
                type: 'ATTACK_PATTERN_DETECTED',
                severity: 'CRITICAL',
                message: 'Reentrancy attack pattern detected',
                pattern: 'REENTRANCY',
                alertCount: reentrancyAlerts.length
            });
        }
    },

    /**
     * Add address to known attackers list
     */
    flagAttacker(address, reason) {
        this.state.threatIntelligence.knownAttackers.add(address.toLowerCase());

        this.addAlert({
            type: 'ATTACKER_FLAGGED',
            severity: 'HIGH',
            message: `Address flagged as attacker: ${address}`,
            address,
            reason
        });
    },

    /**
     * Check if address is known attacker
     */
    isKnownAttacker(address) {
        return this.state.threatIntelligence.knownAttackers.has(address.toLowerCase());
    },

    // ============================================
    // METRICS
    // ============================================

    /**
     * Collect metrics
     */
    collectMetrics() {
        const now = Date.now();

        // Add current metrics to window
        this.state.metrics.window.push({
            timestamp: now,
            alerts: this.state.alerts.length,
            suspiciousActivities: this.state.metrics.suspiciousActivities,
            attackAttempts: this.state.metrics.attackAttempts
        });

        // Clean old metrics
        const cutoff = now - this.config.metricsWindowMs;
        this.state.metrics.window = this.state.metrics.window.filter(
            m => m.timestamp > cutoff
        );
    },

    /**
     * Get metrics summary
     */
    getMetrics() {
        const window = this.state.metrics.window;

        if (window.length === 0) {
            return {
                alertsPerMinute: 0,
                trend: 'stable',
                attackAttempts: this.state.metrics.attackAttempts
            };
        }

        // Calculate alerts per minute
        const oldestMetric = window[0];
        const newestMetric = window[window.length - 1];
        const timeDiff = (newestMetric.timestamp - oldestMetric.timestamp) / 60000; // minutes
        const alertDiff = newestMetric.alerts - oldestMetric.alerts;

        const alertsPerMinute = timeDiff > 0 ? alertDiff / timeDiff : 0;

        // Determine trend
        let trend = 'stable';
        if (window.length >= 3) {
            const midpoint = Math.floor(window.length / 2);
            const firstHalfAvg = window.slice(0, midpoint).reduce((s, m) => s + m.alerts, 0) / midpoint;
            const secondHalfAvg = window.slice(midpoint).reduce((s, m) => s + m.alerts, 0) / (window.length - midpoint);

            if (secondHalfAvg > firstHalfAvg * 1.5) {
                trend = 'increasing';
            } else if (secondHalfAvg < firstHalfAvg * 0.5) {
                trend = 'decreasing';
            }
        }

        return {
            alertsPerMinute: alertsPerMinute.toFixed(2),
            trend,
            totalAlerts: this.state.alerts.length,
            suspiciousActivities: this.state.metrics.suspiciousActivities,
            attackAttempts: this.state.metrics.attackAttempts,
            blockedTransactions: this.state.metrics.blockedTransactions
        };
    },

    // ============================================
    // UTILITIES
    // ============================================

    generateAlertId() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    async sendWebhook(data) {
        if (!this.config.webhookUrl) return;

        try {
            await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error('[SecurityMonitor] Webhook failed:', e);
        }
    },

    /**
     * Get comprehensive security status
     */
    getStatus() {
        return {
            isMonitoring: this.state.isMonitoring,
            securityLevel: this.state.securityLevel,
            components: this.state.components,
            recentAlerts: this.state.alerts.slice(0, 20),
            alertsByType: this.groupAlertsByType(),
            metrics: this.getMetrics(),
            threatIntelligence: {
                knownAttackers: this.state.threatIntelligence.knownAttackers.size,
                suspiciousPatterns: this.state.threatIntelligence.suspiciousPatterns.length
            }
        };
    },

    /**
     * Group alerts by type for analysis
     */
    groupAlertsByType() {
        const groups = {};
        for (const alert of this.state.alerts) {
            if (!groups[alert.type]) {
                groups[alert.type] = { count: 0, severity: alert.severity };
            }
            groups[alert.type].count++;
        }
        return groups;
    },

    /**
     * Stop monitoring
     */
    stop() {
        this.state.isMonitoring = false;
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
        if (this.metricsInterval) clearInterval(this.metricsInterval);
        console.log('[SecurityMonitor] Monitoring stopped');
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = SecurityMonitor;
}

if (typeof window !== 'undefined') {
    window.SecurityMonitor = SecurityMonitor;
}
