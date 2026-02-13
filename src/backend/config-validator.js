/**
 * OBELISK Configuration Validator
 * Validates required environment variables on startup
 *
 * Usage:
 *   const { validateConfig } = require('./config-validator');
 *   validateConfig(); // Throws if critical config missing
 */

const REQUIRED_CONFIGS = {
    // Critical - app won't start without these
    critical: [
        // None required for basic startup, but warn if missing
    ],

    // Production-only requirements
    production: [
        'ADMIN_API_KEY',
        'ALLOWED_ORIGINS',
        'SENTRY_DSN'
    ],

    // Recommended but not blocking
    recommended: [
        'SENTRY_DSN',
        'ADMIN_API_KEY',
        'RESEND_API_KEY',
        'COINGECKO_API_KEY'
    ]
};

const CONFIG_DESCRIPTIONS = {
    ADMIN_API_KEY: 'API key for admin endpoints (generate: openssl rand -hex 32)',
    ALLOWED_ORIGINS: 'Comma-separated list of allowed CORS origins',
    SENTRY_DSN: 'Sentry.io DSN for error tracking (get from sentry.io)',
    RESEND_API_KEY: 'Resend.com API key for email notifications',
    COINGECKO_API_KEY: 'CoinGecko API key for price data (optional, has free tier)',
    JWT_SECRET: 'Secret for JWT tokens (generate: openssl rand -hex 64)',
    DATABASE_URL: 'Database connection string (for PostgreSQL migration)',
    FIREBASE_PROJECT_ID: 'Firebase project ID for authentication',
    FIREBASE_PRIVATE_KEY: 'Firebase service account private key',
    FIREBASE_CLIENT_EMAIL: 'Firebase service account email'
};

function validateConfig(options = {}) {
    const { exitOnError = true, silent = false } = options;
    const isProduction = process.env.NODE_ENV === 'production';
    const errors = [];
    const warnings = [];

    // Check critical configs
    REQUIRED_CONFIGS.critical.forEach(key => {
        if (!process.env[key]) {
            errors.push({
                key,
                message: `Missing critical config: ${key}`,
                description: CONFIG_DESCRIPTIONS[key] || 'No description'
            });
        }
    });

    // Check production requirements
    if (isProduction) {
        REQUIRED_CONFIGS.production.forEach(key => {
            if (!process.env[key]) {
                errors.push({
                    key,
                    message: `Missing production config: ${key}`,
                    description: CONFIG_DESCRIPTIONS[key] || 'No description'
                });
            }
        });
    }

    // Check recommended configs (warnings only)
    REQUIRED_CONFIGS.recommended.forEach(key => {
        if (!process.env[key]) {
            warnings.push({
                key,
                message: `Missing recommended config: ${key}`,
                description: CONFIG_DESCRIPTIONS[key] || 'No description'
            });
        }
    });

    // Security checks
    if (process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY.length < 32) {
        warnings.push({
            key: 'ADMIN_API_KEY',
            message: 'ADMIN_API_KEY is too short (should be at least 32 chars)',
            description: 'Use: openssl rand -hex 32'
        });
    }

    if (isProduction && process.env.NODE_ENV === 'production') {
        if (!process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS === '*') {
            errors.push({
                key: 'ALLOWED_ORIGINS',
                message: 'CORS must be restricted in production',
                description: 'Set specific origins, e.g., https://obelisk.app'
            });
        }
    }

    // Print results
    if (!silent) {
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║          OBELISK Configuration Validation                ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);

        if (errors.length > 0) {
            console.log('❌ ERRORS (blocking):');
            errors.forEach(e => {
                console.log(`   • ${e.key}: ${e.message}`);
                console.log(`     → ${e.description}\n`);
            });
        }

        if (warnings.length > 0) {
            console.log('⚠️  WARNINGS (non-blocking):');
            warnings.forEach(w => {
                console.log(`   • ${w.key}: ${w.message}`);
            });
            console.log('');
        }

        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ All configurations valid!\n');
        } else if (errors.length === 0) {
            console.log('✅ Configuration OK (with warnings)\n');
        }
    }

    // Handle errors - Cloud Run: warn but don't exit
    const isCloudRun = process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT;
    if (errors.length > 0 && exitOnError && isProduction && !isCloudRun) {
        console.error('\n🛑 Cannot start in production with missing critical configs.');
        console.error('   Fix the above errors and restart.\n');
        process.exit(1);
    } else if (errors.length > 0 && isCloudRun) {
        console.warn('\n⚠️  Missing configs (continuing anyway for Cloud Run)');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

function printEnvTemplate() {
    console.log('\n# OBELISK Environment Template');
    console.log('# Copy to .env and fill in values\n');

    Object.entries(CONFIG_DESCRIPTIONS).forEach(([key, desc]) => {
        console.log(`# ${desc}`);
        console.log(`${key}=\n`);
    });
}

module.exports = {
    validateConfig,
    printEnvTemplate,
    REQUIRED_CONFIGS,
    CONFIG_DESCRIPTIONS
};
