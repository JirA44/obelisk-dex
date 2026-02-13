/**
 * OBELISK DEX - SOCIAL ENGINEERING PROTECTION
 * Anti-Phishing, Deepfake Protection, Social Recovery Security
 * Mitigates: SOCIAL-002, SOCIAL-003
 */

const SocialSecurity = {
    // Configuration
    config: {
        // Multi-party approval thresholds
        approval: {
            lowValue: 1000,           // Below $1k: single approval
            mediumValue: 10000,       // $1k-$10k: 2 approvals
            highValue: 50000,         // $10k-$50k: 3 approvals
            criticalValue: 100000     // Above $100k: 4 approvals + timelock
        },

        // Timelock durations (ms)
        timelocks: {
            medium: 3600000,          // 1 hour
            high: 86400000,           // 24 hours
            critical: 259200000       // 72 hours
        },

        // Social recovery settings
        socialRecovery: {
            minGuardians: 3,
            requiredForRecovery: 2,   // M of N
            recoveryDelay: 172800000, // 48 hours
            maxGuardians: 7
        },

        // Anti-phishing
        verificationChallenges: true,
        callbackVerification: true
    },

    // State
    state: {
        pendingApprovals: new Map(),
        guardians: new Map(),
        recoveryRequests: [],
        verificationCodes: new Map(),
        alerts: [],
        statistics: {
            approvalsProcessed: 0,
            recoveryAttempts: 0,
            phishingBlocked: 0
        }
    },

    /**
     * Initialize Social Security
     */
    init() {
        console.log('[SocialSecurity] Initializing social engineering protection...');

        // Clean expired items periodically
        setInterval(() => this.cleanExpired(), 60000);

        console.log('[SocialSecurity] Ready - Social protection active');
        return true;
    },

    // ============================================
    // MULTI-PARTY APPROVAL (SOCIAL-002)
    // ============================================

    /**
     * Create approval request for high-value operation
     */
    async createApprovalRequest(operation) {
        const {
            type,           // 'transfer', 'withdrawal', 'contract_call'
            value,          // USD value
            to,             // Destination
            data,           // Additional data
            requestor       // Who initiated
        } = operation;

        const requiredApprovals = this.getRequiredApprovals(value);
        const timelock = this.getTimelock(value);

        const request = {
            id: this.generateRequestId(),
            type,
            value,
            to,
            data,
            requestor,
            requiredApprovals,
            approvals: [],
            rejections: [],
            timelock,
            timelockEnds: timelock ? Date.now() + timelock : null,
            createdAt: Date.now(),
            expiresAt: Date.now() + 604800000, // 7 days
            status: 'pending',
            verificationCode: this.generateVerificationCode()
        };

        this.state.pendingApprovals.set(request.id, request);
        this.state.statistics.approvalsProcessed++;

        // Generate out-of-band verification
        const verification = {
            requestId: request.id,
            code: request.verificationCode,
            callback: this.generateCallbackChallenge()
        };

        return {
            request,
            verification,
            message: requiredApprovals > 1
                ? `This operation requires ${requiredApprovals} approvals and ${timelock ? this.formatDuration(timelock) + ' timelock' : 'no timelock'}`
                : 'Single approval required'
        };
    },

    /**
     * Get required number of approvals based on value
     */
    getRequiredApprovals(value) {
        if (value >= this.config.approval.criticalValue) return 4;
        if (value >= this.config.approval.highValue) return 3;
        if (value >= this.config.approval.mediumValue) return 2;
        return 1;
    },

    /**
     * Get timelock duration based on value
     */
    getTimelock(value) {
        if (value >= this.config.approval.criticalValue) return this.config.timelocks.critical;
        if (value >= this.config.approval.highValue) return this.config.timelocks.high;
        if (value >= this.config.approval.mediumValue) return this.config.timelocks.medium;
        return 0;
    },

    /**
     * Submit approval for a request
     */
    async submitApproval(requestId, approver, verificationCode) {
        const request = this.state.pendingApprovals.get(requestId);

        if (!request) {
            return { success: false, reason: 'Request not found' };
        }

        if (request.status !== 'pending') {
            return { success: false, reason: `Request already ${request.status}` };
        }

        if (Date.now() > request.expiresAt) {
            request.status = 'expired';
            return { success: false, reason: 'Request expired' };
        }

        // Verify code
        if (verificationCode !== request.verificationCode) {
            this.state.statistics.phishingBlocked++;
            this.triggerAlert('VERIFICATION_FAILED', {
                severity: 'HIGH',
                requestId,
                approver,
                message: 'Incorrect verification code - possible social engineering attempt'
            });
            return { success: false, reason: 'Verification failed' };
        }

        // Check if already approved by this address
        if (request.approvals.includes(approver)) {
            return { success: false, reason: 'Already approved by this address' };
        }

        // Add approval
        request.approvals.push(approver);

        // Check if enough approvals
        if (request.approvals.length >= request.requiredApprovals) {
            // Check timelock
            if (request.timelockEnds && Date.now() < request.timelockEnds) {
                return {
                    success: true,
                    status: 'approved_timelocked',
                    message: `Approved but timelocked until ${new Date(request.timelockEnds).toISOString()}`,
                    executesAt: request.timelockEnds
                };
            }

            request.status = 'approved';
            return {
                success: true,
                status: 'approved',
                message: 'All approvals received - ready to execute'
            };
        }

        return {
            success: true,
            status: 'pending',
            message: `${request.approvals.length}/${request.requiredApprovals} approvals received`,
            remaining: request.requiredApprovals - request.approvals.length
        };
    },

    /**
     * Reject a request
     */
    rejectRequest(requestId, rejector, reason) {
        const request = this.state.pendingApprovals.get(requestId);

        if (!request) {
            return { success: false, reason: 'Request not found' };
        }

        request.rejections.push({ rejector, reason, timestamp: Date.now() });

        // One rejection cancels the request
        request.status = 'rejected';

        this.triggerAlert('REQUEST_REJECTED', {
            severity: 'INFO',
            requestId,
            rejector,
            reason
        });

        return { success: true, status: 'rejected' };
    },

    // ============================================
    // SOCIAL RECOVERY (SOCIAL-003)
    // ============================================

    /**
     * Set up guardians for social recovery
     */
    setupGuardians(walletAddress, guardians) {
        if (guardians.length < this.config.socialRecovery.minGuardians) {
            return {
                success: false,
                reason: `Minimum ${this.config.socialRecovery.minGuardians} guardians required`
            };
        }

        if (guardians.length > this.config.socialRecovery.maxGuardians) {
            return {
                success: false,
                reason: `Maximum ${this.config.socialRecovery.maxGuardians} guardians allowed`
            };
        }

        // Validate guardians are diverse
        const diversityCheck = this.checkGuardianDiversity(guardians);
        if (!diversityCheck.valid) {
            return {
                success: false,
                reason: diversityCheck.reason
            };
        }

        // Store guardians with metadata
        this.state.guardians.set(walletAddress.toLowerCase(), {
            guardians: guardians.map(g => ({
                address: g.address.toLowerCase(),
                type: g.type, // 'hardware', 'institutional', 'individual'
                addedAt: Date.now()
            })),
            requiredForRecovery: Math.max(
                this.config.socialRecovery.requiredForRecovery,
                Math.ceil(guardians.length / 2) + 1
            ),
            setupAt: Date.now()
        });

        return {
            success: true,
            requiredForRecovery: this.state.guardians.get(walletAddress.toLowerCase()).requiredForRecovery,
            message: 'Guardians configured successfully'
        };
    },

    /**
     * Check guardian diversity (prevent collusion risk)
     */
    checkGuardianDiversity(guardians) {
        const types = new Set(guardians.map(g => g.type));

        // Should have at least 2 different types
        if (types.size < 2) {
            return {
                valid: false,
                reason: 'Guardians should be diverse (mix of hardware, institutional, individual)'
            };
        }

        // Check for duplicate addresses
        const addresses = guardians.map(g => g.address.toLowerCase());
        if (new Set(addresses).size !== addresses.length) {
            return {
                valid: false,
                reason: 'Duplicate guardian addresses detected'
            };
        }

        return { valid: true };
    },

    /**
     * Initiate wallet recovery
     */
    async initiateRecovery(walletAddress, newOwner, initiator) {
        const guardianConfig = this.state.guardians.get(walletAddress.toLowerCase());

        if (!guardianConfig) {
            return { success: false, reason: 'No guardians configured for this wallet' };
        }

        // Check if initiator is a guardian
        const isGuardian = guardianConfig.guardians.some(
            g => g.address === initiator.toLowerCase()
        );

        if (!isGuardian) {
            this.triggerAlert('UNAUTHORIZED_RECOVERY', {
                severity: 'CRITICAL',
                walletAddress,
                initiator,
                message: 'Unauthorized wallet recovery attempt'
            });
            return { success: false, reason: 'Not a guardian' };
        }

        // Create recovery request
        const recovery = {
            id: this.generateRequestId(),
            walletAddress: walletAddress.toLowerCase(),
            newOwner: newOwner.toLowerCase(),
            initiator: initiator.toLowerCase(),
            approvals: [initiator.toLowerCase()],
            requiredApprovals: guardianConfig.requiredForRecovery,
            createdAt: Date.now(),
            delayEnds: Date.now() + this.config.socialRecovery.recoveryDelay,
            status: 'pending'
        };

        this.state.recoveryRequests.push(recovery);
        this.state.statistics.recoveryAttempts++;

        // Alert all guardians
        this.triggerAlert('RECOVERY_INITIATED', {
            severity: 'HIGH',
            recovery,
            message: `Wallet recovery initiated for ${walletAddress}. ${guardianConfig.requiredForRecovery} guardian approvals required.`
        });

        return {
            success: true,
            recoveryId: recovery.id,
            requiredApprovals: recovery.requiredApprovals,
            delayEnds: recovery.delayEnds,
            message: `Recovery initiated. ${recovery.requiredApprovals - 1} more guardian approvals needed. Executes after ${this.formatDuration(this.config.socialRecovery.recoveryDelay)} delay.`
        };
    },

    /**
     * Approve wallet recovery (by guardian)
     */
    approveRecovery(recoveryId, guardian) {
        const recovery = this.state.recoveryRequests.find(r => r.id === recoveryId);

        if (!recovery) {
            return { success: false, reason: 'Recovery request not found' };
        }

        if (recovery.status !== 'pending') {
            return { success: false, reason: `Recovery already ${recovery.status}` };
        }

        const guardianConfig = this.state.guardians.get(recovery.walletAddress);
        const isGuardian = guardianConfig.guardians.some(
            g => g.address === guardian.toLowerCase()
        );

        if (!isGuardian) {
            return { success: false, reason: 'Not a guardian for this wallet' };
        }

        if (recovery.approvals.includes(guardian.toLowerCase())) {
            return { success: false, reason: 'Already approved' };
        }

        recovery.approvals.push(guardian.toLowerCase());

        if (recovery.approvals.length >= recovery.requiredApprovals) {
            // Check delay
            if (Date.now() < recovery.delayEnds) {
                return {
                    success: true,
                    status: 'approved_delayed',
                    message: `All approvals received. Executes at ${new Date(recovery.delayEnds).toISOString()}`
                };
            }

            recovery.status = 'approved';
            return {
                success: true,
                status: 'approved',
                message: 'Recovery approved and ready to execute'
            };
        }

        return {
            success: true,
            status: 'pending',
            message: `${recovery.approvals.length}/${recovery.requiredApprovals} approvals`,
            remaining: recovery.requiredApprovals - recovery.approvals.length
        };
    },

    /**
     * Cancel recovery (by any guardian during delay)
     */
    cancelRecovery(recoveryId, guardian) {
        const recovery = this.state.recoveryRequests.find(r => r.id === recoveryId);

        if (!recovery || recovery.status !== 'pending') {
            return { success: false, reason: 'Invalid recovery request' };
        }

        const guardianConfig = this.state.guardians.get(recovery.walletAddress);
        const isGuardian = guardianConfig.guardians.some(
            g => g.address === guardian.toLowerCase()
        );

        if (!isGuardian) {
            return { success: false, reason: 'Not a guardian' };
        }

        recovery.status = 'cancelled';
        recovery.cancelledBy = guardian.toLowerCase();

        this.triggerAlert('RECOVERY_CANCELLED', {
            severity: 'INFO',
            recoveryId,
            cancelledBy: guardian
        });

        return { success: true, message: 'Recovery cancelled' };
    },

    // ============================================
    // ANTI-PHISHING VERIFICATION
    // ============================================

    /**
     * Generate verification code for out-of-band confirmation
     */
    generateVerificationCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    /**
     * Generate callback challenge
     */
    generateCallbackChallenge() {
        // Generate a unique phrase for verbal confirmation
        const words = [
            'alpha', 'bravo', 'charlie', 'delta', 'echo',
            'foxtrot', 'golf', 'hotel', 'india', 'juliet'
        ];

        const phrase = [
            words[Math.floor(Math.random() * words.length)],
            Math.floor(Math.random() * 100),
            words[Math.floor(Math.random() * words.length)]
        ].join('-');

        return {
            phrase,
            instruction: 'For verification, the authorized person must confirm this code via a separate channel'
        };
    },

    /**
     * Verify operation isn't a deepfake/social engineering attempt
     */
    async verifyOperationAuthenticity(operation, context) {
        const warnings = [];

        // Check if operation matches user's normal patterns
        if (typeof window !== 'undefined' && window.AnomalyDetector) {
            const anomalyCheck = await window.AnomalyDetector.analyzeTransaction({
                from: context.sender,
                to: operation.to,
                value: operation.value,
                timestamp: Date.now()
            });

            if (anomalyCheck.isAnomaly) {
                warnings.push({
                    type: 'ANOMALY_DETECTED',
                    severity: anomalyCheck.severity,
                    message: anomalyCheck.recommendation
                });
            }
        }

        // Check timing (unusual hours)
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 6) {
            warnings.push({
                type: 'UNUSUAL_HOUR',
                severity: 'MEDIUM',
                message: 'Operation requested during unusual hours - verify authenticity'
            });
        }

        // Check if destination is new
        if (context.isNewDestination) {
            warnings.push({
                type: 'NEW_DESTINATION',
                severity: 'MEDIUM',
                message: 'First transaction to this address - verify recipient'
            });
        }

        return {
            requiresExtraVerification: warnings.some(w => w.severity === 'HIGH' || w.severity === 'CRITICAL'),
            warnings
        };
    },

    // ============================================
    // UTILITIES
    // ============================================

    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    formatDuration(ms) {
        if (ms >= 86400000) return `${Math.floor(ms / 86400000)} days`;
        if (ms >= 3600000) return `${Math.floor(ms / 3600000)} hours`;
        return `${Math.floor(ms / 60000)} minutes`;
    },

    cleanExpired() {
        const now = Date.now();

        // Clean expired approval requests
        for (const [id, request] of this.state.pendingApprovals) {
            if (now > request.expiresAt) {
                request.status = 'expired';
            }
        }

        // Clean old recovery requests
        this.state.recoveryRequests = this.state.recoveryRequests.filter(
            r => r.status === 'pending' || now - r.createdAt < 604800000
        );
    },

    triggerAlert(type, data) {
        const alert = {
            type,
            timestamp: Date.now(),
            ...data
        };

        console.log(`[SocialSecurity] ${data.severity === 'CRITICAL' ? '🚨' : '⚠️'} ${type}:`, data.message);
        this.state.alerts.unshift(alert);

        if (this.state.alerts.length > 100) {
            this.state.alerts.pop();
        }

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('obelisk-social-alert', { detail: alert }));
        }
    },

    /**
     * Get security status
     */
    getStatus() {
        return {
            pendingApprovals: this.state.pendingApprovals.size,
            configuredWallets: this.state.guardians.size,
            pendingRecoveries: this.state.recoveryRequests.filter(r => r.status === 'pending').length,
            recentAlerts: this.state.alerts.slice(0, 10),
            statistics: this.state.statistics
        };
    }
};

// Export
if (typeof module !== 'undefined') {
    module.exports = SocialSecurity;
}

if (typeof window !== 'undefined') {
    window.SocialSecurity = SocialSecurity;
}
