/**
 * OBELISK Authentication Middleware
 * JWT-based auth for users and API keys for bots
 *
 * V2.0 - Persistent storage via SQLite
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');

// Use fixed JWT_SECRET from .env (CRITICAL for session persistence)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'CHANGE_ME_GENERATE_NEW_SECRET') {
  console.error('CRITICAL: JWT_SECRET not set in .env - server cannot start safely!');
  console.error('   Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}
const JWT_EXPIRES = '24h'; // Reduced from 7d for security

// ===========================================
// SQLite Persistence for API Keys & Sessions
// ===========================================
let db = null;
let apiKeysCache = new Map(); // In-memory cache backed by DB

function initDatabase() {
  if (db) return db;

  try {
    const Database = require('better-sqlite3');
    const dbPath = path.join(__dirname, '..', 'obelisk.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    // Create API keys table
    db.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        api_key TEXT PRIMARY KEY,
        bot_id TEXT UNIQUE NOT NULL,
        bot_name TEXT NOT NULL,
        permissions TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        last_used INTEGER,
        requests INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
      )
    `);

    // Create index for faster lookups
    db.exec(`CREATE INDEX IF NOT EXISTS idx_api_keys_bot_id ON api_keys(bot_id)`);

    // Load existing keys into cache
    const rows = db.prepare('SELECT * FROM api_keys WHERE is_active = 1').all();
    for (const row of rows) {
      apiKeysCache.set(row.api_key, {
        botId: row.bot_id,
        name: row.bot_name,
        permissions: JSON.parse(row.permissions),
        createdAt: row.created_at * 1000,
        lastUsed: row.last_used ? row.last_used * 1000 : null,
        requests: row.requests
      });
    }

    console.log(`🔐 Auth: Loaded ${apiKeysCache.size} API keys from database`);
    return db;
  } catch (err) {
    console.error('⚠️ Auth: Database not available, using in-memory storage');
    return null;
  }
}

// Initialize on module load
initDatabase();

// Legacy in-memory stores (fallback if DB fails)
const users = new Map(); // email -> { id, passwordHash, role, createdAt }

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      wallet: user.wallet_address,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Generate API key for bot (persisted to SQLite)
 */
function generateApiKey(botName, permissions = ['read', 'trade']) {
  const key = `obelisk_${crypto.randomBytes(32).toString('hex')}`;
  const botId = crypto.randomUUID();

  const botData = {
    botId,
    name: botName,
    permissions,
    createdAt: Date.now(),
    lastUsed: null,
    requests: 0,
  };

  // Save to database
  if (db) {
    try {
      const stmt = db.prepare(`
        INSERT INTO api_keys (api_key, bot_id, bot_name, permissions)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(key, botId, botName, JSON.stringify(permissions));
    } catch (err) {
      console.error('Failed to persist API key:', err.message);
    }
  }

  // Always update cache
  apiKeysCache.set(key, botData);

  return { botId, apiKey: key };
}

/**
 * Get API key data
 */
function getApiKey(apiKey) {
  return apiKeysCache.get(apiKey);
}

/**
 * Update API key usage stats
 */
function updateApiKeyUsage(apiKey) {
  const bot = apiKeysCache.get(apiKey);
  if (!bot) return;

  bot.lastUsed = Date.now();
  bot.requests++;

  // Update database (debounced - every 10 requests)
  if (db && bot.requests % 10 === 0) {
    try {
      db.prepare(`
        UPDATE api_keys SET last_used = ?, requests = ? WHERE api_key = ?
      `).run(Math.floor(bot.lastUsed / 1000), bot.requests, apiKey);
    } catch (err) {
      // Silently fail - cache is authoritative
    }
  }
}

/**
 * Revoke API key
 */
function revokeApiKey(apiKey) {
  apiKeysCache.delete(apiKey);

  if (db) {
    try {
      db.prepare('UPDATE api_keys SET is_active = 0 WHERE api_key = ?').run(apiKey);
    } catch (err) {
      console.error('Failed to revoke API key:', err.message);
    }
  }
}

/**
 * List all API keys for a bot
 */
function listApiKeys() {
  return Array.from(apiKeysCache.entries()).map(([key, data]) => ({
    apiKey: key.slice(0, 16) + '...',
    botId: data.botId,
    name: data.name,
    permissions: data.permissions,
    createdAt: data.createdAt,
    lastUsed: data.lastUsed,
    requests: data.requests
  }));
}

/**
 * Middleware: Authenticate user via JWT
 * Checks: 1) HttpOnly cookie, 2) Authorization header (backward compat)
 */
function authenticateUser(req, res, next) {
  // Try HttpOnly cookie first (preferred)
  let token = req.cookies?.auth_token;

  // Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }

  req.user = decoded;
  next();
}

/**
 * Middleware: Authenticate bot via API key
 */
function authenticateBot(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['x-bot-token'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      code: 'API_KEY_REQUIRED'
    });
  }

  const bot = getApiKey(apiKey);
  if (!bot) {
    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }

  // Update usage stats
  updateApiKeyUsage(apiKey);

  req.bot = bot;
  next();
}

/**
 * Middleware: Optional auth (user or bot, or anonymous)
 */
function optionalAuth(req, res, next) {
  // Try HttpOnly cookie first
  const cookieToken = req.cookies?.auth_token;
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (cookieToken) {
    const decoded = verifyToken(cookieToken);
    if (decoded) req.user = decoded;
  } else if (authHeader?.startsWith('Bearer ')) {
    const decoded = verifyToken(authHeader.slice(7));
    if (decoded) req.user = decoded;
  } else if (apiKey) {
    const bot = getApiKey(apiKey);
    if (bot) {
      updateApiKeyUsage(apiKey);
      req.bot = bot;
    }
  }

  next();
}

/**
 * Middleware: Require specific permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    // Admin users have all permissions
    if (req.user?.role === 'admin') {
      return next();
    }

    // Check bot permissions
    if (req.bot?.permissions?.includes(permission)) {
      return next();
    }

    // Check user role permissions
    const rolePermissions = {
      admin: ['*'],
      trader: ['read', 'trade'],
      user: ['read'],
    };

    const userPerms = rolePermissions[req.user?.role] || [];
    if (userPerms.includes('*') || userPerms.includes(permission)) {
      return next();
    }

    res.status(403).json({
      error: `Permission '${permission}' required`,
      code: 'FORBIDDEN'
    });
  };
}

/**
 * Hash password for storage
 */
async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  return bcrypt.hash(password, 12);
}

/**
 * Verify password
 */
async function verifyPassword(password, hash) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hash);
}

module.exports = {
  generateToken,
  verifyToken,
  generateApiKey,
  getApiKey,
  revokeApiKey,
  listApiKeys,
  authenticateUser,
  authenticateBot,
  optionalAuth,
  requirePermission,
  hashPassword,
  verifyPassword,
  apiKeys: apiKeysCache, // For backward compatibility
  users,
  JWT_SECRET,
};
