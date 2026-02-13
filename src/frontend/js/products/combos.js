// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - COMBOS MODULE
// Investment combo products with auto-allocation
// ═══════════════════════════════════════════════════════════════════════════════
console.log('[COMBOS] Script loading v2');

const CombosModule = {
    combos: [],
    selectedCombo: null,
    sortBy: 'minInvestment',
    sortDir: 'asc',
    budgetFilter: null,

    // Combo definitions (static data - no API needed)
    comboData: [
        // LOW MINIMUM COMBOS FOR TESTING
        {
            id: 'MICRO_STARTER',
            name: 'Micro Starter',
            icon: '🌱',
            description: 'Perfect for testing with minimal capital',
            riskLevel: 'Low',
            expectedApy: '4-8%',
            capitalProtection: '98%',
            minInvestment: 1,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'USDC Savings', percent: 70, color: '#00d4aa', apy: '4-5%', maxLoss: 1 },
                { product: 'Stable Pool', percent: 30, color: '#4a9eff', apy: '5-8%', maxLoss: 2 }
            ]
        },
        {
            id: 'MINI_YIELD',
            name: 'Mini Yield',
            icon: '💵',
            description: 'Small investment, steady returns',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '95%',
            minInvestment: 5,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'USDC Staking', percent: 50, color: '#00d4aa', apy: '5-7%', maxLoss: 2 },
                { product: 'Lending Pool', percent: 30, color: '#9966ff', apy: '8-12%', maxLoss: 5 },
                { product: 'Stable Vault', percent: 20, color: '#4a9eff', apy: '6-10%', maxLoss: 3 }
            ]
        },
        {
            id: 'STARTER_GROWTH',
            name: 'Starter Growth',
            icon: '🚀',
            description: 'Entry-level growth strategy',
            riskLevel: 'Medium',
            expectedApy: '10-20%',
            capitalProtection: '85%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Staking', percent: 40, color: '#627eea', apy: '8-12%', maxLoss: 15 },
                { product: 'USDC Vault', percent: 35, color: '#00d4aa', apy: '6-10%', maxLoss: 5 },
                { product: 'DeFi Pool', percent: 25, color: '#ff6b9d', apy: '15-25%', maxLoss: 20 }
            ]
        },
        // ═══════════════════════════════════════════════════════════════
        // MEGA MICRO COMBOS - $1 to $10 - MAXIMUM ACCESSIBILITY
        // ═══════════════════════════════════════════════════════════════
        {
            id: 'PENNY_SAVER',
            name: 'Penny Saver',
            icon: '🪙',
            description: 'Start with just $1 - Safe stablecoin yield',
            riskLevel: 'Low',
            expectedApy: '3-6%',
            capitalProtection: '99%',
            minInvestment: 1,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'USDC Savings', percent: 100, color: '#00d4aa', apy: '3-6%', maxLoss: 1 }
            ],
            features: ['$1 minimum', 'Zero risk', 'Perfect for beginners']
        },
        {
            id: 'DOLLAR_DCA',
            name: 'Dollar DCA',
            icon: '💲',
            description: 'Auto buy BTC/ETH with $1 daily',
            riskLevel: 'Medium',
            expectedApy: '10-30%',
            capitalProtection: '70%',
            minInvestment: 1,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'BTC Micro DCA', percent: 50, color: '#f7931a', apy: '10-30%', maxLoss: 30 },
                { product: 'ETH Micro DCA', percent: 50, color: '#627eea', apy: '10-30%', maxLoss: 30 }
            ],
            features: ['$1/day auto-invest', 'Time in market', 'Long term wealth']
        },
        {
            id: 'COFFEE_FUND',
            name: 'Coffee Fund',
            icon: '☕',
            description: 'Skip one coffee, grow your wealth',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '95%',
            minInvestment: 2,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Stable Yield', percent: 70, color: '#00d4aa', apy: '5-8%', maxLoss: 2 },
                { product: 'ETH Staking', percent: 30, color: '#627eea', apy: '4-5%', maxLoss: 10 }
            ],
            features: ['$2 = 1 coffee', 'Compound daily', 'Watch it grow']
        },
        {
            id: 'LUNCH_MONEY',
            name: 'Lunch Money',
            icon: '🍔',
            description: 'Invest your lunch savings',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '93%',
            minInvestment: 3,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'USDC Lending', percent: 50, color: '#2775ca', apy: '5-8%', maxLoss: 2 },
                { product: 'Stable LP', percent: 30, color: '#00d4aa', apy: '6-10%', maxLoss: 3 },
                { product: 'DAI Savings', percent: 20, color: '#f5ac37', apy: '6-10%', maxLoss: 2 }
            ],
            features: ['$3 start', 'Daily gains', 'Auto-compound']
        },
        {
            id: 'SPARE_CHANGE',
            name: 'Spare Change',
            icon: '🔄',
            description: 'Round-up your purchases into crypto',
            riskLevel: 'Low',
            expectedApy: '7-12%',
            capitalProtection: '92%',
            minInvestment: 2,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'BTC Sats Stack', percent: 40, color: '#f7931a', apy: '5-15%', maxLoss: 20 },
                { product: 'Stable Buffer', percent: 60, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Round-up concept', 'Micro-investing', 'Painless saving']
        },
        {
            id: 'PIGGY_BANK',
            name: 'Piggy Bank',
            icon: '🐷',
            description: 'Digital piggy bank with yield',
            riskLevel: 'Low',
            expectedApy: '4-8%',
            capitalProtection: '98%',
            minInvestment: 1,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'USDC Vault', percent: 80, color: '#00d4aa', apy: '4-6%', maxLoss: 1 },
                { product: 'DAI Reserve', percent: 20, color: '#f5ac37', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Kids-friendly', 'Visual progress', 'Goal tracking']
        },
        {
            id: 'STUDENT_STARTER',
            name: 'Student Starter',
            icon: '📚',
            description: 'Perfect for students with limited budget',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '95%',
            minInvestment: 5,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Stable Savings', percent: 60, color: '#00d4aa', apy: '5-7%', maxLoss: 2 },
                { product: 'ETH Micro', percent: 25, color: '#627eea', apy: '4-10%', maxLoss: 15 },
                { product: 'Learn & Earn', percent: 15, color: '#9966ff', apy: '8-15%', maxLoss: 5 }
            ],
            features: ['$5 start', 'Educational', 'Low risk intro']
        },
        {
            id: 'WEEKLY_SAVER',
            name: 'Weekly Saver',
            icon: '📅',
            description: 'Save $5 every week automatically',
            riskLevel: 'Low',
            expectedApy: '6-11%',
            capitalProtection: '94%',
            minInvestment: 5,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Auto Stables', percent: 50, color: '#00d4aa', apy: '5-8%', maxLoss: 2 },
                { product: 'Index Micro', percent: 30, color: '#4a9eff', apy: '6-12%', maxLoss: 10 },
                { product: 'Yield Boost', percent: 20, color: '#9966ff', apy: '8-15%', maxLoss: 5 }
            ],
            features: ['$5/week habit', 'Auto-deposit', 'Streak rewards']
        },
        {
            id: 'FIRST_TIMER',
            name: 'First Timer',
            icon: '🎯',
            description: 'Your very first crypto investment',
            riskLevel: 'Low',
            expectedApy: '5-9%',
            capitalProtection: '96%',
            minInvestment: 3,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Safe USDC', percent: 70, color: '#00d4aa', apy: '4-6%', maxLoss: 1 },
                { product: 'BTC Intro', percent: 20, color: '#f7931a', apy: '5-15%', maxLoss: 20 },
                { product: 'ETH Taste', percent: 10, color: '#627eea', apy: '4-10%', maxLoss: 15 }
            ],
            features: ['Beginner-friendly', 'Tutorial included', 'Safe first step']
        },
        {
            id: 'POCKET_ROCKET',
            name: 'Pocket Rocket',
            icon: '🚀',
            description: 'Small investment, big potential',
            riskLevel: 'Medium',
            expectedApy: '15-35%',
            capitalProtection: '75%',
            minInvestment: 5,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'SOL Micro', percent: 40, color: '#9945ff', apy: '15-30%', maxLoss: 30 },
                { product: 'ARB Micro', percent: 30, color: '#28a0f0', apy: '12-25%', maxLoss: 25 },
                { product: 'Stable Base', percent: 30, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Growth potential', '$5 moonshot', 'Altcoin exposure']
        },
        {
            id: 'DAILY_GRIND',
            name: 'Daily Grind',
            icon: '⚙️',
            description: 'Invest $1/day, build wealth',
            riskLevel: 'Low',
            expectedApy: '7-14%',
            capitalProtection: '90%',
            minInvestment: 1,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Stable Drip', percent: 50, color: '#00d4aa', apy: '5-8%', maxLoss: 2 },
                { product: 'BTC Drip', percent: 30, color: '#f7931a', apy: '8-20%', maxLoss: 25 },
                { product: 'ETH Drip', percent: 20, color: '#627eea', apy: '7-15%', maxLoss: 20 }
            ],
            features: ['$1/day auto', '365 days = $365+', 'Compound magic']
        },
        {
            id: 'MICRO_DIVERSIFIED',
            name: 'Micro Diversified',
            icon: '🌈',
            description: 'Full portfolio diversification from $5',
            riskLevel: 'Medium',
            expectedApy: '10-20%',
            capitalProtection: '85%',
            minInvestment: 5,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC Core', percent: 25, color: '#f7931a', apy: '5-15%', maxLoss: 25 },
                { product: 'ETH Core', percent: 25, color: '#627eea', apy: '5-12%', maxLoss: 20 },
                { product: 'Stables', percent: 30, color: '#00d4aa', apy: '5-8%', maxLoss: 2 },
                { product: 'Alts Mix', percent: 20, color: '#9966ff', apy: '15-30%', maxLoss: 35 }
            ],
            features: ['4-asset spread', 'Pro allocation', 'Rebalanced weekly']
        },
        {
            id: 'SAFE_HARBOR',
            name: 'Safe Harbor',
            icon: '⚓',
            description: 'Ultra-safe stablecoin yield',
            riskLevel: 'Low',
            expectedApy: '4-7%',
            capitalProtection: '99%',
            minInvestment: 2,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDC Aave', percent: 50, color: '#b6509e', apy: '4-6%', maxLoss: 1 },
                { product: 'DAI DSR', percent: 30, color: '#f5ac37', apy: '5-7%', maxLoss: 1 },
                { product: 'USDT Compound', percent: 20, color: '#26a17b', apy: '4-6%', maxLoss: 1 }
            ],
            features: ['99% capital safe', 'Audited protocols', 'Sleep well']
        },
        {
            id: 'GROWTH_SEED',
            name: 'Growth Seed',
            icon: '🌱',
            description: 'Plant a seed, grow a tree',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '80%',
            minInvestment: 3,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Stake', percent: 35, color: '#627eea', apy: '8-15%', maxLoss: 20 },
                { product: 'SOL Stake', percent: 30, color: '#9945ff', apy: '12-20%', maxLoss: 25 },
                { product: 'Stable Ground', percent: 35, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Growth focus', 'Staking rewards', 'Long term view']
        },
        {
            id: 'SNACK_FUND',
            name: 'Snack Fund',
            icon: '🍿',
            description: 'Instead of snacks, invest!',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '94%',
            minInvestment: 2,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Stable Yield', percent: 65, color: '#00d4aa', apy: '5-7%', maxLoss: 2 },
                { product: 'Blue Chip Mix', percent: 35, color: '#4a9eff', apy: '6-15%', maxLoss: 15 }
            ],
            features: ['Skip snacks', 'Healthier + wealthier', 'Fun tracking']
        },
        {
            id: 'CENT_HUNTER',
            name: 'Cent Hunter',
            icon: '🔍',
            description: 'Every cent counts and compounds',
            riskLevel: 'Low',
            expectedApy: '4-8%',
            capitalProtection: '98%',
            minInvestment: 1,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Micro Yields', percent: 100, color: '#00d4aa', apy: '4-8%', maxLoss: 1 }
            ],
            features: ['Track every $0.01', 'Daily compound', 'Cent-level precision']
        },
        {
            id: 'BUDGET_BOSS',
            name: 'Budget Boss',
            icon: '👑',
            description: 'Make every dollar work hard',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '93%',
            minInvestment: 5,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Optimized Stables', percent: 45, color: '#00d4aa', apy: '5-8%', maxLoss: 2 },
                { product: 'Best Rates Pool', percent: 35, color: '#4a9eff', apy: '6-12%', maxLoss: 5 },
                { product: 'Bonus Hunting', percent: 20, color: '#9966ff', apy: '8-15%', maxLoss: 8 }
            ],
            features: ['Rate optimization', 'Auto best yields', 'Smart routing']
        },
        {
            id: 'TINY_TITAN',
            name: 'Tiny Titan',
            icon: '💪',
            description: 'Small but mighty investment',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '78%',
            minInvestment: 5,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'L1 Staking', percent: 40, color: '#9945ff', apy: '10-20%', maxLoss: 25 },
                { product: 'DeFi Yields', percent: 30, color: '#ff6b9d', apy: '15-30%', maxLoss: 30 },
                { product: 'Safe Buffer', percent: 30, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Punches above weight', 'Active management', 'Growth focus']
        },
        {
            id: 'EASY_START',
            name: 'Easy Start',
            icon: '✨',
            description: 'Simplest way to begin investing',
            riskLevel: 'Low',
            expectedApy: '5-9%',
            capitalProtection: '96%',
            minInvestment: 1,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Simple Savings', percent: 80, color: '#00d4aa', apy: '5-7%', maxLoss: 1 },
                { product: 'Intro Boost', percent: 20, color: '#9966ff', apy: '6-12%', maxLoss: 5 }
            ],
            features: ['One-click invest', 'No complexity', 'Perfect start']
        },
        {
            id: 'SMART_CENTS',
            name: 'Smart Cents',
            icon: '🧠',
            description: 'AI-optimized micro yields',
            riskLevel: 'Low',
            expectedApy: '6-11%',
            capitalProtection: '94%',
            minInvestment: 3,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'AI Rate Finder', percent: 50, color: '#00d4aa', apy: '5-9%', maxLoss: 2 },
                { product: 'Smart Routing', percent: 30, color: '#4a9eff', apy: '6-12%', maxLoss: 4 },
                { product: 'Yield Optimizer', percent: 20, color: '#9966ff', apy: '8-15%', maxLoss: 5 }
            ],
            features: ['AI-powered', 'Auto-optimize', 'Best rates always']
        },
        {
            id: 'FRACTION_FORTUNE',
            name: 'Fraction Fortune',
            icon: '🎰',
            description: 'Fractional investing for everyone',
            riskLevel: 'Medium',
            expectedApy: '10-22%',
            capitalProtection: '82%',
            minInvestment: 2,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Fractional BTC', percent: 30, color: '#f7931a', apy: '5-15%', maxLoss: 25 },
                { product: 'Fractional ETH', percent: 30, color: '#627eea', apy: '5-12%', maxLoss: 20 },
                { product: 'Stable Anchor', percent: 40, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Own fractions', 'Blue chip access', 'Dollar amounts']
        },
        {
            id: 'QUICK_FLIP',
            name: 'Quick Flip',
            icon: '⚡',
            description: 'Fast-moving micro trades',
            riskLevel: 'High',
            expectedApy: '20-50%',
            capitalProtection: '60%',
            minInvestment: 5,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Momentum Plays', percent: 40, color: '#ff6464', apy: '25-60%', maxLoss: 45 },
                { product: 'Quick Arb', percent: 35, color: '#ffaa00', apy: '15-40%', maxLoss: 30 },
                { product: 'Safety Net', percent: 25, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Active trading', 'Quick profits', 'High risk/reward']
        },
        {
            id: 'STEADY_EDDIE',
            name: 'Steady Eddie',
            icon: '🐢',
            description: 'Slow and steady wins the race',
            riskLevel: 'Low',
            expectedApy: '5-9%',
            capitalProtection: '97%',
            minInvestment: 2,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Consistent Yield', percent: 70, color: '#00d4aa', apy: '5-7%', maxLoss: 1 },
                { product: 'Stable Growth', percent: 30, color: '#4a9eff', apy: '6-10%', maxLoss: 3 }
            ],
            features: ['No surprises', 'Predictable', 'Sleep easy']
        },
        {
            id: 'MEME_MICRO',
            name: 'Meme Micro',
            icon: '🐸',
            description: 'Tiny meme coin exposure',
            riskLevel: 'High',
            expectedApy: '50-200%',
            capitalProtection: '30%',
            minInvestment: 5,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Meme Mix', percent: 50, color: '#00ff00', apy: '50-200%', maxLoss: 80 },
                { product: 'Safety Reserve', percent: 50, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Meme exposure', '50% protected', 'YOLO responsibly']
        },
        {
            id: 'GLOBAL_MICRO',
            name: 'Global Micro',
            icon: '🌍',
            description: 'Worldwide crypto exposure from $3',
            riskLevel: 'Medium',
            expectedApy: '10-18%',
            capitalProtection: '85%',
            minInvestment: 3,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Global Top 20', percent: 40, color: '#4a9eff', apy: '8-15%', maxLoss: 20 },
                { product: 'Regional Leaders', percent: 30, color: '#9966ff', apy: '10-20%', maxLoss: 25 },
                { product: 'USD Reserve', percent: 30, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Global diversity', '20+ assets', 'One-click world']
        },
        {
            id: 'LAYER2_LITE',
            name: 'Layer2 Lite',
            icon: '🌉',
            description: 'L2 exposure with minimal capital',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '75%',
            minInvestment: 5,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ARB Staking', percent: 35, color: '#28a0f0', apy: '12-20%', maxLoss: 25 },
                { product: 'OP Rewards', percent: 30, color: '#ff0420', apy: '15-25%', maxLoss: 28 },
                { product: 'Base Yield', percent: 20, color: '#0052ff', apy: '10-20%', maxLoss: 22 },
                { product: 'Stable Base', percent: 15, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['L2 ecosystem', 'Low fees', 'Airdrop potential']
        },
        {
            id: 'DEFI_DABBLE',
            name: 'DeFi Dabble',
            icon: '🧪',
            description: 'Experiment with DeFi from $3',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '78%',
            minInvestment: 3,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Lending Intro', percent: 35, color: '#b6509e', apy: '8-15%', maxLoss: 10 },
                { product: 'LP Basics', percent: 30, color: '#ff007a', apy: '12-25%', maxLoss: 20 },
                { product: 'Stable Safety', percent: 35, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['DeFi 101', 'Learn by doing', 'Protected learning']
        },
        {
            id: 'YIELD_CHASE',
            name: 'Yield Chase',
            icon: '🏃',
            description: 'Always chasing the best micro yields',
            riskLevel: 'Low',
            expectedApy: '7-14%',
            capitalProtection: '91%',
            minInvestment: 2,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Best Stable APY', percent: 60, color: '#00d4aa', apy: '6-12%', maxLoss: 3 },
                { product: 'Bonus Yields', percent: 25, color: '#9966ff', apy: '8-18%', maxLoss: 8 },
                { product: 'Rate Arbitrage', percent: 15, color: '#4a9eff', apy: '10-20%', maxLoss: 5 }
            ],
            features: ['Rate hunting', 'Auto-switch', 'Always optimal']
        },
        {
            id: 'BABY_WHALE',
            name: 'Baby Whale',
            icon: '🐋',
            description: 'Start small, think big',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '80%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Whale Strategies', percent: 35, color: '#4a9eff', apy: '12-22%', maxLoss: 20 },
                { product: 'Smart Money', percent: 35, color: '#9966ff', apy: '10-25%', maxLoss: 22 },
                { product: 'Safety Pool', percent: 30, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Whale tactics', 'Smart allocation', 'Scale up ready']
        },
        {
            id: 'MINI_MOONSHOT',
            name: 'Mini Moonshot',
            icon: '🌙',
            description: '$5 lottery ticket to the moon',
            riskLevel: 'High',
            expectedApy: '30-100%',
            capitalProtection: '50%',
            minInvestment: 5,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'New Tokens', percent: 35, color: '#ff69b4', apy: '40-150%', maxLoss: 60 },
                { product: 'Hot Narratives', percent: 30, color: '#ffaa00', apy: '30-80%', maxLoss: 50 },
                { product: 'Stable Parachute', percent: 35, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Moon potential', '50% protected', 'Asymmetric bet']
        },
        {
            id: 'STAKING_INTRO',
            name: 'Staking Intro',
            icon: '🔒',
            description: 'Learn staking with just $3',
            riskLevel: 'Low',
            expectedApy: '5-12%',
            capitalProtection: '92%',
            minInvestment: 3,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Staking', percent: 40, color: '#627eea', apy: '4-5%', maxLoss: 15 },
                { product: 'SOL Staking', percent: 30, color: '#9945ff', apy: '7-9%', maxLoss: 18 },
                { product: 'Stable Reserve', percent: 30, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Staking basics', 'Passive income', 'Easy to understand']
        },
        {
            id: 'SAVINGS_PLUS',
            name: 'Savings Plus',
            icon: '📈',
            description: 'Better than your bank, from $1',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '97%',
            minInvestment: 1,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'High Yield Savings', percent: 70, color: '#00d4aa', apy: '5-8%', maxLoss: 1 },
                { product: 'Premium Savings', percent: 30, color: '#4a9eff', apy: '6-12%', maxLoss: 3 }
            ],
            features: ['10x bank rates', 'Instant withdraw', 'FDIC alternative']
        },
        {
            id: 'COMPOUND_KING',
            name: 'Compound King',
            icon: '👑',
            description: 'Maximize compound interest from $2',
            riskLevel: 'Low',
            expectedApy: '6-13%',
            capitalProtection: '93%',
            minInvestment: 2,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Daily Compound', percent: 50, color: '#00d4aa', apy: '5-10%', maxLoss: 2 },
                { product: 'Auto-Reinvest', percent: 30, color: '#4a9eff', apy: '6-12%', maxLoss: 4 },
                { product: 'Yield Booster', percent: 20, color: '#9966ff', apy: '8-18%', maxLoss: 6 }
            ],
            features: ['Daily compound', '8760 compounds/yr', 'Power of time']
        },
        {
            id: 'RISK_FREE_TASTE',
            name: 'Risk-Free Taste',
            icon: '🍭',
            description: 'Try crypto with zero risk',
            riskLevel: 'Low',
            expectedApy: '3-6%',
            capitalProtection: '100%',
            minInvestment: 1,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Insured Stables', percent: 100, color: '#00d4aa', apy: '3-6%', maxLoss: 0 }
            ],
            features: ['100% safe', 'Insured deposits', 'Zero downside']
        },
        // STANDARD COMBOS
        {
            id: 'CONSERVATIVE_YIELD',
            name: 'Conservative Yield',
            icon: '🛡️',
            description: 'Maximum security with stable returns',
            riskLevel: 'Low',
            expectedApy: '5-12%',
            capitalProtection: '95%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDC Staking', percent: 40, color: '#00d4aa', apy: '4-6%', maxLoss: 2 },
                { product: 'Treasury Bonds', percent: 35, color: '#4a9eff', apy: '5-8%', maxLoss: 3 },
                { product: 'Stable Vault', percent: 25, color: '#9966ff', apy: '6-10%', maxLoss: 5 }
            ]
        },
        {
            id: 'BLUE_CHIP_COMBO',
            name: 'Blue Chip Combo',
            icon: '💎',
            description: 'Focus on BTC & ETH with yield optimization',
            riskLevel: 'Medium',
            expectedApy: '15-25%',
            capitalProtection: '80%',
            minInvestment: 250,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Staking', percent: 35, color: '#627eea', apy: '8-12%', maxLoss: 15 },
                { product: 'BTC/ETH Vault', percent: 30, color: '#f7931a', apy: '15-25%', maxLoss: 25 },
                { product: 'DCA Mix', percent: 25, color: '#00d4aa', apy: '10-20%', maxLoss: 20 },
                { product: 'Bonds', percent: 10, color: '#4a9eff', apy: '5-8%', maxLoss: 5 }
            ]
        },
        {
            id: 'GROWTH_PORTFOLIO',
            name: 'Growth Portfolio',
            icon: '📈',
            description: 'Balanced growth with diversified altcoins',
            riskLevel: 'Medium',
            expectedApy: '20-35%',
            capitalProtection: '70%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'L1 Staking', percent: 30, color: '#00d4aa', apy: '12-18%', maxLoss: 20 },
                { product: 'DeFi Vault', percent: 25, color: '#ff6b9d', apy: '20-35%', maxLoss: 35 },
                { product: 'Altcoin DCA', percent: 25, color: '#ffaa00', apy: '25-50%', maxLoss: 40 },
                { product: 'LP Farming', percent: 20, color: '#9966ff', apy: '15-30%', maxLoss: 30 }
            ]
        },
        {
            id: 'DEGEN_MAX',
            name: 'Degen Max',
            icon: '🚀',
            description: 'High risk, high reward strategies',
            riskLevel: 'High',
            expectedApy: '40-80%',
            capitalProtection: '50%',
            minInvestment: 1000,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Leverage Vault', percent: 35, color: '#ff6464', apy: '50-100%', maxLoss: 60 },
                { product: 'Meme DCA', percent: 25, color: '#ffaa00', apy: '40-80%', maxLoss: 70 },
                { product: 'New Listings', percent: 25, color: '#00ff88', apy: '30-60%', maxLoss: 50 },
                { product: 'Arbitrage', percent: 15, color: '#4a9eff', apy: '20-40%', maxLoss: 25 }
            ]
        },
        {
            id: 'PASSIVE_INCOME',
            name: 'Passive Income',
            icon: '💰',
            description: 'Steady yield from staking and lending',
            riskLevel: 'Low',
            expectedApy: '8-15%',
            capitalProtection: '90%',
            minInvestment: 200,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Multi-Chain Staking', percent: 50, color: '#00d4aa', apy: '6-10%', maxLoss: 8 },
                { product: 'Lending Protocol', percent: 30, color: '#4a9eff', apy: '8-12%', maxLoss: 10 },
                { product: 'Stable LP', percent: 20, color: '#9966ff', apy: '10-15%', maxLoss: 12 }
            ]
        },
        {
            id: 'AI_QUANT',
            name: 'AI Quant Strategy',
            icon: '🤖',
            description: 'AI-driven market neutral strategies',
            riskLevel: 'Medium',
            expectedApy: '25-40%',
            capitalProtection: '75%',
            minInvestment: 500,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Grid Trading', percent: 30, color: '#00d4aa', apy: '20-35%', maxLoss: 20 },
                { product: 'Mean Reversion', percent: 25, color: '#627eea', apy: '25-40%', maxLoss: 25 },
                { product: 'Momentum', percent: 25, color: '#ffaa00', apy: '30-50%', maxLoss: 35 },
                { product: 'Arbitrage', percent: 20, color: '#ff6b9d', apy: '15-25%', maxLoss: 15 }
            ]
        },
        {
            id: 'STABLECOIN_FORTRESS',
            name: 'Stablecoin Fortress',
            icon: '🏰',
            description: 'Ultra-safe stablecoin yields across protocols',
            riskLevel: 'Low',
            expectedApy: '6-10%',
            capitalProtection: '99%',
            minInvestment: 50,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDC Lending', percent: 40, color: '#2775ca', apy: '5-8%', maxLoss: 1 },
                { product: 'USDT Staking', percent: 30, color: '#26a17b', apy: '4-7%', maxLoss: 1 },
                { product: 'DAI Savings', percent: 30, color: '#f5ac37', apy: '6-10%', maxLoss: 2 }
            ]
        },
        {
            id: 'ETH_MAXIMALIST',
            name: 'ETH Maximalist',
            icon: '💠',
            description: '100% Ethereum ecosystem exposure',
            riskLevel: 'Medium',
            expectedApy: '12-20%',
            capitalProtection: '75%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Staking (Lido)', percent: 40, color: '#00a3ff', apy: '4-5%', maxLoss: 20 },
                { product: 'ETH/stETH LP', percent: 30, color: '#627eea', apy: '8-15%', maxLoss: 15 },
                { product: 'ETH Options Vault', percent: 30, color: '#8c8dfc', apy: '15-25%', maxLoss: 30 }
            ]
        },
        {
            id: 'BTC_HODLER',
            name: 'BTC HODLer Plus',
            icon: '🪙',
            description: 'Bitcoin-focused yield with wrapped BTC',
            riskLevel: 'Medium',
            expectedApy: '8-15%',
            capitalProtection: '80%',
            minInvestment: 500,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'WBTC Lending', percent: 50, color: '#f7931a', apy: '3-6%', maxLoss: 25 },
                { product: 'BTC/ETH LP', percent: 30, color: '#627eea', apy: '10-18%', maxLoss: 20 },
                { product: 'BTC Covered Calls', percent: 20, color: '#ff9500', apy: '15-25%', maxLoss: 15 }
            ]
        },
        {
            id: 'SOLANA_SPEED',
            name: 'Solana Speed',
            icon: '⚡',
            description: 'High-performance Solana DeFi strategies',
            riskLevel: 'Medium',
            expectedApy: '18-30%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'SOL Staking', percent: 35, color: '#9945ff', apy: '7-9%', maxLoss: 25 },
                { product: 'Marinade Finance', percent: 25, color: '#00d18c', apy: '8-12%', maxLoss: 20 },
                { product: 'Raydium Farms', percent: 25, color: '#2dd4bf', apy: '25-40%', maxLoss: 35 },
                { product: 'Jupiter Perps', percent: 15, color: '#c7f284', apy: '30-50%', maxLoss: 40 }
            ]
        },
        {
            id: 'DEFI_BLUE_CHIP',
            name: 'DeFi Blue Chips',
            icon: '🔷',
            description: 'Top DeFi protocols with proven track record',
            riskLevel: 'Medium',
            expectedApy: '15-25%',
            capitalProtection: '75%',
            minInvestment: 300,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'AAVE Staking', percent: 30, color: '#b6509e', apy: '8-12%', maxLoss: 20 },
                { product: 'UNI LP', percent: 25, color: '#ff007a', apy: '15-25%', maxLoss: 25 },
                { product: 'CRV/CVX', percent: 25, color: '#0033ad', apy: '20-35%', maxLoss: 30 },
                { product: 'MKR Vault', percent: 20, color: '#1aab9b', apy: '10-18%', maxLoss: 20 }
            ]
        },
        {
            id: 'LAYER2_EXPLORER',
            name: 'Layer 2 Explorer',
            icon: '🌉',
            description: 'Arbitrum, Optimism, Base ecosystem',
            riskLevel: 'Medium',
            expectedApy: '20-35%',
            capitalProtection: '70%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ARB Staking', percent: 30, color: '#28a0f0', apy: '10-15%', maxLoss: 30 },
                { product: 'OP Rewards', percent: 25, color: '#ff0420', apy: '15-25%', maxLoss: 30 },
                { product: 'Base LP', percent: 25, color: '#0052ff', apy: '20-35%', maxLoss: 35 },
                { product: 'GMX/GLP', percent: 20, color: '#4fa8e3', apy: '25-40%', maxLoss: 25 }
            ]
        },
        {
            id: 'REAL_YIELD',
            name: 'Real Yield',
            icon: '💵',
            description: 'Protocols with real revenue sharing',
            riskLevel: 'Medium',
            expectedApy: '12-22%',
            capitalProtection: '80%',
            minInvestment: 250,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'GMX Staking', percent: 35, color: '#4fa8e3', apy: '15-25%', maxLoss: 25 },
                { product: 'GNS Staking', percent: 25, color: '#3ee6c4', apy: '10-20%', maxLoss: 30 },
                { product: 'RDNT Lending', percent: 20, color: '#00d395', apy: '12-18%', maxLoss: 25 },
                { product: 'Gains Network', percent: 20, color: '#00b897', apy: '15-25%', maxLoss: 30 }
            ]
        },
        {
            id: 'LIQUID_STAKING',
            name: 'Liquid Staking Pro',
            icon: '💧',
            description: 'LST tokens across multiple chains',
            riskLevel: 'Low',
            expectedApy: '8-14%',
            capitalProtection: '90%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'stETH (Lido)', percent: 35, color: '#00a3ff', apy: '4-5%', maxLoss: 10 },
                { product: 'rETH (Rocket)', percent: 25, color: '#ff7043', apy: '4-5%', maxLoss: 10 },
                { product: 'cbETH (Coinbase)', percent: 20, color: '#0052ff', apy: '4-5%', maxLoss: 8 },
                { product: 'mSOL (Marinade)', percent: 20, color: '#00d18c', apy: '7-9%', maxLoss: 15 }
            ]
        },
        {
            id: 'PERPETUAL_TRADER',
            name: 'Perpetual Trader',
            icon: '📊',
            description: 'Funding rate arbitrage and perp strategies',
            riskLevel: 'High',
            expectedApy: '30-60%',
            capitalProtection: '60%',
            minInvestment: 500,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Funding Arb', percent: 40, color: '#00ff88', apy: '20-40%', maxLoss: 30 },
                { product: 'Delta Neutral', percent: 30, color: '#4a9eff', apy: '25-45%', maxLoss: 35 },
                { product: 'Basis Trade', percent: 30, color: '#ff6b9d', apy: '35-60%', maxLoss: 40 }
            ]
        },
        {
            id: 'NFT_YIELD',
            name: 'NFT Yield Hunter',
            icon: '🖼️',
            description: 'NFT staking and lending protocols',
            riskLevel: 'High',
            expectedApy: '25-50%',
            capitalProtection: '50%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'NFT Lending', percent: 40, color: '#e040fb', apy: '20-40%', maxLoss: 50 },
                { product: 'Blur Farming', percent: 35, color: '#ff6f00', apy: '30-60%', maxLoss: 60 },
                { product: 'NFT Index', percent: 25, color: '#7c4dff', apy: '15-35%', maxLoss: 40 }
            ]
        },
        {
            id: 'MEME_CASINO',
            name: 'Meme Casino',
            icon: '🎰',
            description: 'High-risk meme coin exposure',
            riskLevel: 'High',
            expectedApy: '50-200%',
            capitalProtection: '30%',
            minInvestment: 50,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'PEPE/DOGE LP', percent: 35, color: '#00ff00', apy: '50-150%', maxLoss: 80 },
                { product: 'SHIB Staking', percent: 30, color: '#ffa409', apy: '30-80%', maxLoss: 70 },
                { product: 'New Memes DCA', percent: 35, color: '#ff69b4', apy: '100-300%', maxLoss: 90 }
            ]
        },
        {
            id: 'RWA_INCOME',
            name: 'RWA Income',
            icon: '🏛️',
            description: 'Real World Asset backed yields',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '95%',
            minInvestment: 1000,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'US Treasury (ONDO)', percent: 40, color: '#1e3a8a', apy: '4-5%', maxLoss: 2 },
                { product: 'Corp Bonds', percent: 30, color: '#059669', apy: '6-8%', maxLoss: 5 },
                { product: 'Real Estate', percent: 30, color: '#dc2626', apy: '8-12%', maxLoss: 10 }
            ]
        },
        {
            id: 'AIRDROP_FARMER',
            name: 'Airdrop Farmer',
            icon: '🪂',
            description: 'Position for upcoming protocol airdrops',
            riskLevel: 'Medium',
            expectedApy: '20-100%',
            capitalProtection: '70%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'LayerZero Bridge', percent: 30, color: '#6366f1', apy: '5-50%', maxLoss: 30 },
                { product: 'zkSync Activity', percent: 25, color: '#8b5cf6', apy: '10-80%', maxLoss: 25 },
                { product: 'Scroll Usage', percent: 25, color: '#fcd34d', apy: '10-70%', maxLoss: 25 },
                { product: 'Linea DeFi', percent: 20, color: '#60a5fa', apy: '15-60%', maxLoss: 30 }
            ]
        },
        {
            id: 'PRIVACY_SHIELD',
            name: 'Privacy Shield',
            icon: '🛡️',
            description: 'Privacy-focused assets and protocols',
            riskLevel: 'Medium',
            expectedApy: '10-18%',
            capitalProtection: '75%',
            minInvestment: 300,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Secret Network', percent: 35, color: '#1b1b1b', apy: '8-15%', maxLoss: 30 },
                { product: 'Aztec Protocol', percent: 35, color: '#5c2d91', apy: '10-20%', maxLoss: 25 },
                { product: 'Tornado Cash Alt', percent: 30, color: '#2dd4bf', apy: '12-20%', maxLoss: 30 }
            ]
        },
        {
            id: 'CROSS_CHAIN_ARB',
            name: 'Cross-Chain Arb',
            icon: '🔀',
            description: 'Multi-chain arbitrage opportunities',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '80%',
            minInvestment: 500,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Bridge Arb', percent: 35, color: '#00d4aa', apy: '10-25%', maxLoss: 20 },
                { product: 'DEX Arb', percent: 35, color: '#ff6b9d', apy: '15-30%', maxLoss: 25 },
                { product: 'CEX-DEX Arb', percent: 30, color: '#4a9eff', apy: '20-35%', maxLoss: 20 }
            ]
        },
        {
            id: 'GAMING_GUILD',
            name: 'Gaming Guild',
            icon: '🎮',
            description: 'GameFi and P2E token exposure',
            riskLevel: 'High',
            expectedApy: '25-60%',
            capitalProtection: '55%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'IMX Staking', percent: 30, color: '#00bfff', apy: '15-30%', maxLoss: 50 },
                { product: 'GALA Farm', percent: 25, color: '#00d4aa', apy: '20-40%', maxLoss: 60 },
                { product: 'MAGIC/Treasure', percent: 25, color: '#e31837', apy: '25-50%', maxLoss: 55 },
                { product: 'PRIME Gaming', percent: 20, color: '#9333ea', apy: '30-60%', maxLoss: 60 }
            ]
        },
        {
            id: 'PENSION_PLAN',
            name: 'Crypto Pension',
            icon: '👴',
            description: 'Long-term wealth preservation',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '95%',
            minInvestment: 1000,
            rebalanceFrequency: 'Quarterly',
            allocation: [
                { product: 'BTC Hold', percent: 30, color: '#f7931a', apy: '0%', maxLoss: 30 },
                { product: 'ETH Staking', percent: 30, color: '#627eea', apy: '4-5%', maxLoss: 25 },
                { product: 'Stables Yield', percent: 40, color: '#26a17b', apy: '5-8%', maxLoss: 2 }
            ]
        },
        {
            id: 'AI_TOKENS',
            name: 'AI Revolution',
            icon: '🧠',
            description: 'Artificial Intelligence crypto projects',
            riskLevel: 'High',
            expectedApy: '30-80%',
            capitalProtection: '50%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'FET Staking', percent: 30, color: '#1d1d47', apy: '15-30%', maxLoss: 50 },
                { product: 'RNDR Hold', percent: 25, color: '#cc0000', apy: '20-50%', maxLoss: 55 },
                { product: 'AGIX Farm', percent: 25, color: '#6c5ce7', apy: '25-60%', maxLoss: 60 },
                { product: 'TAO Staking', percent: 20, color: '#00ff88', apy: '30-80%', maxLoss: 65 }
            ]
        },
        {
            id: 'VALIDATOR_PRO',
            name: 'Validator Pro',
            icon: '🔐',
            description: 'Professional validator node rewards',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '92%',
            minInvestment: 5000,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'ETH Validator', percent: 40, color: '#627eea', apy: '4-5%', maxLoss: 10 },
                { product: 'SOL Validator', percent: 30, color: '#9945ff', apy: '7-8%', maxLoss: 15 },
                { product: 'ATOM Validator', percent: 30, color: '#2e3148', apy: '10-15%', maxLoss: 12 }
            ]
        },
        {
            id: 'OPTIONS_SELLER',
            name: 'Options Seller',
            icon: '📉',
            description: 'Covered calls and puts strategies',
            riskLevel: 'Medium',
            expectedApy: '20-40%',
            capitalProtection: '70%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC Covered Calls', percent: 40, color: '#f7931a', apy: '15-30%', maxLoss: 30 },
                { product: 'ETH Put Selling', percent: 35, color: '#627eea', apy: '20-40%', maxLoss: 35 },
                { product: 'Straddle Farm', percent: 25, color: '#ff6b9d', apy: '25-50%', maxLoss: 40 }
            ]
        },
        {
            id: 'COSMOS_ECOSYSTEM',
            name: 'Cosmos Hub',
            icon: '⚛️',
            description: 'Inter-blockchain communication yields',
            riskLevel: 'Medium',
            expectedApy: '15-25%',
            capitalProtection: '75%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ATOM Staking', percent: 35, color: '#2e3148', apy: '12-18%', maxLoss: 25 },
                { product: 'OSMO LP', percent: 30, color: '#5e12a0', apy: '15-30%', maxLoss: 30 },
                { product: 'JUNO Staking', percent: 20, color: '#f0827d', apy: '10-20%', maxLoss: 35 },
                { product: 'STARS Farm', percent: 15, color: '#ec4899', apy: '20-35%', maxLoss: 40 }
            ]
        },
        {
            id: 'INSURANCE_BACKED',
            name: 'Insurance Backed',
            icon: '🔒',
            description: 'DeFi insurance protected yields',
            riskLevel: 'Low',
            expectedApy: '4-8%',
            capitalProtection: '98%',
            minInvestment: 500,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Nexus Mutual', percent: 40, color: '#1aab9b', apy: '3-6%', maxLoss: 2 },
                { product: 'InsurAce Pool', percent: 30, color: '#ff6b00', apy: '4-8%', maxLoss: 3 },
                { product: 'Unslashed', percent: 30, color: '#6366f1', apy: '5-10%', maxLoss: 4 }
            ]
        }
