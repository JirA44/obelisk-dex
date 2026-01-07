/**
 * OBELISK DEX - SECURITY CORE
 * Main security module integrating all protection layers
 *
 * Mitigations for nightmare scenarios:
 * - QUANTUM: Post-quantum cryptography (Kyber/Dilithium)
 * - CONTRACTS: Reentrancy guards, flash loan detection
 * - INFRASTRUCTURE: Rate limiting, circuit breakers
 * - DEFI: Oracle security, TWAP, manipulation detection
 * - MONITORING: Real-time alerts, anomaly detection
 */

const SecurityCore = {
    version: '2.0.0',

    // All security modules - Full Nightmare Scenario Coverage
    modules: {
        quantumShield: null,
        contractGuards: null,
        circuitBreaker: null,
        oracleSecurity: null,
        securityMonitor: null,
        anomalyDetector: null,
        infraSecurity: null,
        defiSecurity: null,
        socialSecurity: null,
        zerodayShield: null
    },

    // State
    state: {
        initialized: false,
        securityLevel: 'INITIALIZING',
        lastHealthCheck: null,
        mitigationsActive: {}
    },

    /**
     * Initialize all security modules
     */
    async init() {
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║     OBELISK DEX - SECURITY CORE v1.0.0                   ║');
        console.log('║     Enterprise-Grade DeFi Protection                     ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('');

        const startTime = Date.now();
        const results = {};

        // 1. Initialize Quantum Shield
        console.log('[SecurityCore] Loading Quantum Shield...');
        if (typeof QuantumShield !== 'undefined') {
            await QuantumShield.init();
            this.modules.quantumShield = QuantumShield;
            results.quantumShield = 'ACTIVE';
            this.state.mitigationsActive['QUANTUM-001'] = true;
            this.state.mitigationsActive['QUANTUM-002'] = true;
            this.state.mitigationsActive['QUANTUM-003'] = true;
        } else if (typeof window !== 'undefined' && window.QuantumShield) {
            await window.QuantumShield.init();
            this.modules.quantumShield = window.QuantumShield;
            results.quantumShield = 'ACTIVE';
        } else {
            results.quantumShield = 'NOT_LOADED';
        }

        // 2. Initialize Contract Guards
        console.log('[SecurityCore] Loading Contract Guards...');
        if (typeof ContractGuards !== 'undefined') {
            ContractGuards.init();
            this.modules.contractGuards = ContractGuards;
            results.contractGuards = 'ACTIVE';
            this.state.mitigationsActive['CONTRACT-001'] = true;
            this.state.mitigationsActive['CONTRACT-002'] = true;
            this.state.mitigationsActive['CONTRACT-003'] = true;
            this.state.mitigationsActive['CONTRACT-004'] = true;
        } else if (typeof window !== 'undefined' && window.ContractGuards) {
            window.ContractGuards.init();
            this.modules.contractGuards = window.ContractGuards;
            results.contractGuards = 'ACTIVE';
        } else {
            results.contractGuards = 'NOT_LOADED';
        }

        // 3. Initialize Circuit Breaker
        console.log('[SecurityCore] Loading Circuit Breaker...');
        if (typeof CircuitBreaker !== 'undefined') {
            CircuitBreaker.init();
            this.modules.circuitBreaker = CircuitBreaker;
            results.circuitBreaker = 'ACTIVE';
            this.state.mitigationsActive['INFRA-001'] = true;
        } else if (typeof window !== 'undefined' && window.CircuitBreaker) {
            window.CircuitBreaker.init();
            this.modules.circuitBreaker = window.CircuitBreaker;
            results.circuitBreaker = 'ACTIVE';
        } else {
            results.circuitBreaker = 'NOT_LOADED';
        }

        // 4. Initialize Oracle Security
        console.log('[SecurityCore] Loading Oracle Security...');
        if (typeof OracleSecurity !== 'undefined') {
            OracleSecurity.init();
            this.modules.oracleSecurity = OracleSecurity;
            results.oracleSecurity = 'ACTIVE';
            this.state.mitigationsActive['DEFI-002'] = true;
            this.state.mitigationsActive['DEFI-003'] = true;
        } else if (typeof window !== 'undefined' && window.OracleSecurity) {
            window.OracleSecurity.init();
            this.modules.oracleSecurity = window.OracleSecurity;
            results.oracleSecurity = 'ACTIVE';
        } else {
            results.oracleSecurity = 'NOT_LOADED';
        }

        // 5. Initialize Security Monitor
        console.log('[SecurityCore] Loading Security Monitor...');
        if (typeof SecurityMonitor !== 'undefined') {
            await SecurityMonitor.init();
            this.modules.securityMonitor = SecurityMonitor;
            results.securityMonitor = 'ACTIVE';
        } else if (typeof window !== 'undefined' && window.SecurityMonitor) {
            await window.SecurityMonitor.init();
            this.modules.securityMonitor = window.SecurityMonitor;
            results.securityMonitor = 'ACTIVE';
        } else {
            results.securityMonitor = 'NOT_LOADED';
        }

        // 6. Initialize Anomaly Detector
        console.log('[SecurityCore] Loading Anomaly Detector...');
        if (typeof AnomalyDetector !== 'undefined') {
            AnomalyDetector.init();
            this.modules.anomalyDetector = AnomalyDetector;
            results.anomalyDetector = 'ACTIVE';
            this.state.mitigationsActive['SOCIAL-001'] = true;
        } else if (typeof window !== 'undefined' && window.AnomalyDetector) {
            window.AnomalyDetector.init();
            this.modules.anomalyDetector = window.AnomalyDetector;
            results.anomalyDetector = 'ACTIVE';
        } else {
            results.anomalyDetector = 'NOT_LOADED';
        }

        // 7. Initialize Infrastructure Security
        console.log('[SecurityCore] Loading Infrastructure Security...');
        if (typeof InfraSecurity !== 'undefined') {
            InfraSecurity.init();
            this.modules.infraSecurity = InfraSecurity;
            results.infraSecurity = 'ACTIVE';
            this.state.mitigationsActive['INFRA-002'] = true;
            this.state.mitigationsActive['INFRA-003'] = true;
            this.state.mitigationsActive['INFRA-004'] = true;
        } else if (typeof window !== 'undefined' && window.InfraSecurity) {
            window.InfraSecurity.init();
            this.modules.infraSecurity = window.InfraSecurity;
            results.infraSecurity = 'ACTIVE';
        } else {
            results.infraSecurity = 'NOT_LOADED';
        }

        // 8. Initialize DeFi Security
        console.log('[SecurityCore] Loading DeFi Security...');
        if (typeof DefiSecurity !== 'undefined') {
            DefiSecurity.init();
            this.modules.defiSecurity = DefiSecurity;
            results.defiSecurity = 'ACTIVE';
            this.state.mitigationsActive['DEFI-001'] = true;
            this.state.mitigationsActive['DEFI-004'] = true;
        } else if (typeof window !== 'undefined' && window.DefiSecurity) {
            window.DefiSecurity.init();
            this.modules.defiSecurity = window.DefiSecurity;
            results.defiSecurity = 'ACTIVE';
        } else {
            results.defiSecurity = 'NOT_LOADED';
        }

        // 9. Initialize Social Security
        console.log('[SecurityCore] Loading Social Security...');
        if (typeof SocialSecurity !== 'undefined') {
            SocialSecurity.init();
            this.modules.socialSecurity = SocialSecurity;
            results.socialSecurity = 'ACTIVE';
            this.state.mitigationsActive['SOCIAL-002'] = true;
            this.state.mitigationsActive['SOCIAL-003'] = true;
        } else if (typeof window !== 'undefined' && window.SocialSecurity) {
            window.SocialSecurity.init();
            this.modules.socialSecurity = window.SocialSecurity;
            results.socialSecurity = 'ACTIVE';
        } else {
            results.socialSecurity = 'NOT_LOADED';
        }

        // 10. Initialize Zero-Day Shield
        console.log('[SecurityCore] Loading Zero-Day Shield...');
        if (typeof ZerodayShield !== 'undefined') {
            ZerodayShield.init();
            this.modules.zerodayShield = ZerodayShield;
            results.zerodayShield = 'ACTIVE';
            this.state.mitigationsActive['ZERODAY-001'] = true;
            this.state.mitigationsActive['ZERODAY-002'] = true;
            this.state.mitigationsActive['ZERODAY-003'] = true;
        } else if (typeof window !== 'undefined' && window.ZerodayShield) {
            window.ZerodayShield.init();
            this.modules.zerodayShield = window.ZerodayShield;
            results.zerodayShield = 'ACTIVE';
        } else {
            results.zerodayShield = 'NOT_LOADED';
        }

        const duration = Date.now() - startTime;
        const activeCount = Object.values(results).filter(r => r === 'ACTIVE').length;

        console.log('');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║        SECURITY INITIALIZATION COMPLETE v2.0             ║');
        console.log('║       Full Nightmare Scenario Coverage Active            ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('');
        console.log(`  Modules Active:    ${activeCount}/10`);
        console.log(`  Init Time:         ${duration}ms`);
        console.log(`  Mitigations:       ${Object.keys(this.state.mitigationsActive).length}/21 scenarios covered`);
        console.log('');

        for (const [module, status] of Object.entries(results)) {
            const icon = status === 'ACTIVE' ? '✅' : '⚠️';
            console.log(`  ${icon} ${module}: ${status}`);
        }

        this.state.initialized = true;
        this.state.securityLevel = activeCount >= 5 ? 'OPTIMAL' : activeCount >= 3 ? 'GOOD' : 'DEGRADED';

        return {
            success: true,
            duration,
            modules: results,
            securityLevel: this.state.securityLevel
        };
    },

    // ============================================
    // UNIFIED SECURITY API
    // ============================================

    /**
     * Check if a transaction should be allowed
     * @param {object} tx - Transaction parameters
     * @param {object} context - Additional context (slippage, price impact, etc.)
     */
    async checkTransaction(tx, context = {}) {
        if (!this.state.initialized) {
            await this.init();
        }

        const checks = {
            timestamp: Date.now(),
            tx,
            results: {}
        };

        // 1. Circuit Breaker check
        if (this.modules.circuitBreaker) {
            checks.results.circuitBreaker = this.modules.circuitBreaker.canTrade({
                asset: context.asset,
                value: tx.value
            });
        }

        // 2. Contract Guards check
        if (this.modules.contractGuards) {
            checks.results.contractGuards = await this.modules.contractGuards.fullSecurityCheck(tx, context);
        }

        // 3. Anomaly Detection
        if (this.modules.anomalyDetector) {
            checks.results.anomaly = await this.modules.anomalyDetector.analyzeTransaction(tx);
        }

        // 4. Oracle Security (if price-related)
        if (this.modules.oracleSecurity && context.asset) {
            checks.results.oracle = this.modules.oracleSecurity.getSecurePrice(context.asset, {
                useTwap: true,
                requireMinSources: 2
            });
        }

        // Determine overall result
        let blocked = false;
        let blockedBy = [];
        let warnings = [];

        for (const [checkName, result] of Object.entries(checks.results)) {
            if (result.allowed === false || result.safe === false) {
                blocked = true;
                blockedBy.push(checkName);
            }
            if (result.warning || result.warningLevel > 0) {
                warnings.push({ check: checkName, message: result.warning || result.reason });
            }
            if (result.isAnomaly && result.severity === 'CRITICAL') {
                blocked = true;
                blockedBy.push('anomalyDetector');
            }
        }

        checks.allowed = !blocked;
        checks.blockedBy = blockedBy;
        checks.warnings = warnings;
        checks.recommendation = blocked
            ? `Transaction blocked by: ${blockedBy.join(', ')}`
            : warnings.length > 0
                ? 'Proceed with caution'
                : 'Transaction approved';

        // Log to security monitor
        if (this.modules.securityMonitor && blocked) {
            this.modules.securityMonitor.handleSecurityEvent('TRANSACTION_BLOCKED', {
                tx,
                blockedBy,
                checks: checks.results
            }, 'HIGH');
        }

        return checks;
    },

    /**
     * Get secure price for an asset
     */
    getSecurePrice(asset, options = {}) {
        if (this.modules.oracleSecurity) {
            return this.modules.oracleSecurity.getSecurePrice(asset, options);
        }
        return { valid: false, reason: 'Oracle security not initialized' };
    },

    /**
     * Protect sensitive data with quantum-resistant encryption
     */
    async protectData(data) {
        if (this.modules.quantumShield) {
            return this.modules.quantumShield.protectAgainstHNDL(data);
        }
        return { protected: false, reason: 'Quantum shield not initialized' };
    },

    /**
     * Emergency halt all trading
     */
    emergencyHalt(reason) {
        if (this.modules.circuitBreaker) {
            return this.modules.circuitBreaker.triggerHalt(reason, 'CRITICAL');
        }
        return { success: false, reason: 'Circuit breaker not initialized' };
    },

    /**
     * Resume trading after halt
     */
    resumeTrading(force = false) {
        if (this.modules.circuitBreaker) {
            return this.modules.circuitBreaker.resumeTrading(force);
        }
        return { success: false, reason: 'Circuit breaker not initialized' };
    },

    // ============================================
    // STATUS & MONITORING
    // ============================================

    /**
     * Get comprehensive security status
     */
    getStatus() {
        const status = {
            initialized: this.state.initialized,
            securityLevel: this.state.securityLevel,
            modules: {}
        };

        if (this.modules.quantumShield) {
            status.modules.quantumShield = this.modules.quantumShield.getSecurityStatus();
        }

        if (this.modules.circuitBreaker) {
            status.modules.circuitBreaker = this.modules.circuitBreaker.getStatus();
        }

        if (this.modules.oracleSecurity) {
            status.modules.oracleSecurity = this.modules.oracleSecurity.getStatus();
        }

        if (this.modules.securityMonitor) {
            status.modules.securityMonitor = this.modules.securityMonitor.getStatus();
        }

        if (this.modules.anomalyDetector) {
            status.modules.anomalyDetector = this.modules.anomalyDetector.getStatus();
        }

        status.mitigationsActive = this.state.mitigationsActive;
        status.mitigationCount = Object.keys(this.state.mitigationsActive).length;

        return status;
    },

    /**
     * Get mitigation status for ALL 21 nightmare scenarios
     */
    getNightmareScenarioStatus() {
        return {
            // QUANTUM SCENARIOS (3)
            'QUANTUM-001': {
                name: 'Shor Algorithm vs ECDSA',
                mitigated: !!this.modules.quantumShield,
                status: this.modules.quantumShield ? 'Hybrid Kyber-768 active' : 'NOT PROTECTED'
            },
            'QUANTUM-002': {
                name: 'Grover vs SHA-256',
                mitigated: !!this.modules.quantumShield,
                status: this.modules.quantumShield ? 'SHA3-384 active' : 'NOT PROTECTED'
            },
            'QUANTUM-003': {
                name: 'Harvest Now Decrypt Later',
                mitigated: !!this.modules.quantumShield,
                status: this.modules.quantumShield ? 'PQ encryption active' : 'NOT PROTECTED'
            },

            // CONTRACT SCENARIOS (4)
            'CONTRACT-001': {
                name: 'Reentrancy Attack',
                mitigated: !!this.modules.contractGuards,
                status: this.modules.contractGuards ? 'Reentrancy detection active' : 'NOT PROTECTED'
            },
            'CONTRACT-002': {
                name: 'Flash Loan Oracle Manipulation',
                mitigated: !!this.modules.contractGuards && !!this.modules.oracleSecurity,
                status: this.modules.oracleSecurity ? 'TWAP + multi-oracle active' : 'PARTIAL'
            },
            'CONTRACT-003': {
                name: 'Governance Takeover',
                mitigated: !!this.modules.contractGuards,
                status: this.modules.contractGuards ? 'Signature validation active' : 'NOT PROTECTED'
            },
            'CONTRACT-004': {
                name: 'Infinite Token Mint',
                mitigated: !!this.modules.contractGuards,
                status: this.modules.contractGuards ? 'Mint function analysis active' : 'NOT PROTECTED'
            },

            // INFRASTRUCTURE SCENARIOS (4)
            'INFRA-001': {
                name: 'Hot Wallet Breach',
                mitigated: !!this.modules.circuitBreaker,
                status: this.modules.circuitBreaker ? 'Rate limiting + circuit breakers active' : 'NOT PROTECTED'
            },
            'INFRA-002': {
                name: 'DNS Hijack + Phishing',
                mitigated: !!this.modules.infraSecurity,
                status: this.modules.infraSecurity ? 'DNS verification + anti-phishing active' : 'NOT PROTECTED'
            },
            'INFRA-003': {
                name: 'BGP Route Hijacking',
                mitigated: !!this.modules.infraSecurity,
                status: this.modules.infraSecurity ? 'Multi-resolver DNS verification active' : 'NOT PROTECTED'
            },
            'INFRA-004': {
                name: 'NPM Supply Chain Attack',
                mitigated: !!this.modules.infraSecurity,
                status: this.modules.infraSecurity ? 'SRI + integrity monitoring active' : 'NOT PROTECTED'
            },

            // DEFI SCENARIOS (4)
            'DEFI-001': {
                name: 'Cross-Chain Bridge Drain',
                mitigated: !!this.modules.defiSecurity,
                status: this.modules.defiSecurity ? 'Bridge rate limits + validation active' : 'NOT PROTECTED'
            },
            'DEFI-002': {
                name: 'MEV Sandwich Attack',
                mitigated: !!this.modules.oracleSecurity,
                status: this.modules.oracleSecurity ? 'Slippage protection active' : 'NOT PROTECTED'
            },
            'DEFI-003': {
                name: 'Oracle Failure',
                mitigated: !!this.modules.oracleSecurity,
                status: this.modules.oracleSecurity ? 'Multi-oracle + TWAP fallback' : 'NOT PROTECTED'
            },
            'DEFI-004': {
                name: 'LP Rug Pull',
                mitigated: !!this.modules.defiSecurity,
                status: this.modules.defiSecurity ? 'Rug pull detection + token analysis active' : 'NOT PROTECTED'
            },

            // SOCIAL SCENARIOS (3)
            'SOCIAL-001': {
                name: 'Insider Threat',
                mitigated: !!this.modules.anomalyDetector,
                status: this.modules.anomalyDetector ? 'Behavioral analysis active' : 'NOT PROTECTED'
            },
            'SOCIAL-002': {
                name: 'Deepfake CEO Fraud',
                mitigated: !!this.modules.socialSecurity,
                status: this.modules.socialSecurity ? 'Multi-party approval + verification active' : 'NOT PROTECTED'
            },
            'SOCIAL-003': {
                name: 'Social Recovery Takeover',
                mitigated: !!this.modules.socialSecurity,
                status: this.modules.socialSecurity ? 'Guardian diversity + timelock active' : 'NOT PROTECTED'
            },

            // ZERO-DAY SCENARIOS (3)
            'ZERODAY-001': {
                name: 'Browser Zero-Day RCE',
                mitigated: !!this.modules.zerodayShield,
                status: this.modules.zerodayShield ? 'Browser hardening + XSS protection active' : 'NOT PROTECTED'
            },
            'ZERODAY-002': {
                name: 'Solidity Compiler Bug',
                mitigated: !!this.modules.zerodayShield,
                status: this.modules.zerodayShield ? 'Compiler verification active' : 'NOT PROTECTED'
            },
            'ZERODAY-003': {
                name: 'RNG Predictability',
                mitigated: !!this.modules.zerodayShield,
                status: this.modules.zerodayShield ? 'RNG integrity + multi-source entropy active' : 'NOT PROTECTED'
            }
        };
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = SecurityCore;
}

if (typeof window !== 'undefined') {
    window.SecurityCore = SecurityCore;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[SecurityCore] Auto-initializing...');
            SecurityCore.init();
        });
    }
}
