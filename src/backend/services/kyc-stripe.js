/**
 * OBELISK KYC Service - Stripe Identity Integration
 *
 * Stripe Identity permet de vérifier l'identité des utilisateurs
 * avec des documents (ID, passeport) et selfie.
 *
 * Flow:
 * 1. User clique "Verify Identity"
 * 2. Backend crée une VerificationSession
 * 3. Frontend redirige vers Stripe hosted UI
 * 4. Stripe vérifie les documents
 * 5. Webhook notifie le backend du résultat
 * 6. Backend met à jour le statut KYC en DB
 */

const crypto = require('crypto');

// Stripe SDK (lazy loaded)
let stripe = null;

function getStripe() {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    stripe = require('stripe')(secretKey);
  }
  return stripe;
}

// ===========================================
// KYC STATUS ENUM
// ===========================================

const KYC_STATUS = {
  NONE: 'none',           // No verification started
  PENDING: 'pending',     // Verification in progress
  VERIFIED: 'verified',   // Successfully verified
  FAILED: 'failed',       // Verification failed
  EXPIRED: 'expired',     // Session expired
};

// ===========================================
// DATABASE HELPERS
// ===========================================

let db = null;

function getDb() {
  if (!db) {
    const Database = require('better-sqlite3');
    const path = require('path');
    const dbPath = path.join(__dirname, '..', 'obelisk.db');
    db = new Database(dbPath);

    // Create KYC table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS kyc_verifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        wallet_address TEXT,
        stripe_session_id TEXT UNIQUE,
        status TEXT DEFAULT 'none',
        verified_at INTEGER,
        failed_reason TEXT,
        document_type TEXT,
        country TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_kyc_wallet ON kyc_verifications(wallet_address)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_kyc_session ON kyc_verifications(stripe_session_id)`);
  }
  return db;
}

// ===========================================
// KYC FUNCTIONS
// ===========================================

/**
 * Create a new verification session
 * @param {string} userId - Internal user ID
 * @param {string} walletAddress - User's wallet address
 * @param {string} returnUrl - URL to redirect after verification
 * @returns {Object} { sessionId, url }
 */
async function createVerificationSession(userId, walletAddress, returnUrl) {
  const stripeClient = getStripe();
  const database = getDb();

  // Check if user already has a pending or verified session
  const existing = database.prepare(`
    SELECT * FROM kyc_verifications
    WHERE user_id = ? AND status IN ('pending', 'verified')
    ORDER BY created_at DESC LIMIT 1
  `).get(userId);

  if (existing?.status === 'verified') {
    return {
      alreadyVerified: true,
      sessionId: existing.stripe_session_id,
      status: 'verified',
      verifiedAt: existing.verified_at
    };
  }

  // Create Stripe Identity verification session
  const session = await stripeClient.identity.verificationSessions.create({
    type: 'document',
    metadata: {
      user_id: userId,
      wallet_address: walletAddress,
    },
    options: {
      document: {
        // Accepted document types
        allowed_types: ['driving_license', 'passport', 'id_card'],
        require_id_number: false,
        require_live_capture: true,
        require_matching_selfie: true,
      },
    },
    return_url: returnUrl,
  });

  // Save to database
  const id = crypto.randomUUID();
  database.prepare(`
    INSERT INTO kyc_verifications (id, user_id, wallet_address, stripe_session_id, status)
    VALUES (?, ?, ?, ?, 'pending')
  `).run(id, userId, walletAddress, session.id);

  console.log(`[KYC] Created verification session for user ${userId}: ${session.id}`);

  return {
    sessionId: session.id,
    url: session.url,
    status: 'pending',
  };
}

/**
 * Get verification status for a user
 * @param {string} userId - Internal user ID
 * @returns {Object} KYC status
 */
function getVerificationStatus(userId) {
  const database = getDb();

  const verification = database.prepare(`
    SELECT * FROM kyc_verifications
    WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 1
  `).get(userId);

  if (!verification) {
    return {
      status: KYC_STATUS.NONE,
      required: process.env.FEATURE_KYC_REQUIRED === 'true',
    };
  }

  return {
    status: verification.status,
    verifiedAt: verification.verified_at ? new Date(verification.verified_at * 1000).toISOString() : null,
    failedReason: verification.failed_reason,
    documentType: verification.document_type,
    country: verification.country,
    required: process.env.FEATURE_KYC_REQUIRED === 'true',
  };
}

/**
 * Check if user is verified
 * @param {string} userId - Internal user ID
 * @returns {boolean}
 */
function isUserVerified(userId) {
  const status = getVerificationStatus(userId);
  return status.status === KYC_STATUS.VERIFIED;
}

/**
 * Handle Stripe webhook event
 * @param {Object} event - Stripe webhook event
 */
async function handleWebhook(event) {
  const database = getDb();

  switch (event.type) {
    case 'identity.verification_session.verified': {
      const session = event.data.object;
      const userId = session.metadata?.user_id;

      console.log(`[KYC] User ${userId} verified successfully`);

      // Extract verification details
      const lastReport = session.last_verification_report;
      let documentType = null;
      let country = null;

      if (lastReport) {
        const stripeClient = getStripe();
        const report = await stripeClient.identity.verificationReports.retrieve(lastReport);
        documentType = report.document?.type;
        country = report.document?.issuing_country;
      }

      database.prepare(`
        UPDATE kyc_verifications
        SET status = 'verified',
            verified_at = strftime('%s', 'now'),
            document_type = ?,
            country = ?,
            updated_at = strftime('%s', 'now')
        WHERE stripe_session_id = ?
      `).run(documentType, country, session.id);

      return { success: true, status: 'verified', userId };
    }

    case 'identity.verification_session.requires_input': {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const error = session.last_error;

      console.log(`[KYC] User ${userId} verification requires input: ${error?.code}`);

      database.prepare(`
        UPDATE kyc_verifications
        SET status = 'pending',
            failed_reason = ?,
            updated_at = strftime('%s', 'now')
        WHERE stripe_session_id = ?
      `).run(error?.reason || 'Additional input required', session.id);

      return { success: true, status: 'pending', userId };
    }

    case 'identity.verification_session.canceled': {
      const session = event.data.object;
      const userId = session.metadata?.user_id;

      console.log(`[KYC] User ${userId} verification canceled`);

      database.prepare(`
        UPDATE kyc_verifications
        SET status = 'failed',
            failed_reason = 'Verification canceled',
            updated_at = strftime('%s', 'now')
        WHERE stripe_session_id = ?
      `).run(session.id);

      return { success: true, status: 'failed', userId };
    }

    default:
      console.log(`[KYC] Unhandled event type: ${event.type}`);
      return { success: true, status: 'ignored' };
  }
}

/**
 * Verify Stripe webhook signature
 * @param {Buffer} payload - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {Object} Verified event
 */
function constructWebhookEvent(payload, signature) {
  const stripeClient = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  return stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ===========================================
// MIDDLEWARE
// ===========================================

/**
 * Middleware: Require KYC verification
 */
function requireKYC(req, res, next) {
  // Skip if KYC not required
  if (process.env.FEATURE_KYC_REQUIRED !== 'true') {
    return next();
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }

  if (!isUserVerified(userId)) {
    return res.status(403).json({
      error: 'KYC verification required',
      code: 'KYC_REQUIRED',
      kycUrl: '/kyc/verify'
    });
  }

  next();
}

module.exports = {
  KYC_STATUS,
  createVerificationSession,
  getVerificationStatus,
  isUserVerified,
  handleWebhook,
  constructWebhookEvent,
  requireKYC,
};
