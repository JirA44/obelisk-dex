/**
 * OBELISK Health Check Routes
 * For monitoring, load balancers, and uptime checks
 * V2.0 - Enhanced auto-verification system
 */

const express = require('express');
const router = express.Router();
const os = require('os');
const path = require('path');
const fs = require('fs');

// Track server start time
const serverStartTime = Date.now();

// Health check state - enhanced
const healthState = {
  binanceConnected: false,
  coinbaseConnected: false,
  krakenConnected: false,
  dbConnected: false, // Will be checked dynamically
  lastPriceUpdate: null,
  errors: [],
  // New metrics V2.0
  wsConnectionCount: 0,
  requestCount: 0,
  lastRequestTime: null,
  priceUpdateCount: 0,
  avgResponseTime: 0,
  responseTimes: [],
  lastHealthCheck: null,
  degradedMode: false,
  degradedReason: null,
  autoCheckInterval: null,
  alerts: [],
};

/**
 * Update health state (called by other modules)
 */
function updateHealthState(key, value) {
  healthState[key] = value;
  if (key === 'error') {
    healthState.errors.push({ time: Date.now(), error: value });
    // Keep only last 10 errors
    if (healthState.errors.length > 10) {
      healthState.errors.shift();
    }
  }
  // Track price updates
  if (key === 'lastPriceUpdate') {
    healthState.priceUpdateCount++;
  }
}

/**
 * Track response time for averaging
 */
function trackResponseTime(ms) {
  healthState.responseTimes.push(ms);
  if (healthState.responseTimes.length > 100) {
    healthState.responseTimes.shift();
  }
  healthState.avgResponseTime = healthState.responseTimes.reduce((a, b) => a + b, 0) / healthState.responseTimes.length;
}

/**
 * Increment request counter
 */
function incrementRequestCount() {
  healthState.requestCount++;
  healthState.lastRequestTime = Date.now();
}

/**
 * Add alert to queue
 */
function addAlert(level, message, details = {}) {
  const alert = {
    id: Date.now(),
    level, // 'info', 'warning', 'critical'
    message,
    details,
    timestamp: new Date().toISOString(),
    acknowledged: false
  };
  healthState.alerts.push(alert);
  // Keep only last 50 alerts
  if (healthState.alerts.length > 50) {
    healthState.alerts.shift();
  }
  console.log(`[HEALTH ALERT] ${level.toUpperCase()}: ${message}`);
  return alert;
}

/**
 * Check database connectivity (SQLite)
 */
async function checkDatabaseHealth() {
  try {
    const dbPath = path.join(__dirname, '..', 'obelisk.db');
    if (fs.existsSync(dbPath)) {
      const Database = require('better-sqlite3');
      const db = new Database(dbPath, { readonly: true });
      db.prepare('SELECT 1').get();
      db.close();
      healthState.dbConnected = true;
      return { ok: true, type: 'sqlite', path: dbPath };
    }
    // No DB file = no DB used, still OK
    healthState.dbConnected = true;
    return { ok: true, type: 'none' };
  } catch (err) {
    healthState.dbConnected = false;
    addAlert('warning', 'Database health check failed', { error: err.message });
    return { ok: false, error: err.message };
  }
}

/**
 * Auto-verification system
 * Runs periodic health checks and triggers alerts
 */
