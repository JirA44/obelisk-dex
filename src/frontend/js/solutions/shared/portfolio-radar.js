/* ============================================
   PORTFOLIO RADAR - Strengths & Weaknesses
   Multi-axis radar + investment diagnostic
   ============================================ */

const PortfolioRadar = {
    init() {},

    getPortfolio() {
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.holdings) {
            return SimulatedPortfolio.holdings;
        }
        return [
            { asset: 'BTC', amount: 0.12, price: 97500 },
            { asset: 'ETH', amount: 2.5, price: 3400 },
            { asset: 'SOL', amount: 45, price: 190 },
            { asset: 'USDC', amount: 1200, price: 1 },
            { asset: 'DOGE', amount: 8000, price: 0.32 },
            { asset: 'PEPE', amount: 5000000, price: 0.000018 },
            { asset: 'SHIB', amount: 3000000, price: 0.000025 },
            { asset: 'ARB', amount: 500, price: 1.8 }
        ];
    },

    getAssetMeta() {
        return {
            BTC:  { cat: 'blue-chip', sector: 'store-of-value', volatility: 0.55, liquidity: 1.0, correlation: 1.0, marketCap: 'mega', stablecoin: false },
            ETH:  { cat: 'blue-chip', sector: 'smart-contract', volatility: 0.65, liquidity: 0.95, correlation: 0.85, marketCap: 'mega', stablecoin: false },
            SOL:  { cat: 'alt-L1', sector: 'smart-contract', volatility: 0.80, liquidity: 0.7, correlation: 0.75, marketCap: 'large', stablecoin: false },
            AVAX: { cat: 'alt-L1', sector: 'smart-contract', volatility: 0.78, liquidity: 0.6, correlation: 0.7, marketCap: 'large', stablecoin: false },
            LINK: { cat: 'infra', sector: 'oracle', volatility: 0.7, liquidity: 0.65, correlation: 0.6, marketCap: 'large', stablecoin: false },
            ARB:  { cat: 'alt-L2', sector: 'scaling', volatility: 0.85, liquidity: 0.5, correlation: 0.7, marketCap: 'mid', stablecoin: false },
            OP:   { cat: 'alt-L2', sector: 'scaling', volatility: 0.82, liquidity: 0.5, correlation: 0.68, marketCap: 'mid', stablecoin: false },
            MATIC:{ cat: 'alt-L2', sector: 'scaling', volatility: 0.75, liquidity: 0.6, correlation: 0.65, marketCap: 'mid', stablecoin: false },
            DOGE: { cat: 'meme', sector: 'meme', volatility: 0.90, liquidity: 0.7, correlation: 0.5, marketCap: 'large', stablecoin: false },
            SHIB: { cat: 'meme', sector: 'meme', volatility: 0.95, liquidity: 0.5, correlation: 0.55, marketCap: 'mid', stablecoin: false },
            PEPE: { cat: 'meme', sector: 'meme', volatility: 0.98, liquidity: 0.3, correlation: 0.4, marketCap: 'small', stablecoin: false },
            WIF:  { cat: 'meme', sector: 'meme', volatility: 0.97, liquidity: 0.25, correlation: 0.35, marketCap: 'small', stablecoin: false },
            BONK: { cat: 'meme', sector: 'meme', volatility: 0.96, liquidity: 0.2, correlation: 0.3, marketCap: 'small', stablecoin: false },
            USDC: { cat: 'stable', sector: 'stablecoin', volatility: 0.01, liquidity: 1.0, correlation: 0.0, marketCap: 'mega', stablecoin: true },
            USDT: { cat: 'stable', sector: 'stablecoin', volatility: 0.01, liquidity: 1.0, correlation: 0.0, marketCap: 'mega', stablecoin: true },
            DAI:  { cat: 'stable', sector: 'stablecoin', volatility: 0.02, liquidity: 0.85, correlation: 0.0, marketCap: 'large', stablecoin: true },
            BNB:  { cat: 'exchange', sector: 'exchange', volatility: 0.6, liquidity: 0.8, correlation: 0.7, marketCap: 'mega', stablecoin: false },
            UNI:  { cat: 'defi', sector: 'dex', volatility: 0.75, liquidity: 0.6, correlation: 0.65, marketCap: 'mid', stablecoin: false },
            AAVE: { cat: 'defi', sector: 'lending', volatility: 0.72, liquidity: 0.55, correlation: 0.6, marketCap: 'mid', stablecoin: false },
            MKR:  { cat: 'defi', sector: 'lending', volatility: 0.68, liquidity: 0.5, correlation: 0.55, marketCap: 'mid', stablecoin: false }
        };
    },

    analyzePortfolio(holdings) {
        var meta = this.getAssetMeta();
        var totalValue = 0;
        var positions = [];
        holdings.forEach(function(h) {
            var val = h.amount * h.price;
            if (val < 0.01) return;
            totalValue += val;
            positions.push({ asset: h.asset, value: val, meta: meta[h.asset] || { cat: 'unknown', sector: 'unknown', volatility: 0.8, liquidity: 0.3, correlation: 0.5, marketCap: 'small', stablecoin: false } });
        });
        if (totalValue === 0) totalValue = 1;

        // 1. DIVERSIFICATION (0-100)
        var categories = {};
        var sectors = {};
        positions.forEach(function(p) {
            var pct = p.value / totalValue;
            categories[p.meta.cat] = (categories[p.meta.cat] || 0) + pct;
            sectors[p.meta.sector] = (sectors[p.meta.sector] || 0) + pct;
        });
        var hhi = 0; // Herfindahl-Hirschman Index
        positions.forEach(function(p) {
            var pct = p.value / totalValue;
            hhi += pct * pct;
        });
        var nAssets = positions.length;
        var catCount = Object.keys(categories).length;
        var secCount = Object.keys(sectors).length;
        var maxConcentration = 0;
        positions.forEach(function(p) { var pct = p.value / totalValue; if (pct > maxConcentration) maxConcentration = pct; });
        // HHI: 1/n = perfectly diversified, 1 = single asset
        var hhiNorm = nAssets > 1 ? Math.max(0, 1 - (hhi - 1/nAssets) / (1 - 1/nAssets)) : 0;
        var diversScore = Math.min(100, hhiNorm * 40 + Math.min(catCount / 5, 1) * 30 + Math.min(secCount / 6, 1) * 20 + Math.min(nAssets / 8, 1) * 10);

        // 2. RISK MANAGEMENT (0-100, higher = better managed)
        var weightedVol = 0;
        var stablePct = 0;
        positions.forEach(function(p) {
            var pct = p.value / totalValue;
            weightedVol += pct * p.meta.volatility;
            if (p.meta.stablecoin) stablePct += pct;
        });
        var memePct = categories['meme'] || 0;
        var riskScore = Math.max(0, Math.min(100,
            (1 - weightedVol) * 40 +
            Math.min(stablePct / 0.2, 1) * 25 +
            (1 - memePct) * 20 +
            (1 - maxConcentration) * 15
        ));

        // 3. LIQUIDITY (0-100)
        var weightedLiq = 0;
        positions.forEach(function(p) {
            var pct = p.value / totalValue;
            weightedLiq += pct * p.meta.liquidity;
        });
        var liqScore = weightedLiq * 100;

        // 4. YIELD POTENTIAL (0-100)
        var hasDefi = categories['defi'] ? 1 : 0;
        var hasStaking = positions.some(function(p) { return p.asset === 'ETH' || p.asset === 'SOL' || p.asset === 'AVAX'; }) ? 1 : 0;
        var growthPct = 0;
        positions.forEach(function(p) { if (!p.meta.stablecoin) growthPct += p.value / totalValue; });
        var yieldScore = Math.min(100, growthPct * 35 + hasStaking * 25 + hasDefi * 20 + Math.min(nAssets / 6, 1) * 20);

        // 5. STABILITY (0-100)
        var blueChipPct = (categories['blue-chip'] || 0) + stablePct;
        var stabilityScore = Math.min(100,
            blueChipPct * 50 +
            stablePct * 30 +
            (1 - weightedVol) * 20
        ) * 100 / 100;
        stabilityScore = Math.min(100, stabilityScore);

        // 6. CORRELATION RISK (0-100, higher = less correlated = better)
        var weightedCorr = 0;
        var corrPairs = 0;
        for (var i = 0; i < positions.length; i++) {
            for (var j = i + 1; j < positions.length; j++) {
                var w = (positions[i].value / totalValue) * (positions[j].value / totalValue);
                weightedCorr += w * Math.min(positions[i].meta.correlation, positions[j].meta.correlation);
                corrPairs += w;
            }
        }
        var avgCorr = corrPairs > 0 ? weightedCorr / corrPairs : 0.5;
        var corrScore = (1 - avgCorr) * 100;

        // GLOBAL SCORE
        var globalScore = Math.round(diversScore * 0.25 + riskScore * 0.25 + liqScore * 0.15 + yieldScore * 0.1 + stabilityScore * 0.15 + corrScore * 0.1);

        return {
            scores: {
                diversification: Math.round(diversScore),
                risk: Math.round(riskScore),
                liquidity: Math.round(liqScore),
                yield: Math.round(yieldScore),
                stability: Math.round(stabilityScore),
                correlation: Math.round(corrScore),
                global: globalScore
            },
            details: {
                totalValue: totalValue,
                nAssets: nAssets,
                catCount: catCount,
                secCount: secCount,
                maxConcentration: maxConcentration,
                hhi: hhi,
                weightedVol: weightedVol,
                stablePct: stablePct,
                memePct: memePct,
                blueChipPct: blueChipPct - stablePct,
                avgCorr: avgCorr,
                positions: positions,
                categories: categories,
                sectors: sectors
            }
        };
    },

    generateWarnings(analysis) {
        var s = analysis.scores;
        var d = analysis.details;
        var warnings = [];

        // DIVERSIFICATION
        if (s.diversification < 30) {
            warnings.push({ severity: 'critical', axis: 'Diversification', icon: '🔴', title: 'Portfolio too concentrated', detail: 'Only ' + d.nAssets + ' assets across ' + d.catCount + ' categories. Top position represents ' + (d.maxConcentration * 100).toFixed(0) + '% of the portfolio.', fix: 'Spread across 6-8+ assets in 4+ categories (blue-chip, DeFi, L2, stable)' });
        } else if (s.diversification < 55) {
            warnings.push({ severity: 'warning', axis: 'Diversification', icon: '🟡', title: 'Insufficient diversification', detail: 'Only ' + d.catCount + ' categories. HHI = ' + (d.hhi * 10000).toFixed(0) + ' (ideal < 1500).', fix: 'Add assets in uncorrelated sectors (oracle, infra, DeFi)' });
        } else {
            warnings.push({ severity: 'ok', axis: 'Diversification', icon: '🟢', title: 'Good diversification', detail: d.nAssets + ' assets spread across ' + d.catCount + ' categories and ' + d.secCount + ' sectors.', fix: null });
        }

        // RISK
        if (s.risk < 30) {
            warnings.push({ severity: 'critical', axis: 'Risk', icon: '🔴', title: 'Excessive risk!', detail: 'Weighted average volatility: ' + (d.weightedVol * 100).toFixed(0) + '%. ' + (d.memePct > 0.3 ? (d.memePct * 100).toFixed(0) + '% in memecoins!' : 'Concentration too high.'), fix: 'Reduce memecoins to <10%, increase stablecoins to 15-20%, diversify positions' });
        } else if (s.risk < 55) {
            warnings.push({ severity: 'warning', axis: 'Risk', icon: '🟡', title: 'High risk profile', detail: 'Weighted volatility: ' + (d.weightedVol * 100).toFixed(0) + '%. Stables: ' + (d.stablePct * 100).toFixed(0) + '%.', fix: 'Aim for 15-20% in stablecoins as a safety cushion' });
        } else {
            warnings.push({ severity: 'ok', axis: 'Risk', icon: '🟢', title: 'Risk well managed', detail: 'Moderate weighted volatility (' + (d.weightedVol * 100).toFixed(0) + '%) with ' + (d.stablePct * 100).toFixed(0) + '% in stables.', fix: null });
        }

        // LIQUIDITY
        if (s.liquidity < 40) {
            warnings.push({ severity: 'critical', axis: 'Liquidity', icon: '🔴', title: 'Dangerously low liquidity', detail: 'Many assets with low liquidity. High slippage risk in case of urgent sale.', fix: 'Favor assets with high market cap and high volume' });
        } else if (s.liquidity < 65) {
            warnings.push({ severity: 'warning', axis: 'Liquidity', icon: '🟡', title: 'Average liquidity', detail: 'Liquidity score ' + s.liquidity + '/100. Some assets may be difficult to sell quickly.', fix: 'Limit small-caps to 10-15% of the portfolio' });
        } else {
            warnings.push({ severity: 'ok', axis: 'Liquidity', icon: '🟢', title: 'Good liquidity', detail: 'Portfolio mainly composed of liquid assets (score ' + s.liquidity + '/100).', fix: null });
        }

        // STABILITY
        if (s.stability < 30) {
            warnings.push({ severity: 'critical', axis: 'Stability', icon: '🔴', title: 'Very unstable portfolio', detail: 'Only ' + (d.blueChipPct * 100).toFixed(0) + '% in blue-chips and ' + (d.stablePct * 100).toFixed(0) + '% in stables.', fix: 'Aim for 40%+ in BTC+ETH as a stable portfolio foundation' });
        } else if (s.stability < 55) {
            warnings.push({ severity: 'warning', axis: 'Stability', icon: '🟡', title: 'Stability needs improvement', detail: 'Insufficient blue-chip foundation. Speculative assets dominate.', fix: 'Increase BTC/ETH to 50-60% of portfolio for a solid base' });
        } else {
            warnings.push({ severity: 'ok', axis: 'Stability', icon: '🟢', title: 'Solid foundation', detail: (d.blueChipPct * 100).toFixed(0) + '% in blue-chips + ' + (d.stablePct * 100).toFixed(0) + '% stables. Solid base.', fix: null });
        }

        // CORRELATION
        if (s.correlation < 30) {
            warnings.push({ severity: 'warning', axis: 'Correlation', icon: '🟡', title: 'Assets too correlated', detail: 'Average correlation: ' + (d.avgCorr * 100).toFixed(0) + '%. Your assets move together = no protection in a bear market.', fix: 'Add uncorrelated assets: stablecoins, tokenized gold, assets from different sectors' });
        } else {
            warnings.push({ severity: 'ok', axis: 'Correlation', icon: '🟢', title: 'Good decorrelation', detail: 'Average correlation: ' + (d.avgCorr * 100).toFixed(0) + '%. Assets do not all move together.', fix: null });
        }

        // YIELD
        if (s.yield < 35) {
            warnings.push({ severity: 'info', axis: 'Yield', icon: '💡', title: 'Limited yield potential', detail: 'Few assets generating passive yield. Idle capital.', fix: 'Stake ETH/SOL, use DeFi vaults, or stablecoin lending' });
        } else {
            warnings.push({ severity: 'ok', axis: 'Yield', icon: '🟢', title: 'Good yield potential', detail: 'Balanced mix between growth and passive yield.', fix: null });
        }

        // SPECIAL: Meme overload
        if (d.memePct > 0.25) {
            warnings.push({ severity: 'critical', axis: 'Memecoins', icon: '🚨', title: (d.memePct * 100).toFixed(0) + '% in MEMECOINS!', detail: 'Memecoins are extremely volatile. An 80-90% crash is common. Risk of near-total loss.', fix: 'Limit memecoins to 5-10% maximum of portfolio (money you can afford to lose)' });
        }

        // SPECIAL: No stablecoins
        if (d.stablePct < 0.05) {
            warnings.push({ severity: 'warning', axis: 'Safety', icon: '⚠️', title: 'No stable reserve', detail: 'Without stablecoins, you cannot take advantage of dips or protect your gains.', fix: 'Keep 10-20% in USDC/USDT to buy corrections' });
        }

        // SPECIAL: Single asset > 50%
        if (d.maxConcentration > 0.5) {
            var topAsset = '';
            d.positions.forEach(function(p) { if (p.value / d.totalValue >= d.maxConcentration - 0.01) topAsset = p.asset; });
            warnings.push({ severity: 'critical', axis: 'Concentration', icon: '🎯', title: topAsset + ' = ' + (d.maxConcentration * 100).toFixed(0) + '% of portfolio', detail: 'A single asset represents more than half. If ' + topAsset + ' drops, the entire portfolio suffers.', fix: 'Spread across multiple assets. Rule: no single asset > 30-35% of portfolio' });
        }

        return warnings;
    },

    renderRadar(scores, size) {
        var axes = [
            { key: 'diversification', label: 'Diversification', angle: -90 },
            { key: 'risk', label: 'Risk Mgmt', angle: -30 },
            { key: 'liquidity', label: 'Liquidity', angle: 30 },
            { key: 'yield', label: 'Yield', angle: 90 },
            { key: 'stability', label: 'Stability', angle: 150 },
            { key: 'correlation', label: 'Decorrelation', angle: 210 }
        ];
        var cx = size / 2, cy = size / 2;
        var maxR = size * 0.38;
        var svg = '<svg width="' + size + '" height="' + size + '">';

        // Background rings
        for (var ring = 1; ring <= 5; ring++) {
            var r = (ring / 5) * maxR;
            var ringPath = '';
            axes.forEach(function(a, i) {
                var rad = a.angle * Math.PI / 180;
                var x = cx + r * Math.cos(rad);
                var y = cy + r * Math.sin(rad);
                ringPath += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
            });
            ringPath += 'Z';
            svg += '<path d="' + ringPath + '" fill="none" stroke="#1a1a1a" stroke-width="1"/>';
        }

        // Axis lines + labels
        axes.forEach(function(a) {
            var rad = a.angle * Math.PI / 180;
            var x2 = cx + maxR * Math.cos(rad);
            var y2 = cy + maxR * Math.sin(rad);
            svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#222" stroke-width="1"/>';
            var lx = cx + (maxR + 22) * Math.cos(rad);
            var ly = cy + (maxR + 22) * Math.sin(rad);
            var val = scores[a.key] || 0;
            var valColor = val >= 65 ? '#00ff88' : val >= 40 ? '#c9a227' : '#ff4466';
            svg += '<text x="' + lx.toFixed(1) + '" y="' + (ly - 5).toFixed(1) + '" text-anchor="middle" fill="#aaa" font-size="10" font-weight="500">' + a.label + '</text>';
            svg += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 9).toFixed(1) + '" text-anchor="middle" fill="' + valColor + '" font-size="12" font-weight="700">' + val + '</text>';
        });

        // Data polygon
        var dataPath = '';
        axes.forEach(function(a, i) {
            var val = Math.max(0, Math.min(100, scores[a.key] || 0));
            var r = (val / 100) * maxR;
            var rad = a.angle * Math.PI / 180;
            var x = cx + r * Math.cos(rad);
            var y = cy + r * Math.sin(rad);
            dataPath += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        dataPath += 'Z';

        // Color based on global score
        var g = scores.global || 0;
        var fillColor = g >= 65 ? '#00ff88' : g >= 40 ? '#c9a227' : '#ff4466';
        svg += '<path d="' + dataPath + '" fill="' + fillColor + '" opacity="0.15" stroke="' + fillColor + '" stroke-width="2"/>';

        // Data points
        axes.forEach(function(a) {
            var val = Math.max(0, Math.min(100, scores[a.key] || 0));
            var r = (val / 100) * maxR;
            var rad = a.angle * Math.PI / 180;
            var x = cx + r * Math.cos(rad);
            var y = cy + r * Math.sin(rad);
            var ptColor = val >= 65 ? '#00ff88' : val >= 40 ? '#c9a227' : '#ff4466';
            svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4" fill="' + ptColor + '" stroke="#000" stroke-width="1.5"/>';
        });

        // Center score
        svg += '<text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" fill="' + fillColor + '" font-size="22" font-weight="800">' + g + '</text>';
        svg += '<text x="' + cx + '" y="' + (cy + 10) + '" text-anchor="middle" fill="#666" font-size="9">GLOBAL SCORE</text>';

        // Ring labels (20, 40, 60, 80, 100)
        for (var ring = 1; ring <= 5; ring++) {
            var r = (ring / 5) * maxR;
            svg += '<text x="' + (cx + 3) + '" y="' + (cy - r + 3) + '" fill="#333" font-size="7">' + (ring * 20) + '</text>';
        }

        svg += '</svg>';
        return svg;
    },

    renderCategoryDonut(categories, totalValue, size) {
        var catColors = {
            'blue-chip': '#00d4ff', 'stable': '#00ff88', 'alt-L1': '#c9a227',
            'alt-L2': '#ff8844', 'meme': '#ff4466', 'defi': '#8855ff',
            'infra': '#44ccaa', 'exchange': '#ffcc00', 'unknown': '#555'
        };
        var catLabels = {
            'blue-chip': 'Blue-Chip', 'stable': 'Stablecoins', 'alt-L1': 'Alt L1',
            'alt-L2': 'Alt L2', 'meme': 'Memecoins', 'defi': 'DeFi',
            'infra': 'Infrastructure', 'exchange': 'Exchange', 'unknown': 'Other'
        };
        var entries = [];
        Object.keys(categories).forEach(function(k) {
            if (categories[k] > 0.005) entries.push({ key: k, pct: categories[k] });
        });
        entries.sort(function(a, b) { return b.pct - a.pct; });

        var cx = size / 2, cy = size / 2, r = size * 0.36;
        var svg = '<svg width="' + size + '" height="' + size + '">';
        var angle = -Math.PI / 2;
        entries.forEach(function(e) {
            var sweep = e.pct * Math.PI * 2;
            var x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
            angle += sweep;
            var x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
            var large = sweep > Math.PI ? 1 : 0;
            var color = catColors[e.key] || '#555';
            svg += '<path d="M' + cx + ',' + cy + ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + r + ',' + r + ' 0 ' + large + ',1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z" fill="' + color + '" opacity="0.75"/>';
            // Label if segment big enough
            if (e.pct > 0.08) {
                var midAngle = angle - sweep / 2;
                var lx = cx + r * 0.65 * Math.cos(midAngle);
                var ly = cy + r * 0.65 * Math.sin(midAngle);
                svg += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" fill="#fff" font-size="9" font-weight="600">' + (e.pct * 100).toFixed(0) + '%</text>';
            }
        });
        svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.5) + '" fill="#0a0a0a"/>';
        svg += '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" fill="#888" font-size="9">Categories</text>';
        svg += '</svg>';

        // Legend
        var legend = '<div style="display:flex;flex-direction:column;gap:4px;min-width:140px">';
        entries.forEach(function(e) {
            var color = catColors[e.key] || '#555';
            var label = catLabels[e.key] || e.key;
            legend += '<div style="display:flex;align-items:center;gap:6px;font-size:12px">' +
                '<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + color + '"></span>' +
                '<span style="color:#aaa;flex:1">' + label + '</span>' +
                '<span style="font-family:monospace;color:' + color + ';font-weight:600">' + (e.pct * 100).toFixed(1) + '%</span></div>';
        });
        legend += '</div>';

        return { svg: svg, legend: legend };
    },

    renderScoreBars(scores) {
        var axes = [
            { key: 'diversification', label: 'Diversification', icon: '🎯' },
            { key: 'risk', label: 'Risk Management', icon: '🛡️' },
            { key: 'liquidity', label: 'Liquidity', icon: '💧' },
            { key: 'yield', label: 'Yield Potential', icon: '📈' },
            { key: 'stability', label: 'Stability', icon: '🏗️' },
            { key: 'correlation', label: 'Decorrelation', icon: '🔗' }
        ];
        var html = '';
        axes.forEach(function(a) {
            var val = scores[a.key] || 0;
            var color = val >= 65 ? '#00ff88' : val >= 40 ? '#c9a227' : '#ff4466';
            var grade = val >= 80 ? 'A' : val >= 65 ? 'B' : val >= 50 ? 'C' : val >= 35 ? 'D' : 'F';
            html += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #111">' +
                '<span style="width:20px;text-align:center">' + a.icon + '</span>' +
                '<span style="width:150px;color:#ccc;font-size:12px">' + a.label + '</span>' +
                '<div style="flex:1;height:8px;background:#111;border-radius:4px;overflow:hidden">' +
                '<div style="height:100%;width:' + val + '%;background:' + color + ';border-radius:4px;transition:width 0.5s"></div></div>' +
                '<span style="width:35px;text-align:right;font-family:monospace;color:' + color + ';font-weight:700;font-size:13px">' + val + '</span>' +
                '<span style="width:22px;text-align:center;font-weight:700;font-size:12px;color:' + color + ';background:' + color + '15;padding:2px 4px;border-radius:3px">' + grade + '</span></div>';
        });
        return html;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var holdings = this.getPortfolio();
        var analysis = this.analyzePortfolio(holdings);
        var warnings = this.generateWarnings(analysis);
        var s = analysis.scores;
        var d = analysis.details;

        var criticalCount = warnings.filter(function(w) { return w.severity === 'critical'; }).length;
        var warningCount = warnings.filter(function(w) { return w.severity === 'warning'; }).length;

        // Global score + grade
        var grade = s.global >= 80 ? 'A' : s.global >= 65 ? 'B' : s.global >= 50 ? 'C' : s.global >= 35 ? 'D' : 'F';
        var gradeColor = s.global >= 65 ? '#00ff88' : s.global >= 40 ? '#c9a227' : '#ff4466';
        var verdict = s.global >= 75 ? 'Solid and well-managed portfolio' :
                      s.global >= 55 ? 'Decent portfolio, improvements possible' :
                      s.global >= 40 ? 'Warning: significant weaknesses detected' :
                      'Alert: high-risk portfolio, action required';

        // Stats row
        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + gradeColor + ';font-size:28px">' + grade + '</div><div class="sol-stat-label">Global Score (' + s.global + '/100)</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + criticalCount + '</div><div class="sol-stat-label">Critical Alerts</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + warningCount + '</div><div class="sol-stat-label">Warnings</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + d.nAssets + '</div><div class="sol-stat-label">Assets / ' + d.catCount + ' Cat.</div></div></div>';

        // Verdict
        html += '<div style="text-align:center;padding:8px 16px;margin-bottom:12px;background:' + gradeColor + '10;border:1px solid ' + gradeColor + '30;border-radius:8px;color:' + gradeColor + ';font-size:13px;font-weight:600">' + verdict + '</div>';

        // RADAR + Category donut side by side
        var donut = this.renderCategoryDonut(d.categories, d.totalValue, 170);
        html += '<div class="sol-section"><div class="sol-section-title">🎯 Strengths & Weaknesses Radar</div>' +
            '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center">' +
            '<div>' + this.renderRadar(s, 320) + '</div>' +
            '<div style="display:flex;flex-direction:column;gap:12px;align-items:center">' + donut.svg + donut.legend + '</div></div></div>';

        // Score bars
        html += '<div class="sol-section"><div class="sol-section-title">📊 Detailed Scores</div>' +
            '<div style="padding:4px 0">' + this.renderScoreBars(s) + '</div></div>';

        // WARNINGS & RECOMMENDATIONS
        html += '<div class="sol-section"><div class="sol-section-title">⚠️ Diagnostic & Recommendations</div>';

        // Critical first
        var sortedWarnings = warnings.sort(function(a, b) {
            var order = { critical: 0, warning: 1, info: 2, ok: 3 };
            return (order[a.severity] || 3) - (order[b.severity] || 3);
        });

        sortedWarnings.forEach(function(w) {
            var bgColor = w.severity === 'critical' ? '#ff446615' : w.severity === 'warning' ? '#c9a22715' : w.severity === 'info' ? '#00d4ff10' : '#00ff8808';
            var borderColor = w.severity === 'critical' ? '#ff446640' : w.severity === 'warning' ? '#c9a22740' : w.severity === 'info' ? '#00d4ff30' : '#00ff8820';
            var titleColor = w.severity === 'critical' ? '#ff4466' : w.severity === 'warning' ? '#c9a227' : w.severity === 'info' ? '#00d4ff' : '#00ff88';

            html += '<div style="background:' + bgColor + ';border:1px solid ' + borderColor + ';border-radius:8px;padding:12px 14px;margin-bottom:8px">' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
                '<span style="font-size:16px">' + w.icon + '</span>' +
                '<span style="color:' + titleColor + ';font-weight:700;font-size:13px">' + w.title + '</span>' +
                '<span class="sol-tag" style="font-size:9px;margin-left:auto;color:#888;border-color:#333">' + w.axis + '</span></div>' +
                '<div style="color:#999;font-size:12px;line-height:1.5;margin-left:28px">' + w.detail + '</div>';
            if (w.fix) {
                html += '<div style="color:#aaa;font-size:11px;margin-top:6px;margin-left:28px;padding:6px 10px;background:#ffffff06;border-radius:4px;border-left:2px solid ' + titleColor + '">' +
                    '<span style="color:' + titleColor + ';font-weight:600">Recommendation:</span> ' + w.fix + '</div>';
            }
            html += '</div>';
        });
        html += '</div>';

        // Positions breakdown table
        html += '<div class="sol-section"><div class="sol-section-title">📋 Position Details</div>' +
            '<table class="sol-table"><thead><tr><th>Asset</th><th>Value</th><th>Weight</th><th>Category</th><th>Volatility</th><th>Liquidity</th><th>Risk</th></tr></thead><tbody>';
        var sortedPos = d.positions.slice().sort(function(a, b) { return b.value - a.value; });
        sortedPos.forEach(function(p) {
            var pct = (p.value / d.totalValue * 100);
            var volColor = p.meta.volatility > 0.85 ? '#ff4466' : p.meta.volatility > 0.65 ? '#c9a227' : '#00ff88';
            var liqColor = p.meta.liquidity > 0.7 ? '#00ff88' : p.meta.liquidity > 0.4 ? '#c9a227' : '#ff4466';
            var catColors = { 'blue-chip': '#00d4ff', 'stable': '#00ff88', 'meme': '#ff4466', 'alt-L1': '#c9a227', 'alt-L2': '#ff8844', 'defi': '#8855ff', 'infra': '#44ccaa' };
            var riskLevel = p.meta.volatility > 0.85 ? 'Very High' : p.meta.volatility > 0.7 ? 'High' : p.meta.volatility > 0.5 ? 'Medium' : p.meta.volatility > 0.1 ? 'Low' : 'None';
            var riskColor = p.meta.volatility > 0.85 ? '#ff4466' : p.meta.volatility > 0.7 ? '#ff8844' : p.meta.volatility > 0.5 ? '#c9a227' : '#00ff88';
            html += '<tr><td><strong>' + p.asset + '</strong></td>' +
                '<td style="font-family:monospace">$' + p.value.toFixed(0) + '</td>' +
                '<td style="font-family:monospace;color:' + (pct > 30 ? '#ff4466' : pct > 20 ? '#c9a227' : '#888') + '">' + pct.toFixed(1) + '%</td>' +
                '<td><span class="sol-tag" style="font-size:10px;color:' + (catColors[p.meta.cat] || '#888') + ';border-color:' + (catColors[p.meta.cat] || '#333') + '">' + p.meta.cat + '</span></td>' +
                '<td style="font-family:monospace;color:' + volColor + '">' + (p.meta.volatility * 100).toFixed(0) + '%</td>' +
                '<td style="font-family:monospace;color:' + liqColor + '">' + (p.meta.liquidity * 100).toFixed(0) + '%</td>' +
                '<td style="color:' + riskColor + ';font-weight:600;font-size:11px">' + riskLevel + '</td></tr>';
        });
        html += '</tbody></table></div>';

        // Ideal allocation suggestion
        html += '<div class="sol-section"><div class="sol-section-title">💡 Suggested Ideal Allocation</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;padding:8px 0">';
        var ideal = [
            { cat: 'BTC/ETH', pct: '40-50%', color: '#00d4ff', desc: 'Stable foundation' },
            { cat: 'Alt L1/L2', pct: '15-25%', color: '#c9a227', desc: 'Growth' },
            { cat: 'DeFi/Infra', pct: '10-15%', color: '#8855ff', desc: 'Yield' },
            { cat: 'Stablecoins', pct: '10-20%', color: '#00ff88', desc: 'Safety' },
            { cat: 'Speculative', pct: '5-10%', color: '#ff4466', desc: 'Alpha' }
        ];
        ideal.forEach(function(i) {
            html += '<div style="flex:1;min-width:100px;background:#111;border:1px solid #222;border-radius:8px;padding:10px;text-align:center">' +
                '<div style="color:' + i.color + ';font-weight:700;font-size:14px">' + i.pct + '</div>' +
                '<div style="color:#fff;font-size:11px;font-weight:600;margin:2px 0">' + i.cat + '</div>' +
                '<div style="color:#666;font-size:10px">' + i.desc + '</div></div>';
        });
        html += '</div></div>';

        c.innerHTML = html;
    }
};

SolutionsHub.registerSolution('portfolio-radar', PortfolioRadar, 'shared', {
    icon: '🎯', name: 'Portfolio Radar', description: 'Analyze portfolio strengths & weaknesses with multi-axis radar, diagnostics and recommendations'
});
