# Obelisk V3 TURBO - Testnet Deployment Guide

**Date**: 2026-02-16
**Version**: V3 TURBO
**Target**: Replace mocks with real blockchain testnet wallets

---

## Current Status

### ✅ What Works (Mocked)
- V3 TURBO: 468 TPS sustained, 606 TPS peak
- 100% success rate on 100K trades
- 90% gas savings through batching
- Parallel processing (1000 concurrent)
- Batch execution (100 trades/batch)

### ❌ What Needs Real Implementation
- `blockchain-settlement.js::executeOnChain()` - Currently simulated
- Wallet management - No real testnet wallets configured
- Transaction signing - Mock tx hashes
- On-chain settlement - Only latency simulation

---

## Architecture Overview

```
Obelisk V3 TURBO
├── Internal Pool (<$50 trades) - ✅ Works (no blockchain needed)
└── Blockchain Settlement (>$50 trades) - ❌ MOCKED
    ├── Solana Testnet (priority 1)
    ├── Cosmos Testnet (priority 2) - dYdX v4 runs here
    ├── Avalanche Fuji (priority 3)
    ├── Base Sepolia (priority 4)
    ├── Arbitrum Sepolia (priority 5)
    └── Optimism Sepolia (priority 6)
```

---

## Phase 1: Solana Testnet (Week 1)

### 1.1 Setup & Configuration

**Install dependencies:**
```bash
cd ~/obelisk
npm install @solana/web3.js @coral-xyz/anchor bs58
```

**Environment variables (.env):**
```env
# Solana Testnet
SOLANA_RPC_URL=https://api.testnet.solana.com
SOLANA_PRIVATE_KEY=base58_private_key_here
SOLANA_PROGRAM_ID=your_deployed_program_id

# Testnet Mode
BLOCKCHAIN_MODE=TESTNET
```

### 1.2 Get Testnet SOL

```bash
# Generate new wallet
solana-keygen new --outfile ~/obelisk/solana-testnet-wallet.json

# Get public key
solana-keygen pubkey ~/obelisk/solana-testnet-wallet.json

# Airdrop testnet SOL (2 SOL = ~1000 trades)
solana airdrop 2 YOUR_PUBLIC_KEY --url testnet
```

### 1.3 Create Solana Executor

**New file:** `src/backend/executors/solana-executor.js`

```javascript
const { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');

class SolanaExecutor {
    constructor(config) {
        this.connection = new Connection(
            config.rpcUrl || 'https://api.testnet.solana.com',
            'confirmed'
        );

        // Load wallet from private key
        const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
        this.wallet = Keypair.fromSecretKey(secretKey);

        console.log('✅ Solana Executor initialized');
        console.log(`   Wallet: ${this.wallet.publicKey.toString()}`);
    }

    async executeSettlement(trade) {
        const startTime = Date.now();

        try {
            // Create simple transfer transaction (testnet demo)
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: this.wallet.publicKey, // Self-transfer for testing
                    lamports: 1000 // 0.000001 SOL
                })
            );

            // Send and confirm
            const signature = await this.connection.sendTransaction(
                transaction,
                [this.wallet]
            );

            await this.connection.confirmTransaction(signature, 'confirmed');

            const latency = Date.now() - startTime;

            return {
                success: true,
                txHash: signature,
                gasCost: 0.000005, // ~5000 lamports
                latency,
                confirmed: true
            };

        } catch (error) {
            console.error('Solana settlement error:', error);
            throw error;
        }
    }

    async getBalance() {
        const balance = await this.connection.getBalance(this.wallet.publicKey);
        return balance / LAMPORTS_PER_SOL;
    }
}

module.exports = SolanaExecutor;
```

### 1.4 Update blockchain-settlement.js

**Replace `executeOnChain()` (line 207):**

```javascript
async executeOnChain(chain, trade) {
    // Real blockchain execution based on chain
    if (chain.key === 'SOLANA') {
        if (!this.solanaExecutor) {
            const SolanaExecutor = require('./executors/solana-executor.js');
            this.solanaExecutor = new SolanaExecutor({
                rpcUrl: chain.rpc
            });
        }
        return await this.solanaExecutor.executeSettlement(trade);
    }

    // Fall back to simulation for other chains (for now)
    return this.simulateExecution(chain, trade);
}

// Keep simulation as fallback
async simulateExecution(chain, trade) {
    const latency = chain.avgBlockTime * 1000;
    await new Promise(resolve => setTimeout(resolve, latency));

    const gasCost = chain.avgGasCost * (0.8 + Math.random() * 0.4);
    const txHash = `0xMOCK${Date.now()}`;

    return { txHash, gasCost, blockTime: chain.avgBlockTime, confirmed: true };
}
```

