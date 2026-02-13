/* ============================================
   ACHIEVEMENTS - Infinite XP & Leveling System
   Scaling XP curve, prestige tiers, repeatable daily XP,
   streak multipliers, 40+ badges, infinite progression
   ============================================ */

const Achievements = {
    xp: 0,
    level: 1,
    prestige: 0,
    streak: 0,
    lastActivity: null,
    dailyXpLog: {},      // { '2026-02-07': { login: true, trades: 5, ... } }
    unlockedBadges: [],
    levelHistory: [],     // timestamps of level-ups
    currentTab: 'overview',

    // --- XP Curve: each level needs more XP ---
    // Level N requires: BASE * N^EXPONENT XP from previous level
    // Total XP to reach level N = sum of all previous thresholds
    XP_BASE: 100,
    XP_EXPONENT: 1.15,

    // Prestige every 50 levels - multiplies all XP gains
    PRESTIGE_INTERVAL: 50,

    // Tier system based on level ranges
    TIERS: [
        { min: 1,   name: 'Bronze',      color: '#cd7f32', icon: '🥉', glow: 'rgba(205,127,50,0.3)' },
        { min: 10,  name: 'Silver',      color: '#c0c0c0', icon: '🥈', glow: 'rgba(192,192,192,0.3)' },
        { min: 25,  name: 'Gold',        color: '#c9a227', icon: '🥇', glow: 'rgba(201,162,39,0.3)' },
        { min: 50,  name: 'Platinum',    color: '#00d4ff', icon: '💠', glow: 'rgba(0,212,255,0.3)' },
        { min: 75,  name: 'Diamond',     color: '#b9f2ff', icon: '💎', glow: 'rgba(185,242,255,0.3)' },
        { min: 100, name: 'Master',      color: '#ff4466', icon: '🔥', glow: 'rgba(255,68,102,0.3)' },
        { min: 150, name: 'Grandmaster', color: '#ff00ff', icon: '⚡', glow: 'rgba(255,0,255,0.3)' },
        { min: 200, name: 'Legend',      color: '#00ff88', icon: '🌟', glow: 'rgba(0,255,136,0.3)' },
        { min: 300, name: 'Mythic',      color: '#fff',    icon: '👑', glow: 'rgba(255,255,255,0.4)' },
        { min: 500, name: 'Eternal',     color: '#c9a227', icon: '♾️',  glow: 'rgba(201,162,39,0.5)' }
    ],

    // --- XP Sources (repeatable daily) ---
    DAILY_XP: {
        login:       { xp: 10,  label: 'Daily Login',           icon: '🌅' },
        firstTrade:  { xp: 25,  label: 'First Trade of Day',    icon: '📈' },
        fiveTrades:  { xp: 50,  label: '5 Trades in a Day',     icon: '🔥' },
        tenTrades:   { xp: 100, label: '10 Trades in a Day',    icon: '💥' },
        swap:        { xp: 15,  label: 'Daily Swap',            icon: '🔄' },
        stake:       { xp: 20,  label: 'Active Staking',        icon: '🥩' },
        goalDeposit: { xp: 15,  label: 'Savings Goal Deposit',  icon: '🎯' },
        learnLesson: { xp: 30,  label: 'Complete Lesson',       icon: '📚' },
        visitAll:    { xp: 20,  label: 'Visit 5+ Tabs',         icon: '🗺️' },
        chatAdvisor: { xp: 10,  label: 'Ask AI Advisor',        icon: '🤖' }
    },

    // Streak XP multiplier: streak days => multiplier
    getStreakMultiplier() {
        if (this.streak >= 365) return 5.0;
        if (this.streak >= 180) return 4.0;
        if (this.streak >= 90)  return 3.0;
        if (this.streak >= 30)  return 2.5;
        if (this.streak >= 14)  return 2.0;
        if (this.streak >= 7)   return 1.5;
        if (this.streak >= 3)   return 1.2;
        return 1.0;
    },

    getPrestigeMultiplier() {
        return 1 + (this.prestige * 0.25); // +25% per prestige
    },

    // --- Badges (40+) ---
    BADGES: [
        // Onboarding
        { id: 'first-login',     name: 'Welcome',          icon: '🌟', desc: 'First login to Obelisk',           xp: 10,   check: function() { return true; } },
        { id: 'first-trade',     name: 'First Trade',      icon: '📈', desc: 'Execute your first trade',          xp: 50,   check: function() { return parseInt(localStorage.getItem('obelisk_trade_count') || '0') >= 1; } },
        { id: 'first-swap',      name: 'Swapper',          icon: '🔄', desc: 'Complete your first swap',          xp: 30,   check: function() { return parseInt(localStorage.getItem('obelisk_swap_count') || '0') >= 1; } },
        { id: 'first-stake',     name: 'Staker',           icon: '🥩', desc: 'Stake any asset',                   xp: 50,   check: function() { return !!localStorage.getItem('obelisk_staking_positions'); } },
        { id: 'first-alert',     name: 'Watchdog',         icon: '🔔', desc: 'Create a price alert',              xp: 20,   check: function() { try { return JSON.parse(localStorage.getItem('obelisk_price_alerts') || '[]').length > 0; } catch(e) { return false; } } },
        { id: 'savings-goal',    name: 'Goal Setter',      icon: '🎯', desc: 'Create a savings goal',             xp: 30,   check: function() { try { return JSON.parse(localStorage.getItem('obelisk_savings_goals') || '[]').length > 0; } catch(e) { return false; } } },

        // Trading milestones
        { id: 'ten-trades',      name: 'Active Trader',    icon: '🔥', desc: 'Complete 10 trades',                xp: 100,  check: function() { return parseInt(localStorage.getItem('obelisk_trade_count') || '0') >= 10; } },
        { id: 'fifty-trades',    name: 'Pro Trader',       icon: '💎', desc: 'Complete 50 trades',                xp: 250,  check: function() { return parseInt(localStorage.getItem('obelisk_trade_count') || '0') >= 50; } },
        { id: 'hundred-trades',  name: 'Trading Master',   icon: '👑', desc: 'Complete 100 trades',               xp: 500,  check: function() { return parseInt(localStorage.getItem('obelisk_trade_count') || '0') >= 100; } },
        { id: '500-trades',      name: 'Trade Machine',    icon: '⚙️', desc: 'Complete 500 trades',               xp: 1000, check: function() { return parseInt(localStorage.getItem('obelisk_trade_count') || '0') >= 500; } },
        { id: '1000-trades',     name: 'Trade Legend',     icon: '🏛️', desc: 'Complete 1,000 trades',             xp: 2500, check: function() { return parseInt(localStorage.getItem('obelisk_trade_count') || '0') >= 1000; } },
        { id: '5000-trades',     name: 'Eternal Trader',   icon: '♾️',  desc: 'Complete 5,000 trades',             xp: 5000, check: function() { return parseInt(localStorage.getItem('obelisk_trade_count') || '0') >= 5000; } },

        // Deposits
        { id: 'depositor-1k',    name: '$1K Club',         icon: '💰', desc: 'Deposit over $1,000',               xp: 100,  check: function() { return parseFloat(localStorage.getItem('obelisk_total_deposited') || '0') >= 1000; } },
        { id: 'depositor-10k',   name: '$10K Club',        icon: '🏦', desc: 'Deposit over $10,000',              xp: 250,  check: function() { return parseFloat(localStorage.getItem('obelisk_total_deposited') || '0') >= 10000; } },
        { id: 'depositor-100k',  name: '$100K Whale',      icon: '🐋', desc: 'Deposit over $100,000',             xp: 1000, check: function() { return parseFloat(localStorage.getItem('obelisk_total_deposited') || '0') >= 100000; } },
        { id: 'depositor-1m',    name: 'Millionaire',      icon: '💵', desc: 'Deposit over $1,000,000',           xp: 5000, check: function() { return parseFloat(localStorage.getItem('obelisk_total_deposited') || '0') >= 1000000; } },

        // DeFi
        { id: 'yield-farmer',    name: 'Yield Farmer',     icon: '🌾', desc: 'Earn yield from any pool',          xp: 75,   check: function() { return !!localStorage.getItem('obelisk_yield_earned'); } },
        { id: 'bond-buyer',      name: 'Bond Holder',      icon: '📜', desc: 'Purchase a bond',                   xp: 75,   check: function() { return !!localStorage.getItem('obelisk_bond_positions'); } },
        { id: 'diversified',     name: 'Diversified',      icon: '🌐', desc: 'Hold 5+ different assets',          xp: 100,  check: function() { if (typeof SimulatedPortfolio !== 'undefined') return (SimulatedPortfolio.positions || []).length >= 5; return false; } },
        { id: 'perps-trader',    name: 'Perpetual',        icon: '📉', desc: 'Trade perpetuals',                  xp: 75,   check: function() { return parseInt(localStorage.getItem('obelisk_perps_count') || '0') >= 1; } },
        { id: 'combo-master',    name: 'Combo Master',     icon: '🎯', desc: 'Create 3 combo products',           xp: 150,  check: function() { try { return JSON.parse(localStorage.getItem('obelisk_combos') || '[]').length >= 3; } catch(e) { return false; } } },

        // Learning
        { id: 'learner',         name: 'Student',          icon: '📚', desc: 'Complete a learning module',         xp: 40,   check: function() { return !!localStorage.getItem('obelisk_courses_completed'); } },
        { id: 'scholar',         name: 'Scholar',          icon: '🎓', desc: 'Complete 5 learning modules',        xp: 200,  check: function() { try { return JSON.parse(localStorage.getItem('obelisk_courses_completed') || '[]').length >= 5; } catch(e) { return false; } } },

        // Streaks
        { id: 'streak-3',        name: '3-Day Streak',     icon: '🔥', desc: '3 days in a row',                   xp: 50,   check: function() { return parseInt(localStorage.getItem('obelisk_streak') || '0') >= 3; } },
        { id: 'streak-7',        name: 'Week Warrior',     icon: '⚡', desc: '7-day streak',                      xp: 100,  check: function() { return parseInt(localStorage.getItem('obelisk_streak') || '0') >= 7; } },
        { id: 'streak-14',       name: 'Fortnight',        icon: '💪', desc: '14-day streak',                     xp: 200,  check: function() { return parseInt(localStorage.getItem('obelisk_streak') || '0') >= 14; } },
        { id: 'streak-30',       name: 'Monthly Master',   icon: '🏆', desc: '30-day streak',                     xp: 500,  check: function() { return parseInt(localStorage.getItem('obelisk_streak') || '0') >= 30; } },
        { id: 'streak-90',       name: 'Quarterly Beast',  icon: '🐉', desc: '90-day streak',                     xp: 1500, check: function() { return parseInt(localStorage.getItem('obelisk_streak') || '0') >= 90; } },
        { id: 'streak-180',      name: 'Half-Year Hero',   icon: '⭐', desc: '180-day streak',                    xp: 3000, check: function() { return parseInt(localStorage.getItem('obelisk_streak') || '0') >= 180; } },
        { id: 'streak-365',      name: 'Year One',         icon: '🌍', desc: '365-day streak',                    xp: 10000,check: function() { return parseInt(localStorage.getItem('obelisk_streak') || '0') >= 365; } },

        // Level milestones (checked dynamically)
        { id: 'level-10',        name: 'Silver Rank',      icon: '🥈', desc: 'Reach level 10',                    xp: 200,  check: function() { return Achievements.level >= 10; } },
        { id: 'level-25',        name: 'Gold Rank',        icon: '🥇', desc: 'Reach level 25',                    xp: 500,  check: function() { return Achievements.level >= 25; } },
        { id: 'level-50',        name: 'Platinum Rank',    icon: '💠', desc: 'Reach level 50',                    xp: 1000, check: function() { return Achievements.level >= 50; } },
        { id: 'level-100',       name: 'Master Rank',      icon: '🔥', desc: 'Reach level 100',                   xp: 2500, check: function() { return Achievements.level >= 100; } },
        { id: 'level-200',       name: 'Legend Rank',       icon: '🌟', desc: 'Reach level 200',                   xp: 5000, check: function() { return Achievements.level >= 200; } },

        // Prestige
        { id: 'prestige-1',      name: 'Prestige I',       icon: '✨', desc: 'Reach Prestige 1',                  xp: 2000, check: function() { return Achievements.prestige >= 1; } },
        { id: 'prestige-3',      name: 'Prestige III',     icon: '💫', desc: 'Reach Prestige 3',                  xp: 5000, check: function() { return Achievements.prestige >= 3; } },
        { id: 'prestige-5',      name: 'Prestige V',       icon: '🌠', desc: 'Reach Prestige 5',                  xp: 10000,check: function() { return Achievements.prestige >= 5; } },
        { id: 'prestige-10',     name: 'Prestige X',       icon: '☀️',  desc: 'Reach Prestige 10',                 xp: 25000,check: function() { return Achievements.prestige >= 10; } },

        // Misc
        { id: 'night-owl',       name: 'Night Owl',        icon: '🦉', desc: 'Active between midnight and 5am',   xp: 30,   check: function() { var h = new Date().getHours(); return h >= 0 && h < 5; } },
        { id: 'explorer',        name: 'Explorer',         icon: '🗺️', desc: 'Visit all main tabs',               xp: 40,   check: function() { try { return JSON.parse(localStorage.getItem('obelisk_visited_tabs') || '[]').length >= 8; } catch(e) { return false; } } },
        { id: 'social',          name: 'Social Butterfly', icon: '🦋', desc: 'Post in the social feed',           xp: 25,   check: function() { return !!localStorage.getItem('obelisk_social_posted'); } },
        { id: 'invoice',         name: 'Business Pro',     icon: '🧾', desc: 'Create an invoice',                 xp: 50,   check: function() { try { return JSON.parse(localStorage.getItem('obelisk_invoices') || '[]').length > 0; } catch(e) { return false; } } }
    ],

    // ======== XP Curve Functions ========

    // XP required to go from level N to N+1
    xpForLevel(n) {
        return Math.floor(this.XP_BASE * Math.pow(n, this.XP_EXPONENT));
    },

    // Total XP required to reach level N (from level 1)
    totalXpForLevel(n) {
        var total = 0;
        for (var i = 1; i < n; i++) {
            total += this.xpForLevel(i);
        }
        return total;
    },

    // Compute current level from total XP
    computeLevel(totalXp) {
        var lvl = 1;
        var accumulated = 0;
        while (true) {
            var needed = this.xpForLevel(lvl);
            if (accumulated + needed > totalXp) break;
            accumulated += needed;
            lvl++;
        }
        return lvl;
    },

    // XP progress within current level: { current, required, pct }
    getLevelProgress() {
        var lvl = this.level;
        var xpAtLevelStart = this.totalXpForLevel(lvl);
        var xpInLevel = this.xp - xpAtLevelStart;
        var xpNeeded = this.xpForLevel(lvl);
        return {
            current: Math.max(0, xpInLevel),
            required: xpNeeded,
            pct: Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100))
        };
    },

    // Get current tier
    getTier() {
        var effectiveLevel = this.level + (this.prestige * this.PRESTIGE_INTERVAL);
        var tier = this.TIERS[0];
        for (var i = 0; i < this.TIERS.length; i++) {
            if (effectiveLevel >= this.TIERS[i].min) tier = this.TIERS[i];
        }
        return tier;
    },

    // ======== Core Functions ========

    init() {
        this.load();
        this.checkAll();
        this.updateStreak();
        this.grantDailyXp('login');
    },

    load() {
        try {
            this.unlockedBadges = JSON.parse(localStorage.getItem('obelisk_achievements') || '[]');
            this.xp = parseInt(localStorage.getItem('obelisk_xp') || '0');
            this.prestige = parseInt(localStorage.getItem('obelisk_prestige') || '0');
            this.streak = parseInt(localStorage.getItem('obelisk_streak') || '0');
            this.lastActivity = localStorage.getItem('obelisk_last_activity');
            this.dailyXpLog = JSON.parse(localStorage.getItem('obelisk_daily_xp') || '{}');
            this.levelHistory = JSON.parse(localStorage.getItem('obelisk_level_history') || '[]');
        } catch (e) {
            this.unlockedBadges = [];
            this.xp = 0;
            this.prestige = 0;
            this.dailyXpLog = {};
            this.levelHistory = [];
        }
        this.level = this.computeLevel(this.xp);
    },

    save() {
        localStorage.setItem('obelisk_achievements', JSON.stringify(this.unlockedBadges));
        localStorage.setItem('obelisk_xp', this.xp.toString());
        localStorage.setItem('obelisk_prestige', this.prestige.toString());
        localStorage.setItem('obelisk_streak', this.streak.toString());
        localStorage.setItem('obelisk_last_activity', new Date().toISOString().split('T')[0]);
        localStorage.setItem('obelisk_daily_xp', JSON.stringify(this.dailyXpLog));
        localStorage.setItem('obelisk_level_history', JSON.stringify(this.levelHistory));
    },

    updateStreak() {
        var today = new Date().toISOString().split('T')[0];
        if (this.lastActivity) {
            var last = new Date(this.lastActivity);
            var diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
            if (diff === 1) this.streak++;
            else if (diff > 1) this.streak = 1;
            // diff === 0: same day, no change
        } else {
            this.streak = 1;
        }
        this.save();
    },

    // Grant XP with multipliers
    addXp(amount, source) {
        var mult = this.getStreakMultiplier() * this.getPrestigeMultiplier();
        var finalXp = Math.floor(amount * mult);
        var oldLevel = this.level;

        this.xp += finalXp;
        this.level = this.computeLevel(this.xp);

        // Level up detection
        if (this.level > oldLevel) {
            var levelsGained = this.level - oldLevel;
            for (var i = 0; i < levelsGained; i++) {
                this.onLevelUp(oldLevel + i + 1);
            }
        }

        // Prestige detection
        var newPrestige = Math.floor(this.level / this.PRESTIGE_INTERVAL);
        if (newPrestige > this.prestige) {
            this.prestige = newPrestige;
            this.onPrestige(this.prestige);
        }

        this.save();
        return finalXp;
    },

    // Daily repeatable XP
    grantDailyXp(actionId) {
        var today = new Date().toISOString().split('T')[0];
        if (!this.dailyXpLog[today]) this.dailyXpLog[today] = {};
        if (this.dailyXpLog[today][actionId]) return 0; // already claimed today

        var source = this.DAILY_XP[actionId];
        if (!source) return 0;

        this.dailyXpLog[today][actionId] = true;
        var gained = this.addXp(source.xp, actionId);

        // Clean up old logs (keep 30 days)
        var keys = Object.keys(this.dailyXpLog);
        if (keys.length > 30) {
            keys.sort();
            for (var i = 0; i < keys.length - 30; i++) {
                delete this.dailyXpLog[keys[i]];
            }
        }

        this.save();
        return gained;
    },

    // Check and grant daily actions based on current state
    checkDailyActions() {
        var trades = parseInt(localStorage.getItem('obelisk_trade_count') || '0');
        var todayTrades = parseInt(localStorage.getItem('obelisk_today_trades') || '0');
        if (todayTrades >= 1) this.grantDailyXp('firstTrade');
        if (todayTrades >= 5) this.grantDailyXp('fiveTrades');
        if (todayTrades >= 10) this.grantDailyXp('tenTrades');
        if (localStorage.getItem('obelisk_staking_positions')) this.grantDailyXp('stake');
    },

    onLevelUp(newLevel) {
        this.levelHistory.push({ level: newLevel, date: new Date().toISOString() });
        if (this.levelHistory.length > 100) this.levelHistory = this.levelHistory.slice(-100);

        var tier = this.getTier();
        if (typeof ObeliskToast !== 'undefined') {
            ObeliskToast.success('Level Up! ' + tier.icon + ' Level ' + newLevel + ' (' + tier.name + ')');
        }

        // Celebrate on milestone levels
        if (newLevel % 10 === 0 || newLevel % 25 === 0) {
            this.celebrate(newLevel >= 100 ? 80 : newLevel >= 50 ? 60 : 40);
        }
    },

    onPrestige(prestigeLevel) {
        if (typeof ObeliskToast !== 'undefined') {
            ObeliskToast.success('PRESTIGE ' + prestigeLevel + '! All XP gains boosted by ' + (prestigeLevel * 25) + '%!');
        }
        this.celebrate(100);
    },

    checkAll() {
        var self = this;
        var newUnlocks = [];
        this.BADGES.forEach(function(badge) {
            if (self.unlockedBadges.includes(badge.id)) return;
            try {
                if (badge.check()) {
                    self.unlockedBadges.push(badge.id);
                    self.addXp(badge.xp, 'badge:' + badge.id);
                    newUnlocks.push(badge);
                }
            } catch (e) {}
        });
        if (newUnlocks.length > 0) {
            this.save();
            newUnlocks.forEach(function(b) {
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Badge: ' + b.icon + ' ' + b.name + ' (+' + b.xp + ' XP)');
            });
        }
        this.checkDailyActions();
    },

    celebrate(count) {
        count = count || 50;
        var colors = ['#00ff88', '#00d4ff', '#c9a227', '#ff4466', '#fff', '#627eea', '#ff00ff', '#b9f2ff'];
        for (var i = 0; i < count; i++) {
            var conf = document.createElement('div');
            conf.className = 'sol-confetti';
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.background = colors[Math.floor(Math.random() * colors.length)];
            conf.style.animationDelay = (Math.random() * 2) + 's';
            conf.style.animationDuration = (2 + Math.random() * 3) + 's';
            conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            conf.style.width = (4 + Math.random() * 8) + 'px';
            conf.style.height = conf.style.width;
            document.body.appendChild(conf);
            setTimeout(function() { conf.remove(); }, 6000);
        }
    },

    // ======== Formatting helpers ========

    formatXp(xp) {
        if (xp >= 1000000) return (xp / 1000000).toFixed(1) + 'M';
        if (xp >= 10000) return (xp / 1000).toFixed(1) + 'K';
        return xp.toLocaleString();
    },

    // ======== Render ========

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        this.checkAll();

        var tier = this.getTier();
        var progress = this.getLevelProgress();
        var unlocked = this.unlockedBadges.length;
        var total = this.BADGES.length;
        var mult = this.getStreakMultiplier() * this.getPrestigeMultiplier();

        var html = '<div class="sol-tabs">' +
            '<button class="sol-tab ' + (this.currentTab === 'overview' ? 'active' : '') + '" data-stab="overview">Overview</button>' +
            '<button class="sol-tab ' + (this.currentTab === 'badges' ? 'active' : '') + '" data-stab="badges">Badges (' + unlocked + '/' + total + ')</button>' +
            '<button class="sol-tab ' + (this.currentTab === 'daily' ? 'active' : '') + '" data-stab="daily">Daily XP</button>' +
            '<button class="sol-tab ' + (this.currentTab === 'history' ? 'active' : '') + '" data-stab="history">History</button>' +
            '</div>';

        if (this.currentTab === 'overview') html += this.renderOverview(tier, progress, unlocked, total, mult);
        else if (this.currentTab === 'badges') html += this.renderBadges();
        else if (this.currentTab === 'daily') html += this.renderDaily(mult);
        else html += this.renderHistory();

        c.innerHTML = html;
        this.bindEvents(c);
    },

    renderOverview(tier, progress, unlocked, total, mult) {
        var html = '';

        // Level display with tier glow
        html += '<div style="text-align:center;padding:20px 0 10px">' +
            '<div class="achiev-level-ring" style="display:inline-block;position:relative;margin-bottom:12px">' +
            this.renderLevelRingSVG(progress.pct, tier) +
            '</div>' +
            '<div style="font-size:14px;color:' + tier.color + ';font-weight:600;letter-spacing:1px;text-transform:uppercase">' + tier.icon + ' ' + tier.name + '</div>' +
            (this.prestige > 0 ? '<div style="font-size:12px;color:#c9a227;margin-top:4px">Prestige ' + this.prestige + ' (+' + (this.prestige * 25) + '% XP)</div>' : '') +
            '</div>';

        // Stats
        html += '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:' + tier.color + '">' + this.formatXp(this.xp) + '</div><div class="sol-stat-label">Total XP</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value gold">' + unlocked + '/' + total + '</div><div class="sol-stat-label">Badges</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + this.streak + 'd</div><div class="sol-stat-label">Streak</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">x' + mult.toFixed(1) + '</div><div class="sol-stat-label">XP Multiplier</div></div>' +
            '</div>';

        // Level progress bar
        html += '<div class="sol-section"><div class="sol-section-title">' + tier.icon + ' Level ' + this.level + ' Progress</div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:6px">' +
            '<span>Level ' + this.level + '</span>' +
            '<span>' + this.formatXp(progress.current) + ' / ' + this.formatXp(progress.required) + ' XP</span>' +
            '<span>Level ' + (this.level + 1) + '</span></div>' +
            '<div class="sol-progress" style="height:12px;border-radius:6px"><div class="sol-progress-fill" style="width:' + progress.pct.toFixed(1) + '%;background:' + tier.color + ';border-radius:6px;box-shadow:0 0 10px ' + tier.glow + '"></div></div></div>';

        // XP multiplier breakdown
        html += '<div class="sol-section"><div class="sol-section-title">🚀 XP Multiplier Breakdown</div>' +
            '<table class="sol-table"><tbody>' +
            '<tr><td>Base</td><td style="text-align:right;font-family:monospace">x1.0</td></tr>' +
            '<tr><td>Streak Bonus (' + this.streak + ' days)</td><td style="text-align:right;font-family:monospace;color:#00d4ff">x' + this.getStreakMultiplier().toFixed(1) + '</td></tr>' +
            '<tr><td>Prestige Bonus (P' + this.prestige + ')</td><td style="text-align:right;font-family:monospace;color:#c9a227">x' + this.getPrestigeMultiplier().toFixed(2) + '</td></tr>' +
            '<tr><td><strong>Total</strong></td><td style="text-align:right;font-family:monospace;color:#00ff88;font-weight:700">x' + mult.toFixed(2) + '</td></tr>' +
            '</tbody></table></div>';

        // Tier progression
        html += '<div class="sol-section"><div class="sol-section-title">🏅 Tier Progression</div>';
        var self = this;
        var effectiveLevel = this.level + (this.prestige * this.PRESTIGE_INTERVAL);
        this.TIERS.forEach(function(t) {
            var reached = effectiveLevel >= t.min;
            var isCurrent = t === self.getTier();
            html += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;' + (isCurrent ? 'background:rgba(255,255,255,0.03);border-radius:8px;padding:8px 10px;margin:2px -10px' : '') + '">' +
                '<span style="font-size:20px;' + (!reached ? 'filter:grayscale(1);opacity:0.3' : '') + '">' + t.icon + '</span>' +
                '<span style="color:' + (reached ? t.color : '#333') + ';font-weight:' + (isCurrent ? '700' : '400') + ';font-size:13px;flex:1">' + t.name +
                (isCurrent ? ' <span style="color:#00ff88;font-size:10px">CURRENT</span>' : '') + '</span>' +
                '<span style="font-family:monospace;font-size:11px;color:' + (reached ? '#888' : '#333') + '">Lvl ' + t.min + '+</span>' +
                '</div>';
        });
        html += '<div style="margin-top:10px;padding:10px;border:1px dashed #222;border-radius:8px;text-align:center;color:#555;font-size:12px">' +
            'Beyond Eternal: levels continue infinitely. Prestige every ' + this.PRESTIGE_INTERVAL + ' levels for permanent XP boost.</div></div>';

        // Next prestige
        var nextPrestigeLevel = (this.prestige + 1) * this.PRESTIGE_INTERVAL;
        var levelsToPrestige = nextPrestigeLevel - this.level;
        if (levelsToPrestige > 0) {
            html += '<div class="sol-section"><div class="sol-section-title">✨ Next Prestige</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:6px">' +
                '<span>Current: P' + this.prestige + '</span><span>' + levelsToPrestige + ' levels to go</span><span>P' + (this.prestige + 1) + '</span></div>' +
                '<div class="sol-progress"><div class="sol-progress-fill" style="width:' + ((1 - levelsToPrestige / this.PRESTIGE_INTERVAL) * 100) + '%;background:linear-gradient(90deg,#c9a227,#ff00ff)"></div></div></div>';
        }

        return html;
    },

    renderLevelRingSVG(pct, tier) {
        var size = 140, cx = 70, cy = 70, r = 58;
        var circumference = 2 * Math.PI * r;
        var offset = circumference - (pct / 100) * circumference;
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
            '<defs><filter id="lvl-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#1a1a1a" stroke-width="10"/>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + tier.color + '" stroke-width="10" ' +
            'stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '" ' +
            'stroke-linecap="round" transform="rotate(-90 ' + cx + ' ' + cy + ')" filter="url(#lvl-glow)" style="transition:stroke-dashoffset 1s ease"/>' +
            '<text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" fill="' + tier.color + '" font-size="32" font-weight="800" font-family="JetBrains Mono,monospace">' + this.level + '</text>' +
            '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" fill="#666" font-size="11">LEVEL</text>' +
            (this.prestige > 0 ? '<text x="' + cx + '" y="' + (cy + 30) + '" text-anchor="middle" fill="#c9a227" font-size="10" font-weight="600">P' + this.prestige + '</text>' : '') +
            '</svg>';
    },

    renderBadges() {
        var html = '<div class="sol-section"><div class="sol-section-title">🏆 All Badges (' + this.unlockedBadges.length + '/' + this.BADGES.length + ')</div>' +
            '<div class="sol-badges-grid">';
        var self = this;
        this.BADGES.forEach(function(b) {
            var isUnlocked = self.unlockedBadges.includes(b.id);
            html += '<div class="sol-badge ' + (isUnlocked ? 'unlocked' : 'locked') + '" title="' + b.desc + '">' +
                '<div class="sol-badge-icon">' + b.icon + '</div>' +
                '<div class="sol-badge-name">' + b.name + '</div>' +
                '<div class="sol-badge-desc">' + (isUnlocked ? '+' + self.formatXp(b.xp) + ' XP' : b.desc) + '</div>' +
                '</div>';
        });
        html += '</div></div>';
        return html;
    },

    renderDaily(mult) {
        var today = new Date().toISOString().split('T')[0];
        var todayLog = this.dailyXpLog[today] || {};
        var claimedToday = Object.keys(todayLog).length;
        var totalDaily = Object.keys(this.DAILY_XP).length;

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">' + claimedToday + '/' + totalDaily + '</div><div class="sol-stat-label">Claimed Today</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">x' + mult.toFixed(1) + '</div><div class="sol-stat-label">Current Multiplier</div></div>' +
            '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">📅 Daily XP Actions</div>' +
            '<p style="color:#666;font-size:12px;margin-bottom:16px">Complete actions each day to earn repeatable XP. Resets at midnight. Multiplied by your current streak + prestige bonus.</p>' +
            '<table class="sol-table"><thead><tr><th></th><th>Action</th><th>Base XP</th><th>With Multiplier</th><th>Status</th></tr></thead><tbody>';

        var self = this;
        Object.keys(this.DAILY_XP).forEach(function(key) {
            var src = self.DAILY_XP[key];
            var claimed = !!todayLog[key];
            var effectiveXp = Math.floor(src.xp * mult);
            html += '<tr><td>' + src.icon + '</td>' +
                '<td>' + src.label + '</td>' +
                '<td style="font-family:monospace;color:#888">' + src.xp + '</td>' +
                '<td style="font-family:monospace;color:#00ff88">+' + effectiveXp + '</td>' +
                '<td>' + (claimed ? '<span class="sol-tag sol-tag-green">Claimed</span>' : '<span class="sol-tag sol-tag-gray">Pending</span>') + '</td></tr>';
        });
        html += '</tbody></table></div>';

        // Streak multiplier table
        html += '<div class="sol-section"><div class="sol-section-title">🔥 Streak Multiplier Tiers</div>' +
            '<table class="sol-table"><thead><tr><th>Streak</th><th>Multiplier</th><th>Status</th></tr></thead><tbody>';
        var streakTiers = [
            { days: 3, mult: 'x1.2' }, { days: 7, mult: 'x1.5' }, { days: 14, mult: 'x2.0' },
            { days: 30, mult: 'x2.5' }, { days: 90, mult: 'x3.0' }, { days: 180, mult: 'x4.0' }, { days: 365, mult: 'x5.0' }
        ];
        streakTiers.forEach(function(st) {
            var reached = self.streak >= st.days;
            html += '<tr><td>' + st.days + ' days</td>' +
                '<td style="font-family:monospace;color:' + (reached ? '#00ff88' : '#555') + '">' + st.mult + '</td>' +
                '<td>' + (reached ? '<span class="sol-tag sol-tag-green">Active</span>' : '<span class="sol-tag sol-tag-gray">' + Math.max(0, st.days - self.streak) + ' days left</span>') + '</td></tr>';
        });
        html += '</tbody></table></div>';

        return html;
    },

    renderHistory() {
        var html = '<div class="sol-section"><div class="sol-section-title">📜 Level-Up History</div>';
        if (this.levelHistory.length === 0) {
            html += '<div class="sol-empty"><div class="sol-empty-text">No level-ups recorded yet</div></div>';
        } else {
            html += '<table class="sol-table"><thead><tr><th>Level</th><th>Tier</th><th>Date</th></tr></thead><tbody>';
            var self = this;
            this.levelHistory.slice().reverse().slice(0, 50).forEach(function(h) {
                var tier = self.TIERS[0];
                for (var i = 0; i < self.TIERS.length; i++) {
                    if (h.level >= self.TIERS[i].min) tier = self.TIERS[i];
                }
                html += '<tr><td style="font-family:monospace;color:' + tier.color + ';font-weight:700">Level ' + h.level + '</td>' +
                    '<td>' + tier.icon + ' ' + tier.name + '</td>' +
                    '<td style="color:#666">' + new Date(h.date).toLocaleString() + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        // XP curve visualization
        html += '<div class="sol-section"><div class="sol-section-title">📈 XP Curve (next 20 levels)</div>' +
            '<table class="sol-table"><thead><tr><th>Level</th><th>XP to Next</th><th>Total XP</th><th>Tier</th></tr></thead><tbody>';
        for (var i = this.level; i < this.level + 20; i++) {
            var xpNeeded = this.xpForLevel(i);
            var totalXp = this.totalXpForLevel(i);
            var tier = this.TIERS[0];
            for (var j = 0; j < this.TIERS.length; j++) {
                if (i >= this.TIERS[j].min) tier = this.TIERS[j];
            }
            var isPrestige = (i % this.PRESTIGE_INTERVAL === 0 && i > 0);
            html += '<tr' + (i === this.level ? ' style="background:rgba(255,255,255,0.03)"' : '') + '>' +
                '<td style="font-family:monospace;color:' + tier.color + '">' + i + (i === this.level ? ' ◀' : '') + (isPrestige ? ' ✨P' : '') + '</td>' +
                '<td style="font-family:monospace">' + this.formatXp(xpNeeded) + '</td>' +
                '<td style="font-family:monospace;color:#888">' + this.formatXp(totalXp) + '</td>' +
                '<td>' + tier.icon + ' ' + tier.name + '</td></tr>';
        }
        html += '</tbody></table>' +
            '<div style="color:#555;font-size:11px;margin-top:8px;text-align:center">XP formula: ' + this.XP_BASE + ' x Level^' + this.XP_EXPONENT + ' | Prestige every ' + this.PRESTIGE_INTERVAL + ' levels</div></div>';

        return html;
    },

    bindEvents(container) {
        var self = this;
        container.querySelectorAll('.sol-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.currentTab = this.dataset.stab;
                self.render('solution-body');
            });
        });
    }
};

// Public API for other modules to grant XP
Achievements.grantXp = function(amount, source) {
    return this.addXp(amount, source || 'external');
};

SolutionsHub.registerSolution('achievements', Achievements, 'shared', {
    icon: '🏆', name: 'Achievements', description: 'Infinite leveling system with XP, prestige tiers, daily rewards and 40+ badges'
});
