/**
 * Obelisk DEX - Collapsible Panels System v1.0
 * Allows panels to be collapsed/expanded with smooth animations
 */

class CollapsiblePanels {
    constructor() {
        this.panels = new Map();
        this.storageKey = 'obelisk_panel_states';
        this.allCollapsed = false;
        this.init();
    }

    init() {
        // Load saved states
        this.loadStates();

        // Initialize all panels
        document.querySelectorAll('.collapsible-panel').forEach(panel => {
            this.initPanel(panel);
        });

        // Add global collapse button
        this.addCollapseAllButton();

        // Keyboard shortcut: Ctrl+Shift+C to toggle all
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.toggleAll();
            }
        });

        console.log('[Collapsible] Initialized', this.panels.size, 'panels');
    }

    initPanel(panel) {
        const id = panel.dataset.panelId || panel.id || `panel-${this.panels.size}`;
        panel.dataset.panelId = id;

        const header = panel.querySelector('.panel-header');
        if (!header) return;

        // Store panel reference
        this.panels.set(id, {
            element: panel,
            collapsed: this.savedStates?.[id] || false
        });

        // Apply saved state
        if (this.savedStates?.[id]) {
            panel.classList.add('collapsed');
        }

        // Add click handler
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking on buttons inside header
            if (e.target.closest('button:not(.panel-toggle)')) return;
            this.toggle(id);
        });

        // Add toggle button if not present
        if (!header.querySelector('.panel-toggle')) {
            const toggle = document.createElement('div');
            toggle.className = 'panel-toggle';
            toggle.innerHTML = '<span class="chevron">▼</span>';
            header.appendChild(toggle);
        }
    }

    toggle(panelId) {
        const panelData = this.panels.get(panelId);
        if (!panelData) return;

        const { element } = panelData;
        const isCollapsed = element.classList.toggle('collapsed');

        panelData.collapsed = isCollapsed;
        this.saveStates();

        // Emit custom event
        element.dispatchEvent(new CustomEvent('panel-toggle', {
            detail: { collapsed: isCollapsed, panelId }
        }));
    }

    expand(panelId) {
        const panelData = this.panels.get(panelId);
        if (!panelData) return;

        panelData.element.classList.remove('collapsed');
        panelData.collapsed = false;
        this.saveStates();
    }

    collapse(panelId) {
        const panelData = this.panels.get(panelId);
        if (!panelData) return;

        panelData.element.classList.add('collapsed');
        panelData.collapsed = true;
        this.saveStates();
    }

    toggleAll() {
        this.allCollapsed = !this.allCollapsed;

        this.panels.forEach((data, id) => {
            if (this.allCollapsed) {
                this.collapse(id);
            } else {
                this.expand(id);
            }
        });

        this.updateCollapseButton();
    }

    expandAll() {
        this.allCollapsed = false;
        this.panels.forEach((_, id) => this.expand(id));
        this.updateCollapseButton();
    }

    collapseAll() {
        this.allCollapsed = true;
        this.panels.forEach((_, id) => this.collapse(id));
        this.updateCollapseButton();
    }

    addCollapseAllButton() {
        const btn = document.createElement('button');
        btn.className = 'collapse-all-btn';
        btn.id = 'collapse-all-btn';
        btn.innerHTML = `
            <span class="icon">◫</span>
            <span class="text">Toggle Panels</span>
        `;
        btn.title = 'Ctrl+Shift+C';
        btn.addEventListener('click', () => this.toggleAll());
        document.body.appendChild(btn);
    }

    updateCollapseButton() {
        const btn = document.getElementById('collapse-all-btn');
        if (!btn) return;

        const text = btn.querySelector('.text');
        const icon = btn.querySelector('.icon');

        if (this.allCollapsed) {
            text.textContent = 'Expand All';
            icon.textContent = '◳';
        } else {
            text.textContent = 'Collapse All';
            icon.textContent = '◫';
        }
    }

    saveStates() {
        const states = {};
        this.panels.forEach((data, id) => {
            states[id] = data.collapsed;
        });

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(states));
        } catch (e) {
            console.warn('[Collapsible] Could not save states:', e);
        }
    }

    loadStates() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            this.savedStates = saved ? JSON.parse(saved) : {};
        } catch (e) {
            this.savedStates = {};
        }
    }

    // Helper to wrap existing content in collapsible panel
    static wrapInPanel(container, title, icon = '', options = {}) {
        const panel = document.createElement('div');
        panel.className = 'collapsible-panel';
        if (options.id) panel.dataset.panelId = options.id;

        const header = document.createElement('div');
        header.className = 'panel-header';
        header.innerHTML = `
            <div class="panel-title">
                ${icon ? `<span class="panel-title-icon">${icon}</span>` : ''}
                <span>${title}</span>
                ${options.badge ? `<span class="panel-badge">${options.badge}</span>` : ''}
            </div>
            <span class="panel-minimized-info">${options.minimizedText || 'Click to expand'}</span>
            <div class="panel-toggle"><span class="chevron">▼</span></div>
        `;

        const content = document.createElement('div');
        content.className = 'panel-content';

        // Move container's children to content
        while (container.firstChild) {
            content.appendChild(container.firstChild);
        }

        panel.appendChild(header);
        panel.appendChild(content);
        container.appendChild(panel);

        return panel;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.collapsiblePanels = new CollapsiblePanels();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollapsiblePanels;
}
