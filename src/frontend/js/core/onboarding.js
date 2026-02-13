/**
 * OBELISK Onboarding
 * Guide new users through the platform
 */

const Onboarding = {
    getSteps() {
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
        return [
            {
                id: 'welcome',
                title: isFr ? 'Bienvenue sur OBELISK' : 'Welcome to OBELISK',
                description: isFr ? 'L\'exchange décentralisé nouvelle génération. Non-custodial, rapide et sécurisé.' : 'The next generation decentralized exchange. Non-custodial, fast, and secure.',
                icon: '◈',
                action: null
            },
            {
                id: 'connect-wallet',
                title: isFr ? 'Connectez Votre Wallet' : 'Connect Your Wallet',
                description: isFr ? 'Liez votre wallet pour commencer à trader. Nous supportons MetaMask, WalletConnect, et plus.' : 'Link your wallet to start trading. We support MetaMask, WalletConnect, and more.',
                icon: '🦊',
                action: 'connectWallet',
                optional: true,
                skipText: isFr ? 'Passer pour l\'instant' : 'Skip for now'
            },
            {
                id: 'explore-markets',
                title: isFr ? 'Explorez les Marchés' : 'Explore Markets',
                description: isFr ? 'Parcourez 24+ paires de trading avec des prix en temps réel de multiples sources.' : 'Browse 24+ trading pairs with real-time prices from multiple sources.',
                icon: '📈',
                highlight: '.market-list'
            },
            {
                id: 'first-trade',
                title: isFr ? 'Faites Votre Premier Trade' : 'Make Your First Trade',
                description: isFr ? 'Entrez un montant, choisissez achat ou vente, et exécutez votre premier trade.' : 'Enter an amount, choose buy or sell, and execute your first trade.',
                icon: '💱',
                highlight: '.trade-form'
            },
            {
                id: 'passive-income',
                title: isFr ? 'Gagnez des Revenus Passifs' : 'Earn Passive Income',
                description: isFr ? 'Stakez des tokens, investissez dans des coffres, ou configurez un DCA automatique.' : 'Stake tokens, invest in vaults, or set up auto-DCA for hands-free earning.',
                icon: '💰',
                action: 'showInvestments'
            },
            {
                id: 'complete',
                title: isFr ? 'Vous êtes Prêt !' : "You're All Set!",
                description: isFr ? 'Commencez à trader et explorez toutes les fonctionnalités. Besoin d\'aide ? Consultez notre doc.' : 'Start trading and explore all features. Need help? Check our docs or join Discord.',
                icon: '🎉',
                action: 'finish'
            }
        ];
    },
    steps: [],

    currentStep: 0,
    modal: null,
    overlay: null,
    isActive: false,

    // Check if user needs onboarding
    shouldShow() {
        // Skip if already completed
        if (localStorage.getItem('obelisk_onboarding_complete')) {
            return false;
        }
        // Show for new Firebase users
        if (FirebaseAuth?.user && !localStorage.getItem('obelisk_onboarding_complete')) {
            return true;
        }
        return false;
    },

    // Start onboarding
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.currentStep = 0;
        this.createModal();
        this.showStep(0);
    },

    // Create modal
    createModal() {
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'onboarding-overlay';

        // Modal
        this.modal = document.createElement('div');
        this.modal.className = 'onboarding-modal';

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.modal);

        this.addStyles();
    },

    // Show specific step
    showStep(index) {
        const steps = this.getSteps();
        const step = steps[index];
        if (!step) return;

        this.currentStep = index;
        const isLast = index === steps.length - 1;
        const isFirst = index === 0;
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        this.modal.innerHTML = `
            <div class="onboarding-progress">
                ${steps.map((s, i) => `
                    <div class="progress-dot ${i === index ? 'active' : ''} ${i < index ? 'completed' : ''}"></div>
                `).join('')}
            </div>

            <div class="onboarding-icon">${step.icon}</div>

            <h2 class="onboarding-title">${step.title}</h2>
            <p class="onboarding-description">${step.description}</p>

            <div class="onboarding-actions">
                ${!isFirst ? `<button class="onboarding-btn secondary" onclick="Onboarding.prev()">${isFr ? 'Retour' : 'Back'}</button>` : ''}
                ${step.optional ? `<button class="onboarding-btn secondary" onclick="Onboarding.next()">${step.skipText || (isFr ? 'Passer' : 'Skip')}</button>` : ''}
                <button class="onboarding-btn primary" onclick="Onboarding.handleAction('${step.action || 'next'}')">
                    ${isLast ? (isFr ? 'Commencer' : 'Get Started') : step.action ? (isFr ? 'Continuer' : 'Continue') : (isFr ? 'Suivant' : 'Next')}
                </button>
            </div>

            <button class="onboarding-close" onclick="Onboarding.skip()">&times;</button>
        `;

        // Highlight element if specified
        if (step.highlight) {
            this.highlightElement(step.highlight);
        } else {
            this.clearHighlight();
        }
    },

    // Handle action
    async handleAction(action) {
        switch (action) {
            case 'next':
                this.next();
                break;
            case 'connectWallet':
                if (typeof connectWallet === 'function') {
                    await connectWallet();
                }
                this.next();
                break;
            case 'showInvestments':
                // Navigate to investments tab if exists
                const investTab = document.querySelector('[data-tab="invest"]');
                if (investTab) investTab.click();
                this.next();
                break;
            case 'finish':
                this.complete();
                break;
            default:
                this.next();
        }
    },

    // Navigation
    next() {
        if (this.currentStep < this.getSteps().length - 1) {
            this.showStep(this.currentStep + 1);
        }
    },

    prev() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    },

    skip() {
        if (confirm('Skip the onboarding? You can restart it anytime from Settings.')) {
            this.complete();
        }
    },

    complete() {
        localStorage.setItem('obelisk_onboarding_complete', 'true');
        localStorage.setItem('obelisk_onboarding_date', new Date().toISOString());
        this.destroy();

        // Show notification
        if (typeof showNotification === 'function') {
            const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            showNotification(isFr ? 'Bienvenue sur OBELISK ! Explorez et commencez à trader.' : 'Welcome to OBELISK! Explore and start trading.', 'success');
        }
    },

    destroy() {
        this.isActive = false;
        this.clearHighlight();
        if (this.modal) this.modal.remove();
        if (this.overlay) this.overlay.remove();
    },

    // Highlight element
    highlightElement(selector) {
        this.clearHighlight();
        const el = document.querySelector(selector);
        if (el) {
            el.classList.add('onboarding-highlight');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    clearHighlight() {
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });
    },

    // Reset onboarding (for testing or user request)
    reset() {
        localStorage.removeItem('obelisk_onboarding_complete');
        localStorage.removeItem('obelisk_onboarding_date');
        console.log('[ONBOARDING] Reset. Refresh to restart.');
    },

    // Styles
    addStyles() {
        if (document.getElementById('onboarding-styles')) return;

        const style = document.createElement('style');
        style.id = 'onboarding-styles';
        style.textContent = `
            .onboarding-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(8px);
                z-index: 9998;
                animation: fadeIn 0.3s ease;
            }

            .onboarding-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(180deg, #0a0a18 0%, #050510 100%);
                border: 1px solid rgba(0, 170, 255, 0.3);
                border-radius: 20px;
                padding: 40px;
                width: 90%;
                max-width: 480px;
                z-index: 500;
                text-align: center;
                box-shadow: 0 0 60px rgba(0, 170, 255, 0.2);
                animation: slideUp 0.4s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translate(-50%, -40%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }

            .onboarding-progress {
                display: flex;
                justify-content: center;
                gap: 8px;
                margin-bottom: 32px;
            }

            .progress-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: rgba(138, 180, 255, 0.2);
                transition: all 0.3s ease;
            }

            .progress-dot.active {
                background: #00aaff;
                box-shadow: 0 0 10px rgba(0, 170, 255, 0.5);
                transform: scale(1.2);
            }

            .progress-dot.completed {
                background: #00ff88;
            }

            .onboarding-icon {
                font-size: 64px;
                margin-bottom: 24px;
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .onboarding-title {
                font-size: 28px;
                font-weight: bold;
                color: #e8f0ff;
                margin: 0 0 16px;
                background: linear-gradient(135deg, #00aaff, #8a2be2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .onboarding-description {
                color: #8ab4ff;
                font-size: 16px;
                line-height: 1.6;
                margin: 0 0 32px;
            }

            .onboarding-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }

            .onboarding-btn {
                padding: 14px 28px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
            }

            .onboarding-btn.primary {
                background: linear-gradient(135deg, #00aaff, #0088dd);
                color: white;
            }

            .onboarding-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 20px rgba(0, 170, 255, 0.4);
            }

            .onboarding-btn.secondary {
                background: transparent;
                border: 1px solid rgba(138, 180, 255, 0.3);
                color: #8ab4ff;
            }

            .onboarding-btn.secondary:hover {
                border-color: #00aaff;
                color: #00aaff;
            }

            .onboarding-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                color: #4a6090;
                font-size: 24px;
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.2s;
            }

            .onboarding-close:hover {
                opacity: 1;
            }

            .onboarding-highlight {
                position: relative;
                z-index: 9997;
                box-shadow: 0 0 0 4px rgba(0, 170, 255, 0.5), 0 0 20px rgba(0, 170, 255, 0.3);
                border-radius: 8px;
                animation: highlightPulse 2s ease-in-out infinite;
            }

            @keyframes highlightPulse {
                0%, 100% { box-shadow: 0 0 0 4px rgba(0, 170, 255, 0.5), 0 0 20px rgba(0, 170, 255, 0.3); }
                50% { box-shadow: 0 0 0 6px rgba(0, 170, 255, 0.7), 0 0 30px rgba(0, 170, 255, 0.5); }
            }
        `;
        document.head.appendChild(style);
    }
};

// Auto-start for new users
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    setTimeout(() => {
        if (Onboarding.shouldShow()) {
            Onboarding.start();
        }
    }, 2000);
});

// Listen for new user sign-ups
if (typeof FirebaseAuth !== 'undefined') {
    FirebaseAuth.onAuthChange((user) => {
        if (user && !localStorage.getItem('obelisk_onboarding_complete')) {
            setTimeout(() => Onboarding.start(), 1000);
        }
    });
}

// Export
if (typeof window !== 'undefined') {
    window.Onboarding = Onboarding;
}
