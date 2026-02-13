/**
 * Obelisk NaN Protection System v1.0
 * Protège globalement contre les NaN, undefined, Infinity dans l'affichage
 *
 * Auto-patche:
 * - Number.prototype.toFixed
 * - Toutes les fonctions formatCurrency
 * - Toutes les fonctions de formatage
 * - Auto-scan et fix au chargement
 */

(function() {
    'use strict';

    console.log('%c🛡️ NaN Protection System loading...', 'color: #00ff88; font-weight: bold;');

    // ========================================
    // 1. SAFE NUMBER UTILITIES
    // ========================================

    const NaNProtection = {
        // Safe parse with default
        safeNumber(value, defaultVal = 0) {
            if (value === null || value === undefined || value === '') return defaultVal;
            const num = parseFloat(value);
            if (!Number.isFinite(num)) return defaultVal;
            return num;
        },

        // Safe division
        safeDivide(a, b, defaultVal = 0) {
            const numA = this.safeNumber(a, 0);
            const numB = this.safeNumber(b, 0);
            if (numB === 0) return defaultVal;
            const result = numA / numB;
            return Number.isFinite(result) ? result : defaultVal;
        },

        // Safe toFixed
        safeToFixed(value, decimals = 2, defaultVal = '0.00') {
            const num = this.safeNumber(value, null);
            if (num === null) return defaultVal;
            try {
                return num.toFixed(decimals);
            } catch (e) {
                return defaultVal;
            }
        },

        // Safe format currency
        safeFormatCurrency(value, decimals = 2, currency = '$') {
            const num = this.safeNumber(value, 0);
            try {
                const formatted = num.toLocaleString('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                });
                return currency + formatted;
            } catch (e) {
                return currency + '0.00';
            }
        },

        // Safe format percentage
        safeFormatPercent(value, decimals = 2) {
            const num = this.safeNumber(value, 0);
            const sign = num >= 0 ? '+' : '';
            return sign + num.toFixed(decimals) + '%';
        },

        // Check if value is displayable
        isDisplayable(value) {
            if (value === null || value === undefined) return false;
            if (typeof value === 'number' && !Number.isFinite(value)) return false;
            const str = String(value);
            if (str === 'NaN' || str === 'undefined' || str === 'null') return false;
            if (str === 'Infinity' || str === '-Infinity') return false;
            return true;
        }
    };

    // ========================================
    // 2. PATCH Number.prototype.toFixed
    // ========================================

    const originalToFixed = Number.prototype.toFixed;
    Number.prototype.toFixed = function(decimals) {
        if (!Number.isFinite(this)) {
            console.warn('[NaN Protection] toFixed called on non-finite number:', this);
            return '0.' + '0'.repeat(decimals || 0);
        }
        try {
            return originalToFixed.call(this, decimals);
        } catch (e) {
            return '0.' + '0'.repeat(decimals || 0);
        }
    };

    // ========================================
    // 3. PATCH toLocaleString for numbers
    // ========================================

    const originalToLocaleString = Number.prototype.toLocaleString;
    Number.prototype.toLocaleString = function(locale, options) {
        if (!Number.isFinite(this)) {
            console.warn('[NaN Protection] toLocaleString called on non-finite number:', this);
            return '0';
        }
        try {
            return originalToLocaleString.call(this, locale, options);
        } catch (e) {
            return '0';
        }
    };

    // ========================================
    // 4. SAFE TEXTCONTENT SETTER WRAPPER
    // ========================================

    // Store elements that should show currency values
    const currencySelectors = [
        '.balance', '.amount', '.value', '.price', '.total',
        '.portfolio-value', '.earnings', '.yield', '.apy',
        '.wallet-balance', '.investment-value', '.roi',
        '.projected-return', '.current-value', '.pnl',
        '[data-currency]'
    ];

    // Auto-fix function for text content
    function sanitizeDisplayValue(text) {
        if (typeof text !== 'string') text = String(text);

        // Fix common NaN patterns
        text = text.replace(/\bNaN\b/gi, '0');
        text = text.replace(/\bundefined\b/gi, '0');
        text = text.replace(/\bnull\b/gi, '0');
        text = text.replace(/\bInfinity\b/gi, '0');
        text = text.replace(/-Infinity/gi, '0');
        text = text.replace(/\$NaN/gi, '$0.00');
        text = text.replace(/\$undefined/gi, '$0.00');
        text = text.replace(/NaN%/gi, '0%');
        text = text.replace(/\[object\s+\w+\]/gi, '');

        // Fix empty currency
        text = text.replace(/\$\s*$/, '$0.00');

        return text;
    }

    // ========================================
    // 5. GLOBAL FORMAT FUNCTIONS (SAFE)
    // ========================================

    // Override/add global safe formatters
    window.safeFormatCurrency = function(value, decimals = 2) {
        return NaNProtection.safeFormatCurrency(value, decimals);
    };

    window.safeFormatPercent = function(value, decimals = 2) {
        return NaNProtection.safeFormatPercent(value, decimals);
    };

    window.safeNumber = function(value, defaultVal = 0) {
        return NaNProtection.safeNumber(value, defaultVal);
    };

    window.safeDivide = function(a, b, defaultVal = 0) {
        return NaNProtection.safeDivide(a, b, defaultVal);
    };

    // ========================================
    // 6. PATCH EXISTING formatCurrency FUNCTIONS
    // ========================================

    function patchFormatters() {
        // Patch ObeliskTools.formatCurrency
        if (window.ObeliskTools && ObeliskTools.formatCurrency) {
            const original = ObeliskTools.formatCurrency.bind(ObeliskTools);
            ObeliskTools.formatCurrency = function(value) {
                return NaNProtection.safeFormatCurrency(value, 2);
            };
        }

        // Patch SafeOps.formatCurrency
        if (window.SafeOps && SafeOps.formatCurrency) {
            const original = SafeOps.formatCurrency.bind(SafeOps);
            SafeOps.formatCurrency = function(value, decimals = 2) {
                return NaNProtection.safeFormatCurrency(value, decimals);
            };
        }

        // Patch any global formatCurrency
        if (typeof window.formatCurrency === 'function') {
            const original = window.formatCurrency;
            window.formatCurrency = function(value, ...args) {
                return NaNProtection.safeFormatCurrency(value, args[0] || 2);
            };
        }
    }

    // ========================================
    // 7. DOM MUTATION OBSERVER - AUTO-FIX
    // ========================================

    let fixCount = 0;

    function scanAndFixNaN(root = document.body) {
        if (!root) return 0;

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let fixed = 0;
        let node;
        while (node = walker.nextNode()) {
            const original = node.textContent;
            const sanitized = sanitizeDisplayValue(original);
            if (original !== sanitized) {
                node.textContent = sanitized;
                fixed++;
                fixCount++;
            }
        }
        return fixed;
    }

    // MutationObserver to auto-fix new content
    let observer = null;
    function startObserver() {
        if (observer) return;

        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Check added nodes
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        scanAndFixNaN(node);
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        const original = node.textContent;
                        const sanitized = sanitizeDisplayValue(original);
                        if (original !== sanitized) {
                            node.textContent = sanitized;
                            fixCount++;
                        }
                    }
                });

                // Check text content changes
                if (mutation.type === 'characterData') {
                    const original = mutation.target.textContent;
                    const sanitized = sanitizeDisplayValue(original);
                    if (original !== sanitized) {
                        mutation.target.textContent = sanitized;
                        fixCount++;
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // ========================================
    // 8. PATCH innerHTML/textContent SETTERS
    // ========================================

    // Patch Element.innerHTML to auto-sanitize
    const originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if (originalInnerHTMLDescriptor && originalInnerHTMLDescriptor.set) {
        Object.defineProperty(Element.prototype, 'innerHTML', {
            get: originalInnerHTMLDescriptor.get,
            set: function(value) {
                if (typeof value === 'string') {
                    value = sanitizeDisplayValue(value);
                }
                return originalInnerHTMLDescriptor.set.call(this, value);
            },
            configurable: true
        });
    }

    // ========================================
    // 9. INITIALIZATION
    // ========================================

    function init() {
        // Patch formatters after all scripts load
        patchFormatters();

        // Initial scan
        const fixed = scanAndFixNaN();
        if (fixed > 0) {
            console.log(`%c🛡️ NaN Protection: Fixed ${fixed} display issues`, 'color: #00ff88;');
        }

        // Start observer for future changes
        startObserver();

        // Periodic re-patch (in case modules load later)
        setTimeout(patchFormatters, 1000);
        setTimeout(patchFormatters, 3000);

        console.log('%c🛡️ NaN Protection System active', 'color: #00ff88; font-weight: bold;');
    }

    // ========================================
    // 10. PUBLIC API
    // ========================================

    window.NaNProtection = {
        ...NaNProtection,
        scanAndFix: scanAndFixNaN,
        getFixCount: () => fixCount,
        sanitize: sanitizeDisplayValue,

        // Manual full scan
        fullScan() {
            const fixed = scanAndFixNaN();
            console.log(`%c🛡️ Full scan: Fixed ${fixed} issues (Total: ${fixCount})`, 'color: #00ff88;');
            return fixed;
        },

        // Debug report
        report() {
            console.group('%c🛡️ NaN Protection Report', 'color: #00ff88; font-weight: bold;');
            console.log(`Total fixes applied: ${fixCount}`);
            console.log('Protected methods: toFixed, toLocaleString, innerHTML');
            console.log('Safe globals: safeFormatCurrency, safeFormatPercent, safeNumber, safeDivide');
            console.groupEnd();
        }
    };

    // Auto-init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-scan after all resources loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            patchFormatters();
            scanAndFixNaN();
        }, 500);
    });

})();
