/**
 * OBELISK Automation Engine
 * Custom Bots, Price Alerts, Webhooks, API Trading
 */

const https = require('https');
const http = require('http');

class AutomationEngine {
    constructor() {
        // Custom Bots
        this.bots = new Map();
        this.botTemplates = new Map();

        // Price Alerts
        this.priceAlerts = new Map();
        this.triggeredAlerts = [];

        // Webhooks
        this.webhooks = new Map();
        this.webhookHistory = [];

        // Scheduled Tasks
        this.scheduledTasks = new Map();
        this.taskHistory = [];

        // Statistics
        this.stats = {
            botsActive: 0,
            alertsActive: 0,
            webhooksConfigured: 0,
            webhooksSent: 0,
            tasksExecuted: 0
        };

        // Initialize default bot templates
        this.initDefaultTemplates();

        console.log('[AUTOMATION] Engine initialized');
    }

    // ==========================================
    // CUSTOM BOTS
    // ==========================================

    initDefaultTemplates() {
        // Momentum Bot
        this.botTemplates.set('MOMENTUM', {
            name: 'Momentum Bot',
            description: 'Buys on strong upward momentum, sells on reversal',
            parameters: {
                pair: 'BTC/USDC',
                momentumThreshold: 2,    // % change to trigger
                lookbackPeriod: 15,      // minutes
                positionSize: 100,       // USDC
                stopLoss: 3,             // %
                takeProfit: 5            // %
            },
            logic: 'momentum'
        });

        // Mean Reversion Bot
        this.botTemplates.set('MEAN_REVERSION', {
            name: 'Mean Reversion Bot',
            description: 'Buys oversold, sells overbought based on RSI',
            parameters: {
                pair: 'ETH/USDC',
                oversoldRSI: 30,
                overboughtRSI: 70,
                rsiPeriod: 14,
                positionSize: 100,
                stopLoss: 5
            },
            logic: 'meanReversion'
        });

        // Breakout Bot
        this.botTemplates.set('BREAKOUT', {
            name: 'Breakout Bot',
            description: 'Trades breakouts from consolidation ranges',
            parameters: {
                pair: 'SOL/USDC',
                consolidationPeriod: 60,  // minutes
                breakoutThreshold: 1.5,   // % above/below range
                positionSize: 100,
                stopLoss: 2,
                takeProfit: 4
            },
            logic: 'breakout'
        });

        // Scalper Bot
        this.botTemplates.set('SCALPER', {
            name: 'Scalper Bot',
            description: 'Quick trades on small price movements',
            parameters: {
                pair: 'BTC/USDC',
                targetProfit: 0.2,        // %
                maxLoss: 0.3,             // %
                cooldownSeconds: 30,
                positionSize: 200
            },
            logic: 'scalper'
        });
    }

    createBot(userId, config) {
        const {
            name,
            template = null,
            pair,
            parameters = {},
            enabled = true
        } = config;

        const botId = `BOT_${userId}_${Date.now()}`;

        // Get template if specified
        let baseConfig = {};
        if (template && this.botTemplates.has(template)) {
            baseConfig = { ...this.botTemplates.get(template).parameters };
        }

        const bot = {
            id: botId,
            userId,
            name: name || `Bot_${botId.slice(-6)}`,
            template,
            pair: pair || baseConfig.pair || 'BTC/USDC',
            parameters: { ...baseConfig, ...parameters },
            enabled,
            status: 'idle',
            position: null,
            trades: [],
            profit: 0,
            stats: {
                totalTrades: 0,
                wins: 0,
                losses: 0,
                winRate: 0
            },
            createdAt: Date.now(),
            lastAction: null
        };

        this.bots.set(botId, bot);
        if (enabled) this.stats.botsActive++;

        return {
            success: true,
            bot: {
                id: botId,
                name: bot.name,
                pair: bot.pair,
                template,
                status: 'created',
                parameters: bot.parameters
            }
        };
    }

    processBot(botId, marketData) {
        const bot = this.bots.get(botId);
        if (!bot || !bot.enabled) return null;

        const { pair, parameters } = bot;
        const price = marketData[pair]?.price;
        if (!price) return null;

        let signal = null;

        // Process based on template logic
        switch (bot.template) {
            case 'MOMENTUM':
                signal = this.processMomentum(bot, marketData);
                break;
            case 'MEAN_REVERSION':
                signal = this.processMeanReversion(bot, marketData);
                break;
            case 'BREAKOUT':
                signal = this.processBreakout(bot, marketData);
                break;
            case 'SCALPER':
                signal = this.processScalper(bot, marketData);
                break;
            default:
                signal = this.processCustomLogic(bot, marketData);
        }

        if (signal) {
            return this.executeSignal(bot, signal, price);
        }

        return null;
    }

