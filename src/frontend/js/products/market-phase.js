/**
 * MARKET PHASE INDICATOR
 * Détecte les cycles: Bull / Bear / Accumulation
 * Recommandations de leverage selon la phase
 *
 * Logique:
 *   Bull → Bear (fin de pic → short x3/x5/x10)
 *   Bear → Accumulation ou Bull (fin bear → long x3/x5/x10)
 *   Accumulation → Bull (prêt à long)
 *   ATH zone → prudence / short
 */

const MarketPhaseIndicator = {
    // State
    state: {
        phase: 'loading',       // bull | bear | accumulation | loading
        subPhase: '',           // early | mid | late | peak
        confidence: 0,          // 0-100
        btcPrice: 0,
        ath: 108000,            // BTC ATH approx
        athDistance: 0,         // % from ATH
        ma50: 0,
        ma200: 0,
        rsi: 50,
        trend: 'neutral',      // up | down | flat
        leverage: null,         // Recommended leverage action
        lastUpdate: 0,
        history: [],            // price history for calculations
        phaseHistory: [],       // detected phase changes
    },

    // Config
    config: {
        updateInterval: 300000,  // 5 min
        historyDays: 200,        // Need 200 days for MA200
        cacheDuration: 600000,   // 10 min cache
    },

    // ═══════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    async init() {
        console.log('[MarketPhase] Initializing...');
        this.loadState();
        await this.fetchData();
        this.startAutoUpdate();
        console.log('[MarketPhase] Phase:', this.state.phase, '| Confidence:', this.state.confidence + '%');
    },

    loadState() {
        try {
            const saved = localStorage.getItem('obelisk_market_phase');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.lastUpdate && Date.now() - data.lastUpdate < this.config.cacheDuration) {
                    Object.assign(this.state, data);
                }
            }
        } catch (e) { /* ignore */ }
    },

    saveState() {
        try {
            localStorage.setItem('obelisk_market_phase', JSON.stringify(this.state));
        } catch (e) { /* ignore */ }
    },

    startAutoUpdate() {
        setInterval(() => this.fetchData(), this.config.updateInterval);
    },

    // ═══════════════════════════════════════════════════════════════════
    // DATA FETCHING (Binance API)
    // ═══════════════════════════════════════════════════════════════════

    async fetchData() {
        try {
            // Fetch 200 daily candles for BTC
            const endTime = Date.now();
            const startTime = endTime - (this.config.historyDays * 24 * 60 * 60 * 1000);
            const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=200`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Binance API error');

            const data = await response.json();
            this.state.history = data.map(k => ({
                time: k[0],
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5])
            }));

            // Update ATH from data
            const allHighs = this.state.history.map(c => c.high);
            const dataATH = Math.max(...allHighs);
            if (dataATH > this.state.ath) this.state.ath = dataATH;

            // Current price
            this.state.btcPrice = this.state.history[this.state.history.length - 1].close;

            // Calculate indicators
            this.calculateIndicators();
            this.detectPhase();
            this.generateRecommendation();

            this.state.lastUpdate = Date.now();
            this.saveState();

            // Dispatch event for dashboard
            window.dispatchEvent(new CustomEvent('marketPhaseUpdate', { detail: this.state }));

        } catch (error) {
            console.warn('[MarketPhase] Fetch error, using fallback:', error.message);
            this.useFallback();
        }
    },

    useFallback() {
        // Use PriceService if available
        if (typeof PriceService !== 'undefined' && PriceService.priceCache.BTC) {
            this.state.btcPrice = PriceService.priceCache.BTC.price;
            const change = PriceService.priceCache.BTC.change24h || 0;

            // Simple phase detection from change
            if (change > 3) {
                this.state.phase = 'bull';
                this.state.subPhase = 'mid';
            } else if (change < -3) {
                this.state.phase = 'bear';
                this.state.subPhase = 'mid';
            } else {
                this.state.phase = 'accumulation';
                this.state.subPhase = 'mid';
            }
            this.state.confidence = 40; // Low confidence with fallback
            this.state.athDistance = ((this.state.ath - this.state.btcPrice) / this.state.ath) * 100;
            this.generateRecommendation();
            this.state.lastUpdate = Date.now();
            this.saveState();
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // INDICATOR CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════

    calculateIndicators() {
        const closes = this.state.history.map(c => c.close);
        if (closes.length < 50) return;

        // MA50
        this.state.ma50 = this.calcSMA(closes, 50);

        // MA200
        if (closes.length >= 200) {
            this.state.ma200 = this.calcSMA(closes, 200);
        } else {
            // Use available data
            this.state.ma200 = this.calcSMA(closes, closes.length);
        }

        // RSI 14
        this.state.rsi = this.calcRSI(closes, 14);

        // Distance from ATH
        this.state.athDistance = ((this.state.ath - this.state.btcPrice) / this.state.ath) * 100;

        // Trend (MA50 slope over last 10 days)
        const ma50Recent = [];
        for (let i = closes.length - 10; i < closes.length; i++) {
            if (i >= 49) {
                const slice = closes.slice(i - 49, i + 1);
                ma50Recent.push(slice.reduce((a, b) => a + b) / slice.length);
            }
        }
        if (ma50Recent.length >= 2) {
            const slope = (ma50Recent[ma50Recent.length - 1] - ma50Recent[0]) / ma50Recent[0] * 100;
            if (slope > 1) this.state.trend = 'up';
            else if (slope < -1) this.state.trend = 'down';
            else this.state.trend = 'flat';
        }
    },

    calcSMA(data, period) {
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    },

    calcRSI(data, period = 14) {
        if (data.length < period + 1) return 50;

        let gains = 0, losses = 0;
        const recent = data.slice(-(period + 1));

        for (let i = 1; i < recent.length; i++) {
            const diff = recent[i] - recent[i - 1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    },

    // ═══════════════════════════════════════════════════════════════════
    // PHASE DETECTION
    // ═══════════════════════════════════════════════════════════════════

    detectPhase() {
        const { btcPrice, ma50, ma200, rsi, athDistance, trend } = this.state;

        let phase = 'accumulation';
        let subPhase = 'mid';
        let confidence = 50;

        // ── BULL MARKET ──
        // Price > MA50 > MA200, RSI strong, near or at ATH
        if (btcPrice > ma50 && ma50 > ma200) {
            phase = 'bull';
            confidence = 65;

            if (athDistance < 5) {
                subPhase = 'peak';   // Near ATH → danger zone
                confidence = 85;
            } else if (athDistance < 15) {
                subPhase = 'late';   // Getting close to ATH
                confidence = 75;
            } else if (rsi > 60) {
                subPhase = 'mid';
                confidence = 70;
            } else {
                subPhase = 'early';
                confidence = 60;
            }

            // RSI overbought confirmation
            if (rsi > 75) confidence = Math.min(confidence + 10, 95);
        }

        // ── BEAR MARKET ──
        // Price < MA50 < MA200, RSI weak
        else if (btcPrice < ma50 && ma50 < ma200) {
            phase = 'bear';
            confidence = 65;

            if (rsi < 30) {
                subPhase = 'late';    // Oversold → near bottom
                confidence = 80;
            } else if (athDistance > 50) {
                subPhase = 'late';    // Very far from ATH
                confidence = 75;
            } else if (athDistance > 30) {
                subPhase = 'mid';
                confidence = 70;
            } else {
                subPhase = 'early';
                confidence = 60;
            }
        }

        // ── ACCUMULATION ──
        // Price between MAs or MAs crossing, flat trend
        else {
            phase = 'accumulation';

            if (btcPrice > ma200 && trend === 'up') {
                subPhase = 'late';   // Breaking out → bull incoming
                confidence = 70;
            } else if (btcPrice < ma200 && trend === 'flat') {
                subPhase = 'early';  // Just bottomed
                confidence = 60;
            } else {
                subPhase = 'mid';
                confidence = 55;
            }

            // Cross detection (golden/death cross)
            if (Math.abs(ma50 - ma200) / ma200 < 0.02) {
                confidence += 10; // MAs converging = strong signal
            }
        }

        // Track phase changes
        if (phase !== this.state.phase) {
            this.state.phaseHistory.push({
                from: this.state.phase,
                to: phase,
                time: Date.now(),
                price: btcPrice
            });
            // Keep last 20 changes
            if (this.state.phaseHistory.length > 20) {
                this.state.phaseHistory = this.state.phaseHistory.slice(-20);
            }
        }

        this.state.phase = phase;
        this.state.subPhase = subPhase;
        this.state.confidence = Math.round(confidence);
    },

    // ═══════════════════════════════════════════════════════════════════
    // LEVERAGE RECOMMENDATIONS
    // ═══════════════════════════════════════════════════════════════════

    generateRecommendation() {
        const { phase, subPhase, rsi, athDistance, confidence } = this.state;
        let rec = { action: 'wait', direction: 'neutral', leverages: [], warning: '', color: '#888' };

        switch (phase) {
            case 'bull':
                if (subPhase === 'peak') {
                    // ATH → SHORT
                    rec = {
                        action: 'short',
                        direction: 'sell',
                        leverages: [3, 5, 10],
                        warning: 'ATH zone - risque de correction',
                        detail: 'Pic bull confirmé. Short progressif recommandé.',
                        color: '#ff4444'
                    };
                } else if (subPhase === 'late') {
                    // Late bull → prepare to short, reduce longs
                    rec = {
                        action: 'reduce_long',
                        direction: 'caution',
                        leverages: [3, 5],
                        warning: 'Proche ATH - réduire positions long',
                        detail: 'Prendre profits progressivement. Préparer short.',
                        color: '#f59e0b'
                    };
                } else if (subPhase === 'early' || subPhase === 'mid') {
                    // Bull run → LONG
                    rec = {
                        action: 'long',
                        direction: 'buy',
                        leverages: [3, 5, 10],
                        warning: '',
                        detail: 'Tendance haussière. Long avec gestion du risque.',
                        color: '#00ff88'
                    };
                }
                break;

            case 'bear':
                if (subPhase === 'late') {
                    // End of bear → LONG opportunity
                    rec = {
                        action: 'long',
                        direction: 'buy',
                        leverages: [3, 5, 10],
                        warning: 'Fin de bear possible - entrée progressive',
                        detail: 'Zone de capitulation. Accumuler avec DCA + leverage modéré.',
                        color: '#00d4aa'
                    };
                } else if (subPhase === 'early') {
                    // Early bear → SHORT
                    rec = {
                        action: 'short',
                        direction: 'sell',
                        leverages: [3, 5, 10],
                        warning: 'Bear confirmé - ne pas attraper le couteau',
                        detail: 'Début de bear market. Short ou cash.',
                        color: '#ff4444'
                    };
                } else {
                    // Mid bear → short or wait
                    rec = {
                        action: 'short',
                        direction: 'sell',
                        leverages: [3, 5],
                        warning: 'Bear market en cours',
                        detail: 'Rester short ou cash. Pas de FOMO.',
                        color: '#ff6b35'
                    };
                }
                break;

            case 'accumulation':
                if (subPhase === 'late') {
                    // Late acc → LONG setup
                    rec = {
                        action: 'long',
                        direction: 'buy',
                        leverages: [3, 5, 10],
                        warning: 'Breakout imminent - accumulation tardive',
                        detail: 'Fin d\'accumulation. Long progressif, target ATH.',
                        color: '#00ff88'
                    };
                } else {
                    // Early/mid acc → DCA, prepare
                    rec = {
                        action: 'accumulate',
                        direction: 'buy',
                        leverages: [3],
                        warning: 'Phase d\'accumulation - patience',
                        detail: 'Accumuler spot + léger levier. Attendre confirmation.',
                        color: '#00aaff'
                    };
                }
                break;
        }

        // Add RSI-based urgency
        if (rsi > 80) {
            rec.urgency = 'extreme_overbought';
            rec.warning = '⚠️ RSI > 80 - Surachat extrême';
        } else if (rsi < 20) {
            rec.urgency = 'extreme_oversold';
            rec.warning = '🟢 RSI < 20 - Survente extrême → opportunité';
        }

        this.state.leverage = rec;
    },

    // ═══════════════════════════════════════════════════════════════════
    // UI RENDERING
    // ═══════════════════════════════════════════════════════════════════

    getPhaseIcon() {
        switch (this.state.phase) {
            case 'bull': return '🐂';
            case 'bear': return '🐻';
            case 'accumulation': return '📦';
            default: return '⏳';
        }
    },

    getPhaseColor() {
        switch (this.state.phase) {
            case 'bull': return '#00ff88';
            case 'bear': return '#ff4444';
            case 'accumulation': return '#00aaff';
            default: return '#888';
        }
    },

    getPhaseName(lang) {
        const isFr = lang === 'fr' || ((typeof I18n !== 'undefined') && I18n.currentLang === 'fr');
        const names = {
            bull: isFr ? 'Marché Haussier' : 'Bull Market',
            bear: isFr ? 'Marché Baissier' : 'Bear Market',
            accumulation: isFr ? 'Accumulation' : 'Accumulation',
            loading: isFr ? 'Chargement...' : 'Loading...'
        };
        return names[this.state.phase] || this.state.phase;
    },

    getSubPhaseName(lang) {
        const isFr = lang === 'fr' || ((typeof I18n !== 'undefined') && I18n.currentLang === 'fr');
        const names = {
            early: isFr ? 'Début' : 'Early',
            mid: isFr ? 'Milieu' : 'Mid',
            late: isFr ? 'Fin' : 'Late',
            peak: isFr ? 'Pic / ATH' : 'Peak / ATH'
        };
        return names[this.state.subPhase] || this.state.subPhase;
    },

    /**
     * Render compact widget for dashboard
     */
    renderWidget() {
        const { phase, subPhase, confidence, btcPrice, athDistance, ma50, ma200, rsi } = this.state;
        const rec = this.state.leverage || {};
        const phaseColor = this.getPhaseColor();
        const phaseIcon = this.getPhaseIcon();
        const isFr = (typeof I18n !== 'undefined') && I18n.currentLang === 'fr';

        // Phase cycle visual
        const phases = ['bear', 'accumulation', 'bull'];
        const cycleHTML = phases.map(p => {
            const active = p === phase;
            const colors = { bull: '#00ff88', bear: '#ff4444', accumulation: '#00aaff' };
            const icons = { bull: '🐂', bear: '🐻', accumulation: '📦' };
            const labels = {
                bull: isFr ? 'Bull' : 'Bull',
                bear: isFr ? 'Bear' : 'Bear',
                accumulation: isFr ? 'Acc' : 'Acc'
            };
            return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;opacity:${active ? 1 : 0.35};transition:all 0.3s;">
                <div style="width:${active ? 48 : 36}px;height:${active ? 48 : 36}px;border-radius:50%;background:${active ? colors[p] + '22' : 'rgba(255,255,255,0.05)'};border:2px solid ${active ? colors[p] : '#333'};display:flex;align-items:center;justify-content:center;font-size:${active ? '1.4rem' : '1rem'};transition:all 0.3s;${active ? 'box-shadow:0 0 15px ' + colors[p] + '44;' : ''}">${icons[p]}</div>
                <span style="font-size:0.7rem;color:${active ? colors[p] : '#666'};font-weight:${active ? 700 : 400};">${labels[p]}</span>
            </div>`;
        }).join(`<div style="width:20px;height:2px;background:#333;margin-top:20px;"></div>`);

        // Leverage buttons
        const leverageHTML = (rec.leverages || []).map(lev => {
            const levColor = lev <= 3 ? '#00ff88' : lev <= 5 ? '#f59e0b' : '#ff4444';
            const dirIcon = rec.direction === 'buy' ? '📈' : rec.direction === 'sell' ? '📉' : '⏸️';
            return `<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:${levColor}15;border:1px solid ${levColor}44;border-radius:8px;">
                <span style="font-size:0.85rem;">${dirIcon}</span>
                <span style="color:${levColor};font-weight:700;font-size:0.9rem;">x${lev}</span>
            </div>`;
        }).join('');

        // Action label
        const actionLabels = {
            long: { label: isFr ? '🟢 LONG' : '🟢 LONG', bg: 'rgba(0,255,136,0.15)', border: '#00ff88' },
            short: { label: isFr ? '🔴 SHORT' : '🔴 SHORT', bg: 'rgba(255,68,68,0.15)', border: '#ff4444' },
            reduce_long: { label: isFr ? '🟡 RÉDUIRE LONG' : '🟡 REDUCE LONG', bg: 'rgba(245,158,11,0.15)', border: '#f59e0b' },
            accumulate: { label: isFr ? '🔵 ACCUMULER' : '🔵 ACCUMULATE', bg: 'rgba(0,170,255,0.15)', border: '#00aaff' },
            wait: { label: isFr ? '⏸️ ATTENDRE' : '⏸️ WAIT', bg: 'rgba(136,136,136,0.15)', border: '#888' }
        };
        const actionStyle = actionLabels[rec.action] || actionLabels.wait;

        // MA cross indicator
        const maCrossLabel = ma50 > ma200
            ? (isFr ? '🟢 Golden Cross (MA50 > MA200)' : '🟢 Golden Cross (MA50 > MA200)')
            : (isFr ? '🔴 Death Cross (MA50 < MA200)' : '🔴 Death Cross (MA50 < MA200)');

        return `
        <div style="background:linear-gradient(145deg,#0f0f1e,#1a1a2e);border:1px solid ${phaseColor}44;border-radius:16px;padding:20px;position:relative;overflow:hidden;">
            <!-- Glow effect -->
            <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:radial-gradient(circle,${phaseColor}15,transparent);pointer-events:none;"></div>

            <!-- Header -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.5rem;">${phaseIcon}</span>
                    <div>
                        <h3 style="margin:0;color:#fff;font-size:1rem;">${isFr ? 'Phase de Marché' : 'Market Phase'}</h3>
                        <div style="color:${phaseColor};font-size:0.85rem;font-weight:600;">${this.getPhaseName()} — ${this.getSubPhaseName()}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="color:#888;font-size:0.7rem;">${isFr ? 'Confiance' : 'Confidence'}</div>
                    <div style="color:${phaseColor};font-size:1.1rem;font-weight:700;">${confidence}%</div>
                </div>
            </div>

            <!-- Phase Cycle -->
            <div style="display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:18px;padding:10px 0;">
                ${cycleHTML}
            </div>

            <!-- BTC Price + ATH distance -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
                <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px;text-align:center;">
                    <div style="color:#888;font-size:0.7rem;">BTC</div>
                    <div style="color:#f7931a;font-size:1rem;font-weight:700;">$${btcPrice ? btcPrice.toLocaleString('en-US', {maximumFractionDigits: 0}) : '--'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px;text-align:center;">
                    <div style="color:#888;font-size:0.7rem;">${isFr ? 'Distance ATH' : 'ATH Distance'}</div>
                    <div style="color:${athDistance < 10 ? '#ff4444' : athDistance < 30 ? '#f59e0b' : '#00ff88'};font-size:1rem;font-weight:700;">-${athDistance.toFixed(1)}%</div>
                </div>
                <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px;text-align:center;">
                    <div style="color:#888;font-size:0.7rem;">RSI</div>
                    <div style="color:${rsi > 70 ? '#ff4444' : rsi < 30 ? '#00ff88' : '#fff'};font-size:1rem;font-weight:700;">${rsi.toFixed(0)}</div>
                </div>
            </div>

            <!-- MA Cross -->
            <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:8px 12px;margin-bottom:14px;font-size:0.75rem;color:#aaa;display:flex;justify-content:space-between;">
                <span>${maCrossLabel}</span>
                <span style="color:#888;">MA50: $${ma50 ? ma50.toLocaleString('en-US', {maximumFractionDigits: 0}) : '--'} | MA200: $${ma200 ? ma200.toLocaleString('en-US', {maximumFractionDigits: 0}) : '--'}</span>
            </div>

            <!-- Recommendation -->
            <div style="background:${actionStyle.bg};border:1px solid ${actionStyle.border};border-radius:12px;padding:14px;margin-bottom:10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <span style="color:${actionStyle.border};font-weight:700;font-size:1rem;">${actionStyle.label}</span>
                    <div style="display:flex;gap:6px;">${leverageHTML}</div>
                </div>
                <p style="color:#ccc;font-size:0.8rem;margin:0;line-height:1.4;">${rec.detail || ''}</p>
                ${rec.warning ? `<p style="color:#f59e0b;font-size:0.75rem;margin:6px 0 0;opacity:0.9;">⚠️ ${rec.warning}</p>` : ''}
            </div>

            <!-- Cycle flow explanation -->
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:0.65rem;color:#555;flex-wrap:wrap;">
                <span>🐂 Bull</span><span>→</span><span>🐻 Bear</span><span>→</span><span>📦 Acc</span><span style="color:#444;">|</span><span>🐂 Bull</span>
                <span style="color:#444;margin-left:8px;">|</span>
                <span style="color:#555;">${isFr ? 'Fin bear/acc → Long' : 'End bear/acc → Long'}</span>
                <span style="color:#444;">|</span>
                <span style="color:#555;">${isFr ? 'Pic bull → Short' : 'Bull peak → Short'}</span>
            </div>
        </div>`;
    },

    /**
     * Render minimal badge for header/nav
     */
    renderBadge() {
        const { phase, subPhase, confidence } = this.state;
        const color = this.getPhaseColor();
        const icon = this.getPhaseIcon();
        const rec = this.state.leverage || {};

        const dirArrow = rec.direction === 'buy' ? '↑' : rec.direction === 'sell' ? '↓' : '→';
        const leverageText = (rec.leverages || []).map(l => `x${l}`).join('/');

        return `<div onclick="MarketPhaseIndicator.showFullPanel()" style="cursor:pointer;display:flex;align-items:center;gap:6px;padding:4px 10px;background:${color}15;border:1px solid ${color}44;border-radius:20px;font-size:0.75rem;" title="Market Phase: ${phase} ${subPhase} (${confidence}%)">
            <span>${icon}</span>
            <span style="color:${color};font-weight:600;">${phase.toUpperCase()}</span>
            <span style="color:#888;">${dirArrow}</span>
            ${leverageText ? `<span style="color:${rec.color || '#888'};font-size:0.7rem;">${leverageText}</span>` : ''}
        </div>`;
    },

    showFullPanel() {
        // Create overlay with full widget
        let overlay = document.getElementById('market-phase-overlay');
        if (overlay) {
            overlay.remove();
            return;
        }

        overlay = document.createElement('div');
        overlay.id = 'market-phase-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        const panel = document.createElement('div');
        panel.style.cssText = 'max-width:500px;width:100%;max-height:90vh;overflow-y:auto;';
        panel.innerHTML = this.renderWidget();

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MarketPhaseIndicator.init());
} else {
    MarketPhaseIndicator.init();
}