### 1.5 Testing

```bash
# Test Solana executor
node test_solana_testnet.js

# Test V3 TURBO with Solana testnet (1000 trades)
node test_turbo_simple.js --testnet --chain solana --trades 1000

# Monitor balance
solana balance YOUR_PUBLIC_KEY --url testnet
```

**Expected Results:**
- Real tx hashes on Solana Explorer (testnet)
- ~400ms latency per tx
- ~0.000005 SOL per tx (~$0.00025 at testnet prices)
- TPS should be similar to mock (450-500 TPS)

---

## Phase 2: EVM Chains Testnet (Week 2)

### 2.1 Setup EVM Chains

**Install ethers v6:**
```bash
npm install ethers@6
```

**Environment variables:**
```env
# EVM Testnet Wallets
EVM_PRIVATE_KEY=0x_your_private_key_here

# RPC URLs
AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
BASE_SEPOLIA_RPC=https://sepolia.base.org
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
OPTIMISM_SEPOLIA_RPC=https://sepolia.optimism.io
```

### 2.2 Get Testnet Tokens

| Chain | Faucet | Amount Needed |
|-------|--------|---------------|
| **Avalanche Fuji** | https://faucet.avax.network | 5 AVAX (~500 trades) |
| **Base Sepolia** | https://www.coinbase.com/faucets/base-ethereum-goerli-faucet | 1 ETH (~100 trades) |
| **Arbitrum Sepolia** | https://faucet.quicknode.com/arbitrum/sepolia | 0.5 ETH (~50 trades) |
| **Optimism Sepolia** | https://app.optimism.io/faucet | 0.5 ETH (~50 trades) |

### 2.3 Create EVM Executor

**New file:** `src/backend/executors/evm-executor.js`

```javascript
const { ethers } = require('ethers');

class EVMExecutor {
    constructor(config) {
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY, this.provider);
        this.chainName = config.chainName;

        console.log(`✅ EVM Executor initialized (${this.chainName})`);
        console.log(`   Wallet: ${this.wallet.address}`);
    }

    async executeSettlement(trade) {
        const startTime = Date.now();

        try {
            // Simple self-transfer for testnet demo
            const tx = await this.wallet.sendTransaction({
                to: this.wallet.address,
                value: ethers.parseEther('0.000001'), // Minimal amount
                gasLimit: 21000
            });

            const receipt = await tx.wait();
            const latency = Date.now() - startTime;

            // Calculate actual gas cost
            const gasCost = Number(ethers.formatEther(
                receipt.gasUsed * receipt.gasPrice
            ));

            return {
                success: true,
                txHash: receipt.hash,
                gasCost,
                latency,
                confirmed: true,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            console.error(`${this.chainName} settlement error:`, error);
            throw error;
        }
    }

    async getBalance() {
        const balance = await this.provider.getBalance(this.wallet.address);
        return Number(ethers.formatEther(balance));
    }
}

module.exports = EVMExecutor;
```

### 2.4 Update blockchain-settlement.js

```javascript
async executeOnChain(chain, trade) {
    // Solana
    if (chain.key === 'SOLANA') {
        if (!this.solanaExecutor) {
            const SolanaExecutor = require('./executors/solana-executor.js');
            this.solanaExecutor = new SolanaExecutor({ rpcUrl: chain.rpc });
        }
        return await this.solanaExecutor.executeSettlement(trade);
    }

    // EVM chains
    if (['AVALANCHE', 'BASE', 'ARBITRUM', 'OPTIMISM'].includes(chain.key)) {
        if (!this.evmExecutors) {
            this.evmExecutors = {};
        }

        if (!this.evmExecutors[chain.key]) {
            const EVMExecutor = require('./executors/evm-executor.js');
            this.evmExecutors[chain.key] = new EVMExecutor({
                rpcUrl: chain.rpc,
                chainName: chain.name
            });
        }

        return await this.evmExecutors[chain.key].executeSettlement(trade);
    }

    // Fallback to simulation
    return this.simulateExecution(chain, trade);
}
```

---

## Phase 3: Smart Contract Deployment (Week 3-4)

### 3.1 Solana Program (Anchor)

**Deploy perpetuals contract on Solana:**
- Accept trade orders
- Track positions
- Handle settlements
- Emit events

**Benefits:**
- 10x cheaper than simple transfers
- Better UX (single program call)
- State management on-chain

### 3.2 EVM Contracts (Solidity)

**Deploy on each EVM testnet:**
```solidity
// ObeliskPerps.sol
contract ObeliskPerps {
    struct Position {
        address trader;
        string asset;
        uint256 size;
        bool isLong;
        uint256 entryPrice;
    }

    mapping(uint256 => Position) public positions;

    function openPosition(...) external payable { }
    function closePosition(...) external { }
    function batchSettle(...) external { }
}
```

