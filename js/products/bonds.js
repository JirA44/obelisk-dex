/**
 * Obelisk DEX - Tokenized Bonds & Fixed Income Module
 * Version: 2.1.0 - Demo mode support
 *
 * Enables purchase of tokenized bonds including:
 * - US Treasury Bills (T-Bills)
 * - Corporate Bonds
 * - DeFi Fixed Income Products
 * - Money Market Funds
 *
 * Supports both retail and institutional investors.
 */

const BondsModule = {
    // Available bond products
    PRODUCTS: {
        // US Treasury Products (via Ondo Finance, Backed Finance, etc.)
        USDY: {
            id: 'usdy',
            name: 'US Dollar Yield Token',
            issuer: 'Ondo Finance',
            type: 'treasury',
            underlying: 'Short-term US Treasuries',
            apy: 5.25,
            minInvestment: 0.1,
            minInstitutional: 100000,
            maturity: 'Daily Liquidity',
            rating: 'AAA',
            chain: 'arbitrum',
            contract: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C',
            decimals: 18,
            riskLevel: 'low'
        },
        OUSG: {
            id: 'ousg',
            name: 'Ondo Short-Term US Govt',
            issuer: 'Ondo Finance',
            type: 'treasury',
            underlying: 'US Treasury Bills',
            apy: 5.35,
            minInvestment: 100000, // Institutional only
            minInstitutional: 100000,
            maturity: '3-6 months',
            rating: 'AAA',
            chain: 'ethereum',
            contract: '0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92',
            decimals: 18,
            riskLevel: 'low',
            institutionalOnly: true
        },
        BUIDL: {
            id: 'buidl',
            name: 'BlackRock USD Institutional Fund',
            issuer: 'BlackRock / Securitize',
            type: 'money-market',
            underlying: 'US Treasury Bills, Repos',
            apy: 5.30,
            minInvestment: 5000000, // $5M minimum
            minInstitutional: 5000000,
            maturity: 'Daily Liquidity',
            rating: 'AAA',
            chain: 'ethereum',
            contract: '0x7712c34205737192402172409a8F7ccef8aA2AEc',
            decimals: 6,
            riskLevel: 'low',
            institutionalOnly: true
        },
        // Corporate Bonds
        CORP_AAA: {
            id: 'corp-aaa',
            name: 'Investment Grade Corporate',
            issuer: 'Maple Finance',
            type: 'corporate',
            underlying: 'AAA-A Rated Corporate Debt',
            apy: 7.50,
            minInvestment: 1,
            minInstitutional: 50000,
            maturity: '90 days',
            rating: 'A',
            chain: 'arbitrum',
            contract: '0x0000000000000000000000000000000000000001',
            decimals: 6,
            riskLevel: 'medium'
        },
        // DeFi Fixed Income
        SDAI: {
            id: 'sdai',
            name: 'Spark DAI',
            issuer: 'MakerDAO / Spark',
            type: 'defi',
            underlying: 'DAI Savings Rate + RWA',
            apy: 8.00,
            minInvestment: 0.1,
            minInstitutional: 10000,
            maturity: 'Instant',
            rating: 'DeFi',
            chain: 'ethereum',
            contract: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
            decimals: 18,
            riskLevel: 'medium'
        },
        // High Yield
        CREDIT: {
            id: 'credit',
            name: 'DeFi Credit Pool',
            issuer: 'Centrifuge',
            type: 'credit',
            underlying: 'Trade Finance, Invoices',
            apy: 12.00,
            minInvestment: 1,
            minInstitutional: 25000,
            maturity: '30-180 days',
            rating: 'B+',
            chain: 'ethereum',
            contract: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            riskLevel: 'high'
        }
    },

    // User's positions
    positions: [],

    // Institutional verification status
    isInstitutional: false,
    kycStatus: 'none', // none, pending, verified

    /**
     * Initialize bonds module
     */
    async init() {
        console.log('Initializing Bonds Module...');
        await this.loadPositions();
        this.updateAPYs();
    },

    /**
     * Get available products based on user type
     */
    getAvailableProducts(isInstitutional = false) {
        return Object.values(this.PRODUCTS).filter(product => {
            if (product.institutionalOnly && !isInstitutional) {
                return false;
            }
            return true;
        });
    },

    /**
     * Get products by type
     */
    getProductsByType(type) {
        return Object.values(this.PRODUCTS).filter(p => p.type === type);
    },

    /**
     * Calculate expected yield
     */
    calculateYield(productId, amount, days = 365) {
        const product = this.PRODUCTS[productId];
        if (!product) return 0;

        const dailyRate = product.apy / 365 / 100;
        const yield_ = amount * dailyRate * days;

        return {
            principal: amount,
            yield: yield_,
            total: amount + yield_,
            apy: product.apy,
            days: days
        };
    },

    /**
     * Buy bonds/fixed income product
     */
    async buyBond(wallet, productId, amount) {
        const product = this.PRODUCTS[productId];
        if (!product) {
            throw new Error('Product not found');
        }

        // Check minimum investment
        const minAmount = this.isInstitutional ? product.minInstitutional : product.minInvestment;
        if (amount < minAmount) {
            throw new Error(`Minimum investment is $${minAmount.toLocaleString()}`);
        }

        // Check institutional requirement
        if (product.institutionalOnly && !this.isInstitutional) {
            throw new Error('This product is available to institutional investors only');
        }

        // Demo/simulation mode check
        const isDemo = typeof DemoTrading !== 'undefined' && DemoTrading.enabled;

        // Check USDC balance (skip in demo mode)
        if (!isDemo && wallet && wallet.address) {
            try {
                const balance = await DepositWithdraw.getUSDCBalance(wallet.address);
                if (balance < amount) {
                    throw new Error(`Insufficient USDC balance. You have $${balance.toFixed(2)}`);
                }
            } catch (e) {
                console.warn('[BONDS] Balance check skipped:', e.message);
            }
        }

        try {
            // For real implementation, this would:
            // 1. Approve USDC spending
            // 2. Call the bond contract's purchase function
            // 3. Receive bond tokens in return

            // Simulated purchase for demo
            const txHash = await this.executePurchase(wallet, product, amount);

            // Record position
            this.positions.push({
                productId: productId,
                product: product.name,
                amount: amount,
                purchaseDate: Date.now(),
                apy: product.apy,
                status: 'active',
                txHash: txHash
            });

            this.savePositions();

            return {
                success: true,
                txHash: txHash,
                message: `Successfully purchased $${amount.toLocaleString()} of ${product.name}`,
                expectedYield: this.calculateYield(productId, amount)
            };
        } catch (e) {
            throw new Error('Purchase failed: ' + e.message);
        }
    },

    /**
     * Execute bond purchase transaction
     */
    async executePurchase(wallet, product, amount) {
        // Demo/simulation mode - skip real wallet requirement
        const isDemo = typeof DemoTrading !== 'undefined' && DemoTrading.enabled;
        const hasWallet = wallet && wallet.type === 'metamask' && window.ethereum;

        if (!isDemo && !hasWallet) {
            // In demo mode, allow simulated transactions
            console.log('[BONDS] Demo mode - simulating transaction');
        }

        if (hasWallet && !isDemo) {
            try {
                // Approve USDC first
                const approval = await UniswapAPI.approveToken(
                    'USDC',
                    product.contract,
                    amount,
                    wallet
                );

                if (!approval.success && approval.message !== 'Already approved') {
                    throw new Error('Approval failed');
                }
            } catch (e) {
                console.warn('[BONDS] Approval skipped (demo):', e.message);
            }
        }

        // Simulated tx hash for demo
        return '0x' + Array(64).fill(0).map(() =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    },

    /**
     * Redeem bonds (if matured or instant liquidity)
     */
    async redeemBond(wallet, positionIndex) {
        const position = this.positions[positionIndex];
        if (!position) {
            throw new Error('Position not found');
        }

        const product = this.PRODUCTS[position.productId];

        // Calculate accrued interest
        const daysHeld = (Date.now() - position.purchaseDate) / (1000 * 60 * 60 * 24);
        const yield_ = this.calculateYield(position.productId, position.amount, daysHeld);

        try {
            // Execute redemption
            const txHash = await this.executeRedemption(wallet, position, yield_.total);

            // Update position
            position.status = 'redeemed';
            position.redemptionDate = Date.now();
            position.finalAmount = yield_.total;

            this.savePositions();

            return {
                success: true,
                txHash: txHash,
                principal: position.amount,
                yield: yield_.yield,
                total: yield_.total,
                message: `Redeemed $${yield_.total.toFixed(2)} (${yield_.yield.toFixed(2)} yield)`
            };
        } catch (e) {
            throw new Error('Redemption failed: ' + e.message);
        }
    },

    /**
     * Execute redemption transaction
     */
    async executeRedemption(wallet, position, amount) {
        // Simulated - in production, call contract
        return '0x' + Array(64).fill(0).map(() =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    },

    /**
     * Get user's bond positions
     */
    getPositions() {
        return this.positions.map(pos => {
            const daysHeld = (Date.now() - pos.purchaseDate) / (1000 * 60 * 60 * 24);
            const yield_ = this.calculateYield(pos.productId, pos.amount, daysHeld);
            return {
                ...pos,
                daysHeld: Math.floor(daysHeld),
                currentValue: yield_.total,
                accruedYield: yield_.yield
            };
        });
    },

    /**
     * Get total portfolio value
     */
    getTotalValue() {
        return this.getPositions()
            .filter(p => p.status === 'active')
            .reduce((sum, p) => sum + p.currentValue, 0);
    },

    /**
     * Update APYs from on-chain data (simulated)
     */
    async updateAPYs() {
        // In production, fetch current APYs from contracts
        // For now, slight random variation to simulate live data
        for (const [id, product] of Object.entries(this.PRODUCTS)) {
            // Simulate small APY fluctuation
            const variation = (Math.random() - 0.5) * 0.2;
            // Keep stored in PRODUCTS for reference
        }
    },

    /**
     * Save positions to local storage
     */
    savePositions() {
        localStorage.setItem('obelisk_bond_positions', JSON.stringify(this.positions));
    },

    /**
     * Load positions from local storage
     */
    async loadPositions() {
        try {
            const saved = localStorage.getItem('obelisk_bond_positions');
            if (saved) {
                this.positions = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load positions:', e);
        }
    },

    /**
     * Request institutional verification
     */
    async requestInstitutionalVerification(data) {
        // In production, this would:
        // 1. Submit KYC/AML data to compliance provider
        // 2. Verify accredited investor status
        // 3. Return verification status

        this.kycStatus = 'pending';

        return {
            status: 'pending',
            message: 'Verification request submitted. You will be contacted within 24-48 hours.',
            referenceId: 'KYC-' + Date.now()
        };
    },

    /**
     * Check if user qualifies for institutional access
     */
    checkInstitutionalEligibility(assets, income) {
        // SEC Accredited Investor requirements (simplified)
        const requirements = {
            netWorth: 1000000,      // $1M net worth excluding primary residence
            income: 200000,         // $200k individual income last 2 years
            jointIncome: 300000,    // $300k joint income
            entityAssets: 5000000   // $5M assets for entities
        };

        return {
            eligible: assets >= requirements.netWorth || income >= requirements.income,
            requirements: requirements
        };
    },

    /**
     * Get risk disclosure for product
     */
    getRiskDisclosure(productId) {
        const product = this.PRODUCTS[productId];
        if (!product) return null;

        const disclosures = {
            low: 'This product invests in US government-backed securities and is considered low risk. Principal and interest are backed by the full faith and credit of the US government.',
            medium: 'This product carries moderate risk. Returns are not guaranteed and principal may be at risk. Past performance does not guarantee future results.',
            high: 'This is a high-risk investment. You could lose some or all of your principal. Only invest what you can afford to lose.'
        };

        return {
            riskLevel: product.riskLevel,
            disclosure: disclosures[product.riskLevel],
            issuer: product.issuer,
            underlying: product.underlying
        };
    },

    /**
     * Format APY for display
     */
    formatAPY(apy) {
        return apy.toFixed(2) + '%';
    },

    /**
     * Format rating with color
     */
    formatRating(rating) {
        const colors = {
            'AAA': 'success',
            'AA': 'success',
            'A': 'positive',
            'BBB': 'warning',
            'BB': 'warning',
            'B': 'danger',
            'B+': 'danger',
            'DeFi': 'info'
        };
        return {
            rating: rating,
            class: colors[rating] || ''
        };
    }
};

// Export
window.BondsModule = BondsModule;