function runAutoCheck() {
  healthState.lastHealthCheck = Date.now();
  const issues = [];

  // Grace period: skip critical alerts during startup (first 30 seconds)
  const uptime = Date.now() - serverStartTime;
  const isStartingUp = uptime < 30000;

  // Check 1: Price feed freshness
  const priceFreshness = healthState.lastPriceUpdate
    ? (Date.now() - healthState.lastPriceUpdate) / 1000
    : Infinity;

  if (priceFreshness > 60 && !isStartingUp) {
    issues.push({ check: 'price_feed', status: 'stale', age: priceFreshness });
    if (priceFreshness > 300) {
      addAlert('critical', `Price feed stale for ${Math.floor(priceFreshness)}s`);
    }
  }

  // Check 2: At least one exchange connected
  const connectedExchanges = [
    healthState.binanceConnected,
    healthState.coinbaseConnected,
    healthState.krakenConnected
  ].filter(Boolean).length;

  if (connectedExchanges === 0 && !isStartingUp) {
    issues.push({ check: 'exchanges', status: 'none_connected' });
    addAlert('critical', 'No exchange connections active');
  } else if (connectedExchanges === 1 && !isStartingUp) {
    issues.push({ check: 'exchanges', status: 'single_source', count: 1 });
    addAlert('warning', 'Only one exchange connected - reduced redundancy');
  }

  // Check 3: Memory usage
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
  const heapPercent = (heapUsedMB / heapTotalMB) * 100;

  if (heapPercent > 90) {
    issues.push({ check: 'memory', status: 'critical', percent: heapPercent });
    addAlert('critical', `Memory usage critical: ${heapPercent.toFixed(1)}%`);
  } else if (heapPercent > 75) {
    issues.push({ check: 'memory', status: 'warning', percent: heapPercent });
    addAlert('warning', `Memory usage high: ${heapPercent.toFixed(1)}%`);
  }

  // Check 4: Error rate
  const recentErrors = healthState.errors.filter(e => Date.now() - e.time < 60000);
  if (recentErrors.length >= 10) {
    issues.push({ check: 'error_rate', status: 'high', count: recentErrors.length });
    addAlert('warning', `High error rate: ${recentErrors.length} errors in last minute`);
  }

  // Check 5: Response time
  if (healthState.avgResponseTime > 1000) {
    issues.push({ check: 'response_time', status: 'slow', avg: healthState.avgResponseTime });
    addAlert('warning', `Slow average response time: ${healthState.avgResponseTime.toFixed(0)}ms`);
  }

  // Set degraded mode if issues found (and not in startup period)
  if (issues.length > 0 && !isStartingUp) {
    healthState.degradedMode = true;
    healthState.degradedReason = issues.map(i => i.check).join(', ');
  } else if (!isStartingUp) {
    healthState.degradedMode = false;
    healthState.degradedReason = null;
  }

  return {
    timestamp: new Date().toISOString(),
    issues,
    degraded: healthState.degradedMode,
    startingUp: isStartingUp,
    uptimeMs: uptime
  };
}

/**
 * Start auto-check interval (every 30 seconds)
 */
function startAutoCheck(intervalMs = 30000) {
  if (healthState.autoCheckInterval) {
    clearInterval(healthState.autoCheckInterval);
  }
  healthState.autoCheckInterval = setInterval(runAutoCheck, intervalMs);
  console.log(`[HEALTH] Auto-check started (every ${intervalMs/1000}s)`);
  // Run immediately
  runAutoCheck();
}

/**
 * Stop auto-check interval
 */
function stopAutoCheck() {
  if (healthState.autoCheckInterval) {
    clearInterval(healthState.autoCheckInterval);
    healthState.autoCheckInterval = null;
    console.log('[HEALTH] Auto-check stopped');
  }
}

/**
 * GET /api/health
 * Basic health check - returns 200 if server is running
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/health/live
 * Liveness probe - is the server alive?
 */
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

/**
 * GET /api/health/ready
 * Readiness probe - is the server ready to accept traffic?
 * V2.0: More robust check - server is ready if it can process requests
 */
router.get('/ready', async (req, res) => {
  // Server is fundamentally ready if Express is responding
  const uptime = Date.now() - serverStartTime;
  const minStartupTime = 5000; // 5s grace period

  // Always ready after startup grace period (server can work without price feeds)
  if (uptime > minStartupTime) {
    // Check if we're in degraded mode
    const hasPriceFeed = healthState.binanceConnected ||
                         healthState.coinbaseConnected ||
                         healthState.krakenConnected ||
                         healthState.lastPriceUpdate;

    res.status(200).json({
      ready: true,
      degraded: healthState.degradedMode,
      degradedReason: healthState.degradedReason,
      priceSource: healthState.binanceConnected ? 'binance' :
                   healthState.coinbaseConnected ? 'coinbase' :
                   healthState.krakenConnected ? 'kraken' :
                   healthState.lastPriceUpdate ? 'cached' : 'none',
      hasPriceFeed,
      uptime: formatUptime(uptime)
    });
  } else {
    // Still starting up
    res.status(503).json({
      ready: false,
      reason: 'Server still starting',
      uptimeMs: uptime,
      remainingMs: minStartupTime - uptime
    });
  }
});

