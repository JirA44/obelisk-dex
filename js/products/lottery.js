/**
 * LOTTERY MODULE - Crypto Lottery & Jackpots
 */
const LotteryModule = {
    lotteries: [
        { id: 'daily-draw', name: 'Daily Draw', ticketPrice: 1, jackpot: 10000, drawTime: 'Daily 20:00 UTC', odds: '1:10000', prizes: [10000, 1000, 100, 10] },
        { id: 'weekly-mega', name: 'Weekly Mega', ticketPrice: 10, jackpot: 500000, drawTime: 'Sunday 18:00 UTC', odds: '1:100000', prizes: [500000, 50000, 5000, 500] },
        { id: 'monthly-jackpot', name: 'Monthly Jackpot', ticketPrice: 25, jackpot: 2000000, drawTime: '1st of Month', odds: '1:500000', prizes: [2000000, 200000, 20000, 2000] },
        { id: 'no-loss', name: 'No-Loss Lottery', ticketPrice: 100, jackpot: 50000, drawTime: 'Weekly', odds: '1:5000', prizes: [50000, 10000, 1000], noLoss: true },
        { id: 'nft-raffle', name: 'NFT Raffle', ticketPrice: 5, prize: 'Rare NFT', drawTime: 'Bi-Weekly', odds: '1:1000', prizeType: 'nft' },
        { id: 'instant-win', name: 'Instant Win', ticketPrice: 2, maxPrize: 1000, odds: '1:100', instant: true }
    ],
    tickets: [],
    init() { this.load(); console.log('Lottery Module initialized'); },
    load() { const s = localStorage.getItem('obelisk_lottery'); if (s) this.tickets = JSON.parse(s); },
    save() { localStorage.setItem('obelisk_lottery', JSON.stringify(this.tickets)); },
    buyTicket(lotteryId, quantity = 1) {
        const lottery = this.lotteries.find(l => l.id === lotteryId);
        if (!lottery) return { success: false, error: 'Lottery not found' };
        const cost = lottery.ticketPrice * quantity;
        const ticketNumbers = [];
        for (let i = 0; i < quantity; i++) {
            ticketNumbers.push(Array.from({length: 6}, () => Math.floor(Math.random() * 49) + 1).sort((a,b) => a-b));
        }
        const ticket = { id: 'lot-' + Date.now(), lotteryId, name: lottery.name, quantity, cost, numbers: ticketNumbers, buyDate: Date.now(), status: 'active' };
        this.tickets.push(ticket);
        this.save();
        if (lottery.instant) return this.checkInstantWin(ticket, lottery);
        return { success: true, ticket, numbers: ticketNumbers };
    },
    checkInstantWin(ticket, lottery) {
        const win = Math.random() < (1 / parseInt(lottery.odds.split(':')[1]));
        if (win) {
            const prize = Math.floor(Math.random() * lottery.maxPrize);
            ticket.status = 'won';
            ticket.prize = prize;
            this.save();
            return { success: true, ticket, instant: true, won: true, prize };
        }
        ticket.status = 'lost';
        this.save();
        return { success: true, ticket, instant: true, won: false };
    },
    getActiveTickets() { return this.tickets.filter(t => t.status === 'active'); },
    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<h3>Lottery & Jackpots</h3><div class="lottery-grid">' + this.lotteries.map(l =>
            '<div class="lottery-card' + (l.noLoss ? ' no-loss' : '') + '"><strong>' + l.name + '</strong><br>' + (l.jackpot ? 'Jackpot: $' + l.jackpot.toLocaleString() : 'Prize: ' + l.prize) + '<br>Ticket: $' + l.ticketPrice + '<br>Draw: ' + l.drawTime + '<br>Odds: ' + l.odds + '<br><button onclick="LotteryModule.quickBuy(\'' + l.id + '\')">' + (l.instant ? 'Play Now' : 'Buy Ticket') + '</button></div>'
        ).join('') + '</div>';
    },
    quickBuy(lotteryId) {
        const lottery = this.lotteries.find(l => l.id === lotteryId);
        const qty = parseInt(prompt('How many tickets? ($' + lottery.ticketPrice + ' each):')) || 1;
        if (qty > 0) {
            const r = this.buyTicket(lotteryId, qty);
            if (r.instant) {
                alert(r.won ? 'WINNER! You won $' + r.prize + '!' : 'No win this time. Try again!');
            } else {
                alert(r.success ? 'Bought ' + qty + ' ticket(s)! Numbers: ' + r.numbers.map(n => n.join('-')).join(' | ') : r.error);
            }
        }
    }
};
document.addEventListener('DOMContentLoaded', () => LotteryModule.init());
