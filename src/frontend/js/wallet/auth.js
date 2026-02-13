/**
 * Obelisk DEX - Authentication System
 * Email/Username login with wallet linking
 */

const Auth = {
    currentUser: null,

    /**
     * Initialize auth system
     */
    init() {
        // Check for existing session
        const savedUser = localStorage.getItem('obelisk_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUI();
            } catch (e) {
                localStorage.removeItem('obelisk_user');
            }
        }

        this.setupEventListeners();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // Switch between login/signup
        document.querySelectorAll('[data-auth-switch]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.authSwitch;
                this.showAuthModal(target);
            });
        });

        // Close modal
        document.querySelectorAll('.auth-modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.hideAuthModals());
        });

        // Login button in header
        const btnLogin = document.getElementById('btn-login');
        if (btnLogin) {
            btnLogin.addEventListener('click', () => this.showAuthModal('login'));
        }

        // Logout button
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => this.logout());
        }
    },

    /**
     * Show auth modal (login or signup)
     */
    showAuthModal(type) {
        this.hideAuthModals();
        const modal = document.getElementById(`${type}-modal`);
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    },

    /**
     * Hide all auth modals
     */
    hideAuthModals() {
        document.querySelectorAll('.auth-modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.classList.remove('modal-open');
    },

    /**
     * Handle login
     */
    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        if (!email || !password) {
            this.showError(errorEl, I18n.t('fill_all_fields'));
            return;
        }

        const btn = document.querySelector('#login-form button[type="submit"]');
        btn.disabled = true;
        btn.textContent = I18n.t('loading');

        try {
            // Try API login first
            const user = await this.apiLogin(email, password);

            if (user) {
                this.currentUser = user;
                localStorage.setItem('obelisk_user', JSON.stringify(user));
                this.hideAuthModals();
                this.updateUI();
                this.showNotification(I18n.t('login_success'), 'success');
            }
        } catch (error) {
            // Fallback to local storage login
            const localUser = this.localLogin(email, password);
            if (localUser) {
                this.currentUser = localUser;
                localStorage.setItem('obelisk_user', JSON.stringify(localUser));
                this.hideAuthModals();
                this.updateUI();
                this.showNotification(I18n.t('login_success'), 'success');
            } else {
                this.showError(errorEl, I18n.t('invalid_credentials'));
            }
        }

        btn.disabled = false;
        btn.textContent = I18n.t('login');
    },

    /**
     * Handle signup
     */
    async handleSignup() {
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        const phone = document.getElementById('signup-phone')?.value.trim() || '';
        const enable2fa = document.getElementById('signup-enable-2fa')?.checked || false;
        const errorEl = document.getElementById('signup-error');

        // Validation
        if (!username || !email || !password) {
            this.showError(errorEl, I18n.t('fill_all_fields'));
            return;
        }

        if (password !== confirmPassword) {
            this.showError(errorEl, I18n.t('passwords_no_match'));
            return;
        }

        if (password.length < 6) {
            this.showError(errorEl, I18n.t('password_too_short'));
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError(errorEl, I18n.t('invalid_email'));
            return;
        }

        const btn = document.querySelector('#signup-form button[type="submit"]');
        btn.disabled = true;
        btn.textContent = I18n.t('loading');

        try {
            // Create user
            const user = {
                id: this.generateId(),
                username: username,
                email: email,
                phone: phone || null,
                twoFactorEnabled: false,
                passwordHash: await this.hashPassword(password),
                createdAt: new Date().toISOString(),
                wallets: []
            };

            // Save to local storage (and optionally to API)
            this.saveUserLocal(user);

            // Auto-login
            this.currentUser = { ...user, passwordHash: undefined };
            localStorage.setItem('obelisk_user', JSON.stringify(this.currentUser));

            this.hideAuthModals();
            this.updateUI();
            this.showNotification(I18n.t('signup_success'), 'success');

            // Prompt 2FA setup if requested
            if (enable2fa && typeof TwoFactorSetup !== 'undefined') {
                setTimeout(() => {
                    const twofa = new TwoFactorSetup();
                    twofa.showSetupUI();
                }, 500);
            }
        } catch (error) {
            this.showError(errorEl, error.message || I18n.t('signup_error'));
        }

        btn.disabled = false;
        btn.textContent = I18n.t('signup');
    },

    /**
     * Get API URL from config
     */
    getApiUrl() {
        if (typeof ObeliskConfig !== 'undefined') {
            return ObeliskConfig.getApiUrl();
        }
        return window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    },

    /**
     * API Login
     */
    async apiLogin(email, password) {
        const response = await fetch(`${this.getApiUrl()}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Send/receive HttpOnly cookies
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('API login failed');
        }

        return await response.json();
    },

    /**
     * Local storage login
     */
    localLogin(email, password) {
        const users = this.getLocalUsers();
        const user = users.find(u => u.email === email || u.username === email);

        if (user) {
            // Simple password check (in production, use proper hashing comparison)
            const inputHash = this.simpleHash(password);
            if (user.passwordHash === inputHash) {
                return { ...user, passwordHash: undefined };
            }
        }

        return null;
    },

    /**
     * Save user to local storage
     */
    saveUserLocal(user) {
        const users = this.getLocalUsers();

        // Check if email/username already exists
        if (users.some(u => u.email === user.email)) {
            throw new Error(I18n.t('email_exists'));
        }
        if (users.some(u => u.username === user.username)) {
            throw new Error(I18n.t('username_exists'));
        }

        users.push(user);
        localStorage.setItem('obelisk_users', JSON.stringify(users));
    },

    /**
     * Get local users
     */
    getLocalUsers() {
        try {
            return JSON.parse(localStorage.getItem('obelisk_users') || '[]');
        } catch {
            return [];
        }
    },

    /**
     * Sign in with Google (via Firebase)
     */
    async signInWithGoogle() {
        try {
            // Check if FirebaseAuth is available
            if (typeof FirebaseAuth === 'undefined') {
                this.showNotification('Firebase Auth not initialized', 'error');
                console.error('[AUTH] FirebaseAuth not available');
                return;
            }

            // Initialize Firebase if not done
            if (!FirebaseAuth.initialized) {
                await FirebaseAuth.init();
            }

            const result = await FirebaseAuth.signInWithGoogle();

            if (result.success) {
                // Create/update local user from Firebase user
                this.currentUser = {
                    id: result.user.uid,
                    email: result.user.email,
                    username: result.user.displayName || result.user.email?.split('@')[0],
                    photoURL: result.user.photoURL,
                    provider: 'google',
                    wallets: [],
                    createdAt: new Date().toISOString()
                };

                localStorage.setItem('obelisk_user', JSON.stringify(this.currentUser));
                this.hideAuthModals();
                this.updateUI();
                this.showNotification(I18n.t('login_success'), 'success');
            } else {
                this.showNotification(result.error || 'Google sign-in failed', 'error');
            }
        } catch (error) {
            console.error('[AUTH] Google sign-in error:', error);
            this.showNotification(error.message || 'Google sign-in failed', 'error');
        }
    },

    /**
     * Logout
     */
    async logout() {
        // Clear server-side session cookie
        try {
            await fetch(`${this.getApiUrl()}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {
            // Continue even if API is unreachable
        }

        this.currentUser = null;
        localStorage.removeItem('obelisk_user');

        // Also sign out from Firebase if initialized
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.initialized) {
            FirebaseAuth.signOut();
        }

        this.updateUI();
        this.showNotification(I18n.t('logout_success'), 'info');
    },

    /**
     * Update UI based on auth state
     */
    updateUI() {
        const loggedIn = !!this.currentUser;

        // Show/hide elements based on auth state
        document.querySelectorAll('.auth-logged-in').forEach(el => {
            el.style.display = loggedIn ? '' : 'none';
        });
        document.querySelectorAll('.auth-logged-out').forEach(el => {
            el.style.display = loggedIn ? 'none' : '';
        });

        // Update user info display
        if (loggedIn) {
            const usernameEl = document.getElementById('user-display-name');
            if (usernameEl) {
                usernameEl.textContent = this.currentUser.username || this.currentUser.email;
            }
        }
    },

    /**
     * Link wallet to current user
     */
    linkWallet(walletAddress) {
        if (!this.currentUser) return false;

        if (!this.currentUser.wallets) {
            this.currentUser.wallets = [];
        }

        if (!this.currentUser.wallets.includes(walletAddress)) {
            this.currentUser.wallets.push(walletAddress);
            localStorage.setItem('obelisk_user', JSON.stringify(this.currentUser));

            // Update in users list too
            const users = this.getLocalUsers();
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex >= 0) {
                users[userIndex].wallets = this.currentUser.wallets;
                localStorage.setItem('obelisk_users', JSON.stringify(users));
            }
        }

        return true;
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!this.currentUser;
    },

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    },

    /**
     * Utility: Generate unique ID
     */
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Utility: Hash password (simple version for demo)
     */
    async hashPassword(password) {
        return this.simpleHash(password);
    },

    /**
     * Simple hash function
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'h_' + Math.abs(hash).toString(36);
    },

    /**
     * Utility: Validate email
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Show error message
     */
    showError(element, message) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.ObeliskApp && ObeliskApp.showNotification) {
            ObeliskApp.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Export
window.Auth = Auth;
