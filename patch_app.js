const fs = require('fs');

// Read the app.html file
const filePath = 'app.html';
let content = fs.readFileSync(filePath, 'utf8');

// Add leaderboard.js if not already present
if (!content.includes('js/leaderboard.js')) {
    content = content.replace(
        '<script src="js/combos.js"></script>',
        '<script src="js/combos.js"></script>\n    <script src="js/leaderboard.js"></script>'
    );
    fs.writeFileSync(filePath, content);
    console.log('✅ leaderboard.js added to app.html');
} else {
    console.log('ℹ️ leaderboard.js already present');
}
