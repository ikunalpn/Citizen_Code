// models/ownerModel.js

const pool = require('../config/db'); // Assuming you have a db.js in your config folder
const bcrypt = require('bcrypt');

const Owner = {
    create: async (fullName, email, password) => {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await pool.execute(
                'INSERT INTO Owners (FullName, Email, Password) VALUES (?, ?, ?)',
                [fullName, email, hashedPassword]
            );
            return result.insertId;
        } catch (error) {
            // Handle duplicate email error (MySQL error code 1062)
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email already in use.');
            }
            console.error('Error creating owner:', error);
            throw error; // Rethrow to handle in the controller
        }
    },

    findByEmail: async (email) => {
        try {
            const [rows] = await pool.execute('SELECT * FROM Owners WHERE Email = ?', [email]);
            return rows[0] || null; // Return null if not found
        } catch (error) {
            console.error('Error finding owner by email:', error);
            throw error;
        }
    },

    findById: async (ownerId) => {
        try {
            const [rows] = await pool.execute('SELECT * FROM Owners WHERE OwnerID = ?', [ownerId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding owner by ID:', error);
            throw error;
        }
    },

    // Add other methods as needed (e.g., update, delete)
};

module.exports = Owner;