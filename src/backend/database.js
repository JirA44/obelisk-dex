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

        // Index pour performance
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_balances_user ON balances(user_id);
            CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
            CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
            CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
            CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
        `);

        console.log('📦 Database tables initialized');
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

    // Close database connection
    close() {
        this.db.close();
    }
}

// Singleton instance
const db = new ObeliskDB();

module.exports = db;
