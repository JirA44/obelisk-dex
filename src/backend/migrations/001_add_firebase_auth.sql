-- Migration: Add Firebase Authentication Support
-- Date: 2025-12-28
-- Description: Extend users table to support Firebase auth alongside wallet auth

-- Add Firebase columns to users table
ALTER TABLE users ADD COLUMN firebase_uid TEXT UNIQUE;
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN photo_url TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN auth_provider TEXT; -- 'wallet', 'email', 'google', 'twitter', 'github'

-- Make wallet_address nullable (users can sign up with email first, link wallet later)
-- SQLite doesn't support ALTER COLUMN, so we create a new table

-- Create new users table with updated schema
CREATE TABLE IF NOT EXISTS users_new (
    id TEXT PRIMARY KEY,
    -- Wallet auth (optional)
    wallet_address TEXT UNIQUE,
    -- Firebase auth (optional)
    firebase_uid TEXT UNIQUE,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    email_verified INTEGER DEFAULT 0,
    -- Auth metadata
    auth_provider TEXT, -- 'wallet', 'email', 'google', 'twitter', 'github'
    nonce TEXT, -- For SIWE
    -- User data
    credit_score INTEGER DEFAULT 500,
    total_volume REAL DEFAULT 0,
    is_verified INTEGER DEFAULT 0,
    -- Timestamps
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    last_login INTEGER,
    -- Constraint: must have either wallet or firebase_uid
    CHECK (wallet_address IS NOT NULL OR firebase_uid IS NOT NULL)
);

-- Copy existing data
INSERT INTO users_new (id, wallet_address, nonce, credit_score, total_volume, is_verified, created_at, last_login, auth_provider)
SELECT id, wallet_address, nonce, credit_score, total_volume, is_verified, created_at, last_login, 'wallet'
FROM users;

-- Swap tables
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_firebase ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create linked_accounts table for users with multiple auth methods
CREATE TABLE IF NOT EXISTS linked_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'wallet', 'google', 'twitter', 'github', 'email'
    provider_id TEXT NOT NULL, -- wallet address or provider UID
    linked_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(provider, provider_id)
);
