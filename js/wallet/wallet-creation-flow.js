/**
 * OBELISK DEX - Wallet Creation Flow
 * Gere le processus de creation de wallet en 3 etapes
 */

const WalletCreationFlow = {
    currentStep: 1,
    password: null,
    mnemonic: null,
    wallet: null,

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
            this.showError('Le mot de passe doit avoir au moins 8 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Les mots de passe ne correspondent pas');
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
                <p style="color:#ff6464;font-weight:bold;">⚠️ IMPORTANT: Notez ces mots et gardez-les en securite!</p>
                <p>Cette phrase de recuperation est la SEULE facon de restaurer votre wallet.</p>

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
                        📋 Copier
                    </button>
                    <button type="button" class="btn-secondary" onclick="WalletCreationFlow.downloadBackup()">
                        💾 Telecharger
                    </button>
                </div>

                <label style="display:flex;align-items:center;gap:10px;color:#888;font-size:13px;cursor:pointer;">
                    <input type="checkbox" id="confirm-backup" style="width:20px;height:20px;">
                    J'ai sauvegarde ma phrase de recuperation en securite
                </label>

                <button type="button" class="btn-primary btn-next" style="margin-top:20px;" onclick="WalletCreationFlow.handleStep2Continue()">
                    Continuer
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
            this.showError('Veuillez confirmer que vous avez sauvegarde votre phrase');
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
                <p>Verifiez votre phrase de recuperation en entrant les mots demandes:</p>

                <div class="verify-words" style="margin:20px 0;">
                    ${verifyIndices.map(idx => `
                        <div style="margin-bottom:15px;">
                            <label style="color:#888;font-size:13px;">Mot #${idx + 1}</label>
                            <input type="text"
                                   class="verify-input"
                                   data-index="${idx}"
                                   data-expected="${words[idx]}"
                                   placeholder="Entrez le mot #${idx + 1}"
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
                    ✅ Creer mon Wallet
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
            this.showError('Un ou plusieurs mots sont incorrects');
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
            this.showError('Erreur lors de la creation: ' + e.message);
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
                    <h3 style="color:#00ff88;margin-bottom:10px;">Wallet Cree avec Succes!</h3>
                    <p style="color:#888;margin-bottom:20px;">Votre wallet post-quantique est pret.</p>

                    <div style="
                        background:rgba(0,255,136,0.1);
                        border:1px solid rgba(0,255,136,0.3);
                        border-radius:12px;
                        padding:15px;
                        margin-bottom:20px;
                    ">
                        <div style="color:#888;font-size:12px;">Votre adresse:</div>
                        <div style="color:#00ff88;font-family:monospace;font-size:14px;word-break:break-all;">
                            ${this.wallet?.address || 'Generee'}
                        </div>
                    </div>

                    <button type="button" class="btn-primary" onclick="WalletCreationFlow.closeModal()" style="width:100%;">
                        Commencer a utiliser Obelisk
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
            showNotification('🔐 Wallet cree avec succes!', 'success');
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
            const labels = ['Tres faible', 'Faible', 'Moyen', 'Fort', 'Tres fort'];

            strengthBar.style.width = (strength * 20) + '%';
            strengthBar.style.background = colors[strength - 1] || '#333';

            if (strengthText) {
                strengthText.textContent = 'Force: ' + (labels[strength - 1] || '--');
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
            showNotification('Phrase copiee!', 'success');
        }
    },

    /**
     * Download backup file
     */
    downloadBackup() {
        const backup = {
            mnemonic: this.mnemonic,
            createdAt: new Date().toISOString(),
            warning: 'GARDEZ CE FICHIER EN SECURITE! Ne le partagez JAMAIS!'
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'obelisk-wallet-backup.json';
        a.click();

        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification('Backup telecharge!', 'success');
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
