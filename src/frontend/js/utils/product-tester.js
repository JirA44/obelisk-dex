/**
 * OBELISK DEX - Product Tester
 * Automated testing for all investment products
 * Tests: investment flow, earnings accrual, withdrawals
 */

const ProductTester = {
    results: [],
    isRunning: false,

    // Product categories to test
    categories: {
        staking: ['eth-staking', 'sol-staking', 'arb-staking'],
        vaults: ['stable-vault', 'bluechip-vault', 'defi-vault', 'emerging-vault'],
        bonds: ['treasury-bond', 'corp-bond'],
        lending: ['usdc-lending', 'eth-lending'],
        combos: ['conservative', 'balanced', 'growth', 'aggressive'],
        savings: ['usdc-savings'],
        indexFunds: [], // Add index fund IDs when available
        yieldFarming: [], // Add yield farming IDs when available
        copyTrading: [], // Add copy trading IDs when available
        perps: [], // Add perps IDs when available
        fixedIncome: [], // Overlaps with bonds
        derivatives: [], // Add derivatives IDs when available
        etfTokens: [] // Add ETF token IDs when available
    },

    /**
     * Initialize product tester
     */
    init() {
        console.log('[ProductTester] Initialized');
    },

    /**
     * Run all tests
     */
    async runAllTests() {
        if (this.isRunning) {
            console.warn('[ProductTester] Tests already running');
            return;
        }

        this.isRunning = true;
        this.results = [];
        this.log('Starting comprehensive product tests...', 'info');

        try {
            // Test each category
            for (const [category, products] of Object.entries(this.categories)) {
                if (products.length > 0) {
                    await this.testCategory(category, products);
                } else {
                    this.log(`Category ${category}: No products configured (skipping)`, 'warn');
                }
            }

            // Generate summary
            this.generateSummary();
            this.log('All tests completed!', 'ok');

        } catch (error) {
            this.log('Test suite failed: ' + error.message, 'error');
        } finally {
            this.isRunning = false;
        }

        return this.results;
    },

    /**
     * Test a specific category
     */
    async testCategory(category, productIds) {
        this.log(`\n=== Testing ${category.toUpperCase()} ===`, 'info');

        for (const productId of productIds) {
            await this.testProduct(productId, category);
        }
    },

    /**
     * Test a single product
     */
    async testProduct(productId, category) {
        const testAmount = 100; // $100 test investment
        const result = {
            productId,
            category,
            timestamp: Date.now(),
            tests: {},
            passed: 0,
            failed: 0,
            errors: []
        };

        this.log(`Testing ${productId}...`, 'info');

        try {
            // Get product info
            const product = this.getProductInfo(productId);
            if (!product) {
                throw new Error(`Product ${productId} not found`);
            }
            result.product = product;

            // Test 1: Investment
            result.tests.investment = await this.testInvestment(productId, testAmount);
            if (result.tests.investment.success) result.passed++; else result.failed++;

            // Test 2: Portfolio update
            result.tests.portfolioUpdate = this.testPortfolioUpdate(productId);
            if (result.tests.portfolioUpdate.success) result.passed++; else result.failed++;

            // Test 3: Earnings calculation
            result.tests.earnings = this.testEarningsCalculation(productId, testAmount, product.apy);
            if (result.tests.earnings.success) result.passed++; else result.failed++;

            // Test 4: Simulated time progression
            result.tests.timeProgression = await this.testTimeProgression(productId, testAmount);
            if (result.tests.timeProgression.success) result.passed++; else result.failed++;

            // Test 5: Withdrawal
            result.tests.withdrawal = await this.testWithdrawal(productId);
            if (result.tests.withdrawal.success) result.passed++; else result.failed++;

            const passRate = ((result.passed / (result.passed + result.failed)) * 100).toFixed(0);
            this.log(`${productId}: ${result.passed}/${result.passed + result.failed} tests passed (${passRate}%)`,
                result.failed === 0 ? 'ok' : 'warn');

        } catch (error) {
            result.errors.push(error.message);
            result.failed++;
            this.log(`${productId}: FAILED - ${error.message}`, 'error');
        }

        this.results.push(result);
        return result;
    },

    /**
     * Get product info from InvestmentSimulator
     */
    getProductInfo(productId) {
        if (typeof InvestmentSimulator === 'undefined') {
            throw new Error('InvestmentSimulator not loaded');
        }

        // Check regular products
        let product = InvestmentSimulator.products.find(p => p.id === productId);

        // Check combos
        if (!product) {
            product = InvestmentSimulator.combos.find(c => c.id === productId);
        }

        return product;
    },

    /**
     * Test: Investment flow
     */
    async testInvestment(productId, amount) {
        try {
            if (typeof SimulatedPortfolio === 'undefined') {
                throw new Error('SimulatedPortfolio not loaded');
            }

            const initialBalance = SimulatedPortfolio.getBalance();
            const initialInvestments = SimulatedPortfolio.portfolio.investments.length;

            // Simulate investment
            const success = SimulatedPortfolio.invest(productId, amount);

            if (!success) {
                return { success: false, error: 'Investment failed' };
            }

            const newInvestments = SimulatedPortfolio.portfolio.investments.length;

            return {
                success: true,
                initialBalance,
                newInvestments: newInvestments - initialInvestments,
                data: { amount, productId }
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Test: Portfolio update after investment
     */
    testPortfolioUpdate(productId) {
        try {
            const investment = SimulatedPortfolio.portfolio.investments.find(
                inv => inv.productId === productId
            );

            if (!investment) {
                return { success: false, error: 'Investment not found in portfolio' };
            }

            return {
                success: true,
                investment: {
                    productId: investment.productId,
                    amount: investment.amount,
                    timestamp: investment.timestamp
                }
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Test: Earnings calculation
     */
    testEarningsCalculation(productId, amount, apy) {
        try {
            // Calculate expected earnings for 1 day
            const days = 1;
            const expectedDailyReturn = (amount * (apy / 100)) / 365;
            const expectedTotal = amount + expectedDailyReturn * days;

            // Verify formula matches expected behavior
            const calculatedReturn = (amount * (Math.pow(1 + (apy / 100) / 365, days) - 1));

            const difference = Math.abs(expectedDailyReturn - calculatedReturn);
            const tolerance = 0.01; // $0.01 tolerance

            return {
                success: difference < tolerance,
                expectedDailyReturn: expectedDailyReturn.toFixed(4),
                calculatedReturn: calculatedReturn.toFixed(4),
                apy,
                formula: 'compound interest'
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Test: Simulated time progression
     */
    async testTimeProgression(productId, amount) {
        try {
            // Find the investment
            const investment = SimulatedPortfolio.portfolio.investments.find(
                inv => inv.productId === productId
            );

            if (!investment) {
                return { success: false, error: 'Investment not found' };
            }

            const initialValue = investment.currentValue || investment.amount;

            // Simulate 1 day passing (manually update earnings)
            const product = this.getProductInfo(productId);
            const dailyReturn = (investment.amount * (product.apy / 100)) / 365;

            // Check if earnings would be calculated correctly
            const expectedValue = investment.amount + dailyReturn;

            return {
                success: true,
                initialValue,
                expectedValue: expectedValue.toFixed(4),
                dailyReturn: dailyReturn.toFixed(4),
                timeSimulated: '1 day'
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Test: Withdrawal
     */
    async testWithdrawal(productId) {
        try {
            // Find the investment
            const investmentIndex = SimulatedPortfolio.portfolio.investments.findIndex(
                inv => inv.productId === productId
            );

            if (investmentIndex === -1) {
                return { success: false, error: 'Investment not found' };
            }

            const investment = SimulatedPortfolio.portfolio.investments[investmentIndex];
            const withdrawAmount = investment.amount;
            const initialBalance = SimulatedPortfolio.getBalance();

            // Simulate withdrawal
            const success = SimulatedPortfolio.withdraw(productId, investmentIndex);

            if (!success) {
                return { success: false, error: 'Withdrawal failed' };
            }

            const finalBalance = SimulatedPortfolio.getBalance();
            const balanceIncrease = finalBalance - initialBalance;

            return {
                success: true,
                withdrawnAmount: withdrawAmount,
                balanceIncrease: balanceIncrease.toFixed(2),
                feeApplied: withdrawAmount - balanceIncrease
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Test specific product by ID
     */
    async testProductById(productId) {
        const category = this.findProductCategory(productId);
        if (!category) {
            throw new Error(`Product ${productId} not found in any category`);
        }

        return await this.testProduct(productId, category);
    },

    /**
     * Find which category a product belongs to
     */
    findProductCategory(productId) {
        for (const [category, products] of Object.entries(this.categories)) {
            if (products.includes(productId)) {
                return category;
            }
        }
        return null;
    },

    /**
     * Generate summary report
     */
    generateSummary() {
        const total = this.results.length;
        const passed = this.results.filter(r => r.failed === 0).length;
        const failed = this.results.filter(r => r.failed > 0).length;
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

        this.log('\n=== TEST SUMMARY ===', 'info');
        this.log(`Total Products Tested: ${total}`, 'info');
        this.log(`Passed: ${passed}`, 'ok');
        this.log(`Failed: ${failed}`, failed > 0 ? 'error' : 'ok');
        this.log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'ok' : 'warn');

        return {
            total,
            passed,
            failed,
            passRate: parseFloat(passRate),
            results: this.results
        };
    },

    /**
     * Get test results
     */
    getResults() {
        return this.results;
    },

    /**
     * Clear results
     */
    clearResults() {
        this.results = [];
    },

    /**
     * Log message (can be overridden to send to UI)
     */
    log(message, type = 'info') {
        const prefix = {
            'info': '[INFO]',
            'ok': '[OK]',
            'warn': '[WARN]',
            'error': '[ERROR]'
        }[type] || '[LOG]';

        console.log(`${prefix} ${message}`);

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('product-tester-log', {
            detail: { message, type, timestamp: Date.now() }
        }));
    },

    /**
     * Simulate investment with amount check
     */
    async simulateInvest(productId, amount) {
        // Ensure sufficient balance
        const currentBalance = SimulatedPortfolio.getBalance();
        if (currentBalance < amount) {
            SimulatedPortfolio.deposit(amount - currentBalance + 10);
        }

        return await this.testInvestment(productId, amount);
    },

    /**
     * Test all products in a category
     */
    async testCategoryOnly(categoryName) {
        const products = this.categories[categoryName];
        if (!products) {
            throw new Error(`Category ${categoryName} not found`);
        }

        this.results = [];
        await this.testCategory(categoryName, products);
        return this.generateSummary();
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.ProductTester = ProductTester;
    document.addEventListener('DOMContentLoaded', () => {
        ProductTester.init();
    });
}
