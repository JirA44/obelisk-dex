/**
 * Venue-specific equity tracking for MixBot integration
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Venue capital tracking (persisted)
const VENUE_DATA_FILE = path.join(__dirname, '../data/venue_capital.json');

let venueCapital = {
    mixbot: {
        equity: 5.00,
        deposited: 5.00,
        pnl: 0,
        positions: [],
        lastUpdated: Date.now()
    },
    // Venue Sonic — Obelisk perps (PAPER) + settlement blockchain Sonic
    // ⚠️ SIMULATED — capital $5 fictif, liquidity pool $100K fictive
    sonic_mixbot: {
        equity: 5.00,
        deposited: 5.00,
        pnl: 0,
        positions: [],
        mode: 'PAPER',          // PAPER — liquidity Obelisk simulée
        chain: 'SONIC',         // Settlement chain
        chainId: 146,
        note: 'Obelisk perps simulated + Sonic on-chain settlement',
        lastUpdated: Date.now()
    }
};

// Load persisted data
try {
    if (fs.existsSync(VENUE_DATA_FILE)) {
        venueCapital = JSON.parse(fs.readFileSync(VENUE_DATA_FILE, 'utf8'));
    }
} catch (err) {
    console.error('[VENUE-EQUITY] Load error:', err.message);
}

// Save data
function saveVenueData() {
    try {
        fs.writeFileSync(VENUE_DATA_FILE, JSON.stringify(venueCapital, null, 2));
    } catch (err) {
        console.error('[VENUE-EQUITY] Save error:', err.message);
    }
}

/**
 * GET /api/trade/equity?venue=mixbot
 */
router.get('/equity', (req, res) => {
    const { venue } = req.query;

    if (!venue) {
        return res.status(400).json({ error: 'Missing venue parameter' });
    }

    const venueData = venueCapital[venue] || {
        equity: 0,
        deposited: 0,
        pnl: 0,
        positions: []
    };

    // V3.1: Reconcile with ObeliskPerps — sync positions closed by TP/SL or liquidation
    const obeliskPerps = req.app.get('obeliskPerps');
    if (obeliskPerps && venueData.positions && venueData.positions.length > 0) {
        const activeIds = new Set();
        obeliskPerps.positions.forEach((pos) => {
            if (pos.userId === venue) activeIds.add(pos.id);
        });
        const closedByPerps = venueData.positions.filter(p => !activeIds.has(p.id));
        if (closedByPerps.length > 0) {
            for (const closed of closedByPerps) {
                const histEntry = obeliskPerps.history.slice().reverse().find(h => h.id === closed.id);
                const pnl = histEntry ? (histEntry.pnl || 0) : 0;
                venueCapital[venue].equity = (venueCapital[venue].equity || 0) + pnl;
                venueCapital[venue].pnl = (venueCapital[venue].pnl || 0) + pnl;
                console.log(`[VENUE-EQUITY] Reconciled ${closed.coin} ${closed.side} (${histEntry ? histEntry.closeReason : 'unknown'}) PnL: $${pnl.toFixed(4)}`);
            }
            venueCapital[venue].positions = venueData.positions.filter(p => activeIds.has(p.id));
            venueData.positions = venueCapital[venue].positions;
            saveVenueData();
        }
    }

    // Calculate allocated margin from open positions
    const allocatedMargin = (venueData.positions || []).reduce((sum, pos) => {
        const margin = (pos.size || 0) / (pos.leverage || 1);
        return sum + margin;
    }, 0);

    const available = Math.max(0, venueData.equity - allocatedMargin);

    res.json({
        success: true,
        venue,
        equity: venueData.equity,
        freeCollateral: available,
        totalValue: venueData.equity,
        available: available,
        allocatedMargin: allocatedMargin,
        positions: venueData.positions,
        pnl: venueData.pnl,
        deposited: venueData.deposited,
        lastUpdated: venueData.lastUpdated
    });
});

/**
 * POST /api/trade/venue/deposit
 */
router.post('/venue/deposit', (req, res) => {
    const { venue, amount } = req.body;
    
    if (!venue || !amount) {
        return res.status(400).json({ error: 'Missing venue or amount' });
    }
    
    if (!venueCapital[venue]) {
        venueCapital[venue] = {
            equity: 0,
            deposited: 0,
            pnl: 0,
            positions: [],
            lastUpdated: Date.now()
        };
    }
    
    venueCapital[venue].equity += parseFloat(amount);
    venueCapital[venue].deposited += parseFloat(amount);
    venueCapital[venue].lastUpdated = Date.now();
    
    saveVenueData();
    
    res.json({
        success: true,
        venue,
        newEquity: venueCapital[venue].equity,
        totalDeposited: venueCapital[venue].deposited
    });
});

/**
 * POST /api/trade/venue/updatePnL
 */
router.post('/venue/updatePnL', (req, res) => {
    const { venue, pnl } = req.body;

    if (!venue || pnl === undefined) {
        return res.status(400).json({ error: 'Missing venue or pnl' });
    }

    if (!venueCapital[venue]) {
        return res.status(404).json({ error: 'Venue not found' });
    }

    venueCapital[venue].pnl = parseFloat(pnl);
    venueCapital[venue].equity = venueCapital[venue].deposited + parseFloat(pnl);
    venueCapital[venue].lastUpdated = Date.now();

    saveVenueData();

    res.json({
        success: true,
        venue,
        equity: venueCapital[venue].equity,
        pnl: venueCapital[venue].pnl
    });
});

