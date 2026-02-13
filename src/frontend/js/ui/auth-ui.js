/**
 * OBELISK Auth UI
 * Login/Register modal with Firebase + Wallet support
 */

const AuthUI = {
    modal: null,
    currentMode: 'login', // login, register, forgot

    // Helper for French translations
    isFr() {
        return typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
    },

    // Create and show auth modal
    show(mode = 'login') {
        this.currentMode = mode;
        this.createModal();
        this.modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    },

    hide() {
        if (this.modal) {
            this.modal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    },

    createModal() {
        // Remove existing modal
        if (this.modal) {
            this.modal.remove();
        }

        this.modal = document.createElement('div');
        this.modal.className = 'auth-modal';
        this.modal.innerHTML = `
            <div class="auth-modal-overlay" onclick="AuthUI.hide()"></div>
            <div class="auth-modal-content">
                <button class="auth-modal-close" onclick="AuthUI.hide()">&times;</button>

                <div class="auth-logo">
                    <span class="logo-icon">◈</span>
                    <span class="logo-text">OBELISK</span>
                </div>

                <div class="auth-tabs">
                    <button class="auth-tab ${this.currentMode === 'login' ? 'active' : ''}"
                            onclick="AuthUI.switchMode('login')">${this.isFr() ? 'Connexion' : 'Sign In'}</button>
                    <button class="auth-tab ${this.currentMode === 'register' ? 'active' : ''}"
                            onclick="AuthUI.switchMode('register')">${this.isFr() ? 'Créer un compte' : 'Create Account'}</button>
                </div>

                <div class="auth-form-container" id="auth-form-container">
                    ${this.renderForm()}
                </div>

                <div class="auth-divider">
                    <span>${this.isFr() ? 'ou continuer avec' : 'or continue with'}</span>
                </div>

                <div class="auth-social-buttons">
                    <button class="auth-social-btn google" onclick="AuthUI.signInGoogle()">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                    </button>
                    <button class="auth-social-btn twitter" onclick="AuthUI.signInTwitter()">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        X
                    </button>
                    <button class="auth-social-btn github" onclick="AuthUI.signInGitHub()">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        GitHub
                    </button>
                </div>

                <div class="auth-wallet-section">
                    <button class="auth-wallet-btn" onclick="AuthUI.connectWallet()">
                        <span class="wallet-icon">🦊</span>
                        ${this.isFr() ? 'Connecter Wallet' : 'Connect Wallet'}
                    </button>
                </div>

                <p class="auth-terms">
                    ${this.isFr()
                        ? 'En continuant, vous acceptez nos <a href="/terms" target="_blank">Conditions d\'utilisation</a> et notre <a href="/privacy" target="_blank">Politique de confidentialité</a>'
                        : 'By continuing, you agree to our <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>'}
                </p>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.addStyles();
    },

    renderForm() {
        const fr = this.isFr();
        if (this.currentMode === 'login') {
            return `
                <form class="auth-form" onsubmit="AuthUI.handleLogin(event)">
                    <div class="auth-field">
                        <label>Email</label>
                        <input type="email" id="auth-email" placeholder="${fr ? 'vous@exemple.com' : 'you@example.com'}" required>
                    </div>
                    <div class="auth-field">
                        <label>${fr ? 'Mot de passe' : 'Password'}</label>
                        <input type="password" id="auth-password" placeholder="••••••••" required>
                    </div>
                    <button type="button" class="auth-forgot" onclick="AuthUI.switchMode('forgot')">
                        ${fr ? 'Mot de passe oublié ?' : 'Forgot password?'}
                    </button>
                    <button type="submit" class="auth-submit-btn">
                        <span class="btn-text">${fr ? 'Connexion' : 'Sign In'}</span>
                    </button>
                    <div class="auth-error" id="auth-error"></div>
                </form>
            `;
        } else if (this.currentMode === 'register') {
            return `
                <form class="auth-form" onsubmit="AuthUI.handleRegister(event)">
                    <div class="auth-field">
                        <label>${fr ? 'Nom d\'affichage' : 'Display Name'}</label>
                        <input type="text" id="auth-name" placeholder="${fr ? 'Votre nom' : 'Your name'}" required>
                    </div>
                    <div class="auth-field">
                        <label>Email</label>
                        <input type="email" id="auth-email" placeholder="${fr ? 'vous@exemple.com' : 'you@example.com'}" required>
                    </div>
                    <div class="auth-field">
                        <label>${fr ? 'Mot de passe' : 'Password'}</label>
                        <input type="password" id="auth-password" placeholder="${fr ? 'Min. 6 caractères' : 'Min. 6 characters'}" required minlength="6">
                    </div>
                    <button type="submit" class="auth-submit-btn">
                        <span class="btn-text">${fr ? 'Créer un compte' : 'Create Account'}</span>
                    </button>
                    <div class="auth-error" id="auth-error"></div>
                </form>
            `;
        } else {
            return `
                <form class="auth-form" onsubmit="AuthUI.handleForgot(event)">
                    <p class="auth-forgot-text">${fr ? 'Entrez votre email et nous vous enverrons un lien de réinitialisation.' : 'Enter your email and we\'ll send you a reset link.'}</p>
                    <div class="auth-field">
                        <label>Email</label>
                        <input type="email" id="auth-email" placeholder="${fr ? 'vous@exemple.com' : 'you@example.com'}" required>
                    </div>
                    <button type="submit" class="auth-submit-btn">
                        <span class="btn-text">${fr ? 'Envoyer le lien' : 'Send Reset Link'}</span>
                    </button>
                    <button type="button" class="auth-back" onclick="AuthUI.switchMode('login')">
                        ${fr ? '← Retour à la connexion' : '← Back to Sign In'}
                    </button>
                    <div class="auth-error" id="auth-error"></div>
                    <div class="auth-success" id="auth-success"></div>
                </form>
            `;
        }
    },

    switchMode(mode) {
        this.currentMode = mode;
        const container = document.getElementById('auth-form-container');
        if (container) {
            container.innerHTML = this.renderForm();
        }
        // Update tabs
        const fr = this.isFr();
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
            if ((tab.textContent.includes('Sign In') || tab.textContent.includes('Connexion')) && mode === 'login') tab.classList.add('active');
            if ((tab.textContent.includes('Create') || tab.textContent.includes('Créer')) && mode === 'register') tab.classList.add('active');
        });
    },

    showError(message) {
        const el = document.getElementById('auth-error');
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
        }
    },

    showSuccess(message) {
        const el = document.getElementById('auth-success');
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
        }
    },

    setLoading(loading) {
        const btn = document.querySelector('.auth-submit-btn');
        if (btn) {
            if (loading) {
                btn.classList.add('btn-loading');
                btn.disabled = true;
            } else {
                btn.classList.remove('btn-loading');
                btn.disabled = false;
            }
        }
    },

    // Auth handlers
    async handleLogin(e) {
        e.preventDefault();
        this.setLoading(true);

        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        const result = await FirebaseAuth.signInWithEmail(email, password);

        this.setLoading(false);

        if (result.success) {
            this.hide();
            const isFr1 = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.showNotification(isFr1 ? 'Bon retour !' : 'Welcome back!', 'success');
        } else {
            this.showError(result.error);
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        this.setLoading(true);

        const name = document.getElementById('auth-name').value;
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        const result = await FirebaseAuth.signUpWithEmail(email, password, name);

        this.setLoading(false);

        if (result.success) {
            this.hide();
            const isFr2 = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
            this.showNotification(isFr2 ? 'Compte créé ! Vérifiez votre email.' : 'Account created! Check your email to verify.', 'success');
        } else {
            this.showError(result.error);
        }
    },

    async handleForgot(e) {
        e.preventDefault();
        this.setLoading(true);

        const email = document.getElementById('auth-email').value;
        const result = await FirebaseAuth.sendPasswordReset(email);

        this.setLoading(false);

        if (result.success) {
            this.showSuccess(result.message);
        } else {
            this.showError(result.error);
        }
    },

    async signInGoogle() {
        const result = await FirebaseAuth.signInWithGoogle();
        if (result.success) {
            this.hide();
            const fr = this.isFr();
            this.showNotification(fr ? (result.isNewUser ? 'Bienvenue !' : 'Bon retour !') : `Welcome${result.isNewUser ? '' : ' back'}!`, 'success');
        } else if (result.error !== 'Sign-in popup was closed.') {
            this.showError(result.error);
        }
    },

    async signInTwitter() {
        const result = await FirebaseAuth.signInWithTwitter();
        if (result.success) {
            this.hide();
            const fr = this.isFr();
            this.showNotification(fr ? (result.isNewUser ? 'Bienvenue !' : 'Bon retour !') : `Welcome${result.isNewUser ? '' : ' back'}!`, 'success');
        } else if (result.error !== 'Sign-in popup was closed.') {
            this.showError(result.error);
        }
    },

    async signInGitHub() {
        const result = await FirebaseAuth.signInWithGitHub();
        if (result.success) {
            this.hide();
            const fr = this.isFr();
            this.showNotification(fr ? (result.isNewUser ? 'Bienvenue !' : 'Bon retour !') : `Welcome${result.isNewUser ? '' : ' back'}!`, 'success');
        } else if (result.error !== 'Sign-in popup was closed.') {
            this.showError(result.error);
        }
    },

    async connectWallet() {
        // Trigger existing wallet connection
        if (typeof connectWallet === 'function') {
            await connectWallet();
            this.hide();
        } else {
            const fr = this.isFr();
            this.showError(fr ? 'Connexion wallet non disponible' : 'Wallet connection not available');
        }
    },

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            alert(message);
        }
    },

    addStyles() {
        if (document.getElementById('auth-ui-styles')) return;

        const style = document.createElement('style');
        style.id = 'auth-ui-styles';
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            .auth-modal.visible {
                opacity: 1;
                visibility: visible;
            }
            .auth-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
            }
            .auth-modal-content {
                position: relative;
                background: linear-gradient(180deg, #0a0a18 0%, #050510 100%);
                border: 1px solid rgba(0, 170, 255, 0.2);
                border-radius: 16px;
                padding: 32px;
                width: 100%;
                max-width: 400px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 0 40px rgba(0, 170, 255, 0.1);
            }
            .auth-modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                color: #8ab4ff;
                font-size: 24px;
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.2s;
            }
            .auth-modal-close:hover { opacity: 1; }
            .auth-logo {
                text-align: center;
                margin-bottom: 24px;
            }
            .auth-logo .logo-icon {
                font-size: 32px;
                color: #00aaff;
            }
            .auth-logo .logo-text {
                display: block;
                font-size: 24px;
                font-weight: bold;
                background: linear-gradient(135deg, #00aaff, #8a2be2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-top: 4px;
            }
            .auth-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 24px;
            }
            .auth-tab {
                flex: 1;
                padding: 12px;
                background: transparent;
                border: 1px solid rgba(138, 180, 255, 0.2);
                border-radius: 8px;
                color: #8ab4ff;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .auth-tab:hover { border-color: rgba(0, 170, 255, 0.4); }
            .auth-tab.active {
                background: rgba(0, 170, 255, 0.1);
                border-color: #00aaff;
                color: #e8f0ff;
            }
            .auth-field {
                margin-bottom: 16px;
            }
            .auth-field label {
                display: block;
                color: #8ab4ff;
                font-size: 12px;
                margin-bottom: 6px;
            }
            .auth-field input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(138, 180, 255, 0.2);
                border-radius: 8px;
                color: #e8f0ff;
                font-size: 14px;
                transition: border-color 0.2s;
            }
            .auth-field input:focus {
                outline: none;
                border-color: #00aaff;
            }
            .auth-forgot {
                background: none;
                border: none;
                color: #00aaff;
                font-size: 12px;
                cursor: pointer;
                margin-bottom: 16px;
                padding: 0;
            }
            .auth-forgot:hover { text-decoration: underline; }
            .auth-submit-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #00aaff, #0088dd);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }
            .auth-submit-btn:hover { transform: translateY(-1px); }
            .auth-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
            .auth-divider {
                display: flex;
                align-items: center;
                margin: 24px 0;
                color: #4a6090;
                font-size: 12px;
            }
            .auth-divider::before, .auth-divider::after {
                content: '';
                flex: 1;
                height: 1px;
                background: rgba(138, 180, 255, 0.2);
            }
            .auth-divider span { padding: 0 12px; }
            .auth-social-buttons {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
            }
            .auth-social-btn {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(138, 180, 255, 0.2);
                border-radius: 8px;
                color: #e8f0ff;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .auth-social-btn:hover {
                border-color: rgba(0, 170, 255, 0.4);
                background: rgba(0, 170, 255, 0.1);
            }
            .auth-wallet-section { margin-bottom: 16px; }
            .auth-wallet-btn {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 14px;
                background: linear-gradient(135deg, #8a2be2, #6a1bc2);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .auth-wallet-btn:hover { transform: translateY(-1px); }
            .wallet-icon { font-size: 20px; }
            .auth-terms {
                text-align: center;
                font-size: 11px;
                color: #4a6090;
                margin-top: 16px;
            }
            .auth-terms a { color: #00aaff; }
            .auth-error {
                display: none;
                margin-top: 12px;
                padding: 10px;
                background: rgba(255, 68, 68, 0.1);
                border: 1px solid rgba(255, 68, 68, 0.3);
                border-radius: 8px;
                color: #ff6666;
                font-size: 13px;
                text-align: center;
            }
            .auth-success {
                display: none;
                margin-top: 12px;
                padding: 10px;
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 8px;
                color: #00ff88;
                font-size: 13px;
                text-align: center;
            }
            .auth-back {
                display: block;
                width: 100%;
                margin-top: 12px;
                background: none;
                border: none;
                color: #8ab4ff;
                font-size: 13px;
                cursor: pointer;
            }
            .auth-forgot-text {
                color: #8ab4ff;
                font-size: 13px;
                margin-bottom: 16px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }
};

// Export
if (typeof window !== 'undefined') {
    window.AuthUI = AuthUI;
}
