const fs = require('fs');

// Add security-audit.js to app.html
let app = fs.readFileSync('app.html', 'utf8');

if (!app.includes('security-audit.js')) {
    app = app.replace(
        '<script src="js/wallet-connect.js"></script>',
        '<script src="js/wallet-connect.js"></script>\n    <script src="js/security-audit.js"></script>'
    );

    // Add DOMPurify CDN for XSS protection
    app = app.replace(
        '<link rel="stylesheet" href="css/main.css">',
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js" integrity="sha512-H+rglffZ6f5gMl/Qg8OOOOseG+LRxZuLPsqzVXxNh+VLrFOBk6RpDTX3SQs7rMPcQri/9k+I1XQe6HpE+8gkJw==" crossorigin="anonymous"></script>\n    <link rel="stylesheet" href="css/main.css">'
    );

    fs.writeFileSync('app.html', app);
    console.log('✅ security-audit.js added');
    console.log('✅ DOMPurify added for XSS protection');
}

// Create sanitization helper
const sanitizeHelper = `
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
`;

fs.writeFileSync('js/sanitize.js', sanitizeHelper);
console.log('✅ sanitize.js created for XSS protection');

// Add sanitize.js to app.html
app = fs.readFileSync('app.html', 'utf8');
if (!app.includes('sanitize.js')) {
    app = app.replace(
        '<script src="js/security-audit.js"></script>',
        '<script src="js/sanitize.js"></script>\n    <script src="js/security-audit.js"></script>'
    );
    fs.writeFileSync('app.html', app);
    console.log('✅ sanitize.js added to app.html');
}

console.log('\n🔒 Security improvements applied!');
