const Citizen = require('../models/citizenModel');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/generateToken');
const jwt = require("jsonwebtoken");
const jwtSecret = require("../config/jwtSecret")
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
            const results = await Citizen.findByEmail(email);

            if (results.length === 0) {
                return res.status(401).json({ error: 'User not found' });
            }

            const user = results[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({ error: 'Incorrect password' });
            }

            // const token = generateToken({ citizenId: user.citizenId, role: 'citizen' });
            const token = jwt.sign(
                {
                    citizenId: user.citizen_id, // Add citizenId
                    role: 'citizen' // Add role
                },
                jwtSecret.jwtSecret
            );
            res.cookie("token", token);
            res.json({ token });

        } catch (error) {
            console.error("Error during login", error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // ... other controller methods
};

module.exports = CitizenController;