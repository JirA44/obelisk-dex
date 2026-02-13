/**
 * OBELISK - Initialize Realtime Charts on Page Load
 * Ultra-precise timeframes from 0.1ms to 5s
 * Version: 2.3.0 - Chart source + Forerunner theme - Collapsible arbitrage panel
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for RealtimePrices to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (typeof RealtimePrices === 'undefined') {
        console.error('RealtimePrices not loaded');
        return;
    }

    // Create chart in the trading chart area
    const chartContainer = document.getElementById('trading-chart');
    if (chartContainer) {
        // Clear placeholder
        chartContainer.innerHTML = '<canvas id="main-chart"></canvas>';

        // Initialize chart for BTC
        RealtimePrices.createChart('trading-chart', 'BTC', {
            width: chartContainer.clientWidth || 800,
            height: 400
        });
    }

    // Subscribe to price updates for UI
    RealtimePrices.subscribe((type, data) => {
        if (type === 'prices') {
            updatePriceDisplay(data);
        }
        if (type === 'arbitrage') {
            updateArbitragePanel(data);
        }
    });

    // Add pair selector functionality
    setupPairSelector();

    // Add arbitrage panel
    addArbitragePanel();

    // Add timeframe selector
    addTimeframeSelector();

    console.log('🎯 Realtime charts initialized with ms timeframes!');
});

function updatePriceDisplay(prices) {
    const btcPrice = prices['BTC'];
    if (btcPrice) {
        const priceEl = document.getElementById('current-price');
        const changeEl = document.getElementById('price-change');

        if (priceEl) {
            priceEl.textContent = `$${btcPrice.price.toLocaleString()}`;
            priceEl.className = `pair-price ${btcPrice.direction === 'up' ? 'positive' : btcPrice.direction === 'down' ? 'negative' : ''}`;
        }

        if (changeEl) {
            const change = btcPrice.change24h;
            changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            changeEl.className = `pair-change ${change >= 0 ? 'positive' : 'negative'}`;
        }
    }
}

function updateArbitragePanel(opportunities) {
    const panel = document.getElementById('arbitrage-panel-content');
    if (!panel) return;

    if (opportunities.length === 0) {
        panel.innerHTML = '<div style="color: #888;">No opportunities detected</div>';
        return;
    }

    panel.innerHTML = opportunities.slice(0, 5).map(opp => `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin: 4px 0;
            background: rgba(0, 255, 136, 0.1);
            border-radius: 4px;
            border-left: 3px solid #00ff88;
        ">
            <div>
                <strong style="color: #00aaff;">${opp.coin}</strong>
                <span style="color: #888; font-size: 11px; margin-left: 8px;">${opp.direction}</span>
            </div>
            <div style="color: #00ff88; font-weight: bold;">
                ${opp.spread}
            </div>
        </div>
    `).join('');
}

function setupPairSelector() {
    const pairName = document.getElementById('current-pair');
    if (!pairName) return;

    const pairs = ['BTC', 'ETH', 'SOL', 'ARB', 'DOGE', 'XRP', 'AVAX'];

    pairName.style.cursor = 'pointer';
    pairName.title = 'Click to change pair';

    let currentIndex = 0;

    pairName.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % pairs.length;
        const newPair = pairs[currentIndex];

        pairName.textContent = `${newPair}-USD`;

        // Destroy old chart and create new one
        RealtimePrices.destroyChart(pairs[(currentIndex - 1 + pairs.length) % pairs.length]);

        const chartContainer = document.getElementById('trading-chart');
        if (chartContainer) {
            RealtimePrices.createChart('trading-chart', newPair, {
                width: chartContainer.clientWidth || 800,
                height: 400
            });
        }
    });
}

/**
 * Add timeframe selector with ultra-precise ms options
 */
