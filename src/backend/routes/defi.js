/**
 * OBELISK DeFi API Routes
 *
 * Endpoints pour les investissements DeFi (Aave, GMX, etc.)
 */

const express = require('express');
const router = express.Router();

const { aaveService } = require('../services/defi-aave');
const { authenticateUser } = require('../middleware/auth');
const { requireKYC } = require('../services/kyc-stripe');
const { getConfig } = require('../config/features');

/**
 * GET /api/defi/status
 * Get DeFi features status
 */
router.get('/status', (req, res) => {
  const config = getConfig();

  res.json({
    success: true,
    defi: {
      aave: {
        enabled: config.DEFI_AAVE_ENABLED,
        minDeposit: 10,
        currentAPY: aaveService.rates.USDC.supply || 4.5
      },
      gmx: {
        enabled: config.DEFI_GMX_ENABLED,
        minDeposit: 50
      },
      aerodrome: {
        enabled: config.DEFI_AERODROME_ENABLED,
        minDeposit: 100
      }
    },
    mode: config.MODE
  });
});

/**
 * GET /api/defi/rates
 * Get current APY rates
 */
router.get('/rates', async (req, res) => {
  try {
    const rates = await aaveService.fetchRates();

    res.json({
      success: true,
      rates: {
        aave: {
          USDC: rates.USDC.supply
        }
      },
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rates'
    });
  }
});

/**
 * GET /api/defi/positions
 * Get user's DeFi positions
 */
router.get('/positions', authenticateUser, async (req, res) => {
  try {
    const positions = await aaveService.getActivePositions(req.user.id);

    // Calculate totals
    const totalDeposited = positions.reduce((sum, p) => sum + p.amount_deposited, 0);
    const totalValue = positions.reduce((sum, p) => sum + p.current_value, 0);
    const totalProfit = totalValue - totalDeposited;

    res.json({
      success: true,
      positions,
      summary: {
        totalDeposited,
        totalValue,
        totalProfit,
        profitPercent: totalDeposited > 0 ? (totalProfit / totalDeposited * 100) : 0
      }
    });
  } catch (err) {
    console.error('[DeFi] Error getting positions:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get positions'
    });
  }
});

/**
 * POST /api/defi/aave/deposit
 * Deposit USDC to Aave
 *
 * Body: { amount: number }
 */
router.post('/aave/deposit', authenticateUser, requireKYC, async (req, res) => {
  const config = getConfig();

  // Check if Aave is enabled
  if (!config.DEFI_AAVE_ENABLED) {
    return res.status(400).json({
      success: false,
      error: 'Aave deposits not enabled',
      code: 'DISABLED',
      mode: config.MODE
    });
  }

  const { amount } = req.body;

  if (!amount || amount < 10) {
    return res.status(400).json({
      success: false,
      error: 'Minimum deposit is 10 USDC',
      code: 'MIN_AMOUNT'
    });
  }

  try {
    const result = await aaveService.deposit(req.user.id, amount);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('[DeFi] Aave deposit error:', err);
    res.status(500).json({
      success: false,
      error: 'Deposit failed',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/defi/aave/withdraw
 * Withdraw from Aave
 *
 * Body: { positionId: string, amount: number | 'max' }
 */
router.post('/aave/withdraw', authenticateUser, async (req, res) => {
  const { positionId, amount = 'max' } = req.body;

  if (!positionId) {
    return res.status(400).json({
      success: false,
      error: 'Position ID required',
      code: 'MISSING_POSITION'
    });
  }

  try {
    const result = await aaveService.withdraw(req.user.id, positionId, amount);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('[DeFi] Aave withdraw error:', err);
    res.status(500).json({
      success: false,
      error: 'Withdraw failed',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/defi/aave/estimate
 * Estimate earnings for an amount
 */
router.get('/aave/estimate', async (req, res) => {
  const amount = parseFloat(req.query.amount) || 100;
  const days = parseInt(req.query.days) || 365;

  await aaveService.fetchRates();
  const apy = aaveService.rates.USDC.supply || 4.5;
  const dailyRate = apy / 365 / 100;

  res.json({
    success: true,
    estimate: {
      amount,
      apy,
      daily: amount * dailyRate,
      weekly: amount * dailyRate * 7,
      monthly: amount * dailyRate * 30,
      yearly: amount * dailyRate * 365,
      afterDays: {
        days,
        value: amount * (1 + dailyRate * days),
        earnings: amount * dailyRate * days
      }
    }
  });
});

module.exports = router;
