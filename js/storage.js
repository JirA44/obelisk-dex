/**
 * Obelisk DEX - Secure Local Storage
 *
 * ZERO SERVER STORAGE - All data stays on user's device
 *
 * Uses IndexedDB for persistent encrypted storage.
 * All sensitive data is encrypted with user's password before storage.
 */

const SecureStorage = {
    DB_NAME: 'ObeliskDEX',
    DB_VERSION: 1,
    STORES: {
        WALLETS: 'wallets',
        SETTINGS: 'settings',
        HISTORY: 'history',
        CACHE: 'cache'
    },

    db: null,

    /**
     * Initialize IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Wallets store (encrypted)
                if (!db.objectStoreNames.contains(this.STORES.WALLETS)) {
                    db.createObjectStore(this.STORES.WALLETS, { keyPath: 'id' });
                }

                // Settings store (non-sensitive)
                if (!db.objectStoreNames.contains(this.STORES.SETTINGS)) {
                    db.createObjectStore(this.STORES.SETTINGS, { keyPath: 'key' });
                }

                // Transaction history (encrypted)
                if (!db.objectStoreNames.contains(this.STORES.HISTORY)) {
                    const historyStore = db.createObjectStore(this.STORES.HISTORY, { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                    historyStore.createIndex('type', 'type', { unique: false });
                }

                // Cache store (temporary data)
                if (!db.objectStoreNames.contains(this.STORES.CACHE)) {
                    const cacheStore = db.createObjectStore(this.STORES.CACHE, { keyPath: 'key' });
                    cacheStore.createIndex('expires', 'expires', { unique: false });
                }
            };
        });
    },

    /**
     * Get a value from a store
     */
    async get(storeName, key) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get all values from a store
     */
    async getAll(storeName) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Put a value into a store
     */
    async put(storeName, value) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Delete a value from a store
     */
    async delete(storeName, key) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Clear all data from a store
     */
    async clear(storeName) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Ensure database is initialized
     */
    async ensureDB() {
        if (!this.db) {
            await this.init();
        }
    },

    // ============ WALLET OPERATIONS (ENCRYPTED) ============

    /**
     * Save encrypted wallet
     */
    async saveWallet(walletId, walletData, password) {
        const encrypted = await CryptoUtils.encrypt(JSON.stringify(walletData), password);
        await this.put(this.STORES.WALLETS, {
            id: walletId,
            data: encrypted,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    },

    /**
     * Load and decrypt wallet
     */
    async loadWallet(walletId, password) {
        const record = await this.get(this.STORES.WALLETS, walletId);
        if (!record) {
            throw new Error('Wallet not found');
        }
        const decrypted = await CryptoUtils.decrypt(record.data, password);
        return JSON.parse(decrypted);
    },

    /**
     * Get list of wallet IDs (without decrypting)
     */
    async getWalletList() {
        const wallets = await this.getAll(this.STORES.WALLETS);
        return wallets.map(w => ({
            id: w.id,
            createdAt: w.createdAt,
            updatedAt: w.updatedAt
        }));
    },

    /**
     * Delete wallet
     */
    async deleteWallet(walletId) {
        await this.delete(this.STORES.WALLETS, walletId);
    },

    /**
     * Check if wallet exists
     */
    async walletExists(walletId) {
        const wallet = await this.get(this.STORES.WALLETS, walletId);
        return !!wallet;
    },

    // ============ SETTINGS (NON-SENSITIVE) ============

    /**
     * Save setting
     */
    async saveSetting(key, value) {
        await this.put(this.STORES.SETTINGS, { key, value });
    },

    /**
     * Load setting
     */
    async loadSetting(key, defaultValue = null) {
        const record = await this.get(this.STORES.SETTINGS, key);
        return record ? record.value : defaultValue;
    },

    /**
     * Load all settings
     */
    async loadAllSettings() {
        const records = await this.getAll(this.STORES.SETTINGS);
        const settings = {};
        records.forEach(r => {
            settings[r.key] = r.value;
        });
        return settings;
    },

    // ============ HISTORY (ENCRYPTED) ============

    /**
     * Add transaction to history
     */
    async addToHistory(transaction, password) {
        const encrypted = await CryptoUtils.encrypt(JSON.stringify(transaction), password);
        await this.put(this.STORES.HISTORY, {
            data: encrypted,
            timestamp: Date.now(),
            type: transaction.type || 'unknown'
        });
    },

    /**
     * Get transaction history
     */
    async getHistory(password, limit = 100) {
        const records = await this.getAll(this.STORES.HISTORY);
        const history = [];

        for (const record of records.slice(-limit)) {
            try {
                const decrypted = await CryptoUtils.decrypt(record.data, password);
                history.push({
                    ...JSON.parse(decrypted),
                    id: record.id,
                    timestamp: record.timestamp
                });
            } catch (e) {
                console.warn('Failed to decrypt history record:', e);
            }
        }

        return history.reverse();
    },

    /**
     * Clear all history
     */
    async clearHistory() {
        await this.clear(this.STORES.HISTORY);
    },

    // ============ CACHE ============

    /**
     * Set cache value with expiration
     */
    async setCache(key, value, ttlMs = 300000) { // 5 min default
        await this.put(this.STORES.CACHE, {
            key,
            value,
            expires: Date.now() + ttlMs
        });
    },

    /**
     * Get cache value (returns null if expired)
     */
    async getCache(key) {
        const record = await this.get(this.STORES.CACHE, key);
        if (!record) return null;
        if (record.expires < Date.now()) {
            await this.delete(this.STORES.CACHE, key);
            return null;
        }
        return record.value;
    },

    /**
     * Clean expired cache entries
     */
    async cleanExpiredCache() {
        const records = await this.getAll(this.STORES.CACHE);
        const now = Date.now();
        for (const record of records) {
            if (record.expires < now) {
                await this.delete(this.STORES.CACHE, record.key);
            }
        }
    },

    // ============ DATA EXPORT/IMPORT ============

    /**
     * Export all encrypted data (for backup)
     */
    async exportAllData() {
        await this.ensureDB();
        const data = {
            version: this.DB_VERSION,
            exportedAt: Date.now(),
            wallets: await this.getAll(this.STORES.WALLETS),
            settings: await this.getAll(this.STORES.SETTINGS),
            history: await this.getAll(this.STORES.HISTORY)
        };
        return JSON.stringify(data);
    },

    /**
     * Import data from backup
     */
    async importData(jsonData) {
        const data = JSON.parse(jsonData);

        if (data.wallets) {
            for (const wallet of data.wallets) {
                await this.put(this.STORES.WALLETS, wallet);
            }
        }

        if (data.settings) {
            for (const setting of data.settings) {
                await this.put(this.STORES.SETTINGS, setting);
            }
        }

        if (data.history) {
            for (const record of data.history) {
                await this.put(this.STORES.HISTORY, record);
            }
        }
    },

    /**
     * Completely wipe all local data
     * WARNING: This is irreversible!
     */
    async wipeAllData() {
        await this.clear(this.STORES.WALLETS);
        await this.clear(this.STORES.SETTINGS);
        await this.clear(this.STORES.HISTORY);
        await this.clear(this.STORES.CACHE);

        // Also clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
    }
};

// Initialize on load
SecureStorage.init().catch(console.error);

// Export
window.SecureStorage = SecureStorage;