    processMomentum(bot, marketData) {
        const { pair, parameters } = bot;
        const { momentumThreshold, lookbackPeriod } = parameters;
        const data = marketData[pair];

        if (!data || !data.change24h) return null;

        // Simple momentum: use 24h change as proxy
        const momentum = data.change24h;

        if (!bot.position && momentum >= momentumThreshold) {
            return { action: 'BUY', reason: `Momentum ${momentum.toFixed(2)}% > ${momentumThreshold}%` };
        }

        if (bot.position && momentum < 0) {
            return { action: 'SELL', reason: `Momentum reversal: ${momentum.toFixed(2)}%` };
        }

        return null;
    }

    processMeanReversion(bot, marketData) {
        const { pair, parameters } = bot;
        const data = marketData[pair];
        if (!data) return null;

        // Simulate RSI based on price change
        const change = data.change24h || 0;
        const pseudoRSI = 50 + change * 2; // Simple approximation

        if (!bot.position && pseudoRSI <= parameters.oversoldRSI) {
            return { action: 'BUY', reason: `Oversold (RSI: ${pseudoRSI.toFixed(0)})` };
        }

        if (bot.position && pseudoRSI >= parameters.overboughtRSI) {
            return { action: 'SELL', reason: `Overbought (RSI: ${pseudoRSI.toFixed(0)})` };
        }

        return null;
    }

    processBreakout(bot, marketData) {
        const { pair, parameters } = bot;
        const data = marketData[pair];
        if (!data) return null;

        const { high, low, price } = data;
        const range = high - low;
        const breakoutLevel = range * (parameters.breakoutThreshold / 100);

        if (!bot.position && price > high - breakoutLevel * 0.5) {
            return { action: 'BUY', reason: `Breakout above ${high.toFixed(2)}` };
        }

        if (bot.position && price < bot.position.entryPrice * (1 - parameters.stopLoss / 100)) {
            return { action: 'SELL', reason: 'Stop loss triggered' };
        }

        if (bot.position && price > bot.position.entryPrice * (1 + parameters.takeProfit / 100)) {
            return { action: 'SELL', reason: 'Take profit reached' };
        }

        return null;
    }

    processScalper(bot, marketData) {
        const { pair, parameters } = bot;
        const data = marketData[pair];
        if (!data) return null;

        // Cooldown check
        if (bot.lastAction && Date.now() - bot.lastAction < parameters.cooldownSeconds * 1000) {
            return null;
        }

        if (!bot.position) {
            // Look for entry opportunity
            if (data.change24h < -0.5) {
                return { action: 'BUY', reason: 'Scalp entry on dip' };
            }
        } else {
            const pnlPercent = ((data.price - bot.position.entryPrice) / bot.position.entryPrice) * 100;

            if (pnlPercent >= parameters.targetProfit) {
                return { action: 'SELL', reason: `Target profit ${pnlPercent.toFixed(2)}%` };
            }
            if (pnlPercent <= -parameters.maxLoss) {
                return { action: 'SELL', reason: `Max loss ${pnlPercent.toFixed(2)}%` };
            }
        }

        return null;
    }

    processCustomLogic(bot, marketData) {
        // Placeholder for custom logic
        return null;
    }

    executeSignal(bot, signal, price) {
        const { action, reason } = signal;
        const { parameters } = bot;

        if (action === 'BUY' && !bot.position) {
            const quantity = parameters.positionSize / price;

            bot.position = {
                side: 'long',
                entryPrice: price,
                quantity,
                entryTime: Date.now()
            };
            bot.status = 'in_position';
            bot.lastAction = Date.now();

            const trade = {
                action: 'BUY',
                price,
                quantity,
                value: parameters.positionSize,
                reason,
                timestamp: Date.now()
            };
            bot.trades.push(trade);

            return trade;
        }

        if (action === 'SELL' && bot.position) {
            const { entryPrice, quantity } = bot.position;
            const exitValue = price * quantity;
            const entryValue = entryPrice * quantity;
            const profit = exitValue - entryValue;

            bot.profit += profit;
            bot.stats.totalTrades++;
            if (profit > 0) bot.stats.wins++;
            else bot.stats.losses++;
            bot.stats.winRate = (bot.stats.wins / bot.stats.totalTrades) * 100;

            const trade = {
                action: 'SELL',
                price,
                quantity,
                value: exitValue,
                profit: profit.toFixed(2),
                profitPercent: ((profit / entryValue) * 100).toFixed(2) + '%',
                reason,
                timestamp: Date.now()
            };
            bot.trades.push(trade);

            bot.position = null;
            bot.status = 'idle';
            bot.lastAction = Date.now();

            return trade;
        }

        return null;
    }

