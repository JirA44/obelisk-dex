/**
 * OBELISK DEX - Feedback System
 * Handles bug reports, suggestions and questions from users
 */

const FeedbackSystem = {
    storageKey: 'obelisk_feedback',

    init() {
        this.loadHistory();
        console.log('[FeedbackSystem] Initialized');
    },

    open() {
        const modal = document.getElementById('feedback-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.loadHistory();
        }
    },

    close() {
        const modal = document.getElementById('feedback-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    submit(event) {
        event.preventDefault();

        const type = document.getElementById('feedback-type')?.value;
        const desc = document.getElementById('feedback-desc')?.value;

        if (!desc || desc.trim().length < 5) {
            if (typeof showNotification === 'function') {
                showNotification('Please provide more details', 'warning');
            }
            return;
        }

        const feedback = {
            id: Date.now(),
            type: type,
            description: desc.trim(),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent.slice(0, 100),
            status: 'pending'
        };

        // Save to localStorage
        const history = this.getHistory();
        history.unshift(feedback);

        // Keep max 50 feedbacks
        if (history.length > 50) {
            history.pop();
        }

        localStorage.setItem(this.storageKey, JSON.stringify(history));

        // Clear form
        document.getElementById('feedback-desc').value = '';

        if (typeof showNotification === 'function') {
            showNotification('Thank you for your feedback!', 'success');
        }

        // Refresh history display
        this.loadHistory();

        // Log for debugging (in production, would send to server)
        console.log('[FeedbackSystem] New feedback submitted:', feedback);
    },

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch (e) {
            return [];
        }
    },

    loadHistory() {
        const listEl = document.getElementById('feedback-list');
        if (!listEl) return;

        const history = this.getHistory();

        if (history.length === 0) {
            listEl.innerHTML = '<p style="color:#666;font-size:11px;">No feedback submitted yet</p>';
            return;
        }

        listEl.innerHTML = history.slice(0, 10).map(fb => {
            const typeIcon = fb.type === 'bug' ? '🐛' : fb.type === 'suggestion' ? '💡' : '❓';
            const date = new Date(fb.timestamp).toLocaleDateString();
            const truncDesc = fb.description.length > 60 ? fb.description.slice(0, 60) + '...' : fb.description;

            return `
                <div style="background:rgba(0,0,0,0.3);border-radius:6px;padding:10px;margin-bottom:8px;border-left:3px solid ${fb.type === 'bug' ? '#ff4444' : fb.type === 'suggestion' ? '#ffc107' : '#00aaff'};">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="color:#888;font-size:11px;">${typeIcon} ${fb.type}</span>
                        <span style="color:#666;font-size:10px;">${date}</span>
                    </div>
                    <p style="color:#ccc;font-size:12px;margin:0;">${this.escapeHtml(truncDesc)}</p>
                </div>
            `;
        }).join('');
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Export all feedback (for debugging/review)
    exportAll() {
        const history = this.getHistory();
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `obelisk-feedback-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Clear all feedback (debugging)
    clearAll() {
        if (confirm('Clear all feedback history?')) {
            localStorage.removeItem(this.storageKey);
            this.loadHistory();
            showNotification('Feedback history cleared', 'info');
        }
    }
};

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FeedbackSystem.init());
} else {
    FeedbackSystem.init();
}

// Expose globally
window.FeedbackSystem = FeedbackSystem;

console.log('[FeedbackSystem] Module loaded');
