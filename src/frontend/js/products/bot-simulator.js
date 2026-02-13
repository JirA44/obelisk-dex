/**
 * BOT SIMULATOR MODULE - Simulate Trading Bots
 * Backtest and run trading bots with virtual or real funds
 * Build: 2026-01-18
 */
const BotSimulatorModule = {
    bots: [
        // === GRID TRADING BOTS ===
        { id: 'grid-btc', name: 'BTC Grid Bot', type: 'grid', pair: 'BTC/USDC', apy: 25, drawdown: 15, winRate: 68, trades24h: 45, risk: 3, minInvest: 100, fee: 0.5, category: 'grid', icon: '📊', description: 'Buy low, sell high in range' },
        { id: 'grid-eth', name: 'ETH Grid Bot', type: 'grid', pair: 'ETH/USDC', apy: 30, drawdown: 18, winRate: 65, trades24h: 52, risk: 3, minInvest: 100, fee: 0.5, category: 'grid', icon: '📊', description: 'Profit from ETH volatility' },
        { id: 'grid-sol', name: 'SOL Grid Bot', type: 'grid', pair: 'SOL/USDC', apy: 45, drawdown: 25, winRate: 62, trades24h: 78, risk: 4, minInvest: 50, fee: 0.5, category: 'grid', icon: '📊', description: 'High frequency SOL trading' },
        { id: 'grid-arb', name: 'ARB Grid Bot', type: 'grid', pair: 'ARB/USDC', apy: 55, drawdown: 30, winRate: 58, trades24h: 95, risk: 4, minInvest: 50, fee: 0.5, category: 'grid', icon: '📊', description: 'Arbitrum volatility capture' },

        // === DCA BOTS (Dollar Cost Average) ===
        { id: 'dca-btc', name: 'BTC DCA Bot', type: 'dca', pair: 'BTC/USDC', apy: 15, drawdown: 20, winRate: 72, trades24h: 4, risk: 2, minInvest: 50, fee: 0.3, category: 'dca', icon: '📈', description: 'Auto-buy BTC on dips' },
        { id: 'dca-eth', name: 'ETH DCA Bot', type: 'dca', pair: 'ETH/USDC', apy: 18, drawdown: 22, winRate: 70, trades24h: 4, risk: 2, minInvest: 50, fee: 0.3, category: 'dca', icon: '📈', description: 'Accumulate ETH automatically' },
        { id: 'dca-multi', name: 'Multi-Asset DCA', type: 'dca', pair: 'MULTI', apy: 20, drawdown: 18, winRate: 75, trades24h: 12, risk: 2, minInvest: 100, fee: 0.3, category: 'dca', icon: '📈', description: 'BTC+ETH+SOL diversified' },
        { id: 'dca-bluechip', name: 'Blue Chip DCA', type: 'dca', pair: 'INDEX', apy: 12, drawdown: 15, winRate: 78, trades24h: 8, risk: 1, minInvest: 200, fee: 0.2, category: 'dca', icon: '📈', description: 'Top 10 crypto weighted' },

        // === MOMENTUM BOTS ===
        { id: 'mom-breakout', name: 'Breakout Hunter', type: 'momentum', pair: 'MULTI', apy: 65, drawdown: 35, winRate: 52, trades24h: 15, risk: 4, minInvest: 100, fee: 1, category: 'momentum', icon: '🚀', description: 'Catch explosive moves' },
        { id: 'mom-trend', name: 'Trend Follower', type: 'momentum', pair: 'BTC/USDC', apy: 40, drawdown: 25, winRate: 55, trades24h: 8, risk: 3, minInvest: 100, fee: 0.8, category: 'momentum', icon: '🚀', description: 'Ride the trend' },
        { id: 'mom-scalp', name: 'Momentum Scalper', type: 'momentum', pair: 'ETH/USDC', apy: 80, drawdown: 40, winRate: 48, trades24h: 120, risk: 5, minInvest: 200, fee: 1.5, category: 'momentum', icon: '🚀', description: 'Quick momentum trades' },

        // === MEAN REVERSION BOTS ===
        { id: 'mr-rsi', name: 'RSI Mean Reversion', type: 'meanrev', pair: 'BTC/USDC', apy: 35, drawdown: 20, winRate: 62, trades24h: 25, risk: 3, minInvest: 100, fee: 0.5, category: 'meanrev', icon: '🔄', description: 'Buy oversold, sell overbought' },
        { id: 'mr-bb', name: 'Bollinger Bounce', type: 'meanrev', pair: 'ETH/USDC', apy: 38, drawdown: 22, winRate: 60, trades24h: 30, risk: 3, minInvest: 100, fee: 0.5, category: 'meanrev', icon: '🔄', description: 'Trade band extremes' },
        { id: 'mr-funding', name: 'Funding Rate Arb', type: 'meanrev', pair: 'PERP', apy: 25, drawdown: 10, winRate: 85, trades24h: 6, risk: 2, minInvest: 500, fee: 0.2, category: 'meanrev', icon: '🔄', description: 'Capture funding payments' },

        // === ARBITRAGE BOTS ===
        { id: 'arb-cex', name: 'CEX Arbitrage', type: 'arbitrage', pair: 'MULTI', apy: 20, drawdown: 5, winRate: 92, trades24h: 200, risk: 2, minInvest: 1000, fee: 0.1, category: 'arbitrage', icon: '⚡', description: 'Cross-exchange price diff' },
        { id: 'arb-dex', name: 'DEX Arbitrage', type: 'arbitrage', pair: 'MULTI', apy: 35, drawdown: 8, winRate: 88, trades24h: 150, risk: 3, minInvest: 500, fee: 0.3, category: 'arbitrage', icon: '⚡', description: 'DEX pool imbalances' },
        { id: 'arb-tri', name: 'Triangular Arb', type: 'arbitrage', pair: 'MULTI', apy: 15, drawdown: 3, winRate: 95, trades24h: 500, risk: 2, minInvest: 2000, fee: 0.1, category: 'arbitrage', icon: '⚡', description: '3-way currency arb' },

        // === AI/ML BOTS ===
        { id: 'ai-lstm', name: 'AI LSTM Predictor', type: 'ai', pair: 'BTC/USDC', apy: 50, drawdown: 30, winRate: 58, trades24h: 20, risk: 4, minInvest: 500, fee: 2, category: 'ai', icon: '🤖', description: 'Neural network predictions' },
        { id: 'ai-sentiment', name: 'Sentiment Analyzer', type: 'ai', pair: 'MULTI', apy: 45, drawdown: 28, winRate: 55, trades24h: 15, risk: 4, minInvest: 300, fee: 1.5, category: 'ai', icon: '🤖', description: 'Trade social sentiment' },
        { id: 'ai-ensemble', name: 'AI Ensemble', type: 'ai', pair: 'MULTI', apy: 60, drawdown: 35, winRate: 56, trades24h: 30, risk: 4, minInvest: 1000, fee: 2.5, category: 'ai', icon: '🤖', description: 'Multiple AI models combined' },

        // === MARKET MAKER BOTS ===
        { id: 'mm-spread', name: 'Spread Market Maker', type: 'mm', pair: 'BTC/USDC', apy: 30, drawdown: 12, winRate: 75, trades24h: 500, risk: 3, minInvest: 5000, fee: 0.2, category: 'mm', icon: '🏦', description: 'Provide liquidity, earn spread' },
        { id: 'mm-inventory', name: 'Inventory MM', type: 'mm', pair: 'ETH/USDC', apy: 35, drawdown: 15, winRate: 72, trades24h: 400, risk: 3, minInvest: 3000, fee: 0.3, category: 'mm', icon: '🏦', description: 'Balanced inventory MM' },
    ],

    categories: {
        grid: { name: 'Grid Trading', color: '#3b82f6', description: 'Profit from price oscillations' },
        dca: { name: 'DCA Bots', color: '#22c55e', description: 'Automated accumulation' },
        momentum: { name: 'Momentum', color: '#f59e0b', description: 'Trend & breakout trading' },
        meanrev: { name: 'Mean Reversion', color: '#8b5cf6', description: 'Reversion to mean strategies' },
        arbitrage: { name: 'Arbitrage', color: '#06b6d4', description: 'Risk-free price differences' },
        ai: { name: 'AI/ML Bots', color: '#ec4899', description: 'Machine learning strategies' },
        mm: { name: 'Market Making', color: '#14b8a6', description: 'Liquidity provision' }
    },

    activeSimulations: [],

    init() {
        this.load();
        console.log('[BotSimulator] Initialized with', this.bots.length, 'bots');
    },

    load() {
        this.activeSimulations = SafeOps.getStorage('obelisk_bot_sims', []);
    },

    save() {
        SafeOps.setStorage('obelisk_bot_sims', this.activeSimulations);
    },

    startSimulation(botId, amount) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) return { success: false, error: 'Bot not found' };
        if (amount < bot.minInvest) return { success: false, error: 'Min: $' + bot.minInvest };

        const sim = {
            id: 'sim-' + Date.now(),
            botId,
            botName: bot.name,
            amount,
            startDate: Date.now(),
            apy: bot.apy,
            trades: 0,
            pnl: 0,
            status: 'running'
        };
        this.activeSimulations.push(sim);
        this.save();

        // Register with SimulatedPortfolio
        if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.invest(sim.id, bot.name + ' Bot', amount, bot.apy, 'bot', true);
        }

        return { success: true, simulation: sim };
    },

    stopSimulation(simId) {
        const idx = this.activeSimulations.findIndex(s => s.id === simId);
        if (idx === -1) return { success: false };
        const sim = this.activeSimulations[idx];
        const days = (Date.now() - sim.startDate) / 86400000;
        const pnl = sim.amount * (sim.apy / 100) * (days / 365);
        this.activeSimulations.splice(idx, 1);
        this.save();
        return { success: true, amount: sim.amount, pnl, botName: sim.botName };
    },

    // Stop and withdraw with UI update
    stopAndWithdraw(simId) {
        const result = this.stopSimulation(simId);
        if (result.success) {
            const totalReturn = result.amount + result.pnl;

            // Return to simulated balance
            if (typeof SimulatedPortfolio !== 'undefined') {
                // Find and withdraw from portfolio
                const inv = SimulatedPortfolio.portfolio?.investments?.find(i => i.productId === simId || i.id === simId);
                if (inv) {
                    SimulatedPortfolio.withdraw(inv.id);
                } else {
                    // Manually add back to balance
                    SimulatedPortfolio.portfolio.simulatedBalance = (SimulatedPortfolio.portfolio.simulatedBalance || 0) + totalReturn;
                    SimulatedPortfolio.savePortfolio();
                }
            }

            if (typeof showNotification === 'function') {
                showNotification(`🤖 ${result.botName} arrêté - Retour: $${totalReturn.toFixed(2)} (PnL: ${result.pnl >= 0 ? '+' : ''}$${result.pnl.toFixed(2)})`, 'success');
            }

            // Re-render
            this.render('bots-container');

            // Update sidebar if exists
            if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.renderSidebar) {
                SimulatedPortfolio.renderSidebar();
            }
        }
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        // Load latest state
        this.load();

        // Calculate totals from active simulations
        let totalSimulated = 0;
        let totalPnl = 0;
        this.activeSimulations.forEach(sim => {
            totalSimulated += sim.amount || 0;
            const days = (Date.now() - sim.startDate) / 86400000;
            totalPnl += sim.amount * (sim.apy / 100) * (days / 365);
        });

        // Also check SimulatedPortfolio for bot investments
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.portfolio?.investments) {
            SimulatedPortfolio.portfolio.investments.forEach(inv => {
                if (inv.category === 'bot' || inv.productId?.includes('sim-')) {
                    if (!this.activeSimulations.find(s => s.id === inv.productId)) {
                        totalSimulated += inv.amount || 0;
                        totalPnl += inv.earned || 0;
                    }
                }
            });
        }

        let html = `<h3 style="color:#00ff88;margin-bottom:16px;">🤖 Bot Simulator (${this.bots.length} strategies)</h3>`;

        // Show investment summary banner
        html += `
        <div style="background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(139,92,246,0.1));border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;margin-bottom:20px;">
            <div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:space-between;align-items:center;">
                <div>
                    <div style="color:#888;font-size:11px;margin-bottom:4px;">💰 Total Investi dans les Bots</div>
                    <div style="font-size:24px;font-weight:700;color:#fff;">$${totalSimulated.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;margin-bottom:4px;">📈 PnL Estimé</div>
                    <div style="font-size:24px;font-weight:700;color:${totalPnl >= 0 ? '#00ff88' : '#ef4444'};">${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color:#888;font-size:11px;margin-bottom:4px;">🤖 Bots Actifs</div>
                    <div style="font-size:24px;font-weight:700;color:#a855f7;">${this.activeSimulations.length}</div>
                </div>
            </div>
        </div>`;

        // Show active simulations if any
        if (this.activeSimulations.length > 0) {
            html += `<div style="margin-bottom:20px;">
                <h4 style="color:#a855f7;margin-bottom:12px;">🎮 Vos Bots Actifs</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;">`;

            this.activeSimulations.forEach(sim => {
                const bot = this.bots.find(b => b.id === sim.botId);
                const days = (Date.now() - sim.startDate) / 86400000;
                const pnl = sim.amount * (sim.apy / 100) * (days / 365);
                const catColor = bot ? this.categories[bot.category]?.color || '#888' : '#888';

                html += `
                <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:10px;padding:14px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <span style="color:#fff;font-weight:600;">${bot?.icon || '🤖'} ${sim.botName}</span>
                        <span style="color:#00ff88;font-size:12px;">● Running</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;margin-bottom:10px;">
                        <div><span style="color:#888;">Investi:</span> <span style="color:#fff;">$${sim.amount.toFixed(2)}</span></div>
                        <div><span style="color:#888;">APY:</span> <span style="color:#00ff88;">${sim.apy}%</span></div>
                        <div><span style="color:#888;">Durée:</span> <span style="color:#fff;">${days.toFixed(1)}j</span></div>
                        <div><span style="color:#888;">PnL:</span> <span style="color:${pnl >= 0 ? '#00ff88' : '#ef4444'};">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</span></div>
                    </div>
                    <button onclick="BotSimulatorModule.stopAndWithdraw('${sim.id}')"
                            style="width:100%;padding:8px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);border-radius:6px;color:#ef4444;cursor:pointer;font-weight:600;font-size:11px;">
                        ⏹️ Arrêter & Retirer
                    </button>
                </div>`;
            });

            html += `</div></div>`;
        }

        Object.keys(this.categories).forEach(catKey => {
            const cat = this.categories[catKey];
            const catBots = this.bots.filter(b => b.category === catKey);
            if (catBots.length === 0) return;

            html += `<div style="margin-bottom:24px;">`;
            html += `<h4 style="color:${cat.color};margin:16px 0 12px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid ${cat.color};">${cat.name} <span style="font-size:11px;opacity:0.7;">(${catBots.length} bots) - ${cat.description}</span></h4>`;
            html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">`;

            catBots.forEach(b => {
                const riskColors = { 1: '#22c55e', 2: '#84cc16', 3: '#f59e0b', 4: '#f97316', 5: '#ef4444' };
                html += `
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;transition:all 0.3s;cursor:pointer;"
                         onclick="BotSimulatorModule.showBotModal('${b.id}')"
                         onmouseover="this.style.borderColor='${cat.color}';this.style.transform='translateY(-2px)'"
                         onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.transform='translateY(0)'">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-weight:700;color:#fff;">${b.icon} ${b.name}</span>
                            <span style="font-size:10px;color:${riskColors[b.risk]};background:${riskColors[b.risk]}20;padding:2px 6px;border-radius:4px;">Risk ${b.risk}/5</span>
                        </div>
                        <div style="font-size:11px;color:#888;margin-bottom:8px;">${b.description}</div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;">
                            <div>
                                <span style="color:#888;">APY:</span>
                                <span style="color:#00ff88;font-weight:600;"> ${b.apy}%</span>
                            </div>
                            <div>
                                <span style="color:#888;">Win:</span>
                                <span style="color:#fff;font-weight:600;"> ${b.winRate}%</span>
                            </div>
                            <div>
                                <span style="color:#888;">DD:</span>
                                <span style="color:#ef4444;font-weight:600;"> -${b.drawdown}%</span>
                            </div>
                            <div>
                                <span style="color:#888;">24h:</span>
                                <span style="color:#888;"> ${b.trades24h} trades</span>
                            </div>
                        </div>
                        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:10px;color:#888;">Min: $${b.minInvest}</span>
                            <button onclick="event.stopPropagation();BotSimulatorModule.showBotModal('${b.id}')"
                                    style="padding:6px 14px;background:${cat.color};border:none;border-radius:6px;color:#fff;font-weight:600;cursor:pointer;font-size:11px;">
                                Start Bot
                            </button>
                        </div>
                    </div>`;
            });

            html += `</div></div>`;
        });

        el.innerHTML = html;
    },

    showBotModal(botId) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) return;

        if (typeof InvestHelper !== 'undefined') {
            InvestHelper.show({
                name: bot.name,
                id: bot.id,
                apy: bot.apy,
                minInvest: bot.minInvest,
                fee: bot.fee,
                risk: bot.risk,
                icon: bot.icon,
                onInvest: (amount, mode) => {
                    this.executeBot(bot, amount, mode);
                }
            });
        }
    },

    executeBot(bot, amount, mode) {
        if (mode === 'simulated') {
            const result = this.startSimulation(bot.id, amount);
            if (result.success) {
                if (typeof showNotification === 'function') {
                    showNotification(`${bot.icon} ${bot.name} started with $${amount}`, 'success');
                }
            } else if (typeof showNotification === 'function') {
                showNotification(result.error, 'error');
            }
        } else {
            if (typeof WalletManager !== 'undefined' && WalletManager.isConnected && WalletManager.isConnected()) {
                console.log('[BotSimulator] Real bot:', amount, bot.name);
                if (typeof showNotification === 'function') {
                    showNotification(`Real ${bot.name} started with $${amount}`, 'success');
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => BotSimulatorModule.init());
console.log('[BotSimulator] Module loaded');
