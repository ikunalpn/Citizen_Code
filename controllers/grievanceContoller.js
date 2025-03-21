const Grievance = require('../models/grievanceModel');

const GrievanceController = {
    create: async (req, res) => {
        try {
            console.log("Grievance create request received:", req.body);
            const { title, description } = req.body;
            const citizen_id = req.user.citizenId; // Get citizen ID from req.user (middleware)

            const grievanceId = await Grievance.create({ citizen_id, title, description });
            console.log("Grievance created with ID:", grievanceId);

            res.status(201).json({ message: 'Grievance created successfully', grievanceId: grievanceId });
            console.log("Grievance response sent successfully");

        } catch (error) {
            console.error("Error during grievance creation:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getAll: async (req, res) => {
        try {
            const grievances = await Grievance.getAll();
            res.json(grievances);
        } catch (error) {
            console.error("Error getting all grievances:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getByCitizenId: async (req, res) => {
        try {
            const citizenId = req.user.citizenId;
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
            const { grievanceId } = req.params;
            const updatedGrievance = await Grievance.update(grievanceId, req.body);
            if (!updatedGrievance) {
                return res.status(404).json({ message: 'Grievance not found' });
            }
            res.json({ message: 'Grievance updated successfully', grievance: updatedGrievance });
        } catch (error) {
            console.error("Error updating grievance:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    delete: async (req, res) => {
        try {
            const { grievanceId } = req.params;
            const deletedGrievance = await Grievance.delete(grievanceId);
            if (!deletedGrievance) {
                return res.status(404).json({ message: 'Grievance not found' });
            }
            res.json({ message: 'Grievance deleted successfully' });
        } catch (error) {
            console.error("Error deleting grievance:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = GrievanceController;