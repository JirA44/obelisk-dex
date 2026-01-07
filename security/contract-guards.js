/**
 * OBELISK DEX - SMART CONTRACT SECURITY GUARDS
 * Frontend-side transaction validation and attack detection
 */

const ContractGuards = {
    // Configuration
    config: {
        maxSlippage: 0.03,           // 3% max slippage
        minBlockConfirmations: 2,     // Wait for confirmations
        flashLoanDetection: true,
        reentrancyProtection: true,
        maxTxPerBlock: 3,            // Max transactions per block
        suspiciousPatterns: true,
        whitelistedContracts: new Set()
    },

    // State tracking
    state: {
        pendingTxs: new Map(),
        blockTxCounts: new Map(),
        recentSignatures: [],
        suspiciousAddresses: new Set(),
        lastBlockNumber: 0
    },

    /**
     * Initialize Contract Guards
     */
    init() {
        console.log('[ContractGuards] Initializing smart contract security...');
        this.loadSuspiciousAddresses();
        this.startBlockMonitoring();
        console.log('[ContractGuards] Ready - Transaction guards active');
        return true;
    },

    // ============================================
    // REENTRANCY PROTECTION
    // ============================================

    /**
     * Check for potential reentrancy before transaction
     */
    async checkReentrancy(txParams) {
        const { to, data, from } = txParams;

        // Check if contract is already in a call
        if (this.state.pendingTxs.has(to)) {
            const pendingTx = this.state.pendingTxs.get(to);
            const timeSincePending = Date.now() - pendingTx.timestamp;

            // If same contract called within 15 seconds, could be reentrancy
            if (timeSincePending < 15000) {
                return {
                    safe: false,
                    risk: 'REENTRANCY_DETECTED',
                    message: 'Contract already has pending transaction - possible reentrancy attack',
                    pendingTx,
                    recommendation: 'Wait for previous transaction to complete'
                };
            }
        }

        // Check for recursive call patterns in data
        if (data && this.detectRecursivePattern(data)) {
            return {
                safe: false,
                risk: 'RECURSIVE_CALL_PATTERN',
                message: 'Transaction data contains potential recursive call pattern',
                recommendation: 'Review transaction carefully'
            };
        }

        return { safe: true, risk: 'NONE' };
    },

    /**
     * Detect recursive call patterns in calldata
     */
    detectRecursivePattern(data) {
        // Common reentrancy function signatures
        const dangerousSignatures = [
            '0xa9059cbb', // transfer
            '0x23b872dd', // transferFrom
            '0x095ea7b3', // approve
            '0x2e1a7d4d', // withdraw
            '0x3ccfd60b', // withdraw()
            '0xd0e30db0', // deposit
        ];

        // Multiple calls to same function in one tx
        let signatureCount = {};
        for (let sig of dangerousSignatures) {
            const count = (data.match(new RegExp(sig.slice(2), 'g')) || []).length;
            if (count > 1) {
                return true;
            }
            signatureCount[sig] = count;
        }

        return false;
    },

    // ============================================
    // FLASH LOAN DETECTION
    // ============================================

    /**
     * Detect potential flash loan attack patterns
     */
    async detectFlashLoan(txParams, context = {}) {
        const { value, gasLimit, to } = txParams;
        const { poolLiquidity, priceImpact } = context;

        const warnings = [];

        // Unusually high value transaction
        if (value && BigInt(value) > BigInt('1000000000000000000000')) { // > 1000 ETH
            warnings.push({
                type: 'HIGH_VALUE',
                severity: 'MEDIUM',
                message: 'Very high value transaction detected'
            });
        }

        // Extreme price impact suggests manipulation
        if (priceImpact && priceImpact > 0.05) { // > 5% price impact
            warnings.push({
                type: 'PRICE_IMPACT',
                severity: 'HIGH',
                message: `Price impact ${(priceImpact * 100).toFixed(2)}% exceeds safe threshold`
            });
        }

        // Check if destination is known flash loan provider
        const flashLoanProviders = [
            '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9', // Aave V2
            '0x398ec7346dcd622edc5ae82352f02be94c62d119', // Aave V1
            '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f', // Uniswap V2
        ];

        if (flashLoanProviders.includes(to?.toLowerCase())) {
            warnings.push({
                type: 'FLASH_LOAN_ORIGIN',
                severity: 'INFO',
                message: 'Transaction involves known flash loan provider'
            });
        }

        // Check for same-block arbitrage pattern
        const currentBlock = this.state.lastBlockNumber;
        const blockTxCount = this.state.blockTxCounts.get(currentBlock) || 0;

        if (blockTxCount >= this.config.maxTxPerBlock) {
            warnings.push({
                type: 'SAME_BLOCK_MULTIPLE_TX',
                severity: 'MEDIUM',
                message: 'Multiple transactions in same block - possible atomic attack'
            });
        }

        return {
            isFlashLoan: warnings.some(w => w.severity === 'HIGH'),
            warnings,
            recommendation: warnings.length > 0
                ? 'Review transaction carefully - flash loan attack indicators present'
                : 'No flash loan indicators detected'
        };
    },

    // ============================================
    // SLIPPAGE PROTECTION
    // ============================================

    /**
     * Validate slippage is within safe bounds
     */
    validateSlippage(expectedOutput, minOutput, slippageTolerance) {
        const actualSlippage = 1 - (minOutput / expectedOutput);

        if (actualSlippage > this.config.maxSlippage) {
            return {
                safe: false,
                risk: 'EXCESSIVE_SLIPPAGE',
                configured: this.config.maxSlippage,
                actual: actualSlippage,
                message: `Slippage ${(actualSlippage * 100).toFixed(2)}% exceeds maximum ${(this.config.maxSlippage * 100)}%`,
                recommendation: 'Reduce trade size or wait for better liquidity'
            };
        }

        // Warn if slippage is suspiciously low (could indicate stale quote)
        if (slippageTolerance < 0.001) {
            return {
                safe: true,
                warning: 'SLIPPAGE_TOO_LOW',
                message: 'Slippage tolerance very low - transaction may fail',
                recommendation: 'Consider 0.5-1% slippage tolerance'
            };
        }

        return { safe: true, slippage: actualSlippage };
    },

    // ============================================
    // SIGNATURE VALIDATION
    // ============================================

    /**
     * Validate signature request is safe
     */
    async validateSignatureRequest(signatureRequest) {
        const { domain, message, primaryType } = signatureRequest;

        const risks = [];

        // Check for permit signatures (approve via signature)
        if (primaryType === 'Permit') {
            // Validate spender is not suspicious
            if (this.state.suspiciousAddresses.has(message.spender?.toLowerCase())) {
                risks.push({
                    type: 'SUSPICIOUS_SPENDER',
                    severity: 'CRITICAL',
                    message: 'Permit spender is on suspicious address list'
                });
            }

            // Check for unlimited approval
            const maxValue = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
            if (message.value === maxValue) {
                risks.push({
                    type: 'UNLIMITED_APPROVAL',
                    severity: 'HIGH',
                    message: 'Unlimited token approval requested'
                });
            }

            // Check deadline
            if (message.deadline) {
                const deadline = parseInt(message.deadline);
                const now = Math.floor(Date.now() / 1000);
                if (deadline - now > 86400 * 30) { // > 30 days
                    risks.push({
                        type: 'LONG_DEADLINE',
                        severity: 'MEDIUM',
                        message: 'Permit deadline is more than 30 days away'
                    });
                }
            }
        }

        // Check for blind signing (unknown message types)
        const knownTypes = ['Permit', 'Order', 'Swap', 'Transfer'];
        if (!knownTypes.includes(primaryType)) {
            risks.push({
                type: 'UNKNOWN_TYPE',
                severity: 'MEDIUM',
                message: `Unknown signature type: ${primaryType}`
            });
        }

        // Track signature to prevent replay
        const sigHash = await this.hashSignatureRequest(signatureRequest);
        if (this.state.recentSignatures.includes(sigHash)) {
            risks.push({
                type: 'DUPLICATE_SIGNATURE',
                severity: 'HIGH',
                message: 'Duplicate signature request detected - possible replay attack'
            });
        } else {
            this.state.recentSignatures.push(sigHash);
            if (this.state.recentSignatures.length > 100) {
                this.state.recentSignatures.shift();
            }
        }

        return {
            safe: !risks.some(r => r.severity === 'CRITICAL' || r.severity === 'HIGH'),
            risks,
            signatureHash: sigHash
        };
    },

    // ============================================
    // ADDRESS VALIDATION
    // ============================================

    /**
     * Validate destination address
     */
    async validateAddress(address) {
        if (!address || typeof address !== 'string') {
            return { valid: false, reason: 'Invalid address format' };
        }

        // Check format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return { valid: false, reason: 'Invalid Ethereum address format' };
        }

        // Check against suspicious addresses
        if (this.state.suspiciousAddresses.has(address.toLowerCase())) {
            return {
                valid: false,
                reason: 'Address is flagged as suspicious/malicious',
                severity: 'CRITICAL'
            };
        }

        // Check for burn address patterns
        const burnPatterns = [
            '0x0000000000000000000000000000000000000000',
            '0x000000000000000000000000000000000000dead',
        ];

        if (burnPatterns.includes(address.toLowerCase())) {
            return {
                valid: true,
                warning: 'This is a burn address - funds will be permanently lost'
            };
        }

        return { valid: true };
    },

    // ============================================
    // UTILITIES
    // ============================================

    async hashSignatureRequest(request) {
        const data = JSON.stringify(request);
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const encoder = new TextEncoder();
            const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
            return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        return data.length.toString(16) + Date.now().toString(16);
    },

    loadSuspiciousAddresses() {
        // Known scam/hack addresses
        const suspicious = [
            '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c', // Ronin hacker
            '0x098b716b8aaf21512996dc57eb0615e2383e2f96', // Wormhole hacker
            '0x56d8b635a7c88fd1104d23d632af40c1c3aac4e3', // Nomad hacker
        ];

        suspicious.forEach(addr => this.state.suspiciousAddresses.add(addr.toLowerCase()));
        console.log(`[ContractGuards] Loaded ${suspicious.length} suspicious addresses`);
    },

    startBlockMonitoring() {
        // Simulated block monitoring
        setInterval(() => {
            this.state.lastBlockNumber++;
            // Clean old block counts
            if (this.state.blockTxCounts.size > 100) {
                const oldest = Math.min(...this.state.blockTxCounts.keys());
                this.state.blockTxCounts.delete(oldest);
            }
        }, 12000); // ~12s per block
    },

    /**
     * Full transaction security check
     */
    async fullSecurityCheck(txParams, context = {}) {
        console.log('[ContractGuards] Running full security check...');

        const results = {
            timestamp: Date.now(),
            checks: {}
        };

        // 1. Reentrancy check
        results.checks.reentrancy = await this.checkReentrancy(txParams);

        // 2. Flash loan detection
        results.checks.flashLoan = await this.detectFlashLoan(txParams, context);

        // 3. Address validation
        if (txParams.to) {
            results.checks.address = await this.validateAddress(txParams.to);
        }

        // 4. Slippage check (if applicable)
        if (context.expectedOutput && context.minOutput) {
            results.checks.slippage = this.validateSlippage(
                context.expectedOutput,
                context.minOutput,
                context.slippageTolerance
            );
        }

        // Overall safety determination
        const criticalIssues = Object.values(results.checks).filter(
            c => c.safe === false || c.valid === false
        );

        results.safe = criticalIssues.length === 0;
        results.criticalIssues = criticalIssues;
        results.recommendation = results.safe
            ? 'Transaction appears safe to proceed'
            : 'Transaction blocked - security issues detected';

        console.log(`[ContractGuards] Security check complete: ${results.safe ? 'SAFE' : 'BLOCKED'}`);
        return results;
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = ContractGuards;
}

if (typeof window !== 'undefined') {
    window.ContractGuards = ContractGuards;
}
