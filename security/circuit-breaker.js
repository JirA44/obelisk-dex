/**
 * OBELISK DEX - CIRCUIT BREAKER & RATE LIMITING
 * Emergency protection system with automatic trading halts
 */

const CircuitBreaker = {
    // Configuration
    config: {
        // Price movement thresholds (percentage)
        priceDropThreshold: 0.15,     // 15% drop triggers warning
        priceDropCritical: 0.30,      // 30% drop triggers halt
        priceSpikeThreshold: 0.25,    // 25% spike triggers warning

        // Volume thresholds
        volumeSpikeMultiplier: 10,    // 10x normal volume triggers alert

        // Rate limits
        maxTradesPerMinute: 10,
        maxTradesPerHour: 100,
        maxValuePerHour: 100000,      // $100k USD

        // Cooldowns
        haltDurationMs: 300000,       // 5 minutes halt
        warningCooldownMs: 60000,     // 1 minute between warnings

        // Auto-recovery
        autoRecoveryEnabled: true,
        recoveryCheckIntervalMs: 30000
    },

    // State
    state: {
        isHalted: false,
        haltReason: null,
        haltTimestamp: null,
        warningLevel: 0,              // 0=normal, 1=warning, 2=critical
        trades: [],                    // Recent trades for rate limiting
        priceHistory: new Map(),       // Asset -> price history
        alerts: [],
        statistics: {
            haltsTriggered: 0,
            warningsIssued: 0,
            tradesBlocked: 0
        }
    },

    /**
     * Initialize Circuit Breaker
     */
    init() {
        console.log('[CircuitBreaker] Initializing emergency protection system...');

        // Start price monitoring
        this.startPriceMonitoring();

        // Start recovery check
        if (this.config.autoRecoveryEnabled) {
            setInterval(() => this.checkAutoRecovery(), this.config.recoveryCheckIntervalMs);
        }

        // Clean old trades periodically
        setInterval(() => this.cleanOldTrades(), 60000);

        console.log('[CircuitBreaker] Ready - Emergency protection active');
        return true;
    },

    // ============================================
    // TRADING CONTROLS
    // ============================================

    /**
     * Check if trading is allowed
     */
    canTrade(tradeParams = {}) {
        const { asset, value, type } = tradeParams;

        // Check halt status
        if (this.state.isHalted) {
            return {
                allowed: false,
                reason: `Trading halted: ${this.state.haltReason}`,
                resumesIn: this.getTimeToResume(),
                severity: 'CRITICAL'
            };
        }

        // Check rate limits
        const rateCheck = this.checkRateLimits(value);
        if (!rateCheck.allowed) {
            return rateCheck;
        }

        // Check asset-specific conditions
        if (asset) {
            const assetCheck = this.checkAssetConditions(asset, type);
            if (!assetCheck.allowed) {
                return assetCheck;
            }
        }

        return {
            allowed: true,
            warningLevel: this.state.warningLevel,
            message: this.state.warningLevel > 0
                ? 'Trading allowed with elevated risk'
                : 'Trading conditions normal'
        };
    },

    /**
     * Check rate limits
     */
    checkRateLimits(value = 0) {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const oneHourAgo = now - 3600000;

        // Count recent trades
        const tradesLastMinute = this.state.trades.filter(t => t.timestamp > oneMinuteAgo).length;
        const tradesLastHour = this.state.trades.filter(t => t.timestamp > oneHourAgo);
        const valueLastHour = tradesLastHour.reduce((sum, t) => sum + (t.value || 0), 0);

        // Check minute limit
        if (tradesLastMinute >= this.config.maxTradesPerMinute) {
            this.state.statistics.tradesBlocked++;
            return {
                allowed: false,
                reason: `Rate limit: ${this.config.maxTradesPerMinute} trades/minute exceeded`,
                severity: 'WARNING',
                retryIn: 60000 - (now - this.state.trades[0]?.timestamp || 0)
            };
        }

        // Check hour limit
        if (tradesLastHour.length >= this.config.maxTradesPerHour) {
            this.state.statistics.tradesBlocked++;
            return {
                allowed: false,
                reason: `Rate limit: ${this.config.maxTradesPerHour} trades/hour exceeded`,
                severity: 'WARNING',
                retryIn: 3600000 - (now - tradesLastHour[0]?.timestamp || 0)
            };
        }

        // Check value limit
        if (valueLastHour + value > this.config.maxValuePerHour) {
            this.state.statistics.tradesBlocked++;
            return {
                allowed: false,
                reason: `Value limit: $${this.config.maxValuePerHour}/hour exceeded`,
                severity: 'HIGH',
                currentValue: valueLastHour,
                limit: this.config.maxValuePerHour
            };
        }

        return { allowed: true };
    },

    /**
     * Check asset-specific conditions
     */
    checkAssetConditions(asset, tradeType) {
        const priceHistory = this.state.priceHistory.get(asset);

        if (!priceHistory || priceHistory.length < 2) {
            return { allowed: true, warning: 'Insufficient price history' };
        }

        const currentPrice = priceHistory[priceHistory.length - 1].price;
        const oldestPrice = priceHistory[0].price;
        const priceChange = (currentPrice - oldestPrice) / oldestPrice;

        // Check for crash
        if (priceChange < -this.config.priceDropCritical) {
            return {
                allowed: false,
                reason: `Asset ${asset} down ${(priceChange * 100).toFixed(1)}% - trading suspended`,
                severity: 'CRITICAL',
                recommendation: 'Wait for price stabilization'
            };
        }

        // Warning for significant drop
        if (priceChange < -this.config.priceDropThreshold) {
            this.state.warningLevel = Math.max(this.state.warningLevel, 1);
            return {
                allowed: true,
                warning: `Asset ${asset} down ${(priceChange * 100).toFixed(1)}% - elevated risk`,
                severity: 'WARNING'
            };
        }

        // Warning for spike (potential manipulation)
        if (priceChange > this.config.priceSpikeThreshold) {
            this.state.warningLevel = Math.max(this.state.warningLevel, 1);
            return {
                allowed: true,
                warning: `Asset ${asset} up ${(priceChange * 100).toFixed(1)}% - potential manipulation`,
                severity: 'WARNING',
                recommendation: 'Verify price on multiple sources'
            };
        }

        return { allowed: true };
    },

    /**
     * Record a trade for rate limiting
     */
    recordTrade(tradeParams) {
        this.state.trades.push({
            timestamp: Date.now(),
            ...tradeParams
        });
    },

    // ============================================
    // HALT CONTROLS
    // ============================================

    /**
     * Trigger emergency halt
     */
    triggerHalt(reason, severity = 'CRITICAL') {
        console.error(`[CircuitBreaker] 🚨 EMERGENCY HALT: ${reason}`);

        this.state.isHalted = true;
        this.state.haltReason = reason;
        this.state.haltTimestamp = Date.now();
        this.state.warningLevel = 2;
        this.state.statistics.haltsTriggered++;

        this.addAlert({
            type: 'HALT',
            severity,
            reason,
            timestamp: Date.now()
        });

        // Emit event for UI
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('obelisk-halt', {
                detail: { reason, timestamp: Date.now() }
            }));
        }

        return {
            halted: true,
            reason,
            resumesIn: this.config.haltDurationMs,
            message: `Trading halted for ${this.config.haltDurationMs / 1000} seconds`
        };
    },

    /**
     * Resume trading
     */
    resumeTrading(force = false) {
        if (!this.state.isHalted) {
            return { success: false, message: 'Trading is not halted' };
        }

        const haltDuration = Date.now() - this.state.haltTimestamp;

        if (!force && haltDuration < this.config.haltDurationMs) {
            return {
                success: false,
                message: 'Halt period not completed',
                remainingMs: this.config.haltDurationMs - haltDuration
            };
        }

        console.log('[CircuitBreaker] Trading resumed');

        this.state.isHalted = false;
        this.state.haltReason = null;
        this.state.haltTimestamp = null;
        this.state.warningLevel = 0;

        this.addAlert({
            type: 'RESUME',
            severity: 'INFO',
            reason: force ? 'Forced resume' : 'Auto-recovery',
            timestamp: Date.now()
        });

        return { success: true, message: 'Trading resumed' };
    },

    /**
     * Check for auto-recovery
     */
    checkAutoRecovery() {
        if (!this.state.isHalted) return;

        const haltDuration = Date.now() - this.state.haltTimestamp;

        if (haltDuration >= this.config.haltDurationMs) {
            // Additional safety check before auto-resume
            const priceStable = this.checkPriceStability();

            if (priceStable) {
                this.resumeTrading();
            } else {
                console.log('[CircuitBreaker] Extending halt - price not stable');
                this.state.haltTimestamp = Date.now(); // Extend halt
            }
        }
    },

    /**
     * Check if prices are stable enough to resume
     */
    checkPriceStability() {
        let stableAssets = 0;
        let totalAssets = 0;

        for (const [asset, history] of this.state.priceHistory) {
            if (history.length < 5) continue;
            totalAssets++;

            const recent = history.slice(-5);
            const prices = recent.map(h => h.price);
            const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
            const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
            const volatility = Math.sqrt(variance) / avg;

            if (volatility < 0.05) { // Less than 5% volatility
                stableAssets++;
            }
        }

        return totalAssets === 0 || (stableAssets / totalAssets) > 0.7;
    },

    getTimeToResume() {
        if (!this.state.isHalted) return 0;
        const elapsed = Date.now() - this.state.haltTimestamp;
        return Math.max(0, this.config.haltDurationMs - elapsed);
    },

    // ============================================
    // PRICE MONITORING
    // ============================================

    /**
     * Update price for an asset
     */
    updatePrice(asset, price, volume = 0) {
        if (!this.state.priceHistory.has(asset)) {
            this.state.priceHistory.set(asset, []);
        }

        const history = this.state.priceHistory.get(asset);
        history.push({ price, volume, timestamp: Date.now() });

        // Keep last 100 prices
        if (history.length > 100) {
            history.shift();
        }

        // Check for anomalies
        this.checkPriceAnomaly(asset, price, history);
    },

    /**
     * Check for price anomalies
     */
    checkPriceAnomaly(asset, currentPrice, history) {
        if (history.length < 3) return; // Reduced from 10 for faster detection

        // Calculate recent average
        const recentPrices = history.slice(-10, -1).map(h => h.price);
        const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

        // Check for flash crash
        const priceChange = (currentPrice - avgPrice) / avgPrice;

        if (priceChange < -this.config.priceDropCritical) {
            this.triggerHalt(
                `Flash crash detected: ${asset} dropped ${(priceChange * 100).toFixed(1)}%`,
                'CRITICAL'
            );
        } else if (priceChange < -this.config.priceDropThreshold) {
            this.issueWarning(
                `Price drop warning: ${asset} dropped ${(priceChange * 100).toFixed(1)}%`,
                'HIGH'
            );
        }

        // Check for suspicious spike
        if (priceChange > this.config.priceSpikeThreshold) {
            this.issueWarning(
                `Price spike alert: ${asset} up ${(priceChange * 100).toFixed(1)}% - possible manipulation`,
                'HIGH'
            );
        }
    },

    startPriceMonitoring() {
        // This would connect to price feeds in production
        console.log('[CircuitBreaker] Price monitoring initialized');
    },

    // ============================================
    // ALERTS & WARNINGS
    // ============================================

    issueWarning(message, severity = 'WARNING') {
        console.warn(`[CircuitBreaker] ⚠️ ${message}`);

        this.state.warningLevel = severity === 'HIGH' ? 2 : 1;
        this.state.statistics.warningsIssued++;

        this.addAlert({
            type: 'WARNING',
            severity,
            message,
            timestamp: Date.now()
        });
    },

    addAlert(alert) {
        this.state.alerts.unshift(alert);

        // Keep last 50 alerts
        if (this.state.alerts.length > 50) {
            this.state.alerts.pop();
        }

        // Emit event for UI
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('obelisk-alert', {
                detail: alert
            }));
        }
    },

    // ============================================
    // UTILITIES
    // ============================================

    cleanOldTrades() {
        const oneHourAgo = Date.now() - 3600000;
        this.state.trades = this.state.trades.filter(t => t.timestamp > oneHourAgo);
    },

    /**
     * Get current status
     */
    getStatus() {
        return {
            isHalted: this.state.isHalted,
            haltReason: this.state.haltReason,
            timeToResume: this.getTimeToResume(),
            warningLevel: this.state.warningLevel,
            warningLevelText: ['NORMAL', 'WARNING', 'CRITICAL'][this.state.warningLevel],
            recentAlerts: this.state.alerts.slice(0, 10),
            statistics: this.state.statistics,
            config: {
                maxTradesPerMinute: this.config.maxTradesPerMinute,
                maxTradesPerHour: this.config.maxTradesPerHour,
                maxValuePerHour: this.config.maxValuePerHour,
                haltDuration: this.config.haltDurationMs / 1000 + 's'
            }
        };
    },

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        console.log('[CircuitBreaker] Configuration updated');
        return this.config;
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = CircuitBreaker;
}

if (typeof window !== 'undefined') {
    window.CircuitBreaker = CircuitBreaker;
}
