/**
 * Obelisk DEX - Trading Tools
 * Professional calculators and utilities for traders
 */

const ObeliskTools = {
    // State
    state: {
        pnlSide: 'long',
        liqSide: 'long',
        alerts: [],
        gasData: null,
        fundingCountdown: null
    },

    /**
     * Initialize tools
     */
    init() {
        this.setupToggleButtons();
        this.startFundingCountdown();
        this.loadAlerts();
        this.refreshGas();
    },

    /**
     * Setup toggle button listeners
     */
    setupToggleButtons() {
        // PnL toggle
        document.querySelectorAll('#pnl-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#pnl-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.pnlSide = btn.dataset.side;
            });
        });

        // Liquidation toggle
        document.querySelectorAll('#liq-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#liq-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.liqSide = btn.dataset.side;
            });
        });
    },

    /**
     * Position Size Calculator
     */
    calculatePositionSize() {
        const balance = parseFloat(document.getElementById('ps-balance').value) || 0;
        const riskPercent = parseFloat(document.getElementById('ps-risk').value) || 1;
        const entryPrice = parseFloat(document.getElementById('ps-entry').value) || 0;
        const stopLoss = parseFloat(document.getElementById('ps-stop').value) || 0;

        if (!entryPrice || !stopLoss) {
            this.showToolError('ps-result', 'Enter entry and stop loss prices');
            return;
        }

        const riskAmount = balance * (riskPercent / 100);
        const priceDiff = Math.abs(entryPrice - stopLoss);
        const riskPerUnit = priceDiff / entryPrice;
        const positionValue = riskAmount / riskPerUnit;
        const positionSize = positionValue / entryPrice;

        document.getElementById('ps-risk-amount').textContent = this.formatCurrency(riskAmount);
        document.getElementById('ps-size').textContent = positionSize.toFixed(6) + ' units';
        document.getElementById('ps-value').textContent = this.formatCurrency(positionValue);
    },

    /**
     * PnL Calculator
     */
    calculatePnL() {
        const entryPrice = parseFloat(document.getElementById('pnl-entry').value) || 0;
        const exitPrice = parseFloat(document.getElementById('pnl-exit').value) || 0;
        const positionSize = parseFloat(document.getElementById('pnl-size').value) || 0;
        const leverage = parseFloat(document.getElementById('pnl-leverage').value) || 1;
        const feePercent = parseFloat(document.getElementById('pnl-fee').value) || 0;

        if (!entryPrice || !exitPrice || !positionSize) {
            this.showToolError('pnl-result', 'Enter all required fields');
            return;
        }

        const isLong = this.state.pnlSide === 'long';
        const priceDiff = isLong ? exitPrice - entryPrice : entryPrice - exitPrice;
        const percentChange = (priceDiff / entryPrice) * 100;
        const leveragedChange = percentChange * leverage;

        const grossPnL = (leveragedChange / 100) * positionSize;
        const fees = positionSize * 2 * (feePercent / 100); // Entry + exit
        const netPnL = grossPnL - fees;
        const roi = (netPnL / positionSize) * 100;

        const grossEl = document.getElementById('pnl-gross');
        const netEl = document.getElementById('pnl-net');
        const roiEl = document.getElementById('pnl-roi');

        grossEl.textContent = this.formatCurrency(grossPnL);
        grossEl.className = grossPnL >= 0 ? 'positive' : 'negative';

        document.getElementById('pnl-fees').textContent = '-' + this.formatCurrency(fees);

        netEl.textContent = this.formatCurrency(netPnL);
        netEl.className = netPnL >= 0 ? 'positive' : 'negative';

        roiEl.textContent = (roi >= 0 ? '+' : '') + roi.toFixed(2) + '%';
        roiEl.className = roi >= 0 ? 'positive' : 'negative';
    },

    /**
     * Liquidation Price Calculator
     */
    calculateLiquidation() {
        const entryPrice = parseFloat(document.getElementById('liq-entry').value) || 0;
        const leverage = parseFloat(document.getElementById('liq-leverage').value) || 1;
        const maintenanceMargin = parseFloat(document.getElementById('liq-mm').value) || 0.5;

        if (!entryPrice) {
            this.showToolError('liq-result', 'Enter entry price');
            return;
        }

        const isLong = this.state.liqSide === 'long';
        const liqDistance = (100 - maintenanceMargin) / leverage;

        let liqPrice;
        if (isLong) {
            liqPrice = entryPrice * (1 - liqDistance / 100);
        } else {
            liqPrice = entryPrice * (1 + liqDistance / 100);
        }

        const safeZone = isLong
            ? entryPrice * (1 - (liqDistance / 100) * 0.5)
            : entryPrice * (1 + (liqDistance / 100) * 0.5);

        document.getElementById('liq-price-result').textContent = this.formatCurrency(liqPrice);
        document.getElementById('liq-distance').textContent = (isLong ? '-' : '+') + liqDistance.toFixed(2) + '%';
        document.getElementById('liq-safe').textContent = this.formatCurrency(safeZone) + (isLong ? '+' : '-');
    },

    /**
     * Impermanent Loss Calculator
     */
    calculateIL() {
        const priceInit = parseFloat(document.getElementById('il-price-a-init').value) || 0;
        const priceCurr = parseFloat(document.getElementById('il-price-a-curr').value) || 0;
        const investment = parseFloat(document.getElementById('il-investment').value) || 0;

        if (!priceInit || !priceCurr) {
            this.showToolError('il-result', 'Enter initial and current prices');
            return;
        }

        const priceRatio = priceCurr / priceInit;

        // IL formula: 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
        const ilPercent = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;

        // HODL value (50/50 split)
        const hodlValue = investment * (1 + (priceRatio - 1) / 2);

        // LP value
        const lpValue = hodlValue * (1 + ilPercent / 100);

        const ilAmount = lpValue - hodlValue;

        document.getElementById('il-loss').textContent = ilPercent.toFixed(2) + '%';
        document.getElementById('il-lp-value').textContent = this.formatCurrency(lpValue);
        document.getElementById('il-hodl-value').textContent = this.formatCurrency(hodlValue);

        const ilAmountEl = document.getElementById('il-amount');
        ilAmountEl.textContent = this.formatCurrency(ilAmount);
        ilAmountEl.className = ilAmount >= 0 ? 'positive' : 'negative';
    },

    /**
     * Refresh Gas Prices
     */
    async refreshGas() {
        try {
            // Simulated gas data (would fetch from API in production)
            const gasData = {
                slow: Math.floor(10 + Math.random() * 10),
                standard: Math.floor(15 + Math.random() * 15),
                fast: Math.floor(25 + Math.random() * 20)
            };

            const ethPrice = 3200; // Would fetch real price

            document.getElementById('gas-slow').textContent = gasData.slow + ' gwei';
            document.getElementById('gas-standard').textContent = gasData.standard + ' gwei';
            document.getElementById('gas-fast').textContent = gasData.fast + ' gwei';

            // Calculate estimates (standard gas price)
            const gasPrice = gasData.standard * 1e9; // Convert to wei
            const ethTransfer = 21000;
            const erc20Transfer = 65000;
            const uniswapSwap = 150000;
            const nftMint = 250000;

            const calcCost = (gasLimit) => {
                const costWei = gasLimit * gasPrice;
                const costEth = costWei / 1e18;
                return costEth * ethPrice;
            };

            document.getElementById('gas-eth-transfer').textContent = '~' + this.formatCurrency(calcCost(ethTransfer));
            document.getElementById('gas-erc20-transfer').textContent = '~' + this.formatCurrency(calcCost(erc20Transfer));
            document.getElementById('gas-uniswap-swap').textContent = '~' + this.formatCurrency(calcCost(uniswapSwap));
            document.getElementById('gas-nft-mint').textContent = '~' + this.formatCurrency(calcCost(nftMint));

            this.state.gasData = gasData;
        } catch (e) {
            console.error('Failed to fetch gas prices:', e);
        }
    },

    /**
     * Refresh Funding Rates
     */
    async refreshFunding() {
        try {
            // Simulated funding data (would fetch from Hyperliquid API)
            const fundingRates = {
                BTC: (Math.random() * 0.02 - 0.005).toFixed(4),
                ETH: (Math.random() * 0.02 - 0.005).toFixed(4),
                SOL: (Math.random() * 0.02 - 0.005).toFixed(4),
                ARB: (Math.random() * 0.02 - 0.005).toFixed(4)
            };

            Object.entries(fundingRates).forEach(([symbol, rate]) => {
                const el = document.getElementById(`fr-${symbol.toLowerCase()}`);
                if (el) {
                    const rateNum = parseFloat(rate);
                    el.textContent = (rateNum >= 0 ? '+' : '') + rate + '%';
                    el.className = rateNum >= 0 ? 'positive' : 'negative';
                }
            });
        } catch (e) {
            console.error('Failed to fetch funding rates:', e);
        }
    },

    /**
     * Start Funding Countdown
     */
    startFundingCountdown() {
        const updateCountdown = () => {
            const now = new Date();
            const hours = now.getUTCHours();
            const nextFunding = new Date(now);

            // Funding every 8 hours: 0, 8, 16 UTC
            const fundingHours = [0, 8, 16];
            const nextFundingHour = fundingHours.find(h => h > hours) || 24;

            nextFunding.setUTCHours(nextFundingHour % 24, 0, 0, 0);
            if (nextFundingHour === 24) {
                nextFunding.setDate(nextFunding.getDate() + 1);
            }

            const diff = nextFunding - now;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            const el = document.getElementById('funding-countdown');
            if (el) {
                el.textContent = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
        };

        updateCountdown();
        this.state.fundingCountdown = setInterval(updateCountdown, 1000);
    },

    /**
     * ETH Unit Converter
     */
    convertEthUnits(from) {
        const weiInput = document.getElementById('conv-wei');
        const gweiInput = document.getElementById('conv-gwei');
        const ethInput = document.getElementById('conv-eth');

        let wei;
        try {
            if (from === 'wei') {
                wei = BigInt(weiInput.value || 0);
            } else if (from === 'gwei') {
                wei = BigInt(Math.floor(parseFloat(gweiInput.value || 0) * 1e9));
            } else if (from === 'eth') {
                wei = BigInt(Math.floor(parseFloat(ethInput.value || 0) * 1e18));
            }

            if (from !== 'wei') weiInput.value = wei.toString();
            if (from !== 'gwei') gweiInput.value = (Number(wei) / 1e9).toString();
            if (from !== 'eth') ethInput.value = (Number(wei) / 1e18).toString();
        } catch (e) {
            // Invalid input
        }
    },

    /**
     * Timestamp Converter
     */
    convertTimestamp() {
        const timestamp = parseInt(document.getElementById('conv-timestamp').value) || 0;
        const date = new Date(timestamp * 1000);
        document.getElementById('conv-datetime').value = date.toLocaleString();
    },

    /**
     * Set Current Timestamp
     */
    setCurrentTimestamp() {
        const now = Math.floor(Date.now() / 1000);
        document.getElementById('conv-timestamp').value = now;
        this.convertTimestamp();
    },

    /**
     * DCA Calculator
     */
    calculateDCA() {
        const amount = parseFloat(document.getElementById('dca-amount').value) || 0;
        const periods = parseInt(document.getElementById('dca-periods').value) || 1;
        const startPrice = parseFloat(document.getElementById('dca-start-price').value) || 0;
        const endPrice = parseFloat(document.getElementById('dca-end-price').value) || 0;
        const volatility = parseFloat(document.getElementById('dca-volatility').value) || 0;

        if (!startPrice || !endPrice) {
            this.showToolError('dca-result', 'Enter start and end prices');
            return;
        }

        const totalInvested = amount * periods;
        let totalUnits = 0;
        let prices = [];

        // Simulate DCA with volatility
        for (let i = 0; i < periods; i++) {
            const progress = i / (periods - 1 || 1);
            const basePrice = startPrice + (endPrice - startPrice) * progress;
            const randomFactor = 1 + (Math.random() - 0.5) * 2 * (volatility / 100);
            const price = basePrice * randomFactor;
            prices.push(price);
            totalUnits += amount / price;
        }

        const avgPrice = totalInvested / totalUnits;
        const finalValue = totalUnits * endPrice;
        const totalReturn = ((finalValue - totalInvested) / totalInvested) * 100;

        document.getElementById('dca-invested').textContent = this.formatCurrency(totalInvested);
        document.getElementById('dca-value').textContent = this.formatCurrency(finalValue);
        document.getElementById('dca-avg-price').textContent = this.formatCurrency(avgPrice);

        const returnEl = document.getElementById('dca-return');
        returnEl.textContent = (totalReturn >= 0 ? '+' : '') + totalReturn.toFixed(1) + '%';
        returnEl.className = totalReturn >= 0 ? 'positive' : 'negative';
    },

    /**
     * Token Scanner
     */
    async scanToken() {
        const address = document.getElementById('scanner-address').value.trim();

        if (!address || !address.startsWith('0x') || address.length !== 42) {
            alert('Please enter a valid contract address');
            return;
        }

        // Show result section
        document.getElementById('scanner-result').style.display = 'block';

        // Simulated token data (would fetch from API in production)
        const mockData = {
            name: 'Example Token',
            symbol: 'EXT',
            supply: '1,000,000,000',
            holders: Math.floor(1000 + Math.random() * 50000),
            liquidity: (Math.random() * 10).toFixed(1) + 'M',
            mcap: (Math.random() * 100).toFixed(0) + 'M',
            isHoneypot: false,
            ownershipRenounced: Math.random() > 0.3,
            liquidityLocked: Math.random() > 0.2,
            buyTax: Math.floor(Math.random() * 10)
        };

        document.getElementById('scanner-name').textContent = mockData.name;
        document.getElementById('scanner-symbol').textContent = mockData.symbol;
        document.getElementById('scanner-supply').textContent = mockData.supply;
        document.getElementById('scanner-holders').textContent = mockData.holders.toLocaleString();
        document.getElementById('scanner-liquidity').textContent = '$' + mockData.liquidity;
        document.getElementById('scanner-mcap').textContent = '$' + mockData.mcap;

        // Update safety checks
        const checks = [
            { id: 'check-honeypot', pass: !mockData.isHoneypot, text: mockData.isHoneypot ? 'HONEYPOT DETECTED!' : 'Not a Honeypot' },
            { id: 'check-ownership', pass: mockData.ownershipRenounced, text: mockData.ownershipRenounced ? 'Ownership Renounced' : 'Owner Active' },
            { id: 'check-liquidity', pass: mockData.liquidityLocked, text: mockData.liquidityLocked ? 'Liquidity Locked' : 'Liquidity Not Locked' },
            { id: 'check-tax', pass: mockData.buyTax <= 5, warning: mockData.buyTax > 5 && mockData.buyTax <= 10, text: 'Buy Tax: ' + mockData.buyTax + '%' }
        ];

        checks.forEach(check => {
            const el = document.getElementById(check.id);
            if (el) {
                el.className = 'check-item ' + (check.pass ? 'pass' : (check.warning ? 'warning' : 'fail'));
                el.innerHTML = `<span>${check.pass ? '✓' : (check.warning ? '⚠' : '✗')}</span> ${check.text}`;
            }
        });

        // Update safety badge
        const safetyEl = document.getElementById('scanner-safety');
        const isSafe = !mockData.isHoneypot && mockData.buyTax <= 10;
        const isWarning = mockData.buyTax > 5 || !mockData.liquidityLocked;

        safetyEl.innerHTML = `<span class="safety-badge ${isSafe ? (isWarning ? 'warning' : 'safe') : 'danger'}">${
            isSafe ? (isWarning ? '⚠ Caution' : '✓ Safe') : '✗ Danger'
        }</span>`;
    },

    /**
     * Add Price Alert
     */
    addAlert() {
        const token = document.getElementById('alert-token').value;
        const condition = document.getElementById('alert-condition').value;
        const price = parseFloat(document.getElementById('alert-price').value);

        if (!price) {
            alert('Please enter a target price');
            return;
        }

        const alert = {
            id: Date.now(),
            token,
            condition,
            price,
            created: new Date().toISOString()
        };

        this.state.alerts.push(alert);
        this.saveAlerts();
        this.renderAlerts();

        document.getElementById('alert-price').value = '';
    },

    /**
     * Remove Price Alert
     */
    removeAlert(id) {
        this.state.alerts = this.state.alerts.filter(a => a.id !== id);
        this.saveAlerts();
        this.renderAlerts();
    },

    /**
     * Render Alerts
     */
    renderAlerts() {
        const container = document.getElementById('alerts-list');
        if (!container) return;

        container.innerHTML = this.state.alerts.map(alert => `
            <div class="alert-item">
                <span class="alert-info">${alert.token} ${alert.condition === 'above' ? '>' : '<'} ${this.formatCurrency(alert.price)}</span>
                <button class="alert-remove" onclick="ObeliskTools.removeAlert(${alert.id})">×</button>
            </div>
        `).join('');
    },

    /**
     * Save Alerts to localStorage
     */
    saveAlerts() {
        localStorage.setItem('obelisk_alerts', JSON.stringify(this.state.alerts));
    },

    /**
     * Load Alerts from localStorage
     */
    loadAlerts() {
        try {
            const saved = localStorage.getItem('obelisk_alerts');
            if (saved) {
                this.state.alerts = JSON.parse(saved);
                this.renderAlerts();
            }
        } catch (e) {
            console.error('Failed to load alerts:', e);
        }
    },

    /**
     * Refresh Whale Tracker
     */
    async refreshWhales() {
        const feed = document.getElementById('whale-feed');
        if (!feed) return;

        // Simulated whale data
        const whales = [
            { action: `${Math.floor(100 + Math.random() * 900)} BTC moved`, value: (Math.random() * 100).toFixed(1) + 'M', route: 'Binance → Unknown', time: Math.floor(Math.random() * 30) + 'm ago' },
            { action: `${Math.floor(1000 + Math.random() * 19000)} ETH bought`, value: (Math.random() * 50).toFixed(1) + 'M', route: 'via Uniswap', time: Math.floor(Math.random() * 60) + 'm ago' },
            { action: `${Math.floor(100000 + Math.random() * 9900000)} USDC deposited`, value: (Math.random() * 10).toFixed(1) + 'M', route: '→ Aave', time: Math.floor(Math.random() * 120) + 'm ago' }
        ];

        feed.innerHTML = whales.map(w => `
            <div class="whale-tx">
                <span class="whale-icon">🐋</span>
                <div class="whale-details">
                    <span class="whale-action">${w.action}</span>
                    <span class="whale-value">$${w.value}</span>
                    <span class="whale-route">${w.route}</span>
                </div>
                <span class="whale-time">${w.time}</span>
            </div>
        `).join('');
    },

    /**
     * Calculate Portfolio Rebalance
     */
    calculateRebalance() {
        const total = parseFloat(document.getElementById('rb-total').value) || 0;

        const assets = ['btc', 'eth', 'sol', 'usdc'];
        const targets = {};
        const currents = { btc: 48, eth: 35, sol: 12, usdc: 5 }; // Simulated current allocations

        assets.forEach(asset => {
            targets[asset] = parseFloat(document.getElementById(`rb-${asset}-target`).value) || 0;
        });

        // Calculate trades
        const trades = [];
        assets.forEach(asset => {
            const currentValue = total * (currents[asset] / 100);
            const targetValue = total * (targets[asset] / 100);
            const diff = targetValue - currentValue;

            if (Math.abs(diff) > 1) {
                trades.push({
                    asset: asset.toUpperCase(),
                    action: diff > 0 ? 'Buy' : 'Sell',
                    amount: Math.abs(diff)
                });
            }
        });

        // Render result
        const result = document.getElementById('rb-result');
        result.innerHTML = trades.map(t => `
            <div class="rebalance-trade ${t.action.toLowerCase()}">${t.action} ${this.formatCurrency(t.amount)} ${t.asset}</div>
        `).join('') || '<div style="color: var(--text-muted); text-align: center;">Portfolio is balanced</div>';
    },

    /**
     * Show Tool Error
     */
    showToolError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 16px;">${message}</div>`;
        }
    },

    /**
     * Format Currency
     */
    formatCurrency(value) {
        return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ObeliskTools.init();
});

// Export
window.ObeliskTools = ObeliskTools;
