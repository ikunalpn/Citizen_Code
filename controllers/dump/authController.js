// controllers/authController.js
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {generateToken} = require("../utils/generateToken")
const productModel = require('../models/productModel');

const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const userId = await userModel.create(fullName, email, hashedPassword);

        // Generate JWT
        let token = generateToken(userId);
        res.cookie("token", token);


        // res.status(201).json({ message: 'User registered successfully', token: token });
        const products = await productModel.getAll();
        res.render('shop', { products: products });
    } catch (error) {
        if (error.message === 'Email already in use.') {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await userModel.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.Password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.UserID, email: user.Email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // res.status(200).json({ message: 'Login successful', token: token });
        const products = await productModel.getAll();
        res.render('shop', { products: products });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logoutUser = function (req, res) {
    res.cookie("token", "");
    res.redirect("/")
}
module.exports = {
    registerUser,
    loginUser,
    logoutUser
};