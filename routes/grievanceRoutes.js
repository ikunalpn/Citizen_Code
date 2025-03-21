const express = require('express');
const router = express.Router();
const GrievanceController = require('../controllers/grievanceContoller');
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming this checks roles

// Citizen Routes
router.post('/citizen/create', authMiddleware(['citizen']), GrievanceController.create);
router.get('/citizen/all', authMiddleware(['citizen']), GrievanceController.getByCitizenId);
router.get('/citizen/:grievanceId', authMiddleware(['citizen']), GrievanceController.getById);
router.put('/citizen/:grievanceId', authMiddleware(['citizen']), GrievanceController.update);
router.delete('/citizen/:grievanceId', authMiddleware(['citizen']), GrievanceController.delete);

// Addresser Routes
router.get('/addresser/all', authMiddleware(['addresser']), GrievanceController.getAll); // Get all grievances for admin
router.get('/addresser/:grievanceId', authMiddleware(['addresser']), GrievanceController.getById);
router.put('/addresser/:grievanceId', authMiddleware(['addresser']), GrievanceController.update); // For admin to update status
router.delete('/addresser/:grievanceId', authMiddleware(['addresser']), GrievanceController.delete);

module.exports = router;