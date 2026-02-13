/**
 * OBELISK DEX - Price Interval Control
 * Permet de changer l'intervalle de rafraichissement des prix
 */

const PriceIntervalControl = {
    intervals: [
        { ms: 100, label: '100ms', desc: 'Ultra rapide' },
        { ms: 500, label: '500ms', desc: 'Rapide' },
        { ms: 1000, label: '1s', desc: 'Normal' },
        { ms: 5000, label: '5s', desc: 'Economique' },
        { ms: 10000, label: '10s', desc: 'Lent' }
    ],

    currentInterval: 500,
    loopId: null,

    init() {
        this.createUI();
        console.log('⏱️ Price Interval Control loaded');
    },

    createUI() {
        const btn = document.createElement('button');
        btn.id = 'price-interval-btn';
        btn.innerHTML = '⏱️ 500ms';
        btn.onclick = () => this.showSelector();
        btn.style.cssText = `
            position: fixed;
            top: 80px;
            left: 20px;
            background: rgba(0,0,0,0.8);
            border: 1px solid #333;
            color: #00ff88;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            z-index: 8000;
        `;
        document.body.appendChild(btn);
    },

    showSelector() {
        let modal = document.getElementById('interval-modal');
        if (modal) { modal.remove(); return; }

        modal = document.createElement('div');
        modal.id = 'interval-modal';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid #00ff88;border-radius:12px;padding:16px;min-width:200px;">
                <h3 style="margin:0 0 12px;color:#00ff88;font-size:14px;">⏱️ Intervalle Prix</h3>
                ${this.intervals.map(i => `
                    <button class="int-opt ${i.ms === this.currentInterval ? 'active' : ''}" 
                            onclick="PriceIntervalControl.setInterval(${i.ms})"
                            style="display:block;width:100%;padding:10px;margin:4px 0;
                                   background:${i.ms === this.currentInterval ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)'};
                                   border:1px solid ${i.ms === this.currentInterval ? '#00ff88' : '#333'};
                                   border-radius:8px;color:#fff;cursor:pointer;text-align:left;">
                        <span style="font-weight:bold;">${i.label}</span>
                        <span style="color:#888;font-size:11px;margin-left:8px;">${i.desc}</span>
                    </button>
                `).join('')}
                <button onclick="document.getElementById('interval-modal').remove()" 
                        style="margin-top:12px;padding:8px;width:100%;background:#333;border:none;border-radius:6px;color:#888;cursor:pointer;">
                    Fermer
                </button>
            </div>
        `;
        modal.style.cssText = `
            position:fixed;top:120px;left:20px;z-index:300;
        `;
        document.body.appendChild(modal);
    },

    setInterval(ms) {
        this.currentInterval = ms;
        
        // Update RealtimePrices if exists
        if (typeof RealtimePrices !== 'undefined') {
            RealtimePrices.config.updateInterval = ms;
            if (RealtimePrices.priceLoopId) {
                clearInterval(RealtimePrices.priceLoopId);
            }
            RealtimePrices.priceLoopId = setInterval(() => RealtimePrices.fetchPrices(), ms);
        }

        // Update button
        const btn = document.getElementById('price-interval-btn');
        if (btn) btn.innerHTML = '⏱️ ' + this.intervals.find(i => i.ms === ms)?.label;

        // Close modal
        document.getElementById('interval-modal')?.remove();

        // Notification
        if (typeof showNotification === 'function') {
            showNotification('Intervalle: ' + ms + 'ms', 'info');
        }

        console.log('⏱️ Price interval set to', ms, 'ms');
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PriceIntervalControl.init());
} else {
    setTimeout(() => PriceIntervalControl.init(), 500);
}

window.PriceIntervalControl = PriceIntervalControl;
