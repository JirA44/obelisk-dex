/**
 * OBELISK DEX - Portfolio Fix
 * S'assure que le bouton portfolio et les donnees sont toujours accessibles
 */

const PortfolioFix = {
    init() {
        this.ensureButtonExists();
        this.ensureDataExists();
        this.addQuickAccessPanel();

        // FORCER l'injection des panneaux partout
        setTimeout(() => this.injectDepositPanels(), 500);
        setTimeout(() => this.updateAllBalanceDisplays(), 600);

        // Re-verifier regulierement
        setInterval(() => {
            this.ensureButtonExists();
            this.injectDepositPanels();
            this.updateAllBalanceDisplays();
        }, 2000);

        console.log('🔧 Portfolio Fix loaded');
    },

    injectDepositPanels() {
        const tabIds = ['tab-investments', 'tab-combos', 'tab-banking', 'tab-portfolio', 'tab-swap', 'tab-trading'];

        tabIds.forEach(tabId => {
            const section = document.getElementById(tabId);
            if (!section) return;
            if (section.querySelector('.js-deposit-panel')) return;

            const panel = document.createElement('div');
            panel.className = 'js-deposit-panel';
            panel.style.cssText = 'background:linear-gradient(135deg,rgba(0,255,136,0.2),rgba(139,92,246,0.2));border:2px solid #00ff88;border-radius:16px;padding:20px;margin:15px;';
            panel.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;flex-wrap:wrap;gap:10px;">
                    <h3 style="margin:0;color:#00ff88;font-size:16px;">💵 Capital Simule</h3>
                    <span class="sim-balance-display" style="font-size:16px;color:#fff;font-weight:700;background:rgba(0,0,0,0.4);padding:8px 16px;border-radius:20px;">$0.00</span>
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button onclick="PortfolioFix.addSimulated(100)" style="flex:1;min-width:70px;padding:12px;background:#00ff88;border:none;border-radius:10px;color:#000;font-weight:700;cursor:pointer;">+$100</button>
                    <button onclick="PortfolioFix.addSimulated(1000)" style="flex:1;min-width:70px;padding:12px;background:#00ff88;border:none;border-radius:10px;color:#000;font-weight:700;cursor:pointer;">+$1K</button>
                    <button onclick="PortfolioFix.addSimulated(10000)" style="flex:1;min-width:70px;padding:12px;background:#00ff88;border:none;border-radius:10px;color:#000;font-weight:700;cursor:pointer;">+$10K</button>
                    <button onclick="PortfolioFix.addSimulated(100000)" style="flex:1;min-width:70px;padding:12px;background:#a855f7;border:none;border-radius:10px;color:#fff;font-weight:700;cursor:pointer;">+$100K</button>
                </div>
            `;
            section.insertBefore(panel, section.firstChild);
        });
        this.updateAllBalanceDisplays();
    },

    ensureButtonExists() {
        let btn = document.getElementById('simulated-portfolio-btn');

        if (!btn) {
            // Creer le bouton s'il n'existe pas
            btn = document.createElement('button');
            btn.id = 'simulated-portfolio-btn';
            btn.onclick = () => {
                if (typeof SimulatedPortfolio !== 'undefined') {
                    SimulatedPortfolio.openModal();
                } else {
                    alert('SimulatedPortfolio non charge');
                }
            };
            document.body.appendChild(btn);
        }

        // Forcer le style
        btn.style.cssText = `
            position: fixed !important;
            bottom: 140px !important;
            right: 20px !important;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
            color: #000 !important;
            border: none !important;
            padding: 12px 20px !important;
            border-radius: 30px !important;
            font-weight: 700 !important;
            font-size: 14px !important;
            cursor: pointer !important;
            z-index: 9999 !important;
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4) !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;

        // Mettre a jour le texte
        if (typeof SimulatedPortfolio !== 'undefined') {
            const total = SimulatedPortfolio.getTotalValue().total;
            btn.innerHTML = `💰 $${this.formatAmount(total)}`;
        } else {
            btn.innerHTML = '💰 Portfolio';
        }
    },

    ensureDataExists() {
        // Verifier si les donnees existent
        const saved = localStorage.getItem('obelisk_simulated_portfolio');

        if (!saved && typeof SimulatedPortfolio !== 'undefined') {
            // Initialiser avec des valeurs par defaut
            SimulatedPortfolio.resetPortfolio();
            console.log('🔧 Portfolio reset to defaults');
        }
    },

    addQuickAccessPanel() {
        if (document.getElementById('mega-deposit-panel')) return;

        // GROS PANNEAU IMPOSSIBLE A RATER
        const panel = document.createElement('div');
        panel.id = 'mega-deposit-panel';
        panel.innerHTML = `
            <div style="background:#00ff88;color:#000;padding:10px 15px;font-weight:bold;font-size:16px;display:flex;justify-content:space-between;align-items:center;">
                <span>💵 AJOUTER USDC SIMULE</span>
                <span class="sim-balance-display" style="background:#000;color:#00ff88;padding:5px 10px;border-radius:10px;">$0</span>
            </div>
            <div style="padding:15px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <button onclick="PortfolioFix.addSimulated(100)" style="padding:15px;background:#00ff88;border:none;border-radius:10px;color:#000;font-weight:bold;font-size:16px;cursor:pointer;">+$100</button>
                <button onclick="PortfolioFix.addSimulated(1000)" style="padding:15px;background:#00ff88;border:none;border-radius:10px;color:#000;font-weight:bold;font-size:16px;cursor:pointer;">+$1K</button>
                <button onclick="PortfolioFix.addSimulated(10000)" style="padding:15px;background:#00ff88;border:none;border-radius:10px;color:#000;font-weight:bold;font-size:16px;cursor:pointer;">+$10K</button>
                <button onclick="PortfolioFix.addSimulated(100000)" style="padding:15px;background:#a855f7;border:none;border-radius:10px;color:#fff;font-weight:bold;font-size:16px;cursor:pointer;">+$100K</button>
            </div>
            <div style="padding:0 15px 15px;display:flex;gap:10px;">
                <input type="number" id="quick-add-amount" placeholder="Montant..." style="flex:1;padding:12px;border:2px solid #00ff88;border-radius:8px;background:#000;color:#fff;font-size:14px;">
                <button onclick="PortfolioFix.addCustomAmount()" style="padding:12px 20px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">OK</button>
            </div>
            <div style="padding:10px 15px;background:rgba(0,0,0,0.5);font-size:11px;color:#888;text-align:center;">
                🎮 Mode simulation - argent virtuel
            </div>
        `;
        panel.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: #0a0a15 !important;
            border: 3px solid #00ff88 !important;
            border-radius: 20px !important;
            width: 320px !important;
            z-index: 99999 !important;
            box-shadow: 0 0 50px rgba(0,255,136,0.5) !important;
            animation: pulse-glow 2s infinite !important;
        `;
        document.body.appendChild(panel);

        // Ajouter animation CSS
        if (!document.getElementById('mega-panel-style')) {
            const style = document.createElement('style');
            style.id = 'mega-panel-style';
            style.textContent = `
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 30px rgba(0,255,136,0.4); }
                    50% { box-shadow: 0 0 60px rgba(0,255,136,0.8); }
                }
                #mega-deposit-panel button:hover {
                    transform: scale(1.05);
                    transition: transform 0.2s;
                }
            `;
            document.head.appendChild(style);
        }

        // Bouton pour fermer/rouvrir
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:none;border:none;color:#000;font-size:20px;cursor:pointer;';
        closeBtn.onclick = () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        };
        panel.querySelector('div').appendChild(closeBtn);

        this.injectStyles();
    },

    addSimulated(amount) {
        if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.portfolio.simulatedBalance += amount;
            SimulatedPortfolio.portfolio.totalDeposited += amount;
            SimulatedPortfolio.saveState();
            SimulatedPortfolio.updateUI();

            // Mettre a jour tous les affichages de solde
            this.updateAllBalanceDisplays();

            if (typeof showNotification === 'function') {
                showNotification(`+$${amount.toLocaleString()} ajoute en simule!`, 'success');
            }
        }
    },

    updateAllBalanceDisplays() {
        if (typeof SimulatedPortfolio === 'undefined') return;

        const balance = SimulatedPortfolio.portfolio.simulatedBalance || 0;
        const formatted = '$' + this.formatAmount(balance);

        // Mettre a jour tous les elements avec la classe sim-balance-display
        document.querySelectorAll('.sim-balance-display').forEach(el => {
            el.textContent = formatted;
        });

        // Mettre a jour aussi les IDs specifiques
        const ids = ['invest-sim-balance', 'combo-sim-balance', 'banking-sim-balance'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = formatted;
        });
    },

    addCustomAmount() {
        // Chercher dans les deux inputs possibles
        let input = document.getElementById('quick-add-amount') || document.getElementById('custom-sim-deposit');
        if (!input) return;

        const amount = parseFloat(input.value);
        if (amount > 0) {
            this.addSimulated(amount);
            input.value = '';
        }
    },

    formatAmount(value) {
        if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
        return value.toFixed(2);
    },

    injectStyles() {
        if (document.getElementById('portfolio-fix-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'portfolio-fix-styles';
        styles.textContent = `
            #quick-add-panel .quick-add-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 14px;
                background: rgba(0, 255, 136, 0.1);
                color: #00ff88;
                font-size: 12px;
                font-weight: 600;
            }

            #quick-add-panel .quick-add-header button {
                background: none;
                border: none;
                color: #00ff88;
                cursor: pointer;
                font-size: 12px;
            }

            #quick-add-panel .quick-add-body {
                padding: 12px;
            }

            #quick-add-panel.collapsed .quick-add-body {
                display: none;
            }

            #quick-add-panel .quick-add-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 10px;
            }

            #quick-add-panel .quick-add-buttons button {
                padding: 10px;
                background: rgba(0, 255, 136, 0.15);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 8px;
                color: #00ff88;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            #quick-add-panel .quick-add-buttons button:hover {
                background: rgba(0, 255, 136, 0.3);
            }

            #quick-add-panel .quick-add-custom {
                display: flex;
                gap: 8px;
            }

            #quick-add-panel .quick-add-custom input {
                flex: 1;
                padding: 8px 10px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #fff;
                font-size: 13px;
            }

            #quick-add-panel .quick-add-custom button {
                padding: 8px 12px;
                background: #00ff88;
                border: none;
                border-radius: 6px;
                color: #000;
                font-weight: 600;
                cursor: pointer;
            }
        `;
        document.head.appendChild(styles);
    }
};

// Auto-init avec delai
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => PortfolioFix.init(), 1000);
    });
} else {
    setTimeout(() => PortfolioFix.init(), 1000);
}

window.PortfolioFix = PortfolioFix;
