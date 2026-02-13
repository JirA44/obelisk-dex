/**
 * OBELISK KYC API Routes
 *
 * Endpoints pour la vérification d'identité via Stripe
 */

const express = require('express');
const router = express.Router();

const {
  createVerificationSession,
  getVerificationStatus,
  handleWebhook,
  constructWebhookEvent,
  KYC_STATUS
} = require('../services/kyc-stripe');

const { authenticateUser, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/kyc/status
 * Get current KYC status for authenticated user
 */
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const status = getVerificationStatus(req.user.id);

    res.json({
      success: true,
      kyc: status
    });
  } catch (err) {
    console.error('[KYC] Status error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get KYC status',
      code: 'KYC_STATUS_ERROR'
    });
  }
});

/**
 * POST /api/kyc/start
 * Start a new verification session
 *
 * Body: { returnUrl: string }
 */
router.post('/start', authenticateUser, async (req, res) => {
  try {
    const { returnUrl } = req.body;
    const userId = req.user.id;
    const walletAddress = req.user.wallet;

    // Default return URL
    const finalReturnUrl = returnUrl || `${process.env.FRONTEND_URL || 'https://obelisk-dex.pages.dev'}/kyc/complete`;

    const session = await createVerificationSession(userId, walletAddress, finalReturnUrl);

    if (session.alreadyVerified) {
      return res.json({
        success: true,
        alreadyVerified: true,
        status: 'verified',
        message: 'You are already verified'
      });
    }

    res.json({
      success: true,
      sessionId: session.sessionId,
      verificationUrl: session.url,
      status: session.status
    });
  } catch (err) {
    console.error('[KYC] Start error:', err);

    // Handle Stripe errors specifically
    if (err.type === 'StripeAuthenticationError') {
      return res.status(500).json({
        success: false,
        error: 'KYC service not configured',
        code: 'KYC_NOT_CONFIGURED'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to start verification',
      code: 'KYC_START_ERROR'
    });
  }
});

/**
 * POST /api/kyc/webhook
 * Stripe webhook endpoint
 *
 * IMPORTANT: This endpoint must receive raw body (not JSON parsed)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    const event = constructWebhookEvent(req.body, signature);
    const result = await handleWebhook(event);

    res.json({ received: true, result });
  } catch (err) {
    console.error('[KYC] Webhook error:', err);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
});

/**
 * GET /api/kyc/check/:wallet
 * Check if a wallet address is verified (public, for smart contracts)
 */
router.get('/check/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;

    // Normalize wallet address
    const normalizedWallet = wallet.toLowerCase();

    // Query by wallet address
    const Database = require('better-sqlite3');
    const path = require('path');
    const dbPath = path.join(__dirname, '..', 'obelisk.db');
    const db = new Database(dbPath, { readonly: true });

    const verification = db.prepare(`
      SELECT status, verified_at FROM kyc_verifications
      WHERE LOWER(wallet_address) = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(normalizedWallet);

    db.close();

    const isVerified = verification?.status === KYC_STATUS.VERIFIED;

    res.json({
      wallet: normalizedWallet,
      verified: isVerified,
      verifiedAt: verification?.verified_at ? new Date(verification.verified_at * 1000).toISOString() : null
    });
  } catch (err) {
    console.error('[KYC] Check error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to check verification',
      verified: false
    });
  }
});

/**
 * GET /api/kyc/requirements
 * Get KYC requirements info
 */
router.get('/requirements', (req, res) => {
  const kycRequired = process.env.FEATURE_KYC_REQUIRED === 'true';
  const kycProvider = process.env.KYC_PROVIDER || 'stripe';

  res.json({
    required: kycRequired,
    provider: kycProvider,
    acceptedDocuments: ['passport', 'driving_license', 'id_card'],
    processingTime: '2-5 minutes',
    dataRetention: '90 days after verification',
    privacyPolicy: '/legal/privacy',
    supportedCountries: 'Most countries supported'
  });
});

module.exports = router;
