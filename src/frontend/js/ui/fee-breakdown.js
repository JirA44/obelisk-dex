/**
 * FEE BREAKDOWN UI - Obelisk DEX
 * Real-time fee breakdown display for trades
 */

const FeeBreakdownUI = {
    // Current trade state
    currentTrade: null,

    /**
     * Show fee breakdown before a trade
     */
    show(tradeDetails) {
        this.currentTrade = tradeDetails;

        const { amount, network, fromToken, toToken, slippage } = tradeDetails;

        // Calculate fees
        const breakdown = FeeTransparency.calculateTotalCost(amount, network, slippage);

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fee-breakdown-modal';
        modal.id = 'fee-breakdown-modal';
        modal.innerHTML = `
            <div class="fee-modal-backdrop" onclick="FeeBreakdownUI.close()"></div>
            <div class="fee-modal-content">
                <div class="fee-modal-header">
                    <h3>📊 Détail des Coûts</h3>
                    <button class="fee-modal-close" onclick="FeeBreakdownUI.close()">&times;</button>
                </div>
                <div class="fee-modal-body">
                    <div class="trade-summary">
                        <div class="trade-direction">
                            <span class="token from">${fromToken || 'USDC'}</span>
                            <span class="arrow">→</span>
                            <span class="token to">${toToken || 'ETH'}</span>
                        </div>
                        <div class="trade-network">
                            <span class="network-badge">${network || 'Arbitrum'}</span>
                        </div>
                    </div>

                    <div class="fee-breakdown-table">
                        <div class="fee-line">
                            <span class="fee-label">💵 Montant envoyé</span>
                            <span class="fee-amount">$${amount.toLocaleString('fr-FR', {minimumFractionDigits: 2})}</span>
                        </div>

                        <div class="fee-divider"></div>

                        <div class="fee-line deduction">
                            <span class="fee-label">
                                🏛️ Frais plateforme
                                <span class="fee-percent">(${(breakdown.platformFee.percent).toFixed(1)}%)</span>
                            </span>
                            <span class="fee-amount negative">-$${breakdown.platformFee.value.toFixed(4)}</span>
                        </div>

                        <div class="fee-line deduction">
                            <span class="fee-label">
                                ⛽ Frais réseau
                                <span class="fee-percent">(${network})</span>
                            </span>
                            <span class="fee-amount negative">-$${breakdown.gasFee.value.toFixed(4)}</span>
                        </div>

                        <div class="fee-line deduction">
                            <span class="fee-label">
                                📉 Slippage estimé
                                <span class="fee-percent">(max ${(breakdown.slippage.percent).toFixed(1)}%)</span>
                            </span>
                            <span class="fee-amount negative">-$${breakdown.slippage.value.toFixed(4)}</span>
                        </div>

                        <div class="fee-line deduction">
                            <span class="fee-label">
                                📊 Impact prix
                                <span class="fee-percent">(~${breakdown.priceImpact.percent.toFixed(2)}%)</span>
                            </span>
                            <span class="fee-amount negative">-$${breakdown.priceImpact.value.toFixed(4)}</span>
                        </div>

                        <div class="fee-divider"></div>

                        <div class="fee-line total">
                            <span class="fee-label">📋 COÛT TOTAL</span>
                            <span class="fee-amount">$${breakdown.totalCost.toFixed(2)} <span class="percent">(${breakdown.costPercent.toFixed(2)}%)</span></span>
                        </div>

                        <div class="fee-line result">
                            <span class="fee-label">✅ Vous recevez</span>
                            <span class="fee-amount positive">~$${breakdown.netReceived.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="pfof-badge">
                        <span class="pfof-icon">🛡️</span>
                        <span class="pfof-text">Aucun PFOF - Ordres directs aux DEX</span>
                    </div>

                    <div class="fee-comparison-mini">
                        <span>💡 Ce trade sur Robinhood coûterait ~$${(amount * 0.015).toFixed(2)} en frais cachés (PFOF + spread)</span>
                    </div>
                </div>
                <div class="fee-modal-footer">
                    <button class="btn-secondary" onclick="FeeBreakdownUI.close()">Annuler</button>
                    <button class="btn-primary" onclick="FeeBreakdownUI.confirmTrade()">
                        ✓ Confirmer le Trade
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
    },

    /**
     * Close the breakdown modal
     */
    close() {
        const modal = document.getElementById('fee-breakdown-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
    },

    /**
     * Confirm and execute the trade
     */
    confirmTrade() {
        if (this.currentTrade && this.currentTrade.onConfirm) {
            this.currentTrade.onConfirm();
        }
        this.close();
    },

    /**
     * Render inline breakdown (for order form)
     */
    renderInline(containerId, amount, network = 'arbitrum') {
        const el = document.getElementById(containerId);
        if (!el || !amount || amount <= 0) {
            if (el) el.innerHTML = '';
            return;
        }

        const breakdown = FeeTransparency.calculateTotalCost(amount, network);

        el.innerHTML = `
            <div class="fee-inline-breakdown">
                <div class="fee-inline-header">
                    <span>📊 Frais estimés</span>
                    <button class="btn-details" onclick="FeeBreakdownUI.showDetails(${amount}, '${network}')">Détails</button>
                </div>
                <div class="fee-inline-summary">
                    <div class="fee-mini-row">
                        <span>Plateforme:</span>
                        <span>-$${breakdown.platformFee.value.toFixed(2)}</span>
                    </div>
                    <div class="fee-mini-row">
                        <span>Gas (${network}):</span>
                        <span>-$${breakdown.gasFee.value.toFixed(2)}</span>
                    </div>
                    <div class="fee-mini-row total">
                        <span>Total:</span>
                        <span>$${breakdown.totalCost.toFixed(2)} (${breakdown.costPercent.toFixed(1)}%)</span>
                    </div>
                </div>
                <div class="fee-inline-pfof">✓ Pas de PFOF</div>
            </div>
        `;
    },

    /**
     * Show detailed breakdown modal
     */
    showDetails(amount, network) {
        this.show({
            amount,
            network,
            fromToken: 'USDC',
            toToken: 'Token',
            slippage: 0.005
        });
    },

    /**
     * Attach to swap/trade forms for live updates
     */
    attachToForm(formId, amountInputId, networkSelectId) {
        const amountInput = document.getElementById(amountInputId);
        const networkSelect = document.getElementById(networkSelectId);

        if (!amountInput) return;

        const updateBreakdown = () => {
            const amount = parseFloat(amountInput.value) || 0;
            const network = networkSelect?.value || 'arbitrum';
            this.renderInline(`${formId}-fee-breakdown`, amount, network);
        };

        amountInput.addEventListener('input', updateBreakdown);
        if (networkSelect) {
            networkSelect.addEventListener('change', updateBreakdown);
        }

        // Initial render
        updateBreakdown();
    },

    init() {
        // Add styles if not present
        if (!document.getElementById('fee-breakdown-styles')) {
            const style = document.createElement('style');
            style.id = 'fee-breakdown-styles';
            style.textContent = `
                .fee-breakdown-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 500;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .fee-breakdown-modal.visible { opacity: 1; }
                .fee-modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                }
                .fee-modal-content {
                    position: relative;
                    background: #0a0a0f;
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 16px;
                    max-width: 480px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    transform: translateY(20px);
                    transition: transform 0.3s;
                }
                .fee-breakdown-modal.visible .fee-modal-content {
                    transform: translateY(0);
                }
                .fee-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .fee-modal-header h3 { color: #00ff88; margin: 0; }
                .fee-modal-close {
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 24px;
                    cursor: pointer;
                }
                .fee-modal-body { padding: 20px; }
                .trade-summary {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: rgba(0, 255, 136, 0.05);
                    border-radius: 8px;
                    margin-bottom: 16px;
                }
                .trade-direction {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                }
                .trade-direction .arrow { color: #00ff88; }
                .network-badge {
                    background: rgba(0, 170, 255, 0.2);
                    color: #00aaff;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                .fee-breakdown-table { margin-bottom: 16px; }
                .fee-line {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    color: #ccc;
                }
                .fee-line.deduction .fee-amount { color: #ff6b6b; }
                .fee-line.total {
                    font-weight: 600;
                    color: #fff;
                    padding: 12px 0;
                }
                .fee-line.result .fee-amount { color: #00ff88; font-size: 18px; }
                .fee-percent { color: #666; font-size: 12px; margin-left: 4px; }
                .fee-divider {
                    border-top: 1px dashed rgba(255, 255, 255, 0.1);
                    margin: 8px 0;
                }
                .pfof-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 8px;
                    color: #00ff88;
                    margin-bottom: 12px;
                }
                .fee-comparison-mini {
                    font-size: 12px;
                    color: #888;
                    text-align: center;
                    padding: 8px;
                    background: rgba(255, 170, 0, 0.1);
                    border-radius: 4px;
                }
                .fee-modal-footer {
                    display: flex;
                    gap: 12px;
                    padding: 16px 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .fee-modal-footer button { flex: 1; }

                /* Inline breakdown */
                .fee-inline-breakdown {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 12px;
                }
                .fee-inline-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    font-size: 12px;
                    color: #888;
                }
                .btn-details {
                    background: none;
                    border: 1px solid rgba(0, 170, 255, 0.5);
                    color: #00aaff;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    cursor: pointer;
                }
                .fee-mini-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: #aaa;
                    padding: 2px 0;
                }
                .fee-mini-row.total {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    margin-top: 4px;
                    padding-top: 6px;
                    color: #fff;
                }
                .fee-inline-pfof {
                    text-align: center;
                    font-size: 10px;
                    color: #00ff88;
                    margin-top: 8px;
                }
            `;
            document.head.appendChild(style);
        }

        console.log('[FeeBreakdownUI] Initialized');
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => FeeBreakdownUI.init());

// Export
if (typeof window !== 'undefined') {
    window.FeeBreakdownUI = FeeBreakdownUI;
}
