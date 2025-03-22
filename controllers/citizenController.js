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

            const [grievances] = await db.query(`
                SELECT 
                    g.*, 
                    a.file_path 
                FROM Grievance g
                LEFT JOIN Attachments a ON g.grievance_id = a.grievance_id
                WHERE g.citizen_id = ?
            `, [citizenId]);

            // Group attachments by grievance_id
            const grievancesWithAttachments = grievances.reduce((acc, grievance) => {
                const existingGrievance = acc.find(g => g.grievance_id === grievance.grievance_id);

                if (existingGrievance) {
                    if (grievance.file_path) {
                        if (!existingGrievance.attachments) {
                            existingGrievance.attachments = [];
                        }
                        existingGrievance.attachments.push(grievance.file_path);
                    }
                } else {
                    const newGrievance = { ...grievance };
                    if (grievance.file_path) {
                        newGrievance.attachments = [grievance.file_path];
                    }
                    acc.push(newGrievance);
                }

                return acc;
            }, []);

            res.render('citizen/dashboard', { grievances: grievancesWithAttachments, user: req.user });
        } catch (error) {
            console.error('Error fetching grievances:', error);
            res.status(500).send('Internal Server Error');
        }
    },



    showUpdateForm: async (req, res) => {
        try {
            const grievanceId = req.params.grievanceId;
            const citizenId = req.user.citizenId;

            const [grievance] = await db.query('SELECT * FROM Grievance WHERE grievance_id = ? AND citizen_id = ?', [grievanceId, citizenId]);

            if (grievance.length === 0) {
                return res.status(403).send('Unauthorized'); // Forbidden if grievance doesn't belong to citizen
            }

            res.render('citizen/update_grievance', { grievance: grievance[0] });
        } catch (error) {
            console.error('Error showing update form:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    updateGrievance: async (req, res) => {
        try {
            const grievanceId = req.params.grievanceId;
            const citizenId = req.user.citizenId;
            const { title, description, status } = req.body;

            const [grievance] = await db.query('SELECT * FROM Grievance WHERE grievance_id = ? AND citizen_id = ?', [grievanceId, citizenId]);

            if (grievance.length === 0) {
                return res.status(403).send('Unauthorized'); // Forbidden if grievance doesn't belong to citizen
            }

            await db.query('UPDATE Grievance SET title = ?, description = ?, status = ? WHERE grievance_id = ?', [title, description, status, grievanceId]);

            res.redirect('/citizen/dashboard');
        } catch (error) {
            console.error('Error updating grievance:', error);
            res.status(500).send('Internal Server Error');
        }
    },


    // ... other controller methods
};

module.exports = CitizenController;