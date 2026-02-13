/**
 * PNL CALCULATOR - Profit & Loss Scenarios
 * Calculate PnL for different price scenarios
 */
const PnLCalculatorModule = {
    scenarios: [],

    calculate(params) {
        const {
            entryPrice,
            exitPrice,
            positionSize,
            leverage = 1,
            side = 'long',
            fees = 0.1 // Total fees in %
        } = params;

        if (!entryPrice || !exitPrice || !positionSize) return null;

        const notional = positionSize * leverage;
        const priceChange = ((exitPrice - entryPrice) / entryPrice) * 100;

        let pnlPercent = side === 'long' ? priceChange : -priceChange;
        pnlPercent *= leverage;

        const grossPnl = (notional * pnlPercent) / 100;
        const feeAmount = (notional * fees) / 100;
        const netPnl = grossPnl - feeAmount;
        const roe = (netPnl / positionSize) * 100;

        return {
            grossPnl: grossPnl.toFixed(2),
            feeAmount: feeAmount.toFixed(2),
            netPnl: netPnl.toFixed(2),
            pnlPercent: pnlPercent.toFixed(2),
            roe: roe.toFixed(2),
            priceChange: priceChange.toFixed(2),
            notional: notional.toFixed(2),
            isProfit: netPnl >= 0
        };
    },

    generateScenarios(entryPrice, positionSize, leverage, side) {
        const scenarios = [];
        const percentages = [-20, -15, -10, -5, -3, -2, -1, 0, 1, 2, 3, 5, 10, 15, 20];

        percentages.forEach(pct => {
            const exitPrice = entryPrice * (1 + pct / 100);
            const result = this.calculate({
                entryPrice, exitPrice, positionSize, leverage, side
            });
            if (result) {
                scenarios.push({
                    priceChange: pct,
                    exitPrice: exitPrice.toFixed(2),
                    ...result
                });
            }
        });

        return scenarios;
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">💰 PnL Calculator</h2>
                <p style="color:#888;margin-bottom:20px;">Calculate profit/loss scenarios • Visualize outcomes</p>

                <div style="display:grid;grid-template-columns:1fr 2fr;gap:20px;">
                    <!-- Input Form -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">⚙️ Trade Parameters</h3>

                        <div style="display:grid;gap:12px;">
                            <div>
                                <label style="color:#888;font-size:12px;">Side</label>
                                <div style="display:flex;gap:8px;margin-top:4px;">
                                    <button id="pnl-side-long" onclick="document.getElementById('pnl-side-long').classList.add('active');document.getElementById('pnl-side-short').classList.remove('active')"
                                            class="active"
                                            style="flex:1;padding:10px;background:rgba(34,197,94,0.3);border:1px solid rgba(34,197,94,0.5);border-radius:8px;color:#22c55e;cursor:pointer;font-weight:bold;">
                                        LONG
                                    </button>
                                    <button id="pnl-side-short" onclick="document.getElementById('pnl-side-short').classList.add('active');document.getElementById('pnl-side-long').classList.remove('active')"
                                            style="flex:1;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(239,68,68,0.5);border-radius:8px;color:#ef4444;cursor:pointer;font-weight:bold;">
                                        SHORT
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label style="color:#888;font-size:12px;">Entry Price ($)</label>
                                <input type="number" id="pnl-entry" placeholder="97000" step="0.01"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>

                            <div>
                                <label style="color:#888;font-size:12px;">Position Size ($)</label>
                                <input type="number" id="pnl-size" placeholder="1000" step="1"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>

                            <div>
                                <label style="color:#888;font-size:12px;">Leverage</label>
                                <input type="number" id="pnl-leverage" value="10" min="1" max="100"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>

                            <div>
                                <label style="color:#888;font-size:12px;">Exit Price (optional)</label>
                                <input type="number" id="pnl-exit" placeholder="100000" step="0.01"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>

                            <button onclick="PnLCalculatorModule.calculateFromUI()"
                                    style="width:100%;padding:14px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;margin-top:8px;">
                                📊 Calculate Scenarios
                            </button>
                        </div>
                    </div>

                    <!-- Results -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📊 PnL Scenarios</h3>
                        <div id="pnl-results">
                            <div style="text-align:center;padding:40px;color:#888;">
                                Enter parameters to see PnL scenarios
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    calculateFromUI() {
        const entryPrice = parseFloat(document.getElementById('pnl-entry')?.value);
        const positionSize = parseFloat(document.getElementById('pnl-size')?.value);
        const leverage = parseFloat(document.getElementById('pnl-leverage')?.value) || 10;
        const exitPrice = parseFloat(document.getElementById('pnl-exit')?.value);
        const side = document.getElementById('pnl-side-long')?.classList.contains('active') ? 'long' : 'short';

        if (!entryPrice || !positionSize) {
            document.getElementById('pnl-results').innerHTML = `
                <div style="text-align:center;padding:20px;color:#ef4444;">⚠️ Please enter Entry Price and Position Size</div>
            `;
            return;
        }

        const scenarios = this.generateScenarios(entryPrice, positionSize, leverage, side);

        // If specific exit price, calculate and highlight
        let specificResult = null;
        if (exitPrice) {
            specificResult = this.calculate({ entryPrice, exitPrice, positionSize, leverage, side });
        }

        document.getElementById('pnl-results').innerHTML = `
            ${specificResult ? `
                <div style="background:linear-gradient(135deg,${specificResult.isProfit ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'},rgba(0,0,0,0.3));border:1px solid ${specificResult.isProfit ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'};border-radius:12px;padding:16px;margin-bottom:16px;text-align:center;">
                    <div style="color:#888;font-size:12px;">Exit @ $${exitPrice.toFixed(2)}</div>
                    <div style="color:${specificResult.isProfit ? '#22c55e' : '#ef4444'};font-size:32px;font-weight:bold;">
                        ${specificResult.isProfit ? '+' : ''}$${specificResult.netPnl}
                    </div>
                    <div style="color:#888;font-size:12px;">ROE: ${specificResult.roe}% | Fees: $${specificResult.feeAmount}</div>
                </div>
            ` : ''}

            <div style="max-height:350px;overflow-y:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:12px;">
                    <thead style="position:sticky;top:0;background:#1a1a2e;">
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                            <th style="padding:8px;text-align:center;color:#888;">Price Δ</th>
                            <th style="padding:8px;text-align:right;color:#888;">Exit Price</th>
                            <th style="padding:8px;text-align:right;color:#888;">PnL</th>
                            <th style="padding:8px;text-align:right;color:#888;">ROE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scenarios.map(s => `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);${s.priceChange === 0 ? 'background:rgba(255,255,255,0.05);' : ''}">
                                <td style="padding:8px;text-align:center;color:${s.priceChange > 0 ? '#22c55e' : s.priceChange < 0 ? '#ef4444' : '#888'};">
                                    ${s.priceChange > 0 ? '+' : ''}${s.priceChange}%
                                </td>
                                <td style="padding:8px;text-align:right;color:#fff;">$${s.exitPrice}</td>
                                <td style="padding:8px;text-align:right;color:${s.isProfit ? '#22c55e' : '#ef4444'};font-weight:bold;">
                                    ${s.isProfit ? '+' : ''}$${s.netPnl}
                                </td>
                                <td style="padding:8px;text-align:right;color:${s.isProfit ? '#22c55e' : '#ef4444'};">
                                    ${s.isProfit ? '+' : ''}${s.roe}%
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;font-size:11px;color:#888;">
                <strong>Trade Info:</strong> ${side.toUpperCase()} | Entry: $${entryPrice} | Size: $${positionSize} | Leverage: ${leverage}x | Notional: $${(positionSize * leverage).toFixed(0)}
            </div>
        `;
    }
};

window.PnLCalculatorModule = PnLCalculatorModule;
