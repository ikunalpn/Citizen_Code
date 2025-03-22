// routes/citizenRoutes.js
const express = require('express');
const router = express.Router();
const CitizenController = require('../controllers/citizenController');
const GrievanceController = require('../controllers/grievanceContoller');
const authMiddleware = require("../middlewares/authMiddleware")

router.get('/create', authMiddleware('citizen'), CitizenController.createGrievanceForm); // Update route
router.post('/create', authMiddleware('citizen'), GrievanceController.create); // Update route

router.post('/register', CitizenController.register);
router.post('/login', CitizenController.login);
router.get('/logout', CitizenController.logout);
// ... other routes

module.exports = router;