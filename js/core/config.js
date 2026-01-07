/**
 * OBELISK DEX Configuration
 * Centralized configuration for API endpoints
 */

const ObeliskConfig = {
    // API Endpoints - Cloudflare Tunnel to local backend
    API_URL: 'https://retrieve-velvet-percent-classic.trycloudflare.com',
    WS_URL: 'wss://retrieve-velvet-percent-classic.trycloudflare.com',

    // Fallback to local development
    LOCAL_API: 'http://localhost:3001',
    LOCAL_WS: 'ws://localhost:3001',

    // Use local in development
    isDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // Get the appropriate API URL
    getApiUrl() {
        return this.isDev ? this.LOCAL_API : this.API_URL;
    },

    getWsUrl() {
        return this.isDev ? this.LOCAL_WS : this.WS_URL;
    },

    // External APIs
    COINGECKO_API: 'https://api.coingecko.com/api/v3',

    // Firebase config (set in environment)
    FIREBASE: {
        apiKey: '',
        authDomain: '',
        projectId: ''
    },

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
