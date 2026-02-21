/**
 * OBELISK REVENUE & EXPENSE TRACKER V1.0
 * ═══════════════════════════════════════════════════════════════
 * Suivi complet des revenus et dépenses Obelisk
 *
 * Revenus:
 *   - Frais de trading (perps, spot, HFT)
 *   - Frais backed assets (mint/redeem)
 *   - Intérêts CDP (collateralized positions)
 *   - Frais liquidation
 *   - Frais staking (passive products)
 *   - Frais bridge/swap
 *   - Frais performance (vaults)
 *
 * Dépenses:
 *   - Gas blockchain (Sonic, Arbitrum, Base, Solana)
 *   - Subsidies users (tier rebates)
 *   - Infrastructure (servers, APIs)
 *   - Frais externes (DEX, bridges)
 *
 * Sorties:
 *   - Dashboard journalier/hebdo/mensuel
 *   - Net P&L par produit
 *   - Burn rate & runway
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'revenue_expense.json');

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

const REVENUE_CATEGORIES = [
    'trading_fees', 'backed_assets_fees', 'cdp_interest', 'liquidation_fees',
    'staking_fees', 'bridge_fees', 'vault_performance', 'flash_loan_fees', 'other'
];

const EXPENSE_CATEGORIES = [
    'gas_sonic', 'gas_arbitrum', 'gas_base', 'gas_solana', 'gas_other',
    'user_subsidies', 'maker_rebates', 'external_dex_fees', 'infrastructure', 'other'
];

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE & EXPENSE TRACKER
// ─────────────────────────────────────────────────────────────────────────────

class RevenueExpenseTracker {
    constructor() {
        this.data = this._load();
        this._dirty = false;
        // Auto-save toutes les 60s
        setInterval(() => { if (this._dirty) this._save(); }, 60000);
    }

    // ── Persistance ───────────────────────────────────────────────────────────
    _load() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            }
        } catch (e) { /* fresh */ }

        return {
            lifetime: this._emptyPeriod(),
            daily:    {},   // '2026-02-21' → period
            weekly:   {},   // '2026-W08'   → period
            monthly:  {},   // '2026-02'    → period
            txLog:    [],
            lastUpdated: null
        };
    }

    _save() {
        try {
            const dir = path.dirname(DATA_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            this.data.lastUpdated = new Date().toISOString();
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
            this._dirty = false;
        } catch (e) {
            console.error('[REV-TRACKER] Save error:', e.message);
        }
    }

    _emptyPeriod() {
        const rev = {}; REVENUE_CATEGORIES.forEach(c => rev[c] = 0);
        const exp = {}; EXPENSE_CATEGORIES.forEach(c => exp[c] = 0);
        return { revenue: rev, expenses: exp, txCount: 0 };
    }

    _keys(date = new Date()) {
        const d  = date.toISOString().slice(0, 10);                           // '2026-02-21'
        const y  = date.getFullYear();
        const w  = String(Math.ceil((date.getDate() + new Date(y, date.getMonth(), 1).getDay()) / 7)).padStart(2, '0');
        const wk = `${y}-W${w}`;
        const mo = d.slice(0, 7);                                             // '2026-02'
        return { d, wk, mo };
    }

    _getOrCreate(bucket, key) {
        if (!this.data[bucket][key]) this.data[bucket][key] = this._emptyPeriod();
        return this.data[bucket][key];
    }

    // ── Enregistrer un revenu ─────────────────────────────────────────────────
    addRevenue(category, amountUSD, meta = {}) {
        if (!REVENUE_CATEGORIES.includes(category)) category = 'other';
        const { d, wk, mo } = this._keys();

        [
            this.data.lifetime,
            this._getOrCreate('daily',   d),
            this._getOrCreate('weekly',  wk),
            this._getOrCreate('monthly', mo)
        ].forEach(p => {
            p.revenue[category]  = (p.revenue[category] || 0) + amountUSD;
            p.txCount++;
        });

        this.data.txLog.push({ type: 'REV', category, amount: amountUSD, ...meta, ts: Date.now() });
        if (this.data.txLog.length > 5000) this.data.txLog.splice(0, 1000);  // trim
        this._dirty = true;
    }

    // ── Enregistrer une dépense ───────────────────────────────────────────────
    addExpense(category, amountUSD, meta = {}) {
        if (!EXPENSE_CATEGORIES.includes(category)) category = 'other';
        const { d, wk, mo } = this._keys();

        [
            this.data.lifetime,
            this._getOrCreate('daily',   d),
            this._getOrCreate('weekly',  wk),
            this._getOrCreate('monthly', mo)
        ].forEach(p => {
            p.expenses[category]  = (p.expenses[category] || 0) + amountUSD;
            p.txCount++;
        });

        this.data.txLog.push({ type: 'EXP', category, amount: amountUSD, ...meta, ts: Date.now() });
        if (this.data.txLog.length > 5000) this.data.txLog.splice(0, 1000);
        this._dirty = true;
    }

    // ── Helpers raccourcis ────────────────────────────────────────────────────
    recordTradingFee(amountUSD, venue = 'unknown')           { this.addRevenue('trading_fees',       amountUSD, { venue }); }
    recordBackedAssetFee(amountUSD, symbol = 'unknown')     { this.addRevenue('backed_assets_fees', amountUSD, { symbol }); }
    recordCDPInterest(amountUSD, positionId = '')            { this.addRevenue('cdp_interest',       amountUSD, { positionId }); }
    recordLiquidationFee(amountUSD, positionId = '')         { this.addRevenue('liquidation_fees',   amountUSD, { positionId }); }
    recordStakingFee(amountUSD, token = '')                  { this.addRevenue('staking_fees',       amountUSD, { token }); }
    recordBridgeFee(amountUSD, chain = '')                   { this.addRevenue('bridge_fees',        amountUSD, { chain }); }
    recordVaultPerf(amountUSD, vault = '')                   { this.addRevenue('vault_performance',  amountUSD, { vault }); }

    recordGas(chain, amountUSD)                              { this.addExpense(`gas_${chain}`,       amountUSD, { chain }); }
    recordSubsidy(amountUSD, userId = '')                    { this.addExpense('user_subsidies',     amountUSD, { userId }); }
    recordRebate(amountUSD, userId = '')                     { this.addExpense('maker_rebates',      amountUSD, { userId }); }
    recordExternalFee(amountUSD, dex = '')                   { this.addExpense('external_dex_fees',  amountUSD, { dex }); }

    // ── Calculer P&L d'une période ────────────────────────────────────────────
    _pnl(period) {
        const totalRev = Object.values(period.revenue).reduce((a, b) => a + b, 0);
        const totalExp = Object.values(period.expenses).reduce((a, b) => a + b, 0);
        return {
            totalRevenue:  parseFloat(totalRev.toFixed(4)),
            totalExpenses: parseFloat(totalExp.toFixed(4)),
            netProfit:     parseFloat((totalRev - totalExp).toFixed(4)),
            margin:        totalRev > 0 ? parseFloat(((totalRev - totalExp) / totalRev * 100).toFixed(1)) : 0,
            txCount:       period.txCount,
            revenue:       Object.fromEntries(Object.entries(period.revenue).filter(([,v]) => v > 0)),
            expenses:      Object.fromEntries(Object.entries(period.expenses).filter(([,v]) => v > 0))
        };
    }

    // ── Rapports ──────────────────────────────────────────────────────────────
    getReport(period = 'today') {
        const { d, wk, mo } = this._keys();
        let data;
        switch (period) {
            case 'today':    data = this.data.daily[d];   break;
            case 'week':     data = this.data.weekly[wk]; break;
            case 'month':    data = this.data.monthly[mo]; break;
            case 'lifetime': data = this.data.lifetime;   break;
            default:         data = this.data.daily[period]; break;  // date spécifique
        }

        if (!data) return { period, message: 'No data for this period', ...this._pnl(this._emptyPeriod()) };
        return { period, ...this._pnl(data) };
    }

    getDashboard() {
        const today    = this.getReport('today');
        const week     = this.getReport('week');
        const month    = this.getReport('month');
        const lifetime = this.getReport('lifetime');

        // Daily revenue trend (last 7 days)
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d   = new Date(Date.now() - i * 86400000);
            const key = d.toISOString().slice(0, 10);
            const data = this.data.daily[key];
            trend.push({
                date:       key,
                revenue:    data ? parseFloat(Object.values(data.revenue).reduce((a, b) => a + b, 0).toFixed(4)) : 0,
                expenses:   data ? parseFloat(Object.values(data.expenses).reduce((a, b) => a + b, 0).toFixed(4)) : 0,
                netProfit:  data ? parseFloat((Object.values(data.revenue).reduce((a, b) => a + b, 0) - Object.values(data.expenses).reduce((a, b) => a + b, 0)).toFixed(4)) : 0
            });
        }

        // Top revenue source
        const revBySource = Object.entries(lifetime.revenue || {}).sort((a, b) => b[1] - a[1]);
        const topRevSource = revBySource[0] || ['none', 0];

        // Burn rate
        const avgDailyExp = week.totalExpenses / 7;
        const burnRate = parseFloat(avgDailyExp.toFixed(4));

        return {
            timestamp: new Date().toISOString(),
            today,
            week,
            month,
            lifetime,
            trend,
            insights: {
                topRevenueSource: topRevSource[0],
                topRevenueAmount: parseFloat((topRevSource[1] || 0).toFixed(4)),
                dailyBurnRate:    burnRate,
                monthlyBurnRate:  parseFloat((burnRate * 30).toFixed(4)),
                profitabilityStatus: today.netProfit >= 0 ? 'PROFITABLE' : 'LOSS',
                revenueCategories: REVENUE_CATEGORIES.length,
                expenseCategories: EXPENSE_CATEGORIES.length
            }
        };
    }

    // ── Console report ────────────────────────────────────────────────────────
    printReport(period = 'today') {
        const r = this.getReport(period);
        console.log(`\n${'═'.repeat(50)}`);
        console.log(`  💰 OBELISK P&L — ${r.period.toUpperCase()}`);
        console.log(`${'═'.repeat(50)}`);
        console.log(`  Revenue:  $${r.totalRevenue.toFixed(4)}`);
        console.log(`  Expenses: $${r.totalExpenses.toFixed(4)}`);
        console.log(`  Net P&L:  ${r.netProfit >= 0 ? '✅' : '❌'} $${r.netProfit.toFixed(4)}`);
        console.log(`  Margin:   ${r.margin}%`);
        if (Object.keys(r.revenue).length > 0) {
            console.log(`\n  Top Revenue:`);
            Object.entries(r.revenue).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([k,v]) => {
                console.log(`    ${k}: $${v.toFixed(4)}`);
            });
        }
        if (Object.keys(r.expenses).length > 0) {
            console.log(`\n  Top Expenses:`);
            Object.entries(r.expenses).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([k,v]) => {
                console.log(`    ${k}: $${v.toFixed(4)}`);
            });
        }
        console.log(`${'═'.repeat(50)}\n`);
    }

    saveNow() { this._save(); }
}

// Singleton
const instance = new RevenueExpenseTracker();
module.exports = instance;
module.exports.RevenueExpenseTracker = RevenueExpenseTracker;
