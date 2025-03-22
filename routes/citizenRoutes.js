// routes/citizenRoutes.js
const express = require('express');
const router = express.Router();
const CitizenController = require('../controllers/citizenController');
const GrievanceController = require('../controllers/grievanceContoller');
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, 'public/uploads/') });


router.get('/register', CitizenController.registerForm); // Display registration form
router.get('/login', (req, res) => {
    res.render('citizen/login');
});
router.get('/logout', CitizenController.logout);
router.get('/dashboard', authMiddleware(), CitizenController.dashboard);
router.get('/create', authMiddleware('citizen'), CitizenController.createGrievanceForm); // Update route
router.get('/delete-grievance/:grievanceId', authMiddleware(), GrievanceController.delete);
router.get('/updateGrievance/:grievanceId', authMiddleware(), GrievanceController.showUpdateForm);



router.post('/register', CitizenController.register); // Process registration
router.post('/login', CitizenController.login);
router.post('/create', authMiddleware('citizen'), GrievanceController.create); // Update route
router.post('/updateGrievance/:grievanceId', authMiddleware(), upload.array('attachments'), GrievanceController.updateGrievance);



module.exports = router;