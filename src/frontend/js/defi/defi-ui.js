// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - DEFI UI FUNCTIONS
// User interface helpers for DeFi health check and protocol display
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run DeFi health check and update UI
 */
async function runDeFiHealthCheck() {
    console.log('[DeFi UI] Running health check...');

    // Update icons to loading
    const icons = ['ethers', 'aave', 'gmx', 'aerodrome', 'manager', 'wallet'];
    icons.forEach(id => {
        const el = document.getElementById(`icon-${id}`);
        if (el) el.textContent = '⏳';
    });

    // Quick check first
    const quick = typeof DeFiHealthCheck !== 'undefined' ? DeFiHealthCheck.quickCheck() : {
        ethers: typeof ethers !== 'undefined',
        aave: typeof AaveIntegration !== 'undefined',
        gmx: typeof GMXIntegration !== 'undefined',
        aerodrome: typeof AerodromeIntegration !== 'undefined',
        defiManager: typeof DeFiManager !== 'undefined',
        wallet: typeof window.ethereum !== 'undefined'
    };

    // Update UI based on quick check
    updateStatusIcon('ethers', quick.ethers);
    updateStatusIcon('aave', quick.aave);
    updateStatusIcon('gmx', quick.gmx);
    updateStatusIcon('aerodrome', quick.aerodrome);
    updateStatusIcon('manager', quick.defiManager);
    updateStatusIcon('wallet', quick.wallet);

    // Run full health check if available
    if (typeof DeFiHealthCheck !== 'undefined') {
        try {
            const report = await DeFiHealthCheck.runAllChecks();
            showHealthResult(report);
        } catch (err) {
            console.error('[DeFi UI] Health check error:', err);
            showHealthResult({ error: err.message });
        }
    } else {
        showHealthResult({
            summary: {
                passed: Object.values(quick).filter(v => v).length,
                total: Object.keys(quick).length
            }
        });
    }
}

/**
 * Update status icon
 */
function updateStatusIcon(id, isOk) {
    const el = document.getElementById(`icon-${id}`);
    if (el) {
        el.textContent = isOk ? '✅' : '❌';
        el.style.color = isOk ? '#00ff88' : '#ff4444';
    }

    const container = document.getElementById(`status-${id}`);
    if (container) {
        container.style.borderColor = isOk ? '#00ff88' : '#ff4444';
        container.style.borderWidth = '1px';
        container.style.borderStyle = 'solid';
    }
}

/**
 * Show health check result
 */
function showHealthResult(report) {
    const resultDiv = document.getElementById('defi-health-result');
    if (!resultDiv) return;

    resultDiv.style.display = 'block';

    if (report.error) {
        resultDiv.style.background = 'rgba(255,68,68,0.2)';
        resultDiv.style.border = '1px solid #ff4444';
        resultDiv.innerHTML = `<span style="color:#ff4444;">❌ Error: ${report.error}</span>`;
        return;
    }

    const passed = report.summary?.passed || 0;
    const total = report.summary?.total || 6;
    const healthy = passed === total;

    resultDiv.style.background = healthy ? 'rgba(0,255,136,0.1)' : 'rgba(255,187,0,0.1)';
    resultDiv.style.border = `1px solid ${healthy ? '#00ff88' : '#ffbb00'}`;

    const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

    let html = `
        <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="color:${healthy ? '#00ff88' : '#ffbb00'};font-weight:bold;">
                ${healthy ? '🎉' : '⚠️'} ${passed}/${total} ${isFr ? 'vérifications passées' : 'checks passed'}
            </span>
            <span style="color:#888;font-size:12px;">
                ${new Date().toLocaleTimeString()}
            </span>
        </div>
    `;

    // Add test details if available
    if (report.tests && report.tests.length > 0) {
        html += `<div style="margin-top:10px;font-size:12px;">`;
        report.tests.forEach(test => {
            const icon = test.status === 'passed' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
            html += `<div style="color:#aaa;margin:4px 0;">${icon} ${test.name}</div>`;
        });
        html += `</div>`;
    }

    resultDiv.innerHTML = html;
}

/**
 * Show DeFi protocols modal
 */
