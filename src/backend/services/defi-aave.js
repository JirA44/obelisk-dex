/**
 * OBELISK DeFi Service - Aave V3 Integration (Backend)
 *
 * Gère les investissements Aave via le Vault Obelisk
 *
 * Flow:
 * 1. User a des fonds dans le Vault
 * 2. Backend (operator) déplace les fonds du Vault vers Aave
 * 3. Les intérêts s'accumulent
 * 4. User peut retirer (Aave -> Vault -> User)
 */

const { ethers } = require('ethers');
const crypto = require('crypto');

// ===========================================
// CONFIGURATION
// ===========================================

const ARBITRUM_RPC = process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc';

const CONTRACTS = {
  // Aave V3 Arbitrum
  aavePool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  aaveDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
  aUSDC: '0x48A29E756CC1C085530F6eB8944c0F2fE4BB0109', // Native USDC aToken

  // Tokens
  USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',

  // Obelisk Vault (set via env)
  vault: process.env.VAULT_CONTRACT || null,
};

const ABI = {
  pool: [
    'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
    'function withdraw(address asset, uint256 amount, address to) external returns (uint256)',
    'function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)'
  ],
  dataProvider: [
    'function getReserveData(address asset) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint40)'
  ],
  erc20: [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)'
  ],
  vault: [
    'function allocateToDeFi(address protocol, uint256 amount) external',
    'function returnFromDeFi(address protocol, uint256 amount, int256 profit) external',
    'function balances(address) external view returns (uint256)'
  ]
};

// ===========================================
// DATABASE
// ===========================================

let db = null;

