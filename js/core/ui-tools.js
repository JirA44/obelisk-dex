/**
 * Obelisk DEX - Unique Tools UI
 *
 * UI controllers for:
 * - Smart Intent Trading
 * - Arbitrage Scanner
 * - Social Recovery
 * - AI Advisor
 */

const ToolsUI = {
    /**
     * Initialize all tools UI
     */
    init() {
        this.initSmartIntent();
        this.initArbitrageScanner();
        this.initSocialRecovery();
        this.initAIAdvisor();

        // Load saved intents
        SmartIntent.init();
    },

    /**
     * Smart Intent Trading UI
     */
    initSmartIntent() {
        const form = document.getElementById('intent-form');
        const input = document.getElementById('intent-input');
        const suggestions = document.getElementById('intent-suggestions');
        const activeList = document.getElementById('active-intents');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (!text) return;

                try {
                    const wallet = WalletManager.currentWallet;
                    if (!wallet) {
                        throw new Error('Connect wallet first');
                    }

                    const intent = await SmartIntent.createIntent(text, wallet);
                    this.showNotification(`Intent created: ${intent.type}`, 'success');
                    input.value = '';
                    this.updateIntentsList();
                } catch (e) {
                    this.showNotification(e.message, 'error');
                }
            });
        }

        // Show suggestions
        if (suggestions) {
            const defaultSuggestions = [
                { text: 'DCA $100 into ETH weekly', icon: '📅' },
                { text: 'Stop loss at $3000', icon: '🛡️' },
                { text: 'Take profit at 20%', icon: '💰' },
                { text: 'Buy ETH at $3200', icon: '📉' }
            ];

            suggestions.innerHTML = defaultSuggestions.map(s => `
                <button class="suggestion-chip" onclick="ToolsUI.useIntentSuggestion('${s.text}')">
                    <span class="suggestion-icon">${s.icon}</span>
                    ${s.text}
                </button>
            `).join('');
        }

        // Listen for intent executions
        window.addEventListener('intent-executed', (e) => {
            this.showNotification(`Intent executed: ${e.detail.type}`, 'success');
            this.updateIntentsList();
        });
    },

    useIntentSuggestion(text) {
        const input = document.getElementById('intent-input');
        if (input) {
            input.value = text;
            input.focus();
        }
    },

    updateIntentsList() {
        const list = document.getElementById('active-intents');
        if (!list) return;

        const wallet = WalletManager.currentWallet;
        const intents = SmartIntent.getIntents(wallet?.address, 'pending');

        if (intents.length === 0) {
            list.innerHTML = '<p class="no-intents">No active intents</p>';
            return;
        }

        list.innerHTML = intents.map(intent => `
            <div class="intent-card ${intent.status}">
                <div class="intent-header">
                    <span class="intent-type">${this.formatIntentType(intent.type)}</span>
                    <span class="intent-status">${intent.status}</span>
                </div>
                <div class="intent-body">
                    ${this.formatIntentDetails(intent)}
                </div>
                <div class="intent-footer">
                    <button class="btn-small btn-danger" onclick="ToolsUI.cancelIntent('${intent.id}')">
                        Cancel
                    </button>
                </div>
            </div>
        `).join('');
    },

    formatIntentType(type) {
        const icons = {
            limit_buy: '📈 Limit Buy',
            limit_sell: '📉 Limit Sell',
            stop_loss: '🛡️ Stop Loss',
            take_profit: '💰 Take Profit',
            dca: '📅 DCA',
            trailing_stop: '📊 Trailing Stop'
        };
        return icons[type] || type;
    },

    formatIntentDetails(intent) {
        switch (intent.type) {
            case 'limit_buy':
            case 'limit_sell':
                return `${intent.token} at $${intent.targetPrice?.toLocaleString()}`;
            case 'stop_loss':
                return `${intent.token} below $${intent.stopPrice?.toLocaleString()}`;
            case 'take_profit':
                return `At ${intent.profitPercent}% profit`;
            case 'dca':
                return `$${intent.amount} into ${intent.token} ${intent.frequency}`;
            case 'trailing_stop':
                return `${intent.trailPercent}% trailing`;
            default:
                return intent.raw || '';
        }
    },

    cancelIntent(intentId) {
        if (SmartIntent.cancelIntent(intentId)) {
            this.showNotification('Intent cancelled', 'success');
            this.updateIntentsList();
        }
    },

    /**
     * Arbitrage Scanner UI
     */
    initArbitrageScanner() {
        const startBtn = document.getElementById('start-scanner');
        const stopBtn = document.getElementById('stop-scanner');
        const opportunitiesList = document.getElementById('arbitrage-opportunities');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                ArbitrageScanner.startScanning();
                startBtn.disabled = true;
                if (stopBtn) stopBtn.disabled = false;
                this.showNotification('Arbitrage scanner started', 'success');
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                ArbitrageScanner.stopScanning();
                if (startBtn) startBtn.disabled = false;
                stopBtn.disabled = true;
                this.showNotification('Scanner stopped', 'info');
            });
        }

        // Listen for updates
        window.addEventListener('arbitrage-updated', (e) => {
            this.updateArbitrageList(e.detail);
        });
    },

    updateArbitrageList(opportunities) {
        const list = document.getElementById('arbitrage-opportunities');
        if (!list) return;

        if (opportunities.length === 0) {
            list.innerHTML = '<p class="no-opportunities">Scanning for opportunities...</p>';
            return;
        }

        list.innerHTML = opportunities.slice(0, 10).map(opp => `
            <div class="arb-card risk-${opp.risk}">
                <div class="arb-header">
                    <span class="arb-pair">${opp.tokenA}/${opp.tokenB}</span>
                    <span class="arb-profit ${opp.profitPercent > 0.5 ? 'high-profit' : ''}">
                        +${opp.profitPercent.toFixed(2)}%
                    </span>
                </div>
                <div class="arb-route">
                    <div class="route-step">
                        <span class="step-label">Buy</span>
                        <span class="step-venue">${opp.buyVenue.dexName}</span>
                        <span class="step-network">${opp.buyVenue.networkName}</span>
                    </div>
                    <span class="route-arrow">→</span>
                    ${opp.needsBridge ? '<span class="bridge-icon">🌉</span><span class="route-arrow">→</span>' : ''}
                    <div class="route-step">
                        <span class="step-label">Sell</span>
                        <span class="step-venue">${opp.sellVenue.dexName}</span>
                        <span class="step-network">${opp.sellVenue.networkName}</span>
                    </div>
                </div>
                <div class="arb-footer">
                    <span class="arb-details">
                        Est. profit: $${opp.profitUSD.toFixed(2)} | Gas: $${opp.estimatedGasCost.toFixed(2)}
                    </span>
                    <span class="arb-risk risk-${opp.risk}">${opp.risk} risk</span>
                </div>
            </div>
        `).join('');
    },

    /**
     * Social Recovery UI
     */
    initSocialRecovery() {
        const setupForm = document.getElementById('guardian-setup-form');
        const guardianInput = document.getElementById('guardian-addresses');

        if (setupForm) {
            setupForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const wallet = WalletManager.currentWallet;
                if (!wallet) {
                    this.showNotification('Connect wallet first', 'error');
                    return;
                }

                const addresses = guardianInput.value
                    .split('\n')
                    .map(a => a.trim())
                    .filter(a => a.length > 0);

                const threshold = parseInt(document.getElementById('guardian-threshold')?.value || '2');
                const password = document.getElementById('recovery-password')?.value;

                if (addresses.length < 2) {
                    this.showNotification('Need at least 2 guardians', 'error');
                    return;
                }

                try {
                    const result = await SocialRecovery.setupGuardians(wallet, addresses, threshold, password);
                    this.showNotification(`${result.guardians.length} guardians configured`, 'success');
                    this.updateRecoveryStatus();
                } catch (e) {
                    this.showNotification(e.message, 'error');
                }
            });
        }
    },

    updateRecoveryStatus() {
        const wallet = WalletManager.currentWallet;
        if (!wallet) return;

        const status = SocialRecovery.getRecoveryStatus(wallet.address);
        const statusEl = document.getElementById('recovery-status');

        if (statusEl) {
            if (status.hasGuardians) {
                statusEl.innerHTML = `
                    <div class="recovery-status-card active">
                        <span class="status-icon">🛡️</span>
                        <div class="status-info">
                            <strong>Recovery Active</strong>
                            <p>${status.guardianCount} guardians | ${status.threshold} required</p>
                        </div>
                    </div>
                `;
            } else {
                statusEl.innerHTML = `
                    <div class="recovery-status-card inactive">
                        <span class="status-icon">⚠️</span>
                        <div class="status-info">
                            <strong>No Recovery Setup</strong>
                            <p>Add guardians to enable social recovery</p>
                        </div>
                    </div>
                `;
            }
        }
    },

    /**
     * AI Advisor UI
     */
    initAIAdvisor() {
        const analyzeBtn = document.getElementById('analyze-portfolio');
        const advisorPanel = document.getElementById('advisor-panel');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', async () => {
                const wallet = WalletManager.currentWallet;
                if (!wallet) {
                    this.showNotification('Connect wallet first', 'error');
                    return;
                }

                analyzeBtn.disabled = true;
                analyzeBtn.textContent = 'Analyzing...';

                try {
                    const analysis = await AIAdvisor.analyzePortfolio(wallet);
                    this.displayAnalysis(analysis);
                } catch (e) {
                    this.showNotification(e.message, 'error');
                } finally {
                    analyzeBtn.disabled = false;
                    analyzeBtn.textContent = 'Analyze Portfolio';
                }
            });
        }
    },

    displayAnalysis(analysis) {
        const panel = document.getElementById('advisor-results');
        if (!panel) return;

        panel.innerHTML = `
            <div class="analysis-section">
                <h4>Portfolio Health</h4>
                <div class="health-metrics">
                    <div class="metric">
                        <span class="metric-label">Total Value</span>
                        <span class="metric-value">$${analysis.totalValue.toLocaleString()}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Risk Score</span>
                        <span class="metric-value risk-${this.getRiskLevel(analysis.riskScore)}">
                            ${analysis.riskScore}/100
                        </span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Diversification</span>
                        <span class="metric-value">${analysis.diversificationScore}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Volatility</span>
                        <span class="metric-value">${analysis.volatility}%</span>
                    </div>
                </div>
            </div>

            <div class="analysis-section">
                <h4>Allocation</h4>
                <div class="allocation-chart">
                    ${Object.entries(analysis.allocation.byCategory).map(([cat, data]) => `
                        <div class="allocation-bar">
                            <span class="cat-name">${cat}</span>
                            <div class="bar-container">
                                <div class="bar-fill cat-${cat.toLowerCase()}"
                                     style="width: ${data.percentage}%"></div>
                            </div>
                            <span class="cat-percent">${data.percentage.toFixed(1)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="analysis-section">
                <h4>AI Recommendations</h4>
                <div class="recommendations">
                    ${analysis.recommendations.map(rec => `
                        <div class="recommendation-card priority-${rec.priority}">
                            <div class="rec-header">
                                <span class="rec-icon">${this.getRecIcon(rec.type)}</span>
                                <span class="rec-title">${rec.title}</span>
                                <span class="rec-priority">${rec.priority}</span>
                            </div>
                            <p class="rec-description">${rec.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="analysis-section">
                <h4>Opportunities</h4>
                <div class="opportunities-list">
                    ${analysis.opportunities.map(opp => `
                        <div class="opportunity-card">
                            <span class="opp-icon">${this.getOppIcon(opp.type)}</span>
                            <div class="opp-info">
                                <strong>${opp.title}</strong>
                                <p>${opp.description}</p>
                            </div>
                            <span class="opp-profit">${opp.expectedProfit}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="analysis-section">
                <h4>Risk Assessment</h4>
                <div class="risks-list">
                    ${analysis.risks.map(risk => `
                        <div class="risk-card severity-${risk.severity}">
                            <strong>${risk.title}</strong>
                            <p>${risk.description}</p>
                            <small>Mitigation: ${risk.mitigation}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getRiskLevel(score) {
        if (score < 30) return 'low';
        if (score < 60) return 'medium';
        return 'high';
    },

    getRecIcon(type) {
        const icons = {
            diversify: '📊',
            yield: '💰',
            rebalance: '⚖️',
            tax: '📝',
            strategy: '🎯'
        };
        return icons[type] || '💡';
    },

    getOppIcon(type) {
        const icons = {
            arbitrage: '🔄',
            yield: '📈',
            lp: '💧',
            stake: '🥩'
        };
        return icons[type] || '✨';
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications') || document.body;
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ToolsUI.init();
});

// Export
window.ToolsUI = ToolsUI;
