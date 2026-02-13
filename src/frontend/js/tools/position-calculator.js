/**
 * POSITION CALCULATOR - Professional Position Sizing Tool
 * Calculate position size, margin, liquidation price, risk
 */
const PositionCalculatorModule = {
    // Default values
    defaults: {
        accountSize: 10000,
        riskPercent: 2,
        leverage: 10
    },

    calculate(params) {
        const {
            accountSize = this.defaults.accountSize,
            entryPrice,
            stopLoss,
            riskPercent = this.defaults.riskPercent,
            leverage = this.defaults.leverage,
            side = 'long'
        } = params;

        if (!entryPrice || !stopLoss) return null;

        // Risk amount in USD
        const riskAmount = accountSize * (riskPercent / 100);

        // Stop distance (%)
        const stopDistance = Math.abs((entryPrice - stopLoss) / entryPrice) * 100;

        // Position size calculation
        const positionSize = riskAmount / (stopDistance / 100);

        // Actual size with leverage
        const marginRequired = positionSize / leverage;

        // Liquidation price (simplified)
        const liqDistance = 100 / leverage * 0.9; // 90% of max move
        const liquidationPrice = side === 'long'
            ? entryPrice * (1 - liqDistance / 100)
            : entryPrice * (1 + liqDistance / 100);

        // R:R if take profit provided
        const takeProfit = params.takeProfit;
        let riskReward = null;
        if (takeProfit) {
            const tpDistance = Math.abs((takeProfit - entryPrice) / entryPrice) * 100;
            riskReward = tpDistance / stopDistance;
        }

        return {
            positionSize: positionSize.toFixed(2),
            marginRequired: marginRequired.toFixed(2),
            riskAmount: riskAmount.toFixed(2),
            stopDistance: stopDistance.toFixed(2),
            liquidationPrice: liquidationPrice.toFixed(2),
            riskReward: riskReward ? riskReward.toFixed(2) : null,
            maxLoss: riskAmount.toFixed(2),
            leverage
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">📐 Position Calculator</h2>
                <p style="color:#888;margin-bottom:20px;">Calculate optimal position size based on risk management</p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <!-- Input Form -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">⚙️ Parameters</h3>

                        <div style="display:grid;gap:12px;">
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div>
                                    <label style="color:#888;font-size:12px;">Account Size ($)</label>
                                    <input type="number" id="calc-account" value="10000"
                                           style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                </div>
                                <div>
                                    <label style="color:#888;font-size:12px;">Risk per Trade (%)</label>
                                    <input type="number" id="calc-risk" value="2" step="0.5" max="10"
                                           style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                </div>
                            </div>

                            <div>
                                <label style="color:#888;font-size:12px;">Side</label>
                                <div style="display:flex;gap:8px;margin-top:4px;">
                                    <button onclick="this.parentElement.dataset.side='long';this.style.background='rgba(34,197,94,0.3)';this.nextElementSibling.style.background='rgba(255,255,255,0.05)'"
                                            style="flex:1;padding:10px;background:rgba(34,197,94,0.3);border:1px solid rgba(34,197,94,0.5);border-radius:8px;color:#22c55e;cursor:pointer;font-weight:bold;">
                                        🟢 LONG
                                    </button>
                                    <button onclick="this.parentElement.dataset.side='short';this.style.background='rgba(239,68,68,0.3)';this.previousElementSibling.style.background='rgba(255,255,255,0.05)'"
                                            style="flex:1;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(239,68,68,0.5);border-radius:8px;color:#ef4444;cursor:pointer;font-weight:bold;">
                                        🔴 SHORT
                                    </button>
                                </div>
                            </div>

                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div>
                                    <label style="color:#888;font-size:12px;">Entry Price ($)</label>
                                    <input type="number" id="calc-entry" placeholder="97000" step="0.01"
                                           style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                </div>
                                <div>
                                    <label style="color:#888;font-size:12px;">Leverage</label>
                                    <input type="number" id="calc-leverage" value="10" min="1" max="100"
                                           style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                </div>
                            </div>

                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div>
                                    <label style="color:#ef4444;font-size:12px;">Stop Loss ($)</label>
                                    <input type="number" id="calc-sl" placeholder="95000" step="0.01"
                                           style="width:100%;padding:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;color:#ef4444;margin-top:4px;">
                                </div>
                                <div>
                                    <label style="color:#22c55e;font-size:12px;">Take Profit ($)</label>
                                    <input type="number" id="calc-tp" placeholder="102000" step="0.01"
                                           style="width:100%;padding:10px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;color:#22c55e;margin-top:4px;">
                                </div>
                            </div>

                            <button onclick="PositionCalculatorModule.calculateFromUI()"
                                    style="width:100%;padding:14px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;margin-top:8px;">
                                📊 Calculate Position
                            </button>
                        </div>
                    </div>

                    <!-- Results -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📊 Results</h3>
                        <div id="calc-results" style="display:grid;gap:12px;">
                            <div style="text-align:center;padding:40px;color:#888;">
                                Enter parameters and click Calculate
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Reference -->
                <div style="margin-top:20px;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;">
                    <h4 style="color:#00ff88;margin-bottom:8px;">💡 Risk Management Rules</h4>
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;color:#888;font-size:12px;">
                        <div>• Never risk more than 2% per trade</div>
                        <div>• Aim for R:R of 2:1 minimum</div>
                        <div>• Use stop loss on every trade</div>
                        <div>• Reduce size in high volatility</div>
                    </div>
                </div>
            </div>
        `;
    },

    calculateFromUI() {
        const accountSize = parseFloat(document.getElementById('calc-account')?.value) || 10000;
        const riskPercent = parseFloat(document.getElementById('calc-risk')?.value) || 2;
        const entryPrice = parseFloat(document.getElementById('calc-entry')?.value);
        const leverage = parseFloat(document.getElementById('calc-leverage')?.value) || 10;
        const stopLoss = parseFloat(document.getElementById('calc-sl')?.value);
        const takeProfit = parseFloat(document.getElementById('calc-tp')?.value);
        const sideEl = document.querySelector('[data-side]');
        const side = sideEl?.dataset?.side || 'long';

        if (!entryPrice || !stopLoss) {
            document.getElementById('calc-results').innerHTML = `
                <div style="text-align:center;padding:20px;color:#ef4444;">
                    ⚠️ Please enter Entry Price and Stop Loss
                </div>
            `;
            return;
        }

        const result = this.calculate({
            accountSize, riskPercent, entryPrice, leverage, stopLoss, takeProfit, side
        });

        const resultsEl = document.getElementById('calc-results');
        resultsEl.innerHTML = `
            <div style="background:linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,170,255,0.1));border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                <div style="color:#888;font-size:12px;">Recommended Position Size</div>
                <div style="color:#00ff88;font-size:32px;font-weight:bold;">$${result.positionSize}</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;">
                    <div style="color:#888;font-size:11px;">Margin Required</div>
                    <div style="color:#fff;font-size:18px;font-weight:bold;">$${result.marginRequired}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;">
                    <div style="color:#888;font-size:11px;">Max Loss (Risk)</div>
                    <div style="color:#ef4444;font-size:18px;font-weight:bold;">$${result.maxLoss}</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;">
                    <div style="color:#888;font-size:11px;">Stop Distance</div>
                    <div style="color:#ffaa00;font-size:18px;font-weight:bold;">${result.stopDistance}%</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;">
                    <div style="color:#888;font-size:11px;">Liquidation Price</div>
                    <div style="color:#f59e0b;font-size:18px;font-weight:bold;">$${result.liquidationPrice}</div>
                </div>
            </div>

            ${result.riskReward ? `
                <div style="background:${parseFloat(result.riskReward) >= 2 ? 'rgba(34,197,94,0.2)' : 'rgba(255,170,0,0.2)'};border:1px solid ${parseFloat(result.riskReward) >= 2 ? 'rgba(34,197,94,0.4)' : 'rgba(255,170,0,0.4)'};border-radius:8px;padding:12px;text-align:center;">
                    <div style="color:#888;font-size:11px;">Risk/Reward Ratio</div>
                    <div style="color:${parseFloat(result.riskReward) >= 2 ? '#22c55e' : '#ffaa00'};font-size:24px;font-weight:bold;">
                        1:${result.riskReward} ${parseFloat(result.riskReward) >= 2 ? '✅' : '⚠️'}
                    </div>
                </div>
            ` : ''}

            <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;font-size:11px;color:#888;">
                <strong>Summary:</strong> With $${accountSize} account, risking ${riskPercent}% ($${result.maxLoss}) at ${result.leverage}x leverage
            </div>
        `;
    }
};

window.PositionCalculatorModule = PositionCalculatorModule;
