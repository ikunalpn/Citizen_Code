const Addresser = require('../models/addresserModel');
const jwt = require('jsonwebtoken');
const config = require('../config/db');
const bcrypt = require('bcrypt');
const {generateToken} = require('../utils/generateToken');

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

            const token = generateToken({ addresserId: addresser.addresser_id, role: 'addresser' });
            res.json({ token });

        } catch (error) {
            console.error("Error during addresser login", error);
            res.status(500).json({ error: error.message });
        }
    },
    //... other methods
};

module.exports = AddresserController;