/**
 * OBELISK Graceful Shutdown Handler
 * Clean shutdown for production deployments
 */

const { logger } = require('./logging');

// Track active connections
let activeConnections = new Set();
let isShuttingDown = false;

/**
 * Track connections middleware
 */
function trackConnections(server) {
  server.on('connection', (socket) => {
    activeConnections.add(socket);
    socket.on('close', () => activeConnections.delete(socket));
  });
}

/**
 * Graceful shutdown handler
 */
function setupGracefulShutdown(server, options = {}) {
  const {
    timeout = 30000, // 30 seconds max shutdown time
    onShutdown = async () => {}, // Custom cleanup function
  } = options;

  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\n[SHUTDOWN] Received ${signal}, starting graceful shutdown...`);
    logger?.info?.('Shutdown initiated', { signal });

    // Stop accepting new connections
    server.close(() => {
      console.log('[SHUTDOWN] HTTP server closed');
    });

    // Close existing connections gracefully
    for (const socket of activeConnections) {
      socket.end();
    }

    // Set hard timeout for forced exit
    const forceExit = setTimeout(() => {
      console.error('[SHUTDOWN] Forced exit after timeout');
      process.exit(1);
    }, timeout);

    try {
      // Run custom cleanup
      await onShutdown();

      // Close WebSocket connections
      if (global.wss) {
        global.wss.clients.forEach((client) => {
          client.close(1001, 'Server shutting down');
        });
        console.log('[SHUTDOWN] WebSocket connections closed');
      }

      // Close database connections
      if (global.db?.close) {
        await global.db.close();
        console.log('[SHUTDOWN] Database connection closed');
      }

      // Clear timers and intervals
      clearTimeout(forceExit);

      console.log('[SHUTDOWN] Graceful shutdown complete');
      logger?.info?.('Shutdown complete');
      process.exit(0);

    } catch (error) {
      console.error('[SHUTDOWN] Error during shutdown:', error);
      logger?.error?.('Shutdown error', error);
      process.exit(1);
    }
  };

  // Handle different signals
  process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker/K8s stop
  process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
  process.on('SIGHUP', () => shutdown('SIGHUP'));   // Terminal closed

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('[FATAL] Uncaught exception:', error);
    logger?.error?.('Uncaught exception', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled rejection:', reason);
    logger?.error?.('Unhandled rejection', { reason });
    // Don't shutdown on unhandled rejection, just log
  });

  return { trackConnections: () => trackConnections(server) };
}

/**
 * Health check for shutdown state
 */
function isHealthy() {
  return !isShuttingDown;
}

module.exports = {
  setupGracefulShutdown,
  trackConnections,
  isHealthy,
};
