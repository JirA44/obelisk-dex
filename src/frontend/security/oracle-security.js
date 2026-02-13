/**
 * OBELISK DEX - ORACLE SECURITY LAYER
 * Multi-source price validation with TWAP and manipulation detection
 */

const OracleSecurity = {
    // Configuration
    config: {
        // Price sources
        sources: [
            { name: 'chainlink', weight: 0.4, primary: true },
            { name: 'uniswap_twap', weight: 0.25 },
            { name: 'binance', weight: 0.2 },
            { name: 'coingecko', weight: 0.15 }
        ],

        // TWAP settings
        twapPeriodMs: 300000,         // 5 minutes TWAP
        twapMinSamples: 10,           // Minimum samples for valid TWAP

        // Deviation thresholds
        maxDeviation: 0.02,           // 2% max deviation between sources
        criticalDeviation: 0.05,      // 5% triggers alert
        staleThresholdMs: 60000,      // 1 minute = stale

        // Sanity checks
        maxPriceChange24h: 0.50,      // 50% max daily change
        minPriceUsd: 0.000001,        // Minimum valid price
        maxPriceUsd: 1000000000       // Maximum valid price ($1B)
    },

    // State
    state: {
        prices: new Map(),            // Asset -> { source -> price data }
        twapData: new Map(),          // Asset -> TWAP samples
        lastValidPrices: new Map(),   // Asset -> last known good price
        alerts: [],
        statistics: {
            priceUpdates: 0,
            manipulationAttempts: 0,
            staleAlerts: 0,
            deviationAlerts: 0
        }
    },

    /**
     * Initialize Oracle Security
     */
    init() {
        console.log('[OracleSecurity] Initializing multi-source oracle layer...');

        // Start TWAP collection
        setInterval(() => this.collectTwapSamples(), 30000); // Every 30s

        // Start staleness check
        setInterval(() => this.checkStaleness(), 10000); // Every 10s

        console.log('[OracleSecurity] Ready - Multi-oracle protection active');
        return true;
    },

    // ============================================
    // PRICE UPDATES
    // ============================================

    /**
     * Update price from a source
     */
    updatePrice(asset, source, price, metadata = {}) {
        if (!this.state.prices.has(asset)) {
            this.state.prices.set(asset, new Map());
        }

        const assetPrices = this.state.prices.get(asset);

        // Validate price first
        const validation = this.validatePrice(asset, price, source);
        if (!validation.valid) {
            console.warn(`[OracleSecurity] Invalid price rejected: ${asset} from ${source}`);
            return { accepted: false, reason: validation.reason };
        }

        // Store price
        assetPrices.set(source, {
            price,
            timestamp: Date.now(),
            metadata,
            validated: true
        });

        this.state.statistics.priceUpdates++;

        // Check for manipulation
        this.checkManipulation(asset);

        return { accepted: true, price };
    },

    /**
     * Validate a single price
     */
    validatePrice(asset, price, source) {
        // Basic sanity checks
        if (typeof price !== 'number' || isNaN(price)) {
            return { valid: false, reason: 'Price is not a valid number' };
        }

        if (price < this.config.minPriceUsd) {
            return { valid: false, reason: `Price ${price} below minimum ${this.config.minPriceUsd}` };
        }

        if (price > this.config.maxPriceUsd) {
            return { valid: false, reason: `Price ${price} above maximum ${this.config.maxPriceUsd}` };
        }

        // Check against last valid price (24h change limit)
        const lastValid = this.state.lastValidPrices.get(asset);
        if (lastValid) {
            const change = Math.abs((price - lastValid.price) / lastValid.price);
            if (change > this.config.maxPriceChange24h) {
                return {
                    valid: false,
                    reason: `Price change ${(change * 100).toFixed(1)}% exceeds 24h limit`,
                    lastPrice: lastValid.price,
                    newPrice: price
                };
            }
        }

        return { valid: true };
    },

    // ============================================
    // TWAP (Time-Weighted Average Price)
    // ============================================

    /**
     * Collect TWAP sample
     */
    collectTwapSamples() {
        for (const [asset, sources] of this.state.prices) {
            const aggregatedPrice = this.getAggregatedPrice(asset);

            if (aggregatedPrice.valid) {
                if (!this.state.twapData.has(asset)) {
                    this.state.twapData.set(asset, []);
                }

                const samples = this.state.twapData.get(asset);
                samples.push({
                    price: aggregatedPrice.price,
                    timestamp: Date.now()
                });

                // Keep only samples within TWAP period
                const cutoff = Date.now() - this.config.twapPeriodMs;
                const validSamples = samples.filter(s => s.timestamp > cutoff);
                this.state.twapData.set(asset, validSamples);
            }
        }
    },

    /**
     * Get TWAP for an asset
     */
    getTwap(asset) {
        const samples = this.state.twapData.get(asset);

        if (!samples || samples.length < this.config.twapMinSamples) {
            return {
                valid: false,
                reason: 'Insufficient TWAP samples',
                samplesAvailable: samples?.length || 0,
                samplesRequired: this.config.twapMinSamples
            };
        }

        // Calculate time-weighted average
        let totalWeight = 0;
        let weightedSum = 0;

        for (let i = 1; i < samples.length; i++) {
            const timeDelta = samples[i].timestamp - samples[i - 1].timestamp;
            const avgPrice = (samples[i].price + samples[i - 1].price) / 2;
            weightedSum += avgPrice * timeDelta;
            totalWeight += timeDelta;
        }

        const twap = weightedSum / totalWeight;

        return {
            valid: true,
            twap,
            samples: samples.length,
            period: this.config.twapPeriodMs / 1000 + 's',
            oldest: new Date(samples[0].timestamp).toISOString(),
            newest: new Date(samples[samples.length - 1].timestamp).toISOString()
        };
    },

    // ============================================
    // AGGREGATION
    // ============================================

    /**
     * Get weighted aggregated price from all sources
     */
    getAggregatedPrice(asset) {
        const sources = this.state.prices.get(asset);

        if (!sources || sources.size === 0) {
            return { valid: false, reason: 'No price sources available' };
        }

        const now = Date.now();
        let weightedSum = 0;
        let totalWeight = 0;
        const usedSources = [];
        const prices = [];

        for (const sourceConfig of this.config.sources) {
            const sourceData = sources.get(sourceConfig.name);

            if (!sourceData) continue;

            // Check staleness
            if (now - sourceData.timestamp > this.config.staleThresholdMs) {
                continue; // Skip stale source
            }

            prices.push({
                source: sourceConfig.name,
                price: sourceData.price,
                weight: sourceConfig.weight
            });

            weightedSum += sourceData.price * sourceConfig.weight;
            totalWeight += sourceConfig.weight;
            usedSources.push(sourceConfig.name);
        }

        if (totalWeight === 0) {
            return { valid: false, reason: 'All price sources are stale' };
        }

        const aggregatedPrice = weightedSum / totalWeight;

        // Check deviation between sources
        const deviation = this.checkDeviation(prices, aggregatedPrice);

        // Store as last valid price
        this.state.lastValidPrices.set(asset, {
            price: aggregatedPrice,
            timestamp: now
        });

        return {
            valid: true,
            price: aggregatedPrice,
            sources: usedSources,
            sourceCount: usedSources.length,
            deviation,
            confidence: this.calculateConfidence(usedSources.length, deviation)
        };
    },

    /**
     * Calculate price deviation between sources
     */
    checkDeviation(prices, aggregatedPrice) {
        if (prices.length < 2) {
            return { max: 0, sources: prices.length, warning: false };
        }

        let maxDeviation = 0;
        let maxDeviationPair = null;

        for (const p of prices) {
            const deviation = Math.abs((p.price - aggregatedPrice) / aggregatedPrice);
            if (deviation > maxDeviation) {
                maxDeviation = deviation;
                maxDeviationPair = p.source;
            }
        }

        // Issue alerts for significant deviation
        if (maxDeviation > this.config.criticalDeviation) {
            this.addAlert({
                type: 'DEVIATION_CRITICAL',
                severity: 'CRITICAL',
                message: `Price deviation ${(maxDeviation * 100).toFixed(2)}% from ${maxDeviationPair}`,
                maxDeviation,
                source: maxDeviationPair
            });
            this.state.statistics.deviationAlerts++;
        } else if (maxDeviation > this.config.maxDeviation) {
            this.addAlert({
                type: 'DEVIATION_WARNING',
                severity: 'WARNING',
                message: `Price deviation ${(maxDeviation * 100).toFixed(2)}% from ${maxDeviationPair}`,
                maxDeviation,
                source: maxDeviationPair
            });
        }

        return {
            max: maxDeviation,
            maxSource: maxDeviationPair,
            warning: maxDeviation > this.config.maxDeviation,
            critical: maxDeviation > this.config.criticalDeviation
        };
    },

    /**
     * Calculate confidence score (0-100)
     */
    calculateConfidence(sourceCount, deviation) {
        let score = 100;

        // Reduce for fewer sources
        if (sourceCount < 4) score -= (4 - sourceCount) * 15;

        // Reduce for high deviation
        if (deviation.max > 0) {
            score -= deviation.max * 500; // 2% deviation = -10 points
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    },

    // ============================================
    // MANIPULATION DETECTION
    // ============================================

    /**
     * Check for price manipulation attempts
     */
    checkManipulation(asset) {
        const sources = this.state.prices.get(asset);
        if (!sources || sources.size < 2) return;

        const prices = Array.from(sources.values()).map(s => s.price);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

        // Check for outlier (possible manipulation)
        for (const [sourceName, data] of sources) {
            const deviation = Math.abs((data.price - avg) / avg);

            if (deviation > this.config.criticalDeviation) {
                this.state.statistics.manipulationAttempts++;

                this.addAlert({
                    type: 'MANIPULATION_DETECTED',
                    severity: 'CRITICAL',
                    asset,
                    source: sourceName,
                    reportedPrice: data.price,
                    expectedPrice: avg,
                    deviation: (deviation * 100).toFixed(2) + '%',
                    message: `Possible manipulation: ${sourceName} reporting ${data.price} vs expected ${avg.toFixed(2)}`
                });

                // Mark source as suspicious
                data.suspicious = true;
            }
        }
    },

    // ============================================
    // STALENESS DETECTION
    // ============================================

    /**
     * Check for stale price feeds
     */
    checkStaleness() {
        const now = Date.now();
        const staleAssets = [];

        for (const [asset, sources] of this.state.prices) {
            let allStale = true;

            for (const [sourceName, data] of sources) {
                const age = now - data.timestamp;

                if (age < this.config.staleThresholdMs) {
                    allStale = false;
                } else if (age > this.config.staleThresholdMs * 2) {
                    // Very stale - issue alert
                    this.addAlert({
                        type: 'SOURCE_STALE',
                        severity: 'WARNING',
                        asset,
                        source: sourceName,
                        ageMs: age,
                        message: `Price source ${sourceName} for ${asset} is stale (${(age / 1000).toFixed(0)}s old)`
                    });
                }
            }

            if (allStale) {
                staleAssets.push(asset);
            }
        }

        if (staleAssets.length > 0) {
            this.state.statistics.staleAlerts++;
            console.warn(`[OracleSecurity] Stale assets: ${staleAssets.join(', ')}`);
        }
    },

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Get secure price for an asset
     * This is the main function to use for getting prices
     */
    getSecurePrice(asset, options = {}) {
        const { useTwap = false, requireMinSources = 2 } = options;

        // Try TWAP first if requested
        if (useTwap) {
            const twap = this.getTwap(asset);
            if (twap.valid) {
                return {
                    price: twap.twap,
                    type: 'TWAP',
                    confidence: 95,
                    details: twap
                };
            }
        }

        // Get aggregated price
        const aggregated = this.getAggregatedPrice(asset);

        if (!aggregated.valid) {
            // Fallback to last known price with warning
            const lastKnown = this.state.lastValidPrices.get(asset);
            if (lastKnown) {
                return {
                    price: lastKnown.price,
                    type: 'CACHED',
                    confidence: 30,
                    warning: 'Using cached price - live feeds unavailable',
                    cachedAt: new Date(lastKnown.timestamp).toISOString()
                };
            }

            return { valid: false, reason: aggregated.reason };
        }

        // Check minimum sources
        if (aggregated.sourceCount < requireMinSources) {
            return {
                price: aggregated.price,
                type: 'AGGREGATED',
                confidence: aggregated.confidence,
                warning: `Only ${aggregated.sourceCount} sources available (${requireMinSources} required)`,
                details: aggregated
            };
        }

        return {
            price: aggregated.price,
            type: 'AGGREGATED',
            confidence: aggregated.confidence,
            sources: aggregated.sources,
            deviation: aggregated.deviation,
            valid: true
        };
    },

    // ============================================
    // UTILITIES
    // ============================================

    addAlert(alert) {
        alert.timestamp = Date.now();
        this.state.alerts.unshift(alert);

        if (this.state.alerts.length > 100) {
            this.state.alerts.pop();
        }

        // Emit event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('obelisk-oracle-alert', {
                detail: alert
            }));
        }
    },

    /**
     * Get oracle status
     */
    getStatus() {
        const assetStatuses = [];

        for (const [asset, sources] of this.state.prices) {
            const aggregated = this.getAggregatedPrice(asset);
            const twap = this.getTwap(asset);

            assetStatuses.push({
                asset,
                price: aggregated.valid ? aggregated.price : null,
                sources: aggregated.sources || [],
                confidence: aggregated.confidence || 0,
                twapAvailable: twap.valid,
                twap: twap.valid ? twap.twap : null
            });
        }

        return {
            healthy: this.state.statistics.manipulationAttempts === 0,
            assetsMonitored: this.state.prices.size,
            assets: assetStatuses,
            statistics: this.state.statistics,
            recentAlerts: this.state.alerts.slice(0, 10),
            config: {
                sources: this.config.sources.map(s => s.name),
                twapPeriod: this.config.twapPeriodMs / 1000 + 's',
                maxDeviation: (this.config.maxDeviation * 100) + '%',
                staleThreshold: this.config.staleThresholdMs / 1000 + 's'
            }
        };
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = OracleSecurity;
}

if (typeof window !== 'undefined') {
    window.OracleSecurity = OracleSecurity;
}