    getBotStatus(botId) {
        const bot = this.bots.get(botId);
        if (!bot) return null;

        return {
            id: bot.id,
            name: bot.name,
            pair: bot.pair,
            template: bot.template,
            enabled: bot.enabled,
            status: bot.status,
            position: bot.position ? {
                side: bot.position.side,
                entryPrice: bot.position.entryPrice.toFixed(4),
                quantity: bot.position.quantity.toFixed(6),
                holdTime: this.formatDuration(Date.now() - bot.position.entryTime)
            } : null,
            stats: {
                ...bot.stats,
                winRate: bot.stats.winRate.toFixed(1) + '%',
                totalProfit: bot.profit.toFixed(2)
            },
            recentTrades: bot.trades.slice(-5),
            uptime: this.formatDuration(Date.now() - bot.createdAt)
        };
    }

    toggleBot(botId, enabled) {
        const bot = this.bots.get(botId);
        if (!bot) return { success: false, error: 'Bot not found' };

        const wasEnabled = bot.enabled;
        bot.enabled = enabled;

        if (wasEnabled && !enabled) this.stats.botsActive--;
        if (!wasEnabled && enabled) this.stats.botsActive++;

        return { success: true, enabled: bot.enabled };
    }

    getBotTemplates() {
        return Array.from(this.botTemplates.entries()).map(([id, template]) => ({
            id,
            name: template.name,
            description: template.description,
            defaultParameters: template.parameters
        }));
    }

    // ==========================================
    // PRICE ALERTS
    // ==========================================

    createAlert(userId, config) {
        const {
            pair,
            condition, // 'above', 'below', 'crosses'
            price,
            repeat = false,
            webhook = null,
            message = null
        } = config;

        if (!pair || !condition || !price) {
            return { success: false, error: 'pair, condition, and price required' };
        }

        const alertId = `ALERT_${userId}_${Date.now()}`;

        const alert = {
            id: alertId,
            userId,
            pair,
            condition,
            targetPrice: price,
            repeat,
            webhook,
            customMessage: message,
            triggered: false,
            triggerCount: 0,
            lastTriggered: null,
            createdAt: Date.now()
        };

        if (!this.priceAlerts.has(pair)) {
            this.priceAlerts.set(pair, []);
        }
        this.priceAlerts.get(pair).push(alert);
        this.stats.alertsActive++;

        return {
            success: true,
            alert: {
                id: alertId,
                pair,
                condition,
                targetPrice: price,
                status: 'active'
            }
        };
    }

    checkAlerts(pair, currentPrice, previousPrice) {
        const alerts = this.priceAlerts.get(pair);
        if (!alerts) return [];

        const triggered = [];

        alerts.forEach(alert => {
            if (alert.triggered && !alert.repeat) return;

            let shouldTrigger = false;
            const target = alert.targetPrice;

            switch (alert.condition) {
                case 'above':
                    shouldTrigger = currentPrice >= target && previousPrice < target;
                    break;
                case 'below':
                    shouldTrigger = currentPrice <= target && previousPrice > target;
                    break;
                case 'crosses':
                    shouldTrigger = (currentPrice >= target && previousPrice < target) ||
                                   (currentPrice <= target && previousPrice > target);
                    break;
            }

            if (shouldTrigger) {
                alert.triggered = true;
                alert.triggerCount++;
                alert.lastTriggered = Date.now();

                const notification = {
                    alertId: alert.id,
                    userId: alert.userId,
                    pair,
                    condition: alert.condition,
                    targetPrice: target,
                    actualPrice: currentPrice,
                    message: alert.customMessage || `${pair} ${alert.condition} ${target}`,
                    timestamp: Date.now()
                };

                triggered.push(notification);
                this.triggeredAlerts.unshift(notification);

                // Send webhook if configured
                if (alert.webhook) {
                    this.sendWebhook(alert.webhook, notification);
                }

                // Remove if not repeating
                if (!alert.repeat) {
                    this.stats.alertsActive--;
                }
            }
        });

        return triggered;
    }

