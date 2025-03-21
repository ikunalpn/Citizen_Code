const db = require('../config/db');

const Grievance = {
    create: async (grievance) => {
        try {
            const [result] = await db.query(
                'INSERT INTO Grievance (citizen_id, title, description, status) VALUES (?, ?, ?, ?)',
                [grievance.citizen_id, grievance.title, grievance.description, 'pending'] // Default status
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },
    getAll: async () => {
        try {
            const [rows] = await db.query('SELECT * FROM Grievance');
            return rows;
        } catch (error) {
            console.error("Error getting all grievances:", error);
            throw error;
        }
    },
    getById: async (grievanceId) => {
        try {
            const [rows] = await db.query('SELECT * FROM Grievance WHERE grievance_id = ?', [grievanceId]);
            return rows[0]; // Return the first row (grievance) or undefined
        } catch (error) {
            console.error("Error getting grievance by ID:", error);
            throw error;
        }
    },
    update: async (grievanceId, updatedGrievance) => {
        try {
            await db.query(`UPDATE Grievance SET ? WHERE grievance_id = ?`, [updatedGrievance, grievanceId]); // Replace grievance_id if your column name is different
        } catch (error) {
            console.error("Error updating grievance:", error);
            throw error;
        }
    },
    delete: async (grievanceId) => {
        try {
            await db.query(`DELETE FROM Grievance WHERE grievance_id = ?`, [grievanceId]); // Replace grievance_id with correct column name if needed
        } catch (error) {
            console.error("Error deleting grievance:", error);
            throw error;
        }
    },
    getByCitizenId: async (citizenId) => {
        try {
            const [rows] = await db.query('SELECT * FROM Grievance WHERE citizen_id = ?', [citizenId]);
            return rows;
        } catch (error) {
            console.error("Error getting grievances by citizen ID:", error);
            throw error;
        }
    },
    //... other methods
};

module.exports = Grievance;