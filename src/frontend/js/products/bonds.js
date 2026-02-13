/**
 * Obelisk DEX - Tokenized Bonds & Fixed Income Module
 * Version: 2.2.0 - Simulated/Real dual mode with SimulatedPortfolio integration
 *
 * Enables purchase of tokenized bonds including:
 * - US Treasury Bills (T-Bills)
 * - Corporate Bonds
 * - DeFi Fixed Income Products
 * - Money Market Funds
 *
 * Supports both retail and institutional investors.
 * Supports simulated (paper trading) and real (wallet) investments.
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
            minInvestment: 100,  // $100 minimum for retail
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
            minInvestment: 1000,  // $1,000 minimum
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
            minInvestment: 1,  // $1 minimum - very accessible
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
            minInvestment: 500,  // $500 minimum
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
        SafeOps.setStorage('obelisk_bond_positions', this.positions);
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
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // SIMULATED/REAL INVESTMENT INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Get current position for a bond product
     */
    getPosition(productId) {
        let simulated = 0;
        let simulatedEarnings = 0;
        let real = 0;
        let realEarnings = 0;

        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.portfolio?.investments) {
            SimulatedPortfolio.portfolio.investments.forEach(inv => {
                if (inv.productId === productId || inv.productId === 'bond_' + productId) {
                    const earnings = inv.earnings || 0;
                    if (inv.isSimulated !== false) {
                        simulated += inv.amount;
                        simulatedEarnings += earnings;
                    } else {
                        real += inv.amount;
                        realEarnings += earnings;
                    }
                }
            });
        }

        return { simulated, simulatedEarnings, real, realEarnings };
    },

    /**
     * Invest in a bond (simulated or real)
     */
    investInBond(productId, amount, isSimulated = true) {
        const product = this.PRODUCTS[productId];
        if (!product) {
            console.error('[BONDS] Product not found:', productId);
            if (typeof showNotification === 'function') {
                showNotification('Produit non trouve', 'error');
            }
            return { success: false, error: 'Product not found' };
        }

        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Montant invalide', 'error');
            }
            return { success: false, error: 'Invalid amount' };
        }

        // Check minimum investment
        const minAmount = product.minInvestment || 0.1;
        if (amount < minAmount) {
            const msg = `Investissement minimum: $${minAmount.toLocaleString()}`;
            if (typeof showNotification === 'function') {
                showNotification(msg, 'warning');
            }
            return { success: false, error: msg };
        }

        // Use SimulatedPortfolio if available
        if (typeof SimulatedPortfolio !== 'undefined') {
            // Check if real investment and wallet is connected
            if (!isSimulated && !SimulatedPortfolio.checkWalletConnected()) {
                if (typeof showNotification === 'function') {
                    showNotification('Connectez votre wallet pour investir en reel', 'warning');
                }
                SimulatedPortfolio.promptWalletConnect();
                return { success: false, error: 'Wallet not connected' };
            }

            const result = SimulatedPortfolio.invest(
                'bond_' + productId,
                product.name,
                amount,
                product.apy,
                'bonds',
                isSimulated,
                'USDC'
            );

            if (result.success) {
                const typeLabel = isSimulated ? '🎮 SIMULE' : '💎 REEL';
                if (typeof showNotification === 'function') {
                    showNotification(`${typeLabel}: $${amount.toLocaleString()} investi dans ${product.name}`, 'success');
                }
                this.updateBondsSummary();
                this.refreshBondCards();
            } else {
                if (typeof showNotification === 'function') {
                    showNotification(result.error || 'Erreur d\'investissement', 'error');
                }
            }

            return result;
        }

        return { success: false, error: 'Portfolio system not available' };
    },

    /**
     * Withdraw from a bond (simulated or real)
     */
    withdrawFromBond(productId, isSimulated = true) {
        const product = this.PRODUCTS[productId];
        if (!product) {
            if (typeof showNotification === 'function') {
                showNotification('Produit non trouve', 'error');
            }
            return { success: false, error: 'Product not found' };
        }

        if (typeof SimulatedPortfolio === 'undefined') {
            if (typeof showNotification === 'function') {
                showNotification('Portfolio non disponible', 'error');
            }
            return { success: false, error: 'Portfolio not available' };
        }

        // Find investments for this bond
        const investments = SimulatedPortfolio.portfolio?.investments?.filter(
            inv => (inv.productId === productId || inv.productId === 'bond_' + productId) &&
                   inv.isSimulated === isSimulated
        ) || [];

        if (investments.length === 0) {
            if (typeof showNotification === 'function') {
                showNotification('Aucun investissement trouve', 'warning');
            }
            return { success: false, error: 'No investment found' };
        }

        // Calculate total
        const total = investments.reduce((sum, inv) => sum + inv.amount + (inv.earnings || 0), 0);
        const typeLabel = isSimulated ? '🎮 Simule' : '💎 Reel';

        // Confirm withdrawal
        if (!confirm(`Retirer ${typeLabel}: $${total.toFixed(2)} de ${product.name} ?\n\nCela retirera tous vos fonds de cet obligation.`)) {
            return { success: false, error: 'Cancelled by user' };
        }

        // Withdraw each investment
        let withdrawnTotal = 0;
        for (const inv of investments) {
            const result = SimulatedPortfolio.withdraw(inv.id);
            if (result.success) {
                withdrawnTotal += result.amount || (inv.amount + (inv.earnings || 0));
            }
        }

        if (withdrawnTotal > 0) {
            if (typeof showNotification === 'function') {
                showNotification(`${typeLabel}: $${withdrawnTotal.toFixed(2)} retire de ${product.name}`, 'success');
            }
            this.updateBondsSummary();
            this.refreshBondCards();
        }

        return { success: true, amount: withdrawnTotal };
    },

    /**
     * Open invest modal for a bond
     */
    openInvestModal(productId) {
        const product = this.PRODUCTS[productId];
        if (!product) return;

        // Use InvestHelper if available (preferred method)
        if (typeof InvestHelper !== 'undefined') {
            InvestHelper.show({
                name: product.name,
                id: 'bond_' + productId,
                apy: product.apy,
                minInvest: product.minInvestment || 0.1,
                fee: 0.5, // 0.5% fee for bonds
                risk: product.riskLevel === 'low' ? 1 : product.riskLevel === 'medium' ? 3 : 4,
                icon: '📜',
                onInvest: (amount, mode) => {
                    this.investInBond(productId, amount, mode === 'simulated');
                },
                onWithdraw: (amount, mode) => {
                    this.withdrawFromBond(productId, mode === 'simulated');
                }
            });
            return;
        }

        // Fallback to custom modal
        this.showBondInvestModal(productId);
    },

    /**
     * Custom bond investment modal (fallback if InvestHelper not available)
     */
    showBondInvestModal(productId) {
        const product = this.PRODUCTS[productId];
        if (!product) return;

        // Get balances
        const simBalance = (typeof SimulatedPortfolio !== 'undefined') ?
            (SimulatedPortfolio.portfolio?.simulatedBalance || 0) : 0;
        const realBalance = (typeof SimulatedPortfolio !== 'undefined') ?
            (SimulatedPortfolio.portfolio?.realBalance || 0) : 0;

        // Get current position
        const position = this.getPosition(productId);
        const formatBal = (v) => v >= 1000 ? `$${(v/1000).toFixed(1)}K` : `$${v.toFixed(2)}`;

        // Remove existing modal
        const existing = document.getElementById('bond-invest-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'bond-invest-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10001;display:flex;align-items:center;justify-content:center;';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        const ratingClass = product.rating === 'AAA' ? '#22c55e' :
                           product.rating === 'AA' || product.rating === 'A' ? '#84cc16' :
                           product.rating === 'DeFi' ? '#3b82f6' : '#f59e0b';

        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#1a1a2e,#0d0d1a);border:1px solid #333;border-radius:16px;padding:24px;max-width:450px;width:90%;max-height:90vh;overflow-y:auto;">
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <div>
                        <h3 style="color:#fff;margin:0;font-size:1.2rem;">📜 ${product.name}</h3>
                        <p style="color:#888;margin:4px 0 0 0;font-size:0.85rem;">${product.issuer}</p>
                    </div>
                    <button onclick="document.getElementById('bond-invest-modal').remove()" style="background:none;border:none;color:#888;font-size:28px;cursor:pointer;padding:0;line-height:1;">&times;</button>
                </div>

                <!-- Current Position -->
                <div style="display:flex;gap:12px;justify-content:center;margin-bottom:16px;padding:12px;background:rgba(0,0,0,0.3);border-radius:10px;">
                    <div style="text-align:center;">
                        <span style="font-size:1.5em;">🎮</span>
                        <div style="color:#a855f7;font-size:0.75em;">Simule</div>
                        <div style="color:#a855f7;font-weight:bold;">${formatBal(position.simulated)}</div>
                        ${position.simulatedEarnings > 0 ? `<div style="color:#00ff88;font-size:0.7em;">+$${position.simulatedEarnings.toFixed(2)}</div>` : ''}
                    </div>
                    <div style="text-align:center;">
                        <span style="font-size:1.5em;">💎</span>
                        <div style="color:#3b82f6;font-size:0.75em;">Reel</div>
                        <div style="color:#3b82f6;font-weight:bold;">${formatBal(position.real)}</div>
                        ${position.realEarnings > 0 ? `<div style="color:#00ff88;font-size:0.7em;">+$${position.realEarnings.toFixed(2)}</div>` : ''}
                    </div>
                </div>

                <!-- Product Info -->
                <div style="background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:10px;padding:12px;margin-bottom:16px;">
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;font-size:0.85em;">
                        <div>
                            <div style="color:#888;font-size:10px;">APY</div>
                            <div style="color:#00ff88;font-weight:600;">${product.apy}%</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:10px;">Min</div>
                            <div style="color:#fff;font-weight:600;">$${product.minInvestment}</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:10px;">Rating</div>
                            <div style="color:${ratingClass};font-weight:600;">${product.rating}</div>
                        </div>
                        <div>
                            <div style="color:#888;font-size:10px;">Liquidite</div>
                            <div style="color:#fff;font-weight:600;">${product.maturity}</div>
                        </div>
                    </div>
                </div>

                <!-- Amount Input -->
                <div style="margin-bottom:16px;">
                    <label style="color:#888;font-size:12px;display:block;margin-bottom:6px;">Montant (USDC)</label>
                    <input type="number" id="bond-invest-amount" min="${product.minInvestment}" step="1" value="${product.minInvestment}"
                           style="width:100%;padding:12px;background:#0a0a15;border:1px solid #333;border-radius:8px;color:#fff;font-size:16px;box-sizing:border-box;">
                    <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;">
                        <span style="color:#a855f7;">🎮 Simule: ${formatBal(simBalance)}</span>
                        <span style="color:#3b82f6;">💎 Reel: ${formatBal(realBalance)}</span>
                    </div>
                </div>

                <!-- Invest Section -->
                <div style="background:linear-gradient(135deg,rgba(0,212,170,0.1),rgba(0,212,170,0.05));border:1px solid rgba(0,212,170,0.3);border-radius:10px;padding:14px;margin-bottom:12px;">
                    <div style="color:#00d4aa;font-size:0.85em;font-weight:600;text-align:center;margin-bottom:10px;">📥 Investir</div>
                    <div style="display:flex;gap:10px;">
                        <button onclick="BondsModule.executeInvestFromModal('${productId}', true)" style="flex:1;padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">
                            🎮 Investir Simule
                        </button>
                        <button onclick="BondsModule.executeInvestFromModal('${productId}', false)" style="flex:1;padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">
                            💎 Investir Reel
                        </button>
                    </div>
                </div>

                <!-- Withdraw Section -->
                <div style="background:linear-gradient(135deg,rgba(255,159,67,0.1),rgba(255,159,67,0.05));border:1px solid rgba(255,159,67,0.3);border-radius:10px;padding:14px;margin-bottom:16px;">
                    <div style="color:#ff9f43;font-size:0.85em;font-weight:600;text-align:center;margin-bottom:10px;">📤 Retirer</div>
                    <div style="display:flex;gap:10px;">
                        <button onclick="BondsModule.withdrawFromBond('${productId}', true);document.getElementById('bond-invest-modal').remove();"
                                ${position.simulated <= 0 ? 'disabled' : ''}
                                style="flex:1;padding:12px;border-radius:8px;border:1px solid rgba(168,85,247,0.5);background:linear-gradient(135deg,rgba(168,85,247,0.3),rgba(168,85,247,0.2));color:#ddd;font-size:12px;font-weight:600;cursor:pointer;${position.simulated <= 0 ? 'opacity:0.4;cursor:not-allowed;' : ''}">
                            🎮 Retirer Simule ${position.simulated > 0 ? '(' + formatBal(position.simulated) + ')' : '(vide)'}
                        </button>
                        <button onclick="BondsModule.withdrawFromBond('${productId}', false);document.getElementById('bond-invest-modal').remove();"
                                ${position.real <= 0 ? 'disabled' : ''}
                                style="flex:1;padding:12px;border-radius:8px;border:1px solid rgba(59,130,246,0.5);background:linear-gradient(135deg,rgba(59,130,246,0.3),rgba(59,130,246,0.2));color:#ddd;font-size:12px;font-weight:600;cursor:pointer;${position.real <= 0 ? 'opacity:0.4;cursor:not-allowed;' : ''}">
                            💎 Retirer Reel ${position.real > 0 ? '(' + formatBal(position.real) + ')' : '(vide)'}
                        </button>
                    </div>
                </div>

                <!-- Cancel Button -->
                <button onclick="document.getElementById('bond-invest-modal').remove()" style="width:100%;padding:12px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#aaa;cursor:pointer;font-size:14px;">Annuler</button>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Execute invest from modal
     */
    executeInvestFromModal(productId, isSimulated) {
        const amountInput = document.getElementById('bond-invest-amount');
        const amount = parseFloat(amountInput?.value) || 0;

        const result = this.investInBond(productId, amount, isSimulated);
        if (result.success) {
            document.getElementById('bond-invest-modal')?.remove();
        }
    },

    /**
     * Update bonds summary in the UI
     */
    updateBondsSummary() {
        let totalSim = 0;
        let totalReal = 0;
        let yieldSim = 0;
        let yieldReal = 0;

        // Calculate totals from all bond investments
        if (typeof SimulatedPortfolio !== 'undefined' && SimulatedPortfolio.portfolio?.investments) {
            SimulatedPortfolio.portfolio.investments.forEach(inv => {
                if (inv.productId?.startsWith('bond_') || inv.category === 'bonds') {
                    const earnings = inv.earnings || 0;
                    if (inv.isSimulated !== false) {
                        totalSim += inv.amount;
                        yieldSim += earnings;
                    } else {
                        totalReal += inv.amount;
                        yieldReal += earnings;
                    }
                }
            });
        }

        // Also check BondsModule positions
        Object.keys(this.PRODUCTS).forEach(productId => {
            const pos = this.getPosition(productId);
            // Already counted in SimulatedPortfolio above
        });

        // Update UI elements
        const elTotalSim = document.getElementById('bonds-total-sim');
        const elTotalReal = document.getElementById('bonds-total-real');
        const elYieldSim = document.getElementById('bonds-yield-sim');
        const elYieldReal = document.getElementById('bonds-yield-real');

        if (elTotalSim) elTotalSim.textContent = '$' + totalSim.toFixed(2);
        if (elTotalReal) elTotalReal.textContent = '$' + totalReal.toFixed(2);
        if (elYieldSim) {
            elYieldSim.textContent = (yieldSim >= 0 ? '+' : '') + '$' + yieldSim.toFixed(2);
            elYieldSim.className = 'stat-value ' + (yieldSim >= 0 ? 'positive' : 'negative');
        }
        if (elYieldReal) {
            elYieldReal.textContent = (yieldReal >= 0 ? '+' : '') + '$' + yieldReal.toFixed(2);
            elYieldReal.className = 'stat-value ' + (yieldReal >= 0 ? 'positive' : 'negative');
        }

        // Calculate average APY
        const totalInvested = totalSim + totalReal;
        if (totalInvested > 0) {
            let weightedApy = 0;
            Object.keys(this.PRODUCTS).forEach(productId => {
                const pos = this.getPosition(productId);
                const product = this.PRODUCTS[productId];
                const totalPos = pos.simulated + pos.real;
                if (totalPos > 0 && product) {
                    weightedApy += (totalPos / totalInvested) * product.apy;
                }
            });
            const elAvgApy = document.getElementById('bonds-avg-apy');
            if (elAvgApy) elAvgApy.textContent = weightedApy.toFixed(2) + '%';
        }

        // Legacy elements
        const elTotal = document.getElementById('bonds-total');
        const elYield = document.getElementById('bonds-yield');
        if (elTotal) elTotal.textContent = '$' + (totalSim + totalReal).toFixed(2);
        if (elYield) elYield.textContent = '+$' + (yieldSim + yieldReal).toFixed(2);
    },

    /**
     * Refresh bond cards to show invested badges
     */
    refreshBondCards() {
        const grid = document.getElementById('bonds-grid');
        if (!grid) return;

        // Update each bond card with position badge
        Object.keys(this.PRODUCTS).forEach(productId => {
            const card = grid.querySelector(`[data-product="${productId}"]`);
            if (!card) return;

            const position = this.getPosition(productId);
            const hasPosition = position.simulated > 0 || position.real > 0;

            // Remove existing badge
            const existingBadge = card.querySelector('.bond-invested-badge');
            if (existingBadge) existingBadge.remove();

            // Add new badge if has position
            if (hasPosition) {
                const formatBal = (v) => v >= 1000 ? `$${(v/1000).toFixed(1)}K` : `$${v.toFixed(0)}`;
                let badgeHTML = '<div class="bond-invested-badge" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">';

                if (position.simulated > 0) {
                    badgeHTML += `
                        <div style="background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.4);padding:4px 8px;border-radius:6px;font-size:11px;color:#a855f7;">
                            🎮 ${formatBal(position.simulated)}
                            ${position.simulatedEarnings > 0 ? `<span style="color:#00ff88;margin-left:4px;">+$${position.simulatedEarnings.toFixed(2)}</span>` : ''}
                        </div>`;
                }

                if (position.real > 0) {
                    badgeHTML += `
                        <div style="background:rgba(59,130,246,0.2);border:1px solid rgba(59,130,246,0.4);padding:4px 8px;border-radius:6px;font-size:11px;color:#3b82f6;">
                            💎 ${formatBal(position.real)}
                            ${position.realEarnings > 0 ? `<span style="color:#00ff88;margin-left:4px;">+$${position.realEarnings.toFixed(2)}</span>` : ''}
                        </div>`;
                }

                badgeHTML += '</div>';

                // Insert badge at the beginning of the card
                const header = card.querySelector('.bond-header');
                if (header) {
                    header.insertAdjacentHTML('beforebegin', badgeHTML);
                }
            }
        });
    },

    /**
     * Initialize bonds UI with click handlers
     */
    initBondsUI() {
        // Update summary
        this.updateBondsSummary();

        // Refresh cards with invested badges
        this.refreshBondCards();

        // Add click handlers to all invest buttons
        document.querySelectorAll('.bonds-grid .btn-invest').forEach(btn => {
            const productId = btn.dataset.product;
            if (productId) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    this.openInvestModal(productId);
                };
            }
        });

        console.log('📜 Bonds UI initialized with Simulated/Real dual mode');
    }
};

// Export
window.BondsModule = BondsModule;

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BondsModule.initBondsUI());
} else {
    setTimeout(() => BondsModule.initBondsUI(), 100);
}