    getAlerts(userId) {
        const userAlerts = [];
        this.priceAlerts.forEach((alerts, pair) => {
            alerts
                .filter(a => a.userId === userId)
                .forEach(a => {
                    userAlerts.push({
                        id: a.id,
                        pair,
                        condition: a.condition,
                        targetPrice: a.targetPrice,
                        triggered: a.triggered,
                        triggerCount: a.triggerCount,
                        repeat: a.repeat,
                        createdAt: new Date(a.createdAt).toISOString()
                    });
                });
        });
        return userAlerts;
    }

    deleteAlert(alertId) {
        let found = false;
        this.priceAlerts.forEach((alerts, pair) => {
            const index = alerts.findIndex(a => a.id === alertId);
            if (index !== -1) {
                alerts.splice(index, 1);
                found = true;
                this.stats.alertsActive--;
            }
        });
        return { success: found, message: found ? 'Alert deleted' : 'Alert not found' };
    }

    // ==========================================
    // WEBHOOKS
    // ==========================================

    registerWebhook(userId, config) {
        const {
            name,
            url,
            events = ['trade', 'alert', 'whale'], // Events to subscribe to
            secret = null,
            enabled = true
        } = config;

        if (!url) {
            return { success: false, error: 'URL required' };
        }

        const webhookId = `WH_${userId}_${Date.now()}`;

        const webhook = {
            id: webhookId,
            userId,
            name: name || 'Webhook',
            url,
            events,
            secret,
            enabled,
            stats: {
                sent: 0,
                failed: 0,
                lastSent: null
            },
            createdAt: Date.now()
        };

        this.webhooks.set(webhookId, webhook);
        this.stats.webhooksConfigured++;

        return {
            success: true,
            webhook: {
                id: webhookId,
                name: webhook.name,
                url: url.replace(/\/\/(.+?)@/, '//***@'), // Mask credentials
                events,
                status: 'active'
            }
        };
    }

