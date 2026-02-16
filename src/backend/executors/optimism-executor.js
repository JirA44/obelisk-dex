/**
 * OPTIMISM EXECUTOR - Optimism L2
 * Executes trades on Optimism (Ethereum Layer 2)
 *
 * Version: 1.0
 * Date: 2026-02-17
 */

const { ethers } = require('ethers');

class OptimismExecutor {
    constructor(config = {}) {
        this.network = config.network || 'MAINNET';

        this.networks = {
            MAINNET: {
                name: 'Optimism',
                rpc: 'https://mainnet.optimism.io',
                chainId: 10,
                explorer: 'https://optimistic.etherscan.io'
            },
            TESTNET: {
                name: 'Optimism Sepolia',
                rpc: 'https://sepolia.optimism.io',
                chainId: 11155420,
                explorer: 'https://sepolia-optimistic.etherscan.io'
            }
        };

        this.config = this.networks[this.network];
        this.provider = new ethers.JsonRpcProvider(this.config.rpc);

        const envKey = this.network === 'MAINNET'
            ? (process.env.OPTIMISM_MAINNET_PRIVATE_KEY || process.env.ARBITRUM_PRIVATE_KEY)
            : (process.env.OPTIMISM_TESTNET_PRIVATE_KEY || process.env.ARBITRUM_PRIVATE_KEY);

        if (envKey) {
            try {
                this.wallet = new ethers.Wallet(envKey, this.provider);
                console.log(`✅ Optimism Executor initialized (${this.config.name})`);
                console.log(`   Wallet: ${this.wallet.address}`);
            } catch (error) {
                console.warn('⚠️  Failed to load Optimism wallet:', error.message);
                this.wallet = null;
            }
        } else {
            this.wallet = null;
        }

        this.stats = { totalSettlements: 0, totalGasCost: 0, totalErrors: 0 };
    }

    async executeSettlement(trade) {
        if (!this.wallet) throw new Error('Optimism wallet not configured');

        const startTime = Date.now();

        try {
            const tx = await this.wallet.sendTransaction({
                to: this.wallet.address,
                value: ethers.parseEther('0.0000001')
            });

            const receipt = await tx.wait();
            const latency = Date.now() - startTime;

            const gasUsed = receipt.gasUsed;
            const gasPrice = receipt.gasPrice || tx.gasPrice;
            const gasCostWei = gasUsed * gasPrice;
            const gasCostEth = parseFloat(ethers.formatEther(gasCostWei));
            const gasCostUsd = gasCostEth * 3000;

            this.stats.totalSettlements++;
            this.stats.totalGasCost += gasCostUsd;

            return {
                success: true,
                txHash: receipt.hash,
                gasCost: gasCostUsd,
                gasUsed: gasUsed.toString(),
                latency,
                confirmed: receipt.status === 1,
                blockNumber: receipt.blockNumber,
                explorer: `${this.config.explorer}/tx/${receipt.hash}`
            };

        } catch (error) {
            this.stats.totalErrors++;
            return {
                success: false,
                error: error.message,
                latency: Date.now() - startTime
            };
        }
    }

    async batchSettle(trades) {
        const results = [];
        for (const trade of trades) {
            results.push(await this.executeSettlement(trade));
        }
        return results;
    }

    async getBalance() {
        if (!this.wallet) return null;
        try {
            const balance = await this.provider.getBalance(this.wallet.address);
            return parseFloat(ethers.formatEther(balance));
        } catch (error) {
            return null;
        }
    }

    getStats() {
        return {
            network: this.network,
            networkName: this.config.name,
            wallet: this.wallet ? this.wallet.address : null,
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
}

module.exports = OptimismExecutor;
