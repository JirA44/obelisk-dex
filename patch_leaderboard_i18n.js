const fs = require('fs');

// Read leaderboard.js
const filePath = 'js/leaderboard.js';
let content = fs.readFileSync(filePath, 'utf8');

// Helper function for translations
const t = (key, fallback) => `\${(typeof I18n !== 'undefined' ? I18n.t('${key}') : '${fallback}')}`;

// Replace hardcoded strings with i18n
const replacements = [
    // Title
    [`<h3 style="color:#fff;margin:0;font-size:1.3rem;">🏆 Top Traders Live</h3>`,
     `<h3 style="color:#fff;margin:0;font-size:1.3rem;">🏆 ${t('top_traders_live', 'Top Traders Live')}</h3>`],

    // Subtitle
    [`<p style="color:#888;margin:4px 0 0 0;font-size:0.85rem;">Classement en temps réel</p>`,
     `<p style="color:#888;margin:4px 0 0 0;font-size:0.85rem;">${t('live_ranking', 'Classement en temps réel')}</p>`],

    // Live badge
    [`<span style="color:#00ff88;font-size:0.85rem;">LIVE</span>`,
     `<span style="color:#00ff88;font-size:0.85rem;">${t('live', 'LIVE')}</span>`],

    // Table headers
    [`<th style="padding:10px 5px;">Trader</th>`,
     `<th style="padding:10px 5px;">${t('trader', 'Trader')}</th>`],
    [`<th style="padding:10px 5px;text-align:right;">PnL 24h</th>`,
     `<th style="padding:10px 5px;text-align:right;">${t('pnl_24h', 'PnL 24h')}</th>`],
    [`<th style="padding:10px 5px;text-align:right;">Win Rate</th>`,
     `<th style="padding:10px 5px;text-align:right;">${t('win_rate', 'Win Rate')}</th>`],
    [`<th style="padding:10px 5px;text-align:right;">Volume</th>`,
     `<th style="padding:10px 5px;text-align:right;">${t('volume', 'Volume')}</th>`],
    [`<th style="padding:10px 5px;text-align:center;">Streak</th>`,
     `<th style="padding:10px 5px;text-align:center;">${t('streak', 'Streak')}</th>`],
    [`<th style="padding:10px 5px;text-align:right;">Status</th>`,
     `<th style="padding:10px 5px;text-align:right;">${t('status', 'Status')}</th>`],

    // Trade count
    [` trades</div>`,
     ` ${t('trades', 'trades')}</div>`],

    // Live status in row
    [`Live
                        </span>`,
     `${t('live', 'Live')}
                        </span>`]
];

// Apply all replacements
let changes = 0;
replacements.forEach(([from, to]) => {
    if (content.includes(from)) {
        content = content.replace(from, to);
        changes++;
    }
});

fs.writeFileSync(filePath, content);
console.log(`✅ leaderboard.js updated with i18n support (${changes} changes)`);
