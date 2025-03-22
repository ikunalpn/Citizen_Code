const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
const Grievance = require('./models/grievanceModel');
const authMiddleware = require('./middlewares/authMiddleware');
const GrievanceController = require('./controllers/grievanceContoller');
const CitizenController = require('./controllers/citizenController');
const multer = require('multer');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Extract extension
        cb(null, Date.now() + '-' + path.basename(file.originalname, ext) + ext); // Preserve extension
    },
});

const upload = multer({ dest: path.join(__dirname, 'public/uploads/') });
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());

// Import Routes
const citizenRoutes = require('./routes/citizenRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const addresserRoutes = require('./routes/addresserRoutes');


// Routes
app.use('/citizen', citizenRoutes);
app.use('/grievance', grievanceRoutes);
app.use('/attachments', attachmentRoutes);
app.use('/addresser', addresserRoutes);
app.use(express.json())

// Citizen Login Routes
app.get('/citizen/login', (req, res) => {
    res.render('citizen/login');
});
app.get('/citizen/dashboard', authMiddleware(), CitizenController.dashboard);
app.get('/citizen/delete-grievance/:grievanceId', authMiddleware(), GrievanceController.delete);
app.get('/citizen/updateGrievance/:grievanceId', authMiddleware(), GrievanceController.showUpdateForm);

app.post('/citizen/login', CitizenController.login);
app.post('/citizen/updateGrievance/:grievanceId', authMiddleware(),upload.array('attachments'), GrievanceController.updateGrievance);

// Addresser Login Routes
app.get('/addresser/login', (req, res) => {
    res.render('addresser/login');
});



app.get('/citizen/create-grievance', authMiddleware(['citizen']), (req, res) => {
    res.render('citizen/create_grievance');
});
// app.post('/grievances/create', authMiddleware(), GrievanceController.create);

app.post('/citizen/create-grievance', authMiddleware(['citizen']), upload.array('attachments', 5), GrievanceController.create);

// app.get('/citizen/update-grievance/:grievanceId', authMiddleware(['citizen']), async (req, res) => {
//     try {
//         const grievanceId = req.params.grievanceId;
//         const citizenId = req.user.citizenId;
//         const grievance = await Grievance.getById(grievanceId);
//         if (!grievance || grievance.citizen_id !== citizenId) {
//             return res.status(403).send('Forbidden');
//         }
//         res.render('citizen/update-grievance', { grievance: grievance });
//     } catch (error) {
//         console.error('Error fetching grievance for update:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// app.post('/citizen/update-grievance/:grievanceId', authMiddleware(['citizen']), async (req, res) => {
//     try {
//         const grievanceId = req.params.grievanceId;
//         const citizenId = req.user.citizenId;
//         const { title, description } = req.body;
//         const grievance = await Grievance.getById(grievanceId);
//         if (!grievance || grievance.citizen_id !== citizenId) {
//             return res.status(403).send('Forbidden');
//         }
//         await Grievance.update(grievanceId, { title, description });
//         res.redirect('/citizen/dashboard');
//     } catch (error) {
//         console.error('Error updating grievance:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.get('/citizen/delete-grievance/:grievanceId', authMiddleware(['citizen']), async (req, res) => {
    try {
        const grievanceId = req.params.grievanceId;
        const citizenId = req.user.citizenId;
        const grievance = await Grievance.getById(grievanceId);
        if (!grievance || grievance.citizen_id !== citizenId) {
            return res.status(403).send('Forbidden');
        }
        await Grievance.delete(grievanceId);
        res.redirect('/citizen/dashboard');
    } catch (error) {
        console.error('Error deleting grievance:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Addresser Routes
app.get('/addresser/dashboard', authMiddleware(['addresser']), async (req, res) => {
    try {
        const grievances = await Grievance.getAll();
        res.render('addresser/dashboard', { grievances: grievances });
    } catch (error) {
        console.error('Error fetching grievances:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/addresser/update-grievance/:grievanceId', authMiddleware(['addresser']), async (req, res) => {
    try {
        const grievanceId = req.params.grievanceId;
        const grievance = await Grievance.getById(grievanceId);
        res.render('addresser/update-grievance', { grievance: grievance });
    } catch (error) {
        console.error('Error fetching grievance for update:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/addresser/update-grievance/:grievanceId', authMiddleware(['addresser']), async (req, res) => {
    try {
        const grievanceId = req.params.grievanceId;
        const { status, comment } = req.body;
        await Grievance.updateCommentAndStatus(grievanceId, comment, status);
        res.redirect('/addresser/dashboard');
    } catch (error) {
        console.error('Error updating grievance:', error);
        res.status(500).send('Internal Server Error');
    }
});
async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}
testDbConnection();

// Start Server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});