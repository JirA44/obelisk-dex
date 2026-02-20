/**
 * PRICE TOUCH INDICATOR v2.0 — "HaveTouchedThisPrice"
 *
 * Concept: The more times price tests a level without breaking it,
 *          the more energy builds up → breakout becomes probable.
 *
 *   BTC touched $40K × 5 → on the 5th approach, signal fires → HIGH PROB breakout
 *
 * Algorithm:
 *   1. Track price zones (clusters within ±tolerance%). One tolerance everywhere.
 *   2. A "touch" = price ENTERS the zone (Nth approach = signal fires NOW).
 *      Approach direction determined from prevPrice (where price came FROM).
 *   3. When touches >= threshold → emit breakout signal (price is IN zone, act now)
 *   4. Breakout bias:
 *      - Approached mostly from BELOW → resistance → breakout UP (bullrun)
 *      - Approached mostly from ABOVE → support    → breakout DOWN
 *
 * Version: 2.0 | Date: 2026-02-20
 */

// ─── Config defaults ──────────────────────────────────────────────────────────

const DEFAULT_CFG = {
    touchTolerance:      0.003,   // ±0.3% band — used consistently everywhere
    breakoutTouches:     5,       // touches (entries) needed to signal
    minTouchInterval:    20000,   // 20s min between two touches on same zone (debounce)
    zoneExpiry:          3600000, // 1h → forget zones with no activity
    maxZones:            20,      // max tracked zones per pair (oldest pruned)
    postBreakoutCooldown: 300000, // 5min ignore zone after breakout signal
};

// ─── State machine (per zone) ─────────────────────────────────────────────────
//
//  prevPrice outside band
//         │
//         ▼
//   ┌─────────────┐   price enters band (from below OR above)
//   │   OUTSIDE   │ ──────────────────────────────────────────►  touch++ (entry)
//   └─────────────┘                                              check if Nth → signal
//         ▲
//         │ price exits band
//   ┌─────────────┐
//   │   IN ZONE   │
//   └─────────────┘
//
//  Approach direction = where prevPrice was relative to band (below lo or above hi)

