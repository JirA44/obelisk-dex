/**
 * OBELISK Alert System V1.0
 * +1%/-1% price & PnL threshold alerts
 *
 * Monitors:
 * - Copy-trading positions (PnL +1% / -1%)
 * - Strategy paper trades (+1% / -1%)
 * - Market prices (any asset +1% / -1% in last tick)
 * - Liquidity positions (IL / yield alerts)
 *
 * Delivery: polling (/api/alerts/feed) + WebSocket push
 */

'use strict';

const EventEmitter = require('events');

const THRESHOLDS = {
    price_up:    +1.0,  // %
    price_down:  -1.0,
    pnl_up:      +1.0,
    pnl_down:    -1.0,
    winrate_low:  40,   // % — strategy viability warning
    dd_warn:      5.0,  // % drawdown warning
};

// Alert types
const TYPES = {
    PRICE_SPIKE:   'price_spike',
    PRICE_DROP:    'price_drop',
    PNL_POSITIVE:  'pnl_positive',
    PNL_NEGATIVE:  'pnl_negative',
    STRATEGY_WARN: 'strategy_warn',
    DD_WARNING:    'dd_warning',
    VIABILITY:     'viability',
};

class AlertService extends EventEmitter {
    constructor() {
        super();
        this.alerts = [];       // ring buffer, max 500
        this.seen = new Set();  // dedup within 60s
        this.priceCache = {};   // symbol -> last price
        this.subscribers = [];  // WebSocket clients
        this.maxAlerts = 500;
        this._tickInterval = null;
    }

    // ─── CREATE ALERT ───
    push(type, data) {
        const key = `${type}:${data.symbol || data.id}:${Math.floor(Date.now() / 60000)}`;
        if (this.seen.has(key)) return null; // debounce 1 per minute per key
        this.seen.add(key);
        setTimeout(() => this.seen.delete(key), 65000);

        const alert = {
            id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type,
            ts: Date.now(),
            read: false,
            ...data
        };

        this.alerts.unshift(alert);
        if (this.alerts.length > this.maxAlerts) this.alerts.pop();

        // Push to WebSocket subscribers
        this._broadcast(alert);
        this.emit('alert', alert);

        return alert;
    }

    // ─── PRICE TICK ───
    // Call with { symbol, price, prevPrice } every time prices update
    onPriceTick(symbol, price, prevPrice) {
        if (!prevPrice || prevPrice === 0) {
            this.priceCache[symbol] = price;
            return;
        }

        const pct = ((price - prevPrice) / prevPrice) * 100;

        if (pct >= THRESHOLDS.price_up) {
            this.push(TYPES.PRICE_SPIKE, {
                symbol,
                pct: +pct.toFixed(2),
                price,
                prevPrice,
                message: `${symbol} +${pct.toFixed(2)}% spike`,
                severity: pct >= 3 ? 'high' : 'medium',
                color: 'green'
            });
        } else if (pct <= THRESHOLDS.price_down) {
            this.push(TYPES.PRICE_DROP, {
                symbol,
                pct: +pct.toFixed(2),
                price,
                prevPrice,
                message: `${symbol} ${pct.toFixed(2)}% drop`,
                severity: pct <= -3 ? 'high' : 'medium',
                color: 'red'
            });
        }

        this.priceCache[symbol] = price;
    }

    // ─── PnL TICK ───
    // Call with copy position or strategy paper trade data
    onPnLTick(id, name, pnlPct, capital) {
        if (pnlPct >= THRESHOLDS.pnl_up) {
            this.push(TYPES.PNL_POSITIVE, {
                id,
                name,
                pnlPct: +pnlPct.toFixed(2),
                pnlUSD: +((capital * pnlPct) / 100).toFixed(4),
                capital,
                message: `${name} +${pnlPct.toFixed(2)}% PnL`,
                severity: pnlPct >= 3 ? 'high' : 'low',
                color: 'green'
            });
        } else if (pnlPct <= THRESHOLDS.pnl_down) {
            this.push(TYPES.PNL_NEGATIVE, {
                id,
                name,
                pnlPct: +pnlPct.toFixed(2),
                pnlUSD: +((capital * pnlPct) / 100).toFixed(4),
                capital,
                message: `${name} ${pnlPct.toFixed(2)}% loss`,
                severity: pnlPct <= -3 ? 'high' : 'medium',
                color: 'red'
            });
        }
    }

