/**
 * Obelisk Dashboard - Enhanced Home tab
 * Portfolio sparkline, animated counters, allocation donut, activity feed, market movers
 */
const ObeliskDashboard = (function() {
    'use strict';

    // t() with fallback: returns human-readable fallback when translation equals the key
    const t = (key, fallback) => {
        if (typeof I18n === 'undefined' || !I18n.t) return fallback !== undefined ? fallback : key;
        const result = I18n.t(key);
        return (result && result !== key) ? result : (fallback !== undefined ? fallback : key);
    };

    // Portfolio history snapshots (localStorage)
    const SNAPSHOT_KEY = 'obelisk_portfolio_snapshots';

    function getSnapshots() {
        try {
            return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '[]');
        } catch { return []; }
    }

    function saveSnapshot(value) {
        const snaps = getSnapshots();
        snaps.push({ t: Date.now(), v: value });
        // Keep max 720 entries (~30 days at 1/hour)
        if (snaps.length > 720) snaps.splice(0, snaps.length - 720);
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snaps));
    }

    // Animated counter (NaN-safe)
    function animateValue(el, start, end, duration) {
        if (!el) return;
        // Ensure values are finite numbers
        const safeStart = Number.isFinite(start) ? start : 0;
        const safeEnd = Number.isFinite(end) ? end : 0;
        const startTime = performance.now();
        const prefix = safeEnd < 0 ? '-$' : '$';
        const abs = Math.abs;

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = safeStart + (safeEnd - safeStart) * eased;
            const displayVal = Number.isFinite(current) ? current : 0;
            el.textContent = prefix + abs(displayVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // Mini sparkline canvas
    function drawSparkline(canvas, data, color) {
        if (!canvas || !data.length) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
        const h = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        const dw = canvas.offsetWidth;
        const dh = canvas.offsetHeight;

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        ctx.clearRect(0, 0, dw, dh);

        // Gradient fill
        const grad = ctx.createLinearGradient(0, 0, 0, dh);
        grad.addColorStop(0, color + '33');
        grad.addColorStop(1, color + '00');

        ctx.beginPath();
        ctx.moveTo(0, dh);
        data.forEach((v, i) => {
            const x = (i / (data.length - 1)) * dw;
            const y = dh - ((v - min) / range) * (dh * 0.8) - dh * 0.1;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        // Close fill path
        ctx.lineTo(dw, dh);
        ctx.lineTo(0, dh);
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        data.forEach((v, i) => {
            const x = (i / (data.length - 1)) * dw;
            const y = dh - ((v - min) / range) * (dh * 0.8) - dh * 0.1;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    // Donut chart for allocation
    function drawDonut(canvas, segments) {
        if (!canvas || !segments.length) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = canvas.offsetWidth;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const cx = size / 2, cy = size / 2;
        const outerR = size / 2 - 4;
        const innerR = outerR * 0.6;
        const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

        let angle = -Math.PI / 2;
        segments.forEach(seg => {
            const slice = (seg.value / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(cx, cy, outerR, angle, angle + slice);
            ctx.arc(cx, cy, innerR, angle + slice, angle, true);
            ctx.closePath();
            ctx.fillStyle = seg.color;
            ctx.fill();
            angle += slice;
        });

        // Center text
        ctx.fillStyle = '#e8e4d9';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(segments.length + ' actifs', cx, cy);
    }

    function getPortfolioData() {
        const portfolio = window.SimulatedPortfolio || null;

        // Ultra-safe number helper - prevents any NaN leakage
        const safe = (val, def = 0) => {
            if (val === null || val === undefined || val === '' || typeof val === 'string' && val.toLowerCase() === 'nan') return def;
            const num = parseFloat(val);
            if (!Number.isFinite(num) || Number.isNaN(num)) return def;
            return num;
        };

        // Default demo values with validation
        let totalValue = 10000;
        let pnl24h = 234.56;

        if (portfolio && typeof portfolio.getTotalValue === 'function') {
            try {
                const result = portfolio.getTotalValue();
                if (result && typeof result === 'object') {
                    totalValue = safe(result.total, 10000);
                } else {
                    totalValue = safe(result, 10000);
                }
            } catch (e) {
                console.warn('[Dashboard] getTotalValue error:', e);
                totalValue = 10000;
            }
        }

        if (portfolio && typeof portfolio.getPnL24h === 'function') {
            try {
                const rawPnl = portfolio.getPnL24h();
                pnl24h = safe(rawPnl, 234.56);
            } catch (e) {
                console.warn('[Dashboard] getPnL24h error:', e);
                pnl24h = 234.56;
            }
        }

        const positions = portfolio?.portfolio?.investments?.length || 0;

        let favs = [];
        try {
            favs = JSON.parse(localStorage.getItem('obelisk_favorites') || '[]');
            if (!Array.isArray(favs)) favs = [];
        } catch {
            favs = [];
        }

        // Final validation before return
        const finalTotal = safe(totalValue, 10000);
        const finalPnl = safe(pnl24h, 234.56);

        return {
            totalValue: finalTotal,
            pnl24h: finalPnl,
            positions: Math.max(0, parseInt(positions) || 0),
            favs
        };
    }

    function getMarketMovers() {
        if (typeof PriceService !== 'undefined' && PriceService.getTopMovers) {
            return PriceService.getTopMovers();
        }
        // Fallback from ObeliskApp state
        const prices = (typeof ObeliskApp !== 'undefined') ? ObeliskApp.state.prices : {};
        return Object.entries(prices).slice(0, 5).map(([symbol, price]) => ({
            symbol,
            price: typeof price === 'object' ? price.price : price,
            change24h: typeof price === 'object' ? (price.change24h || 0) : ((Math.random() - 0.5) * 10)
        }));
    }

    function render() {
        const el = document.getElementById('tab-dashboard');
        if (!el) return;

        const { totalValue, pnl24h, positions, favs } = getPortfolioData();

        // Ultra-safe number handling with NaN prevention
        const safeNum = (v, d = 0) => {
            if (v === null || v === undefined || v === '' || typeof v === 'string' && v.toLowerCase() === 'nan') return d;
            const n = parseFloat(v);
            if (!Number.isFinite(n) || Number.isNaN(n)) return d;
            return n;
        };

        const safeTotal = safeNum(totalValue, 10000);
        const safePnl = safeNum(pnl24h, 234.56);

        // Calculate base value safely (guard against 0/0 = NaN)
        const base = safeTotal > Math.abs(safePnl) ? safeTotal - safePnl : safeTotal;
        const pnlPercentRaw = (base > 0 && Number.isFinite(safePnl / base)) ? (safePnl / base) * 100 : 0;
        const pnlPercent = safeNum(pnlPercentRaw, 0).toFixed(2);

        const pnlColor = safePnl >= 0 ? '#00ff88' : '#ff4444';
        const pnlSign = safePnl >= 0 ? '+' : '';

        // Save snapshot periodically
        const lastSnap = getSnapshots();
        if (!lastSnap.length || Date.now() - lastSnap[lastSnap.length - 1].t > 3600000) {
            saveSnapshot(safeTotal);
        }

        const movers = getMarketMovers();

        // Use translations directly
        // Ultra-safe formatting helpers - NEVER output NaN
        const fmtCurrency = (v) => {
            if (v === null || v === undefined || v === '' || typeof v === 'string' && v.toLowerCase() === 'nan') v = 0;
            const n = parseFloat(v);
            const safeN = (Number.isFinite(n) && !Number.isNaN(n)) ? n : 0;
            return '$' + Math.abs(safeN).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
        };
        const fmtPct = (v) => {
            if (v === null || v === undefined || v === '' || typeof v === 'string' && v.toLowerCase() === 'nan') v = 0;
            const n = parseFloat(v);
            const safeN = (Number.isFinite(n) && !Number.isNaN(n)) ? n : 0;
            return safeN.toFixed(2);
        };

        const labels = {
            totalValue: t('dash_total_value', 'Portfolio Value'),
            activePositions: t('dash_active_positions', 'Active Positions'),
            watchlist: t('dash_watchlist', 'Watchlist'),
            pairs: t('dash_pairs', 'pairs'),
            pnl24h: t('dash_pnl_24h', 'PnL 24h'),
            allocation: t('dash_allocation', 'Allocation'),
            marketMovers: t('dash_market_movers', 'Market Movers'),
            quickActions: t('dash_quick_actions', 'Quick Actions'),
            recentActivity: t('dash_recent_activity', 'Recent Activity'),
            noActivity: t('dash_no_activity', 'No recent activity'),
            trade: t('trade', 'Trade'),
            swap: t('swap', 'Swap'),
            portfolio: t('portfolio', 'Portfolio'),
            invest: t('invest', 'Invest'),
            wallet: t('wallet', 'Wallet'),
            combos: t('combos', 'Combos')
        };

        el.innerHTML = `
            <div class="dashboard-container">
                <!-- Portfolio Hero -->
                <div class="dash-hero glass-card">
                    <div class="dash-hero-left">
                        <div class="dash-card-label">${labels.totalValue} <span style="font-size:10px;color:#f59e0b;">(${t('simulated') || 'simulé'})</span></div>
                        <div class="dash-hero-value" id="dash-total-value">${fmtCurrency(safeTotal)}</div>
                        <div class="dash-hero-pnl" style="color:${pnlColor}">
                            ${pnlSign}$${fmtPct(Math.abs(safePnl))} (${pnlSign}${fmtPct(pnlPercent)}%) <span style="color:var(--text-muted);font-size:12px">24h</span>
                        </div>
                    </div>
                    <div class="dash-hero-right">
                        <canvas id="dash-sparkline" style="width:180px;height:60px;"></canvas>
                    </div>
                </div>

                <!-- Stats Row -->
                <div class="dashboard-cards">
                    <div class="dash-card glass-card fade-slide-up" style="--stagger:0">
                        <div class="dash-card-icon">📊</div>
                        <div>
                            <div class="dash-card-label">${labels.activePositions}</div>
                            <div class="dash-card-value">${positions}</div>
                        </div>
                    </div>
                    <div class="dash-card glass-card fade-slide-up" style="--stagger:1">
                        <div class="dash-card-icon">⭐</div>
                        <div>
                            <div class="dash-card-label">${labels.watchlist}</div>
                            <div class="dash-card-value">${favs.length} ${labels.pairs}</div>
                        </div>
                    </div>
                    <div class="dash-card glass-card fade-slide-up" style="--stagger:2">
                        <div class="dash-card-icon">🔒</div>
                        <div>
                            <div class="dash-card-label">${labels.pnl24h} <span style="font-size:10px;color:#f59e0b;">(${t('simulated') || 'simulé'})</span></div>
                            <div class="dash-card-value" style="color:${pnlColor}">${pnlSign}$${fmtPct(Math.abs(safePnl))}</div>
                        </div>
                    </div>
                </div>

                <!-- Market Phase Indicator -->
                <div class="dash-section fade-slide-up" style="--stagger:3" id="dash-market-phase">
                    ${typeof MarketPhaseIndicator !== 'undefined' ? MarketPhaseIndicator.renderWidget() : '<div style="padding:20px;text-align:center;color:#888;">Chargement de la phase de marché...</div>'}
                </div>

                <!-- Two Column: Allocation + Market Movers -->
                <div class="dash-two-col">
                    <div class="dash-section glass-card fade-slide-up" style="--stagger:4">
                        <h3 class="dash-section-title">${labels.allocation}</h3>
                        <div style="display:flex;align-items:center;gap:20px;">
                            <canvas id="dash-donut" style="width:120px;height:120px;flex-shrink:0"></canvas>
                            <div id="dash-alloc-legend" style="flex:1;font-size:13px;"></div>
                        </div>
                    </div>
                    <div class="dash-section glass-card fade-slide-up" style="--stagger:5">
                        <h3 class="dash-section-title">${labels.marketMovers}</h3>
                        <div id="dash-movers">
                            ${movers.map(m => {
                                const ch = safeNum(m.change24h, 0);
                                const color = ch >= 0 ? '#00ff88' : '#ff4444';
                                const sign = ch >= 0 ? '+' : '';
                                const p = safeNum(m.price, 0);
                                const priceDisplay = p >= 1000 ? safeNum(p, 0).toLocaleString('en-US',{maximumFractionDigits:0}) : safeNum(p, 0).toFixed(2);
                                const changeDisplay = safeNum(ch, 0).toFixed(2);
                                return `<div class="dash-mover-row">
                                    <span class="dash-mover-symbol">${m.symbol || 'N/A'}</span>
                                    <span style="color:var(--text-muted)">$${priceDisplay}</span>
                                    <span class="dash-mover-change" style="color:${color}">${sign}${changeDisplay}%</span>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="dash-section glass-card fade-slide-up" style="--stagger:6">
                    <h3 class="dash-section-title">${labels.quickActions}</h3>
                    <div class="dash-actions-grid">
                        <button class="dash-action-btn" onclick="ObeliskApp.switchTab('trade')"><span class="dash-action-icon">📈</span><span>${labels.trade}</span></button>
                        <button class="dash-action-btn" onclick="ObeliskApp.switchTab('swap')"><span class="dash-action-icon">🔄</span><span>${labels.swap}</span></button>
                        <button class="dash-action-btn" onclick="ObeliskApp.switchTab('portfolio')"><span class="dash-action-icon">📊</span><span>${labels.portfolio}</span></button>
                        <button class="dash-action-btn" onclick="ObeliskApp.switchTab('investments')"><span class="dash-action-icon">💰</span><span>${labels.invest}</span></button>
                        <button class="dash-action-btn" onclick="ObeliskApp.switchTab('wallet')"><span class="dash-action-icon">👛</span><span>${labels.wallet}</span></button>
                        <button class="dash-action-btn" onclick="ObeliskApp.switchTab('combos')"><span class="dash-action-icon">🎯</span><span>${labels.combos}</span></button>
                    </div>
                </div>

                <!-- Activity Feed -->
                <div class="dash-section glass-card fade-slide-up" style="--stagger:7">
                    <h3 class="dash-section-title">${labels.recentActivity}</h3>
                    <div id="dash-activity-feed"></div>
                </div>

                <!-- Watchlist -->
                <div class="dash-section glass-card fade-slide-up" style="--stagger:8">
                    <h3 class="dash-section-title">${labels.watchlist}</h3>
                    <div id="dash-watchlist-content" style="color:var(--text-muted)">${t('dash_loading') || 'Chargement...'}</div>
                </div>
            </div>
        `;

        // Re-translate data-i18n elements injected by this render
        if (typeof I18n !== 'undefined' && I18n.translatePage) {
            I18n.translatePage();
        }

        // Draw charts after DOM insert
        requestAnimationFrame(() => {
            drawSparklineChart();
            drawAllocationDonut();
            renderActivityFeed();
            renderWatchlist();
            animateValue(document.getElementById('dash-total-value'), 0, safeTotal, 1200);
        });

        // Listen for market phase updates
        window.addEventListener('marketPhaseUpdate', () => {
            const phaseEl = document.getElementById('dash-market-phase');
            if (phaseEl && typeof MarketPhaseIndicator !== 'undefined') {
                phaseEl.innerHTML = MarketPhaseIndicator.renderWidget();
            }
        });
    }

    function drawSparklineChart() {
        const canvas = document.getElementById('dash-sparkline');
        if (!canvas) return;
        const snaps = getSnapshots();
        // Use last 48 points or generate dummy data
        let data;
        if (snaps.length >= 2) {
            data = snaps.slice(-48).map(s => s.v);
        } else {
            // Generate demo data
            const base = 10000;
            data = Array.from({length: 48}, (_, i) => base + Math.sin(i * 0.3) * 200 + Math.random() * 100);
        }
        const lastVal = data[data.length - 1];
        const firstVal = data[0];
        const color = lastVal >= firstVal ? '#00ff88' : '#ff4444';
        drawSparkline(canvas, data, color);
    }

    function drawAllocationDonut() {
        const canvas = document.getElementById('dash-donut');
        const legend = document.getElementById('dash-alloc-legend');
        if (!canvas) return;

        // Get allocation from portfolio or mock
        const portfolio = window.SimulatedPortfolio;
        let segments = [];

        if (portfolio && portfolio.getInvestments) {
            const invs = portfolio.getInvestments();
            if (invs && invs.length) {
                const colors = ['#c9a227', '#00d4ff', '#00ff88', '#ff4444', '#f7931a', '#8b5cf6', '#ec4899'];
                invs.forEach((inv, i) => {
                    segments.push({ label: inv.name || inv.type, value: inv.value || inv.amount || 100, color: colors[i % colors.length] });
                });
            }
        }

        if (!segments.length) {
            segments = [
                { label: 'USDC', value: 5000, color: '#00d4ff' },
                { label: 'BTC', value: 3000, color: '#f7931a' },
                { label: 'ETH', value: 1500, color: '#8b5cf6' },
                { label: 'SOL', value: 500, color: '#00ff88' }
            ];
        }

        drawDonut(canvas, segments);

        if (legend) {
            const total = segments.reduce((s, seg) => s + parseFloat(seg.value || 0), 0);
            const safeTotal = total > 0 ? total : 1; // Prevent division by zero
            legend.innerHTML = segments.map(seg => {
                const segValue = parseFloat(seg.value || 0);
                const pctRaw = (segValue / safeTotal) * 100;
                const pct = (Number.isFinite(pctRaw) && !Number.isNaN(pctRaw)) ? pctRaw.toFixed(1) : '0.0';
                return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
                    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${seg.color}"></span>
                    <span style="color:var(--text-primary)">${seg.label || 'N/A'}</span>
                    <span style="color:var(--text-muted);margin-left:auto">${pct}%</span>
                </div>`;
            }).join('');
        }
    }

    function renderActivityFeed() {
        const feed = document.getElementById('dash-activity-feed');
        if (!feed) return;

        // Get recent activity from localStorage or demo
        const history = JSON.parse(localStorage.getItem('obelisk_trade_history') || '[]').slice(-5).reverse();

        if (history.length === 0) {
            feed.innerHTML = `<div style="color:var(--text-muted);padding:12px 0;text-align:center;" data-i18n="dash_no_activity">No recent activity</div>`;
            return;
        }

        feed.innerHTML = history.map(item => {
            const icon = item.type === 'buy' || item.side === 'long' ? '🟢' : item.type === 'sell' || item.side === 'short' ? '🔴' : '🔵';
            const time = item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '';
            return `<div class="dash-activity-item">
                <span>${icon}</span>
                <span style="flex:1">${item.symbol || item.pair || 'Trade'} - ${item.type || item.side || ''}</span>
                <span style="color:var(--text-muted);font-size:12px">${time}</span>
            </div>`;
        }).join('');
    }

    function renderWatchlist() {
        const container = document.getElementById('dash-watchlist-content');
        if (!container) return;
        const favs = JSON.parse(localStorage.getItem('obelisk_favorites') || '[]');
        if (favs.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted)" data-i18n="dash_no_favorites">No favorites yet. Star pairs to add them here.</p>';
            // Apply translation
            if (typeof I18n !== 'undefined' && I18n.updatePageTexts) {
                I18n.updatePageTexts();
            }
            return;
        }
        container.innerHTML = favs.map(pair => `
            <div class="dash-watchlist-item" onclick="ObeliskApp.switchTab('trade')">
                <span class="dash-pair-name">${pair}</span>
                <span class="dash-pair-price" id="dash-price-${pair.replace('/','_')}">--</span>
            </div>
        `).join('');

        // Update prices
        if (typeof PriceService !== 'undefined') {
            favs.forEach(pair => {
                const symbol = pair.split('/')[0];
                const price = PriceService.getPrice(symbol);
                const el = document.getElementById('dash-price-' + pair.replace('/', '_'));
                if (el && price) el.textContent = PriceService.formatPrice(price);
            });
        }
    }

    return { render, renderWatchlist, drawSparklineChart, saveSnapshot };
})();