function addTimeframeSelector() {
    const chartHeader = document.querySelector('.chart-controls');
    if (!chartHeader) {
        // Create our own if not found
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            const header = chartContainer.querySelector('.chart-header');
            if (header) {
                // Add after existing controls
                const tfContainer = document.createElement('div');
                tfContainer.className = 'timeframe-selector';
                tfContainer.innerHTML = createTimeframeHTML();
                header.appendChild(tfContainer);
                setupTimeframeListeners();
            }
        }
        return;
    }

    // Replace existing timeframe buttons
    chartHeader.innerHTML = createTimeframeHTML();
    setupTimeframeListeners();
}

function createTimeframeHTML() {
    return `
        <style>
            .tf-group {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }
            .tf-label {
                color: #8a2be2;
                font-size: 9px;
                margin-right: 8px;
                align-self: center;
            }
            .tf-btn {
                background: rgba(10, 10, 26, 0.8);
                border: 2px solid #00ff88;
                border-radius: 4px;
                color: #888;
                font-family: 'JetBrains Mono', monospace;
                font-size: 10px;
                padding: 4px 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .tf-btn:hover {
                border-color: #00aaff;
                color: #00aaff;
            }
            .tf-btn.active {
                background: linear-gradient(135deg, #00aaff 0%, #8a2be2 100%);
                color: #fff;
                border-color: transparent;
                font-weight: bold;
            }
            .tf-divider {
                width: 1px;
                background: #4a2c8a;
                margin: 0 6px;
            }
            .tf-ms {
                color: #00ff88;
                font-size: 9px;
            }
            .tf-s {
                color: #00aaff;
                font-size: 9px;
            }
        </style>
        <div style="display:flex;align-items:center;gap:8px;"><div class="chart-source-group" style="display:flex;gap:8px;margin-right:20px;padding-right:20px;border-right:2px solid #8a2be2;"><button class="source-btn" data-source="tradingview" onclick="switchChartSource('tradingview')" style="background:rgba(0,0,0,0.6);border:2px solid #8a2be2;border-radius:8px;color:#fff;font-size:12px;font-weight:700;padding:10px 16px;cursor:pointer;">TradingView</button><button class="source-btn active" data-source="obelisk" onclick="switchChartSource('obelisk')" style="background:linear-gradient(135deg,#8a2be2,#00aaff);border:2px solid #fff;border-radius:8px;color:#fff;font-size:12px;font-weight:700;padding:10px 16px;cursor:pointer;">Obelisk ms</button></div><div class="tf-group">
            <span class="tf-label">TIMEFRAME</span>

            <!-- Milliseconds -->
            <button class="tf-btn" data-tf="0.1" data-unit="ms" title="0.1ms - Ultra Fast">
                <span class="tf-ms">0.1ms</span>
            </button>
            <button class="tf-btn" data-tf="1" data-unit="ms" title="1ms">
                <span class="tf-ms">1ms</span>
            </button>
            <button class="tf-btn" data-tf="10" data-unit="ms" title="10ms">
                <span class="tf-ms">10ms</span>
            </button>
            <button class="tf-btn" data-tf="100" data-unit="ms" title="100ms">
                <span class="tf-ms">100ms</span>
            </button>

            <div class="tf-divider"></div>

            <!-- Seconds -->
            <button class="tf-btn active" data-tf="500" data-unit="ms" title="500ms - Default">
                <span class="tf-s">500ms</span>
            </button>
            <button class="tf-btn" data-tf="1" data-unit="s" title="1 second">
                <span class="tf-s">1s</span>
            </button>
            <button class="tf-btn" data-tf="3" data-unit="s" title="3 seconds">
                <span class="tf-s">3s</span>
            </button>
            <button class="tf-btn" data-tf="5" data-unit="s" title="5 seconds">
                <span class="tf-s">5s</span>
            </button>
        </div>
    `;
}

