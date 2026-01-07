const fs = require('fs');

// Read i18n.js
const filePath = 'js/i18n.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add event dispatch after language change
if (!content.includes('languageChanged')) {
    content = content.replace(
        `this.translatePage();

        // Update app state if available`,
        `this.translatePage();

        // Dispatch event for modules to update
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));

        // Re-render dynamic modules
        if (typeof CombosModule !== 'undefined' && CombosModule.render) {
            CombosModule.render();
        }
        if (typeof LeaderboardModule !== 'undefined' && LeaderboardModule.render) {
            LeaderboardModule.render();
        }

        // Update app state if available`
    );

    fs.writeFileSync(filePath, content);
    console.log('✅ i18n.js updated with languageChanged event');
} else {
    console.log('ℹ️ languageChanged event already present');
}
