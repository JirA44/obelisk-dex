/* ============================================
   COMPLIANCE CENTER - Institutional Module
   AML alerts, risk scores, audit timeline, dossier view
   Backend: /api/compliance/alerts, risk, dossiers, SOS
   ============================================ */

const ComplianceCenter = {
    alerts: [],
    riskScore: null,
    dossiers: [],
    currentTab: 'overview',
    API_BASE: '/api/compliance',

    init() {},

    async fetchData() {
        try {
            var [alerts, risk, dossiers] = await Promise.all([
                fetch(this.API_BASE + '/alerts').then(function(r) { return r.json(); }),
                fetch(this.API_BASE + '/risk').then(function(r) { return r.json(); }),
                fetch(this.API_BASE + '/dossiers').then(function(r) { return r.json(); })
            ]);
            return { alerts: alerts.alerts || [], risk: risk, dossiers: dossiers.dossiers || [] };
        } catch (e) {
            return this.getMockData();
        }
    },

    getMockData() {
        return {
            alerts: [
                { id: 'a1', severity: 'high', type: 'large_transfer', message: 'Unusual large transfer: 50 ETH to unknown wallet', wallet: '0xdef...789', timestamp: '2026-02-07T10:30:00Z', status: 'open' },
                { id: 'a2', severity: 'medium', type: 'velocity', message: 'High trade velocity: 45 trades in 1 hour', wallet: '0xabc...456', timestamp: '2026-02-06T15:45:00Z', status: 'investigating' },
                { id: 'a3', severity: 'low', type: 'geo', message: 'Login from new geographic region', wallet: '0x377...9140', timestamp: '2026-02-06T08:00:00Z', status: 'resolved' },
                { id: 'a4', severity: 'critical', type: 'sanctions', message: 'Wallet flagged on OFAC sanctions list', wallet: '0xfff...111', timestamp: '2026-02-05T22:00:00Z', status: 'escalated' }
            ],
            risk: {
                orgScore: 72,
                factors: [
                    { name: 'KYC Completion', score: 90, weight: 0.25 },
                    { name: 'Transaction Patterns', score: 65, weight: 0.3 },
                    { name: 'Geographic Risk', score: 80, weight: 0.15 },
                    { name: 'Counterparty Risk', score: 55, weight: 0.2 },
                    { name: 'Volume Anomalies', score: 70, weight: 0.1 }
                ]
            },
            dossiers: [
                { id: 'd1', wallet: '0xfff...111', status: 'flagged', reason: 'OFAC sanctions match', openedAt: '2026-02-05', notes: 3 },
                { id: 'd2', wallet: '0xdef...789', status: 'under_review', reason: 'Unusual transfer pattern', openedAt: '2026-02-07', notes: 1 }
            ]
        };
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        c.innerHTML = '<div style="text-align:center;padding:40px;color:#666">Loading compliance data...</div>';
        this.fetchData().then(function(data) {
            self.alerts = data.alerts;
            self.riskScore = data.risk;
            self.dossiers = data.dossiers;
            self.renderUI(c);
        });
    },

    renderUI(c) {
        var html = '<div class="sol-tabs">' +
            '<button class="sol-tab ' + (this.currentTab === 'overview' ? 'active' : '') + '" data-stab="overview">Overview</button>' +
            '<button class="sol-tab ' + (this.currentTab === 'alerts' ? 'active' : '') + '" data-stab="alerts">Alerts</button>' +
            '<button class="sol-tab ' + (this.currentTab === 'dossiers' ? 'active' : '') + '" data-stab="dossiers">Dossiers</button>' +
            '</div>';

        if (this.currentTab === 'overview') html += this.renderOverview();
        else if (this.currentTab === 'alerts') html += this.renderAlerts();
        else html += this.renderDossiers();

        c.innerHTML = html;
        this.bindEvents(c);
    },

    renderOverview() {
        var r = this.riskScore;
        var scoreColor = r.orgScore >= 75 ? '#00ff88' : r.orgScore >= 50 ? '#c9a227' : '#ff4466';
        var openAlerts = this.alerts.filter(function(a) { return a.status !== 'resolved'; });
        var criticals = this.alerts.filter(function(a) { return a.severity === 'critical'; });

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card">' + this.renderGaugeSVG(r.orgScore, scoreColor) + '<div class="sol-stat-label">Risk Score</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + openAlerts.length + '</div><div class="sol-stat-label">Open Alerts</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value red">' + criticals.length + '</div><div class="sol-stat-label">Critical</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.dossiers.length + '</div><div class="sol-stat-label">Active Dossiers</div></div>' +
            '</div>';

        // Risk factors
        html += '<div class="sol-section"><div class="sol-section-title">📊 Risk Factors</div>';
        r.factors.forEach(function(f) {
            var fColor = f.score >= 75 ? '#00ff88' : f.score >= 50 ? '#c9a227' : '#ff4466';
            html += '<div style="margin-bottom:12px">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
                '<span style="font-size:13px;color:#aaa">' + f.name + ' <span style="color:#555">(weight: ' + (f.weight * 100) + '%)</span></span>' +
                '<span style="font-family:monospace;color:' + fColor + '">' + f.score + '/100</span></div>' +
                '<div class="sol-progress"><div class="sol-progress-fill" style="width:' + f.score + '%;background:' + fColor + '"></div></div>' +
                '</div>';
        });
        html += '</div>';

        // Recent alerts timeline
        html += '<div class="sol-section"><div class="sol-section-title">🕐 Recent Alert Timeline</div>';
        this.alerts.slice(0, 5).forEach(function(a) {
            var sevColor = a.severity === 'critical' ? '#ff4466' : a.severity === 'high' ? '#ff8844' : a.severity === 'medium' ? '#c9a227' : '#00ff88';
            var statusTag = a.status === 'resolved' ? 'sol-tag-green' : a.status === 'escalated' ? 'sol-tag-red' : a.status === 'investigating' ? 'sol-tag-gold' : 'sol-tag-gray';
            html += '<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #111">' +
                '<div style="width:4px;border-radius:2px;background:' + sevColor + ';flex-shrink:0"></div>' +
                '<div style="flex:1">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
                '<span style="font-size:13px;color:#fff">' + a.message + '</span>' +
                '<span class="sol-tag ' + statusTag + '">' + a.status + '</span></div>' +
                '<div style="font-size:11px;color:#555">' + new Date(a.timestamp).toLocaleString() + ' | ' + a.wallet + '</div>' +
                '</div></div>';
        });
        html += '</div>';

        return html;
    },

    renderAlerts() {
        var html = '<div class="sol-section"><div class="sol-section-title">🚨 All Alerts (' + this.alerts.length + ')</div>' +
            '<table class="sol-table"><thead><tr><th>Severity</th><th>Type</th><th>Message</th><th>Wallet</th><th>Time</th><th>Status</th></tr></thead><tbody>';
        this.alerts.forEach(function(a) {
            var sevColor = a.severity === 'critical' ? 'sol-tag-red' : a.severity === 'high' ? 'sol-tag-gold' : a.severity === 'medium' ? 'sol-tag-gold' : 'sol-tag-green';
            var statusTag = a.status === 'resolved' ? 'sol-tag-green' : a.status === 'escalated' ? 'sol-tag-red' : a.status === 'investigating' ? 'sol-tag-gold' : 'sol-tag-gray';
            html += '<tr><td><span class="sol-tag ' + sevColor + '">' + a.severity + '</span></td>' +
                '<td>' + a.type + '</td>' +
                '<td style="font-size:13px">' + a.message + '</td>' +
                '<td style="font-family:monospace;font-size:11px">' + a.wallet + '</td>' +
                '<td style="color:#666;font-size:12px">' + new Date(a.timestamp).toLocaleString() + '</td>' +
                '<td><span class="sol-tag ' + statusTag + '">' + a.status + '</span></td></tr>';
        });
        html += '</tbody></table></div>';
        return html;
    },

    renderDossiers() {
        var html = '<div class="sol-section"><div class="sol-section-title">📁 Investigation Dossiers (' + this.dossiers.length + ')</div>';
        if (this.dossiers.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No active dossiers</div></div>';
        } else {
            this.dossiers.forEach(function(d) {
                var statusTag = d.status === 'flagged' ? 'sol-tag-red' : d.status === 'under_review' ? 'sol-tag-gold' : 'sol-tag-green';
                html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:12px">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
                    '<div><strong style="color:#fff">Dossier #' + d.id + '</strong>' +
                    '<span style="font-family:monospace;font-size:11px;color:#888;margin-left:12px">' + d.wallet + '</span></div>' +
                    '<span class="sol-tag ' + statusTag + '">' + d.status.replace('_', ' ') + '</span></div>' +
                    '<div style="font-size:13px;color:#aaa;margin-bottom:6px">Reason: ' + d.reason + '</div>' +
                    '<div style="font-size:11px;color:#555">Opened: ' + d.openedAt + ' | Notes: ' + d.notes + '</div>' +
                    '</div>';
            });
        }
        html += '</div>';
        return html;
    },

    renderGaugeSVG(score, color) {
        var circumference = 2 * Math.PI * 40;
        var offset = circumference - (score / 100) * circumference;
        return '<svg width="90" height="90" viewBox="0 0 100 100">' +
            '<circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" stroke-width="8"/>' +
            '<circle cx="50" cy="50" r="40" fill="none" stroke="' + color + '" stroke-width="8" ' +
            'stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '" ' +
            'stroke-linecap="round" transform="rotate(-90 50 50)"/>' +
            '<text x="50" y="55" text-anchor="middle" fill="' + color + '" font-size="22" font-weight="700" font-family="JetBrains Mono,monospace">' + score + '</text></svg>';
    },

    bindEvents(container) {
        var self = this;
        container.querySelectorAll('.sol-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.currentTab = this.dataset.stab;
                self.renderUI(container);
            });
        });
    }
};

SolutionsHub.registerSolution('compliance-center', ComplianceCenter, 'institutional', {
    icon: '🛡️', name: 'Compliance Center', description: 'AML monitoring, risk scoring, alert management and investigation dossiers'
});