class PriceTouchIndicator {
    /**
     * @param {object} cfg - Override defaults
     */
    constructor(cfg = {}) {
        this.cfg = { ...DEFAULT_CFG, ...cfg };
        this.zones = {};  // { pair: Zone[] }
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    /**
     * Feed a new price tick. Returns breakout signals triggered by this tick.
     * @param {string} pair   e.g. 'BTC/USDC'
     * @param {number} price  current price
     * @param {number} [ts]   timestamp ms
     * @returns {BreakoutSignal[]}
     */
    tick(pair, price, ts = Date.now()) {
        if (!this.zones[pair]) this.zones[pair] = [];
        this._pruneExpired(pair, ts);

        const signals = [];
        for (const zone of this.zones[pair]) {
            const sig = this._updateZone(zone, price, ts);
            if (sig) signals.push(sig);
        }

        // Create new zone if no existing zone covers this price
        this._maybeCreateZone(pair, price, ts);

        return signals;
    }

    /**
     * Get current zone snapshot for a pair (for display / logging).
     * @param {string} pair
     * @returns {ZoneSnapshot[]}
     */
    getZones(pair) {
        if (!this.zones[pair]) return [];
        return this.zones[pair]
            .filter(z => z.touches > 0 || z.inZone)
            .map(z => ({
                level:            z.level,
                touches:          z.touches,
                type:             this._zoneType(z),
                breakoutBias:     this._breakoutBias(z),
                strength:         this._strength(z),
                inZone:           z.inZone,
                lastActivity:     z.lastActivity ? new Date(z.lastActivity).toISOString() : null,
                readyForBreakout: z.touches >= this.cfg.breakoutTouches,
            }));
    }

    /**
     * Seed a pre-existing S/R level (e.g. from candle swing analysis).
     * @param {string} pair
     * @param {number} level
     * @param {number} touches  pre-known touch count
     * @param {'resistance'|'support'} type
     */
    seedLevel(pair, level, touches, type = 'resistance') {
        if (!this.zones[pair]) this.zones[pair] = [];
        const existing = this._findZone(pair, level);
        // lastActivity is set just past debounce threshold so the next real tick
        // always passes the interval check, but not so old that _pruneExpired fires.
        const seedActivity = Date.now() - this.cfg.minTouchInterval - 1;

        if (existing) {
            existing.touches = Math.max(existing.touches, touches);
            existing.level   = (existing.level + level) / 2; // merge levels
            if (type === 'resistance') existing.approachFromBelow += touches;
            else                       existing.approachFromAbove += touches;
            existing.lastActivity = seedActivity;
        } else {
            const zone = this._newZone(level, seedActivity);
            zone.touches           = touches;
            zone.approachFromBelow = type === 'resistance' ? touches : 0;
            zone.approachFromAbove = type === 'support'    ? touches : 0;
            this.zones[pair].push(zone);
        }
    }

    /**
     * Clear all zones for a pair.
     */
    reset(pair) {
        this.zones[pair] = [];
    }

    // ── Internal ───────────────────────────────────────────────────────────────

    _newZone(level, ts) {
        return {
            level,
            anchor:            level,  // fixed reference for _findZone (never changes)
            touches:           0,
            lastActivity:      ts,
            inZone:            false,
            prevPrice:         null,   // price from the PREVIOUS tick (to detect approach side)
            approachFromBelow: 0,      // # entries where prevPrice was BELOW the band → resistance
            approachFromAbove: 0,      // # entries where prevPrice was ABOVE the band → support
            breakoutTs:        null,
            // For level averaging (cluster center)
            entryPrices:       [],
        };
    }

    /**
     * Update a zone with the current price tick.
     * Returns a BreakoutSignal if the touch threshold is reached.
     *
     * Touch is counted on ENTRY (when price crosses into the band).
     * Approach direction = where prevPrice was (below or above the band).
     */
    _updateZone(zone, price, ts) {
        const tol = this.cfg.touchTolerance;
        const lo  = zone.anchor * (1 - tol);
        const hi  = zone.anchor * (1 + tol);

        const inBand = price >= lo && price <= hi;

        // Post-breakout cooldown
        if (zone.breakoutTs && (ts - zone.breakoutTs) < this.cfg.postBreakoutCooldown) {
            zone.prevPrice = price;
            return null;
        }

        let signal = null;

        if (!zone.inZone && inBand) {
            // ── Price just entered the zone ──────────────────────────────────

            // Debounce: ignore entry if last touch was too recent
            const timeSinceLast = ts - zone.lastActivity;
            if (timeSinceLast >= this.cfg.minTouchInterval || zone.touches === 0) {

                zone.inZone      = true;
                zone.lastActivity = ts;
                zone.touches++;

                // Approach direction: where was prevPrice relative to the band?
                if (zone.prevPrice !== null && zone.prevPrice < lo) {
                    zone.approachFromBelow++;  // came from below → testing resistance
                } else if (zone.prevPrice !== null && zone.prevPrice > hi) {
                    zone.approachFromAbove++;  // came from above → testing support
                }
                // else: price started inside zone (no approach side, skip count)

                // Update cluster center (average of entry prices)
                zone.entryPrices.push(price);
                if (zone.entryPrices.length > 10) zone.entryPrices.shift();
                zone.level = zone.entryPrices.reduce((a, b) => a + b) / zone.entryPrices.length;

                // Emit signal when threshold reached (price is IN zone NOW)
                if (zone.touches >= this.cfg.breakoutTouches) {
                    signal = this._buildSignal(zone, price, ts);
                    // Reset for re-accumulation after cooldown
                    zone.breakoutTs        = ts;
                    zone.touches           = 0;
                    zone.approachFromBelow = 0;
                    zone.approachFromAbove = 0;
                    zone.entryPrices       = [];
                }
            }

        } else if (zone.inZone && !inBand) {
            // ── Price exited the zone ────────────────────────────────────────
            zone.inZone = false;
        }

        zone.prevPrice = price;
        return signal;
    }

    /** Build the signal object emitted when touch threshold is reached. */
    _buildSignal(zone, price, ts) {
        const bias = this._breakoutBias(zone);
        const levelStr = zone.level.toLocaleString('en-US', { maximumFractionDigits: 2 });
        return {
            indicator:    'PriceTouchIndicator',
            level:         zone.level,
            anchor:        zone.anchor,
            touches:       zone.touches,
            breakoutBias:  bias,                      // 'up' | 'down' | 'neutral'
            side:          bias === 'up' ? 'long' : bias === 'down' ? 'short' : null,
            strength:      this._strength(zone),      // 0.0 – 1.0
            type:          this._zoneType(zone),      // 'resistance' | 'support' | 'both'
            triggerPrice:  price,
            reason: `${zone.touches}x at $${levelStr} (${this._zoneType(zone)}) → breakout ${bias.toUpperCase()} NOW`,
            ts,
        };
    }

    /**
     * Breakout bias: determine likely next direction.
     *  - approachFromBelow dominant → zone acted as RESISTANCE → breakout UP
     *  - approachFromAbove dominant → zone acted as SUPPORT    → breakout DOWN
     */
    _breakoutBias(zone) {
        const below = zone.approachFromBelow;
        const above = zone.approachFromAbove;
        const total = below + above;
        if (total === 0) return 'neutral';
        const ratio = below / total;
        if (ratio >= 0.6) return 'up';    // resistance majority → break UP
        if (ratio <= 0.4) return 'down';  // support majority    → break DOWN
        return 'neutral';
    }

    /** Zone type from approach history. */
    _zoneType(zone) {
        const bias = this._breakoutBias(zone);
        if (bias === 'up')   return 'resistance';
        if (bias === 'down') return 'support';
        return 'both';
    }

    /**
     * Strength 0.0–1.0:
     *   70% from touch progress toward threshold
     *   30% from directional clarity (one-sided vs mixed)
     */
    _strength(zone) {
        const touchScore = Math.min(zone.touches / this.cfg.breakoutTouches, 1.0);
        const below = zone.approachFromBelow;
        const above = zone.approachFromAbove;
        const total = below + above;
        const directionalScore = total > 0 ? Math.abs(below - above) / total : 0;
        return Math.round((touchScore * 0.7 + directionalScore * 0.3) * 100) / 100;
    }

    /**
     * Find an existing zone close enough to price.
     * Uses the same tolerance as the band (consistent).
     */
    _findZone(pair, price) {
        const tol = this.cfg.touchTolerance;
        return (this.zones[pair] || []).find(z =>
            Math.abs(z.anchor - price) / z.anchor <= tol
        ) || null;
    }

    /**
     * Create a new zone centered on `price` if none exists nearby.
     * Prune least-recently-active zone if over limit.
     */
    _maybeCreateZone(pair, price, ts) {
        if (this._findZone(pair, price)) return;  // already covered
        this.zones[pair].push(this._newZone(price, ts));

        if (this.zones[pair].length > this.cfg.maxZones) {
            this.zones[pair].sort((a, b) => a.lastActivity - b.lastActivity);
            this.zones[pair].shift();  // remove least recently active
        }
    }

    /** Remove zones with no activity for zoneExpiry ms. */
    _pruneExpired(pair, ts) {
        this.zones[pair] = this.zones[pair].filter(z =>
            (ts - z.lastActivity) < this.cfg.zoneExpiry
        );
    }
}

module.exports = PriceTouchIndicator;
