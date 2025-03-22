const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const pool = require('./config/db');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(express.json());

// Configure session middleware
app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET , // Use env var or default
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Configure flash middleware
app.use(flash());

// Make flash messages available in templates
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Import Routes
const citizenRoutes = require('./routes/citizenRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const addresserRoutes = require('./routes/addresserRoutes');

// Routes
app.use('/citizen', citizenRoutes);
app.use('/attachments', attachmentRoutes);
app.use('/addresser', addresserRoutes);
app.use('/grievance', grievanceRoutes);

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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});