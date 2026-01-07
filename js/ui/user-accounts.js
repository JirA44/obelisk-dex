/**
 * OBELISK DEX - User Account System
 * Systeme d'adresses simples et fixes pour les utilisateurs
 */

const UserAccounts = {
    // Prefixe des adresses Obelisk
    PREFIX: 'OBL',

    // Compte utilisateur actuel
    currentUser: null,

    // Configuration
    config: {
        storageKey: 'obelisk_user_account',
        addressLength: 8,  // OBL-XXXXXXXX
    },

    /**
     * Initialiser le systeme
     */
    init() {
        this.loadOrCreateUser();
        this.updateUI();
        console.log('👤 User Accounts initialized:', this.currentUser?.address);
    },

    /**
     * Charger ou creer un utilisateur
     */
    loadOrCreateUser() {
        const saved = localStorage.getItem(this.config.storageKey);

        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
                // Migration si necessaire
                if (!this.currentUser.createdAt) {
                    this.currentUser.createdAt = Date.now();
                    this.save();
                }
            } catch (e) {
                this.createNewUser();
            }
        } else {
            this.createNewUser();
        }
    },

    /**
     * Creer un nouvel utilisateur
     */
    createNewUser() {
        const address = this.generateAddress();

        this.currentUser = {
            address: address,
            shortAddress: address,
            fullAddress: this.toFullAddress(address),
            nickname: null,
            avatar: this.getRandomAvatar(),
            tier: 'default',
            createdAt: Date.now(),
            stats: {
                totalVolume: 0,
                totalTransactions: 0,
                totalFeesPaid: 0,
                totalInvested: 0,
                totalEarnings: 0
            },
            preferences: {
                language: 'fr',
                theme: 'dark',
                notifications: true
            }
        };

        this.save();
        console.log('✨ New user created:', address);

        if (typeof showNotification === 'function') {
            showNotification('Bienvenue! Votre adresse: ' + address, 'success');
        }
    },

    /**
     * Generer une adresse Obelisk simple
     * Format: OBL-XXXXXXXX (8 caracteres alphanumeriques)
     */
    generateAddress() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour eviter confusion
        let code = '';

        for (let i = 0; i < this.config.addressLength; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return `${this.PREFIX}-${code}`;
    },

    /**
     * Convertir en adresse complete (format Ethereum-like)
     */
    toFullAddress(shortAddress) {
        // Hash simple de l'adresse courte pour generer une adresse longue
        const hash = this.simpleHash(shortAddress);
        return '0x' + hash.substring(0, 40);
    },

    /**
     * Hash simple pour generation d'adresse
     */
    simpleHash(str) {
        let hash = '';
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash += ((char * 31 + i * 17) % 256).toString(16).padStart(2, '0');
        }
        // Repeter pour avoir 40 caracteres
        while (hash.length < 40) {
            hash += hash;
        }
        return hash.substring(0, 40);
    },

    /**
     * Obtenir un avatar aleatoire
     */
    getRandomAvatar() {
        const avatars = ['🦊', '🐺', '🦁', '🐯', '🦈', '🦅', '🦉', '🐉', '🦄', '🐋', '🦇', '🐙'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    },

    /**
     * Sauvegarder l'utilisateur
     */
    save() {
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.currentUser));
    },

    /**
     * Obtenir l'adresse actuelle
     */
    getAddress() {
        return this.currentUser?.address || null;
    },

    /**
     * Obtenir l'adresse complete
     */
    getFullAddress() {
        return this.currentUser?.fullAddress || null;
    },

    /**
     * Mettre a jour les stats
     */
    updateStats(type, amount) {
        if (!this.currentUser) return;

        switch(type) {
            case 'volume':
                this.currentUser.stats.totalVolume += amount;
                break;
            case 'transaction':
                this.currentUser.stats.totalTransactions++;
                break;
            case 'fee':
                this.currentUser.stats.totalFeesPaid += amount;
                break;
            case 'invest':
                this.currentUser.stats.totalInvested += amount;
                break;
            case 'earning':
                this.currentUser.stats.totalEarnings += amount;
                break;
        }

        this.save();
        this.checkTierUpgrade();
    },

    /**
     * Verifier si l'utilisateur peut monter de tier
     */
    checkTierUpgrade() {
        const volume = this.currentUser.stats.totalVolume;
        let newTier = 'default';

        if (volume >= 1000000) newTier = 'platinum';
        else if (volume >= 100000) newTier = 'gold';
        else if (volume >= 10000) newTier = 'silver';
        else if (volume >= 1000) newTier = 'bronze';

        if (newTier !== this.currentUser.tier) {
            const oldTier = this.currentUser.tier;
            this.currentUser.tier = newTier;
            this.save();

            if (typeof showNotification === 'function') {
                showNotification(`🎉 Niveau ${newTier.toUpperCase()}! Frais reduits!`, 'success');
            }
            console.log(`⬆️ Tier upgrade: ${oldTier} -> ${newTier}`);
        }
    },

    /**
     * Definir un pseudo
     */
    setNickname(nickname) {
        if (!this.currentUser) return;
        this.currentUser.nickname = nickname.substring(0, 20);
        this.save();
        this.updateUI();
    },

    /**
     * Changer l'avatar
     */
    setAvatar(avatar) {
        if (!this.currentUser) return;
        this.currentUser.avatar = avatar;
        this.save();
        this.updateUI();
    },

    /**
     * Mettre a jour l'UI
     */
    updateUI() {
        // Mettre a jour tous les elements qui affichent l'adresse
        document.querySelectorAll('[data-user-address]').forEach(el => {
            el.textContent = this.currentUser?.address || 'Non connecte';
        });

        document.querySelectorAll('[data-user-avatar]').forEach(el => {
            el.textContent = this.currentUser?.avatar || '👤';
        });

        document.querySelectorAll('[data-user-nickname]').forEach(el => {
            el.textContent = this.currentUser?.nickname || this.currentUser?.address || '';
        });

        document.querySelectorAll('[data-user-tier]').forEach(el => {
            el.textContent = this.currentUser?.tier?.toUpperCase() || 'DEFAULT';
        });
    },

    /**
     * Afficher le profil utilisateur
     */
    showProfile() {
        const existing = document.getElementById('user-profile-modal');
        if (existing) existing.remove();

        const user = this.currentUser;
        if (!user) return;

        const tierColors = {
            'default': '#888',
            'bronze': '#cd7f32',
            'silver': '#c0c0c0',
            'gold': '#ffd700',
            'platinum': '#e5e4e2'
        };

        const modal = document.createElement('div');
        modal.id = 'user-profile-modal';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-header">
                    <span class="profile-avatar">${user.avatar}</span>
                    <div class="profile-info">
                        <h2>${user.nickname || user.address}</h2>
                        <span class="profile-tier" style="color:${tierColors[user.tier]}">${user.tier.toUpperCase()}</span>
                    </div>
                    <button class="profile-close" onclick="document.getElementById('user-profile-modal').remove()">✕</button>
                </div>

                <div class="profile-address-box">
                    <label>📍 Votre Adresse Obelisk</label>
                    <div class="address-display">
                        <span class="address-value">${user.address}</span>
                        <button class="btn-copy" onclick="navigator.clipboard.writeText('${user.address}'); showNotification && showNotification('Adresse copiee!', 'success');">📋</button>
                    </div>
                    <div class="address-full" title="${user.fullAddress}">
                        ${user.fullAddress.substring(0, 10)}...${user.fullAddress.substring(36)}
                    </div>
                </div>

                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-label">Volume Total</span>
                        <span class="stat-value">$${user.stats.totalVolume.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Transactions</span>
                        <span class="stat-value">${user.stats.totalTransactions}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Investi</span>
                        <span class="stat-value">$${user.stats.totalInvested.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Gains</span>
                        <span class="stat-value positive">+$${user.stats.totalEarnings.toFixed(2)}</span>
                    </div>
                </div>

                <div class="profile-customize">
                    <h3>Personnaliser</h3>
                    <div class="customize-row">
                        <label>Pseudo:</label>
                        <input type="text" id="profile-nickname" value="${user.nickname || ''}" placeholder="Votre pseudo" maxlength="20">
                        <button onclick="UserAccounts.setNickname(document.getElementById('profile-nickname').value)">OK</button>
                    </div>
                    <div class="customize-row">
                        <label>Avatar:</label>
                        <div class="avatar-picker">
                            ${['🦊', '🐺', '🦁', '🐯', '🦈', '🦅', '🦉', '🐉', '🦄', '🐋', '🦇', '🐙'].map(a =>
                                `<span class="avatar-option ${a === user.avatar ? 'selected' : ''}" onclick="UserAccounts.setAvatar('${a}')">${a}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>

                <div class="profile-tier-info">
                    <h3>Niveaux de Frais</h3>
                    <div class="tier-list">
                        <div class="tier-item ${user.tier === 'default' ? 'current' : ''}">
                            <span>Default</span><span>0.2%</span><span>$0+</span>
                        </div>
                        <div class="tier-item ${user.tier === 'bronze' ? 'current' : ''}">
                            <span style="color:#cd7f32">Bronze</span><span>0.18%</span><span>$1K+</span>
                        </div>
                        <div class="tier-item ${user.tier === 'silver' ? 'current' : ''}">
                            <span style="color:#c0c0c0">Silver</span><span>0.15%</span><span>$10K+</span>
                        </div>
                        <div class="tier-item ${user.tier === 'gold' ? 'current' : ''}">
                            <span style="color:#ffd700">Gold</span><span>0.1%</span><span>$100K+</span>
                        </div>
                        <div class="tier-item ${user.tier === 'platinum' ? 'current' : ''}">
                            <span style="color:#e5e4e2">Platinum</span><span>0.05%</span><span>$1M+</span>
                        </div>
                    </div>
                </div>

                <div class="profile-actions">
                    <button class="btn-secondary" onclick="UserAccounts.exportData()">📤 Exporter Donnees</button>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
        `;

        document.body.appendChild(modal);
        this.injectProfileStyles();
    },

    /**
     * Injecter les styles du profil
     */
    injectProfileStyles() {
        if (document.getElementById('user-profile-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'user-profile-styles';
        styles.textContent = `
            .profile-modal-content {
                background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 20px;
                width: 95%;
                max-width: 450px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 24px;
            }
            .profile-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 24px;
                position: relative;
            }
            .profile-avatar {
                font-size: 48px;
            }
            .profile-info h2 {
                margin: 0;
                color: #fff;
                font-size: 20px;
            }
            .profile-tier {
                font-size: 12px;
                font-weight: 700;
            }
            .profile-close {
                position: absolute;
                top: 0;
                right: 0;
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
            }
            .profile-address-box {
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            }
            .profile-address-box label {
                display: block;
                color: #888;
                font-size: 12px;
                margin-bottom: 8px;
            }
            .address-display {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .address-value {
                font-family: monospace;
                font-size: 24px;
                font-weight: 700;
                color: #00ff88;
            }
            .address-full {
                font-family: monospace;
                font-size: 11px;
                color: #666;
                margin-top: 8px;
            }
            .btn-copy {
                background: rgba(255,255,255,0.1);
                border: none;
                padding: 8px;
                border-radius: 6px;
                cursor: pointer;
            }
            .profile-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 20px;
            }
            .stat-item {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 12px;
                text-align: center;
            }
            .stat-label {
                display: block;
                color: #888;
                font-size: 11px;
                margin-bottom: 4px;
            }
            .stat-value {
                font-size: 18px;
                font-weight: 700;
                color: #fff;
            }
            .stat-value.positive {
                color: #00ff88;
            }
            .profile-customize {
                margin-bottom: 20px;
            }
            .profile-customize h3 {
                color: #fff;
                font-size: 14px;
                margin: 0 0 12px;
            }
            .customize-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
            }
            .customize-row label {
                color: #888;
                font-size: 13px;
                min-width: 60px;
            }
            .customize-row input {
                flex: 1;
                padding: 8px 12px;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                color: #fff;
            }
            .customize-row button {
                padding: 8px 16px;
                background: #00ff88;
                border: none;
                border-radius: 8px;
                color: #000;
                font-weight: 700;
                cursor: pointer;
            }
            .avatar-picker {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            .avatar-option {
                font-size: 24px;
                cursor: pointer;
                padding: 4px;
                border-radius: 8px;
                transition: all 0.2s;
            }
            .avatar-option:hover {
                background: rgba(255,255,255,0.1);
            }
            .avatar-option.selected {
                background: rgba(0, 255, 136, 0.2);
                border: 2px solid #00ff88;
            }
            .profile-tier-info h3 {
                color: #fff;
                font-size: 14px;
                margin: 0 0 12px;
            }
            .tier-list {
                background: rgba(0,0,0,0.2);
                border-radius: 10px;
                overflow: hidden;
            }
            .tier-item {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 10px 16px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                font-size: 13px;
                color: #888;
            }
            .tier-item.current {
                background: rgba(0, 255, 136, 0.1);
                color: #fff;
            }
            .profile-actions {
                margin-top: 20px;
                text-align: center;
            }
            .btn-secondary {
                padding: 12px 24px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 10px;
                color: #888;
                cursor: pointer;
            }
        `;
        document.head.appendChild(styles);
    },

    /**
     * Exporter les donnees utilisateur
     */
    exportData() {
        const data = JSON.stringify(this.currentUser, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `obelisk-${this.currentUser.address}.json`;
        a.click();

        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification('Donnees exportees!', 'success');
        }
    },

    /**
     * Obtenir le resume du compte
     */
    getSummary() {
        if (!this.currentUser) return null;

        return {
            address: this.currentUser.address,
            fullAddress: this.currentUser.fullAddress,
            tier: this.currentUser.tier,
            stats: this.currentUser.stats,
            memberSince: new Date(this.currentUser.createdAt).toLocaleDateString()
        };
    }
};

// Auto-init
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UserAccounts.init());
    } else {
        UserAccounts.init();
    }
}

// Export
if (typeof window !== 'undefined') {
    window.UserAccounts = UserAccounts;
}

console.log('👤 User Accounts system loaded');
