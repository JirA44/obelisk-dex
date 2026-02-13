// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - UI VERIFIER
// Comprehensive UI state verification and diagnostics
// ═══════════════════════════════════════════════════════════════════════════════

const UIVerifier = {
    version: '1.0.0',
    lastCheck: null,
    issues: [],

    // Tab definitions with expected content
    tabs: [
        { id: 'tab-trade', name: 'Trade', requiredElements: ['trading-chart', 'orderbook-asks', 'order-size'] },
        { id: 'tab-swap', name: 'Swap', requiredElements: ['swap-from-amount', 'swap-to-amount'] },
        { id: 'tab-portfolio', name: 'Portfolio', requiredElements: ['portfolio-balance', 'positions-list'] },
        { id: 'tab-investments', name: 'Investments', requiredElements: ['investments-grid'] },
        { id: 'tab-wallet', name: 'Wallet', requiredElements: ['wallet-empty', 'wallet-connected'] },
        { id: 'tab-banking', name: 'Banking', requiredElements: ['deposit-amount'] },
        { id: 'tab-settings', name: 'Settings', requiredElements: ['theme-selector', 'anim-speed'] },
        { id: 'tab-learn', name: 'Learn', requiredElements: ['learn-progress-ring'] }
    ],

    // Module definitions
    modules: [
        { name: 'CombosModule', required: ['comboData', 'render', 'init'] },
        { name: 'InvestmentsUI', required: ['render'] },
        { name: 'SimulatedPortfolio', required: ['balance'] },
        { name: 'ObeliskApp', required: ['switchTab', 'state'] },
        { name: 'BgAnimations', required: ['start', 'setAnimation'] },
        { name: 'ObeliskAcademy', required: ['init'] }
    ],

    // Run full verification
    verify() {
        console.log('[UI-VERIFIER] Starting comprehensive UI verification...');
        this.issues = [];
        this.lastCheck = new Date().toISOString();

        const results = {
            timestamp: this.lastCheck,
            tabs: this.verifyTabs(),
            modules: this.verifyModules(),
            content: this.verifyContent(),
            css: this.verifyCSS(),
            issues: this.issues
        };

        this.displayResults(results);
        return results;
    },

    // Verify all tabs
    verifyTabs() {
        const results = {};

        this.tabs.forEach(tab => {
            const element = document.getElementById(tab.id);
            const isActive = element && element.classList.contains('active');
            const hasContent = element && element.innerHTML.trim().length > 100;
            const isVisible = element && getComputedStyle(element).display !== 'none';
            const requiredFound = [];
            const requiredMissing = [];

            tab.requiredElements.forEach(reqId => {
                const el = document.getElementById(reqId);
                if (el) requiredFound.push(reqId);
                else requiredMissing.push(reqId);
            });

            results[tab.id] = {
                name: tab.name,
                exists: !!element,
                isActive,
                hasContent,
                isVisible: isActive ? isVisible : 'N/A (inactive)',
                contentLength: element ? element.innerHTML.length : 0,
                requiredFound,
                requiredMissing
            };

            if (!element) {
                this.issues.push({ type: 'error', tab: tab.name, message: `Tab ${tab.id} not found in DOM` });
            } else if (!hasContent) {
                this.issues.push({ type: 'warning', tab: tab.name, message: `Tab ${tab.name} has very little content (${element.innerHTML.length} chars)` });
            }
            if (requiredMissing.length > 0) {
                this.issues.push({ type: 'warning', tab: tab.name, message: `Missing elements: ${requiredMissing.join(', ')}` });
            }
        });

        return results;
    },

    // Verify modules
    verifyModules() {
        const results = {};

        this.modules.forEach(mod => {
            const exists = typeof window[mod.name] !== 'undefined';
            const methodsFound = [];
            const methodsMissing = [];

            if (exists) {
                mod.required.forEach(method => {
                    if (window[mod.name][method] !== undefined) {
                        methodsFound.push(method);
                    } else {
                        methodsMissing.push(method);
                    }
                });
            }

            results[mod.name] = {
                exists,
                methodsFound,
                methodsMissing
            };

            if (!exists) {
                this.issues.push({ type: 'error', module: mod.name, message: `Module ${mod.name} not loaded` });
            } else if (methodsMissing.length > 0) {
                this.issues.push({ type: 'warning', module: mod.name, message: `Missing methods: ${methodsMissing.join(', ')}` });
            }
        });

        return results;
    },

    // Verify specific content
    verifyContent() {
        const results = {
            combos: {
                dataCount: typeof CombosModule !== 'undefined' && CombosModule.comboData ? CombosModule.comboData.length : 0,
                renderedCount: typeof CombosModule !== 'undefined' && CombosModule.combos ? CombosModule.combos.length : 0,
                domCards: document.querySelectorAll('.combo-card').length
            },
            investments: {
                products: document.querySelectorAll('.investment-card, .product-card').length,
                grid: document.getElementById('investments-grid') ? 'exists' : 'missing'
            },
            settings: {
                themes: document.querySelectorAll('.theme-option').length,
                animations: document.querySelectorAll('.animation-option').length,
                saveButton: document.getElementById('btn-save-settings') ? 'exists' : 'missing'
            },
            learn: {
                courses: document.querySelectorAll('.learn-card').length,
                categories: document.querySelectorAll('.category-tab').length,
                progressRing: document.getElementById('learn-progress-ring') ? 'exists' : 'missing'
            },
            floatingCapital: {
                panel: document.getElementById('floating-capital-panel') ? 'exists' : 'missing',
                balance: document.getElementById('floating-balance') ? 'exists' : 'missing'
            }
        };

        // Check combos
        if (results.combos.dataCount === 0) {
            this.issues.push({ type: 'error', area: 'Combos', message: 'No combo data loaded' });
        }
        if (results.combos.domCards < 5) {
            this.issues.push({ type: 'warning', area: 'Combos', message: `Only ${results.combos.domCards} combo cards rendered` });
        }

        // Check settings
        if (results.settings.themes === 0) {
            this.issues.push({ type: 'error', area: 'Settings', message: 'No theme options found' });
        }
        if (results.settings.animations === 0) {
            this.issues.push({ type: 'error', area: 'Settings', message: 'No animation options found' });
        }

        // Check learn
        if (results.learn.courses === 0) {
            this.issues.push({ type: 'warning', area: 'Learn', message: 'No learn courses found' });
        }

        return results;
    },

    // Verify CSS
    verifyCSS() {
        const results = {
            stylesheets: document.styleSheets.length,
            tabContentRules: [],
            issues: []
        };

        // Check tab-content rules
        try {
            for (let sheet of document.styleSheets) {
                try {
                    for (let rule of sheet.cssRules || []) {
                        if (rule.selectorText && rule.selectorText.includes('tab-content')) {
                            results.tabContentRules.push({
                                selector: rule.selectorText,
                                display: rule.style.display || 'inherit'
                            });
                        }
                    }
                } catch (e) {
                    // Cross-origin stylesheets
                }
            }
        } catch (e) {
            results.issues.push('Could not access some stylesheets');
        }

        return results;
    },

    // Display results in console and optionally in a panel
    displayResults(results) {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('              UI VERIFIER REPORT');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('Timestamp:', results.timestamp);
        console.log('');

        // Tabs summary
        console.log('📑 TABS STATUS:');
        Object.entries(results.tabs).forEach(([id, data]) => {
            const status = data.exists ? (data.hasContent ? '✅' : '⚠️') : '❌';
            console.log(`  ${status} ${data.name}: ${data.contentLength} chars, missing: ${data.requiredMissing.join(', ') || 'none'}`);
        });
        console.log('');

        // Modules summary
        console.log('🔧 MODULES STATUS:');
        Object.entries(results.modules).forEach(([name, data]) => {
            const status = data.exists ? (data.methodsMissing.length === 0 ? '✅' : '⚠️') : '❌';
            console.log(`  ${status} ${name}: ${data.exists ? 'loaded' : 'NOT LOADED'}`);
        });
        console.log('');

        // Content summary
        console.log('📊 CONTENT STATUS:');
        console.log(`  Combos: ${results.content.combos.dataCount} data, ${results.content.combos.renderedCount} rendered, ${results.content.combos.domCards} DOM`);
        console.log(`  Settings: ${results.content.settings.themes} themes, ${results.content.settings.animations} animations`);
        console.log(`  Learn: ${results.content.learn.courses} courses`);
        console.log(`  Floating Capital: ${results.content.floatingCapital.panel}`);
        console.log('');

        // Issues
        if (results.issues.length > 0) {
            console.log('⚠️ ISSUES FOUND:');
            results.issues.forEach((issue, i) => {
                const icon = issue.type === 'error' ? '❌' : '⚠️';
                console.log(`  ${icon} ${i + 1}. [${issue.tab || issue.module || issue.area}] ${issue.message}`);
            });
        } else {
            console.log('✅ NO ISSUES FOUND');
        }

        console.log('═══════════════════════════════════════════════════════════════');
    },

    // Auto-fix common issues
    autoFix() {
        console.log('[UI-VERIFIER] Attempting auto-fix...');
        let fixed = 0;

        // Fix combos
        if (typeof CombosModule !== 'undefined') {
            if (!CombosModule.combos || CombosModule.combos.length === 0) {
                if (CombosModule.comboData) {
                    CombosModule.combos = [...CombosModule.comboData];
                    if (CombosModule.generateUltraCombos) {
                        CombosModule.combos = CombosModule.combos.concat(CombosModule.generateUltraCombos());
                    }
                    if (CombosModule.render) CombosModule.render();
                    console.log('[UI-VERIFIER] Fixed: CombosModule initialized');
                    fixed++;
                }
            }
        }

        // Fix investments UI
        if (typeof InvestmentsUI !== 'undefined' && InvestmentsUI.render) {
            InvestmentsUI.render();
            console.log('[UI-VERIFIER] Fixed: InvestmentsUI re-rendered');
            fixed++;
        }

        // Fix Learn module
        if (typeof LearnModule !== 'undefined' && LearnModule.init) {
            LearnModule.init();
            console.log('[UI-VERIFIER] Fixed: LearnModule initialized');
            fixed++;
        }

        // Fix floating capital panel
        if (!document.getElementById('floating-capital-panel')) {
            if (typeof ForceInit !== 'undefined' && ForceInit.showPanel) {
                ForceInit.showPanel();
                console.log('[UI-VERIFIER] Fixed: Floating capital panel restored');
                fixed++;
            }
        }

        console.log(`[UI-VERIFIER] Auto-fix completed: ${fixed} fixes applied`);
        return fixed;
    },

    // Create visual indicator panel
    createStatusPanel() {
        const existing = document.getElementById('ui-verifier-panel');
        if (existing) existing.remove();

        const results = this.verify();
        const issueCount = results.issues.length;
        const statusColor = issueCount === 0 ? '#00ff88' : (issueCount < 3 ? '#ffaa00' : '#ff6464');

        const panel = document.createElement('div');
        panel.id = 'ui-verifier-panel';
        panel.innerHTML = `
            <div style="position:fixed;top:20px;left:20px;z-index:900;background:rgba(10,10,30,0.95);border:2px solid ${statusColor};border-radius:12px;padding:12px;min-width:200px;font-family:monospace;font-size:12px;color:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <strong style="color:${statusColor};">UI Verifier</strong>
                    <button onclick="document.getElementById('ui-verifier-panel').remove()" style="background:none;border:none;color:#666;cursor:pointer;font-size:16px;">×</button>
                </div>
                <div style="margin-bottom:8px;">
                    ${issueCount === 0 ? '✅ All OK' : `⚠️ ${issueCount} issues`}
                </div>
                <div style="font-size:10px;color:#888;margin-bottom:8px;">
                    Combos: ${results.content.combos.domCards}/${results.content.combos.dataCount}<br>
                    Settings themes: ${results.content.settings.themes}<br>
                    Learn courses: ${results.content.learn.courses}
                </div>
                <div style="display:flex;gap:4px;">
                    <button onclick="UIVerifier.verify()" style="flex:1;padding:4px;background:rgba(0,255,136,0.2);border:1px solid #00ff88;border-radius:4px;color:#00ff88;cursor:pointer;font-size:10px;">Refresh</button>
                    <button onclick="UIVerifier.autoFix()" style="flex:1;padding:4px;background:rgba(255,170,0,0.2);border:1px solid #ffaa00;border-radius:4px;color:#ffaa00;cursor:pointer;font-size:10px;">Auto-Fix</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }
};

// Auto-run verification on load
window.addEventListener('load', () => {
    setTimeout(() => {
        UIVerifier.verify();
    }, 2000);
});

// Expose globally
window.UIVerifier = UIVerifier;
console.log('[UI-VERIFIER] Module loaded v1.0.0');
