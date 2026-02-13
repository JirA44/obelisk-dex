/**
 * OBELISK Runtime Environment Configuration
 *
 * This file contains environment-specific settings.
 * It is loaded BEFORE other scripts and configures the app.
 *
 * For production: update API_URL to your backend domain
 * For Firebase: fill in your Firebase project config
 *
 * NOTE: This file should be in .gitignore for production deployments
 * and configured per-environment. The checked-in version has empty defaults.
 */

// Backend API configuration
// For Cloudflare Tunnel: paste your tunnel URL here
// For production: use your real domain (e.g. https://api.obelisk.trading)
if (typeof ObeliskConfig !== 'undefined') {
    ObeliskConfig.configure({
        apiUrl: '',   // e.g. 'https://api.obelisk.trading'
        wsUrl: '',    // e.g. 'wss://api.obelisk.trading'
    });
}

// Firebase configuration (client-side keys)
// Get these from Firebase Console > Project Settings > General
window.FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};
