/**
 * OBELISK Loading States & Offline Detection
 * Provides UI feedback for loading, connecting, and offline states
 */

const LoadingStates = {
    // Create spinner element
    createSpinner(size = 'default') {
        const spinner = document.createElement('div');
        spinner.className = `spinner${size === 'sm' ? ' spinner-sm' : size === 'lg' ? ' spinner-lg' : ''}`;
        return spinner;
    },

    // Show loading overlay on element
    showLoading(element, text = 'Loading...') {
        if (!element) return;

        element.style.position = 'relative';

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner spinner-lg"></div>
                <div class="loading-text" style="margin-top: 12px;">${text}</div>
            </div>
        `;
        overlay.dataset.loadingOverlay = 'true';

        element.appendChild(overlay);
        return overlay;
    },

    // Hide loading overlay
    hideLoading(element) {
        if (!element) return;
        const overlay = element.querySelector('[data-loading-overlay]');
        if (overlay) {
            overlay.remove();
        }
    },

    // Show skeleton loading
    showSkeleton(element, type = 'text') {
        if (!element) return;

        const skeleton = document.createElement('div');
        skeleton.className = `skeleton skeleton-${type}`;
        skeleton.dataset.skeleton = 'true';

        element.innerHTML = '';
        element.appendChild(skeleton);
        return skeleton;
    },

    // Hide skeleton and show content
    hideSkeleton(element, content) {
        if (!element) return;
        const skeleton = element.querySelector('[data-skeleton]');
        if (skeleton) {
            skeleton.remove();
        }
        if (content !== undefined) {
            element.textContent = content;
        }
    },

    // Set button loading state
    setButtonLoading(button, loading = true) {
        if (!button) return;

        if (loading) {
            button.classList.add('btn-loading');
            button.disabled = true;
            if (!button.querySelector('.btn-text')) {
                const text = document.createElement('span');
                text.className = 'btn-text';
                text.textContent = button.textContent;
                button.textContent = '';
                button.appendChild(text);
            }
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
            const text = button.querySelector('.btn-text');
            if (text) {
                button.textContent = text.textContent;
            }
        }
    },

    // Show empty state
    showEmptyState(element, options = {}) {
        if (!element) return;

        const {
            icon = '📭',
            title = 'No data',
            text = 'There is nothing to display yet.'
        } = options;

        element.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-title">${title}</div>
                <div class="empty-state-text">${text}</div>
            </div>
        `;
    },

    // Create connection status indicator
    createStatusDot(status = 'disconnected') {
        const dot = document.createElement('span');
        dot.className = `status-dot ${status}`;
        return dot;
    },

    // Update connection status
    updateConnectionStatus(dotElement, status) {
        if (!dotElement) return;
        dotElement.className = `status-dot ${status}`;
    }
};

// Offline Detection
const OfflineDetector = {
    banner: null,
    isOffline: false,
    callbacks: [],

    init() {
        // Create offline banner
        this.banner = document.createElement('div');
        this.banner.className = 'offline-banner';
        this.banner.textContent = 'You are offline. Some features may not work.';
        document.body.prepend(this.banner);

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Check initial state
        if (!navigator.onLine) {
            this.handleOffline();
        }
    },

    handleOffline() {
        this.isOffline = true;
        this.banner.classList.add('visible');
        this.callbacks.forEach(cb => cb(false));
        console.warn('[OFFLINE] Connection lost');
    },

    handleOnline() {
        this.isOffline = false;
        this.banner.classList.remove('visible');
        this.callbacks.forEach(cb => cb(true));
        console.log('[ONLINE] Connection restored');
    },

    onStatusChange(callback) {
        this.callbacks.push(callback);
    }
};

// Connection Quality Monitor
const ConnectionMonitor = {
    latency: 0,
    quality: 'good', // good, moderate, poor
    lastCheck: 0,

    async checkLatency(url = '/health') {
        // Offline mode - simulate good latency
        this.latency = 20 + Math.floor(Math.random() * 30); // 20-50ms simulated
        this.quality = 'good';
        this.lastCheck = Date.now();
        return { latency: this.latency, quality: this.quality };
    },

    getQualityColor() {
        switch (this.quality) {
            case 'good': return '#00ff88';
            case 'moderate': return '#ffaa00';
            case 'poor': return '#ff4444';
            default: return '#888888';
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => OfflineDetector.init());
} else {
    OfflineDetector.init();
}

// Skeleton container templates for full-page loading
LoadingStates.showContainerSkeleton = function(containerId, type) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const templates = {
        dashboard: `<div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
            <div class="skeleton-card" style="height:120px"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                <div class="skeleton-card" style="height:80px"></div>
                <div class="skeleton-card" style="height:80px"></div>
                <div class="skeleton-card" style="height:80px"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="skeleton-card" style="height:160px"></div>
                <div class="skeleton-card" style="height:160px"></div>
            </div></div>`,
        trading: `<div style="padding:20px;display:flex;flex-direction:column;gap:12px;">
            <div class="skeleton-card" style="height:300px"></div>
            <div style="display:flex;gap:12px;">
                <div class="skeleton-card" style="flex:1;height:200px"></div>
                <div class="skeleton-card" style="width:300px;height:200px"></div>
            </div></div>`,
        portfolio: `<div style="padding:20px;display:flex;flex-direction:column;gap:12px;">
            <div class="skeleton-card" style="height:80px"></div>
            <div class="skeleton-card" style="height:200px"></div>
            ${Array(4).fill('<div style="display:flex;gap:12px;align-items:center;padding:12px 0;"><div class="skeleton-circle" style="width:36px;height:36px"></div><div style="flex:1"><div class="skeleton-text" style="width:60%;margin-bottom:6px"></div><div class="skeleton-text" style="width:30%"></div></div></div>').join('')}
        </div>`
    };
    el.innerHTML = templates[type] || templates.dashboard;
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.LoadingStates = LoadingStates;
    window.OfflineDetector = OfflineDetector;
    window.ConnectionMonitor = ConnectionMonitor;
}
