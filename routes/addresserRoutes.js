const express = require('express');
const router = express.Router();
const AddresserController = require('../controllers/addresserController');

router.post('/register', AddresserController.register);
router.post('/login', AddresserController.login);
//... other routes

module.exports = router;