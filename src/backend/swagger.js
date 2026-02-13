/**
 * OBELISK API Documentation
 * Swagger/OpenAPI setup
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OBELISK Trading API',
      version: '2.1.0',
      description: `
# OBELISK DEX Trading Platform API

Real-time cryptocurrency trading API with:
- **Live Prices** from Binance, Coinbase, Kraken
- **DEX Aggregation** via Hyperliquid, dYdX, GMX
- **Bot API** for automated trading
- **Passive Products** (staking, vaults, bonds)

## Authentication

### User Authentication
Use JWT tokens in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

### Bot Authentication
Use API keys in the X-API-Key header:
\`\`\`
X-API-Key: obelisk_xxxxx...
\`\`\`

## Rate Limits
- General endpoints: 100 req/min
- Price endpoints: 200 req/min
- Trading endpoints: 30 req/min
- Bot API: 500 req/min
      `,
      contact: {
        name: 'OBELISK Support',
        url: 'https://obelisk.trading',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.obelisk.trading',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        Market: {
          type: 'object',
          properties: {
            pair: { type: 'string', example: 'BTC/USDT' },
            price: { type: 'number', example: 42000.50 },
            change24h: { type: 'number', example: 2.5 },
            volume: { type: 'number', example: 1500000000 },
            high: { type: 'number', example: 43000 },
            low: { type: 'number', example: 41000 },
          },
        },
        Order: {
          type: 'object',
          required: ['pair', 'side', 'amount'],
          properties: {
            pair: { type: 'string', example: 'BTC/USDT' },
            side: { type: 'string', enum: ['buy', 'sell'], example: 'buy' },
            type: { type: 'string', enum: ['market', 'limit'], example: 'limit' },
            amount: { type: 'number', example: 0.1 },
            price: { type: 'number', example: 42000 },
            leverage: { type: 'integer', minimum: 1, maximum: 100, example: 10 },
            stopLoss: { type: 'number', example: 41000 },
            takeProfit: { type: 'number', example: 45000 },
          },
        },
        OrderResponse: {
          type: 'object',
          properties: {
            orderId: { type: 'string', example: 'ord_abc123' },
            status: { type: 'string', example: 'filled' },
            pair: { type: 'string', example: 'BTC/USDT' },
            side: { type: 'string', example: 'buy' },
            amount: { type: 'number', example: 0.1 },
            price: { type: 'number', example: 42000 },
            filledAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Invalid request' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    tags: [
      { name: 'Markets', description: 'Market data and prices' },
      { name: 'Trading', description: 'Order placement and management' },
      { name: 'Portfolio', description: 'Portfolio and positions' },
      { name: 'Bot', description: 'Bot API for automated trading' },
      { name: 'Passive', description: 'Passive income products' },
      { name: 'Health', description: 'Health checks and monitoring' },
    ],
  },
  apis: ['./routes/*.js', './server-ultra.js'],
};

const specs = swaggerJsdoc(options);

// Custom CSS for dark theme
const customCss = `
  .swagger-ui .topbar { display: none }
  .swagger-ui { background: #1a1a2e; }
  .swagger-ui .info .title { color: #00d4ff; }
  .swagger-ui .scheme-container { background: #16213e; }
  .swagger-ui .opblock-tag { color: #eee; }
`;

const setupSwagger = (app) => {
  // Serve Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss,
    customSiteTitle: 'OBELISK API Docs',
    customfavIcon: '/favicon.ico',
  }));

  // Serve raw OpenAPI spec
  app.get('/api/docs/json', (req, res) => {
    res.json(specs);
  });

  app.get('/api/docs/yaml', (req, res) => {
    const yaml = require('yaml');
    res.set('Content-Type', 'text/yaml');
    res.send(yaml.stringify(specs));
  });

  console.log('[SWAGGER] API docs available at /api/docs');
};

module.exports = { setupSwagger, specs };