    async sendWebhook(webhookId, payload) {
        const webhook = typeof webhookId === 'string'
            ? this.webhooks.get(webhookId)
            : webhookId;

        if (!webhook || !webhook.enabled) return;

        const data = JSON.stringify({
            event: payload.event || 'notification',
            timestamp: Date.now(),
            data: payload
        });

        const url = new URL(webhook.url);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'User-Agent': 'OBELISK-Webhook/1.0'
            }
        };

        if (webhook.secret) {
            options.headers['X-Webhook-Secret'] = webhook.secret;
        }

        const protocol = url.protocol === 'https:' ? https : http;

        return new Promise((resolve) => {
            const req = protocol.request(options, (res) => {
                webhook.stats.sent++;
                webhook.stats.lastSent = Date.now();
                this.stats.webhooksSent++;

                this.webhookHistory.push({
                    webhookId: webhook.id,
                    status: res.statusCode,
                    timestamp: Date.now()
                });

                resolve({ success: true, status: res.statusCode });
            });

            req.on('error', (error) => {
                webhook.stats.failed++;
                this.webhookHistory.push({
                    webhookId: webhook.id,
                    status: 'error',
                    error: error.message,
                    timestamp: Date.now()
                });
                resolve({ success: false, error: error.message });
            });

            req.setTimeout(5000, () => {
                req.destroy();
                resolve({ success: false, error: 'timeout' });
            });

            req.write(data);
            req.end();
        });
    }

    broadcastEvent(eventType, data) {
        const results = [];

        this.webhooks.forEach(async (webhook) => {
            if (webhook.enabled && webhook.events.includes(eventType)) {
                const result = await this.sendWebhook(webhook.id, {
                    event: eventType,
                    ...data
                });
                results.push({ webhookId: webhook.id, ...result });
            }
        });

        return results;
    }

    getWebhooks(userId) {
        const userWebhooks = [];
        this.webhooks.forEach((wh) => {
            if (wh.userId === userId) {
                userWebhooks.push({
                    id: wh.id,
                    name: wh.name,
                    url: wh.url.replace(/\/\/(.+?)@/, '//***@'),
                    events: wh.events,
                    enabled: wh.enabled,
                    stats: wh.stats
                });
            }
        });
        return userWebhooks;
    }

    toggleWebhook(webhookId, enabled) {
        const webhook = this.webhooks.get(webhookId);
        if (!webhook) return { success: false, error: 'Webhook not found' };

        webhook.enabled = enabled;
        return { success: true, enabled: webhook.enabled };
    }

    // ==========================================
    // SCHEDULED TASKS
    // ==========================================

    scheduleTask(userId, config) {
        const {
            name,
            action, // 'buy', 'sell', 'rebalance', 'report'
            schedule, // cron-like: 'daily', 'hourly', 'weekly', or specific time
            parameters = {},
            enabled = true
        } = config;

        const taskId = `TASK_${userId}_${Date.now()}`;
        const intervalMs = this.parseSchedule(schedule);

        const task = {
            id: taskId,
            userId,
            name: name || `Task_${taskId.slice(-6)}`,
            action,
            schedule,
            intervalMs,
            parameters,
            enabled,
            nextRun: Date.now() + intervalMs,
            lastRun: null,
            runCount: 0,
            status: 'scheduled',
            createdAt: Date.now()
        };

        this.scheduledTasks.set(taskId, task);

        return {
            success: true,
            task: {
                id: taskId,
                name: task.name,
                action,
                schedule,
                nextRun: new Date(task.nextRun).toISOString()
            }
        };
    }

    parseSchedule(schedule) {
        const intervals = {
            'minutely': 60000,
            'hourly': 3600000,
            'daily': 86400000,
            'weekly': 604800000,
            'monthly': 2592000000
        };
        return intervals[schedule] || intervals.daily;
    }

    processTasks() {
        const now = Date.now();
        const executed = [];

        this.scheduledTasks.forEach((task, taskId) => {
            if (!task.enabled || now < task.nextRun) return;

            // Execute task
            const result = this.executeTask(task);

            task.lastRun = now;
            task.nextRun = now + task.intervalMs;
            task.runCount++;

            executed.push({
                taskId,
                action: task.action,
                result
            });

            this.taskHistory.push({
                taskId,
                action: task.action,
                status: result.success ? 'success' : 'failed',
                timestamp: now
            });

            this.stats.tasksExecuted++;
        });

        return executed;
    }

    executeTask(task) {
        switch (task.action) {
            case 'report':
                return { success: true, message: 'Report generated' };
            case 'rebalance':
                return { success: true, message: 'Rebalance executed' };
            default:
                return { success: true, message: `Task ${task.action} executed` };
        }
    }

    getTasks(userId) {
        const userTasks = [];
        this.scheduledTasks.forEach((task) => {
            if (task.userId === userId) {
                userTasks.push({
                    id: task.id,
                    name: task.name,
                    action: task.action,
                    schedule: task.schedule,
                    enabled: task.enabled,
                    nextRun: new Date(task.nextRun).toISOString(),
                    lastRun: task.lastRun ? new Date(task.lastRun).toISOString() : null,
                    runCount: task.runCount
                });
            }
        });
        return userTasks;
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    formatDuration(ms) {
        if (ms < 60000) return Math.floor(ms / 1000) + 's';
        if (ms < 3600000) return Math.floor(ms / 60000) + 'm';
        if (ms < 86400000) return Math.floor(ms / 3600000) + 'h';
        return Math.floor(ms / 86400000) + 'd';
    }

    getStats() {
        return {
            ...this.stats,
            totalBots: this.bots.size,
            totalWebhooks: this.webhooks.size,
            totalTasks: this.scheduledTasks.size,
            recentAlerts: this.triggeredAlerts.slice(0, 5)
        };
    }

    // Process all automations with current market data
    processAll(marketData, previousPrices = {}) {
        const results = {
            botTrades: [],
            triggeredAlerts: [],
            executedTasks: []
        };

        // Process bots
        this.bots.forEach((bot, botId) => {
            const trade = this.processBot(botId, marketData);
            if (trade) results.botTrades.push({ botId, trade });
        });

        // Check alerts
        Object.entries(marketData).forEach(([pair, data]) => {
            const prevPrice = previousPrices[pair] || data.price;
            const triggered = this.checkAlerts(pair, data.price, prevPrice);
            results.triggeredAlerts.push(...triggered);
        });

        // Process scheduled tasks
        results.executedTasks = this.processTasks();

        return results;
    }
}

module.exports = { AutomationEngine };
