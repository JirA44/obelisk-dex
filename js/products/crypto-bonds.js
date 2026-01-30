/**
 * CRYPTO BONDS MODULE - Obelisk DEX
 * Tokenized bonds with fixed coupon payments
 */
const CryptoBondsModule = {
    items: [
        { id: 'treasury-6m', name: 'DeFi Treasury 6M', issuer: 'Obelisk DAO', couponRate: 6.5, maturityMonths: 6, faceValue: 1000, minBuy: 1, rating: 'AAA', paymentFreq: 'monthly' },
        { id: 'treasury-12m', name: 'DeFi Treasury 12M', issuer: 'Obelisk DAO', couponRate: 8.0, maturityMonths: 12, faceValue: 1000, minBuy: 1, rating: 'AAA', paymentFreq: 'monthly' },
        { id: 'protocol-bond', name: 'Protocol Revenue Bond', issuer: 'Multi-Protocol', couponRate: 12.5, maturityMonths: 12, faceValue: 500, minBuy: 2, rating: 'AA', paymentFreq: 'quarterly' },
        { id: 'lp-bond', name: 'LP Incentive Bond', issuer: 'DEX Alliance', couponRate: 15.0, maturityMonths: 6, faceValue: 250, minBuy: 4, rating: 'A', paymentFreq: 'monthly' },
        { id: 'staking-bond', name: 'Validator Staking Bond', issuer: 'Validator Network', couponRate: 10.0, maturityMonths: 24, faceValue: 2000, minBuy: 1, rating: 'AA', paymentFreq: 'quarterly' },
        { id: 'rwa-bond', name: 'Real Estate RWA Bond', issuer: 'RWA Holdings', couponRate: 7.5, maturityMonths: 36, faceValue: 5000, minBuy: 1, rating: 'BBB', paymentFreq: 'monthly' },
        { id: 'corp-bond', name: 'DeFi Corporate Bond', issuer: 'DeFi Corp', couponRate: 18.0, maturityMonths: 6, faceValue: 100, minBuy: 10, rating: 'BB', paymentFreq: 'monthly' },
        { id: 'infra-bond', name: 'Infrastructure Bond', issuer: 'Chain Builders', couponRate: 9.5, maturityMonths: 18, faceValue: 1000, minBuy: 1, rating: 'A', paymentFreq: 'quarterly' }
    ],
    positions: [],

    init() {
        this.load();
        console.log('Crypto Bonds Module initialized');
    },

    load() {
        this.positions = SafeOps.getStorage('obelisk_crypto_bonds', []);
    },

    save() {
        SafeOps.setStorage('obelisk_crypto_bonds', this.positions);
    },

    invest(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, error: 'Bond not found' };
        if (quantity < item.minBuy) return { success: false, error: 'Min purchase: ' + item.minBuy + ' bonds' };

        const totalCost = quantity * item.faceValue;
        const monthlyPayments = item.paymentFreq === 'monthly' ? item.maturityMonths : Math.floor(item.maturityMonths / 3);
        const couponPerPayment = (item.faceValue * (item.couponRate / 100) / 12) * (item.paymentFreq === 'monthly' ? 1 : 3) * quantity;
        const totalCoupons = couponPerPayment * monthlyPayments;
        const maturityDate = Date.now() + (item.maturityMonths * 30 * 86400000);

        const position = {
            id: 'bond-' + Date.now(),
            itemId,
            bondName: item.name,
            issuer: item.issuer,
            quantity,
            faceValue: item.faceValue,
            totalInvested: totalCost,
            couponRate: item.couponRate,
            paymentFreq: item.paymentFreq,
            couponPerPayment,
            totalExpectedCoupons: totalCoupons,
            rating: item.rating,
            purchaseDate: Date.now(),
            maturityDate,
            maturityMonths: item.maturityMonths,
            couponsReceived: 0,
            lastCouponDate: Date.now(),
            status: 'active'
        };

        this.positions.push(position);
        this.save();

        if (typeof SimulatedPortfolio !== 'undefined') {
            SimulatedPortfolio.invest(position.id, item.name, totalCost, item.couponRate, 'bond', false);
        }

        return { success: true, position, totalCost, monthlyPayments, couponPerPayment: couponPerPayment.toFixed(2) };
    },

    withdraw(posId) {
        const idx = this.positions.findIndex(p => p.id === posId);
        if (idx === -1) return { success: false, error: 'Bond not found' };

        const pos = this.positions[idx];
        const now = Date.now();
        const isMatured = now >= pos.maturityDate;

        let returnAmount;
        if (isMatured) {
            // Return face value + any unclaimed coupons
            returnAmount = pos.totalInvested + (pos.totalExpectedCoupons - pos.couponsReceived);
        } else {
            // Early sale - discount based on remaining time and rating
            const ratingDiscount = { AAA: 0.02, AA: 0.03, A: 0.05, BBB: 0.08, BB: 0.12 };
            const discount = ratingDiscount[pos.rating] || 0.1;
            const timeRemaining = (pos.maturityDate - now) / (pos.maturityMonths * 30 * 86400000);
            const marketDiscount = discount * timeRemaining;
            returnAmount = pos.totalInvested * (1 - marketDiscount);
        }

        this.positions.splice(idx, 1);
        this.save();

        return { success: true, amount: returnAmount.toFixed(2), isMatured, couponsReceived: pos.couponsReceived.toFixed(2) };
    },

    claimCoupons(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return { success: false, error: 'Bond not found' };

        const now = Date.now();
        const paymentInterval = pos.paymentFreq === 'monthly' ? 30 * 86400000 : 90 * 86400000;
        const paymentsSinceLastClaim = Math.floor((now - pos.lastCouponDate) / paymentInterval);

        if (paymentsSinceLastClaim < 1) {
            const nextPayment = new Date(pos.lastCouponDate + paymentInterval);
            return { success: false, error: 'Next coupon: ' + nextPayment.toLocaleDateString() };
        }

        const couponsToClaim = pos.couponPerPayment * paymentsSinceLastClaim;
        pos.couponsReceived += couponsToClaim;
        pos.lastCouponDate = now;
        this.save();

        return { success: true, claimed: couponsToClaim.toFixed(2), payments: paymentsSinceLastClaim };
    },

    getBondStatus(posId) {
        const pos = this.positions.find(p => p.id === posId);
        if (!pos) return null;

        const now = Date.now();
        const daysHeld = (now - pos.purchaseDate) / 86400000;
        const daysRemaining = Math.max(0, Math.ceil((pos.maturityDate - now) / 86400000));
        const progress = Math.min(100, (daysHeld / (pos.maturityMonths * 30)) * 100);
        const paymentInterval = pos.paymentFreq === 'monthly' ? 30 * 86400000 : 90 * 86400000;
        const nextCouponDate = new Date(pos.lastCouponDate + paymentInterval);
        const pendingCoupons = Math.floor((now - pos.lastCouponDate) / paymentInterval) * pos.couponPerPayment;

        return {
            daysRemaining,
            progress: progress.toFixed(1),
            couponsReceived: pos.couponsReceived.toFixed(2),
            pendingCoupons: pendingCoupons.toFixed(2),
            nextCouponDate: nextCouponDate.toLocaleDateString(),
            isMatured: now >= pos.maturityDate,
            currentYield: ((pos.couponsReceived / pos.totalInvested) * 100).toFixed(2)
        };
    },

    getRatingColor(rating) {
        const colors = { AAA: '#00ff88', AA: '#88ff00', A: '#ffff00', BBB: '#ff8800', BB: '#ff4400' };
        return colors[rating] || '#888';
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = '<h3 style="color:#00ff88;margin-bottom:16px;">Crypto Bonds Market</h3>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">' +
            this.items.map(item =>
                '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:start;">' +
                '<strong>' + item.name + '</strong>' +
                '<span style="background:' + this.getRatingColor(item.rating) + ';color:#000;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold;">' + item.rating + '</span>' +
                '</div>' +
                '<div style="color:#888;font-size:12px;margin:4px 0;">Issuer: ' + item.issuer + '</div>' +
                '<div style="color:#00ff88;font-size:24px;margin:8px 0;">' + item.couponRate + '% <span style="font-size:12px;color:#888;">coupon</span></div>' +
                '<span style="color:#888;">Face Value:</span> $' + item.faceValue + '<br>' +
                '<span style="color:#888;">Maturity:</span> ' + item.maturityMonths + ' months<br>' +
                '<span style="color:#888;">Payment:</span> ' + item.paymentFreq + '<br>' +
                '<span style="color:#888;">Min Buy:</span> ' + item.minBuy + ' bond(s)<br>' +
                '<button onclick="CryptoBondsModule.quickInvest(\'' + item.id + '\')" style="margin-top:10px;padding:8px 16px;background:#00ff88;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;width:100%;">Buy Bonds</button>' +
                '</div>'
            ).join('') +
            '</div>' +
            (this.positions.length > 0 ? this.renderPositions() : '');
    },

    renderPositions() {
        return '<h4 style="color:#00ff88;margin:24px 0 12px;">Your Bond Holdings (' + this.positions.length + ')</h4>' +
            '<div style="display:grid;gap:8px;">' +
            this.positions.map(pos => {
                const status = this.getBondStatus(pos.id);
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<div>' +
                    '<strong>' + pos.bondName + '</strong> ' +
                    '<span style="background:' + this.getRatingColor(pos.rating) + ';color:#000;padding:1px 6px;border-radius:3px;font-size:10px;">' + pos.rating + '</span><br>' +
                    '<span style="color:#888;font-size:12px;">' + pos.quantity + ' bonds @ $' + pos.faceValue + ' = $' + pos.totalInvested + '</span>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                    '<span style="color:' + (status.isMatured ? '#00ff88' : '#ffaa00') + ';">' + (status.isMatured ? 'MATURED' : status.daysRemaining + ' days left') + '</span><br>' +
                    '<span style="color:#888;font-size:12px;">Yield: ' + status.currentYield + '%</span>' +
                    '</div></div>' +
                    '<div style="margin-top:8px;background:rgba(255,255,255,0.1);border-radius:4px;height:6px;">' +
                    '<div style="background:#00ff88;height:100%;border-radius:4px;width:' + status.progress + '%;"></div></div>' +
                    '<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">' +
                    '<span style="color:#888;font-size:12px;">Coupons received: $' + status.couponsReceived + ' | Pending: $' + status.pendingCoupons + '</span>' +
                    '<div style="display:flex;gap:6px;">' +
                    '<button onclick="CryptoBondsModule.quickClaim(\'' + pos.id + '\')" style="padding:4px 10px;background:#00aaff;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">Claim</button>' +
                    '<button onclick="CryptoBondsModule.quickSell(\'' + pos.id + '\')" style="padding:4px 10px;background:#ff4466;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;">Sell</button>' +
                    '</div></div></div>';
            }).join('') +
            '</div>';
    },

    quickInvest(itemId) {
        const item = this.items.find(i => i.id === itemId);
        const quantity = SafeOps.promptNumber('Number of bonds to buy (min ' + item.minBuy + ', $' + item.faceValue + ' each):', item.minBuy, item.minBuy);
        if (!quantity) return;

        const result = this.invest(itemId, quantity);
        alert(result.success ? 'Purchased ' + quantity + ' bonds for $' + result.totalCost + '! Coupon per payment: $' + result.couponPerPayment : result.error);
        if (result.success) this.render('crypto-bonds-container');
    },

    quickClaim(posId) {
        const result = this.claimCoupons(posId);
        alert(result.success ? 'Claimed $' + result.claimed + ' (' + result.payments + ' payments)' : result.error);
        if (result.success) this.render('crypto-bonds-container');
    },

    quickSell(posId) {
        const pos = this.positions.find(p => p.id === posId);
        const status = this.getBondStatus(posId);
        if (!status.isMatured && !confirm('Selling before maturity will result in a discount. Continue?')) return;

        const result = this.withdraw(posId);
        alert(result.success ? 'Sold for $' + result.amount + (result.isMatured ? ' (matured)' : ' (early sale)') : result.error);
        this.render('crypto-bonds-container');
    }
};

document.addEventListener('DOMContentLoaded', () => CryptoBondsModule.init());
