const fs = require('fs');

let app = fs.readFileSync('app.html', 'utf8');

// Add pq-crypto-real.js after post-quantum.js
if (!app.includes('pq-crypto-real.js')) {
    app = app.replace(
        '<script src="js/post-quantum.js"></script>',
        '<script src="js/post-quantum.js"></script>\n    <script src="js/pq-crypto-real.js"></script>'
    );
    fs.writeFileSync('app.html', app);
    console.log('✅ pq-crypto-real.js added to app.html');
} else {
    console.log('ℹ️ pq-crypto-real.js already present');
}
