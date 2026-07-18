const getDb = require('../config/db');
const crypto = require('crypto');

class Transaction {
    static async create({ user_id, account_id, phone_number, amount, account_reference }) {
        const db = await getDb();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO transactions 
             (id, user_id, account_id, phone_number, amount, account_reference, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, user_id, account_id, phone_number, amount, account_reference, now, now]
        );

        return db.query('SELECT * FROM transactions WHERE id = ?', [id]);
    }

    static async updateByCheckoutRequestId(checkoutRequestId, data) {
        const db = await getDb();
        const now = new Date().toISOString();
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return null;

        fields.push('updated_at = ?');
        values.push(now);
        values.push(checkoutRequestId);

        await db.run(
            `UPDATE transactions SET ${fields.join(', ')} WHERE checkout_request_id = ?`,
            values
        );

        return db.query('SELECT * FROM transactions WHERE checkout_request_id = ?', [checkoutRequestId]);
    }

    static async findByCheckoutRequestId(checkoutRequestId) {
        const db = await getDb();
        return db.query('SELECT * FROM transactions WHERE checkout_request_id = ?', [checkoutRequestId]);
    }
}

module.exports = Transaction;