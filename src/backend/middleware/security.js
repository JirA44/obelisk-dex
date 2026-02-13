/**
 * OBELISK Security Middleware
 * Production-ready security for real users
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiters by endpoint type
const rateLimiters = {
  // General API - 100 req/min
  general: rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests', code: 'RATE_LIMIT', retryAfter: 60 },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Auth endpoints - 5 req/min (prevent brute force)
  auth: rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: 'Too many auth attempts', code: 'AUTH_RATE_LIMIT', retryAfter: 60 },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Trading endpoints - 30 req/min
  trading: rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Trading rate limit reached', code: 'TRADE_RATE_LIMIT', retryAfter: 60 },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Price data - 200 req/min (high frequency allowed)
  prices: rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    message: { error: 'Price API rate limit', code: 'PRICE_RATE_LIMIT', retryAfter: 60 },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Bot API - 500 req/min (automated trading)
  bot: rateLimit({
    windowMs: 60 * 1000,
    max: 500,
    message: { error: 'Bot rate limit reached', code: 'BOT_RATE_LIMIT', retryAfter: 60 },
    standardHeaders: true,
    legacyHeaders: false,
  }),
};

// Helmet security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for widgets
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// CORS configuration for production
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://obelisk-dex.pages.dev',
      'https://master.obelisk-dex.pages.dev',
      'https://obelisk.trading',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];

    // Allow requests with no origin (mobile apps, curl, same-origin)
    // Also allow any Cloudflare Pages subdomain for obelisk-dex
    const isCloudflarePages = origin && origin.match(/^https:\/\/[a-z0-9]+\.obelisk-dex\.pages\.dev$/);
    if (!origin || allowedOrigins.includes(origin) || isCloudflarePages) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Bot-Token', 'X-CSRF-Token'],
  maxAge: 86400, // 24h preflight cache
};

// NoSQL Injection Protection middleware
const noSqlInjectionProtection = (req, res, next) => {
  const dangerousPatterns = ['$gt', '$lt', '$ne', '$eq', '$regex', '$where', '$or', '$and', '$not', '$exists'];

  const checkObject = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) return false;

    for (const key of Object.keys(obj)) {
      if (dangerousPatterns.includes(key)) {
        console.warn(`[SECURITY] NoSQL injection blocked: ${key} in ${path}`);
        return true;
      }
      if (typeof obj[key] === 'object' && checkObject(obj[key], `${path}.${key}`)) {
        return true;
      }
    }
    return false;
  };

  if (req.body && checkObject(req.body, 'body')) {
    return res.status(400).json({ error: 'Invalid request format', code: 'INVALID_INPUT' });
  }
  if (req.query && checkObject(req.query, 'query')) {
    return res.status(400).json({ error: 'Invalid query format', code: 'INVALID_QUERY' });
  }

  next();
};

// Parameter pollution protection
const parameterPollutionProtection = (req, res, next) => {
  // Only allow first value for each query parameter
  for (const key of Object.keys(req.query)) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][0];
    }
  }
  next();
};

// IP whitelist for admin routes
const adminWhitelist = new Set([
  '127.0.0.1',
  '::1',
  // Add production admin IPs here
]);

const adminOnly = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (adminWhitelist.has(ip) || req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required', code: 'FORBIDDEN' });
  }
};

module.exports = {
  rateLimiters,
  securityHeaders,
  corsOptions,
  adminOnly,
  noSqlInjectionProtection,
  parameterPollutionProtection,
};
