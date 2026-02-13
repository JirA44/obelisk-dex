/**
 * OBELISK Webhook System
 * Send notifications to external services for important events
 *
 * Events: trade.executed, user.registered, user.login, alert.security, position.liquidated
 */

const crypto = require('crypto');

class WebhookService {
    constructor() {
        this.webhooks = new Map(); // userId -> webhooks[]
        this.globalWebhooks = []; // System-wide webhooks
        this.retryQueue = [];
        this.maxRetries = 3;
    }

    // Register a webhook for a user
    register(userId, webhook) {
        const id = crypto.randomUUID();
        const entry = {
            id,
            userId,
            url: webhook.url,
            secret: webhook.secret || crypto.randomBytes(32).toString('hex'),
            events: webhook.events || ['*'], // ['trade.executed', 'alert.security']
            active: true,
            createdAt: Date.now(),
            lastTriggered: null,
            failCount: 0
        };

        if (!this.webhooks.has(userId)) {
            this.webhooks.set(userId, []);
        }
        this.webhooks.get(userId).push(entry);

        console.log(`[WEBHOOK] Registered for user ${userId}: ${webhook.url}`);
        return { id, secret: entry.secret };
    }

    // Register a global webhook (admin only)
    registerGlobal(webhook) {
        const id = crypto.randomUUID();
        const entry = {
            id,
            url: webhook.url,
            secret: webhook.secret || crypto.randomBytes(32).toString('hex'),
            events: webhook.events || ['*'],
            active: true,
            createdAt: Date.now()
        };
        this.globalWebhooks.push(entry);
        console.log(`[WEBHOOK] Global webhook registered: ${webhook.url}`);
        return { id, secret: entry.secret };
    }

    // Remove a webhook
    remove(userId, webhookId) {
        if (this.webhooks.has(userId)) {
            const hooks = this.webhooks.get(userId);
            const index = hooks.findIndex(h => h.id === webhookId);
            if (index !== -1) {
                hooks.splice(index, 1);
                console.log(`[WEBHOOK] Removed: ${webhookId}`);
                return true;
            }
        }
        return false;
    }

