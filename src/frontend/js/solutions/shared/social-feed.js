/* ============================================
   SOCIAL FEED - Shared Module
   Timeline of trader activity and social posts
   ============================================ */

const SocialFeed = {
    posts: [],

    init() {
        this.generateMockFeed();
    },

    generateMockFeed() {
        var traders = [
            { name: 'CryptoWhale', avatar: '🐋', badge: 'Pro' },
            { name: 'DeFi_Farmer', avatar: '🌾', badge: 'Yield' },
            { name: 'BTCMaxi', avatar: '₿', badge: 'Hodler' },
            { name: 'AlgoTrader', avatar: '🤖', badge: 'Bot' },
            { name: 'StakeKing', avatar: '👑', badge: 'Staker' },
            { name: 'ArbHunter', avatar: '🎯', badge: 'Arb' },
            { name: 'NFTCollector', avatar: '🖼️', badge: 'NFT' },
            { name: 'EthBuilder', avatar: '🔨', badge: 'Dev' }
        ];

        var templates = [
            { text: 'Just opened a long position on BTC. Feeling bullish! 📈', type: 'trade' },
            { text: 'Staked 10 ETH at 4.2% APY. Passive income activated! 💰', type: 'stake' },
            { text: 'Closed my SOL position for +15%. Taking profits here.', type: 'trade' },
            { text: 'Market looks overextended. Moving 30% to stablecoins for safety.', type: 'analysis' },
            { text: 'New DeFi yield farming strategy yielding 8% weekly. DM for details.', type: 'defi' },
            { text: 'Portfolio hit ATH today! Diversification paying off 🎉', type: 'milestone' },
            { text: 'Bought the dip on AVAX. Great entry point at these levels.', type: 'trade' },
            { text: 'Set up automated DCA - $100 weekly into BTC/ETH split.', type: 'strategy' },
            { text: 'Liquidation cascade on leveraged longs. Stay safe out there.', type: 'warning' },
            { text: 'Just completed the advanced trading course on Obelisk Academy! 📚', type: 'achievement' },
            { text: 'ARB ecosystem growing fast. Adding exposure through index funds.', type: 'analysis' },
            { text: 'Running my TWAP algo for a large ETH accumulation. 20 slices over 2 hours.', type: 'algo' }
        ];

        this.posts = [];
        for (var i = 0; i < 15; i++) {
            var trader = traders[Math.floor(Math.random() * traders.length)];
            var template = templates[Math.floor(Math.random() * templates.length)];
            var hoursAgo = Math.floor(Math.random() * 48);
            var time = new Date(Date.now() - hoursAgo * 3600000);
            this.posts.push({
                id: 'post_' + i,
                user: trader.name,
                avatar: trader.avatar,
                badge: trader.badge,
                text: template.text,
                type: template.type,
                time: time.toISOString(),
                likes: Math.floor(Math.random() * 50),
                comments: Math.floor(Math.random() * 12),
                liked: false
            });
        }
        this.posts.sort(function(a, b) { return new Date(b.time) - new Date(a.time); });
    },

    timeAgo(dateStr) {
        var diff = Date.now() - new Date(dateStr).getTime();
        var mins = Math.floor(diff / 60000);
        if (mins < 60) return mins + 'm ago';
        var hours = Math.floor(mins / 60);
        if (hours < 24) return hours + 'h ago';
        return Math.floor(hours / 24) + 'd ago';
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;

        var html = '<div class="sol-section" style="padding:16px">' +
            '<div style="display:flex;gap:8px;margin-bottom:16px">' +
            '<input class="sol-input" id="feed-input" placeholder="Share your trade or market insight..." style="border-radius:20px">' +
            '<button class="sol-btn sol-btn-primary" id="feed-post" style="border-radius:20px">Post</button></div>';

        // Filter tabs
        html += '<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">' +
            '<button class="sol-btn sol-btn-sm sol-btn-outline feed-filter active" data-filter="all">All</button>' +
            '<button class="sol-btn sol-btn-sm sol-btn-outline feed-filter" data-filter="trade">Trades</button>' +
            '<button class="sol-btn sol-btn-sm sol-btn-outline feed-filter" data-filter="analysis">Analysis</button>' +
            '<button class="sol-btn sol-btn-sm sol-btn-outline feed-filter" data-filter="defi">DeFi</button>' +
            '</div>';

        // Feed items
        this.posts.forEach(function(post) {
            var typeColor = post.type === 'trade' ? '#00ff88' : post.type === 'analysis' ? '#00d4ff' : post.type === 'defi' ? '#c9a227' : post.type === 'warning' ? '#ff4466' : '#888';
            html += '<div class="sol-feed-item" data-type="' + post.type + '">' +
                '<div class="sol-feed-avatar">' + post.avatar + '</div>' +
                '<div class="sol-feed-body">' +
                '<div><span class="sol-feed-user">' + post.user + '</span>' +
                '<span class="sol-tag sol-tag-gray" style="margin-left:6px;font-size:9px">' + post.badge + '</span>' +
                '<span class="sol-feed-time">' + self.timeAgo(post.time) + '</span></div>' +
                '<div class="sol-feed-text">' + post.text + '</div>' +
                '<span class="sol-tag" style="background:' + typeColor + '22;color:' + typeColor + ';font-size:9px;margin-top:4px;display:inline-block">' + post.type + '</span>' +
                '<div class="sol-feed-actions">' +
                '<button class="sol-feed-action feed-like" data-id="' + post.id + '">' + (post.liked ? '❤️' : '🤍') + ' ' + post.likes + '</button>' +
                '<button class="sol-feed-action">💬 ' + post.comments + '</button>' +
                '<button class="sol-feed-action">🔄 Share</button>' +
                '</div></div></div>';
        });

        html += '</div>';
        c.innerHTML = html;
        this.bindEvents(c);
    },

    bindEvents(container) {
        var self = this;

        // Post
        var postBtn = container.querySelector('#feed-post');
        if (postBtn) {
            postBtn.addEventListener('click', function() {
                var input = container.querySelector('#feed-input');
                if (!input || !input.value.trim()) return;
                self.posts.unshift({
                    id: 'post_' + Date.now(),
                    user: 'You',
                    avatar: '👤',
                    badge: 'Member',
                    text: input.value.trim(),
                    type: 'analysis',
                    time: new Date().toISOString(),
                    likes: 0,
                    comments: 0,
                    liked: false
                });
                self.render('solution-body');
            });
        }

        // Like
        container.querySelectorAll('.feed-like').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var post = self.posts.find(function(p) { return p.id === btn.dataset.id; });
                if (post) {
                    post.liked = !post.liked;
                    post.likes += post.liked ? 1 : -1;
                    self.render('solution-body');
                }
            });
        });

        // Filter
        container.querySelectorAll('.feed-filter').forEach(function(btn) {
            btn.addEventListener('click', function() {
                container.querySelectorAll('.feed-filter').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                var filter = this.dataset.filter;
                container.querySelectorAll('.sol-feed-item').forEach(function(item) {
                    if (filter === 'all' || item.dataset.type === filter) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
};

SolutionsHub.registerSolution('social-feed', SocialFeed, 'shared', {
    icon: '📣', name: 'Social Feed', description: 'Community feed with trades, analysis and social interaction'
});
