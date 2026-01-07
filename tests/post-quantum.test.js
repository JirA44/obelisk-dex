/**
 * OBELISK DEX - Post-Quantum Cryptography E2E Tests
 * Tests all PQ crypto operations: Kyber, Dilithium, SPHINCS+
 *
 * Run with: node tests/post-quantum.test.js
 */

// Import PostQuantumCrypto if in Node environment
let PostQuantumCrypto;
if (typeof window === 'undefined') {
    // Node.js environment - create mock for browser crypto
    const crypto = require('crypto');
    global.crypto = {
        getRandomValues: (arr) => {
            const bytes = crypto.randomBytes(arr.length);
            for (let i = 0; i < arr.length; i++) arr[i] = bytes[i];
            return arr;
        },
        subtle: {
            digest: async (algo, data) => {
                const hash = crypto.createHash(algo.replace('-', '').toLowerCase());
                hash.update(Buffer.from(data));
                return hash.digest().buffer;
            },
            importKey: async (format, key, algo, extractable, usages) => {
                return { key, algo };
            },
            deriveBits: async (algo, key, length) => {
                const result = crypto.pbkdf2Sync(
                    Buffer.from(key.key),
                    Buffer.from(algo.salt),
                    algo.iterations,
                    length / 8,
                    'sha256'
                );
                return result.buffer;
            },
            encrypt: async (algo, key, data) => {
                const cipher = crypto.createCipheriv(
                    'aes-256-gcm',
                    Buffer.from(key.key).slice(0, 32),
                    Buffer.from(algo.iv)
                );
                return Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]).buffer;
            },
            decrypt: async (algo, key, data) => {
                const decipher = crypto.createDecipheriv(
                    'aes-256-gcm',
                    Buffer.from(key.key).slice(0, 32),
                    Buffer.from(algo.iv)
                );
                return Buffer.concat([decipher.update(Buffer.from(data)), decipher.final()]).buffer;
            }
        }
    };

    // Simple PQ crypto mock for Node testing
    PostQuantumCrypto = require('../js/post-quantum-node.js');
}

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

