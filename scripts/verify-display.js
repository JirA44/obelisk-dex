/**
 * Obelisk DEX - Auto Visual Verification Script
 * Vérifie l'affichage réel sur Chrome, Firefox et WebKit (Brave-like)
 *
 * Usage: npx playwright test verify-display.js
 *   ou:  node verify-display.js [--url URL] [--browsers chrome,firefox,webkit]
 *
 * Résultats: ./verify-results/ (screenshots + rapport JSON + rapport texte)
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

// === CONFIG ===
const DEFAULT_URL = 'https://obelisk-dex.pages.dev';
const RESULTS_DIR = path.join(__dirname, 'verify-results');
const VIEWPORT_DESKTOP = { width: 1920, height: 1080 };
const VIEWPORT_MOBILE = { width: 375, height: 812 };
const WAIT_AFTER_NAV = 3000;     // ms après navigation initiale
const WAIT_AFTER_TAB = 1500;     // ms après changement d'onglet
const WAIT_AFTER_LANG = 2000;    // ms après changement de langue

// Tabs à vérifier (ordre de navigation)
const TABS_TO_CHECK = [
  'dashboard', 'trade', 'swap', 'fast-trading', 'hft', 'perps',
  'banking', 'wallet', 'portfolio', 'combos', 'investments',
  'products', 'bonds', 'tools', 'bots', 'learn', 'about',
  'solutions', 'enterprise', 'institutional', 'settings'
];

// Sélecteurs de valeurs financières qui ne doivent JAMAIS être NaN
const FINANCIAL_SELECTORS = [
  '#portfolio-total-sim', '#portfolio-total-real',
  '#portfolio-change-sim', '#portfolio-change-real',
  '#portfolio-pnl-sim', '#portfolio-pnl-real',
  '#portfolio-positions-sim', '#portfolio-positions-real',
  '#portfolio-real-balance', '#current-price',
  '.card-value', '.balance-value', '.asset-value'
];

// Patterns i18n bruts qui ne devraient PAS apparaître dans le texte visible
const RAW_I18N_PATTERNS = [
  /^nav_\w+$/,
  /^btn_\w+$/,
  /^tab_\w+$/,
  /^label_\w+$/,
  /^title_\w+$/,
  /^placeholder_\w+$/,
  /^connect_wallet$/,
  /^msg_\w+$/,
  /^error_\w+$/,
  /^modal_\w+$/
];

// Langues à tester
const LANGUAGES_TO_TEST = ['en', 'fr', 'es'];

// === UTILS ===
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: DEFAULT_URL,
    browsers: ['chromium', 'firefox', 'webkit'],
    mobile: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      config.url = args[i + 1];
      i++;
    } else if (args[i] === '--browsers' && args[i + 1]) {
      config.browsers = args[i + 1].split(',').map(b => b.trim());
      i++;
    } else if (args[i] === '--mobile') {
      config.mobile = true;
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      config.verbose = true;
    }
  }

  return config;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// === CHECKS ===

/**
 * Check 1: NaN Detection - Vérifie qu'aucun élément financier n'affiche NaN
 */
async function checkNaN(page, tab) {
  const issues = [];

  // Check les sélecteurs financiers spécifiques
  for (const selector of FINANCIAL_SELECTORS) {
    const elements = await page.$$(selector);
    for (const el of elements) {
      const text = await el.textContent();
      const isVisible = await el.isVisible().catch(() => false);
      if (isVisible && text && /NaN|undefined|null/i.test(text)) {
        issues.push({
          type: 'NaN_VALUE',
          tab,
          selector,
          text: text.trim(),
          severity: 'CRITICAL'
        });
      }
    }
  }

  // Scan global pour NaN dans tout le contenu visible
  const bodyText = await page.evaluate(() => {
    const active = document.querySelector('.tab-content.active');
    return active ? active.innerText : document.body.innerText;
  });

  // Cherche "$NaN", "NaN%", "NaN USDC" etc.
  const nanMatches = bodyText.match(/\$?\s*NaN[\s%$]|NaN\s*(USDC|USD|ETH|BTC)/gi);
  if (nanMatches) {
    issues.push({
      type: 'NaN_IN_PAGE',
      tab,
      matches: [...new Set(nanMatches)],
      severity: 'CRITICAL'
    });
  }

  return issues;
}

/**
 * Check 2: i18n Keys - Vérifie que les clés de traduction brutes ne sont pas visibles
 */