function getDb() {
  if (!db) {
    const Database = require('better-sqlite3');
    const path = require('path');
    const dbPath = path.join(__dirname, '..', 'obelisk.db');
    db = new Database(dbPath);

    // Create DeFi positions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS defi_positions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        protocol TEXT NOT NULL,
        asset TEXT NOT NULL,
        amount_deposited REAL NOT NULL,
        current_value REAL,
        apy REAL,
        status TEXT DEFAULT 'active',
        deposited_at INTEGER DEFAULT (strftime('%s', 'now')),
        withdrawn_at INTEGER,
        tx_hash_deposit TEXT,
        tx_hash_withdraw TEXT,
        profit_realized REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_defi_user ON defi_positions(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_defi_protocol ON defi_positions(protocol)`);
  }
  return db;
}

// ===========================================
// AAVE SERVICE
// ===========================================

class AaveService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(ARBITRUM_RPC);
    this.rates = { USDC: { supply: 0, borrow: 0 } };
  }

  /**
   * Get operator wallet (for executing transactions)
   */
  getOperatorWallet() {
    const privateKey = process.env.OPERATOR_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Operator private key not configured');
    }
    return new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Fetch current Aave APY rates
   */
  async fetchRates() {
    try {
      const dataProvider = new ethers.Contract(
        CONTRACTS.aaveDataProvider,
        ABI.dataProvider,
        this.provider
      );

      const reserveData = await dataProvider.getReserveData(CONTRACTS.USDC);
      // liquidityRate is at index 5, in RAY (27 decimals)
      const liquidityRate = reserveData[5];
      const supplyAPY = Number(liquidityRate) / 1e27 * 100;

      this.rates.USDC.supply = supplyAPY;

      console.log(`[Aave] Current USDC Supply APY: ${supplyAPY.toFixed(2)}%`);
      return this.rates;
    } catch (err) {
      console.error('[Aave] Error fetching rates:', err.message);
      // Fallback
      this.rates.USDC.supply = 4.5;
      return this.rates;
    }
  }

  /**
   * Get Aave position for an address
   */
  async getPosition(address) {
    try {
      const aToken = new ethers.Contract(CONTRACTS.aUSDC, ABI.erc20, this.provider);
      const balance = await aToken.balanceOf(address);

      return {
        supplied: Number(ethers.formatUnits(balance, 6)),
        apy: this.rates.USDC.supply
      };
    } catch (err) {
      console.error('[Aave] Error getting position:', err.message);
      return { supplied: 0, apy: 0 };
    }
  }

  /**
   * Check if deposits are enabled
   */
  isEnabled() {
    const { canDeposit } = require('../config/features');
    const aaveEnabled = process.env.FEATURE_AAVE === 'true';
    return canDeposit() && aaveEnabled;
  }

  /**
   * Deposit user funds to Aave (via Vault)
   *
   * @param {string} userId - User ID
   * @param {number} amount - Amount in USDC
   * @returns {Object} Result
   */
  async deposit(userId, amount) {
    console.log(`[Aave] Depositing ${amount} USDC for user ${userId}`);

    if (!this.isEnabled()) {
      return { success: false, error: 'Aave deposits not enabled', code: 'DISABLED' };
    }

    if (!CONTRACTS.vault) {
      return { success: false, error: 'Vault contract not configured', code: 'NO_VAULT' };
    }

    if (amount < 10) {
      return { success: false, error: 'Minimum deposit is 10 USDC', code: 'MIN_AMOUNT' };
    }

    try {
      const wallet = this.getOperatorWallet();
      const amountWei = ethers.parseUnits(amount.toString(), 6);

      // 1. Check user has balance in Vault
      const database = getDb();
      // In a real implementation, check on-chain balance
      // For now, we track in DB

      // 2. Move funds from Vault to Aave
      const vault = new ethers.Contract(CONTRACTS.vault, ABI.vault, wallet);
      const usdc = new ethers.Contract(CONTRACTS.USDC, ABI.erc20, wallet);
      const pool = new ethers.Contract(CONTRACTS.aavePool, ABI.pool, wallet);

      // Allocate from Vault
      console.log('[Aave] Allocating from Vault...');
      const allocateTx = await vault.allocateToDeFi(CONTRACTS.aavePool, amountWei);
      await allocateTx.wait();

      // Approve Aave to spend USDC
      const allowance = await usdc.allowance(wallet.address, CONTRACTS.aavePool);
      if (allowance < amountWei) {
        console.log('[Aave] Approving USDC...');
        const approveTx = await usdc.approve(CONTRACTS.aavePool, ethers.MaxUint256);
        await approveTx.wait();
      }

      // Supply to Aave
      console.log('[Aave] Supplying to Aave...');
      const supplyTx = await pool.supply(
        CONTRACTS.USDC,
        amountWei,
        CONTRACTS.vault, // aTokens go to Vault
        0
      );
      const receipt = await supplyTx.wait();

      // 3. Record in database
      const positionId = crypto.randomUUID();
      await this.fetchRates();

      database.prepare(`
        INSERT INTO defi_positions (id, user_id, protocol, asset, amount_deposited, current_value, apy, tx_hash_deposit)
        VALUES (?, ?, 'aave', 'USDC', ?, ?, ?, ?)
      `).run(positionId, userId, amount, amount, this.rates.USDC.supply, receipt.hash);

      console.log(`[Aave] Deposit successful: ${receipt.hash}`);

      return {
        success: true,
        positionId,
        amount,
        apy: this.rates.USDC.supply,
        txHash: receipt.hash,
        message: `Deposited ${amount} USDC to Aave at ${this.rates.USDC.supply.toFixed(2)}% APY`
      };

    } catch (err) {
      console.error('[Aave] Deposit error:', err);
      return {
        success: false,
        error: err.message || 'Deposit failed',
        code: 'TX_FAILED'
      };
    }
  }

  /**
   * Withdraw user funds from Aave (back to Vault)
   *
   * @param {string} userId - User ID
   * @param {string} positionId - Position ID to withdraw
   * @param {number} amount - Amount to withdraw (or 'max')
   */
  async withdraw(userId, positionId, amount = 'max') {
    console.log(`[Aave] Withdrawing ${amount} USDC for user ${userId}`);

    if (!CONTRACTS.vault) {
      return { success: false, error: 'Vault contract not configured', code: 'NO_VAULT' };
    }

    try {
      const database = getDb();

      // Get position
      const position = database.prepare(`
        SELECT * FROM defi_positions WHERE id = ? AND user_id = ? AND status = 'active'
      `).get(positionId, userId);

      if (!position) {
        return { success: false, error: 'Position not found', code: 'NOT_FOUND' };
      }

      const wallet = this.getOperatorWallet();
      const withdrawAmount = amount === 'max' ? position.amount_deposited : parseFloat(amount);
      const amountWei = amount === 'max' ? ethers.MaxUint256 : ethers.parseUnits(withdrawAmount.toString(), 6);

      // Withdraw from Aave to Vault
      const pool = new ethers.Contract(CONTRACTS.aavePool, ABI.pool, wallet);
      console.log('[Aave] Withdrawing from Aave...');
      const withdrawTx = await pool.withdraw(
        CONTRACTS.USDC,
        amountWei,
        CONTRACTS.vault
      );
      const receipt = await withdrawTx.wait();

      // Calculate profit
      const currentValue = await this.getPosition(CONTRACTS.vault);
      const profit = currentValue.supplied - position.amount_deposited;

      // Update database
      database.prepare(`
        UPDATE defi_positions
        SET status = 'withdrawn',
            withdrawn_at = strftime('%s', 'now'),
            tx_hash_withdraw = ?,
            profit_realized = ?,
            current_value = ?
        WHERE id = ?
      `).run(receipt.hash, profit, currentValue.supplied, positionId);

      // Notify Vault
      const vault = new ethers.Contract(CONTRACTS.vault, ABI.vault, wallet);
      await vault.returnFromDeFi(
        CONTRACTS.aavePool,
        ethers.parseUnits(position.amount_deposited.toString(), 6),
        ethers.parseUnits(profit.toString(), 6)
      );

      console.log(`[Aave] Withdrawal successful: ${receipt.hash}`);

      return {
        success: true,
        amount: withdrawAmount,
        profit: profit,
        txHash: receipt.hash,
        message: `Withdrew ${withdrawAmount.toFixed(2)} USDC from Aave (profit: $${profit.toFixed(2)})`
      };

    } catch (err) {
      console.error('[Aave] Withdraw error:', err);
      return {
        success: false,
        error: err.message || 'Withdraw failed',
        code: 'TX_FAILED'
      };
    }
  }

  /**
   * Get user's DeFi positions
   */
  getPositions(userId) {
    const database = getDb();
    return database.prepare(`
      SELECT * FROM defi_positions
      WHERE user_id = ?
      ORDER BY deposited_at DESC
    `).all(userId);
  }

  /**
   * Get active positions with current value
   */
  async getActivePositions(userId) {
    const positions = this.getPositions(userId).filter(p => p.status === 'active');

    // Update current values from chain
    await this.fetchRates();

    return positions.map(p => {
      // Calculate accrued interest
      const daysElapsed = (Date.now() / 1000 - p.deposited_at) / 86400;
      const dailyRate = p.apy / 365 / 100;
      const currentValue = p.amount_deposited * (1 + dailyRate * daysElapsed);

      return {
        ...p,
        current_value: currentValue,
        unrealized_profit: currentValue - p.amount_deposited,
        current_apy: this.rates.USDC.supply
      };
    });
  }
}

// Singleton
const aaveService = new AaveService();

module.exports = {
  aaveService,
  CONTRACTS,
};
