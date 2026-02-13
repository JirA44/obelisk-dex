/**
 * OBELISK Minimal Server - For Cloud Run testing
 */
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/', (req, res) => {
    res.json({
        service: 'obelisk-backend',
        version: '2.0.0',
        status: 'running'
    });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OBELISK] Minimal server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[OBELISK] SIGTERM received, shutting down...');
    server.close(() => process.exit(0));
});
