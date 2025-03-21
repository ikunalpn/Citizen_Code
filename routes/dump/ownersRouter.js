const express = require("express");
const router = express.Router();
const ownerModel = require('../models/ownerModel');
const bcrypt = require('bcrypt');

router.get("/admin", function (req, res) {
    let success = req.flash("success")
    res.render("createproducts",{success})
})

router.post("/create", async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const { fullName, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const ownerId = await ownerModel.create(fullName, email, hashedPassword);

        res.status(201).json({ message: 'Owner created successfully', ownerId: ownerId });
    } catch (error) {
        if (error.message === 'Email already in use.') {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error creating owner:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
})

module.exports = router;