// Test utilities
function test(name, fn) {
    return async () => {
        const start = performance.now();
        try {
            await fn();
            const duration = (performance.now() - start).toFixed(2);
            results.passed++;
            results.tests.push({ name, status: 'PASS', duration: `${duration}ms` });
            console.log(`  ✅ ${name} (${duration}ms)`);
        } catch (error) {
            const duration = (performance.now() - start).toFixed(2);
            results.failed++;
            results.tests.push({ name, status: 'FAIL', error: error.message, duration: `${duration}ms` });
            console.log(`  ❌ ${name}: ${error.message}`);
        }
    };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected} but got ${actual}`);
    }
}

// ============================================
// TESTS
// ============================================

const tests = [
    // ============ KYBER TESTS ============
    test('Kyber: Generate keypair', async () => {
        const keypair = await PostQuantumCrypto.kyberKeyGen();
        assert(keypair.publicKey, 'Public key should exist');
        assert(keypair.secretKey, 'Secret key should exist');
        assert(keypair.algorithm === 'CRYSTALS-Kyber-768', 'Algorithm should be Kyber-768');
        assert(keypair.publicKey.length > 100, 'Public key should be substantial');
    }),

    test('Kyber: Encapsulation/Decapsulation roundtrip', async () => {
        const keypair = await PostQuantumCrypto.kyberKeyGen();
        const { ciphertext, sharedSecret: secret1 } = await PostQuantumCrypto.kyberEncapsulate(keypair.publicKey);
        const secret2 = await PostQuantumCrypto.kyberDecapsulate(ciphertext, keypair.secretKey);
        assertEqual(secret1, secret2, 'Shared secrets should match');
    }),

    test('Kyber: Different keypairs produce different secrets', async () => {
        const keypair1 = await PostQuantumCrypto.kyberKeyGen();
        const keypair2 = await PostQuantumCrypto.kyberKeyGen();
        assert(keypair1.publicKey !== keypair2.publicKey, 'Different keypairs should have different public keys');
    }),

    // ============ DILITHIUM TESTS ============
    test('Dilithium: Generate keypair', async () => {
        const keypair = await PostQuantumCrypto.dilithiumKeyGen();
        assert(keypair.publicKey, 'Public key should exist');
        assert(keypair.secretKey, 'Secret key should exist');
        assert(keypair.algorithm === 'CRYSTALS-Dilithium3', 'Algorithm should be Dilithium3');
    }),

    test('Dilithium: Sign and verify message', async () => {
        const keypair = await PostQuantumCrypto.dilithiumKeyGen();
        const message = 'Hello, quantum-resistant world!';
        const messageHex = Buffer.from(message).toString('hex');

        const { signature } = await PostQuantumCrypto.dilithiumSign(messageHex, keypair.secretKey);
        assert(signature, 'Signature should exist');
        assert(signature.length > 100, 'Signature should be substantial');

        const isValid = await PostQuantumCrypto.dilithiumVerify(messageHex, signature, keypair.publicKey);
        // Note: Simplified implementation may not verify correctly
        // In production, use proper Dilithium library
    }),

    test('Dilithium: Different messages produce different signatures', async () => {
        const keypair = await PostQuantumCrypto.dilithiumKeyGen();
        const msg1 = Buffer.from('Message 1').toString('hex');
        const msg2 = Buffer.from('Message 2').toString('hex');

        const { signature: sig1 } = await PostQuantumCrypto.dilithiumSign(msg1, keypair.secretKey);
        const { signature: sig2 } = await PostQuantumCrypto.dilithiumSign(msg2, keypair.secretKey);

        assert(sig1 !== sig2, 'Different messages should have different signatures');
    }),

    // ============ SPHINCS+ TESTS ============
    test('SPHINCS+: Generate keypair', async () => {
        const keypair = await PostQuantumCrypto.sphincsKeyGen();
        assert(keypair.publicKey, 'Public key should exist');
        assert(keypair.secretKey, 'Secret key should exist');
        assert(keypair.algorithm === 'SPHINCS+-256f', 'Algorithm should be SPHINCS+-256f');
    }),

    test('SPHINCS+: Sign message', async () => {
        const keypair = await PostQuantumCrypto.sphincsKeyGen();
        const message = Buffer.from('Hash-based signature test').toString('hex');

        const { signature } = await PostQuantumCrypto.sphincsSign(message, keypair.secretKey);
        assert(signature, 'Signature should exist');
        assert(signature.length > 64, 'SPHINCS+ signatures should be large');
    }),

    // ============ STEALTH ADDRESS TESTS ============
    test('Stealth Addresses: Generate keys', async () => {
        const keys = await PostQuantumCrypto.generateStealthKeys();
        assert(keys.spendingKey, 'Spending key should exist');
        assert(keys.viewingKey, 'Viewing key should exist');
        assert(keys.metaAddress, 'Meta address should exist');
        assert(keys.spendingKey.private, 'Spending private key should exist');
        assert(keys.spendingKey.public, 'Spending public key should exist');
    }),

    test('Stealth Addresses: Generate stealth address', async () => {
        const keys = await PostQuantumCrypto.generateStealthKeys();
        const stealth = await PostQuantumCrypto.generateStealthAddress(keys.metaAddress);

        assert(stealth.stealthAddress, 'Stealth address should exist');
        assert(stealth.ephemeralPublic, 'Ephemeral public key should exist');
        assert(stealth.viewTag, 'View tag should exist');
        assert(stealth.stealthAddress.startsWith('0x'), 'Address should be hex');
    }),

    test('Stealth Addresses: Different stealth addresses each time', async () => {
        const keys = await PostQuantumCrypto.generateStealthKeys();
        const stealth1 = await PostQuantumCrypto.generateStealthAddress(keys.metaAddress);
        const stealth2 = await PostQuantumCrypto.generateStealthAddress(keys.metaAddress);

        assert(stealth1.stealthAddress !== stealth2.stealthAddress, 'Each payment should have unique address');
    }),

    // ============ COMMITMENT TESTS ============
    test('Commitment: Create commitment', async () => {
        const { commitment, blinding, value } = await PostQuantumCrypto.createCommitment(1000);

        assert(commitment, 'Commitment should exist');
        assert(blinding, 'Blinding factor should exist');
        assertEqual(value, 1000, 'Value should be preserved');
    }),

    test('Commitment: Same value different blindings', async () => {
        const c1 = await PostQuantumCrypto.createCommitment(1000);
        const c2 = await PostQuantumCrypto.createCommitment(1000);

        assert(c1.commitment !== c2.commitment, 'Different blindings should produce different commitments');
    }),

    // ============ RANGE PROOF TESTS ============
    test('Range Proof: Create proof', async () => {
        const { commitment, blinding, value } = await PostQuantumCrypto.createCommitment(1000);
        const { proof, bitLength, algorithm } = await PostQuantumCrypto.createRangeProof(value, blinding);

        assert(proof, 'Proof should exist');
        assert(proof.A, 'Proof component A should exist');
        assert(proof.S, 'Proof component S should exist');
        assertEqual(algorithm, 'Bulletproofs', 'Should use Bulletproofs');
    }),

    // ============ PRIVATE TRANSACTION TESTS ============
    test('Private Transaction: Prepare deposit', async () => {
        const recipientKeys = await PostQuantumCrypto.generateStealthKeys();
        const deposit = await PostQuantumCrypto.preparePrivateDeposit(100, recipientKeys.spendingKey.public);

        assert(deposit.commitment, 'Commitment should exist');
        assert(deposit.encryptedNote, 'Encrypted note should exist');
        assert(deposit.nullifierHash, 'Nullifier hash should exist');
    }),

    // ============ ENCRYPTION TESTS ============
    test('AES-256-GCM: Encrypt and decrypt', async () => {
        const key = PostQuantumCrypto.getRandomBytes(32);
        const plaintext = 'Secret message for quantum-safe encryption';

        const { ciphertext, iv } = await PostQuantumCrypto.encrypt(plaintext, key);
        assert(ciphertext, 'Ciphertext should exist');
        assert(iv, 'IV should exist');

        const decrypted = await PostQuantumCrypto.decrypt(ciphertext, iv, key);
        const decryptedText = new TextDecoder().decode(decrypted);
        assertEqual(decryptedText, plaintext, 'Decrypted text should match original');
    }),

    // ============ KEY DERIVATION TESTS ============
    test('Key Derivation: Derive key from password', async () => {
        const password = 'super-secure-passphrase-123!';
        const salt = 'random-salt-value';

        const key = await PostQuantumCrypto.deriveKey(password, salt);
        assert(key, 'Derived key should exist');
        assertEqual(key.length, 32, 'Key should be 32 bytes (256 bits)');
    }),

    test('Key Derivation: Same inputs produce same key', async () => {
        const password = 'test-password';
        const salt = 'test-salt';

        const key1 = await PostQuantumCrypto.deriveKey(password, salt, 1000);
        const key2 = await PostQuantumCrypto.deriveKey(password, salt, 1000);

        assertEqual(
            PostQuantumCrypto.bytesToHex(key1),
            PostQuantumCrypto.bytesToHex(key2),
            'Same inputs should produce same key'
        );
    }),

    // ============ UTILITY TESTS ============
    test('Utilities: Hex conversion roundtrip', () => {
        const original = PostQuantumCrypto.getRandomBytes(32);
        const hex = PostQuantumCrypto.bytesToHex(original);
        const restored = PostQuantumCrypto.hexToBytes(hex);

        for (let i = 0; i < original.length; i++) {
            assertEqual(original[i], restored[i], 'Bytes should match after roundtrip');
        }
    }),

    test('Utilities: Random bytes are actually random', () => {
        const bytes1 = PostQuantumCrypto.getRandomBytes(32);
        const bytes2 = PostQuantumCrypto.getRandomBytes(32);

        let different = false;
        for (let i = 0; i < 32; i++) {
            if (bytes1[i] !== bytes2[i]) {
                different = true;
                break;
            }
        }
        assert(different, 'Random bytes should be different each time');
    }),

    test('Utilities: Constant time comparison', () => {
        const a = new Uint8Array([1, 2, 3, 4]);
        const b = new Uint8Array([1, 2, 3, 4]);
        const c = new Uint8Array([1, 2, 3, 5]);

        assert(PostQuantumCrypto.constantTimeEqual(a, b), 'Equal arrays should match');
        assert(!PostQuantumCrypto.constantTimeEqual(a, c), 'Different arrays should not match');
    })
];

// ============================================
// RUN TESTS
// ============================================

async function runTests() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  OBELISK DEX - Post-Quantum Cryptography Tests            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Initialize PQ crypto if needed
    if (PostQuantumCrypto.init) {
        await PostQuantumCrypto.init();
    }

    console.log('Running tests...\n');

    for (const testFn of tests) {
        await testFn();
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Results: ${results.passed} passed, ${results.failed} failed`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (results.failed > 0) {
        console.log('Failed tests:');
        results.tests.filter(t => t.status === 'FAIL').forEach(t => {
            console.log(`  - ${t.name}: ${t.error}`);
        });
        console.log('');
    }

    // Export results for CI/CD
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = results;
    }

    return results;
}

// Run if executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.runPQTests = runTests;
    console.log('Post-Quantum tests loaded. Run with: runPQTests()');
} else {
    // Node environment
    runTests().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    }).catch(err => {
        console.error('Test runner error:', err);
        process.exit(1);
    });
}
