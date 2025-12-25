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
    initHalo() {
        this.haloHexagons = [];
        this.haloLines = [];

        const hexCount = Math.floor((this.canvas.width * this.canvas.height) / 50000);

        for (let i = 0; i < hexCount; i++) {
            this.haloHexagons.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 20 + Math.random() * 40,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                alpha: 0.1 + Math.random() * 0.3,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }

        // Create connecting lines
        for (let i = 0; i < hexCount * 2; i++) {
            const startHex = this.haloHexagons[Math.floor(Math.random() * hexCount)];
            const endHex = this.haloHexagons[Math.floor(Math.random() * hexCount)];
            if (startHex && endHex) {
                this.haloLines.push({
                    start: startHex,
                    end: endHex,
                    progress: 0,
                    speed: 0.005 + Math.random() * 0.01,
                    active: Math.random() > 0.5
                });
            }
        }
    },

    drawHalo(ctx, width, height) {
        ctx.fillStyle = 'rgba(0, 10, 20, 0.1)';
        ctx.fillRect(0, 0, width, height);

        const colorScheme = this.colors.halo[this.haloColor] || this.colors.halo.blue;
        const time = Date.now() / 1000;

        // Draw connecting lines
        ctx.strokeStyle = colorScheme.glow;
        ctx.lineWidth = 1;

        for (const line of this.haloLines) {
            if (!line.active) continue;

            line.progress += line.speed * this.speed;
            if (line.progress > 1) {
                line.progress = 0;
                line.active = Math.random() > 0.3;
            }

            const startX = line.start.x;
            const startY = line.start.y;
            const endX = startX + (line.end.x - startX) * line.progress;
            const endY = startY + (line.end.y - startY) * line.progress;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Draw hexagons
        for (const hex of this.haloHexagons) {
            hex.rotation += hex.rotationSpeed * this.speed;
            const pulse = Math.sin(time * 2 + hex.pulseOffset) * 0.3 + 0.7;

            ctx.save();
            ctx.translate(hex.x, hex.y);
            ctx.rotate(hex.rotation);

            // Outer glow
            ctx.strokeStyle = colorScheme.primary;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 20;
            ctx.shadowColor = colorScheme.primary;
            ctx.globalAlpha = hex.alpha * pulse;

            this.drawHexagon(ctx, 0, 0, hex.size);

            // Inner hexagon
            ctx.strokeStyle = colorScheme.secondary;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = hex.alpha * pulse * 0.5;

            this.drawHexagon(ctx, 0, 0, hex.size * 0.6);

            ctx.restore();
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
        const count = Math.floor((this.canvas.width * this.canvas.height) / 8000);

        for (let i = 0; i < count; i++) {
            this.avatarParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 2 + Math.random() * 4,
                hue: 180 + Math.random() * 60, // Cyan to purple range
                pulseOffset: Math.random() * Math.PI * 2,
                pulseSpeed: 0.5 + Math.random() * 1
            });
        }
    },

    drawAvatar(ctx, width, height) {
        ctx.fillStyle = 'rgba(2, 2, 8, 0.1)';
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() / 1000;
        const connectionDistance = 150;

        // Update and draw particles
        for (const p of this.avatarParticles) {
            // Update position
            p.x += p.vx * this.speed;
            p.y += p.vy * this.speed;

            // Wrap around edges
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Calculate pulse
            const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.5 + 0.5;
            const size = p.size * (0.5 + pulse * 0.5);

            // Draw glow
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 5);
            gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${0.8 * pulse})`);
            gradient.addColorStop(0.5, `hsla(${p.hue}, 100%, 50%, ${0.3 * pulse})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw core
            ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${pulse})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw connections
        ctx.lineWidth = 1;
        for (let i = 0; i < this.avatarParticles.length; i++) {
            for (let j = i + 1; j < this.avatarParticles.length; j++) {
                const p1 = this.avatarParticles[i];
                const p2 = this.avatarParticles[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.3;
                    const hue = (p1.hue + p2.hue) / 2;
                    ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    },

    // ==================== PARTICLES ANIMATION ====================
    initParticles() {
        this.particles = [];
        const count = Math.floor((this.canvas.width * this.canvas.height) / 5000);

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                size: 1 + Math.random() * 3,
                alpha: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 1 + Math.random() * 2,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    },

    drawParticles(ctx, width, height) {
        ctx.fillStyle = 'rgba(10, 0, 21, 0.05)';
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() / 1000;

        for (const p of this.particles) {
            // Update position
            p.x += p.vx * this.speed * 0.5;
            p.y += p.vy * this.speed * 0.5;

            // Wrap around
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Twinkle effect
            const twinkle = Math.sin(time * p.twinkleSpeed + p.twinkleOffset) * 0.5 + 0.5;
            const alpha = p.alpha * twinkle;

            // Draw star
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * twinkle, 0, Math.PI * 2);
            ctx.fill();

            // Draw cross rays for larger stars
            if (p.size > 2) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                ctx.lineWidth = 0.5;
                const rayLength = p.size * 3 * twinkle;
                ctx.beginPath();
                ctx.moveTo(p.x - rayLength, p.y);
                ctx.lineTo(p.x + rayLength, p.y);
                ctx.moveTo(p.x, p.y - rayLength);
                ctx.lineTo(p.x, p.y + rayLength);
                ctx.stroke();
            }
        }

        ctx.shadowBlur = 0;
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
