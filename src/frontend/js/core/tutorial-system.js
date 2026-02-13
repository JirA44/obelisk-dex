/**
 * OBELISK DEX - Interactive Tutorial System
 * Guides new users step-by-step through the platform
 * Saves progress in localStorage
 */

const ObeliskTutorial = {
    // Tutorial state
    currentStep: 0,
    isActive: false,
    completedTutorials: [],

    // Tutorial definitions
    tutorials: {
        'getting-started': {
            id: 'getting-started',
            title: 'Getting Started',
            description: 'Learn the basics of Obelisk DEX',
            steps: [
                {
                    target: '.wallet-connect-btn',
                    title: 'Connect Your Wallet',
                    content: 'Click here to connect your wallet. We support MetaMask, WalletConnect, and other popular wallets.',
                    position: 'bottom',
                    action: 'click',
                    highlight: true
                },
                {
                    target: '.nav-tab[data-tab="trade"]',
                    title: 'Trading Tab',
                    content: 'This is where you can trade cryptocurrencies. Buy, sell, or set limit orders.',
                    position: 'bottom',
                    highlight: true
                },
                {
                    target: '.nav-tab[data-tab="banking"]',
                    title: 'Banking Services',
                    content: 'Deposit, earn interest, and access DeFi banking features. All non-custodial!',
                    position: 'bottom',
                    highlight: true
                },
                {
                    target: '.nav-tab[data-tab="combos"]',
                    title: 'Investment Products',
                    content: 'Pre-built investment strategies with different risk/reward profiles. From 4% APY (safe) to 20% APY (aggressive).',
                    position: 'bottom',
                    highlight: true
                },
                {
                    target: '.security-indicator',
                    title: 'Post-Quantum Security',
                    content: 'Your transactions are protected by quantum-resistant cryptography (CRYSTALS-Dilithium). Even future quantum computers cannot break your security.',
                    position: 'left',
                    highlight: true
                }
            ]
        },

        'first-trade': {
            id: 'first-trade',
            title: 'Your First Trade',
            description: 'Learn how to execute a trade',
            prerequisite: 'getting-started',
            steps: [
                {
                    target: '.market-selector',
                    title: 'Select a Market',
                    content: 'Choose which cryptocurrency pair you want to trade (e.g., BTC/USDC).',
                    position: 'right',
                    highlight: true
                },
                {
                    target: '.order-type-tabs',
                    title: 'Order Types',
                    content: 'Market orders execute immediately. Limit orders let you set your price.',
                    position: 'left',
                    highlight: true
                },
                {
                    target: '.amount-input',
                    title: 'Enter Amount',
                    content: 'Enter how much you want to trade. Use the percentage buttons for quick selection.',
                    position: 'top',
                    highlight: true
                },
                {
                    target: '.execute-trade-btn',
                    title: 'Execute Trade',
                    content: 'Review the details and click to execute. You will confirm in your wallet.',
                    position: 'top',
                    highlight: true,
                    action: 'click'
                }
            ]
        },

        'post-quantum-security': {
            id: 'post-quantum-security',
            title: 'Post-Quantum Security',
            description: 'Understand how your assets are protected',
            steps: [
                {
                    target: null,
                    title: 'Why Post-Quantum?',
                    content: 'Traditional cryptography (RSA, ECDSA) can be broken by quantum computers. Obelisk uses quantum-resistant algorithms approved by NIST.',
                    position: 'center',
                    isModal: true
                },
                {
                    target: null,
                    title: 'CRYSTALS-Kyber',
                    content: 'Used for key exchange. Creates secure communication channels that quantum computers cannot intercept.',
                    position: 'center',
                    isModal: true,
                    icon: 'key'
                },
                {
                    target: null,
                    title: 'CRYSTALS-Dilithium',
                    content: 'Used for digital signatures. Every transaction you sign is quantum-secure.',
                    position: 'center',
                    isModal: true,
                    icon: 'signature'
                },
                {
                    target: null,
                    title: 'SPHINCS+',
                    content: 'Hash-based signatures for ultimate security. Even if lattice-based crypto is compromised, this backup keeps you safe.',
                    position: 'center',
                    isModal: true,
                    icon: 'shield'
                },
                {
                    target: null,
                    title: 'Your Keys, Your Crypto',
                    content: 'Obelisk is non-custodial. We never have access to your private keys. Your security is in YOUR hands.',
                    position: 'center',
                    isModal: true,
                    icon: 'lock'
                }
            ]
        },

        'investment-products': {
            id: 'investment-products',
            title: 'Investment Products Guide',
            description: 'Learn about our investment options',
            steps: [
                {
                    target: '.product-card[data-product="safe-haven"]',
                    title: 'Safe Haven (4-5% APY)',
                    content: '100% capital protected. Perfect for beginners. Your deposit is always safe, you only earn interest.',
                    position: 'right',
                    highlight: true
                },
                {
                    target: '.product-card[data-product="balanced"]',
                    title: 'Balanced Growth (7-10% APY)',
                    content: '90% capital protected. Slightly higher returns with minimal risk exposure.',
                    position: 'right',
                    highlight: true
                },
                {
                    target: '.product-card[data-product="yield"]',
                    title: 'Yield Optimizer (10-15% APY)',
                    content: '80% capital protected. Uses DeFi strategies to maximize yields.',
                    position: 'right',
                    highlight: true
                },
                {
                    target: '.product-card[data-product="growth"]',
                    title: 'Growth Plus (12-18% APY)',
                    content: '70% capital protected. Higher potential returns, some market exposure.',
                    position: 'left',
                    highlight: true
                },
                {
                    target: '.risk-indicator',
                    title: 'Understanding Risk',
                    content: 'Higher APY = Higher risk. Start with Safe Haven until you understand the platform.',
                    position: 'top',
                    highlight: true
                }
            ]
        }
    },

    // Initialize the tutorial system
    init() {
        this.loadProgress();
        this.createUI();
        this.bindEvents();

        // Show welcome for first-time users
        if (!localStorage.getItem('obelisk_welcomed')) {
            setTimeout(() => this.showWelcome(), 1000);
        }

        console.log('[TUTORIAL] System initialized');
    },

    // Load saved progress
    loadProgress() {
        try {
            const saved = localStorage.getItem('obelisk_tutorials');
            if (saved) {
                this.completedTutorials = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('[TUTORIAL] Could not load progress:', e);
        }
    },

    // Save progress
    saveProgress() {
        try {
            localStorage.setItem('obelisk_tutorials', JSON.stringify(this.completedTutorials));
        } catch (e) {
            console.warn('[TUTORIAL] Could not save progress:', e);
        }
    },

    // Create tutorial UI elements
    createUI() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-backdrop"></div>
            <div class="tutorial-spotlight"></div>
            <div class="tutorial-tooltip">
                <div class="tutorial-tooltip-header">
                    <span class="tutorial-step-indicator"></span>
                    <button class="tutorial-close" aria-label="Close tutorial">&times;</button>
                </div>
                <h3 class="tutorial-title"></h3>
                <p class="tutorial-content"></p>
                <div class="tutorial-actions">
                    <button class="tutorial-btn tutorial-prev">Previous</button>
                    <button class="tutorial-btn tutorial-next">Next</button>
                    <button class="tutorial-btn tutorial-skip">Skip Tutorial</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Create welcome modal
        const welcome = document.createElement('div');
        welcome.id = 'tutorial-welcome';
        welcome.innerHTML = `
            <div class="welcome-modal">
                <div class="welcome-icon">
                    <svg viewBox="0 0 80 80" fill="none">
                        <path d="M40 4L16 76h48L40 4z" fill="url(#wg)" />
                        <path d="M40 16L24 68h32L40 16z" fill="#0a0a0f" />
                        <path d="M40 28L32 60h16L40 28z" fill="url(#wg)" opacity="0.6" />
                        <defs>
                            <linearGradient id="wg" x1="40" y1="4" x2="40" y2="76" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#00ff88" />
                                <stop offset="1" stop-color="#00aaff" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h2>Welcome to Obelisk DEX</h2>
                <p>Your quantum-secure decentralized exchange. Let's get you started!</p>
                <div class="welcome-features">
                    <div class="feature">
                        <span class="feature-icon">🔐</span>
                        <span>Post-Quantum Security</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🏦</span>
                        <span>Non-Custodial Banking</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">📈</span>
                        <span>Smart Investment Products</span>
                    </div>
                </div>
                <div class="welcome-actions">
                    <button class="welcome-btn primary" id="start-tutorial">Start Tutorial (2 min)</button>
                    <button class="welcome-btn secondary" id="skip-welcome">I know what I'm doing</button>
                </div>
            </div>
        `;
        document.body.appendChild(welcome);

        // Create help button
        const helpBtn = document.createElement('button');
        helpBtn.id = 'tutorial-help-btn';
        helpBtn.innerHTML = '?';
        helpBtn.setAttribute('aria-label', 'Open tutorials');
        helpBtn.title = 'Need help? Click for tutorials';
        document.body.appendChild(helpBtn);

        // Create tutorials menu
        const menu = document.createElement('div');
        menu.id = 'tutorial-menu';
        menu.innerHTML = `
            <div class="menu-header">
                <h3>Tutorials</h3>
                <button class="menu-close">&times;</button>
            </div>
            <div class="menu-list"></div>
        `;
        document.body.appendChild(menu);

        this.populateTutorialMenu();
        this.injectStyles();
    },

    // Populate tutorial menu
    populateTutorialMenu() {
        const menuList = document.querySelector('#tutorial-menu .menu-list');
        if (!menuList) return;

        menuList.innerHTML = Object.values(this.tutorials).map(tutorial => {
            const isCompleted = this.completedTutorials.includes(tutorial.id);
            const isLocked = tutorial.prerequisite && !this.completedTutorials.includes(tutorial.prerequisite);

            return `
                <div class="menu-item ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}"
                     data-tutorial="${tutorial.id}">
                    <div class="menu-item-icon">
                        ${isCompleted ? '✓' : isLocked ? '🔒' : '○'}
                    </div>
                    <div class="menu-item-info">
                        <h4>${tutorial.title}</h4>
                        <p>${tutorial.description}</p>
                    </div>
                    <div class="menu-item-steps">${tutorial.steps.length} steps</div>
                </div>
            `;
        }).join('');
    },

    // Bind events
    bindEvents() {
        // Help button
        document.getElementById('tutorial-help-btn')?.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Menu close
        document.querySelector('#tutorial-menu .menu-close')?.addEventListener('click', () => {
            this.toggleMenu(false);
        });

        // Menu items
        document.querySelectorAll('#tutorial-menu .menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const tutorialId = item.dataset.tutorial;
                if (!item.classList.contains('locked')) {
                    this.start(tutorialId);
                    this.toggleMenu(false);
                }
            });
        });

        // Welcome buttons
        document.getElementById('start-tutorial')?.addEventListener('click', () => {
            this.hideWelcome();
            this.start('getting-started');
        });

        document.getElementById('skip-welcome')?.addEventListener('click', () => {
            this.hideWelcome();
        });

        // Tutorial controls
        document.querySelector('.tutorial-close')?.addEventListener('click', () => {
            this.stop();
        });

        document.querySelector('.tutorial-prev')?.addEventListener('click', () => {
            this.prev();
        });

        document.querySelector('.tutorial-next')?.addEventListener('click', () => {
            this.next();
        });

        document.querySelector('.tutorial-skip')?.addEventListener('click', () => {
            this.stop();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            if (e.key === 'Escape') this.stop();
            if (e.key === 'ArrowRight') this.next();
            if (e.key === 'ArrowLeft') this.prev();
        });
    },

    // Show welcome modal
    showWelcome() {
        const welcome = document.getElementById('tutorial-welcome');
        if (welcome) {
            welcome.classList.add('active');
        }
    },

    // Hide welcome modal
    hideWelcome() {
        const welcome = document.getElementById('tutorial-welcome');
        if (welcome) {
            welcome.classList.remove('active');
            localStorage.setItem('obelisk_welcomed', 'true');
        }
    },

    // Toggle tutorials menu
    toggleMenu(show = null) {
        const menu = document.getElementById('tutorial-menu');
        if (menu) {
            if (show === null) {
                menu.classList.toggle('active');
            } else {
                menu.classList.toggle('active', show);
            }
        }
    },

    // Start a tutorial
    start(tutorialId) {
        const tutorial = this.tutorials[tutorialId];
        if (!tutorial) {
            console.warn('[TUTORIAL] Tutorial not found:', tutorialId);
            return;
        }

        // Check prerequisite
        if (tutorial.prerequisite && !this.completedTutorials.includes(tutorial.prerequisite)) {
            alert(`Please complete "${this.tutorials[tutorial.prerequisite].title}" first.`);
            return;
        }

        this.currentTutorial = tutorial;
        this.currentStep = 0;
        this.isActive = true;

        document.getElementById('tutorial-overlay')?.classList.add('active');
        this.showStep();

        console.log('[TUTORIAL] Started:', tutorialId);
    },

    // Stop current tutorial
    stop() {
        this.isActive = false;
        this.currentTutorial = null;
        this.currentStep = 0;

        document.getElementById('tutorial-overlay')?.classList.remove('active');
        this.clearHighlight();

        console.log('[TUTORIAL] Stopped');
    },

    // Show current step
    showStep() {
        if (!this.currentTutorial || !this.isActive) return;

        const step = this.currentTutorial.steps[this.currentStep];
        if (!step) return;

        const overlay = document.getElementById('tutorial-overlay');
        const tooltip = overlay?.querySelector('.tutorial-tooltip');
        const spotlight = overlay?.querySelector('.tutorial-spotlight');

        if (!tooltip || !spotlight) return;

        // Update content
        tooltip.querySelector('.tutorial-step-indicator').textContent =
            `Step ${this.currentStep + 1} of ${this.currentTutorial.steps.length}`;
        tooltip.querySelector('.tutorial-title').textContent = step.title;
        tooltip.querySelector('.tutorial-content').textContent = step.content;

        // Update buttons
        const prevBtn = tooltip.querySelector('.tutorial-prev');
        const nextBtn = tooltip.querySelector('.tutorial-next');

        prevBtn.style.display = this.currentStep === 0 ? 'none' : 'block';
        nextBtn.textContent = this.currentStep === this.currentTutorial.steps.length - 1 ? 'Finish' : 'Next';

        // Position tooltip
        if (step.isModal || !step.target) {
            // Center modal
            tooltip.classList.add('modal-mode');
            spotlight.style.display = 'none';
            this.clearHighlight();
        } else {
            tooltip.classList.remove('modal-mode');
            spotlight.style.display = 'block';

            const target = document.querySelector(step.target);
            if (target) {
                this.highlightElement(target, spotlight);
                this.positionTooltip(tooltip, target, step.position);
            } else {
                console.warn('[TUTORIAL] Target not found:', step.target);
            }
        }
    },

    // Highlight element
    highlightElement(element, spotlight) {
        this.clearHighlight();

        const rect = element.getBoundingClientRect();
        const padding = 8;

        spotlight.style.left = `${rect.left - padding}px`;
        spotlight.style.top = `${rect.top - padding}px`;
        spotlight.style.width = `${rect.width + padding * 2}px`;
        spotlight.style.height = `${rect.height + padding * 2}px`;

        element.classList.add('tutorial-highlight');
    },

    // Clear highlight
    clearHighlight() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    },

    // Position tooltip near target
    positionTooltip(tooltip, target, position = 'bottom') {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const margin = 16;

        let top, left;

        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - margin;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + margin;
                break;
            default:
                top = rect.bottom + margin;
                left = rect.left;
        }

        // Keep within viewport
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    },

    // Go to next step
    next() {
        if (!this.currentTutorial) return;

        if (this.currentStep < this.currentTutorial.steps.length - 1) {
            this.currentStep++;
            this.showStep();
        } else {
            // Tutorial complete
            this.complete();
        }
    },

    // Go to previous step
    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    },

    // Mark tutorial as complete
    complete() {
        if (this.currentTutorial && !this.completedTutorials.includes(this.currentTutorial.id)) {
            this.completedTutorials.push(this.currentTutorial.id);
            this.saveProgress();
            this.populateTutorialMenu();
        }

        this.stop();
        this.showCompletionMessage();
    },

    // Show completion message
    showCompletionMessage() {
        const toast = document.createElement('div');
        toast.className = 'tutorial-toast';
        toast.innerHTML = `
            <span class="toast-icon">🎉</span>
            <span class="toast-text">Tutorial completed!</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Inject CSS styles
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Tutorial Overlay */
            #tutorial-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 500;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
            }
            #tutorial-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }

            .tutorial-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.75);
            }

            .tutorial-spotlight {
                position: absolute;
                border-radius: 8px;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
                transition: all 0.3s ease;
                pointer-events: none;
            }

            .tutorial-tooltip {
                position: absolute;
                background: linear-gradient(135deg, #1a1a2e, #0a0a0f);
                border: 2px solid #00ff88;
                border-radius: 16px;
                padding: 20px;
                max-width: 350px;
                box-shadow: 0 20px 60px rgba(0, 255, 136, 0.2);
                z-index: 10001;
                transition: all 0.3s ease;
            }

            .tutorial-tooltip.modal-mode {
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%);
                max-width: 450px;
            }

            .tutorial-tooltip-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .tutorial-step-indicator {
                color: #00aaff;
                font-size: 12px;
                font-weight: 600;
            }

            .tutorial-close {
                background: none;
                border: none;
                color: #666;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .tutorial-close:hover { color: #ff4444; }

            .tutorial-title {
                color: #00ff88;
                font-size: 18px;
                margin: 0 0 12px;
            }

            .tutorial-content {
                color: #aaa;
                font-size: 14px;
                line-height: 1.6;
                margin: 0 0 20px;
            }

            .tutorial-actions {
                display: flex;
                gap: 10px;
            }

            .tutorial-btn {
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
            }

            .tutorial-prev {
                background: transparent;
                border: 1px solid #333;
                color: #888;
            }
            .tutorial-prev:hover {
                border-color: #00ff88;
                color: #00ff88;
            }

            .tutorial-next {
                background: linear-gradient(135deg, #00ff88, #00aaff);
                border: none;
                color: #000;
                flex: 1;
            }
            .tutorial-next:hover {
                transform: scale(1.02);
            }

            .tutorial-skip {
                background: transparent;
                border: none;
                color: #666;
                font-size: 12px;
            }
            .tutorial-skip:hover { color: #888; }

            /* Highlight */
            .tutorial-highlight {
                position: relative;
                z-index: 501;
                animation: tutorial-pulse 2s infinite;
            }
            @keyframes tutorial-pulse {
                0%, 100% { box-shadow: 0 0 0 4px rgba(0, 255, 136, 0.3); }
                50% { box-shadow: 0 0 0 8px rgba(0, 255, 136, 0.1); }
            }

            /* Welcome Modal */
            #tutorial-welcome {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10002;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.4s;
            }
            #tutorial-welcome.active {
                opacity: 1;
                pointer-events: auto;
            }

            .welcome-modal {
                background: linear-gradient(135deg, #1a1a2e, #0a0a0f);
                border: 2px solid #00ff88;
                border-radius: 24px;
                padding: 40px;
                text-align: center;
                max-width: 500px;
                transform: scale(0.9);
                transition: transform 0.3s;
            }
            #tutorial-welcome.active .welcome-modal {
                transform: scale(1);
            }

            .welcome-icon svg {
                width: 80px;
                height: 80px;
                margin-bottom: 20px;
            }

            .welcome-modal h2 {
                color: #fff;
                font-size: 28px;
                margin: 0 0 10px;
            }

            .welcome-modal > p {
                color: #888;
                font-size: 16px;
                margin: 0 0 30px;
            }

            .welcome-features {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-bottom: 30px;
                flex-wrap: wrap;
            }

            .feature {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #aaa;
                font-size: 14px;
            }

            .feature-icon {
                font-size: 20px;
            }

            .welcome-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .welcome-btn {
                padding: 15px 30px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .welcome-btn.primary {
                background: linear-gradient(135deg, #00ff88, #00aaff);
                border: none;
                color: #000;
            }
            .welcome-btn.primary:hover {
                transform: scale(1.02);
                box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
            }

            .welcome-btn.secondary {
                background: transparent;
                border: 1px solid #333;
                color: #888;
            }
            .welcome-btn.secondary:hover {
                border-color: #00ff88;
                color: #00ff88;
            }

            /* Help Button */
            #tutorial-help-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #00ff88, #00aaff);
                border: none;
                color: #000;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
                transition: all 0.3s;
                z-index: 400;
            }
            #tutorial-help-btn:hover {
                transform: scale(1.1);
            }

            /* Tutorial Menu */
            #tutorial-menu {
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: linear-gradient(135deg, #1a1a2e, #0a0a0f);
                border: 1px solid #00ff88;
                border-radius: 16px;
                width: 320px;
                max-height: 400px;
                overflow: hidden;
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
                transition: all 0.3s;
                z-index: 9998;
            }
            #tutorial-menu.active {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }

            .menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid #222;
            }

            .menu-header h3 {
                color: #00ff88;
                margin: 0;
                font-size: 16px;
            }

            .menu-close {
                background: none;
                border: none;
                color: #666;
                font-size: 20px;
                cursor: pointer;
            }

            .menu-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .menu-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                cursor: pointer;
                transition: background 0.2s;
                border-bottom: 1px solid #1a1a1a;
            }
            .menu-item:hover {
                background: rgba(0, 255, 136, 0.1);
            }
            .menu-item.locked {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .menu-item.completed .menu-item-icon {
                color: #00ff88;
            }

            .menu-item-icon {
                font-size: 18px;
                color: #444;
            }

            .menu-item-info h4 {
                color: #fff;
                font-size: 14px;
                margin: 0 0 4px;
            }

            .menu-item-info p {
                color: #666;
                font-size: 12px;
                margin: 0;
            }

            .menu-item-steps {
                color: #00aaff;
                font-size: 11px;
                margin-left: auto;
            }

            /* Toast */
            .tutorial-toast {
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: linear-gradient(135deg, #00ff88, #00aaff);
                color: #000;
                padding: 16px 24px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                opacity: 0;
                transition: all 0.3s;
                z-index: 10003;
            }
            .tutorial-toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }

            .toast-icon {
                font-size: 20px;
            }
        `;
        document.head.appendChild(style);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ObeliskTutorial.init());
} else {
    ObeliskTutorial.init();
}

// Export for use in other modules
window.ObeliskTutorial = ObeliskTutorial;
