/**
 * OBELISK DEX - Firebase Persistence Module
 * Sauvegarde les données utilisateur sur Firebase Firestore
 */

const FirebasePersistence = {
    db: null,
    userId: null,
    isInitialized: false,
    pendingChanges: false,
    isSyncing: false,
    lastSync: 0,
    autoSyncTimer: null,

    // Firebase Config
    firebaseConfig: {
        apiKey: "AIzaSyB_G7IOA84_U7lna1houHXlP_nCVE1bjJQ",
        authDomain: "obeliskdex.firebaseapp.com",
        projectId: "obeliskdex",
        storageBucket: "obeliskdex.firebasestorage.app",
        messagingSenderId: "1034245901082",
        appId: "1:1034245901082:web:8b9f699a2620f77cee7aa3",
        measurementId: "G-CBEKYX25WD"
    },

    /**
     * Initialiser Firebase
     */
    async init() {
        try {
            // Vérifier si Firebase est chargé
            if (typeof firebase === 'undefined') {
                console.warn('🔥 Firebase SDK not loaded - retrying in 2s');
                this.updateSyncIndicator('loading');
                setTimeout(() => this.init(), 2000);
                return false;
            }

            // Initialiser Firebase si pas déjà fait
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }

            // Initialiser Firestore
            this.db = firebase.firestore();

            // Obtenir l'ID utilisateur
            this.userId = this.getUserId();

            if (!this.userId) {
                console.warn('🔥 No user ID available');
                this.updateSyncIndicator('no-user');
                return false;
            }

            this.isInitialized = true;

            // Charger les données depuis Firebase
            try {
                await this.loadFromFirebase();
            } catch (loadError) {
                console.warn('🔥 Load failed, will save local data:', loadError.message);
            }

            // Démarrer la synchronisation automatique
            this.startAutoSync();

            // Forcer une sync initiale après 2 secondes
            setTimeout(() => {
                if (this.isInitialized) {
                    this.saveToFirebase();
                }
            }, 2000);

            console.log('🔥 Firebase Persistence initialized for:', this.userId.slice(0, 12) + '...');
            this.updateSyncIndicator('connected');
            return true;

        } catch (e) {
            console.error('🔥 Firebase init error:', e.message);
            this.updateSyncIndicator('error');
            return false;
        }
    },

    /**
     * Obtenir l'ID utilisateur unique
     */
    getUserId() {
        // Priorité 1: Wallet Obelisk
        const obeliskWallet = localStorage.getItem('obelisk_wallet');
        if (obeliskWallet) {
            try {
                const wallet = JSON.parse(obeliskWallet);
                if (wallet.address) {
                    return wallet.address.toLowerCase();
                }
            } catch (e) {}
        }

        // Priorité 2: Wallet externe connecté
        if (typeof window.walletAddress !== 'undefined' && window.walletAddress) {
            return window.walletAddress.toLowerCase();
        }

        // Priorité 3: ID anonyme stocké
        let anonId = localStorage.getItem('obelisk_anon_id');
        if (!anonId) {
            anonId = 'anon_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('obelisk_anon_id', anonId);
        }
        return anonId;
    },

    /**
     * Collecter les données utilisateur
     */
    collectUserData() {
        const data = {
            portfolio: null,
            wallet: null,
            preferences: null,
            savedAt: Date.now(),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Portfolio simulé
        const portfolioData = localStorage.getItem('obelisk_simulated_portfolio');
        if (portfolioData) {
            try {
                data.portfolio = JSON.parse(portfolioData);
            } catch (e) {}
        }

        // Wallet (seulement adresse, PAS la clé privée)
        const walletData = localStorage.getItem('obelisk_wallet');
        if (walletData) {
            try {
                const wallet = JSON.parse(walletData);
                data.wallet = {
                    address: wallet.address,
                    createdAt: wallet.createdAt,
                    name: wallet.name || 'Mon Wallet Obelisk'
                };
            } catch (e) {}
        }

        // Préférences
        const prefs = localStorage.getItem('obelisk_preferences');
        if (prefs) {
            try {
                data.preferences = JSON.parse(prefs);
            } catch (e) {}
        }

        return data;
    },

    /**
     * Sauvegarder sur Firebase
     */
    async saveToFirebase() {
        if (!this.isInitialized || !this.userId || this.isSyncing) {
            return false;
        }

        this.isSyncing = true;
        this.updateSyncIndicator('syncing');

        try {
            const userData = this.collectUserData();

            await this.db.collection('users').doc(this.userId).set(userData, { merge: true });

            this.lastSync = Date.now();
            this.pendingChanges = false;
            console.log('🔥 Data saved to Firebase');
            this.updateSyncIndicator('saved');
            return true;

        } catch (e) {
            console.error('🔥 Firebase save error:', e.message);
            this.updateSyncIndicator('error');
            return false;

        } finally {
            this.isSyncing = false;
        }
    },

    /**
     * Charger depuis Firebase
     */
    async loadFromFirebase() {
        if (!this.isInitialized || !this.userId) {
            return null;
        }

        try {
            const doc = await this.db.collection('users').doc(this.userId).get();

            if (doc.exists) {
                const cloudData = doc.data();

                // Comparer avec les données locales
                const localPortfolio = localStorage.getItem('obelisk_simulated_portfolio');
                let localTime = 0;
                if (localPortfolio) {
                    try {
                        const local = JSON.parse(localPortfolio);
                        localTime = local.lastUpdated || local.createdAt || 0;
                    } catch (e) {}
                }

                const cloudTime = cloudData.savedAt || 0;

                // Si Firebase plus récent, restaurer
                if (cloudTime > localTime) {
                    console.log('🔥 Firebase data is newer, restoring...');

                    // Restaurer le portfolio
                    if (cloudData.portfolio) {
                        localStorage.setItem('obelisk_simulated_portfolio', JSON.stringify(cloudData.portfolio));

                        if (typeof SimulatedPortfolio !== 'undefined') {
                            SimulatedPortfolio.loadState();
                            SimulatedPortfolio.updateUI();
                        }
                        if (typeof PortfolioFix !== 'undefined') {
                            PortfolioFix.updateAllBalanceDisplays();
                        }
                    }

                    // Restaurer les préférences
                    if (cloudData.preferences) {
                        localStorage.setItem('obelisk_preferences', JSON.stringify(cloudData.preferences));
                    }

                    // Info wallet
                    if (cloudData.wallet && cloudData.wallet.address) {
                        console.log('🔥 Wallet found:', cloudData.wallet.address);
                    }

                    this.updateSyncIndicator('restored');
                    this.showNotification('Données restaurées depuis Firebase', 'success');
                    return cloudData;

                } else {
                    console.log('🔥 Local data is current');
                    if (localTime > cloudTime) {
                        this.pendingChanges = true;
                    }
                }
            } else {
                console.log('🔥 No data found in Firebase for user');
                // Premier utilisateur - sauvegarder les données locales
                this.pendingChanges = true;
            }

            return null;

        } catch (e) {
            console.error('🔥 Firebase load error:', e.message);
            return null;
        }
    },

    /**
     * Synchronisation automatique
     */
    startAutoSync() {
        // Sync toutes les 30 secondes si des changements
        setInterval(() => {
            if (this.pendingChanges && !this.isSyncing) {
                this.saveToFirebase();
            }
        }, 30000);

        // Sync immédiat après 3 secondes si changements
        setTimeout(() => {
            if (this.pendingChanges) {
                this.saveToFirebase();
            }
        }, 3000);

        // Sync avant de quitter la page
        window.addEventListener('beforeunload', () => {
            if (this.pendingChanges && this.isInitialized) {
                // Sync synchrone avec sendBeacon (backup)
                const userData = this.collectUserData();
                navigator.sendBeacon(
                    `https://firestore.googleapis.com/v1/projects/obeliskdex/databases/(default)/documents/users/${this.userId}`,
                    JSON.stringify(userData)
                );
            }
        });

        // Écouter les changements localStorage
        this.watchLocalStorage();
    },

    /**
     * Observer les changements localStorage
     */
    watchLocalStorage() {
        const originalSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = (key, value) => {
            originalSetItem(key, value);
            if (key.startsWith('obelisk_')) {
                this.markChanged();
            }
        };
    },

    /**
     * Marquer qu'il y a des changements
     */
    markChanged() {
        this.pendingChanges = true;
        this.updateSyncIndicator('pending');

        // Auto-sync après 5 secondes d'inactivité
        clearTimeout(this.autoSyncTimer);
        this.autoSyncTimer = setTimeout(() => {
            if (this.pendingChanges && this.isInitialized) {
                this.saveToFirebase();
            }
        }, 5000);
    },

    /**
     * Forcer une synchronisation
     */
    async forceSync() {
        this.updateSyncIndicator('syncing');
        const result = await this.saveToFirebase();
        if (result) {
            this.showNotification('Synchronisation réussie', 'success');
        } else {
            this.showNotification('Échec de la synchronisation', 'error');
        }
        return result;
    },

    /**
     * Indicateur de synchronisation
     */
    updateSyncIndicator(status) {
        let indicator = document.getElementById('firebase-sync-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'firebase-sync-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 20px;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                z-index: 200;
                cursor: pointer;
                transition: all 0.3s;
            `;
            indicator.onclick = () => this.forceSync();
            indicator.title = 'Cliquez pour synchroniser';
            document.body.appendChild(indicator);
        }

        const invCount = this.getInvestmentCount();
        const states = {
            connected: { icon: '🔥', text: `Firebase (${invCount} inv)`, bg: 'rgba(255,152,0,0.2)', color: '#ff9800', border: 'rgba(255,152,0,0.3)' },
            saved: { icon: '✅', text: `Sauvé (${invCount} inv)`, bg: 'rgba(0,255,136,0.2)', color: '#00ff88', border: 'rgba(0,255,136,0.3)' },
            pending: { icon: '⏳', text: `${invCount} inv - clic sync`, bg: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
            syncing: { icon: '🔄', text: 'Sync...', bg: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
            restored: { icon: '📥', text: `Restauré (${invCount} inv)`, bg: 'rgba(168,85,247,0.2)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
            error: { icon: '❌', text: 'Erreur - clic retry', bg: 'rgba(255,100,100,0.2)', color: '#ff6464', border: 'rgba(255,100,100,0.3)' },
            loading: { icon: '⏳', text: 'Chargement...', bg: 'rgba(100,100,100,0.2)', color: '#aaa', border: 'rgba(100,100,100,0.3)' },
            'no-user': { icon: '👤', text: 'Non connecté', bg: 'rgba(100,100,100,0.2)', color: '#888', border: 'rgba(100,100,100,0.3)' }
        };

        const state = states[status] || states.connected;
        indicator.innerHTML = `${state.icon} ${state.text}`;
        indicator.style.background = state.bg;
        indicator.style.color = state.color;
        indicator.style.border = `1px solid ${state.border}`;

        if (status === 'restored') {
            setTimeout(() => this.updateSyncIndicator('saved'), 3000);
        }
    },

    /**
     * Afficher notification
     */
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    },

    /**
     * Obtenir le statut
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            userId: this.userId ? this.userId.slice(0, 12) + '...' : null,
            lastSync: this.lastSync,
            pendingChanges: this.pendingChanges,
            isSyncing: this.isSyncing
        };
    },

    /**
     * Compter les investissements
     */
    getInvestmentCount() {
        try {
            const saved = localStorage.getItem('obelisk_simulated_portfolio');
            if (saved) {
                const portfolio = JSON.parse(saved);
                return portfolio.investments?.length || 0;
            }
        } catch (e) {}
        return 0;
    }
};

// Auto-init après chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => FirebasePersistence.init(), 1500);
    });
} else {
    setTimeout(() => FirebasePersistence.init(), 1500);
}

window.FirebasePersistence = FirebasePersistence;
console.log('🔥 Firebase Persistence module loaded');
