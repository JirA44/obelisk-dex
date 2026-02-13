/* ============================================
   LAUNCHPAD - Token launch platform (IDO/ILO)
   ============================================ */

const Launchpad = {
    participated: [],

    init() {
        try { this.participated = JSON.parse(localStorage.getItem('obelisk_launchpad') || '[]'); } catch(e) { this.participated = []; }
    },

    save() { localStorage.setItem('obelisk_launchpad', JSON.stringify(this.participated)); },

    getProjects() {
        return [
            { id: 'lp1', name: 'NexaAI', ticker: 'NEXA', category: 'AI', logo: '🤖', price: '$0.025', fdv: '$25M', raised: 480000, hardCap: 500000, status: 'live', endsIn: '2h 14m', allocation: '$500', vesting: '25% TGE, 12mo linear', tier: 'Gold' },
            { id: 'lp2', name: 'ChainGuard', ticker: 'CGD', category: 'Security', logo: '🛡️', price: '$0.10', fdv: '$100M', raised: 750000, hardCap: 750000, status: 'filled', endsIn: '-', allocation: '$1,000', vesting: '20% TGE, 6mo linear', tier: 'Diamond' },
            { id: 'lp3', name: 'DeFiVerse', ticker: 'DFV', category: 'DeFi', logo: '🌐', price: '$0.50', fdv: '$50M', raised: 0, hardCap: 300000, status: 'upcoming', startsIn: '3d 8h', allocation: '$250', vesting: '100% TGE', tier: 'Silver' },
            { id: 'lp4', name: 'MetaYield', ticker: 'MYLD', category: 'Yield', logo: '💎', price: '$0.005', fdv: '$5M', raised: 120000, hardCap: 200000, status: 'live', endsIn: '18h 32m', allocation: '$200', vesting: '50% TGE, 3mo linear', tier: 'Bronze' },
            { id: 'lp5', name: 'ZKProve', ticker: 'ZKP', category: 'Infrastructure', logo: '🔐', price: '$1.20', fdv: '$120M', raised: 1000000, hardCap: 1000000, status: 'completed', roi: '+340%', allocation: '$2,000', vesting: '15% TGE, 18mo linear', tier: 'Diamond' },
            { id: 'lp6', name: 'SocialFi+', ticker: 'SOF', category: 'Social', logo: '📱', price: '$0.08', fdv: '$40M', raised: 380000, hardCap: 400000, status: 'completed', roi: '-25%', allocation: '$500', vesting: '30% TGE, 6mo linear', tier: 'Gold' }
        ];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var projects = this.getProjects();
        var self = this;
        var liveCount = projects.filter(function(p) { return p.status === 'live'; }).length;
        var totalRaised = projects.reduce(function(s, p) { return s + p.raised; }, 0);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + liveCount + '</div><div class="sol-stat-label">Live Sales</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + projects.length + '</div><div class="sol-stat-label">Total Projects</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">$' + (totalRaised / 1000000).toFixed(1) + 'M</div><div class="sol-stat-label">Total Raised</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + this.participated.length + '</div><div class="sol-stat-label">Participated</div></div></div>';

        var tabs = ['Live', 'Upcoming', 'Completed'];
        html += '<div style="display:flex;gap:8px;margin-bottom:16px">';
        tabs.forEach(function(tab, i) {
            html += '<button class="sol-btn sol-btn-sm ' + (i === 0 ? 'sol-btn-primary' : 'sol-btn-outline') + ' lpad-tab" data-tab="' + tab.toLowerCase() + '">' + tab + '</button>';
        });
        html += '</div>';

        ['live', 'upcoming', 'completed', 'filled'].forEach(function(status) {
            var filtered = projects.filter(function(p) {
                if (status === 'live') return p.status === 'live';
                if (status === 'upcoming') return p.status === 'upcoming';
                return p.status === 'completed' || p.status === 'filled';
            });
            var tabGroup = status === 'filled' ? 'completed' : status;
            if (status === 'filled') return;
            html += '<div class="lpad-section" data-group="' + tabGroup + '" style="' + (tabGroup !== 'live' ? 'display:none' : '') + '">';
            filtered.forEach(function(proj) {
                var pct = proj.hardCap > 0 ? (proj.raised / proj.hardCap * 100) : 0;
                var statusColor = proj.status === 'live' ? '#00ff88' : proj.status === 'upcoming' ? '#00d4ff' : proj.status === 'filled' ? '#c9a227' : '#888';
                var hasParticipated = self.participated.includes(proj.id);

                html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:12px;' + (proj.status === 'live' ? 'border-color:#00ff8833' : '') + '">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
                    '<div style="display:flex;align-items:center;gap:12px"><span style="font-size:32px">' + proj.logo + '</span>' +
                    '<div><strong style="color:#fff;font-size:16px">' + proj.name + '</strong> <span style="color:#888">$' + proj.ticker + '</span>' +
                    '<div style="font-size:11px;color:#555"><span class="sol-tag sol-tag-blue" style="font-size:10px">' + proj.category + '</span> FDV: ' + proj.fdv + ' | Tier: ' + proj.tier + '</div></div></div>' +
                    '<span class="sol-tag" style="background:' + statusColor + '22;color:' + statusColor + '">' + proj.status.toUpperCase() + '</span></div>';

                html += '<div class="sol-stats-row" style="margin-bottom:8px">' +
                    '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px">' + proj.price + '</div><div class="sol-stat-label">Price</div></div>' +
                    '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px">' + proj.allocation + '</div><div class="sol-stat-label">Max Alloc</div></div>' +
                    '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px;color:#888">' + proj.vesting.split(',')[0] + '</div><div class="sol-stat-label">TGE</div></div>';
                if (proj.roi) {
                    var roiColor = proj.roi.startsWith('+') ? '#00ff88' : '#ff4466';
                    html += '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px;color:' + roiColor + '">' + proj.roi + '</div><div class="sol-stat-label">ROI</div></div>';
                } else if (proj.endsIn && proj.endsIn !== '-') {
                    html += '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px;color:#ff8844">' + proj.endsIn + '</div><div class="sol-stat-label">Ends In</div></div>';
                } else if (proj.startsIn) {
                    html += '<div class="sol-stat-card" style="padding:6px"><div class="sol-stat-value" style="font-size:14px;color:#00d4ff">' + proj.startsIn + '</div><div class="sol-stat-label">Starts In</div></div>';
                }
                html += '</div>';

                if (pct > 0) {
                    html += '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:11px;color:#888;margin-bottom:2px"><span>$' + proj.raised.toLocaleString() + ' / $' + proj.hardCap.toLocaleString() + '</span><span>' + pct.toFixed(0) + '%</span></div>' +
                        '<div class="sol-progress"><div class="sol-progress-fill" style="width:' + pct + '%;background:' + (pct >= 100 ? '#c9a227' : '#00ff88') + '"></div></div></div>';
                }

                if (proj.status === 'live' && !hasParticipated) {
                    html += '<button class="sol-btn sol-btn-primary lpad-participate" data-id="' + proj.id + '">Participate Now</button>';
                } else if (hasParticipated) {
                    html += '<span style="color:#00ff88;font-size:12px">Participated</span>';
                }
                html += '</div>';
            });
            html += '</div>';
        });

        c.innerHTML = html;
        c.querySelectorAll('.lpad-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                c.querySelectorAll('.lpad-tab').forEach(function(b) { b.classList.remove('sol-btn-primary'); b.classList.add('sol-btn-outline'); });
                btn.classList.remove('sol-btn-outline'); btn.classList.add('sol-btn-primary');
                c.querySelectorAll('.lpad-section').forEach(function(sec) {
                    sec.style.display = sec.dataset.group === btn.dataset.tab ? '' : 'none';
                });
            });
        });
        c.querySelectorAll('.lpad-participate').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.participated.push(btn.dataset.id);
                self.save();
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Successfully participated in IDO!');
                self.render('solution-body');
            });
        });
    }
};

SolutionsHub.registerSolution('launchpad', Launchpad, 'shared', {
    icon: '🚀', name: 'Launchpad', description: 'Participate in curated token launches with tiered allocations and vesting'
});
