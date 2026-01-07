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
        const start = performance.now();
        try {
            const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
            if (response.ok) {
                this.latency = Math.round(performance.now() - start);
                this.quality = this.latency < 100 ? 'good' : this.latency < 300 ? 'moderate' : 'poor';
                this.lastCheck = Date.now();
            }
        } catch (e) {
            this.quality = 'poor';
            this.latency = -1;
        }
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

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.LoadingStates = LoadingStates;
    window.OfflineDetector = OfflineDetector;
    window.ConnectionMonitor = ConnectionMonitor;
}
