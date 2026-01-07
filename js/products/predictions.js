/**
 * PREDICTION MARKETS MODULE
 */
const PredictionsModule = {
    markets: [
        { id: 'btc-100k-q1', question: 'BTC hits $100K in Q1 2025?', yesOdds: 1.8, noOdds: 2.2, endDate: '2025-03-31', volume: 5000000 },
        { id: 'eth-ath-2025', question: 'ETH new ATH in 2025?', yesOdds: 1.5, noOdds: 2.8, endDate: '2025-12-31', volume: 8000000 },
        { id: 'sol-flip-bnb', question: 'SOL flips BNB by marketcap?', yesOdds: 2.5, noOdds: 1.6, endDate: '2025-06-30', volume: 2000000 },
        { id: 'fed-rate-cut', question: 'Fed cuts rates in Q1 2025?', yesOdds: 1.4, noOdds: 3.2, endDate: '2025-03-31', volume: 10000000 },
        { id: 'trump-btc-reserve', question: 'US BTC strategic reserve 2025?', yesOdds: 3.5, noOdds: 1.3, endDate: '2025-12-31', volume: 15000000 },
        { id: 'eth-etf-inflows', question: 'ETH ETF >$10B inflows 2025?', yesOdds: 2.0, noOdds: 1.9, endDate: '2025-12-31', volume: 6000000 }
    ],
    bets: [],
    init() { this.load(); console.log('Predictions Module initialized'); },
    load() { const s = localStorage.getItem('obelisk_predictions'); if (s) this.bets = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_predictions', JSON.stringify(this.bets)); },
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
        if (amount) { const r = this.placeBet(marketId, side, amount); alert(r.success ? 'Bet placed! Potential win: $' + r.bet.potentialWin.toFixed(2) : r.error); }
    }
};
document.addEventListener('DOMContentLoaded', () => PredictionsModule.init());
