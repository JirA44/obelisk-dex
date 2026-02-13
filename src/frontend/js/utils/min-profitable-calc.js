/**
 * OBELISK DEX - Minimum Profitable Calculator
 * Adds minimum profitable amount display to investment modals
 */

const MinProfitableCalc = {
    init() {
        // Add function to InvestmentsUI if it exists
        if (typeof InvestmentsUI !== 'undefined') {
            InvestmentsUI.calculateMinProfitable = this.calculate.bind(this);
        }

        // Observe modals to add info
        this.observeModals();

        console.log('📊 Min Profitable Calculator loaded');
    },

    /**
     * Calculate minimum amount to be profitable
     * @param apy - APY percentage
     * @param fee - Conversion fee
     * @param period - Period in months (default: 1)
     */
    calculate(apy, fee, period = 1) {
        const apyNum = parseFloat(apy) || 5;
        const feeNum = parseFloat(fee) || 1;

        // Minimum to cover fees in X months
        // fee = amount * (apy/100) * (period/12)
        // amount = fee * 12 / (apy/100 * period)
        const minAmount = (feeNum * 12) / (apyNum / 100 * period);

        return {
            oneMonth: Math.ceil((feeNum * 12) / (apyNum / 100)),
            threeMonths: Math.ceil((feeNum * 12) / (apyNum / 100 * 3)),
            oneYear: Math.ceil(feeNum / (apyNum / 100)),
            formatted: '$' + Math.ceil(minAmount).toLocaleString()
        };
    },

    /**
     * Observe investment modals to add info
     */
    observeModals() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // Look for investment modals
                        const modal = node.classList?.contains('invest-modal-overlay') ? node : node.querySelector?.('.invest-modal-overlay');
                        if (modal) {
                            this.addMinProfitableInfo(modal);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    },

    /**
     * Add minimum profitability info to modal
     */
    addMinProfitableInfo(modal) {
        const feeRow = modal.querySelector('#fee-row, .fee-row');
        if (!feeRow) return;

        // Check if already added
        if (modal.querySelector('#min-profit-row')) return;

        // Extract APY and Fee
        const apyEl = modal.querySelector('.product-info-apy, [class*="apy"]');
        const feeEl = modal.querySelector('#fee-value');

        let apy = 5;
        let fee = 1;

        if (apyEl) {
            const apyText = apyEl.textContent;
            const match = apyText.match(/(\d+\.?\d*)/);
            if (match) apy = parseFloat(match[1]);
        }

        if (feeEl) {
            const feeText = feeEl.textContent;
            const match = feeText.match(/(\d+\.?\d*)/);
            if (match) fee = parseFloat(match[1]);
        }

        const mins = this.calculate(apy, fee);

        // Create row
        const minRow = document.createElement('div');
        minRow.id = 'min-profit-row';
        minRow.className = 'min-profit-row';
        minRow.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;color:#f59e0b;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05);';
        minRow.innerHTML = `
            <span title="Minimum amount to cover fees in 1 month">📊 Min. profitable (1 mo):</span>
            <span style="font-weight:600;">${mins.formatted}</span>
        `;

        // Insert after fee row
        feeRow.parentNode.insertBefore(minRow, feeRow.nextSibling);

        // Add row for 1 year too
        const minRowYear = document.createElement('div');
        minRowYear.className = 'min-profit-row-year';
        minRowYear.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;color:#888;font-size:12px;';
        minRowYear.innerHTML = `
            <span title="Minimum amount to cover fees in 1 year">📈 Min. profitable (1 yr):</span>
            <span>$${mins.oneYear.toLocaleString()}</span>
        `;
        minRow.parentNode.insertBefore(minRowYear, minRow.nextSibling);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MinProfitableCalc.init());
} else {
    setTimeout(() => MinProfitableCalc.init(), 300);
}

window.MinProfitableCalc = MinProfitableCalc;
