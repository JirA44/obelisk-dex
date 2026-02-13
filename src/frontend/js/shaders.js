/**
 * OBELISK SHADERS - Dynamic Visual Effects
 * Build: 2026-01-26
 */

const ObeliskShaders = {
    enabled: true,
    particles: [],
    maxParticles: 15,
    particleContainer: null,

    init() {
        // Respect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.enabled = false;
            console.log('[Shaders] Disabled - reduced motion preferred');
            return;
        }

        // Disable on mobile for performance
        if (window.innerWidth < 768) {
            this.enabled = false;
            console.log('[Shaders] Disabled - mobile device');
            return;
        }

        this.particleContainer = document.getElementById('shader-particles');
        if (!this.particleContainer) {
            this.particleContainer = document.createElement('div');
            this.particleContainer.id = 'shader-particles';
            this.particleContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
            document.body.prepend(this.particleContainer);
        }

        this.startParticleSystem();
        this.addSpeedLines();
        this.addGlowToElements();

        console.log('[Shaders] Visual effects initialized');
    },

    // Floating particles system
    startParticleSystem() {
        if (!this.enabled) return;

        const createParticle = () => {
            if (this.particles.length >= this.maxParticles) return;

            const particle = document.createElement('div');
            particle.className = 'floating-particle';

            // Random color
            const colors = ['', 'blue', 'purple'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            if (color) particle.classList.add(color);

            // Random position and timing
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDuration = (6 + Math.random() * 6) + 's';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.opacity = 0.3 + Math.random() * 0.4;

            this.particleContainer.appendChild(particle);
            this.particles.push(particle);

            // Remove after animation
            const duration = parseFloat(particle.style.animationDuration) * 1000;
            setTimeout(() => {
                particle.remove();
                const idx = this.particles.indexOf(particle);
                if (idx > -1) this.particles.splice(idx, 1);
            }, duration + 2000);
        };

        // Create initial particles
        for (let i = 0; i < 5; i++) {
            setTimeout(createParticle, i * 500);
        }

        // Continuously spawn particles
        setInterval(createParticle, 2000);
    },

    // Speed lines effect
    addSpeedLines() {
        if (!this.enabled) return;

        const createSpeedLine = () => {
            const line = document.createElement('div');
            line.className = 'speed-line';
            line.style.top = Math.random() * 100 + 'vh';
            line.style.animationDuration = (1 + Math.random() * 2) + 's';
            line.style.opacity = 0.2 + Math.random() * 0.3;

            this.particleContainer.appendChild(line);

            setTimeout(() => line.remove(), 3000);
        };

        // Occasional speed lines
        setInterval(createSpeedLine, 4000);
    },

    // Add glow classes to interactive elements
    addGlowToElements() {
        // Add pulse effect to primary buttons
        document.querySelectorAll('.btn-primary, .btn-trade').forEach(el => {
            el.classList.add('neon-glow');
        });

        // Add hologram effect to stat cards
        document.querySelectorAll('.stat-value, .balance-amount').forEach(el => {
            el.classList.add('hologram');
        });
    },

    // Flash effect for trades/transactions
    flashTrade(element, type = 'success') {
        if (!element) return;

        const color = type === 'success' ? 'rgba(0,255,136,0.3)' : 'rgba(239,68,68,0.3)';
        element.style.transition = 'background 0.1s';
        element.style.background = color;

        setTimeout(() => {
            element.style.background = '';
        }, 300);
    },

    // Price update animation
    animatePrice(element, isUp) {
        if (!element) return;
        element.classList.remove('price-up', 'price-down');
        void element.offsetWidth; // Force reflow
        element.classList.add(isUp ? 'price-up' : 'price-down');
    },

    // Activity indicator
    createActivityIndicator(container, status = 'active') {
        const indicator = document.createElement('div');
        indicator.className = 'activity-indicator';
        if (status === 'warning') indicator.classList.add('warning');
        if (status === 'danger') indicator.classList.add('danger');
        container.appendChild(indicator);
        return indicator;
    },

    // Energy bars visualization
    createEnergyBars(container, count = 5) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;gap:2px;align-items:flex-end;height:24px;';

        for (let i = 0; i < count; i++) {
            const bar = document.createElement('div');
            bar.className = 'energy-bar';
            bar.style.animationDelay = (i * 0.1) + 's';
            wrapper.appendChild(bar);
        }

        container.appendChild(wrapper);
        return wrapper;
    },

    // Toggle shader effects
    toggle(enabled) {
        this.enabled = enabled;
        document.body.classList.toggle('obelisk-scanlines', enabled);
        document.body.classList.toggle('obelisk-crt', enabled);

        const hexOverlay = document.querySelector('.hex-overlay');
        const cyberFloor = document.querySelector('.cyber-floor');
        if (hexOverlay) hexOverlay.style.display = enabled ? '' : 'none';
        if (cyberFloor) cyberFloor.style.display = enabled ? '' : 'none';

        console.log('[Shaders]', enabled ? 'Enabled' : 'Disabled');
    },

    // Cleanup
    destroy() {
        this.particles.forEach(p => p.remove());
        this.particles = [];
        this.enabled = false;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Delay shader init to not block critical rendering
    setTimeout(() => ObeliskShaders.init(), 500);
});

// Export for global access
window.ObeliskShaders = ObeliskShaders;
