/**
 * OBELISK DEX - TRANSACTION ANOMALY DETECTOR
 * ML-inspired behavioral analysis for transaction security
 */

const AnomalyDetector = {
    // Configuration
    config: {
        // Learning settings
        learningWindowMs: 604800000,    // 7 days of history
        minSamplesForBaseline: 50,

        // Anomaly thresholds
        zScoreThreshold: 2.5,           // Standard deviations for anomaly
        suddenChangeMultiplier: 3,       // 3x normal = suspicious

        // Feature weights
        weights: {
            value: 0.25,
            gasPrice: 0.15,
            frequency: 0.20,
            destination: 0.20,
            timeOfDay: 0.10,
            methodSignature: 0.10
        },

        // Behavioral profiles
        enableProfiling: true,
        maxProfiles: 1000
    },

    // State
    state: {
        // Transaction history for baseline
        history: [],

        // User behavioral profiles
        profiles: new Map(),

        // Baseline statistics
        baseline: {
            value: { mean: 0, stdDev: 0, samples: 0 },
            gasPrice: { mean: 0, stdDev: 0, samples: 0 },
            frequency: { mean: 0, stdDev: 0, samples: 0 }
        },

        // Detected anomalies
        anomalies: [],

        // Known patterns
        knownPatterns: {
            flashLoanSignatures: new Set([
                '0xab9c4b5d', // Aave flashLoan
                '0x5cffe9de', // dYdX flashLoan
            ]),
            riskyMethodSignatures: new Set([
                '0xa9059cbb', // transfer
                '0x23b872dd', // transferFrom
                '0x095ea7b3', // approve (unlimited)
                '0x39509351', // increaseAllowance
            ])
        },

        statistics: {
            transactionsAnalyzed: 0,
            anomaliesDetected: 0,
            falsePositives: 0
        }
    },

    /**
     * Initialize Anomaly Detector
     */
    init() {
        console.log('[AnomalyDetector] Initializing behavioral analysis...');

        // Start baseline recalculation
        setInterval(() => this.recalculateBaseline(), 3600000); // Hourly

        // Clean old history
        setInterval(() => this.cleanHistory(), 86400000); // Daily

        console.log('[AnomalyDetector] Ready - Behavioral analysis active');
        return true;
    },

    // ============================================
    // TRANSACTION ANALYSIS
    // ============================================

    /**
     * Analyze a transaction for anomalies
     */
    async analyzeTransaction(tx) {
        this.state.statistics.transactionsAnalyzed++;

        const {
            from,
            to,
            value,
            gasPrice,
            data,
            timestamp = Date.now()
        } = tx;

        // Get or create user profile
        const profile = this.getOrCreateProfile(from);

        // Run all anomaly checks
        const checks = {
            value: this.checkValueAnomaly(value, profile),
            gas: this.checkGasAnomaly(gasPrice),
            frequency: this.checkFrequencyAnomaly(from, profile),
            destination: this.checkDestinationAnomaly(to, profile),
            timeOfDay: this.checkTimeAnomaly(timestamp, profile),
            method: this.checkMethodAnomaly(data)
        };

        // Calculate composite anomaly score
        let totalScore = 0;
        let maxSeverity = 'NORMAL';
        const flags = [];

        for (const [checkName, result] of Object.entries(checks)) {
            const weight = this.config.weights[checkName] || 0.1;
            totalScore += result.score * weight;

            if (result.anomaly) {
                flags.push({
                    check: checkName,
                    score: result.score,
                    reason: result.reason
                });

                if (result.severity === 'CRITICAL' && maxSeverity !== 'CRITICAL') {
                    maxSeverity = 'CRITICAL';
                } else if (result.severity === 'HIGH' && maxSeverity === 'NORMAL') {
                    maxSeverity = 'HIGH';
                }
            }
        }

        // Record in history
        this.recordTransaction(tx, profile);

        // Determine if this is an anomaly
        const isAnomaly = totalScore > 0.5 || maxSeverity !== 'NORMAL';

        const result = {
            isAnomaly,
            score: totalScore,
            severity: maxSeverity,
            flags,
            checks,
            recommendation: this.getRecommendation(totalScore, maxSeverity, flags)
        };

        if (isAnomaly) {
            this.state.statistics.anomaliesDetected++;
            this.state.anomalies.push({
                ...result,
                tx: { from, to, value, gasPrice },
                timestamp: Date.now()
            });

            // Keep last 100 anomalies
            if (this.state.anomalies.length > 100) {
                this.state.anomalies.shift();
            }
        }

        return result;
    },

    /**
     * Check for value anomaly
     */
    checkValueAnomaly(value, profile) {
        const valueNum = parseFloat(value) || 0;

        // Check against global baseline
        const globalZScore = this.calculateZScore(
            valueNum,
            this.state.baseline.value.mean,
            this.state.baseline.value.stdDev
        );

        // Check against user profile
        const profileZScore = profile.avgValue > 0
            ? this.calculateZScore(valueNum, profile.avgValue, profile.valueStdDev || profile.avgValue * 0.5)
            : 0;

        const maxZScore = Math.max(Math.abs(globalZScore), Math.abs(profileZScore));

        if (maxZScore > this.config.zScoreThreshold * 2) {
            return {
                anomaly: true,
                score: 1,
                severity: 'CRITICAL',
                reason: `Transaction value ${valueNum} is ${maxZScore.toFixed(1)} standard deviations from normal`
            };
        }

        if (maxZScore > this.config.zScoreThreshold) {
            return {
                anomaly: true,
                score: 0.7,
                severity: 'HIGH',
                reason: `Unusual transaction value detected (${maxZScore.toFixed(1)} σ)`
            };
        }

        return { anomaly: false, score: maxZScore / (this.config.zScoreThreshold * 2) };
    },

    /**
     * Check for gas price anomaly
     */
    checkGasAnomaly(gasPrice) {
        const gasPriceNum = parseFloat(gasPrice) || 0;

        if (this.state.baseline.gasPrice.samples < 10) {
            return { anomaly: false, score: 0, reason: 'Insufficient gas data' };
        }

        const zScore = this.calculateZScore(
            gasPriceNum,
            this.state.baseline.gasPrice.mean,
            this.state.baseline.gasPrice.stdDev
        );

        // Very high gas price might indicate urgency (front-running attempt)
        if (zScore > 4) {
            return {
                anomaly: true,
                score: 0.9,
                severity: 'HIGH',
                reason: `Gas price ${gasPriceNum} is unusually high - possible front-running`
            };
        }

        if (zScore > this.config.zScoreThreshold) {
            return {
                anomaly: true,
                score: 0.5,
                severity: 'MEDIUM',
                reason: `Elevated gas price detected`
            };
        }

        return { anomaly: false, score: zScore / 4 };
    },

    /**
     * Check for unusual transaction frequency
     */
    checkFrequencyAnomaly(address, profile) {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // Count recent transactions
        const recentTx = this.state.history.filter(
            h => h.from === address && h.timestamp > oneMinuteAgo
        ).length;

        // Compare to profile
        const expectedPerMinute = profile.avgTxPerHour / 60;
        const expectedWithBuffer = Math.max(expectedPerMinute * this.config.suddenChangeMultiplier, 3);

        if (recentTx > expectedWithBuffer) {
            return {
                anomaly: true,
                score: 0.8,
                severity: 'HIGH',
                reason: `${recentTx} transactions in last minute (expected ~${expectedPerMinute.toFixed(1)})`
            };
        }

        if (recentTx > expectedWithBuffer / 2) {
            return {
                anomaly: true,
                score: 0.4,
                severity: 'MEDIUM',
                reason: `Elevated transaction frequency`
            };
        }

        return { anomaly: false, score: recentTx / expectedWithBuffer };
    },

    /**
     * Check for unusual destination
     */
    checkDestinationAnomaly(to, profile) {
        if (!to) return { anomaly: false, score: 0 };

        const toAddress = to.toLowerCase();

        // Check if destination is in profile's known addresses
        if (profile.knownDestinations.has(toAddress)) {
            return { anomaly: false, score: 0, reason: 'Known destination' };
        }

        // Check against global suspicious addresses
        if (typeof window !== 'undefined' && window.ContractGuards) {
            if (window.ContractGuards.state.suspiciousAddresses.has(toAddress)) {
                return {
                    anomaly: true,
                    score: 1,
                    severity: 'CRITICAL',
                    reason: 'Destination is a known malicious address'
                };
            }
        }

        // New destination - moderate concern
        const newDestinationRatio = profile.uniqueDestinations / (profile.txCount || 1);

        if (newDestinationRatio < 0.1 && profile.txCount > 20) {
            // User usually sends to same addresses
            return {
                anomaly: true,
                score: 0.5,
                severity: 'MEDIUM',
                reason: 'New destination for user who typically uses same addresses'
            };
        }

        return { anomaly: false, score: 0.2 };
    },

    /**
     * Check for unusual time of day
     */
    checkTimeAnomaly(timestamp, profile) {
        const hour = new Date(timestamp).getHours();

        // Check if within profile's active hours
        if (profile.activeHours.length > 10) {
            const typicalHour = profile.activeHours.filter(h => h === hour).length / profile.activeHours.length;

            if (typicalHour < 0.02) { // Less than 2% of activity at this hour
                return {
                    anomaly: true,
                    score: 0.3,
                    severity: 'LOW',
                    reason: `Unusual activity hour (${hour}:00)`
                };
            }
        }

        return { anomaly: false, score: 0 };
    },

    /**
     * Check for suspicious method signatures
     */
    checkMethodAnomaly(data) {
        if (!data || data.length < 10) {
            return { anomaly: false, score: 0 };
        }

        const methodSig = data.slice(0, 10);

        // Check for flash loan patterns
        if (this.state.knownPatterns.flashLoanSignatures.has(methodSig)) {
            return {
                anomaly: true,
                score: 0.8,
                severity: 'HIGH',
                reason: 'Flash loan method detected - verify intent'
            };
        }

        // Check for risky methods (need extra verification)
        if (this.state.knownPatterns.riskyMethodSignatures.has(methodSig)) {
            return {
                anomaly: true,
                score: 0.4,
                severity: 'MEDIUM',
                reason: 'Token transfer/approval method - verify destination'
            };
        }

        return { anomaly: false, score: 0 };
    },

    // ============================================
    // PROFILE MANAGEMENT
    // ============================================

    /**
     * Get or create user profile
     */
    getOrCreateProfile(address) {
        if (!address) address = '0x0000000000000000000000000000000000000000';
        const key = address.toLowerCase();

        if (!this.state.profiles.has(key)) {
            this.state.profiles.set(key, {
                address: key,
                txCount: 0,
                avgValue: 0,
                valueStdDev: 0,
                avgTxPerHour: 0,
                uniqueDestinations: 0,
                knownDestinations: new Set(),
                activeHours: [],
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                riskScore: 0.5  // Start neutral
            });

            // Limit profiles
            if (this.state.profiles.size > this.config.maxProfiles) {
                // Remove oldest profile
                let oldestKey = null;
                let oldestTime = Infinity;

                for (const [k, v] of this.state.profiles) {
                    if (v.lastSeen < oldestTime) {
                        oldestTime = v.lastSeen;
                        oldestKey = k;
                    }
                }

                if (oldestKey) this.state.profiles.delete(oldestKey);
            }
        }

        return this.state.profiles.get(key);
    },

    /**
     * Record transaction and update profile
     */
    recordTransaction(tx, profile) {
        const valueNum = parseFloat(tx.value) || 0;
        const hour = new Date(tx.timestamp || Date.now()).getHours();

        // Update profile
        profile.txCount++;
        profile.lastSeen = Date.now();
        profile.activeHours.push(hour);

        // Update running average and std dev
        const oldAvg = profile.avgValue;
        profile.avgValue = oldAvg + (valueNum - oldAvg) / profile.txCount;

        if (profile.txCount > 1) {
            const oldVariance = Math.pow(profile.valueStdDev, 2);
            const newVariance = oldVariance + (valueNum - oldAvg) * (valueNum - profile.avgValue);
            profile.valueStdDev = Math.sqrt(newVariance / (profile.txCount - 1));
        }

        // Track destinations
        if (tx.to) {
            const dest = tx.to.toLowerCase();
            if (!profile.knownDestinations.has(dest)) {
                profile.uniqueDestinations++;
                profile.knownDestinations.add(dest);
            }
        }

        // Update tx frequency
        const hoursSinceFirst = (Date.now() - profile.firstSeen) / 3600000;
        profile.avgTxPerHour = profile.txCount / Math.max(hoursSinceFirst, 1);

        // Keep active hours limited
        if (profile.activeHours.length > 1000) {
            profile.activeHours = profile.activeHours.slice(-1000);
        }

        // Add to history
        this.state.history.push({
            from: tx.from,
            to: tx.to,
            value: valueNum,
            gasPrice: tx.gasPrice,
            timestamp: tx.timestamp || Date.now()
        });
    },

    // ============================================
    // BASELINE MANAGEMENT
    // ============================================

    /**
     * Recalculate global baseline
     */
    recalculateBaseline() {
        if (this.state.history.length < this.config.minSamplesForBaseline) {
            return;
        }

        // Value baseline
        const values = this.state.history.map(h => h.value).filter(v => v > 0);
        if (values.length > 0) {
            this.state.baseline.value = this.calculateStats(values);
        }

        // Gas price baseline
        const gasPrices = this.state.history.map(h => h.gasPrice).filter(g => g > 0);
        if (gasPrices.length > 0) {
            this.state.baseline.gasPrice = this.calculateStats(gasPrices);
        }

        console.log(`[AnomalyDetector] Baseline updated (${this.state.history.length} samples)`);
    },

    /**
     * Calculate mean and standard deviation
     */
    calculateStats(values) {
        const n = values.length;
        const mean = values.reduce((a, b) => a + b, 0) / n;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        return { mean, stdDev, samples: n };
    },

    /**
     * Calculate Z-score
     */
    calculateZScore(value, mean, stdDev) {
        if (stdDev === 0) return 0;
        return (value - mean) / stdDev;
    },

    /**
     * Clean old history
     */
    cleanHistory() {
        const cutoff = Date.now() - this.config.learningWindowMs;
        const oldCount = this.state.history.length;
        this.state.history = this.state.history.filter(h => h.timestamp > cutoff);
        console.log(`[AnomalyDetector] Cleaned ${oldCount - this.state.history.length} old records`);
    },

    // ============================================
    // UTILITIES
    // ============================================

    /**
     * Get recommendation based on analysis
     */
    getRecommendation(score, severity, flags) {
        if (severity === 'CRITICAL') {
            return 'BLOCK - Transaction shows critical anomaly patterns. Do not proceed.';
        }

        if (severity === 'HIGH') {
            return 'REVIEW - Transaction requires manual review before proceeding.';
        }

        if (score > 0.3) {
            return 'CAUTION - Some unusual patterns detected. Verify transaction details.';
        }

        return 'PROCEED - Transaction appears normal.';
    },

    /**
     * Get detector status
     */
    getStatus() {
        return {
            active: true,
            profilesTracked: this.state.profiles.size,
            historySize: this.state.history.length,
            baseline: {
                valueBaseline: this.state.baseline.value.mean?.toFixed(2) || 'N/A',
                gasPriceBaseline: this.state.baseline.gasPrice.mean?.toFixed(2) || 'N/A',
                samples: this.state.baseline.value.samples
            },
            recentAnomalies: this.state.anomalies.slice(0, 10),
            statistics: this.state.statistics
        };
    },

    /**
     * Mark false positive (for learning)
     */
    markFalsePositive(anomalyId) {
        this.state.statistics.falsePositives++;
        // In production: feed back to improve model
        console.log(`[AnomalyDetector] Marked false positive: ${anomalyId}`);
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = AnomalyDetector;
}

if (typeof window !== 'undefined') {
    window.AnomalyDetector = AnomalyDetector;
}
