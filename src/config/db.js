const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

let db;

async function getDb() {
    if (!db) {
        db = await open({
            filename: path.join(__dirname, '../../shop_pay.db'),
            driver: sqlite3.Database
        });

        // Users table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                business_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                phone TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);

        // Business Accounts table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS business_accounts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                account_type TEXT NOT NULL,
                account_number TEXT NOT NULL,
                consumer_key TEXT NOT NULL,
                consumer_secret TEXT NOT NULL,
                passkey TEXT,
                environment TEXT DEFAULT 'sandbox',
                is_default INTEGER DEFAULT 0,
                last_used_at TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, account_number, account_type)
            )
        `);

        // 🔥 NEW: Transactions table for payment logs
        await db.exec(`
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                account_id TEXT NOT NULL,
                phone_number TEXT NOT NULL,
                amount INTEGER NOT NULL,
                account_reference TEXT NOT NULL,
                checkout_request_id TEXT,
                merchant_request_id TEXT,
                mpesa_receipt_number TEXT,
                result_code INTEGER,
                result_description TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (account_id) REFERENCES business_accounts(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ SQLite database connected and ready');
    }
    return db;
}

module.exports = getDb;