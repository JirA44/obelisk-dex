/**
 * SAFE OPERATIONS UTILITY - Obelisk DEX
 * Provides safe wrappers for common risky operations
 */
const SafeOps = {
    /**
     * Safe parseFloat with validation
     * @param {*} value - Value to parse
     * @param {number} defaultVal - Default if invalid (default: 0)
     * @param {number} min - Minimum allowed value (optional)
     * @param {number} max - Maximum allowed value (optional)
     * @returns {number} - Parsed number or default
     */
    parseNumber(value, defaultVal = 0, min = null, max = null) {
        if (value === null || value === undefined || value === '') return defaultVal;
        const num = parseFloat(value);
        if (!Number.isFinite(num)) return defaultVal;
        if (min !== null && num < min) return min;
        if (max !== null && num > max) return max;
        return num;
    },

    /**
     * Safe parseInt with validation
     */
    parseInt(value, defaultVal = 0, min = null, max = null) {
        if (value === null || value === undefined || value === '') return defaultVal;
        const num = parseInt(value, 10);
        if (!Number.isFinite(num)) return defaultVal;
        if (min !== null && num < min) return min;
        if (max !== null && num > max) return max;
        return num;
    },

    /**
     * Safe JSON parse with fallback
     * @param {string} jsonString - JSON string to parse
     * @param {*} defaultVal - Default if parse fails
     * @returns {*} - Parsed object or default
     */
    parseJSON(jsonString, defaultVal = null) {
        if (!jsonString || typeof jsonString !== 'string') return defaultVal;
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.warn('SafeOps.parseJSON failed:', e.message);
            return defaultVal;
        }
    },

    /**
     * Safe localStorage get with JSON parse
     */
    getStorage(key, defaultVal = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultVal;
            return this.parseJSON(item, defaultVal);
        } catch (e) {
            console.warn('SafeOps.getStorage failed:', key, e.message);
            return defaultVal;
        }
    },

    /**
     * Safe localStorage set with JSON stringify
     */
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('SafeOps.setStorage failed:', key, e.message);
            return false;
        }
    },

    /**
     * Safe division (avoid NaN/Infinity)
     */
    divide(numerator, denominator, defaultVal = 0) {
        if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
            return defaultVal;
        }
        const result = numerator / denominator;
        return Number.isFinite(result) ? result : defaultVal;
    },

    /**
     * Safe percentage calculation
     */
    percentage(value, total, decimals = 2) {
        const pct = this.divide(value, total, 0) * 100;
        return Number(pct.toFixed(decimals));
    },

    /**
     * Safe array access
     */
    arrayGet(arr, index, defaultVal = null) {
        if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
            return defaultVal;
        }
        return arr[index] ?? defaultVal;
    },

    /**
     * Safe object property access
     */
    get(obj, path, defaultVal = null) {
        if (!obj || typeof obj !== 'object') return defaultVal;
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current === null || current === undefined || !(key in current)) {
                return defaultVal;
            }
            current = current[key];
        }
        return current ?? defaultVal;
    },

    /**
     * Safe prompt with validation
     */
    prompt(message, defaultVal = '', validator = null) {
        const result = window.prompt(message);
        if (result === null) return null; // User cancelled
        if (result === '') return defaultVal;
        if (validator && !validator(result)) return null;
        return result;
    },

    /**
     * Safe prompt for number
     */
    promptNumber(message, defaultVal = 0, min = null, max = null) {
        const result = window.prompt(message);
        if (result === null) return null; // User cancelled
        return this.parseNumber(result, defaultVal, min, max);
    },

    /**
     * Validate investment amount
     */
    validateAmount(amount, minAmount = 0, maxAmount = Infinity) {
        if (amount === null) return { valid: false, error: 'cancelled' };
        if (!Number.isFinite(amount)) return { valid: false, error: 'Invalid number' };
        if (amount <= 0) return { valid: false, error: 'Amount must be positive' };
        if (amount < minAmount) return { valid: false, error: 'Min: $' + minAmount };
        if (amount > maxAmount) return { valid: false, error: 'Max: $' + maxAmount };
        return { valid: true, amount };
    },

    /**
     * Safe async wrapper
     */
    async safeAsync(asyncFn, defaultVal = null) {
        try {
            return await asyncFn();
        } catch (e) {
            console.error('SafeOps.safeAsync failed:', e.message);
            return defaultVal;
        }
    },

    /**
     * Debounce function
     */
    debounce(fn, delay = 300) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Format currency safely
     */
    formatCurrency(value, decimals = 2) {
        const num = this.parseNumber(value, 0);
        return '$' + num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    },

    /**
     * Format percentage safely
     */
    formatPercent(value, decimals = 2) {
        const num = this.parseNumber(value, 0);
        return num.toFixed(decimals) + '%';
    }
};

// Make available globally
window.SafeOps = SafeOps;
console.log('SafeOps utility loaded');
