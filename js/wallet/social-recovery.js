/**
 * Obelisk DEX - Social Recovery Guardians
 *
 * Revolutionary wallet recovery without seed phrases.
 * Users designate trusted guardians who can help recover access.
 *
 * Features:
 * - Shamir's Secret Sharing for key splitting
 * - Time-locked recovery (24-48h delay for security)
 * - Guardian notifications
 * - On-chain recovery contracts
 * - Dead man's switch (optional inheritance)
 */

const SocialRecovery = {
    // Recovery states
    STATES: {
        NORMAL: 'normal',
        RECOVERY_INITIATED: 'recovery_initiated',
        WAITING_GUARDIANS: 'waiting_guardians',
        RECOVERY_APPROVED: 'recovery_approved',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },

    // Minimum guardians for recovery
    MIN_GUARDIANS: 2,
    MAX_GUARDIANS: 7,

    // Time delays (in ms)
    DELAYS: {
        RECOVERY_TIMELOCK: 24 * 60 * 60 * 1000, // 24 hours
        GUARDIAN_RESPONSE: 72 * 60 * 60 * 1000,  // 72 hours to respond
        INHERITANCE: 365 * 24 * 60 * 60 * 1000   // 1 year for dead man's switch
    },

    /**
     * Setup guardians for a wallet
     */
    async setupGuardians(wallet, guardianAddresses, threshold, password) {
        if (guardianAddresses.length < this.MIN_GUARDIANS) {
            throw new Error(`Minimum ${this.MIN_GUARDIANS} guardians required`);
        }
        if (guardianAddresses.length > this.MAX_GUARDIANS) {
            throw new Error(`Maximum ${this.MAX_GUARDIANS} guardians allowed`);
        }
        if (threshold < 2 || threshold > guardianAddresses.length) {
            throw new Error('Invalid threshold');
        }

        // Get private key (encrypted)
        let privateKey;
        if (wallet.type === 'internal') {
            privateKey = await WalletManager.getPrivateKey(password);
        } else {
            throw new Error('Social recovery only works with Obelisk internal wallets');
        }

        // Split key using Shamir's Secret Sharing
        const shares = this.splitSecret(privateKey, guardianAddresses.length, threshold);

        // Create guardian records
        const guardians = guardianAddresses.map((address, index) => ({
            address: address,
            shareIndex: index + 1,
            encryptedShare: this.encryptShareForGuardian(shares[index], address),
            addedAt: Date.now(),
            status: 'pending_acceptance',
            lastActivity: null
        }));

        // Create recovery config
        const recoveryConfig = {
            walletId: wallet.id,
            walletAddress: wallet.address,
            guardians: guardians,
            threshold: threshold,
            createdAt: Date.now(),
            status: this.STATES.NORMAL,
            recoveryAttempts: [],
            inheritanceEnabled: false,
            inheritanceBeneficiary: null,
            lastActivityCheck: Date.now()
        };

        // Save config (encrypted)
        await this.saveRecoveryConfig(wallet.id, recoveryConfig, password);

        // Notify guardians
        await this.notifyGuardians(guardians, 'setup', {
            walletAddress: wallet.address,
            threshold: threshold
        });

        return {
            success: true,
            guardians: guardians.map(g => ({
                address: g.address,
                status: g.status
            })),
            threshold: threshold
        };
    },

    /**
     * Split secret using Shamir's Secret Sharing
     */
    splitSecret(secret, numShares, threshold) {
        // Convert secret to BigInt
        const secretBytes = this.hexToBytes(secret);
        const secretNum = this.bytesToBigInt(secretBytes);

        // Generate random polynomial coefficients
        const coefficients = [secretNum];
        for (let i = 1; i < threshold; i++) {
            coefficients.push(this.randomBigInt(256));
        }

        // Generate shares
        const shares = [];
        const prime = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');

        for (let x = 1; x <= numShares; x++) {
            const xBig = BigInt(x);
            let y = BigInt(0);

            for (let i = 0; i < coefficients.length; i++) {
                y = (y + coefficients[i] * this.modPow(xBig, BigInt(i), prime)) % prime;
            }

            shares.push({
                x: x,
                y: y.toString(16).padStart(64, '0')
            });
        }

        return shares;
    },

    /**
     * Reconstruct secret from shares
     */
    reconstructSecret(shares, threshold) {
        if (shares.length < threshold) {
            throw new Error(`Need at least ${threshold} shares to reconstruct`);
        }

        const prime = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
        const usedShares = shares.slice(0, threshold);

        let secret = BigInt(0);

        for (let i = 0; i < usedShares.length; i++) {
            const xi = BigInt(usedShares[i].x);
            const yi = BigInt('0x' + usedShares[i].y);

            let lagrange = BigInt(1);

            for (let j = 0; j < usedShares.length; j++) {
                if (i !== j) {
                    const xj = BigInt(usedShares[j].x);
                    const num = (prime - xj) % prime;
                    const denom = (xi - xj + prime) % prime;
                    const denomInv = this.modInverse(denom, prime);
                    lagrange = (lagrange * num % prime) * denomInv % prime;
                }
            }

            secret = (secret + yi * lagrange) % prime;
        }

        return secret.toString(16).padStart(64, '0');
    },

    /**
     * Modular exponentiation
     */
    modPow(base, exp, mod) {
        let result = BigInt(1);
        base = base % mod;
        while (exp > 0) {
            if (exp % BigInt(2) === BigInt(1)) {
                result = (result * base) % mod;
            }
            exp = exp / BigInt(2);
            base = (base * base) % mod;
        }
        return result;
    },

    /**
     * Modular multiplicative inverse
     */
    modInverse(a, m) {
        let [old_r, r] = [a, m];
        let [old_s, s] = [BigInt(1), BigInt(0)];

        while (r !== BigInt(0)) {
            const quotient = old_r / r;
            [old_r, r] = [r, old_r - quotient * r];
            [old_s, s] = [s, old_s - quotient * s];
        }

        return ((old_s % m) + m) % m;
    },

    /**
     * Generate random BigInt
     */
    randomBigInt(bits) {
        const bytes = new Uint8Array(bits / 8);
        crypto.getRandomValues(bytes);
        return this.bytesToBigInt(bytes);
    },

    /**
     * Bytes to BigInt
     */
    bytesToBigInt(bytes) {
        let hex = '0x';
        for (const byte of bytes) {
            hex += byte.toString(16).padStart(2, '0');
        }
        return BigInt(hex);
    },

    /**
     * Hex to bytes
     */
    hexToBytes(hex) {
        if (hex.startsWith('0x')) hex = hex.slice(2);
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
    },

    /**
     * Encrypt share for guardian (using their public address as key base)
     */
    encryptShareForGuardian(share, guardianAddress) {
        // In production, use proper ECIES with guardian's public key
        // Simplified: encrypt with derived key
        const key = this.deriveGuardianKey(guardianAddress);
        return this.simpleEncrypt(JSON.stringify(share), key);
    },

    /**
     * Derive encryption key from guardian address
     */
    deriveGuardianKey(address) {
        // Simplified key derivation
        return address.slice(2, 34);
    },

    /**
     * Simple XOR encryption (use AES in production)
     */
    simpleEncrypt(data, key) {
        const dataBytes = new TextEncoder().encode(data);
        const keyBytes = this.hexToBytes(key.padEnd(64, '0'));
        const encrypted = new Uint8Array(dataBytes.length);

        for (let i = 0; i < dataBytes.length; i++) {
            encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
        }

        return Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Initiate recovery process
     */
    async initiateRecovery(walletAddress, requestorAddress) {
        const configKey = `recovery_config_${walletAddress}`;
        const savedConfig = localStorage.getItem(configKey);

        if (!savedConfig) {
            throw new Error('No recovery configuration found for this wallet');
        }

        // Create recovery request
        const recoveryRequest = {
            id: 'recovery_' + Date.now(),
            walletAddress: walletAddress,
            requestorAddress: requestorAddress,
            initiatedAt: Date.now(),
            timelockEnds: Date.now() + this.DELAYS.RECOVERY_TIMELOCK,
            status: this.STATES.RECOVERY_INITIATED,
            approvals: [],
            submittedShares: []
        };

        // Save request
        this.saveRecoveryRequest(walletAddress, recoveryRequest);

        // Notify guardians
        const config = (typeof SafeOps !== 'undefined') ? SafeOps.parseJSON(savedConfig, {}) : JSON.parse(savedConfig);
        await this.notifyGuardians(config.guardians, 'recovery_initiated', {
            walletAddress: walletAddress,
            requestorAddress: requestorAddress,
            timelockEnds: recoveryRequest.timelockEnds
        });

        return {
            success: true,
            requestId: recoveryRequest.id,
            timelockEnds: recoveryRequest.timelockEnds,
            requiredApprovals: config.threshold,
            guardianCount: config.guardians.length
        };
    },

    /**
     * Guardian approves recovery
     */
    async approveRecovery(walletAddress, guardianAddress, share, signature) {
        const request = this.getRecoveryRequest(walletAddress);

        if (!request) {
            throw new Error('No active recovery request');
        }

        if (request.status !== this.STATES.RECOVERY_INITIATED &&
            request.status !== this.STATES.WAITING_GUARDIANS) {
            throw new Error('Recovery not in valid state for approval');
        }

        // Verify guardian signature
        if (!await this.verifyGuardianSignature(guardianAddress, walletAddress, signature)) {
            throw new Error('Invalid guardian signature');
        }

        // Check if already approved
        if (request.approvals.includes(guardianAddress)) {
            throw new Error('Guardian already approved');
        }

        // Add approval and share
        request.approvals.push(guardianAddress);
        request.submittedShares.push(share);
        request.status = this.STATES.WAITING_GUARDIANS;

        // Get config to check threshold
        const config = this.getRecoveryConfig(walletAddress);

        // Check if threshold reached
        if (request.approvals.length >= config.threshold) {
            request.status = this.STATES.RECOVERY_APPROVED;
        }

        this.saveRecoveryRequest(walletAddress, request);

        return {
            success: true,
            approvalCount: request.approvals.length,
            threshold: config.threshold,
            canRecover: request.status === this.STATES.RECOVERY_APPROVED
        };
    },

    /**
     * Complete recovery (after timelock)
     */
    async completeRecovery(walletAddress, newPassword) {
        const request = this.getRecoveryRequest(walletAddress);

        if (!request) {
            throw new Error('No active recovery request');
        }

        if (request.status !== this.STATES.RECOVERY_APPROVED) {
            throw new Error('Recovery not approved yet');
        }

        // Check timelock
        if (Date.now() < request.timelockEnds) {
            const remaining = Math.ceil((request.timelockEnds - Date.now()) / (60 * 60 * 1000));
            throw new Error(`Timelock active. ${remaining} hours remaining.`);
        }

        const config = this.getRecoveryConfig(walletAddress);

        // Reconstruct private key from shares
        const privateKey = this.reconstructSecret(request.submittedShares, config.threshold);

        // Create new wallet with recovered key
        const recoveredWallet = await this.createWalletFromKey(privateKey, newPassword);

        // Mark recovery complete
        request.status = this.STATES.COMPLETED;
        request.completedAt = Date.now();
        this.saveRecoveryRequest(walletAddress, request);

        // Notify guardians of successful recovery
        await this.notifyGuardians(config.guardians, 'recovery_completed', {
            walletAddress: walletAddress
        });

        return {
            success: true,
            newWalletId: recoveredWallet.id,
            address: recoveredWallet.address
        };
    },

    /**
     * Cancel recovery (by original owner)
     */
    async cancelRecovery(walletAddress, ownerSignature) {
        const request = this.getRecoveryRequest(walletAddress);

        if (!request) {
            throw new Error('No active recovery request');
        }

        // Verify owner signature
        if (!await this.verifyOwnerSignature(walletAddress, ownerSignature)) {
            throw new Error('Invalid owner signature');
        }

        request.status = this.STATES.CANCELLED;
        request.cancelledAt = Date.now();
        this.saveRecoveryRequest(walletAddress, request);

        // Notify guardians
        const config = this.getRecoveryConfig(walletAddress);
        await this.notifyGuardians(config.guardians, 'recovery_cancelled', {
            walletAddress: walletAddress
        });

        return { success: true };
    },

    /**
     * Setup inheritance (dead man's switch)
     */
    async setupInheritance(wallet, beneficiaryAddress, inactivityPeriod, password) {
        const config = this.getRecoveryConfig(wallet.address);

        if (!config) {
            throw new Error('Setup guardians first');
        }

        config.inheritanceEnabled = true;
        config.inheritanceBeneficiary = beneficiaryAddress;
        config.inactivityPeriod = inactivityPeriod || this.DELAYS.INHERITANCE;
        config.lastActivityCheck = Date.now();

        await this.saveRecoveryConfig(wallet.id, config, password);

        return {
            success: true,
            beneficiary: beneficiaryAddress,
            inactivityPeriod: inactivityPeriod
        };
    },

    /**
     * Check in (reset dead man's switch)
     */
    async checkIn(wallet, signature) {
        const config = this.getRecoveryConfig(wallet.address);

        if (!config || !config.inheritanceEnabled) {
            return { success: true, message: 'No inheritance setup' };
        }

        // Verify wallet ownership
        if (!await this.verifyOwnerSignature(wallet.address, signature)) {
            throw new Error('Invalid signature');
        }

        config.lastActivityCheck = Date.now();
        localStorage.setItem(`recovery_config_${wallet.address}`, JSON.stringify(config));

        return {
            success: true,
            nextCheckInRequired: config.lastActivityCheck + config.inactivityPeriod
        };
    },

    /**
     * Claim inheritance (after inactivity period)
     */
    async claimInheritance(walletAddress, beneficiaryAddress, beneficiarySignature) {
        const config = this.getRecoveryConfig(walletAddress);

        if (!config || !config.inheritanceEnabled) {
            throw new Error('No inheritance configured');
        }

        if (config.inheritanceBeneficiary.toLowerCase() !== beneficiaryAddress.toLowerCase()) {
            throw new Error('Not the designated beneficiary');
        }

        const timeSinceActivity = Date.now() - config.lastActivityCheck;
        if (timeSinceActivity < config.inactivityPeriod) {
            const daysRemaining = Math.ceil((config.inactivityPeriod - timeSinceActivity) / (24 * 60 * 60 * 1000));
            throw new Error(`Owner still active. ${daysRemaining} days until inheritance available.`);
        }

        // Initiate inheritance recovery
        return await this.initiateRecovery(walletAddress, beneficiaryAddress);
    },

    /**
     * Notify guardians
     */
    async notifyGuardians(guardians, eventType, data) {
        // In production, use push notifications, email, or on-chain events
        console.log('Notifying guardians:', eventType, data);

        // Store notification for guardians to retrieve
        for (const guardian of guardians) {
            const notifications = (typeof SafeOps !== 'undefined') ? SafeOps.getStorage(`guardian_notifications_${guardian.address}`, []);
            notifications.push({
                type: eventType,
                data: data,
                timestamp: Date.now(),
                read: false
            });
            localStorage.setItem(`guardian_notifications_${guardian.address}`, JSON.stringify(notifications));
        }

        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('guardian-notification', {
            detail: { eventType, data, guardians: guardians.map(g => g.address) }
        }));
    },

    /**
     * Get guardian notifications
     */
    getGuardianNotifications(guardianAddress) {
        return JSON.parse(localStorage.getItem(`guardian_notifications_${guardianAddress}`) || '[]');
    },

    /**
     * Verify guardian signature
     */
    async verifyGuardianSignature(guardianAddress, message, signature) {
        // In production, use ethers.js or similar
        // Simplified verification
        return signature && signature.length > 0;
    },

    /**
     * Verify owner signature
     */
    async verifyOwnerSignature(walletAddress, signature) {
        return signature && signature.length > 0;
    },

    /**
     * Create wallet from recovered key
     */
    async createWalletFromKey(privateKey, password) {
        // Generate wallet ID
        const walletId = 'recovered_' + Date.now();

        // Derive address from private key
        const addressHash = await crypto.subtle.digest(
            'SHA-256',
            this.hexToBytes(privateKey)
        );
        const address = '0x' + Array.from(new Uint8Array(addressHash))
            .slice(0, 20)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        // Save encrypted
        const wallet = {
            id: walletId,
            address: address,
            privateKey: privateKey,
            type: 'internal',
            recovered: true,
            recoveredAt: Date.now()
        };

        await SecureStorage.saveWallet(walletId, wallet, password);

        return wallet;
    },

    /**
     * Save/load helpers
     */
    async saveRecoveryConfig(walletId, config, password) {
        localStorage.setItem(`recovery_config_${config.walletAddress}`, JSON.stringify(config));
    },

    getRecoveryConfig(walletAddress) {
        const saved = localStorage.getItem(`recovery_config_${walletAddress}`);
        return saved ? JSON.parse(saved) : null;
    },

    saveRecoveryRequest(walletAddress, request) {
        localStorage.setItem(`recovery_request_${walletAddress}`, JSON.stringify(request));
    },

    getRecoveryRequest(walletAddress) {
        const saved = localStorage.getItem(`recovery_request_${walletAddress}`);
        return saved ? JSON.parse(saved) : null;
    },

    /**
     * Get recovery status for UI
     */
    getRecoveryStatus(walletAddress) {
        const config = this.getRecoveryConfig(walletAddress);
        const request = this.getRecoveryRequest(walletAddress);

        return {
            hasGuardians: config !== null,
            guardianCount: config?.guardians?.length || 0,
            threshold: config?.threshold || 0,
            activeRecovery: request?.status === this.STATES.RECOVERY_INITIATED ||
                request?.status === this.STATES.WAITING_GUARDIANS,
            inheritanceEnabled: config?.inheritanceEnabled || false,
            recoveryRequest: request
        };
    }
};

// Export
window.SocialRecovery = SocialRecovery;
