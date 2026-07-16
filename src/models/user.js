const getDb = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class User {
    static async findByEmail(email) {
        const db = await getDb();
        return db.get('SELECT * FROM users WHERE email = ?', [email]);
    }

    static async create({ business_name, email, password, phone }) {
        const db = await getDb();
        const id = crypto.randomUUID();
        const password_hash = await bcrypt.hash(password, 10);

        await db.run(
            `INSERT INTO users (id, business_name, email, password_hash, phone) 
             VALUES (?, ?, ?, ?, ?)`,
            [id, business_name, email, password_hash, phone]
        );

        return db.get('SELECT id, business_name, email, phone, is_active, created_at FROM users WHERE id = ?', [id]);
    }
}

module.exports = User;