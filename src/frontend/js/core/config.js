/**
 * OBELISK DEX Configuration
 * Centralized configuration for API endpoints
 *
 * IMPORTANT: No secrets should be stored here.
 * API_URL should point to your production backend domain.
 */

const ObeliskConfig = {
    // API Endpoints - Set to your production backend URL
    // For Cloudflare Tunnel: update this each time the tunnel changes
    // For production: use your actual backend domain (e.g. https://api.obelisk.trading)
    API_URL: '',  // Set via ObeliskConfig.configure() or falls back to same-origin
    WS_URL: '',

    // Fallback to local development
    LOCAL_API: 'http://localhost:3001',
    LOCAL_WS: 'ws://localhost:3001',

    // Use local in development
    isDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    /**
     * Configure API endpoints at runtime (call from index.html or env-config.js)
     */
    configure(options) {
        if (options.apiUrl) this.API_URL = options.apiUrl;
        if (options.wsUrl) this.WS_URL = options.wsUrl;
    },

    // Get the appropriate API URL
    getApiUrl() {
        if (this.isDev) return this.LOCAL_API;
        return this.API_URL || '';  // Empty string = same-origin requests
    },

    getWsUrl() {
        if (this.isDev) return this.LOCAL_WS;
        if (this.WS_URL) return this.WS_URL;
        // Derive WSS from current host if not set
        return `wss://${window.location.host}`;
    },

    // External APIs
    COINGECKO_API: 'https://api.coingecko.com/api/v3',

    // Feature flags
    FEATURES: {
        DEMO_MODE: true,
        REAL_TRADING: false,
        FIREBASE_AUTH: false,
        ANALYTICS: true
    }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObeliskConfig;
}
