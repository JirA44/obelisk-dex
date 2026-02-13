/* ============================================
   MULTI-SIG MANAGER - Multi-signature wallets
   ============================================ */

const MultiSigManager = {
    vaults: [],
    pendingTxs: [],

    init() {
        try { this.vaults = JSON.parse(localStorage.getItem('obelisk_multisig_vaults') || '[]'); } catch(e) { this.vaults = []; }
        if (this.vaults.length === 0) {
            this.vaults = [
                { id: 'v1', name: 'Operations Wallet', threshold: '2/3', signers: ['0x377...140', '0xA8c...b21', '0x5eF...d03'], balance: 125000, chain: 'Arbitrum' },
                { id: 'v2', name: 'Treasury Reserve', threshold: '3/5', signers: ['0x377...140', '0xA8c...b21', '0x5eF...d03', '0xB0B...a91', '0x7F2...c33'], balance: 850000, chain: 'Ethereum' },
                { id: 'v3', name: 'Investment Fund', threshold: '2/3', signers: ['0x377...140', '0xB0B...a91', '0x9aD...b72'], balance: 340000, chain: 'Arbitrum' }
            ];
        }
        this.generatePendingTxs();
    },

    save() { localStorage.setItem('obelisk_multisig_vaults', JSON.stringify(this.vaults)); },

    generatePendingTxs() {
        this.pendingTxs = [
            { id: 'tx1', vault: 'v1', type: 'Transfer', to: '0xDef...789', amount: '$15,000 USDC', signatures: 1, required: 2, status: 'pending', created: '2h ago', creator: '0x377...140' },
            { id: 'tx2', vault: 'v2', type: 'DeFi Deposit', to: 'Aave V3', amount: '$50,000 USDC', signatures: 2, required: 3, status: 'pending', created: '5h ago', creator: '0xA8c...b21' },
            { id: 'tx3', vault: 'v1', type: 'Swap', to: 'ETH → USDC', amount: '10 ETH ($34,000)', signatures: 0, required: 2, status: 'pending', created: '12h ago', creator: '0x5eF...d03' },
            { id: 'tx4', vault: 'v3', type: 'Transfer', to: '0xAbc...123', amount: '$100,000 USDC', signatures: 1, required: 2, status: 'pending', created: '1d ago', creator: '0x377...140' }
        ];
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var self = this;
        var totalBalance = this.vaults.reduce(function(s, v) { return s + v.balance; }, 0);

        var html = '<div class="sol-stats-row">' +
            '<div class="sol-stat-card"><div class="sol-stat-value green">$' + totalBalance.toLocaleString() + '</div><div class="sol-stat-label">Total Secured</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value cyan">' + this.vaults.length + '</div><div class="sol-stat-label">Active Vaults</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value" style="color:#c9a227">' + this.pendingTxs.length + '</div><div class="sol-stat-label">Pending Txs</div></div>' +
            '<div class="sol-stat-card"><div class="sol-stat-value">' + this.vaults.reduce(function(s, v) { return s + v.signers.length; }, 0) + '</div><div class="sol-stat-label">Total Signers</div></div></div>';

        html += '<div class="sol-section"><div class="sol-section-title">🔐 Multi-Sig Vaults</div>';
        this.vaults.forEach(function(v) {
            html += '<div style="padding:16px;border:1px solid #1a1a1a;border-radius:12px;margin-bottom:12px">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
                '<div><strong style="color:#fff;font-size:15px">' + v.name + '</strong>' +
                '<div style="font-size:11px;color:#555">' + v.chain + '</div></div>' +
                '<span class="sol-tag sol-tag-blue">' + v.threshold + ' Threshold</span></div>' +
                '<div class="sol-stats-row" style="margin-bottom:8px">' +
                '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value green" style="font-size:16px">$' + v.balance.toLocaleString() + '</div><div class="sol-stat-label">Balance</div></div>' +
                '<div class="sol-stat-card" style="padding:8px"><div class="sol-stat-value" style="font-size:16px">' + v.signers.length + '</div><div class="sol-stat-label">Signers</div></div></div>' +
                '<div style="display:flex;gap:4px;flex-wrap:wrap">';
            v.signers.forEach(function(s) {
                html += '<span style="font-size:11px;padding:2px 8px;background:#111;border-radius:4px;color:#888;font-family:monospace">' + s + '</span>';
            });
            html += '</div></div>';
        });
        html += '</div>';

        html += '<div class="sol-section"><div class="sol-section-title">⏳ Pending Transactions</div>' +
            '<table class="sol-table"><thead><tr><th>Type</th><th>Amount</th><th>To</th><th>Signatures</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        this.pendingTxs.forEach(function(tx) {
            var pct = (tx.signatures / tx.required * 100).toFixed(0);
            var ready = tx.signatures >= tx.required;
            html += '<tr><td><strong>' + tx.type + '</strong><div style="font-size:10px;color:#555">' + tx.created + '</div></td>' +
                '<td style="font-family:monospace">' + tx.amount + '</td>' +
                '<td style="color:#888;font-size:12px">' + tx.to + '</td>' +
                '<td><div style="display:flex;align-items:center;gap:8px"><span style="font-family:monospace;color:' + (ready ? '#00ff88' : '#c9a227') + '">' + tx.signatures + '/' + tx.required + '</span>' +
                '<div class="sol-progress" style="width:60px;height:4px"><div class="sol-progress-fill" style="width:' + pct + '%;background:' + (ready ? '#00ff88' : '#c9a227') + '"></div></div></div></td>' +
                '<td><span class="sol-tag ' + (ready ? 'sol-tag-green' : 'sol-tag-yellow') + '">' + (ready ? 'Ready' : 'Pending') + '</span></td>' +
                '<td><button class="sol-btn sol-btn-sm ' + (ready ? 'sol-btn-primary' : 'sol-btn-outline') + ' ms-sign" data-id="' + tx.id + '">' + (ready ? 'Execute' : 'Sign') + '</button></td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="sol-section"><div class="sol-section-title">➕ New Transaction</div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Vault</label>' +
            '<select class="sol-select sol-input" id="ms-vault">';
        this.vaults.forEach(function(v) { html += '<option value="' + v.id + '">' + v.name + '</option>'; });
        html += '</select></div><div class="sol-form-group"><label class="sol-label">Type</label>' +
            '<select class="sol-select sol-input" id="ms-type"><option>Transfer</option><option>Swap</option><option>DeFi Deposit</option><option>DeFi Withdraw</option></select></div></div>' +
            '<div class="sol-form-row"><div class="sol-form-group"><label class="sol-label">Recipient</label><input class="sol-input" id="ms-to" placeholder="0x... or protocol name"></div>' +
            '<div class="sol-form-group"><label class="sol-label">Amount</label><input class="sol-input" id="ms-amount" placeholder="e.g. 10000 USDC"></div></div>' +
            '<button class="sol-btn sol-btn-primary" id="ms-create" style="margin-top:8px">Create Transaction</button></div>';

        c.innerHTML = html;
        c.querySelectorAll('.ms-sign').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Transaction signed successfully');
            });
        });
        var createBtn = c.querySelector('#ms-create');
        if (createBtn) createBtn.addEventListener('click', function() {
            if (typeof ObeliskToast !== 'undefined') ObeliskToast.success('Transaction created - awaiting signatures');
        });
    }
};

SolutionsHub.registerSolution('multi-sig', MultiSigManager, 'business', {
    icon: '🔐', name: 'Multi-Sig Manager', description: 'Manage multi-signature wallets with threshold approvals and transaction queues'
});