function showDeFiProtocols() {
    if (typeof DeFiManager === 'undefined') {
        const fr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';
        alert(fr ? 'DeFi Manager non chargé' : 'DeFi Manager not loaded');
        return;
    }

    const protocols = DeFiManager.getBestRiskAdjusted();
    const isFr = typeof I18n !== 'undefined' && I18n.currentLang === 'fr';

    let html = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:500;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
            <div style="background:#1a1a2e;border-radius:16px;padding:30px;max-width:800px;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h2 style="color:#00ff88;margin:0;">${isFr ? '📊 Protocoles DeFi Disponibles' : '📊 Available DeFi Protocols'}</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none;border:none;color:#fff;font-size:24px;cursor:pointer;">&times;</button>
                </div>

                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <thead>
                        <tr style="background:#0d0d1a;color:#00ff88;">
                            <th style="padding:12px;text-align:left;">${isFr ? 'Protocole' : 'Protocol'}</th>
                            <th style="padding:12px;text-align:center;">Chain</th>
                            <th style="padding:12px;text-align:center;">${isFr ? 'Risque' : 'Risk'}</th>
                            <th style="padding:12px;text-align:center;">APY</th>
                            <th style="padding:12px;text-align:center;">Score</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    const riskColors = {
        1: '#00ff88',
        2: '#4ade80',
        3: '#fbbf24',
        4: '#f97316',
        5: '#ef4444'
    };

    protocols.forEach(p => {
        const color = riskColors[p.risk] || '#888';
        html += `
            <tr style="border-bottom:1px solid #333;">
                <td style="padding:12px;">
                    <strong style="color:#fff;">${p.name}</strong><br>
                    <small style="color:#888;">${p.type}</small>
                </td>
                <td style="padding:12px;text-align:center;">
                    <span style="background:#333;padding:2px 8px;border-radius:4px;font-size:12px;">${p.chain}</span>
                </td>
                <td style="padding:12px;text-align:center;">
                    <span style="color:${color};font-weight:bold;">${p.risk}/5</span><br>
                    <small style="color:${color};">${p.riskLabel}</small>
                </td>
                <td style="padding:12px;text-align:center;color:#00ff88;">
                    ${p.apy.min}-${p.apy.max}%
                </td>
                <td style="padding:12px;text-align:center;">
                    <span style="background:linear-gradient(135deg,#00ff88,#00d4aa);color:#000;padding:4px 8px;border-radius:4px;font-weight:bold;">
                        ${p.score.toFixed(1)}
                    </span>
                </td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>

                <div style="margin-top:20px;padding:15px;background:#0d0d1a;border-radius:8px;">
                    <h4 style="color:#00d4aa;margin:0 0 10px 0;">${isFr ? 'Légende des risques' : 'Risk Legend'}</h4>
                    <div style="display:flex;gap:15px;flex-wrap:wrap;">
                        <span style="color:#00ff88;">1/5: ${isFr ? 'Très faible' : 'Very Low'}</span>
                        <span style="color:#4ade80;">2/5: ${isFr ? 'Faible' : 'Low'}</span>
                        <span style="color:#fbbf24;">3/5: ${isFr ? 'Moyen' : 'Medium'}</span>
                        <span style="color:#f97316;">4/5: ${isFr ? 'Élevé' : 'High'}</span>
                        <span style="color:#ef4444;">5/5: ${isFr ? 'Très élevé' : 'Very High'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Initialize DeFi UI on page load
 */
function initDeFiUI() {
    console.log('[DeFi UI] Initializing...');

    // Auto-run quick check after 3 seconds
    setTimeout(() => {
        const quick = {
            ethers: typeof ethers !== 'undefined',
            aave: typeof AaveIntegration !== 'undefined',
            gmx: typeof GMXIntegration !== 'undefined',
            aerodrome: typeof AerodromeIntegration !== 'undefined',
            defiManager: typeof DeFiManager !== 'undefined',
            wallet: typeof window.ethereum !== 'undefined'
        };

        updateStatusIcon('ethers', quick.ethers);
        updateStatusIcon('aave', quick.aave);
        updateStatusIcon('gmx', quick.gmx);
        updateStatusIcon('aerodrome', quick.aerodrome);
        updateStatusIcon('manager', quick.defiManager);
        updateStatusIcon('wallet', quick.wallet);

        console.log('[DeFi UI] Quick check complete:', quick);
    }, 3000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVESTMENT VERIFICATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verify all investments and display in panel
 */
function verifyAllInvestments() {
    console.log('[Verify] Running investment verification...');

    if (typeof SimulatedPortfolio === 'undefined' || !SimulatedPortfolio.portfolio) {
        showVerifyResult('❌ SimulatedPortfolio non disponible', 'error');
        return;
    }

    const investments = SimulatedPortfolio.portfolio.investments || [];
    const history = SimulatedPortfolio.portfolio.history || [];

    // Count and total
    let simCount = 0, realCount = 0, simTotal = 0, realTotal = 0;
    investments.forEach(inv => {
        const value = (inv.amount || 0) + (inv.earnings || 0);
        if (inv.isSimulated) {
            simCount++;
            simTotal += value;
        } else {
            realCount++;
            realTotal += value;
        }
    });

    // Update stats
    document.getElementById('verify-sim-count').textContent = simCount;
    document.getElementById('verify-real-count').textContent = realCount;
    document.getElementById('verify-sim-total').textContent = '$' + simTotal.toFixed(2);
    document.getElementById('verify-real-total').textContent = '$' + realTotal.toFixed(2);

    // Build list
    const listDiv = document.getElementById('verify-invest-list');
    if (investments.length === 0) {
        listDiv.innerHTML = '<div style="color:#888;text-align:center;padding:20px;">Aucun investissement trouvé</div>';
    } else {
        let html = '';
        investments.forEach((inv, idx) => {
            const emoji = inv.isSimulated ? '🎮' : (inv.isDeFi ? '💎' : '💰');
            const color = inv.isSimulated ? '#a855f7' : '#00ff88';
            const type = inv.isSimulated ? 'SIM' : (inv.isDeFi ? 'DEFI' : 'REAL');
            const value = (inv.amount || 0) + (inv.earnings || 0);
            const date = new Date(inv.startDate).toLocaleDateString();
            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #333;font-size:12px;">
                    <div>
                        <span style="color:${color};">${emoji} ${type}</span>
                        <span style="color:#fff;margin-left:8px;">${inv.productName || inv.productId}</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:${color};font-weight:bold;">$${value.toFixed(2)}</div>
                        <div style="color:#666;font-size:10px;">${date} | ${inv.apy}% APY</div>
                    </div>
                </div>
            `;
        });
        listDiv.innerHTML = html;
    }

    // Show result
    const total = simCount + realCount;
    showVerifyResult(`✅ ${total} investissement(s) vérifié(s) | Sim: $${simTotal.toFixed(2)} | Réel: $${realTotal.toFixed(2)}`, 'success');

    console.log('[Verify] Results:', { simCount, realCount, simTotal, realTotal, investments });
}

