/**
 * Obelisk Display Validator v1.0
 * Détecte les bugs d'affichage: NaN, undefined, null, valeurs vides
 * Usage: displayValidator.scan() ou auto-scan toutes les 5 secondes
 */

const displayValidator = {
    errors: [],
    warnings: [],
    lastScan: null,
    autoScanInterval: null,

    // Patterns de bugs à détecter
    bugPatterns: [
        { regex: /\bNaN\b/gi, type: 'error', msg: 'NaN détecté' },
        { regex: /\bundefined\b/gi, type: 'error', msg: 'undefined détecté' },
        { regex: /\bnull\b/gi, type: 'warning', msg: 'null détecté' },
        { regex: /\$\s*$/g, type: 'warning', msg: 'Montant vide après $' },
        { regex: /\$\s*-?\s*$/g, type: 'warning', msg: 'Montant incomplet' },
        { regex: /\$NaN/gi, type: 'error', msg: '$NaN détecté' },
        { regex: /\$undefined/gi, type: 'error', msg: '$undefined détecté' },
        { regex: /Infinity/g, type: 'error', msg: 'Infinity détecté' },
        { regex: /-Infinity/g, type: 'error', msg: '-Infinity détecté' },
        { regex: /\[object\s+\w+\]/gi, type: 'error', msg: 'Object non formaté' },
        { regex: /^\s*%\s*$/g, type: 'warning', msg: 'Pourcentage vide' },
        { regex: /NaN%/gi, type: 'error', msg: 'NaN% détecté' },
        { regex: /\.{3,}/g, type: 'warning', msg: 'Ellipsis suspect (chargement bloqué?)' }
    ],

    // Sélecteurs d'éléments à surveiller
    selectors: [
        // Valeurs financières
        '.balance', '.amount', '.value', '.price', '.total',
        '.portfolio-value', '.earnings', '.yield', '.apy',
        '[data-value]', '[data-amount]', '[data-balance]',
        // Stats et métriques
        '.stat-value', '.metric', '.percentage', '.rate',
        // Éléments spécifiques Obelisk
        '.wallet-balance', '.investment-value', '.roi',
        '.combo-apy', '.projected-return', '.current-value',
        // Tout élément avec symbole monétaire
        '*:not(script):not(style)'
    ],

    /**
     * Scan complet de la page
     */
    scan(silent = false) {
        this.errors = [];
        this.warnings = [];
        this.lastScan = new Date();

        // Scan tous les éléments textuels
        const elements = document.querySelectorAll('body *:not(script):not(style):not(noscript)');

        elements.forEach(el => {
            // Skip si pas de texte direct
            const text = this.getDirectText(el);
            if (!text || text.length < 1) return;

            // Check chaque pattern
            this.bugPatterns.forEach(pattern => {
                if (pattern.regex.test(text)) {
                    const issue = {
                        type: pattern.type,
                        message: pattern.msg,
                        element: el,
                        selector: this.getSelector(el),
                        text: text.substring(0, 100),
                        timestamp: new Date().toISOString()
                    };

                    if (pattern.type === 'error') {
                        this.errors.push(issue);
                    } else {
                        this.warnings.push(issue);
                    }
                }
                // Reset regex lastIndex
                pattern.regex.lastIndex = 0;
            });
        });

        // Check valeurs numériques dans les inputs
        document.querySelectorAll('input[type="number"], input[data-numeric]').forEach(input => {
            const val = input.value;
            if (val && (isNaN(parseFloat(val)) || val.includes('NaN'))) {
                this.errors.push({
                    type: 'error',
                    message: 'Input avec valeur invalide',
                    element: input,
                    selector: this.getSelector(input),
                    text: val,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Check data attributes numériques
        document.querySelectorAll('[data-value], [data-amount], [data-balance], [data-price]').forEach(el => {
            ['value', 'amount', 'balance', 'price'].forEach(attr => {
                const val = el.dataset[attr];
                if (val !== undefined && (val === 'NaN' || val === 'undefined' || val === 'null')) {
                    this.errors.push({
                        type: 'error',
                        message: `data-${attr} invalide`,
                        element: el,
                        selector: this.getSelector(el),
                        text: val,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        });

        if (!silent) {
            this.report();
        }

        return {
            errors: this.errors.length,
            warnings: this.warnings.length,
            clean: this.errors.length === 0 && this.warnings.length === 0
        };
    },

    /**
     * Récupère le texte direct d'un élément (sans les enfants)
     */
    getDirectText(el) {
        let text = '';
        el.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            }
        });
        return text.trim();
    },

    /**
     * Génère un sélecteur CSS unique pour un élément
     */
    getSelector(el) {
        if (el.id) return `#${el.id}`;
        if (el.className && typeof el.className === 'string') {
            const classes = el.className.split(' ').filter(c => c).slice(0, 2).join('.');
            if (classes) return `${el.tagName.toLowerCase()}.${classes}`;
        }
        return el.tagName.toLowerCase();
    },

    /**
     * Affiche le rapport dans la console
     */
    report() {
        console.group('%c🔍 Obelisk Display Validator', 'font-size: 14px; font-weight: bold; color: #00ff88;');
        console.log(`Scan: ${this.lastScan.toLocaleTimeString()}`);

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('%c✅ Aucun bug d\'affichage détecté!', 'color: #00ff88; font-weight: bold;');
        } else {
            if (this.errors.length > 0) {
                console.group(`%c❌ ${this.errors.length} Erreur(s)`, 'color: #ff4444; font-weight: bold;');
                this.errors.forEach((err, i) => {
                    console.log(`${i + 1}. ${err.message}`);
                    console.log(`   Selector: ${err.selector}`);
                    console.log(`   Text: "${err.text}"`);
                    console.log('   Element:', err.element);
                });
                console.groupEnd();
            }

            if (this.warnings.length > 0) {
                console.group(`%c⚠️ ${this.warnings.length} Warning(s)`, 'color: #ffaa00; font-weight: bold;');
                this.warnings.forEach((warn, i) => {
                    console.log(`${i + 1}. ${warn.message}`);
                    console.log(`   Selector: ${warn.selector}`);
                    console.log(`   Text: "${warn.text}"`);
                });
                console.groupEnd();
            }
        }

        console.groupEnd();
    },

    /**
     * Affiche une notification visuelle sur la page
     */
    showOverlay() {
        // Supprime l'ancien overlay
        const old = document.getElementById('display-validator-overlay');
        if (old) old.remove();

        const result = this.scan(true);

        const overlay = document.createElement('div');
        overlay.id = 'display-validator-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: rgba(10, 10, 20, 0.95);
            border: 2px solid ${result.errors > 0 ? '#ff4444' : result.warnings > 0 ? '#ffaa00' : '#00ff88'};
            border-radius: 12px;
            padding: 16px 20px;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
            color: #fff;
            min-width: 250px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 600; color: #00ff88;">🔍 Display Validator</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #888; cursor: pointer; font-size: 18px;">&times;</button>
            </div>
        `;

        if (result.clean) {
            html += `<div style="color: #00ff88; font-weight: 600;">✅ Aucun bug détecté</div>`;
        } else {
            if (result.errors > 0) {
                html += `<div style="color: #ff4444; margin-bottom: 8px;">❌ ${result.errors} erreur(s)</div>`;
                this.errors.slice(0, 3).forEach(err => {
                    html += `<div style="font-size: 12px; color: #ff8888; margin-left: 16px; margin-bottom: 4px;">• ${err.message}: ${err.selector}</div>`;
                });
                if (this.errors.length > 3) {
                    html += `<div style="font-size: 11px; color: #888; margin-left: 16px;">...et ${this.errors.length - 3} autres</div>`;
                }
            }
            if (result.warnings > 0) {
                html += `<div style="color: #ffaa00; margin-top: 8px;">⚠️ ${result.warnings} warning(s)</div>`;
            }
        }

        html += `<div style="font-size: 11px; color: #666; margin-top: 12px;">Scan: ${new Date().toLocaleTimeString()}</div>`;

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        // Auto-hide après 10 secondes si clean
        if (result.clean) {
            setTimeout(() => overlay.remove(), 5000);
        }
    },

    /**
     * Highlight les éléments avec erreurs sur la page
     */
    highlight() {
        this.scan(true);

        // Reset anciens highlights
        document.querySelectorAll('.validator-error-highlight, .validator-warning-highlight').forEach(el => {
            el.classList.remove('validator-error-highlight', 'validator-warning-highlight');
        });

        // Ajoute styles si nécessaire
        if (!document.getElementById('validator-highlight-styles')) {
            const style = document.createElement('style');
            style.id = 'validator-highlight-styles';
            style.textContent = `
                .validator-error-highlight {
                    outline: 3px solid #ff4444 !important;
                    outline-offset: 2px;
                    animation: validator-pulse-error 1s infinite;
                }
                .validator-warning-highlight {
                    outline: 2px solid #ffaa00 !important;
                    outline-offset: 2px;
                }
                @keyframes validator-pulse-error {
                    0%, 100% { outline-color: #ff4444; }
                    50% { outline-color: #ff8888; }
                }
            `;
            document.head.appendChild(style);
        }

        // Highlight les erreurs
        this.errors.forEach(err => {
            if (err.element) {
                err.element.classList.add('validator-error-highlight');
            }
        });

        this.warnings.forEach(warn => {
            if (warn.element) {
                warn.element.classList.add('validator-warning-highlight');
            }
        });

        console.log(`%c🎯 ${this.errors.length} erreurs et ${this.warnings.length} warnings mis en évidence`, 'color: #00aaff;');
    },

    /**
     * Active le scan automatique
     */
    startAutoScan(intervalMs = 5000) {
        if (this.autoScanInterval) {
            clearInterval(this.autoScanInterval);
        }

        console.log(`%c🔄 Auto-scan activé (${intervalMs/1000}s)`, 'color: #00aaff;');

        this.autoScanInterval = setInterval(() => {
            const result = this.scan(true);
            if (!result.clean) {
                console.warn(`[Auto-scan] ${result.errors} erreurs, ${result.warnings} warnings`);
                this.showOverlay();
            }
        }, intervalMs);
    },

    /**
     * Arrête le scan automatique
     */
    stopAutoScan() {
        if (this.autoScanInterval) {
            clearInterval(this.autoScanInterval);
            this.autoScanInterval = null;
            console.log('%c⏹️ Auto-scan désactivé', 'color: #888;');
        }
    },

    /**
     * Fix automatique des NaN (remplace par 0 ou valeur par défaut)
     */
    autoFix(defaultValue = '0') {
        this.scan(true);
        let fixed = 0;

        this.errors.forEach(err => {
            if (err.element && err.message.includes('NaN')) {
                const currentText = err.element.textContent;
                const fixedText = currentText.replace(/NaN/gi, defaultValue);

                // Ne modifie que le texte, pas le HTML complet
                if (err.element.childNodes.length === 1 && err.element.childNodes[0].nodeType === Node.TEXT_NODE) {
                    err.element.textContent = fixedText;
                    fixed++;
                    console.log(`%c🔧 Fixed: ${err.selector}`, 'color: #00ff88;');
                }
            }
        });

        console.log(`%c✅ ${fixed} NaN corrigés`, 'color: #00ff88; font-weight: bold;');
        return fixed;
    },

    /**
     * Export le rapport en JSON
     */
    exportReport() {
        this.scan(true);

        const report = {
            timestamp: this.lastScan.toISOString(),
            url: window.location.href,
            errors: this.errors.map(e => ({
                type: e.type,
                message: e.message,
                selector: e.selector,
                text: e.text
            })),
            warnings: this.warnings.map(w => ({
                type: w.type,
                message: w.message,
                selector: w.selector,
                text: w.text
            })),
            summary: {
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                clean: this.errors.length === 0 && this.warnings.length === 0
            }
        };

        return JSON.stringify(report, null, 2);
    }
};

// Expose globalement
window.displayValidator = displayValidator;

// Auto-scan au chargement (optionnel, activé en mode debug)
if (window.location.search.includes('debug') || window.location.hash.includes('debug')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            displayValidator.scan();
            displayValidator.startAutoScan(10000);
        }, 2000);
    });
}

console.log('%c🔍 Display Validator chargé. Commandes:', 'color: #00ff88; font-weight: bold;');
console.log('  displayValidator.scan()      - Scan manuel');
console.log('  displayValidator.highlight() - Met en évidence les bugs');
console.log('  displayValidator.showOverlay() - Affiche overlay');
console.log('  displayValidator.startAutoScan(5000) - Auto-scan');
console.log('  displayValidator.autoFix()   - Corrige les NaN');
