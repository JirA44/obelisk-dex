/**
 * OBELISK Database Backup System
 * Automated daily backups with rotation
 *
 * Usage:
 *   node backup-db.js           - Run backup now
 *   node backup-db.js --restore <file>  - Restore from backup
 *   node backup-db.js --list    - List available backups
 *   node backup-db.js --cleanup - Remove old backups (keep last 7)
 *
 * Cron setup (daily at 3am):
 *   0 3 * * * cd /path/to/obelisk-backend && node backup-db.js >> logs/backup.log 2>&1
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = './obelisk.db';
const BACKUP_DIR = './backups';
const MAX_BACKUPS = 7; // Keep last 7 days

function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        console.log(`[BACKUP] Created backup directory: ${BACKUP_DIR}`);
    }
}

function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function backup() {
    ensureBackupDir();

    if (!fs.existsSync(DB_PATH)) {
        console.error(`[BACKUP] ERROR: Database not found at ${DB_PATH}`);
        process.exit(1);
    }

    const timestamp = getTimestamp();
    const backupName = `obelisk_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    try {
        // Copy main db file
        fs.copyFileSync(DB_PATH, backupPath);

        // Also backup WAL if exists (for SQLite)
        const walPath = `${DB_PATH}-wal`;
        const shmPath = `${DB_PATH}-shm`;

        if (fs.existsSync(walPath)) {
            fs.copyFileSync(walPath, `${backupPath}-wal`);
        }
        if (fs.existsSync(shmPath)) {
            fs.copyFileSync(shmPath, `${backupPath}-shm`);
        }

        const stats = fs.statSync(backupPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`[BACKUP] SUCCESS: ${backupName} (${sizeMB} MB)`);
        console.log(`[BACKUP] Location: ${path.resolve(backupPath)}`);

        return backupPath;
    } catch (error) {
        console.error(`[BACKUP] FAILED:`, error.message);
        process.exit(1);
    }
}

function listBackups() {
    ensureBackupDir();

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('obelisk_') && f.endsWith('.db'))
        .sort()
        .reverse();

    if (files.length === 0) {
        console.log('[BACKUP] No backups found');
        return [];
    }

    console.log(`[BACKUP] Available backups (${files.length}):\n`);
    files.forEach((file, i) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        const date = new Date(stats.mtime).toLocaleString();
        console.log(`  ${i + 1}. ${file} (${sizeMB} MB) - ${date}`);
    });

    return files;
}

function restore(backupFile) {
    const backupPath = path.join(BACKUP_DIR, backupFile);

    if (!fs.existsSync(backupPath)) {
        // Try direct path
        if (fs.existsSync(backupFile)) {
            restoreFromPath(backupFile);
            return;
        }
        console.error(`[BACKUP] ERROR: Backup not found: ${backupFile}`);
        process.exit(1);
    }

    restoreFromPath(backupPath);
}

function restoreFromPath(backupPath) {
    // Create a backup of current db before restore
    if (fs.existsSync(DB_PATH)) {
        const preRestoreBackup = `${DB_PATH}.pre-restore.${getTimestamp()}`;
        fs.copyFileSync(DB_PATH, preRestoreBackup);
        console.log(`[BACKUP] Created pre-restore backup: ${preRestoreBackup}`);
    }

    try {
        fs.copyFileSync(backupPath, DB_PATH);

        // Also restore WAL/SHM if they exist
        const walBackup = `${backupPath}-wal`;
        const shmBackup = `${backupPath}-shm`;

        if (fs.existsSync(walBackup)) {
            fs.copyFileSync(walBackup, `${DB_PATH}-wal`);
        }
        if (fs.existsSync(shmBackup)) {
            fs.copyFileSync(shmBackup, `${DB_PATH}-shm`);
        }

        console.log(`[BACKUP] RESTORED from: ${backupPath}`);
        console.log(`[BACKUP] Restart the server to use restored database`);
    } catch (error) {
        console.error(`[BACKUP] RESTORE FAILED:`, error.message);
        process.exit(1);
    }
}

function cleanup() {
    ensureBackupDir();

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('obelisk_') && f.endsWith('.db'))
        .sort()
        .reverse();

    if (files.length <= MAX_BACKUPS) {
        console.log(`[BACKUP] No cleanup needed (${files.length}/${MAX_BACKUPS} backups)`);
        return;
    }

    const toDelete = files.slice(MAX_BACKUPS);
    let deletedCount = 0;
    let freedBytes = 0;

    toDelete.forEach(file => {
        const filePath = path.join(BACKUP_DIR, file);
        try {
            const stats = fs.statSync(filePath);
            freedBytes += stats.size;

            fs.unlinkSync(filePath);
            // Also delete associated WAL/SHM files
            [`${filePath}-wal`, `${filePath}-shm`].forEach(f => {
                if (fs.existsSync(f)) fs.unlinkSync(f);
            });

            deletedCount++;
        } catch (e) {
            console.error(`[BACKUP] Failed to delete ${file}:`, e.message);
        }
    });

    const freedMB = (freedBytes / (1024 * 1024)).toFixed(2);
    console.log(`[BACKUP] Cleaned up ${deletedCount} old backups (freed ${freedMB} MB)`);
}

function verifyBackup(backupPath) {
    try {
        const Database = require('better-sqlite3');
        const db = new Database(backupPath, { readonly: true });

        // Quick integrity check
        const result = db.pragma('integrity_check');
        db.close();

        if (result[0].integrity_check === 'ok') {
            console.log(`[BACKUP] Integrity check: PASSED`);
            return true;
        } else {
            console.error(`[BACKUP] Integrity check: FAILED`, result);
            return false;
        }
    } catch (error) {
        console.error(`[BACKUP] Verification failed:`, error.message);
        return false;
    }
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
OBELISK Database Backup System

Usage:
  node backup-db.js              Create a new backup
  node backup-db.js --list       List all backups
  node backup-db.js --restore <file>  Restore from backup
  node backup-db.js --cleanup    Remove old backups (keep ${MAX_BACKUPS})
  node backup-db.js --verify <file>   Verify backup integrity

Examples:
  node backup-db.js --restore obelisk_2025-01-15T03-00-00.db
  node backup-db.js --verify backups/obelisk_2025-01-15T03-00-00.db
`);
    process.exit(0);
}

if (args.includes('--list')) {
    listBackups();
} else if (args.includes('--restore')) {
    const fileIndex = args.indexOf('--restore') + 1;
    if (!args[fileIndex]) {
        console.error('[BACKUP] ERROR: Please specify backup file to restore');
        console.log('Usage: node backup-db.js --restore <filename>');
        process.exit(1);
    }
    restore(args[fileIndex]);
} else if (args.includes('--cleanup')) {
    cleanup();
} else if (args.includes('--verify')) {
    const fileIndex = args.indexOf('--verify') + 1;
    if (!args[fileIndex]) {
        console.error('[BACKUP] ERROR: Please specify backup file to verify');
        process.exit(1);
    }
    verifyBackup(args[fileIndex]);
} else {
    // Default: create backup + cleanup
    const backupPath = backup();
    verifyBackup(backupPath);
    cleanup();
}
