const getDb = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');
const crypto = require('crypto');

class BusinessAccount {
    static async create({ user_id, account_type, account_number, consumer_key, consumer_secret, passkey, environment }) {
        const db = await getDb();
        const id = crypto.randomUUID();

        // Encrypt sensitive data
        const encryptedKey = encrypt(consumer_key);
        const encryptedSecret = encrypt(consumer_secret);
        const encryptedPasskey = passkey ? encrypt(passkey) : null;

        await db.run(
            `INSERT INTO business_accounts 
             (id, user_id, account_type, account_number, consumer_key, consumer_secret, passkey, environment) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, user_id, account_type, account_number, encryptedKey, encryptedSecret, encryptedPasskey, environment || 'sandbox']
        );

        return db.query('SELECT * FROM business_accounts WHERE id = ?', [id]);
    }

    static async findByUser(user_id) {
        const db = await getDb();
        const accounts = await db.all(
            'SELECT * FROM business_accounts WHERE user_id = ? ORDER BY created_at DESC',
            [user_id]
        );
        return accounts;
    }

    static async findById(id, user_id) {
        const db = await getDb();
        const account = await db.quer(
            'SELECT * FROM business_accounts WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        if (account) {
            // Decrypt when returning
            account.consumer_key = decrypt(account.consumer_key);
            account.consumer_secret = decrypt(account.consumer_secret);
            if (account.passkey) {
                account.passkey = decrypt(account.passkey);
            }
        }
        return account;
    }

    static async delete(id, user_id) {
        const db = await getDb();
        const result = await db.run(
            'DELETE FROM business_accounts WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        return result.changes > 0;
    }
}

module.exports = BusinessAccount;