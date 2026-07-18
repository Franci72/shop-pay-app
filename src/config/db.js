const { Pool } = require('pg');

let pool;

function getDb() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                phone TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `).catch(err => console.error('Users table error:', err));

        pool.query(`
            CREATE TABLE IF NOT EXISTS business_accounts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                account_type TEXT NOT NULL,
                account_number TEXT NOT NULL,
                consumer_key TEXT NOT NULL,
                consumer_secret TEXT NOT NULL,
                passkey TEXT,
                environment TEXT DEFAULT 'sandbox',
                is_default INTEGER DEFAULT 0,
                last_used_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, account_number, account_type)
            )
        `).catch(err => console.error('Business accounts table error:', err));

        pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                account_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,
                phone_number TEXT NOT NULL,
                amount INTEGER NOT NULL,
                account_reference TEXT NOT NULL,
                checkout_request_id TEXT,
                merchant_request_id TEXT,
                mpesa_receipt_number TEXT,
                result_code INTEGER,
                result_description TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `).catch(err => console.error('Transactions table error:', err));

        console.log('✅ PostgreSQL database connected and ready');
    }
    return pool;
}

module.exports = getDb;