// app.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const pool = require('./config/db'); // Assuming you've set up your database connection in db.js
const expressSession = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Import cors

dotenv.config();

// Import Routes
const citizenRoutes = require('./routes/citizenRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const addresserRoutes = require('./routes/addresserRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET, // Make sure to set this in your .env file
    })
);
app.use(flash());
app.use(express.static(path.join(__dirname, 'public'))); // For serving static files

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/citizen', citizenRoutes);
app.use('/grievance', grievanceRoutes);
app.use('/attachments', attachmentRoutes);
app.use('/addresser', addresserRoutes);

// Test the database connection
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


app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Username: ${username}, Password: ${password}`);

    // Add your authentication logic here

    res.send('Login successful!'); // Replace with actual logic
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});