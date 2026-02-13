/**
 * OBELISK 2FA Setup Module
 * Two-factor authentication UI for Google Authenticator
 */

class TwoFactorSetup {
    constructor() {
        this.apiBase = window.OBELISK_API || 'http://localhost:3001';
        this.isEnabled = false;
        this.pendingCallback = null;
    }

    /**
     * Get authorization header
     */
    getAuthHeader() {
        const token = localStorage.getItem('obelisk_session_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Check if 2FA is enabled
     */
    async checkStatus() {
        try {
            const response = await fetch(`${this.apiBase}/api/auth/2fa/status`, {
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to check 2FA status');
            }

            const data = await response.json();
            this.isEnabled = data.enabled;
            return this.isEnabled;
        } catch (error) {
            console.error('[2FA] Status check error:', error);
            return false;
        }
    }

    /**
     * Start 2FA setup process
     */
    async startSetup(email = null) {
        try {
            const response = await fetch(`${this.apiBase}/api/auth/2fa/setup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Failed to start 2FA setup');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[2FA] Setup error:', error);
            throw error;
        }
    }

    /**
     * Verify and enable 2FA
     */
    async verifyAndEnable(token) {
        try {
            const response = await fetch(`${this.apiBase}/api/auth/2fa/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            this.isEnabled = true;
            return data;
        } catch (error) {
            console.error('[2FA] Verify error:', error);
            throw error;
        }
    }

    /**
     * Disable 2FA
     */
    async disable(token) {
        try {
            const response = await fetch(`${this.apiBase}/api/auth/2fa/disable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to disable 2FA');
            }

            this.isEnabled = false;
            return data;
        } catch (error) {
            console.error('[2FA] Disable error:', error);
            throw error;
        }
    }

    /**
     * Validate a 2FA token
     */
    async validateToken(token, challengeId = null) {
        try {
            const response = await fetch(`${this.apiBase}/api/auth/2fa/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                },
                body: JSON.stringify({ token, challengeId })
            });

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('[2FA] Validate error:', error);
            return false;
        }
    }

    /**
     * Regenerate backup codes
     */
    async regenerateBackupCodes(token) {
        try {
            const response = await fetch(`${this.apiBase}/api/auth/2fa/backup-codes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to regenerate codes');
            }

            return data;
        } catch (error) {
            console.error('[2FA] Regenerate error:', error);
            throw error;
        }
    }

    /**
     * Show 2FA setup wizard modal
     */
    showSetupWizard() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay twofa-modal-overlay';
        modal.innerHTML = `
            <div class="modal twofa-modal">
                <div class="modal-header">
                    <h3>Enable Two-Factor Authentication</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="twofa-step" id="step1">
                        <div class="step-indicator">Step 1 of 3</div>
                        <h4>Install Authenticator App</h4>
                        <p>Download Google Authenticator or any TOTP-compatible app:</p>
                        <div class="app-links">
                            <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" class="app-link">
                                <img src="https://www.gstatic.com/images/branding/product/2x/play_prism_64dp.png" alt="Google Play" width="32">
                                <span>Google Play</span>
                            </a>
                            <a href="https://apps.apple.com/app/google-authenticator/id388497605" target="_blank" class="app-link">
                                <img src="https://www.apple.com/v/app-store/b/images/overview/icon_appstore__ev0z770zyxoy_large_2x.png" alt="App Store" width="32">
                                <span>App Store</span>
                            </a>
                        </div>
                        <button class="btn btn-primary btn-block" id="continueToStep2">Continue</button>
                    </div>

                    <div class="twofa-step hidden" id="step2">
                        <div class="step-indicator">Step 2 of 3</div>
                        <h4>Scan QR Code</h4>
                        <p>Scan this QR code with your authenticator app:</p>
                        <div class="qr-container" id="qrContainer">
                            <div class="loading">Generating QR code...</div>
                        </div>
                        <div class="manual-entry hidden" id="manualEntry">
                            <p>Or enter this code manually:</p>
                            <div class="secret-code" id="secretCode"></div>
                            <button class="btn btn-sm btn-outline" id="copySecretBtn">Copy Code</button>
                        </div>
                        <button class="btn btn-link" id="showManualEntry">Can't scan? Enter manually</button>
                        <button class="btn btn-primary btn-block" id="continueToStep3">Continue</button>
                    </div>

                    <div class="twofa-step hidden" id="step3">
                        <div class="step-indicator">Step 3 of 3</div>
                        <h4>Verify Setup</h4>
                        <p>Enter the 6-digit code from your authenticator app:</p>
                        <div class="code-input-container">
                            <input type="text" class="code-input" id="verifyCode"
                                   maxlength="6" pattern="[0-9]*" inputmode="numeric"
                                   placeholder="000000" autocomplete="one-time-code">
                        </div>
                        <div class="error-message hidden" id="verifyError"></div>
                        <button class="btn btn-primary btn-block" id="verifyBtn">Verify & Enable</button>
                    </div>

                    <div class="twofa-step hidden" id="stepSuccess">
                        <div class="success-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h4>2FA Enabled!</h4>
                        <p>Your account is now protected with two-factor authentication.</p>

                        <div class="backup-codes-section">
                            <h5>Backup Codes</h5>
                            <p class="warning">Save these codes securely. Each can only be used once if you lose access to your authenticator.</p>
                            <div class="backup-codes" id="backupCodes"></div>
                            <div class="backup-actions">
                                <button class="btn btn-sm btn-outline" id="downloadCodesBtn">Download</button>
                                <button class="btn btn-sm btn-outline" id="copyCodesBtn">Copy All</button>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-block" id="closeSetup">Done</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachSetupListeners(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    /**
     * Attach setup wizard event listeners
     */
    attachSetupListeners(modal) {
        let setupData = null;

        // Step 1 -> Step 2
        modal.querySelector('#continueToStep2').addEventListener('click', async () => {
            modal.querySelector('#step1').classList.add('hidden');
            modal.querySelector('#step2').classList.remove('hidden');

            // Generate QR code
            try {
                setupData = await this.startSetup();
                this.renderQRCode(modal, setupData);
            } catch (error) {
                modal.querySelector('#qrContainer').innerHTML = `<div class="error">${error.message}</div>`;
            }
        });

        // Show manual entry
        modal.querySelector('#showManualEntry').addEventListener('click', () => {
            modal.querySelector('#manualEntry').classList.remove('hidden');
        });

        // Copy secret
        modal.querySelector('#copySecretBtn').addEventListener('click', () => {
            if (setupData?.secret) {
                navigator.clipboard.writeText(setupData.secret);
                this.showToast('Secret code copied!');
            }
        });

        // Step 2 -> Step 3
        modal.querySelector('#continueToStep3').addEventListener('click', () => {
            modal.querySelector('#step2').classList.add('hidden');
            modal.querySelector('#step3').classList.remove('hidden');

            // Focus on input
            modal.querySelector('#verifyCode').focus();
        });

        // Auto-submit on 6 digits
        const codeInput = modal.querySelector('#verifyCode');
        codeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);

            if (e.target.value.length === 6) {
                modal.querySelector('#verifyBtn').click();
            }
        });

        // Verify
        modal.querySelector('#verifyBtn').addEventListener('click', async () => {
            const code = codeInput.value;
            const errorEl = modal.querySelector('#verifyError');

            if (code.length !== 6) {
                errorEl.textContent = 'Please enter a 6-digit code';
                errorEl.classList.remove('hidden');
                return;
            }

            try {
                const result = await this.verifyAndEnable(code);

                // Show success with backup codes
                modal.querySelector('#step3').classList.add('hidden');
                modal.querySelector('#stepSuccess').classList.remove('hidden');

                if (result.backupCodes) {
                    this.renderBackupCodes(modal, result.backupCodes);
                }
            } catch (error) {
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
                codeInput.value = '';
                codeInput.focus();
            }
        });

        // Download backup codes
        modal.querySelector('#downloadCodesBtn').addEventListener('click', () => {
            const codes = modal.querySelector('#backupCodes').textContent;
            const blob = new Blob([`Obelisk 2FA Backup Codes\n\n${codes}\n\nKeep these codes safe!`], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'obelisk-backup-codes.txt';
            a.click();
            URL.revokeObjectURL(url);
        });

        // Copy backup codes
        modal.querySelector('#copyCodesBtn').addEventListener('click', () => {
            const codes = modal.querySelector('#backupCodes').textContent;
            navigator.clipboard.writeText(codes);
            this.showToast('Backup codes copied!');
        });

        // Close
        modal.querySelector('#closeSetup').addEventListener('click', () => {
            modal.remove();
            window.dispatchEvent(new CustomEvent('twofa:enabled'));
        });
    }

    /**
     * Render QR code (using simple canvas or external library)
     */
    renderQRCode(modal, setupData) {
        const container = modal.querySelector('#qrContainer');

        // Try to use QRCode library if available, otherwise show URI
        if (window.QRCode) {
            container.innerHTML = '';
            new QRCode(container, {
                text: setupData.uri,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff'
            });
        } else {
            // Fallback: use a QR code API
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.uri)}`;
            container.innerHTML = `<img src="${qrUrl}" alt="QR Code" width="200" height="200">`;
        }

        // Show secret code for manual entry
        modal.querySelector('#secretCode').textContent = setupData.manualEntry?.secret || setupData.secret;
    }

    /**
     * Render backup codes
     */
    renderBackupCodes(modal, codes) {
        const container = modal.querySelector('#backupCodes');
        container.innerHTML = codes.map(code => `<div class="backup-code">${code}</div>`).join('');
    }

    /**
     * Prompt for 2FA verification (for protected actions)
     */
    prompt2FA(action, callback) {
        this.pendingCallback = callback;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay twofa-modal-overlay';
        modal.innerHTML = `
            <div class="modal twofa-verify-modal">
                <div class="modal-header">
                    <h3>2FA Verification Required</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Enter your 2FA code to ${this.formatAction(action)}:</p>
                    <div class="code-input-container">
                        <input type="text" class="code-input" id="promptCode"
                               maxlength="6" pattern="[0-9]*" inputmode="numeric"
                               placeholder="000000" autocomplete="one-time-code">
                    </div>
                    <p class="hint">You can also use a backup code (8 characters)</p>
                    <div class="error-message hidden" id="promptError"></div>
                    <button class="btn btn-primary btn-block" id="submitCode">Verify</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const input = modal.querySelector('#promptCode');
        input.focus();

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
            if (this.pendingCallback) {
                this.pendingCallback(null);
                this.pendingCallback = null;
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (this.pendingCallback) {
                    this.pendingCallback(null);
                    this.pendingCallback = null;
                }
            }
        });

        // Auto-submit
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9A-Za-z]/g, '').slice(0, 8);
            if (e.target.value.length === 6 || e.target.value.length === 8) {
                modal.querySelector('#submitCode').click();
            }
        });

        modal.querySelector('#submitCode').addEventListener('click', async () => {
            const code = input.value;

            if (code.length !== 6 && code.length !== 8) {
                modal.querySelector('#promptError').textContent = 'Invalid code format';
                modal.querySelector('#promptError').classList.remove('hidden');
                return;
            }

            modal.remove();

            if (this.pendingCallback) {
                this.pendingCallback(code);
                this.pendingCallback = null;
            }
        });
    }

    /**
     * Format action name for display
     */
    formatAction(action) {
        const actions = {
            'link_wallet': 'link a new wallet',
            'unlink_wallet': 'remove a wallet',
            'set_primary_wallet': 'change your primary wallet',
            'withdrawal': 'complete this withdrawal',
            'disable_2fa': 'disable 2FA',
            'generate_api_key': 'generate an API key'
        };
        return actions[action] || action;
    }

    /**
     * Show management UI
     */
    showManageModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay twofa-modal-overlay';
        modal.innerHTML = `
            <div class="modal twofa-manage-modal">
                <div class="modal-header">
                    <h3>Two-Factor Authentication</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="twofa-status">
                        <span class="status-badge ${this.isEnabled ? 'enabled' : 'disabled'}">
                            ${this.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    ${this.isEnabled ? `
                        <div class="manage-options">
                            <button class="btn btn-outline btn-block" id="regenCodesBtn">
                                Regenerate Backup Codes
                            </button>
                            <button class="btn btn-danger btn-block" id="disable2FABtn">
                                Disable 2FA
                            </button>
                        </div>
                    ` : `
                        <div class="enable-prompt">
                            <p>Protect your account with two-factor authentication.</p>
                            <button class="btn btn-primary btn-block" id="enable2FABtn">
                                Enable 2FA
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        if (this.isEnabled) {
            modal.querySelector('#regenCodesBtn')?.addEventListener('click', async () => {
                this.prompt2FA('regenerate_codes', async (token) => {
                    if (token) {
                        try {
                            const result = await this.regenerateBackupCodes(token);
                            modal.remove();
                            this.showBackupCodesModal(result.backupCodes);
                        } catch (error) {
                            this.showToast(error.message, 'error');
                        }
                    }
                });
            });

            modal.querySelector('#disable2FABtn')?.addEventListener('click', () => {
                if (confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) {
                    this.prompt2FA('disable_2fa', async (token) => {
                        if (token) {
                            try {
                                await this.disable(token);
                                this.showToast('2FA disabled');
                                modal.remove();
                                window.dispatchEvent(new CustomEvent('twofa:disabled'));
                            } catch (error) {
                                this.showToast(error.message, 'error');
                            }
                        }
                    });
                }
            });
        } else {
            modal.querySelector('#enable2FABtn')?.addEventListener('click', () => {
                modal.remove();
                this.showSetupWizard();
            });
        }
    }

    /**
     * Show backup codes modal
     */
    showBackupCodesModal(codes) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay twofa-modal-overlay';
        modal.innerHTML = `
            <div class="modal twofa-modal">
                <div class="modal-header">
                    <h3>New Backup Codes</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="warning">Your previous backup codes are now invalid. Save these new codes:</p>
                    <div class="backup-codes" id="newBackupCodes">
                        ${codes.map(c => `<div class="backup-code">${c}</div>`).join('')}
                    </div>
                    <div class="backup-actions">
                        <button class="btn btn-sm btn-outline" id="downloadNewCodesBtn">Download</button>
                        <button class="btn btn-sm btn-outline" id="copyNewCodesBtn">Copy All</button>
                    </div>
                    <button class="btn btn-primary btn-block" id="closeNewCodes">Done</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('#closeNewCodes').addEventListener('click', () => modal.remove());

        modal.querySelector('#downloadNewCodesBtn').addEventListener('click', () => {
            const blob = new Blob([`Obelisk 2FA Backup Codes\n\n${codes.join('\n')}\n\nKeep these codes safe!`], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'obelisk-backup-codes.txt';
            a.click();
            URL.revokeObjectURL(url);
        });

        modal.querySelector('#copyNewCodesBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(codes.join('\n'));
            this.showToast('Codes copied!');
        });
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export singleton
window.twoFactorSetup = new TwoFactorSetup();
