const getDb = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class User {
    static async findByEmail(email) {
        const db = getDb();
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }

    static async create({ business_name, email, password, phone }) {
        const db = getDb();
        const id = crypto.randomUUID();
        const password_hash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (id, business_name, email, password_hash, phone) 
             VALUES ($1, $2, $3, $4, $5)`,
            [id, business_name, email, password_hash, phone]
        );

        const result = await db.query(
            'SELECT id, business_name, email, phone, is_active, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = User;