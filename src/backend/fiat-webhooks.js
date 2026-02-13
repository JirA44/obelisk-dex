/**
 * OBELISK - Fiat On-Ramp Webhooks
 * Handles webhooks from MoonPay and Transak
 */

const express = require('express');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// In-memory storage for transactions (with persistence)
let fiatTransactions = [];
const TRANSACTIONS_FILE = path.join(__dirname, 'data', 'fiat_transactions.json');

// Load transactions from file on startup
async function loadTransactions() {
    try {
        const data = await fs.readFile(TRANSACTIONS_FILE, 'utf8');
        fiatTransactions = JSON.parse(data);
        console.log(`[FiatWebhooks] Loaded ${fiatTransactions.length} transactions from disk`);
    } catch (e) {
        console.log('[FiatWebhooks] No existing transactions file, starting fresh');
        fiatTransactions = [];
    }
}

// Save transactions to file
async function saveTransactions() {
    try {
        await fs.mkdir(path.dirname(TRANSACTIONS_FILE), { recursive: true });
        await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(fiatTransactions, null, 2));
    } catch (e) {
        console.error('[FiatWebhooks] Error saving transactions:', e.message);
    }
}

// Initialize
loadTransactions();

// WebSocket broadcast function (set by server.js)
let broadcastFunction = null;
router.setBroadcast = (fn) => {
    broadcastFunction = fn;
};

/**
 * Verify MoonPay webhook signature
 * MoonPay uses HMAC-SHA256 for signature verification
 */
function verifyMoonPaySignature(payload, signature) {
    const secret = process.env.MOONPAY_WEBHOOK_SECRET;

    if (!secret) {
        console.warn('[FiatWebhooks] MOONPAY_WEBHOOK_SECRET not configured, skipping verification');
        return true; // In dev mode, allow unverified webhooks
    }

    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('base64');

        return signature === expectedSignature;
    } catch (e) {
        console.error('[FiatWebhooks] MoonPay signature verification error:', e.message);
        return false;
    }
}

/**
 * Verify Transak webhook signature
 * Transak sends signature in x-signature header
 */
function verifyTransakSignature(payload, signature) {
    const secret = process.env.TRANSAK_WEBHOOK_SECRET;

    if (!secret) {
        console.warn('[FiatWebhooks] TRANSAK_WEBHOOK_SECRET not configured, skipping verification');
        return true; // In dev mode, allow unverified webhooks
    }

    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        return signature === expectedSignature;
    } catch (e) {
        console.error('[FiatWebhooks] Transak signature verification error:', e.message);
        return false;
    }
}

/**
 * MoonPay webhook endpoint
 * Events: transactionCreated, transactionUpdated, transactionCompleted, transactionFailed
 */
