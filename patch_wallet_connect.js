const fs = require('fs');

// Add wallet-connect.js to app.html
let app = fs.readFileSync('app.html', 'utf8');

if (!app.includes('wallet-connect.js')) {
    app = app.replace(
        '<script src="js/wallet.js"></script>',
        '<script src="js/wallet.js"></script>\n    <script src="js/wallet-connect.js"></script>'
    );

    // Update connect button to use WalletConnect
    app = app.replace(
        /class="btn-connect"([^>]*)>([^<]*)</g,
        'class="btn-connect" id="btn-connect" onclick="WalletConnect.showModal()"$1>$2<'
    );

    fs.writeFileSync('app.html', app);
    console.log('✅ wallet-connect.js added to app.html');
    console.log('✅ Connect button updated to use WalletConnect');
} else {
    console.log('ℹ️ wallet-connect.js already present');
}
