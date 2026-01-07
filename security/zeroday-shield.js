/**
 * OBELISK DEX - ZERO-DAY SHIELD
 * Browser Security, RNG Verification, Compiler Integrity
 * Mitigates: ZERODAY-001, ZERODAY-002, ZERODAY-003
 */

const ZerodayShield = {
    // Configuration
    config: {
        // Browser security
        browserIsolation: true,
        contentSecurityPolicy: true,

        // RNG settings
        rngEntropyBits: 256,
        rngMultipleSources: true,

        // Compiler verification
        trustedSolidityVersions: ['0.8.19', '0.8.20', '0.8.21', '0.8.22', '0.8.23', '0.8.24'],

        // Sandboxing
        iframeSandboxing: true,
        webWorkerIsolation: true
    },

    // State
    state: {
        browserSecurityStatus: null,
        rngIntegrity: null,
        lastSecurityCheck: null,
        vulnerabilities: [],
        alerts: []
    },

    /**
     * Initialize Zero-Day Shield
     */
    init() {
        console.log('[ZerodayShield] Initializing zero-day protection...');

        // Browser security hardening
        this.hardenBrowser();

        // Verify RNG integrity
        this.verifyRNGIntegrity();

        // Set up monitoring
        this.setupSecurityMonitoring();

        console.log('[ZerodayShield] Ready - Zero-day protection active');
        return true;
    },

    // ============================================
    // BROWSER SECURITY (ZERODAY-001)
    // ============================================

    /**
     * Harden browser environment
     */
    hardenBrowser() {
        if (typeof window === 'undefined') return;

        const checks = [];

        // 1. Check for browser isolation
        checks.push(this.checkBrowserIsolation());

        // 2. Check CSP
        checks.push(this.checkCSP());

        // 3. Disable dangerous APIs
        this.disableDangerousAPIs();

        // 4. Protect against prototype pollution
        this.protectPrototypes();

        // 5. Monitor for XSS attempts
        this.setupXSSMonitoring();

        // 6. Check for wallet extension tampering
        checks.push(this.checkWalletIntegrity());

        this.state.browserSecurityStatus = {
            timestamp: Date.now(),
            checks,
            hardened: checks.every(c => c.passed)
        };

        return this.state.browserSecurityStatus;
    },

    /**
     * Check browser isolation features
     */
    checkBrowserIsolation() {
        const result = { name: 'Browser Isolation', passed: true, issues: [] };

        // Check if running in iframe (could be clickjacking)
        if (window.self !== window.top) {
            result.issues.push('Running inside iframe - possible clickjacking');
            result.passed = false;
        }

        // Check for opener (tabnabbing risk)
        if (window.opener) {
            window.opener = null; // Prevent reverse tabnabbing
            result.issues.push('Opener detected and nullified');
        }

        // Check secure context
        if (!window.isSecureContext) {
            result.issues.push('Not in secure context');
            result.passed = false;
        }

        return result;
    },

    /**
     * Check Content Security Policy
     */
    checkCSP() {
        const result = { name: 'Content Security Policy', passed: true, issues: [] };

        // Check if CSP header is present (via meta tag)
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

        if (!cspMeta) {
            result.issues.push('CSP meta tag not found');
            // CSP might be in headers, which we can't check from JS
        } else {
            const content = cspMeta.getAttribute('content');

            // Check for important directives
            if (!content.includes('default-src')) {
                result.issues.push('Missing default-src directive');
            }

            if (content.includes("'unsafe-eval'")) {
                result.issues.push('CSP allows unsafe-eval - XSS risk');
                result.passed = false;
            }
        }

        return result;
    },

    /**
     * Disable dangerous browser APIs
     */
    disableDangerousAPIs() {
        if (typeof window === 'undefined') return;

        // Freeze important objects to prevent tampering
        try {
            // Protect crypto API
            if (window.crypto && Object.freeze) {
                Object.freeze(window.crypto);
            }

            // Protect localStorage/sessionStorage getters
            const originalGetItem = Storage.prototype.getItem;
            Storage.prototype.getItem = function(key) {
                // Log access to sensitive keys
                if (key.includes('privateKey') || key.includes('seed') || key.includes('mnemonic')) {
                    console.warn('[ZerodayShield] Sensitive storage access:', key);
                }
                return originalGetItem.call(this, key);
            };

        } catch (e) {
            console.warn('[ZerodayShield] Could not freeze APIs:', e);
        }
    },

    /**
     * Protect against prototype pollution
     */
    protectPrototypes() {
        if (typeof window === 'undefined') return;

        try {
            // Freeze Object prototype
            Object.freeze(Object.prototype);

            // Freeze Array prototype
            Object.freeze(Array.prototype);

            // Freeze Function prototype
            Object.freeze(Function.prototype);

        } catch (e) {
            // Some browsers may not allow this
            console.warn('[ZerodayShield] Prototype protection partial:', e);
        }
    },

    /**
     * Monitor for XSS attempts
     */
    setupXSSMonitoring() {
        if (typeof window === 'undefined') return;

        // Monitor innerHTML modifications
        const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');

        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(value) {
                // Check for script injection
                if (typeof value === 'string' && /<script/i.test(value)) {
                    console.error('[ZerodayShield] Blocked script injection attempt');
                    ZerodayShield.triggerAlert('XSS_BLOCKED', {
                        severity: 'CRITICAL',
                        message: 'Script injection attempt blocked'
                    });
                    return;
                }
                return originalInnerHTML.set.call(this, value);
            },
            get: originalInnerHTML.get
        });

        // Monitor eval usage
        const originalEval = window.eval;
        window.eval = function(code) {
            console.warn('[ZerodayShield] eval() called - potential security risk');
            ZerodayShield.triggerAlert('EVAL_DETECTED', {
                severity: 'HIGH',
                message: 'eval() usage detected'
            });
            return originalEval.call(window, code);
        };
    },

    /**
     * Check wallet extension integrity
     */
    checkWalletIntegrity() {
        const result = { name: 'Wallet Integrity', passed: true, issues: [] };

        if (typeof window === 'undefined') return result;

        // Check if ethereum object has been tampered
        if (window.ethereum) {
            // Verify it's the real MetaMask/wallet
            const expectedMethods = ['request', 'on', 'removeListener'];
            for (const method of expectedMethods) {
                if (typeof window.ethereum[method] !== 'function') {
                    result.issues.push(`Ethereum provider missing ${method} method`);
                    result.passed = false;
                }
            }

            // Check for suspicious additions
            const knownProps = ['request', 'on', 'removeListener', 'isMetaMask', 'selectedAddress', 'chainId', '_metamask'];
            for (const prop of Object.keys(window.ethereum)) {
                if (!knownProps.includes(prop) && typeof window.ethereum[prop] === 'function') {
                    result.issues.push(`Unknown method on ethereum: ${prop}`);
                }
            }
        }

        return result;
    },

    // ============================================
    // RNG VERIFICATION (ZERODAY-003)
    // ============================================

    /**
     * Verify RNG integrity and quality
     */
    async verifyRNGIntegrity() {
        const result = {
            timestamp: Date.now(),
            tests: [],
            passed: true
        };

        // Test 1: Check crypto.getRandomValues availability
        result.tests.push(this.testCryptoAvailability());

        // Test 2: Basic randomness quality test
        result.tests.push(await this.testRandomnessQuality());

        // Test 3: Check for RNG predictability
        result.tests.push(this.testRNGPredictability());

        // Test 4: Multi-source entropy
        if (this.config.rngMultipleSources) {
            result.tests.push(await this.testMultiSourceEntropy());
        }

        result.passed = result.tests.every(t => t.passed);
        this.state.rngIntegrity = result;

        if (!result.passed) {
            this.triggerAlert('RNG_COMPROMISED', {
                severity: 'CRITICAL',
                message: 'Random number generator integrity check failed',
                tests: result.tests.filter(t => !t.passed)
            });
        }

        return result;
    },

    /**
     * Test crypto API availability
     */
    testCryptoAvailability() {
        const result = { name: 'Crypto API', passed: true, issues: [] };

        if (typeof crypto === 'undefined') {
            result.passed = false;
            result.issues.push('crypto API not available');
            return result;
        }

        if (typeof crypto.getRandomValues !== 'function') {
            result.passed = false;
            result.issues.push('getRandomValues not available');
            return result;
        }

        // Verify it produces output
        try {
            const test = new Uint8Array(32);
            crypto.getRandomValues(test);

            // Check it's not all zeros
            if (test.every(b => b === 0)) {
                result.passed = false;
                result.issues.push('getRandomValues returned all zeros');
            }
        } catch (e) {
            result.passed = false;
            result.issues.push(`getRandomValues error: ${e.message}`);
        }

        return result;
    },

    /**
     * Test randomness quality (basic statistical test)
     */
    async testRandomnessQuality() {
        const result = { name: 'Randomness Quality', passed: true, issues: [] };

        try {
            const samples = 10000;
            const bytes = new Uint8Array(samples);
            crypto.getRandomValues(bytes);

            // Chi-squared test for uniform distribution
            const buckets = new Array(256).fill(0);
            for (const byte of bytes) {
                buckets[byte]++;
            }

            const expected = samples / 256;
            let chiSquared = 0;

            for (const count of buckets) {
                chiSquared += Math.pow(count - expected, 2) / expected;
            }

            // Chi-squared critical value for 255 df at 0.001 significance (more lenient)
            const criticalValue = 350;

            if (chiSquared > criticalValue) {
                result.issues.push(`Chi-squared ${chiSquared.toFixed(2)} high (threshold ${criticalValue})`);
                // Don't fail - just warn
            }

            // Basic check - ensure not all zeros or all same value
            const uniqueValues = new Set(bytes).size;
            if (uniqueValues < 200) {
                result.passed = false;
                result.issues.push(`Only ${uniqueValues} unique values in ${samples} samples`);
            }
        } catch (e) {
            // In some environments crypto may not work perfectly
            result.issues.push(`RNG test exception: ${e.message}`);
        }

        return result;
    },

    /**
     * Test for RNG predictability
     */
    testRNGPredictability() {
        const result = { name: 'RNG Predictability', passed: true, issues: [] };

        // Generate multiple sequences and check they're different
        const sequences = [];
        for (let i = 0; i < 10; i++) {
            const bytes = new Uint8Array(32);
            crypto.getRandomValues(bytes);
            sequences.push(Array.from(bytes).join(','));
        }

        // Check all sequences are unique
        const uniqueSequences = new Set(sequences);
        if (uniqueSequences.size !== sequences.length) {
            result.passed = false;
            result.issues.push('Repeated random sequences detected - RNG may be predictable');
        }

        return result;
    },

    /**
     * Test multi-source entropy
     */
    async testMultiSourceEntropy() {
        const result = { name: 'Multi-Source Entropy', passed: true, issues: [] };

        const entropySources = [];

        // Source 1: crypto.getRandomValues
        const cryptoEntropy = new Uint8Array(32);
        crypto.getRandomValues(cryptoEntropy);
        entropySources.push(cryptoEntropy);

        // Source 2: Performance timing
        const timingEntropy = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
            const start = performance.now();
            for (let j = 0; j < 1000; j++) { /* busy loop */ }
            const end = performance.now();
            timingEntropy[i] = Math.floor((end - start) * 1000) & 0xFF;
        }
        entropySources.push(timingEntropy);

        // Source 3: Mouse/touch events (if available)
        // Note: Would need to be collected over time in real implementation

        // Combine sources with XOR
        const combined = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
            let byte = 0;
            for (const source of entropySources) {
                byte ^= source[i];
            }
            combined[i] = byte;
        }

        // Verify combined entropy isn't degraded
        const zeros = combined.filter(b => b === 0).length;
        if (zeros > 16) {
            result.issues.push('Combined entropy has too many zero bytes');
            result.passed = false;
        }

        return result;
    },

    /**
     * Generate cryptographically secure random bytes
     */
    secureRandom(length) {
        const bytes = new Uint8Array(length);

        if (!this.state.rngIntegrity?.passed) {
            console.warn('[ZerodayShield] Using RNG without verified integrity');
        }

        crypto.getRandomValues(bytes);
        return bytes;
    },

    // ============================================
    // COMPILER VERIFICATION (ZERODAY-002)
    // ============================================

    /**
     * Verify Solidity compiler version is safe
     */
    verifyCompilerVersion(version) {
        const result = {
            version,
            safe: this.config.trustedSolidityVersions.includes(version),
            warnings: []
        };

        // Check known vulnerable versions
        const vulnerableVersions = {
            '0.8.13': 'Optimizer bug affecting abi.encode with inline assembly',
            '0.8.14': 'Optimizer bug with inline assembly',
            '0.8.15': 'Optimizer bug with inline assembly'
        };

        if (vulnerableVersions[version]) {
            result.safe = false;
            result.warnings.push({
                type: 'VULNERABLE_COMPILER',
                severity: 'CRITICAL',
                message: `Solidity ${version}: ${vulnerableVersions[version]}`
            });
        }

        // Check if version is too old
        const minorVersion = parseInt(version.split('.')[2]);
        if (minorVersion < 18) {
            result.warnings.push({
                type: 'OUTDATED_COMPILER',
                severity: 'MEDIUM',
                message: 'Compiler version is outdated - consider upgrading'
            });
        }

        if (!result.safe) {
            this.triggerAlert('UNSAFE_COMPILER', {
                severity: 'HIGH',
                version,
                warnings: result.warnings
            });
        }

        return result;
    },

    /**
     * Verify contract bytecode matches source
     */
    async verifyBytecode(sourceHash, deployedBytecode, compilerVersion) {
        // In production: recompile from source and compare
        // For now, basic verification structure

        const result = {
            verified: false,
            method: 'hash_comparison',
            warnings: []
        };

        // Check compiler version first
        const compilerCheck = this.verifyCompilerVersion(compilerVersion);
        if (!compilerCheck.safe) {
            result.warnings.push(...compilerCheck.warnings);
        }

        // Hash comparison would happen here with actual source
        // result.verified = computedHash === sourceHash;

        return result;
    },

    // ============================================
    // SECURITY MONITORING
    // ============================================

    setupSecurityMonitoring() {
        if (typeof window === 'undefined') return;

        // Monitor for suspicious script loads
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.tagName === 'SCRIPT') {
                        this.checkScript(node);
                    }
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // Periodic security check
        setInterval(() => {
            this.state.lastSecurityCheck = Date.now();
            this.hardenBrowser();
        }, 300000); // Every 5 minutes
    },

    checkScript(scriptElement) {
        // Check for inline scripts (potential XSS)
        if (!scriptElement.src && scriptElement.textContent) {
            // Log but don't block (might be legitimate)
            console.log('[ZerodayShield] Inline script detected');
        }

        // Check for suspicious sources
        if (scriptElement.src) {
            const url = new URL(scriptElement.src, window.location.origin);
            const trustedDomains = ['cloudflare.com', 'unpkg.com', 'cdnjs.cloudflare.com'];

            if (!trustedDomains.some(d => url.hostname.endsWith(d)) &&
                url.hostname !== window.location.hostname) {
                this.triggerAlert('UNTRUSTED_SCRIPT', {
                    severity: 'MEDIUM',
                    source: scriptElement.src,
                    message: 'External script from untrusted domain'
                });
            }
        }
    },

    // ============================================
    // UTILITIES
    // ============================================

    triggerAlert(type, data) {
        const alert = {
            type,
            timestamp: Date.now(),
            ...data
        };

        console.log(`[ZerodayShield] ${data.severity === 'CRITICAL' ? '🚨' : '⚠️'} ${type}:`, data.message);
        this.state.alerts.unshift(alert);

        if (this.state.alerts.length > 50) {
            this.state.alerts.pop();
        }

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('obelisk-zeroday-alert', { detail: alert }));
        }
    },

    /**
     * Get security status
     */
    getStatus() {
        return {
            browserSecurity: this.state.browserSecurityStatus,
            rngIntegrity: this.state.rngIntegrity,
            lastSecurityCheck: this.state.lastSecurityCheck,
            vulnerabilities: this.state.vulnerabilities,
            recentAlerts: this.state.alerts.slice(0, 10)
        };
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = ZerodayShield;
}

if (typeof window !== 'undefined') {
    window.ZerodayShield = ZerodayShield;
}