/**
 * GET /api/trade/venue/stats?venue=mixbot
 * Get trading statistics for a venue
 */
router.get('/venue/stats', (req, res) => {
    const { venue } = req.query;

    if (!venue) {
        return res.status(400).json({ error: 'Missing venue parameter' });
    }

    const venueData = venueCapital[venue] || {
        equity: 0,
        deposited: 0,
        pnl: 0,
        positions: []
    };

    // Calculate stats
    const trades = venueData.positions?.length || 0;
    const totalPnL = venueData.pnl || 0;
    const winRate = 0; // TODO: Track wins/losses
    const avgProfit = trades > 0 ? totalPnL / trades : 0;
    const fees = 0; // TODO: Track fees

    res.json({
        success: true,
        venue,
        trades,
        pnl: totalPnL,
        winRate,
        avgProfit,
        fees,
        equity: venueData.equity,
        positions: trades
    });
});

/**
 * POST /api/trade/venue/close
 * Close a position for a venue
 */
router.post('/venue/close', async (req, res) => {
    const { venue, coin, userId } = req.body;

    if (!venue) {
        return res.status(400).json({ error: 'Missing venue parameter' });
    }

    if (!venueCapital[venue]) {
        return res.status(404).json({ error: 'Venue not found' });
    }

    // Find and remove position from venue tracker
    const positions = venueCapital[venue].positions || [];
    const index = positions.findIndex(p =>
        (coin && p.coin?.toUpperCase() === coin?.toUpperCase()) || (userId && p.userId === userId)
    );

    if (index === -1) {
        return res.status(404).json({ error: 'Position not found' });
    }

    const position = positions.splice(index, 1)[0];

    // Close in ObeliskPerps engine to get real PnL
    let netPnl = 0;
    const obeliskPerps = req.app.get('obeliskPerps');
    if (obeliskPerps && coin) {
        try {
            const closeResult = await obeliskPerps.closePosition({ coin: coin.toUpperCase(), userId: venue });
            if (closeResult.success) {
                netPnl = closeResult.result.netPnl || 0;
                // Update equity with realized PnL
                venueCapital[venue].equity = (venueCapital[venue].equity || venueCapital[venue].deposited) + netPnl;
                venueCapital[venue].pnl = (venueCapital[venue].pnl || 0) + netPnl;
            }
        } catch (e) {
            console.warn('[VENUE-CLOSE] ObeliskPerps close error:', e.message);
        }
    }

    venueCapital[venue].lastUpdated = Date.now();
    saveVenueData();

    res.json({
        success: true,
        venue,
        closed: position,
        netPnl,
        remainingPositions: positions.length
    });
});

/**
 * POST /api/trade/venue/order
 * Place order via venue capital (uses Obelisk Perps internal engine)
 */
router.post('/venue/order', async (req, res) => {
    const { venue, coin, side, size, leverage, sl, tp } = req.body;

    if (!venue || !coin || !side || !size) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['venue', 'coin', 'side', 'size']
        });
    }

    if (!venueCapital[venue]) {
        return res.status(404).json({ error: 'Venue not found' });
    }

    // Calculate available capital (equity - allocated margin)
    const allocatedMargin = (venueCapital[venue].positions || []).reduce((sum, pos) => {
        const margin = (pos.size || 0) / (pos.leverage || 1);
        return sum + margin;
    }, 0);

    const available = Math.max(0, venueCapital[venue].equity - allocatedMargin);
    const requiredMargin = parseFloat(size) / (leverage ? parseInt(leverage) : 1);

    // Check available capital (need margin, not full size)
    if (available < requiredMargin) {
        return res.status(400).json({
            error: 'Insufficient capital',
            available: available,
            required: requiredMargin,
            allocatedMargin: allocatedMargin
        });
    }

    try {
        // Get Obelisk Perps instance from server (will be injected)
        const obeliskPerps = req.app.get('obeliskPerps');

        if (!obeliskPerps) {
            return res.status(503).json({ error: 'Obelisk Perps not available' });
        }

        // Open position via Obelisk Perps
        const result = await obeliskPerps.openPosition({
            coin: coin.toUpperCase(),
            side: side.toLowerCase() === 'buy' || side.toLowerCase() === 'long' ? 'long' : 'short',
            size: parseFloat(size),
            leverage: leverage ? parseInt(leverage) : 2,
            sl: sl ? parseFloat(sl) : null,
            tp: tp ? parseFloat(tp) : null,
            venue: 'PAPER',  // Obelisk internal pool - Real prices, internal matching
            userId: venue     // Track by venue
        });

        if (result.success) {
            const pos = result.position;
            // Update venue capital
            venueCapital[venue].positions.push({
                id: pos.id,
                coin,
                side,
                size,
                leverage,
                entryPrice: pos.entryPrice,
                tp: tp ? parseFloat(tp) : null,
                sl: sl ? parseFloat(sl) : null,
                openedAt: Date.now()
            });
            venueCapital[venue].lastUpdated = Date.now();
            saveVenueData();

            console.log(`[VENUE-ORDER] ${venue}: ${side} ${coin} $${size} @ ${pos.entryPrice}`);

            return res.json({
                success: true,
                orderId: pos.id,
                venue: 'obelisk_internal',
                price: pos.entryPrice,
                fees: pos.fee,
                positionId: pos.id
            });
        }

        console.error('[VENUE-ORDER] Order failed:', result.error || 'Unknown error');
        res.status(500).json({ success: false, error: result.error || 'Order failed' });

    } catch (error) {
        console.error('[VENUE-ORDER] Exception:', error.message, error.stack);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