/**
 * Export investments to JSON file
 */
function exportInvestments() {
    if (typeof SimulatedPortfolio === 'undefined') {
        alert('SimulatedPortfolio non disponible');
        return;
    }

    const data = {
        exportDate: new Date().toISOString(),
        portfolio: SimulatedPortfolio.portfolio,
        summary: {
            simulatedBalance: SimulatedPortfolio.portfolio.simulatedBalance,
            realBalance: SimulatedPortfolio.portfolio.realBalance,
            totalInvestments: SimulatedPortfolio.portfolio.investments?.length || 0,
            totalHistory: SimulatedPortfolio.portfolio.history?.length || 0
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obelisk_investments_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showVerifyResult('📥 Export JSON téléchargé!', 'success');
}

/**
 * Show investment console modal with debug commands
 */
function showInvestmentConsole() {
    const portfolio = typeof SimulatedPortfolio !== 'undefined' ? SimulatedPortfolio.portfolio : null;

    let html = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:500;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
            <div style="background:#0d0d1a;border:1px solid #00ff88;border-radius:16px;padding:20px;max-width:700px;width:90%;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <h2 style="color:#00ff88;margin:0;">🖥️ Console Debug Investissements</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none;border:none;color:#fff;font-size:24px;cursor:pointer;">&times;</button>
                </div>

                <div style="background:#1a1a2e;border-radius:8px;padding:15px;font-family:monospace;font-size:12px;margin-bottom:15px;">
                    <div style="color:#00ff88;margin-bottom:10px;">// État actuel du portfolio:</div>
                    <pre style="color:#fff;white-space:pre-wrap;margin:0;">${JSON.stringify(portfolio, null, 2)}</pre>
                </div>

                <div style="color:#888;margin-bottom:10px;">Commandes console (F12 → Console):</div>
                <div style="background:#1a1a2e;border-radius:8px;padding:15px;font-family:monospace;font-size:11px;">
                    <div style="color:#ffaa00;margin-bottom:8px;">// Voir tous les investissements</div>
                    <div style="color:#fff;margin-bottom:12px;">SimulatedPortfolio.portfolio.investments</div>

                    <div style="color:#ffaa00;margin-bottom:8px;">// Voir l'historique</div>
                    <div style="color:#fff;margin-bottom:12px;">SimulatedPortfolio.portfolio.history</div>

                    <div style="color:#ffaa00;margin-bottom:8px;">// Ajouter investissement DeFi manuellement</div>
                    <div style="color:#fff;margin-bottom:12px;">SimulatedPortfolio.trackDeFiInvestment('combo-MICRO_STARTER', 'Micro Starter', 1, 6, 'combo')</div>

                    <div style="color:#ffaa00;margin-bottom:8px;">// Vérifier combos investis</div>
                    <div style="color:#fff;margin-bottom:12px;">CombosModule.getComboInvestments('MICRO_STARTER')</div>

                    <div style="color:#ffaa00;margin-bottom:8px;">// Forcer refresh cartes</div>
                    <div style="color:#fff;margin-bottom:12px;">CombosModule.render()</div>

                    <div style="color:#ffaa00;margin-bottom:8px;">// Reset complet (ATTENTION!)</div>
                    <div style="color:#ff4444;margin-bottom:0;">SimulatedPortfolio.resetPortfolio()</div>
                </div>

                <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                    <button onclick="navigator.clipboard.writeText('SimulatedPortfolio.portfolio.investments');alert('Copié!')" style="background:#333;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:11px;">
                        📋 Copier: investments
                    </button>
                    <button onclick="navigator.clipboard.writeText('SimulatedPortfolio.trackDeFiInvestment(\\'combo-MICRO_STARTER\\', \\'Micro Starter\\', 1, 6, \\'combo\\')');alert('Copié!')" style="background:#333;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:11px;">
                        📋 Copier: track DeFi
                    </button>
                    <button onclick="console.log('Portfolio:', SimulatedPortfolio.portfolio);alert('Voir console F12')" style="background:#00d4aa;color:#000;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:bold;">
                        🔍 Log dans Console
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Show verify result message
 */
function showVerifyResult(message, type = 'info') {
    const resultDiv = document.getElementById('verify-result');
    if (!resultDiv) return;

    resultDiv.style.display = 'block';
    resultDiv.style.background = type === 'success' ? 'rgba(0,255,136,0.1)' : type === 'error' ? 'rgba(255,68,68,0.1)' : 'rgba(255,170,0,0.1)';
    resultDiv.style.border = `1px solid ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#ffaa00'}`;
    resultDiv.style.color = type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#ffaa00';
    resultDiv.textContent = message;

    // Auto-hide after 5s
    setTimeout(() => { resultDiv.style.display = 'none'; }, 5000);
}

/**
 * Quick verify function for combo cards
 */
function verifyComboInvestment(comboId) {
    if (typeof CombosModule === 'undefined') {
        console.error('CombosModule not available');
        return null;
    }
    const invested = CombosModule.getComboInvestments(comboId);
    console.log(`[Verify] Combo ${comboId}:`, invested);

    const msg = `Combo: ${comboId}\n🎮 Simulé: $${invested.simulated.toFixed(2)}\n💰 Réel: $${invested.real.toFixed(2)}`;
    alert(msg);
    return invested;
}

/**
 * Full system diagnostic
 */
function runFullDiagnostic() {
    console.log('═══════════════════════════════════════════');
    console.log('🔬 OBELISK FULL DIAGNOSTIC');
    console.log('═══════════════════════════════════════════');

    const results = {
        timestamp: new Date().toISOString(),
        modules: {},
        translations: {},
        investments: {},
        localStorage: {},
        defi: {}
    };

    // 1. Module checks
    console.log('\n📦 MODULES:');
    const modules = {
        'SimulatedPortfolio': typeof SimulatedPortfolio !== 'undefined',
        'CombosModule': typeof CombosModule !== 'undefined',
        'I18n': typeof I18n !== 'undefined',
        'DeFiManager': typeof DeFiManager !== 'undefined',
        'AaveIntegration': typeof AaveIntegration !== 'undefined',
        'GMXIntegration': typeof GMXIntegration !== 'undefined',
        'AerodromeIntegration': typeof AerodromeIntegration !== 'undefined',
        'DeFiHealthCheck': typeof DeFiHealthCheck !== 'undefined',
        'ethers': typeof ethers !== 'undefined'
    };
    Object.entries(modules).forEach(([name, loaded]) => {
        console.log(`  ${loaded ? '✅' : '❌'} ${name}: ${loaded ? 'OK' : 'MANQUANT'}`);
        results.modules[name] = loaded;
    });

    // 2. Language check
    console.log('\n🌐 TRADUCTIONS:');
    if (typeof I18n !== 'undefined') {
        console.log(`  Langue actuelle: ${I18n.currentLang}`);
        console.log(`  localStorage lang: ${localStorage.getItem('obelisk-lang')}`);
        results.translations.currentLang = I18n.currentLang;
        results.translations.storedLang = localStorage.getItem('obelisk-lang');

        // Test some translations
        const testKeys = ['combo_micro_starter', 'combo_invest', 'available_to_invest'];
        testKeys.forEach(key => {
            const val = I18n.t(key);
            console.log(`  ${key}: "${val}"`);
            results.translations[key] = val;
        });
    }

    // 3. Investments check
    console.log('\n💰 INVESTISSEMENTS:');
    if (typeof SimulatedPortfolio !== 'undefined') {
        const p = SimulatedPortfolio.portfolio;
        console.log(`  Solde Simulé: $${(p.simulatedBalance || 0).toFixed(2)}`);
        console.log(`  Solde Réel: $${(p.realBalance || 0).toFixed(2)}`);
        console.log(`  Nb Investissements: ${(p.investments || []).length}`);
        console.log(`  Nb Historique: ${(p.history || []).length}`);

        results.investments = {
            simulatedBalance: p.simulatedBalance || 0,
            realBalance: p.realBalance || 0,
            investmentCount: (p.investments || []).length,
            historyCount: (p.history || []).length
        };

        if (p.investments && p.investments.length > 0) {
            console.log('  Détail investissements:');
            p.investments.forEach((inv, i) => {
                const type = inv.isSimulated ? 'SIM' : (inv.isDeFi ? 'DEFI' : 'REAL');
                console.log(`    ${i+1}. [${type}] ${inv.productName}: $${inv.amount}`);
            });
        }
    }

    // 4. LocalStorage check
    console.log('\n💾 LOCALSTORAGE:');
    const lsKeys = ['obelisk-lang', 'obelisk_simulated_portfolio', 'obelisk_settings'];
    lsKeys.forEach(key => {
        const val = localStorage.getItem(key);
        const size = val ? val.length : 0;
        console.log(`  ${key}: ${size} bytes`);
        results.localStorage[key] = size;
    });

    // 5. DeFi status
    console.log('\n🔗 DEFI STATUS:');
    if (typeof DeFiHealthCheck !== 'undefined') {
        const quick = DeFiHealthCheck.quickCheck();
        Object.entries(quick).forEach(([key, val]) => {
            console.log(`  ${val ? '✅' : '❌'} ${key}`);
            results.defi[key] = val;
        });
    }

    // 6. Combos check
    console.log('\n📊 COMBOS:');
    if (typeof CombosModule !== 'undefined') {
        console.log(`  Total combos: ${CombosModule.combos?.length || 0}`);
        console.log(`  Sort: ${CombosModule.sortBy} ${CombosModule.sortDir}`);
        console.log(`  Budget filter: ${CombosModule.budgetFilter || 'none'}`);

        // Check first 3 combos
        const first3 = (CombosModule.combos || []).slice(0, 3);
        first3.forEach(c => {
            console.log(`    - ${c.name}: $${c.minInvestment} min`);
        });
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('📋 Résultat complet dans: window.lastDiagnostic');
    console.log('═══════════════════════════════════════════');

    window.lastDiagnostic = results;
    return results;
}

/**
 * Quick language fix
 */
function fixLanguage(lang = 'fr') {
    if (typeof I18n !== 'undefined') {
        localStorage.setItem('obelisk-lang', lang);
        I18n.currentLang = lang;
        I18n.setLang(lang);
        console.log(`✅ Langue changée en: ${lang}`);
        if (typeof CombosModule !== 'undefined') CombosModule.render();
    }
}

/**
 * Force sort combos
 */
function forceSortCombos() {
    if (typeof CombosModule !== 'undefined') {
        CombosModule.sortBy = 'minInvestment';
        CombosModule.sortDir = 'asc';
        CombosModule.render();
        console.log('✅ Combos triés par minimum (asc)');
    }
}

// Auto-init
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initDeFiUI);
}

// Export globals
window.runDeFiHealthCheck = runDeFiHealthCheck;
window.showDeFiProtocols = showDeFiProtocols;
window.updateStatusIcon = updateStatusIcon;
window.verifyAllInvestments = verifyAllInvestments;
window.exportInvestments = exportInvestments;
window.showInvestmentConsole = showInvestmentConsole;
window.verifyComboInvestment = verifyComboInvestment;
window.runFullDiagnostic = runFullDiagnostic;
window.fixLanguage = fixLanguage;
window.forceSortCombos = forceSortCombos;

console.log('[DeFi UI] Module loaded with verification functions');
