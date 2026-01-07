
// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - INPUT SANITIZATION
// Prevent XSS attacks with DOMPurify
// ═══════════════════════════════════════════════════════════════════════════════

const Sanitize = {
    // Sanitize HTML content
    html(dirty) {
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(dirty, {
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'div', 'p', 'br'],
                ALLOWED_ATTR: ['style', 'class']
            });
        }
        // Fallback: escape HTML
        return dirty.replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
        })[char]);
    },

    // Escape for use in attributes
    attr(str) {
        return String(str).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
        })[char]);
    },

    // Sanitize URL
    url(url) {
        try {
            const parsed = new URL(url);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return '#';
            }
            return parsed.href;
        } catch {
            return '#';
        }
    },

    // Sanitize wallet address
    address(addr) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
            return null;
        }
        return addr.toLowerCase();
    },

    // Sanitize number input
    number(val, min = 0, max = Infinity) {
        const num = parseFloat(val);
        if (isNaN(num)) return min;
        return Math.max(min, Math.min(max, num));
    }
};

window.Sanitize = Sanitize;
