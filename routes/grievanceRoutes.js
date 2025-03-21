const express = require('express');
const router = express.Router();
const GrievanceController = require('../controllers/grievanceContoller');
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming this checks roles

// Citizen Routes
router.post('/citizen/create', authMiddleware(['citizen']), GrievanceController.create);
router.get('/citizen/all', authMiddleware, GrievanceController.getByCitizenId);
router.get('/citizen/:grievanceId', authMiddleware, GrievanceController.getById);
router.put('/citizen/:grievanceId', authMiddleware, GrievanceController.update);
router.delete('/citizen/:grievanceId', authMiddleware, GrievanceController.delete);

// Addresser Routes
router.get('/addresser/all', authMiddleware, GrievanceController.getAll); // Get all grievances for admin
router.get('/addresser/:grievanceId', authMiddleware, GrievanceController.getById);
router.put('/addresser/:grievanceId', authMiddleware, GrievanceController.update); // For admin to update status
router.delete('/addresser/:grievanceId', authMiddleware, GrievanceController.delete);

module.exports = router;