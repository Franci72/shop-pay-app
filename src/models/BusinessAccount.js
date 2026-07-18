const getDb = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');
const crypto = require('crypto');

class BusinessAccount {
    static async create({ user_id, account_type, account_number, consumer_key, consumer_secret, passkey, environment }) {
        const db = getDb();
        const id = crypto.randomUUID();
        const encryptedKey = encrypt(consumer_key);
        const encryptedSecret = encrypt(consumer_secret);
        const encryptedPasskey = passkey ? encrypt(passkey) : null;

        await db.query(
            `INSERT INTO business_accounts 
             (id, user_id, account_type, account_number, consumer_key, consumer_secret, passkey, environment) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, user_id, account_type, account_number, encryptedKey, encryptedSecret, encryptedPasskey, environment || 'sandbox']
        );

        const result = await db.query(
            'SELECT id, account_type, account_number, environment, created_at FROM business_accounts WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async findByUser(user_id) {
        const db = getDb();
        const result = await db.query(
            'SELECT * FROM business_accounts WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );
        return result.rows;
    }

    static async findById(id, user_id) {
        const db = getDb();
        const result = await db.query(
            'SELECT * FROM business_accounts WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );
        const account = result.rows[0];
        if (account) {
            account.consumer_key = decrypt(account.consumer_key);
            account.consumer_secret = decrypt(account.consumer_secret);
            if (account.passkey) {
                account.passkey = decrypt(account.passkey);
            }
        }
        return account;
    }

    static async delete(id, user_id) {
        const db = getDb();
        const result = await db.query(
            'DELETE FROM business_accounts WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );
        return result.rowCount > 0;
    }
}

module.exports = BusinessAccount;