const fs = require('fs');

let app = fs.readFileSync('app.html', 'utf8');

// Update speed slider to allow very slow speeds
app = app.replace(
    /id="anim-speed" min="[0-9.]+" max="[0-9.]+" step="[0-9.]+"/,
    'id="anim-speed" min="0.05" max="2" step="0.05"'
);

fs.writeFileSync('app.html', app);
console.log('✅ Speed slider updated: 0.05x to 2x');
