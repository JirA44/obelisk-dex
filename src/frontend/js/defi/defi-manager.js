// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - DEFI MANAGER
// Unified interface for all DeFi protocols with risk ranking
// ═══════════════════════════════════════════════════════════════════════════════

const DeFiManager = {
    // All supported protocols with risk/reward data
    protocols: [
        // === TRÈS FAIBLE RISQUE (1/5) ===
        {
            id: 'aave-usdc',
            name: 'Aave V3 USDC',
            chain: 'arbitrum',
            type: 'lending',
            risk: 1,
            riskLabel: 'Très Faible',
            apy: { min: 3, max: 8 },
            minInvestment: 1,
            description: 'Prêt USDC sur Aave - protocole le plus audité',
            pros: ['Ultra sécurisé', 'Liquidité totale', 'Audité 50+ fois'],
            cons: ['APY modéré', 'Rendement variable'],
            integration: 'AaveIntegration',
            method: 'supplyUSDC'
        },
        {
            id: 'aave-dai',
            name: 'Aave V3 DAI',
            chain: 'arbitrum',
            type: 'lending',
            risk: 1,
            riskLabel: 'Très Faible',
            apy: { min: 2, max: 6 },
            minInvestment: 1,
            description: 'Prêt DAI sur Aave',
            pros: ['Stablecoin décentralisé', 'Très liquide'],
            cons: ['APY plus bas', 'Risque depeg DAI'],
            integration: 'AaveIntegration',
            method: 'supplyDAI'
        },

        // === FAIBLE RISQUE (2/5) ===
        {
            id: 'pendle-usdc',
            name: 'Pendle Fixed Yield',
            chain: 'arbitrum',
            type: 'fixed-yield',
            risk: 2,
            riskLabel: 'Faible',
            apy: { min: 8, max: 15 },
            minInvestment: 10,
            description: 'Rendement fixe garanti via Pendle',
            pros: ['APY fixe garanti', 'Pas de risque de taux'],
            cons: ['Fonds bloqués jusqu\'à maturité', 'Complexité'],
            integration: 'PendleIntegration',
            method: 'buyPT'
        },
        {
            id: 'compound-usdc',
            name: 'Compound V3 USDC',
            chain: 'arbitrum',
            type: 'lending',
            risk: 2,
            riskLabel: 'Faible',
            apy: { min: 4, max: 10 },
            minInvestment: 1,
            description: 'Prêt USDC sur Compound',
            pros: ['Protocole établi', 'Récompenses COMP'],
            cons: ['APY variable'],
            integration: 'CompoundIntegration',
            method: 'supply'
        },

        // === RISQUE MOYEN (3/5) ===
        {
            id: 'gmx-glp',
            name: 'GMX GLP',
            chain: 'arbitrum',
            type: 'real-yield',
            risk: 3,
            riskLabel: 'Moyen',
            apy: { min: 15, max: 30 },
            minInvestment: 10,
            description: 'Gagnez les frais de trading GMX en ETH',
            pros: ['Rendement réel en ETH', 'Pas de token inflation'],
            cons: ['Exposition aux cryptos du pool', 'Risque de traders gagnants'],
            integration: 'GMXIntegration',
            method: 'buyAndStakeGLP'
        },
        {
            id: 'aerodrome-usdc-eth',
            name: 'Aerodrome USDC/ETH',
            chain: 'base',
            type: 'lp',
            risk: 3,
            riskLabel: 'Moyen',
            apy: { min: 20, max: 50 },
            minInvestment: 50,
            description: 'LP sur Aerodrome (Base) - DEX #1 sur Base',
            pros: ['Très haut APY', 'Récompenses AERO'],
            cons: ['Impermanent Loss', 'Sur Base (bridge requis)'],
            integration: 'AerodromeIntegration',
            method: 'addLiquidity'
        },
        {
            id: 'camelot-usdc-eth',
            name: 'Camelot USDC/ETH',
            chain: 'arbitrum',
            type: 'lp',
            risk: 3,
            riskLabel: 'Moyen',
            apy: { min: 15, max: 40 },
            minInvestment: 50,
            description: 'LP sur Camelot - DEX natif Arbitrum',
            pros: ['Récompenses GRAIL', 'Arbitrum natif'],
            cons: ['Impermanent Loss', 'APY variable'],
            integration: 'CamelotIntegration',
            method: 'addLiquidity'
        },

        // === RISQUE ÉLEVÉ (4/5) ===
        {
            id: 'gmx-leverage',
            name: 'GMX Leverage Trading',
            chain: 'arbitrum',
            type: 'trading',
            risk: 4,
            riskLabel: 'Élevé',
            apy: { min: -100, max: 200 },
            minInvestment: 10,
            description: 'Trading avec levier jusqu\'à 50x',
            pros: ['Gains potentiels élevés', 'Liquidité profonde'],
            cons: ['Risque de liquidation', 'Frais de funding'],
            integration: 'GMXIntegration',
            method: 'openPosition'
        },
        {
            id: 'gains-perps',
            name: 'Gains Network Perps',
            chain: 'arbitrum',
            type: 'trading',
            risk: 4,
            riskLabel: 'Élevé',
            apy: { min: -100, max: 500 },
            minInvestment: 5,
            description: 'Perps 150x (Crypto), 1000x (Forex), 50x (Stocks)',
            pros: ['150x leverage crypto', 'Forex & Stocks', 'Frais 0.08%', '50+ paires'],
            cons: ['Risque de liquidation', 'Leverage extrême'],
            integration: 'GainsIntegration',
            method: 'openTrade'
        },
        {
            id: 'pendle-yt',
            name: 'Pendle YT (Yield Token)',
            chain: 'arbitrum',
            type: 'yield-speculation',
            risk: 4,
            riskLabel: 'Élevé',
            apy: { min: -50, max: 500 },
            minInvestment: 10,
            description: 'Spéculer sur les rendements futurs',
            pros: ['Levier sur yield', 'Gains exponentiels si APY monte'],
            cons: ['Perte totale si APY baisse', 'Complexe'],
            integration: 'PendleIntegration',
            method: 'buyYT'
        },

        // === TRÈS ÉLEVÉ (5/5) ===
        {
            id: 'degen-meme',
            name: 'Meme Coin LP',
            chain: 'arbitrum',
            type: 'degen',
            risk: 5,
            riskLabel: 'Très Élevé',
            apy: { min: -90, max: 1000 },
            minInvestment: 10,
            description: 'LP sur paires meme coins',
            pros: ['APY astronomique possible'],
            cons: ['Rug pull', 'IL massive', 'Token sans valeur'],
            integration: null,
            method: null
        }
    ],

    /**
     * Get protocols sorted by risk (safest first)
     */
    getByRisk(maxRisk = 5) {
        return this.protocols
            .filter(p => p.risk <= maxRisk)
            .sort((a, b) => a.risk - b.risk);
    },

    /**
     * Get protocols sorted by APY (highest first)
     */
    getByAPY() {
        return [...this.protocols].sort((a, b) => {
            const aAvg = (a.apy.min + a.apy.max) / 2;
            const bAvg = (b.apy.min + b.apy.max) / 2;
            return bAvg - aAvg;
        });
    },

    /**
     * Get protocols by chain
     */
    getByChain(chain) {
        return this.protocols.filter(p => p.chain === chain);
    },

    /**
     * Get best risk-adjusted returns (Sharpe-like ranking)
     */
    getBestRiskAdjusted() {
        return [...this.protocols]
            .map(p => {
                const avgAPY = (p.apy.min + p.apy.max) / 2;
                // Simple risk-adjusted score: APY / risk
                const score = avgAPY / p.risk;
                return { ...p, score };
            })
            .sort((a, b) => b.score - a.score);
    },

    /**
     * Calculate CAGR projection
     */
    calculateCAGR(protocol, amount, years = 10) {
        const avgAPY = (protocol.apy.min + protocol.apy.max) / 2;
        const rate = avgAPY / 100;

        const projections = {};
        for (let y = 1; y <= years; y++) {
            projections[`year${y}`] = amount * Math.pow(1 + rate, y);
        }

        return {
            protocol: protocol.name,
            risk: protocol.riskLabel,
            apy: avgAPY,
            initial: amount,
            projections
        };
    },

    /**
     * Get recommended portfolio based on risk tolerance
     */
    getRecommendedPortfolio(riskTolerance = 'moderate', amount = 1000) {
        const allocations = {
            conservative: [
                { id: 'aave-usdc', percent: 70 },
                { id: 'pendle-usdc', percent: 30 }
            ],
            moderate: [
                { id: 'aave-usdc', percent: 40 },
                { id: 'gmx-glp', percent: 35 },
                { id: 'pendle-usdc', percent: 25 }
            ],
            aggressive: [
                { id: 'gmx-glp', percent: 40 },
                { id: 'aerodrome-usdc-eth', percent: 30 },
                { id: 'pendle-yt', percent: 20 },
                { id: 'aave-usdc', percent: 10 }
            ]
        };

        const allocation = allocations[riskTolerance] || allocations.moderate;

        return allocation.map(a => {
            const protocol = this.protocols.find(p => p.id === a.id);
            const allocatedAmount = amount * a.percent / 100;
            const cagr = this.calculateCAGR(protocol, allocatedAmount);

            return {
                ...protocol,
                allocation: a.percent,
                amount: allocatedAmount,
                projectedYear1: cagr.projections.year1,
                projectedYear5: cagr.projections.year5,
                projectedYear10: cagr.projections.year10
            };
        });
    },

    /**
     * Execute investment in a protocol
     */
    async invest(protocolId, amount, isSimulated = false) {
        const protocol = this.protocols.find(p => p.id === protocolId);

        if (!protocol) {
            return { success: false, error: 'Protocol not found' };
        }

        if (isSimulated) {
            // Use simulated portfolio
            if (typeof SimulatedPortfolio !== 'undefined') {
                const avgAPY = (protocol.apy.min + protocol.apy.max) / 2;
                return SimulatedPortfolio.invest(
                    protocolId,
                    protocol.name,
                    amount,
                    avgAPY,
                    'defi',
                    true,
                    null
                );
            }
            return { success: false, error: 'SimulatedPortfolio not available' };
        }

        // Real investment
        if (!protocol.integration) {
            return { success: false, error: 'Real investment not yet supported for this protocol' };
        }

        const integration = window[protocol.integration];
        if (!integration || !integration[protocol.method]) {
            return { success: false, error: `Integration ${protocol.integration} not loaded` };
        }

        return await integration[protocol.method](amount);
    },

    /**
     * Get user's positions across all protocols
     */
    async getAllPositions(userAddress) {
        const positions = [];

        // Check Aave
        if (typeof AaveIntegration !== 'undefined') {
            const aavePos = await AaveIntegration.getUserPosition(userAddress);
            if (aavePos.supplied > 0) {
                positions.push({
                    protocol: 'Aave V3',
                    type: 'lending',
                    value: aavePos.supplied,
                    apy: aavePos.apy
                });
            }
        }

        // Check GMX
        if (typeof GMXIntegration !== 'undefined') {
            const gmxPos = await GMXIntegration.getUserPosition(userAddress);
            if (gmxPos.usdValue > 0) {
                positions.push({
                    protocol: 'GMX GLP',
                    type: 'real-yield',
                    value: gmxPos.usdValue,
                    apy: gmxPos.apr,
                    rewards: gmxPos.claimableETH
                });
            }
        }

        // Check Pendle
        if (typeof PendleIntegration !== 'undefined') {
            try {
                const pendlePos = await PendleIntegration.getUserPosition(userAddress);
                if (pendlePos.hasPositions) {
                    pendlePos.positions.forEach(pos => {
                        positions.push({
                            protocol: `Pendle ${pos.type}`,
                            type: pos.type === 'PT' ? 'fixed-yield' : 'yield-speculation',
                            value: pos.valueUSD,
                            apy: pos.fixedAPY || 0,
                            market: pos.market,
                            maturityDate: pos.maturityDate
                        });
                    });
                }
            } catch (err) {
                console.warn('[DeFiManager] Error fetching Pendle positions:', err);
            }
        }

        return positions;
    },

    /**
     * Render protocol comparison table
     */
    renderComparisonTable() {
        const sorted = this.getBestRiskAdjusted();

        let html = `
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <thead>
                    <tr style="background:#1a1a2e;color:#fff;">
                        <th style="padding:12px;text-align:left;">Protocole</th>
                        <th style="padding:12px;text-align:center;">Chain</th>
                        <th style="padding:12px;text-align:center;">Risque</th>
                        <th style="padding:12px;text-align:center;">APY</th>
                        <th style="padding:12px;text-align:center;">$100 → 1an</th>
                        <th style="padding:12px;text-align:center;">$100 → 10ans</th>
                        <th style="padding:12px;text-align:center;">Score</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const riskColors = {
            1: '#00ff88',
            2: '#4ade80',
            3: '#fbbf24',
            4: '#f97316',
            5: '#ef4444'
        };

        sorted.forEach(p => {
            const avgAPY = (p.apy.min + p.apy.max) / 2;
            const year1 = 100 * (1 + avgAPY / 100);
            const year10 = 100 * Math.pow(1 + avgAPY / 100, 10);
            const color = riskColors[p.risk];

            html += `
                <tr style="border-bottom:1px solid #333;">
                    <td style="padding:12px;">
                        <strong>${p.name}</strong><br>
                        <small style="color:#888;">${p.type}</small>
                    </td>
                    <td style="padding:12px;text-align:center;">
                        <span style="background:#333;padding:2px 8px;border-radius:4px;font-size:12px;">${p.chain}</span>
                    </td>
                    <td style="padding:12px;text-align:center;">
                        <span style="color:${color};font-weight:bold;">${p.risk}/5</span><br>
                        <small style="color:${color};">${p.riskLabel}</small>
                    </td>
                    <td style="padding:12px;text-align:center;color:#00ff88;">
                        ${p.apy.min}-${p.apy.max}%
                    </td>
                    <td style="padding:12px;text-align:center;">$${year1.toFixed(0)}</td>
                    <td style="padding:12px;text-align:center;color:#00ffaa;font-weight:bold;">
                        $${year10 >= 1000 ? (year10/1000).toFixed(1) + 'K' : year10.toFixed(0)}
                    </td>
                    <td style="padding:12px;text-align:center;">
                        <span style="background:linear-gradient(135deg,#00ff88,#00d4aa);color:#000;padding:4px 8px;border-radius:4px;font-weight:bold;">
                            ${p.score.toFixed(1)}
                        </span>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        return html;
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PROTOCOL REGISTRY INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get protocol for any product type (uses ProtocolRegistry)
     */
    getProtocolForProduct(productType, riskLevel = 'Medium') {
        if (typeof ProtocolRegistry !== 'undefined') {
            return ProtocolRegistry.getBestProtocol(productType, riskLevel);
        }
        // Fallback to Aave
        return this.protocols.find(p => p.id === 'aave-usdc');
    },

    /**
     * Get all protocols for a product type
     */
    getProtocolsForProductType(productType) {
        if (typeof ProtocolRegistry !== 'undefined') {
            return ProtocolRegistry.getProtocolsForProduct(productType);
        }
        return this.protocols.filter(p => p.type === productType);
    },

    /**
     * Execute investment for any product
     */
    async investInProduct(productType, productId, amount, riskLevel = 'Medium') {
        console.log(`[DeFiManager] Investing $${amount} in ${productType}/${productId} (risk: ${riskLevel})`);

        // Get best protocol for this product type
        const protocol = this.getProtocolForProduct(productType, riskLevel);

        if (!protocol) {
            return { success: false, error: 'No protocol found for this product type' };
        }

        console.log(`[DeFiManager] Using protocol: ${protocol.name || protocol.id}`);

        // Map to our existing integrations
        const integrationMap = {
            'lending': { integration: 'AaveIntegration', method: 'supplyUSDC' },
            'liquid-staking': { integration: 'AaveIntegration', method: 'supplyUSDC' }, // Fallback
            'dex': { integration: 'AerodromeIntegration', method: 'addLiquidity' },
            'yield-aggregator': { integration: 'GMXIntegration', method: 'buyAndStakeGLP' },
            'perpetuals': { integration: 'GMXIntegration', method: 'buyAndStakeGLP' },
            'options': { integration: 'GMXIntegration', method: 'buyAndStakeGLP' },
            'savings': { integration: 'AaveIntegration', method: 'supplyUSDC' },
            'rwa': { integration: 'AaveIntegration', method: 'supplyUSDC' },
            'insurance': { integration: 'AaveIntegration', method: 'supplyUSDC' },
            'governance': { integration: 'AaveIntegration', method: 'supplyUSDC' },
            'yield-trading': { integration: 'GMXIntegration', method: 'buyAndStakeGLP' },
            'fixed-yield': { integration: 'PendleIntegration', method: 'buyPT' },
            'yield-speculation': { integration: 'PendleIntegration', method: 'buyYT' }
        };

        const integrationInfo = integrationMap[protocol.type] || integrationMap['lending'];
        const integration = window[integrationInfo.integration];

        if (!integration) {
            return {
                success: true,
                simulated: true,
                message: `Simulated investment in ${protocol.name} (${protocol.type})`,
                protocol: protocol.name,
                chain: protocol.chain,
                amount: amount
            };
        }

        try {
            const result = await integration[integrationInfo.method](amount);
            return {
                success: true,
                ...result,
                protocol: protocol.name,
                protocolId: protocol.id,
                chain: protocol.chain
            };
        } catch (err) {
            console.error('[DeFiManager] Investment error:', err);
            return {
                success: false,
                error: err.message,
                protocol: protocol.name
            };
        }
    },

    /**
     * Get summary of all supported protocols
     */
    getProtocolSummary() {
        if (typeof ProtocolRegistry === 'undefined') {
            return {
                totalProtocols: this.protocols.length,
                totalProductTypes: 3,
                totalCombinations: this.protocols.length * 3
            };
        }

        return {
            totalProtocols: ProtocolRegistry.getProtocolCount(),
            totalProductTypes: ProtocolRegistry.getProductTypeCount(),
            totalCombinations: ProtocolRegistry.getTotalCombinations(),
            chains: ['arbitrum', 'base', 'ethereum', 'optimism'],
            types: Object.keys(ProtocolRegistry.productMappings)
        };
    },

    /**
     * Get protocol details for display
     */
    getProtocolDetails(protocolId) {
        // First check our protocols
        let protocol = this.protocols.find(p => p.id === protocolId);

        // Then check ProtocolRegistry
        if (!protocol && typeof ProtocolRegistry !== 'undefined') {
            protocol = ProtocolRegistry.getProtocol(protocolId);
        }

        return protocol;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.DeFiManager = DeFiManager;
}

// Log with registry info
const registryInfo = typeof ProtocolRegistry !== 'undefined'
    ? ` + Registry: ${ProtocolRegistry.getProtocolCount()} protocols, ${ProtocolRegistry.getProductTypeCount()} product types`
    : '';
console.log(`[DeFi Manager] Loaded with ${DeFiManager.protocols.length} direct protocols${registryInfo}`);
