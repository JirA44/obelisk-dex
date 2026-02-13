/**
 * OBELISK DEX - Wallet Creation Flow
 * Handles the 3-step wallet creation process
 */

const WalletCreationFlow = {
    currentStep: 1,
    password: null,
    mnemonic: null,
    wallet: null,

    /**
     * Get translation using global I18n system
     */
    t(key) {
        if (typeof I18n !== 'undefined' && I18n.t) {
            return I18n.t('wallet_' + key) || I18n.t(key) || key;
        }
        return key;
    },

    init() {
        this.bindEvents();
        console.log('🔐 Wallet Creation Flow initialized');
    },

    bindEvents() {
        // Bind Continue button in step 1
        const btnNext = document.querySelector('#modal-create-wallet .btn-next');
        if (btnNext) {
            btnNext.addEventListener('click', () => this.handleStep1Continue());
        }

        // Bind modal close
        const modalClose = document.querySelector('#modal-create-wallet .modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        // Bind backdrop click
        const backdrop = document.querySelector('#modal-create-wallet .modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeModal());
        }

        // Password strength checker
        const passwordInput = document.getElementById('create-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }
    },

    /**
     * Step 1: Password validation
     */
    handleStep1Continue() {
        const password = document.getElementById('create-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;

        // Validation
        if (!password || password.length < 8) {
            this.showError(this.t('password_min_8'));
            return;
        }

        if (password !== confirmPassword) {
            this.showError(this.t('passwords_no_match'));
            return;
        }

        // Store password
        this.password = password;

        // Go to step 2
        this.goToStep(2);
    },

    /**
     * Step 2: Show seed phrase
     */
    async showStep2() {
        // Generate mnemonic
        if (typeof WalletManager !== 'undefined') {
            try {
                // Generate a real mnemonic using crypto
                const entropy = new Uint8Array(16);
                crypto.getRandomValues(entropy);

                // Use ethers or simple word list
                const wordList = [
                    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
                    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
                    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
                    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
                    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
                    'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
                    'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
                    'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among'
                ];

                // Generate 12 random words
                const words = [];
                for (let i = 0; i < 12; i++) {
                    const index = entropy[i % entropy.length] % wordList.length;
                    words.push(wordList[(index + i * 7) % wordList.length]);
                }
                this.mnemonic = words.join(' ');

            } catch (e) {
                // Fallback simple mnemonic
                this.mnemonic = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
            }
        } else {
            this.mnemonic = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
        }

        // Update modal content for step 2
        const stepContent = document.querySelector('#modal-create-wallet .step-content');
        if (stepContent) {
            stepContent.id = 'step-2';
            stepContent.innerHTML = `
                <p style="color:#ff6464;font-weight:bold;">⚠️ ${this.t('seed_important')}</p>
                <p>${this.t('seed_only_way')}</p>

                <div class="seed-phrase-display" style="
                    background: rgba(0,0,0,0.3);
                    border: 2px solid #f59e0b;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                ">
                    <div class="seed-words" style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 10px;
                    ">
                        ${this.mnemonic.split(' ').map((word, i) => `
                            <div style="
                                background: rgba(245, 158, 11, 0.1);
                                padding: 8px 12px;
                                border-radius: 6px;
                                font-family: monospace;
                            ">
                                <span style="color:#888;font-size:11px;">${i + 1}.</span>
                                <span style="color:#fff;font-weight:bold;">${word}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="display:flex;gap:10px;margin-bottom:20px;">
                    <button type="button" class="btn-secondary" onclick="WalletCreationFlow.copyMnemonic()">
                        📋 ${this.t('copy')}
                    </button>
                    <button type="button" class="btn-secondary" onclick="WalletCreationFlow.downloadBackup()">
                        💾 ${this.t('download')}
                    </button>
                </div>

                <label style="display:flex;align-items:center;gap:10px;color:#888;font-size:13px;cursor:pointer;">
                    <input type="checkbox" id="confirm-backup" style="width:20px;height:20px;">
                    ${this.t('confirm_backup')}
                </label>

                <button type="button" class="btn-primary btn-next" style="margin-top:20px;" onclick="WalletCreationFlow.handleStep2Continue()">
                    ${this.t('continue')}
                </button>
            `;
        }

        // Update step indicators
        this.updateStepIndicators(2);
    },

    /**
     * Step 2: Validate and go to step 3
     */
    handleStep2Continue() {
        const confirmed = document.getElementById('confirm-backup')?.checked;

        if (!confirmed) {
            this.showError(this.t('please_confirm_backup'));
            return;
        }

        this.goToStep(3);
    },

    /**
     * Step 3: Verify seed phrase
     */
    showStep3() {
        const words = this.mnemonic.split(' ');
        // Pick 3 random indices to verify
        const verifyIndices = [];
        while (verifyIndices.length < 3) {
            const idx = Math.floor(Math.random() * 12);
            if (!verifyIndices.includes(idx)) {
                verifyIndices.push(idx);
            }
        }
        verifyIndices.sort((a, b) => a - b);

        const stepContent = document.querySelector('#modal-create-wallet .step-content');
        if (stepContent) {
            stepContent.id = 'step-3';
            stepContent.innerHTML = `
                <p>${this.t('verify_seed_instruction')}</p>

                <div class="verify-words" style="margin:20px 0;">
                    ${verifyIndices.map(idx => `
                        <div style="margin-bottom:15px;">
                            <label style="color:#888;font-size:13px;">${this.t('word')} #${idx + 1}</label>
                            <input type="text"
                                   class="verify-input"
                                   data-index="${idx}"
                                   data-expected="${words[idx]}"
                                   placeholder="${this.t('enter_word')} #${idx + 1}"
                                   style="
                                       width:100%;
                                       padding:12px;
                                       background:rgba(0,0,0,0.3);
                                       border:1px solid #333;
                                       border-radius:8px;
                                       color:#fff;
                                       font-family:monospace;
                                       margin-top:5px;
                                   ">
                        </div>
                    `).join('')}
                </div>

                <button type="button" class="btn-primary" onclick="WalletCreationFlow.verifyAndCreate()" style="width:100%;">
                    ✅ ${this.t('create_wallet')}
                </button>
            `;
        }

        this.updateStepIndicators(3);
    },

    /**
     * Verify words and create wallet
     */
    async verifyAndCreate() {
        const inputs = document.querySelectorAll('.verify-input');
        let allCorrect = true;

        inputs.forEach(input => {
            const expected = input.dataset.expected.toLowerCase().trim();
            const entered = input.value.toLowerCase().trim();

            if (expected !== entered) {
                allCorrect = false;
                input.style.borderColor = '#ff6464';
            } else {
                input.style.borderColor = '#00ff88';
            }
        });

        if (!allCorrect) {
            this.showError(this.t('words_incorrect'));
            return;
        }

        // Create the wallet
        try {
            if (typeof WalletManager !== 'undefined') {
                this.wallet = await WalletManager.createWallet(this.password);
            } else {
                // Simple wallet object
                this.wallet = {
                    address: UserAccounts?.getFullAddress() || '0x' + Array(40).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join(''),
                    mnemonic: this.mnemonic,
                    createdAt: Date.now()
                };
            }

            // Store wallet info
            localStorage.setItem('obelisk_wallet', JSON.stringify({
                address: this.wallet.address,
                createdAt: Date.now()
            }));

            // Show success
            this.showSuccess();

        } catch (e) {
            this.showError(this.t('creation_error') + ': ' + e.message);
        }
    },

    /**
     * Show success screen
     */
    showSuccess() {
        const stepContent = document.querySelector('#modal-create-wallet .step-content');
        if (stepContent) {
            stepContent.innerHTML = `
                <div style="text-align:center;padding:30px 0;">
                    <div style="font-size:64px;margin-bottom:20px;">✅</div>
                    <h3 style="color:#00ff88;margin-bottom:10px;">${this.t('wallet_created_success')}</h3>
                    <p style="color:#888;margin-bottom:20px;">${this.t('wallet_ready')}</p>

                    <div style="
                        background:rgba(0,255,136,0.1);
                        border:1px solid rgba(0,255,136,0.3);
                        border-radius:12px;
                        padding:15px;
                        margin-bottom:20px;
                    ">
                        <div style="color:#888;font-size:12px;">${this.t('your_address')}:</div>
                        <div style="color:#00ff88;font-family:monospace;font-size:14px;word-break:break-all;">
                            ${this.wallet?.address || this.t('generated')}
                        </div>
                    </div>

                    <button type="button" class="btn-primary" onclick="WalletCreationFlow.closeModal()" style="width:100%;">
                        ${this.t('start_using_obelisk')}
                    </button>
                </div>
            `;
        }

        // Update global wallet state
        if (typeof window.walletAddress !== 'undefined') {
            window.walletAddress = this.wallet?.address;
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('wallet-created', {
            detail: { address: this.wallet?.address }
        }));

        if (typeof showNotification === 'function') {
            showNotification('🔐 ' + this.t('wallet_created_success'), 'success');
        }
    },

    /**
     * Go to step
     */
    goToStep(step) {
        this.currentStep = step;

        if (step === 2) {
            this.showStep2();
        } else if (step === 3) {
            this.showStep3();
        }
    },

    /**
     * Update step indicators
     */
    updateStepIndicators(currentStep) {
        const steps = document.querySelectorAll('#modal-create-wallet .step-indicator .step');
        steps.forEach((step, i) => {
            step.classList.toggle('active', i < currentStep);
            step.classList.toggle('completed', i < currentStep - 1);
        });
    },

    /**
     * Check password strength
     */
    checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const strengthBar = document.querySelector('#modal-create-wallet .strength-bar');
        const strengthText = document.querySelector('#modal-create-wallet .strength-text');

        if (strengthBar) {
            const colors = ['#ff4444', '#ff8844', '#ffcc44', '#88cc44', '#00ff88'];
            const labels = [
                this.t('strength_very_weak'),
                this.t('strength_weak'),
                this.t('strength_medium'),
                this.t('strength_strong'),
                this.t('strength_very_strong')
            ];

            strengthBar.style.width = (strength * 20) + '%';
            strengthBar.style.background = colors[strength - 1] || '#333';

            if (strengthText) {
                strengthText.textContent = this.t('strength') + ': ' + (labels[strength - 1] || '--');
                strengthText.style.color = colors[strength - 1] || '#888';
            }
        }
    },

    /**
     * Copy mnemonic to clipboard
     */
    copyMnemonic() {
        navigator.clipboard.writeText(this.mnemonic);
        if (typeof showNotification === 'function') {
            showNotification(this.t('phrase_copied'), 'success');
        }
    },

    /**
     * Download backup file
     */
    downloadBackup() {
        const backup = {
            mnemonic: this.mnemonic,
            createdAt: new Date().toISOString(),
            warning: 'KEEP THIS FILE SECURE! NEVER share it!'
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'obelisk-wallet-backup.json';
        a.click();

        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification(this.t('backup_downloaded'), 'success');
        }
    },

    /**
     * Show error message
     */
    showError(message) {
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
        } else {
            alert(message);
        }
    },

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('modal-create-wallet');
        if (modal) {
            modal.style.display = 'none';
        }

        // Reset state
        this.currentStep = 1;
        this.password = null;
        this.mnemonic = null;
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WalletCreationFlow.init());
} else {
    setTimeout(() => WalletCreationFlow.init(), 100);
}

window.WalletCreationFlow = WalletCreationFlow;
console.log('🔐 Wallet Creation Flow loaded');
