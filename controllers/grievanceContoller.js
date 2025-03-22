const Grievance = require('../models/grievanceModel');
const fs = require('fs');
const path = require('path');

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

                    fs.renameSync(file.path, newPath);

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