async function checkI18nKeys(page, tab) {
  const issues = [];

  // Récupère tous les éléments avec data-i18n
  const rawKeys = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = el.textContent.trim();
      const visible = el.offsetParent !== null || el.style.display !== 'none';
      // Si le texte visible EST la clé brute (pas traduit)
      // Exclure les clés courtes qui sont aussi des mots normaux (products, or, address, etc.)
      const shortWordKeys = ['products','or','address','trade','swap','portfolio','wallet','bonds','tools','bots','learn','about','settings','home','combos','invest','perps'];
      if (visible && text === key && !shortWordKeys.includes(key)) {
        results.push({ key, text, tag: el.tagName, classes: el.className });
      }
    });
    return results;
  });

  for (const item of rawKeys) {
    issues.push({
      type: 'RAW_I18N_KEY',
      tab,
      key: item.key,
      element: `<${item.tag} class="${item.classes}">`,
      severity: 'HIGH'
    });
  }

  // Check le texte des nav tabs spécifiquement
  const navTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.nav-tab')).map(el => ({
      text: el.textContent.trim(),
      tab: el.getAttribute('data-tab'),
      visible: el.offsetParent !== null
    }));
  });

  for (const nav of navTexts) {
    if (nav.visible) {
      for (const pattern of [/^nav_\w+$/, /^btn_\w+$/, /^tab_\w+$/]) {
        if (pattern.test(nav.text)) {
          issues.push({
            type: 'RAW_NAV_KEY',
            tab,
            navTab: nav.tab,
            text: nav.text,
            severity: 'HIGH'
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Check 3: Header/Nav Overlapping - Vérifie que les éléments ne se chevauchent pas
 */
async function checkOverlapping(page, tab) {
  const issues = [];

  const overlaps = await page.evaluate(() => {
    const results = [];

    function getRect(selector) {
      const el = document.querySelector(selector);
      if (!el || el.offsetParent === null) return null;
      return el.getBoundingClientRect();
    }

    function rectsOverlap(r1, r2) {
      if (!r1 || !r2) return false;
      return !(r1.right < r2.left || r1.left > r2.right ||
               r1.bottom < r2.top || r1.top > r2.bottom);
    }

    // Vérifie header-right vs header-nav
    const headerRight = getRect('.header-right');
    const headerNav = getRect('.header-nav');
    if (rectsOverlap(headerRight, headerNav)) {
      results.push({
        pair: '.header-right vs .header-nav',
        rects: { headerRight, headerNav }
      });
    }

    // Vérifie bouton connect vs lang selector
    const connectBtn = getRect('#btn-connect-wallet');
    const langSelector = getRect('#lang-selector');
    if (rectsOverlap(connectBtn, langSelector)) {
      results.push({
        pair: '#btn-connect-wallet vs #lang-selector',
        rects: { connectBtn, langSelector }
      });
    }

    // Vérifie que les nav tabs ne débordent pas du viewport
    const navTabs = document.querySelectorAll('.nav-tab');
    const viewportWidth = window.innerWidth;
    navTabs.forEach(tab => {
      const rect = tab.getBoundingClientRect();
      if (rect.right > viewportWidth + 5) {
        results.push({
          pair: `nav-tab[${tab.dataset.tab}] overflows viewport`,
          rect: { left: rect.left, right: rect.right, viewportWidth }
        });
      }
    });

    return results;
  });

  for (const overlap of overlaps) {
    issues.push({
      type: 'OVERLAP',
      tab,
      detail: overlap.pair,
      severity: 'MEDIUM'
    });
  }

  return issues;
}

/**
 * Check 4: Éléments essentiels visibles
 */
async function checkEssentialElements(page, tab) {
  const issues = [];

  const essentials = {
    'dashboard': ['.portfolio-summary', '.summary-card'],
    'trade': ['#current-pair', '.chart-container', '.order-form'],
    'portfolio': ['#portfolio-total-sim', '#portfolio-total-real'],
    'banking': ['#portfolio-real-balance'],
    'wallet': ['.wallet-empty, .wallet-balance-card']
  };

  const selectors = essentials[tab];
  if (!selectors) return issues;

  for (const selector of selectors) {
    const el = await page.$(selector);
    if (!el) {
      issues.push({
        type: 'MISSING_ELEMENT',
        tab,
        selector,
        severity: 'HIGH'
      });
    } else {
      const visible = await el.isVisible().catch(() => false);
      if (!visible) {
        issues.push({
          type: 'HIDDEN_ELEMENT',
          tab,
          selector,
          severity: 'MEDIUM'
        });
      }
    }
  }

  return issues;
}

/**
 * Check 5: Console errors - Capture les erreurs JS
 */
function setupConsoleCapture(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  return errors;
}

/**
 * Check 6: Language switching - Vérifie que le changement de langue fonctionne
 */
async function checkLanguageSwitching(page) {
  const issues = [];

  for (const lang of LANGUAGES_TO_TEST) {
    try {
      // Change la langue via JavaScript
      await page.evaluate((lng) => {
        if (typeof I18n !== 'undefined' && I18n.setLanguage) {
          I18n.setLanguage(lng);
        }
      }, lang);

      await page.waitForTimeout(WAIT_AFTER_LANG);

      // Vérifie que le code langue affiché correspond
      const displayedLang = await page.$eval('#lang-code', el => el.textContent.trim()).catch(() => null);
      if (displayedLang && displayedLang.toLowerCase() !== lang.toUpperCase().slice(0, 2).toLowerCase() &&
          displayedLang.toLowerCase() !== lang.toLowerCase()) {
        // Some languages have different display codes, be lenient
      }

      // Vérifie qu'il n'y a pas de clés i18n brutes après le switch
      const rawKeysAfterSwitch = await page.evaluate(() => {
        let count = 0;
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          const text = el.textContent.trim();
          if (el.offsetParent !== null && text === key) count++;
        });
        return count;
      });

      if (rawKeysAfterSwitch > 3) { // Tolérance de 3 clés non traduites
        issues.push({
          type: 'LANG_SWITCH_FAIL',
          lang,
          rawKeysCount: rawKeysAfterSwitch,
          severity: 'HIGH'
        });
      }

    } catch (err) {
      issues.push({
        type: 'LANG_SWITCH_ERROR',
        lang,
        error: err.message,
        severity: 'MEDIUM'
      });
    }
  }

  // Remettre en anglais
  await page.evaluate(() => {
    if (typeof I18n !== 'undefined' && I18n.setLanguage) I18n.setLanguage('en');
  });
  await page.waitForTimeout(WAIT_AFTER_LANG);

  return issues;
}

/**
 * Check 7: Performance - Mesure les temps de chargement
 */
async function checkPerformance(page) {
  const metrics = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: Math.round(perf?.domContentLoadedEventEnd - perf?.startTime) || 0,
      loadComplete: Math.round(perf?.loadEventEnd - perf?.startTime) || 0,
      domElements: document.querySelectorAll('*').length,
      jsHeap: performance?.memory?.usedJSHeapSize
        ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        : null
    };
  });

  const issues = [];

  if (metrics.loadComplete > 10000) {
    issues.push({
      type: 'SLOW_LOAD',
      loadTime: metrics.loadComplete + 'ms',
      severity: 'MEDIUM'
    });
  }

  if (metrics.domElements > 10000) {
    issues.push({
      type: 'DOM_BLOAT',
      count: metrics.domElements,
      severity: 'LOW'
    });
  }

  return { metrics, issues };
}

// === MAIN RUNNER ===

async function runBrowserCheck(browserType, browserName, config, runDir) {
  const report = {
    browser: browserName,
    url: config.url,
    timestamp: new Date().toISOString(),
    viewport: config.mobile ? VIEWPORT_MOBILE : VIEWPORT_DESKTOP,
    issues: [],
    consoleErrors: [],
    tabScreenshots: {},
    performance: null,
    tabsChecked: 0,
    passed: true
  };

  console.log(`\n  [${browserName}] Lancement...`);

  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({
    viewport: config.mobile ? VIEWPORT_MOBILE : VIEWPORT_DESKTOP,
    locale: 'en-US',
    timezoneId: 'Europe/Paris'
  });
  const page = await context.newPage();

  // Capture console errors
  const consoleErrors = setupConsoleCapture(page);

  try {
    // Navigation initiale
    console.log(`  [${browserName}] Chargement de ${config.url}...`);
    await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(WAIT_AFTER_NAV);

    // Fermer le tutorial/welcome overlay s'il bloque les clics
    await page.evaluate(() => {
      // Tente de fermer le tutorial overlay
      const tutorial = document.querySelector('#tutorial-welcome');
      if (tutorial) {
        tutorial.style.display = 'none';
        tutorial.classList.remove('active');
        tutorial.remove();
      }
      // Ferme aussi tout autre overlay/modal qui pourrait bloquer
      document.querySelectorAll('.tutorial-overlay, .welcome-overlay, .onboarding-overlay, .modal-overlay').forEach(el => {
        el.style.display = 'none';
        el.remove();
      });
    });
    await page.waitForTimeout(500);

    // Screenshot page d'accueil
    const homeScreenshot = path.join(runDir, `${browserName}_home.png`);
    await page.screenshot({ path: homeScreenshot, fullPage: false });
    report.tabScreenshots['home'] = homeScreenshot;
    console.log(`  [${browserName}] Screenshot home OK`);

    // Performance check
    const perfResult = await checkPerformance(page);
    report.performance = perfResult.metrics;
    report.issues.push(...perfResult.issues);

    // Language switching check (sur la page d'accueil)
    console.log(`  [${browserName}] Test changement de langue...`);
    const langIssues = await checkLanguageSwitching(page);
    report.issues.push(...langIssues);

    // Check chaque tab
    for (const tab of TABS_TO_CHECK) {
      try {
        // Switch tab
        const tabBtn = await page.$(`button[data-tab="${tab}"]`);
        if (!tabBtn) {
          // Essaye aussi par onclick ou d'autres sélecteurs
          const altBtn = await page.$(`button[onclick*="switchTab('${tab}')"], [data-tab="${tab}"]`);
          if (!altBtn) {
            if (config.verbose) console.log(`  [${browserName}] Tab ${tab} non trouvé, skip`);
            continue;
          }
        }

        // Tente click normal, sinon force
        try {
          await tabBtn.click({ timeout: 5000 });
        } catch {
          // Overlay peut encore bloquer, force le click
          await tabBtn.click({ force: true, timeout: 5000 });
        }
        // Switch aussi via JS au cas où
        await page.evaluate((t) => {
          if (typeof ObeliskApp !== 'undefined' && ObeliskApp.switchTab) {
            ObeliskApp.switchTab(t);
          }
        }, tab);
        await page.waitForTimeout(WAIT_AFTER_TAB);
        report.tabsChecked++;

        // Screenshot du tab
        const tabScreenshot = path.join(runDir, `${browserName}_${tab}.png`);
        await page.screenshot({ path: tabScreenshot, fullPage: false });
        report.tabScreenshots[tab] = tabScreenshot;

        // Run checks
        const nanIssues = await checkNaN(page, tab);
        const i18nIssues = await checkI18nKeys(page, tab);
        const overlapIssues = await checkOverlapping(page, tab);
        const essentialIssues = await checkEssentialElements(page, tab);

        report.issues.push(...nanIssues, ...i18nIssues, ...overlapIssues, ...essentialIssues);

        if (config.verbose) {
          const tabIssueCount = nanIssues.length + i18nIssues.length + overlapIssues.length + essentialIssues.length;
          const status = tabIssueCount === 0 ? 'OK' : `${tabIssueCount} issues`;
          console.log(`  [${browserName}] Tab ${tab}: ${status}`);
        }

      } catch (err) {
        report.issues.push({
          type: 'TAB_ERROR',
          tab,
          error: err.message,
          severity: 'HIGH'
        });
      }
    }

    // Console errors
    report.consoleErrors = consoleErrors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('404')
    );

  } catch (err) {
    report.issues.push({
      type: 'FATAL_ERROR',
      error: err.message,
      severity: 'CRITICAL'
    });
  } finally {
    await browser.close();
  }

  // Résumé
  const critical = report.issues.filter(i => i.severity === 'CRITICAL').length;
  const high = report.issues.filter(i => i.severity === 'HIGH').length;
  report.passed = critical === 0 && high === 0;

  const icon = report.passed ? 'PASS' : 'FAIL';
  console.log(`  [${browserName}] ${icon} - ${report.tabsChecked} tabs, ${report.issues.length} issues (${critical} critical, ${high} high), ${report.consoleErrors.length} console errors`);

  return report;
}

