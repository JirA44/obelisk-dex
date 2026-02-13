// Obelisk Trading Results by Platform
const fs = require('fs');

console.log('='.repeat(75));
console.log('OBELISK TRADING ROUTER - RESULTATS PAR PLATEFORME');
console.log('='.repeat(75));

// Load trading router history
const history = JSON.parse(fs.readFileSync('data/trading_router_history.json', 'utf8'));

console.log('\nTotal ordres routes: ' + history.length + '\n');

// Analyser par plateforme
const byExchange = {};
const byCoin = {};

history.forEach(order => {
    const exchange = order.exchange || 'unknown';
    const coin = (order.symbol || '').replace('/USDC', '').replace('/USDT', '');
    const fee = order.fee || 0;
    const size = order.size || 0;
    const price = order.executedPrice || order.price || 0;
    const volume = size * price;

    // Par exchange
    if (!byExchange[exchange]) {
        byExchange[exchange] = { count: 0, volume: 0, fees: 0, buys: 0, sells: 0 };
    }
    byExchange[exchange].count++;
    byExchange[exchange].volume += volume;
    byExchange[exchange].fees += fee;
    if (order.side === 'buy') byExchange[exchange].buys++;
    else byExchange[exchange].sells++;

    // Par coin
    if (!byCoin[coin]) {
        byCoin[coin] = { count: 0, volume: 0, fees: 0 };
    }
    byCoin[coin].count++;
    byCoin[coin].volume += volume;
    byCoin[coin].fees += fee;
});

// Afficher par Exchange
console.log('PAR PLATEFORME/EXCHANGE:');
console.log('+------------------+--------+--------+--------+-------------+------------+');
console.log('| Exchange         | Orders | Buys   | Sells  | Volume      | Fees       |');
console.log('+------------------+--------+--------+--------+-------------+------------+');

let totalOrders = 0, totalVolume = 0, totalFees = 0;

Object.entries(byExchange).sort((a, b) => b[1].count - a[1].count).forEach(([name, data]) => {
    const volStr = '$' + data.volume.toFixed(2);
    const feeStr = '$' + data.fees.toFixed(4);
    console.log('| ' + name.padEnd(16) + ' | ' + String(data.count).padStart(6) + ' | ' + String(data.buys).padStart(6) + ' | ' + String(data.sells).padStart(6) + ' | ' + volStr.padStart(11) + ' | ' + feeStr.padStart(10) + ' |');
    totalOrders += data.count;
    totalVolume += data.volume;
    totalFees += data.fees;
});

console.log('+------------------+--------+--------+--------+-------------+------------+');
console.log('| TOTAL            | ' + String(totalOrders).padStart(6) + ' |        |        | $' + totalVolume.toFixed(2).padStart(10) + ' | $' + totalFees.toFixed(4).padStart(9) + ' |');
console.log('+------------------+--------+--------+--------+-------------+------------+');

// Par Coin
console.log('\nPAR COIN:');
console.log('+----------+--------+-------------+------------+');
console.log('| Coin     | Orders | Volume      | Fees       |');
console.log('+----------+--------+-------------+------------+');

Object.entries(byCoin).sort((a, b) => b[1].volume - a[1].volume).forEach(([name, data]) => {
    console.log('| ' + name.padEnd(8) + ' | ' + String(data.count).padStart(6) + ' | $' + data.volume.toFixed(2).padStart(10) + ' | $' + data.fees.toFixed(4).padStart(9) + ' |');
});
console.log('+----------+--------+-------------+------------+');

// Fees comparison
console.log('\nCOMPARAISON FEES PAR VENUE (pour $100):');
console.log('+------------------+----------+----------+----------------------+');
console.log('| Venue            | Maker    | Taker    | Note                 |');
console.log('+------------------+----------+----------+----------------------+');
console.log('| Morpher          |    0.00% |    0.00% | ZERO FEES!           |');
console.log('| Lighter          |    0.00% |    0.04% | Tres bas             |');
console.log('| Hyperliquid      |    0.01% |   0.035% | Bon                  |');
console.log('| AsterDEX         |    0.01% |   0.035% | Bon                  |');
console.log('| dYdX             |    0.02% |    0.05% | Moyen                |');
console.log('| GMX              |    0.05% |    0.05% | Moyen                |');
console.log('| MUX              |    0.06% |    0.06% | Plus haut            |');
console.log('| Gains            |    0.08% |    0.08% | Plus haut            |');
console.log('+------------------+----------+----------+----------------------+');

console.log('\nAuto-Route: Selectionne automatiquement la venue avec fees les plus bas');
console.log('='.repeat(75));
