const fs = require('fs');

// Read the app.html file
const filePath = 'app.html';
let content = fs.readFileSync(filePath, 'utf8');

// Add fiat-onramp.js if not already present
if (!content.includes('js/fiat-onramp.js')) {
    content = content.replace(
        '<script src="js/leaderboard.js"></script>',
        '<script src="js/leaderboard.js"></script>\n    <script src="js/fiat-onramp.js"></script>'
    );
    fs.writeFileSync(filePath, content);
    console.log('✅ fiat-onramp.js added to app.html');
} else {
    console.log('ℹ️ fiat-onramp.js already present');
}
