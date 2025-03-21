const db = require('../config/db');

const Addresser = {
    create: async (addresser) => {
        try {
            const [result] = await db.query(
                'INSERT INTO Addresser (name, email, contact_no, password) VALUES (?, ?, ?, ?)',
                [addresser.name, addresser.email, addresser.contact_no, addresser.password]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email already in use.');
            }
            throw error;
        }
    },

    findByEmail: async (email) => {
        try {
            const [rows] = await db.query('SELECT * FROM Addresser WHERE email = ?', [email]);
            return rows;
        } catch (error) {
            throw error;
        }
    },
    findById:(addresserId, callback) =>{
        db.query('SELECT * FROM Addresser WHERE addresser_id = ?', [addresserId], callback);
    }
    // ... other methods
};

module.exports = Addresser;