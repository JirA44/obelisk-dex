/**
 * OBELISK DEX - Fee System & Revenue Management
 * Système de frais et gestion des revenus de la plateforme
 */

const FeeSystem = {
    // Configuration des frais
    fees: {
        // Frais de dépôt
        deposit: {
            simulated: 0,           // Gratuit en simulé
            real: {
                fiat: 0.015,        // 1.5% pour dépôt fiat (carte)
                crypto: 0.001,      // 0.1% pour dépôt crypto
                wire: 0.005         // 0.5% pour virement bancaire
            }
        },
        // Frais de retrait
        withdrawal: {
            simulated: 0,           // Gratuit en simulé
            real: {
                fiat: 0.02,         // 2% pour retrait fiat
                crypto: 0.002,      // 0.2% pour retrait crypto
                wire: 0.01,         // 1% pour virement bancaire
                minFee: 1           // Minimum $1
            }
        },
        // Frais de swap/trading
        swap: {
            maker: 0.001,           // 0.1% maker
            taker: 0.002,           // 0.2% taker
            simulated: 0.001        // 0.1% même en simulé (pour réalisme)
        },
        // Frais de gestion sur investissements
        management: {
            staking: 0.005,         // 0.5% annuel
            vaults: 0.01,           // 1% annuel
            pools: 0.0075,          // 0.75% annuel
            combos: 0.015           // 1.5% annuel
        },
        // Frais de performance (sur les gains uniquement)
        performance: {
            standard: 0.10,         // 10% des gains
            premium: 0.05,          // 5% pour membres premium
            vip: 0.02               // 2% pour VIP
        },
        // Frais de conversion
        conversion: {
            stablecoin: 0.001,      // 0.1% stable-stable
            crypto: 0.005,          // 0.5% crypto-crypto
            fiat: 0.015             // 1.5% fiat-crypto
        }
    },

    // Revenus accumulés (stockés en localStorage)
    revenue: {
        total: 0,
        byType: {
            deposit: 0,
            withdrawal: 0,
            swap: 0,
            management: 0,
            performance: 0,
            conversion: 0
        },
        history: [],
        lastUpdated: null
    },

    // Tiers d'utilisateurs (affectent les frais)
    userTiers: {
        standard: { discount: 0, label: 'Standard' },
        bronze: { discount: 0.10, label: 'Bronze', minVolume: 1000 },
        silver: { discount: 0.20, label: 'Silver', minVolume: 10000 },
        gold: { discount: 0.30, label: 'Gold', minVolume: 50000 },
        platinum: { discount: 0.40, label: 'Platinum', minVolume: 100000 },
        vip: { discount: 0.50, label: 'VIP', minVolume: 500000 }
    },

    init() {
        this.loadRevenue();
        console.log('[FeeSystem] Initialized');
    },

    loadRevenue() {
        try {
            const saved = localStorage.getItem('obelisk_revenue');
            if (saved) {
                this.revenue = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('[FeeSystem] Failed to load revenue data');
        }
    },

    saveRevenue() {
        try {
            this.revenue.lastUpdated = new Date().toISOString();
            localStorage.setItem('obelisk_revenue', JSON.stringify(this.revenue));
        } catch (e) {}
    },

    /**
     * Calculer les frais pour un dépôt
     */
    calculateDepositFee(amount, method = 'crypto', isSimulated = true) {
        if (isSimulated) return 0;

        const rate = this.fees.deposit.real[method] || this.fees.deposit.real.crypto;
        const fee = amount * rate;
        return Math.max(fee, 0.01); // Minimum $0.01
    },

    /**
     * Calculer les frais pour un retrait
     */
    calculateWithdrawalFee(amount, method = 'crypto', isSimulated = true) {
        if (isSimulated) return 0;

        const rate = this.fees.withdrawal.real[method] || this.fees.withdrawal.real.crypto;
        const fee = amount * rate;
        return Math.max(fee, this.fees.withdrawal.real.minFee);
    },

    /**
     * Calculer les frais de swap
     */
    calculateSwapFee(amount, isMaker = false, userTier = 'standard') {
        const baseRate = isMaker ? this.fees.swap.maker : this.fees.swap.taker;
        const discount = this.userTiers[userTier]?.discount || 0;
        const effectiveRate = baseRate * (1 - discount);
        return amount * effectiveRate;
    },

    /**
     * Calculer les frais de gestion annuels
     */
    calculateManagementFee(amount, productType = 'vaults', daysHeld = 365) {
        const annualRate = this.fees.management[productType] || this.fees.management.vaults;
        const dailyRate = annualRate / 365;
        return amount * dailyRate * daysHeld;
    },

    /**
     * Calculer les frais de performance
     */
    calculatePerformanceFee(gains, userTier = 'standard') {
        if (gains <= 0) return 0;

        let rate = this.fees.performance.standard;
        if (userTier === 'vip' || userTier === 'platinum') {
            rate = this.fees.performance.vip;
        } else if (userTier === 'gold' || userTier === 'silver') {
            rate = this.fees.performance.premium;
        }

        return gains * rate;
    },

    /**
     * Enregistrer un revenu
     */
    recordRevenue(type, amount, details = {}) {
        if (amount <= 0) return;

        this.revenue.total += amount;
        this.revenue.byType[type] = (this.revenue.byType[type] || 0) + amount;

        this.revenue.history.push({
            type,
            amount,
            details,
            timestamp: new Date().toISOString()
        });

        // Garder max 1000 entrées
        if (this.revenue.history.length > 1000) {
            this.revenue.history = this.revenue.history.slice(-1000);
        }

        this.saveRevenue();
        console.log(`[FeeSystem] Revenue recorded: ${type} $${amount.toFixed(4)}`);
    },

    /**
     * Obtenir le tier d'un utilisateur basé sur son volume
     */
    getUserTier(totalVolume) {
        if (totalVolume >= 500000) return 'vip';
        if (totalVolume >= 100000) return 'platinum';
        if (totalVolume >= 50000) return 'gold';
        if (totalVolume >= 10000) return 'silver';
        if (totalVolume >= 1000) return 'bronze';
        return 'standard';
    },

    /**
     * Obtenir les statistiques de revenus
     */
    getRevenueStats() {
        const now = new Date();
        const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const filterByDate = (minDate) => {
            return this.revenue.history
                .filter(r => new Date(r.timestamp) >= minDate)
                .reduce((sum, r) => sum + r.amount, 0);
        };

        return {
            total: this.revenue.total,
            byType: this.revenue.byType,
            daily: filterByDate(dayAgo),
            weekly: filterByDate(weekAgo),
            monthly: filterByDate(monthAgo),
            avgDaily: this.revenue.history.length > 0
                ? this.revenue.total / Math.max(1, this.getDaysTracked())
                : 0,
            projectedMonthly: this.revenue.history.length > 0
                ? (this.revenue.total / Math.max(1, this.getDaysTracked())) * 30
                : 0,
            projectedYearly: this.revenue.history.length > 0
                ? (this.revenue.total / Math.max(1, this.getDaysTracked())) * 365
                : 0
        };
    },

    getDaysTracked() {
        if (this.revenue.history.length === 0) return 0;
        const first = new Date(this.revenue.history[0].timestamp);
        const now = new Date();
        return Math.max(1, Math.ceil((now - first) / (24 * 60 * 60 * 1000)));
    },

    /**
     * Afficher le tableau de bord des frais
     */
    renderFeeSchedule() {
        return `
            <div class="fee-schedule">
                <h3>📊 Grille Tarifaire</h3>

                <div class="fee-section">
                    <h4>💳 Dépôts</h4>
                    <table class="fee-table">
                        <tr><td>Dépôt Crypto</td><td class="fee-value">0.1%</td></tr>
                        <tr><td>Dépôt Carte</td><td class="fee-value">1.5%</td></tr>
                        <tr><td>Virement Bancaire</td><td class="fee-value">0.5%</td></tr>
                        <tr><td>Mode Simulé</td><td class="fee-value free">Gratuit</td></tr>
                    </table>
                </div>

                <div class="fee-section">
                    <h4>💸 Retraits</h4>
                    <table class="fee-table">
                        <tr><td>Retrait Crypto</td><td class="fee-value">0.2%</td></tr>
                        <tr><td>Retrait Fiat</td><td class="fee-value">2%</td></tr>
                        <tr><td>Virement Bancaire</td><td class="fee-value">1%</td></tr>
                        <tr><td>Minimum</td><td class="fee-value">$1.00</td></tr>
                    </table>
                </div>

                <div class="fee-section">
                    <h4>🔄 Trading & Swap</h4>
                    <table class="fee-table">
                        <tr><td>Maker</td><td class="fee-value">0.1%</td></tr>
                        <tr><td>Taker</td><td class="fee-value">0.2%</td></tr>
                        <tr><td>Conversion Stable</td><td class="fee-value">0.1%</td></tr>
                        <tr><td>Conversion Crypto</td><td class="fee-value">0.5%</td></tr>
                    </table>
                </div>

                <div class="fee-section">
                    <h4>📈 Investissements</h4>
                    <table class="fee-table">
                        <tr><td>Frais de Gestion (Staking)</td><td class="fee-value">0.5%/an</td></tr>
                        <tr><td>Frais de Gestion (Vaults)</td><td class="fee-value">1%/an</td></tr>
                        <tr><td>Frais de Gestion (Pools)</td><td class="fee-value">0.75%/an</td></tr>
                        <tr><td>Frais de Gestion (Combos)</td><td class="fee-value">1.5%/an</td></tr>
                        <tr><td>Frais de Performance</td><td class="fee-value">10% des gains</td></tr>
                    </table>
                </div>

                <div class="fee-section tiers">
                    <h4>⭐ Réductions par Tier</h4>
                    <table class="fee-table">
                        <tr><td>Bronze ($1K+)</td><td class="fee-value discount">-10%</td></tr>
                        <tr><td>Silver ($10K+)</td><td class="fee-value discount">-20%</td></tr>
                        <tr><td>Gold ($50K+)</td><td class="fee-value discount">-30%</td></tr>
                        <tr><td>Platinum ($100K+)</td><td class="fee-value discount">-40%</td></tr>
                        <tr><td>VIP ($500K+)</td><td class="fee-value discount">-50%</td></tr>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Afficher le dashboard admin des revenus
     */
    renderAdminDashboard() {
        const stats = this.getRevenueStats();
        const formatAmount = (v) => v >= 1000 ? (v/1000).toFixed(2) + 'K' : v.toFixed(2);

        return `
            <div class="admin-revenue-dashboard">
                <h2>💰 Dashboard Revenus - Admin</h2>

                <div class="revenue-overview">
                    <div class="revenue-card total">
                        <div class="revenue-label">Revenus Totaux</div>
                        <div class="revenue-value">$${formatAmount(stats.total)}</div>
                    </div>
                    <div class="revenue-card daily">
                        <div class="revenue-label">Aujourd'hui</div>
                        <div class="revenue-value">$${formatAmount(stats.daily)}</div>
                    </div>
                    <div class="revenue-card weekly">
                        <div class="revenue-label">7 Jours</div>
                        <div class="revenue-value">$${formatAmount(stats.weekly)}</div>
                    </div>
                    <div class="revenue-card monthly">
                        <div class="revenue-label">30 Jours</div>
                        <div class="revenue-value">$${formatAmount(stats.monthly)}</div>
                    </div>
                </div>

                <div class="revenue-projections">
                    <h3>📈 Projections</h3>
                    <div class="projection-grid">
                        <div class="projection-item">
                            <span class="proj-label">Moyenne/Jour</span>
                            <span class="proj-value">$${formatAmount(stats.avgDaily)}</span>
                        </div>
                        <div class="projection-item">
                            <span class="proj-label">Projeté/Mois</span>
                            <span class="proj-value">$${formatAmount(stats.projectedMonthly)}</span>
                        </div>
                        <div class="projection-item">
                            <span class="proj-label">Projeté/An</span>
                            <span class="proj-value">$${formatAmount(stats.projectedYearly)}</span>
                        </div>
                    </div>
                </div>

                <div class="revenue-breakdown">
                    <h3>📊 Répartition par Type</h3>
                    <div class="breakdown-grid">
                        ${Object.entries(stats.byType).map(([type, amount]) => `
                            <div class="breakdown-item">
                                <span class="breakdown-type">${this.getTypeName(type)}</span>
                                <span class="breakdown-value">$${formatAmount(amount)}</span>
                                <span class="breakdown-pct">${stats.total > 0 ? ((amount/stats.total)*100).toFixed(1) : 0}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="recent-revenue">
                    <h3>🕐 Revenus Récents</h3>
                    <div class="revenue-list">
                        ${this.revenue.history.slice(-10).reverse().map(r => `
                            <div class="revenue-entry">
                                <span class="entry-type">${this.getTypeName(r.type)}</span>
                                <span class="entry-amount">+$${r.amount.toFixed(4)}</span>
                                <span class="entry-time">${this.formatTimeAgo(r.timestamp)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    getTypeName(type) {
        const names = {
            deposit: '💳 Dépôt',
            withdrawal: '💸 Retrait',
            swap: '🔄 Swap',
            management: '📊 Gestion',
            performance: '📈 Performance',
            conversion: '💱 Conversion'
        };
        return names[type] || type;
    },

    formatTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff/60)}m`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h`;
        return `${Math.floor(diff/86400)}j`;
    },

    /**
     * Ouvrir le modal des frais pour les utilisateurs
     */
    showFeeModal() {
        const modal = document.createElement('div');
        modal.className = 'fee-modal-overlay';
        modal.innerHTML = `
            <div class="fee-modal">
                <div class="modal-header">
                    <h2>💰 Frais & Tarifs</h2>
                    <button class="modal-close" onclick="this.closest('.fee-modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    ${this.renderFeeSchedule()}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.injectStyles();
    },

    /**
     * Ouvrir le dashboard admin
     */
    showAdminDashboard() {
        const modal = document.createElement('div');
        modal.className = 'fee-modal-overlay';
        modal.innerHTML = `
            <div class="fee-modal admin-modal">
                <div class="modal-header">
                    <h2>🔐 Dashboard Admin</h2>
                    <button class="modal-close" onclick="this.closest('.fee-modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    ${this.renderAdminDashboard()}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.injectStyles();
    },

    injectStyles() {
        if (document.getElementById('fee-system-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'fee-system-styles';
        styles.textContent = `
            .fee-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 500;
                backdrop-filter: blur(5px);
            }

            .fee-modal {
                background: linear-gradient(145deg, #1a1a2e, #16213e);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                width: 90%;
                max-width: 600px;
                max-height: 85vh;
                overflow: hidden;
            }

            .fee-modal.admin-modal {
                max-width: 800px;
            }

            .fee-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .fee-modal .modal-header h2 {
                margin: 0;
                color: #fff;
            }

            .fee-modal .modal-close {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                color: #fff;
                font-size: 18px;
                cursor: pointer;
            }

            .fee-modal .modal-body {
                padding: 20px;
                overflow-y: auto;
                max-height: calc(85vh - 80px);
            }

            .fee-schedule {
                display: grid;
                gap: 20px;
            }

            .fee-section {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
                padding: 16px;
            }

            .fee-section h4 {
                margin: 0 0 12px 0;
                color: #00ff88;
                font-size: 14px;
            }

            .fee-table {
                width: 100%;
                border-collapse: collapse;
            }

            .fee-table tr {
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .fee-table tr:last-child {
                border-bottom: none;
            }

            .fee-table td {
                padding: 10px 0;
                color: #ccc;
                font-size: 13px;
            }

            .fee-table .fee-value {
                text-align: right;
                font-weight: 600;
                color: #ffaa00;
            }

            .fee-table .fee-value.free {
                color: #00ff88;
            }

            .fee-table .fee-value.discount {
                color: #00aaff;
            }

            /* Admin Dashboard */
            .admin-revenue-dashboard h2 {
                margin: 0 0 20px 0;
                color: #fff;
            }

            .admin-revenue-dashboard h3 {
                margin: 20px 0 12px 0;
                color: #888;
                font-size: 14px;
            }

            .revenue-overview {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 12px;
                margin-bottom: 20px;
            }

            .revenue-card {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
            }

            .revenue-card.total {
                background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 170, 85, 0.1));
                border: 1px solid rgba(0, 255, 136, 0.3);
            }

            .revenue-label {
                font-size: 11px;
                color: #888;
                margin-bottom: 6px;
            }

            .revenue-value {
                font-size: 20px;
                font-weight: 700;
                color: #00ff88;
            }

            .projection-grid, .breakdown-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }

            .projection-item, .breakdown-item {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .proj-label, .breakdown-type {
                font-size: 11px;
                color: #888;
            }

            .proj-value, .breakdown-value {
                font-size: 16px;
                font-weight: 600;
                color: #00ff88;
            }

            .breakdown-pct {
                font-size: 11px;
                color: #00aaff;
            }

            .revenue-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .revenue-entry {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
            }

            .entry-type {
                font-size: 12px;
                color: #ccc;
            }

            .entry-amount {
                font-size: 13px;
                font-weight: 600;
                color: #00ff88;
            }

            .entry-time {
                font-size: 11px;
                color: #666;
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => FeeSystem.init());
if (document.readyState !== 'loading') FeeSystem.init();

window.FeeSystem = FeeSystem;
console.log('[FeeSystem] Module loaded');
