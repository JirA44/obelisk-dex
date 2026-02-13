/**
 * Obelisk DEX - Background Animation System
 * Supports: Matrix, Halo Forerunners, Avatar Bioluminescent, Particles
 */

console.log('[BgAnimations] Script loaded!');

const BgAnimations = {
    canvas: null,
    ctx: null,
    previewCanvas: null,
    previewCtx: null,
    animationId: null,
    previewAnimationId: null,
    currentAnimation: 'avatar',
    speed: 1,

    // Performance optimization flags
    isPageVisible: true,
    isWindowFocused: true,
    targetFPS: 60,
    currentFPS: 60,
    lastFrameTime: 0,
    frameInterval: 1000 / 60,

    // Animation-specific settings
    matrixColor: 'green',
    haloColor: 'blue',

    // Color palettes
    colors: {
        matrix: {
            green: '#00ff41',
            cyan: '#00ffff',
            purple: '#bf00ff',
            gold: '#ffd700',
            rainbow: null // special case
        },
        halo: {
            blue: { primary: '#00a8ff', secondary: '#0066cc', glow: 'rgba(0, 168, 255, 0.3)' },
            gold: { primary: '#ffa500', secondary: '#cc8400', glow: 'rgba(255, 165, 0, 0.3)' },
            green: { primary: '#39ff14', secondary: '#2ecc0f', glow: 'rgba(57, 255, 20, 0.3)' }
        }
    },

    // Matrix rain data
    matrixDrops: [],
    matrixChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',

    // Halo hexagons data
    haloHexagons: [],
    haloLines: [],

    // Avatar bioluminescence data
    avatarParticles: [],
    avatarConnections: [],

    // Particles data
    particles: [],

    // Galaxy data
    galaxyPlanets: [],
    galaxyStars: [],
    galaxyAsteroids: [],
    galaxyNebulas: [],

    // Ocean data
    oceanBubbles: [],
    oceanFish: [],
    oceanPlants: [],
    oceanRays: [],
    oceanParticles: [],

    init() {
        console.log('[BgAnimations] INIT STARTING...');

        this.canvas = document.getElementById('bg-animation-canvas');
        this.previewCanvas = document.getElementById('preview-canvas');

        console.log('[BgAnimations] Canvas found:', !!this.canvas);

        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            console.log('[BgAnimations] Canvas size:', this.canvas.width, 'x', this.canvas.height);
        } else {
            console.error('[BgAnimations] CANVAS NOT FOUND!');
        }

        if (this.previewCanvas) {
            this.previewCtx = this.previewCanvas.getContext('2d');
            this.resizePreviewCanvas();
        }

        // Load saved settings
        this.loadSettings();
        console.log('[BgAnimations] Animation type:', this.currentAnimation);

        // Setup UI event listeners
        this.setupEventListeners();

        // Setup performance optimization listeners
        this.setupPerformanceOptimizations();

        // Start animation
        this.startAnimation();
        console.log('[BgAnimations] INIT COMPLETE - Animation ID:', this.animationId);
    },

    // Performance optimizations - Visibility API and focus detection
    setupPerformanceOptimizations() {
        // Visibility API - pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;
            console.log('[BgAnimations] Page visibility:', this.isPageVisible ? 'visible' : 'hidden');

            if (this.isPageVisible) {
                // Resume animation when tab becomes visible
                if (!this.animationId && this.currentAnimation !== 'none') {
                    this.startAnimation();
                }
            } else {
                // Pause animation when tab is hidden
                this.stopAnimation();
            }
        });

        // Window focus - reduce FPS when unfocused
        window.addEventListener('focus', () => {
            this.isWindowFocused = true;
            this.setTargetFPS(60);
            console.log('[BgAnimations] Window focused - FPS: 60');
        });

        window.addEventListener('blur', () => {
            this.isWindowFocused = false;
            this.setTargetFPS(30); // Reduce to 30 FPS when unfocused
            console.log('[BgAnimations] Window unfocused - FPS: 30');
        });

        // Respect prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            this.setTargetFPS(30);
            console.log('[BgAnimations] Reduced motion preference detected - FPS: 30');
        }

        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                this.setTargetFPS(30);
            } else {
                this.setTargetFPS(60);
            }
        });
    },

    setTargetFPS(fps) {
        this.targetFPS = fps;
        this.currentFPS = fps;
        this.frameInterval = 1000 / fps;
    },

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Reinitialize animation data on resize
        this.initAnimationData();
    },

    resizePreviewCanvas() {
        if (!this.previewCanvas) return;
        const rect = this.previewCanvas.parentElement.getBoundingClientRect();
        this.previewCanvas.width = rect.width || 400;
        this.previewCanvas.height = rect.height || 200;
    },

    initAnimationData() {
        switch (this.currentAnimation) {
            case 'matrix':
                this.initMatrix();
                break;
            case 'halo':
                this.initHalo();
                break;
            case 'avatar':
                this.initAvatar();
                break;
            case 'particles':
                this.initParticles();
                break;
            case 'galaxy':
                this.initGalaxy();
                break;
            case 'ocean':
                this.initOcean();
                break;
        }
    },

    // ==================== MATRIX ANIMATION ====================
    initMatrix() {
        const columns = Math.floor(this.canvas.width / 20);
        this.matrixDrops = [];
        for (let i = 0; i < columns; i++) {
            this.matrixDrops.push({
                y: Math.random() * -100,
                speed: 0.5 + Math.random() * 0.5,
                chars: []
            });
        }
    },

    drawMatrix(ctx, width, height) {
        // Fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);

        const fontSize = 14;
        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

        const columns = Math.floor(width / 20);

        for (let i = 0; i < columns; i++) {
            if (!this.matrixDrops[i]) {
                this.matrixDrops[i] = { y: Math.random() * -100, speed: 0.5 + Math.random() * 0.5 };
            }

            const x = i * 20;
            const y = this.matrixDrops[i].y;

            // Get color
            let color;
            if (this.matrixColor === 'rainbow') {
                const hue = (Date.now() / 50 + i * 10) % 360;
                color = `hsl(${hue}, 100%, 50%)`;
            } else {
                color = this.colors.matrix[this.matrixColor] || '#00ff41';
            }

            // Draw character
            const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];

            // Head of the drop (brighter)
            ctx.fillStyle = color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.fillText(char, x, y);

            // Trail (dimmer)
            ctx.shadowBlur = 0;
            for (let j = 1; j < 20; j++) {
                const trailY = y - j * fontSize;
                if (trailY > 0) {
                    const alpha = 1 - (j / 20);
                    if (this.matrixColor === 'rainbow') {
                        const hue = (Date.now() / 50 + i * 10 + j * 5) % 360;
                        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha * 0.5})`;
                    } else {
                        ctx.fillStyle = color.replace(')', `, ${alpha * 0.5})`).replace('rgb', 'rgba');
                        if (!ctx.fillStyle.includes('rgba')) {
                            // For hex colors
                            const r = parseInt(color.slice(1, 3), 16);
                            const g = parseInt(color.slice(3, 5), 16);
                            const b = parseInt(color.slice(5, 7), 16);
                            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`;
                        }
                    }
                    const trailChar = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
                    ctx.fillText(trailChar, x, trailY);
                }
            }

            // Update position
            this.matrixDrops[i].y += fontSize * this.matrixDrops[i].speed * this.speed;

            // Reset when off screen
            if (this.matrixDrops[i].y > height + 100 && Math.random() > 0.975) {
                this.matrixDrops[i].y = Math.random() * -100;
                this.matrixDrops[i].speed = 0.5 + Math.random() * 0.5;
            }
        }
    },

    // ==================== HALO FORERUNNERS ANIMATION ====================
    initHalo() {
        this.haloStructures = [];
        this.haloCircuits = [];
        this.haloLightBridges = [];
        this.haloHolograms = [];
        this.haloParticles = [];
        this.haloAmbientLines = [];

        const w = this.canvas.width;
        const h = this.canvas.height;

        // Massive background structures (like Forerunner walls)
        this.haloStructures.push(
            // Left pillar
            { x: w * 0.1, y: 0, width: 80, height: h, type: 'pillar' },
            // Right pillar
            { x: w * 0.9 - 80, y: 0, width: 80, height: h, type: 'pillar' },
            // Top beam
            { x: 0, y: h * 0.15, width: w, height: 40, type: 'beam' },
            // Bottom beam
            { x: 0, y: h * 0.85, width: w, height: 40, type: 'beam' },
            // Central structure
            { x: w * 0.35, y: h * 0.3, width: w * 0.3, height: h * 0.4, type: 'central' }
        );

        // Energy circuits running through structures
        for (let i = 0; i < 25; i++) {
            const isVertical = Math.random() > 0.5;
            this.haloCircuits.push({
                x: isVertical ? (Math.random() > 0.5 ? w * 0.1 + Math.random() * 60 : w * 0.9 - 80 + Math.random() * 60) : Math.random() * w,
                y: isVertical ? 0 : (Math.random() > 0.5 ? h * 0.15 : h * 0.85),
                length: isVertical ? h : w * 0.3,
                isVertical,
                progress: Math.random(),
                speed: 0.002 + Math.random() * 0.004,
                width: 1 + Math.random() * 2,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }

        // Hard light bridges
        for (let i = 0; i < 3; i++) {
            this.haloLightBridges.push({
                x1: w * 0.1 + 40,
                y1: h * 0.3 + Math.random() * h * 0.4,
                x2: w * 0.9 - 40,
                y2: h * 0.3 + Math.random() * h * 0.4,
                alpha: 0,
                targetAlpha: 0.4 + Math.random() * 0.3,
                fadeIn: true,
                segments: 20,
                offset: Math.random() * 100
            });
        }

        // Floating holographic displays
        for (let i = 0; i < 6; i++) {
            this.haloHolograms.push({
                x: w * 0.2 + Math.random() * w * 0.6,
                y: h * 0.2 + Math.random() * h * 0.6,
                width: 60 + Math.random() * 80,
                height: 40 + Math.random() * 60,
                rotation: (Math.random() - 0.5) * 0.3,
                rotationSpeed: (Math.random() - 0.5) * 0.001,
                alpha: 0.1 + Math.random() * 0.2,
                dataOffset: Math.random() * 1000,
                type: Math.floor(Math.random() * 3) // 0: bars, 1: circles, 2: text
            });
        }

        // Ambient floating particles
        for (let i = 0; i < 50; i++) {
            this.haloParticles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -0.2 - Math.random() * 0.3,
                size: 1 + Math.random() * 2,
                alpha: 0.2 + Math.random() * 0.4
            });
        }

        // Ambient geometric lines
        for (let i = 0; i < 8; i++) {
            this.haloAmbientLines.push({
                points: this.generateForerunnerPath(w, h),
                progress: 0,
                speed: 0.003 + Math.random() * 0.003,
                active: Math.random() > 0.3
            });
        }
    },

    generateForerunnerPath(w, h) {
        const points = [];
        let x = Math.random() * w;
        let y = Math.random() * h;
        points.push({ x, y });

        for (let i = 0; i < 5 + Math.floor(Math.random() * 5); i++) {
            // Forerunner paths are angular, not curved
            const direction = Math.floor(Math.random() * 4);
            const length = 50 + Math.random() * 150;

            switch (direction) {
                case 0: x += length; break;
                case 1: x -= length; break;
                case 2: y += length; break;
                case 3: y -= length; break;
            }

            x = Math.max(0, Math.min(w, x));
            y = Math.max(0, Math.min(h, y));
            points.push({ x, y });
        }

        return points;
    },

    drawHalo(ctx, width, height) {
        // Very dark blue-black background fade
        ctx.fillStyle = 'rgba(0, 2, 8, 0.06)';
        ctx.fillRect(0, 0, width, height);

        const colorScheme = this.colors.halo[this.haloColor] || this.colors.halo.blue;
        const time = Date.now() / 1000;

        // Draw massive structures (subtle, in background)
        ctx.globalAlpha = 0.03;
        for (const struct of this.haloStructures) {
            if (struct.type === 'pillar') {
                // Vertical pillars with internal patterns
                ctx.fillStyle = colorScheme.primary;
                ctx.fillRect(struct.x, struct.y, struct.width, struct.height);

                // Inner lines
                ctx.strokeStyle = colorScheme.primary;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.05;
                for (let i = 0; i < 5; i++) {
                    const lx = struct.x + (struct.width / 6) * (i + 1);
                    ctx.beginPath();
                    ctx.moveTo(lx, 0);
                    ctx.lineTo(lx, height);
                    ctx.stroke();
                }
            } else if (struct.type === 'beam') {
                ctx.fillStyle = colorScheme.primary;
                ctx.globalAlpha = 0.02;
                ctx.fillRect(struct.x, struct.y, struct.width, struct.height);
            } else if (struct.type === 'central') {
                // Central hexagonal structure
                ctx.globalAlpha = 0.02;
                ctx.strokeStyle = colorScheme.primary;
                ctx.lineWidth = 2;
                const cx = struct.x + struct.width / 2;
                const cy = struct.y + struct.height / 2;
                const size = Math.min(struct.width, struct.height) * 0.4;

                // Multiple nested hexagons
                for (let i = 0; i < 4; i++) {
                    this.drawHexagon(ctx, cx, cy, size * (1 - i * 0.2));
                }
            }
        }

        // Draw energy circuits
        ctx.globalAlpha = 1;
        for (const circuit of this.haloCircuits) {
            circuit.progress += circuit.speed * this.speed;
            if (circuit.progress > 1) circuit.progress = 0;

            const pulse = Math.sin(time * 3 + circuit.pulseOffset) * 0.3 + 0.7;

            if (circuit.isVertical) {
                const startY = 0;
                const currentY = circuit.length * circuit.progress;

                const gradient = ctx.createLinearGradient(circuit.x, startY, circuit.x, currentY);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.7, colorScheme.primary);
                gradient.addColorStop(1, colorScheme.primary);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = circuit.width;
                ctx.globalAlpha = 0.6 * pulse;
                ctx.shadowBlur = 8;
                ctx.shadowColor = colorScheme.primary;

                ctx.beginPath();
                ctx.moveTo(circuit.x, Math.max(0, currentY - 100));
                ctx.lineTo(circuit.x, currentY);
                ctx.stroke();

                // Bright node at front
                ctx.fillStyle = colorScheme.primary;
                ctx.globalAlpha = pulse;
                ctx.beginPath();
                ctx.arc(circuit.x, currentY, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const currentX = circuit.x + circuit.length * circuit.progress;

                ctx.strokeStyle = colorScheme.primary;
                ctx.lineWidth = circuit.width;
                ctx.globalAlpha = 0.5 * pulse;
                ctx.shadowBlur = 8;
                ctx.shadowColor = colorScheme.primary;

                ctx.beginPath();
                ctx.moveTo(Math.max(circuit.x, currentX - 80), circuit.y + 20);
                ctx.lineTo(currentX, circuit.y + 20);
                ctx.stroke();
            }
        }

        // Draw hard light bridges
        ctx.shadowBlur = 0;
        for (const bridge of this.haloLightBridges) {
            // Fade in/out
            if (bridge.fadeIn) {
                bridge.alpha += 0.005 * this.speed;
                if (bridge.alpha >= bridge.targetAlpha) bridge.fadeIn = false;
            } else {
                bridge.alpha -= 0.002 * this.speed;
                if (bridge.alpha <= 0) {
                    bridge.fadeIn = true;
                    bridge.y1 = height * 0.25 + Math.random() * height * 0.5;
                    bridge.y2 = height * 0.25 + Math.random() * height * 0.5;
                }
            }

            if (bridge.alpha <= 0) continue;

            // Draw segmented light bridge
            const segments = bridge.segments;
            const dx = (bridge.x2 - bridge.x1) / segments;

            for (let i = 0; i < segments; i++) {
                const x = bridge.x1 + dx * i;
                const y = bridge.y1 + (bridge.y2 - bridge.y1) * (i / segments);
                const segmentAlpha = bridge.alpha * (0.5 + Math.sin(time * 5 + i * 0.5 + bridge.offset) * 0.5);

                // Hard light segment
                ctx.fillStyle = colorScheme.primary;
                ctx.globalAlpha = segmentAlpha;
                ctx.shadowBlur = 15;
                ctx.shadowColor = colorScheme.primary;

                ctx.fillRect(x, y - 2, dx - 2, 4);

                // Edge glow
                ctx.globalAlpha = segmentAlpha * 0.3;
                ctx.fillRect(x, y - 6, dx - 2, 12);
            }
        }

        // Draw floating holograms
        ctx.shadowBlur = 0;
        for (const holo of this.haloHolograms) {
            holo.rotation += holo.rotationSpeed * this.speed;

            ctx.save();
            ctx.translate(holo.x, holo.y);
            ctx.rotate(holo.rotation);

            // Hologram frame
            ctx.strokeStyle = colorScheme.primary;
            ctx.lineWidth = 1;
            ctx.globalAlpha = holo.alpha;

            // Outer frame
            ctx.strokeRect(-holo.width / 2, -holo.height / 2, holo.width, holo.height);

            // Corner accents
            const cornerSize = 8;
            ctx.lineWidth = 2;
            ctx.globalAlpha = holo.alpha * 1.5;

            // Top-left
            ctx.beginPath();
            ctx.moveTo(-holo.width / 2, -holo.height / 2 + cornerSize);
            ctx.lineTo(-holo.width / 2, -holo.height / 2);
            ctx.lineTo(-holo.width / 2 + cornerSize, -holo.height / 2);
            ctx.stroke();

            // Top-right
            ctx.beginPath();
            ctx.moveTo(holo.width / 2 - cornerSize, -holo.height / 2);
            ctx.lineTo(holo.width / 2, -holo.height / 2);
            ctx.lineTo(holo.width / 2, -holo.height / 2 + cornerSize);
            ctx.stroke();

            // Bottom corners
            ctx.beginPath();
            ctx.moveTo(-holo.width / 2, holo.height / 2 - cornerSize);
            ctx.lineTo(-holo.width / 2, holo.height / 2);
            ctx.lineTo(-holo.width / 2 + cornerSize, holo.height / 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(holo.width / 2 - cornerSize, holo.height / 2);
            ctx.lineTo(holo.width / 2, holo.height / 2);
            ctx.lineTo(holo.width / 2, holo.height / 2 - cornerSize);
            ctx.stroke();

            // Hologram content
            ctx.globalAlpha = holo.alpha * 0.6;
            ctx.fillStyle = colorScheme.primary;

            if (holo.type === 0) {
                // Data bars
                const barCount = 6;
                const barWidth = (holo.width - 20) / barCount;
                for (let i = 0; i < barCount; i++) {
                    const barHeight = (Math.sin(time * 2 + holo.dataOffset + i) * 0.5 + 0.5) * (holo.height - 15);
                    ctx.fillRect(
                        -holo.width / 2 + 10 + i * barWidth,
                        holo.height / 2 - 5 - barHeight,
                        barWidth - 3,
                        barHeight
                    );
                }
            } else if (holo.type === 1) {
                // Circular scanner
                const radius = Math.min(holo.width, holo.height) * 0.35;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.stroke();

                // Rotating line
                const angle = time * 2 + holo.dataOffset;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                ctx.stroke();

                // Sweep effect
                ctx.globalAlpha = holo.alpha * 0.2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, angle - 0.5, angle);
                ctx.closePath();
                ctx.fill();
            } else {
                // Forerunner text/symbols
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                const lines = 4;
                for (let i = 0; i < lines; i++) {
                    let text = '';
                    for (let j = 0; j < 8; j++) {
                        text += String.fromCharCode(0x25A0 + Math.floor((time * 10 + holo.dataOffset + i + j) % 20));
                    }
                    ctx.fillText(text, -holo.width / 2 + 8, -holo.height / 2 + 15 + i * 12);
                }
            }

            ctx.restore();
        }

        // Draw ambient particles
        ctx.shadowBlur = 5;
        ctx.shadowColor = colorScheme.primary;
        for (const p of this.haloParticles) {
            p.x += p.vx * this.speed;
            p.y += p.vy * this.speed;

            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            ctx.fillStyle = colorScheme.primary;
            ctx.globalAlpha = p.alpha * (0.5 + Math.sin(time * 3 + p.x) * 0.5);
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }

        // Draw ambient geometric lines
        ctx.shadowBlur = 10;
        for (const line of this.haloAmbientLines) {
            if (!line.active) {
                if (Math.random() > 0.998) line.active = true;
                continue;
            }

            line.progress += line.speed * this.speed;
            if (line.progress > 1) {
                line.progress = 0;
                line.active = Math.random() > 0.5;
                line.points = this.generateForerunnerPath(width, height);
            }

            const totalLength = line.points.length - 1;
            const currentSegment = Math.floor(line.progress * totalLength);
            const segmentProgress = (line.progress * totalLength) % 1;

            ctx.strokeStyle = colorScheme.primary;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.4;

            ctx.beginPath();
            for (let i = 0; i <= currentSegment && i < line.points.length - 1; i++) {
                const p1 = line.points[i];
                const p2 = line.points[i + 1];

                if (i === 0) ctx.moveTo(p1.x, p1.y);

                if (i === currentSegment) {
                    const x = p1.x + (p2.x - p1.x) * segmentProgress;
                    const y = p1.y + (p2.y - p1.y) * segmentProgress;
                    ctx.lineTo(x, y);

                    // Draw node at current position
                    ctx.stroke();
                    ctx.fillStyle = colorScheme.primary;
                    ctx.globalAlpha = 0.8;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.lineTo(p2.x, p2.y);
                }
            }
            ctx.stroke();
        }

        // Central Forerunner symbol
        const cx = width / 2;
        const cy = height / 2;
        const symbolSize = Math.min(width, height) * 0.15;
        const symbolPulse = Math.sin(time * 0.5) * 0.3 + 0.7;

        ctx.globalAlpha = 0.08 * symbolPulse;
        ctx.strokeStyle = colorScheme.primary;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 30;
        ctx.shadowColor = colorScheme.primary;

        // Outer ring
        ctx.beginPath();
        ctx.arc(cx, cy, symbolSize, 0, Math.PI * 2);
        ctx.stroke();

        // Inner triangular pattern (Reclaimer symbol inspired)
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
            const x = cx + Math.cos(angle) * symbolSize * 0.7;
            const y = cy + Math.sin(angle) * symbolSize * 0.7;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Center dot
        ctx.globalAlpha = 0.15 * symbolPulse;
        ctx.beginPath();
        ctx.arc(cx, cy, symbolSize * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    },

    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
    },

    // ==================== AVATAR BIOLUMINESCENCE ANIMATION ====================
    initAvatar() {
        this.avatarParticles = [];
        this.avatarSpores = [];
        this.avatarWaves = [];
        this.avatarTendrils = [];

        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 6000);

        // Main bioluminescent particles
        for (let i = 0; i < particleCount; i++) {
            this.avatarParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3 - 0.2, // Slight upward drift
                size: 2 + Math.random() * 5,
                hue: 170 + Math.random() * 80, // Cyan to magenta
                pulseOffset: Math.random() * Math.PI * 2,
                pulseSpeed: 0.3 + Math.random() * 0.7,
                type: Math.random() > 0.7 ? 'large' : 'small'
            });
        }

        // Floating spores (like dandelion seeds)
        for (let i = 0; i < 30; i++) {
            this.avatarSpores.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.3 - Math.random() * 0.5,
                size: 3 + Math.random() * 4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                alpha: 0.4 + Math.random() * 0.4,
                hue: 180 + Math.random() * 40
            });
        }

        // Bioluminescent waves
        for (let i = 0; i < 5; i++) {
            this.avatarWaves.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 50,
                radius: 0,
                maxRadius: 300 + Math.random() * 200,
                speed: 0.5 + Math.random() * 1,
                hue: 180 + Math.random() * 60
            });
        }

        // Organic tendrils
        for (let i = 0; i < 8; i++) {
            this.avatarTendrils.push({
                baseX: Math.random() * this.canvas.width,
                baseY: this.canvas.height,
                segments: 15 + Math.floor(Math.random() * 10),
                phase: Math.random() * Math.PI * 2,
                amplitude: 20 + Math.random() * 30,
                height: 150 + Math.random() * 200,
                hue: 160 + Math.random() * 80
            });
        }
    },

    drawAvatar(ctx, width, height) {
        ctx.fillStyle = 'rgba(2, 2, 10, 0.06)';
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() / 1000;

        // Draw organic tendrils from bottom
        for (const tendril of this.avatarTendrils) {
            ctx.beginPath();
            ctx.moveTo(tendril.baseX, tendril.baseY);

            const segmentHeight = tendril.height / tendril.segments;
            let prevX = tendril.baseX;
            let prevY = tendril.baseY;

            for (let i = 1; i <= tendril.segments; i++) {
                const progress = i / tendril.segments;
                const wave = Math.sin(time * 2 + tendril.phase + i * 0.3) * tendril.amplitude * (1 - progress * 0.5);
                const x = tendril.baseX + wave;
                const y = tendril.baseY - i * segmentHeight;

                const cpX = prevX + (x - prevX) * 0.5 + wave * 0.3;
                const cpY = prevY + (y - prevY) * 0.5;

                ctx.quadraticCurveTo(cpX, cpY, x, y);
                prevX = x;
                prevY = y;
            }

            const alpha = 0.15 + Math.sin(time + tendril.phase) * 0.05;
            ctx.strokeStyle = `hsla(${tendril.hue}, 100%, 60%, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = `hsla(${tendril.hue}, 100%, 70%, 0.5)`;
            ctx.stroke();

            // Draw glow orb at tip
            const tipY = tendril.baseY - tendril.height;
            const tipX = tendril.baseX + Math.sin(time * 2 + tendril.phase) * tendril.amplitude * 0.5;
            const gradient = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 15);
            gradient.addColorStop(0, `hsla(${tendril.hue}, 100%, 80%, 0.8)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(tipX, tipY, 15, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw expanding waves
        ctx.shadowBlur = 0;
        for (const wave of this.avatarWaves) {
            wave.radius += wave.speed * this.speed;
            wave.y -= wave.speed * 0.5;

            if (wave.radius > wave.maxRadius || wave.y < -wave.maxRadius) {
                wave.radius = 0;
                wave.y = height + 50;
                wave.x = Math.random() * width;
            }

            const alpha = (1 - wave.radius / wave.maxRadius) * 0.15;
            ctx.strokeStyle = `hsla(${wave.hue}, 100%, 60%, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw floating spores
        for (const spore of this.avatarSpores) {
            spore.x += spore.vx * this.speed;
            spore.y += spore.vy * this.speed;
            spore.rotation += spore.rotationSpeed * this.speed;

            if (spore.y < -20) {
                spore.y = height + 20;
                spore.x = Math.random() * width;
            }
            if (spore.x < -20) spore.x = width + 20;
            if (spore.x > width + 20) spore.x = -20;

            ctx.save();
            ctx.translate(spore.x, spore.y);
            ctx.rotate(spore.rotation);

            // Draw spore with filaments
            ctx.strokeStyle = `hsla(${spore.hue}, 100%, 80%, ${spore.alpha * 0.5})`;
            ctx.lineWidth = 0.5;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * spore.size * 2, Math.sin(angle) * spore.size * 2);
                ctx.stroke();
            }

            // Center glow
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, spore.size);
            gradient.addColorStop(0, `hsla(${spore.hue}, 100%, 90%, ${spore.alpha})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, spore.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Draw main particles with connections
        const connectionDistance = 120;

        for (const p of this.avatarParticles) {
            p.x += p.vx * this.speed;
            p.y += p.vy * this.speed;

            // Gentle floating motion
            p.x += Math.sin(time * 0.5 + p.pulseOffset) * 0.2;
            p.y += Math.cos(time * 0.3 + p.pulseOffset) * 0.1;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < -20) p.y = height + 20;
            if (p.y > height + 20) p.y = -20;

            const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.5 + 0.5;
            const size = p.size * (0.6 + pulse * 0.4);

            // Draw glow
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * (p.type === 'large' ? 8 : 4));
            gradient.addColorStop(0, `hsla(${p.hue}, 100%, 75%, ${0.9 * pulse})`);
            gradient.addColorStop(0.3, `hsla(${p.hue}, 100%, 60%, ${0.4 * pulse})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * (p.type === 'large' ? 8 : 4), 0, Math.PI * 2);
            ctx.fill();

            // Draw bright core
            ctx.fillStyle = `hsla(${p.hue}, 80%, 90%, ${pulse * 0.9})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw organic curved connections
        ctx.lineWidth = 1;
        for (let i = 0; i < this.avatarParticles.length; i++) {
            for (let j = i + 1; j < this.avatarParticles.length; j++) {
                const p1 = this.avatarParticles[i];
                const p2 = this.avatarParticles[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance && dist > 30) {
                    const alpha = (1 - dist / connectionDistance) * 0.25;
                    const hue = (p1.hue + p2.hue) / 2;

                    // Draw curved connection
                    const midX = (p1.x + p2.x) / 2 + Math.sin(time + i) * 10;
                    const midY = (p1.y + p2.y) / 2 + Math.cos(time + j) * 10;

                    ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    },

    // ==================== PARTICLES ANIMATION ====================
    initParticles() {
        this.particles = [];
        this.shootingStars = [];
        this.nebulaClouds = [];
        this.constellations = [];
        this.dustParticles = [];
        this.galaxyArms = [];

        const count = Math.floor((this.canvas.width * this.canvas.height) / 3000);

        // Stars with more variety
        for (let i = 0; i < count; i++) {
            const starType = Math.random();
            const depth = Math.random(); // Parallax depth
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: starType > 0.98 ? 3 + Math.random() * 2 :
                      starType > 0.9 ? 1.5 + Math.random() * 1.5 :
                      0.3 + Math.random() * 1,
                alpha: 0.2 + Math.random() * 0.8,
                twinkleSpeed: 0.3 + Math.random() * 3,
                twinkleOffset: Math.random() * Math.PI * 2,
                color: this.getStarColor(starType),
                isBright: starType > 0.95,
                isSupernova: starType > 0.995,
                depth: depth,
                driftX: (Math.random() - 0.5) * 0.02,
                driftY: (Math.random() - 0.5) * 0.02,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }

        // Floating dust particles
        for (let i = 0; i < 50; i++) {
            this.dustParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 0.5 + Math.random() * 2,
                alpha: 0.05 + Math.random() * 0.1,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.2,
                hue: Math.random() > 0.5 ? 200 + Math.random() * 60 : 280 + Math.random() * 40
            });
        }

        // Enhanced nebula clouds
        for (let i = 0; i < 6; i++) {
            this.nebulaClouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radiusX: 200 + Math.random() * 300,
                radiusY: 150 + Math.random() * 200,
                rotation: Math.random() * Math.PI,
                hue: [260, 200, 320, 180, 300, 220][i % 6] + Math.random() * 30,
                alpha: 0.02 + Math.random() * 0.04,
                layers: 2 + Math.floor(Math.random() * 3),
                rotSpeed: (Math.random() - 0.5) * 0.02
            });
        }

        // Galaxy spiral arms
        for (let i = 0; i < 2; i++) {
            this.galaxyArms.push({
                centerX: this.canvas.width * (0.3 + Math.random() * 0.4),
                centerY: this.canvas.height * (0.3 + Math.random() * 0.4),
                radius: 100 + Math.random() * 150,
                arms: 2 + Math.floor(Math.random() * 2),
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: 0.0003 + Math.random() * 0.0002,
                alpha: 0.03 + Math.random() * 0.02
            });
        }

        // More shooting stars
        for (let i = 0; i < 5; i++) {
            this.shootingStars.push(this.createShootingStar());
        }

        // Create constellations
        this.createConstellations();
    },

    getStarColor(starType) {
        // More realistic star colors based on temperature
        if (starType > 0.98) {
            // Blue giants - hottest
            return ['#9bb0ff', '#aabfff', '#cad7ff'][Math.floor(Math.random() * 3)];
        } else if (starType > 0.95) {
            // White-blue stars
            return ['#f8f7ff', '#eef4ff', '#cad8ff'][Math.floor(Math.random() * 3)];
        } else if (starType > 0.85) {
            // Yellow-white stars (like our Sun)
            return ['#fff4ea', '#fff2e0', '#ffe9c9'][Math.floor(Math.random() * 3)];
        } else if (starType > 0.7) {
            // Orange stars
            return ['#ffd2a1', '#ffcc8f', '#ffc478'][Math.floor(Math.random() * 3)];
        } else {
            // Red dwarfs - coolest, most common
            return ['#ffcccc', '#ffd4d4', '#ffe0e0', '#ffffff'][Math.floor(Math.random() * 4)];
        }
    },

    createShootingStar() {
        const speed = 8 + Math.random() * 12;
        const angle = Math.PI / 6 + Math.random() * Math.PI / 6; // 30-60 degrees
        return {
            x: Math.random() * this.canvas.width * 0.8,
            y: Math.random() * this.canvas.height * 0.4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length: 80 + Math.random() * 150,
            alpha: 0,
            maxAlpha: 0.7 + Math.random() * 0.3,
            active: false,
            timer: 200 + Math.random() * 600,
            sparkles: [],
            hasSparkles: Math.random() > 0.5,
            color: Math.random() > 0.8 ? '#aaccff' : '#ffffff'
        };
    },

    createConstellations() {
        // Create a few constellation patterns
        const patterns = [
            // Orion-like
            [{x: 0, y: 0}, {x: 20, y: 30}, {x: 40, y: 0}, {x: 20, y: -20}, {x: 0, y: 0}],
            // Triangle
            [{x: 0, y: 0}, {x: 30, y: 50}, {x: 60, y: 0}, {x: 0, y: 0}],
            // W shape
            [{x: 0, y: 0}, {x: 15, y: 25}, {x: 30, y: 0}, {x: 45, y: 25}, {x: 60, y: 0}]
        ];

        for (let i = 0; i < 3; i++) {
            const pattern = patterns[i % patterns.length];
            const baseX = 100 + Math.random() * (this.canvas.width - 200);
            const baseY = 100 + Math.random() * (this.canvas.height - 200);

            this.constellations.push({
                points: pattern.map(p => ({
                    x: baseX + p.x * 2,
                    y: baseY + p.y * 2
                })),
                alpha: 0.1 + Math.random() * 0.1
            });
        }
    },

    drawParticles(ctx, width, height) {
        ctx.fillStyle = 'rgba(5, 2, 15, 0.03)';
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() / 1000;

        // Draw galaxy spiral arms
        if (this.galaxyArms) {
            for (const galaxy of this.galaxyArms) {
                galaxy.rotation += galaxy.rotSpeed * this.speed;
                ctx.save();
                ctx.translate(galaxy.centerX, galaxy.centerY);

                for (let arm = 0; arm < galaxy.arms; arm++) {
                    const armOffset = (Math.PI * 2 / galaxy.arms) * arm;
                    for (let i = 0; i < 60; i++) {
                        const angle = galaxy.rotation + armOffset + i * 0.15;
                        const dist = 10 + i * 3;
                        const x = Math.cos(angle) * dist;
                        const y = Math.sin(angle) * dist * 0.6;
                        const starAlpha = galaxy.alpha * (1 - i / 80);

                        ctx.fillStyle = `rgba(180, 200, 255, ${starAlpha})`;
                        ctx.beginPath();
                        ctx.arc(x, y, 0.5 + Math.random() * 0.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore();
            }
        }

        // Draw enhanced nebula clouds with multiple layers
        for (const nebula of this.nebulaClouds) {
            nebula.rotation += (nebula.rotSpeed || 0.005) * this.speed;

            for (let layer = 0; layer < (nebula.layers || 2); layer++) {
                ctx.save();
                ctx.translate(nebula.x, nebula.y);
                ctx.rotate(nebula.rotation + layer * 0.5);

                const layerScale = 1 - layer * 0.2;
                const layerAlpha = nebula.alpha * (1 - layer * 0.3);

                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radiusX * layerScale);
                gradient.addColorStop(0, `hsla(${nebula.hue + layer * 20}, 80%, 60%, ${layerAlpha})`);
                gradient.addColorStop(0.3, `hsla(${nebula.hue + 30}, 70%, 50%, ${layerAlpha * 0.6})`);
                gradient.addColorStop(0.6, `hsla(${nebula.hue + 50}, 60%, 40%, ${layerAlpha * 0.3})`);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.ellipse(0, 0, nebula.radiusX * layerScale, nebula.radiusY * layerScale, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Draw floating dust particles
        if (this.dustParticles) {
            for (const dust of this.dustParticles) {
                dust.x += dust.vx * this.speed;
                dust.y += dust.vy * this.speed;

                // Wrap around screen
                if (dust.x < 0) dust.x = width;
                if (dust.x > width) dust.x = 0;
                if (dust.y < 0) dust.y = height;
                if (dust.y > height) dust.y = 0;

                const shimmer = Math.sin(time * 2 + dust.x * 0.01) * 0.5 + 0.5;
                ctx.fillStyle = `hsla(${dust.hue}, 50%, 70%, ${dust.alpha * shimmer})`;
                ctx.beginPath();
                ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw constellations
        for (const constellation of this.constellations) {
            const pulse = Math.sin(time * 0.5) * 0.05 + constellation.alpha;

            ctx.strokeStyle = `rgba(100, 150, 255, ${pulse})`;
            ctx.lineWidth = 0.5;
            ctx.setLineDash([5, 10]);
            ctx.beginPath();

            for (let i = 0; i < constellation.points.length; i++) {
                const point = constellation.points[i];
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw constellation stars with glow
            for (const point of constellation.points) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#6699ff';
                ctx.fillStyle = `rgba(200, 220, 255, ${pulse * 3})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Draw stars with drift and enhanced effects
        for (const p of this.particles) {
            // Subtle star drift
            p.x += p.driftX * this.speed * p.depth;
            p.y += p.driftY * this.speed * p.depth;

            // Wrap around
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            const twinkle = Math.sin(time * p.twinkleSpeed + p.twinkleOffset) * 0.5 + 0.5;
            const pulse = Math.sin(time * 0.5 + p.pulsePhase) * 0.2 + 0.8;
            const alpha = p.alpha * (0.5 + twinkle * 0.5) * pulse;
            const size = p.size * (0.8 + twinkle * 0.2);

            if (p.isSupernova) {
                // Supernova effect - rare, brilliant stars
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#ffffff';

                const supernovaGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 8);
                supernovaGlow.addColorStop(0, '#ffffff');
                supernovaGlow.addColorStop(0.1, p.color);
                supernovaGlow.addColorStop(0.3, `rgba(255, 200, 100, ${alpha * 0.5})`);
                supernovaGlow.addColorStop(0.6, `rgba(255, 100, 50, ${alpha * 0.2})`);
                supernovaGlow.addColorStop(1, 'transparent');

                ctx.fillStyle = supernovaGlow;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size * 8, 0, Math.PI * 2);
                ctx.fill();

                // 6-point star rays
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                ctx.lineWidth = 1.5;
                const rayLength = size * 12 * twinkle;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i + time * 0.1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + Math.cos(angle) * rayLength, p.y + Math.sin(angle) * rayLength);
                }
                ctx.stroke();
                ctx.shadowBlur = 0;

            } else if (p.isBright) {
                // Bright star with enhanced glow
                ctx.shadowBlur = 20;
                ctx.shadowColor = p.color;

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 5);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.15, p.color);
                gradient.addColorStop(0.4, `rgba(255, 255, 255, ${alpha * 0.3})`);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size * 5, 0, Math.PI * 2);
                ctx.fill();

                // 4-point sparkle
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
                ctx.lineWidth = 1;
                const rayLength = size * 8 * twinkle;
                ctx.beginPath();
                ctx.moveTo(p.x - rayLength, p.y);
                ctx.lineTo(p.x + rayLength, p.y);
                ctx.moveTo(p.x, p.y - rayLength);
                ctx.lineTo(p.x, p.y + rayLength);
                ctx.stroke();

                ctx.shadowBlur = 0;
            } else {
                // Regular star with color
                ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', '');
                if (p.color.startsWith('#')) {
                    const r = parseInt(p.color.slice(1, 3), 16);
                    const g = parseInt(p.color.slice(3, 5), 16);
                    const b = parseInt(p.color.slice(5, 7), 16);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw enhanced shooting stars
        for (const star of this.shootingStars) {
            if (!star.active) {
                star.timer -= this.speed;
                if (star.timer <= 0) {
                    star.active = true;
                    star.x = Math.random() * width * 0.6;
                    star.y = Math.random() * height * 0.3;
                    star.alpha = star.maxAlpha;
                    star.sparkles = [];
                }
                continue;
            }

            star.x += star.vx * this.speed;
            star.y += star.vy * this.speed;
            star.alpha -= 0.008 * this.speed;

            // Add sparkles along the trail
            if (star.hasSparkles && Math.random() > 0.7) {
                star.sparkles.push({
                    x: star.x - star.vx * Math.random() * 3,
                    y: star.y - star.vy * Math.random() * 3,
                    alpha: 0.8,
                    size: 1 + Math.random()
                });
            }

            // Update and draw sparkles
            for (let i = star.sparkles.length - 1; i >= 0; i--) {
                const sparkle = star.sparkles[i];
                sparkle.alpha -= 0.05;
                if (sparkle.alpha <= 0) {
                    star.sparkles.splice(i, 1);
                    continue;
                }
                ctx.fillStyle = `rgba(255, 255, 200, ${sparkle.alpha})`;
                ctx.beginPath();
                ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
                ctx.fill();
            }

            if (star.alpha <= 0 || star.x > width || star.y > height) {
                Object.assign(star, this.createShootingStar());
                continue;
            }

            // Draw shooting star trail with gradient
            const trailLength = star.length * (star.alpha / star.maxAlpha);
            const gradient = ctx.createLinearGradient(
                star.x, star.y,
                star.x - star.vx * trailLength / 8,
                star.y - star.vy * trailLength / 8
            );
            gradient.addColorStop(0, star.color);
            gradient.addColorStop(0.2, `rgba(200, 220, 255, ${star.alpha * 0.7})`);
            gradient.addColorStop(0.5, `rgba(150, 180, 255, ${star.alpha * 0.3})`);
            gradient.addColorStop(1, 'transparent');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
                star.x - star.vx * trailLength / 8,
                star.y - star.vy * trailLength / 8
            );
            ctx.stroke();

            // Bright glowing head
            ctx.shadowBlur = 15;
            ctx.shadowColor = star.color;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    },



    // ==================== GALAXY ANIMATION ====================
    initGalaxy() {
        this.galaxyPlanets = [];
        this.galaxyStars = [];
        this.galaxyAsteroids = [];
        this.galaxyNebulas = [];

        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background stars
        for (let i = 0; i < 200; i++) {
            this.galaxyStars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 0.3 + Math.random() * 1.5,
                alpha: 0.3 + Math.random() * 0.7,
                twinkle: Math.random() * Math.PI * 2
            });
        }

        // Colorful nebulas in background
        const nebulaColors = [
            { h: 280, s: 80, l: 50 }, // Purple
            { h: 200, s: 70, l: 40 }, // Blue
            { h: 320, s: 60, l: 45 }, // Pink
            { h: 180, s: 60, l: 35 }  // Teal
        ];
        for (let i = 0; i < 3; i++) {
            const color = nebulaColors[i % nebulaColors.length];
            this.galaxyNebulas.push({
                x: Math.random() * w,
                y: Math.random() * h,
                radiusX: 200 + Math.random() * 300,
                radiusY: 150 + Math.random() * 200,
                rotation: Math.random() * Math.PI,
                hue: color.h,
                alpha: 0.03 + Math.random() * 0.03
            });
        }

        // Planets with different sizes and colors
        const planetColors = [
            { main: '#ff6b4a', shadow: '#cc4030', ring: '#ffaa80' },  // Mars-like red
            { main: '#4a8eff', shadow: '#2060cc', ring: '#80c0ff' },  // Neptune-like blue
            { main: '#ffd700', shadow: '#cc9900', ring: '#ffec80' },  // Saturn-like gold
            { main: '#90ee90', shadow: '#50aa50', ring: '#c0ffc0' },  // Green gas giant
            { main: '#dda0dd', shadow: '#9070a0', ring: '#eeccee' },  // Purple ice giant
            { main: '#ff8c00', shadow: '#cc6600', ring: '#ffbb66' },  // Jupiter-like orange
            { main: '#87ceeb', shadow: '#5090bb', ring: '#b0e0f0' },  // Uranus-like cyan
            { main: '#cd853f', shadow: '#8b5a2b', ring: '#daa06d' }   // Brown dwarf
        ];

        for (let i = 0; i < 8; i++) {
            const hasRing = Math.random() > 0.5;
            const colors = planetColors[i % planetColors.length];
            this.galaxyPlanets.push({
                x: 100 + Math.random() * (w - 200),
                y: 100 + Math.random() * (h - 200),
                size: 20 + Math.random() * 60,
                color: colors.main,
                shadowColor: colors.shadow,
                ringColor: colors.ring,
                hasRing: hasRing,
                ringAngle: Math.random() * 0.5 - 0.25,
                ringWidth: hasRing ? 0.3 + Math.random() * 0.4 : 0,
                orbitSpeed: (Math.random() - 0.5) * 0.0003,
                orbitRadius: Math.random() * 50,
                orbitAngle: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                rotation: Math.random() * Math.PI * 2,
                moons: Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0
            });
        }

        // Asteroids
        for (let i = 0; i < 30; i++) {
            this.galaxyAsteroids.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 2 + Math.random() * 6,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.3,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                color: ['#888', '#aaa', '#777', '#999'][Math.floor(Math.random() * 4)]
            });
        }
    },

    drawGalaxy(ctx, width, height) {
        ctx.fillStyle = 'rgba(5, 0, 15, 0.04)';
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() / 1000;

        // Draw nebulas
        for (const nebula of this.galaxyNebulas) {
            ctx.save();
            ctx.translate(nebula.x, nebula.y);
            ctx.rotate(nebula.rotation);

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radiusX);
            gradient.addColorStop(0, `hsla(${nebula.hue}, 70%, 50%, ${nebula.alpha})`);
            gradient.addColorStop(0.5, `hsla(${nebula.hue}, 60%, 40%, ${nebula.alpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(0, 0, nebula.radiusX, nebula.radiusY, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw background stars
        for (const star of this.galaxyStars) {
            const twinkle = Math.sin(time * 2 + star.twinkle) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw asteroids
        for (const ast of this.galaxyAsteroids) {
            ast.x += ast.vx * this.speed;
            ast.y += ast.vy * this.speed;
            ast.rotation += ast.rotationSpeed * this.speed;

            if (ast.x < -20) ast.x = width + 20;
            if (ast.x > width + 20) ast.x = -20;
            if (ast.y < -20) ast.y = height + 20;
            if (ast.y > height + 20) ast.y = -20;

            ctx.save();
            ctx.translate(ast.x, ast.y);
            ctx.rotate(ast.rotation);
            ctx.fillStyle = ast.color;
            ctx.beginPath();
            // Irregular asteroid shape
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const radius = ast.size * (0.7 + Math.sin(i * 2) * 0.3);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Draw planets
        for (const planet of this.galaxyPlanets) {
            // Orbital motion
            planet.orbitAngle += planet.orbitSpeed * this.speed;
            const displayX = planet.x + Math.cos(planet.orbitAngle) * planet.orbitRadius;
            const displayY = planet.y + Math.sin(planet.orbitAngle) * planet.orbitRadius * 0.3;

            // Draw ring behind planet (if has ring)
            if (planet.hasRing) {
                ctx.save();
                ctx.translate(displayX, displayY);
                ctx.rotate(planet.ringAngle);
                ctx.scale(1, 0.3);

                ctx.strokeStyle = planet.ringColor;
                ctx.lineWidth = planet.size * planet.ringWidth;
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.arc(0, 0, planet.size * 1.5, Math.PI * 0.1, Math.PI * 0.9);
                ctx.stroke();
                ctx.restore();
            }

            // Planet shadow (3D effect)
            const shadowGradient = ctx.createRadialGradient(
                displayX - planet.size * 0.3, displayY - planet.size * 0.3, 0,
                displayX, displayY, planet.size
            );
            shadowGradient.addColorStop(0, planet.color);
            shadowGradient.addColorStop(0.7, planet.color);
            shadowGradient.addColorStop(1, planet.shadowColor);

            ctx.fillStyle = shadowGradient;
            ctx.shadowBlur = 20;
            ctx.shadowColor = planet.color;
            ctx.beginPath();
            ctx.arc(displayX, displayY, planet.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Planet highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(displayX - planet.size * 0.3, displayY - planet.size * 0.3, planet.size * 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Draw ring in front of planet (if has ring)
            if (planet.hasRing) {
                ctx.save();
                ctx.translate(displayX, displayY);
                ctx.rotate(planet.ringAngle);
                ctx.scale(1, 0.3);

                ctx.strokeStyle = planet.ringColor;
                ctx.lineWidth = planet.size * planet.ringWidth;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(0, 0, planet.size * 1.5, Math.PI * 1.1, Math.PI * 1.9);
                ctx.stroke();
                ctx.restore();
            }

            // Draw moons
            for (let m = 0; m < planet.moons; m++) {
                const moonAngle = time * 0.5 + m * (Math.PI * 2 / planet.moons);
                const moonDist = planet.size * 1.8 + m * 15;
                const moonX = displayX + Math.cos(moonAngle) * moonDist;
                const moonY = displayY + Math.sin(moonAngle) * moonDist * 0.4;
                const moonSize = 3 + m * 2;

                ctx.fillStyle = '#ccc';
                ctx.beginPath();
                ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
    },

    // ==================== OCEAN ANIMATION ====================
    initOcean() {
        this.oceanBubbles = [];
        this.oceanFish = [];
        this.oceanPlants = [];
        this.oceanRays = [];
        this.oceanParticles = [];

        const w = this.canvas.width;
        const h = this.canvas.height;

        // Light rays from surface
        for (let i = 0; i < 5; i++) {
            this.oceanRays.push({
                x: Math.random() * w,
                width: 50 + Math.random() * 100,
                alpha: 0.05 + Math.random() * 0.1,
                speed: 0.2 + Math.random() * 0.3,
                offset: Math.random() * Math.PI * 2
            });
        }

        // Bubbles
        for (let i = 0; i < 40; i++) {
            this.oceanBubbles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 2 + Math.random() * 8,
                speed: 0.5 + Math.random() * 1.5,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.03,
                alpha: 0.3 + Math.random() * 0.4
            });
        }

        // Fish
        const fishColors = [
            { body: '#ff6b6b', fin: '#ff8787' },
            { body: '#4ecdc4', fin: '#7eddd6' },
            { body: '#ffe66d', fin: '#ffee99' },
            { body: '#c44dff', fin: '#d580ff' },
            { body: '#ff9f43', fin: '#ffb976' },
            { body: '#00cec9', fin: '#55efc4' }
        ];
        for (let i = 0; i < 15; i++) {
            const colors = fishColors[i % fishColors.length];
            const direction = Math.random() > 0.5 ? 1 : -1;
            this.oceanFish.push({
                x: Math.random() * w,
                y: h * 0.2 + Math.random() * h * 0.6,
                size: 10 + Math.random() * 25,
                speed: (0.5 + Math.random() * 1.5) * direction,
                tailPhase: Math.random() * Math.PI * 2,
                bodyColor: colors.body,
                finColor: colors.fin,
                yOffset: Math.random() * Math.PI * 2
            });
        }

        // Seaweed/plants from bottom
        for (let i = 0; i < 12; i++) {
            this.oceanPlants.push({
                x: (w / 12) * i + Math.random() * 50,
                height: 100 + Math.random() * 150,
                segments: 8 + Math.floor(Math.random() * 5),
                phase: Math.random() * Math.PI * 2,
                hue: 120 + Math.random() * 40,
                width: 8 + Math.random() * 8
            });
        }

        // Floating particles (plankton)
        for (let i = 0; i < 50; i++) {
            this.oceanParticles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 1 + Math.random() * 3,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.2,
                alpha: 0.2 + Math.random() * 0.3,
                hue: 180 + Math.random() * 40
            });
        }
    },

    drawOcean(ctx, width, height) {
        // Deep ocean gradient fade
        ctx.fillStyle = 'rgba(0, 20, 40, 0.05)';
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() / 1000;

        // Draw light rays from surface
        for (const ray of this.oceanRays) {
            const wobble = Math.sin(time * ray.speed + ray.offset) * 30;
            const gradient = ctx.createLinearGradient(ray.x + wobble, 0, ray.x + wobble + ray.width, height);
            gradient.addColorStop(0, `rgba(100, 200, 255, ${ray.alpha})`);
            gradient.addColorStop(0.3, `rgba(80, 180, 255, ${ray.alpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(ray.x + wobble - ray.width / 2, 0);
            ctx.lineTo(ray.x + wobble + ray.width / 2, 0);
            ctx.lineTo(ray.x + wobble + ray.width, height);
            ctx.lineTo(ray.x + wobble - ray.width / 2, height);
            ctx.closePath();
            ctx.fill();
        }

        // Draw seaweed
        for (const plant of this.oceanPlants) {
            ctx.beginPath();
            ctx.moveTo(plant.x, height);

            let prevX = plant.x;
            let prevY = height;

            for (let i = 1; i <= plant.segments; i++) {
                const progress = i / plant.segments;
                const wave = Math.sin(time * 1.5 + plant.phase + i * 0.4) * (20 + progress * 15);
                const x = plant.x + wave;
                const y = height - (plant.height * progress);

                ctx.quadraticCurveTo(prevX + wave * 0.5, (prevY + y) / 2, x, y);
                prevX = x;
                prevY = y;
            }

            ctx.strokeStyle = `hsla(${plant.hue}, 60%, 35%, 0.6)`;
            ctx.lineWidth = plant.width * (1 - 0.3);
            ctx.lineCap = 'round';
            ctx.stroke();

            // Lighter inner stroke
            ctx.strokeStyle = `hsla(${plant.hue}, 70%, 45%, 0.4)`;
            ctx.lineWidth = plant.width * 0.4;
            ctx.stroke();
        }

        // Draw floating particles
        for (const p of this.oceanParticles) {
            p.x += p.vx * this.speed;
            p.y += p.vy * this.speed;
            p.y += Math.sin(time + p.x * 0.01) * 0.1;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw fish
        for (const fish of this.oceanFish) {
            fish.x += fish.speed * this.speed;
            fish.tailPhase += 0.15 * this.speed;
            fish.y += Math.sin(time * 0.5 + fish.yOffset) * 0.3;

            // Wrap around
            if (fish.speed > 0 && fish.x > width + 50) fish.x = -50;
            if (fish.speed < 0 && fish.x < -50) fish.x = width + 50;

            ctx.save();
            ctx.translate(fish.x, fish.y);
            if (fish.speed < 0) ctx.scale(-1, 1);

            const tailWave = Math.sin(fish.tailPhase) * 0.3;

            // Tail
            ctx.fillStyle = fish.finColor;
            ctx.beginPath();
            ctx.moveTo(-fish.size, 0);
            ctx.quadraticCurveTo(-fish.size * 1.5, -fish.size * 0.4 + tailWave * fish.size,
                                 -fish.size * 1.8, -fish.size * 0.3 + tailWave * fish.size);
            ctx.quadraticCurveTo(-fish.size * 1.5, tailWave * fish.size * 0.5,
                                 -fish.size * 1.8, fish.size * 0.3 + tailWave * fish.size);
            ctx.quadraticCurveTo(-fish.size * 1.5, fish.size * 0.4 + tailWave * fish.size, -fish.size, 0);
            ctx.fill();

            // Body
            ctx.fillStyle = fish.bodyColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, fish.size, fish.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dorsal fin
            ctx.fillStyle = fish.finColor;
            ctx.beginPath();
            ctx.moveTo(-fish.size * 0.3, -fish.size * 0.4);
            ctx.quadraticCurveTo(0, -fish.size * 0.9, fish.size * 0.3, -fish.size * 0.4);
            ctx.closePath();
            ctx.fill();

            // Eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(fish.size * 0.5, -fish.size * 0.1, fish.size * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(fish.size * 0.55, -fish.size * 0.1, fish.size * 0.08, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Draw bubbles
        for (const bubble of this.oceanBubbles) {
            bubble.wobble += bubble.wobbleSpeed * this.speed;
            bubble.y -= bubble.speed * this.speed;
            bubble.x += Math.sin(bubble.wobble) * 0.5;

            if (bubble.y < -20) {
                bubble.y = height + 20;
                bubble.x = Math.random() * width;
            }

            // Bubble with highlight
            ctx.strokeStyle = `rgba(200, 230, 255, ${bubble.alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            ctx.stroke();

            // Highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // ==================== ANIMATION LOOP ====================
    startAnimation() {
        if (this.currentAnimation === 'none') {
            this.stopAnimation();
            if (this.ctx) {
                this.ctx.fillStyle = '#020208';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            return;
        }

        this.initAnimationData();
        this.lastFrameTime = performance.now();

        const animate = (currentTime) => {
            // Frame rate limiting for performance optimization
            const elapsed = currentTime - this.lastFrameTime;

            if (elapsed >= this.frameInterval) {
                this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

                if (this.ctx && this.canvas) {
                    switch (this.currentAnimation) {
                        case 'matrix':
                            this.drawMatrix(this.ctx, this.canvas.width, this.canvas.height);
                            break;
                        case 'halo':
                            this.drawHalo(this.ctx, this.canvas.width, this.canvas.height);
                            break;
                        case 'avatar':
                            this.drawAvatar(this.ctx, this.canvas.width, this.canvas.height);
                            break;
                        case 'particles':
                            this.drawParticles(this.ctx, this.canvas.width, this.canvas.height);
                            break;
                        case 'galaxy':
                            this.drawGalaxy(this.ctx, this.canvas.width, this.canvas.height);
                            break;
                        case 'ocean':
                            this.drawOcean(this.ctx, this.canvas.width, this.canvas.height);
                            break;
                    }
                }

                // Also draw to preview if visible (skip if page not visible)
                if (this.isPageVisible && this.previewCtx && this.previewCanvas) {
                    switch (this.currentAnimation) {
                        case 'matrix':
                            this.drawMatrix(this.previewCtx, this.previewCanvas.width, this.previewCanvas.height);
                            break;
                        case 'halo':
                            this.drawHalo(this.previewCtx, this.previewCanvas.width, this.previewCanvas.height);
                            break;
                        case 'avatar':
                            this.drawAvatar(this.previewCtx, this.previewCanvas.width, this.previewCanvas.height);
                            break;
                        case 'particles':
                            this.drawParticles(this.previewCtx, this.previewCanvas.width, this.previewCanvas.height);
                            break;
                        case 'galaxy':
                            this.drawGalaxy(this.previewCtx, this.previewCanvas.width, this.previewCanvas.height);
                            break;
                        case 'ocean':
                            this.drawOcean(this.previewCtx, this.previewCanvas.width, this.previewCanvas.height);
                            break;
                        case 'none':
                            this.previewCtx.fillStyle = '#020208';
                            this.previewCtx.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
                            break;
                    }
                }
            }

            this.animationId = requestAnimationFrame(animate);
        };

        animate(performance.now());
    },

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },

    setAnimation(type) {
        this.currentAnimation = type;
        this.stopAnimation();

        if (this.ctx) {
            this.ctx.fillStyle = '#020208';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        if (type !== 'none') {
            this.startAnimation();
        }

        // Apply CSS theme based on animation type
        document.body.classList.remove('theme-forerunner', 'theme-matrix', 'theme-avatar', 'theme-particles', 'theme-galaxy', 'theme-ocean');
        if (type === 'halo') {
            document.body.classList.add('theme-forerunner');
        } else if (type === 'matrix') {
            document.body.classList.add('theme-matrix');
        } else if (type === 'avatar') {
            document.body.classList.add('theme-avatar');
        } else if (type === 'particles') {
            document.body.classList.add('theme-particles');
        } else if (type === 'galaxy') {
            document.body.classList.add('theme-galaxy');
        } else if (type === 'ocean') {
            document.body.classList.add('theme-ocean');
        }

        // Show/hide color options
        const matrixOptions = document.getElementById('matrix-options');
        const haloOptions = document.getElementById('halo-options');

        if (matrixOptions) matrixOptions.style.display = type === 'matrix' ? 'block' : 'none';
        if (haloOptions) haloOptions.style.display = type === 'halo' ? 'block' : 'none';
    },

    // ==================== SETTINGS MANAGEMENT ====================
    setupEventListeners() {
        // Animation type selection - use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            const option = e.target.closest('.animation-option');
            if (option && option.dataset.animation) {
                document.querySelectorAll('.animation-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.setAnimation(option.dataset.animation);
                console.log('[BgAnimations] Animation changed to:', option.dataset.animation);
            }
        });

        // Matrix color selection - event delegation
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#matrix-options .color-btn');
            if (btn && btn.dataset.color) {
                document.querySelectorAll('#matrix-options .color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.matrixColor = btn.dataset.color;
            }
        });

        // Halo color selection - event delegation
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#halo-options .color-btn');
            if (btn && btn.dataset.color) {
                document.querySelectorAll('#halo-options .color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.haloColor = btn.dataset.color;
            }
        });

        // Background presets - event delegation
        document.addEventListener('click', (e) => {
            const preset = e.target.closest('.bg-preset');
            if (preset && preset.dataset.bg) {
                document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                this.setBackgroundPreset(preset.dataset.bg);
                console.log('[BgAnimations] Background preset changed to:', preset.dataset.bg);
            }
        });

        // Custom background upload
        const bgUpload = document.getElementById('bg-upload');
        if (bgUpload) {
            bgUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.setBackgroundImage(event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Clear background
        const clearBgBtn = document.getElementById('btn-clear-bg');
        if (clearBgBtn) {
            clearBgBtn.addEventListener('click', () => {
                this.clearBackgroundImage();
                document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('active'));
                document.querySelector('.bg-preset[data-bg="none"]')?.classList.add('active');
            });
        }

        // Opacity slider
        const opacitySlider = document.getElementById('bg-opacity');
        const opacityValue = document.getElementById('bg-opacity-value');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', () => {
                const value = opacitySlider.value;
                if (opacityValue) opacityValue.textContent = `${value}%`;
                this.setBackgroundOpacity(value / 100);
            });
        }

        // Speed slider
        const speedSlider = document.getElementById('anim-speed');
        const speedValue = document.getElementById('anim-speed-value');
        if (speedSlider) {
            speedSlider.addEventListener('input', () => {
                const value = parseFloat(speedSlider.value);
                if (speedValue) speedValue.textContent = `${value}x`;
                this.speed = value;
            });
        }

        // Save settings
        const saveBtn = document.getElementById('btn-save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
                this.showNotification('Settings saved!', 'success');
            });
        }

        // Reset settings
        const resetBtn = document.getElementById('btn-reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
                this.showNotification('Settings reset to default', 'info');
            });
        }
    },

    setBackgroundPreset(preset) {
        const bgLayer = document.getElementById('bg-image-layer');
        if (!bgLayer) return;

        const presets = {
            none: '',
            space: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #0c0c1d 100%)',
            nebula: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #4a2c7a 60%, #1a0a2e 100%)',
            circuit: 'linear-gradient(135deg, #0a1a1a 0%, #0d2d2d 50%, #0a1a1a 100%)',
            geometric: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 50%, #1a1a2e 100%)'
        };

        if (preset === 'none') {
            bgLayer.style.background = '';
            bgLayer.style.backgroundImage = '';
        } else {
            bgLayer.style.background = presets[preset] || '';
        }

        localStorage.setItem('obelisk-bg-preset', preset);
    },

    setBackgroundImage(dataUrl) {
        const bgLayer = document.getElementById('bg-image-layer');
        if (!bgLayer) return;

        bgLayer.style.backgroundImage = `url(${dataUrl})`;
        localStorage.setItem('obelisk-bg-image', dataUrl);

        // Deselect presets
        document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('active'));
    },

    clearBackgroundImage() {
        const bgLayer = document.getElementById('bg-image-layer');
        if (!bgLayer) return;

        bgLayer.style.backgroundImage = '';
        bgLayer.style.background = '';
        localStorage.removeItem('obelisk-bg-image');
        localStorage.setItem('obelisk-bg-preset', 'none');
    },

    setBackgroundOpacity(opacity) {
        const bgLayer = document.getElementById('bg-image-layer');
        if (bgLayer) {
            bgLayer.style.opacity = opacity;
            localStorage.setItem('obelisk-bg-opacity', opacity);
        }
    },

    saveSettings() {
        const settings = {
            animation: this.currentAnimation,
            matrixColor: this.matrixColor,
            haloColor: this.haloColor,
            speed: this.speed,
            bgOpacity: document.getElementById('bg-opacity')?.value || 30
        };
        localStorage.setItem('obelisk-animation-settings', JSON.stringify(settings));
    },

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('obelisk-animation-settings'));
            if (settings) {
                this.currentAnimation = settings.animation || 'avatar';
                this.matrixColor = settings.matrixColor || 'green';
                this.haloColor = settings.haloColor || 'blue';
                this.speed = settings.speed || 1;

                // Update UI
                document.querySelectorAll('.animation-option').forEach(o => {
                    o.classList.toggle('active', o.dataset.animation === this.currentAnimation);
                });

                document.querySelectorAll('#matrix-options .color-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.color === this.matrixColor);
                });

                document.querySelectorAll('#halo-options .color-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.color === this.haloColor);
                });

                const speedSlider = document.getElementById('anim-speed');
                const speedValue = document.getElementById('anim-speed-value');
                if (speedSlider) {
                    speedSlider.value = this.speed;
                    if (speedValue) speedValue.textContent = `${this.speed}x`;
                }

                const opacitySlider = document.getElementById('bg-opacity');
                const opacityValue = document.getElementById('bg-opacity-value');
                if (opacitySlider && settings.bgOpacity) {
                    opacitySlider.value = settings.bgOpacity;
                    if (opacityValue) opacityValue.textContent = `${settings.bgOpacity}%`;
                    this.setBackgroundOpacity(settings.bgOpacity / 100);
                }

                // Show appropriate color options
                const matrixOptions = document.getElementById('matrix-options');
                const haloOptions = document.getElementById('halo-options');
                if (matrixOptions) matrixOptions.style.display = this.currentAnimation === 'matrix' ? 'block' : 'none';
                if (haloOptions) haloOptions.style.display = this.currentAnimation === 'halo' ? 'block' : 'none';

                // Apply CSS theme based on animation type
                document.body.classList.remove('theme-forerunner', 'theme-matrix', 'theme-avatar', 'theme-particles', 'theme-galaxy', 'theme-ocean');
                if (this.currentAnimation === 'halo') {
                    document.body.classList.add('theme-forerunner');
                } else if (this.currentAnimation === 'matrix') {
                    document.body.classList.add('theme-matrix');
                } else if (this.currentAnimation === 'avatar') {
                    document.body.classList.add('theme-avatar');
                } else if (this.currentAnimation === 'particles') {
                    document.body.classList.add('theme-particles');
                } else if (this.currentAnimation === 'galaxy') {
                    document.body.classList.add('theme-galaxy');
                } else if (this.currentAnimation === 'ocean') {
                    document.body.classList.add('theme-ocean');
                }
            }

            // Load background preset
            const bgPreset = localStorage.getItem('obelisk-bg-preset');
            if (bgPreset) {
                document.querySelectorAll('.bg-preset').forEach(p => {
                    p.classList.toggle('active', p.dataset.bg === bgPreset);
                });
                this.setBackgroundPreset(bgPreset);
            }

            // Load custom background image
            const bgImage = localStorage.getItem('obelisk-bg-image');
            if (bgImage) {
                this.setBackgroundImage(bgImage);
            }

        } catch (e) {
            console.warn('Error loading animation settings:', e);
        }
    },

    resetSettings() {
        localStorage.removeItem('obelisk-animation-settings');
        localStorage.removeItem('obelisk-bg-preset');
        localStorage.removeItem('obelisk-bg-image');
        localStorage.removeItem('obelisk-bg-opacity');

        // Reset to defaults
        this.currentAnimation = 'avatar';
        this.matrixColor = 'green';
        this.haloColor = 'blue';
        this.speed = 1;

        // Update UI
        document.querySelectorAll('.animation-option').forEach(o => {
            o.classList.toggle('active', o.dataset.animation === 'avatar');
        });

        document.querySelectorAll('#matrix-options .color-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.color === 'green');
        });

        document.querySelectorAll('#halo-options .color-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.color === 'blue');
        });

        document.querySelectorAll('.bg-preset').forEach(p => {
            p.classList.toggle('active', p.dataset.bg === 'none');
        });

        const speedSlider = document.getElementById('anim-speed');
        const speedValue = document.getElementById('anim-speed-value');
        if (speedSlider) speedSlider.value = 1;
        if (speedValue) speedValue.textContent = '1x';

        const opacitySlider = document.getElementById('bg-opacity');
        const opacityValue = document.getElementById('bg-opacity-value');
        if (opacitySlider) opacitySlider.value = 30;
        if (opacityValue) opacityValue.textContent = '30%';

        // Hide color options
        const matrixOptions = document.getElementById('matrix-options');
        const haloOptions = document.getElementById('halo-options');
        if (matrixOptions) matrixOptions.style.display = 'none';
        if (haloOptions) haloOptions.style.display = 'none';

        // Clear background
        this.clearBackgroundImage();
        this.setBackgroundOpacity(0.3);

        // Restart animation
        this.setAnimation('avatar');
    },

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (typeof ObeliskApp !== 'undefined' && ObeliskApp.showNotification) {
            ObeliskApp.showNotification(message, type);
        } else {
            // Fallback
            const container = document.getElementById('notifications');
            if (container) {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.textContent = message;
                container.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            }
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    BgAnimations.init();

    // Verify background system after initialization
    setTimeout(() => {
        BgAnimations.verifyBackgroundSystem();
    }, 1000);
});

// Export for external access
window.BgAnimations = BgAnimations;

// Background system verification
BgAnimations.verifyBackgroundSystem = function() {
    console.log('=== BACKGROUND SYSTEM VERIFICATION ===');

    // Check canvas
    const canvas = document.getElementById('bg-animation-canvas');
    console.log('[BG] Canvas element:', canvas ? 'FOUND' : 'MISSING');
    if (canvas) {
        const style = getComputedStyle(canvas);
        console.log('[BG] Canvas display:', style.display);
        console.log('[BG] Canvas visibility:', style.visibility);
        console.log('[BG] Canvas z-index:', style.zIndex);
        console.log('[BG] Canvas size:', canvas.width, 'x', canvas.height);
    }

    // Check forerunner-bg
    const forerunnerBg = document.querySelector('.forerunner-bg');
    console.log('[BG] Forerunner-bg:', forerunnerBg ? 'FOUND' : 'MISSING');
    if (forerunnerBg) {
        const style = getComputedStyle(forerunnerBg);
        console.log('[BG] Forerunner display:', style.display);
        console.log('[BG] Forerunner visibility:', style.visibility);
        console.log('[BG] Forerunner z-index:', style.zIndex);
    }

    // Check bg-image-layer
    const bgImageLayer = document.getElementById('bg-image-layer');
    console.log('[BG] Bg-image-layer:', bgImageLayer ? 'FOUND' : 'MISSING');
    if (bgImageLayer) {
        const style = getComputedStyle(bgImageLayer);
        console.log('[BG] Image layer display:', style.display);
        console.log('[BG] Image layer background:', style.backgroundImage.substring(0, 50));
    }

    // Check current animation state
    console.log('[BG] Current animation:', this.currentAnimation);
    console.log('[BG] Animation ID:', this.animationId ? 'RUNNING' : 'STOPPED');
    console.log('[BG] Canvas context:', this.ctx ? 'OK' : 'MISSING');

    // Check body theme class
    console.log('[BG] Body classes:', document.body.className);

    // Force restart if not running
    if (!this.animationId && this.currentAnimation !== 'none') {
        console.warn('[BG] Animation not running! Restarting...');
        this.startAnimation();
    }

    console.log('=== END VERIFICATION ===');
};

// Force restart animation command for debugging
window.restartBgAnimation = function() {
    console.log('[BG] Force restarting animation...');
    BgAnimations.stopAnimation();
    BgAnimations.initAnimationData();
    BgAnimations.startAnimation();
    console.log('[BG] Animation restarted');
};
