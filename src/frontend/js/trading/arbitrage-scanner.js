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
        },
        fantom: {
            name: 'Fantom',
            chainId: 250,
            rpc: 'https://rpc.ftm.tools',
            gasToken: 'FTM',
            avgGas: 30,
            blockTime: 1
        },
        solana: {
            name: 'Solana',
            chainId: 0,
            rpc: 'https://api.mainnet-beta.solana.com',
            gasToken: 'SOL',
            avgGas: 0.000005,
            blockTime: 0.4
        },
        bsc: {
            name: 'BNB Chain',
            chainId: 56,
            rpc: 'https://bsc-dataseed.binance.org',
            gasToken: 'BNB',
            avgGas: 3,
            blockTime: 3
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
        },
        quickswap: {
            name: 'QuickSwap',
            networks: ['polygon'],
            router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
        },
        spookyswap: {
            name: 'SpookySwap',
            networks: ['fantom'],
            router: '0xF491e7B69E4244ad4002BC14e878a34207E38c29'
        },
        kyberswap: {
            name: 'KyberSwap',
            networks: ['ethereum', 'arbitrum', 'polygon', 'optimism', 'base'],
            router: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'
        },
        jupiter: {
            name: 'Jupiter',
            networks: ['solana'],
            router: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'
        },
        mux: {
            name: 'MUX Protocol',
            networks: ['arbitrum', 'optimism', 'fantom'],
            router: '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633'
        },
        venus: {
            name: 'Venus Protocol',
            networks: ['bsc'],
            router: '0xfD36E2c2a6789Db23113685031d7F16329158384'
        },
        synthetix: {
            name: 'Synthetix',
            networks: ['ethereum', 'base', 'arbitrum'],
            router: '0x0A2AF931eFFd34b81ebcc57E3d3c9B1E1dE1C9Ce'
        },
        cheeseswap: {
            name: 'CheeseSwap',
            networks: ['bsc'],
            router: '0x3047799262d8D2EF41Ed2a222205968bC9b0d895'
        },
        instadapp: {
            name: 'Instadapp Fluid',
            networks: ['ethereum', 'arbitrum', 'polygon', 'base'],
            router: '0x2971AdFa57b20E5a416aE5a708A8655A9c74f723'
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
            polygon: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
            fantom: '0x321162Cd933E2Be498Cd2267a90534A804051b11'
        },
        FTM: {
            fantom: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83' // WFTM
        },
        SOL: {
            solana: 'So11111111111111111111111111111111111111112' // Wrapped SOL
        },
        JUP: {
            solana: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
        },
        BNB: {
            bsc: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' // WBNB
        },
        XVS: {
            bsc: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63'
        },
        SNX: {
            ethereum: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
            optimism: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
            base: '0x22e6966B799c4D5B13BE962E1D117b56327FDa66',
            arbitrum: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a'
        }
    },

    // === CHAIN & PROTOCOL HACK PROTECTION ===
    hackProtection: {
        // Chains/DEXes currently flagged as compromised
        pausedChains: {},    // { networkId: { reason, since, autoResume } }
        pausedDexes: {},     // { dexId: { reason, since, autoResume } }

        // Price anomaly tracking per network/dex
        priceHistory: {},    // { key: [{ price, timestamp }] }
        anomalyThresholds: {
            maxDeviation: 0.10,      // 10% sudden move = suspicious
            maxDeviationCritical: 0.25, // 25% = likely exploit
            minSamples: 3,
            windowMs: 60000          // 1-minute window
        },

        // TVL drain detection
        tvlSnapshots: {},
        tvlDrainThreshold: 0.30,     // 30% TVL drop = potential drain

        // Bridge exploit detection
        bridgeFailures: {},          // { route: { count, firstSeen } }
        maxBridgeFailures: 3,        // 3 fails in window = pause bridge
        bridgeFailureWindowMs: 300000, // 5-minute window

        // Known exploit signatures (updated manually or via feed)
        exploitSignatures: [
            { type: 'infinite_mint', pattern: 'abnormal_supply_increase' },
            { type: 'flash_loan', pattern: 'single_block_arb_spike' },
            { type: 'oracle_manipulation', pattern: 'price_source_divergence' },
            { type: 'reentrancy', pattern: 'recursive_call_depth' },
            { type: 'bridge_drain', pattern: 'one_sided_bridge_flow' }
        ]
    },

    /**
     * Check if a chain is safe to use
     */
    isChainSafe(networkId) {
        const paused = this.hackProtection.pausedChains[networkId];
        if (!paused) return { safe: true };

        // Auto-resume after 1 hour if no critical flag
        if (paused.autoResume && Date.now() - paused.since > 3600000) {
            delete this.hackProtection.pausedChains[networkId];
            console.warn(`[SECURITY] Chain ${networkId} auto-resumed after cooldown`);
            this.emitSecurityEvent('chain_resumed', { network: networkId });
            return { safe: true };
        }

        return { safe: false, reason: paused.reason, since: paused.since };
    },

    /**
     * Check if a DEX/protocol is safe to use
     */
    isDexSafe(dexId) {
        const paused = this.hackProtection.pausedDexes[dexId];
        if (!paused) return { safe: true };

        if (paused.autoResume && Date.now() - paused.since > 3600000) {
            delete this.hackProtection.pausedDexes[dexId];
            console.warn(`[SECURITY] DEX ${dexId} auto-resumed after cooldown`);
            this.emitSecurityEvent('dex_resumed', { dex: dexId });
            return { safe: true };
        }

        return { safe: false, reason: paused.reason, since: paused.since };
    },

    /**
     * Manually pause a chain (e.g. after confirmed exploit)
     */
    pauseChain(networkId, reason, autoResume = true) {
        this.hackProtection.pausedChains[networkId] = {
            reason, since: Date.now(), autoResume
        };
        console.error(`[SECURITY] CHAIN PAUSED: ${networkId} - ${reason}`);
        this.emitSecurityEvent('chain_paused', { network: networkId, reason });

        // Auto-report to combo incident system
        if (typeof CombosModule !== 'undefined' && CombosModule.reportIncident) {
            CombosModule.reportIncident('critical', 'chain_paused', {
                network: networkId, reason, autoResume,
                message: `Chain ${networkId} paused: ${reason}`
            });
        }
    },

    /**
     * Manually pause a DEX/protocol
     */
    pauseDex(dexId, reason, autoResume = true) {
        this.hackProtection.pausedDexes[dexId] = {
            reason, since: Date.now(), autoResume
        };
        console.error(`[SECURITY] DEX PAUSED: ${dexId} - ${reason}`);
        this.emitSecurityEvent('dex_paused', { dex: dexId, reason });

        // Auto-report to combo incident system
        if (typeof CombosModule !== 'undefined' && CombosModule.reportIncident) {
            CombosModule.reportIncident('critical', 'protocol_paused', {
                dex: dexId, reason, autoResume,
                message: `DEX ${dexId} paused: ${reason}`
            });
        }
    },

    /**
     * Resume a paused chain/dex manually
     */
    resumeChain(networkId) {
        delete this.hackProtection.pausedChains[networkId];
        this.emitSecurityEvent('chain_resumed', { network: networkId });
        if (typeof CombosModule !== 'undefined' && CombosModule.reportIncident) {
            CombosModule.reportIncident('resolved', 'chain_resumed', {
                network: networkId, message: `Chain ${networkId} resumed`
            });
        }
    },

    resumeDex(dexId) {
        delete this.hackProtection.pausedDexes[dexId];
        this.emitSecurityEvent('dex_resumed', { dex: dexId });
        if (typeof CombosModule !== 'undefined' && CombosModule.reportIncident) {
            CombosModule.reportIncident('resolved', 'protocol_resumed', {
                dex: dexId, message: `DEX ${dexId} resumed`
            });
        }
    },

    /**
     * Detect price anomalies that may indicate an exploit
     * Returns true if price looks suspicious
     */
    detectPriceAnomaly(networkId, dexId, tokenA, tokenB, price) {
        const key = `${networkId}_${dexId}_${tokenA}_${tokenB}`;
        const now = Date.now();
        const cfg = this.hackProtection.anomalyThresholds;

        if (!this.hackProtection.priceHistory[key]) {
            this.hackProtection.priceHistory[key] = [];
        }

        const history = this.hackProtection.priceHistory[key];

        // Purge old entries
        while (history.length > 0 && now - history[0].timestamp > cfg.windowMs) {
            history.shift();
        }

        // Need minimum samples to detect
        if (history.length >= cfg.minSamples) {
            const avg = history.reduce((s, h) => s + h.price, 0) / history.length;
            const deviation = Math.abs(price - avg) / avg;

            if (deviation > cfg.maxDeviationCritical) {
                // Critical: likely exploit - auto-pause DEX on this chain
                this.pauseDex(dexId, `Critical price anomaly: ${(deviation * 100).toFixed(1)}% deviation on ${tokenA}/${tokenB} (${networkId})`, true);
                this.emitSecurityEvent('exploit_suspected', {
                    type: 'price_anomaly_critical',
                    network: networkId, dex: dexId,
                    pair: `${tokenA}/${tokenB}`,
                    deviation: (deviation * 100).toFixed(1) + '%',
                    price, avgPrice: avg
                });
                return true;
            }

            if (deviation > cfg.maxDeviation) {
                console.warn(`[SECURITY] Price anomaly warning: ${(deviation * 100).toFixed(1)}% on ${dexId}/${networkId} ${tokenA}/${tokenB}`);
                this.emitSecurityEvent('price_anomaly_warning', {
                    network: networkId, dex: dexId,
                    pair: `${tokenA}/${tokenB}`,
                    deviation: (deviation * 100).toFixed(1) + '%'
                });
                // Don't add suspicious price to history
                return true;
            }
        }

        history.push({ price, timestamp: now });
        return false;
    },

    /**
     * Track bridge failures to detect bridge exploits
     */
    trackBridgeFailure(fromNetwork, toNetwork) {
        const route = `${fromNetwork}->${toNetwork}`;
        const now = Date.now();

        if (!this.hackProtection.bridgeFailures[route]) {
            this.hackProtection.bridgeFailures[route] = { count: 0, firstSeen: now };
        }

        const tracker = this.hackProtection.bridgeFailures[route];

        // Reset if outside window
        if (now - tracker.firstSeen > this.hackProtection.bridgeFailureWindowMs) {
            tracker.count = 0;
            tracker.firstSeen = now;
        }

        tracker.count++;

        if (tracker.count >= this.hackProtection.maxBridgeFailures) {
            this.pauseChain(toNetwork, `Bridge failures detected on ${route} (${tracker.count} failures)`, true);
            return true;
        }
        return false;
    },

    /**
     * Validate an opportunity is not from a compromised venue
     */
    validateOpportunity(opportunity) {
        const buyCheck = this.isChainSafe(opportunity.buyVenue.network);
        if (!buyCheck.safe) return { valid: false, reason: `Buy chain paused: ${buyCheck.reason}` };

        const sellCheck = this.isChainSafe(opportunity.sellVenue.network);
        if (!sellCheck.safe) return { valid: false, reason: `Sell chain paused: ${sellCheck.reason}` };

        const buyDex = this.isDexSafe(opportunity.buyVenue.dex);
        if (!buyDex.safe) return { valid: false, reason: `Buy DEX paused: ${buyDex.reason}` };

        const sellDex = this.isDexSafe(opportunity.sellVenue.dex);
        if (!sellDex.safe) return { valid: false, reason: `Sell DEX paused: ${sellDex.reason}` };

        // Suspiciously high profit = likely exploit artifact
        if (opportunity.profitPercent > 5) {
            console.warn(`[SECURITY] Suspicious profit ${opportunity.profitPercent.toFixed(2)}% on ${opportunity.buyVenue.dexName}->${opportunity.sellVenue.dexName} - possible exploit artifact`);
            this.emitSecurityEvent('suspicious_profit', {
                profit: opportunity.profitPercent,
                buyVenue: opportunity.buyVenue,
                sellVenue: opportunity.sellVenue
            });
            return { valid: false, reason: 'Profit too high - possible exploit artifact' };
        }

        return { valid: true };
    },

    /**
     * Get current security status for all chains/dexes
     */
    getSecurityStatus() {
        return {
            pausedChains: { ...this.hackProtection.pausedChains },
            pausedDexes: { ...this.hackProtection.pausedDexes },
            activePriceAlerts: Object.keys(this.hackProtection.priceHistory).length,
            bridgeFailures: { ...this.hackProtection.bridgeFailures }
        };
    },

    /**
     * Emit security event for UI/monitoring
     */
    emitSecurityEvent(type, detail) {
        window.dispatchEvent(new CustomEvent('security-alert', {
            detail: { source: 'arbitrage-scanner', type, ...detail, timestamp: Date.now() }
        }));
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

        // Filter out opportunities from compromised venues
        const safeOpportunities = opportunities.filter(opp => this.validateOpportunity(opp).valid);

        // Sort by profit
        this.opportunities = safeOpportunities.sort((a, b) => b.profitPercent - a.profitPercent);

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
            // Skip paused chains
            if (!this.isChainSafe(networkId).safe) continue;

            for (const [dexId, dex] of Object.entries(this.DEXES)) {
                if (!dex.networks.includes(networkId)) continue;

                // Skip paused DEXes
                if (!this.isDexSafe(dexId).safe) continue;

                try {
                    const price = await this.getPrice(networkId, dexId, tokenA, tokenB);
                    if (price) {
                        // Check for price anomaly before accepting
                        if (this.detectPriceAnomaly(networkId, dexId, tokenA, tokenB, price)) {
                            continue; // Skip anomalous price
                        }

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
            pancakeswap: 0.0012,
            quickswap: 0.0009,
            spookyswap: 0.0011,
            kyberswap: -0.0003,
            jupiter: -0.0002,
            mux: 0.0006,
            venus: 0.0010,
            synthetix: -0.0004,
            cheeseswap: 0.0015,
            instadapp: -0.0002
        };

        // L2s often have slightly different prices
        const networkSpread = {
            ethereum: 0,
            arbitrum: 0.0005,
            optimism: 0.0007,
            base: 0.0008,
            polygon: 0.001,
            fantom: 0.0012,
            solana: 0.0006,
            bsc: 0.0009
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
            MATIC: 0.5,
            FTM: 0.4,
            SOL: 150,
            JUP: 0.8,
            BNB: 600,
            XVS: 8,
            SNX: 2.5
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

        const ftmPrice = PriceService?.prices?.FTM?.price || 0.4;
        if (config.gasToken === 'FTM') {
            return (gasUnits * config.avgGas * ftmPrice) / 1e9;
        }

        const solPrice = PriceService?.prices?.SOL?.price || 150;
        if (config.gasToken === 'SOL') {
            return 0.000005 * solPrice;
        }

        const bnbPrice = PriceService?.prices?.BNB?.price || 600;
        if (config.gasToken === 'BNB') {
            return (gasUnits * config.avgGas * bnbPrice) / 1e9;
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
        const riskDexes = ['pancakeswap', 'sushiswap', 'quickswap', 'spookyswap', 'mux', 'cheeseswap'];
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

        // Pre-execution security validation
        const validation = this.validateOpportunity(opportunity);
        if (!validation.valid) {
            throw new Error(`[SECURITY BLOCK] ${validation.reason}`);
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
        // Pre-bridge security checks
        const fromCheck = this.isChainSafe(fromNetwork);
        const toCheck = this.isChainSafe(toNetwork);
        if (!fromCheck.safe) throw new Error(`[SECURITY] Source chain ${fromNetwork} paused: ${fromCheck.reason}`);
        if (!toCheck.safe) throw new Error(`[SECURITY] Dest chain ${toNetwork} paused: ${toCheck.reason}`);

        console.log(`Bridging ${amount} ${token} from ${fromNetwork} to ${toNetwork}`);

        try {
            const result = {
                success: true,
                txHash: '0x' + Math.random().toString(16).substr(2, 64),
                amountOut: amount * 0.999
            };

            // Validate bridge output is reasonable (not exploited)
            const outputRatio = result.amountOut / amount;
            if (outputRatio > 1.01 || outputRatio < 0.95) {
                this.trackBridgeFailure(fromNetwork, toNetwork);
                throw new Error(`[SECURITY] Bridge output suspicious: ratio ${outputRatio.toFixed(4)}`);
            }

            return result;
        } catch (e) {
            this.trackBridgeFailure(fromNetwork, toNetwork);
            throw e;
        }
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
