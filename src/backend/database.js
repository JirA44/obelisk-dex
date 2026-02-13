/**
 * OBELISK Database Module
 * Persistance SQLite pour données réelles
 */

const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Cloud Run: use /tmp (writable) or local path
const isCloudRun = process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT;
const DB_DIR = isCloudRun ? '/tmp' : __dirname;
const DB_PATH = path.join(DB_DIR, 'obelisk.db');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

class ObeliskDB {
    constructor() {
        this.db = new Database(DB_PATH);
        this.db.pragma('journal_mode = WAL'); // Meilleure performance
        this.initTables();
    }

    initTables() {
        // Users - authentifiés par wallet
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                wallet_address TEXT UNIQUE NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                last_login INTEGER,
                nonce TEXT,
                credit_score INTEGER DEFAULT 500,
                total_volume REAL DEFAULT 0,
                is_verified INTEGER DEFAULT 0
            )
        `);

        // Balances par token
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS balances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                token TEXT NOT NULL,
                amount REAL DEFAULT 0,
                locked REAL DEFAULT 0,
                updated_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(user_id, token)
            )
        `);

        // Dépôts/Retraits
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS deposits (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                token TEXT NOT NULL,
                amount REAL NOT NULL,
                tx_hash TEXT,
                status TEXT DEFAULT 'pending',
                type TEXT NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                confirmed_at INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Prêts
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS loans (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                collateral_token TEXT NOT NULL,
                collateral_amount REAL NOT NULL,
                borrow_token TEXT NOT NULL,
                borrow_amount REAL NOT NULL,
                interest_rate REAL NOT NULL,
                total_due REAL NOT NULL,
                repaid REAL DEFAULT 0,
                status TEXT DEFAULT 'active',
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                due_date INTEGER NOT NULL,
                liquidated_at INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Trades
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS trades (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                pair TEXT NOT NULL,
                side TEXT NOT NULL,
                amount REAL NOT NULL,
                price REAL NOT NULL,
                total REAL NOT NULL,
                fee REAL DEFAULT 0,
                status TEXT DEFAULT 'filled',
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Ordres ouverts
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                pair TEXT NOT NULL,
                side TEXT NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                price REAL,
                filled REAL DEFAULT 0,
                status TEXT DEFAULT 'open',
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                updated_at INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Micro-investissements
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS micro_investments (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                strategy TEXT NOT NULL,
                token TEXT NOT NULL,
                amount REAL NOT NULL,
                entry_price REAL NOT NULL,
                current_value REAL NOT NULL,
                apy REAL NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Liquidations (historique)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS liquidations (
                id TEXT PRIMARY KEY,
                loan_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                seized_amount REAL NOT NULL,
                seized_token TEXT NOT NULL,
                returned_amount REAL DEFAULT 0,
                fee_amount REAL NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (loan_id) REFERENCES loans(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Sessions (pour auth)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // ==================== SECURITY TABLES ====================

        // Security events - track suspicious activity
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS security_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                ip_address TEXT,
                wallet_address TEXT,
                user_id TEXT,
                severity TEXT DEFAULT 'low',
                details TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // Security blocks - IP and wallet bans
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS security_blocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                block_type TEXT NOT NULL,
                value TEXT NOT NULL,
                reason TEXT,
                blocked_until INTEGER,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                UNIQUE(block_type, value)
            )
        `);

        // ==================== MULTI-WALLET TABLES ====================

        // Linked wallets per user account
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS linked_wallets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                wallet_address TEXT NOT NULL,
                label TEXT,
                is_primary INTEGER DEFAULT 0,
                is_watch_only INTEGER DEFAULT 0,
                balance_snapshot TEXT,
                last_activity INTEGER,
                linked_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(user_id, wallet_address)
            )
        `);

        // Wallet audit log
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS wallet_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                wallet_address TEXT NOT NULL,
                action TEXT NOT NULL,
                ip_address TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // ==================== 2FA TABLES ====================

        // 2FA challenges for sensitive operations
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS twofa_challenges (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                verified INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // ==================== SIMULATED TRADERS TABLES ====================

        // Simulated traders (100k procedurally generated)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS simulated_traders (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                avatar TEXT,
                style TEXT NOT NULL,
                bio TEXT,
                risk_per_trade REAL DEFAULT 1.0,
                target_rr REAL DEFAULT 2.0,
                win_rate REAL DEFAULT 50.0,
                total_trades INTEGER DEFAULT 0,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                total_pnl REAL DEFAULT 0,
                generation_seed INTEGER,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // Simulated trades history
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS simulated_trades (
                id TEXT PRIMARY KEY,
                trader_id TEXT NOT NULL,
                symbol TEXT NOT NULL,
                direction TEXT NOT NULL,
                entry_price REAL NOT NULL,
                exit_price REAL,
                size REAL NOT NULL,
                pnl_usd REAL DEFAULT 0,
                pnl_percent REAL DEFAULT 0,
                status TEXT DEFAULT 'open',
                reason TEXT,
                opened_at INTEGER DEFAULT (strftime('%s', 'now')),
                closed_at INTEGER,
                FOREIGN KEY (trader_id) REFERENCES simulated_traders(id)
            )
        `);

        // ==================== INSTITUTIONAL TABLES ====================

        // Organizations
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS organizations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                owner_id TEXT NOT NULL,
                tier TEXT DEFAULT 'starter',
                max_members INTEGER DEFAULT 5,
                total_capital_limit REAL DEFAULT 50000,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (owner_id) REFERENCES users(id)
            )
        `);

        // Organization members
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS org_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                org_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                role TEXT DEFAULT 'viewer',
                position_limit INTEGER DEFAULT 10,
                capital_allocation REAL DEFAULT 0,
                daily_loss_limit REAL DEFAULT 0,
                joined_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (org_id) REFERENCES organizations(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(org_id, user_id)
            )
        `);

        // Organization invites
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS org_invites (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                wallet_address TEXT NOT NULL,
                role TEXT DEFAULT 'viewer',
                invited_by TEXT,
                status TEXT DEFAULT 'pending',
                expires_at INTEGER,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (org_id) REFERENCES organizations(id)
            )
        `);

        // Webhooks
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS webhooks (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                org_id TEXT,
                url TEXT NOT NULL,
                secret TEXT NOT NULL,
                events TEXT DEFAULT '[]',
                pnl_threshold REAL,
                is_active INTEGER DEFAULT 1,
                fail_count INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // API usage log
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS api_usage_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                api_key_prefix TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                method TEXT NOT NULL,
                status_code INTEGER,
                response_time_ms INTEGER,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // Audit trail
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS audit_trail (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                org_id TEXT,
                action TEXT NOT NULL,
                resource_type TEXT,
                resource_id TEXT,
                details TEXT DEFAULT '{}',
                ip_address TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // Capital allocations
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS capital_allocations (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                strategy TEXT NOT NULL,
                allocated_amount REAL DEFAULT 0,
                current_value REAL DEFAULT 0,
                pnl REAL DEFAULT 0,
                last_updated INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (org_id) REFERENCES organizations(id)
            )
        `);

        // DCA schedules
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS dca_schedules (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                token TEXT NOT NULL,
                amount_per_interval REAL NOT NULL,
                interval_seconds INTEGER NOT NULL,
                next_execution INTEGER,
                total_invested REAL DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (org_id) REFERENCES organizations(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Budget limits
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS budget_limits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                org_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                daily_limit REAL DEFAULT 0,
                weekly_limit REAL DEFAULT 0,
                monthly_limit REAL DEFAULT 0,
                spent_today REAL DEFAULT 0,
                spent_week REAL DEFAULT 0,
                spent_month REAL DEFAULT 0,
                FOREIGN KEY (org_id) REFERENCES organizations(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(org_id, user_id)
            )
        `);

        // ==================== COMPLIANCE & ANTI-CRIME TABLES ====================

        // Compliance risk scores per user
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS compliance_scores (
                user_id TEXT PRIMARY KEY,
                risk_score INTEGER DEFAULT 0,
                last_updated INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Compliance alerts (suspicious transactions)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS compliance_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                alert_type TEXT NOT NULL,
                flags TEXT DEFAULT '[]',
                context TEXT DEFAULT '{}',
                severity TEXT DEFAULT 'low',
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Flagged accounts (criminal / delinquent)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS flagged_accounts (
                user_id TEXT PRIMARY KEY,
                flagged_by TEXT,
                reason TEXT,
                status TEXT DEFAULT 'under_review',
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                updated_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Investigation dossiers
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS compliance_dossiers (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                risk_score INTEGER DEFAULT 0,
                status TEXT DEFAULT 'open',
                notes TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                updated_at INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Blacklisted wallet addresses (criminal/sanctioned)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS blacklisted_addresses (
                address TEXT PRIMARY KEY,
                reason TEXT,
                source TEXT,
                added_by TEXT,
                added_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // SOS emergency alerts (no FK - must work for anonymous users)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sos_alerts (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                latitude REAL,
                longitude REAL,
                message TEXT,
                ip_address TEXT,
                status TEXT DEFAULT 'active',
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // SOS GPS tracking points
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sos_gps_track (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sos_id TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                accuracy REAL,
                speed REAL,
                heading REAL,
                altitude REAL,
                is_moving INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (sos_id) REFERENCES sos_alerts(id)
            )
        `);

        // Index pour performance
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_balances_user ON balances(user_id);
            CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
            CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
            CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
            CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
            CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
            CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);
            CREATE INDEX IF NOT EXISTS idx_security_blocks_type ON security_blocks(block_type, value);
            CREATE INDEX IF NOT EXISTS idx_linked_wallets_user ON linked_wallets(user_id);
            CREATE INDEX IF NOT EXISTS idx_wallet_audit_user ON wallet_audit(user_id);
            CREATE INDEX IF NOT EXISTS idx_simulated_traders_style ON simulated_traders(style);
            CREATE INDEX IF NOT EXISTS idx_simulated_trades_trader ON simulated_trades(trader_id);
            CREATE INDEX IF NOT EXISTS idx_simulated_trades_status ON simulated_trades(status);
            CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members(org_id);
            CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);
            CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
            CREATE INDEX IF NOT EXISTS idx_audit_trail_org ON audit_trail(org_id);
            CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON audit_trail(action);
            CREATE INDEX IF NOT EXISTS idx_api_usage_log_key ON api_usage_log(api_key_prefix);
            CREATE INDEX IF NOT EXISTS idx_capital_allocations_org ON capital_allocations(org_id);
            CREATE INDEX IF NOT EXISTS idx_dca_schedules_next ON dca_schedules(next_execution);
            CREATE INDEX IF NOT EXISTS idx_compliance_alerts_user ON compliance_alerts(user_id);
            CREATE INDEX IF NOT EXISTS idx_compliance_alerts_severity ON compliance_alerts(severity);
            CREATE INDEX IF NOT EXISTS idx_compliance_dossiers_user ON compliance_dossiers(user_id);
            CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
            CREATE INDEX IF NOT EXISTS idx_sos_gps_track_sos ON sos_gps_track(sos_id);
            CREATE INDEX IF NOT EXISTS idx_sos_gps_track_time ON sos_gps_track(created_at);
            CREATE INDEX IF NOT EXISTS idx_blacklisted_addresses ON blacklisted_addresses(address);
        `);

        // Add GPS tracking columns to sos_alerts
        this.addColumnIfNotExists('sos_alerts', 'last_lat', 'REAL');
        this.addColumnIfNotExists('sos_alerts', 'last_lng', 'REAL');
        this.addColumnIfNotExists('sos_alerts', 'last_gps_at', 'INTEGER');
        this.addColumnIfNotExists('sos_alerts', 'is_moving', 'INTEGER DEFAULT 0');
        this.addColumnIfNotExists('sos_alerts', 'total_distance', 'REAL DEFAULT 0');
        this.addColumnIfNotExists('sos_alerts', 'gps_points_count', 'INTEGER DEFAULT 0');

        // Add 2FA columns to users table if not exists
        this.addColumnIfNotExists('users', 'totp_secret', 'TEXT');
        this.addColumnIfNotExists('users', 'totp_enabled', 'INTEGER DEFAULT 0');
        this.addColumnIfNotExists('users', 'backup_codes', 'TEXT');

        // Add account_type column to users (individual / business / institutional)
        this.addColumnIfNotExists('users', 'account_type', "TEXT DEFAULT 'individual'");
        this.addColumnIfNotExists('users', 'company_name', 'TEXT');
        this.addColumnIfNotExists('users', 'account_type_updated_at', 'INTEGER');

        // Add institutional columns to api_keys table
        this.addColumnIfNotExists('api_keys', 'org_id', 'TEXT');
        this.addColumnIfNotExists('api_keys', 'scopes', 'TEXT');
        this.addColumnIfNotExists('api_keys', 'rate_limit_tier', "TEXT DEFAULT 'basic'");
        this.addColumnIfNotExists('api_keys', 'ip_whitelist', 'TEXT');
        this.addColumnIfNotExists('api_keys', 'expires_at', 'INTEGER');

        console.log('📦 Database tables initialized');
    }

    // Helper: Add column if not exists
    addColumnIfNotExists(table, column, type) {
        try {
            const tableInfo = this.db.prepare(`PRAGMA table_info(${table})`).all();
            const columnExists = tableInfo.some(col => col.name === column);
            if (!columnExists) {
                this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
                console.log(`  Added column ${column} to ${table}`);
            }
        } catch (e) {
            // Column might already exist, ignore
        }
    }

    // ==================== USERS ====================

    createUser(walletAddress) {
        const id = crypto.randomUUID();
        const nonce = crypto.randomBytes(32).toString('hex');

        const stmt = this.db.prepare(`
            INSERT INTO users (id, wallet_address, nonce)
            VALUES (?, ?, ?)
        `);

        try {
            stmt.run(id, walletAddress.toLowerCase(), nonce);
            return { id, walletAddress, nonce };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return this.getUserByWallet(walletAddress);
            }
            throw e;
        }
    }

    getUserByWallet(walletAddress) {
        const stmt = this.db.prepare(`
            SELECT * FROM users WHERE wallet_address = ?
        `);
        return stmt.get(walletAddress.toLowerCase());
    }

    getUserById(userId) {
        const stmt = this.db.prepare(`SELECT * FROM users WHERE id = ?`);
        return stmt.get(userId);
    }

    updateUserLogin(userId) {
        const stmt = this.db.prepare(`
            UPDATE users SET last_login = strftime('%s', 'now') WHERE id = ?
        `);
        stmt.run(userId);
    }

    updateNonce(userId) {
        const nonce = crypto.randomBytes(32).toString('hex');
        const stmt = this.db.prepare(`UPDATE users SET nonce = ? WHERE id = ?`);
        stmt.run(nonce, userId);
        return nonce;
    }

    updateCreditScore(userId, score) {
        const stmt = this.db.prepare(`UPDATE users SET credit_score = ? WHERE id = ?`);
        stmt.run(Math.max(0, Math.min(1000, score)), userId);
    }

    // ==================== ACCOUNT TYPE ====================

    updateAccountType(userId, accountType, companyName = null) {
        const validTypes = ['individual', 'business', 'institutional'];
        if (!validTypes.includes(accountType)) throw new Error('Invalid account type');
        const now = Math.floor(Date.now() / 1000);
        const stmt = this.db.prepare(`
            UPDATE users SET account_type = ?, company_name = ?, account_type_updated_at = ? WHERE id = ?
        `);
        stmt.run(accountType, companyName, now, userId);
    }

    getAccountType(userId) {
        const stmt = this.db.prepare(`SELECT account_type, company_name FROM users WHERE id = ?`);
        const row = stmt.get(userId);
        return row ? { accountType: row.account_type || 'individual', companyName: row.company_name } : null;
    }

    // ==================== BALANCES ====================

    getBalance(userId, token) {
        const stmt = this.db.prepare(`
            SELECT amount, locked FROM balances WHERE user_id = ? AND token = ?
        `);
        const row = stmt.get(userId, token);
        return row ? { available: row.amount - row.locked, locked: row.locked, total: row.amount } : { available: 0, locked: 0, total: 0 };
    }

    getAllBalances(userId) {
        const stmt = this.db.prepare(`
            SELECT token, amount, locked FROM balances WHERE user_id = ?
        `);
        const rows = stmt.all(userId);
        const balances = {};
        for (const row of rows) {
            balances[row.token] = {
                available: row.amount - row.locked,
                locked: row.locked,
                total: row.amount
            };
        }
        return balances;
    }

    updateBalance(userId, token, amount) {
        const stmt = this.db.prepare(`
            INSERT INTO balances (user_id, token, amount)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, token) DO UPDATE SET
                amount = amount + excluded.amount,
                updated_at = strftime('%s', 'now')
        `);
        stmt.run(userId, token, amount);
    }

    setBalance(userId, token, amount) {
        const stmt = this.db.prepare(`
            INSERT INTO balances (user_id, token, amount)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, token) DO UPDATE SET
                amount = excluded.amount,
                updated_at = strftime('%s', 'now')
        `);
        stmt.run(userId, token, amount);
    }

    lockBalance(userId, token, amount) {
        const stmt = this.db.prepare(`
            UPDATE balances SET locked = locked + ? WHERE user_id = ? AND token = ?
        `);
        stmt.run(amount, userId, token);
    }

    unlockBalance(userId, token, amount) {
        const stmt = this.db.prepare(`
            UPDATE balances SET locked = MAX(0, locked - ?) WHERE user_id = ? AND token = ?
        `);
        stmt.run(amount, userId, token);
    }

    // ==================== DEPOSITS ====================

    createDeposit(userId, token, amount, txHash, type = 'deposit') {
        const id = crypto.randomUUID();
        const stmt = this.db.prepare(`
            INSERT INTO deposits (id, user_id, token, amount, tx_hash, type)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, userId, token, amount, txHash, type);
        return id;
    }

    confirmDeposit(depositId) {
        const stmt = this.db.prepare(`
            UPDATE deposits SET status = 'confirmed', confirmed_at = strftime('%s', 'now')
            WHERE id = ?
        `);
        stmt.run(depositId);
    }

    getDeposits(userId, limit = 50) {
        const stmt = this.db.prepare(`
            SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
        `);
        return stmt.all(userId, limit);
    }

    // ==================== LOANS ====================

    createLoan(userId, collateralToken, collateralAmount, borrowToken, borrowAmount, interestRate, dueDate) {
        const id = crypto.randomUUID();
        const totalDue = borrowAmount * (1 + interestRate);

        const stmt = this.db.prepare(`
            INSERT INTO loans (id, user_id, collateral_token, collateral_amount, borrow_token, borrow_amount, interest_rate, total_due, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, userId, collateralToken, collateralAmount, borrowToken, borrowAmount, interestRate, totalDue, dueDate);
        return id;
    }

    getLoan(loanId) {
        const stmt = this.db.prepare(`SELECT * FROM loans WHERE id = ?`);
        return stmt.get(loanId);
    }

    getUserLoans(userId, status = null) {
        if (status) {
            const stmt = this.db.prepare(`SELECT * FROM loans WHERE user_id = ? AND status = ?`);
            return stmt.all(userId, status);
        }
        const stmt = this.db.prepare(`SELECT * FROM loans WHERE user_id = ?`);
        return stmt.all(userId);
    }

    getActiveLoans() {
        const stmt = this.db.prepare(`SELECT * FROM loans WHERE status = 'active'`);
        return stmt.all();
    }

    repayLoan(loanId, amount) {
        const stmt = this.db.prepare(`
            UPDATE loans SET repaid = repaid + ? WHERE id = ?
        `);
        stmt.run(amount, loanId);

        // Check if fully repaid
        const loan = this.getLoan(loanId);
        if (loan.repaid >= loan.total_due) {
            this.db.prepare(`UPDATE loans SET status = 'repaid' WHERE id = ?`).run(loanId);
        }
    }

    liquidateLoan(loanId, seizedAmount, returnedAmount, feeAmount) {
        const loan = this.getLoan(loanId);

        // Update loan status
        this.db.prepare(`
            UPDATE loans SET status = 'liquidated', liquidated_at = strftime('%s', 'now') WHERE id = ?
        `).run(loanId);

        // Record liquidation
        const id = crypto.randomUUID();
        this.db.prepare(`
            INSERT INTO liquidations (id, loan_id, user_id, seized_amount, seized_token, returned_amount, fee_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, loanId, loan.user_id, seizedAmount, loan.collateral_token, returnedAmount, feeAmount);

        return id;
    }

    // ==================== TRADES ====================

    createTrade(userId, pair, side, amount, price, fee = 0) {
        const id = crypto.randomUUID();
        const total = amount * price;

        const stmt = this.db.prepare(`
            INSERT INTO trades (id, user_id, pair, side, amount, price, total, fee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, userId, pair, side, amount, price, total, fee);

        // Update user volume
        this.db.prepare(`UPDATE users SET total_volume = total_volume + ? WHERE id = ?`).run(total, userId);

        return id;
    }

    getUserTrades(userId, limit = 100) {
        const stmt = this.db.prepare(`
            SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
        `);
        return stmt.all(userId, limit);
    }

    // ==================== ORDERS ====================

    createOrder(userId, pair, side, type, amount, price = null) {
        const id = crypto.randomUUID();
        const stmt = this.db.prepare(`
            INSERT INTO orders (id, user_id, pair, side, type, amount, price)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, userId, pair, side, type, amount, price);
        return id;
    }

    getOrder(orderId) {
        const stmt = this.db.prepare(`SELECT * FROM orders WHERE id = ?`);
        return stmt.get(orderId);
    }

    getUserOrders(userId, status = 'open') {
        const stmt = this.db.prepare(`
            SELECT * FROM orders WHERE user_id = ? AND status = ? ORDER BY created_at DESC
        `);
        return stmt.all(userId, status);
    }

    updateOrderFill(orderId, filledAmount) {
        const stmt = this.db.prepare(`
            UPDATE orders SET filled = filled + ?, updated_at = strftime('%s', 'now') WHERE id = ?
        `);
        stmt.run(filledAmount, orderId);

        const order = this.getOrder(orderId);
        if (order.filled >= order.amount) {
            this.db.prepare(`UPDATE orders SET status = 'filled' WHERE id = ?`).run(orderId);
        }
    }

    cancelOrder(orderId) {
        const stmt = this.db.prepare(`UPDATE orders SET status = 'cancelled' WHERE id = ?`);
        stmt.run(orderId);
    }

    // ==================== MICRO INVESTMENTS ====================

    createMicroInvestment(userId, strategy, token, amount, entryPrice, apy) {
        const id = crypto.randomUUID();
        const stmt = this.db.prepare(`
            INSERT INTO micro_investments (id, user_id, strategy, token, amount, entry_price, current_value, apy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, userId, strategy, token, amount, entryPrice, amount, apy);
        return id;
    }

    getUserInvestments(userId) {
        const stmt = this.db.prepare(`SELECT * FROM micro_investments WHERE user_id = ?`);
        return stmt.all(userId);
    }

    updateInvestmentValue(investmentId, newValue) {
        const stmt = this.db.prepare(`UPDATE micro_investments SET current_value = ? WHERE id = ?`);
        stmt.run(newValue, investmentId);
    }

    // ==================== SESSIONS ====================

    createSession(userId) {
        const id = crypto.randomUUID();
        const token = crypto.randomBytes(64).toString('hex');
        const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

        const stmt = this.db.prepare(`
            INSERT INTO sessions (id, user_id, token, expires_at)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(id, userId, token, expiresAt);
        return token;
    }

    validateSession(token) {
        const stmt = this.db.prepare(`
            SELECT s.*, u.wallet_address FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ? AND s.expires_at > strftime('%s', 'now')
        `);
        return stmt.get(token);
    }

    deleteSession(token) {
        const stmt = this.db.prepare(`DELETE FROM sessions WHERE token = ?`);
        stmt.run(token);
    }

    // ==================== STATS ====================

    getGlobalStats() {
        const users = this.db.prepare(`SELECT COUNT(*) as count FROM users`).get().count;
        const trades = this.db.prepare(`SELECT COUNT(*) as count, SUM(total) as volume FROM trades`).get();
        const activeLoans = this.db.prepare(`SELECT COUNT(*) as count, SUM(borrow_amount) as total FROM loans WHERE status = 'active'`).get();
        const liquidations = this.db.prepare(`SELECT COUNT(*) as count FROM liquidations`).get().count;

        return {
            totalUsers: users,
            totalTrades: trades.count,
            totalVolume: trades.volume || 0,
            activeLoans: activeLoans.count,
            totalBorrowed: activeLoans.total || 0,
            totalLiquidations: liquidations
        };
    }

    // ==================== SECURITY EVENTS ====================

    logSecurityEvent(eventType, ipAddress, walletAddress, userId, severity, details) {
        const stmt = this.db.prepare(`
            INSERT INTO security_events (event_type, ip_address, wallet_address, user_id, severity, details)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(eventType, ipAddress, walletAddress, userId, severity, JSON.stringify(details));
    }

    getSecurityEvents(filters = {}, limit = 100) {
        let query = 'SELECT * FROM security_events WHERE 1=1';
        const params = [];

        if (filters.eventType) {
            query += ' AND event_type = ?';
            params.push(filters.eventType);
        }
        if (filters.ipAddress) {
            query += ' AND ip_address = ?';
            params.push(filters.ipAddress);
        }
        if (filters.walletAddress) {
            query += ' AND wallet_address = ?';
            params.push(filters.walletAddress);
        }
        if (filters.severity) {
            query += ' AND severity = ?';
            params.push(filters.severity);
        }
        if (filters.since) {
            query += ' AND created_at >= ?';
            params.push(filters.since);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        return this.db.prepare(query).all(...params);
    }

    countRecentEvents(eventType, identifier, identifierType, windowSeconds) {
        const since = Math.floor(Date.now() / 1000) - windowSeconds;
        const column = identifierType === 'ip' ? 'ip_address' : 'wallet_address';
        const stmt = this.db.prepare(`
            SELECT COUNT(*) as count FROM security_events
            WHERE event_type = ? AND ${column} = ? AND created_at >= ?
        `);
        return stmt.get(eventType, identifier, since).count;
    }

    // ==================== SECURITY BLOCKS ====================

    createBlock(blockType, value, reason, durationSeconds) {
        const blockedUntil = durationSeconds ? Math.floor(Date.now() / 1000) + durationSeconds : null;
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO security_blocks (block_type, value, reason, blocked_until)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(blockType, value.toLowerCase(), reason, blockedUntil);
    }

    isBlocked(blockType, value) {
        const stmt = this.db.prepare(`
            SELECT * FROM security_blocks
            WHERE block_type = ? AND value = ?
            AND (blocked_until IS NULL OR blocked_until > strftime('%s', 'now'))
        `);
        return stmt.get(blockType, value.toLowerCase()) !== undefined;
    }

    removeBlock(blockType, value) {
        const stmt = this.db.prepare(`DELETE FROM security_blocks WHERE block_type = ? AND value = ?`);
        stmt.run(blockType, value.toLowerCase());
    }

    getActiveBlocks() {
        const stmt = this.db.prepare(`
            SELECT * FROM security_blocks
            WHERE blocked_until IS NULL OR blocked_until > strftime('%s', 'now')
            ORDER BY created_at DESC
        `);
        return stmt.all();
    }

    cleanExpiredBlocks() {
        const stmt = this.db.prepare(`
            DELETE FROM security_blocks WHERE blocked_until IS NOT NULL AND blocked_until <= strftime('%s', 'now')
        `);
        return stmt.run().changes;
    }

    // ==================== LINKED WALLETS ====================

    linkWallet(userId, walletAddress, label = null, isWatchOnly = false) {
        const stmt = this.db.prepare(`
            INSERT INTO linked_wallets (user_id, wallet_address, label, is_watch_only)
            VALUES (?, ?, ?, ?)
        `);
        try {
            stmt.run(userId, walletAddress.toLowerCase(), label, isWatchOnly ? 1 : 0);
            return true;
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return false; // Already linked
            }
            throw e;
        }
    }

    unlinkWallet(userId, walletAddress) {
        const stmt = this.db.prepare(`
            DELETE FROM linked_wallets WHERE user_id = ? AND wallet_address = ?
        `);
        return stmt.run(userId, walletAddress.toLowerCase()).changes > 0;
    }

    getLinkedWallets(userId) {
        const stmt = this.db.prepare(`
            SELECT * FROM linked_wallets WHERE user_id = ? ORDER BY is_primary DESC, linked_at ASC
        `);
        return stmt.all(userId);
    }

    setPrimaryWallet(userId, walletAddress) {
        // First, unset all as primary
        this.db.prepare(`UPDATE linked_wallets SET is_primary = 0 WHERE user_id = ?`).run(userId);
        // Set the new primary
        const stmt = this.db.prepare(`
            UPDATE linked_wallets SET is_primary = 1 WHERE user_id = ? AND wallet_address = ?
        `);
        return stmt.run(userId, walletAddress.toLowerCase()).changes > 0;
    }

    updateWalletSnapshot(userId, walletAddress, balanceSnapshot) {
        const stmt = this.db.prepare(`
            UPDATE linked_wallets
            SET balance_snapshot = ?, last_activity = strftime('%s', 'now')
            WHERE user_id = ? AND wallet_address = ?
        `);
        stmt.run(JSON.stringify(balanceSnapshot), userId, walletAddress.toLowerCase());
    }

    isWalletLinkedToUser(userId, walletAddress) {
        const stmt = this.db.prepare(`
            SELECT 1 FROM linked_wallets WHERE user_id = ? AND wallet_address = ?
        `);
        return stmt.get(userId, walletAddress.toLowerCase()) !== undefined;
    }

    // ==================== WALLET AUDIT ====================

    logWalletAudit(userId, walletAddress, action, ipAddress) {
        const stmt = this.db.prepare(`
            INSERT INTO wallet_audit (user_id, wallet_address, action, ip_address)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(userId, walletAddress.toLowerCase(), action, ipAddress);
    }

    getWalletAuditLog(userId, limit = 50) {
        const stmt = this.db.prepare(`
            SELECT * FROM wallet_audit WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
        `);
        return stmt.all(userId, limit);
    }

    // ==================== 2FA ====================

    setTotpSecret(userId, secret) {
        const stmt = this.db.prepare(`UPDATE users SET totp_secret = ? WHERE id = ?`);
        stmt.run(secret, userId);
    }

    enableTotp(userId, backupCodes) {
        const stmt = this.db.prepare(`
            UPDATE users SET totp_enabled = 1, backup_codes = ? WHERE id = ?
        `);
        stmt.run(JSON.stringify(backupCodes), userId);
    }

    disableTotp(userId) {
        const stmt = this.db.prepare(`
            UPDATE users SET totp_enabled = 0, totp_secret = NULL, backup_codes = NULL WHERE id = ?
        `);
        stmt.run(userId);
    }

    getTotpInfo(userId) {
        const stmt = this.db.prepare(`
            SELECT totp_secret, totp_enabled, backup_codes FROM users WHERE id = ?
        `);
        const row = stmt.get(userId);
        if (!row) return null;
        return {
            secret: row.totp_secret,
            enabled: row.totp_enabled === 1,
            backupCodes: row.backup_codes ? JSON.parse(row.backup_codes) : []
        };
    }

    useBackupCode(userId, code) {
        const info = this.getTotpInfo(userId);
        if (!info || !info.backupCodes) return false;

        const index = info.backupCodes.indexOf(code);
        if (index === -1) return false;

        // Remove used code
        info.backupCodes.splice(index, 1);
        const stmt = this.db.prepare(`UPDATE users SET backup_codes = ? WHERE id = ?`);
        stmt.run(JSON.stringify(info.backupCodes), userId);
        return true;
    }

    // 2FA Challenges
    createTwofaChallenge(userId, action, expiresInSeconds = 300) {
        const id = crypto.randomUUID();
        const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
        const stmt = this.db.prepare(`
            INSERT INTO twofa_challenges (id, user_id, action, expires_at)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(id, userId, action, expiresAt);
        return id;
    }

    verifyTwofaChallenge(challengeId) {
        const stmt = this.db.prepare(`
            UPDATE twofa_challenges SET verified = 1
            WHERE id = ? AND expires_at > strftime('%s', 'now') AND verified = 0
        `);
        return stmt.run(challengeId).changes > 0;
    }

    isChallengeVerified(challengeId) {
        const stmt = this.db.prepare(`
            SELECT verified FROM twofa_challenges
            WHERE id = ? AND expires_at > strftime('%s', 'now')
        `);
        const row = stmt.get(challengeId);
        return row && row.verified === 1;
    }

    cleanExpiredChallenges() {
        const stmt = this.db.prepare(`
            DELETE FROM twofa_challenges WHERE expires_at <= strftime('%s', 'now')
        `);
        return stmt.run().changes;
    }

    // ==================== SIMULATED TRADERS ====================

    createSimulatedTrader(trader) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO simulated_traders
            (id, name, avatar, style, bio, risk_per_trade, target_rr, win_rate, total_trades, wins, losses, total_pnl, generation_seed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            trader.id, trader.name, trader.avatar, trader.style, trader.bio,
            trader.riskPerTrade, trader.targetRR, trader.winRate,
            trader.totalTrades || 0, trader.wins || 0, trader.losses || 0,
            trader.totalPnl || 0, trader.seed
        );
    }

    createSimulatedTradersBatch(traders) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO simulated_traders
            (id, name, avatar, style, bio, risk_per_trade, target_rr, win_rate, total_trades, wins, losses, total_pnl, generation_seed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertMany = this.db.transaction((traders) => {
            for (const t of traders) {
                stmt.run(
                    t.id, t.name, t.avatar, t.style, t.bio,
                    t.riskPerTrade, t.targetRR, t.winRate,
                    t.totalTrades || 0, t.wins || 0, t.losses || 0,
                    t.totalPnl || 0, t.seed
                );
            }
        });

        insertMany(traders);
    }

    getSimulatedTrader(traderId) {
        const stmt = this.db.prepare(`SELECT * FROM simulated_traders WHERE id = ?`);
        return stmt.get(traderId);
    }

    getSimulatedTraders(filters = {}, limit = 50, offset = 0) {
        let query = 'SELECT * FROM simulated_traders WHERE 1=1';
        const params = [];

        if (filters.style) {
            query += ' AND style = ?';
            params.push(filters.style);
        }
        if (filters.minWinRate) {
            query += ' AND win_rate >= ?';
            params.push(filters.minWinRate);
        }
        if (filters.minPnl) {
            query += ' AND total_pnl >= ?';
            params.push(filters.minPnl);
        }

        // Sorting
        const sortBy = filters.sortBy || 'total_pnl';
        const sortDir = filters.sortDir || 'DESC';
        query += ` ORDER BY ${sortBy} ${sortDir}`;

        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return this.db.prepare(query).all(...params);
    }

    countSimulatedTraders(filters = {}) {
        let query = 'SELECT COUNT(*) as count FROM simulated_traders WHERE 1=1';
        const params = [];

        if (filters.style) {
            query += ' AND style = ?';
            params.push(filters.style);
        }
        if (filters.minWinRate) {
            query += ' AND win_rate >= ?';
            params.push(filters.minWinRate);
        }

        return this.db.prepare(query).all(...params)[0].count;
    }

    updateTraderStats(traderId, stats) {
        const stmt = this.db.prepare(`
            UPDATE simulated_traders
            SET total_trades = ?, wins = ?, losses = ?, total_pnl = ?, win_rate = ?
            WHERE id = ?
        `);
        const winRate = stats.totalTrades > 0 ? (stats.wins / stats.totalTrades * 100) : 0;
        stmt.run(stats.totalTrades, stats.wins, stats.losses, stats.totalPnl, winRate, traderId);
    }

    getTopTraders(limit = 100) {
        const stmt = this.db.prepare(`
            SELECT * FROM simulated_traders
            WHERE total_trades >= 10
            ORDER BY total_pnl DESC
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    // ==================== SIMULATED TRADES ====================

    createSimulatedTrade(trade) {
        const stmt = this.db.prepare(`
            INSERT INTO simulated_trades (id, trader_id, symbol, direction, entry_price, size, status)
            VALUES (?, ?, ?, ?, ?, ?, 'open')
        `);
        stmt.run(trade.id, trade.traderId, trade.symbol, trade.direction, trade.entryPrice, trade.size);
    }

    closeSimulatedTrade(tradeId, exitPrice, pnlUsd, pnlPercent, reason) {
        const stmt = this.db.prepare(`
            UPDATE simulated_trades
            SET exit_price = ?, pnl_usd = ?, pnl_percent = ?, status = 'closed', reason = ?, closed_at = strftime('%s', 'now')
            WHERE id = ?
        `);
        stmt.run(exitPrice, pnlUsd, pnlPercent, reason, tradeId);
    }

    getOpenTradesByTrader(traderId) {
        const stmt = this.db.prepare(`
            SELECT * FROM simulated_trades WHERE trader_id = ? AND status = 'open'
        `);
        return stmt.all(traderId);
    }

    getTraderTradeHistory(traderId, limit = 50) {
        const stmt = this.db.prepare(`
            SELECT * FROM simulated_trades WHERE trader_id = ? ORDER BY opened_at DESC LIMIT ?
        `);
        return stmt.all(traderId, limit);
    }

    getRecentSimulatedTrades(limit = 100) {
        const stmt = this.db.prepare(`
            SELECT st.*, s.name as trader_name, s.style as trader_style
            FROM simulated_trades st
            JOIN simulated_traders s ON st.trader_id = s.id
            ORDER BY st.opened_at DESC
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

// Singleton instance
const db = new ObeliskDB();

module.exports = db;
