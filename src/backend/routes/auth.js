/**
 * OBELISK Authentication Routes
 * User registration, login, and API key management
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  generateToken,
  generateApiKey,
  hashPassword,
  verifyPassword,
  authenticateUser,
  users,
  apiKeys,
} = require('../middleware/auth');
const { validationChains, validate } = require('../middleware/validation');

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', validationChains.register, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    if (users.has(email)) {
      return res.status(409).json({
        error: 'Email already registered',
        code: 'USER_EXISTS'
      });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const userId = require('crypto').randomUUID();

    users.set(email, {
      id: userId,
      email,
      name: name || email.split('@')[0],
      passwordHash,
      role: 'user',
      createdAt: Date.now(),
    });

    // Generate token
    const token = generateToken({ id: userId, email, role: 'user' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        name: name || email.split('@')[0],
      }
    });
  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    res.status(500).json({ error: 'Registration failed', code: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validationChains.login, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ error: 'Login failed', code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticateUser, (req, res) => {
  const user = users.get(req.user.email);

  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    name: user?.name,
    createdAt: user?.createdAt,
  });
});

/**
 * POST /api/auth/api-key
 * Generate API key for bot trading
 */
router.post('/api-key', authenticateUser, validationChains.registerBot, (req, res) => {
  const { name, permissions = ['read', 'trade'] } = req.body;

  const { botId, apiKey } = generateApiKey(name, permissions);

  res.status(201).json({
    success: true,
    botId,
    apiKey,
    name,
    permissions,
    warning: 'Save this API key - it will not be shown again!'
  });
});

/**
 * GET /api/auth/api-keys
 * List user's API keys (redacted)
 */
router.get('/api-keys', authenticateUser, (req, res) => {
  const userKeys = [];

  apiKeys.forEach((value, key) => {
    userKeys.push({
      botId: value.botId,
      name: value.name,
      keyPreview: key.slice(0, 15) + '...',
      permissions: value.permissions,
      createdAt: value.createdAt,
      lastUsed: value.lastUsed,
      requests: value.requests,
    });
  });

  res.json({ apiKeys: userKeys });
});

/**
 * DELETE /api/auth/api-key/:botId
 * Revoke an API key
 */
router.delete('/api-key/:botId', authenticateUser, (req, res) => {
  const { botId } = req.params;

  let deleted = false;
  apiKeys.forEach((value, key) => {
    if (value.botId === botId) {
      apiKeys.delete(key);
      deleted = true;
    }
  });

  if (deleted) {
    res.json({ success: true, message: 'API key revoked' });
  } else {
    res.status(404).json({ error: 'API key not found', code: 'NOT_FOUND' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateUser, (req, res) => {
  const token = generateToken({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  });

  res.json({ token });
});

module.exports = router;
