/**
 * Obelisk DEX - Background Animation System
 * Supports: Matrix, Halo Forerunners, Avatar Bioluminescent, Particles
 */

const BgAnimations = {
    canvas: null,
    ctx: null,
    previewCanvas: null,
    previewCtx: null,
    animationId: null,
    previewAnimationId: null,
    currentAnimation: 'avatar',
    speed: 1,

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

    init() {
        this.canvas = document.getElementById('bg-animation-canvas');
        this.previewCanvas = document.getElementById('preview-canvas');

        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        if (this.previewCanvas) {
            this.previewCtx = this.previewCanvas.getContext('2d');
            this.resizePreviewCanvas();
        }

        // Load saved settings
        this.loadSettings();

        // Setup UI event listeners
        this.setupEventListeners();

        // Start animation
        this.startAnimation();
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
    // Forerunner glyphs/symbols
    forerunnerGlyphs: ['⬡', '◇', '△', '▽', '○', '◎', '⊡', '⊕', '⊗', '⋈', '⌬', '⎔'],

    initHalo() {
        this.haloGrid = [];
        this.haloEnergy = [];
        this.haloGlyphs = [];
        this.haloScanlines = [];
        this.haloPulses = [];

        const hexSize = 60;
        const hexHeight = hexSize * Math.sqrt(3);
        const cols = Math.ceil(this.canvas.width / (hexSize * 1.5)) + 2;
        const rows = Math.ceil(this.canvas.height / hexHeight) + 2;

        // Create hexagonal grid
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * hexSize * 1.5;
                const y = row * hexHeight + (col % 2) * (hexHeight / 2);
                this.haloGrid.push({
                    x, y,
                    size: hexSize,
                    active: Math.random() > 0.7,
                    pulseOffset: Math.random() * Math.PI * 2,
                    glowIntensity: Math.random()
                });
            }
        }

        // Create energy lines that travel along grid
        for (let i = 0; i < 15; i++) {
            this.haloEnergy.push({
                startX: Math.random() * this.canvas.width,
                startY: Math.random() * this.canvas.height,
                angle: Math.random() * Math.PI * 2,
                length: 100 + Math.random() * 200,
                speed: 2 + Math.random() * 3,
                progress: Math.random(),
                width: 1 + Math.random() * 2
            });
        }

        // Create floating glyphs
        for (let i = 0; i < 12; i++) {
            this.haloGlyphs.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                glyph: this.forerunnerGlyphs[Math.floor(Math.random() * this.forerunnerGlyphs.length)],
                size: 20 + Math.random() * 40,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                alpha: 0,
                targetAlpha: 0.3 + Math.random() * 0.4,
                fadeSpeed: 0.005 + Math.random() * 0.01,
                fadeIn: true
            });
        }

        // Create scan lines
        for (let i = 0; i < 3; i++) {
            this.haloScanlines.push({
                y: Math.random() * this.canvas.height,
                speed: 0.5 + Math.random() * 1,
                width: 2 + Math.random() * 4,
                alpha: 0.3 + Math.random() * 0.3
            });
        }

        // Create expanding pulses
        for (let i = 0; i < 5; i++) {
            this.haloPulses.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 0,
                maxRadius: 150 + Math.random() * 200,
                speed: 1 + Math.random() * 2,
                alpha: 0.5
            });
        }
    },

    drawHalo(ctx, width, height) {
        // Dark fade with slight blue tint
        ctx.fillStyle = 'rgba(0, 5, 15, 0.08)';
        ctx.fillRect(0, 0, width, height);

        const colorScheme = this.colors.halo[this.haloColor] || this.colors.halo.blue;
        const time = Date.now() / 1000;

        // Draw hexagonal grid (subtle background)
        for (const hex of this.haloGrid) {
            if (!hex.active) continue;

            const pulse = Math.sin(time * 1.5 + hex.pulseOffset) * 0.5 + 0.5;
            const alpha = 0.03 + pulse * 0.05 * hex.glowIntensity;

            ctx.strokeStyle = colorScheme.primary;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = alpha;
            this.drawHexagon(ctx, hex.x, hex.y, hex.size * 0.9);
        }

        // Draw expanding pulses
        for (const pulse of this.haloPulses) {
            pulse.radius += pulse.speed * this.speed;

            if (pulse.radius > pulse.maxRadius) {
                pulse.radius = 0;
                pulse.x = Math.random() * width;
                pulse.y = Math.random() * height;
                pulse.maxRadius = 150 + Math.random() * 200;
            }

            const alpha = (1 - pulse.radius / pulse.maxRadius) * 0.3;
            ctx.strokeStyle = colorScheme.primary;
            ctx.lineWidth = 2;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 15;
            ctx.shadowColor = colorScheme.primary;

            // Draw expanding hexagon
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                const px = pulse.x + pulse.radius * Math.cos(angle);
                const py = pulse.y + pulse.radius * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Draw scan lines
        ctx.shadowBlur = 0;
        for (const scan of this.haloScanlines) {
            scan.y += scan.speed * this.speed;
            if (scan.y > height) scan.y = -10;

            const gradient = ctx.createLinearGradient(0, scan.y - 20, 0, scan.y + 20);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, colorScheme.primary.replace(')', `, ${scan.alpha})`).replace('rgb', 'rgba'));
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.globalAlpha = 1;
            ctx.fillRect(0, scan.y - scan.width, width, scan.width * 2);
        }

        // Draw energy lines
        for (const energy of this.haloEnergy) {
            energy.progress += 0.01 * this.speed;
            if (energy.progress > 1) {
                energy.progress = 0;
                energy.startX = Math.random() * width;
                energy.startY = Math.random() * height;
                energy.angle = Math.random() * Math.PI * 2;
            }

            const x1 = energy.startX;
            const y1 = energy.startY;
            const currentLength = energy.length * energy.progress;
            const x2 = x1 + Math.cos(energy.angle) * currentLength;
            const y2 = y1 + Math.sin(energy.angle) * currentLength;

            // Create gradient along line
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.3, colorScheme.primary);
            gradient.addColorStop(0.7, colorScheme.primary);
            gradient.addColorStop(1, 'transparent');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = energy.width;
            ctx.globalAlpha = 0.6;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colorScheme.primary;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Draw energy node at tip
            ctx.fillStyle = colorScheme.primary;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(x2, y2, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw floating glyphs
        ctx.shadowBlur = 20;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const glyph of this.haloGlyphs) {
            // Fade in/out
            if (glyph.fadeIn) {
                glyph.alpha += glyph.fadeSpeed * this.speed;
                if (glyph.alpha >= glyph.targetAlpha) {
                    glyph.fadeIn = false;
                }
            } else {
                glyph.alpha -= glyph.fadeSpeed * this.speed * 0.5;
                if (glyph.alpha <= 0) {
                    glyph.alpha = 0;
                    glyph.fadeIn = true;
                    glyph.x = Math.random() * width;
                    glyph.y = Math.random() * height;
                    glyph.glyph = this.forerunnerGlyphs[Math.floor(Math.random() * this.forerunnerGlyphs.length)];
                }
            }

            glyph.rotation += glyph.rotationSpeed * this.speed;

            ctx.save();
            ctx.translate(glyph.x, glyph.y);
            ctx.rotate(glyph.rotation);

            ctx.font = `${glyph.size}px Arial`;
            ctx.fillStyle = colorScheme.primary;
            ctx.shadowColor = colorScheme.primary;
            ctx.globalAlpha = glyph.alpha;
            ctx.fillText(glyph.glyph, 0, 0);

            // Draw circle around glyph
            ctx.strokeStyle = colorScheme.primary;
            ctx.lineWidth = 1;
            ctx.globalAlpha = glyph.alpha * 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, glyph.size * 0.8, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        // Draw central Forerunner structure (large hexagon with details)
        const centerX = width / 2;
        const centerY = height / 2;
        const mainPulse = Math.sin(time) * 0.2 + 0.8;

        ctx.globalAlpha = 0.1 * mainPulse;
        ctx.strokeStyle = colorScheme.primary;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 30;
        ctx.shadowColor = colorScheme.primary;

        // Large outer hexagon
        this.drawHexagon(ctx, centerX, centerY, Math.min(width, height) * 0.4);

        // Inner geometric patterns
        ctx.globalAlpha = 0.05 * mainPulse;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + Math.cos(angle) * Math.min(width, height) * 0.2;
            const y = centerY + Math.sin(angle) * Math.min(width, height) * 0.2;
            this.drawHexagon(ctx, x, y, 40);
        }

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

        const count = Math.floor((this.canvas.width * this.canvas.height) / 4000);

        // Stars
        for (let i = 0; i < count; i++) {
            const starType = Math.random();
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: starType > 0.95 ? 2 + Math.random() * 2 : 0.5 + Math.random() * 1.5,
                alpha: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.5 + Math.random() * 2,
                twinkleOffset: Math.random() * Math.PI * 2,
                color: starType > 0.9 ? this.getStarColor() : '#ffffff',
                isBright: starType > 0.95
            });
        }

        // Nebula clouds
        for (let i = 0; i < 4; i++) {
            this.nebulaClouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radiusX: 150 + Math.random() * 200,
                radiusY: 100 + Math.random() * 150,
                rotation: Math.random() * Math.PI,
                hue: Math.random() > 0.5 ? 260 + Math.random() * 40 : 180 + Math.random() * 40,
                alpha: 0.03 + Math.random() * 0.04
            });
        }

        // Initialize shooting stars
        for (let i = 0; i < 3; i++) {
            this.shootingStars.push(this.createShootingStar());
        }

        // Create constellations
        this.createConstellations();
    },

    getStarColor() {
        const colors = ['#ffffff', '#ffe4c4', '#b0c4ff', '#ffd700', '#ff6b6b'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    createShootingStar() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height * 0.5,
            vx: 5 + Math.random() * 10,
            vy: 2 + Math.random() * 5,
            length: 50 + Math.random() * 100,
            alpha: 0,
            maxAlpha: 0.6 + Math.random() * 0.4,
            active: false,
            timer: Math.random() * 500
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
        ctx.fillStyle = 'rgba(5, 2, 15, 0.04)';
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() / 1000;

        // Draw nebula clouds
        for (const nebula of this.nebulaClouds) {
            ctx.save();
            ctx.translate(nebula.x, nebula.y);
            ctx.rotate(nebula.rotation + time * 0.01);

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radiusX);
            gradient.addColorStop(0, `hsla(${nebula.hue}, 70%, 50%, ${nebula.alpha})`);
            gradient.addColorStop(0.5, `hsla(${nebula.hue + 20}, 60%, 40%, ${nebula.alpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(0, 0, nebula.radiusX, nebula.radiusY, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
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

            // Draw constellation stars
            for (const point of constellation.points) {
                ctx.fillStyle = `rgba(200, 220, 255, ${pulse * 3})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw stars
        for (const p of this.particles) {
            const twinkle = Math.sin(time * p.twinkleSpeed + p.twinkleOffset) * 0.5 + 0.5;
            const alpha = p.alpha * (0.5 + twinkle * 0.5);
            const size = p.size * (0.8 + twinkle * 0.2);

            if (p.isBright) {
                // Bright star with glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
                gradient.addColorStop(0, p.color);
                gradient.addColorStop(0.2, `rgba(255, 255, 255, ${alpha * 0.5})`);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
                ctx.fill();

                // Draw cross sparkle
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
                ctx.lineWidth = 1;
                const rayLength = size * 6 * twinkle;
                ctx.beginPath();
                ctx.moveTo(p.x - rayLength, p.y);
                ctx.lineTo(p.x + rayLength, p.y);
                ctx.moveTo(p.x, p.y - rayLength);
                ctx.lineTo(p.x, p.y + rayLength);
                // Diagonal rays
                ctx.moveTo(p.x - rayLength * 0.5, p.y - rayLength * 0.5);
                ctx.lineTo(p.x + rayLength * 0.5, p.y + rayLength * 0.5);
                ctx.moveTo(p.x + rayLength * 0.5, p.y - rayLength * 0.5);
                ctx.lineTo(p.x - rayLength * 0.5, p.y + rayLength * 0.5);
                ctx.stroke();

                ctx.shadowBlur = 0;
            } else {
                // Regular star
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw shooting stars
        for (const star of this.shootingStars) {
            if (!star.active) {
                star.timer -= this.speed;
                if (star.timer <= 0) {
                    star.active = true;
                    star.x = Math.random() * width * 0.5;
                    star.y = Math.random() * height * 0.3;
                    star.alpha = star.maxAlpha;
                }
                continue;
            }

            star.x += star.vx * this.speed;
            star.y += star.vy * this.speed;
            star.alpha -= 0.01 * this.speed;

            if (star.alpha <= 0 || star.x > width || star.y > height) {
                Object.assign(star, this.createShootingStar());
                continue;
            }

            // Draw shooting star trail
            const gradient = ctx.createLinearGradient(
                star.x, star.y,
                star.x - star.vx * star.length / star.vx,
                star.y - star.vy * star.length / star.vx
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.alpha})`);
            gradient.addColorStop(0.3, `rgba(200, 220, 255, ${star.alpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
                star.x - star.vx * star.length / 10,
                star.y - star.vy * star.length / 10
            );
            ctx.stroke();

            // Bright head
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
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

        const animate = () => {
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
                }
            }

            // Also draw to preview if visible
            if (this.previewCtx && this.previewCanvas) {
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
                    case 'none':
                        this.previewCtx.fillStyle = '#020208';
                        this.previewCtx.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
                        break;
                }
            }

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
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

        // Show/hide color options
        const matrixOptions = document.getElementById('matrix-options');
        const haloOptions = document.getElementById('halo-options');

        if (matrixOptions) matrixOptions.style.display = type === 'matrix' ? 'block' : 'none';
        if (haloOptions) haloOptions.style.display = type === 'halo' ? 'block' : 'none';
    },

    // ==================== SETTINGS MANAGEMENT ====================
    setupEventListeners() {
        // Animation type selection
        document.querySelectorAll('.animation-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.animation-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.setAnimation(option.dataset.animation);
            });
        });

        // Matrix color selection
        document.querySelectorAll('#matrix-options .color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#matrix-options .color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.matrixColor = btn.dataset.color;
            });
        });

        // Halo color selection
        document.querySelectorAll('#halo-options .color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#halo-options .color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.haloColor = btn.dataset.color;
            });
        });

        // Background presets
        document.querySelectorAll('.bg-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                this.setBackgroundPreset(preset.dataset.bg);
            });
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
});

// Export for external access
window.BgAnimations = BgAnimations;
