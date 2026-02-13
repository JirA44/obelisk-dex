// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - MICRO GAINS TRACKER
// Track gains down to $0.001 - Perfect for micro investments
// Every cent matters, every gain counts!
// ═══════════════════════════════════════════════════════════════════════════════

const MicroGainsTracker = {
    // Configuration
    config: {
        precision: 6,           // Decimal places to track (down to $0.000001)
        showCents: true,        // Always show cents
        animateGains: true,     // Animate gain updates
        celebrateMilestones: true,  // Celebrate at $0.01, $0.10, $1, etc.
        trackPerSecond: true,   // Show gains per second
        soundEnabled: false     // Play sound on gains
    },

    // Milestones for celebration
    milestones: [
        { threshold: 0.01, emoji: '🎉', message: 'First cent earned!' },
        { threshold: 0.10, emoji: '✨', message: '10 cents milestone!' },
        { threshold: 0.50, emoji: '🌟', message: 'Half dollar reached!' },
        { threshold: 1.00, emoji: '💫', message: '$1 milestone!' },
        { threshold: 5.00, emoji: '🎊', message: '$5 achieved!' },
        { threshold: 10.00, emoji: '🏆', message: '$10 milestone!' },
        { threshold: 25.00, emoji: '👑', message: '$25 master!' },
        { threshold: 50.00, emoji: '💎', message: '$50 legend!' },
        { threshold: 100.00, emoji: '🚀', message: '$100 whale!' }
    ],

    // Format micro amounts with high precision
    formatMicroAmount(amount, options = {}) {
        const { showSign = true, color = true, precision = 6 } = options;

        // Determine precision based on amount
        let decimals;
        if (Math.abs(amount) < 0.01) {
            decimals = 6;
        } else if (Math.abs(amount) < 0.10) {
            decimals = 4;
        } else if (Math.abs(amount) < 1) {
            decimals = 3;
        } else if (Math.abs(amount) < 10) {
            decimals = 2;
        } else {
            decimals = 2;
        }

        const sign = showSign && amount >= 0 ? '+' : '';
        const formatted = amount.toFixed(decimals);

        if (color) {
            const clr = amount >= 0 ? '#00ff88' : '#ff6464';
            return `<span style="color:${clr}">${sign}$${formatted}</span>`;
        }
        return `${sign}$${formatted}`;
    },

    // Calculate gains per time unit
    calculateGainsRate(totalGains, daysElapsed) {
        if (daysElapsed <= 0) daysElapsed = 1/24; // At least 1 hour

        const perDay = totalGains / daysElapsed;
        const perHour = perDay / 24;
        const perMinute = perHour / 60;
        const perSecond = perMinute / 60;

        return {
            perDay: perDay,
            perHour: perHour,
            perMinute: perMinute,
            perSecond: perSecond,
            perWeek: perDay * 7,
            perMonth: perDay * 30,
            perYear: perDay * 365
        };
    },

    // Check if milestone reached
    checkMilestone(previousGains, currentGains) {
        for (const milestone of this.milestones) {
            if (previousGains < milestone.threshold && currentGains >= milestone.threshold) {
                return milestone;
            }
        }
        return null;
    },

    // Get next milestone
    getNextMilestone(currentGains) {
        for (const milestone of this.milestones) {
            if (currentGains < milestone.threshold) {
                return {
                    ...milestone,
                    remaining: milestone.threshold - currentGains,
                    progress: (currentGains / milestone.threshold) * 100
                };
            }
        }
        // All milestones reached
        return {
            threshold: currentGains * 2,
            emoji: '🌟',
            message: 'Next 2x!',
            remaining: currentGains,
            progress: 50
        };
    },

    // Render micro gains widget
    renderMicroGainsWidget(investment) {
        const calc = InvestmentTracker.calculateCurrentValue(investment);
        const rates = this.calculateGainsRate(calc.pnl, calc.daysElapsed || 1/24);
        const nextMilestone = this.getNextMilestone(Math.max(0, calc.pnl));
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        const pnlColor = calc.pnl >= 0 ? '#00ff88' : '#ff6464';
        const pnlSign = calc.pnl >= 0 ? '+' : '';

        return `
            <div class="micro-gains-widget" style="background:linear-gradient(180deg, #0d0d1a, #0a0a15);border-radius:16px;padding:20px;border:1px solid ${pnlColor}30;">
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:1.5rem;">${investment.comboIcon}</span>
                        <div>
                            <div style="color:#fff;font-weight:600;">${investment.comboName}</div>
                            <div style="color:#666;font-size:0.8rem;">${isFr ? 'Investi' : 'Invested'}: $${investment.amount.toFixed(2)}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:${pnlColor};font-size:1.8rem;font-weight:700;">
                            ${this.formatMicroAmount(calc.pnl, { color: false })}
                        </div>
                        <div style="color:#888;font-size:0.75rem;">${isFr ? 'Gains totaux' : 'Total gains'}</div>
                    </div>
                </div>

                <!-- Live Value Counter -->
                <div style="background:#0a0a15;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center;">
                    <div style="color:#666;font-size:0.75rem;margin-bottom:4px;">${isFr ? 'Valeur actuelle' : 'Current Value'}</div>
                    <div style="color:#00d4ff;font-size:2.2rem;font-weight:700;font-family:monospace;">
                        $${calc.currentValue.toFixed(this.config.precision)}
                    </div>
                </div>

                <!-- Gains Rate -->
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;margin-bottom:16px;">
                    <div style="background:#0a0a15;border-radius:10px;padding:12px;text-align:center;">
                        <div style="color:${pnlColor};font-size:0.95rem;font-weight:600;">
                            ${this.formatMicroAmount(rates.perHour, { color: false })}
                        </div>
                        <div style="color:#666;font-size:0.7rem;">${isFr ? '/heure' : '/hour'}</div>
                    </div>
                    <div style="background:#0a0a15;border-radius:10px;padding:12px;text-align:center;">
                        <div style="color:${pnlColor};font-size:0.95rem;font-weight:600;">
                            ${this.formatMicroAmount(rates.perDay, { color: false })}
                        </div>
                        <div style="color:#666;font-size:0.7rem;">${isFr ? '/jour' : '/day'}</div>
                    </div>
                    <div style="background:#0a0a15;border-radius:10px;padding:12px;text-align:center;">
                        <div style="color:${pnlColor};font-size:0.95rem;font-weight:600;">
                            ${this.formatMicroAmount(rates.perMonth, { color: false })}
                        </div>
                        <div style="color:#666;font-size:0.7rem;">${isFr ? '/mois' : '/month'}</div>
                    </div>
                </div>

                <!-- Per Second (Real-time) -->
                ${this.config.trackPerSecond ? `
                    <div style="background:linear-gradient(90deg, ${pnlColor}10, transparent);border-left:3px solid ${pnlColor};padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:16px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="color:#888;font-size:0.8rem;">⚡ ${isFr ? 'Gains/seconde' : 'Gains/second'}</span>
                            <span style="color:${pnlColor};font-weight:600;font-family:monospace;">
                                ${rates.perSecond > 0 ? '+' : ''}$${rates.perSecond.toFixed(8)}/s
                            </span>
                        </div>
                    </div>
                ` : ''}

                <!-- Milestone Progress -->
                <div style="background:#0a0a15;border-radius:12px;padding:14px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <span style="color:#888;font-size:0.8rem;">${isFr ? 'Prochain objectif' : 'Next milestone'}</span>
                        <span style="color:#fff;font-weight:600;">
                            ${nextMilestone.emoji} $${nextMilestone.threshold.toFixed(2)}
                        </span>
                    </div>
                    <div style="background:#1a1a2e;border-radius:8px;height:8px;overflow:hidden;">
                        <div style="background:linear-gradient(90deg, #00d4ff, #7b2fff);height:100%;width:${Math.min(100, nextMilestone.progress)}%;transition:width 0.5s;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:6px;">
                        <span style="color:#666;font-size:0.7rem;">${nextMilestone.progress.toFixed(1)}%</span>
                        <span style="color:#666;font-size:0.7rem;">
                            ${isFr ? 'Reste' : 'Remaining'}: ${this.formatMicroAmount(nextMilestone.remaining, { showSign: false, color: false })}
                        </span>
                    </div>
                </div>

                <!-- Time Stats -->
                <div style="margin-top:14px;padding-top:14px;border-top:1px solid #1a1a2e;display:flex;justify-content:space-between;">
                    <div style="color:#666;font-size:0.75rem;">
                        📅 ${calc.daysElapsed} ${isFr ? 'jours' : 'days'}
                    </div>
                    <div style="color:#666;font-size:0.75rem;">
                        📈 ${calc.pnlPercent >= 0 ? '+' : ''}${calc.pnlPercent.toFixed(4)}%
                    </div>
                </div>
            </div>
        `;
    },

    // Render all investments in micro format
    renderAllMicroInvestments() {
        if (typeof InvestmentTracker === 'undefined' || !InvestmentTracker.investments) {
            return '<p style="color:#888;text-align:center;">No investments found</p>';
        }

        if (InvestmentTracker.investments.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <div class="micro-investments-list" style="display:flex;flex-direction:column;gap:16px;">
                ${InvestmentTracker.investments.map(inv => this.renderMicroGainsWidget(inv)).join('')}
            </div>
        `;
    },

    // Empty state with micro investment suggestions
    renderEmptyState() {
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        return `
            <div style="text-align:center;padding:40px 20px;background:#0a0a15;border-radius:16px;">
                <div style="font-size:4rem;margin-bottom:16px;">🌱</div>
                <h3 style="color:#fff;margin:0 0 10px 0;">${isFr ? 'Commencez petit, grandissez grand!' : 'Start small, grow big!'}</h3>
                <p style="color:#888;margin:0 0 24px 0;max-width:300px;margin-left:auto;margin-right:auto;">
                    ${isFr ? 'Investissez dès $1 et regardez chaque centime grandir' : 'Invest from just $1 and watch every cent grow'}
                </p>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;max-width:400px;margin:0 auto 24px;">
                    <div style="background:#1a1a2e;border-radius:10px;padding:12px;">
                        <div style="color:#00d4aa;font-size:1.2rem;font-weight:700;">$1</div>
                        <div style="color:#666;font-size:0.7rem;">${isFr ? 'Minimum' : 'Minimum'}</div>
                    </div>
                    <div style="background:#1a1a2e;border-radius:10px;padding:12px;">
                        <div style="color:#00d4ff;font-size:1.2rem;font-weight:700;">35+</div>
                        <div style="color:#666;font-size:0.7rem;">${isFr ? 'Micro Combos' : 'Micro Combos'}</div>
                    </div>
                    <div style="background:#1a1a2e;border-radius:10px;padding:12px;">
                        <div style="color:#9966ff;font-size:1.2rem;font-weight:700;">$0.01</div>
                        <div style="color:#666;font-size:0.7rem;">${isFr ? 'Suivi précis' : 'Cent tracking'}</div>
                    </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:8px;max-width:300px;margin:0 auto;">
                    <button onclick="window.location.href='combos.html'" style="background:linear-gradient(90deg, #00d4ff, #7b2fff);border:none;color:#fff;padding:14px 24px;border-radius:10px;font-weight:600;cursor:pointer;font-size:1rem;">
                        ${isFr ? '🚀 Voir les Micro Combos' : '🚀 See Micro Combos'}
                    </button>
                    <button onclick="window.location.href='app.html'" style="background:#1a1a2e;border:1px solid #333;color:#fff;padding:12px 24px;border-radius:10px;cursor:pointer;">
                        ${isFr ? '📚 En savoir plus' : '📚 Learn more'}
                    </button>
                </div>
            </div>
        `;
    },

    // Summary card for dashboard
    renderSummaryCard() {
        if (typeof InvestmentTracker === 'undefined') return '';

        const stats = InvestmentTracker.getPortfolioStats();
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        if (stats.totalInvested === 0) {
            return `
                <div style="background:#0a0a15;border-radius:12px;padding:16px;text-align:center;">
                    <div style="color:#666;">🌱 ${isFr ? 'Commencez dès $1' : 'Start from $1'}</div>
                </div>
            `;
        }

        const rates = this.calculateGainsRate(stats.totalPnl, 30); // Assume 30 days average
        const pnlColor = stats.totalPnl >= 0 ? '#00ff88' : '#ff6464';

        return `
            <div style="background:linear-gradient(135deg, #0d0d1a, #0a0a15);border-radius:16px;padding:20px;border:1px solid ${pnlColor}30;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <span style="color:#888;font-size:0.85rem;">💰 ${isFr ? 'Gains Totaux' : 'Total Gains'}</span>
                    <span style="color:${pnlColor};font-size:1.4rem;font-weight:700;">
                        ${this.formatMicroAmount(stats.totalPnl, { color: false })}
                    </span>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="background:#0a0a15;border-radius:8px;padding:10px;text-align:center;">
                        <div style="color:#fff;font-weight:600;">$${stats.totalInvested.toFixed(2)}</div>
                        <div style="color:#666;font-size:0.7rem;">${isFr ? 'Investi' : 'Invested'}</div>
                    </div>
                    <div style="background:#0a0a15;border-radius:8px;padding:10px;text-align:center;">
                        <div style="color:#00d4aa;font-weight:600;">$${stats.currentValue.toFixed(2)}</div>
                        <div style="color:#666;font-size:0.7rem;">${isFr ? 'Valeur' : 'Value'}</div>
                    </div>
                </div>

                <div style="margin-top:12px;text-align:center;color:#666;font-size:0.75rem;">
                    ⚡ ${this.formatMicroAmount(rates.perDay, { color: false, showSign: true })}${isFr ? '/jour' : '/day'}
                </div>
            </div>
        `;
    },

    // Initialize and start real-time updates
    init() {
        console.log('[MicroGainsTracker] Initialized');

        // Auto-update every second if enabled
        if (this.config.trackPerSecond) {
            setInterval(() => {
                const widgets = document.querySelectorAll('.micro-gains-widget');
                if (widgets.length > 0) {
                    // Trigger re-render or just update values
                    this.updateLiveValues();
                }
            }, 1000);
        }
    },

    updateLiveValues() {
        // Update live counters without full re-render
        // This would be called every second for smooth animations
        const valueElements = document.querySelectorAll('[data-micro-live]');
        valueElements.forEach(el => {
            const investmentId = el.dataset.investmentId;
            // Update specific values...
        });
    }
};

// Auto-init when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MicroGainsTracker.init());
    } else {
        MicroGainsTracker.init();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicroGainsTracker;
}