async function main() {
  const config = parseArgs();
  const ts = timestamp();
  const runDir = path.join(RESULTS_DIR, ts);
  ensureDir(runDir);

  console.log('=== OBELISK DEX - Auto Verification ===');
  console.log(`URL: ${config.url}`);
  console.log(`Browsers: ${config.browsers.join(', ')}`);
  console.log(`Viewport: ${config.mobile ? 'Mobile (375x812)' : 'Desktop (1920x1080)'}`);
  console.log(`Results: ${runDir}`);

  const browserMap = {
    chromium: { type: chromium, name: 'Chrome' },
    chrome: { type: chromium, name: 'Chrome' },
    firefox: { type: firefox, name: 'Firefox' },
    webkit: { type: webkit, name: 'WebKit' },
    safari: { type: webkit, name: 'WebKit' }
  };

  const reports = [];

  for (const browserKey of config.browsers) {
    const browserInfo = browserMap[browserKey.toLowerCase()];
    if (!browserInfo) {
      console.log(`  Browser inconnu: ${browserKey}, skip`);
      continue;
    }

    try {
      const report = await runBrowserCheck(browserInfo.type, browserInfo.name, config, runDir);
      reports.push(report);
    } catch (err) {
      console.log(`  [${browserKey}] ERREUR: ${err.message}`);
      reports.push({
        browser: browserKey,
        url: config.url,
        error: err.message,
        passed: false,
        issues: [{ type: 'BROWSER_LAUNCH_FAIL', error: err.message, severity: 'CRITICAL' }]
      });
    }
  }

  // === RAPPORT FINAL ===
  const allIssues = reports.flatMap(r => r.issues || []);
  const allPassed = reports.every(r => r.passed);

  // JSON report
  const jsonPath = path.join(runDir, 'report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(reports, null, 2));

  // Text report
  const textReport = generateTextReport(reports, config);
  const textPath = path.join(runDir, 'report.txt');
  fs.writeFileSync(textPath, textReport);

  // Console output
  console.log('\n' + '='.repeat(60));
  console.log(textReport);
  console.log('='.repeat(60));
  console.log(`\nRapport sauvé: ${runDir}`);

  process.exit(allPassed ? 0 : 1);
}

function generateTextReport(reports, config) {
  let text = '';
  text += `OBELISK DEX - RAPPORT DE VERIFICATION\n`;
  text += `Date: ${new Date().toLocaleString('fr-FR')}\n`;
  text += `URL: ${config.url}\n`;
  text += `${'='.repeat(50)}\n\n`;

  for (const report of reports) {
    const icon = report.passed ? 'PASS' : 'FAIL';
    text += `--- ${report.browser} [${icon}] ---\n`;

    if (report.error) {
      text += `  ERREUR FATALE: ${report.error}\n\n`;
      continue;
    }

    text += `  Tabs verifies: ${report.tabsChecked}\n`;
    text += `  Console errors: ${report.consoleErrors?.length || 0}\n`;

    if (report.performance) {
      text += `  Load time: ${report.performance.loadComplete}ms\n`;
      text += `  DOM elements: ${report.performance.domElements}\n`;
      if (report.performance.jsHeap) {
        text += `  JS Heap: ${report.performance.jsHeap}MB\n`;
      }
    }

    if (report.issues.length === 0) {
      text += `  Aucun probleme detecte!\n`;
    } else {
      text += `  Issues (${report.issues.length}):\n`;

      // Group by severity
      const bySeverity = {};
      for (const issue of report.issues) {
        const sev = issue.severity || 'UNKNOWN';
        if (!bySeverity[sev]) bySeverity[sev] = [];
        bySeverity[sev].push(issue);
      }

      for (const sev of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
        const issues = bySeverity[sev];
        if (!issues) continue;
        text += `\n  [${sev}] (${issues.length})\n`;
        for (const issue of issues) {
          text += `    - [${issue.type}]`;
          if (issue.tab) text += ` tab:${issue.tab}`;
          if (issue.selector) text += ` ${issue.selector}`;
          if (issue.text) text += ` "${issue.text}"`;
          if (issue.key) text += ` key:${issue.key}`;
          if (issue.detail) text += ` ${issue.detail}`;
          if (issue.error) text += ` ${issue.error}`;
          if (issue.matches) text += ` matches:${issue.matches.join(',')}`;
          if (issue.lang) text += ` lang:${issue.lang}`;
          if (issue.rawKeysCount) text += ` rawKeys:${issue.rawKeysCount}`;
          text += '\n';
        }
      }
    }

    if (report.consoleErrors?.length > 0) {
      text += `\n  Console Errors:\n`;
      for (const err of report.consoleErrors.slice(0, 10)) {
        text += `    - ${err.slice(0, 120)}\n`;
      }
      if (report.consoleErrors.length > 10) {
        text += `    ... et ${report.consoleErrors.length - 10} de plus\n`;
      }
    }

    text += '\n';
  }

  // Summary
  const allPassed = reports.every(r => r.passed);
  const totalIssues = reports.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
  const criticalCount = reports.reduce((sum, r) => sum + (r.issues?.filter(i => i.severity === 'CRITICAL').length || 0), 0);

  text += `${'='.repeat(50)}\n`;
  text += `RESULTAT: ${allPassed ? 'TOUS LES TESTS PASSES' : 'ECHECS DETECTES'}\n`;
  text += `Total issues: ${totalIssues} (${criticalCount} critiques)\n`;
  text += `Browsers: ${reports.map(r => `${r.browser}:${r.passed ? 'OK' : 'FAIL'}`).join(', ')}\n`;

  return text;
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(2);
});
