/**
 * Obelisk Standardized Error Handler
 * Format: { success, error: { code, message }, timestamp }
 */

class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode || 500;
        this.code = code || 'INTERNAL_ERROR';
        this.isOperational = true;
    }
}

// Wrap async route handlers to catch errors
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Final error handling middleware
function errorHandler(err, req, res, _next) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';

    // Log non-operational errors
    if (!err.isOperational) {
        console.error('[ERROR]', err.stack || err.message);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code: code,
            message: err.isOperational ? err.message : 'An unexpected error occurred'
        },
        timestamp: Date.now()
    });
}

// 404 handler
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`
        },
        timestamp: Date.now()
    });
}

module.exports = { AppError, asyncHandler, errorHandler, notFoundHandler };
