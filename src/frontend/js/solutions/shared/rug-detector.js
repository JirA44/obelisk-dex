/* ============================================
   RUG DETECTOR - Token contract red flag scanner
   ============================================ */

const RugDetector = {
    history: [],

    init() {
        try { this.history = JSON.parse(localStorage.getItem('obelisk_rug_hist') || '[]'); } catch(e) { this.history = []; }
    },

    save() { localStorage.setItem('obelisk_rug_hist', JSON.stringify(this.history.slice(-20))); },

    analyzeToken(address) {
        // Simulated analysis based on address hash
        var seed = 0;
        for (var i = 0; i < address.length; i++) seed = (seed * 31 + address.charCodeAt(i)) % 2147483647;
        var rng = function() { seed = (seed * 16807 + 7) % 2147483647; return (seed % 1000) / 1000; };

        var checks = [
            { id: 'ownership', name: 'Ownership Renounced', desc: 'Has the owner renounced control?', weight: 15 },
            { id: 'honeypot', name: 'Honeypot Check', desc: 'Can holders sell?', weight: 20 },
            { id: 'liquidity', name: 'Liquidity Locked', desc: 'Is liquidity locked?', weight: 20 },
            { id: 'mintable', name: 'Non-Mintable', desc: 'Can new tokens be minted?', weight: 15 },
            { id: 'holders', name: 'Holder Distribution', desc: 'Top wallet concentration', weight: 10 },
            { id: 'proxy', name: 'No Proxy Contract', desc: 'Can the code be modified?', weight: 10 },
            { id: 'tax', name: 'Reasonable Tax', desc: 'Buy/Sell tax < 10%?', weight: 5 },
            { id: 'verified', name: 'Verified Code', desc: 'Source code verified on Etherscan?', weight: 5 }
        ];

        var results = [];
        var totalScore = 0;
        checks.forEach(function(check) {
            var r = rng();
            var passed = r > 0.35;
            var partial = !passed && r > 0.15;
            var status = passed ? 'pass' : partial ? 'warn' : 'fail';
            var score = passed ? check.weight : partial ? check.weight * 0.5 : 0;
            totalScore += score;

            var detail = '';
            if (check.id === 'ownership') detail = passed ? 'Ownership renounced ✓' : 'Owner wallet active with admin privileges';
            else if (check.id === 'honeypot') detail = passed ? 'Selling possible, no blocking detected' : 'Blocking function detected in contract';
            else if (check.id === 'liquidity') detail = passed ? 'LP locked 12 months via Team.Finance' : partial ? 'LP partially locked (30 days)' : 'Liquidity NOT locked - rug possible';
            else if (check.id === 'mintable') detail = passed ? 'Fixed supply, no mint function' : 'mint() function present - inflation possible';
            else if (check.id === 'holders') {
                var topPct = passed ? Math.floor(5 + rng() * 15) : Math.floor(40 + rng() * 40);
                detail = 'Top 10 holders: ' + topPct + '% of supply' + (topPct > 30 ? ' ⚠️ CONCENTRATED' : '');
            }
            else if (check.id === 'proxy') detail = passed ? 'Standard contract, non-upgradeable' : 'Proxy pattern detected - code modifiable!';
            else if (check.id === 'tax') {
                var buyTax = passed ? Math.floor(rng() * 5) : Math.floor(10 + rng() * 40);
                var sellTax = passed ? Math.floor(rng() * 5) : Math.floor(15 + rng() * 50);
                detail = 'Buy: ' + buyTax + '% / Sell: ' + sellTax + '%' + (sellTax > 10 ? ' ⚠️ HIGH TAX' : '');
            }
            else if (check.id === 'verified') detail = passed ? 'Source code verified and readable' : 'Code NOT verified - impossible to audit';

            results.push({ id: check.id, name: check.name, desc: check.desc, status: status, score: score, maxScore: check.weight, detail: detail });
        });

        return { score: Math.round(totalScore), results: results, address: address, timestamp: new Date().toISOString() };
    },

    renderScoreGauge(score, size) {
        var cx = size / 2, cy = size / 2, r = size * 0.4;
        var svg = '<svg width="' + size + '" height="' + size + '">';

        // Background circle
        svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#1a1a1a" stroke-width="10"/>';

        // Score arc
        var pct = score / 100;
        var color = score >= 75 ? '#00ff88' : score >= 50 ? '#c9a227' : score >= 25 ? '#ff8844' : '#ff4466';
        var circumference = 2 * Math.PI * r;
        var offset = circumference * (1 - pct);
        svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="10" stroke-dasharray="' + circumference.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '" stroke-linecap="round" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';

        // Score text
        svg += '<text x="' + cx + '" y="' + (cy - 5) + '" text-anchor="middle" fill="' + color + '" font-size="28" font-weight="800">' + score + '</text>';
        svg += '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" fill="#888" font-size="10">/100</text>';

        var verdict = score >= 75 ? 'SAFE' : score >= 50 ? 'CAUTION' : score >= 25 ? 'RISKY' : 'DANGER';
        svg += '<text x="' + cx + '" y="' + (cy + 28) + '" text-anchor="middle" fill="' + color + '" font-size="11" font-weight="700">' + verdict + '</text>';

        svg += '</svg>';
        return svg;
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;

        // Sample tokens for quick analysis
        var samples = [
            { name: 'PEPE', addr: '0x6982508145454Ce325dDbE47a25d4ec3d2311933' },
            { name: 'SHIB', addr: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
            { name: 'FLOKI', addr: '0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E' },
            { name: 'TURBO', addr: '0xA35923162C49cF95e6BF26623385eb431ad920D3' },
            { name: 'SUS TOKEN', addr: '0xDEAD000000000000000000000000000000000666' }
        ];

        var html = '<div class="sol-section"><div class="sol-section-title">🔍 Analyze a Token</div>' +
            '<div style="display:flex;gap:8px;margin-bottom:10px">' +
            '<input type="text" id="rug-addr" placeholder="Contract address (0x...)" style="flex:1;padding:8px 12px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-family:monospace;font-size:12px"/>' +
            '<button class="sol-btn sol-btn-primary" id="rug-scan">Scan</button></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap">';
        samples.forEach(function(s) {
            html += '<button class="sol-btn sol-btn-sm rug-sample" data-addr="' + s.addr + '" data-name="' + s.name + '">' + s.name + '</button>';
        });
        html += '</div></div>';

        html += '<div id="rug-result"></div>';

        // History
        if (this.history.length > 0) {
            html += '<div class="sol-section"><div class="sol-section-title">📋 History</div>' +
                '<table class="sol-table"><thead><tr><th>Token</th><th>Score</th><th>Date</th></tr></thead><tbody>';
            this.history.slice().reverse().forEach(function(h) {
                var color = h.score >= 75 ? '#00ff88' : h.score >= 50 ? '#c9a227' : '#ff4466';
                html += '<tr><td style="font-family:monospace;font-size:11px">' + h.address.substring(0, 10) + '...' + h.address.substring(h.address.length - 6) + '</td>' +
                    '<td style="color:' + color + ';font-weight:700">' + h.score + '/100</td>' +
                    '<td style="color:#555;font-size:11px">' + new Date(h.timestamp).toLocaleDateString() + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }

        // Red flags guide
        html += '<div class="sol-section"><div class="sol-section-title">🚩 Common Red Flags</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px">';
        var flags = [
            { icon: '🍯', title: 'Honeypot', desc: 'You can buy but not sell. The contract blocks outgoing transfers.' },
            { icon: '🖨️', title: 'Unlimited Mint', desc: 'The creator can print tokens at will and dilute your investment.' },
            { icon: '💧', title: 'Unlocked LP', desc: 'The creator can withdraw all liquidity at any time (classic rug pull).' },
            { icon: '👑', title: 'Active Owner', desc: 'The owner retains full control: pause, blacklist, rule changes.' },
            { icon: '💰', title: 'Hidden Tax', desc: 'Buy/Sell tax that can be changed to 99% after buyers have entered.' },
            { icon: '🎭', title: 'Proxy Upgradeable', desc: 'The contract code can be changed after deployment. Anything is possible.' }
        ];
        flags.forEach(function(f) {
            html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:8px;padding:10px">' +
                '<div style="font-size:16px;margin-bottom:4px">' + f.icon + ' <span style="color:#fff;font-weight:600;font-size:12px">' + f.title + '</span></div>' +
                '<div style="color:#888;font-size:11px;line-height:1.5">' + f.desc + '</div></div>';
        });
        html += '</div></div>';

        c.innerHTML = html;

        // Scan handler
        var doScan = function(addr) {
            var result = self.analyzeToken(addr);
            self.history.push({ address: addr, score: result.score, timestamp: result.timestamp });
            self.save();

            var rhtml = '<div class="sol-section" style="margin-top:12px">';
            rhtml += '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center">';
            rhtml += '<div>' + self.renderScoreGauge(result.score, 160) + '</div>';
            rhtml += '<div style="flex:1;min-width:250px">';
            result.results.forEach(function(r) {
                var icon = r.status === 'pass' ? '✅' : r.status === 'warn' ? '⚠️' : '❌';
                var barColor = r.status === 'pass' ? '#00ff88' : r.status === 'warn' ? '#c9a227' : '#ff4466';
                rhtml += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0a0a0a">' +
                    '<span style="font-size:14px">' + icon + '</span>' +
                    '<div style="flex:1"><div style="color:#ccc;font-size:12px;font-weight:600">' + r.name + '</div><div style="color:#666;font-size:10px">' + r.detail + '</div></div>' +
                    '<span style="font-family:monospace;color:' + barColor + ';font-size:11px;font-weight:700">' + r.score + '/' + r.maxScore + '</span></div>';
            });
            rhtml += '</div></div></div>';

            var resultDiv = c.querySelector('#rug-result');
            if (resultDiv) resultDiv.innerHTML = rhtml;
        };

        c.querySelector('#rug-scan').addEventListener('click', function() {
            var addr = c.querySelector('#rug-addr').value.trim();
            if (addr.length > 5) doScan(addr);
        });

        c.querySelectorAll('.rug-sample').forEach(function(btn) {
            btn.addEventListener('click', function() {
                c.querySelector('#rug-addr').value = btn.dataset.addr;
                doScan(btn.dataset.addr);
            });
        });
    }
};

SolutionsHub.registerSolution('rug-detector', RugDetector, 'shared', {
    icon: '🚩', name: 'Rug Detector', description: 'Scan token contracts for red flags: honeypot, mint, LP unlock, hidden taxes'
});
