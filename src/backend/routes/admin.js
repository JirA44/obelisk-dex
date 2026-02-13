/**
 * OBELISK Admin API
 * Protected endpoints for platform administration
 */

const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs');
const path = require('path');

// Admin API key verification
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const requireAdmin = (req, res, next) => {
  const apiKey = req.headers['x-admin-key'] || req.query.adminKey;

  if (!ADMIN_API_KEY) {
    return res.status(503).json({
      error: 'Admin API not configured',
      code: 'ADMIN_NOT_CONFIGURED'
    });
  }

  if (apiKey !== ADMIN_API_KEY) {
    return res.status(403).json({
      error: 'Invalid admin key',
      code: 'FORBIDDEN'
    });
  }

  next();
};

// Apply admin auth to all routes
router.use(requireAdmin);

// ===========================================
// DASHBOARD STATS
// ===========================================

router.get('/stats', async (req, res) => {
  try {
    const stats = {
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: os.loadavg(),
        platform: os.platform(),
        nodeVersion: process.version,
      },
      system: {
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
      },
      // Add database stats if available
      database: await getDatabaseStats(),
      // Add trading stats
      trading: getTradingStats(),
    };

    res.json(stats);
  } catch (error) {
    console.error('[ADMIN] Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ===========================================
// USER MANAGEMENT
// ===========================================

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    // Get from database or memory
    const users = await getUsers({ offset, limit, search });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length,
      }
    });
  } catch (error) {
    console.error('[ADMIN] Users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'trader', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await updateUserRole(req.params.id, role);
    res.json({ success: true, message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.post('/users/:id/ban', async (req, res) => {
  try {
    const { reason, duration } = req.body;
    await banUser(req.params.id, reason, duration);
    res.json({ success: true, message: 'User banned' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

router.post('/users/:id/unban', async (req, res) => {
  try {
    await unbanUser(req.params.id);
    res.json({ success: true, message: 'User unbanned' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// ===========================================
// TRADING OVERVIEW
// ===========================================

router.get('/trading/summary', (req, res) => {
  const { period = '24h' } = req.query;

  res.json({
    period,
    totalVolume: globalStats.totalVolume || 0,
    totalTrades: globalStats.totalTrades || 0,
    totalFees: globalStats.totalFees || 0,
    activeUsers: globalStats.activeUsers || 0,
    topPairs: globalStats.topPairs || [],
  });
});

router.get('/trading/fees', (req, res) => {
  res.json({
    totalCollected: globalStats.totalFees || 0,
    today: globalStats.feesToday || 0,
    thisMonth: globalStats.feesMonth || 0,
    feeRate: 0.001, // 0.1%
    feeWallet: process.env.FEE_WALLET || 'Not configured',
  });
});

// ===========================================
// SYSTEM MANAGEMENT
// ===========================================

router.get('/logs', (req, res) => {
  try {
    const { lines = 100, type = 'out' } = req.query;
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, type === 'error' ? 'error.log' : 'access.log');

    if (!fs.existsSync(logFile)) {
      return res.json({ logs: [], message: 'Log file not found' });
    }

    const content = fs.readFileSync(logFile, 'utf8');
    const logLines = content.split('\n').slice(-lines);

    res.json({ logs: logLines });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

router.post('/cache/clear', (req, res) => {
  try {
    // Clear any in-memory caches
    if (global.priceCache) global.priceCache.clear();
    if (global.sessionCache) global.sessionCache.clear();

    res.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

router.get('/connections', (req, res) => {
  res.json({
    websocket: {
      clients: global.wss?.clients?.size || 0,
    },
    exchanges: {
      binance: global.binanceConnected || false,
      coinbase: global.coinbaseConnected || false,
      kraken: global.krakenConnected || false,
    },
    database: true,
  });
});

// ===========================================
// ANNOUNCEMENTS
// ===========================================

let announcements = [];

router.get('/announcements', (req, res) => {
  res.json({ announcements });
});

router.post('/announcements', (req, res) => {
  const { title, message, type = 'info', expiresAt } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message required' });
  }

  const announcement = {
    id: Date.now().toString(),
    title,
    message,
    type,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
  };

  announcements.unshift(announcement);

  // Keep only last 20
  if (announcements.length > 20) {
    announcements = announcements.slice(0, 20);
  }

  res.status(201).json(announcement);
});

router.delete('/announcements/:id', (req, res) => {
  announcements = announcements.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

// ===========================================
// MAINTENANCE MODE
// ===========================================

let maintenanceMode = {
  enabled: false,
  message: '',
  estimatedEnd: null,
};

router.get('/maintenance', (req, res) => {
  res.json(maintenanceMode);
});

router.post('/maintenance', (req, res) => {
  const { enabled, message, estimatedEnd } = req.body;

  maintenanceMode = {
    enabled: enabled || false,
    message: message || 'System maintenance in progress',
    estimatedEnd: estimatedEnd || null,
    updatedAt: new Date().toISOString(),
  };

  // Broadcast to WebSocket clients
  if (global.wss) {
    global.wss.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'maintenance',
        data: maintenanceMode
      }));
    });
  }

  res.json(maintenanceMode);
});

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Global stats object (populate from your actual data sources)
const globalStats = {
  totalVolume: 0,
  totalTrades: 0,
  totalFees: 0,
  activeUsers: 0,
  topPairs: [],
};

async function getDatabaseStats() {
  try {
    // Return database stats if persistent DB is available
    return {
      type: 'sqlite',
      size: 'N/A',
      tables: ['users', 'sessions', 'api_keys', 'trades'],
    };
  } catch (e) {
    return { error: e.message };
  }
}

function getTradingStats() {
  return {
    activePairs: 23,
    priceUpdates: 'real-time',
    sources: ['Binance', 'Coinbase', 'Kraken', 'Hyperliquid', 'dYdX'],
  };
}

async function getUsers({ offset, limit, search }) {
  // Implement based on your database
  return [];
}

async function getUserById(id) {
  // Implement based on your database
  return null;
}

async function updateUserRole(id, role) {
  // Implement based on your database
}

async function banUser(id, reason, duration) {
  // Implement based on your database
}

async function unbanUser(id) {
  // Implement based on your database
}

// Export maintenance mode for middleware
router.getMaintenanceMode = () => maintenanceMode;
router.getAnnouncements = () => announcements.filter(a => {
  if (!a.expiresAt) return true;
  return new Date(a.expiresAt) > new Date();
});

module.exports = router;