,
        {
            id: "YIELD_MAXIMIZER",
            name: "Yield Maximizer",
            icon: "💹",
            description: "Maximum yield across all protocols",
            riskLevel: "High",
            expectedApy: "40-100%",
            capitalProtection: "50%",
            minInvestment: 500,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "Leveraged Farming", percent: 40, color: "#ff6464", apy: "50-120%", maxLoss: 60 },
                { product: "Options Premium", percent: 30, color: "#ffaa00", apy: "30-80%", maxLoss: 40 },
                { product: "Perp Funding", percent: 30, color: "#00ff88", apy: "25-60%", maxLoss: 35 }
            ]
        },
        {
            id: "SMART_DCA",
            name: "Smart DCA",
            icon: "📅",
            description: "Automated dollar cost averaging",
            riskLevel: "Medium",
            expectedApy: "15-40%",
            capitalProtection: "70%",
            minInvestment: 100,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "BTC Weekly DCA", percent: 40, color: "#f7931a", apy: "10-30%", maxLoss: 35 },
                { product: "ETH Weekly DCA", percent: 35, color: "#627eea", apy: "12-35%", maxLoss: 30 },
                { product: "Altcoin DCA", percent: 25, color: "#00d4aa", apy: "20-50%", maxLoss: 45 }
            ]
        },
        {
            id: "GRID_TRADER",
            name: "Grid Trader Pro",
            icon: "📊",
            description: "Automated grid trading strategies",
            riskLevel: "Medium",
            expectedApy: "20-45%",
            capitalProtection: "75%",
            minInvestment: 300,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "BTC Grid", percent: 40, color: "#f7931a", apy: "15-35%", maxLoss: 25 },
                { product: "ETH Grid", percent: 35, color: "#627eea", apy: "18-40%", maxLoss: 28 },
                { product: "Range Trading", percent: 25, color: "#ff6b9d", apy: "25-50%", maxLoss: 30 }
            ]
        },
        {
            id: "STAKING_KING",
            name: "Staking Kingdom",
            icon: "👑",
            description: "Best staking yields across chains",
            riskLevel: "Low",
            expectedApy: "8-18%",
            capitalProtection: "90%",
            minInvestment: 100,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "ETH 2.0 Staking", percent: 30, color: "#627eea", apy: "4-5%", maxLoss: 10 },
                { product: "SOL Staking", percent: 25, color: "#9945ff", apy: "7-9%", maxLoss: 15 },
                { product: "ATOM Staking", percent: 25, color: "#2e3148", apy: "12-18%", maxLoss: 15 },
                { product: "DOT Staking", percent: 20, color: "#e6007a", apy: "10-15%", maxLoss: 18 }
            ]
        },
        {
            id: "LP_MASTER",
            name: "LP Master",
            icon: "🌊",
            description: "Liquidity provision optimization",
            riskLevel: "Medium",
            expectedApy: "15-35%",
            capitalProtection: "75%",
            minInvestment: 250,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Stable-Stable LP", percent: 35, color: "#26a17b", apy: "8-15%", maxLoss: 5 },
                { product: "ETH-USDC LP", percent: 30, color: "#627eea", apy: "15-30%", maxLoss: 25 },
                { product: "Concentrated LP", percent: 35, color: "#ff007a", apy: "25-50%", maxLoss: 35 }
            ]
        },
        {
            id: "ARBITRAGE_BOT",
            name: "Arbitrage Hunter",
            icon: "🎯",
            description: "Cross-exchange arbitrage",
            riskLevel: "Low",
            expectedApy: "10-25%",
            capitalProtection: "95%",
            minInvestment: 1000,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "CEX-DEX Arb", percent: 40, color: "#00d4aa", apy: "8-20%", maxLoss: 5 },
                { product: "Triangular Arb", percent: 35, color: "#4a9eff", apy: "10-25%", maxLoss: 8 },
                { product: "Flash Arb", percent: 25, color: "#ff6b9d", apy: "15-30%", maxLoss: 10 }
            ]
        },
        {
            id: "MARKET_NEUTRAL",
            name: "Market Neutral",
            icon: "⚖️",
            description: "Delta-neutral strategies",
            riskLevel: "Low",
            expectedApy: "12-25%",
            capitalProtection: "90%",
            minInvestment: 500,
            rebalanceFrequency: "Daily",
            allocation: [
                { product: "Cash & Carry", percent: 40, color: "#00ff88", apy: "10-20%", maxLoss: 8 },
                { product: "Basis Trade", percent: 35, color: "#4a9eff", apy: "12-25%", maxLoss: 10 },
                { product: "Funding Arb", percent: 25, color: "#ffaa00", apy: "15-30%", maxLoss: 12 }
            ]
        },
        {
            id: "EMERGING_CHAINS",
            name: "Emerging Chains",
            icon: "🌱",
            description: "New L1/L2 ecosystem exposure",
            riskLevel: "High",
            expectedApy: "30-80%",
            capitalProtection: "55%",
            minInvestment: 200,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Sui Ecosystem", percent: 25, color: "#6fbcf0", apy: "25-60%", maxLoss: 50 },
                { product: "Aptos DeFi", percent: 25, color: "#2dd4bf", apy: "20-50%", maxLoss: 45 },
                { product: "Sei Network", percent: 25, color: "#ff6b6b", apy: "30-70%", maxLoss: 55 },
                { product: "Monad Prep", percent: 25, color: "#a855f7", apy: "40-100%", maxLoss: 60 }
            ]
        },
        {
            id: "BTC_DEFI",
            name: "Bitcoin DeFi",
            icon: "₿",
            description: "Bitcoin L2 and DeFi",
            riskLevel: "Medium",
            expectedApy: "12-30%",
            capitalProtection: "75%",
            minInvestment: 500,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Lightning LP", percent: 30, color: "#f7931a", apy: "8-15%", maxLoss: 20 },
                { product: "Stacks STX", percent: 25, color: "#5546ff", apy: "10-20%", maxLoss: 30 },
                { product: "RGB Assets", percent: 25, color: "#00d4aa", apy: "15-30%", maxLoss: 35 },
                { product: "Ordinals Yield", percent: 20, color: "#ff6b9d", apy: "20-40%", maxLoss: 40 }
            ]
        },
        {
            id: "DEPIN_INFRA",
            name: "DePIN Infrastructure",
            icon: "🔌",
            description: "Decentralized physical infrastructure",
            riskLevel: "Medium",
            expectedApy: "15-40%",
            capitalProtection: "70%",
            minInvestment: 300,
            rebalanceFrequency: "Monthly",
            allocation: [
                { product: "Filecoin Storage", percent: 30, color: "#0090ff", apy: "10-25%", maxLoss: 30 },
                { product: "Helium IoT", percent: 25, color: "#474dff", apy: "12-30%", maxLoss: 35 },
                { product: "Render GPU", percent: 25, color: "#cc0000", apy: "20-45%", maxLoss: 40 },
                { product: "Akash Compute", percent: 20, color: "#ff4444", apy: "15-35%", maxLoss: 35 }
            ]
        },
        {
            id: "WHALE_PORTFOLIO",
            name: "Whale Portfolio",
            icon: "🐋",
            description: "For high net worth investors",
            riskLevel: "Medium",
            expectedApy: "18-35%",
            capitalProtection: "80%",
            minInvestment: 10000,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "BTC Institutional", percent: 35, color: "#f7931a", apy: "10-20%", maxLoss: 25 },
                { product: "ETH Prime", percent: 30, color: "#627eea", apy: "12-25%", maxLoss: 20 },
                { product: "Private Deals", percent: 20, color: "#a855f7", apy: "30-50%", maxLoss: 35 },
                { product: "OTC Desk", percent: 15, color: "#00d4aa", apy: "25-40%", maxLoss: 30 }
            ]
        },
        {
            id: "MICRO_STARTER",
            name: "Micro Starter",
            icon: "🌟",
            description: "Perfect for beginners with small capital",
            riskLevel: "Low",
            expectedApy: "6-12%",
            capitalProtection: "95%",
            minInvestment: 10,
            rebalanceFrequency: "Monthly",
            allocation: [
                { product: "USDC Earn", percent: 50, color: "#2775ca", apy: "5-8%", maxLoss: 2 },
                { product: "BTC Sats Stack", percent: 30, color: "#f7931a", apy: "0%", maxLoss: 30 },
                { product: "Learn & Earn", percent: 20, color: "#00ff88", apy: "10-20%", maxLoss: 5 }
            ]
        },
        {
            id: "DIVIDEND_HUNTER",
            name: "Dividend Hunter",
            icon: "💸",
            description: "High dividend yield tokens",
            riskLevel: "Medium",
            expectedApy: "20-45%",
            capitalProtection: "70%",
            minInvestment: 500,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Real Yield Tokens", percent: 40, color: "#00ff88", apy: "15-30%", maxLoss: 30 },
                { product: "Revenue Share", percent: 35, color: "#4a9eff", apy: "20-40%", maxLoss: 35 },
                { product: "Buyback Tokens", percent: 25, color: "#ff6b9d", apy: "25-50%", maxLoss: 40 }
            ]
        },
        {
            id: "METAVERSE_LAND",
            name: "Metaverse Land",
            icon: "🏝️",
            description: "Virtual real estate investment",
            riskLevel: "High",
            expectedApy: "25-80%",
            capitalProtection: "40%",
            minInvestment: 200,
            rebalanceFrequency: "Monthly",
            allocation: [
                { product: "Decentraland LAND", percent: 35, color: "#ff2d55", apy: "20-60%", maxLoss: 70 },
                { product: "Sandbox LAND", percent: 35, color: "#00adef", apy: "25-70%", maxLoss: 65 },
                { product: "Otherside Deeds", percent: 30, color: "#6c5ce7", apy: "30-100%", maxLoss: 75 }
            ]
        },
        {
            id: "SPORTS_FAN",
            name: "Sports Fan Token",
            icon: "⚽",
            description: "Sports and fan tokens portfolio",
            riskLevel: "High",
            expectedApy: "20-60%",
            capitalProtection: "50%",
            minInvestment: 100,
            rebalanceFrequency: "Weekly",
            allocation: [
                { product: "Soccer Tokens", percent: 40, color: "#00ff88", apy: "15-50%", maxLoss: 60 },
                { product: "NBA Top Shot", percent: 30, color: "#ff6b00", apy: "20-60%", maxLoss: 55 },
                { product: "F1 Tokens", percent: 30, color: "#e10600", apy: "25-70%", maxLoss: 65 }
            ]
        },
        {'id':'WHALE_PORTFOLIO','name':'Whale Portfolio','icon':'🐋','description':'High-value institutional grade portfolio','riskLevel':'Low','expectedApy':'8-15%','capitalProtection':'90%','minInvestment':10000,'rebalanceFrequency':'Monthly','allocation':[{'product':'Blue Chip BTC','percent':40,'color':'#f7931a','apy':'5-12%','maxLoss':15},{'product':'Institutional ETH','percent':30,'color':'#627eea','apy':'6-14%','maxLoss':18},{'product':'Treasury Bonds','percent':20,'color':'#00d4aa','apy':'4-8%','maxLoss':5},{'product':'Gold Token','percent':10,'color':'#ffd700','apy':'3-6%','maxLoss':8}]},
        {'id':'MICRO_STARTER','name':'Micro Starter Pack','icon':'🌱','description':'Perfect for beginners with small capital','riskLevel':'Low','expectedApy':'5-12%','capitalProtection':'85%','minInvestment':10,'rebalanceFrequency':'Weekly','allocation':[{'product':'Stable Savings','percent':50,'color':'#00d4aa','apy':'4-8%','maxLoss':5},{'product':'BTC Fraction','percent':30,'color':'#f7931a','apy':'5-15%','maxLoss':20},{'product':'ETH Fraction','percent':20,'color':'#627eea','apy':'6-16%','maxLoss':22}]},
        {'id':'ASIA_FOCUS','name':'Asia Crypto Focus','icon':'🏯','description':'Asian blockchain projects and exchanges','riskLevel':'Medium','expectedApy':'15-35%','capitalProtection':'65%','minInvestment':200,'rebalanceFrequency':'Weekly','allocation':[{'product':'BNB Chain','percent':35,'color':'#f3ba2f','apy':'10-25%','maxLoss':35},{'product':'NEO Ecosystem','percent':25,'color':'#00e599','apy':'12-30%','maxLoss':40},{'product':'Klaytn','percent':20,'color':'#ff6b6b','apy':'15-35%','maxLoss':45},{'product':'Tron DeFi','percent':20,'color':'#eb0029','apy':'18-40%','maxLoss':50}]},
        {'id':'EURO_DEFI','name':'Euro DeFi Bundle','icon':'🇪🇺','description':'European-compliant DeFi protocols','riskLevel':'Medium','expectedApy':'10-22%','capitalProtection':'75%','minInvestment':500,'rebalanceFrequency':'Monthly','allocation':[{'product':'Staked EURS','percent':40,'color':'#0052b4','apy':'5-10%','maxLoss':10},{'product':'Aave Europe','percent':30,'color':'#b6509e','apy':'8-18%','maxLoss':25},{'product':'Compound EU','percent':30,'color':'#00d395','apy':'10-20%','maxLoss':30}]},
        {'id':'LATAM_YIELD','name':'LatAm Yield Hunter','icon':'🌎','description':'Latin American crypto opportunities','riskLevel':'High','expectedApy':'25-50%','capitalProtection':'50%','minInvestment':150,'rebalanceFrequency':'Weekly','allocation':[{'product':'Brazil DeFi','percent':35,'color':'#009c3b','apy':'20-45%','maxLoss':50},{'product':'Mexico Tokens','percent':35,'color':'#ce1126','apy':'22-48%','maxLoss':55},{'product':'Argentina Stable','percent':30,'color':'#74acdf','apy':'30-60%','maxLoss':40}]},
        {'id':'MEMECOIN_SAFE','name':'Meme Coin Hedged','icon':'🐕','description':'Meme exposure with stablecoin hedge','riskLevel':'Medium-High','expectedApy':'30-80%','capitalProtection':'60%','minInvestment':50,'rebalanceFrequency':'Daily','allocation':[{'product':'Top Memes','percent':40,'color':'#ff9500','apy':'50-150%','maxLoss':70},{'product':'Stable Hedge','percent':40,'color':'#00d4aa','apy':'5-10%','maxLoss':5},{'product':'Blue Chip','percent':20,'color':'#627eea','apy':'8-15%','maxLoss':20}]},
        {'id':'INSTITUTIONAL','name':'Institutional Grade','icon':'🏛️','description':'Bank-grade crypto investment strategy','riskLevel':'Very Low','expectedApy':'6-10%','capitalProtection':'95%','minInvestment':25000,'rebalanceFrequency':'Quarterly','allocation':[{'product':'Custody BTC','percent':35,'color':'#f7931a','apy':'4-8%','maxLoss':10},{'product':'Custody ETH','percent':25,'color':'#627eea','apy':'5-9%','maxLoss':12},{'product':'Treasury','percent':30,'color':'#00d4aa','apy':'4-6%','maxLoss':3},{'product':'Insurance Pool','percent':10,'color':'#9b59b6','apy':'3-5%','maxLoss':2}]},
        {'id':'STUDENT_SAVER','name':'Student Saver','icon':'📚','description':'Low-risk growth for student budgets','riskLevel':'Low','expectedApy':'6-14%','capitalProtection':'80%','minInvestment':25,'rebalanceFrequency':'Monthly','allocation':[{'product':'Stable Earn','percent':60,'color':'#00d4aa','apy':'5-10%','maxLoss':8},{'product':'BTC Learn','percent':25,'color':'#f7931a','apy':'6-18%','maxLoss':25},{'product':'ETH Learn','percent':15,'color':'#627eea','apy':'7-20%','maxLoss':28}]},
        {'id':'TRADER_ACTIVE','name':'Active Trader','icon':'📊','description':'For experienced traders seeking alpha','riskLevel':'High','expectedApy':'35-80%','capitalProtection':'40%','minInvestment':1000,'rebalanceFrequency':'Daily','allocation':[{'product':'Perp Trading','percent':40,'color':'#ff6b6b','apy':'40-100%','maxLoss':60},{'product':'Options Play','percent':30,'color':'#a855f7','apy':'50-120%','maxLoss':70},{'product':'Spot Swing','percent':30,'color':'#3b82f6','apy':'25-60%','maxLoss':40}]},
        {'id':'HODL_FOREVER','name':'HODL Forever','icon':'💎','description':'Long-term accumulation strategy','riskLevel':'Medium','expectedApy':'12-25%','capitalProtection':'70%','minInvestment':500,'rebalanceFrequency':'Yearly','allocation':[{'product':'BTC Stack','percent':50,'color':'#f7931a','apy':'10-20%','maxLoss':30},{'product':'ETH Stack','percent':35,'color':'#627eea','apy':'12-25%','maxLoss':35},{'product':'SOL Stack','percent':15,'color':'#00ffa3','apy':'15-35%','maxLoss':45}]},
        {'id':'DIVIDEND_HUNTER','name':'Dividend Hunter','icon':'💰','description':'Yield-generating token portfolio','riskLevel':'Medium','expectedApy':'15-30%','capitalProtection':'70%','minInvestment':300,'rebalanceFrequency':'Weekly','allocation':[{'product':'Staking Rewards','percent':40,'color':'#00d4aa','apy':'10-20%','maxLoss':20},{'product':'LP Farming','percent':35,'color':'#ff6b6b','apy':'20-40%','maxLoss':35},{'product':'Revenue Share','percent':25,'color':'#a855f7','apy':'15-35%','maxLoss':30}]},
        {'id':'TECH_INNOVATOR','name':'Tech Innovator','icon':'🚀','description':'Cutting-edge blockchain technology','riskLevel':'High','expectedApy':'30-70%','capitalProtection':'45%','minInvestment':250,'rebalanceFrequency':'Weekly','allocation':[{'product':'ZK Rollups','percent':30,'color':'#6366f1','apy':'30-70%','maxLoss':55},{'product':'AI Tokens','percent':30,'color':'#22c55e','apy':'40-90%','maxLoss':60},{'product':'Modular Chains','percent':25,'color':'#f59e0b','apy':'25-60%','maxLoss':50},{'product':'Privacy Tech','percent':15,'color':'#8b5cf6','apy':'20-50%','maxLoss':45}]},
        {'id':'CARBON_NEUTRAL','name':'Carbon Neutral','icon':'🌿','description':'Eco-friendly blockchain investments','riskLevel':'Medium','expectedApy':'10-25%','capitalProtection':'70%','minInvestment':200,'rebalanceFrequency':'Monthly','allocation':[{'product':'Carbon Credits','percent':35,'color':'#22c55e','apy':'8-20%','maxLoss':25},{'product':'Green PoS','percent':35,'color':'#10b981','apy':'10-25%','maxLoss':30},{'product':'Regen Finance','percent':30,'color':'#059669','apy':'12-30%','maxLoss':35}]},
        {'id':'METAVERSE_LAND','name':'Metaverse Landowner','icon':'🏠','description':'Virtual real estate portfolio','riskLevel':'High','expectedApy':'25-60%','capitalProtection':'45%','minInvestment':500,'rebalanceFrequency':'Monthly','allocation':[{'product':'Decentraland','percent':30,'color':'#ff2d55','apy':'20-50%','maxLoss':55},{'product':'Sandbox','percent':30,'color':'#00b4e6','apy':'25-60%','maxLoss':60},{'product':'Otherside','percent':25,'color':'#6c5ce7','apy':'30-70%','maxLoss':65},{'product':'Somnium','percent':15,'color':'#9b59b6','apy':'35-80%','maxLoss':70}]},

        // ═══════════════════════════════════════════════════════════════
        // MEGA COMBOS - Combos of Combos (Meta-Portfolios)
        // ═══════════════════════════════════════════════════════════════
        {'id':'MEGA_BALANCED','name':'🌟 MEGA Balanced','icon':'⚖️','description':'Ultimate diversification: combines 4 combos for perfect balance','riskLevel':'Medium','expectedApy':'15-30%','capitalProtection':'75%','minInvestment':1000,'rebalanceFrequency':'Weekly','isMegaCombo':true,'allocation':[{'product':'Conservative Yield Combo','percent':30,'color':'#00d4aa','apy':'5-12%','maxLoss':10},{'product':'Blue Chip Combo','percent':30,'color':'#627eea','apy':'15-25%','maxLoss':25},{'product':'Growth Portfolio Combo','percent':25,'color':'#f7931a','apy':'18-35%','maxLoss':30},{'product':'Dividend Hunter Combo','percent':15,'color':'#a855f7','apy':'15-30%','maxLoss':25}]},
        {'id':'MEGA_AGGRESSIVE','name':'🔥 MEGA Aggressive','icon':'🚀','description':'Maximum returns: combines high-yield combos','riskLevel':'Very High','expectedApy':'50-120%','capitalProtection':'30%','minInvestment':2000,'rebalanceFrequency':'Daily','isMegaCombo':true,'allocation':[{'product':'Degen Paradise Combo','percent':35,'color':'#ff6b6b','apy':'80-200%','maxLoss':80},{'product':'Tech Innovator Combo','percent':25,'color':'#6366f1','apy':'30-70%','maxLoss':55},{'product':'Active Trader Combo','percent':25,'color':'#f59e0b','apy':'35-80%','maxLoss':60},{'product':'Memecoin Hedged Combo','percent':15,'color':'#ff9500','apy':'30-80%','maxLoss':50}]},
        {'id':'MEGA_INCOME','name':'💵 MEGA Income','icon':'🏦','description':'Passive income maximizer: yield-focused combos','riskLevel':'Low-Medium','expectedApy':'12-25%','capitalProtection':'80%','minInvestment':5000,'rebalanceFrequency':'Monthly','isMegaCombo':true,'allocation':[{'product':'Dividend Hunter Combo','percent':35,'color':'#00d4aa','apy':'15-30%','maxLoss':25},{'product':'Conservative Yield Combo','percent':30,'color':'#4a9eff','apy':'5-12%','maxLoss':10},{'product':'Institutional Grade Combo','percent':20,'color':'#9b59b6','apy':'6-10%','maxLoss':8},{'product':'Staking Rewards Combo','percent':15,'color':'#22c55e','apy':'10-20%','maxLoss':15}]},
        {'id':'MEGA_GLOBAL','name':'🌍 MEGA Global','icon':'🗺️','description':'Worldwide exposure: regional combos combined','riskLevel':'Medium','expectedApy':'20-40%','capitalProtection':'60%','minInvestment':3000,'rebalanceFrequency':'Weekly','isMegaCombo':true,'allocation':[{'product':'Asia Focus Combo','percent':30,'color':'#f3ba2f','apy':'15-35%','maxLoss':40},{'product':'Euro DeFi Combo','percent':25,'color':'#0052b4','apy':'10-22%','maxLoss':25},{'product':'LatAm Yield Combo','percent':25,'color':'#009c3b','apy':'25-50%','maxLoss':45},{'product':'Blue Chip Combo','percent':20,'color':'#627eea','apy':'15-25%','maxLoss':25}]},
        {'id':'MEGA_FUTURE','name':'🔮 MEGA Future','icon':'🤖','description':'Next-gen tech: AI, ZK, and emerging tech combos','riskLevel':'High','expectedApy':'35-75%','capitalProtection':'40%','minInvestment':2500,'rebalanceFrequency':'Weekly','isMegaCombo':true,'allocation':[{'product':'Tech Innovator Combo','percent':35,'color':'#6366f1','apy':'30-70%','maxLoss':55},{'product':'AI & Data Combo','percent':30,'color':'#22c55e','apy':'40-90%','maxLoss':60},{'product':'DePIN Infra Combo','percent':20,'color':'#f59e0b','apy':'25-55%','maxLoss':50},{'product':'Emerging Chains Combo','percent':15,'color':'#8b5cf6','apy':'30-65%','maxLoss':55}]},

        // ═══════════════════════════════════════════════════════════════
        // NEW THEMED COMBOS
        // ═══════════════════════════════════════════════════════════════
        {'id':'RETIREMENT_PLAN','name':'Retirement Plan','icon':'🏖️','description':'Long-term wealth building for retirement','riskLevel':'Low','expectedApy':'8-15%','capitalProtection':'90%','minInvestment':1000,'rebalanceFrequency':'Quarterly','allocation':[{'product':'Treasury Bonds','percent':40,'color':'#00d4aa','apy':'5-8%','maxLoss':5},{'product':'BTC Accumulator','percent':30,'color':'#f7931a','apy':'8-18%','maxLoss':20},{'product':'ETH Staking','percent':20,'color':'#627eea','apy':'10-15%','maxLoss':18},{'product':'Gold Token','percent':10,'color':'#ffd700','apy':'3-8%','maxLoss':10}]},
        {'id':'WEEKEND_WARRIOR','name':'Weekend Warrior','icon':'⚔️','description':'High-action weekend trading strategy','riskLevel':'Very High','expectedApy':'40-100%','capitalProtection':'25%','minInvestment':200,'rebalanceFrequency':'Weekly','allocation':[{'product':'Leverage Trades','percent':40,'color':'#ff6b6b','apy':'60-150%','maxLoss':80},{'product':'Meme Plays','percent':30,'color':'#ff9500','apy':'50-200%','maxLoss':85},{'product':'Arbitrage Bot','percent':30,'color':'#3b82f6','apy':'20-50%','maxLoss':30}]},
        {'id':'NIGHT_OWL','name':'Night Owl Asia','icon':'🦉','description':'Trade Asian market hours (midnight-8am UTC)','riskLevel':'Medium-High','expectedApy':'25-50%','capitalProtection':'55%','minInvestment':500,'rebalanceFrequency':'Daily','allocation':[{'product':'Asian Tokens','percent':40,'color':'#f3ba2f','apy':'20-45%','maxLoss':45},{'product':'Korean DeFi','percent':30,'color':'#00d4aa','apy':'25-50%','maxLoss':50},{'product':'Japan Tech','percent':30,'color':'#ff6b6b','apy':'30-60%','maxLoss':55}]},
        {'id':'GAMING_GUILD','name':'Gaming Guild','icon':'🎮','description':'Play-to-earn and gaming token portfolio','riskLevel':'High','expectedApy':'30-70%','capitalProtection':'40%','minInvestment':150,'rebalanceFrequency':'Weekly','allocation':[{'product':'Axie Infinity','percent':25,'color':'#00b4e6','apy':'25-60%','maxLoss':55},{'product':'Gala Games','percent':25,'color':'#ff6b6b','apy':'30-70%','maxLoss':60},{'product':'Immutable X','percent':25,'color':'#6366f1','apy':'35-75%','maxLoss':65},{'product':'Yield Guild','percent':25,'color':'#22c55e','apy':'20-50%','maxLoss':50}]},
        {'id':'MUSIC_NFT','name':'Music & NFT','icon':'🎵','description':'Music tokens and audio NFT investments','riskLevel':'High','expectedApy':'25-60%','capitalProtection':'45%','minInvestment':100,'rebalanceFrequency':'Weekly','allocation':[{'product':'Audius','percent':35,'color':'#cc00ff','apy':'20-50%','maxLoss':55},{'product':'Royal.io Pool','percent':30,'color':'#ff6b6b','apy':'25-60%','maxLoss':60},{'product':'Sound.xyz','percent':35,'color':'#00d4aa','apy':'30-70%','maxLoss':65}]},
        {'id':'REAL_WORLD','name':'Real World Assets','icon':'🏢','description':'Tokenized real-world assets (RWA)','riskLevel':'Low-Medium','expectedApy':'8-18%','capitalProtection':'85%','minInvestment':1000,'rebalanceFrequency':'Monthly','allocation':[{'product':'Real Estate Tokens','percent':35,'color':'#00d4aa','apy':'6-12%','maxLoss':15},{'product':'Commodity Tokens','percent':30,'color':'#ffd700','apy':'5-10%','maxLoss':12},{'product':'Invoice Financing','percent':20,'color':'#3b82f6','apy':'10-18%','maxLoss':20},{'product':'Art Tokens','percent':15,'color':'#a855f7','apy':'15-25%','maxLoss':30}]},
        {'id':'PRIVACY_FOCUSED','name':'Privacy Focused','icon':'🔒','description':'Privacy coins and anonymous DeFi','riskLevel':'Medium-High','expectedApy':'20-45%','capitalProtection':'55%','minInvestment':300,'rebalanceFrequency':'Weekly','allocation':[{'product':'Monero Pool','percent':30,'color':'#ff6600','apy':'15-35%','maxLoss':45},{'product':'Zcash Staking','percent':25,'color':'#f4b728','apy':'12-30%','maxLoss':40},{'product':'Secret Network','percent':25,'color':'#1b1b1b','apy':'18-40%','maxLoss':50},{'product':'Tornado Alt','percent':20,'color':'#00d4aa','apy':'25-55%','maxLoss':55}]},
        {'id':'ORACLE_NETWORK','name':'Oracle Networks','icon':'🔮','description':'Blockchain oracle and data providers','riskLevel':'Medium','expectedApy':'15-35%','capitalProtection':'65%','minInvestment':250,'rebalanceFrequency':'Weekly','allocation':[{'product':'Chainlink','percent':40,'color':'#375bd2','apy':'10-25%','maxLoss':30},{'product':'Band Protocol','percent':25,'color':'#4520ff','apy':'15-35%','maxLoss':40},{'product':'API3','percent':20,'color':'#00d4aa','apy':'18-40%','maxLoss':45},{'product':'Pyth Network','percent':15,'color':'#7c3aed','apy':'20-45%','maxLoss':50}]},
        {'id':'BRIDGE_MASTER','name':'Bridge Master','icon':'🌉','description':'Cross-chain bridge tokens and protocols','riskLevel':'Medium-High','expectedApy':'20-45%','capitalProtection':'55%','minInvestment':400,'rebalanceFrequency':'Weekly','allocation':[{'product':'Stargate','percent':30,'color':'#6366f1','apy':'18-40%','maxLoss':45},{'product':'LayerZero','percent':30,'color':'#00d4aa','apy':'20-45%','maxLoss':50},{'product':'Wormhole','percent':25,'color':'#ff6b6b','apy':'22-50%','maxLoss':55},{'product':'Synapse','percent':15,'color':'#a855f7','apy':'25-55%','maxLoss':60}]},
        {'id':'DEX_LIQUIDITY','name':'DEX Liquidity Pro','icon':'💧','description':'Concentrated liquidity across top DEXes','riskLevel':'Medium-High','expectedApy':'25-55%','capitalProtection':'50%','minInvestment':500,'rebalanceFrequency':'Daily','allocation':[{'product':'Uniswap V3 LP','percent':35,'color':'#ff007a','apy':'20-50%','maxLoss':40},{'product':'Curve Finance','percent':30,'color':'#0033ad','apy':'15-35%','maxLoss':30},{'product':'Balancer','percent':20,'color':'#1e1e1e','apy':'18-45%','maxLoss':45},{'product':'Velodrome','percent':15,'color':'#00d4aa','apy':'30-60%','maxLoss':55}]},

        // ═══════════════════════════════════════════════════════════════
        // LOW MINIMUM INVESTMENT COMBOS ($1 - $50)
        // Perfect for beginners, students, and micro-investors
        // ═══════════════════════════════════════════════════════════════

        // $1 MINIMUM COMBOS
        {
            id: 'MICRO_BTC_ONLY',
            name: 'Micro Starter',
            icon: '🌱',
            description: 'Start your Bitcoin journey with just $1. Simple BTC accumulation strategy.',
            riskLevel: 'Medium',
            expectedApy: '8-20%',
            capitalProtection: '70%',
            minInvestment: 1,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC Micro Stack', percent: 100, color: '#f7931a', apy: '8-20%', maxLoss: 30 }
            ]
        },
        {
            id: 'NANO_DCA_ETH',
            name: 'Nano DCA',
            icon: '💎',
            description: 'Weekly ETH dollar-cost averaging. Build wealth $1 at a time.',
            riskLevel: 'Medium',
            expectedApy: '10-25%',
            capitalProtection: '70%',
            minInvestment: 1,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Weekly DCA', percent: 100, color: '#627eea', apy: '10-25%', maxLoss: 35 }
            ]
        },
        {
            id: 'STABLECOIN_MICRO',
            name: 'Stablecoin Yield',
            icon: '💵',
            description: 'Earn yield on stablecoins. Low risk, steady returns from $1.',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '98%',
            minInvestment: 1,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDC Savings', percent: 50, color: '#2775ca', apy: '5-8%', maxLoss: 1 },
                { product: 'USDT Earn', percent: 50, color: '#26a17b', apy: '5-10%', maxLoss: 2 }
            ]
        },
        {
            id: 'PENNY_SAVER',
            name: 'Penny Saver',
            icon: '🐷',
            description: 'Digital piggy bank. Save spare change in crypto starting from $1.',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '90%',
            minInvestment: 1,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Stable Savings', percent: 60, color: '#00d4aa', apy: '5-8%', maxLoss: 3 },
                { product: 'BTC Sats', percent: 25, color: '#f7931a', apy: '8-18%', maxLoss: 25 },
                { product: 'ETH Wei', percent: 15, color: '#627eea', apy: '8-15%', maxLoss: 25 }
            ]
        },

        // $5 MINIMUM COMBOS
        {
            id: 'STUDENT_PACK',
            name: 'Student Pack',
            icon: '📚',
            description: 'Top 3 cryptocurrencies for students. Learn while you earn.',
            riskLevel: 'Medium',
            expectedApy: '10-22%',
            capitalProtection: '75%',
            minInvestment: 5,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC Basic', percent: 40, color: '#f7931a', apy: '8-18%', maxLoss: 25 },
                { product: 'ETH Basic', percent: 35, color: '#627eea', apy: '10-22%', maxLoss: 28 },
                { product: 'USDC Yield', percent: 25, color: '#2775ca', apy: '5-8%', maxLoss: 2 }
            ]
        },
        {
            id: 'MEME_HUNTER',
            name: 'Meme Hunter',
            icon: '🐕',
            description: 'DOGE, SHIB, PEPE - the meme coin trio. High risk, high fun!',
            riskLevel: 'High',
            expectedApy: '25-100%',
            capitalProtection: '40%',
            minInvestment: 5,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'DOGE Stack', percent: 40, color: '#c2a633', apy: '20-80%', maxLoss: 60 },
                { product: 'SHIB Stack', percent: 35, color: '#ffa409', apy: '25-100%', maxLoss: 70 },
                { product: 'PEPE Stack', percent: 25, color: '#479c47', apy: '30-150%', maxLoss: 80 }
            ]
        },
        {
            id: 'FIRST_STEPS',
            name: 'First Steps',
            icon: '👶',
            description: 'Your first crypto portfolio. Safe, simple, and educational.',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '88%',
            minInvestment: 5,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDC Stable', percent: 50, color: '#2775ca', apy: '5-8%', maxLoss: 2 },
                { product: 'BTC Learn', percent: 30, color: '#f7931a', apy: '6-15%', maxLoss: 20 },
                { product: 'ETH Learn', percent: 20, color: '#627eea', apy: '7-16%', maxLoss: 22 }
            ]
        },
        {
            id: 'SPARE_CHANGE',
            name: 'Spare Change',
            icon: '🪙',
            description: 'Round up your purchases and invest the spare change.',
            riskLevel: 'Low',
            expectedApy: '7-14%',
            capitalProtection: '85%',
            minInvestment: 5,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Stable Reserve', percent: 40, color: '#00d4aa', apy: '5-9%', maxLoss: 3 },
                { product: 'Blue Chip Mix', percent: 40, color: '#627eea', apy: '8-18%', maxLoss: 22 },
                { product: 'Growth Tokens', percent: 20, color: '#ff6b9d', apy: '12-25%', maxLoss: 30 }
            ]
        },

        // $10 MINIMUM COMBOS
        {
            id: 'COFFEE_FUND',
            name: 'Coffee Fund',
            icon: '☕',
            description: 'Skip one coffee, invest $10. Daily micro-investment strategy.',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '75%',
            minInvestment: 10,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'BTC Daily', percent: 35, color: '#f7931a', apy: '10-22%', maxLoss: 25 },
                { product: 'ETH Daily', percent: 35, color: '#627eea', apy: '12-25%', maxLoss: 28 },
                { product: 'Stable Buffer', percent: 30, color: '#00d4aa', apy: '5-10%', maxLoss: 3 }
            ]
        },
        {
            id: 'BLUE_CHIP_MINI',
            name: 'Blue Chip Mini',
            icon: '💠',
            description: 'BTC + ETH only. The essentials in a mini package.',
            riskLevel: 'Medium',
            expectedApy: '10-20%',
            capitalProtection: '75%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC Core', percent: 55, color: '#f7931a', apy: '8-18%', maxLoss: 25 },
                { product: 'ETH Core', percent: 45, color: '#627eea', apy: '10-22%', maxLoss: 28 }
            ]
        },
        {
            id: 'LAYER2_MINI',
            name: 'Layer 2 Bundle',
            icon: '🔗',
            description: 'ARB, OP, MATIC - Layer 2 scaling solutions basket.',
            riskLevel: 'Medium',
            expectedApy: '15-35%',
            capitalProtection: '65%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ARB Stack', percent: 35, color: '#28a0f0', apy: '12-30%', maxLoss: 35 },
                { product: 'OP Stack', percent: 35, color: '#ff0420', apy: '15-35%', maxLoss: 38 },
                { product: 'MATIC Stack', percent: 30, color: '#8247e5', apy: '18-40%', maxLoss: 40 }
            ]
        },
        {
            id: 'GAMING_GEMS',
            name: 'Gaming Gems',
            icon: '🎮',
            description: 'Gaming and metaverse tokens. Play-to-earn exposure.',
            riskLevel: 'High',
            expectedApy: '20-50%',
            capitalProtection: '50%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'IMX Gaming', percent: 35, color: '#00bfff', apy: '15-40%', maxLoss: 50 },
                { product: 'GALA', percent: 35, color: '#00d4aa', apy: '20-50%', maxLoss: 55 },
                { product: 'SAND', percent: 30, color: '#00adef', apy: '18-45%', maxLoss: 52 }
            ]
        },
        {
            id: 'MINI_DEFI',
            name: 'Mini DeFi',
            icon: '🏦',
            description: 'DeFi blue chips in a small package. AAVE, UNI, LINK.',
            riskLevel: 'Medium',
            expectedApy: '12-28%',
            capitalProtection: '70%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'AAVE', percent: 35, color: '#b6509e', apy: '10-22%', maxLoss: 30 },
                { product: 'UNI', percent: 35, color: '#ff007a', apy: '12-28%', maxLoss: 32 },
                { product: 'LINK', percent: 30, color: '#375bd2', apy: '15-30%', maxLoss: 35 }
            ]
        },

        // $25 MINIMUM COMBOS
        {
            id: 'LUNCH_MONEY',
            name: 'Lunch Money',
            icon: '🍔',
            description: 'Balanced portfolio for the price of lunch. Diversified growth.',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '75%',
            minInvestment: 25,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC Portion', percent: 30, color: '#f7931a', apy: '8-18%', maxLoss: 25 },
                { product: 'ETH Portion', percent: 25, color: '#627eea', apy: '10-22%', maxLoss: 28 },
                { product: 'Altcoin Mix', percent: 25, color: '#00d4aa', apy: '15-35%', maxLoss: 40 },
                { product: 'Stable Base', percent: 20, color: '#2775ca', apy: '5-10%', maxLoss: 2 }
            ]
        },
        {
            id: 'ALT_SEASON_PREP',
            name: 'Alt Season Prep',
            icon: '🚀',
            description: 'Top 10 altcoins basket. Prepared for the next alt season.',
            riskLevel: 'High',
            expectedApy: '20-50%',
            capitalProtection: '55%',
            minInvestment: 25,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'SOL', percent: 20, color: '#9945ff', apy: '18-45%', maxLoss: 45 },
                { product: 'AVAX', percent: 15, color: '#e84142', apy: '15-40%', maxLoss: 48 },
                { product: 'DOT', percent: 15, color: '#e6007a', apy: '12-35%', maxLoss: 45 },
                { product: 'ATOM', percent: 15, color: '#2e3148', apy: '15-38%', maxLoss: 42 },
                { product: 'NEAR', percent: 15, color: '#00ec97', apy: '20-50%', maxLoss: 50 },
                { product: 'Other Alts', percent: 20, color: '#ff6b9d', apy: '25-60%', maxLoss: 55 }
            ]
        },
        {
            id: 'AI_DATA_MINI',
            name: 'AI & Data',
            icon: '🤖',
            description: 'AI-related crypto tokens. FET, RNDR, AGIX and more.',
            riskLevel: 'High',
            expectedApy: '25-60%',
            capitalProtection: '50%',
            minInvestment: 25,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'FET (Fetch.ai)', percent: 30, color: '#1d1d47', apy: '20-50%', maxLoss: 55 },
                { product: 'RNDR', percent: 30, color: '#cc0000', apy: '25-60%', maxLoss: 58 },
                { product: 'AGIX', percent: 25, color: '#6c5ce7', apy: '28-65%', maxLoss: 60 },
                { product: 'TAO', percent: 15, color: '#00ff88', apy: '30-70%', maxLoss: 65 }
            ]
        },
        {
            id: 'DEFI_STARTER',
            name: 'DeFi Starter',
            icon: '🔷',
            description: 'AAVE, UNI, LINK - DeFi fundamentals for beginners.',
            riskLevel: 'Medium',
            expectedApy: '12-28%',
            capitalProtection: '70%',
            minInvestment: 25,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'AAVE Earn', percent: 35, color: '#b6509e', apy: '10-22%', maxLoss: 28 },
                { product: 'UNI Hold', percent: 35, color: '#ff007a', apy: '12-28%', maxLoss: 32 },
                { product: 'LINK Oracle', percent: 30, color: '#375bd2', apy: '14-32%', maxLoss: 35 }
            ]
        },
        {
            id: 'WEEKLY_SAVER',
            name: 'Weekly Saver',
            icon: '📅',
            description: 'Automated weekly savings plan. Set it and forget it.',
            riskLevel: 'Low',
            expectedApy: '8-16%',
            capitalProtection: '85%',
            minInvestment: 25,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Stable Core', percent: 50, color: '#00d4aa', apy: '5-10%', maxLoss: 3 },
                { product: 'BTC Auto', percent: 30, color: '#f7931a', apy: '8-20%', maxLoss: 25 },
                { product: 'ETH Auto', percent: 20, color: '#627eea', apy: '10-22%', maxLoss: 28 }
            ]
        },

        // $50 MINIMUM COMBOS
        {
            id: 'WEEKEND_TRADER',
            name: 'Weekend Trader',
            icon: '📈',
            description: 'Momentum strategy for active weekend traders.',
            riskLevel: 'Medium-High',
            expectedApy: '18-40%',
            capitalProtection: '60%',
            minInvestment: 50,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Momentum BTC', percent: 30, color: '#f7931a', apy: '15-35%', maxLoss: 35 },
                { product: 'Momentum ETH', percent: 30, color: '#627eea', apy: '18-40%', maxLoss: 38 },
                { product: 'Trend Alts', percent: 25, color: '#ff6b9d', apy: '20-50%', maxLoss: 45 },
                { product: 'Cash Buffer', percent: 15, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ]
        },
        {
            id: 'PRIVACY_PACK',
            name: 'Privacy Pack',
            icon: '🔐',
            description: 'Privacy coins portfolio. Monero, Zcash, Secret.',
            riskLevel: 'Medium-High',
            expectedApy: '15-35%',
            capitalProtection: '60%',
            minInvestment: 50,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'XMR (Monero)', percent: 40, color: '#ff6600', apy: '12-30%', maxLoss: 40 },
                { product: 'ZEC (Zcash)', percent: 35, color: '#f4b728', apy: '15-35%', maxLoss: 42 },
                { product: 'SCRT (Secret)', percent: 25, color: '#1b1b1b', apy: '18-40%', maxLoss: 45 }
            ]
        },
        {
            id: 'SOLANA_STARTER',
            name: 'Solana Starter',
            icon: '⚡',
            description: 'Solana ecosystem exposure. SOL staking + DeFi.',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '70%',
            minInvestment: 50,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'SOL Staking', percent: 50, color: '#9945ff', apy: '7-10%', maxLoss: 30 },
                { product: 'Raydium LP', percent: 30, color: '#2dd4bf', apy: '20-40%', maxLoss: 40 },
                { product: 'Jupiter DeFi', percent: 20, color: '#c7f284', apy: '25-45%', maxLoss: 45 }
            ]
        },
        {
            id: 'COSMOS_STARTER',
            name: 'Cosmos Starter',
            icon: '⚛️',
            description: 'Cosmos ecosystem basics. ATOM, OSMO staking.',
            riskLevel: 'Medium',
            expectedApy: '14-28%',
            capitalProtection: '70%',
            minInvestment: 50,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ATOM Stake', percent: 50, color: '#2e3148', apy: '12-20%', maxLoss: 28 },
                { product: 'OSMO Pool', percent: 30, color: '#5e12a0', apy: '15-30%', maxLoss: 35 },
                { product: 'JUNO Stake', percent: 20, color: '#f0827d', apy: '18-35%', maxLoss: 38 }
            ]
        },
        {
            id: 'YIELD_HUNTER_MINI',
            name: 'Yield Hunter Mini',
            icon: '🎯',
            description: 'Best yields across DeFi protocols. Optimized for returns.',
            riskLevel: 'Medium',
            expectedApy: '15-32%',
            capitalProtection: '70%',
            minInvestment: 50,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Lending Yield', percent: 35, color: '#00d4aa', apy: '10-20%', maxLoss: 15 },
                { product: 'LP Farming', percent: 35, color: '#ff007a', apy: '18-40%', maxLoss: 35 },
                { product: 'Staking Rewards', percent: 30, color: '#627eea', apy: '12-25%', maxLoss: 25 }
            ]
        },

        // $100 MINIMUM COMBOS (Institutional Lite)
        {
            id: 'INSTITUTIONAL_LITE',
            name: 'Institutional Lite',
            icon: '🏛️',
            description: 'Professional strategies accessible from $100.',
            riskLevel: 'Low-Medium',
            expectedApy: '10-20%',
            capitalProtection: '85%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC Custody', percent: 35, color: '#f7931a', apy: '8-15%', maxLoss: 20 },
                { product: 'ETH Custody', percent: 30, color: '#627eea', apy: '10-18%', maxLoss: 22 },
                { product: 'Treasury Yield', percent: 25, color: '#00d4aa', apy: '5-10%', maxLoss: 3 },
                { product: 'Gold Token', percent: 10, color: '#ffd700', apy: '3-8%', maxLoss: 8 }
            ]
        },
        {
            id: 'DIVERSIFIED_MINI',
            name: 'Diversified Mini',
            icon: '🌈',
            description: '10+ assets in one combo. Maximum diversification.',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '75%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC', percent: 20, color: '#f7931a', apy: '8-18%', maxLoss: 25 },
                { product: 'ETH', percent: 20, color: '#627eea', apy: '10-22%', maxLoss: 28 },
                { product: 'SOL', percent: 12, color: '#9945ff', apy: '12-28%', maxLoss: 35 },
                { product: 'Stables', percent: 20, color: '#00d4aa', apy: '5-10%', maxLoss: 2 },
                { product: 'DeFi Mix', percent: 15, color: '#ff007a', apy: '15-35%', maxLoss: 40 },
                { product: 'L2 Tokens', percent: 13, color: '#28a0f0', apy: '18-40%', maxLoss: 42 }
            ]
        },
        // ═══════════════════════════════════════════════════════════════
        // NEW COMBOS - Additional strategies (Jan 2025)
        // ═══════════════════════════════════════════════════════════════
        {
            id: 'INFLATION_HEDGE',
            name: 'Inflation Hedge',
            icon: '🛡️',
            description: 'Protection against inflation with real assets',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '95%',
            minInvestment: 200,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Gold Token (PAXG)', percent: 35, color: '#ffd700', apy: '3-8%', maxLoss: 10 },
                { product: 'RWA Bonds', percent: 35, color: '#4a9eff', apy: '5-10%', maxLoss: 5 },
                { product: 'USDC Yield', percent: 30, color: '#2775ca', apy: '6-10%', maxLoss: 2 }
            ]
        },
        {
            id: 'WEEKLY_PAYCHECK',
            name: 'Weekly Paycheck',
            icon: '💵',
            description: 'Weekly dividend distributions from yield strategies',
            riskLevel: 'Low',
            expectedApy: '8-14%',
            capitalProtection: '90%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'High-Yield Lending', percent: 40, color: '#00d4aa', apy: '8-12%', maxLoss: 8 },
                { product: 'Dividend Tokens', percent: 35, color: '#9966ff', apy: '10-15%', maxLoss: 12 },
                { product: 'Stable LP Fees', percent: 25, color: '#f59e0b', apy: '6-10%', maxLoss: 5 }
            ]
        },
        {
            id: 'AVALANCHE_RUSH',
            name: 'Avalanche Rush',
            icon: '🔺',
            description: 'AVAX ecosystem DeFi strategies',
            riskLevel: 'Medium',
            expectedApy: '15-28%',
            capitalProtection: '70%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'AVAX Staking', percent: 40, color: '#e84142', apy: '8-12%', maxLoss: 25 },
                { product: 'Trader Joe LP', percent: 30, color: '#ff6b6b', apy: '20-35%', maxLoss: 35 },
                { product: 'Benqi Lending', percent: 30, color: '#0ea5e9', apy: '10-20%', maxLoss: 20 }
            ]
        },
        {
            id: 'BASE_BUILDER',
            name: 'Base Builder',
            icon: '🔵',
            description: 'Coinbase Base L2 ecosystem exposure',
            riskLevel: 'Medium',
            expectedApy: '18-35%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH on Base', percent: 35, color: '#0052ff', apy: '8-15%', maxLoss: 25 },
                { product: 'Aerodrome LP', percent: 35, color: '#00d4aa', apy: '25-45%', maxLoss: 40 },
                { product: 'Base DeFi', percent: 30, color: '#627eea', apy: '20-35%', maxLoss: 35 }
            ]
        },
        {
            id: 'POLKADOT_PARACHAINS',
            name: 'Polkadot Parachains',
            icon: '⚫',
            description: 'DOT staking and parachain DeFi',
            riskLevel: 'Medium',
            expectedApy: '12-22%',
            capitalProtection: '75%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'DOT Staking', percent: 50, color: '#e6007a', apy: '10-15%', maxLoss: 30 },
                { product: 'Acala DeFi', percent: 25, color: '#645aff', apy: '15-25%', maxLoss: 35 },
                { product: 'Moonbeam LP', percent: 25, color: '#53cbc8', apy: '12-22%', maxLoss: 30 }
            ]
        },
        {
            id: 'CARDANO_STAKE',
            name: 'Cardano Stake',
            icon: '🔷',
            description: 'ADA staking with DeFi yield boost',
            riskLevel: 'Low',
            expectedApy: '5-12%',
            capitalProtection: '85%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'ADA Delegation', percent: 60, color: '#0033ad', apy: '4-6%', maxLoss: 25 },
                { product: 'Minswap LP', percent: 25, color: '#00d4aa', apy: '8-15%', maxLoss: 30 },
                { product: 'Liqwid Lending', percent: 15, color: '#627eea', apy: '6-12%', maxLoss: 20 }
            ]
        },
        {
            id: 'RESTAKING_PRO',
            name: 'Restaking Pro',
            icon: '🔄',
            description: 'EigenLayer restaking strategies',
            riskLevel: 'Medium',
            expectedApy: '10-18%',
            capitalProtection: '80%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'EigenLayer ETH', percent: 50, color: '#8b5cf6', apy: '8-12%', maxLoss: 20 },
                { product: 'Liquid Restaking', percent: 30, color: '#00d4aa', apy: '12-18%', maxLoss: 25 },
                { product: 'AVS Rewards', percent: 20, color: '#f59e0b', apy: '10-20%', maxLoss: 15 }
            ]
        },
        {
            id: 'POINTS_MAXIMIZER',
            name: 'Points Maximizer',
            icon: '⭐',
            description: 'Maximize airdrop points across protocols',
            riskLevel: 'Medium',
            expectedApy: '15-50%',
            capitalProtection: '70%',
            minInvestment: 300,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'EigenLayer Points', percent: 30, color: '#8b5cf6', apy: '15-40%', maxLoss: 25 },
                { product: 'Blast Points', percent: 25, color: '#fcff00', apy: '20-60%', maxLoss: 35 },
                { product: 'Mode Points', percent: 25, color: '#dffe00', apy: '15-45%', maxLoss: 30 },
                { product: 'Scroll Points', percent: 20, color: '#ffeeda', apy: '10-30%', maxLoss: 25 }
            ]
        },
        {
            id: 'TREASURY_PLUS',
            name: 'Treasury Plus',
            icon: '🏛️',
            description: 'US Treasury exposure with crypto yield',
            riskLevel: 'Low',
            expectedApy: '5-8%',
            capitalProtection: '98%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDY (Ondo)', percent: 50, color: '#2563eb', apy: '5-6%', maxLoss: 1 },
                { product: 'BUIDL (BlackRock)', percent: 30, color: '#000000', apy: '5-5.5%', maxLoss: 1 },
                { product: 'sDAI', percent: 20, color: '#f5ac37', apy: '5-8%', maxLoss: 2 }
            ]
        },
        {
            id: 'ZK_ROLLUP_PACK',
            name: 'ZK Rollup Pack',
            icon: '🔐',
            description: 'Zero-Knowledge rollup ecosystem plays',
            riskLevel: 'Medium',
            expectedApy: '20-40%',
            capitalProtection: '65%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'zkSync Era DeFi', percent: 35, color: '#8c8dfc', apy: '20-40%', maxLoss: 40 },
                { product: 'Starknet Yield', percent: 35, color: '#ec796b', apy: '25-45%', maxLoss: 45 },
                { product: 'Scroll DeFi', percent: 30, color: '#ffeeda', apy: '15-35%', maxLoss: 35 }
            ]
        },
        {
            id: 'MEMECOIN_INDEX',
            name: 'Memecoin Index',
            icon: '🐕',
            description: 'Diversified exposure to top memecoins',
            riskLevel: 'Very High',
            expectedApy: '50-200%',
            capitalProtection: '30%',
            minInvestment: 50,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'DOGE', percent: 30, color: '#c3a634', apy: '30-100%', maxLoss: 60 },
                { product: 'SHIB', percent: 25, color: '#ffa409', apy: '40-150%', maxLoss: 70 },
                { product: 'PEPE', percent: 25, color: '#4a9148', apy: '50-200%', maxLoss: 80 },
                { product: 'WIF', percent: 20, color: '#e4a853', apy: '60-250%', maxLoss: 85 }
            ]
        },
        {
            id: 'WHALE_WATCHER',
            name: 'Whale Watcher',
            icon: '🐋',
            description: 'Copy top whale wallet strategies',
            riskLevel: 'High',
            expectedApy: '30-60%',
            capitalProtection: '55%',
            minInvestment: 1000,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Whale Copy BTC', percent: 35, color: '#f7931a', apy: '25-50%', maxLoss: 35 },
                { product: 'Whale Copy ETH', percent: 35, color: '#627eea', apy: '30-55%', maxLoss: 40 },
                { product: 'Whale Altcoins', percent: 30, color: '#a855f7', apy: '40-80%', maxLoss: 55 }
            ]
        },
        {
            id: 'MARKET_NEUTRAL',
            name: 'Market Neutral',
            icon: '⚖️',
            description: 'Delta-neutral strategies for any market',
            riskLevel: 'Low',
            expectedApy: '12-20%',
            capitalProtection: '90%',
            minInvestment: 500,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Funding Arbitrage', percent: 40, color: '#00d4aa', apy: '10-18%', maxLoss: 8 },
                { product: 'Basis Trading', percent: 35, color: '#4a9eff', apy: '12-22%', maxLoss: 10 },
                { product: 'Cash & Carry', percent: 25, color: '#9966ff', apy: '15-25%', maxLoss: 12 }
            ]
        },
        {
            id: 'PERP_YIELD',
            name: 'Perp Yield Farmer',
            icon: '📊',
            description: 'Earn from perpetual DEX liquidity',
            riskLevel: 'Medium',
            expectedApy: '20-35%',
            capitalProtection: '70%',
            minInvestment: 300,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'GMX GLP', percent: 35, color: '#2d42fc', apy: '15-30%', maxLoss: 25 },
                { product: 'Jupiter JLP', percent: 35, color: '#c7f284', apy: '20-35%', maxLoss: 30 },
                { product: 'Gains Network', percent: 30, color: '#00d4aa', apy: '25-40%', maxLoss: 35 }
            ]
        },
        {
            id: 'EURO_STABLE',
            name: 'Euro Stable',
            icon: '💶',
            description: 'Euro-denominated stablecoin yields',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '95%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'EURS Yield', percent: 40, color: '#003399', apy: '4-7%', maxLoss: 2 },
                { product: 'agEUR Staking', percent: 35, color: '#1e90ff', apy: '5-9%', maxLoss: 3 },
                { product: 'EURe Lending', percent: 25, color: '#ffcc00', apy: '6-12%', maxLoss: 5 }
            ]
        },
        {
            id: 'BITCOIN_DEFI',
            name: 'Bitcoin DeFi',
            icon: '₿',
            description: 'Native Bitcoin DeFi yields',
            riskLevel: 'Medium',
            expectedApy: '8-18%',
            capitalProtection: '80%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Stacks STX', percent: 40, color: '#5546ff', apy: '6-12%', maxLoss: 30 },
                { product: 'RSK DeFi', percent: 30, color: '#00b520', apy: '8-15%', maxLoss: 25 },
                { product: 'Lightning Yield', percent: 30, color: '#f7931a', apy: '10-20%', maxLoss: 20 }
            ]
        },
        {
            id: 'AI_INFRASTRUCTURE',
            name: 'AI Infrastructure',
            icon: '🧠',
            description: 'Decentralized AI compute and data',
            riskLevel: 'High',
            expectedApy: '30-60%',
            capitalProtection: '55%',
            minInvestment: 300,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Render (RNDR)', percent: 30, color: '#e91e63', apy: '25-50%', maxLoss: 45 },
                { product: 'Akash (AKT)', percent: 25, color: '#ff5722', apy: '30-55%', maxLoss: 50 },
                { product: 'Fetch.ai (FET)', percent: 25, color: '#2196f3', apy: '35-65%', maxLoss: 55 },
                { product: 'Ocean (OCEAN)', percent: 20, color: '#00bcd4', apy: '25-45%', maxLoss: 40 }
            ]
        },
        {
            id: 'DEPIN_NETWORKS',
            name: 'DePIN Networks',
            icon: '📡',
            description: 'Decentralized Physical Infrastructure',
            riskLevel: 'High',
            expectedApy: '25-50%',
            capitalProtection: '60%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Helium (HNT)', percent: 30, color: '#474dff', apy: '20-40%', maxLoss: 45 },
                { product: 'Filecoin (FIL)', percent: 30, color: '#0090ff', apy: '15-35%', maxLoss: 40 },
                { product: 'Hivemapper (HONEY)', percent: 20, color: '#ffc107', apy: '30-55%', maxLoss: 55 },
                { product: 'IoTeX (IOTX)', percent: 20, color: '#00d4aa', apy: '25-45%', maxLoss: 45 }
            ]
        },
        {
            id: 'PERPETUAL_HEDGE',
            name: 'Perpetual Hedge',
            icon: '🔒',
            description: 'Hedged exposure with perp funding',
            riskLevel: 'Low',
            expectedApy: '10-18%',
            capitalProtection: '92%',
            minInvestment: 1000,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Long Spot BTC', percent: 40, color: '#f7931a', apy: '8-15%', maxLoss: 8 },
                { product: 'Short Perp BTC', percent: 40, color: '#ff6464', apy: '10-20%', maxLoss: 5 },
                { product: 'USDC Reserve', percent: 20, color: '#2775ca', apy: '5-8%', maxLoss: 1 }
            ]
        },
        {
            id: 'WORLD_INDEX',
            name: 'World Crypto Index',
            icon: '🌍',
            description: 'Top 20 cryptos by market cap',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BTC', percent: 40, color: '#f7931a', apy: '8-20%', maxLoss: 30 },
                { product: 'ETH', percent: 25, color: '#627eea', apy: '10-25%', maxLoss: 35 },
                { product: 'Top Alts (10)', percent: 25, color: '#a855f7', apy: '20-45%', maxLoss: 45 },
                { product: 'Stables', percent: 10, color: '#00d4aa', apy: '5-10%', maxLoss: 2 }
            ]
        },
        // ═══════════════════════════════════════════════════════════════
        // MEGA EXPANSION - 30+ Additional Combos
        // ═══════════════════════════════════════════════════════════════
        {
            id: 'SUI_ECOSYSTEM',
            name: 'SUI Ecosystem',
            icon: '💧',
            description: 'SUI blockchain DeFi strategies',
            riskLevel: 'High',
            expectedApy: '25-45%',
            capitalProtection: '60%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'SUI Staking', percent: 40, color: '#6fbcf0', apy: '15-25%', maxLoss: 40 },
                { product: 'Cetus DEX LP', percent: 35, color: '#00d4aa', apy: '30-50%', maxLoss: 50 },
                { product: 'Scallop Lending', percent: 25, color: '#627eea', apy: '20-35%', maxLoss: 35 }
            ]
        },
        {
            id: 'APTOS_MOVE',
            name: 'Aptos Move',
            icon: '🍎',
            description: 'APT ecosystem with Move-based DeFi',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '70%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'APT Staking', percent: 45, color: '#00d4aa', apy: '7-10%', maxLoss: 35 },
                { product: 'Liquidswap LP', percent: 30, color: '#a855f7', apy: '20-40%', maxLoss: 45 },
                { product: 'Aries Markets', percent: 25, color: '#f59e0b', apy: '15-30%', maxLoss: 35 }
            ]
        },
        {
            id: 'TON_TELEGRAM',
            name: 'TON Telegram',
            icon: '✈️',
            description: 'TON blockchain with Telegram integrations',
            riskLevel: 'High',
            expectedApy: '20-40%',
            capitalProtection: '60%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'TON Staking', percent: 50, color: '#0088cc', apy: '10-18%', maxLoss: 40 },
                { product: 'STON.fi LP', percent: 30, color: '#00d4aa', apy: '25-45%', maxLoss: 50 },
                { product: 'DeDust Yield', percent: 20, color: '#ff6b6b', apy: '30-55%', maxLoss: 55 }
            ]
        },
        {
            id: 'NEAR_PROTOCOL',
            name: 'NEAR Protocol',
            icon: '🟢',
            description: 'NEAR ecosystem with sharding benefits',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'NEAR Staking', percent: 50, color: '#00ec97', apy: '8-12%', maxLoss: 30 },
                { product: 'Ref Finance LP', percent: 30, color: '#00d4aa', apy: '15-30%', maxLoss: 35 },
                { product: 'Burrow Lending', percent: 20, color: '#f59e0b', apy: '12-25%', maxLoss: 30 }
            ]
        },
        {
            id: 'FANTOM_SONIC',
            name: 'Fantom Sonic',
            icon: '👻',
            description: 'FTM and Sonic chain yields',
            riskLevel: 'High',
            expectedApy: '20-40%',
            capitalProtection: '60%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'FTM Staking', percent: 40, color: '#1969ff', apy: '10-18%', maxLoss: 40 },
                { product: 'SpookySwap LP', percent: 35, color: '#00d4aa', apy: '25-45%', maxLoss: 50 },
                { product: 'Beethoven X', percent: 25, color: '#ff6b6b', apy: '20-35%', maxLoss: 40 }
            ]
        },
        {
            id: 'INJECTIVE_PERP',
            name: 'Injective Perp',
            icon: '💉',
            description: 'INJ derivatives and DeFi ecosystem',
            riskLevel: 'High',
            expectedApy: '25-50%',
            capitalProtection: '55%',
            minInvestment: 200,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'INJ Staking', percent: 40, color: '#00f2fe', apy: '15-25%', maxLoss: 45 },
                { product: 'Helix Perps', percent: 35, color: '#a855f7', apy: '30-55%', maxLoss: 55 },
                { product: 'Astroport LP', percent: 25, color: '#f59e0b', apy: '25-45%', maxLoss: 50 }
            ]
        },
        {
            id: 'SEI_SPEED',
            name: 'SEI Speed',
            icon: '⚡',
            description: 'SEI network ultra-fast DeFi',
            riskLevel: 'High',
            expectedApy: '30-55%',
            capitalProtection: '55%',
            minInvestment: 100,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'SEI Staking', percent: 45, color: '#9e1f63', apy: '12-20%', maxLoss: 45 },
                { product: 'Astroport SEI', percent: 30, color: '#00d4aa', apy: '35-60%', maxLoss: 60 },
                { product: 'DragonSwap', percent: 25, color: '#ff6b6b', apy: '40-70%', maxLoss: 65 }
            ]
        },
        {
            id: 'CELESTIA_MODULAR',
            name: 'Celestia Modular',
            icon: '🌌',
            description: 'TIA modular blockchain exposure',
            riskLevel: 'High',
            expectedApy: '20-40%',
            capitalProtection: '60%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'TIA Staking', percent: 60, color: '#7b2bf9', apy: '12-20%', maxLoss: 45 },
                { product: 'Rollup Yields', percent: 25, color: '#00d4aa', apy: '25-50%', maxLoss: 50 },
                { product: 'DA Layer Rewards', percent: 15, color: '#f59e0b', apy: '30-60%', maxLoss: 55 }
            ]
        },
        {
            id: 'MANTLE_L2',
            name: 'Mantle L2',
            icon: '🏔️',
            description: 'Mantle L2 DeFi ecosystem',
            riskLevel: 'Medium',
            expectedApy: '18-35%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'MNT Staking', percent: 40, color: '#65b3ae', apy: '10-18%', maxLoss: 35 },
                { product: 'Agni Finance', percent: 35, color: '#ff6b6b', apy: '25-45%', maxLoss: 45 },
                { product: 'Lendle Lending', percent: 25, color: '#00d4aa', apy: '15-30%', maxLoss: 30 }
            ]
        },
        {
            id: 'LINEA_ZK',
            name: 'Linea ZK',
            icon: '📐',
            description: 'Linea zkEVM from ConsenSys',
            riskLevel: 'Medium',
            expectedApy: '15-35%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH on Linea', percent: 40, color: '#61dfff', apy: '8-15%', maxLoss: 30 },
                { product: 'Velocore LP', percent: 35, color: '#00d4aa', apy: '20-40%', maxLoss: 40 },
                { product: 'Mendi Finance', percent: 25, color: '#f59e0b', apy: '18-35%', maxLoss: 35 }
            ]
        },
        {
            id: 'METIS_L2',
            name: 'Metis L2',
            icon: '🟩',
            description: 'Metis Andromeda DeFi plays',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'METIS Staking', percent: 45, color: '#00dacc', apy: '10-18%', maxLoss: 35 },
                { product: 'Hercules DEX', percent: 30, color: '#ff6b6b', apy: '20-40%', maxLoss: 45 },
                { product: 'AAVE on Metis', percent: 25, color: '#b6509e', apy: '12-25%', maxLoss: 25 }
            ]
        },
        {
            id: 'BITTENSOR_AI',
            name: 'Bittensor AI',
            icon: '🤖',
            description: 'TAO decentralized AI network',
            riskLevel: 'Very High',
            expectedApy: '40-100%',
            capitalProtection: '40%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'TAO Staking', percent: 60, color: '#000000', apy: '20-50%', maxLoss: 60 },
                { product: 'Subnet Mining', percent: 25, color: '#00ff88', apy: '50-120%', maxLoss: 70 },
                { product: 'AI Compute', percent: 15, color: '#ff6b6b', apy: '60-150%', maxLoss: 80 }
            ]
        },
        {
            id: 'WORLDCOIN_ID',
            name: 'Worldcoin ID',
            icon: '🌐',
            description: 'WLD proof of personhood ecosystem',
            riskLevel: 'High',
            expectedApy: '25-50%',
            capitalProtection: '55%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'WLD Holding', percent: 50, color: '#000000', apy: '15-35%', maxLoss: 50 },
                { product: 'World App Yield', percent: 30, color: '#00d4aa', apy: '30-55%', maxLoss: 55 },
                { product: 'ID Verification', percent: 20, color: '#f59e0b', apy: '35-70%', maxLoss: 60 }
            ]
        },
        {
            id: 'RONIN_GAMING',
            name: 'Ronin Gaming',
            icon: '🎮',
            description: 'Axie Infinity and Ronin chain',
            riskLevel: 'High',
            expectedApy: '20-45%',
            capitalProtection: '55%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'RON Staking', percent: 40, color: '#1273ea', apy: '15-25%', maxLoss: 45 },
                { product: 'Katana DEX LP', percent: 35, color: '#00d4aa', apy: '25-50%', maxLoss: 55 },
                { product: 'Gaming NFTs', percent: 25, color: '#ff6b6b', apy: '20-45%', maxLoss: 50 }
            ]
        },
        {
            id: 'IMMUTABLE_X',
            name: 'Immutable X',
            icon: '🎯',
            description: 'IMX NFT and gaming L2',
            riskLevel: 'High',
            expectedApy: '20-40%',
            capitalProtection: '60%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'IMX Staking', percent: 50, color: '#00c9ff', apy: '12-22%', maxLoss: 45 },
                { product: 'Gaming Yields', percent: 30, color: '#ff6b6b', apy: '25-50%', maxLoss: 55 },
                { product: 'NFT Marketplace', percent: 20, color: '#f59e0b', apy: '30-60%', maxLoss: 50 }
            ]
        },
        {
            id: 'STARKNET_CAIRO',
            name: 'Starknet Cairo',
            icon: '🔶',
            description: 'STRK zkSTARK technology',
            riskLevel: 'High',
            expectedApy: '25-50%',
            capitalProtection: '55%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'STRK Staking', percent: 45, color: '#ec796b', apy: '15-30%', maxLoss: 50 },
                { product: 'JediSwap LP', percent: 30, color: '#00d4aa', apy: '30-55%', maxLoss: 55 },
                { product: 'mySwap Yield', percent: 25, color: '#627eea', apy: '25-45%', maxLoss: 50 }
            ]
        },
        {
            id: 'ONDO_RWA',
            name: 'Ondo RWA',
            icon: '🏢',
            description: 'Ondo real-world asset tokenization',
            riskLevel: 'Low',
            expectedApy: '5-9%',
            capitalProtection: '98%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDY Yield', percent: 50, color: '#2563eb', apy: '5-6%', maxLoss: 1 },
                { product: 'OUSG Treasury', percent: 35, color: '#00d4aa', apy: '5-7%', maxLoss: 1 },
                { product: 'ONDO Staking', percent: 15, color: '#f59e0b', apy: '8-15%', maxLoss: 20 }
            ]
        },
        {
            id: 'PENDLE_YIELD',
            name: 'Pendle Yield',
            icon: '📈',
            description: 'Yield trading and tokenization',
            riskLevel: 'Medium',
            expectedApy: '15-35%',
            capitalProtection: '70%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'PT (Principal)', percent: 40, color: '#00d4aa', apy: '8-18%', maxLoss: 20 },
                { product: 'YT (Yield)', percent: 35, color: '#ff6b6b', apy: '25-60%', maxLoss: 50 },
                { product: 'PENDLE Staking', percent: 25, color: '#627eea', apy: '15-30%', maxLoss: 35 }
            ]
        },
        {
            id: 'FRAX_ECOSYSTEM',
            name: 'Frax Ecosystem',
            icon: '🌀',
            description: 'FRAX stablecoin and liquid staking',
            riskLevel: 'Low',
            expectedApy: '8-15%',
            capitalProtection: '90%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'sfrxETH', percent: 40, color: '#00d4aa', apy: '5-10%', maxLoss: 10 },
                { product: 'FRAX/USDC LP', percent: 35, color: '#627eea', apy: '8-15%', maxLoss: 8 },
                { product: 'FXS Staking', percent: 25, color: '#f59e0b', apy: '12-25%', maxLoss: 25 }
            ]
        },
        {
            id: 'LIDO_ROCKET',
            name: 'Lido & Rocket Pool',
            icon: '🚀',
            description: 'Top liquid staking protocols',
            riskLevel: 'Low',
            expectedApy: '4-8%',
            capitalProtection: '95%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'stETH (Lido)', percent: 50, color: '#00a3ff', apy: '4-5%', maxLoss: 5 },
                { product: 'rETH (Rocket)', percent: 35, color: '#ff6b6b', apy: '4-5.5%', maxLoss: 5 },
                { product: 'LDO/RPL Stake', percent: 15, color: '#f59e0b', apy: '8-15%', maxLoss: 25 }
            ]
        },
        {
            id: 'BLUR_NFT',
            name: 'Blur NFT',
            icon: '🎨',
            description: 'NFT marketplace yield strategies',
            riskLevel: 'High',
            expectedApy: '20-50%',
            capitalProtection: '50%',
            minInvestment: 200,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'BLUR Staking', percent: 40, color: '#ff6b00', apy: '15-35%', maxLoss: 50 },
                { product: 'Blur Pool', percent: 35, color: '#00d4aa', apy: '20-50%', maxLoss: 55 },
                { product: 'NFT Lending', percent: 25, color: '#627eea', apy: '25-60%', maxLoss: 60 }
            ]
        },
        {
            id: 'MORPHO_LENDING',
            name: 'Morpho Lending',
            icon: '🦋',
            description: 'Optimized lending protocol',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '92%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Morpho USDC', percent: 50, color: '#00d4aa', apy: '5-10%', maxLoss: 5 },
                { product: 'Morpho ETH', percent: 35, color: '#627eea', apy: '6-12%', maxLoss: 8 },
                { product: 'MORPHO Token', percent: 15, color: '#f59e0b', apy: '10-20%', maxLoss: 25 }
            ]
        },
        {
            id: 'RADIANT_OMNICHAIN',
            name: 'Radiant Omnichain',
            icon: '✨',
            description: 'Cross-chain lending protocol',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '75%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'RDNT Staking', percent: 40, color: '#00d4ff', apy: '15-30%', maxLoss: 35 },
                { product: 'dLP Yield', percent: 35, color: '#00d4aa', apy: '10-20%', maxLoss: 25 },
                { product: 'Lending', percent: 25, color: '#f59e0b', apy: '8-18%', maxLoss: 20 }
            ]
        },
        {
            id: 'VELODROME_AERO',
            name: 'Velo & Aero',
            icon: '🚴',
            description: 'Optimism & Base ve(3,3) DEXs',
            riskLevel: 'Medium',
            expectedApy: '20-40%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'VELO Staking', percent: 40, color: '#ff0000', apy: '20-35%', maxLoss: 35 },
                { product: 'AERO Staking', percent: 35, color: '#0052ff', apy: '25-45%', maxLoss: 40 },
                { product: 'LP Bribes', percent: 25, color: '#00d4aa', apy: '15-35%', maxLoss: 30 }
            ]
        },
        {
            id: 'CAMELOT_EXCAL',
            name: 'Camelot Round Table',
            icon: '⚔️',
            description: 'Arbitrum native DEX ecosystem',
            riskLevel: 'Medium',
            expectedApy: '18-35%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'GRAIL Staking', percent: 40, color: '#a855f7', apy: '20-40%', maxLoss: 40 },
                { product: 'xGRAIL Yield', percent: 35, color: '#00d4aa', apy: '15-30%', maxLoss: 30 },
                { product: 'spNFT LP', percent: 25, color: '#f59e0b', apy: '20-35%', maxLoss: 35 }
            ]
        },
        {
            id: 'TRADER_JOE_LB',
            name: 'Trader Joe LB',
            icon: '🔴',
            description: 'Liquidity Book concentrated LP',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'JOE Staking', percent: 35, color: '#ff0000', apy: '12-22%', maxLoss: 35 },
                { product: 'Auto-Pools', percent: 40, color: '#00d4aa', apy: '18-35%', maxLoss: 35 },
                { product: 'LB Strategy', percent: 25, color: '#627eea', apy: '15-30%', maxLoss: 30 }
            ]
        },
        {
            id: 'HYPERLIQUID_PERP',
            name: 'Hyperliquid Perp',
            icon: '💹',
            description: 'On-chain perpetual DEX',
            riskLevel: 'High',
            expectedApy: '25-50%',
            capitalProtection: '60%',
            minInvestment: 500,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'HLP Vault', percent: 50, color: '#00ff88', apy: '20-40%', maxLoss: 40 },
                { product: 'Perp Trading', percent: 30, color: '#ff6b6b', apy: '30-60%', maxLoss: 55 },
                { product: 'USDC Yield', percent: 20, color: '#2775ca', apy: '15-25%', maxLoss: 15 }
            ]
        },
        {
            id: 'DYDX_V4',
            name: 'dYdX v4',
            icon: '📊',
            description: 'Cosmos-based perp DEX',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '70%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'DYDX Staking', percent: 50, color: '#6966ff', apy: '10-20%', maxLoss: 35 },
                { product: 'Trading Rewards', percent: 30, color: '#00d4aa', apy: '20-40%', maxLoss: 40 },
                { product: 'Validator', percent: 20, color: '#f59e0b', apy: '15-30%', maxLoss: 30 }
            ]
        },
        {
            id: 'SYNTHETIX_V3',
            name: 'Synthetix v3',
            icon: '🔮',
            description: 'Synthetic assets and perps',
            riskLevel: 'High',
            expectedApy: '20-45%',
            capitalProtection: '60%',
            minInvestment: 300,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'SNX Staking', percent: 45, color: '#00d4ff', apy: '15-30%', maxLoss: 45 },
                { product: 'Perps LP', percent: 35, color: '#ff6b6b', apy: '25-50%', maxLoss: 50 },
                { product: 'Synth Trading', percent: 20, color: '#00d4aa', apy: '20-40%', maxLoss: 40 }
            ]
        },
        // ═══════════════════════════════════════════════════════════════
        // EXPANSION PACK 3 - 50 More Combos
        // ═══════════════════════════════════════════════════════════════
        {
            id: 'ARBITRUM_NATIVE',
            name: 'Arbitrum Native',
            icon: '🔷',
            description: 'ARB ecosystem deep dive',
            riskLevel: 'Medium',
            expectedApy: '18-35%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ARB Staking', percent: 35, color: '#28a0f0', apy: '10-18%', maxLoss: 35 },
                { product: 'GMX/Camelot', percent: 35, color: '#2d42fc', apy: '25-45%', maxLoss: 45 },
                { product: 'Radiant/Pendle', percent: 30, color: '#00d4aa', apy: '15-30%', maxLoss: 35 }
            ]
        },
        {
            id: 'OPTIMISM_SUPER',
            name: 'Optimism Superchain',
            icon: '🔴',
            description: 'OP Stack ecosystem plays',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'OP Staking', percent: 40, color: '#ff0420', apy: '8-15%', maxLoss: 35 },
                { product: 'Velodrome', percent: 35, color: '#00d4aa', apy: '20-40%', maxLoss: 40 },
                { product: 'Synthetix OP', percent: 25, color: '#00d4ff', apy: '18-35%', maxLoss: 40 }
            ]
        },
        {
            id: 'POLYGON_MATIC',
            name: 'Polygon MATIC',
            icon: '💜',
            description: 'POL ecosystem and zkEVM',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '75%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'MATIC Staking', percent: 45, color: '#8247e5', apy: '5-10%', maxLoss: 30 },
                { product: 'QuickSwap LP', percent: 30, color: '#00d4aa', apy: '15-30%', maxLoss: 35 },
                { product: 'Aavegotchi', percent: 25, color: '#ff6b9d', apy: '20-40%', maxLoss: 45 }
            ]
        },
        {
            id: 'AVAX_SUBNETS',
            name: 'AVAX Subnets',
            icon: '❄️',
            description: 'Avalanche subnets and DeFi',
            riskLevel: 'High',
            expectedApy: '20-40%',
            capitalProtection: '65%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'AVAX Liquid Stake', percent: 40, color: '#e84142', apy: '8-12%', maxLoss: 35 },
                { product: 'DeFi Kingdoms', percent: 30, color: '#00d4aa', apy: '25-50%', maxLoss: 55 },
                { product: 'GMX AVAX', percent: 30, color: '#2d42fc', apy: '20-40%', maxLoss: 45 }
            ]
        },
        {
            id: 'BSC_BINANCE',
            name: 'BSC Binance',
            icon: '💛',
            description: 'BNB Chain ecosystem',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BNB Staking', percent: 40, color: '#f3ba2f', apy: '5-10%', maxLoss: 30 },
                { product: 'PancakeSwap', percent: 35, color: '#00d4aa', apy: '20-40%', maxLoss: 40 },
                { product: 'Venus Protocol', percent: 25, color: '#627eea', apy: '12-25%', maxLoss: 30 }
            ]
        },
        {
            id: 'TRON_TRX',
            name: 'TRON TRX',
            icon: '🔺',
            description: 'TRX staking and USDD',
            riskLevel: 'Medium',
            expectedApy: '10-20%',
            capitalProtection: '75%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'TRX Staking', percent: 50, color: '#ff0013', apy: '5-8%', maxLoss: 30 },
                { product: 'SunSwap LP', percent: 30, color: '#00d4aa', apy: '15-30%', maxLoss: 35 },
                { product: 'JustLend', percent: 20, color: '#627eea', apy: '10-20%', maxLoss: 25 }
            ]
        },
        {
            id: 'CRONOS_CRO',
            name: 'Cronos CRO',
            icon: '🦁',
            description: 'Crypto.com ecosystem',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'CRO Staking', percent: 50, color: '#002d74', apy: '8-12%', maxLoss: 35 },
                { product: 'VVS Finance', percent: 30, color: '#00d4aa', apy: '15-30%', maxLoss: 40 },
                { product: 'Tectonic', percent: 20, color: '#627eea', apy: '12-25%', maxLoss: 35 }
            ]
        },
        {
            id: 'KASPA_KAS',
            name: 'Kaspa KAS',
            icon: '💎',
            description: 'BlockDAG technology',
            riskLevel: 'Very High',
            expectedApy: '30-80%',
            capitalProtection: '40%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'KAS Holding', percent: 70, color: '#49eacb', apy: '25-70%', maxLoss: 60 },
                { product: 'Mining Rewards', percent: 30, color: '#00d4aa', apy: '40-100%', maxLoss: 70 }
            ]
        },
        {
            id: 'XRP_LEDGER',
            name: 'XRP Ledger',
            icon: '💧',
            description: 'Ripple ecosystem',
            riskLevel: 'Medium',
            expectedApy: '8-18%',
            capitalProtection: '75%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'XRP AMM', percent: 50, color: '#23292f', apy: '5-12%', maxLoss: 30 },
                { product: 'XRPL DEX', percent: 30, color: '#00d4aa', apy: '10-20%', maxLoss: 35 },
                { product: 'Escrow Yield', percent: 20, color: '#627eea', apy: '8-15%', maxLoss: 25 }
            ]
        },
        {
            id: 'ALGORAND_ALGO',
            name: 'Algorand ALGO',
            icon: '⬛',
            description: 'Pure proof of stake',
            riskLevel: 'Medium',
            expectedApy: '8-18%',
            capitalProtection: '80%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'ALGO Governance', percent: 50, color: '#000000', apy: '5-10%', maxLoss: 30 },
                { product: 'Folks Finance', percent: 30, color: '#00d4aa', apy: '10-20%', maxLoss: 35 },
                { product: 'Tinyman LP', percent: 20, color: '#627eea', apy: '12-25%', maxLoss: 40 }
            ]
        },
        {
            id: 'HEDERA_HBAR',
            name: 'Hedera HBAR',
            icon: '♦️',
            description: 'Enterprise hashgraph',
            riskLevel: 'Low',
            expectedApy: '6-12%',
            capitalProtection: '85%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'HBAR Staking', percent: 60, color: '#000000', apy: '5-8%', maxLoss: 25 },
                { product: 'SaucerSwap', percent: 25, color: '#00d4aa', apy: '8-15%', maxLoss: 30 },
                { product: 'Hashport', percent: 15, color: '#627eea', apy: '10-18%', maxLoss: 30 }
            ]
        },
        {
            id: 'MULTIVERSX_EGLD',
            name: 'MultiversX EGLD',
            icon: '🌐',
            description: 'Sharded smart contracts',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '75%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'EGLD Staking', percent: 50, color: '#23f7dd', apy: '8-12%', maxLoss: 35 },
                { product: 'xExchange LP', percent: 30, color: '#00d4aa', apy: '15-30%', maxLoss: 40 },
                { product: 'Hatom Lending', percent: 20, color: '#627eea', apy: '12-25%', maxLoss: 35 }
            ]
        },
        {
            id: 'VET_VECHAIN',
            name: 'VeChain VET',
            icon: '✅',
            description: 'Enterprise blockchain',
            riskLevel: 'Medium',
            expectedApy: '8-18%',
            capitalProtection: '75%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'VET Staking', percent: 60, color: '#15bdff', apy: '5-10%', maxLoss: 30 },
                { product: 'VeThor Gen', percent: 25, color: '#00d4aa', apy: '10-20%', maxLoss: 35 },
                { product: 'VeUSD Yield', percent: 15, color: '#627eea', apy: '12-25%', maxLoss: 30 }
            ]
        },
        {
            id: 'ICP_INTERNET',
            name: 'Internet Computer',
            icon: '🌍',
            description: 'World computer protocol',
            riskLevel: 'High',
            expectedApy: '15-35%',
            capitalProtection: '60%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ICP Neurons', percent: 50, color: '#29abe2', apy: '10-20%', maxLoss: 45 },
                { product: 'ICPSwap', percent: 30, color: '#00d4aa', apy: '20-40%', maxLoss: 50 },
                { product: 'SNS DAOs', percent: 20, color: '#ff6b6b', apy: '15-35%', maxLoss: 45 }
            ]
        },
        {
            id: 'FIL_STORAGE',
            name: 'Filecoin Storage',
            icon: '📁',
            description: 'Decentralized storage',
            riskLevel: 'High',
            expectedApy: '15-35%',
            capitalProtection: '60%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'FIL Staking', percent: 50, color: '#0090ff', apy: '10-20%', maxLoss: 45 },
                { product: 'Storage Mining', percent: 30, color: '#00d4aa', apy: '20-45%', maxLoss: 55 },
                { product: 'GLIF Liquid', percent: 20, color: '#627eea', apy: '15-30%', maxLoss: 40 }
            ]
        },
        {
            id: 'AR_ARWEAVE',
            name: 'Arweave AR',
            icon: '📚',
            description: 'Permanent storage',
            riskLevel: 'High',
            expectedApy: '20-45%',
            capitalProtection: '55%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'AR Holding', percent: 60, color: '#222326', apy: '15-35%', maxLoss: 50 },
                { product: 'AO Compute', percent: 25, color: '#00d4aa', apy: '25-55%', maxLoss: 60 },
                { product: 'Permaswap', percent: 15, color: '#627eea', apy: '20-40%', maxLoss: 50 }
            ]
        },
        {
            id: 'GRT_GRAPH',
            name: 'The Graph GRT',
            icon: '📊',
            description: 'Web3 indexing protocol',
            riskLevel: 'Medium',
            expectedApy: '12-25%',
            capitalProtection: '70%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'GRT Delegation', percent: 60, color: '#6747ed', apy: '8-15%', maxLoss: 35 },
                { product: 'Indexer Rewards', percent: 25, color: '#00d4aa', apy: '15-30%', maxLoss: 40 },
                { product: 'Curation', percent: 15, color: '#627eea', apy: '18-40%', maxLoss: 45 }
            ]
        },
        {
            id: 'LINK_ORACLE',
            name: 'Chainlink LINK',
            icon: '🔗',
            description: 'Oracle network',
            riskLevel: 'Medium',
            expectedApy: '10-20%',
            capitalProtection: '75%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'LINK Staking', percent: 60, color: '#375bd2', apy: '5-12%', maxLoss: 30 },
                { product: 'Node Operations', percent: 25, color: '#00d4aa', apy: '15-30%', maxLoss: 40 },
                { product: 'BUILD Program', percent: 15, color: '#627eea', apy: '12-25%', maxLoss: 35 }
            ]
        },
        {
            id: 'AAVE_LENDING',
            name: 'AAVE Lending Pro',
            icon: '👻',
            description: 'Multi-chain lending',
            riskLevel: 'Low',
            expectedApy: '6-15%',
            capitalProtection: '90%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'AAVE Safety', percent: 40, color: '#b6509e', apy: '5-12%', maxLoss: 15 },
                { product: 'GHO Yield', percent: 35, color: '#00d4aa', apy: '6-15%', maxLoss: 10 },
                { product: 'E-Mode Lending', percent: 25, color: '#627eea', apy: '8-18%', maxLoss: 12 }
            ]
        },
        {
            id: 'UNI_CONCENTRATED',
            name: 'Uniswap Concentrated',
            icon: '🦄',
            description: 'Concentrated liquidity',
            riskLevel: 'Medium',
            expectedApy: '15-40%',
            capitalProtection: '70%',
            minInvestment: 200,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'UNI v3 ETH/USDC', percent: 40, color: '#ff007a', apy: '10-25%', maxLoss: 30 },
                { product: 'UNI v3 BTC/ETH', percent: 35, color: '#f7931a', apy: '15-35%', maxLoss: 40 },
                { product: 'Arrakis Vault', percent: 25, color: '#00d4aa', apy: '20-50%', maxLoss: 45 }
            ]
        },
        {
            id: 'CURVE_STABLE',
            name: 'Curve Stable',
            icon: '🌊',
            description: 'Stablecoin specialist',
            riskLevel: 'Low',
            expectedApy: '8-18%',
            capitalProtection: '92%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: '3pool (USDC/USDT/DAI)', percent: 40, color: '#0033ad', apy: '5-10%', maxLoss: 3 },
                { product: 'frxETH/ETH', percent: 30, color: '#00d4aa', apy: '8-15%', maxLoss: 8 },
                { product: 'veCRV Boost', percent: 30, color: '#f59e0b', apy: '12-25%', maxLoss: 20 }
            ]
        },
        {
            id: 'CONVEX_BOOST',
            name: 'Convex Boost',
            icon: '🚀',
            description: 'Boosted Curve yields',
            riskLevel: 'Low',
            expectedApy: '10-22%',
            capitalProtection: '88%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'cvxCRV Staking', percent: 40, color: '#3a3a3a', apy: '8-15%', maxLoss: 10 },
                { product: 'CVX Locking', percent: 35, color: '#00d4aa', apy: '12-22%', maxLoss: 15 },
                { product: 'Curve LP Boost', percent: 25, color: '#0033ad', apy: '10-20%', maxLoss: 12 }
            ]
        },
        {
            id: 'YEARN_VAULTS',
            name: 'Yearn Vaults',
            icon: '🏦',
            description: 'Automated yield strategies',
            riskLevel: 'Medium',
            expectedApy: '8-20%',
            capitalProtection: '80%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'yvUSDC', percent: 40, color: '#006ae3', apy: '5-12%', maxLoss: 8 },
                { product: 'yvETH', percent: 35, color: '#627eea', apy: '8-18%', maxLoss: 15 },
                { product: 'YFI Staking', percent: 25, color: '#00d4aa', apy: '12-25%', maxLoss: 25 }
            ]
        },
        {
            id: 'COMPOUND_V3',
            name: 'Compound v3',
            icon: '🏛️',
            description: 'Isolated lending markets',
            riskLevel: 'Low',
            expectedApy: '5-12%',
            capitalProtection: '92%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'USDC Market', percent: 50, color: '#00d395', apy: '4-8%', maxLoss: 3 },
                { product: 'ETH Market', percent: 35, color: '#627eea', apy: '5-12%', maxLoss: 8 },
                { product: 'COMP Rewards', percent: 15, color: '#f59e0b', apy: '8-18%', maxLoss: 20 }
            ]
        },
        {
            id: 'MAKER_DAI',
            name: 'MakerDAO DAI',
            icon: '🔷',
            description: 'DAI stablecoin ecosystem',
            riskLevel: 'Low',
            expectedApy: '5-12%',
            capitalProtection: '95%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'DSR (DAI Savings)', percent: 60, color: '#f5ac37', apy: '5-8%', maxLoss: 2 },
                { product: 'Spark Lend', percent: 25, color: '#00d4aa', apy: '5-12%', maxLoss: 5 },
                { product: 'MKR Staking', percent: 15, color: '#1aab9b', apy: '8-18%', maxLoss: 25 }
            ]
        },
        {
            id: 'SPARK_LEND',
            name: 'Spark Lend',
            icon: '⚡',
            description: 'MakerDAO lending arm',
            riskLevel: 'Low',
            expectedApy: '5-12%',
            capitalProtection: '92%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'sDAI Supply', percent: 50, color: '#f5ac37', apy: '5-8%', maxLoss: 2 },
                { product: 'ETH Borrow', percent: 30, color: '#627eea', apy: '6-12%', maxLoss: 8 },
                { product: 'spDAI Farming', percent: 20, color: '#00d4aa', apy: '8-15%', maxLoss: 10 }
            ]
        },
        {
            id: 'ETHENA_USDE',
            name: 'Ethena USDe',
            icon: '💵',
            description: 'Synthetic dollar protocol',
            riskLevel: 'Medium',
            expectedApy: '15-35%',
            capitalProtection: '75%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'sUSDe Staking', percent: 50, color: '#000000', apy: '15-30%', maxLoss: 20 },
                { product: 'ENA Farming', percent: 30, color: '#00d4aa', apy: '20-45%', maxLoss: 35 },
                { product: 'USDe LP', percent: 20, color: '#627eea', apy: '12-25%', maxLoss: 25 }
            ]
        },
        {
            id: 'RENZO_EZETH',
            name: 'Renzo ezETH',
            icon: '🟢',
            description: 'Liquid restaking token',
            riskLevel: 'Medium',
            expectedApy: '8-18%',
            capitalProtection: '80%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ezETH Holding', percent: 50, color: '#00ff88', apy: '6-12%', maxLoss: 20 },
                { product: 'ezPoints Farm', percent: 30, color: '#00d4aa', apy: '10-25%', maxLoss: 30 },
                { product: 'REZ Staking', percent: 20, color: '#627eea', apy: '12-22%', maxLoss: 35 }
            ]
        },
        {
            id: 'PUFFER_PUFETH',
            name: 'Puffer pufETH',
            icon: '🐡',
            description: 'Native liquid restaking',
            riskLevel: 'Medium',
            expectedApy: '8-20%',
            capitalProtection: '78%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'pufETH Holding', percent: 50, color: '#7c3aed', apy: '6-12%', maxLoss: 22 },
                { product: 'Puffer Points', percent: 30, color: '#00d4aa', apy: '12-28%', maxLoss: 32 },
                { product: 'UniFi AVS', percent: 20, color: '#627eea', apy: '10-20%', maxLoss: 28 }
            ]
        },
        {
            id: 'KELP_RSETH',
            name: 'Kelp rsETH',
            icon: '🌿',
            description: 'Multi-LST restaking',
            riskLevel: 'Medium',
            expectedApy: '10-22%',
            capitalProtection: '75%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'rsETH Holding', percent: 50, color: '#00d4aa', apy: '7-14%', maxLoss: 22 },
                { product: 'Kelp Miles', percent: 30, color: '#f59e0b', apy: '15-30%', maxLoss: 35 },
                { product: 'KELP Token', percent: 20, color: '#627eea', apy: '12-25%', maxLoss: 40 }
            ]
        },
        {
            id: 'ETHER_FI_WEETH',
            name: 'Ether.fi weETH',
            icon: '🌸',
            description: 'Decentralized restaking',
            riskLevel: 'Medium',
            expectedApy: '8-18%',
            capitalProtection: '80%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'weETH Holding', percent: 50, color: '#7c3aed', apy: '6-12%', maxLoss: 20 },
                { product: 'Loyalty Points', percent: 30, color: '#00d4aa', apy: '12-25%', maxLoss: 30 },
                { product: 'ETHFI Staking', percent: 20, color: '#627eea', apy: '10-20%', maxLoss: 35 }
            ]
        },
        {
            id: 'SWELL_SWETH',
            name: 'Swell swETH',
            icon: '🌊',
            description: 'Liquid staking + restaking',
            riskLevel: 'Medium',
            expectedApy: '8-20%',
            capitalProtection: '78%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'swETH/rswETH', percent: 50, color: '#00bfff', apy: '6-12%', maxLoss: 22 },
                { product: 'Swell Pearls', percent: 30, color: '#00d4aa', apy: '12-28%', maxLoss: 32 },
                { product: 'SWELL Token', percent: 20, color: '#627eea', apy: '10-22%', maxLoss: 35 }
            ]
        },
        {
            id: 'MANTLE_METH',
            name: 'Mantle mETH',
            icon: '🔵',
            description: 'Mantle liquid staking',
            riskLevel: 'Medium',
            expectedApy: '8-18%',
            capitalProtection: '80%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'mETH Holding', percent: 50, color: '#65b3ae', apy: '5-10%', maxLoss: 20 },
                { product: 'Mantle DeFi', percent: 30, color: '#00d4aa', apy: '12-25%', maxLoss: 30 },
                { product: 'MNT Rewards', percent: 20, color: '#627eea', apy: '10-20%', maxLoss: 30 }
            ]
        },
        {
            id: 'COINBASE_CBETH',
            name: 'Coinbase cbETH',
            icon: '🔷',
            description: 'Institutional liquid staking',
            riskLevel: 'Low',
            expectedApy: '4-8%',
            capitalProtection: '95%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'cbETH Holding', percent: 60, color: '#0052ff', apy: '4-5%', maxLoss: 5 },
                { product: 'cbETH/ETH LP', percent: 25, color: '#00d4aa', apy: '5-10%', maxLoss: 8 },
                { product: 'Base DeFi', percent: 15, color: '#627eea', apy: '6-12%', maxLoss: 15 }
            ]
        },
        {
            id: 'BINANCE_WBETH',
            name: 'Binance WBETH',
            icon: '💛',
            description: 'CEX liquid staking',
            riskLevel: 'Low',
            expectedApy: '4-8%',
            capitalProtection: '95%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'WBETH Holding', percent: 60, color: '#f3ba2f', apy: '4-5%', maxLoss: 5 },
                { product: 'WBETH/ETH LP', percent: 25, color: '#00d4aa', apy: '5-10%', maxLoss: 8 },
                { product: 'BSC DeFi', percent: 15, color: '#627eea', apy: '6-12%', maxLoss: 15 }
            ]
        },
        {
            id: 'STADER_ETHX',
            name: 'Stader ETHx',
            icon: '🌟',
            description: 'Multi-pool staking',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '92%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETHx Holding', percent: 55, color: '#00ea8e', apy: '4-6%', maxLoss: 6 },
                { product: 'SD Staking', percent: 25, color: '#00d4aa', apy: '8-15%', maxLoss: 20 },
                { product: 'ETHx LP', percent: 20, color: '#627eea', apy: '6-12%', maxLoss: 12 }
            ]
        },
        {
            id: 'ANKR_ANKRETH',
            name: 'Ankr ankrETH',
            icon: '⚓',
            description: 'Infrastructure liquid staking',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '90%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ankrETH Holding', percent: 55, color: '#2e6ddf', apy: '4-6%', maxLoss: 8 },
                { product: 'ANKR Staking', percent: 25, color: '#00d4aa', apy: '8-15%', maxLoss: 25 },
                { product: 'Multi-chain LP', percent: 20, color: '#627eea', apy: '6-12%', maxLoss: 15 }
            ]
        },
        {
            id: 'STAKEWISE_OSETH',
            name: 'StakeWise osETH',
            icon: '🦉',
            description: 'Overcollateralized LST',
            riskLevel: 'Low',
            expectedApy: '5-10%',
            capitalProtection: '92%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'osETH Holding', percent: 55, color: '#5566ff', apy: '4-6%', maxLoss: 6 },
                { product: 'SWISE Staking', percent: 25, color: '#00d4aa', apy: '8-15%', maxLoss: 22 },
                { product: 'osETH LP', percent: 20, color: '#627eea', apy: '6-12%', maxLoss: 12 }
            ]
        },
        {
            id: 'ORIGIN_OETH',
            name: 'Origin OETH',
            icon: '🔵',
            description: 'Yield-bearing ETH',
            riskLevel: 'Medium',
            expectedApy: '6-15%',
            capitalProtection: '85%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'OETH Holding', percent: 55, color: '#0074f0', apy: '5-10%', maxLoss: 12 },
                { product: 'OETH/ETH LP', percent: 25, color: '#00d4aa', apy: '8-18%', maxLoss: 18 },
                { product: 'OGN Staking', percent: 20, color: '#627eea', apy: '10-20%', maxLoss: 30 }
            ]
        },
        {
            id: 'DINERO_PXETH',
            name: 'Dinero pxETH',
            icon: '💰',
            description: 'Points-optimized LST',
            riskLevel: 'Medium',
            expectedApy: '8-20%',
            capitalProtection: '78%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'pxETH Holding', percent: 50, color: '#ff6600', apy: '6-12%', maxLoss: 20 },
                { product: 'apxETH Staking', percent: 30, color: '#00d4aa', apy: '10-25%', maxLoss: 28 },
                { product: 'Dinero Points', percent: 20, color: '#627eea', apy: '12-30%', maxLoss: 35 }
            ]
        },
        {
            id: 'BEDROCK_UNIETH',
            name: 'Bedrock uniETH',
            icon: '🪨',
            description: 'Universal liquid restaking',
            riskLevel: 'Medium',
            expectedApy: '8-18%',
            capitalProtection: '78%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'uniETH Holding', percent: 50, color: '#00d4aa', apy: '6-12%', maxLoss: 20 },
                { product: 'Bedrock Points', percent: 30, color: '#f59e0b', apy: '12-25%', maxLoss: 30 },
                { product: 'BR Token', percent: 20, color: '#627eea', apy: '10-22%', maxLoss: 35 }
            ]
        },
        {
            id: 'LOMBARD_LBTC',
            name: 'Lombard LBTC',
            icon: '🟠',
            description: 'Bitcoin liquid staking',
            riskLevel: 'Medium',
            expectedApy: '5-15%',
            capitalProtection: '80%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'LBTC Holding', percent: 55, color: '#f7931a', apy: '4-10%', maxLoss: 20 },
                { product: 'Babylon Points', percent: 25, color: '#00d4aa', apy: '8-20%', maxLoss: 25 },
                { product: 'LBTC DeFi', percent: 20, color: '#627eea', apy: '6-15%', maxLoss: 25 }
            ]
        },
        {
            id: 'SOLV_SOLVBTC',
            name: 'Solv SolvBTC',
            icon: '🔶',
            description: 'Omnichain BTC yield',
            riskLevel: 'Medium',
            expectedApy: '6-18%',
            capitalProtection: '78%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'SolvBTC Holding', percent: 55, color: '#f7931a', apy: '5-12%', maxLoss: 22 },
                { product: 'Solv Points', percent: 25, color: '#00d4aa', apy: '10-25%', maxLoss: 28 },
                { product: 'Cross-chain Yield', percent: 20, color: '#627eea', apy: '8-18%', maxLoss: 25 }
            ]
        },
        {
            id: 'PUMP_BTCFI',
            name: 'Pump BTCFi',
            icon: '⬆️',
            description: 'Bitcoin DeFi aggregator',
            riskLevel: 'High',
            expectedApy: '15-40%',
            capitalProtection: '60%',
            minInvestment: 500,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'pumpBTC', percent: 45, color: '#f7931a', apy: '10-25%', maxLoss: 35 },
                { product: 'Babylon Stake', percent: 30, color: '#00d4aa', apy: '20-45%', maxLoss: 45 },
                { product: 'BTCFi Points', percent: 25, color: '#627eea', apy: '15-35%', maxLoss: 40 }
            ]
        },
        // ═══════════════════════════════════════════════════════════════
        // SAFE OPTIMIZATION COMBOS - Maximum returns with capital protection
        // ═══════════════════════════════════════════════════════════════
        {
            id: 'SMART_SAVER',
            name: 'Smart Saver',
            icon: '🏦',
            description: 'Épargne intelligente - rendements stables garantis avec capital protégé',
            riskLevel: 'Low',
            expectedApy: '6-10%',
            capitalProtection: '99%',
            minInvestment: 25,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'USDC Aave V3', percent: 40, color: '#2775ca', apy: '4-6%', maxLoss: 1 },
                { product: 'DAI Savings Rate', percent: 35, color: '#f5ac37', apy: '5-8%', maxLoss: 1 },
                { product: 'USDT Compound', percent: 25, color: '#26a17b', apy: '5-7%', maxLoss: 1 }
            ],
            features: ['Auto-compound quotidien', 'Retrait instantané', 'Audité 100%']
        },
        {
            id: 'YIELD_OPTIMIZER',
            name: 'Yield Optimizer',
            icon: '⚙️',
            description: 'Optimisation automatique des rendements avec rééquilibrage intelligent',
            riskLevel: 'Low',
            expectedApy: '8-14%',
            capitalProtection: '95%',
            minInvestment: 50,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Yearn USDC', percent: 35, color: '#0066ff', apy: '6-10%', maxLoss: 3 },
                { product: 'Beefy Stable', percent: 30, color: '#3cb34f', apy: '8-12%', maxLoss: 4 },
                { product: 'Convex 3Pool', percent: 35, color: '#ff5733', apy: '10-15%', maxLoss: 5 }
            ],
            features: ['Rééquilibrage auto', 'Gas optimisé', 'Meilleur taux garanti']
        },
        {
            id: 'COMPOUND_MASTER',
            name: 'Compound Master',
            icon: '🔄',
            description: 'Auto-compounding maximal - intérêts composés pour croissance exponentielle',
            riskLevel: 'Low',
            expectedApy: '10-18%',
            capitalProtection: '92%',
            minInvestment: 100,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'Beefy Finance', percent: 40, color: '#3cb34f', apy: '8-15%', maxLoss: 5 },
                { product: 'Yearn Vaults', percent: 35, color: '#0066ff', apy: '10-18%', maxLoss: 6 },
                { product: 'Harvest Auto', percent: 25, color: '#ff9800', apy: '12-20%', maxLoss: 8 }
            ],
            features: ['Compound 24/7', 'Effet boule de neige', '0 action requise']
        },
        {
            id: 'RISK_ADJUSTED',
            name: 'Risk Adjusted',
            icon: '⚖️',
            description: 'Ratio risque/rendement optimisé selon la théorie moderne du portefeuille',
            riskLevel: 'Low',
            expectedApy: '12-20%',
            capitalProtection: '88%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Blue Chip Staking', percent: 35, color: '#627eea', apy: '8-12%', maxLoss: 15 },
                { product: 'Stable Yield', percent: 40, color: '#00d4aa', apy: '6-10%', maxLoss: 3 },
                { product: 'Delta Neutral', percent: 25, color: '#9966ff', apy: '15-25%', maxLoss: 10 }
            ],
            features: ['Sharpe Ratio > 2', 'Volatilité contrôlée', 'Drawdown limité']
        },
        {
            id: 'DEFENSIVE_YIELD',
            name: 'Defensive Yield',
            icon: '🛡️',
            description: 'Stratégie défensive - préservation du capital avec rendements réguliers',
            riskLevel: 'Low',
            expectedApy: '7-12%',
            capitalProtection: '97%',
            minInvestment: 75,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Treasury RWA', percent: 45, color: '#1e3a8a', apy: '4-5%', maxLoss: 1 },
                { product: 'Insurance Pool', percent: 30, color: '#059669', apy: '6-10%', maxLoss: 3 },
                { product: 'Stable LP Protected', percent: 25, color: '#7c3aed', apy: '10-15%', maxLoss: 5 }
            ],
            features: ['Capital garanti', 'Insurance DeFi', 'Audit Certik']
        },
        {
            id: 'SMART_INCOME',
            name: 'Smart Income',
            icon: '💵',
            description: 'Revenus passifs réguliers - distribution hebdomadaire automatique',
            riskLevel: 'Low',
            expectedApy: '8-15%',
            capitalProtection: '93%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Real Yield GMX', percent: 35, color: '#4fa8e3', apy: '10-20%', maxLoss: 8 },
                { product: 'GNS Dividends', percent: 30, color: '#3ee6c4', apy: '8-15%', maxLoss: 7 },
                { product: 'Stablecoin Lending', percent: 35, color: '#00d4aa', apy: '5-10%', maxLoss: 2 }
            ],
            features: ['Paiement hebdo', 'Revenus en USDC', 'Réinvestissement auto']
        },
        {
            id: 'SAFETY_FIRST',
            name: 'Safety First',
            icon: '🔐',
            description: 'Sécurité maximale - uniquement protocoles audités et assurés',
            riskLevel: 'Low',
            expectedApy: '5-9%',
            capitalProtection: '99%',
            minInvestment: 50,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Aave V3 Main', percent: 50, color: '#b6509e', apy: '4-7%', maxLoss: 1 },
                { product: 'Compound V3', percent: 30, color: '#00d395', apy: '5-8%', maxLoss: 1 },
                { product: 'MakerDAO DSR', percent: 20, color: '#1aab9b', apy: '5-8%', maxLoss: 1 }
            ],
            features: ['100% audité', 'TVL > $1B', 'Track record 3+ ans']
        },
        {
            id: 'GROWTH_STABLE',
            name: 'Growth Stable',
            icon: '📈',
            description: 'Croissance stable - balance parfaite entre sécurité et performance',
            riskLevel: 'Low',
            expectedApy: '10-16%',
            capitalProtection: '90%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH Staking Lido', percent: 30, color: '#00a3ff', apy: '4-5%', maxLoss: 15 },
                { product: 'Pendle Fixed', percent: 35, color: '#00ff88', apy: '8-15%', maxLoss: 5 },
                { product: 'Curve 3Pool', percent: 35, color: '#ff0000', apy: '8-12%', maxLoss: 4 }
            ],
            features: ['Diversifié', 'Low volatility', 'Croissance régulière']
        },
        {
            id: 'DCA_AUTOPILOT',
            name: 'DCA Autopilot',
            icon: '🤖',
            description: 'Dollar Cost Averaging automatique - lissage du risque dans le temps',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '80%',
            minInvestment: 100,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'BTC DCA Weekly', percent: 35, color: '#f7931a', apy: '10-25%', maxLoss: 25 },
                { product: 'ETH DCA Weekly', percent: 35, color: '#627eea', apy: '10-25%', maxLoss: 25 },
                { product: 'Stable Reserve', percent: 30, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['Achat automatique', 'Timing optimisé', 'Stress-free']
        },
        {
            id: 'REBALANCE_PRO',
            name: 'Rebalance Pro',
            icon: '🎯',
            description: 'Rééquilibrage professionnel - maintien allocation optimale automatique',
            riskLevel: 'Low',
            expectedApy: '9-15%',
            capitalProtection: '92%',
            minInvestment: 200,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Index Top 10', percent: 40, color: '#4a9eff', apy: '8-15%', maxLoss: 12 },
                { product: 'Stable Anchor', percent: 35, color: '#00d4aa', apy: '6-10%', maxLoss: 3 },
                { product: 'Gold Tokenized', percent: 25, color: '#ffd700', apy: '5-10%', maxLoss: 8 }
            ],
            features: ['Rebalance auto', 'Allocation cible', 'Discipline garantie']
        },
        {
            id: 'PASSIVE_MAX',
            name: 'Passive Max',
            icon: '😴',
            description: '100% passif - zéro gestion requise, rendements optimisés automatiquement',
            riskLevel: 'Low',
            expectedApy: '8-14%',
            capitalProtection: '94%',
            minInvestment: 50,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'Set & Forget Vault', percent: 40, color: '#6366f1', apy: '7-12%', maxLoss: 4 },
                { product: 'Auto Yield Farm', percent: 35, color: '#22c55e', apy: '8-15%', maxLoss: 5 },
                { product: 'Passive Stables', percent: 25, color: '#00d4aa', apy: '5-8%', maxLoss: 2 }
            ],
            features: ['0 action', 'Sleep & Earn', 'Notifications only']
        },
        {
            id: 'INFLATION_HEDGE',
            name: 'Inflation Hedge',
            icon: '🛡️',
            description: 'Protection contre l\'inflation - rendements supérieurs à l\'inflation garantis',
            riskLevel: 'Low',
            expectedApy: '8-12%',
            capitalProtection: '95%',
            minInvestment: 100,
            rebalanceFrequency: 'Monthly',
            allocation: [
                { product: 'RWA Treasury', percent: 40, color: '#1e3a8a', apy: '4-6%', maxLoss: 2 },
                { product: 'Gold PAXG', percent: 30, color: '#ffd700', apy: '3-8%', maxLoss: 10 },
                { product: 'Inflation Linked', percent: 30, color: '#059669', apy: '6-12%', maxLoss: 5 }
            ],
            features: ['Beat inflation', 'Actifs réels', 'Valeur refuge']
        },

        // ═══════════════════════════════════════════════════════════════
        // AERODROME (Base) HIGH-YIELD COMBOS
        // ═══════════════════════════════════════════════════════════════
        {
            id: 'AERODROME_BALANCED',
            name: 'Aerodrome Balanced',
            icon: '✈️',
            description: 'Stratégie équilibrée Aerodrome - rendement/risque optimisé',
            riskLevel: 'Medium',
            expectedApy: '25-50%',
            capitalProtection: '75%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            chain: 'Base',
            allocation: [
                { product: 'USDC/ETH CL', percent: 30, color: '#0052ff', apy: '25-40%', maxLoss: 15, protocol: 'Aerodrome', type: 'concentrated' },
                { product: 'AERO/USDC LP', percent: 25, color: '#00ff88', apy: '30-50%', maxLoss: 20, protocol: 'Aerodrome' },
                { product: 'cbETH/WETH LP', percent: 25, color: '#627eea', apy: '15-25%', maxLoss: 8, protocol: 'Aerodrome', lstPair: true },
                { product: 'USDC Lending', percent: 20, color: '#2775ca', apy: '5-8%', maxLoss: 1, protocol: 'Aave' }
            ],
            features: ['Équilibré risque/rendement', 'Mix CL + stable', 'Protection capital']
        },
        {
            id: 'BASE_YIELD_PRO',
            name: 'Base Yield Pro',
            icon: '🔵',
            description: 'Rendements optimisés sur Base chain via Aerodrome',
            riskLevel: 'Medium',
            expectedApy: '40-80%',
            capitalProtection: '65%',
            minInvestment: 250,
            rebalanceFrequency: 'Weekly',
            chain: 'Base',
            allocation: [
                { product: 'USDC/ETH CL', percent: 30, color: '#0052ff', apy: '25-40%', maxLoss: 25, protocol: 'Aerodrome', type: 'concentrated' },
                { product: 'AERO Staking', percent: 25, color: '#00ff88', apy: '40-60%', maxLoss: 35, protocol: 'Aerodrome' },
                { product: 'BRETT/WETH LP', percent: 20, color: '#ff6b6b', apy: '60-100%', maxLoss: 50, protocol: 'Aerodrome' },
                { product: 'cbETH/WETH LP', percent: 15, color: '#627eea', apy: '15-25%', maxLoss: 15, protocol: 'Aerodrome' },
                { product: 'USDC Lending', percent: 10, color: '#2775ca', apy: '5-8%', maxLoss: 3, protocol: 'Aave' }
            ],
            features: ['veAERO boost', 'Concentrated Liquidity', 'Multi-pool']
        },
        {
            id: 'AERO_FEE_FARM',
            name: 'Aero Fee Farm',
            icon: '💸',
            description: 'Focus sur les pools à haut Fee APR (yield durable sans dilution)',
            riskLevel: 'Medium',
            expectedApy: '100-200%',
            capitalProtection: '55%',
            minInvestment: 150,
            rebalanceFrequency: 'Daily',
            chain: 'Base',
            allocation: [
                { product: 'CLANKER/WETH (355% Fee)', percent: 35, color: '#ff9500', apy: '300-400%', maxLoss: 55, protocol: 'Aerodrome', feeAPR: 355 },
                { product: 'WETH/USDC High Vol', percent: 25, color: '#0052ff', apy: '80-120%', maxLoss: 30, protocol: 'Aerodrome', feeAPR: 95 },
                { product: 'DEGEN/WETH', percent: 20, color: '#a855f7', apy: '150-250%', maxLoss: 60, protocol: 'Aerodrome' },
                { product: 'Stable USDC/USDbC', percent: 20, color: '#00d4aa', apy: '20-40%', maxLoss: 5, protocol: 'Aerodrome', stable: true }
            ],
            features: ['Fee APR prioritaire', 'Volume élevé', 'Rendement durable']
        },
        {
            id: 'BASE_ECOSYSTEM',
            name: 'Base Ecosystem',
            icon: '🌐',
            description: 'Exposition diversifiée à Base - blue chips + stables',
            riskLevel: 'Medium',
            expectedApy: '20-40%',
            capitalProtection: '80%',
            minInvestment: 150,
            rebalanceFrequency: 'Weekly',
            chain: 'Base',
            allocation: [
                { product: 'USDC/ETH CL', percent: 30, color: '#0052ff', apy: '25-40%', maxLoss: 15, protocol: 'Aerodrome' },
                { product: 'AERO/USDC LP', percent: 25, color: '#00ff88', apy: '30-45%', maxLoss: 20, protocol: 'Aerodrome' },
                { product: 'cbETH/WETH LP', percent: 25, color: '#627eea', apy: '15-25%', maxLoss: 8, protocol: 'Aerodrome', lstPair: true },
                { product: 'USDC/USDbC Stable', percent: 20, color: '#00d4aa', apy: '10-18%', maxLoss: 2, protocol: 'Aerodrome', stable: true }
            ],
            features: ['Blue chips Base', 'Protection stables', 'Faible IL']
        },
        {
            id: 'BASE_STABLE_YIELD',
            name: 'Base Stable Yield',
            icon: '💵',
            description: 'Rendement stable sur Base - pools stables + LST à faible risque',
            riskLevel: 'Low',
            expectedApy: '12-25%',
            capitalProtection: '92%',
            minInvestment: 50,
            rebalanceFrequency: 'Weekly',
            chain: 'Base',
            allocation: [
                { product: 'USDC/USDbC Stable LP', percent: 40, color: '#00d4aa', apy: '10-18%', maxLoss: 2, protocol: 'Aerodrome', stable: true },
                { product: 'cbETH/WETH LP', percent: 30, color: '#627eea', apy: '15-25%', maxLoss: 8, protocol: 'Aerodrome', lstPair: true },
                { product: 'USDC Lending Aave', percent: 30, color: '#2775ca', apy: '5-8%', maxLoss: 1, protocol: 'Aave' }
            ],
            features: ['Zero IL sur stables', 'LST = faible IL', 'Rendement durable']
        },
        {
            id: 'AERO_CONSERVATIVE',
            name: 'Aero Conservative',
            icon: '🛡️',
            description: 'Aerodrome prudent - stables + blue chips uniquement',
            riskLevel: 'Low',
            expectedApy: '15-30%',
            capitalProtection: '85%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            chain: 'Base',
            allocation: [
                { product: 'USDC/USDbC Stable', percent: 40, color: '#00d4aa', apy: '10-20%', maxLoss: 3, protocol: 'Aerodrome', stable: true },
                { product: 'USDC/ETH CL', percent: 30, color: '#0052ff', apy: '20-35%', maxLoss: 15, protocol: 'Aerodrome', type: 'concentrated' },
                { product: 'AERO/USDC', percent: 20, color: '#00ff88', apy: '25-40%', maxLoss: 25, protocol: 'Aerodrome' },
                { product: 'USDC Lending', percent: 10, color: '#2775ca', apy: '5-8%', maxLoss: 1, protocol: 'Aave' }
            ],
            features: ['Stables focus', 'Low IL risk', 'veAERO boost eligible']
        },
        {
            id: 'AERO_BLUECHIP',
            name: 'Aero Blue Chip',
            icon: '💎',
            description: 'Pools blue chip Aerodrome - ETH, USDC, AERO uniquement',
            riskLevel: 'Low',
            expectedApy: '15-35%',
            capitalProtection: '88%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            chain: 'Base',
            allocation: [
                { product: 'USDC/ETH CL Pool', percent: 35, color: '#0052ff', apy: '20-35%', maxLoss: 12, protocol: 'Aerodrome', type: 'concentrated' },
                { product: 'AERO/USDC LP', percent: 30, color: '#00ff88', apy: '25-40%', maxLoss: 15, protocol: 'Aerodrome' },
                { product: 'ETH/AERO LP', percent: 20, color: '#627eea', apy: '20-30%', maxLoss: 15, protocol: 'Aerodrome' },
                { product: 'USDC Aave', percent: 15, color: '#2775ca', apy: '5-8%', maxLoss: 1, protocol: 'Aave' }
            ],
            features: ['Tokens majeurs uniquement', 'Liquidité profonde', 'Faible slippage']
        },
        {
            id: 'AERO_SAFE_YIELD',
            name: 'Aero Safe Yield',
            icon: '🔐',
            description: 'Rendement sécurisé Aerodrome - stables et LST uniquement',
            riskLevel: 'Low',
            expectedApy: '10-20%',
            capitalProtection: '95%',
            minInvestment: 50,
            rebalanceFrequency: 'Monthly',
            chain: 'Base',
            allocation: [
                { product: 'USDC/USDbC Stable', percent: 50, color: '#00d4aa', apy: '10-18%', maxLoss: 2, protocol: 'Aerodrome', stable: true },
                { product: 'cbETH/WETH LP', percent: 30, color: '#627eea', apy: '15-22%', maxLoss: 5, protocol: 'Aerodrome', lstPair: true },
                { product: 'USDC Aave', percent: 20, color: '#2775ca', apy: '5-8%', maxLoss: 1, protocol: 'Aave' }
            ],
            features: ['95% capital protégé', 'Stables + LST', 'Rendement garanti']
        },
        {
            id: 'LST_YIELD_BASE',
            name: 'LST Yield Base',
            icon: '💧',
            description: 'Liquid Staking Tokens sur Base - rendement ETH optimisé',
            riskLevel: 'Low',
            expectedApy: '12-22%',
            capitalProtection: '90%',
            minInvestment: 100,
            rebalanceFrequency: 'Weekly',
            chain: 'Base',
            allocation: [
                { product: 'cbETH/WETH LP', percent: 40, color: '#0052ff', apy: '15-25%', maxLoss: 5, protocol: 'Aerodrome', lstPair: true },
                { product: 'wstETH/ETH LP', percent: 30, color: '#00a3ff', apy: '12-20%', maxLoss: 5, protocol: 'Aerodrome', lstPair: true },
                { product: 'ETH Lending Aave', percent: 30, color: '#627eea', apy: '3-6%', maxLoss: 3, protocol: 'Aave' }
            ],
            features: ['LST pairs = faible IL', 'ETH exposure', 'Double rendement staking+LP']
        },
        {
            id: 'STABLE_COMPOUNDER',
            name: 'Stable Compounder',
            icon: '🔄',
            description: 'Auto-compound stables sur Aerodrome - zéro IL',
            riskLevel: 'Low',
            expectedApy: '8-15%',
            capitalProtection: '98%',
            minInvestment: 25,
            rebalanceFrequency: 'Weekly',
            chain: 'Base',
            allocation: [
                { product: 'USDC/USDbC LP', percent: 60, color: '#00d4aa', apy: '10-15%', maxLoss: 1, protocol: 'Aerodrome', stable: true, zeroIL: true },
                { product: 'USDC Aave', percent: 25, color: '#2775ca', apy: '5-8%', maxLoss: 1, protocol: 'Aave' },
                { product: 'DAI/USDC LP', percent: 15, color: '#f5ac37', apy: '8-12%', maxLoss: 1, protocol: 'Aerodrome', stable: true }
            ],
            features: ['0% Impermanent Loss', 'Auto-compound', 'Capital 98% protégé']
        },
        // ═══════════════════════════════════════════════════════════════
        // MULTI-DEX COMBOS - QuickSwap, SpookySwap, KyberSwap
        // ═══════════════════════════════════════════════════════════════
        {
            id: 'POLYGON_YIELD',
            name: 'Polygon Yield',
            icon: '🟣',
            description: 'QuickSwap + KyberSwap yield on Polygon - low gas fees',
            riskLevel: 'Medium',
            expectedApy: '20-35%',
            capitalProtection: '80%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'MATIC/USDC QuickSwap LP', percent: 40, color: '#8247e5', apy: '25-35%', maxLoss: 20 },
                { product: 'ETH/USDC KyberSwap LP', percent: 35, color: '#31cb9e', apy: '18-25%', maxLoss: 15 },
                { product: 'USDC/USDT QuickSwap Stable', percent: 25, color: '#00d4aa', apy: '8-12%', maxLoss: 2 }
            ],
            features: ['Low gas on Polygon', 'Dual DEX diversification', 'Stablecoin anchor']
        },
        {
            id: 'FANTOM_FARMER',
            name: 'Fantom Farmer',
            icon: '👻',
            description: 'SpookySwap farming on Fantom - high APY ecosystem',
            riskLevel: 'High',
            expectedApy: '30-60%',
            capitalProtection: '65%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'FTM/USDC SpookySwap LP', percent: 40, color: '#1969ff', apy: '30-45%', maxLoss: 30 },
                { product: 'BOO/FTM SpookySwap LP', percent: 30, color: '#ff6600', apy: '50-80%', maxLoss: 40 },
                { product: 'USDC/DAI SpookySwap Stable', percent: 30, color: '#00d4aa', apy: '10-15%', maxLoss: 2 }
            ],
            features: ['Fast 1s blocks', 'High farming rewards', 'SpookySwap ecosystem']
        },
        {
            id: 'MULTI_DEX_SPREAD',
            name: 'Multi-DEX Spread',
            icon: '🌐',
            description: 'Diversified across 5+ DEXes on multiple chains',
            riskLevel: 'Medium',
            expectedApy: '15-30%',
            capitalProtection: '75%',
            minInvestment: 50,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'ETH/USDC Uniswap V3', percent: 25, color: '#ff007a', apy: '20-30%', maxLoss: 15 },
                { product: 'MATIC/USDC QuickSwap', percent: 20, color: '#8247e5', apy: '25-35%', maxLoss: 20 },
                { product: 'ETH/USDC KyberSwap', percent: 20, color: '#31cb9e', apy: '18-25%', maxLoss: 15 },
                { product: 'SUSHI/ETH SushiSwap', percent: 15, color: '#d65aff', apy: '30-40%', maxLoss: 25 },
                { product: 'FTM/USDC SpookySwap', percent: 20, color: '#1969ff', apy: '30-45%', maxLoss: 30 }
            ],
            features: ['5 DEX diversification', 'Multi-chain exposure', 'Rebalanced weekly']
        },
        {
            id: 'SOLANA_JUPITER',
            name: 'Solana Jupiter',
            icon: '🪐',
            description: 'Jupiter aggregated yield on Solana - fastest chain',
            riskLevel: 'High',
            expectedApy: '30-55%',
            capitalProtection: '60%',
            minInvestment: 10,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'SOL/USDC Jupiter LP', percent: 45, color: '#14f195', apy: '30-40%', maxLoss: 30 },
                { product: 'JUP/SOL Jupiter LP', percent: 30, color: '#9945ff', apy: '45-60%', maxLoss: 40 },
                { product: 'JUP/USDC Jupiter LP', percent: 25, color: '#00d4aa', apy: '40-55%', maxLoss: 35 }
            ],
            features: ['Sub-second finality', 'Jupiter best-route aggregation', 'Near-zero gas']
        },
        {
            id: 'MUX_LEVERAGED',
            name: 'MUX Leveraged Yield',
            icon: '🔶',
            description: 'MUX Protocol MUXLP across Arbitrum, Fantom & Optimism',
            riskLevel: 'Medium',
            expectedApy: '25-35%',
            capitalProtection: '70%',
            minInvestment: 25,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'MUXLP Arbitrum', percent: 45, color: '#28a0f0', apy: '22-28%', maxLoss: 20 },
                { product: 'MUXLP Fantom', percent: 25, color: '#1969ff', apy: '30-40%', maxLoss: 30 },
                { product: 'MUXLP Optimism', percent: 30, color: '#ff0420', apy: '25-32%', maxLoss: 22 }
            ],
            features: ['Perp trading fees as yield', 'Multi-chain MUXLP', 'Aggregated liquidity']
        },
        {
            id: 'VENUS_LENDER',
            name: 'Venus Lender',
            icon: '💛',
            description: 'Venus Protocol lending on BNB Chain - safe yield',
            riskLevel: 'Low',
            expectedApy: '5-12%',
            capitalProtection: '95%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'USDC Venus Supply', percent: 40, color: '#2775ca', apy: '6-10%', maxLoss: 2 },
                { product: 'USDT Venus Supply', percent: 30, color: '#26a17b', apy: '5-8%', maxLoss: 2 },
                { product: 'XVS Venus Staking', percent: 30, color: '#f0b90b', apy: '14-20%', maxLoss: 15 }
            ],
            features: ['BNB Chain low fees', 'Lending protocol yield', 'XVS governance rewards']
        },
        {
            id: 'SYNTHETIX_PERPS',
            name: 'Synthetix Perps Yield',
            icon: '🟣',
            description: 'Synthetix V3 perps liquidity across Base & Arbitrum',
            riskLevel: 'Medium',
            expectedApy: '20-30%',
            capitalProtection: '75%',
            minInvestment: 25,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'Synthetix LP Base', percent: 45, color: '#0052ff', apy: '18-25%', maxLoss: 20 },
                { product: 'Synthetix LP Arbitrum', percent: 30, color: '#28a0f0', apy: '22-30%', maxLoss: 22 },
                { product: 'SNX/ETH LP', percent: 25, color: '#7b2ff7', apy: '25-35%', maxLoss: 25 }
            ],
            features: ['Perp fee revenue', 'Multi-collateral (ETH, USDC, cbBTC)', 'V3 architecture']
        },
        {
            id: 'BSC_CHEESE_YIELD',
            name: 'BSC Cheese Yield',
            icon: '🧀',
            description: 'CheeseSwap + Venus on BNB Chain - cheap gas, high APY',
            riskLevel: 'High',
            expectedApy: '25-50%',
            capitalProtection: '60%',
            minInvestment: 10,
            rebalanceFrequency: 'Weekly',
            allocation: [
                { product: 'BNB/USDC CheeseSwap LP', percent: 35, color: '#f0b90b', apy: '25-35%', maxLoss: 25 },
                { product: 'USDC Venus Supply', percent: 35, color: '#2775ca', apy: '6-10%', maxLoss: 2 },
                { product: 'CHEESE/BNB LP', percent: 30, color: '#ffa500', apy: '80-150%', maxLoss: 50 }
            ],
            features: ['BSC low gas', 'Venus safe yield base', 'CHEESE high APY kicker']
        },
        {
            id: 'FLUID_SMART',
            name: 'Fluid Smart Yield',
            icon: '💧',
            description: 'Instadapp Fluid - optimized lending/DEX yield with smart accounts',
            riskLevel: 'Low',
            expectedApy: '12-18%',
            capitalProtection: '90%',
            minInvestment: 25,
            rebalanceFrequency: 'Daily',
            allocation: [
                { product: 'ETH/USDC Fluid DEX', percent: 35, color: '#627eea', apy: '15-20%', maxLoss: 10 },
                { product: 'USDC/USDT Fluid Stable', percent: 40, color: '#00d4aa', apy: '8-12%', maxLoss: 1 },
                { product: 'WBTC/USDC Fluid DEX', percent: 25, color: '#f7931a', apy: '12-16%', maxLoss: 12 }
            ],
            features: ['$6B+ TVL protocol', 'Smart account automation', 'Gas-efficient flash accounting']
        }
    ],

    // ═══════════════════════════════════════════════════════════════
    // COMBO SECURITY - Chain & Protocol Hack Protection
    // ═══════════════════════════════════════════════════════════════

    /**
     * Check if a combo is safe to invest in.
     * Cross-references with ArbitrageScanner and LiquidityPoolsModule pauses.
     */
    isComboSafe(comboId) {
        const combo = this.combos.find(c => c.id === comboId) || this.comboData.find(c => c.id === comboId);
        if (!combo) return { safe: false, reason: 'Combo not found' };

        // Map combo product names to protocols/chains for security cross-check
        const protocolKeywords = {
            'QuickSwap': { dex: 'quickswap', chain: 'polygon' },
            'SpookySwap': { dex: 'spookyswap', chain: 'fantom' },
            'KyberSwap': { dex: 'kyberswap' },
            'Jupiter': { dex: 'jupiter', chain: 'solana' },
            'MUX': { dex: 'mux' },
            'MUXLP': { dex: 'mux' },
            'Venus': { dex: 'venus', chain: 'bsc' },
            'Synthetix': { dex: 'synthetix' },
            'CheeseSwap': { dex: 'cheeseswap', chain: 'bsc' },
            'Fluid': { dex: 'instadapp' },
            'Instadapp': { dex: 'instadapp' },
            'SushiSwap': { dex: 'sushiswap' },
            'Uniswap': { dex: 'uniswap_v3' },
            'Curve': { dex: 'curve' },
            'Balancer': { dex: 'balancer' },
            'Aerodrome': { chain: 'base' },
            'Arbitrum': { chain: 'arbitrum' },
            'Fantom': { chain: 'fantom' },
            'Polygon': { chain: 'polygon' },
            'Base': { chain: 'base' },
            'Optimism': { chain: 'optimism' },
            'Solana': { chain: 'solana' },
            'BNB': { chain: 'bsc' },
        };

        const warnings = [];

        if (combo.allocation) {
            for (const alloc of combo.allocation) {
                for (const [keyword, refs] of Object.entries(protocolKeywords)) {
                    if (alloc.product && alloc.product.includes(keyword)) {
                        // Check chain safety via ArbitrageScanner
                        if (refs.chain && typeof ArbitrageScanner !== 'undefined') {
                            const chainSafe = ArbitrageScanner.isChainSafe(refs.chain);
                            if (!chainSafe.safe) {
                                warnings.push(`${alloc.product}: chain ${refs.chain} paused (${chainSafe.reason})`);
                            }
                        }
                        // Check DEX safety via ArbitrageScanner
                        if (refs.dex && typeof ArbitrageScanner !== 'undefined') {
                            const dexSafe = ArbitrageScanner.isDexSafe(refs.dex);
                            if (!dexSafe.safe) {
                                warnings.push(`${alloc.product}: DEX ${refs.dex} paused (${dexSafe.reason})`);
                            }
                        }
                    }
                }
            }
        }

        if (warnings.length > 0) {
            return { safe: false, reason: warnings.join('; '), warnings };
        }

        return { safe: true };
    },

    /**
     * Get all combos filtered by safety
     */
    getSafeCombos() {
        return this.combos.filter(c => this.isComboSafe(c.id).safe);
    },

    // ═══════════════════════════════════════════════════════════════
    // AUTO-REPORT SYSTEM - Track & log all security incidents
    // ═══════════════════════════════════════════════════════════════

    incidentLog: [],     // All security incidents
    maxLogEntries: 200,  // Keep last 200

    /**
     * Log a security incident with full details
     */
    reportIncident(severity, type, details) {
        const incident = {
            id: 'INC-' + Date.now().toString(36).toUpperCase(),
            timestamp: Date.now(),
            date: new Date().toISOString(),
            severity,  // 'info' | 'warning' | 'critical' | 'resolved'
            type,      // 'fallback_activated' | 'protocol_paused' | 'chain_paused' | 'tvl_drain' | 'price_anomaly' | 'investment_blocked'
            ...details
        };

        this.incidentLog.push(incident);
        if (this.incidentLog.length > this.maxLogEntries) {
            this.incidentLog = this.incidentLog.slice(-this.maxLogEntries);
        }

        // Persist to localStorage
        try {
            localStorage.setItem('obelisk_combo_incidents', JSON.stringify(this.incidentLog.slice(-50)));
        } catch (e) { /* storage full, ignore */ }

        // Console output with severity coloring
        const label = `[COMBO INCIDENT ${incident.id}]`;
        if (severity === 'critical') {
            console.error(label, type, details);
        } else if (severity === 'warning') {
            console.warn(label, type, details);
        } else {
            console.log(label, type, details);
        }

        // Dispatch event for external monitoring
        window.dispatchEvent(new CustomEvent('combo-incident', { detail: incident }));

        // Notify user for critical incidents
        if (severity === 'critical' && typeof showNotification === 'function') {
            showNotification(`Security: ${type} - ${details.message || details.comboId || ''}`, 'error');
        }

        return incident;
    },

    /**
     * Load persisted incidents
     */
    loadIncidents() {
        try {
            const stored = localStorage.getItem('obelisk_combo_incidents');
            if (stored) this.incidentLog = JSON.parse(stored);
        } catch (e) { /* corrupted, ignore */ }
    },

    /**
     * Get incidents filtered by criteria
     */
    getIncidents(filters = {}) {
        return this.incidentLog.filter(inc => {
            if (filters.severity && inc.severity !== filters.severity) return false;
            if (filters.type && inc.type !== filters.type) return false;
            if (filters.since && inc.timestamp < filters.since) return false;
            if (filters.comboId && inc.comboId !== filters.comboId) return false;
            return true;
        });
    },

    /**
     * Get incident summary for dashboard
     */
    getIncidentSummary() {
        const last24h = Date.now() - 86400000;
        const recent = this.incidentLog.filter(i => i.timestamp > last24h);
        return {
            total: this.incidentLog.length,
            last24h: recent.length,
            critical: recent.filter(i => i.severity === 'critical').length,
            warnings: recent.filter(i => i.severity === 'warning').length,
            fallbacksActive: recent.filter(i => i.type === 'fallback_activated').length,
            resolved: recent.filter(i => i.severity === 'resolved').length,
            byType: recent.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + 1; return acc; }, {}),
        };
    },

    /**
     * Auto-scan all combos and report any issues
     * Called periodically or on-demand
     */
    autoScanAndReport() {
        const issues = [];

        for (const combo of this.combos) {
            const { unsafeIndices, unsafeProducts, reasons } = this.identifyUnsafeAllocations(combo);
            if (unsafeIndices.length === 0) continue;

            const fallback = this.buildFallbackAllocation(combo);

            if (fallback.fullFallback) {
                // Critical: all allocations compromised
                this.reportIncident('critical', 'combo_fully_compromised', {
                    comboId: combo.id,
                    comboName: combo.name,
                    message: `All ${combo.allocation.length} allocations unavailable`,
                    unsafeProducts,
                    reasons,
                    action: 'Redirected 100% to USDC Safe Haven'
                });
            } else {
                // Warning: partial fallback
                this.reportIncident('warning', 'fallback_activated', {
                    comboId: combo.id,
                    comboName: combo.name,
                    message: `${unsafeIndices.length}/${combo.allocation.length} allocations redirected`,
                    unsafeProducts,
                    reasons,
                    redirections: fallback.warnings
                });
            }

            issues.push({ comboId: combo.id, unsafeCount: unsafeIndices.length, total: combo.allocation.length });
        }

        if (issues.length > 0) {
            console.warn(`[COMBO AUTO-SCAN] ${issues.length} combos affected by security issues`);
        }

        return issues;
    },

    /**
     * Start periodic auto-scan (every 60 seconds)
     */
    _autoScanInterval: null,
    startAutoScan(intervalMs = 60000) {
        if (this._autoScanInterval) return;
        this._autoScanInterval = setInterval(() => this.autoScanAndReport(), intervalMs);
        console.log('[COMBO SECURITY] Auto-scan started (interval: ' + intervalMs + 'ms)');
    },

    stopAutoScan() {
        if (this._autoScanInterval) {
            clearInterval(this._autoScanInterval);
            this._autoScanInterval = null;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // FALLBACK SYSTEM - Redistribute unsafe allocations
    // ═══════════════════════════════════════════════════════════════

    /**
     * Fallback allocation map: when a protocol/chain is down,
     * redirect its allocation to a safer alternative.
     */
    fallbackMap: {
        // DEX fallbacks (same type of yield, different protocol)
        'QuickSwap':    [{ fallback: 'Uniswap V3 Polygon', chain: 'polygon' }, { fallback: 'USDC Stable', chain: null }],
        'SpookySwap':   [{ fallback: 'SushiSwap', chain: 'arbitrum' }, { fallback: 'USDC Stable', chain: null }],
        'KyberSwap':    [{ fallback: 'Uniswap V3', chain: 'ethereum' }, { fallback: 'Curve Stable', chain: null }],
        'Jupiter':      [{ fallback: 'Orca Solana', chain: 'solana' }, { fallback: 'USDC Stable', chain: null }],
        'MUX':          [{ fallback: 'GMX GLP', chain: 'arbitrum' }, { fallback: 'Aave Lending', chain: 'arbitrum' }],
        'MUXLP':        [{ fallback: 'GMX GLP', chain: 'arbitrum' }, { fallback: 'Aave Lending', chain: 'arbitrum' }],
        'Venus':        [{ fallback: 'Aave Lending', chain: 'ethereum' }, { fallback: 'USDC Stable', chain: null }],
        'Synthetix':    [{ fallback: 'GMX Perps', chain: 'arbitrum' }, { fallback: 'Aave Lending', chain: null }],
        'CheeseSwap':   [{ fallback: 'PancakeSwap BSC', chain: 'bsc' }, { fallback: 'USDC Stable', chain: null }],
        'Fluid':        [{ fallback: 'Aave Lending', chain: 'ethereum' }, { fallback: 'Curve Stable', chain: null }],
        'Instadapp':    [{ fallback: 'Aave Lending', chain: 'ethereum' }, { fallback: 'Curve Stable', chain: null }],
        'SushiSwap':    [{ fallback: 'Uniswap V3', chain: 'ethereum' }, { fallback: 'USDC Stable', chain: null }],
        'Uniswap':      [{ fallback: 'SushiSwap', chain: 'ethereum' }, { fallback: 'Curve Stable', chain: null }],
        'Curve':        [{ fallback: 'Balancer Stable', chain: 'ethereum' }, { fallback: 'USDC Stable', chain: null }],
        'Balancer':     [{ fallback: 'Curve Stable', chain: 'ethereum' }, { fallback: 'USDC Stable', chain: null }],
        'PancakeSwap':  [{ fallback: 'Venus BSC', chain: 'bsc' }, { fallback: 'USDC Stable', chain: null }],
        // Chain-level fallbacks
        'Arbitrum':     [{ fallback: 'Ethereum Mainnet', chain: 'ethereum' }],
        'Fantom':       [{ fallback: 'Arbitrum', chain: 'arbitrum' }],
        'Polygon':      [{ fallback: 'Arbitrum', chain: 'arbitrum' }],
        'Solana':       [{ fallback: 'Arbitrum', chain: 'arbitrum' }],
        'Base':         [{ fallback: 'Ethereum Mainnet', chain: 'ethereum' }],
        'Optimism':     [{ fallback: 'Arbitrum', chain: 'arbitrum' }],
        'BNB':          [{ fallback: 'Ethereum Mainnet', chain: 'ethereum' }],
        'BSC':          [{ fallback: 'Ethereum Mainnet', chain: 'ethereum' }],
    },

    /**
     * Default safe-haven allocation used when no fallback is available
     */
    safeHavenAllocation: {
        product: 'USDC Stable Reserve',
        color: '#22c55e',
        apy: '3-5%',
        maxLoss: 1,
        isFallback: true,
        fallbackType: 'safe-haven'
    },

    /**
     * Check which allocations in a combo are unsafe
     * Returns { unsafeIndices, unsafeProducts, reasons }
     */
    identifyUnsafeAllocations(combo) {
        if (!combo || !combo.allocation) return { unsafeIndices: [], unsafeProducts: [], reasons: [] };

        const protocolKeywords = {
            'QuickSwap': { dex: 'quickswap', chain: 'polygon' },
            'SpookySwap': { dex: 'spookyswap', chain: 'fantom' },
            'KyberSwap': { dex: 'kyberswap' },
            'Jupiter': { dex: 'jupiter', chain: 'solana' },
            'MUX': { dex: 'mux' }, 'MUXLP': { dex: 'mux' },
            'Venus': { dex: 'venus', chain: 'bsc' },
            'Synthetix': { dex: 'synthetix' },
            'CheeseSwap': { dex: 'cheeseswap', chain: 'bsc' },
            'Fluid': { dex: 'instadapp' }, 'Instadapp': { dex: 'instadapp' },
            'SushiSwap': { dex: 'sushiswap' },
            'Uniswap': { dex: 'uniswap_v3' },
            'Curve': { dex: 'curve' },
            'Balancer': { dex: 'balancer' },
            'PancakeSwap': { dex: 'pancakeswap' },
            'Aerodrome': { chain: 'base' },
            'Arbitrum': { chain: 'arbitrum' },
            'Fantom': { chain: 'fantom' },
            'Polygon': { chain: 'polygon' },
            'Base': { chain: 'base' },
            'Optimism': { chain: 'optimism' },
            'Solana': { chain: 'solana' },
            'BNB': { chain: 'bsc' },
        };

        const unsafeIndices = [];
        const unsafeProducts = [];
        const reasons = [];

        combo.allocation.forEach((alloc, idx) => {
            for (const [keyword, refs] of Object.entries(protocolKeywords)) {
                if (!alloc.product || !alloc.product.includes(keyword)) continue;

                if (refs.chain && typeof ArbitrageScanner !== 'undefined') {
                    const chainSafe = ArbitrageScanner.isChainSafe(refs.chain);
                    if (!chainSafe.safe) {
                        unsafeIndices.push(idx);
                        unsafeProducts.push(keyword);
                        reasons.push(`${keyword}: chain ${refs.chain} paused`);
                        return; // one reason per alloc is enough
                    }
                }
                if (refs.dex && typeof ArbitrageScanner !== 'undefined') {
                    const dexSafe = ArbitrageScanner.isDexSafe(refs.dex);
                    if (!dexSafe.safe) {
                        unsafeIndices.push(idx);
                        unsafeProducts.push(keyword);
                        reasons.push(`${keyword}: DEX paused`);
                        return;
                    }
                }
            }
        });

        return { unsafeIndices, unsafeProducts, reasons };
    },

    /**
     * Build a fallback allocation for a combo.
     * Redistributes unsafe % to fallback protocols or safe-haven.
     * Returns { allocation, warnings, hasFallbacks }
     */
    buildFallbackAllocation(combo) {
        const { unsafeIndices, unsafeProducts, reasons } = this.identifyUnsafeAllocations(combo);

        if (unsafeIndices.length === 0) {
            return { allocation: combo.allocation, warnings: [], hasFallbacks: false };
        }

        // If ALL allocations are unsafe, block entirely
        if (unsafeIndices.length === combo.allocation.length) {
            return {
                allocation: [{ ...this.safeHavenAllocation, percent: 100, product: 'USDC Safe Haven (all protocols paused)' }],
                warnings: reasons,
                hasFallbacks: true,
                fullFallback: true
            };
        }

        const newAllocation = [];
        let redistributePercent = 0;
        const warnings = [];

        combo.allocation.forEach((alloc, idx) => {
            if (unsafeIndices.includes(idx)) {
                // Try to find a fallback
                const keyword = unsafeProducts[unsafeIndices.indexOf(idx)];
                const fallbacks = this.fallbackMap[keyword] || [];
                let placed = false;

                for (const fb of fallbacks) {
                    // Verify the fallback chain is also safe
                    if (fb.chain && typeof ArbitrageScanner !== 'undefined') {
                        const fbChainSafe = ArbitrageScanner.isChainSafe(fb.chain);
                        if (!fbChainSafe.safe) continue;
                    }

                    // Use this fallback
                    newAllocation.push({
                        product: `${fb.fallback} (fallback: ${alloc.product})`,
                        percent: alloc.percent,
                        color: '#f59e0b',
                        apy: alloc.apy,
                        maxLoss: alloc.maxLoss,
                        isFallback: true,
                        fallbackType: 'redirect',
                        originalProduct: alloc.product
                    });
                    warnings.push(`${alloc.product} -> ${fb.fallback} (${reasons[unsafeIndices.indexOf(idx)]})`);
                    placed = true;
                    break;
                }

                if (!placed) {
                    // No valid fallback: redistribute to safe allocations
                    redistributePercent += alloc.percent;
                    warnings.push(`${alloc.product} -> redistributed to safe allocations`);
                }
            } else {
                newAllocation.push({ ...alloc });
            }
        });

        // Redistribute remaining % proportionally to safe allocations
        if (redistributePercent > 0 && newAllocation.length > 0) {
            const safeTotal = newAllocation.reduce((s, a) => s + a.percent, 0);
            if (safeTotal > 0) {
                newAllocation.forEach(alloc => {
                    const bonus = (alloc.percent / safeTotal) * redistributePercent;
                    alloc.percent = Math.round(alloc.percent + bonus);
                    alloc.redistributed = true;
                });
            }
            // Fix rounding to exactly 100%
            const total = newAllocation.reduce((s, a) => s + a.percent, 0);
            if (total !== 100 && newAllocation.length > 0) {
                newAllocation[0].percent += (100 - total);
            }
        }

        return { allocation: newAllocation, warnings, hasFallbacks: true };
    },

    // ═══════════════════════════════════════════════════════════════
    // COMBO GENERATOR - Creates infinite recursive combos
    // ═══════════════════════════════════════════════════════════════
    generateUltraCombos() {
        const ultraCombos = [];
        const icons = ['💎', '🔥', '⚡', '🌟', '🚀', '💫', '🌈', '🎯', '👑', '🏆'];
        const prefixes = ['ULTRA', 'HYPER', 'INFINITY', 'QUANTUM', 'OMEGA', 'APEX', 'PRIME', 'ELITE'];
        const risks = ['Low', 'Medium', 'High', 'Very High'];
        const colors = ['#ff6b6b', '#00d4aa', '#627eea', '#f7931a', '#a855f7', '#22c55e', '#3b82f6', '#f59e0b'];

        // Generate ULTRA combos (combo x combo x combo)
        for (let i = 0; i < 10; i++) {
            const prefix = prefixes[i % prefixes.length];
            const icon = icons[i % icons.length];
            const risk = risks[Math.floor(Math.random() * risks.length)];
            const baseApy = 20 + i * 10;
            const protection = Math.max(20, 90 - i * 8);

            ultraCombos.push({
                id: `${prefix}_COMBO_X${i + 1}`,
                name: `${icon} ${prefix} Combo X${i + 1}`,
                icon: icon,
                description: `Level ${i + 1} recursive combo - ${prefix.toLowerCase()} diversification`,
                riskLevel: risk,
                expectedApy: `${baseApy}-${baseApy * 2}%`,
                capitalProtection: `${protection}%`,
                minInvestment: 500 * (i + 1),
                rebalanceFrequency: i < 3 ? 'Monthly' : (i < 6 ? 'Weekly' : 'Daily'),
                isUltraCombo: true,
                comboLevel: i + 1,
                allocation: this.generateRandomAllocation(3 + Math.floor(i / 2), colors)
            });
        }

        return ultraCombos;
    },

    generateRandomAllocation(count, colors) {
        const products = [
            'MEGA Balanced', 'MEGA Aggressive', 'MEGA Income', 'MEGA Global', 'MEGA Future',
            'Blue Chip', 'Growth Portfolio', 'Conservative Yield', 'Degen Paradise', 'Tech Innovator',
            'Dividend Hunter', 'HODL Forever', 'Active Trader', 'Institutional Grade', 'Real World Assets'
        ];
        const allocation = [];
        let remaining = 100;

        for (let i = 0; i < count && remaining > 0; i++) {
            const isLast = i === count - 1;
            const percent = isLast ? remaining : Math.floor(remaining / (count - i) * (0.8 + Math.random() * 0.4));
            remaining -= percent;

            allocation.push({
                product: products[Math.floor(Math.random() * products.length)] + ' Combo',
                percent: percent,
                color: colors[i % colors.length],
                apy: `${10 + i * 5}-${30 + i * 10}%`,
                maxLoss: 20 + i * 8
            });
        }

        return allocation;
    },

    init() {
        console.log('[COMBOS DEBUG] comboData length at init:', this.comboData ? this.comboData.length : 'undefined');

        // Force correct initial sort order
        this.sortBy = 'minInvestment';
        this.sortDir = 'asc';

        // Translate UI when language changes
        if (typeof I18n !== 'undefined') {
            document.addEventListener('languageChanged', () => this.render());
        }

        // Add generated ultra combos
        this.combos = [...this.comboData, ...this.generateUltraCombos()];

        // Verify low-minimum combos exist
        const lowMinCombos = this.combos.filter(c => c.minInvestment <= 10);
        console.log('[Combos] Low minimum combos ($1-$10):', lowMinCombos.map(c => c.id + ':$' + c.minInvestment));

        console.log("[Combos] calling render with", this.combos.length, "combos");
        this.render();
        this.bindEvents();
        // Load persisted incidents & start auto-scan
        this.loadIncidents();
        this.startAutoScan(60000);
        this.autoScanAndReport(); // Initial scan

        console.log('[Combos] Module initialized with', this.combos.length, 'combos (including generated)');
    },

    render(filter = 'all') {
        console.log("[Combos] render called"); const grid = document.getElementById('combosGrid');
        if (!grid) return;

        // Get parent container to add controls before grid
        const parentContainer = grid.parentElement;

        // Add balance banner and controls if not already present
        let controlsContainer = document.getElementById('combos-controls');
        if (!controlsContainer) {
            controlsContainer = document.createElement('div');
            controlsContainer.id = 'combos-controls';
            parentContainer.insertBefore(controlsContainer, grid);
        }

        // Get balances from SimulatedPortfolio
        const simBalance = (typeof SimulatedPortfolio !== 'undefined') ? (SimulatedPortfolio.portfolio?.simulatedBalance || 0) : 0;
        const realBalance = (typeof SimulatedPortfolio !== 'undefined') ? (SimulatedPortfolio.portfolio?.realBalance || 0) : 0;
        const totalAvailable = simBalance + realBalance;

        const t = (key, fallback) => (typeof I18n !== 'undefined' ? I18n.t(key) : fallback);

        controlsContainer.innerHTML = `
            <!-- Available Balance Banner -->
            <div style="background:linear-gradient(135deg,rgba(0,255,136,0.15),rgba(59,130,246,0.15));border:2px solid rgba(0,255,136,0.3);border-radius:16px;padding:20px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;">
                    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
                        <div>
                            <div style="color:#888;font-size:12px;margin-bottom:4px;">💰 ${t('available_to_invest', 'Disponible à investir')}</div>
                            <div style="font-size:28px;font-weight:700;color:#fff;">$${totalAvailable.toFixed(2)} <span style="font-size:14px;color:#888;">USDC</span></div>
                        </div>
                        <div style="display:flex;gap:15px;">
                            <div style="padding:10px 15px;background:rgba(168,85,247,0.2);border-radius:10px;border:1px solid rgba(168,85,247,0.3);">
                                <div style="color:#a855f7;font-size:11px;">🎮 ${t('simulated', 'SIMULÉ')}</div>
                                <div style="color:#a855f7;font-size:18px;font-weight:600;">$${simBalance.toFixed(2)}</div>
                            </div>
                            <div style="padding:10px 15px;background:rgba(59,130,246,0.2);border-radius:10px;border:1px solid rgba(59,130,246,0.3);">
                                <div style="color:#3b82f6;font-size:11px;">💎 ${t('real', 'RÉEL')}
                                    <button onclick="CombosModule.refreshRealBalance()" title="${t('refresh', 'Rafraîchir')}" style="background:none;border:none;cursor:pointer;font-size:11px;padding:0 4px;">🔄</button>
                                </div>
                                <div style="color:#3b82f6;font-size:18px;font-weight:600;">$${realBalance.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                    <button onclick="SimulatedPortfolio.openModal()" style="padding:10px 20px;background:linear-gradient(135deg,#a855f7,#7c3aed);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;">
                        + ${t('add_funds', 'Ajouter fonds')}
                    </button>
                </div>
            </div>

            <!-- Budget Filter -->
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px;padding:12px 16px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:10px;">
                <span style="color:#00ff88;font-weight:600;font-size:14px;">💰 ${t('my_budget', 'Mon budget')}:</span>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="color:#888;">$</span>
                    <input type="number" id="combos-budget-filter-input"
                           value="${this.budgetFilter || ''}"
                           placeholder="ex: 50, 100, 500..."
                           style="width:100px;padding:8px 12px;background:rgba(0,0,0,0.3);border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;"
                           onchange="CombosModule.applyBudgetFilter(this.value)"
                           onkeyup="if(event.key==='Enter')CombosModule.applyBudgetFilter(this.value)">
                    <button onclick="CombosModule.applyBudgetFilter(document.getElementById('combos-budget-filter-input').value)"
                            style="padding:8px 16px;background:linear-gradient(135deg,#00ff88,#00d4aa);border:none;border-radius:6px;color:#000;font-weight:600;cursor:pointer;">
                        🔍 ${t('filter', 'Filtrer')}
                    </button>
                    ${this.budgetFilter ? `
                    <button onclick="CombosModule.clearBudgetFilter()"
                            style="padding:8px 12px;background:rgba(255,100,100,0.2);border:1px solid rgba(255,100,100,0.3);border-radius:6px;color:#ff6464;cursor:pointer;">
                        ✕
                    </button>
                    ` : ''}
                </div>
                ${this.budgetFilter ? `
                <span style="color:#00ff88;font-size:13px;margin-left:auto;">
                    ✓ ${t('showing_products_under', 'Combos avec min')} ≤ $${this.budgetFilter}
                </span>
                ` : ''}
            </div>

            <!-- Sort Controls -->
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;padding:10px 16px;background:rgba(255,255,255,0.03);border-radius:8px;">
                <span style="color:#888;font-size:13px;">${t('sort_by', 'Trier par')}:</span>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="combo-sort-btn ${this.sortBy === 'minInvestment' ? 'active' : ''}" data-sort="minInvestment"
                            onclick="CombosModule.setSort('minInvestment')"
                            style="padding:6px 12px;border-radius:6px;border:1px solid ${this.sortBy === 'minInvestment' ? '#00ff88' : '#333'};background:${this.sortBy === 'minInvestment' ? 'rgba(0,255,136,0.15)' : 'transparent'};color:${this.sortBy === 'minInvestment' ? '#00ff88' : '#888'};cursor:pointer;font-size:12px;">
                        ${t('minimum', 'Minimum')} ${this.sortBy === 'minInvestment' ? (this.sortDir === 'desc' ? '↓' : '↑') : ''}
                    </button>
                    <button class="combo-sort-btn ${this.sortBy === 'expectedApy' ? 'active' : ''}" data-sort="expectedApy"
                            onclick="CombosModule.setSort('expectedApy')"
                            style="padding:6px 12px;border-radius:6px;border:1px solid ${this.sortBy === 'expectedApy' ? '#00ff88' : '#333'};background:${this.sortBy === 'expectedApy' ? 'rgba(0,255,136,0.15)' : 'transparent'};color:${this.sortBy === 'expectedApy' ? '#00ff88' : '#888'};cursor:pointer;font-size:12px;">
                        APY ${this.sortBy === 'expectedApy' ? (this.sortDir === 'desc' ? '↓' : '↑') : ''}
                    </button>
                    <button class="combo-sort-btn ${this.sortBy === 'capitalProtection' ? 'active' : ''}" data-sort="capitalProtection"
                            onclick="CombosModule.setSort('capitalProtection')"
                            style="padding:6px 12px;border-radius:6px;border:1px solid ${this.sortBy === 'capitalProtection' ? '#00ff88' : '#333'};background:${this.sortBy === 'capitalProtection' ? 'rgba(0,255,136,0.15)' : 'transparent'};color:${this.sortBy === 'capitalProtection' ? '#00ff88' : '#888'};cursor:pointer;font-size:12px;">
                        ${t('protection', 'Protection')} ${this.sortBy === 'capitalProtection' ? (this.sortDir === 'desc' ? '↓' : '↑') : ''}
                    </button>
                    <button class="combo-sort-btn ${this.sortBy === 'riskLevel' ? 'active' : ''}" data-sort="riskLevel"
                            onclick="CombosModule.setSort('riskLevel')"
                            style="padding:6px 12px;border-radius:6px;border:1px solid ${this.sortBy === 'riskLevel' ? '#00ff88' : '#333'};background:${this.sortBy === 'riskLevel' ? 'rgba(0,255,136,0.15)' : 'transparent'};color:${this.sortBy === 'riskLevel' ? '#00ff88' : '#888'};cursor:pointer;font-size:12px;">
                        ${t('risk', 'Risque')} ${this.sortBy === 'riskLevel' ? (this.sortDir === 'desc' ? '↓' : '↑') : ''}
                    </button>
                </div>
            </div>
        `;

        // Filter by risk level
        let filtered = filter === 'all'
            ? this.combos
            : this.combos.filter(c => c.riskLevel === filter || c.riskLevel.includes(filter));

        // Apply budget filter and sort
        filtered = this.filterAndSortCombos(filtered);

        console.log("[Combos] Rendering", filtered.length, "combos, sortBy:", this.sortBy, "sortDir:", this.sortDir);
        console.log("[Combos] First 3 combos:", filtered.slice(0,3).map(c => c.id + ':$' + c.minInvestment));

        try {
            grid.innerHTML = filtered.map(combo => this.renderComboCard(combo)).join('');

            // Re-apply translations after rendering
            if (typeof I18n !== 'undefined' && I18n.translatePage) {
                setTimeout(() => I18n.translatePage(), 100);
            }
        } catch(e) {
            console.error('[Combos] RENDER ERROR:', e);
            grid.innerHTML = '<p style="color:red;">Error: ' + e.message + '</p>';
        }
    },

    // Filter and sort combos
    filterAndSortCombos(combos) {
        const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 };

        // Apply budget filter
        let filtered = [...combos];
        if (this.budgetFilter) {
            filtered = filtered.filter(c => c.minInvestment <= this.budgetFilter);
        }

        // Sort
        return filtered.sort((a, b) => {
            let aVal, bVal;

            switch(this.sortBy) {
                case 'minInvestment':
                    aVal = a.minInvestment || 0;
                    bVal = b.minInvestment || 0;
                    break;
                case 'expectedApy':
                    // Parse APY range like "5-12%" to get max value
                    aVal = parseFloat((a.expectedApy || '0').split('-').pop());
                    bVal = parseFloat((b.expectedApy || '0').split('-').pop());
                    break;
                case 'capitalProtection':
                    aVal = parseFloat(a.capitalProtection) || 0;
                    bVal = parseFloat(b.capitalProtection) || 0;
                    break;
                case 'riskLevel':
                    aVal = riskOrder[a.riskLevel] || 2;
                    bVal = riskOrder[b.riskLevel] || 2;
                    break;
                default:
                    aVal = a.minInvestment || 0;
                    bVal = b.minInvestment || 0;
            }

            return this.sortDir === 'desc' ? bVal - aVal : aVal - bVal;
        });
    },

    // Set sort field and toggle direction
    setSort(field) {
        if (this.sortBy === field) {
            this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
        } else {
            this.sortBy = field;
            this.sortDir = field === 'minInvestment' ? 'asc' : 'desc';
        }
        this.render();
    },

    // Apply budget filter
    applyBudgetFilter(value) {
        const budget = parseFloat(value);
        if (isNaN(budget) || budget <= 0) {
            this.budgetFilter = null;
        } else {
            this.budgetFilter = budget;
            this.sortBy = 'minInvestment';
            this.sortDir = 'asc';
        }
        this.render();
    },

    // Clear budget filter
    clearBudgetFilter() {
        this.budgetFilter = null;
        this.sortBy = 'minInvestment';
        this.sortDir = 'asc';
        this.render();
    },

    // Refresh real balance from wallet
    async refreshRealBalance() {
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.refreshRealBalance) {
            await SimulatedPortfolio.refreshRealBalance();
            this.render();
        } else if (typeof WalletConnect !== 'undefined' && WalletConnect.fetchAndUpdateUSDCBalance) {
            await WalletConnect.fetchAndUpdateUSDCBalance();
            this.render();
        }
    },

    // Helper to auto-translate combo descriptions
    translateDescription(text) {
        if (typeof I18n === 'undefined' || I18n.currentLang === 'en') return text;

        const translations = {
            fr: {
                // Common words
                'strategy': 'stratégie',
                'portfolio': 'portefeuille',
                'investment': 'investissement',
                'growth': 'croissance',
                'yield': 'rendement',
                'income': 'revenu',
                'diversified': 'diversifié',
                'balanced': 'équilibré',
                'conservative': 'conservateur',
                'aggressive': 'agressif',
                'stable': 'stable',
                'high': 'élevé',
                'low': 'faible',
                'medium': 'moyen',
                'risk': 'risque',
                'protection': 'protection',
                'maximum': 'maximum',
                'minimum': 'minimum',
                'entry-level': 'niveau débutant',
                'beginner': 'débutant',
                'advanced': 'avancé',
                'professional': 'professionnel',
                'weekly': 'hebdomadaire',
                'daily': 'quotidien',
                'monthly': 'mensuel',
                'your': 'votre',
                'first': 'premier',
                'crypto': 'crypto',
                'wealth': 'patrimoine',
                'savings': 'épargne',
                'accumulation': 'accumulation',
                'long-term': 'long terme',
                'short-term': 'court terme',
                // Phrases
                'Entry-level growth strategy': 'Stratégie de croissance débutant',
                'Skip one coffee, grow your wealth': 'Un café en moins, un patrimoine en plus',
                'Invest your lunch savings': 'Investissez vos économies du déjeuner',
                'Round-up your purchases into crypto': 'Arrondissez vos achats en crypto',
                'Your very first crypto investment': 'Votre tout premier investissement crypto',
                'Better than your bank': 'Mieux que votre banque',
                'Your first crypto portfolio': 'Votre premier portefeuille crypto',
                'Safe, simple, and educational': 'Sûr, simple et éducatif',
                'Start your Bitcoin journey': 'Commencez votre aventure Bitcoin',
                'Simple BTC accumulation strategy': 'Stratégie simple d\'accumulation BTC',
                'Daily micro-investment strategy': 'Stratégie de micro-investissement quotidien',
                'Maximum diversification': 'Diversification maximale',
                'Momentum strategy': 'Stratégie momentum',
                'active weekend traders': 'traders actifs du weekend'
            },
            es: {
                'strategy': 'estrategia',
                'portfolio': 'cartera',
                'investment': 'inversión',
                'growth': 'crecimiento',
                'yield': 'rendimiento'
            },
            de: {
                'strategy': 'Strategie',
                'portfolio': 'Portfolio',
                'investment': 'Investition',
                'growth': 'Wachstum',
                'yield': 'Rendite'
            }
        };

        const langTrans = translations[I18n.currentLang];
        if (!langTrans) return text;

        // First try to match full phrases
        let result = text;
        for (const [en, trans] of Object.entries(langTrans)) {
            if (en.length > 10 && result.includes(en)) {
                result = result.replace(new RegExp(en, 'gi'), trans);
            }
        }

        // Then translate individual words if language is French
        if (I18n.currentLang === 'fr') {
            for (const [en, trans] of Object.entries(langTrans)) {
                if (en.length <= 10) {
                    result = result.replace(new RegExp('\\b' + en + '\\b', 'gi'), trans);
                }
            }
        }

        return result;
    },

    // Helper to translate risk levels
    getRiskLabel(level) {
        const riskKeys = {
            'Low': 'risk_low',
            'Medium': 'risk_medium',
            'High': 'risk_high',
            'Very High': 'risk_very_high',
            'Very Low': 'risk_very_low'
        };
        const key = riskKeys[level] || 'risk_medium';
        return (typeof I18n !== 'undefined' ? I18n.t(key) : level + ' Risk');
    },

    // Calculate CAGR projections for $100 investment
    calculateProjections(combo) {
        // Parse APY range (e.g., "15-25%" -> average 20%)
        const apyStr = combo.expectedApy || '10%';
        const apyMatch = apyStr.match(/(\d+)(?:-(\d+))?/);
        let avgApy = 10;
        if (apyMatch) {
            const low = parseFloat(apyMatch[1]);
            const high = apyMatch[2] ? parseFloat(apyMatch[2]) : low;
            avgApy = (low + high) / 2;
        }

        // Calculate compound growth for $100
        const base = 100;
        const rate = avgApy / 100;

        return {
            apy: avgApy,
            year1: Math.round(base * Math.pow(1 + rate, 1)),
            year5: Math.round(base * Math.pow(1 + rate, 5)),
            year10: Math.round(base * Math.pow(1 + rate, 10))
        };
    },

    // Get invested amounts for a combo (simulated and real)
    getComboInvestments(comboId) {
        if (typeof SimulatedPortfolio === 'undefined' || !SimulatedPortfolio.portfolio?.investments) {
            return { simulated: 0, real: 0 };
        }
        const productId = 'combo-' + comboId;
        let simulated = 0;
        let real = 0;
        SimulatedPortfolio.portfolio.investments.forEach(inv => {
            if (inv.productId === productId) {
                if (inv.isSimulated) {
                    simulated += inv.amount + (inv.earnings || 0);
                } else {
                    real += inv.amount + (inv.earnings || 0);
                }
            }
        });
        return { simulated, real };
    },

    /**
     * Calculate risk score 0-100 based on capital protection and max loss
     * 0 = safest, 100 = riskiest
     *
     * RISK LEVELS GUIDE:
     * - 0-15:  Très sûr - Capital quasi garanti, faible rendement
     * - 16-30: Sûr - Bon équilibre risque/rendement
     * - 31-50: Modéré - Rendement potentiel élevé mais risques notables
     * - 51-70: DÉCONSEILLÉ - Probabilité de perte > probabilité de gain
     * - 71-100: DANGER - Quasi casino, pertes quasi certaines à long terme
     *
     * ⚠️ AU-DELÀ DE 50%: Le risque dépasse statistiquement le gain espéré.
     * Sur 100 investissements identiques, vous perdrez plus que vous ne gagnerez.
     */
    calculateRiskScore(combo) {
        // Get capital protection percentage (e.g., "95%" -> 95)
        const protMatch = combo.capitalProtection?.match(/(\d+)/);
        const capitalProtection = protMatch ? parseInt(protMatch[1]) : 80;

        // Calculate weighted average max loss from allocations
        let weightedMaxLoss = 0;
        if (combo.allocation) {
            combo.allocation.forEach(a => {
                weightedMaxLoss += (a.percent / 100) * (a.maxLoss || 0);
            });
        }

        // Risk score = 100 - protection + (weighted max loss / 2)
        // Clamped to 0-100
        const rawScore = (100 - capitalProtection) + (weightedMaxLoss / 2);
        return Math.min(100, Math.max(0, Math.round(rawScore)));
    },

    /**
     * Get risk color based on score 0-100
     *
     * COLOR CODE:
     * - Green (#00ffaa, #00ff88): Safe investments, recommended
     * - Orange (#ffaa00): Moderate risk, proceed with caution
     * - Dark Orange (#ff8800): High risk, NOT RECOMMENDED (>50% = perte > gain)
     * - Red (#ff4444): Extreme risk, AVOID (gambling territory)
     */
    getRiskScoreColor(score) {
        if (score <= 15) return '#00ffaa';      // Très sûr (vert vif)
        if (score <= 30) return '#00ff88';      // Sûr (vert)
        if (score <= 50) return '#ffaa00';      // Modéré (orange) - limite acceptable
        if (score <= 70) return '#ff8800';      // DÉCONSEILLÉ (orange foncé) - perte > gain
        return '#ff4444';                       // DANGER (rouge) - quasi casino
    },

    /**
     * Check if risk score is acceptable (<=50)
     * Above 50% = statistical expected loss exceeds expected gain
     */
    isRiskAcceptable(score) {
        return score <= 50;
    },

    renderComboCard(combo) {
        // Calculate risk score 0-100, display as /10
        const riskScore100 = this.calculateRiskScore(combo);
        const riskScore = Math.round(riskScore100 / 10 * 10) / 10; // 0-10 scale, 1 decimal
        const riskScoreColor = this.getRiskScoreColor(riskScore100);
        const isAcceptable = this.isRiskAcceptable(riskScore100);

        // Check fallback status
        const fallbackInfo = this.buildFallbackAllocation(combo);
        const hasFallbacks = fallbackInfo.hasFallbacks;

        const riskColors = {
            'Low': '#00ff88',
            'Medium': '#ffaa00',
            'High': '#ff6464',
            'Very High': '#ff3333',
            'Very Low': '#00ffaa'
        };
        const riskColor = riskColors[combo.riskLevel] || '#888';
        const riskLabel = this.getRiskLabel(combo.riskLevel);

        // Calculate projections
        const proj = this.calculateProjections(combo);

        // Get user's investments in this combo
        const invested = this.getComboInvestments(combo.id);

        // Get translated name and description
        const t = (key, fallback) => {
            if (typeof I18n !== 'undefined' && I18n.t) {
                const result = I18n.t(key);
                // If translation returns the key itself, use fallback
                return (result === key) ? fallback : result;
            }
            return fallback;
        };

        // Generate translation key from combo ID
        const comboId = combo.id.toLowerCase();
        const comboNameKey = 'combo_' + comboId;
        const comboDescKey = comboNameKey + '_desc';

        // Debug translation lookup
        console.log('[Combo] ID:', comboId, 'Key:', comboNameKey, 'Lang:', typeof I18n !== 'undefined' ? I18n.currentLang : 'N/A');

        const comboNameRaw = t(comboNameKey, combo.name);
        const comboDescRaw = t(comboDescKey, combo.description);
        // If i18n key returned the English fallback, auto-translate it
        const comboName = (comboNameRaw === combo.name) ? this.translateDescription(comboNameRaw) : comboNameRaw;
        const comboDesc = (comboDescRaw === combo.description) ? this.translateDescription(comboDescRaw) : comboDescRaw;
        const investLabel = t('combo_invest', 'Investir');
        const detailsLabel = t('combo_details', 'Détails');
        const yearLabel = t('year', 'an');
        const yearsLabel = t('years', 'ans');
        const projectionLabel = t('projection_100', '$100 → Projection');

        return `
            <div data-id="${combo.id}" style="background:linear-gradient(145deg,#1a1a2e,#0d0d1a);border:1px solid #333;border-radius:12px;padding:14px;transition:all 0.3s;cursor:pointer;" onmouseover="this.style.borderColor='#00d4aa';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#333';this.style.transform='translateY(0)'">

                <!-- Header -->
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <span style="font-size:1.6rem;">${combo.icon}</span>
                    <div style="flex:1;">
                        <h3 style="color:#fff;margin:0;font-size:1rem;">${comboName}</h3>
                        <div style="display:flex;align-items:center;gap:6px;margin-top:3px;">
                            <span style="color:${riskColor};font-size:0.75rem;border:1px solid ${riskColor};padding:1px 6px;border-radius:10px;">${riskLabel}</span>
                            <span style="color:${riskScoreColor};font-size:0.7rem;font-weight:bold;background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:6px;" title="Score de risque sur 10">${riskScore}/10</span>
                            ${!isAcceptable ? '<span style="color:#ff4444;font-size:0.65rem;" title="Risque > 50% = perte statistique probable">⚠️</span>' : ''}
                        </div>
                    </div>
                </div>

                <p style="color:#888;font-size:0.8rem;margin-bottom:10px;line-height:1.3;">${comboDesc}</p>

                ${!isAcceptable ? `
                <!-- HIGH RISK WARNING -->
                <div style="background:rgba(255,68,68,0.15);border:1px solid #ff4444;border-radius:8px;padding:8px;margin-bottom:10px;">
                    <div style="color:#ff4444;font-size:0.7rem;text-align:center;">
                        ⚠️ <strong>DÉCONSEILLÉ</strong> - Risque ${riskScore}/10 (élevé)<br>
                        <span style="font-size:0.65rem;color:#ff8888;">Statistiquement, vous perdrez plus que vous ne gagnerez</span>
                    </div>
                </div>
                ` : ''}

                ${hasFallbacks ? `
                <!-- FALLBACK ACTIVE BANNER -->
                <div style="background:rgba(245,158,11,0.15);border:1px solid #f59e0b;border-radius:8px;padding:8px;margin-bottom:10px;">
                    <div style="color:#f59e0b;font-size:0.7rem;text-align:center;">
                        🔄 <strong>FALLBACK ACTIF</strong> - ${fallbackInfo.warnings.length} redirection(s)<br>
                        <span style="font-size:0.65rem;color:#fbbf24;">${fallbackInfo.warnings.map(w => w.split(':')[0]).join(', ')}</span>
                    </div>
                </div>
                ` : ''}

                ${(invested.simulated > 0 || invested.real > 0) ? `
                <!-- Your Investments -->
                <div style="background:linear-gradient(135deg,rgba(0,212,170,0.15),rgba(138,43,226,0.15));border:1px solid #00d4aa;border-radius:8px;padding:8px 10px;margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;">
                        <span style="color:#00d4aa;font-weight:600;">💼 Investi:</span>
                        <div style="display:flex;gap:10px;">
                            ${invested.simulated > 0 ? `<span style="color:#a855f7;">🎮 $${invested.simulated.toFixed(2)}</span>` : ''}
                            ${invested.real > 0 ? `<span style="color:#00ff88;">💰 $${invested.real.toFixed(2)}</span>` : ''}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px;">
                    <div style="text-align:center;">
                        <div style="color:#00ff88;font-size:0.95rem;font-weight:600;">${combo.expectedApy}</div>
                        <div style="color:#666;font-size:0.65rem;">APY</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#4a9eff;font-size:0.95rem;font-weight:600;">${combo.capitalProtection}</div>
                        <div style="color:#666;font-size:0.65rem;">Protection</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="color:#fff;font-size:0.95rem;font-weight:600;">$${combo.minInvestment}</div>
                        <div style="color:#666;font-size:0.65rem;">Min</div>
                    </div>
                </div>

                <!-- CAGR Projections (compact) -->
                <div style="background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.15);border-radius:8px;padding:8px;margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;text-align:center;">
                        <div style="flex:1;">
                            <div style="color:#00d4aa;font-size:0.85rem;font-weight:700;">$${proj.year1 || 0}</div>
                            <div style="color:#666;font-size:0.55rem;">1${yearLabel}</div>
                        </div>
                        <div style="flex:1;">
                            <div style="color:#00ff88;font-size:0.85rem;font-weight:700;">$${proj.year5 || 0}</div>
                            <div style="color:#666;font-size:0.55rem;">5${yearsLabel}</div>
                        </div>
                        <div style="flex:1;">
                            <div style="color:#00ffaa;font-size:0.85rem;font-weight:700;">$${(proj.year10 || 0) >= 1000 ? ((proj.year10 || 0)/1000).toFixed(1) + 'K' : (proj.year10 || 0)}</div>
                            <div style="color:#666;font-size:0.55rem;">10${yearsLabel}</div>
                        </div>
                    </div>
                </div>

                <!-- Allocation Bar (compact) -->
                <div style="margin-bottom:10px;">
                    <div style="display:flex;height:6px;border-radius:3px;overflow:hidden;">
                        ${combo.allocation.map(a => `<div style="width:${a.percent}%;background:${a.color};"></div>`).join('')}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
                        ${combo.allocation.slice(0,3).map(a => `<span style="font-size:0.6rem;color:#888;"><span style="color:${a.color};">●</span>${a.percent}%</span>`).join('')}
                    </div>
                </div>

                <!-- Actions (compact) -->
                <div style="display:flex;gap:6px;">
                    <button onclick="CombosModule.openInvestModal('${combo.id}')" style="flex:1;padding:10px;border-radius:6px;border:none;background:linear-gradient(135deg,#00d4aa,#00a884);color:#fff;font-weight:600;font-size:0.85rem;cursor:pointer;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        ${investLabel}
                    </button>
                    <button onclick="CombosModule.showDetails('${combo.id}')" style="padding:10px 10px;border-radius:6px;border:1px solid #333;background:transparent;color:#888;font-size:0.85rem;cursor:pointer;" onmouseover="this.style.borderColor='#00d4aa';this.style.color='#00d4aa'" onmouseout="this.style.borderColor='#333';this.style.color='#888'">
                        ${detailsLabel}
                    </button>
                    <button onclick="verifyComboInvestment('${combo.id}')" style="padding:10px;border-radius:6px;border:1px solid #ffaa00;background:transparent;color:#ffaa00;font-size:0.85rem;cursor:pointer;" onmouseover="this.style.background='rgba(255,170,0,0.1)'" onmouseout="this.style.background='transparent'" title="Vérifier investissement">
                        🔍
                    </button>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.combo-filter, [data-risk]').forEach(btn => {
            if (btn.closest('#comboFilters')) {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.combo-filter').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const risk = e.target.dataset.risk;
                    this.render(risk);
                });
            }
        });

        // Amount input change
        const amountInput = document.getElementById('comboInvestAmount');
        if (amountInput) {
            amountInput.addEventListener('input', () => this.updatePreview());
        }
    },

    openInvestModal(comboId) {
        this.selectedCombo = this.combos.find(c => c.id === comboId);
        if (!this.selectedCombo) return;

        const modal = document.getElementById('comboInvestModal');
        const title = document.getElementById('modalComboTitle');
        const amountInput = document.getElementById('comboInvestAmount');

        const lang = (typeof I18n !== 'undefined') ? I18n.currentLang : 'en';
        const investIn = lang === 'fr' ? 'Investir dans' : lang === 'es' ? 'Invertir en' : lang === 'de' ? 'Investieren in' : 'Invest in';
        const comboNameKey = 'combo_' + this.selectedCombo.id.toLowerCase();
        const tFn = (key, fallback) => (typeof I18n !== 'undefined' && I18n.t && I18n.t(key) !== key) ? I18n.t(key) : this.translateDescription(fallback);
        title.textContent = investIn + ' ' + tFn(comboNameKey, this.selectedCombo.name);
        amountInput.value = this.selectedCombo.minInvestment;
        modal.style.display = 'flex';

        // Update current position display
        this.updatePositionDisplay();

        this.updatePreview();
    },

    updatePositionDisplay() {
        if (!this.selectedCombo) return;

        const invested = this.getComboInvestments(this.selectedCombo.id);
        const formatBal = (val) => {
            const safe = Number.isFinite(parseFloat(val)) ? parseFloat(val) : 0;
            return safe >= 1000 ? `$${(safe/1000).toFixed(1)}K` : `$${safe.toFixed(2)}`;
        };

        // Update position badges
        const simPos = document.getElementById('comboSimPosition');
        const realPos = document.getElementById('comboRealPosition');
        if (simPos) simPos.textContent = formatBal(invested.simulated);
        if (realPos) realPos.textContent = formatBal(invested.real);

        // Update withdraw buttons
        const btnWithdrawSim = document.getElementById('btnWithdrawComboSim');
        const btnWithdrawReal = document.getElementById('btnWithdrawComboReal');
        const simAmt = document.getElementById('comboWithdrawSimAmt');
        const realAmt = document.getElementById('comboWithdrawRealAmt');

        if (simAmt) {
            simAmt.textContent = invested.simulated > 0 ? `(${formatBal(invested.simulated)})` : '(vide)';
        }
        if (realAmt) {
            realAmt.textContent = invested.real > 0 ? `(${formatBal(invested.real)})` : '(vide)';
        }

        if (btnWithdrawSim) {
            btnWithdrawSim.disabled = invested.simulated <= 0;
            btnWithdrawSim.style.opacity = invested.simulated > 0 ? '1' : '0.4';
            btnWithdrawSim.style.cursor = invested.simulated > 0 ? 'pointer' : 'not-allowed';
        }
        if (btnWithdrawReal) {
            btnWithdrawReal.disabled = invested.real <= 0;
            btnWithdrawReal.style.opacity = invested.real > 0 ? '1' : '0.4';
            btnWithdrawReal.style.cursor = invested.real > 0 ? 'pointer' : 'not-allowed';
        }
    },

    async executeWithdraw(isSimulated = true) {
        if (!this.selectedCombo) {
            console.error('[Combos] No combo selected for withdrawal');
            return;
        }

        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');
        const comboId = this.selectedCombo.id;
        const invested = this.getComboInvestments(comboId);
        const amount = isSimulated ? invested.simulated : invested.real;

        if (amount <= 0) {
            const msg = isFr ? 'Aucun investissement à retirer' : 'No investment to withdraw';
            if (typeof showNotification === "function") showNotification(msg, "error");
            return;
        }

        console.log("[Combos] Withdrawing from", this.selectedCombo.name, "isSimulated:", isSimulated, "amount:", amount);

        // Find and withdraw from SimulatedPortfolio
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.portfolio?.investments) {
            const invIndex = SimulatedPortfolio.portfolio.investments.findIndex(inv =>
                (inv.productId === 'combo-' + comboId) &&
                inv.isSimulated === isSimulated
            );

            if (invIndex >= 0) {
                const inv = SimulatedPortfolio.portfolio.investments[invIndex];
                const totalValue = inv.amount + (inv.earned || 0);

                SimulatedPortfolio.withdraw(inv.id);

                const emoji = isSimulated ? '🎮' : '💎';
                const typeLabel = isSimulated ? (isFr ? 'SIMULÉ' : 'SIMULATED') : (isFr ? 'RÉEL' : 'REAL');
                const comboDisplayName = this.translateDescription(this.selectedCombo.name);
                const msg = isFr
                    ? `${emoji} Retiré $${totalValue.toFixed(2)} de ${comboDisplayName} (${typeLabel})`
                    : `${emoji} Withdrew $${totalValue.toFixed(2)} from ${comboDisplayName} (${typeLabel})`;

                if (typeof showNotification === "function") showNotification(msg, "success");

                // Update display
                this.updatePositionDisplay();
                this.render();
                this.closeModal();
                return;
            }
        }

        const msg = isFr ? 'Position non trouvée' : 'Position not found';
        if (typeof showNotification === "function") showNotification(msg, "error");
    },

    closeModal() {
        const modal = document.getElementById('comboInvestModal');
        if (modal) modal.style.display = 'none';
        this.selectedCombo = null;
    },

    updatePreview() {
        const preview = document.getElementById('comboInvestPreview');
        const amountInput = document.getElementById('comboInvestAmount');
        if (!preview || !amountInput || !this.selectedCombo) return;

        const amount = parseFloat(amountInput.value) || 0;
        const combo = this.selectedCombo;

        if (amount < combo.minInvestment) {
            preview.innerHTML = `<p style="color:#ff6464;text-align:center;">Minimum: ${combo.minInvestment}</p>`;
            return;
        }

        const apyMin = parseFloat(combo.expectedApy.split('-')[0]);
        const apyMax = parseFloat(combo.expectedApy.split('-')[1] || apyMin);
        const yearlyMin = (amount * apyMin / 100);
        const yearlyMax = (amount * apyMax / 100);

        // Protection et perte potentielle
        const protectionPercent = parseFloat(combo.capitalProtection);
        const maxLossPercent = 100 - protectionPercent;
        const protectedAmount = amount * protectionPercent / 100;
        const maxLossAmount = amount * maxLossPercent / 100;

        // Scénarios
        const bestCase = amount + yearlyMax;
        const expectedCase = amount + (yearlyMin + yearlyMax) / 2;
        const worstCase = protectedAmount;

        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');
        preview.innerHTML = `
            <!-- Scénarios 12 mois -->
            <div style="margin-bottom:10px;">
                <div style="color:#888;font-size:10px;text-transform:uppercase;margin-bottom:6px;">${isFr ? 'Scénarios sur 12 mois' : '12-month scenarios'}</div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:0.85rem;">
                    <div style="text-align:center;background:rgba(0,255,136,0.1);border-radius:6px;padding:8px;">
                        <div style="color:#888;font-size:10px;">🚀 ${isFr ? 'Optimiste' : 'Best'}</div>
                        <div style="color:#00ff88;font-weight:600;">$${bestCase.toFixed(0)}</div>
                    </div>
                    <div style="text-align:center;background:rgba(255,170,0,0.1);border-radius:6px;padding:8px;">
                        <div style="color:#888;font-size:10px;">📊 ${isFr ? 'Moyen' : 'Expected'}</div>
                        <div style="color:#ffaa00;font-weight:600;">$${expectedCase.toFixed(0)}</div>
                    </div>
                    <div style="text-align:center;background:rgba(255,100,100,0.1);border-radius:6px;padding:8px;">
                        <div style="color:#888;font-size:10px;">⚠️ ${isFr ? 'Pire cas' : 'Worst'}</div>
                        <div style="color:#ff6464;font-weight:600;">$${worstCase.toFixed(0)}</div>
                    </div>
                </div>
            </div>

            <!-- Barre protection -->
            <div style="background:linear-gradient(90deg,#00d4aa33 ${protectionPercent}%,#ff646433 ${protectionPercent}%);border-radius:6px;padding:8px 12px;font-size:0.8rem;">
                <div style="display:flex;justify-content:space-between;">
                    <div>
                        <span style="color:#888;font-size:10px;">🛡️ ${isFr ? 'Capital protégé' : 'Protected'}</span>
                        <div style="color:#00d4aa;font-weight:600;">$${protectedAmount.toFixed(0)}</div>
                    </div>
                    <div style="text-align:right;">
                        <span style="color:#888;font-size:10px;">⚡ ${isFr ? 'Perte max' : 'Max loss'}</span>
                        <div style="color:#ff6464;font-weight:600;">-$${maxLossAmount.toFixed(0)}</div>
                    </div>
                </div>
            </div>
        `;
    },

    // Open buy with card modal
    openBuyWithCard() {
        if (!this.selectedCombo) return;
        const amountInput = document.getElementById('comboInvestAmount');
        const amount = parseFloat(amountInput?.value) || 0;

        if (typeof FiatOnRamp !== 'undefined') {
            FiatOnRamp.showModal(amount);
        } else {
            alert('Module de paiement non disponible');
        }
    },

    async executeInvest(isSimulated = true) {
        const amountInput = document.getElementById('comboInvestAmount');
        const amount = parseFloat(amountInput?.value) || 0;
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        if (!this.selectedCombo || amount < this.selectedCombo.minInvestment) {
            const msg = isFr ? 'Montant insuffisant (min: $' + this.selectedCombo.minInvestment + ')' : 'Insufficient amount (min: $' + this.selectedCombo.minInvestment + ')';
            if (typeof showNotification === "function") showNotification(msg, "error");
            else alert(msg);
            return;
        }

        console.log("[Combos] Investing", amount, "in", this.selectedCombo.name, "isSimulated:", isSimulated);

        // Security check with fallback: if some protocols are unsafe, redistribute
        const fallbackResult = this.buildFallbackAllocation(this.selectedCombo);

        if (fallbackResult.hasFallbacks) {
            if (fallbackResult.fullFallback) {
                const secMsg = isFr
                    ? 'Tous les protocoles de ce combo sont indisponibles. Fonds redirigés en USDC Safe Haven.'
                    : 'All protocols in this combo are unavailable. Funds redirected to USDC Safe Haven.';
                if (typeof showNotification === 'function') showNotification(secMsg, 'warning');

                this.reportIncident('critical', 'investment_full_fallback', {
                    comboId: this.selectedCombo.id,
                    comboName: this.selectedCombo.name,
                    amount,
                    message: 'Full fallback to USDC Safe Haven during investment',
                    warnings: fallbackResult.warnings
                });
            } else {
                const redirections = fallbackResult.warnings.map(w => '  • ' + w).join('\n');
                const secMsg = isFr
                    ? 'Certains protocoles sont indisponibles. Allocation ajustée:\n' + redirections
                    : 'Some protocols are unavailable. Allocation adjusted:\n' + redirections;
                if (typeof showNotification === 'function') showNotification(secMsg, 'warning');

                this.reportIncident('warning', 'investment_partial_fallback', {
                    comboId: this.selectedCombo.id,
                    comboName: this.selectedCombo.name,
                    amount,
                    message: `${fallbackResult.warnings.length} allocation(s) redirected during investment`,
                    redirections: fallbackResult.warnings
                });
            }

            // Use the fallback allocation for this investment
            this.selectedCombo = {
                ...this.selectedCombo,
                allocation: fallbackResult.allocation,
                _hasFallbacks: true,
                _fallbackWarnings: fallbackResult.warnings
            };
        }

        // For REAL investments, use DeFi protocols
        if (!isSimulated && typeof DeFiManager !== 'undefined') {
            console.log("[Combos] Attempting REAL DeFi investment via DeFiManager");

            // Map combo risk to DeFi protocol
            const protocolMap = {
                'Low': 'aave-usdc',      // Conservative -> Aave lending
                'Medium': 'gmx-glp',     // Balanced -> GMX GLP
                'High': 'aerodrome-usdc-eth' // Aggressive -> Aerodrome LP
            };

            const protocolId = protocolMap[this.selectedCombo.riskLevel] || 'aave-usdc';

            // Verify DeFi health first
            if (typeof DeFiHealthCheck !== 'undefined') {
                const quick = DeFiHealthCheck.quickCheck();
                if (!quick.ethers) {
                    const msg = isFr ? '❌ ethers.js non chargé - impossible investir réel' : '❌ ethers.js not loaded - cannot invest real';
                    if (typeof showNotification === "function") showNotification(msg, "error");
                    return;
                }
                if (!quick.wallet) {
                    const msg = isFr ? '❌ Connectez votre wallet pour investir réel' : '❌ Connect your wallet for real investment';
                    if (typeof showNotification === "function") showNotification(msg, "error");
                    return;
                }
            }

            // Check wallet connection
            if (typeof window.ethereum === 'undefined') {
                const msg = isFr ? '❌ Installez MetaMask pour investir réel' : '❌ Install MetaMask for real investment';
                if (typeof showNotification === "function") showNotification(msg, "error");
                return;
            }

            try {
                // Request wallet connection
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (!accounts || accounts.length === 0) {
                    const msg = isFr ? '❌ Wallet non connecté' : '❌ Wallet not connected';
                    if (typeof showNotification === "function") showNotification(msg, "error");
                    return;
                }

                // Show processing notification
                if (typeof showNotification === "function") {
                    showNotification(isFr ? '⏳ Transaction en cours...' : '⏳ Processing transaction...', "info");
                }

                // Execute real DeFi investment
                const result = await DeFiManager.invest(protocolId, amount, false);

                if (result.success) {
                    console.log("[Combos] Real DeFi investment SUCCESS:", result);
                    const msg = isFr
                        ? `💎 $${amount} investi RÉEL dans ${result.message || protocolId}`
                        : `💎 $${amount} invested REAL in ${result.message || protocolId}`;
                    if (typeof showNotification === "function") showNotification(msg, "success");

                    // Track in SimulatedPortfolio for display (use trackDeFiInvestment for on-chain)
                    if (typeof SimulatedPortfolio !== "undefined" && SimulatedPortfolio.trackDeFiInvestment) {
                        const apyStr = this.selectedCombo.expectedApy || "10-15%";
                        const apyMatch = apyStr.match(/([0-9]+)/);
                        const apy = apyMatch ? parseFloat(apyMatch[1]) : 10;
                        SimulatedPortfolio.trackDeFiInvestment("combo-" + this.selectedCombo.id, this.selectedCombo.name, amount, apy, "combo", result.txHash);
                        console.log("[Combos] DeFi investment tracked in portfolio");
                    }

                    // Refresh combo cards to show investment
                    this.render();
                } else {
                    console.error("[Combos] Real DeFi investment FAILED:", result);
                    const msg = isFr
                        ? `❌ Échec: ${result.error || 'Erreur inconnue'}`
                        : `❌ Failed: ${result.error || 'Unknown error'}`;
                    if (typeof showNotification === "function") showNotification(msg, "error");
                    return;
                }
            } catch (err) {
                console.error("[Combos] DeFi investment error:", err);
                const msg = isFr ? `❌ Erreur: ${err.message}` : `❌ Error: ${err.message}`;
                if (typeof showNotification === "function") showNotification(msg, "error");
                return;
            }

            this.closeModal();
            return;
        }

        // SIMULATED investment path
        if (typeof SimulatedPortfolio !== "undefined") {
            const apyStr = this.selectedCombo.expectedApy || "10-15%";
            const apyMatch = apyStr.match(/([0-9]+)/);
            const apy = apyMatch ? parseFloat(apyMatch[1]) : 10;

            // Check balance
            const totals = SimulatedPortfolio.getTotalValue();
            const availableBalance = isSimulated ? totals.simulatedBalance : totals.realBalance;

            if (amount > availableBalance) {
                const balanceType = isSimulated ? (isFr ? 'simulé' : 'simulated') : (isFr ? 'réel' : 'real');
                const msg = isFr
                    ? `Solde ${balanceType} insuffisant ($${availableBalance.toFixed(2)} disponible)`
                    : `Insufficient ${balanceType} balance ($${availableBalance.toFixed(2)} available)`;
                if (typeof showNotification === "function") showNotification(msg, "error");
                else alert(msg);
                return;
            }

            const result = SimulatedPortfolio.invest("combo-" + this.selectedCombo.id, this.selectedCombo.name, amount, apy, "combo", isSimulated, null);
            if (!result.success) {
                if (typeof showNotification === "function") showNotification(result.error || "Erreur", "error");
                else alert(result.error || "Erreur");
                return;
            }

            const emoji = isSimulated ? '🎮' : '💎';
            const typeLabel = isSimulated ? (isFr ? 'SIMULÉ' : 'SIMULATED') : (isFr ? 'RÉEL' : 'REAL');
            const comboDisplayName = this.translateDescription(this.selectedCombo.name);
            if (typeof showNotification === "function") {
                const investMsg = isFr
                    ? `${emoji} $${amount} investi dans ${comboDisplayName} (${typeLabel})`
                    : `${emoji} $${amount} invested in ${comboDisplayName} (${typeLabel})`;
                showNotification(investMsg, "success");
            }
            console.log("[Combos] Investment tracked, refreshing cards");
        } else {
            const comboDisplayName = this.translateDescription(this.selectedCombo.name);
            const okMsg = isFr
                ? `✅ Investissement OK ! Combo: ${comboDisplayName} - Montant: $${amount}`
                : `✅ Investment OK! Combo: ${comboDisplayName} - Amount: $${amount}`;
            alert(okMsg);
        }

        this.closeModal();

        // Refresh combo cards to show new investment
        setTimeout(() => this.render(), 100);
    },

    showDetails(comboId) {
        const combo = this.combos.find(c => c.id === comboId);
        if (!combo) return;

        // Build fallback info
        const fallback = this.buildFallbackAllocation(combo);
        let allocText;
        if (fallback.hasFallbacks) {
            allocText = fallback.allocation.map(a => {
                const tag = a.isFallback ? ' [FALLBACK]' : (a.redistributed ? ' [+BOOST]' : '');
                return `  • ${a.product}: ${a.percent}%${tag}`;
            }).join('\n');
            allocText += '\n\n⚠️ Redirections:\n' + fallback.warnings.map(w => '  • ' + w).join('\n');
        } else {
            allocText = combo.allocation.map(a => `  • ${a.product}: ${a.percent}%`).join('\n');
        }

        const isFr = (typeof I18n !== 'undefined') && I18n.currentLang === 'fr';
        const comboDisplayName = this.translateDescription(combo.name);
        const comboDisplayDesc = this.translateDescription(combo.description || '');
        const lblApy = isFr ? 'APY Attendu' : 'Expected APY';
        const lblProtection = 'Protection';
        const lblMin = 'Minimum';
        const lblRebalance = isFr ? 'Rééquilibrage' : 'Rebalancing';
        alert(
            `${combo.icon} ${comboDisplayName}\n${comboDisplayDesc}\n\n` +
            `📊 ${lblApy}: ${combo.expectedApy}\n` +
            `🛡️ ${lblProtection}: ${combo.capitalProtection}\n` +
            `💰 ${lblMin}: $${combo.minInvestment}\n` +
            `🔄 ${lblRebalance}: ${combo.rebalanceFrequency}\n\n` +
            `📈 Allocation:\n` + allocText
        );
    }
};