    // ─── STRATEGY VIABILITY ───
    onStrategyTick(stratId, name, winRate, monthlyROI, maxDD) {
        if (winRate < THRESHOLDS.winrate_low) {
            this.push(TYPES.VIABILITY, {
                id: stratId,
                name,
                winRate,
                monthlyROI,
                message: `⚠️ ${name} WR dropped to ${winRate}%`,
                severity: 'high',
                color: 'orange'
            });
        }
        if (maxDD > THRESHOLDS.dd_warn) {
            this.push(TYPES.DD_WARNING, {
                id: stratId,
                name,
                maxDD,
                message: `⚠️ ${name} DD: -${maxDD.toFixed(1)}%`,
                severity: maxDD > 10 ? 'high' : 'medium',
                color: 'orange'
            });
        }
    }

    // ─── SIMULATED TICK (for demo/testing) ───
    startSimulatedTick() {
        const DEMO_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ARB/USDT', 'SUI/USDT', 'MATIC/USDT'];
        const prices = { 'BTC/USDT': 96000, 'ETH/USDT': 3200, 'SOL/USDT': 180, 'ARB/USDT': 1.2, 'SUI/USDT': 2.8, 'MATIC/USDT': 0.85 };

        const COPY_POSITIONS = [
            { id: 'copy_btc_max', name: 'BTC Maximalist', capital: 1 },
            { id: 'copy_quant_alpha', name: 'QuantAlpha', capital: 1 },
            { id: 'copy_obelisk_mm', name: 'ObeliskMM', capital: 1 },
            { id: 'copy_stable_lp', name: 'StableLPro', capital: 1 },
        ];

        if (this._tickInterval) clearInterval(this._tickInterval);

        this._tickInterval = setInterval(() => {
            // Simulate price moves
            for (const sym of DEMO_SYMBOLS) {
                const prev = prices[sym];
                const move = (Math.random() - 0.48) * 2.5; // slightly bullish bias
                prices[sym] = Math.max(0.01, prev * (1 + move / 100));
                this.onPriceTick(sym, prices[sym], prev);
            }

            // Simulate copy PnL
            for (const pos of COPY_POSITIONS) {
                const pnlPct = (Math.random() - 0.45) * 3;
                this.onPnLTick(pos.id, pos.name, pnlPct, pos.capital);
            }

            // Occasionally fire a strategy viability check
            if (Math.random() < 0.1) {
                const wr = 35 + Math.random() * 40;
                const dd = Math.random() * 12;
                this.onStrategyTick('strat_demo', 'RSI 5m APEX', wr, 15, dd);
            }

        }, 5000); // Every 5 seconds
    }

    stopSimulatedTick() {
        if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
    }

    // ─── WEBSOCKET ───
    addSubscriber(ws) {
        this.subscribers.push(ws);
        // Send last 10 alerts on connect
        const recent = this.alerts.slice(0, 10);
        if (recent.length > 0) {
            ws.send(JSON.stringify({ type: 'history', alerts: recent }));
        }
        ws.on('close', () => {
            this.subscribers = this.subscribers.filter(s => s !== ws);
        });
    }

    _broadcast(alert) {
        const msg = JSON.stringify({ type: 'alert', alert });
        this.subscribers = this.subscribers.filter(ws => {
            try { ws.send(msg); return true; }
            catch { return false; }
        });
    }

    // ─── API ───
    getFeed(opts = {}) {
        const { limit = 50, unreadOnly = false, type = null, since = 0 } = opts;
        let feed = this.alerts;
        if (unreadOnly) feed = feed.filter(a => !a.read);
        if (type) feed = feed.filter(a => a.type === type);
        if (since) feed = feed.filter(a => a.ts > since);
        return {
            alerts: feed.slice(0, limit),
            total: feed.length,
            unread: this.alerts.filter(a => !a.read).length
        };
    }

    markRead(ids) {
        if (!ids || ids === 'all') {
            this.alerts.forEach(a => { a.read = true; });
            return this.alerts.length;
        }
        const idSet = new Set(Array.isArray(ids) ? ids : [ids]);
        let count = 0;
        this.alerts.forEach(a => {
            if (idSet.has(a.id)) { a.read = true; count++; }
        });
        return count;
    }

    getStats() {
        const now = Date.now();
        const last1h = this.alerts.filter(a => a.ts > now - 3600000);
        const byType = {};
        this.alerts.forEach(a => { byType[a.type] = (byType[a.type] || 0) + 1; });
        return {
            total: this.alerts.length,
            unread: this.alerts.filter(a => !a.read).length,
            last1h: last1h.length,
            byType,
            thresholds: THRESHOLDS,
            simulatedTick: !!this._tickInterval
        };
    }

    setThreshold(key, value) {
        if (key in THRESHOLDS) { THRESHOLDS[key] = value; return true; }
        return false;
    }

    clearAll() {
        this.alerts = [];
        this.seen.clear();
    }
}

let instance = null;
function getAlertService() {
    if (!instance) {
        instance = new AlertService();
        instance.startSimulatedTick(); // Start demo ticks
    }
    return instance;
}

module.exports = { getAlertService, TYPES, THRESHOLDS };
