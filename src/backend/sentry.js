/**
 * OBELISK Sentry Integration
 * Error tracking and monitoring for production
 *
 * Setup:
 * 1. npm install @sentry/node
 * 2. Set SENTRY_DSN in .env
 * 3. Import this file at the top of server-ultra.js
 */

// Check if Sentry is available
let Sentry = null;

function initSentry() {
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
        console.log('[SENTRY] No DSN configured, error tracking disabled');
        return null;
    }

    try {
        Sentry = require('@sentry/node');

        Sentry.init({
            dsn,
            environment: process.env.NODE_ENV || 'development',
            release: 'obelisk@4.1.0',

            // Performance monitoring (optional)
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

            // Filter sensitive data
            beforeSend(event) {
                // Remove sensitive headers
                if (event.request?.headers) {
                    delete event.request.headers.authorization;
                    delete event.request.headers['x-api-key'];
                    delete event.request.headers.cookie;
                }

                // Remove sensitive data from breadcrumbs
                if (event.breadcrumbs) {
                    event.breadcrumbs = event.breadcrumbs.map(b => {
                        if (b.data?.url?.includes('api-key')) {
                            b.data.url = '[REDACTED]';
                        }
                        return b;
                    });
                }

                return event;
            },

            // Ignore certain errors
            ignoreErrors: [
                'ECONNRESET',
                'EPIPE',
                'ETIMEDOUT',
                'socket hang up',
                'WebSocket is not open'
            ]
        });

        console.log('[SENTRY] Error tracking initialized');
        return Sentry;
    } catch (e) {
        console.log('[SENTRY] Failed to initialize:', e.message);
        console.log('[SENTRY] Run: npm install @sentry/node');
        return null;
    }
}

// Express error handler middleware
function sentryErrorHandler() {
    if (!Sentry) return (err, req, res, next) => next(err);

    return Sentry.Handlers.errorHandler({
        shouldHandleError(error) {
            // Capture 500 errors and above
            return !error.status || error.status >= 500;
        }
    });
}

// Express request handler middleware
function sentryRequestHandler() {
    if (!Sentry) return (req, res, next) => next();
    return Sentry.Handlers.requestHandler();
}

// Capture custom error
function captureError(error, context = {}) {
    if (!Sentry) {
        console.error('[ERROR]', error);
        return;
    }

    Sentry.withScope(scope => {
        Object.entries(context).forEach(([key, value]) => {
            scope.setExtra(key, value);
        });
        Sentry.captureException(error);
    });
}

// Capture custom message
function captureMessage(message, level = 'info', context = {}) {
    if (!Sentry) {
        console.log(`[${level.toUpperCase()}]`, message);
        return;
    }

    Sentry.withScope(scope => {
        Object.entries(context).forEach(([key, value]) => {
            scope.setExtra(key, value);
        });
        Sentry.captureMessage(message, level);
    });
}

// Set user context (for authenticated requests)
function setUser(user) {
    if (!Sentry) return;

    Sentry.setUser({
        id: user.wallet || user.id,
        // Don't send email/IP unless necessary for GDPR
    });
}

// Clear user context
function clearUser() {
    if (!Sentry) return;
    Sentry.setUser(null);
}

// Add breadcrumb for debugging
function addBreadcrumb(message, category = 'custom', data = {}) {
    if (!Sentry) return;

    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info'
    });
}

module.exports = {
    initSentry,
    sentryErrorHandler,
    sentryRequestHandler,
    captureError,
    captureMessage,
    setUser,
    clearUser,
    addBreadcrumb
};
