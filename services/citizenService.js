// services/citizenService.js
const Citizen = require('../models/citizenModel');
const bcrypt = require('bcrypt'); // For password hashing

const CitizenService = {
    register: (citizen, callback) => {
        bcrypt.hash(citizen.password, 10, (err, hash) => {
            if (err) return callback(err);
            citizen.password = hash;
            Citizen.create(citizen, callback);
        });
    },
    login: (email, password, callback) => {
        Citizen.findByEmail(email, (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback({ message: 'User not found' });

            const user = results[0];
            bcrypt.compare(password, user.password, (bcryptErr, match) => {
                if (bcryptErr) return callback(bcryptErr);
                if (!match) return callback({ message: 'Incorrect password' });
                callback(null, user);
            });
        });
    },
    // ... other service methods
};

module.exports = CitizenService;