// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - FORCE INITIALIZATION
// Ensures all modules load correctly
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL NUMBER FORMATTING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format a number with spaces for thousands (e.g., 100 000 000)
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} Formatted number with spaces
 */
window.formatNumberWithSpaces = function(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '0';

    // Format with French locale (uses spaces for thousands)
    const formatted = parseFloat(num).toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    return formatted;
};

/**
 * Format a currency value with spaces (e.g., $100 000.00)
 * @param {number} num - The number to format
 * @param {string} currency - Currency symbol (default $)
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} Formatted currency string
 */
window.formatCurrency = function(num, currency = '$', decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return currency + '0.00';

    const formatted = window.formatNumberWithSpaces(num, decimals);
    return currency + formatted;
};

/**
 * Format a compact number (e.g., 1.5M, 250K)
 * @param {number} num - The number to format
 * @returns {string} Compact formatted number
 */
window.formatCompact = function(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';

    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
};

(function() {
    'use strict';

    console.log('[FORCE-INIT] Starting module initialization...');

    // Wait for DOM ready
    function whenReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    whenReady(function() {
        setTimeout(function() {
            console.log('[FORCE-INIT] DOM ready, initializing modules...');

            // ═══════════════════════════════════════════════════════════════
            // 1. FORCE COMBOS INITIALIZATION
            // ═══════════════════════════════════════════════════════════════
            if (typeof CombosModule !== 'undefined' && CombosModule.comboData) {
                console.log('[FORCE-INIT] CombosModule found with', CombosModule.comboData.length, 'combos');
                CombosModule.combos = [...CombosModule.comboData];
                if (CombosModule.generateUltraCombos) {
                    CombosModule.combos = CombosModule.combos.concat(CombosModule.generateUltraCombos());
                }
                console.log('[FORCE-INIT] Total combos:', CombosModule.combos.length);
                if (CombosModule.render) CombosModule.render();
            } else {
                console.warn('[FORCE-INIT] CombosModule not found');
            }

            // ═══════════════════════════════════════════════════════════════
            // 2. FORCE INVESTMENTS UI INITIALIZATION
            // ═══════════════════════════════════════════════════════════════
            if (typeof InvestmentsUI !== 'undefined') {
                console.log('[FORCE-INIT] InvestmentsUI found');
                InvestmentsUI.currentTab = 'all';
                if (InvestmentsUI.render) InvestmentsUI.render();
            }

            // ═══════════════════════════════════════════════════════════════
            // 3. CREATE FLOATING CAPITAL SIMULÉ PANEL
            // ═══════════════════════════════════════════════════════════════
            createCapitalPanel();

            // ═══════════════════════════════════════════════════════════════
            // 4. INITIALIZE PORTFOLIO FIX
            // ═══════════════════════════════════════════════════════════════
            if (typeof PortfolioFix !== 'undefined' && PortfolioFix.init) {
                console.log('[FORCE-INIT] Initializing PortfolioFix');
                PortfolioFix.init();
            }

            // ═══════════════════════════════════════════════════════════════
            // 5. UPDATE BALANCE DISPLAYS
            // ═══════════════════════════════════════════════════════════════
            updateBalanceDisplays();

            // ═══════════════════════════════════════════════════════════════
            // 6. VERIFY AND FIX TABS CONTENT
            // ═══════════════════════════════════════════════════════════════
            verifyTabsContent();

            // ═══════════════════════════════════════════════════════════════
            // 7. INITIALIZE LEARN MODULE
            // ═══════════════════════════════════════════════════════════════
            if (typeof LearnModule !== 'undefined' && LearnModule.init) {
                console.log('[FORCE-INIT] Initializing LearnModule');
                LearnModule.init();
            }

            console.log('[FORCE-INIT] All modules initialized');
        }, 800);
    });

    // Create floating capital panel with REAL + SIMULATED balances
    function createCapitalPanel() {
        // Remove existing panel if any
        const existing = document.getElementById('floating-capital-panel');
        if (existing) existing.remove();

        // Create panel
        const panel = document.createElement('div');
        panel.id = 'floating-capital-panel';
        panel.innerHTML = `
            <div style="position:fixed;bottom:20px;right:20px;z-index:300;background:linear-gradient(135deg,#1a1a2e,#0d0d1a);border:2px solid rgba(0,255,136,0.5);border-radius:16px;padding:16px;min-width:300px;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
                <button onclick="document.getElementById('floating-capital-panel').style.display='none'" style="position:absolute;top:8px;right:8px;background:none;border:none;color:#666;cursor:pointer;font-size:16px;">✕</button>

                <!-- REAL Balance -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;margin-bottom:8px;background:linear-gradient(135deg,rgba(0,212,170,0.15),rgba(0,212,170,0.05));border:1px solid rgba(0,212,170,0.3);border-radius:10px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:18px;">💎</span>
                        <span style="color:#00d4aa;font-size:13px;font-weight:600;">Réel</span>
                    </div>
                    <span id="floating-real-balance" style="font-size:18px;color:#00d4aa;font-weight:bold;">$0.00</span>
                </div>

                <!-- SIMULATED Balance -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;margin-bottom:12px;background:linear-gradient(135deg,rgba(138,43,226,0.15),rgba(138,43,226,0.05));border:1px solid rgba(138,43,226,0.3);border-radius:10px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:18px;">🎮</span>
                        <span style="color:#a855f7;font-size:13px;font-weight:600;">Simulé</span>
                    </div>
                    <span id="floating-balance" style="font-size:18px;color:#a855f7;font-weight:bold;">$0.00</span>
                </div>

                <!-- Products count -->
                <div style="display:flex;justify-content:space-around;margin-bottom:12px;padding:8px;background:rgba(0,0,0,0.2);border-radius:8px;font-size:11px;">
                    <div style="text-align:center;">
                        <div id="products-real-count" style="color:#00d4aa;font-weight:bold;">0</div>
                        <div style="color:#666;">Produits réels</div>
                    </div>
                    <div style="text-align:center;">
                        <div id="products-sim-count" style="color:#a855f7;font-weight:bold;">0</div>
                        <div style="color:#666;">Produits simulés</div>
                    </div>
                </div>

                <!-- Add simulated capital buttons -->
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button onclick="addSimulatedCapital(100)" style="flex:1;min-width:55px;padding:6px;background:rgba(138,43,226,0.2);border:1px solid #a855f7;border-radius:6px;color:#a855f7;font-weight:bold;cursor:pointer;font-size:12px;">+$100</button>
                    <button onclick="addSimulatedCapital(1000)" style="flex:1;min-width:55px;padding:6px;background:rgba(138,43,226,0.2);border:1px solid #a855f7;border-radius:6px;color:#a855f7;font-weight:bold;cursor:pointer;font-size:12px;">+$1K</button>
                    <button onclick="addSimulatedCapital(10000)" style="flex:1;min-width:55px;padding:6px;background:rgba(138,43,226,0.2);border:1px solid #a855f7;border-radius:6px;color:#a855f7;font-weight:bold;cursor:pointer;font-size:12px;">+$10K</button>
                    <button onclick="addSimulatedCapital(100000)" style="flex:1;min-width:55px;padding:6px;background:rgba(138,43,226,0.3);border:1px solid #a855f7;border-radius:6px;color:#a855f7;font-weight:bold;cursor:pointer;font-size:12px;">+$100K</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        console.log('[FORCE-INIT] Capital panel created with real/simulated balances');
    }

    // Global function to add simulated capital
    window.addSimulatedCapital = function(amount) {
        // Use PortfolioFix if available
        if (typeof PortfolioFix !== 'undefined' && PortfolioFix.addSimulated) {
            PortfolioFix.addSimulated(amount);
        }
        // Fallback to SimulatedPortfolio
        else if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.balance = (SimulatedPortfolio.balance || 0) + amount;
            if (SimulatedPortfolio.save) SimulatedPortfolio.save();
        }
        // Ultimate fallback - localStorage
        else {
            try {
                const data = JSON.parse(localStorage.getItem('simulated_portfolio') || '{}');
                data.balance = (data.balance || 0) + amount;
                localStorage.setItem('simulated_portfolio', JSON.stringify(data));
            } catch(e) {}
        }

        updateBalanceDisplays();
        showNotification('Added $' + amount.toLocaleString() + ' to simulated capital', 'success');
    };

    // Update all balance displays (REAL + SIMULATED)
    function updateBalanceDisplays() {
        let simBalance = 0;
        let realBalance = 0;
        let productsReal = 0;
        let productsSim = 0;

        // Get balances from SimulatedPortfolio
        if (typeof SimulatedPortfolio !== 'undefined') {
            simBalance = SimulatedPortfolio.portfolio?.simulatedBalance || SimulatedPortfolio.balance || 0;
            realBalance = SimulatedPortfolio.portfolio?.realBalance || 0;

            // Count investments by type
            const investments = SimulatedPortfolio.portfolio?.investments || [];
            investments.forEach(inv => {
                if (inv.isSimulated) {
                    productsSim++;
                } else {
                    productsReal++;
                }
            });
        } else {
            try {
                const data = JSON.parse(localStorage.getItem('simulated_portfolio') || '{}');
                simBalance = data.simulatedBalance || data.balance || 0;
                realBalance = data.realBalance || 0;
                const investments = data.investments || [];
                investments.forEach(inv => {
                    if (inv.isSimulated) productsSim++;
                    else productsReal++;
                });
            } catch(e) {}
        }

        // Format with spaces for thousands
        const formatBal = (val) => {
            if (typeof window.formatCurrency === 'function') {
                return window.formatCurrency(val);
            }
            return '$' + val.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        };

        const formattedSim = formatBal(simBalance);
        const formattedReal = formatBal(realBalance);

        // Update floating panel - SIMULATED
        const floatingBalance = document.getElementById('floating-balance');
        if (floatingBalance) floatingBalance.textContent = formattedSim;

        // Update floating panel - REAL
        const floatingRealBalance = document.getElementById('floating-real-balance');
        if (floatingRealBalance) floatingRealBalance.textContent = formattedReal;

        // Update products count
        const productsRealCount = document.getElementById('products-real-count');
        const productsSimCount = document.getElementById('products-sim-count');
        if (productsRealCount) productsRealCount.textContent = productsReal;
        if (productsSimCount) productsSimCount.textContent = productsSim;

        // Update all .sim-balance-display elements
        document.querySelectorAll('.sim-balance-display').forEach(el => {
            el.textContent = formattedSim;
        });

        // Update all .real-balance-display elements
        document.querySelectorAll('.real-balance-display').forEach(el => {
            el.textContent = formattedReal;
        });

        // Update balance header if exists
        const balanceHeader = document.getElementById('portfolio-balance');
        if (balanceHeader) balanceHeader.textContent = formattedSim;
    }

    // Simple notification
    function showNotification(msg, type) {
        const notif = document.createElement('div');
        notif.style.cssText = 'position:fixed;top:20px;right:20px;z-index:600;padding:12px 24px;border-radius:8px;font-weight:bold;animation:slideIn 0.3s;' +
            (type === 'success' ? 'background:#00ff88;color:#000;' : 'background:#ff6464;color:#fff;');
        notif.textContent = msg;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    // Verify and fix tabs content
    function verifyTabsContent() {
        console.log('[FORCE-INIT] Verifying tabs content...');

        // Define tabs to verify
        const tabsToVerify = [
            { id: 'tab-settings', name: 'Settings', minContent: 500 },
            { id: 'tab-learn', name: 'Learn', minContent: 500 }
        ];

        tabsToVerify.forEach(tab => {
            const element = document.getElementById(tab.id);
            if (!element) {
                console.error('[FORCE-INIT] Tab not found:', tab.id);
                return;
            }

            // Check if content exists
            const contentLength = element.innerHTML.length;
            console.log(`[FORCE-INIT] ${tab.name} tab: ${contentLength} chars`);

            if (contentLength < tab.minContent) {
                console.warn(`[FORCE-INIT] ${tab.name} tab has insufficient content`);
            }

            // Ensure tab-content styling is correct
            const computedStyle = getComputedStyle(element);
            if (element.classList.contains('active') && computedStyle.display === 'none') {
                console.warn(`[FORCE-INIT] ${tab.name} active but hidden - fixing...`);
                element.style.display = 'block';
            }

            // Check for child elements
            const childCount = element.querySelectorAll('*').length;
            console.log(`[FORCE-INIT] ${tab.name} has ${childCount} child elements`);
        });

        // Verify Settings specific elements
        const settingsElements = {
            'theme-selector': document.getElementById('theme-selector'),
            'anim-speed': document.getElementById('anim-speed'),
            'btn-save-settings': document.getElementById('btn-save-settings')
        };

        let settingsOk = true;
        Object.entries(settingsElements).forEach(([name, el]) => {
            if (!el) {
                console.warn(`[FORCE-INIT] Settings element missing: ${name}`);
                settingsOk = false;
            }
        });

        if (settingsOk) {
            console.log('[FORCE-INIT] Settings elements verified OK');
        }

        // Verify Learn specific elements
        const learnElements = {
            'learn-progress-ring': document.getElementById('learn-progress-ring'),
            'learn-progress-text': document.getElementById('learn-progress-text')
        };

        let learnOk = true;
        Object.entries(learnElements).forEach(([name, el]) => {
            if (!el) {
                console.warn(`[FORCE-INIT] Learn element missing: ${name}`);
                learnOk = false;
            }
        });

        if (learnOk) {
            console.log('[FORCE-INIT] Learn elements verified OK');
        }

        // Count learn cards
        const learnCards = document.querySelectorAll('.learn-card');
        console.log(`[FORCE-INIT] Found ${learnCards.length} learn cards`);

        // Initialize learn card buttons
        learnCards.forEach(card => {
            const btn = card.querySelector('.btn-start-course');
            if (btn && !btn.hasAttribute('data-init')) {
                btn.setAttribute('data-init', 'true');
                btn.addEventListener('click', function() {
                    const courseId = card.dataset.course;
                    console.log('[FORCE-INIT] Starting course:', courseId);
                    if (typeof LearnModule !== 'undefined' && LearnModule.startCourse) {
                        LearnModule.startCourse(courseId);
                    }
                });
            }
        });

        // Fix animation options
        const animOptions = document.querySelectorAll('.animation-option');
        console.log(`[FORCE-INIT] Found ${animOptions.length} animation options`);
        animOptions.forEach(opt => {
            if (!opt.hasAttribute('data-init')) {
                opt.setAttribute('data-init', 'true');
                opt.addEventListener('click', function() {
                    const anim = opt.dataset.animation;
                    console.log('[FORCE-INIT] Setting animation:', anim);
                    // Remove active from all
                    animOptions.forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                    // Apply animation
                    if (typeof BackgroundAnimations !== 'undefined') {
                        BackgroundAnimations.setAnimation(anim);
                    }
                });
            }
        });

        // Fix theme options
        const themeOptions = document.querySelectorAll('.theme-option');
        console.log(`[FORCE-INIT] Found ${themeOptions.length} theme options`);

        console.log('[FORCE-INIT] Tabs verification complete');
    }

    // Force re-render all UI modules
    function forceRenderAll() {
        console.log('[FORCE-INIT] Force rendering all UI modules...');

        // Combos
        if (typeof CombosModule !== 'undefined' && CombosModule.render) {
            if (CombosModule.comboData && (!CombosModule.combos || CombosModule.combos.length === 0)) {
                CombosModule.combos = [...CombosModule.comboData];
                if (CombosModule.generateUltraCombos) {
                    CombosModule.combos = CombosModule.combos.concat(CombosModule.generateUltraCombos());
                }
            }
            CombosModule.render();
            console.log('[FORCE-INIT] CombosModule rendered');
        }

        // Investments UI
        if (typeof InvestmentsUI !== 'undefined' && InvestmentsUI.render) {
            InvestmentsUI.render();
            console.log('[FORCE-INIT] InvestmentsUI rendered');
        }

        // Investment Products
        if (typeof InvestmentProducts !== 'undefined' && InvestmentProducts.init) {
            InvestmentProducts.init();
        }

        // Learn Module
        if (typeof LearnModule !== 'undefined' && LearnModule.init) {
            LearnModule.init();
        }

        // Staking
        if (typeof StakingModule !== 'undefined' && StakingModule.render) {
            StakingModule.render();
        }

        // Vaults
        if (typeof VaultsModule !== 'undefined' && VaultsModule.render) {
            VaultsModule.render();
        }

        // Lending
        if (typeof LendingModule !== 'undefined' && LendingModule.render) {
            LendingModule.render();
        }

        // Bonds
        if (typeof BondsModule !== 'undefined' && BondsModule.render) {
            BondsModule.render();
        }

        // Insurance
        if (typeof InsuranceModule !== 'undefined' && InsuranceModule.render) {
            InsuranceModule.render();
        }

        // Update balances
        updateBalanceDisplays();

        console.log('[FORCE-INIT] All UI modules rendered');
    }

    // Expose for debugging
    window.ForceInit = {
        reinit: function() {
            createCapitalPanel();
            verifyTabsContent();
            forceRenderAll();
        },
        renderAll: forceRenderAll,
        verifyTabs: verifyTabsContent,
        showPanel: function() {
            const panel = document.getElementById('floating-capital-panel');
            if (panel) panel.style.display = 'block';
            else createCapitalPanel();
        }
    };
})();