---

## Phase 4: Integration & Testing (Week 5)

### 4.1 Progressive Rollout

1. **Test Solana only** (1K trades)
2. **Add Avalanche** (10K trades, 70% Solana / 30% Avalanche)
3. **Add Base** (50K trades, multi-chain)
4. **Add Arbitrum + Optimism** (100K trades)

### 4.2 Performance Validation

| Metric | Mock | Testnet Target |
|--------|------|----------------|
| TPS | 468 | 400+ |
| Latency | 850ms | 1000ms |
| Success Rate | 100% | >99% |
| Gas Cost (100K) | $250 simulated | <$500 real |

### 4.3 Monitoring

**New file:** `scripts/monitor_testnet.js`
- Real-time balance tracking
- Failed tx detection
- Gas cost analysis
- Chain distribution stats

---

## Phase 5: Mainnet Preparation (Week 6)

### 5.1 Audit Checklist
- [ ] Security audit (smart contracts)
- [ ] Gas optimization review
- [ ] Error handling (RPC failures, tx reverts)
- [ ] Rate limiting (RPC endpoints)
- [ ] Wallet key management (HSM/KMS)

### 5.2 Mainnet Configuration

**Switch to mainnet RPCs:**
```env
BLOCKCHAIN_MODE=MAINNET
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
AVALANCHE_RPC=https://api.avax.network/ext/bc/C/rpc
# ... etc
```

### 5.3 Capital Deployment

**Initial mainnet capital:**
- Solana: 10 SOL (~$2000)
- Avalanche: 50 AVAX (~$2000)
- Base/Arbitrum/Optimism: 1 ETH each (~$3000)

**Total**: ~$9000 for 1M+ trades capacity

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| RPC rate limits | TPS degradation | Multiple RPC providers, fallbacks |
| Tx failures | Lost trades | Retry logic, error recovery |
| Gas spikes | Higher costs | Dynamic fee estimation, caps |
| Testnet downtime | Testing blocked | Multiple testnet options |

### Financial Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Testnet tokens depleted | Testing stopped | Auto-refill scripts, faucet monitoring |
| Mainnet gas > budget | Profitability loss | Fee caps, pause trading if >threshold |
| Smart contract bug | Fund loss | Audits, limited initial capital |

---

## Timeline Summary

| Week | Phase | Deliverable |
|------|-------|-------------|
| **1** | Solana Testnet | Real Solana settlements, 1K trades tested |
| **2** | EVM Testnets | All 5 chains connected, 10K trades tested |
| **3-4** | Smart Contracts | Deployed + tested on all testnets |
| **5** | Integration | 100K trades multi-chain, >99% success |
| **6** | Mainnet Prep | Audited, documented, ready for mainnet |

---

## Cost Estimates

### Development
- Smart contracts: ~40 hours
- Integration: ~20 hours
- Testing: ~20 hours
- **Total**: ~80 hours (~$8K at $100/hr)

### Operations (Testnet)
- Faucet tokens: Free
- RPC costs: Free (public endpoints)
- **Total**: $0

### Operations (Mainnet/month)
- Gas costs (1M trades): ~$500
- RPC provider (Alchemy/Infura): ~$100
- Monitoring (Datadog): ~$50
- **Total**: ~$650/month

---

## Success Criteria

### Testnet Validation
- ✅ 100K trades executed on real testnets
- ✅ >99% success rate
- ✅ <1000ms avg latency
- ✅ Gas costs <$1000 for 100K trades
- ✅ All 5 chains operational

### Mainnet Ready
- ✅ Security audit passed
- ✅ Error recovery tested
- ✅ Monitoring dashboards live
- ✅ Documentation complete
- ✅ Team trained on operations

---

## Next Steps

1. ✅ Document deployment plan (this file)
2. ⏳ Install Solana dependencies
3. ⏳ Setup testnet wallets
4. ⏳ Create Solana executor
5. ⏳ Test 1K trades on Solana testnet

**Estimated start**: When capital + time available
**Priority**: Medium (V3 works well with mocks for now)
**Blocker**: None (can proceed anytime)

---

## References

- Solana Testnet: https://docs.solana.com/clusters#testnet
- Avalanche Fuji: https://docs.avax.network/build/dapp/testnet-workflow
- Base Sepolia: https://docs.base.org/docs/network-information
- Ethers.js v6: https://docs.ethers.org/v6/
- @solana/web3.js: https://solana-labs.github.io/solana-web3.js/

---

**Status**: 📋 PLANNED
**Last Updated**: 2026-02-16
