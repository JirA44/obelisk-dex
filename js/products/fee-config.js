/**
 * OBELISK DEX - FEE CONFIGURATION
 * Central configuration for platform fees
 */

const FeeConfig = {
    // ============================================
    // FEE SETTINGS
    // ============================================

    // Platform fee percentage (0.2% = 0.002)
    PLATFORM_FEE_PERCENT: 0.002,  // 0.2%

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
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = FeeConfig;
}

if (typeof window !== 'undefined') {
    window.FeeConfig = FeeConfig;
}
