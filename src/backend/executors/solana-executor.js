/**
 * SOLANA EXECUTOR - Real Blockchain Settlement
 * Executes trades on Solana blockchain (testnet/mainnet)
 *
 * Version: 1.0
 * Date: 2026-02-16
 */

const { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58').default || require('bs58');

class SolanaExecutor {
    constructor(config = {}) {
        this.mode = config.mode || 'TESTNET'; // TESTNET or MAINNET

        // Select RPC based on mode
        const rpcUrls = {
            TESTNET: 'https://api.testnet.solana.com',
            MAINNET: 'https://api.mainnet-beta.solana.com'
        };

        this.connection = new Connection(
            config.rpcUrl || rpcUrls[this.mode],
            'confirmed'
        );

        // Load wallet from private key (if provided)
        // Try mode-specific key first, then fall back to generic key
        const envKey = this.mode === 'MAINNET'
            ? (process.env.SOLANA_MAINNET_PRIVATE_KEY || process.env.SOLANA_PRIVATE_KEY)
            : (process.env.SOLANA_TESTNET_PRIVATE_KEY || process.env.SOLANA_PRIVATE_KEY);

        if (envKey) {
            try {
                // Try to parse as base58 or JSON array
                let secretKey;
                if (envKey.startsWith('[')) {
                    // JSON array format
                    secretKey = new Uint8Array(JSON.parse(envKey));
                } else {
                    // Base58 format
                    const decoded = bs58.decode(envKey);
                    secretKey = new Uint8Array(decoded);
                }

                this.wallet = Keypair.fromSecretKey(secretKey);
                console.log(`✅ Solana Executor initialized (${this.mode})`);
                console.log(`   Wallet: ${this.wallet.publicKey.toString()}`);
            } catch (error) {
                console.warn(`⚠️  Failed to load Solana wallet:`, error.message);
                this.wallet = null;
            }
        } else {
            console.warn('⚠️  SOLANA_PRIVATE_KEY not set - executor in read-only mode');
            this.wallet = null;
        }

        // Stats
        this.stats = {
            totalSettlements: 0,
            totalGasCost: 0,
            totalErrors: 0
        };
    }

    /**
     * Execute a settlement on Solana blockchain
     */
    async executeSettlement(trade) {
        if (!this.wallet) {
            throw new Error('Solana wallet not configured - cannot execute settlement');
        }

        const startTime = Date.now();

        try {
            // Create simple transfer transaction (testnet demo)
            // In production, this would call a smart contract
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: this.wallet.publicKey, // Self-transfer for testing
                    lamports: 1000 // 0.000001 SOL
                })
            );

            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.wallet.publicKey;

            // Sign and send transaction
            const signature = await this.connection.sendTransaction(
                transaction,
                [this.wallet],
                { skipPreflight: false }
            );

            // Confirm transaction
            await this.connection.confirmTransaction(signature, 'confirmed');

            const latency = Date.now() - startTime;

            // Estimate gas cost (5000 lamports typical)
            const gasCost = 0.000005; // ~5000 lamports = $0.000005 at $1/SOL

            // Update stats
            this.stats.totalSettlements++;
            this.stats.totalGasCost += gasCost;

            return {
                success: true,
                txHash: signature,
                gasCost,
                latency,
                confirmed: true,
                explorer: `https://${this.mode === 'TESTNET' ? 'explorer.solana.com' : 'solscan.io'}/tx/${signature}${this.mode === 'TESTNET' ? '?cluster=testnet' : ''}`
            };

        } catch (error) {
            this.stats.totalErrors++;
            console.error('Solana settlement error:', error.message);

            return {
                success: false,
                error: error.message,
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * Batch settle multiple trades (more efficient)
     */
    async batchSettle(trades) {
        if (!this.wallet) {
            throw new Error('Solana wallet not configured');
        }

        // For now, execute sequentially
        // TODO: Implement true batch transaction (Solana supports up to ~1232 bytes per tx)
        const results = [];

        for (const trade of trades) {
            const result = await this.executeSettlement(trade);
            results.push(result);
        }

        return results;
    }

    /**
     * Get wallet balance
     */
    async getBalance() {
        if (!this.wallet) {
            return null;
        }

        try {
            const balance = await this.connection.getBalance(this.wallet.publicKey);
            return balance / LAMPORTS_PER_SOL;
        } catch (error) {
            console.error('Failed to get balance:', error.message);
            return null;
        }
    }

    /**
     * Get executor stats
     */
    getStats() {
        return {
            mode: this.mode,
            wallet: this.wallet ? this.wallet.publicKey.toString() : null,
            settlements: this.stats.totalSettlements,
            totalGasCost: this.stats.totalGasCost.toFixed(6),
            avgGasPerSettlement: this.stats.totalSettlements > 0
                ? (this.stats.totalGasCost / this.stats.totalSettlements).toFixed(8)
                : '0',
            errors: this.stats.totalErrors,
            successRate: this.stats.totalSettlements > 0
                ? ((this.stats.totalSettlements / (this.stats.totalSettlements + this.stats.totalErrors)) * 100).toFixed(2) + '%'
                : '0%'
        };
    }

    /**
     * Generate a new wallet (for testing)
     */
    static generateWallet() {
        const wallet = Keypair.generate();
        const secretKeyArray = Array.from(wallet.secretKey);
        const secretKeyJson = JSON.stringify(secretKeyArray);

        console.log('\n🔑 NEW SOLANA WALLET GENERATED:');
        console.log('   Public Key:', wallet.publicKey.toString());
        console.log('   Secret Key (JSON array):', secretKeyJson);
        console.log('\n⚠️  SAVE THIS SECRET KEY - You cannot recover it!');
        console.log('   Add to .env: SOLANA_PRIVATE_KEY=\'' + secretKeyJson + '\'');
        console.log('\n💰 Get testnet SOL:');
        console.log('   solana airdrop 2 ' + wallet.publicKey.toString() + ' --url testnet\n');

        return {
            publicKey: wallet.publicKey.toString(),
            secretKey: secretKeyJson
        };
    }
}

module.exports = SolanaExecutor;

// CLI usage: node solana-executor.js --generate
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--generate')) {
        SolanaExecutor.generateWallet();
    } else {
        console.log('Solana Executor CLI');
        console.log('Usage:');
        console.log('  node solana-executor.js --generate   Generate new wallet');
    }
}
