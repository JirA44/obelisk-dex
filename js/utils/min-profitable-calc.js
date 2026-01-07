/**
 * OBELISK DEX - Minimum Profitable Calculator
 * Ajoute l'affichage du montant minimum rentable dans les modals d'investissement
 */

const MinProfitableCalc = {
    init() {
        // Ajouter la fonction a InvestmentsUI si elle existe
        if (typeof InvestmentsUI !== 'undefined') {
            InvestmentsUI.calculateMinProfitable = this.calculate.bind(this);
        }

        // Observer les modals pour ajouter l'info
        this.observeModals();

        console.log('📊 Min Profitable Calculator loaded');
    },

    /**
     * Calculer le montant minimum pour etre rentable
     * @param apy - APY en pourcentage
     * @param fee - Frais de conversion
     * @param period - Periode en mois (default: 1)
     */
    calculate(apy, fee, period = 1) {
        const apyNum = parseFloat(apy) || 5;
        const feeNum = parseFloat(fee) || 1;

        // Minimum pour couvrir les frais en X mois
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
     * Observer les modals d'investissement pour ajouter l'info
     */
    observeModals() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // Chercher les modals d'investissement
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
     * Ajouter l'info de rentabilite minimale au modal
     */
    addMinProfitableInfo(modal) {
        const feeRow = modal.querySelector('#fee-row, .fee-row');
        if (!feeRow) return;

        // Verifier si deja ajoute
        if (modal.querySelector('#min-profit-row')) return;

        // Extraire APY et Fee
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

        // Creer la ligne
        const minRow = document.createElement('div');
        minRow.id = 'min-profit-row';
        minRow.className = 'min-profit-row';
        minRow.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;color:#f59e0b;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05);';
        minRow.innerHTML = `
            <span title="Montant minimum pour couvrir les frais en 1 mois">📊 Min. rentable (1 mois):</span>
            <span style="font-weight:600;">${mins.formatted}</span>
        `;

        // Inserer apres la ligne des frais
        feeRow.parentNode.insertBefore(minRow, feeRow.nextSibling);

        // Ajouter une ligne pour 1 an aussi
        const minRowYear = document.createElement('div');
        minRowYear.className = 'min-profit-row-year';
        minRowYear.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;color:#888;font-size:12px;';
        minRowYear.innerHTML = `
            <span title="Montant minimum pour couvrir les frais en 1 an">📈 Min. rentable (1 an):</span>
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
