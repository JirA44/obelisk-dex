/**
 * Obelisk DEX - Click Tester / UI Validator
 * Tests every clickable element and shows feedback
 */

const ClickTester = {
    isActive: false,
    results: [],
    expectedBehaviors: {},

    /**
     * Define expected behaviors for all interactive elements
     */
    init() {
        this.expectedBehaviors = {
            // Navigation
            '[data-tab="trade"]': { action: 'Switch to Trade tab', expected: 'Tab content changes' },
            '[data-tab="swap"]': { action: 'Switch to Swap tab', expected: 'Swap interface shows' },
            '[data-tab="wallet"]': { action: 'Switch to Wallet tab', expected: 'Wallet interface shows' },
            '[data-tab="portfolio"]': { action: 'Switch to Portfolio tab', expected: 'Portfolio shows' },

            // Trading
            '.order-tab[data-side="long"]': { action: 'Select LONG position', expected: 'Button turns green, order type updates' },
            '.order-tab[data-side="short"]': { action: 'Select SHORT position', expected: 'Button turns red, order type updates' },
            '.type-btn': { action: 'Change order type', expected: 'Order type switches (Market/Limit/Stop)' },
            '.lev-btn': { action: 'Set leverage preset', expected: 'Slider updates, value changes' },
            '#leverage-slider': { action: 'Adjust leverage', expected: 'Leverage value updates in real-time' },
            '#btn-place-order': { action: 'Place order', expected: 'Order submitted or "Connect Wallet" prompt' },
            '.chart-tf': { action: 'Change chart timeframe', expected: 'Button highlights, chart reloads' },
            '.ob-btn': { action: 'Toggle orderbook view', expected: 'Shows Bids/Asks/Both' },

            // Swap
            '#swap-from-amount': { action: 'Enter swap amount', expected: 'Quote calculates, details show' },
            '#from-token': { action: 'Select source token', expected: 'Token selector opens' },
            '#to-token': { action: 'Select destination token', expected: 'Token selector opens' },
            '#btn-swap-switch': { action: 'Switch tokens', expected: 'Tokens swap positions' },
            '#btn-swap': { action: 'Execute swap', expected: 'Swap executes or "Connect Wallet" prompt' },
            '#swap-settings': { action: 'Open swap settings', expected: 'Settings modal opens' },

            // Wallet
            '#btn-create-wallet': { action: 'Create new wallet', expected: 'Creation modal opens' },
            '#btn-import-wallet': { action: 'Import wallet', expected: 'Import modal opens' },
            '#btn-connect-external': { action: 'Connect MetaMask', expected: 'MetaMask prompt appears' },
            '#btn-connect-wallet': { action: 'Connect wallet', expected: 'Redirects to wallet tab' },
            '#btn-copy-address': { action: 'Copy address', expected: 'Address copied to clipboard' },
            '#btn-refresh-balances': { action: 'Refresh balances', expected: 'Balances reload' },
            '#btn-send': { action: 'Open send modal', expected: 'Send interface opens' },
            '#btn-receive': { action: 'Show receive address', expected: 'QR code displays' },
            '#btn-backup': { action: 'Backup wallet', expected: 'Backup options show' },

            // Modals
            '.modal-close': { action: 'Close modal', expected: 'Modal closes' },
            '.modal-backdrop': { action: 'Click outside modal', expected: 'Modal closes' },
            '.btn-next': { action: 'Next step', expected: 'Proceeds to next step' },

            // Positions
            '.pos-tab': { action: 'Switch position view', expected: 'Shows Positions/Orders/History' },

            // General
            '.footer-link': { action: 'Open external link', expected: 'Link opens (Docs/GitHub/Discord)' }
        };
    },

    /**
     * Start click testing mode
     */
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.results = [];
        this.init();

        console.log('🧪 Click Tester Started');
        this.addTestingUI();
        this.attachListeners();
    },

    /**
     * Stop click testing mode
     */
    stop() {
        this.isActive = false;
        this.removeTestingUI();
        console.log('🧪 Click Tester Stopped');
        this.showReport();
    },

    /**
     * Add testing UI overlay
     */
    addTestingUI() {
        // Main panel
        const panel = document.createElement('div');
        panel.id = 'click-tester-panel';
        panel.innerHTML = `
            <div class="ct-header">
                <span>🧪 TEST MODE</span>
                <div class="ct-stats">
                    <span id="ct-pass" class="ct-pass">✓ 0</span>
                    <span id="ct-fail" class="ct-fail">✗ 0</span>
                    <span id="ct-skip" class="ct-skip">○ 0</span>
                </div>
                <button onclick="ClickTester.stop()">Arrêter</button>
            </div>
            <div class="ct-log" id="ct-log"></div>
        `;

        // Styles
        const style = document.createElement('style');
        style.id = 'click-tester-styles';
        style.textContent = `
            #click-tester-panel {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 400px;
                max-height: 300px;
                background: #1a1a2e;
                border: 2px solid #00f0ff;
                border-radius: 12px;
                z-index: 100000;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 240, 255, 0.3);
            }
            .ct-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: linear-gradient(135deg, #00f0ff22, #0080ff22);
                border-bottom: 1px solid #00f0ff44;
            }
            .ct-header span:first-child {
                font-weight: 700;
                color: #00f0ff;
            }
            .ct-stats {
                display: flex;
                gap: 12px;
            }
            .ct-pass { color: #00ff88; }
            .ct-fail { color: #ff4757; }
            .ct-skip { color: #ffd93d; }
            .ct-header button {
                background: #ff4757;
                border: none;
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
            }
            .ct-log {
                max-height: 230px;
                overflow-y: auto;
                padding: 8px;
            }
            .ct-entry {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                padding: 8px;
                margin: 4px 0;
                border-radius: 6px;
                background: rgba(255,255,255,0.03);
                animation: slideIn 0.2s ease;
            }
            .ct-entry.pass { border-left: 3px solid #00ff88; }
            .ct-entry.fail { border-left: 3px solid #ff4757; }
            .ct-entry.pending { border-left: 3px solid #ffd93d; }
            .ct-icon { font-size: 14px; }
            .ct-content { flex: 1; }
            .ct-element { color: #00f0ff; font-weight: 500; }
            .ct-action { color: #888; margin-top: 2px; }
            .ct-expected { color: #aaa; font-size: 11px; margin-top: 2px; }
            .ct-buttons {
                display: flex;
                gap: 4px;
                margin-top: 6px;
            }
            .ct-btn {
                padding: 4px 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
            }
            .ct-btn-yes { background: #00ff88; color: #000; }
            .ct-btn-no { background: #ff4757; color: #fff; }
            .ct-btn-action { background: #ffd93d; color: #000; }
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(-10px); }
                to { opacity: 1; transform: translateX(0); }
            }

            /* Highlight clickable elements */
            .ct-highlight {
                outline: 2px dashed #00f0ff !important;
                outline-offset: 2px;
                position: relative;
            }
            .ct-highlight::after {
                content: '👆';
                position: absolute;
                top: -20px;
                right: -10px;
                font-size: 14px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(panel);

        // Highlight all clickable elements
        this.highlightClickables();
    },

    /**
     * Remove testing UI
     */
    removeTestingUI() {
        document.getElementById('click-tester-panel')?.remove();
        document.getElementById('click-tester-styles')?.remove();

        // Remove highlights
        document.querySelectorAll('.ct-highlight').forEach(el => {
            el.classList.remove('ct-highlight');
        });
    },

    /**
     * Highlight all clickable elements
     */
    highlightClickables() {
        const selectors = Object.keys(this.expectedBehaviors);
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.add('ct-highlight');
            });
        });
    },

    /**
     * Attach click listeners
     */
    attachListeners() {
        document.addEventListener('click', this.handleClick.bind(this), true);
    },

    /**
     * Handle click event
     */
    handleClick(e) {
        if (!this.isActive) return;

        const target = e.target;
        const panel = document.getElementById('click-tester-panel');

        // Ignore clicks on tester panel
        if (panel && panel.contains(target)) return;

        // Find matching expected behavior
        let behavior = null;
        let matchedSelector = null;

        for (const [selector, beh] of Object.entries(this.expectedBehaviors)) {
            if (target.matches(selector) || target.closest(selector)) {
                behavior = beh;
                matchedSelector = selector;
                break;
            }
        }

        // Get element description
        const elementDesc = this.getElementDescription(target);

        // Log the click
        this.logClick({
            element: elementDesc,
            selector: matchedSelector,
            behavior,
            target
        });
    },

    /**
     * Get human-readable element description
     */
    getElementDescription(el) {
        if (el.id) return `#${el.id}`;
        if (el.dataset.tab) return `Tab: ${el.dataset.tab}`;
        if (el.dataset.side) return `Side: ${el.dataset.side}`;
        if (el.className) return `.${el.className.split(' ')[0]}`;
        return el.tagName.toLowerCase();
    },

    /**
     * Log a click with feedback buttons
     */
    logClick(data) {
        const log = document.getElementById('ct-log');
        if (!log) return;

        const entryId = Date.now();
        const entry = document.createElement('div');
        entry.className = 'ct-entry pending';
        entry.id = `ct-entry-${entryId}`;

        entry.innerHTML = `
            <span class="ct-icon">❓</span>
            <div class="ct-content">
                <div class="ct-element">${data.element}</div>
                ${data.behavior ? `
                    <div class="ct-action">${data.behavior.action}</div>
                    <div class="ct-expected">Attendu: ${data.behavior.expected}</div>
                ` : `
                    <div class="ct-action" style="color: #ffd93d;">⚠ Élément non défini</div>
                `}
                <div class="ct-buttons">
                    <button class="ct-btn ct-btn-yes" onclick="ClickTester.markResult(${entryId}, 'pass')">✓ OUI</button>
                    <button class="ct-btn ct-btn-no" onclick="ClickTester.markResult(${entryId}, 'fail')">✗ NON</button>
                    <button class="ct-btn ct-btn-action" onclick="ClickTester.markResult(${entryId}, 'action')">⚡ ACTION</button>
                </div>
            </div>
        `;

        log.insertBefore(entry, log.firstChild);

        // Store result data
        this.results.push({
            id: entryId,
            element: data.element,
            selector: data.selector,
            behavior: data.behavior,
            status: 'pending',
            timestamp: new Date()
        });

        // Scroll to top
        log.scrollTop = 0;
    },

    /**
     * Mark a result as pass/fail/action
     */
    markResult(entryId, status) {
        const entry = document.getElementById(`ct-entry-${entryId}`);
        if (!entry) return;

        // Update visual
        entry.classList.remove('pending');
        entry.classList.add(status === 'pass' ? 'pass' : status === 'fail' ? 'fail' : 'pending');

        const icon = entry.querySelector('.ct-icon');
        icon.textContent = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⚡';

        // Remove buttons
        entry.querySelector('.ct-buttons').remove();

        // Update result
        const result = this.results.find(r => r.id === entryId);
        if (result) result.status = status;

        // Update stats
        this.updateStats();

        // If action, prompt for details
        if (status === 'action') {
            const note = prompt('Note sur l\'action effectuée:');
            if (note && result) result.note = note;
        }
    },

    /**
     * Update statistics display
     */
    updateStats() {
        const pass = this.results.filter(r => r.status === 'pass').length;
        const fail = this.results.filter(r => r.status === 'fail').length;
        const pending = this.results.filter(r => r.status === 'pending' || r.status === 'action').length;

        document.getElementById('ct-pass').textContent = `✓ ${pass}`;
        document.getElementById('ct-fail').textContent = `✗ ${fail}`;
        document.getElementById('ct-skip').textContent = `○ ${pending}`;
    },

    /**
     * Show final report
     */
    showReport() {
        const pass = this.results.filter(r => r.status === 'pass').length;
        const fail = this.results.filter(r => r.status === 'fail').length;
        const total = this.results.length;

        console.log('\n📊 RAPPORT DE TEST');
        console.log('==================');
        console.log(`Total clics testés: ${total}`);
        console.log(`✓ Réussi: ${pass} (${((pass/total)*100).toFixed(1)}%)`);
        console.log(`✗ Échec: ${fail} (${((fail/total)*100).toFixed(1)}%)`);

        if (fail > 0) {
            console.log('\n❌ Éléments en échec:');
            this.results.filter(r => r.status === 'fail').forEach(r => {
                console.log(`  - ${r.element}: ${r.behavior?.action || 'Comportement non défini'}`);
            });
        }

        // Show alert summary
        alert(`📊 Rapport de Test\n\n✓ Réussi: ${pass}\n✗ Échec: ${fail}\nTotal: ${total}\n\nVoir console pour détails`);
    },

    /**
     * Run automated tests
     */
    async runAutoTests() {
        console.log('🤖 Lancement des tests automatiques...');

        const results = {
            passed: [],
            failed: [],
            skipped: []
        };

        for (const [selector, behavior] of Object.entries(this.expectedBehaviors)) {
            const elements = document.querySelectorAll(selector);

            if (elements.length === 0) {
                results.skipped.push({ selector, reason: 'Element not found' });
                continue;
            }

            for (const el of elements) {
                try {
                    // Check if element is visible
                    const rect = el.getBoundingClientRect();
                    const isVisible = rect.width > 0 && rect.height > 0;

                    if (!isVisible) {
                        results.skipped.push({ selector, reason: 'Element not visible' });
                        continue;
                    }

                    // Check if clickable
                    const style = window.getComputedStyle(el);
                    const isDisabled = el.disabled || style.pointerEvents === 'none';

                    if (isDisabled) {
                        results.skipped.push({ selector, reason: 'Element disabled' });
                        continue;
                    }

                    // Element is clickable
                    results.passed.push({
                        selector,
                        element: this.getElementDescription(el),
                        action: behavior.action
                    });

                } catch (e) {
                    results.failed.push({ selector, error: e.message });
                }
            }
        }

        // Display results
        console.log('\n📊 RÉSULTATS DES TESTS AUTO');
        console.log(`✓ Passé: ${results.passed.length}`);
        console.log(`✗ Échec: ${results.failed.length}`);
        console.log(`○ Ignoré: ${results.skipped.length}`);

        return results;
    }
};

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+T to toggle test mode
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        if (ClickTester.isActive) {
            ClickTester.stop();
        } else {
            ClickTester.start();
        }
    }
});

// Export
window.ClickTester = ClickTester;

console.log('🧪 Click Tester loaded. Press Ctrl+Shift+T or call ClickTester.start() to test UI.');
