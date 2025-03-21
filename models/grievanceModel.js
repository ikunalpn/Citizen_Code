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
    getAll: (callback) => {
        db.query('SELECT * FROM Grievance', callback);
    },
    getById: (grievanceId, callback) => {
        db.query('SELECT * FROM Grievance WHERE grievance_id = ?', [grievanceId], callback);
    },
    update: (grievanceId, grievance, callback) => {
        db.query('UPDATE Grievance SET title = ?, description = ?, status = ? WHERE grievance_id = ?',
            [grievance.title, grievance.description, grievance.status, grievanceId],
            callback
        );
    },
    delete: (grievanceId, callback) => {
        db.query('DELETE FROM Grievance WHERE grievance_id = ?', [grievanceId], callback);
    },
    getByCitizenId: (citizenId, callback) => {
        db.query('SELECT * FROM Grievance WHERE citizen_id = ?', [citizenId], callback);
    },
    //... other methods
};

module.exports = Grievance;