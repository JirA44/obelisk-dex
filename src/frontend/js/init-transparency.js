/**
 * TRANSPARENCY TAB INITIALIZATION - Obelisk DEX
 * Initializes the fee transparency page when tab is selected
 */

(function() {
    let initialized = false;

    function initTransparencyTab() {
        if (initialized) return;

        // Check if FeeTransparency is loaded
        if (typeof FeeTransparency === 'undefined') {
            console.warn('[Transparency] FeeTransparency module not loaded yet');
            return;
        }

        console.log('[Transparency] Initializing transparency tab...');

        // Render revenue model
        FeeTransparency.renderRevenueModel('revenue-model-section');

        // Render fees list
        FeeTransparency.renderFeesList('fees-list-section');

        // Render PFOF explanation
        FeeTransparency.renderPFOFExplanation('pfof-explanation-section');

        // Render competitor comparison
        FeeTransparency.renderComparison('competitor-comparison-section');

        // Render fee calculator
        FeeTransparency.renderCalculator('fee-calculator-section');

        initialized = true;
        console.log('[Transparency] Tab initialized successfully');
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Listen for tab clicks
        const transparencyButton = document.getElementById('btn-transparency-nav');
        if (transparencyButton) {
            transparencyButton.addEventListener('click', () => {
                setTimeout(initTransparencyTab, 100);
            });
        }

        // Also listen for nav-tab clicks in case it's added there
        document.querySelectorAll('[data-tab="transparency"]').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(initTransparencyTab, 100);
            });
        });

        // Initialize if tab is already active (deep link)
        if (window.location.hash === '#transparency') {
            setTimeout(initTransparencyTab, 500);
        }
    });

    // Export for manual initialization
    window.initTransparencyTab = initTransparencyTab;
})();
