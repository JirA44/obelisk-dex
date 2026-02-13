/**
 * OBELISK DEX - Market Cap Indexes
 * Index funds from Top 2 to Top 1000
 * Extends InvestmentProducts.indexFunds
 */

const MarketIndexes = {
    // All market cap based indexes
    indexes: [
        {
            id: 'top2-index',
            name: 'Top 2 (BTC+ETH)',
            symbol: 'TOP2',
            icon: '🥇',
            price: 1.00,
            minInvest: 1,
            change24h: 2.1,
            aum: 5000000000,
            holdings: [
                { token: 'BTC', weight: 65 },
                { token: 'ETH', weight: 35 }
            ],
            managementFee: 0.2,
            rebalanceFreq: 'Weekly',
            risk: 'low',
            description: 'Bitcoin + Ethereum only (weighted by market cap)'
        },
        {
            id: 'top3-index',
            name: 'Top 3',
            symbol: 'TOP3',
            icon: '🥈',
            price: 1.00,
            minInvest: 1,
            change24h: 2.5,
            aum: 2500000000,
            holdings: [
                { token: 'BTC', weight: 55 },
                { token: 'ETH', weight: 30 },
                { token: 'SOL', weight: 15 }
            ],
            managementFee: 0.25,
            rebalanceFreq: 'Weekly',
            risk: 'low',
            description: 'Top 3 cryptocurrencies by market cap'
        },
        {
            id: 'top4-index',
            name: 'Top 4',
            symbol: 'TOP4',
            icon: '4️⃣',
            price: 1.00,
            minInvest: 1,
            change24h: 2.6,
            aum: 2000000000,
            holdings: [
                { token: 'BTC', weight: 52 },
                { token: 'ETH', weight: 28 },
                { token: 'SOL', weight: 12 },
                { token: 'BNB', weight: 8 }
            ],
            managementFee: 0.25,
            rebalanceFreq: 'Weekly',
            risk: 'low',
            description: 'Top 4 cryptocurrencies by market cap'
        },
        {
            id: 'top5-index',
            name: 'Top 5',
            symbol: 'TOP5',
            icon: '🏆',
            price: 1.00,
            minInvest: 1,
            change24h: 2.8,
            aum: 1800000000,
            holdings: [
                { token: 'BTC', weight: 50 },
                { token: 'ETH', weight: 25 },
                { token: 'SOL', weight: 10 },
                { token: 'BNB', weight: 8 },
                { token: 'XRP', weight: 7 }
            ],
            managementFee: 0.3,
            rebalanceFreq: 'Weekly',
            risk: 'low',
            description: 'Top 5 cryptocurrencies by market cap'
        },
        {
            id: 'top6-index',
            name: 'Top 6',
            symbol: 'TOP6',
            icon: '6️⃣',
            price: 1.00,
            minInvest: 1,
            change24h: 2.9,
            aum: 1500000000,
            holdings: [
                { token: 'BTC', weight: 48 },
                { token: 'ETH', weight: 24 },
                { token: 'SOL', weight: 9 },
                { token: 'BNB', weight: 7 },
                { token: 'XRP', weight: 6 },
                { token: 'ADA', weight: 6 }
            ],
            managementFee: 0.3,
            rebalanceFreq: 'Weekly',
            risk: 'low',
            description: 'Top 6 cryptocurrencies by market cap'
        },
        {
            id: 'top7-index',
            name: 'Top 7',
            symbol: 'TOP7',
            icon: '7️⃣',
            price: 1.00,
            minInvest: 1,
            change24h: 3.0,
            aum: 1350000000,
            holdings: [
                { token: 'BTC', weight: 46 },
                { token: 'ETH', weight: 23 },
                { token: 'SOL', weight: 8 },
                { token: 'BNB', weight: 7 },
                { token: 'XRP', weight: 6 },
                { token: 'ADA', weight: 5 },
                { token: 'DOGE', weight: 5 }
            ],
            managementFee: 0.32,
            rebalanceFreq: 'Weekly',
            risk: 'low',
            description: 'Top 7 cryptocurrencies by market cap'
        },
        {
            id: 'top8-index',
            name: 'Top 8',
            symbol: 'TOP8',
            icon: '8️⃣',
            price: 1.00,
            minInvest: 1,
            change24h: 3.1,
            aum: 1200000000,
            holdings: [
                { token: 'BTC', weight: 44 },
                { token: 'ETH', weight: 22 },
                { token: 'SOL', weight: 8 },
                { token: 'BNB', weight: 6 },
                { token: 'XRP', weight: 6 },
                { token: 'ADA', weight: 5 },
                { token: 'DOGE', weight: 5 },
                { token: 'AVAX', weight: 4 }
            ],
            managementFee: 0.32,
            rebalanceFreq: 'Weekly',
            risk: 'low',
            description: 'Top 8 cryptocurrencies by market cap'
        },
        {
            id: 'top9-index',
            name: 'Top 9',
            symbol: 'TOP9',
            icon: '9️⃣',
            price: 1.00,
            minInvest: 1,
            change24h: 3.15,
            aum: 1100000000,
            holdings: [
                { token: 'BTC', weight: 43 },
                { token: 'ETH', weight: 21 },
                { token: 'SOL', weight: 8 },
                { token: 'BNB', weight: 6 },
                { token: 'XRP', weight: 5 },
                { token: 'ADA', weight: 5 },
                { token: 'DOGE', weight: 4 },
                { token: 'AVAX', weight: 4 },
                { token: 'DOT', weight: 4 }
            ],
            managementFee: 0.35,
            rebalanceFreq: 'Weekly',
            risk: 'medium',
            description: 'Top 9 cryptocurrencies by market cap'
        },
        {
            id: 'top10-index',
            name: 'Top 10',
            symbol: 'TOP10',
            icon: '🔟',
            price: 1.00,
            minInvest: 1,
            change24h: 3.2,
            aum: 1000000000,
            holdings: [
                { token: 'BTC', weight: 42 },
                { token: 'ETH', weight: 20 },
                { token: 'SOL', weight: 8 },
                { token: 'BNB', weight: 6 },
                { token: 'XRP', weight: 5 },
                { token: 'ADA', weight: 5 },
                { token: 'DOGE', weight: 4 },
                { token: 'AVAX', weight: 4 },
                { token: 'DOT', weight: 3 },
                { token: 'LINK', weight: 3 }
            ],
            managementFee: 0.35,
            rebalanceFreq: 'Weekly',
            risk: 'medium',
            description: 'Top 10 cryptocurrencies by market cap'
        },
        {
            id: 'top12-index',
            name: 'Top 12',
            symbol: 'TOP12',
            icon: '🔢',
            price: 1.00,
            minInvest: 1,
            change24h: 3.3,
            aum: 880000000,
            holdings: [
                { token: 'BTC', weight: 40 },
                { token: 'ETH', weight: 19 },
                { token: 'SOL', weight: 7 },
                { token: 'BNB', weight: 6 },
                { token: 'XRP', weight: 5 },
                { token: 'ADA', weight: 4 },
                { token: 'DOGE', weight: 4 },
                { token: 'AVAX', weight: 4 },
                { token: 'DOT', weight: 3 },
                { token: 'LINK', weight: 3 },
                { token: 'MATIC', weight: 3 },
                { token: 'UNI', weight: 2 }
            ],
            managementFee: 0.38,
            rebalanceFreq: 'Weekly',
            risk: 'medium',
            description: 'Top 12 cryptocurrencies by market cap'
        },
        {
            id: 'top15-index',
            name: 'Top 15',
            symbol: 'TOP15',
            icon: '📈',
            price: 128.40,
            change24h: 3.2,
            aum: 950000000,
            holdings: [
                { token: 'BTC', weight: 40 },
                { token: 'ETH', weight: 22 },
                { token: 'SOL', weight: 8 },
                { token: 'BNB', weight: 6 },
                { token: 'XRP', weight: 5 },
                { token: 'ADA', weight: 4 },
                { token: 'AVAX', weight: 3 },
                { token: 'DOGE', weight: 3 },
                { token: 'DOT', weight: 2 },
                { token: 'Others', weight: 7 }
            ],
            managementFee: 0.4,
            rebalanceFreq: 'Weekly',
            risk: 'medium',
            description: 'Top 15 cryptocurrencies by market cap'
        },
        {
            id: 'top20-index',
            name: 'Top 20',
            symbol: 'TOP20',
            icon: '📊',
            price: 112.30,
            change24h: 3.5,
            aum: 720000000,
            holdings: [
                { token: 'BTC', weight: 38 },
                { token: 'ETH', weight: 20 },
                { token: 'SOL', weight: 7 },
                { token: 'BNB', weight: 5 },
                { token: 'XRP', weight: 4 },
                { token: 'Others', weight: 26 }
            ],
            managementFee: 0.4,
            rebalanceFreq: 'Weekly',
            risk: 'medium',
            description: 'Top 20 cryptocurrencies by market cap'
        },
        {
            id: 'top25-index',
            name: 'Top 25',
            symbol: 'TOP25',
            icon: '🎯',
            price: 98.50,
            change24h: 3.8,
            aum: 580000000,
            holdings: [
                { token: 'BTC', weight: 36 },
                { token: 'ETH', weight: 18 },
                { token: 'SOL', weight: 6 },
                { token: 'BNB', weight: 5 },
                { token: 'XRP', weight: 4 },
                { token: 'Others', weight: 31 }
            ],
            managementFee: 0.45,
            rebalanceFreq: 'Weekly',
            risk: 'medium',
            description: 'Top 25 cryptocurrencies by market cap'
        },
        {
            id: 'top30-index',
            name: 'Top 30',
            symbol: 'TOP30',
            icon: '💫',
            price: 88.20,
            change24h: 4.1,
            aum: 450000000,
            holdings: [
                { token: 'BTC', weight: 34 },
                { token: 'ETH', weight: 17 },
                { token: 'SOL', weight: 5 },
                { token: 'BNB', weight: 4 },
                { token: 'XRP', weight: 4 },
                { token: 'Others', weight: 36 }
            ],
            managementFee: 0.45,
            rebalanceFreq: 'Bi-weekly',
            risk: 'medium',
            description: 'Top 30 cryptocurrencies by market cap'
        },
        {
            id: 'top40-index',
            name: 'Top 40',
            symbol: 'TOP40',
            icon: '🌟',
            price: 72.80,
            change24h: 4.5,
            aum: 320000000,
            holdings: [
                { token: 'BTC', weight: 32 },
                { token: 'ETH', weight: 16 },
                { token: 'Others', weight: 52 }
            ],
            managementFee: 0.5,
            rebalanceFreq: 'Bi-weekly',
            risk: 'medium',
            description: 'Top 40 cryptocurrencies by market cap'
        },
        {
            id: 'top50-index',
            name: 'Top 50',
            symbol: 'TOP50',
            icon: '⭐',
            price: 62.40,
            change24h: 4.8,
            aum: 280000000,
            holdings: [
                { token: 'BTC', weight: 30 },
                { token: 'ETH', weight: 15 },
                { token: 'Others', weight: 55 }
            ],
            managementFee: 0.5,
            rebalanceFreq: 'Bi-weekly',
            risk: 'medium',
            description: 'Top 50 cryptocurrencies by market cap'
        },
        {
            id: 'top70-index',
            name: 'Top 70',
            symbol: 'TOP70',
            icon: '📉',
            price: 48.90,
            change24h: 5.2,
            aum: 180000000,
            holdings: [
                { token: 'BTC', weight: 28 },
                { token: 'ETH', weight: 14 },
                { token: 'Others', weight: 58 }
            ],
            managementFee: 0.55,
            rebalanceFreq: 'Bi-weekly',
            risk: 'medium-high',
            description: 'Top 70 cryptocurrencies by market cap'
        },
        {
            id: 'top80-index',
            name: 'Top 80',
            symbol: 'TOP80',
            icon: '📋',
            price: 44.20,
            change24h: 5.5,
            aum: 150000000,
            holdings: [
                { token: 'BTC', weight: 27 },
                { token: 'ETH', weight: 13 },
                { token: 'Others', weight: 60 }
            ],
            managementFee: 0.55,
            rebalanceFreq: 'Bi-weekly',
            risk: 'medium-high',
            description: 'Top 80 cryptocurrencies by market cap'
        },
        {
            id: 'top90-index',
            name: 'Top 90',
            symbol: 'TOP90',
            icon: '📃',
            price: 40.50,
            change24h: 5.8,
            aum: 120000000,
            holdings: [
                { token: 'BTC', weight: 26 },
                { token: 'ETH', weight: 12 },
                { token: 'Others', weight: 62 }
            ],
            managementFee: 0.6,
            rebalanceFreq: 'Bi-weekly',
            risk: 'medium-high',
            description: 'Top 90 cryptocurrencies by market cap'
        },
        {
            id: 'top100-index',
            name: 'Top 100',
            symbol: 'TOP100',
            icon: '💯',
            price: 38.80,
            change24h: 6.0,
            aum: 100000000,
            holdings: [
                { token: 'BTC', weight: 25 },
                { token: 'ETH', weight: 12 },
                { token: 'Others', weight: 63 }
            ],
            managementFee: 0.6,
            rebalanceFreq: 'Monthly',
            risk: 'medium-high',
            description: 'Top 100 cryptocurrencies by market cap'
        },
        {
            id: 'top150-index',
            name: 'Top 150',
            symbol: 'TOP150',
            icon: '🔢',
            price: 28.50,
            change24h: 6.8,
            aum: 65000000,
            holdings: [
                { token: 'BTC', weight: 22 },
                { token: 'ETH', weight: 10 },
                { token: 'Others', weight: 68 }
            ],
            managementFee: 0.7,
            rebalanceFreq: 'Monthly',
            risk: 'high',
            description: 'Top 150 cryptocurrencies by market cap'
        },
        {
            id: 'top200-index',
            name: 'Top 200',
            symbol: 'TOP200',
            icon: '📐',
            price: 22.40,
            change24h: 7.5,
            aum: 45000000,
            holdings: [
                { token: 'BTC', weight: 20 },
                { token: 'ETH', weight: 9 },
                { token: 'Others', weight: 71 }
            ],
            managementFee: 0.75,
            rebalanceFreq: 'Monthly',
            risk: 'high',
            description: 'Top 200 cryptocurrencies by market cap'
        },
        {
            id: 'top300-index',
            name: 'Top 300',
            symbol: 'TOP300',
            icon: '🗂️',
            price: 15.80,
            change24h: 8.5,
            aum: 28000000,
            holdings: [
                { token: 'BTC', weight: 18 },
                { token: 'ETH', weight: 8 },
                { token: 'Others', weight: 74 }
            ],
            managementFee: 0.8,
            rebalanceFreq: 'Monthly',
            risk: 'high',
            description: 'Top 300 cryptocurrencies by market cap'
        },
        {
            id: 'top400-index',
            name: 'Top 400',
            symbol: 'TOP400',
            icon: '📊',
            price: 11.20,
            change24h: 9.2,
            aum: 18000000,
            holdings: [
                { token: 'BTC', weight: 16 },
                { token: 'ETH', weight: 7 },
                { token: 'Others', weight: 77 }
            ],
            managementFee: 0.85,
            rebalanceFreq: 'Monthly',
            risk: 'high',
            description: 'Top 400 cryptocurrencies by market cap'
        },
        {
            id: 'top500-index',
            name: 'Top 500',
            symbol: 'TOP500',
            icon: '🏛️',
            price: 8.50,
            change24h: 10.0,
            aum: 12000000,
            holdings: [
                { token: 'BTC', weight: 15 },
                { token: 'ETH', weight: 6 },
                { token: 'Others', weight: 79 }
            ],
            managementFee: 0.9,
            rebalanceFreq: 'Monthly',
            risk: 'high',
            description: 'Top 500 cryptocurrencies by market cap'
        },
        {
            id: 'top1000-index',
            name: 'Top 1000 Total Market',
            symbol: 'TOP1K',
            icon: '🌐',
            price: 4.20,
            change24h: 12.5,
            aum: 5000000,
            holdings: [
                { token: 'BTC', weight: 12 },
                { token: 'ETH', weight: 5 },
                { token: 'Others', weight: 83 }
            ],
            managementFee: 1.0,
            rebalanceFreq: 'Monthly',
            risk: 'high',
            description: 'Top 1000 cryptos - total market exposure'
        }
    ],

    // Merge indexes into InvestmentProducts on load
    init() {
        if (typeof InvestmentProducts !== 'undefined' && InvestmentProducts.indexFunds) {
            // Add market cap indexes to the beginning of indexFunds
            InvestmentProducts.indexFunds.products = [
                ...this.indexes,
                ...InvestmentProducts.indexFunds.products
            ];
            console.log('📊 Market Indexes loaded: Top 2 to Top 1000 available');
        }
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MarketIndexes.init());
} else {
    // Small delay to ensure InvestmentProducts is loaded first
    setTimeout(() => MarketIndexes.init(), 100);
}

window.MarketIndexes = MarketIndexes;
