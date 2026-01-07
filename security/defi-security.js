/**
 * OBELISK DEX - DEFI SECURITY
 * Bridge Security and Rug Pull Detection
 * Mitigates: DEFI-001, DEFI-004
 */

const DefiSecurity = {
    // Configuration
    config: {
        // Bridge security
        bridgeRateLimits: {
            maxPerTx: 100000,          // $100k max per transaction
            maxPerHour: 500000,        // $500k max per hour
            maxPerDay: 2000000         // $2M max per day
        },

        // Rug pull detection thresholds
        rugPullThresholds: {
            liquidityDropPercent: 0.50,   // 50% liquidity drop
            holderConcentration: 0.80,    // 80% held by top 10
            mintableWarning: true,
            unlockTimeMinDays: 30
        },

        // Known safe bridges
        trustedBridges: new Set([
            'arbitrum-bridge',
            'optimism-bridge',
            'polygon-bridge'
        ]),

        // Known scam patterns
        scamPatterns: {
            honeypot: /^(sell|transfer|withdraw).*disabled$/i,
            mintFunction: /mint\(address,uint256\)/,
            proxyAdmin: /upgradeToAndCall/
        }
    },

    // State
    state: {
        bridgeTransactions: [],
        analyzedTokens: new Map(),
        flaggedTokens: new Set(),
        alerts: [],
        statistics: {
            tokensAnalyzed: 0,
            rugPullsDetected: 0,
            bridgeTxBlocked: 0
        }
    },

    /**
     * Initialize DeFi Security
     */
    init() {
        console.log('[DefiSecurity] Initializing DeFi protection...');

        // Clean old data periodically
        setInterval(() => this.cleanOldData(), 3600000);

        console.log('[DefiSecurity] Ready - Bridge and rug pull protection active');
        return true;
    },

    // ============================================
    // BRIDGE SECURITY (DEFI-001)
    // ============================================

    /**
     * Check if bridge transaction should be allowed
     */
    async checkBridgeTransaction(bridgeTx) {
        const {
            bridge,
            amount,
            fromChain,
            toChain,
            token,
            sender
        } = bridgeTx;

        const checks = {
            timestamp: Date.now(),
            passed: true,
            warnings: [],
            blocked: false,
            reason: null
        };

        // 1. Check if bridge is trusted
        if (!this.config.trustedBridges.has(bridge)) {
            checks.warnings.push({
                type: 'UNTRUSTED_BRIDGE',
                severity: 'HIGH',
                message: `Bridge "${bridge}" is not in trusted list`
            });
        }

        // 2. Check rate limits
        const rateLimitCheck = this.checkBridgeRateLimits(sender, amount);
        if (!rateLimitCheck.allowed) {
            checks.passed = false;
            checks.blocked = true;
            checks.reason = rateLimitCheck.reason;
            this.state.statistics.bridgeTxBlocked++;
        }

        // 3. Check for unusual patterns
        const patternCheck = this.checkBridgePatterns(bridgeTx);
        if (patternCheck.suspicious) {
            checks.warnings.push(...patternCheck.warnings);
        }

        // 4. Verify token on destination chain
        const tokenCheck = await this.verifyBridgeToken(token, fromChain, toChain);
        if (!tokenCheck.verified) {
            checks.warnings.push({
                type: 'TOKEN_VERIFICATION_FAILED',
                severity: 'HIGH',
                message: tokenCheck.reason
            });
        }

        // Record transaction
        this.state.bridgeTransactions.push({
            ...bridgeTx,
            timestamp: Date.now(),
            checks
        });

        // Keep only recent transactions
        const cutoff = Date.now() - 86400000;
        this.state.bridgeTransactions = this.state.bridgeTransactions.filter(
            t => t.timestamp > cutoff
        );

        return checks;
    },

    /**
     * Check bridge rate limits
     */
    checkBridgeRateLimits(sender, amount) {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        const oneDayAgo = now - 86400000;

        // Filter transactions by sender
        const senderTxs = this.state.bridgeTransactions.filter(
            t => t.sender === sender
        );

        // Per-transaction limit
        if (amount > this.config.bridgeRateLimits.maxPerTx) {
            return {
                allowed: false,
                reason: `Amount $${amount} exceeds per-transaction limit of $${this.config.bridgeRateLimits.maxPerTx}`
            };
        }

        // Hourly limit
        const hourlyTotal = senderTxs
            .filter(t => t.timestamp > oneHourAgo)
            .reduce((sum, t) => sum + t.amount, 0);

        if (hourlyTotal + amount > this.config.bridgeRateLimits.maxPerHour) {
            return {
                allowed: false,
                reason: `Hourly limit of $${this.config.bridgeRateLimits.maxPerHour} would be exceeded`
            };
        }

        // Daily limit
        const dailyTotal = senderTxs
            .filter(t => t.timestamp > oneDayAgo)
            .reduce((sum, t) => sum + t.amount, 0);

        if (dailyTotal + amount > this.config.bridgeRateLimits.maxPerDay) {
            return {
                allowed: false,
                reason: `Daily limit of $${this.config.bridgeRateLimits.maxPerDay} would be exceeded`
            };
        }

        return { allowed: true };
    },

    /**
     * Check for suspicious bridge patterns
     */
    checkBridgePatterns(bridgeTx) {
        const warnings = [];

        // Pattern: Multiple bridges in short time
        const recentBridges = this.state.bridgeTransactions.filter(
            t => t.sender === bridgeTx.sender && Date.now() - t.timestamp < 600000
        );

        if (recentBridges.length >= 3) {
            warnings.push({
                type: 'RAPID_BRIDGING',
                severity: 'MEDIUM',
                message: 'Multiple bridge transactions in short time - possible fund movement pattern'
            });
        }

        // Pattern: Bridge to different chains rapidly
        const uniqueChains = new Set(recentBridges.map(t => t.toChain));
        if (uniqueChains.size >= 3) {
            warnings.push({
                type: 'MULTI_CHAIN_SCATTER',
                severity: 'HIGH',
                message: 'Bridging to multiple chains rapidly - possible money laundering'
            });
        }

        return {
            suspicious: warnings.length > 0,
            warnings
        };
    },

    /**
     * Verify token mapping across chains
     */
    async verifyBridgeToken(token, fromChain, toChain) {
        // In production: verify against bridge's canonical token list
        // For now, basic validation
        if (!token || !token.address) {
            return { verified: false, reason: 'Invalid token data' };
        }

        // Check if token is known scam
        if (this.state.flaggedTokens.has(token.address.toLowerCase())) {
            return { verified: false, reason: 'Token is flagged as scam' };
        }

        return { verified: true };
    },

    // ============================================
    // RUG PULL DETECTION (DEFI-004)
    // ============================================

    /**
     * Analyze token for rug pull risk
     */
    async analyzeToken(tokenData) {
        const {
            address,
            name,
            symbol,
            totalSupply,
            holders,
            liquidity,
            lpLocked,
            lpLockDuration,
            ownerAddress,
            ownerRenounced,
            contractCode
        } = tokenData;

        this.state.statistics.tokensAnalyzed++;

        const analysis = {
            address: address.toLowerCase(),
            timestamp: Date.now(),
            riskScore: 0,
            riskLevel: 'LOW',
            flags: [],
            passed: true
        };

        // 1. Check liquidity lock
        if (!lpLocked) {
            analysis.flags.push({
                type: 'LP_NOT_LOCKED',
                severity: 'CRITICAL',
                weight: 30,
                message: 'Liquidity is not locked - owner can pull at any time'
            });
            analysis.riskScore += 30;
        } else if (lpLockDuration < this.config.rugPullThresholds.unlockTimeMinDays * 86400000) {
            analysis.flags.push({
                type: 'LP_LOCK_SHORT',
                severity: 'HIGH',
                weight: 20,
                message: `LP lock duration only ${Math.floor(lpLockDuration / 86400000)} days`
            });
            analysis.riskScore += 20;
        }

        // 2. Check holder concentration
        if (holders && holders.length > 0) {
            const topHolders = holders.slice(0, 10);
            const topHolderPercent = topHolders.reduce((sum, h) => sum + h.percentage, 0) / 100;

            if (topHolderPercent > this.config.rugPullThresholds.holderConcentration) {
                analysis.flags.push({
                    type: 'CONCENTRATED_HOLDERS',
                    severity: 'HIGH',
                    weight: 25,
                    message: `Top 10 holders own ${(topHolderPercent * 100).toFixed(1)}% of supply`
                });
                analysis.riskScore += 25;
            }
        }

        // 3. Check ownership
        if (!ownerRenounced) {
            analysis.flags.push({
                type: 'OWNER_NOT_RENOUNCED',
                severity: 'MEDIUM',
                weight: 15,
                message: 'Contract ownership not renounced - owner has control'
            });
            analysis.riskScore += 15;
        }

        // 4. Check for dangerous functions in contract
        if (contractCode) {
            const dangerousFunctions = this.analyzeContractCode(contractCode);
            for (const func of dangerousFunctions) {
                analysis.flags.push(func);
                analysis.riskScore += func.weight;
            }
        }

        // 5. Check liquidity depth
        if (liquidity < 10000) { // Less than $10k liquidity
            analysis.flags.push({
                type: 'LOW_LIQUIDITY',
                severity: 'HIGH',
                weight: 20,
                message: `Very low liquidity: $${liquidity}`
            });
            analysis.riskScore += 20;
        }

        // Determine risk level
        if (analysis.riskScore >= 60) {
            analysis.riskLevel = 'CRITICAL';
            analysis.passed = false;
            this.state.flaggedTokens.add(address.toLowerCase());
            this.state.statistics.rugPullsDetected++;
        } else if (analysis.riskScore >= 40) {
            analysis.riskLevel = 'HIGH';
        } else if (analysis.riskScore >= 20) {
            analysis.riskLevel = 'MEDIUM';
        }

        // Store analysis
        this.state.analyzedTokens.set(address.toLowerCase(), analysis);

        // Alert if critical
        if (analysis.riskLevel === 'CRITICAL') {
            this.triggerAlert('RUG_PULL_DETECTED', {
                severity: 'CRITICAL',
                token: { address, name, symbol },
                riskScore: analysis.riskScore,
                flags: analysis.flags
            });
        }

        return analysis;
    },

    /**
     * Analyze contract code for dangerous patterns
     */
    analyzeContractCode(code) {
        const dangers = [];

        // Check for mint function without limits
        if (this.config.scamPatterns.mintFunction.test(code)) {
            if (!code.includes('maxSupply') && !code.includes('_maxMint')) {
                dangers.push({
                    type: 'UNLIMITED_MINT',
                    severity: 'CRITICAL',
                    weight: 25,
                    message: 'Contract has unlimited mint function'
                });
            }
        }

        // Check for honeypot patterns
        if (code.includes('_isExcluded') || code.includes('_blacklist')) {
            dangers.push({
                type: 'BLACKLIST_FUNCTION',
                severity: 'HIGH',
                weight: 20,
                message: 'Contract can blacklist addresses (potential honeypot)'
            });
        }

        // Check for hidden fees
        const feeMatch = code.match(/fee\s*=\s*(\d+)/i);
        if (feeMatch && parseInt(feeMatch[1]) > 10) {
            dangers.push({
                type: 'HIGH_FEE',
                severity: 'HIGH',
                weight: 15,
                message: `Contract has high fee: ${feeMatch[1]}%`
            });
        }

        // Check for pause function
        if (code.includes('pause()') || code.includes('_pause')) {
            dangers.push({
                type: 'PAUSABLE',
                severity: 'MEDIUM',
                weight: 10,
                message: 'Contract can be paused by owner'
            });
        }

        // Check for proxy/upgradeable
        if (this.config.scamPatterns.proxyAdmin.test(code)) {
            dangers.push({
                type: 'UPGRADEABLE',
                severity: 'MEDIUM',
                weight: 10,
                message: 'Contract is upgradeable - code can be changed'
            });
        }

        return dangers;
    },

    /**
     * Check if token is safe to trade
     */
    async isTokenSafe(address) {
        const cached = this.state.analyzedTokens.get(address.toLowerCase());

        if (cached && Date.now() - cached.timestamp < 3600000) {
            return {
                safe: cached.passed,
                riskLevel: cached.riskLevel,
                riskScore: cached.riskScore,
                cached: true
            };
        }

        // Need fresh analysis
        return {
            safe: !this.state.flaggedTokens.has(address.toLowerCase()),
            riskLevel: 'UNKNOWN',
            needsAnalysis: true
        };
    },

    /**
     * Monitor liquidity changes
     */
    monitorLiquidityChange(token, oldLiquidity, newLiquidity) {
        const changePercent = (oldLiquidity - newLiquidity) / oldLiquidity;

        if (changePercent >= this.config.rugPullThresholds.liquidityDropPercent) {
            this.triggerAlert('LIQUIDITY_DRAIN', {
                severity: 'CRITICAL',
                token,
                oldLiquidity,
                newLiquidity,
                dropPercent: (changePercent * 100).toFixed(1),
                message: `Liquidity dropped ${(changePercent * 100).toFixed(1)}% - possible rug pull in progress`
            });

            this.state.flaggedTokens.add(token.toLowerCase());
            this.state.statistics.rugPullsDetected++;

            return { rugPull: true, dropPercent: changePercent };
        }

        return { rugPull: false };
    },

    // ============================================
    // UTILITIES
    // ============================================

    cleanOldData() {
        const cutoff = Date.now() - 604800000; // 7 days

        // Clean old bridge transactions
        this.state.bridgeTransactions = this.state.bridgeTransactions.filter(
            t => t.timestamp > cutoff
        );

        // Clean old token analyses
        for (const [address, analysis] of this.state.analyzedTokens) {
            if (analysis.timestamp < cutoff) {
                this.state.analyzedTokens.delete(address);
            }
        }
    },

    triggerAlert(type, data) {
        const alert = {
            type,
            timestamp: Date.now(),
            ...data
        };

        console.error(`[DefiSecurity] 🚨 ${type}:`, data.message || type);
        this.state.alerts.unshift(alert);

        if (this.state.alerts.length > 100) {
            this.state.alerts.pop();
        }

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('obelisk-defi-alert', {
                detail: alert
            }));
        }
    },

    /**
     * Get security status
     */
    getStatus() {
        return {
            bridgeTransactions: this.state.bridgeTransactions.length,
            analyzedTokens: this.state.analyzedTokens.size,
            flaggedTokens: this.state.flaggedTokens.size,
            recentAlerts: this.state.alerts.slice(0, 10),
            statistics: this.state.statistics
        };
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = DefiSecurity;
}

if (typeof window !== 'undefined') {
    window.DefiSecurity = DefiSecurity;
}
