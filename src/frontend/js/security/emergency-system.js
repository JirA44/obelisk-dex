// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - EMERGENCY PANIC SYSTEM
// Security feature for extreme situations (kidnapping, coercion, sequestration)
// 24h lockdown with contact notification
// ═══════════════════════════════════════════════════════════════════════════════

const EmergencySystem = {
    // Configuration
    LOCKDOWN_DURATION: 24 * 60 * 60 * 1000, // 24 hours in ms
    CANCEL_CODE_LENGTH: 6,
    MAX_CANCEL_ATTEMPTS: 3,
    DURESS_CODE_SUFFIX: '00', // If code ends with 00, silent alert is sent

    // State
    isLocked: false,
    lockdownStartTime: null,
    cancelCode: null,
    duressCode: null, // Fake code that silently alerts
    cancelAttempts: 0,
    emergencyContacts: [],
    securityQuestions: [],
    verificationStep: 0, // Multi-step verification

    // GPS Tracking State
    gpsWatchId: null,
    currentSosId: null,
    lastPosition: null,
    gpsRetryCount: 0,
    gpsUpdateInterval: null,
    GPS_UPDATE_INTERVAL: 5000,      // 5s between updates (default)
    GPS_TRANSPORT_INTERVAL: 2000,   // 2s if moving fast
    GPS_STATIONARY_INTERVAL: 10000, // 10s if stationary
    GPS_SIGNIFICANT_CHANGE: 50,     // 50m = significant position change
    API_BASE: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3001' : '',

    // i18n helper - fallback to key if I18n not loaded
    _t(key) {
        return (typeof I18n !== 'undefined' && I18n.t) ? I18n.t(key) : key;
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('[EMERGENCY] System initialized');
        this.loadState();
        this.loadContacts();
        this.checkLockdownStatus();
        this.createEmergencyButton();
        this.setupKeyboardShortcut();
    },

    loadState() {
        try {
            const saved = localStorage.getItem('obelisk_emergency_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.isLocked = state.isLocked || false;
                this.lockdownStartTime = state.lockdownStartTime;
                this.cancelCode = state.cancelCode;
                this.duressCode = state.duressCode;
                this.cancelAttempts = state.cancelAttempts || 0;
                this.securityQuestions = state.securityQuestions || [];
                this.verificationStep = state.verificationStep || 0;
            }
        } catch (e) {
            console.error('[EMERGENCY] Error loading state:', e);
        }
    },

    saveState() {
        try {
            localStorage.setItem('obelisk_emergency_state', JSON.stringify({
                isLocked: this.isLocked,
                lockdownStartTime: this.lockdownStartTime,
                cancelCode: this.cancelCode,
                duressCode: this.duressCode,
                cancelAttempts: this.cancelAttempts,
                securityQuestions: this.securityQuestions,
                verificationStep: this.verificationStep
            }));
        } catch (e) {
            console.error('[EMERGENCY] Error saving state:', e);
        }
    },

    loadContacts() {
        try {
            const saved = localStorage.getItem('obelisk_emergency_contacts');
            if (saved) {
                this.emergencyContacts = JSON.parse(saved);
            }
        } catch (e) {
            console.error('[EMERGENCY] Error loading contacts:', e);
        }
    },

    saveContacts() {
        try {
            localStorage.setItem('obelisk_emergency_contacts', JSON.stringify(this.emergencyContacts));
        } catch (e) {
            console.error('[EMERGENCY] Error saving contacts:', e);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // EMERGENCY BUTTON CREATION
    // ═══════════════════════════════════════════════════════════════
    createEmergencyButton() {
        // Remove existing button if any
        const existing = document.getElementById('emergency-panic-btn');
        if (existing) existing.remove();

        // Create floating emergency button
        const btn = document.createElement('button');
        btn.id = 'emergency-panic-btn';
        btn.className = 'emergency-panic-button';
        btn.innerHTML = `
            <span class="emergency-icon">🆘</span>
            <span class="emergency-text">SOS</span>
        `;
        btn.title = this._t('sos_hold_hint');

        // Long press to activate (prevent accidental triggers)
        let pressTimer = null;
        let pressProgress = 0;

        btn.addEventListener('mousedown', (e) => {
            if (this.isLocked) {
                this.showCancelDialog();
                return;
            }
            pressProgress = 0;
            btn.classList.add('pressing');
            pressTimer = setInterval(() => {
                pressProgress += 100;
                btn.style.setProperty('--press-progress', `${(pressProgress / 3000) * 100}%`);
                if (pressProgress >= 3000) {
                    clearInterval(pressTimer);
                    btn.classList.remove('pressing');
                    this.triggerEmergency();
                }
            }, 100);
        });

        btn.addEventListener('mouseup', () => {
            if (pressTimer) {
                clearInterval(pressTimer);
                btn.classList.remove('pressing');
                btn.style.setProperty('--press-progress', '0%');
            }
        });

        btn.addEventListener('mouseleave', () => {
            if (pressTimer) {
                clearInterval(pressTimer);
                btn.classList.remove('pressing');
                btn.style.setProperty('--press-progress', '0%');
            }
        });

        // Touch support for mobile
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isLocked) {
                this.showCancelDialog();
                return;
            }
            pressProgress = 0;
            btn.classList.add('pressing');
            pressTimer = setInterval(() => {
                pressProgress += 100;
                btn.style.setProperty('--press-progress', `${(pressProgress / 3000) * 100}%`);
                if (pressProgress >= 3000) {
                    clearInterval(pressTimer);
                    btn.classList.remove('pressing');
                    this.triggerEmergency();
                }
            }, 100);
        });

        btn.addEventListener('touchend', () => {
            if (pressTimer) {
                clearInterval(pressTimer);
                btn.classList.remove('pressing');
                btn.style.setProperty('--press-progress', '0%');
            }
        });

        document.body.appendChild(btn);
        this.addStyles();

        // Update button state if locked
        if (this.isLocked) {
            btn.classList.add('locked');
            btn.innerHTML = `
                <span class="emergency-icon">🔒</span>
                <span class="emergency-text">${this._t('sos_locked')}</span>
            `;
        }
    },

    addStyles() {
        if (document.getElementById('emergency-styles')) return;

        const style = document.createElement('style');
        style.id = 'emergency-styles';
        style.textContent = `
            .emergency-panic-button {
                position: fixed;
                bottom: 100px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #dc2626, #991b1b);
                border: 3px solid #fca5a5;
                color: white;
                cursor: pointer;
                z-index: 800;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
                transition: all 0.3s ease;
                --press-progress: 0%;
            }

            .emergency-panic-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(220, 38, 38, 0.7);
            }

            .emergency-panic-button.pressing {
                background: linear-gradient(135deg, #dc2626 var(--press-progress), #991b1b var(--press-progress));
                animation: pulse-emergency 0.5s infinite;
            }

            .emergency-panic-button.locked {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border-color: #fcd34d;
                animation: pulse-locked 2s infinite;
            }

            .emergency-icon {
                font-size: 24px;
            }

            .emergency-text {
                font-size: 10px;
                font-weight: bold;
                margin-top: 2px;
            }

            @keyframes pulse-emergency {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            @keyframes pulse-locked {
                0%, 100% { box-shadow: 0 4px 20px rgba(245, 158, 11, 0.5); }
                50% { box-shadow: 0 4px 40px rgba(245, 158, 11, 0.8); }
            }

            /* Emergency Modal */
            .emergency-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }

            .emergency-modal {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid #dc2626;
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                animation: slideUp 0.3s ease;
            }

            .emergency-modal.locked-modal {
                border-color: #f59e0b;
            }

            .emergency-modal h2 {
                color: #dc2626;
                font-size: 28px;
                margin-bottom: 20px;
            }

            .emergency-modal.locked-modal h2 {
                color: #f59e0b;
            }

            .emergency-modal p {
                color: #e5e5e5;
                margin-bottom: 15px;
                line-height: 1.6;
            }

            .emergency-warning {
                background: rgba(220, 38, 38, 0.2);
                border: 1px solid #dc2626;
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
            }

            .emergency-warning ul {
                text-align: left;
                color: #fca5a5;
                margin: 10px 0;
                padding-left: 20px;
            }

            .emergency-warning li {
                margin: 8px 0;
            }

            .emergency-contacts-section {
                background: rgba(0, 212, 170, 0.1);
                border: 1px solid #00d4aa;
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
            }

            .emergency-contacts-section h3 {
                color: #00d4aa;
                margin-bottom: 10px;
            }

            .contact-input-group {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
            }

            .contact-input-group input {
                flex: 1;
                padding: 10px;
                border-radius: 8px;
                border: 1px solid #333;
                background: #0a0a0f;
                color: white;
            }

            .contact-list {
                max-height: 150px;
                overflow-y: auto;
                margin-top: 10px;
            }

            .contact-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                margin: 5px 0;
            }

            .contact-item .remove-contact {
                background: #dc2626;
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
            }

            .emergency-btn {
                padding: 15px 30px;
                border-radius: 10px;
                border: none;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin: 10px;
                transition: all 0.3s ease;
            }

            .emergency-btn.confirm {
                background: linear-gradient(135deg, #dc2626, #991b1b);
                color: white;
            }

            .emergency-btn.confirm:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
            }

            .emergency-btn.cancel {
                background: #333;
                color: white;
            }

            .emergency-btn.cancel:hover {
                background: #444;
            }

            .countdown-display {
                font-size: 48px;
                font-weight: bold;
                color: #f59e0b;
                margin: 20px 0;
                font-family: monospace;
            }

            .cancel-code-input {
                font-size: 32px;
                text-align: center;
                letter-spacing: 10px;
                padding: 15px;
                width: 200px;
                background: #0a0a0f;
                border: 2px solid #00d4aa;
                border-radius: 10px;
                color: #00d4aa;
                margin: 20px auto;
                display: block;
            }

            .attempts-warning {
                color: #f59e0b;
                font-size: 14px;
                margin-top: 10px;
            }

            /* Lockdown screen overlay */
            .lockdown-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                z-index: 800;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
            }

            .lockdown-overlay h1 {
                font-size: 48px;
                color: #f59e0b;
                margin-bottom: 20px;
            }

            .lockdown-overlay .lock-icon {
                font-size: 100px;
                margin-bottom: 30px;
            }

            /* GPS Status Box */
            .gps-status-box {
                background: rgba(0, 170, 255, 0.1);
                border: 1px solid rgba(0, 170, 255, 0.3);
                border-radius: 12px;
                padding: 15px;
                margin: 20px auto;
                max-width: 400px;
                text-align: center;
            }
            .gps-status-box .gps-icon { font-size: 24px; }
            .gps-status-box #gps-coords { color: #e5e5e5; margin: 8px 0 4px; font-family: monospace; font-size: 14px; }
            .gps-status-box #gps-accuracy { color: #888; font-size: 12px; }
            .gps-status-box #gps-movement { color: #ff8800; font-weight: bold; margin-top: 8px; }
            .gps-status-box.tracking { border-color: #00ff88; }
            .gps-status-box.tracking .gps-icon::after { content: ' ✓'; font-size: 12px; color: #00ff88; }
            .gps-status-box.moving { border-color: #ff8800; animation: pulse-gps 1s infinite; }
            .gps-status-box.error { border-color: #ff4444; }
            .hidden { display: none; }

            @keyframes pulse-gps {
                0%, 100% { box-shadow: 0 0 10px rgba(255, 136, 0, 0.3); }
                50% { box-shadow: 0 0 25px rgba(255, 136, 0, 0.6); }
            }

            /* GPS Permission Modal */
            .gps-permission-modal {
                background: rgba(0,0,0,0.3);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border: 1px solid #00aaff;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    },

    setupKeyboardShortcut() {
        // Secret keyboard shortcut: Ctrl+Shift+E (emergency)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                if (this.isLocked) {
                    this.showCancelDialog();
                } else {
                    this.showEmergencyConfirmation();
                }
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // EMERGENCY ACTIVATION
    // ═══════════════════════════════════════════════════════════════
    showEmergencyConfirmation() {
        const overlay = document.createElement('div');
        overlay.className = 'emergency-modal-overlay';
        overlay.id = 'emergency-confirmation-modal';

        overlay.innerHTML = `
            <div class="emergency-modal">
                <h2>🆘 ${this._t('sos_activation_title')}</h2>

                <div class="emergency-warning">
                    <p><strong>${this._t('sos_this_will')}</strong></p>
                    <ul>
                        <li>🔒 ${this._t('sos_action_lock')}</li>
                        <li>📧 ${this._t('sos_action_notify')}</li>
                        <li>🚫 ${this._t('sos_action_block')}</li>
                        <li>⏰ ${this._t('sos_action_alert')}</li>
                    </ul>
                </div>

                <div class="emergency-contacts-section">
                    <h3>📞 ${this._t('sos_contacts_title')}</h3>
                    <div class="contact-input-group">
                        <input type="text" id="contact-name" placeholder="${this._t('sos_contact_name')}">
                        <input type="email" id="contact-email" placeholder="${this._t('sos_contact_email')}">
                        <input type="tel" id="contact-phone" placeholder="${this._t('sos_contact_phone')}">
                        <button class="emergency-btn" onclick="EmergencySystem.addContact()" style="padding: 10px;">+</button>
                    </div>
                    <div class="contact-list" id="contact-list">
                        ${this.renderContactList()}
                    </div>
                </div>

                <!-- Security Questions Section -->
                <div class="emergency-contacts-section" style="border-color: #f59e0b; background: rgba(245, 158, 11, 0.1);">
                    <h3 style="color: #f59e0b;">🔐 ${this._t('sos_security_title')}</h3>
                    <p style="font-size: 12px; color: #ccc; margin-bottom: 10px;">
                        ${this._t('sos_security_desc')}
                    </p>
                    <div class="security-questions-setup">
                        <div class="security-question-item" style="margin-bottom: 10px;">
                            <input type="text" id="security-q1" placeholder="${this._t('sos_security_q1_placeholder')}" style="width: 100%; padding: 8px; margin-bottom: 5px; background: #0a0a0f; border: 1px solid #333; border-radius: 5px; color: white;">
                            <input type="text" id="security-a1" placeholder="${this._t('sos_security_answer_placeholder')}" style="width: 100%; padding: 8px; background: #0a0a0f; border: 1px solid #333; border-radius: 5px; color: white;">
                        </div>
                        <div class="security-question-item" style="margin-bottom: 10px;">
                            <input type="text" id="security-q2" placeholder="${this._t('sos_security_q2_placeholder')}" style="width: 100%; padding: 8px; margin-bottom: 5px; background: #0a0a0f; border: 1px solid #333; border-radius: 5px; color: white;">
                            <input type="text" id="security-a2" placeholder="${this._t('sos_security_answer_placeholder')}" style="width: 100%; padding: 8px; background: #0a0a0f; border: 1px solid #333; border-radius: 5px; color: white;">
                        </div>
                        <div class="security-question-item">
                            <input type="text" id="security-q3" placeholder="${this._t('sos_security_q3_placeholder')}" style="width: 100%; padding: 8px; margin-bottom: 5px; background: #0a0a0f; border: 1px solid #333; border-radius: 5px; color: white;">
                            <input type="text" id="security-a3" placeholder="${this._t('sos_security_answer_placeholder')}" style="width: 100%; padding: 8px; background: #0a0a0f; border: 1px solid #333; border-radius: 5px; color: white;">
                        </div>
                    </div>
                </div>

                <p style="color: #f59e0b; font-weight: bold;">
                    ⚠️ ${this._t('sos_use_only')}
                </p>

                <div style="margin-top: 20px;">
                    <button class="emergency-btn cancel" onclick="EmergencySystem.closeModal()">
                        ${this._t('sos_cancel')}
                    </button>
                    <button class="emergency-btn confirm" onclick="EmergencySystem.confirmEmergency()" ${this.emergencyContacts.length === 0 ? 'disabled style="opacity:0.5"' : ''}>
                        🚨 ${this._t('sos_confirm')}
                    </button>
                </div>

                ${this.emergencyContacts.length === 0 ? `<p style="color: #dc2626; font-size: 12px;">${this._t('sos_add_contact_required')}</p>` : ''}

                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333;">
                    <button onclick="EmergencySystem.closeModal(); if(typeof LearningCenter !== 'undefined') LearningCenter.openCourse('security-emergency');" style="background: none; border: none; color: #00d4aa; cursor: pointer; font-size: 14px;">
                        📚 ${this._t('sos_guide_link')}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    renderContactList() {
        if (this.emergencyContacts.length === 0) {
            return `<p style="color: #888; font-size: 12px;">${this._t('sos_no_contacts')}</p>`;
        }

        return this.emergencyContacts.map((contact, index) => `
            <div class="contact-item">
                <span>${contact.name} - ${contact.email || contact.phone}</span>
                <button class="remove-contact" onclick="EmergencySystem.removeContact(${index})">×</button>
            </div>
        `).join('');
    },

    addContact() {
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();

        if (!name || (!email && !phone)) {
            alert(this._t('sos_contact_required'));
            return;
        }

        this.emergencyContacts.push({ name, email, phone });
        this.saveContacts();

        // Refresh contact list
        document.getElementById('contact-list').innerHTML = this.renderContactList();

        // Clear inputs
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-email').value = '';
        document.getElementById('contact-phone').value = '';

        // Enable confirm button
        const confirmBtn = document.querySelector('.emergency-btn.confirm');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
        }
    },

    removeContact(index) {
        this.emergencyContacts.splice(index, 1);
        this.saveContacts();
        document.getElementById('contact-list').innerHTML = this.renderContactList();

        // Disable confirm button if no contacts
        if (this.emergencyContacts.length === 0) {
            const confirmBtn = document.querySelector('.emergency-btn.confirm');
            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.style.opacity = '0.5';
            }
        }
    },

    confirmEmergency() {
        if (this.emergencyContacts.length === 0) {
            alert(this._t('sos_add_contact_required'));
            return;
        }

        // Save security questions
        const q1 = document.getElementById('security-q1')?.value.trim();
        const a1 = document.getElementById('security-a1')?.value.trim().toLowerCase();
        const q2 = document.getElementById('security-q2')?.value.trim();
        const a2 = document.getElementById('security-a2')?.value.trim().toLowerCase();
        const q3 = document.getElementById('security-q3')?.value.trim();
        const a3 = document.getElementById('security-a3')?.value.trim().toLowerCase();

        // At least 2 security questions required
        const questions = [];
        if (q1 && a1) questions.push({ question: q1, answer: a1 });
        if (q2 && a2) questions.push({ question: q2, answer: a2 });
        if (q3 && a3) questions.push({ question: q3, answer: a3 });

        if (questions.length < 2) {
            alert(this._t('sos_fill_questions'));
            return;
        }

        this.securityQuestions = questions;

        // Generate cancel code (real)
        this.cancelCode = this.generateCancelCode();

        // Generate duress code (fake - triggers silent alert)
        this.duressCode = this.generateDuressCode();

        // Show cancel code to user (they need to remember it)
        this.closeModal();
        this.showCancelCodeReveal();
    },

    generateDuressCode() {
        // Generate a code that ends with 00 (duress indicator)
        const chars = '0123456789';
        let code = '';
        for (let i = 0; i < this.CANCEL_CODE_LENGTH - 2; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code + '00'; // Always ends with 00
    },

    showCancelCodeReveal() {
        const overlay = document.createElement('div');
        overlay.className = 'emergency-modal-overlay';
        overlay.id = 'cancel-code-reveal-modal';

        overlay.innerHTML = `
            <div class="emergency-modal">
                <h2>🔐 ${this._t('sos_codes_title')}</h2>

                <p>${this._t('sos_memorize')}</p>

                <!-- Real cancel code -->
                <div style="background: #0a0a0f; padding: 15px; border-radius: 10px; margin: 15px 0; border: 2px solid #00d4aa;">
                    <p style="color: #00d4aa; margin-bottom: 10px; font-weight: bold;">✅ ${this._t('sos_real_code')}</p>
                    <div style="font-size: 40px; font-weight: bold; color: #00d4aa; letter-spacing: 12px; font-family: monospace;">
                        ${this.cancelCode}
                    </div>
                </div>

                <!-- Duress code -->
                <div style="background: #0a0a0f; padding: 15px; border-radius: 10px; margin: 15px 0; border: 2px solid #dc2626;">
                    <p style="color: #dc2626; margin-bottom: 10px; font-weight: bold;">🚨 ${this._t('sos_duress_code')}</p>
                    <div style="font-size: 40px; font-weight: bold; color: #dc2626; letter-spacing: 12px; font-family: monospace;">
                        ${this.duressCode}
                    </div>
                    <p style="font-size: 11px; color: #fca5a5; margin-top: 10px;">
                        ${this._t('sos_duress_desc')}
                    </p>
                </div>

                <div class="emergency-warning">
                    <p>⚠️ <strong>${this._t('sos_verification_steps')}</strong></p>
                    <ul>
                        <li>1️⃣ ${this._t('sos_step1')}</li>
                        <li>2️⃣ ${this._t('sos_step2')}</li>
                        <li>3️⃣ ${this._t('sos_step3')}</li>
                    </ul>
                    <p style="font-size: 11px; color: #fca5a5; margin-top: 10px;">
                        ${this._t('sos_step3_desc')}
                    </p>
                </div>

                <p style="color: #f59e0b;">
                    ${this._t('sos_memorized')}
                </p>

                <div style="margin-top: 20px;">
                    <button class="emergency-btn cancel" onclick="EmergencySystem.abortEmergency()">
                        ${this._t('sos_abort')}
                    </button>
                    <button class="emergency-btn confirm" onclick="EmergencySystem.triggerEmergency()">
                        ✅ ${this._t('sos_memorized')}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    generateCancelCode() {
        const chars = '0123456789';
        let code = '';
        for (let i = 0; i < this.CANCEL_CODE_LENGTH; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    abortEmergency() {
        this.cancelCode = null;
        this.closeModal();
    },

    triggerEmergency() {
        console.log('[EMERGENCY] 🚨 EMERGENCY ACTIVATED');

        // Set lockdown state
        this.isLocked = true;
        this.lockdownStartTime = Date.now();
        this.cancelAttempts = 0;
        this.saveState();

        // Close any open modals
        this.closeModal();

        // Notify contacts
        this.notifyContacts();

        // Start GPS tracking + backend SOS alert
        this.startGpsTracking();

        // Show lockdown screen
        this.showLockdownScreen();

        // Update emergency button
        const btn = document.getElementById('emergency-panic-btn');
        if (btn) {
            btn.classList.add('locked');
            btn.innerHTML = `
                <span class="emergency-icon">🔒</span>
                <span class="emergency-text">${this._t('sos_locked')}</span>
            `;
        }

        // Start countdown checker
        this.startCountdownChecker();
    },

    // ═══════════════════════════════════════════════════════════════
    // CONTACT NOTIFICATION
    // ═══════════════════════════════════════════════════════════════
    async notifyContacts() {
        console.log('[EMERGENCY] Notifying contacts:', this.emergencyContacts);

        const lang = (typeof I18n !== 'undefined' && I18n.currentLang) || 'en';
        const message = {
            subject: `🚨 ${this._t('sos_notif_subject')}`,
            body: `
${this._t('sos_notif_activated')}

${this._t('sos_notif_may_indicate')}
- ${this._t('sos_notif_kidnapping')}
- ${this._t('sos_notif_sequestration')}
- ${this._t('sos_notif_coercion')}

${this._t('sos_notif_locked_24h')}

Date: ${new Date().toLocaleString(lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : lang === 'es' ? 'es-ES' : 'en-US')}

${this._t('sos_notif_contact_authorities')}
            `
        };

        // In production, this would send actual emails/SMS
        // For now, we'll simulate and show notification
        for (const contact of this.emergencyContacts) {
            console.log(`[EMERGENCY] Notifying ${contact.name}:`, contact.email || contact.phone);

            // Try to send email via webhook/API
            try {
                // This is where you'd integrate with an email service
                // For demo, we'll use a notification
                if (Notification.permission === 'granted') {
                    new Notification(`${this._t('sos_notif_subject')} → ${contact.name}`, {
                        body: `${contact.email || contact.phone}`,
                        icon: '🚨'
                    });
                }
            } catch (e) {
                console.error('[EMERGENCY] Failed to notify:', e);
            }
        }

        // Store notification log
        const notificationLog = {
            timestamp: Date.now(),
            contacts: this.emergencyContacts.map(c => c.name),
            status: 'sent'
        };
        localStorage.setItem('obelisk_emergency_notifications', JSON.stringify(notificationLog));
    },

    // ═══════════════════════════════════════════════════════════════
    // LOCKDOWN SCREEN
    // ═══════════════════════════════════════════════════════════════
    showLockdownScreen() {
        // Remove existing
        const existing = document.getElementById('lockdown-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'lockdown-overlay';
        overlay.id = 'lockdown-overlay';

        const timeRemaining = this.getTimeRemaining();

        overlay.innerHTML = `
            <div class="lock-icon">🔒</div>
            <h1>${this._t('sos_account_locked')}</h1>
            <p style="font-size: 18px; max-width: 500px; text-align: center; color: #ccc;">
                ${this._t('sos_lockdown_desc')}<br>
                ${this._t('sos_contacts_notified')}
            </p>

            <div id="sos-gps-status" class="gps-status-box">
                <div class="gps-icon">📡</div>
                <div id="gps-coords">${this._t('sos_gps_locating')}</div>
                <div id="gps-accuracy">${this._t('sos_gps_precision')}: --</div>
                <div id="gps-movement" class="hidden">🚗 ${this._t('sos_gps_moving')}</div>
            </div>

            <div class="countdown-display" id="lockdown-countdown">
                ${timeRemaining}
            </div>

            <p style="color: #888;">${this._t('sos_time_remaining')}</p>

            <button class="emergency-btn" style="background: #00d4aa; margin-top: 30px;" onclick="EmergencySystem.showCancelDialog()">
                🔓 ${this._t('sos_cancel_emergency')}
            </button>

            <p style="color: #666; font-size: 12px; margin-top: 20px;">
                ${this._t('sos_safe_msg')}<br>
                ${this._t('sos_24h_warning')}
            </p>
        `;

        document.body.appendChild(overlay);
    },

    getTimeRemaining() {
        if (!this.lockdownStartTime) return '00:00:00';

        const elapsed = Date.now() - this.lockdownStartTime;
        const remaining = Math.max(0, this.LOCKDOWN_DURATION - elapsed);

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    startCountdownChecker() {
        // Update countdown every second
        this.countdownInterval = setInterval(() => {
            const countdownEl = document.getElementById('lockdown-countdown');
            if (countdownEl) {
                countdownEl.textContent = this.getTimeRemaining();
            }

            // Check if lockdown expired
            if (this.lockdownStartTime) {
                const elapsed = Date.now() - this.lockdownStartTime;
                if (elapsed >= this.LOCKDOWN_DURATION) {
                    this.handleLockdownExpired();
                }
            }
        }, 1000);
    },

    handleLockdownExpired() {
        console.log('[EMERGENCY] 🚨 LOCKDOWN EXPIRED - USER MAY BE IN DANGER');

        // Clear countdown interval (but NOT GPS tracking - keep tracking)
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        // Send final GPS position to backend
        if (this.lastPosition && this.currentSosId) {
            this.sendGpsUpdate(this.lastPosition);
        }

        // Send final alert to contacts
        this.sendFinalAlert();

        // Update screen
        const overlay = document.getElementById('lockdown-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="lock-icon" style="color: #dc2626;">⚠️</div>
                <h1 style="color: #dc2626;">${this._t('sos_alert_confirmed')}</h1>
                <p style="font-size: 18px; max-width: 500px; text-align: center; color: #fca5a5;">
                    ${this._t('sos_expired_desc')}<br>
                    ${this._t('sos_final_alert_sent')}<br>
                    ${this._t('sos_authorities_contact')}
                </p>

                <button class="emergency-btn" style="background: #00d4aa; margin-top: 30px;" onclick="EmergencySystem.showCancelDialog()">
                    🔓 ${this._t('sos_have_access')}
                </button>
            `;
        }
    },

    sendFinalAlert() {
        console.log('[EMERGENCY] Sending FINAL ALERT to contacts');

        // In production, this would send urgent alerts
        for (const contact of this.emergencyContacts) {
            console.log(`[EMERGENCY] FINAL ALERT to ${contact.name}`);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // CANCEL DIALOG
    // ═══════════════════════════════════════════════════════════════
    showCancelDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'emergency-modal-overlay';
        overlay.id = 'cancel-dialog-modal';

        overlay.innerHTML = `
            <div class="emergency-modal locked-modal">
                <h2>🔓 ${this._t('sos_cancel_title')}</h2>

                <p>${this._t('sos_enter_code')}</p>

                <input type="text"
                       class="cancel-code-input"
                       id="cancel-code-input"
                       maxlength="6"
                       placeholder="000000"
                       oninput="this.value = this.value.replace(/[^0-9]/g, '')">

                <p class="attempts-warning">
                    ${this._t('sos_attempts_remaining')} : ${this.MAX_CANCEL_ATTEMPTS - this.cancelAttempts}
                </p>

                <div style="margin-top: 20px;">
                    <button class="emergency-btn cancel" onclick="EmergencySystem.closeCancelDialog()">
                        ${this._t('sos_back')}
                    </button>
                    <button class="emergency-btn" style="background: #00d4aa;" onclick="EmergencySystem.verifyCancelCode()">
                        ✅ ${this._t('sos_verify')}
                    </button>
                </div>

                ${this.cancelAttempts >= this.MAX_CANCEL_ATTEMPTS - 1 ? `
                    <p style="color: #dc2626; margin-top: 15px; font-size: 12px;">
                        ⚠️ ${this._t('sos_max_attempts_warning')}
                    </p>
                ` : ''}
            </div>
        `;

        document.body.appendChild(overlay);

        // Focus input
        setTimeout(() => {
            document.getElementById('cancel-code-input')?.focus();
        }, 100);
    },

    closeCancelDialog() {
        const modal = document.getElementById('cancel-dialog-modal');
        if (modal) modal.remove();
    },

    verifyCancelCode() {
        const input = document.getElementById('cancel-code-input');
        const enteredCode = input?.value || '';

        // Check for duress code (silent alert mode)
        if (enteredCode === this.duressCode) {
            console.log('[EMERGENCY] 🚨 DURESS CODE ENTERED - SILENT ALERT');
            this.handleDuressCode();
            return;
        }

        if (enteredCode === this.cancelCode) {
            // Step 1 complete - now ask security questions
            this.closeCancelDialog();
            this.showSecurityQuestionsVerification();
        } else {
            // Failed attempt
            this.cancelAttempts++;
            this.saveState();

            if (this.cancelAttempts >= this.MAX_CANCEL_ATTEMPTS) {
                alert(this._t('sos_too_many_attempts'));
                this.closeCancelDialog();
            } else {
                alert(`${this._t('sos_wrong_code')} ${this.MAX_CANCEL_ATTEMPTS - this.cancelAttempts} ${this._t('sos_attempts_left')}`);
                input.value = '';
                input.focus();

                // Update attempts display
                const warningEl = document.querySelector('.attempts-warning');
                if (warningEl) {
                    warningEl.textContent = `${this._t('sos_attempts_remaining')} : ${this.MAX_CANCEL_ATTEMPTS - this.cancelAttempts}`;
                }
            }
        }
    },

    handleDuressCode() {
        // Fake unlock - but send silent alert to contacts
        console.log('[EMERGENCY] Sending silent duress alert to contacts...');

        // Notify contacts secretly
        for (const contact of this.emergencyContacts) {
            console.log(`[EMERGENCY] 🚨 DURESS ALERT to ${contact.name}: User may be under coercion!`);
        }

        // Store duress event
        const duressLog = {
            timestamp: Date.now(),
            type: 'duress_code_used',
            message: 'User entered duress code - possible coercion'
        };
        const logs = JSON.parse(localStorage.getItem('obelisk_security_logs') || '[]');
        logs.push(duressLog);
        localStorage.setItem('obelisk_security_logs', JSON.stringify(logs));

        // Show fake success (but keep tracking in background)
        this.closeCancelDialog();
        this.showFakeUnlockSuccess();

        // Keep a hidden alert state
        localStorage.setItem('obelisk_duress_active', JSON.stringify({
            active: true,
            timestamp: Date.now()
        }));
    },

    showFakeUnlockSuccess() {
        // This looks like success but is fake
        const overlay = document.createElement('div');
        overlay.className = 'emergency-modal-overlay';
        overlay.id = 'unlock-success-modal';

        overlay.innerHTML = `
            <div class="emergency-modal" style="border-color: #00d4aa;">
                <h2 style="color: #00d4aa;">✅ ${this._t('sos_unlocked')}</h2>

                <div style="font-size: 80px; margin: 20px 0;">🎉</div>

                <p>${this._t('sos_safe_confirmed')}</p>
                <p>${this._t('sos_contacts_safe')}</p>

                <button class="emergency-btn" style="background: #00d4aa; margin-top: 20px;" onclick="EmergencySystem.closeFakeUnlock()">
                    ${this._t('sos_continue')}
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Remove lockdown overlay but keep tracking
        const lockdownOverlay = document.getElementById('lockdown-overlay');
        if (lockdownOverlay) lockdownOverlay.remove();

        // Update button to look normal
        const btn = document.getElementById('emergency-panic-btn');
        if (btn) {
            btn.classList.remove('locked');
            btn.innerHTML = `
                <span class="emergency-icon">🆘</span>
                <span class="emergency-text">SOS</span>
            `;
        }
    },

    closeFakeUnlock() {
        const modal = document.getElementById('unlock-success-modal');
        if (modal) modal.remove();
        // Note: Account is NOT actually unlocked - still tracked as duress
    },

    showSecurityQuestionsVerification() {
        // Step 2: Security questions
        const overlay = document.createElement('div');
        overlay.className = 'emergency-modal-overlay';
        overlay.id = 'security-questions-modal';

        // Pick 2 random questions
        const shuffled = [...this.securityQuestions].sort(() => Math.random() - 0.5);
        const questionsToAsk = shuffled.slice(0, 2);

        overlay.innerHTML = `
            <div class="emergency-modal locked-modal">
                <h2>🔐 ${this._t('sos_security_verify_title')}</h2>
                <p style="color: #ccc;">${this._t('sos_security_step')}</p>

                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    ${questionsToAsk.map((q, i) => `
                        <div style="margin-bottom: 15px;">
                            <label style="color: #f59e0b; display: block; margin-bottom: 5px;">
                                ${q.question}
                            </label>
                            <input type="text"
                                   class="security-answer-input"
                                   id="security-answer-${i}"
                                   data-correct="${q.answer}"
                                   placeholder="${this._t('sos_answer_placeholder')}"
                                   style="width: 100%; padding: 12px; background: #0a0a0f; border: 1px solid #333; border-radius: 8px; color: white;">
                        </div>
                    `).join('')}
                </div>

                <p style="color: #888; font-size: 12px;">
                    ${this._t('sos_answers_must_match')}
                </p>

                <div style="margin-top: 20px;">
                    <button class="emergency-btn cancel" onclick="EmergencySystem.closeSecurityQuestions()">
                        ${this._t('sos_cancel')}
                    </button>
                    <button class="emergency-btn" style="background: #00d4aa;" onclick="EmergencySystem.verifySecurityAnswers()">
                        ✅ ${this._t('sos_verify')}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    closeSecurityQuestions() {
        const modal = document.getElementById('security-questions-modal');
        if (modal) modal.remove();
    },

    verifySecurityAnswers() {
        const inputs = document.querySelectorAll('.security-answer-input');
        let allCorrect = true;

        inputs.forEach(input => {
            const answer = input.value.trim().toLowerCase();
            const correct = input.dataset.correct;
            if (answer !== correct) {
                allCorrect = false;
                input.style.borderColor = '#dc2626';
            } else {
                input.style.borderColor = '#00d4aa';
            }
        });

        if (allCorrect) {
            // Step 2 complete - now wait period
            this.closeSecurityQuestions();
            this.startUnlockCountdown();
        } else {
            alert(this._t('sos_wrong_answers'));
        }
    },

    startUnlockCountdown() {
        // Step 3: 30 minute wait before actual unlock
        const WAIT_TIME = 30 * 60 * 1000; // 30 minutes
        const unlockTime = Date.now() + WAIT_TIME;

        // Store pending unlock
        localStorage.setItem('obelisk_pending_unlock', JSON.stringify({
            unlockTime: unlockTime,
            verified: true
        }));

        // Notify contacts about pending unlock
        this.notifyContactsPendingUnlock();

        // Show countdown
        this.showUnlockCountdownScreen(unlockTime);
    },

    notifyContactsPendingUnlock() {
        console.log('[EMERGENCY] Notifying contacts: UNLOCK PENDING (30 min delay)');

        for (const contact of this.emergencyContacts) {
            console.log(`[EMERGENCY] Pending unlock notification to ${contact.name}`);
            // In production: send alert that unlock was requested
        }
    },

    showUnlockCountdownScreen(unlockTime) {
        const overlay = document.createElement('div');
        overlay.className = 'emergency-modal-overlay';
        overlay.id = 'unlock-countdown-modal';

        const updateCountdown = () => {
            const remaining = Math.max(0, unlockTime - Date.now());
            const minutes = Math.floor(remaining / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            const countdownEl = document.getElementById('unlock-countdown-timer');
            if (countdownEl) {
                countdownEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            if (remaining <= 0) {
                clearInterval(this.unlockCountdownInterval);
                this.completeUnlock();
            }
        };

        overlay.innerHTML = `
            <div class="emergency-modal" style="border-color: #f59e0b;">
                <h2 style="color: #f59e0b;">⏳ ${this._t('sos_unlocking_title')}</h2>

                <p>${this._t('sos_unlock_step3')}</p>

                <div style="font-size: 60px; margin: 20px 0;">⏱️</div>

                <div class="countdown-display" id="unlock-countdown-timer" style="color: #f59e0b;">
                    30:00
                </div>

                <p style="color: #ccc; max-width: 400px; margin: 0 auto;">
                    ${this._t('sos_unlock_delay_desc')}
                </p>

                <div class="emergency-warning" style="margin-top: 20px;">
                    <p style="color: #fca5a5; font-size: 12px;">
                        ⚠️ ${this._t('sos_contacts_unlock_warning')}
                    </p>
                </div>

                <button class="emergency-btn cancel" style="margin-top: 20px;" onclick="EmergencySystem.cancelPendingUnlock()">
                    ❌ ${this._t('sos_cancel_unlock')}
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Start countdown
        this.unlockCountdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    },

    cancelPendingUnlock() {
        // User cancelled - they might still be in danger
        localStorage.removeItem('obelisk_pending_unlock');

        if (this.unlockCountdownInterval) {
            clearInterval(this.unlockCountdownInterval);
        }

        const modal = document.getElementById('unlock-countdown-modal');
        if (modal) modal.remove();

        // Show lockdown screen again
        this.showLockdownScreen();
    },

    completeUnlock() {
        // All 3 steps verified + 30 min wait complete
        console.log('[EMERGENCY] Unlock complete after full verification');

        localStorage.removeItem('obelisk_pending_unlock');

        const modal = document.getElementById('unlock-countdown-modal');
        if (modal) modal.remove();

        // Actually unlock
        this.unlockAccount();
    },

    unlockAccount() {
        console.log('[EMERGENCY] Account unlocked successfully');

        // Stop GPS tracking
        this.stopGpsTracking();

        // Clear lockdown state
        this.isLocked = false;
        this.lockdownStartTime = null;
        this.cancelCode = null;
        this.cancelAttempts = 0;
        this.saveState();

        // Clear interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        // Remove overlays
        this.closeCancelDialog();
        const lockdownOverlay = document.getElementById('lockdown-overlay');
        if (lockdownOverlay) lockdownOverlay.remove();

        // Reset button
        const btn = document.getElementById('emergency-panic-btn');
        if (btn) {
            btn.classList.remove('locked');
            btn.innerHTML = `
                <span class="emergency-icon">🆘</span>
                <span class="emergency-text">SOS</span>
            `;
        }

        // Notify contacts that user is safe
        this.notifyContactsSafe();

        // Show success message
        this.showUnlockSuccess();
    },

    notifyContactsSafe() {
        console.log('[EMERGENCY] Notifying contacts: USER IS SAFE');

        for (const contact of this.emergencyContacts) {
            console.log(`[EMERGENCY] Safety notification to ${contact.name}`);
        }
    },

    showUnlockSuccess() {
        const overlay = document.createElement('div');
        overlay.className = 'emergency-modal-overlay';
        overlay.id = 'unlock-success-modal';

        overlay.innerHTML = `
            <div class="emergency-modal" style="border-color: #00d4aa;">
                <h2 style="color: #00d4aa;">✅ ${this._t('sos_unlocked')}</h2>

                <div style="font-size: 80px; margin: 20px 0;">🎉</div>

                <p>${this._t('sos_safe_confirmed')}</p>
                <p>${this._t('sos_contacts_safe')}</p>

                <button class="emergency-btn" style="background: #00d4aa; margin-top: 20px;" onclick="EmergencySystem.closeModal()">
                    ${this._t('sos_continue')}
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Auto close after 5 seconds
        setTimeout(() => {
            const modal = document.getElementById('unlock-success-modal');
            if (modal) modal.remove();
        }, 5000);
    },

    // ═══════════════════════════════════════════════════════════════
    // GPS TRACKING
    // ═══════════════════════════════════════════════════════════════
    startGpsTracking() {
        if (!navigator.geolocation) {
            console.warn('[EMERGENCY] Geolocation not available');
            this.updateGpsStatusUI(null, this._t('sos_gps_unavailable'), 'error');
            this.createBackendSosAlert(null);
            return;
        }

        console.log('[EMERGENCY] Starting GPS tracking...');
        this.gpsRetryCount = 0;

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('[EMERGENCY] Initial GPS position acquired');
                this.lastPosition = position;
                this.createBackendSosAlert(position);
                this.startGpsWatch();
            },
            (error) => {
                console.warn('[EMERGENCY] Initial GPS failed:', error.message);
                this.handleGpsError(error);
                // Still create SOS alert without GPS
                this.createBackendSosAlert(null);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );
    },

    async createBackendSosAlert(position) {
        try {
            const body = {
                userId: window.walletAddress || 'anonymous',
                message: 'SOS Emergency activated'
            };
            if (position) {
                body.lat = position.coords.latitude;
                body.lng = position.coords.longitude;
            }

            const resp = await fetch(`${this.API_BASE}/api/compliance/sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await resp.json();
            if (data.success && data.alert) {
                this.currentSosId = data.alert.id;
                console.log('[EMERGENCY] Backend SOS alert created:', this.currentSosId);
            }
        } catch (e) {
            console.error('[EMERGENCY] Failed to create backend SOS alert:', e.message);
        }
    },

    startGpsWatch() {
        // Clear existing watch
        if (this.gpsWatchId != null) {
            navigator.geolocation.clearWatch(this.gpsWatchId);
        }

        this.gpsWatchId = navigator.geolocation.watchPosition(
            (position) => {
                this.sendGpsUpdate(position);
            },
            (error) => {
                this.handleGpsError(error);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );

        console.log('[EMERGENCY] GPS watch started, ID:', this.gpsWatchId);
    },

    async sendGpsUpdate(position) {
        const coords = position.coords;
        const lat = coords.latitude;
        const lng = coords.longitude;
        const accuracy = coords.accuracy;
        const speed = coords.speed;
        const heading = coords.heading;
        const altitude = coords.altitude;

        // Compare with last position
        let distanceChange = 0;
        if (this.lastPosition) {
            distanceChange = this.haversineDistanceLocal(
                this.lastPosition.coords.latitude, this.lastPosition.coords.longitude,
                lat, lng
            );

            if (distanceChange > this.GPS_SIGNIFICANT_CHANGE) {
                console.log(`[EMERGENCY] Significant position change: ${Math.round(distanceChange)}m`);
            }
        }

        // Detect transport mode and update UI
        let movementStatus = 'stationnaire';
        if (speed != null && speed > 5) {
            movementStatus = 'vehicule';
        } else if (speed != null && speed > 1.5) {
            movementStatus = 'marche';
        } else if (distanceChange > 500 && (!speed || speed === 0)) {
            // Large jump without speed data - force GPS refresh
            movementStatus = 'deplacement';
            navigator.geolocation.getCurrentPosition(
                (pos) => { this.lastPosition = pos; },
                () => {},
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            );
        }

        // Update UI
        this.updateGpsStatusUI(coords, null, movementStatus !== 'stationnaire' ? 'moving' : 'tracking');

        // Send to backend
        if (this.currentSosId) {
            try {
                const resp = await fetch(`${this.API_BASE}/api/compliance/sos/${this.currentSosId}/location`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat, lng, accuracy, speed, heading, altitude })
                });
                const data = await resp.json();
                if (data.isMoving !== undefined) {
                    this.updateMovementUI(data.isMoving, movementStatus);
                }
            } catch (e) {
                console.error('[EMERGENCY] GPS update send failed:', e.message);
            }
        }

        this.lastPosition = position;
    },

    updateGpsStatusUI(coords, message, state) {
        const statusBox = document.getElementById('sos-gps-status');
        const coordsEl = document.getElementById('gps-coords');
        const accuracyEl = document.getElementById('gps-accuracy');

        if (!statusBox) return;

        // Remove all state classes
        statusBox.classList.remove('tracking', 'moving', 'error');
        if (state) statusBox.classList.add(state);

        if (message) {
            if (coordsEl) coordsEl.textContent = message;
            return;
        }

        if (coords) {
            if (coordsEl) coordsEl.textContent = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
            if (accuracyEl) accuracyEl.textContent = `${this._t('sos_gps_precision')}: ±${Math.round(coords.accuracy || 0)}m`;
        }
    },

    updateMovementUI(isMoving, mode) {
        const movementEl = document.getElementById('gps-movement');
        const statusBox = document.getElementById('sos-gps-status');
        if (!movementEl) return;

        if (isMoving) {
            movementEl.classList.remove('hidden');
            const modeLabels = {
                'vehicule': `🚗 ${this._t('sos_gps_vehicle')}`,
                'marche': `🚶 ${this._t('sos_gps_walking')}`,
                'deplacement': `📍 ${this._t('sos_gps_displacement')}`
            };
            movementEl.textContent = modeLabels[mode] || `🚗 ${this._t('sos_gps_moving')}`;
            if (statusBox) {
                statusBox.classList.remove('tracking');
                statusBox.classList.add('moving');
            }
        } else {
            movementEl.classList.add('hidden');
            if (statusBox) {
                statusBox.classList.remove('moving');
                statusBox.classList.add('tracking');
            }
        }
    },

    handleGpsError(error) {
        console.warn('[EMERGENCY] GPS error:', error.code, error.message);

        switch (error.code) {
            case error.PERMISSION_DENIED:
                this.requestGpsPermission();
                break;
            case error.POSITION_UNAVAILABLE:
                this.updateGpsStatusUI(null, this._t('sos_gps_position_unavailable'), 'error');
                this.gpsRetryCount++;
                if (this.gpsRetryCount < 5) {
                    setTimeout(() => this.startGpsWatch(), 5000);
                }
                break;
            case error.TIMEOUT:
                this.updateGpsStatusUI(null, this._t('sos_gps_timeout'), 'error');
                this.gpsRetryCount++;
                if (this.gpsRetryCount < 5) {
                    setTimeout(() => this.startGpsWatch(), 3000);
                }
                break;
        }
    },

    requestGpsPermission() {
        this.updateGpsStatusUI(null, this._t('sos_gps_denied'), 'error');

        // Show permission request in the lockdown screen
        const statusBox = document.getElementById('sos-gps-status');
        if (!statusBox) return;

        statusBox.innerHTML = `
            <div class="gps-icon">📡</div>
            <div class="gps-permission-modal">
                <p style="color: #e5e5e5; margin-bottom: 10px;">
                    ${this._t('sos_gps_denied_msg')}
                </p>
                <button class="emergency-btn" style="background: #00aaff; padding: 10px 20px;"
                        onclick="EmergencySystem.retryGpsPermission()">
                    📍 ${this._t('sos_gps_authorize')}
                </button>
                <p style="color: #888; font-size: 11px; margin-top: 8px;">
                    ${this._t('sos_gps_denied_continue')}
                </p>
            </div>
        `;
    },

    retryGpsPermission() {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('[EMERGENCY] GPS permission granted on retry');
                this.lastPosition = position;
                this.updateGpsStatusUI(position.coords, null, 'tracking');

                // Restore normal GPS status box
                const statusBox = document.getElementById('sos-gps-status');
                if (statusBox) {
                    statusBox.innerHTML = `
                        <div class="gps-icon">📡</div>
                        <div id="gps-coords">${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}</div>
                        <div id="gps-accuracy">${this._t('sos_gps_precision')}: ±${Math.round(position.coords.accuracy || 0)}m</div>
                        <div id="gps-movement" class="hidden">🚗 ${this._t('sos_gps_moving')}</div>
                    `;
                }

                // Send initial position if we have a SOS ID
                if (this.currentSosId) {
                    this.sendGpsUpdate(position);
                }
                this.startGpsWatch();
            },
            (error) => {
                console.warn('[EMERGENCY] GPS permission still denied');
                this.updateGpsStatusUI(null, this._t('sos_gps_refused'), 'error');
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );
    },

    stopGpsTracking() {
        if (this.gpsWatchId != null) {
            navigator.geolocation.clearWatch(this.gpsWatchId);
            this.gpsWatchId = null;
        }
        if (this.gpsUpdateInterval) {
            clearInterval(this.gpsUpdateInterval);
            this.gpsUpdateInterval = null;
        }
        this.currentSosId = null;
        this.lastPosition = null;
        this.gpsRetryCount = 0;
        console.log('[EMERGENCY] GPS tracking stopped');
    },

    /**
     * Haversine distance (client-side, in meters)
     */
    haversineDistanceLocal(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = (deg) => deg * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════
    closeModal() {
        const modals = document.querySelectorAll('.emergency-modal-overlay');
        modals.forEach(m => m.remove());
    },

    checkLockdownStatus() {
        if (this.isLocked && this.lockdownStartTime) {
            console.log('[EMERGENCY] Lockdown active, showing screen');
            this.showLockdownScreen();
            this.startCountdownChecker();
        }
    },

    // Settings page integration
    openSettings() {
        this.showEmergencyConfirmation();
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    EmergencySystem.init();
});

// Export
window.EmergencySystem = EmergencySystem;
console.log('[EMERGENCY] Emergency System loaded');
