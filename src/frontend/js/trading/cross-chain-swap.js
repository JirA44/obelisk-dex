const CrossChainSwap = {
    // Supported chains
    chains: {
        42161: { name: 'Arbitrum', icon: '🔵', color: '#2D374B' },
        10: { name: 'Optimism', icon: '🔴', color: '#FF0420' },
        8453: { name: 'Base', icon: '🔷', color: '#0052FF' },
        1: { name: 'Ethereum', icon: '⟠', color: '#627EEA' },
        137: { name: 'Polygon', icon: '🟣', color: '#8247E5' }
    },

    // Common tokens per chain (symbol → address)
    tokens: {
        42161: {
            USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            ARB: '0x912CE59144191C1204E64559FE8253a0e49E6548'
        },
        10: {
            USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
            WETH: '0x4200000000000000000000000000000000000006',
            OP: '0x4200000000000000000000000000000000000042'
        },
        8453: {
            USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            WETH: '0x4200000000000000000000000000000000000006'
        },
        1: {
            USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
        },
        137: {
            USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
            WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
        }
    },

    // State
    sourceChain: 42161,
    destChain: 10,
    sourceToken: 'USDC',
    destToken: 'USDC',
    amount: '',
    quote: null,
    isLoading: false,

    init() {
        console.log('[CrossChainSwap] Initialized');
    },

    // Get quote from LI.FI API
    async getQuote(fromChain, toChain, fromToken, toToken, amount, userAddress) {
        const fromTokenAddr = this.tokens[fromChain]?.[fromToken];
        const toTokenAddr = this.tokens[toChain]?.[toToken];
        if (!fromTokenAddr || !toTokenAddr) return null;

        // LI.FI quote endpoint
        const params = new URLSearchParams({
            fromChain: fromChain.toString(),
            toChain: toChain.toString(),
            fromToken: fromTokenAddr,
            toToken: toTokenAddr,
            fromAmount: this.toWei(amount, fromToken === 'USDC' ? 6 : 18),
            fromAddress: userAddress || '0x0000000000000000000000000000000000000000'
        });

        try {
            this.isLoading = true;
            const res = await fetch(`https://li.quest/v1/quote?${params}`);
            if (!res.ok) throw new Error('Quote failed');
            this.quote = await res.json();
            return this.quote;
        } catch(e) {
            console.error('[CrossChainSwap] Quote error:', e);
            // Fallback: estimate based on amount (1:1 for stablecoins, market rate for others)
            return this.estimateQuote(fromChain, toChain, fromToken, toToken, amount);
        } finally {
            this.isLoading = false;
        }
    },

    estimateQuote(fromChain, toChain, fromToken, toToken, amount) {
        // Simple estimation for when API is unavailable
        const slippage = 0.003; // 0.3%
        const bridgeFee = fromChain !== toChain ? 0.5 : 0; // $0.50 bridge fee
        const outputAmount = (parseFloat(amount) - bridgeFee) * (1 - slippage);
        return {
            estimate: {
                toAmount: this.toWei(outputAmount, toToken === 'USDC' ? 6 : 18),
                toAmountMin: this.toWei(outputAmount * 0.995, toToken === 'USDC' ? 6 : 18),
                approvalAddress: '0x0000000000000000000000000000000000000000',
                executionDuration: 120,
                gasCosts: [{ amountUSD: '0.50' }]
            },
            action: { fromChainId: fromChain, toChainId: toChain },
            isEstimate: true
        };
    },

    // Execute swap via LI.FI
    async executeSwap(quote, signer) {
        if (!quote || !signer) return null;

        // If real quote with transactionRequest
        if (quote.transactionRequest) {
            const tx = await signer.sendTransaction(quote.transactionRequest);
            return { hash: tx.hash, status: 'pending' };
        }

        // Simulated execution
        return { hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join(''), status: 'simulated' };
    },

    // Check swap status
    async checkStatus(txHash, fromChain, toChain) {
        try {
            const res = await fetch(`https://li.quest/v1/status?txHash=${txHash}&bridge=any&fromChain=${fromChain}&toChain=${toChain}`);
            return await res.json();
        } catch(e) {
            return { status: 'UNKNOWN' };
        }
    },

    toWei(amount, decimals) { return (parseFloat(amount) * Math.pow(10, decimals)).toFixed(0); },
    fromWei(amount, decimals) { return parseFloat(amount) / Math.pow(10, decimals); },

    // Render swap UI
    renderSwapUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
        <div class="cross-chain-swap" style="background:#161b22;border-radius:12px;padding:24px;max-width:480px;margin:0 auto;">
            <h3 style="color:#00ff88;margin-bottom:16px;">Cross-Chain Swap</h3>

            <!-- Source chain/token -->
            <div style="background:#0d1117;border-radius:8px;padding:16px;margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <label style="color:#8b949e;font-size:12px;">From</label>
                    <select id="cc-source-chain" onchange="CrossChainSwap.updateSource()" style="background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:6px;padding:4px 8px;">
                        ${Object.entries(this.chains).map(([id,c]) => `<option value="${id}" ${id==this.sourceChain?'selected':''}>${c.icon} ${c.name}</option>`).join('')}
                    </select>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input id="cc-amount" type="number" placeholder="0.0" value="${this.amount}"
                        oninput="CrossChainSwap.amount=this.value"
                        style="flex:1;background:transparent;border:none;color:#c9d1d9;font-size:24px;outline:none;"/>
                    <select id="cc-source-token" style="background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:6px;padding:8px;">
                        ${this.getTokenOptions(this.sourceChain)}
                    </select>
                </div>
            </div>

            <!-- Swap direction arrow -->
            <div style="text-align:center;margin:4px 0;">
                <button onclick="CrossChainSwap.flipChains()" style="background:#21262d;border:1px solid #30363d;color:#00ff88;padding:8px;border-radius:50%;cursor:pointer;font-size:18px;">↕</button>
            </div>

            <!-- Destination chain/token -->
            <div style="background:#0d1117;border-radius:8px;padding:16px;margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <label style="color:#8b949e;font-size:12px;">To</label>
                    <select id="cc-dest-chain" onchange="CrossChainSwap.updateDest()" style="background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:6px;padding:4px 8px;">
                        ${Object.entries(this.chains).map(([id,c]) => `<option value="${id}" ${id==this.destChain?'selected':''}>${c.icon} ${c.name}</option>`).join('')}
                    </select>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <div id="cc-output" style="flex:1;color:#c9d1d9;font-size:24px;">—</div>
                    <select id="cc-dest-token" style="background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:6px;padding:8px;">
                        ${this.getTokenOptions(this.destChain)}
                    </select>
                </div>
            </div>

            <!-- Quote info -->
            <div id="cc-quote-info" style="background:#0d1117;border-radius:8px;padding:12px;margin-bottom:16px;display:none;font-size:13px;color:#8b949e;">
            </div>

            <!-- Action buttons -->
            <button id="cc-quote-btn" onclick="CrossChainSwap.requestQuote()"
                style="width:100%;padding:14px;background:linear-gradient(135deg,#00ff88,#00aaff);color:#000;border:none;border-radius:8px;font-weight:700;font-size:16px;cursor:pointer;">
                Get Quote
            </button>
            <button id="cc-swap-btn" onclick="CrossChainSwap.doSwap()"
                style="width:100%;padding:14px;background:#238636;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:16px;cursor:pointer;margin-top:8px;display:none;">
                Swap
            </button>

            <!-- Status -->
            <div id="cc-status" style="margin-top:12px;text-align:center;color:#8b949e;font-size:13px;"></div>
        </div>`;
    },

    getTokenOptions(chainId) {
        const chainTokens = this.tokens[chainId] || {};
        return Object.keys(chainTokens).map(t => `<option value="${t}">${t}</option>`).join('');
    },

    updateSource() {
        this.sourceChain = parseInt(document.getElementById('cc-source-chain').value);
        document.getElementById('cc-source-token').innerHTML = this.getTokenOptions(this.sourceChain);
    },

    updateDest() {
        this.destChain = parseInt(document.getElementById('cc-dest-chain').value);
        document.getElementById('cc-dest-token').innerHTML = this.getTokenOptions(this.destChain);
    },

    flipChains() {
        [this.sourceChain, this.destChain] = [this.destChain, this.sourceChain];
        this.renderSwapUI(document.querySelector('.cross-chain-swap')?.parentElement?.id || 'cross-chain-section');
    },

    async requestQuote() {
        const btn = document.getElementById('cc-quote-btn');
        btn.textContent = 'Loading...';
        btn.disabled = true;

        const fromToken = document.getElementById('cc-source-token').value;
        const toToken = document.getElementById('cc-dest-token').value;
        const address = (typeof WalletConnect !== 'undefined' && WalletConnect.account) || undefined;

        const quote = await this.getQuote(this.sourceChain, this.destChain, fromToken, toToken, this.amount, address);

        btn.textContent = 'Get Quote';
        btn.disabled = false;

        if (quote && quote.estimate) {
            const toDecimals = toToken === 'USDC' ? 6 : 18;
            const outputAmt = this.fromWei(quote.estimate.toAmount, toDecimals);
            document.getElementById('cc-output').textContent = outputAmt.toFixed(toDecimals === 6 ? 2 : 6);

            const infoEl = document.getElementById('cc-quote-info');
            infoEl.style.display = 'block';
            infoEl.innerHTML = `
                <div>Estimated time: ~${quote.estimate.executionDuration || 120}s</div>
                <div>Gas cost: ~$${quote.estimate.gasCosts?.[0]?.amountUSD || '0.50'}</div>
                ${quote.isEstimate ? '<div style="color:#ffd700;">⚠ Estimated (API unavailable)</div>' : ''}
            `;

            document.getElementById('cc-swap-btn').style.display = 'block';
        }
    },

    async doSwap() {
        const statusEl = document.getElementById('cc-status');
        statusEl.textContent = 'Initiating swap...';
        statusEl.style.color = '#ffd700';

        // Get signer if available
        let signer = null;
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
            } catch(e) {}
        }

        const result = await this.executeSwap(this.quote, signer);
        if (result) {
            statusEl.innerHTML = `✓ Swap ${result.status}: <a href="#" style="color:#00aaff;">${result.hash.substring(0,10)}...</a>`;
            statusEl.style.color = '#00ff88';
        } else {
            statusEl.textContent = '✗ Swap failed';
            statusEl.style.color = '#ff4444';
        }
    }
};

window.CrossChainSwap = CrossChainSwap;
