const Addresser = require('../models/addresserModel');
const jwt = require('jsonwebtoken');
const config = require('../config/db');
const bcrypt = require('bcrypt');
const {generateToken} = require('../utils/generateToken');
const jwtSecret = require("../config/jwtSecret");
const db = require("../config/db")
const Grievance = require('./grievanceContoller');
const AddresserController = {
    register: async (req, res) => {
        try {
            console.log("Addresser register request received:", req.body);
            const { name, email, contact_no, password } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Password hashed");

            const addresserId = await Addresser.create({ name, email, contact_no, password: hashedPassword });
            console.log("Addresser created with ID:", addresserId);

            const token = generateToken({ addresserId: addresserId, role: 'addresser' });
            console.log("Token generated:", token);

            res.cookie("token", token);
            res.status(201).json({ message: 'Addresser registered successfully', token: token });

            console.log("Response sent successfully");

        } catch (error) {
            console.error("Error during addresser registration:", error);
            if (error.message === 'Email already in use.') {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const results = await Addresser.findByEmail(email);

            if (results.length === 0) {
                return res.status(401).json({ error: 'Addresser not found' });
            }

            const addresser = results[0];
            const match = await bcrypt.compare(password, addresser.password);

            if (!match) {
                return res.status(401).json({ error: 'Incorrect password' });
            }

            const token = jwt.sign(
                {
                    addresserId: addresser.addresser_id, // Add addresserId
                    role: 'addresser' // Add role
                },
                jwtSecret.jwtSecret // Optional: Set expiration time
            );
            res.cookie("token", token);
            // res.json({ token });
            res.redirect('/addresser/dashboard');

        } catch (error) {
            console.error("Error during addresser login", error);
            res.status(500).json({ error: error.message });
        }
    },


    dashboard: async (req, res) => {
        try {
            const addresserName = req.user.name;

            // Fetch grievances with citizen and attachment details
            const [grievances] = await db.query(`
                SELECT 
                    g.*, 
                    c.name AS citizen_name,
                    c.email AS citizen_email,
                    c.contact_no AS citizen_contact_no,
                    c.locality AS citizen_locality,
                    a.file_path
                FROM Grievance g
                LEFT JOIN Citizen c ON g.citizen_id = c.citizen_id
                LEFT JOIN Attachments a ON g.grievance_id = a.grievance_id
            `);

            // Process grievances with attachments and comments
            const grievancesWithDetails = await Promise.all(grievances.reduce((acc, grievance) => {
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
            }, []).map(async grievance => {
                // Fetch comments for each grievance
                const [comments] = await db.query('SELECT * FROM Comments WHERE grievance_id = ?', [grievance.grievance_id]);
                return { ...grievance, comments };
            }));

            res.render('addresser/dashboard', { grievances: grievancesWithDetails, addresserName });
        } catch (error) {
            console.error('Error fetching grievances:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    updateStatus: async (req, res) => {
        try {
            const grievanceId = req.params.grievanceId;
            const { status, comment } = req.body;
            const addresserId = req.user.addresserId; // Assuming you've stored addresserId in req.user

            await Grievance.updateCommentAndStatus(grievanceId, comment, status, addresserId);

            res.redirect('/addresser/dashboard');
        } catch (error) {
            console.error('Error updating grievance status:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    logout: (req, res) => {
        // Clear the token cookie
        res.clearCookie('token'); // Adjust cookie name if needed

        res.redirect('/addresser/login'); // Redirect to login page
    },
    
    //... other methods
};

module.exports = AddresserController;