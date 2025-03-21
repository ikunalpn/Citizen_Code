// models/citizenModel.js
const db = require('../config/db'); // Assuming you have a database connection setup

const Citizen = {
    create: async (citizen) => {
        try {
            console.log("Citizen.create called:", citizen); // Add this log
            const [result] = await db.query(
                'INSERT INTO Citizen (name, email, contact_no, locality, password) VALUES (?, ?, ?, ?, ?)',
                [citizen.name, citizen.email, citizen.contact_no, citizen.locality, citizen.password]
            );
            console.log("Citizen.create query result:", result); // Add this log
            return result.insertId;
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email already in use.');
            }
            throw error;
        }
    },
    findByEmail: async (email) => {
        try {
            const [rows] = await db.query('SELECT * FROM Citizen WHERE email = ?', [email]);
            return rows; // Return the rows directly
        } catch (error) {
            throw error;
        }
    },
    findById : (citizenId, callback) =>{
        db.query('SELECT * FROM Citizen WHERE citizen_id = ?', [citizenId], callback);
    }
    // ... other methods for retrieving, updating, etc.
};

module.exports = Citizen;