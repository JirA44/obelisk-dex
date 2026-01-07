const fs = require('fs');

// Read combos.js
const filePath = 'js/combos.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add buy with card button to the invest modal preview
if (!content.includes('FiatOnRamp')) {
    // Add a "Buy with Card" option in the modal - update the executeInvest method
    content = content.replace(
        `async executeInvest() {`,
        `// Open buy with card modal
    openBuyWithCard() {
        if (!this.selectedCombo) return;
        const amountInput = document.getElementById('comboInvestAmount');
        const amount = parseFloat(amountInput?.value) || 0;

        if (typeof FiatOnRamp !== 'undefined') {
            FiatOnRamp.showModal(amount);
        } else {
            alert('Module de paiement non disponible');
        }
    },

    async executeInvest() {`
    );

    // Update the modal content to include buy with card button
    // We need to add it to updatePreview function, after the allocation details
    content = content.replace(
        `</details>
        \`;
    },

    async executeInvest()`,
        `</details>

            <!-- Buy with Card Option -->
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid #333;">
                <button onclick="CombosModule.openBuyWithCard()" style="
                    width: 100%;
                    padding: 14px;
                    border-radius: 10px;
                    border: 1px solid #4a9eff;
                    background: linear-gradient(135deg, rgba(74,158,255,0.15), rgba(74,158,255,0.05));
                    color: #4a9eff;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(74,158,255,0.25)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(74,158,255,0.15), rgba(74,158,255,0.05))'">
                    💳 Acheter USDC par Carte Bancaire
                </button>
                <p style="text-align:center;color:#666;font-size:0.75rem;margin-top:8px;">
                    Visa, Mastercard, Apple Pay • Frais ~2.9%
                </p>
            </div>
        \`;
    },

    async executeInvest()`
    );

    fs.writeFileSync(filePath, content);
    console.log('✅ combos.js updated with fiat on-ramp integration');
} else {
    console.log('ℹ️ Fiat on-ramp already integrated');
}
