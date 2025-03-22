const express = require('express');
const router = express.Router();
const AddresserController = require('../controllers/addresserController');
const GrievanceController = require('../controllers/grievanceContoller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', AddresserController.register);
router.post('/login', AddresserController.login);
router.get('/logout', AddresserController.logout); // Add logout route
router.get('/dashboard', authMiddleware('addresser'), AddresserController.dashboard); // Add this line
router.put('/addresser/:grievanceId/update', authMiddleware(['addresser']), GrievanceController.updateCommentAndStatus);
router.post('/update-status/:grievanceId', authMiddleware('addresser'), AddresserController.updateStatus); 

//... other routes

module.exports = router;