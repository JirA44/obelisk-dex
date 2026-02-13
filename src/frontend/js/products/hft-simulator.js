/**
 * HFT SIMULATOR MODULE - High Frequency Trading Simulation
 * Experience HFT strategies with virtual funds
 * Build: 2026-01-26 - Added Shaders & SFX
 */

// === SFX ENGINE - Web Audio API Sound Effects ===
const HFTSoundFX = {
    ctx: null,
    enabled: true,
    volume: 0.3,

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('[SFX] Audio context initialized');
        } catch (e) {
            console.warn('[SFX] Audio not supported');
            this.enabled = false;
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // Beep sound for orders
    playOrder() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = 800 + Math.random() * 400;
        osc.type = 'sine';
        gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
        gain.gain.exponentialDecayTo && gain.gain.exponentialDecayTo(0.001, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.05);
    },

    // Fill sound - higher pitch success
    playFill() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = 1200;
        osc.type = 'sine';
        gain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.08);
    },

    // Profit sound - ascending tone
    playProfit() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.15);
        osc.type = 'sine';
        gain.gain.setValueAtTime(this.volume * 0.25, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.2);
    },

    // Loss sound - descending tone
    playLoss() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.2);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.25);
    },

    // Start simulation - power up sound
    playStart() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        [400, 600, 800, 1000].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(this.volume * 0.2, this.ctx.currentTime + i * 0.08 + 0.02);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.1);
            osc.start(this.ctx.currentTime + i * 0.08);
            osc.stop(this.ctx.currentTime + i * 0.08 + 0.1);
        });
    },

    // Stop simulation - power down sound
    playStop() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        [800, 600, 400, 200].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(this.volume * 0.15, this.ctx.currentTime + i * 0.1 + 0.02);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.12);
            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.12);
        });
    },

    // Alert/warning sound
    playAlert() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'square';
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.15);
            gain.gain.linearRampToValueAtTime(this.volume * 0.1, this.ctx.currentTime + i * 0.15 + 0.01);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.15 + 0.08);
            osc.start(this.ctx.currentTime + i * 0.15);
            osc.stop(this.ctx.currentTime + i * 0.15 + 0.08);
        }
    },

    // Click sound for UI
    playClick() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = 1500;
        osc.type = 'sine';
        gain.gain.setValueAtTime(this.volume * 0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.03);
    }
};

