// models/userModel.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');
// models/userModel.js
;

const User = {
    create: async (fullName, email, password) => {
        try {
            const [result] = await pool.execute(
                'INSERT INTO Users (FullName, Email, Password) VALUES (?, ?, ?)',
                [fullName, email, password]
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
            const [rows] = await pool.execute('SELECT * FROM Users WHERE Email = ?', [email]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = User;