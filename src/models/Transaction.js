const getDb = require('../config/db');
const crypto = require('crypto');

class Transaction {
    static async create({ user_id, account_id, phone_number, amount, account_reference }) {
        const db = getDb();
        const id = crypto.randomUUID();
        const result = await db.query(
            `INSERT INTO transactions 
             (id, user_id, account_id, phone_number, amount, account_reference) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [id, user_id, account_id, phone_number, amount, account_reference]
        );
        return result.rows[0];
    }

    static async updateByCheckoutRequestId(checkoutRequestId, data) {
        const db = getDb();
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (fields.length === 0) return null;

        fields.push(`updated_at = NOW()`);
        values.push(checkoutRequestId);

        await db.query(
            `UPDATE transactions SET ${fields.join(', ')} WHERE checkout_request_id = $${paramCount}`,
            values
        );

        const result = await db.query(
            'SELECT * FROM transactions WHERE checkout_request_id = $1',
            [checkoutRequestId]
        );
        return result.rows[0] || null;
    }

    static async findByCheckoutRequestId(checkoutRequestId) {
        const db = getDb();
        const result = await db.query(
            'SELECT * FROM transactions WHERE checkout_request_id = $1',
            [checkoutRequestId]
        );
        return result.rows[0] || null;
    }

    static async findByUser(user_id) {
        const db = getDb();
        const result = await db.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );
        return result.rows;
    }
}

module.exports = Transaction;