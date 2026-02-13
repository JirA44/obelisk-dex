/**
 * OBELISK DEX - Cloud Persistence Module
 * Sauvegarde les données utilisateur sur Cloudflare KV
 * - Portfolio simulé
 * - Wallet Obelisk
 * - Historique des transactions
 */

const CloudPersistence = {
    // Worker externe pour la persistance (KV fonctionne)
    apiBase: 'https://obelisk-storage.obelisk-io.workers.dev/user',
    userId: null,
    isInitialized: false,
    syncInterval: null,
    lastSync: 0,
    pendingChanges: false,
    isSyncing: false,

    /**
     * Initialiser le module
     */
    async init() {
        try {
            // Obtenir l'ID utilisateur
            this.userId = this.getUserId();

            if (!this.userId) {
                console.warn('☁️ No user ID available for cloud sync');
                return false;
            }

            this.isInitialized = true;

            // Charger les données depuis le cloud au démarrage
            await this.loadFromCloud();

            // Démarrer la synchronisation automatique
            this.startAutoSync();

            console.log('☁️ Cloud Persistence initialized for:', this.userId.slice(0, 12) + '...');
            return true;
        } catch (e) {
            console.warn('☁️ Cloud Persistence init failed:', e.message);
            return false;
        }
    },

    /**
     * Obtenir l'ID utilisateur unique (basé sur le wallet ou généré)
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
     * Collecter toutes les données utilisateur à sauvegarder
     */
    collectUserData() {
        const data = {
            // Portfolio simulé
            portfolio: null,
            // Wallet Obelisk (sans la clé privée!)
            wallet: null,
            // Préférences
            preferences: null,
            // Timestamp
            savedAt: Date.now()
        };

        // Portfolio
        const portfolioData = localStorage.getItem('obelisk_simulated_portfolio');
        if (portfolioData) {
            try {
                data.portfolio = JSON.parse(portfolioData);
            } catch (e) {}
        }

        // Wallet (seulement adresse et metadata, PAS la clé privée)
        const walletData = localStorage.getItem('obelisk_wallet');
        if (walletData) {
            try {
                const wallet = JSON.parse(walletData);
                // Sauvegarder seulement les infos non-sensibles
                data.wallet = {
                    address: wallet.address,
                    createdAt: wallet.createdAt,
                    name: wallet.name || 'Mon Wallet Obelisk'
                };
                // Note: La clé privée reste UNIQUEMENT en local
            } catch (e) {}
        }

        // Préférences utilisateur
        const prefs = localStorage.getItem('obelisk_preferences');
        if (prefs) {
            try {
                data.preferences = JSON.parse(prefs);
            } catch (e) {}
        }

        return data;
    },

    /**
     * Sauvegarder sur le cloud
     */
    async saveToCloud() {
        if (!this.isInitialized || !this.userId || this.isSyncing) {
            return false;
        }

        this.isSyncing = true;

        try {
            const userData = this.collectUserData();

            const response = await fetch(`${this.apiBase}/${this.userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (result.success) {
                this.lastSync = Date.now();
                this.pendingChanges = false;
                console.log('☁️ Data saved to cloud');
                this.updateSyncIndicator('saved');
                return true;
            } else {
                console.warn('☁️ Cloud save failed:', result.error);
                return false;
            }
        } catch (e) {
            console.warn('☁️ Cloud save error:', e.message);
            return false;
        } finally {
            this.isSyncing = false;
        }
    },

    /**
     * Charger depuis le cloud
     */
    async loadFromCloud() {
        // Skip if API not available
        if (window.location.hostname === 'localhost') return null;
        if (!this.isInitialized || !this.userId) {
            return null;
        }

        try {
            const response = await fetch(`${this.apiBase}/${this.userId}`);
            const result = await response.json();

            if (result.success && result.data) {
                const cloudData = result.data;

                // Comparer avec les données locales
                const localPortfolio = localStorage.getItem('obelisk_simulated_portfolio');
                let localTime = 0;
                if (localPortfolio) {
                    try {
                        const local = JSON.parse(localPortfolio);
                        localTime = local.lastUpdated || local.createdAt || 0;
                    } catch (e) {}
                }

                const cloudTime = cloudData.savedAt || cloudData.lastUpdated || 0;

                // Si cloud plus récent, restaurer
                if (cloudTime > localTime) {
                    console.log('☁️ Cloud data is newer, restoring...');

                    // Restaurer le portfolio
                    if (cloudData.portfolio) {
                        localStorage.setItem('obelisk_simulated_portfolio', JSON.stringify(cloudData.portfolio));

                        // Rafraîchir l'UI du portfolio
                        if (typeof SimulatedPortfolio !== 'undefined') {
                            SimulatedPortfolio.loadState();
                            SimulatedPortfolio.updateUI();
                        }
                        // Aussi via PortfolioFix
                        if (typeof PortfolioFix !== 'undefined') {
                            PortfolioFix.updateAllBalanceDisplays();
                        }
                    }

                    // Restaurer le wallet (sans clé privée - juste les métadonnées)
                    if (cloudData.wallet && cloudData.wallet.address) {
                        // Vérifier si on a déjà un wallet local avec clé privée
                        const localWallet = localStorage.getItem('obelisk_wallet');
                        if (!localWallet) {
                            // Pas de wallet local, on crée un placeholder
                            // L'utilisateur devra re-créer ou importer son wallet
                            console.log('☁️ Wallet address found in cloud:', cloudData.wallet.address);
                            this.showNotification('Wallet trouvé: ' + cloudData.wallet.address.slice(0,10) + '...', 'info');
                        }
                    }

                    // Restaurer les préférences
                    if (cloudData.preferences) {
                        localStorage.setItem('obelisk_preferences', JSON.stringify(cloudData.preferences));
                    }

                    this.updateSyncIndicator('restored');
                    this.showNotification('Données restaurées depuis le cloud', 'success');

                    return cloudData;
                } else {
                    console.log('☁️ Local data is current');
                    // Sync local vers cloud si besoin
                    if (localTime > cloudTime) {
                        this.pendingChanges = true;
                    }
                }
            }

            return null;
        } catch (e) {
            console.warn('☁️ Cloud load error:', e.message);
            return null;
        }
    },

    /**
     * Synchronisation automatique
     */
    startAutoSync() {
        // Sync toutes les 60 secondes si des changements
        this.syncInterval = setInterval(() => {
            if (this.pendingChanges && !this.isSyncing) {
                this.saveToCloud();
            }
        }, 60000);

        // Sync immédiat après 5 secondes si changements
        setTimeout(() => {
            if (this.pendingChanges) {
                this.saveToCloud();
            }
        }, 5000);

        // Sync avant de quitter la page
        window.addEventListener('beforeunload', () => {
            if (this.pendingChanges) {
                // Sync synchrone avec sendBeacon
                const userData = this.collectUserData();
                navigator.sendBeacon(
                    `${this.apiBase}/${this.userId}`,
                    JSON.stringify(userData)
                );
            }
        });

        // Écouter les changements de stockage local
        this.watchLocalStorage();
    },

    /**
     * Observer les changements localStorage
     */
    watchLocalStorage() {
        // Intercepter les écritures localStorage
        const originalSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = (key, value) => {
            originalSetItem(key, value);

            // Marquer comme changé si c'est une donnée Obelisk
            if (key.startsWith('obelisk_')) {
                this.markChanged();
            }
        };
    },

    /**
     * Marquer qu'il y a des changements à synchroniser
     */
    markChanged() {
        this.pendingChanges = true;
        this.updateSyncIndicator('pending');
    },

    /**
     * Forcer une synchronisation immédiate
     */
    async forceSync() {
        this.updateSyncIndicator('syncing');
        const result = await this.saveToCloud();
        if (result) {
            this.showNotification('Synchronisation réussie', 'success');
        } else {
            this.showNotification('Échec de la synchronisation', 'error');
        }
        return result;
    },

    /**
     * Mettre à jour l'indicateur de synchronisation
     */
    updateSyncIndicator(status) {
        let indicator = document.getElementById('cloud-sync-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'cloud-sync-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                z-index: 300;
                cursor: pointer;
                transition: all 0.3s;
            `;
            indicator.onclick = () => this.forceSync();
            indicator.title = 'Cliquez pour synchroniser';
            document.body.appendChild(indicator);
        }

        switch (status) {
            case 'saved':
                indicator.innerHTML = '☁️ Synchronisé';
                indicator.style.background = 'rgba(0, 255, 136, 0.2)';
                indicator.style.color = '#00ff88';
                indicator.style.border = '1px solid rgba(0, 255, 136, 0.3)';
                break;
            case 'pending':
                indicator.innerHTML = '☁️ En attente...';
                indicator.style.background = 'rgba(245, 158, 11, 0.2)';
                indicator.style.color = '#f59e0b';
                indicator.style.border = '1px solid rgba(245, 158, 11, 0.3)';
                break;
            case 'syncing':
                indicator.innerHTML = '☁️ Sync...';
                indicator.style.background = 'rgba(59, 130, 246, 0.2)';
                indicator.style.color = '#3b82f6';
                indicator.style.border = '1px solid rgba(59, 130, 246, 0.3)';
                break;
            case 'restored':
                indicator.innerHTML = '☁️ Restauré!';
                indicator.style.background = 'rgba(168, 85, 247, 0.2)';
                indicator.style.color = '#a855f7';
                indicator.style.border = '1px solid rgba(168, 85, 247, 0.3)';
                setTimeout(() => this.updateSyncIndicator('saved'), 3000);
                break;
            case 'error':
                indicator.innerHTML = '☁️ Erreur';
                indicator.style.background = 'rgba(255, 100, 100, 0.2)';
                indicator.style.color = '#ff6464';
                indicator.style.border = '1px solid rgba(255, 100, 100, 0.3)';
                break;
        }
    },

    /**
     * Afficher une notification
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
    }
};

// Auto-init après chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => CloudPersistence.init(), 2000);
    });
} else {
    setTimeout(() => CloudPersistence.init(), 2000);
}

window.CloudPersistence = CloudPersistence;
console.log('☁️ Cloud Persistence module loaded');
