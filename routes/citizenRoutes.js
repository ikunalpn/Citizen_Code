// routes/citizenRoutes.js
const express = require('express');
const router = express.Router();
const CitizenController = require('../controllers/citizenController');

router.post('/register', CitizenController.register);
router.post('/login', CitizenController.login);
// ... other routes

module.exports = router;