/**
 * OBELISK DEX - Premium Subscription System
 * Gestion des abonnements et avantages premium
 */

const PremiumSystem = {
    // Plans disponibles
    plans: {
        free: {
            id: 'free',
            name: 'Free',
            icon: '🆓',
            price: 0,
            priceYearly: 0,
            features: [
                'Trading simulé illimité',
                'Accès à tous les produits',
                'Frais standard',
                'Support communauté'
            ],
            feeDiscount: 0,
            maxPositions: 10,
            apiAccess: false,
            alerts: 3,
            copyTrading: false
        },
        pro: {
            id: 'pro',
            name: 'Pro',
            icon: '⭐',
            price: 9.99,
            priceYearly: 99.99, // 2 mois gratuits
            features: [
                'Tout de Free +',
                'Réduction frais -20%',
                'Alertes illimitées',
                'Analyse IA basique',
                'Accès API limité',
                'Support email prioritaire'
            ],
            feeDiscount: 0.20,
            maxPositions: 50,
            apiAccess: true,
            apiRateLimit: 100, // req/min
            alerts: -1, // illimité
            copyTrading: false
        },
        vip: {
            id: 'vip',
            name: 'VIP',
            icon: '💎',
            price: 29.99,
            priceYearly: 299.99, // 2 mois gratuits
            features: [
                'Tout de Pro +',
                'Réduction frais -50%',
                'Copy Trading',
                'Signaux privés',
                'Analyse IA avancée',
                'Accès API illimité',
                'Support téléphone 24/7',
                'Accès bêta nouvelles fonctionnalités'
            ],
            feeDiscount: 0.50,
            maxPositions: -1, // illimité
            apiAccess: true,
            apiRateLimit: -1, // illimité
            alerts: -1,
            copyTrading: true,
            privateSignals: true
        },
        institutional: {
            id: 'institutional',
            name: 'Institutional',
            icon: '🏛️',
            price: 299.99,
            priceYearly: 2999.99,
            features: [
                'Tout de VIP +',
                'Réduction frais -70%',
                'API dédiée',
                'Account Manager',
                'Rapports personnalisés',
                'Intégration sur mesure',
                'SLA 99.9%'
            ],
            feeDiscount: 0.70,
            maxPositions: -1,
            apiAccess: true,
            apiRateLimit: -1,
            alerts: -1,
            copyTrading: true,
            privateSignals: true,
            dedicatedSupport: true
        }
    },

    // Abonnement actuel de l'utilisateur
    currentPlan: 'free',
    subscription: null,

    // Revenus générés
    revenue: {
        subscriptions: 0,
        history: []
    },

    init() {
        this.loadState();
        console.log('[PremiumSystem] Initialized - Plan:', this.currentPlan);
    },

    loadState() {
        try {
            const saved = localStorage.getItem('obelisk_premium');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentPlan = data.currentPlan || 'free';
                this.subscription = data.subscription;
                this.revenue = data.revenue || this.revenue;
            }
        } catch (e) {}
    },

    saveState() {
        try {
            localStorage.setItem('obelisk_premium', JSON.stringify({
                currentPlan: this.currentPlan,
                subscription: this.subscription,
                revenue: this.revenue
            }));
        } catch (e) {}
    },

    /**
     * Obtenir le plan actuel
     */
    getCurrentPlan() {
        return this.plans[this.currentPlan] || this.plans.free;
    },

    /**
     * Obtenir la réduction de frais
     */
    getFeeDiscount() {
        return this.getCurrentPlan().feeDiscount;
    },

    /**
     * Vérifier si une fonctionnalité est disponible
     */
    hasFeature(feature) {
        const plan = this.getCurrentPlan();
        switch (feature) {
            case 'copyTrading': return plan.copyTrading === true;
            case 'apiAccess': return plan.apiAccess === true;
            case 'privateSignals': return plan.privateSignals === true;
            case 'unlimitedAlerts': return plan.alerts === -1;
            case 'unlimitedPositions': return plan.maxPositions === -1;
            default: return false;
        }
    },

    /**
     * Souscrire à un plan
     */
    subscribe(planId, yearly = false) {
        const plan = this.plans[planId];
        if (!plan) return { success: false, error: 'Plan invalide' };

        const price = yearly ? plan.priceYearly : plan.price;

        // En mode simulé, on active directement
        this.currentPlan = planId;
        this.subscription = {
            planId,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + (yearly ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            yearly,
            price,
            status: 'active'
        };

        // Enregistrer le revenu
        this.revenue.subscriptions += price;
        this.revenue.history.push({
            type: 'subscription',
            planId,
            price,
            yearly,
            timestamp: new Date().toISOString()
        });

        this.saveState();

        // Enregistrer dans FeeSystem si disponible
        if (typeof FeeSystem !== 'undefined') {
            FeeSystem.recordRevenue('subscription', price, { planId, yearly });
        }

        return { success: true, plan, subscription: this.subscription };
    },

    /**
     * Annuler l'abonnement
     */
    cancelSubscription() {
        if (this.currentPlan === 'free') {
            return { success: false, error: 'Pas d\'abonnement actif' };
        }

        // Garder l'accès jusqu'à la fin de la période
        if (this.subscription) {
            this.subscription.status = 'cancelled';
            this.subscription.cancelDate = new Date().toISOString();
        }

        this.saveState();
        return { success: true, message: 'Abonnement annulé. Accès maintenu jusqu\'au ' + new Date(this.subscription.endDate).toLocaleDateString() };
    },

    /**
     * Afficher le modal des plans
     */
    showPlansModal() {
        const modal = document.createElement('div');
        modal.className = 'premium-modal-overlay';
        modal.innerHTML = `
            <div class="premium-modal">
                <div class="modal-header">
                    <h2>💎 Plans Premium</h2>
                    <button class="modal-close" onclick="this.closest('.premium-modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="plans-grid">
                        ${Object.values(this.plans).map(plan => this.renderPlanCard(plan)).join('')}
                    </div>

                    <div class="current-plan-info">
                        <h3>Votre plan actuel</h3>
                        <div class="current-plan-badge">
                            ${this.getCurrentPlan().icon} ${this.getCurrentPlan().name}
                            ${this.subscription ? `<span class="sub-status">(jusqu'au ${new Date(this.subscription.endDate).toLocaleDateString()})</span>` : ''}
                        </div>
                    </div>

                    <div class="plans-comparison">
                        <h3>Comparatif</h3>
                        <table class="comparison-table">
                            <thead>
                                <tr>
                                    <th>Fonctionnalité</th>
                                    <th>Free</th>
                                    <th>Pro</th>
                                    <th>VIP</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Réduction frais</td>
                                    <td>0%</td>
                                    <td class="highlight">-20%</td>
                                    <td class="highlight-vip">-50%</td>
                                </tr>
                                <tr>
                                    <td>Positions max</td>
                                    <td>10</td>
                                    <td>50</td>
                                    <td class="highlight-vip">∞</td>
                                </tr>
                                <tr>
                                    <td>Alertes</td>
                                    <td>3</td>
                                    <td class="highlight">∞</td>
                                    <td class="highlight-vip">∞</td>
                                </tr>
                                <tr>
                                    <td>API Access</td>
                                    <td>❌</td>
                                    <td class="highlight">✅ 100/min</td>
                                    <td class="highlight-vip">✅ ∞</td>
                                </tr>
                                <tr>
                                    <td>Copy Trading</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                    <td class="highlight-vip">✅</td>
                                </tr>
                                <tr>
                                    <td>Signaux privés</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                    <td class="highlight-vip">✅</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.injectStyles();
    },

    renderPlanCard(plan) {
        const isCurrent = this.currentPlan === plan.id;
        const isUpgrade = this.plans[this.currentPlan] && plan.price > this.plans[this.currentPlan].price;

        return `
            <div class="plan-card ${plan.id} ${isCurrent ? 'current' : ''}">
                <div class="plan-header">
                    <span class="plan-icon">${plan.icon}</span>
                    <span class="plan-name">${plan.name}</span>
                    ${plan.id === 'vip' ? '<span class="popular-badge">Populaire</span>' : ''}
                </div>
                <div class="plan-price">
                    ${plan.price === 0 ? 'Gratuit' : `
                        <span class="price-amount">$${plan.price}</span>
                        <span class="price-period">/mois</span>
                        <div class="yearly-price">ou $${plan.priceYearly}/an (-17%)</div>
                    `}
                </div>
                <ul class="plan-features">
                    ${plan.features.map(f => `<li>✓ ${f}</li>`).join('')}
                </ul>
                <div class="plan-actions">
                    ${isCurrent ?
                        '<button class="btn-current" disabled>Plan actuel</button>' :
                        `<button class="btn-subscribe" onclick="PremiumSystem.subscribe('${plan.id}')">
                            ${isUpgrade ? 'Upgrader' : 'Sélectionner'}
                        </button>
                        ${plan.price > 0 ? `
                            <button class="btn-subscribe-yearly" onclick="PremiumSystem.subscribe('${plan.id}', true)">
                                Annuel (-17%)
                            </button>
                        ` : ''}`
                    }
                </div>
            </div>
        `;
    },

    /**
     * Programme de parrainage
     */
    referralProgram: {
        code: null,
        referrals: [],
        earnings: 0,

        generateCode() {
            if (!this.code) {
                this.code = 'OBK-' + Math.random().toString(36).substr(2, 8).toUpperCase();
            }
            return this.code;
        },

        applyReferralCode(code) {
            // Vérifier si le code est valide
            // En production, cela irait chercher dans la base de données
            return {
                success: true,
                discount: 0.10, // 10% de réduction
                duration: 90 // 90 jours
            };
        },

        recordReferral(referredUserId, amount) {
            const commission = amount * 0.20; // 20% de commission
            this.referrals.push({
                userId: referredUserId,
                amount,
                commission,
                timestamp: new Date().toISOString()
            });
            this.earnings += commission;
        }
    },

    injectStyles() {
        if (document.getElementById('premium-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'premium-styles';
        styles.textContent = `
            .premium-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 500;
                backdrop-filter: blur(10px);
            }

            .premium-modal {
                background: linear-gradient(145deg, #1a1a2e, #16213e);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 20px;
                width: 95%;
                max-width: 1000px;
                max-height: 90vh;
                overflow: hidden;
            }

            .premium-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 170, 0, 0.05));
                border-bottom: 1px solid rgba(255, 215, 0, 0.2);
            }

            .premium-modal .modal-header h2 {
                margin: 0;
                color: #ffd700;
            }

            .premium-modal .modal-close {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                color: #fff;
                font-size: 18px;
                cursor: pointer;
            }

            .premium-modal .modal-body {
                padding: 24px;
                overflow-y: auto;
                max-height: calc(90vh - 80px);
            }

            .plans-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 16px;
                margin-bottom: 30px;
            }

            .plan-card {
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 20px;
                transition: all 0.3s;
                position: relative;
            }

            .plan-card:hover {
                transform: translateY(-4px);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .plan-card.current {
                border-color: #00ff88;
                background: rgba(0, 255, 136, 0.05);
            }

            .plan-card.vip {
                border-color: #ffd700;
                background: linear-gradient(145deg, rgba(255, 215, 0, 0.1), rgba(255, 170, 0, 0.05));
            }

            .plan-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 16px;
            }

            .plan-icon {
                font-size: 28px;
            }

            .plan-name {
                font-size: 18px;
                font-weight: 700;
                color: #fff;
            }

            .popular-badge {
                position: absolute;
                top: -10px;
                right: 10px;
                background: linear-gradient(135deg, #ffd700, #ffaa00);
                color: #000;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 700;
            }

            .plan-price {
                margin-bottom: 20px;
            }

            .price-amount {
                font-size: 32px;
                font-weight: 700;
                color: #00ff88;
            }

            .price-period {
                color: #888;
                font-size: 14px;
            }

            .yearly-price {
                font-size: 11px;
                color: #ffaa00;
                margin-top: 4px;
            }

            .plan-features {
                list-style: none;
                padding: 0;
                margin: 0 0 20px 0;
            }

            .plan-features li {
                padding: 6px 0;
                color: #ccc;
                font-size: 13px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .plan-features li:last-child {
                border-bottom: none;
            }

            .plan-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .btn-subscribe, .btn-subscribe-yearly, .btn-current {
                padding: 12px;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-subscribe {
                background: linear-gradient(135deg, #00ff88, #00aa55);
                color: #000;
            }

            .btn-subscribe-yearly {
                background: rgba(255, 170, 0, 0.2);
                border: 1px solid rgba(255, 170, 0, 0.3);
                color: #ffaa00;
            }

            .btn-current {
                background: rgba(255, 255, 255, 0.1);
                color: #888;
                cursor: default;
            }

            .btn-subscribe:hover {
                transform: scale(1.02);
            }

            .current-plan-info {
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
            }

            .current-plan-info h3 {
                margin: 0 0 10px 0;
                color: #888;
                font-size: 12px;
            }

            .current-plan-badge {
                font-size: 18px;
                font-weight: 600;
                color: #00ff88;
            }

            .sub-status {
                font-size: 12px;
                color: #888;
                margin-left: 10px;
            }

            .comparison-table {
                width: 100%;
                border-collapse: collapse;
            }

            .comparison-table th, .comparison-table td {
                padding: 12px;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .comparison-table th {
                color: #888;
                font-size: 12px;
                font-weight: 600;
            }

            .comparison-table td {
                color: #ccc;
                font-size: 13px;
            }

            .comparison-table td:first-child {
                text-align: left;
                color: #fff;
            }

            .comparison-table .highlight {
                color: #00aaff;
                font-weight: 600;
            }

            .comparison-table .highlight-vip {
                color: #ffd700;
                font-weight: 600;
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => PremiumSystem.init());
if (document.readyState !== 'loading') PremiumSystem.init();

window.PremiumSystem = PremiumSystem;
console.log('[PremiumSystem] Module loaded');
