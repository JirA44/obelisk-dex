// ═══════════════════════════════════════════════════════════════════════════
// DRY RUN EXECUTOR V1.0 - Generic Realistic Simulator
// Utilisable pour AsterDEX, Lighter, SpookyFi, QuickSwap, etc.
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

class DryRunExecutor {
    constructor(platformName, config = {}) {
        this.platform = platformName;
        this.config = {
            // Slippage
            slippageMin: config.slippageMin || 0.01,
            slippageMax: config.slippageMax || 0.15,
            slippageAvg: config.slippageAvg || 0.05,

            // Latency
            latencyMin: config.latencyMin || 50,
            latencyMax: config.latencyMax || 500,
            latencyAvg: config.latencyAvg || 150,

            // Liquidity
            liquidityFactor: config.liquidityFactor || 0.95,
            partialFillChance: config.partialFillChance || 0.05,

            // Noise
            priceNoise: config.priceNoise || 0.02,
            spreadMin: config.spreadMin || 0.01,
            spreadMax: config.spreadMax || 0.10,

            // Failures
            rejectChance: config.rejectChance || 0.02,
            timeoutChance: config.timeoutChance || 0.01,

            // Fees (use ?? to preserve 0 values)
            makerFee: config.makerFee ?? 0,
            takerFee: config.takerFee ?? 0.05,

            // State file
            stateFile: config.stateFile || path.join(__dirname, `${platformName.toLowerCase()}_dryrun_state.json`),
        };

        this.state = {
            balance: config.initialBalance || 100,
            startBalance: config.initialBalance || 100,
            positions: [],
            trades: [],
            stats: {
                totalTrades: 0,
                wins: 0,
                losses: 0,
                totalPnL: 0,
                totalFees: 0,
                totalSlippage: 0,
                rejects: 0,
                partialFills: 0,
            }
        };

        this.loadState();

        console.log('═'.repeat(60));
        console.log(`🏛️ ${this.platform} DRY RUN EXECUTOR V1.0`);
        console.log('═'.repeat(60));
        console.log(`   Balance: $${this.state.balance.toFixed(2)}`);
        console.log(`   Slippage: ${(this.config.slippageMin * 100).toFixed(2)}-${(this.config.slippageMax * 100).toFixed(2)}%`);
        console.log(`   Fees: ${(this.config.takerFee * 100).toFixed(3)}%`);
        console.log('═'.repeat(60) + '\n');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SIMULATION HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    simulateSlippage(size, volatility = 1.0) {
        // Slippage augmente avec la taille et la volatilité
        const base = this.config.slippageMin +
            Math.random() * (this.config.slippageMax - this.config.slippageMin);
        const sizeImpact = Math.min(size / 1000, 0.5); // +0.5% max pour grosses positions
        return (base + sizeImpact) * volatility;
    }

    async simulateLatency() {
        const latency = this.config.latencyMin +
            Math.random() * (this.config.latencyMax - this.config.latencyMin);
        await new Promise(r => setTimeout(r, latency));
        return latency;
    }

    simulateSpread(price, volatility = 1.0) {
        const spreadPercent = this.config.spreadMin +
            Math.random() * (this.config.spreadMax - this.config.spreadMin) * volatility;
        const halfSpread = price * spreadPercent / 200;
        return {
            bid: price - halfSpread,
            ask: price + halfSpread,
            spread: spreadPercent
        };
    }

    shouldReject() {
        return Math.random() < this.config.rejectChance;
    }

    shouldTimeout() {
        return Math.random() < this.config.timeoutChance;
    }

    shouldPartialFill() {
        return Math.random() < this.config.partialFillChance;
    }

    getPartialFillPercent() {
        return 0.3 + Math.random() * 0.6; // 30-90% fill
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ORDER EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════

    async placeOrder(order) {
        const {
            coin,
            direction,
            size,
            price,
            leverage = 1,
            strategy = 'manual',
            orderType = 'market'
        } = order;

        const orderId = `${this.platform.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        console.log('─'.repeat(50));
        console.log(`🏛️ [${this.platform} DRY RUN] Nouvelle commande`);
        console.log('─'.repeat(50));
        console.log(`   ${coin} | ${direction} | $${size} | x${leverage}`);

        // 1. Check rejet
        if (this.shouldReject()) {
            this.state.stats.rejects++;
            console.log(`   ❌ REJETÉ: Rate limit ou erreur réseau`);
            console.log('─'.repeat(50));
            return { success: false, reason: 'REJECTED', orderId };
        }

        // 2. Check timeout
        if (this.shouldTimeout()) {
            await this.simulateLatency();
            console.log(`   ⏱️ TIMEOUT: Ordre non exécuté`);
            console.log('─'.repeat(50));
            return { success: false, reason: 'TIMEOUT', orderId };
        }

        // 3. Simuler latence
        const latency = await this.simulateLatency();
        console.log(`   ⏱️ Latence: ${latency.toFixed(0)}ms`);

        // 4. Calculer spread
        const spread = this.simulateSpread(price);
        console.log(`   📊 Spread: ${spread.spread.toFixed(3)}% (Bid: $${spread.bid.toFixed(4)} / Ask: $${spread.ask.toFixed(4)})`);

        // 5. Calculer slippage
        const slippage = this.simulateSlippage(size);
        console.log(`   📉 Slippage: ${direction === 'LONG' ? '+' : '-'}${(slippage * 100).toFixed(3)}%`);

        // 6. Prix exécuté
        let execPrice;
        if (direction === 'LONG') {
            execPrice = spread.ask * (1 + slippage / 100);
        } else {
            execPrice = spread.bid * (1 - slippage / 100);
        }
        console.log(`   💰 Prix exécuté: $${execPrice.toFixed(4)}`);

        // 7. Check partial fill
        let fillPercent = 1.0;
        if (this.shouldPartialFill()) {
            fillPercent = this.getPartialFillPercent();
            this.state.stats.partialFills++;
            console.log(`   ⚠️ Fill partiel: ${(fillPercent * 100).toFixed(0)}%`);
        }

        const actualSize = size * fillPercent;

        // 8. Calculer fees
        const feeRate = orderType === 'limit' ? this.config.makerFee : this.config.takerFee;
        const fees = actualSize * leverage * feeRate;
        console.log(`   💸 Fees: $${fees.toFixed(4)} (${(feeRate * 100).toFixed(3)}%)`);

        // 9. Créer la position
        const position = {
            id: orderId,
            coin,
            direction,
            entryPrice: execPrice,
            size: actualSize,
            leverage,
            strategy,
            openedAt: Date.now(),
            fees,
            slippage: slippage * actualSize * leverage / 100,
            latency,
        };

        this.state.positions.push(position);
        this.state.stats.totalFees += fees;
        this.state.stats.totalSlippage += position.slippage;

        console.log(`   ✅ Position ouverte: ${orderId}`);
        console.log('─'.repeat(50) + '\n');

        this.saveState();

        return {
            success: true,
            orderId,
            position,
            execPrice,
            fees,
            slippage,
            latency,
            fillPercent
        };
    }

    async closePosition(positionId, exitPrice, reason = 'manual') {
        const posIndex = this.state.positions.findIndex(p => p.id === positionId);
        if (posIndex === -1) {
            return { success: false, reason: 'POSITION_NOT_FOUND' };
        }

        const position = this.state.positions[posIndex];

        console.log('─'.repeat(50));
        console.log(`🏛️ [${this.platform} DRY RUN] Fermeture position`);
        console.log('─'.repeat(50));
        console.log(`   ${position.coin} | ${position.direction} | Raison: ${reason}`);

        // Simuler slippage de sortie
        const exitSlippage = this.simulateSlippage(position.size);
        let actualExitPrice;
        if (position.direction === 'LONG') {
            actualExitPrice = exitPrice * (1 - exitSlippage / 100);
        } else {
            actualExitPrice = exitPrice * (1 + exitSlippage / 100);
        }

        // Calculer PnL
        let pnlPercent;
        if (position.direction === 'LONG') {
            pnlPercent = ((actualExitPrice - position.entryPrice) / position.entryPrice) * 100;
        } else {
            pnlPercent = ((position.entryPrice - actualExitPrice) / position.entryPrice) * 100;
        }

        const grossPnL = position.size * position.leverage * pnlPercent / 100;
        const exitFees = position.size * position.leverage * this.config.takerFee;
        const totalFees = position.fees + exitFees;
        const exitSlippageCost = exitSlippage * position.size * position.leverage / 100;
        const netPnL = grossPnL - exitFees - exitSlippageCost;

        console.log(`   Prix entrée: $${position.entryPrice.toFixed(4)}`);
        console.log(`   Prix sortie: $${actualExitPrice.toFixed(4)}`);
        console.log(`   Slippage sortie: ${position.direction === 'LONG' ? '-' : '+'}${(exitSlippage).toFixed(3)}%`);
        console.log(`   Fees sortie: $${exitFees.toFixed(4)}`);
        console.log(`   PnL brut: $${grossPnL.toFixed(2)}`);
        console.log(`   PnL net: $${netPnL.toFixed(2)} (${netPnL >= 0 ? '+' : ''}${(netPnL / position.size * 100).toFixed(2)}%)`);

        // Mettre à jour les stats
        this.state.balance += netPnL;
        this.state.stats.totalTrades++;
        this.state.stats.totalPnL += netPnL;
        this.state.stats.totalFees += exitFees;
        this.state.stats.totalSlippage += exitSlippageCost;

        if (netPnL > 0) {
            this.state.stats.wins++;
            console.log(`   ✅ WIN!`);
        } else {
            this.state.stats.losses++;
            console.log(`   ❌ LOSS`);
        }

        console.log(`   💰 Balance: $${this.state.balance.toFixed(2)}`);
        console.log('─'.repeat(50) + '\n');

        // Enregistrer le trade
        const trade = {
            ...position,
            exitPrice: actualExitPrice,
            exitSlippage,
            exitFees,
            grossPnL,
            netPnL,
            pnlPercent: netPnL / position.size * 100,
            closedAt: Date.now(),
            reason,
            isWin: netPnL > 0
        };

        this.state.trades.push(trade);

        // Supprimer la position
        this.state.positions.splice(posIndex, 1);

        this.saveState();

        return {
            success: true,
            trade,
            netPnL,
            balance: this.state.balance
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS & PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════

    getStatus() {
        const roi = ((this.state.balance - this.state.startBalance) / this.state.startBalance * 100);
        const wr = this.state.stats.totalTrades > 0
            ? (this.state.stats.wins / this.state.stats.totalTrades * 100)
            : 0;

        return {
            platform: this.platform,
            balance: this.state.balance,
            startBalance: this.state.startBalance,
            roi,
            openPositions: this.state.positions.length,
            stats: {
                ...this.state.stats,
                winRate: wr,
                avgPnL: this.state.stats.totalTrades > 0
                    ? this.state.stats.totalPnL / this.state.stats.totalTrades
                    : 0
            }
        };
    }

    displayStatus() {
        const s = this.getStatus();

        console.log('\n' + '═'.repeat(60));
        console.log(`🏛️ ${this.platform} DRY RUN - STATUS`);
        console.log('═'.repeat(60));

        console.log('\n💰 Balance:');
        console.log(`   Départ: $${s.startBalance.toFixed(2)}`);
        console.log(`   Actuel: $${s.balance.toFixed(2)}`);
        console.log(`   ROI: ${s.roi >= 0 ? '+' : ''}${s.roi.toFixed(2)}%`);

        console.log('\n📊 Trading Stats:');
        console.log(`   Trades: ${s.stats.totalTrades} | Wins: ${s.stats.wins} | Losses: ${s.stats.losses}`);
        console.log(`   Win Rate: ${s.stats.winRate.toFixed(1)}%`);
        console.log(`   PnL Total: $${s.stats.totalPnL.toFixed(2)}`);
        console.log(`   Avg PnL/Trade: $${s.stats.avgPnL.toFixed(2)}`);

        console.log('\n💸 Coûts:');
        console.log(`   Total Fees: $${s.stats.totalFees.toFixed(2)}`);
        console.log(`   Total Slippage: $${s.stats.totalSlippage.toFixed(2)}`);
        console.log(`   Rejects: ${s.stats.rejects}`);
        console.log(`   Partial Fills: ${s.stats.partialFills}`);

        console.log('\n📍 Positions Ouvertes:');
        if (this.state.positions.length === 0) {
            console.log('   Aucune');
        } else {
            this.state.positions.forEach(p => {
                console.log(`   ${p.coin} ${p.direction} | Entry: $${p.entryPrice.toFixed(4)} | Size: $${p.size.toFixed(2)}`);
            });
        }

        console.log('═'.repeat(60) + '\n');
    }

    saveState() {
        try {
            fs.writeFileSync(this.config.stateFile, JSON.stringify({
                ...this.state,
                savedAt: Date.now()
            }, null, 2));
        } catch (e) {}
    }

    loadState() {
        try {
            if (fs.existsSync(this.config.stateFile)) {
                const saved = JSON.parse(fs.readFileSync(this.config.stateFile, 'utf8'));
                this.state = { ...this.state, ...saved };
                console.log(`📂 ${this.platform} state chargé: $${this.state.balance.toFixed(2)}`);
            }
        } catch (e) {}
    }

    reset() {
        this.state = {
            balance: this.config.initialBalance || 100,
            startBalance: this.config.initialBalance || 100,
            positions: [],
            trades: [],
            stats: {
                totalTrades: 0,
                wins: 0,
                losses: 0,
                totalPnL: 0,
                totalFees: 0,
                totalSlippage: 0,
                rejects: 0,
                partialFills: 0,
            }
        };
        this.saveState();
        console.log(`🔄 ${this.platform} state reset`);
    }
}

module.exports = { DryRunExecutor };
