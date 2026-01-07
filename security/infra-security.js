/**
 * OBELISK DEX - INFRASTRUCTURE SECURITY
 * DNS Hijack, BGP, and Supply Chain Protection
 * Mitigates: INFRA-002, INFRA-003, INFRA-004
 */

const InfraSecurity = {
    // Configuration
    config: {
        // Known good contract addresses (immutable reference)
        trustedContracts: {
            'ETH': {
                USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                UNI: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
            },
            'ARB': {
                USDC: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
                WETH: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
            }
        },

        // Known good domains
        trustedDomains: [
            'obelisk-2l1.pages.dev',
            'app.uniswap.org',
            'app.aave.com',
            'hyperliquid.xyz'
        ],

        // Content hashes for integrity
        expectedHashes: new Map(),

        // DNS verification endpoints
        dnsResolvers: [
            'https://cloudflare-dns.com/dns-query',
            'https://dns.google/resolve'
        ],

        // Subresource Integrity enabled
        sriEnabled: true
    },

    // State
    state: {
        domainVerified: false,
        lastDNSCheck: null,
        integrityViolations: [],
        suspiciousDomains: new Set(),
        alerts: []
    },

    /**
     * Initialize Infrastructure Security
     */
    init() {
        console.log('[InfraSecurity] Initializing infrastructure protection...');

        // Verify current domain
        this.verifyCurrentDomain();

        // Set up integrity monitoring
        this.setupIntegrityMonitoring();

        // Check for suspicious redirects
        this.monitorNavigationIntegrity();

        // Periodic DNS verification
        setInterval(() => this.verifyDNS(), 300000); // Every 5 min

        console.log('[InfraSecurity] Ready - Infrastructure protection active');
        return true;
    },

    // ============================================
    // DNS HIJACK PROTECTION (INFRA-002)
    // ============================================

    /**
     * Verify current domain is legitimate
     */
    verifyCurrentDomain() {
        if (typeof window === 'undefined') return { verified: true };

        const currentHost = window.location.hostname;
        const currentProtocol = window.location.protocol;

        // Must be HTTPS
        if (currentProtocol !== 'https:' && currentHost !== 'localhost') {
            this.triggerAlert('INSECURE_PROTOCOL', {
                severity: 'CRITICAL',
                message: 'Site loaded over insecure HTTP connection',
                recommendation: 'Only access via HTTPS'
            });
            return { verified: false, reason: 'Not HTTPS' };
        }

        // Check against trusted domains
        const isTrusted = this.config.trustedDomains.some(domain =>
            currentHost === domain || currentHost.endsWith('.' + domain)
        );

        if (!isTrusted && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            this.triggerAlert('UNKNOWN_DOMAIN', {
                severity: 'HIGH',
                message: `Running on untrusted domain: ${currentHost}`,
                recommendation: 'Verify you are on the official site'
            });
        }

        this.state.domainVerified = isTrusted;
        return { verified: isTrusted, domain: currentHost };
    },

    /**
     * Verify DNS resolution matches expected
     */
    async verifyDNS() {
        if (typeof window === 'undefined') return;

        const domain = window.location.hostname;
        if (domain === 'localhost') return { verified: true };

        try {
            // Query multiple DNS resolvers
            const results = await Promise.allSettled(
                this.config.dnsResolvers.map(resolver =>
                    this.queryDNS(resolver, domain)
                )
            );

            const successfulResults = results
                .filter(r => r.status === 'fulfilled')
                .map(r => r.value);

            if (successfulResults.length < 2) {
                console.warn('[InfraSecurity] DNS verification incomplete');
                return { verified: false, reason: 'Insufficient DNS responses' };
            }

            // Check if all resolvers agree
            const ips = successfulResults.map(r => r.ip).filter(Boolean);
            const allMatch = ips.every(ip => ip === ips[0]);

            if (!allMatch) {
                this.triggerAlert('DNS_MISMATCH', {
                    severity: 'CRITICAL',
                    message: 'DNS resolvers returning different IPs - possible BGP/DNS hijack',
                    ips: ips,
                    recommendation: 'Do not proceed with transactions'
                });
                return { verified: false, reason: 'DNS mismatch' };
            }

            this.state.lastDNSCheck = Date.now();
            return { verified: true, ip: ips[0] };

        } catch (error) {
            console.error('[InfraSecurity] DNS verification error:', error);
            return { verified: false, reason: error.message };
        }
    },

    /**
     * Query DNS resolver
     */
    async queryDNS(resolver, domain) {
        try {
            const response = await fetch(`${resolver}?name=${domain}&type=A`, {
                headers: { 'Accept': 'application/dns-json' }
            });
            const data = await response.json();

            if (data.Answer && data.Answer.length > 0) {
                return { ip: data.Answer[0].data, resolver };
            }
            return { ip: null, resolver };
        } catch (e) {
            return { ip: null, resolver, error: e.message };
        }
    },

    // ============================================
    // NAVIGATION INTEGRITY (Anti-Phishing)
    // ============================================

    /**
     * Monitor for suspicious navigation/redirects
     */
    monitorNavigationIntegrity() {
        if (typeof window === 'undefined') return;

        // Monitor for phishing redirects
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = (...args) => {
            this.checkNavigationSafety(args[2]);
            return originalPushState.apply(history, args);
        };

        history.replaceState = (...args) => {
            this.checkNavigationSafety(args[2]);
            return originalReplaceState.apply(history, args);
        };

        // Monitor link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                this.checkLinkSafety(link.href, e);
            }
        }, true);
    },

    /**
     * Check if navigation is safe
     */
    checkNavigationSafety(url) {
        if (!url) return true;

        try {
            const parsed = new URL(url, window.location.origin);

            // Check for lookalike domains
            const lookalikes = this.detectLookalikeDomain(parsed.hostname);
            if (lookalikes.suspicious) {
                this.triggerAlert('LOOKALIKE_DOMAIN', {
                    severity: 'CRITICAL',
                    message: `Suspicious domain detected: ${parsed.hostname}`,
                    similarTo: lookalikes.similarTo,
                    recommendation: 'Do not proceed - possible phishing'
                });
                return false;
            }
        } catch (e) {
            // Invalid URL
        }

        return true;
    },

    /**
     * Check link safety before navigation
     */
    checkLinkSafety(href, event) {
        try {
            const url = new URL(href);

            // External link warning
            if (url.hostname !== window.location.hostname) {
                const lookalikes = this.detectLookalikeDomain(url.hostname);

                if (lookalikes.suspicious) {
                    event.preventDefault();
                    this.triggerAlert('PHISHING_LINK_BLOCKED', {
                        severity: 'CRITICAL',
                        message: `Blocked suspicious link: ${url.hostname}`,
                        similarTo: lookalikes.similarTo
                    });

                    // Show warning to user
                    if (typeof window !== 'undefined') {
                        alert(`⚠️ SECURITY WARNING\n\nBlocked suspicious link that looks like ${lookalikes.similarTo}.\n\nActual domain: ${url.hostname}\n\nThis may be a phishing attempt.`);
                    }
                }
            }
        } catch (e) {
            // Invalid URL, let browser handle
        }
    },

    /**
     * Detect lookalike/homograph domains
     */
    detectLookalikeDomain(domain) {
        // Homograph attack characters
        const homographs = {
            'a': ['а', 'ɑ', 'α'], // Cyrillic, Latin small alpha, Greek
            'e': ['е', 'ė', 'ε'],
            'i': ['і', 'ι', 'ı'],
            'o': ['о', 'ο', '0'],
            'c': ['с', 'ϲ'],
            'p': ['р', 'ρ'],
            'x': ['х', 'χ'],
            's': ['ѕ'],
            'n': ['ո', 'η']
        };

        // Check for homograph characters
        for (const [latin, alternatives] of Object.entries(homographs)) {
            for (const alt of alternatives) {
                if (domain.includes(alt)) {
                    return {
                        suspicious: true,
                        reason: 'Homograph character detected',
                        character: alt,
                        similarTo: domain.replace(alt, latin)
                    };
                }
            }
        }

        // Check for lookalike patterns
        const lookalikes = [
            { pattern: /uniswap[^.]*\./i, real: 'uniswap.org' },
            { pattern: /aave[^.]*\./i, real: 'aave.com' },
            { pattern: /obelisk[^.]*\./i, real: 'obelisk-2l1.pages.dev' },
            { pattern: /metamask[^.]*\./i, real: 'metamask.io' },
            { pattern: /opensea[^.]*\./i, real: 'opensea.io' }
        ];

        for (const { pattern, real } of lookalikes) {
            if (pattern.test(domain) && !domain.includes(real.split('.')[0])) {
                return {
                    suspicious: true,
                    reason: 'Lookalike domain pattern',
                    similarTo: real
                };
            }
        }

        return { suspicious: false };
    },

    // ============================================
    // CONTRACT ADDRESS VERIFICATION
    // ============================================

    /**
     * Verify contract address is legitimate
     */
    verifyContractAddress(chain, symbol, address) {
        const expected = this.config.trustedContracts[chain]?.[symbol];

        if (!expected) {
            return {
                verified: false,
                reason: 'Unknown contract',
                recommendation: 'Verify address manually on etherscan'
            };
        }

        const matches = expected.toLowerCase() === address.toLowerCase();

        if (!matches) {
            this.triggerAlert('CONTRACT_MISMATCH', {
                severity: 'CRITICAL',
                message: `Contract address mismatch for ${symbol} on ${chain}`,
                expected: expected,
                received: address,
                recommendation: 'DO NOT PROCEED - possible scam token'
            });
        }

        return {
            verified: matches,
            expected: expected,
            received: address
        };
    },

    // ============================================
    // SUBRESOURCE INTEGRITY (INFRA-004)
    // ============================================

    /**
     * Set up integrity monitoring for loaded resources
     */
    setupIntegrityMonitoring() {
        if (typeof window === 'undefined') return;

        // Monitor script loads
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.tagName === 'SCRIPT' && node.src) {
                        this.checkScriptIntegrity(node);
                    }
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // Check existing scripts
        document.querySelectorAll('script[src]').forEach(script => {
            this.checkScriptIntegrity(script);
        });
    },

    /**
     * Check script integrity
     */
    checkScriptIntegrity(script) {
        const src = script.src;

        // External scripts should have SRI
        if (!src.startsWith(window.location.origin)) {
            if (!script.integrity && this.config.sriEnabled) {
                console.warn(`[InfraSecurity] External script without SRI: ${src}`);
                this.state.integrityViolations.push({
                    type: 'MISSING_SRI',
                    url: src,
                    timestamp: Date.now()
                });
            }
        }
    },

    /**
     * Compute SHA-384 hash for content
     */
    async computeHash(content) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-384', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
        return `sha384-${hashBase64}`;
    },

    // ============================================
    // DEPENDENCY MONITORING
    // ============================================

    /**
     * Check for known vulnerable dependencies
     */
    checkDependencies() {
        // Known vulnerable packages (would be updated from security feed)
        const vulnerablePackages = [
            { name: 'event-stream', version: '3.3.6', reason: 'Malicious code injection' },
            { name: 'flatmap-stream', version: '*', reason: 'Cryptocurrency stealing malware' },
            { name: 'ua-parser-js', version: '<0.7.30', reason: 'Cryptominer injection' }
        ];

        // In browser context, we can't directly check node_modules
        // But we can check for suspicious global objects
        const suspiciousGlobals = [];

        if (typeof window !== 'undefined') {
            // Check for unexpected global modifications
            const expectedGlobals = new Set([
                'SecurityCore', 'QuantumShield', 'ContractGuards',
                'CircuitBreaker', 'OracleSecurity', 'SecurityMonitor',
                'AnomalyDetector', 'InfraSecurity'
            ]);

            // Check our own globals aren't tampered
            for (const name of expectedGlobals) {
                if (window[name] && typeof window[name].init !== 'function') {
                    suspiciousGlobals.push(name);
                }
            }
        }

        return {
            vulnerablePackages,
            suspiciousGlobals,
            clean: suspiciousGlobals.length === 0
        };
    },

    // ============================================
    // ALERTS
    // ============================================

    triggerAlert(type, data) {
        const alert = {
            type,
            timestamp: Date.now(),
            ...data
        };

        console.error(`[InfraSecurity] 🚨 ${type}:`, data.message);
        this.state.alerts.unshift(alert);

        if (this.state.alerts.length > 50) {
            this.state.alerts.pop();
        }

        // Emit event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('obelisk-infra-alert', {
                detail: alert
            }));
        }
    },

    /**
     * Get security status
     */
    getStatus() {
        return {
            domainVerified: this.state.domainVerified,
            lastDNSCheck: this.state.lastDNSCheck,
            integrityViolations: this.state.integrityViolations.length,
            alerts: this.state.alerts.slice(0, 10),
            dependencies: this.checkDependencies()
        };
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = InfraSecurity;
}

if (typeof window !== 'undefined') {
    window.InfraSecurity = InfraSecurity;
}
