const Grievance = require('../models/grievanceModel');
const fs = require('fs').promises;
const path = require('path');
const db =  require("../config/db")
const GrievanceController = {
    create: async (req, res) => {
        try {
            const { title, description } = req.body;
            const citizenId = req.user.citizenId;

            const grievanceId = await Grievance.create({
                citizen_id: citizenId,
                title,
                description,
                status: 'pending',
            });

            if (req.files && req.files.length > 0) {
                const attachments = req.files.map(file => {
                    const newFilename = `${grievanceId}-${file.originalname}`;
                    const newPath = path.join(__dirname, '../public/uploads', newFilename);

                    fs.rename(file.path, newPath);

                    return {
                        grievance_id: grievanceId,
                        file_name: file.originalname,
                        file_path: `/uploads/${newFilename}`, // Store relative path
                    };
                });

                await Grievance.addAttachments(attachments);
            }

            // res.status(201).json({ message: 'Grievance created successfully' });
            res.redirect('/citizen/dashboard');
        } catch (error) {
            console.error("Error creating grievance:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getAll: async (req, res) => {
        try {
            const grievances = await Grievance.getAll(); // Get all grievances from the model
            res.json(grievances);
        } catch (error) {
            console.error("Error getting all grievances:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getByCitizenId: async (req, res) => {
        try {
            const citizenId = req.user.citizenId; // Get citizenId from the decoded token
            const grievances = await Grievance.getByCitizenId(citizenId);
            res.json(grievances);
        } catch (error) {
            console.error("Error getting grievances by citizen ID:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getById: async (req, res) => {
        try {
            const { grievanceId } = req.params;
            const grievance = await Grievance.getById(grievanceId);
            console.log(grievance);
            if (!grievance) {
                return res.status(404).json({ message: 'Grievance not found' });
            }
            res.json(grievance);
        } catch (error) {
            console.error("Error getting grievance by ID:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    update: async (req, res) => {
        try {
            const grievanceId = req.params.grievanceId;
            const citizenId = req.user.citizenId;
            const { title, description } = req.body;
            console.log(req.body);
            
            console.log("Grievance ID from request:", grievanceId);
            console.log("Citizen ID from token:", citizenId);

            const grievance = await Grievance.getById(grievanceId);

            // console.log("Grievance from database:", grievance);

            if (!grievance || grievance.citizen_id !== citizenId) {
                return res.status(403).json({ message: 'Forbidden: Grievance does not belong to you' });
            }

            await Grievance.update(grievanceId, { title, description });

            res.json({ message: 'Grievance updated successfully' });
        } catch (error) {
            console.error("Error updating grievance:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    showUpdateForm: async (req, res) => {
        try {
            const grievanceId = req.params.grievanceId;
            const citizenId = req.user.citizenId;

            const [grievance] = await db.query('SELECT * FROM Grievance WHERE grievance_id = ? AND citizen_id = ?', [grievanceId, citizenId]);

            if (grievance.length === 0) {
                return res.status(403).send('Unauthorized'); // Forbidden if grievance doesn't belong to citizen
            }

            res.render('citizen/update_grievance', { grievance: grievance[0] });
        } catch (error) {
            console.error('Error showing update form:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    updateGrievance: async (req, res) => {
        try {
            const grievanceId = req.params.grievanceId;
            const citizenId = req.user.citizenId;
            const { title, description, status, deleteAttachments } = req.body;
            const attachments = req.files;

            const [grievance] = await db.query('SELECT * FROM Grievance WHERE grievance_id = ? AND citizen_id = ?', [grievanceId, citizenId]);

            if (grievance.length === 0) {
                return res.status(403).send('Unauthorized'); // Forbidden if grievance doesn't belong to citizen
            }

            await db.query('UPDATE Grievance SET title = ?, description = ?, status = ? WHERE grievance_id = ?', [title, description, status, grievanceId]);

            if (deleteAttachments) {
                const deleteIndexes = Array.isArray(deleteAttachments) ? deleteAttachments : [deleteAttachments];
                for (const index of deleteIndexes) {
                    const [attachmentToDelete] = await db.query('SELECT file_path FROM Attachments WHERE grievance_id = ? LIMIT 1 OFFSET ?', [grievanceId, index]);
                    if (attachmentToDelete.length > 0) {
                        const filePath = attachmentToDelete[0].file_path;
                        try {
                            await fs.unlink(path.join(__dirname, 'public', filePath)); // Delete file from server
                            await db.query('DELETE FROM Attachments WHERE file_path = ?', [filePath]); // Delete from database
                        } catch (error) {
                            console.error('Error deleting attachment:', error);
                        }
                    }
                }
            }

            // Handle new attachments
            if (attachments && attachments.length > 0) {
                for (const file of attachments) {
                    const newFilename = `${grievanceId}-${file.originalname}`;
                    const newPath = path.join(__dirname, '../public/uploads', newFilename);

                    // Move the uploaded file to the new path
                    await fs.rename(file.path, newPath);

                    const filePath = `/uploads/${newFilename}`; // Relative to public/uploads
                    await db.query('INSERT INTO Attachments (grievance_id, file_name, file_path) VALUES (?, ?, ?)', [grievanceId, file.originalname, filePath]);
                }
            }

            res.redirect('/citizen/dashboard');
        } catch (error) {
            console.error('Error updating grievance:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    delete: async (req, res) => {
        try {
            const grievanceId = req.params.grievanceId;
            const citizenId = req.user.citizenId;

            const grievance = await Grievance.getById(grievanceId);
            console.log("Grievance ID from request:", grievanceId);
            console.log("Citizen ID from token:", citizenId);

            if (!grievance || grievance.citizen_id !== citizenId) {
                return res.status(403).json({ message: 'Forbidden: Grievance does not belong to you' });
            }

            await Grievance.delete(grievanceId);

            // res.json({ message: 'Grievance deleted successfully' });
            res.redirect('/citizen/dashboard');
        } catch (error) {
            console.error("Error deleting grievance:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },


    updateCommentAndStatus: async (req, res) => {
        try {
            const grievanceId = req.params.grievanceId;
            const { comment, status } = req.body;

            if (!['resolved', 'in_progress'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status value' });
            }

            await Grievance.updateCommentAndStatus(grievanceId, comment, status);

            res.json({ message: 'Grievance updated successfully' });
        } catch (error) {
            console.error("Error updating grievance comment and status:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getGrievancesForUser: async (req, res) => {
        try {
            const citizenId = req.user.citizenId; // Get citizenId from JWT
            const [rows] = await pool.query('SELECT * FROM Grievances WHERE citizen_id = ?', [citizenId]);
            res.json(rows);
        } catch (error) {
            console.error('Error fetching grievances:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

};

module.exports = GrievanceController;