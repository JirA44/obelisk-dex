/**
 * Obelisk DEX - Smart Intent Trading
 *
 * Revolutionary natural language trading system.
 * Users express what they want, system executes optimally.
 *
 * Examples:
 * - "Swap 1 ETH to USDC when price hits $4000"
 * - "Buy ETH with 50% of my USDC if it drops 10%"
 * - "DCA $100 into BTC every week"
 * - "Take profit on my ETH at 20% gain"
 */

const SmartIntent = {
    // Active intents
    intents: [],

    // Intent types
    TYPES: {
        SWAP: 'swap',
        LIMIT_BUY: 'limit_buy',
        LIMIT_SELL: 'limit_sell',
        STOP_LOSS: 'stop_loss',
        TAKE_PROFIT: 'take_profit',
        DCA: 'dca',
        TRAILING_STOP: 'trailing_stop',
        CONDITIONAL: 'conditional'
    },

    // Price conditions
    CONDITIONS: {
        ABOVE: 'above',
        BELOW: 'below',
        CHANGE_UP: 'change_up',
        CHANGE_DOWN: 'change_down',
        CROSS_MA: 'cross_ma'
    },

    /**
     * Parse natural language intent
     */
    parseIntent(text) {
        const normalized = text.toLowerCase().trim();

        // Patterns for different intents
        const patterns = {
            // "swap 1 ETH to USDC" or "convert 100 USDC to ETH"
            swap: /(?:swap|convert|exchange)\s+([\d.]+)\s*(\w+)\s+(?:to|for|into)\s+(\w+)/i,

            // "buy ETH at $3500" or "buy 1 ETH when price is 3500"
            limitBuy: /buy\s+([\d.]+)?\s*(\w+)\s+(?:at|when\s+price\s+(?:is|hits|reaches)?)\s*\$?([\d,]+)/i,

            // "sell ETH at $4000"
            limitSell: /sell\s+([\d.]+)?\s*(\w+)\s+(?:at|when\s+price\s+(?:is|hits|reaches)?)\s*\$?([\d,]+)/i,

            // "stop loss at $3000" or "sell if ETH drops below 3000"
            stopLoss: /(?:stop\s*loss|sell\s+if)\s+(?:(\w+)\s+)?(?:drops?\s+)?(?:below|at)\s*\$?([\d,]+)/i,

            // "take profit at 20%" or "sell at 20% gain"
            takeProfit: /(?:take\s*profit|sell)\s+(?:at\s+)?([\d.]+)%\s*(?:gain|profit)?/i,

            // "DCA $100 into BTC weekly"
            dca: /dca\s+\$?([\d,]+)\s+(?:into|to)\s+(\w+)\s+(daily|weekly|monthly|hourly)/i,

            // "trailing stop 5%"
            trailingStop: /trailing\s+stop\s+([\d.]+)%/i,

            // "buy if RSI below 30"
            conditional: /(?:buy|sell)\s+(?:if|when)\s+(\w+)\s+(above|below)\s+([\d.]+)/i
        };

        // Try each pattern
        for (const [type, pattern] of Object.entries(patterns)) {
            const match = normalized.match(pattern);
            if (match) {
                return this.buildIntent(type, match);
            }
        }

        return null;
    },

    /**
     * Build intent object from parsed match
     */
    buildIntent(type, match) {
        const intent = {
            id: 'intent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: type,
            status: 'pending',
            createdAt: Date.now(),
            raw: match[0]
        };

        switch (type) {
            case 'swap':
                intent.fromAmount = parseFloat(match[1]);
                intent.fromToken = match[2].toUpperCase();
                intent.toToken = match[3].toUpperCase();
                intent.executeImmediately = true;
                break;

            case 'limitBuy':
                intent.type = this.TYPES.LIMIT_BUY;
                intent.amount = match[1] ? parseFloat(match[1]) : null;
                intent.token = match[2].toUpperCase();
                intent.targetPrice = parseFloat(match[3].replace(/,/g, ''));
                intent.condition = this.CONDITIONS.BELOW;
                break;

            case 'limitSell':
                intent.type = this.TYPES.LIMIT_SELL;
                intent.amount = match[1] ? parseFloat(match[1]) : null;
                intent.token = match[2].toUpperCase();
                intent.targetPrice = parseFloat(match[3].replace(/,/g, ''));
                intent.condition = this.CONDITIONS.ABOVE;
                break;

            case 'stopLoss':
                intent.type = this.TYPES.STOP_LOSS;
                intent.token = match[1]?.toUpperCase() || 'ETH';
                intent.stopPrice = parseFloat(match[2].replace(/,/g, ''));
                intent.condition = this.CONDITIONS.BELOW;
                break;

            case 'takeProfit':
                intent.type = this.TYPES.TAKE_PROFIT;
                intent.profitPercent = parseFloat(match[1]);
                break;

            case 'dca':
                intent.type = this.TYPES.DCA;
                intent.amount = parseFloat(match[1].replace(/,/g, ''));
                intent.token = match[2].toUpperCase();
                intent.frequency = match[3].toLowerCase();
                intent.nextExecution = this.getNextExecution(match[3]);
                break;

            case 'trailingStop':
                intent.type = this.TYPES.TRAILING_STOP;
                intent.trailPercent = parseFloat(match[1]);
                intent.highestPrice = null;
                break;

            case 'conditional':
                intent.type = this.TYPES.CONDITIONAL;
                intent.indicator = match[1].toUpperCase();
                intent.condition = match[2].toLowerCase();
                intent.threshold = parseFloat(match[3]);
                break;
        }

        return intent;
    },

    /**
     * Calculate next DCA execution time
     */
    getNextExecution(frequency) {
        const now = Date.now();
        const intervals = {
            hourly: 60 * 60 * 1000,
            daily: 24 * 60 * 60 * 1000,
            weekly: 7 * 24 * 60 * 60 * 1000,
            monthly: 30 * 24 * 60 * 60 * 1000
        };
        return now + (intervals[frequency] || intervals.daily);
    },

    /**
     * Create and register new intent
     */
    async createIntent(text, wallet) {
        const intent = this.parseIntent(text);

        if (!intent) {
            throw new Error('Could not understand intent. Try: "swap 1 ETH to USDC" or "buy ETH at $3500"');
        }

        intent.wallet = wallet.address;

        // Validate intent
        await this.validateIntent(intent, wallet);

        // If immediate execution (simple swap)
        if (intent.executeImmediately) {
            return await this.executeSwap(intent, wallet);
        }

        // Store for monitoring
        this.intents.push(intent);
        this.saveIntents();

        // Start monitoring if not already running
        this.startMonitoring();

        return intent;
    },

    /**
     * Validate intent against wallet balance
     */
    async validateIntent(intent, wallet) {
        // Check balance for swaps and sells
        if (intent.fromToken || intent.type === this.TYPES.LIMIT_SELL) {
            const token = intent.fromToken || intent.token;
            // In production, check actual balance
            // const balance = await getTokenBalance(wallet.address, token);
            // if (balance < intent.fromAmount) throw new Error('Insufficient balance');
        }

        return true;
    },

    /**
     * Execute immediate swap
     */
    async executeSwap(intent, wallet) {
        // Get best route
        const quote = await UniswapModule.getQuote(
            intent.fromToken,
            intent.toToken,
            intent.fromAmount
        );

        // Execute via Uniswap or 0x
        const result = await UniswapModule.executeSwap(
            wallet,
            intent.fromToken,
            intent.toToken,
            intent.fromAmount
        );

        intent.status = 'executed';
        intent.executedAt = Date.now();
        intent.txHash = result.txHash;

        return intent;
    },

    /**
     * Start price monitoring for pending intents
     */
    startMonitoring() {
        if (this.monitorInterval) return;

        this.monitorInterval = setInterval(() => {
            this.checkIntents();
        }, 10000); // Check every 10 seconds

        console.log('Smart Intent monitoring started');
    },

    /**
     * Check all pending intents against current conditions
     */
    async checkIntents() {
        const pendingIntents = this.intents.filter(i => i.status === 'pending');

        for (const intent of pendingIntents) {
            try {
                await this.evaluateIntent(intent);
            } catch (e) {
                console.error('Error evaluating intent:', e);
            }
        }
    },

    /**
     * Evaluate if intent conditions are met
     */
    async evaluateIntent(intent) {
        const currentPrice = PriceService.prices[intent.token]?.price;
        if (!currentPrice) return;

        let shouldExecute = false;

        switch (intent.type) {
            case this.TYPES.LIMIT_BUY:
                shouldExecute = currentPrice <= intent.targetPrice;
                break;

            case this.TYPES.LIMIT_SELL:
                shouldExecute = currentPrice >= intent.targetPrice;
                break;

            case this.TYPES.STOP_LOSS:
                shouldExecute = currentPrice <= intent.stopPrice;
                break;

            case this.TYPES.TAKE_PROFIT:
                // Need entry price tracking
                if (intent.entryPrice) {
                    const gain = ((currentPrice - intent.entryPrice) / intent.entryPrice) * 100;
                    shouldExecute = gain >= intent.profitPercent;
                }
                break;

            case this.TYPES.DCA:
                shouldExecute = Date.now() >= intent.nextExecution;
                break;

            case this.TYPES.TRAILING_STOP:
                if (!intent.highestPrice || currentPrice > intent.highestPrice) {
                    intent.highestPrice = currentPrice;
                }
                const dropPercent = ((intent.highestPrice - currentPrice) / intent.highestPrice) * 100;
                shouldExecute = dropPercent >= intent.trailPercent;
                break;
        }

        if (shouldExecute) {
            await this.executeIntent(intent);
        }
    },

    /**
     * Execute triggered intent
     */
    async executeIntent(intent) {
        console.log('Executing intent:', intent.id);

        try {
            // Get wallet (need to unlock for execution)
            const wallet = WalletManager.currentWallet;
            if (!wallet) {
                intent.status = 'failed';
                intent.error = 'Wallet not connected';
                return;
            }

            let result;

            switch (intent.type) {
                case this.TYPES.LIMIT_BUY:
                case this.TYPES.LIMIT_SELL:
                case this.TYPES.STOP_LOSS:
                case this.TYPES.TAKE_PROFIT:
                case this.TYPES.TRAILING_STOP:
                    // Execute swap
                    const fromToken = intent.type === this.TYPES.LIMIT_BUY ? 'USDC' : intent.token;
                    const toToken = intent.type === this.TYPES.LIMIT_BUY ? intent.token : 'USDC';

                    result = await UniswapModule.executeSwap(
                        wallet,
                        fromToken,
                        toToken,
                        intent.amount || 'all'
                    );
                    break;

                case this.TYPES.DCA:
                    result = await UniswapModule.executeSwap(
                        wallet,
                        'USDC',
                        intent.token,
                        intent.amount
                    );
                    // Schedule next execution
                    intent.nextExecution = this.getNextExecution(intent.frequency);
                    intent.lastExecution = Date.now();
                    intent.executionCount = (intent.executionCount || 0) + 1;
                    // Don't mark as executed, keep running
                    this.saveIntents();
                    return;
            }

            intent.status = 'executed';
            intent.executedAt = Date.now();
            intent.txHash = result?.txHash;

            // Notify user
            this.notifyExecution(intent);

        } catch (e) {
            intent.status = 'failed';
            intent.error = e.message;
        }

        this.saveIntents();
    },

    /**
     * Notify user of execution
     */
    notifyExecution(intent) {
        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification('Obelisk: Intent Executed', {
                body: `Your ${intent.type} order has been executed`,
                icon: '/img/logo.png'
            });
        }

        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('intent-executed', { detail: intent }));
    },

    /**
     * Cancel pending intent
     */
    cancelIntent(intentId) {
        const intent = this.intents.find(i => i.id === intentId);
        if (intent && intent.status === 'pending') {
            intent.status = 'cancelled';
            intent.cancelledAt = Date.now();
            this.saveIntents();
            return true;
        }
        return false;
    },

    /**
     * Get all intents for wallet
     */
    getIntents(walletAddress, status = null) {
        return this.intents.filter(i => {
            if (walletAddress && i.wallet !== walletAddress) return false;
            if (status && i.status !== status) return false;
            return true;
        });
    },

    /**
     * Save intents to localStorage
     */
    saveIntents() {
        try {
            localStorage.setItem('obelisk_intents', JSON.stringify(this.intents));
        } catch (e) {
            console.error('Failed to save intents:', e);
        }
    },

    /**
     * Load intents from localStorage
     */
    loadIntents() {
        try {
            const saved = localStorage.getItem('obelisk_intents');
            if (saved) {
                this.intents = JSON.parse(saved);
                // Resume monitoring if there are pending intents
                if (this.intents.some(i => i.status === 'pending')) {
                    this.startMonitoring();
                }
            }
        } catch (e) {
            console.error('Failed to load intents:', e);
        }
    },

    /**
     * Get intent suggestions based on portfolio
     */
    getSuggestions(portfolio) {
        const suggestions = [];

        // Suggest stop-loss if no protection
        if (portfolio.totalValue > 1000) {
            suggestions.push({
                text: 'Set a 10% stop-loss to protect your portfolio',
                intent: 'trailing stop 10%'
            });
        }

        // Suggest DCA if holding stablecoins
        if (portfolio.stablecoins > 100) {
            suggestions.push({
                text: 'Start weekly DCA into ETH',
                intent: `DCA $${Math.floor(portfolio.stablecoins / 10)} into ETH weekly`
            });
        }

        // Suggest take-profit if up significantly
        if (portfolio.unrealizedGain > 20) {
            suggestions.push({
                text: 'Take partial profits',
                intent: 'take profit at 25%'
            });
        }

        return suggestions;
    },

    /**
     * Initialize
     */
    init() {
        this.loadIntents();

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        console.log('Smart Intent system initialized');
    }
};

// Export
window.SmartIntent = SmartIntent;
