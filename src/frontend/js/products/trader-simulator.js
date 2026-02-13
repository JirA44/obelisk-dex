/**
 * TRADER SIMULATOR ENGINE - Realistic Trading Simulation
 * Procedurally generates 1000+ traders with real market conditions
 */

const TraderSimulator = {
    // Configuration
    TOTAL_TRADERS: 2000, // Number of traders to generate

    // ═══════════════════════════════════════════════════════════════════════════════
    // MARKET CONDITIONS (Realistic)
    // ═══════════════════════════════════════════════════════════════════════════════

    marketConditions: {
        fees: {
            cex: { maker: 0.0002, taker: 0.0004 },
            dex: { maker: 0.0003, taker: 0.003 },
            perps: { maker: 0.0001, taker: 0.0005 },
        },
        spreads: {
            'BTC': 0.0001, 'ETH': 0.0002, 'SOL': 0.0005, 'ARB': 0.001,
            'LINK': 0.0008, 'AVAX': 0.001, 'DOGE': 0.002, 'SHIB': 0.005,
            'PEPE': 0.008, 'WIF': 0.01, 'BONK': 0.012, 'OP': 0.001,
            'MATIC': 0.0008, 'NEAR': 0.001, 'FTM': 0.0015, 'ATOM': 0.001,
            'DOT': 0.001, 'ADA': 0.001, 'XRP': 0.0008, 'BNB': 0.0005,
            'altcoin': 0.003, 'memecoin': 0.01, 'lowcap': 0.02,
        },
        slippageModel: { small: 0.0001, medium: 0.0005, large: 0.002, whale: 0.01 },
        fundingRate: { base: 0.0001, volatilityMult: 2 },
        gasFees: { ethereum: 5, arbitrum: 0.20, solana: 0.001, base: 0.10, polygon: 0.05 }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRADER GENERATION TEMPLATES
    // ═══════════════════════════════════════════════════════════════════════════════

    templates: {
        styles: [
            { name: 'dca', weight: 8, riskBias: 'low', leverageRange: [1, 1], freqBias: 'weekly' },
            { name: 'hodl', weight: 6, riskBias: 'low', leverageRange: [1, 1], freqBias: 'monthly' },
            { name: 'swing', weight: 12, riskBias: 'medium', leverageRange: [1, 3], freqBias: 'daily' },
            { name: 'momentum', weight: 10, riskBias: 'medium', leverageRange: [1, 3], freqBias: 'daily' },
            { name: 'scalp', weight: 8, riskBias: 'high', leverageRange: [2, 5], freqBias: 'hourly' },
            { name: 'breakout', weight: 6, riskBias: 'high', leverageRange: [2, 4], freqBias: 'daily' },
            { name: 'range', weight: 7, riskBias: 'medium', leverageRange: [1, 2], freqBias: 'daily' },
            { name: 'grid', weight: 5, riskBias: 'medium', leverageRange: [1, 2], freqBias: 'hourly' },
            { name: 'arbitrage', weight: 4, riskBias: 'low', leverageRange: [1, 1], freqBias: 'hourly' },
            { name: 'yield', weight: 8, riskBias: 'low', leverageRange: [1, 1], freqBias: 'weekly' },
            { name: 'leverage', weight: 6, riskBias: 'high', leverageRange: [3, 10], freqBias: 'daily' },
            { name: 'meme', weight: 5, riskBias: 'extreme', leverageRange: [1, 1], freqBias: 'hourly' },
            { name: 'news', weight: 4, riskBias: 'high', leverageRange: [1, 3], freqBias: 'daily' },
            { name: 'technical', weight: 10, riskBias: 'medium', leverageRange: [1, 3], freqBias: 'daily' },
            { name: 'sentiment', weight: 4, riskBias: 'medium', leverageRange: [1, 2], freqBias: 'daily' },
            { name: 'quant', weight: 5, riskBias: 'medium', leverageRange: [1, 3], freqBias: 'hourly' },
            { name: 'copy', weight: 3, riskBias: 'medium', leverageRange: [1, 2], freqBias: 'daily' },
            { name: 'airdrop', weight: 3, riskBias: 'extreme', leverageRange: [1, 1], freqBias: 'weekly' },
            { name: 'nft', weight: 2, riskBias: 'extreme', leverageRange: [1, 1], freqBias: 'daily' },
            { name: 'defi', weight: 6, riskBias: 'medium', leverageRange: [1, 1], freqBias: 'daily' },
            { name: 'staking', weight: 5, riskBias: 'low', leverageRange: [1, 1], freqBias: 'monthly' },
            { name: 'options', weight: 3, riskBias: 'high', leverageRange: [1, 5], freqBias: 'weekly' },
            { name: 'funding', weight: 3, riskBias: 'medium', leverageRange: [1, 2], freqBias: 'daily' },
            { name: 'macro', weight: 4, riskBias: 'medium', leverageRange: [1, 3], freqBias: 'weekly' },
            { name: 'onchain', weight: 4, riskBias: 'medium', leverageRange: [1, 1], freqBias: 'daily' },
            { name: 'sniper', weight: 3, riskBias: 'extreme', leverageRange: [1, 1], freqBias: 'hourly' },
            { name: 'reversal', weight: 4, riskBias: 'high', leverageRange: [2, 4], freqBias: 'daily' },
            { name: 'trend', weight: 8, riskBias: 'medium', leverageRange: [1, 3], freqBias: 'daily' },
            { name: 'mean-revert', weight: 5, riskBias: 'medium', leverageRange: [1, 2], freqBias: 'daily' },
            { name: 'volatility', weight: 4, riskBias: 'high', leverageRange: [2, 4], freqBias: 'daily' },
        ],

        assetGroups: [
            { name: 'btc-only', assets: ['BTC'], weight: 15 },
            { name: 'eth-only', assets: ['ETH'], weight: 10 },
            { name: 'btc-eth', assets: ['BTC', 'ETH'], weight: 20 },
            { name: 'majors', assets: ['BTC', 'ETH', 'SOL'], weight: 15 },
            { name: 'top10', assets: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA'], weight: 8 },
            { name: 'sol-eco', assets: ['SOL', 'JTO', 'PYTH', 'BONK', 'WIF'], weight: 6 },
            { name: 'eth-l2', assets: ['ETH', 'ARB', 'OP', 'MATIC'], weight: 8 },
            { name: 'defi', assets: ['ETH', 'LINK', 'UNI', 'AAVE', 'MKR'], weight: 5 },
            { name: 'alt-rotation', assets: ['SOL', 'AVAX', 'NEAR', 'FTM', 'ATOM'], weight: 6 },
            { name: 'meme', assets: ['DOGE', 'SHIB', 'PEPE', 'WIF', 'BONK'], weight: 4 },
            { name: 'lowcap', assets: ['lowcap'], weight: 3 },
        ],

        venues: [
            { name: 'cex', weight: 35 },
            { name: 'dex', weight: 30 },
            { name: 'perps', weight: 35 },
        ],

        nameTemplates: {
            prefixes: [
                'Alpha', 'Beta', 'Crypto', 'Digital', 'Quantum', 'Neural', 'Smart', 'Auto',
                'Pro', 'Elite', 'Prime', 'Ultra', 'Mega', 'Super', 'Hyper', 'Turbo',
                'Swift', 'Flash', 'Quick', 'Rapid', 'Lightning', 'Thunder', 'Storm',
                'Iron', 'Steel', 'Diamond', 'Golden', 'Silver', 'Platinum', 'Titanium',
                'Shadow', 'Ghost', 'Phantom', 'Stealth', 'Silent', 'Ninja', 'Samurai',
                'Bull', 'Bear', 'Whale', 'Shark', 'Wolf', 'Eagle', 'Hawk', 'Falcon',
                'Moon', 'Star', 'Solar', 'Lunar', 'Cosmic', 'Galaxy', 'Stellar',
                'Deep', 'High', 'Top', 'Peak', 'Summit', 'Apex', 'Zenith',
                'Zen', 'Calm', 'Steady', 'Safe', 'Secure', 'Solid', 'Rock',
                'Fire', 'Ice', 'Wind', 'Earth', 'Water', 'Nature', 'Forest',
                'Tech', 'Data', 'Logic', 'Code', 'Algo', 'Bot', 'AI', 'ML',
                'Yield', 'Profit', 'Gain', 'Growth', 'Rise', 'Pump', 'Stack',
                'DeFi', 'Web3', 'Chain', 'Block', 'Hash', 'Node', 'Layer',
                'Degen', 'Ape', 'Chad', 'Based', 'Sigma', 'Giga', 'Mega',
            ],
            suffixes: [
                'Trader', 'Master', 'Pro', 'King', 'Queen', 'Lord', 'Boss',
                'Hunter', 'Sniper', 'Scout', 'Seeker', 'Finder', 'Tracker',
                'Bot', 'AI', 'System', 'Engine', 'Machine', 'Algorithm',
                'Capital', 'Fund', 'Ventures', 'Holdings', 'Assets', 'Wealth',
                'Strategy', 'Tactics', 'Method', 'Protocol', 'Formula',
                'Gains', 'Profits', 'Returns', 'Yields', 'Income', 'Alpha',
                'Wizard', 'Sage', 'Oracle', 'Prophet', 'Guru', 'Sensei',
                'Warrior', 'Knight', 'Guardian', 'Defender', 'Champion',
                'Labs', 'Research', 'Analytics', 'Insights', 'Intel',
                'Network', 'Collective', 'Guild', 'Syndicate', 'Alliance',
                'Express', 'Direct', 'Prime', 'Select', 'Elite', 'VIP',
                'X', 'Plus', 'Max', 'Ultra', 'Extreme', 'Turbo', 'Boost',
            ],
            numbers: ['', '', '', '1', '2', '3', '7', '9', '11', '21', '42', '69', '88', '99', '100', '247', '365', '420', '1000'],
        },

        avatars: [
            '🤖', '💰', '📈', '📊', '💹', '🎯', '🔥', '⚡', '💎', '🚀',
            '🐋', '🦈', '🦅', '🐺', '🦁', '🐂', '🐻', '🦊', '🐲', '🦄',
            '👑', '🎪', '🎰', '🎲', '🏆', '🥇', '🌟', '⭐', '✨', '💫',
            '🔮', '🧠', '👁️', '🎱', '🔷', '🔶', '💠', '🔹', '🔸', '⬡',
            '🌙', '☀️', '🌊', '🔱', '⚔️', '🛡️', '🏴‍☠️', '🎭', '🃏', '♠️',
            '₿', 'Ξ', '◎', '🪙', '💵', '💴', '💶', '💷', '💲', '🏦',
            '📱', '💻', '🖥️', '⌨️', '🔐', '🔑', '⚙️', '🔧', '🛠️', '📡',
            '🌐', '🕸️', '🔗', '⛓️', '🧬', '🔬', '🧪', '⚗️', '🔭', '📐',
        ],

        descriptions: {
            dca: ['Dollar cost averaging', 'Systematic buying', 'Regular accumulation', 'Time-based entries'],
            hodl: ['Long-term holding', 'Diamond hands strategy', 'Buy and hold', 'Patient accumulator'],
            swing: ['Swing trading setups', 'Multi-day positions', 'Trend riding', 'Position trading'],
            momentum: ['Momentum plays', 'Following strength', 'Trend momentum', 'Breakout momentum'],
            scalp: ['Quick scalps', 'Micro profits', 'High frequency', 'Rapid fire trading'],
            breakout: ['Breakout hunting', 'Range escapes', 'Volatility breakouts', 'Pattern breaks'],
            range: ['Range trading', 'Support/resistance', 'Channel trading', 'Mean reversion'],
            grid: ['Grid bot strategy', 'Automated grids', 'DCA grids', 'Range grids'],
            arbitrage: ['Cross-exchange arb', 'DEX arbitrage', 'Price inefficiencies', 'Risk-free profits'],
            yield: ['Yield optimization', 'APY hunting', 'Farm rotation', 'Yield aggregation'],
            leverage: ['Leveraged positions', 'Margin trading', 'Amplified returns', 'High conviction'],
            meme: ['Meme coin plays', 'Degen trades', 'Viral tokens', 'Community coins'],
            news: ['News trading', 'Event driven', 'Catalyst plays', 'Information edge'],
            technical: ['Technical analysis', 'Chart patterns', 'Indicator based', 'TA signals'],
            sentiment: ['Sentiment analysis', 'Social signals', 'Fear & greed', 'Market psychology'],
            quant: ['Quantitative strategies', 'Algo trading', 'Statistical edge', 'Data driven'],
            copy: ['Whale watching', 'Smart money follows', 'Copy trading', 'Mirror trades'],
            airdrop: ['Airdrop farming', 'Protocol hunting', 'Early adoption', 'Token claims'],
            nft: ['NFT trading', 'Digital collectibles', 'Floor sweeping', 'Flip strategy'],
            defi: ['DeFi protocols', 'Liquidity provision', 'Protocol interactions', 'TVL plays'],
            staking: ['Staking rewards', 'Validator income', 'PoS yields', 'Lock & earn'],
            options: ['Options strategies', 'Derivatives trading', 'Premium selling', 'Volatility plays'],
            funding: ['Funding rate arb', 'Carry trades', 'Basis trading', 'Rate harvesting'],
            macro: ['Macro trading', 'Big picture plays', 'Economic cycles', 'Global trends'],
            onchain: ['On-chain analysis', 'Blockchain data', 'Wallet tracking', 'Flow analysis'],
            sniper: ['Token sniping', 'Launch hunting', 'Early entries', 'Speed advantage'],
            reversal: ['Reversal trading', 'Counter-trend', 'Bounce plays', 'Oversold hunting'],
            trend: ['Trend following', 'Ride the wave', 'Directional bias', 'Trend continuation'],
            'mean-revert': ['Mean reversion', 'Fade extremes', 'Reversion plays', 'Statistical mean'],
            volatility: ['Volatility trading', 'Vol expansion', 'Range breaks', 'IV plays'],
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // PROCEDURAL TRADER GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    traders: [], // Will be populated on init
    traderStats: {},
    traderIndex: {}, // For fast lookup
    simulationRunning: false,
    lastUpdate: 0,

    // Seeded random for reproducibility
    seed: 12345,
    random() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    },

    resetSeed() {
        this.seed = 12345;
    },

    weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
        let rand = this.random() * totalWeight;
        for (const item of items) {
            rand -= item.weight || 1;
            if (rand <= 0) return item;
        }
        return items[items.length - 1];
    },

    generateTraderName(style, index) {
        const t = this.templates.nameTemplates;
        const prefix = t.prefixes[Math.floor(this.random() * t.prefixes.length)];
        const suffix = t.suffixes[Math.floor(this.random() * t.suffixes.length)];
        const num = t.numbers[Math.floor(this.random() * t.numbers.length)];

        // Various name formats
        const formats = [
            `${prefix} ${suffix}`,
            `${prefix}${suffix}`,
            `${prefix} ${suffix}${num}`,
            `${prefix}${num}`,
            `The ${prefix} ${suffix}`,
            `${prefix}'s ${suffix}`,
        ];

        return formats[Math.floor(this.random() * formats.length)];
    },

    generateTrader(index) {
        const style = this.weightedRandom(this.templates.styles);
        const assetGroup = this.weightedRandom(this.templates.assetGroups);
        const venue = this.weightedRandom(this.templates.venues);

        // Determine risk level based on style bias with some randomness
        const riskLevels = ['low', 'medium', 'high', 'extreme'];
        const riskIndex = riskLevels.indexOf(style.riskBias);
        const riskVariance = Math.floor(this.random() * 3) - 1; // -1, 0, or 1
        const finalRiskIndex = Math.max(0, Math.min(3, riskIndex + riskVariance));
        const riskLevel = riskLevels[finalRiskIndex];

        // Leverage based on style and risk
        const [minLev, maxLev] = style.leverageRange;
        let leverage = Math.floor(minLev + this.random() * (maxLev - minLev + 1));
        if (riskLevel === 'extreme' && maxLev >= 5) leverage = Math.min(leverage + 2, 20);
        if (riskLevel === 'low') leverage = Math.min(leverage, 2);

        // Trading frequency
        const freqs = ['hourly', 'daily', 'weekly', 'monthly'];
        const freqIndex = freqs.indexOf(style.freqBias);
        const freqVariance = Math.floor(this.random() * 3) - 1;
        const finalFreqIndex = Math.max(0, Math.min(3, freqIndex + freqVariance));
        const tradingFreq = freqs[finalFreqIndex];

        // Average trade size based on risk
        const tradeSizeRanges = {
            low: [500, 5000],
            medium: [200, 3000],
            high: [100, 2000],
            extreme: [50, 500]
        };
        const [minSize, maxSize] = tradeSizeRanges[riskLevel];
        const avgTradeSize = Math.floor(minSize + this.random() * (maxSize - minSize));

        const descriptions = this.templates.descriptions[style.name] || ['Trading strategy'];
        const description = descriptions[Math.floor(this.random() * descriptions.length)];
        const avatar = this.templates.avatars[Math.floor(this.random() * this.templates.avatars.length)];

        return {
            id: `trader-${index.toString().padStart(5, '0')}`,
            name: this.generateTraderName(style.name, index),
            avatar,
            style: style.name,
            assets: assetGroup.assets,
            assetGroup: assetGroup.name,
            leverage,
            riskLevel,
            tradingFreq,
            avgTradeSize,
            venue: venue.name,
            description,
            generated: true
        };
    },

    generateAllTraders() {
        console.log(`[TraderSim] Generating ${this.TOTAL_TRADERS} traders...`);
        this.resetSeed();
        this.traders = [];
        this.traderIndex = {};

        for (let i = 0; i < this.TOTAL_TRADERS; i++) {
            const trader = this.generateTrader(i);
            this.traders.push(trader);
            this.traderIndex[trader.id] = trader;
        }

        console.log(`[TraderSim] Generated ${this.traders.length} traders`);

        // Log distribution
        const riskDist = { low: 0, medium: 0, high: 0, extreme: 0 };
        this.traders.forEach(t => riskDist[t.riskLevel]++);
        console.log('[TraderSim] Risk distribution:', riskDist);
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    init() {
        this.generateAllTraders();
        this.loadStats();
        this.initializeTraderStats();
        this.startSimulation();
        console.log(`[TraderSim] Initialized ${this.traders.length} traders with realistic conditions`);
    },

    loadStats() {
        const saved = localStorage.getItem('obelisk_trader_sim_stats_v2');
        if (saved) {
            try {
                this.traderStats = JSON.parse(saved);
            } catch (e) {
                this.traderStats = {};
            }
        }
    },

    saveStats() {
        // Only save stats for traders with activity (to save space)
        const activeStats = {};
        let count = 0;
        for (const [id, stats] of Object.entries(this.traderStats)) {
            if (stats.trades > 0) {
                activeStats[id] = stats;
                count++;
            }
        }
        // Limit storage to prevent overflow
        if (count > 500) {
            // Keep only most active traders
            const sorted = Object.entries(activeStats)
                .sort((a, b) => b[1].trades - a[1].trades)
                .slice(0, 500);
            localStorage.setItem('obelisk_trader_sim_stats_v2', JSON.stringify(Object.fromEntries(sorted)));
        } else {
            localStorage.setItem('obelisk_trader_sim_stats_v2', JSON.stringify(activeStats));
        }
    },

    initializeTraderStats() {
        const now = Date.now();
        // Only initialize stats for first 200 traders upfront, others on-demand
        const batchSize = Math.min(200, this.traders.length);

        for (let i = 0; i < batchSize; i++) {
            const trader = this.traders[i];
            if (!this.traderStats[trader.id]) {
                this.traderStats[trader.id] = this.generateInitialStats(trader, now);
            }
        }
        this.saveStats();
    },

    ensureTraderStats(traderId) {
        if (!this.traderStats[traderId]) {
            const trader = this.traderIndex[traderId];
            if (trader) {
                this.traderStats[traderId] = this.generateInitialStats(trader, Date.now());
            }
        }
        return this.traderStats[traderId];
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // REALISTIC STATS GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    generateInitialStats(trader, now) {
        const baseWinRates = {
            'dca': 0.65, 'hodl': 0.60, 'yield': 0.70, 'staking': 0.75,
            'swing': 0.52, 'momentum': 0.48, 'range': 0.55, 'grid': 0.58,
            'scalp': 0.51, 'breakout': 0.45, 'leverage': 0.42,
            'meme': 0.35, 'nft': 0.38, 'sniper': 0.30, 'airdrop': 0.40,
            'arbitrage': 0.85, 'funding': 0.72, 'technical': 0.52,
            'trend': 0.50, 'mean-revert': 0.54, 'reversal': 0.44,
            'quant': 0.55, 'sentiment': 0.48, 'news': 0.46,
            'defi': 0.58, 'options': 0.45, 'macro': 0.50,
            'onchain': 0.52, 'copy': 0.50, 'volatility': 0.47,
            'default': 0.50
        };

        const baseWinRate = baseWinRates[trader.style] || baseWinRates.default;
        const winRateVariance = (Math.random() - 0.5) * 0.15;
        const winRate = Math.max(0.25, Math.min(0.90, baseWinRate + winRateVariance));

        const monthlyReturnByRisk = {
            'low': { mean: 0.015, std: 0.02 },
            'medium': { mean: 0.03, std: 0.05 },
            'high': { mean: 0.05, std: 0.10 },
            'extreme': { mean: 0.02, std: 0.25 },
        };

        const returnProfile = monthlyReturnByRisk[trader.riskLevel] || monthlyReturnByRisk.medium;
        const history = this.generateTradeHistory(trader, returnProfile, 90);

        const trades = history.length;
        const wins = history.filter(t => t.pnl > 0).length;
        const totalPnl = history.reduce((sum, t) => sum + t.pnl, 0);
        const totalFees = history.reduce((sum, t) => sum + t.fees, 0);
        const totalVolume = history.reduce((sum, t) => sum + t.size, 0);

        const last7d = history.filter(t => t.timestamp > now - 7 * 86400000);
        const last30d = history.filter(t => t.timestamp > now - 30 * 86400000);

        const pnl7d = last7d.reduce((sum, t) => sum + t.pnl, 0);
        const pnl30d = last30d.reduce((sum, t) => sum + t.pnl, 0);

        const startingCapital = trader.avgTradeSize * 20;

        return {
            startingCapital,
            currentCapital: startingCapital + totalPnl,
            totalPnl,
            totalFees,
            totalVolume,
            trades,
            wins,
            winRate: trades > 0 ? wins / trades : 0.5,
            pnl7d,
            pnl30d,
            pnl7dPercent: (pnl7d / startingCapital) * 100,
            pnl30dPercent: (pnl30d / startingCapital) * 100,
            maxDrawdown: this.calculateMaxDrawdown(history, startingCapital),
            sharpeRatio: this.calculateSharpe(history),
            avgTradeReturn: trades > 0 ? totalPnl / trades : 0,
            avgWin: wins > 0 ? history.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0) / wins : 0,
            avgLoss: (trades - wins) > 0 ? history.filter(t => t.pnl <= 0).reduce((s, t) => s + t.pnl, 0) / (trades - wins) : 0,
            followers: Math.floor(Math.random() * 10000) + 50,
            copiers: Math.floor(Math.random() * 1000) + 5,
            history: history.slice(-50),
            lastUpdate: now
        };
    },

    generateTradeHistory(trader, returnProfile, days) {
        const history = [];
        const now = Date.now();
        const msPerDay = 86400000;

        const tradesPerDay = { 'hourly': 8, 'daily': 2, 'weekly': 0.3, 'monthly': 0.1 };
        const dailyTrades = tradesPerDay[trader.tradingFreq] || 1;

        for (let d = days; d > 0; d--) {
            const dayTrades = Math.floor(dailyTrades + (Math.random() - 0.5));
            for (let t = 0; t < Math.max(0, dayTrades); t++) {
                const trade = this.simulateTrade(trader, returnProfile, now - d * msPerDay + t * 3600000);
                history.push(trade);
            }
        }
        return history;
    },

    simulateTrade(trader, returnProfile, timestamp) {
        const mc = this.marketConditions;
        const asset = trader.assets[Math.floor(Math.random() * trader.assets.length)];

        const sizeVariance = 0.5 + Math.random();
        const size = trader.avgTradeSize * sizeVariance;
        const isLong = Math.random() > 0.45;

        const fees = mc.fees[trader.venue] || mc.fees.cex;
        const spread = mc.spreads[asset] || mc.spreads.altcoin;
        const slippage = size < 1000 ? mc.slippageModel.small :
                        size < 10000 ? mc.slippageModel.medium :
                        size < 100000 ? mc.slippageModel.large : mc.slippageModel.whale;

        const tradingCost = size * (fees.taker + spread + slippage) * 2;
        const leverageCost = trader.leverage > 1 ? size * 0.0001 * trader.leverage : 0;
        const gasFee = mc.gasFees[trader.venue === 'dex' ? 'arbitrum' : 'arbitrum'] || 0.20;
        const totalFees = tradingCost + leverageCost + gasFee * 2;

        const u1 = Math.random();
        const u2 = Math.random();
        const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

        const dailyMean = returnProfile.mean / 30;
        const dailyStd = returnProfile.std / Math.sqrt(30);

        let grossReturn = (dailyMean + normalRandom * dailyStd) * size * trader.leverage;

        if (trader.leverage > 3 && Math.random() < 0.1) {
            grossReturn = -size * 0.5;
        }

        const pnl = grossReturn - totalFees;

        return {
            timestamp,
            asset,
            side: isLong ? 'long' : 'short',
            size,
            leverage: trader.leverage,
            grossReturn,
            fees: totalFees,
            pnl,
            venue: trader.venue
        };
    },

    calculateMaxDrawdown(history, startingCapital) {
        let peak = startingCapital;
        let maxDD = 0;
        let runningCapital = startingCapital;

        history.forEach(trade => {
            runningCapital += trade.pnl;
            if (runningCapital > peak) peak = runningCapital;
            const dd = (peak - runningCapital) / peak;
            if (dd > maxDD) maxDD = dd;
        });

        return maxDD * 100;
    },

    calculateSharpe(history) {
        if (history.length < 10) return 0;

        const returns = history.map(t => t.pnl / (t.size || 1));
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
        const std = Math.sqrt(variance);

        if (std === 0) return 0;
        return (avgReturn * 365 - 0.05) / (std * Math.sqrt(365));
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // SIMULATION LOOP
    // ═══════════════════════════════════════════════════════════════════════════════

    startSimulation() {
        if (this.simulationRunning) return;
        this.simulationRunning = true;
        setInterval(() => this.updateActiveTraders(), 300000); // Every 5 min
        this.updateActiveTraders();
    },

    updateActiveTraders() {
        const now = Date.now();
        // Only update traders that have stats initialized
        const tradersToUpdate = Object.keys(this.traderStats).slice(0, 100);

        tradersToUpdate.forEach(traderId => {
            const trader = this.traderIndex[traderId];
            const stats = this.traderStats[traderId];
            if (!trader || !stats) return;

            const hoursSinceUpdate = (now - stats.lastUpdate) / 3600000;
            const tradesPerHour = { 'hourly': 1, 'daily': 0.08, 'weekly': 0.006, 'monthly': 0.0014 };

            const expectedTrades = (tradesPerHour[trader.tradingFreq] || 0.08) * hoursSinceUpdate;
            const newTrades = Math.floor(expectedTrades + (Math.random() < (expectedTrades % 1) ? 1 : 0));

            if (newTrades > 0) {
                const returnProfile = {
                    'low': { mean: 0.015, std: 0.02 },
                    'medium': { mean: 0.03, std: 0.05 },
                    'high': { mean: 0.05, std: 0.10 },
                    'extreme': { mean: 0.02, std: 0.25 },
                }[trader.riskLevel] || { mean: 0.03, std: 0.05 };

                for (let i = 0; i < newTrades; i++) {
                    const trade = this.simulateTrade(trader, returnProfile, now);

                    stats.trades++;
                    stats.totalPnl += trade.pnl;
                    stats.totalFees += trade.fees;
                    stats.totalVolume += trade.size;
                    stats.currentCapital += trade.pnl;

                    if (trade.pnl > 0) stats.wins++;
                    stats.winRate = stats.wins / stats.trades;

                    stats.history.push(trade);
                    if (stats.history.length > 100) stats.history.shift();
                }

                const last7d = stats.history.filter(t => t.timestamp > now - 7 * 86400000);
                const last30d = stats.history.filter(t => t.timestamp > now - 30 * 86400000);

                stats.pnl7d = last7d.reduce((sum, t) => sum + t.pnl, 0);
                stats.pnl30d = last30d.reduce((sum, t) => sum + t.pnl, 0);
                stats.pnl7dPercent = (stats.pnl7d / stats.startingCapital) * 100;
                stats.pnl30dPercent = (stats.pnl30d / stats.startingCapital) * 100;

                stats.lastUpdate = now;
            }
        });

        this.saveStats();
        this.lastUpdate = now;
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════════

    getTraders(filter = {}) {
        let result = this.traders.map(t => ({
            ...t,
            stats: this.ensureTraderStats(t.id) || {}
        }));

        if (filter.riskLevel) {
            result = result.filter(t => t.riskLevel === filter.riskLevel);
        }
        if (filter.style) {
            result = result.filter(t => t.style === filter.style);
        }
        if (filter.venue) {
            result = result.filter(t => t.venue === filter.venue);
        }
        if (filter.assetGroup) {
            result = result.filter(t => t.assetGroup === filter.assetGroup);
        }
        if (filter.search) {
            const search = filter.search.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(search) ||
                t.description.toLowerCase().includes(search) ||
                t.style.includes(search)
            );
        }

        if (filter.sortBy) {
            const sortKey = filter.sortBy;
            result.sort((a, b) => {
                const aVal = a.stats[sortKey] || 0;
                const bVal = b.stats[sortKey] || 0;
                return filter.sortDesc ? bVal - aVal : aVal - bVal;
            });
        }

        // Pagination
        const offset = filter.offset || 0;
        const limit = filter.limit || 50;
        return result.slice(offset, offset + limit);
    },

    getTrader(id) {
        const trader = this.traderIndex[id];
        if (!trader) return null;
        return {
            ...trader,
            stats: this.ensureTraderStats(id) || {}
        };
    },

    getTotalCount(filter = {}) {
        let count = this.traders.length;
        if (filter.riskLevel) {
            count = this.traders.filter(t => t.riskLevel === filter.riskLevel).length;
        }
        return count;
    },

    getLeaderboard(period = '30d', limit = 20) {
        const key = period === '7d' ? 'pnl7dPercent' : 'pnl30dPercent';
        return this.getTraders({ sortBy: key, sortDesc: true, limit });
    },

    getRiskCategories() {
        return ['low', 'medium', 'high', 'extreme'].map(risk => ({
            risk,
            count: this.traders.filter(t => t.riskLevel === risk).length
        }));
    },

    getStyleCategories() {
        const styles = {};
        this.traders.forEach(t => {
            styles[t.style] = (styles[t.style] || 0) + 1;
        });
        return Object.entries(styles)
            .map(([style, count]) => ({ style, count }))
            .sort((a, b) => b.count - a.count);
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // DETAILED TRADE HISTORY & ANALYTICS
    // ═══════════════════════════════════════════════════════════════════════════════

    getTradeHistory(traderId, limit = 100) {
        const stats = this.ensureTraderStats(traderId);
        if (!stats || !stats.history) return [];

        return stats.history.slice(-limit).map((trade, idx) => ({
            ...trade,
            id: `${traderId}-trade-${idx}`,
            date: new Date(trade.timestamp).toLocaleString(),
            pnlPercent: ((trade.pnl / trade.size) * 100).toFixed(2),
            roi: ((trade.grossReturn / trade.size) * 100).toFixed(2),
            feesPercent: ((trade.fees / trade.size) * 100).toFixed(3),
            isWin: trade.pnl > 0
        }));
    },

    getEquityCurve(traderId) {
        const stats = this.ensureTraderStats(traderId);
        if (!stats || !stats.history) return [];

        let equity = stats.startingCapital;
        const curve = [{ timestamp: stats.history[0]?.timestamp - 86400000 || Date.now() - 90 * 86400000, equity, pnl: 0 }];

        stats.history.forEach(trade => {
            equity += trade.pnl;
            curve.push({
                timestamp: trade.timestamp,
                date: new Date(trade.timestamp).toLocaleDateString(),
                equity: equity,
                pnl: trade.pnl,
                cumulativePnl: equity - stats.startingCapital
            });
        });

        return curve;
    },

    getDailyReturns(traderId) {
        const stats = this.ensureTraderStats(traderId);
        if (!stats || !stats.history) return [];

        const dailyMap = {};
        stats.history.forEach(trade => {
            const day = new Date(trade.timestamp).toISOString().split('T')[0];
            if (!dailyMap[day]) {
                dailyMap[day] = { date: day, trades: 0, pnl: 0, fees: 0, volume: 0, wins: 0 };
            }
            dailyMap[day].trades++;
            dailyMap[day].pnl += trade.pnl;
            dailyMap[day].fees += trade.fees;
            dailyMap[day].volume += trade.size;
            if (trade.pnl > 0) dailyMap[day].wins++;
        });

        return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    },

    getDetailedStats(traderId) {
        const trader = this.getTrader(traderId);
        if (!trader) return null;

        const stats = trader.stats;
        const history = stats.history || [];

        const winningTrades = history.filter(t => t.pnl > 0);
        const losingTrades = history.filter(t => t.pnl <= 0);

        let maxWinStreak = 0, maxLoseStreak = 0;
        let tempWinStreak = 0, tempLoseStreak = 0;
        let currentStreak = 0;

        history.forEach(t => {
            if (t.pnl > 0) {
                tempWinStreak++;
                tempLoseStreak = 0;
                if (tempWinStreak > maxWinStreak) maxWinStreak = tempWinStreak;
            } else {
                tempLoseStreak++;
                tempWinStreak = 0;
                if (tempLoseStreak > maxLoseStreak) maxLoseStreak = tempLoseStreak;
            }
        });

        for (let i = history.length - 1; i >= 0; i--) {
            if (i === history.length - 1) {
                currentStreak = history[i].pnl > 0 ? 1 : -1;
            } else {
                const lastWin = history[history.length - 1].pnl > 0;
                const thisWin = history[i].pnl > 0;
                if (lastWin === thisWin) {
                    currentStreak += lastWin ? 1 : -1;
                } else break;
            }
        }

        const sortedByPnl = [...history].sort((a, b) => b.pnl - a.pnl);
        const bestTrade = sortedByPnl[0] || null;
        const worstTrade = sortedByPnl[sortedByPnl.length - 1] || null;

        const assetPerf = {};
        history.forEach(t => {
            if (!assetPerf[t.asset]) assetPerf[t.asset] = { trades: 0, pnl: 0, wins: 0 };
            assetPerf[t.asset].trades++;
            assetPerf[t.asset].pnl += t.pnl;
            if (t.pnl > 0) assetPerf[t.asset].wins++;
        });

        const venuePerf = {};
        history.forEach(t => {
            if (!venuePerf[t.venue]) venuePerf[t.venue] = { trades: 0, pnl: 0, fees: 0 };
            venuePerf[t.venue].trades++;
            venuePerf[t.venue].pnl += t.pnl;
            venuePerf[t.venue].fees += t.fees;
        });

        const grossProfit = winningTrades.reduce((s, t) => s + t.pnl, 0);
        const grossLoss = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0));
        const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : '∞';

        return {
            totalTrades: stats.trades,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate: (stats.winRate * 100).toFixed(1),
            totalPnl: stats.totalPnl.toFixed(2),
            totalFees: stats.totalFees.toFixed(2),
            netPnl: (stats.totalPnl - stats.totalFees).toFixed(2),
            totalVolume: stats.totalVolume.toFixed(2),
            avgWin: winningTrades.length > 0 ? (winningTrades.reduce((s, t) => s + t.pnl, 0) / winningTrades.length).toFixed(2) : '0.00',
            avgLoss: losingTrades.length > 0 ? (losingTrades.reduce((s, t) => s + t.pnl, 0) / losingTrades.length).toFixed(2) : '0.00',
            avgTrade: history.length > 0 ? (stats.totalPnl / history.length).toFixed(2) : '0.00',
            avgTradeSize: history.length > 0 ? (stats.totalVolume / history.length).toFixed(2) : '0.00',
            maxDrawdown: stats.maxDrawdown.toFixed(1),
            sharpeRatio: stats.sharpeRatio.toFixed(2),
            profitFactor,
            currentStreak,
            maxWinStreak,
            maxLoseStreak,
            bestTrade: bestTrade ? { ...bestTrade, date: new Date(bestTrade.timestamp).toLocaleString() } : null,
            worstTrade: worstTrade ? { ...worstTrade, date: new Date(worstTrade.timestamp).toLocaleString() } : null,
            assetPerformance: assetPerf,
            venuePerformance: venuePerf,
            tradingDays: Math.ceil((Date.now() - (history[0]?.timestamp || Date.now())) / 86400000),
            startingCapital: stats.startingCapital.toFixed(2),
            currentCapital: stats.currentCapital.toFixed(2),
            returnPercent: ((stats.currentCapital - stats.startingCapital) / stats.startingCapital * 100).toFixed(2)
        };
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRADER PROFILE MODAL
    // ═══════════════════════════════════════════════════════════════════════════════

    showTraderProfile(traderId) {
        const trader = this.getTrader(traderId);
        if (!trader) return;

        const stats = this.getDetailedStats(traderId);
        const history = this.getTradeHistory(traderId, 50);
        const equityCurve = this.getEquityCurve(traderId);
        const dailyReturns = this.getDailyReturns(traderId);

        const riskColors = { low: '#00ff88', medium: '#ffaa00', high: '#ff6644', extreme: '#ff0044' };
        const riskColor = riskColors[trader.riskLevel] || '#888';

        const modal = document.createElement('div');
        modal.id = 'trader-profile-modal';
        modal.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;`;

        modal.innerHTML = `
            <div style="background:#1a1a2e;border-radius:16px;max-width:1200px;width:100%;max-height:90vh;overflow:auto;position:relative;">
                <div style="background:linear-gradient(135deg,${riskColor}22,transparent);padding:24px;border-bottom:1px solid rgba(255,255,255,0.1);">
                    <button onclick="document.getElementById('trader-profile-modal').remove()" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.1);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:20px;">×</button>
                    <div style="display:flex;gap:16px;align-items:center;">
                        <div style="width:64px;height:64px;background:linear-gradient(135deg,${riskColor},#333);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;">${trader.avatar}</div>
                        <div style="flex:1;">
                            <h2 style="margin:0;color:#fff;font-size:24px;">${trader.name}</h2>
                            <p style="margin:4px 0 0;color:#888;">${trader.description}</p>
                            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
                                <span style="background:${riskColor};color:#000;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">${trader.riskLevel.toUpperCase()}</span>
                                <span style="background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:4px;font-size:11px;">${trader.style}</span>
                                <span style="background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:4px;font-size:11px;">${trader.venue.toUpperCase()}</span>
                                <span style="background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:4px;font-size:11px;">${trader.leverage}x</span>
                                <span style="background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:4px;font-size:11px;">${trader.assets.join(', ')}</span>
                                <span style="background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:4px;font-size:11px;">ID: ${trader.id}</span>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:28px;font-weight:bold;color:${parseFloat(stats.returnPercent)>=0?'#00ff88':'#ff4466'};">${parseFloat(stats.returnPercent)>=0?'+':''}${stats.returnPercent}%</div>
                            <div style="color:#888;font-size:12px;">Total Return (${stats.tradingDays}d)</div>
                        </div>
                    </div>
                </div>

                <div style="padding:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
                    ${this.renderStatCard('Capital', `$${stats.startingCapital}`, `→ $${stats.currentCapital}`, parseFloat(stats.currentCapital)>=parseFloat(stats.startingCapital))}
                    ${this.renderStatCard('Total PnL', `$${stats.totalPnl}`, `Fees: $${stats.totalFees}`, parseFloat(stats.totalPnl)>=0)}
                    ${this.renderStatCard('Win Rate', `${stats.winRate}%`, `${stats.winningTrades}W / ${stats.losingTrades}L`, parseFloat(stats.winRate)>=50)}
                    ${this.renderStatCard('Avg Win/Loss', `$${stats.avgWin}`, `$${stats.avgLoss}`, true)}
                    ${this.renderStatCard('Max Drawdown', `${stats.maxDrawdown}%`, 'Peak to trough', false)}
                    ${this.renderStatCard('Sharpe Ratio', stats.sharpeRatio, 'Risk-adjusted', parseFloat(stats.sharpeRatio)>1)}
                    ${this.renderStatCard('Profit Factor', stats.profitFactor, 'Gross P/L', parseFloat(stats.profitFactor)>1)}
                    ${this.renderStatCard('Volume', `$${(parseFloat(stats.totalVolume)/1000).toFixed(1)}K`, `${stats.totalTrades} trades`, true)}
                </div>

                <div style="padding:0 24px 24px;">
                    <h3 style="color:#fff;margin:0 0 12px;">📈 Equity Curve</h3>
                    <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:16px;height:180px;position:relative;">${this.renderEquityChart(equityCurve, trader.stats.startingCapital)}</div>
                </div>

                <div style="padding:0 24px 24px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:16px;">
                        <h4 style="color:#fff;margin:0 0 12px;">🔥 Streaks</h4>
                        <div style="display:grid;gap:8px;font-size:13px;">
                            <div style="display:flex;justify-content:space-between;"><span style="color:#888;">Current:</span><span style="color:${stats.currentStreak>0?'#00ff88':'#ff4466'};">${stats.currentStreak>0?'+':''}${stats.currentStreak}</span></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#888;">Best Win:</span><span style="color:#00ff88;">${stats.maxWinStreak}</span></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#888;">Worst Lose:</span><span style="color:#ff4466;">${stats.maxLoseStreak}</span></div>
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:16px;">
                        <h4 style="color:#fff;margin:0 0 12px;">🎯 Best & Worst</h4>
                        <div style="display:grid;gap:8px;font-size:13px;">
                            ${stats.bestTrade?`<div style="display:flex;justify-content:space-between;"><span style="color:#888;">Best:</span><span style="color:#00ff88;">+$${stats.bestTrade.pnl.toFixed(2)}</span></div>`:''}
                            ${stats.worstTrade?`<div style="display:flex;justify-content:space-between;"><span style="color:#888;">Worst:</span><span style="color:#ff4466;">$${stats.worstTrade.pnl.toFixed(2)}</span></div>`:''}
                        </div>
                    </div>
                </div>

                <div style="padding:0 24px 24px;">
                    <h3 style="color:#fff;margin:0 0 12px;">📊 By Asset</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;">
                        ${Object.entries(stats.assetPerformance).map(([asset,perf])=>`
                            <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;text-align:center;">
                                <div style="font-weight:bold;color:#00aaff;">${asset}</div>
                                <div style="color:${perf.pnl>=0?'#00ff88':'#ff4466'};font-size:14px;">${perf.pnl>=0?'+':''}$${perf.pnl.toFixed(0)}</div>
                                <div style="color:#888;font-size:10px;">${perf.trades}t | ${Math.round(perf.wins/perf.trades*100)}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="padding:0 24px 24px;">
                    <h3 style="color:#fff;margin:0 0 12px;">📋 Trade History (Last ${history.length})</h3>
                    <div style="background:rgba(0,0,0,0.3);border-radius:8px;overflow:hidden;max-height:300px;overflow-y:auto;">
                        <table style="width:100%;border-collapse:collapse;font-size:11px;">
                            <thead style="background:rgba(255,255,255,0.05);position:sticky;top:0;">
                                <tr>
                                    <th style="padding:8px;text-align:left;color:#888;">Date</th>
                                    <th style="padding:8px;text-align:left;color:#888;">Asset</th>
                                    <th style="padding:8px;text-align:center;color:#888;">Side</th>
                                    <th style="padding:8px;text-align:right;color:#888;">Size</th>
                                    <th style="padding:8px;text-align:right;color:#888;">Lev</th>
                                    <th style="padding:8px;text-align:right;color:#888;">Fees</th>
                                    <th style="padding:8px;text-align:right;color:#888;">PnL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${history.reverse().map(t=>`
                                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                        <td style="padding:8px;color:#888;">${t.date}</td>
                                        <td style="padding:8px;color:#00aaff;">${t.asset}</td>
                                        <td style="padding:8px;text-align:center;"><span style="background:${t.side==='long'?'rgba(0,255,136,0.2)':'rgba(255,68,102,0.2)'};color:${t.side==='long'?'#00ff88':'#ff4466'};padding:2px 6px;border-radius:4px;font-size:9px;">${t.side.toUpperCase()}</span></td>
                                        <td style="padding:8px;text-align:right;color:#fff;">$${t.size.toFixed(0)}</td>
                                        <td style="padding:8px;text-align:right;color:${t.leverage>3?'#ff6644':'#fff'};">${t.leverage}x</td>
                                        <td style="padding:8px;text-align:right;color:#888;">$${t.fees.toFixed(2)}</td>
                                        <td style="padding:8px;text-align:right;color:${t.pnl>=0?'#00ff88':'#ff4466'};font-weight:bold;">${t.pnl>=0?'+':''}$${t.pnl.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style="padding:0 24px 24px;">
                    <h3 style="color:#fff;margin:0 0 12px;">📅 Daily Returns (Last 30d)</h3>
                    <div style="display:flex;gap:3px;flex-wrap:wrap;">
                        ${dailyReturns.slice(-30).map(day=>{
                            const pnlPct = (day.pnl/(parseFloat(stats.startingCapital)||10000)*100);
                            const intensity = Math.min(Math.abs(pnlPct)*20,100);
                            const color = day.pnl>=0?`rgba(0,255,136,${intensity/100})`:`rgba(255,68,102,${intensity/100})`;
                            return `<div title="${day.date}: ${day.pnl>=0?'+':''}$${day.pnl.toFixed(2)} (${day.trades}t)" style="width:20px;height:20px;background:${color};border-radius:3px;cursor:help;"></div>`;
                        }).join('')}
                    </div>
                </div>

                <div style="padding:24px;border-top:1px solid rgba(255,255,255,0.1);display:flex;gap:12px;justify-content:flex-end;">
                    <button onclick="document.getElementById('trader-profile-modal').remove()" style="padding:12px 24px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#fff;cursor:pointer;">Close</button>
                    <button onclick="CopyTradingModule.quickCopy('${traderId}');document.getElementById('trader-profile-modal').remove();" style="padding:12px 24px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Copy Trader</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    },

    renderStatCard(label, value, subtitle, isPositive) {
        return `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;">
            <div style="color:#888;font-size:11px;margin-bottom:4px;">${label}</div>
            <div style="color:${isPositive?'#00ff88':'#ff4466'};font-size:18px;font-weight:bold;">${value}</div>
            <div style="color:#666;font-size:10px;">${subtitle}</div>
        </div>`;
    },

    renderEquityChart(curve, startingCapital) {
        if (curve.length < 2) return '<div style="color:#888;text-align:center;padding-top:60px;">Insufficient data</div>';
        const values = curve.map(p => p.equity);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        const points = curve.map((p, i) => `${(i/(curve.length-1))*100},${100-((p.equity-min)/range)*100}`).join(' ');
        const isProfit = curve[curve.length-1].equity >= startingCapital;
        const color = isProfit ? '#00ff88' : '#ff4466';
        return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;">
            <defs><linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.3"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
            <polyline fill="url(#eqGrad)" stroke="none" points="0,100 ${points} 100,100"/>
            <polyline fill="none" stroke="${color}" stroke-width="0.5" points="${points}"/>
        </svg>
        <div style="position:absolute;top:8px;left:8px;font-size:10px;color:#888;">High: $${max.toFixed(0)} | Low: $${min.toFixed(0)}</div>`;
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => TraderSimulator.init());
window.TraderSimulator = TraderSimulator;
