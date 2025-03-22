const Citizen = require('../models/citizenModel');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/generateToken');
const jwt = require("jsonwebtoken");
const jwtSecret = require("../config/jwtSecret");
const db = require('../config/db')
const CitizenController = {
    // In citizenController.js
    register: async (req, res) => {
        try {
            console.log("Register request received:", req.body);
            const { name, email, contact_no, locality, password } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Password hashed");

            const result = await Citizen.create({ name, email, contact_no, locality, password: hashedPassword });
            console.log("Citizen created with result:", result);

            const token = generateToken({ citizenId: result, role: 'citizen' });
            console.log("Token generated:", token);

            res.cookie("token", token);
            res.status(201).json({ message: 'Citizen registered successfully', token: token });

            console.log("Response sent successfully");

        } catch (error) {
            console.error("Error during registration:", error);
            if (error.message && error.message.includes('Duplicate entry')) {
                res.status(400).json({ message: 'Email already in use.' });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    },


    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log(req.body);

            const results = await Citizen.findByEmail(email);

            if (results.length === 0) {
                return res.status(401).json({ error: 'User not found' });
            }

            const user = results[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({ error: 'Incorrect password' });
            }

            const token = jwt.sign(
                {
                    citizenId: user.citizen_id,
                    role: 'citizen',
                },
                jwtSecret.jwtSecret
            );
            res.cookie('token', token);

            // Redirect or send success message
            res.redirect('/citizen/dashboard'); // Redirect to dashboard, after login.
        } catch (error) {
            console.error('Error during login', error);
            res.status(500).json({ error: error.message });
        }
    },
    dashboard: async (req, res) => {
        try {
            const citizenId = req.user.citizenId;
            const [grievances] = await db.query('SELECT * FROM Grievance WHERE citizen_id = ?', [citizenId]);
            res.render('citizen/dashboard', { grievances: grievances, user: req.user });
        } catch (error) {
            console.error('Error fetching grievances:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // ... other controller methods
};

module.exports = CitizenController;