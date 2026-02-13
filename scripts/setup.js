#!/usr/bin/env node
/**
 * OBELISK - Automated Setup Script
 * Run: node setup.js
 *
 * This script:
 * 1. Checks prerequisites
 * 2. Installs dependencies
 * 3. Creates configuration files
 * 4. Runs database migrations
 * 5. Validates setup
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

// Colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

const log = (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`);
const warn = (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
const error = (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`);
const info = (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`);
const step = (msg) => console.log(`\n${colors.cyan}${colors.bold}▶ ${msg}${colors.reset}`);

// Readline interface for prompts
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const prompt = (question) => new Promise(resolve => rl.question(question, resolve));

// Main setup
async function setup() {
    console.log(`
${colors.cyan}${colors.bold}
   ◈ OBELISK Setup Wizard
   ━━━━━━━━━━━━━━━━━━━━━━
${colors.reset}
`);

    try {
        // 1. Check prerequisites
        step('Checking prerequisites...');
        checkPrerequisites();

        // 2. Get configuration
        step('Configuration');
        const config = await getConfiguration();

        // 3. Install dependencies
        step('Installing dependencies...');
        await installDependencies();

        // 4. Create .env file
        step('Creating configuration files...');
        createEnvFile(config);

        // 5. Update Firebase config
        if (config.firebaseApiKey) {
            updateFirebaseConfig(config);
        }

        // 6. Run database migrations
        step('Setting up database...');
        runMigrations();

        // 7. Update domain in files
        if (config.domain) {
            updateDomain(config.domain);
        }

        // 8. Final validation
        step('Validating setup...');
        validate();

        // Done!
        console.log(`
${colors.green}${colors.bold}
   ✓ Setup Complete!
   ━━━━━━━━━━━━━━━━━
${colors.reset}
${colors.cyan}Next steps:${colors.reset}

1. Start the backend:
   ${colors.yellow}cd obelisk-backend && npm start${colors.reset}

2. Open the frontend:
   ${colors.yellow}Open obelisk-dex/index.html in browser${colors.reset}
   ${colors.yellow}Or: cd obelisk-dex && npx serve .${colors.reset}

3. Deploy to production:
   ${colors.yellow}./deploy.sh setup && ./deploy.sh start${colors.reset}

${colors.cyan}Documentation:${colors.reset}
- README.md - Project overview
- USER_GUIDE.md - User documentation
- SETUP_FIREBASE_CLOUDFLARE.md - Cloud setup
- PRODUCTION_CHECKLIST.md - Deployment checklist

Happy trading! 🚀
`);

    } catch (err) {
        error(`Setup failed: ${err.message}`);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Check prerequisites
function checkPrerequisites() {
    // Node.js version
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (major < 18) {
        throw new Error(`Node.js 18+ required. Current: ${nodeVersion}`);
    }
    log(`Node.js ${nodeVersion}`);

    // npm
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        log(`npm ${npmVersion}`);
    } catch {
        throw new Error('npm not found');
    }

    // Git (optional)
    try {
        execSync('git --version', { encoding: 'utf8' });
        log('Git installed');
    } catch {
        warn('Git not found (optional)');
    }

    // Docker (optional)
    try {
        execSync('docker --version', { encoding: 'utf8' });
        log('Docker installed');
    } catch {
        warn('Docker not found (optional, needed for production)');
    }
}

// Get configuration from user
async function getConfiguration() {
    const config = {};

    console.log('\nPlease provide the following information (press Enter to skip optional fields):\n');

    // Domain
    config.domain = await prompt(`${colors.cyan}Domain${colors.reset} (e.g., obelisk.io): `);
    if (!config.domain) config.domain = 'localhost';

    // Admin API Key
    const generateKey = await prompt(`${colors.cyan}Generate Admin API Key?${colors.reset} [Y/n]: `);
    if (generateKey.toLowerCase() !== 'n') {
        config.adminApiKey = require('crypto').randomBytes(32).toString('hex');
        log(`Generated: ${config.adminApiKey.slice(0, 16)}...`);
    } else {
        config.adminApiKey = await prompt(`${colors.cyan}Admin API Key${colors.reset}: `);
    }

    // Firebase (optional)
    const useFirebase = await prompt(`\n${colors.cyan}Setup Firebase Auth?${colors.reset} [y/N]: `);
    if (useFirebase.toLowerCase() === 'y') {
        config.firebaseApiKey = await prompt(`  ${colors.cyan}Firebase API Key${colors.reset}: `);
        config.firebaseProjectId = await prompt(`  ${colors.cyan}Firebase Project ID${colors.reset}: `);
        config.firebaseAuthDomain = `${config.firebaseProjectId}.firebaseapp.com`;
    }

    // Email (optional)
    const useEmail = await prompt(`\n${colors.cyan}Setup Email Service?${colors.reset} [y/N]: `);
    if (useEmail.toLowerCase() === 'y') {
        config.resendApiKey = await prompt(`  ${colors.cyan}Resend API Key${colors.reset} (or press Enter to skip): `);
        config.emailFrom = await prompt(`  ${colors.cyan}From Email${colors.reset} [noreply@${config.domain}]: `);
        if (!config.emailFrom) config.emailFrom = `noreply@${config.domain}`;
    }

    // Sentry (optional)
    const useSentry = await prompt(`\n${colors.cyan}Setup Sentry Error Tracking?${colors.reset} [y/N]: `);
    if (useSentry.toLowerCase() === 'y') {
        config.sentryDsn = await prompt(`  ${colors.cyan}Sentry DSN${colors.reset}: `);
    }

    return config;
}

// Install dependencies
async function installDependencies() {
    const dirs = ['obelisk-backend', 'obelisk-dex'];

    for (const dir of dirs) {
        const pkgPath = path.join(__dirname, dir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            info(`Installing ${dir} dependencies...`);
            try {
                execSync('npm install', {
                    cwd: path.join(__dirname, dir),
                    stdio: 'inherit'
                });
                log(`${dir} dependencies installed`);
            } catch (err) {
                warn(`${dir} install had warnings (continuing...)`);
            }
        }
    }
}

// Create .env file
function createEnvFile(config) {
    const envPath = path.join(__dirname, 'obelisk-backend', '.env');

    // Don't overwrite existing
    if (fs.existsSync(envPath)) {
        warn('.env already exists, skipping (backup: .env.backup)');
        fs.copyFileSync(envPath, envPath + '.backup');
        return;
    }

    const envContent = `# OBELISK Configuration
# Generated by setup.js on ${new Date().toISOString()}

# Server
PORT=3001
NODE_ENV=development

# Security
ADMIN_API_KEY=${config.adminApiKey || 'change-me'}
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://${config.domain}

# Database
DATABASE_PATH=./obelisk.db

# Firebase
${config.firebaseProjectId ? `FIREBASE_PROJECT_ID=${config.firebaseProjectId}` : '# FIREBASE_PROJECT_ID='}
${config.firebaseApiKey ? `# Frontend config in firebase-auth.js` : ''}

# Email
${config.resendApiKey ? `RESEND_API_KEY=${config.resendApiKey}` : '# RESEND_API_KEY='}
EMAIL_FROM=${config.emailFrom || 'OBELISK <noreply@obelisk.io>'}
APP_URL=https://${config.domain}

# Monitoring
${config.sentryDsn ? `SENTRY_DSN=${config.sentryDsn}` : '# SENTRY_DSN='}
LOG_LEVEL=info
`;

    fs.writeFileSync(envPath, envContent);
    log('.env created');
}

// Update Firebase config in frontend
function updateFirebaseConfig(config) {
    const filePath = path.join(__dirname, 'obelisk-dex', 'js', 'firebase-auth.js');

    if (!fs.existsSync(filePath)) {
        warn('firebase-auth.js not found, skipping');
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    content = content
        .replace(/apiKey: "YOUR_API_KEY"/, `apiKey: "${config.firebaseApiKey}"`)
        .replace(/authDomain: "YOUR_PROJECT.firebaseapp.com"/, `authDomain: "${config.firebaseAuthDomain}"`)
        .replace(/projectId: "YOUR_PROJECT"/, `projectId: "${config.firebaseProjectId}"`)
        .replace(/storageBucket: "YOUR_PROJECT.appspot.com"/, `storageBucket: "${config.firebaseProjectId}.appspot.com"`);

    fs.writeFileSync(filePath, content);
    log('Firebase config updated');
}

// Run database migrations
function runMigrations() {
    const migrationsDir = path.join(__dirname, 'obelisk-backend', 'migrations');
    const dbPath = path.join(__dirname, 'obelisk-backend', 'obelisk.db');

    if (!fs.existsSync(migrationsDir)) {
        warn('No migrations directory found');
        return;
    }

    // Check if sqlite3 is available
    try {
        execSync('sqlite3 --version', { encoding: 'utf8' });
    } catch {
        warn('sqlite3 CLI not found, skipping migrations');
        info('Run manually: sqlite3 obelisk.db < migrations/001_add_firebase_auth.sql');
        return;
    }

    const migrations = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    for (const migration of migrations) {
        const migrationPath = path.join(migrationsDir, migration);
        try {
            execSync(`sqlite3 "${dbPath}" < "${migrationPath}"`, {
                cwd: path.join(__dirname, 'obelisk-backend')
            });
            log(`Migration: ${migration}`);
        } catch (err) {
            warn(`Migration ${migration} failed (may already be applied)`);
        }
    }
}

// Update domain in files
function updateDomain(domain) {
    const files = [
        { path: 'nginx.conf', placeholder: 'obelisk.example.com' },
        { path: 'Caddyfile', placeholder: 'obelisk.example.com' },
        { path: 'obelisk-dex/index.html', placeholder: 'obelisk.io' }
    ];

    for (const file of files) {
        const filePath = path.join(__dirname, file.path);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(file.placeholder)) {
                content = content.replace(new RegExp(file.placeholder, 'g'), domain);
                fs.writeFileSync(filePath, content);
                log(`Updated domain in ${file.path}`);
            }
        }
    }
}

// Validate setup
function validate() {
    const checks = [
        { name: 'Backend package.json', path: 'obelisk-backend/package.json' },
        { name: 'Frontend index.html', path: 'obelisk-dex/index.html' },
        { name: 'Environment config', path: 'obelisk-backend/.env' },
        { name: 'Docker Compose', path: 'docker-compose.yml' },
        { name: 'Deploy script', path: 'deploy.sh' }
    ];

    let allPassed = true;

    for (const check of checks) {
        if (fs.existsSync(path.join(__dirname, check.path))) {
            log(check.name);
        } else {
            warn(`${check.name} not found`);
            allPassed = false;
        }
    }

    if (!allPassed) {
        warn('Some files are missing, but setup can continue');
    }
}

// Run setup
setup().catch(err => {
    error(err.message);
    process.exit(1);
});
