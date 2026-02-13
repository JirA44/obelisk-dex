/**
 * OBELISK Feature Flags API Routes
 *
 * Expose feature configuration to frontend
 */

const express = require('express');
const router = express.Router();
const { getFeatureStatus, isDemoMode, canDeposit, canWithdraw, requiresKYC } = require('../config/features');

/**
 * GET /api/features
 * Get current feature configuration (public)
 */
router.get('/', (req, res) => {
  const features = getFeatureStatus();

  res.json({
    success: true,
    features,
    timestamp: Date.now()
  });
});

/**
 * GET /api/features/mode
 * Get current mode only
 */
router.get('/mode', (req, res) => {
  const features = getFeatureStatus();

  res.json({
    mode: features.mode,
    isDemo: isDemoMode(),
    canDeposit: canDeposit(),
    canWithdraw: canWithdraw(),
    requiresKYC: requiresKYC()
  });
});

/**
 * GET /api/features/check/:feature
 * Check if a specific feature is enabled
 */
router.get('/check/:feature', (req, res) => {
  const { feature } = req.params;
  const features = getFeatureStatus();

  // Map feature names to status
  const featureMap = {
    'trading': features.trading.enabled,
    'trading-real': features.trading.realExecution,
    'deposits': features.deposits.enabled,
    'withdrawals': features.withdrawals.enabled,
    'aave': features.defi.aave,
    'gmx': features.defi.gmx,
    'aerodrome': features.defi.aerodrome,
    'kyc': features.kyc.required,
    'demo-banner': features.demo.showBanner,
  };

  const enabled = featureMap[feature.toLowerCase()];

  if (enabled === undefined) {
    return res.status(404).json({
      success: false,
      error: `Unknown feature: ${feature}`,
      availableFeatures: Object.keys(featureMap)
    });
  }

  res.json({
    feature,
    enabled,
    mode: features.mode
  });
});

module.exports = router;
