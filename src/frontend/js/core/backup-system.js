// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - BACKUP SYSTEM
// User data backup, export, and restore functionality
// ═══════════════════════════════════════════════════════════════════════════════

const BackupSystem = {
    version: '1.0.0',

    // Keys to backup from localStorage
    backupKeys: [
        'simulated_portfolio',
        'obelisk_wallet',
        'obelisk_settings',
        'obelisk_theme',
        'obelisk_animation',
        'obelisk_investments',
        'obelisk_positions',
        'obelisk_history',
        'obelisk_learn_progress',
        'obelisk-lang'
    ],

    // Create backup object
    createBackup() {
        const backup = {
            version: this.version,
            appVersion: typeof VersioningSystem !== 'undefined' ? VersioningSystem.getVersion() : 'unknown',
            timestamp: new Date().toISOString(),
            data: {}
        };

        this.backupKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    backup.data[key] = JSON.parse(value);
                } catch (e) {
                    backup.data[key] = value;
                }
            }
        });

        // Add current state from modules
        if (typeof SimulatedPortfolio !== 'undefined') {
            backup.data._simulated_portfolio_live = {
                balance: SimulatedPortfolio.balance,
                positions: SimulatedPortfolio.positions || [],
                history: SimulatedPortfolio.history || []
            };
        }

        return backup;
    },

    // Export backup as JSON file
    exportBackup() {
        const backup = this.createBackup();
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const date = new Date().toISOString().split('T')[0];
        const filename = `obelisk-backup-${date}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);

        console.log('[BACKUP] Exported backup:', filename);
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
        this.showNotification(isFr ? 'Sauvegarde exportée avec succès !' : 'Backup exported successfully!', 'success');

        return backup;
    },

    // Import backup from file
    importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);

                    if (!backup.version || !backup.data) {
                        throw new Error('Invalid backup file format');
                    }

                    // Restore data
                    Object.entries(backup.data).forEach(([key, value]) => {
                        if (key.startsWith('_')) return; // Skip live state
                        try {
                            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        } catch (e) {
                            console.warn('[BACKUP] Failed to restore:', key, e);
                        }
                    });

                    // Restore live state if available
                    if (backup.data._simulated_portfolio_live && typeof SimulatedPortfolio !== 'undefined') {
                        SimulatedPortfolio.balance = backup.data._simulated_portfolio_live.balance || 0;
                        SimulatedPortfolio.positions = backup.data._simulated_portfolio_live.positions || [];
                        SimulatedPortfolio.history = backup.data._simulated_portfolio_live.history || [];
                        if (SimulatedPortfolio.save) SimulatedPortfolio.save();
                    }

                    console.log('[BACKUP] Restored backup from:', backup.timestamp);
                    const isFr2 = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
                    this.showNotification(isFr2 ? 'Sauvegarde restaurée ! Rechargement...' : 'Backup restored! Reloading page...', 'success');

                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);

                    resolve(backup);
                } catch (e) {
                    console.error('[BACKUP] Import failed:', e);
                    const isFr3 = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
                    this.showNotification((isFr3 ? 'Échec de l\'import : ' : 'Failed to import backup: ') + e.message, 'error');
                    reject(e);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    },

    // Auto-backup to localStorage (for crash recovery)
    autoBackup() {
        const backup = this.createBackup();
        try {
            localStorage.setItem('obelisk_auto_backup', JSON.stringify(backup));
            localStorage.setItem('obelisk_auto_backup_time', new Date().toISOString());
            console.log('[BACKUP] Auto-backup saved');
        } catch (e) {
            console.warn('[BACKUP] Auto-backup failed:', e);
        }
    },

    // Restore from auto-backup
    restoreAutoBackup() {
        try {
            const backup = localStorage.getItem('obelisk_auto_backup');
            if (backup) {
                const data = JSON.parse(backup);
                Object.entries(data.data).forEach(([key, value]) => {
                    if (key.startsWith('_')) return;
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                });
                console.log('[BACKUP] Restored from auto-backup');
                return true;
            }
        } catch (e) {
            console.warn('[BACKUP] Auto-restore failed:', e);
        }
        return false;
    },

    // Clear all data
    clearAllData() {
        const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
        if (!confirm(isFr ? 'Êtes-vous sûr de vouloir supprimer TOUTES vos données ? Cette action est irréversible !' : 'Are you sure you want to delete ALL your data? This cannot be undone!')) {
            return false;
        }

        this.backupKeys.forEach(key => {
            localStorage.removeItem(key);
        });

        // Clear module states
        if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.balance = 0;
            SimulatedPortfolio.positions = [];
            SimulatedPortfolio.history = [];
        }

        this.showNotification(isFr ? 'Données effacées. Rechargement...' : 'All data cleared. Reloading...', 'success');

        setTimeout(() => {
            window.location.reload();
        }, 1000);

        return true;
    },

    // Get backup statistics
    getStats() {
        let totalSize = 0;
        const stats = {};

        this.backupKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                const size = new Blob([value]).size;
                stats[key] = {
                    exists: true,
                    size: size,
                    sizeFormatted: this.formatSize(size)
                };
                totalSize += size;
            } else {
                stats[key] = { exists: false, size: 0 };
            }
        });

        return {
            keys: stats,
            totalSize,
            totalSizeFormatted: this.formatSize(totalSize),
            lastAutoBackup: localStorage.getItem('obelisk_auto_backup_time')
        };
    },

    // Format bytes to human readable
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },

    // Show notification
    showNotification(message, type) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 600;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            animation: slideIn 0.3s;
            ${type === 'success' ? 'background:#00ff88;color:#000;' : 'background:#ff6464;color:#fff;'}
        `;
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    },

    // Show backup UI modal
    showBackupModal() {
        const existing = document.getElementById('backup-modal');
        if (existing) existing.remove();

        const stats = this.getStats();
        const fr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

        const modal = document.createElement('div');
        modal.id = 'backup-modal';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:500;display:flex;align-items:center;justify-content:center;" onclick="if(event.target===this)this.remove()">
                <div style="background:linear-gradient(135deg,#0a0a1e,#1a1040);border:2px solid #00ff88;border-radius:16px;max-width:500px;padding:24px;margin:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="margin:0;color:#00ff88;">💾 ${fr ? 'Sauvegarde & Restauration' : 'Backup & Restore'}</h2>
                        <button onclick="this.closest('#backup-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">×</button>
                    </div>

                    <div style="background:rgba(0,255,136,0.1);padding:15px;border-radius:8px;margin-bottom:20px;">
                        <div style="color:#00ff88;font-weight:bold;margin-bottom:8px;">${fr ? 'Aperçu des données' : 'Data Overview'}</div>
                        <div style="color:#ccc;font-size:13px;">
                            ${fr ? 'Taille totale' : 'Total size'}: ${stats.totalSizeFormatted}<br>
                            ${fr ? 'Dernière sauvegarde auto' : 'Last auto-backup'}: ${stats.lastAutoBackup ? new Date(stats.lastAutoBackup).toLocaleString() : (fr ? 'Jamais' : 'Never')}
                        </div>
                    </div>

                    <div style="display:flex;gap:10px;margin-bottom:15px;">
                        <button onclick="BackupSystem.exportBackup()" style="flex:1;padding:12px;background:rgba(0,255,136,0.2);border:2px solid #00ff88;border-radius:8px;color:#00ff88;font-weight:bold;cursor:pointer;">
                            📤 ${fr ? 'Exporter' : 'Export Backup'}
                        </button>
                        <label style="flex:1;padding:12px;background:rgba(74,158,255,0.2);border:2px solid #4a9eff;border-radius:8px;color:#4a9eff;font-weight:bold;cursor:pointer;text-align:center;">
                            📥 ${fr ? 'Importer' : 'Import Backup'}
                            <input type="file" accept=".json" onchange="BackupSystem.importBackup(this.files[0])" style="display:none">
                        </label>
                    </div>

                    <button onclick="BackupSystem.autoBackup();BackupSystem.showNotification(typeof I18n !== 'undefined' && I18n.currentLang === 'fr' ? 'Sauvegarde auto enregistrée !' : 'Auto-backup saved!','success')" style="width:100%;padding:10px;background:rgba(168,85,247,0.2);border:2px solid #a855f7;border-radius:8px;color:#a855f7;font-weight:bold;cursor:pointer;margin-bottom:15px;">
                        ⚡ ${fr ? 'Sauvegarder maintenant' : 'Save Auto-Backup Now'}
                    </button>

                    <button onclick="BackupSystem.clearAllData()" style="width:100%;padding:10px;background:rgba(255,100,100,0.1);border:1px solid #ff6464;border-radius:8px;color:#ff6464;cursor:pointer;font-size:12px;">
                        🗑️ ${fr ? 'Effacer toutes les données' : 'Clear All Data'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Initialize
    init() {
        // Auto-backup every 5 minutes
        setInterval(() => {
            this.autoBackup();
        }, 5 * 60 * 1000);

        // Initial auto-backup
        setTimeout(() => {
            this.autoBackup();
        }, 10000);

        console.log('[BACKUP] System initialized');
    }
};

// Initialize on load
window.addEventListener('load', () => {
    BackupSystem.init();
});

// Expose globally
window.BackupSystem = BackupSystem;
console.log('[BACKUP] Module loaded v1.0.0');
