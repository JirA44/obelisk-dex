/**
 * MARGIN TRADING MODULE - Obelisk DEX
 * Leveraged trading with collateral management
 */
const MarginTradingModule = {
    items: [
        { id: 'btc-margin', asset: 'BTC', maxLeverage: 10, maintenanceMargin: 5, liquidationPenalty: 2.5, fundingRate: 0.01, minCollateral: 100 },
        { id: 'eth-margin', asset: 'ETH', maxLeverage: 10, maintenanceMargin: 5, liquidationPenalty: 2.5, fundingRate: 0.008, minCollateral: 50 },
        { id: 'sol-margin', asset: 'SOL', maxLeverage: 5, maintenanceMargin: 10, liquidationPenalty: 3, fundingRate: 0.015, minCollateral: 25 },
        { id: 'arb-margin', asset: 'ARB', maxLeverage: 5, maintenanceMargin: 10, liquidationPenalty: 3, fundingRate: 0.02, minCollateral: 25 },
        { id: 'avax-margin', asset: 'AVAX', maxLeverage: 5, maintenanceMargin: 10, liquidationPenalty: 3, fundingRate: 0.012, minCollateral: 25 },
        { id: 'link-margin', asset: 'LINK', maxLeverage: 3, maintenanceMargin: 15, liquidationPenalty: 5, fundingRate: 0.025, minCollateral: 20 }
    ],
    positions: [],

    init() {
        this.load();
        console.log('Margin Trading Module initialized');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_margin_trading', []);
    },

    save() {
        SafeOps.setStorage('obelisk_margin_trading', this.positions);
    },

    openPosition(itemId, collateral, leverage, side) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, error: 'Asset not found' };
        if (collateral < item.minCollateral) return { success: false, error: 'Min collateral: $' + item.minCollateral };
        if (leverage > item.maxLeverage) return { success: false, error: 'Max leverage: ' + item.maxLeverage + 'x' };
        if (leverage < 1) return { success: false, error: 'Min leverage: 1x' };
        if (side !== 'long' && side !== 'short') return { success: false, error: 'Side must be long or short' };

        const notionalValue = collateral * leverage;
        const entryPrice = this.getSimulatedPrice(item.asset);
        const liquidationPrice = side === 'long'
            ? entryPrice * (1 - (1 / leverage) + (item.maintenanceMargin / 100))
            : entryPrice * (1 + (1 / leverage) - (item.maintenanceMargin / 100));

        const position = {
            id: 'margin-' + Date.now(),
            itemId,
            asset: item.asset,
            collateral,
            leverage,
            side,
            notionalValue,
            entryPrice,
            liquidationPrice,
            fundingRate: item.fundingRate,
            openTime: Date.now(),
            unrealizedPnl: 0
        };

        this.positions.push(position);
        this.save();
        return { success: true, position };
    },

    closePosition(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false, error: 'Position not found' };

        const pos = this.positions[idx];
        const currentPrice = this.getSimulatedPrice(pos.asset);
        const priceDiff = currentPrice - pos.entryPrice;
        const pnlPercent = (priceDiff / pos.entryPrice) * (pos.side === 'long' ? 1 : -1);
        const pnl = pos.notionalValue * pnlPercent;

        // Calculate funding fees
        const hoursOpen = (Date.now() - pos.openTime) / 3600000;
        const fundingFees = pos.notionalValue * (pos.fundingRate / 100) * (hoursOpen / 8);

        const netPnl = pnl - fundingFees;
        const returnAmount = pos.collateral + netPnl;

        this.positions.splice(idx, 1);
        this.save();

        return { success: true, pnl: netPnl, returnAmount: Math.max(0, returnAmount), fundingFees };
    },

    addCollateral(posId, amount) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Position not found' };
        if (amount <= 0) return { success: false, error: 'Amount must be positive' };

        pos.collateral += amount;
        pos.leverage = pos.notionalValue / pos.collateral;

        // Recalculate liquidation price
        const item = this.items.find(i => i.id === pos.itemId);
        pos.liquidationPrice = pos.side === 'long'
            ? pos.entryPrice * (1 - (1 / pos.leverage) + (item.maintenanceMargin / 100))
            : pos.entryPrice * (1 + (1 / pos.leverage) - (item.maintenanceMargin / 100));

        this.save();
        return { success: true, newLeverage: pos.leverage.toFixed(2), newLiqPrice: pos.liquidationPrice.toFixed(2) };
    },

    getSimulatedPrice(asset) {
        const basePrices = { BTC: 95000, ETH: 3400, SOL: 180, ARB: 1.2, AVAX: 35, LINK: 22 };
        const base = basePrices[asset] || 100;
        const variation = (Math.random() - 0.5) * 0.02;
        return base * (1 + variation);
    },

    getPositionHealth(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const currentPrice = this.getSimulatedPrice(pos.asset);
        const priceDiff = currentPrice - pos.entryPrice;
        const pnlPercent = (priceDiff / pos.entryPrice) * (pos.side === 'long' ? 1 : -1);
        const unrealizedPnl = pos.notionalValue * pnlPercent;
        const equity = pos.collateral + unrealizedPnl;
        const marginRatio = (equity / pos.notionalValue) * 100;
        const item = this.items.find(i => i.id === pos.itemId);

        return {
            equity: equity.toFixed(2),
            marginRatio: marginRatio.toFixed(2),
            isHealthy: marginRatio > item.maintenanceMargin,
            distanceToLiq: Math.abs(((currentPrice - pos.liquidationPrice) / currentPrice) * 100).toFixed(2)
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Margin Trading</h3>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">' +
            this.items.map(item =>
                '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">' +
                '<strong style="font-size:18px;">' + item.asset + '</strong><br>' +
                '<span style="color:#888;">Max Leverage:</span> ' + item.maxLeverage + 'x<br>' +
                '<span style="color:#888;">Maint. Margin:</span> ' + item.maintenanceMargin + '%<br>' +
                '<span style="color:#888;">Funding Rate:</span> ' + item.fundingRate + '%/8h<br>' +
                '<span style="color:#888;">Min Collateral:</span> $' + item.minCollateral + '<br>' +
                '<div style="margin-top:10px;display:flex;gap:8px;">' +
                '<button onclick="MarginTradingModule.quickTrade(\'' + item.id + '\', \'long\')" style="flex:1;padding:8px 12px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">Long</button>' +
                '<button onclick="MarginTradingModule.quickTrade(\'' + item.id + '\', \'short\')" style="flex:1;padding:8px 12px;background:#ff4466;border:none;border-radius:8px;color:#fff;font-weight:bold;cursor:pointer;">Short</button>' +
                '</div></div>'
            ).join('') +
            '</div>' +
            (this.positions.length > 0 ? this.renderPositions() : '');
    },

    renderPositions() {
        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Open Positions</h4>' +
            '<div style="display:grid;gap:8px;">' +
            this.positions.map(pos => {
                const health = this.getPositionHealth(pos.id);
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;">' +
                    '<div><strong>' + pos.asset + ' ' + pos.side.toUpperCase() + ' ' + pos.leverage.toFixed(1) + 'x</strong><br>' +
                    '<span style="color:#888;font-size:12px;">Collateral: $' + pos.collateral.toFixed(2) + ' | Entry: $' + pos.entryPrice.toFixed(2) + '</span></div>' +
                    '<div style="text-align:right;"><span style="color:' + (health.isHealthy ? '#00ff88' : '#ff4466') + ';">Health: ' + health.marginRatio + '%</span><br>' +
                    '<button onclick="MarginTradingModule.closePosition(\'' + pos.id + '\');MarginTradingModule.render(\'margin-trading-container\');" style="padding:6px 12px;background:#ff4466;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">Close</button></div>' +
                    '</div>';
            }).join('') +
            '</div>';
    },

    quickTrade(itemId, side) {
        const item = this.items.find(i => i.id === itemId);
        const collateral = SafeOps.promptNumber('Collateral amount USD (min $' + item.minCollateral + '):', 0, item.minCollateral);
        if (!collateral) return;
        const leverage = SafeOps.promptNumber('Leverage (1-' + item.maxLeverage + 'x):', 1, 1, item.maxLeverage);
        if (!leverage) return;

        const result = this.openPosition(itemId, collateral, leverage, side);
        alert(result.success ? side.toUpperCase() + ' position opened! Notional: $' + result.position.notionalValue.toFixed(2) : result.error);
        if (result.success) this.render('margin-trading-container');
    },

    quickInvest(itemId) {
        this.quickTrade(itemId, 'long');
    }
};

document.addEventListener('DOMContentLoaded', () => MarginTradingModule.init());
