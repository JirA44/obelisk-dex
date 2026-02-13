/**
 * OBELISK Request Logging
 * Production-ready logging with morgan
 */

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Custom tokens
morgan.token('user-id', (req) => req.user?.id || req.bot?.botId || 'anonymous');
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) return '-';
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(2);
});

// Log formats
const formats = {
  // Development: colored, human readable
  dev: ':method :url :status :response-time-ms ms - :res[content-length]',

  // Production: JSON for log aggregation
  production: JSON.stringify({
    timestamp: ':date[iso]',
    method: ':method',
    url: ':url',
    status: ':status',
    responseTime: ':response-time-ms',
    contentLength: ':res[content-length]',
    userAgent: ':user-agent',
    ip: ':remote-addr',
    userId: ':user-id',
  }),

  // Combined (Apache-style)
  combined: ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
};

/**
 * Create logging middleware
 */
function createLogger(options = {}) {
  const {
    format = process.env.NODE_ENV === 'production' ? 'production' : 'dev',
    logToFile = process.env.NODE_ENV === 'production',
    logDir = path.join(process.cwd(), 'logs'),
  } = options;

  const middlewares = [];

  // Console logging
  middlewares.push(morgan(formats[format] || format, {
    skip: (req) => req.url === '/api/health', // Skip health checks
  }));

  // File logging in production
  if (logToFile) {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Access log
    const accessLogStream = fs.createWriteStream(
      path.join(logDir, 'access.log'),
      { flags: 'a' }
    );
    middlewares.push(morgan(formats.combined, { stream: accessLogStream }));

    // Error log (4xx and 5xx only)
    const errorLogStream = fs.createWriteStream(
      path.join(logDir, 'error.log'),
      { flags: 'a' }
    );
    middlewares.push(morgan(formats.combined, {
      stream: errorLogStream,
      skip: (req, res) => res.statusCode < 400,
    }));
  }

  return middlewares;
}

/**
 * Request timing middleware
 */
function requestTiming(req, res, next) {
  req.startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;

    // Log slow requests (> 1s)
    if (duration > 1000) {
      console.warn(`[SLOW] ${req.method} ${req.url} took ${duration}ms`);
    }
  });

  next();
}

/**
 * Structured logger for application events
 */
const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...data,
    }));
  },

  warn: (message, data = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...data,
    }));
  },

  error: (message, error = {}, data = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error.message || error,
      stack: error.stack,
      ...data,
    }));
  },

  trade: (action, details) => {
    console.log(JSON.stringify({
      level: 'trade',
      timestamp: new Date().toISOString(),
      action,
      ...details,
    }));
  },
};

module.exports = {
  createLogger,
  requestTiming,
  logger,
  formats,
};
