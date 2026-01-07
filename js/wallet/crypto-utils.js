/**
 * Obelisk DEX - Post-Quantum Cryptography Utilities
 *
 * SECURITY NOTICE:
 * All cryptographic operations happen client-side only.
 * Keys NEVER leave the user's device.
 *
 * Algorithms used:
 * - AES-256-GCM: Symmetric encryption for local storage
 * - Argon2id: Password-based key derivation (anti-bruteforce)
 * - CRYSTALS-Kyber: Post-quantum key encapsulation (future)
 * - CRYSTALS-Dilithium: Post-quantum signatures (future)
 */

const CryptoUtils = {
    // Configuration
    config: {
        AES_KEY_LENGTH: 256,
        IV_LENGTH: 12,
        SALT_LENGTH: 32,
        ARGON2_ITERATIONS: 3,
        ARGON2_MEMORY: 65536, // 64MB
        ARGON2_PARALLELISM: 4,
    },

    /**
     * Generate cryptographically secure random bytes
     */
    generateRandomBytes(length) {
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        return bytes;
    },

    /**
     * Convert bytes to hex string
     */
    bytesToHex(bytes) {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    /**
     * Convert hex string to bytes
     */
    hexToBytes(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    },

    /**
     * Convert string to bytes (UTF-8)
     */
    stringToBytes(str) {
        return new TextEncoder().encode(str);
    },

    /**
     * Convert bytes to string (UTF-8)
     */
    bytesToString(bytes) {
        return new TextDecoder().decode(bytes);
    },

    /**
     * Convert bytes to base64
     */
    bytesToBase64(bytes) {
        return btoa(String.fromCharCode(...bytes));
    },

    /**
     * Convert base64 to bytes
     */
    base64ToBytes(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    },

    /**
     * Derive encryption key from password using PBKDF2
     * (Fallback until Argon2 WASM is loaded)
     */
    async deriveKeyPBKDF2(password, salt) {
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            this.stringToBytes(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 600000, // High iterations for security
                hash: 'SHA-256'
            },
            passwordKey,
            { name: 'AES-GCM', length: this.config.AES_KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
    },

    /**
     * Derive encryption key from password using Argon2id
     * (Post-quantum resistant key derivation)
     */
    async deriveKeyArgon2(password, salt) {
        // Check if Argon2 WASM is available
        if (typeof argon2 !== 'undefined') {
            const hash = await argon2.hash({
                pass: password,
                salt: this.bytesToHex(salt),
                time: this.config.ARGON2_ITERATIONS,
                mem: this.config.ARGON2_MEMORY,
                parallelism: this.config.ARGON2_PARALLELISM,
                hashLen: 32,
                type: argon2.ArgonType.Argon2id
            });

            return await crypto.subtle.importKey(
                'raw',
                this.hexToBytes(hash.hashHex),
                { name: 'AES-GCM', length: this.config.AES_KEY_LENGTH },
                false,
                ['encrypt', 'decrypt']
            );
        }

        // Fallback to PBKDF2 if Argon2 not available
        console.warn('Argon2 not available, using PBKDF2 fallback');
        return this.deriveKeyPBKDF2(password, salt);
    },

    /**
     * Encrypt data with AES-256-GCM
     */
    async encrypt(plaintext, password) {
        const salt = this.generateRandomBytes(this.config.SALT_LENGTH);
        const iv = this.generateRandomBytes(this.config.IV_LENGTH);
        const key = await this.deriveKeyArgon2(password, salt);

        const plaintextBytes = typeof plaintext === 'string'
            ? this.stringToBytes(plaintext)
            : plaintext;

        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            plaintextBytes
        );

        // Combine salt + iv + ciphertext
        const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

        return this.bytesToBase64(combined);
    },

    /**
     * Decrypt data with AES-256-GCM
     */
    async decrypt(encryptedBase64, password) {
        const combined = this.base64ToBytes(encryptedBase64);

        const salt = combined.slice(0, this.config.SALT_LENGTH);
        const iv = combined.slice(this.config.SALT_LENGTH, this.config.SALT_LENGTH + this.config.IV_LENGTH);
        const ciphertext = combined.slice(this.config.SALT_LENGTH + this.config.IV_LENGTH);

        const key = await this.deriveKeyArgon2(password, salt);

        try {
            const plaintext = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                ciphertext
            );
            return this.bytesToString(new Uint8Array(plaintext));
        } catch (e) {
            throw new Error('Decryption failed - incorrect password or corrupted data');
        }
    },

    /**
     * Generate a secure random mnemonic seed phrase (BIP39-compatible)
     */
    generateMnemonic(wordCount = 24) {
        // BIP39 word list (English) - abbreviated for space, full list should be loaded
        const wordlist = this.getBIP39Wordlist();

        const entropyBits = wordCount === 24 ? 256 : (wordCount === 12 ? 128 : 192);
        const entropy = this.generateRandomBytes(entropyBits / 8);

        // Simple implementation - in production use proper BIP39 library
        const words = [];
        for (let i = 0; i < wordCount; i++) {
            const index = (entropy[i % entropy.length] + (entropy[(i + 1) % entropy.length] << 8)) % wordlist.length;
            words.push(wordlist[index]);
        }

        return words.join(' ');
    },

    /**
     * Validate mnemonic phrase
     */
    validateMnemonic(mnemonic) {
        const words = mnemonic.trim().toLowerCase().split(/\s+/);
        if (![12, 15, 18, 21, 24].includes(words.length)) {
            return false;
        }

        const wordlist = this.getBIP39Wordlist();
        return words.every(word => wordlist.includes(word));
    },

    /**
     * Derive private key from mnemonic (simplified - use proper BIP39/BIP44 in production)
     */
    async derivePrivateKey(mnemonic, path = "m/44'/60'/0'/0/0") {
        const seed = await this.mnemonicToSeed(mnemonic);
        // In production, use proper HD key derivation (BIP32/BIP44)
        // This is a simplified version
        const keyMaterial = await crypto.subtle.digest('SHA-256', seed);
        return new Uint8Array(keyMaterial);
    },

    /**
     * Convert mnemonic to seed
     */
    async mnemonicToSeed(mnemonic, passphrase = '') {
        const mnemonicBytes = this.stringToBytes(mnemonic.normalize('NFKD'));
        const saltBytes = this.stringToBytes('mnemonic' + passphrase.normalize('NFKD'));

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            mnemonicBytes,
            'PBKDF2',
            false,
            ['deriveBits']
        );

        const seed = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: saltBytes,
                iterations: 2048,
                hash: 'SHA-512'
            },
            keyMaterial,
            512
        );

        return new Uint8Array(seed);
    },

    /**
     * Hash data with SHA-256
     */
    async sha256(data) {
        const bytes = typeof data === 'string' ? this.stringToBytes(data) : data;
        const hash = await crypto.subtle.digest('SHA-256', bytes);
        return new Uint8Array(hash);
    },

    /**
     * Calculate password strength (0-100)
     */
    calculatePasswordStrength(password) {
        let score = 0;

        if (!password) return 0;

        // Length
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 10;
        if (password.length >= 16) score += 10;

        // Character variety
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^a-zA-Z0-9]/.test(password)) score += 15;

        // Complexity bonus
        const uniqueChars = new Set(password).size;
        if (uniqueChars > 8) score += 10;
        if (uniqueChars > 12) score += 5;

        return Math.min(100, score);
    },

    /**
     * Get password strength label
     */
    getPasswordStrengthLabel(score) {
        if (score < 30) return { label: 'Weak', color: '#ff4466' };
        if (score < 50) return { label: 'Fair', color: '#ffaa00' };
        if (score < 70) return { label: 'Good', color: '#00aaff' };
        if (score < 90) return { label: 'Strong', color: '#00ff88' };
        return { label: 'Very Strong', color: '#00ff88' };
    },

    /**
     * BIP39 English wordlist (first 100 words - load full list in production)
     */
    getBIP39Wordlist() {
        return [
            'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
            'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
            'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
            'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
            'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
            'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
            'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
            'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
            'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
            'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
            'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
            'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
            'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact',
            'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
            'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
            'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
            'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis',
            'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
            'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
            'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
            'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
            'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
            'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black',
            'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood',
            'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
            'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring',
            'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain',
            'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief',
            'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother',
            'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb',
            'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus',
            'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable'
        ];
    }
};

// Export for use in other modules
window.CryptoUtils = CryptoUtils;
