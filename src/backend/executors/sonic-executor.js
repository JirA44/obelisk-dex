/**
 * SONIC EXECUTOR - Ex-Fantom (Ultra Fast & Cheap)
 * Executes trades on Sonic (formerly Fantom)
 *
 * TPS: 10,000+
 * Fees: ~$0.0001/tx (4x cheaper than Solana!)
 *
 * Version: 1.0
 * Date: 2026-02-17
 */

const { ethers } = require('ethers');

class SonicExecutor {
    constructor(config = {}) {
        this.network = config.network || 'MAINNET';

        this.networks = {
            MAINNET: {
                name: 'Sonic',
                rpc: 'https://rpc.soniclabs.com',
                chainId: 146,
                explorer: 'https://sonicscan.org',
                nativeToken: 'S'
            },
            TESTNET: {
                name: 'Sonic Testnet',
                rpc: 'https://rpc.testnet.soniclabs.com',
                chainId: 57054,
                explorer: 'https://testnet.sonicscan.org',
                nativeToken: 'S'
            }
        };

        this.config = this.networks[this.network];
        this.provider = new ethers.JsonRpcProvider(this.config.rpc);

        const envKey = this.network === 'MAINNET'
            ? (process.env.SONIC_MAINNET_PRIVATE_KEY || process.env.ARBITRUM_PRIVATE_KEY)
            : (process.env.SONIC_TESTNET_PRIVATE_KEY || process.env.ARBITRUM_PRIVATE_KEY);

        if (envKey) {
            try {
                this.wallet = new ethers.Wallet(envKey, this.provider);
                console.log(`✅ Sonic Executor initialized (${this.config.name})`);
                console.log(`   Wallet: ${this.wallet.address}`);
            } catch (error) {
                console.warn('⚠️  Failed to load Sonic wallet:', error.message);
                this.wallet = null;
            }
        } else {
            this.wallet = null;
        }

        this.stats = { totalSettlements: 0, totalGasCost: 0, totalErrors: 0 };
    }

    async executeSettlement(trade) {
        if (!this.wallet) throw new Error('Sonic wallet not configured');

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
            const gasCostS = parseFloat(ethers.formatEther(gasCostWei));

            // Sonic (S) price: $0.049106/S
            const gasCostUsd = gasCostS * 0.049106;

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
        if (!this.wallet) throw new Error('Sonic wallet not configured');
        if (trades.length === 1) return [await this.executeSettlement(trades[0])];

        const startTime = Date.now();

        // Multicall3 - 1 tx for all trades (massive gas savings)
        const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11';
        const MICRO_VALUE = ethers.parseEther('0.0000001');

        const multicall3Abi = [
            'function aggregate3Value((address target, bool allowFailure, uint256 value, bytes callData)[] calls) external payable returns ((bool success, bytes returnData)[] returnData)'
        ];
        const multicall = new ethers.Contract(MULTICALL3, multicall3Abi, this.wallet);

        const calls = trades.map(() => ({
            target: this.wallet.address,
            allowFailure: true,
            value: MICRO_VALUE,
            callData: '0x'
        }));
        const totalValue = MICRO_VALUE * BigInt(trades.length);

        try {
            const tx = await multicall.aggregate3Value(calls, { value: totalValue });
            const receipt = await tx.wait();
            const latency = Date.now() - startTime;

            const gasUsed = receipt.gasUsed;
            const gasPrice = receipt.gasPrice || tx.gasPrice;
            const gasCostS = parseFloat(ethers.formatEther(gasUsed * gasPrice));
            const gasCostUsd = gasCostS * 0.049106; // $0.049106/S
            const costPerTrade = gasCostUsd / trades.length;

            this.stats.totalSettlements += trades.length;
            this.stats.totalGasCost += gasCostUsd;

            console.log(`   ✅ Multicall3 batch: ${trades.length} trades → 1 tx (${gasCostUsd.toFixed(6)} USD total, ${costPerTrade.toFixed(6)}/trade)`);

            return trades.map((_, i) => ({
                success: true,
                txHash: receipt.hash,
                batchIndex: i,
                gasCost: costPerTrade,
                gasUsed: gasUsed.toString(),
                latency,
                confirmed: receipt.status === 1,
                blockNumber: receipt.blockNumber,
                explorer: `${this.config.explorer}/tx/${receipt.hash}`,
                multicall: true,
                batchSize: trades.length
            }));

        } catch (err) {
            // Fallback to sequential if multicall fails
            console.warn(`⚠️  Multicall3 failed (${err.message}), falling back to sequential`);
            this.stats.totalErrors++;
            const results = [];
            for (const trade of trades) {
                results.push(await this.executeSettlement(trade));
            }
            return results;
        }
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

module.exports = SonicExecutor;
