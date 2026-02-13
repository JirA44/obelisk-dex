/* ============================================
   SOLUTIONS HUB - Central Orchestrator
   Manages the Solutions tab: segment filter, card grid, module registry
   ============================================ */

const SolutionsHub = {
    solutions: [],
    currentSegment: 'all',
    activeModule: null,

    registerSolution(id, module, segment, meta) {
        if (this.solutions.find(s => s.id === id)) return;
        this.solutions.push({ id, module, segment, ...meta });
        console.log('[SolutionsHub] Registered:', id, '(' + segment + ')');
    },

    init() {
        this.bindSegmentTabs();
        this.render();
        // Sync with hero client-selector if a segment was already chosen
        const activeClient = document.querySelector('.client-option.active');
        if (activeClient) {
            const text = activeClient.textContent.trim().toLowerCase();
            if (text === 'retail') this.setSegment('retail');
            else if (text === 'pro') this.setSegment('business');
            else if (text === 'institutional') this.setSegment('institutional');
        }
        console.log('[SolutionsHub] Init -', this.solutions.length, 'solutions');
    },

    setSegment(segment) {
        this.currentSegment = segment;
        // Update segment tabs
        document.querySelectorAll('.solutions-segment-tab').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.segment === segment);
        });
        this.renderGrid();
    },

    bindSegmentTabs() {
        var self = this;
        document.querySelectorAll('.solutions-segment-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.setSegment(this.dataset.segment);
            });
        });
    },

    getFilteredSolutions() {
        if (this.currentSegment === 'all') return this.solutions;
        return this.solutions.filter(function(s) {
            return s.segment === this.currentSegment || s.segment === 'shared';
        }.bind(this));
    },

    render() {
        this.renderGrid();
    },

    renderGrid() {
        var grid = document.getElementById('solutions-grid');
        if (!grid) return;
        var filtered = this.getFilteredSolutions();

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="sol-empty"><div class="sol-empty-icon">🔍</div><div class="sol-empty-text">No solutions found for this segment</div></div>';
            return;
        }

        var html = '';
        filtered.forEach(function(sol) {
            html += '<div class="solution-card" data-segment="' + sol.segment + '" data-solution="' + sol.id + '">' +
                '<div class="solution-card-icon">' + (sol.icon || '📦') + '</div>' +
                '<div class="solution-card-name">' + (sol.name || sol.id) + '</div>' +
                '<div class="solution-card-desc">' + (sol.description || '') + '</div>' +
                '<span class="solution-card-badge ' + sol.segment + '">' + sol.segment + '</span>' +
                '</div>';
        });
        grid.innerHTML = html;

        // Bind card clicks
        var self = this;
        grid.querySelectorAll('.solution-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var solId = this.dataset.solution;
                self.openSolution(solId);
            });
        });
    },

    openSolution(id) {
        var sol = this.solutions.find(function(s) { return s.id === id; });
        if (!sol || !sol.module) return;

        // Create overlay
        var overlay = document.createElement('div');
        overlay.className = 'solution-detail-overlay';
        overlay.id = 'solution-overlay';
        overlay.innerHTML =
            '<div class="solution-detail-panel">' +
            '<button class="solution-detail-close" id="solution-close">&times;</button>' +
            '<div class="solution-detail-header">' +
            '<span class="icon">' + (sol.icon || '📦') + '</span>' +
            '<h2>' + (sol.name || sol.id) + '</h2>' +
            '</div>' +
            '<div class="solution-detail-body" id="solution-body"></div>' +
            '</div>';

        document.body.appendChild(overlay);
        this.activeModule = sol;

        // Close handlers
        var closeBtn = document.getElementById('solution-close');
        closeBtn.addEventListener('click', function() { SolutionsHub.closeSolution(); });
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) SolutionsHub.closeSolution();
        });

        // Render module
        if (sol.module.init) sol.module.init();
        if (sol.module.render) sol.module.render('solution-body');
    },

    closeSolution() {
        var overlay = document.getElementById('solution-overlay');
        if (overlay) overlay.remove();
        this.activeModule = null;
    },

    // Utility: navigate to Solutions tab and optionally open a specific solution
    navigateTo(solutionId, segment) {
        if (typeof ObeliskApp !== 'undefined') {
            ObeliskApp.switchTab('solutions');
        } else if (typeof window.showTab === 'function') {
            window.showTab('solutions');
        }
        if (segment) this.setSegment(segment);
        if (solutionId) {
            var self = this;
            setTimeout(function() { self.openSolution(solutionId); }, 100);
        }
    }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() { SolutionsHub.init(); }, 500);
});
