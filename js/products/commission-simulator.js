/**
 * OBELISK DEX - Commission Simulator
 * Simule des utilisateurs et bots pour tester le systeme de commissions
 */

const CommissionSimulator = {
    // Stats de simulation
    stats: {
        totalTransactions: 0,
        totalVolume: 0,
        totalFees: 0,
        feesByUser: {},
        feesByBot: {},
        transactions: []
    },

    // Configuration
    config: {
        feeRecipient: '0xB6Ef69E5850dB1ae0792C3B6ec0a867E5FbD8476',
        feePercent: 0.002,  // 0.2%
        simulationSpeed: 500  // ms entre transactions
    },

    // Types d'utilisateurs simules
    userTypes: [
        { type: 'whale', minTx: 10000, maxTx: 100000, frequency: 0.1 },
        { type: 'trader', minTx: 1000, maxTx: 10000, frequency: 0.3 },
        { type: 'retail', minTx: 50, maxTx: 1000, frequency: 0.4 },
        { type: 'bot', minTx: 100, maxTx: 5000, frequency: 0.2 }
    ],

    // Generer une adresse aleatoire
    randomAddress() {
        return '0x' + Array.from({length: 40}, () =>
            Math.floor(Math.random() * 16).toString(16)).join('');
    },

    // Simuler une transaction
    simulateTransaction(userType) {
        const user = this.userTypes.find(u => u.type === userType) || this.userTypes[2];
        const amount = Math.random() * (user.maxTx - user.minTx) + user.minTx;
        const fee = amount * this.config.feePercent;
        const userAddress = this.randomAddress();

        const tx = {
            id: 'TX_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            timestamp: Date.now(),
            userType: user.type,
            userAddress: userAddress,
            amount: amount,
            fee: fee,
            feeRecipient: this.config.feeRecipient,
            status: 'completed'
        };

        // Mettre a jour les stats
        this.stats.totalTransactions++;
        this.stats.totalVolume += amount;
        this.stats.totalFees += fee;
        this.stats.transactions.push(tx);

        // Garder les 100 dernieres
        if (this.stats.transactions.length > 100) {
            this.stats.transactions.shift();
        }

        // Stats par type
        if (user.type === 'bot') {
            this.stats.feesByBot[userAddress] = (this.stats.feesByBot[userAddress] || 0) + fee;
        } else {
            this.stats.feesByUser[userAddress] = (this.stats.feesByUser[userAddress] || 0) + fee;
        }

        // Log dans FeeConfig si disponible
        if (typeof FeeConfig !== 'undefined') {
            FeeConfig.logFeeCollection(tx.id, fee, 'simulation');
        }

        return tx;
    },

    // Lancer la simulation
    running: false,
    intervalId: null,

    start(transactionsPerSecond = 2) {
        if (this.running) return;
        this.running = true;

        console.log('🤖 Commission Simulator started');
        console.log('📍 Fee Recipient:', this.config.feeRecipient);

        const interval = 1000 / transactionsPerSecond;
        this.intervalId = setInterval(() => {
            // Choisir un type aleatoire pondere
            const rand = Math.random();
            let cumulative = 0;
            let selectedType = 'retail';

            for (const user of this.userTypes) {
                cumulative += user.frequency;
                if (rand <= cumulative) {
                    selectedType = user.type;
                    break;
                }
            }

            const tx = this.simulateTransaction(selectedType);
            this.updateUI(tx);
        }, interval);

        this.showDashboard();
    },

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.running = false;
        console.log('🛑 Commission Simulator stopped');
        this.printSummary();
    },

    // Afficher le dashboard
    showDashboard() {
        let dashboard = document.getElementById('commission-dashboard');
        if (!dashboard) {
            dashboard = document.createElement('div');
            dashboard.id = 'commission-dashboard';
            dashboard.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 350px;
                background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                border: 1px solid #00ff88;
                border-radius: 12px;
                padding: 16px;
                z-index: 9999;
                font-family: monospace;
                color: #fff;
                box-shadow: 0 10px 40px rgba(0, 255, 136, 0.2);
            `;
            document.body.appendChild(dashboard);
        }
        this.updateDashboard();
    },

    updateDashboard() {
        const dashboard = document.getElementById('commission-dashboard');
        if (!dashboard) return;

        dashboard.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="margin:0;color:#00ff88;">🤖 Commission Simulator</h3>
                <button onclick="CommissionSimulator.stop()" style="background:#ff4444;border:none;color:#fff;padding:4px 12px;border-radius:6px;cursor:pointer;">Stop</button>
            </div>
            <div style="background:rgba(0,255,136,0.1);padding:10px;border-radius:8px;margin-bottom:12px;">
                <div style="color:#888;font-size:11px;">Fee Recipient</div>
                <div style="color:#00ff88;font-size:12px;word-break:break-all;">${this.config.feeRecipient}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#888;font-size:11px;">Transactions</div>
                    <div style="color:#fff;font-size:18px;font-weight:bold;">${this.stats.totalTransactions}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#888;font-size:11px;">Volume Total</div>
                    <div style="color:#fff;font-size:18px;font-weight:bold;">$${this.stats.totalVolume.toFixed(0)}</div>
                </div>
            </div>
            <div style="background:rgba(0,255,136,0.2);padding:12px;border-radius:8px;text-align:center;margin-bottom:12px;">
                <div style="color:#00ff88;font-size:12px;">COMMISSIONS ENCAISSEES</div>
                <div style="color:#00ff88;font-size:28px;font-weight:bold;">$${this.stats.totalFees.toFixed(2)}</div>
                <div style="color:#888;font-size:11px;">${this.config.feePercent * 100}% de ${this.stats.totalVolume.toFixed(0)}</div>
            </div>
            <div style="font-size:11px;color:#888;">
                <div style="margin-bottom:4px;">Dernieres transactions:</div>
                ${this.stats.transactions.slice(-5).reverse().map(tx => `
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #222;">
                        <span style="color:${tx.userType === 'bot' ? '#ff9900' : tx.userType === 'whale' ? '#00aaff' : '#fff'};">
                            ${tx.userType === 'bot' ? '🤖' : tx.userType === 'whale' ? '🐋' : tx.userType === 'trader' ? '📊' : '👤'}
                            $${tx.amount.toFixed(0)}
                        </span>
                        <span style="color:#00ff88;">+$${tx.fee.toFixed(4)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    updateUI(tx) {
        this.updateDashboard();

        // Notification
        if (typeof showNotification === 'function' && this.stats.totalTransactions % 10 === 0) {
            showNotification(`🤖 ${this.stats.totalTransactions} tx | Commissions: $${this.stats.totalFees.toFixed(2)}`, 'info');
        }
    },

    printSummary() {
        console.log('\n📊 SIMULATION SUMMARY');
        console.log('═'.repeat(40));
        console.log(`Total Transactions: ${this.stats.totalTransactions}`);
        console.log(`Total Volume: $${this.stats.totalVolume.toFixed(2)}`);
        console.log(`Total Fees Collected: $${this.stats.totalFees.toFixed(2)}`);
        console.log(`Fee Recipient: ${this.config.feeRecipient}`);
        console.log(`Unique Users: ${Object.keys(this.stats.feesByUser).length}`);
        console.log(`Active Bots: ${Object.keys(this.stats.feesByBot).length}`);
        console.log('═'.repeat(40));
    },

    // Reset stats
    reset() {
        this.stats = {
            totalTransactions: 0,
            totalVolume: 0,
            totalFees: 0,
            feesByUser: {},
            feesByBot: {},
            transactions: []
        };
        console.log('🔄 Stats reset');
    }
};

// Export
if (typeof window !== 'undefined') {
    window.CommissionSimulator = CommissionSimulator;
}

console.log('🤖 Commission Simulator loaded. Use CommissionSimulator.start() to begin.');