function setupTimeframeListeners() {
    const buttons = document.querySelectorAll('.tf-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Calculate new interval in ms
            const tf = parseFloat(btn.dataset.tf);
            const unit = btn.dataset.unit;
            let intervalMs;

            if (unit === 'ms') {
                intervalMs = tf;
            } else if (unit === 's') {
                intervalMs = tf * 1000;
            }

            // Update RealtimePrices config
            updateRefreshRate(intervalMs);
        });
    });
}

/**
 * Update the price refresh rate
 */
function updateRefreshRate(intervalMs) {
    if (typeof RealtimePrices === 'undefined') return;

    // Update config
    RealtimePrices.config.updateInterval = intervalMs;

    // Show notification
    showTimeframeNotification(intervalMs);

    // Restart price loop with new interval
    // Note: This requires stopping the old interval and starting a new one
    // Since we can't directly clear the old interval, we'll track it

    if (RealtimePrices._priceInterval) {
        clearInterval(RealtimePrices._priceInterval);
    }

    // For very fast intervals, use requestAnimationFrame approach
    if (intervalMs < 50) {
        // Use high-precision timing for sub-50ms
        let lastFetch = 0;
        const highFreqFetch = () => {
            const now = performance.now();
            if (now - lastFetch >= intervalMs) {
                RealtimePrices.fetchPrices();
                lastFetch = now;
            }
            if (RealtimePrices.config.updateInterval < 50) {
                requestAnimationFrame(highFreqFetch);
            }
        };
        requestAnimationFrame(highFreqFetch);
    } else {
        // Use setInterval for normal intervals
        RealtimePrices._priceInterval = setInterval(() => {
            RealtimePrices.fetchPrices();
        }, intervalMs);
    }

    console.log(`⏱️ Refresh rate changed to ${intervalMs}ms`);
}

