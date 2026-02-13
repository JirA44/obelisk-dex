/**
 * OBELISK DEX - FEE CONFIGURATION
 * Central configuration for platform fees
 *
 * TRANSPARENCY COMMITMENT:
 * - All fees are visible BEFORE each transaction
 * - NO Payment for Order Flow (PFOF)
 * - NO hidden fees or spreads
 * - Orders route directly to DEXs
 */

const FeeConfig = {
    // ============================================
    // FEE SETTINGS
    // ============================================

    // Platform fee percentage (0.2% = 0.002)
    PLATFORM_FEE_PERCENT: 0.002,  // 0.2% (range: 0.1-0.3% based on tier)

    // Deposit/Withdrawal fees
    DEPOSIT_FEE_PERCENT: 0.003,   // 0.3% deposit fee
    WITHDRAWAL_FEE_PERCENT: 0.005, // 0.5% withdrawal fee
    DEPOSIT_FEE_MIN: 0.003,       // Min 0.3%
    DEPOSIT_FEE_MAX: 0.007,       // Max 0.7%
    WITHDRAWAL_FEE_MIN: 0.003,    // Min 0.3%
    WITHDRAWAL_FEE_MAX: 0.007,    // Max 0.7%

    // ============================================
    // PFOF POLICY (ZERO TOLERANCE)
    // ============================================
    PFOF: {
        enabled: false,  // NEVER enable this
        policy: 'ZERO_TOLERANCE',
        description: 'Obelisk does NOT practice Payment for Order Flow',
        commitment: [
            'Orders route directly to DEXs (Uniswap, etc.)',
            'No selling of order data to market makers',
            'You get the real market price',
            'All fees are visible before execution'
        ],
        competitors_using_pfof: ['Robinhood', 'Public.com', 'SoFi', 'Webull']
    },

    // Fee recipient address
    FEE_RECIPIENT: '0xB6Ef69E5850dB1ae0792C3B6ec0a867E5FbD8476',

    // Fee recipient addresses per chain (same address for all EVM chains)
    FEE_RECIPIENTS: {
        'ethereum': '0xB6Ef69E5850dB1ae0792C3B6ec0a867E5FbD8476',
        'arbitrum': '0xB6Ef69E5850dB1ae0792C3B6ec0a867E5FbD8476',
        'polygon': '0xB6Ef69E5850dB1ae0792C3B6ec0a867E5FbD8476',
        'optimism': '0xB6Ef69E5850dB1ae0792C3B6ec0a867E5FbD8476',
        'base': '0xB6Ef69E5850dB1ae0792C3B6ec0a867E5FbD8476'
    },

    // Minimum fee in USD (to avoid dust transactions)
    MIN_FEE_USD: 0.01,

    // Maximum fee in USD (cap for large transactions)
    MAX_FEE_USD: 10000,

    // Fee discount tiers (for future loyalty program)
    FEE_TIERS: {
        'default': 1.0,      // 100% of fee (0.1%)
        'bronze': 0.9,       // 90% of fee (0.09%)
        'silver': 0.75,      // 75% of fee (0.075%)
        'gold': 0.5,         // 50% of fee (0.05%)
        'platinum': 0.25     // 25% of fee (0.025%)
    },

    // ============================================
    // FEE CALCULATION
    // ============================================

    /**
     * Calculate fee for a transaction
     * @param {number} amount - Transaction amount in USD
     * @param {string} tier - User's fee tier (default, bronze, silver, gold, platinum)
     * @returns {object} Fee details
     */
    calculateFee(amount, tier = 'default') {
        const tierMultiplier = this.FEE_TIERS[tier] || 1.0;
        const basePercent = this.PLATFORM_FEE_PERCENT;
        const effectivePercent = basePercent * tierMultiplier;

        let feeAmount = amount * effectivePercent;

        // Apply min/max caps
        if (feeAmount < this.MIN_FEE_USD) {
            feeAmount = this.MIN_FEE_USD;
        }
        if (feeAmount > this.MAX_FEE_USD) {
            feeAmount = this.MAX_FEE_USD;
        }

        return {
            feeAmount: feeAmount,
            feePercent: effectivePercent,
            displayPercent: (effectivePercent * 100).toFixed(2) + '%',
            netAmount: amount - feeAmount,
            tier: tier,
            recipient: this.FEE_RECIPIENT
        };
    },

    /**
     * Calculate fee for a specific chain
     * @param {number} amount - Transaction amount
     * @param {string} chain - Blockchain network
     * @param {string} tier - User's fee tier
     */
    calculateFeeForChain(amount, chain, tier = 'default') {
        const fee = this.calculateFee(amount, tier);
        fee.recipient = this.FEE_RECIPIENTS[chain] || this.FEE_RECIPIENT;
        return fee;
    },

    /**
     * Get fee display text for UI
     * @param {number} amount - Transaction amount
     */
    getFeeDisplayText(amount, tier = 'default') {
        const fee = this.calculateFee(amount, tier);
        return `Fee: $${fee.feeAmount.toFixed(4)} (${fee.displayPercent})`;
    },

    /**
     * Check if fee recipient is configured
     */
    isConfigured() {
        return this.FEE_RECIPIENT !== '0x0000000000000000000000000000000000000000';
    },

    /**
     * Set fee recipient address
     * @param {string} address - Ethereum address
     * @param {string} chain - Optional: specific chain
     */
    setFeeRecipient(address, chain = null) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            console.error('[FeeConfig] Invalid address format');
            return false;
        }

        if (chain) {
            this.FEE_RECIPIENTS[chain] = address;
        } else {
            this.FEE_RECIPIENT = address;
            // Update all chains
            Object.keys(this.FEE_RECIPIENTS).forEach(c => {
                this.FEE_RECIPIENTS[c] = address;
            });
        }

        console.log(`[FeeConfig] Fee recipient set to ${address}`);
        return true;
    },

    /**
     * Get configuration summary
     */
    getConfig() {
        return {
            feePercent: this.PLATFORM_FEE_PERCENT * 100 + '%',
            recipient: this.FEE_RECIPIENT,
            recipientsByChain: this.FEE_RECIPIENTS,
            minFee: '$' + this.MIN_FEE_USD,
            maxFee: '$' + this.MAX_FEE_USD,
            configured: this.isConfigured()
        };
    },

    // ============================================
    // FEE COLLECTION (for integration with trading)
    // ============================================

    /**
     * Prepare fee transfer parameters
     * Used by trading modules to include fee in transaction
     */
    prepareFeeTransfer(amount, tokenAddress, chain = 'ethereum') {
        const fee = this.calculateFeeForChain(amount, chain);

        if (!this.isConfigured()) {
            console.warn('[FeeConfig] Fee recipient not configured!');
        }

        return {
            to: fee.recipient,
            amount: fee.feeAmount,
            token: tokenAddress,
            chain: chain,
            memo: 'Obelisk DEX Platform Fee'
        };
    },

    /**
     * Log fee collection (for analytics)
     */
    logFeeCollection(txHash, amount, chain) {
        const log = {
            timestamp: Date.now(),
            txHash,
            amount,
            chain,
            recipient: this.FEE_RECIPIENTS[chain] || this.FEE_RECIPIENT
        };

        // Store in localStorage for tracking
        const fees = JSON.parse(localStorage.getItem('obelisk_fees') || '[]');
        fees.push(log);

        // Keep last 1000 entries
        if (fees.length > 1000) {
            fees.shift();
        }

        localStorage.setItem('obelisk_fees', JSON.stringify(fees));

        console.log(`[FeeConfig] Fee collected: $${amount} on ${chain}`);
        return log;
    },

    /**
     * Get total fees collected (from localStorage)
     */
    getTotalFeesCollected() {
        const fees = JSON.parse(localStorage.getItem('obelisk_fees') || '[]');
        const total = fees.reduce((sum, f) => sum + f.amount, 0);
        return {
            total: total,
            count: fees.length,
            byChain: fees.reduce((acc, f) => {
                acc[f.chain] = (acc[f.chain] || 0) + f.amount;
                return acc;
            }, {})
        };
    },

    // ============================================
    // OBL TOKEN INTEGRATION
    // ============================================

    /**
     * Get OBL token fee discount for current user
     * Integrates with OBLToken module if available
     * @returns {number} Discount percentage (0 to 0.75)
     */
    getOBLDiscount() {
        if (typeof OBLToken !== 'undefined' && OBLToken.userBalance > 0) {
            return OBLToken.getFeeDiscount(OBLToken.userBalance);
        }
        return 0;
    },

    /**
     * Calculate fee with OBL token discount applied
     * @param {number} amount - Transaction amount in USD
     * @param {string} tier - User's fee tier (default, bronze, silver, gold, platinum)
     * @returns {object} Fee details with OBL discount
     */
    calculateFeeWithOBL(amount, tier = 'default') {
        // Calculate base fee
        const baseFee = this.calculateFee(amount, tier);

        // Get OBL discount
        const oblDiscount = this.getOBLDiscount();

        if (oblDiscount > 0) {
            // Apply OBL discount to fee amount
            const discountedFee = baseFee.feeAmount * (1 - oblDiscount);

            return {
                feeAmount: discountedFee,
                feePercent: baseFee.feePercent * (1 - oblDiscount),
                displayPercent: ((baseFee.feePercent * (1 - oblDiscount)) * 100).toFixed(2) + '%',
                netAmount: amount - discountedFee,
                tier: tier,
                recipient: baseFee.recipient,
                oblDiscount: oblDiscount,
                oblDiscountPercent: (oblDiscount * 100).toFixed(0) + '%',
                originalFee: baseFee.feeAmount,
                savedAmount: baseFee.feeAmount - discountedFee,
                oblTier: typeof OBLToken !== 'undefined' ? OBLToken.userTier : null
            };
        }

        // No OBL discount
        return {
            ...baseFee,
            oblDiscount: 0,
            oblDiscountPercent: '0%',
            originalFee: baseFee.feeAmount,
            savedAmount: 0,
            oblTier: null
        };
    },

    /**
     * Get fee display text with OBL discount
     * @param {number} amount - Transaction amount
     * @param {string} tier - User's fee tier
     */
    getFeeDisplayTextWithOBL(amount, tier = 'default') {
        const fee = this.calculateFeeWithOBL(amount, tier);

        if (fee.oblDiscount > 0) {
            return `Fee: $${fee.feeAmount.toFixed(4)} (${fee.displayPercent}) • ${fee.oblDiscountPercent} OBL discount`;
        }

        return `Fee: $${fee.feeAmount.toFixed(4)} (${fee.displayPercent})`;
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = FeeConfig;
}

if (typeof window !== 'undefined') {
    window.FeeConfig = FeeConfig;
}
