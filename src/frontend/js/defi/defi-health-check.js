// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - DEFI HEALTH CHECK & VERIFICATION SYSTEM
// Comprehensive testing and monitoring for all DeFi integrations
// ═══════════════════════════════════════════════════════════════════════════════

const DeFiHealthCheck = {
    // Status tracking
    status: {
        ethers: false,
        aave: false,
        gmx: false,
        aerodrome: false,
        defiManager: false,
        wallet: false,
        lastCheck: null,
        errors: []
    },

    // Test results
    results: [],

    /**
     * Run all health checks
     */
    async runAllChecks() {
        console.log('[DeFi Health] ═══════════════════════════════════════');
        console.log('[DeFi Health] Starting comprehensive health check...');
        console.log('[DeFi Health] ═══════════════════════════════════════');

        this.status.errors = [];
        this.results = [];
        const startTime = Date.now();

        // Check ethers.js
        await this.checkEthers();

        // Check each integration
        await this.checkAave();
        await this.checkGMX();
        await this.checkAerodrome();
        await this.checkDeFiManager();

        // Check wallet connection
        await this.checkWallet();

        // Summary
        this.status.lastCheck = new Date().toISOString();
        const duration = Date.now() - startTime;

        console.log('[DeFi Health] ═══════════════════════════════════════');
        console.log('[DeFi Health] Health check complete in', duration, 'ms');
        this.printSummary();
        console.log('[DeFi Health] ═══════════════════════════════════════');

        return this.getReport();
    },

    /**
     * Check ethers.js availability
     */
    async checkEthers() {
        const test = { name: 'ethers.js', status: 'unknown', details: [] };

        try {
            if (typeof ethers === 'undefined') {
                test.status = 'failed';
                test.details.push('ethers.js not loaded');
                this.status.ethers = false;
            } else {
                test.status = 'passed';
                test.details.push(`Version: ${ethers.version || 'v6+'}`);

                // Test provider creation
                try {
                    const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
                    const network = await provider.getNetwork();
                    test.details.push(`Arbitrum RPC OK (chainId: ${network.chainId})`);
                } catch (e) {
                    test.details.push('Warning: Arbitrum RPC test failed');
                }

                this.status.ethers = true;
            }
        } catch (e) {
            test.status = 'error';
            test.details.push(e.message);
            this.status.ethers = false;
        }

        this.results.push(test);
        this.logTest(test);
    },

    /**
     * Check Aave integration
     */
    async checkAave() {
        const test = { name: 'Aave V3 Integration', status: 'unknown', details: [] };

        try {
            if (typeof AaveIntegration === 'undefined') {
                test.status = 'failed';
                test.details.push('AaveIntegration not loaded');
                this.status.aave = false;
            } else {
                test.status = 'passed';
                test.details.push('Module loaded');

                // Check contracts defined
                if (AaveIntegration.contracts?.pool) {
                    test.details.push(`Pool: ${AaveIntegration.contracts.pool.slice(0, 10)}...`);
                }

                // Try to fetch rates
                try {
                    const rates = await AaveIntegration.fetchRates();
                    if (rates?.USDC?.supply) {
                        test.details.push(`USDC APY: ${rates.USDC.supply.toFixed(2)}%`);
                    }
                } catch (e) {
                    test.details.push('Warning: Could not fetch live rates');
                }

                // Check methods exist
                const methods = ['supplyUSDC', 'withdrawUSDC', 'getUserPosition', 'getEstimatedEarnings'];
                const missingMethods = methods.filter(m => typeof AaveIntegration[m] !== 'function');
                if (missingMethods.length === 0) {
                    test.details.push('All methods available');
                } else {
                    test.details.push(`Missing methods: ${missingMethods.join(', ')}`);
                }

                this.status.aave = true;
            }
        } catch (e) {
            test.status = 'error';
            test.details.push(e.message);
            this.status.aave = false;
        }

        this.results.push(test);
        this.logTest(test);
    },

    /**
     * Check GMX integration
     */
    async checkGMX() {
        const test = { name: 'GMX GLP Integration', status: 'unknown', details: [] };

        try {
            if (typeof GMXIntegration === 'undefined') {
                test.status = 'failed';
                test.details.push('GMXIntegration not loaded');
                this.status.gmx = false;
            } else {
                test.status = 'passed';
                test.details.push('Module loaded');

                // Check contracts
                if (GMXIntegration.contracts?.glpManager) {
                    test.details.push(`GLP Manager: ${GMXIntegration.contracts.glpManager.slice(0, 10)}...`);
                }

                // Try to fetch stats
                try {
                    const stats = await GMXIntegration.fetchStats();
                    if (stats?.glpPrice) {
                        test.details.push(`GLP Price: $${stats.glpPrice.toFixed(4)}`);
                    }
                    if (stats?.apr) {
                        test.details.push(`APR: ${stats.apr}%`);
                    }
                } catch (e) {
                    test.details.push('Warning: Could not fetch live stats');
                }

                // Check methods
                const methods = ['buyAndStakeGLP', 'sellGLP', 'claimRewards', 'getUserPosition'];
                const missingMethods = methods.filter(m => typeof GMXIntegration[m] !== 'function');
                if (missingMethods.length === 0) {
                    test.details.push('All methods available');
                } else {
                    test.details.push(`Missing methods: ${missingMethods.join(', ')}`);
                }

                this.status.gmx = true;
            }
        } catch (e) {
            test.status = 'error';
            test.details.push(e.message);
            this.status.gmx = false;
        }

        this.results.push(test);
        this.logTest(test);
    },

    /**
     * Check Aerodrome integration
     */
    async checkAerodrome() {
        const test = { name: 'Aerodrome Integration', status: 'unknown', details: [] };

        try {
            if (typeof AerodromeIntegration === 'undefined') {
                test.status = 'failed';
                test.details.push('AerodromeIntegration not loaded');
                this.status.aerodrome = false;
            } else {
                test.status = 'passed';
                test.details.push('Module loaded');
                test.details.push(`Chain: ${AerodromeIntegration.chain?.name || 'Base'}`);

                // Check contracts
                if (AerodromeIntegration.contracts?.router) {
                    test.details.push(`Router: ${AerodromeIntegration.contracts.router.slice(0, 10)}...`);
                }

                // Try to fetch pool stats
                try {
                    const stats = await AerodromeIntegration.fetchPoolStats();
                    const poolCount = Object.keys(stats || {}).length;
                    test.details.push(`Pools loaded: ${poolCount}`);
                } catch (e) {
                    test.details.push('Warning: Could not fetch pool stats');
                }

                // Check methods
                const methods = ['addLiquidity', 'swap', 'getUserPositions'];
                const missingMethods = methods.filter(m => typeof AerodromeIntegration[m] !== 'function');
                if (missingMethods.length === 0) {
                    test.details.push('All methods available');
                } else {
                    test.details.push(`Missing methods: ${missingMethods.join(', ')}`);
                }

                this.status.aerodrome = true;
            }
        } catch (e) {
            test.status = 'error';
            test.details.push(e.message);
            this.status.aerodrome = false;
        }

        this.results.push(test);
        this.logTest(test);
    },

    /**
     * Check DeFi Manager
     */
    async checkDeFiManager() {
        const test = { name: 'DeFi Manager', status: 'unknown', details: [] };

        try {
            if (typeof DeFiManager === 'undefined') {
                test.status = 'failed';
                test.details.push('DeFiManager not loaded');
                this.status.defiManager = false;
            } else {
                test.status = 'passed';
                test.details.push('Module loaded');

                // Check protocols
                const protocolCount = DeFiManager.protocols?.length || 0;
                test.details.push(`Protocols: ${protocolCount}`);

                // Test sorting functions
                try {
                    const byRisk = DeFiManager.getByRisk(3);
                    test.details.push(`Low risk protocols: ${byRisk.length}`);
                } catch (e) {
                    test.details.push('Warning: getByRisk failed');
                }

                // Test risk-adjusted ranking
                try {
                    const ranked = DeFiManager.getBestRiskAdjusted();
                    if (ranked.length > 0) {
                        test.details.push(`Top: ${ranked[0].name} (score: ${ranked[0].score?.toFixed(1)})`);
                    }
                } catch (e) {
                    test.details.push('Warning: getBestRiskAdjusted failed');
                }

                // Check methods
                const methods = ['getByRisk', 'getByAPY', 'getBestRiskAdjusted', 'invest', 'calculateCAGR'];
                const missingMethods = methods.filter(m => typeof DeFiManager[m] !== 'function');
                if (missingMethods.length === 0) {
                    test.details.push('All methods available');
                } else {
                    test.details.push(`Missing methods: ${missingMethods.join(', ')}`);
                }

                this.status.defiManager = true;
            }
        } catch (e) {
            test.status = 'error';
            test.details.push(e.message);
            this.status.defiManager = false;
        }

        this.results.push(test);
        this.logTest(test);
    },

    /**
     * Check wallet connection
     */
    async checkWallet() {
        const test = { name: 'Wallet Connection', status: 'unknown', details: [] };

        try {
            if (typeof window.ethereum === 'undefined') {
                test.status = 'warning';
                test.details.push('No wallet detected (MetaMask, etc.)');
                test.details.push('Install a Web3 wallet for real DeFi');
                this.status.wallet = false;
            } else {
                test.status = 'passed';
                test.details.push('Web3 wallet detected');

                // Check if connected
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        test.details.push(`Connected: ${accounts[0].slice(0, 8)}...${accounts[0].slice(-6)}`);

                        // Check chain
                        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                        const chainIdNum = parseInt(chainId, 16);
                        const chainNames = {
                            1: 'Ethereum',
                            42161: 'Arbitrum',
                            8453: 'Base',
                            137: 'Polygon'
                        };
                        test.details.push(`Chain: ${chainNames[chainIdNum] || chainIdNum}`);
                    } else {
                        test.details.push('Wallet not connected');
                        test.details.push('Click "Connect Wallet" to enable real DeFi');
                    }
                } catch (e) {
                    test.details.push('Could not query wallet');
                }

                this.status.wallet = true;
            }
        } catch (e) {
            test.status = 'error';
            test.details.push(e.message);
            this.status.wallet = false;
        }

        this.results.push(test);
        this.logTest(test);
    },

    /**
     * Log a test result
     */
    logTest(test) {
        const icons = {
            passed: '✅',
            failed: '❌',
            warning: '⚠️',
            error: '💥',
            unknown: '❓'
        };

        const icon = icons[test.status] || '❓';
        console.log(`[DeFi Health] ${icon} ${test.name}: ${test.status.toUpperCase()}`);
        test.details.forEach(d => console.log(`[DeFi Health]    └─ ${d}`));
    },

    /**
     * Print summary
     */
    printSummary() {
        const passed = this.results.filter(r => r.status === 'passed').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const warnings = this.results.filter(r => r.status === 'warning').length;
        const total = this.results.length;

        console.log(`[DeFi Health] Summary: ${passed}/${total} passed, ${failed} failed, ${warnings} warnings`);

        if (passed === total) {
            console.log('[DeFi Health] 🎉 All DeFi integrations operational!');
        } else if (failed > 0) {
            console.log('[DeFi Health] ⚠️ Some integrations need attention');
        }
    },

    /**
     * Get full report
     */
    getReport() {
        const passed = this.results.filter(r => r.status === 'passed').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const total = this.results.length;

        return {
            timestamp: this.status.lastCheck,
            summary: {
                passed,
                failed,
                total,
                healthy: passed === total
            },
            status: this.status,
            tests: this.results
        };
    },

    /**
     * Quick status check (no network calls)
     */
    quickCheck() {
        return {
            ethers: typeof ethers !== 'undefined',
            aave: typeof AaveIntegration !== 'undefined',
            gmx: typeof GMXIntegration !== 'undefined',
            aerodrome: typeof AerodromeIntegration !== 'undefined',
            defiManager: typeof DeFiManager !== 'undefined',
            wallet: typeof window.ethereum !== 'undefined'
        };
    },

    /**
     * Render health status in UI
     */
    renderHealthPanel() {
        const report = this.getReport();
        const quick = this.quickCheck();

        let html = `
            <div style="background:#1a1a2e;border-radius:12px;padding:20px;margin:15px 0;">
                <h3 style="color:#00ff88;margin-bottom:15px;">🏥 DeFi Health Status</h3>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
        `;

        const items = [
            { name: 'ethers.js', ok: quick.ethers },
            { name: 'Aave V3', ok: quick.aave },
            { name: 'GMX GLP', ok: quick.gmx },
            { name: 'Aerodrome', ok: quick.aerodrome },
            { name: 'DeFi Manager', ok: quick.defiManager },
            { name: 'Wallet', ok: quick.wallet }
        ];

        items.forEach(item => {
            const color = item.ok ? '#00ff88' : '#ff4444';
            const icon = item.ok ? '✓' : '✗';
            html += `
                <div style="background:#0d0d1a;padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:${color};font-size:20px;">${icon}</div>
                    <div style="color:#888;font-size:12px;">${item.name}</div>
                </div>
            `;
        });

        html += `
                </div>
                <div style="margin-top:15px;text-align:center;">
                    <button onclick="DeFiHealthCheck.runAllChecks().then(r => console.log(r))"
                            style="background:linear-gradient(135deg,#00ff88,#00d4aa);color:#000;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold;">
                        🔄 Run Full Check
                    </button>
                </div>
                ${report.timestamp ? `<div style="color:#666;font-size:11px;text-align:center;margin-top:10px;">Last check: ${new Date(report.timestamp).toLocaleString()}</div>` : ''}
            </div>
        `;

        return html;
    },

    /**
     * Verify a specific protocol can execute
     */
    async verifyProtocol(protocolId) {
        console.log(`[DeFi Health] Verifying protocol: ${protocolId}`);

        const protocol = DeFiManager?.protocols?.find(p => p.id === protocolId);
        if (!protocol) {
            return { success: false, error: 'Protocol not found' };
        }

        const checks = {
            protocolExists: true,
            integrationLoaded: false,
            methodExists: false,
            canEstimate: false,
            walletReady: false
        };

        // Check integration
        if (protocol.integration) {
            const integration = window[protocol.integration];
            checks.integrationLoaded = !!integration;

            if (integration && protocol.method) {
                checks.methodExists = typeof integration[protocol.method] === 'function';
            }

            // Try estimate
            if (integration?.getEstimatedEarnings) {
                try {
                    const estimate = integration.getEstimatedEarnings(100);
                    checks.canEstimate = estimate?.yearly !== undefined;
                } catch (e) {
                    checks.canEstimate = false;
                }
            }
        }

        // Check wallet
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                checks.walletReady = accounts.length > 0;
            } catch (e) {
                checks.walletReady = false;
            }
        }

        const allPassed = Object.values(checks).every(v => v);

        return {
            protocol: protocol.name,
            risk: protocol.riskLabel,
            apy: protocol.apy,
            checks,
            ready: allPassed,
            message: allPassed ? 'Ready for real investment' : 'Some checks failed'
        };
    }
};

// Auto-run quick check on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const quick = DeFiHealthCheck.quickCheck();
            console.log('[DeFi Health] Quick check:', quick);
        }, 2000);
    });
}

// Export
if (typeof window !== 'undefined') {
    window.DeFiHealthCheck = DeFiHealthCheck;
}

console.log('[DeFi Health] Module loaded');
