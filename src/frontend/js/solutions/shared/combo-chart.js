/* ============================================
   COMBO CHART - Multi-indicator trading chart
   Candlesticks + Volume + MA + RSI + MACD
   ============================================ */

const ComboChart = {
    timeframe: '1D',
    symbol: 'BTC',
    indicators: { ma20: true, ma50: true, volume: true, rsi: true, macd: false, bollinger: false },

    init() {
        try {
            var saved = JSON.parse(localStorage.getItem('obelisk_combo_chart') || '{}');
            if (saved.timeframe) this.timeframe = saved.timeframe;
            if (saved.symbol) this.symbol = saved.symbol;
            if (saved.indicators) this.indicators = saved.indicators;
        } catch(e) {}
    },

    save() {
        localStorage.setItem('obelisk_combo_chart', JSON.stringify({
            timeframe: this.timeframe, symbol: this.symbol, indicators: this.indicators
        }));
    },

    generateOHLCV(symbol, count) {
        var bases = { BTC: 97500, ETH: 3400, SOL: 190, AVAX: 35, LINK: 22, ARB: 1.8, BNB: 620, DOGE: 0.32 };
        var base = bases[symbol] || 100;
        var vol = base * 0.02;
        var data = [];
        var price = base * (0.85 + Math.random() * 0.15);
        var seed = symbol.charCodeAt(0) * 137 + symbol.charCodeAt(symbol.length - 1) * 31;

        for (var i = 0; i < count; i++) {
            seed = (seed * 16807 + 7) % 2147483647;
            var r = (seed % 10000) / 10000;
            var drift = (r - 0.48) * vol;
            var open = price;
            var high = open + Math.abs(drift) * (0.5 + r);
            var low = open - Math.abs(drift) * (0.5 + (1 - r));
            price = open + drift;
            var close = price;
            if (low > Math.min(open, close)) low = Math.min(open, close) * (1 - r * 0.005);
            if (high < Math.max(open, close)) high = Math.max(open, close) * (1 + r * 0.005);
            var volume = (500 + r * 2000) * (base / 100);
            data.push({ o: open, h: high, l: low, c: close, v: volume, t: Date.now() - (count - i) * 86400000 });
        }
        return data;
    },

    calcMA(data, period) {
        var result = [];
        for (var i = 0; i < data.length; i++) {
            if (i < period - 1) { result.push(null); continue; }
            var sum = 0;
            for (var j = i - period + 1; j <= i; j++) sum += data[j].c;
            result.push(sum / period);
        }
        return result;
    },

    calcRSI(data, period) {
        var result = [];
        var gains = [], losses = [];
        for (var i = 0; i < data.length; i++) {
            if (i === 0) { result.push(50); continue; }
            var diff = data[i].c - data[i - 1].c;
            gains.push(diff > 0 ? diff : 0);
            losses.push(diff < 0 ? -diff : 0);
            if (gains.length < period) { result.push(50); continue; }
            var avgGain = 0, avgLoss = 0;
            for (var j = gains.length - period; j < gains.length; j++) {
                avgGain += gains[j]; avgLoss += losses[j];
            }
            avgGain /= period; avgLoss /= period;
            var rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            result.push(100 - (100 / (1 + rs)));
        }
        return result;
    },

    calcMACD(data) {
        var ema12 = this.calcEMA(data.map(function(d) { return d.c; }), 12);
        var ema26 = this.calcEMA(data.map(function(d) { return d.c; }), 26);
        var macdLine = [];
        for (var i = 0; i < data.length; i++) {
            macdLine.push(ema12[i] !== null && ema26[i] !== null ? ema12[i] - ema26[i] : 0);
        }
        var signal = this.calcEMA(macdLine, 9);
        var histogram = [];
        for (var i = 0; i < data.length; i++) {
            histogram.push(signal[i] !== null ? macdLine[i] - signal[i] : 0);
        }
        return { macd: macdLine, signal: signal, histogram: histogram };
    },

    calcEMA(values, period) {
        var result = [];
        var k = 2 / (period + 1);
        var ema = null;
        for (var i = 0; i < values.length; i++) {
            var val = typeof values[i] === 'number' ? values[i] : 0;
            if (i < period - 1) { result.push(null); continue; }
            if (ema === null) {
                var sum = 0;
                for (var j = i - period + 1; j <= i; j++) sum += (typeof values[j] === 'number' ? values[j] : 0);
                ema = sum / period;
            } else {
                ema = val * k + ema * (1 - k);
            }
            result.push(ema);
        }
        return result;
    },

    calcBollinger(data, period, mult) {
        var ma = this.calcMA(data, period);
        var upper = [], lower = [];
        for (var i = 0; i < data.length; i++) {
            if (ma[i] === null) { upper.push(null); lower.push(null); continue; }
            var sum = 0;
            for (var j = i - period + 1; j <= i; j++) sum += Math.pow(data[j].c - ma[i], 2);
            var std = Math.sqrt(sum / period);
            upper.push(ma[i] + mult * std);
            lower.push(ma[i] - mult * std);
        }
        return { ma: ma, upper: upper, lower: lower };
    },

    renderCandlesticks(data, w, h, visibleStart) {
        var visible = data.slice(visibleStart);
        var count = visible.length;
        if (count === 0) return '<svg width="' + w + '" height="' + h + '"></svg>';

        var allMin = Infinity, allMax = -Infinity;
        visible.forEach(function(d) { if (d.l < allMin) allMin = d.l; if (d.h > allMax) allMax = d.h; });
        var range = allMax - allMin;
        if (range === 0) range = 1;
        var padTop = 20, padBot = 25, padLeft = 55, padRight = 10;
        var chartW = w - padLeft - padRight;
        var chartH = h - padTop - padBot;
        var candleW = Math.max(2, (chartW / count) * 0.7);
        var gap = chartW / count;

        var toY = function(v) { return padTop + chartH - ((v - allMin) / range) * chartH; };
        var svg = '<svg width="' + w + '" height="' + h + '">';

        // Grid lines
        var gridSteps = 5;
        for (var g = 0; g <= gridSteps; g++) {
            var gv = allMin + (range / gridSteps) * g;
            var gy = toY(gv);
            svg += '<line x1="' + padLeft + '" y1="' + gy + '" x2="' + (w - padRight) + '" y2="' + gy + '" stroke="#1a1a1a" stroke-width="1"/>';
            var label = gv >= 1000 ? gv.toFixed(0) : gv >= 1 ? gv.toFixed(2) : gv.toFixed(4);
            svg += '<text x="' + (padLeft - 5) + '" y="' + (gy + 3) + '" text-anchor="end" fill="#555" font-size="9">' + label + '</text>';
        }

        // Candlesticks
        visible.forEach(function(d, i) {
            var x = padLeft + i * gap + gap / 2;
            var bullish = d.c >= d.o;
            var color = bullish ? '#00ff88' : '#ff4466';
            var bodyTop = toY(Math.max(d.o, d.c));
            var bodyBot = toY(Math.min(d.o, d.c));
            var bodyH = Math.max(1, bodyBot - bodyTop);
            // Wick
            svg += '<line x1="' + x + '" y1="' + toY(d.h) + '" x2="' + x + '" y2="' + toY(d.l) + '" stroke="' + color + '" stroke-width="1"/>';
            // Body
            svg += '<rect x="' + (x - candleW / 2) + '" y="' + bodyTop + '" width="' + candleW + '" height="' + bodyH + '" fill="' + (bullish ? color : color) + '" opacity="' + (bullish ? '0.3' : '0.8') + '" stroke="' + color + '" stroke-width="0.5"/>';
        });

        return { svg: svg, toY: toY, padLeft: padLeft, padRight: padRight, padTop: padTop, padBot: padBot, chartW: chartW, chartH: chartH, gap: gap, allMin: allMin, allMax: allMax, range: range, count: count };
    },

    renderOverlays(ctx, data, visibleStart) {
        var visible = data.slice(visibleStart);
        var self = this;
        var svg = '';

        // MA20
        if (this.indicators.ma20) {
            var ma20 = this.calcMA(data, 20);
            var ma20v = ma20.slice(visibleStart);
            svg += this.drawLine(ma20v, ctx, '#00d4ff', 1.2);
        }
        // MA50
        if (this.indicators.ma50) {
            var ma50 = this.calcMA(data, 50);
            var ma50v = ma50.slice(visibleStart);
            svg += this.drawLine(ma50v, ctx, '#ff8844', 1.2);
        }
        // Bollinger Bands
        if (this.indicators.bollinger) {
            var bb = this.calcBollinger(data, 20, 2);
            var bbUpper = bb.upper.slice(visibleStart);
            var bbLower = bb.lower.slice(visibleStart);
            var bbMa = bb.ma.slice(visibleStart);
            svg += this.drawLine(bbUpper, ctx, '#c9a227', 0.8);
            svg += this.drawLine(bbLower, ctx, '#c9a227', 0.8);
            // Fill between bands
            var fillPath = '';
            var fillPathBot = '';
            var started = false;
            for (var i = 0; i < bbUpper.length; i++) {
                if (bbUpper[i] === null || bbLower[i] === null) continue;
                var x = ctx.padLeft + i * ctx.gap + ctx.gap / 2;
                if (!started) { fillPath += 'M' + x + ',' + ctx.toY(bbUpper[i]); started = true; }
                else fillPath += 'L' + x + ',' + ctx.toY(bbUpper[i]);
            }
            for (var i = bbLower.length - 1; i >= 0; i--) {
                if (bbLower[i] === null) continue;
                var x = ctx.padLeft + i * ctx.gap + ctx.gap / 2;
                fillPath += 'L' + x + ',' + ctx.toY(bbLower[i]);
            }
            fillPath += 'Z';
            svg += '<path d="' + fillPath + '" fill="#c9a227" opacity="0.06"/>';
        }

        return svg;
    },

    drawLine(values, ctx, color, width) {
        var path = '';
        var started = false;
        for (var i = 0; i < values.length; i++) {
            if (values[i] === null) continue;
            var x = ctx.padLeft + i * ctx.gap + ctx.gap / 2;
            var y = ctx.toY(values[i]);
            if (!started) { path += 'M' + x.toFixed(1) + ',' + y.toFixed(1); started = true; }
            else path += 'L' + x.toFixed(1) + ',' + y.toFixed(1);
        }
        if (!path) return '';
        return '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="' + width + '" opacity="0.9"/>';
    },

    renderVolume(data, visibleStart, w, h, padLeft, padRight, gap) {
        var visible = data.slice(visibleStart);
        var maxVol = 0;
        visible.forEach(function(d) { if (d.v > maxVol) maxVol = d.v; });
        if (maxVol === 0) maxVol = 1;
        var svg = '<svg width="' + w + '" height="' + h + '">';
        svg += '<text x="' + padLeft + '" y="10" fill="#555" font-size="9">Volume</text>';
        var barH = h - 14;
        visible.forEach(function(d, i) {
            var x = padLeft + i * gap + gap / 2;
            var bh = (d.v / maxVol) * barH;
            var color = d.c >= d.o ? '#00ff88' : '#ff4466';
            var barW = Math.max(1.5, gap * 0.6);
            svg += '<rect x="' + (x - barW / 2) + '" y="' + (h - bh) + '" width="' + barW + '" height="' + bh + '" fill="' + color + '" opacity="0.4"/>';
        });
        svg += '</svg>';
        return svg;
    },

    renderRSI(data, visibleStart, w, h, padLeft, padRight, gap) {
        var rsi = this.calcRSI(data, 14);
        var visible = rsi.slice(visibleStart);
        var svg = '<svg width="' + w + '" height="' + h + '">';
        var chartH = h - 10;
        var toY = function(v) { return 5 + chartH - (v / 100) * chartH; };

        // Overbought/Oversold zones
        svg += '<rect x="' + padLeft + '" y="' + toY(100) + '" width="' + (w - padLeft - padRight) + '" height="' + (toY(70) - toY(100)) + '" fill="#ff4466" opacity="0.05"/>';
        svg += '<rect x="' + padLeft + '" y="' + toY(30) + '" width="' + (w - padLeft - padRight) + '" height="' + (toY(0) - toY(30)) + '" fill="#00ff88" opacity="0.05"/>';
        svg += '<line x1="' + padLeft + '" y1="' + toY(70) + '" x2="' + (w - padRight) + '" y2="' + toY(70) + '" stroke="#ff4466" stroke-width="0.5" stroke-dasharray="3,3"/>';
        svg += '<line x1="' + padLeft + '" y1="' + toY(30) + '" x2="' + (w - padRight) + '" y2="' + toY(30) + '" stroke="#00ff88" stroke-width="0.5" stroke-dasharray="3,3"/>';
        svg += '<line x1="' + padLeft + '" y1="' + toY(50) + '" x2="' + (w - padRight) + '" y2="' + toY(50) + '" stroke="#333" stroke-width="0.5"/>';

        // Labels
        svg += '<text x="' + (padLeft - 5) + '" y="' + (toY(70) + 3) + '" text-anchor="end" fill="#ff4466" font-size="8">70</text>';
        svg += '<text x="' + (padLeft - 5) + '" y="' + (toY(30) + 3) + '" text-anchor="end" fill="#00ff88" font-size="8">30</text>';
        svg += '<text x="' + padLeft + '" y="10" fill="#555" font-size="9">RSI(14)</text>';

        // RSI line
        var path = '';
        visible.forEach(function(v, i) {
            var x = padLeft + i * gap + gap / 2;
            var y = toY(v);
            path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        var lastRSI = visible[visible.length - 1];
        var rsiColor = lastRSI > 70 ? '#ff4466' : lastRSI < 30 ? '#00ff88' : '#c9a227';
        svg += '<path d="' + path + '" fill="none" stroke="' + rsiColor + '" stroke-width="1.5"/>';

        // Current value label
        svg += '<text x="' + (w - padRight + 3) + '" y="' + (toY(lastRSI) + 3) + '" fill="' + rsiColor + '" font-size="9" font-weight="600">' + lastRSI.toFixed(1) + '</text>';

        svg += '</svg>';
        return svg;
    },

    renderMACD(data, visibleStart, w, h, padLeft, padRight, gap) {
        var macd = this.calcMACD(data);
        var macdV = macd.macd.slice(visibleStart);
        var sigV = macd.signal.slice(visibleStart);
        var histV = macd.histogram.slice(visibleStart);

        var allVals = macdV.concat(sigV).concat(histV).filter(function(v) { return v !== null; });
        var maxAbs = Math.max.apply(null, allVals.map(function(v) { return Math.abs(v); }));
        if (maxAbs === 0) maxAbs = 1;

        var svg = '<svg width="' + w + '" height="' + h + '">';
        var chartH = h - 10;
        var mid = 5 + chartH / 2;
        var toY = function(v) { return mid - (v / maxAbs) * (chartH / 2 - 2); };

        svg += '<line x1="' + padLeft + '" y1="' + mid + '" x2="' + (w - padRight) + '" y2="' + mid + '" stroke="#333" stroke-width="0.5"/>';
        svg += '<text x="' + padLeft + '" y="10" fill="#555" font-size="9">MACD(12,26,9)</text>';

        // Histogram bars
        var barW = Math.max(1.5, gap * 0.5);
        histV.forEach(function(v, i) {
            if (v === null) return;
            var x = padLeft + i * gap + gap / 2;
            var bh = Math.abs((v / maxAbs) * (chartH / 2 - 2));
            var color = v >= 0 ? '#00ff88' : '#ff4466';
            var y = v >= 0 ? mid - bh : mid;
            svg += '<rect x="' + (x - barW / 2) + '" y="' + y + '" width="' + barW + '" height="' + Math.max(0.5, bh) + '" fill="' + color + '" opacity="0.4"/>';
        });

        // MACD line
        var pathM = '';
        macdV.forEach(function(v, i) {
            if (v === null) return;
            var x = padLeft + i * gap + gap / 2;
            pathM += (pathM === '' ? 'M' : 'L') + x.toFixed(1) + ',' + toY(v).toFixed(1);
        });
        svg += '<path d="' + pathM + '" fill="none" stroke="#00d4ff" stroke-width="1.2"/>';

        // Signal line
        var pathS = '';
        sigV.forEach(function(v, i) {
            if (v === null) return;
            var x = padLeft + i * gap + gap / 2;
            pathS += (pathS === '' ? 'M' : 'L') + x.toFixed(1) + ',' + toY(v).toFixed(1);
        });
        svg += '<path d="' + pathS + '" fill="none" stroke="#ff8844" stroke-width="1" stroke-dasharray="2,2"/>';

        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var data = this.generateOHLCV(this.symbol, 120);
        var visibleStart = Math.max(0, data.length - 60);
        var w = 620, mainH = 280;

        var last = data[data.length - 1];
        var prev = data[data.length - 2];
        var change = ((last.c - prev.c) / prev.c * 100);
        var ma20 = this.calcMA(data, 20);
        var ma50 = this.calcMA(data, 50);
        var rsi = this.calcRSI(data, 14);
        var lastMA20 = ma20[ma20.length - 1];
        var lastMA50 = ma50[ma50.length - 1];
        var lastRSI = rsi[rsi.length - 1];
        var trend = lastMA20 > lastMA50 ? 'Bullish' : 'Bearish';
        var trendColor = trend === 'Bullish' ? '#00ff88' : '#ff4466';

        // Symbol selector + timeframe
        var symbols = ['BTC', 'ETH', 'SOL', 'AVAX', 'LINK', 'ARB', 'BNB', 'DOGE'];
        var timeframes = ['1H', '4H', '1D', '1W'];
        var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">';
        html += '<div style="display:flex;gap:4px">';
        symbols.forEach(function(s) {
            var active = s === self.symbol;
            html += '<button class="sol-btn sol-btn-sm combo-sym" data-sym="' + s + '" style="' + (active ? 'background:#00d4ff;color:#000' : '') + '">' + s + '</button>';
        });
        html += '</div>';
        html += '<div style="display:flex;gap:4px">';
        timeframes.forEach(function(tf) {
            var active = tf === self.timeframe;
            html += '<button class="sol-btn sol-btn-sm combo-tf" data-tf="' + tf + '" style="' + (active ? 'background:#c9a227;color:#000' : '') + '">' + tf + '</button>';
        });
        html += '</div></div>';

        // Stats row
        html += '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#fff">' + self.symbol + '</div><div class="sol-stat-label">$' + (last.c >= 1 ? last.c.toFixed(2) : last.c.toFixed(4)) + '</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value ' + (change >= 0 ? 'green' : 'red') + '">' + (change >= 0 ? '+' : '') + change.toFixed(2) + '%</div><div class="sol-stat-label">24h Change</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + trendColor + '">' + trend + '</div><div class="sol-stat-label">MA Trend</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + (lastRSI > 70 ? '#ff4466' : lastRSI < 30 ? '#00ff88' : '#c9a227') + '">' + lastRSI.toFixed(1) + '</div><div class="sol-stat-label">RSI(14)</div></div></div>';

        // Indicator toggles
        html += '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
        var indList = [
            { key: 'ma20', label: 'MA20', color: '#00d4ff' },
            { key: 'ma50', label: 'MA50', color: '#ff8844' },
            { key: 'bollinger', label: 'Bollinger', color: '#c9a227' },
            { key: 'volume', label: 'Volume', color: '#888' },
            { key: 'rsi', label: 'RSI', color: '#c9a227' },
            { key: 'macd', label: 'MACD', color: '#00d4ff' }
        ];
        indList.forEach(function(ind) {
            var on = self.indicators[ind.key];
            html += '<button class="sol-btn sol-btn-sm combo-ind" data-ind="' + ind.key + '" style="font-size:10px;' + (on ? 'background:' + ind.color + ';color:#000;border-color:' + ind.color : 'opacity:0.5') + '">' + ind.label + '</button>';
        });
        html += '</div>';

        // Main candlestick chart
        html += '<div class="sol-section" style="padding:8px"><div style="overflow-x:auto">';
        var ctx = this.renderCandlesticks(data, w, mainH, visibleStart);
        var mainSvg = ctx.svg;
        mainSvg += this.renderOverlays(ctx, data, visibleStart);

        // Current price line
        var priceY = ctx.toY(last.c);
        mainSvg += '<line x1="' + ctx.padLeft + '" y1="' + priceY + '" x2="' + (w - ctx.padRight) + '" y2="' + priceY + '" stroke="#fff" stroke-width="0.5" stroke-dasharray="4,4" opacity="0.3"/>';
        mainSvg += '<rect x="' + (w - ctx.padRight - 1) + '" y="' + (priceY - 7) + '" width="46" height="14" rx="2" fill="' + (change >= 0 ? '#00ff88' : '#ff4466') + '"/>';
        mainSvg += '<text x="' + (w - ctx.padRight + 22) + '" y="' + (priceY + 3) + '" text-anchor="middle" fill="#000" font-size="9" font-weight="600">' + (last.c >= 1 ? last.c.toFixed(1) : last.c.toFixed(4)) + '</text>';

        // Time axis labels
        var visible = data.slice(visibleStart);
        for (var i = 0; i < visible.length; i += Math.max(1, Math.floor(visible.length / 6))) {
            var d = new Date(visible[i].t);
            var lbl = (d.getMonth() + 1) + '/' + d.getDate();
            var lx = ctx.padLeft + i * ctx.gap + ctx.gap / 2;
            mainSvg += '<text x="' + lx + '" y="' + (mainH - 5) + '" text-anchor="middle" fill="#444" font-size="8">' + lbl + '</text>';
        }

        // Legend
        if (this.indicators.ma20) mainSvg += '<text x="' + (ctx.padLeft + 5) + '" y="' + (ctx.padTop - 5) + '" fill="#00d4ff" font-size="8">MA20: ' + (lastMA20 ? lastMA20.toFixed(2) : '--') + '</text>';
        if (this.indicators.ma50) mainSvg += '<text x="' + (ctx.padLeft + 120) + '" y="' + (ctx.padTop - 5) + '" fill="#ff8844" font-size="8">MA50: ' + (lastMA50 ? lastMA50.toFixed(2) : '--') + '</text>';

        mainSvg += '</svg>';
        html += mainSvg + '</div></div>';

        // Volume panel
        if (this.indicators.volume) {
            html += '<div class="sol-section" style="padding:4px 8px"><div style="overflow-x:auto">' +
                this.renderVolume(data, visibleStart, w, 60, ctx.padLeft, ctx.padRight, ctx.gap) +
                '</div></div>';
        }

        // RSI panel
        if (this.indicators.rsi) {
            html += '<div class="sol-section" style="padding:4px 8px"><div style="overflow-x:auto">' +
                this.renderRSI(data, visibleStart, w, 80, ctx.padLeft, ctx.padRight, ctx.gap) +
                '</div></div>';
        }

        // MACD panel
        if (this.indicators.macd) {
            html += '<div class="sol-section" style="padding:4px 8px"><div style="overflow-x:auto">' +
                this.renderMACD(data, visibleStart, w, 80, ctx.padLeft, ctx.padRight, ctx.gap) +
                '</div></div>';
        }

        // OHLC data table (last 10)
        html += '<div class="sol-section"><div class="sol-section-title">📋 Recent OHLC Data</div>' +
            '<table class="sol-table"><thead><tr><th>Date</th><th>Open</th><th>High</th><th>Low</th><th>Close</th><th>Change</th></tr></thead><tbody>';
        var recent = data.slice(-10).reverse();
        recent.forEach(function(d, i) {
            var prevD = data[data.length - 10 + (9 - i) - 1];
            var ch = prevD ? ((d.c - prevD.c) / prevD.c * 100) : 0;
            var dt = new Date(d.t);
            var fmt = function(v) { return v >= 1 ? v.toFixed(2) : v.toFixed(4); };
            html += '<tr>' +
                '<td style="color:#888;font-size:11px">' + (dt.getMonth() + 1) + '/' + dt.getDate() + '</td>' +
                '<td style="font-family:monospace">' + fmt(d.o) + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">' + fmt(d.h) + '</td>' +
                '<td style="font-family:monospace;color:#ff4466">' + fmt(d.l) + '</td>' +
                '<td style="font-family:monospace;font-weight:600">' + fmt(d.c) + '</td>' +
                '<td style="font-family:monospace;color:' + (ch >= 0 ? '#00ff88' : '#ff4466') + '">' + (ch >= 0 ? '+' : '') + ch.toFixed(2) + '%</td></tr>';
        });
        html += '</tbody></table></div>';

        c.innerHTML = html;

        // Event handlers
        c.querySelectorAll('.combo-sym').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.symbol = btn.dataset.sym;
                self.save();
                self.render(containerId);
            });
        });
        c.querySelectorAll('.combo-tf').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.timeframe = btn.dataset.tf;
                self.save();
                self.render(containerId);
            });
        });
        c.querySelectorAll('.combo-ind').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var key = btn.dataset.ind;
                self.indicators[key] = !self.indicators[key];
                self.save();
                self.render(containerId);
            });
        });
    }
};

SolutionsHub.registerSolution('combo-chart', ComboChart, 'shared', {
    icon: '📊', name: 'Combo Chart', description: 'Multi-indicator trading chart with candlesticks, volume, MA, RSI, MACD and Bollinger Bands'
});
