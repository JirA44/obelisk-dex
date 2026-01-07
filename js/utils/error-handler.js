/**
 * GLOBAL ERROR HANDLER - Obelisk DEX
 * Catches uncaught errors and provides user-friendly messages
 */
const ErrorHandler = {
    errors: [],
    maxErrors: 50,

    init() {
        // Global error handler
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError({
                type: 'error',
                message: message,
                source: source,
                line: lineno,
                col: colno,
                stack: error?.stack
            });
            return true; // Prevent default browser error handling
        };

        // Unhandled promise rejection handler
        window.onunhandledrejection = (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack
            });
        };

        console.log('ErrorHandler initialized');
    },

    handleError(errorInfo) {
        // Log to console
        console.error('ErrorHandler caught:', errorInfo);

        // Store error
        this.errors.push({
            ...errorInfo,
            timestamp: Date.now()
        });

        // Limit stored errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Show user-friendly notification for critical errors
        if (this.isCriticalError(errorInfo)) {
            this.showErrorNotification(errorInfo);
        }
    },

    isCriticalError(errorInfo) {
        const criticalPatterns = [
            'localStorage',
            'IndexedDB',
            'wallet',
            'transaction',
            'failed to fetch'
        ];
        const msg = (errorInfo.message || '').toLowerCase();
        return criticalPatterns.some(p => msg.includes(p));
    },

    showErrorNotification(errorInfo) {
        if (typeof showNotification === 'function') {
            showNotification('An error occurred. Please refresh if issues persist.', 'error');
        }
    },

    getErrors() {
        return [...this.errors];
    },

    clearErrors() {
        this.errors = [];
    },

    // Safe function wrapper
    safe(fn, fallback = null) {
        return function(...args) {
            try {
                const result = fn.apply(this, args);
                if (result instanceof Promise) {
                    return result.catch(e => {
                        ErrorHandler.handleError({
                            type: 'async',
                            message: e.message,
                            stack: e.stack
                        });
                        return fallback;
                    });
                }
                return result;
            } catch (e) {
                ErrorHandler.handleError({
                    type: 'sync',
                    message: e.message,
                    stack: e.stack
                });
                return fallback;
            }
        };
    }
};

// Auto-init
ErrorHandler.init();
window.ErrorHandler = ErrorHandler;
