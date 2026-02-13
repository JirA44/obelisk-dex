/**
 * OBELISK Lending Simulator
 * Simule des utilisateurs qui empruntent, remboursent et perdent des prêts
 * Montre l'évolution du score de crédit
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Profils d'emprunteurs
const BORROWER_PROFILES = {
    EXCELLENT: {
        name: 'Excellent Borrower',
        behavior: 'always_early',
        defaultChance: 0,
        lateChance: 0
    },
    GOOD: {
        name: 'Good Borrower',
        behavior: 'on_time',
        defaultChance: 0,
        lateChance: 0.1
    },
    AVERAGE: {
        name: 'Average Borrower',
        behavior: 'sometimes_late',
        defaultChance: 0.05,
        lateChance: 0.3
    },
    RISKY: {
        name: 'Risky Borrower',
        behavior: 'often_late',
        defaultChance: 0.2,
        lateChance: 0.5
    },
    BAD: {
        name: 'Bad Borrower',
        behavior: 'defaults',
        defaultChance: 0.5,
        lateChance: 0.7
    }
};

class LendingUser {
    constructor(id, profileType) {
        this.id = `lending_user_${id}`;
        this.profile = BORROWER_PROFILES[profileType];
        this.profileType = profileType;
        this.loans = [];
        this.creditHistory = [];
    }

    async depositCollateral(token, amount) {
        try {
            const response = await axios.post(`${API_URL}/api/lending/collateral/deposit`, {
                userId: this.id,
                token,
                amount
            });
            console.log(`[${this.id}] Deposited ${amount} ${token} as collateral`);
            return response.data;
        } catch (error) {
            console.error(`[${this.id}] Failed to deposit:`, error.response?.data || error.message);
            return null;
        }
    }

    async borrow(token, amount, durationDays) {
        try {
            const response = await axios.post(`${API_URL}/api/lending/borrow`, {
                userId: this.id,
                token,
                amount,
                durationDays
            });

            if (response.data.success) {
                this.loans.push(response.data.loan);
                console.log(`[${this.id}] Borrowed ${amount} ${token} for ${durationDays} days | Interest: ${response.data.loan.interest.toFixed(4)} ${token}`);
            } else {
                console.log(`[${this.id}] Borrow failed: ${response.data.error}`);
            }

            return response.data;
        } catch (error) {
            console.error(`[${this.id}] Failed to borrow:`, error.response?.data || error.message);
            return null;
        }
    }

    async repay(loanId, amount) {
        try {
            const response = await axios.post(`${API_URL}/api/lending/repay`, {
                userId: this.id,
                loanId,
                amount
            });

            if (response.data.success) {
                console.log(`[${this.id}] Repaid ${amount} | Status: ${response.data.payment.status}`);
                if (response.data.creditScore) {
                    this.creditHistory.push(response.data.creditScore);
                }
            }

            return response.data;
        } catch (error) {
            console.error(`[${this.id}] Failed to repay:`, error.response?.data || error.message);
            return null;
        }
    }

    async getStatus() {
        try {
            const response = await axios.get(`${API_URL}/api/lending/user/${this.id}`);
            return response.data;
        } catch (error) {
            console.error(`[${this.id}] Failed to get status:`, error.response?.data || error.message);
            return null;
        }
    }

    async simulateLoanCycle() {
        // 1. Déposer du collatéral
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`[${this.id}] ${this.profile.name} - Starting loan cycle`);

        const collateralAmount = 1 + Math.random() * 2; // 1-3 BTC
        await this.depositCollateral('BTC', collateralAmount);

        // 2. Emprunter
        const borrowAmount = 20000 + Math.random() * 30000; // $20k-$50k USDC
        const duration = [7, 14, 30][Math.floor(Math.random() * 3)];
        const borrowResult = await this.borrow('USDC', borrowAmount, duration);

        if (!borrowResult || !borrowResult.success) {
            console.log(`[${this.id}] Could not borrow - cycle aborted`);
            return;
        }

        const loan = borrowResult.loan;

        // 3. Attendre un moment simulé puis rembourser (ou pas)
        await new Promise(r => setTimeout(r, 1000));

        // Déterminer le comportement
        const roll = Math.random();

        if (roll < this.profile.defaultChance) {
            // DEFAULT - Ne pas rembourser
            console.log(`[${this.id}] DEFAULTING on loan! Collateral will be seized.`);
            // La liquidation sera vérifiée par le système
            try {
                const liquidation = await axios.get(`${API_URL}/api/lending/liquidation/${this.id}`);
                if (liquidation.data.needsLiquidation) {
                    console.log(`[${this.id}] LIQUIDATED! Credit score heavily impacted.`);
                }
            } catch (e) {
                // Ignore
            }
        } else if (roll < this.profile.defaultChance + this.profile.lateChance) {
            // LATE payment
            console.log(`[${this.id}] Paying LATE (with penalty)...`);
            await this.repay(loan.id, loan.totalDue * 1.02); // 2% extra for penalty
        } else if (this.profile.behavior === 'always_early') {
            // EARLY payment
            console.log(`[${this.id}] Paying EARLY!`);
            await this.repay(loan.id, loan.totalDue);
        } else {
            // ON TIME payment
            console.log(`[${this.id}] Paying ON TIME`);
            await this.repay(loan.id, loan.totalDue);
        }

        // 4. Afficher le statut final
        const status = await this.getStatus();
        if (status) {
            const emoji = this.getCreditEmoji(status.credit.score);
            console.log(`[${this.id}] Credit: ${emoji} ${status.credit.score} (${status.credit.tier})`);
        }
    }

    getCreditEmoji(score) {
        if (score >= 900) return '🏆';
        if (score >= 800) return '⭐';
        if (score >= 700) return '✅';
        if (score >= 600) return '⚠️';
        if (score >= 400) return '🔶';
        return '❌';
    }
}

async function runLendingSimulation() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║          OBELISK LENDING SYSTEM SIMULATOR                            ║');
    console.log('╠══════════════════════════════════════════════════════════════════════╣');
    console.log('║  Simulating borrowers with different credit behaviors                ║');
    console.log('║  Watch how credit scores evolve based on repayment behavior          ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log('');

    // Créer des utilisateurs avec différents profils
    const users = [
        new LendingUser(1, 'EXCELLENT'),
        new LendingUser(2, 'GOOD'),
        new LendingUser(3, 'AVERAGE'),
        new LendingUser(4, 'RISKY'),
        new LendingUser(5, 'BAD')
    ];

    // Chaque utilisateur fait plusieurs cycles de prêt
    const CYCLES = 3;

    for (let cycle = 1; cycle <= CYCLES; cycle++) {
        console.log('');
        console.log('═'.repeat(70));
        console.log(`                    CYCLE ${cycle} of ${CYCLES}`);
        console.log('═'.repeat(70));

        for (const user of users) {
            await user.simulateLoanCycle();
            await new Promise(r => setTimeout(r, 500)); // Pause entre users
        }
    }

    // Résumé final
    console.log('');
    console.log('═'.repeat(70));
    console.log('                    FINAL CREDIT SCORES');
    console.log('═'.repeat(70));
    console.log('');
    console.log('User ID                          | Profile      | Score | Tier  | Status');
    console.log('─'.repeat(70));

    for (const user of users) {
        const status = await user.getStatus();
        if (status) {
            const credit = status.credit;
            const emoji = user.getCreditEmoji(credit.score);
            console.log(
                `${user.id.padEnd(32)} | ${user.profile.name.padEnd(12)} | ${credit.score.toString().padStart(5)} | ${credit.tier.padEnd(5)} | ${emoji} ${credit.tierLabel}`
            );
        }
    }

    console.log('─'.repeat(70));
    console.log('');
    console.log('Credit Tiers:');
    console.log('  AAA (900+)  = Excellent - 30% interest discount, 85% LTV');
    console.log('  AA  (800+)  = Very Good - 20% interest discount, 80% LTV');
    console.log('  A   (700+)  = Good      - 10% interest discount, 75% LTV');
    console.log('  BBB (600+)  = Fair      - Standard rates, 70% LTV');
    console.log('  BB  (500+)  = Below Avg - +10% interest, 60% LTV');
    console.log('  B   (400+)  = Poor      - +25% interest, 50% LTV');
    console.log('  CCC (300+)  = Very Poor - +50% interest, 40% LTV');
    console.log('  D   (0-299) = Default   - Cannot borrow');
    console.log('');
}

// Vérifier que le serveur est accessible
async function checkServer() {
    try {
        const response = await axios.get(`${API_URL}/health`);
        return response.data.status === 'ok';
    } catch (error) {
        return false;
    }
}

async function main() {
    console.log(`Checking server at ${API_URL}...`);

    const serverOk = await checkServer();
    if (!serverOk) {
        console.error('Server not accessible. Please start the server first:');
        console.error('  npm run ultra');
        process.exit(1);
    }

    console.log('Server OK!');
    await runLendingSimulation();
    process.exit(0);
}

main().catch(console.error);
