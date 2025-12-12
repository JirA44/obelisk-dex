/**
 * Obelisk DEX - Uniswap Integration
 *
 * Connects to Uniswap for spot token swaps.
 * All API calls go directly from client to Uniswap/0x (no proxy).
 */

const UniswapAPI = {
    // API endpoints
    UNISWAP_API: 'https://api.uniswap.org/v2',
    ZEROX_API: 'https://api.0x.org',

    // Supported chains
    CHAINS: {
        ETHEREUM: { id: 1, name: 'Ethereum', rpc: 'https://eth.llamarpc.com' },
        ARBITRUM: { id: 42161, name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc' },
        BASE: { id: 8453, name: 'Base', rpc: 'https://mainnet.base.org' },
        POLYGON: { id: 137, name: 'Polygon', rpc: 'https://polygon-rpc.com' }
    },

    // Common tokens
    TOKENS: {
        ETH: {
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            addresses: {
                1: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                42161: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
            }
        },
        WETH: {
            symbol: 'WETH',
            name: 'Wrapped Ether',
            decimals: 18,
            addresses: {
                1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
            }
        },
        USDC: {
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            addresses: {
                1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
            }
        },
        USDT: {
            symbol: 'USDT',
            name: 'Tether USD',
            decimals: 6,
            addresses: {
                1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
            }
        },
        WBTC: {
            symbol: 'WBTC',
            name: 'Wrapped Bitcoin',
            decimals: 8,
            addresses: {
                1: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
                42161: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
            }
        },
        DAI: {
            symbol: 'DAI',
            name: 'Dai Stablecoin',
            decimals: 18,
            addresses: {
                1: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                42161: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
            }
        }
    },

    // Current chain
    currentChain: 42161, // Default to Arbitrum

    /**
     * Set current chain
     */
    setChain(chainId) {
        this.currentChain = chainId;
    },

    /**
     * Get token address for current chain
     */
    getTokenAddress(symbol) {
        const token = this.TOKENS[symbol];
        return token?.addresses[this.currentChain];
    },

    /**
     * Get quote for swap using 0x API
     */
    async getQuote(fromToken, toToken, amount, slippage = 0.5) {
        const fromAddress = this.getTokenAddress(fromToken);
        const toAddress = this.getTokenAddress(toToken);
        const fromDecimals = this.TOKENS[fromToken]?.decimals || 18;

        if (!fromAddress || !toAddress) {
            throw new Error('Token not supported on current chain');
        }

        // Convert amount to wei
        const amountWei = BigInt(Math.floor(amount * (10 ** fromDecimals))).toString();

        try {
            const params = new URLSearchParams({
                sellToken: fromAddress,
                buyToken: toAddress,
                sellAmount: amountWei,
                slippagePercentage: (slippage / 100).toString(),
                chainId: this.currentChain.toString()
            });

            const response = await fetch(`${this.ZEROX_API}/swap/v1/quote?${params}`, {
                headers: {
                    '0x-api-key': '' // Add API key for production
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.reason || 'Failed to get quote');
            }

            const data = await response.json();
            const toDecimals = this.TOKENS[toToken]?.decimals || 18;

            return {
                fromToken,
                toToken,
                fromAmount: amount,
                toAmount: parseInt(data.buyAmount) / (10 ** toDecimals),
                price: parseFloat(data.price),
                priceImpact: parseFloat(data.estimatedPriceImpact || 0),
                gas: parseInt(data.gas || 0),
                gasPrice: parseInt(data.gasPrice || 0),
                estimatedGas: parseInt(data.estimatedGas || 150000),
                route: data.sources?.filter(s => parseFloat(s.proportion) > 0) || [],
                data: data.data,
                to: data.to,
                value: data.value
            };
        } catch (e) {
            console.error('Failed to get quote:', e);
            throw e;
        }
    },

    /**
     * Get price for token pair
     */
    async getPrice(fromToken, toToken) {
        try {
            const quote = await this.getQuote(fromToken, toToken, 1);
            return quote.price;
        } catch (e) {
            console.error('Failed to get price:', e);
            return null;
        }
    },

    /**
     * Get token balance
     */
    async getTokenBalance(address, tokenSymbol) {
        const chain = this.CHAINS[Object.keys(this.CHAINS).find(k => this.CHAINS[k].id === this.currentChain)];
        if (!chain) return 0;

        const token = this.TOKENS[tokenSymbol];
        if (!token) return 0;

        // Native ETH
        if (tokenSymbol === 'ETH') {
            try {
                const response = await fetch(chain.rpc, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'eth_getBalance',
                        params: [address, 'latest'],
                        id: 1
                    })
                });

                const data = await response.json();
                return parseInt(data.result, 16) / (10 ** 18);
            } catch (e) {
                console.error('Failed to get ETH balance:', e);
                return 0;
            }
        }

        // ERC20 token
        const tokenAddress = token.addresses[this.currentChain];
        if (!tokenAddress) return 0;

        try {
            // balanceOf(address) selector: 0x70a08231
            const data = '0x70a08231' + address.slice(2).padStart(64, '0');

            const response = await fetch(chain.rpc, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                        to: tokenAddress,
                        data: data
                    }, 'latest'],
                    id: 1
                })
            });

            const result = await response.json();
            return parseInt(result.result, 16) / (10 ** token.decimals);
        } catch (e) {
            console.error('Failed to get token balance:', e);
            return 0;
        }
    },

    /**
     * Get all token balances for an address
     */
    async getAllBalances(address) {
        const balances = {};

        for (const [symbol, token] of Object.entries(this.TOKENS)) {
            if (token.addresses[this.currentChain]) {
                balances[symbol] = await this.getTokenBalance(address, symbol);
            }
        }

        return balances;
    },

    /**
     * Execute swap transaction
     */
    async executeSwap(quote, wallet, privateKey) {
        if (!quote.to || !quote.data) {
            throw new Error('Invalid quote data');
        }

        // If using MetaMask
        if (wallet.type === 'metamask' && window.ethereum) {
            try {
                const txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: wallet.address,
                        to: quote.to,
                        data: quote.data,
                        value: quote.value || '0x0',
                        gas: '0x' + quote.estimatedGas.toString(16)
                    }]
                });

                return {
                    success: true,
                    txHash,
                    message: 'Transaction submitted'
                };
            } catch (e) {
                throw new Error('Transaction rejected: ' + e.message);
            }
        }

        // For internal wallet, need to sign and broadcast
        // This requires ethers.js or similar library
        console.log('Swap to execute:', quote);
        return {
            success: false,
            message: 'Internal wallet signing not yet implemented'
        };
    },

    /**
     * Check token allowance
     */
    async checkAllowance(tokenSymbol, ownerAddress, spenderAddress) {
        const token = this.TOKENS[tokenSymbol];
        if (!token || tokenSymbol === 'ETH') return Infinity;

        const tokenAddress = token.addresses[this.currentChain];
        if (!tokenAddress) return 0;

        const chain = this.CHAINS[Object.keys(this.CHAINS).find(k => this.CHAINS[k].id === this.currentChain)];

        try {
            // allowance(owner, spender) selector: 0xdd62ed3e
            const data = '0xdd62ed3e' +
                ownerAddress.slice(2).padStart(64, '0') +
                spenderAddress.slice(2).padStart(64, '0');

            const response = await fetch(chain.rpc, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                        to: tokenAddress,
                        data: data
                    }, 'latest'],
                    id: 1
                })
            });

            const result = await response.json();
            return parseInt(result.result, 16) / (10 ** token.decimals);
        } catch (e) {
            console.error('Failed to check allowance:', e);
            return 0;
        }
    },

    /**
     * Approve token spending
     */
    async approveToken(tokenSymbol, spenderAddress, amount, wallet) {
        const token = this.TOKENS[tokenSymbol];
        if (!token || tokenSymbol === 'ETH') {
            return { success: true, message: 'No approval needed for ETH' };
        }

        const tokenAddress = token.addresses[this.currentChain];
        if (!tokenAddress) {
            throw new Error('Token not found on current chain');
        }

        // Max approval
        const maxAmount = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

        // approve(spender, amount) selector: 0x095ea7b3
        const data = '0x095ea7b3' +
            spenderAddress.slice(2).padStart(64, '0') +
            maxAmount.slice(2);

        if (wallet.type === 'metamask' && window.ethereum) {
            try {
                const txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: wallet.address,
                        to: tokenAddress,
                        data: data
                    }]
                });

                return {
                    success: true,
                    txHash,
                    message: 'Approval submitted'
                };
            } catch (e) {
                throw new Error('Approval rejected: ' + e.message);
            }
        }

        return {
            success: false,
            message: 'Internal wallet approval not yet implemented'
        };
    },

    /**
     * Get token list
     */
    getTokenList() {
        return Object.entries(this.TOKENS)
            .filter(([symbol, token]) => token.addresses[this.currentChain])
            .map(([symbol, token]) => ({
                symbol,
                name: token.name,
                decimals: token.decimals,
                address: token.addresses[this.currentChain]
            }));
    },

    /**
     * Format amount with token decimals
     */
    formatAmount(amount, decimals = 18) {
        if (amount < 0.0001) {
            return '<0.0001';
        }
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: Math.min(decimals, 6)
        }).format(amount);
    },

    /**
     * Calculate price impact
     */
    calculatePriceImpact(inputAmount, outputAmount, spotPrice) {
        const expectedOutput = inputAmount * spotPrice;
        const impact = ((expectedOutput - outputAmount) / expectedOutput) * 100;
        return Math.max(0, impact);
    },

    /**
     * Get gas price in Gwei
     */
    async getGasPrice() {
        const chain = this.CHAINS[Object.keys(this.CHAINS).find(k => this.CHAINS[k].id === this.currentChain)];
        if (!chain) return 0;

        try {
            const response = await fetch(chain.rpc, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_gasPrice',
                    params: [],
                    id: 1
                })
            });

            const data = await response.json();
            return parseInt(data.result, 16) / 1e9; // Convert to Gwei
        } catch (e) {
            console.error('Failed to get gas price:', e);
            return 0;
        }
    },

    /**
     * Estimate gas cost in USD
     */
    async estimateGasCostUSD(gasLimit, ethPrice) {
        const gasPrice = await this.getGasPrice();
        const gasCostETH = (gasLimit * gasPrice) / 1e9;
        return gasCostETH * ethPrice;
    }
};

// Export
window.UniswapAPI = UniswapAPI;
