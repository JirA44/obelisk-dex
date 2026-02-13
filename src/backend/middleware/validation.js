/**
 * OBELISK Input Validation Middleware
 * Sanitize and validate all user inputs
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
        value: e.value
      }))
    });
  }
  next();
};

// Common validators
const validators = {
  // Trading pair (BTC/USDT, ETH/USDC, etc.)
  pair: param('pair')
    .trim()
    .toUpperCase()
    .matches(/^[A-Z0-9]{2,10}\/[A-Z]{3,5}$/)
    .withMessage('Invalid pair format (expected: BTC/USDT)'),

  // Amount (positive number)
  amount: body('amount')
    .isFloat({ min: 0.00000001, max: 1000000000 })
    .withMessage('Amount must be between 0.00000001 and 1,000,000,000'),

  // Price (positive number)
  price: body('price')
    .optional()
    .isFloat({ min: 0.00000001 })
    .withMessage('Price must be a positive number'),

  // Order side (buy/sell)
  side: body('side')
    .trim()
    .toLowerCase()
    .isIn(['buy', 'sell', 'long', 'short'])
    .withMessage('Side must be buy, sell, long, or short'),

  // Order type
  orderType: body('type')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['market', 'limit', 'stop', 'stop_limit', 'trailing_stop'])
    .withMessage('Invalid order type'),

  // Leverage (1-100)
  leverage: body('leverage')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Leverage must be between 1 and 100'),

  // Email
  email: body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email address'),

  // Password (min 8 chars, 1 uppercase, 1 number)
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  // Wallet address (ETH-like)
  walletAddress: body('address')
    .trim()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address'),

  // Pagination
  page: query('page')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Page must be between 1 and 10000'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),

  // Timeframe
  timeframe: query('timeframe')
    .optional()
    .isIn(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'])
    .withMessage('Invalid timeframe'),

  // Date range
  startDate: query('start')
    .optional()
    .isISO8601()
    .withMessage('Start date must be ISO8601 format'),

  endDate: query('end')
    .optional()
    .isISO8601()
    .withMessage('End date must be ISO8601 format'),

  // Bot name
  botName: body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Bot name must be 1-50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Bot name can only contain letters, numbers, underscores, and hyphens'),

  // UUID
  uuid: param('id')
    .isUUID()
    .withMessage('Invalid ID format'),

  // Sanitize HTML/XSS
  sanitizeString: (field) => body(field)
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage(`${field} must be under 1000 characters`),
};

// Pre-built validation chains for common routes
const validationChains = {
  // POST /api/order
  createOrder: [
    validators.side,
    validators.amount,
    validators.price,
    validators.orderType,
    validators.leverage,
    body('pair').trim().toUpperCase().notEmpty().withMessage('Pair is required'),
    body('stopLoss').optional().isFloat({ min: 0 }).withMessage('Invalid stop loss'),
    body('takeProfit').optional().isFloat({ min: 0 }).withMessage('Invalid take profit'),
    validate,
  ],

  // POST /api/auth/register
  register: [
    validators.email,
    validators.password,
    body('name').optional().trim().isLength({ max: 100 }).escape(),
    validate,
  ],

  // POST /api/auth/login
  login: [
    validators.email,
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],

  // GET /api/ticker/:pair
  ticker: [
    validators.pair,
    validate,
  ],

  // GET /api/trades/:pair
  trades: [
    validators.pair,
    validators.limit,
    validate,
  ],

  // GET /api/price-history/:pair
  priceHistory: [
    validators.pair,
    validators.timeframe,
    validators.limit,
    validate,
  ],

  // POST /api/bot/register
  registerBot: [
    validators.botName,
    body('permissions').optional().isArray().withMessage('Permissions must be an array'),
    validate,
  ],

  // Pagination
  paginated: [
    validators.page,
    validators.limit,
    validate,
  ],
};

module.exports = {
  validate,
  validators,
  validationChains,
};