    // Trigger webhook for an event
    async trigger(event, data, userId = null) {
        const payload = {
            event,
            data,
            timestamp: Date.now(),
            id: crypto.randomUUID()
        };

        const hooks = [];

        // Add user-specific webhooks
        if (userId && this.webhooks.has(userId)) {
            hooks.push(...this.webhooks.get(userId).filter(h =>
                h.active && (h.events.includes('*') || h.events.includes(event))
            ));
        }

        // Add global webhooks
        hooks.push(...this.globalWebhooks.filter(h =>
            h.active && (h.events.includes('*') || h.events.includes(event))
        ));

        // Send to all matching webhooks
        const results = await Promise.allSettled(
            hooks.map(hook => this.send(hook, payload))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (hooks.length > 0) {
            console.log(`[WEBHOOK] ${event}: ${successful} sent, ${failed} failed`);
        }

        return { sent: successful, failed };
    }

    // Send webhook request
    async send(hook, payload, retryCount = 0) {
        const signature = this.sign(JSON.stringify(payload), hook.secret);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(hook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Obelisk-Signature': signature,
                    'X-Obelisk-Event': payload.event,
                    'X-Obelisk-Timestamp': payload.timestamp.toString(),
                    'X-Obelisk-Delivery': payload.id,
                    'User-Agent': 'OBELISK-Webhook/1.0'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            hook.lastTriggered = Date.now();
            hook.failCount = 0;

            return { success: true, status: response.status };

        } catch (error) {
            hook.failCount++;

            // Retry logic
            if (retryCount < this.maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                setTimeout(() => this.send(hook, payload, retryCount + 1), delay);
                console.log(`[WEBHOOK] Retry ${retryCount + 1} for ${hook.url} in ${delay}ms`);
            } else {
                // Disable after max retries
                if (hook.failCount >= 10) {
                    hook.active = false;
                    console.log(`[WEBHOOK] Disabled due to failures: ${hook.url}`);
                }
            }

            throw error;
        }
    }

    // Sign payload with secret
    sign(payload, secret) {
        return crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
    }

    // Verify incoming webhook (for receiving webhooks)
    verify(payload, signature, secret) {
        const expected = this.sign(payload, secret);
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected)
        );
    }

    // Get webhooks for a user
    list(userId) {
        const hooks = this.webhooks.get(userId) || [];
        return hooks.map(h => ({
            id: h.id,
            url: h.url,
            events: h.events,
            active: h.active,
            createdAt: h.createdAt,
            lastTriggered: h.lastTriggered
        }));
    }

    // Test a webhook
    async test(userId, webhookId) {
        const hooks = this.webhooks.get(userId) || [];
        const hook = hooks.find(h => h.id === webhookId);

        if (!hook) {
            return { success: false, error: 'Webhook not found' };
        }

        try {
            const result = await this.send(hook, {
                event: 'test',
                data: { message: 'This is a test webhook from OBELISK' },
                timestamp: Date.now(),
                id: crypto.randomUUID()
            });
            return { success: true, ...result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Singleton
const webhookService = new WebhookService();

// Express routes
function setupWebhookRoutes(app) {
    // List user webhooks
    app.get('/api/webhooks', (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        res.json({ webhooks: webhookService.list(userId) });
    });

    // Register webhook
    app.post('/api/webhooks', (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { url, events } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL required' });
        }

        try {
            new URL(url); // Validate URL
        } catch {
            return res.status(400).json({ error: 'Invalid URL' });
        }

        const result = webhookService.register(userId, { url, events });
        res.json({
            success: true,
            webhook: result,
            message: 'Save the secret - it will only be shown once!'
        });
    });

    // Delete webhook
    app.delete('/api/webhooks/:id', (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const success = webhookService.remove(userId, req.params.id);
        res.json({ success });
    });

    // Test webhook
    app.post('/api/webhooks/:id/test', async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const result = await webhookService.test(userId, req.params.id);
        res.json(result);
    });

    console.log('[WEBHOOKS] Routes registered');
}

// Event triggers (call these from other parts of the app)
const WebhookEvents = {
    // Trade executed
    tradeExecuted: (userId, trade) => {
        webhookService.trigger('trade.executed', {
            tradeId: trade.id,
            pair: trade.pair,
            side: trade.side,
            amount: trade.amount,
            price: trade.price,
            total: trade.amount * trade.price,
            fee: trade.fee
        }, userId);
    },

    // User registered
    userRegistered: (userId, user) => {
        webhookService.trigger('user.registered', {
            userId,
            email: user.email,
            provider: user.provider,
            walletLinked: !!user.walletAddress
        }, userId);
    },

    // Security alert
    securityAlert: (userId, alert) => {
        webhookService.trigger('alert.security', {
            type: alert.type,
            ip: alert.ip,
            userAgent: alert.userAgent,
            location: alert.location
        }, userId);
    },

    // Position liquidated
    positionLiquidated: (userId, position) => {
        webhookService.trigger('position.liquidated', {
            positionId: position.id,
            pair: position.pair,
            size: position.size,
            liquidationPrice: position.liquidationPrice,
            loss: position.loss
        }, userId);
    },

    // Price alert triggered
    priceAlert: (userId, alert) => {
        webhookService.trigger('alert.price', {
            pair: alert.pair,
            condition: alert.condition, // 'above' | 'below'
            targetPrice: alert.targetPrice,
            currentPrice: alert.currentPrice
        }, userId);
    },

    // Deposit confirmed
    depositConfirmed: (userId, deposit) => {
        webhookService.trigger('deposit.confirmed', {
            token: deposit.token,
            amount: deposit.amount,
            txHash: deposit.txHash
        }, userId);
    },

    // Withdrawal completed
    withdrawalCompleted: (userId, withdrawal) => {
        webhookService.trigger('withdrawal.completed', {
            token: withdrawal.token,
            amount: withdrawal.amount,
            txHash: withdrawal.txHash,
            destination: withdrawal.destination
        }, userId);
    }
};

module.exports = {
    webhookService,
    setupWebhookRoutes,
    WebhookEvents
};