/**
 * GET /api/health/detailed
 * Detailed health info (for dashboards)
 * V2.0: Enhanced with new metrics
 */
router.get('/detailed', async (req, res) => {
  const uptime = Date.now() - serverStartTime;
  const memUsage = process.memoryUsage();

  // Check DB health dynamically
  const dbHealth = await checkDatabaseHealth();

  res.json({
    status: healthState.degradedMode ? 'degraded' : 'ok',
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: {
      ms: uptime,
      human: formatUptime(uptime),
    },
    memory: {
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
      rss: formatBytes(memUsage.rss),
      external: formatBytes(memUsage.external),
      heapPercent: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(1) + '%',
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      loadAvg: os.loadavg(),
      freeMemory: formatBytes(os.freemem()),
      totalMemory: formatBytes(os.totalmem()),
    },
    connections: {
      binance: healthState.binanceConnected,
      coinbase: healthState.coinbaseConnected,
      kraken: healthState.krakenConnected,
      database: dbHealth,
      websockets: healthState.wsConnectionCount,
    },
    performance: {
      requestCount: healthState.requestCount,
      avgResponseTime: `${healthState.avgResponseTime.toFixed(2)}ms`,
      priceUpdateCount: healthState.priceUpdateCount,
      lastRequestTime: healthState.lastRequestTime ? new Date(healthState.lastRequestTime).toISOString() : null,
    },
    lastPriceUpdate: healthState.lastPriceUpdate ? new Date(healthState.lastPriceUpdate).toISOString() : null,
    lastHealthCheck: healthState.lastHealthCheck ? new Date(healthState.lastHealthCheck).toISOString() : null,
    degraded: healthState.degradedMode,
    degradedReason: healthState.degradedReason,
    recentErrors: healthState.errors.slice(-5),
    activeAlerts: healthState.alerts.filter(a => !a.acknowledged).slice(-10),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/health/metrics
 * Prometheus-style metrics
 * V2.0: Enhanced with more metrics
 */
router.get('/metrics', (req, res) => {
  const uptime = (Date.now() - serverStartTime) / 1000;
  const memUsage = process.memoryUsage();
  const priceFreshness = healthState.lastPriceUpdate
    ? (Date.now() - healthState.lastPriceUpdate) / 1000
    : -1;

  const metrics = [
    `# HELP obelisk_uptime_seconds Server uptime in seconds`,
    `# TYPE obelisk_uptime_seconds gauge`,
    `obelisk_uptime_seconds ${uptime.toFixed(2)}`,
    ``,
    `# HELP obelisk_memory_heap_bytes Heap memory usage`,
    `# TYPE obelisk_memory_heap_bytes gauge`,
    `obelisk_memory_heap_bytes{type="used"} ${memUsage.heapUsed}`,
    `obelisk_memory_heap_bytes{type="total"} ${memUsage.heapTotal}`,
    `obelisk_memory_heap_bytes{type="rss"} ${memUsage.rss}`,
    ``,
    `# HELP obelisk_memory_heap_percent Heap memory usage percent`,
    `# TYPE obelisk_memory_heap_percent gauge`,
    `obelisk_memory_heap_percent ${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}`,
    ``,
    `# HELP obelisk_connection_status Connection status (1=up, 0=down)`,
    `# TYPE obelisk_connection_status gauge`,
    `obelisk_connection_status{service="binance"} ${healthState.binanceConnected ? 1 : 0}`,
    `obelisk_connection_status{service="coinbase"} ${healthState.coinbaseConnected ? 1 : 0}`,
    `obelisk_connection_status{service="kraken"} ${healthState.krakenConnected ? 1 : 0}`,
    `obelisk_connection_status{service="database"} ${healthState.dbConnected ? 1 : 0}`,
    ``,
    `# HELP obelisk_websocket_connections Active WebSocket connections`,
    `# TYPE obelisk_websocket_connections gauge`,
    `obelisk_websocket_connections ${healthState.wsConnectionCount}`,
    ``,
    `# HELP obelisk_request_total Total requests processed`,
    `# TYPE obelisk_request_total counter`,
    `obelisk_request_total ${healthState.requestCount}`,
    ``,
    `# HELP obelisk_response_time_avg_ms Average response time in milliseconds`,
    `# TYPE obelisk_response_time_avg_ms gauge`,
    `obelisk_response_time_avg_ms ${healthState.avgResponseTime.toFixed(2)}`,
    ``,
    `# HELP obelisk_price_updates_total Total price updates received`,
    `# TYPE obelisk_price_updates_total counter`,
    `obelisk_price_updates_total ${healthState.priceUpdateCount}`,
    ``,
    `# HELP obelisk_price_freshness_seconds Seconds since last price update (-1 if never)`,
    `# TYPE obelisk_price_freshness_seconds gauge`,
    `obelisk_price_freshness_seconds ${priceFreshness.toFixed(2)}`,
    ``,
    `# HELP obelisk_degraded_mode Server in degraded mode (1=yes, 0=no)`,
    `# TYPE obelisk_degraded_mode gauge`,
    `obelisk_degraded_mode ${healthState.degradedMode ? 1 : 0}`,
    ``,
    `# HELP obelisk_errors_recent Errors in last minute`,
    `# TYPE obelisk_errors_recent gauge`,
    `obelisk_errors_recent ${healthState.errors.filter(e => Date.now() - e.time < 60000).length}`,
    ``,
    `# HELP obelisk_alerts_active Active unacknowledged alerts`,
    `# TYPE obelisk_alerts_active gauge`,
    `obelisk_alerts_active ${healthState.alerts.filter(a => !a.acknowledged).length}`,
    ``,
  ].join('\n');

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

/**
 * GET /api/health/alerts
 * Get all alerts
 */
router.get('/alerts', (req, res) => {
  const { level, acknowledged } = req.query;
  let alerts = [...healthState.alerts];

  if (level) {
    alerts = alerts.filter(a => a.level === level);
  }
  if (acknowledged !== undefined) {
    const ack = acknowledged === 'true';
    alerts = alerts.filter(a => a.acknowledged === ack);
  }

  res.json({
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    alerts: alerts.slice(-50)
  });
});

/**
 * POST /api/health/alerts/:id/acknowledge
 * Acknowledge an alert
 */
router.post('/alerts/:id/acknowledge', (req, res) => {
  const alertId = parseInt(req.params.id);
  const alert = healthState.alerts.find(a => a.id === alertId);

  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  alert.acknowledged = true;
  alert.acknowledgedAt = new Date().toISOString();

  res.json({ success: true, alert });
});

/**
 * POST /api/health/alerts/acknowledge-all
 * Acknowledge all alerts
 */
router.post('/alerts/acknowledge-all', (req, res) => {
  const now = new Date().toISOString();
  let count = 0;

  healthState.alerts.forEach(a => {
    if (!a.acknowledged) {
      a.acknowledged = true;
      a.acknowledgedAt = now;
      count++;
    }
  });

  res.json({ success: true, acknowledgedCount: count });
});

/**
 * GET /api/health/autocheck
 * Run and return auto-check results
 */
router.get('/autocheck', (req, res) => {
  const result = runAutoCheck();
  res.json(result);
});

/**
 * POST /api/health/autocheck/start
 * Start auto-check interval
 */
router.post('/autocheck/start', (req, res) => {
  const intervalMs = parseInt(req.query.interval) || 30000;
  startAutoCheck(intervalMs);
  res.json({ success: true, message: `Auto-check started (interval: ${intervalMs}ms)` });
});

/**
 * POST /api/health/autocheck/stop
 * Stop auto-check interval
 */
router.post('/autocheck/stop', (req, res) => {
  stopAutoCheck();
  res.json({ success: true, message: 'Auto-check stopped' });
});

// Helper functions
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

module.exports = {
  router,
  updateHealthState,
  healthState,
  trackResponseTime,
  incrementRequestCount,
  addAlert,
  checkDatabaseHealth,
  runAutoCheck,
  startAutoCheck,
  stopAutoCheck
};