router.post('/webhooks/moonpay', async (req, res) => {
    const signature = req.headers['moonpay-signature'];
    const payload = req.body;

    console.log('[FiatWebhooks] MoonPay webhook received:', payload.type);

    // Verify signature
    if (!verifyMoonPaySignature(payload, signature)) {
        console.error('[FiatWebhooks] Invalid MoonPay signature');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    try {
        const transaction = {
            id: payload.id || `mp_${Date.now()}`,
            provider: 'moonpay',
            type: payload.type,
            status: payload.status,
            cryptoCurrency: payload.cryptoCurrency,
            baseCurrency: payload.baseCurrency,
            baseCurrencyAmount: payload.baseCurrencyAmount,
            quoteCurrencyAmount: payload.quoteCurrencyAmount,
            walletAddress: payload.walletAddress,
            email: payload.email,
            createdAt: payload.createdAt || new Date().toISOString(),
            updatedAt: payload.updatedAt || new Date().toISOString(),
            raw: payload
        };

        // Store or update transaction
        const existingIndex = fiatTransactions.findIndex(t => t.id === transaction.id);
        if (existingIndex >= 0) {
            fiatTransactions[existingIndex] = transaction;
        } else {
            fiatTransactions.unshift(transaction);
        }

        // Keep only last 1000 transactions
        if (fiatTransactions.length > 1000) {
            fiatTransactions = fiatTransactions.slice(0, 1000);
        }

        // Save to disk
        await saveTransactions();

        // Broadcast to WebSocket clients
        if (broadcastFunction) {
            broadcastFunction('fiat:transaction', {
                type: 'fiat_transaction',
                provider: 'moonpay',
                transaction
            });
        }

        console.log(`[FiatWebhooks] MoonPay transaction ${transaction.id} - ${transaction.status}`);

        res.status(200).json({ received: true });
    } catch (e) {
        console.error('[FiatWebhooks] Error processing MoonPay webhook:', e.message);
        res.status(500).json({ error: 'Processing error' });
    }
});

/**
 * Transak webhook endpoint
 * Events: ORDER_CREATED, ORDER_PROCESSING, ORDER_COMPLETED, ORDER_FAILED, ORDER_CANCELLED
 */
router.post('/webhooks/transak', async (req, res) => {
    const signature = req.headers['x-signature'];
    const payload = req.body;

    console.log('[FiatWebhooks] Transak webhook received:', payload.eventName);

    // Verify signature
    if (!verifyTransakSignature(payload.data, signature)) {
        console.error('[FiatWebhooks] Invalid Transak signature');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    try {
        const data = payload.data;
        const transaction = {
            id: data.id || `tr_${Date.now()}`,
            provider: 'transak',
            eventName: payload.eventName,
            status: data.status,
            cryptoCurrency: data.cryptocurrency,
            fiatCurrency: data.fiatCurrency,
            fiatAmount: data.fiatAmount,
            cryptoAmount: data.cryptoAmount,
            walletAddress: data.walletAddress,
            network: data.network,
            email: data.email,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            raw: data
        };

        // Store or update transaction
        const existingIndex = fiatTransactions.findIndex(t => t.id === transaction.id);
        if (existingIndex >= 0) {
            fiatTransactions[existingIndex] = transaction;
        } else {
            fiatTransactions.unshift(transaction);
        }

        // Keep only last 1000 transactions
        if (fiatTransactions.length > 1000) {
            fiatTransactions = fiatTransactions.slice(0, 1000);
        }

        // Save to disk
        await saveTransactions();

        // Broadcast to WebSocket clients
        if (broadcastFunction) {
            broadcastFunction('fiat:transaction', {
                type: 'fiat_transaction',
                provider: 'transak',
                transaction
            });
        }

        console.log(`[FiatWebhooks] Transak transaction ${transaction.id} - ${transaction.status}`);

        res.status(200).json({ received: true });
    } catch (e) {
        console.error('[FiatWebhooks] Error processing Transak webhook:', e.message);
        res.status(500).json({ error: 'Processing error' });
    }
});

/**
 * Get recent fiat transactions
 * Query params: limit (default 50), provider (filter by provider)
 */
router.get('/fiat/transactions', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const provider = req.query.provider; // 'moonpay' | 'transak'
    const walletAddress = req.query.wallet;

    let filtered = fiatTransactions;

    if (provider) {
        filtered = filtered.filter(t => t.provider === provider);
    }

    if (walletAddress) {
        filtered = filtered.filter(t =>
            t.walletAddress && t.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );
    }

    const transactions = filtered.slice(0, limit);

    res.json({
        success: true,
        count: transactions.length,
        total: filtered.length,
        transactions
    });
});

/**
 * Get transaction by ID
 */
router.get('/fiat/transactions/:id', (req, res) => {
    const transaction = fiatTransactions.find(t => t.id === req.params.id);

    if (!transaction) {
        return res.status(404).json({
            success: false,
            error: 'Transaction not found'
        });
    }

    res.json({
        success: true,
        transaction
    });
});

/**
 * Get fiat statistics
 */
router.get('/fiat/stats', (req, res) => {
    const stats = {
        totalTransactions: fiatTransactions.length,
        byProvider: {
            moonpay: fiatTransactions.filter(t => t.provider === 'moonpay').length,
            transak: fiatTransactions.filter(t => t.provider === 'transak').length
        },
        byStatus: {},
        last24h: 0,
        totalVolume: {
            usd: 0
        }
    };

    // Calculate statistics
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    fiatTransactions.forEach(t => {
        // Count by status
        const status = t.status || 'unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // Count last 24h
        const createdAt = new Date(t.createdAt || t.updatedAt).getTime();
        if (now - createdAt < day) {
            stats.last24h++;
        }

        // Estimate volume (simplified)
        if (t.status === 'completed' || t.status === 'COMPLETED') {
            const amount = t.baseCurrencyAmount || t.fiatAmount || 0;
            stats.totalVolume.usd += parseFloat(amount) || 0;
        }
    });

    res.json({
        success: true,
        stats
    });
});

module.exports = router;