function showTimeframeNotification(intervalMs) {
    // Create notification
    let notification = document.getElementById('tf-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'tf-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #0a0a1a 0%, #1a1040 100%);
            border: 2px solid #00ff88;
            border-radius: 8px;
            padding: 12px 24px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            color: #fff;
            z-index: 600;
            box-shadow: 0 4px 24px rgba(138, 43, 226, 0.4);
            transition: opacity 0.3s, transform 0.3s;
        `;
        document.body.appendChild(notification);
    }

    // Format display
    let display;
    if (intervalMs < 1) {
        display = `${intervalMs * 1000}μs`;
    } else if (intervalMs < 1000) {
        display = `${intervalMs}ms`;
    } else {
        display = `${intervalMs / 1000}s`;
    }

    notification.innerHTML = `
        <span style="color: #00aaff;">⏱️ Timeframe:</span>
        <span style="color: #00ff88; font-weight: bold; margin-left: 8px;">${display}</span>
        <span style="color: #888; margin-left: 8px;">
            (${intervalMs < 100 ? 'ULTRA FAST' : intervalMs < 500 ? 'FAST' : 'NORMAL'})
        </span>
    `;

    notification.style.opacity = '1';
    notification.style.transform = 'translateX(-50%) translateY(0)';

    // Hide after 2s
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2000);
}

function addArbitragePanel() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const panel = document.createElement('div');
    panel.id = 'arbitrage-panel';
    panel.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            background: linear-gradient(135deg, #0a0a1a 0%, #1a1040 100%);
            border: 2px solid #00ff88;
            border-radius: 12px;
            padding: 16px;
            font-family: 'JetBrains Mono', monospace;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(138, 43, 226, 0.4);
        ">
            <div id="arb-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #4a2c8a;
                cursor: pointer;
            " onclick="toggleArbitragePanel()">
                <div>
                    <span style="color: #00ff88; font-weight: bold; font-size: 13px;">⚡ ARBITRAGE LIVE</span>
                    <span style="color: #8a2be2; font-size: 10px; margin-left: 6px;">MULTI-DEX</span>
                </div>
                <button id="arb-toggle" style="
                    background: rgba(0, 255, 136, 0.2);
                    border: 2px solid #00ff88;
                    color: #00ff88;
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                ">−</button>
            </div>
            <div id="arbitrage-panel-content">
                <div style="color: #888;">Loading opportunities...</div>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // Toggle function
    window.toggleArbitragePanel = function() {
        const content = document.getElementById('arbitrage-panel-content');
        const btn = document.getElementById('arb-toggle');
        const header = document.getElementById('arb-header');
        if (content && btn) {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            btn.textContent = isHidden ? '−' : '+';
            header.style.marginBottom = isHidden ? '12px' : '0';
            header.style.paddingBottom = isHidden ? '8px' : '0';
            header.style.borderBottom = isHidden ? '1px solid #4a2c8a' : 'none';
            localStorage.setItem('arb_panel_collapsed', !isHidden);
        }
    };

    // Restore state
    if (localStorage.getItem('arb_panel_collapsed') === 'true') {
        setTimeout(() => window.toggleArbitragePanel(), 100);
    }
}

// Chart source switching
window.switchChartSource = function(source) {
    console.log('[Chart] Switching to:', source);
    window.currentChartSource = source;
    document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
    var btn = document.querySelector('.source-btn[data-source="' + source + '"]');
    if (btn) {
        btn.classList.add('active');
        btn.style.background = 'linear-gradient(135deg,#8a2be2,#00aaff)';
        btn.style.borderColor = '#fff';
    }
    document.querySelectorAll('.source-btn:not(.active)').forEach(b => {
        b.style.background = 'rgba(0,0,0,0.6)';
        b.style.borderColor = '#8a2be2';
    });
    if (source === 'tradingview') {
        var c = document.getElementById('trading-chart');
        if (c) c.innerHTML = '<iframe src="https://s.tradingview.com/widgetembed/?symbol=BINANCE:BTCUSDT&interval=15&theme=dark&style=1" style="width:100%;height:100%;border:none"></iframe>';
    } else {
        var c = document.getElementById('trading-chart');
        if (c) { c.innerHTML = '<canvas id="main-chart"></canvas>'; if (typeof RealtimePrices !== 'undefined') RealtimePrices.createChart('trading-chart', 'BTC', {width: c.clientWidth||800, height:400}); }
    }
};
window.currentChartSource = 'obelisk';


// Theme Switcher - Forerunner Halo 4 Theme
window.setTheme = function(theme) {
    document.body.classList.remove("theme-forerunner", "theme-default", "theme-cyber");
    if (theme && theme !== "default") {
        document.body.classList.add("theme-" + theme);
    }
    localStorage.setItem("obelisk_theme", theme || "default");
    console.log("[Theme] Set to:", theme);
};

// Load saved theme on startup
document.addEventListener("DOMContentLoaded", function() {
    var saved = localStorage.getItem("obelisk_theme");
    if (saved) setTheme(saved);
    
    // Add theme toggle button to header
    var themes = ["default", "forerunner", "neon"];
    var themeLabels = {
        "default": "🎨 Default",
        "forerunner": "🔥 Forerunner",
        "neon": "💜 Neon"
    };

    setTimeout(function() {
        var header = document.querySelector(".header-actions") || document.querySelector("header");
        if (header && !document.getElementById("theme-toggle")) {
            var btn = document.createElement("button");
            btn.id = "theme-toggle";
            var current = localStorage.getItem("obelisk_theme") || "default";
            btn.innerHTML = themeLabels[current] || "🎨 Theme";
            btn.style.cssText = "background:linear-gradient(135deg,#ff6a00,#00ccff);border:none;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:bold;margin-left:10px;";
            btn.onclick = function() {
                var current = localStorage.getItem("obelisk_theme") || "default";
                var currentIndex = themes.indexOf(current);
                var nextIndex = (currentIndex + 1) % themes.length;
                var next = themes[nextIndex];
                setTheme(next);
                btn.innerHTML = themeLabels[next] || "🎨 Theme";
            };
            header.appendChild(btn);
        }
    }, 1500);
});

