/**
 * PREDICTION MARKETS MODULE
 */
const PredictionsModule = {
    markets: [
        // === ORIGINAL MARKETS (6) ===
        { id: 'btc-100k-q1', question: 'BTC hits $100K in Q1 2025?', yesOdds: 1.8, noOdds: 2.2, endDate: '2025-03-31', volume: 5000000 },
        { id: 'eth-ath-2025', question: 'ETH new ATH in 2025?', yesOdds: 1.5, noOdds: 2.8, endDate: '2025-12-31', volume: 8000000 },
        { id: 'sol-flip-bnb', question: 'SOL flips BNB by marketcap?', yesOdds: 2.5, noOdds: 1.6, endDate: '2025-06-30', volume: 2000000 },
        { id: 'fed-rate-cut', question: 'Fed cuts rates in Q1 2025?', yesOdds: 1.4, noOdds: 3.2, endDate: '2025-03-31', volume: 10000000 },
        { id: 'trump-btc-reserve', question: 'US BTC strategic reserve 2025?', yesOdds: 3.5, noOdds: 1.3, endDate: '2025-12-31', volume: 15000000 },
        { id: 'eth-etf-inflows', question: 'ETH ETF >$10B inflows 2025?', yesOdds: 2.0, noOdds: 1.9, endDate: '2025-12-31', volume: 6000000 },

        // === CRYPTO PRICE PREDICTIONS (12) ===
        { id: 'btc-150k-2025', question: 'BTC hits $150K in 2025?', yesOdds: 2.8, noOdds: 1.5, endDate: '2025-12-31', volume: 12000000 },
        { id: 'btc-200k-2025', question: 'BTC hits $200K in 2025?', yesOdds: 5.0, noOdds: 1.2, endDate: '2025-12-31', volume: 8500000 },
        { id: 'eth-10k-2025', question: 'ETH hits $10K in 2025?', yesOdds: 3.2, noOdds: 1.4, endDate: '2025-12-31', volume: 7200000 },
        { id: 'sol-500-2025', question: 'SOL hits $500 in 2025?', yesOdds: 2.4, noOdds: 1.7, endDate: '2025-12-31', volume: 4500000 },
        { id: 'xrp-5-2025', question: 'XRP hits $5 in 2025?', yesOdds: 3.8, noOdds: 1.3, endDate: '2025-12-31', volume: 6800000 },
        { id: 'doge-1-2025', question: 'DOGE hits $1 in 2025?', yesOdds: 4.5, noOdds: 1.25, endDate: '2025-12-31', volume: 9500000 },
        { id: 'ada-3-2025', question: 'ADA hits $3 in 2025?', yesOdds: 4.0, noOdds: 1.3, endDate: '2025-12-31', volume: 3200000 },
        { id: 'avax-200-2025', question: 'AVAX hits $200 in 2025?', yesOdds: 3.5, noOdds: 1.4, endDate: '2025-12-31', volume: 2800000 },
        { id: 'link-100-2025', question: 'LINK hits $100 in 2025?', yesOdds: 3.0, noOdds: 1.5, endDate: '2025-12-31', volume: 3500000 },
        { id: 'matic-5-2025', question: 'MATIC hits $5 in 2025?', yesOdds: 4.2, noOdds: 1.3, endDate: '2025-12-31', volume: 2100000 },
        { id: 'arb-10-2025', question: 'ARB hits $10 in 2025?', yesOdds: 5.5, noOdds: 1.2, endDate: '2025-12-31', volume: 1800000 },
        { id: 'pepe-ath-2025', question: 'PEPE new ATH in 2025?', yesOdds: 2.2, noOdds: 1.8, endDate: '2025-12-31', volume: 4200000 },

        // === CRYPTO ECOSYSTEM (8) ===
        { id: 'btc-dominance-60', question: 'BTC dominance >60% in 2025?', yesOdds: 2.0, noOdds: 1.9, endDate: '2025-12-31', volume: 3800000 },
        { id: 'total-mcap-5t', question: 'Crypto total mcap >$5T in 2025?', yesOdds: 2.3, noOdds: 1.7, endDate: '2025-12-31', volume: 7500000 },
        { id: 'sol-etf-2025', question: 'SOL ETF approved in 2025?', yesOdds: 2.8, noOdds: 1.5, endDate: '2025-12-31', volume: 5200000 },
        { id: 'xrp-etf-2025', question: 'XRP ETF approved in 2025?', yesOdds: 3.2, noOdds: 1.4, endDate: '2025-12-31', volume: 4800000 },
        { id: 'eth-layer2-tvl', question: 'ETH L2 TVL >$100B in 2025?', yesOdds: 1.9, noOdds: 2.1, endDate: '2025-12-31', volume: 2500000 },
        { id: 'defi-tvl-500b', question: 'DeFi TVL >$500B in 2025?', yesOdds: 2.5, noOdds: 1.6, endDate: '2025-12-31', volume: 3100000 },
        { id: 'cbdc-us-2025', question: 'US CBDC pilot in 2025?', yesOdds: 4.0, noOdds: 1.3, endDate: '2025-12-31', volume: 2200000 },
        { id: 'binance-delist', question: 'Binance delists from US in 2025?', yesOdds: 3.5, noOdds: 1.4, endDate: '2025-12-31', volume: 1900000 },

        // === SPORTS PREDICTIONS (8) ===
        { id: 'superbowl-lix-kc', question: 'Chiefs win Super Bowl LIX?', yesOdds: 3.5, noOdds: 1.4, endDate: '2025-02-09', volume: 25000000 },
        { id: 'nba-finals-celtics', question: 'Celtics win NBA Finals 2025?', yesOdds: 3.2, noOdds: 1.45, endDate: '2025-06-30', volume: 18000000 },
        { id: 'champions-league-real', question: 'Real Madrid wins UCL 2025?', yesOdds: 4.0, noOdds: 1.3, endDate: '2025-05-31', volume: 22000000 },
        { id: 'premier-league-city', question: 'Man City wins PL 2024-25?', yesOdds: 2.2, noOdds: 1.8, endDate: '2025-05-25', volume: 15000000 },
        { id: 'f1-champion-verstappen', question: 'Verstappen wins F1 WDC 2025?', yesOdds: 1.6, noOdds: 2.5, endDate: '2025-12-15', volume: 12000000 },
        { id: 'wimbledon-djokovic', question: 'Djokovic wins Wimbledon 2025?', yesOdds: 3.8, noOdds: 1.35, endDate: '2025-07-14', volume: 8500000 },
        { id: 'world-series-dodgers', question: 'Dodgers win World Series 2025?', yesOdds: 5.5, noOdds: 1.2, endDate: '2025-11-01', volume: 14000000 },
        { id: 'ufc-jones-retire', question: 'Jon Jones retires in 2025?', yesOdds: 2.8, noOdds: 1.5, endDate: '2025-12-31', volume: 4500000 },

        // === POLITICAL/ELECTION (6) ===
        { id: 'uk-election-2025', question: 'UK snap election in 2025?', yesOdds: 4.5, noOdds: 1.25, endDate: '2025-12-31', volume: 6500000 },
        { id: 'germany-coalition', question: 'New German coalition by Q2 2025?', yesOdds: 1.8, noOdds: 2.2, endDate: '2025-06-30', volume: 4200000 },
        { id: 'trump-crypto-exec', question: 'Trump signs crypto exec order Q1?', yesOdds: 1.5, noOdds: 2.8, endDate: '2025-03-31', volume: 8800000 },
        { id: 'sec-chair-change', question: 'SEC chair replaced by Q2 2025?', yesOdds: 1.4, noOdds: 3.2, endDate: '2025-06-30', volume: 5500000 },
        { id: 'china-taiwan-2025', question: 'China military action Taiwan 2025?', yesOdds: 8.0, noOdds: 1.1, endDate: '2025-12-31', volume: 3200000 },
        { id: 'russia-ukraine-peace', question: 'Russia-Ukraine ceasefire 2025?', yesOdds: 2.5, noOdds: 1.6, endDate: '2025-12-31', volume: 9500000 },

        // === ECONOMIC INDICATORS (6) ===
        { id: 'sp500-6000', question: 'S&P500 hits 6000 in 2025?', yesOdds: 1.7, noOdds: 2.4, endDate: '2025-12-31', volume: 11000000 },
        { id: 'nasdaq-20k', question: 'NASDAQ hits 20K in 2025?', yesOdds: 1.9, noOdds: 2.1, endDate: '2025-12-31', volume: 8200000 },
        { id: 'gold-3000', question: 'Gold hits $3000/oz in 2025?', yesOdds: 2.3, noOdds: 1.7, endDate: '2025-12-31', volume: 6800000 },
        { id: 'oil-100', question: 'Oil hits $100/barrel in 2025?', yesOdds: 2.8, noOdds: 1.5, endDate: '2025-12-31', volume: 5500000 },
        { id: 'us-recession-2025', question: 'US enters recession in 2025?', yesOdds: 3.5, noOdds: 1.4, endDate: '2025-12-31', volume: 14000000 },
        { id: 'inflation-below-2', question: 'US inflation below 2% in 2025?', yesOdds: 2.2, noOdds: 1.8, endDate: '2025-12-31', volume: 7200000 },

        // === TECH EVENTS (8) ===
        { id: 'apple-ai-device', question: 'Apple launches AI device in 2025?', yesOdds: 2.5, noOdds: 1.6, endDate: '2025-12-31', volume: 9800000 },
        { id: 'tesla-fsd-approved', question: 'Tesla FSD Level 4 approved 2025?', yesOdds: 3.8, noOdds: 1.35, endDate: '2025-12-31', volume: 7500000 },
        { id: 'nvidia-earnings-beat', question: 'NVIDIA beats Q1 earnings?', yesOdds: 1.4, noOdds: 3.2, endDate: '2025-02-28', volume: 6200000 },
        { id: 'openai-ipo-2025', question: 'OpenAI IPO in 2025?', yesOdds: 3.0, noOdds: 1.5, endDate: '2025-12-31', volume: 8800000 },
        { id: 'gpt5-release', question: 'GPT-5 released in 2025?', yesOdds: 1.8, noOdds: 2.2, endDate: '2025-12-31', volume: 5500000 },
        { id: 'meta-metaverse-profit', question: 'Meta metaverse profitable 2025?', yesOdds: 5.0, noOdds: 1.2, endDate: '2025-12-31', volume: 4200000 },
        { id: 'twitter-x-bankrupt', question: 'X (Twitter) bankruptcy 2025?', yesOdds: 6.0, noOdds: 1.15, endDate: '2025-12-31', volume: 3800000 },
        { id: 'apple-4t-mcap', question: 'Apple hits $4T market cap 2025?', yesOdds: 2.8, noOdds: 1.5, endDate: '2025-12-31', volume: 7800000 },

        // === ENTERTAINMENT (5) ===
        { id: 'oscars-sequel-announced', question: 'Oppenheimer sequel announced?', yesOdds: 8.0, noOdds: 1.1, endDate: '2025-12-31', volume: 1500000 },
        { id: 'taylor-swift-tour', question: 'Taylor Swift new tour 2025?', yesOdds: 1.6, noOdds: 2.5, endDate: '2025-12-31', volume: 4800000 },
        { id: 'gta6-release-2025', question: 'GTA 6 releases in 2025?', yesOdds: 1.5, noOdds: 2.8, endDate: '2025-12-31', volume: 12000000 },
        { id: 'netflix-sports', question: 'Netflix adds live sports 2025?', yesOdds: 2.2, noOdds: 1.8, endDate: '2025-12-31', volume: 3500000 },
        { id: 'disney-streaming-profit', question: 'Disney+ profitable in 2025?', yesOdds: 1.9, noOdds: 2.1, endDate: '2025-12-31', volume: 4200000 },

        // === WEATHER/CLIMATE (4) ===
        { id: 'hottest-year-2025', question: '2025 hottest year on record?', yesOdds: 1.7, noOdds: 2.4, endDate: '2025-12-31', volume: 5500000 },
        { id: 'category5-atlantic', question: 'Category 5 hurricane Atlantic 2025?', yesOdds: 1.8, noOdds: 2.2, endDate: '2025-11-30', volume: 3200000 },
        { id: 'california-drought', question: 'California declares drought 2025?', yesOdds: 2.5, noOdds: 1.6, endDate: '2025-12-31', volume: 2100000 },
        { id: 'arctic-ice-record', question: 'Arctic ice new record low 2025?', yesOdds: 2.0, noOdds: 1.9, endDate: '2025-09-30', volume: 1800000 }
    ],
    bets: [],
    init() { this.load(); console.log('Predictions Module initialized'); },
    load() { this.bets = SafeOps.getStorage('obelisk_predictions', []); },
    save() { SafeOps.setStorage('obelisk_predictions', this.bets); },
    placeBet(marketId, side, amount) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market || amount < 1) return { success: false, error: 'Min $1' };
        const odds = side === 'yes' ? market.yesOdds : market.noOdds;
        const bet = { id: 'bet-' + Date.now(), marketId, side, amount, odds, potentialWin: amount * odds, placedAt: Date.now() };
        this.bets.push(bet);
        this.save();
        return { success: true, bet };
    },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Prediction Markets</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">' + this.markets.map(m =>
            '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;"><strong>' + m.question + '</strong><br>YES: ' + m.yesOdds + 'x | NO: ' + m.noOdds + 'x<br>Volume: $' + (m.volume/1000000).toFixed(1) + 'M<br>Ends: ' + m.endDate + '<br><button onclick="PredictionsModule.quickBet(\'' + m.id + '\',\'yes\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">YES</button> <button onclick="PredictionsModule.quickBet(\'' + m.id + '\',\'no\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">NO</button></div>'
        ).join('') + '</div>';
    },
    quickBet(marketId, side) {
        const amount = parseFloat(prompt('Bet amount (min $1):'));
        if (amount !== null && amount > 0) { const r = this.placeBet(marketId, side, amount); alert(r.success ? 'Bet placed! Potential win: $' + r.bet.potentialWin.toFixed(2) : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => PredictionsModule.init());
