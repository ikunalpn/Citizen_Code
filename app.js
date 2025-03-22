const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const pool = require('./config/db');
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