// Global functions for onclick handlers
function closeComboModal() {
    CombosModule.closeModal();
}

function executeComboInvest() {
    CombosModule.executeInvest();
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Only init if on combos tab or when tab is shown
    if (document.getElementById('combosGrid')) {
        CombosModule.init();
    }
});

// Also init when tab is activated
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-tab="combos"]')) {
        setTimeout(() => CombosModule.init(), 100);
    }
});

// Force init after 2s as backup
setTimeout(() => {
    console.log("[Combos] render called"); const grid = document.getElementById("combosGrid");
    if (grid && (!CombosModule.combos || CombosModule.combos.length === 0)) {
        console.log("[Combos] Force re-init");
        CombosModule.init();
    }
}, 2000);

// Export global
window.CombosModule = CombosModule;

// IMMEDIATE INIT - Don't wait for events
(function() {
    console.log('[COMBOS] Immediate init check...');
    function tryInit() {
        console.log("[Combos] render called"); const grid = document.getElementById('combosGrid');
        if (grid) {
            console.log('[COMBOS] Grid found, initializing...');
            CombosModule.init();
        } else {
            console.log('[COMBOS] Grid not found yet');
        }
    }
    
    // Try now
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(tryInit, 100);
    }
    
    // Also try on load
    window.addEventListener('load', function() {
        setTimeout(tryInit, 500);
    });
    
    // And after 3s as fallback
    setTimeout(tryInit, 3000);
})();
