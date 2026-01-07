const fs = require('fs');

let app = fs.readFileSync('app.html', 'utf8');

// 1. Add Investments tab in nav
if (!app.includes('data-tab="investments"')) {
    app = app.replace(
        '<button type="button" class="nav-tab" data-tab="combos">Combos</button>',
        '<button type="button" class="nav-tab" data-tab="combos">Combos</button>\n                    <button type="button" class="nav-tab" data-tab="investments">💰 Invest</button>'
    );
    console.log('✅ Investments tab added to nav');
}

// 2. Add Investments section content
if (!app.includes('id="tab-investments"')) {
    const investmentsSection = `
            <!-- Investments Tab -->
            <section class="tab-content" id="tab-investments">
                <div class="product-guide" id="investments-guide">
                    <div class="product-guide-header" onclick="this.parentElement.classList.toggle('expanded')">
                        <div class="product-guide-title">
                            <span class="icon">💰</span>
                            <span data-i18n="investments">Investment Products</span>
                        </div>
                        <span class="product-guide-toggle">▼</span>
                    </div>
                    <div class="product-guide-content">
                        <p><strong>Staking:</strong> Lock tokens to secure networks and earn rewards</p>
                        <p><strong>Liquidity Pools:</strong> Provide liquidity to earn trading fees</p>
                        <p><strong>Vaults:</strong> Automated yield strategies with auto-compound</p>
                        <p><strong>Lending:</strong> Earn interest by lending your crypto</p>
                        <p><strong>Savings:</strong> Simple interest-bearing accounts</p>
                        <p><strong>Index Funds:</strong> Diversified crypto portfolios</p>
                    </div>
                </div>
                <div id="investments-content"></div>
            </section>
`;

    // Insert before Portfolio tab
    app = app.replace(
        '<!-- Portfolio Tab -->',
        investmentsSection + '\n            <!-- Portfolio Tab -->'
    );
    console.log('✅ Investments section added');
}

// 3. Add investment product scripts
if (!app.includes('investment-products.js')) {
    app = app.replace(
        '<script src="js/combos.js"></script>',
        '<script src="js/combos.js"></script>\n    <script src="js/investment-products.js"></script>\n    <script src="js/investments-ui.js"></script>'
    );
    console.log('✅ Investment scripts added');
}

fs.writeFileSync('app.html', app);
console.log('\\n🎉 Investments feature fully integrated!');
