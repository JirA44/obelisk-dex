/**
 * OBELISK Firebase Authentication
 * Supports: Email/Password, Google, Twitter, GitHub
 * Works alongside SIWE (wallet) auth
 */

// Firebase config - loaded from env-config.js or ObeliskConfig
// These are client-side keys (safe to expose) but centralized for easy rotation
// To configure: set window.FIREBASE_CONFIG before this script loads, or edit env-config.js
const firebaseConfig = window.FIREBASE_CONFIG || {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// State
const FirebaseAuth = {
    app: null,
    auth: null,
    user: null,
    initialized: false,
    onAuthChangeCallbacks: [],

    // Initialize Firebase
    async init() {
        if (this.initialized) return;

        try {
            // Dynamic import Firebase (loaded from CDN in HTML)
            if (typeof firebase === 'undefined') {
                console.warn('[FIREBASE] Firebase SDK not loaded. Add to HTML:');
                console.warn('<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>');
                console.warn('<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>');
                return false;
            }

            // Initialize app
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(firebaseConfig);
            } else {
                this.app = firebase.apps[0];
            }

            this.auth = firebase.auth();

            // Listen for auth state changes
            this.auth.onAuthStateChanged((user) => {
                this.user = user;
                this.onAuthChangeCallbacks.forEach(cb => cb(user));

                if (user) {
                    console.log('[FIREBASE] User signed in:', user.email || user.uid);
                    this.syncWithBackend(user);
                } else {
                    console.log('[FIREBASE] User signed out');
                }
            });

            this.initialized = true;
            console.log('[FIREBASE] Initialized');
            return true;

        } catch (error) {
            console.error('[FIREBASE] Init error:', error);
            return false;
        }
    },

    // Register auth state change callback
    onAuthChange(callback) {
        this.onAuthChangeCallbacks.push(callback);
        // Call immediately with current state
        if (this.initialized) {
            callback(this.user);
        }
    },

    // ==========================================
    // EMAIL/PASSWORD AUTH
    // ==========================================

    async signUpWithEmail(email, password, displayName = null) {
        try {
            const result = await this.auth.createUserWithEmailAndPassword(email, password);

            // Update display name if provided
            if (displayName && result.user) {
                await result.user.updateProfile({ displayName });
            }

            // Send email verification
            await result.user.sendEmailVerification();

            return {
                success: true,
                user: result.user,
                message: 'Account created. Please check your email to verify.'
            };
        } catch (error) {
            return this.handleError(error);
        }
    },

    async signInWithEmail(email, password) {
        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            return {
                success: true,
                user: result.user
            };
        } catch (error) {
            return this.handleError(error);
        }
    },

    async sendPasswordReset(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return {
                success: true,
                message: 'Password reset email sent.'
            };
        } catch (error) {
            return this.handleError(error);
        }
    },

    // ==========================================
    // SOCIAL AUTH
    // ==========================================

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            const result = await this.auth.signInWithPopup(provider);
            return {
                success: true,
                user: result.user,
                isNewUser: result.additionalUserInfo?.isNewUser
            };
        } catch (error) {
            return this.handleError(error);
        }
    },

    async signInWithTwitter() {
        try {
            const provider = new firebase.auth.TwitterAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            return {
                success: true,
                user: result.user,
                isNewUser: result.additionalUserInfo?.isNewUser
            };
        } catch (error) {
            return this.handleError(error);
        }
    },

    async signInWithGitHub() {
        try {
            const provider = new firebase.auth.GithubAuthProvider();
            provider.addScope('user:email');

            const result = await this.auth.signInWithPopup(provider);
            return {
                success: true,
                user: result.user,
                isNewUser: result.additionalUserInfo?.isNewUser
            };
        } catch (error) {
            return this.handleError(error);
        }
    },

    // ==========================================
    // SESSION MANAGEMENT
    // ==========================================

    async signOut() {
        try {
            await this.auth.signOut();
            // Clear local session
            localStorage.removeItem('obelisk_firebase_token');
            return { success: true };
        } catch (error) {
            return this.handleError(error);
        }
    },

    async getIdToken(forceRefresh = false) {
        if (!this.user) return null;
        try {
            return await this.user.getIdToken(forceRefresh);
        } catch (error) {
            console.error('[FIREBASE] Token error:', error);
            return null;
        }
    },

    // ==========================================
    // BACKEND SYNC
    // ==========================================

    async syncWithBackend(user) {
        try {
            const token = await user.getIdToken();

            // Send to backend to create/update user profile
            const response = await fetch('/api/auth/firebase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                    provider: user.providerData[0]?.providerId
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('[FIREBASE] Synced with backend:', data);
                return data;
            }
        } catch (error) {
            console.error('[FIREBASE] Backend sync error:', error);
        }
    },

    // ==========================================
    // LINK WALLET TO FIREBASE ACCOUNT
    // ==========================================

    async linkWallet(walletAddress, signature) {
        if (!this.user) {
            return { success: false, error: 'Not signed in' };
        }

        try {
            const token = await this.user.getIdToken();

            const response = await fetch('/api/auth/link-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    walletAddress,
                    signature,
                    firebaseUid: this.user.uid
                })
            });

            if (response.ok) {
                return { success: true, ...(await response.json()) };
            } else {
                const error = await response.json();
                return { success: false, error: error.message };
            }
        } catch (error) {
            return this.handleError(error);
        }
    },

    // ==========================================
    // HELPERS
    // ==========================================

    handleError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed.',
            'auth/network-request-failed': 'Network error. Check your connection.'
        };

        const message = errorMessages[error.code] || error.message;
        console.error('[FIREBASE]', error.code, message);

        return {
            success: false,
            error: message,
            code: error.code
        };
    },

    getCurrentUser() {
        return this.user;
    },

    isSignedIn() {
        return !!this.user;
    },

    isEmailVerified() {
        return this.user?.emailVerified || false;
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FirebaseAuth.init());
} else {
    FirebaseAuth.init();
}

// Export
if (typeof window !== 'undefined') {
    window.FirebaseAuth = FirebaseAuth;
}