// === SHADER EFFECTS - CSS Animations & Visual FX ===
const HFTShaders = {
    injected: false,

    injectStyles() {
        if (this.injected) return;
        this.injected = true;

        const style = document.createElement('style');
        style.id = 'hft-shaders';
        style.textContent = `
            /* === HFT SHADER EFFECTS === */

            /* Scanline overlay effect */
            .hft-scanlines::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0, 255, 136, 0.03) 2px,
                    rgba(0, 255, 136, 0.03) 4px
                );
                pointer-events: none;
                z-index: 1;
            }

            /* Glow effect on cards */
            .hft-card-glow {
                position: relative;
                overflow: hidden;
            }
            .hft-card-glow::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 70%);
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
            }
            .hft-card-glow:hover::after {
                opacity: 1;
            }

            /* Pulse animation for active simulations */
            @keyframes hft-pulse {
                0%, 100% { box-shadow: 0 0 5px rgba(0,255,136,0.3), inset 0 0 5px rgba(0,255,136,0.1); }
                50% { box-shadow: 0 0 20px rgba(0,255,136,0.6), inset 0 0 10px rgba(0,255,136,0.2); }
            }
            .hft-active-pulse {
                animation: hft-pulse 2s ease-in-out infinite;
            }

            /* Data stream animation */
            @keyframes hft-data-flow {
                0% { background-position: 0% 0%; }
                100% { background-position: 200% 0%; }
            }
            .hft-data-stream {
                background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(0,255,136,0.1) 25%,
                    rgba(59,130,246,0.1) 50%,
                    rgba(0,255,136,0.1) 75%,
                    transparent 100%
                );
                background-size: 200% 100%;
                animation: hft-data-flow 3s linear infinite;
            }

            /* Particle container */
            .hft-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }

            /* Individual particle */
            @keyframes hft-particle-rise {
                0% { transform: translateY(100%) scale(0); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translateY(-100%) scale(1); opacity: 0; }
            }
            .hft-particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: #00ff88;
                border-radius: 50%;
                animation: hft-particle-rise 2s ease-out forwards;
            }
            .hft-particle.blue { background: #3b82f6; }
            .hft-particle.orange { background: #f59e0b; }
            .hft-particle.red { background: #ef4444; }

            /* Number ticker animation */
            @keyframes hft-ticker {
                0% { transform: translateY(-100%); opacity: 0; }
                20% { transform: translateY(0); opacity: 1; }
                80% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(100%); opacity: 0; }
            }
            .hft-ticker {
                display: inline-block;
                animation: hft-ticker 0.5s ease-out;
            }

            /* Glitch effect for high-risk */
            @keyframes hft-glitch {
                0%, 100% { transform: translate(0); }
                20% { transform: translate(-2px, 2px); }
                40% { transform: translate(-2px, -2px); }
                60% { transform: translate(2px, 2px); }
                80% { transform: translate(2px, -2px); }
            }
            .hft-glitch:hover {
                animation: hft-glitch 0.3s ease infinite;
            }

            /* Matrix rain effect */
            @keyframes hft-matrix-fall {
                0% { transform: translateY(-100%); opacity: 1; }
                100% { transform: translateY(1000%); opacity: 0; }
            }
            .hft-matrix-char {
                position: absolute;
                color: #00ff88;
                font-family: monospace;
                font-size: 14px;
                opacity: 0.7;
                animation: hft-matrix-fall linear infinite;
                text-shadow: 0 0 5px #00ff88;
            }

            /* Neon border effect */
            @keyframes hft-neon-border {
                0%, 100% { border-color: rgba(0,255,136,0.5); box-shadow: 0 0 5px rgba(0,255,136,0.3); }
                50% { border-color: rgba(0,255,136,1); box-shadow: 0 0 15px rgba(0,255,136,0.5), 0 0 30px rgba(0,255,136,0.3); }
            }
            .hft-neon-border {
                animation: hft-neon-border 2s ease-in-out infinite;
            }

            /* Trading activity indicator */
            @keyframes hft-blink {
                0%, 50%, 100% { opacity: 1; }
                25%, 75% { opacity: 0.3; }
            }
            .hft-activity-light {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #00ff88;
                animation: hft-blink 0.5s infinite;
                box-shadow: 0 0 10px #00ff88;
            }

            /* Holographic shimmer */
            @keyframes hft-hologram {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            .hft-hologram {
                background: linear-gradient(
                    90deg,
                    transparent 0%,
                    rgba(0,255,136,0.1) 45%,
                    rgba(59,130,246,0.2) 50%,
                    rgba(0,255,136,0.1) 55%,
                    transparent 100%
                );
                background-size: 200% 100%;
                animation: hft-hologram 3s linear infinite;
            }

            /* Terminal cursor blink */
            @keyframes hft-cursor {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            .hft-cursor::after {
                content: '▊';
                color: #00ff88;
                animation: hft-cursor 1s step-end infinite;
            }

            /* Speed lines */
            @keyframes hft-speed-line {
                0% { transform: translateX(-100%); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateX(200%); opacity: 0; }
            }
            .hft-speed-line {
                position: absolute;
                height: 1px;
                width: 50px;
                background: linear-gradient(90deg, transparent, #00ff88, transparent);
                animation: hft-speed-line 0.8s ease-out;
            }

            /* Order flash */
            @keyframes hft-order-flash {
                0% { background: rgba(0,255,136,0.3); }
                100% { background: transparent; }
            }
            .hft-order-flash {
                animation: hft-order-flash 0.2s ease-out;
            }

            /* Volume bars animation */
            @keyframes hft-volume-bar {
                0%, 100% { transform: scaleY(0.3); }
                50% { transform: scaleY(1); }
            }
            .hft-volume-bar {
                width: 3px;
                height: 20px;
                background: #00ff88;
                transform-origin: bottom;
                animation: hft-volume-bar 0.5s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    },

    // Create particle burst effect
    createParticleBurst(container, count = 10, colors = ['', 'blue', 'orange']) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'hft-particle ' + colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            particle.style.animationDuration = (1 + Math.random()) + 's';
            container.appendChild(particle);
            setTimeout(() => particle.remove(), 2500);
        }
    },

    // Create matrix rain effect
    createMatrixRain(container, duration = 5000) {
        const chars = '01アイウエオカキクケコ$€¥£';
        const columns = Math.floor(container.offsetWidth / 20);

        for (let i = 0; i < columns; i++) {
            setTimeout(() => {
                const char = document.createElement('div');
                char.className = 'hft-matrix-char';
                char.textContent = chars[Math.floor(Math.random() * chars.length)];
                char.style.left = (i * 20 + Math.random() * 10) + 'px';
                char.style.animationDuration = (2 + Math.random() * 3) + 's';
                container.appendChild(char);
                setTimeout(() => char.remove(), 5000);
            }, Math.random() * duration);
        }
    },

    // Create speed lines
    createSpeedLines(container, count = 5) {
        for (let i = 0; i < count; i++) {
            const line = document.createElement('div');
            line.className = 'hft-speed-line';
            line.style.top = Math.random() * 100 + '%';
            line.style.animationDelay = Math.random() * 0.3 + 's';
            container.appendChild(line);
            setTimeout(() => line.remove(), 1000);
        }
    },

    // Flash effect on element
    flashElement(element) {
        element.classList.add('hft-order-flash');
        setTimeout(() => element.classList.remove('hft-order-flash'), 200);
    }
};

const HFTSimulatorModule = {
    strategies: [
        // === NANO ($1-$4) - Ultra petit capital, L2 uniquement ===
        { id: 'nano-scalp-1', name: '$1 Nano Scalper', type: 'nano', pair: 'ETH/USDC', latencyMs: 15, ordersPerSec: 3, fillRate: 92, pnlPerHour: 0.002, risk: 2.0, minCapital: 1, category: 'nano', icon: '🪙', description: 'Scalping à $1 sur Base/Optimism (frais < $0.001)' },
        { id: 'nano-grid-1', name: '$1 Nano Grid', type: 'nano', pair: 'ETH/USDC', latencyMs: 30, ordersPerSec: 2, fillRate: 95, pnlPerHour: 0.001, risk: 1.5, minCapital: 1, category: 'nano', icon: '🪙', description: 'Grid bot minimal à $1, 3 niveaux sur Base' },
        { id: 'nano-dca-1', name: '$1 Nano DCA', type: 'nano', pair: 'ETH/USDC', latencyMs: 60, ordersPerSec: 1, fillRate: 98, pnlPerHour: 0.0008, risk: 1.0, minCapital: 1, category: 'nano', icon: '🪙', description: 'DCA quotidien ultra-micro à $1 sur Optimism' },
        { id: 'nano-arb-2', name: '$2 Nano Arb L2', type: 'nano', pair: 'MULTI', latencyMs: 20, ordersPerSec: 4, fillRate: 88, pnlPerHour: 0.003, risk: 2.5, minCapital: 2, category: 'nano', icon: '🪙', description: 'Arbitrage L2 cross-DEX à $2 (Base↔Optimism)' },
        { id: 'nano-mean-3', name: '$3 Nano Mean Rev', type: 'nano', pair: 'SOL/USDC', latencyMs: 12, ordersPerSec: 5, fillRate: 85, pnlPerHour: 0.004, risk: 3.0, minCapital: 3, category: 'nano', icon: '🪙', description: 'Retour à la moyenne mini à $3 sur Optimism' },
        { id: 'nano-momentum-2', name: '$2 Nano Momentum', type: 'nano', pair: 'BTC/USDC', latencyMs: 10, ordersPerSec: 6, fillRate: 80, pnlPerHour: 0.005, risk: 4.0, minCapital: 2, category: 'nano', icon: '🪙', description: 'Suivi tendance micro à $2, 1-min candles' },
        { id: 'nano-sniper-1', name: '$1 Token Sniper', type: 'nano', pair: 'NEW/ETH', latencyMs: 5, ordersPerSec: 10, fillRate: 60, pnlPerHour: 0.01, risk: 8.0, minCapital: 1, category: 'nano', icon: '🪙', description: 'Snipe nouveaux tokens à $1 sur Base (très risqué)' },
        { id: 'nano-sandwich-3', name: '$3 MEV Lite', type: 'nano', pair: 'ETH/USDC', latencyMs: 3, ordersPerSec: 15, fillRate: 55, pnlPerHour: 0.008, risk: 6.5, minCapital: 3, category: 'nano', icon: '🪙', description: 'Extraction MEV légère à $3 sur Base' },

        // === MICRO STARTER (Min $5-$25) - Risque /10 précis ===
        { id: 'micro-scalp', name: 'Micro Scalper', type: 'micro', pair: 'BTC/USDC', latencyMs: 10, ordersPerSec: 5, fillRate: 90, pnlPerHour: 0.01, risk: 2.5, minCapital: 5, category: 'micro', icon: '🔬', description: 'Scalping ultra-petit' },
        { id: 'micro-mm', name: 'Micro Market Maker', type: 'micro', pair: 'ETH/USDC', latencyMs: 15, ordersPerSec: 8, fillRate: 85, pnlPerHour: 0.012, risk: 3.0, minCapital: 10, category: 'micro', icon: '🔬', description: 'Mini fournisseur liquidité' },
        { id: 'micro-arb', name: 'Micro Arbitrage', type: 'micro', pair: 'SOL/USDC', latencyMs: 20, ordersPerSec: 3, fillRate: 88, pnlPerHour: 0.008, risk: 2.0, minCapital: 10, category: 'micro', icon: '🔬', description: 'Capture petit spread' },
        { id: 'micro-mean', name: 'Micro Mean Rev', type: 'micro', pair: 'MULTI', latencyMs: 12, ordersPerSec: 6, fillRate: 82, pnlPerHour: 0.015, risk: 3.5, minCapital: 15, category: 'micro', icon: '🔬', description: 'Mini retour moyenne' },
        { id: 'micro-grid', name: 'Micro Grid Bot', type: 'micro', pair: 'BTC/USDC', latencyMs: 25, ordersPerSec: 4, fillRate: 92, pnlPerHour: 0.018, risk: 2.0, minCapital: 20, category: 'micro', icon: '🔬', description: 'Mini grid trading' },
        { id: 'micro-dca', name: 'Micro DCA Fast', type: 'micro', pair: 'ETH/USDC', latencyMs: 30, ordersPerSec: 2, fillRate: 95, pnlPerHour: 0.01, risk: 1.5, minCapital: 5, category: 'micro', icon: '🔬', description: 'DCA rapide micro' },

        // === STARTER (Min $25-$100) ===
        { id: 'start-mm', name: 'Starter MM', type: 'starter', pair: 'BTC/USDC', latencyMs: 8, ordersPerSec: 15, fillRate: 85, pnlPerHour: 0.015, risk: 3.5, minCapital: 25, category: 'starter', icon: '🌱', description: 'Market making entrée' },
        { id: 'start-scalp', name: 'Starter Scalper', type: 'starter', pair: 'ETH/USDC', latencyMs: 6, ordersPerSec: 20, fillRate: 80, pnlPerHour: 0.02, risk: 4.5, minCapital: 25, category: 'starter', icon: '🌱', description: 'Bot scalping basique' },
        { id: 'start-arb', name: 'Starter Arb', type: 'starter', pair: 'MULTI', latencyMs: 50, ordersPerSec: 5, fillRate: 90, pnlPerHour: 0.012, risk: 2.5, minCapital: 50, category: 'starter', icon: '🌱', description: 'Arbitrage simple' },
        { id: 'start-mean', name: 'Starter Mean Rev', type: 'starter', pair: 'SOL/USDC', latencyMs: 10, ordersPerSec: 12, fillRate: 85, pnlPerHour: 0.018, risk: 3.5, minCapital: 50, category: 'starter', icon: '🌱', description: 'Retour moyenne basique' },
        { id: 'start-trend', name: 'Starter Trend', type: 'starter', pair: 'BTC/USDC', latencyMs: 15, ordersPerSec: 8, fillRate: 75, pnlPerHour: 0.025, risk: 5.5, minCapital: 75, category: 'starter', icon: '🌱', description: 'Suivi tendance simple' },
        { id: 'start-grid', name: 'Starter Grid', type: 'starter', pair: 'ETH/USDC', latencyMs: 20, ordersPerSec: 6, fillRate: 88, pnlPerHour: 0.02, risk: 3.0, minCapital: 100, category: 'starter', icon: '🌱', description: 'Grid trading entrée' },

        // === MARKET MAKING ===
        { id: 'mm-basic', name: 'Basic Market Making', type: 'mm', pair: 'BTC/USDC', latencyMs: 5, ordersPerSec: 50, fillRate: 85, pnlPerHour: 0.02, risk: 4.0, minCapital: 100, category: 'mm', icon: '🏦', description: 'Liquidité deux côtés' },
        { id: 'mm-adaptive', name: 'Adaptive Spread MM', type: 'mm', pair: 'ETH/USDC', latencyMs: 3, ordersPerSec: 80, fillRate: 78, pnlPerHour: 0.035, risk: 5.5, minCapital: 200, category: 'mm', icon: '🏦', description: 'Spread dynamique' },
        { id: 'mm-inventory', name: 'Inventory MM', type: 'mm', pair: 'SOL/USDC', latencyMs: 4, ordersPerSec: 65, fillRate: 82, pnlPerHour: 0.028, risk: 4.5, minCapital: 150, category: 'mm', icon: '🏦', description: 'Contrôle inventaire' },
        { id: 'mm-aggressive', name: 'Aggressive MM', type: 'mm', pair: 'MULTI', latencyMs: 2, ordersPerSec: 150, fillRate: 72, pnlPerHour: 0.05, risk: 7.0, minCapital: 500, category: 'mm', icon: '🏦', description: 'Spreads serrés, haut volume' },

        // === STATISTICAL ARBITRAGE ===
        { id: 'stat-pairs', name: 'Pairs Trading', type: 'stat', pair: 'BTC/ETH', latencyMs: 10, ordersPerSec: 20, fillRate: 90, pnlPerHour: 0.015, risk: 3.0, minCapital: 100, category: 'stat', icon: '📊', description: 'Trading paires corrélées' },
        { id: 'stat-mean', name: 'Mean Reversion HFT', type: 'stat', pair: 'MULTI', latencyMs: 8, ordersPerSec: 35, fillRate: 88, pnlPerHour: 0.022, risk: 4.0, minCapital: 150, category: 'stat', icon: '📊', description: 'Retour moyenne micro' },
        { id: 'stat-cointegration', name: 'Cointegration Arb', type: 'stat', pair: 'L1s', latencyMs: 12, ordersPerSec: 15, fillRate: 92, pnlPerHour: 0.018, risk: 3.0, minCapital: 200, category: 'stat', icon: '📊', description: 'Trading spread statistique' },
        { id: 'stat-basket', name: 'Basket Trading', type: 'stat', pair: 'INDEX', latencyMs: 15, ordersPerSec: 25, fillRate: 85, pnlPerHour: 0.012, risk: 3.5, minCapital: 300, category: 'stat', icon: '📊', description: 'Arb indice vs composants' },

        // === CROSS-EXCHANGE ARBITRAGE ===
        { id: 'arb-cex', name: 'CEX-CEX Arbitrage', type: 'arb', pair: 'BTC/USDT', latencyMs: 50, ordersPerSec: 10, fillRate: 95, pnlPerHour: 0.008, risk: 2.0, minCapital: 200, category: 'arb', icon: '⚡', description: 'Arb Binance-Coinbase' },
        { id: 'arb-dex', name: 'DEX-DEX Arbitrage', type: 'arb', pair: 'ETH/USDC', latencyMs: 200, ordersPerSec: 5, fillRate: 75, pnlPerHour: 0.025, risk: 6.0, minCapital: 100, category: 'arb', icon: '⚡', description: 'Arb Uniswap-Sushiswap' },
        { id: 'arb-cex-dex', name: 'CEX-DEX Bridge', type: 'arb', pair: 'MULTI', latencyMs: 150, ordersPerSec: 8, fillRate: 80, pnlPerHour: 0.03, risk: 5.5, minCapital: 200, category: 'arb', icon: '⚡', description: 'Arb centralisé-décentralisé' },
        { id: 'arb-triangular', name: 'Triangular Arb', type: 'arb', pair: 'TRI', latencyMs: 20, ordersPerSec: 30, fillRate: 88, pnlPerHour: 0.01, risk: 4.0, minCapital: 500, category: 'arb', icon: '⚡', description: 'Chemin A→B→C→A' },

        // === MOMENTUM/TREND (RISQUE ÉLEVÉ) ===
        { id: 'mom-micro', name: 'Micro Momentum', type: 'momentum', pair: 'BTC/USDC', latencyMs: 5, ordersPerSec: 40, fillRate: 70, pnlPerHour: 0.04, risk: 7.0, minCapital: 50, category: 'momentum', icon: '🚀', description: 'Capture tendance sub-seconde' },
        { id: 'mom-breakout', name: 'HFT Breakout', type: 'momentum', pair: 'ETH/USDC', latencyMs: 8, ordersPerSec: 25, fillRate: 65, pnlPerHour: 0.055, risk: 7.5, minCapital: 100, category: 'momentum', icon: '🚀', description: 'Détection micro cassure' },
        { id: 'mom-tape', name: 'Tape Reading Bot', type: 'momentum', pair: 'SOL/USDC', latencyMs: 3, ordersPerSec: 100, fillRate: 60, pnlPerHour: 0.045, risk: 8.0, minCapital: 100, category: 'momentum', icon: '🚀', description: 'Analyse flux ordres' },
        { id: 'mom-news', name: 'News Alpha HFT', type: 'momentum', pair: 'MULTI', latencyMs: 100, ordersPerSec: 20, fillRate: 55, pnlPerHour: 0.08, risk: 8.5, minCapital: 250, category: 'momentum', icon: '🚀', description: 'Réaction aux news' },

        // === LATENCY ARBITRAGE (RISQUE TRÈS ÉLEVÉ - FILL RATE BAS) ===
        { id: 'lat-front', name: 'Latency Arb', type: 'latency', pair: 'BTC/USDC', latencyMs: 1, ordersPerSec: 200, fillRate: 50, pnlPerHour: 0.02, risk: 8.5, minCapital: 500, category: 'latency', icon: '⏱️', description: 'Arb basé vitesse' },
        { id: 'lat-coloc', name: 'Colocation HFT', type: 'latency', pair: 'MULTI', latencyMs: 0.5, ordersPerSec: 500, fillRate: 45, pnlPerHour: 0.015, risk: 9.0, minCapital: 1000, category: 'latency', icon: '⏱️', description: 'Trading ultra-basse latence' },
        { id: 'lat-flash', name: 'Flash Trading', type: 'latency', pair: 'ETH/USDC', latencyMs: 2, ordersPerSec: 150, fillRate: 55, pnlPerHour: 0.025, risk: 8.0, minCapital: 750, category: 'latency', icon: '⏱️', description: 'Exploit délais prix' },

        // === LIQUIDATION HUNTING (RISQUE TRÈS ÉLEVÉ) ===
        { id: 'liq-hunter', name: 'Liquidation Hunter', type: 'liquidation', pair: 'PERP', latencyMs: 50, ordersPerSec: 15, fillRate: 80, pnlPerHour: 0.1, risk: 8.0, minCapital: 250, category: 'liquidation', icon: '🎯', description: 'Cibler positions levier' },
        { id: 'liq-cascade', name: 'Cascade Catcher', type: 'liquidation', pair: 'BTC/USDC', latencyMs: 30, ordersPerSec: 25, fillRate: 70, pnlPerHour: 0.15, risk: 9.5, minCapital: 500, category: 'liquidation', icon: '🎯', description: 'Profiter cascades liquidation' },
        { id: 'liq-funding', name: 'Funding Sniper', type: 'liquidation', pair: 'PERP', latencyMs: 100, ordersPerSec: 10, fillRate: 90, pnlPerHour: 0.05, risk: 4.5, minCapital: 150, category: 'liquidation', icon: '🎯', description: 'Capturer paiements funding' },

        // === ADVANCED/AI (RISQUE VARIABLE) ===
        { id: 'ai-rl', name: 'RL Trading Agent', type: 'ai', pair: 'MULTI', latencyMs: 20, ordersPerSec: 50, fillRate: 65, pnlPerHour: 0.06, risk: 7.0, minCapital: 200, category: 'ai', icon: '🤖', description: 'Bot apprentissage renforcé' },
        { id: 'ai-transformer', name: 'Transformer HFT', type: 'ai', pair: 'BTC/USDC', latencyMs: 15, ordersPerSec: 60, fillRate: 68, pnlPerHour: 0.055, risk: 6.5, minCapital: 500, category: 'ai', icon: '🤖', description: 'Prédictions deep learning' },
        { id: 'ai-ensemble', name: 'AI Ensemble HFT', type: 'ai', pair: 'MULTI', latencyMs: 25, ordersPerSec: 40, fillRate: 72, pnlPerHour: 0.065, risk: 6.0, minCapital: 750, category: 'ai', icon: '🤖', description: 'Plusieurs modèles IA combinés' }
    ],

    categories: {
        nano: { name: 'Nano ($1-$4)', color: '#facc15', description: 'Stratégies dès $1 - L2 uniquement (Base, Optimism)' },
        micro: { name: 'Micro ($5-$25)', color: '#22c55e', description: 'Stratégies ultra-petit capital' },
        starter: { name: 'Débutant ($25-$100)', color: '#84cc16', description: 'Stratégies HFT niveau entrée' },
        mm: { name: 'Market Making', color: '#14b8a6', description: 'Fournir liquidité, gagner le spread' },
        stat: { name: 'Arbitrage Statistique', color: '#8b5cf6', description: 'Inefficiences de prix mathématiques' },
        arb: { name: 'Cross-Exchange', color: '#06b6d4', description: 'Différences de prix entre plateformes' },
        momentum: { name: 'Momentum HFT', color: '#f59e0b', description: 'Suivi de tendance ultra-rapide' },
        latency: { name: 'Arbitrage Latence', color: '#ef4444', description: 'Trading par avantage de vitesse' },
        liquidation: { name: 'Liquidation', color: '#ec4899', description: 'Cibler les positions à effet de levier' },
        ai: { name: 'IA/ML HFT', color: '#3b82f6', description: 'Stratégies machine learning' }
    },

    // Realistic APY ranges by category (what real traders actually make)
    realisticRanges: {
        nano:        { min: -10, max: 5,   note: 'Les frais dépassent les gains à ce capital. Éducatif uniquement.' },
        micro:       { min: -5,  max: 8,   note: 'Rendements marginaux. Les frais restent un obstacle majeur.' },
        starter:     { min: 0,   max: 15,  note: 'Début de viabilité. Un bon trader peut atteindre 10-15%/an.' },
        mm:          { min: 5,   max: 25,  note: 'Viable avec capital suffisant et bonne gestion du risque.' },
        stat:        { min: 5,   max: 20,  note: 'Nécessite infrastructure et modèles statistiques robustes.' },
        arb:         { min: 3,   max: 15,  note: 'Très compétitif. Les opportunités se raréfient rapidement.' },
        momentum:    { min: -15, max: 30,  note: 'Haute variance. Les pertes peuvent être importantes.' },
        latency:     { min: 10,  max: 30,  note: 'Requiert serveurs co-localisés ($5K-$50K/mois). Inaccessible au retail.' },
        liquidation: { min: 5,   max: 25,  note: 'Event-driven. Rendements irréguliers et imprévisibles.' },
        ai:          { min: 5,   max: 25,  note: 'Dépend fortement de la qualité du modèle et des données.' }
    },

    getRealisticAPY(strat) {
        const range = this.realisticRanges[strat.category] || { min: 0, max: 15, note: '' };
        // Scale within range based on risk (higher risk = wider swing)
        const riskRatio = strat.risk / 10;
        const estimated = Math.round(range.min + (range.max - range.min) * (0.3 + riskRatio * 0.5));
        return { min: range.min, max: range.max, estimated, note: range.note };
    },

    activeSimulations: [],
    liveMetrics: {},

    init() {
        this.load();
        HFTShaders.injectStyles();
        console.log('[HFT] Initialized with', this.strategies.length, 'strategies + shaders');
    },

    load() {
        this.activeSimulations = SafeOps.getStorage('obelisk_hft_sims', []);
        this.liveMetrics = SafeOps.getStorage('obelisk_hft_metrics', {});
    },

    save() {
        SafeOps.setStorage('obelisk_hft_sims', this.activeSimulations);
        SafeOps.setStorage('obelisk_hft_metrics', this.liveMetrics);
    },

    startSimulation(stratId, capital) {
        const strat = this.strategies.find(s => s.id === stratId);
        if (!strat) return { success: false, error: 'Strategy not found' };
        if (capital < strat.minCapital) return { success: false, error: 'Min: $' + strat.minCapital };

        const sim = {
            id: 'hft-' + Date.now(),
            stratId,
            stratName: strat.name,
            capital,
            startDate: Date.now(),
            pnlPerHour: strat.pnlPerHour,
            totalPnl: 0,
            totalOrders: 0,
            totalFills: 0,
            status: 'running'
        };

        this.activeSimulations.push(sim);
        this.liveMetrics[sim.id] = {
            ordersThisSecond: 0,
            latencyAvg: strat.latencyMs,
            fillRate: strat.fillRate,
            lastUpdate: Date.now()
        };
        this.save();

        // Register with SimulatedPortfolio
        if (typeof SimulatedPortfolio !== 'undefined') {
            const yearlyAPY = strat.pnlPerHour * 24 * 365;
            SimulatedPortfolio.invest(sim.id, strat.name + ' HFT', capital, yearlyAPY, 'hft', true);
        }

        // Start live metrics update
        this.startMetricsLoop(sim.id, strat);

        return { success: true, simulation: sim };
    },

    startMetricsLoop(simId, strat) {
        const interval = setInterval(() => {
            const sim = this.activeSimulations.find(s => s.id === simId);
            if (!sim || sim.status !== 'running') {
                clearInterval(interval);
                return;
            }

            // Simulate HFT activity
            const orders = Math.floor(strat.ordersPerSec * (0.8 + Math.random() * 0.4));
            const fills = Math.floor(orders * (strat.fillRate / 100) * (0.9 + Math.random() * 0.2));
            const pnl = (strat.pnlPerHour / 3600) * (0.5 + Math.random());

            sim.totalOrders += orders;
            sim.totalFills += fills;
            sim.totalPnl += sim.capital * pnl;

            this.liveMetrics[simId] = {
                ordersThisSecond: orders,
                latencyAvg: strat.latencyMs * (0.8 + Math.random() * 0.4),
                fillRate: (sim.totalFills / sim.totalOrders * 100).toFixed(1),
                pnlPerSecond: (sim.capital * pnl).toFixed(4),
                lastUpdate: Date.now()
            };

            this.save();

            // Update UI if visible
            this.updateLiveDisplay(simId);
        }, 1000);

        // Store interval reference for cleanup
        if (!this._intervals) this._intervals = {};
        this._intervals[simId] = interval;
    },

    stopSimulation(simId) {
        const idx = this.activeSimulations.findIndex(s => s.id === simId);
        if (idx === -1) return { success: false };

        const sim = this.activeSimulations[idx];
        sim.status = 'stopped';

        // Clear interval
        if (this._intervals && this._intervals[simId]) {
            clearInterval(this._intervals[simId]);
            delete this._intervals[simId];
        }

        const runtime = (Date.now() - sim.startDate) / 3600000; // hours
        this.activeSimulations.splice(idx, 1);
        delete this.liveMetrics[simId];
        this.save();

        return {
            success: true,
            capital: sim.capital,
            pnl: sim.totalPnl,
            runtime: runtime.toFixed(2),
            totalOrders: sim.totalOrders,
            totalFills: sim.totalFills
        };
    },

    updateLiveDisplay(simId) {
        const el = document.getElementById('hft-live-' + simId);
        if (!el) return;

        const metrics = this.liveMetrics[simId];
        const sim = this.activeSimulations.find(s => s.id === simId);
        if (!metrics || !sim) return;

        el.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:11px;">
                <div style="text-align:center;">
                    <div style="color:#888;">Orders/s</div>
                    <div style="color:#00ff88;font-weight:600;font-size:14px;">${metrics.ordersThisSecond}</div>
                </div>
                <div style="text-align:center;">
                    <div style="color:#888;">Latency</div>
                    <div style="color:#3b82f6;font-weight:600;font-size:14px;">${metrics.latencyAvg.toFixed(1)}ms</div>
                </div>
                <div style="text-align:center;">
                    <div style="color:#888;">Fill Rate</div>
                    <div style="color:#f59e0b;font-weight:600;font-size:14px;">${metrics.fillRate}%</div>
                </div>
                <div style="text-align:center;">
                    <div style="color:#888;">PnL</div>
                    <div style="color:${sim.totalPnl >= 0 ? '#00ff88' : '#ef4444'};font-weight:600;font-size:14px;">$${sim.totalPnl.toFixed(2)}</div>
                </div>
            </div>
        `;
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        let html = `
            <h3 style="color:#00ff88;margin-bottom:8px;">⚡ Simulateur HFT (${this.strategies.length} stratégies)</h3>
            <p style="color:#888;font-size:12px;margin-bottom:16px;">Trading Haute Fréquence - Expérimentez des stratégies de niveau institutionnel</p>

            <div style="background:rgba(239,68,68,0.12);border:2px solid rgba(239,68,68,0.4);border-radius:12px;padding:16px;margin-bottom:20px;">
                <div style="display:flex;align-items:flex-start;gap:12px;">
                    <span style="font-size:24px;flex-shrink:0;">⚠️</span>
                    <div>
                        <div style="color:#ef4444;font-weight:700;font-size:14px;margin-bottom:6px;">SIMULATION ÉDUCATIVE - Pas de rendements réels</div>
                        <p style="color:#ccc;font-size:12px;margin:0 0 8px 0;line-height:1.5;">
                            Les APY affichés sont des <strong style="color:#ef4444;">vitesses de simulation accélérées</strong>, pas des rendements réalistes.
                            Le vrai HFT nécessite : serveurs co-localisés ($5K-$50K/mois), capital >$100K, équipe de développeurs quant.
                        </p>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:11px;">
                            <span style="padding:4px 10px;background:rgba(239,68,68,0.2);border-radius:6px;color:#fca5a5;">$1-$25 = Éducatif uniquement</span>
                            <span style="padding:4px 10px;background:rgba(250,204,21,0.2);border-radius:6px;color:#fde047;">$25-$500 = Rendements modestes (0-25%/an réel)</span>
                            <span style="padding:4px 10px;background:rgba(34,197,94,0.2);border-radius:6px;color:#86efac;">Vrais hedge funds HFT = 20-40%/an</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Active simulations
        if (this.activeSimulations.length > 0) {
            html += `<div style="background:rgba(0,255,136,0.1);border:1px solid #00ff8833;border-radius:12px;padding:16px;margin-bottom:20px;">`;
            html += `<h4 style="color:#00ff88;margin:0 0 12px;">🔥 Simulations HFT Actives (${this.activeSimulations.length})</h4>`;

            this.activeSimulations.forEach(sim => {
                const runtime = ((Date.now() - sim.startDate) / 60000).toFixed(0);
                html += `
                    <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-weight:600;color:#fff;">${sim.stratName}</span>
                            <span style="font-size:11px;color:#888;">${runtime} min • $${sim.capital}</span>
                        </div>
                        <div id="hft-live-${sim.id}">
                            <div style="color:#888;font-size:11px;">Loading metrics...</div>
                        </div>
                        <button onclick="HFTSimulatorModule.stopSimulation('${sim.id}');HFTSimulatorModule.render('${containerId}')"
                                style="margin-top:8px;padding:6px 12px;background:#ef4444;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;">
                            Stop
                        </button>
                    </div>`;
            });
            html += `</div>`;
        }

        // Categories and strategies
        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catStrats = this.strategies.filter(s => s.category === catKey);
            if (catStrats.length === 0) return;

            html += `<div style="margin-bottom:24px;">`;
            html += `<h4 style="color:${cat.color};margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ${cat.color};">
                ${cat.name} <span style="font-size:11px;opacity:0.7;">(${catStrats.length} stratégies) - ${cat.description}</span>
            </h4>`;
            html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">`;

            catStrats.forEach(s => {
                // Couleur progressive selon risque décimal
                const getRiskColor = (risk) => {
                    if (risk <= 2) return '#22c55e';      // Vert foncé - Très faible
                    if (risk <= 3.5) return '#84cc16';    // Vert clair - Faible
                    if (risk <= 5) return '#eab308';      // Jaune - Modéré
                    if (risk <= 6.5) return '#f59e0b';    // Orange - Élevé
                    if (risk <= 8) return '#f97316';      // Orange foncé - Très élevé
                    return '#ef4444';                     // Rouge - Extrême
                };
                const riskColor = getRiskColor(s.risk);
                const realistic = this.getRealisticAPY(s);
                const realisticColor = realistic.estimated <= 0 ? '#ef4444' : realistic.estimated <= 10 ? '#fde047' : '#00ff88';
                const isHighRisk = s.risk >= 7 || s.fillRate < 60;
                const warningBorder = isHighRisk ? 'border:2px solid #ef4444;' : '';

                html += `
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;transition:all 0.3s;cursor:pointer;${warningBorder}"
                         onclick="HFTSimulatorModule.showStratModal('${s.id}')"
                         onmouseover="this.style.borderColor='${cat.color}';this.style.transform='translateY(-2px)'"
                         onmouseout="this.style.borderColor='${isHighRisk ? '#ef4444' : 'rgba(255,255,255,0.1)'}';this.style.transform='translateY(0)'">
                        ${isHighRisk ? '<div style="background:#ef444433;color:#ef4444;font-size:10px;padding:4px 8px;border-radius:4px;margin-bottom:8px;text-align:center;">⚠️ Risque élevé - Pertes possibles</div>' : ''}
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-weight:700;color:#fff;">${s.icon} ${s.name}</span>
                            <span style="font-size:10px;color:${riskColor};background:${riskColor}20;padding:2px 6px;border-radius:4px;">Risque ${s.risk}/10</span>
                        </div>
                        <div style="font-size:11px;color:#888;margin-bottom:10px;">${s.description}</div>

                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px;margin-bottom:10px;">
                            <div style="background:rgba(0,0,0,0.2);padding:6px;border-radius:6px;">
                                <span style="color:#888;">Latence:</span>
                                <span style="color:#3b82f6;font-weight:600;"> ${s.latencyMs}ms</span>
                            </div>
                            <div style="background:rgba(0,0,0,0.2);padding:6px;border-radius:6px;">
                                <span style="color:#888;">Ordres/s:</span>
                                <span style="color:#f59e0b;font-weight:600;"> ${s.ordersPerSec}</span>
                            </div>
                            <div style="background:rgba(0,0,0,0.2);padding:6px;border-radius:6px;">
                                <span style="color:#888;">Taux Fill:</span>
                                <span style="color:${s.fillRate < 60 ? '#ef4444' : '#00ff88'};font-weight:600;"> ${s.fillRate}%</span>
                            </div>
                            <div style="background:rgba(0,0,0,0.2);padding:6px;border-radius:6px;">
                                <span style="color:#888;">Réaliste:</span>
                                <span style="color:${realisticColor};font-weight:600;"> ${realistic.min > 0 ? '+' : ''}${realistic.min}% à ${realistic.max > 0 ? '+' : ''}${realistic.max}%</span>
                            </div>
                        </div>

                        <div style="padding-top:10px;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <span style="font-size:10px;color:#888;">APY réaliste:</span>
                                <span style="font-size:11px;color:${realisticColor};font-weight:600;"> ~${realistic.estimated > 0 ? '+' : ''}${realistic.estimated}%/an</span>
                            </div>
                            <div>
                                <span style="font-size:10px;color:#888;">Min: $${s.minCapital}</span>
                            </div>
                        </div>
                        <div style="margin-top:6px;text-align:center;">
                            <span style="font-size:9px;color:#f97316;background:rgba(249,115,22,0.15);padding:2px 8px;border-radius:4px;">SIMULATION</span>
                        </div>

                        <button onclick="event.stopPropagation();HFTSimulatorModule.showStratModal('${s.id}')"
                                style="width:100%;margin-top:10px;padding:8px;background:${cat.color};border:none;border-radius:6px;color:#fff;font-weight:600;cursor:pointer;font-size:11px;">
                            Démarrer HFT
                        </button>
                    </div>`;
            });

            html += `</div></div>`;
        });

        // HFT Info section
        html += `
            <div style="background:rgba(59,130,246,0.1);border:1px solid #3b82f633;border-radius:12px;padding:16px;margin-top:20px;">
                <h4 style="color:#3b82f6;margin:0 0 12px;">📚 À propos du HFT</h4>
                <div style="font-size:12px;color:#888;line-height:1.6;">
                    <p><strong>Le Trading Haute Fréquence (HFT)</strong> utilise des algorithmes pour exécuter des milliers de trades par seconde.</p>
                    <ul style="margin:8px 0;padding-left:20px;">
                        <li><strong>Latence:</strong> Temps d'exécution des ordres (plus bas = mieux)</li>
                        <li><strong>Ordres/sec:</strong> Fréquence de trading</li>
                        <li><strong>Taux Fill:</strong> % des ordres exécutés avec succès</li>
                        <li><strong>PnL/heure:</strong> Profit attendu par heure en % du capital</li>
                    </ul>
                </div>
            </div>

            <!-- Échelle de risque -->
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-top:16px;">
                <h4 style="color:#fff;margin:0 0 12px;">📊 Échelle de Risque /10</h4>
                <div style="display:grid;gap:8px;font-size:12px;">
                    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(34,197,94,0.1);border-radius:6px;border-left:3px solid #22c55e;">
                        <span style="color:#22c55e;font-weight:700;min-width:60px;">0 - 2</span>
                        <span style="color:#22c55e;">✅ Très faible</span>
                        <span style="color:#888;flex:1;">- Idéal pour débuter, pertes limitées</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(132,204,22,0.1);border-radius:6px;border-left:3px solid #84cc16;">
                        <span style="color:#84cc16;font-weight:700;min-width:60px;">2 - 3.5</span>
                        <span style="color:#84cc16;">✅ Faible</span>
                        <span style="color:#888;flex:1;">- Bon ratio risque/rendement</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(234,179,8,0.1);border-radius:6px;border-left:3px solid #eab308;">
                        <span style="color:#eab308;font-weight:700;min-width:60px;">3.5 - 5</span>
                        <span style="color:#eab308;">⚠️ Modéré</span>
                        <span style="color:#888;flex:1;">- Volatilité accrue, surveiller les positions</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(245,158,11,0.1);border-radius:6px;border-left:3px solid #f59e0b;">
                        <span style="color:#f59e0b;font-weight:700;min-width:60px;">5 - 6.5</span>
                        <span style="color:#f59e0b;">⚠️ Élevé</span>
                        <span style="color:#888;flex:1;">- Expérience requise, pertes fréquentes possibles</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(249,115,22,0.1);border-radius:6px;border-left:3px solid #f97316;">
                        <span style="color:#f97316;font-weight:700;min-width:60px;">6.5 - 8</span>
                        <span style="color:#f97316;">❌ Très élevé</span>
                        <span style="color:#888;flex:1;">- <strong>Déconseillé:</strong> Taux d'échec important, fill rate souvent <70%</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(239,68,68,0.1);border-radius:6px;border-left:3px solid #ef4444;">
                        <span style="color:#ef4444;font-weight:700;min-width:60px;">8 - 10</span>
                        <span style="color:#ef4444;">🚫 Extrême</span>
                        <span style="color:#888;flex:1;">- <strong>Fortement déconseillé:</strong> Plus de pertes que de gains, réservé aux experts</span>
                    </div>
                </div>
                <div style="margin-top:12px;padding:10px;background:rgba(239,68,68,0.15);border-radius:8px;border:1px solid #ef444444;">
                    <p style="color:#ef4444;margin:0;font-size:12px;"><strong>⚠️ Pourquoi éviter les risques 7+/10 ?</strong></p>
                    <ul style="color:#ccc;margin:8px 0 0 0;padding-left:20px;font-size:11px;">
                        <li><strong>Taux Fill bas (<60%):</strong> Plus de la moitié des ordres échouent = frais sans profit</li>
                        <li><strong>Slippage élevé:</strong> Les prix bougent avant exécution = pertes cachées</li>
                        <li><strong>Drawdown rapide:</strong> Plusieurs pertes consécutives peuvent vider le capital</li>
                        <li><strong>Infrastructure requise:</strong> Sans serveurs colocalisés, vous êtes désavantagé</li>
                    </ul>
                </div>
            </div>`;

        el.innerHTML = html;

        // Start updating live metrics for active simulations
        this.activeSimulations.forEach(sim => {
            if (sim.status === 'running') {
                this.updateLiveDisplay(sim.id);
            }
        });
    },

    showStratModal(stratId) {
        const strat = this.strategies.find(s => s.id === stratId);
        if (!strat) return;

        // Use realistic APY instead of inflated simulation speed
        const realistic = this.getRealisticAPY(strat);

        if (typeof InvestHelper !== 'undefined') {
            InvestHelper.show({
                name: strat.name + ' HFT (Simulation)',
                id: strat.id,
                apy: realistic.estimated,
                minInvest: strat.minCapital,
                fee: 0.1, // HFT typically has low fees
                risk: strat.risk,
                icon: strat.icon,
                onInvest: (amount, mode) => {
                    this.executeHFT(strat, amount, mode);
                }
            });
        } else {
            this.showSimpleModal(stratId);
        }
    },

    executeHFT(strat, amount, mode) {
        if (mode === 'simulated') {
            const result = this.startSimulation(strat.id, amount);
            if (result.success) {
                if (typeof showNotification === 'function') {
                    showNotification(`${strat.icon} ${strat.name} HFT started with $${amount}`, 'success');
                }
            } else if (typeof showNotification === 'function') {
                showNotification(result.error, 'error');
            }
        } else {
            // Real mode
            if (typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected()) {
                console.log('[HFT] Real HFT would require dedicated infrastructure:', amount, strat.name);
                if (typeof showNotification === 'function') {
                    showNotification('Real HFT requires dedicated infrastructure. Contact us for institutional access.', 'info');
                }
            }
        }
    },

    showSimpleModal(stratId) {
        const strat = this.strategies.find(s => s.id === stratId);
        if (!strat) return;

        const existing = document.getElementById('hft-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'hft-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:center;justify-content:center;';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        const realistic = this.getRealisticAPY(strat);
        const realisticColor = realistic.estimated <= 0 ? '#ef4444' : realistic.estimated <= 10 ? '#fde047' : '#00ff88';
        const isHighRisk = strat.risk >= 7 || strat.fillRate < 60;
        // Couleur progressive selon risque décimal
        const riskColor = strat.risk <= 2 ? '#22c55e' : strat.risk <= 3.5 ? '#84cc16' : strat.risk <= 5 ? '#eab308' : strat.risk <= 6.5 ? '#f59e0b' : strat.risk <= 8 ? '#f97316' : '#ef4444';

        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#1a1a2e,#0d0d1a);border:1px solid ${isHighRisk ? '#ef4444' : '#333'};border-radius:16px;padding:24px;max-width:420px;width:90%;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#fff;margin:0;">${strat.icon} ${strat.name}</h3>
                    <button onclick="document.getElementById('hft-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">&times;</button>
                </div>

                ${isHighRisk ? '<div style="background:#ef444433;color:#ef4444;font-size:12px;padding:8px 12px;border-radius:6px;margin-bottom:16px;text-align:center;">⚠️ Risque élevé - Pertes possibles supérieures aux gains</div>' : ''}

                <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:10px;margin-bottom:12px;text-align:center;">
                    <span style="color:#ef4444;font-size:11px;font-weight:600;">⚠️ SIMULATION ÉDUCATIVE - Les rendements ci-dessous sont des estimations réalistes</span>
                </div>

                <div style="background:rgba(59,130,246,0.1);border-radius:10px;padding:12px;margin-bottom:16px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center;">
                        <div>
                            <div style="color:#888;font-size:11px;">APY réaliste</div>
                            <div style="color:${realisticColor};font-size:18px;font-weight:700;">~${realistic.estimated > 0 ? '+' : ''}${realistic.estimated}%</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:11px;">Fourchette</div>
                            <div style="color:${realisticColor};font-size:16px;font-weight:700;">${realistic.min}% à ${realistic.max}%</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:11px;">Risque</div>
                            <div style="color:${riskColor};font-size:18px;font-weight:700;">${strat.risk}/10</div>
                        </div>
                    </div>
                </div>

                <div style="background:rgba(250,204,21,0.08);border-radius:8px;padding:8px 12px;margin-bottom:12px;">
                    <p style="color:#fde047;font-size:11px;margin:0;line-height:1.4;">${realistic.note}</p>
                </div>

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;font-size:11px;">
                    <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:8px;text-align:center;">
                        <div style="color:#888;">Latence</div>
                        <div style="color:#3b82f6;font-weight:600;">${strat.latencyMs}ms</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:8px;text-align:center;">
                        <div style="color:#888;">Ordres/s</div>
                        <div style="color:#f59e0b;font-weight:600;">${strat.ordersPerSec}</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:8px;text-align:center;">
                        <div style="color:#888;">Taux Fill</div>
                        <div style="color:${strat.fillRate < 60 ? '#ef4444' : '#00ff88'};font-weight:600;">${strat.fillRate}%</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:8px;text-align:center;">
                        <div style="color:#888;">Risque</div>
                        <div style="color:${riskColor};font-weight:600;">${strat.risk}/10</div>
                    </div>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="color:#888;font-size:12px;">Capital (min $${strat.minCapital})</label>
                    <input type="number" id="hft-capital" min="${strat.minCapital}" value="${strat.minCapital}"
                           style="width:100%;padding:12px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#fff;font-size:16px;box-sizing:border-box;margin-top:4px;">
                </div>

                <button onclick="HFTSimulatorModule.confirmHFT('${strat.id}')"
                        style="width:100%;padding:14px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-size:14px;">
                    ⚡ Démarrer Simulation HFT
                </button>
            </div>`;

        document.body.appendChild(modal);
    },

    confirmHFT(stratId) {
        const capital = parseFloat(document.getElementById('hft-capital').value);
        const strat = this.strategies.find(s => s.id === stratId);

        if (!capital || capital < strat.minCapital) {
            if (typeof showNotification === 'function') {
                showNotification('Capital minimum: $' + strat.minCapital, 'error');
            }
            return;
        }

        const result = this.startSimulation(stratId, capital);
        document.getElementById('hft-modal').remove();

        if (result.success) {
            if (typeof showNotification === 'function') {
                showNotification(`${strat.icon} ${strat.name} HFT démarré avec $${capital}!`, 'success');
            }
        } else if (typeof showNotification === 'function') {
            showNotification(result.error, 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => HFTSimulatorModule.init());
console.log('[HFT] Module loaded');
