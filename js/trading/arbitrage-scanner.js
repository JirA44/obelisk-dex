/**
 * Obelisk DEX - Cross-Chain Arbitrage Scanner
 *
 * Unique tool that finds price differences across:
 * - Multiple chains (Ethereum, Arbitrum, Optimism, Base, Polygon)
 * - Multiple DEXes (Uniswap, Sushiswap, Curve, Balancer)
 * - CEX/DEX opportunities
 *
 * Calculates profit after gas fees and shows actionable opportunities.
 */

const ArbitrageScanner = {
    // Supported networks
    NETWORKS: {
        ethereum: {
            name: 'Ethereum',
            chainId: 1,
            rpc: 'https://eth.llamarpc.com',
            gasToken: 'ETH',
            avgGas: 30, // Gwei
            blockTime: 12
        },
        arbitrum: {
            name: 'Arbitrum',
            chainId: 42161,
            rpc: 'https://arb1.arbitrum.io/rpc',
            gasToken: 'ETH',
            avgGas: 0.1,
            blockTime: 0.25
        },
        optimism: {
            name: 'Optimism',
            chainId: 10,
            rpc: 'https://mainnet.optimism.io',
            gasToken: 'ETH',
            avgGas: 0.001,
            blockTime: 2
        },
        base: {
            name: 'Base',
            chainId: 8453,
            rpc: 'https://mainnet.base.org',
            gasToken: 'ETH',
            avgGas: 0.001,
            blockTime: 2
        },
        polygon: {
            name: 'Polygon',
            chainId: 137,
            rpc: 'https://polygon-rpc.com',
            gasToken: 'MATIC',
            avgGas: 100,
            blockTime: 2
        }
    },

    // DEX configurations
    DEXES: {
        uniswap_v3: {
            name: 'Uniswap V3',
            networks: ['ethereum', 'arbitrum', 'optimism', 'base', 'polygon'],
            quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
        },
        sushiswap: {
            name: 'SushiSwap',
            networks: ['ethereum', 'arbitrum', 'polygon'],
            router: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
        },
        curve: {
            name: 'Curve',
            networks: ['ethereum', 'arbitrum', 'optimism'],
            router: '0x99a58482BD75cbab83b27EC03CA68fF489b5788f'
        },
        balancer: {
            name: 'Balancer',
            networks: ['ethereum', 'arbitrum', 'polygon'],
            vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
        },
        pancakeswap: {
            name: 'PancakeSwap',
            networks: ['ethereum', 'arbitrum', 'base'],
            router: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4'
        }
    },

    // Token addresses by network
    TOKENS: {
        ETH: {
            ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
            arbitrum: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            optimism: '0x4200000000000000000000000000000000000006',
            base: '0x4200000000000000000000000000000000000006',
            polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
        },
        USDC: {
            ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
            base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
        },
        USDT: {
            ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
            optimism: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
            polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
        },
        WBTC: {
            ethereum: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            arbitrum: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
            optimism: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
            polygon: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6'
        }
    },

    // Current opportunities
    opportunities: [],
    isScanning: false,
    scanInterval: null,

    /**
     * Start continuous scanning
     */
    startScanning(interval = 30000) {
        if (this.isScanning) return;

        this.isScanning = true;
        console.log('Arbitrage scanner started');

        // Initial scan
        this.scanAllPairs();

        // Continuous scanning
        this.scanInterval = setInterval(() => {
            this.scanAllPairs();
        }, interval);
    },

    /**
     * Stop scanning
     */
    stopScanning() {
        this.isScanning = false;
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        console.log('Arbitrage scanner stopped');
    },

    /**
     * Scan all configured trading pairs
     */
    async scanAllPairs() {
        const pairs = [
            ['ETH', 'USDC'],
            ['ETH', 'USDT'],
            ['WBTC', 'USDC'],
            ['WBTC', 'ETH']
        ];

        const opportunities = [];

        for (const [tokenA, tokenB] of pairs) {
            try {
                const opps = await this.scanPair(tokenA, tokenB);
                opportunities.push(...opps);
            } catch (e) {
                console.error(`Error scanning ${tokenA}/${tokenB}:`, e);
            }
        }

        // Sort by profit
        this.opportunities = opportunities.sort((a, b) => b.profitPercent - a.profitPercent);

        // Dispatch event
        window.dispatchEvent(new CustomEvent('arbitrage-updated', {
            detail: this.opportunities
        }));

        return this.opportunities;
    },

    /**
     * Scan a specific trading pair across all venues
     */
    async scanPair(tokenA, tokenB) {
        const prices = [];

        // Get prices from each network/DEX combination
        for (const [networkId, network] of Object.entries(this.NETWORKS)) {
            for (const [dexId, dex] of Object.entries(this.DEXES)) {
                if (!dex.networks.includes(networkId)) continue;

                try {
                    const price = await this.getPrice(networkId, dexId, tokenA, tokenB);
                    if (price) {
                        prices.push({
                            network: networkId,
                            networkName: network.name,
                            dex: dexId,
                            dexName: dex.name,
                            tokenA,
                            tokenB,
                            price,
                            gasEstimate: this.estimateGas(networkId)
                        });
                    }
                } catch (e) {
                    // Skip failed quotes silently
                }
            }
        }

        // Find arbitrage opportunities
        return this.findOpportunities(prices);
    },

    /**
     * Get price from specific DEX
     */
    async getPrice(network, dex, tokenA, tokenB) {
        // In production, this would call the actual DEX quoter contracts
        // For demo, using simulated prices with realistic spreads

        const basePrice = PriceService?.prices[tokenA]?.price || this.getBasePrice(tokenA);
        const quotePrice = PriceService?.prices[tokenB]?.price || this.getBasePrice(tokenB);

        if (!basePrice || !quotePrice) return null;

        // Add realistic variance based on network/dex (0.1% - 0.5% spread)
        const variance = (Math.random() * 0.004 - 0.002); // -0.2% to +0.2%

        // Different DEXes have different liquidity = different prices
        const dexSpread = {
            uniswap_v3: 0,
            sushiswap: 0.001,
            curve: -0.0005, // Often better for stables
            balancer: 0.0008,
            pancakeswap: 0.0012
        };

        // L2s often have slightly different prices
        const networkSpread = {
            ethereum: 0,
            arbitrum: 0.0005,
            optimism: 0.0007,
            base: 0.0008,
            polygon: 0.001
        };

        const totalVariance = variance + (dexSpread[dex] || 0) + (networkSpread[network] || 0);
        return (basePrice / quotePrice) * (1 + totalVariance);
    },

    /**
     * Get base price for token
     */
    getBasePrice(token) {
        const prices = {
            ETH: 3500,
            WBTC: 100000,
            USDC: 1,
            USDT: 1,
            MATIC: 0.5
        };
        return prices[token] || 1;
    },

    /**
     * Find arbitrage opportunities from price list
     */
    findOpportunities(prices) {
        const opportunities = [];

        // Compare each pair of prices
        for (let i = 0; i < prices.length; i++) {
            for (let j = i + 1; j < prices.length; j++) {
                const buyVenue = prices[i].price < prices[j].price ? prices[i] : prices[j];
                const sellVenue = prices[i].price < prices[j].price ? prices[j] : prices[i];

                const priceDiff = (sellVenue.price - buyVenue.price) / buyVenue.price;
                const grossProfit = priceDiff * 100;

                // Calculate costs
                const gasCostBuy = buyVenue.gasEstimate;
                const gasCostSell = sellVenue.gasEstimate;
                const bridgeCost = buyVenue.network !== sellVenue.network ? 5 : 0; // $5 bridge cost estimate

                // Assume $10,000 trade size
                const tradeSize = 10000;
                const totalCost = gasCostBuy + gasCostSell + bridgeCost;
                const netProfit = (grossProfit / 100) * tradeSize - totalCost;
                const netProfitPercent = (netProfit / tradeSize) * 100;

                // Only show profitable opportunities
                if (netProfitPercent > 0.1) {
                    opportunities.push({
                        id: `${buyVenue.network}_${buyVenue.dex}_${sellVenue.network}_${sellVenue.dex}`,
                        tokenA: buyVenue.tokenA,
                        tokenB: buyVenue.tokenB,
                        buyVenue: {
                            network: buyVenue.network,
                            networkName: buyVenue.networkName,
                            dex: buyVenue.dex,
                            dexName: buyVenue.dexName,
                            price: buyVenue.price
                        },
                        sellVenue: {
                            network: sellVenue.network,
                            networkName: sellVenue.networkName,
                            dex: sellVenue.dex,
                            dexName: sellVenue.dexName,
                            price: sellVenue.price
                        },
                        priceDiffPercent: grossProfit,
                        estimatedGasCost: totalCost,
                        needsBridge: buyVenue.network !== sellVenue.network,
                        profitPercent: netProfitPercent,
                        profitUSD: netProfit,
                        tradeSize,
                        timestamp: Date.now(),
                        risk: this.assessRisk(buyVenue, sellVenue),
                        executionSteps: this.getExecutionSteps(buyVenue, sellVenue)
                    });
                }
            }
        }

        return opportunities;
    },

    /**
     * Estimate gas cost in USD
     */
    estimateGas(network) {
        const config = this.NETWORKS[network];
        const ethPrice = PriceService?.prices?.ETH?.price || 3500;
        const maticPrice = PriceService?.prices?.MATIC?.price || 0.5;

        // Approximate gas units for a swap
        const gasUnits = 150000;

        if (config.gasToken === 'MATIC') {
            return (gasUnits * config.avgGas * maticPrice) / 1e9;
        }

        return (gasUnits * config.avgGas * ethPrice) / 1e9;
    },

    /**
     * Assess risk level of arbitrage
     */
    assessRisk(buyVenue, sellVenue) {
        let riskScore = 0;

        // Cross-chain = higher risk
        if (buyVenue.network !== sellVenue.network) {
            riskScore += 2;
        }

        // Smaller DEXes = higher slippage risk
        const riskDexes = ['pancakeswap', 'sushiswap'];
        if (riskDexes.includes(buyVenue.dex)) riskScore++;
        if (riskDexes.includes(sellVenue.dex)) riskScore++;

        // L2s = faster but potential reorg risk
        const l2Networks = ['arbitrum', 'optimism', 'base'];
        if (l2Networks.includes(buyVenue.network)) riskScore++;
        if (l2Networks.includes(sellVenue.network)) riskScore++;

        if (riskScore <= 1) return 'low';
        if (riskScore <= 3) return 'medium';
        return 'high';
    },

    /**
     * Get execution steps for opportunity
     */
    getExecutionSteps(buyVenue, sellVenue) {
        const steps = [];

        // Step 1: Buy on cheaper venue
        steps.push({
            action: 'buy',
            network: buyVenue.network,
            dex: buyVenue.dex,
            description: `Buy ${buyVenue.tokenA} on ${buyVenue.dexName} (${buyVenue.networkName})`
        });

        // Step 2: Bridge if needed
        if (buyVenue.network !== sellVenue.network) {
            steps.push({
                action: 'bridge',
                fromNetwork: buyVenue.network,
                toNetwork: sellVenue.network,
                description: `Bridge to ${sellVenue.networkName} (via native bridge or LayerZero)`
            });
        }

        // Step 3: Sell on expensive venue
        steps.push({
            action: 'sell',
            network: sellVenue.network,
            dex: sellVenue.dex,
            description: `Sell ${buyVenue.tokenA} on ${sellVenue.dexName} (${sellVenue.networkName})`
        });

        return steps;
    },

    /**
     * Execute arbitrage opportunity
     */
    async executeArbitrage(opportunity, wallet, amount) {
        if (!wallet) {
            throw new Error('Wallet not connected');
        }

        const results = [];

        for (const step of opportunity.executionSteps) {
            switch (step.action) {
                case 'buy':
                    // Execute buy on source DEX
                    const buyResult = await this.executeTrade(
                        step.network,
                        step.dex,
                        opportunity.tokenB,
                        opportunity.tokenA,
                        amount,
                        wallet
                    );
                    results.push(buyResult);
                    break;

                case 'bridge':
                    // Bridge tokens to destination network
                    const bridgeResult = await this.bridgeTokens(
                        step.fromNetwork,
                        step.toNetwork,
                        opportunity.tokenA,
                        results[results.length - 1].amountOut,
                        wallet
                    );
                    results.push(bridgeResult);
                    break;

                case 'sell':
                    // Execute sell on destination DEX
                    const sellResult = await this.executeTrade(
                        step.network,
                        step.dex,
                        opportunity.tokenA,
                        opportunity.tokenB,
                        results[results.length - 1].amountOut,
                        wallet
                    );
                    results.push(sellResult);
                    break;
            }
        }

        return {
            success: true,
            steps: results,
            profit: results[results.length - 1].amountOut - amount
        };
    },

    /**
     * Execute trade on specific DEX
     */
    async executeTrade(network, dex, fromToken, toToken, amount, wallet) {
        // In production, this would call the actual DEX router
        console.log(`Executing trade: ${amount} ${fromToken} -> ${toToken} on ${dex} (${network})`);

        return {
            success: true,
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
            amountOut: amount * 0.997 // Simulated output with 0.3% slippage
        };
    },

    /**
     * Bridge tokens between networks
     */
    async bridgeTokens(fromNetwork, toNetwork, token, amount, wallet) {
        // In production, integrate with bridge protocols
        console.log(`Bridging ${amount} ${token} from ${fromNetwork} to ${toNetwork}`);

        return {
            success: true,
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
            amountOut: amount * 0.999 // Small bridge fee
        };
    },

    /**
     * Get best opportunities
     */
    getBestOpportunities(limit = 10) {
        return this.opportunities.slice(0, limit);
    },

    /**
     * Filter opportunities
     */
    filterOpportunities(filters = {}) {
        return this.opportunities.filter(opp => {
            if (filters.minProfit && opp.profitPercent < filters.minProfit) return false;
            if (filters.maxRisk && this.riskLevel(opp.risk) > this.riskLevel(filters.maxRisk)) return false;
            if (filters.network && opp.buyVenue.network !== filters.network && opp.sellVenue.network !== filters.network) return false;
            if (filters.token && opp.tokenA !== filters.token && opp.tokenB !== filters.token) return false;
            if (filters.sameChainOnly && opp.needsBridge) return false;
            return true;
        });
    },

    /**
     * Risk level to number for comparison
     */
    riskLevel(risk) {
        return { low: 1, medium: 2, high: 3 }[risk] || 0;
    },

    /**
     * Calculate optimal trade size
     */
    calculateOptimalSize(opportunity) {
        // In production, query liquidity depth
        // For now, return conservative estimate
        const liquidityEstimate = 100000; // $100k
        return Math.min(liquidityEstimate * 0.1, 50000); // 10% of liquidity, max $50k
    },

    /**
     * Subscribe to opportunity alerts
     */
    subscribeAlerts(callback, minProfit = 0.5) {
        window.addEventListener('arbitrage-updated', (e) => {
            const profitable = e.detail.filter(o => o.profitPercent >= minProfit);
            if (profitable.length > 0) {
                callback(profitable);
            }
        });
    }
};

// Export
window.ArbitrageScanner = ArbitrageScanner;
